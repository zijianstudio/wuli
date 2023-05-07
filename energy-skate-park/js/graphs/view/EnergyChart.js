// Copyright 2019-2022, University of Colorado Boulder

/**
 * The energy chart in the Graphs screen of energy skate park. Plots Energy against time OR energy against position
 * depending on the selected independent variable. Uses XYCursorChartNode because the cursor can be dragged to
 * control playback and restore the model to a previous point in time.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import DynamicSeries from '../../../../griddle/js/DynamicSeries.js';
import DynamicSeriesNode from '../../../../griddle/js/DynamicSeriesNode.js';
import PointStyle from '../../../../griddle/js/PointStyle.js';
import PointStyledVector2 from '../../../../griddle/js/PointStyledVector2.js';
import XYCursorChartNode from '../../../../griddle/js/XYCursorChartNode.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import EnergySkateParkColorScheme from '../../common/view/EnergySkateParkColorScheme.js';
import energySkatePark from '../../energySkatePark.js';
import GraphsConstants from '../GraphsConstants.js';
import GraphsModel from '../model/GraphsModel.js';

// constants
// determines properties of the chart that may depend on the independent variable
const TIME_MAX_X = 20; // in seconds
const TIME_STEP_X = 2; // in seconds
const POSITION_MAX_X = 10; // in meters
const POSITION_STEP_X = 1; // in meters

// Origin in the model is at center of screen, but plots align 0 meters at the left edge of the track, 5 meters
// left of origin
const POSITION_PLOT_OFFSET = 5;

class EnergyChart extends XYCursorChartNode {

  /**
   * @param {GraphsModel} model
   * @param {number} graphWidth
   * @param {number} graphHeight
   * @param {Tandem} tandem
   */
  constructor( model, graphWidth, graphHeight, tandem ) {

    const dragEndedEmitter = new Emitter();
    const dragStartedEmitter = new Emitter();

    // whether or not the sim was paused when dragging started, if not paused on drag start we will resume
    // sim play when dragging ends
    let pausedOnDragStart = false;

    const plotRange = GraphsConstants.PLOT_RANGES[ model.energyPlotScaleIndexProperty.get() ];

    const modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleInvertedYMapping(
      new Bounds2( 0, plotRange.min, TIME_MAX_X, plotRange.max ),
      new Bounds2( 0, 0, graphWidth, graphHeight )
    ) );

    super( {

      // dimensions of the graph
      width: graphWidth,
      height: graphHeight,
      majorHorizontalLineSpacing: 500,
      majorVerticalLineSpacing: 1,

      modelViewTransformProperty: modelViewTransformProperty,

      // plot domain, range, and grid increments
      maxX: TIME_MAX_X,
      minY: plotRange.min,
      maxY: plotRange.max,

      // no arrows along x and y
      showAxis: false,

      // for the grid lines
      showVerticalIntermediateLines: false,
      showHorizontalIntermediateLines: false,
      cornerRadius: 0,
      gridNodeOptions: {
        majorLineOptions: {
          lineDash: [ 4, 4 ],
          stroke: 'gray'
        }
      },

      gridLabelOptions: {
        font: new PhetFont( 12 )
      },

      // for the cursor that shows current time
      cursorOptions: {
        includeDragCue: true,
        startDrag: ( event, listener ) => {
          pausedOnDragStart = model.pausedProperty.get();

          if ( !pausedOnDragStart ) {
            model.pausedProperty.set( true );
          }

          dragStartedEmitter.emit();
        },
        drag: ( event, listener ) => {

          // when we drag the cursor, get the skater sample at the closest cursor time and set skater to found SkaterState
          const closestSample = model.getClosestSkaterSample( this.getCursorValue() );
          model.setFromSample( closestSample );
          model.skater.updatedEmitter.emit();
        },
        endDrag: ( event, listener ) => {

          if ( !pausedOnDragStart ) {
            model.pausedProperty.set( false );
          }

          dragEndedEmitter.emit();
        }
      }
    } );

    const seriesOptions = { lineWidth: 2 };

    // @private {DynamicSeries}
    this.kineticEnergyDataSeries = new DynamicSeries( merge( {
      color: EnergySkateParkColorScheme.kineticEnergy,
      visibleProperty: model.kineticEnergyDataVisibleProperty
    }, seriesOptions ) );
    this.potentialEnergyDataSeries = new DynamicSeries( merge( {
      color: EnergySkateParkColorScheme.potentialEnergy,
      visibleProperty: model.potentialEnergyDataVisibleProperty
    }, seriesOptions ) );
    this.thermalEnergyDataSeries = new DynamicSeries( merge( {
      color: EnergySkateParkColorScheme.thermalEnergy,
      visibleProperty: model.thermalEnergyDataVisibleProperty
    }, seriesOptions ) );
    this.totalEnergyDataSeries = new DynamicSeries( merge( {
      color: EnergySkateParkColorScheme.totalEnergy,
      visibleProperty: model.totalEnergyDataVisibleProperty
    }, seriesOptions ) );

    this.addDynamicSeries( this.thermalEnergyDataSeries );
    this.addDynamicSeries( this.potentialEnergyDataSeries );
    this.addDynamicSeries( this.kineticEnergyDataSeries );
    this.addDynamicSeries( this.totalEnergyDataSeries );

    // when cursor drag finishes, clear all data that has time greater than cursor time and set model time
    // to the selected cursor time
    dragEndedEmitter.addListener( () => {

      // dragging may have ended (or was interrupted) due to Reset All, Eraser Button, or other
      // cases during multitouch, only do this work if we still have dataSamples
      if ( model.dataSamples.length > 0 ) {
        const timeOnEnd = this.getCursorValue();
        model.sampleTimeProperty.set( timeOnEnd );
        this.setCursorValue( timeOnEnd );
      }
    } );

    // update the transform for the plot so that recorded data is visible
    const updateModelViewTransformProperty = () => {
      const newRange = GraphsConstants.PLOT_RANGES[ model.energyPlotScaleIndexProperty.get() ];
      const newMaxY = newRange.max;
      const newMinY = newRange.min;

      const independentVariable = model.independentVariableProperty.get();
      const horizontalXRange = calculateDomain( independentVariable ).max;

      if ( model.dataSamples.length > 0 && independentVariable === GraphsModel.IndependentVariable.TIME ) {

        const minRecordedX = model.dataSamples.get( 0 ).time;
        const maxRecordedX = model.dataSamples.get( model.dataSamples.length - 1 ).time;
        const dataXRange = maxRecordedX - minRecordedX;
        const sampleTime = model.sampleTimeProperty.get();

        if ( dataXRange >= horizontalXRange ) {

          // we have filled up the range of the plot and so we translate our entire plot
          // as time moves forward
          modelViewTransformProperty.set( ModelViewTransform2.createRectangleInvertedYMapping(
            new Bounds2( sampleTime - horizontalXRange, newMinY, sampleTime, newMaxY ),
            new Bounds2( 0, 0, graphWidth, graphHeight )
          ) );
        }
        else {

          // we don't have data to fill the plot, but our time is greater than the horizontal range
          // (likely after dragging the cursor) - the plot should start at min recorded value
          // we have filled up the range of the plot and so we translate our entire plot
          // as time moves forward
          modelViewTransformProperty.set( ModelViewTransform2.createRectangleInvertedYMapping(
            new Bounds2( minRecordedX, newMinY, minRecordedX + horizontalXRange, newMaxY ),
            new Bounds2( 0, 0, graphWidth, graphHeight )
          ) );
        }
      }
      else {

        // just plot from 0 to the horizontal range
        modelViewTransformProperty.set( ModelViewTransform2.createRectangleInvertedYMapping(
          new Bounds2( 0, newMinY, horizontalXRange, newMaxY ),
          new Bounds2( 0, 0, graphWidth, graphHeight )
        ) );
      }
    };

    // update model view transform as time moves forward, so that we scroll forward in time
    model.sampleTimeProperty.link( time => {
      updateModelViewTransformProperty();
      this.setCursorValue( time );
    } );

    // calculate new range of plot when zooming in or out
    model.energyPlotScaleIndexProperty.link( scaleIndex => {
      const newRange = GraphsConstants.PLOT_RANGES[ scaleIndex ];
      const newMaxY = newRange.max;
      const newMinY = newRange.min;
      const horizontalLineSpacing = ( newMaxY - newMinY ) / 4;

      const verticalLineSpacing = model.independentVariableProperty.get() === GraphsModel.IndependentVariable.POSITION ?
                                  POSITION_STEP_X : TIME_STEP_X;


      updateModelViewTransformProperty();
      this.setLineSpacings( {
        majorVerticalLineSpacing: verticalLineSpacing,
        majorHorizontalLineSpacing: horizontalLineSpacing
      } );
    } );

    // update range, domain, and plot style of plot when the independent variable changes - cursor is invisible for
    // plots against position
    model.independentVariableProperty.link( independentVariable => {
      const newRange = GraphsConstants.PLOT_RANGES[ model.energyPlotScaleIndexProperty.get() ];
      const newMaxY = newRange.max;
      const newMinY = newRange.min;
      const horizontalLineSpacing = ( newMaxY - newMinY ) / 4;

      let verticalLineSpacing;
      if ( independentVariable === GraphsModel.IndependentVariable.POSITION ) {
        this.setCursorVisibleOverride( false );
        this.setPlotStyle( DynamicSeriesNode.PlotStyle.SCATTER );
        verticalLineSpacing = POSITION_STEP_X;
      }
      else {
        this.setCursorVisibleOverride( null );
        this.setPlotStyle( DynamicSeriesNode.PlotStyle.LINE );
        verticalLineSpacing = TIME_STEP_X;
      }

      updateModelViewTransformProperty();
      this.setLineSpacings( {
        majorVerticalLineSpacing: verticalLineSpacing,
        majorHorizontalLineSpacing: horizontalLineSpacing
      } );
    } );


    // add data points when a EnergySkateParkDataSample is added to the model
    model.dataSamples.addItemAddedListener( addedSample => {
      const plotTime = model.independentVariableProperty.get() === GraphsModel.IndependentVariable.TIME;
      const independentVariable = plotTime ? addedSample.time : addedSample.position.x + POSITION_PLOT_OFFSET;

      // keep a reference to the pointStyle so that it can be modified later
      const pointStyle = new PointStyle();

      // add a listener that updates opacity with the EnergySkateParkDataSample Property, dispose it on removal
      const opacityListener = opacity => {
        pointStyle.opacity = opacity;
      };
      addedSample.opacityProperty.link( opacityListener );

      this.kineticEnergyDataSeries.addDataPoint( new PointStyledVector2( independentVariable, addedSample.kineticEnergy, pointStyle ) );
      this.potentialEnergyDataSeries.addDataPoint( new PointStyledVector2( independentVariable, addedSample.potentialEnergy, pointStyle ) );
      this.thermalEnergyDataSeries.addDataPoint( new PointStyledVector2( independentVariable, addedSample.thermalEnergy, pointStyle ) );
      this.totalEnergyDataSeries.addDataPoint( new PointStyledVector2( independentVariable, addedSample.totalEnergy, pointStyle ) );

      const removalListener = removedSample => {
        if ( removedSample === addedSample ) {
          removedSample.opacityProperty.unlink( opacityListener );
          model.dataSamples.removeItemRemovedListener( removalListener );
        }
      };
      model.dataSamples.addItemRemovedListener( removalListener );

      //this.setCursorValue( independentVariable );
    } );

    // remove a batch of of EnergySkateParkDataSamples
    model.batchRemoveSamplesEmitter.addListener( samplesToRemove => {
      const plotTime = model.independentVariableProperty.get() === GraphsModel.IndependentVariable.TIME;

      const xValuesToRemove = samplesToRemove.map( sampleToRemove => {
        return plotTime ? sampleToRemove.time : ( sampleToRemove.position.x + POSITION_PLOT_OFFSET );
      } );

      this.dynamicSeriesArray.forEach( dynamicSeries => {
        dynamicSeries.removeDataPointsAtX( xValuesToRemove );
      } );
    } );

    // reset the ChartCursor, making the drag cue visible again upon "Reset All"
    model.resetEmitter.addListener( this.resetCursor.bind( this ) );
  }

  /**
   * Clear all energy data for the data series associated with this plot.
   * @public
   */
  clearEnergyDataSeries() {
    this.kineticEnergyDataSeries.clear();
    this.potentialEnergyDataSeries.clear();
    this.thermalEnergyDataSeries.clear();
    this.totalEnergyDataSeries.clear();

    this.setCursorValue( 0 );
  }
}

//--------------------------------------------------------------------------
// helper functions
//-------------------------------------------------------------------------
/**
 * Calculates the domain of the plot as a function of the independent variable.
 * @param {GraphsModel.IndependentVariable} independentVariable
 * @returns {Range}
 */
const calculateDomain = independentVariable => {
  const maxX = independentVariable === GraphsModel.IndependentVariable.POSITION ? POSITION_MAX_X : TIME_MAX_X;
  return new Range( 0, maxX );
};

energySkatePark.register( 'EnergyChart', EnergyChart );
export default EnergyChart;