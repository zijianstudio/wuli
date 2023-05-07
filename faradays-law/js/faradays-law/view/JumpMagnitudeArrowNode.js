// Copyright 2018-2022, University of Colorado Boulder

/**
 * A node that provides a visual cue for the speed of the magnet once the key is released.
 * The number of arrows displayed corresponds to the speed.
 *
 * @author Michael Barlow
 */

import { Shape } from '../../../../kite/js/imports.js';
import { HBox, Node, Path } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';

// constants
const ARROW_HEIGHT = 20; // dimensions for the arrow
const ARROW_WIDTH = 1 / 2 * Math.sqrt( 3 ) * ARROW_HEIGHT; // for equilateral triangle
const ARROW_SPACING = 5;
const NODE_PADDING = 8;

// possible directions or the directional cues
const DIRECTION_ANGLES = {
  left: -Math.PI / 2,
  right: Math.PI / 2
};

class JumpMagnitudeArrowNode extends Node {

  /**
   * @param {String} direction
   * @param {Object} [options]
   */
  constructor( direction, options ) {
    super();

    this.arrows = [];

    while ( this.arrows.length < 3 ) {
      this.arrows.push( JumpMagnitudeArrowNode.createArrow( direction ) );
    }

    const arrowsContainer = new HBox( {
      children: this.arrows,
      spacing: ARROW_SPACING,
      excludeInvisibleChildrenFromBounds: false
    } );

    if ( direction === 'left' ) {
      this.arrows = this.arrows.reverse();
    }

    this.addChild( arrowsContainer );

    // position the arrows
    this.setKeyPositions = nodeBounds => {
      if ( direction === 'left' ) {
        arrowsContainer.rightCenter = nodeBounds.leftCenter.plusXY( -NODE_PADDING, 0 );
      }
      else {
        arrowsContainer.leftCenter = nodeBounds.rightCenter.plusXY( NODE_PADDING, 0 );
      }
    };
  }

  /**
   * @param {number} magnitude
   * @public
   */
  showCue( magnitude ) {
    assert && assert( magnitude <= this.arrows.length );
    for ( let i = 0; i < magnitude; i++ ) {
      this.arrows[ i ].visible = true;
    }
  }

  /**
   * @public
   */
  hideCue() {
    for ( let i = 0; i < this.arrows.length; i++ ) {
      this.arrows[ i ].visible = false;
    }
  }

  /**
   * @param direction
   * @returns {Path}
   * @private
   */
  static createArrow( direction ) {
    const arrowShape = new Shape();
    arrowShape.moveTo( ARROW_HEIGHT / 2, 0 ).lineTo( ARROW_HEIGHT, ARROW_WIDTH ).lineTo( 0, ARROW_WIDTH ).close();
    const arrowIcon = new Path( arrowShape, {
      fill: 'white',
      stroke: 'black',
      lineJoin: 'bevel',
      lineCap: 'butt',
      lineWidth: 2,
      rotation: DIRECTION_ANGLES[ direction ]
    } );

    arrowIcon.visible = false;

    return arrowIcon;
  }
}

faradaysLaw.register( 'JumpMagnitudeArrowNode', JumpMagnitudeArrowNode );
export default JumpMagnitudeArrowNode;