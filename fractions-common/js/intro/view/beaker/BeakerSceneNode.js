// Copyright 2018-2022, University of Colorado Boulder

/**
 * Scene for the beaker representation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';
import CellSceneNode from '../CellSceneNode.js';
import BeakerContainerNode from './BeakerContainerNode.js';
import BeakerPieceNode from './BeakerPieceNode.js';
import FractionsCommonBeakerNode from './FractionsCommonBeakerNode.js';

class BeakerSceneNode extends CellSceneNode {
  /**
   * @param {ContainerSetScreenView} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    super( model, merge( {
      createContainerNode( container, options ) {
        return new BeakerContainerNode( container, options );
      },
      createPieceNode( piece, finishedAnimatingCallback, droppedCallback ) {
        return new BeakerPieceNode( piece, finishedAnimatingCallback, droppedCallback );
      },
      createCellNode( denominator, index, options ) {
        return new FractionsCommonBeakerNode( 1, denominator, options );
      }
    }, options ) );
  }

  /**
   * Returns the icon node to be used for this representation.
   * @public
   *
   * @param {boolean} [useEqualityLabColor]
   * @returns {Node}
   */
  static getIcon( useEqualityLabColor ) {
    return new FractionsCommonBeakerNode( 1, 1, {
      beakerWidth: 30,
      beakerHeight: 55,
      yRadiusOfEnds: 4.5,
      solutionFill: useEqualityLabColor ? FractionsCommonColors.equalityLabWaterProperty : FractionsCommonColors.waterProperty
    } );
  }
}

fractionsCommon.register( 'BeakerSceneNode', BeakerSceneNode );
export default BeakerSceneNode;