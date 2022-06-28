import styled from "@emotion/styled"
import { CURRENCY_DIGITS, parseState, s, sign } from "@pricegame/shared"
import { Button } from "../core/Button"
import { Text } from "../core/Text"
import { background, border, borderRadius, boxShadow, c, color, zIndex } from "../../theme"
import { Layout } from "../core/Layout"
import { CheckList } from "../core/Checklist"
import { useSelector, useService } from "@xstate/react"
import AnimatedNumber from "animated-number-react"
import { Utils } from "../core/Utils"
import { subtitles } from "../core/subtitles"
import { useEffect, useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { Icon } from "../core/Icon"

const RootContainer = styled.div`
  ${zIndex(10)}
  position: relative;
  box-sizing: border-box;
`

const Main = styled.div<{ color: string }>`
  ${({ color }) => background(color)}
  ${({ color }) => border(2, color)}
  ${zIndex(10)}
  ${borderRadius}
  ${boxShadow("special")}
  position: relative;
  padding: ${s.m12};
  grid-row-gap: ${s.m10};
  grid-template-rows: [up] max-content [body] auto [down] max-content;
  grid-template-areas:
    "up"
    "body"
    "down";
  width: ${s.m23};
  height: ${s.m24};
`

const RibbonContainer = styled.div<{ color: "yellow"; position }>`
  ${({ color }) => border(1, color)}
  ${({ color }) => background(color)}
  ${borderRadius}
  ${zIndex(-10)}
  ${color("black")}
  font-size: ${s.m9};
  position: absolute;
  top: ${({ position }) => (position === "top" ? `-${s.m13}` : "inherit")};
  bottom: ${({ position }) => (position === "bottom" ? `-${s.m13}` : "inherit")};
  padding: 0 ${s.m12};
  padding-top: ${({ position }) => (position === "bottom" ? `${s.m5}` : "inherit")};
  padding-bottom: ${({ position }) => (position === "top" ? `${s.m5}` : "inherit")};
  white-space: nowrap;
  text-align: center;
  align-content: center;
  height: ${s.m14};
  transform: translateX(-50%);
  left: 50%;
`

export const Card = ({ children }) => {
  return <RootContainer>{children}</RootContainer>
}

Card.Main = ({ color = "blue", special = false, children, center = false, ...props }) => {
  if (special) {
    return (
      <Main
        color={color}
        style={{
          gridTemplateRows: "1fr 1fr",
        }}
        {...props}
      >
        {children}
      </Main>
    )
  }

  return center ? (
    <Main
      color={color}
      style={{
        gridTemplateRows: "max-content auto",
        alignContent: "space-between",
      }}
      {...props}
    >
      {children}
    </Main>
  ) : (
    <Main color={color} {...props}>
      {children}
    </Main>
  )
}

const render = (display, input) => (display[input.display] ? display[input.display] : "???")

Card.Ribbon = ({ position, send, context: { ribbons, display } }) => {
  const text = render(display, ribbons[position])
  const color = ribbons[position].color
  return (
    (() => ({
      round: (
        <RibbonContainer position={position} color={color}>
          {text}
        </RibbonContainer>
      ),
      pool: (
        <RibbonContainer position={position} color={color}>
          {text}
        </RibbonContainer>
      ),
      back: (
        <RibbonContainer
          className="swiper-no-swiping"
          style={{ cursor: "pointer" }}
          onClick={() => send({ type: "BACK" })}
          position={position}
          color={color}
        >
          {text}
        </RibbonContainer>
      ),
    }))()[ribbons[position].type] || null
  )
}

Card.Body = ({ children }) => <div>{children}</div>

Card.Button = ({
  disabled = false,
  onClick = null,
  title,
  subtitle = null,
  textColor = undefined,
  color = undefined,
}) => (
  <Button
    textColor={textColor ? textColor : disabled ? c.gray : undefined}
    className={disabled ? "disabled" : "swiper-no-swiping"}
    color={disabled ? "disabled" : color}
    disabled={disabled}
    onClick={onClick}
    height={s.m16}
  >
    <div style={{ gridGap: s.m9, gridTemplateColumns: "auto auto", alignItems: "center" }}>
      {title && <Text size={12}>{title}</Text>}
      {subtitle && <Text>{subtitle}</Text>}
    </div>
  </Button>
)

Card.SubTitle = ({ state, context }) => (subtitles[parseState(state)] ? subtitles[parseState(state)](context) : null)

Card.Heading = ({ show, children }) => (show ? <Layout.BigIconColumn>{children}</Layout.BigIconColumn> : null)

Card.Title = ({ title, color }) => (
  <Text color={color} size={11} style={{ marginBottom: s.m4 }}>
    {title}
  </Text>
)

Card.HeadingContent = ({ children }) => <div>{children}</div>

Card.BetOption = ({ position, send, context: { toggle, display, ...rest } }) => {
  const { title, selected, color, disabled, show, textColor } = rest[position === "up" ? "top" : "bottom"]
  return show ? (
    <Card.Button
      title={title}
      subtitle={toggle.payout ? (position === "up" ? display.payoutUp : display.payoutDown) : null}
      color={color}
      disabled={disabled}
      textColor={selected ? textColor : undefined}
      onClick={() => send({ type: position === "up" ? "ENTER_LONG" : "ENTER_SHORT", position })}
    />
  ) : null
}

const selectStack = (state) => state.context.stack
const selectError = (state) => state.context.error

const ChecklistError = styled.div`
  ${borderRadius};
  background: #231e46;
  padding: ${s.m10};
  color: ${c.red};
`

Card.Checklist = ({ machine }) => {
  if (!machine) return null
  const stack = useSelector(machine, selectStack)
  const error = useSelector(machine, selectError)
  if (error) {
    return <ChecklistError>Error: {error}</ChecklistError>
  } else {
    return <CheckList list={stack} />
  }
}

const LatestPrice = styled.div`
  h2 {
    font-size: ${s.m12};
  }
  h3 {
    font-size: ${s.m9};
    margin-bottom: -${s.m4};
    opacity: 0.7;
  }
`

const Difference = styled.div<{ color }>`
  ${({ color }) => border(2, color, "inset")}
  ${({ color }) => background(color)}
  justify-items: center;
  align-items: center;
  border-radius: ${s.m8};
  color: ${c.black};
  padding: ${s.m4} 0;
  font-size: ${s.m10};
`

const StatsContainer = styled.div`
  grid-auto-flow: row;
  grid-template-rows: max-content max-content;
  align-content: space-between;
  grid-gap: ${s.m10};
`

Card.Stats = ({ show, context: { priceSign, toggle, lockBlock, block, endBlock, lockedPrice, price, display } }) =>
  show ? (
    <StatsContainer>
      <Layout.TwoColumns style={{ alignItems: "space-between", height: s.m15 }}>
        <LatestPrice>
          <h3>Latest Price</h3>
          <h2>
            $
            {price ? (
              <AnimatedNumber value={price} duration={200} formatValue={(value) => value.toFixed(CURRENCY_DIGITS)} />
            ) : (
              "---"
            )}
          </h2>
        </LatestPrice>
        <Difference color={sign(priceSign, "green", "yellow", "red")}>
          ${price ? Math.abs(price - lockedPrice).toFixed(CURRENCY_DIGITS) : "---"}
        </Difference>
      </Layout.TwoColumns>
      <div style={{ gridRowGap: s.m4 }}>
        <Layout.TwoColumns>
          <div>Price Pool</div>
          <div style={{ justifySelf: "end" }}>{display.poolAmount}</div>
        </Layout.TwoColumns>
        <Layout.TwoColumns>
          <div>Start Price</div>
          <div style={{ justifySelf: "end" }}>${display.lockedPrice}</div>
        </Layout.TwoColumns>
        <Layout.TwoColumns>
          <div>Start Block</div>
          <div style={{ justifySelf: "end" }}>#{lockBlock}</div>
        </Layout.TwoColumns>
        {toggle.endBlock && (
          <Layout.TwoColumns>
            <div>End Block</div>
            <div style={{ justifySelf: "end" }}>#{endBlock}</div>
          </Layout.TwoColumns>
        )}
        {toggle.blockProgress && (
          <Layout.TwoColumns>
            <div>Block Progress</div>
            <div style={{ justifySelf: "end" }}>{block ? `${block - lockBlock}/${endBlock - lockBlock}` : "---"}</div>
          </Layout.TwoColumns>
        )}
        {toggle.roundLength && (
          <Layout.TwoColumns>
            <div>Round Duration</div>
            <div style={{ justifySelf: "end" }}>{endBlock - lockBlock} Blocks</div>
          </Layout.TwoColumns>
        )}
        {toggle.timeRemaining && (
          <Layout.TwoColumns>
            <div>Time Remaining</div>
            <Utils.TimeRemaining show={block} second={Math.abs(block - endBlock) * 4} style={{ justifySelf: "end" }} />
          </Layout.TwoColumns>
        )}
      </div>
    </StatsContainer>
  ) : null

const BettingBet = ({ send, dollarAmount = 100 }) => (
  <div style={{ gridGap: "15px" }}>
    <Button color="blue" textColor="white" onClick={() => send({ type: "BET", dollarAmount: 5 })}>
      Bet 5 dollar
    </Button>
    <Button color="blue" textColor="white" onClick={() => send({ type: "BET", dollarAmount: 20 })}>
      Bet 20 dollar
    </Button>
    <div
      style={{
        gridTemplateColumns: "max-content 1fr max-content",
        justifyContent: "space-between",
        gridAutoFlow: "column",
        gridGap: "12px",
      }}
    >
      <Button holdClick color="blue" textColor="#ffbd01" onClick={() => send({ type: "UPDATE_DOWN" })}>
        <Icon src="minus" />
      </Button>
      <Button color="blue" textColor="white" onClick={() => send({ type: "BET", dollarAmount })}>
        {dollarAmount} dollar
      </Button>
      <Button holdClick color="blue" textColor="#ffbd01" onClick={() => send({ type: "UPDATE_UP" })}>
        <Icon src="plus" />
      </Button>
    </div>
  </div>
)

const BettingContainer = styled.div`
  ${border(2, "yellow")}
  ${background("yellow")}
  ${zIndex(10)}
  ${borderRadius}
  ${boxShadow("special")}
  align-content: center;
  color: black;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: -2px;
  padding: ${s.m12};
  h2 {
    font-size: ${s.m11};
  }
`

const CheckBoxContainer = styled.div`
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    z-index: 100;
    outline: none;
  }

  /* Text color for the label */
  input[type="checkbox"] + span {
    cursor: pointer;
    color: black;
  }

  /* Checkbox un-checked style */
  input[type="checkbox"] + span:before {
    content: "";
    border-radius: 3px;
    display: inline-block;
    width: ${s.m10};
    height: ${s.m10};
    margin-right: ${s.m6};
    vertical-align: -2px;
    ${border(2, "blue")};
    ${background("yellow")};
  }

  /* Checked checkbox style (in this case the background is red) */
  input[type="checkbox"]:checked + span:before {
    background-size: 28px;
    border-radius: 2px;
    ${border(2, "blue")};
    ${background("green")};
  }

  /* Adding a dotted border around the active tabbed-into checkbox */
  input[type="checkbox"]:focus + span:before,
  input[type="checkbox"]:not(:disabled) + span:hover:before {
    /* box-shadow: 0px 0px 0px 2px #191837; */
    outline-color: transparent;
    outline-width: 2px;
    outline-style: dotted;
  }

  /* Disabled checkbox styles */
  input[type="checkbox"]:disabled + span {
    cursor: default;
    color: black;
    opacity: 0.5;
  }
`
const Checkbox = ({ label, type = "checkbox", name, checked = false, onChange }) => {
  return (
    <CheckBoxContainer>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </CheckBoxContainer>
  )
}

const allTrue = (obj) => (Object.keys(obj).length === 2 ? Object.values(obj).every((item) => item === true) : false)

const BettingLogin = ({ send }) => {
  const { accountName, login, active } = useAuth()

  useEffect(() => {
    if (active) {
      send({ type: "CONTINUE" })
    }
  }, [active, accountName])

  return (
    <>
      <h2>Connect Your Wallet</h2>
      <Button color="blue" textColor="white" onClick={() => login()}>
        <Layout.TwoColumns style={{ gridGap: s.m7, alignItems: "center" }}>
          <Icon src="metamask" width={12} /> Using Metamask
        </Layout.TwoColumns>
      </Button>
    </>
  )
}

Card.Betting = ({ machine, isBetting }) => {
  if (!machine) return null
  const [checkedItems, setCheckedItems] = useState({}) //plain object as state
  const handleChange = (event) => {
    setCheckedItems({ ...checkedItems, [event.target.name]: event.target.checked })
  }

  const checkboxes = [
    {
      name: "check-box-1",
      key: "checkBox1",
      label:
        "I understand that I am using this product at my own risk. Any losses incurred due to my actions are my own responsibility.",
    },
    {
      name: "check-box-2",
      key: "checkBox2",
      label: "I understand that this product is still in beta. I am participating at my own risk.",
    },
  ]
  const [{ context, matches }, send] = useService(machine) as any
  return isBetting ? (
    <BettingContainer className="swiper-no-swiping" style={{ gridGap: "15px" }}>
      {matches("init") && (
        <>
          <h2>This product is in beta</h2>
          <h3>Once you enter a position, you cannot cancel or adjust it.</h3>
          {checkboxes.map((item) => (
            <label key={item.key}>
              <Checkbox label={item.label} name={item.name} checked={checkedItems[item.name]} onChange={handleChange} />
            </label>
          ))}
          <Button
            disabled={!allTrue(checkedItems)}
            textColor={!allTrue(checkedItems) ? "#b7b7c1" : "white"}
            color={!allTrue(checkedItems) ? "disabled" : "blue"}
            onClick={() => (allTrue(checkedItems) ? send({ type: "CONTINUE" }) : {})}
          >
            Continue
          </Button>
        </>
      )}
      {matches("login") && <BettingLogin send={send} />}
      {matches("bet") && <BettingBet send={send} dollarAmount={context.dollarAmount} />}
      {matches("currency") && (
        <>
          <h2>Bet ${context.dollarAmount} on BSC Price</h2>
          <h3>Use Binance Smart Chain (BSC)</h3>
          <Button
            onClick={() => send({ type: "BSC", finalPrice: context.dollarAmount / context.price })}
            color="blue"
            textColor="white"
          >
            Pay {(context.dollarAmount / context.price).toFixed(8)} BSC
          </Button>
          <h3>Use Polygon Token (MATIC)</h3>
          <Button color="blue" textColor="white">
            Pay {(context.dollarAmount / 1.11).toFixed(8)} MATIC
          </Button>
          <h3>Use DVG Token (10% higher payout)</h3>
          <Button color="blue" textColor="white">
            Pay {(context.dollarAmount / 0.2923).toFixed(8)} DVG
          </Button>
        </>
      )}
      {matches("betting") && (
        <>
          <h2>Checklist</h2>
          <Card.Checklist machine={context.checklistMachine} />
        </>
      )}
    </BettingContainer>
  ) : null
}
