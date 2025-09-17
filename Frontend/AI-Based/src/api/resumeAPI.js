const API_BASE_URL = 'http://localhost:5001/api';

class ResumeAPI {
  constructor(userId = 'default-user') {
    this.userId = userId;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Create or update resume
  async saveResume(resumeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          ...resumeData,
          userId: this.userId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  }

  // Get user's resumes
  async getResumes() {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes?userId=${this.userId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  }

  // Get specific resume by ID
  async getResume(resumeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  }

  // Generate PDF
  async generatePDF(resumeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/pdf`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // AI-powered content generation
  async generateAIContent(prompt, section) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          prompt,
          section,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating AI content:', error);
      throw error;
    }
  }

  // Improve existing text with AI
  async improveText(text, context = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/improve`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          text,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error improving text:', error);
      throw error;
    }
  }
}

export default ResumeAPI;