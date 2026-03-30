import { useStore } from '../store/useStore'
import { getAllPlayersRanked, getGroupColor } from '../utils'
import { Chip } from './ui'

export function ResultTab() {
  const { currentRoom } = useStore()
  const room = currentRoom()
  if (!room) return null

  const ranked = getAllPlayersRanked(room)
  const hasScores = ranked.some((p) => p.totalScore != null)

  if (!hasScores) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🏁</div>
        <div style={{ fontSize: 14 }}>スコアを入力してから結果を確認してください</div>
      </div>
    )
  }

  const winner = ranked[0]
  const puttKing = [...ranked].sort((a, b) => a.putts - b.putts)[0]
  const obKing = [...ranked].sort((a, b) => b.obs - a.obs)[0]

  return (
    <div style={{ padding: '14px 16px' }}>
      <div style={{ background: 'linear-gradient(135deg, #085041, #1D9E75)', borderRadius: 14, padding: '24px 20px', color: '#fff', textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>総合優勝</div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>{winner.name}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{winner.groupName} ／ 総合スコア {Math.round(winner.rankScore)}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '🎯', title: 'パット王', name: puttKing.name, sub: `${puttKing.putts}パット` },
          { icon: '💣', title: 'OB王', name: obKing.name, sub: `${obKing.obs}OB` },
        ].map((a) => (
          <div key={a.title} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{a.icon}</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{a.name}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{a.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#111' }}>部屋全体 最終ランキング</div>
      {ranked.map((p, i) => {
        const rank = i + 1
        const gc = getGroupColor(p.groupIdx)
        const medalBg = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#f0f0f0'
        const medalColor = rank === 1 ? '#5A3E00' : rank === 2 ? '#2C2C2A' : rank === 3 ? '#fff' : '#888'
        return (
          <div key={p.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e8e8e8', borderLeft: `3px solid ${gc.border}`, padding: '11px 14px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: medalBg, color: medalColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{rank}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Chip bg={gc.chipBg} color={gc.chipText}>{p.groupName}</Chip>
                <span>スコア{p.totalScore ?? '-'} / P{p.putts} / OB{p.obs}</span>
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1D9E75' }}>{Math.round(p.rankScore)}</div>
          </div>
        )
      })}
    </div>
  )
}
