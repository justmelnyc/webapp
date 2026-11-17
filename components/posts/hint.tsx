/** The original's `Hint` tooltip. Shown on hover by post-tools.css (hover-capable devices only). */
export const Hint = ({ children, className }: { children: string; className?: string }) => (
  <span className={className ? `Hint ${className}` : 'Hint'}>{children}</span>
)
