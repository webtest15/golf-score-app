import { useState } from 'react'
import { useStore } from '../store/useStore'
import { getGroupColor } from '../utils'
import { Btn, Modal, Avatar, Counter } from './ui'

export function InputTab() {
  const { currentRoom, activeGroupId, currentHole, setActiveGroup, setCurrentHole, changeCount, setTotalScore, confirmGroupScore, notify } = useStore()
  const room = currentRoom()
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  if (!room) return null

  const activeGroup = room.groups.find((g) => g.id === activeGroupId)

  const simOCR = () => {
    if (!activeGroup) return
    setOcrLoading(true)
    notify('OCR解析中...')
    setTimeout(() => {
      activeGroup.players.forEach((p) => {
        if (p.totalScore == null) setTotalScore(activeGroup.id, p.id, 80 + Math.floor(Math.random() * 30))
      })
      setOcrLoading(false)
      notify('スコアを読み取りました（要確認）')
    }, 1200)
  }

  const handleConfirm = () => {
    if (!activeGroup) return
    confirmGroupScore(activeGroup.id)
    setShowScoreModal(false)
    notify(`${activeGroup.name} のスコアを確定しました`)
  }

  return (
    <div>
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>入力するグループを選択</div>
        {room.groups.length === 0 && <div style={{ color: '#aaa', fontSize: 13, padding: 8 }}>グループがありません</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {room.groups.map((g, gi) => {
            const gc = getGroupColor(gi)
            const isActive = g.id === activeGroupId
            return (
              <div key={g.id} onClick={() => setActiveGroup(g.id)} style={{ padding: '12px 14px', borderRadius: 10, border: isActive ? `2px solid ${gc.border}` : '1px solid #e8e8e8', background: isActive ? gc.bg : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={g.name} bg={gc.bg} color={gc.text} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{g.players.length}人</div>
                </div>
                {g.finished && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: gc.bg, color: gc.text, fontWeight: 600 }}>✓ 確定</span>}
              </div>
            )
          })}
        </div>
      </div>

      {activeGroup && (() => {
        const gi = room.groups.indexOf(activeGroup)
        const gc = getGroupColor(gi)
        return (
          <div style={{ marginTop: 16 }}>
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: gc.bg, borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: gc.text }}>{activeGroup.name} の入力</div>
              <Btn size="sm" onClick={() => setShowScoreModal(true)} style={{ fontSize: 11 }}>🏁 スコア入力</Btn>
            </div>

            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '10px 16px', scrollbarWidth: 'none' as const }}>
              {Array.from({ length: activeGroup.players[0]?.holes.length || 0 }, (_, i) => (
                <button key={i} onClick={() => setCurrentHole(i)} style={{ flexShrink: 0, padding: '5px 13px', borderRadius: 20, fontSize: 12, border: i === currentHole ? 'none' : '1px solid #e0e0e0', background: i === currentHole ? '#1D9E75' : '#fff', color: i === currentHole ? '#fff' : '#888', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {i + 1}
                </button>
              ))}
            </div>

            <div style={{ padding: '0 16px 16px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['プレイヤー', 'パター', 'OB'].map((h) => (
                      <th key={h} style={{ fontSize: 11, color: '#888', fontWeight: 400, padding: '0 6px 10px', textAlign: h === 'プレイヤー' ? 'left' : 'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeGroup.players.map((p) => {
                    const h = p.holes[currentHole]
                    return (
                      <tr key={p.id}>
                        <td style={{ padding: '9px 6px', borderBottom: '1px solid #f0f0f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Avatar name={p.name} size={28} />
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '9px 6px', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                          <Counter value={h.putts} onMinus={() => changeCount(activeGroup.id, p.id, 'putts', -1)} onPlus={() => changeCount(activeGroup.id, p.id, 'putts', 1)} />
                        </td>
                        <td style={{ padding: '9px 6px', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
                          <Counter value={h.obs} onMinus={() => changeCount(activeGroup.id, p.id, 'obs', -1)} onPlus={() => changeCount(activeGroup.id, p.id, 'obs', 1)} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      <Modal open={showScoreModal} onClose={() => setShowScoreModal(false)} title={`${activeGroup?.name || ''} — スコア入力`}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>合計スコアを入力してください</div>
        {activeGroup?.players.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Avatar name={p.name} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#111' }}>{p.name}</div>
            <input type="number" value={p.totalScore ?? ''} onChange={(e) => setTotalScore(activeGroup.id, p.id, e.target.value ? +e.target.value : null)} placeholder="92" style={{ width: 80, padding: 8, border: '1px solid #e0e0e0', borderRadius: 8, textAlign: 'center', fontSize: 16, background: '#fff', color: '#111', fontFamily: 'inherit' }} />
          </div>
        ))}
        <div onClick={simOCR} style={{ border: '2px dashed #e0e0e0', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: '#fafafa', margin: '14px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>{ocrLoading ? '⏳' : '📷'}</div>
          <div style={{ fontSize: 13, color: '#888' }}>{ocrLoading ? 'OCR解析中...' : 'スコアカード写真をアップロード (OCR)'}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>タップでシミュレート</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn fullWidth onClick={() => setShowScoreModal(false)}>戻る</Btn>
          <Btn variant="primary" fullWidth onClick={handleConfirm}>確定</Btn>
        </div>
      </Modal>
    </div>
  )
}
