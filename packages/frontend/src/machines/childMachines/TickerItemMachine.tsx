import merge from "ts-deepmerge"
import { createMachine, send, sendParent } from "xstate"
import { updateDisplay } from "../utils"
import { assign } from "xstate"
import { CURRENCY_DIGITS } from "@pricegame/shared"
import { waitPriceOperation, avgChainlinkUpdateOperation, updateBlockOperation } from "../TickerOperations"

const context = {
  display: {
    title: "Fetching BNB Data...",
    subtitle: "",
    block: "",
    price: "",
  },
  avgTime: 0,
  block: undefined,
  currentBlock: undefined,
  price: undefined,
  initState: "firstItem",
}

export const createTickerItemMachine = (args: any) =>
  createMachine({
    initial: "init",
    context: merge(context, args),
    states: {
      init: {
        always: [
          {
            target: "firstItem",
            cond: ({ initState }) => initState === "firstItem",
          },
          {
            target: "waiting",
            cond: ({ initState }) => initState === "waiting",
          },
          {
            target: "normal",
            cond: ({ initState }) => initState === "normal",
          },
        ],
      },
      firstItem: {},
      waiting: {
        entry: updateDisplay("title", "Awaiting Price Update"),
        invoke: [{ src: waitPriceOperation }, { src: avgChainlinkUpdateOperation }, { src: updateBlockOperation }],
        on: {
          TRANSITION: {
            target: "normal",
            actions: [
              assign((ctx, { price, block }: any) => merge(ctx, { price, block })),
              sendParent(({ currentBlock }) => ({ type: "ADD_WAITING", block: currentBlock })),
            ],
          },
          UPDATE_AVG_TIME: {
            actions: assign((ctx, { avgTime }: any) => merge(ctx, { avgTime })),
          },
          UPDATE_BLOCK: {
            actions: [assign((ctx, { block }: any) => merge(ctx, { currentBlock: block })), send("REFRESH")],
          },
          REFRESH: {
            actions: updateDisplay("subtitle", ({ avgTime, block, currentBlock }) => {
              const blocks = currentBlock - block
              if (blocks > 1000) {
                return "Loading"
              } else {
                return `${currentBlock - block}/${avgTime} block`
              }
            }),
          },
        },
      },
      normal: {
        entry: [
          updateDisplay("block", ({ block }) => `${block}`),
          updateDisplay("price", ({ price }) => `${price.toFixed(CURRENCY_DIGITS)} BNB`),
        ],
      },
    },
  })
