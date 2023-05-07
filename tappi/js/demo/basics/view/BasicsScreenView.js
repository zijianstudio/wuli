// Copyright 2019-2022, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import ScreenView from '../../../../../joist/js/ScreenView.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../../scenery/js/imports.js';
import ABSwitch from '../../../../../sun/js/ABSwitch.js';
import BooleanRectangularToggleButton from '../../../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import tappi from '../../../tappi.js';
import vibrationManager, { Intensity } from '../../../vibrationManager.js';

// constants
const LABEL_FONT = new PhetFont( { size: 100 } );
const SWITCH_TEXT_FONT = new PhetFont( { size: 80 } );

class BasicsScreenView extends ScreenView {

  /**
   * @param {BasicsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super();

    // button that initiates vibration - adapterProperty required because the button shouldn't set the
    // vibration property directly
    const adapterProperty = new BooleanProperty( vibrationManager.vibratingProperty.get() );
    const trueNode = new Text( 'Stop Vibrate', { font: LABEL_FONT } );
    const falseNode = new Text( 'Start Vibrate', { font: LABEL_FONT } );
    const vibrationToggleButton = new BooleanRectangularToggleButton( adapterProperty, trueNode, falseNode );

    // switch that changes between high and low vibration
    const intensityAdapterProperty = new EnumerationProperty( Intensity.HIGH );
    const intensitySwitch = new ABSwitch(
      intensityAdapterProperty,
      Intensity.HIGH, new Text( 'High', { font: SWITCH_TEXT_FONT } ),
      Intensity.LOW, new Text( 'Low', { font: SWITCH_TEXT_FONT } ),
      {
        toggleSwitchOptions: { size: new Dimension2( 180, 90 ) },
        spacing: 20
      }
    );
    const intensityLabel = new Text( 'Intensity', { font: LABEL_FONT } );

    adapterProperty.lazyLink( vibrating => {
      if ( vibrating ) {
        vibrationManager.startVibrate();
      }
      else {
        vibrationManager.stopVibrate();
      }
    } );

    // NOTE: It would be cool if this wasn't necessary, but it feels weird that all of the API goes through the
    // Property
    intensityAdapterProperty.lazyLink( intensity => {
      vibrationManager.setVibrationIntensity( intensity );
    } );

    // layout
    const switchContainer = new Node( { children: [ intensitySwitch, intensityLabel ] } );
    intensityLabel.centerTop = intensitySwitch.centerBottom;
    switchContainer.centerBottom = this.layoutBounds.centerBottom;

    vibrationToggleButton.centerTop = this.layoutBounds.centerTop;

    // add to view
    this.addChild( vibrationToggleButton );
    this.addChild( switchContainer );
  }

  // @public
  step( dt ) {
  }
}

tappi.register( 'BasicsScreenView', BasicsScreenView );
export default BasicsScreenView;