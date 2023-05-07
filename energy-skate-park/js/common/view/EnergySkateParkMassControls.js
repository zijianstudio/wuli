// Copyright 2020-2022, University of Colorado Boulder

/**
 * Collection of controls for EnergySkateParkControlPanel that pertain to Skater mass.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { VBox } from '../../../../scenery/js/imports.js';
import energySkatePark from '../../energySkatePark.js';
import MassComboBox from './MassComboBox.js';
import MassNumberControl from './MassNumberControl.js';
import MassSlider from './MassSlider.js';

class EnergySkateParkMassControls extends VBox {

  /**
   * @param {NumberProperty} massProperty
   * @param {BooleanProperty} userControlledProperty
   * @param {Range} massRange - allowable range for the Skater mass
   * @param {Property} skaterImageSetProperty - controls the current image for the SkaterNode
   * @param {[type]} resetEmitter - broadcasts when EnergySkateParkModel has been reset
   * @param {Node} listParent - parent Node for the ComboBox, if one is included
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( massProperty, userControlledProperty, massRange, skaterImageSetProperty, resetEmitter, listParent, tandem, options ) {

    options = merge( {

      // {boolean} whether or not a MassNumberControl is included in this set of controls, only a MassNumberControl
      // OR a MassSlider can be used at one time
      includeMassNumberControl: true,

      // {boolean} whether or not a MassNumberControl is included in this set of controls
      includeMassSlider: false,

      // {boolean} whether or not a MassComboBox is included in this set of controls
      includeMassComboBox: false,

      // {Object|null} - options passed along to the MassNumberControl, if one is included
      massNumberControlOptions: null,

      // {Object|null} - options passed along to the MassComboBox, if one is included
      massComboBoxOptions: null
    }, options );
    assert && assert( !( options.includeMassSlider && options.includeMassNumberControl ), 'only MassSlider OR MassNumberControl can be used at one time' );

    const children = [];

    let massComboBox = null;
    if ( options.includeMassComboBox ) {
      massComboBox = new MassComboBox( massProperty, userControlledProperty, resetEmitter, listParent, tandem.createTandem( 'massComboBox' ), options.massComboBoxOptions );
      children.push( massComboBox );
    }

    let massNumberControl = null;
    if ( options.includeMassNumberControl ) {
      massNumberControl = new MassNumberControl( massProperty, userControlledProperty, massRange, tandem.createTandem( 'massNumberControl' ), options.massNumberControlOptions );
      children.push( massNumberControl );
    }

    let massSlider = null;
    if ( options.includeMassSlider ) {

      // TODO: https://github.com/phetsims/energy-skate-park/issues/344 rename the class, perhaps up the hierarchy
      massSlider = new MassSlider( massProperty, userControlledProperty, massRange, tandem.createTandem( 'massNumberControl' ) );
      children.push( massSlider );
    }

    super( { spacing: 8, children: children } );

    this.massComboBox = massComboBox;
  }

  /**
   * Set the width of the component to match the width of other controls in a containing control panel.
   * @public
   *
   * @param width
   */
  matchLayout( width ) {
    if ( this.massComboBox ) {
      this.massComboBox.matchLayout( width );
    }
  }
}

energySkatePark.register( 'EnergySkateParkMassControls', EnergySkateParkMassControls );
export default EnergySkateParkMassControls;