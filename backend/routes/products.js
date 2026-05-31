/**
 * Products Routes
 * Handles IoT, irrigation, automation products and marketplace
 * Connected to Supabase database
 */

const express = require('express')
const router = express.Router()
const { supabase } = require('../config/supabase')
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth')
const { productValidation, paginationValidation, idParamValidation } = require('../middleware/validate')
const { asyncHandler } = require('../middleware/errorHandler')

// GET /api/products - Get all products with optional filters
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { category, in_stock, search, page = 1, limit = 20 } = req.query

  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  if (in_stock !== undefined) {
    query = query.eq('in_stock', in_stock === 'true')
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + parseInt(limit) - 1
  query = query.range(from, to)

  const { data: products, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return res.status(500).json({ error: 'Failed to fetch products' })
  }

  // Get total count
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (category && category !== 'All') countQuery = countQuery.eq('category', category)
  if (in_stock !== undefined) countQuery = countQuery.eq('in_stock', in_stock === 'true')

  const { count } = await countQuery

  res.json({
    success: true,
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  })
}))

// GET /api/products/categories - Get unique product categories
router.get('/categories', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return res.status(500).json({ error: 'Failed to fetch categories' })
  }

  const categories = [...new Set(data.map(item => item.category).filter(Boolean))]
  res.json(categories)
}))

// GET /api/products/:id - Get single product
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  res.json(product)
}))

// POST /api/products - Create a new product (admin)
router.post('/', authenticate, requireAdmin, productValidation.create, asyncHandler(async (req, res) => {
  const { name, description, price, category, image_url, specifications, in_stock, stock_quantity } = req.body

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      description,
      price,
      category,
      image_url,
      specifications: specifications || {},
      in_stock: in_stock !== undefined ? in_stock : true,
      stock_quantity: stock_quantity || 0
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return res.status(500).json({ error: 'Failed to create product' })
  }

  res.status(201).json({
    success: true,
    product,
    message: 'Product created successfully'
  })
}))

// PATCH /api/products/:id - Update a product (admin)
router.patch('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, description, price, category, image_url, specifications, in_stock, stock_quantity } = req.body

  // Check if product exists
  const { data: existingProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!existingProduct) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const { data: product, error } = await supabase
    .from('products')
    .update({
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      price: price !== undefined ? price : existingProduct.price,
      category: category || existingProduct.category,
      image_url: image_url !== undefined ? image_url : existingProduct.image_url,
      specifications: specifications || existingProduct.specifications,
      in_stock: in_stock !== undefined ? in_stock : existingProduct.in_stock,
      stock_quantity: stock_quantity !== undefined ? stock_quantity : existingProduct.stock_quantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return res.status(500).json({ error: 'Failed to update product' })
  }

  res.json({
    success: true,
    product,
    message: 'Product updated successfully'
  })
}))

// DELETE /api/products/:id - Delete a product (admin)
router.delete('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return res.status(500).json({ error: 'Failed to delete product' })
  }

  res.json({
    success: true,
    message: 'Product deleted successfully'
  })
}))

// PATCH /api/products/:id/stock - Update stock quantity
router.patch('/:id/stock', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { stock_quantity, in_stock } = req.body

  // Check if product exists
  const { data: existingProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!existingProduct) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const { data: product, error } = await supabase
    .from('products')
    .update({
      stock_quantity: stock_quantity !== undefined ? stock_quantity : existingProduct.stock_quantity,
      in_stock: in_stock !== undefined ? in_stock : existingProduct.in_stock,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating stock:', error)
    return res.status(500).json({ error: 'Failed to update stock' })
  }

  res.json({
    success: true,
    product,
    message: 'Stock updated successfully'
  })
}))

module.exports = router



