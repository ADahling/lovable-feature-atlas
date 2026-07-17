// Shared brand styles for auth emails.
// Body background stays #ffffff (email client rule); inner surface uses cream.

const INK = '#0A0A0A'
const FOREST = '#0B3D2E'
const EMERALD = '#1F7A5A'
const GOLD = '#C9A961'
const CREAM = '#FBF5E9'
const MUTED = '#5B5B57'
const HAIRLINE = '#E3DDCE'

export const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: INK,
  margin: 0,
  padding: '32px 12px',
}

export const container = {
  maxWidth: '560px',
  margin: '0 auto',
  background: CREAM,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: '6px',
  overflow: 'hidden' as const,
}

export const header = {
  padding: '24px 32px 16px',
  borderBottom: `1px solid ${HAIRLINE}`,
}

export const eyebrow = {
  fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
  fontSize: '11px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: EMERALD,
  margin: 0,
}

export const inner = { padding: '28px 32px 32px' }

export const h1 = {
  fontSize: '22px',
  fontWeight: 600,
  color: INK,
  margin: '0 0 16px',
  letterSpacing: '-0.01em',
}

export const text = {
  fontSize: '15px',
  color: INK,
  lineHeight: '1.6',
  margin: '0 0 20px',
}

export const link = { color: EMERALD, textDecoration: 'underline' }

export const button = {
  backgroundColor: FOREST,
  color: CREAM,
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: '4px',
  padding: '13px 22px',
  textDecoration: 'none',
  letterSpacing: '0.01em',
}

export const codeStyle = {
  fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
  fontSize: '26px',
  fontWeight: 600,
  color: FOREST,
  letterSpacing: '0.3em',
  background: '#ffffff',
  border: `1px solid ${HAIRLINE}`,
  borderRadius: '4px',
  padding: '14px 18px',
  display: 'inline-block',
  margin: '0 0 24px',
}

export const footer = {
  fontSize: '12px',
  color: MUTED,
  margin: '28px 0 0',
  lineHeight: '1.6',
}

export const SITE_LABEL = 'The Lovable Feature Atlas'
