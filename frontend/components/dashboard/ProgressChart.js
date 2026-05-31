import { useEffect, useRef } from 'react'

const ProgressChart = ({ milestones = [] }) => {
  const canvasRef = useRef(null)

  const defaultMilestones = [
    { name: 'Planning', completed: true, date: '2024-01-15' },
    { name: 'Design', completed: true, date: '2024-02-01' },
    { name: 'Development', completed: true, date: '2024-02-20' },
    { name: 'Testing', completed: false, date: '2024-03-05' },
    { name: 'Deployment', completed: false, date: '2024-03-15' },
    { name: 'Final Review', completed: false, date: '2024-03-25' },
  ]

  const displayMilestones = milestones.length > 0 ? milestones : defaultMilestones

  const completedCount = displayMilestones.filter(m => m.completed).length
  const progressPercent = Math.round((completedCount / displayMilestones.length) * 100)

  return (
    <div className="bg-paper border border-line shadow-card rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-heading text-ink">Project progress</h3>
        <span className="text-2xl font-heading text-olive-deep">{progressPercent}%</span>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-line rounded-full h-2.5 mb-8">
        <div
          className="bg-olive h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Milestones Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-line"></div>

        <div className="space-y-6">
          {displayMilestones.map((milestone, index) => (
            <div key={index} className="relative flex items-start pl-10">
              {/* Circle Indicator */}
              <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ring-4 ring-paper ${
                milestone.completed ? 'bg-olive' : 'bg-line'
              }`}></div>

              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className={`font-heading ${
                    milestone.completed ? 'text-ink' : 'text-ink-muted'
                  }`}>
                    {milestone.name}
                  </h4>
                  <span className="text-sm text-ink-muted">{milestone.date}</span>
                </div>
                {milestone.completed && (
                  <p className="text-sm text-olive-deep mt-1">Completed</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressChart



