import { Toaster } from "react-hot-toast"
import { darken, lighten } from "khroma"

const rawColors = {
  darkBlue: "hsl(243.87, 39.24%, 15.49%)",
  green: "hsl(116.90, 100%, 65.88%)",
}

export const Toast = () => {
  return (
    <Toaster
      toastOptions={{
        style: {
          color: "#fcfcfc",
          background: rawColors.darkBlue,
          borderTop: `2px solid ${lighten(rawColors.darkBlue, 12)}`,
          borderLeft: `2px solid ${lighten(rawColors.darkBlue, 10)}`,
          borderRight: `2px solid ${darken(rawColors.darkBlue, 20)}`,
          borderBottom: `2px solid ${darken(rawColors.darkBlue, 25)}`,
          zIndex: 1,
        },
        duration: 5000,
        success: {
          duration: 5000,
          iconTheme: {
            primary: "#1a1837",
            secondary: "#fcfcfc",
          },
          style: {
            color: "#000",
            background: rawColors.green,
            borderTop: `2px solid ${lighten(rawColors.green, 12)}`,
            borderLeft: `2px solid ${lighten(rawColors.green, 10)}`,
            borderRight: `2px solid ${darken(rawColors.green, 20)}`,
            borderBottom: `2px solid ${darken(rawColors.green, 25)}`,
          },
        },
      }}
    />
  )
}
