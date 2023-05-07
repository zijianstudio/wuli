// Copyright 2017-2022, University of Colorado Boulder

/**
 * Function for the 'Mystery' screen in 'Function Builder: Basics'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FBConstants from '../../../../function-builder/js/common/FBConstants.js';
import ImageFunctionNode from '../../../../function-builder/js/common/view/functions/ImageFunctionNode.js';
import FunctionBuilderStrings from '../../../../function-builder/js/FunctionBuilderStrings.js';
import merge from '../../../../phet-core/js/merge.js';
import { Text } from '../../../../scenery/js/imports.js';
import functionBuilderBasics from '../../functionBuilderBasics.js';

class FBBMysteryFunctionNode extends ImageFunctionNode {
  /**
   * @param {MathFunction} functionInstance
   * @param {FunctionContainer} container - container in the function carousel
   * @param {BuilderNode} builderNode
   * @param {Node} dragLayer - parent for this node when it's being dragged or animating
   * @param {Object} [options]
   */
  constructor( functionInstance, container, builderNode, dragLayer, options ) {

    options = merge( {
      size: FBConstants.FUNCTION_SIZE,
      identityVisible: false, // function's identity is not initially visible
      draggable: false, // {boolean} Mystery functions are not draggable
      hiddenFill: 'white' // {Color|string} fill when identity is hidden
    }, options );

    // Node that is displayed when the function's identity is hidden
    assert && assert( !options.hiddenNode );
    options.hiddenNode = new Text( FunctionBuilderStrings.mysteryCharacter, {
      font: FBConstants.MYSTERY_FUNCTION_FONT,
      maxWidth: 0.35 * options.size.width,
      maxHeight: 0.9 * options.size.height
    } );

    super( functionInstance, container, builderNode, dragLayer, options );

    // @private
    this.hiddenNode = options.hiddenNode;
  }

  /**
   * Sets the color of the question mark.
   * @param {Color|string} color
   * @public
   */
  setQuestionMarkColor( color ) {
    this.hiddenNode.fill = color;
  }
}

functionBuilderBasics.register( 'FBBMysteryFunctionNode', FBBMysteryFunctionNode );
export default FBBMysteryFunctionNode;