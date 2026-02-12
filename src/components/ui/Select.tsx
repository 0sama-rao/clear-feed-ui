import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export default function Select({
  label,
  options,
  error,
  id,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text mb-1.5"
      >
        {label}
      </label>
      <select
        id={id}
        className={`block w-full rounded-lg border ${
          error ? 'border-danger' : 'border-border'
        } bg-surface px-4 py-3 text-base text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-border-focus transition-all appearance-none ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}
