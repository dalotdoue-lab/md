import Layout from '../components/common/Layout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import ProgressChart from '../components/dashboard/ProgressChart'
import ProjectStatus from '../components/dashboard/ProjectStatus'
import Link from 'next/link'

const milestones = [
  { title: 'Project Kickoff', date: 'Jan 15, 2026', status: 'completed' },
  { title: 'Site Survey & Assessment', date: 'Jan 28, 2026', status: 'completed' },
  { title: 'Design & Engineering Plans', date: 'Feb 20, 2026', status: 'completed' },
  { title: 'Material Procurement', date: 'Mar 10, 2026', status: 'in_progress' },
  { title: 'Installation Phase 1', date: 'Apr 5, 2026', status: 'pending' },
  { title: 'Testing & Commissioning', date: 'Apr 30, 2026', status: 'pending' },
  { title: 'Client Handover', date: 'May 15, 2026', status: 'pending' },
]

export default function Tracking() {
  return (
    <ProtectedRoute allowedRoles={['client', 'admin']}>
      <Layout>
        <div className="bg-ink py-12">
          <div className="container-custom">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-heading text-paper mb-2 leading-tight">Project tracking portal</h1>
                <p className="text-paper/70">Real-time visibility into your project progress and milestones.</p>
              </div>
              <Link href="/dashboard" className="border border-paper/30 text-paper px-5 py-2.5 rounded-md font-medium hover:bg-paper/10 transition-colors text-sm inline-flex items-center justify-center">
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="section-padding bg-bone">
          <div className="container-custom">
            {/* Progress Chart */}
            <div className="card mb-8">
              <h2 className="text-xl font-heading text-ink mb-6">Project progress overview</h2>
              <ProgressChart />
            </div>

            {/* Timeline & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Milestone Timeline */}
              <div className="lg:col-span-2 card">
                <h2 className="text-xl font-heading text-ink mb-6">Project milestones</h2>
                <div className="relative">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-line"></div>
                  <div className="space-y-6">
                    {milestones.map((milestone, i) => (
                      <div key={i} className="flex gap-4 pl-10 relative">
                        <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ring-4 ring-paper z-10 ${
                          milestone.status === 'completed' ? 'bg-olive' :
                          milestone.status === 'in_progress' ? 'bg-clay' :
                          'bg-line'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-heading ${
                                milestone.status === 'pending' ? 'text-ink-muted' : 'text-ink'
                              }`}>
                                {milestone.title}
                              </h3>
                              <p className="text-sm text-ink-muted">{milestone.date}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded font-semibold uppercase tracking-wide ${
                              milestone.status === 'completed' ? 'bg-olive/15 text-olive-deep' :
                              milestone.status === 'in_progress' ? 'bg-clay/15 text-clay-deep' :
                              'bg-ink/5 text-ink-muted'
                            }`}>
                              {milestone.status === 'completed' ? 'Done' : milestone.status === 'in_progress' ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Status */}
              <div className="card">
                <h2 className="text-xl font-heading text-ink mb-6">Current status</h2>
                <ProjectStatus />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
