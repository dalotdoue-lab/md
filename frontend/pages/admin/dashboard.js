import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api'

const PROJECT_STATUSES = ['planning', 'in_progress', 'completed', 'on_hold']
const CATEGORIES = ['Investment', 'Engineering', 'Technology', 'Agriculture', 'Infrastructure']

function fmt(n) { return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-ink/5 text-ink border border-line',
    green: 'bg-olive/15 text-olive-deep border border-olive/20',
    yellow: 'bg-clay/15 text-clay-deep border border-clay/20',
    red: 'bg-clay-deep/15 text-clay-deep border border-clay-deep/20',
    gray: 'bg-ink/5 text-ink-soft border border-line',
    purple: 'bg-ink/10 text-ink border border-line',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${colors[color] || colors.blue}`}>
      {children}
    </span>
  )
}

function StatCard({ label, value, icon, color = 'blue' }) {
  const borderColors = {
    blue: 'border-l-2 border-l-ink',
    green: 'border-l-2 border-l-olive',
    yellow: 'border-l-2 border-l-clay',
    purple: 'border-l-2 border-l-ink-soft',
  }
  return (
    <div className={`bg-paper rounded-lg shadow-card border border-line p-6 flex items-center justify-between transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5 ${borderColors[color]}`}>
      <div>
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-label">{label}</p>
        <p className="text-3xl font-heading text-ink mt-2">{value}</p>
      </div>
      <div className="text-clay">
        {icon}
      </div>
    </div>
  )
}

function AdminFlowCard({ title, value, label, color = 'blue' }) {
  const colors = {
    blue: 'bg-bone text-ink border-line',
    green: 'bg-olive/10 text-olive-deep border-olive/20',
    yellow: 'bg-clay/10 text-clay-deep border-clay/20',
    slate: 'bg-bone text-ink-soft border-line',
  }

  return (
    <div className={`rounded-md border p-4 ${colors[color] || colors.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-label opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-heading">{value}</p>
      <p className="mt-2 text-sm font-semibold">{title}</p>
    </div>
  )
}

