// Copyright 2020-2022, University of Colorado Boulder

/**
 * A point controller for the temperature and elevation scenes of NLD that changes proposePosition so that the point
 * controllers can freely move and handle adding and removing points depending on whether they are in the play area.
 *
 * @author Saurabh Totey
 */

import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import merge from '../../../../phet-core/js/merge.js';
import numberLineDistance from '../../numberLineDistance.js';
import ExplorePointController from './ExplorePointController.js';

class AreaPointController extends ExplorePointController {

  /**
   * @param {DropFromDirection} dropFromDirection - the direction from which the point controller can 'drop' onto the
   * play area
   * @param {Bounds2} playAreaBounds - the bounds where the point controller is allowed to interact with the number line
   * by having a number line point. Is used to determine when to detach point controllers and when to use the default
   * proposePosition function. Points are only attached when they are 'in bounds'.
   * @param {Object} [options]
   */
  constructor( dropFromDirection, playAreaBounds, options ) {
    options = merge( { lockToNumberLine: LockToNumberLine.NEVER }, options );
    assert && assert(
      options.lockToNumberLine === LockToNumberLine.NEVER,
      'lockToNumberLine should only be set to NEVER if set'
    );

    super( dropFromDirection, playAreaBounds, options );

    // @public (read-only) {Bounds2}
    this.playAreaBounds = playAreaBounds;
  }

  /**
   * Changes proposePosition so that the point controller moves freely, but adds a number line point if it is in the play
   * area, and removes a number line point if not.
   *
   * @override
   * @param {Vector2} proposedPosition
   * @public
   */
  proposePosition( proposedPosition ) {
    if ( this.playAreaBounds.containsPoint( proposedPosition ) ) {
      if ( !this.isControllingNumberLinePoint() ) {
        const numberLinePoint = new NumberLinePoint( this.numberLines[ 0 ], {
          controller: this,
          initialValue: this.numberLines[ 0 ].getConstrainedValue(
            this.numberLines[ 0 ].modelPositionToValue( proposedPosition )
          ),
          initialColor: this.color
        } );
        this.numberLines[ 0 ].addPoint( numberLinePoint );
        this.associateWithNumberLinePoint( numberLinePoint );
      }
      super.proposePosition( proposedPosition );
    }
    else {
      if ( this.isControllingNumberLinePoint() ) {
        this.removeClearAndDisposePoints();
      }
      this.positionProperty.value = proposedPosition;
    }
  }

}

numberLineDistance.register( 'AreaPointController', AreaPointController );
export default AreaPointController;
