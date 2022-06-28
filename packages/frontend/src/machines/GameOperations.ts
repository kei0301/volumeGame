/* eslint-disable @typescript-eslint/no-extra-semi */
import { ethers } from "ethers"
import { inbox, latestRound, latestUser } from "../observers"
import {
  filterTypeBlock,
  filterTypeChainlink,
  filterTypePool,
  forward,
  getRound,
  getUserRound,
  postEndRound,
  postLockRound,
} from "../observers/utils"
import { chainlink } from "../observers/streams/chainlink"
import { of, iif, Observable } from "rxjs"
import { mapTo, delay, take, filter, concatMap, map, switchMap, distinctUntilChanged } from "rxjs/operators"
import { round } from "../observers/streams/round"
import { endRound } from "../observers/streams/endRound"
import { contractAddress } from "@pricegame/shared"
import BNBPricePredictionABI from "./BnbPricePrediction.json"

export const blockOperation =
  (type) =>
  ({ endBlock }) =>
  (cb) => {
    const sub = inbox.pipe(filterTypeBlock).subscribe(({ id: block }) => {
      if (block < endBlock) {
        cb({ type, block })
      } else {
        cb({ type, block })
        cb({ type: "COMPLETE" })
      }
    })

    return () => sub.unsubscribe()
  }

export const priceOperation = (type) => () => (cb) => {
  const sub = chainlink.subscribe(({ price }) => {
    cb({ type, price })
  })

  return () => sub.unsubscribe()
}

export const poolOperation = (type) => () => (cb) => {
  const sub = inbox.pipe(filterTypePool).subscribe(({ accruedPool: { up, down } }) => {
    cb({ type, up, down })
  })

  return () => sub.unsubscribe()
}
export const chainlinkListener = inbox.pipe(
  filterTypeChainlink,
  map(({ price }) => ({ price })),
  forward,
  take(1),
)

export const verifyPrice = (round) => of(round).pipe(forward, take(1))

export const processBet = ({ finalPrice, position }) => {
  return new Observable((observer) => {
    ;(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const predictionGameAddr1 = await new ethers.Contract(contractAddress, BNBPricePredictionABI, signer)
      const overrides = {
        value: ethers.utils.parseEther(String(finalPrice)),
      }
      let betRound
      try {
        if (position === "long") {
          betRound = await predictionGameAddr1.betBull(overrides)
          observer.next(betRound)
          observer.complete()
        } else {
          betRound = await predictionGameAddr1.betBear(overrides)
          observer.next(betRound)
          observer.complete()
        }
      } catch (err) {
        const message = err.data.message
        if (/insufficient funds/.test(message)) {
          observer.error({ message: "Insufficient founds" })
        } else {
          observer.error({ message: "Unknown error" })
        }
      }
      // // get some data here or do something else
      // observer.next(betRound)

      // observer.complete()
    })()
  })
}

export const betListener = (finalPrice, position) => {
  return of({ finalPrice, position }).pipe(
    concatMap((obj) => processBet(obj)),
    take(1),
    mapTo({ locked: true }),
    forward,
  )
}

export const roundListener = (roundValue) =>
  latestRound.pipe(
    filter((input: any) => input.round === roundValue),
    forward,
    take(1),
  )

export const endRoundListener = endRound.pipe(forward, take(1))

export const delayRoundListener = (round) =>
  of(round).pipe(
    concatMap((round) => getRound(round)),
    forward,
    take(1),
  )

export const roundGetter = (round) =>
  of(round).pipe(
    concatMap((round) => getRound(round)),
    forward,
    take(1),
  )

export const endRoundObs = () =>
  new Observable((observer) => {
    endRound.subscribe((x) => {
      observer.next(x)
    })
  })

export const startRoundObs = () =>
  new Observable((observer) => {
    round.subscribe((x) => {
      observer.next(x)
    })
  })

export const setEndRound = (currentRound) =>
  of(currentRound).pipe(
    concatMap((round) => postEndRound(round)),
    concatMap((x: any) => iif(() => x.missing, of(0).pipe(concatMap(() => endRoundObs())), of({ ...x }))),
    map(({ lockedPrice, endBlock }) => ({
      price: lockedPrice,
      endBlock,
    })),
    concatMap(() => getRound(currentRound)),
    map(({ closePrice, endBlock, bullAmount, bearAmount }) => ({
      price: closePrice,
      endBlock,
      accruedPool: {
        up: bullAmount,
        down: bearAmount,
        total: bullAmount + bearAmount,
      },
    })),
    forward,
    take(1),
    delay(2000),
  )

export const setStartRound = (currentRound) =>
  of(currentRound).pipe(
    delay(3000),
    concatMap((round) => postLockRound(round)),
    concatMap((x: any) => iif(() => x.missing, of(0).pipe(concatMap(() => startRoundObs())), of({ ...x }))),
    map(({ lockedPrice, startBlock }) => ({
      lockedPrice,
      startBlock,
      endBlock: startBlock + 100,
    })),
    concatMap(() => getRound(currentRound)),
    map(({ lockedPrice, lockBlock, startBlock, endBlock, bullAmount, bearAmount }) => ({
      lockedPrice,
      startBlock,
      lockBlock,
      endBlock,
      accruedPool: {
        up: bullAmount,
        down: bearAmount,
        total: bullAmount + bearAmount,
      },
    })),
    forward,
    take(1),
    delay(2000),
  )

export const initOpenOperation =
  (type) =>
  ({ round }) =>
  (cb) => {
    const sub = of(round)
      .pipe(
        concatMap((round) => getRound(round)),
        map(({ bullAmount, bearAmount }) => {
          if (bullAmount || bearAmount) {
            return {
              up: bullAmount,
              down: bearAmount,
            }
          } else {
            return { up: 0, down: 0 }
          }
        }),
      )
      .subscribe((input) => {
        cb({ type, ...input })
      })

    return () => sub.unsubscribe()
  }

export const getUserRoundOperation =
  ([typeSuccess, typeFail, updateBetAmount]) =>
  ({ round }) =>
  (cb) => {
    const sub = latestUser
      .pipe(
        distinctUntilChanged(),
        switchMap(({ account }) => getUserRound(account, round)),
      )
      .subscribe(({ position, amount, error }) => {
        if (!error && position) {
          cb({ type: updateBetAmount, round, position, amount })
          cb({ type: typeSuccess })
        } else {
          cb({ type: updateBetAmount, round, position: undefined, amount: undefined })
          cb({ type: typeFail })
        }
      })

    return () => sub.unsubscribe()
  }
