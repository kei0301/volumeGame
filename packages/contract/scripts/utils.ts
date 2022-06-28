/* eslint-disable prefer-const */
import { ethers } from "hardhat"
import Timeout from "await-timeout"
// import any from "p-any"
// import pLocate from "p-locate"

const sendTransactionRequest = (func: any, obj: any) => {
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
const sendTransactionWait = (func: any) => {
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

export const sendRequest = (func: any, obj = {}) =>
  sendTransactionRequest(func, obj).then((tx) => sendTransactionWait(tx))

export const getProviderWithGoodConnection = async (network: string) => {
  let connections
  if (network === "mainnet") {
    connections = [
      "https://bsc-dataseed.binance.org/",
      "https://bsc-dataseed1.defibit.io/",
      "https://bsc-dataseed1.ninicoin.io/",
      "https://bsc-dataseed2.defibit.io/",
      "https://bsc-dataseed3.defibit.io/",
      "https://bsc-dataseed4.defibit.io/",
      "https://bsc-dataseed2.ninicoin.io/",
      "https://bsc-dataseed3.ninicoin.io/",
      "https://bsc-dataseed4.ninicoin.io/",
      "https://bsc-dataseed1.binance.org/",
      "https://bsc-dataseed2.binance.org/",
      "https://bsc-dataseed3.binance.org/",
      "https://bsc-dataseed4.binance.org/",
    ]
  } else {
    connections = [
      "https://data-seed-prebsc-1-s1.binance.org:8545/",
      "https://data-seed-prebsc-2-s1.binance.org:8545/",
      "https://data-seed-prebsc-1-s2.binance.org:8545/",
      "https://data-seed-prebsc-2-s2.binance.org:8545/",
      "https://data-seed-prebsc-1-s3.binance.org:8545/",
      "https://data-seed-prebsc-2-s3.binance.org:8545/",
    ]
  }

  const asyncSome = async (arr: any, predicate: any) => {
    let final
    for (const item of arr) {
      const result = await predicate(item)
      if (result) {
        return result
      }
    }
    return final
  }
  const result = await asyncSome(connections, async (item: any) => {
    const timer = new Timeout()
    let result
    console.log(`Checking: ${item}`)
    const pro = new ethers.providers.JsonRpcProvider(item)
    try {
      await Promise.race([pro.ready, timer.set(2500, "Timeout!")])
      console.log(`Connection: ${item}`)
      result = pro
    } catch (err) {
      // console.log("error")
    } finally {
      // console.log("FINAL")
      timer.clear()
    }
    return result ? result : false
  })

  if (result) {
    return result
  } else {
    console.error("No connection found", connections)
    throw new Error("No connection found")
  }
}
