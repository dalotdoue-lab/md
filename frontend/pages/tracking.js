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
        <div className="bg-let-blue py-12">
          <div className="container-custom">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">Project Tracking Portal</h1>
                <p className="text-gray-300">Real-time visibility into your project progress and milestones.</p>
              </div>
              <Link href="/dashboard" className="btn-outline border-white text-white hover:bg-white hover:text-let-blue text-sm">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="section-padding bg-let-light">
          <div className="container-custom">
            {/* Progress Chart */}
            <div className="card mb-8">
              <h2 className="text-xl font-heading font-bold text-let-blue mb-6">Project Progress Overview</h2>
              <ProgressChart />
            </div>

            {/* Timeline & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Milestone Timeline */}
              <div className="lg:col-span-2 card">
                <h2 className="text-xl font-heading font-bold text-let-blue mb-6">Project Milestones</h2>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {milestones.map((milestone, i) => (
                      <div key={i} className="flex gap-4 pl-12 relative">
                        <div className={`absolute left-3 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${
                          milestone.status === 'completed' ? 'bg-let-green' :
                          milestone.status === 'in_progress' ? 'bg-let-blue animate-pulse' :
                          'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-semibold ${
                                milestone.status === 'completed' ? 'text-gray-700' :
                                milestone.status === 'in_progress' ? 'text-let-blue font-bold' :
                                'text-gray-400'
                              }`}>
                                {milestone.title}
                              </h3>
                              <p className="text-sm text-gray-400">{milestone.date}</p>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ml-2 ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                              milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-500'
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
                <h2 className="text-xl font-heading font-bold text-let-blue mb-6">Current Status</h2>
                <ProjectStatus />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
