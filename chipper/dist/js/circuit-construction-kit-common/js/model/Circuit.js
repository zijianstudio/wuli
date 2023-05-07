// Copyright 2015-2023, University of Colorado Boulder

/**
 * A collection of circuit elements in the play area, not necessarily connected.  (For instance it could be 2 disjoint
 * circuits). This exists for the life of the sim and hence does not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import createObservableArray from '../../../axon/js/createObservableArray.js';
import Property from '../../../axon/js/Property.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Vector2 from '../../../dot/js/Vector2.js';
import PhetioGroup from '../../../tandem/js/PhetioGroup.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from './ACVoltage.js';
import Battery from './Battery.js';
import Capacitor from './Capacitor.js';
import Charge from './Charge.js';
import ChargeAnimator from './ChargeAnimator.js';
import CircuitElement from './CircuitElement.js';
import CurrentType from './CurrentType.js';
import DynamicCircuitElement from './DynamicCircuitElement.js';
import FixedCircuitElement from './FixedCircuitElement.js';
import Fuse from './Fuse.js';
import Inductor from './Inductor.js';
import LightBulb from './LightBulb.js';
import LinearTransientAnalysis from './analysis/LinearTransientAnalysis.js';
import Resistor from './Resistor.js';
import SeriesAmmeter from './SeriesAmmeter.js';
import Switch from './Switch.js';
import Vertex from './Vertex.js';
import Wire from './Wire.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ResistorType from './ResistorType.js';
import InteractionMode from './InteractionMode.js';
import CurrentSense from './CurrentSense.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import OrIO from '../../../tandem/js/types/OrIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../tandem/js/types/VoidIO.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import ObjectLiteralIO from '../../../tandem/js/types/ObjectLiteralIO.js';
// constants
const SNAP_RADIUS = 30; // For two vertices to join together, they must be this close, in view coordinates
const BUMP_AWAY_RADIUS = 20; // If two vertices are too close together after one is released, and they could not be
// joined then bump them apart so they do not look connected.

const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
const WIRE_LENGTH = CCKCConstants.WIRE_LENGTH;

// Determine what sense a circuit element should have to create an overall positive readout, given the specified current
const getSenseForPositive = current => current < 0 ? CurrentSense.BACKWARD : current > 0 ? CurrentSense.FORWARD : CurrentSense.UNSPECIFIED;

// Determine what sense a circuit element should have to create an overall negative readout, given the specified current
const getSenseForNegative = current => current < 0 ? CurrentSense.FORWARD : current > 0 ? CurrentSense.BACKWARD : CurrentSense.UNSPECIFIED;
const trueFunction = _.constant(true); // Lower cased so IDEA doesn't think it is a constructor

export default class Circuit extends PhetioObject {
  // All wires share the same resistivity, which is defined by resistance = resistivity * length. On the Lab Screen,
  // there is a wire resistivity control
  // All batteries share a single internal resistance value, which can be edited with a control on the Lab Screen
  // The different types of CircuitElement the circuit may contain, including Wire, Battery, Switch, Resistor, LightBulb, etc.
  // The charges in the circuit
  // whether the current should be displayed
  // whether to show charges or conventional current
  // elapsed time for the circuit model
  // move the charges with speed proportional to current
  // After the circuit physics is recomputed in solve(), some listeners need to update themselves, such as the voltmeter
  // and ammeter
  // Some actions only take place after an item has been dropped
  // signifies that a component has been modified (for example, with the CircuitElementNumberControl)
  // When the user taps on a CircuitElement, it becomes selected and highlighted, and shows additional controls at the
  // bottom of the screen. When the sim launches or when the user taps away from a selected circuit element, the
  // selection is `null`.  Once this simulation is instrumented for a11y, the focus property can be used to track this.
  // Note that vertex selection is done via Vertex.isSelectedProperty.  These strategies can be unified when we work on
  // a11y.
  // whether physical characteristics have changed and warrant solving for currents and voltages
  // Actions that will be invoked during the step function
  constructor(viewTypeProperty, addRealBulbsProperty, tandem, providedOptions) {
    super({
      tandem: tandem,
      phetioType: CircuitStateIO,
      // Used for get/set for the circuit on one screen but the entire state is already instrumented via the PhetioGroups
      phetioState: false
    });
    this.viewTypeProperty = viewTypeProperty;
    this.addRealBulbsProperty = addRealBulbsProperty;
    const options = providedOptions;
    this.includeACElements = options.includeACElements;
    this.includeLabElements = options.includeLabElements;
    this.blackBoxStudy = options.blackBoxStudy;
    this.wireResistivityProperty = new NumberProperty(CCKCConstants.WIRE_RESISTIVITY_RANGE.min, {
      tandem: tandem.parentTandem.createTandem('wireResistivityProperty'),
      range: CCKCConstants.WIRE_RESISTIVITY_RANGE,
      phetioFeatured: true
    });
    this.sourceResistanceProperty = new NumberProperty(CCKCConstants.DEFAULT_BATTERY_RESISTANCE, {
      tandem: tandem.parentTandem.createTandem('sourceResistanceProperty'),
      range: CCKCConstants.BATTERY_RESISTANCE_RANGE,
      phetioFeatured: true
    });
    this.circuitElements = createObservableArray({
      phetioState: true,
      phetioType: createObservableArray.ObservableArrayIO(ReferenceIO(CircuitElement.CircuitElementIO)),
      tandem: tandem.createTandem('circuitElements'),
      phetioDocumentation: 'All Circuit Elements, used for state save/restore',
      phetioFeatured: true
    });
    this.charges = createObservableArray();
    this.currentTypeProperty = new EnumerationProperty(CCKCQueryParameters.currentType === 'electrons' ? CurrentType.ELECTRONS : CurrentType.CONVENTIONAL, {
      tandem: tandem.parentTandem.createTandem('currentTypeProperty'),
      phetioFeatured: true
    });

    // When the current type changes, mark everything as dirty and relayout charges
    this.currentTypeProperty.lazyLink(() => this.relayoutAllCharges());
    this.showCurrentProperty = new BooleanProperty(CCKCQueryParameters.showCurrent, {
      tandem: tandem.parentTandem.createTandem('showCurrentProperty'),
      phetioFeatured: true
    });
    this.timeProperty = new NumberProperty(0);
    this.chargeAnimator = new ChargeAnimator(this);

    // Mark as dirty when voltages or resistances change.
    const markDirtyListener = this.markDirty.bind(this);

    // Solve the circuit when any of the circuit element attributes change.
    this.circuitElements.addItemAddedListener(circuitElement => {
      circuitElement.getCircuitProperties().forEach(property => property.lazyLink(markDirtyListener));
      if (circuitElement instanceof DynamicCircuitElement) {
        circuitElement.clearEmitter.addListener(markDirtyListener);
        circuitElement.disposeEmitterCircuitElement.addListener(() => {
          circuitElement.clearEmitter.removeListener(markDirtyListener);
        });
      }

      // When any vertex moves, relayout all charges within the fixed-length connected component, see #100
      circuitElement.chargeLayoutDirty = true;
      const updateCharges = () => this.markAllConnectedCircuitElementsDirty(circuitElement.startVertexProperty.get());

      // For circuit elements that can change their length, make sure to update charges when the length changes.
      if (circuitElement.lengthProperty) {
        circuitElement.lengthProperty.link(updateCharges);
        circuitElement.disposeEmitterCircuitElement.addListener(() => circuitElement.lengthProperty.unlink(updateCharges));
      }
      this.markDirty();
      circuitElement.currentSenseProperty.lazyLink(emitCircuitChanged);
    });
    this.circuitElements.addItemRemovedListener(circuitElement => {
      // Delete orphaned vertices
      this.removeVertexIfOrphaned(circuitElement.startVertexProperty.get());
      this.removeVertexIfOrphaned(circuitElement.endVertexProperty.get());

      // Clear the selected element property so that the Edit panel for the element will disappear
      if (this.selectionProperty.get() === circuitElement) {
        this.selectionProperty.value = null;
      }
      circuitElement.getCircuitProperties().forEach(property => property.unlink(markDirtyListener));
      this.charges.removeAll(this.getChargesInCircuitElement(circuitElement));
      circuitElement.currentSenseProperty.unlink(emitCircuitChanged);
      this.markDirty();
    });

    // When a Charge is removed from the list, dispose it
    this.charges.addItemRemovedListener(charge => charge.dispose());
    this.circuitChangedEmitter = new Emitter();
    this.vertexDroppedEmitter = new Emitter({
      parameters: [{
        valueType: Vertex
      }]
    });
    this.componentEditedEmitter = new Emitter();
    this.selectionProperty = new Property(null, {
      tandem: tandem.createTandem('selectionProperty'),
      phetioValueType: NullableIO(ReferenceIO(OrIO([CircuitElement.CircuitElementIO, Vertex.VertexIO]))),
      phetioFeatured: true
    });
    const emitCircuitChanged = () => {
      this.dirty = true;
      this.circuitChangedEmitter.emit();
    };
    this.vertexGroup = new PhetioGroup((tandem, position) => {
      return new Vertex(position, this.selectionProperty, {
        tandem: tandem,
        phetioType: Vertex.VertexIO
      });
    }, [new Vector2(-1000, 0)], {
      phetioType: PhetioGroup.PhetioGroupIO(Vertex.VertexIO),
      tandem: tandem.createTandem('vertexGroup')
    });
    this.vertexGroup.elementCreatedEmitter.addListener(vertex => {
      // Observe the change in position of the vertices, to update the ammeter and voltmeter
      vertex.positionProperty.link(emitCircuitChanged);
      const filtered = this.vertexGroup.filter(candidateVertex => vertex === candidateVertex);
      assert && assert(filtered.length === 1, 'should only have one copy of each vertex');

      // If the use dragged another circuit element, then previous selection should be cleared.
      this.selectionProperty.value = null;
    });
    this.stepActions = [];

    // When any vertex is dropped, check it and its neighbors for overlap.  If any overlap, move them apart.
    this.vertexDroppedEmitter.addListener(vertex => {
      this.stepActions.push(() => {
        // Collect adjacent vertices
        const neighbors = this.getNeighboringVertices(vertex);

        // Also consider the vertex being dropped for comparison with neighbors
        neighbors.push(vertex);
        const pairs = [];
        neighbors.forEach(neighbor => {
          this.vertexGroup.forEach(vertex => {
            // Make sure nodes are different
            if (neighbor !== vertex) {
              // Add to the list to be checked
              pairs.push({
                v1: neighbor,
                v2: vertex
              });
            }
          });
        });
        if (pairs.length > 0) {
          // Find the closest pair
          const distance = pair => pair.v2.unsnappedPositionProperty.get().distance(pair.v1.unsnappedPositionProperty.get());
          const minPair = _.minBy(pairs, distance);
          const minDistance = distance(minPair);

          // If the pair is too close, then bump one vertex away from each other (but only if both are not user controlled)
          if (minDistance < BUMP_AWAY_RADIUS && !minPair.v1.isDragged && !minPair.v2.isDragged) {
            this.moveVerticesApart(minPair.v1, minPair.v2);
          }
        }
      });
    });
    this.sourceResistanceProperty.link(markDirtyListener);

    // Create vertices for the API validated/baseline circuit elements.  These are not present in the vertexGroup and
    // hence not transmitted in the state.
    const createVertices = length => {
      const startPosition = new Vector2(-1000, 0);
      return [new Vertex(startPosition, this.selectionProperty), new Vertex(startPosition.plusXY(length, 0), this.selectionProperty)];
    };
    this.wireGroup = new PhetioGroup((tandem, startVertex, endVertex) => {
      return new Wire(startVertex, endVertex, this.wireResistivityProperty, tandem);
    }, () => createVertices(WIRE_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('wireGroup')
    });
    this.batteryGroup = new PhetioGroup((tandem, startVertex, endVertex) => {
      return new Battery(startVertex, endVertex, this.sourceResistanceProperty, 'normal', tandem);
    }, () => createVertices(BATTERY_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('batteryGroup')
    });
    const includeExtremeElements = this.includeLabElements && !this.includeACElements;
    this.extremeBatteryGroup = includeExtremeElements ? new PhetioGroup((tandem, startVertex, endVertex) => {
      return new Battery(startVertex, endVertex, this.sourceResistanceProperty, 'high-voltage', tandem, {
        voltage: 1000,
        numberOfDecimalPlaces: Battery.HIGH_VOLTAGE_DECIMAL_PLACES
      });
    }, () => createVertices(BATTERY_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('extremeBatteryGroup'),
      phetioDynamicElementName: 'extremeBattery'
    }) : null;
    this.acVoltageGroup = this.includeACElements ? new PhetioGroup((tandem, startVertex, endVertex) => {
      return new ACVoltage(startVertex, endVertex, this.sourceResistanceProperty, tandem);
    }, () => createVertices(CCKCConstants.AC_VOLTAGE_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('acVoltageGroup')
    }) : null;
    this.resistorGroup = new PhetioGroup((tandem, startVertex, endVertex) => new Resistor(startVertex, endVertex, ResistorType.RESISTOR, tandem), () => createVertices(ResistorType.RESISTOR.length), {
      phetioType: PhetioGroup.PhetioGroupIO(Resistor.ResistorIO),
      tandem: tandem.createTandem('resistorGroup')
    });
    this.extremeResistorGroup = includeExtremeElements ? new PhetioGroup((tandem, startVertex, endVertex) => new Resistor(startVertex, endVertex, ResistorType.EXTREME_RESISTOR, tandem), () => createVertices(ResistorType.EXTREME_RESISTOR.length), {
      phetioType: PhetioGroup.PhetioGroupIO(Resistor.ResistorIO),
      tandem: tandem.createTandem('extremeResistorGroup')
    }) : null;
    this.householdObjectGroup = new PhetioGroup((tandem, startVertex, endVertex, resistorType) => new Resistor(startVertex, endVertex, resistorType, tandem), () => {
      return [...createVertices(ResistorType.RESISTOR.length), ResistorType.COIN];
    }, {
      phetioType: PhetioGroup.PhetioGroupIO(Resistor.ResistorIO),
      tandem: tandem.createTandem('householdObjectGroup')
    });
    this.fuseGroup = new PhetioGroup((tandem, startVertex, endVertex) => new Fuse(startVertex, endVertex, tandem), () => createVertices(CCKCConstants.FUSE_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('fuseGroup')
    });
    this.seriesAmmeterGroup = this.includeLabElements ? new PhetioGroup((tandem, startVertex, endVertex) => new SeriesAmmeter(startVertex, endVertex, tandem), () => createVertices(CCKCConstants.SERIES_AMMETER_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('seriesAmmeterGroup')
    }) : null;
    this.extremeLightBulbGroup = includeExtremeElements ? new PhetioGroup((tandem, startVertex, endVertex) => {
      return LightBulb.createAtPosition(startVertex, endVertex, this, CCKCConstants.HIGH_RESISTANCE, this.viewTypeProperty, tandem, {
        isExtreme: true
      });
    }, () => createVertices(100), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('extremeLightBulbGroup')
    }) : null;
    this.capacitorGroup = this.includeACElements ? new PhetioGroup((tandem, startVertex, endVertex) => new Capacitor(startVertex, endVertex, tandem), () => createVertices(CCKCConstants.CAPACITOR_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('capacitorGroup')
    }) : null;
    this.inductorGroup = this.includeACElements ? new PhetioGroup((tandem, startVertex, endVertex) => new Inductor(startVertex, endVertex, tandem), () => createVertices(CCKCConstants.INDUCTOR_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('inductorGroup')
    }) : null;
    this.switchGroup = new PhetioGroup((tandem, startVertex, endVertex) => new Switch(startVertex, endVertex, tandem, this), () => createVertices(CCKCConstants.SWITCH_LENGTH), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('switchGroup')
    });
    this.lightBulbGroup = new PhetioGroup((tandem, startVertex, endVertex) => {
      return new LightBulb(startVertex, endVertex, CCKCConstants.DEFAULT_RESISTANCE, this.viewTypeProperty, tandem);
    }, () => createVertices(100), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('lightBulbGroup')
    });
    this.realLightBulbGroup = this.includeLabElements && !this.includeACElements ? new PhetioGroup((tandem, startVertex, endVertex) => {
      return new LightBulb(startVertex, endVertex, CCKCConstants.DEFAULT_RESISTANCE, this.viewTypeProperty, tandem, {
        isReal: true,
        isEditablePropertyOptions: {
          tandem: Tandem.OPT_OUT
        }
      });
    }, () => createVertices(100), {
      phetioType: PhetioGroup.PhetioGroupIO(CircuitElement.CircuitElementIO),
      tandem: tandem.createTandem('realLightBulbGroup')
    }) : null;
    this.groups = [this.wireGroup, this.batteryGroup, this.resistorGroup, this.switchGroup, this.lightBulbGroup, this.fuseGroup, this.householdObjectGroup, ...(this.extremeBatteryGroup ? [this.extremeBatteryGroup] : []), ...(this.extremeResistorGroup ? [this.extremeResistorGroup] : []), ...(this.extremeLightBulbGroup ? [this.extremeLightBulbGroup] : []), ...(this.realLightBulbGroup ? [this.realLightBulbGroup] : []), ...(this.seriesAmmeterGroup ? [this.seriesAmmeterGroup] : []), ...(this.acVoltageGroup ? [this.acVoltageGroup] : []), ...(this.capacitorGroup ? [this.capacitorGroup] : []), ...(this.inductorGroup ? [this.inductorGroup] : [])];
    this.dirty = false;
  }
  disposeCircuitElement(circuitElement) {
    this.circuitElements.remove(circuitElement);

    // Find the corresponding group that contains the circuitElement and dispose it.
    this.groups.forEach(group => group.includes(circuitElement) && group.disposeElement(circuitElement));
  }

  /**
   * Create a pair of vertices to be used for a new CircuitElement
   * @param position - the position of the center of the CircuitElement
   * @param length - the distance between the vertices
   * @returns with 2 elements
   */
  createVertexPairArray(position, length) {
    return [this.createVertex(position.plusXY(-length / 2, 0)), this.createVertex(position.plusXY(length / 2, 0))];
  }

  /**
   * Create a Vertex at the specified position, convenience function for creating the vertices for CircuitElements.
   * @param position - the position of the Vertex in view = model coordinates
   */
  createVertex(position) {
    return this.vertexGroup.createNextElement(position);
  }

  /**
   * When over Vertex is released or bumped over another Vertex, rotate one away so it doesn't appear connected.
   */
  moveVerticesApart(v1, v2) {
    const v1Neighbors = this.getNeighboringVertices(v1);
    const v2Neighbors = this.getNeighboringVertices(v2);

    // When vertex v1 is too close (but not connected) to v2, we choose vertex v3 as a reference point for moving
    // vertex v1 (or vice versa).
    if (v1Neighbors.length === 1 && !v1.blackBoxInterfaceProperty.get()) {
      this.bumpAwaySingleVertex(v1, v1Neighbors[0]); // Arbitrarily choose 0th neighbor to move away from
    } else if (v2Neighbors.length === 1 && !v2.blackBoxInterfaceProperty.get()) {
      this.bumpAwaySingleVertex(v2, v2Neighbors[0]); // Arbitrarily choose 0th neighbor to move away from
    }
  }

  // Update the position of all charges.
  relayoutAllCharges() {
    this.circuitElements.forEach(circuitElement => {
      circuitElement.chargeLayoutDirty = true;
    });
    this.layoutChargesInDirtyCircuitElements();
  }

  /**
   * When two Vertices are dropped/bumped too close together, move away the pre-existing one by rotating or
   * translating it.
   *
   * @param vertex - the vertex to rotate
   * @param pivotVertex - the vertex to rotate about
   */
  bumpAwaySingleVertex(vertex, pivotVertex) {
    const distance = vertex.positionProperty.value.distance(pivotVertex.positionProperty.value);

    // If the vertices are too close, they must be translated away
    if (distance < BUMP_AWAY_RADIUS) {
      let difference = pivotVertex.positionProperty.value.minus(vertex.positionProperty.value);

      // Support when vertex is on the pivot, mainly for fuzz testing.  In that case, just move directly to the right
      if (difference.magnitude === 0) {
        difference = new Vector2(1, 0);
      }
      const delta = difference.normalized().times(-SNAP_RADIUS * 1.5);
      this.translateVertexGroup(vertex, delta);
    } else {
      // Other vertices should be rotated away, which handles non-stretchy components well. For small components like
      // batteries (which are around 100 view units long), rotate Math.PI/4. Longer components don't need to rotate
      // by such a large angle because the arc length will be proportionately longer,
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/344
      const searchAngle = Math.PI / 4 * 100 / distance;
      this.rotateSingleVertexByAngle(vertex, pivotVertex, searchAngle);
      const distance1 = this.closestDistanceToOtherVertex(vertex);
      this.rotateSingleVertexByAngle(vertex, pivotVertex, -2 * searchAngle);
      const distance2 = this.closestDistanceToOtherVertex(vertex);
      assert && assert(distance1 !== null && distance2 !== null);
      if (distance2 <= distance1) {
        // go back to the best spot
        this.rotateSingleVertexByAngle(vertex, pivotVertex, 2 * searchAngle);
      }
    }
  }

  /**
   * Rotate the given Vertex about the specified Vertex by the given angle
   * @param vertex - the vertex which will be rotated
   * @param pivotVertex - the origin about which the vertex will rotate
   * @param deltaAngle - angle in radians to rotate
   */
  rotateSingleVertexByAngle(vertex, pivotVertex, deltaAngle) {
    const position = vertex.positionProperty.get();
    const pivotPosition = pivotVertex.positionProperty.get();
    const distanceFromVertex = position.distance(pivotPosition);
    const angle = position.minus(pivotPosition).angle;
    const newPosition = pivotPosition.plus(Vector2.createPolar(distanceFromVertex, angle + deltaAngle));
    vertex.unsnappedPositionProperty.set(newPosition);
    vertex.positionProperty.set(newPosition);
  }

  /**
   * Determine the distance to the closest Vertex
   * @param vertex
   * @returns - distance to nearest other Vertex in view coordinates
   */
  closestDistanceToOtherVertex(vertex) {
    let closestDistance = null;
    for (let i = 0; i < this.vertexGroup.count; i++) {
      const v = this.vertexGroup.getElement(i);
      if (v !== vertex) {
        const distance = v.positionProperty.get().distance(vertex.positionProperty.get());
        if (closestDistance === null || distance < closestDistance) {
          closestDistance = distance;
        }
      }
    }
    return closestDistance;
  }

  // Remove all elements from the circuit.
  clear() {
    this.selectionProperty.reset();

    // Vertices must be cleared from the black box screen--it's not handled by clearing the circuit elements
    if (this.blackBoxStudy) {
      // clear references, do not dispose because some items get added back in the black box.
      this.circuitElements.clear();

      // Only dispose vertices not attached to the black box
      const toDispose = this.vertexGroup.filter(vertex => !vertex.blackBoxInterfaceProperty.value);
      toDispose.forEach(vertex => this.vertexGroup.disposeElement(vertex));
      this.markDirty();
    } else {
      this.circuitElements.clear();
      this.groups.forEach(group => group.clear());
      this.vertexGroup.clear();
    }
  }

  /**
   * Split the Vertex into separate vertices.
   * @param vertex - the vertex to be cut.
   */
  cutVertex(vertex) {
    // Only permit cutting a non-dragged vertex, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
    if (vertex.isDragged) {
      return;
    }
    let neighborCircuitElements = this.getNeighborCircuitElements(vertex);
    if (neighborCircuitElements.length <= 1) {
      // No work necessary for an unattached vertex
      return;
    }

    // Only move interactive circuit elements
    neighborCircuitElements = neighborCircuitElements.filter(circuitElement => circuitElement.interactiveProperty.get());

    /**
     * Function that identifies where vertices would go if pulled toward their neighbors
     */
    const getTranslations = () => {
      return neighborCircuitElements.map(circuitElement => {
        const oppositePosition = circuitElement.getOppositeVertex(vertex).positionProperty.get();
        const position = vertex.positionProperty.get();
        let delta = oppositePosition.minus(position);

        // If the vertices were at the same position, move them randomly.  See https://github.com/phetsims/circuit-construction-kit-common/issues/405
        if (delta.magnitude === 0) {
          delta = Vector2.createPolar(1, dotRandom.nextDouble() * Math.PI * 2);
        }
        return delta.withMagnitude(30);
      });
    };

    // Track where they would go if they moved toward their opposite vertices
    let translations = getTranslations();
    let angles = translations.map(t => t.angle);
    if (neighborCircuitElements.length > 2) {
      // Reorder elements based on angle so they don't cross over when spread out
      neighborCircuitElements = _.sortBy(neighborCircuitElements, n => {
        const index = neighborCircuitElements.indexOf(n);
        return angles[index];
      });

      // Get the angles in the corrected order
      translations = getTranslations();
      angles = translations.map(t => t.angle);
    }
    const separation = Math.PI * 2 / neighborCircuitElements.length;
    let results = [];
    const centerAngle = _.sum(angles) / angles.length;

    // Move vertices away from cut vertex so that wires don't overlap
    if (neighborCircuitElements.length === 2) {
      const ax = Vector2.createPolar(30, centerAngle - separation / neighborCircuitElements.length);
      const bx = Vector2.createPolar(30, centerAngle + separation / neighborCircuitElements.length);
      const deltaAngle = angles[0] - centerAngle;
      results = deltaAngle < 0 ? [ax, bx] : [bx, ax];
    } else {
      const distance = neighborCircuitElements.length <= 5 ? 30 : neighborCircuitElements.length * 30 / 5;
      neighborCircuitElements.forEach((circuitElement, k) => {
        results.push(Vector2.createPolar(distance, separation * k + angles[0]));
      });
    }
    neighborCircuitElements.forEach((circuitElement, i) => {
      // Add the new vertex to the model first so that it can be updated in subsequent calls
      const newVertex = this.vertexGroup.createNextElement(vertex.positionProperty.get());
      circuitElement.replaceVertex(vertex, newVertex);

      // Bump the vertices away from the original vertex
      this.translateVertexGroup(newVertex, results[i]);
    });
    if (!vertex.blackBoxInterfaceProperty.get()) {
      this.vertexGroup.disposeElement(vertex);
    }
    this.markDirty();
  }

  /**
   * Translate all vertices connected to the mainVertex by FixedCircuitElements by the given distance
   *
   * Note: do not confuse this with CircuitNode.translateVertexGroup which proposes connections while dragging
   *
   * @param mainVertex - the vertex whose group will be translated
   * @param delta - the vector by which to move the vertex group
   */
  translateVertexGroup(mainVertex, delta) {
    const vertexArray = this.findAllFixedVertices(mainVertex);
    for (let j = 0; j < vertexArray.length; j++) {
      const vertex = vertexArray[j];

      // Only translate vertices that are movable and not connected to the black box interface by FixedLength elements
      if (vertex.isDraggableProperty.get() && !this.hasFixedConnectionToBlackBoxInterfaceVertex(vertex)) {
        vertex.setPosition(vertex.positionProperty.value.plus(delta));
      }
    }
  }

  /**
   * Returns true if the given vertex has a fixed connection to a black box interface vertex.
   */
  hasFixedConnectionToBlackBoxInterfaceVertex(vertex) {
    const fixedVertices = this.findAllFixedVertices(vertex);
    return _.some(fixedVertices, fixedVertex => fixedVertex.blackBoxInterfaceProperty.get());
  }

  /**
   * Returns true if the CircuitElement is not connected to any other CircuitElement.
   */
  isSingle(circuitElement) {
    return this.getNeighborCircuitElements(circuitElement.startVertexProperty.get()).length === 1 && this.getNeighborCircuitElements(circuitElement.endVertexProperty.get()).length === 1;
  }

  /**
   * When removing a CircuitElement, also remove its start/end Vertex if it can be removed.
   */
  removeVertexIfOrphaned(vertex) {
    if (this.getNeighborCircuitElements(vertex).length === 0 && !vertex.blackBoxInterfaceProperty.get() && !vertex.isDisposed) {
      this.vertexGroup.disposeElement(vertex);
    }
  }

  /**
   * Get all of the CircuitElements that contain the given Vertex.
   */
  getNeighborCircuitElements(vertex) {
    return this.circuitElements.filter(circuitElement => circuitElement.containsVertex(vertex));
  }

  /**
   * Get all of the CircuitElements that are connected to the given CircuitElement
   */
  getNeighborCircuitElementsForCircuitElement(element) {
    return [...this.getNeighborCircuitElements(element.startVertexProperty.value), ...this.getNeighborCircuitElements(element.endVertexProperty.value)].filter(el => {
      return el !== element;
    });
  }

  /**
   * Gets the number of CircuitElements connected to the specified Vertex
   */
  countCircuitElements(vertex) {
    return this.circuitElements.count(circuitElement => circuitElement.containsVertex(vertex));
  }

  /**
   * Gets the voltage between two points.  Computed in the view because view coordinates are used in the computation.
   * @param redConnection
   * @param blackConnection
   * @param revealing - whether the black box is in "reveal" model
   */
  getVoltageBetweenConnections(redConnection, blackConnection, revealing) {
    if (redConnection === null || blackConnection === null) {
      return null;
    } else if (!this.areVerticesElectricallyConnected(redConnection.vertex, blackConnection.vertex)) {
      // Voltmeter probes each hit things but they were not connected to each other through the circuit.
      return null;
    } else if (redConnection.vertex.insideTrueBlackBoxProperty.get() && !revealing) {
      // Cannot read values inside the black box, unless "reveal" is being pressed
      return null;
    } else if (blackConnection.vertex.insideTrueBlackBoxProperty.get() && !revealing) {
      // Cannot read values inside the black box, unless "reveal" is being pressed
      return null;
    } else {
      return redConnection.voltage - blackConnection.voltage;
    }
  }

  /**
   * Determines whether the specified Vertices are electrically connected through any arbitrary connections.  An
   * open switch breaks the connection.
   */
  areVerticesElectricallyConnected(vertex1, vertex2) {
    const connectedVertices = this.searchVertices(vertex1, (startVertex, circuitElement) => {
      // If the circuit element has a closed property (like a Switch), it is only OK to traverse if the element is
      // closed.
      if (circuitElement instanceof Switch) {
        return circuitElement.isClosedProperty.get();
      } else {
        // Everything else is traversible
        return true;
      }
    });
    return connectedVertices.includes(vertex2);
  }

  /**
   * When some physical characteristic has changed, we must recompute the voltages and currents.  Mark as
   * dirty and compute in step if anything has changed.
   */
  markDirty() {
    this.dirty = true;
  }

  // Connect the vertices, merging oldVertex into vertex1 and deleting oldVertex
  connect(targetVertex, oldVertex) {
    assert && assert(targetVertex.attachableProperty.get() && oldVertex.attachableProperty.get(), 'both vertices should be attachable');

    // Keep the black box vertices
    if (oldVertex.blackBoxInterfaceProperty.get()) {
      assert && assert(!targetVertex.blackBoxInterfaceProperty.get(), 'cannot attach black box interface vertex ' + 'to black box interface vertex');
      this.connect(oldVertex, targetVertex);
    } else {
      this.circuitElements.forEach(circuitElement => {
        if (circuitElement.containsVertex(oldVertex)) {
          circuitElement.replaceVertex(oldVertex, targetVertex);
          circuitElement.connectedEmitter.emit();
        }
      });

      // Inherit non-defaults

      // If either vertex was non-draggable, the resultant vertex should be non-draggable
      if (!oldVertex.isDraggableProperty.value) {
        targetVertex.isDraggableProperty.value = oldVertex.isDraggableProperty.value;
      }

      // If either vertex was non-cuttable, the resultant vertex should be non-cuttable
      if (!oldVertex.isCuttableProperty.value) {
        targetVertex.isCuttableProperty.value = oldVertex.isCuttableProperty.value;
      }

      // If the dragged vertex had no label, take the label of the replaced vertex
      if (targetVertex.labelStringProperty.value === '') {
        targetVertex.labelStringProperty.value = oldVertex.labelStringProperty.value;
      }
      this.vertexGroup.disposeElement(oldVertex);
      assert && assert(!oldVertex.positionProperty.hasListeners(), 'Removed vertex should not have any listeners');
      this.markDirty();

      // Make sure the solder is displayed in the correct z-order
      targetVertex.relayerEmitter.emit();
    }
  }

  /**
   * Move forward in time
   * @param dt - the elapsed time in seconds
   */
  step(dt) {
    // Invoke any scheduled actions
    this.stepActions.forEach(stepAction => stepAction());
    this.stepActions.length = 0;

    // Move forward time
    this.timeProperty.value += dt;
    const stepElements = this.circuitElements.filter(element => element.step);
    const dynamicElements = this.circuitElements.filter(element => element instanceof DynamicCircuitElement);
    stepElements.forEach(element => element.step(this.timeProperty.value, dt, this));
    if (this.dirty || stepElements.length > 0 || dynamicElements.length > 0) {
      LinearTransientAnalysis.solveModifiedNodalAnalysis(this, dt);
      this.dirty = false;

      // check the incoming and outgoing current to each inductor.  If it is all 0, then clear the inductor.
      const inductors = this.circuitElements.filter(element => element instanceof Inductor);
      inductors.forEach(inductor => {
        const hasCurrent = vertex => {
          const neighborsWithCurrent = this.getNeighborCircuitElements(vertex).filter(neighbor => neighbor !== inductor).filter(neighbor => Math.abs(neighbor.currentProperty.value) > 1E-4);
          return neighborsWithCurrent.length > 0;
        };
        if (!hasCurrent(inductor.startVertexProperty.value) && !hasCurrent(inductor.endVertexProperty.value)) {
          inductor.clear();
        }
      });
      this.circuitChangedEmitter.emit();
    }
    this.determineSenses();

    // Move the charges.  Do this after the circuit has been solved so the conventional current will have the correct
    // current values.
    this.chargeAnimator.step(dt);
  }

  /**
   * When a circuit element is marked as dirty (such as when it changed length or moved), it needs to have
   * the charges repositioned, so they will be equally spaced internally and spaced well compared to neighbor
   * elements.
   */
  layoutChargesInDirtyCircuitElements() {
    this.circuitElements.forEach(circuitElement => this.layoutCharges(circuitElement));
  }

  /**
   * Determine if one Vertex is adjacent to another Vertex.  The only way for two vertices to be adjacent is for them
   * to be the start/end of a single CircuitElement
   */
  isVertexAdjacent(a, b) {
    // A vertex cannot be adjacent to itself.
    if (a === b) {
      return false;
    }
    return this.circuitElements.some(circuitElement => circuitElement.containsBothVertices(a, b));
  }

  /**
   * Find the neighbor vertices within the given group of circuit elements
   * @param vertex
   * @param circuitElements - the group of CircuitElements within which to look for neighbors
   */
  getNeighborVerticesInGroup(vertex, circuitElements) {
    const neighbors = [];
    for (let i = 0; i < circuitElements.length; i++) {
      const circuitElement = circuitElements[i];
      if (circuitElement.containsVertex(vertex)) {
        neighbors.push(circuitElement.getOppositeVertex(vertex));
      }
    }
    return neighbors;
  }

  /**
   * Get an array of all the vertices adjacent to the specified Vertex.
   * @param vertex - the vertex to get neighbors for
   */
  getNeighboringVertices(vertex) {
    const neighborCircuitElements = this.getNeighborCircuitElements(vertex);
    return this.getNeighborVerticesInGroup(vertex, neighborCircuitElements);
  }

  /**
   * Marks all connected circuit elements as dirty (so electrons will be layed out again), called when any wire length is changed.
   */
  markAllConnectedCircuitElementsDirty(vertex) {
    const allConnectedVertices = this.findAllConnectedVertices(vertex);

    // This is called many times while dragging a wire vertex, so for loops (as opposed to functional style) are used
    // to avoid garbage
    for (let i = 0; i < allConnectedVertices.length; i++) {
      const neighborCircuitElements = this.getNeighborCircuitElements(allConnectedVertices[i]);
      for (let k = 0; k < neighborCircuitElements.length; k++) {
        // Note the same circuit element may be marked dirty twice, but this does not cause any problems.
        neighborCircuitElements[k].chargeLayoutDirty = true;
      }
    }
    this.dirty = true;
  }

  /**
   * Find the subgraph where all vertices are connected by any kind of CircuitElements
   */
  findAllConnectedVertices(vertex) {
    return this.searchVertices(vertex, trueFunction);
  }

  // Identify current senses for CurrentSense.UNSPECIFIED CircuitElements with a nonzero current
  determineSenses() {
    // Disconnected circuit elements forget their sense
    this.circuitElements.forEach(c => {
      if (c.currentProperty.value === 0.0) {
        c.currentSenseProperty.value = CurrentSense.UNSPECIFIED;
      }
    });

    // Filter based on whether CircuitElements have current beforehand, currents cannot change in this loop
    const circuitElementsWithCurrent = this.circuitElements.filter(c => c.currentProperty.value !== 0);

    // After assigning a sense, revisit the circuit to propagate senses.  Break out of the loop when no more work can be done
    while (true) {
      // eslint-disable-line no-constant-condition

      const requiresSenseBeforeVisit = circuitElementsWithCurrent.filter(c => c.currentSenseProperty.value === CurrentSense.UNSPECIFIED);
      if (requiresSenseBeforeVisit.length === 0) {
        break;
      }

      // Propagate known senses to new circuit elements.
      this.propagateSenses();
      const requiresSenseAfterVisit = circuitElementsWithCurrent.filter(c => c.currentSenseProperty.value === CurrentSense.UNSPECIFIED);
      if (requiresSenseAfterVisit.length === 0) {
        break;
      }
      let wasSenseAssigned = false;

      // Match AC Sources so they are in phase
      const unspecifiedACSources = requiresSenseAfterVisit.filter(r => r instanceof ACVoltage);
      if (unspecifiedACSources.length > 0) {
        const unspecifiedACSource = unspecifiedACSources[0];
        const referenceElements = this.circuitElements.filter(c => c instanceof ACVoltage && c.currentSenseProperty.value !== CurrentSense.UNSPECIFIED && c !== unspecifiedACSource);
        if (referenceElements.length > 0) {
          Circuit.assignSense(unspecifiedACSource, referenceElements[0]);
          wasSenseAssigned = true;

          // Run the next iteration of the loop, which will search out from the newly marked node
          // TODO (AC): Only search from the newly marked node?
        }
      }

      if (!wasSenseAssigned) {
        // Choose the circuit element with the smallest number of neighbors, ie favoring series elements
        requiresSenseAfterVisit.sort((a, b) => {
          return this.getNeighborCircuitElementsForCircuitElement(a).length - this.getNeighborCircuitElementsForCircuitElement(b).length;
        });
        const targetElement = requiresSenseAfterVisit[0];
        targetElement.currentSenseProperty.value = getSenseForPositive(targetElement.currentProperty.value);
        wasSenseAssigned = true;
      }
    }
  }

  // Assign the sense to an un-sensed circuit element based on matching the sign of a corresponding reference element.
  static assignSense(targetElement, referenceElement) {
    assert && assert(targetElement.currentSenseProperty.value === CurrentSense.UNSPECIFIED, 'target should have an unspecified sense');
    const targetElementCurrent = targetElement.currentProperty.value;
    const referenceElementCurrent = referenceElement.currentProperty.value;
    const referenceElementSense = referenceElement.currentSenseProperty.value;
    const desiredSign = referenceElementCurrent >= 0 && referenceElementSense === CurrentSense.FORWARD ? 'positive' : referenceElementCurrent >= 0 && referenceElementSense === CurrentSense.BACKWARD ? 'negative' : referenceElementCurrent < 0 && referenceElementSense === CurrentSense.FORWARD ? 'negative' : referenceElementCurrent < 0 && referenceElementSense === CurrentSense.BACKWARD ? 'positive' : 'error';
    assert && assert(desiredSign !== 'error');
    targetElement.currentSenseProperty.value = desiredSign === 'positive' ? getSenseForPositive(targetElementCurrent) : getSenseForNegative(targetElementCurrent);
  }

  // Traverse the circuit, filling in senses to adjacent circuit elements during the traversal
  propagateSenses() {
    const circuitElementsWithSenses = this.circuitElements.filter(c => c.currentSenseProperty.value !== CurrentSense.UNSPECIFIED);
    if (circuitElementsWithSenses.length > 0) {
      // launch searches from circuit elements with known senses
      const toVisit = [];
      circuitElementsWithSenses.forEach(c => {
        if (!toVisit.includes(c.startVertexProperty.value)) {
          toVisit.push(c.startVertexProperty.value);
        }
        if (!toVisit.includes(c.endVertexProperty.value)) {
          toVisit.push(c.endVertexProperty.value);
        }
      });
      const visited = [];
      while (toVisit.length > 0) {
        const vertex = toVisit.pop();
        if (!visited.includes(vertex)) {
          const neighborCircuitElements = this.getNeighborCircuitElements(vertex);
          for (let i = 0; i < neighborCircuitElements.length; i++) {
            const circuitElement = neighborCircuitElements[i];
            const neighborVertex = circuitElement.getOppositeVertex(vertex);
            if (circuitElement.currentSenseProperty.value === CurrentSense.UNSPECIFIED && circuitElement.currentProperty.value !== 0.0) {
              // choose sense from a neighbor. We discussed that we may need to be more selective in choosing the reference
              // neighbor, such as choosing the high voltage side's highest voltage neighbor.  However, we didn't see a
              // case where that was necessary yet.
              const specifiedNeighbors = neighborCircuitElements.filter(c => c !== circuitElement && c.currentSenseProperty.value !== CurrentSense.UNSPECIFIED);
              if (specifiedNeighbors.length > 0) {
                Circuit.assignSense(circuitElement, specifiedNeighbors[0]);
              }
            }
            if (!visited.includes(neighborVertex) && !toVisit.includes(neighborVertex)) {
              toVisit.push(neighborVertex);
            }
          }
          visited.push(vertex);
        }
      }
    }
  }

  /**
   * Find the subgraph where all vertices are connected, given the list of traversible circuit elements.
   * There are a few other ad-hoc graph searches around, such as isInLoop and in LinearTransientAnalysis
   * @param vertex
   * @param okToVisit - (startVertex:Vertex,circuitElement:CircuitElement,endVertex:Vertex)=>boolean, rule
   *                             - that determines which vertices are OK to visit
   */
  searchVertices(vertex, okToVisit) {
    const fixedVertices = [];
    const toVisit = [vertex];
    const visited = [];
    while (toVisit.length > 0) {
      // Find the neighbors joined by a FixedCircuitElement, not a stretchy Wire
      const currentVertex = toVisit.pop();

      // If we haven't visited it before, then explore it
      if (!visited.includes(currentVertex)) {
        const neighborCircuitElements = this.getNeighborCircuitElements(currentVertex);
        for (let i = 0; i < neighborCircuitElements.length; i++) {
          const neighborCircuitElement = neighborCircuitElements[i];
          const neighborVertex = neighborCircuitElement.getOppositeVertex(currentVertex);

          // If the node was already visited, don't visit again
          if (!visited.includes(neighborVertex) && !toVisit.includes(neighborVertex) && okToVisit(currentVertex, neighborCircuitElement, neighborVertex)) {
            toVisit.push(neighborVertex);
          }
        }
      }
      fixedVertices.push(currentVertex); // Allow duplicates, will be _.uniq before return

      // O(n^2) to search for duplicates as we go, if this becomes a performance bottleneck we may wish to find a better
      // way to deduplicate, perhaps Set or something like that
      if (!visited.includes(currentVertex)) {
        visited.push(currentVertex);
      }
    }
    return _.uniq(fixedVertices);
  }

  // Returns true if the circuit element is in a loop with a voltage source
  isInLoop(circuitElement) {
    // Special case for when we are asking if an open Switch is in a loop.  Open switches
    // cannot be in a loop since their vertices are not directly connected.  Note the search
    // algorithm below gives the wrong answer because the start vertex and end vertex can be connected
    // by other circuit elements.
    if (circuitElement instanceof Switch && !circuitElement.isClosedProperty.value) {
      return false;
    }

    // procedure DFS_iterative(G, v) is
    // let S be a stack
    // S.push(v)
    // while S is not empty do
    //   v = S.pop()
    //   if v is not labeled as discovered then
    //     label v as discovered
    //     for all edges from v to w in G.adjacentEdges(v) do
    //       S.push(w)

    // Iterative (not recursive) depth first search, so we can bail on a hit, see https://en.wikipedia.org/wiki/Depth-first_search
    const stack = [];
    const visited = [];
    stack.push(circuitElement.startVertexProperty.value);
    while (stack.length > 0) {
      const vertex = stack.pop();
      if (!visited.includes(vertex)) {
        visited.push(vertex);
        for (let i = 0; i < this.circuitElements.length; i++) {
          const neighbor = this.circuitElements[i];
          if (neighbor.containsVertex(vertex) &&
          // no shortcuts!
          neighbor !== circuitElement &&
          // can't cross an open switch
          !(neighbor instanceof Switch && !neighbor.isClosedProperty.value)) {
            const opposite = neighbor.getOppositeVertex(vertex);
            if (opposite === circuitElement.endVertexProperty.value) {
              // Hooray, we found a loop!
              return true;
            }
            stack.push(opposite);
          }
        }
      }
    }
    return false;
  }

  /**
   * Get the charges that are in the specified circuit element.
   */
  getChargesInCircuitElement(circuitElement) {
    return this.charges.filter(charge => charge.circuitElement === circuitElement);
  }

  /**
   * Find the subgraph where all vertices are connected by FixedCircuitElements, not stretchy wires.
   * @param vertex
   * @param [okToVisit] - (startVertex:Vertex,circuitElement:CircuitElement,endVertex:Vertex)=>boolean,
   *                               - rule that determines which vertices are OK to visit
   */
  findAllFixedVertices(vertex, okToVisit = e => true) {
    return this.searchVertices(vertex, (startVertex, circuitElement, endVertex) => {
      if (okToVisit) {
        return circuitElement instanceof FixedCircuitElement && okToVisit(startVertex, circuitElement, endVertex);
      } else {
        return circuitElement instanceof FixedCircuitElement;
      }
    });
  }

  // Returns the selected Vertex or null if none is selected
  getSelectedVertex() {
    const selection = this.selectionProperty.value;
    if (selection instanceof Vertex) {
      return selection;
    } else {
      return null;
    }
  }

  /**
   * A vertex has been dragged, is it a candidate for joining with other vertices?  If so, return the candidate
   * vertex.  Otherwise, return null.
   * @param vertex - the dragged vertex
   * @param mode - the application mode Circuit.InteractionMode.TEST | Circuit.InteractionMode.EXPLORE
   * @param blackBoxBounds - the bounds of the black box, if there is one
   * @returns - the vertex it will be able to connect to, if dropped or null if no connection is available
   */
  getDropTarget(vertex, mode, blackBoxBounds) {
    if (mode === InteractionMode.TEST) {
      assert && assert(blackBoxBounds, 'bounds should be provided for build mode');
    }

    // Rules for a vertex connecting to another vertex.
    let candidateVertices = this.vertexGroup.filter(candidateVertex => {
      // (1) A vertex may not connect to an adjacent vertex.
      if (this.isVertexAdjacent(vertex, candidateVertex)) {
        return false;
      }

      // (2) A vertex cannot connect to itself
      if (candidateVertex === vertex) {
        return false;
      }

      // (2.5) cannot connect to something that is dragging
      if (candidateVertex.isDragged) {
        return false;
      }

      // (3) a vertex must be within SNAP_RADIUS (screen coordinates) of the other vertex
      if (!(vertex.unsnappedPositionProperty.get().distance(candidateVertex.positionProperty.get()) < SNAP_RADIUS)) {
        return false;
      }

      // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      if (!candidateVertex.attachableProperty.get()) {
        return false;
      }

      // (5) Reject any matches that result in circuit elements sharing a pair of vertices, which would cause
      // the wires to lay across one another (one vertex was already shared)

      // if something else is already snapping to candidateVertex, then we cannot snap to it as well.
      // check the neighbor vertices
      for (let i = 0; i < this.vertexGroup.count; i++) {
        const circuitVertex = this.vertexGroup.getElement(i);
        const adjacent = this.isVertexAdjacent(circuitVertex, vertex);

        // If the adjacent vertex has the same position as the candidate vertex, that means it is already "snapped"
        // there and hence another vertex should not snap there at the same time.
        if (adjacent && circuitVertex.positionProperty.get().equals(candidateVertex.positionProperty.get())) {
          return false;
        }
      }
      const fixedVertices = this.findAllFixedVertices(vertex);

      // (6) a vertex cannot be connected to its own fixed subgraph (no wire)
      for (let i = 0; i < fixedVertices.length; i++) {
        if (fixedVertices[i] === candidateVertex) {
          return false;
        }
      }

      // (7) a wire vertex cannot connect if its neighbor is already proposing a connection
      // You can always attach to a black box interface
      if (!candidateVertex.blackBoxInterfaceProperty.get()) {
        const neighbors = this.getNeighborCircuitElements(candidateVertex);
        for (let i = 0; i < neighbors.length; i++) {
          const neighbor = neighbors[i];
          const oppositeVertex = neighbor.getOppositeVertex(candidateVertex);

          // is another node proposing a match to that node?
          for (let k = 0; k < this.vertexGroup.count; k++) {
            const v = this.vertexGroup.getElement(k);
            if (neighbor instanceof Wire && v !== vertex && v !== oppositeVertex && v.positionProperty.get().equals(oppositeVertex.positionProperty.get()) && v.isDragged) {
              return false;
            }
          }
        }
      }

      // (8) a wire vertex cannot double connect to an object, creating a tiny short circuit
      const candidateNeighbors = this.getNeighboringVertices(candidateVertex);
      const myNeighbors = this.getNeighboringVertices(vertex);
      const intersection = _.intersection(candidateNeighbors, myNeighbors);
      if (intersection.length !== 0) {
        return false;
      }

      // All tests passed, it's OK for connection
      return true;
    });

    // TODO (black-box-study): integrate rule (9) with the other rules above
    // (9) When in Black Box "build" mode (i.e. building inside the black box), a vertex user cannot connect to
    // a black box interface vertex if its other vertices would be outside of the black box.  See #136
    if (mode === InteractionMode.TEST) {
      const boxBounds = blackBoxBounds;
      const fixedVertices2 = this.findAllFixedVertices(vertex);
      candidateVertices = candidateVertices.filter(candidateVertex => {
        // Don't connect to vertices that might have sneaked outside of the black box, say by a rotation.
        if (!candidateVertex.blackBoxInterfaceProperty.get() && !boxBounds.containsPoint(candidateVertex.positionProperty.get())) {
          return false;
        }

        // How far the vertex would be moved if it joined to the candidate
        const delta = candidateVertex.positionProperty.get().minus(vertex.positionProperty.get());
        if (candidateVertex.blackBoxInterfaceProperty.get() || boxBounds.containsPoint(candidateVertex.positionProperty.get())) {
          for (let i = 0; i < fixedVertices2.length; i++) {
            const connectedVertex = fixedVertices2[i];
            if (connectedVertex.blackBoxInterfaceProperty.get()) {

              // OK for black box interface vertex to be slightly outside the box
            } else if (connectedVertex !== vertex && !boxBounds.containsPoint(connectedVertex.positionProperty.get().plus(delta)) &&
            // exempt wires connected outside of the black box, which are flagged as un-attachable in build mode, see #141
            connectedVertex.attachableProperty.get()) {
              return false;
            }
          }
        } else {
          return true;
        }
        return true;
      });

      // a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      candidateVertices = candidateVertices.filter(candidateVertex => !candidateVertex.outerWireStub);
    }
    if (candidateVertices.length === 0) {
      return null;
    }

    // Find the closest match
    const sorted = _.sortBy(candidateVertices, candidateVertex => vertex.unsnappedPositionProperty.get().distance(candidateVertex.positionProperty.get()));
    return sorted[0];
  }

  // A reporting tool to indicate whether current is conserved at each vertex
  checkCurrentConservation(index) {
    console.log('####### ' + index);
    // the sum of currents flowing into the vertex should be 0
    this.vertexGroup.forEach(vertex => {
      const neighbors = this.getNeighborCircuitElements(vertex);
      let sum = 0;
      neighbors.forEach(neighbor => {
        const sign = neighbor.startVertexProperty.value === vertex ? +1 : -1;
        const current = sign * neighbor.currentProperty.value;
        sum += current;
      });
      console.log(`${vertex.index}: ${sum}`);
    });
  }

  /**
   * Due to numerical floating point errors, current may not be exactly conserved.  But we don't want to show electrons
   * moving in some part of a loop but not others, so we manually enforce current conservation at each vertex.
   */
  conserveCurrent(vertex, locked) {
    // the sum of currents flowing into the vertex should be 0
    const neighbors = this.getNeighborCircuitElements(vertex);
    let sum = 0;
    neighbors.forEach(neighbor => {
      const sign = neighbor.startVertexProperty.value === vertex ? +1 : -1;
      const current = sign * neighbor.currentProperty.value;
      sum += current;
    });

    // If the amount of unconserved current is too high, then try to adjust other currents to compensate
    if (Math.abs(sum) > 1E-10) {
      // divide the problem to all mutable (participant), non-locked neighbors
      const unlockedNeighbors = neighbors.filter(n => !locked.includes(n));
      const overflow = sum / unlockedNeighbors.length;
      unlockedNeighbors.forEach(neighbor => {
        const sign = neighbor.startVertexProperty.value === vertex ? +1 : -1;
        neighbor.currentProperty.value += -sign * overflow;
        locked.push(neighbor);
      });
    }
  }

  /**
   * Flip the given CircuitElement
   * @param circuitElement - the circuit element to flip
   */
  flip(circuitElement) {
    const startVertex = circuitElement.startVertexProperty.value;
    const endVertex = circuitElement.endVertexProperty.value;
    circuitElement.startVertexProperty.value = endVertex;
    circuitElement.endVertexProperty.value = startVertex;
    const flipped = circuitElement.currentSenseProperty.value === CurrentSense.FORWARD ? CurrentSense.BACKWARD : circuitElement.currentSenseProperty.value === CurrentSense.BACKWARD ? CurrentSense.FORWARD : CurrentSense.UNSPECIFIED;
    circuitElement.currentSenseProperty.value = flipped;

    // Layout the charges in the circuitElement but nowhere else, since that creates a discontinuity in the motion
    circuitElement.chargeLayoutDirty = true;
    this.layoutChargesInDirtyCircuitElements();
    this.markDirty();
  }

  /**
   * Creates and positions charges in the specified circuit element.
   * @param circuitElement - the circuit element within which the charges will be updated
   */
  layoutCharges(circuitElement) {
    // Avoid unnecessary work to improve performance
    if (circuitElement.chargeLayoutDirty) {
      circuitElement.chargeLayoutDirty = false;

      // Identify charges that were already in the branch.
      const charges = this.getChargesInCircuitElement(circuitElement);

      // put charges 1/2 separation from the edge so it will match up with adjacent components
      const offset = CCKCConstants.CHARGE_SEPARATION / 2;
      const lastChargePosition = circuitElement.chargePathLength - offset;
      const firstChargePosition = offset;
      const lengthForCharges = lastChargePosition - firstChargePosition;

      // Utils.roundSymmetric leads to charges too far apart when N=2
      const numberOfCharges = Math.ceil(lengthForCharges / CCKCConstants.CHARGE_SEPARATION);

      // compute distance between adjacent charges
      const spacing = lengthForCharges / (numberOfCharges - 1);
      for (let i = 0; i < numberOfCharges; i++) {
        // If there is a single particle, show it in the middle of the component, otherwise space equally
        const chargePosition = numberOfCharges === 1 ? (firstChargePosition + lastChargePosition) / 2 : i * spacing + offset;
        const desiredCharge = this.currentTypeProperty.get() === CurrentType.ELECTRONS ? -1 : +1;
        if (charges.length > 0 && charges[0].charge === desiredCharge && charges[0].circuitElement === circuitElement && charges[0].visibleProperty === this.showCurrentProperty) {
          const c = charges.shift(); // remove 1st element, since it's the charge we checked in the guard
          c.circuitElement = circuitElement;
          c.distance = chargePosition;
          c.updatePositionAndAngle();
        } else {
          // nothing suitable in the pool, create something new
          const charge = new Charge(circuitElement, chargePosition, this.showCurrentProperty, desiredCharge);
          this.charges.add(charge);
        }
      }

      // Any charges that did not get recycled should be removed
      this.charges.removeAll(charges);
    }
  }

  // only works in unbuilt mode
  toString() {
    return this.circuitElements.map(c => c.constructor.name).join(', ');
  }

  /**
   * Reset the Circuit to its initial state.
   */
  reset() {
    this.clear();
    this.showCurrentProperty.reset();
    this.currentTypeProperty.reset();
    this.wireResistivityProperty.reset();
    this.sourceResistanceProperty.reset();
    this.chargeAnimator.reset();
    this.selectionProperty.reset();
  }
}
const CircuitStateIO = new IOType('CircuitStateIO', {
  valueType: Circuit,
  methods: {
    getValue: {
      returnType: ObjectLiteralIO,
      parameterTypes: [],
      implementation: function () {
        return phet.phetio.phetioEngine.phetioStateEngine.getState(this);
      },
      documentation: 'Gets the current value of the circuit on this screen.'
    },
    getValidationError: {
      returnType: NullableIO(StringIO),
      parameterTypes: [ObjectLiteralIO],
      implementation: function (value) {
        // check if the specified circuit corresponds to this.tandemID. To avoid pasting a circuit from screen1 into screen2
        const keys = Array.from(Object.keys(value));
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (!key.startsWith(this.phetioID)) {
            return 'key had incorrect prefix. Expected: ' + this.phetioID + ' but got: ' + key;
          }
        }
        return null;
      },
      documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
    },
    setValue: {
      returnType: VoidIO,
      parameterTypes: [ObjectLiteralIO],
      documentation: 'Sets the circuit that was created on this screen. Trying to set a circuit from another screen results in an error.',
      implementation: function (state) {
        phet.phetio.phetioEngine.phetioStateEngine.setState(state, this.tandem);
      }
    }
  }
});
circuitConstructionKitCommon.register('Circuit', Circuit);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlZlY3RvcjIiLCJQaGV0aW9Hcm91cCIsIk51bGxhYmxlSU8iLCJSZWZlcmVuY2VJTyIsIkNDS0NDb25zdGFudHMiLCJDQ0tDUXVlcnlQYXJhbWV0ZXJzIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkFDVm9sdGFnZSIsIkJhdHRlcnkiLCJDYXBhY2l0b3IiLCJDaGFyZ2UiLCJDaGFyZ2VBbmltYXRvciIsIkNpcmN1aXRFbGVtZW50IiwiQ3VycmVudFR5cGUiLCJEeW5hbWljQ2lyY3VpdEVsZW1lbnQiLCJGaXhlZENpcmN1aXRFbGVtZW50IiwiRnVzZSIsIkluZHVjdG9yIiwiTGlnaHRCdWxiIiwiTGluZWFyVHJhbnNpZW50QW5hbHlzaXMiLCJSZXNpc3RvciIsIlNlcmllc0FtbWV0ZXIiLCJTd2l0Y2giLCJWZXJ0ZXgiLCJXaXJlIiwiVGFuZGVtIiwiUmVzaXN0b3JUeXBlIiwiSW50ZXJhY3Rpb25Nb2RlIiwiQ3VycmVudFNlbnNlIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk9ySU8iLCJJT1R5cGUiLCJTdHJpbmdJTyIsIlZvaWRJTyIsIlBoZXRpb09iamVjdCIsIk9iamVjdExpdGVyYWxJTyIsIlNOQVBfUkFESVVTIiwiQlVNUF9BV0FZX1JBRElVUyIsIkJBVFRFUllfTEVOR1RIIiwiV0lSRV9MRU5HVEgiLCJnZXRTZW5zZUZvclBvc2l0aXZlIiwiY3VycmVudCIsIkJBQ0tXQVJEIiwiRk9SV0FSRCIsIlVOU1BFQ0lGSUVEIiwiZ2V0U2Vuc2VGb3JOZWdhdGl2ZSIsInRydWVGdW5jdGlvbiIsIl8iLCJjb25zdGFudCIsIkNpcmN1aXQiLCJjb25zdHJ1Y3RvciIsInZpZXdUeXBlUHJvcGVydHkiLCJhZGRSZWFsQnVsYnNQcm9wZXJ0eSIsInRhbmRlbSIsInByb3ZpZGVkT3B0aW9ucyIsInBoZXRpb1R5cGUiLCJDaXJjdWl0U3RhdGVJTyIsInBoZXRpb1N0YXRlIiwib3B0aW9ucyIsImluY2x1ZGVBQ0VsZW1lbnRzIiwiaW5jbHVkZUxhYkVsZW1lbnRzIiwiYmxhY2tCb3hTdHVkeSIsIndpcmVSZXNpc3Rpdml0eVByb3BlcnR5IiwiV0lSRV9SRVNJU1RJVklUWV9SQU5HRSIsIm1pbiIsInBhcmVudFRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInJhbmdlIiwicGhldGlvRmVhdHVyZWQiLCJzb3VyY2VSZXNpc3RhbmNlUHJvcGVydHkiLCJERUZBVUxUX0JBVFRFUllfUkVTSVNUQU5DRSIsIkJBVFRFUllfUkVTSVNUQU5DRV9SQU5HRSIsImNpcmN1aXRFbGVtZW50cyIsIk9ic2VydmFibGVBcnJheUlPIiwiQ2lyY3VpdEVsZW1lbnRJTyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJjaGFyZ2VzIiwiY3VycmVudFR5cGVQcm9wZXJ0eSIsImN1cnJlbnRUeXBlIiwiRUxFQ1RST05TIiwiQ09OVkVOVElPTkFMIiwibGF6eUxpbmsiLCJyZWxheW91dEFsbENoYXJnZXMiLCJzaG93Q3VycmVudFByb3BlcnR5Iiwic2hvd0N1cnJlbnQiLCJ0aW1lUHJvcGVydHkiLCJjaGFyZ2VBbmltYXRvciIsIm1hcmtEaXJ0eUxpc3RlbmVyIiwibWFya0RpcnR5IiwiYmluZCIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiY2lyY3VpdEVsZW1lbnQiLCJnZXRDaXJjdWl0UHJvcGVydGllcyIsImZvckVhY2giLCJwcm9wZXJ0eSIsImNsZWFyRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZUVtaXR0ZXJDaXJjdWl0RWxlbWVudCIsInJlbW92ZUxpc3RlbmVyIiwiY2hhcmdlTGF5b3V0RGlydHkiLCJ1cGRhdGVDaGFyZ2VzIiwibWFya0FsbENvbm5lY3RlZENpcmN1aXRFbGVtZW50c0RpcnR5Iiwic3RhcnRWZXJ0ZXhQcm9wZXJ0eSIsImdldCIsImxlbmd0aFByb3BlcnR5IiwibGluayIsInVubGluayIsImN1cnJlbnRTZW5zZVByb3BlcnR5IiwiZW1pdENpcmN1aXRDaGFuZ2VkIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsInJlbW92ZVZlcnRleElmT3JwaGFuZWQiLCJlbmRWZXJ0ZXhQcm9wZXJ0eSIsInNlbGVjdGlvblByb3BlcnR5IiwidmFsdWUiLCJyZW1vdmVBbGwiLCJnZXRDaGFyZ2VzSW5DaXJjdWl0RWxlbWVudCIsImNoYXJnZSIsImRpc3Bvc2UiLCJjaXJjdWl0Q2hhbmdlZEVtaXR0ZXIiLCJ2ZXJ0ZXhEcm9wcGVkRW1pdHRlciIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJjb21wb25lbnRFZGl0ZWRFbWl0dGVyIiwicGhldGlvVmFsdWVUeXBlIiwiVmVydGV4SU8iLCJkaXJ0eSIsImVtaXQiLCJ2ZXJ0ZXhHcm91cCIsInBvc2l0aW9uIiwiUGhldGlvR3JvdXBJTyIsImVsZW1lbnRDcmVhdGVkRW1pdHRlciIsInZlcnRleCIsInBvc2l0aW9uUHJvcGVydHkiLCJmaWx0ZXJlZCIsImZpbHRlciIsImNhbmRpZGF0ZVZlcnRleCIsImFzc2VydCIsImxlbmd0aCIsInN0ZXBBY3Rpb25zIiwicHVzaCIsIm5laWdoYm9ycyIsImdldE5laWdoYm9yaW5nVmVydGljZXMiLCJwYWlycyIsIm5laWdoYm9yIiwidjEiLCJ2MiIsImRpc3RhbmNlIiwicGFpciIsInVuc25hcHBlZFBvc2l0aW9uUHJvcGVydHkiLCJtaW5QYWlyIiwibWluQnkiLCJtaW5EaXN0YW5jZSIsImlzRHJhZ2dlZCIsIm1vdmVWZXJ0aWNlc0FwYXJ0IiwiY3JlYXRlVmVydGljZXMiLCJzdGFydFBvc2l0aW9uIiwicGx1c1hZIiwid2lyZUdyb3VwIiwic3RhcnRWZXJ0ZXgiLCJlbmRWZXJ0ZXgiLCJiYXR0ZXJ5R3JvdXAiLCJpbmNsdWRlRXh0cmVtZUVsZW1lbnRzIiwiZXh0cmVtZUJhdHRlcnlHcm91cCIsInZvbHRhZ2UiLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJISUdIX1ZPTFRBR0VfREVDSU1BTF9QTEFDRVMiLCJwaGV0aW9EeW5hbWljRWxlbWVudE5hbWUiLCJhY1ZvbHRhZ2VHcm91cCIsIkFDX1ZPTFRBR0VfTEVOR1RIIiwicmVzaXN0b3JHcm91cCIsIlJFU0lTVE9SIiwiUmVzaXN0b3JJTyIsImV4dHJlbWVSZXNpc3Rvckdyb3VwIiwiRVhUUkVNRV9SRVNJU1RPUiIsImhvdXNlaG9sZE9iamVjdEdyb3VwIiwicmVzaXN0b3JUeXBlIiwiQ09JTiIsImZ1c2VHcm91cCIsIkZVU0VfTEVOR1RIIiwic2VyaWVzQW1tZXRlckdyb3VwIiwiU0VSSUVTX0FNTUVURVJfTEVOR1RIIiwiZXh0cmVtZUxpZ2h0QnVsYkdyb3VwIiwiY3JlYXRlQXRQb3NpdGlvbiIsIkhJR0hfUkVTSVNUQU5DRSIsImlzRXh0cmVtZSIsImNhcGFjaXRvckdyb3VwIiwiQ0FQQUNJVE9SX0xFTkdUSCIsImluZHVjdG9yR3JvdXAiLCJJTkRVQ1RPUl9MRU5HVEgiLCJzd2l0Y2hHcm91cCIsIlNXSVRDSF9MRU5HVEgiLCJsaWdodEJ1bGJHcm91cCIsIkRFRkFVTFRfUkVTSVNUQU5DRSIsInJlYWxMaWdodEJ1bGJHcm91cCIsImlzUmVhbCIsImlzRWRpdGFibGVQcm9wZXJ0eU9wdGlvbnMiLCJPUFRfT1VUIiwiZ3JvdXBzIiwiZGlzcG9zZUNpcmN1aXRFbGVtZW50IiwicmVtb3ZlIiwiZ3JvdXAiLCJpbmNsdWRlcyIsImRpc3Bvc2VFbGVtZW50IiwiY3JlYXRlVmVydGV4UGFpckFycmF5IiwiY3JlYXRlVmVydGV4IiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJ2MU5laWdoYm9ycyIsInYyTmVpZ2hib3JzIiwiYmxhY2tCb3hJbnRlcmZhY2VQcm9wZXJ0eSIsImJ1bXBBd2F5U2luZ2xlVmVydGV4IiwibGF5b3V0Q2hhcmdlc0luRGlydHlDaXJjdWl0RWxlbWVudHMiLCJwaXZvdFZlcnRleCIsImRpZmZlcmVuY2UiLCJtaW51cyIsIm1hZ25pdHVkZSIsImRlbHRhIiwibm9ybWFsaXplZCIsInRpbWVzIiwidHJhbnNsYXRlVmVydGV4R3JvdXAiLCJzZWFyY2hBbmdsZSIsIk1hdGgiLCJQSSIsInJvdGF0ZVNpbmdsZVZlcnRleEJ5QW5nbGUiLCJkaXN0YW5jZTEiLCJjbG9zZXN0RGlzdGFuY2VUb090aGVyVmVydGV4IiwiZGlzdGFuY2UyIiwiZGVsdGFBbmdsZSIsInBpdm90UG9zaXRpb24iLCJkaXN0YW5jZUZyb21WZXJ0ZXgiLCJhbmdsZSIsIm5ld1Bvc2l0aW9uIiwicGx1cyIsImNyZWF0ZVBvbGFyIiwic2V0IiwiY2xvc2VzdERpc3RhbmNlIiwiaSIsImNvdW50IiwidiIsImdldEVsZW1lbnQiLCJjbGVhciIsInJlc2V0IiwidG9EaXNwb3NlIiwiY3V0VmVydGV4IiwibmVpZ2hib3JDaXJjdWl0RWxlbWVudHMiLCJnZXROZWlnaGJvckNpcmN1aXRFbGVtZW50cyIsImludGVyYWN0aXZlUHJvcGVydHkiLCJnZXRUcmFuc2xhdGlvbnMiLCJtYXAiLCJvcHBvc2l0ZVBvc2l0aW9uIiwiZ2V0T3Bwb3NpdGVWZXJ0ZXgiLCJuZXh0RG91YmxlIiwid2l0aE1hZ25pdHVkZSIsInRyYW5zbGF0aW9ucyIsImFuZ2xlcyIsInQiLCJzb3J0QnkiLCJuIiwiaW5kZXgiLCJpbmRleE9mIiwic2VwYXJhdGlvbiIsInJlc3VsdHMiLCJjZW50ZXJBbmdsZSIsInN1bSIsImF4IiwiYngiLCJrIiwibmV3VmVydGV4IiwicmVwbGFjZVZlcnRleCIsIm1haW5WZXJ0ZXgiLCJ2ZXJ0ZXhBcnJheSIsImZpbmRBbGxGaXhlZFZlcnRpY2VzIiwiaiIsImlzRHJhZ2dhYmxlUHJvcGVydHkiLCJoYXNGaXhlZENvbm5lY3Rpb25Ub0JsYWNrQm94SW50ZXJmYWNlVmVydGV4Iiwic2V0UG9zaXRpb24iLCJmaXhlZFZlcnRpY2VzIiwic29tZSIsImZpeGVkVmVydGV4IiwiaXNTaW5nbGUiLCJpc0Rpc3Bvc2VkIiwiY29udGFpbnNWZXJ0ZXgiLCJnZXROZWlnaGJvckNpcmN1aXRFbGVtZW50c0ZvckNpcmN1aXRFbGVtZW50IiwiZWxlbWVudCIsImVsIiwiY291bnRDaXJjdWl0RWxlbWVudHMiLCJnZXRWb2x0YWdlQmV0d2VlbkNvbm5lY3Rpb25zIiwicmVkQ29ubmVjdGlvbiIsImJsYWNrQ29ubmVjdGlvbiIsInJldmVhbGluZyIsImFyZVZlcnRpY2VzRWxlY3RyaWNhbGx5Q29ubmVjdGVkIiwiaW5zaWRlVHJ1ZUJsYWNrQm94UHJvcGVydHkiLCJ2ZXJ0ZXgxIiwidmVydGV4MiIsImNvbm5lY3RlZFZlcnRpY2VzIiwic2VhcmNoVmVydGljZXMiLCJpc0Nsb3NlZFByb3BlcnR5IiwiY29ubmVjdCIsInRhcmdldFZlcnRleCIsIm9sZFZlcnRleCIsImF0dGFjaGFibGVQcm9wZXJ0eSIsImNvbm5lY3RlZEVtaXR0ZXIiLCJpc0N1dHRhYmxlUHJvcGVydHkiLCJsYWJlbFN0cmluZ1Byb3BlcnR5IiwiaGFzTGlzdGVuZXJzIiwicmVsYXllckVtaXR0ZXIiLCJzdGVwIiwiZHQiLCJzdGVwQWN0aW9uIiwic3RlcEVsZW1lbnRzIiwiZHluYW1pY0VsZW1lbnRzIiwic29sdmVNb2RpZmllZE5vZGFsQW5hbHlzaXMiLCJpbmR1Y3RvcnMiLCJpbmR1Y3RvciIsImhhc0N1cnJlbnQiLCJuZWlnaGJvcnNXaXRoQ3VycmVudCIsImFicyIsImN1cnJlbnRQcm9wZXJ0eSIsImRldGVybWluZVNlbnNlcyIsImxheW91dENoYXJnZXMiLCJpc1ZlcnRleEFkamFjZW50IiwiYSIsImIiLCJjb250YWluc0JvdGhWZXJ0aWNlcyIsImdldE5laWdoYm9yVmVydGljZXNJbkdyb3VwIiwiYWxsQ29ubmVjdGVkVmVydGljZXMiLCJmaW5kQWxsQ29ubmVjdGVkVmVydGljZXMiLCJjIiwiY2lyY3VpdEVsZW1lbnRzV2l0aEN1cnJlbnQiLCJyZXF1aXJlc1NlbnNlQmVmb3JlVmlzaXQiLCJwcm9wYWdhdGVTZW5zZXMiLCJyZXF1aXJlc1NlbnNlQWZ0ZXJWaXNpdCIsIndhc1NlbnNlQXNzaWduZWQiLCJ1bnNwZWNpZmllZEFDU291cmNlcyIsInIiLCJ1bnNwZWNpZmllZEFDU291cmNlIiwicmVmZXJlbmNlRWxlbWVudHMiLCJhc3NpZ25TZW5zZSIsInNvcnQiLCJ0YXJnZXRFbGVtZW50IiwicmVmZXJlbmNlRWxlbWVudCIsInRhcmdldEVsZW1lbnRDdXJyZW50IiwicmVmZXJlbmNlRWxlbWVudEN1cnJlbnQiLCJyZWZlcmVuY2VFbGVtZW50U2Vuc2UiLCJkZXNpcmVkU2lnbiIsImNpcmN1aXRFbGVtZW50c1dpdGhTZW5zZXMiLCJ0b1Zpc2l0IiwidmlzaXRlZCIsInBvcCIsIm5laWdoYm9yVmVydGV4Iiwic3BlY2lmaWVkTmVpZ2hib3JzIiwib2tUb1Zpc2l0IiwiY3VycmVudFZlcnRleCIsIm5laWdoYm9yQ2lyY3VpdEVsZW1lbnQiLCJ1bmlxIiwiaXNJbkxvb3AiLCJzdGFjayIsIm9wcG9zaXRlIiwiZSIsImdldFNlbGVjdGVkVmVydGV4Iiwic2VsZWN0aW9uIiwiZ2V0RHJvcFRhcmdldCIsIm1vZGUiLCJibGFja0JveEJvdW5kcyIsIlRFU1QiLCJjYW5kaWRhdGVWZXJ0aWNlcyIsImNpcmN1aXRWZXJ0ZXgiLCJhZGphY2VudCIsImVxdWFscyIsIm9wcG9zaXRlVmVydGV4IiwiY2FuZGlkYXRlTmVpZ2hib3JzIiwibXlOZWlnaGJvcnMiLCJpbnRlcnNlY3Rpb24iLCJib3hCb3VuZHMiLCJmaXhlZFZlcnRpY2VzMiIsImNvbnRhaW5zUG9pbnQiLCJjb25uZWN0ZWRWZXJ0ZXgiLCJvdXRlcldpcmVTdHViIiwic29ydGVkIiwiY2hlY2tDdXJyZW50Q29uc2VydmF0aW9uIiwiY29uc29sZSIsImxvZyIsInNpZ24iLCJjb25zZXJ2ZUN1cnJlbnQiLCJsb2NrZWQiLCJ1bmxvY2tlZE5laWdoYm9ycyIsIm92ZXJmbG93IiwiZmxpcCIsImZsaXBwZWQiLCJvZmZzZXQiLCJDSEFSR0VfU0VQQVJBVElPTiIsImxhc3RDaGFyZ2VQb3NpdGlvbiIsImNoYXJnZVBhdGhMZW5ndGgiLCJmaXJzdENoYXJnZVBvc2l0aW9uIiwibGVuZ3RoRm9yQ2hhcmdlcyIsIm51bWJlck9mQ2hhcmdlcyIsImNlaWwiLCJzcGFjaW5nIiwiY2hhcmdlUG9zaXRpb24iLCJkZXNpcmVkQ2hhcmdlIiwidmlzaWJsZVByb3BlcnR5Iiwic2hpZnQiLCJ1cGRhdGVQb3NpdGlvbkFuZEFuZ2xlIiwiYWRkIiwidG9TdHJpbmciLCJuYW1lIiwiam9pbiIsIm1ldGhvZHMiLCJnZXRWYWx1ZSIsInJldHVyblR5cGUiLCJwYXJhbWV0ZXJUeXBlcyIsImltcGxlbWVudGF0aW9uIiwicGhldCIsInBoZXRpbyIsInBoZXRpb0VuZ2luZSIsInBoZXRpb1N0YXRlRW5naW5lIiwiZ2V0U3RhdGUiLCJkb2N1bWVudGF0aW9uIiwiZ2V0VmFsaWRhdGlvbkVycm9yIiwia2V5cyIsIkFycmF5IiwiZnJvbSIsIk9iamVjdCIsImtleSIsInN0YXJ0c1dpdGgiLCJwaGV0aW9JRCIsInNldFZhbHVlIiwic3RhdGUiLCJzZXRTdGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2lyY3VpdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNvbGxlY3Rpb24gb2YgY2lyY3VpdCBlbGVtZW50cyBpbiB0aGUgcGxheSBhcmVhLCBub3QgbmVjZXNzYXJpbHkgY29ubmVjdGVkLiAgKEZvciBpbnN0YW5jZSBpdCBjb3VsZCBiZSAyIGRpc2pvaW50XHJcbiAqIGNpcmN1aXRzKS4gVGhpcyBleGlzdHMgZm9yIHRoZSBsaWZlIG9mIHRoZSBzaW0gYW5kIGhlbmNlIGRvZXMgbm90IG5lZWQgYSBkaXNwb3NlIGltcGxlbWVudGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXksIHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFBoZXRpb0dyb3VwIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9Hcm91cC5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBDQ0tDQ29uc3RhbnRzIGZyb20gJy4uL0NDS0NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ0NLQ1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9DQ0tDUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcbmltcG9ydCBBQ1ZvbHRhZ2UgZnJvbSAnLi9BQ1ZvbHRhZ2UuanMnO1xyXG5pbXBvcnQgQmF0dGVyeSBmcm9tICcuL0JhdHRlcnkuanMnO1xyXG5pbXBvcnQgQ2FwYWNpdG9yIGZyb20gJy4vQ2FwYWNpdG9yLmpzJztcclxuaW1wb3J0IENoYXJnZSBmcm9tICcuL0NoYXJnZS5qcyc7XHJcbmltcG9ydCBDaGFyZ2VBbmltYXRvciBmcm9tICcuL0NoYXJnZUFuaW1hdG9yLmpzJztcclxuaW1wb3J0IENpcmN1aXRFbGVtZW50IGZyb20gJy4vQ2lyY3VpdEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgQ3VycmVudFR5cGUgZnJvbSAnLi9DdXJyZW50VHlwZS5qcyc7XHJcbmltcG9ydCBEeW5hbWljQ2lyY3VpdEVsZW1lbnQgZnJvbSAnLi9EeW5hbWljQ2lyY3VpdEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgRml4ZWRDaXJjdWl0RWxlbWVudCBmcm9tICcuL0ZpeGVkQ2lyY3VpdEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgRnVzZSBmcm9tICcuL0Z1c2UuanMnO1xyXG5pbXBvcnQgSW5kdWN0b3IgZnJvbSAnLi9JbmR1Y3Rvci5qcyc7XHJcbmltcG9ydCBMaWdodEJ1bGIgZnJvbSAnLi9MaWdodEJ1bGIuanMnO1xyXG5pbXBvcnQgTGluZWFyVHJhbnNpZW50QW5hbHlzaXMgZnJvbSAnLi9hbmFseXNpcy9MaW5lYXJUcmFuc2llbnRBbmFseXNpcy5qcyc7XHJcbmltcG9ydCBSZXNpc3RvciBmcm9tICcuL1Jlc2lzdG9yLmpzJztcclxuaW1wb3J0IFNlcmllc0FtbWV0ZXIgZnJvbSAnLi9TZXJpZXNBbW1ldGVyLmpzJztcclxuaW1wb3J0IFN3aXRjaCBmcm9tICcuL1N3aXRjaC5qcyc7XHJcbmltcG9ydCBWZXJ0ZXggZnJvbSAnLi9WZXJ0ZXguanMnO1xyXG5pbXBvcnQgV2lyZSBmcm9tICcuL1dpcmUuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZSBmcm9tICcuL0NpcmN1aXRFbGVtZW50Vmlld1R5cGUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWb2x0YWdlQ29ubmVjdGlvbiBmcm9tICcuL1ZvbHRhZ2VDb25uZWN0aW9uLmpzJztcclxuaW1wb3J0IFJlc2lzdG9yVHlwZSBmcm9tICcuL1Jlc2lzdG9yVHlwZS5qcyc7XHJcbmltcG9ydCBJbnRlcmFjdGlvbk1vZGUgZnJvbSAnLi9JbnRlcmFjdGlvbk1vZGUuanMnO1xyXG5pbXBvcnQgQ3VycmVudFNlbnNlIGZyb20gJy4vQ3VycmVudFNlbnNlLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgT3JJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvT3JJTy5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcclxuaW1wb3J0IFZvaWRJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvVm9pZElPLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IE9iamVjdExpdGVyYWxJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvT2JqZWN0TGl0ZXJhbElPLmpzJztcclxuaW1wb3J0IHsgUGhldGlvU3RhdGUgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBTTkFQX1JBRElVUyA9IDMwOyAvLyBGb3IgdHdvIHZlcnRpY2VzIHRvIGpvaW4gdG9nZXRoZXIsIHRoZXkgbXVzdCBiZSB0aGlzIGNsb3NlLCBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbmNvbnN0IEJVTVBfQVdBWV9SQURJVVMgPSAyMDsgLy8gSWYgdHdvIHZlcnRpY2VzIGFyZSB0b28gY2xvc2UgdG9nZXRoZXIgYWZ0ZXIgb25lIGlzIHJlbGVhc2VkLCBhbmQgdGhleSBjb3VsZCBub3QgYmVcclxuLy8gam9pbmVkIHRoZW4gYnVtcCB0aGVtIGFwYXJ0IHNvIHRoZXkgZG8gbm90IGxvb2sgY29ubmVjdGVkLlxyXG5cclxuY29uc3QgQkFUVEVSWV9MRU5HVEggPSBDQ0tDQ29uc3RhbnRzLkJBVFRFUllfTEVOR1RIO1xyXG5jb25zdCBXSVJFX0xFTkdUSCA9IENDS0NDb25zdGFudHMuV0lSRV9MRU5HVEg7XHJcblxyXG4vLyBEZXRlcm1pbmUgd2hhdCBzZW5zZSBhIGNpcmN1aXQgZWxlbWVudCBzaG91bGQgaGF2ZSB0byBjcmVhdGUgYW4gb3ZlcmFsbCBwb3NpdGl2ZSByZWFkb3V0LCBnaXZlbiB0aGUgc3BlY2lmaWVkIGN1cnJlbnRcclxuY29uc3QgZ2V0U2Vuc2VGb3JQb3NpdGl2ZSA9ICggY3VycmVudDogbnVtYmVyICkgPT4gY3VycmVudCA8IDAgPyBDdXJyZW50U2Vuc2UuQkFDS1dBUkQgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID4gMCA/IEN1cnJlbnRTZW5zZS5GT1JXQVJEIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3VycmVudFNlbnNlLlVOU1BFQ0lGSUVEO1xyXG5cclxuLy8gRGV0ZXJtaW5lIHdoYXQgc2Vuc2UgYSBjaXJjdWl0IGVsZW1lbnQgc2hvdWxkIGhhdmUgdG8gY3JlYXRlIGFuIG92ZXJhbGwgbmVnYXRpdmUgcmVhZG91dCwgZ2l2ZW4gdGhlIHNwZWNpZmllZCBjdXJyZW50XHJcbmNvbnN0IGdldFNlbnNlRm9yTmVnYXRpdmUgPSAoIGN1cnJlbnQ6IG51bWJlciApID0+IGN1cnJlbnQgPCAwID8gQ3VycmVudFNlbnNlLkZPUldBUkQgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID4gMCA/IEN1cnJlbnRTZW5zZS5CQUNLV0FSRCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEN1cnJlbnRTZW5zZS5VTlNQRUNJRklFRDtcclxuXHJcbmNvbnN0IHRydWVGdW5jdGlvbiA9IF8uY29uc3RhbnQoIHRydWUgKTsgLy8gTG93ZXIgY2FzZWQgc28gSURFQSBkb2Vzbid0IHRoaW5rIGl0IGlzIGEgY29uc3RydWN0b3JcclxuXHJcbnR5cGUgQ2lyY3VpdE9wdGlvbnMgPSB7XHJcbiAgYmxhY2tCb3hTdHVkeTogYm9vbGVhbjtcclxuICBpbmNsdWRlQUNFbGVtZW50czogYm9vbGVhbjtcclxuICBpbmNsdWRlTGFiRWxlbWVudHM6IGJvb2xlYW47XHJcbn07XHJcblxyXG50eXBlIFBhaXIgPSB7IHYxOiBWZXJ0ZXg7IHYyOiBWZXJ0ZXggfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmN1aXQgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlld1R5cGVQcm9wZXJ0eTogUHJvcGVydHk8Q2lyY3VpdEVsZW1lbnRWaWV3VHlwZT47XHJcbiAgcHVibGljIHJlYWRvbmx5IGFkZFJlYWxCdWxic1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGJsYWNrQm94U3R1ZHk6IGJvb2xlYW47XHJcblxyXG4gIC8vIEFsbCB3aXJlcyBzaGFyZSB0aGUgc2FtZSByZXNpc3Rpdml0eSwgd2hpY2ggaXMgZGVmaW5lZCBieSByZXNpc3RhbmNlID0gcmVzaXN0aXZpdHkgKiBsZW5ndGguIE9uIHRoZSBMYWIgU2NyZWVuLFxyXG4gIC8vIHRoZXJlIGlzIGEgd2lyZSByZXNpc3Rpdml0eSBjb250cm9sXHJcbiAgcHVibGljIHJlYWRvbmx5IHdpcmVSZXNpc3Rpdml0eVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgLy8gQWxsIGJhdHRlcmllcyBzaGFyZSBhIHNpbmdsZSBpbnRlcm5hbCByZXNpc3RhbmNlIHZhbHVlLCB3aGljaCBjYW4gYmUgZWRpdGVkIHdpdGggYSBjb250cm9sIG9uIHRoZSBMYWIgU2NyZWVuXHJcbiAgcHVibGljIHJlYWRvbmx5IHNvdXJjZVJlc2lzdGFuY2VQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIC8vIFRoZSBkaWZmZXJlbnQgdHlwZXMgb2YgQ2lyY3VpdEVsZW1lbnQgdGhlIGNpcmN1aXQgbWF5IGNvbnRhaW4sIGluY2x1ZGluZyBXaXJlLCBCYXR0ZXJ5LCBTd2l0Y2gsIFJlc2lzdG9yLCBMaWdodEJ1bGIsIGV0Yy5cclxuICBwdWJsaWMgcmVhZG9ubHkgY2lyY3VpdEVsZW1lbnRzOiBPYnNlcnZhYmxlQXJyYXk8Q2lyY3VpdEVsZW1lbnQ+O1xyXG5cclxuICAvLyBUaGUgY2hhcmdlcyBpbiB0aGUgY2lyY3VpdFxyXG4gIHB1YmxpYyByZWFkb25seSBjaGFyZ2VzOiBPYnNlcnZhYmxlQXJyYXk8Q2hhcmdlPjtcclxuXHJcbiAgLy8gd2hldGhlciB0aGUgY3VycmVudCBzaG91bGQgYmUgZGlzcGxheWVkXHJcbiAgcHVibGljIHJlYWRvbmx5IHNob3dDdXJyZW50UHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuXHJcbiAgLy8gd2hldGhlciB0byBzaG93IGNoYXJnZXMgb3IgY29udmVudGlvbmFsIGN1cnJlbnRcclxuICBwdWJsaWMgcmVhZG9ubHkgY3VycmVudFR5cGVQcm9wZXJ0eTogUHJvcGVydHk8Q3VycmVudFR5cGU+O1xyXG5cclxuICAvLyBlbGFwc2VkIHRpbWUgZm9yIHRoZSBjaXJjdWl0IG1vZGVsXHJcbiAgcHVibGljIHJlYWRvbmx5IHRpbWVQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIC8vIG1vdmUgdGhlIGNoYXJnZXMgd2l0aCBzcGVlZCBwcm9wb3J0aW9uYWwgdG8gY3VycmVudFxyXG4gIHB1YmxpYyByZWFkb25seSBjaGFyZ2VBbmltYXRvcjogQ2hhcmdlQW5pbWF0b3I7XHJcblxyXG4gIC8vIEFmdGVyIHRoZSBjaXJjdWl0IHBoeXNpY3MgaXMgcmVjb21wdXRlZCBpbiBzb2x2ZSgpLCBzb21lIGxpc3RlbmVycyBuZWVkIHRvIHVwZGF0ZSB0aGVtc2VsdmVzLCBzdWNoIGFzIHRoZSB2b2x0bWV0ZXJcclxuICAvLyBhbmQgYW1tZXRlclxyXG4gIHB1YmxpYyByZWFkb25seSBjaXJjdWl0Q2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyO1xyXG5cclxuICAvLyBTb21lIGFjdGlvbnMgb25seSB0YWtlIHBsYWNlIGFmdGVyIGFuIGl0ZW0gaGFzIGJlZW4gZHJvcHBlZFxyXG4gIHB1YmxpYyByZWFkb25seSB2ZXJ0ZXhEcm9wcGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBWZXJ0ZXggXT47XHJcblxyXG4gIC8vIHNpZ25pZmllcyB0aGF0IGEgY29tcG9uZW50IGhhcyBiZWVuIG1vZGlmaWVkIChmb3IgZXhhbXBsZSwgd2l0aCB0aGUgQ2lyY3VpdEVsZW1lbnROdW1iZXJDb250cm9sKVxyXG4gIHB1YmxpYyByZWFkb25seSBjb21wb25lbnRFZGl0ZWRFbWl0dGVyOiBURW1pdHRlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgdmVydGV4R3JvdXA6IFBoZXRpb0dyb3VwPFZlcnRleCwgWyBWZWN0b3IyIF0+O1xyXG5cclxuICAvLyBXaGVuIHRoZSB1c2VyIHRhcHMgb24gYSBDaXJjdWl0RWxlbWVudCwgaXQgYmVjb21lcyBzZWxlY3RlZCBhbmQgaGlnaGxpZ2h0ZWQsIGFuZCBzaG93cyBhZGRpdGlvbmFsIGNvbnRyb2xzIGF0IHRoZVxyXG4gIC8vIGJvdHRvbSBvZiB0aGUgc2NyZWVuLiBXaGVuIHRoZSBzaW0gbGF1bmNoZXMgb3Igd2hlbiB0aGUgdXNlciB0YXBzIGF3YXkgZnJvbSBhIHNlbGVjdGVkIGNpcmN1aXQgZWxlbWVudCwgdGhlXHJcbiAgLy8gc2VsZWN0aW9uIGlzIGBudWxsYC4gIE9uY2UgdGhpcyBzaW11bGF0aW9uIGlzIGluc3RydW1lbnRlZCBmb3IgYTExeSwgdGhlIGZvY3VzIHByb3BlcnR5IGNhbiBiZSB1c2VkIHRvIHRyYWNrIHRoaXMuXHJcbiAgLy8gTm90ZSB0aGF0IHZlcnRleCBzZWxlY3Rpb24gaXMgZG9uZSB2aWEgVmVydGV4LmlzU2VsZWN0ZWRQcm9wZXJ0eS4gIFRoZXNlIHN0cmF0ZWdpZXMgY2FuIGJlIHVuaWZpZWQgd2hlbiB3ZSB3b3JrIG9uXHJcbiAgLy8gYTExeS5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2VsZWN0aW9uUHJvcGVydHk6IFByb3BlcnR5PENpcmN1aXRFbGVtZW50IHwgVmVydGV4IHwgbnVsbD47XHJcblxyXG4gIC8vIHdoZXRoZXIgcGh5c2ljYWwgY2hhcmFjdGVyaXN0aWNzIGhhdmUgY2hhbmdlZCBhbmQgd2FycmFudCBzb2x2aW5nIGZvciBjdXJyZW50cyBhbmQgdm9sdGFnZXNcclxuICBwdWJsaWMgZGlydHk6IGJvb2xlYW47XHJcblxyXG4gIC8vIEFjdGlvbnMgdGhhdCB3aWxsIGJlIGludm9rZWQgZHVyaW5nIHRoZSBzdGVwIGZ1bmN0aW9uXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzdGVwQWN0aW9uczogKCAoKSA9PiB2b2lkIClbXTtcclxuICBwdWJsaWMgcmVhZG9ubHkgd2lyZUdyb3VwOiBQaGV0aW9Hcm91cDxXaXJlLCBbIFZlcnRleCwgVmVydGV4IF0+O1xyXG4gIHB1YmxpYyByZWFkb25seSBiYXR0ZXJ5R3JvdXA6IFBoZXRpb0dyb3VwPEJhdHRlcnksIFsgVmVydGV4LCBWZXJ0ZXggXT47XHJcbiAgcHVibGljIHJlYWRvbmx5IGV4dHJlbWVCYXR0ZXJ5R3JvdXA6IFBoZXRpb0dyb3VwPEJhdHRlcnksIFsgVmVydGV4LCBWZXJ0ZXggXT4gfCBudWxsO1xyXG4gIHB1YmxpYyByZWFkb25seSBhY1ZvbHRhZ2VHcm91cDogUGhldGlvR3JvdXA8QUNWb2x0YWdlLCBbIFZlcnRleCwgVmVydGV4IF0+IHwgbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgcmVzaXN0b3JHcm91cDogUGhldGlvR3JvdXA8UmVzaXN0b3IsIFsgVmVydGV4LCBWZXJ0ZXggXT47XHJcbiAgcHVibGljIHJlYWRvbmx5IGV4dHJlbWVSZXNpc3Rvckdyb3VwOiBQaGV0aW9Hcm91cDxSZXNpc3RvciwgWyBWZXJ0ZXgsIFZlcnRleCBdPiB8IG51bGw7XHJcbiAgcHVibGljIHJlYWRvbmx5IGhvdXNlaG9sZE9iamVjdEdyb3VwOiBQaGV0aW9Hcm91cDxSZXNpc3RvciwgWyBWZXJ0ZXgsIFZlcnRleCwgUmVzaXN0b3JUeXBlIF0+O1xyXG4gIHB1YmxpYyByZWFkb25seSBmdXNlR3JvdXA6IFBoZXRpb0dyb3VwPEZ1c2UsIFsgVmVydGV4LCBWZXJ0ZXggXT47XHJcbiAgcHVibGljIHJlYWRvbmx5IHNlcmllc0FtbWV0ZXJHcm91cDogUGhldGlvR3JvdXA8U2VyaWVzQW1tZXRlciwgWyBWZXJ0ZXgsIFZlcnRleCBdPiB8IG51bGw7XHJcbiAgcHVibGljIHJlYWRvbmx5IGV4dHJlbWVMaWdodEJ1bGJHcm91cDogUGhldGlvR3JvdXA8TGlnaHRCdWxiLCBbIFZlcnRleCwgVmVydGV4IF0+IHwgbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgY2FwYWNpdG9yR3JvdXA6IFBoZXRpb0dyb3VwPENhcGFjaXRvciwgWyBWZXJ0ZXgsIFZlcnRleCBdPiB8IG51bGw7XHJcbiAgcHVibGljIHJlYWRvbmx5IGluZHVjdG9yR3JvdXA6IFBoZXRpb0dyb3VwPEluZHVjdG9yLCBbIFZlcnRleCwgVmVydGV4IF0+IHwgbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgc3dpdGNoR3JvdXA6IFBoZXRpb0dyb3VwPFN3aXRjaCwgWyBWZXJ0ZXgsIFZlcnRleCBdPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgbGlnaHRCdWxiR3JvdXA6IFBoZXRpb0dyb3VwPExpZ2h0QnVsYiwgWyBWZXJ0ZXgsIFZlcnRleCBdPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgcmVhbExpZ2h0QnVsYkdyb3VwOiBQaGV0aW9Hcm91cDxMaWdodEJ1bGIsIFsgVmVydGV4LCBWZXJ0ZXggXT4gfCBudWxsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBzOiBQaGV0aW9Hcm91cDxJbnRlbnRpb25hbEFueSwgSW50ZW50aW9uYWxBbnk+W107XHJcbiAgcHVibGljIHJlYWRvbmx5IGluY2x1ZGVBQ0VsZW1lbnRzOiBib29sZWFuO1xyXG4gIHB1YmxpYyByZWFkb25seSBpbmNsdWRlTGFiRWxlbWVudHM6IGJvb2xlYW47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggdmlld1R5cGVQcm9wZXJ0eTogUHJvcGVydHk8Q2lyY3VpdEVsZW1lbnRWaWV3VHlwZT4sIGFkZFJlYWxCdWxic1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgdGFuZGVtOiBUYW5kZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IENpcmN1aXRPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICBwaGV0aW9UeXBlOiBDaXJjdWl0U3RhdGVJTyxcclxuXHJcbiAgICAgIC8vIFVzZWQgZm9yIGdldC9zZXQgZm9yIHRoZSBjaXJjdWl0IG9uIG9uZSBzY3JlZW4gYnV0IHRoZSBlbnRpcmUgc3RhdGUgaXMgYWxyZWFkeSBpbnN0cnVtZW50ZWQgdmlhIHRoZSBQaGV0aW9Hcm91cHNcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy52aWV3VHlwZVByb3BlcnR5ID0gdmlld1R5cGVQcm9wZXJ0eTtcclxuICAgIHRoaXMuYWRkUmVhbEJ1bGJzUHJvcGVydHkgPSBhZGRSZWFsQnVsYnNQcm9wZXJ0eTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gcHJvdmlkZWRPcHRpb25zO1xyXG5cclxuICAgIHRoaXMuaW5jbHVkZUFDRWxlbWVudHMgPSBvcHRpb25zLmluY2x1ZGVBQ0VsZW1lbnRzO1xyXG4gICAgdGhpcy5pbmNsdWRlTGFiRWxlbWVudHMgPSBvcHRpb25zLmluY2x1ZGVMYWJFbGVtZW50cztcclxuICAgIHRoaXMuYmxhY2tCb3hTdHVkeSA9IG9wdGlvbnMuYmxhY2tCb3hTdHVkeTtcclxuICAgIHRoaXMud2lyZVJlc2lzdGl2aXR5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIENDS0NDb25zdGFudHMuV0lSRV9SRVNJU1RJVklUWV9SQU5HRS5taW4sIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0ucGFyZW50VGFuZGVtIS5jcmVhdGVUYW5kZW0oICd3aXJlUmVzaXN0aXZpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgcmFuZ2U6IENDS0NDb25zdGFudHMuV0lSRV9SRVNJU1RJVklUWV9SQU5HRSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNvdXJjZVJlc2lzdGFuY2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggQ0NLQ0NvbnN0YW50cy5ERUZBVUxUX0JBVFRFUllfUkVTSVNUQU5DRSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5wYXJlbnRUYW5kZW0hLmNyZWF0ZVRhbmRlbSggJ3NvdXJjZVJlc2lzdGFuY2VQcm9wZXJ0eScgKSxcclxuICAgICAgcmFuZ2U6IENDS0NDb25zdGFudHMuQkFUVEVSWV9SRVNJU1RBTkNFX1JBTkdFLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdEVsZW1lbnRzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7XHJcbiAgICAgIHBoZXRpb1N0YXRlOiB0cnVlLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFJlZmVyZW5jZUlPKCBDaXJjdWl0RWxlbWVudC5DaXJjdWl0RWxlbWVudElPICkgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2lyY3VpdEVsZW1lbnRzJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQWxsIENpcmN1aXQgRWxlbWVudHMsIHVzZWQgZm9yIHN0YXRlIHNhdmUvcmVzdG9yZScsXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGFyZ2VzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcbiAgICB0aGlzLmN1cnJlbnRUeXBlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5jdXJyZW50VHlwZSA9PT0gJ2VsZWN0cm9ucycgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEN1cnJlbnRUeXBlLkVMRUNUUk9OUyA6IEN1cnJlbnRUeXBlLkNPTlZFTlRJT05BTCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5wYXJlbnRUYW5kZW0hLmNyZWF0ZVRhbmRlbSggJ2N1cnJlbnRUeXBlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgY3VycmVudCB0eXBlIGNoYW5nZXMsIG1hcmsgZXZlcnl0aGluZyBhcyBkaXJ0eSBhbmQgcmVsYXlvdXQgY2hhcmdlc1xyXG4gICAgdGhpcy5jdXJyZW50VHlwZVByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB0aGlzLnJlbGF5b3V0QWxsQ2hhcmdlcygpICk7XHJcblxyXG4gICAgdGhpcy5zaG93Q3VycmVudFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5zaG93Q3VycmVudCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5wYXJlbnRUYW5kZW0hLmNyZWF0ZVRhbmRlbSggJ3Nob3dDdXJyZW50UHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50aW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuICAgIHRoaXMuY2hhcmdlQW5pbWF0b3IgPSBuZXcgQ2hhcmdlQW5pbWF0b3IoIHRoaXMgKTtcclxuXHJcbiAgICAvLyBNYXJrIGFzIGRpcnR5IHdoZW4gdm9sdGFnZXMgb3IgcmVzaXN0YW5jZXMgY2hhbmdlLlxyXG4gICAgY29uc3QgbWFya0RpcnR5TGlzdGVuZXIgPSB0aGlzLm1hcmtEaXJ0eS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gU29sdmUgdGhlIGNpcmN1aXQgd2hlbiBhbnkgb2YgdGhlIGNpcmN1aXQgZWxlbWVudCBhdHRyaWJ1dGVzIGNoYW5nZS5cclxuICAgIHRoaXMuY2lyY3VpdEVsZW1lbnRzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBjaXJjdWl0RWxlbWVudCA9PiB7XHJcbiAgICAgIGNpcmN1aXRFbGVtZW50LmdldENpcmN1aXRQcm9wZXJ0aWVzKCkuZm9yRWFjaCggcHJvcGVydHkgPT4gcHJvcGVydHkubGF6eUxpbmsoIG1hcmtEaXJ0eUxpc3RlbmVyICkgKTtcclxuICAgICAgaWYgKCBjaXJjdWl0RWxlbWVudCBpbnN0YW5jZW9mIER5bmFtaWNDaXJjdWl0RWxlbWVudCApIHtcclxuICAgICAgICBjaXJjdWl0RWxlbWVudC5jbGVhckVtaXR0ZXIuYWRkTGlzdGVuZXIoIG1hcmtEaXJ0eUxpc3RlbmVyICk7XHJcbiAgICAgICAgY2lyY3VpdEVsZW1lbnQuZGlzcG9zZUVtaXR0ZXJDaXJjdWl0RWxlbWVudC5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgICAgY2lyY3VpdEVsZW1lbnQuY2xlYXJFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBtYXJrRGlydHlMaXN0ZW5lciApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2hlbiBhbnkgdmVydGV4IG1vdmVzLCByZWxheW91dCBhbGwgY2hhcmdlcyB3aXRoaW4gdGhlIGZpeGVkLWxlbmd0aCBjb25uZWN0ZWQgY29tcG9uZW50LCBzZWUgIzEwMFxyXG4gICAgICBjaXJjdWl0RWxlbWVudC5jaGFyZ2VMYXlvdXREaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgICBjb25zdCB1cGRhdGVDaGFyZ2VzID0gKCkgPT4gdGhpcy5tYXJrQWxsQ29ubmVjdGVkQ2lyY3VpdEVsZW1lbnRzRGlydHkoIGNpcmN1aXRFbGVtZW50LnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCkgKTtcclxuXHJcbiAgICAgIC8vIEZvciBjaXJjdWl0IGVsZW1lbnRzIHRoYXQgY2FuIGNoYW5nZSB0aGVpciBsZW5ndGgsIG1ha2Ugc3VyZSB0byB1cGRhdGUgY2hhcmdlcyB3aGVuIHRoZSBsZW5ndGggY2hhbmdlcy5cclxuICAgICAgaWYgKCBjaXJjdWl0RWxlbWVudC5sZW5ndGhQcm9wZXJ0eSApIHtcclxuICAgICAgICBjaXJjdWl0RWxlbWVudC5sZW5ndGhQcm9wZXJ0eS5saW5rKCB1cGRhdGVDaGFyZ2VzICk7XHJcbiAgICAgICAgY2lyY3VpdEVsZW1lbnQuZGlzcG9zZUVtaXR0ZXJDaXJjdWl0RWxlbWVudC5hZGRMaXN0ZW5lciggKCkgPT4gY2lyY3VpdEVsZW1lbnQubGVuZ3RoUHJvcGVydHkhLnVubGluayggdXBkYXRlQ2hhcmdlcyApICk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcclxuICAgICAgY2lyY3VpdEVsZW1lbnQuY3VycmVudFNlbnNlUHJvcGVydHkubGF6eUxpbmsoIGVtaXRDaXJjdWl0Q2hhbmdlZCApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jaXJjdWl0RWxlbWVudHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggY2lyY3VpdEVsZW1lbnQgPT4ge1xyXG5cclxuICAgICAgLy8gRGVsZXRlIG9ycGhhbmVkIHZlcnRpY2VzXHJcbiAgICAgIHRoaXMucmVtb3ZlVmVydGV4SWZPcnBoYW5lZCggY2lyY3VpdEVsZW1lbnQuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICB0aGlzLnJlbW92ZVZlcnRleElmT3JwaGFuZWQoIGNpcmN1aXRFbGVtZW50LmVuZFZlcnRleFByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgICAvLyBDbGVhciB0aGUgc2VsZWN0ZWQgZWxlbWVudCBwcm9wZXJ0eSBzbyB0aGF0IHRoZSBFZGl0IHBhbmVsIGZvciB0aGUgZWxlbWVudCB3aWxsIGRpc2FwcGVhclxyXG4gICAgICBpZiAoIHRoaXMuc2VsZWN0aW9uUHJvcGVydHkuZ2V0KCkgPT09IGNpcmN1aXRFbGVtZW50ICkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjaXJjdWl0RWxlbWVudC5nZXRDaXJjdWl0UHJvcGVydGllcygpLmZvckVhY2goIHByb3BlcnR5ID0+IHByb3BlcnR5LnVubGluayggbWFya0RpcnR5TGlzdGVuZXIgKSApO1xyXG4gICAgICB0aGlzLmNoYXJnZXMucmVtb3ZlQWxsKCB0aGlzLmdldENoYXJnZXNJbkNpcmN1aXRFbGVtZW50KCBjaXJjdWl0RWxlbWVudCApICk7XHJcbiAgICAgIGNpcmN1aXRFbGVtZW50LmN1cnJlbnRTZW5zZVByb3BlcnR5LnVubGluayggZW1pdENpcmN1aXRDaGFuZ2VkICk7XHJcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiBhIENoYXJnZSBpcyByZW1vdmVkIGZyb20gdGhlIGxpc3QsIGRpc3Bvc2UgaXRcclxuICAgIHRoaXMuY2hhcmdlcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBjaGFyZ2UgPT4gY2hhcmdlLmRpc3Bvc2UoKSApO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdENoYW5nZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgIHRoaXMudmVydGV4RHJvcHBlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBWZXJ0ZXggfSBdIH0gKTtcclxuICAgIHRoaXMuY29tcG9uZW50RWRpdGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy5zZWxlY3Rpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxDaXJjdWl0RWxlbWVudCB8IFZlcnRleCB8IG51bGw+KCBudWxsLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlbGVjdGlvblByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIFJlZmVyZW5jZUlPKCBPcklPKCBbIENpcmN1aXRFbGVtZW50LkNpcmN1aXRFbGVtZW50SU8sIFZlcnRleC5WZXJ0ZXhJTyBdICkgKSApLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGVtaXRDaXJjdWl0Q2hhbmdlZCA9ICgpID0+IHtcclxuICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcbiAgICAgIHRoaXMuY2lyY3VpdENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy52ZXJ0ZXhHcm91cCA9IG5ldyBQaGV0aW9Hcm91cCggKCB0YW5kZW0sIHBvc2l0aW9uICkgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IFZlcnRleCggcG9zaXRpb24sIHRoaXMuc2VsZWN0aW9uUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgICBwaGV0aW9UeXBlOiBWZXJ0ZXguVmVydGV4SU9cclxuICAgICAgfSApO1xyXG4gICAgfSwgWyBuZXcgVmVjdG9yMiggLTEwMDAsIDAgKSBdLCB7XHJcbiAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIFZlcnRleC5WZXJ0ZXhJTyApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2ZXJ0ZXhHcm91cCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudmVydGV4R3JvdXAuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB2ZXJ0ZXggPT4ge1xyXG5cclxuICAgICAgLy8gT2JzZXJ2ZSB0aGUgY2hhbmdlIGluIHBvc2l0aW9uIG9mIHRoZSB2ZXJ0aWNlcywgdG8gdXBkYXRlIHRoZSBhbW1ldGVyIGFuZCB2b2x0bWV0ZXJcclxuICAgICAgdmVydGV4LnBvc2l0aW9uUHJvcGVydHkubGluayggZW1pdENpcmN1aXRDaGFuZ2VkICk7XHJcblxyXG4gICAgICBjb25zdCBmaWx0ZXJlZCA9IHRoaXMudmVydGV4R3JvdXAuZmlsdGVyKCBjYW5kaWRhdGVWZXJ0ZXggPT4gdmVydGV4ID09PSBjYW5kaWRhdGVWZXJ0ZXggKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmlsdGVyZWQubGVuZ3RoID09PSAxLCAnc2hvdWxkIG9ubHkgaGF2ZSBvbmUgY29weSBvZiBlYWNoIHZlcnRleCcgKTtcclxuXHJcbiAgICAgIC8vIElmIHRoZSB1c2UgZHJhZ2dlZCBhbm90aGVyIGNpcmN1aXQgZWxlbWVudCwgdGhlbiBwcmV2aW91cyBzZWxlY3Rpb24gc2hvdWxkIGJlIGNsZWFyZWQuXHJcbiAgICAgIHRoaXMuc2VsZWN0aW9uUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc3RlcEFjdGlvbnMgPSBbXTtcclxuXHJcbiAgICAvLyBXaGVuIGFueSB2ZXJ0ZXggaXMgZHJvcHBlZCwgY2hlY2sgaXQgYW5kIGl0cyBuZWlnaGJvcnMgZm9yIG92ZXJsYXAuICBJZiBhbnkgb3ZlcmxhcCwgbW92ZSB0aGVtIGFwYXJ0LlxyXG4gICAgdGhpcy52ZXJ0ZXhEcm9wcGVkRW1pdHRlci5hZGRMaXN0ZW5lciggdmVydGV4ID0+IHtcclxuICAgICAgdGhpcy5zdGVwQWN0aW9ucy5wdXNoKCAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIENvbGxlY3QgYWRqYWNlbnQgdmVydGljZXNcclxuICAgICAgICBjb25zdCBuZWlnaGJvcnMgPSB0aGlzLmdldE5laWdoYm9yaW5nVmVydGljZXMoIHZlcnRleCApO1xyXG5cclxuICAgICAgICAvLyBBbHNvIGNvbnNpZGVyIHRoZSB2ZXJ0ZXggYmVpbmcgZHJvcHBlZCBmb3IgY29tcGFyaXNvbiB3aXRoIG5laWdoYm9yc1xyXG4gICAgICAgIG5laWdoYm9ycy5wdXNoKCB2ZXJ0ZXggKTtcclxuICAgICAgICBjb25zdCBwYWlyczogUGFpcltdID0gW107XHJcbiAgICAgICAgbmVpZ2hib3JzLmZvckVhY2goIG5laWdoYm9yID0+IHtcclxuICAgICAgICAgIHRoaXMudmVydGV4R3JvdXAuZm9yRWFjaCggdmVydGV4ID0+IHtcclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSBub2RlcyBhcmUgZGlmZmVyZW50XHJcbiAgICAgICAgICAgIGlmICggbmVpZ2hib3IgIT09IHZlcnRleCApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQWRkIHRvIHRoZSBsaXN0IHRvIGJlIGNoZWNrZWRcclxuICAgICAgICAgICAgICBwYWlycy5wdXNoKCB7IHYxOiBuZWlnaGJvciwgdjI6IHZlcnRleCB9ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgaWYgKCBwYWlycy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAgIC8vIEZpbmQgdGhlIGNsb3Nlc3QgcGFpclxyXG4gICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSAoIHBhaXI6IFBhaXIgKSA9PiBwYWlyLnYyLnVuc25hcHBlZFBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHBhaXIudjEudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICAgICAgY29uc3QgbWluUGFpciA9IF8ubWluQnkoIHBhaXJzLCBkaXN0YW5jZSApITtcclxuICAgICAgICAgIGNvbnN0IG1pbkRpc3RhbmNlID0gZGlzdGFuY2UoIG1pblBhaXIgKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgcGFpciBpcyB0b28gY2xvc2UsIHRoZW4gYnVtcCBvbmUgdmVydGV4IGF3YXkgZnJvbSBlYWNoIG90aGVyIChidXQgb25seSBpZiBib3RoIGFyZSBub3QgdXNlciBjb250cm9sbGVkKVxyXG4gICAgICAgICAgaWYgKCBtaW5EaXN0YW5jZSA8IEJVTVBfQVdBWV9SQURJVVMgJiYgIW1pblBhaXIudjEuaXNEcmFnZ2VkICYmICFtaW5QYWlyLnYyLmlzRHJhZ2dlZCApIHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlVmVydGljZXNBcGFydCggbWluUGFpci52MSwgbWluUGFpci52MiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc291cmNlUmVzaXN0YW5jZVByb3BlcnR5LmxpbmsoIG1hcmtEaXJ0eUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHZlcnRpY2VzIGZvciB0aGUgQVBJIHZhbGlkYXRlZC9iYXNlbGluZSBjaXJjdWl0IGVsZW1lbnRzLiAgVGhlc2UgYXJlIG5vdCBwcmVzZW50IGluIHRoZSB2ZXJ0ZXhHcm91cCBhbmRcclxuICAgIC8vIGhlbmNlIG5vdCB0cmFuc21pdHRlZCBpbiB0aGUgc3RhdGUuXHJcbiAgICBjb25zdCBjcmVhdGVWZXJ0aWNlczogKCBsOiBudW1iZXIgKSA9PiBbIFZlcnRleCwgVmVydGV4IF0gPSAoIGxlbmd0aDogbnVtYmVyICkgPT4ge1xyXG4gICAgICBjb25zdCBzdGFydFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIC0xMDAwLCAwICk7XHJcbiAgICAgIHJldHVybiBbIG5ldyBWZXJ0ZXgoIHN0YXJ0UG9zaXRpb24sIHRoaXMuc2VsZWN0aW9uUHJvcGVydHkgKSwgbmV3IFZlcnRleCggc3RhcnRQb3NpdGlvbi5wbHVzWFkoIGxlbmd0aCwgMCApLCB0aGlzLnNlbGVjdGlvblByb3BlcnR5ICkgXTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy53aXJlR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoICggdGFuZGVtLCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IFdpcmUoIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXgsIHRoaXMud2lyZVJlc2lzdGl2aXR5UHJvcGVydHksIHRhbmRlbSApO1xyXG4gICAgfSwgKCkgPT4gY3JlYXRlVmVydGljZXMoIFdJUkVfTEVOR1RIICksIHtcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggQ2lyY3VpdEVsZW1lbnQuQ2lyY3VpdEVsZW1lbnRJTyApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd3aXJlR3JvdXAnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJhdHRlcnlHcm91cCA9IG5ldyBQaGV0aW9Hcm91cCggKCB0YW5kZW0sIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXggKSA9PiB7XHJcbiAgICAgIHJldHVybiBuZXcgQmF0dGVyeSggc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCwgdGhpcy5zb3VyY2VSZXNpc3RhbmNlUHJvcGVydHksICdub3JtYWwnLFxyXG4gICAgICAgIHRhbmRlbSApO1xyXG4gICAgfSwgKCkgPT4gY3JlYXRlVmVydGljZXMoIEJBVFRFUllfTEVOR1RIICksIHtcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggQ2lyY3VpdEVsZW1lbnQuQ2lyY3VpdEVsZW1lbnRJTyApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYXR0ZXJ5R3JvdXAnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBpbmNsdWRlRXh0cmVtZUVsZW1lbnRzID0gdGhpcy5pbmNsdWRlTGFiRWxlbWVudHMgJiYgIXRoaXMuaW5jbHVkZUFDRWxlbWVudHM7XHJcbiAgICB0aGlzLmV4dHJlbWVCYXR0ZXJ5R3JvdXAgPSBpbmNsdWRlRXh0cmVtZUVsZW1lbnRzID8gbmV3IFBoZXRpb0dyb3VwKCAoIHRhbmRlbSwgc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCApID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBCYXR0ZXJ5KCBzdGFydFZlcnRleCwgZW5kVmVydGV4LCB0aGlzLnNvdXJjZVJlc2lzdGFuY2VQcm9wZXJ0eSwgJ2hpZ2gtdm9sdGFnZScsXHJcbiAgICAgICAgdGFuZGVtLCB7XHJcbiAgICAgICAgICB2b2x0YWdlOiAxMDAwLFxyXG4gICAgICAgICAgbnVtYmVyT2ZEZWNpbWFsUGxhY2VzOiBCYXR0ZXJ5LkhJR0hfVk9MVEFHRV9ERUNJTUFMX1BMQUNFU1xyXG4gICAgICAgIH0gKTtcclxuICAgIH0sICgpID0+IGNyZWF0ZVZlcnRpY2VzKCBCQVRURVJZX0xFTkdUSCApLCB7XHJcbiAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIENpcmN1aXRFbGVtZW50LkNpcmN1aXRFbGVtZW50SU8gKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXh0cmVtZUJhdHRlcnlHcm91cCcgKSxcclxuICAgICAgcGhldGlvRHluYW1pY0VsZW1lbnROYW1lOiAnZXh0cmVtZUJhdHRlcnknXHJcbiAgICB9ICkgOiBudWxsO1xyXG5cclxuICAgIHRoaXMuYWNWb2x0YWdlR3JvdXAgPSB0aGlzLmluY2x1ZGVBQ0VsZW1lbnRzID8gbmV3IFBoZXRpb0dyb3VwKCAoIHRhbmRlbSwgc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCApID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBBQ1ZvbHRhZ2UoIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXgsIHRoaXMuc291cmNlUmVzaXN0YW5jZVByb3BlcnR5LCB0YW5kZW0gKTtcclxuICAgIH0sICgpID0+IGNyZWF0ZVZlcnRpY2VzKCBDQ0tDQ29uc3RhbnRzLkFDX1ZPTFRBR0VfTEVOR1RIICksIHtcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggQ2lyY3VpdEVsZW1lbnQuQ2lyY3VpdEVsZW1lbnRJTyApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhY1ZvbHRhZ2VHcm91cCcgKVxyXG4gICAgfSApIDogbnVsbDtcclxuXHJcbiAgICB0aGlzLnJlc2lzdG9yR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoXHJcbiAgICAgICggdGFuZGVtLCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkgPT5cclxuICAgICAgICBuZXcgUmVzaXN0b3IoIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXgsIFJlc2lzdG9yVHlwZS5SRVNJU1RPUiwgdGFuZGVtICksXHJcbiAgICAgICgpID0+IGNyZWF0ZVZlcnRpY2VzKCBSZXNpc3RvclR5cGUuUkVTSVNUT1IubGVuZ3RoICksIHtcclxuICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBSZXNpc3Rvci5SZXNpc3RvcklPICksXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzaXN0b3JHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5leHRyZW1lUmVzaXN0b3JHcm91cCA9IGluY2x1ZGVFeHRyZW1lRWxlbWVudHMgPyBuZXcgUGhldGlvR3JvdXAoXHJcbiAgICAgICggdGFuZGVtLCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkgPT5cclxuICAgICAgICBuZXcgUmVzaXN0b3IoIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXgsIFJlc2lzdG9yVHlwZS5FWFRSRU1FX1JFU0lTVE9SLCB0YW5kZW0gKSxcclxuICAgICAgKCkgPT4gY3JlYXRlVmVydGljZXMoIFJlc2lzdG9yVHlwZS5FWFRSRU1FX1JFU0lTVE9SLmxlbmd0aCApLCB7XHJcbiAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggUmVzaXN0b3IuUmVzaXN0b3JJTyApLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4dHJlbWVSZXNpc3Rvckdyb3VwJyApXHJcbiAgICAgIH0gKSA6IG51bGw7XHJcblxyXG4gICAgdGhpcy5ob3VzZWhvbGRPYmplY3RHcm91cCA9IG5ldyBQaGV0aW9Hcm91cChcclxuICAgICAgKCB0YW5kZW0sIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXgsIHJlc2lzdG9yVHlwZSApID0+XHJcbiAgICAgICAgbmV3IFJlc2lzdG9yKCBzdGFydFZlcnRleCwgZW5kVmVydGV4LCByZXNpc3RvclR5cGUsIHRhbmRlbSApLFxyXG4gICAgICAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIFsgLi4uY3JlYXRlVmVydGljZXMoIFJlc2lzdG9yVHlwZS5SRVNJU1RPUi5sZW5ndGggKSwgUmVzaXN0b3JUeXBlLkNPSU4gXTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIFJlc2lzdG9yLlJlc2lzdG9ySU8gKSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdob3VzZWhvbGRPYmplY3RHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5mdXNlR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoXHJcbiAgICAgICggdGFuZGVtLCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkgPT4gbmV3IEZ1c2UoIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXgsIHRhbmRlbSApLFxyXG4gICAgICAoKSA9PiBjcmVhdGVWZXJ0aWNlcyggQ0NLQ0NvbnN0YW50cy5GVVNFX0xFTkdUSCApLCB7XHJcbiAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggQ2lyY3VpdEVsZW1lbnQuQ2lyY3VpdEVsZW1lbnRJTyApLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Z1c2VHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zZXJpZXNBbW1ldGVyR3JvdXAgPSB0aGlzLmluY2x1ZGVMYWJFbGVtZW50cyA/IG5ldyBQaGV0aW9Hcm91cChcclxuICAgICAgKCB0YW5kZW0sIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXggKSA9PiBuZXcgU2VyaWVzQW1tZXRlciggc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCwgdGFuZGVtICksXHJcbiAgICAgICgpID0+IGNyZWF0ZVZlcnRpY2VzKCBDQ0tDQ29uc3RhbnRzLlNFUklFU19BTU1FVEVSX0xFTkdUSCApLCB7XHJcbiAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggQ2lyY3VpdEVsZW1lbnQuQ2lyY3VpdEVsZW1lbnRJTyApLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Nlcmllc0FtbWV0ZXJHcm91cCcgKVxyXG4gICAgICB9ICkgOiBudWxsO1xyXG5cclxuICAgIHRoaXMuZXh0cmVtZUxpZ2h0QnVsYkdyb3VwID0gaW5jbHVkZUV4dHJlbWVFbGVtZW50cyA/IG5ldyBQaGV0aW9Hcm91cChcclxuICAgICAgKCB0YW5kZW0sIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXggKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIExpZ2h0QnVsYi5jcmVhdGVBdFBvc2l0aW9uKCBzdGFydFZlcnRleCwgZW5kVmVydGV4LCB0aGlzLCBDQ0tDQ29uc3RhbnRzLkhJR0hfUkVTSVNUQU5DRSxcclxuICAgICAgICAgIHRoaXMudmlld1R5cGVQcm9wZXJ0eSwgdGFuZGVtLCB7XHJcbiAgICAgICAgICAgIGlzRXh0cmVtZTogdHJ1ZVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICB9LCAoKSA9PiBjcmVhdGVWZXJ0aWNlcyggMTAwICksIHtcclxuICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBDaXJjdWl0RWxlbWVudC5DaXJjdWl0RWxlbWVudElPICksXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXh0cmVtZUxpZ2h0QnVsYkdyb3VwJyApXHJcbiAgICAgIH0gKSA6IG51bGw7XHJcblxyXG4gICAgdGhpcy5jYXBhY2l0b3JHcm91cCA9IHRoaXMuaW5jbHVkZUFDRWxlbWVudHMgPyBuZXcgUGhldGlvR3JvdXAoXHJcbiAgICAgICggdGFuZGVtLCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkgPT4gbmV3IENhcGFjaXRvciggc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCwgdGFuZGVtICksXHJcbiAgICAgICgpID0+IGNyZWF0ZVZlcnRpY2VzKCBDQ0tDQ29uc3RhbnRzLkNBUEFDSVRPUl9MRU5HVEggKSwge1xyXG4gICAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIENpcmN1aXRFbGVtZW50LkNpcmN1aXRFbGVtZW50SU8gKSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjYXBhY2l0b3JHcm91cCcgKVxyXG4gICAgICB9ICkgOiBudWxsO1xyXG5cclxuICAgIHRoaXMuaW5kdWN0b3JHcm91cCA9IHRoaXMuaW5jbHVkZUFDRWxlbWVudHMgPyBuZXcgUGhldGlvR3JvdXAoXHJcbiAgICAgICggdGFuZGVtLCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkgPT4gbmV3IEluZHVjdG9yKCBzdGFydFZlcnRleCwgZW5kVmVydGV4LCB0YW5kZW0gKSxcclxuICAgICAgKCkgPT4gY3JlYXRlVmVydGljZXMoIENDS0NDb25zdGFudHMuSU5EVUNUT1JfTEVOR1RIICksIHtcclxuICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBDaXJjdWl0RWxlbWVudC5DaXJjdWl0RWxlbWVudElPICksXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5kdWN0b3JHcm91cCcgKVxyXG4gICAgICB9ICkgOiBudWxsO1xyXG5cclxuICAgIHRoaXMuc3dpdGNoR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoXHJcbiAgICAgICggdGFuZGVtLCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkgPT4gbmV3IFN3aXRjaCggc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCwgdGFuZGVtLCB0aGlzICksXHJcbiAgICAgICgpID0+IGNyZWF0ZVZlcnRpY2VzKCBDQ0tDQ29uc3RhbnRzLlNXSVRDSF9MRU5HVEggKSwge1xyXG4gICAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIENpcmN1aXRFbGVtZW50LkNpcmN1aXRFbGVtZW50SU8gKSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzd2l0Y2hHcm91cCcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5saWdodEJ1bGJHcm91cCA9IG5ldyBQaGV0aW9Hcm91cCggKCB0YW5kZW0sIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXggKSA9PiB7XHJcbiAgICAgIHJldHVybiBuZXcgTGlnaHRCdWxiKCBzdGFydFZlcnRleCwgZW5kVmVydGV4LCBDQ0tDQ29uc3RhbnRzLkRFRkFVTFRfUkVTSVNUQU5DRSwgdGhpcy52aWV3VHlwZVByb3BlcnR5LCB0YW5kZW0gKTtcclxuICAgIH0sICgpID0+IGNyZWF0ZVZlcnRpY2VzKCAxMDAgKSwge1xyXG4gICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBDaXJjdWl0RWxlbWVudC5DaXJjdWl0RWxlbWVudElPICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpZ2h0QnVsYkdyb3VwJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yZWFsTGlnaHRCdWxiR3JvdXAgPSAoIHRoaXMuaW5jbHVkZUxhYkVsZW1lbnRzICYmICF0aGlzLmluY2x1ZGVBQ0VsZW1lbnRzICkgPyBuZXcgUGhldGlvR3JvdXAoXHJcbiAgICAgICggdGFuZGVtLCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkgPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgTGlnaHRCdWxiKCBzdGFydFZlcnRleCwgZW5kVmVydGV4LCBDQ0tDQ29uc3RhbnRzLkRFRkFVTFRfUkVTSVNUQU5DRSwgdGhpcy52aWV3VHlwZVByb3BlcnR5LCB0YW5kZW0sIHtcclxuICAgICAgICAgIGlzUmVhbDogdHJ1ZSxcclxuICAgICAgICAgIGlzRWRpdGFibGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSwgKCkgPT4gY3JlYXRlVmVydGljZXMoIDEwMCApLCB7XHJcbiAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggQ2lyY3VpdEVsZW1lbnQuQ2lyY3VpdEVsZW1lbnRJTyApLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlYWxMaWdodEJ1bGJHcm91cCcgKVxyXG4gICAgICB9ICkgOiBudWxsO1xyXG5cclxuICAgIHRoaXMuZ3JvdXBzID0gW1xyXG4gICAgICB0aGlzLndpcmVHcm91cCxcclxuICAgICAgdGhpcy5iYXR0ZXJ5R3JvdXAsXHJcbiAgICAgIHRoaXMucmVzaXN0b3JHcm91cCxcclxuICAgICAgdGhpcy5zd2l0Y2hHcm91cCxcclxuICAgICAgdGhpcy5saWdodEJ1bGJHcm91cCxcclxuICAgICAgdGhpcy5mdXNlR3JvdXAsXHJcbiAgICAgIHRoaXMuaG91c2Vob2xkT2JqZWN0R3JvdXAsXHJcbiAgICAgIC4uLiggdGhpcy5leHRyZW1lQmF0dGVyeUdyb3VwID8gWyB0aGlzLmV4dHJlbWVCYXR0ZXJ5R3JvdXAgXSA6IFtdICksXHJcbiAgICAgIC4uLiggdGhpcy5leHRyZW1lUmVzaXN0b3JHcm91cCA/IFsgdGhpcy5leHRyZW1lUmVzaXN0b3JHcm91cCBdIDogW10gKSxcclxuICAgICAgLi4uKCB0aGlzLmV4dHJlbWVMaWdodEJ1bGJHcm91cCA/IFsgdGhpcy5leHRyZW1lTGlnaHRCdWxiR3JvdXAgXSA6IFtdICksXHJcbiAgICAgIC4uLiggdGhpcy5yZWFsTGlnaHRCdWxiR3JvdXAgPyBbIHRoaXMucmVhbExpZ2h0QnVsYkdyb3VwIF0gOiBbXSApLFxyXG4gICAgICAuLi4oIHRoaXMuc2VyaWVzQW1tZXRlckdyb3VwID8gWyB0aGlzLnNlcmllc0FtbWV0ZXJHcm91cCBdIDogW10gKSxcclxuICAgICAgLi4uKCB0aGlzLmFjVm9sdGFnZUdyb3VwID8gWyB0aGlzLmFjVm9sdGFnZUdyb3VwIF0gOiBbXSApLFxyXG4gICAgICAuLi4oIHRoaXMuY2FwYWNpdG9yR3JvdXAgPyBbIHRoaXMuY2FwYWNpdG9yR3JvdXAgXSA6IFtdICksXHJcbiAgICAgIC4uLiggdGhpcy5pbmR1Y3Rvckdyb3VwID8gWyB0aGlzLmluZHVjdG9yR3JvdXAgXSA6IFtdIClcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2VDaXJjdWl0RWxlbWVudCggY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICk6IHZvaWQge1xyXG4gICAgdGhpcy5jaXJjdWl0RWxlbWVudHMucmVtb3ZlKCBjaXJjdWl0RWxlbWVudCApO1xyXG5cclxuICAgIC8vIEZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgZ3JvdXAgdGhhdCBjb250YWlucyB0aGUgY2lyY3VpdEVsZW1lbnQgYW5kIGRpc3Bvc2UgaXQuXHJcbiAgICB0aGlzLmdyb3Vwcy5mb3JFYWNoKCBncm91cCA9PiBncm91cC5pbmNsdWRlcyggY2lyY3VpdEVsZW1lbnQgKSAmJiBncm91cC5kaXNwb3NlRWxlbWVudCggY2lyY3VpdEVsZW1lbnQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgcGFpciBvZiB2ZXJ0aWNlcyB0byBiZSB1c2VkIGZvciBhIG5ldyBDaXJjdWl0RWxlbWVudFxyXG4gICAqIEBwYXJhbSBwb3NpdGlvbiAtIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2VudGVyIG9mIHRoZSBDaXJjdWl0RWxlbWVudFxyXG4gICAqIEBwYXJhbSBsZW5ndGggLSB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgdmVydGljZXNcclxuICAgKiBAcmV0dXJucyB3aXRoIDIgZWxlbWVudHNcclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlVmVydGV4UGFpckFycmF5KCBwb3NpdGlvbjogVmVjdG9yMiwgbGVuZ3RoOiBudW1iZXIgKTogWyBWZXJ0ZXgsIFZlcnRleCBdIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIHRoaXMuY3JlYXRlVmVydGV4KCBwb3NpdGlvbi5wbHVzWFkoIC1sZW5ndGggLyAyLCAwICkgKSxcclxuICAgICAgdGhpcy5jcmVhdGVWZXJ0ZXgoIHBvc2l0aW9uLnBsdXNYWSggbGVuZ3RoIC8gMiwgMCApIClcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBWZXJ0ZXggYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiwgY29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIHRoZSB2ZXJ0aWNlcyBmb3IgQ2lyY3VpdEVsZW1lbnRzLlxyXG4gICAqIEBwYXJhbSBwb3NpdGlvbiAtIHRoZSBwb3NpdGlvbiBvZiB0aGUgVmVydGV4IGluIHZpZXcgPSBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIHByaXZhdGUgY3JlYXRlVmVydGV4KCBwb3NpdGlvbjogVmVjdG9yMiApOiBWZXJ0ZXgge1xyXG4gICAgcmV0dXJuIHRoaXMudmVydGV4R3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIHBvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIG92ZXIgVmVydGV4IGlzIHJlbGVhc2VkIG9yIGJ1bXBlZCBvdmVyIGFub3RoZXIgVmVydGV4LCByb3RhdGUgb25lIGF3YXkgc28gaXQgZG9lc24ndCBhcHBlYXIgY29ubmVjdGVkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgbW92ZVZlcnRpY2VzQXBhcnQoIHYxOiBWZXJ0ZXgsIHYyOiBWZXJ0ZXggKTogdm9pZCB7XHJcbiAgICBjb25zdCB2MU5laWdoYm9ycyA9IHRoaXMuZ2V0TmVpZ2hib3JpbmdWZXJ0aWNlcyggdjEgKTtcclxuICAgIGNvbnN0IHYyTmVpZ2hib3JzID0gdGhpcy5nZXROZWlnaGJvcmluZ1ZlcnRpY2VzKCB2MiApO1xyXG5cclxuICAgIC8vIFdoZW4gdmVydGV4IHYxIGlzIHRvbyBjbG9zZSAoYnV0IG5vdCBjb25uZWN0ZWQpIHRvIHYyLCB3ZSBjaG9vc2UgdmVydGV4IHYzIGFzIGEgcmVmZXJlbmNlIHBvaW50IGZvciBtb3ZpbmdcclxuICAgIC8vIHZlcnRleCB2MSAob3IgdmljZSB2ZXJzYSkuXHJcbiAgICBpZiAoIHYxTmVpZ2hib3JzLmxlbmd0aCA9PT0gMSAmJiAhdjEuYmxhY2tCb3hJbnRlcmZhY2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5idW1wQXdheVNpbmdsZVZlcnRleCggdjEsIHYxTmVpZ2hib3JzWyAwIF0gKTsgLy8gQXJiaXRyYXJpbHkgY2hvb3NlIDB0aCBuZWlnaGJvciB0byBtb3ZlIGF3YXkgZnJvbVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHYyTmVpZ2hib3JzLmxlbmd0aCA9PT0gMSAmJiAhdjIuYmxhY2tCb3hJbnRlcmZhY2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5idW1wQXdheVNpbmdsZVZlcnRleCggdjIsIHYyTmVpZ2hib3JzWyAwIF0gKTsgLy8gQXJiaXRyYXJpbHkgY2hvb3NlIDB0aCBuZWlnaGJvciB0byBtb3ZlIGF3YXkgZnJvbVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRlIHRoZSBwb3NpdGlvbiBvZiBhbGwgY2hhcmdlcy5cclxuICBwdWJsaWMgcmVsYXlvdXRBbGxDaGFyZ2VzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5jaXJjdWl0RWxlbWVudHMuZm9yRWFjaCggY2lyY3VpdEVsZW1lbnQgPT4ge2NpcmN1aXRFbGVtZW50LmNoYXJnZUxheW91dERpcnR5ID0gdHJ1ZTt9ICk7XHJcbiAgICB0aGlzLmxheW91dENoYXJnZXNJbkRpcnR5Q2lyY3VpdEVsZW1lbnRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIHR3byBWZXJ0aWNlcyBhcmUgZHJvcHBlZC9idW1wZWQgdG9vIGNsb3NlIHRvZ2V0aGVyLCBtb3ZlIGF3YXkgdGhlIHByZS1leGlzdGluZyBvbmUgYnkgcm90YXRpbmcgb3JcclxuICAgKiB0cmFuc2xhdGluZyBpdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB2ZXJ0ZXggLSB0aGUgdmVydGV4IHRvIHJvdGF0ZVxyXG4gICAqIEBwYXJhbSBwaXZvdFZlcnRleCAtIHRoZSB2ZXJ0ZXggdG8gcm90YXRlIGFib3V0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBidW1wQXdheVNpbmdsZVZlcnRleCggdmVydGV4OiBWZXJ0ZXgsIHBpdm90VmVydGV4OiBWZXJ0ZXggKTogdm9pZCB7XHJcbiAgICBjb25zdCBkaXN0YW5jZSA9IHZlcnRleC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCBwaXZvdFZlcnRleC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgLy8gSWYgdGhlIHZlcnRpY2VzIGFyZSB0b28gY2xvc2UsIHRoZXkgbXVzdCBiZSB0cmFuc2xhdGVkIGF3YXlcclxuICAgIGlmICggZGlzdGFuY2UgPCBCVU1QX0FXQVlfUkFESVVTICkge1xyXG5cclxuICAgICAgbGV0IGRpZmZlcmVuY2UgPSBwaXZvdFZlcnRleC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLm1pbnVzKCB2ZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgLy8gU3VwcG9ydCB3aGVuIHZlcnRleCBpcyBvbiB0aGUgcGl2b3QsIG1haW5seSBmb3IgZnV6eiB0ZXN0aW5nLiAgSW4gdGhhdCBjYXNlLCBqdXN0IG1vdmUgZGlyZWN0bHkgdG8gdGhlIHJpZ2h0XHJcbiAgICAgIGlmICggZGlmZmVyZW5jZS5tYWduaXR1ZGUgPT09IDAgKSB7XHJcbiAgICAgICAgZGlmZmVyZW5jZSA9IG5ldyBWZWN0b3IyKCAxLCAwICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRlbHRhID0gZGlmZmVyZW5jZS5ub3JtYWxpemVkKCkudGltZXMoIC1TTkFQX1JBRElVUyAqIDEuNSApO1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZVZlcnRleEdyb3VwKCB2ZXJ0ZXgsIGRlbHRhICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIE90aGVyIHZlcnRpY2VzIHNob3VsZCBiZSByb3RhdGVkIGF3YXksIHdoaWNoIGhhbmRsZXMgbm9uLXN0cmV0Y2h5IGNvbXBvbmVudHMgd2VsbC4gRm9yIHNtYWxsIGNvbXBvbmVudHMgbGlrZVxyXG4gICAgICAvLyBiYXR0ZXJpZXMgKHdoaWNoIGFyZSBhcm91bmQgMTAwIHZpZXcgdW5pdHMgbG9uZyksIHJvdGF0ZSBNYXRoLlBJLzQuIExvbmdlciBjb21wb25lbnRzIGRvbid0IG5lZWQgdG8gcm90YXRlXHJcbiAgICAgIC8vIGJ5IHN1Y2ggYSBsYXJnZSBhbmdsZSBiZWNhdXNlIHRoZSBhcmMgbGVuZ3RoIHdpbGwgYmUgcHJvcG9ydGlvbmF0ZWx5IGxvbmdlcixcclxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2lzc3Vlcy8zNDRcclxuICAgICAgY29uc3Qgc2VhcmNoQW5nbGUgPSBNYXRoLlBJIC8gNCAqIDEwMCAvIGRpc3RhbmNlO1xyXG4gICAgICB0aGlzLnJvdGF0ZVNpbmdsZVZlcnRleEJ5QW5nbGUoIHZlcnRleCwgcGl2b3RWZXJ0ZXgsIHNlYXJjaEFuZ2xlICk7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlMSA9IHRoaXMuY2xvc2VzdERpc3RhbmNlVG9PdGhlclZlcnRleCggdmVydGV4ICk7XHJcbiAgICAgIHRoaXMucm90YXRlU2luZ2xlVmVydGV4QnlBbmdsZSggdmVydGV4LCBwaXZvdFZlcnRleCwgLTIgKiBzZWFyY2hBbmdsZSApO1xyXG4gICAgICBjb25zdCBkaXN0YW5jZTIgPSB0aGlzLmNsb3Nlc3REaXN0YW5jZVRvT3RoZXJWZXJ0ZXgoIHZlcnRleCApO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGlzdGFuY2UxICE9PSBudWxsICYmIGRpc3RhbmNlMiAhPT0gbnVsbCApO1xyXG4gICAgICBpZiAoIGRpc3RhbmNlMiEgPD0gZGlzdGFuY2UxISApIHtcclxuXHJcbiAgICAgICAgLy8gZ28gYmFjayB0byB0aGUgYmVzdCBzcG90XHJcbiAgICAgICAgdGhpcy5yb3RhdGVTaW5nbGVWZXJ0ZXhCeUFuZ2xlKCB2ZXJ0ZXgsIHBpdm90VmVydGV4LCAyICogc2VhcmNoQW5nbGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSBnaXZlbiBWZXJ0ZXggYWJvdXQgdGhlIHNwZWNpZmllZCBWZXJ0ZXggYnkgdGhlIGdpdmVuIGFuZ2xlXHJcbiAgICogQHBhcmFtIHZlcnRleCAtIHRoZSB2ZXJ0ZXggd2hpY2ggd2lsbCBiZSByb3RhdGVkXHJcbiAgICogQHBhcmFtIHBpdm90VmVydGV4IC0gdGhlIG9yaWdpbiBhYm91dCB3aGljaCB0aGUgdmVydGV4IHdpbGwgcm90YXRlXHJcbiAgICogQHBhcmFtIGRlbHRhQW5nbGUgLSBhbmdsZSBpbiByYWRpYW5zIHRvIHJvdGF0ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgcm90YXRlU2luZ2xlVmVydGV4QnlBbmdsZSggdmVydGV4OiBWZXJ0ZXgsIHBpdm90VmVydGV4OiBWZXJ0ZXgsIGRlbHRhQW5nbGU6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gdmVydGV4LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBwaXZvdFBvc2l0aW9uID0gcGl2b3RWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICBjb25zdCBkaXN0YW5jZUZyb21WZXJ0ZXggPSBwb3NpdGlvbi5kaXN0YW5jZSggcGl2b3RQb3NpdGlvbiApO1xyXG4gICAgY29uc3QgYW5nbGUgPSBwb3NpdGlvbi5taW51cyggcGl2b3RQb3NpdGlvbiApLmFuZ2xlO1xyXG5cclxuICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gcGl2b3RQb3NpdGlvbi5wbHVzKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBkaXN0YW5jZUZyb21WZXJ0ZXgsIGFuZ2xlICsgZGVsdGFBbmdsZSApICk7XHJcbiAgICB2ZXJ0ZXgudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ld1Bvc2l0aW9uICk7XHJcbiAgICB2ZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ld1Bvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgdGhlIGRpc3RhbmNlIHRvIHRoZSBjbG9zZXN0IFZlcnRleFxyXG4gICAqIEBwYXJhbSB2ZXJ0ZXhcclxuICAgKiBAcmV0dXJucyAtIGRpc3RhbmNlIHRvIG5lYXJlc3Qgb3RoZXIgVmVydGV4IGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgKi9cclxuICBwcml2YXRlIGNsb3Nlc3REaXN0YW5jZVRvT3RoZXJWZXJ0ZXgoIHZlcnRleDogVmVydGV4ICk6IG51bWJlciB8IG51bGwge1xyXG4gICAgbGV0IGNsb3Nlc3REaXN0YW5jZSA9IG51bGw7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnZlcnRleEdyb3VwLmNvdW50OyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHYgPSB0aGlzLnZlcnRleEdyb3VwLmdldEVsZW1lbnQoIGkgKTtcclxuICAgICAgaWYgKCB2ICE9PSB2ZXJ0ZXggKSB7XHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB2LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHZlcnRleC5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgaWYgKCBjbG9zZXN0RGlzdGFuY2UgPT09IG51bGwgfHwgZGlzdGFuY2UgPCBjbG9zZXN0RGlzdGFuY2UgKSB7XHJcbiAgICAgICAgICBjbG9zZXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjbG9zZXN0RGlzdGFuY2U7XHJcbiAgfVxyXG5cclxuICAvLyBSZW1vdmUgYWxsIGVsZW1lbnRzIGZyb20gdGhlIGNpcmN1aXQuXHJcbiAgcHJpdmF0ZSBjbGVhcigpOiB2b2lkIHtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgLy8gVmVydGljZXMgbXVzdCBiZSBjbGVhcmVkIGZyb20gdGhlIGJsYWNrIGJveCBzY3JlZW4tLWl0J3Mgbm90IGhhbmRsZWQgYnkgY2xlYXJpbmcgdGhlIGNpcmN1aXQgZWxlbWVudHNcclxuICAgIGlmICggdGhpcy5ibGFja0JveFN0dWR5ICkge1xyXG5cclxuICAgICAgLy8gY2xlYXIgcmVmZXJlbmNlcywgZG8gbm90IGRpc3Bvc2UgYmVjYXVzZSBzb21lIGl0ZW1zIGdldCBhZGRlZCBiYWNrIGluIHRoZSBibGFjayBib3guXHJcbiAgICAgIHRoaXMuY2lyY3VpdEVsZW1lbnRzLmNsZWFyKCk7XHJcblxyXG4gICAgICAvLyBPbmx5IGRpc3Bvc2UgdmVydGljZXMgbm90IGF0dGFjaGVkIHRvIHRoZSBibGFjayBib3hcclxuICAgICAgY29uc3QgdG9EaXNwb3NlID0gdGhpcy52ZXJ0ZXhHcm91cC5maWx0ZXIoIHZlcnRleCA9PiAhdmVydGV4LmJsYWNrQm94SW50ZXJmYWNlUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgdG9EaXNwb3NlLmZvckVhY2goIHZlcnRleCA9PiB0aGlzLnZlcnRleEdyb3VwLmRpc3Bvc2VFbGVtZW50KCB2ZXJ0ZXggKSApO1xyXG5cclxuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgdGhpcy5jaXJjdWl0RWxlbWVudHMuY2xlYXIoKTtcclxuICAgICAgdGhpcy5ncm91cHMuZm9yRWFjaCggZ3JvdXAgPT4gZ3JvdXAuY2xlYXIoKSApO1xyXG4gICAgICB0aGlzLnZlcnRleEdyb3VwLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTcGxpdCB0aGUgVmVydGV4IGludG8gc2VwYXJhdGUgdmVydGljZXMuXHJcbiAgICogQHBhcmFtIHZlcnRleCAtIHRoZSB2ZXJ0ZXggdG8gYmUgY3V0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjdXRWZXJ0ZXgoIHZlcnRleDogVmVydGV4ICk6IHZvaWQge1xyXG5cclxuICAgIC8vIE9ubHkgcGVybWl0IGN1dHRpbmcgYSBub24tZHJhZ2dlZCB2ZXJ0ZXgsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvNDE0XHJcbiAgICBpZiAoIHZlcnRleC5pc0RyYWdnZWQgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCBuZWlnaGJvckNpcmN1aXRFbGVtZW50cyA9IHRoaXMuZ2V0TmVpZ2hib3JDaXJjdWl0RWxlbWVudHMoIHZlcnRleCApO1xyXG4gICAgaWYgKCBuZWlnaGJvckNpcmN1aXRFbGVtZW50cy5sZW5ndGggPD0gMSApIHtcclxuXHJcbiAgICAgIC8vIE5vIHdvcmsgbmVjZXNzYXJ5IGZvciBhbiB1bmF0dGFjaGVkIHZlcnRleFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT25seSBtb3ZlIGludGVyYWN0aXZlIGNpcmN1aXQgZWxlbWVudHNcclxuICAgIG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzID0gbmVpZ2hib3JDaXJjdWl0RWxlbWVudHMuZmlsdGVyKCBjaXJjdWl0RWxlbWVudCA9PiBjaXJjdWl0RWxlbWVudC5pbnRlcmFjdGl2ZVByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0aGF0IGlkZW50aWZpZXMgd2hlcmUgdmVydGljZXMgd291bGQgZ28gaWYgcHVsbGVkIHRvd2FyZCB0aGVpciBuZWlnaGJvcnNcclxuICAgICAqL1xyXG4gICAgY29uc3QgZ2V0VHJhbnNsYXRpb25zID0gKCkgPT4ge1xyXG4gICAgICByZXR1cm4gbmVpZ2hib3JDaXJjdWl0RWxlbWVudHMubWFwKCBjaXJjdWl0RWxlbWVudCA9PiB7XHJcbiAgICAgICAgY29uc3Qgb3Bwb3NpdGVQb3NpdGlvbiA9IGNpcmN1aXRFbGVtZW50LmdldE9wcG9zaXRlVmVydGV4KCB2ZXJ0ZXggKS5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdmVydGV4LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgbGV0IGRlbHRhID0gb3Bwb3NpdGVQb3NpdGlvbi5taW51cyggcG9zaXRpb24gKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHZlcnRpY2VzIHdlcmUgYXQgdGhlIHNhbWUgcG9zaXRpb24sIG1vdmUgdGhlbSByYW5kb21seS4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvNDA1XHJcbiAgICAgICAgaWYgKCBkZWx0YS5tYWduaXR1ZGUgPT09IDAgKSB7XHJcbiAgICAgICAgICBkZWx0YSA9IFZlY3RvcjIuY3JlYXRlUG9sYXIoIDEsIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiBNYXRoLlBJICogMiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVsdGEud2l0aE1hZ25pdHVkZSggMzAgKTtcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBUcmFjayB3aGVyZSB0aGV5IHdvdWxkIGdvIGlmIHRoZXkgbW92ZWQgdG93YXJkIHRoZWlyIG9wcG9zaXRlIHZlcnRpY2VzXHJcbiAgICBsZXQgdHJhbnNsYXRpb25zID0gZ2V0VHJhbnNsYXRpb25zKCk7XHJcbiAgICBsZXQgYW5nbGVzID0gdHJhbnNsYXRpb25zLm1hcCggdCA9PiB0LmFuZ2xlICk7XHJcblxyXG4gICAgaWYgKCBuZWlnaGJvckNpcmN1aXRFbGVtZW50cy5sZW5ndGggPiAyICkge1xyXG5cclxuICAgICAgLy8gUmVvcmRlciBlbGVtZW50cyBiYXNlZCBvbiBhbmdsZSBzbyB0aGV5IGRvbid0IGNyb3NzIG92ZXIgd2hlbiBzcHJlYWQgb3V0XHJcbiAgICAgIG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzID0gXy5zb3J0QnkoIG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzLCBuID0+IHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzLmluZGV4T2YoIG4gKTtcclxuICAgICAgICByZXR1cm4gYW5nbGVzWyBpbmRleCBdO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIGFuZ2xlcyBpbiB0aGUgY29ycmVjdGVkIG9yZGVyXHJcbiAgICAgIHRyYW5zbGF0aW9ucyA9IGdldFRyYW5zbGF0aW9ucygpO1xyXG4gICAgICBhbmdsZXMgPSB0cmFuc2xhdGlvbnMubWFwKCB0ID0+IHQuYW5nbGUgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXBhcmF0aW9uID0gTWF0aC5QSSAqIDIgLyBuZWlnaGJvckNpcmN1aXRFbGVtZW50cy5sZW5ndGg7XHJcbiAgICBsZXQgcmVzdWx0czogVmVjdG9yMltdID0gW107XHJcblxyXG4gICAgY29uc3QgY2VudGVyQW5nbGUgPSBfLnN1bSggYW5nbGVzICkgLyBhbmdsZXMubGVuZ3RoO1xyXG5cclxuICAgIC8vIE1vdmUgdmVydGljZXMgYXdheSBmcm9tIGN1dCB2ZXJ0ZXggc28gdGhhdCB3aXJlcyBkb24ndCBvdmVybGFwXHJcbiAgICBpZiAoIG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzLmxlbmd0aCA9PT0gMiApIHtcclxuXHJcbiAgICAgIGNvbnN0IGF4ID0gVmVjdG9yMi5jcmVhdGVQb2xhciggMzAsIGNlbnRlckFuZ2xlIC0gc2VwYXJhdGlvbiAvIG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzLmxlbmd0aCApO1xyXG4gICAgICBjb25zdCBieCA9IFZlY3RvcjIuY3JlYXRlUG9sYXIoIDMwLCBjZW50ZXJBbmdsZSArIHNlcGFyYXRpb24gLyBuZWlnaGJvckNpcmN1aXRFbGVtZW50cy5sZW5ndGggKTtcclxuXHJcbiAgICAgIGNvbnN0IGRlbHRhQW5nbGUgPSBhbmdsZXNbIDAgXSAtIGNlbnRlckFuZ2xlO1xyXG5cclxuICAgICAgcmVzdWx0cyA9IGRlbHRhQW5nbGUgPCAwID8gWyBheCwgYnggXSA6IFsgYngsIGF4IF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgZGlzdGFuY2UgPSBuZWlnaGJvckNpcmN1aXRFbGVtZW50cy5sZW5ndGggPD0gNSA/IDMwIDogbmVpZ2hib3JDaXJjdWl0RWxlbWVudHMubGVuZ3RoICogMzAgLyA1O1xyXG4gICAgICBuZWlnaGJvckNpcmN1aXRFbGVtZW50cy5mb3JFYWNoKCAoIGNpcmN1aXRFbGVtZW50LCBrICkgPT4ge1xyXG4gICAgICAgIHJlc3VsdHMucHVzaCggVmVjdG9yMi5jcmVhdGVQb2xhciggZGlzdGFuY2UsIHNlcGFyYXRpb24gKiBrICsgYW5nbGVzWyAwIF0gKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgbmVpZ2hib3JDaXJjdWl0RWxlbWVudHMuZm9yRWFjaCggKCBjaXJjdWl0RWxlbWVudCwgaSApID0+IHtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgbmV3IHZlcnRleCB0byB0aGUgbW9kZWwgZmlyc3Qgc28gdGhhdCBpdCBjYW4gYmUgdXBkYXRlZCBpbiBzdWJzZXF1ZW50IGNhbGxzXHJcbiAgICAgIGNvbnN0IG5ld1ZlcnRleCA9IHRoaXMudmVydGV4R3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIHZlcnRleC5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgICBjaXJjdWl0RWxlbWVudC5yZXBsYWNlVmVydGV4KCB2ZXJ0ZXgsIG5ld1ZlcnRleCApO1xyXG5cclxuICAgICAgLy8gQnVtcCB0aGUgdmVydGljZXMgYXdheSBmcm9tIHRoZSBvcmlnaW5hbCB2ZXJ0ZXhcclxuICAgICAgdGhpcy50cmFuc2xhdGVWZXJ0ZXhHcm91cCggbmV3VmVydGV4LCByZXN1bHRzWyBpIF0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoICF2ZXJ0ZXguYmxhY2tCb3hJbnRlcmZhY2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy52ZXJ0ZXhHcm91cC5kaXNwb3NlRWxlbWVudCggdmVydGV4ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNsYXRlIGFsbCB2ZXJ0aWNlcyBjb25uZWN0ZWQgdG8gdGhlIG1haW5WZXJ0ZXggYnkgRml4ZWRDaXJjdWl0RWxlbWVudHMgYnkgdGhlIGdpdmVuIGRpc3RhbmNlXHJcbiAgICpcclxuICAgKiBOb3RlOiBkbyBub3QgY29uZnVzZSB0aGlzIHdpdGggQ2lyY3VpdE5vZGUudHJhbnNsYXRlVmVydGV4R3JvdXAgd2hpY2ggcHJvcG9zZXMgY29ubmVjdGlvbnMgd2hpbGUgZHJhZ2dpbmdcclxuICAgKlxyXG4gICAqIEBwYXJhbSBtYWluVmVydGV4IC0gdGhlIHZlcnRleCB3aG9zZSBncm91cCB3aWxsIGJlIHRyYW5zbGF0ZWRcclxuICAgKiBAcGFyYW0gZGVsdGEgLSB0aGUgdmVjdG9yIGJ5IHdoaWNoIHRvIG1vdmUgdGhlIHZlcnRleCBncm91cFxyXG4gICAqL1xyXG4gIHByaXZhdGUgdHJhbnNsYXRlVmVydGV4R3JvdXAoIG1haW5WZXJ0ZXg6IFZlcnRleCwgZGVsdGE6IFZlY3RvcjIgKTogdm9pZCB7XHJcbiAgICBjb25zdCB2ZXJ0ZXhBcnJheSA9IHRoaXMuZmluZEFsbEZpeGVkVmVydGljZXMoIG1haW5WZXJ0ZXggKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB2ZXJ0ZXhBcnJheS5sZW5ndGg7IGorKyApIHtcclxuICAgICAgY29uc3QgdmVydGV4ID0gdmVydGV4QXJyYXlbIGogXTtcclxuXHJcbiAgICAgIC8vIE9ubHkgdHJhbnNsYXRlIHZlcnRpY2VzIHRoYXQgYXJlIG1vdmFibGUgYW5kIG5vdCBjb25uZWN0ZWQgdG8gdGhlIGJsYWNrIGJveCBpbnRlcmZhY2UgYnkgRml4ZWRMZW5ndGggZWxlbWVudHNcclxuICAgICAgaWYgKCB2ZXJ0ZXguaXNEcmFnZ2FibGVQcm9wZXJ0eS5nZXQoKSAmJiAhdGhpcy5oYXNGaXhlZENvbm5lY3Rpb25Ub0JsYWNrQm94SW50ZXJmYWNlVmVydGV4KCB2ZXJ0ZXggKSApIHtcclxuICAgICAgICB2ZXJ0ZXguc2V0UG9zaXRpb24oIHZlcnRleC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIGRlbHRhICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiB2ZXJ0ZXggaGFzIGEgZml4ZWQgY29ubmVjdGlvbiB0byBhIGJsYWNrIGJveCBpbnRlcmZhY2UgdmVydGV4LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFzRml4ZWRDb25uZWN0aW9uVG9CbGFja0JveEludGVyZmFjZVZlcnRleCggdmVydGV4OiBWZXJ0ZXggKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBmaXhlZFZlcnRpY2VzID0gdGhpcy5maW5kQWxsRml4ZWRWZXJ0aWNlcyggdmVydGV4ICk7XHJcbiAgICByZXR1cm4gXy5zb21lKCBmaXhlZFZlcnRpY2VzLCBmaXhlZFZlcnRleCA9PiBmaXhlZFZlcnRleC5ibGFja0JveEludGVyZmFjZVByb3BlcnR5LmdldCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIENpcmN1aXRFbGVtZW50IGlzIG5vdCBjb25uZWN0ZWQgdG8gYW55IG90aGVyIENpcmN1aXRFbGVtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc1NpbmdsZSggY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TmVpZ2hib3JDaXJjdWl0RWxlbWVudHMoIGNpcmN1aXRFbGVtZW50LnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCkgKS5sZW5ndGggPT09IDEgJiZcclxuICAgICAgICAgICB0aGlzLmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzKCBjaXJjdWl0RWxlbWVudC5lbmRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKSApLmxlbmd0aCA9PT0gMTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gcmVtb3ZpbmcgYSBDaXJjdWl0RWxlbWVudCwgYWxzbyByZW1vdmUgaXRzIHN0YXJ0L2VuZCBWZXJ0ZXggaWYgaXQgY2FuIGJlIHJlbW92ZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZW1vdmVWZXJ0ZXhJZk9ycGhhbmVkKCB2ZXJ0ZXg6IFZlcnRleCApOiB2b2lkIHtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy5nZXROZWlnaGJvckNpcmN1aXRFbGVtZW50cyggdmVydGV4ICkubGVuZ3RoID09PSAwICYmXHJcbiAgICAgICF2ZXJ0ZXguYmxhY2tCb3hJbnRlcmZhY2VQcm9wZXJ0eS5nZXQoKSAmJlxyXG4gICAgICAhdmVydGV4LmlzRGlzcG9zZWRcclxuICAgICkge1xyXG4gICAgICB0aGlzLnZlcnRleEdyb3VwLmRpc3Bvc2VFbGVtZW50KCB2ZXJ0ZXggKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbGwgb2YgdGhlIENpcmN1aXRFbGVtZW50cyB0aGF0IGNvbnRhaW4gdGhlIGdpdmVuIFZlcnRleC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TmVpZ2hib3JDaXJjdWl0RWxlbWVudHMoIHZlcnRleDogVmVydGV4ICk6IENpcmN1aXRFbGVtZW50W10ge1xyXG4gICAgcmV0dXJuIHRoaXMuY2lyY3VpdEVsZW1lbnRzLmZpbHRlciggY2lyY3VpdEVsZW1lbnQgPT4gY2lyY3VpdEVsZW1lbnQuY29udGFpbnNWZXJ0ZXgoIHZlcnRleCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYWxsIG9mIHRoZSBDaXJjdWl0RWxlbWVudHMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHRoZSBnaXZlbiBDaXJjdWl0RWxlbWVudFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0TmVpZ2hib3JDaXJjdWl0RWxlbWVudHNGb3JDaXJjdWl0RWxlbWVudCggZWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKTogQ2lyY3VpdEVsZW1lbnRbXSB7XHJcbiAgICByZXR1cm4gWyAuLi50aGlzLmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzKCBlbGVtZW50LnN0YXJ0VmVydGV4UHJvcGVydHkudmFsdWUgKSxcclxuICAgICAgLi4udGhpcy5nZXROZWlnaGJvckNpcmN1aXRFbGVtZW50cyggZWxlbWVudC5lbmRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSApIF0uZmlsdGVyKCBlbCA9PiB7XHJcbiAgICAgIHJldHVybiBlbCAhPT0gZWxlbWVudDtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBDaXJjdWl0RWxlbWVudHMgY29ubmVjdGVkIHRvIHRoZSBzcGVjaWZpZWQgVmVydGV4XHJcbiAgICovXHJcbiAgcHVibGljIGNvdW50Q2lyY3VpdEVsZW1lbnRzKCB2ZXJ0ZXg6IFZlcnRleCApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuY2lyY3VpdEVsZW1lbnRzLmNvdW50KCBjaXJjdWl0RWxlbWVudCA9PiBjaXJjdWl0RWxlbWVudC5jb250YWluc1ZlcnRleCggdmVydGV4ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHZvbHRhZ2UgYmV0d2VlbiB0d28gcG9pbnRzLiAgQ29tcHV0ZWQgaW4gdGhlIHZpZXcgYmVjYXVzZSB2aWV3IGNvb3JkaW5hdGVzIGFyZSB1c2VkIGluIHRoZSBjb21wdXRhdGlvbi5cclxuICAgKiBAcGFyYW0gcmVkQ29ubmVjdGlvblxyXG4gICAqIEBwYXJhbSBibGFja0Nvbm5lY3Rpb25cclxuICAgKiBAcGFyYW0gcmV2ZWFsaW5nIC0gd2hldGhlciB0aGUgYmxhY2sgYm94IGlzIGluIFwicmV2ZWFsXCIgbW9kZWxcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Vm9sdGFnZUJldHdlZW5Db25uZWN0aW9ucyggcmVkQ29ubmVjdGlvbjogVm9sdGFnZUNvbm5lY3Rpb24gfCBudWxsLCBibGFja0Nvbm5lY3Rpb246IFZvbHRhZ2VDb25uZWN0aW9uIHwgbnVsbCwgcmV2ZWFsaW5nOiBib29sZWFuICk6IG51bWJlciB8IG51bGwge1xyXG5cclxuICAgIGlmICggcmVkQ29ubmVjdGlvbiA9PT0gbnVsbCB8fCBibGFja0Nvbm5lY3Rpb24gPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoICF0aGlzLmFyZVZlcnRpY2VzRWxlY3RyaWNhbGx5Q29ubmVjdGVkKCByZWRDb25uZWN0aW9uLnZlcnRleCwgYmxhY2tDb25uZWN0aW9uLnZlcnRleCApICkge1xyXG5cclxuICAgICAgLy8gVm9sdG1ldGVyIHByb2JlcyBlYWNoIGhpdCB0aGluZ3MgYnV0IHRoZXkgd2VyZSBub3QgY29ubmVjdGVkIHRvIGVhY2ggb3RoZXIgdGhyb3VnaCB0aGUgY2lyY3VpdC5cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggcmVkQ29ubmVjdGlvbi52ZXJ0ZXguaW5zaWRlVHJ1ZUJsYWNrQm94UHJvcGVydHkuZ2V0KCkgJiYgIXJldmVhbGluZyApIHtcclxuXHJcbiAgICAgIC8vIENhbm5vdCByZWFkIHZhbHVlcyBpbnNpZGUgdGhlIGJsYWNrIGJveCwgdW5sZXNzIFwicmV2ZWFsXCIgaXMgYmVpbmcgcHJlc3NlZFxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBibGFja0Nvbm5lY3Rpb24udmVydGV4Lmluc2lkZVRydWVCbGFja0JveFByb3BlcnR5LmdldCgpICYmICFyZXZlYWxpbmcgKSB7XHJcblxyXG4gICAgICAvLyBDYW5ub3QgcmVhZCB2YWx1ZXMgaW5zaWRlIHRoZSBibGFjayBib3gsIHVubGVzcyBcInJldmVhbFwiIGlzIGJlaW5nIHByZXNzZWRcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHJlZENvbm5lY3Rpb24udm9sdGFnZSAtIGJsYWNrQ29ubmVjdGlvbi52b2x0YWdlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVmVydGljZXMgYXJlIGVsZWN0cmljYWxseSBjb25uZWN0ZWQgdGhyb3VnaCBhbnkgYXJiaXRyYXJ5IGNvbm5lY3Rpb25zLiAgQW5cclxuICAgKiBvcGVuIHN3aXRjaCBicmVha3MgdGhlIGNvbm5lY3Rpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhcmVWZXJ0aWNlc0VsZWN0cmljYWxseUNvbm5lY3RlZCggdmVydGV4MTogVmVydGV4LCB2ZXJ0ZXgyOiBWZXJ0ZXggKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBjb25uZWN0ZWRWZXJ0aWNlcyA9IHRoaXMuc2VhcmNoVmVydGljZXMoIHZlcnRleDEsICggc3RhcnRWZXJ0ZXgsIGNpcmN1aXRFbGVtZW50ICkgPT4ge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgY2lyY3VpdCBlbGVtZW50IGhhcyBhIGNsb3NlZCBwcm9wZXJ0eSAobGlrZSBhIFN3aXRjaCksIGl0IGlzIG9ubHkgT0sgdG8gdHJhdmVyc2UgaWYgdGhlIGVsZW1lbnQgaXNcclxuICAgICAgICAvLyBjbG9zZWQuXHJcbiAgICAgICAgaWYgKCBjaXJjdWl0RWxlbWVudCBpbnN0YW5jZW9mIFN3aXRjaCApIHtcclxuICAgICAgICAgIHJldHVybiBjaXJjdWl0RWxlbWVudC5pc0Nsb3NlZFByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBFdmVyeXRoaW5nIGVsc2UgaXMgdHJhdmVyc2libGVcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHJldHVybiBjb25uZWN0ZWRWZXJ0aWNlcy5pbmNsdWRlcyggdmVydGV4MiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiBzb21lIHBoeXNpY2FsIGNoYXJhY3RlcmlzdGljIGhhcyBjaGFuZ2VkLCB3ZSBtdXN0IHJlY29tcHV0ZSB0aGUgdm9sdGFnZXMgYW5kIGN1cnJlbnRzLiAgTWFyayBhc1xyXG4gICAqIGRpcnR5IGFuZCBjb21wdXRlIGluIHN0ZXAgaWYgYW55dGhpbmcgaGFzIGNoYW5nZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBtYXJrRGlydHkoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIENvbm5lY3QgdGhlIHZlcnRpY2VzLCBtZXJnaW5nIG9sZFZlcnRleCBpbnRvIHZlcnRleDEgYW5kIGRlbGV0aW5nIG9sZFZlcnRleFxyXG4gIHB1YmxpYyBjb25uZWN0KCB0YXJnZXRWZXJ0ZXg6IFZlcnRleCwgb2xkVmVydGV4OiBWZXJ0ZXggKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0YXJnZXRWZXJ0ZXguYXR0YWNoYWJsZVByb3BlcnR5LmdldCgpICYmIG9sZFZlcnRleC5hdHRhY2hhYmxlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICdib3RoIHZlcnRpY2VzIHNob3VsZCBiZSBhdHRhY2hhYmxlJyApO1xyXG5cclxuICAgIC8vIEtlZXAgdGhlIGJsYWNrIGJveCB2ZXJ0aWNlc1xyXG4gICAgaWYgKCBvbGRWZXJ0ZXguYmxhY2tCb3hJbnRlcmZhY2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRhcmdldFZlcnRleC5ibGFja0JveEludGVyZmFjZVByb3BlcnR5LmdldCgpLCAnY2Fubm90IGF0dGFjaCBibGFjayBib3ggaW50ZXJmYWNlIHZlcnRleCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndG8gYmxhY2sgYm94IGludGVyZmFjZSB2ZXJ0ZXgnICk7XHJcbiAgICAgIHRoaXMuY29ubmVjdCggb2xkVmVydGV4LCB0YXJnZXRWZXJ0ZXggKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmNpcmN1aXRFbGVtZW50cy5mb3JFYWNoKCBjaXJjdWl0RWxlbWVudCA9PiB7XHJcbiAgICAgICAgaWYgKCBjaXJjdWl0RWxlbWVudC5jb250YWluc1ZlcnRleCggb2xkVmVydGV4ICkgKSB7XHJcbiAgICAgICAgICBjaXJjdWl0RWxlbWVudC5yZXBsYWNlVmVydGV4KCBvbGRWZXJ0ZXgsIHRhcmdldFZlcnRleCApO1xyXG4gICAgICAgICAgY2lyY3VpdEVsZW1lbnQuY29ubmVjdGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBJbmhlcml0IG5vbi1kZWZhdWx0c1xyXG5cclxuICAgICAgLy8gSWYgZWl0aGVyIHZlcnRleCB3YXMgbm9uLWRyYWdnYWJsZSwgdGhlIHJlc3VsdGFudCB2ZXJ0ZXggc2hvdWxkIGJlIG5vbi1kcmFnZ2FibGVcclxuICAgICAgaWYgKCAhb2xkVmVydGV4LmlzRHJhZ2dhYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGFyZ2V0VmVydGV4LmlzRHJhZ2dhYmxlUHJvcGVydHkudmFsdWUgPSBvbGRWZXJ0ZXguaXNEcmFnZ2FibGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgZWl0aGVyIHZlcnRleCB3YXMgbm9uLWN1dHRhYmxlLCB0aGUgcmVzdWx0YW50IHZlcnRleCBzaG91bGQgYmUgbm9uLWN1dHRhYmxlXHJcbiAgICAgIGlmICggIW9sZFZlcnRleC5pc0N1dHRhYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGFyZ2V0VmVydGV4LmlzQ3V0dGFibGVQcm9wZXJ0eS52YWx1ZSA9IG9sZFZlcnRleC5pc0N1dHRhYmxlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHRoZSBkcmFnZ2VkIHZlcnRleCBoYWQgbm8gbGFiZWwsIHRha2UgdGhlIGxhYmVsIG9mIHRoZSByZXBsYWNlZCB2ZXJ0ZXhcclxuICAgICAgaWYgKCB0YXJnZXRWZXJ0ZXgubGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSA9PT0gJycgKSB7XHJcbiAgICAgICAgdGFyZ2V0VmVydGV4LmxhYmVsU3RyaW5nUHJvcGVydHkudmFsdWUgPSBvbGRWZXJ0ZXgubGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy52ZXJ0ZXhHcm91cC5kaXNwb3NlRWxlbWVudCggb2xkVmVydGV4ICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFvbGRWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5oYXNMaXN0ZW5lcnMoKSwgJ1JlbW92ZWQgdmVydGV4IHNob3VsZCBub3QgaGF2ZSBhbnkgbGlzdGVuZXJzJyApO1xyXG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG5cclxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzb2xkZXIgaXMgZGlzcGxheWVkIGluIHRoZSBjb3JyZWN0IHotb3JkZXJcclxuICAgICAgdGFyZ2V0VmVydGV4LnJlbGF5ZXJFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgZm9yd2FyZCBpbiB0aW1lXHJcbiAgICogQHBhcmFtIGR0IC0gdGhlIGVsYXBzZWQgdGltZSBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gSW52b2tlIGFueSBzY2hlZHVsZWQgYWN0aW9uc1xyXG4gICAgdGhpcy5zdGVwQWN0aW9ucy5mb3JFYWNoKCBzdGVwQWN0aW9uID0+IHN0ZXBBY3Rpb24oKSApO1xyXG4gICAgdGhpcy5zdGVwQWN0aW9ucy5sZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIE1vdmUgZm9yd2FyZCB0aW1lXHJcbiAgICB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZSArPSBkdDtcclxuXHJcbiAgICBjb25zdCBzdGVwRWxlbWVudHMgPSB0aGlzLmNpcmN1aXRFbGVtZW50cy5maWx0ZXIoIGVsZW1lbnQgPT4gZWxlbWVudC5zdGVwICk7XHJcbiAgICBjb25zdCBkeW5hbWljRWxlbWVudHMgPSB0aGlzLmNpcmN1aXRFbGVtZW50cy5maWx0ZXIoIGVsZW1lbnQgPT4gZWxlbWVudCBpbnN0YW5jZW9mIER5bmFtaWNDaXJjdWl0RWxlbWVudCApO1xyXG4gICAgc3RlcEVsZW1lbnRzLmZvckVhY2goIGVsZW1lbnQgPT4gZWxlbWVudC5zdGVwKCB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZSwgZHQsIHRoaXMgKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5kaXJ0eSB8fCBzdGVwRWxlbWVudHMubGVuZ3RoID4gMCB8fCBkeW5hbWljRWxlbWVudHMubGVuZ3RoID4gMCApIHtcclxuICAgICAgTGluZWFyVHJhbnNpZW50QW5hbHlzaXMuc29sdmVNb2RpZmllZE5vZGFsQW5hbHlzaXMoIHRoaXMsIGR0ICk7XHJcbiAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIGNoZWNrIHRoZSBpbmNvbWluZyBhbmQgb3V0Z29pbmcgY3VycmVudCB0byBlYWNoIGluZHVjdG9yLiAgSWYgaXQgaXMgYWxsIDAsIHRoZW4gY2xlYXIgdGhlIGluZHVjdG9yLlxyXG4gICAgICBjb25zdCBpbmR1Y3RvcnMgPSB0aGlzLmNpcmN1aXRFbGVtZW50cy5maWx0ZXIoIGVsZW1lbnQgPT4gZWxlbWVudCBpbnN0YW5jZW9mIEluZHVjdG9yICkgYXMgSW5kdWN0b3JbXTtcclxuICAgICAgaW5kdWN0b3JzLmZvckVhY2goICggaW5kdWN0b3I6IEluZHVjdG9yICkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBoYXNDdXJyZW50ID0gKCB2ZXJ0ZXg6IFZlcnRleCApID0+IHtcclxuICAgICAgICAgIGNvbnN0IG5laWdoYm9yc1dpdGhDdXJyZW50ID0gdGhpcy5nZXROZWlnaGJvckNpcmN1aXRFbGVtZW50cyggdmVydGV4IClcclxuICAgICAgICAgICAgLmZpbHRlciggbmVpZ2hib3IgPT4gbmVpZ2hib3IgIT09IGluZHVjdG9yIClcclxuICAgICAgICAgICAgLmZpbHRlciggbmVpZ2hib3IgPT4gTWF0aC5hYnMoIG5laWdoYm9yLmN1cnJlbnRQcm9wZXJ0eS52YWx1ZSApID4gMUUtNCApO1xyXG4gICAgICAgICAgcmV0dXJuIG5laWdoYm9yc1dpdGhDdXJyZW50Lmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKCAhaGFzQ3VycmVudCggaW5kdWN0b3Iuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSApICYmICFoYXNDdXJyZW50KCBpbmR1Y3Rvci5lbmRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSApICkge1xyXG4gICAgICAgICAgaW5kdWN0b3IuY2xlYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuY2lyY3VpdENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRldGVybWluZVNlbnNlcygpO1xyXG5cclxuICAgIC8vIE1vdmUgdGhlIGNoYXJnZXMuICBEbyB0aGlzIGFmdGVyIHRoZSBjaXJjdWl0IGhhcyBiZWVuIHNvbHZlZCBzbyB0aGUgY29udmVudGlvbmFsIGN1cnJlbnQgd2lsbCBoYXZlIHRoZSBjb3JyZWN0XHJcbiAgICAvLyBjdXJyZW50IHZhbHVlcy5cclxuICAgIHRoaXMuY2hhcmdlQW5pbWF0b3Iuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gYSBjaXJjdWl0IGVsZW1lbnQgaXMgbWFya2VkIGFzIGRpcnR5IChzdWNoIGFzIHdoZW4gaXQgY2hhbmdlZCBsZW5ndGggb3IgbW92ZWQpLCBpdCBuZWVkcyB0byBoYXZlXHJcbiAgICogdGhlIGNoYXJnZXMgcmVwb3NpdGlvbmVkLCBzbyB0aGV5IHdpbGwgYmUgZXF1YWxseSBzcGFjZWQgaW50ZXJuYWxseSBhbmQgc3BhY2VkIHdlbGwgY29tcGFyZWQgdG8gbmVpZ2hib3JcclxuICAgKiBlbGVtZW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgbGF5b3V0Q2hhcmdlc0luRGlydHlDaXJjdWl0RWxlbWVudHMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmNpcmN1aXRFbGVtZW50cy5mb3JFYWNoKCBjaXJjdWl0RWxlbWVudCA9PiB0aGlzLmxheW91dENoYXJnZXMoIGNpcmN1aXRFbGVtZW50ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSBpZiBvbmUgVmVydGV4IGlzIGFkamFjZW50IHRvIGFub3RoZXIgVmVydGV4LiAgVGhlIG9ubHkgd2F5IGZvciB0d28gdmVydGljZXMgdG8gYmUgYWRqYWNlbnQgaXMgZm9yIHRoZW1cclxuICAgKiB0byBiZSB0aGUgc3RhcnQvZW5kIG9mIGEgc2luZ2xlIENpcmN1aXRFbGVtZW50XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpc1ZlcnRleEFkamFjZW50KCBhOiBWZXJ0ZXgsIGI6IFZlcnRleCApOiBib29sZWFuIHtcclxuXHJcbiAgICAvLyBBIHZlcnRleCBjYW5ub3QgYmUgYWRqYWNlbnQgdG8gaXRzZWxmLlxyXG4gICAgaWYgKCBhID09PSBiICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY2lyY3VpdEVsZW1lbnRzLnNvbWUoIGNpcmN1aXRFbGVtZW50ID0+IGNpcmN1aXRFbGVtZW50LmNvbnRhaW5zQm90aFZlcnRpY2VzKCBhLCBiICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgdGhlIG5laWdoYm9yIHZlcnRpY2VzIHdpdGhpbiB0aGUgZ2l2ZW4gZ3JvdXAgb2YgY2lyY3VpdCBlbGVtZW50c1xyXG4gICAqIEBwYXJhbSB2ZXJ0ZXhcclxuICAgKiBAcGFyYW0gY2lyY3VpdEVsZW1lbnRzIC0gdGhlIGdyb3VwIG9mIENpcmN1aXRFbGVtZW50cyB3aXRoaW4gd2hpY2ggdG8gbG9vayBmb3IgbmVpZ2hib3JzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXROZWlnaGJvclZlcnRpY2VzSW5Hcm91cCggdmVydGV4OiBWZXJ0ZXgsIGNpcmN1aXRFbGVtZW50czogQ2lyY3VpdEVsZW1lbnRbXSApOiBWZXJ0ZXhbXSB7XHJcbiAgICBjb25zdCBuZWlnaGJvcnMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNpcmN1aXRFbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY2lyY3VpdEVsZW1lbnQgPSBjaXJjdWl0RWxlbWVudHNbIGkgXTtcclxuICAgICAgaWYgKCBjaXJjdWl0RWxlbWVudC5jb250YWluc1ZlcnRleCggdmVydGV4ICkgKSB7XHJcbiAgICAgICAgbmVpZ2hib3JzLnB1c2goIGNpcmN1aXRFbGVtZW50LmdldE9wcG9zaXRlVmVydGV4KCB2ZXJ0ZXggKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmVpZ2hib3JzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFycmF5IG9mIGFsbCB0aGUgdmVydGljZXMgYWRqYWNlbnQgdG8gdGhlIHNwZWNpZmllZCBWZXJ0ZXguXHJcbiAgICogQHBhcmFtIHZlcnRleCAtIHRoZSB2ZXJ0ZXggdG8gZ2V0IG5laWdoYm9ycyBmb3JcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TmVpZ2hib3JpbmdWZXJ0aWNlcyggdmVydGV4OiBWZXJ0ZXggKTogVmVydGV4W10ge1xyXG4gICAgY29uc3QgbmVpZ2hib3JDaXJjdWl0RWxlbWVudHMgPSB0aGlzLmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzKCB2ZXJ0ZXggKTtcclxuICAgIHJldHVybiB0aGlzLmdldE5laWdoYm9yVmVydGljZXNJbkdyb3VwKCB2ZXJ0ZXgsIG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXJrcyBhbGwgY29ubmVjdGVkIGNpcmN1aXQgZWxlbWVudHMgYXMgZGlydHkgKHNvIGVsZWN0cm9ucyB3aWxsIGJlIGxheWVkIG91dCBhZ2FpbiksIGNhbGxlZCB3aGVuIGFueSB3aXJlIGxlbmd0aCBpcyBjaGFuZ2VkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgbWFya0FsbENvbm5lY3RlZENpcmN1aXRFbGVtZW50c0RpcnR5KCB2ZXJ0ZXg6IFZlcnRleCApOiB2b2lkIHtcclxuICAgIGNvbnN0IGFsbENvbm5lY3RlZFZlcnRpY2VzID0gdGhpcy5maW5kQWxsQ29ubmVjdGVkVmVydGljZXMoIHZlcnRleCApO1xyXG5cclxuICAgIC8vIFRoaXMgaXMgY2FsbGVkIG1hbnkgdGltZXMgd2hpbGUgZHJhZ2dpbmcgYSB3aXJlIHZlcnRleCwgc28gZm9yIGxvb3BzIChhcyBvcHBvc2VkIHRvIGZ1bmN0aW9uYWwgc3R5bGUpIGFyZSB1c2VkXHJcbiAgICAvLyB0byBhdm9pZCBnYXJiYWdlXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhbGxDb25uZWN0ZWRWZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbmVpZ2hib3JDaXJjdWl0RWxlbWVudHMgPSB0aGlzLmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzKCBhbGxDb25uZWN0ZWRWZXJ0aWNlc1sgaSBdICk7XHJcbiAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzLmxlbmd0aDsgaysrICkge1xyXG5cclxuICAgICAgICAvLyBOb3RlIHRoZSBzYW1lIGNpcmN1aXQgZWxlbWVudCBtYXkgYmUgbWFya2VkIGRpcnR5IHR3aWNlLCBidXQgdGhpcyBkb2VzIG5vdCBjYXVzZSBhbnkgcHJvYmxlbXMuXHJcbiAgICAgICAgbmVpZ2hib3JDaXJjdWl0RWxlbWVudHNbIGsgXS5jaGFyZ2VMYXlvdXREaXJ0eSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZCB0aGUgc3ViZ3JhcGggd2hlcmUgYWxsIHZlcnRpY2VzIGFyZSBjb25uZWN0ZWQgYnkgYW55IGtpbmQgb2YgQ2lyY3VpdEVsZW1lbnRzXHJcbiAgICovXHJcbiAgcHVibGljIGZpbmRBbGxDb25uZWN0ZWRWZXJ0aWNlcyggdmVydGV4OiBWZXJ0ZXggKTogVmVydGV4W10ge1xyXG4gICAgcmV0dXJuIHRoaXMuc2VhcmNoVmVydGljZXMoIHZlcnRleCwgdHJ1ZUZ1bmN0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvLyBJZGVudGlmeSBjdXJyZW50IHNlbnNlcyBmb3IgQ3VycmVudFNlbnNlLlVOU1BFQ0lGSUVEIENpcmN1aXRFbGVtZW50cyB3aXRoIGEgbm9uemVybyBjdXJyZW50XHJcbiAgcHJpdmF0ZSBkZXRlcm1pbmVTZW5zZXMoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gRGlzY29ubmVjdGVkIGNpcmN1aXQgZWxlbWVudHMgZm9yZ2V0IHRoZWlyIHNlbnNlXHJcbiAgICB0aGlzLmNpcmN1aXRFbGVtZW50cy5mb3JFYWNoKCBjID0+IHtcclxuICAgICAgaWYgKCBjLmN1cnJlbnRQcm9wZXJ0eS52YWx1ZSA9PT0gMC4wICkge1xyXG4gICAgICAgIGMuY3VycmVudFNlbnNlUHJvcGVydHkudmFsdWUgPSBDdXJyZW50U2Vuc2UuVU5TUEVDSUZJRUQ7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBGaWx0ZXIgYmFzZWQgb24gd2hldGhlciBDaXJjdWl0RWxlbWVudHMgaGF2ZSBjdXJyZW50IGJlZm9yZWhhbmQsIGN1cnJlbnRzIGNhbm5vdCBjaGFuZ2UgaW4gdGhpcyBsb29wXHJcbiAgICBjb25zdCBjaXJjdWl0RWxlbWVudHNXaXRoQ3VycmVudCA9IHRoaXMuY2lyY3VpdEVsZW1lbnRzLmZpbHRlciggYyA9PiBjLmN1cnJlbnRQcm9wZXJ0eS52YWx1ZSAhPT0gMCApO1xyXG5cclxuICAgIC8vIEFmdGVyIGFzc2lnbmluZyBhIHNlbnNlLCByZXZpc2l0IHRoZSBjaXJjdWl0IHRvIHByb3BhZ2F0ZSBzZW5zZXMuICBCcmVhayBvdXQgb2YgdGhlIGxvb3Agd2hlbiBubyBtb3JlIHdvcmsgY2FuIGJlIGRvbmVcclxuICAgIHdoaWxlICggdHJ1ZSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cclxuXHJcbiAgICAgIGNvbnN0IHJlcXVpcmVzU2Vuc2VCZWZvcmVWaXNpdCA9IGNpcmN1aXRFbGVtZW50c1dpdGhDdXJyZW50LmZpbHRlciggYyA9PiBjLmN1cnJlbnRTZW5zZVByb3BlcnR5LnZhbHVlID09PSBDdXJyZW50U2Vuc2UuVU5TUEVDSUZJRUQgKTtcclxuICAgICAgaWYgKCByZXF1aXJlc1NlbnNlQmVmb3JlVmlzaXQubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQcm9wYWdhdGUga25vd24gc2Vuc2VzIHRvIG5ldyBjaXJjdWl0IGVsZW1lbnRzLlxyXG4gICAgICB0aGlzLnByb3BhZ2F0ZVNlbnNlcygpO1xyXG5cclxuICAgICAgY29uc3QgcmVxdWlyZXNTZW5zZUFmdGVyVmlzaXQgPSBjaXJjdWl0RWxlbWVudHNXaXRoQ3VycmVudC5maWx0ZXIoIGMgPT4gYy5jdXJyZW50U2Vuc2VQcm9wZXJ0eS52YWx1ZSA9PT0gQ3VycmVudFNlbnNlLlVOU1BFQ0lGSUVEICk7XHJcblxyXG4gICAgICBpZiAoIHJlcXVpcmVzU2Vuc2VBZnRlclZpc2l0Lmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHdhc1NlbnNlQXNzaWduZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIE1hdGNoIEFDIFNvdXJjZXMgc28gdGhleSBhcmUgaW4gcGhhc2VcclxuICAgICAgY29uc3QgdW5zcGVjaWZpZWRBQ1NvdXJjZXMgPSByZXF1aXJlc1NlbnNlQWZ0ZXJWaXNpdC5maWx0ZXIoIHIgPT4gciBpbnN0YW5jZW9mIEFDVm9sdGFnZSApO1xyXG4gICAgICBpZiAoIHVuc3BlY2lmaWVkQUNTb3VyY2VzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgY29uc3QgdW5zcGVjaWZpZWRBQ1NvdXJjZSA9IHVuc3BlY2lmaWVkQUNTb3VyY2VzWyAwIF07XHJcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlRWxlbWVudHMgPSB0aGlzLmNpcmN1aXRFbGVtZW50cy5maWx0ZXIoIGMgPT4gYyBpbnN0YW5jZW9mIEFDVm9sdGFnZSAmJiBjLmN1cnJlbnRTZW5zZVByb3BlcnR5LnZhbHVlICE9PSBDdXJyZW50U2Vuc2UuVU5TUEVDSUZJRUQgJiYgYyAhPT0gdW5zcGVjaWZpZWRBQ1NvdXJjZSApO1xyXG4gICAgICAgIGlmICggcmVmZXJlbmNlRWxlbWVudHMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICAgIENpcmN1aXQuYXNzaWduU2Vuc2UoIHVuc3BlY2lmaWVkQUNTb3VyY2UsIHJlZmVyZW5jZUVsZW1lbnRzWyAwIF0gKTtcclxuICAgICAgICAgIHdhc1NlbnNlQXNzaWduZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIC8vIFJ1biB0aGUgbmV4dCBpdGVyYXRpb24gb2YgdGhlIGxvb3AsIHdoaWNoIHdpbGwgc2VhcmNoIG91dCBmcm9tIHRoZSBuZXdseSBtYXJrZWQgbm9kZVxyXG4gICAgICAgICAgLy8gVE9ETyAoQUMpOiBPbmx5IHNlYXJjaCBmcm9tIHRoZSBuZXdseSBtYXJrZWQgbm9kZT9cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggIXdhc1NlbnNlQXNzaWduZWQgKSB7XHJcblxyXG4gICAgICAgIC8vIENob29zZSB0aGUgY2lyY3VpdCBlbGVtZW50IHdpdGggdGhlIHNtYWxsZXN0IG51bWJlciBvZiBuZWlnaGJvcnMsIGllIGZhdm9yaW5nIHNlcmllcyBlbGVtZW50c1xyXG4gICAgICAgIHJlcXVpcmVzU2Vuc2VBZnRlclZpc2l0LnNvcnQoICggYSwgYiApID0+IHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzRm9yQ2lyY3VpdEVsZW1lbnQoIGEgKS5sZW5ndGggLSB0aGlzLmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzRm9yQ2lyY3VpdEVsZW1lbnQoIGIgKS5sZW5ndGg7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gcmVxdWlyZXNTZW5zZUFmdGVyVmlzaXRbIDAgXTtcclxuICAgICAgICB0YXJnZXRFbGVtZW50LmN1cnJlbnRTZW5zZVByb3BlcnR5LnZhbHVlID0gZ2V0U2Vuc2VGb3JQb3NpdGl2ZSggdGFyZ2V0RWxlbWVudC5jdXJyZW50UHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICB3YXNTZW5zZUFzc2lnbmVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQXNzaWduIHRoZSBzZW5zZSB0byBhbiB1bi1zZW5zZWQgY2lyY3VpdCBlbGVtZW50IGJhc2VkIG9uIG1hdGNoaW5nIHRoZSBzaWduIG9mIGEgY29ycmVzcG9uZGluZyByZWZlcmVuY2UgZWxlbWVudC5cclxuICBwcml2YXRlIHN0YXRpYyBhc3NpZ25TZW5zZSggdGFyZ2V0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQsIHJlZmVyZW5jZUVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFyZ2V0RWxlbWVudC5jdXJyZW50U2Vuc2VQcm9wZXJ0eS52YWx1ZSA9PT0gQ3VycmVudFNlbnNlLlVOU1BFQ0lGSUVELCAndGFyZ2V0IHNob3VsZCBoYXZlIGFuIHVuc3BlY2lmaWVkIHNlbnNlJyApO1xyXG4gICAgY29uc3QgdGFyZ2V0RWxlbWVudEN1cnJlbnQgPSB0YXJnZXRFbGVtZW50LmN1cnJlbnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHJlZmVyZW5jZUVsZW1lbnRDdXJyZW50ID0gcmVmZXJlbmNlRWxlbWVudC5jdXJyZW50UHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCByZWZlcmVuY2VFbGVtZW50U2Vuc2UgPSByZWZlcmVuY2VFbGVtZW50LmN1cnJlbnRTZW5zZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgZGVzaXJlZFNpZ24gPSByZWZlcmVuY2VFbGVtZW50Q3VycmVudCA+PSAwICYmIHJlZmVyZW5jZUVsZW1lbnRTZW5zZSA9PT0gQ3VycmVudFNlbnNlLkZPUldBUkQgPyAncG9zaXRpdmUnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlRWxlbWVudEN1cnJlbnQgPj0gMCAmJiByZWZlcmVuY2VFbGVtZW50U2Vuc2UgPT09IEN1cnJlbnRTZW5zZS5CQUNLV0FSRCA/ICduZWdhdGl2ZScgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VFbGVtZW50Q3VycmVudCA8IDAgJiYgcmVmZXJlbmNlRWxlbWVudFNlbnNlID09PSBDdXJyZW50U2Vuc2UuRk9SV0FSRCA/ICduZWdhdGl2ZScgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VFbGVtZW50Q3VycmVudCA8IDAgJiYgcmVmZXJlbmNlRWxlbWVudFNlbnNlID09PSBDdXJyZW50U2Vuc2UuQkFDS1dBUkQgPyAncG9zaXRpdmUnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJztcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZXNpcmVkU2lnbiAhPT0gJ2Vycm9yJyApO1xyXG4gICAgdGFyZ2V0RWxlbWVudC5jdXJyZW50U2Vuc2VQcm9wZXJ0eS52YWx1ZSA9IGRlc2lyZWRTaWduID09PSAncG9zaXRpdmUnID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRTZW5zZUZvclBvc2l0aXZlKCB0YXJnZXRFbGVtZW50Q3VycmVudCApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRTZW5zZUZvck5lZ2F0aXZlKCB0YXJnZXRFbGVtZW50Q3VycmVudCApO1xyXG4gIH1cclxuXHJcbiAgLy8gVHJhdmVyc2UgdGhlIGNpcmN1aXQsIGZpbGxpbmcgaW4gc2Vuc2VzIHRvIGFkamFjZW50IGNpcmN1aXQgZWxlbWVudHMgZHVyaW5nIHRoZSB0cmF2ZXJzYWxcclxuICBwcml2YXRlIHByb3BhZ2F0ZVNlbnNlcygpOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBjaXJjdWl0RWxlbWVudHNXaXRoU2Vuc2VzID0gdGhpcy5jaXJjdWl0RWxlbWVudHMuZmlsdGVyKCBjID0+IGMuY3VycmVudFNlbnNlUHJvcGVydHkudmFsdWUgIT09IEN1cnJlbnRTZW5zZS5VTlNQRUNJRklFRCApO1xyXG4gICAgaWYgKCBjaXJjdWl0RWxlbWVudHNXaXRoU2Vuc2VzLmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICAvLyBsYXVuY2ggc2VhcmNoZXMgZnJvbSBjaXJjdWl0IGVsZW1lbnRzIHdpdGgga25vd24gc2Vuc2VzXHJcbiAgICAgIGNvbnN0IHRvVmlzaXQ6IFZlcnRleFtdID0gW107XHJcbiAgICAgIGNpcmN1aXRFbGVtZW50c1dpdGhTZW5zZXMuZm9yRWFjaCggYyA9PiB7XHJcbiAgICAgICAgaWYgKCAhdG9WaXNpdC5pbmNsdWRlcyggYy5zdGFydFZlcnRleFByb3BlcnR5LnZhbHVlICkgKSB7IHRvVmlzaXQucHVzaCggYy5zdGFydFZlcnRleFByb3BlcnR5LnZhbHVlICk7IH1cclxuICAgICAgICBpZiAoICF0b1Zpc2l0LmluY2x1ZGVzKCBjLmVuZFZlcnRleFByb3BlcnR5LnZhbHVlICkgKSB7IHRvVmlzaXQucHVzaCggYy5lbmRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSApOyB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IHZpc2l0ZWQ6IFZlcnRleFtdID0gW107XHJcbiAgICAgIHdoaWxlICggdG9WaXNpdC5sZW5ndGggPiAwICkge1xyXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IHRvVmlzaXQucG9wKCkhO1xyXG4gICAgICAgIGlmICggIXZpc2l0ZWQuaW5jbHVkZXMoIHZlcnRleCApICkge1xyXG4gICAgICAgICAgY29uc3QgbmVpZ2hib3JDaXJjdWl0RWxlbWVudHMgPSB0aGlzLmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzKCB2ZXJ0ZXggKTtcclxuICAgICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgICBjb25zdCBjaXJjdWl0RWxlbWVudCA9IG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzWyBpIF07XHJcbiAgICAgICAgICAgIGNvbnN0IG5laWdoYm9yVmVydGV4ID0gY2lyY3VpdEVsZW1lbnQuZ2V0T3Bwb3NpdGVWZXJ0ZXgoIHZlcnRleCApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBjaXJjdWl0RWxlbWVudC5jdXJyZW50U2Vuc2VQcm9wZXJ0eS52YWx1ZSA9PT0gQ3VycmVudFNlbnNlLlVOU1BFQ0lGSUVEICYmIGNpcmN1aXRFbGVtZW50LmN1cnJlbnRQcm9wZXJ0eS52YWx1ZSAhPT0gMC4wICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBjaG9vc2Ugc2Vuc2UgZnJvbSBhIG5laWdoYm9yLiBXZSBkaXNjdXNzZWQgdGhhdCB3ZSBtYXkgbmVlZCB0byBiZSBtb3JlIHNlbGVjdGl2ZSBpbiBjaG9vc2luZyB0aGUgcmVmZXJlbmNlXHJcbiAgICAgICAgICAgICAgLy8gbmVpZ2hib3IsIHN1Y2ggYXMgY2hvb3NpbmcgdGhlIGhpZ2ggdm9sdGFnZSBzaWRlJ3MgaGlnaGVzdCB2b2x0YWdlIG5laWdoYm9yLiAgSG93ZXZlciwgd2UgZGlkbid0IHNlZSBhXHJcbiAgICAgICAgICAgICAgLy8gY2FzZSB3aGVyZSB0aGF0IHdhcyBuZWNlc3NhcnkgeWV0LlxyXG4gICAgICAgICAgICAgIGNvbnN0IHNwZWNpZmllZE5laWdoYm9ycyA9IG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzLmZpbHRlciggYyA9PiBjICE9PSBjaXJjdWl0RWxlbWVudCAmJiBjLmN1cnJlbnRTZW5zZVByb3BlcnR5LnZhbHVlICE9PSBDdXJyZW50U2Vuc2UuVU5TUEVDSUZJRUQgKTtcclxuICAgICAgICAgICAgICBpZiAoIHNwZWNpZmllZE5laWdoYm9ycy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgICAgICAgQ2lyY3VpdC5hc3NpZ25TZW5zZSggY2lyY3VpdEVsZW1lbnQsIHNwZWNpZmllZE5laWdoYm9yc1sgMCBdICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoICF2aXNpdGVkLmluY2x1ZGVzKCBuZWlnaGJvclZlcnRleCApICYmICF0b1Zpc2l0LmluY2x1ZGVzKCBuZWlnaGJvclZlcnRleCApICkge1xyXG4gICAgICAgICAgICAgIHRvVmlzaXQucHVzaCggbmVpZ2hib3JWZXJ0ZXggKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmlzaXRlZC5wdXNoKCB2ZXJ0ZXggKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgdGhlIHN1YmdyYXBoIHdoZXJlIGFsbCB2ZXJ0aWNlcyBhcmUgY29ubmVjdGVkLCBnaXZlbiB0aGUgbGlzdCBvZiB0cmF2ZXJzaWJsZSBjaXJjdWl0IGVsZW1lbnRzLlxyXG4gICAqIFRoZXJlIGFyZSBhIGZldyBvdGhlciBhZC1ob2MgZ3JhcGggc2VhcmNoZXMgYXJvdW5kLCBzdWNoIGFzIGlzSW5Mb29wIGFuZCBpbiBMaW5lYXJUcmFuc2llbnRBbmFseXNpc1xyXG4gICAqIEBwYXJhbSB2ZXJ0ZXhcclxuICAgKiBAcGFyYW0gb2tUb1Zpc2l0IC0gKHN0YXJ0VmVydGV4OlZlcnRleCxjaXJjdWl0RWxlbWVudDpDaXJjdWl0RWxlbWVudCxlbmRWZXJ0ZXg6VmVydGV4KT0+Ym9vbGVhbiwgcnVsZVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHRoYXQgZGV0ZXJtaW5lcyB3aGljaCB2ZXJ0aWNlcyBhcmUgT0sgdG8gdmlzaXRcclxuICAgKi9cclxuICBwcml2YXRlIHNlYXJjaFZlcnRpY2VzKCB2ZXJ0ZXg6IFZlcnRleCwgb2tUb1Zpc2l0OiAoIGE6IFZlcnRleCwgYzogQ2lyY3VpdEVsZW1lbnQsIGI6IFZlcnRleCApID0+IGJvb2xlYW4gKTogVmVydGV4W10ge1xyXG5cclxuICAgIGNvbnN0IGZpeGVkVmVydGljZXMgPSBbXTtcclxuICAgIGNvbnN0IHRvVmlzaXQ6IFZlcnRleFtdID0gWyB2ZXJ0ZXggXTtcclxuICAgIGNvbnN0IHZpc2l0ZWQ6IFZlcnRleFtdID0gW107XHJcbiAgICB3aGlsZSAoIHRvVmlzaXQubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgIC8vIEZpbmQgdGhlIG5laWdoYm9ycyBqb2luZWQgYnkgYSBGaXhlZENpcmN1aXRFbGVtZW50LCBub3QgYSBzdHJldGNoeSBXaXJlXHJcbiAgICAgIGNvbnN0IGN1cnJlbnRWZXJ0ZXggPSB0b1Zpc2l0LnBvcCgpITtcclxuXHJcbiAgICAgIC8vIElmIHdlIGhhdmVuJ3QgdmlzaXRlZCBpdCBiZWZvcmUsIHRoZW4gZXhwbG9yZSBpdFxyXG4gICAgICBpZiAoICF2aXNpdGVkLmluY2x1ZGVzKCBjdXJyZW50VmVydGV4ICkgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzID0gdGhpcy5nZXROZWlnaGJvckNpcmN1aXRFbGVtZW50cyggY3VycmVudFZlcnRleCApO1xyXG5cclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuZWlnaGJvckNpcmN1aXRFbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIGNvbnN0IG5laWdoYm9yQ2lyY3VpdEVsZW1lbnQgPSBuZWlnaGJvckNpcmN1aXRFbGVtZW50c1sgaSBdO1xyXG4gICAgICAgICAgY29uc3QgbmVpZ2hib3JWZXJ0ZXggPSBuZWlnaGJvckNpcmN1aXRFbGVtZW50LmdldE9wcG9zaXRlVmVydGV4KCBjdXJyZW50VmVydGV4ICk7XHJcblxyXG4gICAgICAgICAgLy8gSWYgdGhlIG5vZGUgd2FzIGFscmVhZHkgdmlzaXRlZCwgZG9uJ3QgdmlzaXQgYWdhaW5cclxuICAgICAgICAgIGlmICggIXZpc2l0ZWQuaW5jbHVkZXMoIG5laWdoYm9yVmVydGV4ICkgJiZcclxuICAgICAgICAgICAgICAgIXRvVmlzaXQuaW5jbHVkZXMoIG5laWdoYm9yVmVydGV4ICkgJiZcclxuICAgICAgICAgICAgICAgb2tUb1Zpc2l0KCBjdXJyZW50VmVydGV4LCBuZWlnaGJvckNpcmN1aXRFbGVtZW50LCBuZWlnaGJvclZlcnRleCApICkge1xyXG4gICAgICAgICAgICB0b1Zpc2l0LnB1c2goIG5laWdoYm9yVmVydGV4ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmaXhlZFZlcnRpY2VzLnB1c2goIGN1cnJlbnRWZXJ0ZXggKTsgLy8gQWxsb3cgZHVwbGljYXRlcywgd2lsbCBiZSBfLnVuaXEgYmVmb3JlIHJldHVyblxyXG5cclxuICAgICAgLy8gTyhuXjIpIHRvIHNlYXJjaCBmb3IgZHVwbGljYXRlcyBhcyB3ZSBnbywgaWYgdGhpcyBiZWNvbWVzIGEgcGVyZm9ybWFuY2UgYm90dGxlbmVjayB3ZSBtYXkgd2lzaCB0byBmaW5kIGEgYmV0dGVyXHJcbiAgICAgIC8vIHdheSB0byBkZWR1cGxpY2F0ZSwgcGVyaGFwcyBTZXQgb3Igc29tZXRoaW5nIGxpa2UgdGhhdFxyXG4gICAgICBpZiAoICF2aXNpdGVkLmluY2x1ZGVzKCBjdXJyZW50VmVydGV4ICkgKSB7XHJcbiAgICAgICAgdmlzaXRlZC5wdXNoKCBjdXJyZW50VmVydGV4ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBfLnVuaXEoIGZpeGVkVmVydGljZXMgKTtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgY2lyY3VpdCBlbGVtZW50IGlzIGluIGEgbG9vcCB3aXRoIGEgdm9sdGFnZSBzb3VyY2VcclxuICBwdWJsaWMgaXNJbkxvb3AoIGNpcmN1aXRFbGVtZW50OiBDaXJjdWl0RWxlbWVudCApOiBib29sZWFuIHtcclxuXHJcbiAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIHdoZW4gd2UgYXJlIGFza2luZyBpZiBhbiBvcGVuIFN3aXRjaCBpcyBpbiBhIGxvb3AuICBPcGVuIHN3aXRjaGVzXHJcbiAgICAvLyBjYW5ub3QgYmUgaW4gYSBsb29wIHNpbmNlIHRoZWlyIHZlcnRpY2VzIGFyZSBub3QgZGlyZWN0bHkgY29ubmVjdGVkLiAgTm90ZSB0aGUgc2VhcmNoXHJcbiAgICAvLyBhbGdvcml0aG0gYmVsb3cgZ2l2ZXMgdGhlIHdyb25nIGFuc3dlciBiZWNhdXNlIHRoZSBzdGFydCB2ZXJ0ZXggYW5kIGVuZCB2ZXJ0ZXggY2FuIGJlIGNvbm5lY3RlZFxyXG4gICAgLy8gYnkgb3RoZXIgY2lyY3VpdCBlbGVtZW50cy5cclxuICAgIGlmICggY2lyY3VpdEVsZW1lbnQgaW5zdGFuY2VvZiBTd2l0Y2ggJiYgIWNpcmN1aXRFbGVtZW50LmlzQ2xvc2VkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwcm9jZWR1cmUgREZTX2l0ZXJhdGl2ZShHLCB2KSBpc1xyXG4gICAgLy8gbGV0IFMgYmUgYSBzdGFja1xyXG4gICAgLy8gUy5wdXNoKHYpXHJcbiAgICAvLyB3aGlsZSBTIGlzIG5vdCBlbXB0eSBkb1xyXG4gICAgLy8gICB2ID0gUy5wb3AoKVxyXG4gICAgLy8gICBpZiB2IGlzIG5vdCBsYWJlbGVkIGFzIGRpc2NvdmVyZWQgdGhlblxyXG4gICAgLy8gICAgIGxhYmVsIHYgYXMgZGlzY292ZXJlZFxyXG4gICAgLy8gICAgIGZvciBhbGwgZWRnZXMgZnJvbSB2IHRvIHcgaW4gRy5hZGphY2VudEVkZ2VzKHYpIGRvXHJcbiAgICAvLyAgICAgICBTLnB1c2godylcclxuXHJcbiAgICAvLyBJdGVyYXRpdmUgKG5vdCByZWN1cnNpdmUpIGRlcHRoIGZpcnN0IHNlYXJjaCwgc28gd2UgY2FuIGJhaWwgb24gYSBoaXQsIHNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EZXB0aC1maXJzdF9zZWFyY2hcclxuICAgIGNvbnN0IHN0YWNrID0gW107XHJcbiAgICBjb25zdCB2aXNpdGVkOiBWZXJ0ZXhbXSA9IFtdO1xyXG4gICAgc3RhY2sucHVzaCggY2lyY3VpdEVsZW1lbnQuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgd2hpbGUgKCBzdGFjay5sZW5ndGggPiAwICkge1xyXG4gICAgICBjb25zdCB2ZXJ0ZXggPSBzdGFjay5wb3AoKSE7XHJcbiAgICAgIGlmICggIXZpc2l0ZWQuaW5jbHVkZXMoIHZlcnRleCApICkge1xyXG4gICAgICAgIHZpc2l0ZWQucHVzaCggdmVydGV4ICk7XHJcblxyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2lyY3VpdEVsZW1lbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgbmVpZ2hib3IgPSB0aGlzLmNpcmN1aXRFbGVtZW50c1sgaSBdO1xyXG5cclxuICAgICAgICAgIGlmICggbmVpZ2hib3IuY29udGFpbnNWZXJ0ZXgoIHZlcnRleCApICYmXHJcblxyXG4gICAgICAgICAgICAgICAvLyBubyBzaG9ydGN1dHMhXHJcbiAgICAgICAgICAgICAgIG5laWdoYm9yICE9PSBjaXJjdWl0RWxlbWVudCAmJlxyXG5cclxuICAgICAgICAgICAgICAgLy8gY2FuJ3QgY3Jvc3MgYW4gb3BlbiBzd2l0Y2hcclxuICAgICAgICAgICAgICAgISggbmVpZ2hib3IgaW5zdGFuY2VvZiBTd2l0Y2ggJiYgIW5laWdoYm9yLmlzQ2xvc2VkUHJvcGVydHkudmFsdWUgKSApIHtcclxuICAgICAgICAgICAgY29uc3Qgb3Bwb3NpdGUgPSBuZWlnaGJvci5nZXRPcHBvc2l0ZVZlcnRleCggdmVydGV4ICk7XHJcbiAgICAgICAgICAgIGlmICggb3Bwb3NpdGUgPT09IGNpcmN1aXRFbGVtZW50LmVuZFZlcnRleFByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBIb29yYXksIHdlIGZvdW5kIGEgbG9vcCFcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGFjay5wdXNoKCBvcHBvc2l0ZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjaGFyZ2VzIHRoYXQgYXJlIGluIHRoZSBzcGVjaWZpZWQgY2lyY3VpdCBlbGVtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDaGFyZ2VzSW5DaXJjdWl0RWxlbWVudCggY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICk6IENoYXJnZVtdIHtcclxuICAgIHJldHVybiB0aGlzLmNoYXJnZXMuZmlsdGVyKCBjaGFyZ2UgPT4gY2hhcmdlLmNpcmN1aXRFbGVtZW50ID09PSBjaXJjdWl0RWxlbWVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZCB0aGUgc3ViZ3JhcGggd2hlcmUgYWxsIHZlcnRpY2VzIGFyZSBjb25uZWN0ZWQgYnkgRml4ZWRDaXJjdWl0RWxlbWVudHMsIG5vdCBzdHJldGNoeSB3aXJlcy5cclxuICAgKiBAcGFyYW0gdmVydGV4XHJcbiAgICogQHBhcmFtIFtva1RvVmlzaXRdIC0gKHN0YXJ0VmVydGV4OlZlcnRleCxjaXJjdWl0RWxlbWVudDpDaXJjdWl0RWxlbWVudCxlbmRWZXJ0ZXg6VmVydGV4KT0+Ym9vbGVhbixcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHJ1bGUgdGhhdCBkZXRlcm1pbmVzIHdoaWNoIHZlcnRpY2VzIGFyZSBPSyB0byB2aXNpdFxyXG4gICAqL1xyXG4gIHB1YmxpYyBmaW5kQWxsRml4ZWRWZXJ0aWNlcyggdmVydGV4OiBWZXJ0ZXgsIG9rVG9WaXNpdDogKCAoIGE6IFZlcnRleCwgYzogQ2lyY3VpdEVsZW1lbnQsIGI6IFZlcnRleCApID0+IGJvb2xlYW4gKSA9IGUgPT4gdHJ1ZSApOiBWZXJ0ZXhbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZWFyY2hWZXJ0aWNlcyggdmVydGV4LCAoIHN0YXJ0VmVydGV4OiBWZXJ0ZXgsIGNpcmN1aXRFbGVtZW50OiBDaXJjdWl0RWxlbWVudCwgZW5kVmVydGV4OiBWZXJ0ZXggKSA9PiB7XHJcbiAgICAgIGlmICggb2tUb1Zpc2l0ICkge1xyXG4gICAgICAgIHJldHVybiBjaXJjdWl0RWxlbWVudCBpbnN0YW5jZW9mIEZpeGVkQ2lyY3VpdEVsZW1lbnQgJiYgb2tUb1Zpc2l0KCBzdGFydFZlcnRleCwgY2lyY3VpdEVsZW1lbnQsIGVuZFZlcnRleCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBjaXJjdWl0RWxlbWVudCBpbnN0YW5jZW9mIEZpeGVkQ2lyY3VpdEVsZW1lbnQ7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIHNlbGVjdGVkIFZlcnRleCBvciBudWxsIGlmIG5vbmUgaXMgc2VsZWN0ZWRcclxuICBwdWJsaWMgZ2V0U2VsZWN0ZWRWZXJ0ZXgoKTogVmVydGV4IHwgbnVsbCB7XHJcbiAgICBjb25zdCBzZWxlY3Rpb24gPSB0aGlzLnNlbGVjdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgaWYgKCBzZWxlY3Rpb24gaW5zdGFuY2VvZiBWZXJ0ZXggKSB7XHJcbiAgICAgIHJldHVybiBzZWxlY3Rpb247XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIHZlcnRleCBoYXMgYmVlbiBkcmFnZ2VkLCBpcyBpdCBhIGNhbmRpZGF0ZSBmb3Igam9pbmluZyB3aXRoIG90aGVyIHZlcnRpY2VzPyAgSWYgc28sIHJldHVybiB0aGUgY2FuZGlkYXRlXHJcbiAgICogdmVydGV4LiAgT3RoZXJ3aXNlLCByZXR1cm4gbnVsbC5cclxuICAgKiBAcGFyYW0gdmVydGV4IC0gdGhlIGRyYWdnZWQgdmVydGV4XHJcbiAgICogQHBhcmFtIG1vZGUgLSB0aGUgYXBwbGljYXRpb24gbW9kZSBDaXJjdWl0LkludGVyYWN0aW9uTW9kZS5URVNUIHwgQ2lyY3VpdC5JbnRlcmFjdGlvbk1vZGUuRVhQTE9SRVxyXG4gICAqIEBwYXJhbSBibGFja0JveEJvdW5kcyAtIHRoZSBib3VuZHMgb2YgdGhlIGJsYWNrIGJveCwgaWYgdGhlcmUgaXMgb25lXHJcbiAgICogQHJldHVybnMgLSB0aGUgdmVydGV4IGl0IHdpbGwgYmUgYWJsZSB0byBjb25uZWN0IHRvLCBpZiBkcm9wcGVkIG9yIG51bGwgaWYgbm8gY29ubmVjdGlvbiBpcyBhdmFpbGFibGVcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RHJvcFRhcmdldCggdmVydGV4OiBWZXJ0ZXgsIG1vZGU6IEludGVyYWN0aW9uTW9kZSwgYmxhY2tCb3hCb3VuZHM6IEJvdW5kczIgfCBudWxsICk6IFZlcnRleCB8IG51bGwge1xyXG5cclxuICAgIGlmICggbW9kZSA9PT0gSW50ZXJhY3Rpb25Nb2RlLlRFU1QgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJsYWNrQm94Qm91bmRzLCAnYm91bmRzIHNob3VsZCBiZSBwcm92aWRlZCBmb3IgYnVpbGQgbW9kZScgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSdWxlcyBmb3IgYSB2ZXJ0ZXggY29ubmVjdGluZyB0byBhbm90aGVyIHZlcnRleC5cclxuICAgIGxldCBjYW5kaWRhdGVWZXJ0aWNlcyA9IHRoaXMudmVydGV4R3JvdXAuZmlsdGVyKCBjYW5kaWRhdGVWZXJ0ZXggPT4ge1xyXG5cclxuICAgICAgLy8gKDEpIEEgdmVydGV4IG1heSBub3QgY29ubmVjdCB0byBhbiBhZGphY2VudCB2ZXJ0ZXguXHJcbiAgICAgIGlmICggdGhpcy5pc1ZlcnRleEFkamFjZW50KCB2ZXJ0ZXgsIGNhbmRpZGF0ZVZlcnRleCApICkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gKDIpIEEgdmVydGV4IGNhbm5vdCBjb25uZWN0IHRvIGl0c2VsZlxyXG4gICAgICBpZiAoIGNhbmRpZGF0ZVZlcnRleCA9PT0gdmVydGV4ICkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gKDIuNSkgY2Fubm90IGNvbm5lY3QgdG8gc29tZXRoaW5nIHRoYXQgaXMgZHJhZ2dpbmdcclxuICAgICAgaWYgKCBjYW5kaWRhdGVWZXJ0ZXguaXNEcmFnZ2VkICkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gKDMpIGEgdmVydGV4IG11c3QgYmUgd2l0aGluIFNOQVBfUkFESVVTIChzY3JlZW4gY29vcmRpbmF0ZXMpIG9mIHRoZSBvdGhlciB2ZXJ0ZXhcclxuICAgICAgaWYgKCAhKCB2ZXJ0ZXgudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggY2FuZGlkYXRlVmVydGV4LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSA8IFNOQVBfUkFESVVTICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyAoNCkgYSB2ZXJ0ZXggbXVzdCBiZSBhdHRhY2hhYmxlLiBTb21lIGJsYWNrIGJveCB2ZXJ0aWNlcyBhcmUgbm90IGF0dGFjaGFibGUsIHN1Y2ggYXMgdmVydGljZXMgaGlkZGVuIGluIHRoZSBib3hcclxuICAgICAgaWYgKCAhY2FuZGlkYXRlVmVydGV4LmF0dGFjaGFibGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vICg1KSBSZWplY3QgYW55IG1hdGNoZXMgdGhhdCByZXN1bHQgaW4gY2lyY3VpdCBlbGVtZW50cyBzaGFyaW5nIGEgcGFpciBvZiB2ZXJ0aWNlcywgd2hpY2ggd291bGQgY2F1c2VcclxuICAgICAgLy8gdGhlIHdpcmVzIHRvIGxheSBhY3Jvc3Mgb25lIGFub3RoZXIgKG9uZSB2ZXJ0ZXggd2FzIGFscmVhZHkgc2hhcmVkKVxyXG5cclxuICAgICAgLy8gaWYgc29tZXRoaW5nIGVsc2UgaXMgYWxyZWFkeSBzbmFwcGluZyB0byBjYW5kaWRhdGVWZXJ0ZXgsIHRoZW4gd2UgY2Fubm90IHNuYXAgdG8gaXQgYXMgd2VsbC5cclxuICAgICAgLy8gY2hlY2sgdGhlIG5laWdoYm9yIHZlcnRpY2VzXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudmVydGV4R3JvdXAuY291bnQ7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBjaXJjdWl0VmVydGV4ID0gdGhpcy52ZXJ0ZXhHcm91cC5nZXRFbGVtZW50KCBpICk7XHJcbiAgICAgICAgY29uc3QgYWRqYWNlbnQgPSB0aGlzLmlzVmVydGV4QWRqYWNlbnQoIGNpcmN1aXRWZXJ0ZXgsIHZlcnRleCApO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgYWRqYWNlbnQgdmVydGV4IGhhcyB0aGUgc2FtZSBwb3NpdGlvbiBhcyB0aGUgY2FuZGlkYXRlIHZlcnRleCwgdGhhdCBtZWFucyBpdCBpcyBhbHJlYWR5IFwic25hcHBlZFwiXHJcbiAgICAgICAgLy8gdGhlcmUgYW5kIGhlbmNlIGFub3RoZXIgdmVydGV4IHNob3VsZCBub3Qgc25hcCB0aGVyZSBhdCB0aGUgc2FtZSB0aW1lLlxyXG4gICAgICAgIGlmICggYWRqYWNlbnQgJiYgY2lyY3VpdFZlcnRleC5wb3NpdGlvblByb3BlcnR5LmdldCgpLmVxdWFscyggY2FuZGlkYXRlVmVydGV4LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGZpeGVkVmVydGljZXMgPSB0aGlzLmZpbmRBbGxGaXhlZFZlcnRpY2VzKCB2ZXJ0ZXggKTtcclxuXHJcbiAgICAgIC8vICg2KSBhIHZlcnRleCBjYW5ub3QgYmUgY29ubmVjdGVkIHRvIGl0cyBvd24gZml4ZWQgc3ViZ3JhcGggKG5vIHdpcmUpXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGZpeGVkVmVydGljZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCBmaXhlZFZlcnRpY2VzWyBpIF0gPT09IGNhbmRpZGF0ZVZlcnRleCApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vICg3KSBhIHdpcmUgdmVydGV4IGNhbm5vdCBjb25uZWN0IGlmIGl0cyBuZWlnaGJvciBpcyBhbHJlYWR5IHByb3Bvc2luZyBhIGNvbm5lY3Rpb25cclxuICAgICAgLy8gWW91IGNhbiBhbHdheXMgYXR0YWNoIHRvIGEgYmxhY2sgYm94IGludGVyZmFjZVxyXG4gICAgICBpZiAoICFjYW5kaWRhdGVWZXJ0ZXguYmxhY2tCb3hJbnRlcmZhY2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBjb25zdCBuZWlnaGJvcnMgPSB0aGlzLmdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzKCBjYW5kaWRhdGVWZXJ0ZXggKTtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuZWlnaGJvcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBuZWlnaGJvciA9IG5laWdoYm9yc1sgaSBdO1xyXG4gICAgICAgICAgY29uc3Qgb3Bwb3NpdGVWZXJ0ZXggPSBuZWlnaGJvci5nZXRPcHBvc2l0ZVZlcnRleCggY2FuZGlkYXRlVmVydGV4ICk7XHJcblxyXG4gICAgICAgICAgLy8gaXMgYW5vdGhlciBub2RlIHByb3Bvc2luZyBhIG1hdGNoIHRvIHRoYXQgbm9kZT9cclxuICAgICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IHRoaXMudmVydGV4R3JvdXAuY291bnQ7IGsrKyApIHtcclxuICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMudmVydGV4R3JvdXAuZ2V0RWxlbWVudCggayApO1xyXG4gICAgICAgICAgICBpZiAoIG5laWdoYm9yIGluc3RhbmNlb2YgV2lyZSAmJlxyXG4gICAgICAgICAgICAgICAgIHYgIT09IHZlcnRleCAmJlxyXG4gICAgICAgICAgICAgICAgIHYgIT09IG9wcG9zaXRlVmVydGV4ICYmXHJcbiAgICAgICAgICAgICAgICAgdi5wb3NpdGlvblByb3BlcnR5LmdldCgpLmVxdWFscyggb3Bwb3NpdGVWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApICYmXHJcbiAgICAgICAgICAgICAgICAgdi5pc0RyYWdnZWRcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyAoOCkgYSB3aXJlIHZlcnRleCBjYW5ub3QgZG91YmxlIGNvbm5lY3QgdG8gYW4gb2JqZWN0LCBjcmVhdGluZyBhIHRpbnkgc2hvcnQgY2lyY3VpdFxyXG4gICAgICBjb25zdCBjYW5kaWRhdGVOZWlnaGJvcnMgPSB0aGlzLmdldE5laWdoYm9yaW5nVmVydGljZXMoIGNhbmRpZGF0ZVZlcnRleCApO1xyXG4gICAgICBjb25zdCBteU5laWdoYm9ycyA9IHRoaXMuZ2V0TmVpZ2hib3JpbmdWZXJ0aWNlcyggdmVydGV4ICk7XHJcbiAgICAgIGNvbnN0IGludGVyc2VjdGlvbiA9IF8uaW50ZXJzZWN0aW9uKCBjYW5kaWRhdGVOZWlnaGJvcnMsIG15TmVpZ2hib3JzICk7XHJcbiAgICAgIGlmICggaW50ZXJzZWN0aW9uLmxlbmd0aCAhPT0gMCApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFsbCB0ZXN0cyBwYXNzZWQsIGl0J3MgT0sgZm9yIGNvbm5lY3Rpb25cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVE9ETyAoYmxhY2stYm94LXN0dWR5KTogaW50ZWdyYXRlIHJ1bGUgKDkpIHdpdGggdGhlIG90aGVyIHJ1bGVzIGFib3ZlXHJcbiAgICAvLyAoOSkgV2hlbiBpbiBCbGFjayBCb3ggXCJidWlsZFwiIG1vZGUgKGkuZS4gYnVpbGRpbmcgaW5zaWRlIHRoZSBibGFjayBib3gpLCBhIHZlcnRleCB1c2VyIGNhbm5vdCBjb25uZWN0IHRvXHJcbiAgICAvLyBhIGJsYWNrIGJveCBpbnRlcmZhY2UgdmVydGV4IGlmIGl0cyBvdGhlciB2ZXJ0aWNlcyB3b3VsZCBiZSBvdXRzaWRlIG9mIHRoZSBibGFjayBib3guICBTZWUgIzEzNlxyXG4gICAgaWYgKCBtb2RlID09PSBJbnRlcmFjdGlvbk1vZGUuVEVTVCApIHtcclxuICAgICAgY29uc3QgYm94Qm91bmRzID0gYmxhY2tCb3hCb3VuZHMhO1xyXG4gICAgICBjb25zdCBmaXhlZFZlcnRpY2VzMiA9IHRoaXMuZmluZEFsbEZpeGVkVmVydGljZXMoIHZlcnRleCApO1xyXG4gICAgICBjYW5kaWRhdGVWZXJ0aWNlcyA9IGNhbmRpZGF0ZVZlcnRpY2VzLmZpbHRlciggY2FuZGlkYXRlVmVydGV4ID0+IHtcclxuXHJcbiAgICAgICAgLy8gRG9uJ3QgY29ubmVjdCB0byB2ZXJ0aWNlcyB0aGF0IG1pZ2h0IGhhdmUgc25lYWtlZCBvdXRzaWRlIG9mIHRoZSBibGFjayBib3gsIHNheSBieSBhIHJvdGF0aW9uLlxyXG4gICAgICAgIGlmICggIWNhbmRpZGF0ZVZlcnRleC5ibGFja0JveEludGVyZmFjZVByb3BlcnR5LmdldCgpICYmICFib3hCb3VuZHMuY29udGFpbnNQb2ludCggY2FuZGlkYXRlVmVydGV4LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhvdyBmYXIgdGhlIHZlcnRleCB3b3VsZCBiZSBtb3ZlZCBpZiBpdCBqb2luZWQgdG8gdGhlIGNhbmRpZGF0ZVxyXG4gICAgICAgIGNvbnN0IGRlbHRhID0gY2FuZGlkYXRlVmVydGV4LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkubWludXMoIHZlcnRleC5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgICAgIGlmICggY2FuZGlkYXRlVmVydGV4LmJsYWNrQm94SW50ZXJmYWNlUHJvcGVydHkuZ2V0KCkgfHwgYm94Qm91bmRzLmNvbnRhaW5zUG9pbnQoIGNhbmRpZGF0ZVZlcnRleC5wb3NpdGlvblByb3BlcnR5LmdldCgpICkgKSB7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBmaXhlZFZlcnRpY2VzMi5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgICAgY29uc3QgY29ubmVjdGVkVmVydGV4ID0gZml4ZWRWZXJ0aWNlczJbIGkgXTtcclxuICAgICAgICAgICAgaWYgKCBjb25uZWN0ZWRWZXJ0ZXguYmxhY2tCb3hJbnRlcmZhY2VQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gT0sgZm9yIGJsYWNrIGJveCBpbnRlcmZhY2UgdmVydGV4IHRvIGJlIHNsaWdodGx5IG91dHNpZGUgdGhlIGJveFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBjb25uZWN0ZWRWZXJ0ZXggIT09IHZlcnRleCAmJiAhYm94Qm91bmRzLmNvbnRhaW5zUG9pbnQoIGNvbm5lY3RlZFZlcnRleC5wb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXMoIGRlbHRhICkgKSAmJlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgIC8vIGV4ZW1wdCB3aXJlcyBjb25uZWN0ZWQgb3V0c2lkZSBvZiB0aGUgYmxhY2sgYm94LCB3aGljaCBhcmUgZmxhZ2dlZCBhcyB1bi1hdHRhY2hhYmxlIGluIGJ1aWxkIG1vZGUsIHNlZSAjMTQxXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0ZWRWZXJ0ZXguYXR0YWNoYWJsZVByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gYSB2ZXJ0ZXggbXVzdCBiZSBhdHRhY2hhYmxlLiBTb21lIGJsYWNrIGJveCB2ZXJ0aWNlcyBhcmUgbm90IGF0dGFjaGFibGUsIHN1Y2ggYXMgdmVydGljZXMgaGlkZGVuIGluIHRoZSBib3hcclxuICAgICAgY2FuZGlkYXRlVmVydGljZXMgPSBjYW5kaWRhdGVWZXJ0aWNlcy5maWx0ZXIoIGNhbmRpZGF0ZVZlcnRleCA9PiAhY2FuZGlkYXRlVmVydGV4Lm91dGVyV2lyZVN0dWIgKTtcclxuICAgIH1cclxuICAgIGlmICggY2FuZGlkYXRlVmVydGljZXMubGVuZ3RoID09PSAwICkgeyByZXR1cm4gbnVsbDsgfVxyXG5cclxuICAgIC8vIEZpbmQgdGhlIGNsb3Nlc3QgbWF0Y2hcclxuICAgIGNvbnN0IHNvcnRlZCA9IF8uc29ydEJ5KCBjYW5kaWRhdGVWZXJ0aWNlcywgY2FuZGlkYXRlVmVydGV4ID0+XHJcbiAgICAgIHZlcnRleC51bnNuYXBwZWRQb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBjYW5kaWRhdGVWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHNvcnRlZFsgMCBdO1xyXG4gIH1cclxuXHJcbiAgLy8gQSByZXBvcnRpbmcgdG9vbCB0byBpbmRpY2F0ZSB3aGV0aGVyIGN1cnJlbnQgaXMgY29uc2VydmVkIGF0IGVhY2ggdmVydGV4XHJcbiAgcHJpdmF0ZSBjaGVja0N1cnJlbnRDb25zZXJ2YXRpb24oIGluZGV4OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBjb25zb2xlLmxvZyggJyMjIyMjIyMgJyArIGluZGV4ICk7XHJcbiAgICAvLyB0aGUgc3VtIG9mIGN1cnJlbnRzIGZsb3dpbmcgaW50byB0aGUgdmVydGV4IHNob3VsZCBiZSAwXHJcbiAgICB0aGlzLnZlcnRleEdyb3VwLmZvckVhY2goIHZlcnRleCA9PiB7XHJcbiAgICAgIGNvbnN0IG5laWdoYm9ycyA9IHRoaXMuZ2V0TmVpZ2hib3JDaXJjdWl0RWxlbWVudHMoIHZlcnRleCApO1xyXG4gICAgICBsZXQgc3VtID0gMDtcclxuICAgICAgbmVpZ2hib3JzLmZvckVhY2goIG5laWdoYm9yID0+IHtcclxuICAgICAgICBjb25zdCBzaWduID0gbmVpZ2hib3Iuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSA9PT0gdmVydGV4ID8gKzEgOiAtMTtcclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gc2lnbiAqIG5laWdoYm9yLmN1cnJlbnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBzdW0gKz0gY3VycmVudDtcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zb2xlLmxvZyggYCR7dmVydGV4LmluZGV4fTogJHtzdW19YCApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHVlIHRvIG51bWVyaWNhbCBmbG9hdGluZyBwb2ludCBlcnJvcnMsIGN1cnJlbnQgbWF5IG5vdCBiZSBleGFjdGx5IGNvbnNlcnZlZC4gIEJ1dCB3ZSBkb24ndCB3YW50IHRvIHNob3cgZWxlY3Ryb25zXHJcbiAgICogbW92aW5nIGluIHNvbWUgcGFydCBvZiBhIGxvb3AgYnV0IG5vdCBvdGhlcnMsIHNvIHdlIG1hbnVhbGx5IGVuZm9yY2UgY3VycmVudCBjb25zZXJ2YXRpb24gYXQgZWFjaCB2ZXJ0ZXguXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnNlcnZlQ3VycmVudCggdmVydGV4OiBWZXJ0ZXgsIGxvY2tlZDogQ2lyY3VpdEVsZW1lbnRbXSApOiB2b2lkIHtcclxuICAgIC8vIHRoZSBzdW0gb2YgY3VycmVudHMgZmxvd2luZyBpbnRvIHRoZSB2ZXJ0ZXggc2hvdWxkIGJlIDBcclxuICAgIGNvbnN0IG5laWdoYm9ycyA9IHRoaXMuZ2V0TmVpZ2hib3JDaXJjdWl0RWxlbWVudHMoIHZlcnRleCApO1xyXG4gICAgbGV0IHN1bSA9IDA7XHJcbiAgICBuZWlnaGJvcnMuZm9yRWFjaCggbmVpZ2hib3IgPT4ge1xyXG4gICAgICBjb25zdCBzaWduID0gbmVpZ2hib3Iuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSA9PT0gdmVydGV4ID8gKzEgOiAtMTtcclxuICAgICAgY29uc3QgY3VycmVudCA9IHNpZ24gKiBuZWlnaGJvci5jdXJyZW50UHJvcGVydHkudmFsdWU7XHJcbiAgICAgIHN1bSArPSBjdXJyZW50O1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIElmIHRoZSBhbW91bnQgb2YgdW5jb25zZXJ2ZWQgY3VycmVudCBpcyB0b28gaGlnaCwgdGhlbiB0cnkgdG8gYWRqdXN0IG90aGVyIGN1cnJlbnRzIHRvIGNvbXBlbnNhdGVcclxuICAgIGlmICggTWF0aC5hYnMoIHN1bSApID4gMUUtMTAgKSB7XHJcblxyXG4gICAgICAvLyBkaXZpZGUgdGhlIHByb2JsZW0gdG8gYWxsIG11dGFibGUgKHBhcnRpY2lwYW50KSwgbm9uLWxvY2tlZCBuZWlnaGJvcnNcclxuICAgICAgY29uc3QgdW5sb2NrZWROZWlnaGJvcnMgPSBuZWlnaGJvcnMuZmlsdGVyKCBuID0+ICFsb2NrZWQuaW5jbHVkZXMoIG4gKSApO1xyXG4gICAgICBjb25zdCBvdmVyZmxvdyA9IHN1bSAvIHVubG9ja2VkTmVpZ2hib3JzLmxlbmd0aDtcclxuICAgICAgdW5sb2NrZWROZWlnaGJvcnMuZm9yRWFjaCggbmVpZ2hib3IgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNpZ24gPSBuZWlnaGJvci5zdGFydFZlcnRleFByb3BlcnR5LnZhbHVlID09PSB2ZXJ0ZXggPyArMSA6IC0xO1xyXG4gICAgICAgIG5laWdoYm9yLmN1cnJlbnRQcm9wZXJ0eS52YWx1ZSArPSAtc2lnbiAqIG92ZXJmbG93O1xyXG4gICAgICAgIGxvY2tlZC5wdXNoKCBuZWlnaGJvciApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGbGlwIHRoZSBnaXZlbiBDaXJjdWl0RWxlbWVudFxyXG4gICAqIEBwYXJhbSBjaXJjdWl0RWxlbWVudCAtIHRoZSBjaXJjdWl0IGVsZW1lbnQgdG8gZmxpcFxyXG4gICAqL1xyXG4gIHB1YmxpYyBmbGlwKCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKTogdm9pZCB7XHJcbiAgICBjb25zdCBzdGFydFZlcnRleCA9IGNpcmN1aXRFbGVtZW50LnN0YXJ0VmVydGV4UHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBlbmRWZXJ0ZXggPSBjaXJjdWl0RWxlbWVudC5lbmRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNpcmN1aXRFbGVtZW50LnN0YXJ0VmVydGV4UHJvcGVydHkudmFsdWUgPSBlbmRWZXJ0ZXg7XHJcbiAgICBjaXJjdWl0RWxlbWVudC5lbmRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZSA9IHN0YXJ0VmVydGV4O1xyXG5cclxuICAgIGNvbnN0IGZsaXBwZWQgPSBjaXJjdWl0RWxlbWVudC5jdXJyZW50U2Vuc2VQcm9wZXJ0eS52YWx1ZSA9PT0gQ3VycmVudFNlbnNlLkZPUldBUkQgPyBDdXJyZW50U2Vuc2UuQkFDS1dBUkQgOlxyXG4gICAgICAgICAgICAgICAgICAgIGNpcmN1aXRFbGVtZW50LmN1cnJlbnRTZW5zZVByb3BlcnR5LnZhbHVlID09PSBDdXJyZW50U2Vuc2UuQkFDS1dBUkQgPyBDdXJyZW50U2Vuc2UuRk9SV0FSRCA6XHJcbiAgICAgICAgICAgICAgICAgICAgQ3VycmVudFNlbnNlLlVOU1BFQ0lGSUVEO1xyXG4gICAgY2lyY3VpdEVsZW1lbnQuY3VycmVudFNlbnNlUHJvcGVydHkudmFsdWUgPSBmbGlwcGVkO1xyXG5cclxuICAgIC8vIExheW91dCB0aGUgY2hhcmdlcyBpbiB0aGUgY2lyY3VpdEVsZW1lbnQgYnV0IG5vd2hlcmUgZWxzZSwgc2luY2UgdGhhdCBjcmVhdGVzIGEgZGlzY29udGludWl0eSBpbiB0aGUgbW90aW9uXHJcbiAgICBjaXJjdWl0RWxlbWVudC5jaGFyZ2VMYXlvdXREaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLmxheW91dENoYXJnZXNJbkRpcnR5Q2lyY3VpdEVsZW1lbnRzKCk7XHJcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbmQgcG9zaXRpb25zIGNoYXJnZXMgaW4gdGhlIHNwZWNpZmllZCBjaXJjdWl0IGVsZW1lbnQuXHJcbiAgICogQHBhcmFtIGNpcmN1aXRFbGVtZW50IC0gdGhlIGNpcmN1aXQgZWxlbWVudCB3aXRoaW4gd2hpY2ggdGhlIGNoYXJnZXMgd2lsbCBiZSB1cGRhdGVkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBsYXlvdXRDaGFyZ2VzKCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gQXZvaWQgdW5uZWNlc3Nhcnkgd29yayB0byBpbXByb3ZlIHBlcmZvcm1hbmNlXHJcbiAgICBpZiAoIGNpcmN1aXRFbGVtZW50LmNoYXJnZUxheW91dERpcnR5ICkge1xyXG5cclxuICAgICAgY2lyY3VpdEVsZW1lbnQuY2hhcmdlTGF5b3V0RGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIElkZW50aWZ5IGNoYXJnZXMgdGhhdCB3ZXJlIGFscmVhZHkgaW4gdGhlIGJyYW5jaC5cclxuICAgICAgY29uc3QgY2hhcmdlcyA9IHRoaXMuZ2V0Q2hhcmdlc0luQ2lyY3VpdEVsZW1lbnQoIGNpcmN1aXRFbGVtZW50ICk7XHJcblxyXG4gICAgICAvLyBwdXQgY2hhcmdlcyAxLzIgc2VwYXJhdGlvbiBmcm9tIHRoZSBlZGdlIHNvIGl0IHdpbGwgbWF0Y2ggdXAgd2l0aCBhZGphY2VudCBjb21wb25lbnRzXHJcbiAgICAgIGNvbnN0IG9mZnNldCA9IENDS0NDb25zdGFudHMuQ0hBUkdFX1NFUEFSQVRJT04gLyAyO1xyXG4gICAgICBjb25zdCBsYXN0Q2hhcmdlUG9zaXRpb24gPSBjaXJjdWl0RWxlbWVudC5jaGFyZ2VQYXRoTGVuZ3RoIC0gb2Zmc2V0O1xyXG4gICAgICBjb25zdCBmaXJzdENoYXJnZVBvc2l0aW9uID0gb2Zmc2V0O1xyXG4gICAgICBjb25zdCBsZW5ndGhGb3JDaGFyZ2VzID0gbGFzdENoYXJnZVBvc2l0aW9uIC0gZmlyc3RDaGFyZ2VQb3NpdGlvbjtcclxuXHJcbiAgICAgIC8vIFV0aWxzLnJvdW5kU3ltbWV0cmljIGxlYWRzIHRvIGNoYXJnZXMgdG9vIGZhciBhcGFydCB3aGVuIE49MlxyXG4gICAgICBjb25zdCBudW1iZXJPZkNoYXJnZXMgPSBNYXRoLmNlaWwoIGxlbmd0aEZvckNoYXJnZXMgLyBDQ0tDQ29uc3RhbnRzLkNIQVJHRV9TRVBBUkFUSU9OICk7XHJcblxyXG4gICAgICAvLyBjb21wdXRlIGRpc3RhbmNlIGJldHdlZW4gYWRqYWNlbnQgY2hhcmdlc1xyXG4gICAgICBjb25zdCBzcGFjaW5nID0gbGVuZ3RoRm9yQ2hhcmdlcyAvICggbnVtYmVyT2ZDaGFyZ2VzIC0gMSApO1xyXG5cclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZDaGFyZ2VzOyBpKysgKSB7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgc2luZ2xlIHBhcnRpY2xlLCBzaG93IGl0IGluIHRoZSBtaWRkbGUgb2YgdGhlIGNvbXBvbmVudCwgb3RoZXJ3aXNlIHNwYWNlIGVxdWFsbHlcclxuICAgICAgICBjb25zdCBjaGFyZ2VQb3NpdGlvbiA9IG51bWJlck9mQ2hhcmdlcyA9PT0gMSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIGZpcnN0Q2hhcmdlUG9zaXRpb24gKyBsYXN0Q2hhcmdlUG9zaXRpb24gKSAvIDIgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSAqIHNwYWNpbmcgKyBvZmZzZXQ7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlc2lyZWRDaGFyZ2UgPSB0aGlzLmN1cnJlbnRUeXBlUHJvcGVydHkuZ2V0KCkgPT09IEN1cnJlbnRUeXBlLkVMRUNUUk9OUyA/IC0xIDogKzE7XHJcblxyXG4gICAgICAgIGlmICggY2hhcmdlcy5sZW5ndGggPiAwICYmXHJcbiAgICAgICAgICAgICBjaGFyZ2VzWyAwIF0uY2hhcmdlID09PSBkZXNpcmVkQ2hhcmdlICYmXHJcbiAgICAgICAgICAgICBjaGFyZ2VzWyAwIF0uY2lyY3VpdEVsZW1lbnQgPT09IGNpcmN1aXRFbGVtZW50ICYmXHJcbiAgICAgICAgICAgICBjaGFyZ2VzWyAwIF0udmlzaWJsZVByb3BlcnR5ID09PSB0aGlzLnNob3dDdXJyZW50UHJvcGVydHkgKSB7XHJcblxyXG4gICAgICAgICAgY29uc3QgYyA9IGNoYXJnZXMuc2hpZnQoKSE7IC8vIHJlbW92ZSAxc3QgZWxlbWVudCwgc2luY2UgaXQncyB0aGUgY2hhcmdlIHdlIGNoZWNrZWQgaW4gdGhlIGd1YXJkXHJcbiAgICAgICAgICBjLmNpcmN1aXRFbGVtZW50ID0gY2lyY3VpdEVsZW1lbnQ7XHJcbiAgICAgICAgICBjLmRpc3RhbmNlID0gY2hhcmdlUG9zaXRpb247XHJcbiAgICAgICAgICBjLnVwZGF0ZVBvc2l0aW9uQW5kQW5nbGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gbm90aGluZyBzdWl0YWJsZSBpbiB0aGUgcG9vbCwgY3JlYXRlIHNvbWV0aGluZyBuZXdcclxuICAgICAgICAgIGNvbnN0IGNoYXJnZSA9IG5ldyBDaGFyZ2UoIGNpcmN1aXRFbGVtZW50LCBjaGFyZ2VQb3NpdGlvbiwgdGhpcy5zaG93Q3VycmVudFByb3BlcnR5LCBkZXNpcmVkQ2hhcmdlICk7XHJcbiAgICAgICAgICB0aGlzLmNoYXJnZXMuYWRkKCBjaGFyZ2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFueSBjaGFyZ2VzIHRoYXQgZGlkIG5vdCBnZXQgcmVjeWNsZWQgc2hvdWxkIGJlIHJlbW92ZWRcclxuICAgICAgdGhpcy5jaGFyZ2VzLnJlbW92ZUFsbCggY2hhcmdlcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gb25seSB3b3JrcyBpbiB1bmJ1aWx0IG1vZGVcclxuICBwdWJsaWMgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLmNpcmN1aXRFbGVtZW50cy5tYXAoIGMgPT4gYy5jb25zdHJ1Y3Rvci5uYW1lICkuam9pbiggJywgJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIENpcmN1aXQgdG8gaXRzIGluaXRpYWwgc3RhdGUuXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbGVhcigpO1xyXG4gICAgdGhpcy5zaG93Q3VycmVudFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmN1cnJlbnRUeXBlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMud2lyZVJlc2lzdGl2aXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc291cmNlUmVzaXN0YW5jZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNoYXJnZUFuaW1hdG9yLnJlc2V0KCk7XHJcbiAgICB0aGlzLnNlbGVjdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBDaXJjdWl0U3RhdGVJTyA9IG5ldyBJT1R5cGUoICdDaXJjdWl0U3RhdGVJTycsIHtcclxuICB2YWx1ZVR5cGU6IENpcmN1aXQsXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VmFsdWU6IHtcclxuICAgICAgcmV0dXJuVHlwZTogT2JqZWN0TGl0ZXJhbElPLFxyXG4gICAgICBwYXJhbWV0ZXJUeXBlczogW10sXHJcbiAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggdGhpczogQ2lyY3VpdCApIHtcclxuICAgICAgICByZXR1cm4gcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lLmdldFN0YXRlKCB0aGlzICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGRvY3VtZW50YXRpb246ICdHZXRzIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBjaXJjdWl0IG9uIHRoaXMgc2NyZWVuLidcclxuICAgIH0sXHJcbiAgICBnZXRWYWxpZGF0aW9uRXJyb3I6IHtcclxuICAgICAgcmV0dXJuVHlwZTogTnVsbGFibGVJTyggU3RyaW5nSU8gKSxcclxuICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgT2JqZWN0TGl0ZXJhbElPIF0sXHJcbiAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggdGhpczogQ2lyY3VpdCwgdmFsdWUgKSB7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBzcGVjaWZpZWQgY2lyY3VpdCBjb3JyZXNwb25kcyB0byB0aGlzLnRhbmRlbUlELiBUbyBhdm9pZCBwYXN0aW5nIGEgY2lyY3VpdCBmcm9tIHNjcmVlbjEgaW50byBzY3JlZW4yXHJcbiAgICAgICAgY29uc3Qga2V5cyA9IEFycmF5LmZyb20oIE9iamVjdC5rZXlzKCB2YWx1ZSApICk7XHJcblxyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBrZXkgPSBrZXlzWyBpIF07XHJcbiAgICAgICAgICBpZiAoICFrZXkuc3RhcnRzV2l0aCggdGhpcy5waGV0aW9JRCApICkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2tleSBoYWQgaW5jb3JyZWN0IHByZWZpeC4gRXhwZWN0ZWQ6ICcgKyB0aGlzLnBoZXRpb0lEICsgJyBidXQgZ290OiAnICsga2V5O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfSxcclxuICAgICAgZG9jdW1lbnRhdGlvbjogJ0NoZWNrcyB0byBzZWUgaWYgYSBwcm9wb3NlZCB2YWx1ZSBpcyB2YWxpZC4gUmV0dXJucyB0aGUgZmlyc3QgdmFsaWRhdGlvbiBlcnJvciwgb3IgbnVsbCBpZiB0aGUgdmFsdWUgaXMgdmFsaWQuJ1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRWYWx1ZToge1xyXG4gICAgICByZXR1cm5UeXBlOiBWb2lkSU8sXHJcbiAgICAgIHBhcmFtZXRlclR5cGVzOiBbIE9iamVjdExpdGVyYWxJTyBdLFxyXG4gICAgICBkb2N1bWVudGF0aW9uOiAnU2V0cyB0aGUgY2lyY3VpdCB0aGF0IHdhcyBjcmVhdGVkIG9uIHRoaXMgc2NyZWVuLiBUcnlpbmcgdG8gc2V0IGEgY2lyY3VpdCBmcm9tIGFub3RoZXIgc2NyZWVuIHJlc3VsdHMgaW4gYW4gZXJyb3IuJyxcclxuICAgICAgaW1wbGVtZW50YXRpb246IGZ1bmN0aW9uKCB0aGlzOiBDaXJjdWl0LCBzdGF0ZTogUGhldGlvU3RhdGUgKSB7XHJcbiAgICAgICAgcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lLnNldFN0YXRlKCBzdGF0ZSwgdGhpcy50YW5kZW0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSApO1xyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0NpcmN1aXQnLCBDaXJjdWl0ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHFDQUFxQztBQUNqRSxPQUFPQyxPQUFPLE1BQU0sNkJBQTZCO0FBQ2pELE9BQU9DLGNBQWMsTUFBTSxvQ0FBb0M7QUFDL0QsT0FBT0MscUJBQXFCLE1BQTJCLDJDQUEyQztBQUNsRyxPQUFPQyxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSw4QkFBOEI7QUFDcEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLFVBQVUsTUFBTSx3Q0FBd0M7QUFDL0QsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxhQUFhLE1BQU0scUJBQXFCO0FBQy9DLE9BQU9DLG1CQUFtQixNQUFNLDJCQUEyQjtBQUMzRCxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFDN0UsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUN0QyxPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUNsQyxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3RDLE9BQU9DLE1BQU0sTUFBTSxhQUFhO0FBQ2hDLE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7QUFDaEQsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLHFCQUFxQixN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