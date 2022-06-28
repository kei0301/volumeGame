import {
  contractAddress,
  NEW_ROUND_TOPIC,
  LOCK_ROUND_TOPIC,
  END_ROUND_TOPIC,
  BET_BEAR_TOPIC,
  BET_BULL_TOPIC,
} from "@pricegame/shared"
import { chainlinkContract } from "../providers"

export const chainlinkPriceUpdate = chainlinkContract.filters.NewTransmission()

const newRound = {
  address: contractAddress,
  topics: [NEW_ROUND_TOPIC],
}

const lockRound = {
  address: contractAddress,
  topics: [LOCK_ROUND_TOPIC],
}

const endRound = {
  address: contractAddress,
  topics: [END_ROUND_TOPIC],
}

const betBear = {
  address: contractAddress,
  topics: [BET_BEAR_TOPIC],
}
const betBull = {
  address: contractAddress,
  topics: [BET_BULL_TOPIC],
}

export const eventFilters = {
  newRound,
  lockRound,
  endRound,
  betBear,
  betBull,
}
