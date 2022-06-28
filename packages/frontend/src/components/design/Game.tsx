import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { Loading } from "../core/Loading"
import { Swiper } from "swiper/react"
import "swiper/swiper.min.css"
import { useWindowWidth } from "@react-hook/window-size/throttled"

const RootContainer = styled(motion.div)`
  grid-area: main;
  position: relative;
  z-index: 10;
  width: 100%;
`

export const Game = ({ children }) => {
  return <RootContainer>{children}</RootContainer>
}

Game.Loading = ({ show }) => (show ? <Loading.InitGame /> : null)

Game.Cards = ({ show, children }) => {
  const width = useWindowWidth()
  const spaceBetween = width >= 428 ? -(width - 475) : -(width - 390)
  return show ? (
    <>
      <Swiper
        preventClicks={false}
        preventClicksPropagation={false}
        slidesPerView={1.25}
        spaceBetween={spaceBetween}
        centeredSlides={true}
      >
        {children}
      </Swiper>
    </>
  ) : null
}
