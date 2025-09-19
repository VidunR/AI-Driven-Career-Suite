import os
import re
import io
import json
import datetime
from typing import List, Dict, Optional, Tuple

import pdfplumber
import requests
import pycountry
from geotext import GeoText
from rapidfuzz import fuzz, process

import spacy
from keybert import KeyBERT

# --- optional imports for fallbacks
_EASYOCR_AVAILABLE = True
_EASYOCR_IMPORT_ERR = None
try:
    import easyocr
except Exception as e:
    _EASYOCR_AVAILABLE = False
    _EASYOCR_IMPORT_ERR = str(e)

_PYMUPDF_AVAILABLE = True
_PYMUPDF_IMPORT_ERR = None
try:
    import fitz  # PyMuPDF
except Exception as e:
    _PYMUPDF_AVAILABLE = False
    _PYMUPDF_IMPORT_ERR = str(e)

_DOCX_AVAILABLE = True
_DOCX_IMPORT_ERR = None
try:
    import docx  # python-docx
except Exception as e:
    _DOCX_AVAILABLE = False
    _DOCX_IMPORT_ERR = str(e)

_WIN32_AVAILABLE = True
try:
    import win32com.client  # only works on Windows with MS Word installed
except Exception:
    _WIN32_AVAILABLE = False

# =========================
# CONFIG
# =========================
APIJOBS_URL = "https://api.apijobs.dev/v1/job/search"
APIJOBS_KEY = "ec5d23a2be3de56a9e4b8a2f5f5e2a6b96ccd6639af734e777837bac8c07793c"  # move to env var in prod

CV_PATH = "CV2.pdf"

# Title extraction
TITLE_SCAN_RATIO = 0.25
MIN_TITLE_LEN = 6
FUZZY_TITLE_CUTOFF = 80

# Filters (optional; applied after fetching)
EXPERIENCE_YEARS_CUSHION = 1.0
TITLE_FILTER_CUTOFF = 78

# If no country can be inferred, omit "country" (global search)
DEFAULT_COUNTRY = ""

# Country aliases (US/UK/etc.)
COUNTRY_ALIASES = {
    "us": "United States", "usa": "United States", "u.s.": "United States", "u.s.a": "United States",
    "united states of america": "United States",
    "uk": "United Kingdom", "u.k.": "United Kingdom", "england": "United Kingdom",
    "scotland": "United Kingdom", "wales": "United Kingdom", "northern ireland": "United Kingdom",
    "uae": "United Arab Emirates",
    "sl": "Sri Lanka", "lka": "Sri Lanka",
    "south korea": "Korea, Republic of",
    "north korea": "Korea, Democratic People's Republic of",
}

# City -> Country seeds (extend over time)
CITY_TO_COUNTRY = {
    # Sri Lanka
    "colombo": "Sri Lanka", "galle": "Sri Lanka", "kandy": "Sri Lanka", "jaffna": "Sri Lanka",
    "negombo": "Sri Lanka", "matara": "Sri Lanka", "kurunegala": "Sri Lanka", "gampaha": "Sri Lanka",
    # UK
    "london": "United Kingdom", "manchester": "United Kingdom", "birmingham": "United Kingdom",
    # USA
    "new york": "United States", "los angeles": "United States", "san francisco": "United States", "seattle": "United States",
    # UAE
    "dubai": "United Arab Emirates", "abu dhabi": "United Arab Emirates",
    # Canada
    "toronto": "Canada", "vancouver": "Canada",
    # Australia
    "sydney": "Australia", "melbourne": "Australia",
    # Singapore
    "singapore": "Singapore",
    # Germany
    "berlin": "Germany", "munich": "Germany",
    # France
    "paris": "France",
    # India
    "mumbai": "India", "bangalore": "India", "bengaluru": "India", "delhi": "India",
}

