// Copyright 2019-2022, University of Colorado Boulder

/**
 * A chart that visualizes vibration. Either "on" or "off", it produces a square wave to display vibration
 * over time.
 *
 * @author Jesse Greenberg
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import DynamicSeries from '../../../griddle/js/DynamicSeries.js';
import SeismographNode from '../../../griddle/js/SeismographNode.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import tappi from '../tappi.js';

// constants
const MAX_TIME = 10; // seconds of plotted data

class VibrationChart extends Node {

  /**
   * @param {BooleanProperty} vibratingProperty
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   */
  constructor( vibratingProperty, width, height, options ) {

    // beware this also gets passed to mutate for the supertype later
    options = merge( {

      // font for the vibration/time labels
      labelFont: new PhetFont( 24 )
    }, options );

    super();

    // @private
    this.vibratingProperty = vibratingProperty;

    // @private {NumberProperty} - amount of time that has elapsed in order to plot vibration against time
    this.timeProperty = new NumberProperty( 0 );

    // create the plot
    this.vibrationSeries = new DynamicSeries( { color: 'orange' } );

    const verticalAxisTitleNode = new Text( 'Vibration', {
      rotation: -Math.PI / 2,
      font: options.labelFont
    } );
    const horizontalAxisTitleNode = new Text( 'Time (s)', {
      font: options.labelFont
    } );
    const seismographNode = new SeismographNode( this.timeProperty, [ this.vibrationSeries ], new Text( '' ), {
      width: width,
      height: height,
      verticalAxisLabelNode: verticalAxisTitleNode,
      horizontalAxisLabelNode: horizontalAxisTitleNode,
      numberVerticalLines: MAX_TIME,
      numberHorizontalLines: 3,
      verticalRanges: [ new Range( -1.5, 1.5 ) ]
    } );

    // layout
    const labeledChartNode = new Node();
    labeledChartNode.addChild( seismographNode );

    // contain in a panel
    const panel = new Panel( labeledChartNode, {
      fill: 'lightgrey'
    } );
    this.addChild( panel );

    // mutate with options after bounds are defined
    this.mutate( options );
  }

  /**
   * Add data to the scrolling chart.
   * @public
   *
   * @param {number} dt - in ms
   */
  step( dt ) {
    this.timeProperty.set( this.timeProperty.get() + dt );

    const vibrationDataPoint = this.vibratingProperty.get() ? 1 : -1;
    this.vibrationSeries.addXYDataPoint( this.timeProperty.get(), vibrationDataPoint );

    while ( this.vibrationSeries.getDataPoint( 0 ).x < this.timeProperty.value - MAX_TIME ) {
      this.vibrationSeries.shiftData();
    }
  }
}

tappi.register( 'VibrationChart', VibrationChart );
export default VibrationChart;