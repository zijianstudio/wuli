// Copyright 2019-2023, University of Colorado Boulder

/**
 * The main view for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import UnitConversionProperty from '../../../../axon/js/UnitConversionProperty.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { AlignBox, Node, PhetioControlledVisibilityProperty, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView, { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityCompareModel, { BlockSet } from '../model/DensityCompareModel.js';
import ComparisonNumberControl from './ComparisonNumberControl.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// constants
const blockSetStringMap = {
  [ BlockSet.SAME_MASS.name ]: DensityBuoyancyCommonStrings.blockSet.sameMassStringProperty,
  [ BlockSet.SAME_VOLUME.name ]: DensityBuoyancyCommonStrings.blockSet.sameVolumeStringProperty,
  [ BlockSet.SAME_DENSITY.name ]: DensityBuoyancyCommonStrings.blockSet.sameDensityStringProperty
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class DensityCompareScreenView extends DensityBuoyancyScreenView<DensityCompareModel> {

  private positionPanel: () => void;

  public constructor( model: DensityCompareModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    const blockSetTandemMap = {
      [ BlockSet.SAME_MASS.name ]: 'sameMass',
      [ BlockSet.SAME_VOLUME.name ]: 'sameVolume',
      [ BlockSet.SAME_DENSITY.name ]: 'sameDensity'
    };

    const blocksPanelTandem = tandem.createTandem( 'blocksPanel' );
    const blocksRadioButtonGroupTandem = blocksPanelTandem.createTandem( 'blocksRadioButtonGroup' );
    const blocksPanel = new Panel( new VBox( {
      children: [
        new Text( DensityBuoyancyCommonStrings.blocksStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 160,
          tandem: blocksPanelTandem.createTandem( 'titleText' )
        } ),
        new VerticalAquaRadioButtonGroup( model.blockSetProperty, BlockSet.enumeration.values.map( blockSet => {
          return {
            createNode: tandem => new Text( blockSetStringMap[ blockSet.name ], {
              font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
              maxWidth: 160,
              tandem: tandem.createTandem( 'labelText' )
            } ),
            value: blockSet,
            tandemName: `${blockSetTandemMap[ blockSet.name ]}RadioButton`
          };
        } ), {
          align: 'left',
          spacing: 8,
          tandem: blocksRadioButtonGroupTandem
        } )
      ],
      spacing: 10,
      align: 'left'
    } ), combineOptions<PanelOptions>( {
      tandem: blocksPanelTandem
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );

    this.addChild( new AlignBox( blocksPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    } ) );

    // For unit conversion, cubic meters => liters
    const volumeProperty = new UnitConversionProperty( model.volumeProperty, {
      factor: 1000
    } );

    // For unit conversion, kg/cubic meter => kg/liter
    const densityProperty = new UnitConversionProperty( model.densityProperty, {
      factor: 1 / 1000
    } );

    const massNumberControlTandem = tandem.createTandem( 'massNumberControl' );
    const massNumberControl = new ComparisonNumberControl(
      model.massProperty,
      DensityBuoyancyCommonStrings.massStringProperty,
      DensityBuoyancyCommonStrings.kilogramsPatternStringProperty,
      'kilograms',
      {
        tandem: massNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ model.blockSetProperty ], blockSet => blockSet === BlockSet.SAME_MASS, {
          nodeTandem: massNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: model.massProperty
        }
      }
    );

    const volumeNumberControlTandem = tandem.createTandem( 'volumeNumberControl' );
    const volumeNumberControl = new ComparisonNumberControl(
      volumeProperty,
      DensityBuoyancyCommonStrings.volumeStringProperty,
      DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
      'value',
      {
        tandem: volumeNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ model.blockSetProperty ], blockSet => blockSet === BlockSet.SAME_VOLUME, {
          nodeTandem: volumeNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: model.volumeProperty
        }
      }
    );

    const densityNumberControlTandem = tandem.createTandem( 'densityNumberControl' );
    const densityNumberControl = new ComparisonNumberControl(
      densityProperty,
      DensityBuoyancyCommonStrings.densityStringProperty,
      DensityBuoyancyCommonConstants.KILOGRAMS_PER_VOLUME_PATTERN_STRING_PROPERTY,
      'value',
      {
        tandem: densityNumberControlTandem,
        visibleProperty: new PhetioControlledVisibilityProperty( [ model.blockSetProperty ], blockSet => blockSet === BlockSet.SAME_DENSITY, {
          nodeTandem: densityNumberControlTandem
        } ),
        sliderOptions: {
          phetioLinkedProperty: model.densityProperty
        }
      }
    );

    const numberControlPanel = new Panel( new Node( {
      children: [
        massNumberControl,
        volumeNumberControl,
        densityNumberControl
      ],
      excludeInvisibleChildrenFromBounds: true
    } ), combineOptions<PanelOptions>( {
      visibleProperty: DerivedProperty.or( [ massNumberControl.visibleProperty, volumeNumberControl.visibleProperty, densityNumberControl.visibleProperty ] )
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS ) );
    this.addChild( numberControlPanel );

    this.positionPanel = () => {
      // We should be MARGIN below where the edge of the ground exists
      const groundFrontPoint = this.modelToViewPoint( new Vector3( 0, 0, model.groundBounds.maxZ ) );
      numberControlPanel.top = groundFrontPoint.y + MARGIN;
      numberControlPanel.right = this.visibleBoundsProperty.value.maxX - 10;
    };

    this.positionPanel();
    // This instance lives for the lifetime of the simulation, so we don't need to remove these listeners
    this.transformEmitter.addListener( this.positionPanel );
    this.visibleBoundsProperty.lazyLink( this.positionPanel );
    numberControlPanel.localBoundsProperty.lazyLink( this.positionPanel );

    this.addChild( this.popupLayer );
  }

  public override layout( viewBounds: Bounds2 ): void {
    super.layout( viewBounds );

    // If the simulation was not able to load for WebGL, bail out
    if ( !this.sceneNode ) {
      return;
    }

    this.positionPanel();
  }
}

densityBuoyancyCommon.register( 'DensityCompareScreenView', DensityCompareScreenView );