# Role synonyms / canonical labels
ROLE_SYNONYMS: Dict[str, List[str]] = {
    "Software Engineer": [
        "software engineer","software developer","programmer","developer",
        "software dev","sw engineer","se","swe","sde","sd1","sd2",
        "senior software engineer","full stack developer","backend developer","frontend developer"
    ],
    "Cybersecurity Specialist": [
        "cybersecurity specialist","cyber security specialist","security engineer",
        "information security analyst","infosec analyst","soc analyst","security analyst",
        "application security engineer","appsec","security operations"
    ],
    "Accountant": [
        "accountant","accounts executive","senior accountant","staff accountant",
        "financial accountant","general ledger accountant","gl accountant"
    ],
    "Project Manager": [
        "project manager","pm","technical project manager","it project manager",
        "program manager","delivery manager","scrum master"
    ],
    "Digital Marketer": [
        "digital marketer","digital marketing specialist","performance marketer",
        "seo specialist","sem specialist","social media marketer","growth marketer",
        "ppc specialist"
    ],
}

TITLE_HEADS = [
    "engineer", "developer", "scientist", "manager", "analyst", "architect",
    "consultant", "specialist", "lead", "intern", "administrator", "designer",
    "tester", "qa", "devops", "sre", "product manager", "project manager",
    "data engineer", "data scientist", "ml engineer", "ai engineer",
    "accountant", "marketer", "marketing", "cybersecurity", "security"
]

# For KeyBERT sorting: common tech/business hints
SOFT_ALLOWLIST_HINTS = [
    "python","java","javascript","typescript","react","node","node.js","nodejs",
    "aws","gcp","azure","docker","kubernetes","sql","postgres","mysql","mongodb",
    "pandas","numpy","tensorflow","pytorch","scikit","nlp","llm","langchain",
    "spark","hadoop","airflow","terraform","ansible","linux","rest","graphql",
    "spring","django","flask","fastapi",".net","c#","c++","go","golang","php",
    "html","css","redis","rabbitmq","kafka","elasticsearch",
    "accounting","payroll","quickbooks","tax","audit","seo","sem","google ads","meta ads"
]

# =========================
# Helpers (keep your PDF logic as-is)
# =========================
def pdf_to_text(pdf_file: str) -> str:
    all_text = ""
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            all_text += text + "\n"
    return clean_whitespace(all_text)

def clean_whitespace(t: str) -> str:
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{2,}", "\n", t)
    return t.strip()

# --- NEW: OCR/PDF image fallback (no Tesseract/Poppler)
def ocr_pdf_with_easyocr(path: str) -> Tuple[str, Dict]:
    """
    Rasterize each page with PyMuPDF and OCR via EasyOCR.
    Returns (text, debug_dict)
    """
    debug = {"engine": "easyocr+pymupdf", "pages": [], "errors": []}
    if not _PYMUPDF_AVAILABLE:
        debug["errors"].append(f"PyMuPDF not available: {_PYMUPDF_IMPORT_ERR}")
        return "", debug
    if not _EASYOCR_AVAILABLE:
        debug["errors"].append(f"EasyOCR not available: {_EASYOCR_IMPORT_ERR}")
        return "", debug

    try:
        reader = easyocr.Reader(["en"], gpu=False)
    except Exception as e:
        debug["errors"].append(f"EasyOCR init error: {e}")
        return "", debug

    text_chunks = []
    try:
        doc = fitz.open(path)
        for pi in range(len(doc)):
            page = doc[pi]
            # render at decent DPI for OCR
            zoom = 2.0  # ~ 144 DPI (72 * 2)
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_bytes = pix.tobytes("png")
            try:
                result = reader.readtext(img_bytes, detail=0, paragraph=True)
                pg_text = "\n".join(result).strip()
                text_chunks.append(pg_text)
                debug["pages"].append({"page": pi+1, "chars": len(pg_text)})
            except Exception as e:
                debug["errors"].append(f"OCR page {pi+1} error: {e}")
        doc.close()
    except Exception as e:
        debug["errors"].append(f"PyMuPDF open/render error: {e}")
        return "", debug

    return clean_whitespace("\n".join(text_chunks)), debug

