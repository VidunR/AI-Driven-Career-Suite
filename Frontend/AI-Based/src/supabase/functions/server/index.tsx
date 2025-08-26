import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*']
}))
app.use('*', logger(console.log))

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// User Authentication Routes
app.post('/make-server-aa33bbfc/auth/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json()
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store additional user data in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      created_at: new Date().toISOString(),
      cv_count: 0,
      interview_count: 0
    })

    return c.json({ 
      user: { 
        id: data.user.id, 
        name, 
        email 
      } 
    })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

app.post('/make-server-aa33bbfc/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log('Signin error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${data.user.id}`)
    
    return c.json({ 
      user: userData || { 
        id: data.user.id, 
        name: data.user.user_metadata?.name || 'User',
        email: data.user.email 
      },
      access_token: data.session.access_token
    })
  } catch (error) {
    console.log('Signin error:', error)
    return c.json({ error: 'Failed to sign in' }, 500)
  }
})

// CV Management Routes
app.get('/make-server-aa33bbfc/cvs', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const cvs = await kv.getByPrefix(`cv:${user.id}:`)
    return c.json({ cvs })
  } catch (error) {
    console.log('Get CVs error:', error)
    return c.json({ error: 'Failed to fetch CVs' }, 500)
  }
})

app.post('/make-server-aa33bbfc/cvs', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { name, format, content, isPrimary } = await c.req.json()
    
    const cvId = `cv:${user.id}:${Date.now()}`
    const cvData = {
      id: cvId,
      name,
      format,
      content,
      isPrimary: isPrimary || false,
      userId: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // If this is set as primary, unset all other primary CVs
    if (isPrimary) {
      const existingCvs = await kv.getByPrefix(`cv:${user.id}:`)
      for (const cv of existingCvs) {
        if (cv.isPrimary) {
          await kv.set(cv.id, { ...cv, isPrimary: false })
        }
      }
    }

    await kv.set(cvId, cvData)

    // Update user CV count
    const userData = await kv.get(`user:${user.id}`)
    if (userData) {
      await kv.set(`user:${user.id}`, { 
        ...userData, 
        cv_count: (userData.cv_count || 0) + 1 
      })
    }

    return c.json({ cv: cvData })
  } catch (error) {
    console.log('Create CV error:', error)
    return c.json({ error: 'Failed to create CV' }, 500)
  }
})

app.delete('/make-server-aa33bbfc/cvs/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const cvId = c.req.param('id')
    
    // Verify CV belongs to user
    if (!cvId.startsWith(`cv:${user.id}:`)) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await kv.del(cvId)
    return c.json({ success: true })
  } catch (error) {
    console.log('Delete CV error:', error)
    return c.json({ error: 'Failed to delete CV' }, 500)
  }
})

// Job Recommendations Routes
app.get('/make-server-aa33bbfc/jobs/recommendations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Mock job recommendations - in production, this would use AI matching
    const recommendations = [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$120K - $150K',
        match: 95,
        tags: ['React', 'TypeScript', 'Remote'],
        posted: '2 days ago',
        description: 'Looking for an experienced frontend developer...'
      },
      {
        id: 2,
        title: 'Full Stack Engineer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        salary: '$100K - $130K',
        match: 88,
        tags: ['Node.js', 'React', 'MongoDB'],
        posted: '3 days ago',
        description: 'Join our growing team of engineers...'
      },
      {
        id: 3,
        title: 'React Developer',
        company: 'DesignStudio',
        location: 'Austin, TX',
        salary: '$90K - $110K',
        match: 82,
        tags: ['React', 'CSS', 'Figma'],
        posted: '1 week ago',
        description: 'Create beautiful user interfaces...'
      }
    ]

    return c.json({ jobs: recommendations })
  } catch (error) {
    console.log('Get job recommendations error:', error)
    return c.json({ error: 'Failed to fetch job recommendations' }, 500)
  }
})

// Interview History Routes
app.get('/make-server-aa33bbfc/interviews', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const interviews = await kv.getByPrefix(`interview:${user.id}:`)
    return c.json({ interviews })
  } catch (error) {
    console.log('Get interviews error:', error)
    return c.json({ error: 'Failed to fetch interviews' }, 500)
  }
})

app.post('/make-server-aa33bbfc/interviews', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { category, score, feedback, duration } = await c.req.json()
    
    const interviewId = `interview:${user.id}:${Date.now()}`
    const interviewData = {
      id: interviewId,
      category,
      score,
      feedback,
      duration,
      userId: user.id,
      created_at: new Date().toISOString()
    }

    await kv.set(interviewId, interviewData)

    // Update user interview count
    const userData = await kv.get(`user:${user.id}`)
    if (userData) {
      await kv.set(`user:${user.id}`, { 
        ...userData, 
        interview_count: (userData.interview_count || 0) + 1 
      })
    }

    return c.json({ interview: interviewData })
  } catch (error) {
    console.log('Create interview error:', error)
    return c.json({ error: 'Failed to save interview' }, 500)
  }
})

// User Profile Routes
app.get('/make-server-aa33bbfc/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (!user?.id || error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userData = await kv.get(`user:${user.id}`)
    return c.json({ user: userData })
  } catch (error) {
    console.log('Get profile error:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// Health check
app.get('/make-server-aa33bbfc/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

console.log('AI Career Suite server starting...')
Deno.serve(app.fetch)