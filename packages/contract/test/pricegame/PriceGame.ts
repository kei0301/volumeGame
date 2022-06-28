// @ts-nocheck
import hre, { ethers } from "hardhat"
import { PriceGame } from "../../typechain/PriceGame"
import PricegameArtifact from "../../artifacts/contracts/PriceGame.sol/PriceGame.json"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { solidity } from "ethereum-waffle"
const { deployContract } = hre.waffle

chai.use(solidity)
chai.use(chaiAsPromised)
const expect = chai.expect

enum Stages {
  Initial = 0,
  GenesisRound = 1,
  NormalRound = 2,
  Paused = 3,
}
enum RoundStages {
  Start = 0,
  Locked = 1,
  Ended = 2,
  finished = 3,
}

async function mineBlocks(blockNumber: number) {
  while (blockNumber > 0) {
    blockNumber--
    await hre.network.provider.request({
      method: "evm_mine",
      params: [],
    })
  }
}

const getRound = async (contract) => {
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

const getBalance = async (contractAddress: string) => {
  return (await ethers.provider.getBalance(contractAddress)).toString()
}

const sendTransactionRequest = (func, obj) => {
  return new Promise((resolve, reject) => {
    try {
      if (obj.amount) {
        resolve(func({ value: ethers.utils.parseEther(obj.amount) }))
      } else if (obj.address) {
        resolve(func(obj.address))
      } else if (obj.input) {
        resolve(func(obj.input))
      } else {
        resolve(func())
      }
    } catch (err) {
      const error = "ERROR REQUEST"
      console.error(error, err)
      reject(error)
    }
  })
}
const sendTransactionWait = (func) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(func.wait())
    } catch (err) {
      const error = "ERROR WAIT"
      console.error(error, err)
      reject(error)
    }
  })
}

const sendRequest = (func, obj = {}) => sendTransactionRequest(func, obj).then((tx) => sendTransactionWait(tx))

describe("Unit Tests", () => {
  let provider: any
  let pricegame: PriceGame
  let owner: any
  let playerOne: any
  let playerTwoPricegame: any
  let playerThreePricegame: any

  beforeEach(async () => {
    provider = ethers.getDefaultProvider()
    const [_owner, _playerOne, _playerTwo, _playerThree] = await ethers.getSigners()
    owner = _owner
    playerOne = _playerOne
    playerTwoPricegame = _playerTwo
    playerThreePricegame = _playerThree
    pricegame = (await deployContract(owner, PricegameArtifact)) as PriceGame
  })
  describe("Test Owner Actions", async () => {
    it("Should be able to fetch owner address", async () => {
      expect(await pricegame.owner()).to.eql(owner.address)
    })
    it("Should be able to transfer money as owner", async () => {
      await sendRequest(pricegame.sendMoney, { amount: "3.0", provider })
      const balance = await getBalance(pricegame.address)
      expect(balance).to.eql("3000000000000000000")
    })
    it("Should be able to withdrawAllMoney as owner", async () => {
      await sendRequest(pricegame.sendMoney, { amount: "3.0" })
      await sendRequest(pricegame.withdrawAllMoney, { address: owner.address })
      const balance = await getBalance(pricegame.address)
      expect(balance).to.eql("0")
    })
    it("Should NOT be able to withdrawAllMoney as NOT owner", async () => {
      await sendRequest(pricegame.sendMoney, { amount: "3.0", provider })
      pricegame = await pricegame.connect(playerOne)
      await expect(sendRequest(pricegame.withdrawAllMoney, { address: playerOne.address })).to.be.revertedWith(
        "You are not the owner",
      )
    })
  })
  describe("Test Operator Actions", async () => {
    it.skip("Should be able to fetch operator address")
    it.skip("Should be able to trigger next")
    it.skip("Should be able to pause")
    it.skip("Should be able to unpause")
  })
  describe("Test Player Actions", async () => {
    it.skip("Should be able to bet bull")
    it.skip("Should be able to bet bear")
    it.skip("Should NOT be able to bet when paused")
    it.skip("Should be able to get stats for past rounds")
  })
  describe("Test State Machine and Other", async () => {
    it("Should be able to fetch current stage", async () => {
      expect(await pricegame.stage()).to.eql(Stages.Initial)
    })
    it("Should be able to transition by starting genesis round", async () => {
      await sendRequest(pricegame.next)
      expect(await pricegame.stage()).to.eql(Stages.GenesisRound)
    })
    it("Should be able to transistion and trigger currentEpoch change", async () => {
      const prevEpoch = await pricegame.currentEpoch()
      await sendRequest(pricegame.next)
      const nextEpoch = await pricegame.currentEpoch()
      expect(nextEpoch).to.equal(prevEpoch + 1)
    })
    it("Should be able to get current round", async () => {
      await sendRequest(pricegame.next)
      const round = await getRound(pricegame)
      expect(round.epoch).to.eql(1)
      expect(round.stage).to.eql(RoundStages.Start)
      expect(round.totalAmount).to.eql("0")
      expect(round.startBlock).to.be.an("number")
      expect(round.lockBlock).to.be.an("number")
      expect(round.endBlock).to.be.an("number")
      expect(Object.keys(round).length).to.eql(6)
    })
    it("Should be able to get next required assistance", async () => {
      await sendRequest(pricegame.next)
      await mineBlocks(25)
      const nextAction = await pricegame.getNextRequiredAssistance().then((x) => x.toNumber())
      expect(nextAction).to.eql(75)
      await mineBlocks(nextAction)
      expect(await pricegame.getNextRequiredAssistance().then((x) => x.toNumber())).to.eql(0)
    })
    it.only("Should be able to get and set currentPrice", async () => {
      expect(await pricegame.currentPrice().then((x) => x.toString())).to.be.eql("100")
      await sendRequest(pricegame.setCurrentPrice, { input: "48448417704" })
      expect(await pricegame.currentPrice().then((x) => x.toString())).to.be.eql("48448417704")
    })
  })
})

