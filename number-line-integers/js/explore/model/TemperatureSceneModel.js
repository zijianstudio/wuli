// Copyright 2019-2022, University of Colorado Boulder

/**
 * TemperatureSceneModel is the model for the "Temperature" scene in the "Explore" screen
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import NLIConstants from '../../common/NLIConstants.js';
import NLIQueryParameters from '../../common/NLIQueryParameters.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';
import reverseRobinsonProjector from './reverseRobinsonProjector.js';
import SceneModel from './SceneModel.js';
import temperatureDataSet from './temperatureDataSet.js';
import TemperaturePointController from './TemperaturePointController.js';

const thermometerALabelString = NumberLineIntegersStrings.thermometerALabel;
const thermometerBLabelString = NumberLineIntegersStrings.thermometerBLabel;
const thermometerCLabelString = NumberLineIntegersStrings.thermometerCLabel;

// constants
const SCENE_BOUNDS = NLIConstants.NLI_LAYOUT_BOUNDS; // bounds for the scenes match the layout bounds
const THERMOMETER_LABELS = [ thermometerALabelString, thermometerBLabelString, thermometerCLabelString ];
const MAP_WIDTH = 550; // in screen coordinates
const MAP_HEIGHT = 280; // in screen coordinates
const MAP_CENTER = new Vector2(
  SCENE_BOUNDS.centerX,
  SCENE_BOUNDS.height * 0.465
);
const MAP_BOUNDS = new Bounds2(
  MAP_CENTER.x - MAP_WIDTH / 2,
  MAP_CENTER.y - MAP_HEIGHT / 2,
  MAP_CENTER.x + MAP_WIDTH / 2,
  MAP_CENTER.y + MAP_HEIGHT / 2
);
const CELSIUS_NUMBER_LINE_RANGE = new Range( -64, 42 );
const FAHRENHEIT_NUMBER_LINE_RANGE = new Range( -83, 108 );
const NUMBER_LINE_HEIGHT = 490; // empirically determined by visual appearance
const X_MOVE_AMOUNT = 1; // in model/view coords, amount to move a point controller to avoid overlap with another
const Y_MOVE_AMOUNT = 1; // in model/view coords, amount to move a point controller to avoid overlap with another
const FAHRENHEIT_NUMBER_LINE_INDEX = 0;
const CELSIUS_NUMBER_LINE_INDEX = 1;

class TemperatureSceneModel extends SceneModel {

  /**
   * @public
   */
  constructor() {

    // The base class has a single number line, so make that one the Fahrenheit version.
    super( {

      // two number lines, one for Fahrenheit and one for Celsius
      numberOfNumberLines: 2,

      commonNumberLineOptions: {
        initialOrientation: Orientation.VERTICAL,
        heightInModelSpace: NUMBER_LINE_HEIGHT,
        labelsInitiallyVisible: true
      },

      numberLineZeroPositions: [
        getNumberLineZeroPosition( FAHRENHEIT_NUMBER_LINE_RANGE ),
        getNumberLineZeroPosition( CELSIUS_NUMBER_LINE_RANGE )
      ],

      uniqueNumberLineOptionsList: [
        { initialDisplayedRange: FAHRENHEIT_NUMBER_LINE_RANGE },
        { initialDisplayedRange: CELSIUS_NUMBER_LINE_RANGE }
      ]
    } );

    // @public (read-only) {Bounds2} - bounds of the map area
    this.mapBounds = MAP_BOUNDS;

    // @public
    this.monthProperty = new NumberProperty( 1 );

    // @public
    this.temperatureUnitsProperty = new EnumerationDeprecatedProperty(
      NLIConstants.TEMPERATURE_UNITS,
      NLIQueryParameters.defaultCelsius ? NLIConstants.TEMPERATURE_UNITS.CELSIUS : NLIConstants.TEMPERATURE_UNITS.FAHRENHEIT
    );

    // Specify the position of the box that will hold the thermometers.
    const boxWidth = MAP_WIDTH * 0.5;
    const boxHeight = ( SCENE_BOUNDS.maxY - MAP_BOUNDS.maxY ) * 0.4;
    const boxCenterX = MAP_CENTER.x;
    const boxBottom = SCENE_BOUNDS.maxY - 16; // empirically determined to match up with other scenes

    // @public (read-only) {Bounds2} - holding area for the thermometers
    this.thermometerBoxBounds = new Bounds2(
      boxCenterX - boxWidth / 2,
      boxBottom - boxHeight,
      boxCenterX + boxWidth / 2,
      boxBottom
    );

    // @public (read-only) - the point controllers that can be moved into the elevation scene
    this.permanentPointControllers = _.times( 3, i => new TemperaturePointController(
      this,
      THERMOMETER_LABELS[ i ],
      {
        numberLines: this.numberLines,
        lockToNumberLine: LockToNumberLine.NEVER,
        scaleInBox: 0.5
      }
    ) );

    // Put the permanent point controllers in their starting positions.
    this.permanentPointControllers.forEach( pointController => {
      this.putPointControllerInBox( pointController );
    } );

    // Monitor each point controller for when it is dropped and check for whether actions are needed.
    this.permanentPointControllers.forEach( pointController => {
      pointController.isDraggingProperty.lazyLink( isDragging => {
        if ( !isDragging ) {
          if ( !pointController.isOverMapProperty.value ) {

            // The point controller was released outside of the map area, so put it away in the holding box.
            this.putPointControllerInBox( pointController, true );
          }
          else {

            // The point controller was dropped on the map, resolve any overlap with other point controllers.
            this.resolvePointControllerOverlap();
          }
        }
      } );
    } );

    // When the month changes, check and resolve any overlap in temperature values that may have occurred.
    this.monthProperty.lazyLink( () => {
      this.resolvePointControllerOverlap();
    } );
  }

  /**
   * Get the temperature at the specified position.
   * @param {Vector2} position - model coordinates for where to get the temperature
   * @returns {number|null} - the temperature in degrees Kelvin if the position is over the map, null otherwise
   * @public
   */
  getTemperatureAtPosition( position ) {

    // Convert the position into normalized values based on the map's position and size.  These values assume a total
    // span of 1 in the vertical and horizontal directions with the point (0,0) being in the center of the map.
    const normalizedXPosition = ( position.x - this.mapBounds.centerX ) / this.mapBounds.width;
    const normalizedYPosition = ( this.mapBounds.centerY - position.y ) / this.mapBounds.height;

    // Test if the position is over the rectangle that contains the map.  This does *not* test the corners of the
    // rectangle to see whether the point is inside the Robinson projection - that happens further below.
    if ( normalizedXPosition < -0.5 || normalizedXPosition > 0.5 ||
         normalizedYPosition < -0.5 || normalizedYPosition > 0.5 ) {

      // The point is not over the map rectangle - bail.
      return null;
    }

    // Convert the normalized x and y values into latitude and longitude values.
    const latLong = reverseRobinsonProjector.xyToLatLong( normalizedXPosition, normalizedYPosition );

    // Return null if position is not in map bounds.
    if ( latLong.latitude > 90 || latLong.latitude < -90 ||
         latLong.longitude > 180 || latLong.longitude < -180 ) {
      return null;
    }

    // Return the temperature at this position on the surface of the Earth for the current month.
    return temperatureDataSet.getNearSurfaceTemperature(
      this.monthProperty.value,
      latLong.latitude,
      latLong.longitude
    );
  }

  /**
   * @public
   */
  get celsiusNumberLine() {
    return this.numberLines[ CELSIUS_NUMBER_LINE_INDEX ];
  }

  /**
   * @public
   */
  get fahrenheitNumberLine() {
    return this.numberLines[ FAHRENHEIT_NUMBER_LINE_INDEX ];
  }

  /**
   * Place the provided point controller into the holding box, generally done on init, reset, and when the user "puts
   * it away".
   * @param {TemperaturePointController} pointController
   * @param {boolean} [animate] - controls whether to animate the return to the box or do it instantly
   * @private
   */
  putPointControllerInBox( pointController, animate = false ) {
    const index = this.permanentPointControllers.indexOf( pointController );
    const numPositions = this.permanentPointControllers.length;

    // error checking
    assert && assert( index >= 0, 'point controller not found on list' );
    assert && assert(
      !pointController.isControllingNumberLinePoint(),
      'point controller should not be put away while controlling a point'
    );

    const spacing = this.thermometerBoxBounds.width / numPositions;
    const destination = new Vector2(
      this.thermometerBoxBounds.minX + spacing / 2 + spacing * index,
      this.thermometerBoxBounds.centerY + 25 // empirically determined so that thermometers are vertically centered
    );
    pointController.goToPosition( destination, animate );
  }

  /**
   * Resolve any temperature overlap between the point controllers.  Because the temperature is the same at the same
   * position, this will also resolve any positional overlap.
   * @private
   */
  resolvePointControllerOverlap() {

    // Make a list of all point controller that are currently on the map.
    const pointControllersOnMap = this.permanentPointControllers.filter( pointController => {
      return pointController.isOverMapProperty.value && !pointController.isDraggingProperty.value;
    } );

    if ( pointControllersOnMap.length >= 2 ) {

      // Sort the point controllers such that the most recently added ones are towards the front of the array.
      pointControllersOnMap.sort( ( pc1, pc2 ) => {
        return pc2.droppedOnMapTimestamp - pc1.droppedOnMapTimestamp;
      } );

      // Loop through all controllers, moving them as necessary to eliminate temperature or position overlap.
      _.times( pointControllersOnMap.length - 1, () => {

        // Pull the first controller from the front of the list.
        const pointControllerUnderTest = pointControllersOnMap.splice( 0, 1 )[ 0 ];
        const startPosition = pointControllerUnderTest.positionProperty.value.copy();
        let moveCount = 0;

        // Test for overlap with all other temperature point controllers, move if detected.
        while ( _.some(
          pointControllersOnMap,
          pc => pc.celsiusTemperatureProperty.value === pointControllerUnderTest.celsiusTemperatureProperty.value )
          ) {

          // Overlap detected, move the point controller towards the a reasonably large area of the map.
          const xMovement = ( startPosition.x > MAP_CENTER.x ? -1 : 1 ) * ( moveCount + 1 ) * X_MOVE_AMOUNT;
          const yMovement = ( startPosition.y > MAP_CENTER.y ? -1 : 1 ) * ( moveCount + 1 ) * Y_MOVE_AMOUNT;

          // Calculate the new proposed position.
          const newProposedPosition = pointControllerUnderTest.positionProperty.value.plusXY( xMovement, yMovement );

          // There could be some rare cases where a point controller moves all the way across the map and doesn't find
          // a position with a non-overlapping temperature.  For instance, if all the temperature values on the map
          // are the same, this could happen.  Since this seems very unlikely, we test for it and assert if it
          // happens.
          assert && assert(
            this.getTemperatureAtPosition( newProposedPosition ) !== null,
            'unable to find position with different temperature value'
          );

          // Move the point controller.
          pointControllerUnderTest.positionProperty.set( newProposedPosition );

          moveCount++;
        }
      } );
    }
  }

  /**
   * @override
   * @public
   */
  reset() {

    // Only reset the temperature units on a full reset, not a scene reset, see
    // https://github.com/phetsims/number-line-integers/issues/86.
    this.temperatureUnitsProperty.reset();
    this.numberLines.forEach( nl => { nl.reset(); } );

    super.reset();
  }

  /**
   * Restore initial state.
   * @public
   */
  resetScene() {

    this.monthProperty.reset();
    this.numberLines.forEach( nl => { nl.removeAllPoints(); } );

    // Put the point controllers back into their starting positions.
    this.permanentPointControllers.forEach( pointController => {
      pointController.reset();
      this.putPointControllerInBox( pointController );
    } );
  }
}

// static fields
TemperatureSceneModel.CELSIUS_NUMBER_LINE_INDEX = CELSIUS_NUMBER_LINE_INDEX;
TemperatureSceneModel.FAHRENHEIT_NUMBER_LINE_INDEX = FAHRENHEIT_NUMBER_LINE_INDEX;

/**
 * helper function to avoid code duplication
 */
function getNumberLineZeroPosition( range ) {
  return new Vector2(
    // halfway between the left edge of the scene and the left edge of the map
    ( SCENE_BOUNDS.minX + MAP_BOUNDS.minX ) / 2,

    // centers number line vertically within scene
    0.5 * SCENE_BOUNDS.height + NUMBER_LINE_HEIGHT * ( 0.5 + range.min / range.getLength() )
  );
}

numberLineIntegers.register( 'TemperatureSceneModel', TemperatureSceneModel );
export default TemperatureSceneModel;
