// Copyright 2019-2022, University of Colorado Boulder

/**
 * a point controller with some extensions that are specific to the "Elevation" scene
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import merge from '../../../../phet-core/js/merge.js';
import numberLineIntegers from '../../numberLineIntegers.js';

class ElevationPointController extends PointController {

  /**
   * @param {NumberLine} numberLine - the number line on which this controller will be moving points
   * @param {Bounds2} elevationAreaBounds
   * @param {Object} [options]
   * @public
   */
  constructor( numberLine, elevationAreaBounds, options ) {

    options = merge( {

      // This style of point controller never locks to the number line.
      lockToNumberLine: LockToNumberLine.NEVER,

      numberLines: [ numberLine ]

    }, options );

    super( options );

    // @private {Bounds2}
    this.elevationsAreaBounds = elevationAreaBounds;

    // @public (read-only) property that tracks whether this point controller is in the area where it should be controlling a point
    this.overElevationAreaProperty = new BooleanProperty( false );

    // These point controllers are never disposed, so no unlinking is needed.
    this.positionProperty.link( position => {
      this.overElevationAreaProperty.value = elevationAreaBounds.containsPoint( position );
    } );

    // Create/remove number line points based on whether we're over the elevation area.
    this.overElevationAreaProperty.lazyLink( over => {
      if ( over && this.isDraggingProperty.value ) {

        // state checking
        assert && assert( !this.isControllingNumberLinePoint(), 'should not already have a point' );

        // Create a new point on the number line.
        const numberLinePoint = new NumberLinePoint( numberLine, {
          initialValue: Utils.roundSymmetric( numberLine.modelPositionToValue( this.positionProperty.value ) ),
          initialColor: this.color,
          controller: this
        } );
        numberLine.addPoint( numberLinePoint );
        this.associateWithNumberLinePoint( numberLinePoint );
      }
      else if ( !over && this.isControllingNumberLinePoint() ) {

        // Remove our point(s) from the number line and disassociate from them.
        this.removeClearAndDisposePoints();
      }
    } );
  }

  /**
   * Do essentially what the base class does, but then allow any X direction motion.
   * @param {Vector2} proposedPosition
   * @override - see base class for more information
   * @public
   */
  proposePosition( proposedPosition ) {

    if ( this.isControllingNumberLinePoint() && !this.elevationsAreaBounds.containsPoint( proposedPosition ) ) {

      // The user has dragged the controller outside of the elevation bounds, so allow the motion.  Listeners in
      // other places will remove the point from the number line.
      this.positionProperty.value = proposedPosition;
    }
    else {
      super.proposePosition( proposedPosition );
    }
  }
}


numberLineIntegers.register( 'ElevationPointController', ElevationPointController );
export default ElevationPointController;