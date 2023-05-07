// Copyright 2021-2022, University of Colorado Boulder

/**
 * Represents from where a point controller should 'drop' onto a number line for #34.
 * For example, if a point controller is above a play area and the DropFromDirection is TOP, then
 * the point controller will 'fall' onto the play area instead of being sent to the box.
 *
 * @author Saurabh Totey
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import numberLineDistance from '../../numberLineDistance.js';

// @public
const DropFromDirection = EnumerationDeprecated.byKeys( [ 'TOP', 'LEFT' ] );

numberLineDistance.register( 'DropFromDirection', DropFromDirection );
export default DropFromDirection;
