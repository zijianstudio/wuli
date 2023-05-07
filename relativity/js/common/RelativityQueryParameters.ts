// Copyright 2023, University of Colorado Boulder

/**
 * Defines query parameters that are specific to this simulation.
 * Run with ?log to print query parameters and their values to the browser console at startup.
 *
 * @author Zijian Wang
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import relativity from '../relativity.js';

const SCHEMA_MAP = {
  //TODO add schemas for query parameters
};

const RelativityQueryParameters = QueryStringMachine.getAll( SCHEMA_MAP );

// The schema map is a read-only part of the public API, in case schema details (e.g. validValues) are needed elsewhere.
RelativityQueryParameters.SCHEMA_MAP = SCHEMA_MAP;

relativity.register( 'RelativityQueryParameters', RelativityQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.relativity.RelativityQueryParameters' );

export default RelativityQueryParameters;