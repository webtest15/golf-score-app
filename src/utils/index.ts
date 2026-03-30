import type { Player, PlayerWithStats, Room } from '../types'

export const uid = (): string => Math.random().toString(36).slice(2, 9)

export const genCode = (): string =>
  Math.random().toString(36).slice(2, 6).toUpperCase()

/**
 * スコア計算
 * lastHoleDouble=true のとき最終ホールのputts/obsを2倍で計算
 */
export const calcRankScore = (
  p: Player,
  ruleA: number,
  ruleB: number,
  lastHoleDouble = false
): number => {
  const lastIdx = p.holes.length - 1
  let putts = 0
  let obs = 0
  p.holes.forEach((h, i) => {
    const mul = lastHoleDouble && i === lastIdx ? 2 : 1
    putts += h.putts * mul
    obs += h.obs * mul
  })
  const base = p.totalScore ?? 0
  return base + putts * ruleA + obs * ruleB
}

export const getAllPlayersRanked = (room: Room): PlayerWithStats[] => {
  const players: PlayerWithStats[] = []
  room.groups.forEach((g, gi) => {
    g.players.forEach((p) => {
      // 表示用 putts/obs は素の合計（2倍なし）
      const putts = p.holes.reduce((s, h) => s + h.putts, 0)
      const obs = p.holes.reduce((s, h) => s + h.obs, 0)
      players.push({
        ...p,
        putts,
        obs,
        rankScore: calcRankScore(p, room.ruleA, room.ruleB, room.lastHoleDouble),
        groupName: g.name,
        groupId: g.id,
        groupIdx: gi,
      })
    })
  })
  return players.sort((a, b) => a.rankScore - b.rankScore)
}

export const GROUP_COLORS = [
  { bg: '#E1F5EE', text: '#085041', border: '#1D9E75', chipBg: '#E1F5EE', chipText: '#085041' },
  { bg: '#E6F1FB', text: '#185FA5', border: '#185FA5', chipBg: '#E6F1FB', chipText: '#185FA5' },
  { bg: '#FAEEDA', text: '#412402', border: '#BA7517', chipBg: '#FAEEDA', chipText: '#412402' },
  { bg: '#FAECE7', text: '#D85A30', border: '#D85A30', chipBg: '#FAECE7', chipText: '#D85A30' },
  { bg: '#EEEDFE', text: '#26215C', border: '#534AB7', chipBg: '#EEEDFE', chipText: '#26215C' },
]

export const getGroupColor = (idx: number) => GROUP_COLORS[idx % GROUP_COLORS.length]

export const makeDemoRoom = (): Room => {
  const mk = (name: string, putBase: number, obIdx: number[], holes: number): Player => ({
    id: uid(),
    name,
    totalScore: null,
    holes: Array.from({ length: holes }, (_, i) => ({
      putts: putBase + (i % 3),
      obs: obIdx.includes(i) ? 1 : 0,
    })),
  })
  const h = 9
  return {
    id: uid(),
    name: '夏季社内ゴルフ大会',
    code: 'DEMO',
    holes: h,
    ruleA: 1,
    ruleB: 2,
    lastHoleDouble: false,
    finished: false,
    createdAt: Date.now(),
    groups: [
      {
        id: uid(), name: 'Aチーム', finished: false,
        players: [mk('田中', 1, [3], h), mk('佐藤', 2, [1, 5], h), mk('鈴木', 1, [], h), mk('高橋', 3, [0, 2], h), mk('伊藤', 2, [], h)],
      },
      {
        id: uid(), name: 'Bチーム', finished: false,
        players: [mk('渡辺', 1, [], h), mk('山本', 2, [2], h), mk('中村', 1, [4], h), mk('小林', 3, [1], h)],
      },
      {
        id: uid(), name: 'Cチーム', finished: false,
        players: [mk('加藤', 2, [], h), mk('吉田', 1, [3], h), mk('山田', 2, [0, 5], h)],
      },
    ],
  }
}

// ─── localStorage persistence ───────────────────────────────────
const STORAGE_KEY = 'golf_battle_state'

export const saveToStorage = (data: unknown) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('storage save failed', e)
  }
}

export const loadFromStorage = <T>(fallback: T): T => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
