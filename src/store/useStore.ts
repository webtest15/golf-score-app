import { create } from 'zustand'
import type { Room, Screen, RoomTab, Group, Player } from '../types'
import { uid, genCode, makeDemoRoom, saveToStorage, loadFromStorage } from '../utils'

interface PersistedState {
  rooms: Room[]
}

interface AppState extends PersistedState {
  currentRoomId: string | null
  screen: Screen
  roomTab: RoomTab
  activeGroupId: string | null
  currentHole: number
  prevRanks: Record<string, number>
  notification: string

  createRoom: (name: string, holes: number, ruleA: number, ruleB: number, lastHoleDouble: boolean) => void
  joinRoom: (code: string) => boolean
  openRoom: (id: string) => void
  goHome: () => void
  deleteRoom: (id: string) => void
  resetRoom: (id: string) => void
  setRoomTab: (tab: RoomTab) => void
  setActiveGroup: (id: string) => void
  setCurrentHole: (hole: number) => void
  addGroup: (name: string, memberNames: string[]) => void
  updateRuleA: (val: number) => void
  updateRuleB: (val: number) => void
  toggleLastHoleDouble: () => void
  changeCount: (groupId: string, playerId: string, key: 'putts' | 'obs', delta: number) => void
  setTotalScore: (groupId: string, playerId: string, score: number | null) => void
  confirmGroupScore: (groupId: string) => void
  setPrevRanks: (ranks: Record<string, number>) => void
  notify: (msg: string) => void
  loadDemo: () => void
  currentRoom: () => Room | undefined
  currentGroup: () => Group | undefined
}

const persist = (rooms: Room[]) => saveToStorage({ rooms })
const initial = loadFromStorage<PersistedState>({ rooms: [] })

