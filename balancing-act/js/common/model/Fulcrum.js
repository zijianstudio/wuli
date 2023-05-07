// Copyright 2013-2022, University of Colorado Boulder

/**
 * Fulcrum (for lack of a better word) that has a pivot point that is above
 * the plank.  This shape looks sort of like a swing set, with angled legs
 * that go from the ground up to apex in a sort of A-frame arrangement.
 *
 * @author John Blanco
 */

import { Shape } from '../../../../kite/js/imports.js';
import balancingAct from '../../balancingAct.js';

// constants
const LEG_THICKNESS_FACTOR = 0.09; // Thickness of legs proportional to overall width, empirically determined.

/**
 * @param {Dimension2} size - width and height of the fulcrum.
 * @constructor
 */
function Fulcrum( size ) {
  this.size = size;
  const legThickness = LEG_THICKNESS_FACTOR * size.width;

  // Define the basic shape of the fulcrum, which is an A-frame sort of
  // thing that is centered horizontally around x = 0.  There are some
  // 'tweak factors' in here, adjust as needed for desired look.
  const fulcrumShape = new Shape();
  // Start at leftmost and lowest point.
  fulcrumShape.moveTo( -size.width / 2, 0 );
  fulcrumShape.lineTo( -legThickness * 0.67, size.height + legThickness / 2 );
  fulcrumShape.lineTo( legThickness * 0.67, size.height + legThickness / 2 );
  fulcrumShape.lineTo( size.width / 2, 0 );
  fulcrumShape.lineTo( size.width / 2 - legThickness, 0 );
  fulcrumShape.lineTo( 0, size.height - legThickness * 0.2 );
  fulcrumShape.lineTo( -size.width / 2 + legThickness, 0 );
  fulcrumShape.close();

  // The shape property is what will define the shape in the view.
  this.shape = fulcrumShape;
}

balancingAct.register( 'Fulcrum', Fulcrum );

export default Fulcrum;