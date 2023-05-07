// Copyright 2021-2022, University of Colorado Boulder

/**
 * A point controller for the distance scene of NLD that locks on to the numberline when in the sidewalk's bounds, and
 * unlocks when outside. Must be separate from AreaPointController because it cannot move freely within the play area,
 * but must rather lock onto a specific height when in the play area.
 *
 * @author Saurabh Totey
 */

import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import numberLineDistance from '../../numberLineDistance.js';
import DropFromDirection from './DropFromDirection.js';
import ExplorePointController from './ExplorePointController.js';

class DistancePointController extends ExplorePointController {

  /**
   * @param {SpatializedNumberLine} numberLine
   * @param {Bounds2} lockingBounds - the point controller will lock on to the number line if in the bounds
   * @param {number} lockHeight
   * @param {number} scaleInBox
   */
  constructor( numberLine, lockingBounds, lockHeight, scaleInBox ) {
    super( DropFromDirection.TOP, lockingBounds, {
      numberLines: [ numberLine ],
      lockToNumberLine: LockToNumberLine.WHEN_CLOSE,
      offsetFromHorizontalNumberLine: lockHeight,
      scaleInBox: scaleInBox
    } );

    // @private {Bounds2} the bounds for when the point controller will lock onto the number line
    this.lockingBounds = lockingBounds;
  }

  /**
   * Performs the normal proposePosition assuming that this only has one number line and is always
   * locked to the number line when close. There is a small change that the locking behaviour
   * doesn't depend on distance from the number line but rather on whether this point controller is
   * within the play area.
   *
   * @override
   * @param {Vector2} proposedPosition
   * @public
   */
  proposePosition( proposedPosition ) {
    if ( this.isControllingNumberLinePoint() ) {
      const point = this.numberLinePoints[ 0 ];
      const proposedNumberLineValue = point.numberLine.modelPositionToValue( proposedPosition );

      // Determine whether to propose a new value for the point or to detach and remove the point.
      if ( this.lockingBounds.containsPoint( proposedPosition ) ) {
        point.proposeValue( proposedNumberLineValue );
      }
      else {
        point.numberLine.removePoint( point );
        this.dissociateFromNumberLinePoint( point );
      }
    }
    else {

      // Check if a point should be created and added based on the proposed position.
      if ( this.lockingBounds.containsPoint( proposedPosition ) ) {
        const numberLine = this.numberLines[ 0 ];
        const constrainedValue = numberLine.getConstrainedValue( numberLine.modelPositionToValue( proposedPosition ) );
        const numberLinePoint = new NumberLinePoint( numberLine, {
          initialValue: constrainedValue,
          initialColor: this.color,
          controller: this
        } );
        numberLine.addPoint( numberLinePoint );
        this.associateWithNumberLinePoint( numberLinePoint );
      }
      else {

        // Just accept the proposed position, no other action is necessary.
        this.goToPosition( proposedPosition );
      }
    }
  }

}

numberLineDistance.register( 'DistancePointController', DistancePointController );
export default DistancePointController;
