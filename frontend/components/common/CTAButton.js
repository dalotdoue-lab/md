import Link from 'next/link'

const CTAButton = ({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-let-blue text-white hover:bg-let-accent focus:ring-let-blue',
    secondary: 'bg-let-green text-white hover:opacity-90 focus:ring-let-green',
    outline: 'border-2 border-let-blue text-let-blue hover:bg-let-blue hover:text-white focus:ring-let-blue',
    white: 'bg-white text-let-blue hover:bg-gray-100 focus:ring-white',
    ghost: 'text-let-blue hover:bg-let-light focus:ring-let-blue'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  )
}

export default CTAButton



