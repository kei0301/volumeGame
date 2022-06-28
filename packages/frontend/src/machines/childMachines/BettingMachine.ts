/* eslint-disable @typescript-eslint/no-unused-vars */
import merge from "ts-deepmerge"
import { assign, Machine, sendParent } from "xstate"
import { betListener, priceOperation } from "../GameOperations"
import { spawnCheckListMachine } from "../utils"

export const createBettingMachine = () =>
  Machine({
    context: {
      currency: undefined,
      dollarAmount: 100,
      checklistMachine: undefined,
      finalPrice: undefined,
      position: undefined,
    },
    on: {
      BACK: "init",
      SET_LONG: {
        actions: assign((ctx) => merge(ctx, { position: "long" })),
      },
      SET_SHORT: {
        actions: assign((ctx) => merge(ctx, { position: "short" })),
      },
    },
    initial: "init",
    states: {
      init: {
        on: {
          CONTINUE: "login",
        },
      },
      login: {
        on: {
          CONTINUE: "bet",
        },
      },
      bet: {
        on: {
          BET: {
            target: "currency",
            actions: assign((ctx, { dollarAmount }: any) => merge(ctx, { dollarAmount })),
          },
          UPDATE_UP: {
            actions: assign(({ dollarAmount, ...ctx }) => merge(ctx, { dollarAmount: ++dollarAmount })),
          },
          UPDATE_DOWN: {
            actions: assign(({ dollarAmount, ...ctx }) => merge(ctx, { dollarAmount: --dollarAmount })),
          },
        },
      },
      currency: {
        invoke: [{ id: "price", src: priceOperation("UPDATE_PRICE") }],
        on: {
          BSC: {
            target: "betting",
            actions: assign((ctx, { finalPrice }: any) => merge(ctx, { finalPrice: Number(finalPrice) })),
          },
          UPDATE_PRICE: {
            actions: assign((ctx, { price }: any) => merge(ctx, { price })),
          },
        },
      },
      betting: {
        entry: [
          spawnCheckListMachine(({ finalPrice, position }) => [
            {
              loading: "Placing bet",
              done: "Bet was placed",
              process: betListener(finalPrice, position),
            },
          ]),
        ],
        on: {
          DONE: {
            actions: [
              sendParent(({ finalPrice, position }) => ({
                type: "SUCCESS",
                finalPrice: finalPrice.toFixed(4),
                position: position === "long" ? "up" : "down",
              })),
            ],
          },
          ERROR: {
            actions: [
              sendParent(() => ({
                type: "BACK",
              })),
            ],
          },
        },
      },
    },
  })
