import type { Theme } from "react-select"

export function selectTheme(theme: Theme): Theme {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: "#25d366",
      primary75: "#1da851",
      primary50: "#bfeecf",
      primary25: "#e9f9ef",
    },
  }
}
