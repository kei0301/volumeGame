import { useMachine, useService } from "@xstate/react"
import { SwiperSlide } from "swiper/react"
import { gameMachine } from "../../machines/GameMachine"
import { Icon } from "../core/Icon"
import { Layout } from "../core/Layout"
import { Card } from "../design/Card"
import { Game } from "../design/Game"

export const GameCardUI = ({ cardRef }) => {
  const [{ context, matches, value: currentState }, send] = useService(cardRef) as any
  const { bettingMachine, checklistMachine, display, toggle } = context

  return (
    <Card>
      <Card.Main color={display.cardColor} center={toggle.centered} special={matches("completing")}>
        <Card.BetOption position="up" send={send} context={context} />
        <Card.Heading show={toggle.heading}>
          <Icon src="boxMachine" state={currentState} width={15} />
          <Layout.Wrapper>
            <Card.Title title={display.title} color={display.titleColor} />
            <Card.SubTitle state={currentState} context={context} />
            <Card.Checklist machine={checklistMachine} />
          </Layout.Wrapper>
        </Card.Heading>
        <Card.Betting machine={bettingMachine} isBetting={toggle.betting} />
        <Card.Stats show={toggle.stats} context={context} />
        <Card.BetOption position="down" send={send} context={context} />
      </Card.Main>

      <Card.Ribbon position="top" context={context} send={send} />
      <Card.Ribbon position="bottom" context={context} send={send} />
    </Card>
  )
}

export const GameUI = () => {
  const [{ context }] = useMachine(gameMachine) as any
  const { toggle, cards } = context

  return (
    <Game>
      <Game.Loading show={toggle.loading} />
      <Game.Cards show={!toggle.loading}>
        {cards.map((card, i) => (
          <SwiperSlide key={i}>
            <GameCardUI cardRef={card} />
          </SwiperSlide>
        ))}
      </Game.Cards>
    </Game>
  )
}
