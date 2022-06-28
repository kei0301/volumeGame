/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { assign, sendParent, spawn } from "xstate"
import merge from "ts-deepmerge"
import * as R from "remeda"
import { States } from "@pricegame/shared/src/types/machines/boxMachine"
import { createChecklistMachine } from "./childMachines/ChecklistMachine"
import { createCountdownMachine } from "./childMachines/CountdownMachine"
import { createBoxMachine } from "./childMachines/GameCardMachine"
import { createTickerItemMachine } from "./childMachines/TickerItemMachine"
import { createBettingMachine } from "./childMachines/BettingMachine"

export const toggle = (key) =>
  assign((ctx) => {
    if (Array.isArray(key)) {
      const newToggles = R.reduce(
        key,
        (acc, item) => {
          return { ...acc, [item]: !ctx.toggle[item] }
        },
        {},
      )
      return merge(ctx, { toggle: newToggles })
    } else {
      return merge(ctx, { toggle: { [key]: !ctx.toggle[key] } })
    }
  })

export const toggleTrue = (key) =>
  assign((ctx) => {
    if (Array.isArray(key)) {
      const newToggles = R.reduce(
        key,
        (acc, item) => {
          return { ...acc, [item]: true }
        },
        {},
      )
      return merge(ctx, { toggle: newToggles })
    } else {
      return merge(ctx, { toggle: { [key]: true } })
    }
  })

export const toggleFalse = (key) =>
  assign((ctx) => {
    if (Array.isArray(key)) {
      const newToggles = R.reduce(
        key,
        (acc, item) => {
          return { ...acc, [item]: false }
        },
        {},
      )
      return merge(ctx, { toggle: newToggles })
    } else {
      return merge(ctx, { toggle: { [key]: false } })
    }
  })

export const formatter = (value) => {
  if (Object.prototype.hasOwnProperty.call(value, "countdown")) return { countdown: value.countdown }
  return value
}
// export const updateDisplay = (key, input) =>
//   assign((ctx, event) => merge(ctx, { display: { [key]: typeof input === "function" ? input(ctx, event) : input } }))
export const updateDisplay = (key, input) =>
  assign((ctx, event) =>
    merge(ctx, { display: formatter({ [key]: typeof input === "function" ? input(ctx, event) : input }) }),
  )

export const updateRibbon = (position: string, input: Record<string, any> | ((i) => Record<string, any>)) =>
  assign((ctx) =>
    merge(ctx, {
      ribbons: {
        [position]: typeof input === "function" ? input(ctx) : input,
      },
    }),
  )

export const updateButton = (selector, update) =>
  assign((ctx) =>
    merge(ctx, {
      [selector]: {
        ...(typeof update === "function" ? update(ctx) : update),
      },
    }),
  )

export const updateButtons = (update) =>
  assign((ctx) =>
    merge(ctx, {
      top: {
        ...(typeof update === "function" ? update(ctx) : update),
      },
      bottom: {
        ...(typeof update === "function" ? update(ctx) : update),
      },
    }),
  )

export const completeChecklist = (target, actions = []) => ({
  target,
  actions: [
    assign({
      checklistMachine: undefined,
    }),
    ...actions,
  ],
})

export const addBox = (type) => sendParent(({ round }) => ({ type, round: round + 1 }), { delay: 1000 })

export const messageRight = (object) => {
  return sendParent(({ round }) => ({ type: "MESSAGE", round: String(+round + 1), ...object }), { delay: 1100 })
}

export const messageLeft = (object = {}) =>
  sendParent(({ round }) => ({ type: "MESSAGE", round: String(+round - 1), ...object }))

const cardAlreadyExists = (cards, round) =>
  R.pipe(
    cards,
    R.filter((item: any) => +item.id === +round),
    (input) => input.length,
  )

export const spawnGameCardMachine = ({ initState }: { initState: States }) =>
  assign({
    cards: (context: any, event: any) => {
      const { currentRound, currentPrice } = context
      const { round } = event

      if (initState === "goingLive") {
        const card = spawn(
          createBoxMachine({
            initState,
            init: true,
            round: currentRound,
            lockedPrice: currentPrice,
          }),
          `${currentRound}`,
        )
        return context.cards.concat(card)
      }

      if (!cardAlreadyExists(context.cards, round)) {
        const card = spawn(createBoxMachine({ round, initState }), `${round}`)
        return context.cards.concat(card)
      } else {
        return context.cards
      }
    },
  })

export const spawnTickerItemMachine = ({ initState }: { initState: string }) =>
  assign({
    items: (context: any, { block, price }: any) => {
      let item
      if (block) {
        item = spawn(createTickerItemMachine({ initState, block, price }))
      } else {
        item = spawn(createTickerItemMachine({ initState, block: context.block }))
      }
      return context.items.concat(item)
    },
  })

export const spawnCheckListMachine = (checkItems) =>
  assign({
    checklistMachine: (ctx) => {
      return spawn(createChecklistMachine(typeof checkItems === "function" ? checkItems(ctx) : checkItems))
    },
  })

export const spawnBettingMachine = () =>
  assign({
    bettingMachine: () => {
      return spawn(createBettingMachine())
    },
  })

export const spawnCountdownMachine = (countdown) =>
  assign({
    countdownMachine: () => spawn(createCountdownMachine(countdown)),
  })