function AdminOperationsOverview({ pendingCount, approvedVolume, clientsCount, projectsCount }) {
  const flow = [
    { title: 'Project setup', text: 'Create project, define yield terms, upload visual proof.' },
    { title: 'Investor action', text: 'Client commits capital and submits payment reference.' },
    { title: 'Admin approval', text: 'Operations validates funds and activates the position.' },
    { title: 'Client reporting', text: 'Dashboard metrics and withdrawal instructions update.' },
  ]

  return (
    <section className="rounded-lg border border-line bg-paper p-6 shadow-card">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="eyebrow mb-4">Admin Command Center</div>
          <h1 className="mt-2 text-3xl font-heading text-ink leading-tight">Investment operations dashboard</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Manage client capital, payment approvals, investment projects, and client-facing instructions from one operating view.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 lg:max-w-xl">
          <AdminFlowCard label="Queue" title="Pending payments" value={pendingCount} color="yellow" />
          <AdminFlowCard label="Approved" title="Invested volume" value={fmt(approvedVolume)} color="green" />
          <AdminFlowCard label="Clients" title="Registered investors" value={clientsCount} color="blue" />
          <AdminFlowCard label="Catalog" title="Managed projects" value={projectsCount} color="slate" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        {flow.map((step, index) => (
          <div key={step.title} className="rounded-md bg-bone p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-xs font-heading text-paper">{index + 1}</div>
            <p className="mt-3 text-sm font-heading text-ink">{step.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function useImageUpload(folder) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = useCallback((file, onDone) => {
    if (!file) return
    const path = `${folder}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)
    setUploading(true)
    setProgress(0)
    task.on(
      'state_changed',
      snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      err => { alert('Upload failed: ' + err.message); setUploading(false) },
      async () => { const url = await getDownloadURL(task.snapshot.ref); onDone(url); setUploading(false) }
    )
  }, [folder])

  return { uploading, progress, upload }
}

export default function AdminDashboard() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  // Redirection guard
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    if (userProfile && userProfile.role !== 'admin') router.push('/403')
  }, [user, userProfile, authLoading, router])

  // Data states
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [investments, setInvestments] = useState([])
  const [settings, setSettings] = useState({ paybill: '', accountNumber: '', withdrawalInstructions: '' })
  const [loadingData, setLoadingData] = useState(true)

  // Collapsed sections togglers
  const [showOldCatalog, setShowOldCatalog] = useState(false)
  const [materials, setMaterials] = useState([])
  const [products, setProducts] = useState([])

  // Project form state
  const [showProjForm, setShowProjForm] = useState(false)
  const [editingProjId, setEditingProjId] = useState(null)
  const emptyProject = {
    title: '', category: 'Investment', status: 'in_progress', client: '',
    location: '', price: 0, progress: 0, order: 0, link: '', description: '',
    details: '', image: '', featured: false, dailyEarnings: 0, minInvestment: 0
  }
  const [projForm, setProjForm] = useState(emptyProject)
  const [savingProj, setSavingProj] = useState(false)
  const projUpload = useImageUpload('projects')

  // Client edit state
  const [editingClient, setEditingClient] = useState(null)
  const [clientForm, setClientForm] = useState({ balance: 0, dailyProfit: 0, totalInvested: 0 })
  const [savingClient, setSavingClient] = useState(false)

  // Settings state
  const [savingSettings, setSavingSettings] = useState(false)

  // Fetch all backend data
  const loadAll = useCallback(async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const [projs, cls, invs, sets] = await Promise.all([
        apiGet('/api/catalog/projects'),
        apiGet('/api/invest-portal/admin/users'),
        apiGet('/api/invest-portal/admin/investments'),
        apiGet('/api/invest-portal/admin/settings'),
      ])
      setProjects((projs.data || []).map(d => ({ ...d, id: d._id })))
      setClients(cls.data || [])
      setInvestments(invs.data || [])
      if (sets.success) {
        setSettings(sets.data)
      }
    } catch (err) {
      console.error('Error loading admin dashboard data', err)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  // Lazy load old catalog data
  const loadOldCatalogData = async () => {
    try {
      const [mats, prods] = await Promise.all([
        apiGet('/api/catalog/materials'),
        apiGet('/api/catalog/products')
      ])
      setMaterials(mats.data || [])
      setProducts(prods.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (showOldCatalog && materials.length === 0) {
      loadOldCatalogData()
    }
  }, [showOldCatalog])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // ── Project Handlers ─────────────────────────────────────────────────────
  const startNewProj = () => {
    setEditingProjId(null)
    setProjForm(emptyProject)
    setShowProjForm(true)
  }

  const startEditProj = (p) => {
    setEditingProjId(p.id)
    setProjForm({ ...emptyProject, ...p })
    setShowProjForm(true)
  }

  const handleProjChange = (e) => {
    const { name, value, type, checked } = e.target
    const v = type === 'checkbox' ? checked : ['price', 'progress', 'order', 'dailyEarnings', 'minInvestment'].includes(name) ? Number(value) : value
    setProjForm(prev => ({ ...prev, [name]: v }))
  }

  const handleProjImageFile = (file) => {
    projUpload.upload(file, url => setProjForm(prev => ({ ...prev, image: url })))
  }

  const saveProject = async (e) => {
    e.preventDefault()
    setSavingProj(true)
    try {
      if (editingProjId) {
        await apiPut(`/api/catalog/projects/${editingProjId}`, projForm)
      } else {
        await apiPost('/api/catalog/projects', projForm)
      }
      setShowProjForm(false)
      setEditingProjId(null)
      setProjForm(emptyProject)
      await loadAll()
    } catch (err) {
      alert('Error saving project: ' + err.message)
    } finally {
      setSavingProj(false)
    }
  }

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await apiDelete(`/api/catalog/projects/${id}`)
      await loadAll()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  // ── Client Handlers ──────────────────────────────────────────────────────
  const startEditClient = (client) => {
    setEditingClient(client)
    setClientForm({
      balance: client.balance || 0,
      dailyProfit: client.dailyProfit || 0,
      totalInvested: client.totalInvested || 0,
    })
  }

  const saveClientMetrics = async (e) => {
    e.preventDefault()
    setSavingClient(true)
    try {
      await apiPut(`/api/invest-portal/admin/users/${editingClient._id}`, clientForm)
      setEditingClient(null)
      await loadAll()
    } catch (err) {
      alert('Failed to update client: ' + err.message)
    } finally {
      setSavingClient(false)
    }
  }

  // ── Investment Approval Handlers ──────────────────────────────────────────
  const approveInvestment = async (id) => {
    if (!window.confirm('Approve payment & trigger client success screen?')) return
    try {
      await apiPut(`/api/invest-portal/admin/investments/${id}/approve`)
      await loadAll()
    } catch (err) {
      alert('Approval failed: ' + err.message)
    }
  }

  const rejectInvestment = async (id) => {
    if (!window.confirm('Reject this payment request?')) return
    try {
      await apiPut(`/api/invest-portal/admin/investments/${id}/reject`)
      await loadAll()
    } catch (err) {
      alert('Rejection failed: ' + err.message)
    }
  }

  // ── Settings Handlers ─────────────────────────────────────────────────────
  const saveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      await apiPut('/api/invest-portal/admin/settings', settings)
      alert('Settings updated successfully!')
      await loadAll()
    } catch (err) {
      alert('Failed to update settings: ' + err.message)
    } finally {
      setSavingSettings(false)
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bone">
        <div className="w-10 h-10 border-2 border-olive border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pendingInvs = investments.filter(inv => inv.status === 'pending')
  const totalApprovedVol = investments.filter(i => i.status === 'approved').reduce((sum, i) => sum + (i.amount || 0), 0)

  return (
    <>
      <Head><title>Admin Panel — Let Investments</title></Head>
      <div className="min-h-screen bg-bone text-ink-soft">
        
        {/* Navigation Top bar */}
        <div className="sticky top-0 z-40 border-b border-paper/10 bg-ink px-4 py-3 text-paper">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-paper text-lg font-heading text-ink">L</div>
            <div>
              <p className="font-heading leading-none">Let Investments</p>
              <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-label text-paper/50">Admin Portal</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs font-medium">
            <a href="#admin-overview" className="rounded-md bg-paper/10 px-3 py-2 text-paper hover:bg-paper/15">Overview</a>
            <a href="#projects" className="rounded-md px-3 py-2 text-paper/70 hover:bg-paper/10 hover:text-paper">Projects</a>
            <a href="#approvals" className="rounded-md px-3 py-2 text-paper/70 hover:bg-paper/10 hover:text-paper">Approvals</a>
            <a href="#clients" className="rounded-md px-3 py-2 text-paper/70 hover:bg-paper/10 hover:text-paper">Clients</a>
            <a href="#settings" className="rounded-md px-3 py-2 text-paper/70 hover:bg-paper/10 hover:text-paper">Settings</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-paper/70 md:block">{user?.email}</span>
            <button onClick={signOut} className="rounded-md bg-paper/10 px-4 py-2 text-sm font-medium transition hover:bg-paper/20">
              Sign out
            </button>
          </div>
          </div>
        </div>

        <div id="admin-overview" className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <AdminOperationsOverview
            pendingCount={pendingInvs.length}
            approvedVolume={totalApprovedVol}
            clientsCount={clients.length}
            projectsCount={projects.length}
          />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Active Projects"
              value={projects.length}
              color="blue"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            />
            <StatCard
              label="Registered Clients"
              value={clients.length}
              color="purple"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <StatCard
              label="Pending Payments"
              value={pendingInvs.length}
              color="yellow"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard
              label="Approved Investments"
              value={fmt(totalApprovedVol)}
              color="green"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>

          {/* 1. PROJECTS MANAGEMENT SECTION (At the top) */}
          <section id="projects" className="bg-paper rounded-lg shadow-card border border-line p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-2xl font-heading text-ink">Projects Management</h2>
                <p className="text-sm text-ink-soft mt-1">Add, update, or remove investment options</p>
              </div>
              {!showProjForm && (
                <button onClick={startNewProj} className="bg-ink hover:bg-olive-deep text-paper font-semibold text-sm px-5 py-2.5 rounded-md flex items-center gap-2 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Project
                </button>
              )}
            </div>

            {/* Project Edit / Create Form */}
            {showProjForm && (
              <form onSubmit={saveProject} className="bg-bone border border-line rounded-md p-6 space-y-4">
                <h3 className="font-heading text-lg text-ink">{editingProjId ? 'Edit Project Details' : 'Create New Investment Project'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Project Title</label>
                    <input name="title" value={projForm.title} onChange={handleProjChange} className="input-field text-sm" placeholder="e.g. Rice Husks Biomass Energy, Kisumu" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Category</label>
                    <select name="category" value={projForm.category} onChange={handleProjChange} className="input-field text-sm">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Status</label>
                    <select name="status" value={projForm.status} onChange={handleProjChange} className="input-field text-sm">
                      {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Client Name (Optional)</label>
                    <input name="client" value={projForm.client} onChange={handleProjChange} className="input-field text-sm" placeholder="e.g. East Africa AgriCo" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Location</label>
                    <input name="location" value={projForm.location} onChange={handleProjChange} className="input-field text-sm" placeholder="e.g. Kisumu, Kenya" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Target Budget / Valuation ($)</label>
                    <input type="number" name="price" value={projForm.price} onChange={handleProjChange} className="input-field text-sm" min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Funding Progress (%)</label>
                    <input type="number" name="progress" value={projForm.progress} onChange={handleProjChange} className="input-field text-sm" min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Daily ROI / Earnings per Client ($)</label>
                    <input type="number" name="dailyEarnings" value={projForm.dailyEarnings} onChange={handleProjChange} className="input-field text-sm" min="0" step="0.01" placeholder="Daily earnings paid to client" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Minimum Investment ($)</label>
                    <input type="number" name="minInvestment" value={projForm.minInvestment} onChange={handleProjChange} className="input-field text-sm" min="0" step="0.01" placeholder="Minimum allowed investment" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Display Order (Sorting)</label>
                    <input type="number" name="order" value={projForm.order} onChange={handleProjChange} className="input-field text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink-soft mb-1">External Link / Slug</label>
                    <input name="link" value={projForm.link} onChange={handleProjChange} className="input-field text-sm" placeholder="/projects/kisumu-biomass" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Short Card Description</label>
                    <textarea name="description" value={projForm.description} onChange={handleProjChange} rows={2} className="input-field text-sm resize-none" placeholder="Brief summary for catalog listing..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Detailed Write-Up (ROI terms, risk factors, etc.)</label>
                    <textarea name="details" value={projForm.details} onChange={handleProjChange} rows={4} className="input-field text-sm resize-none" placeholder="Provide details about daily payouts, project timeline, and structure..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Project Banner Image</label>
                    <div className="flex items-center gap-4 flex-wrap mt-1">
                      <label className="cursor-pointer bg-paper border border-line hover:bg-bone rounded-md px-4 py-2.5 text-sm font-semibold text-ink transition">
                        {projUpload.uploading ? `Uploading (${projUpload.progress}%)` : 'Upload Banner'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleProjImageFile(e.target.files[0])} disabled={projUpload.uploading} />
                      </label>
                      {projForm.image && <img src={projForm.image} alt="Preview" className="w-20 h-16 rounded-md object-cover border border-line" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="featured" name="featured" checked={!!projForm.featured} onChange={handleProjChange} className="w-4 h-4 accent-olive" />
                    <label htmlFor="featured" className="text-sm font-medium text-ink-soft">Feature this project on home catalog</label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={savingProj || projUpload.uploading} className="bg-ink hover:bg-olive-deep text-paper font-semibold text-sm px-6 py-2.5 rounded-md disabled:opacity-60 transition">
                    {savingProj ? 'Saving...' : editingProjId ? 'Update Project' : 'Add Project'}
                  </button>
                  <button type="button" onClick={() => { setShowProjForm(false); setEditingProjId(null) }} className="px-6 py-2.5 text-sm rounded-md border border-line text-ink-soft hover:bg-bone transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Projects Table */}
            {loadingData ? (
              <div className="text-center py-6 text-ink-muted">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10 text-ink-muted bg-bone rounded-lg border border-dashed border-line">
                No active projects. Click "Add Project" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto border border-line rounded-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bone border-b border-line">
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Banner</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Project Title</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Category</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Daily Profit Payout</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Min Invest</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Status</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {projects.map(p => (
                      <tr key={p.id} className="hover:bg-bone">
                        <td className="px-6 py-4">
                          {p.image ? (
                            <img src={p.image} alt={p.title} className="w-14 h-10 rounded-md object-cover border border-line" />
                          ) : (
                            <div className="w-14 h-10 rounded-md bg-bone flex items-center justify-center text-ink-muted text-xs font-semibold">No Image</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-ink">{p.title}</td>
                        <td className="px-6 py-4 text-sm text-ink-soft">{p.category}</td>
                        <td className="px-6 py-4 font-semibold text-olive-deep">{fmt(p.dailyEarnings)}/day</td>
                        <td className="px-6 py-4 text-sm font-medium text-ink-soft">{fmt(p.minInvestment)}</td>
                        <td className="px-6 py-4">
                          <Badge color={p.status === 'completed' ? 'green' : p.status === 'in_progress' ? 'blue' : 'yellow'}>
                            {p.status?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => startEditProj(p)} className="p-2 text-ink hover:bg-ink/5 rounded-md transition" title="Edit">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => deleteProject(p.id)} className="p-2 text-clay hover:bg-clay/10 rounded-md transition" title="Delete">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 2. PENDING PAYMENTS CONFIRMATION QUEUE */}
          <section id="approvals" className="bg-paper rounded-lg shadow-card border border-line p-6 space-y-6">
            <div className="border-b border-line pb-4">
              <h2 className="text-2xl font-heading text-ink">Payment Approvals Queue</h2>
              <p className="text-sm text-ink-soft mt-1">Review pending investment payments submitted by clients</p>
            </div>

            {loadingData ? (
              <div className="text-center py-6 text-ink-muted">Loading...</div>
            ) : pendingInvs.length === 0 ? (
              <div className="text-center py-8 text-ink-muted bg-bone rounded-lg border border-dashed border-line">
                No pending payments waiting for approval.
              </div>
            ) : (
              <div className="overflow-x-auto border border-line rounded-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bone border-b border-line">
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Client</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Project</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Amount</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">M-Pesa Reference</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Date</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {pendingInvs.map(inv => (
                      <tr key={inv._id} className="hover:bg-bone">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-ink">{inv.userId?.name || 'Unnamed Client'}</p>
                          <p className="text-xs text-ink-muted">{inv.userId?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-ink">{inv.projectId?.title || 'Unknown Project'}</td>
                        <td className="px-6 py-4 font-bold text-ink">{fmt(inv.amount)}</td>
                        <td className="px-6 py-4 font-mono text-sm text-ink bg-bone rounded px-2.5 py-1 w-fit">{inv.paymentReference}</td>
                        <td className="px-6 py-4 text-xs text-ink-soft">{new Date(inv.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => approveInvestment(inv._id)} className="bg-olive hover:bg-olive-deep text-paper font-semibold text-xs px-4 py-2 rounded-md transition shadow-sm">
                              Confirm & Approve
                            </button>
                            <button onClick={() => rejectInvestment(inv._id)} className="border border-clay/30 text-clay-deep hover:bg-clay/10 font-semibold text-xs px-4 py-2 rounded-md transition">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 3. REGISTERED CLIENTS MANAGER */}
          <section id="clients" className="bg-paper rounded-lg shadow-card border border-line p-6 space-y-6">
            <div className="border-b border-line pb-4">
              <h2 className="text-2xl font-heading text-ink">Registered Clients Manager</h2>
              <p className="text-sm text-ink-soft mt-1">Review registered profiles and adjust investment metrics</p>
            </div>

            {/* Client Metric Editor Form Modal Overlay */}
            {editingClient && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
                <form onSubmit={saveClientMetrics} className="bg-paper rounded-lg shadow-lift border border-line max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <h3 className="font-heading text-xl text-ink">Edit Client Balance & Profit</h3>
                    <p className="text-xs text-ink-soft mt-1">Adjust figures manually for {editingClient.name} ({editingClient.email})</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Account Balance ($)</label>
                      <input type="number" value={clientForm.balance} onChange={e => setClientForm({ ...clientForm, balance: Number(e.target.value) })} className="input-field text-sm" min="0" step="0.01" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Daily Investment Profit ($/day)</label>
                      <input type="number" value={clientForm.dailyProfit} onChange={e => setClientForm({ ...clientForm, dailyProfit: Number(e.target.value) })} className="input-field text-sm" min="0" step="0.01" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Total Active Investment ($)</label>
                      <input type="number" value={clientForm.totalInvested} onChange={e => setClientForm({ ...clientForm, totalInvested: Number(e.target.value) })} className="input-field text-sm" min="0" step="0.01" required />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={savingClient} className="bg-ink hover:bg-olive-deep text-paper font-semibold text-sm px-5 py-2.5 rounded-md disabled:opacity-60 flex-1 transition">
                      {savingClient ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setEditingClient(null)} className="px-5 py-2.5 text-sm rounded-md border border-line text-ink-soft hover:bg-bone flex-1 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loadingData ? (
              <div className="text-center py-6 text-ink-muted">Loading...</div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-ink-muted">No clients registered in the system yet.</div>
            ) : (
              <div className="overflow-x-auto border border-line rounded-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bone border-b border-line">
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Client</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Role</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Account Balance</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Daily Profit Rate</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label">Total Invested</th>
                      <th className="px-6 py-3.5 text-xs font-semibold text-ink-muted uppercase tracking-label"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {clients.map(c => (
                      <tr key={c._id} className="hover:bg-bone">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-ink">{c.name || 'Unnamed'}</p>
                          <p className="text-xs text-ink-soft">{c.email}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                          <Badge color={c.role === 'admin' ? 'purple' : 'gray'}>{c.role}</Badge>
                        </td>
                        <td className="px-6 py-4 font-bold text-ink">{fmt(c.balance)}</td>
                        <td className="px-6 py-4 font-semibold text-olive-deep">{fmt(c.dailyProfit)}/day</td>
                        <td className="px-6 py-4 text-sm font-medium text-ink-soft">{fmt(c.totalInvested)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => startEditClient(c)} className="text-ink hover:text-olive-deep text-sm font-bold flex items-center gap-1 ml-auto" title="Adjust Balance/Profit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 4. ADMIN PAYMENT AND WITHDRAWAL SETTINGS */}
          <section id="settings" className="bg-paper rounded-lg shadow-card border border-line p-6 space-y-6">
            <div className="border-b border-line pb-4">
              <h2 className="text-2xl font-heading text-ink">Global Investment settings</h2>
              <p className="text-sm text-ink-soft mt-1">Configure payment details & withdrawal instruction panel displayed on the client dashboard</p>
            </div>
            
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1">M-Pesa Investment Paybill Number</label>
                  <input value={settings.paybill} onChange={e => setSettings({ ...settings, paybill: e.target.value })} className="input-field text-sm font-medium" placeholder="Paybill number" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-soft mb-1">M-Pesa Investment Account Number prefix</label>
                  <input value={settings.accountNumber} onChange={e => setSettings({ ...settings, accountNumber: e.target.value })} className="input-field text-sm font-medium" placeholder="Account Prefix" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-ink-soft mb-1">Custom Withdrawal Page instructions (Client View)</label>
                  <textarea value={settings.withdrawalInstructions} onChange={e => setSettings({ ...settings, withdrawalInstructions: e.target.value })} rows={4} className="input-field text-sm resize-none leading-relaxed" placeholder="Tell clients how to make withdrawals (e.g. payout timelines, limits, contact methods)..." required />
                </div>
              </div>
              <button type="submit" disabled={savingSettings} className="bg-ink hover:bg-olive-deep text-paper font-semibold text-sm px-6 py-2.5 rounded-md disabled:opacity-60 transition shadow-sm">
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </form>
          </section>

          {/* 5. COLLAPSIBLE OLD SITE CATALOG (For compatibility) */}
          <section className="bg-paper rounded-lg shadow-card border border-line p-6 space-y-4">
            <button onClick={() => setShowOldCatalog(!showOldCatalog)} className="w-full flex items-center justify-between font-heading text-ink text-lg focus:outline-none">
              <span>Show Old Site Catalog (Materials & Products)</span>
              <svg className={`w-5 h-5 transition-transform duration-300 ${showOldCatalog ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {showOldCatalog && (
              <div className="space-y-6 pt-4 animate-in slide-in-from-top-2 duration-300">
                <div className="border-t border-line pt-4">
                  <h3 className="font-heading text-ink mb-3">Materials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {materials.map(m => (
                      <div key={m._id} className="p-3 bg-bone rounded-md border border-line flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-ink">{m.name}</p>
                          <p className="text-xs text-ink-soft">{m.category}</p>
                        </div>
                        <span className="font-heading text-ink">{fmt(m.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-line pt-4">
                  <h3 className="font-heading text-ink mb-3">Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {products.map(p => (
                      <div key={p._id} className="p-3 bg-bone rounded-md border border-line flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-ink">{p.name}</p>
                          <p className="text-xs text-ink-soft">{p.category}</p>
                        </div>
                        <span className="font-heading text-ink">{fmt(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  )
}
