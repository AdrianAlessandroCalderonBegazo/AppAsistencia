// pequeños átomos de UI compartidos: botón, input, tarjeta, etiqueta de campo
export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-accent-solid text-white hover:bg-blue-700',
    secondary:
      'border border-neutral-border dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-neutral-bg dark:hover:bg-zinc-800',
    danger: 'bg-danger-solid text-white hover:bg-red-700',
    success: 'bg-success-solid text-white hover:bg-green-700',
    ghost: 'text-zinc-500 hover:bg-neutral-bg dark:hover:bg-zinc-800 dark:text-zinc-400',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Input({ label, hint, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      )}
      <input
        className={`w-full rounded-xl border border-neutral-border dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent-solid focus:outline-none focus:ring-1 focus:ring-accent-solid ${className}`}
        {...props}
      />
      {hint && !error && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger-solid">{error}</span>}
    </label>
  )
}

export function Select({ label, className = '', children, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      )}
      <select
        className={`w-full rounded-xl border border-neutral-border dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-accent-solid focus:outline-none focus:ring-1 focus:ring-accent-solid ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      )}
      <textarea
        className={`w-full rounded-xl border border-neutral-border dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-accent-solid focus:outline-none focus:ring-1 focus:ring-accent-solid ${className}`}
        {...props}
      />
    </label>
  )
}

export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-neutral-border dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 ${className}`}
    >
      {children}
    </div>
  )
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ message = 'sin resultados por ahora', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-border dark:border-zinc-800 py-16 text-center">
      {Icon && <Icon size={28} className="text-zinc-300 dark:text-zinc-600" />}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  )
}

export function Banner({ tone = 'accent', children }) {
  const tones = {
    accent: 'bg-accent-bg text-accent-text dark:bg-accent-darkBg dark:text-accent-darkText',
    warning: 'bg-warning-bg text-warning-text dark:bg-warning-darkBg dark:text-warning-darkText',
    danger: 'bg-danger-bg text-danger-text dark:bg-danger-darkBg dark:text-danger-darkText',
    success: 'bg-success-bg text-success-text dark:bg-success-darkBg dark:text-success-darkText',
  }
  return <div className={`rounded-xl px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
}
