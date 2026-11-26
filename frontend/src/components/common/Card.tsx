import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <section
      className={`rounded-lg border border-lunar-border bg-lunar-surface p-5 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}
