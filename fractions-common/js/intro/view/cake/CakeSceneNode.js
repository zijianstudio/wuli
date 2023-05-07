// Copyright 2018-2022, University of Colorado Boulder

/**
 * Scene for the cake representation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import { Image } from '../../../../../scenery/js/imports.js';
import cake_1_1_png from '../../../../mipmaps/cake_1_1_png.js';
import fractionsCommon from '../../../fractionsCommon.js';
import CellSceneNode from '../CellSceneNode.js';
import CakeContainerNode from './CakeContainerNode.js';
import CakeNode from './CakeNode.js';
import CakePieceNode from './CakePieceNode.js';

class CakeSceneNode extends CellSceneNode {
  /**
   * @param {ContainerSetScreenView} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    super( model, merge( {
      createContainerNode( container, options ) {
        return new CakeContainerNode( container, options );
      },
      createPieceNode( piece, finishedAnimatingCallback, droppedCallback ) {
        return new CakePieceNode( piece, finishedAnimatingCallback, droppedCallback );
      },
      createCellNode( denominator, index, options ) {
        return new CakeNode( denominator, index, options );
      }
    }, options ) );
  }

  /**
   * Returns the icon node to be used for this representation.
   * @public
   *
   * @param {boolean} useEqualityLabColor
   * @returns {Node}
   */
  static getIcon() {
    return new Image( cake_1_1_png, {
      maxHeight: 75
    } );
  }
}

fractionsCommon.register( 'CakeSceneNode', CakeSceneNode );
export default CakeSceneNode;