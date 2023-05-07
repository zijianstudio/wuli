// Copyright 2018-2022, University of Colorado Boulder

/**
 * Container for the rectangular representation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Path, Rectangle } from '../../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';
import Container from '../../model/Container.js';
import CellContainerNode from '../CellContainerNode.js';
import RectangularOrientation from '../RectangularOrientation.js';
import RectangularNode from './RectangularNode.js';

class RectangularContainerNode extends CellContainerNode {
  /**
   * @param {Container} container
   * @param {Object} [options]
   */
  constructor( container, options ) {
    assert && assert( container instanceof Container );

    options = merge( {
      rectangularOrientation: RectangularOrientation.VERTICAL
    }, options );

    assert && assert( RectangularOrientation.includes( options.rectangularOrientation ) );

    super( container, options );

    // @private {RectangularOrientation}
    this.rectangularOrientation = options.rectangularOrientation;

    // @private {Dimension2} - The full size of the rectangle to use
    this.size = RectangularNode.getSize( options.rectangularOrientation );

    const rectBounds = Bounds2.point( 0, 0 ).dilatedXY( this.size.width / 2, this.size.height / 2 );

    // @private {Rectangle}
    this.backgroundRectangle = new Rectangle( {
      fill: FractionsCommonColors.introContainerBackgroundProperty,
      rectBounds: rectBounds
    } );
    this.addChild( this.backgroundRectangle );

    // @private {Path}
    this.cellDividersPath = new Path( null, { stroke: this.strokeProperty } );
    this.addChild( this.cellDividersPath );

    // @private {Rectangle}
    this.borderRectangle = new Rectangle( {
      lineWidth: FractionsCommonConstants.INTRO_CONTAINER_LINE_WIDTH,
      stroke: this.strokeProperty,
      rectBounds: rectBounds.dilated( 0.5 ) // Extend by 0.5 so that our cell fills don't overlap our border
    } );
    this.addChild( this.borderRectangle );

    this.rebuild();
    this.mutate( options );
  }

  /**
   * Rebuilds the full container (required when the number of cells changes).
   * @protected
   * @override
   */
  rebuild() {
    super.rebuild();

    const denominator = this.container.cells.length;
    const cellWidth = this.size.width / denominator;
    const cellHeight = this.size.height / denominator;

    const mapCellX = index => ( index - ( denominator - 1 ) / 2 ) * cellWidth;
    const mapCellY = index => ( index - ( denominator - 1 ) / 2 ) * cellHeight;

    for ( let i = 0; i < denominator; i++ ) {
      const cell = this.container.cells.get( i );
      const cellNode = new RectangularNode( denominator, {
        rectangularOrientation: this.rectangularOrientation,
        colorOverride: this.colorOverride
      } );
      if ( this.rectangularOrientation === RectangularOrientation.HORIZONTAL ) {
        cellNode.x = mapCellX( i );
      }
      else {
        cellNode.y = mapCellY( i );
      }

      this.addCellNode( cell, cellNode );
    }

    if ( this.rectangularOrientation === RectangularOrientation.VERTICAL ) {
      // sets the shape of the dividing lines between cells
      const cellDividersShape = new Shape();
      for ( let i = 0; i < denominator; i++ ) {
        cellDividersShape.moveTo( -this.size.width / 2, mapCellY( i + 0.5 ) ).horizontalLineToRelative( this.size.width );
      }
      this.cellDividersPath.setShape( cellDividersShape );
    }
    else {
      // sets the shape of the dividing lines between cells
      const cellDividersShape = new Shape();
      for ( let i = 0; i < denominator; i++ ) {
        cellDividersShape.moveTo( mapCellX( i + 0.5 ), -this.size.height / 2 ).verticalLineToRelative( this.size.height );
      }
      this.cellDividersPath.setShape( cellDividersShape );
    }
  }
}

fractionsCommon.register( 'RectangularContainerNode', RectangularContainerNode );
export default RectangularContainerNode;