// Copyright 2020-2022, University of Colorado Boulder

/**
 * Sim specific grid implementation that supports customization through passed in Properties. This uses minor lines
 * from GridNode, but not major lines. In Ration and Proportion, these grid lines are called "tick marks"
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import GridNode from '../../../../griddle/js/GridNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import TickMarkView from './TickMarkView.js';
import { PathOptions, TPaint } from '../../../../scenery/js/imports.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Multilink from '../../../../axon/js/Multilink.js';

type SelfOptions = {
  minorHorizontalLineSpacing?: number | null;
  minorLineOptions?: PathOptions;
};
type RatioHalfTickMarksNodeOptions = SelfOptions & PathOptions;

class RatioHalfTickMarksNode extends GridNode {

  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private tickMarkRangeProperty: Property<number>;

  public constructor( tickMarkViewProperty: EnumerationProperty<TickMarkView>, tickMarkRangeProperty: Property<number>, width: number,
                      height: number, colorProperty: TPaint, providedOptions?: SelfOptions ) {
    const options = optionize<RatioHalfTickMarksNodeOptions, SelfOptions>()( {

      // initial line spacings
      minorHorizontalLineSpacing: 10,
      minorLineOptions: {
        stroke: colorProperty,
        lineWidth: 2
      }
    }, providedOptions );

    super( width, height, options );

    this.tickMarkViewProperty = tickMarkViewProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;

    Multilink.multilink( [ tickMarkRangeProperty, tickMarkViewProperty ], this.update.bind( this ) );
  }

  public layout( width: number, height: number ): void {
    this.setGridWidth( width );
    this.setGridHeight( height );
    this.update( this.tickMarkRangeProperty.value, this.tickMarkViewProperty.value );
  }

  private update( tickMarkRange: number, tickMarkView: TickMarkView ): void {

    // subtract one to account for potential rounding errors. This helps guarantee that the last line is drawn.
    this.setLineSpacings( {
      minorHorizontalLineSpacing: ( this.gridHeight - 1 ) / tickMarkRange
    } );

    this.visible = TickMarkView.displayHorizontal( tickMarkView );
  }
}

ratioAndProportion.register( 'RatioHalfTickMarksNode', RatioHalfTickMarksNode );
export default RatioHalfTickMarksNode;