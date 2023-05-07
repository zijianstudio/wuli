// Copyright 2020-2021, University of Colorado Boulder

/**
 * NLOGenericModel is the primary model for the "Generic" screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import OperationTrackingNumberLine from '../../common/model/OperationTrackingNumberLine.js';
import NLOConstants from '../../common/NLOConstants.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const NUMBER_LINE_RANGES = [
  new Range( -10, 10 ),
  new Range( -30, 30 ),
  new Range( -100, 100 )
];
const MODEL_BOUNDS = NLOConstants.LAYOUT_BOUNDS;
const NUMBER_LINE_CENTER_X = MODEL_BOUNDS.centerX; // matches design doc layout
const PRIMARY_NUMBER_LINE_LOWER_POSITION = new Vector2( NUMBER_LINE_CENTER_X, MODEL_BOUNDS.centerY );
const PRIMARY_NUMBER_LINE_UPPER_POSITION = PRIMARY_NUMBER_LINE_LOWER_POSITION.minusXY( 0, MODEL_BOUNDS.height * 0.15 );

const COMMON_NUMBER_LINE_OPTIONS = {
  numberOfOperationsTracked: 2,
  initialDisplayedRange: NUMBER_LINE_RANGES[ 0 ],
  tickMarksInitiallyVisible: true,
  preventOverlap: false,
  labelsInitiallyVisible: true,
  operationDescriptionsInitiallyVisible: false,
  widthInModelSpace: NLOConstants.NUMBER_LINE_WIDTH,
  operationOptionsArray: [ { initialAmount: 1 }, { initialAmount: 1 } ]
};

class NLOGenericModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public (read-write) - whether or not the 2nd number line is visible to the user
    this.secondNumberLineVisibleProperty = new BooleanProperty( false );

    // @public - the primary operation-tracking number line, which is always visible
    this.primaryNumberLine = new OperationTrackingNumberLine(
      PRIMARY_NUMBER_LINE_LOWER_POSITION,
      merge( {
        startingValueProperty: new NumberProperty( 1 ),
        pointColorList: [
          NLOConstants.DARK_BLUE_POINT_COLOR,
          NLOConstants.MEDIUM_BLUE_POINT_COLOR,
          NLOConstants.LIGHT_BLUE_POINT_COLOR
        ]
      }, COMMON_NUMBER_LINE_OPTIONS )
    );

    // @public (read-only) - Associate a point controller with the point that represents the initial value on the
    // operation tracking number line.  This point controller will always be present on the number line, whereas there
    // are others that can come and go.
    assert && assert( this.primaryNumberLine.residentPoints.length === 1, 'expected only one point on the number line' );
    this.primaryLineInitialValuePointController = new PointController( {
      color: this.primaryNumberLine.startingPoint.colorProperty.value,
      numberLines: [ this.primaryNumberLine ],
      numberLinePoints: [ this.primaryNumberLine.startingPoint ],
      lockToNumberLine: LockToNumberLine.ALWAYS
    } );

    // @public (read-only) {ObservableArrayDef.<PointController>} - A list of the point controllers for the primary
    // number line. These come and go as points come and go.
    this.primaryNumberLinePointControllers = createObservableArray();
    this.primaryNumberLine.residentPoints.addItemAddedListener( addedPoint => {

      // Add a point controller for the newly added point.
      const pointController = new PointController( {
        color: addedPoint.colorProperty.value,
        numberLines: [ this.primaryNumberLine ],
        numberLinePoints: [ addedPoint ],
        lockToNumberLine: LockToNumberLine.ALWAYS
      } );
      this.primaryNumberLinePointControllers.push( pointController );

      // Remove the point controller when the associated point goes away.
      const removalListener = removedPoint => {
        if ( removedPoint === addedPoint ) {
          this.primaryNumberLinePointControllers.remove( pointController );
          pointController.dispose();
          this.primaryNumberLine.residentPoints.removeItemRemovedListener( removalListener );
        }
      };
      this.primaryNumberLine.residentPoints.addItemRemovedListener( removalListener );
    } );

    // @public - the secondary operation-tracking number line, which is only visible when enabled by the user
    this.secondaryNumberLine = new OperationTrackingNumberLine(
      this.primaryNumberLine.centerPositionProperty.value.plusXY( 0, 62 ),
      merge( {
        startingValueProperty: new NumberProperty( 1 ),
        pointColorList: [ new Color( '#a400cc' ), new Color( '#ef29ff' ), new Color( '#fb71ff' ) ]
      }, COMMON_NUMBER_LINE_OPTIONS )
    );

    // Link the view control properties from the primary number line to those in the secondary number line.  Calls to
    // unlink are not needed.
    this.primaryNumberLine.showPointLabelsProperty.link(
      showPointLabels => this.secondaryNumberLine.showPointLabelsProperty.set( showPointLabels )
    );
    this.primaryNumberLine.showOperationLabelsProperty.link(
      showPointLabels => this.secondaryNumberLine.showOperationLabelsProperty.set( showPointLabels )
    );
    this.primaryNumberLine.showTickMarksProperty.link(
      showPointLabels => this.secondaryNumberLine.showTickMarksProperty.set( showPointLabels )
    );

    // @public (read-only) - Associate a point controller with the point that represents the initial value on the
    // operation tracking number line.  This point controller will always be present on the number line, whereas there
    // are others that can come and go.
    assert && assert( this.secondaryNumberLine.residentPoints.length === 1, 'expected only one point on the number line' );
    this.secondaryLineInitialValuePointController = new PointController( {
      color: this.secondaryNumberLine.startingPoint.colorProperty.value,
      numberLines: [ this.secondaryNumberLine ],
      numberLinePoints: [ this.secondaryNumberLine.startingPoint ],
      lockToNumberLine: LockToNumberLine.ALWAYS
    } );

    // @public (read-only) {ObservableArrayDef.<PointController>} - A list of the point controllers for the secondary number
    // line. These come and go as points come and go.
    this.secondaryNumberLinePointControllers = createObservableArray();
    this.secondaryNumberLine.residentPoints.addItemAddedListener( addedPoint => {

      // Add a point controller for the newly added point.
      const pointController = new PointController( {
        color: addedPoint.colorProperty.value,
        numberLines: [ this.secondaryNumberLine ],
        numberLinePoints: [ addedPoint ],
        lockToNumberLine: LockToNumberLine.ALWAYS
      } );
      this.secondaryNumberLinePointControllers.push( pointController );

      // Remove the point controller when the associated point goes away.
      const removalListener = removedPoint => {
        if ( removedPoint === addedPoint ) {
          this.secondaryNumberLinePointControllers.remove( pointController );
          pointController.dispose();
          this.secondaryNumberLine.residentPoints.removeItemRemovedListener( removalListener );
        }
      };
      this.secondaryNumberLine.residentPoints.addItemRemovedListener( removalListener );
    } );

    // animation to move the primary number line around based on with the secondary is being shown
    this.primaryNumberLineAnimation = null;

    // Position the primary number line based on whether the secondary number line is visible.  No unlink is needed.
    this.secondNumberLineVisibleProperty.link( secondNumberLineVisible => {
      const destination = secondNumberLineVisible ?
                          PRIMARY_NUMBER_LINE_UPPER_POSITION :
                          PRIMARY_NUMBER_LINE_LOWER_POSITION;
      if ( !this.primaryNumberLine.centerPositionProperty.value.equals( destination ) ) {

        // Stop any previous animation.
        if ( this.primaryNumberLineAnimation ) {
          this.primaryNumberLineAnimation.stop();
        }

        // Start an animation to move the number line to the desired position.
        this.primaryNumberLineAnimation = new Animation( {
          duration: 0.5,
          targets: [
            {
              property: this.primaryNumberLine.centerPositionProperty,
              easing: Easing.CUBIC_IN_OUT,
              to: destination
            } ]
        } );
        this.primaryNumberLineAnimation.start();
        this.primaryNumberLineAnimation.endedEmitter.addListener( () => {
          this.primaryNumberLineAnimation = null;
        } );
      }
    } );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.primaryNumberLine.reset();
    this.secondaryNumberLine.reset();
    this.secondNumberLineVisibleProperty.reset();
  }
}

// statics
NLOGenericModel.NUMBER_LINE_RANGES = NUMBER_LINE_RANGES;

numberLineOperations.register( 'NLOGenericModel', NLOGenericModel );
export default NLOGenericModel;