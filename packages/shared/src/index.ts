import { ObjectType } from "./types"

export const nearestValue = (arr: number[], val: number) =>
  arr.reduce((p: number, n: number) => (Math.abs(p) > Math.abs(n - val) ? n - val : p), Infinity) + val

export const sumQuantity = (acc: number, item: ObjectType) => {
  return acc + +item.quantity
}

export const sign = (sign, positive, neutral, negative) =>
  sign ? (sign > 0 ? positive : sign < 0 ? negative : neutral) : neutral

export const isWinner = (price: number, lockedPrice: number, position: string) => {
  if (price > lockedPrice) {
    return position === "up" ? true : false
  } else {
    return position === "down" ? true : false
  }
}

export const parseState = (state) => {
  const stateIsObject = typeof state === "object" && state !== null
  if (stateIsObject) {
    const key = Object.keys(state)[0]
    return `${key}.${state[key]}`
  } else {
    return state
  }
}

export * from "./constants"
export * from "./config"
export * from "./calculations"
