import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import { Fixture } from "ethereum-waffle"

import { PriceGame } from "../typechain/PriceGame"

declare module "mocha" {
  export interface Context {
    greeter: PriceGame
    pricegame: PriceGame
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>
    signers: Signers
  }
}

export interface Signers {
  admin: SignerWithAddress
}
