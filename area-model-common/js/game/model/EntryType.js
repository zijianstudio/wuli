// Copyright 2018-2021, University of Colorado Boulder

/**
 * Enumeration for the type of entries in the game that may be editable, calculated dynamically, or given.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';
import EntryDisplayType from './EntryDisplayType.js';

const EntryType = {
  EDITABLE: 'EDITABLE',
  DYNAMIC: 'DYNAMIC',
  GIVEN: 'GIVEN'
};

areaModelCommon.register( 'EntryType', EntryType );

// @public {Array.<EntryType>} - All values the enumeration can take.
EntryType.VALUES = [
  EntryType.EDITABLE, // the user inputs this value
  EntryType.DYNAMIC, // this value can change (be computed) based on the user's input
  EntryType.GIVEN // this value is fixed for a given challenge
];

const gameToDisplayMap = {};
gameToDisplayMap[ EntryType.EDITABLE ] = EntryDisplayType.EDITABLE;
gameToDisplayMap[ EntryType.DYNAMIC ] = EntryDisplayType.READOUT;
gameToDisplayMap[ EntryType.GIVEN ] = EntryDisplayType.READOUT;

/**
 * Returns the preferred display type for a given game value.
 * @public
 *
 * @param {EntryType} type
 * @returns {boolean}
 */
EntryType.toDisplayType = function( type ) {
  assert && assert( _.includes( EntryType.VALUES, type ) );

  return gameToDisplayMap[ type ];
};

// verify that enumeration is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( EntryType ); }

export default EntryType;