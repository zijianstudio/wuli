// Copyright 2013-2023, University of Colorado Boulder

/**
 * A number displayed on a rectangular background.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, NodeOptions, Rectangle, TColor, Text } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';

type SelfOptions = {
  decimalPlaces?: number;
  font?: PhetFont;
  textFill?: TColor;
  backgroundFill?: TColor;
  backgroundStroke?: TColor;
  minWidth?: number;
  minHeight?: number;
  xMargin?: number;
  yMargin?: number;
  cornerRadius?: number;
};

type NumberBackgroundNodeOptions = SelfOptions;

export default class NumberBackgroundNode extends Node {

  private readonly disposeNumberBackgroundNode: () => void;

  public constructor( valueProperty: TReadOnlyProperty<number>, providedOptions?: NumberBackgroundNodeOptions ) {

    const options = optionize<NumberBackgroundNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      decimalPlaces: 0,
      font: new PhetFont( 12 ),
      textFill: 'black',
      backgroundFill: 'white',
      backgroundStroke: null,
      minWidth: 0,
      minHeight: 0,
      xMargin: 5,
      yMargin: 5,
      cornerRadius: 6
    }, providedOptions );

    const textNode = new Text( '?', {
      fill: options.textFill,
      font: options.font
    } );

    const backgroundNode = new Rectangle( 0, 0, 1, 1, {
      fill: options.backgroundFill,
      stroke: options.backgroundStroke,
      cornerRadius: options.cornerRadius
    } );

    options.children = [ backgroundNode, textNode ];

    super( options );

    const valueObserver = ( value: number ) => {

      // format the value
      textNode.string = Utils.toFixed( value, options.decimalPlaces );

      // adjust the background to fit the value
      const backgroundWidth = Math.max( options.minWidth, textNode.width + options.xMargin + options.xMargin );
      const backgroundHeight = Math.max( options.minHeight, textNode.height + options.yMargin + options.yMargin );
      backgroundNode.setRect( 0, 0, backgroundWidth, backgroundHeight );

      // center the value in the background
      textNode.centerX = backgroundNode.centerX;
      textNode.centerY = backgroundNode.centerY;
    };
    valueProperty.link( valueObserver ); // unlink in dispose

    this.disposeNumberBackgroundNode = () => {
      valueProperty.unlink( valueObserver );
    };
  }

  public override dispose(): void {
    this.disposeNumberBackgroundNode();
    super.dispose();
  }
}

graphingLines.register( 'NumberBackgroundNode', NumberBackgroundNode );