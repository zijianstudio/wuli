// Copyright 2014-2021, University of Colorado Boulder

/**
 * Constants used in multiple locations within the 'Arithmetic' simulation.
 *
 * @author Andrey Zelenkov (MLearner)
 */

import Screen from '../../../joist/js/Screen.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import arithmetic from '../arithmetic.js';
const ArithmeticConstants = {
  BACKGROUND_COLOR: 'rgb( 173, 202, 255 )',
  CURSOR_BLINK_INTERVAL: 500,
  // duration of animation in milliseconds
  EQUATION_FONT_TEXT: new PhetFont({
    size: 32
  }),
  ICON_BACKGROUND_COLOR: 'rgb( 173, 202, 255 )',
  INPUT_LENGTH_MAX: 3,
  // max input length
  SCREEN_ICON_SIZE: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE,
  // size of screen icons
  NUM_STARS: 5,
  // number of stars in select level buttons
  WORKSPACE_BACKGROUND_COLOR: 'rgb(130,181,252)'
};
arithmetic.register('ArithmeticConstants', ArithmeticConstants);
export default ArithmeticConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJQaGV0Rm9udCIsImFyaXRobWV0aWMiLCJBcml0aG1ldGljQ29uc3RhbnRzIiwiQkFDS0dST1VORF9DT0xPUiIsIkNVUlNPUl9CTElOS19JTlRFUlZBTCIsIkVRVUFUSU9OX0ZPTlRfVEVYVCIsInNpemUiLCJJQ09OX0JBQ0tHUk9VTkRfQ09MT1IiLCJJTlBVVF9MRU5HVEhfTUFYIiwiU0NSRUVOX0lDT05fU0laRSIsIk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFIiwiTlVNX1NUQVJTIiwiV09SS1NQQUNFX0JBQ0tHUk9VTkRfQ09MT1IiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyaXRobWV0aWNDb25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29uc3RhbnRzIHVzZWQgaW4gbXVsdGlwbGUgbG9jYXRpb25zIHdpdGhpbiB0aGUgJ0FyaXRobWV0aWMnIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNTGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgYXJpdGhtZXRpYyBmcm9tICcuLi9hcml0aG1ldGljLmpzJztcclxuXHJcbmNvbnN0IEFyaXRobWV0aWNDb25zdGFudHMgPSB7XHJcbiAgQkFDS0dST1VORF9DT0xPUjogJ3JnYiggMTczLCAyMDIsIDI1NSApJyxcclxuICBDVVJTT1JfQkxJTktfSU5URVJWQUw6IDUwMCwgLy8gZHVyYXRpb24gb2YgYW5pbWF0aW9uIGluIG1pbGxpc2Vjb25kc1xyXG4gIEVRVUFUSU9OX0ZPTlRfVEVYVDogbmV3IFBoZXRGb250KCB7IHNpemU6IDMyIH0gKSxcclxuICBJQ09OX0JBQ0tHUk9VTkRfQ09MT1I6ICdyZ2IoIDE3MywgMjAyLCAyNTUgKScsXHJcbiAgSU5QVVRfTEVOR1RIX01BWDogMywgLy8gbWF4IGlucHV0IGxlbmd0aFxyXG4gIFNDUkVFTl9JQ09OX1NJWkU6IFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRSwgLy8gc2l6ZSBvZiBzY3JlZW4gaWNvbnNcclxuICBOVU1fU1RBUlM6IDUsIC8vIG51bWJlciBvZiBzdGFycyBpbiBzZWxlY3QgbGV2ZWwgYnV0dG9uc1xyXG4gIFdPUktTUEFDRV9CQUNLR1JPVU5EX0NPTE9SOiAncmdiKDEzMCwxODEsMjUyKSdcclxufTtcclxuXHJcbmFyaXRobWV0aWMucmVnaXN0ZXIoICdBcml0aG1ldGljQ29uc3RhbnRzJywgQXJpdGhtZXRpY0NvbnN0YW50cyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJpdGhtZXRpY0NvbnN0YW50czsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDZCQUE2QjtBQUNoRCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLFVBQVUsTUFBTSxrQkFBa0I7QUFFekMsTUFBTUMsbUJBQW1CLEdBQUc7RUFDMUJDLGdCQUFnQixFQUFFLHNCQUFzQjtFQUN4Q0MscUJBQXFCLEVBQUUsR0FBRztFQUFFO0VBQzVCQyxrQkFBa0IsRUFBRSxJQUFJTCxRQUFRLENBQUU7SUFBRU0sSUFBSSxFQUFFO0VBQUcsQ0FBRSxDQUFDO0VBQ2hEQyxxQkFBcUIsRUFBRSxzQkFBc0I7RUFDN0NDLGdCQUFnQixFQUFFLENBQUM7RUFBRTtFQUNyQkMsZ0JBQWdCLEVBQUVWLE1BQU0sQ0FBQ1csNkJBQTZCO0VBQUU7RUFDeERDLFNBQVMsRUFBRSxDQUFDO0VBQUU7RUFDZEMsMEJBQTBCLEVBQUU7QUFDOUIsQ0FBQztBQUVEWCxVQUFVLENBQUNZLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRVgsbUJBQW9CLENBQUM7QUFFakUsZUFBZUEsbUJBQW1CIn0=