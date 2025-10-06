import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info.js'

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

// Helper function to safely call server functions
async function safeServerCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      // If server returns HTML error page, throw generic error
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('text/html')) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      try {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      } catch (parseError) {
        throw new Error(`Server error: ${response.status}`)
      }
    }

    return await response.json()
  } catch (error) {
    console.error('Server call failed:', error)
    throw error
  }
}

// Auth functions
export async function signUp(name, email, password) {
  try {
    // Use Supabase Auth directly for registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (data.user) {
      const user = {
        id: data.user.id,
        name: name,
        email: email,
        cvCount: 0,
        interviewCount: 0
      }
      return { user, error: null }
    }

    return { user: null, error: 'Registration failed' }
  } catch (error) {
    console.error('Registration error:', error)
    return { user: null, error: 'Network error during registration' }
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { user: null, accessToken: null, error: error.message }
    }

    if (!data.session?.access_token || !data.user) {
      return { user: null, accessToken: null, error: 'No access token received' }
    }

    const user = {
      id: data.user.id,
      name: data.user.user_metadata?.name || 'User',
      email: data.user.email || email,
      cvCount: 0,
      interviewCount: 0
    }

    return { user, accessToken: data.session.access_token, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { user: null, accessToken: null, error: 'Network error during sign in' }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message || null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: 'Network error during sign out' }
  }
}

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.access_token || !session.user) {
      return { user: null, accessToken: null, error: error?.message || 'No active session' }
    }

    const user = {
      id: session.user.id,
      name: session.user.user_metadata?.name || 'User',
      email: session.user.email || '',
      cvCount: 0,
      interviewCount: 0
    }

    return { user, accessToken: session.access_token, error: null }
  } catch (error) {
    console.error('Session check error:', error)
    return { user: null, accessToken: null, error: 'Network error during session check' }
  }
}

// Mock data for development
const mockCVs = [
  {
    id: '1',
    userId: 'user1',
    name: 'Software Engineer Resume',
    format: 'PDF',
    isPrimary: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: 'Mock CV content'
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Frontend Developer CV',
    format: 'PDF',
    isPrimary: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    content: 'Mock CV content'
  }
]

const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120K - $150K',
    match: 95,
    tags: ['React', 'TypeScript', 'Remote'],
    posted: '2 days ago',
    description: 'We are looking for a senior frontend developer...',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'Team leadership']
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    salary: '$100K - $130K',
    match: 88,
    tags: ['Node.js', 'React', 'MongoDB'],
    posted: '3 days ago',
    description: 'Join our growing startup...',
    requirements: ['3+ years full stack experience', 'Node.js', 'Database design']
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'DesignStudio',
    location: 'Austin, TX',
    salary: '$90K - $110K',
    match: 82,
    tags: ['React', 'CSS', 'Figma'],
    posted: '1 week ago',
    description: 'Create beautiful user interfaces...',
    requirements: ['React expertise', 'CSS/SCSS', 'Design collaboration']
  }
]

// CV functions with fallback to mock data
export async function getCVs(accessToken) {
  try {
    // Always use mock data for now since server may not be available
    console.log('Using mock CV data for development')
    return mockCVs
  } catch (error) {
    console.log('Using mock CV data due to error:', error)
    return mockCVs
  }
}

export async function createCV(cvData, accessToken) {
  try {
    console.log('Creating mock CV for development')
    // Create mock CV for development
    const newCV = {
      id: Date.now().toString(),
      userId: 'user1',
      name: cvData.name || 'New CV',
      format: cvData.format || 'PDF',
      isPrimary: cvData.isPrimary || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: cvData.content || 'Mock CV content'
    }
    return newCV
  } catch (error) {
    console.log('Error creating CV, using mock data:', error)
    return null
  }
}

export async function deleteCV(cvId, accessToken) {
  try {
    console.log('Mock delete CV for development')
    return true
  } catch (error) {
    console.log('Error deleting CV, using mock response:', error)
    return true
  }
}

// Job functions
export async function getJobRecommendations(accessToken) {
  try {
    console.log('Using mock job data for development')
    return mockJobs
  } catch (error) {
    console.log('Using mock job data due to error:', error)
    return mockJobs
  }
}

// Interview functions
export async function saveInterview(interviewData, accessToken) {
  try {
    console.log('Mock save interview for development')
    return null
  } catch (error) {
    console.log('Error saving interview, using mock response:', error)
    return null
  }
}

export async function getInterviews(accessToken) {
  try {
    console.log('Using mock interview data for development')
    return []
  } catch (error) {
    console.log('Using mock interview data due to error:', error)
    return []
  }
}

// Dashboard functions
export async function getDashboardStats(accessToken) {
  try {
    console.log('Using mock dashboard stats for development')
    return { cvCount: 2, interviewCount: 5, avgScore: 78, improvement: '+15%' }
  } catch (error) {
    console.log('Using mock stats due to error:', error)
    return { cvCount: 2, interviewCount: 5, avgScore: 78, improvement: '+15%' }
  }
}

// Leaderboard functions
export async function getLeaderboard(accessToken) {
  try {
    console.log('Using mock leaderboard data for development')
    return [
      { rank: 1, name: 'Sarah Chen', score: 95, interviews: 20 },
      { rank: 2, name: 'Michael Rodriguez', score: 92, interviews: 18 },
      { rank: 3, name: 'Emily Johnson', score: 89, interviews: 15 }
    ]
  } catch (error) {
    console.log('Using mock leaderboard due to error:', error)
    return [
      { rank: 1, name: 'Sarah Chen', score: 95, interviews: 20 },
      { rank: 2, name: 'Michael Rodriguez', score: 92, interviews: 18 },
      { rank: 3, name: 'Emily Johnson', score: 89, interviews: 15 }
    ]
  }
}