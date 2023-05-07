// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for common properties/behaviours used by all scenes/screens in the sim. This class is incomplete and meant to
 * be subclassed. It is assumed that all instances of this class are present for the lifetime of the simulation.
 *
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import numberLineDistance from '../../numberLineDistance.js';
import NLDConstants from '../NLDConstants.js';
import DistanceRepresentation from './DistanceRepresentation.js';

class AbstractNLDBaseModel {

  /**
   * This constructor initializes common values and properties for the model.
   * Parameters require two point controllers because every screen/scene in this sim has two point controllers.
   *
   * @param {SpatializedNumberLine} numberLine
   * @param {PointController} pointControllerOne
   * @param {PointController} pointControllerTwo
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( numberLine, pointControllerOne, pointControllerTwo, tandem, options ) {

    // @private
    this.options = merge( {
      positionInBoxOffset: new Vector2( 0, 0 )
    }, options );

    // @public {Property.<Boolean>}
    this.distanceLabelsVisibleProperty = new BooleanProperty( true );

    // @public {Property.<Boolean>}
    this.distanceDescriptionVisibleProperty = new BooleanProperty( true );

    // @public {Property.<DistanceRepresentation>}
    this.distanceRepresentationProperty = new EnumerationDeprecatedProperty( DistanceRepresentation, DistanceRepresentation.ABSOLUTE );

    // @public {Property.<Boolean>} - whether the x_1 and x_2 or y_1 and y_2 nodes are swapped
    // An 'isSwapped' approach was taken rather than reordering the point controllers in some array because it is
    // often useful to know which point controller is which and to be able to consistently access the same point controller
    // regardless of whether it is the primary point controller or not.
    this.isPrimaryControllerSwappedProperty = new BooleanProperty( false );

    // @public {SpatializedNumberLine}
    this.numberLine = numberLine;

    // @public {PointController} - the point controllers in the sim
    // this.pointControllerOne is the 'primary' point controller unless this.isPrimaryNodeSwappedProperty in which case
    // this.pointControllerTwo is the 'primary' point controller.
    // The ordering of point controllers is necessary for all sorts of behaviours in this sim (e.g. directed distance,
    // distance statements, etc.).
    this.pointControllerOne = pointControllerOne;
    this.pointControllerTwo = pointControllerTwo;

    // @public (read-only) {Property.<number|null>} a Property that stores the number line point values of the point controllers
    // in the order that the point controllers were given to this model. If a point controller doesn't have a number
    // line point, then null is recorded in the array instead. The stored array is always of length 2:
    // index 0 corresponds to the value of the number line point of this.pointControllerOne and index 1 corresponds to
    // the value of the number line point of this.pointControllerTwo.
    this.pointValuesProperty = new Property( [ null, null ], {
      valueType: Array,
      isValidValue: array =>
        Array.isArray( array ) && array.length === 2 && _.every( array,
          element => element === null || typeof element === 'number'
        )
    } );

    // Listen to the numberLine and its points to make updates to pointsValueProperty when necessary. Ideally, we would
    // listen to the residentPoints of this.numberLine so I wouldn't duplicate code per controller, but it is necessary
    // to know which point controller each number line point belongs to, and points can be added to the number line
    // before they are associated with a point controller.
    this.pointControllerOne.numberLinePoints.addItemAddedListener( numberLinePoint => {
      const updatePointValuesProperty = value => {
        this.pointValuesProperty.value = [ value, this.pointValuesProperty.value[ 1 ] ];
      };
      numberLinePoint.valueProperty.link( updatePointValuesProperty );
      const itemRemovedListener = removedNumberLinePoint => {
        if ( removedNumberLinePoint === numberLinePoint ) {
          numberLinePoint.valueProperty.unlink( updatePointValuesProperty );
          updatePointValuesProperty( null );
          this.pointControllerOne.numberLinePoints.removeItemRemovedListener( itemRemovedListener );
        }
      };
      this.pointControllerOne.numberLinePoints.addItemRemovedListener( itemRemovedListener );
    } );
    this.pointControllerTwo.numberLinePoints.addItemAddedListener( numberLinePoint => {
      const updatePointValuesProperty = value => {
        this.pointValuesProperty.value = [ this.pointValuesProperty.value[ 0 ], value ];
      };
      numberLinePoint.valueProperty.link( updatePointValuesProperty );
      const itemRemovedListener = removedNumberLinePoint => {
        if ( removedNumberLinePoint === numberLinePoint ) {
          numberLinePoint.valueProperty.unlink( updatePointValuesProperty );
          updatePointValuesProperty( null );
          this.pointControllerTwo.numberLinePoints.removeItemRemovedListener( itemRemovedListener );
        }
      };
      this.pointControllerTwo.numberLinePoints.addItemRemovedListener( itemRemovedListener );
    } );

    // @public {Property.<Bounds2>} the bounds of the toolbox that point controllers return to The box bounds change
    // with number line orientation in the generic screen.
    this.pointControllerBoxProperty = new Property( NLDConstants.BOTTOM_BOX_BOUNDS, { valueType: Bounds2 } );

    this.pointControllers.forEach( pointController => {

      this.putPointControllerInBox( pointController );

      // Set up the listeners that will place the point controllers back in their default positions when released over
      // the active point controller box.
      pointController.isDraggingProperty.lazyLink( dragging => {

        // If the point controller is released and it's not controlling a point on the number line, put it away.
        if ( !dragging && !pointController.isControllingNumberLinePoint() ) {
          this.putPointControllerInBox( pointController, true );
        }
      } );

    } );

    // Manage point controllers on orientation change.
    this.numberLine.orientationProperty.lazyLink( () => {
      this.pointControllers
        .filter( pointController => pointController.isControllingNumberLinePoint() )
        .forEach( pointController => {
          // There should only be one controlled point.
          assert && assert( pointController.numberLinePoints.length === 1 );
          pointController.setPositionRelativeToPoint( pointController.numberLinePoints.get( 0 ) );
        } );
    } );

    // If point controllers were in the box and the box bounds changed, move the points.
    this.pointControllerBoxProperty.lazyLink( ( newBoxBounds, oldBoxBounds ) => {
      this.pointControllers.forEach( pointController => {

        // If the point controller is animating, stop it and put it in the box.
        if ( pointController.inProgressAnimationProperty.value ) {
          pointController.stopAnimation();
          this.putPointControllerInBox( pointController );
        }

        // If the point controller was sitting in the previous box, move it to the new one.
        else if ( oldBoxBounds.containsPoint( pointController.positionProperty.value ) &&
                  !pointController.isDraggingProperty.value && !pointController.isControllingNumberLinePoint() ) {
          this.putPointControllerInBox( pointController );
        }
      } );
    } );
  }

  /**
   * Place the provided point controller into the currently active box.
   * Generally done on init, reset, and when the user "puts it away".
   *
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

    // decide which box and at which position the point controller should be placed
    if ( this.pointControllerBoxProperty.value === NLDConstants.BOTTOM_BOX_BOUNDS ) {

      // put point in box at bottom of screen
      const spacing = NLDConstants.BOTTOM_BOX_BOUNDS.width / numberOfPositions;
      destination = new Vector2(
        NLDConstants.BOTTOM_BOX_BOUNDS.minX + spacing / 2 + spacing * index,
        NLDConstants.BOTTOM_BOX_BOUNDS.centerY
      ).plus( this.options.positionInBoxOffset );
    }
    else if ( this.pointControllerBoxProperty.value === NLDConstants.SIDE_BOX_BOUNDS ) {

      // put point in box at side of screen
      const spacing = NLDConstants.SIDE_BOX_BOUNDS.height / numberOfPositions;
      destination = new Vector2(
        NLDConstants.SIDE_BOX_BOUNDS.centerX,
        NLDConstants.SIDE_BOX_BOUNDS.minY + spacing / 2 + spacing * index
      ).plus( this.options.positionInBoxOffset );
    }
    else {
      assert && assert( false, 'cannot put point controller away if box is not the bottom box or side box' );
    }

    pointController.goToPosition( destination, animate );
  }

  /**
   * Get both point controllers as a list.
   * Always returns this.pointControllerOne as the first element of the list, which means that this method
   * doesn't order the point controllers by which one is the primary one.
   *
   * @returns {PointController[]}
   * @public
   */
  getPointControllers() {
    return [ this.pointControllerOne, this.pointControllerTwo ];
  }

  get pointControllers() { return this.getPointControllers(); }

  /**
   * Return whether both point controllers are controlling number line points that live on the number line
   * @public
   */
  areBothPointControllersControllingOnNumberLine() {
    return this.pointValuesProperty.value.filter( pointValue => pointValue !== null ).length === 2;
  }

  /**
   * Resets the model
   * @public
   */
  reset() {
    this.pointControllers.forEach( pointController => {
      pointController.reset();
      this.putPointControllerInBox( pointController );
    } );
    this.distanceLabelsVisibleProperty.reset();
    this.distanceDescriptionVisibleProperty.reset();
    this.distanceRepresentationProperty.reset();
    this.isPrimaryControllerSwappedProperty.reset();
    this.numberLine.reset();
    this.pointControllerBoxProperty.reset();
  }

}

numberLineDistance.register( 'AbstractNLDBaseModel', AbstractNLDBaseModel );
export default AbstractNLDBaseModel;
