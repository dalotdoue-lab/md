import mongoose from 'mongoose'

const { Schema } = mongoose

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email:       { type: String, required: true },
  name:        { type: String, default: '' },
  role:        { type: String, default: 'client', enum: ['client', 'admin'] },
  balance:     { type: Number, default: 0 },
  dailyProfit: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 },
}, { timestamps: true }))

const Project = mongoose.models.Project || mongoose.model('Project', new Schema({
  title:       { type: String, required: true, trim: true },
  category:    { type: String, default: 'Engineering' },
  status:      { type: String, default: 'completed', enum: ['planning', 'in_progress', 'completed', 'on_hold'] },
  client:      { type: String, default: '' },
  progress:    { type: Number, default: 100, min: 0, max: 100 },
  description: { type: String, default: '' },
  details:     { type: String, default: '' },
  image:       { type: String, default: '' },
  price:       { type: Number, default: 0, min: 0 },
  location:    { type: String, default: '' },
  link:        { type: String, default: '' },
  featured:    { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  dailyEarnings: { type: Number, default: 0 },
  minInvestment: { type: Number, default: 0 },
}, { timestamps: true }))

const Material = mongoose.models.Material || mongoose.model('Material', new Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, default: 'Other' },
  unit:        { type: String, default: 'kg' },
  price:       { type: Number, default: 0 },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  inStock:     { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
}, { timestamps: true }))

const Product = mongoose.models.Product || mongoose.model('Product', new Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, default: 'Irrigation' },
  price:       { type: Number, default: 0 },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  inStock:     { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
}, { timestamps: true }))

const Quote = mongoose.models.Quote || mongoose.model('Quote', new Schema({
  name:            { type: String, default: '' },
  email:           { type: String, default: '' },
  phone:           { type: String, default: '' },
  services:        [String],
  description:     { type: String, default: '' },
  estimatedBudget: { type: String, default: '' },
  status:          { type: String, default: 'new' },
}, { timestamps: true }))

const Message = mongoose.models.Message || mongoose.model('Message', new Schema({
  name:    { type: String, default: '' },
  email:   { type: String, default: '' },
  phone:   { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, default: '' },
}, { timestamps: true }))

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new Schema({
  invoiceId: { type: String, default: '' },
  project:   { type: String, default: '' },
  date:      { type: String, default: '' },
  amount:    { type: String, default: '' },
  status:    { type: String, default: 'pending', enum: ['paid', 'pending', 'overdue'] },
}, { timestamps: true }))

const SiteStats = mongoose.models.SiteStats || mongoose.model('SiteStats', new Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: String, default: '' },
}, { timestamps: true }))

export { UserProfile, Project, Material, Product, Quote, Message, Invoice, SiteStats }
