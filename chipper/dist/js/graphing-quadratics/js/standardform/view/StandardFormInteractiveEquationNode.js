// Copyright 2018-2023, University of Colorado Boulder

/**
 * Standard form equation, y = ax^2 + bx + c, with integer coefficients that can be changed via pickers.
 *
 * @author Andrea Lin
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Node, RichText } from '../../../../scenery/js/imports.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import GQSymbols from '../../common/GQSymbols.js';
import graphingQuadratics from '../../graphingQuadratics.js';
export default class StandardFormInteractiveEquationNode extends Node {
  /**
   * Constructor parameters are coefficients of the standard form: y = ax^2 + bx + c
   */
  constructor(aProperty, bProperty, cProperty, tandem) {
    const options = {
      tandem: tandem,
      phetioDocumentation: 'the interactive equation in this accordion box'
    };

    // coefficient pickers
    const aPicker = new NumberPicker(aProperty, new Property(aProperty.range), merge({
      color: GQColors.STANDARD_FORM_A,
      tandem: tandem.createTandem('aPicker'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.PICKER_DOC, {
        symbol: 'a'
      })
    }, GQConstants.NUMBER_PICKER_OPTIONS));
    const bPicker = new NumberPicker(bProperty, new Property(bProperty.range), merge({
      color: GQColors.STANDARD_FORM_B,
      tandem: tandem.createTandem('bPicker'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.PICKER_DOC, {
        symbol: 'b'
      })
    }, GQConstants.NUMBER_PICKER_OPTIONS));
    const cPicker = new NumberPicker(cProperty, new Property(cProperty.range), merge({
      color: GQColors.STANDARD_FORM_C,
      tandem: tandem.createTandem('cPicker'),
      phetioDocumentation: StringUtils.fillIn(GQConstants.PICKER_DOC, {
        symbol: 'c'
      })
    }, GQConstants.NUMBER_PICKER_OPTIONS));

    // static parts of the equation
    const richTextOptions = {
      font: GQConstants.INTERACTIVE_EQUATION_FONT
    };
    const xyOptions = merge({}, richTextOptions, {
      maxWidth: 30 // determined empirically
    });

    const yText = new RichText(GQSymbols.y, xyOptions);
    const equalToText = new RichText(MathSymbols.EQUAL_TO, richTextOptions);
    const xSquaredText = new RichText(GQSymbols.xSquared, xyOptions);
    const plusText = new RichText(MathSymbols.PLUS, richTextOptions);
    const xText = new RichText(GQSymbols.x, xyOptions);
    const secondPlusText = new RichText(MathSymbols.PLUS, richTextOptions);
    options.children = [yText, equalToText, aPicker, xSquaredText, plusText, bPicker, xText, secondPlusText, cPicker];
    super(options);

    // layout
    equalToText.left = yText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    aPicker.left = equalToText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    xSquaredText.left = aPicker.right + GQConstants.EQUATION_TERM_SPACING;
    plusText.left = xSquaredText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    bPicker.left = plusText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    xText.left = bPicker.right + GQConstants.EQUATION_TERM_SPACING;
    secondPlusText.left = xText.right + GQConstants.EQUATION_OPERATOR_SPACING;
    cPicker.left = secondPlusText.right + GQConstants.EQUATION_OPERATOR_SPACING;

    // vertically center pickers on equals
    aPicker.centerY = equalToText.centerY;
    bPicker.centerY = equalToText.centerY;
    cPicker.centerY = equalToText.centerY;
  }
}
graphingQuadratics.register('StandardFormInteractiveEquationNode', StandardFormInteractiveEquationNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJNYXRoU3ltYm9scyIsIk5vZGUiLCJSaWNoVGV4dCIsIk51bWJlclBpY2tlciIsIkdRQ29sb3JzIiwiR1FDb25zdGFudHMiLCJHUVN5bWJvbHMiLCJncmFwaGluZ1F1YWRyYXRpY3MiLCJTdGFuZGFyZEZvcm1JbnRlcmFjdGl2ZUVxdWF0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwiYVByb3BlcnR5IiwiYlByb3BlcnR5IiwiY1Byb3BlcnR5IiwidGFuZGVtIiwib3B0aW9ucyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJhUGlja2VyIiwicmFuZ2UiLCJjb2xvciIsIlNUQU5EQVJEX0ZPUk1fQSIsImNyZWF0ZVRhbmRlbSIsImZpbGxJbiIsIlBJQ0tFUl9ET0MiLCJzeW1ib2wiLCJOVU1CRVJfUElDS0VSX09QVElPTlMiLCJiUGlja2VyIiwiU1RBTkRBUkRfRk9STV9CIiwiY1BpY2tlciIsIlNUQU5EQVJEX0ZPUk1fQyIsInJpY2hUZXh0T3B0aW9ucyIsImZvbnQiLCJJTlRFUkFDVElWRV9FUVVBVElPTl9GT05UIiwieHlPcHRpb25zIiwibWF4V2lkdGgiLCJ5VGV4dCIsInkiLCJlcXVhbFRvVGV4dCIsIkVRVUFMX1RPIiwieFNxdWFyZWRUZXh0IiwieFNxdWFyZWQiLCJwbHVzVGV4dCIsIlBMVVMiLCJ4VGV4dCIsIngiLCJzZWNvbmRQbHVzVGV4dCIsImNoaWxkcmVuIiwibGVmdCIsInJpZ2h0IiwiRVFVQVRJT05fT1BFUkFUT1JfU1BBQ0lORyIsIkVRVUFUSU9OX1RFUk1fU1BBQ0lORyIsImNlbnRlclkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0YW5kYXJkRm9ybUludGVyYWN0aXZlRXF1YXRpb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN0YW5kYXJkIGZvcm0gZXF1YXRpb24sIHkgPSBheF4yICsgYnggKyBjLCB3aXRoIGludGVnZXIgY29lZmZpY2llbnRzIHRoYXQgY2FuIGJlIGNoYW5nZWQgdmlhIHBpY2tlcnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpblxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUmljaFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGlja2VyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9OdW1iZXJQaWNrZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgR1FDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0dRQ29sb3JzLmpzJztcclxuaW1wb3J0IEdRQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9HUUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHUVN5bWJvbHMgZnJvbSAnLi4vLi4vY29tbW9uL0dRU3ltYm9scy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YW5kYXJkRm9ybUludGVyYWN0aXZlRXF1YXRpb25Ob2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIHBhcmFtZXRlcnMgYXJlIGNvZWZmaWNpZW50cyBvZiB0aGUgc3RhbmRhcmQgZm9ybTogeSA9IGF4XjIgKyBieCArIGNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIGJQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIGNQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnM6IE5vZGVPcHRpb25zID0ge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBpbnRlcmFjdGl2ZSBlcXVhdGlvbiBpbiB0aGlzIGFjY29yZGlvbiBib3gnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNvZWZmaWNpZW50IHBpY2tlcnNcclxuICAgIGNvbnN0IGFQaWNrZXIgPSBuZXcgTnVtYmVyUGlja2VyKCBhUHJvcGVydHksIG5ldyBQcm9wZXJ0eSggYVByb3BlcnR5LnJhbmdlICksXHJcbiAgICAgIG1lcmdlKCB7XHJcbiAgICAgICAgY29sb3I6IEdRQ29sb3JzLlNUQU5EQVJEX0ZPUk1fQSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhUGlja2VyJyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IFN0cmluZ1V0aWxzLmZpbGxJbiggR1FDb25zdGFudHMuUElDS0VSX0RPQywgeyBzeW1ib2w6ICdhJyB9IClcclxuICAgICAgfSwgR1FDb25zdGFudHMuTlVNQkVSX1BJQ0tFUl9PUFRJT05TICkgKTtcclxuICAgIGNvbnN0IGJQaWNrZXIgPSBuZXcgTnVtYmVyUGlja2VyKCBiUHJvcGVydHksIG5ldyBQcm9wZXJ0eSggYlByb3BlcnR5LnJhbmdlICksXHJcbiAgICAgIG1lcmdlKCB7XHJcbiAgICAgICAgY29sb3I6IEdRQ29sb3JzLlNUQU5EQVJEX0ZPUk1fQixcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiUGlja2VyJyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IFN0cmluZ1V0aWxzLmZpbGxJbiggR1FDb25zdGFudHMuUElDS0VSX0RPQywgeyBzeW1ib2w6ICdiJyB9IClcclxuICAgICAgfSwgR1FDb25zdGFudHMuTlVNQkVSX1BJQ0tFUl9PUFRJT05TICkgKTtcclxuICAgIGNvbnN0IGNQaWNrZXIgPSBuZXcgTnVtYmVyUGlja2VyKCBjUHJvcGVydHksIG5ldyBQcm9wZXJ0eSggY1Byb3BlcnR5LnJhbmdlICksXHJcbiAgICAgIG1lcmdlKCB7XHJcbiAgICAgICAgY29sb3I6IEdRQ29sb3JzLlNUQU5EQVJEX0ZPUk1fQyxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjUGlja2VyJyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IFN0cmluZ1V0aWxzLmZpbGxJbiggR1FDb25zdGFudHMuUElDS0VSX0RPQywgeyBzeW1ib2w6ICdjJyB9IClcclxuICAgICAgfSwgR1FDb25zdGFudHMuTlVNQkVSX1BJQ0tFUl9PUFRJT05TICkgKTtcclxuXHJcbiAgICAvLyBzdGF0aWMgcGFydHMgb2YgdGhlIGVxdWF0aW9uXHJcbiAgICBjb25zdCByaWNoVGV4dE9wdGlvbnMgPSB7XHJcbiAgICAgIGZvbnQ6IEdRQ29uc3RhbnRzLklOVEVSQUNUSVZFX0VRVUFUSU9OX0ZPTlRcclxuICAgIH07XHJcbiAgICBjb25zdCB4eU9wdGlvbnMgPSBtZXJnZSgge30sIHJpY2hUZXh0T3B0aW9ucywge1xyXG4gICAgICBtYXhXaWR0aDogMzAgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgeVRleHQgPSBuZXcgUmljaFRleHQoIEdRU3ltYm9scy55LCB4eU9wdGlvbnMgKTtcclxuICAgIGNvbnN0IGVxdWFsVG9UZXh0ID0gbmV3IFJpY2hUZXh0KCBNYXRoU3ltYm9scy5FUVVBTF9UTywgcmljaFRleHRPcHRpb25zICk7XHJcbiAgICBjb25zdCB4U3F1YXJlZFRleHQgPSBuZXcgUmljaFRleHQoIEdRU3ltYm9scy54U3F1YXJlZCwgeHlPcHRpb25zICk7XHJcbiAgICBjb25zdCBwbHVzVGV4dCA9IG5ldyBSaWNoVGV4dCggTWF0aFN5bWJvbHMuUExVUywgcmljaFRleHRPcHRpb25zICk7XHJcbiAgICBjb25zdCB4VGV4dCA9IG5ldyBSaWNoVGV4dCggR1FTeW1ib2xzLngsIHh5T3B0aW9ucyApO1xyXG4gICAgY29uc3Qgc2Vjb25kUGx1c1RleHQgPSBuZXcgUmljaFRleHQoIE1hdGhTeW1ib2xzLlBMVVMsIHJpY2hUZXh0T3B0aW9ucyApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIHlUZXh0LCBlcXVhbFRvVGV4dCwgYVBpY2tlciwgeFNxdWFyZWRUZXh0LCBwbHVzVGV4dCwgYlBpY2tlciwgeFRleHQsIHNlY29uZFBsdXNUZXh0LCBjUGlja2VyXHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gbGF5b3V0XHJcbiAgICBlcXVhbFRvVGV4dC5sZWZ0ID0geVRleHQucmlnaHQgKyBHUUNvbnN0YW50cy5FUVVBVElPTl9PUEVSQVRPUl9TUEFDSU5HO1xyXG4gICAgYVBpY2tlci5sZWZ0ID0gZXF1YWxUb1RleHQucmlnaHQgKyBHUUNvbnN0YW50cy5FUVVBVElPTl9PUEVSQVRPUl9TUEFDSU5HO1xyXG4gICAgeFNxdWFyZWRUZXh0LmxlZnQgPSBhUGlja2VyLnJpZ2h0ICsgR1FDb25zdGFudHMuRVFVQVRJT05fVEVSTV9TUEFDSU5HO1xyXG4gICAgcGx1c1RleHQubGVmdCA9IHhTcXVhcmVkVGV4dC5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX09QRVJBVE9SX1NQQUNJTkc7XHJcbiAgICBiUGlja2VyLmxlZnQgPSBwbHVzVGV4dC5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX09QRVJBVE9SX1NQQUNJTkc7XHJcbiAgICB4VGV4dC5sZWZ0ID0gYlBpY2tlci5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX1RFUk1fU1BBQ0lORztcclxuICAgIHNlY29uZFBsdXNUZXh0LmxlZnQgPSB4VGV4dC5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX09QRVJBVE9SX1NQQUNJTkc7XHJcbiAgICBjUGlja2VyLmxlZnQgPSBzZWNvbmRQbHVzVGV4dC5yaWdodCArIEdRQ29uc3RhbnRzLkVRVUFUSU9OX09QRVJBVE9SX1NQQUNJTkc7XHJcblxyXG4gICAgLy8gdmVydGljYWxseSBjZW50ZXIgcGlja2VycyBvbiBlcXVhbHNcclxuICAgIGFQaWNrZXIuY2VudGVyWSA9IGVxdWFsVG9UZXh0LmNlbnRlclk7XHJcbiAgICBiUGlja2VyLmNlbnRlclkgPSBlcXVhbFRvVGV4dC5jZW50ZXJZO1xyXG4gICAgY1BpY2tlci5jZW50ZXJZID0gZXF1YWxUb1RleHQuY2VudGVyWTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nUXVhZHJhdGljcy5yZWdpc3RlciggJ1N0YW5kYXJkRm9ybUludGVyYWN0aXZlRXF1YXRpb25Ob2RlJywgU3RhbmRhcmRGb3JtSW50ZXJhY3RpdmVFcXVhdGlvbk5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxTQUFTQyxJQUFJLEVBQWVDLFFBQVEsUUFBUSxtQ0FBbUM7QUFDL0UsT0FBT0MsWUFBWSxNQUFN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