# --- NEW: DOCX
def docx_to_text(path: str) -> Tuple[str, Dict]:
    dbg = {"engine": "python-docx", "paras": 0}
    if not _DOCX_AVAILABLE:
        return "", {"engine": "python-docx", "error": _DOCX_IMPORT_ERR}
    try:
        d = docx.Document(path)
        parts = []
        for p in d.paragraphs:
            if p.text and p.text.strip():
                parts.append(p.text.strip())
        dbg["paras"] = len(parts)
        return clean_whitespace("\n".join(parts)), dbg
    except Exception as e:
        return "", {"engine": "python-docx", "error": str(e)}

# --- NEW: DOC (Windows COM fallback)
def doc_to_text_via_word(path: str) -> Tuple[str, Dict]:
    dbg = {"engine": "win32com+Word", "converted": False}
    if not _WIN32_AVAILABLE:
        return "", {"engine": "win32com+Word", "error": "win32com not available or not Windows/MS Word not installed"}

    # Convert .doc to .docx using Word, then parse with python-docx
    try:
        import tempfile
        base = os.path.splitext(os.path.basename(path))[0]
        tmp_docx = os.path.join(tempfile.gettempdir(), f"{base}__conv.docx")

        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(path)
        doc.SaveAs(tmp_docx, FileFormat=16)  # 16 = wdFormatXMLDocument (.docx)
        doc.Close(False)
        word.Quit()

        dbg["converted"] = True
        txt, dbg_docx = docx_to_text(tmp_docx)
        dbg.update(dbg_docx)
        try:
            os.remove(tmp_docx)
        except Exception:
            pass
        return txt, dbg
    except Exception as e:
        dbg["error"] = f"Word automation failed: {e}"
        return "", dbg

# --- NEW: central router that preserves your current PDF flow
def extract_text_any(path: str) -> Tuple[str, Dict]:
    """
    Returns (text, debug_info). Keeps your pdfplumber flow first.
    - PDF: pdfplumber -> if too little text, OCR with EasyOCR+PyMuPDF.
    - DOCX: python-docx
    - DOC: Word COM (Windows) -> docx -> python-docx
    """
    ext = os.path.splitext(path)[1].lower()
    debug = {"file": path, "ext": ext, "steps": []}

    if ext == ".pdf":
        # Your original logic
        t_pdf = pdf_to_text(path)
        debug["steps"].append({"step": "pdfplumber", "chars": len(t_pdf)})
        if len(t_pdf) >= 50:  # heuristic threshold
            return t_pdf, debug

        # OCR fallback for image-based PDFs
        t_ocr, dbg_ocr = ocr_pdf_with_easyocr(path)
        debug["steps"].append({"step": "ocr_fallback", **dbg_ocr, "chars": len(t_ocr)})
        return t_ocr, debug

    elif ext == ".docx":
        t, dbg = docx_to_text(path)
        debug["steps"].append({"step": "docx", **dbg, "chars": len(t)})
        return t, debug

    elif ext == ".doc":
        t, dbg = doc_to_text_via_word(path)
        debug["steps"].append({"step": "doc", **dbg, "chars": len(t)})
        return t, debug

    else:
        return "", {"file": path, "ext": ext, "error": "Unsupported file type. Use .pdf, .docx, or .doc"}

# =========================
# spaCy & KeyBERT
# =========================
def load_spacy():
    try:
        return spacy.load("en_core_web_sm")
    except OSError as e:
        raise RuntimeError("spaCy model 'en_core_web_sm' is not installed. "
                           "Run: python -m spacy download en_core_web_sm") from e

def load_keybert():
    return KeyBERT(model="all-MiniLM-L6-v2")

def spacy_gpe_locations(nlp, text: str) -> List[str]:
    doc = nlp(text)
    vals = []
    for ent in doc.ents:
        if ent.label_ in ("GPE", "LOC"):
            vals.append(ent.text.strip())
    seen, out = set(), []
    for v in vals:
        lv = v.lower()
        if lv not in seen:
            seen.add(lv)
            out.append(v)
    return out

