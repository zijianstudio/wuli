// Copyright 2018-2020, University of Colorado Boulder

/**
 * Collection of constants and functions that determine the visual shape of the Wire.
 *
 * @author Jesse Greenberg
 */

import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Range from '../../../../dot/js/Range.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';

// constants
const WIRE_VIEW_WIDTH_RANGE = new Range( 15, 500 ); // in screen coordinates
const WIRE_VIEW_HEIGHT_RANGE = new Range( 3, 180 ); // in screen coordinates
const WIRE_DIAMETER_MAX = Math.sqrt( ResistanceInAWireConstants.AREA_RANGE.max / Math.PI ) * 2;

const WireShapeConstants = {

  // Multiplier that controls the width of the ellipses on the ends of the wire.
  PERSPECTIVE_FACTOR: 0.4,

  // Used to calculate the size of the wire in screen coordinates from the model values
  WIRE_DIAMETER_MAX: WIRE_DIAMETER_MAX,
  WIRE_VIEW_WIDTH_RANGE: WIRE_VIEW_WIDTH_RANGE,
  WIRE_VIEW_HEIGHT_RANGE: WIRE_VIEW_HEIGHT_RANGE,

  // used when drawing dots in the wire
  DOT_RADIUS: 2,

  // Linear mapping transform
  lengthToWidth: new LinearFunction(
    ResistanceInAWireConstants.LENGTH_RANGE.min,
    ResistanceInAWireConstants.LENGTH_RANGE.max,
    WIRE_VIEW_WIDTH_RANGE.min,
    WIRE_VIEW_WIDTH_RANGE.max,
    true
  ),

  /**
   * Transform to map the area to the height of the wire.
   * @param {number} area
   * @returns {number} - the height in screen coordinates
   * @public
   */
  areaToHeight( area ) {
    const radius_squared = area / Math.PI;
    const diameter = Math.sqrt( radius_squared ) * 2; // radius to diameter
    return WIRE_VIEW_HEIGHT_RANGE.max / WIRE_DIAMETER_MAX * diameter;
  }
};

resistanceInAWire.register( 'WireShapeConstants', WireShapeConstants );

export default WireShapeConstants;