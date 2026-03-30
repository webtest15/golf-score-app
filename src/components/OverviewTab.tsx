import { useStore } from '../store/useStore'
import { calcRankScore, getGroupColor } from '../utils'
import { Avatar } from './ui'

export function OverviewTab({ onAddGroup }: { onAddGroup: () => void }) {
  const { currentRoom, setRoomTab, setActiveGroup } = useStore()
  const room = currentRoom()
  if (!room) return null

  if (room.groups.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
        <div style={{ fontSize: 14, marginBottom: 16 }}>グループを追加してください</div>
        <button onClick={onAddGroup} style={{ padding: '10px 20px', borderRadius: 8, background: '#1D9E75', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>+ グループ追加</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '14px 16px' }}>
      {room.groups.map((g, gi) => {
        const gc = getGroupColor(gi)
        const sorted = [...g.players].map((p) => ({
          ...p,
          putts: p.holes.reduce((s, h) => s + h.putts, 0),
          obs: p.holes.reduce((s, h) => s + h.obs, 0),
          rs: calcRankScore(p, room.ruleA, room.ruleB),
        })).sort((a, b) => a.rs - b.rs)

        const totalPutts = sorted.reduce((s, p) => s + p.putts, 0)
        const totalObs = sorted.reduce((s, p) => s + p.obs, 0)
        const displayed = sorted.slice(0, 4)
        const remaining = sorted.length - 4

        return (
          <div key={g.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ padding: '12px 14px', background: gc.bg, borderLeft: `3px solid ${gc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: gc.text }}>{g.name}</div>
                <div style={{ fontSize: 11, color: gc.text, opacity: 0.8, marginTop: 2 }}>{g.players.length}人 / パター計{totalPutts} / OB計{totalObs}</div>
              </div>
              <button onClick={() => { setActiveGroup(g.id); setRoomTab('input') }} style={{ padding: '5px 12px', borderRadius: 6, background: '#fff', border: `1px solid ${gc.border}`, color: gc.text, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                入力 →
              </button>
            </div>

            <div style={{ padding: '8px 14px 10px' }}>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 6 }}>グループ内暫定ランキング</div>
              {displayed.map((p, pi) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: pi < displayed.length - 1 || remaining > 0 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ width: 18, fontSize: 12, color: '#aaa', textAlign: 'center', flexShrink: 0 }}>{pi + 1}</div>
                  <Avatar name={p.name} bg={gc.bg} color={gc.text} size={28} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>P:{p.putts} OB:{p.obs}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, minWidth: 24, textAlign: 'right', color: gc.text }}>{Math.round(p.rs)}</div>
                </div>
              ))}
              {remaining > 0 && (
                <div style={{ fontSize: 11, color: '#aaa', padding: '6px 0 2px', textAlign: 'center' }}>他 {remaining} 人</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
