import type { ReactNode, CSSProperties, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'
import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

export function Notification() {
  const msg = useStore((s) => s.notification)
  const [vis, setVis] = useState(false)
  useEffect(() => { if (msg) setVis(true); else setTimeout(() => setVis(false), 300) }, [msg])
  return (
    <div style={{
      position: 'fixed', top: 64, left: '50%',
      transform: `translateX(-50%) translateY(${vis && msg ? '0' : '-80px'})`,
      background: '#085041', color: '#fff', padding: '10px 20px',
      borderRadius: 24, fontSize: 13, zIndex: 400, pointerEvents: 'none',
      transition: 'transform 0.3s ease', whiteSpace: 'nowrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    }}>
      {msg}
    </div>
  )
}

interface ModalProps { open: boolean; onClose: () => void; title: string; children: ReactNode }
export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px', width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600, color: '#111' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888', padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}
export function Btn({ variant = 'secondary', fullWidth, size = 'md', style, children, ...props }: BtnProps) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    border: '1px solid #e0e0e0', borderRadius: 8, fontFamily: 'inherit',
    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
    width: fullWidth ? '100%' : undefined,
    padding: size === 'sm' ? '5px 12px' : size === 'lg' ? '13px 24px' : '9px 18px',
    fontSize: size === 'sm' ? 12 : size === 'lg' ? 15 : 13,
  }
  const variants: Record<string, CSSProperties> = {
    primary: { background: '#1D9E75', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#111' },
  }
  return <button {...props} style={{ ...base, ...variants[variant], ...style }}>{children}</button>
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string }
export function Input({ label, style, ...rest }: InputProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>{label}</label>}
      <input {...rest} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff', color: '#111', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', ...style }} />
    </div>
  )
}

export function Chip({ children, bg, color }: { children: ReactNode; bg?: string; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg || '#E1F5EE', color: color || '#085041' }}>
      {children}
    </span>
  )
}

export function Avatar({ name, bg, color, size = 32 }: { name: string; bg?: string; color?: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg || '#E1F5EE', color: color || '#085041', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size < 30 ? 10 : 12, fontWeight: 600, flexShrink: 0 }}>
      {name.slice(0, 2)}
    </div>
  )
}

export function Counter({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) {
  const btn: CSSProperties = { width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      <button onClick={onMinus} style={{ ...btn, background: '#f0f0f0', color: '#666' }}>−</button>
      <span style={{ fontSize: 20, fontWeight: 600, minWidth: 28, textAlign: 'center', color: '#111' }}>{value}</span>
      <button onClick={onPlus} style={{ ...btn, background: '#1D9E75', color: '#fff' }}>＋</button>
    </div>
  )
}

export function LiveBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: '#E1F5EE', color: '#085041', fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', animation: 'blink 1.2s infinite', display: 'inline-block' }} />
      LIVE
    </span>
  )
}

export function EmptyState({ icon, text, action }: { icon: string; text: string; action?: ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, marginBottom: action ? 16 : 0 }}>{text}</div>
      {action}
    </div>
  )
}
