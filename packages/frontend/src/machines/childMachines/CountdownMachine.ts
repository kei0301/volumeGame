import { assign, createMachine, sendParent } from "xstate"

const getSeconds = (secondsInNumber) => {
  const date = new Date(0)
  date.setSeconds(secondsInNumber)
  return date.toISOString().substr(14, 5)
}

export const createCountdownMachine = (duration) =>
  createMachine({
    context: {
      duration,
      elapsed: 0,
      interval: 1,
      countdown: "...",
    },
    initial: "init",
    states: {
      init: {
        invoke: {
          src: (ctx: any) => (cb) => {
            const interval = setInterval(() => cb("TICK"), 1000 * ctx.interval)
            return () => clearInterval(interval)
          },
        },
        always: {
          target: "done",
          cond: (ctx: any) => ctx.elapsed >= ctx.duration,
        },
        on: {
          TICK: {
            actions: [
              assign((ctx: any) => ({
                ...ctx,
                elapsed: +(ctx.elapsed + ctx.interval).toFixed(2),
                countdown: getSeconds(ctx.duration - +(ctx.elapsed + ctx.interval).toFixed(2)),
              })),
            ],
          },
        },
      },
      done: {
        // entry: sendParent("DONE"),
      },
    },
  })

export const CountdownMachine = createMachine({
  context: {
    duration: 400,
    elapsed: 0,
    interval: 1,
    countdown: "...",
  },
  initial: "init",
  on: {
    DONE: "done",
  },
  states: {
    init: {
      invoke: {
        src: (ctx: any) => (cb) => {
          const interval = setInterval(() => cb("TICK"), 1000 * ctx.interval)
          return () => clearInterval(interval)
        },
      },
      always: {
        // target: "done",
        cond: (ctx: any) => ctx.elapsed >= ctx.duration,
      },
      on: {
        TICK: {
          actions: [
            assign((ctx: any) => ({
              ...ctx,
              elapsed: +(ctx.elapsed + ctx.interval).toFixed(2),
              countdown: getSeconds(ctx.duration - +(ctx.elapsed + ctx.interval).toFixed(2)),
            })),
            sendParent(({ countdown }) => ({ type: "UPDATE_COUNTDOWN", countdown })),
          ],
        },
      },
    },
    done: {
      type: "final",
    },
  },
})
