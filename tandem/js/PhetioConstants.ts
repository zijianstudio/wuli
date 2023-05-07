// Copyright 2020-2022, University of Colorado Boulder

import tandemNamespace from './tandemNamespace.js';

/**
 * Constants used in PhET-iO. Defined in the tandem repo since they need to be accessed in non-private code, like
 * IOType.ObjectIO.
 * @author Sam Reid (PhET Interactive Simulations)
 */
const PhetioConstants = {

  // Suffix that is required for all IO Type class names
  IO_TYPE_SUFFIX: 'IO'
};

tandemNamespace.register( 'PhetioConstants', PhetioConstants );
export default PhetioConstants;