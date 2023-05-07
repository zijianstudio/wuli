// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, HBox, Node, Text } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyIntroModel, { BlockSet } from '../model/BuoyancyIntroModel.js';

// constants
const blockSetStringMap = {
  [ BlockSet.SAME_MASS.name ]: DensityBuoyancyCommonStrings.blockSet.sameMassStringProperty,
  [ BlockSet.SAME_VOLUME.name ]: DensityBuoyancyCommonStrings.blockSet.sameVolumeStringProperty,
  [ BlockSet.SAME_DENSITY.name ]: DensityBuoyancyCommonStrings.blockSet.sameDensityStringProperty
};
const blockSetTandemNameMap = {
  [ BlockSet.SAME_MASS.name ]: 'sameMassLabel',
  [ BlockSet.SAME_VOLUME.name ]: 'sameVolumeLabel',
  [ BlockSet.SAME_DENSITY.name ]: 'sameDensityLabel'
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyIntroScreenView extends DensityBuoyancyScreenView<BuoyancyIntroModel> {

  public constructor( model: BuoyancyIntroModel, options: DensityBuoyancyScreenViewOptions ) {

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      // Custom just for this screen
      cameraLookAt: new Vector3( 0, -0.1, 0 )
    }, options ) );

    const blocksRadioButtonGroupTandem = options.tandem.createTandem( 'blocksRadioButtonGroup' );

    const blocksRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
      return {
        createNode: tandem => new Text( blockSetStringMap[ blockSet.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 160,
          tandem: tandem.createTandem( 'labelText' )
        } ),
        value: blockSet,
        tandemName: `${blockSetTandemNameMap[ blockSet.name ]}RadioButton`
      };
    } ), {
      align: 'left',
      tandem: blocksRadioButtonGroupTandem
    } );
    const blockSetPanel = new Panel( blocksRadioButtonGroup, DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( blockSetPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const displayOptionsPanel = new Panel( new DisplayOptionsNode( model ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );
    this.addChild( new AlignBox( displayOptionsPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    const radioButtonLabelOptions = {
      font: new PhetFont( 14 ),
      maxWidth: 120
    };
    const fluidBox = new HBox( {
      spacing: 20,
      children: [
        new AquaRadioButton( model.liquidMaterialProperty, Material.GASOLINE, new Text( Material.GASOLINE.nameProperty, radioButtonLabelOptions ) ),
        new AquaRadioButton( model.liquidMaterialProperty, Material.WATER, new Text( Material.WATER.nameProperty, radioButtonLabelOptions ) ),
        new AquaRadioButton( model.liquidMaterialProperty, Material.SEAWATER, new Text( Material.SEAWATER.nameProperty, radioButtonLabelOptions ) ),
        new AquaRadioButton( model.liquidMaterialProperty, Material.HONEY, new Text( Material.HONEY.nameProperty, radioButtonLabelOptions ) )
      ]
    } );
    const fluidTitle = new Text( DensityBuoyancyCommonStrings.fluid, {
      font: DensityBuoyancyCommonConstants.TITLE_FONT,
      right: fluidBox.left,
      bottom: fluidBox.top - 3,
      maxWidth: 160
    } );
    const fluidPanel = new Panel( new Node( {
      children: [ fluidTitle, fluidBox ]
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );

    this.addChild( new AlignBox( fluidPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyIntroScreenView', BuoyancyIntroScreenView );
