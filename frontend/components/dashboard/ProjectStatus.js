const ProjectStatus = ({ projects }) => {
  const defaultProjects = [
    { 
      id: 1, 
      name: 'Smart Irrigation System - Phase 1', 
      status: 'in_progress', 
      progress: 75,
      dueDate: '2024-03-15'
    },
    { 
      id: 2, 
      name: 'AI Analytics Platform', 
      status: 'planning', 
      progress: 25,
      dueDate: '2024-04-20'
    },
    { 
      id: 3, 
      name: 'Building Automation System', 
      status: 'completed', 
      progress: 100,
      dueDate: '2024-02-01'
    },
  ]

  const displayProjects = projects || defaultProjects

  const statusColors = {
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
    planning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Planning' },
    on_hold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'On Hold' },
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-heading font-bold text-let-blue">Project Status</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {displayProjects.map((project) => (
          <div key={project.id} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-500 mt-1">Due: {project.dueDate}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                {statusColors[project.status].label}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-let-blue">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    project.status === 'completed' ? 'bg-let-green' : 'bg-let-blue'
                  }`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectStatus



