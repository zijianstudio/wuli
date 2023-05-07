// Copyright 2013-2023, University of Colorado Boulder

/**
 * A translucent red 'X', to be placed on top of an equation whose slope is undefined.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Line, Node } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';

const LINE_OPTIONS = {
  stroke: 'rgba( 255, 0, 0, 0.3 )',
  lineWidth: 4
};

export default class UndefinedSlopeIndicator extends Node {

  private readonly line1: Line;
  private readonly line2: Line;

  public constructor( width: number, height: number ) {

    const line1 = new Line( 0, 0, 0, 1, LINE_OPTIONS );
    const line2 = new Line( 0, 0, 0, 1, LINE_OPTIONS );

    super( {
      children: [ line1, line2 ]
    } );

    this.line1 = line1;
    this.line2 = line2;

    // initialize
    this.setSize( width, height );
  }

  // Sets the size of the 'X'.
  public setSize( width: number, height: number ): void {
    this.line1.setLine( 0, 0, width, height );
    this.line2.setLine( 0, height, width, 0 );
  }
}

graphingLines.register( 'UndefinedSlopeIndicator', UndefinedSlopeIndicator );