def keybert_keywords(kb: KeyBERT, text: str, top_n: int = 20) -> List[str]:
    try:
        pairs = kb.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 3),
            stop_words="english",
            use_mmr=True,
            diversity=0.6,
            top_n=top_n
        )
        kws = []
        for k, _ in pairs:
            k = re.sub(r"[^A-Za-z0-9\.\+#/ ]", "", k).strip().lower()
            if 2 <= len(k) <= 40:
                kws.append(k)
        return sorted(set(kws), key=lambda x: any(h in x for h in SOFT_ALLOWLIST_HINTS), reverse=True)
    except Exception:
        return []

# =========================
# Country/City extraction (GeoText + spaCy)
# =========================
def normalize_country(name: Optional[str]) -> Optional[str]:
    if not name:
        return None
    norm = re.sub(r"[^\w\s\.]", "", name).strip().lower()
    if norm in COUNTRY_ALIASES:
        return COUNTRY_ALIASES[norm]
    try:
        m = pycountry.countries.lookup(name)
        return m.name
    except LookupError:
        return name.strip().title()

def resolve_city_to_country(city: str) -> Optional[str]:
    if not city:
        return None
    key = city.strip().lower()
    if key in CITY_TO_COUNTRY:
        return CITY_TO_COUNTRY[key]
    best_key, best_score, _ = process.extractOne(
        key, list(CITY_TO_COUNTRY.keys()), scorer=fuzz.token_set_ratio
    )
    if best_score >= 90:
        return CITY_TO_COUNTRY[best_key]
    return None

def extract_country_city(text: str, nlp) -> Tuple[Optional[str], Optional[str], str]:
    places = GeoText(text)
    spacy_places = spacy_gpe_locations(nlp, text)

    # 1) Country directly
    candidates_country = list(places.countries)
    for token in spacy_places:
        try:
            _ = pycountry.countries.lookup(token)
            candidates_country.append(token)
        except Exception:
            pass
    if candidates_country:
        for c in candidates_country:
            nc = normalize_country(c)
            if nc:
                return nc, None, "country"

    # 2) Aliases
    low = text.lower()
    for alias, canon in COUNTRY_ALIASES.items():
        if re.search(rf"\b{re.escape(alias)}\b", low):
            return canon, None, "country"

    # 3) Full names
    for c in pycountry.countries:
        nm = c.name.lower()
        if re.search(rf"\b{re.escape(nm)}\b", low):
            return c.name, None, "country"

    # 4) City -> Country
    city_pool = list(places.cities)
    for token in spacy_places:
        if token.lower() not in [c.lower() for c in city_pool]:
            city_pool.append(token)

    if city_pool:
        for city in city_pool:
            guess = resolve_city_to_country(city)
            if guess:
                return guess, city, "city->country"
        return None, city_pool[0], "city_only"

    return None, None, "fallback"

# =========================
# Role extraction + synonyms
# =========================
TITLE_PATTERNS = [
    r"(senior|staff|principal|lead|junior)?\s*(data|software|ml|ai|devops|site reliability|full\s*stack|front\s*end|back\s*end|product|project|security|cybersecurity|digital|marketing)?\s*(engineer|developer|scientist|manager|architect|analyst|designer|marketer|accountant)"
]

def likely_title_lines(text: str) -> List[str]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    cutoff = max(3, int(len(lines) * TITLE_SCAN_RATIO))
    return lines[:cutoff]

