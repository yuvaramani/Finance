import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

/**
 * Global CSS Styles
 * Applied to the entire application
 */
export default function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={(theme) => ({
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          width: '100%',
          fontFamily: theme.typography.fontFamily,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        },
        '#root': {
          height: '100%',
          width: '100%',
        },
        a: {
          textDecoration: 'none',
          color: 'inherit',
        },
        'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        'input[type=number]': {
          MozAppearance: 'textfield',
        },
        // Scrollbar styles
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: theme.palette.background.default,
        },
        '::-webkit-scrollbar-thumb': {
          background: theme.palette.divider,
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: theme.palette.text.secondary,
        },
      })}
    />
  );
}
