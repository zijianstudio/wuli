// Copyright 2020-2022, University of Colorado Boulder

/**
 * FillableBagNode is a Scenery Node that looks like a drawing of a bag and that can be filled with different colors.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image, Node, Path } from '../../../../scenery/js/imports.js';
import nlBagForeground_png from '../../../images/nlBagForeground_png.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const BAG_OUTLINE_SVG_STRING = 'M367.541,188.392c0,0-7.992-7.075,39.988-42.405\n' +
                               '\tc0,0-10.671,0-10.671-11.777c0-11.776,18.663-23.553,7.991-35.345c-5.487-6.056-11.005-3.377-18.298,0.641\n' +
                               '\tc-5.152-6.143-11.326-12.548-16.348-14.775c-4.862-2.14-18.575-0.859-32.07,1.165c-1.965-3.931-9.841-8.225-37.251-8.225\n' +
                               '\tc-24.122,0-33.06,3.348-35.025,8.239c-14.586-1.048-27.819-0.247-28.969,5.881c-2.664,14.135-15.999,23.554-15.999,23.554\n' +
                               '\tc-7.861,2.605-13.32,9.433-13.32,9.433s10.67,21.209,2.664,40.047c0,0,39.989,4.716,37.325,28.27c0,0-87.984,42.405-146.649,110.722\n' +
                               '\tS-3.072,482.855,2.256,546.456c5.328,63.601,31.997,141.351,101.318,155.485c69.321,14.136,327.959,21.194,423.95-7.074\n' +
                               '\tc0,0,18.661-2.358,29.333-21.195c10.67-18.852,53.322-70.676,53.322-171.979C610.18,400.39,551.515,282.621,367.541,188.392z';

const BAG_OUTLINE_SHAPE = new Shape( BAG_OUTLINE_SVG_STRING );

class FillableBagNode extends Node {

  /**
   * @param {Object} [options]
   * @public
   */
  constructor( options ) {

    options = merge( {
      fill: 'rgba( 0, 0, 0, 0 )', // initially transparent so that it is invisible but has size
      lineWidth: 0
    }, options );

    const bagOutlineNode = new Path( BAG_OUTLINE_SHAPE, {
      fill: options.fill,
      lineWidth: options.lineWidth,
      center: Vector2.ZERO
    } );
    const overlayImage = new Image( nlBagForeground_png, { opacity: 0.9 } );
    overlayImage.setScaleMagnitude( bagOutlineNode.width / overlayImage.width );
    overlayImage.center = Vector2.ZERO;
    options.children = [ bagOutlineNode, overlayImage ];
    super( options );

    // @private
    this.outline = bagOutlineNode;
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

numberLineOperations.register( 'FillableBagNode', FillableBagNode );
export default FillableBagNode;