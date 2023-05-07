// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that represents a number line for nucleons. The current nucleon count is highlighted on the number line.
 *
 * @author Luisa Vargas
 */

import { Color, ColorProperty, Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import AxisArrowNode from '../../../../bamboo/js/AxisArrowNode.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import optionize from '../../../../phet-core/js/optionize.js';

type SelfOptions = {
  labelHighlightColorProperty: ColorProperty;
  axisLabel: string;
  tickSpacing?: number;
};
type NucleonNumberLineOptions = SelfOptions & StrictOmit<NodeOptions, 'children'>;

class NucleonNumberLine extends Node {

  public constructor( chartTransform: ChartTransform, particleCountProperty: TReadOnlyProperty<number>,
                      orientation: Orientation, providedOptions: NucleonNumberLineOptions ) {

    const options = optionize<NucleonNumberLineOptions, SelfOptions, NodeOptions>()( {
      tickSpacing: 1
    }, providedOptions );

    super( options );

    const numberLineNode = new Node();

    // create and add the tick marks
    const tickMarkSet = new TickMarkSet( chartTransform, orientation, options.tickSpacing, {
      stroke: Color.BLACK,
      lineWidth: 1
    } );
    numberLineNode.addChild( tickMarkSet );

    // create and add the tick labels
    const tickLabelSet = new TickLabelSet( chartTransform, orientation, options.tickSpacing, {
      extent: 5,
      createLabel: ( value: number ) => new BackgroundNode( new Text( value, {
          fontSize: 12,
          fill: new DerivedProperty( [ particleCountProperty ],
            particleCount => {
              return particleCount === value ? Color.WHITE : Color.BLACK;
            } )
        } ),
        {
          rectangleOptions: {
            fill: new DerivedProperty( [ particleCountProperty ],
              particleCount => {
                return particleCount === value ? options.labelHighlightColorProperty.value : null;
              } ),
            opacity: 1
          },
          yMargin: 1.5
        } ),
      positionLabel: ( label: Node, tickBounds: Bounds2, axisOrientation: Orientation ) => {
        if ( axisOrientation === Orientation.HORIZONTAL ) {

          // ticks flow horizontally, so tick labels should be below
          label.centerTop = tickBounds.centerBottom.plusXY( chartTransform.modelToViewDeltaX( -options.tickSpacing / 2 ), 0 );
        }
        else {

          // ticks flow vertically, so tick labels should be to the left
          label.rightCenter = tickBounds.leftCenter.plusXY( 0, chartTransform.modelToViewDeltaY( -options.tickSpacing / 2 ) );
        }
        return label;
      }
    } );
    numberLineNode.addChild( tickLabelSet );

    // create and add the arrow to the number line
    const numberLine = new AxisArrowNode( chartTransform, orientation, {
      doubleHead: false,
      tailWidth: 1,
      headWidth: 7
    } );
    numberLineNode.addChild( numberLine );
    this.addChild( numberLineNode );

    // create and add the number line axis label
    const numberLineLabel = new Text( options.axisLabel, { fontSize: 12 } );
    if ( orientation === Orientation.HORIZONTAL ) {
      numberLineLabel.top = numberLine.bottom + 15;
      numberLineLabel.centerX = numberLine.centerX;
    }
    else {
      numberLineLabel.setRotation( 3 * Math.PI / 2 );
      numberLineLabel.centerX = numberLine.centerX - 25;
      numberLineLabel.centerY = numberLine.centerY;
    }
    this.addChild( numberLineLabel );
  }
}

buildANucleus.register( 'NucleonNumberLine', NucleonNumberLine );
export default NucleonNumberLine;
