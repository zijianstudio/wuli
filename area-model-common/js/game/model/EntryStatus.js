// Copyright 2017-2021, University of Colorado Boulder

/**
 * Enumeration for the different status types for an editable entry.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';

const EntryStatus = {
  NORMAL: 'NORMAL',
  DIRTY: 'DIRTY', // needs to be interacted with before submitting
  INCORRECT: 'INCORRECT' // was wrong after submission
};

areaModelCommon.register( 'EntryStatus', EntryStatus );

// @public {Array.<EntryStatus>} - All values the enumeration can take.
EntryStatus.VALUES = [
  EntryStatus.NORMAL,
  EntryStatus.DIRTY,
  EntryStatus.INCORRECT
];

// verify that enumeration is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( EntryStatus ); }

export default EntryStatus;