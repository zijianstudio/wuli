// Copyright 2023, University of Colorado Boulder

/**
 * Panel that shows the graph of the swept area under the curve of the orbit.
 *
 * @author Agustín Vallejo
 */

import { Color, Node, PaintableOptions, RichText, RichTextOptions, Text, VBox } from '../../../../scenery/js/imports.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import KeplersLawsModel from '../model/KeplersLawsModel.js';
import SolarSystemCommonColors from '../../../../solar-system-common/js/SolarSystemCommonColors.js';
import KeplersLawsStrings from '../../../../keplers-laws/js/KeplersLawsStrings.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import ChartRectangle from '../../../../bamboo/js/ChartRectangle.js';
import BarPlot from '../../../../bamboo/js/BarPlot.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import TickMarkSet, { TickMarkSetOptions } from '../../../../bamboo/js/TickMarkSet.js';
import keplersLaws from '../../keplersLaws.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Utils from '../../../../dot/js/Utils.js';
import KeplersLawsConstants from '../../KeplersLawsConstants.js';

const xAxisLength = 180;
const yAxisLength = 180;

const FOREGROUND_COLOR_PROPERTY = SolarSystemCommonColors.foregroundProperty;

// How much bigger is the top of the graph compared to the total area
const UPSCALE = 1.3;

const TITLE_OPTIONS = {
  font: SolarSystemCommonConstants.TITLE_FONT,
  fill: FOREGROUND_COLOR_PROPERTY
};

export default class SecondLawGraph extends AccordionBox {

  public constructor( public readonly model: KeplersLawsModel ) {

    const options = combineOptions<AccordionBoxOptions>( {
      visibleProperty: model.isSecondLawProperty,
      titleNode: new Text( KeplersLawsStrings.sweptAreaStringProperty, TITLE_OPTIONS ),
      titleYMargin: 4
    }, SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS );

    const xAxis = new ArrowNode( 0, 0, xAxisLength, 0, {
      fill: FOREGROUND_COLOR_PROPERTY,
      stroke: FOREGROUND_COLOR_PROPERTY,
      tailWidth: 1
    } );
    const yAxis = new ArrowNode( 0, 0, 0, -yAxisLength * 1.05, {
      fill: FOREGROUND_COLOR_PROPERTY,
      stroke: FOREGROUND_COLOR_PROPERTY,
      tailWidth: 1
    } );

    const barPlot = new AreasBarPlot( model );
    barPlot.y = -yAxisLength;

    const xAxisLabel = new Text( KeplersLawsStrings.area.periodDivisionStringProperty, TITLE_OPTIONS );
    const yAxisLabel = new RichText(
      KeplersLawsStrings.area.areaUnitsStringProperty,
      combineOptions<RichTextOptions>( {
        x: -25,
        centerY: -yAxisLength * 0.5,
        rotation: -Math.PI / 2
      }, SolarSystemCommonConstants.TITLE_OPTIONS )
    );

    super( new VBox( {
        spacing: 10,
        children: [
          new Node( {
            children: [
              barPlot,
              xAxis,
              yAxis,
              yAxisLabel
            ]
          } ),
          xAxisLabel
        ]
      }
    ), options );

    this.expandedProperty.value = false;
  }
}

class AreasBarPlot extends Node {

