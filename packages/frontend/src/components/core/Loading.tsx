import styled from "@emotion/styled"
import { s } from "@pricegame/shared"
import { motion } from "framer-motion"

const Pong = (props) => {
  return <div className="pong-loader" {...props} />
}

const LoadingContainer = styled(motion.div)`
  justify-content: center;
  align-content: center;
  position: relative;
  width: 100%;
  .pong-loader {
    margin: 0 auto;
  }
  h2 {
    margin-top: ${s.m10};
    font-size: ${s.m11};
  }
`

export const Loading = () => null

Loading.InitGame = () => (
  <LoadingContainer>
    <Pong />
    <h2>Loading PriceGame</h2>
  </LoadingContainer>
)
