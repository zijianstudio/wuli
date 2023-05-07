// Copyright 2022-2023, University of Colorado Boulder

/**
 * A number line for displaying data objects.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import { Node, NodeOptions, Path, Text, TPaint } from '../../../../scenery/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Range from '../../../../dot/js/Range.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import CAVColors from '../CAVColors.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import CAVConstants from '../CAVConstants.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Multilink from '../../../../axon/js/Multilink.js';

type SelfOptions = {
  color?: TPaint;
  includeXAxis: boolean;
  includeMeanStroke: boolean;
};
export type NumberLineNodeOptions = SelfOptions & NodeOptions & PickRequired<NodeOptions, 'tandem'>;

export default class NumberLineNode extends Node {

  // For layout
  public readonly tickMarkSet: TickMarkSet;

  public constructor(
    meanValueProperty: TReadOnlyProperty<number | null>,
    isShowingMeanIndicatorProperty: TReadOnlyProperty<boolean>,
    rangeProperty: TReadOnlyProperty<Range | null>,
    providedOptions?: NumberLineNodeOptions
  ) {

    const options = optionize<NumberLineNodeOptions, SelfOptions, NodeOptions>()( {
      color: 'white'
    }, providedOptions );

    super();

    // Tick marks on the dot plot are a little shorter than in the play area
    const tickMarkExtent = options.includeXAxis ? 7 : 10;

    const chartTransform = new ChartTransform( {
      viewWidth: CAVConstants.CHART_VIEW_WIDTH,
      modelXRange: CAVConstants.PHYSICAL_RANGE,
      viewHeight: tickMarkExtent / 2,
      modelYRange: new Range( 0, 1 )
    } );
    const tickMarkSet = new TickMarkSet( chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: options.color,
      extent: tickMarkExtent
    } );
    this.addChild( tickMarkSet );

    this.tickMarkSet = tickMarkSet;

    const tickLabelSet = new TickLabelSet( chartTransform, Orientation.HORIZONTAL, 1, {
      extent: tickMarkExtent + 12,
      createLabel: ( value: number ) => new Text( Utils.toFixed( value, 0 ), {
        fontSize: 16,
        fill: options.color
      } )
    } );
    this.addChild( tickLabelSet );

    if ( options.includeXAxis ) {
      const xAxisNode = new Path( new Shape()
        .moveTo( tickMarkSet.left, 0 )
        .lineTo( tickMarkSet.right, 0 ), {
        stroke: options.color
      } );
      this.addChild( xAxisNode );

      // For the dot plot, when "mean" is selected, there is a purple overlay on the x-axis (if there is an x-axis)
      const rangeNode = new Path( new Shape().moveTo( 0, 0 ).lineToRelative( 100, 0 ), {
        stroke: CAVColors.meanColorProperty,
        lineWidth: 3.2
      } );
      Multilink.multilink( [ rangeProperty, isShowingMeanIndicatorProperty ],
        ( range, isShowingMeanIndicator ) => {
          if ( range !== null ) {

            // Do not show any area or text above the data point if the range is 0
            rangeNode.shape = new Shape()
              .moveTo( modelViewTransform.modelToViewX( range.min ), 0 )
              .lineTo( modelViewTransform.modelToViewX( range.max ), 0 );
          }
          rangeNode.visible = isShowingMeanIndicator && range !== null;
        } );

      this.addChild( rangeNode );
    }

    // TODO: See see https://github.com/phetsims/center-and-variability/issues/168, Can we make a 1d MVT since that's
    // all that's needed here, or should this be using the same MVT as the outer MVT?  Like the one that positions the number line node,
    // and puts objects in the right spots.
    const modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      new Bounds2( CAVConstants.PHYSICAL_RANGE.min, 0, CAVConstants.PHYSICAL_RANGE.max, CAVConstants.PHYSICAL_RANGE.getLength() ),
      new Bounds2( 0, -CAVConstants.CHART_VIEW_WIDTH, CAVConstants.CHART_VIEW_WIDTH, CAVConstants.CHART_VIEW_WIDTH )
    );

    const meanIndicatorNode = NumberLineNode.createMeanIndicatorNode( options.includeMeanStroke, false );
    this.addChild( meanIndicatorNode );

    Multilink.multilink( [ meanValueProperty, isShowingMeanIndicatorProperty ],
      ( meanValue, isShowingMeanIndicator ) => {
        if ( meanValue !== null ) {
          meanIndicatorNode.centerTop = new Vector2( modelViewTransform.modelToViewX( meanValue ), 0 );
        }
        meanIndicatorNode.visible = isShowingMeanIndicator && meanValue !== null;
      } );

    this.mutate( options );
  }

  public static createMeanIndicatorNode( includeStroke: boolean, isIcon: boolean ): Node {
    const TRIANGLE_LENGTH = 15;
    const TRIANGLE_ALTITUDE = 13;

    // This is a triangle that points up.  Start at the top center tip.
    const TRIANGLE_SHAPE = new Shape().moveTo( 0, 0 )

      // Moving counterclockwise
      .lineTo( -TRIANGLE_LENGTH / 2, TRIANGLE_ALTITUDE )
      .lineToRelative( TRIANGLE_LENGTH, 0 )
      .close();

    return new Path( TRIANGLE_SHAPE, {
      fill: CAVColors.meanColorProperty,
      stroke: includeStroke ? CAVColors.arrowStrokeProperty : null,
      lineWidth: CAVConstants.ARROW_LINE_WIDTH
    } );
  }
}

centerAndVariability.register( 'NumberLineNode', NumberLineNode );