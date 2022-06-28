import { States } from "@pricegame/shared/src/types/machines/boxMachine"
import { Text } from "./Text"

export const subtitles = {
  [States.OpenEntered]: () => (
    <Text>
      <Text color="green">Good luck!</Text> May the crypto Gods be on your side.
    </Text>
  ),
  [States.OpenInitial]: () => (
    <Text>
      Click <Text color="green">UP</Text> or <Text color="red">Down</Text> to play.
    </Text>
  ),
  [States.OpenBet]: ({ bet }) => (
    <Text>
      Will close in 04:34. <br /> <Text color={bet.position === "up" ? "green" : "red"}>Betting {bet.position}.</Text>
    </Text>
  ),
  [States.Waiting]: ({ display }) => {
    return <Text size={11}>Open in {display.countdown}</Text>
  },
  [States.CompleteWinner]: ({ payout, bet: { position, amount } }) => {
    return (
      <Text>
        Congratulations! You bet {amount.toFixed(4)} BSC and won {(amount * payout[position]).toFixed(4)} BSC.
      </Text>
    )
  },
  [States.CompleteLoser]: () => {
    return <Text>Better luck next time!</Text>
  },
}
