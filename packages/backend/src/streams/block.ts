import { BehaviorSubject, Observable, of } from "rxjs"
import { catchError, concatMap, tap, timeout } from "rxjs/operators"
import { ethersMainNet, ethersTestNet } from "../providers"

export const blockMainNet = new BehaviorSubject({ type: "block", id: 0 })
export const blockTestNet = new BehaviorSubject({ type: "block", id: 0 })
const checkConnection = async () => {}
ethersMainNet.on("block", (block) => {
  console.log("")
  console.log("[Mainnet] Block", block)
  blockMainNet.next({ type: "block", id: block })
})

ethersTestNet.on("block", (block) => {
  console.log("[Testnet] Block", block)
  blockTestNet.next({ type: "block", id: block })
})

ethersTestNet.on("error", (error) => console.error("ETHERS_TEST_NET", error))

export const fetchBlockTestNet = () =>
  of(0).pipe(
    concatMap(() => {
      return new Observable((observer) => {
        ethersTestNet.once("block", (block) => {
          of({ type: "block", id: block }).subscribe(observer)
        })
      })
    }),
    timeout(10000),
    catchError(() => of("ERROR")),
  )
