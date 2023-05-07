// Copyright 2013-2022, University of Colorado Boulder

/**
 * This is a column that can be used to support one of the ends of the plank
 * in a level position.  At the time of this writing, this type of column is
 * always used in conjunction with another that is holding up the other side of
 * the plank.
 *
 * @author John Blanco
 */

import { Shape } from '../../../../kite/js/imports.js';
import balancingAct from '../../balancingAct.js';

// constants
const COLUMN_WIDTH = 0.35; // In meters

/**
 * @param height
 * @param centerX
 * @constructor
 */
function LevelSupportColumn( height, centerX ) {
  this.shape = Shape.rect( centerX - COLUMN_WIDTH / 2, 0, COLUMN_WIDTH, height );
}

balancingAct.register( 'LevelSupportColumn', LevelSupportColumn );

export default LevelSupportColumn;