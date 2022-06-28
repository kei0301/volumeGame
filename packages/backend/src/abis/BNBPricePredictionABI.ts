export const betBullEvent = [
  {
    indexed: true,
    internalType: "address",
    name: "sender",
    type: "address",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "currentEpoch",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "amount",
    type: "uint256",
  },
]

export const betBearEvent = [
  {
    indexed: true,
    internalType: "address",
    name: "sender",
    type: "address",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "currentEpoch",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "amount",
    type: "uint256",
  },
]

export const roundStartEvent = [
  {
    indexed: true,
    internalType: "uint256",
    name: "epoch",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256",
  },
]

export const roundLockEvent = [
  {
    indexed: true,
    internalType: "uint256",
    name: "epoch",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "int256",
    name: "price",
    type: "int256",
  },
]

export const roundEndEvent = [
  {
    indexed: true,
    internalType: "uint256",
    name: "epoch",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "int256",
    name: "price",
    type: "int256",
  },
]