export const useStore = create<AppState>((set, get) => ({
  rooms: initial.rooms,
  currentRoomId: null,
  screen: 'home',
  roomTab: 'overview',
  activeGroupId: null,
  currentHole: 0,
  prevRanks: {},
  notification: '',

  currentRoom: () => get().rooms.find((r) => r.id === get().currentRoomId),
  currentGroup: () => {
    const room = get().currentRoom()
    return room?.groups.find((g) => g.id === get().activeGroupId)
  },

  createRoom: (name, holes, ruleA, ruleB, lastHoleDouble) => {
    const room: Room = {
      id: uid(), name, holes, ruleA, ruleB, lastHoleDouble,
      code: genCode(), groups: [], finished: false, createdAt: Date.now(),
    }
    set((s) => {
      const rooms = [...s.rooms, room]
      persist(rooms)
      return { rooms, currentRoomId: room.id, screen: 'room', roomTab: 'overview', activeGroupId: null, currentHole: 0, prevRanks: {} }
    })
    get().notify(`部屋「${name}」を作成！コード: ${room.code}`)
  },

  joinRoom: (code) => {
    const room = get().rooms.find((r) => r.code === code.toUpperCase())
    if (!room) return false
    set({ currentRoomId: room.id, screen: 'room', roomTab: 'overview', activeGroupId: null, currentHole: 0, prevRanks: {} })
    return true
  },

  openRoom: (id) => {
    set({ currentRoomId: id, screen: 'room', roomTab: 'overview', activeGroupId: null, currentHole: 0, prevRanks: {} })
  },

  goHome: () => set({ screen: 'home', currentRoomId: null }),

  // 部屋を完全に削除
  deleteRoom: (id) => {
    set((s) => {
      const rooms = s.rooms.filter((r) => r.id !== id)
      persist(rooms)
      return { rooms, screen: 'home', currentRoomId: null }
    })
    get().notify('部屋を削除しました')
  },

  // スコアだけリセット（グループ・メンバー・ルールは保持）
  resetRoom: (id) => {
    set((s) => {
      const rooms = s.rooms.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          finished: false,
          groups: r.groups.map((g) => ({
            ...g,
            finished: false,
            players: g.players.map((p) => ({
              ...p,
              totalScore: null,
              holes: Array.from({ length: r.holes }, () => ({ putts: 0, obs: 0 })),
            })),
          })),
        }
      })
      persist(rooms)
      return { rooms, roomTab: 'overview', activeGroupId: null, currentHole: 0, prevRanks: {} }
    })
    get().notify('スコアをリセットしました')
  },

  setRoomTab: (tab) => set({ roomTab: tab }),
  setActiveGroup: (id) => set({ activeGroupId: id, currentHole: 0 }),
  setCurrentHole: (hole) => set({ currentHole: hole }),

  addGroup: (name, memberNames) => {
    const room = get().currentRoom()
    if (!room) return
    const group: Group = {
      id: uid(), name, finished: false,
      players: memberNames.map((n): Player => ({
        id: uid(), name: n, totalScore: null,
        holes: Array.from({ length: room.holes }, () => ({ putts: 0, obs: 0 })),
      })),
    }
    set((s) => {
      const rooms = s.rooms.map((r) => r.id === room.id ? { ...r, groups: [...r.groups, group] } : r)
      persist(rooms)
      return { rooms }
    })
    get().notify(`「${name}」を追加しました`)
  },

  updateRuleA: (val) => {
    const id = get().currentRoomId
    set((s) => {
      const rooms = s.rooms.map((r) => r.id === id ? { ...r, ruleA: val } : r)
      persist(rooms)
      return { rooms }
    })
  },

  updateRuleB: (val) => {
    const id = get().currentRoomId
    set((s) => {
      const rooms = s.rooms.map((r) => r.id === id ? { ...r, ruleB: val } : r)
      persist(rooms)
      return { rooms }
    })
  },

  toggleLastHoleDouble: () => {
    const id = get().currentRoomId
    set((s) => {
      const rooms = s.rooms.map((r) => r.id === id ? { ...r, lastHoleDouble: !r.lastHoleDouble } : r)
      persist(rooms)
      return { rooms }
    })
  },

  changeCount: (groupId, playerId, key, delta) => {
    const hole = get().currentHole
    const roomId = get().currentRoomId
    set((s) => {
      const rooms = s.rooms.map((r) => {
        if (r.id !== roomId) return r
        return {
          ...r,
          groups: r.groups.map((g) => {
            if (g.id !== groupId) return g
            return {
              ...g,
              players: g.players.map((p) => {
                if (p.id !== playerId) return p
                const holes = p.holes.map((h, i) =>
                  i === hole ? { ...h, [key]: Math.max(0, h[key] + delta) } : h
                )
                return { ...p, holes }
              }),
            }
          }),
        }
      })
      persist(rooms)
      return { rooms }
    })
  },

  setTotalScore: (groupId, playerId, score) => {
    const roomId = get().currentRoomId
    set((s) => {
      const rooms = s.rooms.map((r) => {
        if (r.id !== roomId) return r
        return {
          ...r,
          groups: r.groups.map((g) => {
            if (g.id !== groupId) return g
            return {
              ...g,
              players: g.players.map((p) =>
                p.id === playerId ? { ...p, totalScore: score } : p
              ),
            }
          }),
        }
      })
      persist(rooms)
      return { rooms }
    })
  },

  confirmGroupScore: (groupId) => {
    const roomId = get().currentRoomId
    set((s) => {
      const rooms = s.rooms.map((r) => {
        if (r.id !== roomId) return r
        const groups = r.groups.map((g) => g.id === groupId ? { ...g, finished: true } : g)
        return { ...r, groups, finished: groups.every((g) => g.finished) }
      })
      persist(rooms)
      return { rooms }
    })
  },

  setPrevRanks: (ranks) => set({ prevRanks: ranks }),

  notify: (msg) => {
    set({ notification: msg })
    setTimeout(() => set({ notification: '' }), 2500)
  },

  loadDemo: () => {
    const existing = get().rooms.find((r) => r.code === 'DEMO')
    if (existing) { get().openRoom(existing.id); return }
    const demo = makeDemoRoom()
    set((s) => {
      const rooms = [...s.rooms, demo]
      persist(rooms)
      return { rooms, currentRoomId: demo.id, screen: 'room', roomTab: 'overview', activeGroupId: null, currentHole: 0, prevRanks: {} }
    })
    get().notify('デモ: 夏季社内ゴルフ大会を読み込みました')
  },
}))
