// Copyright 2016-2022, University of Colorado Boulder

/**
 * A convenience type that builds up a trig function as a label.  Normal text cannot be used because the desired look
 * of the label is a trig function and a theta symbol, where the theta symbol has a unique font style.  HTMLText
 * cannot be used for this because it is performance intensive for stings that are meant ot be dynamic.  The trig
 * function label should look something like 'cos θ' .
 *
 * @author Jesse Greenberg
 */

import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text } from '../../../../scenery/js/imports.js';
import trigTour from '../../trigTour.js';

// constants
const DISPLAY_FONT = new PhetFont({
  size: 20
});
const DISPLAY_FONT_ITALIC = new PhetFont({
  size: 20,
  style: 'italic'
});
class TrigFunctionLabelText extends HBox {
  /**
   * Constructor.
   *
   * @param {string} trigFunctionString - label for the trig function
   * @param {Object} [options]
   */
  constructor(trigFunctionString, options) {
    options = merge({
      trigFunctionLabelFont: DISPLAY_FONT,
      thetaLabelFont: DISPLAY_FONT_ITALIC
    }, options);

    // build the text for the trig function label
    const trigTitleText = new Text(trigFunctionString, {
      font: options.trigFunctionLabelFont
    });

    // create the text for the mathematical symbol theta
    const trigThetaText = new Text(MathSymbols.THETA, {
      font: options.thetaLabelFont
    });

    // build the text, placing both function and theta labels in an HBox
    super({
      children: [trigTitleText, trigThetaText],
      spacing: 0,
      resize: false
    });
  }
}
trigTour.register('TrigFunctionLabelText', TrigFunctionLabelText);
export default TrigFunctionLabelText;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIk1hdGhTeW1ib2xzIiwiUGhldEZvbnQiLCJIQm94IiwiVGV4dCIsInRyaWdUb3VyIiwiRElTUExBWV9GT05UIiwic2l6ZSIsIkRJU1BMQVlfRk9OVF9JVEFMSUMiLCJzdHlsZSIsIlRyaWdGdW5jdGlvbkxhYmVsVGV4dCIsImNvbnN0cnVjdG9yIiwidHJpZ0Z1bmN0aW9uU3RyaW5nIiwib3B0aW9ucyIsInRyaWdGdW5jdGlvbkxhYmVsRm9udCIsInRoZXRhTGFiZWxGb250IiwidHJpZ1RpdGxlVGV4dCIsImZvbnQiLCJ0cmlnVGhldGFUZXh0IiwiVEhFVEEiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJyZXNpemUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRyaWdGdW5jdGlvbkxhYmVsVGV4dC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNvbnZlbmllbmNlIHR5cGUgdGhhdCBidWlsZHMgdXAgYSB0cmlnIGZ1bmN0aW9uIGFzIGEgbGFiZWwuICBOb3JtYWwgdGV4dCBjYW5ub3QgYmUgdXNlZCBiZWNhdXNlIHRoZSBkZXNpcmVkIGxvb2tcclxuICogb2YgdGhlIGxhYmVsIGlzIGEgdHJpZyBmdW5jdGlvbiBhbmQgYSB0aGV0YSBzeW1ib2wsIHdoZXJlIHRoZSB0aGV0YSBzeW1ib2wgaGFzIGEgdW5pcXVlIGZvbnQgc3R5bGUuICBIVE1MVGV4dFxyXG4gKiBjYW5ub3QgYmUgdXNlZCBmb3IgdGhpcyBiZWNhdXNlIGl0IGlzIHBlcmZvcm1hbmNlIGludGVuc2l2ZSBmb3Igc3RpbmdzIHRoYXQgYXJlIG1lYW50IG90IGJlIGR5bmFtaWMuICBUaGUgdHJpZ1xyXG4gKiBmdW5jdGlvbiBsYWJlbCBzaG91bGQgbG9vayBzb21ldGhpbmcgbGlrZSAnY29zIM64JyAuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSEJveCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB0cmlnVG91ciBmcm9tICcuLi8uLi90cmlnVG91ci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRElTUExBWV9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDIwIH0gKTtcclxuY29uc3QgRElTUExBWV9GT05UX0lUQUxJQyA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMCwgc3R5bGU6ICdpdGFsaWMnIH0gKTtcclxuXHJcbmNsYXNzIFRyaWdGdW5jdGlvbkxhYmVsVGV4dCBleHRlbmRzIEhCb3gge1xyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRyaWdGdW5jdGlvblN0cmluZyAtIGxhYmVsIGZvciB0aGUgdHJpZyBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdHJpZ0Z1bmN0aW9uU3RyaW5nLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB0cmlnRnVuY3Rpb25MYWJlbEZvbnQ6IERJU1BMQVlfRk9OVCxcclxuICAgICAgdGhldGFMYWJlbEZvbnQ6IERJU1BMQVlfRk9OVF9JVEFMSUNcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBidWlsZCB0aGUgdGV4dCBmb3IgdGhlIHRyaWcgZnVuY3Rpb24gbGFiZWxcclxuICAgIGNvbnN0IHRyaWdUaXRsZVRleHQgPSBuZXcgVGV4dCggdHJpZ0Z1bmN0aW9uU3RyaW5nLCB7IGZvbnQ6IG9wdGlvbnMudHJpZ0Z1bmN0aW9uTGFiZWxGb250IH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIHRleHQgZm9yIHRoZSBtYXRoZW1hdGljYWwgc3ltYm9sIHRoZXRhXHJcbiAgICBjb25zdCB0cmlnVGhldGFUZXh0ID0gbmV3IFRleHQoIE1hdGhTeW1ib2xzLlRIRVRBLCB7IGZvbnQ6IG9wdGlvbnMudGhldGFMYWJlbEZvbnQgfSApO1xyXG5cclxuICAgIC8vIGJ1aWxkIHRoZSB0ZXh0LCBwbGFjaW5nIGJvdGggZnVuY3Rpb24gYW5kIHRoZXRhIGxhYmVscyBpbiBhbiBIQm94XHJcbiAgICBzdXBlciggeyBjaGlsZHJlbjogWyB0cmlnVGl0bGVUZXh0LCB0cmlnVGhldGFUZXh0IF0sIHNwYWNpbmc6IDAsIHJlc2l6ZTogZmFsc2UgfSApO1xyXG5cclxuICB9XHJcbn1cclxuXHJcbnRyaWdUb3VyLnJlZ2lzdGVyKCAnVHJpZ0Z1bmN0aW9uTGFiZWxUZXh0JywgVHJpZ0Z1bmN0aW9uTGFiZWxUZXh0ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmlnRnVuY3Rpb25MYWJlbFRleHQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxRQUFRLE1BQU0sbUJBQW1COztBQUV4QztBQUNBLE1BQU1DLFlBQVksR0FBRyxJQUFJSixRQUFRLENBQUU7RUFBRUssSUFBSSxFQUFFO0FBQUcsQ0FBRSxDQUFDO0FBQ2pELE1BQU1DLG1CQUFtQixHQUFHLElBQUlOLFFBQVEsQ0FBRTtFQUFFSyxJQUFJLEVBQUUsRUFBRTtFQUFFRSxLQUFLLEVBQUU7QUFBUyxDQUFFLENBQUM7QUFFekUsTUFBTUMscUJBQXFCLFNBQVNQLElBQUksQ0FBQztFQUN2QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVEsV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUV6Q0EsT0FBTyxHQUFHYixLQUFLLENBQUU7TUFDZmMscUJBQXFCLEVBQUVSLFlBQVk7TUFDbkNTLGNBQWMsRUFBRVA7SUFDbEIsQ0FBQyxFQUFFSyxPQUFRLENBQUM7O0lBRVo7SUFDQSxNQUFNRyxhQUFhLEdBQUcsSUFBSVosSUFBSSxDQUFFUSxrQkFBa0IsRUFBRTtNQUFFSyxJQUFJLEVBQUVKLE9BQU8sQ0FBQ0M7SUFBc0IsQ0FBRSxDQUFDOztJQUU3RjtJQUNBLE1BQU1JLGFBQWEsR0FBRyxJQUFJZCxJQUFJLENBQUVILFdBQVcsQ0FBQ2tCLEtBQUssRUFBRTtNQUFFRixJQUFJLEVBQUVKLE9BQU8sQ0FBQ0U7SUFBZSxDQUFFLENBQUM7O0lBRXJGO0lBQ0EsS0FBSyxDQUFFO01BQUVLLFFBQVEsRUFBRSxDQUFFSixhQUFhLEVBQUVFLGFBQWEsQ0FBRTtNQUFFRyxPQUFPLEVBQUUsQ0FBQztNQUFFQyxNQUFNLEVBQUU7SUFBTSxDQUFFLENBQUM7RUFFcEY7QUFDRjtBQUVBakIsUUFBUSxDQUFDa0IsUUFBUSxDQUFFLHVCQUF1QixFQUFFYixxQkFBc0IsQ0FBQztBQUVuRSxlQUFlQSxxQkFBcUIifQ==