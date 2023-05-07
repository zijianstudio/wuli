// Copyright 2016-2023, University of Colorado Boulder

/**
 * Marker on the double number line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Text } from '../../../../scenery/js/imports.js';
import unitRates from '../../unitRates.js';
import URConstants from '../URConstants.js';
import URUtils from '../URUtils.js';

// constants
const SHARED_OPTIONS = {
  maxDecimals: 2, // {number} maximum number of decimal places
  trimZeros: false // {boolean} whether to trim trailing zeros in the decimal places
};

export default class MarkerNode extends Node {
  /**
   * @param {Marker} marker
   * @param {Object} [options]
   */
  constructor( marker, options ) {

    options = merge( {
      ySpacing: 1,
      font: new PhetFont( 12 ),
      lineLength: URConstants.MAJOR_MARKER_LENGTH,
      lineWidth: 1,
      numeratorOptions: null, // {*} options specific to the rate's numerator, see below
      denominatorOptions: null // {*} options specific to the rate's denominator, see below
    }, options );

    const numeratorOptions = merge( {}, SHARED_OPTIONS, options.numeratorOptions );

    const denominatorOptions = merge( {}, SHARED_OPTIONS, options.denominatorOptions );

    // vertical line
    const lineNode = new Line( 0, 0, 0, options.lineLength, {
      lineWidth: options.lineWidth
    } );

    // numerator
    const numeratorNode = new Text( '', { font: options.font } );
    const numeratorObserver = numerator => {
      assert && assert( ( typeof numerator === 'number' ) && !isNaN( numerator ), `invalid numerator: ${numerator}` );
      numeratorNode.string = URUtils.numberToString( marker.numeratorProperty.value, numeratorOptions.maxDecimals, numeratorOptions.trimZeros );
      numeratorNode.centerX = lineNode.centerX;
      numeratorNode.bottom = lineNode.top - options.ySpacing;
    };
    marker.numeratorProperty.link( numeratorObserver ); // unlink in dispose

    // denominator
    const denominatorNode = new Text( '', { font: options.font } );
    const denominatorObserver = denominator => {
      assert && assert( ( typeof denominator === 'number' ) && !isNaN( denominator ), `invalid denominator: ${denominator}` );
      denominatorNode.string = URUtils.numberToString( marker.denominatorProperty.value, denominatorOptions.maxDecimals, denominatorOptions.trimZeros );
      denominatorNode.centerX = lineNode.centerX;
      denominatorNode.top = lineNode.bottom + options.ySpacing;
    };
    marker.denominatorProperty.link( denominatorObserver ); // unlink in dispose

    assert && assert( !options.children, 'decoration not supported' );
    options.children = [ numeratorNode, lineNode, denominatorNode ];

    super( options );

    // @public (read-only)
    this.marker = marker;

    // update the marker's color
    const colorObserver = color => {
      lineNode.stroke = color;
      numeratorNode.fill = color;
      denominatorNode.fill = color;
    };
    marker.colorProperty.link( colorObserver ); // unlink in dispose

    // @private
    this.disposeMarkerNode = () => {
      marker.numeratorProperty.unlink( numeratorObserver );
      marker.denominatorProperty.unlink( denominatorObserver );
      marker.colorProperty.unlink( colorObserver );
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeMarkerNode();
    Node.prototype.dispose.call( this );
  }
}

unitRates.register( 'MarkerNode', MarkerNode );