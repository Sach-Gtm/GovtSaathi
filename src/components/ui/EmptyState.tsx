export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-10 text-center">
      <div className="text-lg font-display font-semibold">{title}</div>
      {description && <p className="mt-2 text-sm text-ink/70">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
