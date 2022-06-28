/* eslint-disable @typescript-eslint/ban-ts-comment */
import cors from "cors"
import { blockTestNet, fetchBlockTestNet } from "./streams/block"
import { Server, Socket } from "socket.io"
import { forkJoin } from "rxjs"
import { take } from "rxjs/operators"
import { fetchMatchingRound, fetchRound, fetchRoundHistoryTestNet, round } from "./streams/round"
import { decodePrice, fetchChainlinkHistoryMainNet } from "./streams/chainlink"
import express from "express"
import { ethersMainNet, ethersTestNet, mainContract } from "./providers"
import { BACKEND_PORT } from "@pricegame/shared"
import { chainlinkPriceUpdate, eventFilters } from "./lib/filters"
import { ethers } from "ethers"
import http from "http"

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  path: "/stream",
})

const getUserRound = async (address: string, round: number) => {
  const [roundData] = await mainContract.getUserRounds(address, 0, 20)
  if (roundData.length) {
    const result = roundData.map((roundNumber) => {
      return mainContract.ledger(roundNumber.toString(), address).then((result) => {
        return {
          round: Number(roundNumber.toString()),
          position: !result[0] ? "long" : "short",
          amount: Number(ethers.utils.formatEther(result[1].toString())),
          claimed: result[2],
        }
      })
    })
    const values = await Promise.all(result).then(function (results) {
      return results
    })
    const output = values.find((input: any) => input.round === round)
    return output ? output : { error: true }
  } else {
    return { error: true }
  }
}

const turnIntoDecimal = (price) => {
  if (price === "0") return Number(price)
  return Number(ethers.utils.formatEther(price))
}

const getRoundData = async (number) => {
  const roundData = await mainContract.rounds(ethers.BigNumber.from(number))
  const rawLockedPrice = roundData.lockPrice.toString()
  const lockedPrice = [rawLockedPrice.slice(0, 3), ".", rawLockedPrice.slice(3)].join("")
  const rawClosePrice = roundData.closePrice.toString()
  const closePrice = [rawClosePrice.slice(0, 3), ".", rawClosePrice.slice(3)].join("")

  return {
    epoch: Number(roundData.epoch.toString()),
    startBlock: Number(roundData.startBlock.toString()),
    lockBlock: Number(roundData.lockBlock.toString()),
    endBlock: Number(roundData.endBlock.toString()),
    bearAmount: turnIntoDecimal(roundData.bearAmount.toString()),
    bullAmount: turnIntoDecimal(roundData.bullAmount.toString()),
    lockedPrice: Number(lockedPrice),
    closePrice: Number(closePrice),
  }
}

app.use(
  cors({
    origin: "*",
  }),
)
app.use(express.json())

const initFetch = forkJoin({
  block: fetchBlockTestNet(),
  chainlink: fetchChainlinkHistoryMainNet(),
  round: fetchRoundHistoryTestNet(),
})

app.get("/", (_, res) => {
  console.log("GETTING ROOT API")
  initFetch.pipe(take(1)).subscribe((x) => res.json(x))
})

app.post("/get-round", async (req, res) => {
  const result = await getRoundData(req.body.round)
  console.log("RESULT", result)
  res.json(result)
})

app.post("/get-user-round", async (req, res) => {
  res.json(await getUserRound(req.body.address, req.body.round))
})

app.post("/lock-round", (req, res) => {
  fetchMatchingRound({ type: "lockRound", ...req.body }).subscribe((input) =>
    input ? res.json(input) : res.json({ missing: true }),
  )
})

app.post("/end-round", (req, res) => {
  fetchMatchingRound({ type: "endRound", ...req.body }).subscribe((input) =>
    input ? res.json(input) : res.json({ missing: true }),
  )
})

server.listen(4100, "0.0.0.0", () => {
  console.log("listening on *:4100")
})

io.on("connection", (socket: Socket) => {
  socket.removeAllListeners()
  blockTestNet.subscribe((x) => {
    socket.emit("block", x)
  })

  ethersMainNet.on(chainlinkPriceUpdate, (input) => {
    socket.emit("chainlink", { type: "chainlink", block: input.blockNumber, price: decodePrice(input) })
  })

  mainContract.on("LockRound", () => {
    fetchRoundHistoryTestNet().subscribe((x) => {
      socket.emit("round", x)
    })
  })

  mainContract.on("EndRound", () => {
    fetchRound({ type: "endRound" }).subscribe((x) => {
      socket.emit("endRound", x)
    })
  })

  const decodeBet = async () => {
    const currentEpoch = await mainContract.currentEpoch()
    const roundData = await mainContract.rounds(currentEpoch)
    const data = {
      type: "pool",
      round: Number(currentEpoch.toString()),
      accruedPool: {
        up: Number(ethers.utils.formatEther(roundData.bullAmount)),
        down: Number(ethers.utils.formatEther(roundData.bearAmount)),
        total:
          Number(ethers.utils.formatEther(roundData.bullAmount)) +
          Number(ethers.utils.formatEther(roundData.bearAmount)),
      },
    }
    socket.emit("pool", data)
  }

  ethersTestNet.on(eventFilters["betBull"], async () => {
    await decodeBet()
  })
  ethersTestNet.on(eventFilters["betBear"], async () => {
    await decodeBet()
  })
})
