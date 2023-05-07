// Copyright 2014-2022, University of Colorado Boulder

/**
 * Constants that are shared between the various portions of the Area Builder simulation.
 *
 * @author John Blanco
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import areaBuilder from '../areaBuilder.js';
import AreaBuilderStrings from '../AreaBuilderStrings.js';
const invalidValueString = AreaBuilderStrings.invalidValue;
const AreaBuilderSharedConstants = {
  // layout bounds used throughout the simulation for laying out the screens
  LAYOUT_BOUNDS: new Bounds2(0, 0, 768, 464),
  // colors used for the various shapes
  GREENISH_COLOR: '#33E16E',
  DARK_GREEN_COLOR: '#1A7137',
  PURPLISH_COLOR: '#9D87C9',
  DARK_PURPLE_COLOR: '#634F8C',
  ORANGISH_COLOR: '#FFA64D',
  ORANGE_BROWN_COLOR: '#A95327',
  PALE_BLUE_COLOR: '#5DB9E7',
  DARK_BLUE_COLOR: '#277DA9',
  PINKISH_COLOR: '#E88DC9',
  PURPLE_PINK_COLOR: '#AA548D',
  PERIMETER_DARKEN_FACTOR: 0.6,
  // The amount that the perimeter colors are darkened from the main shape color

  // velocity at which animated elements move
  ANIMATION_SPEED: 200,
  // In screen coordinates per second

  // various other constants
  BACKGROUND_COLOR: 'rgb( 225, 255, 255 )',
  CONTROL_PANEL_BACKGROUND_COLOR: 'rgb( 254, 241, 233 )',
  RESET_BUTTON_RADIUS: 22,
  CONTROLS_INSET: 15,
  UNIT_SQUARE_LENGTH: 32,
  // In screen coordinates, used in several places

  // string used to indicate an invalid value for area and perimeter
  INVALID_VALUE: invalidValueString
};
areaBuilder.register('AreaBuilderSharedConstants', AreaBuilderSharedConstants);
export default AreaBuilderSharedConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiYXJlYUJ1aWxkZXIiLCJBcmVhQnVpbGRlclN0cmluZ3MiLCJpbnZhbGlkVmFsdWVTdHJpbmciLCJpbnZhbGlkVmFsdWUiLCJBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyIsIkxBWU9VVF9CT1VORFMiLCJHUkVFTklTSF9DT0xPUiIsIkRBUktfR1JFRU5fQ09MT1IiLCJQVVJQTElTSF9DT0xPUiIsIkRBUktfUFVSUExFX0NPTE9SIiwiT1JBTkdJU0hfQ09MT1IiLCJPUkFOR0VfQlJPV05fQ09MT1IiLCJQQUxFX0JMVUVfQ09MT1IiLCJEQVJLX0JMVUVfQ09MT1IiLCJQSU5LSVNIX0NPTE9SIiwiUFVSUExFX1BJTktfQ09MT1IiLCJQRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiIsIkFOSU1BVElPTl9TUEVFRCIsIkJBQ0tHUk9VTkRfQ09MT1IiLCJDT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IiLCJSRVNFVF9CVVRUT05fUkFESVVTIiwiQ09OVFJPTFNfSU5TRVQiLCJVTklUX1NRVUFSRV9MRU5HVEgiLCJJTlZBTElEX1ZBTFVFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb25zdGFudHMgdGhhdCBhcmUgc2hhcmVkIGJldHdlZW4gdGhlIHZhcmlvdXMgcG9ydGlvbnMgb2YgdGhlIEFyZWEgQnVpbGRlciBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vYXJlYUJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJTdHJpbmdzIGZyb20gJy4uL0FyZWFCdWlsZGVyU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBpbnZhbGlkVmFsdWVTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MuaW52YWxpZFZhbHVlO1xyXG5cclxuY29uc3QgQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMgPSB7XHJcblxyXG4gIC8vIGxheW91dCBib3VuZHMgdXNlZCB0aHJvdWdob3V0IHRoZSBzaW11bGF0aW9uIGZvciBsYXlpbmcgb3V0IHRoZSBzY3JlZW5zXHJcbiAgTEFZT1VUX0JPVU5EUzogbmV3IEJvdW5kczIoIDAsIDAsIDc2OCwgNDY0ICksXHJcblxyXG4gIC8vIGNvbG9ycyB1c2VkIGZvciB0aGUgdmFyaW91cyBzaGFwZXNcclxuICBHUkVFTklTSF9DT0xPUjogJyMzM0UxNkUnLFxyXG4gIERBUktfR1JFRU5fQ09MT1I6ICcjMUE3MTM3JyxcclxuICBQVVJQTElTSF9DT0xPUjogJyM5RDg3QzknLFxyXG4gIERBUktfUFVSUExFX0NPTE9SOiAnIzYzNEY4QycsXHJcbiAgT1JBTkdJU0hfQ09MT1I6ICcjRkZBNjREJyxcclxuICBPUkFOR0VfQlJPV05fQ09MT1I6ICcjQTk1MzI3JyxcclxuICBQQUxFX0JMVUVfQ09MT1I6ICcjNURCOUU3JyxcclxuICBEQVJLX0JMVUVfQ09MT1I6ICcjMjc3REE5JyxcclxuICBQSU5LSVNIX0NPTE9SOiAnI0U4OERDOScsXHJcbiAgUFVSUExFX1BJTktfQ09MT1I6ICcjQUE1NDhEJyxcclxuICBQRVJJTUVURVJfREFSS0VOX0ZBQ1RPUjogMC42LCAvLyBUaGUgYW1vdW50IHRoYXQgdGhlIHBlcmltZXRlciBjb2xvcnMgYXJlIGRhcmtlbmVkIGZyb20gdGhlIG1haW4gc2hhcGUgY29sb3JcclxuXHJcbiAgLy8gdmVsb2NpdHkgYXQgd2hpY2ggYW5pbWF0ZWQgZWxlbWVudHMgbW92ZVxyXG4gIEFOSU1BVElPTl9TUEVFRDogMjAwLCAvLyBJbiBzY3JlZW4gY29vcmRpbmF0ZXMgcGVyIHNlY29uZFxyXG5cclxuICAvLyB2YXJpb3VzIG90aGVyIGNvbnN0YW50c1xyXG4gIEJBQ0tHUk9VTkRfQ09MT1I6ICdyZ2IoIDIyNSwgMjU1LCAyNTUgKScsXHJcbiAgQ09OVFJPTF9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SOiAncmdiKCAyNTQsIDI0MSwgMjMzICknLFxyXG4gIFJFU0VUX0JVVFRPTl9SQURJVVM6IDIyLFxyXG4gIENPTlRST0xTX0lOU0VUOiAxNSxcclxuXHJcbiAgVU5JVF9TUVVBUkVfTEVOR1RIOiAzMiwgLy8gSW4gc2NyZWVuIGNvb3JkaW5hdGVzLCB1c2VkIGluIHNldmVyYWwgcGxhY2VzXHJcblxyXG4gIC8vIHN0cmluZyB1c2VkIHRvIGluZGljYXRlIGFuIGludmFsaWQgdmFsdWUgZm9yIGFyZWEgYW5kIHBlcmltZXRlclxyXG4gIElOVkFMSURfVkFMVUU6IGludmFsaWRWYWx1ZVN0cmluZ1xyXG59O1xyXG5cclxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cycsIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzICk7XHJcbmV4cG9ydCBkZWZhdWx0IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFDM0MsT0FBT0Msa0JBQWtCLE1BQU0sMEJBQTBCO0FBRXpELE1BQU1DLGtCQUFrQixHQUFHRCxrQkFBa0IsQ0FBQ0UsWUFBWTtBQUUxRCxNQUFNQywwQkFBMEIsR0FBRztFQUVqQztFQUNBQyxhQUFhLEVBQUUsSUFBSU4sT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUU1QztFQUNBTyxjQUFjLEVBQUUsU0FBUztFQUN6QkMsZ0JBQWdCLEVBQUUsU0FBUztFQUMzQkMsY0FBYyxFQUFFLFNBQVM7RUFDekJDLGlCQUFpQixFQUFFLFNBQVM7RUFDNUJDLGNBQWMsRUFBRSxTQUFTO0VBQ3pCQyxrQkFBa0IsRUFBRSxTQUFTO0VBQzdCQyxlQUFlLEVBQUUsU0FBUztFQUMxQkMsZUFBZSxFQUFFLFNBQVM7RUFDMUJDLGFBQWEsRUFBRSxTQUFTO0VBQ3hCQyxpQkFBaUIsRUFBRSxTQUFTO0VBQzVCQyx1QkFBdUIsRUFBRSxHQUFHO0VBQUU7O0VBRTlCO0VBQ0FDLGVBQWUsRUFBRSxHQUFHO0VBQUU7O0VBRXRCO0VBQ0FDLGdCQUFnQixFQUFFLHNCQUFzQjtFQUN4Q0MsOEJBQThCLEVBQUUsc0JBQXNCO0VBQ3REQyxtQkFBbUIsRUFBRSxFQUFFO0VBQ3ZCQyxjQUFjLEVBQUUsRUFBRTtFQUVsQkMsa0JBQWtCLEVBQUUsRUFBRTtFQUFFOztFQUV4QjtFQUNBQyxhQUFhLEVBQUVyQjtBQUNqQixDQUFDO0FBRURGLFdBQVcsQ0FBQ3dCLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRXBCLDBCQUEyQixDQUFDO0FBQ2hGLGVBQWVBLDBCQUEwQiJ9