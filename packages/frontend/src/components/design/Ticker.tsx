import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { s } from "@pricegame/shared"
import { border, background, borderRadius, boxShadow } from "../../theme"
import { Swiper } from "swiper/react"
import { Text } from "../core/Text"
import { Icon } from "../core/Icon"
import { useWindowWidth } from "@react-hook/window-size/throttled"

const RootContainer = styled(motion.div)`
  grid-area: ticker;
  display: flex;
  overflow: hidden;
  flex-direction: row-reverse;
  align-items: center;
  padding: 0 ${s.m4};
  margin-bottom: ${s.m6};
  @media (min-height: 667px) {
    margin-bottom: ${s.m10};
  }
`

const ItemContainer = styled(motion.div)`
  box-sizing: border-box;
  ${background("blue")}
  ${border(2, "blue")}
  ${borderRadius}
  ${boxShadow()}
  width: ${s.m23};
  height: ${s.m17};
  flex: 0 0 auto;
  align-content: center;
`

export const Ticker = ({ children }) => <RootContainer>{children}</RootContainer>

const NormalContainer = styled.div`
  grid-template-columns: max-content auto;
`

Ticker.Normal = ({ show, block, price }) =>
  show ? (
    <NormalContainer>
      <Icon.Center src="chainlink" width={15} />
      <div>
        <Text color="yellow" size={10}>
          Block Number: #{block}
        </Text>
        <Text size={11}>Price: {price}</Text>
      </div>
    </NormalContainer>
  ) : null

Ticker.FirstItem = ({ show, title }) =>
  show ? (
    <>
      <Text style={{ textAlign: "center" }} color="yellow" size={11}>
        {title}
      </Text>
    </>
  ) : null

Ticker.Waiting = ({ show, title, subtitle }) =>
  show ? (
    <div style={{ textAlign: "center" }}>
      <Text color="yellow">{title}</Text>
      <Text size={11}>
        {subtitle}
        <Text style={{ marginLeft: s.m6, opacity: 0.4 }} size={10}>
          (Estimation)
        </Text>
      </Text>
    </div>
  ) : null

Ticker.Item = ({ children }) => <ItemContainer>{children}</ItemContainer>

Ticker.Items = ({ show = true, children }) => {
  const width = useWindowWidth()
  const spaceBetween = width >= 428 ? -(width - 481) : -(width - 396)
  return show ? (
    <Swiper
      slidesPerView={1.25}
      spaceBetween={spaceBetween}
      centeredSlides={true}
      onSwiper={(swiper) =>
        swiper.on("slidesLengthChange", () => {
          if (!swiper.isEnd) {
            swiper.slideNext(1000)
          }
        })
      }
    >
      {children}
    </Swiper>
  ) : null
}
