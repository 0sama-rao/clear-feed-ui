import type { ReactNode, ElementType } from 'react';

interface EmptyStateProps {
  icon: ElementType;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-surface rounded-md p-16 text-center border border-border">
      <Icon className="h-10 w-10 text-text-secondary/30 mx-auto mb-4" />
      <h2 className="text-base font-semibold text-text mb-1">{title}</h2>
      <p className="text-text-secondary text-sm max-w-sm mx-auto">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
