import styled from "@emotion/styled"
import { s } from "@pricegame/shared"
import { useAuth } from "../hooks/useAuth"
import { Button } from "./core/Button"
import { Text } from "./core/Text"
import { Icon } from "./core/Icon"

const Container = styled.div`
  grid-area: header;
  position: relative;
  z-index: -50;
  grid-auto-flow: column;
  justify-content: space-between;
  padding: 0 ${s.m8} 0;
  padding-top: ${s.m6};
  @media (min-width: 600px) {
    padding: 0 ${s.m12} 0;
    padding-top: ${s.m6};
  }
  @media (min-height: 667px) {
    padding-top: ${s.m10};
  }
`

const Branding = styled.div`
  grid-auto-flow: column;
  grid-column-gap: ${s.m8};
  align-items: center;
  h1 {
    font-size: ${s.m12};
    margin-bottom: -${s.m4};
  }
  h2 {
    opacity: 0.7;
    display: none;
  }
  @media (min-width: 600px) {
    h2 {
      display: grid;
    }
  }
`

const UserControllerContainer = styled.div`
  align-items: center;
  grid-template-columns: auto max-content;
  grid-gap: ${s.m8};
`

const UserController = () => {
  const { accountName, login, logout, active } = useAuth()

  return (
    <UserControllerContainer>
      {!active && (
        <Button onClick={() => login()}>
          <Text>Connect Wallet</Text>
        </Button>
      )}
      {active && (
        <>
          <Button color="green">{accountName}</Button>
          <Button color="red" onClick={() => logout()}>
            <Icon src="logout" width={11} />
          </Button>
        </>
      )}
    </UserControllerContainer>
  )
}

export const Header = () => (
  <Container>
    <Branding>
      <Icon src="logo" width={15} />
      <section>
        <h1>PriceGame</h1>
        <h2>Part of DAOventures</h2>
      </section>
    </Branding>
    <UserController />
  </Container>
)
