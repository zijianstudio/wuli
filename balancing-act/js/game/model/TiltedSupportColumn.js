// Copyright 2014-2022, University of Colorado Boulder

/**
 * This is a column that can be used to support one of the ends of the plank
 * in a tilted position.  At the time of this writing, this type of column is
 * always used alone and holds the plank in a position where the other end is
 * on the ground.
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
function TiltedSupportColumn( height, centerX, topAngle ) {
  this.shape = new Shape().moveTo( centerX - COLUMN_WIDTH / 2, 0 ).lineTo( centerX - COLUMN_WIDTH / 2, height - COLUMN_WIDTH / 2 * Math.tan( -topAngle ) ).lineTo( centerX + COLUMN_WIDTH / 2, height + COLUMN_WIDTH / 2 * Math.tan( -topAngle ) ).lineTo( centerX + COLUMN_WIDTH / 2, 0 ).close();
}

balancingAct.register( 'TiltedSupportColumn', TiltedSupportColumn );

export default TiltedSupportColumn;