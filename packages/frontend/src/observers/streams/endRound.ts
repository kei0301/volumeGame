import { RoundStream } from "@pricegame/shared/src/types"
import { Subject } from "rxjs"

// export const endRound = new BehaviorSubject<RoundStream>({ type: "round", startBlock: 0, endBlock: 0, round: 0 })
export const endRound = new Subject<RoundStream>()
