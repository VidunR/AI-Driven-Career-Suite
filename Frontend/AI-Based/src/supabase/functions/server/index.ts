import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Create Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// User registration
app.post('/make-server-aa33bbfc/auth/register', async (c) => {
  try {
    const { name, email, password } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Registration error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store additional user data in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      createdAt: new Date().toISOString(),
      cvCount: 0,
      interviewCount: 0
    })

    return c.json({ 
      user: { 
        id: data.user.id, 
        name, 
        email 
      } 
    })
  } catch (error) {
    console.log('Registration server error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// User login (handled by Supabase client-side, but we can add server validation if needed)
app.post('/make-server-aa33bbfc/auth/validate', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${user.id}`)
    if (!userData) {
      // Create user data if it doesn't exist
      const newUserData = {
        id: user.id,
        name: user.user_metadata?.name || 'User',
        email: user.email!,
        createdAt: new Date().toISOString(),
        cvCount: 0,
        interviewCount: 0
      }
      await kv.set(`user:${user.id}`, newUserData)
      return c.json({ user: newUserData })
    }

    return c.json({ user: userData })
  } catch (error) {
    console.log('Auth validation error:', error)
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

// CV Management Routes
app.get('/make-server-aa33bbfc/cvs', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const cvs = await kv.getByPrefix(`cv:${user.id}:`)
    return c.json({ cvs: cvs || [] })
  } catch (error) {
    console.log('Error fetching CVs:', error)
    return c.json({ error: 'Failed to fetch CVs' }, 500)
  }
})

app.post('/make-server-aa33bbfc/cvs', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { name, content, format, isPrimary } = await c.req.json()
    const cvId = crypto.randomUUID()
    
    // If this is primary, unset other primary CVs
    if (isPrimary) {
      const existingCvs = await kv.getByPrefix(`cv:${user.id}:`)
      for (const cv of existingCvs) {
        if (cv.isPrimary) {
          await kv.set(`cv:${user.id}:${cv.id}`, { ...cv, isPrimary: false })
        }
      }
    }

    const cvData = {
      id: cvId,
      userId: user.id,
      name,
      content,
      format,
      isPrimary: isPrimary || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await kv.set(`cv:${user.id}:${cvId}`, cvData)
    
    // Update user CV count
    const userData = await kv.get(`user:${user.id}`)
    if (userData) {
      await kv.set(`user:${user.id}`, { ...userData, cvCount: (userData.cvCount || 0) + 1 })
    }

    return c.json({ cv: cvData })
  } catch (error) {
    console.log('Error creating CV:', error)
    return c.json({ error: 'Failed to create CV' }, 500)
  }
})

// Job Management Routes
app.get('/make-server-aa33bbfc/jobs/recommendations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Mock job recommendations - in a real app, this would be AI-powered matching
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

    return c.json({ jobs: mockJobs })
  } catch (error) {
    console.log('Error fetching job recommendations:', error)
    return c.json({ error: 'Failed to fetch job recommendations' }, 500)
  }
})

// Interview Management Routes
app.post('/make-server-aa33bbfc/interviews', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { category, questionCount, responses } = await c.req.json()
    const interviewId = crypto.randomUUID()
    
    // Mock scoring - in a real app, this would be AI-powered analysis
    const scores = {
      communication: Math.floor(Math.random() * 30) + 70,
      knowledge: Math.floor(Math.random() * 30) + 70,
      structure: Math.floor(Math.random() * 30) + 70,
      confidence: Math.floor(Math.random() * 30) + 70
    }
    
    const overallScore = Math.floor(
      (scores.communication + scores.knowledge + scores.structure + scores.confidence) / 4
    )

    const interviewData = {
      id: interviewId,
      userId: user.id,
      category,
      questionCount,
      responses: responses || [],
      scores,
      overallScore,
      strengths: ['Clear communication', 'Technical knowledge', 'Problem-solving approach'],
      improvements: ['Provide more specific examples', 'Practice behavioral questions', 'Improve eye contact'],
      completedAt: new Date().toISOString()
    }

    await kv.set(`interview:${user.id}:${interviewId}`, interviewData)
    
    // Update user interview count
    const userData = await kv.get(`user:${user.id}`)
    if (userData) {
      await kv.set(`user:${user.id}`, { 
        ...userData, 
        interviewCount: (userData.interviewCount || 0) + 1 
      })
    }

    return c.json({ interview: interviewData })
  } catch (error) {
    console.log('Error saving interview:', error)
    return c.json({ error: 'Failed to save interview' }, 500)
  }
})

app.get('/make-server-aa33bbfc/interviews', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const interviews = await kv.getByPrefix(`interview:${user.id}:`)
    return c.json({ interviews: interviews || [] })
  } catch (error) {
    console.log('Error fetching interviews:', error)
    return c.json({ error: 'Failed to fetch interviews' }, 500)
  }
})

// Dashboard Stats
app.get('/make-server-aa33bbfc/dashboard/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userData = await kv.get(`user:${user.id}`)
    const interviews = await kv.getByPrefix(`interview:${user.id}:`)
    
    const avgScore = interviews.length > 0 
      ? Math.floor(interviews.reduce((sum, interview) => sum + interview.overallScore, 0) / interviews.length)
      : 0

    const stats = {
      cvCount: userData?.cvCount || 0,
      interviewCount: interviews.length,
      avgScore,
      improvement: interviews.length > 1 ? '+15%' : '+0%'
    }

    return c.json({ stats })
  } catch (error) {
    console.log('Error fetching dashboard stats:', error)
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
  }
})

// Leaderboard
app.get('/make-server-aa33bbfc/leaderboard', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Mock leaderboard data - in a real app, this would aggregate user scores
    const leaderboard = [
      { rank: 1, name: 'Sarah Chen', score: 95, interviews: 20 },
      { rank: 2, name: 'Michael Rodriguez', score: 92, interviews: 18 },
      { rank: 3, name: 'Emily Johnson', score: 89, interviews: 15 },
      { rank: 4, name: 'David Kim', score: 87, interviews: 22 },
      { rank: 5, name: 'Jessica Wong', score: 85, interviews: 12 },
    ]

    return c.json({ leaderboard })
  } catch (error) {
    console.log('Error fetching leaderboard:', error)
    return c.json({ error: 'Failed to fetch leaderboard' }, 500)
  }
})

Deno.serve(app.fetch)