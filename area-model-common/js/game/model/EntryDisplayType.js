// Copyright 2018-2021, University of Colorado Boulder

/**
 * Enumeration for the different ways an editable entry can be handled.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';

const EntryDisplayType = {
  EDITABLE: 'EDITABLE',
  READOUT: 'READOUT',
  HIDDEN: 'HIDDEN'
};

areaModelCommon.register( 'EntryDisplayType', EntryDisplayType );

// @public {Array.<EntryDisplayType>} - All values the enumeration can take.
EntryDisplayType.VALUES = [
  EntryDisplayType.EDITABLE, // editable, and shows the edited value
  EntryDisplayType.READOUT, // just the value shown, does not look editable
  EntryDisplayType.HIDDEN // nothing shown
];

// verify that enumeration is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( EntryDisplayType ); }

export default EntryDisplayType;