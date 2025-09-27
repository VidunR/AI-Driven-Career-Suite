const API_BASE_URL = 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('jwtToken');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

class ResumeAPI {
  async saveResume({ cvFilepath, cvImagePath = "", cvName = "CV" }) {
    const res = await fetch(`${API_BASE_URL}/cvbuilder/saveCV`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ cvFilepath, cvImagePath, cvName }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async getResumes() {
    const res = await fetch(`${API_BASE_URL}/cvmanager`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  async uploadFile(file, cvName = "") {
    const fd = new FormData();
    fd.append("file", file);
    if (cvName) fd.append("cvName", cvName);

    const res = await fetch(`${API_BASE_URL}/cvmanager/upload`, {
      method: "POST",
      headers: { ...authHeaders() }, // leave out Content-Type so browser sets multipart
      body: fd,
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json(); // returns created CV row
  }

  async deleteCV(cvId) {
    const res = await fetch(`${API_BASE_URL}/cvmanager/${cvId}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }
}

export default ResumeAPI;
