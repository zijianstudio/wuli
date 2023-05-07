// Copyright 2019-2023, University of Colorado Boulder

/**
 * The main view for the Explore screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, GridBox, HBox, HStrut, Node, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import DensityControlNode from '../../common/view/DensityControlNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import GravityControlNode from '../../common/view/GravityControlNode.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import BuoyancyExploreModel from '../model/BuoyancyExploreModel.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class BuoyancyExploreScreenView extends SecondaryMassScreenView<BuoyancyExploreModel> {

  protected rightBox: Node;

  public constructor( model: BuoyancyExploreModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options ) );

    const displayOptionsNode = new DisplayOptionsNode( model );

    const getMaterialReadoutStringProperty = ( materialProperty: TReadOnlyProperty<Material> ) => new PatternStringProperty( DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY, {
      value: materialProperty
    }, {
      maps: {
        value: material => material.density / 1000
      },
      decimalPlaces: 2
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    const densityAText = new RichText( getMaterialReadoutStringProperty( model.primaryMass.materialProperty ), {
      maxWidth: 120,
      font: DensityBuoyancyCommonConstants.ITEM_FONT,
      fill: DensityBuoyancyCommonColors.labelAProperty,
      layoutOptions: { column: 1, row: 0 }
    } );
    const densityBText = new RichText( getMaterialReadoutStringProperty( model.secondaryMass.materialProperty ), {
      maxWidth: 120,
      font: DensityBuoyancyCommonConstants.ITEM_FONT,
      fill: DensityBuoyancyCommonColors.labelBProperty,
      layoutOptions: { column: 1, row: 1 }
    } );

    const labelAText = new Text( DensityBuoyancyCommonStrings.blockAStringProperty, {
      font: new PhetFont( 14 ),
      maxWidth: 200,
      layoutOptions: { column: 0, row: 0 }
    } );
    const labelBText = new Text( DensityBuoyancyCommonStrings.blockBStringProperty, {
      font: new PhetFont( 14 ),
      maxWidth: 200,
      layoutOptions: { column: 0, row: 1 }
    } );

    const densityReadoutBox = new GridBox( {
      children: [ densityAText, densityBText, labelAText, labelBText ],
      xMargin: 5,
      yMargin: 3,
      xAlign: 'left',
      yAlign: 'center'
    } );

    const densityContainer = new Node( {
      children: [
        densityReadoutBox,
        new HStrut( displayOptionsNode.width - 10 ) // Same internal size as displayOptionsNode
      ]
    } );

    const densityBox = new AccordionBox( densityContainer, combineOptions<AccordionBoxOptions>( {
      titleNode: new Text( DensityBuoyancyCommonStrings.densityStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 160
      } ),
      expandedProperty: model.densityExpandedProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( new VBox( {
      spacing: 10,
      children: [
        // Keep the density box at the top of its possible location, even if it reduces in size due to the second mass
        // not being visible.
        new AlignBox( densityBox, {
          alignBounds: densityBox.bounds.copy(),
          localBounds: densityBox.bounds.copy(),
          yAlign: 'top'
        } ),
        new Panel( displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ]
    } ), {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    // Adjust the visibility after, since we want to size the box's location for its "full" bounds
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.secondaryMass.visibleProperty.link( visible => {
      labelBText.visible = visible;
      densityBText.visible = visible;
    } );

    const bottomNode = new HBox( {
      spacing: 2 * MARGIN,
      children: [
        new Panel( new DensityControlNode( model.liquidMaterialProperty, [
          Material.GASOLINE,
          Material.OIL,
          Material.WATER,
          Material.SEAWATER,
          Material.HONEY,
          Material.MERCURY,
          Material.DENSITY_A,
          Material.DENSITY_B
        ], this.popupLayer, tandem.createTandem( 'densityControlNode' ) ), DensityBuoyancyCommonConstants.PANEL_OPTIONS ),
        new Panel( new GravityControlNode( model.gravityProperty, this.popupLayer, tandem.createTandem( 'gravityControlNode' ) ), DensityBuoyancyCommonConstants.PANEL_OPTIONS )
      ]
    } );

    this.addChild( new AlignBox( bottomNode, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    } ) );

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      {
        tandem: tandem,
        minCustomMass: 0.1,
        maxCustomMass: 27
      }
    );

    this.addChild( new AlignBox( this.rightBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointProperty.value = new DerivedProperty( [ this.rightBox.boundsProperty, this.visibleBoundsProperty ], ( boxBounds, visibleBounds ) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2( isFinite( boxBounds.left ) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY );
    } );

    this.addSecondMassControl( model.modeProperty );

    this.addChild( this.popupLayer );
  }
}

densityBuoyancyCommon.register( 'BuoyancyExploreScreenView', BuoyancyExploreScreenView );
