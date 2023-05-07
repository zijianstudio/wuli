// Copyright 2022-2023, University of Colorado Boulder

/**
 * Renders non-interactive red bars that show how the median splits up into the lower and upper groups.
 * This appears within the CardNodeContainer and in the CAVPlotNode
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import { Path, PathOptions } from '../../../../scenery/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Shape } from '../../../../kite/js/imports.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CAVColors from '../CAVColors.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';

export type NotchDirection = 'up' | 'down';
export type BarStyle = 'continuous' | 'split';
type SelfOptions = {
  notchDirection: NotchDirection;
  barStyle: BarStyle;
  arrowScale?: number;
};
export type MedianBarNodeOptions = SelfOptions & PathOptions;

export default class MedianBarNode extends Path {
  private readonly notchDirection: NotchDirection;
  private readonly barStyle: BarStyle;
  private readonly medianArrowNode: ArrowNode;
  public static readonly NOTCH_HEIGHT = 10;
  public static readonly HALF_SPLIT_WIDTH = 2;

  public constructor( providedOptions: MedianBarNodeOptions ) {

    const options = optionize<MedianBarNodeOptions, SelfOptions, PathOptions>()( {
      lineWidth: MedianBarNode.LINE_WIDTH,
      stroke: CAVColors.medianColorProperty,
      arrowScale: 1,
      excludeInvisibleChildrenFromBounds: true
    }, providedOptions );

    super( null, options );

    this.notchDirection = options.notchDirection;
    this.barStyle = options.barStyle;

    this.medianArrowNode = new ArrowNode( 0, 0, 0, MedianBarNode.NOTCH_HEIGHT + 3, {
      scale: options.arrowScale,
      headHeight: 8,
      headWidth: 9,
      tailWidth: MedianBarNode.LINE_WIDTH,
      fill: CAVColors.medianColorProperty,
      stroke: null,
      visible: false
    } );
    this.addChild( this.medianArrowNode );
  }

  public setMedianBarShape( y: number, left: number, median: number, right: number, includeMedianArrow: boolean ): this {
    const shape = new Shape();

    const notchSign = this.notchDirection === 'up' ? -1 : 1;
    const leftCorner = new Vector2( left, y );
    const rightCorner = new Vector2( right, y );
    const medianVector = new Vector2( median, y );

    shape.moveToPoint( leftCorner.plusXY( 0, MedianBarNode.NOTCH_HEIGHT * notchSign ) );
    shape.lineToPoint( leftCorner );

    if ( this.barStyle === 'split' ) {
      shape.lineToPoint( medianVector.plusXY( -MedianBarNode.HALF_SPLIT_WIDTH, 0 ) );
      shape.lineToRelative( 0, MedianBarNode.NOTCH_HEIGHT * notchSign );
      shape.moveToPoint( medianVector.plusXY( MedianBarNode.HALF_SPLIT_WIDTH, MedianBarNode.NOTCH_HEIGHT * notchSign ) );
      shape.lineToRelative( 0, -MedianBarNode.NOTCH_HEIGHT * notchSign );
    }

    shape.lineToPoint( rightCorner );
    shape.lineToPoint( rightCorner.plusXY( 0, MedianBarNode.NOTCH_HEIGHT * notchSign ) );

    this.shape = shape;

    this.medianArrowNode.centerTop = new Vector2( medianVector.x, y );
    this.medianArrowNode.visible = includeMedianArrow;

    return this;
  }

  public clear(): void {
    this.shape = null;
    this.medianArrowNode.visible = false;
  }

  public static readonly LINE_WIDTH = 2;
}

centerAndVariability.register( 'MedianBarNode', MedianBarNode );