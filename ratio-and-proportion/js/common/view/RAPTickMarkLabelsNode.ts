// Copyright 2020-2022, University of Colorado Boulder

/**
 * Labels for the ratio tick marks that are centered on the horizontal tick marks.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../../axon/js/Property.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import TickMarkView from './TickMarkView.js';
import Multilink from '../../../../axon/js/Multilink.js';

const LABEL_X = 0;

class RAPTickMarkLabelsNode extends Node {

  private totalHeight: number;
  private heightOfText: number | null = null;
  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private tickMarkRangeProperty: Property<number>;
  private colorProperty: TReadOnlyProperty<Color | string>;

  public constructor( tickMarkViewProperty: EnumerationProperty<TickMarkView>, tickMarkRangeProperty: Property<number>, height: number,
                      colorProperty: TReadOnlyProperty<Color | string>, options?: StrictOmit<NodeOptions, 'children'> ) {

    super();

    this.totalHeight = height;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.colorProperty = colorProperty;

    this.mutate( options );

    Multilink.multilink( [ tickMarkRangeProperty, tickMarkViewProperty ], this.update.bind( this ) );
  }

  /**
   * Get the height of a single label Text.
   *
   */
  public get labelHeight(): number {
    assert && assert( this.heightOfText, 'cannot get labelHeight until labels have been drawn' );
    return this.heightOfText!;
  }

  public layout( height: number ): void {
    this.totalHeight = height;
    this.update( this.tickMarkRangeProperty.value, this.tickMarkViewProperty.value );
  }

  private update( tickMarkRange: number, tickMarkView: TickMarkView ): void {

    // subtract one to account for potential rounding errors. This helps guarantee that the last line is drawn.
    const horizontalSpacing = ( this.totalHeight - 1 ) / tickMarkRange;

    this.visible = tickMarkView === TickMarkView.VISIBLE_WITH_UNITS;

    this.updateUnitLabels( horizontalSpacing );
  }

  /**
   * Note: will clear all children
   */
  private updateUnitLabels( horizontalSpacing: number ): void {
    this.children = [];

    let i = 0;

    for ( let y = 0; y <= this.totalHeight; y += horizontalSpacing ) {
      const text = new Text( i, {
        centerX: LABEL_X,
        font: new PhetFont( { size: 18, weight: 'bold' } ),
        fill: this.colorProperty,
        centerY: this.totalHeight - y
      } );
      this.heightOfText = text.height;

      this.addChild( text );
      i++;
    }
  }
}

ratioAndProportion.register( 'RAPTickMarkLabelsNode', RAPTickMarkLabelsNode );
export default RAPTickMarkLabelsNode;