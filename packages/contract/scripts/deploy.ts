import fs from "fs"
import hre, { ethers } from "hardhat"
import { Wallet } from "ethers"
import { getProviderWithGoodConnection } from "./utils"

// We get the contract to deploy
async function main() {
  const network = hre.network.name
  const GAME_ADDRESS = `GAME_ADDRESS_${network.toUpperCase()}`
  if (process.env[GAME_ADDRESS]) {
    console.log(`CONTRACT ALREADY DEPLOYED TO: ${process.env[GAME_ADDRESS]}`)
    console.log("check .env file")
    return
  }
  let provider
  const walletMnemonic = Wallet.fromMnemonic(process.env.MNEMONIC as string)

  if (network === "localhost") {
    provider = new ethers.providers.JsonRpcProvider()
  } else {
    provider = await getProviderWithGoodConnection(network)
  }
  const wallet = walletMnemonic.connect(provider)
  const PriceGame = await ethers.getContractFactory("PriceGame", wallet)
  const pricegame = await PriceGame.deploy()

  console.log("Pricegame deployed to:", pricegame.address)
  await fs.appendFile("./.env", `\n${GAME_ADDRESS} = ${pricegame.address}`, function (err: any) {
    if (err) throw err
    console.log(`${GAME_ADDRESS} appended to .env`)
    console.log("")
  })

  await new Promise((r) => setTimeout(r, 3000))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
