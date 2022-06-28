import { States } from "@pricegame/shared/src/types/machines/boxMachine"
import merge from "ts-deepmerge"
import { assign, createMachine, send } from "xstate"
import { waitStartingRoundOperation } from "./TickerOperations"
import { spawnGameCardMachine, toggle } from "./utils"

export const gameMachine = createMachine({
  context: {
    toggle: {
      loading: true,
    },
    startBlock: undefined,
    currentRound: undefined,
    currentPrice: undefined,
    cards: [],
  },
  initial: "loading",
  states: {
    loading: {
      invoke: [{ src: waitStartingRoundOperation("LOADED") }],
      on: {
        LOADED: {
          target: "init",
          actions: assign((ctx, { currentRound }: any) => merge(ctx, { currentRound })),
        },
      },
      exit: toggle("loading"),
    },
    init: {
      entry: send("INIT_BOX"),
      on: {
        INIT_BOX: {
          target: "running",
          actions: spawnGameCardMachine({ initState: States.GoingLive }),
        },
      },
    },
    running: {
      on: {
        MESSAGE: {
          actions: [
            send((_, { action }: any) => action, {
              to: (ctx: any, { round }: any) => {
                const exists = ctx.cards.filter((item) => item.id === round)
                return exists.length ? round : undefined
              },
            }),
          ],
        },
        ADD_OPEN_BOX: {
          actions: spawnGameCardMachine({ initState: States.Open }),
        },
        ADD_WAITING_BOX: {
          actions: spawnGameCardMachine({ initState: States.Waiting }),
        },
      },
    },
  },
})
