import { RoundStream } from "@pricegame/shared/src/types"
import { BehaviorSubject } from "rxjs"

export const round = new BehaviorSubject<RoundStream>({ type: "round", startBlock: 0, endBlock: 0, round: 0 })
