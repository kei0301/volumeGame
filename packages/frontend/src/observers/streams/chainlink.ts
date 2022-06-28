import { ChainlinkStream } from "@pricegame/shared/src/types"
import { BehaviorSubject, ReplaySubject } from "rxjs"

export const chainlink = new BehaviorSubject<ChainlinkStream>(undefined)
export const latestChainlinkPrices = new ReplaySubject<ChainlinkStream>()
