/**
 * Projects Routes
 * Handles engineering projects, smart systems, and logistics tracking
 * Connected to Supabase database
 */

const express = require('express')
const router = express.Router()
const { supabase } = require('../config/supabase')
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth')
const { projectValidation, paginationValidation, idParamValidation } = require('../middleware/validate')
const { asyncHandler } = require('../middleware/errorHandler')

// GET /api/projects - Get all projects with optional filters
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { status, category, client_id, page = 1, limit = 20 } = req.query

  let query = supabase
    .from('projects')
    .select(`
      *,
      client:users!projects_client_id_fkey (
        id,
        name,
        email,
        company
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (client_id) {
    query = query.eq('client_id', client_id)
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + parseInt(limit) - 1
  query = query.range(from, to)

  const { data: projects, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return res.status(500).json({ error: 'Failed to fetch projects' })
  }

  // Get total count
  let countQuery = supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  if (status) countQuery = countQuery.eq('status', status)
  if (category) countQuery = countQuery.eq('category', category)
  if (client_id) countQuery = countQuery.eq('client_id', client_id)

  const { count } = await countQuery

  res.json({
    success: true,
    projects,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  })
}))

// GET /api/projects/:id - Get single project
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:users!projects_client_id_fkey (
        id,
        name,
        email,
        company
      ),
      smart_systems:project_smart_systems (
        *,
        smart_system:smart_systems (*)
      ),
      logistics:project_logistics (
        *,
        logistics:logistics (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  res.json(project)
}))

// POST /api/projects - Create a new project
router.post('/', authenticate, projectValidation.create, asyncHandler(async (req, res) => {
  const { title, description, category, status, progress, start_date, end_date, budget, images } = req.body

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title,
      description,
      category,
      status: status || 'planning',
      progress: progress || 0,
      client_id: req.user.id,
      start_date,
      end_date,
      budget,
      images: images || []
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return res.status(500).json({ error: 'Failed to create project' })
  }

  res.status(201).json({
    success: true,
    project,
    message: 'Project created successfully'
  })
}))

// PATCH /api/projects/:id - Update a project
router.patch('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title, description, category, status, progress, start_date, end_date, budget, images } = req.body

  // Check if project exists
  const { data: existingProject } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!existingProject) {
    return res.status(404).json({ error: 'Project not found' })
  }

  // Check ownership (admin can edit any)
  if (existingProject.client_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to update this project' })
  }

  const { data: project, error } = await supabase
    .from('projects')
    .update({
      title: title || existingProject.title,
      description: description !== undefined ? description : existingProject.description,
      category: category || existingProject.category,
      status: status || existingProject.status,
      progress: progress !== undefined ? progress : existingProject.progress,
      start_date: start_date || existingProject.start_date,
      end_date: end_date || existingProject.end_date,
      budget: budget !== undefined ? budget : existingProject.budget,
      images: images || existingProject.images,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return res.status(500).json({ error: 'Failed to update project' })
  }

  res.json({
    success: true,
    project,
    message: 'Project updated successfully'
  })
}))

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params

  // Check if project exists
  const { data: existingProject } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!existingProject) {
    return res.status(404).json({ error: 'Project not found' })
  }

  // Check ownership (admin can delete any)
  if (existingProject.client_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this project' })
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return res.status(500).json({ error: 'Failed to delete project' })
  }

  res.json({
    success: true,
    message: 'Project deleted successfully'
  })
}))

// GET /api/projects/:id/smart-systems - Get smart systems for a project
router.get('/:id/smart-systems', asyncHandler(async (req, res) => {
  const { id } = req.params

  const { data: smartSystems, error } = await supabase
    .from('project_smart_systems')
    .select(`
      *,
      smart_system:smart_systems (*)
    `)
    .eq('project_id', id)

  if (error) {
    console.error('Error fetching smart systems:', error)
    return res.status(500).json({ error: 'Failed to fetch smart systems' })
  }

  res.json(smartSystems)
}))

// POST /api/projects/:id/smart-systems - Add smart system to project
router.post('/:id/smart-systems', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { smart_system_id, quantity } = req.body

  // Verify project exists
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const { data: projectSystem, error } = await supabase
    .from('project_smart_systems')
    .insert({
      project_id: id,
      smart_system_id,
      quantity: quantity || 1
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding smart system:', error)
    return res.status(500).json({ error: 'Failed to add smart system' })
  }

  res.status(201).json({
    success: true,
    project_smart_system: projectSystem,
    message: 'Smart system added to project'
  })
}))

// GET /api/projects/:id/logistics - Get logistics for a project
router.get('/:id/logistics', asyncHandler(async (req, res) => {
  const { id } = req.params

  const { data: logistics, error } = await supabase
    .from('project_logistics')
    .select(`
      *,
      logistics:logistics (*)
    `)
    .eq('project_id', id)

  if (error) {
    console.error('Error fetching logistics:', error)
    return res.status(500).json({ error: 'Failed to fetch logistics' })
  }

  res.json(logistics)
}))

// POST /api/projects/:id/logistics - Add logistics to project
router.post('/:id/logistics', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { logistics_id, quantity, scheduled_date } = req.body

  // Verify project exists
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const { data: projectLogistics, error } = await supabase
    .from('project_logistics')
    .insert({
      project_id: id,
      logistics_id,
      quantity: quantity || 1,
      scheduled_date
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding logistics:', error)
    return res.status(500).json({ error: 'Failed to add logistics' })
  }

  res.status(201).json({
    success: true,
    project_logistics: projectLogistics,
    message: 'Logistics added to project'
  })
}))

// GET /api/projects/stats/summary - Get project statistics
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('status, category, progress, budget')

  if (error) {
    console.error('Error fetching stats:', error)
    return res.status(500).json({ error: 'Failed to fetch project stats' })
  }

  const stats = {
    total: projects.length,
    planning: 0,
    in_progress: 0,
    completed: 0,
    on_hold: 0,
    total_budget: 0,
    avg_progress: 0
  }

  let totalProgress = 0

  projects.forEach(p => {
    stats[p.status] = (stats[p.status] || 0) + 1
    totalProgress += p.progress || 0
stats.total_budget += Number(p.budget || 0)
  })

  stats.avg_progress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0

  res.json(stats)
}))

module.exports = router



