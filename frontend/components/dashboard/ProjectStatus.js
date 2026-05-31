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
    completed: { bg: 'bg-olive/15', text: 'text-olive-deep', label: 'Completed' },
    in_progress: { bg: 'bg-clay/15', text: 'text-clay-deep', label: 'In Progress' },
    planning: { bg: 'bg-ink/5', text: 'text-ink-soft', label: 'Planning' },
    on_hold: { bg: 'bg-ink/5', text: 'text-ink-muted', label: 'On Hold' },
  }

  return (
    <div className="bg-paper border border-line shadow-card rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-line">
        <h3 className="text-lg font-heading text-ink">Project status</h3>
      </div>
      <div className="divide-y divide-line">
        {displayProjects.map((project) => (
          <div key={project.id} className="p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="font-heading text-ink">{project.name}</h4>
                <p className="text-sm text-ink-muted mt-1">Due: {project.dueDate}</p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                {statusColors[project.status].label}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-ink-soft">Progress</span>
                <span className="font-semibold text-ink">{project.progress}%</span>
              </div>
              <div className="w-full bg-line rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    project.status === 'completed' ? 'bg-olive' : 'bg-ink'
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



