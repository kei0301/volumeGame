export interface BlockStream {
  type: "block"
  id: number
  forward?: boolean
}

export interface PriceStream {
  type: "price"
  price: number
  forward?: boolean
}

export interface ChainlinkStream {
  type: "chainlink"
  block: number
  price: number
  forward?: boolean
  last?: boolean
}

export interface RoundStream {
  type: "round" | "endRound"
  round: number
  startBlock: number
  endBlock: number
  lockedPrice?: number
}

export interface PoolStream {
  type: "pool"
  round: number
  accruedPool: {
    up: number
    down: number
    total?: number
  }
}

export interface UserStream {
  type: "user"
  account: string | undefined
}

export type InboxStream = UserStream | BlockStream | PriceStream | ChainlinkStream | RoundStream | PoolStream
