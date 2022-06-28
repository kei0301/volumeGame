import merge from "ts-deepmerge"
import { createMachine, send } from "xstate"
import { spawnTickerItemMachine, toggle } from "./utils"
import { assign } from "xstate"
import { pricesOperation } from "./TickerOperations"

export const TickerMachine = createMachine({
  context: {
    toggle: {
      loading: true,
    },
    items: [],
  },
  initial: "loading",
  states: {
    loading: {
      after: {
        1000: "init",
      },
      exit: toggle("loading"),
    },
    init: {
      entry: [send("FIRST_ITEM")],
      on: {
        FIRST_ITEM: {
          target: "loadHistory",
          actions: spawnTickerItemMachine({ initState: "firstItem" }),
        },
      },
    },
    loadHistory: {
      invoke: [{ src: pricesOperation }],
      on: {
        ADD_ITEM: {
          actions: spawnTickerItemMachine({ initState: "normal" }),
        },
        DONE: {
          target: "running",
          actions: assign((ctx, { block }: any) => merge(ctx, { block })),
        },
      },
    },
    running: {
      entry: [send("ADD_WAITING")],
      on: {
        ADD_WAITING: {
          actions: spawnTickerItemMachine({ initState: "waiting" }),
        },
      },
    },
  },
})
