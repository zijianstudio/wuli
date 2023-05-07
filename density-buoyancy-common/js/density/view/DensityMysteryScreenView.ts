// Copyright 2020-2023, University of Colorado Boulder

/**
 * The main view for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import { AlignBox, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityMysteryModel, { BlockSet } from '../model/DensityMysteryModel.js';
import DensityTableNode from './DensityTableNode.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// constants
const blockSetStringMap = {
  [ BlockSet.SET_1.name ]: DensityBuoyancyCommonStrings.blockSet.set1StringProperty,
  [ BlockSet.SET_2.name ]: DensityBuoyancyCommonStrings.blockSet.set2StringProperty,
  [ BlockSet.SET_3.name ]: DensityBuoyancyCommonStrings.blockSet.set3StringProperty,
  [ BlockSet.RANDOM.name ]: DensityBuoyancyCommonStrings.blockSet.randomStringProperty
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class DensityMysteryScreenView extends DensityBuoyancyScreenView<DensityMysteryModel> {
  public constructor( model: DensityMysteryModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    const densityTableAccordionBoxTandem = tandem.createTandem( 'densityTableAccordionBox' );
    const densityTableAccordionBox = new AccordionBox( new DensityTableNode(), combineOptions<AccordionBoxOptions>( {
      titleNode: new Text( DensityBuoyancyCommonStrings.densityTableStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200,
        tandem: densityTableAccordionBoxTandem.createTandem( 'titleText' )
      } ),
      expandedProperty: model.densityTableExpandedProperty,
      tandem: densityTableAccordionBoxTandem
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( densityTableAccordionBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    const blockSetTandemMap = {
      [ BlockSet.SET_1.name ]: 'set1',
      [ BlockSet.SET_2.name ]: 'set2',
      [ BlockSet.SET_3.name ]: 'set3',
      [ BlockSet.RANDOM.name ]: 'random'
    };

    const blocksPanelTandem = tandem.createTandem( 'blocksPanel' );
    const blocksRadioButtonGroupTandem = blocksPanelTandem.createTandem( 'blocksRadioButtonGroup' );

    const blocksRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
      return {
        createNode: tandem => new Text( blockSetStringMap[ blockSet.name ], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 65,
          tandem: tandem.createTandem( 'labelText' )
        } ),
        value: blockSet,
        tandemName: `${blockSetTandemMap[ blockSet.name ]}RadioButton`
      };
    } ), {
      align: 'left',
      spacing: 8,
      tandem: blocksRadioButtonGroupTandem
    } );
    const randomBlocksRefreshButton = new RefreshButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.regenerate( BlockSet.RANDOM );
      },
      iconHeight: 20,
      tandem: blocksPanelTandem.createTandem( 'randomBlocksRefreshButton' )
    } );
    const blockSetContent = new VBox( {
      spacing: 10
    } );

    // Include the refresh button when in random blockSet.
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.blockSetProperty.link( blockSet => {
      blockSetContent.children = blockSet === BlockSet.RANDOM ? [
        blocksRadioButtonGroup,
        randomBlocksRefreshButton
      ] : [
        blocksRadioButtonGroup
      ];
    } );

    const blockSetPanel = new Panel( new VBox( {
      children: [
        new Text( DensityBuoyancyCommonStrings.blocksStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 85,
          tandem: blocksPanelTandem.createTandem( 'titleText' )
        } ),
        blockSetContent
      ],
      spacing: 10,
      align: 'left'
    } ), combineOptions<PanelOptions>( {
      tandem: blocksPanelTandem
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );

    this.addChild( new AlignBox( blockSetPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'DensityMysteryScreenView', DensityMysteryScreenView );
