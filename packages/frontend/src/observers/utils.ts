import { InboxStream } from "@pricegame/shared/src/types"
import { BACKEND_URL } from "@pricegame/shared"
import { empty, Observable, of } from "rxjs"
import { map, flatMap } from "rxjs/operators"

export const filterTypeBlock = flatMap((x: InboxStream) => (x.type === "block" ? of(x) : empty()))
export const filterTypeChainlink = flatMap((x: InboxStream) => (x.type === "chainlink" ? of(x) : empty()))
export const filterTypePrice = flatMap((x: InboxStream) => (x.type === "price" ? of(x) : empty()))
export const filterTypeRound = flatMap((x: InboxStream) => (x.type === "round" ? of(x) : empty()))
export const filterTypePool = flatMap((x: InboxStream) => (x.type === "pool" ? of(x) : empty()))

export const forward = map((input: Record<string, any>) => ({ ...input, forward: true }))

export const filterRound = (round) =>
  flatMap((x: InboxStream) => (x.type === "round" && x.round === round ? of(x) : empty()))

export const randomChangePrice = (price: number) => {
  const random_boolean = Math.random() < 0.5
  const maxChangeAmount = 20
  if (random_boolean) {
    return +(price + Math.random() * maxChangeAmount).toFixed(2)
  } else {
    return +(price - Math.random() * maxChangeAmount).toFixed(2)
  }
}

export const randomAddPool = (pool: number) => {
  const random_boolean = Math.random() < 0.1
  const maxChangeAmount = 0.2
  if (random_boolean) {
    return +(pool + Math.random() * maxChangeAmount * 30).toFixed(2)
  } else {
    return +(pool + Math.random() * maxChangeAmount).toFixed(2)
  }
}

export const postData = async (url = "", data = {}) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return response.json()
}

export const postEndRound = (round) =>
  new Observable((observer) => {
    postData(`${BACKEND_URL}/end-round`, { round }).then((data) => {
      observer.next(data)
    })
  })

export const postLockRound = (round) =>
  new Observable((observer) => {
    postData(`${BACKEND_URL}/lock-round`, { round }).then((data) => {
      observer.next(data)
    })
  })

export const getRound = (round) =>
  new Observable((observer) => {
    postData(`${BACKEND_URL}/get-round`, { round }).then((data) => {
      observer.next(data)
    })
  })

export const getUserRound = (address, round) => {
  if (address && round) {
    return new Observable((observer) => {
      postData(`${BACKEND_URL}/get-user-round`, { address, round }).then((data) => {
        observer.next(data)
      })
    })
  } else {
    return of({ error: true })
  }
}
