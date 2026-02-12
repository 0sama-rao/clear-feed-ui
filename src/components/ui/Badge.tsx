import type { ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  onRemove?: () => void;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-gray-100 text-text-secondary',
  primary: 'bg-primary-light text-primary',
  success: 'bg-success-light text-emerald-700',
  warning: 'bg-warning-light text-amber-700',
  danger: 'bg-danger-light text-red-700',
};

export default function Badge({
  variant = 'default',
  children,
  onRemove,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex items-center justify-center rounded-full h-3.5 w-3.5 hover:bg-black/10 transition-colors cursor-pointer"
        >
          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </span>
  );
}
