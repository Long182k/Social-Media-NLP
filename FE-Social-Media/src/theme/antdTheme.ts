import type { MappingAlgorithm, ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";

const palette = {
  paper: "oklch(97% 0.012 95)",
  paper2: "oklch(94% 0.016 95)",
  paper3: "oklch(91% 0.020 95)",
  ink: "oklch(20% 0.012 250)",
  ink2: "oklch(42% 0.012 250)",
  rule: "oklch(88% 0.016 95)",
  accent: "#eed23c",
  accent2: "#3f8fd2",
  accent3: "#e8604c",
  mint: "#46c48a",
  lavender: "#a48ae0",
  focus: "#3f8fd2",
  paperDark: "#23242e",
  paperDark2: "#2b2d3a",
  paperDark3: "#343746",
  inkDark: "#f3f0e6",
  inkDark2: "#b6b3a7",
  ruleDark: "#4a4c5c",
};

export const humLightTheme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: palette.accent,
    colorInfo: palette.accent2,
    colorSuccess: palette.mint,
    colorError: palette.accent3,
    colorWarning: palette.accent,
    colorLink: palette.accent2,
    colorBgBase: palette.paper,
    colorBgContainer: palette.paper,
    colorBgLayout: palette.paper2,
    colorBgElevated: palette.paper,
    colorTextBase: palette.ink,
    colorText: palette.ink,
    colorTextSecondary: palette.ink2,
    colorBorder: palette.rule,
    colorBorderSecondary: palette.rule,
    colorSplit: palette.rule,
    colorFillQuaternary: palette.paper2,
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    controlHeight: 44,
    fontSize: 15,
    boxShadow:
      "0 12px 32px -16px oklch(20% 0.012 250 / 0.14), 0 2px 6px -2px oklch(20% 0.012 250 / 0.10)",
    boxShadowSecondary: "0 8px 20px -12px oklch(20% 0.012 250 / 0.12)",
    wireframe: false,
  },
  components: {
    Button: {
      colorPrimary: palette.accent,
      colorPrimaryHover: palette.accent,
      colorPrimaryActive: palette.accent,
      borderRadius: 999,
      borderRadiusLG: 999,
      borderRadiusSM: 999,
      fontWeight: 600,
      primaryShadow: "0 4px 0 0 #d4b62e",
      defaultBorderRadius: 999,
    },
    Card: {
      borderRadiusLG: 20,
    },
    Input: {
      borderRadius: 12,
      borderRadiusLG: 12,
      colorBorder: palette.rule,
      activeShadow: "0 0 0 3px oklch(66% 0.18 235 / 0.25)",
    },
    Menu: {
      itemBorderRadius: 12,
      itemSelectedBg: "oklch(86% 0.18 95 / 0.30)",
      itemSelectedColor: palette.ink,
      itemHoverBg: "oklch(86% 0.18 95 / 0.18)",
      itemBg: "transparent",
      itemMarginBlock: 4,
      itemHeight: 44,
      itemMarginInline: 8,
    },
    Avatar: {
      containerSize: 40,
    },
    Tag: {
      borderRadiusSM: 999,
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Message: {
      borderRadiusLG: 16,
    },
  },
};

export const humDarkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    ...humLightTheme.token,
    colorBgBase: palette.paperDark,
    colorBgContainer: palette.paperDark2,
    colorBgLayout: palette.paperDark,
    colorBgElevated: palette.paperDark3,
    colorTextBase: palette.inkDark,
    colorText: palette.inkDark,
    colorTextSecondary: palette.inkDark2,
    colorBorder: palette.ruleDark,
    colorBorderSecondary: palette.ruleDark,
    colorSplit: palette.ruleDark,
    colorFillQuaternary: palette.paperDark2,
  },
  components: {
    ...humLightTheme.components,
    Menu: {
      itemBorderRadius: 12,
      itemSelectedBg: "oklch(86% 0.18 95 / 0.22)",
      itemSelectedColor: palette.inkDark,
      itemHoverBg: "oklch(86% 0.18 95 / 0.12)",
      itemBg: "transparent",
      itemMarginBlock: 4,
      itemHeight: 44,
      itemMarginInline: 8,
    },
  },
};

export type { MappingAlgorithm };
