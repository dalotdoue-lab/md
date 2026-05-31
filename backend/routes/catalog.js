const express = require('express')
const router = express.Router()
const { firebaseAuth, requireAdmin } = require('../middleware/firebaseAuth')
const Material = require('../models/Material')
const Product = require('../models/Product')
const Project = require('../models/Project')

function crudRouter(Model, sortField = 'name') {
  const r = express.Router()

  r.get('/', async (req, res) => {
    try {
      const items = await Model.find().sort({ [sortField]: 1 })
      res.json({ success: true, data: items })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  r.get('/:id', async (req, res) => {
    try {
      const item = await Model.findById(req.params.id)
      if (!item) return res.status(404).json({ error: 'Not found' })
      res.json({ success: true, data: item })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  r.post('/', firebaseAuth, requireAdmin, async (req, res) => {
    try {
      const item = await Model.create(req.body)
      res.status(201).json({ success: true, data: item })
    } catch (err) { res.status(400).json({ error: err.message }) }
  })

  r.put('/:id', firebaseAuth, requireAdmin, async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) return res.status(404).json({ error: 'Not found' })
      res.json({ success: true, data: item })
    } catch (err) { res.status(400).json({ error: err.message }) }
  })

  r.delete('/:id', firebaseAuth, requireAdmin, async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id)
      if (!item) return res.status(404).json({ error: 'Not found' })
      res.json({ success: true, message: 'Deleted' })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  return r
}

router.use('/materials', crudRouter(Material, 'name'))
router.use('/products', crudRouter(Product, 'name'))
router.use('/projects', crudRouter(Project, 'title'))

module.exports = router
