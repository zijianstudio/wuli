// Copyright 2017-2022, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import Fraction from '../../../phetcommon/js/model/Fraction.js';
import MathSymbolFont from '../../../scenery-phet/js/MathSymbolFont.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import equalityExplorer from '../equalityExplorer.js';
const PANEL_CORNER_RADIUS = 3;

// options shared by all accordion boxes
const ACCORDION_BOX_OPTIONS = {
  resize: false,
  fill: 'white',
  titleAlignX: 'left',
  titleXSpacing: 8,
  buttonXMargin: 10,
  buttonYMargin: 8,
  cornerRadius: PANEL_CORNER_RADIUS,
  expandCollapseButtonOptions: {
    sideLength: 20,
    touchAreaXDilation: 10,
    touchAreaYDilation: 10
  }
};

// Credits are applied to the entire family of sims:
// equality-explorer, equality-explorer-basics and equality-explorer-two-variables
const CREDITS = {
  leadDesign: 'Amanda McGarry',
  softwareDevelopment: 'Chris Malley (PixelZoom, Inc.)',
  team: 'Diana L\u00f3pez Tavares, Ariel Paul, Kathy Perkins, Argenta Price, Beth Stade, David Webb',
  qualityAssurance: 'Steele Dalton, Ethan Johnson, Megan Lai, Andrea Lin, Emily Miller, Liam Mulhall, Jacob Romero, Nancy Salpepi, Kathryn Woessner',
  graphicArts: 'Mariah Hermsmeyer, Cheryl McCutchan'
};
const EqualityExplorerConstants = {
  CREDITS: CREDITS,
  // ScreenView
  SCREEN_VIEW_X_MARGIN: 20,
  SCREEN_VIEW_Y_MARGIN: 16,
  SCREEN_VIEW_LAYOUT_BOUNDS: ScreenView.DEFAULT_LAYOUT_BOUNDS,
  // Workaround for things shifting around that aren't supposed to move
  // See https://github.com/phetsims/scenery/issues/1289 and https://github.com/phetsims/equality-explorer/issues/174
  SCREEN_VIEW_PREVENT_FIT: true,
  // Solve It! game
  NUMBER_OF_GAME_LEVELS: 5,
  // terms
  DEFAULT_CONSTANT_VALUE: Fraction.fromInteger(1),
  // constant terms are created with this value by default
  DEFAULT_COEFFICIENT: Fraction.fromInteger(1),
  // variable terms are created with this coefficient by default
  SMALL_TERM_DIAMETER: 32,
  // diameter of small terms, like those in the TermsToolboxNode
  BIG_TERM_DIAMETER: 100,
  // diameter of big terms, like those on the scale in the Operations screen
  SHADOW_OPACITY: 0.4,
  // opacity of the shadow that appears on terms, 0-1 (transparent-opaque)

  // ranges
  VARIABLE_RANGE: new Range(-40, 40),
  // range for symbolic variables (x, y)
  OBJECT_VARIABLE_RANGE: new Range(1, 20),
  // range for object variables (sphere, cat, dog,...)
  OPERAND_RANGE: new Range(-10, 10),
  ACCORDION_BOX_OPTIONS: ACCORDION_BOX_OPTIONS,
  // Fonts
  ACCORDION_BOX_TITLE_FONT: new PhetFont(18),
  UNIVERSAL_OPERATION_SYMBOL_FONT: new MathSymbolFont(24),
  // for anything that's not a number
  UNIVERSAL_OPERATION_INTEGER_FONT: new PhetFont(24),
  // for integer numbers
  UNIVERSAL_OPERATION_FRACTION_FONT: new PhetFont(12),
  // for fraction numerator and denominator
  SUM_TO_ZERO_BIG_FONT_SIZE: 40,
  // for sum-to-zero animation that involves a 'big' term on the scale
  SUM_TO_ZERO_SMALL_FONT_SIZE: 24,
  // for sum-to-zero animation that involves a 'small' term on the scale

  // Panels
  PANEL_CORNER_RADIUS: PANEL_CORNER_RADIUS
};
equalityExplorer.register('EqualityExplorerConstants', EqualityExplorerConstants);
export default EqualityExplorerConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlNjcmVlblZpZXciLCJGcmFjdGlvbiIsIk1hdGhTeW1ib2xGb250IiwiUGhldEZvbnQiLCJlcXVhbGl0eUV4cGxvcmVyIiwiUEFORUxfQ09STkVSX1JBRElVUyIsIkFDQ09SRElPTl9CT1hfT1BUSU9OUyIsInJlc2l6ZSIsImZpbGwiLCJ0aXRsZUFsaWduWCIsInRpdGxlWFNwYWNpbmciLCJidXR0b25YTWFyZ2luIiwiYnV0dG9uWU1hcmdpbiIsImNvcm5lclJhZGl1cyIsImV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyIsInNpZGVMZW5ndGgiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJDUkVESVRTIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwiRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJTQ1JFRU5fVklFV19MQVlPVVRfQk9VTkRTIiwiREVGQVVMVF9MQVlPVVRfQk9VTkRTIiwiU0NSRUVOX1ZJRVdfUFJFVkVOVF9GSVQiLCJOVU1CRVJfT0ZfR0FNRV9MRVZFTFMiLCJERUZBVUxUX0NPTlNUQU5UX1ZBTFVFIiwiZnJvbUludGVnZXIiLCJERUZBVUxUX0NPRUZGSUNJRU5UIiwiU01BTExfVEVSTV9ESUFNRVRFUiIsIkJJR19URVJNX0RJQU1FVEVSIiwiU0hBRE9XX09QQUNJVFkiLCJWQVJJQUJMRV9SQU5HRSIsIk9CSkVDVF9WQVJJQUJMRV9SQU5HRSIsIk9QRVJBTkRfUkFOR0UiLCJBQ0NPUkRJT05fQk9YX1RJVExFX0ZPTlQiLCJVTklWRVJTQUxfT1BFUkFUSU9OX1NZTUJPTF9GT05UIiwiVU5JVkVSU0FMX09QRVJBVElPTl9JTlRFR0VSX0ZPTlQiLCJVTklWRVJTQUxfT1BFUkFUSU9OX0ZSQUNUSU9OX0ZPTlQiLCJTVU1fVE9fWkVST19CSUdfRk9OVF9TSVpFIiwiU1VNX1RPX1pFUk9fU01BTExfRk9OVF9TSVpFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnN0YW50cyB1c2VkIHRocm91Z2hvdXQgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgeyBDcmVkaXRzRGF0YSB9IGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL0NyZWRpdHNOb2RlLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL0ZyYWN0aW9uLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9sRm9udC5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBBY2NvcmRpb25Cb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0FjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5cclxuY29uc3QgUEFORUxfQ09STkVSX1JBRElVUyA9IDM7XHJcblxyXG4vLyBvcHRpb25zIHNoYXJlZCBieSBhbGwgYWNjb3JkaW9uIGJveGVzXHJcbmNvbnN0IEFDQ09SRElPTl9CT1hfT1BUSU9OUzogQWNjb3JkaW9uQm94T3B0aW9ucyA9IHtcclxuICByZXNpemU6IGZhbHNlLFxyXG4gIGZpbGw6ICd3aGl0ZScsXHJcbiAgdGl0bGVBbGlnblg6ICdsZWZ0JyxcclxuICB0aXRsZVhTcGFjaW5nOiA4LFxyXG4gIGJ1dHRvblhNYXJnaW46IDEwLFxyXG4gIGJ1dHRvbllNYXJnaW46IDgsXHJcbiAgY29ybmVyUmFkaXVzOiBQQU5FTF9DT1JORVJfUkFESVVTLFxyXG4gIGV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9uczoge1xyXG4gICAgc2lkZUxlbmd0aDogMjAsXHJcbiAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxyXG4gICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMFxyXG4gIH1cclxufTtcclxuXHJcbi8vIENyZWRpdHMgYXJlIGFwcGxpZWQgdG8gdGhlIGVudGlyZSBmYW1pbHkgb2Ygc2ltczpcclxuLy8gZXF1YWxpdHktZXhwbG9yZXIsIGVxdWFsaXR5LWV4cGxvcmVyLWJhc2ljcyBhbmQgZXF1YWxpdHktZXhwbG9yZXItdHdvLXZhcmlhYmxlc1xyXG5jb25zdCBDUkVESVRTOiBDcmVkaXRzRGF0YSA9IHtcclxuICBsZWFkRGVzaWduOiAnQW1hbmRhIE1jR2FycnknLFxyXG4gIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6ICdDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLiknLFxyXG4gIHRlYW06ICdEaWFuYSBMXFx1MDBmM3BleiBUYXZhcmVzLCBBcmllbCBQYXVsLCBLYXRoeSBQZXJraW5zLCBBcmdlbnRhIFByaWNlLCBCZXRoIFN0YWRlLCBEYXZpZCBXZWJiJyxcclxuICBxdWFsaXR5QXNzdXJhbmNlOiAnU3RlZWxlIERhbHRvbiwgRXRoYW4gSm9obnNvbiwgTWVnYW4gTGFpLCBBbmRyZWEgTGluLCBFbWlseSBNaWxsZXIsIExpYW0gTXVsaGFsbCwgSmFjb2IgUm9tZXJvLCBOYW5jeSBTYWxwZXBpLCBLYXRocnluIFdvZXNzbmVyJyxcclxuICBncmFwaGljQXJ0czogJ01hcmlhaCBIZXJtc21leWVyLCBDaGVyeWwgTWNDdXRjaGFuJ1xyXG59O1xyXG5cclxuY29uc3QgRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyA9IHtcclxuXHJcbiAgQ1JFRElUUzogQ1JFRElUUyxcclxuXHJcbiAgLy8gU2NyZWVuVmlld1xyXG4gIFNDUkVFTl9WSUVXX1hfTUFSR0lOOiAyMCxcclxuICBTQ1JFRU5fVklFV19ZX01BUkdJTjogMTYsXHJcbiAgU0NSRUVOX1ZJRVdfTEFZT1VUX0JPVU5EUzogU2NyZWVuVmlldy5ERUZBVUxUX0xBWU9VVF9CT1VORFMsXHJcblxyXG4gIC8vIFdvcmthcm91bmQgZm9yIHRoaW5ncyBzaGlmdGluZyBhcm91bmQgdGhhdCBhcmVuJ3Qgc3VwcG9zZWQgdG8gbW92ZVxyXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTI4OSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy8xNzRcclxuICBTQ1JFRU5fVklFV19QUkVWRU5UX0ZJVDogdHJ1ZSxcclxuXHJcbiAgLy8gU29sdmUgSXQhIGdhbWVcclxuICBOVU1CRVJfT0ZfR0FNRV9MRVZFTFM6IDUsXHJcblxyXG4gIC8vIHRlcm1zXHJcbiAgREVGQVVMVF9DT05TVEFOVF9WQUxVRTogRnJhY3Rpb24uZnJvbUludGVnZXIoIDEgKSwgLy8gY29uc3RhbnQgdGVybXMgYXJlIGNyZWF0ZWQgd2l0aCB0aGlzIHZhbHVlIGJ5IGRlZmF1bHRcclxuICBERUZBVUxUX0NPRUZGSUNJRU5UOiBGcmFjdGlvbi5mcm9tSW50ZWdlciggMSApLCAvLyB2YXJpYWJsZSB0ZXJtcyBhcmUgY3JlYXRlZCB3aXRoIHRoaXMgY29lZmZpY2llbnQgYnkgZGVmYXVsdFxyXG4gIFNNQUxMX1RFUk1fRElBTUVURVI6IDMyLCAvLyBkaWFtZXRlciBvZiBzbWFsbCB0ZXJtcywgbGlrZSB0aG9zZSBpbiB0aGUgVGVybXNUb29sYm94Tm9kZVxyXG4gIEJJR19URVJNX0RJQU1FVEVSOiAxMDAsIC8vIGRpYW1ldGVyIG9mIGJpZyB0ZXJtcywgbGlrZSB0aG9zZSBvbiB0aGUgc2NhbGUgaW4gdGhlIE9wZXJhdGlvbnMgc2NyZWVuXHJcbiAgU0hBRE9XX09QQUNJVFk6IDAuNCwgLy8gb3BhY2l0eSBvZiB0aGUgc2hhZG93IHRoYXQgYXBwZWFycyBvbiB0ZXJtcywgMC0xICh0cmFuc3BhcmVudC1vcGFxdWUpXHJcblxyXG4gIC8vIHJhbmdlc1xyXG4gIFZBUklBQkxFX1JBTkdFOiBuZXcgUmFuZ2UoIC00MCwgNDAgKSwgLy8gcmFuZ2UgZm9yIHN5bWJvbGljIHZhcmlhYmxlcyAoeCwgeSlcclxuICBPQkpFQ1RfVkFSSUFCTEVfUkFOR0U6IG5ldyBSYW5nZSggMSwgMjAgKSwgLy8gcmFuZ2UgZm9yIG9iamVjdCB2YXJpYWJsZXMgKHNwaGVyZSwgY2F0LCBkb2csLi4uKVxyXG4gIE9QRVJBTkRfUkFOR0U6IG5ldyBSYW5nZSggLTEwLCAxMCApLFxyXG5cclxuICBBQ0NPUkRJT05fQk9YX09QVElPTlM6IEFDQ09SRElPTl9CT1hfT1BUSU9OUyxcclxuXHJcbiAgLy8gRm9udHNcclxuICBBQ0NPUkRJT05fQk9YX1RJVExFX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMTggKSxcclxuICBVTklWRVJTQUxfT1BFUkFUSU9OX1NZTUJPTF9GT05UOiBuZXcgTWF0aFN5bWJvbEZvbnQoIDI0ICksIC8vIGZvciBhbnl0aGluZyB0aGF0J3Mgbm90IGEgbnVtYmVyXHJcbiAgVU5JVkVSU0FMX09QRVJBVElPTl9JTlRFR0VSX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMjQgKSwgLy8gZm9yIGludGVnZXIgbnVtYmVyc1xyXG4gIFVOSVZFUlNBTF9PUEVSQVRJT05fRlJBQ1RJT05fRk9OVDogbmV3IFBoZXRGb250KCAxMiApLCAvLyBmb3IgZnJhY3Rpb24gbnVtZXJhdG9yIGFuZCBkZW5vbWluYXRvclxyXG4gIFNVTV9UT19aRVJPX0JJR19GT05UX1NJWkU6IDQwLCAvLyBmb3Igc3VtLXRvLXplcm8gYW5pbWF0aW9uIHRoYXQgaW52b2x2ZXMgYSAnYmlnJyB0ZXJtIG9uIHRoZSBzY2FsZVxyXG4gIFNVTV9UT19aRVJPX1NNQUxMX0ZPTlRfU0laRTogMjQsIC8vIGZvciBzdW0tdG8temVybyBhbmltYXRpb24gdGhhdCBpbnZvbHZlcyBhICdzbWFsbCcgdGVybSBvbiB0aGUgc2NhbGVcclxuXHJcbiAgLy8gUGFuZWxzXHJcbiAgUEFORUxfQ09STkVSX1JBRElVUzogUEFORUxfQ09STkVSX1JBRElVU1xyXG59O1xyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ0VxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMnLCBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sMEJBQTBCO0FBRTVDLE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0MsUUFBUSxNQUFNLDBDQUEwQztBQUMvRCxPQUFPQyxjQUFjLE1BQU0sNENBQTRDO0FBQ3ZFLE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFFM0QsT0FBT0MsZ0JBQWdCLE1BQU0sd0JBQXdCO0FBRXJELE1BQU1DLG1CQUFtQixHQUFHLENBQUM7O0FBRTdCO0FBQ0EsTUFBTUMscUJBQTBDLEdBQUc7RUFDakRDLE1BQU0sRUFBRSxLQUFLO0VBQ2JDLElBQUksRUFBRSxPQUFPO0VBQ2JDLFdBQVcsRUFBRSxNQUFNO0VBQ25CQyxhQUFhLEVBQUUsQ0FBQztFQUNoQkMsYUFBYSxFQUFFLEVBQUU7RUFDakJDLGFBQWEsRUFBRSxDQUFDO0VBQ2hCQyxZQUFZLEVBQUVSLG1CQUFtQjtFQUNqQ1MsMkJBQTJCLEVBQUU7SUFDM0JDLFVBQVUsRUFBRSxFQUFFO0lBQ2RDLGtCQUFrQixFQUFFLEVBQUU7SUFDdEJDLGtCQUFrQixFQUFFO0VBQ3RCO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0EsTUFBTUMsT0FBb0IsR0FBRztFQUMzQkMsVUFBVSxFQUFFLGdCQUFnQjtFQUM1QkMsbUJBQW1CLEVBQUUsZ0NBQWdDO0VBQ3JEQyxJQUFJLEVBQUUsNEZBQTRGO0VBQ2xHQyxnQkFBZ0IsRUFBRSxnSUFBZ0k7RUFDbEpDLFdBQVcsRUFBRTtBQUNmLENBQUM7QUFFRCxNQUFNQyx5QkFBeUIsR0FBRztFQUVoQ04sT0FBTyxFQUFFQSxPQUFPO0VBRWhCO0VBQ0FPLG9CQUFvQixFQUFFLEVBQUU7RUFDeEJDLG9CQUFvQixFQUFFLEVBQUU7RUFDeEJDLHlCQUF5QixFQUFFM0IsVUFBVSxDQUFDNEIscUJBQXFCO0VBRTNEO0VBQ0E7RUFDQUMsdUJBQXVCLEVBQUUsSUFBSTtFQUU3QjtFQUNBQyxxQkFBcUIsRUFBRSxDQUFDO0VBRXhCO0VBQ0FDLHNCQUFzQixFQUFFOUIsUUFBUSxDQUFDK0IsV0FBVyxDQUFFLENBQUUsQ0FBQztFQUFFO0VBQ25EQyxtQkFBbUIsRUFBRWhDLFFBQVEsQ0FBQytCLFdBQVcsQ0FBRSxDQUFFLENBQUM7RUFBRTtFQUNoREUsbUJBQW1CLEVBQUUsRUFBRTtFQUFFO0VBQ3pCQyxpQkFBaUIsRUFBRSxHQUFHO0VBQUU7RUFDeEJDLGNBQWMsRUFBRSxHQUFHO0VBQUU7O0VBRXJCO0VBQ0FDLGNBQWMsRUFBRSxJQUFJdEMsS0FBSyxDQUFFLENBQUMsRUFBRSxFQUFFLEVBQUcsQ0FBQztFQUFFO0VBQ3RDdUMscUJBQXFCLEVBQUUsSUFBSXZDLEtBQUssQ0FBRSxDQUFDLEVBQUUsRUFBRyxDQUFDO0VBQUU7RUFDM0N3QyxhQUFhLEVBQUUsSUFBSXhDLEtBQUssQ0FBRSxDQUFDLEVBQUUsRUFBRSxFQUFHLENBQUM7RUFFbkNPLHFCQUFxQixFQUFFQSxxQkFBcUI7RUFFNUM7RUFDQWtDLHdCQUF3QixFQUFFLElBQUlyQyxRQUFRLENBQUUsRUFBRyxDQUFDO0VBQzVDc0MsK0JBQStCLEVBQUUsSUFBSXZDLGNBQWMsQ0FBRSxFQUFHLENBQUM7RUFBRTtFQUMzRHdDLGdDQUFnQyxFQUFFLElBQUl2QyxRQUFRLENBQUUsRUFBRyxDQUFDO0VBQUU7RUFDdER3QyxpQ0FBaUMsRUFBRSxJQUFJeEMsUUFBUSxDQUFFLEVBQUcsQ0FBQztFQUFFO0VBQ3ZEeUMseUJBQXlCLEVBQUUsRUFBRTtFQUFFO0VBQy9CQywyQkFBMkIsRUFBRSxFQUFFO0VBQUU7O0VBRWpDO0VBQ0F4QyxtQkFBbUIsRUFBRUE7QUFDdkIsQ0FBQztBQUVERCxnQkFBZ0IsQ0FBQzBDLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRXRCLHlCQUEwQixDQUFDO0FBRW5GLGVBQWVBLHlCQUF5QiJ9