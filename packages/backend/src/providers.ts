import { BNBUSDaggregator, contractAddress, urlWebsocket, urlWebsocketTest } from "@pricegame/shared"
import AggregatorABI from "./abis/AggregatorABI.json"
// import contractABI from "./abis/BnbPricePrediction.json"
import pricegameABI from "./abis/PriceGame.json"
import { ethers } from "ethers"
import Web3 from "web3"

export const web3MainNet = new Web3(urlWebsocket)
export const web3TestNet = new Web3(urlWebsocketTest)

export const ethersMainNet = new ethers.providers.WebSocketProvider(urlWebsocket)
export const ethersTestNet = new ethers.providers.WebSocketProvider(urlWebsocketTest)
export const chainlinkContract = new ethers.Contract(BNBUSDaggregator, AggregatorABI, ethersMainNet)
// export const mainContract = new ethers.Contract(contractAddress, JSON.stringify(pricegameABI), ethersTestNet)
export const mainContract = new ethers.Contract(contractAddress, pricegameABI, ethersTestNet)

console.log("CONTRACT ADDRESS", contractAddress)
console.log("URL_WEBSOCKET", urlWebsocket)
console.log("URL_WEBSOCKET_TEST", urlWebsocketTest)
