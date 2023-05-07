// Copyright 2021-2023, University of Colorado Boulder

/**
 * PointToolBodyNode is the body portion of the point tool. It includes everything except the tool's probe.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import { Color, LinearGradient, Node, NodeOptions, Rectangle, RichText, TColor, VBox } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import GLColors from '../GLColors.js';

// constants
const DEFAULT_FONT = new PhetFont( { size: 15, weight: 'bold' } );
const NUMBER_OF_GRIPS = 3;

// The side where the client intends to add a probe
type CoordinatesSide = 'left' | 'right';

type SelfOptions = {

  // The side where the client intends to add a probe
  coordinatesSide?: CoordinatesSide;

  // For both the body and text background
  cornerRadius?: number;

  // body
  bodyWidth?: number;
  bodyHeight?: number;
  bodyColor?: TColor;
  bodyXMargin?: number;

  // text background
  backgroundWidth?: number;
  backgroundHeight?: number;
  backgroundFill?: TColor;
  backgroundStroke?: TColor;
  backgroundXMargin?: number;
  backgroundYMargin?: number;

  // text
  font?: PhetFont;
  textFill?: TColor;
  decimals?: number;
};

type PointToolBodyNodeOptions = SelfOptions;

export default class PointToolBodyNode extends Node {

  private readonly background: Rectangle;
  private readonly textNode: RichText;
  private readonly disposePointToolBodyNode: () => void;

  public constructor( coordinatesProperty: TReadOnlyProperty<Vector2 | null>, providedOptions?: PointToolBodyNodeOptions ) {

    const options = optionize<PointToolBodyNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      coordinatesSide: 'left',
      cornerRadius: 8,
      bodyWidth: 130,
      bodyHeight: 48,
      bodyColor: GLColors.POINT_TOOL_COLOR,
      bodyXMargin: 7,
      backgroundWidth: 70,
      backgroundHeight: 35,
      backgroundFill: 'white',
      backgroundStroke: Color.grayColor( 185 ),
      backgroundXMargin: 4,
      backgroundYMargin: 2,
      font: DEFAULT_FONT,
      textFill: 'black',
      decimals: 1
    }, providedOptions );

    // The main rectangle
    const bodyRectangle = new ShadedRectangle( new Bounds2( 0, 0, options.bodyWidth, options.bodyHeight ), {
      baseColor: options.bodyColor,
      lightOffset: 0.95,
      cornerRadius: options.cornerRadius
    } );

    // The background rectangle that appears behind the coordinates
    const background = new Rectangle( 0, 0, options.backgroundWidth, options.backgroundHeight, {
      cornerRadius: options.cornerRadius,
      lineWidth: 2,
      fill: options.backgroundFill,
      stroke: options.backgroundStroke,
      centerY: bodyRectangle.centerY
    } );

    // The text that displays the coordinates
    const textNode = new RichText( '', {
      font: options.font,
      fill: options.textFill,
      maxWidth: options.backgroundWidth - ( 2 * options.backgroundXMargin ),
      maxHeight: options.backgroundHeight - ( 2 * options.backgroundYMargin )
    } );

    // Horizontal 'grip' bars that cue the user to drag the tool
    const gripWidth = bodyRectangle.width - background.width - ( 3 * options.bodyXMargin );
    const gripHeight = 4;
    const gripFill = new LinearGradient( 0, 0, 0, gripHeight )
      .addColorStop( 0, 'white' )
      .addColorStop( 0.5, options.bodyColor )
      .addColorStop( 1, Color.grayColor( 20 ) );
    const gripStroke = Color.grayColor( 140 );
    const grips = [];
    for ( let i = 0; i < NUMBER_OF_GRIPS; i++ ) {
      grips.push( new Rectangle( 0, 0, gripWidth, gripHeight, {
        cornerRadius: gripHeight / 2,
        fill: gripFill,
        stroke: gripStroke,
        lineWidth: 0.5
      } ) );
    }
    const gripsBox = new VBox( {
      children: grips,
      spacing: 6,
      centerY: bodyRectangle.centerY
    } );

    // Layout
    if ( options.coordinatesSide === 'left' ) {
      background.left = bodyRectangle.left + options.bodyXMargin;
      gripsBox.right = bodyRectangle.right - options.bodyXMargin;
    }
    else {
      background.right = bodyRectangle.right - options.bodyXMargin;
      gripsBox.left = bodyRectangle.left + options.bodyXMargin;
    }

    assert && assert( !options.children );
    options.children = [ bodyRectangle, background, textNode, gripsBox ];

    super( options );

    // Update the displayed coordinates. Use toFixedNumber so that trailing zeros are removed.
    const coordinatesListener = ( coordinates: Vector2 | null ) => {
      if ( coordinates ) {
        const x = Utils.toFixedNumber( coordinates.x, options.decimals );
        const y = Utils.toFixedNumber( coordinates.y, options.decimals );
        textNode.string = StringUtils.format( GraphingLinesStrings.point.XY, x, y );
      }
      else {
        textNode.string = GraphingLinesStrings.point.unknown;
      }
    };
    coordinatesProperty.link( coordinatesListener );

    // Keep the coordinates centered in the background.
    textNode.boundsProperty.link( () => {
      textNode.center = background.center;
    } );

    this.disposePointToolBodyNode = () => {
      if ( coordinatesProperty.hasListener( coordinatesListener ) ) {
        coordinatesProperty.unlink( coordinatesListener );
      }
    };

    this.background = background;
    this.textNode = textNode;
  }

  public override dispose(): void {
    this.disposePointToolBodyNode();
    super.dispose();
  }

  /**
   * Sets the fill for the text.
   */
  public setTextFill( fill: TColor ): void {
    this.textNode.fill = fill;
  }

  /**
   * Sets the fill for the text background.
   */
  public setBackgroundFill( fill: TColor ): void {
    this.background.fill = fill;
  }
}

graphingLines.register( 'PointToolBodyNode', PointToolBodyNode );