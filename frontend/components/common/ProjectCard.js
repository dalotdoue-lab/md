import Link from 'next/link'

const ProjectCard = ({ 
  title, 
  description, 
  category, 
  image,
  status = 'completed',
  progress = 100,
  link = '#'
}) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    planning: 'bg-yellow-100 text-yellow-800',
    on_hold: 'bg-gray-100 text-gray-800'
  }

  const statusLabels = {
    completed: 'Completed',
    in_progress: 'In Progress',
    planning: 'Planning',
    on_hold: 'On Hold'
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-let-light">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-let-blue/10">
            <svg className="w-16 h-16 text-let-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="text-xs font-semibold text-let-green uppercase tracking-wider mb-2">
          {category}
        </div>
        <h3 className="text-xl font-heading font-bold text-let-blue mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Progress Bar */}
        {status !== 'completed' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-let-blue">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-let-green h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <Link href={link} className="inline-flex items-center text-let-blue font-semibold hover:text-let-green transition-colors">
          View Details
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default ProjectCard



