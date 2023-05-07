// Copyright 2016-2020, University of Colorado Boulder

/**
 * Enumeration for which term is actively being edited in the Adding screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import makeATen from '../../../makeATen.js';

const ActiveTerm = Object.freeze( {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE'
} );

makeATen.register( 'ActiveTerm', ActiveTerm );

export default ActiveTerm;