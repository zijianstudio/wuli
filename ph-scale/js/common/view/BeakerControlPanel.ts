// Copyright 2013-2022, University of Colorado Boulder

/**
 * Controls for things that you see in the beaker.
 * This includes the 'H3O+/OH- Ratio' and 'Particle Counts' checkboxes.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HSeparator, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import phScale from '../../phScale.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import PHScaleColors from '../PHScaleColors.js';
import PHScaleConstants from '../PHScaleConstants.js';

// constants
const FONT = new PhetFont( 20 );

type SelfOptions = EmptySelfOptions;

type BeakerControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem' | 'maxWidth'>;

export default class BeakerControlPanel extends Panel {

  public constructor( ratioVisibleProperty: Property<boolean>, particleCountsVisibleProperty: Property<boolean>,
                      providedOptions: BeakerControlPanelOptions ) {

    const options = optionize<BeakerControlPanelOptions, SelfOptions, PanelOptions>()( {

      // PanelOptions
      xMargin: 15,
      yMargin: 10,
      lineWidth: 2,
      fill: PHScaleColors.PANEL_FILL,
      phetioDocumentation: 'control panel that appears below the beaker'
    }, providedOptions );

    // 'H3O+ / OH- Ratio' checkbox
    const ratioCheckbox = new RatioCheckbox( ratioVisibleProperty, options.tandem.createTandem( 'ratioCheckbox' ) );
    ratioCheckbox.touchArea = ratioCheckbox.localBounds.dilatedXY( 10, 6 );

    // 'Particle Counts' checkbox
    const particleCountsCheckbox = new ParticleCountsCheckbox( particleCountsVisibleProperty, options.tandem.createTandem( 'particleCountsCheckbox' ) );
    particleCountsCheckbox.touchArea = ratioCheckbox.localBounds.dilatedXY( 10, 6 );

    const content = new VBox( {
      children: [
        ratioCheckbox,
        new HSeparator(),
        particleCountsCheckbox
      ],
      align: 'left',
      spacing: 10
    } );

    super( content, options );
  }
}

/**
 * 'H3O+ / OH- Ratio' checkbox, with color-coded symbols
 */
class RatioCheckbox extends Checkbox {

  public constructor( ratioVisibleProperty: Property<boolean>, tandem: Tandem ) {

    const stringProperty = new DerivedProperty(
      [ PhScaleStrings.ratioStringProperty ],
      ( ratioString: string ) => StringUtils.fillIn( `{{h3o}} / {{oh}} ${ratioString} `, {
        h3o: `<span style="color:${PHScaleColors.H3O_PARTICLES.toCSS()}">${PHScaleConstants.H3O_FORMULA}</span>`,
        oh: `<span style="color:${PHScaleColors.OH_PARTICLES.toCSS()}">${PHScaleConstants.OH_FORMULA}</span>`
      } ), {
        tandem: tandem.createTandem( RichText.STRING_PROPERTY_TANDEM_NAME ),
        phetioValueType: StringIO
      } );

    const ratioText = new RichText( stringProperty, {
      font: FONT
    } );

    super( ratioVisibleProperty, ratioText, {
      tandem: tandem
    } );
  }
}

/**
 * 'Particle Counts' checkbox
 */
class ParticleCountsCheckbox extends Checkbox {

  public constructor( particleCountsVisibleProperty: Property<boolean>, tandem: Tandem ) {

    const text = new Text( PhScaleStrings.particleCountsStringProperty, {
      font: FONT,
      tandem: tandem.createTandem( 'text' )
    } );

    super( particleCountsVisibleProperty, text, {
      tandem: tandem
    } );
  }
}

phScale.register( 'BeakerControlPanel', BeakerControlPanel );