  public constructor( public model: KeplersLawsModel ) {
    super();

    // -1 is so that the first bar is not inside the Y axis
    let modelXRange = new Range( -1, 6 );
    let modelYRange = new Range( 0, 1 );

    // one data point for each integer point in the model, y values interpolated along the x range from min to max
    let dataSet: Vector2[] = [];

    const chartTransform = new ChartTransform( {
      viewWidth: xAxisLength,
      viewHeight: yAxisLength,
      modelXRange: modelXRange,
      modelYRange: modelYRange
    } );

    const chartRectangle = new ChartRectangle( chartTransform );

    const barPlot = new BarPlot( chartTransform, dataSet );

    const orbitChangedListener = () => {
      const activeAreas = model.engine.orbitalAreas.filter( area => area.active );
      dataSet = [];

      // First forEach is for updating the dataset, which will create the rectangles
      // Second forEach is for updating the color of the rectangles
      activeAreas.forEach( ( area, index ) => {
        // Setting all the bar's height and pushing them to the dataSet
        const height = area.alreadyEntered && !area.insideProperty.value ? model.engine.segmentArea : area.sweptArea;
        const realIndex = this.model.engine.retrograde ? this.model.periodDivisionProperty.value - index - 1 : index;
        dataSet.push( new Vector2( realIndex, height ) );
      } );
      barPlot.setDataSet( dataSet ); // BarPlot creates the rectangles here

      activeAreas.forEach( ( area, index ) => {
        // Setting the color of the bar
        const alpha = area.insideProperty.value ? 1 : area.completion;
        const paintableFields: PaintableOptions = {
          fill: new Color( 'fuchsia' ).setAlpha( alpha )
        };
        barPlot.rectangles[ index ].mutate( paintableFields );
      } );
    };

    // x Labels of each area bar
    const XTickLabelSet = new TickLabelSet( chartTransform, Orientation.HORIZONTAL, 1, {
      edge: 'min'
    } );

    // y tick marks
    const YSpacing = 1e4;

    const entries = [
      { scale: 0.001 },
      { scale: 0.01 },
      { scale: 0.1 },
      { scale: 1 },
      { scale: 10 },
      { scale: 100 },
      { scale: 1000 } ];
    const yTickMarkSets = entries.map( entry =>
      new LimitedTickMarkSet( chartTransform, Orientation.VERTICAL, YSpacing * entry.scale, {
        edge: 'min',
        stroke: FOREGROUND_COLOR_PROPERTY,
        // The tickmarks get a little smaller as you zoom out
        extent: 13 - 2 * Math.log10( entry.scale )
      } ) );

    const tickParentNode = new Node();

    const updateYRange = () => {
      modelYRange = new Range( 0, UPSCALE * this.model.engine.totalArea / 2 );
      chartTransform.setModelYRange( modelYRange );

      const children: TickMarkSet[] = [];
      yTickMarkSets.forEach( ( tickMarkSet, index ) => {
        const distanceBetweenTickMarks = tickMarkSet.spacing / modelYRange.max;

        // Within this range we apply a linear function for the transparency
        const UPPER = 0.09;
        const LOWER = 0.016;
        if ( distanceBetweenTickMarks < UPPER && distanceBetweenTickMarks > LOWER ) {
          const linear = Utils.linear( UPPER, LOWER, 1, 0, distanceBetweenTickMarks );
          tickMarkSet.opacity = linear;
          children.push( tickMarkSet );
        }
        else if ( distanceBetweenTickMarks > UPPER ) {
          tickMarkSet.opacity = 1;
          children.push( tickMarkSet );
        }
      } );
      if ( !shallowCompare( tickParentNode.children, children ) ) {
        tickParentNode.children = children;
      }
    };

    // Linking the period division to modify the chart ranges and labels
    this.model.periodDivisionProperty.link( periodDivision => {
      modelXRange = new Range( -1, periodDivision );
      chartTransform.setModelXRange( modelXRange );
      barPlot.barWidth = 15 * ( KeplersLawsConstants.MAX_ORBITAL_DIVISIONS / periodDivision );
      barPlot.update();
      XTickLabelSet.setCreateLabel( ( value: number ) => {
        return ( value >= 0 && value < periodDivision ) ?
               new Text( ( value + 1 ).toString(), TITLE_OPTIONS ) : null;
      } );
      // updateYRange();
    } );

    updateYRange();

    // anything you want clipped goes in here
    const chartClip = new Node( {
      clipArea: chartRectangle.getShape(),
      children: [ barPlot ]
    } );


    this.children = [
      chartRectangle,
      chartClip,
      XTickLabelSet,
      tickParentNode
    ];

    model.engine.changedEmitter.addListener( () => {
      orbitChangedListener();
      updateYRange();
    } );
  }
}

class LimitedTickMarkSet extends TickMarkSet {
  public override spacing: number;

  public constructor( chartTransform: ChartTransform, axisOrientation: Orientation, spacing: number,
                      providedOptions?: TickMarkSetOptions ) {
    super( chartTransform, axisOrientation, spacing, providedOptions );
    this.spacing = spacing;
  }

  protected override update(): void {
    const [ nMin, nMax ] = this.chartTransform.getSpacingBorders( this.axisOrientation, this.spacing, this.origin, this.clippingType );

    if ( nMax - nMin < 100 ) {
      super.update();
    }
  }
}

function shallowCompare( arr1: Node[], arr2: Node[] ): boolean {
  if ( arr1.length !== arr2.length ) {
    return false;
  }

  for ( let i = 0; i < arr1.length; i++ ) {
    if ( arr1[ i ] !== arr2[ i ] ) {
      return false;
    }
  }

  return true;
}

keplersLaws.register( 'SecondLawGraph', SecondLawGraph );