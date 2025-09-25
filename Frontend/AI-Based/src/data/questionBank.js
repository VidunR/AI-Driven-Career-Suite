// src/data/questionBank.js

/**
 * Difficulty-aware question bank with helpers.
 * RULES:
 * 1) The arrays in BANK (easy/mid/senior) are the ground-truth labels.
 * 2) When a user picks a level (entry/mid/senior), we build a pool of up to 9:
 *    - Start with that level's array.
 *    - If fewer than 9, borrow from adjacent levels in this priority:
 *        entry  -> mid, then senior
 *        mid    -> senior, then easy
 *        senior -> mid, then easy
 *    - Overlap between levels is allowed across levels, but inside one session we dedupe by id.
 * 3) Return 5 random, unique questions from that pool (or fewer if pool < 5).
 */

const ROLE_ALIASES = {
  // Software engineer aliases
  "software engineer": "Software Engineer",
  "software engineering": "Software Engineer",
  se: "Software Engineer",

  // Cybersecurity aliases
  "cyber specialist": "Cybersecurity Specialist",
  "cybersecurity specialist": "Cybersecurity Specialist",
  "cyber security specialist": "Cybersecurity Specialist",
  cybersecurity: "Cybersecurity Specialist",
  "cyber security": "Cybersecurity Specialist",

  // Project Manager aliases
  "project manager": "Project Manager",
  "project management": "Project Manager",
  "project mgr": "Project Manager",
  pm: "Project Manager",

  // Digital Marketing Manager aliases
  "digital marketing manager": "Digital Marketing Manager",
  "marketing manager": "Digital Marketing Manager",
  "digital marketer": "Digital Marketing Manager",
  "marketing specialist": "Digital Marketing Manager",
  "growth marketer": "Digital Marketing Manager",

  // Accountant aliases
  accountant: "Accountant",
  accounting: "Accountant",
  "staff accountant": "Accountant",
  "financial accountant": "Accountant",
};

function resolveRoleKey(input) {
  if (!input) return "Software Engineer";
  const norm = String(input).toLowerCase().trim();

  // alias mapping first
  if (ROLE_ALIASES[norm]) return ROLE_ALIASES[norm];

  // allow exact case-insensitive key match to BANK keys
  const known = Object.keys(BANK).find((k) => k.toLowerCase() === norm);
  return known || "Software Engineer";
}

// ---- utils ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dedupeById(items) {
  const seen = new Map();
  for (const q of items) {
    if (!seen.has(q.id)) seen.set(q.id, q);
  }
  return Array.from(seen.values());
}

function mapUiLevelToBankKey(level) {
  // UI uses "entry" | "mid" | "senior"; bank uses "easy" | "mid" | "senior"
  const norm = String(level || "mid").toLowerCase();
  if (norm === "entry") return "easy";
  if (norm === "mid") return "mid";
  if (norm === "senior") return "senior";
  return "mid";
}

/**
 * Build a pool of up to 9 questions for a selected level, borrowing
 * from adjacent levels in the specified priority.
 */
function buildNinePoolForLevel(bankForRole, uiLevel) {
  const primaryKey = mapUiLevelToBankKey(uiLevel);

  // Borrow priorities
  const borrowOrderByUiLevel = {
    entry: ["mid", "senior"], // easy -> borrow mid, then senior
    mid: ["senior", "easy"], // mid  -> borrow senior, then easy
    senior: ["mid", "easy"], // senior -> borrow mid, then easy
  };

  const borrowOrder = borrowOrderByUiLevel[String(uiLevel).toLowerCase()] || [
    "mid",
    "senior",
  ];

  // Start with the primary level
  let pool = dedupeById(bankForRole[primaryKey] || []);

  // Borrow until we reach 9 or run out
  for (const borrowUi of borrowOrder) {
    if (pool.length >= 9) break;
    const borrowBankKey = borrowUi === "entry" ? "easy" : borrowUi; // normalize
    const addFrom = bankForRole[borrowBankKey] || [];
    for (const q of addFrom) {
      if (pool.length >= 9) break;
      if (!pool.some((p) => p.id === q.id)) {
        pool.push(q);
      }
    }
  }

  return pool;
}

