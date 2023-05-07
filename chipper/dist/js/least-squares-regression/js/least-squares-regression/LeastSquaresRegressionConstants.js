// Copyright 2014-2020, University of Colorado Boulder

/**
 * Constants that are used in the Least Squares Regression simulation.
 *
 * @author Martin Veillette (Berea College)
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import leastSquaresRegression from '../leastSquaresRegression.js';
const LeastSquaresRegressionConstants = {
  // speed for dataPoints to reach the bucket when animated
  ANIMATION_SPEED: 0.001,
  //  in model units per millisecond;

  // Background color for sim and graph
  BACKGROUND_COLOR: 'rgb( 236, 255, 245 )',
  GRAPH_BACKGROUND_COLOR: 'rgb( 255, 255, 255 )',
  // LineWidth of 'Best Fit Line' and 'MyLine'
  LINE_WIDTH: 2,
  // LineWidth for the Residual line of 'Best Fit Line' and 'MyLine'
  RESIDUAL_LINE_WIDTH: 2,
  // 'MyLine' color
  MY_LINE_COLOR: {
    BASE_COLOR: 'rgb( 0, 0, 255)',
    RESIDUAL_COLOR: 'rgb( 110, 92, 231 )',
    SQUARED_RESIDUAL_COLOR: 'rgba( 154, 150, 255, 0.4 )',
    SUM_OF_SQUARES_COLOR: 'rgb( 154, 150, 255 )'
  },
  // 'Best Fit Line' Color
  BEST_FIT_LINE_COLOR: {
    BASE_COLOR: 'rgb( 255, 0, 0 )',
    RESIDUAL_COLOR: 'rgb( 178, 21, 27 )',
    SQUARED_RESIDUAL_COLOR: 'rgba( 255, 52, 59, 0.4 )',
    SUM_OF_SQUARES_COLOR: 'rgb( 255, 52, 59 )'
  },
  // Movable data points (and points in bucket)
  DYNAMIC_DATA_POINT_RADIUS: 7,
  DYNAMIC_DATA_POINT_FILL: 'orange',
  DYNAMIC_DATA_POINT_STROKE: 'black',
  DYNAMIC_DATA_POINT_LINE_WIDTH: 1,
  // Static data points
  STATIC_DATA_POINT_RADIUS: 5,
  STATIC_DATA_POINT_FILL: 'orange',
  STATIC_DATA_POINT_STROKE: 'white',
  STATIC_DATA_POINT_LINE_WIDTH: 1,
  // Gridlines and grid icon
  MAJOR_GRID_STROKE_COLOR: 'rgb( 128, 128, 128 )',
  MINOR_GRID_STROKE_COLOR: 'rgb( 218, 218, 218)',
  // Font sizes and weight
  TEXT_FONT: new PhetFont({
    size: 16
  }),
  // default font for text
  TEXT_BOLD_FONT: new PhetFont({
    size: 16,
    weight: 'bold'
  }),
  // default font for bold font
  PEARSON_COEFFICIENT_TEXT_FONT: new PhetFont({
    size: 22,
    weight: 'bold'
  }),
  CHECKBOX_TEXT_FONT: new PhetFont({
    size: 14
  }),
  MAJOR_TICK_FONT: new PhetFont({
    size: 14
  }),
  SUM_RESIDUALS_FONT: new PhetFont({
    size: 14
  }),
  REFERENCE_FONT: new PhetFont({
    size: 16
  }),
  SOURCE_FONT: new PhetFont({
    size: 14
  }),
  // Panels
  CONTROL_PANEL_CORNER_RADIUS: 10,
  SMALL_PANEL_CORNER_RADIUS: 5,
  CONTROL_PANEL_BACKGROUND_COLOR: 'rgb( 255, 245, 238 )',
  // seashell
  SMALL_PANEL_STROKE: 'rgb(204,204,204)',
  // gray

  // Combo box
  ITEM_HIGHLIGHT_FILL: 'rgb( 236, 255, 245 )'
};
leastSquaresRegression.register('LeastSquaresRegressionConstants', LeastSquaresRegressionConstants);
export default LeastSquaresRegressionConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsImxlYXN0U3F1YXJlc1JlZ3Jlc3Npb24iLCJMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzIiwiQU5JTUFUSU9OX1NQRUVEIiwiQkFDS0dST1VORF9DT0xPUiIsIkdSQVBIX0JBQ0tHUk9VTkRfQ09MT1IiLCJMSU5FX1dJRFRIIiwiUkVTSURVQUxfTElORV9XSURUSCIsIk1ZX0xJTkVfQ09MT1IiLCJCQVNFX0NPTE9SIiwiUkVTSURVQUxfQ09MT1IiLCJTUVVBUkVEX1JFU0lEVUFMX0NPTE9SIiwiU1VNX09GX1NRVUFSRVNfQ09MT1IiLCJCRVNUX0ZJVF9MSU5FX0NPTE9SIiwiRFlOQU1JQ19EQVRBX1BPSU5UX1JBRElVUyIsIkRZTkFNSUNfREFUQV9QT0lOVF9GSUxMIiwiRFlOQU1JQ19EQVRBX1BPSU5UX1NUUk9LRSIsIkRZTkFNSUNfREFUQV9QT0lOVF9MSU5FX1dJRFRIIiwiU1RBVElDX0RBVEFfUE9JTlRfUkFESVVTIiwiU1RBVElDX0RBVEFfUE9JTlRfRklMTCIsIlNUQVRJQ19EQVRBX1BPSU5UX1NUUk9LRSIsIlNUQVRJQ19EQVRBX1BPSU5UX0xJTkVfV0lEVEgiLCJNQUpPUl9HUklEX1NUUk9LRV9DT0xPUiIsIk1JTk9SX0dSSURfU1RST0tFX0NPTE9SIiwiVEVYVF9GT05UIiwic2l6ZSIsIlRFWFRfQk9MRF9GT05UIiwid2VpZ2h0IiwiUEVBUlNPTl9DT0VGRklDSUVOVF9URVhUX0ZPTlQiLCJDSEVDS0JPWF9URVhUX0ZPTlQiLCJNQUpPUl9USUNLX0ZPTlQiLCJTVU1fUkVTSURVQUxTX0ZPTlQiLCJSRUZFUkVOQ0VfRk9OVCIsIlNPVVJDRV9GT05UIiwiQ09OVFJPTF9QQU5FTF9DT1JORVJfUkFESVVTIiwiU01BTExfUEFORUxfQ09STkVSX1JBRElVUyIsIkNPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUiIsIlNNQUxMX1BBTkVMX1NUUk9LRSIsIklURU1fSElHSExJR0hUX0ZJTEwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxlYXN0U3F1YXJlc1JlZ3Jlc3Npb25Db25zdGFudHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29uc3RhbnRzIHRoYXQgYXJlIHVzZWQgaW4gdGhlIExlYXN0IFNxdWFyZXMgUmVncmVzc2lvbiBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBsZWFzdFNxdWFyZXNSZWdyZXNzaW9uIGZyb20gJy4uL2xlYXN0U3F1YXJlc1JlZ3Jlc3Npb24uanMnO1xyXG5cclxuY29uc3QgTGVhc3RTcXVhcmVzUmVncmVzc2lvbkNvbnN0YW50cyA9IHtcclxuXHJcbiAgLy8gc3BlZWQgZm9yIGRhdGFQb2ludHMgdG8gcmVhY2ggdGhlIGJ1Y2tldCB3aGVuIGFuaW1hdGVkXHJcbiAgQU5JTUFUSU9OX1NQRUVEOiAwLjAwMSwgLy8gIGluIG1vZGVsIHVuaXRzIHBlciBtaWxsaXNlY29uZDtcclxuXHJcbiAgLy8gQmFja2dyb3VuZCBjb2xvciBmb3Igc2ltIGFuZCBncmFwaFxyXG4gIEJBQ0tHUk9VTkRfQ09MT1I6ICdyZ2IoIDIzNiwgMjU1LCAyNDUgKScsXHJcbiAgR1JBUEhfQkFDS0dST1VORF9DT0xPUjogJ3JnYiggMjU1LCAyNTUsIDI1NSApJyxcclxuXHJcbiAgLy8gTGluZVdpZHRoIG9mICdCZXN0IEZpdCBMaW5lJyBhbmQgJ015TGluZSdcclxuICBMSU5FX1dJRFRIOiAyLFxyXG4gIC8vIExpbmVXaWR0aCBmb3IgdGhlIFJlc2lkdWFsIGxpbmUgb2YgJ0Jlc3QgRml0IExpbmUnIGFuZCAnTXlMaW5lJ1xyXG4gIFJFU0lEVUFMX0xJTkVfV0lEVEg6IDIsXHJcblxyXG4gIC8vICdNeUxpbmUnIGNvbG9yXHJcbiAgTVlfTElORV9DT0xPUjoge1xyXG4gICAgQkFTRV9DT0xPUjogJ3JnYiggMCwgMCwgMjU1KScsXHJcbiAgICBSRVNJRFVBTF9DT0xPUjogJ3JnYiggMTEwLCA5MiwgMjMxICknLFxyXG4gICAgU1FVQVJFRF9SRVNJRFVBTF9DT0xPUjogJ3JnYmEoIDE1NCwgMTUwLCAyNTUsIDAuNCApJyxcclxuICAgIFNVTV9PRl9TUVVBUkVTX0NPTE9SOiAncmdiKCAxNTQsIDE1MCwgMjU1ICknXHJcbiAgfSxcclxuXHJcbiAgLy8gJ0Jlc3QgRml0IExpbmUnIENvbG9yXHJcbiAgQkVTVF9GSVRfTElORV9DT0xPUjoge1xyXG4gICAgQkFTRV9DT0xPUjogJ3JnYiggMjU1LCAwLCAwICknLFxyXG4gICAgUkVTSURVQUxfQ09MT1I6ICdyZ2IoIDE3OCwgMjEsIDI3ICknLFxyXG4gICAgU1FVQVJFRF9SRVNJRFVBTF9DT0xPUjogJ3JnYmEoIDI1NSwgNTIsIDU5LCAwLjQgKScsXHJcbiAgICBTVU1fT0ZfU1FVQVJFU19DT0xPUjogJ3JnYiggMjU1LCA1MiwgNTkgKSdcclxuICB9LFxyXG5cclxuICAvLyBNb3ZhYmxlIGRhdGEgcG9pbnRzIChhbmQgcG9pbnRzIGluIGJ1Y2tldClcclxuICBEWU5BTUlDX0RBVEFfUE9JTlRfUkFESVVTOiA3LFxyXG4gIERZTkFNSUNfREFUQV9QT0lOVF9GSUxMOiAnb3JhbmdlJyxcclxuICBEWU5BTUlDX0RBVEFfUE9JTlRfU1RST0tFOiAnYmxhY2snLFxyXG4gIERZTkFNSUNfREFUQV9QT0lOVF9MSU5FX1dJRFRIOiAxLFxyXG5cclxuICAvLyBTdGF0aWMgZGF0YSBwb2ludHNcclxuICBTVEFUSUNfREFUQV9QT0lOVF9SQURJVVM6IDUsXHJcbiAgU1RBVElDX0RBVEFfUE9JTlRfRklMTDogJ29yYW5nZScsXHJcbiAgU1RBVElDX0RBVEFfUE9JTlRfU1RST0tFOiAnd2hpdGUnLFxyXG4gIFNUQVRJQ19EQVRBX1BPSU5UX0xJTkVfV0lEVEg6IDEsXHJcblxyXG4gIC8vIEdyaWRsaW5lcyBhbmQgZ3JpZCBpY29uXHJcbiAgTUFKT1JfR1JJRF9TVFJPS0VfQ09MT1I6ICdyZ2IoIDEyOCwgMTI4LCAxMjggKScsXHJcbiAgTUlOT1JfR1JJRF9TVFJPS0VfQ09MT1I6ICdyZ2IoIDIxOCwgMjE4LCAyMTgpJyxcclxuXHJcbiAgLy8gRm9udCBzaXplcyBhbmQgd2VpZ2h0XHJcbiAgVEVYVF9GT05UOiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYgfSApLCAvLyBkZWZhdWx0IGZvbnQgZm9yIHRleHRcclxuICBURVhUX0JPTERfRk9OVDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE2LCB3ZWlnaHQ6ICdib2xkJyB9ICksIC8vIGRlZmF1bHQgZm9udCBmb3IgYm9sZCBmb250XHJcbiAgUEVBUlNPTl9DT0VGRklDSUVOVF9URVhUX0ZPTlQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMiwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gIENIRUNLQk9YX1RFWFRfRk9OVDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE0IH0gKSxcclxuICBNQUpPUl9USUNLX0ZPTlQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxNCB9ICksXHJcbiAgU1VNX1JFU0lEVUFMU19GT05UOiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTQgfSApLFxyXG5cclxuICBSRUZFUkVOQ0VfRk9OVDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE2IH0gKSxcclxuICBTT1VSQ0VfRk9OVDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE0IH0gKSxcclxuXHJcbiAgLy8gUGFuZWxzXHJcbiAgQ09OVFJPTF9QQU5FTF9DT1JORVJfUkFESVVTOiAxMCxcclxuICBTTUFMTF9QQU5FTF9DT1JORVJfUkFESVVTOiA1LFxyXG4gIENPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUjogJ3JnYiggMjU1LCAyNDUsIDIzOCApJywgLy8gc2Vhc2hlbGxcclxuICBTTUFMTF9QQU5FTF9TVFJPS0U6ICdyZ2IoMjA0LDIwNCwyMDQpJywgLy8gZ3JheVxyXG5cclxuICAvLyBDb21ibyBib3hcclxuICBJVEVNX0hJR0hMSUdIVF9GSUxMOiAncmdiKCAyMzYsIDI1NSwgMjQ1ICknXHJcblxyXG59O1xyXG5cclxubGVhc3RTcXVhcmVzUmVncmVzc2lvbi5yZWdpc3RlciggJ0xlYXN0U3F1YXJlc1JlZ3Jlc3Npb25Db25zdGFudHMnLCBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBMZWFzdFNxdWFyZXNSZWdyZXNzaW9uQ29uc3RhbnRzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLHNCQUFzQixNQUFNLDhCQUE4QjtBQUVqRSxNQUFNQywrQkFBK0IsR0FBRztFQUV0QztFQUNBQyxlQUFlLEVBQUUsS0FBSztFQUFFOztFQUV4QjtFQUNBQyxnQkFBZ0IsRUFBRSxzQkFBc0I7RUFDeENDLHNCQUFzQixFQUFFLHNCQUFzQjtFQUU5QztFQUNBQyxVQUFVLEVBQUUsQ0FBQztFQUNiO0VBQ0FDLG1CQUFtQixFQUFFLENBQUM7RUFFdEI7RUFDQUMsYUFBYSxFQUFFO0lBQ2JDLFVBQVUsRUFBRSxpQkFBaUI7SUFDN0JDLGNBQWMsRUFBRSxxQkFBcUI7SUFDckNDLHNCQUFzQixFQUFFLDRCQUE0QjtJQUNwREMsb0JBQW9CLEVBQUU7RUFDeEIsQ0FBQztFQUVEO0VBQ0FDLG1CQUFtQixFQUFFO0lBQ25CSixVQUFVLEVBQUUsa0JBQWtCO0lBQzlCQyxjQUFjLEVBQUUsb0JBQW9CO0lBQ3BDQyxzQkFBc0IsRUFBRSwwQkFBMEI7SUFDbERDLG9CQUFvQixFQUFFO0VBQ3hCLENBQUM7RUFFRDtFQUNBRSx5QkFBeUIsRUFBRSxDQUFDO0VBQzVCQyx1QkFBdUIsRUFBRSxRQUFRO0VBQ2pDQyx5QkFBeUIsRUFBRSxPQUFPO0VBQ2xDQyw2QkFBNkIsRUFBRSxDQUFDO0VBRWhDO0VBQ0FDLHdCQUF3QixFQUFFLENBQUM7RUFDM0JDLHNCQUFzQixFQUFFLFFBQVE7RUFDaENDLHdCQUF3QixFQUFFLE9BQU87RUFDakNDLDRCQUE0QixFQUFFLENBQUM7RUFFL0I7RUFDQUMsdUJBQXVCLEVBQUUsc0JBQXNCO0VBQy9DQyx1QkFBdUIsRUFBRSxxQkFBcUI7RUFFOUM7RUFDQUMsU0FBUyxFQUFFLElBQUl4QixRQUFRLENBQUU7SUFBRXlCLElBQUksRUFBRTtFQUFHLENBQUUsQ0FBQztFQUFFO0VBQ3pDQyxjQUFjLEVBQUUsSUFBSTFCLFFBQVEsQ0FBRTtJQUFFeUIsSUFBSSxFQUFFLEVBQUU7SUFBRUUsTUFBTSxFQUFFO0VBQU8sQ0FBRSxDQUFDO0VBQUU7RUFDOURDLDZCQUE2QixFQUFFLElBQUk1QixRQUFRLENBQUU7SUFBRXlCLElBQUksRUFBRSxFQUFFO0lBQUVFLE1BQU0sRUFBRTtFQUFPLENBQUUsQ0FBQztFQUMzRUUsa0JBQWtCLEVBQUUsSUFBSTdCLFFBQVEsQ0FBRTtJQUFFeUIsSUFBSSxFQUFFO0VBQUcsQ0FBRSxDQUFDO0VBQ2hESyxlQUFlLEVBQUUsSUFBSTlCLFFBQVEsQ0FBRTtJQUFFeUIsSUFBSSxFQUFFO0VBQUcsQ0FBRSxDQUFDO0VBQzdDTSxrQkFBa0IsRUFBRSxJQUFJL0IsUUFBUSxDQUFFO0lBQUV5QixJQUFJLEVBQUU7RUFBRyxDQUFFLENBQUM7RUFFaERPLGNBQWMsRUFBRSxJQUFJaEMsUUFBUSxDQUFFO0lBQUV5QixJQUFJLEVBQUU7RUFBRyxDQUFFLENBQUM7RUFDNUNRLFdBQVcsRUFBRSxJQUFJakMsUUFBUSxDQUFFO0lBQUV5QixJQUFJLEVBQUU7RUFBRyxDQUFFLENBQUM7RUFFekM7RUFDQVMsMkJBQTJCLEVBQUUsRUFBRTtFQUMvQkMseUJBQXlCLEVBQUUsQ0FBQztFQUM1QkMsOEJBQThCLEVBQUUsc0JBQXNCO0VBQUU7RUFDeERDLGtCQUFrQixFQUFFLGtCQUFrQjtFQUFFOztFQUV4QztFQUNBQyxtQkFBbUIsRUFBRTtBQUV2QixDQUFDO0FBRURyQyxzQkFBc0IsQ0FBQ3NDLFFBQVEsQ0FBRSxpQ0FBaUMsRUFBRXJDLCtCQUFnQyxDQUFDO0FBRXJHLGVBQWVBLCtCQUErQiJ9