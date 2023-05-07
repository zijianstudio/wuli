// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for the 'Elevation' scene
 *
 * @author Saurabh Totey
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import AbstractNLDBaseModel from '../../common/model/AbstractNLDBaseModel.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';
import AreaPointController from './AreaPointController.js';
import DropFromDirection from './DropFromDirection.js';

class ElevationSceneModel extends AbstractNLDBaseModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const numberLine = new SpatializedNumberLine( NLDConstants.NLD_LAYOUT_BOUNDS.center.plusXY( -310, 20 ), {
      widthInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.width - 100,
      heightInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.height - 275,
      initialOrientation: Orientation.VERTICAL,
      initialDisplayedRange: new Range( -20, 20 ),
      labelsInitiallyVisible: true,
      tickMarksInitiallyVisible: true,
      preventOverlap: false
    } );

    const elevationAreaBounds = new Bounds2(
      300, numberLine.valueToModelPosition( numberLine.displayedRangeProperty.value.max ).y,
      750, numberLine.valueToModelPosition( numberLine.displayedRangeProperty.value.min ).y
    );

    super(
      numberLine,
      new AreaPointController( DropFromDirection.LEFT, elevationAreaBounds, {
        numberLines: [ numberLine ],
        color: 'black'
      } ),
      new AreaPointController( DropFromDirection.LEFT, elevationAreaBounds, {
        numberLines: [ numberLine ],
        color: '#446ab7'
      } ),
      tandem
    );

    // @public (read-only) {Bounds2} the bounds where point controllers can be
    this.elevationAreaBounds = elevationAreaBounds;
  }

}

numberLineDistance.register( 'ElevationSceneModel', ElevationSceneModel );
export default ElevationSceneModel;
