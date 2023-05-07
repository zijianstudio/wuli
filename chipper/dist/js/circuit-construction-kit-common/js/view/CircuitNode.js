// Copyright 2015-2023, University of Colorado Boulder

/**
 * The Node that represents a Circuit, including all Wires and FixedCircuitElements, Charge, Solder and Sensors.
 * It also renders the voltmeter and ammeter. It can be zoomed in and out.
 *
 * Each CircuitElementNode may node parts that appear in different layers, such as the highlight and the light bulb
 * socket.  Having the light bulb socket in another layer makes it possible to show the charges going "through" the
 * socket (in z-ordering). The CircuitElementNode constructors populate different layers of the CircuitNode in
 * their constructors and depopulate in their dispose functions.
 *
 * Exists for the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import scissorsShape from '../../../sherpa/js/fontawesome-4/scissorsShape.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CircuitDebugLayer from './CircuitDebugLayer.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from '../model/ACVoltage.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import FixedCircuitElement from '../model/FixedCircuitElement.js';
import Fuse from '../model/Fuse.js';
import Inductor from '../model/Inductor.js';
import LightBulb from '../model/LightBulb.js';
import Resistor from '../model/Resistor.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Switch from '../model/Switch.js';
import VoltageConnection from '../model/VoltageConnection.js';
import Wire from '../model/Wire.js';
import ACVoltageNode from './ACVoltageNode.js';
import BatteryNode from './BatteryNode.js';
import CapacitorCircuitElementNode from './CapacitorCircuitElementNode.js';
import CCKCLightBulbNode from './CCKCLightBulbNode.js';
import ChargeNode from './ChargeNode.js';
import CircuitElementNode from './CircuitElementNode.js';
import CustomLightBulbNode from './CustomLightBulbNode.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import FuseNode from './FuseNode.js';
import InductorNode from './InductorNode.js';
import ResistorNode from './ResistorNode.js';
import SeriesAmmeterNode from './SeriesAmmeterNode.js';
import SolderNode from './SolderNode.js';
import SwitchNode from './SwitchNode.js';
import ValueNode from './ValueNode.js';
import VertexNode from './VertexNode.js';
import WireNode from './WireNode.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import PhetioGroup from '../../../tandem/js/PhetioGroup.js';
import CurrentSense from '../model/CurrentSense.js';
import Multilink from '../../../axon/js/Multilink.js';
import Dog from '../model/Dog.js';
import DogNode from './DogNode.js';
import ResistorType from '../model/ResistorType.js';
import AmmeterConnection from '../model/AmmeterConnection.js';
import CircuitElementEditContainerNode from './CircuitElementEditContainerNode.js';
import DisplayClickToDismissListener from '../../../joist/js/DisplayClickToDismissListener.js';

// constants

// In https://github.com/phetsims/circuit-construction-kit-dc/issues/140 we decided to test every platform with
// svg rendering to avoid svg/webgl lag issues and have a consistent renderer across platforms.  However, we will
// leave in all of the WebGL code in case we have performance problems on a platform that require WebGL to be restored?
const RENDERER = 'svg';
export default class CircuitNode extends Node {
  // CircuitElementNodes add highlights directly to this layer when they are constructed

  // SeriesAmmeterNodes add to this layer when they are constructed
  // Shows the front panel of SeriesAmmeterNodes (which shows the current readout) so the charges look like they
  // flow through.
  // layer for vertex buttons
  // layer for "show values"
  // layer for light rays, since it cannot be rendered in WebGL
  // layer that contains the wires
  // layer that shows the solder joints
  // layer that shows the Vertex instances
  // contains FixedCircuitElements
  // CCKCLightBulbNode calls addChild/removeChild to add sockets to the front layer
  // layer that shows the Charge instances
  // layer that shows the Voltmeter and Ammeter (but not the SeriesAmmeter, which is shown in the fixedCircuitElementLayer)
  // the visible bounds in the coordinate frame of the circuit.  Initialized with a placeholder value until it is filled
  // in by CCKCScreenView (after attached to a parent)
  // the Circuit model depicted by this view
  // Map to find CircuitElement=>CircuitElementNode. key is CircuitElement.id, value is CircuitElementNode
  // Map of Vertex.index => SolderNode
  // Map of Vertex.index => VertexNode
  /**
   * @param circuit - the model Circuit
   * @param screenView - for dropping CircuitElement instances back in the toolbox
   */
  constructor(circuit, screenView, tandem) {
    super();
    this.viewTypeProperty = screenView.model.viewTypeProperty;
    this.model = screenView.model;

    // the part of the screen that can be seen in view coordinates
    this.visibleBoundsProperty = screenView.visibleBoundsProperty;

    // the layer behind the control panels
    this.circuitNodeBackLayer = screenView.circuitNodeBackLayer;
    this.highlightLayer = new Node();
    this.seriesAmmeterNodeReadoutPanelLayer = new Node();
    this.buttonLayer = new Node();
    this.valueLayer = new Node();
    this.lightRaysLayer = new Node();
    this.wireLayer = new Node({
      renderer: RENDERER,
      // preallocate sprite sheet
      children: [new Node({
        visible: false,
        children: WireNode.webglSpriteNodes
      })]
    });
    this.solderLayer = new Node({
      renderer: RENDERER,
      // preallocate sprite sheet
      children: [new Node({
        visible: false,
        children: SolderNode.webglSpriteNodes
      })]
    });
    this.vertexLayer = new Node({
      renderer: RENDERER,
      // preallocate sprite sheet
      children: [new Node({
        visible: false,
        children: VertexNode.webglSpriteNodes
      })]
    });
    this.fixedCircuitElementLayer = new Node({
      // add a child eagerly so the WebGL block is all allocated when 1st object is dragged out of toolbox
      renderer: RENDERER,
      children: [new Node({
        visible: false,
        children: [].concat(BatteryNode.webglSpriteNodes).concat(ResistorNode.webglSpriteNodes).concat(FixedCircuitElementNode.webglSpriteNodes).concat(CustomLightBulbNode.webglSpriteNodes).concat(FuseNode.webglSpriteNodes)
      })]
    });
    this.lightBulbSocketLayer = new Node({
      renderer: RENDERER,
      // preallocate sprite sheet
      children: [new Node({
        visible: false,
        children: CustomLightBulbNode.webglSpriteNodes
      })]
    });
    this.chargeLayer = new Node({
      renderer: RENDERER

      // preallocate sprite sheet
      // children: [ new Node( {
      //   visible: false,
      //   // children: ChargeNode.webglSpriteNodes
      // } ) ]
    });

    Multilink.multilink([screenView.model.isValueDepictionEnabledProperty, screenView.model.revealingProperty], (isValueDepictionEnabled, revealing) => {
      this.chargeLayer.visible = isValueDepictionEnabled && revealing;
    });
    this.sensorLayer = new Node();
    this.beforeCircuitElementsLayer = new Node();
    this.afterCircuitElementsLayer = new Node();

    // For lifelike: Solder should be in front of wires but behind batteries and resistors.
    const lifelikeLayering = [this.lightRaysLayer, this.beforeCircuitElementsLayer, this.wireLayer,
    // wires go behind other circuit elements
    this.solderLayer, this.fixedCircuitElementLayer,
    // circuit elements and meters
    this.vertexLayer, this.chargeLayer, this.lightBulbSocketLayer,
    // fronts of light bulbs
    this.seriesAmmeterNodeReadoutPanelLayer,
    // fronts of series ammeters
    this.afterCircuitElementsLayer, this.sensorLayer, this.highlightLayer,
    // highlights go in front of everything else
    this.valueLayer,
    // values
    this.buttonLayer // vertex buttons
    ];

    // For schematic: Solder should be in front of all components
    const schematicLayering = [this.lightRaysLayer, this.beforeCircuitElementsLayer, this.wireLayer, this.fixedCircuitElementLayer, this.solderLayer, this.vertexLayer, this.chargeLayer, this.lightBulbSocketLayer, this.seriesAmmeterNodeReadoutPanelLayer, this.afterCircuitElementsLayer, this.sensorLayer, this.highlightLayer, this.valueLayer, this.buttonLayer];

    // choose layering for schematic vs lifelike.  HEADS UP, this means circuitNode.addChild() will get overwritten
    // so all nodes must be added as children in the array above.
    screenView.model.viewTypeProperty.link(viewType => {
      this.children = viewType === CircuitElementViewType.LIFELIKE ? lifelikeLayering : schematicLayering;
    });
    this.visibleBoundsInCircuitCoordinateFrameProperty = new Property(new Bounds2(0, 0, 1, 1));
    this.circuit = circuit;
    this.circuitElementNodeMap = {};
    this.solderNodes = {};
    this.vertexNodes = {};

    /**
     * For each CircuitElement type, do the following:
     * (a) Add nodes for pre-existing model elements
     * (b) Add a listener that adds nodes when model elements are added
     * (c) Add a listener that removes nodes when model elements are removed
     */
    const initializeCircuitElementType = (predicate, layer, phetioGroup) => {
      const addCircuitElement = circuitElement => {
        if (predicate(circuitElement)) {
          const circuitElementNode = phetioGroup.createCorrespondingGroupElement(circuitElement.tandem.name, circuitElement);
          this.circuitElementNodeMap[circuitElement.id] = circuitElementNode;
          layer.addChild(circuitElementNode);

          // Show the ValueNode for readouts, though series ammeters already show their own readouts and Wires do not
          // have readouts
          if (circuitElement instanceof FixedCircuitElement && !(circuitElement instanceof SeriesAmmeter)) {
            const valueNode = new ValueNode(circuit.sourceResistanceProperty, circuitElement, this.model.showValuesProperty, this.model.viewTypeProperty, Tandem.OPTIONAL);
            this.valueLayer.addChild(valueNode);
            circuitElement.disposeEmitterCircuitElement.addListener(() => {
              this.valueLayer.removeChild(valueNode);
              valueNode.dispose();
            });
          }
        }
      };
      circuit.circuitElements.addItemAddedListener(addCircuitElement);
      circuit.circuitElements.forEach(addCircuitElement);
      circuit.circuitElements.addItemRemovedListener(circuitElement => {
        if (predicate(circuitElement)) {
          const circuitElementNode = this.getCircuitElementNode(circuitElement);
          layer.removeChild(circuitElementNode);
          phetioGroup.disposeElement(circuitElementNode);
          delete this.circuitElementNodeMap[circuitElement.id];
        }
      });
    };
    initializeCircuitElementType(e => e instanceof Wire, this.wireLayer, new PhetioGroup((tandem, circuitElement) => new WireNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.wireGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('wireNodeGroup'),
      supportsDynamicState: false
    }));
    initializeCircuitElementType(e => e instanceof Battery && e.batteryType === 'normal', this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new BatteryNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.batteryGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('batteryNodeGroup'),
      supportsDynamicState: false
    }));
    initializeCircuitElementType(e => e instanceof LightBulb && !e.isExtreme && !e.isReal, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new CCKCLightBulbNode(screenView, this, circuitElement, this.model.isValueDepictionEnabledProperty, this.model.viewTypeProperty, tandem), () => [this.circuit.lightBulbGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('lightBulbNodeGroup'),
      supportsDynamicState: false
    }));
    this.circuit.seriesAmmeterGroup && initializeCircuitElementType(e => e instanceof SeriesAmmeter, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new SeriesAmmeterNode(screenView, this, circuitElement, tandem, this.model.isValueDepictionEnabledProperty), () => [this.circuit.seriesAmmeterGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('seriesAmmeterNodeGroup'),
      supportsDynamicState: false
    }));
    initializeCircuitElementType(e => e instanceof Battery && e.batteryType === 'high-voltage', this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new BatteryNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.batteryGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('extremeBatteryNodeGroup'),
      supportsDynamicState: false
    }));
    this.circuit.extremeResistorGroup && initializeCircuitElementType(e => e instanceof Resistor && e.resistorType === ResistorType.EXTREME_RESISTOR, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new ResistorNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.extremeResistorGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('extremeResistorNodeGroup'),
      supportsDynamicState: false
    }));
    this.circuit.extremeLightBulbGroup && initializeCircuitElementType(e => e instanceof LightBulb && e.isExtreme && !e.isReal, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new CCKCLightBulbNode(screenView, this, circuitElement, this.model.isValueDepictionEnabledProperty, this.model.viewTypeProperty, tandem), () => [this.circuit.extremeLightBulbGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('extremeLightBulbNodeGroup'),
      supportsDynamicState: false
    }));
    this.circuit.realLightBulbGroup && initializeCircuitElementType(e => e instanceof LightBulb && e.isReal, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new CCKCLightBulbNode(screenView, this, circuitElement, this.model.isValueDepictionEnabledProperty, this.model.viewTypeProperty, tandem), () => [this.circuit.realLightBulbGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('realLightBulbNodeGroup'),
      supportsDynamicState: false
    }));
    this.circuit.capacitorGroup && initializeCircuitElementType(e => e instanceof Capacitor, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new CapacitorCircuitElementNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.capacitorGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('capacitorNodeGroup'),
      supportsDynamicState: false
    }));
    this.circuit.acVoltageGroup && initializeCircuitElementType(e => e instanceof ACVoltage, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new ACVoltageNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.acVoltageGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('acVoltageNodeGroup'),
      supportsDynamicState: false
    }));
    this.circuit.inductorGroup && initializeCircuitElementType(e => e instanceof Inductor, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new InductorNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.inductorGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('inductorNodeGroup'),
      supportsDynamicState: false
    }));
    initializeCircuitElementType(e => e instanceof Resistor && e.resistorType === ResistorType.RESISTOR, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new ResistorNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.resistorGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('resistorNodeGroup'),
      supportsDynamicState: false
    }));
    initializeCircuitElementType(e => e instanceof Resistor && e.resistorType !== ResistorType.RESISTOR && e.resistorType !== ResistorType.EXTREME_RESISTOR, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => {
      if (circuitElement instanceof Dog) {
        return new DogNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem);
      } else {
        return new ResistorNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem);
      }
    }, () => [this.circuit.householdObjectGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('householdObjectNodeGroup'),
      supportsDynamicState: false
    }));
    initializeCircuitElementType(e => e instanceof Switch, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new SwitchNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.switchGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('switchNodeGroup'),
      supportsDynamicState: false
    }));
    initializeCircuitElementType(e => e instanceof Fuse, this.fixedCircuitElementLayer, new PhetioGroup((tandem, circuitElement) => new FuseNode(screenView, this, circuitElement, this.model.viewTypeProperty, tandem), () => [this.circuit.fuseGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('fuseNodeGroup'),
      supportsDynamicState: false
    }));

    // When a vertex is selected, a cut button is shown near to the vertex.  If the vertex is connected to >1 circuit
    // element, the button is enabled.  Pressing the button will cut the vertex from the neighbors.  Only one vertexCutButton
    // is allocated for all vertices (per screen) to use because it is too performance demanding to create these
    // dynamically when circuit elements are dragged from the toolbox.  Also, only one vertex can be selected at once
    // so there is only a need for one cut button.
    const cutIcon = new Path(scissorsShape, {
      fill: 'black',
      rotation: -Math.PI / 2,
      // scissors point up
      maxWidth: 36
    });
    this.vertexCutButton = new RoundPushButton({
      baseColor: 'yellow',
      content: cutIcon,
      xMargin: 10,
      yMargin: 10,
      // The cut button should appear at the top level of the view in the PhET-iO tree (consistent
      // with other global-use buttons), so we are using the screenView tandem here
      tandem: screenView.tandem.createTandem('vertexCutButton'),
      enabledPropertyOptions: {
        phetioReadOnly: true,
        phetioFeatured: false
      }
    });
    this.vertexCutButton.addListener(() => {
      const selectedVertex = circuit.getSelectedVertex();
      assert && assert(selectedVertex, 'Button should only be available if a vertex is selected');
      if (selectedVertex) {
        circuit.cutVertex(selectedVertex);

        // Make sure no vertices got nudged out of bounds during a cut, see https://github.com/phetsims/circuit-construction-kit-dc/issues/138
        moveVerticesInBounds(this.visibleBoundsInCircuitCoordinateFrameProperty.value);
      }
    });
    const vertexNodeGroup = new PhetioGroup((tandem, vertex) => {
      return new VertexNode(this, vertex, tandem);
    }, () => [circuit.vertexGroup.archetype], {
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      tandem: tandem.createTandem('vertexNodeGroup'),
      supportsDynamicState: false
    });

    // When a Vertex is added to the model, create the corresponding views
    const addVertexNode = vertex => {
      const solderNode = new SolderNode(this, vertex);
      this.solderNodes[vertex.index] = solderNode;
      this.solderLayer.addChild(solderNode);
      const vertexNode = vertexNodeGroup.createCorrespondingGroupElement(vertex.tandem.name, vertex);
      this.vertexNodes[vertex.index] = vertexNode;
      this.vertexLayer.addChild(vertexNode);
    };
    circuit.vertexGroup.elementCreatedEmitter.addListener(addVertexNode);

    // When a Vertex is removed from the model, remove and dispose the corresponding views
    circuit.vertexGroup.elementDisposedEmitter.addListener(vertex => {
      const vertexNode = this.getVertexNode(vertex);
      this.vertexLayer.removeChild(vertexNode);
      delete this.vertexNodes[vertex.index];
      vertexNodeGroup.disposeElement(vertexNode);
      assert && assert(!this.getVertexNode(vertex), 'vertex node should have been removed');
      const solderNode = this.getSolderNode(vertex);
      this.solderLayer.removeChild(solderNode);
      delete this.solderNodes[vertex.index];
      solderNode.dispose();
      assert && assert(!this.getSolderNode(vertex), 'solder node should have been removed');
    });
    circuit.vertexGroup.forEach(addVertexNode);

    // When the screen is resized or zoomed, move all vertices into view.
    const moveVerticesInBounds = localBounds => {
      // Check all vertices
      for (let i = 0; i < circuit.vertexGroup.count; i++) {
        const vertex = circuit.vertexGroup.getElement(i);
        const position = vertex.positionProperty.get();

        // If any Vertex is out of bounds, move it and all connected Vertices (to preserve geometry) in bounds.
        if (!localBounds.containsPoint(position)) {
          const closestPoint = localBounds.getClosestPoint(position.x, position.y);
          const delta = closestPoint.minus(position);

          // Find all vertices connected by fixed length nodes.
          const vertices = circuit.findAllConnectedVertices(vertex);
          this.translateVertexGroup(vertex, vertices, delta, null, []);
        }
      }
    };
    this.visibleBoundsInCircuitCoordinateFrameProperty.link(moveVerticesInBounds);

    // When a charge is added, add the corresponding ChargeNode (removed it its dispose call)
    circuit.charges.addItemAddedListener(charge => this.chargeLayer.addChild(new ChargeNode(charge, this)));
    if (CCKCQueryParameters.showCurrents) {
      this.circuitDebugLayer = new CircuitDebugLayer(this);
      this.addChild(this.circuitDebugLayer);
    } else {
      this.circuitDebugLayer = null;
    }

    // listener for 'click outside to dismiss'
    phet.joist.display.addInputListener(new DisplayClickToDismissListener(event => {
      // if the target was in a CircuitElementEditContainerNode, don't dismiss the event because the user was
      // dragging the slider or pressing the trash button or another control in that panel
      const trails = event.target.getTrails(node => {
        // If the user tapped any component in the CircuitElementContainerPanel or on the selected node
        // allow interaction to proceed normally.  Any other taps will deselect the circuit element
        return node instanceof CircuitElementEditContainerNode || node instanceof CircuitElementNode || node instanceof VertexNode;
      });
      if (trails.length === 0) {
        this.circuit.selectionProperty.value = null;
      }
    }));
  }

  /**
   * Returns the circuit element node that matches the given circuit element.
   */
  getCircuitElementNode(circuitElement) {
    return this.circuitElementNodeMap[circuitElement.id];
  }

  /**
   * Get the solder node associated with the specified Vertex
   */
  getSolderNode(vertex) {
    return this.solderNodes[vertex.index];
  }

  /**
   * Get the VertexNode associated with the specified Vertex
   */
  getVertexNode(vertex) {
    return this.vertexNodes[vertex.index];
  }

  /**
   * Find drop targets for all the given vertices
   * @param vertices
   * @returns candidates for connection, each Object has {src:Vertex,dst:Vertex} indicating what can snap
   */
  getAllDropTargets(vertices) {
    const allDropTargets = [];
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const targetVertex = this.circuit.getDropTarget(vertex, this.model.modeProperty.get(), this.model.blackBoxBounds);
      if (targetVertex) {
        allDropTargets.push({
          src: vertex,
          dst: targetVertex
        });
      }
    }
    return allDropTargets;
  }

  /**
   * Finds the closest drop target for any of the given vertices
   * @param vertices
   * @returns Object that indicates the two vertices best suited for connecting as { src: Vertex, dst: Vertex },
   *                        or null if no match is suitable.
   */
  getBestDropTarget(vertices) {
    const allDropTargets = this.getAllDropTargets(vertices);
    if (allDropTargets) {
      const sorted = _.sortBy(allDropTargets, dropTarget => dropTarget.src.unsnappedPositionProperty.get().distance(dropTarget.dst.positionProperty.get()));
      return sorted[0];
    } else {
      return null;
    }
  }

  /**
   * Updates the view
   */
  step() {
    // paint dirty fixed length circuit element nodes.  This batches changes instead of applying multiple changes
    // per frame
    this.circuit.circuitElements.forEach(circuitElement => this.getCircuitElementNode(circuitElement).step());
    this.circuitDebugLayer && this.circuitDebugLayer.step();
  }

  /**
   * Returns whether the vertex can be dragged
   */
  canDragVertex(vertex) {
    const vertices = this.circuit.findAllFixedVertices(vertex);

    // If any of the vertices in the subgraph is already being dragged, then this vertex cannot be dragged.
    for (let i = 0; i < vertices.length; i++) {
      if (vertices[i].isDragged) {
        return false;
      }
    }
    return true;
  }

  /**
   * Mark the vertex and its fixed connected vertices as being dragged, so they cannot be dragged by any other pointer.
   */
  setVerticesDragging(vertex) {
    const vertices = this.circuit.findAllFixedVertices(vertex);
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].isDragged = true;
    }
  }

  /**
   * Called when a Vertex drag begins, records the relative click point
   */
  startDragVertex(point, vertex, draggedObject) {
    // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
    const vertexNode = this.getVertexNode(vertex);
    vertexNode.startOffset = vertexNode.globalToParentPoint(point).minus(vertex.unsnappedPositionProperty.get());
    if (this.circuit.selectionProperty.value !== draggedObject) {
      this.circuit.selectionProperty.value = null;
    }
  }

  /**
   * Vertices connected to the black box cannot be moved, but they can be rotated.  Called when dragging a subcircuit.
   */
  rotateAboutFixedPivot(point, vertex, okToRotate, vertexNode, position, neighbors, vertices) {
    // Don't traverse across the black box interface, or it would rotate objects on the other side
    vertices = this.circuit.findAllFixedVertices(vertex, currentVertex => !currentVertex.blackBoxInterfaceProperty.get());
    const fixedNeighbors = neighbors.filter(neighbor => neighbor.getOppositeVertex(vertex).blackBoxInterfaceProperty.get());
    if (fixedNeighbors.length === 1) {
      const fixedNeighbor = fixedNeighbors[0];
      if (fixedNeighbor instanceof FixedCircuitElement) {
        const fixedVertex = fixedNeighbor.getOppositeVertex(vertex);
        const desiredAngle = position.minus(fixedVertex.positionProperty.get()).angle;
        assert && assert(!isNaN(desiredAngle), 'angle should be a number');
        const length = fixedNeighbor.distanceBetweenVertices || fixedNeighbor.lengthProperty.get();
        const indexOfFixedVertex = vertices.indexOf(fixedVertex);
        vertices.splice(indexOfFixedVertex, 1);
        const dest = Vector2.createPolar(length, desiredAngle).plus(fixedVertex.positionProperty.get());
        const src = vertex.positionProperty.get();
        const delta = dest.minus(src);
        const relative = Vector2.createPolar(length, desiredAngle + Math.PI);
        assert && assert(!isNaN(relative.x), 'x should be a number');
        assert && assert(!isNaN(relative.y), 'y should be a number');

        // Do not propose attachments, since connections cannot be made from a rotation.
        const attachable = [];
        this.translateVertexGroup(vertex, vertices, delta, () => vertex.unsnappedPositionProperty.set(fixedVertex.unsnappedPositionProperty.get().minus(relative)), attachable);
      }
    }
  }

  /**
   * Drag a vertex.
   * @param point - the touch position
   * @param vertex - the vertex that is being dragged
   * @param okToRotate - true if it is allowed to rotate adjacent CircuitElements
   */
  dragVertex(point, vertex, okToRotate) {
    const vertexNode = this.getVertexNode(vertex);

    // Guard against the case in which the battery is flipped while dragging, see https://github.com/phetsims/circuit-construction-kit-common/issues/416
    if (vertexNode.startOffset) {
      const position = vertexNode.globalToParentPoint(point).subtract(vertexNode.startOffset);

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      const neighbors = this.circuit.getNeighborCircuitElements(vertex);

      // Find all vertices connected by fixed length nodes.
      const vertices = this.circuit.findAllFixedVertices(vertex);

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      let rotated = false;
      for (let i = 0; i < vertices.length; i++) {
        if (!vertices[i].isDraggableProperty.get()) {
          // See #108 multiple objects connected to the same origin vertex can cause problems.
          // Restrict ourselves to the case where one wire is attached
          if (neighbors.length === 1) {
            this.rotateAboutFixedPivot(point, vertex, okToRotate, vertexNode, position, neighbors, vertices);
          }
          rotated = true;
        }
      }
      if (rotated) {
        return;
      }
      if (okToRotate && neighbors.length === 1 && neighbors[0] instanceof FixedCircuitElement) {
        const oppositeVertex = neighbors[0].getOppositeVertex(vertex);

        // Find the new relative angle
        let angle;
        if (vertex.unsnappedPositionProperty.get().x === vertex.positionProperty.get().x && vertex.unsnappedPositionProperty.get().y === vertex.positionProperty.get().y) {
          // Rotate the way the element is going.
          angle = position.minus(oppositeVertex.positionProperty.get()).angle;
        } else {
          // Lock in the angle if a match is proposed, otherwise things rotate uncontrollably
          angle = vertex.positionProperty.get().minus(oppositeVertex.positionProperty.get()).angle;
        }

        // Maintain fixed length
        const length = neighbors[0].distanceBetweenVertices;
        const relative = Vector2.createPolar(length, angle + Math.PI);
        const oppositePosition = position.plus(relative);
        const rotationDelta = oppositePosition.minus(oppositeVertex.unsnappedPositionProperty.get());
        this.translateVertexGroup(vertex, vertices, rotationDelta, () => vertex.unsnappedPositionProperty.set(oppositeVertex.unsnappedPositionProperty.get().minus(relative)),
        // allow any vertex connected by fixed length elements to snap, see https://github.com/phetsims/circuit-construction-kit-common/issues/254
        vertices);
      } else {
        const translationDelta = position.minus(vertex.unsnappedPositionProperty.get());
        this.translateVertexGroup(vertex, vertices, translationDelta, null, vertices);
      }
    }
  }

  /**
   * Translate a group of vertices, used when dragging by a circuit element or by a one-neighbor vertex
   *
   * Note: Do not confuse this with Circuit.translateVertexGroup which does not consider connections while dragging
   *
   * @param vertex - the vertex being dragged
   * @param vertices - all the vertices in the group
   * @param unsnappedDelta - how far to move the group
   * @param updatePositions - optional callback for updating positions after unsnapped positions update
   * @param attachable - the nodes that are candidates for attachment
   */
  translateVertexGroup(vertex, vertices, unsnappedDelta, updatePositions, attachable) {
    const screenBounds = this.visibleBoundsProperty.get();
    const bounds = this.parentToLocalBounds(screenBounds);

    // Modify the delta to guarantee all vertices remain in bounds
    for (let i = 0; i < vertices.length; i++) {
      const proposedPosition = vertices[i].unsnappedPositionProperty.get().plus(unsnappedDelta);
      if (!bounds.containsPoint(proposedPosition)) {
        const closestPosition = bounds.getClosestPoint(proposedPosition.x, proposedPosition.y);
        const keepInBoundsDelta = closestPosition.minus(proposedPosition);
        unsnappedDelta = unsnappedDelta.plus(keepInBoundsDelta);
      }
    }

    // Update the unsnapped position of the entire subgraph, i.e. where it would be if no matches are proposed.
    // Must do this before calling getBestDropTarget, because the unsnapped positions are used for target matching
    for (let i = 0; i < vertices.length; i++) {
      const unsnappedPosition = vertices[i].unsnappedPositionProperty.get().plus(unsnappedDelta);
      vertices[i].unsnappedPositionProperty.set(unsnappedPosition);
    }
    updatePositions && updatePositions();

    // Is there a nearby vertex any of these could snap to?  If so, move to its position temporarily.
    // Find drop targets for *any* of the dragged vertices
    const bestDropTarget = this.getBestDropTarget(attachable);
    let delta = Vector2.ZERO;
    if (bestDropTarget) {
      const srcUnsnappedPosition = bestDropTarget.src.unsnappedPositionProperty.get();
      delta = bestDropTarget.dst.unsnappedPositionProperty.get().minus(srcUnsnappedPosition);
      assert && assert(!isNaN(delta.x), 'x should be a number');
      assert && assert(!isNaN(delta.y), 'y should be a number');
    }

    // Translate all nodes as a batch before notifying observers so we don't end up with a bad transient state
    // in which two or more vertices from one FixedCircuitElement have the same position.
    // See https://github.com/phetsims/circuit-construction-kit-common/issues/412
    for (let i = 0; i < vertices.length; i++) {
      const newPosition = vertices[i].unsnappedPositionProperty.get().plus(delta);
      const positionReference = vertices[i].positionProperty.get();
      positionReference.x = newPosition.x;
      positionReference.y = newPosition.y;
    }
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].positionProperty.notifyListenersStatic();
    }
  }

  /**
   * End a vertex drag.
   *
   * @param vertex
   * @param dragged - true if the vertex actually moved with at least 1 drag call
   */
  endDrag(vertex, dragged) {
    const vertexNode = this.getVertexNode(vertex);

    // Find all vertices connected by fixed length nodes.
    const vertices = this.circuit.findAllFixedVertices(vertex);

    // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
    for (let i = 0; i < vertices.length; i++) {
      vertices[i].isDragged = false;
    }

    // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
    for (let i = 0; i < vertices.length; i++) {
      if (!vertices[i].isDraggableProperty.get()) {
        return;
      }
    }
    const bestDropTarget = this.getBestDropTarget(vertices);
    if (bestDropTarget && dragged) {
      this.circuit.connect(bestDropTarget.src, bestDropTarget.dst);

      // Set the new reference point for next drag
      for (let i = 0; i < vertices.length; i++) {
        vertices[i].unsnappedPositionProperty.set(vertices[i].positionProperty.get());
      }
    }
    vertexNode.startOffset = null;

    // Signify that something has been dropped in the play area, to show the edit panel, unless dropped in the toolbox
    this.circuit.vertexDroppedEmitter.emit(vertex);
  }

  /**
   * Adds a child to a layer behind the control panels.
   */
  addChildToBackground(child) {
    this.circuitNodeBackLayer.addChild(child);
  }

  /**
   * Removes a child from the layer behind the control panels.
   */
  removeChildFromBackground(child) {
    this.circuitNodeBackLayer.removeChild(child);
  }

  /**
   * When the zoom level changes, recompute the visible bounds in the coordinate frame of the CircuitNode so
   * that objects cannot be dragged outside the boundary.
   * @param visibleBounds - view coordinates for the visible region
   */
  updateTransform(visibleBounds) {
    this.visibleBoundsInCircuitCoordinateFrameProperty.set(this.parentToLocalBounds(visibleBounds));
  }

  /**
   * Check for an intersection between a probeNode and a wire, return null if no hits.
   * @param position to hit test
   * @param filter - CircuitElement=>boolean the rule to use for checking circuit elements
   * @param globalPoint
   */
  hitCircuitElementNode(position, filter, globalPoint) {
    assert && assert(globalPoint !== undefined);
    const circuitElementNodes = this.circuit.circuitElements.filter(filter).map(circuitElement => this.getCircuitElementNode(circuitElement));

    // Search from the front to the back, because frontmost objects look like they are hitting the sensor, see #143
    for (let i = circuitElementNodes.length - 1; i >= 0; i--) {
      const circuitElementNode = circuitElementNodes[i];

      // If this code got called before the WireNode has been created, skip it (the Voltmeter hit tests nodes)
      if (!circuitElementNode) {
        continue;
      }

      // Don't connect to wires in the black box
      let revealing = true;
      const trueBlackBox = circuitElementNode.circuitElement.insideTrueBlackBoxProperty.get();
      if (trueBlackBox) {
        revealing = this.model.revealingProperty.get();
      }
      if (revealing && circuitElementNode.containsSensorPoint(globalPoint)) {
        return circuitElementNode;
      }
    }
    return null;
  }

  /**
   * Find where the voltmeter probe node intersects the wire, for computing the voltage difference to display in the
   * voltmeter.
   * @param probePosition - in the local coordinate frame of the CircuitNode
   * @returns VoltageConnection if connected, otherwise null
   */
  getVoltageConnection(probePosition) {
    const globalPoint = this.localToGlobalPoint(probePosition);

    // Check for intersection with a vertex, using the solder radius.  This means it will be possible to check for
    // voltages when nearby the terminal of a battery, not necessarily touching the battery (even when solder is
    // not shown, this is desirable so that students have a higher chance of getting the desirable reading).
    // When solder is shown, it is used as the conductive element for the voltmeter (and hence why the solder radius
    // is used in the computation below.
    const solderNodes = _.values(this.solderNodes);
    const hitSolderNode = _.find(solderNodes, solderNode => {
      const position = solderNode.vertex.positionProperty.get();
      return probePosition.distance(position) <= SolderNode.SOLDER_RADIUS;
    });
    if (hitSolderNode) {
      return new VoltageConnection(hitSolderNode.vertex, null);
    }

    // Check for intersection with a metallic circuit element, which can provide voltmeter readings
    const metallicCircuitElement = this.hitCircuitElementNode(probePosition, circuitElement => circuitElement.isMetallic, globalPoint);
    if (metallicCircuitElement) {
      const startPoint = metallicCircuitElement.circuitElement.startPositionProperty.get();
      const endPoint = metallicCircuitElement.circuitElement.endPositionProperty.get();
      const segmentVector = endPoint.minus(startPoint);
      const probeVector = probePosition.minus(startPoint);
      let distanceAlongSegment = segmentVector.magnitude === 0 ? 0 : probeVector.dot(segmentVector) / segmentVector.magnitudeSquared;
      distanceAlongSegment = Utils.clamp(distanceAlongSegment, 0, 1);
      const voltageAlongWire = Utils.linear(0, 1, metallicCircuitElement.circuitElement.startVertexProperty.get().voltageProperty.get(), metallicCircuitElement.circuitElement.endVertexProperty.get().voltageProperty.get(), distanceAlongSegment);
      return new VoltageConnection(metallicCircuitElement.circuitElement.startVertexProperty.get(), metallicCircuitElement.circuitElement, voltageAlongWire);
    } else {
      // check for intersection with switch node
      const switchNode = this.hitCircuitElementNode(probePosition, circuitElement => circuitElement instanceof Switch, globalPoint);
      if (switchNode) {
        // eslint-disable-next-line no-simple-type-checking-assertions
        assert && assert(switchNode instanceof SwitchNode);
        if (switchNode instanceof SwitchNode) {
          // address closed switch.  Find out whether the probe was near the start or end vertex
          if (switchNode.startSideContainsSensorPoint(probePosition)) {
            return new VoltageConnection(switchNode.circuitSwitch.startVertexProperty.get(), switchNode.circuitElement);
          } else if (switchNode.endSideContainsSensorPoint(probePosition)) {
            return new VoltageConnection(switchNode.circuitSwitch.endVertexProperty.get(), switchNode.circuitElement);
          }
        }
      }
      const capacitorNode = this.hitCircuitElementNode(probePosition, circuitElement => circuitElement instanceof Capacitor, globalPoint);
      if (capacitorNode) {
        // eslint-disable-next-line no-simple-type-checking-assertions
        assert && assert(capacitorNode instanceof CapacitorCircuitElementNode);
        if (capacitorNode instanceof CapacitorCircuitElementNode) {
          // Check front first since it visually looks like it would be touching the probe
          if (capacitorNode.frontSideContainsSensorPoint(globalPoint)) {
            return new VoltageConnection(capacitorNode.circuitElement.startVertexProperty.get(), capacitorNode.circuitElement);
          } else if (capacitorNode.backSideContainsSensorPoint(globalPoint)) {
            return new VoltageConnection(capacitorNode.circuitElement.endVertexProperty.get(), capacitorNode.circuitElement);
          }
        }
      }
      return null;
    }
  }

  /**
   * Find the current in the given layer (if any CircuitElement hits the sensor)
   */
  getCurrentInLayer(probeNode, layer) {
    const globalPoint = probeNode.parentToGlobalPoint(probeNode.translation);

    // See if any CircuitElementNode contains the sensor point
    for (let i = 0; i < layer.children.length; i++) {
      const circuitElementNode = layer.children[i];
      if (circuitElementNode instanceof CircuitElementNode) {
        // This is called between when the circuit element is disposed and when the corresponding view is disposed
        // so we must take care not to visit circuit elements that have been disposed but still have a view
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/418
        if (!circuitElementNode.circuitElement.circuitElementDisposed && circuitElementNode.containsSensorPoint(globalPoint)) {
          let rawCurrent = circuitElementNode.circuitElement.currentProperty.get();
          if (circuitElementNode.circuitElement.currentSenseProperty.value === CurrentSense.BACKWARD) {
            rawCurrent = -rawCurrent;
          }
          return new AmmeterConnection(circuitElementNode.circuitElement, rawCurrent);
        }
      }
    }
    return null;
  }

  /**
   * Find the current under the given probe
   */
  getCurrent(probeNode) {
    const mainAmmeterConnection = this.getCurrentInLayer(probeNode, this.fixedCircuitElementLayer);
    if (mainAmmeterConnection !== null) {
      return mainAmmeterConnection;
    } else {
      return this.getCurrentInLayer(probeNode, this.wireLayer);
    }
  }
}
circuitConstructionKitCommon.register('CircuitNode', CircuitNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJVdGlscyIsIlZlY3RvcjIiLCJOb2RlIiwiUGF0aCIsInNjaXNzb3JzU2hhcGUiLCJSb3VuZFB1c2hCdXR0b24iLCJUYW5kZW0iLCJDQ0tDUXVlcnlQYXJhbWV0ZXJzIiwiQ2lyY3VpdERlYnVnTGF5ZXIiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiQUNWb2x0YWdlIiwiQmF0dGVyeSIsIkNhcGFjaXRvciIsIkZpeGVkQ2lyY3VpdEVsZW1lbnQiLCJGdXNlIiwiSW5kdWN0b3IiLCJMaWdodEJ1bGIiLCJSZXNpc3RvciIsIlNlcmllc0FtbWV0ZXIiLCJTd2l0Y2giLCJWb2x0YWdlQ29ubmVjdGlvbiIsIldpcmUiLCJBQ1ZvbHRhZ2VOb2RlIiwiQmF0dGVyeU5vZGUiLCJDYXBhY2l0b3JDaXJjdWl0RWxlbWVudE5vZGUiLCJDQ0tDTGlnaHRCdWxiTm9kZSIsIkNoYXJnZU5vZGUiLCJDaXJjdWl0RWxlbWVudE5vZGUiLCJDdXN0b21MaWdodEJ1bGJOb2RlIiwiRml4ZWRDaXJjdWl0RWxlbWVudE5vZGUiLCJGdXNlTm9kZSIsIkluZHVjdG9yTm9kZSIsIlJlc2lzdG9yTm9kZSIsIlNlcmllc0FtbWV0ZXJOb2RlIiwiU29sZGVyTm9kZSIsIlN3aXRjaE5vZGUiLCJWYWx1ZU5vZGUiLCJWZXJ0ZXhOb2RlIiwiV2lyZU5vZGUiLCJDaXJjdWl0RWxlbWVudFZpZXdUeXBlIiwiUGhldGlvR3JvdXAiLCJDdXJyZW50U2Vuc2UiLCJNdWx0aWxpbmsiLCJEb2ciLCJEb2dOb2RlIiwiUmVzaXN0b3JUeXBlIiwiQW1tZXRlckNvbm5lY3Rpb24iLCJDaXJjdWl0RWxlbWVudEVkaXRDb250YWluZXJOb2RlIiwiRGlzcGxheUNsaWNrVG9EaXNtaXNzTGlzdGVuZXIiLCJSRU5ERVJFUiIsIkNpcmN1aXROb2RlIiwiY29uc3RydWN0b3IiLCJjaXJjdWl0Iiwic2NyZWVuVmlldyIsInRhbmRlbSIsInZpZXdUeXBlUHJvcGVydHkiLCJtb2RlbCIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImNpcmN1aXROb2RlQmFja0xheWVyIiwiaGlnaGxpZ2h0TGF5ZXIiLCJzZXJpZXNBbW1ldGVyTm9kZVJlYWRvdXRQYW5lbExheWVyIiwiYnV0dG9uTGF5ZXIiLCJ2YWx1ZUxheWVyIiwibGlnaHRSYXlzTGF5ZXIiLCJ3aXJlTGF5ZXIiLCJyZW5kZXJlciIsImNoaWxkcmVuIiwidmlzaWJsZSIsIndlYmdsU3ByaXRlTm9kZXMiLCJzb2xkZXJMYXllciIsInZlcnRleExheWVyIiwiZml4ZWRDaXJjdWl0RWxlbWVudExheWVyIiwiY29uY2F0IiwibGlnaHRCdWxiU29ja2V0TGF5ZXIiLCJjaGFyZ2VMYXllciIsIm11bHRpbGluayIsImlzVmFsdWVEZXBpY3Rpb25FbmFibGVkUHJvcGVydHkiLCJyZXZlYWxpbmdQcm9wZXJ0eSIsImlzVmFsdWVEZXBpY3Rpb25FbmFibGVkIiwicmV2ZWFsaW5nIiwic2Vuc29yTGF5ZXIiLCJiZWZvcmVDaXJjdWl0RWxlbWVudHNMYXllciIsImFmdGVyQ2lyY3VpdEVsZW1lbnRzTGF5ZXIiLCJsaWZlbGlrZUxheWVyaW5nIiwic2NoZW1hdGljTGF5ZXJpbmciLCJsaW5rIiwidmlld1R5cGUiLCJMSUZFTElLRSIsInZpc2libGVCb3VuZHNJbkNpcmN1aXRDb29yZGluYXRlRnJhbWVQcm9wZXJ0eSIsImNpcmN1aXRFbGVtZW50Tm9kZU1hcCIsInNvbGRlck5vZGVzIiwidmVydGV4Tm9kZXMiLCJpbml0aWFsaXplQ2lyY3VpdEVsZW1lbnRUeXBlIiwicHJlZGljYXRlIiwibGF5ZXIiLCJwaGV0aW9Hcm91cCIsImFkZENpcmN1aXRFbGVtZW50IiwiY2lyY3VpdEVsZW1lbnQiLCJjaXJjdWl0RWxlbWVudE5vZGUiLCJjcmVhdGVDb3JyZXNwb25kaW5nR3JvdXBFbGVtZW50IiwibmFtZSIsImlkIiwiYWRkQ2hpbGQiLCJ2YWx1ZU5vZGUiLCJzb3VyY2VSZXNpc3RhbmNlUHJvcGVydHkiLCJzaG93VmFsdWVzUHJvcGVydHkiLCJPUFRJT05BTCIsImRpc3Bvc2VFbWl0dGVyQ2lyY3VpdEVsZW1lbnQiLCJhZGRMaXN0ZW5lciIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZSIsImNpcmN1aXRFbGVtZW50cyIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiZm9yRWFjaCIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJnZXRDaXJjdWl0RWxlbWVudE5vZGUiLCJkaXNwb3NlRWxlbWVudCIsImUiLCJ3aXJlR3JvdXAiLCJhcmNoZXR5cGUiLCJwaGV0aW9UeXBlIiwiUGhldGlvR3JvdXBJTyIsIk5vZGVJTyIsImNyZWF0ZVRhbmRlbSIsInN1cHBvcnRzRHluYW1pY1N0YXRlIiwiYmF0dGVyeVR5cGUiLCJiYXR0ZXJ5R3JvdXAiLCJpc0V4dHJlbWUiLCJpc1JlYWwiLCJsaWdodEJ1bGJHcm91cCIsInNlcmllc0FtbWV0ZXJHcm91cCIsImV4dHJlbWVSZXNpc3Rvckdyb3VwIiwicmVzaXN0b3JUeXBlIiwiRVhUUkVNRV9SRVNJU1RPUiIsImV4dHJlbWVMaWdodEJ1bGJHcm91cCIsInJlYWxMaWdodEJ1bGJHcm91cCIsImNhcGFjaXRvckdyb3VwIiwiYWNWb2x0YWdlR3JvdXAiLCJpbmR1Y3Rvckdyb3VwIiwiUkVTSVNUT1IiLCJyZXNpc3Rvckdyb3VwIiwiaG91c2Vob2xkT2JqZWN0R3JvdXAiLCJzd2l0Y2hHcm91cCIsImZ1c2VHcm91cCIsImN1dEljb24iLCJmaWxsIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJtYXhXaWR0aCIsInZlcnRleEN1dEJ1dHRvbiIsImJhc2VDb2xvciIsImNvbnRlbnQiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0ZlYXR1cmVkIiwic2VsZWN0ZWRWZXJ0ZXgiLCJnZXRTZWxlY3RlZFZlcnRleCIsImFzc2VydCIsImN1dFZlcnRleCIsIm1vdmVWZXJ0aWNlc0luQm91bmRzIiwidmFsdWUiLCJ2ZXJ0ZXhOb2RlR3JvdXAiLCJ2ZXJ0ZXgiLCJ2ZXJ0ZXhHcm91cCIsImFkZFZlcnRleE5vZGUiLCJzb2xkZXJOb2RlIiwiaW5kZXgiLCJ2ZXJ0ZXhOb2RlIiwiZWxlbWVudENyZWF0ZWRFbWl0dGVyIiwiZWxlbWVudERpc3Bvc2VkRW1pdHRlciIsImdldFZlcnRleE5vZGUiLCJnZXRTb2xkZXJOb2RlIiwibG9jYWxCb3VuZHMiLCJpIiwiY291bnQiLCJnZXRFbGVtZW50IiwicG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwiZ2V0IiwiY29udGFpbnNQb2ludCIsImNsb3Nlc3RQb2ludCIsImdldENsb3Nlc3RQb2ludCIsIngiLCJ5IiwiZGVsdGEiLCJtaW51cyIsInZlcnRpY2VzIiwiZmluZEFsbENvbm5lY3RlZFZlcnRpY2VzIiwidHJhbnNsYXRlVmVydGV4R3JvdXAiLCJjaGFyZ2VzIiwiY2hhcmdlIiwic2hvd0N1cnJlbnRzIiwiY2lyY3VpdERlYnVnTGF5ZXIiLCJwaGV0Iiwiam9pc3QiLCJkaXNwbGF5IiwiYWRkSW5wdXRMaXN0ZW5lciIsImV2ZW50IiwidHJhaWxzIiwidGFyZ2V0IiwiZ2V0VHJhaWxzIiwibm9kZSIsImxlbmd0aCIsInNlbGVjdGlvblByb3BlcnR5IiwiZ2V0QWxsRHJvcFRhcmdldHMiLCJhbGxEcm9wVGFyZ2V0cyIsInRhcmdldFZlcnRleCIsImdldERyb3BUYXJnZXQiLCJtb2RlUHJvcGVydHkiLCJibGFja0JveEJvdW5kcyIsInB1c2giLCJzcmMiLCJkc3QiLCJnZXRCZXN0RHJvcFRhcmdldCIsInNvcnRlZCIsIl8iLCJzb3J0QnkiLCJkcm9wVGFyZ2V0IiwidW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eSIsImRpc3RhbmNlIiwic3RlcCIsImNhbkRyYWdWZXJ0ZXgiLCJmaW5kQWxsRml4ZWRWZXJ0aWNlcyIsImlzRHJhZ2dlZCIsInNldFZlcnRpY2VzRHJhZ2dpbmciLCJzdGFydERyYWdWZXJ0ZXgiLCJwb2ludCIsImRyYWdnZWRPYmplY3QiLCJzdGFydE9mZnNldCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJyb3RhdGVBYm91dEZpeGVkUGl2b3QiLCJva1RvUm90YXRlIiwibmVpZ2hib3JzIiwiY3VycmVudFZlcnRleCIsImJsYWNrQm94SW50ZXJmYWNlUHJvcGVydHkiLCJmaXhlZE5laWdoYm9ycyIsImZpbHRlciIsIm5laWdoYm9yIiwiZ2V0T3Bwb3NpdGVWZXJ0ZXgiLCJmaXhlZE5laWdoYm9yIiwiZml4ZWRWZXJ0ZXgiLCJkZXNpcmVkQW5nbGUiLCJhbmdsZSIsImlzTmFOIiwiZGlzdGFuY2VCZXR3ZWVuVmVydGljZXMiLCJsZW5ndGhQcm9wZXJ0eSIsImluZGV4T2ZGaXhlZFZlcnRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJkZXN0IiwiY3JlYXRlUG9sYXIiLCJwbHVzIiwicmVsYXRpdmUiLCJhdHRhY2hhYmxlIiwic2V0IiwiZHJhZ1ZlcnRleCIsInN1YnRyYWN0IiwiZ2V0TmVpZ2hib3JDaXJjdWl0RWxlbWVudHMiLCJyb3RhdGVkIiwiaXNEcmFnZ2FibGVQcm9wZXJ0eSIsIm9wcG9zaXRlVmVydGV4Iiwib3Bwb3NpdGVQb3NpdGlvbiIsInJvdGF0aW9uRGVsdGEiLCJ0cmFuc2xhdGlvbkRlbHRhIiwidW5zbmFwcGVkRGVsdGEiLCJ1cGRhdGVQb3NpdGlvbnMiLCJzY3JlZW5Cb3VuZHMiLCJib3VuZHMiLCJwYXJlbnRUb0xvY2FsQm91bmRzIiwicHJvcG9zZWRQb3NpdGlvbiIsImNsb3Nlc3RQb3NpdGlvbiIsImtlZXBJbkJvdW5kc0RlbHRhIiwidW5zbmFwcGVkUG9zaXRpb24iLCJiZXN0RHJvcFRhcmdldCIsIlpFUk8iLCJzcmNVbnNuYXBwZWRQb3NpdGlvbiIsIm5ld1Bvc2l0aW9uIiwicG9zaXRpb25SZWZlcmVuY2UiLCJub3RpZnlMaXN0ZW5lcnNTdGF0aWMiLCJlbmREcmFnIiwiZHJhZ2dlZCIsImNvbm5lY3QiLCJ2ZXJ0ZXhEcm9wcGVkRW1pdHRlciIsImVtaXQiLCJhZGRDaGlsZFRvQmFja2dyb3VuZCIsImNoaWxkIiwicmVtb3ZlQ2hpbGRGcm9tQmFja2dyb3VuZCIsInVwZGF0ZVRyYW5zZm9ybSIsInZpc2libGVCb3VuZHMiLCJoaXRDaXJjdWl0RWxlbWVudE5vZGUiLCJnbG9iYWxQb2ludCIsInVuZGVmaW5lZCIsImNpcmN1aXRFbGVtZW50Tm9kZXMiLCJtYXAiLCJ0cnVlQmxhY2tCb3giLCJpbnNpZGVUcnVlQmxhY2tCb3hQcm9wZXJ0eSIsImNvbnRhaW5zU2Vuc29yUG9pbnQiLCJnZXRWb2x0YWdlQ29ubmVjdGlvbiIsInByb2JlUG9zaXRpb24iLCJsb2NhbFRvR2xvYmFsUG9pbnQiLCJ2YWx1ZXMiLCJoaXRTb2xkZXJOb2RlIiwiZmluZCIsIlNPTERFUl9SQURJVVMiLCJtZXRhbGxpY0NpcmN1aXRFbGVtZW50IiwiaXNNZXRhbGxpYyIsInN0YXJ0UG9pbnQiLCJzdGFydFBvc2l0aW9uUHJvcGVydHkiLCJlbmRQb2ludCIsImVuZFBvc2l0aW9uUHJvcGVydHkiLCJzZWdtZW50VmVjdG9yIiwicHJvYmVWZWN0b3IiLCJkaXN0YW5jZUFsb25nU2VnbWVudCIsIm1hZ25pdHVkZSIsImRvdCIsIm1hZ25pdHVkZVNxdWFyZWQiLCJjbGFtcCIsInZvbHRhZ2VBbG9uZ1dpcmUiLCJsaW5lYXIiLCJzdGFydFZlcnRleFByb3BlcnR5Iiwidm9sdGFnZVByb3BlcnR5IiwiZW5kVmVydGV4UHJvcGVydHkiLCJzd2l0Y2hOb2RlIiwic3RhcnRTaWRlQ29udGFpbnNTZW5zb3JQb2ludCIsImNpcmN1aXRTd2l0Y2giLCJlbmRTaWRlQ29udGFpbnNTZW5zb3JQb2ludCIsImNhcGFjaXRvck5vZGUiLCJmcm9udFNpZGVDb250YWluc1NlbnNvclBvaW50IiwiYmFja1NpZGVDb250YWluc1NlbnNvclBvaW50IiwiZ2V0Q3VycmVudEluTGF5ZXIiLCJwcm9iZU5vZGUiLCJwYXJlbnRUb0dsb2JhbFBvaW50IiwidHJhbnNsYXRpb24iLCJjaXJjdWl0RWxlbWVudERpc3Bvc2VkIiwicmF3Q3VycmVudCIsImN1cnJlbnRQcm9wZXJ0eSIsImN1cnJlbnRTZW5zZVByb3BlcnR5IiwiQkFDS1dBUkQiLCJnZXRDdXJyZW50IiwibWFpbkFtbWV0ZXJDb25uZWN0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDaXJjdWl0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgTm9kZSB0aGF0IHJlcHJlc2VudHMgYSBDaXJjdWl0LCBpbmNsdWRpbmcgYWxsIFdpcmVzIGFuZCBGaXhlZENpcmN1aXRFbGVtZW50cywgQ2hhcmdlLCBTb2xkZXIgYW5kIFNlbnNvcnMuXHJcbiAqIEl0IGFsc28gcmVuZGVycyB0aGUgdm9sdG1ldGVyIGFuZCBhbW1ldGVyLiBJdCBjYW4gYmUgem9vbWVkIGluIGFuZCBvdXQuXHJcbiAqXHJcbiAqIEVhY2ggQ2lyY3VpdEVsZW1lbnROb2RlIG1heSBub2RlIHBhcnRzIHRoYXQgYXBwZWFyIGluIGRpZmZlcmVudCBsYXllcnMsIHN1Y2ggYXMgdGhlIGhpZ2hsaWdodCBhbmQgdGhlIGxpZ2h0IGJ1bGJcclxuICogc29ja2V0LiAgSGF2aW5nIHRoZSBsaWdodCBidWxiIHNvY2tldCBpbiBhbm90aGVyIGxheWVyIG1ha2VzIGl0IHBvc3NpYmxlIHRvIHNob3cgdGhlIGNoYXJnZXMgZ29pbmcgXCJ0aHJvdWdoXCIgdGhlXHJcbiAqIHNvY2tldCAoaW4gei1vcmRlcmluZykuIFRoZSBDaXJjdWl0RWxlbWVudE5vZGUgY29uc3RydWN0b3JzIHBvcHVsYXRlIGRpZmZlcmVudCBsYXllcnMgb2YgdGhlIENpcmN1aXROb2RlIGluXHJcbiAqIHRoZWlyIGNvbnN0cnVjdG9ycyBhbmQgZGVwb3B1bGF0ZSBpbiB0aGVpciBkaXNwb3NlIGZ1bmN0aW9ucy5cclxuICpcclxuICogRXhpc3RzIGZvciB0aGUgbGlmZSBvZiB0aGUgc2ltIGFuZCBoZW5jZSBkb2VzIG5vdCByZXF1aXJlIGEgZGlzcG9zZSBpbXBsZW1lbnRhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFBhdGgsIFNjZW5lcnlFdmVudCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBzY2lzc29yc1NoYXBlIGZyb20gJy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS00L3NjaXNzb3JzU2hhcGUuanMnO1xyXG5pbXBvcnQgUm91bmRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kUHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBDQ0tDUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0NDS0NRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdERlYnVnTGF5ZXIgZnJvbSAnLi9DaXJjdWl0RGVidWdMYXllci5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5pbXBvcnQgQUNWb2x0YWdlIGZyb20gJy4uL21vZGVsL0FDVm9sdGFnZS5qcyc7XHJcbmltcG9ydCBCYXR0ZXJ5IGZyb20gJy4uL21vZGVsL0JhdHRlcnkuanMnO1xyXG5pbXBvcnQgQ2FwYWNpdG9yIGZyb20gJy4uL21vZGVsL0NhcGFjaXRvci5qcyc7XHJcbmltcG9ydCBGaXhlZENpcmN1aXRFbGVtZW50IGZyb20gJy4uL21vZGVsL0ZpeGVkQ2lyY3VpdEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgRnVzZSBmcm9tICcuLi9tb2RlbC9GdXNlLmpzJztcclxuaW1wb3J0IEluZHVjdG9yIGZyb20gJy4uL21vZGVsL0luZHVjdG9yLmpzJztcclxuaW1wb3J0IExpZ2h0QnVsYiBmcm9tICcuLi9tb2RlbC9MaWdodEJ1bGIuanMnO1xyXG5pbXBvcnQgUmVzaXN0b3IgZnJvbSAnLi4vbW9kZWwvUmVzaXN0b3IuanMnO1xyXG5pbXBvcnQgU2VyaWVzQW1tZXRlciBmcm9tICcuLi9tb2RlbC9TZXJpZXNBbW1ldGVyLmpzJztcclxuaW1wb3J0IFN3aXRjaCBmcm9tICcuLi9tb2RlbC9Td2l0Y2guanMnO1xyXG5pbXBvcnQgVm9sdGFnZUNvbm5lY3Rpb24gZnJvbSAnLi4vbW9kZWwvVm9sdGFnZUNvbm5lY3Rpb24uanMnO1xyXG5pbXBvcnQgV2lyZSBmcm9tICcuLi9tb2RlbC9XaXJlLmpzJztcclxuaW1wb3J0IEFDVm9sdGFnZU5vZGUgZnJvbSAnLi9BQ1ZvbHRhZ2VOb2RlLmpzJztcclxuaW1wb3J0IEJhdHRlcnlOb2RlIGZyb20gJy4vQmF0dGVyeU5vZGUuanMnO1xyXG5pbXBvcnQgQ2FwYWNpdG9yQ2lyY3VpdEVsZW1lbnROb2RlIGZyb20gJy4vQ2FwYWNpdG9yQ2lyY3VpdEVsZW1lbnROb2RlLmpzJztcclxuaW1wb3J0IENDS0NMaWdodEJ1bGJOb2RlIGZyb20gJy4vQ0NLQ0xpZ2h0QnVsYk5vZGUuanMnO1xyXG5pbXBvcnQgQ2hhcmdlTm9kZSBmcm9tICcuL0NoYXJnZU5vZGUuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnROb2RlIGZyb20gJy4vQ2lyY3VpdEVsZW1lbnROb2RlLmpzJztcclxuaW1wb3J0IEN1c3RvbUxpZ2h0QnVsYk5vZGUgZnJvbSAnLi9DdXN0b21MaWdodEJ1bGJOb2RlLmpzJztcclxuaW1wb3J0IEZpeGVkQ2lyY3VpdEVsZW1lbnROb2RlIGZyb20gJy4vRml4ZWRDaXJjdWl0RWxlbWVudE5vZGUuanMnO1xyXG5pbXBvcnQgRnVzZU5vZGUgZnJvbSAnLi9GdXNlTm9kZS5qcyc7XHJcbmltcG9ydCBJbmR1Y3Rvck5vZGUgZnJvbSAnLi9JbmR1Y3Rvck5vZGUuanMnO1xyXG5pbXBvcnQgUmVzaXN0b3JOb2RlIGZyb20gJy4vUmVzaXN0b3JOb2RlLmpzJztcclxuaW1wb3J0IFNlcmllc0FtbWV0ZXJOb2RlIGZyb20gJy4vU2VyaWVzQW1tZXRlck5vZGUuanMnO1xyXG5pbXBvcnQgU29sZGVyTm9kZSBmcm9tICcuL1NvbGRlck5vZGUuanMnO1xyXG5pbXBvcnQgU3dpdGNoTm9kZSBmcm9tICcuL1N3aXRjaE5vZGUuanMnO1xyXG5pbXBvcnQgVmFsdWVOb2RlIGZyb20gJy4vVmFsdWVOb2RlLmpzJztcclxuaW1wb3J0IFZlcnRleE5vZGUgZnJvbSAnLi9WZXJ0ZXhOb2RlLmpzJztcclxuaW1wb3J0IFdpcmVOb2RlIGZyb20gJy4vV2lyZU5vZGUuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdCBmcm9tICcuLi9tb2RlbC9DaXJjdWl0LmpzJztcclxuaW1wb3J0IENDS0NTY3JlZW5WaWV3IGZyb20gJy4vQ0NLQ1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZSBmcm9tICcuLi9tb2RlbC9DaXJjdWl0RWxlbWVudFZpZXdUeXBlLmpzJztcclxuaW1wb3J0IENpcmN1aXRFbGVtZW50IGZyb20gJy4uL21vZGVsL0NpcmN1aXRFbGVtZW50LmpzJztcclxuaW1wb3J0IFZlcnRleCBmcm9tICcuLi9tb2RlbC9WZXJ0ZXguanMnO1xyXG5pbXBvcnQgQ2lyY3VpdENvbnN0cnVjdGlvbktpdE1vZGVsIGZyb20gJy4uL21vZGVsL0NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRNb2RlbC5qcyc7XHJcbmltcG9ydCBQaGV0aW9Hcm91cCBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvR3JvdXAuanMnO1xyXG5pbXBvcnQgQ3VycmVudFNlbnNlIGZyb20gJy4uL21vZGVsL0N1cnJlbnRTZW5zZS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgRG9nIGZyb20gJy4uL21vZGVsL0RvZy5qcyc7XHJcbmltcG9ydCBEb2dOb2RlIGZyb20gJy4vRG9nTm9kZS5qcyc7XHJcbmltcG9ydCBSZXNpc3RvclR5cGUgZnJvbSAnLi4vbW9kZWwvUmVzaXN0b3JUeXBlLmpzJztcclxuaW1wb3J0IEFtbWV0ZXJDb25uZWN0aW9uIGZyb20gJy4uL21vZGVsL0FtbWV0ZXJDb25uZWN0aW9uLmpzJztcclxuaW1wb3J0IENpcmN1aXRFbGVtZW50RWRpdENvbnRhaW5lck5vZGUgZnJvbSAnLi9DaXJjdWl0RWxlbWVudEVkaXRDb250YWluZXJOb2RlLmpzJztcclxuaW1wb3J0IERpc3BsYXlDbGlja1RvRGlzbWlzc0xpc3RlbmVyIGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL0Rpc3BsYXlDbGlja1RvRGlzbWlzc0xpc3RlbmVyLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8gSW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1kYy9pc3N1ZXMvMTQwIHdlIGRlY2lkZWQgdG8gdGVzdCBldmVyeSBwbGF0Zm9ybSB3aXRoXHJcbi8vIHN2ZyByZW5kZXJpbmcgdG8gYXZvaWQgc3ZnL3dlYmdsIGxhZyBpc3N1ZXMgYW5kIGhhdmUgYSBjb25zaXN0ZW50IHJlbmRlcmVyIGFjcm9zcyBwbGF0Zm9ybXMuICBIb3dldmVyLCB3ZSB3aWxsXHJcbi8vIGxlYXZlIGluIGFsbCBvZiB0aGUgV2ViR0wgY29kZSBpbiBjYXNlIHdlIGhhdmUgcGVyZm9ybWFuY2UgcHJvYmxlbXMgb24gYSBwbGF0Zm9ybSB0aGF0IHJlcXVpcmUgV2ViR0wgdG8gYmUgcmVzdG9yZWQ/XHJcbmNvbnN0IFJFTkRFUkVSID0gJ3N2Zyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaXJjdWl0Tm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlld1R5cGVQcm9wZXJ0eTogUHJvcGVydHk8Q2lyY3VpdEVsZW1lbnRWaWV3VHlwZT47XHJcbiAgcHVibGljIHJlYWRvbmx5IG1vZGVsOiBDaXJjdWl0Q29uc3RydWN0aW9uS2l0TW9kZWw7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB2aXNpYmxlQm91bmRzUHJvcGVydHk6IFByb3BlcnR5PEJvdW5kczI+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2lyY3VpdE5vZGVCYWNrTGF5ZXI6IE5vZGU7XHJcblxyXG4gIC8vIENpcmN1aXRFbGVtZW50Tm9kZXMgYWRkIGhpZ2hsaWdodHMgZGlyZWN0bHkgdG8gdGhpcyBsYXllciB3aGVuIHRoZXkgYXJlIGNvbnN0cnVjdGVkXHJcbiAgcHVibGljIHJlYWRvbmx5IGhpZ2hsaWdodExheWVyOiBOb2RlO1xyXG5cclxuICAvLyBTZXJpZXNBbW1ldGVyTm9kZXMgYWRkIHRvIHRoaXMgbGF5ZXIgd2hlbiB0aGV5IGFyZSBjb25zdHJ1Y3RlZFxyXG4gIC8vIFNob3dzIHRoZSBmcm9udCBwYW5lbCBvZiBTZXJpZXNBbW1ldGVyTm9kZXMgKHdoaWNoIHNob3dzIHRoZSBjdXJyZW50IHJlYWRvdXQpIHNvIHRoZSBjaGFyZ2VzIGxvb2sgbGlrZSB0aGV5XHJcbiAgLy8gZmxvdyB0aHJvdWdoLlxyXG4gIHB1YmxpYyByZWFkb25seSBzZXJpZXNBbW1ldGVyTm9kZVJlYWRvdXRQYW5lbExheWVyOiBOb2RlO1xyXG5cclxuICAvLyBsYXllciBmb3IgdmVydGV4IGJ1dHRvbnNcclxuICBwdWJsaWMgcmVhZG9ubHkgYnV0dG9uTGF5ZXI6IE5vZGU7XHJcblxyXG4gIC8vIGxheWVyIGZvciBcInNob3cgdmFsdWVzXCJcclxuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlTGF5ZXI6IE5vZGU7XHJcblxyXG4gIC8vIGxheWVyIGZvciBsaWdodCByYXlzLCBzaW5jZSBpdCBjYW5ub3QgYmUgcmVuZGVyZWQgaW4gV2ViR0xcclxuICBwcml2YXRlIHJlYWRvbmx5IGxpZ2h0UmF5c0xheWVyOiBOb2RlO1xyXG5cclxuICAvLyBsYXllciB0aGF0IGNvbnRhaW5zIHRoZSB3aXJlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgd2lyZUxheWVyOiBOb2RlO1xyXG5cclxuICAvLyBsYXllciB0aGF0IHNob3dzIHRoZSBzb2xkZXIgam9pbnRzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzb2xkZXJMYXllcjogTm9kZTtcclxuXHJcbiAgLy8gbGF5ZXIgdGhhdCBzaG93cyB0aGUgVmVydGV4IGluc3RhbmNlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmVydGV4TGF5ZXI6IE5vZGU7XHJcblxyXG4gIC8vIGNvbnRhaW5zIEZpeGVkQ2lyY3VpdEVsZW1lbnRzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBmaXhlZENpcmN1aXRFbGVtZW50TGF5ZXI6IE5vZGU7XHJcblxyXG4gIC8vIENDS0NMaWdodEJ1bGJOb2RlIGNhbGxzIGFkZENoaWxkL3JlbW92ZUNoaWxkIHRvIGFkZCBzb2NrZXRzIHRvIHRoZSBmcm9udCBsYXllclxyXG4gIHB1YmxpYyByZWFkb25seSBsaWdodEJ1bGJTb2NrZXRMYXllcjogTm9kZTtcclxuXHJcbiAgLy8gbGF5ZXIgdGhhdCBzaG93cyB0aGUgQ2hhcmdlIGluc3RhbmNlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2hhcmdlTGF5ZXI6IE5vZGU7XHJcblxyXG4gIC8vIGxheWVyIHRoYXQgc2hvd3MgdGhlIFZvbHRtZXRlciBhbmQgQW1tZXRlciAoYnV0IG5vdCB0aGUgU2VyaWVzQW1tZXRlciwgd2hpY2ggaXMgc2hvd24gaW4gdGhlIGZpeGVkQ2lyY3VpdEVsZW1lbnRMYXllcilcclxuICBwdWJsaWMgcmVhZG9ubHkgc2Vuc29yTGF5ZXI6IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBiZWZvcmVDaXJjdWl0RWxlbWVudHNMYXllcjogTm9kZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGFmdGVyQ2lyY3VpdEVsZW1lbnRzTGF5ZXI6IE5vZGU7XHJcblxyXG4gIC8vIHRoZSB2aXNpYmxlIGJvdW5kcyBpbiB0aGUgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgY2lyY3VpdC4gIEluaXRpYWxpemVkIHdpdGggYSBwbGFjZWhvbGRlciB2YWx1ZSB1bnRpbCBpdCBpcyBmaWxsZWRcclxuICAvLyBpbiBieSBDQ0tDU2NyZWVuVmlldyAoYWZ0ZXIgYXR0YWNoZWQgdG8gYSBwYXJlbnQpXHJcbiAgcHVibGljIHJlYWRvbmx5IHZpc2libGVCb3VuZHNJbkNpcmN1aXRDb29yZGluYXRlRnJhbWVQcm9wZXJ0eTogUHJvcGVydHk8Qm91bmRzMj47XHJcblxyXG4gIC8vIHRoZSBDaXJjdWl0IG1vZGVsIGRlcGljdGVkIGJ5IHRoaXMgdmlld1xyXG4gIHB1YmxpYyByZWFkb25seSBjaXJjdWl0OiBDaXJjdWl0O1xyXG5cclxuICAvLyBNYXAgdG8gZmluZCBDaXJjdWl0RWxlbWVudD0+Q2lyY3VpdEVsZW1lbnROb2RlLiBrZXkgaXMgQ2lyY3VpdEVsZW1lbnQuaWQsIHZhbHVlIGlzIENpcmN1aXRFbGVtZW50Tm9kZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2lyY3VpdEVsZW1lbnROb2RlTWFwOiBSZWNvcmQ8bnVtYmVyLCBDaXJjdWl0RWxlbWVudE5vZGU+O1xyXG5cclxuICAvLyBNYXAgb2YgVmVydGV4LmluZGV4ID0+IFNvbGRlck5vZGVcclxuICBwcml2YXRlIHJlYWRvbmx5IHNvbGRlck5vZGVzOiBSZWNvcmQ8bnVtYmVyLCBTb2xkZXJOb2RlPjtcclxuXHJcbiAgLy8gTWFwIG9mIFZlcnRleC5pbmRleCA9PiBWZXJ0ZXhOb2RlXHJcbiAgcHJpdmF0ZSByZWFkb25seSB2ZXJ0ZXhOb2RlczogUmVjb3JkPG51bWJlciwgVmVydGV4Tm9kZT47XHJcbiAgcHVibGljIHJlYWRvbmx5IHZlcnRleEN1dEJ1dHRvbjogUm91bmRQdXNoQnV0dG9uO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2lyY3VpdERlYnVnTGF5ZXI6IENpcmN1aXREZWJ1Z0xheWVyIHwgbnVsbDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNpcmN1aXQgLSB0aGUgbW9kZWwgQ2lyY3VpdFxyXG4gICAqIEBwYXJhbSBzY3JlZW5WaWV3IC0gZm9yIGRyb3BwaW5nIENpcmN1aXRFbGVtZW50IGluc3RhbmNlcyBiYWNrIGluIHRoZSB0b29sYm94XHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjaXJjdWl0OiBDaXJjdWl0LCBzY3JlZW5WaWV3OiBDQ0tDU2NyZWVuVmlldywgdGFuZGVtOiBUYW5kZW0gKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMudmlld1R5cGVQcm9wZXJ0eSA9IHNjcmVlblZpZXcubW9kZWwudmlld1R5cGVQcm9wZXJ0eTtcclxuICAgIHRoaXMubW9kZWwgPSBzY3JlZW5WaWV3Lm1vZGVsO1xyXG5cclxuICAgIC8vIHRoZSBwYXJ0IG9mIHRoZSBzY3JlZW4gdGhhdCBjYW4gYmUgc2VlbiBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSA9IHNjcmVlblZpZXcudmlzaWJsZUJvdW5kc1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIHRoZSBsYXllciBiZWhpbmQgdGhlIGNvbnRyb2wgcGFuZWxzXHJcbiAgICB0aGlzLmNpcmN1aXROb2RlQmFja0xheWVyID0gc2NyZWVuVmlldy5jaXJjdWl0Tm9kZUJhY2tMYXllcjtcclxuXHJcbiAgICB0aGlzLmhpZ2hsaWdodExheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICB0aGlzLnNlcmllc0FtbWV0ZXJOb2RlUmVhZG91dFBhbmVsTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIHRoaXMuYnV0dG9uTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIHRoaXMudmFsdWVMYXllciA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgdGhpcy5saWdodFJheXNMYXllciA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgdGhpcy53aXJlTGF5ZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICByZW5kZXJlcjogUkVOREVSRVIsXHJcblxyXG4gICAgICAvLyBwcmVhbGxvY2F0ZSBzcHJpdGUgc2hlZXRcclxuICAgICAgY2hpbGRyZW46IFsgbmV3IE5vZGUoIHtcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICBjaGlsZHJlbjogV2lyZU5vZGUud2ViZ2xTcHJpdGVOb2Rlc1xyXG4gICAgICB9ICkgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc29sZGVyTGF5ZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICByZW5kZXJlcjogUkVOREVSRVIsXHJcblxyXG4gICAgICAvLyBwcmVhbGxvY2F0ZSBzcHJpdGUgc2hlZXRcclxuICAgICAgY2hpbGRyZW46IFsgbmV3IE5vZGUoIHtcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICBjaGlsZHJlbjogU29sZGVyTm9kZS53ZWJnbFNwcml0ZU5vZGVzXHJcbiAgICAgIH0gKSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy52ZXJ0ZXhMYXllciA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHJlbmRlcmVyOiBSRU5ERVJFUixcclxuXHJcbiAgICAgIC8vIHByZWFsbG9jYXRlIHNwcml0ZSBzaGVldFxyXG4gICAgICBjaGlsZHJlbjogWyBuZXcgTm9kZSgge1xyXG4gICAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgIGNoaWxkcmVuOiBWZXJ0ZXhOb2RlLndlYmdsU3ByaXRlTm9kZXNcclxuICAgICAgfSApIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmZpeGVkQ2lyY3VpdEVsZW1lbnRMYXllciA9IG5ldyBOb2RlKCB7XHJcblxyXG4gICAgICAvLyBhZGQgYSBjaGlsZCBlYWdlcmx5IHNvIHRoZSBXZWJHTCBibG9jayBpcyBhbGwgYWxsb2NhdGVkIHdoZW4gMXN0IG9iamVjdCBpcyBkcmFnZ2VkIG91dCBvZiB0b29sYm94XHJcbiAgICAgIHJlbmRlcmVyOiBSRU5ERVJFUixcclxuICAgICAgY2hpbGRyZW46IFsgbmV3IE5vZGUoIHtcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICBjaGlsZHJlbjogKCBbXSBhcyBOb2RlW10gKVxyXG4gICAgICAgICAgLmNvbmNhdCggQmF0dGVyeU5vZGUud2ViZ2xTcHJpdGVOb2RlcyApXHJcbiAgICAgICAgICAuY29uY2F0KCBSZXNpc3Rvck5vZGUud2ViZ2xTcHJpdGVOb2RlcyApXHJcbiAgICAgICAgICAuY29uY2F0KCBGaXhlZENpcmN1aXRFbGVtZW50Tm9kZS53ZWJnbFNwcml0ZU5vZGVzIClcclxuICAgICAgICAgIC5jb25jYXQoIEN1c3RvbUxpZ2h0QnVsYk5vZGUud2ViZ2xTcHJpdGVOb2RlcyApXHJcbiAgICAgICAgICAuY29uY2F0KCBGdXNlTm9kZS53ZWJnbFNwcml0ZU5vZGVzIClcclxuICAgICAgfSApIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmxpZ2h0QnVsYlNvY2tldExheWVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgcmVuZGVyZXI6IFJFTkRFUkVSLFxyXG5cclxuICAgICAgLy8gcHJlYWxsb2NhdGUgc3ByaXRlIHNoZWV0XHJcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBOb2RlKCB7XHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgY2hpbGRyZW46IEN1c3RvbUxpZ2h0QnVsYk5vZGUud2ViZ2xTcHJpdGVOb2Rlc1xyXG4gICAgICB9ICkgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2hhcmdlTGF5ZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICByZW5kZXJlcjogUkVOREVSRVJcclxuXHJcbiAgICAgIC8vIHByZWFsbG9jYXRlIHNwcml0ZSBzaGVldFxyXG4gICAgICAvLyBjaGlsZHJlbjogWyBuZXcgTm9kZSgge1xyXG4gICAgICAvLyAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICAvLyAgIC8vIGNoaWxkcmVuOiBDaGFyZ2VOb2RlLndlYmdsU3ByaXRlTm9kZXNcclxuICAgICAgLy8gfSApIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHNjcmVlblZpZXcubW9kZWwuaXNWYWx1ZURlcGljdGlvbkVuYWJsZWRQcm9wZXJ0eSwgc2NyZWVuVmlldy5tb2RlbC5yZXZlYWxpbmdQcm9wZXJ0eSBdLCAoIGlzVmFsdWVEZXBpY3Rpb25FbmFibGVkLCByZXZlYWxpbmcgKSA9PiB7XHJcbiAgICAgIHRoaXMuY2hhcmdlTGF5ZXIudmlzaWJsZSA9IGlzVmFsdWVEZXBpY3Rpb25FbmFibGVkICYmIHJldmVhbGluZztcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNlbnNvckxheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICB0aGlzLmJlZm9yZUNpcmN1aXRFbGVtZW50c0xheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWZ0ZXJDaXJjdWl0RWxlbWVudHNMYXllciA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gRm9yIGxpZmVsaWtlOiBTb2xkZXIgc2hvdWxkIGJlIGluIGZyb250IG9mIHdpcmVzIGJ1dCBiZWhpbmQgYmF0dGVyaWVzIGFuZCByZXNpc3RvcnMuXHJcbiAgICBjb25zdCBsaWZlbGlrZUxheWVyaW5nID0gW1xyXG4gICAgICB0aGlzLmxpZ2h0UmF5c0xheWVyLFxyXG4gICAgICB0aGlzLmJlZm9yZUNpcmN1aXRFbGVtZW50c0xheWVyLFxyXG4gICAgICB0aGlzLndpcmVMYXllciwgLy8gd2lyZXMgZ28gYmVoaW5kIG90aGVyIGNpcmN1aXQgZWxlbWVudHNcclxuICAgICAgdGhpcy5zb2xkZXJMYXllcixcclxuICAgICAgdGhpcy5maXhlZENpcmN1aXRFbGVtZW50TGF5ZXIsIC8vIGNpcmN1aXQgZWxlbWVudHMgYW5kIG1ldGVyc1xyXG4gICAgICB0aGlzLnZlcnRleExheWVyLFxyXG4gICAgICB0aGlzLmNoYXJnZUxheWVyLFxyXG4gICAgICB0aGlzLmxpZ2h0QnVsYlNvY2tldExheWVyLCAvLyBmcm9udHMgb2YgbGlnaHQgYnVsYnNcclxuICAgICAgdGhpcy5zZXJpZXNBbW1ldGVyTm9kZVJlYWRvdXRQYW5lbExheWVyLCAvLyBmcm9udHMgb2Ygc2VyaWVzIGFtbWV0ZXJzXHJcbiAgICAgIHRoaXMuYWZ0ZXJDaXJjdWl0RWxlbWVudHNMYXllcixcclxuICAgICAgdGhpcy5zZW5zb3JMYXllcixcclxuICAgICAgdGhpcy5oaWdobGlnaHRMYXllciwgLy8gaGlnaGxpZ2h0cyBnbyBpbiBmcm9udCBvZiBldmVyeXRoaW5nIGVsc2VcclxuICAgICAgdGhpcy52YWx1ZUxheWVyLCAvLyB2YWx1ZXNcclxuICAgICAgdGhpcy5idXR0b25MYXllciAvLyB2ZXJ0ZXggYnV0dG9uc1xyXG4gICAgXTtcclxuXHJcbiAgICAvLyBGb3Igc2NoZW1hdGljOiBTb2xkZXIgc2hvdWxkIGJlIGluIGZyb250IG9mIGFsbCBjb21wb25lbnRzXHJcbiAgICBjb25zdCBzY2hlbWF0aWNMYXllcmluZyA9IFtcclxuICAgICAgdGhpcy5saWdodFJheXNMYXllcixcclxuICAgICAgdGhpcy5iZWZvcmVDaXJjdWl0RWxlbWVudHNMYXllcixcclxuICAgICAgdGhpcy53aXJlTGF5ZXIsXHJcbiAgICAgIHRoaXMuZml4ZWRDaXJjdWl0RWxlbWVudExheWVyLFxyXG4gICAgICB0aGlzLnNvbGRlckxheWVyLFxyXG4gICAgICB0aGlzLnZlcnRleExheWVyLFxyXG4gICAgICB0aGlzLmNoYXJnZUxheWVyLFxyXG4gICAgICB0aGlzLmxpZ2h0QnVsYlNvY2tldExheWVyLFxyXG4gICAgICB0aGlzLnNlcmllc0FtbWV0ZXJOb2RlUmVhZG91dFBhbmVsTGF5ZXIsXHJcbiAgICAgIHRoaXMuYWZ0ZXJDaXJjdWl0RWxlbWVudHNMYXllcixcclxuICAgICAgdGhpcy5zZW5zb3JMYXllcixcclxuICAgICAgdGhpcy5oaWdobGlnaHRMYXllcixcclxuICAgICAgdGhpcy52YWx1ZUxheWVyLFxyXG4gICAgICB0aGlzLmJ1dHRvbkxheWVyXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIGNob29zZSBsYXllcmluZyBmb3Igc2NoZW1hdGljIHZzIGxpZmVsaWtlLiAgSEVBRFMgVVAsIHRoaXMgbWVhbnMgY2lyY3VpdE5vZGUuYWRkQ2hpbGQoKSB3aWxsIGdldCBvdmVyd3JpdHRlblxyXG4gICAgLy8gc28gYWxsIG5vZGVzIG11c3QgYmUgYWRkZWQgYXMgY2hpbGRyZW4gaW4gdGhlIGFycmF5IGFib3ZlLlxyXG4gICAgc2NyZWVuVmlldy5tb2RlbC52aWV3VHlwZVByb3BlcnR5LmxpbmsoIHZpZXdUeXBlID0+IHtcclxuICAgICAgdGhpcy5jaGlsZHJlbiA9ICggdmlld1R5cGUgPT09IENpcmN1aXRFbGVtZW50Vmlld1R5cGUuTElGRUxJS0UgKSA/IGxpZmVsaWtlTGF5ZXJpbmcgOiBzY2hlbWF0aWNMYXllcmluZztcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnZpc2libGVCb3VuZHNJbkNpcmN1aXRDb29yZGluYXRlRnJhbWVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IEJvdW5kczIoIDAsIDAsIDEsIDEgKSApO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdCA9IGNpcmN1aXQ7XHJcbiAgICB0aGlzLmNpcmN1aXRFbGVtZW50Tm9kZU1hcCA9IHt9O1xyXG4gICAgdGhpcy5zb2xkZXJOb2RlcyA9IHt9O1xyXG4gICAgdGhpcy52ZXJ0ZXhOb2RlcyA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9yIGVhY2ggQ2lyY3VpdEVsZW1lbnQgdHlwZSwgZG8gdGhlIGZvbGxvd2luZzpcclxuICAgICAqIChhKSBBZGQgbm9kZXMgZm9yIHByZS1leGlzdGluZyBtb2RlbCBlbGVtZW50c1xyXG4gICAgICogKGIpIEFkZCBhIGxpc3RlbmVyIHRoYXQgYWRkcyBub2RlcyB3aGVuIG1vZGVsIGVsZW1lbnRzIGFyZSBhZGRlZFxyXG4gICAgICogKGMpIEFkZCBhIGxpc3RlbmVyIHRoYXQgcmVtb3ZlcyBub2RlcyB3aGVuIG1vZGVsIGVsZW1lbnRzIGFyZSByZW1vdmVkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGluaXRpYWxpemVDaXJjdWl0RWxlbWVudFR5cGUgPSAoIHByZWRpY2F0ZTogKCBjOiBDaXJjdWl0RWxlbWVudCApID0+IGJvb2xlYW4sIGxheWVyOiBOb2RlLCBwaGV0aW9Hcm91cDogUGhldGlvR3JvdXA8Q2lyY3VpdEVsZW1lbnROb2RlLCBbIENpcmN1aXRFbGVtZW50IF0+ICkgPT4ge1xyXG4gICAgICBjb25zdCBhZGRDaXJjdWl0RWxlbWVudCA9ICggY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkgPT4ge1xyXG4gICAgICAgIGlmICggcHJlZGljYXRlKCBjaXJjdWl0RWxlbWVudCApICkge1xyXG4gICAgICAgICAgY29uc3QgY2lyY3VpdEVsZW1lbnROb2RlID0gcGhldGlvR3JvdXAuY3JlYXRlQ29ycmVzcG9uZGluZ0dyb3VwRWxlbWVudCggY2lyY3VpdEVsZW1lbnQudGFuZGVtLm5hbWUsIGNpcmN1aXRFbGVtZW50ICk7XHJcbiAgICAgICAgICB0aGlzLmNpcmN1aXRFbGVtZW50Tm9kZU1hcFsgY2lyY3VpdEVsZW1lbnQuaWQgXSA9IGNpcmN1aXRFbGVtZW50Tm9kZTtcclxuXHJcbiAgICAgICAgICBsYXllci5hZGRDaGlsZCggY2lyY3VpdEVsZW1lbnROb2RlICk7XHJcblxyXG4gICAgICAgICAgLy8gU2hvdyB0aGUgVmFsdWVOb2RlIGZvciByZWFkb3V0cywgdGhvdWdoIHNlcmllcyBhbW1ldGVycyBhbHJlYWR5IHNob3cgdGhlaXIgb3duIHJlYWRvdXRzIGFuZCBXaXJlcyBkbyBub3RcclxuICAgICAgICAgIC8vIGhhdmUgcmVhZG91dHNcclxuICAgICAgICAgIGlmICggY2lyY3VpdEVsZW1lbnQgaW5zdGFuY2VvZiBGaXhlZENpcmN1aXRFbGVtZW50ICYmICEoIGNpcmN1aXRFbGVtZW50IGluc3RhbmNlb2YgU2VyaWVzQW1tZXRlciApICkge1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZU5vZGUgPSBuZXcgVmFsdWVOb2RlKFxyXG4gICAgICAgICAgICAgIGNpcmN1aXQuc291cmNlUmVzaXN0YW5jZVByb3BlcnR5LFxyXG4gICAgICAgICAgICAgIGNpcmN1aXRFbGVtZW50LFxyXG4gICAgICAgICAgICAgIHRoaXMubW9kZWwuc2hvd1ZhbHVlc1Byb3BlcnR5LFxyXG4gICAgICAgICAgICAgIHRoaXMubW9kZWwudmlld1R5cGVQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICBUYW5kZW0uT1BUSU9OQUxcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVMYXllci5hZGRDaGlsZCggdmFsdWVOb2RlICk7XHJcblxyXG4gICAgICAgICAgICBjaXJjdWl0RWxlbWVudC5kaXNwb3NlRW1pdHRlckNpcmN1aXRFbGVtZW50LmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy52YWx1ZUxheWVyLnJlbW92ZUNoaWxkKCB2YWx1ZU5vZGUgKTtcclxuICAgICAgICAgICAgICB2YWx1ZU5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBjaXJjdWl0LmNpcmN1aXRFbGVtZW50cy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkQ2lyY3VpdEVsZW1lbnQgKTtcclxuICAgICAgY2lyY3VpdC5jaXJjdWl0RWxlbWVudHMuZm9yRWFjaCggYWRkQ2lyY3VpdEVsZW1lbnQgKTtcclxuICAgICAgY2lyY3VpdC5jaXJjdWl0RWxlbWVudHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggY2lyY3VpdEVsZW1lbnQgPT4ge1xyXG4gICAgICAgIGlmICggcHJlZGljYXRlKCBjaXJjdWl0RWxlbWVudCApICkge1xyXG5cclxuICAgICAgICAgIGNvbnN0IGNpcmN1aXRFbGVtZW50Tm9kZSA9IHRoaXMuZ2V0Q2lyY3VpdEVsZW1lbnROb2RlKCBjaXJjdWl0RWxlbWVudCApO1xyXG4gICAgICAgICAgbGF5ZXIucmVtb3ZlQ2hpbGQoIGNpcmN1aXRFbGVtZW50Tm9kZSApO1xyXG4gICAgICAgICAgcGhldGlvR3JvdXAuZGlzcG9zZUVsZW1lbnQoIGNpcmN1aXRFbGVtZW50Tm9kZSApO1xyXG5cclxuICAgICAgICAgIGRlbGV0ZSB0aGlzLmNpcmN1aXRFbGVtZW50Tm9kZU1hcFsgY2lyY3VpdEVsZW1lbnQuaWQgXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgaW5pdGlhbGl6ZUNpcmN1aXRFbGVtZW50VHlwZSggKCBlOiBDaXJjdWl0RWxlbWVudCApID0+IGUgaW5zdGFuY2VvZiBXaXJlLCB0aGlzLndpcmVMYXllcixcclxuICAgICAgbmV3IFBoZXRpb0dyb3VwPENpcmN1aXRFbGVtZW50Tm9kZSwgWyBDaXJjdWl0RWxlbWVudCBdPiggKCB0YW5kZW06IFRhbmRlbSwgY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkgPT4gbmV3IFdpcmVOb2RlKCBzY3JlZW5WaWV3LCB0aGlzLCBjaXJjdWl0RWxlbWVudCBhcyBXaXJlLCB0aGlzLm1vZGVsLnZpZXdUeXBlUHJvcGVydHksIHRhbmRlbSApLFxyXG4gICAgICAgICgpID0+IFsgdGhpcy5jaXJjdWl0LndpcmVHcm91cC5hcmNoZXR5cGUgXSwge1xyXG4gICAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggTm9kZS5Ob2RlSU8gKSxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dpcmVOb2RlR3JvdXAnICksXHJcbiAgICAgICAgICBzdXBwb3J0c0R5bmFtaWNTdGF0ZTogZmFsc2VcclxuICAgICAgICB9ICkgKTtcclxuXHJcbiAgICBpbml0aWFsaXplQ2lyY3VpdEVsZW1lbnRUeXBlKCAoIGU6IENpcmN1aXRFbGVtZW50ICkgPT4gZSBpbnN0YW5jZW9mIEJhdHRlcnkgJiYgZS5iYXR0ZXJ5VHlwZSA9PT0gJ25vcm1hbCcsIHRoaXMuZml4ZWRDaXJjdWl0RWxlbWVudExheWVyLFxyXG4gICAgICBuZXcgUGhldGlvR3JvdXA8Q2lyY3VpdEVsZW1lbnROb2RlLCBbIENpcmN1aXRFbGVtZW50IF0+KCAoIHRhbmRlbTogVGFuZGVtLCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKSA9PiBuZXcgQmF0dGVyeU5vZGUoIHNjcmVlblZpZXcsIHRoaXMsIGNpcmN1aXRFbGVtZW50IGFzIEJhdHRlcnksIHRoaXMubW9kZWwudmlld1R5cGVQcm9wZXJ0eSwgdGFuZGVtICksXHJcbiAgICAgICAgKCkgPT4gWyB0aGlzLmNpcmN1aXQuYmF0dGVyeUdyb3VwLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBOb2RlLk5vZGVJTyApLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmF0dGVyeU5vZGVHcm91cCcgKSxcclxuICAgICAgICAgIHN1cHBvcnRzRHluYW1pY1N0YXRlOiBmYWxzZVxyXG4gICAgICAgIH0gKSApO1xyXG5cclxuICAgIGluaXRpYWxpemVDaXJjdWl0RWxlbWVudFR5cGUoICggZTogQ2lyY3VpdEVsZW1lbnQgKSA9PiBlIGluc3RhbmNlb2YgTGlnaHRCdWxiICYmICFlLmlzRXh0cmVtZSAmJiAhZS5pc1JlYWwsIHRoaXMuZml4ZWRDaXJjdWl0RWxlbWVudExheWVyLFxyXG4gICAgICBuZXcgUGhldGlvR3JvdXA8Q2lyY3VpdEVsZW1lbnROb2RlLCBbIENpcmN1aXRFbGVtZW50IF0+KCAoIHRhbmRlbTogVGFuZGVtLCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKSA9PiBuZXcgQ0NLQ0xpZ2h0QnVsYk5vZGUoIHNjcmVlblZpZXcsIHRoaXMsIGNpcmN1aXRFbGVtZW50IGFzIExpZ2h0QnVsYiwgdGhpcy5tb2RlbC5pc1ZhbHVlRGVwaWN0aW9uRW5hYmxlZFByb3BlcnR5LCB0aGlzLm1vZGVsLnZpZXdUeXBlUHJvcGVydHksIHRhbmRlbSApLFxyXG4gICAgICAgICgpID0+IFsgdGhpcy5jaXJjdWl0LmxpZ2h0QnVsYkdyb3VwLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBOb2RlLk5vZGVJTyApLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGlnaHRCdWxiTm9kZUdyb3VwJyApLFxyXG4gICAgICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGZhbHNlXHJcbiAgICAgICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5jaXJjdWl0LnNlcmllc0FtbWV0ZXJHcm91cCAmJiBpbml0aWFsaXplQ2lyY3VpdEVsZW1lbnRUeXBlKCAoIGU6IENpcmN1aXRFbGVtZW50ICkgPT4gZSBpbnN0YW5jZW9mIFNlcmllc0FtbWV0ZXIsIHRoaXMuZml4ZWRDaXJjdWl0RWxlbWVudExheWVyLFxyXG4gICAgICBuZXcgUGhldGlvR3JvdXA8Q2lyY3VpdEVsZW1lbnROb2RlLCBbIENpcmN1aXRFbGVtZW50IF0+KCAoIHRhbmRlbTogVGFuZGVtLCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKSA9PiBuZXcgU2VyaWVzQW1tZXRlck5vZGUoIHNjcmVlblZpZXcsIHRoaXMsIGNpcmN1aXRFbGVtZW50IGFzIFNlcmllc0FtbWV0ZXIsIHRhbmRlbSxcclxuICAgICAgICAgIHRoaXMubW9kZWwuaXNWYWx1ZURlcGljdGlvbkVuYWJsZWRQcm9wZXJ0eSApLFxyXG4gICAgICAgICgpID0+IFsgdGhpcy5jaXJjdWl0LnNlcmllc0FtbWV0ZXJHcm91cCEuYXJjaGV0eXBlIF0sIHtcclxuICAgICAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIE5vZGUuTm9kZUlPICksXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzZXJpZXNBbW1ldGVyTm9kZUdyb3VwJyApLFxyXG4gICAgICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGZhbHNlXHJcbiAgICAgICAgfSApICk7XHJcblxyXG4gICAgaW5pdGlhbGl6ZUNpcmN1aXRFbGVtZW50VHlwZSggKCBlOiBDaXJjdWl0RWxlbWVudCApID0+IGUgaW5zdGFuY2VvZiBCYXR0ZXJ5ICYmIGUuYmF0dGVyeVR5cGUgPT09ICdoaWdoLXZvbHRhZ2UnLCB0aGlzLmZpeGVkQ2lyY3VpdEVsZW1lbnRMYXllcixcclxuICAgICAgbmV3IFBoZXRpb0dyb3VwPENpcmN1aXRFbGVtZW50Tm9kZSwgWyBDaXJjdWl0RWxlbWVudCBdPiggKCB0YW5kZW06IFRhbmRlbSwgY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkgPT4gbmV3IEJhdHRlcnlOb2RlKCBzY3JlZW5WaWV3LCB0aGlzLCBjaXJjdWl0RWxlbWVudCBhcyBCYXR0ZXJ5LCB0aGlzLm1vZGVsLnZpZXdUeXBlUHJvcGVydHksIHRhbmRlbSApLFxyXG4gICAgICAgICgpID0+IFsgdGhpcy5jaXJjdWl0LmJhdHRlcnlHcm91cC5hcmNoZXR5cGUgXSwge1xyXG4gICAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggTm9kZS5Ob2RlSU8gKSxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4dHJlbWVCYXR0ZXJ5Tm9kZUdyb3VwJyApLFxyXG4gICAgICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGZhbHNlXHJcbiAgICAgICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5jaXJjdWl0LmV4dHJlbWVSZXNpc3Rvckdyb3VwICYmIGluaXRpYWxpemVDaXJjdWl0RWxlbWVudFR5cGUoICggZTogQ2lyY3VpdEVsZW1lbnQgKSA9PiBlIGluc3RhbmNlb2YgUmVzaXN0b3IgJiYgZS5yZXNpc3RvclR5cGUgPT09IFJlc2lzdG9yVHlwZS5FWFRSRU1FX1JFU0lTVE9SLCB0aGlzLmZpeGVkQ2lyY3VpdEVsZW1lbnRMYXllcixcclxuICAgICAgbmV3IFBoZXRpb0dyb3VwPENpcmN1aXRFbGVtZW50Tm9kZSwgWyBDaXJjdWl0RWxlbWVudCBdPiggKCB0YW5kZW06IFRhbmRlbSwgY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkgPT5cclxuICAgICAgICAgIG5ldyBSZXNpc3Rvck5vZGUoIHNjcmVlblZpZXcsIHRoaXMsIGNpcmN1aXRFbGVtZW50IGFzIFJlc2lzdG9yLCB0aGlzLm1vZGVsLnZpZXdUeXBlUHJvcGVydHksIHRhbmRlbSApLFxyXG4gICAgICAgICgpID0+IFsgdGhpcy5jaXJjdWl0LmV4dHJlbWVSZXNpc3Rvckdyb3VwIS5hcmNoZXR5cGUgXSwge1xyXG4gICAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggTm9kZS5Ob2RlSU8gKSxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2V4dHJlbWVSZXNpc3Rvck5vZGVHcm91cCcgKSxcclxuICAgICAgICAgIHN1cHBvcnRzRHluYW1pY1N0YXRlOiBmYWxzZVxyXG4gICAgICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdC5leHRyZW1lTGlnaHRCdWxiR3JvdXAgJiYgaW5pdGlhbGl6ZUNpcmN1aXRFbGVtZW50VHlwZSggKCBlOiBDaXJjdWl0RWxlbWVudCApID0+IGUgaW5zdGFuY2VvZiBMaWdodEJ1bGIgJiYgZS5pc0V4dHJlbWUgJiYgIWUuaXNSZWFsLCB0aGlzLmZpeGVkQ2lyY3VpdEVsZW1lbnRMYXllcixcclxuICAgICAgbmV3IFBoZXRpb0dyb3VwPENpcmN1aXRFbGVtZW50Tm9kZSwgWyBDaXJjdWl0RWxlbWVudCBdPiggKCB0YW5kZW06IFRhbmRlbSwgY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkgPT4gbmV3IENDS0NMaWdodEJ1bGJOb2RlKCBzY3JlZW5WaWV3LCB0aGlzLCBjaXJjdWl0RWxlbWVudCBhcyBMaWdodEJ1bGIsIHRoaXMubW9kZWwuaXNWYWx1ZURlcGljdGlvbkVuYWJsZWRQcm9wZXJ0eSwgdGhpcy5tb2RlbC52aWV3VHlwZVByb3BlcnR5LCB0YW5kZW0gKSxcclxuICAgICAgICAoKSA9PiBbIHRoaXMuY2lyY3VpdC5leHRyZW1lTGlnaHRCdWxiR3JvdXAhLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBOb2RlLk5vZGVJTyApLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXh0cmVtZUxpZ2h0QnVsYk5vZGVHcm91cCcgKSxcclxuICAgICAgICAgIHN1cHBvcnRzRHluYW1pY1N0YXRlOiBmYWxzZVxyXG4gICAgICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdC5yZWFsTGlnaHRCdWxiR3JvdXAgJiYgaW5pdGlhbGl6ZUNpcmN1aXRFbGVtZW50VHlwZSggKCBlOiBDaXJjdWl0RWxlbWVudCApID0+IGUgaW5zdGFuY2VvZiBMaWdodEJ1bGIgJiYgZS5pc1JlYWwsIHRoaXMuZml4ZWRDaXJjdWl0RWxlbWVudExheWVyLFxyXG4gICAgICBuZXcgUGhldGlvR3JvdXA8Q2lyY3VpdEVsZW1lbnROb2RlLCBbIENpcmN1aXRFbGVtZW50IF0+KCAoIHRhbmRlbTogVGFuZGVtLCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKSA9PiBuZXcgQ0NLQ0xpZ2h0QnVsYk5vZGUoIHNjcmVlblZpZXcsIHRoaXMsIGNpcmN1aXRFbGVtZW50IGFzIExpZ2h0QnVsYiwgdGhpcy5tb2RlbC5pc1ZhbHVlRGVwaWN0aW9uRW5hYmxlZFByb3BlcnR5LCB0aGlzLm1vZGVsLnZpZXdUeXBlUHJvcGVydHksIHRhbmRlbSApLFxyXG4gICAgICAgICgpID0+IFsgdGhpcy5jaXJjdWl0LnJlYWxMaWdodEJ1bGJHcm91cCEuYXJjaGV0eXBlIF0sIHtcclxuICAgICAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIE5vZGUuTm9kZUlPICksXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWFsTGlnaHRCdWxiTm9kZUdyb3VwJyApLFxyXG4gICAgICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGZhbHNlXHJcbiAgICAgICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5jaXJjdWl0LmNhcGFjaXRvckdyb3VwICYmIGluaXRpYWxpemVDaXJjdWl0RWxlbWVudFR5cGUoICggZTogQ2lyY3VpdEVsZW1lbnQgKSA9PiBlIGluc3RhbmNlb2YgQ2FwYWNpdG9yLCB0aGlzLmZpeGVkQ2lyY3VpdEVsZW1lbnRMYXllcixcclxuICAgICAgbmV3IFBoZXRpb0dyb3VwPENpcmN1aXRFbGVtZW50Tm9kZSwgWyBDaXJjdWl0RWxlbWVudCBdPiggKCB0YW5kZW06IFRhbmRlbSwgY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkgPT4gbmV3IENhcGFjaXRvckNpcmN1aXRFbGVtZW50Tm9kZSggc2NyZWVuVmlldywgdGhpcywgY2lyY3VpdEVsZW1lbnQgYXMgQ2FwYWNpdG9yLCB0aGlzLm1vZGVsLnZpZXdUeXBlUHJvcGVydHksIHRhbmRlbSApLFxyXG4gICAgICAgICgpID0+IFsgdGhpcy5jaXJjdWl0LmNhcGFjaXRvckdyb3VwIS5hcmNoZXR5cGUgXSwge1xyXG4gICAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggTm9kZS5Ob2RlSU8gKSxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NhcGFjaXRvck5vZGVHcm91cCcgKSxcclxuICAgICAgICAgIHN1cHBvcnRzRHluYW1pY1N0YXRlOiBmYWxzZVxyXG4gICAgICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdC5hY1ZvbHRhZ2VHcm91cCAmJiBpbml0aWFsaXplQ2lyY3VpdEVsZW1lbnRUeXBlKCAoIGU6IENpcmN1aXRFbGVtZW50ICkgPT4gZSBpbnN0YW5jZW9mIEFDVm9sdGFnZSwgdGhpcy5maXhlZENpcmN1aXRFbGVtZW50TGF5ZXIsXHJcbiAgICAgIG5ldyBQaGV0aW9Hcm91cDxDaXJjdWl0RWxlbWVudE5vZGUsIFsgQ2lyY3VpdEVsZW1lbnQgXT4oICggdGFuZGVtOiBUYW5kZW0sIGNpcmN1aXRFbGVtZW50OiBDaXJjdWl0RWxlbWVudCApID0+IG5ldyBBQ1ZvbHRhZ2VOb2RlKCBzY3JlZW5WaWV3LCB0aGlzLCBjaXJjdWl0RWxlbWVudCBhcyBBQ1ZvbHRhZ2UsIHRoaXMubW9kZWwudmlld1R5cGVQcm9wZXJ0eSwgdGFuZGVtICksXHJcbiAgICAgICAgKCkgPT4gWyB0aGlzLmNpcmN1aXQuYWNWb2x0YWdlR3JvdXAhLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBOb2RlLk5vZGVJTyApLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWNWb2x0YWdlTm9kZUdyb3VwJyApLFxyXG4gICAgICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGZhbHNlXHJcbiAgICAgICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5jaXJjdWl0LmluZHVjdG9yR3JvdXAgJiYgaW5pdGlhbGl6ZUNpcmN1aXRFbGVtZW50VHlwZSggKCBlOiBDaXJjdWl0RWxlbWVudCApID0+IGUgaW5zdGFuY2VvZiBJbmR1Y3RvciwgdGhpcy5maXhlZENpcmN1aXRFbGVtZW50TGF5ZXIsXHJcbiAgICAgIG5ldyBQaGV0aW9Hcm91cDxDaXJjdWl0RWxlbWVudE5vZGUsIFsgQ2lyY3VpdEVsZW1lbnQgXT4oICggdGFuZGVtOiBUYW5kZW0sIGNpcmN1aXRFbGVtZW50OiBDaXJjdWl0RWxlbWVudCApID0+IG5ldyBJbmR1Y3Rvck5vZGUoIHNjcmVlblZpZXcsIHRoaXMsIGNpcmN1aXRFbGVtZW50IGFzIEluZHVjdG9yLCB0aGlzLm1vZGVsLnZpZXdUeXBlUHJvcGVydHksIHRhbmRlbSApLFxyXG4gICAgICAgICgpID0+IFsgdGhpcy5jaXJjdWl0LmluZHVjdG9yR3JvdXAhLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBOb2RlLk5vZGVJTyApLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5kdWN0b3JOb2RlR3JvdXAnICksXHJcbiAgICAgICAgICBzdXBwb3J0c0R5bmFtaWNTdGF0ZTogZmFsc2VcclxuICAgICAgICB9ICkgKTtcclxuXHJcbiAgICBpbml0aWFsaXplQ2lyY3VpdEVsZW1lbnRUeXBlKCAoIGU6IENpcmN1aXRFbGVtZW50ICkgPT4gZSBpbnN0YW5jZW9mIFJlc2lzdG9yICYmIGUucmVzaXN0b3JUeXBlID09PSBSZXNpc3RvclR5cGUuUkVTSVNUT1IsIHRoaXMuZml4ZWRDaXJjdWl0RWxlbWVudExheWVyLFxyXG4gICAgICBuZXcgUGhldGlvR3JvdXA8Q2lyY3VpdEVsZW1lbnROb2RlLCBbIENpcmN1aXRFbGVtZW50IF0+KCAoIHRhbmRlbTogVGFuZGVtLCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKSA9PlxyXG4gICAgICAgICAgbmV3IFJlc2lzdG9yTm9kZSggc2NyZWVuVmlldywgdGhpcywgY2lyY3VpdEVsZW1lbnQgYXMgUmVzaXN0b3IsIHRoaXMubW9kZWwudmlld1R5cGVQcm9wZXJ0eSwgdGFuZGVtICksXHJcbiAgICAgICAgKCkgPT4gWyB0aGlzLmNpcmN1aXQucmVzaXN0b3JHcm91cC5hcmNoZXR5cGUgXSwge1xyXG4gICAgICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggTm9kZS5Ob2RlSU8gKSxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2lzdG9yTm9kZUdyb3VwJyApLFxyXG4gICAgICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGZhbHNlXHJcbiAgICAgICAgfSApICk7XHJcblxyXG4gICAgaW5pdGlhbGl6ZUNpcmN1aXRFbGVtZW50VHlwZSggKCBlOiBDaXJjdWl0RWxlbWVudCApID0+IGUgaW5zdGFuY2VvZiBSZXNpc3RvciAmJiBlLnJlc2lzdG9yVHlwZSAhPT0gUmVzaXN0b3JUeXBlLlJFU0lTVE9SICYmIGUucmVzaXN0b3JUeXBlICE9PSBSZXNpc3RvclR5cGUuRVhUUkVNRV9SRVNJU1RPUiwgdGhpcy5maXhlZENpcmN1aXRFbGVtZW50TGF5ZXIsXHJcbiAgICAgIG5ldyBQaGV0aW9Hcm91cDxDaXJjdWl0RWxlbWVudE5vZGUsIFsgQ2lyY3VpdEVsZW1lbnQgXT4oICggdGFuZGVtOiBUYW5kZW0sIGNpcmN1aXRFbGVtZW50OiBDaXJjdWl0RWxlbWVudCApID0+IHtcclxuICAgICAgICAgIGlmICggY2lyY3VpdEVsZW1lbnQgaW5zdGFuY2VvZiBEb2cgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRG9nTm9kZSggc2NyZWVuVmlldywgdGhpcywgY2lyY3VpdEVsZW1lbnQsIHRoaXMubW9kZWwudmlld1R5cGVQcm9wZXJ0eSwgdGFuZGVtICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXNpc3Rvck5vZGUoIHNjcmVlblZpZXcsIHRoaXMsIGNpcmN1aXRFbGVtZW50IGFzIFJlc2lzdG9yLCB0aGlzLm1vZGVsLnZpZXdUeXBlUHJvcGVydHksIHRhbmRlbSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKCkgPT4gWyB0aGlzLmNpcmN1aXQuaG91c2Vob2xkT2JqZWN0R3JvdXAuYXJjaGV0eXBlIF0sIHtcclxuICAgICAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIE5vZGUuTm9kZUlPICksXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdob3VzZWhvbGRPYmplY3ROb2RlR3JvdXAnICksXHJcbiAgICAgICAgICBzdXBwb3J0c0R5bmFtaWNTdGF0ZTogZmFsc2VcclxuICAgICAgICB9ICkgKTtcclxuXHJcbiAgICBpbml0aWFsaXplQ2lyY3VpdEVsZW1lbnRUeXBlKCAoIGU6IENpcmN1aXRFbGVtZW50ICkgPT4gZSBpbnN0YW5jZW9mIFN3aXRjaCwgdGhpcy5maXhlZENpcmN1aXRFbGVtZW50TGF5ZXIsXHJcbiAgICAgIG5ldyBQaGV0aW9Hcm91cDxDaXJjdWl0RWxlbWVudE5vZGUsIFsgQ2lyY3VpdEVsZW1lbnQgXT4oICggdGFuZGVtOiBUYW5kZW0sIGNpcmN1aXRFbGVtZW50OiBDaXJjdWl0RWxlbWVudCApID0+IG5ldyBTd2l0Y2hOb2RlKCBzY3JlZW5WaWV3LCB0aGlzLCBjaXJjdWl0RWxlbWVudCBhcyBTd2l0Y2gsIHRoaXMubW9kZWwudmlld1R5cGVQcm9wZXJ0eSwgdGFuZGVtICksXHJcbiAgICAgICAgKCkgPT4gWyB0aGlzLmNpcmN1aXQuc3dpdGNoR3JvdXAuYXJjaGV0eXBlIF0sIHtcclxuICAgICAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIE5vZGUuTm9kZUlPICksXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzd2l0Y2hOb2RlR3JvdXAnICksXHJcbiAgICAgICAgICBzdXBwb3J0c0R5bmFtaWNTdGF0ZTogZmFsc2VcclxuICAgICAgICB9ICkgKTtcclxuXHJcbiAgICBpbml0aWFsaXplQ2lyY3VpdEVsZW1lbnRUeXBlKCAoIGU6IENpcmN1aXRFbGVtZW50ICkgPT4gZSBpbnN0YW5jZW9mIEZ1c2UsIHRoaXMuZml4ZWRDaXJjdWl0RWxlbWVudExheWVyLFxyXG4gICAgICBuZXcgUGhldGlvR3JvdXA8Q2lyY3VpdEVsZW1lbnROb2RlLCBbIENpcmN1aXRFbGVtZW50IF0+KCAoIHRhbmRlbTogVGFuZGVtLCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKSA9PiBuZXcgRnVzZU5vZGUoIHNjcmVlblZpZXcsIHRoaXMsIGNpcmN1aXRFbGVtZW50IGFzIEZ1c2UsIHRoaXMubW9kZWwudmlld1R5cGVQcm9wZXJ0eSwgdGFuZGVtICksXHJcbiAgICAgICAgKCkgPT4gWyB0aGlzLmNpcmN1aXQuZnVzZUdyb3VwLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBOb2RlLk5vZGVJTyApLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZnVzZU5vZGVHcm91cCcgKSxcclxuICAgICAgICAgIHN1cHBvcnRzRHluYW1pY1N0YXRlOiBmYWxzZVxyXG4gICAgICAgIH0gKSApO1xyXG5cclxuICAgIC8vIFdoZW4gYSB2ZXJ0ZXggaXMgc2VsZWN0ZWQsIGEgY3V0IGJ1dHRvbiBpcyBzaG93biBuZWFyIHRvIHRoZSB2ZXJ0ZXguICBJZiB0aGUgdmVydGV4IGlzIGNvbm5lY3RlZCB0byA+MSBjaXJjdWl0XHJcbiAgICAvLyBlbGVtZW50LCB0aGUgYnV0dG9uIGlzIGVuYWJsZWQuICBQcmVzc2luZyB0aGUgYnV0dG9uIHdpbGwgY3V0IHRoZSB2ZXJ0ZXggZnJvbSB0aGUgbmVpZ2hib3JzLiAgT25seSBvbmUgdmVydGV4Q3V0QnV0dG9uXHJcbiAgICAvLyBpcyBhbGxvY2F0ZWQgZm9yIGFsbCB2ZXJ0aWNlcyAocGVyIHNjcmVlbikgdG8gdXNlIGJlY2F1c2UgaXQgaXMgdG9vIHBlcmZvcm1hbmNlIGRlbWFuZGluZyB0byBjcmVhdGUgdGhlc2VcclxuICAgIC8vIGR5bmFtaWNhbGx5IHdoZW4gY2lyY3VpdCBlbGVtZW50cyBhcmUgZHJhZ2dlZCBmcm9tIHRoZSB0b29sYm94LiAgQWxzbywgb25seSBvbmUgdmVydGV4IGNhbiBiZSBzZWxlY3RlZCBhdCBvbmNlXHJcbiAgICAvLyBzbyB0aGVyZSBpcyBvbmx5IGEgbmVlZCBmb3Igb25lIGN1dCBidXR0b24uXHJcbiAgICBjb25zdCBjdXRJY29uID0gbmV3IFBhdGgoIHNjaXNzb3JzU2hhcGUsIHtcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgcm90YXRpb246IC1NYXRoLlBJIC8gMiwgLy8gc2Npc3NvcnMgcG9pbnQgdXBcclxuICAgICAgbWF4V2lkdGg6IDM2XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy52ZXJ0ZXhDdXRCdXR0b24gPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XHJcbiAgICAgIGJhc2VDb2xvcjogJ3llbGxvdycsXHJcbiAgICAgIGNvbnRlbnQ6IGN1dEljb24sXHJcbiAgICAgIHhNYXJnaW46IDEwLFxyXG4gICAgICB5TWFyZ2luOiAxMCxcclxuXHJcbiAgICAgIC8vIFRoZSBjdXQgYnV0dG9uIHNob3VsZCBhcHBlYXIgYXQgdGhlIHRvcCBsZXZlbCBvZiB0aGUgdmlldyBpbiB0aGUgUGhFVC1pTyB0cmVlIChjb25zaXN0ZW50XHJcbiAgICAgIC8vIHdpdGggb3RoZXIgZ2xvYmFsLXVzZSBidXR0b25zKSwgc28gd2UgYXJlIHVzaW5nIHRoZSBzY3JlZW5WaWV3IHRhbmRlbSBoZXJlXHJcbiAgICAgIHRhbmRlbTogc2NyZWVuVmlldy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmVydGV4Q3V0QnV0dG9uJyApLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHlPcHRpb25zOiB7XHJcbiAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgICAgcGhldGlvRmVhdHVyZWQ6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMudmVydGV4Q3V0QnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNlbGVjdGVkVmVydGV4ID0gY2lyY3VpdC5nZXRTZWxlY3RlZFZlcnRleCgpO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWxlY3RlZFZlcnRleCwgJ0J1dHRvbiBzaG91bGQgb25seSBiZSBhdmFpbGFibGUgaWYgYSB2ZXJ0ZXggaXMgc2VsZWN0ZWQnICk7XHJcbiAgICAgIGlmICggc2VsZWN0ZWRWZXJ0ZXggKSB7XHJcbiAgICAgICAgY2lyY3VpdC5jdXRWZXJ0ZXgoIHNlbGVjdGVkVmVydGV4ICk7XHJcblxyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBubyB2ZXJ0aWNlcyBnb3QgbnVkZ2VkIG91dCBvZiBib3VuZHMgZHVyaW5nIGEgY3V0LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1kYy9pc3N1ZXMvMTM4XHJcbiAgICAgICAgbW92ZVZlcnRpY2VzSW5Cb3VuZHMoIHRoaXMudmlzaWJsZUJvdW5kc0luQ2lyY3VpdENvb3JkaW5hdGVGcmFtZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB2ZXJ0ZXhOb2RlR3JvdXAgPSBuZXcgUGhldGlvR3JvdXA8VmVydGV4Tm9kZSwgWyBWZXJ0ZXggXT4oICggdGFuZGVtLCB2ZXJ0ZXg6IFZlcnRleCApID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBWZXJ0ZXhOb2RlKCB0aGlzLCB2ZXJ0ZXgsIHRhbmRlbSApO1xyXG4gICAgfSwgKCkgPT4gWyBjaXJjdWl0LnZlcnRleEdyb3VwLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIE5vZGUuTm9kZUlPICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlcnRleE5vZGVHcm91cCcgKSxcclxuICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiBhIFZlcnRleCBpcyBhZGRlZCB0byB0aGUgbW9kZWwsIGNyZWF0ZSB0aGUgY29ycmVzcG9uZGluZyB2aWV3c1xyXG4gICAgY29uc3QgYWRkVmVydGV4Tm9kZSA9ICggdmVydGV4OiBWZXJ0ZXggKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNvbGRlck5vZGUgPSBuZXcgU29sZGVyTm9kZSggdGhpcywgdmVydGV4ICk7XHJcbiAgICAgIHRoaXMuc29sZGVyTm9kZXNbIHZlcnRleC5pbmRleCBdID0gc29sZGVyTm9kZTtcclxuICAgICAgdGhpcy5zb2xkZXJMYXllci5hZGRDaGlsZCggc29sZGVyTm9kZSApO1xyXG5cclxuICAgICAgY29uc3QgdmVydGV4Tm9kZSA9IHZlcnRleE5vZGVHcm91cC5jcmVhdGVDb3JyZXNwb25kaW5nR3JvdXBFbGVtZW50KCB2ZXJ0ZXgudGFuZGVtLm5hbWUsIHZlcnRleCApO1xyXG4gICAgICB0aGlzLnZlcnRleE5vZGVzWyB2ZXJ0ZXguaW5kZXggXSA9IHZlcnRleE5vZGU7XHJcbiAgICAgIHRoaXMudmVydGV4TGF5ZXIuYWRkQ2hpbGQoIHZlcnRleE5vZGUgKTtcclxuICAgIH07XHJcbiAgICBjaXJjdWl0LnZlcnRleEdyb3VwLmVsZW1lbnRDcmVhdGVkRW1pdHRlci5hZGRMaXN0ZW5lciggYWRkVmVydGV4Tm9kZSApO1xyXG5cclxuICAgIC8vIFdoZW4gYSBWZXJ0ZXggaXMgcmVtb3ZlZCBmcm9tIHRoZSBtb2RlbCwgcmVtb3ZlIGFuZCBkaXNwb3NlIHRoZSBjb3JyZXNwb25kaW5nIHZpZXdzXHJcbiAgICBjaXJjdWl0LnZlcnRleEdyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHZlcnRleCA9PiB7XHJcbiAgICAgIGNvbnN0IHZlcnRleE5vZGUgPSB0aGlzLmdldFZlcnRleE5vZGUoIHZlcnRleCApO1xyXG4gICAgICB0aGlzLnZlcnRleExheWVyLnJlbW92ZUNoaWxkKCB2ZXJ0ZXhOb2RlICk7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLnZlcnRleE5vZGVzWyB2ZXJ0ZXguaW5kZXggXTtcclxuICAgICAgdmVydGV4Tm9kZUdyb3VwLmRpc3Bvc2VFbGVtZW50KCB2ZXJ0ZXhOb2RlICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmdldFZlcnRleE5vZGUoIHZlcnRleCApLCAndmVydGV4IG5vZGUgc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkJyApO1xyXG5cclxuICAgICAgY29uc3Qgc29sZGVyTm9kZSA9IHRoaXMuZ2V0U29sZGVyTm9kZSggdmVydGV4ICk7XHJcbiAgICAgIHRoaXMuc29sZGVyTGF5ZXIucmVtb3ZlQ2hpbGQoIHNvbGRlck5vZGUgKTtcclxuICAgICAgZGVsZXRlIHRoaXMuc29sZGVyTm9kZXNbIHZlcnRleC5pbmRleCBdO1xyXG4gICAgICBzb2xkZXJOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuZ2V0U29sZGVyTm9kZSggdmVydGV4ICksICdzb2xkZXIgbm9kZSBzaG91bGQgaGF2ZSBiZWVuIHJlbW92ZWQnICk7XHJcbiAgICB9ICk7XHJcbiAgICBjaXJjdWl0LnZlcnRleEdyb3VwLmZvckVhY2goIGFkZFZlcnRleE5vZGUgKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBzY3JlZW4gaXMgcmVzaXplZCBvciB6b29tZWQsIG1vdmUgYWxsIHZlcnRpY2VzIGludG8gdmlldy5cclxuICAgIGNvbnN0IG1vdmVWZXJ0aWNlc0luQm91bmRzID0gKCBsb2NhbEJvdW5kczogQm91bmRzMiApID0+IHtcclxuXHJcbiAgICAgIC8vIENoZWNrIGFsbCB2ZXJ0aWNlc1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaXJjdWl0LnZlcnRleEdyb3VwLmNvdW50OyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgdmVydGV4ID0gY2lyY3VpdC52ZXJ0ZXhHcm91cC5nZXRFbGVtZW50KCBpICk7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB2ZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAgICAgLy8gSWYgYW55IFZlcnRleCBpcyBvdXQgb2YgYm91bmRzLCBtb3ZlIGl0IGFuZCBhbGwgY29ubmVjdGVkIFZlcnRpY2VzICh0byBwcmVzZXJ2ZSBnZW9tZXRyeSkgaW4gYm91bmRzLlxyXG4gICAgICAgIGlmICggIWxvY2FsQm91bmRzLmNvbnRhaW5zUG9pbnQoIHBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBjbG9zZXN0UG9pbnQgPSBsb2NhbEJvdW5kcy5nZXRDbG9zZXN0UG9pbnQoIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKTtcclxuICAgICAgICAgIGNvbnN0IGRlbHRhID0gY2xvc2VzdFBvaW50Lm1pbnVzKCBwb3NpdGlvbiApO1xyXG5cclxuICAgICAgICAgIC8vIEZpbmQgYWxsIHZlcnRpY2VzIGNvbm5lY3RlZCBieSBmaXhlZCBsZW5ndGggbm9kZXMuXHJcbiAgICAgICAgICBjb25zdCB2ZXJ0aWNlcyA9IGNpcmN1aXQuZmluZEFsbENvbm5lY3RlZFZlcnRpY2VzKCB2ZXJ0ZXggKTtcclxuICAgICAgICAgIHRoaXMudHJhbnNsYXRlVmVydGV4R3JvdXAoIHZlcnRleCwgdmVydGljZXMsIGRlbHRhLCBudWxsLCBbXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoaXMudmlzaWJsZUJvdW5kc0luQ2lyY3VpdENvb3JkaW5hdGVGcmFtZVByb3BlcnR5LmxpbmsoIG1vdmVWZXJ0aWNlc0luQm91bmRzICk7XHJcblxyXG4gICAgLy8gV2hlbiBhIGNoYXJnZSBpcyBhZGRlZCwgYWRkIHRoZSBjb3JyZXNwb25kaW5nIENoYXJnZU5vZGUgKHJlbW92ZWQgaXQgaXRzIGRpc3Bvc2UgY2FsbClcclxuICAgIGNpcmN1aXQuY2hhcmdlcy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggY2hhcmdlID0+IHRoaXMuY2hhcmdlTGF5ZXIuYWRkQ2hpbGQoIG5ldyBDaGFyZ2VOb2RlKCBjaGFyZ2UsIHRoaXMgKSApICk7XHJcblxyXG4gICAgaWYgKCBDQ0tDUXVlcnlQYXJhbWV0ZXJzLnNob3dDdXJyZW50cyApIHtcclxuICAgICAgdGhpcy5jaXJjdWl0RGVidWdMYXllciA9IG5ldyBDaXJjdWl0RGVidWdMYXllciggdGhpcyApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNpcmN1aXREZWJ1Z0xheWVyICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5jaXJjdWl0RGVidWdMYXllciA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbGlzdGVuZXIgZm9yICdjbGljayBvdXRzaWRlIHRvIGRpc21pc3MnXHJcbiAgICBwaGV0LmpvaXN0LmRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERpc3BsYXlDbGlja1RvRGlzbWlzc0xpc3RlbmVyKCAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XHJcblxyXG4gICAgICAvLyBpZiB0aGUgdGFyZ2V0IHdhcyBpbiBhIENpcmN1aXRFbGVtZW50RWRpdENvbnRhaW5lck5vZGUsIGRvbid0IGRpc21pc3MgdGhlIGV2ZW50IGJlY2F1c2UgdGhlIHVzZXIgd2FzXHJcbiAgICAgIC8vIGRyYWdnaW5nIHRoZSBzbGlkZXIgb3IgcHJlc3NpbmcgdGhlIHRyYXNoIGJ1dHRvbiBvciBhbm90aGVyIGNvbnRyb2wgaW4gdGhhdCBwYW5lbFxyXG4gICAgICBjb25zdCB0cmFpbHMgPSBldmVudC50YXJnZXQuZ2V0VHJhaWxzKCAoIG5vZGU6IE5vZGUgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHRhcHBlZCBhbnkgY29tcG9uZW50IGluIHRoZSBDaXJjdWl0RWxlbWVudENvbnRhaW5lclBhbmVsIG9yIG9uIHRoZSBzZWxlY3RlZCBub2RlXHJcbiAgICAgICAgLy8gYWxsb3cgaW50ZXJhY3Rpb24gdG8gcHJvY2VlZCBub3JtYWxseS4gIEFueSBvdGhlciB0YXBzIHdpbGwgZGVzZWxlY3QgdGhlIGNpcmN1aXQgZWxlbWVudFxyXG4gICAgICAgIHJldHVybiBub2RlIGluc3RhbmNlb2YgQ2lyY3VpdEVsZW1lbnRFZGl0Q29udGFpbmVyTm9kZSB8fCBub2RlIGluc3RhbmNlb2YgQ2lyY3VpdEVsZW1lbnROb2RlIHx8IG5vZGUgaW5zdGFuY2VvZiBWZXJ0ZXhOb2RlO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBpZiAoIHRyYWlscy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgdGhpcy5jaXJjdWl0LnNlbGVjdGlvblByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjaXJjdWl0IGVsZW1lbnQgbm9kZSB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIGNpcmN1aXQgZWxlbWVudC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0Q2lyY3VpdEVsZW1lbnROb2RlKCBjaXJjdWl0RWxlbWVudDogQ2lyY3VpdEVsZW1lbnQgKTogQ2lyY3VpdEVsZW1lbnROb2RlIHtcclxuICAgIHJldHVybiB0aGlzLmNpcmN1aXRFbGVtZW50Tm9kZU1hcFsgY2lyY3VpdEVsZW1lbnQuaWQgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgc29sZGVyIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQgVmVydGV4XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRTb2xkZXJOb2RlKCB2ZXJ0ZXg6IFZlcnRleCApOiBTb2xkZXJOb2RlIHsgcmV0dXJuIHRoaXMuc29sZGVyTm9kZXNbIHZlcnRleC5pbmRleCBdOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgVmVydGV4Tm9kZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBWZXJ0ZXhcclxuICAgKi9cclxuICBwcml2YXRlIGdldFZlcnRleE5vZGUoIHZlcnRleDogVmVydGV4ICk6IFZlcnRleE5vZGUgeyByZXR1cm4gdGhpcy52ZXJ0ZXhOb2Rlc1sgdmVydGV4LmluZGV4IF07IH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZCBkcm9wIHRhcmdldHMgZm9yIGFsbCB0aGUgZ2l2ZW4gdmVydGljZXNcclxuICAgKiBAcGFyYW0gdmVydGljZXNcclxuICAgKiBAcmV0dXJucyBjYW5kaWRhdGVzIGZvciBjb25uZWN0aW9uLCBlYWNoIE9iamVjdCBoYXMge3NyYzpWZXJ0ZXgsZHN0OlZlcnRleH0gaW5kaWNhdGluZyB3aGF0IGNhbiBzbmFwXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRBbGxEcm9wVGFyZ2V0cyggdmVydGljZXM6IFZlcnRleFtdICk6IHsgc3JjOiBWZXJ0ZXg7IGRzdDogVmVydGV4IH1bXSB7XHJcbiAgICBjb25zdCBhbGxEcm9wVGFyZ2V0cyA9IFtdO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB2ZXJ0ZXggPSB2ZXJ0aWNlc1sgaSBdO1xyXG4gICAgICBjb25zdCB0YXJnZXRWZXJ0ZXggPSB0aGlzLmNpcmN1aXQuZ2V0RHJvcFRhcmdldChcclxuICAgICAgICB2ZXJ0ZXgsXHJcbiAgICAgICAgdGhpcy5tb2RlbC5tb2RlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgdGhpcy5tb2RlbC5ibGFja0JveEJvdW5kc1xyXG4gICAgICApO1xyXG4gICAgICBpZiAoIHRhcmdldFZlcnRleCApIHtcclxuICAgICAgICBhbGxEcm9wVGFyZ2V0cy5wdXNoKCB7IHNyYzogdmVydGV4LCBkc3Q6IHRhcmdldFZlcnRleCB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhbGxEcm9wVGFyZ2V0cztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSBjbG9zZXN0IGRyb3AgdGFyZ2V0IGZvciBhbnkgb2YgdGhlIGdpdmVuIHZlcnRpY2VzXHJcbiAgICogQHBhcmFtIHZlcnRpY2VzXHJcbiAgICogQHJldHVybnMgT2JqZWN0IHRoYXQgaW5kaWNhdGVzIHRoZSB0d28gdmVydGljZXMgYmVzdCBzdWl0ZWQgZm9yIGNvbm5lY3RpbmcgYXMgeyBzcmM6IFZlcnRleCwgZHN0OiBWZXJ0ZXggfSxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIG9yIG51bGwgaWYgbm8gbWF0Y2ggaXMgc3VpdGFibGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRCZXN0RHJvcFRhcmdldCggdmVydGljZXM6IFZlcnRleFtdICk6IHsgc3JjOiBWZXJ0ZXg7IGRzdDogVmVydGV4IH0gfCBudWxsIHtcclxuICAgIGNvbnN0IGFsbERyb3BUYXJnZXRzID0gdGhpcy5nZXRBbGxEcm9wVGFyZ2V0cyggdmVydGljZXMgKTtcclxuICAgIGlmICggYWxsRHJvcFRhcmdldHMgKSB7XHJcbiAgICAgIGNvbnN0IHNvcnRlZCA9IF8uc29ydEJ5KCBhbGxEcm9wVGFyZ2V0cywgZHJvcFRhcmdldCA9PlxyXG4gICAgICAgIGRyb3BUYXJnZXQuc3JjLnVuc25hcHBlZFBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIGRyb3BUYXJnZXQuZHN0LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKVxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gc29ydGVkWyAwIF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSB2aWV3XHJcbiAgICovXHJcbiAgcHVibGljIHN0ZXAoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gcGFpbnQgZGlydHkgZml4ZWQgbGVuZ3RoIGNpcmN1aXQgZWxlbWVudCBub2Rlcy4gIFRoaXMgYmF0Y2hlcyBjaGFuZ2VzIGluc3RlYWQgb2YgYXBwbHlpbmcgbXVsdGlwbGUgY2hhbmdlc1xyXG4gICAgLy8gcGVyIGZyYW1lXHJcbiAgICB0aGlzLmNpcmN1aXQuY2lyY3VpdEVsZW1lbnRzLmZvckVhY2goIGNpcmN1aXRFbGVtZW50ID0+IHRoaXMuZ2V0Q2lyY3VpdEVsZW1lbnROb2RlKCBjaXJjdWl0RWxlbWVudCApLnN0ZXAoKSApO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdERlYnVnTGF5ZXIgJiYgdGhpcy5jaXJjdWl0RGVidWdMYXllci5zdGVwKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHZlcnRleCBjYW4gYmUgZHJhZ2dlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYW5EcmFnVmVydGV4KCB2ZXJ0ZXg6IFZlcnRleCApOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHZlcnRpY2VzID0gdGhpcy5jaXJjdWl0LmZpbmRBbGxGaXhlZFZlcnRpY2VzKCB2ZXJ0ZXggKTtcclxuXHJcbiAgICAvLyBJZiBhbnkgb2YgdGhlIHZlcnRpY2VzIGluIHRoZSBzdWJncmFwaCBpcyBhbHJlYWR5IGJlaW5nIGRyYWdnZWQsIHRoZW4gdGhpcyB2ZXJ0ZXggY2Fubm90IGJlIGRyYWdnZWQuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB2ZXJ0aWNlc1sgaSBdLmlzRHJhZ2dlZCApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcmsgdGhlIHZlcnRleCBhbmQgaXRzIGZpeGVkIGNvbm5lY3RlZCB2ZXJ0aWNlcyBhcyBiZWluZyBkcmFnZ2VkLCBzbyB0aGV5IGNhbm5vdCBiZSBkcmFnZ2VkIGJ5IGFueSBvdGhlciBwb2ludGVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRWZXJ0aWNlc0RyYWdnaW5nKCB2ZXJ0ZXg6IFZlcnRleCApOiB2b2lkIHtcclxuICAgIGNvbnN0IHZlcnRpY2VzID0gdGhpcy5jaXJjdWl0LmZpbmRBbGxGaXhlZFZlcnRpY2VzKCB2ZXJ0ZXggKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB2ZXJ0aWNlc1sgaSBdLmlzRHJhZ2dlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiBhIFZlcnRleCBkcmFnIGJlZ2lucywgcmVjb3JkcyB0aGUgcmVsYXRpdmUgY2xpY2sgcG9pbnRcclxuICAgKi9cclxuICBwdWJsaWMgc3RhcnREcmFnVmVydGV4KCBwb2ludDogVmVjdG9yMiwgdmVydGV4OiBWZXJ0ZXgsIGRyYWdnZWRPYmplY3Q6IENpcmN1aXRFbGVtZW50IHwgVmVydGV4ICk6IHZvaWQge1xyXG5cclxuICAgIC8vIElmIGl0IGlzIHRoZSBlZGdlIG9mIGEgZml4ZWQgbGVuZ3RoIGNpcmN1aXQgZWxlbWVudCwgdGhlIGVsZW1lbnQgcm90YXRlcyBhbmQgbW92ZXMgdG93YXJkIHRoZSBtb3VzZVxyXG4gICAgY29uc3QgdmVydGV4Tm9kZSA9IHRoaXMuZ2V0VmVydGV4Tm9kZSggdmVydGV4ICk7XHJcbiAgICB2ZXJ0ZXhOb2RlLnN0YXJ0T2Zmc2V0ID0gdmVydGV4Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBwb2ludCApLm1pbnVzKCB2ZXJ0ZXgudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIGlmICggdGhpcy5jaXJjdWl0LnNlbGVjdGlvblByb3BlcnR5LnZhbHVlICE9PSBkcmFnZ2VkT2JqZWN0ICkge1xyXG4gICAgICB0aGlzLmNpcmN1aXQuc2VsZWN0aW9uUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmVydGljZXMgY29ubmVjdGVkIHRvIHRoZSBibGFjayBib3ggY2Fubm90IGJlIG1vdmVkLCBidXQgdGhleSBjYW4gYmUgcm90YXRlZC4gIENhbGxlZCB3aGVuIGRyYWdnaW5nIGEgc3ViY2lyY3VpdC5cclxuICAgKi9cclxuICBwcml2YXRlIHJvdGF0ZUFib3V0Rml4ZWRQaXZvdCggcG9pbnQ6IFZlY3RvcjIsIHZlcnRleDogVmVydGV4LCBva1RvUm90YXRlOiBib29sZWFuLCB2ZXJ0ZXhOb2RlOiBWZXJ0ZXhOb2RlLCBwb3NpdGlvbjogVmVjdG9yMiwgbmVpZ2hib3JzOiBDaXJjdWl0RWxlbWVudFtdLCB2ZXJ0aWNlczogVmVydGV4W10gKTogdm9pZCB7XHJcblxyXG4gICAgLy8gRG9uJ3QgdHJhdmVyc2UgYWNyb3NzIHRoZSBibGFjayBib3ggaW50ZXJmYWNlLCBvciBpdCB3b3VsZCByb3RhdGUgb2JqZWN0cyBvbiB0aGUgb3RoZXIgc2lkZVxyXG4gICAgdmVydGljZXMgPSB0aGlzLmNpcmN1aXQuZmluZEFsbEZpeGVkVmVydGljZXMoIHZlcnRleCwgY3VycmVudFZlcnRleCA9PiAhY3VycmVudFZlcnRleC5ibGFja0JveEludGVyZmFjZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICBjb25zdCBmaXhlZE5laWdoYm9ycyA9IG5laWdoYm9ycy5maWx0ZXIoIG5laWdoYm9yID0+IG5laWdoYm9yLmdldE9wcG9zaXRlVmVydGV4KCB2ZXJ0ZXggKS5ibGFja0JveEludGVyZmFjZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICBpZiAoIGZpeGVkTmVpZ2hib3JzLmxlbmd0aCA9PT0gMSApIHtcclxuICAgICAgY29uc3QgZml4ZWROZWlnaGJvciA9IGZpeGVkTmVpZ2hib3JzWyAwIF07XHJcbiAgICAgIGlmICggZml4ZWROZWlnaGJvciBpbnN0YW5jZW9mIEZpeGVkQ2lyY3VpdEVsZW1lbnQgKSB7XHJcbiAgICAgICAgY29uc3QgZml4ZWRWZXJ0ZXggPSBmaXhlZE5laWdoYm9yLmdldE9wcG9zaXRlVmVydGV4KCB2ZXJ0ZXggKTtcclxuICAgICAgICBjb25zdCBkZXNpcmVkQW5nbGUgPSBwb3NpdGlvbi5taW51cyggZml4ZWRWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApLmFuZ2xlO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggZGVzaXJlZEFuZ2xlICksICdhbmdsZSBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGZpeGVkTmVpZ2hib3IuZGlzdGFuY2VCZXR3ZWVuVmVydGljZXMgfHwgZml4ZWROZWlnaGJvci5sZW5ndGhQcm9wZXJ0eSEuZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgaW5kZXhPZkZpeGVkVmVydGV4ID0gdmVydGljZXMuaW5kZXhPZiggZml4ZWRWZXJ0ZXggKTtcclxuICAgICAgICB2ZXJ0aWNlcy5zcGxpY2UoIGluZGV4T2ZGaXhlZFZlcnRleCwgMSApO1xyXG5cclxuICAgICAgICBjb25zdCBkZXN0ID0gVmVjdG9yMi5jcmVhdGVQb2xhciggbGVuZ3RoLCBkZXNpcmVkQW5nbGUgKS5wbHVzKCBmaXhlZFZlcnRleC5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgY29uc3Qgc3JjID0gdmVydGV4LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgZGVsdGEgPSBkZXN0Lm1pbnVzKCBzcmMgKTtcclxuICAgICAgICBjb25zdCByZWxhdGl2ZSA9IFZlY3RvcjIuY3JlYXRlUG9sYXIoIGxlbmd0aCwgZGVzaXJlZEFuZ2xlICsgTWF0aC5QSSApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc05hTiggcmVsYXRpdmUueCApLCAneCBzaG91bGQgYmUgYSBudW1iZXInICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWlzTmFOKCByZWxhdGl2ZS55ICksICd5IHNob3VsZCBiZSBhIG51bWJlcicgKTtcclxuXHJcbiAgICAgICAgLy8gRG8gbm90IHByb3Bvc2UgYXR0YWNobWVudHMsIHNpbmNlIGNvbm5lY3Rpb25zIGNhbm5vdCBiZSBtYWRlIGZyb20gYSByb3RhdGlvbi5cclxuICAgICAgICBjb25zdCBhdHRhY2hhYmxlOiBWZXJ0ZXhbXSA9IFtdO1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlVmVydGV4R3JvdXAoIHZlcnRleCwgdmVydGljZXMsIGRlbHRhLCAoKSA9PiB2ZXJ0ZXgudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIGZpeGVkVmVydGV4LnVuc25hcHBlZFBvc2l0aW9uUHJvcGVydHkuZ2V0KCkubWludXMoIHJlbGF0aXZlICkgKSwgYXR0YWNoYWJsZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEcmFnIGEgdmVydGV4LlxyXG4gICAqIEBwYXJhbSBwb2ludCAtIHRoZSB0b3VjaCBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB2ZXJ0ZXggLSB0aGUgdmVydGV4IHRoYXQgaXMgYmVpbmcgZHJhZ2dlZFxyXG4gICAqIEBwYXJhbSBva1RvUm90YXRlIC0gdHJ1ZSBpZiBpdCBpcyBhbGxvd2VkIHRvIHJvdGF0ZSBhZGphY2VudCBDaXJjdWl0RWxlbWVudHNcclxuICAgKi9cclxuICBwdWJsaWMgZHJhZ1ZlcnRleCggcG9pbnQ6IFZlY3RvcjIsIHZlcnRleDogVmVydGV4LCBva1RvUm90YXRlOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgY29uc3QgdmVydGV4Tm9kZSA9IHRoaXMuZ2V0VmVydGV4Tm9kZSggdmVydGV4ICk7XHJcblxyXG4gICAgLy8gR3VhcmQgYWdhaW5zdCB0aGUgY2FzZSBpbiB3aGljaCB0aGUgYmF0dGVyeSBpcyBmbGlwcGVkIHdoaWxlIGRyYWdnaW5nLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vaXNzdWVzLzQxNlxyXG4gICAgaWYgKCB2ZXJ0ZXhOb2RlLnN0YXJ0T2Zmc2V0ICkge1xyXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHZlcnRleE5vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggcG9pbnQgKS5zdWJ0cmFjdCggdmVydGV4Tm9kZS5zdGFydE9mZnNldCApO1xyXG5cclxuICAgICAgLy8gSWYgaXQgaXMgdGhlIGVkZ2Ugb2YgYSBmaXhlZCBsZW5ndGggY2lyY3VpdCBlbGVtZW50LCB0aGUgZWxlbWVudCByb3RhdGVzIGFuZCBtb3ZlcyB0b3dhcmQgdGhlIG1vdXNlXHJcbiAgICAgIGNvbnN0IG5laWdoYm9ycyA9IHRoaXMuY2lyY3VpdC5nZXROZWlnaGJvckNpcmN1aXRFbGVtZW50cyggdmVydGV4ICk7XHJcblxyXG4gICAgICAvLyBGaW5kIGFsbCB2ZXJ0aWNlcyBjb25uZWN0ZWQgYnkgZml4ZWQgbGVuZ3RoIG5vZGVzLlxyXG4gICAgICBjb25zdCB2ZXJ0aWNlcyA9IHRoaXMuY2lyY3VpdC5maW5kQWxsRml4ZWRWZXJ0aWNlcyggdmVydGV4ICk7XHJcblxyXG4gICAgICAvLyBJZiBhbnkgb2YgdGhlIHZlcnRpY2VzIGNvbm5lY3RlZCBieSBmaXhlZCBsZW5ndGggbm9kZXMgaXMgaW1tb2JpbGUsIHRoZW4gdGhlIGVudGlyZSBzdWJncmFwaCBjYW5ub3QgYmUgbW92ZWRcclxuICAgICAgbGV0IHJvdGF0ZWQgPSBmYWxzZTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCAhdmVydGljZXNbIGkgXS5pc0RyYWdnYWJsZVByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICAgIC8vIFNlZSAjMTA4IG11bHRpcGxlIG9iamVjdHMgY29ubmVjdGVkIHRvIHRoZSBzYW1lIG9yaWdpbiB2ZXJ0ZXggY2FuIGNhdXNlIHByb2JsZW1zLlxyXG4gICAgICAgICAgLy8gUmVzdHJpY3Qgb3Vyc2VsdmVzIHRvIHRoZSBjYXNlIHdoZXJlIG9uZSB3aXJlIGlzIGF0dGFjaGVkXHJcbiAgICAgICAgICBpZiAoIG5laWdoYm9ycy5sZW5ndGggPT09IDEgKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm90YXRlQWJvdXRGaXhlZFBpdm90KCBwb2ludCwgdmVydGV4LCBva1RvUm90YXRlLCB2ZXJ0ZXhOb2RlLCBwb3NpdGlvbiwgbmVpZ2hib3JzLCB2ZXJ0aWNlcyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcm90YXRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICggcm90YXRlZCApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggb2tUb1JvdGF0ZSAmJiBuZWlnaGJvcnMubGVuZ3RoID09PSAxICYmIG5laWdoYm9yc1sgMCBdIGluc3RhbmNlb2YgRml4ZWRDaXJjdWl0RWxlbWVudCApIHtcclxuXHJcbiAgICAgICAgY29uc3Qgb3Bwb3NpdGVWZXJ0ZXggPSBuZWlnaGJvcnNbIDAgXS5nZXRPcHBvc2l0ZVZlcnRleCggdmVydGV4ICk7XHJcblxyXG4gICAgICAgIC8vIEZpbmQgdGhlIG5ldyByZWxhdGl2ZSBhbmdsZVxyXG4gICAgICAgIGxldCBhbmdsZTtcclxuXHJcbiAgICAgICAgaWYgKCB2ZXJ0ZXgudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ID09PSB2ZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICYmXHJcbiAgICAgICAgICAgICB2ZXJ0ZXgudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ID09PSB2ZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICkge1xyXG5cclxuICAgICAgICAgIC8vIFJvdGF0ZSB0aGUgd2F5IHRoZSBlbGVtZW50IGlzIGdvaW5nLlxyXG4gICAgICAgICAgYW5nbGUgPSBwb3NpdGlvbi5taW51cyggb3Bwb3NpdGVWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApLmFuZ2xlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBMb2NrIGluIHRoZSBhbmdsZSBpZiBhIG1hdGNoIGlzIHByb3Bvc2VkLCBvdGhlcndpc2UgdGhpbmdzIHJvdGF0ZSB1bmNvbnRyb2xsYWJseVxyXG4gICAgICAgICAgYW5nbGUgPSB2ZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5taW51cyggb3Bwb3NpdGVWZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApLmFuZ2xlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTWFpbnRhaW4gZml4ZWQgbGVuZ3RoXHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gbmVpZ2hib3JzWyAwIF0uZGlzdGFuY2VCZXR3ZWVuVmVydGljZXM7XHJcbiAgICAgICAgY29uc3QgcmVsYXRpdmUgPSBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBsZW5ndGgsIGFuZ2xlICsgTWF0aC5QSSApO1xyXG4gICAgICAgIGNvbnN0IG9wcG9zaXRlUG9zaXRpb24gPSBwb3NpdGlvbi5wbHVzKCByZWxhdGl2ZSApO1xyXG5cclxuICAgICAgICBjb25zdCByb3RhdGlvbkRlbHRhID0gb3Bwb3NpdGVQb3NpdGlvbi5taW51cyggb3Bwb3NpdGVWZXJ0ZXgudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgICAgICB0aGlzLnRyYW5zbGF0ZVZlcnRleEdyb3VwKCB2ZXJ0ZXgsIHZlcnRpY2VzLCByb3RhdGlvbkRlbHRhLCAoKSA9PiB2ZXJ0ZXgudW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG9wcG9zaXRlVmVydGV4LnVuc25hcHBlZFBvc2l0aW9uUHJvcGVydHkuZ2V0KCkubWludXMoIHJlbGF0aXZlICkgKSxcclxuXHJcbiAgICAgICAgICAvLyBhbGxvdyBhbnkgdmVydGV4IGNvbm5lY3RlZCBieSBmaXhlZCBsZW5ndGggZWxlbWVudHMgdG8gc25hcCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2lzc3Vlcy8yNTRcclxuICAgICAgICAgIHZlcnRpY2VzXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbkRlbHRhID0gcG9zaXRpb24ubWludXMoIHZlcnRleC51bnNuYXBwZWRQb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgdGhpcy50cmFuc2xhdGVWZXJ0ZXhHcm91cCggdmVydGV4LCB2ZXJ0aWNlcywgdHJhbnNsYXRpb25EZWx0YSwgbnVsbCwgdmVydGljZXMgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNsYXRlIGEgZ3JvdXAgb2YgdmVydGljZXMsIHVzZWQgd2hlbiBkcmFnZ2luZyBieSBhIGNpcmN1aXQgZWxlbWVudCBvciBieSBhIG9uZS1uZWlnaGJvciB2ZXJ0ZXhcclxuICAgKlxyXG4gICAqIE5vdGU6IERvIG5vdCBjb25mdXNlIHRoaXMgd2l0aCBDaXJjdWl0LnRyYW5zbGF0ZVZlcnRleEdyb3VwIHdoaWNoIGRvZXMgbm90IGNvbnNpZGVyIGNvbm5lY3Rpb25zIHdoaWxlIGRyYWdnaW5nXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdmVydGV4IC0gdGhlIHZlcnRleCBiZWluZyBkcmFnZ2VkXHJcbiAgICogQHBhcmFtIHZlcnRpY2VzIC0gYWxsIHRoZSB2ZXJ0aWNlcyBpbiB0aGUgZ3JvdXBcclxuICAgKiBAcGFyYW0gdW5zbmFwcGVkRGVsdGEgLSBob3cgZmFyIHRvIG1vdmUgdGhlIGdyb3VwXHJcbiAgICogQHBhcmFtIHVwZGF0ZVBvc2l0aW9ucyAtIG9wdGlvbmFsIGNhbGxiYWNrIGZvciB1cGRhdGluZyBwb3NpdGlvbnMgYWZ0ZXIgdW5zbmFwcGVkIHBvc2l0aW9ucyB1cGRhdGVcclxuICAgKiBAcGFyYW0gYXR0YWNoYWJsZSAtIHRoZSBub2RlcyB0aGF0IGFyZSBjYW5kaWRhdGVzIGZvciBhdHRhY2htZW50XHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0cmFuc2xhdGVWZXJ0ZXhHcm91cCggdmVydGV4OiBWZXJ0ZXgsIHZlcnRpY2VzOiBWZXJ0ZXhbXSwgdW5zbmFwcGVkRGVsdGE6IFZlY3RvcjIsIHVwZGF0ZVBvc2l0aW9uczogKCAoKSA9PiB2b2lkICkgfCBudWxsLCBhdHRhY2hhYmxlOiBWZXJ0ZXhbXSApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBzY3JlZW5Cb3VuZHMgPSB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMucGFyZW50VG9Mb2NhbEJvdW5kcyggc2NyZWVuQm91bmRzICk7XHJcblxyXG4gICAgLy8gTW9kaWZ5IHRoZSBkZWx0YSB0byBndWFyYW50ZWUgYWxsIHZlcnRpY2VzIHJlbWFpbiBpbiBib3VuZHNcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBwcm9wb3NlZFBvc2l0aW9uID0gdmVydGljZXNbIGkgXS51bnNuYXBwZWRQb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXMoIHVuc25hcHBlZERlbHRhICk7XHJcbiAgICAgIGlmICggIWJvdW5kcy5jb250YWluc1BvaW50KCBwcm9wb3NlZFBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgY29uc3QgY2xvc2VzdFBvc2l0aW9uID0gYm91bmRzLmdldENsb3Nlc3RQb2ludCggcHJvcG9zZWRQb3NpdGlvbi54LCBwcm9wb3NlZFBvc2l0aW9uLnkgKTtcclxuICAgICAgICBjb25zdCBrZWVwSW5Cb3VuZHNEZWx0YSA9IGNsb3Nlc3RQb3NpdGlvbi5taW51cyggcHJvcG9zZWRQb3NpdGlvbiApO1xyXG4gICAgICAgIHVuc25hcHBlZERlbHRhID0gdW5zbmFwcGVkRGVsdGEucGx1cygga2VlcEluQm91bmRzRGVsdGEgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgdW5zbmFwcGVkIHBvc2l0aW9uIG9mIHRoZSBlbnRpcmUgc3ViZ3JhcGgsIGkuZS4gd2hlcmUgaXQgd291bGQgYmUgaWYgbm8gbWF0Y2hlcyBhcmUgcHJvcG9zZWQuXHJcbiAgICAvLyBNdXN0IGRvIHRoaXMgYmVmb3JlIGNhbGxpbmcgZ2V0QmVzdERyb3BUYXJnZXQsIGJlY2F1c2UgdGhlIHVuc25hcHBlZCBwb3NpdGlvbnMgYXJlIHVzZWQgZm9yIHRhcmdldCBtYXRjaGluZ1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHVuc25hcHBlZFBvc2l0aW9uID0gdmVydGljZXNbIGkgXS51bnNuYXBwZWRQb3NpdGlvblByb3BlcnR5LmdldCgpLnBsdXMoIHVuc25hcHBlZERlbHRhICk7XHJcbiAgICAgIHZlcnRpY2VzWyBpIF0udW5zbmFwcGVkUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIHVuc25hcHBlZFBvc2l0aW9uICk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUG9zaXRpb25zICYmIHVwZGF0ZVBvc2l0aW9ucygpO1xyXG5cclxuICAgIC8vIElzIHRoZXJlIGEgbmVhcmJ5IHZlcnRleCBhbnkgb2YgdGhlc2UgY291bGQgc25hcCB0bz8gIElmIHNvLCBtb3ZlIHRvIGl0cyBwb3NpdGlvbiB0ZW1wb3JhcmlseS5cclxuICAgIC8vIEZpbmQgZHJvcCB0YXJnZXRzIGZvciAqYW55KiBvZiB0aGUgZHJhZ2dlZCB2ZXJ0aWNlc1xyXG4gICAgY29uc3QgYmVzdERyb3BUYXJnZXQgPSB0aGlzLmdldEJlc3REcm9wVGFyZ2V0KCBhdHRhY2hhYmxlICk7XHJcbiAgICBsZXQgZGVsdGEgPSBWZWN0b3IyLlpFUk87XHJcbiAgICBpZiAoIGJlc3REcm9wVGFyZ2V0ICkge1xyXG4gICAgICBjb25zdCBzcmNVbnNuYXBwZWRQb3NpdGlvbiA9IGJlc3REcm9wVGFyZ2V0LnNyYy51bnNuYXBwZWRQb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICBkZWx0YSA9IGJlc3REcm9wVGFyZ2V0LmRzdC51bnNuYXBwZWRQb3NpdGlvblByb3BlcnR5LmdldCgpLm1pbnVzKCBzcmNVbnNuYXBwZWRQb3NpdGlvbiApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIGRlbHRhLnggKSwgJ3ggc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIGRlbHRhLnkgKSwgJ3kgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyYW5zbGF0ZSBhbGwgbm9kZXMgYXMgYSBiYXRjaCBiZWZvcmUgbm90aWZ5aW5nIG9ic2VydmVycyBzbyB3ZSBkb24ndCBlbmQgdXAgd2l0aCBhIGJhZCB0cmFuc2llbnQgc3RhdGVcclxuICAgIC8vIGluIHdoaWNoIHR3byBvciBtb3JlIHZlcnRpY2VzIGZyb20gb25lIEZpeGVkQ2lyY3VpdEVsZW1lbnQgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvNDEyXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSB2ZXJ0aWNlc1sgaSBdLnVuc25hcHBlZFBvc2l0aW9uUHJvcGVydHkuZ2V0KCkucGx1cyggZGVsdGEgKTtcclxuICAgICAgY29uc3QgcG9zaXRpb25SZWZlcmVuY2UgPSB2ZXJ0aWNlc1sgaSBdLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIHBvc2l0aW9uUmVmZXJlbmNlLnggPSBuZXdQb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvblJlZmVyZW5jZS55ID0gbmV3UG9zaXRpb24ueTtcclxuICAgIH1cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB2ZXJ0aWNlc1sgaSBdLnBvc2l0aW9uUHJvcGVydHkubm90aWZ5TGlzdGVuZXJzU3RhdGljKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbmQgYSB2ZXJ0ZXggZHJhZy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB2ZXJ0ZXhcclxuICAgKiBAcGFyYW0gZHJhZ2dlZCAtIHRydWUgaWYgdGhlIHZlcnRleCBhY3R1YWxseSBtb3ZlZCB3aXRoIGF0IGxlYXN0IDEgZHJhZyBjYWxsXHJcbiAgICovXHJcbiAgcHVibGljIGVuZERyYWcoIHZlcnRleDogVmVydGV4LCBkcmFnZ2VkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgY29uc3QgdmVydGV4Tm9kZSA9IHRoaXMuZ2V0VmVydGV4Tm9kZSggdmVydGV4ICk7XHJcblxyXG4gICAgLy8gRmluZCBhbGwgdmVydGljZXMgY29ubmVjdGVkIGJ5IGZpeGVkIGxlbmd0aCBub2Rlcy5cclxuICAgIGNvbnN0IHZlcnRpY2VzID0gdGhpcy5jaXJjdWl0LmZpbmRBbGxGaXhlZFZlcnRpY2VzKCB2ZXJ0ZXggKTtcclxuXHJcbiAgICAvLyBJZiBhbnkgb2YgdGhlIHZlcnRpY2VzIGNvbm5lY3RlZCBieSBmaXhlZCBsZW5ndGggbm9kZXMgaXMgaW1tb2JpbGUsIHRoZW4gdGhlIGVudGlyZSBzdWJncmFwaCBjYW5ub3QgYmUgbW92ZWRcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB2ZXJ0aWNlc1sgaSBdLmlzRHJhZ2dlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIGFueSBvZiB0aGUgdmVydGljZXMgY29ubmVjdGVkIGJ5IGZpeGVkIGxlbmd0aCBub2RlcyBpcyBpbW1vYmlsZSwgdGhlbiB0aGUgZW50aXJlIHN1YmdyYXBoIGNhbm5vdCBiZSBtb3ZlZFxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggIXZlcnRpY2VzWyBpIF0uaXNEcmFnZ2FibGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBiZXN0RHJvcFRhcmdldCA9IHRoaXMuZ2V0QmVzdERyb3BUYXJnZXQoIHZlcnRpY2VzICk7XHJcbiAgICBpZiAoIGJlc3REcm9wVGFyZ2V0ICYmIGRyYWdnZWQgKSB7XHJcbiAgICAgIHRoaXMuY2lyY3VpdC5jb25uZWN0KCBiZXN0RHJvcFRhcmdldC5zcmMsIGJlc3REcm9wVGFyZ2V0LmRzdCApO1xyXG5cclxuICAgICAgLy8gU2V0IHRoZSBuZXcgcmVmZXJlbmNlIHBvaW50IGZvciBuZXh0IGRyYWdcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgdmVydGljZXNbIGkgXS51bnNuYXBwZWRQb3NpdGlvblByb3BlcnR5LnNldCggdmVydGljZXNbIGkgXS5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHZlcnRleE5vZGUuc3RhcnRPZmZzZXQgPSBudWxsO1xyXG5cclxuICAgIC8vIFNpZ25pZnkgdGhhdCBzb21ldGhpbmcgaGFzIGJlZW4gZHJvcHBlZCBpbiB0aGUgcGxheSBhcmVhLCB0byBzaG93IHRoZSBlZGl0IHBhbmVsLCB1bmxlc3MgZHJvcHBlZCBpbiB0aGUgdG9vbGJveFxyXG4gICAgdGhpcy5jaXJjdWl0LnZlcnRleERyb3BwZWRFbWl0dGVyLmVtaXQoIHZlcnRleCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGNoaWxkIHRvIGEgbGF5ZXIgYmVoaW5kIHRoZSBjb250cm9sIHBhbmVscy5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkQ2hpbGRUb0JhY2tncm91bmQoIGNoaWxkOiBOb2RlICk6IHZvaWQge1xyXG4gICAgdGhpcy5jaXJjdWl0Tm9kZUJhY2tMYXllci5hZGRDaGlsZCggY2hpbGQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBjaGlsZCBmcm9tIHRoZSBsYXllciBiZWhpbmQgdGhlIGNvbnRyb2wgcGFuZWxzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZW1vdmVDaGlsZEZyb21CYWNrZ3JvdW5kKCBjaGlsZDogTm9kZSApOiB2b2lkIHtcclxuICAgIHRoaXMuY2lyY3VpdE5vZGVCYWNrTGF5ZXIucmVtb3ZlQ2hpbGQoIGNoaWxkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIHRoZSB6b29tIGxldmVsIGNoYW5nZXMsIHJlY29tcHV0ZSB0aGUgdmlzaWJsZSBib3VuZHMgaW4gdGhlIGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIENpcmN1aXROb2RlIHNvXHJcbiAgICogdGhhdCBvYmplY3RzIGNhbm5vdCBiZSBkcmFnZ2VkIG91dHNpZGUgdGhlIGJvdW5kYXJ5LlxyXG4gICAqIEBwYXJhbSB2aXNpYmxlQm91bmRzIC0gdmlldyBjb29yZGluYXRlcyBmb3IgdGhlIHZpc2libGUgcmVnaW9uXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZVRyYW5zZm9ybSggdmlzaWJsZUJvdW5kczogQm91bmRzMiApOiB2b2lkIHtcclxuICAgIHRoaXMudmlzaWJsZUJvdW5kc0luQ2lyY3VpdENvb3JkaW5hdGVGcmFtZVByb3BlcnR5LnNldCggdGhpcy5wYXJlbnRUb0xvY2FsQm91bmRzKCB2aXNpYmxlQm91bmRzICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGZvciBhbiBpbnRlcnNlY3Rpb24gYmV0d2VlbiBhIHByb2JlTm9kZSBhbmQgYSB3aXJlLCByZXR1cm4gbnVsbCBpZiBubyBoaXRzLlxyXG4gICAqIEBwYXJhbSBwb3NpdGlvbiB0byBoaXQgdGVzdFxyXG4gICAqIEBwYXJhbSBmaWx0ZXIgLSBDaXJjdWl0RWxlbWVudD0+Ym9vbGVhbiB0aGUgcnVsZSB0byB1c2UgZm9yIGNoZWNraW5nIGNpcmN1aXQgZWxlbWVudHNcclxuICAgKiBAcGFyYW0gZ2xvYmFsUG9pbnRcclxuICAgKi9cclxuICBwcml2YXRlIGhpdENpcmN1aXRFbGVtZW50Tm9kZSggcG9zaXRpb246IFZlY3RvcjIsIGZpbHRlcjogKCBjOiBDaXJjdWl0RWxlbWVudCApID0+IGJvb2xlYW4sIGdsb2JhbFBvaW50OiBWZWN0b3IyIHwgbnVsbCApOiBDaXJjdWl0RWxlbWVudE5vZGUgfCBudWxsIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBnbG9iYWxQb2ludCAhPT0gdW5kZWZpbmVkICk7XHJcblxyXG4gICAgY29uc3QgY2lyY3VpdEVsZW1lbnROb2RlcyA9IHRoaXMuY2lyY3VpdC5jaXJjdWl0RWxlbWVudHMuZmlsdGVyKCBmaWx0ZXIgKVxyXG4gICAgICAubWFwKCBjaXJjdWl0RWxlbWVudCA9PiB0aGlzLmdldENpcmN1aXRFbGVtZW50Tm9kZSggY2lyY3VpdEVsZW1lbnQgKSApO1xyXG5cclxuICAgIC8vIFNlYXJjaCBmcm9tIHRoZSBmcm9udCB0byB0aGUgYmFjaywgYmVjYXVzZSBmcm9udG1vc3Qgb2JqZWN0cyBsb29rIGxpa2UgdGhleSBhcmUgaGl0dGluZyB0aGUgc2Vuc29yLCBzZWUgIzE0M1xyXG4gICAgZm9yICggbGV0IGkgPSBjaXJjdWl0RWxlbWVudE5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICBjb25zdCBjaXJjdWl0RWxlbWVudE5vZGUgPSBjaXJjdWl0RWxlbWVudE5vZGVzWyBpIF07XHJcblxyXG4gICAgICAvLyBJZiB0aGlzIGNvZGUgZ290IGNhbGxlZCBiZWZvcmUgdGhlIFdpcmVOb2RlIGhhcyBiZWVuIGNyZWF0ZWQsIHNraXAgaXQgKHRoZSBWb2x0bWV0ZXIgaGl0IHRlc3RzIG5vZGVzKVxyXG4gICAgICBpZiAoICFjaXJjdWl0RWxlbWVudE5vZGUgKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIERvbid0IGNvbm5lY3QgdG8gd2lyZXMgaW4gdGhlIGJsYWNrIGJveFxyXG4gICAgICBsZXQgcmV2ZWFsaW5nID0gdHJ1ZTtcclxuICAgICAgY29uc3QgdHJ1ZUJsYWNrQm94ID0gY2lyY3VpdEVsZW1lbnROb2RlLmNpcmN1aXRFbGVtZW50Lmluc2lkZVRydWVCbGFja0JveFByb3BlcnR5LmdldCgpO1xyXG4gICAgICBpZiAoIHRydWVCbGFja0JveCApIHtcclxuICAgICAgICByZXZlYWxpbmcgPSB0aGlzLm1vZGVsLnJldmVhbGluZ1Byb3BlcnR5LmdldCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHJldmVhbGluZyAmJiBjaXJjdWl0RWxlbWVudE5vZGUuY29udGFpbnNTZW5zb3JQb2ludCggZ2xvYmFsUG9pbnQhICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGNpcmN1aXRFbGVtZW50Tm9kZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kIHdoZXJlIHRoZSB2b2x0bWV0ZXIgcHJvYmUgbm9kZSBpbnRlcnNlY3RzIHRoZSB3aXJlLCBmb3IgY29tcHV0aW5nIHRoZSB2b2x0YWdlIGRpZmZlcmVuY2UgdG8gZGlzcGxheSBpbiB0aGVcclxuICAgKiB2b2x0bWV0ZXIuXHJcbiAgICogQHBhcmFtIHByb2JlUG9zaXRpb24gLSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgQ2lyY3VpdE5vZGVcclxuICAgKiBAcmV0dXJucyBWb2x0YWdlQ29ubmVjdGlvbiBpZiBjb25uZWN0ZWQsIG90aGVyd2lzZSBudWxsXHJcbiAgICovXHJcbiAgcHVibGljIGdldFZvbHRhZ2VDb25uZWN0aW9uKCBwcm9iZVBvc2l0aW9uOiBWZWN0b3IyICk6IFZvbHRhZ2VDb25uZWN0aW9uIHwgbnVsbCB7XHJcblxyXG4gICAgY29uc3QgZ2xvYmFsUG9pbnQgPSB0aGlzLmxvY2FsVG9HbG9iYWxQb2ludCggcHJvYmVQb3NpdGlvbiApO1xyXG5cclxuICAgIC8vIENoZWNrIGZvciBpbnRlcnNlY3Rpb24gd2l0aCBhIHZlcnRleCwgdXNpbmcgdGhlIHNvbGRlciByYWRpdXMuICBUaGlzIG1lYW5zIGl0IHdpbGwgYmUgcG9zc2libGUgdG8gY2hlY2sgZm9yXHJcbiAgICAvLyB2b2x0YWdlcyB3aGVuIG5lYXJieSB0aGUgdGVybWluYWwgb2YgYSBiYXR0ZXJ5LCBub3QgbmVjZXNzYXJpbHkgdG91Y2hpbmcgdGhlIGJhdHRlcnkgKGV2ZW4gd2hlbiBzb2xkZXIgaXNcclxuICAgIC8vIG5vdCBzaG93biwgdGhpcyBpcyBkZXNpcmFibGUgc28gdGhhdCBzdHVkZW50cyBoYXZlIGEgaGlnaGVyIGNoYW5jZSBvZiBnZXR0aW5nIHRoZSBkZXNpcmFibGUgcmVhZGluZykuXHJcbiAgICAvLyBXaGVuIHNvbGRlciBpcyBzaG93biwgaXQgaXMgdXNlZCBhcyB0aGUgY29uZHVjdGl2ZSBlbGVtZW50IGZvciB0aGUgdm9sdG1ldGVyIChhbmQgaGVuY2Ugd2h5IHRoZSBzb2xkZXIgcmFkaXVzXHJcbiAgICAvLyBpcyB1c2VkIGluIHRoZSBjb21wdXRhdGlvbiBiZWxvdy5cclxuICAgIGNvbnN0IHNvbGRlck5vZGVzID0gXy52YWx1ZXMoIHRoaXMuc29sZGVyTm9kZXMgKTtcclxuICAgIGNvbnN0IGhpdFNvbGRlck5vZGUgPSBfLmZpbmQoIHNvbGRlck5vZGVzLCAoIHNvbGRlck5vZGU6IFNvbGRlck5vZGUgKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gc29sZGVyTm9kZS52ZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgcmV0dXJuIHByb2JlUG9zaXRpb24uZGlzdGFuY2UoIHBvc2l0aW9uICkgPD0gU29sZGVyTm9kZS5TT0xERVJfUkFESVVTO1xyXG4gICAgfSApO1xyXG4gICAgaWYgKCBoaXRTb2xkZXJOb2RlICkge1xyXG4gICAgICByZXR1cm4gbmV3IFZvbHRhZ2VDb25uZWN0aW9uKCBoaXRTb2xkZXJOb2RlLnZlcnRleCwgbnVsbCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGZvciBpbnRlcnNlY3Rpb24gd2l0aCBhIG1ldGFsbGljIGNpcmN1aXQgZWxlbWVudCwgd2hpY2ggY2FuIHByb3ZpZGUgdm9sdG1ldGVyIHJlYWRpbmdzXHJcbiAgICBjb25zdCBtZXRhbGxpY0NpcmN1aXRFbGVtZW50ID0gdGhpcy5oaXRDaXJjdWl0RWxlbWVudE5vZGUoIHByb2JlUG9zaXRpb24sICggY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkgPT4gY2lyY3VpdEVsZW1lbnQuaXNNZXRhbGxpYywgZ2xvYmFsUG9pbnQgKTtcclxuICAgIGlmICggbWV0YWxsaWNDaXJjdWl0RWxlbWVudCApIHtcclxuXHJcbiAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBtZXRhbGxpY0NpcmN1aXRFbGVtZW50LmNpcmN1aXRFbGVtZW50LnN0YXJ0UG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgY29uc3QgZW5kUG9pbnQgPSBtZXRhbGxpY0NpcmN1aXRFbGVtZW50LmNpcmN1aXRFbGVtZW50LmVuZFBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGNvbnN0IHNlZ21lbnRWZWN0b3IgPSBlbmRQb2ludC5taW51cyggc3RhcnRQb2ludCApO1xyXG4gICAgICBjb25zdCBwcm9iZVZlY3RvciA9IHByb2JlUG9zaXRpb24ubWludXMoIHN0YXJ0UG9pbnQgKTtcclxuICAgICAgbGV0IGRpc3RhbmNlQWxvbmdTZWdtZW50ID0gc2VnbWVudFZlY3Rvci5tYWduaXR1ZGUgPT09IDAgPyAwIDogKCBwcm9iZVZlY3Rvci5kb3QoIHNlZ21lbnRWZWN0b3IgKSAvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudFZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkICk7XHJcbiAgICAgIGRpc3RhbmNlQWxvbmdTZWdtZW50ID0gVXRpbHMuY2xhbXAoIGRpc3RhbmNlQWxvbmdTZWdtZW50LCAwLCAxICk7XHJcblxyXG4gICAgICBjb25zdCB2b2x0YWdlQWxvbmdXaXJlID0gVXRpbHMubGluZWFyKCAwLCAxLFxyXG4gICAgICAgIG1ldGFsbGljQ2lyY3VpdEVsZW1lbnQuY2lyY3VpdEVsZW1lbnQuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKS52b2x0YWdlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgbWV0YWxsaWNDaXJjdWl0RWxlbWVudC5jaXJjdWl0RWxlbWVudC5lbmRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKS52b2x0YWdlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgZGlzdGFuY2VBbG9uZ1NlZ21lbnRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgVm9sdGFnZUNvbm5lY3Rpb24oIG1ldGFsbGljQ2lyY3VpdEVsZW1lbnQuY2lyY3VpdEVsZW1lbnQuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKSwgbWV0YWxsaWNDaXJjdWl0RWxlbWVudC5jaXJjdWl0RWxlbWVudCwgdm9sdGFnZUFsb25nV2lyZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBjaGVjayBmb3IgaW50ZXJzZWN0aW9uIHdpdGggc3dpdGNoIG5vZGVcclxuICAgICAgY29uc3Qgc3dpdGNoTm9kZSA9IHRoaXMuaGl0Q2lyY3VpdEVsZW1lbnROb2RlKCBwcm9iZVBvc2l0aW9uLCAoIGNpcmN1aXRFbGVtZW50OiBDaXJjdWl0RWxlbWVudCApID0+IGNpcmN1aXRFbGVtZW50IGluc3RhbmNlb2YgU3dpdGNoLCBnbG9iYWxQb2ludCApO1xyXG4gICAgICBpZiAoIHN3aXRjaE5vZGUgKSB7XHJcblxyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc3dpdGNoTm9kZSBpbnN0YW5jZW9mIFN3aXRjaE5vZGUgKTtcclxuICAgICAgICBpZiAoIHN3aXRjaE5vZGUgaW5zdGFuY2VvZiBTd2l0Y2hOb2RlICkge1xyXG5cclxuICAgICAgICAgIC8vIGFkZHJlc3MgY2xvc2VkIHN3aXRjaC4gIEZpbmQgb3V0IHdoZXRoZXIgdGhlIHByb2JlIHdhcyBuZWFyIHRoZSBzdGFydCBvciBlbmQgdmVydGV4XHJcbiAgICAgICAgICBpZiAoIHN3aXRjaE5vZGUuc3RhcnRTaWRlQ29udGFpbnNTZW5zb3JQb2ludCggcHJvYmVQb3NpdGlvbiApICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZvbHRhZ2VDb25uZWN0aW9uKCBzd2l0Y2hOb2RlLmNpcmN1aXRTd2l0Y2guc3RhcnRWZXJ0ZXhQcm9wZXJ0eS5nZXQoKSwgc3dpdGNoTm9kZS5jaXJjdWl0RWxlbWVudCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIHN3aXRjaE5vZGUuZW5kU2lkZUNvbnRhaW5zU2Vuc29yUG9pbnQoIHByb2JlUG9zaXRpb24gKSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWb2x0YWdlQ29ubmVjdGlvbiggc3dpdGNoTm9kZS5jaXJjdWl0U3dpdGNoLmVuZFZlcnRleFByb3BlcnR5LmdldCgpLCBzd2l0Y2hOb2RlLmNpcmN1aXRFbGVtZW50ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjYXBhY2l0b3JOb2RlID0gdGhpcy5oaXRDaXJjdWl0RWxlbWVudE5vZGUoIHByb2JlUG9zaXRpb24sICggY2lyY3VpdEVsZW1lbnQ6IENpcmN1aXRFbGVtZW50ICkgPT4gY2lyY3VpdEVsZW1lbnQgaW5zdGFuY2VvZiBDYXBhY2l0b3IsIGdsb2JhbFBvaW50ICk7XHJcbiAgICAgIGlmICggY2FwYWNpdG9yTm9kZSApIHtcclxuXHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjYXBhY2l0b3JOb2RlIGluc3RhbmNlb2YgQ2FwYWNpdG9yQ2lyY3VpdEVsZW1lbnROb2RlICk7XHJcbiAgICAgICAgaWYgKCBjYXBhY2l0b3JOb2RlIGluc3RhbmNlb2YgQ2FwYWNpdG9yQ2lyY3VpdEVsZW1lbnROb2RlICkge1xyXG5cclxuICAgICAgICAgIC8vIENoZWNrIGZyb250IGZpcnN0IHNpbmNlIGl0IHZpc3VhbGx5IGxvb2tzIGxpa2UgaXQgd291bGQgYmUgdG91Y2hpbmcgdGhlIHByb2JlXHJcbiAgICAgICAgICBpZiAoIGNhcGFjaXRvck5vZGUuZnJvbnRTaWRlQ29udGFpbnNTZW5zb3JQb2ludCggZ2xvYmFsUG9pbnQgKSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWb2x0YWdlQ29ubmVjdGlvbiggY2FwYWNpdG9yTm9kZS5jaXJjdWl0RWxlbWVudC5zdGFydFZlcnRleFByb3BlcnR5LmdldCgpLCBjYXBhY2l0b3JOb2RlLmNpcmN1aXRFbGVtZW50ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggY2FwYWNpdG9yTm9kZS5iYWNrU2lkZUNvbnRhaW5zU2Vuc29yUG9pbnQoIGdsb2JhbFBvaW50ICkgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVm9sdGFnZUNvbm5lY3Rpb24oIGNhcGFjaXRvck5vZGUuY2lyY3VpdEVsZW1lbnQuZW5kVmVydGV4UHJvcGVydHkuZ2V0KCksIGNhcGFjaXRvck5vZGUuY2lyY3VpdEVsZW1lbnQgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kIHRoZSBjdXJyZW50IGluIHRoZSBnaXZlbiBsYXllciAoaWYgYW55IENpcmN1aXRFbGVtZW50IGhpdHMgdGhlIHNlbnNvcilcclxuICAgKi9cclxuICBwcml2YXRlIGdldEN1cnJlbnRJbkxheWVyKCBwcm9iZU5vZGU6IE5vZGUsIGxheWVyOiBOb2RlICk6IEFtbWV0ZXJDb25uZWN0aW9uIHwgbnVsbCB7XHJcblxyXG4gICAgY29uc3QgZ2xvYmFsUG9pbnQgPSBwcm9iZU5vZGUucGFyZW50VG9HbG9iYWxQb2ludCggcHJvYmVOb2RlLnRyYW5zbGF0aW9uICk7XHJcblxyXG4gICAgLy8gU2VlIGlmIGFueSBDaXJjdWl0RWxlbWVudE5vZGUgY29udGFpbnMgdGhlIHNlbnNvciBwb2ludFxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGF5ZXIuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNpcmN1aXRFbGVtZW50Tm9kZSA9IGxheWVyLmNoaWxkcmVuWyBpIF07XHJcbiAgICAgIGlmICggY2lyY3VpdEVsZW1lbnROb2RlIGluc3RhbmNlb2YgQ2lyY3VpdEVsZW1lbnROb2RlICkge1xyXG5cclxuICAgICAgICAvLyBUaGlzIGlzIGNhbGxlZCBiZXR3ZWVuIHdoZW4gdGhlIGNpcmN1aXQgZWxlbWVudCBpcyBkaXNwb3NlZCBhbmQgd2hlbiB0aGUgY29ycmVzcG9uZGluZyB2aWV3IGlzIGRpc3Bvc2VkXHJcbiAgICAgICAgLy8gc28gd2UgbXVzdCB0YWtlIGNhcmUgbm90IHRvIHZpc2l0IGNpcmN1aXQgZWxlbWVudHMgdGhhdCBoYXZlIGJlZW4gZGlzcG9zZWQgYnV0IHN0aWxsIGhhdmUgYSB2aWV3XHJcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2lzc3Vlcy80MThcclxuICAgICAgICBpZiAoICFjaXJjdWl0RWxlbWVudE5vZGUuY2lyY3VpdEVsZW1lbnQuY2lyY3VpdEVsZW1lbnREaXNwb3NlZCAmJiBjaXJjdWl0RWxlbWVudE5vZGUuY29udGFpbnNTZW5zb3JQb2ludCggZ2xvYmFsUG9pbnQgKSApIHtcclxuICAgICAgICAgIGxldCByYXdDdXJyZW50ID0gY2lyY3VpdEVsZW1lbnROb2RlLmNpcmN1aXRFbGVtZW50LmN1cnJlbnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICAgIGlmICggY2lyY3VpdEVsZW1lbnROb2RlLmNpcmN1aXRFbGVtZW50LmN1cnJlbnRTZW5zZVByb3BlcnR5LnZhbHVlID09PSBDdXJyZW50U2Vuc2UuQkFDS1dBUkQgKSB7XHJcbiAgICAgICAgICAgIHJhd0N1cnJlbnQgPSAtcmF3Q3VycmVudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBuZXcgQW1tZXRlckNvbm5lY3Rpb24oIGNpcmN1aXRFbGVtZW50Tm9kZS5jaXJjdWl0RWxlbWVudCwgcmF3Q3VycmVudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kIHRoZSBjdXJyZW50IHVuZGVyIHRoZSBnaXZlbiBwcm9iZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDdXJyZW50KCBwcm9iZU5vZGU6IE5vZGUgKTogQW1tZXRlckNvbm5lY3Rpb24gfCBudWxsIHtcclxuICAgIGNvbnN0IG1haW5BbW1ldGVyQ29ubmVjdGlvbiA9IHRoaXMuZ2V0Q3VycmVudEluTGF5ZXIoIHByb2JlTm9kZSwgdGhpcy5maXhlZENpcmN1aXRFbGVtZW50TGF5ZXIgKTtcclxuICAgIGlmICggbWFpbkFtbWV0ZXJDb25uZWN0aW9uICE9PSBudWxsICkge1xyXG4gICAgICByZXR1cm4gbWFpbkFtbWV0ZXJDb25uZWN0aW9uO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRJbkxheWVyKCBwcm9iZU5vZGUsIHRoaXMud2lyZUxheWVyICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnQ2lyY3VpdE5vZGUnLCBDaXJjdWl0Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELFNBQVNDLElB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