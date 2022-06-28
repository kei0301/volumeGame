import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "hardhat-watcher"
import "hardhat-abi-exporter"

import "./tasks/accounts"
import "./tasks/clean"
import "./tasks/deployers"

import { resolve } from "path"

import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig } from "hardhat/config"

dotenvConfig({ path: resolve(__dirname, "./.env") })

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
}

// Ensure that we have all the environment variables we need.
// const mnemonic: string | undefined = process.env.MNEMONIC
const mnemonic = "pledge inform input soda clog convince bulb inject assist forward flavor fit"
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file")
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    gasPrice: 5,
    enabled: true,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      mining: {
        auto: false,
        interval: 3000,
      },
    },
    hardhat: {
      forking: {
        url: `https://speedy-nodes-nyc.moralis.io/f081751095f54294ea07fc88/bsc/mainnet/archive`,
        blockNumber: 10192206,
      },
      mining: {
        auto: true,
      },
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
      // See https://github.com/sc-forks/solidity-coverage/issues/652
      hardfork: process.env.CODE_COVERAGE ? "berlin" : "london",
    },
    testnet: {
      url: `https://speedy-nodes-nyc.moralis.io/533a1fe4f6be1f0d3694b36f/bsc/testnet`,
      chainId: 97,
      gasPrice: 20000000000,
      accounts: { mnemonic: mnemonic },
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.7",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        // bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  watcher: {
    compilation: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
    ci: {
      tasks: [
        "clean",
        { command: "compile", params: { quiet: true } },
        { command: "typechain" },
        { command: "test", params: { noCompile: true } },
      ],
    },
  },
  abiExporter: {
    // clear: true,
    // flat: true,
    // only: [":ERC20$"],
    spacing: 2,
  },
}

export default config
