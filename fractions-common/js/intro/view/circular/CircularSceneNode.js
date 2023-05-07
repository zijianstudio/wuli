// Copyright 2018-2021, University of Colorado Boulder

/**
 * Scene for the circular representation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';
import Container from '../../model/Container.js';
import CellSceneNode from '../CellSceneNode.js';
import CircularContainerNode from './CircularContainerNode.js';
import CircularNode from './CircularNode.js';
import CircularPieceNode from './CircularPieceNode.js';

class CircularSceneNode extends CellSceneNode {
  /**
   * @param {ContainerSetScreenView} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    const maxContainers = model.containerCountProperty.range.max;

    super( model, merge( {
      createContainerNode( container, options ) {
        return new CircularContainerNode( container, options );
      },
      createPieceNode( piece, finishedAnimatingCallback, droppedCallback ) {
        return new CircularPieceNode( piece, finishedAnimatingCallback, droppedCallback );
      },
      createCellNode( denominator, index, options ) {
        const circularNode = new CircularNode( denominator, index, options );
        circularNode.setRotationAngle( circularNode.bucketRotation );
        return circularNode;
      },
      maxContainersPerRow: model.isCompact ? 2 : maxContainers
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
    const iconContainer = new Container();
    iconContainer.addCells( 1 );
    iconContainer.cells.get( 0 ).fill();

    return new CircularContainerNode( iconContainer, {
      scale: 30 / 63,
      colorOverride: useEqualityLabColor ? FractionsCommonColors.equalityLabColorProperty : null
    } );
  }
}

fractionsCommon.register( 'CircularSceneNode', CircularSceneNode );
export default CircularSceneNode;