// Copyright 2018-2023, University of Colorado Boulder

/**
 * IO Type for LinkedElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';
import IOType from './types/IOType.js';
import StringIO from './types/StringIO.js';

export type LinkedElementState = {
  elementID: string;
};

const LinkedElementIO = new IOType( 'LinkedElementIO', {
  isValidValue: () => true,
  documentation: 'A LinkedElement',
  toStateObject: linkedElement => {
    assert && Tandem.VALIDATION && assert( linkedElement.element.isPhetioInstrumented(), 'Linked elements must be instrumented' );
    return { elementID: linkedElement.element.tandem.phetioID };
  },

  // Override the parent implementation as a no-op.  LinkedElement elementID appears in the state, but should not be set
  // back into a running simulation.
  applyState: _.noop,
  stateSchema: {
    elementID: StringIO
  }
} );

tandemNamespace.register( 'LinkedElementIO', LinkedElementIO );
export default LinkedElementIO;