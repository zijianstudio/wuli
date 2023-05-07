// Copyright 2023, University of Colorado Boulder

import CAVAccordionBox from '../../common/view/CAVAccordionBox.js';
import { AlignGroup, Node, Text } from '../../../../scenery/js/imports.js';
import CenterAndVariabilityStrings from '../../CenterAndVariabilityStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import centerAndVariability from '../../centerAndVariability.js';
import MeanAndMedianModel from '../model/MeanAndMedianModel.js';
import MedianPlotNode from './MedianPlotNode.js';
import TopRepresentationCheckboxGroup from '../../common/view/TopRepresentationCheckboxGroup.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';

export default class MeanAndMedianAccordionBox extends CAVAccordionBox {

  public constructor( model: MeanAndMedianModel, layoutBounds: Bounds2, tandem: Tandem, top: number, playAreaNumberLineNode: Node ) {
    const iconGroup = new AlignGroup();

    const checkboxGroup = new VerticalCheckboxGroup( [
      TopRepresentationCheckboxGroup.getMedianCheckboxWithIconItem( iconGroup, model.isShowingTopMedianProperty ),
      TopRepresentationCheckboxGroup.getMeanCheckboxWithIconItem( iconGroup, model.isShowingTopMeanProperty )
    ], {
      tandem: tandem.createTandem( 'accordionCheckboxGroup' )
    } );

    // There is only one scene in the mean and median screen
    const sceneModel = model.selectedSceneModelProperty.value;

    const plotNode = new MedianPlotNode( model, sceneModel, { tandem: tandem.createTandem( 'plotNode' ) } );

    super( sceneModel.resetEmitter, plotNode,
      new Text( CenterAndVariabilityStrings.distanceInMetersStringProperty, {
        font: new PhetFont( 16 ),
        maxWidth: 300
      } ),
      layoutBounds,
      checkboxGroup,
      {
        leftMargin: 0,
        tandem: tandem,
        top: top,
        centerX: layoutBounds.centerX
      }
    );
  }
}

centerAndVariability.register( 'MeanAndMedianAccordionBox', MeanAndMedianAccordionBox );