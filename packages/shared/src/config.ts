console.log("")
console.log(`ADDRESS: ${process.env.REACT_APP_ADDRESS}`)
console.log(`BACKEND: ${process.env.REACT_APP_BACKEND_URL}`)
console.log("")
export const period = 20
export const BACKEND_PORT = 4100
export const startingPrice = 600
export const startingRound = 111
export const initStart = 10
export const realData = true
export const CURRENCY_DIGITS = 3
export const BET_BEAR_TOPIC = "0x0d8c1fe3e67ab767116a81f122b83c2557a8c2564019cb7c4f83de1aeb1f1f0d"
export const BET_BULL_TOPIC = "0x438122d8cff518d18388099a5181f0d17a12b4f1b55faedf6e4a6acee0060c12"
export const NEW_ROUND_TOPIC = "0x0e5543feb86a4cd302f2b88b26c42be2d1673013a34e1f98bd6d524dd3b4ab41"
export const LOCK_ROUND_TOPIC = "0x8cce2cd32b6fe99b5bfd14b18d216efc4141239cfc480872bc95986699f6774d"
export const END_ROUND_TOPIC = "0x069bbf284b72705c059a0531d72f09e26a45db7b75ad535c9e925f2dccf039af"
export const contractAddress = process.env.REACT_APP_ADDRESS
export const BNBUSDaggregator = "0x137924d7c36816e0dcaf016eb617cc2c92c05782"

export const BACKEND_LOCAL_URL = "http://localhost:4100"
export const BACKEND_LOCAL_WEBSOCKET = "ws://localhost:4100"
export const BACKEND_TESTING_URL = "https://test-prediction.daoventures.co/api"
export const BACKEND_TESTING_WEBSOCKET = "wss://test-prediction.daoventures.co"
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL === "localhost:4100" ? BACKEND_LOCAL_URL : BACKEND_TESTING_URL

export const BACKEND_WEBSOCKET =
  process.env.REACT_APP_BACKEND_URL === "localhost:4100" ? BACKEND_LOCAL_WEBSOCKET : BACKEND_TESTING_WEBSOCKET

console.log(`BACKEND_URL: ${BACKEND_URL}`)
console.log(`BACKEND_WEBSOCKET: ${BACKEND_WEBSOCKET}`)
console.log("")

// export const urlWebsocket = "wss://speedy-nodes-nyc.moralis.io/533a1fe4f6be1f0d3694b36f/bsc/mainnet/ws"
// export const urlWebsocketTest = "wss://speedy-nodes-nyc.moralis.io/533a1fe4f6be1f0d3694b36f/bsc/testnet/ws"
export const abi = [
  {
    indexed: true,
    internalType: "uint32",
    name: "aggregatorRoundId",
    type: "uint32",
  },
  {
    indexed: false,
    internalType: "int192",
    name: "answer",
    type: "int192",
  },
  {
    indexed: false,
    internalType: "address",
    name: "transmitter",
    type: "address",
  },
  {
    indexed: false,
    internalType: "int192[]",
    name: "observations",
    type: "int192[]",
  },
  {
    indexed: false,
    internalType: "bytes",
    name: "observers",
    type: "bytes",
  },
  {
    indexed: false,
    internalType: "bytes32",
    name: "rawReportContext",
    type: "bytes32",
  },
]

// export const urlWebsocketTest =
//   "wss://apis.ankr.com/wss/417f2cbd27574d8890af38e7c0c3b393/f98ae809ba697d7d7ed24b0c3110a57e/binance/full/test"
// export const urlWebsocketTest =
//   "wss://apis.ankr.com/wss/3ae4b3d30eea49918981148cb7b11f15/a187d703d93a03326986e58aba5d2d0a/binance/full/test"
// export const urlWebsocketTest = "wss://bsc.getblock.io/testnet/?api_key=37bad26f-8f91-4542-b832-e339a5eb3396"
// export const urlWebsocket = "wss://bsc-ws-node.nariox.org:443"
// export const urlWebsocket = "wss://bsc.getblock.io/mainnet/?api_key=c901db95-515c-4fca-9e53-ec9de7b59475"
// export const urlWebsocketTest = "wss://bsc.getblock.io/testnet/?api_key=c901db95-515c-4fca-9e53-ec9de7b59475"
export const urlWebsocket = "wss://speedy-nodes-nyc.moralis.io/533a1fe4f6be1f0d3694b36f/bsc/mainnet/ws"
export const urlWebsocketTest = "wss://speedy-nodes-nyc.moralis.io/533a1fe4f6be1f0d3694b36f/bsc/testnet/ws"
// export const urlWebsocket = "wss://bsc.getblock.io/mainnet/?api_key=37bad26f-8f91-4542-b832-e339a5eb3396"
// export const urlWebsocket = "https://bsc.getblock.io/mainnet/?api_key=37bad26f-8f91-4542-b832-e339a5eb3396"
// export const urlWebsocketTest = "https://bsc.getblock.io/testnet/?api_key=37bad26f-8f91-4542-b832-e339a5eb3396"
// export const urlWebsocket =
//   "wss://apis.ankr.com/wss/1285abafdb55430bb9e6bb297b80d7fb/a187d703d93a03326986e58aba5d2d0a/binance/full/main"
