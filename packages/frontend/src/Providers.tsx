import { Web3ReactProvider } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers"

const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const Providers = ({ children }) => <Web3ReactProvider {...{ getLibrary }}>{children}</Web3ReactProvider>

export default Providers