// ================== QUESTION BANK ==================

export const BANK = {
  // ------- Software Engineer -------
  "Software Engineer": {
    easy: [
      {
        id: "se-1",
        text: "Explain the difference between object-oriented programming and functional programming. When would you choose one over the other?",
        video: "/interview-videos/software-engineer/Q1.mp4",
      },
      {
        id: "se-3",
        text: "Describe your approach to code reviews. What do you look for, and how do you handle disagreements about code quality?",
        video: "/interview-videos/software-engineer/Q3.mp4",
      },
      {
        id: "se-6",
        text: "How do you approach testing in your development process? Explain the testing pyramid.",
        video: "/interview-videos/software-engineer/Q6.mp4",
      },
      {
        id: "se-11",
        text: "Describe a new technology you recently learned. How did you approach learning it?",
        video: "/interview-videos/software-engineer/Q11.mp4",
      },
      {
        id: "se-12",
        text: "Tell me about a time when you had to explain a complex technical concept to non-technical stakeholders.",
        video: "/interview-videos/software-engineer/Q12.mp4",
      },
      {
        id: "se-13",
        text: "How do you approach refactoring legacy code without breaking existing functionality?",
        video: "/interview-videos/software-engineer/Q13.mp4",
      },
      {
        id: "se-18",
        text: "Describe your experience working in Agile environments. How do you handle changing requirements?",
        video: "/interview-videos/software-engineer/Q18.mp4",
      },
    ],
    mid: [
      {
        id: "se-4",
        text: "Given an array of integers, write pseudocode to find the two numbers that add up to a specific target. What's the time complexity?",
        video: "/interview-videos/software-engineer/Q4.mp4",
      },
      {
        id: "se-5",
        text: "Explain the differences between SQL and NoSQL databases. When would you choose MongoDB over PostgreSQL?",
        video: "/interview-videos/software-engineer/Q5.mp4",
      },
      {
        id: "se-7",
        text: "You notice your web application is loading slowly. Walk me through your debugging process.",
        video: "/interview-videos/software-engineer/Q7.mp4",
      },
      {
        id: "se-8",
        text: "Describe a challenging Git merge conflict you've encountered and how you resolved it.",
        video: "/interview-videos/software-engineer/Q8.mp4",
      },
      {
        id: "se-14",
        text: "What principles do you follow when designing RESTful APIs? How do you handle versioning?",
        video: "/interview-videos/software-engineer/Q14.mp4",
      },
      {
        id: "se-15",
        text: "Explain your experience with CI/CD pipelines. How do you ensure reliable deployments?",
        video: "/interview-videos/software-engineer/Q15.mp4",
      },
      {
        id: "se-16",
        text: "How do you implement comprehensive error handling and logging in your applications?",
        video: "/interview-videos/software-engineer/Q16.mp4",
      },
    ],
    senior: [
      {
        id: "se-2",
        text: "How would you design a URL shortening service like bit.ly? Walk me through your architecture decisions.",
        video: "/interview-videos/software-engineer/Q2.mp4",
      },
      {
        id: "se-9",
        text: "What are the most common security vulnerabilities in web applications, and how do you prevent them?",
        video: "/interview-videos/software-engineer/Q9.mp4",
      },
      {
        id: "se-10",
        text: "How would you handle a situation where your application needs to support 10x more users overnight?",
        video: "/interview-videos/software-engineer/Q10.mp4",
      },
      {
        id: "se-17",
        text: "When would you use a hash table versus a binary search tree? Provide specific use cases.",
        video: "/interview-videos/software-engineer/Q17.mp4",
      },
      {
        id: "se-19",
        text: "Tell me about a time when you had to make a critical technical decision under pressure.",
        video: "/interview-videos/software-engineer/Q19.mp4",
      },
      {
        id: "se-20",
        text: "What emerging trends in software development are you most excited about, and why?",
        video: "/interview-videos/software-engineer/Q20.mp4",
      },
    ],
  },

  // ------- Cybersecurity Specialist -------
  "Cybersecurity Specialist": {
    easy: [
      {
        id: "cy-1",
        text: "Explain the difference between a firewall, IDS, and IPS. When would you use each?",
        video: "/interview-videos/cybersecurity-specialist/Q1.mp4",
      },
      {
        id: "cy-3",
        text: "How do you prioritize vulnerabilities when you have limited time and resources?",
        video: "/interview-videos/cybersecurity-specialist/Q3.mp4",
      },
      {
        id: "cy-5",
        text: "Explain the principle of least privilege and how you would implement it in an enterprise environment.",
        video: "/interview-videos/cybersecurity-specialist/Q5.mp4",
      },
      {
        id: "cy-7",
        text: "Whats the difference between black box, white box, and gray box penetration testing?",
        video: "/interview-videos/cybersecurity-specialist/Q7.mp4",
      },
      {
        id: "cy-9",
        text: "How do you stay current with emerging cyber threats and incorporate threat intelligence into security operations?",
        video: "/interview-videos/cybersecurity-specialist/Q9.mp4",
      },
      {
        id: "cy-13",
        text: "What tools and techniques do you use for network security monitoring and log analysis?",
        video: "/interview-videos/cybersecurity-specialist/Q13.mp4",
      },
      {
        id: "cy-17",
        text: "How do you measure the effectiveness of security awareness programs?",
        video: "/interview-videos/cybersecurity-specialist/Q17.mp4",
      },
    ],
    mid: [
      {
        id: "cy-2",
        text: "Walk me through the key phases of incident response and your role in each phase.",
        video: "/interview-videos/cybersecurity-specialist/Q2.mp4",
      },
      {
        id: "cy-4",
        text: "Describe your approach to conducting a cybersecurity risk assessment for an organization.",
        video: "/interview-videos/cybersecurity-specialist/Q4.mp4",
      },
      {
        id: "cy-6",
        text: "Compare symmetric and asymmetric encryption. Provide real-world use cases for each.",
        video: "/interview-videos/cybersecurity-specialist/Q6.mp4",
      },
      {
        id: "cy-8",
        text: "How familiar are you with frameworks like NIST, ISO 27001, or CIS Controls? Which do you prefer and why?",
        video: "/interview-videos/cybersecurity-specialist/Q8.mp4",
      },
      {
        id: "cy-10",
        text: "What are the main security considerations when migrating to cloud infrastructure?",
        video: "/interview-videos/cybersecurity-specialist/Q10.mp4",
      },
      {
        id: "cy-12",
        text: "Walk me through your process for analyzing suspicious files or malware samples.",
        video: "/interview-videos/cybersecurity-specialist/Q12.mp4",
      },
      {
        id: "cy-14",
        text: "How do you ensure an organization meets regulatory compliance standards like GDPR, HIPAA, or SOX?",
        video: "/interview-videos/cybersecurity-specialist/Q14.mp4",
      },
    ],
    senior: [
      {
        id: "cy-11",
        text: "What are the main security considerations when migrating to cloud infrastructure?",
        video: "/interview-videos/cybersecurity-specialist/Q11.mp4",
      },
      {
        id: "cy-15",
        text: "How do you design security controls for a new system or application from the ground up?",
        video: "/interview-videos/cybersecurity-specialist/Q15.mp4",
      },
      {
        id: "cy-16",
        text: "How do you design security controls for a new system or application from the ground up?",
        video: "/interview-videos/cybersecurity-specialist/Q16.mp4",
      },
      {
        id: "cy-18",
        text: "What role does cybersecurity play in business continuity and disaster recovery planning?",
        video: "/interview-videos/cybersecurity-specialist/Q18.mp4",
      },
      {
        id: "cy-19",
        text: "How do you approach security for new technologies like IoT devices or AI systems?",
        video: "/interview-videos/cybersecurity-specialist/Q19.mp4",
      },
      {
        id: "cy-20",
        text: "How do you explain complex security risks to non-technical executives and justify security investments?",
        video: "/interview-videos/cybersecurity-specialist/Q20.mp4",
      },
    ],
  },

  // ------- Project Manager -------
  "Project Manager": {
    easy: [
      {
        id: "pm-1",
        text: "Compare Agile and Waterfall methodologies. When would you use each approach?",
        video: "/interview-videos/project-manager/Q1.mp4",
      },
      {
        id: "pm-5",
        text: "How do you handle underperforming team members while maintaining team morale?",
        video: "/interview-videos/project-manager/Q5.mp4",
      },
      {
        id: "pm-8",
        text: "How do you ensure effective communication across different levels of an organization?",
        video: "/interview-videos/project-manager/Q8.mp4",
      },
      {
        id: "pm-11",
        text: "How do you help teams and organizations adapt to new processes or technologies?",
        video: "/interview-videos/project-manager/Q11.mp4",
      },
      {
        id: "pm-14",
        text: "How do you define and measure project success beyond just meeting deadlines?",
        video: "/interview-videos/project-manager/Q14.mp4",
      },
      {
        id: "pm-17",
        text: "What project documentation do you consider essential, and how do you ensure it stays current?",
        video: "/interview-videos/project-manager/Q17.mp4",
      },
      {
        id: "pm-18",
        text: "What project management tools do you prefer and why? How do you choose the right tool for each project?",
        video: "/interview-videos/project-manager/Q18.mp4",
      },
    ],
    mid: [
      {
        id: "pm-2",
        text: "Describe a situation where you had to manage conflicting priorities from different stakeholders.",
        video: "/interview-videos/project-manager/Q2.mp4",
      },
      {
        id: "pm-3",
        text: "How do you identify, assess, and mitigate project risks? Give me a specific example.",
        video: "/interview-videos/project-manager/Q3.mp4",
      },
      {
        id: "pm-4",
        text: "Tell me about a time when you had to deliver a project under budget constraints.",
        video: "/interview-videos/project-manager/Q4.mp4",
      },
      {
        id: "pm-6",
        text: "Describe your approach to managing scope changes during project execution.",
        video: "/interview-videos/project-manager/Q6.mp4",
      },
      {
        id: "pm-7",
        text: "How do you create realistic project timelines and what do you do when deadlines are at risk?",
        video: "/interview-videos/project-manager/Q7.mp4",
      },
      {
        id: "pm-9",
        text: "How do you balance quality requirements with time and budget constraints?",
        video: "/interview-videos/project-manager/Q9.mp4",
      },
      {
        id: "pm-12",
        text: "Tell me about a significant conflict you mediated between team members or departments.",
        video: "/interview-videos/project-manager/Q12.mp4",
      },
    ],
    senior: [
      {
        id: "pm-13",
        text: "How do you prioritize resource allocation when managing multiple projects simultaneously?",
        video: "/interview-videos/project-manager/Q13.mp4",
      },
      {
        id: "pm-15",
        text: "Describe a project crisis you've managed. How did you handle it?",
        video: "/interview-videos/project-manager/Q15.mp4",
      },
      {
        id: "pm-16",
        text: "How do you lead and influence team members who don't report to you directly?",
        video: "/interview-videos/project-manager/Q16.mp4",
      },
      {
        id: "pm-19",
        text: "Describe a project that didn't go as planned. What did you learn and how did you apply those lessons?",
        video: "/interview-videos/project-manager/Q19.mp4",
      },
      {
        id: "pm-20",
        text: "How do you ensure your projects align with broader organizational goals and strategy?",
        video: "/interview-videos/project-manager/Q20.mp4",
      },
      {
        id: "pm-10",
        text: "Describe your experience managing external vendors or contractors.",
        video: "/interview-videos/project-manager/Q10.mp4",
      },
    ],
  },

  // ------- Digital Marketing Manager -------
  "Digital Marketing Manager": {
    easy: [
      {
        id: "dm-4",
        text: "How do you determine which social media platforms are right for a brand?",
        video: "/interview-videos/digital-marketing-manager/Q4.mp4",
      },
      {
        id: "dm-5",
        text: "Describe your approach to creating a content calendar that drives engagement and conversions.",
        video: "/interview-videos/digital-marketing-manager/Q5.mp4",
      },
      {
        id: "dm-7",
        text: "How do you design email campaigns that achieve high open rates and conversions?",
        video: "/interview-videos/digital-marketing-manager/Q7.mp4",
      },
      {
        id: "dm-11",
        text: "What's your experience with marketing automation tools? How do you set up effective workflows?",
        video: "/interview-videos/digital-marketing-manager/Q11.mp4",
      },
      {
        id: "dm-12",
        text: "How do you maintain brand consistency across multiple digital channels?",
        video: "/interview-videos/digital-marketing-manager/Q12.mp4",
      },
      {
        id: "dm-6",
        text: "What metrics do you consider most important for measuring digital marketing success?",
        video: "/interview-videos/digital-marketing-manager/Q6.mp4",
      },
      {
        id: "dm-18",
        text: "How do you work with sales, product, and customer service teams to align marketing efforts?",
        video: "/interview-videos/digital-marketing-manager/Q18.mp4",
      },
    ],
    mid: [
      {
        id: "dm-1",
        text: "How do you develop a comprehensive digital marketing strategy for a new product launch?",
        video: "/interview-videos/digital-marketing-manager/Q1.mp4",
      },
      {
        id: "dm-2",
        text: "Walk me through your process for creating and validating customer personas.",
        video: "/interview-videos/digital-marketing-manager/Q2.mp4",
      },
      {
        id: "dm-3",
        text: "Explain the relationship between SEO and SEM. How do you balance organic and paid search strategies?",
        video: "/interview-videos/digital-marketing-manager/Q3.mp4",
      },
      {
        id: "dm-8",
        text: "How do you distribute budget across different digital marketing channels?",
        video: "/interview-videos/digital-marketing-manager/Q8.mp4",
      },
      {
        id: "dm-9",
        text: "Describe a successful A/B test you've conducted. What did you learn and how did you implement the results?",
        video: "/interview-videos/digital-marketing-manager/Q9.mp4",
      },
      {
        id: "dm-10",
        text: "How do you identify and evaluate potential influencer partnerships?",
        video: "/interview-videos/digital-marketing-manager/Q10.mp4",
      },
      {
        id: "dm-15",
        text: "What's your process for analyzing competitors' digital marketing strategies?",
        video: "/interview-videos/digital-marketing-manager/Q15.mp4",
      },
    ],
    senior: [
      {
        id: "dm-13",
        text: "Describe how you've handled a negative social media situation or PR crisis.",
        video: "/interview-videos/digital-marketing-manager/Q13.mp4",
      },
      {
        id: "dm-14",
        text: "How do you map and optimize the customer journey across digital touchpoints?",
        video: "/interview-videos/digital-marketing-manager/Q14.mp4",
      },
      {
        id: "dm-16",
        text: "How do you demonstrate the ROI of digital marketing activities to senior leadership?",
        video: "/interview-videos/digital-marketing-manager/Q16.mp4",
      },
      {
        id: "dm-17",
        text: "What digital marketing trends are you most excited about, and how might they impact strategy?",
        video: "/interview-videos/digital-marketing-manager/Q17.mp4",
      },
      {
        id: "dm-19",
        text: "How do you balance personalized marketing with data privacy regulations like GDPR?",
        video: "/interview-videos/digital-marketing-manager/Q19.mp4",
      },
      {
        id: "dm-20",
        text: "Describe a campaign that underperformed. How did you identify issues and improve results?",
        video: "/interview-videos/digital-marketing-manager/Q20.mp4",
      },
    ],
  },

  // ------- Accountant -------
  Accountant: {
    easy: [
      {
        id: "ac-1",
        text: "Explain the relationship between the three main financial statements and how they connect.",
        video: "/interview-videos/accountant/Q1.mp4",
      },
      {
        id: "ac-4",
        text: "How do you stay current with changing tax laws and ensure compliance?",
        video: "/interview-videos/accountant/Q4.mp4",
      },
      {
        id: "ac-11",
        text: "How have you used accounting software to improve efficiency and accuracy?",
        video: "/interview-videos/accountant/Q11.mp4",
      },
      {
        id: "ac-13",
        text: "How do you ensure accurate and timely month-end closing processes?",
        video: "/interview-videos/accountant/Q13.mp4",
      },
      {
        id: "ac-14",
        text: "Explain your approach to fixed asset management and depreciation calculations.",
        video: "/interview-videos/accountant/Q14.mp4",
      },
      {
        id: "ac-17",
        text: "How do you handle accounting responsibilities when team members are unavailable?",
        video: "/interview-videos/accountant/Q17.mp4",
      },
      {
        id: "ac-19",
        text: "How do you explain complex financial information to non-financial stakeholders?",
        video: "/interview-videos/accountant/Q19.mp4",
      },
    ],
    mid: [
      {
        id: "ac-5",
        text: "Walk me through your process for analyzing and explaining budget variances to management.",
        video: "/interview-videos/accountant/Q5.mp4",
      },
      {
        id: "ac-6",
        text: "How do you forecast and manage cash flow for business operations?",
        video: "/interview-videos/accountant/Q6.mp4",
      },
      {
        id: "ac-7",
        text: "Describe your experience preparing for and working with external auditors.",
        video: "/interview-videos/accountant/Q7.mp4",
      },
      {
        id: "ac-8",
        text: "Explain different costing methods and when you would use each approach.",
        video: "/interview-videos/accountant/Q8.mp4",
      },
      {
        id: "ac-9",
        text: "How do you analyze financial ratios to assess company performance and health?",
        video: "/interview-videos/accountant/Q9.mp4",
      },
      {
        id: "ac-10",
        text: "What strategies do you use to manage accounts receivable and minimize bad debt?",
        video: "/interview-videos/accountant/Q10.mp4",
      },
      {
        id: "ac-12",
        text: "Describe your experience with regulatory reporting requirements in your industry.",
        video: "/interview-videos/accountant/Q12.mp4",
      },
    ],
    senior: [
      {
        id: "ac-2",
        text: "How do you handle complex revenue recognition scenarios under current accounting standards?",
        video: "/interview-videos/accountant/Q2.mp4",
      },
      {
        id: "ac-3",
        text: "Describe the internal controls you would implement to prevent financial fraud.",
        video: "/interview-videos/accountant/Q3.mp4",
      },
      {
        id: "ac-15",
        text: "How do you create financial forecasts and models for business planning?",
        video: "/interview-videos/accountant/Q15.mp4",
      },
      {
        id: "ac-16",
        text: "What accounting challenges have you encountered with inventory valuation and management?",
        video: "/interview-videos/accountant/Q16.mp4",
      },
      {
        id: "ac-18",
        text: "Describe an accounting process you've improved. What was the impact?",
        video: "/interview-videos/accountant/Q18.mp4",
      },
      {
        id: "ac-20",
        text: "Describe a situation where you had to uphold ethical standards in your accounting work.",
        video: "/interview-videos/accountant/Q20.mp4",
      },
    ],
  },
};

