import { avgChainlinkUpdateTime, inbox, latestBlock, latestChainlinkPrices, latestRound } from "../observers"
import { filterTypeChainlink } from "../observers/utils"

export const waitPriceOperation = () => (cb) => {
  const sub = inbox.pipe(filterTypeChainlink).subscribe(({ block, price }) => {
    cb({ type: "TRANSITION", price, block })
  })

  return () => sub.unsubscribe()
}

export const avgChainlinkUpdateOperation = () => (cb) => {
  const sub = avgChainlinkUpdateTime.subscribe((avgTime) => {
    cb({ type: "UPDATE_AVG_TIME", avgTime: avgTime.toFixed(0) })
  })

  return () => sub.unsubscribe()
}

export const pricesOperation = () => (cb) => {
  const sub = latestChainlinkPrices.subscribe(({ block, price, last }) => {
    cb({ type: "ADD_ITEM", block, price })
    last && cb({ type: "DONE", block })
  })
  return () => sub.unsubscribe()
}

export const updateBlockOperation = () => (cb) => {
  const sub = latestBlock.subscribe(({ id }) => {
    cb({ type: "UPDATE_BLOCK", block: id })
  })

  return () => sub.unsubscribe()
}

export const waitStartingRoundOperation = (type) => () => (cb) => {
  const sub = latestRound.subscribe(({ round, lockedPrice }) => {
    cb({ type, currentRound: round, currentPrice: lockedPrice })
  })
  return () => sub.unsubscribe()
}