def extract_job_title(text: str) -> str:
    for ln in likely_title_lines(text):
        ln_low = ln.lower()
        if len(ln_low) < MIN_TITLE_LEN:
            continue
        for pat in TITLE_PATTERNS:
            m = re.search(pat, ln_low, flags=re.IGNORECASE)
            if m:
                return normalize_title(m.group(0))
    for ln in likely_title_lines(text):
        if len(ln) < MIN_TITLE_LEN:
            continue
        match, score, _ = process.extractOne(ln.lower(), TITLE_HEADS, scorer=fuzz.partial_ratio)
        if score >= FUZZY_TITLE_CUTOFF:
            return normalize_title(ln)
    tokens = re.findall(r"[A-Za-z][A-Za-z\.\+#/]*", text[:2000])
    joined = " ".join(tokens)
    m = re.search(r"([A-Z][a-zA-Z\+/#]{2,}\s+){0,3}(Engineer|Developer|Scientist|Manager|Architect|Analyst|Marketer|Accountant)\b", joined)
    if m:
        return normalize_title(m.group(0))
    return ""

def normalize_title(title: str) -> str:
    title = re.sub(r"\s+", " ", title).strip(" .,-")
    words = [w if (w.isupper() and len(w) <= 4) else w.capitalize() for w in title.split()]
    return " ".join(words)

def canonicalize_role(raw_title: str) -> str:
    if not raw_title:
        return ""
    cand = raw_title.lower()
    best_label, best_score = "", 0
    for label, syns in ROLE_SYNONYMS.items():
        for s in syns + [label]:
            score = fuzz.partial_ratio(cand, s)
            if score > best_score:
                best_label, best_score = label, score
    return best_label if best_score >= 80 else normalize_title(raw_title)

def role_synonyms_for(label_or_title: str) -> List[str]:
    if not label_or_title:
        return []
    if label_or_title in ROLE_SYNONYMS:
        return list(set([label_or_title] + ROLE_SYNONYMS[label_or_title]))
    best_label = canonicalize_role(label_or_title)
    if best_label in ROLE_SYNONYMS:
        return list(set([best_label] + ROLE_SYNONYMS[best_label]))
    return [best_label] if best_label else []

# =========================
# Experience extraction
# =========================
MONTHS = {
    "jan":1,"january":1,"feb":2,"february":2,"mar":3,"march":3,"apr":4,"april":4,"may":5,"jun":6,"june":6,
    "jul":7,"july":7,"aug":8,"august":8,"sep":9,"sept":9,"september":9,"oct":10,"october":10,"nov":11,
    "november":11,"dec":12,"december":12
}
YEAR_RANGE_RE = re.compile(r"\b(19\d{2}|20\d{2})\s*[-–to]{1,3}\s*(Present|present|Current|current|19\d{2}|20\d{2})\b")
MTH_YR_RANGE_RE = re.compile(
    r"\b(?P<m1>[A-Za-z]{3,9})\s+(?P<y1>19\d{2}|20\d{2})\s*[-–to]{1,3}\s*(?P<m2>[A-Za-z]{3,9}|Present|present|Current|current)\s*(?P<y2>19\d{2}|20\d{2})?\b"
)
EXPLICIT_YEARS_RE = re.compile(r"\b(\d{1,2})\s*\+?\s*(years?|yrs?)\s+(of\s+)?(relevant\s+)?experience\b", re.IGNORECASE)

def _month_num(s: str) -> Optional[int]:
    return MONTHS.get(s.strip().lower())

def _years_between(y1: int, m1: int, y2: int, m2: int) -> float:
    return max(0.0, ((y2 - y1) * 12 + (m2 - m1)) / 12.0)

