// Copyright 2021-2022, University of Colorado Boulder

/**
 * A point controller for all explore scenes.
 * Contains 'dropping' behaviour: if a point controller is dragged to a side of the play area, it 'drops' to the play
 * area rather than returning to the box.
 *
 * @author Saurabh Totey
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import numberLineDistance from '../../numberLineDistance.js';
import DropFromDirection from './DropFromDirection.js';

class ExplorePointController extends PointController {

  /**
   * @param {DropFromDirection} dropFromDirection
   * @param {Bounds2} playAreaBounds - the bounds where the point controller is considered to interact with the number line
   * @param {Object} [options]
   */
  constructor( dropFromDirection, playAreaBounds, options ) {
    super( options );

    // The dropping behaviour for #34: if the point controller is no longer being dragged but is in the relevant drop
    // direction, then propose a new position for it into the play area. No unlink necessary because the point controllers
    // are present for the sim's lifetime.
    this.isDraggingProperty.link( isDragging => {
      if ( isDragging ) {
        return;
      }
      const position = this.positionProperty.value;
      if ( dropFromDirection === DropFromDirection.TOP && position.y < playAreaBounds.minY &&
        playAreaBounds.minX <= position.x && position.x <= playAreaBounds.maxX ) {
        this.proposePosition( new Vector2( position.x, playAreaBounds.minY ) );
      }
      else if ( dropFromDirection === DropFromDirection.LEFT && position.x < playAreaBounds.minX &&
        playAreaBounds.minY <= position.y && position.y <= playAreaBounds.maxY ) {
        this.proposePosition( new Vector2( playAreaBounds.minX, position.y ) );
      }
    } );
  }

}

numberLineDistance.register( 'ExplorePointController', ExplorePointController );
export default ExplorePointController;
