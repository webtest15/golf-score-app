export interface HoleScore {
  putts: number
  obs: number
}

export interface Player {
  id: string
  name: string
  holes: HoleScore[]
  totalScore: number | null
}

export interface Group {
  id: string
  name: string
  players: Player[]
  finished: boolean
}

export interface Room {
  id: string
  name: string
  code: string
  holes: number
  ruleA: number
  ruleB: number
  // 最終ホール2倍設定
  lastHoleDouble: boolean
  groups: Group[]
  finished: boolean
  createdAt: number
}

export interface PlayerWithStats extends Player {
  putts: number
  obs: number
  rankScore: number
  groupName: string
  groupId: string
  groupIdx: number
}

export type Screen = 'home' | 'room'
export type RoomTab = 'overview' | 'ranking' | 'input' | 'result'