def extract_experience_years(text: str) -> Tuple[float, dict]:
    debug = {"explicit": [], "ranges": []}
    low = text.lower()

    explicit_vals = [int(m.group(1)) for m in EXPLICIT_YEARS_RE.finditer(low) if int(m.group(1)) <= 50]
    if explicit_vals:
        debug["explicit"] = explicit_vals

    now = datetime.date.today()
    ranges_month_year = []
    for m in MTH_YR_RANGE_RE.finditer(text):
        m1, y1 = m.group("m1"), int(m.group("y1"))
        m2_raw, y2_raw = m.group("m2"), m.group("y2")
        mm1 = _month_num(m1) or 1
        if m2_raw and m2_raw.lower() in ("present","current"):
            mm2, y2 = now.month, now.year
        else:
            if not y2_raw:
                continue
            y2 = int(y2_raw)
            mm2 = _month_num(m2_raw) or 1
        if (y2, mm2) >= (y1, mm1):
            yr = _years_between(y1, mm1, y2, mm2)
            ranges_month_year.append(((y1, mm1, y2, mm2), yr))
            debug["ranges"].append({"type":"month-year", "from":f"{m1} {y1}", "to":f"{m2_raw} {y2}", "years":round(yr,2)})

    ranges_year = []
    for m in YEAR_RANGE_RE.finditer(text):
        y1 = int(m.group(1))
        y2_raw = m.group(2)
        if y2_raw.lower() in ("present","current"):
            y2, mm2 = now.year, now.month
        else:
            y2, mm2 = int(y2_raw), 12
        if y2 >= y1:
            yr = _years_between(y1, 1, y2, mm2)
            ranges_year.append(((y1, 1, y2, mm2), yr))
            debug["ranges"].append({"type":"year-year", "from":f"{y1}", "to":f"{y2_raw}", "years":round(yr,2)})

    all_ranges = ranges_month_year + ranges_year
    years_from_ranges = 0.0
    if all_ranges:
        all_ranges.sort(key=lambda r: (r[0][0], r[0][1]))
        merged = []
        cur_start = all_ranges[0][0][:2]
        cur_end = all_ranges[0][0][2:]
        for (y1, m1, y2, m2), _ in all_ranges[1:]:
            if (y1, m1) <= (cur_end[0], cur_end[1]):
                if (y2, m2) > (cur_end[0], cur_end[1]):
                    cur_end = (y2, m2)
            else:
                merged.append((*cur_start, *cur_end))
                cur_start, cur_end = (y1, m1), (y2, m2)
        merged.append((*cur_start, *cur_end))
        for y1, m1, y2, m2 in merged:
            years_from_ranges += _years_between(y1, m1, y2, m2)

    if explicit_vals and years_from_ranges:
        guess = max(float(max(explicit_vals)), years_from_ranges)
    elif explicit_vals:
        guess = float(max(explicit_vals))
    else:
        guess = years_from_ranges

    guess = min(50.0, round(guess, 2))
    return guess, debug

def infer_seniority_level(years: float) -> str:
    if years < 1.0:
        return "Intern/Entry"
    if years < 3.0:
        return "Junior"
    if years < 6.0:
        return "Mid"
    if years < 10.0:
        return "Senior"
    return "Lead/Principal"

# =========================
# API building & calling
# =========================
def build_search_body(country: Optional[str], role: Optional[str]) -> dict:
    body = {"from": 0, "size": 50}
    if role:
        body["q"] = role
    if country:
        body["country"] = country
    return body

def call_api_jobs(body: dict) -> dict:
    headers = {"Content-Type": "application/json", "apikey": APIJOBS_KEY}
    resp = requests.post(APIJOBS_URL, headers=headers, json=body, timeout=30)
    try:
        return resp.json()
    except ValueError:
        return {"ok": False, "error": "Non-JSON response", "status_code": resp.status_code, "text": resp.text}

# =========================
# Client-side filters (optional)
# =========================
def filter_hits_by_role(hits: List[dict], role_terms: List[str], cutoff: int = TITLE_FILTER_CUTOFF) -> List[dict]:
    if not role_terms:
        return hits
    keep = []
    for h in hits:
        title = (h.get("title") or h.get("job_title") or "").lower()
        best = 0
        for term in role_terms:
            s = fuzz.partial_ratio(title, term.lower())
            if s > best:
                best = s
        if best >= cutoff:
            keep.append(h)
    return keep

REQUIRED_YEARS_RE = re.compile(
    r"(?P<min>\d{1,2})\s*(?:\+|plus)?\s*(?:-|\u2013|\u2014|to)?\s*(?P<max>\d{1,2})?\s*"
    r"(?:years?|yrs?)\s+(?:of\s+)?(?:relevant\s+)?experience",
    re.IGNORECASE
)

