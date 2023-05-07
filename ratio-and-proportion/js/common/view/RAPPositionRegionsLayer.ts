// Copyright 2021-2022, University of Colorado Boulder

/**
 * Graphic to display the qualitative positional regions used for describing the position of the hands in each ratio half.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';
import { Line, Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import HandPositionsDescriber from './describers/HandPositionsDescriber.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';

class RAPPositionRegionsLayer extends Node {

  private totalWidth: number;
  private totalHeight: number;
  public labelsHeight: number;
  private regionValues: number[];

  public constructor( options?: NodeOptions ) {

    super( options );

    // Temp values to start, updated on layout()
    this.totalWidth = 1000;
    this.totalHeight = 1000;
    this.labelsHeight = 1000;

    // Values are normalized, we are working from highest to lowest, so start with "1" so the top region has space.
    this.regionValues = [ 1 ].concat( HandPositionsDescriber.POSITION_REGIONS_DATA.map( data => data.lowerBound ) );
  }

  public layout( width: number, height: number ): void {

    this.totalHeight = height;
    this.totalWidth = width;
    this.update();
  }

  private update(): void {
    this.children = [];

    for ( let i = 0; i < this.regionValues.length; i++ ) {
      const regionValue = this.regionValues[ i ];
      const nextRegionValue: number = this.regionValues[ i + 1 ];
      const height = this.totalHeight - ( regionValue * this.totalHeight );
      this.addChild( new Line( 0, height, this.totalWidth, height, { stroke: 'red' } ) );
      if ( nextRegionValue !== undefined ) {
        const centerOfRange = ( ( this.totalHeight - ( nextRegionValue * this.totalHeight ) ) - height ) / 2;
        const text = new Text( HandPositionsDescriber.POSITION_REGIONS_DATA[ i ].region, {
          centerY: height + centerOfRange,
          centerX: this.totalWidth / 2,
          stroke: 'black',
          font: new PhetFont( 17 )
        } );
        this.labelsHeight = text.height;
        this.addChild( text );
      }
    }
  }
}

ratioAndProportion.register( 'RAPPositionRegionsLayer', RAPPositionRegionsLayer );
export default RAPPositionRegionsLayer;