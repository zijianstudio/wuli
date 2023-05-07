// Copyright 2018-2022, University of Colorado Boulder

/**
 * Possible directions for the magnet in Faraday's Law, magnet can move up, down, left, right,
 * and along the diagonals of these orientations.
 *
 * @author Michael Barlow
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import faradaysLaw from '../../faradaysLaw.js';

const MagnetDirectionEnum = EnumerationDeprecated.byKeys(
  [ 'LEFT', 'RIGHT', 'UP', 'DOWN', 'UP_LEFT', 'UP_RIGHT', 'DOWN_LEFT', 'DOWN_RIGHT' ]
);
faradaysLaw.register( 'MagnetDirectionEnum', MagnetDirectionEnum );
export default MagnetDirectionEnum;
