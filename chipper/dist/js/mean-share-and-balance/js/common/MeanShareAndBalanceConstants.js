// Copyright 2022, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import meanShareAndBalance from '../meanShareAndBalance.js';
import Range from '../../../dot/js/Range.js';
import MeanShareAndBalanceColors from './MeanShareAndBalanceColors.js';
import { LinearGradient } from '../../../scenery/js/imports.js';
const DEFAULT_MARGIN = 15;
const MeanShareAndBalanceConstants = {
  NUMBER_SPINNER_RANGE: new Range(1, 7),
  SCREEN_VIEW_X_MARGIN: DEFAULT_MARGIN,
  SCREEN_VIEW_Y_MARGIN: DEFAULT_MARGIN,
  INITIAL_NUMBER_OF_CUPS: 2,
  INITIAL_NUMBER_OF_PEOPLE: 1,
  MAXIMUM_NUMBER_OF_DATA_SETS: 7,
  CUP_WIDTH: 60,
  CUP_HEIGHT: 120,
  WATER_LEVEL_RANGE_MIN: 0,
  WATER_LEVEL_RANGE_MAX: 1,
  WATER_LEVEL_RANGE: new Range(0, 1),
  WATER_LEVEL_DEFAULT: 0.5,
  VALVE_RADIUS: 10,
  PIPE_WIDTH: 4,
  PIPE_GRADIENT: new LinearGradient(0, 0, 0, 4).addColorStop(0, MeanShareAndBalanceColors.pipeGradientLightColorProperty).addColorStop(1, MeanShareAndBalanceColors.pipeGradientDarkColorProperty),
  PIPE_LENGTH: 40,
  CONTROLS_VERTICAL_MARGIN: 30,
  CONTROLS_HORIZONTAL_MARGIN: 15,
  CUPS_3D_CENTER_Y: 625,
  CUPS_2D_CENTER_Y: 290,
  MOUSE_AREA_DILATION: 5,
  TOUCH_AREA_DILATION: 10,
  MAX_CONTROLS_TEXT_WIDTH: 175,
  CHOCOLATE_WIDTH: 45,
  CHOCOLATE_HEIGHT: 12,
  PERSON_WIDTH: 105,
  PLATE_CHOCOLATE_CENTER_Y: 310,
  PEOPLE_CENTER_Y: 500,
  MAX_NUMBER_OF_CHOCOLATES_PER_PERSON: 10,
  MIN_NUMBER_OF_CHOCOLATES: 0,
  NOTEBOOK_PAPER_CENTER_Y: 220
};
meanShareAndBalance.register('MeanShareAndBalanceConstants', MeanShareAndBalanceConstants);
export default MeanShareAndBalanceConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZWFuU2hhcmVBbmRCYWxhbmNlIiwiUmFuZ2UiLCJNZWFuU2hhcmVBbmRCYWxhbmNlQ29sb3JzIiwiTGluZWFyR3JhZGllbnQiLCJERUZBVUxUX01BUkdJTiIsIk1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMiLCJOVU1CRVJfU1BJTk5FUl9SQU5HRSIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJJTklUSUFMX05VTUJFUl9PRl9DVVBTIiwiSU5JVElBTF9OVU1CRVJfT0ZfUEVPUExFIiwiTUFYSU1VTV9OVU1CRVJfT0ZfREFUQV9TRVRTIiwiQ1VQX1dJRFRIIiwiQ1VQX0hFSUdIVCIsIldBVEVSX0xFVkVMX1JBTkdFX01JTiIsIldBVEVSX0xFVkVMX1JBTkdFX01BWCIsIldBVEVSX0xFVkVMX1JBTkdFIiwiV0FURVJfTEVWRUxfREVGQVVMVCIsIlZBTFZFX1JBRElVUyIsIlBJUEVfV0lEVEgiLCJQSVBFX0dSQURJRU5UIiwiYWRkQ29sb3JTdG9wIiwicGlwZUdyYWRpZW50TGlnaHRDb2xvclByb3BlcnR5IiwicGlwZUdyYWRpZW50RGFya0NvbG9yUHJvcGVydHkiLCJQSVBFX0xFTkdUSCIsIkNPTlRST0xTX1ZFUlRJQ0FMX01BUkdJTiIsIkNPTlRST0xTX0hPUklaT05UQUxfTUFSR0lOIiwiQ1VQU18zRF9DRU5URVJfWSIsIkNVUFNfMkRfQ0VOVEVSX1kiLCJNT1VTRV9BUkVBX0RJTEFUSU9OIiwiVE9VQ0hfQVJFQV9ESUxBVElPTiIsIk1BWF9DT05UUk9MU19URVhUX1dJRFRIIiwiQ0hPQ09MQVRFX1dJRFRIIiwiQ0hPQ09MQVRFX0hFSUdIVCIsIlBFUlNPTl9XSURUSCIsIlBMQVRFX0NIT0NPTEFURV9DRU5URVJfWSIsIlBFT1BMRV9DRU5URVJfWSIsIk1BWF9OVU1CRVJfT0ZfQ0hPQ09MQVRFU19QRVJfUEVSU09OIiwiTUlOX05VTUJFUl9PRl9DSE9DT0xBVEVTIiwiTk9URUJPT0tfUEFQRVJfQ0VOVEVSX1kiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnN0YW50cyB1c2VkIHRocm91Z2hvdXQgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgbWVhblNoYXJlQW5kQmFsYW5jZSBmcm9tICcuLi9tZWFuU2hhcmVBbmRCYWxhbmNlLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29sb3JzIGZyb20gJy4vTWVhblNoYXJlQW5kQmFsYW5jZUNvbG9ycy5qcyc7XHJcbmltcG9ydCB7IExpbmVhckdyYWRpZW50IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuXHJcbmNvbnN0IERFRkFVTFRfTUFSR0lOID0gMTU7XHJcblxyXG5jb25zdCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzID0ge1xyXG5cclxuICBOVU1CRVJfU1BJTk5FUl9SQU5HRTogbmV3IFJhbmdlKCAxLCA3ICksXHJcbiAgU0NSRUVOX1ZJRVdfWF9NQVJHSU46IERFRkFVTFRfTUFSR0lOLFxyXG4gIFNDUkVFTl9WSUVXX1lfTUFSR0lOOiBERUZBVUxUX01BUkdJTixcclxuICBJTklUSUFMX05VTUJFUl9PRl9DVVBTOiAyLFxyXG4gIElOSVRJQUxfTlVNQkVSX09GX1BFT1BMRTogMSxcclxuICBNQVhJTVVNX05VTUJFUl9PRl9EQVRBX1NFVFM6IDcsXHJcbiAgQ1VQX1dJRFRIOiA2MCxcclxuICBDVVBfSEVJR0hUOiAxMjAsXHJcblxyXG4gIFdBVEVSX0xFVkVMX1JBTkdFX01JTjogMCxcclxuICBXQVRFUl9MRVZFTF9SQU5HRV9NQVg6IDEsXHJcbiAgV0FURVJfTEVWRUxfUkFOR0U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gIFdBVEVSX0xFVkVMX0RFRkFVTFQ6IDAuNSxcclxuXHJcbiAgVkFMVkVfUkFESVVTOiAxMCxcclxuICBQSVBFX1dJRFRIOiA0LFxyXG4gIFBJUEVfR1JBRElFTlQ6IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgMCwgNCApXHJcbiAgICAuYWRkQ29sb3JTdG9wKCAwLCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29sb3JzLnBpcGVHcmFkaWVudExpZ2h0Q29sb3JQcm9wZXJ0eSApXHJcbiAgICAuYWRkQ29sb3JTdG9wKCAxLCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29sb3JzLnBpcGVHcmFkaWVudERhcmtDb2xvclByb3BlcnR5ICksXHJcbiAgUElQRV9MRU5HVEg6IDQwLFxyXG4gIENPTlRST0xTX1ZFUlRJQ0FMX01BUkdJTjogMzAsXHJcbiAgQ09OVFJPTFNfSE9SSVpPTlRBTF9NQVJHSU46IDE1LFxyXG5cclxuICBDVVBTXzNEX0NFTlRFUl9ZOiA2MjUsXHJcbiAgQ1VQU18yRF9DRU5URVJfWTogMjkwLFxyXG5cclxuICBNT1VTRV9BUkVBX0RJTEFUSU9OOiA1LFxyXG4gIFRPVUNIX0FSRUFfRElMQVRJT046IDEwLFxyXG5cclxuICBNQVhfQ09OVFJPTFNfVEVYVF9XSURUSDogMTc1LFxyXG5cclxuICBDSE9DT0xBVEVfV0lEVEg6IDQ1LFxyXG4gIENIT0NPTEFURV9IRUlHSFQ6IDEyLFxyXG4gIFBFUlNPTl9XSURUSDogMTA1LFxyXG5cclxuICBQTEFURV9DSE9DT0xBVEVfQ0VOVEVSX1k6IDMxMCxcclxuICBQRU9QTEVfQ0VOVEVSX1k6IDUwMCxcclxuXHJcbiAgTUFYX05VTUJFUl9PRl9DSE9DT0xBVEVTX1BFUl9QRVJTT046IDEwLFxyXG4gIE1JTl9OVU1CRVJfT0ZfQ0hPQ09MQVRFUzogMCxcclxuICBOT1RFQk9PS19QQVBFUl9DRU5URVJfWTogMjIwXHJcblxyXG59O1xyXG5cclxubWVhblNoYXJlQW5kQmFsYW5jZS5yZWdpc3RlciggJ01lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMnLCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsbUJBQW1CLE1BQU0sMkJBQTJCO0FBQzNELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MseUJBQXlCLE1BQU0sZ0NBQWdDO0FBQ3RFLFNBQVNDLGNBQWMsUUFBUSxnQ0FBZ0M7QUFFL0QsTUFBTUMsY0FBYyxHQUFHLEVBQUU7QUFFekIsTUFBTUMsNEJBQTRCLEdBQUc7RUFFbkNDLG9CQUFvQixFQUFFLElBQUlMLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQ3ZDTSxvQkFBb0IsRUFBRUgsY0FBYztFQUNwQ0ksb0JBQW9CLEVBQUVKLGNBQWM7RUFDcENLLHNCQUFzQixFQUFFLENBQUM7RUFDekJDLHdCQUF3QixFQUFFLENBQUM7RUFDM0JDLDJCQUEyQixFQUFFLENBQUM7RUFDOUJDLFNBQVMsRUFBRSxFQUFFO0VBQ2JDLFVBQVUsRUFBRSxHQUFHO0VBRWZDLHFCQUFxQixFQUFFLENBQUM7RUFDeEJDLHFCQUFxQixFQUFFLENBQUM7RUFDeEJDLGlCQUFpQixFQUFFLElBQUlmLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQ3BDZ0IsbUJBQW1CLEVBQUUsR0FBRztFQUV4QkMsWUFBWSxFQUFFLEVBQUU7RUFDaEJDLFVBQVUsRUFBRSxDQUFDO0VBQ2JDLGFBQWEsRUFBRSxJQUFJakIsY0FBYyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUM1Q2tCLFlBQVksQ0FBRSxDQUFDLEVBQUVuQix5QkFBeUIsQ0FBQ29CLDhCQUErQixDQUFDLENBQzNFRCxZQUFZLENBQUUsQ0FBQyxFQUFFbkIseUJBQXlCLENBQUNxQiw2QkFBOEIsQ0FBQztFQUM3RUMsV0FBVyxFQUFFLEVBQUU7RUFDZkMsd0JBQXdCLEVBQUUsRUFBRTtFQUM1QkMsMEJBQTBCLEVBQUUsRUFBRTtFQUU5QkMsZ0JBQWdCLEVBQUUsR0FBRztFQUNyQkMsZ0JBQWdCLEVBQUUsR0FBRztFQUVyQkMsbUJBQW1CLEVBQUUsQ0FBQztFQUN0QkMsbUJBQW1CLEVBQUUsRUFBRTtFQUV2QkMsdUJBQXVCLEVBQUUsR0FBRztFQUU1QkMsZUFBZSxFQUFFLEVBQUU7RUFDbkJDLGdCQUFnQixFQUFFLEVBQUU7RUFDcEJDLFlBQVksRUFBRSxHQUFHO0VBRWpCQyx3QkFBd0IsRUFBRSxHQUFHO0VBQzdCQyxlQUFlLEVBQUUsR0FBRztFQUVwQkMsbUNBQW1DLEVBQUUsRUFBRTtFQUN2Q0Msd0JBQXdCLEVBQUUsQ0FBQztFQUMzQkMsdUJBQXVCLEVBQUU7QUFFM0IsQ0FBQztBQUVEdkMsbUJBQW1CLENBQUN3QyxRQUFRLENBQUUsOEJBQThCLEVBQUVuQyw0QkFBNkIsQ0FBQztBQUM1RixlQUFlQSw0QkFBNEIifQ==