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
      hitSlop: { top: 25, bottom: 25, left: 25, right: 25 },
      color: theme.colors.black,
    }),
    Button: (props, theme) => ({
      buttonStyle: {
        borderRadius: 30,
      },
      titleStyle: {
        fontFamily: "Fredoka_Medium",
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
      },
    }),
    SearchBar: (props, theme) => ({
      containerStyle: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        backgroundColor: "transparent",
        borderTopWidth: 0,
        borderBottomWidth: 0
      },
      inputContainerStyle: {
        backgroundColor: theme.colors.grey3,
        borderRadius: 100,
        paddingLeft: 6
      },
      style: {
        backgroundColor: "transparent",
      },
      inputStyle: {
        color: theme.colors.black,
        fontFamily: "Fredoka_Medium",
        fontSize: 16
      },
      placeholderTextColor: theme.colors.grey0,
      searchIcon: {type: 'font-awesome', color: theme.colors.black, name: 'search', size: 20 },
      clearIcon: {type: 'font-awesome', color: theme.colors.grey0, name: 'times-circle', size: 24 },
    }),
    ListItem: (props, theme) => ({
      containerStyle: {
        borderTopRightRadius: props.first ? 15 : 0,
        borderTopLeftRadius: props.first ? 15 : 0,
        borderBottomRightRadius: props.last ? 15 : 0,
        borderBottomLeftRadius: props.last ? 15 : 0,
        backgroundColor: "white",
        borderBottomColor: theme.colors.grey3,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,

        elevation: 1,
      },
    }),
    ListItemChevron: (props, theme) => ({
      iconStyle: {
        color: theme.colors.grey2
      }
    }),
    ListItemTitle: (props, theme) => ({
      style: {color: theme.colors.black},
      fontFamily: "Fredoka_Medium",
    }),
  },
  mode: "light",
});

export default theme;
