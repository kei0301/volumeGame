import styled from "@emotion/styled"
import { s } from "@pricegame/shared"
import { c } from "../../theme"
import { Text } from "./Text"

const Circle = styled.span`
  width: ${s.m9};
  height: ${s.m9};
  border-radius: 50%;
  margin-top: ${s.m5};
  margin-right: ${s.m8};
  flex-shrink: 0;
`

const CheckListContainer = styled.div`
  display: flex;
`

export const CheckList = ({ list }) =>
  list ? (
    <div>
      {list.map(({ text, checked }, index) => (
        <CheckListContainer key={index}>
          <Circle style={{ background: checked ? c.green : c.red }} />
          <Text>{text}</Text>
        </CheckListContainer>
      ))}
    </div>
  ) : null