def extract_required_years_from_job(job: dict) -> Optional[float]:
    text_parts = []
    for key in ("description", "requirements", "title"):
        v = job.get(key)
        if isinstance(v, str) and v.strip():
            text_parts.append(v)
    if not text_parts:
        return None
    blob = " \n".join(text_parts)
    vals = []
    for m in REQUIRED_YEARS_RE.finditer(blob):
        mn = int(m.group("min"))
        mx = m.group("max")
        if mx:
            mx = int(mx)
            vals.append(max(mn, mx))
        else:
            vals.append(mn)
    if not vals:
        return None
    return float(max(vals))

def filter_hits_by_experience(hits: List[dict], candidate_years: float, cushion: float = EXPERIENCE_YEARS_CUSHION) -> List[dict]:
    if not hits:
        return hits
    keep = []
    for h in hits:
        req = extract_required_years_from_job(h)
        if req is None or req <= candidate_years + cushion:
            keep.append(h)
    return keep

# =========================
# Main entry
# =========================
def cv_path_to_jobs(cv_path: str) -> dict:
    if not os.path.exists(cv_path):
        return {"error": f"File not found: {cv_path}"}

    # NEW: central text extraction router (PDF kept as-is, with OCR fallback)
    text, debug_extract = extract_text_any(cv_path)
    if not text or len(text) < 20:
        return {"error": "Could not extract text from file (no content found).",
                "_debug_extract": debug_extract}

    # Load AI components
    nlp = load_spacy()
    kb = load_keybert()

    # Country/City detection (GeoText + spaCy GPE + city->country)
    country_final, city_found, mode = extract_country_city(text, nlp)

    # Role (heuristics) + canonicalization (synonym map)
    raw_role = extract_job_title(text)
    role_final = canonicalize_role(raw_role)
    role_terms = role_synonyms_for(role_final if role_final else raw_role)

    # Experience
    years_exp, exp_debug = extract_experience_years(text)
    level = infer_seniority_level(years_exp)

    # KeyBERT skills/phrases (telemetry only)
    top_keywords = keybert_keywords(kb, text, top_n=25)

    # Build request (q = ONLY the role; country from CV or city->country)
    body = build_search_body(country_final or None, role_final or raw_role or None)

    # Call API
    data = call_api_jobs(body)
    hits = data.get("hits", []) if isinstance(data, dict) else []

    # Optional client filtering
    hits_role = filter_hits_by_role(hits, role_terms, cutoff=TITLE_FILTER_CUTOFF) if hits else []
    hits_role_or_all = hits_role if hits_role else hits
    hits_exp = filter_hits_by_experience(hits_role_or_all, candidate_years=years_exp, cushion=EXPERIENCE_YEARS_CUSHION)
    final_hits = hits_exp if hits_exp else hits_role_or_all

    return {
        "search_params": body,
        "_debug_extract": debug_extract,  # so you can see which extractor ran
        "extracted": {
            "country_mode": mode,               # "country" | "city->country" | "city_only" | "fallback"
            "country_final": country_final,     # what we used (or None)
            "city_found": city_found,           # city seen in CV (we do NOT send to API)
            "role_raw": raw_role,
            "role_final": role_final,
            "role_terms_used_for_filtering": role_terms,
            "experience_years_estimate": years_exp,
            "experience_level": level,
            "experience_debug": exp_debug,
            "keybert_top_keywords": top_keywords[:12],
        },
        "jobs": {
            "ok": data.get("ok", False),
            "total_before_filter": len(hits),
            "after_role_filter": len(hits_role),
            "after_experience_filter": len(final_hits),
            "hits": final_hits
        }
    }

# =========================
# Run
# =========================
if __name__ == "__main__":
    result = cv_path_to_jobs(CV_PATH)
    print(json.dumps(result, indent=2))
