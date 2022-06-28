import styled from "@emotion/styled"
import { s } from "@pricegame/shared"

const BigIconColumn = styled.div`
  grid-template-columns: max-content 1fr;
  align-items: center;
  grid-gap: ${s.m10};
  justify-content: center;
  align-content: center;
`

const TwoColumns = styled.div`
  grid-gap: ${s.m10};
  grid-auto-flow: column;
`

export const Layout = () => null

Layout.BigIconColumn = ({ children }) => <BigIconColumn>{children}</BigIconColumn>

Layout.TwoColumns = ({ children, ...props }) => <TwoColumns {...props}>{children}</TwoColumns>

Layout.Wrapper = ({ children }) => <div>{children}</div>
