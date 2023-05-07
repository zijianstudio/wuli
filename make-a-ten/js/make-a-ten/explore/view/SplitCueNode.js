// Copyright 2016-2023, University of Colorado Boulder

/**
 * Cue that informs the user they can drag from the upper-half to split (pull apart) numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import CountingCommonConstants from '../../../../../counting-common/js/common/CountingCommonConstants.js';
import hand_png from '../../../../../scenery-phet/images/hand_png.js';
import ArrowNode from '../../../../../scenery-phet/js/ArrowNode.js';
import { Color, Image, Node, Rectangle } from '../../../../../scenery/js/imports.js';
import makeATen from '../../../makeATen.js';

class SplitCueNode extends Node {
  /**
   * @param {Cue} cue - Our cue model
   */
  constructor( cue ) {
    super( {
      pickable: false,
      usesOpacity: true
    } );

    // @private {Cue}
    this.cue = cue;

    const arrowOptions = {
      fill: CountingCommonConstants.CUE_FILL,
      stroke: null,
      headHeight: 14,
      headWidth: 22,
      tailWidth: 9,
      x: 7,
      y: 3
    };

    this.seeThroughRectangle = new Rectangle( 0, 0, 100, 100, {
      fill: new Color( CountingCommonConstants.CUE_FILL ).withAlpha( 0.2 )
    } );
    this.addChild( this.seeThroughRectangle );

    this.arrowContainer = new Node( {
      children: [
        new ArrowNode( 0, 0, 30, -30, arrowOptions ),
        new Image( hand_png, {
          scale: 0.3,
          rotation: Math.PI / 6 - Math.PI / 5
        } )
      ]
    } );
    this.addChild( this.arrowContainer );

    const updatePositionListener = this.updatePosition.bind( this );
    const updateRectangleListener = this.updateRectangle.bind( this );

    cue.visibilityProperty.linkAttribute( this, 'visible' );
    cue.opacityProperty.linkAttribute( this, 'opacity' );
    cue.visibilityProperty.link( updatePositionListener ); // update position when we become visible
    cue.countingObjectProperty.link( ( newCountingObject, oldCountingObject ) => {
      if ( newCountingObject ) {
        newCountingObject.positionProperty.link( updatePositionListener ); // translation
        newCountingObject.numberValueProperty.link( updatePositionListener ); // may have changed bounds
        newCountingObject.numberValueProperty.link( updateRectangleListener ); // may have changed bounds
      }
      if ( oldCountingObject ) {
        oldCountingObject.numberValueProperty.unlink( updateRectangleListener );
        oldCountingObject.numberValueProperty.unlink( updatePositionListener );
        oldCountingObject.positionProperty.unlink( updatePositionListener );
      }
    } );
  }

  /**
   * Updates the position of the cue.
   * @private
   */
  updatePosition() {
    const visible = this.cue.visibilityProperty.value;
    const countingObject = this.cue.countingObjectProperty.value;

    if ( visible && countingObject ) {
      const position = countingObject.positionProperty.value;
      this.setTranslation( position );
      this.arrowContainer.setTranslation( countingObject.localBounds.right - 22, countingObject.localBounds.top + 15 );
    }
  }

  /**
   * Updates the size of the semi-transparent rectangle.
   * TODO: This function should know about the size of the countingObject's handle instead of using getBoundaryY, see
   *  https://github.com/phetsims/counting-common/issues/13
   * @private
   */
  updateRectangle() {
    const countingObject = this.cue.countingObjectProperty.value;

    if ( countingObject ) {
      this.seeThroughRectangle.setRectBounds( countingObject.localBounds.withMaxY( countingObject.getBoundaryY() ) );
    }
  }
}

makeATen.register( 'SplitCueNode', SplitCueNode );

export default SplitCueNode;