// ================== Public API ==================

/**
 * Get all three difficulty buckets for a role (your curated labeling).
 */
export function getQuestionPool(jobTitle) {
  return BANK[resolveRoleKey(jobTitle)];
}

/**
 * Get questions for a role and UI difficulty ("entry" | "mid" | "senior").
 * - Builds a pool of up to 9 using the borrow rules above.
 * - Returns `limit` random, unique questions (default 5).
 *
 * @param {string} jobTitle
 * @param {"entry"|"mid"|"senior"} difficulty
 * @param {number} [limit=5]
 * @param {boolean} [randomize=true]
 * @returns {Array<{id:string,text:string,video:string}>}
 */
export function getQuestionsFor(
  jobTitle,
  difficulty = "mid",
  limit = 5,
  randomize = true
) {
  const roleKey = resolveRoleKey(jobTitle);
  const bankForRole = BANK[roleKey];
  if (!bankForRole) return [];

  const pool = buildNinePoolForLevel(bankForRole, difficulty);
  const base = randomize ? shuffle(pool) : pool;

  // Ensure unique by ID and take `limit`
  const unique = dedupeById(base);
  return unique.slice(0, Math.max(0, Number(limit) || 0));
}

/**
 * Mixed mode helper: grab N random unique across all 3 labeled buckets.
 */
export function getMixedQuestions(jobTitle, limit = 5) {
  const roleKey = resolveRoleKey(jobTitle);
  const bank = BANK[roleKey];
  if (!bank) return [];
  const all = dedupeById([
    ...(bank.easy || []),
    ...(bank.mid || []),
    ...(bank.senior || []),
  ]);
  return shuffle(all).slice(0, Math.max(0, limit));
}
