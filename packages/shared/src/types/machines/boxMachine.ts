export enum States {
  Initial = "initial",
  Waiting = "waiting",
  Opening = "opening",
  Open = "open",
  OpenInitial = "open.initial",
  OpenEntered = "open.entered",
  OpenEntering = "open.entering",
  OpenBet = "open.bet",
  Entering = "entering",
  Bet = "bet",
  Betting = "betting",
  Entered = "entered",
  GoingLive = "goingLive",
  Live = "live",
  Completing = "completing",
  Complete = "complete",
  Winner = "winner",
  Loser = "loser",
  CompleteInitial = "complete.initial",
  CompleteWinner = "complete.winner",
  CompleteLoser = "complete.loser",
}

type Button = {
  title: string
  show: boolean
  color: string
  textColor: string
  active: boolean
  selected: boolean
  disabled: boolean
}

type Display = {
  [name: string]: string | undefined
}

type View = {
  [string: string]: boolean
}

export type Context = {
  round: number | undefined
  display: Display
  toggle: View
  init: boolean
  initState: States
  price: number
  block: number
  ribbons: {
    [position: string]: {
      type: string | undefined
      color: string
      display: string | undefined
    }
  }
  winner: {
    side: "up" | "down" | undefined
    amount: number | undefined
  }
  accruedPool: {
    up: number
    down: number
    total?: number
  }
  payout: {
    up: number
    down: number
  }
  startBlock: number
  lockBlock: number
  endBlock: number
  lockedPrice: number
  countdownMachine: any
  checklistMachine: any
  dollarAmount: number
  bet: {
    locked: boolean
    position: any
    displayAmount: number | undefined
    amount: any
  }
  top: Button
  bottom: Button
}