describe("Integration Tests", () => {
  let provider: any
  let pricegame: PriceGame
  let owner: any
  let playerOne: any
  let playerTwoPricegame: any
  let playerThreePricegame: any
  let latestBlock: any

  beforeEach(async () => {
    provider = ethers.getDefaultProvider()
    const [_owner, _playerOne, _playerTwo, _playerThree] = await ethers.getSigners()
    owner = _owner
    playerOne = _playerOne
    playerTwoPricegame = _playerTwo
    playerThreePricegame = _playerThree
    pricegame = (await deployContract(owner, PricegameArtifact)) as PriceGame
  })
  describe("Successful states", async () => {
    it("Run genesis round and run three rounds without players", async () => {
      let nextAction: any
      let round: any
      latestBlock = await ethers.provider.getBlockNumber()

      expect(await pricegame.stage()).to.eql(Stages.Initial)
      await expect(pricegame.next())
        .to.emit(pricegame, "StartRound")
        .withArgs(1, latestBlock + 1)
      expect(await pricegame.stage()).to.eql(Stages.GenesisRound)

      round = await getRound(pricegame)
      expect(round.epoch).to.eql(1)

      latestBlock = await ethers.provider.getBlockNumber()
      expect(round.lockBlock).to.eql(latestBlock + 100)
      nextAction = await pricegame.getNextRequiredAssistance().then((x) => x.toNumber())
      expect(nextAction).to.eql(100)
      await mineBlocks(nextAction / 2)
      await expect(sendRequest(pricegame.next)).to.be.reverted

      expect(await pricegame.getNextRequiredAssistance().then((x) => x.toNumber())).to.eql(50)
      await mineBlocks(nextAction / 2)
      await expect(sendRequest(pricegame.next)).to.not.be.reverted

      round = await getRound(pricegame)
      expect(round.epoch).to.eql(2)

      await mineBlocks(10)
      nextAction = await pricegame.getNextRequiredAssistance().then((x) => x.toNumber())
      expect(nextAction).to.eql(89)
      await expect(sendRequest(pricegame.next)).to.be.reverted

      await mineBlocks(nextAction + 10)
      await expect(sendRequest(pricegame.next)).to.not.be.reverted

      round = await getRound(pricegame)
      expect(round.epoch).to.eql(3)

      nextAction = await pricegame.getNextRequiredAssistance().then((x) => x.toNumber())
      expect(nextAction).to.eql(90)
      await expect(sendRequest(pricegame.next)).to.be.reverted
    })
    it.skip("Run six rounds with player betting")
    it.skip("Run six rounds with player betting and 1000 block pause in the middle")
  })
  describe("Failed states", async () => {
    it.skip("Run three rounds with player betting and emergencyPauseRefund")
    it.skip("Run three rounds with player betting and handle withdrawAllMoney")
  })
})
