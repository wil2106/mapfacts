import { createTheme } from "@rneui/themed";

const theme = createTheme({
  lightColors: {
    background: "#F7F8FA",
    black: "#15191C",
    primary: "#0BA8F7",
    secondary: "#CF47FD",
    error: "#E1143D",
    grey0: "#656D78",
    grey1: "#9A9EA7",
    grey2: "#CFD4DA",
    grey3: "#E9EDF0",
    success: "#32CE93",
    tertiary: "#F33C58",
  },
  darkColors: {},
  components: {
    Icon: (props, theme) => ({
      size: 33,
      hitSlop: {top: 25, bottom: 25, left: 25, right: 25},
      color: theme.colors.black,
    }),
    Button: (props, theme) => ({
      buttonStyle: {
        borderRadius: 30,
      },
      titleStyle: {
        fontFamily: "Fredoka_Medium"
      },
    }),
    Text: (props, theme) => ({
      style: {
        fontFamily: "Fredoka_Regular",
        color: theme.colors.black,
      },
    }),
    Input: (props, theme) => ({
      inputContainerStyle: {
        borderBottomWidth: 0,
        height: undefined,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 0,
        borderRadius: 100,
        backgroundColor: "white",
      },
      inputStyle: {
        minHeight: undefined,
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginHorizontal: 0,
        color: theme.colors.black,
        fontSize: 14,
        fontFamily: "Fredoka_Regular",
      },
      style: {
        marginHorizontal: 0,
      },
      containerStyle: {
        paddingHorizontal: 0,
      }
    })
  },
  mode: "light",
});

export default theme;
