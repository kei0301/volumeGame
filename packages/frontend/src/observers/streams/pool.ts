import { PoolStream } from "@pricegame/shared/src/types"
import { BehaviorSubject } from "rxjs"

export const pool = new BehaviorSubject<PoolStream>({
  type: "pool",
  round: 0,
  accruedPool: {
    up: 0,
    down: 0,
  },
})
