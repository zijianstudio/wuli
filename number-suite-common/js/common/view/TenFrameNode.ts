// Copyright 2019-2023, University of Colorado Boulder

/**
 * Class for a 'Ten Frame' Node, which creates ten frames (5x2 grid of squares) and fills them with dots by listening
 * to the provided Property. It supports any NumberProperty with a maximum range that is a multiple of ten.
 *
 * The static methods can be used to draw simple ten frame nodes and provide positions for the centers of their squares.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, HBox, Node, Path, PathOptions } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';

// types
type GetSpotCentersOptions = {
  numberOfTenFrames?: number;
  sideLength?: number;
  lineWidth?: number;
};
type GetTenFramePathSelfOptions = {
  sideLength?: number;
};
type GetTenFramePathOptions = GetTenFramePathSelfOptions & PathOptions;

// constants - all are used for both drawing the ten frame shape and positioning the dots within the ten frame shape
const NUMBER_OF_X_SQUARES = 5; // a ten frame is this many squares wide
const NUMBER_OF_Y_SQUARES = 2; // a ten frame is this many squares tall
const SIDE_LENGTH = 20; // the side length of one square in a ten frame
const DISTANCE_BETWEEN_TEN_FRAMES = 5; // horizontal spacing between ten frames, if there's more than one
const LINE_WIDTH = 0.8; // the line width of the lines in a ten frame. used in this class, not necessarily in getTenFramePath

class TenFrameNode extends Node {

  public readonly numberOfTenFrames: number;

  // a Node layer for the dots
  private readonly dotsLayer: Node;

  // the center of every dot spot available
  private readonly dotSpots: Vector2[];

  public constructor( currentNumberProperty: TReadOnlyProperty<number>, sumRange: Range ) {
    super();

    assert && assert( sumRange.max % NumberSuiteCommonConstants.TEN === 0,
      `sumRange.max must be a multiple of ten, but was: ${sumRange.max}` );

    this.numberOfTenFrames = sumRange.max / NumberSuiteCommonConstants.TEN;

    // create the calculated number of ten frames needed
    const tenFramePaths: Node[] = [];
    _.times( this.numberOfTenFrames, () => {
      tenFramePaths.push( TenFrameNode.getTenFramePath() );
    } );

    // add all ten frames, aligned in a horizontal line
    const alignedTenFrames = new HBox( {
      children: tenFramePaths,
      spacing: DISTANCE_BETWEEN_TEN_FRAMES
    } );
    this.addChild( alignedTenFrames );

    this.dotsLayer = new Node();
    this.addChild( this.dotsLayer );

    this.dotSpots = TenFrameNode.getSpotCenters( {
      numberOfTenFrames: this.numberOfTenFrames
    } );

    // update the number of dots shown whenever the current number changes
    currentNumberProperty.link( currentNumber => {
      this.updateDots( currentNumber );
    } );
  }

  /**
   * Draws the provided number of dots on the dots layer.
   */
  private updateDots( numberOfDots: number ): void {
    this.dotsLayer.removeAllChildren();

    for ( let i = 0; i < numberOfDots; i++ ) {
      const dotNode = new Circle( SIDE_LENGTH / 4, { fill: 'black' } );
      dotNode.center = this.dotSpots[ i ];
      this.dotsLayer.addChild( dotNode );
    }
  }

  /**
   * Calculates the center position of all the squares in a ten frame shape(s).
   */
  public static getSpotCenters( provideOptions?: GetSpotCentersOptions ): Vector2[] {

    const options = optionize<GetSpotCentersOptions>()( {
      numberOfTenFrames: 1,
      sideLength: SIDE_LENGTH,
      lineWidth: LINE_WIDTH
    }, provideOptions );

    const spots = [];
    const squareCenterOffset = options.sideLength / 2 + options.lineWidth / 2; // offset from the edge to the first square's center

    // the width of i ten frames plus the space between ten frames
    const nextTenFrameXOffset = NUMBER_OF_X_SQUARES * options.sideLength + DISTANCE_BETWEEN_TEN_FRAMES + options.lineWidth / 2;

    for ( let i = 0; i < options.numberOfTenFrames; i++ ) {
      const xOffset = i * nextTenFrameXOffset; // shift over for each additional ten frame

      // iterate through all squares in a ten frame and record the center of each square
      for ( let j = 0; j < NUMBER_OF_Y_SQUARES; j++ ) {
        const y = j * options.sideLength + squareCenterOffset;
        for ( let k = 0; k < NUMBER_OF_X_SQUARES; k++ ) {
          const x = k * options.sideLength + squareCenterOffset;
          spots.push( new Vector2( x + xOffset, y ) );
        }
      }
    }
    return spots;
  }

  /**
   * Draws a ten frame shape, which is a 5 by 2 grid of squares.
   */
  public static getTenFramePath( providedOptions?: GetTenFramePathOptions ): Path {

    const options = optionize<GetTenFramePathOptions, GetTenFramePathSelfOptions, PathOptions>()( {

      // GetTenFramePathSelfOptions
      sideLength: SIDE_LENGTH,

      // PathOptions
      fill: 'white',
      stroke: 'black',
      lineWidth: LINE_WIDTH
    }, providedOptions );

    const tenFrameShape = new Shape()
      .moveTo( 0, 0 )

      // draw the bounding rectangle, counterclockwise
      .lineToRelative( 0, NUMBER_OF_Y_SQUARES * options.sideLength )
      .lineToRelative( NUMBER_OF_X_SQUARES * options.sideLength, 0 )
      .lineToRelative( 0, -NUMBER_OF_Y_SQUARES * options.sideLength )
      .lineToRelative( -NUMBER_OF_X_SQUARES * options.sideLength, 0 )
      .lineTo( 0, NUMBER_OF_Y_SQUARES / 2 * options.sideLength )

      // draw the middle horizontal line, left to right
      .lineToRelative( NUMBER_OF_X_SQUARES * options.sideLength, 0 )

      // draw the inner vertical lines, right to left
      .moveTo( NUMBER_OF_X_SQUARES * options.sideLength * 0.8, 0 )
      .lineToRelative( 0, NUMBER_OF_Y_SQUARES * options.sideLength )
      .moveTo( NUMBER_OF_X_SQUARES * options.sideLength * 0.6, 0 )
      .lineToRelative( 0, NUMBER_OF_Y_SQUARES * options.sideLength )
      .moveTo( NUMBER_OF_X_SQUARES * options.sideLength * 0.4, 0 )
      .lineToRelative( 0, NUMBER_OF_Y_SQUARES * options.sideLength )
      .moveTo( NUMBER_OF_X_SQUARES * options.sideLength * 0.2, 0 )
      .lineToRelative( 0, NUMBER_OF_Y_SQUARES * options.sideLength )
      .close();

    return new Path( tenFrameShape, options );
  }
}

numberSuiteCommon.register( 'TenFrameNode', TenFrameNode );
export default TenFrameNode;
