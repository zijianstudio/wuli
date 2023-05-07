// Copyright 2017-2022, University of Colorado Boulder

/**
 * Arrow node for sims that use inverse-square-law-common.  The arrow is scaled to represent the magnitude of the force,
 * and can change direction to represent repulsive and attractive forces.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import LinearFunction from '../../../dot/js/LinearFunction.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import ScientificNotationNode from '../../../scenery-phet/js/ScientificNotationNode.js';
import { Node, ReadingBlock, Rectangle, RichText } from '../../../scenery/js/imports.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
import InverseSquareLawCommonStrings from '../InverseSquareLawCommonStrings.js';
import ISLCConstants from '../ISLCConstants.js';
import DefaultDirection from './DefaultDirection.js';
const forceOnObjectByOtherObjectPatternString = InverseSquareLawCommonStrings.forceOnObjectByOtherObjectPattern;
const forceOnObjectByOtherObjectWithUnitsPatternString = InverseSquareLawCommonStrings.forceOnObjectByOtherObjectWithUnitsPattern;

// constants
const ARROW_LENGTH = 8; // empirically determined
const TEXT_OFFSET = 10; // empirically determined to make sure text does not go out of bounds

class ISLCForceArrowNode extends ReadingBlock(Node) {
  /**
   * @param {Range} arrowForceRange - the range in force magnitude
   * @param {Bounds2} layoutBounds
   * @param {string} label
   * @param {string} otherObjectLabel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(arrowForceRange, layoutBounds, label, otherObjectLabel, tandem, options) {
    options = merge({
      defaultDirection: DefaultDirection.LEFT,
      attractNegative: true,
      // if true, arrows will point towards each other if force is negative
      arrowNodeLineWidth: 0.25,
      // label options
      arrowLabelFont: new PhetFont(16),
      arrowLabelFill: '#fff',
      arrowLabelStroke: null,
      forceReadoutDecimalPlaces: ISLCConstants.DECIMAL_NOTATION_PRECISION,
      // number of decimal places in force readout

      // arrow node arguments
      forceArrowHeight: 150,
      // arrow node options
      maxArrowWidth: 15,
      // max width of the arrow when when redrawn, in view coordinates - used in mapping function
      minArrowWidth: 0,
      // Some ISLC sims support an object value of zero, setting this to zero supports this case.
      headHeight: 10.4,
      headWidth: 10.4,
      tailWidth: 3,
      arrowStroke: null,
      arrowFill: '#fff',
      backgroundFill: 'black',
      // arrow mapping function options
      // By default, only use a single mapping function to go from force to arrow width, but with this option and
      // those below use two.
      mapArrowWidthWithTwoFunctions: false,
      // only if mapArrowWidthWithTwoFunctions is true
      forceThresholdPercent: 0,
      // the percent to switch mappings from the min to the main linear function.
      thresholdArrowWidth: 1 // This default is used by GFL(B) as a good in between the min/max arrow widths.
    }, options);
    options.tandem = tandem;
    super(options);

    // @private
    this.layoutBounds = layoutBounds;
    this.defaultDirection = options.defaultDirection;
    this.forceReadoutDecimalPlaces = options.forceReadoutDecimalPlaces;
    this.label = label;
    this.otherObjectLabel = otherObjectLabel;
    this.scientificNotationMode = false;
    this.attractNegative = options.attractNegative;
    assert && options.mapArrowWidthWithTwoFunctions && assert(options.forceThresholdPercent !== 0, 'set forceThresholdPercent to map arrow width with two functions');
    const forceThreshold = arrowForceRange.min + arrowForceRange.getLength() * options.forceThresholdPercent;

    // Maps the force value to the desired width of the arrow in view coordinates. This mapping can be done
    // two ways. The first is with a single function (when `options.mapArrowWidthWithTwoFunctions` is set to false).
    // If that is the case, this is the only mapping function. This is to support single mapping in CL and multi mapping
    // in GFL(B). See https://github.com/phetsims/inverse-square-law-common/issues/76 for details on the design.
    const mainForceToArrowWidthFunction = new LinearFunction(forceThreshold, arrowForceRange.max, options.mapArrowWidthWithTwoFunctions ? options.thresholdArrowWidth : options.minArrowWidth, options.maxArrowWidth, false);

    // When `options.mapArrowWidthWithTwoFunctions` is true, this function will be used to map the arrow width
    // from the minimum to a specified percentage of the force range, see options.forceThresholdPercent.
    const minTwoForceToArrowWidthFunction = new LinearFunction(arrowForceRange.min, forceThreshold, options.minArrowWidth, options.thresholdArrowWidth, false);

    /**
     * Map a force value to an arrow width
     * @param {number} forceValue
     * @private
     */
    this.getLinearMappingToArrowWidth = forceValue => {
      const linearFunction = forceValue < forceThreshold ? minTwoForceToArrowWidthFunction : mainForceToArrowWidthFunction;
      return linearFunction.evaluate(forceValue);
    };

    // @public (read-only) - for layout, the label for the arrow
    this.arrowText = new RichText('', {
      font: options.arrowLabelFont,
      fill: options.arrowLabelFill,
      stroke: options.labelStroke,
      lineWidth: options.arrowNodeLineWidth,
      maxWidth: 300,
      // empirically determined through testing with long strings
      y: -20,
      tandem: tandem.createTandem('forceText'),
      phetioVisiblePropertyInstrumented: true,
      phetioDocumentation: 'This text updates from the model as the force changes, and cannot be edited.',
      stringPropertyOptions: {
        phetioReadOnly: true
      }
    });

    // @private - tip and tail set in redrawArrow
    this.arrow = new ArrowNode(0, -options.forceArrowHeight, 200, -options.forceArrowHeight, merge({
      lineWidth: options.arrowNodeLineWidth,
      stroke: options.arrowStroke,
      fill: options.arrowFill,
      tandem: tandem.createTandem('arrowNode')
    }, _.pick(options, ['headHeight', 'headWidth', 'tailWidth'])));

    // @private
    this.arrowTextBackground = new Rectangle(0, 0, 1000, 1000, {
      fill: options.backgroundFill,
      opacity: 0.3
    });
    this.addChild(this.arrowTextBackground);
    this.addChild(this.arrowText);
    this.addChild(this.arrow);
    this.y = 0;
  }

  /**
   * Draw the length of the arrow based on the value of the force.
   *
   * @public
   * @param {number} value
   */
  redrawArrow(value) {
    let arrowLengthMultiplier;
    let valueSign = value >= 0 ? 1 : -1;

    // if the arrows are meant to attract
    if (this.attractNegative) {
      valueSign *= -1;
    }
    const absValue = Math.abs(value);

    // map force value to width in view
    arrowLengthMultiplier = this.getLinearMappingToArrowWidth(absValue);
    if (this.defaultDirection === DefaultDirection.RIGHT) {
      arrowLengthMultiplier *= -1;
    }
    this.arrow.setTailAndTip(0, 0, valueSign * arrowLengthMultiplier * ARROW_LENGTH, 0);
  }

  /**
   * Set the arrow text position along the arrow, ensuring that the text does not go outside the layout bounds.
   *
   * @public
   * @param {Bounds2} parentToLocalBounds
   */
  setArrowTextPosition(parentToLocalBounds) {
    const arrowTextCenter = this.arrowText.center.copy();
    arrowTextCenter.x = 0;
    const localToParentPoint = this.localToParentPoint(arrowTextCenter);
    if (Math.floor(localToParentPoint.x - this.arrowText.width / 2) <= this.layoutBounds.left + TEXT_OFFSET) {
      this.arrowText.left = parentToLocalBounds.left + TEXT_OFFSET;
    } else if (Math.ceil(localToParentPoint.x + this.arrowText.width / 2) >= this.layoutBounds.right - TEXT_OFFSET) {
      this.arrowText.right = parentToLocalBounds.right - TEXT_OFFSET;
    } else {
      this.arrowText.center = arrowTextCenter;
    }

    // set the background layout too
    this.arrowTextBackground.rectWidth = this.arrowText.width + 4;
    this.arrowTextBackground.rectHeight = this.arrowText.height + 2;
    this.arrowTextBackground.center = this.arrowText.center;
  }

  /**
   * Update the force label string.
   *
   * @public
   * @param  {number} forceValue
   * @param  {boolean} forceValues
   */
  updateLabel(forceValue, forceValues) {
    if (forceValues) {
      const forceStr = Utils.toFixed(forceValue, this.scientificNotationMode ? ISLCConstants.SCIENTIFIC_NOTATION_PRECISION : this.forceReadoutDecimalPlaces);

      // group values together so that they are easy to read
      const pointPosition = forceStr.indexOf('.');
      if (pointPosition !== -1) {
        // the first group includes the values to the left of the decimal, and first three decimals
        let formattedString = forceStr.substr(0, pointPosition + 4);

        // remaining groups of three, separated by spaces
        for (let i = pointPosition + 4; i < forceStr.length; i += 3) {
          formattedString += ' ';
          formattedString += forceStr.substr(i, 3);
        }
        if (this.scientificNotationMode && forceValue !== 0) {
          const precision = ISLCConstants.SCIENTIFIC_NOTATION_PRECISION;
          const notationObject = ScientificNotationNode.toScientificNotation(forceValue, {
            mantissaDecimalPlaces: precision
          });
          formattedString = notationObject.mantissa;
          if (notationObject.exponent !== '0') {
            formattedString += ` ${MathSymbols.TIMES}`;
            formattedString += ` 10<sup>${notationObject.exponent}</sup>`;
          }
        }
        this.arrowText.string = StringUtils.fillIn(forceOnObjectByOtherObjectWithUnitsPatternString, {
          thisObject: this.label,
          otherObject: this.otherObjectLabel,
          value: formattedString
        });
      } else {
        throw new Error('ISLCForceArrowNode.updateLabel() requires a decimal value');
      }
    } else {
      this.arrowText.string = StringUtils.fillIn(forceOnObjectByOtherObjectPatternString, {
        thisObject: this.label,
        otherObject: this.otherObjectLabel
      });
    }
  }
}
inverseSquareLawCommon.register('ISLCForceArrowNode', ISLCForceArrowNode);
export default ISLCForceArrowNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJGdW5jdGlvbiIsIlV0aWxzIiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIkFycm93Tm9kZSIsIk1hdGhTeW1ib2xzIiwiUGhldEZvbnQiLCJTY2llbnRpZmljTm90YXRpb25Ob2RlIiwiTm9kZSIsIlJlYWRpbmdCbG9jayIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiaW52ZXJzZVNxdWFyZUxhd0NvbW1vbiIsIkludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzIiwiSVNMQ0NvbnN0YW50cyIsIkRlZmF1bHREaXJlY3Rpb24iLCJmb3JjZU9uT2JqZWN0QnlPdGhlck9iamVjdFBhdHRlcm5TdHJpbmciLCJmb3JjZU9uT2JqZWN0QnlPdGhlck9iamVjdFBhdHRlcm4iLCJmb3JjZU9uT2JqZWN0QnlPdGhlck9iamVjdFdpdGhVbml0c1BhdHRlcm5TdHJpbmciLCJmb3JjZU9uT2JqZWN0QnlPdGhlck9iamVjdFdpdGhVbml0c1BhdHRlcm4iLCJBUlJPV19MRU5HVEgiLCJURVhUX09GRlNFVCIsIklTTENGb3JjZUFycm93Tm9kZSIsImNvbnN0cnVjdG9yIiwiYXJyb3dGb3JjZVJhbmdlIiwibGF5b3V0Qm91bmRzIiwibGFiZWwiLCJvdGhlck9iamVjdExhYmVsIiwidGFuZGVtIiwib3B0aW9ucyIsImRlZmF1bHREaXJlY3Rpb24iLCJMRUZUIiwiYXR0cmFjdE5lZ2F0aXZlIiwiYXJyb3dOb2RlTGluZVdpZHRoIiwiYXJyb3dMYWJlbEZvbnQiLCJhcnJvd0xhYmVsRmlsbCIsImFycm93TGFiZWxTdHJva2UiLCJmb3JjZVJlYWRvdXREZWNpbWFsUGxhY2VzIiwiREVDSU1BTF9OT1RBVElPTl9QUkVDSVNJT04iLCJmb3JjZUFycm93SGVpZ2h0IiwibWF4QXJyb3dXaWR0aCIsIm1pbkFycm93V2lkdGgiLCJoZWFkSGVpZ2h0IiwiaGVhZFdpZHRoIiwidGFpbFdpZHRoIiwiYXJyb3dTdHJva2UiLCJhcnJvd0ZpbGwiLCJiYWNrZ3JvdW5kRmlsbCIsIm1hcEFycm93V2lkdGhXaXRoVHdvRnVuY3Rpb25zIiwiZm9yY2VUaHJlc2hvbGRQZXJjZW50IiwidGhyZXNob2xkQXJyb3dXaWR0aCIsInNjaWVudGlmaWNOb3RhdGlvbk1vZGUiLCJhc3NlcnQiLCJmb3JjZVRocmVzaG9sZCIsIm1pbiIsImdldExlbmd0aCIsIm1haW5Gb3JjZVRvQXJyb3dXaWR0aEZ1bmN0aW9uIiwibWF4IiwibWluVHdvRm9yY2VUb0Fycm93V2lkdGhGdW5jdGlvbiIsImdldExpbmVhck1hcHBpbmdUb0Fycm93V2lkdGgiLCJmb3JjZVZhbHVlIiwibGluZWFyRnVuY3Rpb24iLCJldmFsdWF0ZSIsImFycm93VGV4dCIsImZvbnQiLCJmaWxsIiwic3Ryb2tlIiwibGFiZWxTdHJva2UiLCJsaW5lV2lkdGgiLCJtYXhXaWR0aCIsInkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwic3RyaW5nUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJhcnJvdyIsIl8iLCJwaWNrIiwiYXJyb3dUZXh0QmFja2dyb3VuZCIsIm9wYWNpdHkiLCJhZGRDaGlsZCIsInJlZHJhd0Fycm93IiwidmFsdWUiLCJhcnJvd0xlbmd0aE11bHRpcGxpZXIiLCJ2YWx1ZVNpZ24iLCJhYnNWYWx1ZSIsIk1hdGgiLCJhYnMiLCJSSUdIVCIsInNldFRhaWxBbmRUaXAiLCJzZXRBcnJvd1RleHRQb3NpdGlvbiIsInBhcmVudFRvTG9jYWxCb3VuZHMiLCJhcnJvd1RleHRDZW50ZXIiLCJjZW50ZXIiLCJjb3B5IiwieCIsImxvY2FsVG9QYXJlbnRQb2ludCIsImZsb29yIiwid2lkdGgiLCJsZWZ0IiwiY2VpbCIsInJpZ2h0IiwicmVjdFdpZHRoIiwicmVjdEhlaWdodCIsImhlaWdodCIsInVwZGF0ZUxhYmVsIiwiZm9yY2VWYWx1ZXMiLCJmb3JjZVN0ciIsInRvRml4ZWQiLCJTQ0lFTlRJRklDX05PVEFUSU9OX1BSRUNJU0lPTiIsInBvaW50UG9zaXRpb24iLCJpbmRleE9mIiwiZm9ybWF0dGVkU3RyaW5nIiwic3Vic3RyIiwiaSIsImxlbmd0aCIsInByZWNpc2lvbiIsIm5vdGF0aW9uT2JqZWN0IiwidG9TY2llbnRpZmljTm90YXRpb24iLCJtYW50aXNzYURlY2ltYWxQbGFjZXMiLCJtYW50aXNzYSIsImV4cG9uZW50IiwiVElNRVMiLCJzdHJpbmciLCJmaWxsSW4iLCJ0aGlzT2JqZWN0Iiwib3RoZXJPYmplY3QiLCJFcnJvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSVNMQ0ZvcmNlQXJyb3dOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFycm93IG5vZGUgZm9yIHNpbXMgdGhhdCB1c2UgaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi4gIFRoZSBhcnJvdyBpcyBzY2FsZWQgdG8gcmVwcmVzZW50IHRoZSBtYWduaXR1ZGUgb2YgdGhlIGZvcmNlLFxyXG4gKiBhbmQgY2FuIGNoYW5nZSBkaXJlY3Rpb24gdG8gcmVwcmVzZW50IHJlcHVsc2l2ZSBhbmQgYXR0cmFjdGl2ZSBmb3JjZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi9kb3QvanMvTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQXJyb3dOb2RlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBTY2llbnRpZmljTm90YXRpb25Ob2RlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TY2llbnRpZmljTm90YXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVhZGluZ0Jsb2NrLCBSZWN0YW5nbGUsIFJpY2hUZXh0IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGludmVyc2VTcXVhcmVMYXdDb21tb24gZnJvbSAnLi4vaW52ZXJzZVNxdWFyZUxhd0NvbW1vbi5qcyc7XHJcbmltcG9ydCBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncyBmcm9tICcuLi9JbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBJU0xDQ29uc3RhbnRzIGZyb20gJy4uL0lTTENDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRGVmYXVsdERpcmVjdGlvbiBmcm9tICcuL0RlZmF1bHREaXJlY3Rpb24uanMnO1xyXG5cclxuY29uc3QgZm9yY2VPbk9iamVjdEJ5T3RoZXJPYmplY3RQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuZm9yY2VPbk9iamVjdEJ5T3RoZXJPYmplY3RQYXR0ZXJuO1xyXG5jb25zdCBmb3JjZU9uT2JqZWN0QnlPdGhlck9iamVjdFdpdGhVbml0c1BhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5mb3JjZU9uT2JqZWN0QnlPdGhlck9iamVjdFdpdGhVbml0c1BhdHRlcm47XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQVJST1dfTEVOR1RIID0gODsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5jb25zdCBURVhUX09GRlNFVCA9IDEwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIG1ha2Ugc3VyZSB0ZXh0IGRvZXMgbm90IGdvIG91dCBvZiBib3VuZHNcclxuXHJcbmNsYXNzIElTTENGb3JjZUFycm93Tm9kZSBleHRlbmRzIFJlYWRpbmdCbG9jayggTm9kZSApIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtSYW5nZX0gYXJyb3dGb3JjZVJhbmdlIC0gdGhlIHJhbmdlIGluIGZvcmNlIG1hZ25pdHVkZVxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gbGF5b3V0Qm91bmRzXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG90aGVyT2JqZWN0TGFiZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBhcnJvd0ZvcmNlUmFuZ2UsIGxheW91dEJvdW5kcywgbGFiZWwsIG90aGVyT2JqZWN0TGFiZWwsIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgZGVmYXVsdERpcmVjdGlvbjogRGVmYXVsdERpcmVjdGlvbi5MRUZULFxyXG4gICAgICBhdHRyYWN0TmVnYXRpdmU6IHRydWUsIC8vIGlmIHRydWUsIGFycm93cyB3aWxsIHBvaW50IHRvd2FyZHMgZWFjaCBvdGhlciBpZiBmb3JjZSBpcyBuZWdhdGl2ZVxyXG4gICAgICBhcnJvd05vZGVMaW5lV2lkdGg6IDAuMjUsXHJcblxyXG4gICAgICAvLyBsYWJlbCBvcHRpb25zXHJcbiAgICAgIGFycm93TGFiZWxGb250OiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgICAgIGFycm93TGFiZWxGaWxsOiAnI2ZmZicsXHJcbiAgICAgIGFycm93TGFiZWxTdHJva2U6IG51bGwsXHJcbiAgICAgIGZvcmNlUmVhZG91dERlY2ltYWxQbGFjZXM6IElTTENDb25zdGFudHMuREVDSU1BTF9OT1RBVElPTl9QUkVDSVNJT04sIC8vIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBpbiBmb3JjZSByZWFkb3V0XHJcblxyXG4gICAgICAvLyBhcnJvdyBub2RlIGFyZ3VtZW50c1xyXG4gICAgICBmb3JjZUFycm93SGVpZ2h0OiAxNTAsXHJcblxyXG4gICAgICAvLyBhcnJvdyBub2RlIG9wdGlvbnNcclxuICAgICAgbWF4QXJyb3dXaWR0aDogMTUsIC8vIG1heCB3aWR0aCBvZiB0aGUgYXJyb3cgd2hlbiB3aGVuIHJlZHJhd24sIGluIHZpZXcgY29vcmRpbmF0ZXMgLSB1c2VkIGluIG1hcHBpbmcgZnVuY3Rpb25cclxuICAgICAgbWluQXJyb3dXaWR0aDogMCwgLy8gU29tZSBJU0xDIHNpbXMgc3VwcG9ydCBhbiBvYmplY3QgdmFsdWUgb2YgemVybywgc2V0dGluZyB0aGlzIHRvIHplcm8gc3VwcG9ydHMgdGhpcyBjYXNlLlxyXG4gICAgICBoZWFkSGVpZ2h0OiAxMC40LFxyXG4gICAgICBoZWFkV2lkdGg6IDEwLjQsXHJcbiAgICAgIHRhaWxXaWR0aDogMyxcclxuICAgICAgYXJyb3dTdHJva2U6IG51bGwsXHJcbiAgICAgIGFycm93RmlsbDogJyNmZmYnLFxyXG4gICAgICBiYWNrZ3JvdW5kRmlsbDogJ2JsYWNrJyxcclxuXHJcbiAgICAgIC8vIGFycm93IG1hcHBpbmcgZnVuY3Rpb24gb3B0aW9uc1xyXG4gICAgICAvLyBCeSBkZWZhdWx0LCBvbmx5IHVzZSBhIHNpbmdsZSBtYXBwaW5nIGZ1bmN0aW9uIHRvIGdvIGZyb20gZm9yY2UgdG8gYXJyb3cgd2lkdGgsIGJ1dCB3aXRoIHRoaXMgb3B0aW9uIGFuZFxyXG4gICAgICAvLyB0aG9zZSBiZWxvdyB1c2UgdHdvLlxyXG4gICAgICBtYXBBcnJvd1dpZHRoV2l0aFR3b0Z1bmN0aW9uczogZmFsc2UsXHJcblxyXG4gICAgICAvLyBvbmx5IGlmIG1hcEFycm93V2lkdGhXaXRoVHdvRnVuY3Rpb25zIGlzIHRydWVcclxuICAgICAgZm9yY2VUaHJlc2hvbGRQZXJjZW50OiAwLCAvLyB0aGUgcGVyY2VudCB0byBzd2l0Y2ggbWFwcGluZ3MgZnJvbSB0aGUgbWluIHRvIHRoZSBtYWluIGxpbmVhciBmdW5jdGlvbi5cclxuICAgICAgdGhyZXNob2xkQXJyb3dXaWR0aDogMSAvLyBUaGlzIGRlZmF1bHQgaXMgdXNlZCBieSBHRkwoQikgYXMgYSBnb29kIGluIGJldHdlZW4gdGhlIG1pbi9tYXggYXJyb3cgd2lkdGhzLlxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIG9wdGlvbnMudGFuZGVtID0gdGFuZGVtO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubGF5b3V0Qm91bmRzID0gbGF5b3V0Qm91bmRzO1xyXG4gICAgdGhpcy5kZWZhdWx0RGlyZWN0aW9uID0gb3B0aW9ucy5kZWZhdWx0RGlyZWN0aW9uO1xyXG4gICAgdGhpcy5mb3JjZVJlYWRvdXREZWNpbWFsUGxhY2VzID0gb3B0aW9ucy5mb3JjZVJlYWRvdXREZWNpbWFsUGxhY2VzO1xyXG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgdGhpcy5vdGhlck9iamVjdExhYmVsID0gb3RoZXJPYmplY3RMYWJlbDtcclxuICAgIHRoaXMuc2NpZW50aWZpY05vdGF0aW9uTW9kZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5hdHRyYWN0TmVnYXRpdmUgPSBvcHRpb25zLmF0dHJhY3ROZWdhdGl2ZTtcclxuXHJcbiAgICBhc3NlcnQgJiYgb3B0aW9ucy5tYXBBcnJvd1dpZHRoV2l0aFR3b0Z1bmN0aW9ucyAmJiBhc3NlcnQoIG9wdGlvbnMuZm9yY2VUaHJlc2hvbGRQZXJjZW50ICE9PSAwLFxyXG4gICAgICAnc2V0IGZvcmNlVGhyZXNob2xkUGVyY2VudCB0byBtYXAgYXJyb3cgd2lkdGggd2l0aCB0d28gZnVuY3Rpb25zJyApO1xyXG5cclxuICAgIGNvbnN0IGZvcmNlVGhyZXNob2xkID0gYXJyb3dGb3JjZVJhbmdlLm1pbiArICggYXJyb3dGb3JjZVJhbmdlLmdldExlbmd0aCgpICogb3B0aW9ucy5mb3JjZVRocmVzaG9sZFBlcmNlbnQgKTtcclxuXHJcbiAgICAvLyBNYXBzIHRoZSBmb3JjZSB2YWx1ZSB0byB0aGUgZGVzaXJlZCB3aWR0aCBvZiB0aGUgYXJyb3cgaW4gdmlldyBjb29yZGluYXRlcy4gVGhpcyBtYXBwaW5nIGNhbiBiZSBkb25lXHJcbiAgICAvLyB0d28gd2F5cy4gVGhlIGZpcnN0IGlzIHdpdGggYSBzaW5nbGUgZnVuY3Rpb24gKHdoZW4gYG9wdGlvbnMubWFwQXJyb3dXaWR0aFdpdGhUd29GdW5jdGlvbnNgIGlzIHNldCB0byBmYWxzZSkuXHJcbiAgICAvLyBJZiB0aGF0IGlzIHRoZSBjYXNlLCB0aGlzIGlzIHRoZSBvbmx5IG1hcHBpbmcgZnVuY3Rpb24uIFRoaXMgaXMgdG8gc3VwcG9ydCBzaW5nbGUgbWFwcGluZyBpbiBDTCBhbmQgbXVsdGkgbWFwcGluZ1xyXG4gICAgLy8gaW4gR0ZMKEIpLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ludmVyc2Utc3F1YXJlLWxhdy1jb21tb24vaXNzdWVzLzc2IGZvciBkZXRhaWxzIG9uIHRoZSBkZXNpZ24uXHJcbiAgICBjb25zdCBtYWluRm9yY2VUb0Fycm93V2lkdGhGdW5jdGlvbiA9IG5ldyBMaW5lYXJGdW5jdGlvbiggZm9yY2VUaHJlc2hvbGQsIGFycm93Rm9yY2VSYW5nZS5tYXgsXHJcbiAgICAgIG9wdGlvbnMubWFwQXJyb3dXaWR0aFdpdGhUd29GdW5jdGlvbnMgPyBvcHRpb25zLnRocmVzaG9sZEFycm93V2lkdGggOiBvcHRpb25zLm1pbkFycm93V2lkdGgsIG9wdGlvbnMubWF4QXJyb3dXaWR0aCwgZmFsc2UgKTtcclxuXHJcbiAgICAvLyBXaGVuIGBvcHRpb25zLm1hcEFycm93V2lkdGhXaXRoVHdvRnVuY3Rpb25zYCBpcyB0cnVlLCB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgdXNlZCB0byBtYXAgdGhlIGFycm93IHdpZHRoXHJcbiAgICAvLyBmcm9tIHRoZSBtaW5pbXVtIHRvIGEgc3BlY2lmaWVkIHBlcmNlbnRhZ2Ugb2YgdGhlIGZvcmNlIHJhbmdlLCBzZWUgb3B0aW9ucy5mb3JjZVRocmVzaG9sZFBlcmNlbnQuXHJcbiAgICBjb25zdCBtaW5Ud29Gb3JjZVRvQXJyb3dXaWR0aEZ1bmN0aW9uID0gbmV3IExpbmVhckZ1bmN0aW9uKCBhcnJvd0ZvcmNlUmFuZ2UubWluLCBmb3JjZVRocmVzaG9sZCxcclxuICAgICAgb3B0aW9ucy5taW5BcnJvd1dpZHRoLCBvcHRpb25zLnRocmVzaG9sZEFycm93V2lkdGgsIGZhbHNlICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXAgYSBmb3JjZSB2YWx1ZSB0byBhbiBhcnJvdyB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZvcmNlVmFsdWVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZ2V0TGluZWFyTWFwcGluZ1RvQXJyb3dXaWR0aCA9IGZvcmNlVmFsdWUgPT4ge1xyXG4gICAgICBjb25zdCBsaW5lYXJGdW5jdGlvbiA9IGZvcmNlVmFsdWUgPCBmb3JjZVRocmVzaG9sZCA/IG1pblR3b0ZvcmNlVG9BcnJvd1dpZHRoRnVuY3Rpb24gOiBtYWluRm9yY2VUb0Fycm93V2lkdGhGdW5jdGlvbjtcclxuICAgICAgcmV0dXJuIGxpbmVhckZ1bmN0aW9uLmV2YWx1YXRlKCBmb3JjZVZhbHVlICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBmb3IgbGF5b3V0LCB0aGUgbGFiZWwgZm9yIHRoZSBhcnJvd1xyXG4gICAgdGhpcy5hcnJvd1RleHQgPSBuZXcgUmljaFRleHQoICcnLCB7XHJcbiAgICAgIGZvbnQ6IG9wdGlvbnMuYXJyb3dMYWJlbEZvbnQsXHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuYXJyb3dMYWJlbEZpbGwsXHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5sYWJlbFN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmFycm93Tm9kZUxpbmVXaWR0aCxcclxuICAgICAgbWF4V2lkdGg6IDMwMCwgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0aHJvdWdoIHRlc3Rpbmcgd2l0aCBsb25nIHN0cmluZ3NcclxuICAgICAgeTogLTIwLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmb3JjZVRleHQnICksXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoaXMgdGV4dCB1cGRhdGVzIGZyb20gdGhlIG1vZGVsIGFzIHRoZSBmb3JjZSBjaGFuZ2VzLCBhbmQgY2Fubm90IGJlIGVkaXRlZC4nLFxyXG4gICAgICBzdHJpbmdQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGlwIGFuZCB0YWlsIHNldCBpbiByZWRyYXdBcnJvd1xyXG4gICAgdGhpcy5hcnJvdyA9IG5ldyBBcnJvd05vZGUoIDAsIC1vcHRpb25zLmZvcmNlQXJyb3dIZWlnaHQsIDIwMCwgLW9wdGlvbnMuZm9yY2VBcnJvd0hlaWdodCwgbWVyZ2UoIHtcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmFycm93Tm9kZUxpbmVXaWR0aCxcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmFycm93U3Ryb2tlLFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmFycm93RmlsbCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXJyb3dOb2RlJyApXHJcbiAgICB9LCBfLnBpY2soIG9wdGlvbnMsIFsgJ2hlYWRIZWlnaHQnLCAnaGVhZFdpZHRoJywgJ3RhaWxXaWR0aCcgXSApICkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5hcnJvd1RleHRCYWNrZ3JvdW5kID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwMCwgMTAwMCwgeyBmaWxsOiBvcHRpb25zLmJhY2tncm91bmRGaWxsLCBvcGFjaXR5OiAwLjMgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5hcnJvd1RleHRCYWNrZ3JvdW5kICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5hcnJvd1RleHQgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYXJyb3cgKTtcclxuXHJcbiAgICB0aGlzLnkgPSAwO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXcgdGhlIGxlbmd0aCBvZiB0aGUgYXJyb3cgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBmb3JjZS5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICAgKi9cclxuICByZWRyYXdBcnJvdyggdmFsdWUgKSB7XHJcbiAgICBsZXQgYXJyb3dMZW5ndGhNdWx0aXBsaWVyO1xyXG5cclxuICAgIGxldCB2YWx1ZVNpZ24gPSB2YWx1ZSA+PSAwID8gMSA6IC0xO1xyXG5cclxuICAgIC8vIGlmIHRoZSBhcnJvd3MgYXJlIG1lYW50IHRvIGF0dHJhY3RcclxuICAgIGlmICggdGhpcy5hdHRyYWN0TmVnYXRpdmUgKSB7XHJcbiAgICAgIHZhbHVlU2lnbiAqPSAtMTtcclxuICAgIH1cclxuICAgIGNvbnN0IGFic1ZhbHVlID0gTWF0aC5hYnMoIHZhbHVlICk7XHJcblxyXG4gICAgLy8gbWFwIGZvcmNlIHZhbHVlIHRvIHdpZHRoIGluIHZpZXdcclxuICAgIGFycm93TGVuZ3RoTXVsdGlwbGllciA9IHRoaXMuZ2V0TGluZWFyTWFwcGluZ1RvQXJyb3dXaWR0aCggYWJzVmFsdWUgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuZGVmYXVsdERpcmVjdGlvbiA9PT0gRGVmYXVsdERpcmVjdGlvbi5SSUdIVCApIHtcclxuICAgICAgYXJyb3dMZW5ndGhNdWx0aXBsaWVyICo9IC0xO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYXJyb3cuc2V0VGFpbEFuZFRpcCggMCwgMCwgdmFsdWVTaWduICogYXJyb3dMZW5ndGhNdWx0aXBsaWVyICogQVJST1dfTEVOR1RILCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGFycm93IHRleHQgcG9zaXRpb24gYWxvbmcgdGhlIGFycm93LCBlbnN1cmluZyB0aGF0IHRoZSB0ZXh0IGRvZXMgbm90IGdvIG91dHNpZGUgdGhlIGxheW91dCBib3VuZHMuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBwYXJlbnRUb0xvY2FsQm91bmRzXHJcbiAgICovXHJcbiAgc2V0QXJyb3dUZXh0UG9zaXRpb24oIHBhcmVudFRvTG9jYWxCb3VuZHMgKSB7XHJcbiAgICBjb25zdCBhcnJvd1RleHRDZW50ZXIgPSB0aGlzLmFycm93VGV4dC5jZW50ZXIuY29weSgpO1xyXG4gICAgYXJyb3dUZXh0Q2VudGVyLnggPSAwO1xyXG4gICAgY29uc3QgbG9jYWxUb1BhcmVudFBvaW50ID0gdGhpcy5sb2NhbFRvUGFyZW50UG9pbnQoIGFycm93VGV4dENlbnRlciApO1xyXG4gICAgaWYgKCBNYXRoLmZsb29yKCBsb2NhbFRvUGFyZW50UG9pbnQueCAtIHRoaXMuYXJyb3dUZXh0LndpZHRoIC8gMiApIDw9IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyBURVhUX09GRlNFVCApIHtcclxuICAgICAgdGhpcy5hcnJvd1RleHQubGVmdCA9IHBhcmVudFRvTG9jYWxCb3VuZHMubGVmdCArIFRFWFRfT0ZGU0VUO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIE1hdGguY2VpbCggbG9jYWxUb1BhcmVudFBvaW50LnggKyB0aGlzLmFycm93VGV4dC53aWR0aCAvIDIgKSA+PSB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIFRFWFRfT0ZGU0VUICkge1xyXG4gICAgICB0aGlzLmFycm93VGV4dC5yaWdodCA9IHBhcmVudFRvTG9jYWxCb3VuZHMucmlnaHQgLSBURVhUX09GRlNFVDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmFycm93VGV4dC5jZW50ZXIgPSBhcnJvd1RleHRDZW50ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0IHRoZSBiYWNrZ3JvdW5kIGxheW91dCB0b29cclxuICAgIHRoaXMuYXJyb3dUZXh0QmFja2dyb3VuZC5yZWN0V2lkdGggPSB0aGlzLmFycm93VGV4dC53aWR0aCArIDQ7XHJcbiAgICB0aGlzLmFycm93VGV4dEJhY2tncm91bmQucmVjdEhlaWdodCA9IHRoaXMuYXJyb3dUZXh0LmhlaWdodCArIDI7XHJcbiAgICB0aGlzLmFycm93VGV4dEJhY2tncm91bmQuY2VudGVyID0gdGhpcy5hcnJvd1RleHQuY2VudGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBmb3JjZSBsYWJlbCBzdHJpbmcuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmb3JjZVZhbHVlXHJcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gZm9yY2VWYWx1ZXNcclxuICAgKi9cclxuICB1cGRhdGVMYWJlbCggZm9yY2VWYWx1ZSwgZm9yY2VWYWx1ZXMgKSB7XHJcblxyXG4gICAgaWYgKCBmb3JjZVZhbHVlcyApIHtcclxuICAgICAgY29uc3QgZm9yY2VTdHIgPSBVdGlscy50b0ZpeGVkKCBmb3JjZVZhbHVlLCB0aGlzLnNjaWVudGlmaWNOb3RhdGlvbk1vZGUgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElTTENDb25zdGFudHMuU0NJRU5USUZJQ19OT1RBVElPTl9QUkVDSVNJT04gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VSZWFkb3V0RGVjaW1hbFBsYWNlcyApO1xyXG5cclxuICAgICAgLy8gZ3JvdXAgdmFsdWVzIHRvZ2V0aGVyIHNvIHRoYXQgdGhleSBhcmUgZWFzeSB0byByZWFkXHJcbiAgICAgIGNvbnN0IHBvaW50UG9zaXRpb24gPSBmb3JjZVN0ci5pbmRleE9mKCAnLicgKTtcclxuICAgICAgaWYgKCBwb2ludFBvc2l0aW9uICE9PSAtMSApIHtcclxuXHJcbiAgICAgICAgLy8gdGhlIGZpcnN0IGdyb3VwIGluY2x1ZGVzIHRoZSB2YWx1ZXMgdG8gdGhlIGxlZnQgb2YgdGhlIGRlY2ltYWwsIGFuZCBmaXJzdCB0aHJlZSBkZWNpbWFsc1xyXG4gICAgICAgIGxldCBmb3JtYXR0ZWRTdHJpbmcgPSBmb3JjZVN0ci5zdWJzdHIoIDAsIHBvaW50UG9zaXRpb24gKyA0ICk7XHJcblxyXG4gICAgICAgIC8vIHJlbWFpbmluZyBncm91cHMgb2YgdGhyZWUsIHNlcGFyYXRlZCBieSBzcGFjZXNcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IHBvaW50UG9zaXRpb24gKyA0OyBpIDwgZm9yY2VTdHIubGVuZ3RoOyBpICs9IDMgKSB7XHJcbiAgICAgICAgICBmb3JtYXR0ZWRTdHJpbmcgKz0gJyAnO1xyXG4gICAgICAgICAgZm9ybWF0dGVkU3RyaW5nICs9IGZvcmNlU3RyLnN1YnN0ciggaSwgMyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLnNjaWVudGlmaWNOb3RhdGlvbk1vZGUgJiYgZm9yY2VWYWx1ZSAhPT0gMCApIHtcclxuICAgICAgICAgIGNvbnN0IHByZWNpc2lvbiA9IElTTENDb25zdGFudHMuU0NJRU5USUZJQ19OT1RBVElPTl9QUkVDSVNJT047XHJcbiAgICAgICAgICBjb25zdCBub3RhdGlvbk9iamVjdCA9IFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIGZvcmNlVmFsdWUsIHsgbWFudGlzc2FEZWNpbWFsUGxhY2VzOiBwcmVjaXNpb24gfSApO1xyXG4gICAgICAgICAgZm9ybWF0dGVkU3RyaW5nID0gbm90YXRpb25PYmplY3QubWFudGlzc2E7XHJcblxyXG4gICAgICAgICAgaWYgKCBub3RhdGlvbk9iamVjdC5leHBvbmVudCAhPT0gJzAnICkge1xyXG4gICAgICAgICAgICBmb3JtYXR0ZWRTdHJpbmcgKz0gYCAke01hdGhTeW1ib2xzLlRJTUVTfWA7XHJcbiAgICAgICAgICAgIGZvcm1hdHRlZFN0cmluZyArPSBgIDEwPHN1cD4ke25vdGF0aW9uT2JqZWN0LmV4cG9uZW50fTwvc3VwPmA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFycm93VGV4dC5zdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIGZvcmNlT25PYmplY3RCeU90aGVyT2JqZWN0V2l0aFVuaXRzUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgdGhpc09iamVjdDogdGhpcy5sYWJlbCxcclxuICAgICAgICAgIG90aGVyT2JqZWN0OiB0aGlzLm90aGVyT2JqZWN0TGFiZWwsXHJcbiAgICAgICAgICB2YWx1ZTogZm9ybWF0dGVkU3RyaW5nXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ0lTTENGb3JjZUFycm93Tm9kZS51cGRhdGVMYWJlbCgpIHJlcXVpcmVzIGEgZGVjaW1hbCB2YWx1ZScgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuYXJyb3dUZXh0LnN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggZm9yY2VPbk9iamVjdEJ5T3RoZXJPYmplY3RQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgdGhpc09iamVjdDogdGhpcy5sYWJlbCxcclxuICAgICAgICBvdGhlck9iamVjdDogdGhpcy5vdGhlck9iamVjdExhYmVsXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmludmVyc2VTcXVhcmVMYXdDb21tb24ucmVnaXN0ZXIoICdJU0xDRm9yY2VBcnJvd05vZGUnLCBJU0xDRm9yY2VBcnJvd05vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IElTTENGb3JjZUFycm93Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sbUNBQW1DO0FBQzlELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLHNCQUFzQixNQUFNLG9EQUFvRDtBQUN2RixTQUFTQyxJQUFJLEVBQUVDLFlBQVksRUFBRUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsZ0NBQWdDO0FBQ3hGLE9BQU9DLHNCQUFzQixNQUFNLDhCQUE4QjtBQUNqRSxPQUFPQyw2QkFBNkIsTUFBTSxxQ0FBcUM7QUFDL0UsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQUMvQyxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFFcEQsTUFBTUMsdUNBQXVDLEdBQUdILDZCQUE2QixDQUFDSSxpQ0FBaUM7QUFDL0csTUFBTUMsZ0RBQWdELEdBQUdMLDZCQUE2QixDQUFDTSwwQ0FBMEM7O0FBRWpJO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLE1BQU1DLFdBQVcsR0FBRyxFQUFFLENBQUMsQ0FBQzs7QUFFeEIsTUFBTUMsa0JBQWtCLFNBQVNiLFlBQVksQ0FBRUQsSUFBSyxDQUFDLENBQUM7RUFFcEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFZSxXQUFXQSxDQUFFQyxlQUFl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