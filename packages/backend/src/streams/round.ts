import * as R from "remeda"
import { Subject } from "rxjs"
import { roundStartEvent } from "../abis/BNBPricePredictionABI"
import { mainContract, web3TestNet } from "../providers"
import { from, Observable } from "rxjs"
import { concatMap, delay, map, skipWhile, take, tap } from "rxjs/operators"
import { blockTestNet } from "./block"
import { eventFilters } from "../lib/filters"

export const round = new Subject()

export const decodeNewRound = (data) => {
  const decoded: any = web3TestNet.eth.abi.decodeLog(roundStartEvent, data.data, data.topics)
  if (data?.args) {
    const priceArray = Array.from(data.args.price.toString())
    const price = [priceArray[0], priceArray[1], priceArray[2], ".", ...priceArray].join("")
    return {
      round: Number(BigInt(data.topics[1])),
      lockedPrice: Number(price),
      startBlock: Number(decoded.blockNumber),
    }
  } else {
    return { round: Number(BigInt(data.topics[1])), startBlock: Number(decoded.blockNumber) }
  }
}

export const fetchRoundHistoryTestNet = () =>
  blockTestNet.pipe(
    delay(500),
    skipWhile((blockType: any) => blockType.id === 0),
    concatMap(({ id: block }: any) => {
      console.log("HERE: 0")
      return new Observable((observer) => {
        from(mainContract.queryFilter(eventFilters.lockRound))
          .pipe(
            map((input) => {
              console.log("HERE: 1")
              const rounds = R.map(input, (x: any) => {
                const data = decodeNewRound(x)
                return {
                  type: "round",
                  round: data.round,
                  startBlock: data.startBlock,
                  endBlock: data.startBlock + 100,
                  lockedPrice: data?.lockedPrice,
                }
              })
              console.log("HERE: ", rounds)
              return R.last(rounds)
            }),
          )
          .subscribe(observer)
      })
    }),
    take(1),
  )

export const fetchRound = ({ type }) =>
  blockTestNet.pipe(
    delay(2000),
    skipWhile((blockType: any) => blockType.id === 0),
    concatMap(({ id: block }: any) => {
      return new Observable((observer) => {
        from(mainContract.queryFilter(eventFilters[type], block - 1000, block))
          .pipe(
            map((input) => {
              const rounds = R.map(input, (x: any) => {
                const data = decodeNewRound(x)
                return {
                  type: "endRound",
                  round: data.round,
                  startBlock: data.startBlock,
                  endBlock: data.startBlock + 100,
                  lockedPrice: data?.lockedPrice,
                }
              })
              return R.last(rounds)
            }),
          )
          .subscribe(observer)
      })
    }),
    take(1),
  )

export const fetchMatchingRound = ({ type, round }) =>
  blockTestNet.pipe(
    delay(1000),
    skipWhile((blockType: any) => blockType.id === 0),
    concatMap(({ id: block }: any) => {
      return new Observable((observer) => {
        from(mainContract.queryFilter(eventFilters[type], block - 1000, block))
          .pipe(
            map((input) => {
              const rounds = R.map(input, (x: any) => {
                const data = decodeNewRound(x)
                return {
                  type,
                  round: data.round,
                  startBlock: data.startBlock,
                  endBlock: data.startBlock + 100,
                  lockedPrice: data?.lockedPrice,
                }
              })
              return R.find(rounds, (input) => input.round === round)
            }),
          )
          .subscribe(observer)
      })
    }),
    take(1),
  )
