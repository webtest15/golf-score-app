import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Btn, Modal, Input, LiveBadge } from './ui'
import { OverviewTab } from './OverviewTab'
import { RankingTab } from './RankingTab'
import { InputTab } from './InputTab'
import { ResultTab } from './ResultTab'
import type { RoomTab } from '../types'

const TABS: { key: RoomTab; label: string }[] = [
  { key: 'overview', label: '概要' },
  { key: 'ranking', label: 'ランキング' },
  { key: 'input', label: 'グループ入力' },
  { key: 'result', label: '結果' },
]

export function RoomScreen() {
  const {
    currentRoom, roomTab, setRoomTab, goHome,
    addGroup, notify,
    updateRuleA, updateRuleB, toggleLastHoleDouble,
    deleteRoom, resetRoom,
  } = useStore()
  const room = currentRoom()

  const [showAddGroup, setShowAddGroup] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState('')
  const [localA, setLocalA] = useState(room?.ruleA ?? 1)
  const [localB, setLocalB] = useState(room?.ruleB ?? 2)

  if (!room) return null

  const handleAddGroup = () => {
    const names = members.split(/[,、\s]+/).map((s) => s.trim()).filter(Boolean)
    if (!names.length) { notify('メンバーを入力してください'); return }
    addGroup(groupName || `グループ${room.groups.length + 1}`, names)
    setGroupName(''); setMembers('')
    setShowAddGroup(false)
  }

  const handleSaveSettings = () => {
    updateRuleA(localA)
    updateRuleB(localB)
    setShowSettings(false)
    notify('ルール設定を保存しました')
  }

  const handleReset = () => {
    resetRoom(room.id)
    setShowResetConfirm(false)
    setShowSettings(false)
  }

  const handleDelete = () => {
    deleteRoom(room.id)
    // deleteRoom 内で goHome 相当の処理をするので画面遷移は自動
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>

      {/* ヘッダー */}
      <div style={{ background: 'linear-gradient(135deg, #085041, #1D9E75)', color: '#fff', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button onClick={goHome} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>{room.name}</div>
          <LiveBadge />
        </div>
        <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          <span>{room.groups.length}グループ / {room.holes}ホール / パター×{room.ruleA} OB×{room.ruleB}</span>
          {room.lastHoleDouble && (
            <span style={{ padding: '1px 7px', background: 'rgba(255,220,50,0.3)', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>最終H×2倍</span>
          )}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, opacity: 0.7, marginBottom: 1 }}>部屋コード</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>{room.code}</div>
          </div>
          {[
            { label: 'コピー', fn: () => notify(`コード「${room.code}」をコピー！`) },
            { label: '+ グループ', fn: () => setShowAddGroup(true) },
            { label: '設定', fn: () => { setLocalA(room.ruleA); setLocalB(room.ruleB); setShowSettings(true) } },
          ].map((b) => (
            <button key={b.label} onClick={b.fn} style={{ background: 'rgba(255,255,255,0.22)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 500 }}>{b.label}</button>
          ))}
        </div>
      </div>

      {/* タブバー */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 138, zIndex: 29 }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setRoomTab(key)} style={{ flex: 1, padding: '12px 4px', textAlign: 'center', fontSize: 12, fontFamily: 'inherit', border: 'none', cursor: 'pointer', background: 'none', color: roomTab === key ? '#1D9E75' : '#888', borderBottom: roomTab === key ? '2px solid #1D9E75' : '2px solid transparent', fontWeight: roomTab === key ? 600 : 400, transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      {roomTab === 'overview' && <OverviewTab onAddGroup={() => setShowAddGroup(true)} />}
      {roomTab === 'ranking' && <RankingTab />}
      {roomTab === 'input' && <InputTab />}
      {roomTab === 'result' && <ResultTab />}

      {/* グループ追加 */}
      <Modal open={showAddGroup} onClose={() => setShowAddGroup(false)} title="グループを追加">
        <Input label="グループ名" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="例: Aチーム" />
        <Input label="メンバー（カンマ区切り）" value={members} onChange={(e) => setMembers(e.target.value)} placeholder="例: 田中,佐藤,鈴木" />
        <Btn variant="primary" fullWidth onClick={handleAddGroup}>グループ追加</Btn>
      </Modal>

      {/* 設定モーダル */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="設定">

        {/* ─ ルール設定 ─ */}
        <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>ルール設定</div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>パターの重み A = {localA}</label>
          <input type="range" min={0} max={5} step={0.5} value={localA} onChange={(e) => setLocalA(+e.target.value)} style={{ width: '100%', accentColor: '#1D9E75' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>OBの重み B = {localB}</label>
          <input type="range" min={0} max={10} step={0.5} value={localB} onChange={(e) => setLocalB(+e.target.value)} style={{ width: '100%', accentColor: '#1D9E75' }} />
        </div>

        {/* 最終ホール2倍トグル */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid #f0f0f0', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>最終ホールを2倍にする</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>最終HのP・OBを×2で計算</div>
          </div>
          <div onClick={() => toggleLastHoleDouble()} style={{ width: 48, height: 26, borderRadius: 13, cursor: 'pointer', background: room.lastHoleDouble ? '#1D9E75' : '#ccc', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: room.lastHoleDouble ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: '#f5f5f5', borderRadius: 8, fontSize: 12, color: '#666', marginBottom: 16 }}>
          総合スコア = 実スコア + パター×{localA} + OB×{localB}
          {room.lastHoleDouble && <><br /><span style={{ color: '#856404' }}>※最終ホールのみ P・OBを×2で計算</span></>}
        </div>

        <Btn variant="primary" fullWidth onClick={handleSaveSettings} style={{ marginBottom: 20 }}>ルール設定を保存</Btn>

        {/* ─ 危険な操作 ─ */}
        <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 10, letterSpacing: 0.5, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>データ管理</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setShowResetConfirm(true)}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span style={{ fontSize: 18 }}>🔄</span>
            <div>
              <div>スコアをリセット</div>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 400, marginTop: 2 }}>グループ・メンバーはそのまま、スコアだけ0に戻す</div>
            </div>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1px solid #ffd0d0', background: '#fff5f5', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#D85A30', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span style={{ fontSize: 18 }}>🗑️</span>
            <div>
              <div>この部屋を削除</div>
              <div style={{ fontSize: 11, color: '#e8a090', fontWeight: 400, marginTop: 2 }}>すべてのデータを削除（取り消し不可）</div>
            </div>
          </button>
        </div>
      </Modal>

      {/* リセット確認 */}
      <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="スコアをリセット">
        <div style={{ padding: '12px 0 20px', fontSize: 14, color: '#555', lineHeight: 1.7 }}>
          全プレイヤーのパター数・OB数・合計スコアを <b>0 にリセット</b>します。<br />
          グループとメンバーの設定はそのまま残ります。
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn fullWidth onClick={() => setShowResetConfirm(false)}>キャンセル</Btn>
          <button
            onClick={handleReset}
            style={{ flex: 1, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#555', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            リセットする
          </button>
        </div>
      </Modal>

      {/* 削除確認 */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="部屋を削除しますか？">
        <div style={{ padding: '12px 0 20px', fontSize: 14, color: '#555', lineHeight: 1.7 }}>
          「<b>{room.name}</b>」を削除します。<br />
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
    </div>
  )
}
