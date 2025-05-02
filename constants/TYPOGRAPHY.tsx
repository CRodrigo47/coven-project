import { TextStyle } from 'react-native';
import { FONTS } from './FONTS';
import { COLORS } from './COLORS';

type TypographyVariant = 
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

type ThemeMode = 'light' | 'dark';

export const TYPOGRAPHY: Record<
  TypographyVariant, 
  Record<ThemeMode, TextStyle>
> = {

  displayLarge: {
    light: {
      fontFamily: FONTS.regular,
      fontSize: 57,
      lineHeight: 64,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.regular,
      fontSize: 57,
      lineHeight: 64,
      color: COLORS.white,
    },
  },
  displayMedium: {
    light: {
      fontFamily: FONTS.regular,
      fontSize: 45,
      lineHeight: 52,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.regular,
      fontSize: 45,
      lineHeight: 52,
      color: COLORS.white,
    },
  },
  displaySmall: {
    light: {
      fontFamily: FONTS.regular,
      fontSize: 36,
      lineHeight: 44,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.regular,
      fontSize: 36,
      lineHeight: 44,
      color: COLORS.white,
    },
  },

  headlineLarge: {
    light: {
      fontFamily: FONTS.semiBold,
      fontSize: 32,
      lineHeight: 40,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.semiBold,
      fontSize: 32,
      lineHeight: 40,
      color: COLORS.white,
    },
  },
  headlineMedium: {
    light: {
      fontFamily: FONTS.semiBold,
      fontSize: 28,
      lineHeight: 36,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.semiBold,
      fontSize: 28,
      lineHeight: 36,
      color: COLORS.white,
    },
  },
  headlineSmall: {
    light: {
      fontFamily: FONTS.semiBold,
      fontSize: 24,
      lineHeight: 32,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.semiBold,
      fontSize: 24,
      lineHeight: 32,
      color: COLORS.white,
    },
  },

  titleLarge: {
    light: {
      fontFamily: FONTS.semiBold,
      fontSize: 22,
      lineHeight: 28,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.semiBold,
      fontSize: 22,
      lineHeight: 28,
      color: COLORS.white,
    },
  },
  titleMedium: {
    light: {
      fontFamily: FONTS.semiBold,
      fontSize: 18,
      lineHeight: 24,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.semiBold,
      fontSize: 18,
      lineHeight: 24,
      color: COLORS.white,
    },
  },
  titleSmall: {
    light: {
      fontFamily: FONTS.medium,
      fontSize: 16,
      lineHeight: 22,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.medium,
      fontSize: 16,
      lineHeight: 22,
      color: COLORS.white,
    },
  },

  bodyLarge: {
    light: {
      fontFamily: FONTS.medium,
      fontSize: 16,
      lineHeight: 24,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.medium,
      fontSize: 16,
      lineHeight: 24,
      color: COLORS.white,
    },
  },
  bodyMedium: {
    light: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      lineHeight: 20,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      lineHeight: 20,
      color: COLORS.white,
    },
  },
  bodySmall: {
    light: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      lineHeight: 16,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      lineHeight: 16,
      color: COLORS.white,
    },
  },

  labelLarge: {
    light: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      color: COLORS.white,
    },
  },
  labelMedium: {
    light: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
      color: COLORS.white,
    },
  },
  labelSmall: {
    light: {
      fontFamily: FONTS.medium,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 0.5,
      color: COLORS.black,
    },
    dark: {
      fontFamily: FONTS.medium,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 0.5,
      color: COLORS.white,
    },
  },
};

export const getTypography = (
  variant: TypographyVariant,
  theme: ThemeMode
): TextStyle => {
  return TYPOGRAPHY[variant][theme];
};