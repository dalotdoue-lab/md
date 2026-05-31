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
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-heading font-bold text-let-blue">Project Progress</h3>
        <span className="text-2xl font-bold text-let-green">{progressPercent}%</span>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
        <div 
          className="bg-let-green h-4 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Milestones Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {displayMilestones.map((milestone, index) => (
            <div key={index} className="relative flex items-start pl-10">
              {/* Circle Indicator */}
              <div className={`absolute left-2 w-5 h-5 rounded-full border-4 border-white ${
                milestone.completed ? 'bg-let-green' : 'bg-gray-300'
              }`}></div>
              
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold ${
                    milestone.completed ? 'text-let-green' : 'text-gray-600'
                  }`}>
                    {milestone.name}
                  </h4>
                  <span className="text-sm text-gray-500">{milestone.date}</span>
                </div>
                {milestone.completed && (
                  <p className="text-sm text-let-green mt-1">Completed</p>
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



