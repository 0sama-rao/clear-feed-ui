import { useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface AccordionProps {
  title: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Accordion({
  title,
  badge,
  defaultOpen = false,
  children,
  className = '',
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left cursor-pointer group"
      >
        <ChevronRight
          className={`h-4 w-4 text-text-secondary shrink-0 transition-transform duration-200 ${
            open ? 'rotate-90' : ''
          }`}
        />
        <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
          {title}
        </span>
        {badge && <span className="ml-auto">{badge}</span>}
      </button>
      {open && <div className="mt-2 ml-6">{children}</div>}
    </div>
  );
}
