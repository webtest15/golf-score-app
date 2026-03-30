import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Btn, Input, Modal, Chip } from './ui'
import { getGroupColor } from '../utils'
import type { Room } from '../types'

export function HomeScreen() {
  const { rooms, createRoom, joinRoom, openRoom, deleteRoom, loadDemo, notify } = useStore()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [showMenu, setShowMenu] = useState<Room | null>(null)   // 長押しメニュー対象
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [roomName, setRoomName] = useState('')
  const [holes, setHoles] = useState(18)
  const [ruleA, setRuleA] = useState(1)
  const [ruleB, setRuleB] = useState(2)
  const [lastHoleDouble, setLastHoleDouble] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  const handleCreate = () => {
    createRoom(roomName || 'ゴルフ部屋', holes, ruleA, ruleB, lastHoleDouble)
    setShowCreate(false)
    setRoomName('')
    setLastHoleDouble(false)
  }

  const handleJoin = () => {
    if (!joinRoom(joinCode)) { notify('部屋が見つかりません'); return }
    setShowJoin(false)
    setJoinCode('')
  }

  const handleDelete = () => {
    if (!showMenu) return
    deleteRoom(showMenu.id)
    setShowDeleteConfirm(false)
    setShowMenu(null)
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>

      {/* ヘッダー */}
      <div style={{ background: 'linear-gradient(135deg, #085041 0%, #1D9E75 100%)', color: '#fff', padding: '28px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>⛳</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Golf Battle</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>リアルタイム ゴルフスコア共有</div>
          </div>
        </div>
      </div>

      {/* ボタン2つ */}
      <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => setShowCreate(true)} style={{ padding: '16px 12px', borderRadius: 12, background: '#1D9E75', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 24 }}>🏠</span>部屋を作る
        </button>
        <button onClick={() => setShowJoin(true)} style={{ padding: '16px 12px', borderRadius: 12, background: '#fff', border: '1px solid #e0e0e0', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 24 }}>🔑</span>部屋に参加
        </button>
      </div>

      {/* 部屋リスト */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 12, color: '#888', fontWeight: 500, padding: '10px 0 6px', borderBottom: '1px solid #e8e8e8', marginBottom: 10 }}>
          参加中の部屋
          {rooms.length > 0 && <span style={{ fontWeight: 400, marginLeft: 6 }}>（右の ⋯ で削除）</span>}
        </div>

        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🏌️</div>
            <div style={{ fontSize: 14 }}>部屋を作るか、コードで参加しよう</div>
          </div>
        ) : (
          rooms.map((r) => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', marginBottom: 10, overflow: 'hidden' }}>
              {/* カード本体（タップで入室） */}
              <div onClick={() => openRoom(r.id)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>🏠 {r.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {r.groups.length}グループ / {r.holes}ホール / コード: <b>{r.code}</b>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {r.groups.map((g, i) => { const c = getGroupColor(i); return <Chip key={g.id} bg={c.chipBg} color={c.chipText}>{g.name}</Chip> })}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                  <Chip bg={r.finished ? '#E6F1FB' : '#E1F5EE'} color={r.finished ? '#185FA5' : '#085041'}>
                    {r.finished ? '終了' : '進行中'}
                  </Chip>
                  {r.lastHoleDouble && <Chip bg="#FFF3CD" color="#856404">最終H×2</Chip>}
                </div>
              </div>

              {/* 操作バー */}
              <div style={{ display: 'flex', borderTop: '1px solid #f0f0f0' }}>
                <button
                  onClick={() => openRoom(r.id)}
                  style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#1D9E75', fontWeight: 600, fontFamily: 'inherit' }}
                >
                  入室する →
                </button>
                <div style={{ width: 1, background: '#f0f0f0' }} />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(r) }}
                  style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa', fontFamily: 'inherit' }}
                >
                  ⋯
                </button>
              </div>
            </div>
          ))
        )}

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Btn onClick={loadDemo} style={{ fontSize: 12, color: '#888' }}>⛳ デモデータを読み込む</Btn>
        </div>
      </div>

      {/* 部屋メニュー モーダル */}
      <Modal open={!!showMenu} onClose={() => setShowMenu(null)} title={showMenu?.name ?? ''}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => { if (showMenu) openRoom(showMenu.id); setShowMenu(null) }}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#111', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span style={{ fontSize: 20 }}>🚪</span> 入室する
          </button>
          <button
            onClick={() => { setShowDeleteConfirm(true) }}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid #ffd0d0', background: '#fff5f5', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#D85A30', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span style={{ fontSize: 20 }}>🗑️</span> この部屋を削除する
          </button>
        </div>
      </Modal>

      {/* 削除確認 */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="本当に削除しますか？">
        <div style={{ padding: '12px 0 20px', fontSize: 14, color: '#555', lineHeight: 1.7 }}>
          「<b>{showMenu?.name}</b>」を削除します。<br />
          スコアデータも含めてすべて消えます。この操作は取り消せません。
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn fullWidth onClick={() => setShowDeleteConfirm(false)}>キャンセル</Btn>
          <button
            onClick={handleDelete}
            style={{ flex: 1, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#D85A30', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            削除する
          </button>
        </div>
      </Modal>

      {/* 部屋作成モーダル */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="部屋を作る">
        <Input label="部屋名" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="例: 2024年夏ゴルフ大会" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 5 }}>ホール数</label>
          <select value={holes} onChange={(e) => setHoles(+e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
            <option value={9}>9ホール</option>
            <option value={18}>18ホール</option>
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>パターの重み A = {ruleA}</label>
          <input type="range" min={0} max={5} step={0.5} value={ruleA} onChange={(e) => setRuleA(+e.target.value)} style={{ width: '100%', accentColor: '#1D9E75' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>OBの重み B = {ruleB}</label>
          <input type="range" min={0} max={10} step={0.5} value={ruleB} onChange={(e) => setRuleB(+e.target.value)} style={{ width: '100%', accentColor: '#1D9E75' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid #f0f0f0', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>最終ホールを2倍にする</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>最終HのP・OBを×2で計算</div>
          </div>
          <div onClick={() => setLastHoleDouble(!lastHoleDouble)} style={{ width: 48, height: 26, borderRadius: 13, cursor: 'pointer', background: lastHoleDouble ? '#1D9E75' : '#ccc', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: lastHoleDouble ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
        <div style={{ padding: '10px 12px', background: '#f5f5f5', borderRadius: 8, fontSize: 12, color: '#666', marginBottom: 16 }}>
          総合スコア = 実スコア + パター×{ruleA} + OB×{ruleB}
          {lastHoleDouble && <><br /><span style={{ color: '#856404' }}>※最終ホールのみ P・OBを×2で計算</span></>}
        </div>
        <Btn variant="primary" fullWidth onClick={handleCreate}>部屋を作成</Btn>
      </Modal>

      {/* 参加モーダル */}
      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="部屋に参加">
        <Input label="部屋コード (4文字)" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="XXXX" maxLength={4} style={{ fontSize: 28, letterSpacing: 8, textAlign: 'center', fontWeight: 600 }} />
        <Btn variant="primary" fullWidth onClick={handleJoin}>参加する</Btn>
      </Modal>
    </div>
  )
}
