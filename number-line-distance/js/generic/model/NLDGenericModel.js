// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main model for the 'Generic' screen
 *
 * @author Saurabh Totey
 */

import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import AbstractNLDBaseModel from '../../common/model/AbstractNLDBaseModel.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';

class NLDGenericModel extends AbstractNLDBaseModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const numberLine = new SpatializedNumberLine( NLDConstants.NLD_LAYOUT_BOUNDS.center, {
      widthInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.width - 100,
      heightInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.height - 215,
      initialDisplayedRange: NLDConstants.GENERIC_NUMBER_LINE_RANGES[ 0 ],
      preventOverlap: false,
      labelsInitiallyVisible: true,
      tickMarksInitiallyVisible: true
    } );

    // Changes the center position of the number line depending on its orientation
    numberLine.orientationProperty.link( orientation => {
      if ( orientation === Orientation.HORIZONTAL ) {
        numberLine.centerPositionProperty.value = NLDConstants.NLD_LAYOUT_BOUNDS.center;
      }
      else {
        numberLine.centerPositionProperty.value = NLDConstants.NLD_LAYOUT_BOUNDS.center.plusXY( 0, 75 );
      }
    } );

    super(
      numberLine,
      new PointController( {
        numberLines: [ numberLine ],
        color: 'magenta'
      } ),
      new PointController( {
        numberLines: [ numberLine ],
        color: 'blue'
      } ),
      tandem
    );

    // change box bounds when number line orientation changes
    this.numberLine.orientationProperty.link( orientation => {
      this.pointControllerBoxProperty.value = ( orientation === Orientation.HORIZONTAL ) ?
                                              NLDConstants.BOTTOM_BOX_BOUNDS :
                                              NLDConstants.SIDE_BOX_BOUNDS;
    } );
  }

}

numberLineDistance.register( 'NLDGenericModel', NLDGenericModel );
export default NLDGenericModel;
