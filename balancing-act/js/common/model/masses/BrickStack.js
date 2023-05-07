// Copyright 2013-2022, University of Colorado Boulder

/**
 * Class that represents a stack of bricks in the model.  Note that a single brick is represented as a stack of size 1.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import balancingAct from '../../../balancingAct.js';
import Mass from '../Mass.js';

// constants
const BRICK_WIDTH = 0.2; // In meters.
const BRICK_HEIGHT = BRICK_WIDTH / 3;
const BRICK_MASS = 5; // In kg.

class BrickStack extends Mass {

  /**
   * @param {number} numBricks
   * @param {Vector2} initialPosition
   * @param {Object} [options]
   */
  constructor( numBricks, initialPosition, options ) {

    if ( numBricks <= 0 ) { throw new Error( 'Must have at least one brick in stack' ); }

    initialPosition = initialPosition || Vector2.ZERO; // Default initial position.
    super( numBricks * BRICK_MASS, initialPosition, false, options );

    this.numBricks = numBricks;

    // Generate the shape of the brick stack.
    const brickStackShape = new Shape();
    let brickOriginY = 0;
    for ( let i = 0; i < numBricks; i++ ) {
      brickStackShape.rect( 0, brickOriginY, BRICK_WIDTH, BRICK_HEIGHT );
      brickOriginY += BRICK_HEIGHT;
    }

    this.shape = brickStackShape;
  }

  /**
   * @public
   */
  createCopy() {
    return new BrickStack( this.numBricks, this.positionProperty.get() );
  }

  /**
   * @public
   */
  getMiddlePoint() {
    return this.shape.bounds.center.rotated( this.rotationAngleProperty.get() ).plus( this.positionProperty.get() );
  }
}

// static constants
BrickStack.BRICK_MASS = BRICK_MASS;
BrickStack.BRICK_HEIGHT = BRICK_HEIGHT;

balancingAct.register( 'BrickStack', BrickStack );

export default BrickStack;