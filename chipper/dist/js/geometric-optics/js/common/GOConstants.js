// Copyright 2021-2022, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import geometricOptics from '../geometricOptics.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
const CONTROL_FONT = new PhetFont(14);

// Shared with geometric-optics-basics
const CREDITS = {
  leadDesign: 'Amy Rouinfar, Michael Dubson',
  softwareDevelopment: 'Sarah Chang, Chris Malley (PixelZoom, Inc.), Martin Veillette',
  team: 'Chris Klusendorf, Diana L\u00f3pez Tavares, Ariel Paul, Kathy Perkins',
  qualityAssurance: 'Steele Dalton, Jaron Droder, Clifford Hardin, Emily Miller, Nancy Salpepi, Kathryn Woessner',
  graphicArts: 'Megan Lai'
};
const ARROW_NODE_OPTIONS = {
  headWidth: 18,
  headHeight: 21,
  tailWidth: 2,
  isHeadDynamic: true,
  fractionalHeadHeight: 0.5
};
const KEYBOARD_DRAG_LISTENER_OPTIONS = {
  dragVelocity: 300,
  // velocity of the Node being dragged, in view coordinates per second
  shiftDragVelocity: 20 // velocity with the Shift key pressed, typically slower than dragVelocity
};

const NUMBER_CONTROL_OPTIONS = {
  layoutFunction: NumberControl.createLayoutFunction3({
    ySpacing: 12
  }),
  titleNodeOptions: {
    font: CONTROL_FONT,
    maxWidth: 140
  },
  sliderOptions: {
    trackSize: new Dimension2(140, 4),
    thumbSize: new Dimension2(15, 30),
    thumbTouchAreaXDilation: 5,
    thumbTouchAreaYDilation: 5
  },
  numberDisplayOptions: {
    maxWidth: 70,
    textOptions: {
      font: CONTROL_FONT
    }
  }
};
const GOConstants = {
  SCREEN_VIEW_X_MARGIN: 20,
  SCREEN_VIEW_Y_MARGIN: 15,
  CREDITS: CREDITS,
  // Objects -----------------------------------------------------------------------------------------------------------

  // BEWARE! Getting too close to the optic will reveal problems with the model.
  MIN_DISTANCE_FROM_OBJECT_TO_OPTIC: 40,
  // cm
  MIN_DISTANCE_FROM_OPTIC_TO_PROJECTION_SCREEN: 60,
  // cm

  // Maximum distance that objects can be dragged vertically from the optical axis, in cm. This is constrained to
  // prevent cases where the optical object is close to the optic and no 'Many' rays go through the optic.
  // See https://github.com/phetsims/geometric-optics/issues/289
  MAX_DISTANCE_FROM_OBJECT_TO_OPTICAL_AXIS: 100,
  // cm

  // Rulers ------------------------------------------------------------------------------------------------------------

  // model
  HORIZONTAL_RULER_LENGTH: 260,
  // cm
  VERTICAL_RULER_LENGTH: 160,
  // cm

  // view
  RULER_HEIGHT: 40,
  // in view coordinates
  RULER_MINIMUM_VISIBLE_LENGTH: 40,
  // portion of the ruler always within visible bounds, in view coordinates

  // Decimal places and steps for controls -------------------------------------------------------------------------

  FOCAL_LENGTH_DECIMAL_PLACES: 0,
  FOCAL_LENGTH_SPINNER_STEP: 1,
  // cm
  FOCAL_LENGTH_SLIDER_STEP: 5,
  // cm
  FOCAL_LENGTH_KEYBOARD_STEP: 5,
  // cm
  FOCAL_LENGTH_SHIFT_KEYBOARD_STEP: 1,
  // cm
  FOCAL_LENGTH_PAGE_KEYBOARD_STEP: 10,
  // cm

  RADIUS_OF_CURVATURE_DECIMAL_PLACES: 0,
  RADIUS_OF_CURVATURE_SPINNER_STEP: 1,
  // cm
  RADIUS_OF_CURVATURE_SLIDER_STEP: 5,
  // cm
  RADIUS_OF_CURVATURE_KEYBOARD_STEP: 5,
  // cm
  RADIUS_OF_CURVATURE_SHIFT_KEYBOARD_STEP: 1,
  // cm
  RADIUS_OF_CURVATURE_PAGE_KEYBOARD_STEP: 10,
  // cm

  INDEX_OF_REFRACTION_DECIMAL_PLACES: 2,
  INDEX_OF_REFRACTION_SPINNER_STEP: 0.01,
  INDEX_OF_REFRACTION_SLIDER_STEP: 0.05,
  INDEX_OF_REFRACTION_KEYBOARD_STEP: 0.05,
  INDEX_OF_REFRACTION_SHIFT_KEYBOARD_STEP: 0.01,
  INDEX_OF_REFRACTION_PAGE_KEYBOARD_STEP: 0.1,
  DIAMETER_DECIMAL_PLACES: 0,
  DIAMETER_SPINNER_STEP: 1,
  // cm
  DIAMETER_SLIDER_STEP: 5,
  // cm
  DIAMETER_KEYBOARD_STEP: 5,
  // cm
  DIAMETER_SHIFT_KEYBOARD_STEP: 1,
  // cm
  DIAMETER_PAGE_KEYBOARD_STEP: 10,
  // cm

  // Fonts -------------------------------------------------------------------------------------------------------------

  LABEL_FONT: new PhetFont(12),
  CONTROL_FONT: CONTROL_FONT,
  TITLE_FONT: new PhetFont({
    weight: 'bold',
    size: 14
  }),
  // Misc --------------------------------------------------------------------------------------------------------------

  INTENSITY_RANGE: new Range(0, 1),
  OPACITY_RANGE: new Range(0, 1),
  MIN_SCALE: 1e-5,
  // to prevent zero scaling, see https://github.com/phetsims/geometric-optics/issues/155
  MIN_MAGNITUDE: 1e-5,
  // to prevent zero-magnitude ArrowNode, see https://github.com/phetsims/geometric-optics/issues/306

  // Options -----------------------------------------------------------------------------------------------------------

  CHECKBOX_BOX_WIDTH: 14,
  ARROW_NODE_OPTIONS: ARROW_NODE_OPTIONS,
  KEYBOARD_DRAG_LISTENER_OPTIONS: KEYBOARD_DRAG_LISTENER_OPTIONS,
  NUMBER_CONTROL_OPTIONS: NUMBER_CONTROL_OPTIONS
};
geometricOptics.register('GOConstants', GOConstants);
export default GOConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsImdlb21ldHJpY09wdGljcyIsIk51bWJlckNvbnRyb2wiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJDT05UUk9MX0ZPTlQiLCJDUkVESVRTIiwibGVhZERlc2lnbiIsInNvZnR3YXJlRGV2ZWxvcG1lbnQiLCJ0ZWFtIiwicXVhbGl0eUFzc3VyYW5jZSIsImdyYXBoaWNBcnRzIiwiQVJST1dfTk9ERV9PUFRJT05TIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsInRhaWxXaWR0aCIsImlzSGVhZER5bmFtaWMiLCJmcmFjdGlvbmFsSGVhZEhlaWdodCIsIktFWUJPQVJEX0RSQUdfTElTVEVORVJfT1BUSU9OUyIsImRyYWdWZWxvY2l0eSIsInNoaWZ0RHJhZ1ZlbG9jaXR5IiwiTlVNQkVSX0NPTlRST0xfT1BUSU9OUyIsImxheW91dEZ1bmN0aW9uIiwiY3JlYXRlTGF5b3V0RnVuY3Rpb24zIiwieVNwYWNpbmciLCJ0aXRsZU5vZGVPcHRpb25zIiwiZm9udCIsIm1heFdpZHRoIiwic2xpZGVyT3B0aW9ucyIsInRyYWNrU2l6ZSIsInRodW1iU2l6ZSIsInRodW1iVG91Y2hBcmVhWERpbGF0aW9uIiwidGh1bWJUb3VjaEFyZWFZRGlsYXRpb24iLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInRleHRPcHRpb25zIiwiR09Db25zdGFudHMiLCJTQ1JFRU5fVklFV19YX01BUkdJTiIsIlNDUkVFTl9WSUVXX1lfTUFSR0lOIiwiTUlOX0RJU1RBTkNFX0ZST01fT0JKRUNUX1RPX09QVElDIiwiTUlOX0RJU1RBTkNFX0ZST01fT1BUSUNfVE9fUFJPSkVDVElPTl9TQ1JFRU4iLCJNQVhfRElTVEFOQ0VfRlJPTV9PQkpFQ1RfVE9fT1BUSUNBTF9BWElTIiwiSE9SSVpPTlRBTF9SVUxFUl9MRU5HVEgiLCJWRVJUSUNBTF9SVUxFUl9MRU5HVEgiLCJSVUxFUl9IRUlHSFQiLCJSVUxFUl9NSU5JTVVNX1ZJU0lCTEVfTEVOR1RIIiwiRk9DQUxfTEVOR1RIX0RFQ0lNQUxfUExBQ0VTIiwiRk9DQUxfTEVOR1RIX1NQSU5ORVJfU1RFUCIsIkZPQ0FMX0xFTkdUSF9TTElERVJfU1RFUCIsIkZPQ0FMX0xFTkdUSF9LRVlCT0FSRF9TVEVQIiwiRk9DQUxfTEVOR1RIX1NISUZUX0tFWUJPQVJEX1NURVAiLCJGT0NBTF9MRU5HVEhfUEFHRV9LRVlCT0FSRF9TVEVQIiwiUkFESVVTX09GX0NVUlZBVFVSRV9ERUNJTUFMX1BMQUNFUyIsIlJBRElVU19PRl9DVVJWQVRVUkVfU1BJTk5FUl9TVEVQIiwiUkFESVVTX09GX0NVUlZBVFVSRV9TTElERVJfU1RFUCIsIlJBRElVU19PRl9DVVJWQVRVUkVfS0VZQk9BUkRfU1RFUCIsIlJBRElVU19PRl9DVVJWQVRVUkVfU0hJRlRfS0VZQk9BUkRfU1RFUCIsIlJBRElVU19PRl9DVVJWQVRVUkVfUEFHRV9LRVlCT0FSRF9TVEVQIiwiSU5ERVhfT0ZfUkVGUkFDVElPTl9ERUNJTUFMX1BMQUNFUyIsIklOREVYX09GX1JFRlJBQ1RJT05fU1BJTk5FUl9TVEVQIiwiSU5ERVhfT0ZfUkVGUkFDVElPTl9TTElERVJfU1RFUCIsIklOREVYX09GX1JFRlJBQ1RJT05fS0VZQk9BUkRfU1RFUCIsIklOREVYX09GX1JFRlJBQ1RJT05fU0hJRlRfS0VZQk9BUkRfU1RFUCIsIklOREVYX09GX1JFRlJBQ1RJT05fUEFHRV9LRVlCT0FSRF9TVEVQIiwiRElBTUVURVJfREVDSU1BTF9QTEFDRVMiLCJESUFNRVRFUl9TUElOTkVSX1NURVAiLCJESUFNRVRFUl9TTElERVJfU1RFUCIsIkRJQU1FVEVSX0tFWUJPQVJEX1NURVAiLCJESUFNRVRFUl9TSElGVF9LRVlCT0FSRF9TVEVQIiwiRElBTUVURVJfUEFHRV9LRVlCT0FSRF9TVEVQIiwiTEFCRUxfRk9OVCIsIlRJVExFX0ZPTlQiLCJ3ZWlnaHQiLCJzaXplIiwiSU5URU5TSVRZX1JBTkdFIiwiT1BBQ0lUWV9SQU5HRSIsIk1JTl9TQ0FMRSIsIk1JTl9NQUdOSVRVREUiLCJDSEVDS0JPWF9CT1hfV0lEVEgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdPQ29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnN0YW50cyB1c2VkIHRocm91Z2hvdXQgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgTnVtYmVyQ29udHJvbCwgeyBOdW1iZXJDb250cm9sT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IHsgS2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgQXJyb3dOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgeyBDcmVkaXRzRGF0YSB9IGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL0NyZWRpdHNOb2RlLmpzJztcclxuXHJcbmNvbnN0IENPTlRST0xfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTQgKTtcclxuXHJcbi8vIFNoYXJlZCB3aXRoIGdlb21ldHJpYy1vcHRpY3MtYmFzaWNzXHJcbmNvbnN0IENSRURJVFM6IENyZWRpdHNEYXRhID0ge1xyXG4gIGxlYWREZXNpZ246ICdBbXkgUm91aW5mYXIsIE1pY2hhZWwgRHVic29uJyxcclxuICBzb2Z0d2FyZURldmVsb3BtZW50OiAnU2FyYWggQ2hhbmcsIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKSwgTWFydGluIFZlaWxsZXR0ZScsXHJcbiAgdGVhbTogJ0NocmlzIEtsdXNlbmRvcmYsIERpYW5hIExcXHUwMGYzcGV6IFRhdmFyZXMsIEFyaWVsIFBhdWwsIEthdGh5IFBlcmtpbnMnLFxyXG4gIHF1YWxpdHlBc3N1cmFuY2U6ICdTdGVlbGUgRGFsdG9uLCBKYXJvbiBEcm9kZXIsIENsaWZmb3JkIEhhcmRpbiwgRW1pbHkgTWlsbGVyLCBOYW5jeSBTYWxwZXBpLCBLYXRocnluIFdvZXNzbmVyJyxcclxuICBncmFwaGljQXJ0czogJ01lZ2FuIExhaSdcclxufTtcclxuXHJcbmNvbnN0IEFSUk9XX05PREVfT1BUSU9OUzogQXJyb3dOb2RlT3B0aW9ucyA9IHtcclxuICBoZWFkV2lkdGg6IDE4LFxyXG4gIGhlYWRIZWlnaHQ6IDIxLFxyXG4gIHRhaWxXaWR0aDogMixcclxuICBpc0hlYWREeW5hbWljOiB0cnVlLFxyXG4gIGZyYWN0aW9uYWxIZWFkSGVpZ2h0OiAwLjVcclxufTtcclxuXHJcbmNvbnN0IEtFWUJPQVJEX0RSQUdfTElTVEVORVJfT1BUSU9OUzogS2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zID0ge1xyXG4gIGRyYWdWZWxvY2l0eTogMzAwLCAvLyB2ZWxvY2l0eSBvZiB0aGUgTm9kZSBiZWluZyBkcmFnZ2VkLCBpbiB2aWV3IGNvb3JkaW5hdGVzIHBlciBzZWNvbmRcclxuICBzaGlmdERyYWdWZWxvY2l0eTogMjAgLy8gdmVsb2NpdHkgd2l0aCB0aGUgU2hpZnQga2V5IHByZXNzZWQsIHR5cGljYWxseSBzbG93ZXIgdGhhbiBkcmFnVmVsb2NpdHlcclxufTtcclxuXHJcbmNvbnN0IE5VTUJFUl9DT05UUk9MX09QVElPTlM6IE51bWJlckNvbnRyb2xPcHRpb25zID0ge1xyXG4gIGxheW91dEZ1bmN0aW9uOiBOdW1iZXJDb250cm9sLmNyZWF0ZUxheW91dEZ1bmN0aW9uMyggeyB5U3BhY2luZzogMTIgfSApLFxyXG4gIHRpdGxlTm9kZU9wdGlvbnM6IHtcclxuICAgIGZvbnQ6IENPTlRST0xfRk9OVCxcclxuICAgIG1heFdpZHRoOiAxNDBcclxuICB9LFxyXG4gIHNsaWRlck9wdGlvbnM6IHtcclxuICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDE0MCwgNCApLFxyXG4gICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTUsIDMwICksXHJcbiAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogNSxcclxuICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiA1XHJcbiAgfSxcclxuICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgbWF4V2lkdGg6IDcwLFxyXG4gICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgZm9udDogQ09OVFJPTF9GT05UXHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgR09Db25zdGFudHMgPSB7XHJcblxyXG4gIFNDUkVFTl9WSUVXX1hfTUFSR0lOOiAyMCxcclxuICBTQ1JFRU5fVklFV19ZX01BUkdJTjogMTUsXHJcblxyXG4gIENSRURJVFM6IENSRURJVFMsXHJcblxyXG4gIC8vIE9iamVjdHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gQkVXQVJFISBHZXR0aW5nIHRvbyBjbG9zZSB0byB0aGUgb3B0aWMgd2lsbCByZXZlYWwgcHJvYmxlbXMgd2l0aCB0aGUgbW9kZWwuXHJcbiAgTUlOX0RJU1RBTkNFX0ZST01fT0JKRUNUX1RPX09QVElDOiA0MCwgLy8gY21cclxuICBNSU5fRElTVEFOQ0VfRlJPTV9PUFRJQ19UT19QUk9KRUNUSU9OX1NDUkVFTjogNjAsIC8vIGNtXHJcblxyXG4gIC8vIE1heGltdW0gZGlzdGFuY2UgdGhhdCBvYmplY3RzIGNhbiBiZSBkcmFnZ2VkIHZlcnRpY2FsbHkgZnJvbSB0aGUgb3B0aWNhbCBheGlzLCBpbiBjbS4gVGhpcyBpcyBjb25zdHJhaW5lZCB0b1xyXG4gIC8vIHByZXZlbnQgY2FzZXMgd2hlcmUgdGhlIG9wdGljYWwgb2JqZWN0IGlzIGNsb3NlIHRvIHRoZSBvcHRpYyBhbmQgbm8gJ01hbnknIHJheXMgZ28gdGhyb3VnaCB0aGUgb3B0aWMuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9nZW9tZXRyaWMtb3B0aWNzL2lzc3Vlcy8yODlcclxuICBNQVhfRElTVEFOQ0VfRlJPTV9PQkpFQ1RfVE9fT1BUSUNBTF9BWElTOiAxMDAsIC8vIGNtXHJcblxyXG4gIC8vIFJ1bGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gbW9kZWxcclxuICBIT1JJWk9OVEFMX1JVTEVSX0xFTkdUSDogMjYwLCAvLyBjbVxyXG4gIFZFUlRJQ0FMX1JVTEVSX0xFTkdUSDogMTYwLCAvLyBjbVxyXG5cclxuICAvLyB2aWV3XHJcbiAgUlVMRVJfSEVJR0hUOiA0MCwgLy8gaW4gdmlldyBjb29yZGluYXRlc1xyXG4gIFJVTEVSX01JTklNVU1fVklTSUJMRV9MRU5HVEg6IDQwLCAvLyBwb3J0aW9uIG9mIHRoZSBydWxlciBhbHdheXMgd2l0aGluIHZpc2libGUgYm91bmRzLCBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcblxyXG4gIC8vIERlY2ltYWwgcGxhY2VzIGFuZCBzdGVwcyBmb3IgY29udHJvbHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBGT0NBTF9MRU5HVEhfREVDSU1BTF9QTEFDRVM6IDAsXHJcbiAgRk9DQUxfTEVOR1RIX1NQSU5ORVJfU1RFUDogMSwgLy8gY21cclxuICBGT0NBTF9MRU5HVEhfU0xJREVSX1NURVA6IDUsIC8vIGNtXHJcbiAgRk9DQUxfTEVOR1RIX0tFWUJPQVJEX1NURVA6IDUsIC8vIGNtXHJcbiAgRk9DQUxfTEVOR1RIX1NISUZUX0tFWUJPQVJEX1NURVA6IDEsIC8vIGNtXHJcbiAgRk9DQUxfTEVOR1RIX1BBR0VfS0VZQk9BUkRfU1RFUDogMTAsIC8vIGNtXHJcblxyXG4gIFJBRElVU19PRl9DVVJWQVRVUkVfREVDSU1BTF9QTEFDRVM6IDAsXHJcbiAgUkFESVVTX09GX0NVUlZBVFVSRV9TUElOTkVSX1NURVA6IDEsIC8vIGNtXHJcbiAgUkFESVVTX09GX0NVUlZBVFVSRV9TTElERVJfU1RFUDogNSwgLy8gY21cclxuICBSQURJVVNfT0ZfQ1VSVkFUVVJFX0tFWUJPQVJEX1NURVA6IDUsIC8vIGNtXHJcbiAgUkFESVVTX09GX0NVUlZBVFVSRV9TSElGVF9LRVlCT0FSRF9TVEVQOiAxLCAvLyBjbVxyXG4gIFJBRElVU19PRl9DVVJWQVRVUkVfUEFHRV9LRVlCT0FSRF9TVEVQOiAxMCwgLy8gY21cclxuXHJcbiAgSU5ERVhfT0ZfUkVGUkFDVElPTl9ERUNJTUFMX1BMQUNFUzogMixcclxuICBJTkRFWF9PRl9SRUZSQUNUSU9OX1NQSU5ORVJfU1RFUDogMC4wMSxcclxuICBJTkRFWF9PRl9SRUZSQUNUSU9OX1NMSURFUl9TVEVQOiAwLjA1LFxyXG4gIElOREVYX09GX1JFRlJBQ1RJT05fS0VZQk9BUkRfU1RFUDogMC4wNSxcclxuICBJTkRFWF9PRl9SRUZSQUNUSU9OX1NISUZUX0tFWUJPQVJEX1NURVA6IDAuMDEsXHJcbiAgSU5ERVhfT0ZfUkVGUkFDVElPTl9QQUdFX0tFWUJPQVJEX1NURVA6IDAuMSxcclxuXHJcbiAgRElBTUVURVJfREVDSU1BTF9QTEFDRVM6IDAsXHJcbiAgRElBTUVURVJfU1BJTk5FUl9TVEVQOiAxLCAvLyBjbVxyXG4gIERJQU1FVEVSX1NMSURFUl9TVEVQOiA1LCAvLyBjbVxyXG4gIERJQU1FVEVSX0tFWUJPQVJEX1NURVA6IDUsIC8vIGNtXHJcbiAgRElBTUVURVJfU0hJRlRfS0VZQk9BUkRfU1RFUDogMSwgLy8gY21cclxuICBESUFNRVRFUl9QQUdFX0tFWUJPQVJEX1NURVA6IDEwLCAvLyBjbVxyXG5cclxuICAvLyBGb250cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIExBQkVMX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcclxuICBDT05UUk9MX0ZPTlQ6IENPTlRST0xfRk9OVCxcclxuICBUSVRMRV9GT05UOiBuZXcgUGhldEZvbnQoIHsgd2VpZ2h0OiAnYm9sZCcsIHNpemU6IDE0IH0gKSxcclxuXHJcbiAgLy8gTWlzYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBJTlRFTlNJVFlfUkFOR0U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gIE9QQUNJVFlfUkFOR0U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gIE1JTl9TQ0FMRTogMWUtNSwgLy8gdG8gcHJldmVudCB6ZXJvIHNjYWxpbmcsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2VvbWV0cmljLW9wdGljcy9pc3N1ZXMvMTU1XHJcbiAgTUlOX01BR05JVFVERTogMWUtNSwgLy8gdG8gcHJldmVudCB6ZXJvLW1hZ25pdHVkZSBBcnJvd05vZGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2VvbWV0cmljLW9wdGljcy9pc3N1ZXMvMzA2XHJcblxyXG4gIC8vIE9wdGlvbnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgQ0hFQ0tCT1hfQk9YX1dJRFRIOiAxNCxcclxuICBBUlJPV19OT0RFX09QVElPTlM6IEFSUk9XX05PREVfT1BUSU9OUyxcclxuICBLRVlCT0FSRF9EUkFHX0xJU1RFTkVSX09QVElPTlM6IEtFWUJPQVJEX0RSQUdfTElTVEVORVJfT1BUSU9OUyxcclxuICBOVU1CRVJfQ09OVFJPTF9PUFRJT05TOiBOVU1CRVJfQ09OVFJPTF9PUFRJT05TXHJcbn07XHJcblxyXG5nZW9tZXRyaWNPcHRpY3MucmVnaXN0ZXIoICdHT0NvbnN0YW50cycsIEdPQ29uc3RhbnRzICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdPQ29uc3RhbnRzO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLGVBQWUsTUFBTSx1QkFBdUI7QUFDbkQsT0FBT0MsYUFBYSxNQUFnQywyQ0FBMkM7QUFDL0YsT0FBT0MsVUFBVSxNQUFNLCtCQUErQjtBQUN0RCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBSzVDLE1BQU1DLFlBQVksR0FBRyxJQUFJTCxRQUFRLENBQUUsRUFBRyxDQUFDOztBQUV2QztBQUNBLE1BQU1NLE9BQW9CLEdBQUc7RUFDM0JDLFVBQVUsRUFBRSw4QkFBOEI7RUFDMUNDLG1CQUFtQixFQUFFLCtEQUErRDtFQUNwRkMsSUFBSSxFQUFFLHVFQUF1RTtFQUM3RUMsZ0JBQWdCLEVBQUUsNkZBQTZGO0VBQy9HQyxXQUFXLEVBQUU7QUFDZixDQUFDO0FBRUQsTUFBTUMsa0JBQW9DLEdBQUc7RUFDM0NDLFNB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