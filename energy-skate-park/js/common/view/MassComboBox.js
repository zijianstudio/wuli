// Copyright 2018-2022, University of Colorado Boulder

/**
 * A combo box that can be used to change the masses in Energy Skate Park. Includes a title and the
 * ComboBox.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import SkaterMasses from '../SkaterMasses.js';
import LabelledComboBox from './LabelledComboBox.js';
import PhysicalComboBox from './PhysicalComboBox.js';

const controlsSkaterString = EnergySkateParkStrings.skaterControls.labelStringProperty;
const controlsSkater1MassPatternString = EnergySkateParkStrings.skaterControls.skater1MassPatternStringProperty;
const controlsSkater2MassPatternString = EnergySkateParkStrings.skaterControls.skater2MassPatternStringProperty;
const controlsSkater3MassPatternString = EnergySkateParkStrings.skaterControls.skater3MassPatternStringProperty;
const controlsSkater4MassPatternString = EnergySkateParkStrings.skaterControls.skater4MassPatternStringProperty;
const controlsSkater5MassPatternString = EnergySkateParkStrings.skaterControls.skater5MassPatternStringProperty;
const controlsDogMassPatternString = EnergySkateParkStrings.skaterControls.dogMassPatternStringProperty;

class MassComboBox extends LabelledComboBox {

  /**
   * @param {NumberProperty} massProperty
   * @param {BooleanProperty} userControlledProperty
   * @param {Emitter} resetEmitter - broadcasts when the EnergySkateParkModel has been reset
   * @param {Node} listParent - parent of the list, to make sure the list is on top other things in the vie
   * @param {Tandem} tandem
   */
  constructor( massProperty, userControlledProperty, resetEmitter, listParent, tandem ) {
    const labelValueList = [
      {
        label: getFormattedLabel( controlsSkater1MassPatternString, SkaterMasses.SKATER_1_MASS ),
        value: SkaterMasses.SKATER_1_MASS,
        tandemName: `skater1Mass${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      },
      {
        label: getFormattedLabel( controlsSkater2MassPatternString, SkaterMasses.SKATER_2_MASS ),
        value: SkaterMasses.SKATER_2_MASS,
        tandemName: `skater2Mass${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      },
      {
        label: getFormattedLabel( controlsSkater3MassPatternString, SkaterMasses.SKATER_3_MASS ),
        value: SkaterMasses.SKATER_3_MASS,
        tandemName: `skater3Mass${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      },
      {
        label: getFormattedLabel( controlsSkater4MassPatternString, SkaterMasses.SKATER_4_MASS ),
        value: SkaterMasses.SKATER_4_MASS,
        tandemName: `skater4Mass${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      },
      {
        label: getFormattedLabel( controlsSkater5MassPatternString, SkaterMasses.SKATER_5_MASS ),
        value: SkaterMasses.SKATER_5_MASS,
        tandemName: `skater5Mass${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      },
      {
        label: getFormattedLabel( controlsDogMassPatternString, SkaterMasses.DOG_MASS ),
        value: SkaterMasses.DOG_MASS,
        tandemName: `dogMass${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      }
    ];
    const comboBox = new PhysicalComboBox( massProperty, userControlledProperty, labelValueList, resetEmitter, listParent, tandem, {
      supportCustom: false
    } );

    super( comboBox, controlsSkaterString );
  }
}

/**
 * Get the string that labels the mass value.
 * @param {string} patternString
 * @param {number} value
 * @returns {string}
 */
const getFormattedLabel = ( patternString, value ) => {
  return StringUtils.fillIn( patternString, {
    value: value
  } );
};


energySkatePark.register( 'MassComboBox', MassComboBox );
export default MassComboBox;