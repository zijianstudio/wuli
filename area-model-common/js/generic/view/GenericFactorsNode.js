// Copyright 2017-2022, University of Colorado Boulder

/**
 * Displays the main factors (horizontal sum and vertical sum)
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import validate from '../../../../axon/js/validate.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { AlignBox, HBox, Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

// constants
const BOX_SIZE = 30;
const PAREN_BOUNDS = new Text( ')(', {
  font: AreaModelCommonConstants.FACTORS_PAREN_FONT,
  boundsMethod: 'accurate'
} ).bounds;

class GenericFactorsNode extends AlignBox {
  /**
   * @param {OrientationPair.<Property.<TermList|null>>} displayProperties - The term lists to be displayed
   * @param {Property.<boolean>} allowExponentsProperty - Whether exponents (powers of x) are allowed
   */
  constructor( displayProperties, allowExponentsProperty ) {

    const readouts = displayProperties.map( ( displayProperty, orientation ) => GenericFactorsNode.createOrientationReadout( orientation, displayProperty ) );

    const leftParenText = new Text( '(', { font: AreaModelCommonConstants.FACTORS_PAREN_FONT } );
    const middleParenText = new Text( ')(', { font: AreaModelCommonConstants.FACTORS_PAREN_FONT } );
    const rightParenText = new Text( ')', { font: AreaModelCommonConstants.FACTORS_PAREN_FONT } );
    const xText = new Text( MathSymbols.TIMES, { font: AreaModelCommonConstants.FACTORS_TERM_FONT } );

    // Have the X take up at least the same vertical bounds as the parentheses
    xText.localBounds = xText.localBounds.union(
      new Bounds2( 0, middleParenText.localBounds.minY, 0, middleParenText.localBounds.maxY )
    );

    // Center the box vertically, so that when maxWidth kicks in, we stay vertically centered in our area of the box
    const box = new HBox( {
      spacing: 10,
      align: 'origin'
    } );

    allowExponentsProperty.link( allowExponents => {
      box.children = allowExponents ? [
        leftParenText,
        readouts.vertical,
        middleParenText,
        readouts.horizontal,
        rightParenText
      ] : [
        readouts.vertical,
        xText,
        readouts.horizontal
      ];
    } );

    const spacer = new Node();

    super( new Node( {
      children: [ box, spacer ],
      maxWidth: AreaModelCommonConstants.PANEL_INTERIOR_MAX
    } ) );

    // Set our alignBounds to the maximum size we can be, so that we remain centered nicely in the accordion box.
    allowExponentsProperty.link( allowExponents => {
      const maxBounds = Bounds2.NOTHING.copy();
      maxBounds.includeBounds( new RichText( allowExponents ? 'x<sup>2</sup>' : 'x', {
        font: AreaModelCommonConstants.FACTORS_TERM_FONT
      } ).bounds );
      maxBounds.includeBounds( PAREN_BOUNDS );

      this.alignBounds = new Bounds2( 0, 0, AreaModelCommonConstants.PANEL_INTERIOR_MAX, maxBounds.height );
      spacer.localBounds = new Bounds2( 0, maxBounds.minY, 0, maxBounds.maxY );
    } );
  }

  /**
   * Creates a readout for the total sum for a particular orientation.
   * @private
   *
   * @param {Orientation} orientation
   * @param {Property.<TermList|null>} displayProperty
   * @returns {Node}
   */
  static createOrientationReadout( orientation, displayProperty ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );

    const colorProperty = AreaModelCommonColors.genericColorProperties.get( orientation );

    const richText = new RichText( '', {
      font: AreaModelCommonConstants.FACTORS_TERM_FONT,
      fill: colorProperty
    } );

    const box = new Rectangle( 0, 0, BOX_SIZE, BOX_SIZE, {
      stroke: colorProperty,
      centerY: PAREN_BOUNDS.centerY // So that it is perfectly vertically aligned
    } );

    const node = new Node();
    displayProperty.link( termList => {
      if ( termList === null ) {
        node.children = [ box ];
      }
      else {
        richText.string = termList.toRichString();
        node.children = [ richText ];
      }
    } );

    return node;
  }
}

areaModelCommon.register( 'GenericFactorsNode', GenericFactorsNode );

export default GenericFactorsNode;