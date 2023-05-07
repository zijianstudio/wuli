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

class ISLCForceArrowNode extends ReadingBlock( Node ) {

  /**
   * @param {Range} arrowForceRange - the range in force magnitude
   * @param {Bounds2} layoutBounds
   * @param {string} label
   * @param {string} otherObjectLabel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( arrowForceRange, layoutBounds, label, otherObjectLabel, tandem, options ) {

    options = merge( {
      defaultDirection: DefaultDirection.LEFT,
      attractNegative: true, // if true, arrows will point towards each other if force is negative
      arrowNodeLineWidth: 0.25,

      // label options
      arrowLabelFont: new PhetFont( 16 ),
      arrowLabelFill: '#fff',
      arrowLabelStroke: null,
      forceReadoutDecimalPlaces: ISLCConstants.DECIMAL_NOTATION_PRECISION, // number of decimal places in force readout

      // arrow node arguments
      forceArrowHeight: 150,

      // arrow node options
      maxArrowWidth: 15, // max width of the arrow when when redrawn, in view coordinates - used in mapping function
      minArrowWidth: 0, // Some ISLC sims support an object value of zero, setting this to zero supports this case.
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
      forceThresholdPercent: 0, // the percent to switch mappings from the min to the main linear function.
      thresholdArrowWidth: 1 // This default is used by GFL(B) as a good in between the min/max arrow widths.
    }, options );

    options.tandem = tandem;

    super( options );

    // @private
    this.layoutBounds = layoutBounds;
    this.defaultDirection = options.defaultDirection;
    this.forceReadoutDecimalPlaces = options.forceReadoutDecimalPlaces;
    this.label = label;
    this.otherObjectLabel = otherObjectLabel;
    this.scientificNotationMode = false;
    this.attractNegative = options.attractNegative;

    assert && options.mapArrowWidthWithTwoFunctions && assert( options.forceThresholdPercent !== 0,
      'set forceThresholdPercent to map arrow width with two functions' );

    const forceThreshold = arrowForceRange.min + ( arrowForceRange.getLength() * options.forceThresholdPercent );

    // Maps the force value to the desired width of the arrow in view coordinates. This mapping can be done
    // two ways. The first is with a single function (when `options.mapArrowWidthWithTwoFunctions` is set to false).
    // If that is the case, this is the only mapping function. This is to support single mapping in CL and multi mapping
    // in GFL(B). See https://github.com/phetsims/inverse-square-law-common/issues/76 for details on the design.
    const mainForceToArrowWidthFunction = new LinearFunction( forceThreshold, arrowForceRange.max,
      options.mapArrowWidthWithTwoFunctions ? options.thresholdArrowWidth : options.minArrowWidth, options.maxArrowWidth, false );

    // When `options.mapArrowWidthWithTwoFunctions` is true, this function will be used to map the arrow width
    // from the minimum to a specified percentage of the force range, see options.forceThresholdPercent.
    const minTwoForceToArrowWidthFunction = new LinearFunction( arrowForceRange.min, forceThreshold,
      options.minArrowWidth, options.thresholdArrowWidth, false );

    /**
     * Map a force value to an arrow width
     * @param {number} forceValue
     * @private
     */
    this.getLinearMappingToArrowWidth = forceValue => {
      const linearFunction = forceValue < forceThreshold ? minTwoForceToArrowWidthFunction : mainForceToArrowWidthFunction;
      return linearFunction.evaluate( forceValue );
    };

    // @public (read-only) - for layout, the label for the arrow
    this.arrowText = new RichText( '', {
      font: options.arrowLabelFont,
      fill: options.arrowLabelFill,
      stroke: options.labelStroke,
      lineWidth: options.arrowNodeLineWidth,
      maxWidth: 300, // empirically determined through testing with long strings
      y: -20,
      tandem: tandem.createTandem( 'forceText' ),
      phetioVisiblePropertyInstrumented: true,
      phetioDocumentation: 'This text updates from the model as the force changes, and cannot be edited.',
      stringPropertyOptions: { phetioReadOnly: true }
    } );

