/* eslint-disable no-constant-condition */
import { Wallet } from "ethers"
import hre, { ethers } from "hardhat"
import { getProviderWithGoodConnection, sendRequest } from "./utils"
import PriceGameABI from "../abi/contracts/PriceGame.sol/PriceGame.json"
import AggregatorABI from "./AggregatorABI.json"

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const getRound = async (contract: any) => {
  const round = await contract.getCurrentRound()
  return {
    stage: round.stage,
    epoch: round.epoch.toNumber(),
    totalAmount: round.totalAmount.toString(),
    startBlock: round.startBlock.toNumber(),
    lockBlock: round.lockBlock.toNumber(),
    endBlock: round.endBlock.toNumber(),
  }
}

const networkConfigIfLocalhost = async () => {
  const network = hre.network.name
  if (network === "localhost") {
    await hre.network.provider.send("evm_setAutomine", [false])
    await hre.network.provider.send("evm_setIntervalMining", [1000])
  }
  return network
}

const getProviderAndContract = async (network: string) => {
  let pricegame
  let provider
  const walletMnemonic = Wallet.fromMnemonic(process.env.MNEMONIC as string)
  const GAME_ADDRESS = `GAME_ADDRESS_${network.toUpperCase()}`
  if (network === "localhost") {
    provider = new ethers.providers.JsonRpcProvider()
  } else {
    provider = await getProviderWithGoodConnection(network)
  }
  if (process.env[GAME_ADDRESS]) {
    pricegame = new ethers.Contract(process.env[GAME_ADDRESS] as string, PriceGameABI, walletMnemonic.connect(provider))
  } else {
    throw new Error("GAME_ADDRESS missing. Please run deploy script first.")
  }

  return { pricegame, provider }
}

const setChainLinkPriceIfTest = async (network: string, pricegame: any) => {
  // if (network === "localhost" || network === "testnet") {
  const provider = await getProviderWithGoodConnection("mainnet")
  const latestBlock = await provider.getBlockNumber().then((block: any) => block)
  const chainlinkContract = new ethers.Contract("0x137924d7c36816e0dcaf016eb617cc2c92c05782", AggregatorABI, provider)
  const values = await chainlinkContract.queryFilter(chainlinkContract.filters.NewTransmission(), latestBlock - 300)
  const result = values[values.length - 1]
  const price = result?.args?.answer.toString()
  console.log("Price", Number(price) / 10 ** 8)
  if (price) {
    try {
      await sendRequest(pricegame.setCurrentPrice, { input: price })
    } catch (err) {
      console.error(err)
    }
  }
  // }
}

async function main() {
  let currentBlock = 0
  let nextAction = 0
  const network = await networkConfigIfLocalhost()

  while (true) {
    try {
      const { pricegame, provider } = await getProviderAndContract(network)
      await sleep(1100)
      await provider.getBlockNumber().then((block: any) => (currentBlock = block))
      await sleep(1100)
      await pricegame.getNextRequiredAssistance().then((x: any) => (nextAction = currentBlock + x.toNumber()))
      console.log("Blocks until next action", nextAction - currentBlock)
      if (nextAction - currentBlock < 0) {
        await setChainLinkPriceIfTest(network, pricegame)
        await sendRequest(pricegame.next)
        console.log(await getRound(pricegame))
      }
    } catch (err) {
      console.error("Error in loop", err)
    }
    await sleep(8000)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
