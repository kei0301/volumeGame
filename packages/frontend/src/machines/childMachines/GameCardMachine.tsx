import merge from "ts-deepmerge"
import { assign, createMachine, send } from "xstate"
import {
  addBox,
  updateButton,
  updateButtons,
  updateRibbon,
  updateDisplay,
  spawnCheckListMachine,
  completeChecklist,
  messageRight,
  toggle,
  spawnBettingMachine,
  toggleFalse,
  toggleTrue,
} from "../utils"
import {
  blockOperation,
  chainlinkListener,
  delayRoundListener,
  endRoundListener,
  getUserRoundOperation,
  initOpenOperation,
  poolOperation,
  priceOperation,
  setEndRound,
  setStartRound,
} from "../GameOperations"
import { Context, States } from "@pricegame/shared/src/types/machines/boxMachine"
import { bettingPayout, CURRENCY_DIGITS, isWinner } from "@pricegame/shared"
import { CountdownMachine } from "./CountdownMachine"

// TODO extract this function
const payoutFormat = (payout) => {
  const number = +payout
  if (Number.isFinite(number)) {
    return `${+number.toFixed(2).toString()}x Payout`
  } else {
    return `1x Payout`
  }
}

const context = {
  init: false,
  initState: States.Initial,
  toggle: {
    heading: true,
    centered: false,
    betting: false,
    stats: false,
    endBlock: true,
    roundLength: false,
    blockProgress: true,
    timeRemaining: true,
    payout: false,
  },
  display: {
    titleColor: "yellow",
    cardColor: "blue",
    title: undefined,
    bet: undefined,
    pool: "Price Pool: 0 BNB",
    poolAmount: "__.__ BNB",
    round: undefined,
    roundEntered: undefined,
    payoutUp: "1.5x Payout",
    payoutDown: "1.5x Payout",
    countdown: "...",
    lockedPrice: undefined,
    live: "Live",
    complete: "Completed",
    back: "Go Back",
    goingUp: "Bet on price going up",
    goingDown: "Bet on price going down",
    winner: "WINNER",
    loser: "LOSER",
  },
  round: undefined,
  price: 0,
  priceSign: 0,
  block: 0,
  startBlock: 0,
  lockBlock: 0,
  endBlock: 0,
  lockedPrice: 541.21,
  ribbons: {
    top: {
      type: undefined,
      color: "yellow",
      display: undefined,
    },
    bottom: {
      type: undefined,
      color: "yellow",
      display: undefined,
    },
  },
  // TODO what does this do?
  winner: {
    side: undefined,
    amount: undefined,
  },
  accruedPool: {
    up: 0,
    down: 0,
    total: 0,
  },
  // TODO put in seprate section like machines: { ... }
  countdownMachine: undefined,
  checklistMachine: undefined,
  payout: {
    up: 1.5,
    down: 1.5,
  },
  top: {
    title: "UP",
    show: true,
    color: "green",
    textColor: "#ffbd01",
    active: false,
    selected: false,
    disabled: true,
  },
  bottom: {
    title: "DOWN",
    show: true,
    color: "red",
    textColor: "#ffbd01",
    active: false,
    selected: false,
    disabled: true,
  },
  dollarAmount: 100, // Able to remove
  bet: {
    locked: false,
    position: undefined,
    displayAmount: undefined,
    amount: undefined,
  },
}

