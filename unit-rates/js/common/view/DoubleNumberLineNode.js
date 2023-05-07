// Copyright 2016-2023, University of Colorado Boulder

/**
 * Displays a double number line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HStrut, Line, Node, Text } from '../../../../scenery/js/imports.js';
import unitRates from '../../unitRates.js';
import URConstants from '../URConstants.js';
import MarkerNode from './MarkerNode.js';

export default class DoubleNumberLineNode extends Node {

  /**
   * @param {DoubleNumberLine} doubleNumberLine
   * @param {Object} [options]
   */
  constructor( doubleNumberLine, options ) {

    options = merge( {

      // common to all axes (horizontal and vertical)
      axisColor: 'black',
      axisLineWidth: 1.5,

      // horizontal axes
      axisViewLength: 1000, // {number} view length of doubleNumberLine's range
      arrowSize: new Dimension2( 8, 8 ), // size of arrows on axes
      axisYSpacing: 20, // {number} vertical spacing between top and bottom axes
      labelFont: new PhetFont( 14 ), // {Font} for axis labels
      labelColor: 'black', // {Color|string} color of axis labels
      labelMaxWidth: 70, // i18n, determined empirically
      labelXSpacing: 12, // horizontal spacing between axis and its label

      // markers
      majorMarkerLength: URConstants.MAJOR_MARKER_LENGTH,
      minorMarkerLength: URConstants.MINOR_MARKER_LENGTH,

      // Optional position indicator (vertical line).
      // Used in the Racing Lab screen to indicate the current position of the race car.
      indicatorXProperty: null, // {Property.<number>|null} position of vertical indicator line, in model coordinates
      indicatorColor: 'green'

    }, options );

    super();

    // @public (read-only)
    this.axisViewLength = options.axisViewLength;

    // All other nodes are positioned relative to this one
    const verticalAxis = new Line( 0, -options.minorMarkerLength / 2, 0, options.minorMarkerLength / 2, {
      stroke: options.axisColor,
      lineWidth: options.axisLineWidth
    } );
    this.addChild( verticalAxis );

    // Double number line's maximum should be just to the left of the axis' arrow head
    const horizontalAxisLength = this.axisViewLength + options.arrowSize.height + 10;

    // numerator axis
    const numeratorAxisNode = new ArrowNode( 0, 0, horizontalAxisLength, 0, {
      fill: options.axisColor,
      stroke: null,
      headWidth: options.arrowSize.width,
      headHeight: options.arrowSize.height,
      tailWidth: options.axisLineWidth,
      x: verticalAxis.x,
      y: verticalAxis.centerY - ( options.axisYSpacing / 2 )
    } );
    this.addChild( numeratorAxisNode );

    // numerator axis label
    this.addChild( new Text( doubleNumberLine.numeratorOptions.axisLabel, {
      font: options.labelFont,
      fill: options.labelColor,
      maxWidth: options.labelMaxWidth,
      left: numeratorAxisNode.right + options.labelXSpacing,
      centerY: numeratorAxisNode.centerY,
      children: [ new HStrut( options.labelMaxWidth ) ] // makes labels for all items the same width
    } ) );

    // denominator axis
    const denominatorAxisNode = new ArrowNode( 0, 0, horizontalAxisLength, 0, {
      fill: options.axisColor,
      stroke: null,
      headWidth: options.arrowSize.width,
      headHeight: options.arrowSize.height,
      tailWidth: options.axisLineWidth,
      y: verticalAxis.centerY + ( options.axisYSpacing / 2 )
    } );
    this.addChild( denominatorAxisNode );

    // denominator axis label
    this.addChild( new Text( doubleNumberLine.denominatorOptions.axisLabel, {
      font: options.labelFont,
      fill: options.labelColor,
      maxWidth: options.labelMaxWidth,
      left: denominatorAxisNode.right + options.labelXSpacing,
      centerY: denominatorAxisNode.centerY,
      children: [ new HStrut( options.labelMaxWidth ) ] // makes labels for all items the same width
    } ) );

    // position indicator (vertical line)
    let indicatorXObserver = null;
    if ( options.indicatorXProperty ) {
      const indicatorNode = new Line( 0, 0, 0, options.axisYSpacing, {
        stroke: options.indicatorColor,
        lineWidth: 4,
        // horizontal position set by indicatorXObserver
        centerY: verticalAxis.centerY
      } );
      this.addChild( indicatorNode );

      indicatorXObserver = x => {
        indicatorNode.centerX = doubleNumberLine.modelToViewNumerator( x, this.axisViewLength );
      };
      options.indicatorXProperty.link( indicatorXObserver ); // unlink in dispose
    }

    // @private parent for markers, to maintain rendering order
    this.markersParent = new Node();
    this.addChild( this.markersParent );

    this.mutate( options );

    // @public (read-only) position for things that are "out of range", halfway between arrows and labels
    this.outOfRangeXOffset = horizontalAxisLength + ( options.labelXSpacing / 2 );

    // when a Marker is added, add a MarkerNode
    const markerAddedListener = marker => {

      // The model may contain markers that don't fit on the view scale
      if ( doubleNumberLine.markerIsInRange( marker ) ) {
        this.addMarkerNode( marker, {
          lineLength: marker.isMajor ? options.majorMarkerLength : options.minorMarkerLength,
          numeratorOptions: doubleNumberLine.numeratorOptions,
          denominatorOptions: doubleNumberLine.denominatorOptions,
          centerX: doubleNumberLine.modelToViewDenominator( marker.denominatorProperty.value, this.axisViewLength ),
          centerY: verticalAxis.centerY
        } );
      }
    };
    doubleNumberLine.markers.addItemAddedListener( markerAddedListener );

    // when a Marker is removed, remove the corresponding MarkerNode
    const markerRemovedListener = marker => {
      this.removeMarkerNode( marker );
    };
    doubleNumberLine.markers.addItemRemovedListener( markerRemovedListener );

    // Add a MarkNode for each initial Marker
    doubleNumberLine.markers.forEach( markerAddedListener.bind( this ) );

    // @private
    this.disposeDoubleNumberLineNode = () => {
      doubleNumberLine.markers.removeItemAddedListener( markerAddedListener );
      doubleNumberLine.markers.removeItemRemovedListener( markerRemovedListener );
      options.indicatorXProperty && options.indicatorXProperty.unlink( indicatorXObserver );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeDoubleNumberLineNode();
    super.dispose();
  }

  /**
   * Adds a MarkerNode to the double number line.
   * @param {Marker} marker
   * @param {Object} [options] - MarkerNode constructor options
   * @private
   */
  addMarkerNode( marker, options ) {
    unitRates.log && unitRates.log( `addMarker ${marker}` );
    assert && assert( !this.getMarkerNode( marker ), `already have a MarkerNode for ${marker}` );
    const markerNode = new MarkerNode( marker, options );
    this.markersParent.addChild( markerNode );
  }

  /**
   * Removes a MarkerNode from the double number line.
   * @param {Marker} marker
   * @private
   */
  removeMarkerNode( marker ) {
    unitRates.log && unitRates.log( `removeMarker ${marker}` );

    // find the node that is associated with the marker
    const markerNode = this.getMarkerNode( marker );

    // the model may contain markers that aren't displayed, because they are outside the range of the view axes
    if ( markerNode ) {
      this.markersParent.removeChild( markerNode );
      markerNode.dispose();
    }
  }

  /**
   * Gets the MarkerNode that is associated with marker.
   * @param {Marker} marker
   * @returns {MarkerNode|null} - null if there is no MarkerNode associated with marker
   * @private
   */
  getMarkerNode( marker ) {
    let markerNode = null;
    const markerNodes = this.markersParent.getChildren();
    for ( let i = 0; i < markerNodes.length && !markerNode; i++ ) {
      if ( markerNodes[ i ].marker === marker ) {
        markerNode = markerNodes[ i ];
      }
    }
    return markerNode;
  }
}

unitRates.register( 'DoubleNumberLineNode', DoubleNumberLineNode );