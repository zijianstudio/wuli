// Copyright 2022-2023, University of Colorado Boulder

/**
 * NumberSuiteCommonPreferencesNode is the user interface for sim-specific preferences for all Number suite sims,
 * accessed via the Preferences dialog. These preferences are global, and affect all screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { HBox, HBoxOptions, Node, VBox } from '../../../../scenery/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonPreferences from '../model/NumberSuiteCommonPreferences.js';
import { AnyScreen } from '../../../../joist/js/Screen.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import SecondLanguageControl from './SecondLanguageControl.js';
import ShowOnesControl from './ShowOnesControl.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import LabScreen from '../../lab/LabScreen.js';
import NumberSuiteCommonUtteranceQueue from './NumberSuiteCommonUtteranceQueue.js';

type SelfOptions = {
  secondLanguageControlEnabled?: boolean; // should the 'Second Language' control be enabled?
};

export type NumberSuiteCommonPreferencesNodeOptions = SelfOptions & StrictOmit<HBoxOptions, 'children'>;

export default class NumberSuiteCommonPreferencesNode extends HBox {

  protected constructor( preferences: NumberSuiteCommonPreferences,
                         utteranceQueue: NumberSuiteCommonUtteranceQueue,
                         additionalRightControls: Node[],
                         providedOptions?: NumberSuiteCommonPreferencesNodeOptions ) {

    const options = optionize<NumberSuiteCommonPreferencesNodeOptions, SelfOptions, HBoxOptions>()( {

      // SelfOptions
      secondLanguageControlEnabled: true,

      // HBoxOptions
      spacing: 40,
      align: 'top'
    }, providedOptions );

    const secondLanguageControl = new SecondLanguageControl( preferences, utteranceQueue, {
      visible: options.secondLanguageControlEnabled
    } );

    const showOnesControl = new ShowOnesControl( preferences.showLabOnesProperty, {
      visible: NumberSuiteCommonPreferencesNode.hasScreenType( LabScreen )
    } );

    const rightControls = new VBox( {
      children: [ ...additionalRightControls, showOnesControl ],
      align: 'left',
      spacing: NumberSuiteCommonConstants.PREFERENCES_VBOX_SPACING
    } );

    options.children = [ secondLanguageControl, rightControls ];

    super( options );
  }

  /**
   * Determines whether the sim is running with a screen of the specified type.
   */
  public static hasScreenType( constructor: new ( ...args: IntentionalAny[] ) => AnyScreen ): boolean {
    return ( _.find( phet.joist.sim.screens, screen => screen instanceof constructor ) !== undefined );
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonPreferencesNode', NumberSuiteCommonPreferencesNode );