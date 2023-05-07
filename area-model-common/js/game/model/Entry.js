// Copyright 2017-2023, University of Colorado Boulder

/**
 * A logical entry whose value can be edited, and may be displayed in different ways.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import areaModelCommon from '../../areaModelCommon.js';
import Term from '../../common/model/Term.js';
import EntryDisplayType from './EntryDisplayType.js';
import EntryStatus from './EntryStatus.js';
import EntryType from './EntryType.js';
import InputMethod from './InputMethod.js';

class Entry {
  /**
   * @param {Term|null} value - The initial value
   * @param {Object} [options]
   */
  constructor( value, options ) {
    options = merge( {
      type: EntryType.GIVEN,
      displayType: EntryDisplayType.HIDDEN,
      inputMethod: InputMethod.CONSTANT,
      numberOfDigits: 0,
      correctValue: null // Only used for the total coefficients
    }, options );

    // Always start off by editing null, and it should be the default value.
    if ( options.displayType === EntryDisplayType.EDITABLE ) {
      value = null;
    }

    // @public {Property.<Term|null>} - The current value of the entry
    this.valueProperty = new Property( value, {
      valueComparisonStrategy: 'equalsFunction',
      isValidValue: Term.isTermOrNull
    } );

    // @public {EntryType} - Whether we are dynamic/editable/given.
    this.type = options.type;

    // @public {EntryDisplayType} - Whether we are a readout or editable/hidden
    this.displayType = options.displayType;

    // @public {InputMethod} - What format should be used if we are edited? (Need different keypads or a polynomial
    // input)
    this.inputMethod = options.inputMethod;

    // @public {number}
    this.digits = options.numberOfDigits;

    // @public {Property.<EntryStatus>}
    this.statusProperty = new Property( EntryStatus.DIRTY );

    // @public {Property.<Term|null>} - Our value, except for null if there is an error highlight
    this.nonErrorValueProperty = new DerivedProperty( [ this.valueProperty, this.statusProperty ], ( value, highlight ) => ( highlight === EntryStatus.INCORRECT ) ? null : value );
  }
}

areaModelCommon.register( 'Entry', Entry );

export default Entry;