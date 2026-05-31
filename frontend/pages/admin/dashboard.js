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
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
    green: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    yellow: 'bg-amber-100 text-amber-800 border border-amber-200',
    red: 'bg-rose-100 text-rose-800 border border-rose-200',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
    purple: 'bg-purple-100 text-purple-700 border border-purple-200',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.blue}`}>
      {children}
    </span>
  )
}

function StatCard({ label, value, icon, color = 'blue' }) {
  const borderColors = {
    blue: 'border-l-4 border-l-blue-600',
    green: 'border-l-4 border-l-emerald-600',
    yellow: 'border-l-4 border-l-amber-600',
    purple: 'border-l-4 border-l-purple-600',
  }
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${borderColors[color]}`}>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
        {icon}
      </div>
    </div>
  )
}

function AdminFlowCard({ title, value, label, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    yellow: 'bg-amber-50 text-amber-700 border-amber-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <p className="text-xs font-black uppercase tracking-wider opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-bold">{title}</p>
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
    <section className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Admin command center</p>
          <h1 className="mt-2 text-3xl font-black text-[#0D3B66]">Investment operations dashboard</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Manage client capital, payment approvals, investment projects, and client-facing instructions from one structured operating view.
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
          <div key={step.title} className="rounded-xl bg-gray-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D3B66] text-xs font-black text-white">{index + 1}</div>
            <p className="mt-3 text-sm font-black text-gray-900">{step.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{step.text}</p>
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pendingInvs = investments.filter(inv => inv.status === 'pending')
  const totalApprovedVol = investments.filter(i => i.status === 'approved').reduce((sum, i) => sum + (i.amount || 0), 0)

  return (
    <>
      <Head><title>Admin Panel — Let Investments</title></Head>
      <div className="min-h-screen bg-gray-50 text-gray-850">
        
        {/* Navigation Top bar */}
        <div className="sticky top-0 z-40 border-b border-white/10 bg-[#102033] px-4 py-3 text-white shadow-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-300 text-lg font-black text-[#102033]">L</div>
            <div>
              <p className="font-semibold leading-none">Let Investments</p>
              <p className="mt-0.5 text-xs text-blue-200">Investment Admin Portal</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <a href="#admin-overview" className="rounded-lg bg-white/10 px-3 py-2 text-blue-50 hover:bg-white/15">Overview</a>
            <a href="#projects" className="rounded-lg px-3 py-2 text-blue-100 hover:bg-white/10">Projects</a>
            <a href="#approvals" className="rounded-lg px-3 py-2 text-blue-100 hover:bg-white/10">Approvals</a>
            <a href="#clients" className="rounded-lg px-3 py-2 text-blue-100 hover:bg-white/10">Clients</a>
            <a href="#settings" className="rounded-lg px-3 py-2 text-blue-100 hover:bg-white/10">Settings</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-blue-100 md:block">{user?.email}</span>
            <button onClick={signOut} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20">
              Sign Out
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
          <section id="projects" className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0D3B66]">Projects Management</h2>
                <p className="text-sm text-gray-500 mt-1">Add, update, or remove investment options</p>
              </div>
              {!showProjForm && (
                <button onClick={startNewProj} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Project
                </button>
              )}
            </div>

            {/* Project Edit / Create Form */}
            {showProjForm && (
              <form onSubmit={saveProject} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg text-[#0D3B66]">{editingProjId ? 'Edit Project Details' : 'Create New Investment Project'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Project Title</label>
                    <input name="title" value={projForm.title} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Rice Husks Biomass Energy, Kisumu" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                    <select name="category" value={projForm.category} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select name="status" value={projForm.status} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                      {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Client Name (Optional)</label>
                    <input name="client" value={projForm.client} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. East Africa AgriCo" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                    <input name="location" value={projForm.location} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Kisumu, Kenya" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Target Budget / Valuation ($)</label>
                    <input type="number" name="price" value={projForm.price} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Funding Progress (%)</label>
                    <input type="number" name="progress" value={projForm.progress} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Daily ROI / Earnings per Client ($)</label>
                    <input type="number" name="dailyEarnings" value={projForm.dailyEarnings} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" min="0" step="0.01" placeholder="Daily earnings paid to client" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Minimum Investment ($)</label>
                    <input type="number" name="minInvestment" value={projForm.minInvestment} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" min="0" step="0.01" placeholder="Minimum allowed investment" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Display Order (Sorting)</label>
                    <input type="number" name="order" value={projForm.order} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">External Link / Slug</label>
                    <input name="link" value={projForm.link} onChange={handleProjChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="/projects/kisumu-biomass" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Short Card Description</label>
                    <textarea name="description" value={projForm.description} onChange={handleProjChange} rows={2} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Brief summary for catalog listing..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Detailed Write-Up (ROI terms, risk factors, etc.)</label>
                    <textarea name="details" value={projForm.details} onChange={handleProjChange} rows={4} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Provide details about daily payouts, project timeline, and structure..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Project Banner Image</label>
                    <div className="flex items-center gap-4 flex-wrap mt-1">
                      <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-semibold text-blue-600 transition">
                        {projUpload.uploading ? `Uploading (${projUpload.progress}%)` : 'Upload Banner'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleProjImageFile(e.target.files[0])} disabled={projUpload.uploading} />
                      </label>
                      {projForm.image && <img src={projForm.image} alt="Preview" className="w-20 h-16 rounded-lg object-cover border border-gray-200" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="featured" name="featured" checked={!!projForm.featured} onChange={handleProjChange} className="w-4 h-4 accent-blue-600" />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">Feature this project on home catalog</label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={savingProj || projUpload.uploading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl disabled:opacity-60 transition">
                    {savingProj ? 'Saving...' : editingProjId ? 'Update Project' : 'Add Project'}
                  </button>
                  <button type="button" onClick={() => { setShowProjForm(false); setEditingProjId(null) }} className="px-6 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Projects Table */}
            {loadingData ? (
              <div className="text-center py-6 text-gray-400">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                No active projects. Click "Add Project" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-150 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Banner</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Project Title</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Daily Profit Payout</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Min Invest</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          {p.image ? (
                            <img src={p.image} alt={p.title} className="w-14 h-10 rounded-lg object-cover border border-gray-200" />
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-semibold">No Image</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{p.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{p.category}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">{fmt(p.dailyEarnings)}/day</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{fmt(p.minInvestment)}</td>
                        <td className="px-6 py-4">
                          <Badge color={p.status === 'completed' ? 'green' : p.status === 'in_progress' ? 'blue' : 'yellow'}>
                            {p.status?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => startEditProj(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Edit">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => deleteProject(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition" title="Delete">
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
          <section id="approvals" className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-[#0D3B66]">Payment Approvals Queue</h2>
              <p className="text-sm text-gray-500 mt-1">Review pending investment payments submitted by clients</p>
            </div>

            {loadingData ? (
              <div className="text-center py-6 text-gray-400">Loading...</div>
            ) : pendingInvs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                No pending payments waiting for approval.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-150 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Project</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">M-Pesa Reference</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingInvs.map(inv => (
                      <tr key={inv._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{inv.userId?.name || 'Unnamed Client'}</p>
                          <p className="text-xs text-gray-450">{inv.userId?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">{inv.projectId?.title || 'Unknown Project'}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{fmt(inv.amount)}</td>
                        <td className="px-6 py-4 font-mono text-sm text-blue-600 bg-blue-50/50 rounded px-2.5 py-1 w-fit">{inv.paymentReference}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(inv.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => approveInvestment(inv._id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm">
                              Confirm & Approve
                            </button>
                            <button onClick={() => rejectInvestment(inv._id)} className="border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold text-xs px-4 py-2 rounded-xl transition">
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
          <section id="clients" className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-[#0D3B66]">Registered Clients Manager</h2>
              <p className="text-sm text-gray-500 mt-1">Review registered profiles and adjust investment metrics</p>
            </div>

            {/* Client Metric Editor Form Modal Overlay */}
            {editingClient && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D3B66]/30 backdrop-blur-sm p-4">
                <form onSubmit={saveClientMetrics} className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <h3 className="font-bold text-xl text-[#0D3B66]">Edit Client Balance & Profit</h3>
                    <p className="text-xs text-gray-500 mt-1">Adjust figures manually for {editingClient.name} ({editingClient.email})</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Account Balance ($)</label>
                      <input type="number" value={clientForm.balance} onChange={e => setClientForm({ ...clientForm, balance: Number(e.target.value) })} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" min="0" step="0.01" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Daily Investment Profit ($/day)</label>
                      <input type="number" value={clientForm.dailyProfit} onChange={e => setClientForm({ ...clientForm, dailyProfit: Number(e.target.value) })} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" min="0" step="0.01" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Total Active Investment ($)</label>
                      <input type="number" value={clientForm.totalInvested} onChange={e => setClientForm({ ...clientForm, totalInvested: Number(e.target.value) })} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" min="0" step="0.01" required />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={savingClient} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl disabled:opacity-60 flex-1 transition">
                      {savingClient ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setEditingClient(null)} className="px-5 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 flex-1 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loadingData ? (
              <div className="text-center py-6 text-gray-400">Loading...</div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No clients registered in the system yet.</div>
            ) : (
              <div className="overflow-x-auto border border-gray-150 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Account Balance</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Daily Profit Rate</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase">Total Invested</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clients.map(c => (
                      <tr key={c._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{c.name || 'Unnamed'}</p>
                          <p className="text-xs text-gray-500">{c.email}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-650">
                          <Badge color={c.role === 'admin' ? 'purple' : 'gray'}>{c.role}</Badge>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{fmt(c.balance)}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">{fmt(c.dailyProfit)}/day</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{fmt(c.totalInvested)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => startEditClient(c)} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 ml-auto" title="Adjust Balance/Profit">
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
          <section id="settings" className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-[#0D3B66]">Global Investment settings</h2>
              <p className="text-sm text-gray-500 mt-1">Configure payment details & withdrawal instruction panel displayed on the client dashboard</p>
            </div>
            
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">M-Pesa Investment Paybill Number</label>
                  <input value={settings.paybill} onChange={e => setSettings({ ...settings, paybill: e.target.value })} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium" placeholder="Paybill number" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">M-Pesa Investment Account Number prefix</label>
                  <input value={settings.accountNumber} onChange={e => setSettings({ ...settings, accountNumber: e.target.value })} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium" placeholder="Account Prefix" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Custom Withdrawal Page instructions (Client View)</label>
                  <textarea value={settings.withdrawalInstructions} onChange={e => setSettings({ ...settings, withdrawalInstructions: e.target.value })} rows={4} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none leading-relaxed" placeholder="Tell clients how to make withdrawals (e.g. payout timelines, limits, contact methods)..." required />
                </div>
              </div>
              <button type="submit" disabled={savingSettings} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl disabled:opacity-60 transition shadow-sm">
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </form>
          </section>

          {/* 5. COLLAPSIBLE OLD SITE CATALOG (For compatibility) */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-4">
            <button onClick={() => setShowOldCatalog(!showOldCatalog)} className="w-full flex items-center justify-between font-bold text-[#0D3B66] text-lg focus:outline-none">
              <span>Show Old Site Catalog (Materials & Products)</span>
              <svg className={`w-5 h-5 transition-transform duration-300 ${showOldCatalog ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {showOldCatalog && (
              <div className="space-y-6 pt-4 animate-in slide-in-from-top-2 duration-300">
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-[#0D3B66] mb-3">Materials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {materials.map(m => (
                      <div key={m._id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.category}</p>
                        </div>
                        <span className="font-bold text-[#0D3B66]">{fmt(m.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-bold text-[#0D3B66] mb-3">Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {products.map(p => (
                      <div key={p._id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category}</p>
                        </div>
                        <span className="font-bold text-[#0D3B66]">{fmt(p.price)}</span>
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
