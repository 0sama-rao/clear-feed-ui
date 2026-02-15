import ReactMarkdown from 'react-markdown';

interface ProseProps {
  content: string;
  className?: string;
}

export default function Prose({ content, className = '' }: ProseProps) {
  return (
    <div className={`prose-cf ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="text-sm font-bold text-text mt-4 mb-1.5 first:mt-0">{children}</h3>
          ),
          h2: ({ children }) => (
            <h4 className="text-xs font-bold text-text mt-3 mb-1 first:mt-0">{children}</h4>
          ),
          h3: ({ children }) => (
            <h5 className="text-xs font-semibold text-text mt-2 mb-1 first:mt-0">{children}</h5>
          ),
          p: ({ children }) => (
            <p className="text-sm text-text-secondary leading-relaxed mb-2 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-2 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 mb-2 last:mb-0 list-decimal list-inside">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-text-secondary leading-relaxed flex gap-1.5">
              <span className="text-primary/60 mt-0.5 shrink-0">&bull;</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="text-xs bg-background rounded px-1 py-0.5 font-mono">{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
