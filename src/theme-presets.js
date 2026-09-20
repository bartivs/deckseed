// Original harness palettes informed by common presentation-theme families.
// Keep every preset self-contained so generated decks remain portable.
export const themePresets = {
  midnight: {
    label: "Midnight",
    colorScheme: "dark",
    variables: {
      "--harness-bg": "#07111f",
      "--harness-bg-image": "radial-gradient(circle at 82% 12%, rgba(86, 215, 232, 0.14), transparent 34%)",
      "--harness-panel": "#12243a",
      "--harness-text": "#f2f7fb",
      "--harness-heading": "#ffffff",
      "--harness-muted": "#9db1c7",
      "--harness-accent": "#56d7e8",
      "--harness-border": "rgba(157, 177, 199, 0.25)",
      "--harness-font-body": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-font-heading": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-radius": "18px",
      "--harness-shadow": "0 18px 45px rgba(0, 0, 0, 0.2)"
    }
  },
  paper: {
    label: "Paper",
    colorScheme: "light",
    variables: {
      "--harness-bg": "#f5f1e8",
      "--harness-bg-image": "repeating-linear-gradient(0deg, rgba(23, 32, 42, 0.025) 0 1px, transparent 1px 28px)",
      "--harness-panel": "#ffffff",
      "--harness-text": "#17202a",
      "--harness-heading": "#111820",
      "--harness-muted": "#5d6975",
      "--harness-accent": "#066b78",
      "--harness-border": "rgba(23, 32, 42, 0.18)",
      "--harness-font-body": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-font-heading": "Georgia, Cambria, serif",
      "--harness-radius": "12px",
      "--harness-shadow": "0 14px 35px rgba(45, 38, 27, 0.08)"
    }
  },
  ember: {
    label: "Ember",
    colorScheme: "dark",
    variables: {
      "--harness-bg": "#180d0a",
      "--harness-bg-image": "radial-gradient(circle at 18% 88%, rgba(255, 138, 61, 0.16), transparent 36%)",
      "--harness-panel": "#2a1711",
      "--harness-text": "#fff6ed",
      "--harness-heading": "#ffffff",
      "--harness-muted": "#d0a68f",
      "--harness-accent": "#ff8a3d",
      "--harness-border": "rgba(255, 176, 122, 0.25)",
      "--harness-font-body": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-font-heading": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-radius": "18px",
      "--harness-shadow": "0 18px 45px rgba(0, 0, 0, 0.28)"
    }
  },
  atlas: {
    label: "Atlas",
    colorScheme: "dark",
    variables: {
      "--harness-bg": "#09182e",
      "--harness-bg-image": "linear-gradient(135deg, rgba(233, 191, 85, 0.08), transparent 42%)",
      "--harness-panel": "#102747",
      "--harness-text": "#f5f7fb",
      "--harness-heading": "#ffffff",
      "--harness-muted": "#aab8cc",
      "--harness-accent": "#e9bf55",
      "--harness-border": "rgba(233, 191, 85, 0.28)",
      "--harness-font-body": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-font-heading": "Georgia, Cambria, serif",
      "--harness-radius": "8px",
      "--harness-shadow": "0 20px 48px rgba(0, 0, 0, 0.24)"
    }
  },
  solar: {
    label: "Solar",
    colorScheme: "light",
    variables: {
      "--harness-bg": "#fdf6e3",
      "--harness-bg-image": "radial-gradient(circle at 86% 14%, rgba(181, 137, 0, 0.12), transparent 32%)",
      "--harness-panel": "#eee8d5",
      "--harness-text": "#073642",
      "--harness-heading": "#002b36",
      "--harness-muted": "#586e75",
      "--harness-accent": "#167a9b",
      "--harness-border": "rgba(7, 54, 66, 0.2)",
      "--harness-font-body": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-font-heading": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-radius": "14px",
      "--harness-shadow": "0 14px 38px rgba(88, 71, 38, 0.1)"
    }
  },
  ocean: {
    label: "Ocean",
    colorScheme: "light",
    variables: {
      "--harness-bg": "#eaf7fb",
      "--harness-bg-image": "linear-gradient(160deg, rgba(66, 170, 195, 0.16), transparent 48%)",
      "--harness-panel": "#ffffff",
      "--harness-text": "#123447",
      "--harness-heading": "#0a4e68",
      "--harness-muted": "#527080",
      "--harness-accent": "#006f82",
      "--harness-border": "rgba(10, 78, 104, 0.18)",
      "--harness-font-body": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-font-heading": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-radius": "24px",
      "--harness-shadow": "0 18px 44px rgba(39, 101, 119, 0.13)"
    }
  },
  plum: {
    label: "Plum",
    colorScheme: "dark",
    variables: {
      "--harness-bg": "#171221",
      "--harness-bg-image": "radial-gradient(circle at 78% 18%, rgba(189, 147, 249, 0.2), transparent 34%)",
      "--harness-panel": "#251b35",
      "--harness-text": "#f8f3ff",
      "--harness-heading": "#ffffff",
      "--harness-muted": "#c4b1da",
      "--harness-accent": "#bd93f9",
      "--harness-border": "rgba(189, 147, 249, 0.3)",
      "--harness-font-body": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-font-heading": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-radius": "20px",
      "--harness-shadow": "0 22px 52px rgba(0, 0, 0, 0.3)"
    }
  },
  mono: {
    label: "Mono",
    colorScheme: "light",
    variables: {
      "--harness-bg": "#f7f7f5",
      "--harness-bg-image": "repeating-linear-gradient(90deg, rgba(16, 16, 16, 0.035) 0 1px, transparent 1px 32px)",
      "--harness-panel": "#ffffff",
      "--harness-text": "#101010",
      "--harness-heading": "#000000",
      "--harness-muted": "#595959",
      "--harness-accent": "#101010",
      "--harness-border": "rgba(16, 16, 16, 0.2)",
      "--harness-font-body": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      "--harness-font-heading": "Arial, Helvetica, sans-serif",
      "--harness-radius": "0px",
      "--harness-shadow": "6px 6px 0 rgba(16, 16, 16, 0.14)"
    }
  },
  meadow: {
    label: "Meadow",
    colorScheme: "light",
    variables: {
      "--harness-bg": "#f2f4e8",
      "--harness-bg-image": "radial-gradient(circle at 12% 16%, rgba(63, 125, 88, 0.13), transparent 30%)",
      "--harness-panel": "#fffef7",
      "--harness-text": "#233127",
      "--harness-heading": "#173c2a",
      "--harness-muted": "#627064",
      "--harness-accent": "#356b4b",
      "--harness-border": "rgba(35, 49, 39, 0.18)",
      "--harness-font-body": "Inter, ui-sans-serif, system-ui, sans-serif",
      "--harness-font-heading": "Georgia, Cambria, serif",
      "--harness-radius": "22px",
      "--harness-shadow": "0 16px 38px rgba(56, 79, 61, 0.12)"
    }
  }
};
