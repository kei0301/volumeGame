import styled from "@emotion/styled"
import { Header } from "./Header"
import { Toast } from "./Toast"
import { GameUI } from "./machineUI/GameUI"
import { TickerUI } from "./machineUI/TickerUI"

const Container = styled.div`
  background: #191837;
  position: absolute;
  z-index: 100;
  user-select: none;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  max-height: 100vh;
  max-width: 100vw;
  grid-template-columns: 1fr 1.1fr 1fr;
  grid-template-rows: max-content 1fr max-content;
  grid-template-areas:
    "header header header"
    "main main main"
    "ticker ticker ticker";
`

export const RootContainer = () => {
  return (
    <Container>
      <Header />
      <GameUI />
      <TickerUI />
      <Toast />
    </Container>
  )
}
