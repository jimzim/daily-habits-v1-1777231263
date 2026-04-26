import { ColorScheme, ThemeColors, getColors } from './colors';
import { typography } from './typography';
import { spacing, radii, elevation, TOUCH_TARGET } from './spacing';

export * from './colors';
export * from './typography';
export * from './spacing';

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  elevation: typeof elevation;
  touchTarget: typeof TOUCH_TARGET;
}

export function getTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: getColors(scheme),
    typography,
    spacing,
    radii,
    elevation,
    touchTarget: TOUCH_TARGET,
  };
}
