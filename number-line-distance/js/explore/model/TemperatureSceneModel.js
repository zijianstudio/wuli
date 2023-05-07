// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for the 'Temperature' scene
 *
 * @author Saurabh Totey
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import TemperatureToColorMapper from '../../../../number-line-common/js/explore/model/TemperatureToColorMapper.js';
import AbstractNLDBaseModel from '../../common/model/AbstractNLDBaseModel.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';
import AreaPointController from './AreaPointController.js';
import DropFromDirection from './DropFromDirection.js';

// constants
const TEMPERATURE_POINT_CONTROLLER_BOX_SCALE = 0.4;

class TemperatureSceneModel extends AbstractNLDBaseModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // values empirically determined
    const numberLine = new SpatializedNumberLine( NLDConstants.NLD_LAYOUT_BOUNDS.center.plusXY( 0, -75 ), {
      widthInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.width - 250,
      heightInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.height - 160,
      initialDisplayedRange: TemperatureSceneModel.TEMPERATURE_RANGE,
      labelsInitiallyVisible: true,
      tickMarksInitiallyVisible: true,
      preventOverlap: false
    } );

    // y-values determined empirically
    const temperatureAreaBounds = new Bounds2(
      numberLine.valueToModelPosition( numberLine.displayedRangeProperty.value.min ).x, 364,
      numberLine.valueToModelPosition( numberLine.displayedRangeProperty.value.max ).x, 464
    );

    super(
      numberLine,
      new AreaPointController(
        DropFromDirection.TOP,
        temperatureAreaBounds,
        {
          numberLines: [ numberLine ],
          scaleInBox: TEMPERATURE_POINT_CONTROLLER_BOX_SCALE,
          color: '#693cc2'
        }
      ),
      new AreaPointController(
        DropFromDirection.TOP,
        temperatureAreaBounds,
        {
          numberLines: [ numberLine ],
          scaleInBox: TEMPERATURE_POINT_CONTROLLER_BOX_SCALE,
          color: '#52c23c'
        }
      ),
      tandem,
      { positionInBoxOffset: new Vector2( 0, 20 ) } // empirically determined
    );

    // Listen to when a point controller is no longer being dragged and push the dragged point controller
    // vertically if there is an extant point controller at the same value that is close enough.
    const pushDistance = temperatureAreaBounds.height / 8;
    const makePointControllerGetPushedIfDraggedToSameValueAsOtherPointController = ( pointController, otherPointController ) => {
      pointController.isDraggingProperty.link( isDragging => {

        // Only push when the point controller is no longer being dragged and both point controllers are on the number
        // line at the same value.
        const areBothControllersOnNumberLineWithSameValue = this.pointValuesProperty.value[ 0 ] !== null &&
          this.pointValuesProperty.value[ 1 ] !== null &&
          this.pointValuesProperty.value[ 0 ] === this.pointValuesProperty.value[ 1 ];
        if ( isDragging || !areBothControllersOnNumberLineWithSameValue ) {
          return;
        }

        // Check whether to push up or down based on which side (top or bottom) has more space.
        const otherPointControllerYPosition = otherPointController.positionProperty.value.y;
        const pushDownYLocation = otherPointControllerYPosition + pushDistance;
        const pushUpYLocation = otherPointControllerYPosition - pushDistance;
        const shouldPushDown = Math.abs( otherPointControllerYPosition - temperatureAreaBounds.top ) <
          Math.abs( otherPointControllerYPosition - temperatureAreaBounds.bottom );
        const pushYPosition = shouldPushDown ? pushDownYLocation : pushUpYLocation;

        // As long as the push is increasing the distance between the point controllers, push the point controller.
        if ( Math.abs( pushYPosition - otherPointControllerYPosition ) >
          Math.abs( pointController.positionProperty.value.y - otherPointControllerYPosition ) ) {
          pointController.positionProperty.value = new Vector2(
            pointController.positionProperty.value.x,
            pushYPosition
          );
        }
      } );
    };
    makePointControllerGetPushedIfDraggedToSameValueAsOtherPointController( this.pointControllerOne, this.pointControllerTwo );
    makePointControllerGetPushedIfDraggedToSameValueAsOtherPointController( this.pointControllerTwo, this.pointControllerOne );

    // @public (read-only) {Bounds2} the bounds where point controllers can be
    this.temperatureAreaBounds = temperatureAreaBounds;

    // @public (read-only) {function(number):Color}
    this.temperatureToColorMapper = new TemperatureToColorMapper( TemperatureSceneModel.TEMPERATURE_RANGE );
  }

}

TemperatureSceneModel.TEMPERATURE_RANGE = new Range( -50, 50 );

numberLineDistance.register( 'TemperatureSceneModel', TemperatureSceneModel );
export default TemperatureSceneModel;
