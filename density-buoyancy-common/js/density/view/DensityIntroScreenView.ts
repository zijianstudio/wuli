// Copyright 2019-2023, University of Colorado Boulder

/**
 * The main view for the Intro screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { AlignBox, Node, RichText } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import PrimarySecondaryControlsNode from '../../common/view/PrimarySecondaryControlsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityReadoutNode from './DensityReadoutNode.js';
import DensityIntroModel from '../model/DensityIntroModel.js';
import { DensityBuoyancyScreenViewOptions } from '../../common/view/DensityBuoyancyScreenView.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;

export default class DensityIntroScreenView extends SecondaryMassScreenView<DensityIntroModel> {

  protected rightBox: Node;

  public constructor( model: DensityIntroModel, options: DensityBuoyancyScreenViewOptions ) {

    const tandem = options.tandem;

    super( model, combineOptions<DensityBuoyancyScreenViewOptions>( {
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options ) );

    this.rightBox = new PrimarySecondaryControlsNode(
      model.primaryMass,
      model.secondaryMass,
      this.popupLayer,
      { tandem: tandem }
    );

    const accordionTandem = tandem.createTandem( 'densityAccordionBox' );
    const densityAccordionBox = new AccordionBox( new DensityReadoutNode(
      // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
      new DerivedProperty( [ model.primaryMass.materialProperty ], material => material.density ),
      new DerivedProperty( [ model.secondaryMass.materialProperty ], material => material.density ),
      model.secondaryMass.visibleProperty,
      {
        tandem: accordionTandem.createTandem( 'densityReadout' ),
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    ), combineOptions<AccordionBoxOptions>( {
      titleNode: new RichText( new DerivedProperty( [
        DensityBuoyancyCommonPreferences.volumeUnitsProperty,
        DensityBuoyancyCommonStrings.densityReadoutStringProperty,
        DensityBuoyancyCommonStrings.densityReadoutDecimetersCubedStringProperty
      ], ( units, litersReadout, decimetersCubedReadout ) => {
        return units === 'liters' ? litersReadout : decimetersCubedReadout;
      } ), {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200,
        visiblePropertyOptions: {
          phetioReadOnly: true
        },
        tandem: accordionTandem.createTandem( 'titleText' )
      } ),
      expandedProperty: model.densityExpandedProperty,
      buttonAlign: 'left' as const,
      tandem: accordionTandem
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS ) );

    this.addChild( new AlignBox( densityAccordionBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    } ) );

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

densityBuoyancyCommon.register( 'DensityIntroScreenView', DensityIntroScreenView );
