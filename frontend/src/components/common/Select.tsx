import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: SelectOption[];
}

export function Select({ id, label, options, className = '', ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-lunar-muted">
        {label}
      </label>
      <select
        id={id}
        className={`rounded-md border border-lunar-border bg-lunar-panel px-3 py-2 text-sm text-lunar-text focus:border-lunar-accent ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
