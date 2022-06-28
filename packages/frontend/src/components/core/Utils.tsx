import { Duration } from "luxon"

export const Utils = () => undefined

Utils.TimeRemaining = ({ show, second, style = null }) => {
  const remaining = Duration.fromObject({ second })
  return show ? (
    <div style={style}>
      {second < 60
        ? remaining.toFormat("s's'")
        : second < 3600
        ? remaining.toFormat("m'm' ss's'")
        : remaining.toFormat("h'h' mm'm' ss's'")}
    </div>
  ) : (
    <div style={style}>---</div>
  )
}
