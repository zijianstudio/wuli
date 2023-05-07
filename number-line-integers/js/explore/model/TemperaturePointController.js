// Copyright 2019-2022, University of Colorado Boulder

/**
 * TemperaturePointController is a Scenery node that looks like a thermometer with a little triangle that pinpoints the
 * position where the temperature and color are sensed, and it also controls points on a number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import TemperatureToColorMapper from '../../../../number-line-common/js/explore/model/TemperatureToColorMapper.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, PaintColorProperty } from '../../../../scenery/js/imports.js';
import numberLineIntegers from '../../numberLineIntegers.js';

// constants
const TEMPERATURE_RANGE_ON_MAP = new Range( -60, 50 ); // in Celsius, must match range used to make map images

// convenience functions
const celsiusToFahrenheitInteger = temperatureInCelsius => Utils.roundSymmetric( temperatureInCelsius * 9 / 5 + 32 );

// color map for obtaining a color given a temperature value, must match algorithm used on maps
const CELSIUS_TEMPERATURE_TO_COLOR_MAPPER = new TemperatureToColorMapper( TEMPERATURE_RANGE_ON_MAP );

class TemperaturePointController extends PointController {

  /**
   * @param {TemperatureSceneModel} sceneModel
   * @param {string} labelText - the text with which this controller will be identified in the view
   * @param {Object} [options]
   * @public
   */
  constructor( sceneModel, labelText, options ) {

    options = merge( {
      noTemperatureColor: Color.white,
      defaultTemperature: 0, // in Celsius, used when no temperature is available from the model
      lockToNumberLine: LockToNumberLine.NEVER,
      bidirectionalAssociation: false
    }, options );

    super( options );

    // @private
    this.sceneModel = sceneModel;

    // @public (read-only) {string} - label for PointControllerNode and number line point
    this.label = labelText;

    // @public (read-only) - whether this point controller is over the map
    this.isOverMapProperty = new BooleanProperty( false );

    // @public (read-only) - timestamp in ms since epoch when this was most recently dropped on map, -1 when not on map
    this.droppedOnMapTimestamp = -1;

    // @public temperatures at the position of the point controller on the map
    this.celsiusTemperatureProperty = new NumberProperty( options.defaultTemperature );
    this.fahrenheitTemperatureProperty = new NumberProperty( celsiusToFahrenheitInteger( options.defaultTemperature ) );

    // @public - color represented by temperature on map
    this.colorProperty = new PaintColorProperty( options.noTemperatureColor );

    // Update temperature and other state information when moved or when month changes.
    Multilink.multilink(
      [ this.positionProperty, sceneModel.monthProperty ],
      position => {

        const temperatureInCelsius = sceneModel.getTemperatureAtPosition( position );

        if ( typeof temperatureInCelsius === 'number' ) {

          // A valid temperature value was returned, update the values presented to the user.
          this.celsiusTemperatureProperty.value = temperatureInCelsius;
          this.fahrenheitTemperatureProperty.value = celsiusToFahrenheitInteger( temperatureInCelsius );
          this.colorProperty.value = CELSIUS_TEMPERATURE_TO_COLOR_MAPPER.mapTemperatureToColor(
            this.celsiusTemperatureProperty.value
          );
          this.isOverMapProperty.value = true;
        }
        else {

          // The provided position isn't over the map, so no temperature value can be obtained.
          this.celsiusTemperatureProperty.value = this.celsiusTemperatureProperty.initialValue;
          this.fahrenheitTemperatureProperty.value = this.fahrenheitTemperatureProperty.initialValue;
          this.colorProperty.value = options.noTemperatureColor;
          this.isOverMapProperty.value = false;
        }
      }
    );

    // Create/remove number line points based on whether we're over the map.
    this.isOverMapProperty.lazyLink( over => {
      if ( over && this.isDraggingProperty.value ) {

        // state checking
        assert && assert( !this.isControllingNumberLinePoint(), 'should not already have a point' );

        // Create new points on each number line.
        this.celsiusNumberLinePoint = new NumberLinePoint( this.sceneModel.celsiusNumberLine, {
          valueProperty: this.celsiusTemperatureProperty,
          colorProperty: this.colorProperty,
          controller: this
        } );
        this.fahrenheitNumberLinePoint = new NumberLinePoint( this.sceneModel.fahrenheitNumberLine, {
          valueProperty: this.fahrenheitTemperatureProperty,
          colorProperty: this.colorProperty,
          controller: this
        } );
        this.sceneModel.celsiusNumberLine.addPoint( this.celsiusNumberLinePoint );
        this.sceneModel.fahrenheitNumberLine.addPoint( this.fahrenheitNumberLinePoint );
        this.associateWithNumberLinePoint( this.celsiusNumberLinePoint );
        this.associateWithNumberLinePoint( this.fahrenheitNumberLinePoint );
      }
      else if ( !over && this.isControllingNumberLinePoint() ) {

        // Remove our points from the number lines.
        this.removeClearAndDisposePoints();
        this.celsiusNumberLinePoint = null;
        this.fahrenheitNumberLinePoint = null;
      }
    } );

    // Update the map drop timestamp when dropped.
    this.isDraggingProperty.lazyLink( isDragging => {
      if ( isDragging ) {

        // The timestamp is set to -1 when not dropped on the map.
        this.droppedOnMapTimestamp = -1;
      }
      else {
        if ( this.isOverMapProperty.value ) {

          // This point controller is being dropped on the map, update the timestamp.
          this.droppedOnMapTimestamp = Date.now();
        }
      }

      // Update the dragging state of the number line points if present.
      this.celsiusNumberLinePoint && ( this.celsiusNumberLinePoint.isDraggingProperty.value = isDragging );
      this.fahrenheitNumberLinePoint && ( this.fahrenheitNumberLinePoint.isDraggingProperty.value = isDragging );
    } );
  }

  /**
   * @param {Vector2} proposedPosition
   * @override - necessary because PointController assumes that it is moving parallel to the number line
   *  which is not true for this class
   * @public
   */
  proposePosition( proposedPosition ) {
    this.positionProperty.value = proposedPosition;
  }
}

numberLineIntegers.register( 'TemperaturePointController', TemperaturePointController );
export default TemperaturePointController;
