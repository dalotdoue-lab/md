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
    completed: 'bg-olive/15 text-olive-deep',
    in_progress: 'bg-clay/15 text-clay-deep',
    planning: 'bg-ink/8 text-ink-soft',
    on_hold: 'bg-ink/8 text-ink-muted'
  }

  const statusLabels = {
    completed: 'Completed',
    in_progress: 'In Progress',
    planning: 'Planning',
    on_hold: 'On Hold'
  }

  return (
    <div className="card group p-0 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-bone border-b border-line">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-14 h-14 text-ink/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="eyebrow before:hidden mb-2.5">
          {category}
        </div>
        <h3 className="text-xl font-heading text-ink mb-2">
          {title}
        </h3>
        <p className="text-ink-soft text-sm mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Progress Bar */}
        {status !== 'completed' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-muted">Progress</span>
              <span className="font-semibold text-ink">{progress}%</span>
            </div>
            <div className="w-full bg-ink/8 rounded-full h-1.5">
              <div
                className="bg-olive h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <Link href={link} className="inline-flex items-center text-sm font-semibold text-ink hover:text-clay-deep transition-colors">
          View details
          <svg className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default ProjectCard



