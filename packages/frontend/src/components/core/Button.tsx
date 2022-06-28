import styled from "@emotion/styled"
import { s } from "@pricegame/shared"
import Repeatable from "react-repeatable"
import { background, border, borderRadius, c } from "../../theme"

interface props {
  disabled?: boolean
  color?: string
  textColor?: string
  padding?: string
  height?: string
}

export const ButtonContainer = styled.div<props>`
  ${borderRadius}
  ${({ color }) => background(color ?? "yellow")};
  ${({ color }) => border(2, color ?? "yellow", color === "disabled" ? "inset" : "")};
  color: ${({ textColor, disabled }) => (disabled ? c.gray : textColor ? textColor : c.black)};
  height: ${({ padding, height }) => (padding ? "auto" : height ? height : s.m15)};
  padding: ${({ padding }) => padding ?? "0"} ${s.m12};
  align-content: center;
  justify-items: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.05s ease;
  &:hover:not(.disabled) {
    ${({ color }) => background(color ?? "yellow", "hover")};
    ${({ color }) => border(2, color ?? "yellow", "hover")};
    transition: all 0.05s ease;
  }
  &:active:not(.disabled) {
    ${({ color }) => background(color ?? "yellow", "active")};
    ${({ color }) => border(2, color ?? "yellow", "active")};
    transition: all 0.05s ease;
  }
`

export const Button = ({
  holdClick = false,
  onClick = undefined,
  children = {},
  style = {},
  disabled = false,
  ...props
}) => {
  const click = !disabled ? onClick : undefined
  if (holdClick) {
    return (
      <Repeatable onHold={click} onRelease={click} {...style}>
        <ButtonContainer {...{ color: disabled ? "disabled" : undefined, ...props }}>{children}</ButtonContainer>
      </Repeatable>
    )
  } else {
    return (
      <ButtonContainer onClick={click} {...{ color: disabled ? "disabled" : undefined, ...props, ...style }}>
        {children}
      </ButtonContainer>
    )
  }
}
