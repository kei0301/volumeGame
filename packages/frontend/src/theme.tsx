import { css } from "@emotion/react"
import { s } from "@pricegame/shared"
import { darken, lighten } from "khroma"

export const c = {
  black: "#000",
  blue: "#231e46",
  green: "#5aff51",
  red: "#fd6158",
  disabled: "#191837",
  gray: "#b7b7c1",
  yellow: "#ffbd01",
}
const capitalize = (s) => {
  if (typeof s !== "string") return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const borderRadius = css`
  border-radius: ${s.m8};
`

export const boxShadow = (type?: string) => {
  if (type === "special") {
    return css`
      box-shadow: ${s.m8} ${s.m8} ${s.m3} -${s.m4} hsla(0, 0%, 0%, 0.15);
    `
  } else {
    return css`
      box-shadow: ${s.m8} ${s.m8} ${s.m8} -${s.m4} hsla(0, 0%, 0%, 0.15), 0 -${s.m4} ${s.m4} 0 hsla(0, 0%, 0%, 0.1);
    `
  }
}

const colorGenerator = (color, top, left, right, bottom, hover, active) => {
  const hoverColor = lighten(color, hover)
  const activeColor = darken(color, active)
  return {
    default: color,
    top: lighten(color, top[0]),
    left: lighten(color, left[0]),
    right: darken(color, right[0]),
    bottom: darken(color, bottom[0]),
    topInset: darken(color, top[1]),
    leftInset: darken(color, left[1]),
    rightInset: lighten(color, right[1]),
    bottomInset: lighten(color, bottom[1]),
    defaultHover: hoverColor,
    topHover: lighten(hoverColor, top[2]),
    leftHover: lighten(hoverColor, left[2]),
    rightHover: darken(hoverColor, right[2]),
    bottomHover: darken(hoverColor, bottom[2]),
    defaultActive: activeColor,
    topActive: darken(activeColor, top[3]),
    leftActive: darken(activeColor, left[3]),
    rightActive: lighten(activeColor, right[3]),
    bottomActive: lighten(activeColor, bottom[3]),
  }
}

export const colors = {
  black: colorGenerator(c.black, [10, 10, 10, 10], [6, 6, 6, 6], [8, 8, 8, 8], [10, 10, 8, 8], 10, 10),
  blue: colorGenerator(c.blue, [10, 10, 10, 10], [6, 6, 6, 6], [8, 8, 8, 8], [10, 10, 8, 8], 10, 10),
  yellow: colorGenerator(
    c.yellow,
    [20, 10, 20, 15],
    [17.5, 6, 17.5, 10],
    [17.5, 8, 17.5, 7.5],
    [20, 10, 20, 10],
    10,
    1,
  ),
  green: colorGenerator(c.green, [20, 25, 12, 20], [17.5, 20, 10, 15], [17.5, 8, 20, 8], [20, 10, 25, 10], 6, 6),
  red: colorGenerator(c.red, [20, 8, 8, 5], [17.5, 6, 6, 2], [17.5, 6, 6, 2], [20, 8, 8, 5], 4, 4),
  disabled: colorGenerator(c.disabled, [10, 10, 10, 10], [6, 6, 6, 6], [8, 8, 8, 8], [10, 10, 8, 8], 10, 10),
}

export const background = (color, type = "") => css`
  background: ${colors[color][`default${type ? capitalize(type) : ""}`]};
`

export const zIndex = (i) => css`
  z-index: ${i};
`

export const color = (color, type = "") => css`
  color: ${colors[color][`default${type ? capitalize(type) : ""}`]};
`

export const border = (size, color, type = "") => {
  return css`
    border-top: ${size}px solid ${colors[color][`top${type ? capitalize(type) : ""}`]};
    border-left: ${size}px solid ${colors[color][`left${type ? capitalize(type) : ""}`]};
    border-right: ${size}px solid ${colors[color][`right${type ? capitalize(type) : ""}`]};
    border-bottom: ${size}px solid ${colors[color][`bottom${type ? capitalize(type) : ""}`]};
  `
}
