import "./global.css"
import "fontsource-source-code-pro/latin.css"
import * as ReactDOM from "react-dom"
import { RootContainer } from "./components/RootContainer"
import Providers from "./Providers"

export const App = () => {
  return (
    <Providers>
      <RootContainer />
    </Providers>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
