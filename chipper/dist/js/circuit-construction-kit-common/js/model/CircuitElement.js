// Copyright 2016-2023, University of Colorado Boulder

/**
 * CircuitElement is the base class for all elements that can be part of a circuit, including:
 * Wire, Resistor, Battery, LightBulb, Switch.  It has a start vertex and end vertex and a model for its own current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { SceneryEvent } from '../../../scenery/js/imports.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CurrentSense from './CurrentSense.js';
import Vertex from './Vertex.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
// variables
let index = 0;
const VertexReferenceIO = ReferenceIO(Vertex.VertexIO);
export default class CircuitElement extends PhetioObject {
  // unique identifier for looking up corresponding views

  // track the time of creation so it can't be dropped in the toolbox for 0.5 seconds see https://github.com/phetsims/circuit-construction-kit-common/issues/244

  // flammable circuit elements can catch on fire

  // metallic circuit elements behave like exposed wires--sensor values can be read directly on the resistor. For
  // instance, coins and paper clips and wires are metallic and can have their values read directly.
  // whether the size changes when changing from lifelike/schematic, used to determine whether the highlight region
  // should be changed.  True for everything except the switch.
  // the Vertex at the origin of the CircuitElement, may change when CircuitElements are connected
  // the Vertex at the end of the CircuitElement, may change when CircuitElements are connected
  // the flowing current, in amps.
  // true if the CircuitElement can be edited and dragged
  // whether the circuit element is inside the true black box, not inside the user-created black box, on the interface
  // or outside of the black box
  // true if the charge layout must be updated (each element is visited every frame to check this)
  // indicate when this CircuitElement has been connected to another CircuitElement
  // indicate when an adjacent Vertex has moved to front, so that the corresponding Node can move to front too
  // indicate when either Vertex has moved
  // indicate when the CircuitElement has been moved to the front in z-ordering
  // indicate when the circuit element has started being dragged, when it is created in the toolbox
  // indicate when the circuit element has been disposed
  // named so it doesn't collide with the specified voltageProperty in Battery or ACVoltage
  // (read-only by clients, writable-by-subclasses) {number} the distance the charges must take to get to the other side
  // of the component. This is typically the distance between vertices, but not for light bulbs.  This value is constant,
  // except for (a) wires which can have their length changed and (b) LightBulbs whose path length changes when switching
  // between LIFELIKE |SCHEMATIC
  // The ammeter update is called after items are disposed but before corresponding views are disposed, so we must
  // take care not to display current for any items that are pending deletion.
  // See https://github.com/phetsims/circuit-construction-kit-common/issues/418
  constructor(startVertex, endVertex, chargePathLength, tandem, providedOptions) {
    assert && assert(startVertex !== endVertex, 'startVertex cannot be the same as endVertex');
    assert && assert(chargePathLength > 0, 'charge path length must be positive');
    const options = optionize()({
      interactive: true,
      // In CCK: Black Box Study, CircuitElements in the black box cannot be manipulated
      isSizeChangedOnViewChange: true,
      insideTrueBlackBox: false,
      isMetallic: false,
      // Metallic items can have their voltage read directly (unshielded)
      isFlammable: false,
      tandem: tandem,
      isCurrentReentrant: false,
      phetioDynamicElement: true,
      phetioType: CircuitElement.CircuitElementIO,
      isEditablePropertyOptions: {},
      isValueDisplayablePropertyOptions: {},
      labelStringPropertyOptions: {}
    }, providedOptions);
    super(options);
    this.id = index++;
    this.creationTime = phet.joist.elapsedTime;
    this.isFlammable = options.isFlammable;
    this.isMetallic = options.isMetallic;
    this.isSizeChangedOnViewChange = options.isSizeChangedOnViewChange;
    this.startVertexProperty = new Property(startVertex, {
      phetioValueType: Vertex.VertexIO,
      tandem: tandem.createTandem('startVertexProperty'),
      phetioState: false,
      phetioReadOnly: true,
      phetioFeatured: true
    });
    this.endVertexProperty = new Property(endVertex, {
      phetioValueType: Vertex.VertexIO,
      tandem: tandem.createTandem('endVertexProperty'),
      phetioState: false,
      phetioReadOnly: true,
      phetioFeatured: true
    });
    this.currentProperty = new NumberProperty(0, {
      reentrant: options.isCurrentReentrant,
      tandem: tandem.createTandem('currentProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioFeatured: true
    });
    this.currentProperty.link(current => {
      assert && assert(!isNaN(current));
    });

    // we assign the directionality based on the initial current direction, so the initial current is always positive.
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/508
    this.currentSenseProperty = new EnumerationProperty(CurrentSense.UNSPECIFIED, {
      tandem: tandem.createTandem('currentSenseProperty')
    });
    this.interactiveProperty = new BooleanProperty(options.interactive);
    this.insideTrueBlackBoxProperty = new BooleanProperty(options.insideTrueBlackBox);
    this.chargeLayoutDirty = true;
    this.connectedEmitter = new Emitter();
    this.moveToFrontEmitter = new Emitter();
    this.vertexSelectedEmitter = new Emitter();
    this.vertexMovedEmitter = new Emitter();
    this.startDragEmitter = new Emitter({
      parameters: [{
        valueType: SceneryEvent
      }]
    });
    this.disposeEmitterCircuitElement = new Emitter();

    // Signify that a Vertex moved
    this.vertexMovedListener = this.emitVertexMoved.bind(this);

    // stored for disposal
    this.linkVertexListener = this.linkVertex.bind(this);
    this.startPositionProperty.link(this.vertexMovedListener);
    this.endPositionProperty.link(this.vertexMovedListener);
    this.voltageDifferenceProperty = new NumberProperty(this.computeVoltageDifference());
    this.vertexVoltageListener = () => this.voltageDifferenceProperty.set(this.computeVoltageDifference());
    this.startVertexProperty.link(this.linkVertexListener);
    this.endVertexProperty.link(this.linkVertexListener);
    this.chargePathLength = chargePathLength;
    this.circuitElementDisposed = false;
    this.lengthProperty = undefined;

    // PhET-iO-specific Properties
    this.isEditableProperty = new BooleanProperty(true, combineOptions({
      tandem: tandem.createTandem('isEditableProperty'),
      phetioDocumentation: 'Whether the CircuitElement can have its numerical characteristics changed by the user',
      phetioFeatured: true
    }, options.isEditablePropertyOptions));
    this.isDisposableProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isDisposableProperty'),
      phetioDocumentation: 'Whether the CircuitElement can be disposed. Set this to false to make the CircuitElement persisent',
      phetioFeatured: true
    });
    this.isValueDisplayableProperty = new BooleanProperty(true, combineOptions({
      tandem: tandem.createTandem('isValueDisplayableProperty'),
      phetioDocumentation: 'Whether the CircuitElement\'s value can be displayed when the "values" checkbox is selected',
      phetioFeatured: true
    }, options.isValueDisplayablePropertyOptions));
    this.labelStringProperty = new StringProperty('', combineOptions({
      tandem: tandem.createTandem('labelStringProperty'),
      phetioDocumentation: 'Shows a custom text label next to the circuit element',
      phetioFeatured: true
    }, options.labelStringPropertyOptions));
  }

  /**
   * Determine the voltage difference between end vertex and start vertex
   */
  computeVoltageDifference() {
    return this.endVertexProperty.value.voltageProperty.value - this.startVertexProperty.value.voltageProperty.value;
  }

  /**
   * When the start or end Vertex changes, move the listeners from the old Vertex to the new one
   * @param newVertex - the new vertex
   * @param oldVertex - the previous vertex
   * @param property
   */
  linkVertex(newVertex, oldVertex, property) {
    // These guards prevent errors from the bad transient state caused by the Circuit.flip causing the same Vertex
    // to be both start and end at the same time.
    if (oldVertex) {
      oldVertex.positionProperty.hasListener(this.vertexMovedListener) && oldVertex.positionProperty.unlink(this.vertexMovedListener);
      oldVertex.voltageProperty.hasListener(this.vertexVoltageListener) && oldVertex.voltageProperty.unlink(this.vertexVoltageListener);
      if (!oldVertex.positionProperty.get().equals(newVertex.positionProperty.get())) {
        this.vertexMovedEmitter.emit();
      }
    }
    if (!newVertex.positionProperty.hasListener(this.vertexMovedListener)) {
      newVertex.positionProperty.lazyLink(this.vertexMovedListener);
    }
    if (!newVertex.voltageProperty.hasListener(this.vertexVoltageListener)) {
      newVertex.voltageProperty.link(this.vertexVoltageListener);
    }
    this.voltageDifferenceProperty.set(this.computeVoltageDifference());
  }

  /**
   * Steps forward in time
   */
  step(time, dt, circuit) {
    // See subclass for implementation
  }

  /**
   * Convenience method to get the start vertex position Property
   */
  get startPositionProperty() {
    return this.startVertexProperty.get().positionProperty;
  }

  /**
   * Convenience method to get the end vertex position Property
   */
  get endPositionProperty() {
    return this.endVertexProperty.get().positionProperty;
  }

  /**
   * Signify that a vertex has moved.
   */
  emitVertexMoved() {
    // We are (hopefully!) in the middle of updating both vertices and we (hopefully!) will receive another callback
    // shortly with the correct values for both startPosition and endPosition
    // See https://github.com/phetsims/circuit-construction-kit-common/issues/413
    // if ( assert && this.isFixedCircuitElement && this.startPositionProperty.value.equals( this.endPositionProperty.value ) ) {
    //   assert && stepTimer.setTimeout( function() {
    //     assert && assert( !this.startPositionProperty.value.equals( this.endPositionProperty.value ), 'vertices cannot be in the same spot' );
    //   }, 0 );
    // }
    this.vertexMovedEmitter.emit();
  }

  /**
   * Release resources associated with this CircuitElement, called when it will no longer be used.
   */
  dispose() {
    assert && assert(!this.circuitElementDisposed, 'circuit element was already disposed');
    this.circuitElementDisposed = true;

    // Notify about intent to dispose first because dispose listeners may need to access state
    this.disposeEmitterCircuitElement.emit();
    this.disposeEmitterCircuitElement.dispose();
    this.startVertexProperty.unlink(this.linkVertexListener);
    this.endVertexProperty.unlink(this.linkVertexListener);
    this.startPositionProperty.hasListener(this.vertexMovedListener) && this.startPositionProperty.unlink(this.vertexMovedListener);
    this.endPositionProperty.hasListener(this.vertexMovedListener) && this.endPositionProperty.unlink(this.vertexMovedListener);
    const startVoltageProperty = this.startVertexProperty.value.voltageProperty;
    const endVoltageProperty = this.endVertexProperty.value.voltageProperty;
    if (startVoltageProperty.hasListener(this.vertexVoltageListener)) {
      startVoltageProperty.unlink(this.vertexVoltageListener);
    }
    if (endVoltageProperty.hasListener(this.vertexVoltageListener)) {
      endVoltageProperty.unlink(this.vertexVoltageListener);
    }
    this.isEditableProperty.dispose();
    this.isDisposableProperty.dispose();
    this.isValueDisplayableProperty.dispose();
    this.startVertexProperty.dispose();
    this.endVertexProperty.dispose();
    this.labelStringProperty.dispose();
    this.currentSenseProperty.dispose();
    this.currentProperty.dispose();
    super.dispose();
  }

  /**
   * Replace one of the vertices with a new one, when CircuitElements are connected.
   * @param oldVertex - the vertex which will be replaced.
   * @param newVertex - the vertex which will take the place of oldVertex.
   */
  replaceVertex(oldVertex, newVertex) {
    const startVertex = this.startVertexProperty.get();
    const endVertex = this.endVertexProperty.get();
    assert && assert(oldVertex !== newVertex, 'Cannot replace with the same vertex');
    assert && assert(oldVertex === startVertex || oldVertex === endVertex, 'Cannot replace a nonexistent vertex');
    assert && assert(newVertex !== startVertex && newVertex !== endVertex, 'The new vertex shouldn\'t already be ' + 'in the circuit element.');
    if (oldVertex === startVertex) {
      this.startVertexProperty.set(newVertex);
    } else {
      this.endVertexProperty.set(newVertex);
    }
  }

  /**
   * Gets the Vertex on the opposite side of the specified Vertex
   */
  getOppositeVertex(vertex) {
    assert && assert(this.containsVertex(vertex), 'Missing vertex');
    if (this.startVertexProperty.get() === vertex) {
      return this.endVertexProperty.get();
    } else {
      return this.startVertexProperty.get();
    }
  }

  /**
   * Returns whether this CircuitElement contains the specified Vertex as its startVertex or endVertex.
   */
  containsVertex(vertex) {
    return this.startVertexProperty.get() === vertex || this.endVertexProperty.get() === vertex;
  }

  /**
   * Returns true if this CircuitElement contains both Vertex instances.
   */
  containsBothVertices(vertex1, vertex2) {
    return this.containsVertex(vertex1) && this.containsVertex(vertex2);
  }

  /**
   * Updates the given matrix with the position and angle at the specified position along the element.
   * @param distanceAlongWire - the scalar distance from one endpoint to another.
   * @param matrix to be updated with the position and angle, so that garbage isn't created each time
   */
  updateMatrixForPoint(distanceAlongWire, matrix) {
    const startPosition = this.startPositionProperty.get();
    const endPosition = this.endPositionProperty.get();
    const translation = startPosition.blend(endPosition, distanceAlongWire / this.chargePathLength);
    assert && assert(!isNaN(translation.x), 'x should be a number');
    assert && assert(!isNaN(translation.y), 'y should be a number');
    const angle = Vector2.getAngleBetweenVectors(startPosition, endPosition);
    assert && assert(!isNaN(angle), 'angle should be a number');
    matrix.setToTranslationRotationPoint(translation, angle);
  }

  /**
   * Returns true if this CircuitElement contains the specified scalar position.
   */
  containsScalarPosition(scalarPosition) {
    return scalarPosition >= 0 && scalarPosition <= this.chargePathLength;
  }

  /**
   * Get all Property instances that influence the circuit dynamics.
   */

  /**
   * Get the midpoint between the vertices.  Used for dropping circuit elements into the toolbox.
   */
  getMidpoint() {
    const start = this.startVertexProperty.value.positionProperty.get();
    const end = this.endVertexProperty.value.positionProperty.get();
    return start.average(end);
  }
  toVertexString() {
    return `${this.startVertexProperty.value.index} -> ${this.endVertexProperty.value.index}`;
  }
  static CircuitElementIO = new IOType('CircuitElementIO', {
    valueType: CircuitElement,
    documentation: 'A Circuit Element, such as battery, resistor or wire',
    toStateObject: circuitElement => ({
      startVertexID: VertexReferenceIO.toStateObject(circuitElement.startVertexProperty.value),
      endVertexID: VertexReferenceIO.toStateObject(circuitElement.endVertexProperty.value)
    }),
    stateSchema: {
      startVertexID: VertexReferenceIO,
      endVertexID: VertexReferenceIO
    },
    stateObjectToCreateElementArguments: stateObject => {
      return [VertexReferenceIO.fromStateObject(stateObject.startVertexID), VertexReferenceIO.fromStateObject(stateObject.endVertexID)];
    }
  });
}
circuitConstructionKitCommon.register('CircuitElement', CircuitElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJTY2VuZXJ5RXZlbnQiLCJQaGV0aW9PYmplY3QiLCJJT1R5cGUiLCJSZWZlcmVuY2VJTyIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24iLCJDdXJyZW50U2Vuc2UiLCJWZXJ0ZXgiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlN0cmluZ1Byb3BlcnR5IiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsImluZGV4IiwiVmVydGV4UmVmZXJlbmNlSU8iLCJWZXJ0ZXhJTyIsIkNpcmN1aXRFbGVtZW50IiwiY29uc3RydWN0b3IiLCJzdGFydFZlcnRleCIsImVuZFZlcnRleCIsImNoYXJnZVBhdGhMZW5ndGgiLCJ0YW5kZW0iLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJvcHRpb25zIiwiaW50ZXJhY3RpdmUiLCJpc1NpemVDaGFuZ2VkT25WaWV3Q2hhbmdlIiwiaW5zaWRlVHJ1ZUJsYWNrQm94IiwiaXNNZXRhbGxpYyIsImlzRmxhbW1hYmxlIiwiaXNDdXJyZW50UmVlbnRyYW50IiwicGhldGlvRHluYW1pY0VsZW1lbnQiLCJwaGV0aW9UeXBlIiwiQ2lyY3VpdEVsZW1lbnRJTyIsImlzRWRpdGFibGVQcm9wZXJ0eU9wdGlvbnMiLCJpc1ZhbHVlRGlzcGxheWFibGVQcm9wZXJ0eU9wdGlvbnMiLCJsYWJlbFN0cmluZ1Byb3BlcnR5T3B0aW9ucyIsImlkIiwiY3JlYXRpb25UaW1lIiwicGhldCIsImpvaXN0IiwiZWxhcHNlZFRpbWUiLCJzdGFydFZlcnRleFByb3BlcnR5IiwicGhldGlvVmFsdWVUeXBlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvU3RhdGUiLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0ZlYXR1cmVkIiwiZW5kVmVydGV4UHJvcGVydHkiLCJjdXJyZW50UHJvcGVydHkiLCJyZWVudHJhbnQiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwibGluayIsImN1cnJlbnQiLCJpc05hTiIsImN1cnJlbnRTZW5zZVByb3BlcnR5IiwiVU5TUEVDSUZJRUQiLCJpbnRlcmFjdGl2ZVByb3BlcnR5IiwiaW5zaWRlVHJ1ZUJsYWNrQm94UHJvcGVydHkiLCJjaGFyZ2VMYXlvdXREaXJ0eSIsImNvbm5lY3RlZEVtaXR0ZXIiLCJtb3ZlVG9Gcm9udEVtaXR0ZXIiLCJ2ZXJ0ZXhTZWxlY3RlZEVtaXR0ZXIiLCJ2ZXJ0ZXhNb3ZlZEVtaXR0ZXIiLCJzdGFydERyYWdFbWl0dGVyIiwicGFyYW1ldGVycyIsInZhbHVlVHlwZSIsImRpc3Bvc2VFbWl0dGVyQ2lyY3VpdEVsZW1lbnQiLCJ2ZXJ0ZXhNb3ZlZExpc3RlbmVyIiwiZW1pdFZlcnRleE1vdmVkIiwiYmluZCIsImxpbmtWZXJ0ZXhMaXN0ZW5lciIsImxpbmtWZXJ0ZXgiLCJzdGFydFBvc2l0aW9uUHJvcGVydHkiLCJlbmRQb3NpdGlvblByb3BlcnR5Iiwidm9sdGFnZURpZmZlcmVuY2VQcm9wZXJ0eSIsImNvbXB1dGVWb2x0YWdlRGlmZmVyZW5jZSIsInZlcnRleFZvbHRhZ2VMaXN0ZW5lciIsInNldCIsImNpcmN1aXRFbGVtZW50RGlzcG9zZWQiLCJsZW5ndGhQcm9wZXJ0eSIsInVuZGVmaW5lZCIsImlzRWRpdGFibGVQcm9wZXJ0eSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJpc0Rpc3Bvc2FibGVQcm9wZXJ0eSIsImlzVmFsdWVEaXNwbGF5YWJsZVByb3BlcnR5IiwibGFiZWxTdHJpbmdQcm9wZXJ0eSIsInZhbHVlIiwidm9sdGFnZVByb3BlcnR5IiwibmV3VmVydGV4Iiwib2xkVmVydGV4IiwicHJvcGVydHkiLCJwb3NpdGlvblByb3BlcnR5IiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJnZXQiLCJlcXVhbHMiLCJlbWl0IiwibGF6eUxpbmsiLCJzdGVwIiwidGltZSIsImR0IiwiY2lyY3VpdCIsImRpc3Bvc2UiLCJzdGFydFZvbHRhZ2VQcm9wZXJ0eSIsImVuZFZvbHRhZ2VQcm9wZXJ0eSIsInJlcGxhY2VWZXJ0ZXgiLCJnZXRPcHBvc2l0ZVZlcnRleCIsInZlcnRleCIsImNvbnRhaW5zVmVydGV4IiwiY29udGFpbnNCb3RoVmVydGljZXMiLCJ2ZXJ0ZXgxIiwidmVydGV4MiIsInVwZGF0ZU1hdHJpeEZvclBvaW50IiwiZGlzdGFuY2VBbG9uZ1dpcmUiLCJtYXRyaXgiLCJzdGFydFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJ0cmFuc2xhdGlvbiIsImJsZW5kIiwieCIsInkiLCJhbmdsZSIsImdldEFuZ2xlQmV0d2VlblZlY3RvcnMiLCJzZXRUb1RyYW5zbGF0aW9uUm90YXRpb25Qb2ludCIsImNvbnRhaW5zU2NhbGFyUG9zaXRpb24iLCJzY2FsYXJQb3NpdGlvbiIsImdldE1pZHBvaW50Iiwic3RhcnQiLCJlbmQiLCJhdmVyYWdlIiwidG9WZXJ0ZXhTdHJpbmciLCJkb2N1bWVudGF0aW9uIiwidG9TdGF0ZU9iamVjdCIsImNpcmN1aXRFbGVtZW50Iiwic3RhcnRWZXJ0ZXhJRCIsImVuZFZlcnRleElEIiwic3RhdGVTY2hlbWEiLCJzdGF0ZU9iamVjdFRvQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyIsInN0YXRlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDaXJjdWl0RWxlbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDaXJjdWl0RWxlbWVudCBpcyB0aGUgYmFzZSBjbGFzcyBmb3IgYWxsIGVsZW1lbnRzIHRoYXQgY2FuIGJlIHBhcnQgb2YgYSBjaXJjdWl0LCBpbmNsdWRpbmc6XHJcbiAqIFdpcmUsIFJlc2lzdG9yLCBCYXR0ZXJ5LCBMaWdodEJ1bGIsIFN3aXRjaC4gIEl0IGhhcyBhIHN0YXJ0IHZlcnRleCBhbmQgZW5kIHZlcnRleCBhbmQgYSBtb2RlbCBmb3IgaXRzIG93biBjdXJyZW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSwgeyBQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFByZXNzTGlzdGVuZXJFdmVudCwgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IENpcmN1aXQgZnJvbSAnLi9DaXJjdWl0LmpzJztcclxuaW1wb3J0IEN1cnJlbnRTZW5zZSBmcm9tICcuL0N1cnJlbnRTZW5zZS5qcyc7XHJcbmltcG9ydCBWZXJ0ZXggZnJvbSAnLi9WZXJ0ZXguanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHksIHsgUHJvcGVydHlMaW5rTGlzdGVuZXIgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcblxyXG4vLyB2YXJpYWJsZXNcclxubGV0IGluZGV4ID0gMDtcclxuXHJcbmNvbnN0IFZlcnRleFJlZmVyZW5jZUlPID0gUmVmZXJlbmNlSU8oIFZlcnRleC5WZXJ0ZXhJTyApO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBpc0ZsYW1tYWJsZT86IGJvb2xlYW47XHJcbiAgaXNNZXRhbGxpYz86IGJvb2xlYW47XHJcbiAgaXNTaXplQ2hhbmdlZE9uVmlld0NoYW5nZT86IGJvb2xlYW47XHJcbiAgaXNDdXJyZW50UmVlbnRyYW50PzogYm9vbGVhbjtcclxuICBpbnRlcmFjdGl2ZT86IGJvb2xlYW47XHJcbiAgaW5zaWRlVHJ1ZUJsYWNrQm94PzogYm9vbGVhbjtcclxuXHJcbiAgaXNFZGl0YWJsZVByb3BlcnR5T3B0aW9ucz86IFBpY2s8UHJvcGVydHlPcHRpb25zPGJvb2xlYW4+LCAndGFuZGVtJz47XHJcbiAgaXNWYWx1ZURpc3BsYXlhYmxlUHJvcGVydHlPcHRpb25zPzogUGljazxQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj4sICd0YW5kZW0nPjtcclxuICBsYWJlbFN0cmluZ1Byb3BlcnR5T3B0aW9ucz86IFBpY2s8UHJvcGVydHlPcHRpb25zPGJvb2xlYW4+LCAndGFuZGVtJz47XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBDaXJjdWl0RWxlbWVudE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBoZXRpb09iamVjdE9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBDaXJjdWl0RWxlbWVudFN0YXRlID0ge1xyXG4gIHN0YXJ0VmVydGV4SUQ6IHN0cmluZztcclxuICBlbmRWZXJ0ZXhJRDogc3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgQ2lyY3VpdEVsZW1lbnQgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvLyB1bmlxdWUgaWRlbnRpZmllciBmb3IgbG9va2luZyB1cCBjb3JyZXNwb25kaW5nIHZpZXdzXHJcbiAgcHVibGljIHJlYWRvbmx5IGlkOiBudW1iZXI7XHJcblxyXG4gIC8vIHRyYWNrIHRoZSB0aW1lIG9mIGNyZWF0aW9uIHNvIGl0IGNhbid0IGJlIGRyb3BwZWQgaW4gdGhlIHRvb2xib3ggZm9yIDAuNSBzZWNvbmRzIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvMjQ0XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjcmVhdGlvblRpbWU6IG51bWJlcjtcclxuXHJcbiAgLy8gZmxhbW1hYmxlIGNpcmN1aXQgZWxlbWVudHMgY2FuIGNhdGNoIG9uIGZpcmVcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNGbGFtbWFibGU6IGJvb2xlYW47XHJcblxyXG4gIC8vIG1ldGFsbGljIGNpcmN1aXQgZWxlbWVudHMgYmVoYXZlIGxpa2UgZXhwb3NlZCB3aXJlcy0tc2Vuc29yIHZhbHVlcyBjYW4gYmUgcmVhZCBkaXJlY3RseSBvbiB0aGUgcmVzaXN0b3IuIEZvclxyXG4gIC8vIGluc3RhbmNlLCBjb2lucyBhbmQgcGFwZXIgY2xpcHMgYW5kIHdpcmVzIGFyZSBtZXRhbGxpYyBhbmQgY2FuIGhhdmUgdGhlaXIgdmFsdWVzIHJlYWQgZGlyZWN0bHkuXHJcbiAgcHVibGljIHJlYWRvbmx5IGlzTWV0YWxsaWM6IGJvb2xlYW47XHJcblxyXG4gIC8vIHdoZXRoZXIgdGhlIHNpemUgY2hhbmdlcyB3aGVuIGNoYW5naW5nIGZyb20gbGlmZWxpa2Uvc2NoZW1hdGljLCB1c2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBoaWdobGlnaHQgcmVnaW9uXHJcbiAgLy8gc2hvdWxkIGJlIGNoYW5nZWQuICBUcnVlIGZvciBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgc3dpdGNoLlxyXG4gIHB1YmxpYyByZWFkb25seSBpc1NpemVDaGFuZ2VkT25WaWV3Q2hhbmdlOiBib29sZWFuO1xyXG5cclxuICAvLyB0aGUgVmVydGV4IGF0IHRoZSBvcmlnaW4gb2YgdGhlIENpcmN1aXRFbGVtZW50LCBtYXkgY2hhbmdlIHdoZW4gQ2lyY3VpdEVsZW1lbnRzIGFyZSBjb25uZWN0ZWRcclxuICBwdWJsaWMgcmVhZG9ubHkgc3RhcnRWZXJ0ZXhQcm9wZXJ0eTogUHJvcGVydHk8VmVydGV4PjtcclxuXHJcbiAgLy8gdGhlIFZlcnRleCBhdCB0aGUgZW5kIG9mIHRoZSBDaXJjdWl0RWxlbWVudCwgbWF5IGNoYW5nZSB3aGVuIENpcmN1aXRFbGVtZW50cyBhcmUgY29ubmVjdGVkXHJcbiAgcHVibGljIHJlYWRvbmx5IGVuZFZlcnRleFByb3BlcnR5OiBQcm9wZXJ0eTxWZXJ0ZXg+O1xyXG5cclxuICAvLyB0aGUgZmxvd2luZyBjdXJyZW50LCBpbiBhbXBzLlxyXG4gIHB1YmxpYyByZWFkb25seSBjdXJyZW50UHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGN1cnJlbnRTZW5zZVByb3BlcnR5OiBQcm9wZXJ0eTxDdXJyZW50U2Vuc2U+O1xyXG5cclxuICAvLyB0cnVlIGlmIHRoZSBDaXJjdWl0RWxlbWVudCBjYW4gYmUgZWRpdGVkIGFuZCBkcmFnZ2VkXHJcbiAgcHVibGljIHJlYWRvbmx5IGludGVyYWN0aXZlUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuXHJcbiAgLy8gd2hldGhlciB0aGUgY2lyY3VpdCBlbGVtZW50IGlzIGluc2lkZSB0aGUgdHJ1ZSBibGFjayBib3gsIG5vdCBpbnNpZGUgdGhlIHVzZXItY3JlYXRlZCBibGFjayBib3gsIG9uIHRoZSBpbnRlcmZhY2VcclxuICAvLyBvciBvdXRzaWRlIG9mIHRoZSBibGFjayBib3hcclxuICBwdWJsaWMgcmVhZG9ubHkgaW5zaWRlVHJ1ZUJsYWNrQm94UHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuXHJcbiAgLy8gdHJ1ZSBpZiB0aGUgY2hhcmdlIGxheW91dCBtdXN0IGJlIHVwZGF0ZWQgKGVhY2ggZWxlbWVudCBpcyB2aXNpdGVkIGV2ZXJ5IGZyYW1lIHRvIGNoZWNrIHRoaXMpXHJcbiAgcHVibGljIGNoYXJnZUxheW91dERpcnR5OiBib29sZWFuO1xyXG5cclxuICAvLyBpbmRpY2F0ZSB3aGVuIHRoaXMgQ2lyY3VpdEVsZW1lbnQgaGFzIGJlZW4gY29ubmVjdGVkIHRvIGFub3RoZXIgQ2lyY3VpdEVsZW1lbnRcclxuICBwdWJsaWMgcmVhZG9ubHkgY29ubmVjdGVkRW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIC8vIGluZGljYXRlIHdoZW4gYW4gYWRqYWNlbnQgVmVydGV4IGhhcyBtb3ZlZCB0byBmcm9udCwgc28gdGhhdCB0aGUgY29ycmVzcG9uZGluZyBOb2RlIGNhbiBtb3ZlIHRvIGZyb250IHRvb1xyXG4gIHB1YmxpYyByZWFkb25seSB2ZXJ0ZXhTZWxlY3RlZEVtaXR0ZXI6IFRFbWl0dGVyO1xyXG5cclxuICAvLyBpbmRpY2F0ZSB3aGVuIGVpdGhlciBWZXJ0ZXggaGFzIG1vdmVkXHJcbiAgcHVibGljIHJlYWRvbmx5IHZlcnRleE1vdmVkRW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIC8vIGluZGljYXRlIHdoZW4gdGhlIENpcmN1aXRFbGVtZW50IGhhcyBiZWVuIG1vdmVkIHRvIHRoZSBmcm9udCBpbiB6LW9yZGVyaW5nXHJcbiAgcHVibGljIHJlYWRvbmx5IG1vdmVUb0Zyb250RW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIC8vIGluZGljYXRlIHdoZW4gdGhlIGNpcmN1aXQgZWxlbWVudCBoYXMgc3RhcnRlZCBiZWluZyBkcmFnZ2VkLCB3aGVuIGl0IGlzIGNyZWF0ZWQgaW4gdGhlIHRvb2xib3hcclxuICBwdWJsaWMgcmVhZG9ubHkgc3RhcnREcmFnRW1pdHRlcjogVEVtaXR0ZXI8WyBQcmVzc0xpc3RlbmVyRXZlbnQgXT47XHJcblxyXG4gIC8vIGluZGljYXRlIHdoZW4gdGhlIGNpcmN1aXQgZWxlbWVudCBoYXMgYmVlbiBkaXNwb3NlZFxyXG4gIHB1YmxpYyByZWFkb25seSBkaXNwb3NlRW1pdHRlckNpcmN1aXRFbGVtZW50OiBURW1pdHRlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHZlcnRleE1vdmVkTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsaW5rVmVydGV4TGlzdGVuZXI6IFByb3BlcnR5TGlua0xpc3RlbmVyPFZlcnRleD47XHJcblxyXG4gIC8vIG5hbWVkIHNvIGl0IGRvZXNuJ3QgY29sbGlkZSB3aXRoIHRoZSBzcGVjaWZpZWQgdm9sdGFnZVByb3BlcnR5IGluIEJhdHRlcnkgb3IgQUNWb2x0YWdlXHJcbiAgcHVibGljIHJlYWRvbmx5IHZvbHRhZ2VEaWZmZXJlbmNlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmVydGV4Vm9sdGFnZUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xyXG5cclxuICAvLyAocmVhZC1vbmx5IGJ5IGNsaWVudHMsIHdyaXRhYmxlLWJ5LXN1YmNsYXNzZXMpIHtudW1iZXJ9IHRoZSBkaXN0YW5jZSB0aGUgY2hhcmdlcyBtdXN0IHRha2UgdG8gZ2V0IHRvIHRoZSBvdGhlciBzaWRlXHJcbiAgLy8gb2YgdGhlIGNvbXBvbmVudC4gVGhpcyBpcyB0eXBpY2FsbHkgdGhlIGRpc3RhbmNlIGJldHdlZW4gdmVydGljZXMsIGJ1dCBub3QgZm9yIGxpZ2h0IGJ1bGJzLiAgVGhpcyB2YWx1ZSBpcyBjb25zdGFudCxcclxuICAvLyBleGNlcHQgZm9yIChhKSB3aXJlcyB3aGljaCBjYW4gaGF2ZSB0aGVpciBsZW5ndGggY2hhbmdlZCBhbmQgKGIpIExpZ2h0QnVsYnMgd2hvc2UgcGF0aCBsZW5ndGggY2hhbmdlcyB3aGVuIHN3aXRjaGluZ1xyXG4gIC8vIGJldHdlZW4gTElGRUxJS0UgfFNDSEVNQVRJQ1xyXG4gIHB1YmxpYyBjaGFyZ2VQYXRoTGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gIC8vIFRoZSBhbW1ldGVyIHVwZGF0ZSBpcyBjYWxsZWQgYWZ0ZXIgaXRlbXMgYXJlIGRpc3Bvc2VkIGJ1dCBiZWZvcmUgY29ycmVzcG9uZGluZyB2aWV3cyBhcmUgZGlzcG9zZWQsIHNvIHdlIG11c3RcclxuICAvLyB0YWtlIGNhcmUgbm90IHRvIGRpc3BsYXkgY3VycmVudCBmb3IgYW55IGl0ZW1zIHRoYXQgYXJlIHBlbmRpbmcgZGVsZXRpb24uXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2lzc3Vlcy80MThcclxuICBwdWJsaWMgY2lyY3VpdEVsZW1lbnREaXNwb3NlZDogYm9vbGVhbjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGxlbmd0aFByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+IHwgdW5kZWZpbmVkO1xyXG4gIHB1YmxpYyByZWFkb25seSBpc0VkaXRhYmxlUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNEaXNwb3NhYmxlUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuICBwdWJsaWMgaXNWYWx1ZURpc3BsYXlhYmxlUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuICBwdWJsaWMgbGFiZWxTdHJpbmdQcm9wZXJ0eTogU3RyaW5nUHJvcGVydHk7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RhcnRWZXJ0ZXg6IFZlcnRleCwgZW5kVmVydGV4OiBWZXJ0ZXgsIGNoYXJnZVBhdGhMZW5ndGg6IG51bWJlciwgdGFuZGVtOiBUYW5kZW0sIHByb3ZpZGVkT3B0aW9ucz86IENpcmN1aXRFbGVtZW50T3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YXJ0VmVydGV4ICE9PSBlbmRWZXJ0ZXgsICdzdGFydFZlcnRleCBjYW5ub3QgYmUgdGhlIHNhbWUgYXMgZW5kVmVydGV4JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2hhcmdlUGF0aExlbmd0aCA+IDAsICdjaGFyZ2UgcGF0aCBsZW5ndGggbXVzdCBiZSBwb3NpdGl2ZScgKTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENpcmN1aXRFbGVtZW50T3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuICAgICAgaW50ZXJhY3RpdmU6IHRydWUsIC8vIEluIENDSzogQmxhY2sgQm94IFN0dWR5LCBDaXJjdWl0RWxlbWVudHMgaW4gdGhlIGJsYWNrIGJveCBjYW5ub3QgYmUgbWFuaXB1bGF0ZWRcclxuICAgICAgaXNTaXplQ2hhbmdlZE9uVmlld0NoYW5nZTogdHJ1ZSxcclxuICAgICAgaW5zaWRlVHJ1ZUJsYWNrQm94OiBmYWxzZSxcclxuICAgICAgaXNNZXRhbGxpYzogZmFsc2UsIC8vIE1ldGFsbGljIGl0ZW1zIGNhbiBoYXZlIHRoZWlyIHZvbHRhZ2UgcmVhZCBkaXJlY3RseSAodW5zaGllbGRlZClcclxuICAgICAgaXNGbGFtbWFibGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgaXNDdXJyZW50UmVlbnRyYW50OiBmYWxzZSxcclxuICAgICAgcGhldGlvRHluYW1pY0VsZW1lbnQ6IHRydWUsXHJcbiAgICAgIHBoZXRpb1R5cGU6IENpcmN1aXRFbGVtZW50LkNpcmN1aXRFbGVtZW50SU8sXHJcblxyXG4gICAgICBpc0VkaXRhYmxlUHJvcGVydHlPcHRpb25zOiB7fSxcclxuICAgICAgaXNWYWx1ZURpc3BsYXlhYmxlUHJvcGVydHlPcHRpb25zOiB7fSxcclxuICAgICAgbGFiZWxTdHJpbmdQcm9wZXJ0eU9wdGlvbnM6IHt9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuaWQgPSBpbmRleCsrO1xyXG4gICAgdGhpcy5jcmVhdGlvblRpbWUgPSBwaGV0LmpvaXN0LmVsYXBzZWRUaW1lO1xyXG4gICAgdGhpcy5pc0ZsYW1tYWJsZSA9IG9wdGlvbnMuaXNGbGFtbWFibGU7XHJcbiAgICB0aGlzLmlzTWV0YWxsaWMgPSBvcHRpb25zLmlzTWV0YWxsaWM7XHJcbiAgICB0aGlzLmlzU2l6ZUNoYW5nZWRPblZpZXdDaGFuZ2UgPSBvcHRpb25zLmlzU2l6ZUNoYW5nZWRPblZpZXdDaGFuZ2U7XHJcblxyXG4gICAgdGhpcy5zdGFydFZlcnRleFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBzdGFydFZlcnRleCwge1xyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IFZlcnRleC5WZXJ0ZXhJTyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RhcnRWZXJ0ZXhQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVuZFZlcnRleFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBlbmRWZXJ0ZXgsIHtcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBWZXJ0ZXguVmVydGV4SU8sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZFZlcnRleFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY3VycmVudFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHJlZW50cmFudDogb3B0aW9ucy5pc0N1cnJlbnRSZWVudHJhbnQsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2N1cnJlbnRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmN1cnJlbnRQcm9wZXJ0eS5saW5rKCBjdXJyZW50ID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWlzTmFOKCBjdXJyZW50ICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB3ZSBhc3NpZ24gdGhlIGRpcmVjdGlvbmFsaXR5IGJhc2VkIG9uIHRoZSBpbml0aWFsIGN1cnJlbnQgZGlyZWN0aW9uLCBzbyB0aGUgaW5pdGlhbCBjdXJyZW50IGlzIGFsd2F5cyBwb3NpdGl2ZS5cclxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvNTA4XHJcbiAgICB0aGlzLmN1cnJlbnRTZW5zZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIEN1cnJlbnRTZW5zZS5VTlNQRUNJRklFRCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjdXJyZW50U2Vuc2VQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaW50ZXJhY3RpdmVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIG9wdGlvbnMuaW50ZXJhY3RpdmUgKTtcclxuICAgIHRoaXMuaW5zaWRlVHJ1ZUJsYWNrQm94UHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBvcHRpb25zLmluc2lkZVRydWVCbGFja0JveCApO1xyXG4gICAgdGhpcy5jaGFyZ2VMYXlvdXREaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLmNvbm5lY3RlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy5tb3ZlVG9Gcm9udEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy52ZXJ0ZXhTZWxlY3RlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy52ZXJ0ZXhNb3ZlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy5zdGFydERyYWdFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogU2NlbmVyeUV2ZW50IH0gXSB9ICk7XHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyQ2lyY3VpdEVsZW1lbnQgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIFNpZ25pZnkgdGhhdCBhIFZlcnRleCBtb3ZlZFxyXG4gICAgdGhpcy52ZXJ0ZXhNb3ZlZExpc3RlbmVyID0gdGhpcy5lbWl0VmVydGV4TW92ZWQuYmluZCggdGhpcyApO1xyXG5cclxuICAgIC8vIHN0b3JlZCBmb3IgZGlzcG9zYWxcclxuICAgIHRoaXMubGlua1ZlcnRleExpc3RlbmVyID0gdGhpcy5saW5rVmVydGV4LmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0UG9zaXRpb25Qcm9wZXJ0eS5saW5rKCB0aGlzLnZlcnRleE1vdmVkTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuZW5kUG9zaXRpb25Qcm9wZXJ0eS5saW5rKCB0aGlzLnZlcnRleE1vdmVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLnZvbHRhZ2VEaWZmZXJlbmNlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIHRoaXMuY29tcHV0ZVZvbHRhZ2VEaWZmZXJlbmNlKCkgKTtcclxuXHJcbiAgICB0aGlzLnZlcnRleFZvbHRhZ2VMaXN0ZW5lciA9ICgpID0+IHRoaXMudm9sdGFnZURpZmZlcmVuY2VQcm9wZXJ0eS5zZXQoIHRoaXMuY29tcHV0ZVZvbHRhZ2VEaWZmZXJlbmNlKCkgKTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0VmVydGV4UHJvcGVydHkubGluayggdGhpcy5saW5rVmVydGV4TGlzdGVuZXIgKTtcclxuICAgIHRoaXMuZW5kVmVydGV4UHJvcGVydHkubGluayggdGhpcy5saW5rVmVydGV4TGlzdGVuZXIgKTtcclxuICAgIHRoaXMuY2hhcmdlUGF0aExlbmd0aCA9IGNoYXJnZVBhdGhMZW5ndGg7XHJcbiAgICB0aGlzLmNpcmN1aXRFbGVtZW50RGlzcG9zZWQgPSBmYWxzZTtcclxuICAgIHRoaXMubGVuZ3RoUHJvcGVydHkgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgLy8gUGhFVC1pTy1zcGVjaWZpYyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLmlzRWRpdGFibGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIGNvbWJpbmVPcHRpb25zPFByb3BlcnR5T3B0aW9uczxib29sZWFuPj4oIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNFZGl0YWJsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnV2hldGhlciB0aGUgQ2lyY3VpdEVsZW1lbnQgY2FuIGhhdmUgaXRzIG51bWVyaWNhbCBjaGFyYWN0ZXJpc3RpY3MgY2hhbmdlZCBieSB0aGUgdXNlcicsXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zLmlzRWRpdGFibGVQcm9wZXJ0eU9wdGlvbnMgKSApO1xyXG5cclxuICAgIHRoaXMuaXNEaXNwb3NhYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzRGlzcG9zYWJsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnV2hldGhlciB0aGUgQ2lyY3VpdEVsZW1lbnQgY2FuIGJlIGRpc3Bvc2VkLiBTZXQgdGhpcyB0byBmYWxzZSB0byBtYWtlIHRoZSBDaXJjdWl0RWxlbWVudCBwZXJzaXNlbnQnLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaXNWYWx1ZURpc3BsYXlhYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCBjb21iaW5lT3B0aW9uczxQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj4+KCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzVmFsdWVEaXNwbGF5YWJsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnV2hldGhlciB0aGUgQ2lyY3VpdEVsZW1lbnRcXCdzIHZhbHVlIGNhbiBiZSBkaXNwbGF5ZWQgd2hlbiB0aGUgXCJ2YWx1ZXNcIiBjaGVja2JveCBpcyBzZWxlY3RlZCcsXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zLmlzVmFsdWVEaXNwbGF5YWJsZVByb3BlcnR5T3B0aW9ucyApICk7XHJcblxyXG4gICAgdGhpcy5sYWJlbFN0cmluZ1Byb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnJywgY29tYmluZU9wdGlvbnM8UHJvcGVydHlPcHRpb25zPHN0cmluZz4+KCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsU3RyaW5nUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdTaG93cyBhIGN1c3RvbSB0ZXh0IGxhYmVsIG5leHQgdG8gdGhlIGNpcmN1aXQgZWxlbWVudCcsXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zLmxhYmVsU3RyaW5nUHJvcGVydHlPcHRpb25zICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSB0aGUgdm9sdGFnZSBkaWZmZXJlbmNlIGJldHdlZW4gZW5kIHZlcnRleCBhbmQgc3RhcnQgdmVydGV4XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjb21wdXRlVm9sdGFnZURpZmZlcmVuY2UoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmVuZFZlcnRleFByb3BlcnR5LnZhbHVlLnZvbHRhZ2VQcm9wZXJ0eS52YWx1ZSAtXHJcbiAgICAgICAgICAgdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LnZhbHVlLnZvbHRhZ2VQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gdGhlIHN0YXJ0IG9yIGVuZCBWZXJ0ZXggY2hhbmdlcywgbW92ZSB0aGUgbGlzdGVuZXJzIGZyb20gdGhlIG9sZCBWZXJ0ZXggdG8gdGhlIG5ldyBvbmVcclxuICAgKiBAcGFyYW0gbmV3VmVydGV4IC0gdGhlIG5ldyB2ZXJ0ZXhcclxuICAgKiBAcGFyYW0gb2xkVmVydGV4IC0gdGhlIHByZXZpb3VzIHZlcnRleFxyXG4gICAqIEBwYXJhbSBwcm9wZXJ0eVxyXG4gICAqL1xyXG4gIHByaXZhdGUgbGlua1ZlcnRleCggbmV3VmVydGV4OiBWZXJ0ZXgsIG9sZFZlcnRleDogVmVydGV4IHwgbnVsbCwgcHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFZlcnRleD4gKTogdm9pZCB7XHJcblxyXG4gICAgLy8gVGhlc2UgZ3VhcmRzIHByZXZlbnQgZXJyb3JzIGZyb20gdGhlIGJhZCB0cmFuc2llbnQgc3RhdGUgY2F1c2VkIGJ5IHRoZSBDaXJjdWl0LmZsaXAgY2F1c2luZyB0aGUgc2FtZSBWZXJ0ZXhcclxuICAgIC8vIHRvIGJlIGJvdGggc3RhcnQgYW5kIGVuZCBhdCB0aGUgc2FtZSB0aW1lLlxyXG4gICAgaWYgKCBvbGRWZXJ0ZXggKSB7XHJcbiAgICAgIG9sZFZlcnRleC5wb3NpdGlvblByb3BlcnR5Lmhhc0xpc3RlbmVyKCB0aGlzLnZlcnRleE1vdmVkTGlzdGVuZXIgKSAmJiBvbGRWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHRoaXMudmVydGV4TW92ZWRMaXN0ZW5lciApO1xyXG4gICAgICBvbGRWZXJ0ZXgudm9sdGFnZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB0aGlzLnZlcnRleFZvbHRhZ2VMaXN0ZW5lciApICYmIG9sZFZlcnRleC52b2x0YWdlUHJvcGVydHkudW5saW5rKCB0aGlzLnZlcnRleFZvbHRhZ2VMaXN0ZW5lciApO1xyXG5cclxuICAgICAgaWYgKCAhb2xkVmVydGV4LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZXF1YWxzKCBuZXdWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgIHRoaXMudmVydGV4TW92ZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggIW5ld1ZlcnRleC5wb3NpdGlvblByb3BlcnR5Lmhhc0xpc3RlbmVyKCB0aGlzLnZlcnRleE1vdmVkTGlzdGVuZXIgKSApIHtcclxuICAgICAgbmV3VmVydGV4LnBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoIHRoaXMudmVydGV4TW92ZWRMaXN0ZW5lciApO1xyXG4gICAgfVxyXG4gICAgaWYgKCAhbmV3VmVydGV4LnZvbHRhZ2VQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdGhpcy52ZXJ0ZXhWb2x0YWdlTGlzdGVuZXIgKSApIHtcclxuICAgICAgbmV3VmVydGV4LnZvbHRhZ2VQcm9wZXJ0eS5saW5rKCB0aGlzLnZlcnRleFZvbHRhZ2VMaXN0ZW5lciApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudm9sdGFnZURpZmZlcmVuY2VQcm9wZXJ0eS5zZXQoIHRoaXMuY29tcHV0ZVZvbHRhZ2VEaWZmZXJlbmNlKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIGZvcndhcmQgaW4gdGltZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCB0aW1lOiBudW1iZXIsIGR0OiBudW1iZXIsIGNpcmN1aXQ6IENpcmN1aXQgKTogdm9pZCB7XHJcbiAgICAvLyBTZWUgc3ViY2xhc3MgZm9yIGltcGxlbWVudGF0aW9uXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBtZXRob2QgdG8gZ2V0IHRoZSBzdGFydCB2ZXJ0ZXggcG9zaXRpb24gUHJvcGVydHlcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHN0YXJ0UG9zaXRpb25Qcm9wZXJ0eSgpOiBQcm9wZXJ0eTxWZWN0b3IyPiB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LmdldCgpLnBvc2l0aW9uUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBtZXRob2QgdG8gZ2V0IHRoZSBlbmQgdmVydGV4IHBvc2l0aW9uIFByb3BlcnR5XHJcbiAgICovXHJcbiAgcHVibGljIGdldCBlbmRQb3NpdGlvblByb3BlcnR5KCk6IFByb3BlcnR5PFZlY3RvcjI+IHtcclxuICAgIHJldHVybiB0aGlzLmVuZFZlcnRleFByb3BlcnR5LmdldCgpLnBvc2l0aW9uUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaWduaWZ5IHRoYXQgYSB2ZXJ0ZXggaGFzIG1vdmVkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZW1pdFZlcnRleE1vdmVkKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIFdlIGFyZSAoaG9wZWZ1bGx5ISkgaW4gdGhlIG1pZGRsZSBvZiB1cGRhdGluZyBib3RoIHZlcnRpY2VzIGFuZCB3ZSAoaG9wZWZ1bGx5ISkgd2lsbCByZWNlaXZlIGFub3RoZXIgY2FsbGJhY2tcclxuICAgIC8vIHNob3J0bHkgd2l0aCB0aGUgY29ycmVjdCB2YWx1ZXMgZm9yIGJvdGggc3RhcnRQb3NpdGlvbiBhbmQgZW5kUG9zaXRpb25cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvNDEzXHJcbiAgICAvLyBpZiAoIGFzc2VydCAmJiB0aGlzLmlzRml4ZWRDaXJjdWl0RWxlbWVudCAmJiB0aGlzLnN0YXJ0UG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5lcXVhbHMoIHRoaXMuZW5kUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICkge1xyXG4gICAgLy8gICBhc3NlcnQgJiYgc3RlcFRpbWVyLnNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnN0YXJ0UG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5lcXVhbHMoIHRoaXMuZW5kUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLCAndmVydGljZXMgY2Fubm90IGJlIGluIHRoZSBzYW1lIHNwb3QnICk7XHJcbiAgICAvLyAgIH0sIDAgKTtcclxuICAgIC8vIH1cclxuICAgIHRoaXMudmVydGV4TW92ZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2UgcmVzb3VyY2VzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIENpcmN1aXRFbGVtZW50LCBjYWxsZWQgd2hlbiBpdCB3aWxsIG5vIGxvbmdlciBiZSB1c2VkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuY2lyY3VpdEVsZW1lbnREaXNwb3NlZCwgJ2NpcmN1aXQgZWxlbWVudCB3YXMgYWxyZWFkeSBkaXNwb3NlZCcgKTtcclxuICAgIHRoaXMuY2lyY3VpdEVsZW1lbnREaXNwb3NlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gTm90aWZ5IGFib3V0IGludGVudCB0byBkaXNwb3NlIGZpcnN0IGJlY2F1c2UgZGlzcG9zZSBsaXN0ZW5lcnMgbWF5IG5lZWQgdG8gYWNjZXNzIHN0YXRlXHJcbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyQ2lyY3VpdEVsZW1lbnQuZW1pdCgpO1xyXG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlckNpcmN1aXRFbGVtZW50LmRpc3Bvc2UoKTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0VmVydGV4UHJvcGVydHkudW5saW5rKCB0aGlzLmxpbmtWZXJ0ZXhMaXN0ZW5lciApO1xyXG4gICAgdGhpcy5lbmRWZXJ0ZXhQcm9wZXJ0eS51bmxpbmsoIHRoaXMubGlua1ZlcnRleExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5zdGFydFBvc2l0aW9uUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMudmVydGV4TW92ZWRMaXN0ZW5lciApICYmIHRoaXMuc3RhcnRQb3NpdGlvblByb3BlcnR5LnVubGluayggdGhpcy52ZXJ0ZXhNb3ZlZExpc3RlbmVyICk7XHJcbiAgICB0aGlzLmVuZFBvc2l0aW9uUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMudmVydGV4TW92ZWRMaXN0ZW5lciApICYmIHRoaXMuZW5kUG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHRoaXMudmVydGV4TW92ZWRMaXN0ZW5lciApO1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0Vm9sdGFnZVByb3BlcnR5ID0gdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LnZhbHVlLnZvbHRhZ2VQcm9wZXJ0eTtcclxuICAgIGNvbnN0IGVuZFZvbHRhZ2VQcm9wZXJ0eSA9IHRoaXMuZW5kVmVydGV4UHJvcGVydHkudmFsdWUudm9sdGFnZVByb3BlcnR5O1xyXG5cclxuICAgIGlmICggc3RhcnRWb2x0YWdlUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMudmVydGV4Vm9sdGFnZUxpc3RlbmVyICkgKSB7XHJcbiAgICAgIHN0YXJ0Vm9sdGFnZVByb3BlcnR5LnVubGluayggdGhpcy52ZXJ0ZXhWb2x0YWdlTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGVuZFZvbHRhZ2VQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdGhpcy52ZXJ0ZXhWb2x0YWdlTGlzdGVuZXIgKSApIHtcclxuICAgICAgZW5kVm9sdGFnZVByb3BlcnR5LnVubGluayggdGhpcy52ZXJ0ZXhWb2x0YWdlTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzRWRpdGFibGVQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmlzRGlzcG9zYWJsZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuaXNWYWx1ZURpc3BsYXlhYmxlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuZW5kVmVydGV4UHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5sYWJlbFN0cmluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuY3VycmVudFNlbnNlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5jdXJyZW50UHJvcGVydHkuZGlzcG9zZSgpO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcGxhY2Ugb25lIG9mIHRoZSB2ZXJ0aWNlcyB3aXRoIGEgbmV3IG9uZSwgd2hlbiBDaXJjdWl0RWxlbWVudHMgYXJlIGNvbm5lY3RlZC5cclxuICAgKiBAcGFyYW0gb2xkVmVydGV4IC0gdGhlIHZlcnRleCB3aGljaCB3aWxsIGJlIHJlcGxhY2VkLlxyXG4gICAqIEBwYXJhbSBuZXdWZXJ0ZXggLSB0aGUgdmVydGV4IHdoaWNoIHdpbGwgdGFrZSB0aGUgcGxhY2Ugb2Ygb2xkVmVydGV4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXBsYWNlVmVydGV4KCBvbGRWZXJ0ZXg6IFZlcnRleCwgbmV3VmVydGV4OiBWZXJ0ZXggKTogdm9pZCB7XHJcbiAgICBjb25zdCBzdGFydFZlcnRleCA9IHRoaXMuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IGVuZFZlcnRleCA9IHRoaXMuZW5kVmVydGV4UHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2xkVmVydGV4ICE9PSBuZXdWZXJ0ZXgsICdDYW5ub3QgcmVwbGFjZSB3aXRoIHRoZSBzYW1lIHZlcnRleCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9sZFZlcnRleCA9PT0gc3RhcnRWZXJ0ZXggfHwgb2xkVmVydGV4ID09PSBlbmRWZXJ0ZXgsICdDYW5ub3QgcmVwbGFjZSBhIG5vbmV4aXN0ZW50IHZlcnRleCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5ld1ZlcnRleCAhPT0gc3RhcnRWZXJ0ZXggJiYgbmV3VmVydGV4ICE9PSBlbmRWZXJ0ZXgsICdUaGUgbmV3IHZlcnRleCBzaG91bGRuXFwndCBhbHJlYWR5IGJlICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2luIHRoZSBjaXJjdWl0IGVsZW1lbnQuJyApO1xyXG5cclxuICAgIGlmICggb2xkVmVydGV4ID09PSBzdGFydFZlcnRleCApIHtcclxuICAgICAgdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LnNldCggbmV3VmVydGV4ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5lbmRWZXJ0ZXhQcm9wZXJ0eS5zZXQoIG5ld1ZlcnRleCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgVmVydGV4IG9uIHRoZSBvcHBvc2l0ZSBzaWRlIG9mIHRoZSBzcGVjaWZpZWQgVmVydGV4XHJcbiAgICovXHJcbiAgcHVibGljIGdldE9wcG9zaXRlVmVydGV4KCB2ZXJ0ZXg6IFZlcnRleCApOiBWZXJ0ZXgge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb250YWluc1ZlcnRleCggdmVydGV4ICksICdNaXNzaW5nIHZlcnRleCcgKTtcclxuICAgIGlmICggdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LmdldCgpID09PSB2ZXJ0ZXggKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmVuZFZlcnRleFByb3BlcnR5LmdldCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBDaXJjdWl0RWxlbWVudCBjb250YWlucyB0aGUgc3BlY2lmaWVkIFZlcnRleCBhcyBpdHMgc3RhcnRWZXJ0ZXggb3IgZW5kVmVydGV4LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb250YWluc1ZlcnRleCggdmVydGV4OiBWZXJ0ZXggKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LmdldCgpID09PSB2ZXJ0ZXggfHwgdGhpcy5lbmRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKSA9PT0gdmVydGV4O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgQ2lyY3VpdEVsZW1lbnQgY29udGFpbnMgYm90aCBWZXJ0ZXggaW5zdGFuY2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb250YWluc0JvdGhWZXJ0aWNlcyggdmVydGV4MTogVmVydGV4LCB2ZXJ0ZXgyOiBWZXJ0ZXggKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5jb250YWluc1ZlcnRleCggdmVydGV4MSApICYmIHRoaXMuY29udGFpbnNWZXJ0ZXgoIHZlcnRleDIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGdpdmVuIG1hdHJpeCB3aXRoIHRoZSBwb3NpdGlvbiBhbmQgYW5nbGUgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBhbG9uZyB0aGUgZWxlbWVudC5cclxuICAgKiBAcGFyYW0gZGlzdGFuY2VBbG9uZ1dpcmUgLSB0aGUgc2NhbGFyIGRpc3RhbmNlIGZyb20gb25lIGVuZHBvaW50IHRvIGFub3RoZXIuXHJcbiAgICogQHBhcmFtIG1hdHJpeCB0byBiZSB1cGRhdGVkIHdpdGggdGhlIHBvc2l0aW9uIGFuZCBhbmdsZSwgc28gdGhhdCBnYXJiYWdlIGlzbid0IGNyZWF0ZWQgZWFjaCB0aW1lXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZU1hdHJpeEZvclBvaW50KCBkaXN0YW5jZUFsb25nV2lyZTogbnVtYmVyLCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XHJcbiAgICBjb25zdCBzdGFydFBvc2l0aW9uID0gdGhpcy5zdGFydFBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBlbmRQb3NpdGlvbiA9IHRoaXMuZW5kUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gc3RhcnRQb3NpdGlvbi5ibGVuZCggZW5kUG9zaXRpb24sIGRpc3RhbmNlQWxvbmdXaXJlIC8gdGhpcy5jaGFyZ2VQYXRoTGVuZ3RoICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIHRyYW5zbGF0aW9uLnggKSwgJ3ggc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWlzTmFOKCB0cmFuc2xhdGlvbi55ICksICd5IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuICAgIGNvbnN0IGFuZ2xlID0gVmVjdG9yMi5nZXRBbmdsZUJldHdlZW5WZWN0b3JzKCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWlzTmFOKCBhbmdsZSApLCAnYW5nbGUgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgbWF0cml4LnNldFRvVHJhbnNsYXRpb25Sb3RhdGlvblBvaW50KCB0cmFuc2xhdGlvbiwgYW5nbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIENpcmN1aXRFbGVtZW50IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgc2NhbGFyIHBvc2l0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb250YWluc1NjYWxhclBvc2l0aW9uKCBzY2FsYXJQb3NpdGlvbjogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHNjYWxhclBvc2l0aW9uID49IDAgJiYgc2NhbGFyUG9zaXRpb24gPD0gdGhpcy5jaGFyZ2VQYXRoTGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFsbCBQcm9wZXJ0eSBpbnN0YW5jZXMgdGhhdCBpbmZsdWVuY2UgdGhlIGNpcmN1aXQgZHluYW1pY3MuXHJcbiAgICovXHJcbiAgcHVibGljIGFic3RyYWN0IGdldENpcmN1aXRQcm9wZXJ0aWVzKCk6IFByb3BlcnR5PEludGVudGlvbmFsQW55PltdO1xyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG1pZHBvaW50IGJldHdlZW4gdGhlIHZlcnRpY2VzLiAgVXNlZCBmb3IgZHJvcHBpbmcgY2lyY3VpdCBlbGVtZW50cyBpbnRvIHRoZSB0b29sYm94LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNaWRwb2ludCgpOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5zdGFydFZlcnRleFByb3BlcnR5LnZhbHVlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBlbmQgPSB0aGlzLmVuZFZlcnRleFByb3BlcnR5LnZhbHVlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICByZXR1cm4gc3RhcnQuYXZlcmFnZSggZW5kICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvVmVydGV4U3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCR7dGhpcy5zdGFydFZlcnRleFByb3BlcnR5LnZhbHVlLmluZGV4fSAtPiAke3RoaXMuZW5kVmVydGV4UHJvcGVydHkudmFsdWUuaW5kZXh9YDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQ2lyY3VpdEVsZW1lbnRJTyA9IG5ldyBJT1R5cGU8Q2lyY3VpdEVsZW1lbnQsIENpcmN1aXRFbGVtZW50U3RhdGU+KCAnQ2lyY3VpdEVsZW1lbnRJTycsIHtcclxuXHJcbiAgICB2YWx1ZVR5cGU6IENpcmN1aXRFbGVtZW50LFxyXG4gICAgZG9jdW1lbnRhdGlvbjogJ0EgQ2lyY3VpdCBFbGVtZW50LCBzdWNoIGFzIGJhdHRlcnksIHJlc2lzdG9yIG9yIHdpcmUnLFxyXG4gICAgdG9TdGF0ZU9iamVjdDogKCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKSA9PiAoIHtcclxuICAgICAgc3RhcnRWZXJ0ZXhJRDogVmVydGV4UmVmZXJlbmNlSU8udG9TdGF0ZU9iamVjdCggY2lyY3VpdEVsZW1lbnQuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSApLFxyXG4gICAgICBlbmRWZXJ0ZXhJRDogVmVydGV4UmVmZXJlbmNlSU8udG9TdGF0ZU9iamVjdCggY2lyY3VpdEVsZW1lbnQuZW5kVmVydGV4UHJvcGVydHkudmFsdWUgKVxyXG4gICAgfSApLFxyXG4gICAgc3RhdGVTY2hlbWE6IHtcclxuICAgICAgc3RhcnRWZXJ0ZXhJRDogVmVydGV4UmVmZXJlbmNlSU8sXHJcbiAgICAgIGVuZFZlcnRleElEOiBWZXJ0ZXhSZWZlcmVuY2VJT1xyXG4gICAgfSxcclxuICAgIHN0YXRlT2JqZWN0VG9DcmVhdGVFbGVtZW50QXJndW1lbnRzOiAoIHN0YXRlT2JqZWN0OiBDaXJjdWl0RWxlbWVudFN0YXRlICkgPT4ge1xyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgIFZlcnRleFJlZmVyZW5jZUlPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3Quc3RhcnRWZXJ0ZXhJRCApLFxyXG4gICAgICAgIFZlcnRleFJlZmVyZW5jZUlPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuZW5kVmVydGV4SUQgKVxyXG4gICAgICBdO1xyXG4gICAgfVxyXG4gIH0gKTtcclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0NpcmN1aXRFbGVtZW50JywgQ2lyY3VpdEVsZW1lbnQgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0scUNBQXFDO0FBQ2pFLE9BQU9DLE9BQU8sTUFBTSw2QkFBNkI7QUFDakQsT0FBT0MsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxRQUFRLE1BQTJCLDhCQUE4QjtBQUV4RSxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELFNBQTZCQyxZQUFZLFFBQVEsZ0NBQWdDO0FBQ2pGLE9BQU9DLFlBQVksTUFBK0Isb0NBQW9DO0FBRXRGLE9BQU9DLE1BQU0sTUFBTSxvQ0FBb0M7QUFDdkQsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFFN0UsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyxNQUFNLE1BQU0sYUFBYTtBQUVoQyxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSxvQ0FBb0M7QUFDOUUsT0FBT0MsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxtQkFBbUIsTUFBTSx5Q0FBeUM7QUFJekU7QUFDQSxJQUFJQyxLQUFLLEdBQUcsQ0FBQztBQUViLE1BQU1DLGlCQUFpQixHQUFHVCxXQUFXLENBQUVHLE1BQU0sQ0FBQ08sUUFBUyxDQUFDO0FBc0J4RCxlQUFlLE1BQWVDLGNBQWMs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