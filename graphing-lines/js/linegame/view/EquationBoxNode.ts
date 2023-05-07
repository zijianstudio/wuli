// Copyright 2013-2023, University of Colorado Boulder

/**
 * Box around an equation in the 'Line Game'.
 * Has an icon that indicates 'correct' (check mark) or 'incorrect' (red 'X').
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Rectangle, TColor, Text } from '../../../../scenery/js/imports.js';
import checkSolidShape from '../../../../sherpa/js/fontawesome-5/checkSolidShape.js';
import timesSolidShape from '../../../../sherpa/js/fontawesome-5/timesSolidShape.js';
import graphingLines from '../../graphingLines.js';
import LineGameConstants from '../LineGameConstants.js';

// constants
const X_MARGIN = 20;
const Y_MARGIN = 10;

export default class EquationBoxNode extends Node {

  // icons for 'correct' and 'incorrect'
  private readonly correctIconNode: Path;
  private readonly incorrectIconNode: Path;

  public constructor( title: string, titleColor: TColor, boxSize: Dimension2, equationNode: Node ) {

    super();

    this.correctIconNode = new Path( checkSolidShape, {
      scale: 0.12,
      fill: LineGameConstants.ANSWER_COLOR
    } );

    this.incorrectIconNode = new Path( timesSolidShape, {
      scale: 0.12,
      fill: PhetColorScheme.RED_COLORBLIND
    } );

    const titleNode = new Text( title, {
      fill: titleColor,
      font: new PhetFont( { size: 24, weight: 'bold' } ),
      maxWidth: boxSize.width - ( 2 * X_MARGIN ) - Math.max( this.correctIconNode.width, this.incorrectIconNode.width )
    } );

    const boxNode = new Rectangle( 0, 0, boxSize.width, boxSize.height, 20, 20, {
      fill: 'rgb( 238, 238, 238 )',
      stroke: 'black',
      lineWidth: 1
    } );

    equationNode.maxWidth = boxSize.width - ( 2 * X_MARGIN ); // constrain width for i18n

    // rendering order
    this.addChild( boxNode );
    this.addChild( titleNode );
    this.addChild( equationNode );
    this.addChild( this.correctIconNode );
    this.addChild( this.incorrectIconNode );

    // layout
    // title in upper left
    titleNode.left = X_MARGIN;
    titleNode.top = Y_MARGIN;
    // equation left-justified, vertically centered in space below title
    equationNode.left = X_MARGIN;
    equationNode.centerY = titleNode.bottom + ( ( boxNode.bottom - titleNode.bottom ) / 2 );
    // icons in upper-right corner
    this.correctIconNode.right = boxNode.right - X_MARGIN;
    this.correctIconNode.top = boxNode.top + Y_MARGIN;
    this.incorrectIconNode.right = boxNode.right - X_MARGIN;
    this.incorrectIconNode.top = boxNode.top + Y_MARGIN;

    // icons are initially hidden
    this.correctIconNode.visible = false;
    this.incorrectIconNode.visible = false;
  }

  // Sets the visibility of the correct icon (green check mark).
  public setCorrectIconVisible( visible: boolean ): void {
    this.correctIconNode.visible = visible;
  }

  // Sets the visibility of the incorrect icon (red X).
  public setIncorrectIconVisible( visible: boolean ): void {
    this.incorrectIconNode.visible = visible;
  }
}

graphingLines.register( 'EquationBoxNode', EquationBoxNode );