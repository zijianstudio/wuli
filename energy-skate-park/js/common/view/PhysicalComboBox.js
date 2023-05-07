// Copyright 2019-2023, University of Colorado Boulder

/**
 * A combo box that controls one of the physical Properties of Energy Skate Park. In addition to the options provided
 * by this combo box, the value can optionally be something else or controlled in other ways. When this happens,
 * the combo box displays 'Custom'.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import { Text } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';

// constants
const controlsGravityCustomString = EnergySkateParkStrings.physicalControls.customStringProperty;

class PhysicalComboBox extends ComboBox {

  /**
   * @param {Property} physicalProperty
   * @param {BooleanProperty} userControlledProperty
   * @param {Array.<Object>} labelValueList - entries like {label:{string}, value:{number}}
   * @param {Emitter} resetEmitter
   * @param {Node} listParent - parent for the ComboBoxListBox
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( physicalProperty, userControlledProperty, labelValueList, resetEmitter, listParent, tandem, options ) {
    assert && assert( _.find( labelValueList, entry => entry.value === null ) === undefined, 'PhysicalComboBox adds "Custom" item' );

    options = merge( {

      // {boolean} whether or not the physicalProperty can be set to something other than the entries defined
      // in labelValueList
      supportCustom: true,

      tandem: tandem
    }, EnergySkateParkConstants.COMBO_BOX_OPTIONS, options );

    // {[].ComboBoxItem}
    const itemList = [];
    labelValueList.forEach( ( entry, i ) => {
      itemList.push( {
        value: entry.value,
        createNode: () => new Text( entry.label, EnergySkateParkConstants.COMBO_BOX_ITEM_OPTIONS ),
        tandemName: entry.tandemName
      } );
    } );

    // Redundant "scrap" nodes to check on i18n dimensions, this was needed when converting to the "createNode" pattern
    // of ComboBox items, see https://github.com/phetsims/sun/issues/797
    const tempNodes = labelValueList.map( entry => new Text( entry.label, EnergySkateParkConstants.COMBO_BOX_ITEM_OPTIONS ) );

    // i18n - if the text gets scaled way down, make sure that the button corner radii aren't larger than content height
    const maxItemHeight = _.maxBy( tempNodes, node => node.height ).height;
    options.cornerRadius = Math.min( options.cornerRadius, maxItemHeight / 2 );
    tempNodes.forEach( node => node.dispose() );

    if ( options.supportCustom ) {
      itemList.push( {
        value: null,
        createNode: () => new Text( controlsGravityCustomString, EnergySkateParkConstants.COMBO_BOX_ITEM_OPTIONS ),
        tandemName: 'customItem'
      } );
    }

    // adapter Property for the ComboBox because the physicalProperty can be set to values other than those defined
    // in labelValueList - value is null which means 'Custom'
    const adapterProperty = new Property( physicalProperty.value, {
      reentrant: true,
      phetioValueType: NullableIO( NumberIO ),
      tandem: tandem.createTandem( 'adapterProperty' )
    } );

    // {boolean} - if true, we will prevent the userControlProperty from being set when the adapterProperty changes.
    // The adapterProperty may change from direct control of the ComboBox OR if the physicalProperty changes
    // from somewhere else in the simulation (such as playback of EnergySkateParkDataSamples, or ResetAll). If
    // changed internally, we do NOT want to indicate that user is in control of the physicalProperty.
    let preventUserControl = false;

    // if an entry in the combo box is selected to any entry other than "custom", update the actual Property
    adapterProperty.lazyLink( value => {
      !preventUserControl && userControlledProperty.set( true );
      if ( value ) { physicalProperty.set( value ); }
      !preventUserControl && userControlledProperty.set( false );
    } );

    // if the physical Property changes as a result of anything other than the adapter Property, set to null
    if ( options.supportCustom ) {
      physicalProperty.link( physicalValue => {

        // physicalProperty is getting set from within simulatuion, do not set userControlledProperty
        preventUserControl = true;

        // if the new value is one of the ComboBox values, update so that selected value is read on ComboBox display
        let adapterValue = null;
        labelValueList.forEach( entry => {
          if ( entry.value === physicalValue ) {
            adapterValue = entry.value;
          }
        } );
        adapterProperty.set( adapterValue );

        preventUserControl = false;
      } );
    }

    // the only case where an external physicalProperty change should update
    resetEmitter.addListener( () => {
      adapterProperty.reset();
    } );

    super( adapterProperty, itemList, listParent, options );
  }
}

energySkatePark.register( 'PhysicalComboBox', PhysicalComboBox );
export default PhysicalComboBox;