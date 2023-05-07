// Copyright 2014-2023, University of Colorado Boulder

/**
 * Creates a sandwich by attempting to mimic how a person would make a sandwich.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { HStrut, Image, Node, NodeOptions } from '../../../../scenery/js/imports.js';
import bread_png from '../../../images/bread_png.js';
import cheese_png from '../../../images/cheese_png.js';
import meat_png from '../../../images/meat_png.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';

const MAX_WIDTH = _.maxBy( [ bread_png, cheese_png, meat_png ], image => image.width )!.width;
const Y_SPACING = 4; // vertical space between centers of ingredients
const SANDWICH_SCALE = 0.65; // default scale of Nodes for sandwiches and their ingredients

export default class SandwichNode extends Node {

  public constructor( breadCount: number, meatCount: number, cheeseCount: number ) {

    assert && assert( Number.isInteger( breadCount ) && Number.isInteger( meatCount ) && Number.isInteger( cheeseCount ) );
    assert && assert( breadCount >= 0 && meatCount >= 0 && cheeseCount >= 0 );

    const options: NodeOptions = {
      scale: SANDWICH_SCALE
    };

    const children: Node[] = [];

    let centerY = 0;

    // ensure that all sandwiches are the same width
    //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/82
    children.push( new HStrut( MAX_WIDTH, { centerX: 0 } ) );

    // Put a slice of bread on the bottom.
    if ( breadCount > 0 ) {
      children.push( new Image( bread_png, { centerX: 0, centerY: centerY } ) );
      centerY -= Y_SPACING;
      breadCount--;
    }

    /*
     * To maximize interleaving, order the ingredients that go between the bread
     * so that the more prevalent ingredient is added first.
     */
    let ingredients;
    if ( meatCount >= cheeseCount ) {
      ingredients = [
        { count: meatCount, image: meat_png },
        { count: cheeseCount, image: cheese_png }
      ];
    }
    else {
      ingredients = [
        { count: cheeseCount, image: cheese_png },
        { count: meatCount, image: meat_png }
      ];
    }

    // Interleave ingredients
    let imageAdded = true;
    while ( imageAdded ) {

      imageAdded = false;

      // Add ingredients that go between the bread.
      for ( let i = 0; i < ingredients.length; i++ ) {
        const ingredient = ingredients[ i ];
        if ( ingredient.count > 0 ) {
          children.push( new Image( ingredient.image, { centerX: 0, centerY: centerY } ) );
          centerY -= Y_SPACING;
          imageAdded = true;
          ingredient.count--;
        }
      }

      // Add a slice of bread, but save one slice of bread for the top.
      if ( breadCount > 1 ) {
        children.push( new Image( bread_png, { centerX: 0, centerY: centerY } ) );
        centerY -= Y_SPACING;
        imageAdded = true;
        breadCount--;
      }
    }

    // Put a slice of bread on the top.
    if ( breadCount > 0 ) {
      children.push( new Image( bread_png, { centerX: 0, centerY: centerY } ) );
    }

    options.children = children;

    super( options );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }

  public static createBreadIcon(): Node {
    return new Image( bread_png, { scale: SANDWICH_SCALE } );
  }

  public static createMeatIcon(): Node {
    return new Image( meat_png, { scale: SANDWICH_SCALE } );
  }

  public static createCheeseIcon(): Node {
    return new Image( cheese_png, { scale: SANDWICH_SCALE } );
  }
}

reactantsProductsAndLeftovers.register( 'SandwichNode', SandwichNode );