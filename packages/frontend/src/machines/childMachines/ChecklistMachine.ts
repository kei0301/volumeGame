/* eslint-disable @typescript-eslint/no-unused-vars */
import * as R from "remeda"
import { from, interval, of } from "rxjs"
import { catchError, take } from "rxjs/operators"
import { assign, Machine, sendParent } from "xstate"

const delayObs = (ctx: any) => {
  const lastItem = R.reverse(ctx.stack)[0]
  const process = lastItem.process ?? interval(2000).pipe(take(1))
  return process
}

export const createChecklistMachine = (checkItems) =>
  Machine({
    context: {
      checkItems: R.compact(checkItems),
      index: 0,
      stack: [],
      processOutput: undefined,
      error: undefined,
    },
    initial: "nextStep",
    states: {
      nextStep: {
        after: {
          500: {
            target: "processing",
            actions: [
              assign(({ index, stack, checkItems }) => {
                return {
                  index,
                  checkItems,
                  stack: [
                    ...stack,
                    {
                      checked: false,
                      text: checkItems[index].loading,
                      delay: checkItems[index].delay,
                      process: checkItems[index].process,
                    },
                  ],
                }
              }),
            ],
          },
        },
      },
      processing: {
        invoke: {
          src: (ctx) => (cb) => {
            const process = delayObs(ctx)
            const subscription = process
              .pipe(
                catchError((err) => {
                  return of({ type: "error", ...err })
                }),
              )
              .subscribe(({ type, ...item }) => {
                if (type !== "error") {
                  cb({ type: "SUCCESS", ...item })
                } else {
                  cb({ type: "ERROR", ...item })
                }
              })
            return () => subscription.unsubscribe()
          },
        },
        on: {
          SUCCESS: {
            target: "onSuccess",
            actions: assign({
              processOutput: (_, event) => event,
            }),
          },
          ERROR: {
            target: "onError",
            actions: assign({
              error: (_, { message }: any) => message,
            }),
          },
        },
      },
      onSuccess: {
        always: {
          target: "complete",
          actions: [
            assign({
              stack: ({ stack, index, checkItems }) => {
                return stack.map((item, i) =>
                  index === i ? { ...item, checked: true, text: checkItems[index].done } : item,
                )
              },
              index: ({ index }) => index + 1,
            }),
            sendParent(({ processOutput }) => {
              if (processOutput.forward) {
                return { ...processOutput, type: "FORWARD" }
              } else {
                return { type: "NOTHING" }
              }
            }),
          ],
        },
      },
      onError: {
        after: {
          3000: {
            actions: sendParent("ERROR"),
          },
        },
      },
      complete: {
        always: [
          {
            target: "nextStep",
            cond: ({ checkItems, index }) => checkItems.length !== index,
          },
          "final",
        ],
      },
      final: {
        entry: sendParent("DONE", { delay: 3000 }),
      },
    },
  })
