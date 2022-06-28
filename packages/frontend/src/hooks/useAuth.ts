import * as React from "react"
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { NoBscProviderError } from "@binance-chain/bsc-connector"
import { NoEthereumProviderError, UserRejectedRequestError } from "@web3-react/injected-connector"
import { UnsupportedChainIdError } from "@web3-react/core"
import { toast } from "react-hot-toast"
import { user } from "../observers/streams/user"

export const injected = new InjectedConnector({ supportedChainIds: [56, 97] })

export const setupNetwork = async () => {
  const provider = (window as any).ethereum
  if (provider) {
    const chainId = 97
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: "Binance Smart Chain Testnet",
            nativeCurrency: {
              name: "BNB",
              symbol: "bnb",
              decimals: 18,
            },
            rpcUrls: [
              "https://data-seed-prebsc-1-s1.binance.org:8545/",
              "https://data-seed-prebsc-2-s1.binance.org:8545/",
              "https://data-seed-prebsc-1-s2.binance.org:8545/",
              "https://data-seed-prebsc-2-s2.binance.org:8545/",
              "https://data-seed-prebsc-1-s3.binance.org:8545/",
              "https://data-seed-prebsc-2-s3.binance.org:8545/",
            ],
            blockExplorerUrls: ["https://testnet.bscscan.com"],
          },
        ],
      })
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  } else {
    console.error("Can't setup the BSC network on metamask because window.ethereum is undefined")
    return false
  }
}

export const useAuth = () => {
  const { account, active, activate, deactivate } = useWeb3React()

  React.useEffect(() => {
    if (active) {
      user.next({ type: "user", account })
      // toast.success("Login like a boss 🔥")
    } else {
      user.next({ type: "user", account: undefined })
      // toast("😱  Logout! We will miss you ❤️")
    }
  }, [active])

  const login = React.useCallback(() => {
    const connector = injected
    if (connector) {
      try {
        activate(connector, async (error: Error) => {
          if (error instanceof UnsupportedChainIdError) {
            const hasSetup = await setupNetwork()
            if (hasSetup) {
              activate(connector)
            }
          } else {
            window.localStorage.removeItem("connectorId")
            if (error instanceof NoEthereumProviderError || error instanceof NoBscProviderError) {
              toast("Provider Error: No provider was found")
            } else if (error instanceof UserRejectedRequestError) {
              toast("Authorization Error: Please authorize to access your account")
            } else {
              toast(`${error.name}: ${error.message}`)
            }
          }
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      toast("Can't find connector: The connector config is wrong")
    }
  }, [])

  const logout = React.useCallback(() => {
    deactivate()
    // toast("😱  Logout! We will miss you ❤️")
  }, [deactivate])

  return {
    login,
    logout,
    account,
    active,
    accountName: active && `${account.substring(0, 6)}...${account.substring(account.length - 4)}`,
  }
}
