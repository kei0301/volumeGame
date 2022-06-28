import styled from "@emotion/styled"
import { s } from "@pricegame/shared"
import { colors } from "../../theme"

export const Text = styled.span<{ color?: string; size?: number }>`
  color: ${({ color }) => (color ? colors[color]["default"] : "inherit")};
  font-size: ${({ size }) => (size ? s[`m${size}`] : s.m10)};
`
