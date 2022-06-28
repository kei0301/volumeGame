import * as R from "remeda"
import { abi } from "@pricegame/shared"
import { from, Observable } from "rxjs"
import { chainlinkContract, web3MainNet } from "../providers"
import { concatMap, map, skipWhile, take } from "rxjs/operators"
import { blockMainNet } from "./block"
import { chainlinkPriceUpdate } from "../lib/filters"

export const decodePrice = (data) => {
  const decoded: any = web3MainNet.eth.abi.decodeLog(abi, data.data, data.topics)
  return decoded.answer / 10 ** 8
}

export const fetchChainlinkHistoryMainNet = () =>
  blockMainNet.pipe(
    skipWhile((blockType: any) => blockType.id === 0),
    concatMap(({ id: block }: any) => {
      return new Observable((observer) => {
        from(chainlinkContract.queryFilter(chainlinkPriceUpdate, block - 1000, block))
          .pipe(
            map((prices) => {
              return R.map(prices, (x: any) => ({ type: "chainlink", block: x.blockNumber, price: decodePrice(x) }))
            }),
          )
          .subscribe(observer)
      })
    }),
    take(1),
  )
