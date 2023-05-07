// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays numbers for each square of a unit size.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

// constants
const scratchVector = new Vector2( 0, 0 ); // Created so we can minimize object creation and garbage collection

class CountingAreaNode extends Node {
  /**
   * @param {OrientationPair.<Property.<number>>} activeTotalProperties
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {Property.<boolean>} countingVisibleProperty
   */
  constructor( activeTotalProperties, modelViewTransformProperty, countingVisibleProperty ) {

    super();

    // @private {OrientationPair.<Property.<number>>}
    this.activeTotalProperties = activeTotalProperties;

    // @private {Property.<ModelViewTransform2>}
    this.modelViewTransformProperty = modelViewTransformProperty;

    // @private {Property.<boolean>}
    this.countingVisibleProperty = countingVisibleProperty;

    // @private {Array.<Text>} - We reuse these to avoid GC/performance issues
    this.textNodes = [];

    // @private {boolean} - Whether we should be redrawn
    this.dirty = true;

    // Things we depend on
    const invalidate = () => {
      this.dirty = true;
    };

    countingVisibleProperty.link( invalidate );
    activeTotalProperties.horizontal.link( invalidate );
    activeTotalProperties.vertical.link( invalidate );
    modelViewTransformProperty.link( invalidate );

    countingVisibleProperty.linkAttribute( this, 'visible' );
  }

  /**
   * Creates a reusable text node with a given number.
   * @private
   *
   * @param {number} number
   * @returns {Text}
   */
  createTextNode( number ) {
    const text = new Text( number, {
      font: AreaModelCommonConstants.COUNTING_FONT,
      fill: AreaModelCommonColors.countingLabelProperty
    } );
    this.textNodes.push( text );
    this.addChild( text );
    return text;
  }

  /**
   * Returns the reusable text node with a given number.
   * @private
   *
   * @param {number} number
   * @returns {Text}
   */
  getTextNode( number ) {
    let text = this.textNodes[ number - 1 ];
    if ( !text ) {
      text = this.createTextNode( number );
    }
    return text;
  }

  /**
   * Updates the view for tiled areas (since it is somewhat expensive to re-draw, and we don't want it being done
   * multiple times per frame.
   * @private
   */
  update() {
    const modelViewTransform = this.modelViewTransformProperty.value;

    // Ignore updates if we are not dirty
    if ( !this.dirty ) { return; }
    this.dirty = false;

    if ( !this.countingVisibleProperty.value ) { return; }

    // Coordinate mapping into the view
    const modelToViewX = modelViewTransform.modelToViewX.bind( modelViewTransform );
    const modelToViewY = modelViewTransform.modelToViewY.bind( modelViewTransform );

    const width = this.activeTotalProperties.horizontal.value;
    const height = this.activeTotalProperties.vertical.value;

    let cellNumber = 1;
    for ( let row = 0; row < height; row++ ) {
      const rowCenter = modelToViewY( row + 0.5 );

      for ( let col = 0; col < width; col++ ) {
        const colCenter = modelToViewX( col + 0.5 );

        const text = this.getTextNode( cellNumber );
        text.center = scratchVector.setXY( colCenter, rowCenter );
        text.visible = true;

        cellNumber++;
      }
    }

    // Hide the rest of the text nodes (that should NOT show up)
    for ( ; cellNumber - 1 < this.textNodes.length; cellNumber++ ) {
      this.textNodes[ cellNumber - 1 ].visible = false;
    }
  }
}

areaModelCommon.register( 'CountingAreaNode', CountingAreaNode );

export default CountingAreaNode;