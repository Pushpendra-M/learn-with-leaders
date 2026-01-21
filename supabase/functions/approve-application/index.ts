import { serve } from 'https://deno.land/std@0.168.0/http/server.ts' 
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from 'https://deno.land/x/djwt/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const HS256_SECRET = Deno.env.get('MY_HS256_SECRET')!
const secretKey = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(HS256_SECRET),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['verify']
)

interface JwtPayload {
  sub: string
  role?: string
  aud?: string
  exp?: number
}

interface RequestBody {
  action: string
  [key: string]: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(JSON.stringify({ message: 'CORS preflight' }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
  

  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()

    let payload: JwtPayload
    try {
      payload = await verify(token, secretKey) as any
      console.log('JWT verified successfully:', payload)
    } catch (error) {
      console.error('JWT verification error:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!payload.sub) {
      return new Response(
        JSON.stringify({ error: 'JWT missing sub claim' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (payload.role && payload.role !== 'admin' && payload.role !== 'mentor' && payload.role !== 'student') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Invalid role in JWT' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    const userId = payload.sub

    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
    
    if (userError || !userData || !userData.user) {
      console.error('User not found:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = {
      id: userData.user.id,
      ...userData.user
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, is_approved')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (profile.role !== 'admin' && profile.is_approved !== true) {
      return new Response(
        JSON.stringify({ error: 'Account not approved' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let body: RequestBody
    
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const action = url.searchParams.get('action')
      
      if (!action) {
        return new Response(
          JSON.stringify({ error: 'Missing action parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      body = { action }
      url.searchParams.forEach((value, key) => {
        if (key !== 'action') {
          try {
            body[key] = JSON.parse(value)
          } catch {
            body[key] = value
          }
        }
      })
    } else {
      try {
        body = await req.json()
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError)
        return new Response(
          JSON.stringify({ error: 'Invalid request body format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!body.action) {
        return new Response(
          JSON.stringify({ error: 'Missing action parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

        const { action } = body

    switch (action) {
      case 'create_application':
        return await handleCreateApplication(supabaseClient, user, profile, body)
      case 'get_applications':
        return await handleGetApplications(supabaseClient, user, profile, body)
      case 'get_my_applications':
        return await handleGetMyApplications(supabaseClient, user, profile, body)
      case 'review_application':
        return await handleApplicationReview(supabaseClient, user, profile, body)
      
      case 'create_enrollment':
        return await handleCreateEnrollment(supabaseClient, user, profile, body)
      case 'get_enrollments':
        return await handleGetEnrollments(supabaseClient, user, profile, body)
      case 'get_my_enrollments':
        return await handleGetMyEnrollments(supabaseClient, user, profile, body)
      case 'get_enrollment':
        return await handleGetEnrollment(supabaseClient, user, profile, body)
      case 'update_enrollment':
        return await handleUpdateEnrollment(supabaseClient, user, profile, body)
      
      case 'get_programs':
        return await handleGetPrograms(supabaseClient, user, profile, body)
      case 'get_my_programs':
        return await handleGetMyPrograms(supabaseClient, user, profile, body)
      case 'get_program':
        return await handleGetProgram(supabaseClient, user, profile, body)
      case 'create_program':
        return await handleCreateProgram(supabaseClient, user, profile, body)
      case 'update_program':
        return await handleUpdateProgram(supabaseClient, user, profile, body)
      
      case 'approve_user':
        return await handleApproveUser(supabaseClient, user, profile, body)
      case 'update_user_role':
        return await handleUpdateUserRole(supabaseClient, user, profile, body)
      
      case 'check_capacity':
        return await handleCheckCapacity(supabaseClient, user, profile, body)
      case 'grade_assessment':
        return await handleGradeAssessment(supabaseClient, user, profile, body)
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error: any) {
    console.error('Edge Function Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: process.env.DENO_ENV === 'development' ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleApplicationReview(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin' && profile.role !== 'mentor') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { applicationId, reviewAction } = body

  if (!applicationId || !reviewAction) {
    return new Response(
      JSON.stringify({ error: 'Missing applicationId or reviewAction' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!['approve', 'reject'].includes(reviewAction)) {
    return new Response(
      JSON.stringify({ error: 'Invalid reviewAction. Must be "approve" or "reject"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: application, error: appError } = await supabaseClient
    .from('applications')
    .select('*, program:programs(*), student:profiles!applications_student_id_fkey(*)')
    .eq('id', applicationId)
    .single()

  if (appError || !application) {
    return new Response(
      JSON.stringify({ error: 'Application not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (profile.role === 'mentor') {
    const isMentorViaMentorId = application.program?.mentor_id === user.id
    
    const { data: programMentor } = await supabaseClient
      .from('program_mentors')
      .select('id')
      .eq('program_id', application.program_id)
      .eq('mentor_id', user.id)
      .single()
    
    if (!isMentorViaMentorId && !programMentor) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to review this application' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  if (application.status !== 'pending') {
    return new Response(
      JSON.stringify({ error: `Application is already ${application.status}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const newStatus = reviewAction === 'approve' ? 'approved' : 'rejected'
  const { data: updatedApplication, error: updateError } = await supabaseClient
    .from('applications')
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', applicationId)
    .select()
    .single()

  if (updateError) {
    return new Response(
      JSON.stringify({ error: 'Failed to update application', details: updateError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (reviewAction === 'approve') {
    const { data: existingEnrollment } = await supabaseClient
      .from('enrollments')
      .select('id')
      .eq('program_id', application.program_id)
      .eq('student_id', application.student_id)
      .single()

    if (!existingEnrollment) {
      const capacityCheck = await checkProgramCapacity(
        supabaseClient,
        application.program_id
      )

      if (!capacityCheck.available) {
        await supabaseClient
          .from('applications')
          .update({ status: 'pending', reviewed_at: null, reviewed_by: null })
          .eq('id', applicationId)

        return new Response(
          JSON.stringify({ error: 'Program has reached maximum capacity' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: enrollmentError } = await supabaseClient
        .from('enrollments')
        .insert({
          program_id: application.program_id,
          student_id: application.student_id,
        })

      if (enrollmentError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create enrollment', details: enrollmentError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      application: updatedApplication,
      message: `Application ${reviewAction}d successfully`,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}


async function handleUpdateEnrollment(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin' && profile.role !== 'mentor') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { enrollmentId } = body

  if (!enrollmentId) {
    return new Response(
      JSON.stringify({ error: 'Missing enrollmentId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: enrollment, error: enrollmentError } = await supabaseClient
    .from('enrollments')
    .select('*, program:programs(*)')
    .eq('id', enrollmentId)
    .single()

  if (enrollmentError || !enrollment) {
    return new Response(
      JSON.stringify({ error: 'Enrollment not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (profile.role === 'mentor') {
    if (enrollment.program?.mentor_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to view this enrollment' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      enrollment: enrollment,
      message: 'Enrollment retrieved successfully (no fields to update)',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleApproveUser(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Only admins can approve users' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { userId } = body

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Missing userId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: updatedProfile, error: updateError } = await supabaseClient
    .from('profiles')
    .update({ is_approved: true, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (updateError) {
    return new Response(
      JSON.stringify({ error: 'Failed to approve user', details: updateError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      profile: updatedProfile,
      message: 'User approved successfully',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateUserRole(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Only admins can update user roles' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { userId, role } = body

  if (!userId || !role) {
    return new Response(
      JSON.stringify({ error: 'Missing userId or role' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!['student', 'mentor', 'admin'].includes(role)) {
    return new Response(
      JSON.stringify({ error: 'Invalid role. Must be "student", "mentor", or "admin"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: updatedProfile, error: updateError } = await supabaseClient
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (updateError) {
    return new Response(
      JSON.stringify({ error: 'Failed to update user role', details: updateError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      profile: updatedProfile,
      message: 'User role updated successfully',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCheckCapacity(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  const { programId } = body

  if (!programId) {
    return new Response(
      JSON.stringify({ error: 'Missing programId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const capacityCheck = await checkProgramCapacity(supabaseClient, programId)

  return new Response(
    JSON.stringify({
      success: true,
      ...capacityCheck,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGradeAssessment(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin' && profile.role !== 'mentor') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { submissionId, score, feedback } = body

  if (!submissionId || score === undefined) {
    return new Response(
      JSON.stringify({ error: 'Missing submissionId or score' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: submission, error: subError } = await supabaseClient
    .from('assessment_submissions')
    .select('*, assessment:assessments!inner(program_id, program:programs(*))')
    .eq('id', submissionId)
    .single()

  if (subError || !submission) {
    return new Response(
      JSON.stringify({ error: 'Submission not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (profile.role === 'mentor') {
    const { data: program } = await supabaseClient
      .from('programs')
      .select('mentor_id')
      .eq('id', submission.assessment.program_id)
      .single()

    if (!program || program.mentor_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to grade this submission' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  const { data: updatedSubmission, error: updateError } = await supabaseClient
    .from('assessment_submissions')
    .update({
      score: Number(score),
      feedback: feedback || null,
      graded_by: user.id,
      graded_at: new Date().toISOString(),
      status: 'graded',
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (updateError) {
    return new Response(
      JSON.stringify({ error: 'Failed to grade submission', details: updateError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      submission: updatedSubmission,
      message: 'Assessment graded successfully',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateApplication(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'student') {
    return new Response(
      JSON.stringify({ error: 'Only students can create applications' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { programId, applicationData } = body

  if (!programId || !applicationData) {
    return new Response(
      JSON.stringify({ error: 'Missing programId or applicationData' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: existingApp } = await supabaseClient
    .from('applications')
    .select('id')
    .eq('program_id', programId)
    .eq('student_id', user.id)
    .single()

  if (existingApp) {
    return new Response(
      JSON.stringify({ error: 'You have already applied to this program' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: application, error: appError } = await supabaseClient
    .from('applications')
    .insert({
      program_id: programId,
      student_id: user.id,
      application_data: applicationData,
      status: 'pending',
    })
    .select(`
      *,
      program:programs(*),
      student:profiles!applications_student_id_fkey(*)
    `)
    .single()

  if (appError) {
    return new Response(
      JSON.stringify({ error: 'Failed to create application', details: appError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      application,
      message: 'Application submitted successfully',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetApplications(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin' && profile.role !== 'mentor') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { programId } = body

  let query = supabaseClient
    .from('applications')
    .select(`
      *,
      program:programs(*),
      student:profiles!applications_student_id_fkey(*)
    `)
    .order('created_at', { ascending: false })

  if (programId) {
    query = query.eq('program_id', programId)
  }

  if (profile.role === 'mentor') {
    const { data: assignedProgramsViaMentorId } = await supabaseClient
      .from('programs')
      .select('id')
      .eq('mentor_id', user.id)

    const { data: assignedProgramsViaTable } = await supabaseClient
      .from('program_mentors')
      .select('program_id')
      .eq('mentor_id', user.id)

    const programIdsViaMentorId = (assignedProgramsViaMentorId || []).map((p: any) => p.id)
    const programIdsViaTable = (assignedProgramsViaTable || []).map((p: any) => p.program_id)
    
    const allProgramIds = [...new Set([...programIdsViaMentorId, ...programIdsViaTable])]

    if (allProgramIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, applications: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    query = query.in('program_id', allProgramIds)
  }

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch applications', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      applications: data || [],
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetMyApplications(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'student') {
    return new Response(
      JSON.stringify({ error: 'Only students can view their own applications' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('applications')
    .select(`
      *,
      program:programs(*)
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch applications', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      applications: data || [],
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetEnrollments(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin' && profile.role !== 'mentor') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { programId } = body

  let query = supabaseClient
    .from('enrollments')
    .select(`
      *,
      program:programs(*),
      student:profiles!enrollments_student_id_fkey(*)
    `)
    .order('enrolled_at', { ascending: false })

  if (programId) {
    query = query.eq('program_id', programId)
  }

  if (profile.role === 'mentor') {
    const { data: assignedProgramsViaMentorId } = await supabaseClient
      .from('programs')
      .select('id')
      .eq('mentor_id', user.id)

    const { data: assignedProgramsViaTable } = await supabaseClient
      .from('program_mentors')
      .select('program_id')
      .eq('mentor_id', user.id)

    const programIdsViaMentorId = (assignedProgramsViaMentorId || []).map((p: any) => p.id)
    const programIdsViaTable = (assignedProgramsViaTable || []).map((p: any) => p.program_id)
    
    const allProgramIds = [...new Set([...programIdsViaMentorId, ...programIdsViaTable])]

    if (allProgramIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, enrollments: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    query = query.in('program_id', allProgramIds)
  }

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch enrollments', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      enrollments: data || [],
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetMyEnrollments(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'student') {
    return new Response(
      JSON.stringify({ error: 'Only students can view their own enrollments' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('enrollments')
    .select(`
      *,
      program:programs(*)
    `)
    .eq('student_id', user.id)
    .order('enrolled_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch enrollments', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      enrollments: data || [],
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetEnrollment(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  const { programId, studentId } = body

  if (!programId) {
    return new Response(
      JSON.stringify({ error: 'Missing programId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const targetStudentId = studentId || user.id

  if (profile.role === 'student' && targetStudentId !== user.id) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('enrollments')
    .select('*')
    .eq('program_id', programId)
    .eq('student_id', targetStudentId)
    .maybeSingle()

  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ success: true, enrollment: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    return new Response(
      JSON.stringify({ error: 'Failed to fetch enrollment', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      enrollment: data,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateEnrollment(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  const { programId, studentId } = body

  const targetStudentId = studentId || user.id

  if (profile.role === 'student' && targetStudentId !== user.id) {
    return new Response(
      JSON.stringify({ error: 'Students can only enroll themselves' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (profile.role !== 'admin' && profile.role !== 'student') {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!programId) {
    return new Response(
      JSON.stringify({ error: 'Missing programId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (profile.role === 'student') {
    const { data: existingApp } = await supabaseClient
      .from('applications')
      .select('id, status')
      .eq('program_id', programId)
      .eq('student_id', user.id)
      .single()

    if (existingApp) {
      return new Response(
        JSON.stringify({ error: 'You have already applied to this program' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: existingEnrollment } = await supabaseClient
      .from('enrollments')
      .select('id')
      .eq('program_id', programId)
      .eq('student_id', user.id)
      .single()

    if (existingEnrollment) {
      return new Response(
        JSON.stringify({ error: 'Already enrolled in this program' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date().toISOString()
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .insert({
        program_id: programId,
        student_id: user.id,
        status: 'pending',
        application_data: {},
        submitted_at: now,
      })
      .select(`
        *,
        program:programs(*),
        student:profiles!applications_student_id_fkey(*)
      `)
      .single()

    if (appError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create application', details: appError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        application,
        message: 'Application submitted successfully. Waiting for approval.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: existingEnrollment } = await supabaseClient
    .from('enrollments')
    .select('id')
    .eq('program_id', programId)
    .eq('student_id', targetStudentId)
    .single()

  if (existingEnrollment) {
    return new Response(
      JSON.stringify({ error: 'Already enrolled in this program' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const capacityCheck = await checkProgramCapacity(supabaseClient, programId)
  if (!capacityCheck.available) {
    return new Response(
      JSON.stringify({ error: 'Program has reached maximum capacity' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: enrollment, error: enrollmentError } = await supabaseClient
    .from('enrollments')
    .insert({
      program_id: programId,
      student_id: targetStudentId,
    })
    .select()
    .single()

  if (enrollmentError) {
    return new Response(
      JSON.stringify({ error: 'Failed to create enrollment', details: enrollmentError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      enrollment,
      message: 'Enrollment created successfully',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetPrograms(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  const { status } = body

  let query = supabaseClient
    .from('programs')
    .select(`
      *,
      program_mentors(
        mentor:profiles!program_mentors_mentor_id_fkey(
          id,
          email,
          full_name,
          role
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (profile.role === 'student') {
    query = query.eq('status', 'open')
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch programs', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const programIds = (data || []).map((p: any) => p.id)
  const enrollmentCounts: Record<string, number> = {}
  
  if (programIds.length > 0) {
    const { data: enrollmentData } = await supabaseClient
      .from('enrollments')
      .select('program_id')
      .in('program_id', programIds)
    
    if (enrollmentData) {
      enrollmentData.forEach((enrollment: any) => {
        enrollmentCounts[enrollment.program_id] = (enrollmentCounts[enrollment.program_id] || 0) + 1
      })
    }
  }

  const programs = (data || []).map((program: any) => {
    const mentorArray = program.program_mentors && Array.isArray(program.program_mentors)
      ? program.program_mentors
          .map((pm: any) => pm.mentor)
          .filter((m: any) => m != null)
          .map((m: any) => ({
            id: m.id,
            email: m.email,
            full_name: m.full_name
          }))
      : []
    
    const { program_mentors, mentor_id, ...programWithoutMentor } = program
    
    const enrollmentsCount = enrollmentCounts[program.id] || 0
    const maxStudents = program.max_students ?? 0
    const isFull = maxStudents > 0 && enrollmentsCount >= maxStudents
    
    return {
      ...programWithoutMentor,
      status: program.status || 'draft',
      max_students: maxStudents,
      enrollments_count: enrollmentsCount,
      is_full: isFull,
      mentor: mentorArray,
    }
  })

  const filteredPrograms = profile.role === 'student'
    ? programs.filter((p: any) => !p.is_full)
    : programs

  return new Response(
    JSON.stringify({
      success: true,
      programs: filteredPrograms,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetMyPrograms(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  console.log('handleGetMyPrograms called:', { userId: user.id, role: profile.role })
  
  if (profile.role === 'student') {
    const { data, error } = await supabaseClient
      .from('enrollments')
      .select('program:programs(*)')
      .eq('student_id', user.id)

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch programs', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        programs: (data || []).map((e: any) => ({
          ...e.program,
          status: e.program.status || 'draft',
          max_students: e.program.max_students ?? 0,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else if (profile.role === 'mentor') {
    console.log('Fetching programs for mentor:', user.id)
    
    const { data: programsViaMentorId, error: errorViaMentorId } = await supabaseClient
      .from('programs')
      .select('id')
      .eq('mentor_id', user.id)

    const { data: programMentors, error: errorViaTable } = await supabaseClient
      .from('program_mentors')
      .select('program_id')
      .eq('mentor_id', user.id)

    if (errorViaMentorId) {
      console.error('Error fetching mentor programs via mentor_id:', errorViaMentorId)
    }
    
    if (errorViaTable) {
      console.error('Error fetching mentor programs via program_mentors:', errorViaTable)
    }

    const programIdsViaMentorId = (programsViaMentorId || []).map((p: any) => p.id)
    const programIdsViaTable = (programMentors || []).map((pm: any) => pm.program_id)
    
    const allProgramIds = [...new Set([...programIdsViaMentorId, ...programIdsViaTable])]

    if (allProgramIds.length === 0) {
      console.log('No programs found for mentor')
      return new Response(
        JSON.stringify({
          success: true,
          programs: [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: allPrograms, error: fetchError } = await supabaseClient
      .from('programs')
      .select(`
        *,
        program_mentors(
          mentor:profiles!program_mentors_mentor_id_fkey(
            id,
            email,
            full_name,
            role
          )
        )
      `)
      .in('id', allProgramIds)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching programs:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch programs', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const legacyMentorIds = [...new Set(
      (allPrograms || [])
        .filter((p: any) => p.mentor_id)
        .map((p: any) => p.mentor_id)
    )]
    
    let legacyMentorsMap: Record<string, any> = {}
    if (legacyMentorIds.length > 0) {
      const { data: legacyMentors } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name, role')
        .in('id', legacyMentorIds)
      
      if (legacyMentors) {
        legacyMentorsMap = legacyMentors.reduce((acc: Record<string, any>, mentor: any) => {
          acc[mentor.id] = {
            id: mentor.id,
            email: mentor.email,
            full_name: mentor.full_name
          }
          return acc
        }, {})
      }
    }

    const enrollmentCounts: Record<string, number> = {}
    if (allProgramIds.length > 0) {
      const { data: enrollmentData } = await supabaseClient
        .from('enrollments')
        .select('program_id')
        .in('program_id', allProgramIds)
      
      if (enrollmentData) {
        enrollmentData.forEach((enrollment: any) => {
          enrollmentCounts[enrollment.program_id] = (enrollmentCounts[enrollment.program_id] || 0) + 1
        })
      }
    }

    const programs = (allPrograms || []).map((program: any) => {
      const mentorArray = program.program_mentors && Array.isArray(program.program_mentors)
        ? program.program_mentors
            .map((pm: any) => pm.mentor)
            .filter((m: any) => m != null)
            .map((m: any) => ({
              id: m.id,
              email: m.email,
              full_name: m.full_name
            }))
        : []
      
      if (program.mentor_id && legacyMentorsMap[program.mentor_id]) {
        const mentorExists = mentorArray.some((m: any) => m.id === program.mentor_id)
        if (!mentorExists) {
          mentorArray.push(legacyMentorsMap[program.mentor_id])
        }
      }
      
      const { program_mentors, ...programWithoutMentors } = program
      
      const enrollmentsCount = enrollmentCounts[program.id] || 0
      const maxStudents = program.max_students ?? 0
      
      return {
        ...programWithoutMentors,
        status: program.status || 'draft',
        max_students: maxStudents,
        enrollments_count: enrollmentsCount,
        mentor: mentorArray,
      }
    })

    console.log('Returning programs:', programs.length)
    return new Response(
      JSON.stringify({
        success: true,
        programs,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else {
    return await handleGetPrograms(supabaseClient, user, profile, body)
  }
}

async function handleGetProgram(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  const { programId } = body

  if (!programId) {
    return new Response(
      JSON.stringify({ error: 'Missing programId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data, error } = await supabaseClient
    .from('programs')
    .select(`
      *,
      program_mentors(
        mentor:profiles!program_mentors_mentor_id_fkey(
          id,
          email,
          full_name,
          role
        )
      )
    `)
    .eq('id', programId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Program not found', details: error.message }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (profile.role === 'student') {
    const status = data.status || 'draft'
    if (status !== 'open') {
      return new Response(
        JSON.stringify({ error: 'Program not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  if (profile.role === 'mentor') {
    const isMentorViaMentorId = data.mentor_id === user.id
    
    const { data: programMentor } = await supabaseClient
      .from('program_mentors')
      .select('id')
      .eq('program_id', programId)
      .eq('mentor_id', user.id)
      .single()
    
    if (!isMentorViaMentorId && !programMentor) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to access this program' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  const { count: enrollmentsCount } = await supabaseClient
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('program_id', programId)

  const mentorArray = data.program_mentors && Array.isArray(data.program_mentors)
    ? data.program_mentors
        .map((pm: any) => pm.mentor)
        .filter((m: any) => m != null)
        .map((m: any) => ({
          id: m.id,
          email: m.email,
          full_name: m.full_name
        }))
    : []

  if (data.mentor_id) {
    const mentorExists = mentorArray.some((m: any) => m.id === data.mentor_id)
    if (!mentorExists) {
      const { data: legacyMentor } = await supabaseClient
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', data.mentor_id)
        .single()
      
      if (legacyMentor) {
        mentorArray.push({
          id: legacyMentor.id,
          email: legacyMentor.email,
          full_name: legacyMentor.full_name
        })
      }
    }
  }

  const { program_mentors, mentor_id, ...programWithoutMentors } = data

  const maxStudents = data.max_students ?? 0
  const currentEnrollments = enrollmentsCount || 0
  const isFull = maxStudents > 0 && currentEnrollments >= maxStudents

  return new Response(
    JSON.stringify({
      success: true,
      program: {
        ...programWithoutMentors,
        status: data.status || 'draft',
        max_students: maxStudents,
        enrollments_count: currentEnrollments,
        is_full: isFull,
        mentor: mentorArray,
      },
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateProgram(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Only admins can create programs' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { title, description, startDate, endDate, maxStudents, status, mentorIds } = body

  if (!title) {
    return new Response(
      JSON.stringify({ error: 'Missing title' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: program, error: programError } = await supabaseClient
    .from('programs')
    .insert({
      title,
      description: description || null,
      start_date: startDate || null,
      end_date: endDate || null,
      max_students: maxStudents || null,
      status: status || 'draft',
      created_by: user.id,
      mentor_id: null,
    })
    .select()
    .single()

  if (programError) {
    return new Response(
      JSON.stringify({ error: 'Failed to create program', details: programError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (Array.isArray(mentorIds) && mentorIds.length > 0) {
    const programMentors = mentorIds.map((mentorId: string) => ({
      program_id: program.id,
      mentor_id: mentorId,
    }))

    const { error: mentorsError } = await supabaseClient
      .from('program_mentors')
      .insert(programMentors)

    if (mentorsError) {
      await supabaseClient.from('programs').delete().eq('id', program.id)
      return new Response(
        JSON.stringify({ error: 'Failed to assign mentors', details: mentorsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      program,
      message: 'Program created successfully',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateProgram(
  supabaseClient: any,
  user: any,
  profile: any,
  body: RequestBody
) {
  if (profile.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Only admins can update programs' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { programId, title, description, startDate, endDate, maxStudents, status, mentorIds } = body

  if (!programId) {
    return new Response(
      JSON.stringify({ error: 'Missing programId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!title) {
    return new Response(
      JSON.stringify({ error: 'Missing title' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: existingProgram, error: checkError } = await supabaseClient
    .from('programs')
    .select('id')
    .eq('id', programId)
    .single()

  if (checkError || !existingProgram) {
    return new Response(
      JSON.stringify({ error: 'Program not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: program, error: programError } = await supabaseClient
    .from('programs')
    .update({
      title,
      description: description || null,
      start_date: startDate || null,
      end_date: endDate || null,
      max_students: maxStudents || null,
      status: status || 'draft',
      mentor_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', programId)
    .select()
    .single()

  if (programError) {
    return new Response(
      JSON.stringify({ error: 'Failed to update program', details: programError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error: deleteError } = await supabaseClient
    .from('program_mentors')
    .delete()
    .eq('program_id', programId)

  if (deleteError) {
    return new Response(
      JSON.stringify({ error: 'Failed to update mentors', details: deleteError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (Array.isArray(mentorIds) && mentorIds.length > 0) {
    const programMentors = mentorIds.map((mentorId: string) => ({
      program_id: programId,
      mentor_id: mentorId,
    }))

    const { error: mentorsError } = await supabaseClient
      .from('program_mentors')
      .insert(programMentors)

    if (mentorsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to assign mentors', details: mentorsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  const { data: updatedProgram, error: fetchError } = await supabaseClient
    .from('programs')
    .select(`
      *,
      program_mentors(
        mentor:profiles!program_mentors_mentor_id_fkey(
          id,
          email,
          full_name,
          role
        )
      )
    `)
    .eq('id', programId)
    .single()

  if (fetchError) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch updated program', details: fetchError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const mentorArray = updatedProgram.program_mentors && Array.isArray(updatedProgram.program_mentors)
    ? updatedProgram.program_mentors
        .map((pm: any) => pm.mentor)
        .filter((m: any) => m != null)
        .map((m: any) => ({
          id: m.id,
          email: m.email,
          full_name: m.full_name
        }))
    : []

  const { program_mentors, mentor_id, ...programWithoutMentors } = updatedProgram

  const finalProgram = {
    ...programWithoutMentors,
    status: updatedProgram.status || 'draft',
    max_students: updatedProgram.max_students ?? 0,
    mentor: mentorArray,
  }

  return new Response(
    JSON.stringify({
      success: true,
      program: finalProgram,
      message: 'Program updated successfully',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function checkProgramCapacity(supabaseClient: any, programId: string) {
  const { data: program, error: programError } = await supabaseClient
    .from('programs')
    .select('max_students')
    .eq('id', programId)
    .single()

  if (programError || !program) {
    return { available: false, current: 0, max: 0, error: 'Program not found' }
  }

  const { count } = await supabaseClient
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('program_id', programId)

  const current = count || 0
  const max = program.max_students || 0
  const available = max === 0 || max === null || current < max

  return { available, current, max }
}