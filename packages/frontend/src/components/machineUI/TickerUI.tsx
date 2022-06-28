import { Ticker } from "../design/Ticker"
import { useMachine, useService } from "@xstate/react"
import { TickerMachine } from "../../machines/TickerMachine"
import { SwiperSlide } from "swiper/react"

const TickerItemUI = ({ TickerRef }) => {
  const [{ context, value: currentState }] = useService(TickerRef) as any
  const { display } = context
  return (
    <Ticker.Item>
      <Ticker.Normal show={currentState === "normal"} {...display} />
      <Ticker.FirstItem show={currentState === "firstItem"} {...display} />
      <Ticker.Waiting show={currentState === "waiting"} {...display} />
    </Ticker.Item>
  )
}
export const TickerUI = () => {
  const [{ context }] = useMachine(TickerMachine) as any
  const { items } = context

  return (
    <Ticker>
      <Ticker.Items>
        {items.map((item, i) => (
          <SwiperSlide key={i}>
            <TickerItemUI TickerRef={item} />
          </SwiperSlide>
        ))}
      </Ticker.Items>
    </Ticker>
  )
}
