// Copyright 2015-2023, University of Colorado Boulder

/**
 * The LightBulb is a CircuitElement that shines when current flows through it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from './CircuitElementViewType.js';
import FixedCircuitElement from './FixedCircuitElement.js';
import Vertex from './Vertex.js';
import PowerDissipatedProperty from './PowerDissipatedProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
// constants
// The distance (as the crow flies) between start and end vertex
const DISTANCE_BETWEEN_VERTICES = 36;

// Tinker with coordinates to get thing to match up
const LEFT_CURVE_X_SCALE = 1.5;
const TOP_Y_SCALE = 0.6;
const RIGHT_CURVE_X_SCALE = 0.87;

// The sampled points for the wire/filament curves
const LIFELIKE_SAMPLE_POINTS = [new Vector2(0.623, 2.063),
// bottom center
new Vector2(0.623, 1.014 * 0.75),
// first curve
new Vector2(0.314 * LEFT_CURVE_X_SCALE, 0.704 * TOP_Y_SCALE * 1.1),
// left curve 1
new Vector2(0.314 * LEFT_CURVE_X_SCALE, 0.639 * TOP_Y_SCALE),
// left curve 2
new Vector2(0.394 * LEFT_CURVE_X_SCALE, 0.560 * TOP_Y_SCALE),
// left curve 3
new Vector2(0.823 * RIGHT_CURVE_X_SCALE, 0.565 * TOP_Y_SCALE),
// top right 1
new Vector2(0.888 * RIGHT_CURVE_X_SCALE, 0.600 * TOP_Y_SCALE),
// top right 2
new Vector2(0.922 * RIGHT_CURVE_X_SCALE, 0.699 * TOP_Y_SCALE),
// top right 3
new Vector2(0.927 * RIGHT_CURVE_X_SCALE, 1.474),
// exit notch
new Vector2(0.927 * 0.8 * 1.2, 1.474) // exit
];

const SCHEMATIC_SAMPLE_POINTS = [new Vector2(0.50, 2.06),
// bottom left
new Vector2(0.50, 0.34),
// top left
new Vector2(0.89, 0.34),
// top right
new Vector2(0.89, 1.474) // bottom right
];

export default class LightBulb extends FixedCircuitElement {
  // true if R is a function of current. Not an enum because in the future we may have a isReal high resistance bulb.

  // true if the light bulb is a high resistance light bulb

  // the resistance of the light bulb which can be edited with the UI

  static createAtPosition(startVertex, endVertex, circuit, resistance, viewTypeProperty, tandem, providedOptions) {
    return new LightBulb(startVertex, endVertex, resistance, viewTypeProperty, tandem, providedOptions);
  }
  static createVertexPair(position, circuit, icon = false) {
    const points = LightBulb.createSamplePoints(position);

    // start vertex is at the bottom
    const startVertex = icon ? new Vertex(points[0], circuit.selectionProperty) : circuit.vertexGroup.createNextElement(points[0]);
    const endVertex = icon ? new Vertex(points[1], circuit.selectionProperty) : circuit.vertexGroup.createNextElement(points[1]);
    return {
      startVertex: startVertex,
      endVertex: endVertex
    };
  }
  static createSamplePoints(position) {
    const translation = new Vector2(19, 10);

    // Connect at the side and bottom
    const startPoint = new Vector2(position.x - DISTANCE_BETWEEN_VERTICES / 2, position.y).plus(translation);

    // Position the vertices so the light bulb is upright
    const endPoint = startPoint.plus(Vector2.createPolar(DISTANCE_BETWEEN_VERTICES, -Math.PI / 4));
    return [startPoint, endPoint];
  }
  constructor(startVertex,
  // side
  endVertex,
  // bottom
  resistance, viewTypeProperty, tandem, providedOptions) {
    const options = optionize()({
      isExtreme: false,
      isReal: false
    }, providedOptions);
    assert && assert(!options.hasOwnProperty('numberOfDecimalPlaces'), 'supplied by LightBulb');
    options.numberOfDecimalPlaces = options.isExtreme ? 0 : 1;

    // getPathLength not available yet, so use a nonzero charge path length then override.
    super(startVertex, endVertex, 1, tandem, options);
    this.isReal = options.isReal;
    this.isExtreme = options.isExtreme;
    this.resistanceProperty = new NumberProperty(resistance, {
      tandem: tandem.createTandem('resistanceProperty'),
      phetioFeatured: true,
      range: options.isExtreme ? new Range(100, 10000) : options.isReal ? new Range(0, Number.MAX_VALUE) :
      // The non-ohmic bulb has its resistance computed in LinearTransientAnalysis.js
      new Range(0, 120)
    });
    this.powerDissipatedProperty = new PowerDissipatedProperty(this.currentProperty, this.resistanceProperty, tandem.createTandem('powerDissipatedProperty'));
    this.viewTypeProperty = viewTypeProperty;

    // Fill in the chargePathLength
    this.chargePathLength = this.getPathLength();
  }

  // Updates the charge path length when the view changes between lifelike/schematic
  updatePathLength() {
    this.chargePathLength = this.getPathLength();
  }

  // Determine the path length by measuring the segments.
  getPathLength() {
    let pathLength = 0;
    const samplePoints = this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? LIFELIKE_SAMPLE_POINTS : SCHEMATIC_SAMPLE_POINTS;
    let currentPoint = LightBulb.getFilamentPathPoint(0, Vector2.ZERO, samplePoints);
    for (let i = 1; i < samplePoints.length; i++) {
      const nextPoint = LightBulb.getFilamentPathPoint(i, Vector2.ZERO, samplePoints);
      pathLength += nextPoint.distance(currentPoint);
      currentPoint = nextPoint;
    }
    return pathLength;
  }

  /**
   * Returns true because all light bulbs can have their resistance changed.
   */
  isResistanceEditable() {
    return true;
  }

  // Dispose of this and PhET-iO instrumented children, so they will be unregistered.
  dispose() {
    this.resistanceProperty.dispose();
    this.powerDissipatedProperty.dispose();
    super.dispose();
  }

  /**
   * Maps from the "as the crow flies" path to the circuitous path. It maps points with a transformation such that:
   * startPoint => origin, endPoint => endVertex position
   *
   * @param index
   * @param origin
   * @param samplePoints - the array of points to use for sampling
   */
  static getFilamentPathPoint(index, origin, samplePoints) {
    const point = samplePoints[index];
    const startPoint = samplePoints[0];
    const endPoint = samplePoints[samplePoints.length - 1];
    const x = Utils.linear(startPoint.x, endPoint.x, origin.x, origin.x + LightBulb.vertexDelta.x, point.x);
    const y = Utils.linear(startPoint.y, endPoint.y, origin.y, origin.y + LightBulb.vertexDelta.y, point.y);
    return new Vector2(x, y);
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  getCircuitProperties() {
    return [this.resistanceProperty];
  }

  /**
   * Overrides CircuitElement.getPosition to describe the path the charge takes through the light bulb.
   *
   * @param distanceAlongWire - how far along the bulb's length the charge has traveled
   * @param matrix to be updated with the position and angle, so that garbage isn't created each time
   */
  updateMatrixForPoint(distanceAlongWire, matrix) {
    super.updateMatrixForPoint(distanceAlongWire, matrix);
    let previousAccumulatedDistance = 0;
    let accumulatedDistance = 0;
    const samplePoints = this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? LIFELIKE_SAMPLE_POINTS : SCHEMATIC_SAMPLE_POINTS;
    let currentPoint = LightBulb.getFilamentPathPoint(0, this.startVertexProperty.get().positionProperty.get(), samplePoints);
    for (let i = 1; i < samplePoints.length; i++) {
      const nextPoint = LightBulb.getFilamentPathPoint(i, this.startVertexProperty.get().positionProperty.get(), samplePoints);
      accumulatedDistance += nextPoint.distance(currentPoint);

      // Find what segment the charge is in
      if (distanceAlongWire <= accumulatedDistance) {
        // Choose the right point along the segment
        const fractionAlongSegment = Utils.linear(previousAccumulatedDistance, accumulatedDistance, 0, 1, distanceAlongWire);
        const positionAlongSegment = currentPoint.blend(nextPoint, fractionAlongSegment);

        // rotate the point about the start vertex
        const startPoint = this.startPositionProperty.get();
        const vertexDelta = this.endPositionProperty.get().minus(startPoint);
        const relativeAngle = vertexDelta.angle - LightBulb.vertexDelta.angle;
        const position = positionAlongSegment.rotatedAboutPoint(startPoint, relativeAngle);
        const angle = nextPoint.minus(currentPoint).angle;

        // sampled from createAtPosition
        matrix.setToTranslationRotationPoint(position, angle + matrix.getRotation() + 0.7851354708011367);
        return;
      }
      previousAccumulatedDistance = accumulatedDistance;
      currentPoint = nextPoint;
    }
    throw new Error('exceeded charge path bounds');
  }
  static REAL_BULB_COLD_RESISTANCE = 10;
}
const samplePoints = LightBulb.createSamplePoints(Vector2.ZERO);
LightBulb.vertexDelta = samplePoints[1].minus(samplePoints[0]);
circuitConstructionKitCommon.register('LightBulb', LightBulb);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkNpcmN1aXRFbGVtZW50Vmlld1R5cGUiLCJGaXhlZENpcmN1aXRFbGVtZW50IiwiVmVydGV4IiwiUG93ZXJEaXNzaXBhdGVkUHJvcGVydHkiLCJvcHRpb25pemUiLCJESVNUQU5DRV9CRVRXRUVOX1ZFUlRJQ0VTIiwiTEVGVF9DVVJWRV9YX1NDQUxFIiwiVE9QX1lfU0NBTEUiLCJSSUdIVF9DVVJWRV9YX1NDQUxFIiwiTElGRUxJS0VfU0FNUExFX1BPSU5UUyIsIlNDSEVNQVRJQ19TQU1QTEVfUE9JTlRTIiwiTGlnaHRCdWxiIiwiY3JlYXRlQXRQb3NpdGlvbiIsInN0YXJ0VmVydGV4IiwiZW5kVmVydGV4IiwiY2lyY3VpdCIsInJlc2lzdGFuY2UiLCJ2aWV3VHlwZVByb3BlcnR5IiwidGFuZGVtIiwicHJvdmlkZWRPcHRpb25zIiwiY3JlYXRlVmVydGV4UGFpciIsInBvc2l0aW9uIiwiaWNvbiIsInBvaW50cyIsImNyZWF0ZVNhbXBsZVBvaW50cyIsInNlbGVjdGlvblByb3BlcnR5IiwidmVydGV4R3JvdXAiLCJjcmVhdGVOZXh0RWxlbWVudCIsInRyYW5zbGF0aW9uIiwic3RhcnRQb2ludCIsIngiLCJ5IiwicGx1cyIsImVuZFBvaW50IiwiY3JlYXRlUG9sYXIiLCJNYXRoIiwiUEkiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpc0V4dHJlbWUiLCJpc1JlYWwiLCJhc3NlcnQiLCJoYXNPd25Qcm9wZXJ0eSIsIm51bWJlck9mRGVjaW1hbFBsYWNlcyIsInJlc2lzdGFuY2VQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0ZlYXR1cmVkIiwicmFuZ2UiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJwb3dlckRpc3NpcGF0ZWRQcm9wZXJ0eSIsImN1cnJlbnRQcm9wZXJ0eSIsImNoYXJnZVBhdGhMZW5ndGgiLCJnZXRQYXRoTGVuZ3RoIiwidXBkYXRlUGF0aExlbmd0aCIsInBhdGhMZW5ndGgiLCJzYW1wbGVQb2ludHMiLCJ2YWx1ZSIsIkxJRkVMSUtFIiwiY3VycmVudFBvaW50IiwiZ2V0RmlsYW1lbnRQYXRoUG9pbnQiLCJaRVJPIiwiaSIsImxlbmd0aCIsIm5leHRQb2ludCIsImRpc3RhbmNlIiwiaXNSZXNpc3RhbmNlRWRpdGFibGUiLCJkaXNwb3NlIiwiaW5kZXgiLCJvcmlnaW4iLCJwb2ludCIsImxpbmVhciIsInZlcnRleERlbHRhIiwiZ2V0Q2lyY3VpdFByb3BlcnRpZXMiLCJ1cGRhdGVNYXRyaXhGb3JQb2ludCIsImRpc3RhbmNlQWxvbmdXaXJlIiwibWF0cml4IiwicHJldmlvdXNBY2N1bXVsYXRlZERpc3RhbmNlIiwiYWNjdW11bGF0ZWREaXN0YW5jZSIsInN0YXJ0VmVydGV4UHJvcGVydHkiLCJnZXQiLCJwb3NpdGlvblByb3BlcnR5IiwiZnJhY3Rpb25BbG9uZ1NlZ21lbnQiLCJwb3NpdGlvbkFsb25nU2VnbWVudCIsImJsZW5kIiwic3RhcnRQb3NpdGlvblByb3BlcnR5IiwiZW5kUG9zaXRpb25Qcm9wZXJ0eSIsIm1pbnVzIiwicmVsYXRpdmVBbmdsZSIsImFuZ2xlIiwicm90YXRlZEFib3V0UG9pbnQiLCJzZXRUb1RyYW5zbGF0aW9uUm90YXRpb25Qb2ludCIsImdldFJvdGF0aW9uIiwiRXJyb3IiLCJSRUFMX0JVTEJfQ09MRF9SRVNJU1RBTkNFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMaWdodEJ1bGIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIExpZ2h0QnVsYiBpcyBhIENpcmN1aXRFbGVtZW50IHRoYXQgc2hpbmVzIHdoZW4gY3VycmVudCBmbG93cyB0aHJvdWdoIGl0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IENpcmN1aXQgZnJvbSAnLi9DaXJjdWl0LmpzJztcclxuaW1wb3J0IENpcmN1aXRFbGVtZW50Vmlld1R5cGUgZnJvbSAnLi9DaXJjdWl0RWxlbWVudFZpZXdUeXBlLmpzJztcclxuaW1wb3J0IEZpeGVkQ2lyY3VpdEVsZW1lbnQsIHsgRml4ZWRDaXJjdWl0RWxlbWVudE9wdGlvbnMgfSBmcm9tICcuL0ZpeGVkQ2lyY3VpdEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgVmVydGV4IGZyb20gJy4vVmVydGV4LmpzJztcclxuaW1wb3J0IFBvd2VyRGlzc2lwYXRlZFByb3BlcnR5IGZyb20gJy4vUG93ZXJEaXNzaXBhdGVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8gVGhlIGRpc3RhbmNlIChhcyB0aGUgY3JvdyBmbGllcykgYmV0d2VlbiBzdGFydCBhbmQgZW5kIHZlcnRleFxyXG5jb25zdCBESVNUQU5DRV9CRVRXRUVOX1ZFUlRJQ0VTID0gMzY7XHJcblxyXG4vLyBUaW5rZXIgd2l0aCBjb29yZGluYXRlcyB0byBnZXQgdGhpbmcgdG8gbWF0Y2ggdXBcclxuY29uc3QgTEVGVF9DVVJWRV9YX1NDQUxFID0gMS41O1xyXG5jb25zdCBUT1BfWV9TQ0FMRSA9IDAuNjtcclxuY29uc3QgUklHSFRfQ1VSVkVfWF9TQ0FMRSA9IDAuODc7XHJcblxyXG4vLyBUaGUgc2FtcGxlZCBwb2ludHMgZm9yIHRoZSB3aXJlL2ZpbGFtZW50IGN1cnZlc1xyXG5jb25zdCBMSUZFTElLRV9TQU1QTEVfUE9JTlRTID0gW1xyXG4gIG5ldyBWZWN0b3IyKCAwLjYyMywgMi4wNjMgKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3R0b20gY2VudGVyXHJcbiAgbmV3IFZlY3RvcjIoIDAuNjIzLCAxLjAxNCAqIDAuNzUgKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IGN1cnZlXHJcbiAgbmV3IFZlY3RvcjIoIDAuMzE0ICogTEVGVF9DVVJWRV9YX1NDQUxFLCAwLjcwNCAqIFRPUF9ZX1NDQUxFICogMS4xICksIC8vIGxlZnQgY3VydmUgMVxyXG4gIG5ldyBWZWN0b3IyKCAwLjMxNCAqIExFRlRfQ1VSVkVfWF9TQ0FMRSwgMC42MzkgKiBUT1BfWV9TQ0FMRSApLCAgICAgICAvLyBsZWZ0IGN1cnZlIDJcclxuICBuZXcgVmVjdG9yMiggMC4zOTQgKiBMRUZUX0NVUlZFX1hfU0NBTEUsIDAuNTYwICogVE9QX1lfU0NBTEUgKSwgICAgICAgLy8gbGVmdCBjdXJ2ZSAzXHJcbiAgbmV3IFZlY3RvcjIoIDAuODIzICogUklHSFRfQ1VSVkVfWF9TQ0FMRSwgMC41NjUgKiBUT1BfWV9TQ0FMRSApLCAgICAgIC8vIHRvcCByaWdodCAxXHJcbiAgbmV3IFZlY3RvcjIoIDAuODg4ICogUklHSFRfQ1VSVkVfWF9TQ0FMRSwgMC42MDAgKiBUT1BfWV9TQ0FMRSApLCAgICAgIC8vIHRvcCByaWdodCAyXHJcbiAgbmV3IFZlY3RvcjIoIDAuOTIyICogUklHSFRfQ1VSVkVfWF9TQ0FMRSwgMC42OTkgKiBUT1BfWV9TQ0FMRSApLCAgICAgIC8vIHRvcCByaWdodCAzXHJcbiAgbmV3IFZlY3RvcjIoIDAuOTI3ICogUklHSFRfQ1VSVkVfWF9TQ0FMRSwgMS40NzQgKSwgICAgICAgICAgICAgICAgICAgIC8vIGV4aXQgbm90Y2hcclxuICBuZXcgVmVjdG9yMiggMC45MjcgKiAwLjggKiAxLjIsIDEuNDc0ICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhpdFxyXG5dO1xyXG5cclxuY29uc3QgU0NIRU1BVElDX1NBTVBMRV9QT0lOVFMgPSBbXHJcbiAgbmV3IFZlY3RvcjIoIDAuNTAsIDIuMDYgKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJvdHRvbSBsZWZ0XHJcbiAgbmV3IFZlY3RvcjIoIDAuNTAsIDAuMzQgKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvcCBsZWZ0XHJcbiAgbmV3IFZlY3RvcjIoIDAuODksIDAuMzQgKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvcCByaWdodFxyXG4gIG5ldyBWZWN0b3IyKCAwLjg5LCAxLjQ3NCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3R0b20gcmlnaHRcclxuXTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgaXNFeHRyZW1lPzogYm9vbGVhbjtcclxuICBpc1JlYWw/OiBib29sZWFuO1xyXG59O1xyXG5cclxudHlwZSBMaWdodEJ1bGJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBGaXhlZENpcmN1aXRFbGVtZW50T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpZ2h0QnVsYiBleHRlbmRzIEZpeGVkQ2lyY3VpdEVsZW1lbnQge1xyXG5cclxuICAvLyB0cnVlIGlmIFIgaXMgYSBmdW5jdGlvbiBvZiBjdXJyZW50LiBOb3QgYW4gZW51bSBiZWNhdXNlIGluIHRoZSBmdXR1cmUgd2UgbWF5IGhhdmUgYSBpc1JlYWwgaGlnaCByZXNpc3RhbmNlIGJ1bGIuXHJcbiAgcHVibGljIHJlYWRvbmx5IGlzUmVhbDogYm9vbGVhbjtcclxuXHJcbiAgLy8gdHJ1ZSBpZiB0aGUgbGlnaHQgYnVsYiBpcyBhIGhpZ2ggcmVzaXN0YW5jZSBsaWdodCBidWxiXHJcbiAgcHVibGljIHJlYWRvbmx5IGlzRXh0cmVtZTogYm9vbGVhbjtcclxuXHJcbiAgLy8gdGhlIHJlc2lzdGFuY2Ugb2YgdGhlIGxpZ2h0IGJ1bGIgd2hpY2ggY2FuIGJlIGVkaXRlZCB3aXRoIHRoZSBVSVxyXG4gIHB1YmxpYyByZWFkb25seSByZXNpc3RhbmNlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlld1R5cGVQcm9wZXJ0eTogUHJvcGVydHk8Q2lyY3VpdEVsZW1lbnRWaWV3VHlwZT47XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlQXRQb3NpdGlvbiggc3RhcnRWZXJ0ZXg6IFZlcnRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZFZlcnRleDogVmVydGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2lyY3VpdDogQ2lyY3VpdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2lzdGFuY2U6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdUeXBlUHJvcGVydHk6IFByb3BlcnR5PENpcmN1aXRFbGVtZW50Vmlld1R5cGU+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBMaWdodEJ1bGJPcHRpb25zICk6IExpZ2h0QnVsYiB7XHJcbiAgICByZXR1cm4gbmV3IExpZ2h0QnVsYiggc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCwgcmVzaXN0YW5jZSwgdmlld1R5cGVQcm9wZXJ0eSwgdGFuZGVtLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlVmVydGV4UGFpciggcG9zaXRpb246IFZlY3RvcjIsIGNpcmN1aXQ6IENpcmN1aXQsIGljb24gPSBmYWxzZSApOiB7IHN0YXJ0VmVydGV4OiBWZXJ0ZXg7IGVuZFZlcnRleDogVmVydGV4IH0ge1xyXG4gICAgY29uc3QgcG9pbnRzID0gTGlnaHRCdWxiLmNyZWF0ZVNhbXBsZVBvaW50cyggcG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyBzdGFydCB2ZXJ0ZXggaXMgYXQgdGhlIGJvdHRvbVxyXG4gICAgY29uc3Qgc3RhcnRWZXJ0ZXggPSBpY29uID8gbmV3IFZlcnRleCggcG9pbnRzWyAwIF0sIGNpcmN1aXQuc2VsZWN0aW9uUHJvcGVydHkgKSA6IGNpcmN1aXQudmVydGV4R3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIHBvaW50c1sgMCBdICk7XHJcbiAgICBjb25zdCBlbmRWZXJ0ZXggPSBpY29uID8gbmV3IFZlcnRleCggcG9pbnRzWyAxIF0sIGNpcmN1aXQuc2VsZWN0aW9uUHJvcGVydHkgKSA6IGNpcmN1aXQudmVydGV4R3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIHBvaW50c1sgMSBdICk7XHJcbiAgICByZXR1cm4geyBzdGFydFZlcnRleDogc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleDogZW5kVmVydGV4IH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZVNhbXBsZVBvaW50cyggcG9zaXRpb246IFZlY3RvcjIgKTogWyBWZWN0b3IyLCBWZWN0b3IyIF0ge1xyXG4gICAgY29uc3QgdHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMiggMTksIDEwICk7XHJcblxyXG4gICAgLy8gQ29ubmVjdCBhdCB0aGUgc2lkZSBhbmQgYm90dG9tXHJcbiAgICBjb25zdCBzdGFydFBvaW50ID0gbmV3IFZlY3RvcjIoIHBvc2l0aW9uLnggLSBESVNUQU5DRV9CRVRXRUVOX1ZFUlRJQ0VTIC8gMiwgcG9zaXRpb24ueSApLnBsdXMoIHRyYW5zbGF0aW9uICk7XHJcblxyXG4gICAgLy8gUG9zaXRpb24gdGhlIHZlcnRpY2VzIHNvIHRoZSBsaWdodCBidWxiIGlzIHVwcmlnaHRcclxuICAgIGNvbnN0IGVuZFBvaW50ID0gc3RhcnRQb2ludC5wbHVzKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBESVNUQU5DRV9CRVRXRUVOX1ZFUlRJQ0VTLCAtTWF0aC5QSSAvIDQgKSApO1xyXG5cclxuICAgIHJldHVybiBbIHN0YXJ0UG9pbnQsIGVuZFBvaW50IF07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHZlcnRleERlbHRhOiBWZWN0b3IyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG93ZXJEaXNzaXBhdGVkUHJvcGVydHk6IFBvd2VyRGlzc2lwYXRlZFByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoXHJcbiAgICBzdGFydFZlcnRleDogVmVydGV4LCAvLyBzaWRlXHJcbiAgICBlbmRWZXJ0ZXg6IFZlcnRleCwgLy8gYm90dG9tXHJcbiAgICByZXNpc3RhbmNlOiBudW1iZXIsXHJcbiAgICB2aWV3VHlwZVByb3BlcnR5OiBQcm9wZXJ0eTxDaXJjdWl0RWxlbWVudFZpZXdUeXBlPixcclxuICAgIHRhbmRlbTogVGFuZGVtLFxyXG4gICAgcHJvdmlkZWRPcHRpb25zPzogTGlnaHRCdWxiT3B0aW9ucyApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TGlnaHRCdWxiT3B0aW9ucywgU2VsZk9wdGlvbnMsIEZpeGVkQ2lyY3VpdEVsZW1lbnRPcHRpb25zPigpKCB7XHJcbiAgICAgIGlzRXh0cmVtZTogZmFsc2UsXHJcbiAgICAgIGlzUmVhbDogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdudW1iZXJPZkRlY2ltYWxQbGFjZXMnICksICdzdXBwbGllZCBieSBMaWdodEJ1bGInICk7XHJcbiAgICBvcHRpb25zLm51bWJlck9mRGVjaW1hbFBsYWNlcyA9IG9wdGlvbnMuaXNFeHRyZW1lID8gMCA6IDE7XHJcblxyXG4gICAgLy8gZ2V0UGF0aExlbmd0aCBub3QgYXZhaWxhYmxlIHlldCwgc28gdXNlIGEgbm9uemVybyBjaGFyZ2UgcGF0aCBsZW5ndGggdGhlbiBvdmVycmlkZS5cclxuICAgIHN1cGVyKCBzdGFydFZlcnRleCwgZW5kVmVydGV4LCAxLCB0YW5kZW0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmlzUmVhbCA9IG9wdGlvbnMuaXNSZWFsO1xyXG4gICAgdGhpcy5pc0V4dHJlbWUgPSBvcHRpb25zLmlzRXh0cmVtZTtcclxuICAgIHRoaXMucmVzaXN0YW5jZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCByZXNpc3RhbmNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2lzdGFuY2VQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXHJcbiAgICAgIHJhbmdlOiBvcHRpb25zLmlzRXh0cmVtZSA/IG5ldyBSYW5nZSggMTAwLCAxMDAwMCApIDpcclxuICAgICAgICAgICAgIG9wdGlvbnMuaXNSZWFsID8gbmV3IFJhbmdlKCAwLCBOdW1iZXIuTUFYX1ZBTFVFICkgOiAvLyBUaGUgbm9uLW9obWljIGJ1bGIgaGFzIGl0cyByZXNpc3RhbmNlIGNvbXB1dGVkIGluIExpbmVhclRyYW5zaWVudEFuYWx5c2lzLmpzXHJcbiAgICAgICAgICAgICBuZXcgUmFuZ2UoIDAsIDEyMCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wb3dlckRpc3NpcGF0ZWRQcm9wZXJ0eSA9IG5ldyBQb3dlckRpc3NpcGF0ZWRQcm9wZXJ0eSggdGhpcy5jdXJyZW50UHJvcGVydHksIHRoaXMucmVzaXN0YW5jZVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncG93ZXJEaXNzaXBhdGVkUHJvcGVydHknICkgKTtcclxuXHJcbiAgICB0aGlzLnZpZXdUeXBlUHJvcGVydHkgPSB2aWV3VHlwZVByb3BlcnR5O1xyXG5cclxuICAgIC8vIEZpbGwgaW4gdGhlIGNoYXJnZVBhdGhMZW5ndGhcclxuICAgIHRoaXMuY2hhcmdlUGF0aExlbmd0aCA9IHRoaXMuZ2V0UGF0aExlbmd0aCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlcyB0aGUgY2hhcmdlIHBhdGggbGVuZ3RoIHdoZW4gdGhlIHZpZXcgY2hhbmdlcyBiZXR3ZWVuIGxpZmVsaWtlL3NjaGVtYXRpY1xyXG4gIHB1YmxpYyB1cGRhdGVQYXRoTGVuZ3RoKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jaGFyZ2VQYXRoTGVuZ3RoID0gdGhpcy5nZXRQYXRoTGVuZ3RoKCk7XHJcbiAgfVxyXG5cclxuICAvLyBEZXRlcm1pbmUgdGhlIHBhdGggbGVuZ3RoIGJ5IG1lYXN1cmluZyB0aGUgc2VnbWVudHMuXHJcbiAgcHJpdmF0ZSBnZXRQYXRoTGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICBsZXQgcGF0aExlbmd0aCA9IDA7XHJcbiAgICBjb25zdCBzYW1wbGVQb2ludHMgPSB0aGlzLnZpZXdUeXBlUHJvcGVydHkudmFsdWUgPT09IENpcmN1aXRFbGVtZW50Vmlld1R5cGUuTElGRUxJS0UgPyBMSUZFTElLRV9TQU1QTEVfUE9JTlRTIDogU0NIRU1BVElDX1NBTVBMRV9QT0lOVFM7XHJcbiAgICBsZXQgY3VycmVudFBvaW50ID0gTGlnaHRCdWxiLmdldEZpbGFtZW50UGF0aFBvaW50KCAwLCBWZWN0b3IyLlpFUk8sIHNhbXBsZVBvaW50cyApO1xyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgc2FtcGxlUG9pbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBuZXh0UG9pbnQgPSBMaWdodEJ1bGIuZ2V0RmlsYW1lbnRQYXRoUG9pbnQoIGksIFZlY3RvcjIuWkVSTywgc2FtcGxlUG9pbnRzICk7XHJcbiAgICAgIHBhdGhMZW5ndGggKz0gbmV4dFBvaW50LmRpc3RhbmNlKCBjdXJyZW50UG9pbnQgKTtcclxuICAgICAgY3VycmVudFBvaW50ID0gbmV4dFBvaW50O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhdGhMZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgYmVjYXVzZSBhbGwgbGlnaHQgYnVsYnMgY2FuIGhhdmUgdGhlaXIgcmVzaXN0YW5jZSBjaGFuZ2VkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaXNSZXNpc3RhbmNlRWRpdGFibGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIERpc3Bvc2Ugb2YgdGhpcyBhbmQgUGhFVC1pTyBpbnN0cnVtZW50ZWQgY2hpbGRyZW4sIHNvIHRoZXkgd2lsbCBiZSB1bnJlZ2lzdGVyZWQuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2lzdGFuY2VQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLnBvd2VyRGlzc2lwYXRlZFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcHMgZnJvbSB0aGUgXCJhcyB0aGUgY3JvdyBmbGllc1wiIHBhdGggdG8gdGhlIGNpcmN1aXRvdXMgcGF0aC4gSXQgbWFwcyBwb2ludHMgd2l0aCBhIHRyYW5zZm9ybWF0aW9uIHN1Y2ggdGhhdDpcclxuICAgKiBzdGFydFBvaW50ID0+IG9yaWdpbiwgZW5kUG9pbnQgPT4gZW5kVmVydGV4IHBvc2l0aW9uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gaW5kZXhcclxuICAgKiBAcGFyYW0gb3JpZ2luXHJcbiAgICogQHBhcmFtIHNhbXBsZVBvaW50cyAtIHRoZSBhcnJheSBvZiBwb2ludHMgdG8gdXNlIGZvciBzYW1wbGluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGdldEZpbGFtZW50UGF0aFBvaW50KCBpbmRleDogbnVtYmVyLCBvcmlnaW46IFZlY3RvcjIsIHNhbXBsZVBvaW50czogVmVjdG9yMltdICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgcG9pbnQgPSBzYW1wbGVQb2ludHNbIGluZGV4IF07XHJcblxyXG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IHNhbXBsZVBvaW50c1sgMCBdO1xyXG4gICAgY29uc3QgZW5kUG9pbnQgPSBzYW1wbGVQb2ludHNbIHNhbXBsZVBvaW50cy5sZW5ndGggLSAxIF07XHJcblxyXG4gICAgY29uc3QgeCA9IFV0aWxzLmxpbmVhciggc3RhcnRQb2ludC54LCBlbmRQb2ludC54LCBvcmlnaW4ueCwgb3JpZ2luLnggKyBMaWdodEJ1bGIudmVydGV4RGVsdGEueCwgcG9pbnQueCApO1xyXG4gICAgY29uc3QgeSA9IFV0aWxzLmxpbmVhciggc3RhcnRQb2ludC55LCBlbmRQb2ludC55LCBvcmlnaW4ueSwgb3JpZ2luLnkgKyBMaWdodEJ1bGIudmVydGV4RGVsdGEueSwgcG9pbnQueSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggeCwgeSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwcm9wZXJ0aWVzIHNvIHRoYXQgdGhlIGNpcmN1aXQgY2FuIGJlIHNvbHZlZCB3aGVuIGNoYW5nZWQuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldENpcmN1aXRQcm9wZXJ0aWVzKCk6IFByb3BlcnR5PEludGVudGlvbmFsQW55PltdIHtcclxuICAgIHJldHVybiBbIHRoaXMucmVzaXN0YW5jZVByb3BlcnR5IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPdmVycmlkZXMgQ2lyY3VpdEVsZW1lbnQuZ2V0UG9zaXRpb24gdG8gZGVzY3JpYmUgdGhlIHBhdGggdGhlIGNoYXJnZSB0YWtlcyB0aHJvdWdoIHRoZSBsaWdodCBidWxiLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRpc3RhbmNlQWxvbmdXaXJlIC0gaG93IGZhciBhbG9uZyB0aGUgYnVsYidzIGxlbmd0aCB0aGUgY2hhcmdlIGhhcyB0cmF2ZWxlZFxyXG4gICAqIEBwYXJhbSBtYXRyaXggdG8gYmUgdXBkYXRlZCB3aXRoIHRoZSBwb3NpdGlvbiBhbmQgYW5nbGUsIHNvIHRoYXQgZ2FyYmFnZSBpc24ndCBjcmVhdGVkIGVhY2ggdGltZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSB1cGRhdGVNYXRyaXhGb3JQb2ludCggZGlzdGFuY2VBbG9uZ1dpcmU6IG51bWJlciwgbWF0cml4OiBNYXRyaXgzICk6IHZvaWQge1xyXG5cclxuICAgIHN1cGVyLnVwZGF0ZU1hdHJpeEZvclBvaW50KCBkaXN0YW5jZUFsb25nV2lyZSwgbWF0cml4ICk7XHJcblxyXG4gICAgbGV0IHByZXZpb3VzQWNjdW11bGF0ZWREaXN0YW5jZSA9IDA7XHJcbiAgICBsZXQgYWNjdW11bGF0ZWREaXN0YW5jZSA9IDA7XHJcbiAgICBjb25zdCBzYW1wbGVQb2ludHMgPSB0aGlzLnZpZXdUeXBlUHJvcGVydHkudmFsdWUgPT09IENpcmN1aXRFbGVtZW50Vmlld1R5cGUuTElGRUxJS0UgPyBMSUZFTElLRV9TQU1QTEVfUE9JTlRTIDogU0NIRU1BVElDX1NBTVBMRV9QT0lOVFM7XHJcbiAgICBsZXQgY3VycmVudFBvaW50ID0gTGlnaHRCdWxiLmdldEZpbGFtZW50UGF0aFBvaW50KCAwLCB0aGlzLnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCkucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSwgc2FtcGxlUG9pbnRzICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBzYW1wbGVQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG5leHRQb2ludCA9IExpZ2h0QnVsYi5nZXRGaWxhbWVudFBhdGhQb2ludCggaSwgdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LmdldCgpLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCksIHNhbXBsZVBvaW50cyApO1xyXG4gICAgICBhY2N1bXVsYXRlZERpc3RhbmNlICs9IG5leHRQb2ludC5kaXN0YW5jZSggY3VycmVudFBvaW50ICk7XHJcblxyXG4gICAgICAvLyBGaW5kIHdoYXQgc2VnbWVudCB0aGUgY2hhcmdlIGlzIGluXHJcbiAgICAgIGlmICggZGlzdGFuY2VBbG9uZ1dpcmUgPD0gYWNjdW11bGF0ZWREaXN0YW5jZSApIHtcclxuXHJcbiAgICAgICAgLy8gQ2hvb3NlIHRoZSByaWdodCBwb2ludCBhbG9uZyB0aGUgc2VnbWVudFxyXG4gICAgICAgIGNvbnN0IGZyYWN0aW9uQWxvbmdTZWdtZW50ID0gVXRpbHMubGluZWFyKCBwcmV2aW91c0FjY3VtdWxhdGVkRGlzdGFuY2UsIGFjY3VtdWxhdGVkRGlzdGFuY2UsIDAsIDEsIGRpc3RhbmNlQWxvbmdXaXJlICk7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb25BbG9uZ1NlZ21lbnQgPSBjdXJyZW50UG9pbnQuYmxlbmQoIG5leHRQb2ludCwgZnJhY3Rpb25BbG9uZ1NlZ21lbnQgKTtcclxuXHJcbiAgICAgICAgLy8gcm90YXRlIHRoZSBwb2ludCBhYm91dCB0aGUgc3RhcnQgdmVydGV4XHJcbiAgICAgICAgY29uc3Qgc3RhcnRQb2ludCA9IHRoaXMuc3RhcnRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIGNvbnN0IHZlcnRleERlbHRhID0gdGhpcy5lbmRQb3NpdGlvblByb3BlcnR5LmdldCgpLm1pbnVzKCBzdGFydFBvaW50ICk7XHJcbiAgICAgICAgY29uc3QgcmVsYXRpdmVBbmdsZSA9IHZlcnRleERlbHRhLmFuZ2xlIC0gTGlnaHRCdWxiLnZlcnRleERlbHRhLmFuZ2xlO1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gcG9zaXRpb25BbG9uZ1NlZ21lbnQucm90YXRlZEFib3V0UG9pbnQoIHN0YXJ0UG9pbnQsIHJlbGF0aXZlQW5nbGUgKTtcclxuICAgICAgICBjb25zdCBhbmdsZSA9IG5leHRQb2ludC5taW51cyggY3VycmVudFBvaW50ICkuYW5nbGU7XHJcblxyXG4gICAgICAgIC8vIHNhbXBsZWQgZnJvbSBjcmVhdGVBdFBvc2l0aW9uXHJcbiAgICAgICAgbWF0cml4LnNldFRvVHJhbnNsYXRpb25Sb3RhdGlvblBvaW50KCBwb3NpdGlvbiwgYW5nbGUgKyBtYXRyaXguZ2V0Um90YXRpb24oKSArIDAuNzg1MTM1NDcwODAxMTM2NyApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBwcmV2aW91c0FjY3VtdWxhdGVkRGlzdGFuY2UgPSBhY2N1bXVsYXRlZERpc3RhbmNlO1xyXG4gICAgICBjdXJyZW50UG9pbnQgPSBuZXh0UG9pbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnZXhjZWVkZWQgY2hhcmdlIHBhdGggYm91bmRzJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBSRUFMX0JVTEJfQ09MRF9SRVNJU1RBTkNFID0gMTA7XHJcbn1cclxuXHJcbmNvbnN0IHNhbXBsZVBvaW50cyA9IExpZ2h0QnVsYi5jcmVhdGVTYW1wbGVQb2ludHMoIFZlY3RvcjIuWkVSTyApO1xyXG5MaWdodEJ1bGIudmVydGV4RGVsdGEgPSBzYW1wbGVQb2ludHNbIDEgXS5taW51cyggc2FtcGxlUG9pbnRzWyAwIF0gKTtcclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdMaWdodEJ1bGInLCBM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