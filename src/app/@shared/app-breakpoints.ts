/**
 * Breakpoints map to be used by BreakpointObserver.
 * Is a copy of the default Breakpoints map in CDK library.
 * We can add custom breakpoints here to be used by Breakpoint observers.
 */

export const AppBreakpoints = {
  // xsmall
  XSmall: '(max-width: 599.98px)',
  // vsmall
  VSmall: '(min-width: 280px) and (max-width: 479.98px)',
  // small
  Small: '(min-width: 600px) and (max-width: 959.98px)',
  Small1: '(min-width: 600px) and (max-width: 767.98px)',
  Small2: '(min-width: 768px) and (max-width: 959.98px)',
  // lt and gt
  LtSmall: '(max-width: 599.98px)',
  LtSmall1: '(max-width: 599.98px)',
  LtSmall2: '(max-width: 767.98px)',
  GtSmall: '(min-width: 960px)',
  GtSmall1: '(min-width: 780px)',
  GtSmall2: '(min-width: 960px)',
  // medium
  Medium: '(min-width: 960px) and (max-width: 1279.98px)',
  Medium1: '(min-width: 960px) and (max-width: 1023.98px)',
  Medium2: '(min-width: 1024px) and (max-width: 1279.98px)',
  // lt and gt
  LtMedium: '(max-width: 959.98px)',
  LtMedium1: '(max-width: 959.98px)',
  LtMedium2: '(max-width: 1023.98px)',
  GtMedium: '(min-width: 1280px)',
  GtMedium1: '(min-width: 1024px)',
  GtSMedium2: '(min-width: 1280px)',
  // large
  Large: '(min-width: 1280px) and (max-width: 1919.98px)',
  Large1: '(min-width: 1280px) and (max-width: 1599.98px)',
  Large2: '(min-width: 1600px) and (max-width: 1919.98px)',
  // lt and gt
  LtLarge: '(max-width: 1279.98px)',
  LtLarge1: '(max-width: 1279.98px)',
  LtLarge2: '(max-width: 1599.98px)',
  GtLarge: '(min-width: 1920px)',
  GtLarge1: '(min-width: 1600px)',
  GtLarge2: '(min-width: 1920px)',
  // xlarge
  XLarge: '(min-width: 1920px)',

  // orientation
  Handset: '(max-width: 599.98px) and (orientation: portrait), ' + '(max-width: 959.98px) and (orientation: landscape)',
  Tablet:
    '(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait), ' +
    '(min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)',
  Web: '(min-width: 840px) and (orientation: portrait), ' + '(min-width: 1280px) and (orientation: landscape)',
  // portrait
  HandsetPortrait: '(max-width: 599.98px) and (orientation: portrait)',
  TabletPortrait: '(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait)',
  WebPortrait: '(min-width: 840px) and (orientation: portrait)',
  // landscape
  HandsetLandscape: '(max-width: 959.98px) and (orientation: landscape)',
  TabletLandscape: '(min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)',
  WebLandscape: '(min-width: 1280px) and (orientation: landscape)',
};

export const swiperBreakpointsLarge = {
  Zero: 769,
  XSmall: 900,
  Small: 1000,
  Medium: 1100,
  Large: 1218,
};

export const swiperBreakpointsSmall = {
  Zero: 0,
  XSmall: 400,
  Small: 500,
  Medium: 600,
  Large: 768,
};
