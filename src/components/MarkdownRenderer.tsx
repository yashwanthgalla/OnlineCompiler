import ReactMarkdown from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div style={{ color: 'var(--text-primary)', lineHeight: 1.65, fontSize: '0.88rem' }}>
      <ReactMarkdown
        components={{
          h1: (props) => <h1 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }} {...props} />,
          h2: (props) => <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.85rem', marginBottom: '0.4rem' }} {...props} />,
          h3: (props) => <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.6rem', marginBottom: '0.3rem' }} {...props} />,
          p: (props) => <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }} {...props} />,
          ul: (props) => <ul style={{ listStyle: 'disc', listStylePosition: 'inside', marginBottom: '0.5rem', color: 'var(--text-secondary)' }} {...props} />,
          ol: (props) => <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginBottom: '0.5rem', color: 'var(--text-secondary)' }} {...props} />,
          li: (props) => <li style={{ marginBottom: '0.2rem' }} {...props} />,
          code: (props) => (
            <code
              style={{ background: 'var(--surface-secondary)', padding: '0.15rem 0.35rem', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: "'JetBrains Mono', monospace" }}
              {...props}
            />
          ),
          pre: (props) => (
            <pre style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)', padding: '0.65rem', borderRadius: '6px', overflow: 'auto', marginBottom: '0.5rem', fontSize: '0.82rem', fontFamily: "'JetBrains Mono', monospace" }} {...props} />
          ),
          blockquote: (props) => (
            <blockquote style={{ borderLeft: '3px solid var(--border)', paddingLeft: '0.85rem', fontStyle: 'italic', color: 'var(--text-tertiary)' }} {...props} />
          ),
          a: (props) => <a style={{ color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: '2px' }} {...props} />,
          table: (props) => <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)' }} {...props} />,
          thead: (props) => <thead style={{ background: 'var(--surface-secondary)' }} {...props} />,
          td: (props) => <td style={{ border: '1px solid var(--border)', padding: '0.4rem 0.55rem', fontSize: '0.82rem' }} {...props} />,
          th: (props) => <th style={{ border: '1px solid var(--border)', padding: '0.4rem 0.55rem', textAlign: 'left', fontWeight: 600, fontSize: '0.78rem' }} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
