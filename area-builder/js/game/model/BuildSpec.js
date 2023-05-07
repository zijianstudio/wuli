// Copyright 2014-2021, University of Colorado Boulder

/**
 * Defines a 'build specification', which is used to define what a user should build when presented with a 'build it'
 * style challenge in the Area Builder game.
 *
 * @author John Blanco
 */

import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';

class BuildSpec {

  /**
   * @param {number} area - Area of the shape that the user should construct from smaller shapes
   * @param {number} [perimeter] - Perimeter of the shapes that the user should construct
   * @param {Object} [colorProportionsSpec] - An object that specifies two colors and the proportion of the first color
   * that should be present in the user's solution.
   */
  constructor( area, perimeter, colorProportionsSpec ) {
    assert && assert( typeof ( area ) === 'number' || area === AreaBuilderSharedConstants.INVALID_VALUE );
    this.area = area;
    if ( typeof ( perimeter ) !== 'undefined' && perimeter !== null ) {
      assert && assert( typeof ( perimeter ) === 'number' || perimeter === AreaBuilderSharedConstants.INVALID_VALUE );
      this.perimeter = perimeter;
    }
    if ( colorProportionsSpec ) {
      assert && assert( colorProportionsSpec.color1Proportion instanceof Fraction );
      this.proportions = {
        color1: Color.toColor( colorProportionsSpec.color1 ),
        color2: Color.toColor( colorProportionsSpec.color2 ),
        color1Proportion: colorProportionsSpec.color1Proportion
      };
    }
  }

  /**
   * @param {BuildSpec} that
   * @returns {boolean}
   * @public
   */
  equals( that ) {

    if ( !( that instanceof BuildSpec ) ) { return false; }

    // Compare area, which should always be defined.
    if ( this.area !== that.area ) {
      return false;
    }

    // Compare perimeter
    if ( this.perimeter && !that.perimeter ||
         !this.perimeter && that.perimeter ||
         this.perimeter !== that.perimeter ) {
      return false;
    }

    // Compare proportions
    if ( !this.proportions && !that.proportions ) {
      // Neither defines proportions, so we're good.
      return true;
    }

    if ( this.proportions && !that.proportions || !this.proportions && that.proportions ) {
      // One defines proportions and the other doesn't, so they don't match.
      return false;
    }

    // From here, if the proportion spec matches, the build specs are equal.
    return ( this.proportions.color1.equals( that.proportions.color1 ) &&
             this.proportions.color2.equals( that.proportions.color2 ) &&
             this.proportions.color1Proportion.equals( that.proportions.color1Proportion ) );
  }


  /**
   * @param area
   * @returns {BuildSpec}
   * @public
   */
  static areaOnly( area ) {
    return new BuildSpec( area );
  }

  /**
   * @param area
   * @param perimeter
   * @returns {BuildSpec}
   * @public
   */
  static areaAndPerimeter( area, perimeter ) {
    return new BuildSpec( area, perimeter );
  }

  /**
   * @param area
   * @param color1
   * @param color2
   * @param color1Proportion
   * @returns {BuildSpec}
   * @public
   */
  static areaAndProportions( area, color1, color2, color1Proportion ) {
    return new BuildSpec( area, null, {
        color1: color1,
        color2: color2,
        color1Proportion: color1Proportion
      }
    );
  }

  /**
   * @param area
   * @param perimeter
   * @param color1
   * @param color2
   * @param color1Proportion
   * @returns {BuildSpec}
   * @public
   */
  static areaPerimeterAndProportions( area, perimeter, color1, color2, color1Proportion ) {
    return new BuildSpec( area, perimeter, {
        color1: color1,
        color2: color2,
        color1Proportion: color1Proportion
      }
    );
  }
}

areaBuilder.register( 'BuildSpec', BuildSpec );
export default BuildSpec;