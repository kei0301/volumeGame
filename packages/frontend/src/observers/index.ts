import * as R from "remeda"
import { inbox } from "./streams/inbox"
import { blockchain } from "./streams/blockchain"
import { chainlink, latestChainlinkPrices } from "./streams/chainlink"
import { pool } from "./streams/pool"
import { round } from "./streams/round"
import { Observable, partition, ReplaySubject } from "rxjs"
import { BlockStream, ChainlinkStream, RoundStream, UserStream } from "packages/shared/src/types"
import { distinctUntilChanged, map, pairwise, scan, skipWhile, withLatestFrom } from "rxjs/operators"
import { ready } from "./streams/ready"
import { io } from "socket.io-client"
import { endRound } from "./streams/endRound"
import { BACKEND_URL, BACKEND_WEBSOCKET } from "@pricegame/shared"
import { user } from "./streams/user"

// Subscribe all the streams to inbox
blockchain.subscribe((input) => inbox.next(input))
chainlink.pipe(distinctUntilChanged()).subscribe((input) => inbox.next(input))
round.subscribe((input) => inbox.next(input))
endRound.subscribe((input) => inbox.next(input))
pool.subscribe((input) => inbox.next(input))
user.subscribe((input) => inbox.next(input))

// Trigger debug logs
inbox.subscribe((input) => console.log("DEBUG", input))

// Split of the latest values from inbox stream
const [latestUser] = partition(inbox, (x) => x.type === "user") as [Observable<UserStream>, any]
const [latestRound] = partition(inbox, (x) => x.type === "round") as [Observable<RoundStream>, any]
const [latestChainlink] = partition(inbox, (x) => x.type === "chainlink") as [Observable<ChainlinkStream>, any]
const [latestBlock] = partition(inbox, (x) => x.type === "block") as [Observable<BlockStream>, any]

// Store chainlink data
latestChainlink.subscribe((input) => latestChainlinkPrices.next(input))

export const avgChainlinkUpdateTime = latestChainlinkPrices.pipe(
  pairwise(),
  map(([first, last]: any) => last.block - first.block),
  scan(
    (acc, current) => {
      const prices = [...acc.prices, current]
      const avgUpdateTime = R.reduce(prices, (acc, current) => acc + current, 0) / prices.length
      return { prices, avgUpdateTime }
    },
    { prices: [], avgUpdateTime: 0 },
  ),
  map(({ avgUpdateTime }) => avgUpdateTime),
)

fetch(BACKEND_URL)
  .then((response) => response.json())
  .then((response: any) => {
    console.log("RESPONSE", response)
    if (response.round) {
      const chainlinkDroppedData = R.dropLast(response.chainlink, 1)
      const chainlinkLast = R.last(response.chainlink) as Record<string, any>
      const chainlinkData = [...chainlinkDroppedData, { ...chainlinkLast, last: true }]
      round.next(response.round)
      chainlinkData.map((input: any) => chainlink.next(input))
      blockchain.next(response.block)
      ready.next(true)
    }
  })

const requests = new ReplaySubject()

const socket = io(BACKEND_WEBSOCKET, {
  path: "/stream",
  transports: ["polling", "websocket"],
})

socket.on("block", (input) => {
  requests.next(input)
})

socket.on("chainlink", (input) => {
  requests.next(input)
})

socket.on("round", (input) => {
  requests.next(input)
})
socket.on("endRound", (input) => {
  requests.next(input)
})

socket.on("pool", (input) => {
  requests.next(input)
})

requests
  .pipe(
    withLatestFrom(ready),
    skipWhile(([_, boolean]: any) => !boolean),
    map(([block]) => block),
  )
  .subscribe((x: any) => {
    if (x?.type === "block") {
      blockchain.next(x)
    } else if (x.type === "chainlink") {
      chainlink.next(x)
    } else if (x.type === "round") {
      round.next(x)
    } else if (x.type === "endRound") {
      endRound.next(x)
    } else if (x.type === "pool") {
      pool.next(x)
    }
  })

export { latestUser, inbox, latestRound, latestBlock, latestChainlink, latestChainlinkPrices }
