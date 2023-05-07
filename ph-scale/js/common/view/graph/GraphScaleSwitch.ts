// Copyright 2020-2022, University of Colorado Boulder

/**
 * GraphScaleSwitch is the control for switching between logarithmic and linear scales.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';
import { NodeTranslationOptions, Text, TextOptions } from '../../../../../scenery/js/imports.js';
import ABSwitch, { ABSwitchOptions } from '../../../../../sun/js/ABSwitch.js';
import phScale from '../../../phScale.js';
import PhScaleStrings from '../../../PhScaleStrings.js';
import PHScaleConstants from '../../PHScaleConstants.js';
import GraphScale from './GraphScale.js';

type SelfOptions = EmptySelfOptions;

type GraphScaleSwitchOptions = SelfOptions & NodeTranslationOptions & PickRequired<ABSwitchOptions, 'tandem'>;

export default class GraphScaleSwitch extends ABSwitch<GraphScale> {

  public constructor( graphScaleProperty: EnumerationProperty<GraphScale>, providedOptions: GraphScaleSwitchOptions ) {

    const options = optionize<GraphScaleSwitchOptions, SelfOptions, ABSwitchOptions>()( {

      // ABSwitchOptions
      toggleSwitchOptions: { size: new Dimension2( 50, 25 ) },
      centerOnSwitch: true,
      phetioDocumentation: 'A/B switch for switching between logarithmic and linear scales'
    }, providedOptions );

    const textOptions = {
      font: PHScaleConstants.AB_SWITCH_FONT,
      maxWidth: 125
    };

    // Logarithmic label
    const logarithmicText = new Text( PhScaleStrings.logarithmicStringProperty, combineOptions<TextOptions>(
      {}, textOptions, {
        tandem: options.tandem.createTandem( 'logarithmicText' ),
        phetioVisiblePropertyInstrumented: true
      } ) );

    // Linear label
    const linearText = new Text( PhScaleStrings.linearStringProperty, combineOptions<TextOptions>(
      {}, textOptions, {
        tandem: options.tandem.createTandem( 'linearText' ),
        phetioVisiblePropertyInstrumented: true
      } ) );

    super( graphScaleProperty, GraphScale.LOGARITHMIC, logarithmicText, GraphScale.LINEAR, linearText, options );
  }
}

phScale.register( 'GraphScaleSwitch', GraphScaleSwitch );