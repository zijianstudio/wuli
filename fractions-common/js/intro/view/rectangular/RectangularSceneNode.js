// Copyright 2018-2021, University of Colorado Boulder

/**
 * Scene for the rectangular representation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';
import Container from '../../model/Container.js';
import CellSceneNode from '../CellSceneNode.js';
import RectangularOrientation from '../RectangularOrientation.js';
import RectangularContainerNode from './RectangularContainerNode.js';
import RectangularNode from './RectangularNode.js';
import RectangularPieceNode from './RectangularPieceNode.js';

class RectangularSceneNode extends CellSceneNode {
  /**
   * @param {ContainerSetScreenView} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    assert && assert( RectangularOrientation.includes( options.rectangularOrientation ) );

    const rectangularOrientation = options.rectangularOrientation;
    const maxContainers = model.containerCountProperty.range.max;

    super( model, merge( {
      createContainerNode( container, options ) {
        return new RectangularContainerNode( container, merge( {
          rectangularOrientation: rectangularOrientation
        }, options ) );
      },
      createPieceNode( piece, finishedAnimatingCallback, droppedCallback ) {
        return new RectangularPieceNode( piece, finishedAnimatingCallback, droppedCallback, {
          rectangularOrientation: rectangularOrientation
        } );
      },
      createCellNode( denominator, index, options ) {
        return new RectangularNode( denominator, {
          dropShadow: false,
          rectangularOrientation: rectangularOrientation
        } );
      },

      maxContainersPerRow: {
        [ RectangularOrientation.HORIZONTAL ]: {
          false: maxContainers / 2,
          true: 1
        },
        [ RectangularOrientation.VERTICAL ]: {
          false: maxContainers,
          true: 4
        }
      }[ rectangularOrientation ][ model.isCompact ]
    }, options ) );
  }

  /**
   * Returns the icon node to be used for this representation.
   * @public
   *
   * @param {RectangularOrientation} rectangularOrientation
   * @param {boolean} [useEqualityLabColor]
   * @returns {Node}
   */
  static getIcon( rectangularOrientation, useEqualityLabColor ) {
    const iconContainer = new Container();
    iconContainer.addCells( 1 );
    iconContainer.cells.get( 0 ).fill();

    return new RectangularContainerNode( iconContainer, {
      rectangularOrientation: rectangularOrientation,
      scale: 0.32,
      colorOverride: useEqualityLabColor ? FractionsCommonColors.equalityLabColorProperty : null
    } );
  }
}

fractionsCommon.register( 'RectangularSceneNode', RectangularSceneNode );
export default RectangularSceneNode;