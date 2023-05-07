// Copyright 2023, University of Colorado Boulder

import CAVAccordionBox from '../../common/view/CAVAccordionBox.js';
import CardNodeContainer from './CardNodeContainer.js';
import { Text } from '../../../../scenery/js/imports.js';
import CenterAndVariabilityStrings from '../../CenterAndVariabilityStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import MedianModel from '../model/MedianModel.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import centerAndVariability from '../../centerAndVariability.js';
import TopRepresentationCheckboxGroup from '../../common/view/TopRepresentationCheckboxGroup.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';

export default class MedianAccordionBox extends CAVAccordionBox {

  public constructor( model: MedianModel, layoutBounds: Bounds2, tandem: Tandem, top: number ) {

    const cardNodeContainer = new CardNodeContainer( model, {
      // Expose this intermediate layer to make it so that clients can hide the number cards with one call
      tandem: tandem.createTandem( 'cardNodeContainer' )
    } );

    const checkboxGroup = new VerticalCheckboxGroup( [
      TopRepresentationCheckboxGroup.getSortDataCheckboxItem( model.isSortingDataProperty ),
      TopRepresentationCheckboxGroup.getMedianCheckboxWithoutIconItem( model.isShowingTopMedianProperty )
    ], {
      tandem: tandem.createTandem( 'accordionCheckboxGroup' )
    } );

    super( model.selectedSceneModelProperty.value.resetEmitter, cardNodeContainer,
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
      } );
  }


}

centerAndVariability.register( 'MedianAccordionBox', MedianAccordionBox );