    // @private - tip and tail set in redrawArrow
    this.arrow = new ArrowNode( 0, -options.forceArrowHeight, 200, -options.forceArrowHeight, merge( {
      lineWidth: options.arrowNodeLineWidth,
      stroke: options.arrowStroke,
      fill: options.arrowFill,
      tandem: tandem.createTandem( 'arrowNode' )
    }, _.pick( options, [ 'headHeight', 'headWidth', 'tailWidth' ] ) ) );

    // @private
    this.arrowTextBackground = new Rectangle( 0, 0, 1000, 1000, { fill: options.backgroundFill, opacity: 0.3 } );
    this.addChild( this.arrowTextBackground );

    this.addChild( this.arrowText );
    this.addChild( this.arrow );

    this.y = 0;
  }


  /**
   * Draw the length of the arrow based on the value of the force.
   *
   * @public
   * @param {number} value
   */
  redrawArrow( value ) {
    let arrowLengthMultiplier;

    let valueSign = value >= 0 ? 1 : -1;

    // if the arrows are meant to attract
    if ( this.attractNegative ) {
      valueSign *= -1;
    }
    const absValue = Math.abs( value );

    // map force value to width in view
    arrowLengthMultiplier = this.getLinearMappingToArrowWidth( absValue );

    if ( this.defaultDirection === DefaultDirection.RIGHT ) {
      arrowLengthMultiplier *= -1;
    }

    this.arrow.setTailAndTip( 0, 0, valueSign * arrowLengthMultiplier * ARROW_LENGTH, 0 );
  }

  /**
   * Set the arrow text position along the arrow, ensuring that the text does not go outside the layout bounds.
   *
   * @public
   * @param {Bounds2} parentToLocalBounds
   */
  setArrowTextPosition( parentToLocalBounds ) {
    const arrowTextCenter = this.arrowText.center.copy();
    arrowTextCenter.x = 0;
    const localToParentPoint = this.localToParentPoint( arrowTextCenter );
    if ( Math.floor( localToParentPoint.x - this.arrowText.width / 2 ) <= this.layoutBounds.left + TEXT_OFFSET ) {
      this.arrowText.left = parentToLocalBounds.left + TEXT_OFFSET;
    }
    else if ( Math.ceil( localToParentPoint.x + this.arrowText.width / 2 ) >= this.layoutBounds.right - TEXT_OFFSET ) {
      this.arrowText.right = parentToLocalBounds.right - TEXT_OFFSET;
    }
    else {
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
  updateLabel( forceValue, forceValues ) {

    if ( forceValues ) {
      const forceStr = Utils.toFixed( forceValue, this.scientificNotationMode ?
                                                  ISLCConstants.SCIENTIFIC_NOTATION_PRECISION :
                                                  this.forceReadoutDecimalPlaces );

      // group values together so that they are easy to read
      const pointPosition = forceStr.indexOf( '.' );
      if ( pointPosition !== -1 ) {

        // the first group includes the values to the left of the decimal, and first three decimals
        let formattedString = forceStr.substr( 0, pointPosition + 4 );

        // remaining groups of three, separated by spaces
        for ( let i = pointPosition + 4; i < forceStr.length; i += 3 ) {
          formattedString += ' ';
          formattedString += forceStr.substr( i, 3 );
        }

        if ( this.scientificNotationMode && forceValue !== 0 ) {
          const precision = ISLCConstants.SCIENTIFIC_NOTATION_PRECISION;
          const notationObject = ScientificNotationNode.toScientificNotation( forceValue, { mantissaDecimalPlaces: precision } );
          formattedString = notationObject.mantissa;

          if ( notationObject.exponent !== '0' ) {
            formattedString += ` ${MathSymbols.TIMES}`;
            formattedString += ` 10<sup>${notationObject.exponent}</sup>`;
          }
        }

        this.arrowText.string = StringUtils.fillIn( forceOnObjectByOtherObjectWithUnitsPatternString, {
          thisObject: this.label,
          otherObject: this.otherObjectLabel,
          value: formattedString
        } );
      }
      else {
        throw new Error( 'ISLCForceArrowNode.updateLabel() requires a decimal value' );
      }
    }
    else {
      this.arrowText.string = StringUtils.fillIn( forceOnObjectByOtherObjectPatternString, {
        thisObject: this.label,
        otherObject: this.otherObjectLabel
      } );
    }
  }
}

inverseSquareLawCommon.register( 'ISLCForceArrowNode', ISLCForceArrowNode );

export default ISLCForceArrowNode;