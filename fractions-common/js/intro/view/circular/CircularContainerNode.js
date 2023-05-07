// Copyright 2018-2022, University of Colorado Boulder

/**
 * Container for the circular representation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import { Circle, Path } from '../../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';
import CellContainerNode from '../CellContainerNode.js';
import CircularNode from './CircularNode.js';

class CircularContainerNode extends CellContainerNode {
  /**
   * @param {Container} container
   * @param {Object} [options]
   */
  constructor( container, options ) {
    super( container, options );

    // @public
    this.circleRadius = CircularNode.RADIUS;

    // Extend by 0.5 so that our cell fills don't overlap our border
    this.addChild( new Circle( this.circleRadius + 0.5, {
      lineWidth: FractionsCommonConstants.INTRO_CONTAINER_LINE_WIDTH,
      fill: FractionsCommonColors.introContainerBackgroundProperty,
      stroke: this.strokeProperty
    } ) );

    // Use current bounds as permanent bounds
    this.localBounds = this.localBounds; // eslint-disable-line no-self-assign

    // @private {Path} creates the path for the dividing lines between cells
    this.cellDividersPath = new Path( null, { stroke: this.strokeProperty } );
    this.addChild( this.cellDividersPath );

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

    const cellDividersShape = new Shape();

    const denominator = this.container.cells.length;

    // disregard segment for denominator equal to 1
    const cellDividersLength = ( denominator > 1 ) ? this.circleRadius : 0;

    // creates an angle between the cells of a circle node that corresponds to the denominator value
    const cellDividersAngle = 2 * Math.PI / denominator;

    for ( let i = 0; i < denominator; i++ ) {
      const cell = this.container.cells.get( i );

      const cellNode = new CircularNode( denominator, i, {
        colorOverride: this.colorOverride
      } );
      cellNode.translation = cellNode.getContainerOffset();

      this.addCellNode( cell, cellNode );

      // positions and draws the polar coordinate of the dividing line between cells
      const edgePosition = Vector2.createPolar( cellDividersLength, i * cellDividersAngle );
      if ( cellDividersLength ) {
        // Workaround for https://github.com/phetsims/scenery/issues/750
        cellDividersShape.moveToPoint( edgePosition ).lineToPoint( edgePosition.normalized().timesScalar( 0.01 ) );
      }
    }
    this.cellDividersPath.setShape( cellDividersShape );
  }
}

fractionsCommon.register( 'CircularContainerNode', CircularContainerNode );
export default CircularContainerNode;