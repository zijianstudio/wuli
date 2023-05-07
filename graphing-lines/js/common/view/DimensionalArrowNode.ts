// Copyright 2014-2023, University of Colorado Boulder

/**
 * A dimensional arrow is used in engineering drawings or technical drawings to denote the dimensions
 * of something in the drawing. It includes an arrow drawn between two perpendicular lines which mark
 * the end points of the thing in the drawing that's being measured.
 *
 * We're using a dimensional arrow in this sim to indicate the dimensions of slope: rise and run.
 *
 * The arrow has a head at the tip, and there are delimiters (perpendicular lines) at the tip and tail.
 * The arrow head is different than scenery-phet.ArrowNode.
 * Currently supports only horizontal and vertical arrows.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Line, LineOptions, Node, NodeOptions, Path, TColor } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';

type SelfOptions = {
  stroke?: TColor;
  lineWidth?: number;
  arrowTipSize?: Dimension2; // use even-number dimensions, or tip will look asymmetrical due to rounding
  delimiterLength?: number;
  delimitersVisible?: boolean;
};

type DimensionalArrowNodeOptions = SelfOptions;

export default class DimensionalArrowNode extends Node {

  private readonly arrowTipSize: Dimension2;
  private readonly delimiterLength: number;
  private readonly lineWidth: number;
  private readonly lineNode: Line;
  private readonly tipNode: Path;
  private readonly tipDelimiterNode: Line;
  private readonly tailDelimiterNode: Line;

  public constructor( tailX: number, tailY: number, tipX: number, tipY: number, providedOptions?: DimensionalArrowNodeOptions ) {

    const options = optionize<DimensionalArrowNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      stroke: 'black',
      lineWidth: 1,
      arrowTipSize: new Dimension2( 6, 8 ),
      delimiterLength: 10,
      delimitersVisible: true
    }, providedOptions );

    super();

    this.arrowTipSize = options.arrowTipSize;
    this.delimiterLength = options.delimiterLength;
    this.lineWidth = options.lineWidth;

    // Arrow
    const pathOptions = {
      stroke: options.stroke,
      lineWidth: options.lineWidth
    };
    this.lineNode = new Line( 0, 0, 0, 1, pathOptions );
    this.tipNode = new Path( null, pathOptions );

    // Delimiters
    const delimiterOptions = combineOptions<LineOptions>( {
      visible: options.delimitersVisible
    }, pathOptions );
    this.tipDelimiterNode = new Line( 0, 0, 0, 1, delimiterOptions );
    this.tailDelimiterNode = new Line( 0, 0, 0, 1, delimiterOptions );

    options.children = [ this.tipDelimiterNode, this.tailDelimiterNode, this.lineNode, this.tipNode ];

    this.mutate( options );

    // initialize
    this.setTailAndTip( tailX, tailY, tipX, tipY );
  }

  /**
   * Sets the tail and tip of the arrow, accounting for the lineWidth when positioning the arrow head.
   */
  public setTailAndTip( tailX: number, tailY: number, tipX: number, tipY: number ): void {

    const tipWidth = this.arrowTipSize.width;
    const tipHeight = this.arrowTipSize.height;
    const tipOffset = this.lineWidth / 2;
    const tipShape = new Shape();
    if ( tailX === tipX ) {
      // vertical arrow
      if ( tipY > tailY ) {
        this.lineNode.setLine( tailX, tailY, tipX, tipY - ( this.lineWidth / 2 ) );
        // pointing down
        tipShape.moveTo( tipX - ( tipWidth / 2 ), tipY - tipHeight - tipOffset );
        tipShape.lineTo( tipX, tipY - tipOffset );
        tipShape.lineTo( tipX + ( tipWidth / 2 ), tipY - tipHeight - tipOffset );
      }
      else {
        this.lineNode.setLine( tailX, tailY, tipX, tipY + ( this.lineWidth / 2 ) );
        // pointing up
        tipShape.moveTo( tipX - ( tipWidth / 2 ), tipY + tipHeight + tipOffset );
        tipShape.lineTo( tipX, tipY + tipOffset );
        tipShape.lineTo( tipX + ( tipWidth / 2 ), tipY + tipHeight + tipOffset );
      }
      this.tipDelimiterNode.setLine( tipX - this.delimiterLength / 2, tipY, tipX + this.delimiterLength / 2, tipY );
      this.tailDelimiterNode.setLine( tailX - this.delimiterLength / 2, tailY, tailX + this.delimiterLength / 2, tailY );
    }
    else if ( tailY === tipY ) {
      this.lineNode.setLine( tailX, tailY, tipX, tipY );
      // horizontal arrow
      if ( tailX > tipX ) {
        this.lineNode.setLine( tailX, tailY, tipX + ( this.lineWidth / 2 ), tipY );
        // pointing left
        tipShape.moveTo( tipX + tipHeight + tipOffset, tipY - ( tipWidth / 2 ) );
        tipShape.lineTo( tipX + tipOffset, tipY );
        tipShape.lineTo( tipX + tipHeight + tipOffset, tipY + ( tipWidth / 2 ) );
      }
      else {
        this.lineNode.setLine( tailX, tailY, tipX - ( this.lineWidth / 2 ), tipY );
        // pointing right
        tipShape.moveTo( tipX - tipHeight - tipOffset, tipY - ( tipWidth / 2 ) );
        tipShape.lineTo( tipX - tipOffset, tipY );
        tipShape.lineTo( tipX - tipHeight - tipOffset, tipY + ( tipWidth / 2 ) );
      }
      this.tipDelimiterNode.setLine( tipX, tipY - this.delimiterLength / 2, tipX, tipY + this.delimiterLength / 2 );
      this.tailDelimiterNode.setLine( tailX, tailY - this.delimiterLength / 2, tailX, tailY + this.delimiterLength / 2 );
    }
    else {
      throw new Error( 'this implementation supports only horizontal and vertical arrows' );
    }
    this.tipNode.shape = tipShape;
  }
}

graphingLines.register( 'DimensionalArrowNode', DimensionalArrowNode );