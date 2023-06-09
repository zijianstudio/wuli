// Copyright 2013-2023, University of Colorado Boulder

/**
 * Constants used throughout this sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../dot/js/Vector2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import phScale from '../phScale.js';
const PHScaleConstants = {
  // ScreenView
  SCREEN_VIEW_OPTIONS: {
    layoutBounds: new Bounds2(0, 0, 1100, 700),
    // Workaround for things shifting around while dragging
    // See https://github.com/phetsims/scenery/issues/1289 and https://github.com/phetsims/ph-scale/issues/226
    preventFit: true
  },
  // Credits, shared by ph-scale and ph-scale-basics
  CREDITS: {
    leadDesign: 'Yuen-ying Carpenter, Archie Paulson',
    softwareDevelopment: 'Chris Malley (PixelZoom, Inc.)',
    team: 'Wendy Adams, Jack Barbera, Julia Chamberlain, Laurie Langdon, Trish Loeblein, Emily B. Moore, Ariel Paul, Katherine Perkins, Amy Rouinfar',
    graphicArts: 'Sharon Siman-Tov',
    qualityAssurance: 'Jaspe Arias, Logan Bray, Steele Dalton, Jaron Droder, Bryce Griebenow, Clifford Hardin, Brooklyn Lash, Emily Miller, ' + 'Matthew Moore, Elise Morgan, Liam Mulhall, Oliver Orejola, Devon Quispe, Benjamin Roberts, Jacob Romero, Nancy Salpepi, ' + 'Marla Schulz, Ethan Ward, Kathryn Woessner, Bryan Yoelin',
    thanks: 'Conversion of this simulation to HTML5 was funded in part by the Royal Society of Chemistry.'
  },
  // beaker
  BEAKER_VOLUME: 1.2,
  // L
  BEAKER_POSITION: new Vector2(750, 580),
  BEAKER_SIZE: new Dimension2(450, 300),
  // pH
  PH_RANGE: new RangeWithValue(-1, 15, 7),
  PH_METER_DECIMAL_PLACES: 2,
  // volume
  VOLUME_DECIMAL_PLACES: 2,
  MIN_SOLUTION_VOLUME: 0.015,
  // L, minimum non-zero volume for solution, so it's visible and measurable

  // logarithmic graph
  LOGARITHMIC_EXPONENT_RANGE: new Range(-16, 2),
  LOGARITHMIC_MANTISSA_DECIMAL_PLACES: 1,
  LINEAR_EXPONENT_RANGE: new Range(-14, 1),
  LINEAR_MANTISSA_RANGE: new Range(0, 8),
  // expand/collapse buttons
  EXPAND_COLLAPSE_BUTTON_OPTIONS: {
    sideLength: 30,
    touchAreaXDilation: 10,
    touchAreaYDilation: 10
  },
  // faucets
  FAUCET_OPTIONS: {
    tapToDispenseAmount: 0.05,
    // L
    tapToDispenseInterval: 333,
    // ms
    shooterOptions: {
      touchAreaXDilation: 37,
      touchAreaYDilation: 60
    }
  },
  // formulas, no i18n required
  H3O_FORMULA: 'H<sub>3</sub>O<sup>+</sup>',
  OH_FORMULA: 'OH<sup>-</sup>',
  H2O_FORMULA: 'H<sub>2</sub>O',
  // fonts
  AB_SWITCH_FONT: new PhetFont({
    size: 18,
    weight: 'bold'
  })
};
phScale.register('PHScaleConstants', PHScaleConstants);
export default PHScaleConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiUmFuZ2VXaXRoVmFsdWUiLCJWZWN0b3IyIiwiUGhldEZvbnQiLCJwaFNjYWxlIiwiUEhTY2FsZUNvbnN0YW50cyIsIlNDUkVFTl9WSUVXX09QVElPTlMiLCJsYXlvdXRCb3VuZHMiLCJwcmV2ZW50Rml0IiwiQ1JFRElUUyIsImxlYWREZXNpZ24iLCJzb2Z0d2FyZURldmVsb3BtZW50IiwidGVhbSIsImdyYXBoaWNBcnRzIiwicXVhbGl0eUFzc3VyYW5jZSIsInRoYW5rcyIsIkJFQUtFUl9WT0xVTUUiLCJCRUFLRVJfUE9TSVRJT04iLCJCRUFLRVJfU0laRSIsIlBIX1JBTkdFIiwiUEhfTUVURVJfREVDSU1BTF9QTEFDRVMiLCJWT0xVTUVfREVDSU1BTF9QTEFDRVMiLCJNSU5fU09MVVRJT05fVk9MVU1FIiwiTE9HQVJJVEhNSUNfRVhQT05FTlRfUkFOR0UiLCJMT0dBUklUSE1JQ19NQU5USVNTQV9ERUNJTUFMX1BMQUNFUyIsIkxJTkVBUl9FWFBPTkVOVF9SQU5HRSIsIkxJTkVBUl9NQU5USVNTQV9SQU5HRSIsIkVYUEFORF9DT0xMQVBTRV9CVVRUT05fT1BUSU9OUyIsInNpZGVMZW5ndGgiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJGQVVDRVRfT1BUSU9OUyIsInRhcFRvRGlzcGVuc2VBbW91bnQiLCJ0YXBUb0Rpc3BlbnNlSW50ZXJ2YWwiLCJzaG9vdGVyT3B0aW9ucyIsIkgzT19GT1JNVUxBIiwiT0hfRk9STVVMQSIsIkgyT19GT1JNVUxBIiwiQUJfU1dJVENIX0ZPTlQiLCJzaXplIiwid2VpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQSFNjYWxlQ29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnN0YW50cyB1c2VkIHRocm91Z2hvdXQgdGhpcyBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgUmFuZ2VXaXRoVmFsdWUgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlV2l0aFZhbHVlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHBoU2NhbGUgZnJvbSAnLi4vcGhTY2FsZS5qcyc7XHJcblxyXG5jb25zdCBQSFNjYWxlQ29uc3RhbnRzID0ge1xyXG5cclxuICAvLyBTY3JlZW5WaWV3XHJcbiAgU0NSRUVOX1ZJRVdfT1BUSU9OUzoge1xyXG4gICAgbGF5b3V0Qm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgMTEwMCwgNzAwICksXHJcblxyXG4gICAgLy8gV29ya2Fyb3VuZCBmb3IgdGhpbmdzIHNoaWZ0aW5nIGFyb3VuZCB3aGlsZSBkcmFnZ2luZ1xyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMjg5IGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGgtc2NhbGUvaXNzdWVzLzIyNlxyXG4gICAgcHJldmVudEZpdDogdHJ1ZVxyXG4gIH0sXHJcblxyXG4gIC8vIENyZWRpdHMsIHNoYXJlZCBieSBwaC1zY2FsZSBhbmQgcGgtc2NhbGUtYmFzaWNzXHJcbiAgQ1JFRElUUzoge1xyXG4gICAgbGVhZERlc2lnbjpcclxuICAgICAgJ1l1ZW4teWluZyBDYXJwZW50ZXIsIEFyY2hpZSBQYXVsc29uJyxcclxuICAgIHNvZnR3YXJlRGV2ZWxvcG1lbnQ6XHJcbiAgICAgICdDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLiknLFxyXG4gICAgdGVhbTpcclxuICAgICAgJ1dlbmR5IEFkYW1zLCBKYWNrIEJhcmJlcmEsIEp1bGlhIENoYW1iZXJsYWluLCBMYXVyaWUgTGFuZ2RvbiwgVHJpc2ggTG9lYmxlaW4sIEVtaWx5IEIuIE1vb3JlLCBBcmllbCBQYXVsLCBLYXRoZXJpbmUgUGVya2lucywgQW15IFJvdWluZmFyJyxcclxuICAgIGdyYXBoaWNBcnRzOlxyXG4gICAgICAnU2hhcm9uIFNpbWFuLVRvdicsXHJcbiAgICBxdWFsaXR5QXNzdXJhbmNlOlxyXG4gICAgICAnSmFzcGUgQXJpYXMsIExvZ2FuIEJyYXksIFN0ZWVsZSBEYWx0b24sIEphcm9uIERyb2RlciwgQnJ5Y2UgR3JpZWJlbm93LCBDbGlmZm9yZCBIYXJkaW4sIEJyb29rbHluIExhc2gsIEVtaWx5IE1pbGxlciwgJyArXHJcbiAgICAgICdNYXR0aGV3IE1vb3JlLCBFbGlzZSBNb3JnYW4sIExpYW0gTXVsaGFsbCwgT2xpdmVyIE9yZWpvbGEsIERldm9uIFF1aXNwZSwgQmVuamFtaW4gUm9iZXJ0cywgSmFjb2IgUm9tZXJvLCBOYW5jeSBTYWxwZXBpLCAnICtcclxuICAgICAgJ01hcmxhIFNjaHVseiwgRXRoYW4gV2FyZCwgS2F0aHJ5biBXb2Vzc25lciwgQnJ5YW4gWW9lbGluJyxcclxuICAgIHRoYW5rczpcclxuICAgICAgJ0NvbnZlcnNpb24gb2YgdGhpcyBzaW11bGF0aW9uIHRvIEhUTUw1IHdhcyBmdW5kZWQgaW4gcGFydCBieSB0aGUgUm95YWwgU29jaWV0eSBvZiBDaGVtaXN0cnkuJ1xyXG4gIH0sXHJcblxyXG4gIC8vIGJlYWtlclxyXG4gIEJFQUtFUl9WT0xVTUU6IDEuMiwgLy8gTFxyXG4gIEJFQUtFUl9QT1NJVElPTjogbmV3IFZlY3RvcjIoIDc1MCwgNTgwICksXHJcbiAgQkVBS0VSX1NJWkU6IG5ldyBEaW1lbnNpb24yKCA0NTAsIDMwMCApLFxyXG5cclxuICAvLyBwSFxyXG4gIFBIX1JBTkdFOiBuZXcgUmFuZ2VXaXRoVmFsdWUoIC0xLCAxNSwgNyApLFxyXG4gIFBIX01FVEVSX0RFQ0lNQUxfUExBQ0VTOiAyLFxyXG5cclxuICAvLyB2b2x1bWVcclxuICBWT0xVTUVfREVDSU1BTF9QTEFDRVM6IDIsXHJcbiAgTUlOX1NPTFVUSU9OX1ZPTFVNRTogMC4wMTUsICAvLyBMLCBtaW5pbXVtIG5vbi16ZXJvIHZvbHVtZSBmb3Igc29sdXRpb24sIHNvIGl0J3MgdmlzaWJsZSBhbmQgbWVhc3VyYWJsZVxyXG5cclxuICAvLyBsb2dhcml0aG1pYyBncmFwaFxyXG4gIExPR0FSSVRITUlDX0VYUE9ORU5UX1JBTkdFOiBuZXcgUmFuZ2UoIC0xNiwgMiApLFxyXG4gIExPR0FSSVRITUlDX01BTlRJU1NBX0RFQ0lNQUxfUExBQ0VTOiAxLFxyXG4gIExJTkVBUl9FWFBPTkVOVF9SQU5HRTogbmV3IFJhbmdlKCAtMTQsIDEgKSxcclxuICBMSU5FQVJfTUFOVElTU0FfUkFOR0U6IG5ldyBSYW5nZSggMCwgOCApLFxyXG5cclxuICAvLyBleHBhbmQvY29sbGFwc2UgYnV0dG9uc1xyXG4gIEVYUEFORF9DT0xMQVBTRV9CVVRUT05fT1BUSU9OUzoge1xyXG4gICAgc2lkZUxlbmd0aDogMzAsXHJcbiAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxyXG4gICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMFxyXG4gIH0sXHJcblxyXG4gIC8vIGZhdWNldHNcclxuICBGQVVDRVRfT1BUSU9OUzoge1xyXG4gICAgdGFwVG9EaXNwZW5zZUFtb3VudDogMC4wNSwgLy8gTFxyXG4gICAgdGFwVG9EaXNwZW5zZUludGVydmFsOiAzMzMsIC8vIG1zXHJcbiAgICBzaG9vdGVyT3B0aW9uczoge1xyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDM3LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDYwXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gZm9ybXVsYXMsIG5vIGkxOG4gcmVxdWlyZWRcclxuICBIM09fRk9STVVMQTogJ0g8c3ViPjM8L3N1Yj5PPHN1cD4rPC9zdXA+JyxcclxuICBPSF9GT1JNVUxBOiAnT0g8c3VwPi08L3N1cD4nLFxyXG4gIEgyT19GT1JNVUxBOiAnSDxzdWI+Mjwvc3ViPk8nLFxyXG5cclxuICAvLyBmb250c1xyXG4gIEFCX1NXSVRDSF9GT05UOiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTgsIHdlaWdodDogJ2JvbGQnIH0gKVxyXG59O1xyXG5cclxucGhTY2FsZS5yZWdpc3RlciggJ1BIU2NhbGVDb25zdGFudHMnLCBQSFNjYWxlQ29uc3RhbnRzICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBIU2NhbGVDb25zdGFudHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLCtCQUErQjtBQUN0RCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLGNBQWMsTUFBTSxtQ0FBbUM7QUFDOUQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLE9BQU8sTUFBTSxlQUFlO0FBRW5DLE1BQU1DLGdCQUFnQixHQUFHO0VBRXZCO0VBQ0FDLG1CQUFtQixFQUFFO0lBQ25CQyxZQUFZLEVBQUUsSUFBSVQsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUksQ0FBQztJQUU1QztJQUNBO0lBQ0FVLFVBQVUsRUFBRTtFQUNkLENBQUM7RUFFRDtFQUNBQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUNSLHFDQUFxQztJQUN2Q0MsbUJBQW1CLEVBQ2pCLGdDQUFnQztJQUNsQ0MsSUFBSSxFQUNGLDJJQUEySTtJQUM3SUMsV0FBVyxFQUNULGtCQUFrQjtJQUNwQkMsZ0JBQWdCLEVBQ2QsdUhBQXVILEdBQ3ZILDBIQUEwSCxHQUMxSCwwREFBMEQ7SUFDNURDLE1BQU0sRUFDSjtFQUNKLENBQUM7RUFFRDtFQUNBQyxhQUFhLEVBQUUsR0FBRztFQUFFO0VBQ3BCQyxlQUFlLEVBQUUsSUFBSWYsT0FBTyxDQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDeENnQixXQUFXLEVBQUUsSUFBSW5CLFVBQVUsQ0FBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0VBRXZDO0VBQ0FvQixRQUFRLEVBQUUsSUFBSWxCLGNBQWMsQ0FBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDO0VBQ3pDbUIsdUJBQXVCLEVBQUUsQ0FBQztFQUUxQjtFQUNBQyxxQkFBcUIsRUFBRSxDQUFDO0VBQ3hCQyxtQkFBbUIsRUFBRSxLQUFLO0VBQUc7O0VBRTdCO0VBQ0FDLDBCQUEwQixFQUFFLElBQUl2QixLQUFLLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFDO0VBQy9Dd0IsbUNBQW1DLEVBQUUsQ0FBQztFQUN0Q0MscUJBQXFCLEVBQUUsSUFBSXpCLEtBQUssQ0FBRSxDQUFDLEVBQUUsRUFBRSxDQUFFLENBQUM7RUFDMUMwQixxQkFBcUIsRUFBRSxJQUFJMUIsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7RUFFeEM7RUFDQTJCLDhCQUE4QixFQUFFO0lBQzlCQyxVQUFVLEVBQUUsRUFBRTtJQUNkQyxrQkFBa0IsRUFBRSxFQUFFO0lBQ3RCQyxrQkFBa0IsRUFBRTtFQUN0QixDQUFDO0VBRUQ7RUFDQUMsY0FBYyxFQUFFO0lBQ2RDLG1CQUFtQixFQUFFLElBQUk7SUFBRTtJQUMzQkMscUJBQXFCLEVBQUUsR0FBRztJQUFFO0lBQzVCQyxjQUFjLEVBQUU7TUFDZEwsa0JBQWtCLEVBQUUsRUFBRTtNQUN0QkMsa0JBQWtCLEVBQUU7SUFDdEI7RUFDRixDQUFDO0VBRUQ7RUFDQUssV0FBVyxFQUFFLDRCQUE0QjtFQUN6Q0MsVUFBVSxFQUFFLGdCQUFnQjtFQUM1QkMsV0FBVyxFQUFFLGdCQUFnQjtFQUU3QjtFQUNBQyxjQUFjLEVBQUUsSUFBSW5DLFFBQVEsQ0FBRTtJQUFFb0MsSUFBSSxFQUFFLEVBQUU7SUFBRUMsTUFBTSxFQUFFO0VBQU8sQ0FBRTtBQUM3RCxDQUFDO0FBRURwQyxPQUFPLENBQUNxQyxRQUFRLENBQUUsa0JBQWtCLEVBQUVwQyxnQkFBaUIsQ0FBQztBQUN4RCxlQUFlQSxnQkFBZ0IifQ==