export const createBoxMachine = (args: { round: number; initState: States; init?: boolean; lockedPrice?: number }) =>
  createMachine<Context, any, any>({
    id: "Card",
    initial: States.Initial,
    context: merge(context, args),
    invoke: [{ src: getUserRoundOperation(["USER_BET_PRESENT", "USER_BET_NOT_PRESENT", "UPDATE_BET_AMOUNT"]) }],
    on: {
      CHECK_USER_BET: {
        actions: ({ bet }) => {
          console.log("ACTIONS WORKS")
          console.log("BET", bet)
          if (bet.position) {
            send("USER_BET_PRESENT")
          } else {
            send("USER_BET_NOT_PRESENT")
          }
        },
      },
      UPDATE_POOL: {
        actions: [
          assign((ctx, { up, down }) => {
            return merge(ctx, {
              accruedPool: { total: up + down, up, down },
              payout: {
                up: bettingPayout({ total: up + down, value: up }),
                down: bettingPayout({ total: up + down, value: down }),
              },
            })
          }),
          send("UPDATE_POOL_DISPLAY"),
        ],
      },
      UPDATE_POOL_DISPLAY: {
        actions: [
          updateDisplay("payoutUp", ({ payout }) => payoutFormat(payout.up)),
          updateDisplay("payoutDown", ({ payout }) => payoutFormat(payout.down)),
          updateDisplay("poolAmount", ({ accruedPool }) => `${+accruedPool.total.toFixed(4).toString()} BNB`),
          updateDisplay(
            "pool",
            ({ accruedPool }) => `Price Pool: ${+accruedPool.total.toFixed(CURRENCY_DIGITS).toString()} BNB`,
          ),
        ],
      },
      UPDATE_BET_AMOUNT: {
        actions: [
          assign((ctx, { round, position, amount }) => {
            return merge(ctx, {
              bet: {
                round,
                amount,
                position: position ? (position === "long" ? "up" : "down") : position,
                displayAmount: amount ? Number(amount).toFixed(CURRENCY_DIGITS) : amount,
              },
            })
          }),
          send("UPDATE_POOL_DISPLAY"),
          send("UPDATE_USER_BET_DISPLAY"),
        ],
      },
      UPDATE_USER_BET_DISPLAY: {
        actions: [
          updateDisplay(
            "bet",
            ({ bet: { displayAmount, position } }) =>
              `You bet ${position === "up" ? "UP" : "DOWN"} with ${displayAmount} BNB`,
          ),
        ],
      },
    },
    entry: [
      updateDisplay("round", ({ round }) => `#${round}`),
      updateDisplay("roundEntered", ({ round }) => `Entered #${round}`),
      updateRibbon("bottom", { type: "round", display: "round" }),
    ],
    states: {
      [States.Initial]: {
        always: [
          {
            target: States.Waiting,
            cond: ({ initState }) => initState === States.Waiting,
          },
          {
            target: States.Open,
            cond: ({ initState }) => initState === States.Open,
          },
          {
            target: States.GoingLive,
            // target: States.Complete,
            cond: ({ initState }) => initState === States.GoingLive,
          },
        ],
      },
      [States.Waiting]: {
        entry: [updateDisplay("title", "Waiting to Open")],
        invoke: {
          id: "countdownMachine",
          src: CountdownMachine,
          onDone: States.Opening,
        },
        on: {
          UPDATE_COUNTDOWN: {
            actions: updateDisplay("countdown", (_, { countdown }) => countdown),
          },
          DONE: {
            actions: send({ type: "DONE" }, { to: "countdownMachine" }),
          },
        },
      },
      [States.Opening]: {
        entry: [
          updateDisplay("title", "Opening..."),
          spawnCheckListMachine([
            {
              loading: "Waiting on previous round to finish",
              done: "Earlier round finished",
            },
            {
              loading: "Checking with HQ",
              done: "HQ approve to start",
            },
          ]),
        ],
        on: {
          DONE: completeChecklist(States.Open),
        },
      },
      [States.Open]: {
        entry: [
          // TODO make teh betting machine into a service
          spawnBettingMachine(),
          toggleTrue("payout"),
          updateDisplay("title", "Position Open"),
          addBox("ADD_WAITING_BOX"),
          updateButtons({
            disabled: false,
          }),
        ],
        invoke: [{ src: poolOperation("UPDATE_POOL") }, { src: initOpenOperation("UPDATE_POOL") }],
        on: {
          GO_LIVE: {
            target: States.GoingLive,
            actions: [toggleFalse(["betting"]), updateRibbon("top", { type: "pool", display: "pool" })],
          },
          ENTER_LONG: {
            target: States.OpenBet,
            actions: [
              send(
                { type: "SET_LONG" },
                {
                  to: (ctx: any) => ctx.bettingMachine,
                },
              ),
              toggle(["betting"]),
              updateRibbon("top", () => ({
                color: "green",
                display: "goingUp",
                type: "pool",
              })),
            ],
          },
          ENTER_SHORT: {
            target: States.OpenBet,
            actions: [
              send(
                { type: "SET_SHORT" },
                {
                  to: (ctx: any) => ctx.bettingMachine,
                },
              ),
              toggle(["betting"]),
              updateRibbon("top", () => ({
                type: "pool",
                color: "red",
                display: "goingDown",
              })),
            ],
          },
          BACK: {
            target: States.OpenInitial,
            actions: [
              updateRibbon("bottom", { color: "yellow", type: "round", display: "round" }),
              updateRibbon("top", { color: "yellow", type: "pool", display: "pool" }),
              toggleFalse(["betting"]),
              send(
                { type: "BACK" },
                {
                  to: (ctx: any) => ctx.bettingMachine,
                },
              ),
            ],
          },
        },
        initial: States.Initial,
        states: {
          [States.Initial]: {
            entry: [updateRibbon("top", { color: "yellow", type: "pool", display: "pool" })],
            on: {
              USER_BET_PRESENT: {
                target: States.Entered,
                actions: [
                  updateRibbon("bottom", { color: "green", type: "round", display: "roundEntered" }),
                  updateRibbon("top", { color: "green", type: "pool", display: "bet" }),
                  updateRibbon("top", ({ bet }) => {
                    return {
                      color: bet?.position === "up" ? "green" : "red",
                      type: "pool",
                      display: "bet",
                    }
                  }),
                ],
              },
              // USER_BET_NOT_PRESENT: {
              //   actions: [
              //     updateRibbon("bottom", { color: "yellow", type: "round", display: "round" }),
              //     updateRibbon("top", { color: "yellow", type: "pool", display: "pool" }),
              //   ],
              // },
            },
          },
          [States.Bet]: {
            entry: [
              updateRibbon("bottom", () => ({
                type: "back",
                color: "red",
                display: "back",
              })),
            ],
            on: {
              SUCCESS: {
                target: States.Entered,
                actions: [
                  toggleFalse(["betting"]),
                  updateRibbon("top", { type: "pool", display: "bet" }),
                  updateRibbon("bottom", { color: "green", type: "round", display: "roundEntered" }),
                  assign((ctx, { finalPrice, position }) =>
                    merge(ctx, {
                      bet: {
                        amount: finalPrice,
                        displayAmount: finalPrice,
                        locked: true,
                        position,
                      },
                    }),
                  ),
                ],
              },
              // USER_BET_NOT_PRESENT: {
              //   actions: [
              //     updateRibbon("bottom", { color: "yellow", type: "round", display: "round" }),
              //     updateRibbon("top", { color: "yellow", type: "pool", display: "pool" }),
              //   ],
              // },
            },
          },
          [States.Entered]: {
            entry: [
              updateButtons({
                disabled: true,
              }),
              updateDisplay(
                "bet",
                ({ bet: { displayAmount, position } }) =>
                  `You bet ${position === "up" ? "UP" : "DOWN"} with ${displayAmount} BNB`,
              ),
              updateDisplay("title", `Bet Placed`),
              updateRibbon("top", ({ bet: { position } }) => ({
                color: position === "up" ? "green" : "red",
                type: "pool",
                display: "bet",
              })),
            ],
            on: {
              USER_BET_NOT_PRESENT: {
                target: States.Initial,
                actions: [
                  updateRibbon("bottom", { color: "yellow", type: "round", display: "round" }),
                  updateRibbon("top", { color: "yellow", type: "pool", display: "pool" }),
                  updateDisplay("title", "Position Open"),
                  updateButtons({
                    disabled: false,
                  }),
                ],
              },
            },
          },
        },
      },
      [States.GoingLive]: {
        entry: [
          send("CHECK_USER_BET", { delay: 1000 }),
          updateDisplay("title", ({ init }) => (init ? "Fetching Round..." : "Starting Round...")),
          assign((ctx) => (!ctx.init ? ctx : merge(ctx, { accruedPool: { up: 0, down: 0, total: 0 } }))),
          assign((ctx) => (!ctx.init ? ctx : merge(ctx, { payout: { up: 1.5, down: 1.5 } }))),
          updateButtons({
            show: true,
            disabled: true,
          }),
          updateButton("top", ({ bet }) => ({
            selected: bet.locked && bet.position === "up" ? true : false,
          })),
          updateButton("bottom", ({ bet }) => ({
            selected: bet.locked && bet.position === "down" ? true : false,
          })),
          spawnCheckListMachine(({ init, round }) => [
            !init && {
              loading: `Waiting on round #${round - 1} to end`,
              done: `Round #${round - 1} Ended`,
              process: endRoundListener,
            },
            !init && {
              loading: "Waiting on round to Start",
              done: `Round #${round} Starting`,
              process: setStartRound(round),
            },
            init && {
              loading: "Waiting on data",
              done: "Data arrived",
              process: delayRoundListener(round),
            },
          ]),
        ],
        on: {
          USER_BET_PRESENT: {
            actions: [
              updateRibbon("bottom", { color: "green", type: "round", display: "roundEntered" }),
              updateRibbon("top", ({ bet: { position } }) => ({
                color: position === "up" ? "green" : "red",
                type: "pool",
                display: "bet",
              })),
              updateDisplay(
                "bet",
                ({ bet: { displayAmount, position } }) =>
                  `You bet ${position === "up" ? "UP" : "DOWN"} with ${displayAmount} BNB`,
              ),
            ],
          },
          USER_BET_NOT_PRESENT: {
            actions: [
              updateRibbon("bottom", { color: "yellow", type: "round", display: "round" }),
              updateRibbon("top", { color: "yellow", type: "pool", display: "pool" }),
            ],
          },
          DONE: completeChecklist(States.Live),
          FORWARD: {
            actions: assign((ctx, { startBlock, lockBlock, endBlock, lockedPrice }) => {
              return merge(ctx, { startBlock, endBlock, lockBlock, lockedPrice })
            }),
          },
        },
        exit: messageRight({ action: "DONE" }),
      },
      [States.Live]: {
        entry: [
          toggleTrue("payout"),
          updateRibbon("top", () => ({
            type: "pool",
            color: "green",
            display: "live",
          })),
          toggle(["heading", "stats"]),
          updateButtons({
            show: true,
          }),
          updateDisplay("payoutUp", ({ payout }) => payoutFormat(payout.up)),
          updateDisplay("payoutDown", ({ payout }) => payoutFormat(payout.down)),
          updateDisplay("poolAmount", ({ accruedPool }) => `${+accruedPool.total.toFixed(4).toString()} BNB`),
          updateDisplay("lockedPrice", ({ lockedPrice }) => `${lockedPrice.toFixed(CURRENCY_DIGITS)}`),
          addBox("ADD_OPEN_BOX"),
        ],
        invoke: [
          { src: initOpenOperation("UPDATE_POOL") },
          { src: blockOperation("UPDATE_BLOCK") },
          { src: priceOperation("UPDATE_PRICE") },
        ],
        on: {
          UPDATE_BLOCK: {
            actions: assign((ctx, { block }) => merge(ctx, { block })),
          },
          UPDATE_PRICE: {
            actions: assign((ctx, { price }) => merge(ctx, { price, priceSign: Math.sign(price - ctx.lockedPrice) })),
          },
          COMPLETE: {
            actions: messageRight({ action: "GO_LIVE" }),
            target: States.Completing,
          },
          USER_BET_PRESENT: {
            actions: [
              updateRibbon("bottom", { color: "green", type: "round", display: "roundEntered" }),
              updateRibbon("top", ({ bet: { position } }) => ({
                color: position === "up" ? "green" : "red",
                type: "pool",
                display: "bet",
              })),
              updateDisplay(
                "bet",
                ({ bet: { displayAmount, position } }) =>
                  `You bet ${position === "up" ? "UP" : "DOWN"} with ${displayAmount} BNB`,
              ),
            ],
          },
          USER_BET_NOT_PRESENT: {
            actions: [
              updateRibbon("top", () => ({
                type: "pool",
                color: "green",
                display: "live",
              })),
              updateRibbon("bottom", { color: "yellow", type: "round", display: "round" }),
            ],
          },
        },
      },
      [States.Completing]: {
        entry: [
          toggleTrue("payout"),
          toggle(["heading", "timeRemaining"]),
          updateDisplay("title", "Completing Round..."),
          updateButtons({
            show: false,
          }),
          spawnCheckListMachine(({ round }) => [
            {
              loading: "Fetching price from Chainlink",
              done: "Fetched latest Chainlink price",
              process: chainlinkListener,
            },
            {
              loading: "Verifying Chainlink price",
              done: `Round #${round} finalised`,
              process: setEndRound(round),
            },
          ]),
        ],
        on: {
          USER_BET_PRESENT: {
            actions: [
              updateRibbon("bottom", { color: "green", type: "round", display: "roundEntered" }),
              updateRibbon("top", ({ bet: { position } }) => ({
                color: position === "up" ? "green" : "red",
                type: "pool",
                display: "bet",
              })),
              updateDisplay(
                "bet",
                ({ bet: { displayAmount, position } }) =>
                  `You bet ${position === "up" ? "UP" : "DOWN"} with ${displayAmount} BNB`,
              ),
            ],
          },
          FORWARD: {
            actions: [assign((ctx, event) => merge(ctx, event))],
          },
          DONE: completeChecklist(States.Complete),
        },
        exit: [toggleFalse(["blockProgress"])],
      },
      [States.Complete]: {
        entry: [
          toggleTrue("payout"),
          updateDisplay("poolAmount", ({ accruedPool }) => `${+accruedPool.total.toFixed(4).toString()} BNB`),
          updateDisplay(
            "pool",
            ({ accruedPool: { total } }) => `Price Pool: ${+total.toFixed(CURRENCY_DIGITS).toString()} BNB`,
          ),
          toggleTrue(["roundLength"]),
          toggleFalse(["heading"]),
          updateButtons({
            show: true,
            selected: false,
          }),
          updateRibbon("top", { color: "green", display: "complete" }),
          // updateRibbon("top", ({ price, lockedPrice, bet: { amount, position } }) => ({
          //   color: amount ? (isWinner(price, lockedPrice, position) ? "green" : "red") : "green",
          //   display: amount ? (isWinner(price, lockedPrice, position) ? "winner" : "loser") : "complete",
          // })),
          updateRibbon("bottom", () => ({
            color: "green",
          })),
        ],
        on: {
          USER_BET_PRESENT: States.CompleteInitial,
          USER_BET_NOT_PRESENT: States.CompleteInitial,
        },
        initial: States.Initial,
        states: {
          [States.Initial]: {
            always: [
              {
                target: States.Complete,
                cond: ({ bet: { amount } }) => !amount,
              },
              {
                target: States.Winner,
                cond: ({ price, lockedPrice, bet: { position } }) =>
                  isWinner(price, lockedPrice, position) && position === "up",
              },
              {
                target: States.Loser,
              },
            ],
          },
          [States.Complete]: {},
          [States.Winner]: {
            entry: [
              updateDisplay(
                "title",
                ({ payout, bet: { amount, position } }) => `You Won ${(amount * payout[position]).toFixed(4)} BSC`,
              ),
              updateDisplay("titleColor", "green"),
              toggleTrue(["heading", "stats"]),
              updateButtons({
                show: false,
                selected: false,
              }),
            ],
          },
          [States.Loser]: {
            entry: [
              updateDisplay("title", ({ bet: { displayAmount } }) => `You Lost ${displayAmount ?? "0.012"} BSC`),
              updateDisplay("titleColor", "red"),
              toggleTrue(["heading", "stats"]),
              updateButtons({
                show: false,
                selected: false,
              }),
            ],
          },
        },
      },
    },
  })
