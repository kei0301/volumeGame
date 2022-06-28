import React from "react"
import { parseState, s } from "@pricegame/shared"
import { ReactComponent as Logo } from "../../assets/logo.svg"
import { ReactComponent as Logout } from "../../assets/logout.svg"
import { ReactComponent as Chainlink } from "../../assets/chainlink.svg"
import { ReactComponent as HappyIcon } from "../../assets/happy.svg"
import { ReactComponent as ScepticIcon } from "../../assets/sceptic.svg"
import { ReactComponent as SmirkingIcon } from "../../assets/smirking.svg"
import { ReactComponent as AngelIcon } from "../../assets/angel.svg"
import { ReactComponent as PartyIcon } from "../../assets/party.svg"
import { ReactComponent as RichIcon } from "../../assets/rich.svg"
import { ReactComponent as ShockedIcon } from "../../assets/shocked.svg"
import { ReactComponent as MetaMaskIcon } from "../../assets/metamask.svg"
import { ReactComponent as PlusIcon } from "../../assets/plus.svg"
import { ReactComponent as MinusIcon } from "../../assets/minus.svg"
import { States } from "@pricegame/shared/src/types/machines/boxMachine"

const icons = {
  logo: <Logo />,
  logout: <Logout />,
  chainlink: <Chainlink />,
  shocked: <ShockedIcon />,
  metamask: <MetaMaskIcon />,
  plus: <PlusIcon />,
  minus: <MinusIcon />,
}

const states = {
  boxMachine: {
    [States.Waiting]: <ScepticIcon />,
    [States.Opening]: <AngelIcon />,
    [States.OpenInitial]: <SmirkingIcon />,
    [States.OpenEntered]: <HappyIcon />,
    [States.OpenEntering]: <PartyIcon />,
    [States.OpenBet]: <RichIcon />,
    [States.OpenBet]: <RichIcon />,
    [States.CompleteWinner]: <RichIcon />,
    [States.CompleteLoser]: <RichIcon />,
  },
}

export const Icon = ({ width = 10, src, state = undefined }: { width?: number; src: string; state?: string }) =>
  state && states[src] && states[src][parseState(state)]
    ? React.cloneElement(states[src][parseState(state)], {
        style: { width: s[`m${width}`], height: "auto" },
      })
    : src && !state
    ? React.cloneElement(icons[src], {
        style: { width: s[`m${width}`], height: "auto" },
      })
    : null

Icon.Center = ({ width = 10, src, state = undefined }: { width?: number; src: string; state?: string }) => (
  <div style={{ justifyContent: "center", alignItems: "center", padding: `0 ${s.m12}` }}>
    {React.cloneElement(state ? states[src][state] : icons[src], { style: { width: s[`m${width}`], height: "auto" } })}
  </div>
)
