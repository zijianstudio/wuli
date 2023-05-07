// Copyright 2019-2022, University of Colorado Boulder

/**
 * main model for the "generic" screen
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { Color } from '../../../../scenery/js/imports.js';
import NLIConstants from '../../common/NLIConstants.js';
import numberLineIntegers from '../../numberLineIntegers.js';

// constants
const NL_Y_OFFSET = 30; // offset of the number line from the center of the bounds, empirically determined
const BOTTOM_BOX_WIDTH = 320;
const BOTTOM_BOX_HEIGHT = 70;
const SIDE_BOX_WIDTH = BOTTOM_BOX_HEIGHT;
const SIDE_BOX_HEIGHT = BOTTOM_BOX_WIDTH;
const INSET = 30;
const BOTTOM_BOX_BOUNDS = new Bounds2(
  NLIConstants.NLI_LAYOUT_BOUNDS.centerX - BOTTOM_BOX_WIDTH / 2,
  NLIConstants.NLI_LAYOUT_BOUNDS.maxY - BOTTOM_BOX_HEIGHT - INSET,
  NLIConstants.NLI_LAYOUT_BOUNDS.centerX + BOTTOM_BOX_WIDTH / 2,
  NLIConstants.NLI_LAYOUT_BOUNDS.maxY - INSET
);
const SIDE_BOX_BOUNDS = new Bounds2(
  NLIConstants.NLI_LAYOUT_BOUNDS.minX + INSET,
  NLIConstants.NLI_LAYOUT_BOUNDS.centerY - SIDE_BOX_HEIGHT / 2,
  NLIConstants.NLI_LAYOUT_BOUNDS.minX + INSET + SIDE_BOX_WIDTH,
  NLIConstants.NLI_LAYOUT_BOUNDS.centerY + SIDE_BOX_HEIGHT / 2
);
const ORANGISH_POINT_COLOR = new Color( '#ff8a15' );
const INITIAL_POINT_COLOR = new Color( 'blue' );
const NUMBER_LINE_RANGES = [
  new Range( -10, 10 ),
  new Range( -30, 30 ),
  new Range( -100, 100 )
];

class NLIGenericModel {

  /**
   * @public
   */
  constructor() {

    // @public (read-only) {SpatializedNumberLine} - the number line with which the user will interact
    this.numberLine = new SpatializedNumberLine( NLIConstants.NLI_LAYOUT_BOUNDS.center.plusXY( 0, NL_Y_OFFSET ), {
      initialDisplayedRange: NUMBER_LINE_RANGES[ 0 ],
      initialPointSpecs: [ { initialValue: 1, color: INITIAL_POINT_COLOR } ],
      labelsInitiallyVisible: true,

      // size of the number line in both orientations, number empirically determined to make it look good
      widthInModelSpace: NLIConstants.NLI_LAYOUT_BOUNDS.width - 100,
      heightInModelSpace: NLIConstants.NLI_LAYOUT_BOUNDS.height - 160
    } );

    // @public (read-only) {Property.<Bounds2>} - the bounds of the box where the point controllers reside when not
    // being used, changes its position when the orientation of the number line changes
    this.pointControllerBoxProperty = new Property( BOTTOM_BOX_BOUNDS, { valueType: Bounds2 } );

    // @public (read-only) - an array of the point controllers available for manipulation by the user
    this.pointControllers = [
      new PointController( { color: new Color( 'magenta' ), numberLines: [ this.numberLine ] } ),
      new PointController( { color: ORANGISH_POINT_COLOR, numberLines: [ this.numberLine ] } ),
      new PointController( { color: INITIAL_POINT_COLOR, numberLines: [ this.numberLine ] } )
    ];

    // Put the first two point controllers into the box at the bottom of the screen.
    this.putPointControllerInBox( this.pointControllers[ 0 ] );
    this.putPointControllerInBox( this.pointControllers[ 1 ] );

    // The third point controller should be associated with the point already on the number line.
    assert && assert( this.numberLine.residentPoints.length === 1, 'expected one and only one point on the number line' );
    this.pointControllers[ 2 ].associateWithNumberLinePoint( this.numberLine.residentPoints.get( 0 ) );

    // Set up the listeners that will place the point controllers back in their default positions when released over
    // the active point controller box.
    this.pointControllers.forEach( pointController => {
      pointController.isDraggingProperty.lazyLink( dragging => {

        // If the point controller is released and it's not controlling a point on the number line, put it away.
        if ( !dragging && !pointController.isControllingNumberLinePoint() ) {
          this.putPointControllerInBox( pointController, true );
        }
      } );
    } );

    // handle changes to the number line's orientation
    this.numberLine.orientationProperty.link( orientation => {
      const previousBoxBounds = orientation === Orientation.HORIZONTAL ? SIDE_BOX_BOUNDS : BOTTOM_BOX_BOUNDS;
      const newBoxBounds = orientation === Orientation.HORIZONTAL ? BOTTOM_BOX_BOUNDS : SIDE_BOX_BOUNDS;
      this.pointControllerBoxProperty.value = newBoxBounds;
      this.pointControllers.forEach( pointController => {

        // If the point controller is animating, stop it and put it in the box.
        if ( pointController.inProgressAnimationProperty.value ) {
          pointController.stopAnimation();
          this.putPointControllerInBox( pointController );
        }

        // If the point controller was sitting in the previous box, move it to the new one.
        else if ( previousBoxBounds.containsPoint( pointController.positionProperty.value ) &&
                  !pointController.isDraggingProperty.value ) {
          this.putPointControllerInBox( pointController );
        }

        // If the controller is controlling a point on the number line, relocate the point and the controller.
        else if ( pointController.isControllingNumberLinePoint() ) {

          // There should only be one controlled point.
          assert && assert( pointController.numberLinePoints.length === 1 );
          pointController.setPositionRelativeToPoint( pointController.numberLinePoints.get( 0 ) );
        }
      } );
    } );

    // Add a listener to handle any cases where a change to the number line's display range causes a point that was
    // already on the number line to be outside of the displayed range.
    this.numberLine.displayedRangeProperty.link( displayedRange => {
      this.pointControllers.forEach( pointController => {
        if ( pointController.isControllingNumberLinePoint() ) {

          // state checking
          assert && assert(
            pointController.numberLinePoints.length === 1,
            'point controllers on the "Generic" screen should never control multiple points'
          );

          // Get the point on the number line that is currently controlled by this point controller.
          const numberLinePoint = pointController.numberLinePoints.get( 0 );

          if ( !displayedRange.contains( numberLinePoint.valueProperty.value ) ) {

            // The point controlled by this controller is out of the displayed range, so get rid of it.
            pointController.dissociateFromNumberLinePoint( numberLinePoint );
            this.numberLine.removePoint( numberLinePoint );
            numberLinePoint.dispose();

            // Put the controller away.
            this.putPointControllerInBox( pointController );
          }
        }
      } );
    } );
  }

  /**
   * Place the provided point controller into the currently active box, generally done on init, reset, and when the
   * user "puts it away".
   * @param {PointController} pointController
   * @param {boolean} [animate] - controls whether to animate the return to the box or do it instantly
   * @private
   */
  putPointControllerInBox( pointController, animate = false ) {

    const index = this.pointControllers.indexOf( pointController );
    const numberOfPositions = this.pointControllers.length;

    // error checking
    assert && assert( index >= 0, 'point controller not found on list' );
    assert && assert(
      !pointController.isControllingNumberLinePoint(),
      'point controller should not be put away while controlling a point'
    );

    let destination;

    // Decide which box and at which position the point controller should be placed.
    if ( this.numberLine.orientationProperty.value === Orientation.HORIZONTAL ) {

      // Put point in box at bottom of screen.
      const spacing = BOTTOM_BOX_BOUNDS.width / numberOfPositions;
      destination = new Vector2( BOTTOM_BOX_BOUNDS.minX + spacing / 2 + spacing * index, BOTTOM_BOX_BOUNDS.centerY );
    }
    else {

      // Put point in box at side of screen.
      const spacing = SIDE_BOX_BOUNDS.height / numberOfPositions;
      destination = new Vector2( SIDE_BOX_BOUNDS.centerX, SIDE_BOX_BOUNDS.minY + spacing / 2 + spacing * index );
    }

    pointController.goToPosition( destination, animate );
  }

  /**
   * Restore model to initial state.
   * @public
   */
  reset() {

    // Clear any associations that the point controllers have with points on the number line.
    this.pointControllers.forEach( pointController => {
      pointController.reset();
    } );

    // Reset the number line.
    this.numberLine.reset();

    // Put the first two point controllers in the box at the bottom of the screen.
    this.putPointControllerInBox( this.pointControllers[ 0 ] );
    this.putPointControllerInBox( this.pointControllers[ 1 ] );

    // Associate the third point controller with the point on the number line.
    assert && assert( this.numberLine.residentPoints.length === 1, 'expected one and only one point on the number line' );
    this.pointControllers[ 2 ].associateWithNumberLinePoint( this.numberLine.residentPoints.get( 0 ) );
  }
}

// static properties
NLIGenericModel.NUMBER_LINE_RANGES = NUMBER_LINE_RANGES;

numberLineIntegers.register( 'NLIGenericModel', NLIGenericModel );
export default NLIGenericModel;
