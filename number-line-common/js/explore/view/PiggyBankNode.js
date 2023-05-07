// Copyright 2020-2022, University of Colorado Boulder

/**
 * a node that represents a piggy bank
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image, Node, Path } from '../../../../scenery/js/imports.js';
import piggyBankNoDecoration_png from '../../../images/piggyBankNoDecoration_png.js';
import piggyBankWithFlowers_png from '../../../images/piggyBankWithFlowers_png.js';
import piggyBankWithLightning_png from '../../../images/piggyBankWithLightning_png.js';
import numberLineCommon from '../../numberLineCommon.js';
import PiggyBankDecoration from '../model/PiggyBankDecoration.js';
import piggyBankShapes from './piggyBankShapes.js';

// constants
const MAP_DECORATION_TYPE_TO_IMAGE_INFO = new Map();
MAP_DECORATION_TYPE_TO_IMAGE_INFO.set( PiggyBankDecoration.NONE, piggyBankNoDecoration_png );
MAP_DECORATION_TYPE_TO_IMAGE_INFO.set( PiggyBankDecoration.FLOWERS, piggyBankWithFlowers_png );
MAP_DECORATION_TYPE_TO_IMAGE_INFO.set( PiggyBankDecoration.LIGHTNING, piggyBankWithLightning_png );

class PiggyBankNode extends Node {

  /**
   * @param {Object} [options]
   * @public
   */
  constructor( options ) {

    options = merge( {
      fill: 'rgba( 0, 0, 0, 0 )', // initially transparent so that it is invisible but has size
      lineWidth: 0,
      decorationType: PiggyBankDecoration.FLOWERS
    }, options );

    const piggyBankOutlineNode = new Path( piggyBankShapes.MEDIUM_PIGGY_BANK_SHAPE, {
      fill: options.fill,
      lineWidth: options.lineWidth,
      center: Vector2.ZERO
    } );
    const overlayImage = new Image(
      MAP_DECORATION_TYPE_TO_IMAGE_INFO.get( options.decorationType ),
      { opacity: 0.9 }
    );
    overlayImage.setScaleMagnitude( piggyBankOutlineNode.width / overlayImage.width );
    overlayImage.center = Vector2.ZERO;
    options.children = [ piggyBankOutlineNode, overlayImage ];
    super( options );

    // @private
    this.outline = piggyBankOutlineNode;
  }

  /**
   * @returns {ColorDef} the color of this piggy bank's fill
   * @public
   */
  getFill() {
    return this.outline.fill;
  }

  get fill() { return this.getFill(); }

  /**
   * @param {ColorDef} fill
   * @public
   */
  setFill( fill ) {
    this.outline.fill = fill;
  }

  set fill( fill ) { this.setFill( fill ); }
}

numberLineCommon.register( 'PiggyBankNode', PiggyBankNode );
export default PiggyBankNode;