import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { getAllPlayersRanked, getGroupColor } from '../utils'
import { Chip, LiveBadge } from './ui'
import type { PlayerWithStats } from '../types'

interface RankItem extends PlayerWithStats {
  rank: number
  delta: number
}

type Phase =
  | 'idle'        // 初回表示前
  | 'countdown'   // 「発表します...」カウントダウン
  | 'revealing'   // 最下位から1枚ずつ登場
  | 'winner'      // 1位だけ特別演出
  | 'done'        // 完了・通常表示

const COUNTDOWN_MS = 1800   // カウントダウン表示時間
const CARD_INTERVAL = 320   // 1枚ずつ出る間隔(ms)
const WINNER_HOLD_MS = 900  // 1位だけ止まって輝く時間

export function RankingTab() {
  const { currentRoom, prevRanks, setPrevRanks, roomTab } = useStore()
  const room = currentRoom()

  const [phase, setPhase] = useState<Phase>('idle')
  const [revealedCount, setRevealedCount] = useState(0)   // 何枚まで表示したか
  const [items, setItems] = useState<RankItem[]>([])
  const [countdown, setCountdown] = useState(3)
  const [winnerFlash, setWinnerFlash] = useState(false)
  const prevRanksRef = useRef<Record<string, number>>({})
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => { timerRefs.current.forEach(clearTimeout); timerRefs.current = [] }

  const buildItems = useCallback((): RankItem[] => {
    if (!room) return []
    const ranked = getAllPlayersRanked(room)
    const newRanks: Record<string, number> = {}
    const built = ranked.map((p, i) => {
      const rank = i + 1
      const prev = prevRanksRef.current[p.id]
      const delta = prev ? prev - rank : 0
      newRanks[p.id] = rank
      return { ...p, rank, delta }
    })
    prevRanksRef.current = newRanks
    setPrevRanks(newRanks)
    return built
  }, [room, setPrevRanks])

  // ランキングタブを開いたら演出スタート
  useEffect(() => {
    if (roomTab !== 'ranking') {
      // タブを離れたらリセット（次回また演出を楽しめる）
      clearTimers()
      setPhase('idle')
      setRevealedCount(0)
      setWinnerFlash(false)
      return
    }
    if (!room || getAllPlayersRanked(room).length === 0) return

    clearTimers()
    const built = buildItems()
    setItems(built)
    setRevealedCount(0)
    setWinnerFlash(false)

    // フェーズ1: カウントダウン
    setPhase('countdown')
    setCountdown(3)
    const t1 = setTimeout(() => setCountdown(2), 500)
    const t2 = setTimeout(() => setCountdown(1), 1000)
    const t3 = setTimeout(() => {
      setCountdown(0)
    }, 1500)

    // フェーズ2: 最下位から1枚ずつ reveal（逆順 = 最下位から）
    const t4 = setTimeout(() => {
      setPhase('revealing')
      const total = built.length
      // 最下位(total番目)から1位(1番目)へ
      for (let i = 0; i < total; i++) {
        const t = setTimeout(() => {
          setRevealedCount(i + 1)
          // 最後の1枚(=1位)を出す直前
          if (i === total - 2) {
            // 少し止める → winner フェーズ
          }
          if (i === total - 1) {
            // 全員出た → winner演出
            const tw = setTimeout(() => {
              setPhase('winner')
              setWinnerFlash(true)
              const td = setTimeout(() => {
                setPhase('done')
              }, WINNER_HOLD_MS + 600)
              timerRefs.current.push(td)
            }, 80)
            timerRefs.current.push(tw)
          }
        }, i * CARD_INTERVAL + (i === total - 1 ? CARD_INTERVAL * 1.5 : 0))
        timerRefs.current.push(t)
      }
    }, COUNTDOWN_MS)

    timerRefs.current.push(t1, t2, t3, t4)
    return clearTimers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomTab])

  if (!room) return null
  const allRanked = getAllPlayersRanked(room)

  if (allRanked.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 14 }}>グループを追加するとランキングが表示されます</div>
      </div>
    )
  }

  // 最下位から表示するので items を逆順にして revealedCount 枚取り出す
  // → 画面表示は rank 昇順に並べ直す
  const reversed = [...items].reverse()  // reversed[0] = 最下位
  const visibleReversed = reversed.slice(0, revealedCount)
  const visibleItems = [...visibleReversed].reverse() // 画面では1位が上

  // ── カウントダウン画面 ──────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, gap: 16 }}>
        <div style={{ fontSize: 15, color: '#888', fontWeight: 500, letterSpacing: 1 }}>暫定ランキング発表！</div>
        <div style={{
          fontSize: countdown === 0 ? 56 : 80,
          fontWeight: 700,
          color: '#1D9E75',
          lineHeight: 1,
          animation: 'cdPop 0.35s cubic-bezier(.4,0,.2,1)',
          transition: 'font-size 0.2s',
          minHeight: 100,
          display: 'flex', alignItems: 'center',
        }}>
          {countdown === 0 ? 'GO!' : countdown}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[3,2,1].map((n) => (
            <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: countdown <= n ? '#1D9E75' : '#e0e0e0', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>
    )
  }

  // ── 発表中 / 完了画面 ──────────────────────────────────
  return (
    <div style={{ padding: '14px 16px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, fontSize: 12, color: '#888' }}>
          スコア + パター×{room.ruleA} + OB×{room.ruleB}
          {room.lastHoleDouble && (
            <span style={{ marginLeft: 6, padding: '2px 7px', background: '#FFF3CD', color: '#856404', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
              最終H×2倍
            </span>
          )}
        </div>
        {phase === 'done' && <LiveBadge />}
      </div>

      {/* プレースホルダー（未発表の枠） */}
      {phase === 'revealing' && (
        <div style={{ marginBottom: 7 }}>
          {Array.from({ length: items.length - revealedCount }).map((_, i) => (
            <div key={i} style={{ height: 60, borderRadius: 10, background: '#f0f0f0', marginBottom: 7, animation: 'pulse 1.2s ease infinite' }} />
          ))}
        </div>
      )}

      {/* カードリスト */}
      {visibleItems.map((p) => {
        const gc = getGroupColor(p.groupIdx)
        const isFirst = p.rank === 1
        const medalBg = isFirst ? '#FFD700' : p.rank === 2 ? '#C0C0C0' : p.rank === 3 ? '#CD7F32' : '#f0f0f0'
        const medalColor = isFirst ? '#5A3E00' : p.rank === 2 ? '#2C2C2A' : p.rank === 3 ? '#fff' : '#888'

        return (
          <div
            key={p.id}
            style={{
              background: isFirst && winnerFlash ? 'linear-gradient(135deg,#fffbe6,#fff9d0)' : '#fff',
              borderRadius: 10,
              border: isFirst && winnerFlash ? '2px solid #FFD700' : '1px solid #e8e8e8',
              borderLeft: isFirst && winnerFlash ? '4px solid #FFD700' : `3px solid ${gc.border}`,
              padding: '11px 14px',
              marginBottom: 7,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: isFirst && winnerFlash
                ? '0 0 0 4px rgba(255,215,0,0.25), 0 4px 20px rgba(255,200,0,0.2)'
                : isFirst ? '0 2px 12px rgba(29,158,117,0.12)' : undefined,
              animation: isFirst && phase === 'winner'
                ? 'winnerPop 0.55s cubic-bezier(.4,0,.2,1)'
                : 'slideInFromBottom 0.42s cubic-bezier(.4,0,.2,1)',
              transition: 'box-shadow 0.4s, border 0.4s, background 0.4s',
            }}
          >
            {/* メダル */}
            <div style={{
              width: isFirst && winnerFlash ? 38 : 32,
              height: isFirst && winnerFlash ? 38 : 32,
              borderRadius: '50%',
              background: medalBg,
              color: medalColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
              fontSize: isFirst && winnerFlash ? 18 : 15,
              flexShrink: 0,
              transition: 'all 0.4s',
              boxShadow: isFirst && winnerFlash ? '0 2px 8px rgba(255,200,0,0.5)' : undefined,
            }}>
              {isFirst && winnerFlash ? '👑' : p.rank}
            </div>

            {/* 名前・グループ */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: isFirst && winnerFlash ? 16 : 14, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'font-size 0.3s' }}>
                {p.name}
                {isFirst && winnerFlash && <span style={{ marginLeft: 6, fontSize: 12, color: '#856404' }}>🎉</span>}
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' as const }}>
                <Chip bg={gc.chipBg} color={gc.chipText}>{p.groupName}</Chip>
                <span>P:{p.putts} OB:{p.obs}{p.totalScore != null ? ` / ${p.totalScore}打` : ''}</span>
              </div>
            </div>

            {/* スコア + 変動バッジ */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span style={{ fontSize: isFirst && winnerFlash ? 24 : 20, fontWeight: 700, color: isFirst && winnerFlash ? '#856404' : '#1D9E75', transition: 'all 0.4s' }}>
                {Math.round(p.rankScore)}
              </span>
              {p.delta !== 0 && phase === 'done' && (
                <div style={{
                  padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                  background: p.delta > 0 ? '#E1F5EE' : '#FAECE7',
                  color: p.delta > 0 ? '#1D9E75' : '#D85A30',
                  animation: 'deltaFlash 0.6s ease',
                }}>
                  {p.delta > 0 ? `▲${p.delta}` : `▼${Math.abs(p.delta)}`}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* 再発表ボタン */}
      {phase === 'done' && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            onClick={() => {
              setPhase('idle')
              setRevealedCount(0)
              // 少し待ってから再トリガー
              setTimeout(() => {
                const built = buildItems()
                setItems(built)
                setRevealedCount(0)
                setWinnerFlash(false)
                setPhase('countdown')
                setCountdown(3)
                clearTimers()
                const t1 = setTimeout(() => setCountdown(2), 500)
                const t2 = setTimeout(() => setCountdown(1), 1000)
                const t3 = setTimeout(() => setCountdown(0), 1500)
                const t4 = setTimeout(() => {
                  setPhase('revealing')
                  built.forEach((_, i) => {
                    const t = setTimeout(() => {
                      setRevealedCount(i + 1)
                      if (i === built.length - 1) {
                        const tw = setTimeout(() => {
                          setPhase('winner'); setWinnerFlash(true)
                          const td = setTimeout(() => setPhase('done'), WINNER_HOLD_MS + 600)
                          timerRefs.current.push(td)
                        }, 80)
                        timerRefs.current.push(tw)
                      }
                    }, i * CARD_INTERVAL + (i === built.length - 1 ? CARD_INTERVAL * 1.5 : 0))
                    timerRefs.current.push(t)
                  })
                }, COUNTDOWN_MS)
                timerRefs.current.push(t1, t2, t3, t4)
              }, 100)
            }}
            style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid #e0e0e0', background: '#fff', color: '#888', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            🔄 もう一度発表
          </button>
        </div>
      )}
    </div>
  )
}
