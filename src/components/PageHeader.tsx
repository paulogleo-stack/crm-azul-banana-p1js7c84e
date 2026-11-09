import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
