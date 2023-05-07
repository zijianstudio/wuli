// Copyright 2020-2022, University of Colorado Boulder

/**
 * GraphScaleSwitch is the control for switching between Concentration and Quantity units for the graphs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';
import { NodeTranslationOptions, RichText } from '../../../../../scenery/js/imports.js';
import ABSwitch, { ABSwitchOptions } from '../../../../../sun/js/ABSwitch.js';
import StringIO from '../../../../../tandem/js/types/StringIO.js';
import phScale from '../../../phScale.js';
import PhScaleStrings from '../../../PhScaleStrings.js';
import PHScaleConstants from '../../PHScaleConstants.js';
import GraphUnits from './GraphUnits.js';

type SelfOptions = EmptySelfOptions;

type GraphUnitsSwitchOptions = SelfOptions & NodeTranslationOptions & PickRequired<ABSwitchOptions, 'tandem'>;

export default class GraphUnitsSwitch extends ABSwitch<GraphUnits> {

  public constructor( graphUnitsProperty: EnumerationProperty<GraphUnits>, provideOptions: GraphUnitsSwitchOptions ) {

    const options = optionize<GraphUnitsSwitchOptions, SelfOptions, ABSwitchOptions>()( {

      // ABSwitchOptions
      toggleSwitchOptions: { size: new Dimension2( 50, 25 ) },
      centerOnSwitch: true,
      phetioDocumentation: 'A/B switch for switching units'
    }, provideOptions );

    // Concentration (mol/L)
    const concentrationTextTandem = options.tandem.createTandem( 'concentrationText' );
    const concentrationStringProperty = new DerivedProperty(
      [ PhScaleStrings.concentrationStringProperty, PhScaleStrings.units.molesPerLiterStringProperty ],
      ( concentrationString, molesPerLiterString ) => `${concentrationString}<br>(${molesPerLiterString})`, {
        tandem: concentrationTextTandem.createTandem( RichText.STRING_PROPERTY_TANDEM_NAME ),
        phetioValueType: StringIO
      } );
    const concentrationText = new RichText( concentrationStringProperty, {
      align: 'center',
      font: PHScaleConstants.AB_SWITCH_FONT,
      maxWidth: 125,
      tandem: concentrationTextTandem,
      phetioVisiblePropertyInstrumented: true
    } );

    // Quantity (mol)
    const quantityTextTandem = options.tandem.createTandem( 'quantityText' );
    const quantityStringProperty = new DerivedProperty(
      [ PhScaleStrings.quantityStringProperty, PhScaleStrings.units.molesStringProperty ],
      ( quantityString, molesString ) => `${quantityString}<br>(${molesString})`, {
        tandem: quantityTextTandem.createTandem( RichText.STRING_PROPERTY_TANDEM_NAME ),
        phetioValueType: StringIO
      } );
    const quantityText = new RichText( quantityStringProperty, {
      align: 'center',
      font: PHScaleConstants.AB_SWITCH_FONT,
      maxWidth: 90,
      tandem: quantityTextTandem,
      phetioVisiblePropertyInstrumented: true
    } );

    super( graphUnitsProperty, GraphUnits.MOLES_PER_LITER, concentrationText, GraphUnits.MOLES, quantityText, options );
  }
}

phScale.register( 'GraphUnitsSwitch', GraphUnitsSwitch );