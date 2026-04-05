interface VerdictBannerProps {
  verdict: string
  output?: string
  error?: string
}

export const VerdictBanner = ({ verdict, output, error }: VerdictBannerProps) => {
  const getStyle = (): React.CSSProperties => {
    if (verdict === 'Accepted') return { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }
    if (verdict === 'Time Limit Exceeded') return { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }
    return { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecdd3' }
  }

  return (
    <div style={{ ...getStyle(), padding: '0.65rem 0.75rem', borderRadius: '6px' }}>
      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{verdict}</div>
      {output && <pre style={{ marginTop: '0.35rem', fontSize: '0.78rem', overflow: 'auto', maxHeight: '160px' }}>{output}</pre>}
      {error && <pre style={{ marginTop: '0.35rem', fontSize: '0.78rem', overflow: 'auto', maxHeight: '160px' }}>{error}</pre>}
    </div>
  )
}
