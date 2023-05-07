// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for the 'Distance' scene
 *
 * @author Saurabh Totey
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import AbstractNLDBaseModel from '../../common/model/AbstractNLDBaseModel.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';
import DistancePointController from './DistancePointController.js';

// constants
const TRAPEZOID_OFFSET_FROM_NUMBERLINE = 180;
const TRAPEZOID_HEIGHT = 50;

class DistanceSceneModel extends AbstractNLDBaseModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // values empirically determined
    const numberLine = new SpatializedNumberLine( NLDConstants.NLD_LAYOUT_BOUNDS.center.plusXY( 0, -75 ), {
      widthInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.width - 250,
      heightInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.height - 160,
      labelsInitiallyVisible: true,
      tickMarksInitiallyVisible: true,
      preventOverlap: false
    } );

    // values used for placing the sidewalk
    // values empirically determined
    const numberLineMinimumXPosition = numberLine.valueToModelPosition( numberLine.displayedRangeProperty.value.min ).x;
    const numberLineMaximumXPosition = numberLine.valueToModelPosition( numberLine.displayedRangeProperty.value.max ).x;
    const numberLineY = numberLine.centerPositionProperty.value.y;
    const sidewalkBounds = new Bounds2(
      numberLineMinimumXPosition - 50,
      numberLineY + TRAPEZOID_OFFSET_FROM_NUMBERLINE,
      numberLineMaximumXPosition + 50,
      numberLineY + TRAPEZOID_OFFSET_FROM_NUMBERLINE + TRAPEZOID_HEIGHT
    );
    const lockingBounds = sidewalkBounds.withMinY( numberLineY + 125 ).withMaxY( sidewalkBounds.bottom + 10 );

    // Create the model with the point controllers. The point controllers don't lock onto the same y-level for #23.
    // The locking heights and scales are empirically determined and will need to change if the images change.
    super(
      numberLine,
      new DistancePointController(
        numberLine,
        lockingBounds,
        TRAPEZOID_OFFSET_FROM_NUMBERLINE + TRAPEZOID_HEIGHT / 2 - 52,
        0.3
      ),
      new DistancePointController(
        numberLine,
        lockingBounds,
        TRAPEZOID_OFFSET_FROM_NUMBERLINE + TRAPEZOID_HEIGHT / 2 - 18,
        0.5
      ),
      tandem
    );

    // @public (read-only) {Bounds2}
    this.sidewalkBounds = sidewalkBounds;
  }
}

numberLineDistance.register( 'DistanceSceneModel', DistanceSceneModel );
export default DistanceSceneModel;
