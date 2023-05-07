// Copyright 2022-2023, University of Colorado Boulder
/**
 * Some in-simulation utilities designed to help designers and developers
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import MappedProperty from '../../axon/js/MappedProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import MeasuringTapeNode from '../../scenery-phet/js/MeasuringTapeNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { CanvasNode, Circle, Color, Display, DOM, DragListener, FireListener, FlowBox, Font, GridBox, HBox, Image, LayoutNode, Line, LinearGradient, extendsHeightSizable, extendsWidthSizable, Node, NodePattern, Paint, Path, Pattern, PressListener, RadialGradient, Rectangle, RichText, Spacer, Text, Trail, VBox, HSeparator, WebGLNode } from '../../scenery/js/imports.js';
import Panel from '../../sun/js/Panel.js';
import AquaRadioButtonGroup from '../../sun/js/AquaRadioButtonGroup.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Checkbox from '../../sun/js/Checkbox.js';
import inheritance from '../../phet-core/js/inheritance.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationProperty from '../../axon/js/EnumerationProperty.js';
import merge from '../../phet-core/js/merge.js';
import { Shape } from '../../kite/js/imports.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import ExpandCollapseButton from '../../sun/js/ExpandCollapseButton.js';
import { default as createObservableArray } from '../../axon/js/createObservableArray.js';
import optionize from '../../phet-core/js/optionize.js';
import Multilink from '../../axon/js/Multilink.js';
const round = (n, places = 2) => Utils.toFixed(n, places);
class PointerAreaType extends EnumerationValue {
  static MOUSE = new PointerAreaType();
  static TOUCH = new PointerAreaType();
  static NONE = new PointerAreaType();
  static enumeration = new Enumeration(PointerAreaType);
}
const hasHelperNode = node => {
  return !!node.getHelperNode;
};
export default class Helper {
  // Whether we should use the input system for picking, or if we should ignore it (and the flags) for what is visual

  // Whether we should return the leaf-most Trail (instead of finding the one with input listeners)

  // Whether the helper is visible (active) or not

  // Whether the entire helper is visible (or collapsed)

  // Where the current pointer is

  // Whether the pointer is over the UI interface

  // If the user has clicked on a Trail and selected it

  // What Trail the user is over in the tree UI

  // What Trail the pointer is over right now

  // What Trail to show as a preview (and to highlight) - selection overrides what the pointer is over

  // A helper-displayed Node created to help with debugging various types

  // The global shape of what is selected

  // ImageData from the sim

  // The pixel color under the pointer

  constructor(sim, simDisplay) {
    // NOTE: Don't pause the sim, don't use foreign object rasterization (do the smarter instant approach)
    // NOTE: Inform about preserveDrawingBuffer query parameter
    // NOTE: Actually grab/rerender things from WebGL/Canvas, so this works nicely and at a higher resolution
    // NOTE: Scenery drawable tree

    this.sim = sim;
    this.simDisplay = simDisplay;
    this.activeProperty = new TinyProperty(false);
    this.visualTreeVisibleProperty = new BooleanProperty(false, {
      tandem: Tandem.OPT_OUT
    });
    this.pdomTreeVisibleProperty = new BooleanProperty(false, {
      tandem: Tandem.OPT_OUT
    });
    this.underPointerVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.optionsVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.previewVisibleProperty = new BooleanProperty(false, {
      tandem: Tandem.OPT_OUT
    });
    this.selectedNodeContentVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.selectedTrailContentVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.highlightVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.boundsVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.selfBoundsVisibleProperty = new BooleanProperty(false, {
      tandem: Tandem.OPT_OUT
    });
    this.getHelperNodeVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.helperVisibleProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.inputBasedPickingProperty = new BooleanProperty(true, {
      tandem: Tandem.OPT_OUT
    });
    this.useLeafNodeProperty = new BooleanProperty(false, {
      tandem: Tandem.OPT_OUT
    });
    this.pointerAreaTypeProperty = new EnumerationProperty(PointerAreaType.MOUSE, {
      tandem: Tandem.OPT_OUT
    });
    this.pointerPositionProperty = new TinyProperty(Vector2.ZERO);
    this.overInterfaceProperty = new BooleanProperty(false, {
      tandem: Tandem.OPT_OUT
    });
    this.selectedTrailProperty = new TinyProperty(null);
    this.treeHoverTrailProperty = new TinyProperty(null);
    this.pointerTrailProperty = new DerivedProperty([this.pointerPositionProperty, this.overInterfaceProperty, this.pointerAreaTypeProperty, this.inputBasedPickingProperty], (point, overInterface, pointerAreaType, inputBasedPicking) => {
      // We're not over something while we're over an interface
      if (overInterface) {
        return null;
      }
      if (!inputBasedPicking) {
        return visualHitTest(simDisplay.rootNode, point);
      }
      let trail = simDisplay.rootNode.hitTest(point, pointerAreaType === PointerAreaType.MOUSE, pointerAreaType === PointerAreaType.TOUCH);
      if (trail && !this.useLeafNodeProperty.value) {
        while (trail.length > 0 && trail.lastNode().inputListeners.length === 0) {
          trail.removeDescendant();
        }
        if (trail.length === 0) {
          trail = null;
        } else {
          // Repsect TargetNode to be helpful
          const listeners = trail.lastNode().inputListeners;
          const firstListener = listeners[0];
          if (firstListener instanceof PressListener && firstListener.targetNode && firstListener.targetNode !== trail.lastNode() && trail.containsNode(firstListener.targetNode)) {
            trail = trail.subtrailTo(firstListener.targetNode);
          }
        }
      }
      return trail;
    }, {
      tandem: Tandem.OPT_OUT,
      valueComparisonStrategy: 'equalsFunction'
    });
    this.previewTrailProperty = new DerivedProperty([this.selectedTrailProperty, this.treeHoverTrailProperty, this.pointerTrailProperty], (selected, treeHover, active) => {
      return selected ? selected : treeHover ? treeHover : active;
    });
    this.previewShapeProperty = new DerivedProperty([this.previewTrailProperty, this.inputBasedPickingProperty, this.pointerAreaTypeProperty], (previewTrail, inputBasedPicking, pointerAreaType) => {
      if (previewTrail) {
        if (inputBasedPicking) {
          return getShape(previewTrail, pointerAreaType === PointerAreaType.MOUSE, pointerAreaType === PointerAreaType.TOUCH);
        } else {
          return getShape(previewTrail, false, false);
        }
      } else {
        return null;
      }
    });
    this.helperNodeProperty = new DerivedProperty([this.selectedTrailProperty], trail => {
      if (trail) {
        const node = trail.lastNode();
        if (hasHelperNode(node)) {
          return node.getHelperNode();
        } else {
          return null;
        }
      } else {
        return null;
      }
    });
    this.screenViewProperty = new TinyProperty(null);
    this.imageDataProperty = new TinyProperty(null);
    this.colorProperty = new DerivedProperty([this.pointerPositionProperty, this.imageDataProperty], (position, imageData) => {
      if (!imageData) {
        return Color.TRANSPARENT;
      }
      const x = Math.floor(position.x / this.simDisplay.width * imageData.width);
      const y = Math.floor(position.y / this.simDisplay.height * imageData.height);
      const index = 4 * (x + imageData.width * y);
      if (x < 0 || y < 0 || x > imageData.width || y > imageData.height) {
        return Color.TRANSPARENT;
      }
      return new Color(imageData.data[index], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3] / 255);
    }, {
      tandem: Tandem.OPT_OUT
    });
    const fuzzProperty = new BooleanProperty(phet.chipper.queryParameters.fuzz, {
      tandem: Tandem.OPT_OUT
    });
    fuzzProperty.lazyLink(fuzz => {
      phet.chipper.queryParameters.fuzz = fuzz;
    });
    const measuringTapeVisibleProperty = new BooleanProperty(false, {
      tandem: Tandem.OPT_OUT
    });
    const measuringTapeUnitsProperty = new TinyProperty({
      name: 'view units',
      multiplier: 0
    });
    const layoutBoundsProperty = new TinyProperty(Bounds2.NOTHING);
    const helperRoot = new Node({
      renderer: 'svg'
    });
    const positionStringProperty = new MappedProperty(this.pointerPositionProperty, {
      tandem: Tandem.OPT_OUT,
      bidirectional: true,
      map: position => {
        const view = this.screenViewProperty.value;
        if (view) {
          const viewPosition = view.globalToLocalPoint(position);
          return `global: x: ${round(position.x)}, y: ${round(position.y)}<br>view: x: ${round(viewPosition.x)}, y: ${round(viewPosition.y)}`;
        } else {
          return '-';
        }
      }
    });
    const positionText = new RichText(positionStringProperty, {
      font: new PhetFont(12)
    });
    const colorTextMap = color => {
      return `${color.toHexString()} ${color.toCSS()}`;
    };
    const colorStringProperty = new MappedProperty(this.colorProperty, {
      tandem: Tandem.OPT_OUT,
      bidirectional: true,
      map: colorTextMap
    });
    const colorText = new RichText(colorStringProperty, {
      font: new PhetFont(12)
    });
    this.colorProperty.link(color => {
      colorText.fill = Color.getLuminance(color) > 128 ? Color.BLACK : Color.WHITE;
    });
    const boundsColor = new Color('#804000');
    const selfBoundsColor = new Color('#208020');
    const nonInputBasedColor = new Color(255, 100, 0);
    const mouseColor = new Color(0, 0, 255);
    const touchColor = new Color(255, 0, 0);
    const inputBasedColor = new Color(200, 0, 200);
    const highlightBaseColorProperty = new DerivedProperty([this.inputBasedPickingProperty, this.pointerAreaTypeProperty], (inputBasedPicking, pointerAreaType) => {
      if (inputBasedPicking) {
        if (pointerAreaType === PointerAreaType.MOUSE) {
          return mouseColor;
        } else if (pointerAreaType === PointerAreaType.TOUCH) {
          return touchColor;
        } else {
          return inputBasedColor;
        }
      } else {
        return nonInputBasedColor;
      }
    }, {
      tandem: Tandem.OPT_OUT
    });
    const colorBackground = new Panel(colorText, {
      cornerRadius: 0,
      stroke: null,
      fill: this.colorProperty
    });
    const previewNode = new Node({
      visibleProperty: this.previewVisibleProperty
    });
    const previewBackground = new Rectangle(0, 0, 200, 200, {
      fill: new NodePattern(new Node({
        children: [new Rectangle(0, 0, 10, 10, {
          fill: '#ddd'
        }), new Rectangle(10, 10, 10, 10, {
          fill: '#ddd'
        }), new Rectangle(0, 10, 10, 10, {
          fill: '#fafafa'
        }), new Rectangle(10, 0, 10, 10, {
          fill: '#fafafa'
        })]
      }), 2, 0, 0, 20, 20),
      stroke: 'black',
      visibleProperty: this.previewVisibleProperty
    });
    this.previewTrailProperty.link(trail => {
      previewNode.removeAllChildren();
      if (trail) {
        previewNode.addChild(previewBackground);
        const node = trail.lastNode();
        if (node.bounds.isValid()) {
          const scale = window.devicePixelRatio * 0.9 * Math.min(previewBackground.selfBounds.width / node.width, previewBackground.selfBounds.height / node.height);
          previewNode.addChild(new Node({
            scale: scale / window.devicePixelRatio,
            center: previewBackground.center,
            children: [node.rasterized({
              resolution: scale,
              sourceBounds: node.bounds.dilated(node.bounds.width * 0.01).roundedOut()
            })]
          }));
        }
      }
    });
    const selectedNodeContent = new VBox({
      spacing: 3,
      align: 'left',
      visibleProperty: this.selectedNodeContentVisibleProperty
    });
    this.previewTrailProperty.link(trail => {
      selectedNodeContent.children = trail ? createInfo(trail) : [];
    });
    const fuzzCheckbox = new HelperCheckbox(fuzzProperty, 'Fuzz');
    const measuringTapeVisibleCheckbox = new HelperCheckbox(measuringTapeVisibleProperty, 'Measuring Tape');
    const visualTreeVisibleCheckbox = new HelperCheckbox(this.visualTreeVisibleProperty, 'Visual Tree');
    const pdomTreeVisibleCheckbox = new HelperCheckbox(this.pdomTreeVisibleProperty, 'PDOM Tree');
    const inputBasedPickingCheckbox = new HelperCheckbox(this.inputBasedPickingProperty, 'Input-based');
    const useLeafNodeCheckbox = new HelperCheckbox(this.useLeafNodeProperty, 'Use Leaf', {
      enabledProperty: this.inputBasedPickingProperty
    });
    const highlightVisibleCheckbox = new HelperCheckbox(this.highlightVisibleProperty, 'Highlight', {
      labelOptions: {
        fill: highlightBaseColorProperty
      }
    });
    const boundsVisibleCheckbox = new HelperCheckbox(this.boundsVisibleProperty, 'Bounds', {
      labelOptions: {
        fill: boundsColor
      }
    });
    const selfBoundsVisibleCheckbox = new HelperCheckbox(this.selfBoundsVisibleProperty, 'Self Bounds', {
      labelOptions: {
        fill: selfBoundsColor
      }
    });
    const getHelperNodeVisibleCheckbox = new HelperCheckbox(this.getHelperNodeVisibleProperty, 'getHelperNode()');
    const pointerAreaTypeRadioButtonGroup = new AquaRadioButtonGroup(this.pointerAreaTypeProperty, [{
      value: PointerAreaType.MOUSE,
      createNode: tandem => new Text('Mouse', {
        fontSize: 12
      })
    }, {
      value: PointerAreaType.TOUCH,
      createNode: tandem => new Text('Touch', {
        fontSize: 12
      })
    }, {
      value: PointerAreaType.NONE,
      createNode: tandem => new Text('None', {
        fontSize: 12
      })
    }], {
      orientation: 'horizontal',
      enabledProperty: this.inputBasedPickingProperty,
      radioButtonOptions: {
        xSpacing: 3
      },
      spacing: 10,
      tandem: Tandem.OPT_OUT
    });
    const selectedTrailContent = new VBox({
      align: 'left',
      visibleProperty: this.selectedTrailContentVisibleProperty
    });
    this.previewTrailProperty.link(trail => {
      selectedTrailContent.children = [];
      if (trail) {
        trail.nodes.slice().forEach((node, index) => {
          selectedTrailContent.addChild(new RichText(`${index > 0 ? trail.nodes[index - 1].children.indexOf(node) : '-'} ${node.constructor.name}`, {
            font: new PhetFont(12),
            fill: index === trail.nodes.length - 1 ? 'black' : '#bbb',
            layoutOptions: {
              leftMargin: index * 10
            },
            cursor: 'pointer',
            inputListeners: [new FireListener({
              fire: () => {
                this.selectedTrailProperty.value = trail.subtrailTo(node);
                focusSelected();
              },
              tandem: Tandem.OPT_OUT
            })]
          }));
        });
        trail.lastNode().children.forEach((node, index) => {
          selectedTrailContent.addChild(new RichText(`${trail.lastNode().children.indexOf(node)} ${node.constructor.name}`, {
            font: new PhetFont(12),
            fill: '#88f',
            layoutOptions: {
              leftMargin: trail.nodes.length * 10
            },
            cursor: 'pointer',
            inputListeners: [new FireListener({
              fire: () => {
                this.selectedTrailProperty.value = trail.copy().addDescendant(node, index);
                focusSelected();
              },
              tandem: Tandem.OPT_OUT
            })]
          }));
        });

        // Visibility check
        if (!trail.isVisible()) {
          selectedTrailContent.addChild(new Text('invisible', {
            fill: '#60a',
            fontSize: 12
          }));
        }
        if (trail.getOpacity() !== 1) {
          selectedTrailContent.addChild(new Text(`opacity: ${trail.getOpacity()}`, {
            fill: '#888',
            fontSize: 12
          }));
        }
        const hasPickableFalseEquivalent = _.some(trail.nodes, node => {
          return node.pickable === false || !node.visible;
        });
        const hasPickableTrueEquivalent = _.some(trail.nodes, node => {
          return node.inputListeners.length > 0 || node.pickable === true;
        });
        if (!hasPickableFalseEquivalent && hasPickableTrueEquivalent) {
          selectedTrailContent.addChild(new Text('Hit Tested', {
            fill: '#f00',
            fontSize: 12
          }));
        }
        if (!trail.getMatrix().isIdentity()) {
          // Why is this wrapper node needed?
          selectedTrailContent.addChild(new Node({
            children: [new Matrix3Node(trail.getMatrix())]
          }));
        }
      }
    });
    const visualTreeNode = new TreeNode(this.visualTreeVisibleProperty, this, () => new VisualTreeNode(new Trail(simDisplay.rootNode), this));
    const pdomTreeNode = new TreeNode(this.pdomTreeVisibleProperty, this, () => new PDOMTreeNode(simDisplay._rootPDOMInstance, this));
    const focusSelected = () => {
      visualTreeNode.focusSelected();
      pdomTreeNode.focusSelected();
    };
    const boundsPath = new Path(null, {
      visibleProperty: this.boundsVisibleProperty,
      stroke: boundsColor,
      fill: boundsColor.withAlpha(0.1),
      lineDash: [2, 2],
      lineDashOffset: 2
    });
    this.previewTrailProperty.link(trail => {
      if (trail && trail.lastNode().localBounds.isValid()) {
        boundsPath.shape = Shape.bounds(trail.lastNode().localBounds).transformed(trail.getMatrix());
      } else {
        boundsPath.shape = null;
      }
    });
    const selfBoundsPath = new Path(null, {
      visibleProperty: this.selfBoundsVisibleProperty,
      stroke: selfBoundsColor,
      fill: selfBoundsColor.withAlpha(0.1),
      lineDash: [2, 2],
      lineDashOffset: 1
    });
    this.previewTrailProperty.link(trail => {
      if (trail && trail.lastNode().selfBounds.isValid()) {
        selfBoundsPath.shape = Shape.bounds(trail.lastNode().selfBounds).transformed(trail.getMatrix());
      } else {
        selfBoundsPath.shape = null;
      }
    });
    const highlightFillProperty = new DerivedProperty([highlightBaseColorProperty], color => color.withAlpha(0.2), {
      tandem: Tandem.OPT_OUT
    });
    const highlightPath = new Path(null, {
      stroke: highlightBaseColorProperty,
      lineDash: [2, 2],
      fill: highlightFillProperty,
      visibleProperty: this.highlightVisibleProperty
    });
    this.previewShapeProperty.link(shape => {
      highlightPath.shape = shape;
    });
    const helperNodeContainer = new Node({
      visibleProperty: this.getHelperNodeVisibleProperty
    });
    this.selectedTrailProperty.link(trail => {
      if (trail) {
        helperNodeContainer.matrix = trail.getMatrix();
      }
    });
    this.helperNodeProperty.link(node => {
      helperNodeContainer.removeAllChildren();
      if (node) {
        helperNodeContainer.addChild(node);
      }
    });

    // this.inputBasedPickingProperty = new BooleanProperty( true, { tandem: Tandem.OPT_OUT } );
    // this.useLeafNodeProperty = new BooleanProperty( false, { tandem: Tandem.OPT_OUT } );
    // this.pointerAreaTypeProperty = new EnumerationProperty( PointerAreaType.MOUSE, { tandem: Tandem.OPT_OUT } );

    helperRoot.addChild(boundsPath);
    helperRoot.addChild(selfBoundsPath);
    helperRoot.addChild(highlightPath);
    const backgroundNode = new Node();
    backgroundNode.addInputListener(new PressListener({
      press: () => {
        this.selectedTrailProperty.value = this.pointerTrailProperty.value;
        focusSelected();
      },
      tandem: Tandem.OPT_OUT
    }));
    helperRoot.addChild(backgroundNode);
    helperRoot.addChild(helperNodeContainer);
    const underPointerNode = new FlowBox({
      orientation: 'vertical',
      spacing: 5,
      align: 'left',
      children: [positionText, colorBackground],
      visibleProperty: this.underPointerVisibleProperty
    });
    const optionsNode = new VBox({
      spacing: 3,
      align: 'left',
      children: [createHeaderText('Tools'), new VBox({
        spacing: 3,
        align: 'left',
        children: [new HBox({
          spacing: 10,
          children: [fuzzCheckbox, measuringTapeVisibleCheckbox]
        }), new HBox({
          spacing: 10,
          children: [visualTreeVisibleCheckbox, ...(simDisplay._accessible ? [pdomTreeVisibleCheckbox] : [])]
        })]
      }), createHeaderText('Picking', undefined, {
        layoutOptions: {
          topMargin: 3
        }
      }), new VBox({
        spacing: 3,
        align: 'left',
        children: [new HBox({
          spacing: 10,
          children: [inputBasedPickingCheckbox, useLeafNodeCheckbox]
        }), pointerAreaTypeRadioButtonGroup]
      }), createHeaderText('Show', undefined, {
        layoutOptions: {
          topMargin: 3
        }
      }), new VBox({
        spacing: 3,
        align: 'left',
        children: [new HBox({
          spacing: 10,
          children: [highlightVisibleCheckbox, getHelperNodeVisibleCheckbox]
        }), new HBox({
          spacing: 10,
          children: [boundsVisibleCheckbox, selfBoundsVisibleCheckbox]
        })]
      })],
      visibleProperty: this.optionsVisibleProperty
    });
    const helperReadoutContent = new VBox({
      spacing: 5,
      align: 'left',
      children: [createCollapsibleHeaderText('Under Pointer', this.underPointerVisibleProperty, underPointerNode, {
        layoutOptions: {
          topMargin: 0
        }
      }), underPointerNode, createCollapsibleHeaderText('Options', this.optionsVisibleProperty, optionsNode), optionsNode, createCollapsibleHeaderText('Preview', this.previewVisibleProperty, previewNode), previewNode, createCollapsibleHeaderText('Selected Trail', this.selectedTrailContentVisibleProperty, selectedTrailContent), selectedTrailContent, createCollapsibleHeaderText('Selected Node', this.selectedNodeContentVisibleProperty, selectedNodeContent), selectedNodeContent],
      visibleProperty: this.helperVisibleProperty
    });
    const helperReadoutCollapsible = new VBox({
      spacing: 5,
      align: 'left',
      children: [createCollapsibleHeaderText('Helper', this.helperVisibleProperty, helperReadoutContent), new HSeparator(), helperReadoutContent]
    });
    const helperReadoutPanel = new Panel(helperReadoutCollapsible, {
      fill: 'rgba(255,255,255,0.85)',
      stroke: 'rgba(0,0,0,0.85)',
      cornerRadius: 0
    });
    helperReadoutPanel.addInputListener(new DragListener({
      translateNode: true,
      targetNode: helperReadoutPanel,
      tandem: Tandem.OPT_OUT
    }));

    // Allow scrolling to scroll the panel's position
    helperReadoutPanel.addInputListener({
      wheel: event => {
        const deltaY = event.domEvent.deltaY;
        const multiplier = 1;
        helperReadoutPanel.y -= deltaY * multiplier;
      }
    });
    helperRoot.addChild(helperReadoutPanel);
    helperRoot.addChild(visualTreeNode);
    helperRoot.addChild(pdomTreeNode);
    const measuringTapeNode = new MeasuringTapeNode(measuringTapeUnitsProperty, {
      visibleProperty: measuringTapeVisibleProperty,
      textBackgroundColor: 'rgba(0,0,0,0.5)'
    });
    measuringTapeNode.basePositionProperty.value = new Vector2(100, 300);
    measuringTapeNode.tipPositionProperty.value = new Vector2(200, 300);
    helperRoot.addChild(measuringTapeNode);
    const resizeListener = size => {
      this.helperDisplay.width = size.width;
      this.helperDisplay.height = size.height;
      layoutBoundsProperty.value = layoutBoundsProperty.value.withMaxX(size.width).withMaxY(size.height);
      backgroundNode.mouseArea = new Bounds2(0, 0, size.width, size.height);
      backgroundNode.touchArea = new Bounds2(0, 0, size.width, size.height);
      visualTreeNode.resize(size);
      pdomTreeNode.resize(size);
    };
    const frameListener = dt => {
      this.overInterfaceProperty.value = helperReadoutPanel.bounds.containsPoint(this.pointerPositionProperty.value) || this.visualTreeVisibleProperty.value && visualTreeNode.bounds.containsPoint(this.pointerPositionProperty.value) || this.pdomTreeVisibleProperty.value && pdomTreeNode.bounds.containsPoint(this.pointerPositionProperty.value) || helperNodeContainer.containsPoint(this.pointerPositionProperty.value);
      this.helperDisplay?.updateDisplay();
    };
    document.addEventListener('keyup', event => {
      if (event.key === 'Escape') {
        this.selectedTrailProperty.value = null;
      }
    });
    this.activeProperty.lazyLink(active => {
      if (active) {
        sim.activeProperty.value = false;
        const screen = sim.selectedScreenProperty.value;
        if (screen.hasView()) {
          this.screenViewProperty.value = screen.view;
        } else {
          this.screenViewProperty.value = null;
        }
        this.helperDisplay = new Display(helperRoot, {
          assumeFullWindow: true
        });
        this.helperDisplay.initializeEvents();
        sim.dimensionProperty.link(resizeListener);
        animationFrameTimer.addListener(frameListener);
        document.body.appendChild(this.helperDisplay.domElement);
        this.helperDisplay.domElement.style.zIndex = '10000';
        const onLocationEvent = event => {
          this.pointerPositionProperty.value = event.pointer.point;
        };
        this.helperDisplay.addInputListener({
          move: onLocationEvent,
          down: onLocationEvent,
          up: onLocationEvent
        });
        if (this.screenViewProperty.value) {
          measuringTapeUnitsProperty.value = {
            name: 'view units',
            multiplier: this.screenViewProperty.value.getGlobalToLocalMatrix().getScaleVector().x
          };
        }
        this.simDisplay.foreignObjectRasterization(dataURI => {
          if (dataURI) {
            const image = document.createElement('img');
            image.addEventListener('load', () => {
              const width = image.width;
              const height = image.height;
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = width;
              canvas.height = height;
              context.drawImage(image, 0, 0);
              if (this.activeProperty.value) {
                this.imageDataProperty.value = context.getImageData(0, 0, width, height);
              }
            });
            image.src = dataURI;
          } else {
            console.log('Could not load foreign object rasterization');
          }
        });
      } else {
        sim.dimensionProperty.unlink(resizeListener);
        animationFrameTimer.removeListener(frameListener);
        document.body.removeChild(this.helperDisplay.domElement);
        this.helperDisplay.dispose();

        // Unpause the simulation
        sim.activeProperty.value = true;

        // Clear imageData since it won't be accurate when we re-open
        this.imageDataProperty.value = null;

        // Hide the tree when closing, so it starts up quickly
        this.visualTreeVisibleProperty.value = false;
      }
    });
  }

  // Singleton, lazily created so we don't slow down startup

  static initialize(sim, simDisplay) {
    // Ctrl + shift + H (will open the helper)
    document.addEventListener('keydown', event => {
      if (event.ctrlKey && event.key === 'H') {
        // Lazy creation
        if (!Helper.helper) {
          Helper.helper = new Helper(sim, simDisplay);
        }
        Helper.helper.activeProperty.value = !Helper.helper.activeProperty.value;
      }
    });
  }
}
joist.register('Helper', Helper);
class HelperCheckbox extends Checkbox {
  constructor(property, label, providedOptions) {
    const options = optionize()({
      tandem: Tandem.OPT_OUT,
      boxWidth: 14,
      labelOptions: {
        font: new PhetFont(12)
      }
    }, providedOptions);
    super(property, new RichText(label, options.labelOptions), options);
  }
}

// class DraggableDivider extends Rectangle {
//   constructor( preferredBoundsProperty, orientation, initialSeparatorLocation, pushFromMax ) {
//
//     super( {
//       fill: '#666',
//       cursor: orientation === 'horizontal' ? 'w-resize' : 'n-resize'
//     } );
//
//     this.minBoundsProperty = new TinyProperty( new Bounds2( 0, 0, 0, 0 ) );
//     this.maxBoundsProperty = new TinyProperty( new Bounds2( 0, 0, 0, 0 ) );
//
//     this.preferredBoundsProperty = preferredBoundsProperty;
//     this.orientation = orientation;
//     this.primaryCoordinate = orientation === 'horizontal' ? 'x' : 'y';
//     this.secondaryCoordinate = orientation === 'horizontal' ? 'y' : 'x';
//     this.primaryName = orientation === 'horizontal' ? 'width' : 'height';
//     this.secondaryName = orientation === 'horizontal' ? 'height' : 'width';
//     this.primaryRectName = orientation === 'horizontal' ? 'rectWidth' : 'rectHeight';
//     this.secondaryRectName = orientation === 'horizontal' ? 'rectHeight' : 'rectWidth';
//     this.minCoordinate = orientation === 'horizontal' ? 'left' : 'top';
//     this.maxCoordinate = orientation === 'horizontal' ? 'right' : 'bottom';
//     this.centerName = orientation === 'horizontal' ? 'centerX' : 'centerY';
//     this.minimum = 100;
//
//     this.separatorLocation = initialSeparatorLocation;
//
//     this[ this.primaryRectName ] = 2;
//
//     var dragListener = new phet.scenery.DragListener( {
//       drag: event => {
//         this.separatorLocation = dragListener.parentPoint[ this.primaryCoordinate ];
//         this.layout();
//       }
//     } );
//     this.addInputListener( dragListener );
//
//     preferredBoundsProperty.link( ( newPreferredBounds, oldPreferredBounds ) => {
//       if ( pushFromMax && oldPreferredBounds ) {
//         this.separatorLocation += newPreferredBounds[ this.maxCoordinate ] - oldPreferredBounds[ this.maxCoordinate ];
//       }
//       if ( !pushFromMax && oldPreferredBounds ) {
//         this.separatorLocation += newPreferredBounds[ this.minCoordinate ] - oldPreferredBounds[ this.minCoordinate ];
//       }
//       this.layout();
//     } );
//   }
//
//   /**
// //    */
//   layout() {
//     var preferredBounds = this.preferredBoundsProperty.value;
//     var separatorLocation = this.separatorLocation;
//
//     if ( separatorLocation < preferredBounds[ this.minCoordinate ] + this.minimum ) {
//       separatorLocation = preferredBounds[ this.minCoordinate ] + this.minimum;
//     }
//     if ( separatorLocation > preferredBounds[ this.maxCoordinate ] - this.minimum ) {
//       if ( preferredBounds[ this.primaryName ] >= this.minimum * 2 ) {
//         separatorLocation = preferredBounds[ this.maxCoordinate ] - this.minimum;
//       }
//       else {
//         separatorLocation = preferredBounds[ this.minCoordinate ] + preferredBounds[ this.primaryName ] / 2;
//       }
//     }
//
//     this[ this.centerName ] = separatorLocation;
//     this[ this.secondaryCoordinate ] = preferredBounds[ this.secondaryCoordinate ];
//     this[ this.secondaryRectName ] = preferredBounds[ this.secondaryName ];
//
//     if ( this.orientation === 'horizontal' ) {
//       this.mouseArea = this.touchArea = this.localBounds.dilatedX( 5 );
//     }
//     else {
//       this.mouseArea = this.touchArea = this.localBounds.dilatedY( 5 );
//     }
//
//     var minBounds = preferredBounds.copy();
//     var maxBounds = preferredBounds.copy();
//     if ( this.orientation === 'horizontal' ) {
//       minBounds.maxX = separatorLocation - this.width / 2;
//       maxBounds.minX = separatorLocation + this.width / 2;
//     }
//     else {
//       minBounds.maxY = separatorLocation - this.height / 2;
//       maxBounds.minY = separatorLocation + this.height / 2;
//     }
//     this.minBoundsProperty.value = minBounds;
//     this.maxBoundsProperty.value = maxBounds;
//   }
// }
class CollapsibleTreeNode extends Node {
  constructor(selfNode, providedOptions) {
    const options = optionize()({
      createChildren: () => [],
      spacing: 0,
      indent: 5
    }, providedOptions);
    super({
      excludeInvisibleChildrenFromBounds: true
    });
    this.selfNode = selfNode;
    this.selfNode.centerY = 0;
    this.expandedProperty = new TinyProperty(true);
    this.childTreeNodes = createObservableArray({
      elements: options.createChildren()
    });
    const buttonSize = 12;
    const expandCollapseShape = new Shape().moveToPoint(Vector2.createPolar(buttonSize / 2.5, 3 / 4 * Math.PI).plusXY(buttonSize / 8, 0)).lineTo(buttonSize / 8, 0).lineToPoint(Vector2.createPolar(buttonSize / 2.5, 5 / 4 * Math.PI).plusXY(buttonSize / 8, 0));
    this.expandCollapseButton = new Rectangle(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, {
      children: [new Path(expandCollapseShape, {
        stroke: '#888',
        lineCap: 'round',
        lineWidth: 1.5
      })],
      visible: false,
      cursor: 'pointer',
      right: 0
    });
    this.expandedProperty.link(expanded => {
      this.expandCollapseButton.rotation = expanded ? Math.PI / 2 : 0;
    });
    this.expandCollapseButton.addInputListener(new FireListener({
      fire: () => {
        this.expandedProperty.value = !this.expandedProperty.value;
      },
      tandem: Tandem.OPT_OUT
    }));
    this.addChild(this.expandCollapseButton);
    this.childContainer = new FlowBox({
      orientation: 'vertical',
      align: 'left',
      spacing: options.spacing,
      children: this.childTreeNodes,
      x: options.indent,
      y: this.selfNode.bottom + options.spacing,
      visibleProperty: this.expandedProperty
    });
    this.addChild(this.childContainer);
    this.addChild(selfNode);
    const onChildrenChange = () => {
      this.childContainer.children = this.childTreeNodes;
      this.expandCollapseButton.visible = this.childTreeNodes.length > 0;
    };
    this.childTreeNodes.addItemAddedListener(() => {
      onChildrenChange();
    });
    this.childTreeNodes.addItemRemovedListener(() => {
      onChildrenChange();
    });
    onChildrenChange();
    this.mutate(options);
  }
  expand() {
    this.expandedProperty.value = true;
  }
  collapse() {
    this.expandedProperty.value = false;
  }
  expandRecusively() {
    this.expandedProperty.value = true;
    this.childTreeNodes.forEach(treeNode => {
      treeNode.expandRecusively();
    });
  }
  collapseRecursively() {
    this.expandedProperty.value = false;
    this.childTreeNodes.forEach(treeNode => {
      treeNode.collapseRecursively();
    });
  }
}
class VisualTreeNode extends CollapsibleTreeNode {
  constructor(trail, helper) {
    const node = trail.lastNode();
    const isVisible = trail.isVisible();
    const TREE_FONT = new Font({
      size: 12
    });
    const nameNode = new HBox({
      spacing: 5
    });
    const name = node.constructor.name;
    if (name) {
      nameNode.addChild(new Text(name, {
        font: TREE_FONT,
        pickable: false,
        fill: isVisible ? '#000' : '#60a'
      }));
    }
    if (node instanceof Text) {
      nameNode.addChild(new Text('"' + node.string + '"', {
        font: TREE_FONT,
        pickable: false,
        fill: '#666'
      }));
    }
    const selfBackground = Rectangle.bounds(nameNode.bounds, {
      children: [nameNode],
      cursor: 'pointer',
      fill: new DerivedProperty([helper.selectedTrailProperty, helper.pointerTrailProperty], (selected, active) => {
        if (selected && trail.equals(selected)) {
          return 'rgba(0,128,255,0.4)';
        } else if (active && trail.equals(active)) {
          return 'rgba(0,128,255,0.2)';
        } else {
          return 'transparent';
        }
      }, {
        tandem: Tandem.OPT_OUT
      })
    });
    selfBackground.addInputListener({
      enter: () => {
        helper.treeHoverTrailProperty.value = trail;
      },
      exit: () => {
        helper.treeHoverTrailProperty.value = null;
      }
    });
    selfBackground.addInputListener(new FireListener({
      fire: () => {
        helper.selectedTrailProperty.value = trail;
      },
      tandem: Tandem.OPT_OUT
    }));
    super(selfBackground, {
      createChildren: () => trail.lastNode().children.map(child => {
        return new VisualTreeNode(trail.copy().addDescendant(child), helper);
      })
    });
    if (!node.visible) {
      this.expandedProperty.value = false;
    }
    this.trail = trail;
  }
  find(trail) {
    if (trail.equals(this.trail)) {
      return this;
    } else {
      const treeNode = _.find(this.childTreeNodes, childTreeNode => {
        return trail.isExtensionOf(childTreeNode.trail, true);
      });
      if (treeNode) {
        return treeNode.find(trail);
      } else {
        return null;
      }
    }
  }
}
class PDOMTreeNode extends CollapsibleTreeNode {
  constructor(instance, helper) {
    const trail = instance.trail;
    const isVisible = trail.isPDOMVisible();
    const TREE_FONT = new Font({
      size: 12
    });
    const selfNode = new HBox({
      spacing: 5
    });
    if (trail.nodes.length) {
      const fill = isVisible ? '#000' : '#60a';
      const node = trail.lastNode();
      if (node.tagName) {
        selfNode.addChild(new Text(node.tagName, {
          font: new Font({
            size: 12,
            weight: 'bold'
          }),
          fill: fill
        }));
      }
      if (node.labelContent) {
        selfNode.addChild(new Text(node.labelContent, {
          font: TREE_FONT,
          fill: '#800'
        }));
      }
      if (node.innerContent) {
        selfNode.addChild(new Text(node.innerContent, {
          font: TREE_FONT,
          fill: '#080'
        }));
      }
      if (node.descriptionContent) {
        selfNode.addChild(new Text(node.descriptionContent, {
          font: TREE_FONT,
          fill: '#444'
        }));
      }
      const parentTrail = instance.parent ? instance.parent.trail : new Trail();
      const name = trail.nodes.slice(parentTrail.nodes.length).map(node => node.constructor.name).filter(n => n !== 'Node').join(',');
      if (name) {
        selfNode.addChild(new Text(`(${name})`, {
          font: TREE_FONT,
          fill: '#008'
        }));
      }
    } else {
      selfNode.addChild(new Text('(root)', {
        font: TREE_FONT
      }));
    }

    // Refactor this code out?
    const selfBackground = Rectangle.bounds(selfNode.bounds, {
      children: [selfNode],
      cursor: 'pointer',
      fill: new DerivedProperty([helper.selectedTrailProperty, helper.pointerTrailProperty], (selected, active) => {
        if (selected && trail.equals(selected)) {
          return 'rgba(0,128,255,0.4)';
        } else if (active && trail.equals(active)) {
          return 'rgba(0,128,255,0.2)';
        } else {
          return 'transparent';
        }
      }, {
        tandem: Tandem.OPT_OUT
      })
    });
    if (trail.length) {
      selfBackground.addInputListener({
        enter: () => {
          helper.treeHoverTrailProperty.value = trail;
        },
        exit: () => {
          helper.treeHoverTrailProperty.value = null;
        }
      });
      selfBackground.addInputListener(new FireListener({
        fire: () => {
          helper.selectedTrailProperty.value = trail;
        },
        tandem: Tandem.OPT_OUT
      }));
    }
    super(selfBackground, {
      createChildren: () => instance.children.map(instance => new PDOMTreeNode(instance, helper))
    });
    this.instance = instance;
    this.trail = trail;
  }
  find(trail) {
    if (trail.equals(this.instance.trail)) {
      return this;
    } else {
      const treeNode = _.find(this.childTreeNodes, childTreeNode => {
        return trail.isExtensionOf(childTreeNode.instance.trail, true);
      });
      if (treeNode) {
        return treeNode.find(trail);
      } else {
        return null;
      }
    }
  }
}
class TreeNode extends Rectangle {
  constructor(visibleProperty, helper, createTreeNode) {
    super({
      fill: 'rgba(255,255,255,0.85)',
      stroke: 'black',
      rectWidth: 400,
      visibleProperty: visibleProperty,
      pickable: true
    });
    this.helper = helper;
    this.treeContainer = new Node();
    this.addChild(this.treeContainer);
    this.addInputListener(new DragListener({
      targetNode: this,
      drag: (event, listener) => {
        this.x = this.x + listener.modelDelta.x;
      },
      tandem: Tandem.OPT_OUT
    }));
    this.addInputListener({
      wheel: event => {
        const deltaX = event.domEvent.deltaX;
        const deltaY = event.domEvent.deltaY;
        const multiplier = 1;
        if (this.treeNode) {
          this.treeNode.x -= deltaX * multiplier;
          this.treeNode.y -= deltaY * multiplier;
        }
        this.constrainTree();
      }
    });

    // When there isn't a selected trail, focus whatever our pointer is over
    helper.pointerTrailProperty.lazyLink(() => {
      if (!helper.selectedTrailProperty.value) {
        this.focusPointer();
      }
    });
    Multilink.multilink([helper.activeProperty, visibleProperty], (active, treeVisible) => {
      if (active && treeVisible) {
        this.treeNode = createTreeNode();

        // Have the constrain properly position it
        this.treeNode.x = 500;
        this.treeNode.y = 500;
        this.treeContainer.children = [this.treeNode];
        this.focusSelected();
        this.constrainTree();
      } else {
        this.treeContainer.children = [];
      }
    });
  }
  resize(size) {
    this.rectHeight = size.height;
    this.right = size.width;
    this.treeContainer.clipArea = Shape.bounds(this.localBounds.dilated(10));
  }
  constrainTree() {
    const treeMarginX = 8;
    const treeMarginY = 5;
    if (this.treeNode) {
      if (this.treeNode.bottom < this.selfBounds.bottom - treeMarginY) {
        this.treeNode.bottom = this.selfBounds.bottom - treeMarginY;
      }
      if (this.treeNode.top > this.selfBounds.top + treeMarginY) {
        this.treeNode.top = this.selfBounds.top + treeMarginY;
      }
      if (this.treeNode.right < this.selfBounds.right - treeMarginX) {
        this.treeNode.right = this.selfBounds.right - treeMarginX;
      }
      if (this.treeNode.left > this.selfBounds.left + treeMarginX) {
        this.treeNode.left = this.selfBounds.left + treeMarginX;
      }
    }
  }
  focusTrail(trail) {
    if (this.treeNode) {
      const treeNode = this.treeNode.find(trail);
      if (treeNode) {
        const deltaY = treeNode.localToGlobalPoint(treeNode.selfNode.center).y - this.centerY;
        this.treeNode.y -= deltaY;
        this.constrainTree();
      }
    }
  }
  focusPointer() {
    if (this.helper.pointerTrailProperty.value) {
      this.focusTrail(this.helper.pointerTrailProperty.value);
    }
  }
  focusSelected() {
    if (this.helper.selectedTrailProperty.value === null) {
      return;
    }
    this.focusTrail(this.helper.selectedTrailProperty.value);
  }
}
const createHeaderText = (str, node, options) => {
  return new Text(str, merge({
    fontSize: 14,
    fontWeight: 'bold',
    visibleProperty: node ? new DerivedProperty([node.boundsProperty], bounds => {
      return !bounds.isEmpty();
    }) : new TinyProperty(true)
  }, options));
};
const createCollapsibleHeaderText = (str, visibleProperty, node, options) => {
  const headerText = createHeaderText(str, node, options);
  headerText.addInputListener(new FireListener({
    fire: () => {
      visibleProperty.value = !visibleProperty.value;
    },
    tandem: Tandem.OPT_OUT
  }));
  headerText.cursor = 'pointer';
  return new HBox({
    spacing: 7,
    children: [new ExpandCollapseButton(visibleProperty, {
      tandem: Tandem.OPT_OUT,
      sideLength: 14
    }), headerText],
    visibleProperty: headerText.visibleProperty
  });
};
class Matrix3Node extends GridBox {
  constructor(matrix) {
    super({
      xSpacing: 5,
      ySpacing: 0,
      children: [new Text(matrix.m00(), {
        layoutOptions: {
          column: 0,
          row: 0
        }
      }), new Text(matrix.m01(), {
        layoutOptions: {
          column: 1,
          row: 0
        }
      }), new Text(matrix.m02(), {
        layoutOptions: {
          column: 2,
          row: 0
        }
      }), new Text(matrix.m10(), {
        layoutOptions: {
          column: 0,
          row: 1
        }
      }), new Text(matrix.m11(), {
        layoutOptions: {
          column: 1,
          row: 1
        }
      }), new Text(matrix.m12(), {
        layoutOptions: {
          column: 2,
          row: 1
        }
      }), new Text(matrix.m20(), {
        layoutOptions: {
          column: 0,
          row: 2
        }
      }), new Text(matrix.m21(), {
        layoutOptions: {
          column: 1,
          row: 2
        }
      }), new Text(matrix.m22(), {
        layoutOptions: {
          column: 2,
          row: 2
        }
      })]
    });
  }
}
class ShapeNode extends Path {
  constructor(shape) {
    super(shape, {
      maxWidth: 15,
      maxHeight: 15,
      stroke: 'black',
      cursor: 'pointer',
      strokePickable: true
    });
    this.addInputListener(new FireListener({
      fire: () => copyToClipboard(shape.getSVGPath()),
      tandem: Tandem.OPT_OUT
    }));
  }
}
class ImageNode extends Image {
  constructor(image) {
    super(image.getImage(), {
      maxWidth: 15,
      maxHeight: 15
    });
  }
}
const createInfo = trail => {
  const children = [];
  const node = trail.lastNode();
  const types = inheritance(node.constructor).map(type => type.name).filter(name => {
    return name && name !== 'Object';
  });
  const reducedTypes = types.includes('Node') ? types.slice(0, types.indexOf('Node')) : types;
  if (reducedTypes.length > 0) {
    children.push(new RichText(reducedTypes.map((str, i) => {
      return i === 0 ? `<b>${str}</b>` : `<br>&nbsp;${_.repeat('  ', i)}extends ${str}`;
    }).join(''), {
      font: new PhetFont(12)
    }));
  }
  const addRaw = (key, valueNode) => {
    children.push(new HBox({
      spacing: 0,
      align: 'top',
      children: [new Text(key + ': ', {
        fontSize: 12
      }), valueNode]
    }));
  };
  const addSimple = (key, value) => {
    if (value !== undefined) {
      addRaw(key, new RichText('' + value, {
        lineWrap: 400,
        font: new PhetFont(12),
        cursor: 'pointer',
        inputListeners: [new FireListener({
          fire: () => copyToClipboard('' + value),
          tandem: Tandem.OPT_OUT
        })]
      }));
    }
  };
  const colorSwatch = color => {
    return new HBox({
      spacing: 4,
      children: [new Rectangle(0, 0, 10, 10, {
        fill: color,
        stroke: 'black',
        lineWidth: 0.5
      }), new Text(color.toHexString(), {
        fontSize: 12
      }), new Text(color.toCSS(), {
        fontSize: 12
      })],
      cursor: 'pointer',
      inputListeners: [new FireListener({
        fire: () => copyToClipboard(color.toHexString()),
        tandem: Tandem.OPT_OUT
      })]
    });
  };
  const addColor = (key, color) => {
    const result = iColorToColor(color);
    if (result !== null) {
      addRaw(key, colorSwatch(result));
    }
  };
  const addPaint = (key, paint) => {
    const stopToNode = stop => {
      return new HBox({
        spacing: 3,
        children: [new Text(stop.ratio, {
          fontSize: 12
        }), colorSwatch(iColorToColor(stop.color) || Color.TRANSPARENT)]
      });
    };
    if (paint instanceof Paint) {
      if (paint instanceof LinearGradient) {
        addRaw(key, new VBox({
          align: 'left',
          spacing: 3,
          children: [new Text(`LinearGradient (${paint.start.x},${paint.start.y}) => (${paint.end.x},${paint.end.y})`, {
            fontSize: 12
          }), ...paint.stops.map(stopToNode)]
        }));
      } else if (paint instanceof RadialGradient) {
        addRaw(key, new VBox({
          align: 'left',
          spacing: 3,
          children: [new Text(`RadialGradient (${paint.start.x},${paint.start.y}) ${paint.startRadius} => (${paint.end.x},${paint.end.y}) ${paint.endRadius}`, {
            fontSize: 12
          }), ...paint.stops.map(stopToNode)]
        }));
      } else if (paint instanceof Pattern) {
        addRaw(key, new VBox({
          align: 'left',
          spacing: 3,
          children: [new Text('Pattern', {
            fontSize: 12
          }), new Image(paint.image, {
            maxWidth: 10,
            maxHeight: 10
          })]
        }));
      }
    } else {
      addColor(key, paint);
    }
  };
  const addNumber = (key, number) => addSimple(key, number);
  const addMatrix3 = (key, matrix) => addRaw(key, new Matrix3Node(matrix));
  const addBounds2 = (key, bounds) => {
    if (bounds.equals(Bounds2.NOTHING)) {
      // DO nothing
    } else if (bounds.equals(Bounds2.EVERYTHING)) {
      addSimple(key, 'everything');
    } else {
      addRaw(key, new RichText(`x: [${bounds.minX}, ${bounds.maxX}]<br>y: [${bounds.minY}, ${bounds.maxY}]`, {
        font: new PhetFont(12)
      }));
    }
  };
  const addShape = (key, shape) => addRaw(key, new ShapeNode(shape));
  const addImage = (key, image) => addRaw(key, new ImageNode(image));
  if (node.tandem.supplied) {
    addSimple('tandem', node.tandem.phetioID.split('.').join(' '));
  }
  if (node instanceof DOM) {
    addSimple('element', node.element.constructor.name);
  }
  if (extendsWidthSizable(node)) {
    !node.widthSizable && addSimple('widthSizable', node.widthSizable);
    node.preferredWidth !== null && addSimple('preferredWidth', node.preferredWidth);
    node.preferredWidth !== node.localPreferredWidth && addSimple('localPreferredWidth', node.localPreferredWidth);
    node.minimumWidth !== null && addSimple('minimumWidth', node.minimumWidth);
    node.minimumWidth !== node.localMinimumWidth && addSimple('localMinimumWidth', node.localMinimumWidth);
  }
  if (extendsHeightSizable(node)) {
    !node.heightSizable && addSimple('heightSizable', node.heightSizable);
    node.preferredHeight !== null && addSimple('preferredHeight', node.preferredHeight);
    node.preferredHeight !== node.localPreferredHeight && addSimple('localPreferredHeight', node.localPreferredHeight);
    node.minimumHeight !== null && addSimple('minimumHeight', node.minimumHeight);
    node.minimumHeight !== node.localMinimumHeight && addSimple('localMinimumHeight', node.localMinimumHeight);
  }
  if (node.layoutOptions) {
    addSimple('layoutOptions', JSON.stringify(node.layoutOptions, null, 2));
  }
  if (node instanceof LayoutNode) {
    !node.resize && addSimple('resize', node.resize);
    !node.layoutOrigin.equals(Vector2.ZERO) && addSimple('layoutOrigin', node.layoutOrigin);
  }
  if (node instanceof FlowBox) {
    addSimple('orientation', node.orientation);
    addSimple('align', node.align);
    node.spacing && addSimple('spacing', node.spacing);
    node.lineSpacing && addSimple('lineSpacing', node.lineSpacing);
    addSimple('justify', node.justify);
    node.justifyLines && addSimple('justifyLines', node.justifyLines);
    node.wrap && addSimple('wrap', node.wrap);
    node.stretch && addSimple('stretch', node.stretch);
    node.grow && addSimple('grow', node.grow);
    node.leftMargin && addSimple('leftMargin', node.leftMargin);
    node.rightMargin && addSimple('rightMargin', node.rightMargin);
    node.topMargin && addSimple('topMargin', node.topMargin);
    node.bottomMargin && addSimple('bottomMargin', node.bottomMargin);
    node.minContentWidth !== null && addSimple('minContentWidth', node.minContentWidth);
    node.minContentHeight !== null && addSimple('minContentHeight', node.minContentHeight);
    node.maxContentWidth !== null && addSimple('maxContentWidth', node.maxContentWidth);
    node.maxContentHeight !== null && addSimple('maxContentHeight', node.maxContentHeight);
  }
  if (node instanceof GridBox) {
    addSimple('xAlign', node.xAlign);
    addSimple('yAlign', node.yAlign);
    node.xSpacing && addSimple('xSpacing', node.xSpacing);
    node.ySpacing && addSimple('ySpacing', node.ySpacing);
    node.xStretch && addSimple('xStretch', node.xStretch);
    node.yStretch && addSimple('yStretch', node.yStretch);
    node.xGrow && addSimple('xGrow', node.xGrow);
    node.yGrow && addSimple('yGrow', node.yGrow);
    node.leftMargin && addSimple('leftMargin', node.leftMargin);
    node.rightMargin && addSimple('rightMargin', node.rightMargin);
    node.topMargin && addSimple('topMargin', node.topMargin);
    node.bottomMargin && addSimple('bottomMargin', node.bottomMargin);
    node.minContentWidth !== null && addSimple('minContentWidth', node.minContentWidth);
    node.minContentHeight !== null && addSimple('minContentHeight', node.minContentHeight);
    node.maxContentWidth !== null && addSimple('maxContentWidth', node.maxContentWidth);
    node.maxContentHeight !== null && addSimple('maxContentHeight', node.maxContentHeight);
  }
  if (node instanceof Rectangle) {
    addBounds2('rectBounds', node.rectBounds);
    if (node.cornerXRadius || node.cornerYRadius) {
      if (node.cornerXRadius === node.cornerYRadius) {
        addSimple('cornerRadius', node.cornerRadius);
      } else {
        addSimple('cornerXRadius', node.cornerXRadius);
        addSimple('cornerYRadius', node.cornerYRadius);
      }
    }
  }
  if (node instanceof Line) {
    addSimple('x1', node.x1);
    addSimple('y1', node.y1);
    addSimple('x2', node.x2);
    addSimple('y2', node.y2);
  }
  if (node instanceof Circle) {
    addSimple('radius', node.radius);
  }
  if (node instanceof Text) {
    addSimple('text', node.string);
    addSimple('font', node.font);
    if (node.boundsMethod !== 'hybrid') {
      addSimple('boundsMethod', node.boundsMethod);
    }
  }
  if (node instanceof RichText) {
    addSimple('text', node.string);
    addSimple('font', node.font instanceof Font ? node.font.getFont() : node.font);
    addPaint('fill', node.fill);
    addPaint('stroke', node.stroke);
    if (node.boundsMethod !== 'hybrid') {
      addSimple('boundsMethod', node.boundsMethod);
    }
    if (node.lineWrap !== null) {
      addSimple('lineWrap', node.lineWrap);
    }
  }
  if (node instanceof Image) {
    addImage('image', node);
    addSimple('imageWidth', node.imageWidth);
    addSimple('imageHeight', node.imageHeight);
    if (node.imageOpacity !== 1) {
      addSimple('imageOpacity', node.imageOpacity);
    }
    if (node.imageBounds) {
      addBounds2('imageBounds', node.imageBounds);
    }
    if (node.initialWidth) {
      addSimple('initialWidth', node.initialWidth);
    }
    if (node.initialHeight) {
      addSimple('initialHeight', node.initialHeight);
    }
    if (node.hitTestPixels) {
      addSimple('hitTestPixels', node.hitTestPixels);
    }
  }
  if (node instanceof CanvasNode || node instanceof WebGLNode) {
    addBounds2('canvasBounds', node.canvasBounds);
  }
  if (node instanceof Path) {
    if (node.shape) {
      addShape('shape', node.shape);
    }
    if (node.boundsMethod !== 'accurate') {
      addSimple('boundsMethod', node.boundsMethod);
    }
  }
  if (node instanceof Path || node instanceof Text) {
    addPaint('fill', node.fill);
    addPaint('stroke', node.stroke);
    if (node.lineDash.length) {
      addSimple('lineDash', node.lineDash);
    }
    if (!node.fillPickable) {
      addSimple('fillPickable', node.fillPickable);
    }
    if (node.strokePickable) {
      addSimple('strokePickable', node.strokePickable);
    }
    if (node.lineWidth !== 1) {
      addSimple('lineWidth', node.lineWidth);
    }
    if (node.lineCap !== 'butt') {
      addSimple('lineCap', node.lineCap);
    }
    if (node.lineJoin !== 'miter') {
      addSimple('lineJoin', node.lineJoin);
    }
    if (node.lineDashOffset !== 0) {
      addSimple('lineDashOffset', node.lineDashOffset);
    }
    if (node.miterLimit !== 10) {
      addSimple('miterLimit', node.miterLimit);
    }
  }
  if (node.tagName) {
    addSimple('tagName', node.tagName);
  }
  if (node.accessibleName) {
    addSimple('accessibleName', node.accessibleName);
  }
  if (node.helpText) {
    addSimple('helpText', node.helpText);
  }
  if (node.pdomHeading) {
    addSimple('pdomHeading', node.pdomHeading);
  }
  if (node.containerTagName) {
    addSimple('containerTagName', node.containerTagName);
  }
  if (node.containerAriaRole) {
    addSimple('containerAriaRole', node.containerAriaRole);
  }
  if (node.innerContent) {
    addSimple('innerContent', node.innerContent);
  }
  if (node.inputType) {
    addSimple('inputType', node.inputType);
  }
  if (node.inputValue) {
    addSimple('inputValue', node.inputValue);
  }
  if (node.pdomNamespace) {
    addSimple('pdomNamespace', node.pdomNamespace);
  }
  if (node.ariaLabel) {
    addSimple('ariaLabel', node.ariaLabel);
  }
  if (node.ariaRole) {
    addSimple('ariaRole', node.ariaRole);
  }
  if (node.ariaValueText) {
    addSimple('ariaValueText', node.ariaValueText);
  }
  if (node.labelTagName) {
    addSimple('labelTagName', node.labelTagName);
  }
  if (node.labelContent) {
    addSimple('labelContent', node.labelContent);
  }
  if (node.appendLabel) {
    addSimple('appendLabel', node.appendLabel);
  }
  if (node.descriptionTagName) {
    addSimple('descriptionTagName', node.descriptionTagName);
  }
  if (node.descriptionContent) {
    addSimple('descriptionContent', node.descriptionContent);
  }
  if (node.appendDescription) {
    addSimple('appendDescription', node.appendDescription);
  }
  if (!node.pdomVisible) {
    addSimple('pdomVisible', node.pdomVisible);
  }
  if (node.pdomOrder) {
    addSimple('pdomOrder', node.pdomOrder.map(node => node === null ? 'null' : node.constructor.name));
  }
  if (!node.visible) {
    addSimple('visible', node.visible);
  }
  if (node.opacity !== 1) {
    addNumber('opacity', node.opacity);
  }
  if (node.pickable !== null) {
    addSimple('pickable', node.pickable);
  }
  if (!node.enabled) {
    addSimple('enabled', node.enabled);
  }
  if (!node.inputEnabled) {
    addSimple('inputEnabled', node.inputEnabled);
  }
  if (node.cursor !== null) {
    addSimple('cursor', node.cursor);
  }
  if (node.transformBounds) {
    addSimple('transformBounds', node.transformBounds);
  }
  if (node.renderer) {
    addSimple('renderer', node.renderer);
  }
  if (node.usesOpacity) {
    addSimple('usesOpacity', node.usesOpacity);
  }
  if (node.layerSplit) {
    addSimple('layerSplit', node.layerSplit);
  }
  if (node.cssTransform) {
    addSimple('cssTransform', node.cssTransform);
  }
  if (node.excludeInvisible) {
    addSimple('excludeInvisible', node.excludeInvisible);
  }
  if (node.preventFit) {
    addSimple('preventFit', node.preventFit);
  }
  if (node.webglScale !== null) {
    addSimple('webglScale', node.webglScale);
  }
  if (!node.matrix.isIdentity()) {
    addMatrix3('matrix', node.matrix);
  }
  if (node.maxWidth !== null) {
    addSimple('maxWidth', node.maxWidth);
  }
  if (node.maxHeight !== null) {
    addSimple('maxHeight', node.maxHeight);
  }
  if (node.clipArea !== null) {
    addShape('clipArea', node.clipArea);
  }
  if (node.mouseArea !== null) {
    if (node.mouseArea instanceof Bounds2) {
      addBounds2('mouseArea', node.mouseArea);
    } else {
      addShape('mouseArea', node.mouseArea);
    }
  }
  if (node.touchArea !== null) {
    if (node.touchArea instanceof Bounds2) {
      addBounds2('touchArea', node.touchArea);
    } else {
      addShape('touchArea', node.touchArea);
    }
  }
  if (node.inputListeners.length) {
    addSimple('inputListeners', node.inputListeners.map(listener => listener.constructor.name).join(', '));
  }
  children.push(new Spacer(5, 5));
  addBounds2('localBounds', node.localBounds);
  if (node.localBoundsOverridden) {
    addSimple('localBoundsOverridden', node.localBoundsOverridden);
  }
  addBounds2('bounds', node.bounds);
  if (isFinite(node.width)) {
    addSimple('width', node.width);
  }
  if (isFinite(node.height)) {
    addSimple('height', node.height);
  }
  children.push(new RectangularPushButton({
    content: new Text('Copy Path', {
      fontSize: 12
    }),
    listener: () => copyToClipboard('phet.joist.display.rootNode' + trail.indices.map(index => {
      return `.children[ ${index} ]`;
    }).join('')),
    tandem: Tandem.OPT_OUT
  }));
  return children;
};
const iColorToColor = color => {
  const nonProperty = color instanceof ReadOnlyProperty || color instanceof TinyProperty ? color.value : color;
  return nonProperty === null ? null : Color.toColor(nonProperty);
};
const isPaintNonTransparent = paint => {
  if (paint instanceof Paint) {
    return true;
  } else {
    const color = iColorToColor(paint);
    return !!color && color.alpha > 0;
  }
};

// Missing optimizations on bounds on purpose, so we hit visual changes
const visualHitTest = (node, point) => {
  if (!node.visible) {
    return null;
  }
  const localPoint = node._transform.getInverse().timesVector2(point);
  const clipArea = node.clipArea;
  if (clipArea !== null && !clipArea.containsPoint(localPoint)) {
    return null;
  }
  for (let i = node._children.length - 1; i >= 0; i--) {
    const child = node._children[i];
    const childHit = visualHitTest(child, localPoint);
    if (childHit) {
      return childHit.addAncestor(node, i);
    }
  }

  // Didn't hit our children, so check ourself as a last resort. Check our selfBounds first, so we can potentially
  // avoid hit-testing the actual object (which may be more expensive).
  if (node.selfBounds.containsPoint(localPoint)) {
    // Ignore those transparent paths...
    if (node instanceof Path && node.hasShape()) {
      if (isPaintNonTransparent(node.fill) && node.getShape().containsPoint(localPoint)) {
        return new Trail(node);
      }
      if (isPaintNonTransparent(node.stroke) && node.getStrokedShape().containsPoint(localPoint)) {
        return new Trail(node);
      }
    } else if (node.containsPointSelf(localPoint)) {
      return new Trail(node);
    }
  }

  // No hit
  return null;
};
const copyToClipboard = async str => {
  await navigator.clipboard?.writeText(str);
};
const getLocalShape = (node, useMouse, useTouch) => {
  let shape = Shape.union([...(useMouse && node.mouseArea ? [node.mouseArea instanceof Shape ? node.mouseArea : Shape.bounds(node.mouseArea)] : []), ...(useTouch && node.touchArea ? [node.touchArea instanceof Shape ? node.touchArea : Shape.bounds(node.touchArea)] : []), node.getSelfShape(), ...node.children.filter(child => {
    return child.visible && child.pickable !== false;
  }).map(child => getLocalShape(child, useMouse, useTouch).transformed(child.matrix))].filter(shape => shape.bounds.isValid()));
  if (node.hasClipArea()) {
    shape = shape.shapeIntersection(node.clipArea);
  }
  return shape;
};
const getShape = (trail, useMouse, useTouch) => {
  let shape = getLocalShape(trail.lastNode(), useMouse, useTouch);
  for (let i = trail.nodes.length - 1; i >= 0; i--) {
    const node = trail.nodes[i];
    if (node.hasClipArea()) {
      shape = shape.shapeIntersection(node.clipArea);
    }
    shape = shape.transformed(node.matrix);
  }
  return shape;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbmltYXRpb25GcmFtZVRpbWVyIiwiRGVyaXZlZFByb3BlcnR5IiwiTWFwcGVkUHJvcGVydHkiLCJUaW55UHJvcGVydHkiLCJCb3VuZHMyIiwiVXRpbHMiLCJWZWN0b3IyIiwiTWVhc3VyaW5nVGFwZU5vZGUiLCJQaGV0Rm9udCIsIkNhbnZhc05vZGUiLCJDaXJjbGUiLCJDb2xvciIsIkRpc3BsYXkiLCJET00iLCJEcmFnTGlzdGVuZXIiLCJGaXJlTGlzdGVuZXIiLCJGbG93Qm94IiwiRm9udCIsIkdyaWRCb3giLCJIQm94IiwiSW1hZ2UiLCJMYXlvdXROb2RlIiwiTGluZSIsIkxpbmVhckdyYWRpZW50IiwiZXh0ZW5kc0hlaWdodFNpemFibGUiLCJleHRlbmRzV2lkdGhTaXphYmxlIiwiTm9kZSIsIk5vZGVQYXR0ZXJuIiwiUGFpbnQiLCJQYXRoIiwiUGF0dGVybiIsIlByZXNzTGlzdGVuZXIiLCJSYWRpYWxHcmFkaWVudCIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiU3BhY2VyIiwiVGV4dCIsIlRyYWlsIiwiVkJveCIsIkhTZXBhcmF0b3IiLCJXZWJHTE5vZGUiLCJQYW5lbCIsIkFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiVGFuZGVtIiwiam9pc3QiLCJCb29sZWFuUHJvcGVydHkiLCJDaGVja2JveCIsImluaGVyaXRhbmNlIiwiUmVhZE9ubHlQcm9wZXJ0eSIsIkVudW1lcmF0aW9uVmFsdWUiLCJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uUHJvcGVydHkiLCJtZXJnZSIsIlNoYXBlIiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJkZWZhdWx0IiwiY3JlYXRlT2JzZXJ2YWJsZUFycmF5Iiwib3B0aW9uaXplIiwiTXVsdGlsaW5rIiwicm91bmQiLCJuIiwicGxhY2VzIiwidG9GaXhlZCIsIlBvaW50ZXJBcmVhVHlwZSIsIk1PVVNFIiwiVE9VQ0giLCJOT05FIiwiZW51bWVyYXRpb24iLCJoYXNIZWxwZXJOb2RlIiwibm9kZSIsImdldEhlbHBlck5vZGUiLCJIZWxwZXIiLCJjb25zdHJ1Y3RvciIsInNpbSIsInNpbURpc3BsYXkiLCJhY3RpdmVQcm9wZXJ0eSIsInZpc3VhbFRyZWVWaXNpYmxlUHJvcGVydHkiLCJ0YW5kZW0iLCJPUFRfT1VUIiwicGRvbVRyZWVWaXNpYmxlUHJvcGVydHkiLCJ1bmRlclBvaW50ZXJWaXNpYmxlUHJvcGVydHkiLCJvcHRpb25zVmlzaWJsZVByb3BlcnR5IiwicHJldmlld1Zpc2libGVQcm9wZXJ0eSIsInNlbGVjdGVkTm9kZUNvbnRlbnRWaXNpYmxlUHJvcGVydHkiLCJzZWxlY3RlZFRyYWlsQ29udGVudFZpc2libGVQcm9wZXJ0eSIsImhpZ2hsaWdodFZpc2libGVQcm9wZXJ0eSIsImJvdW5kc1Zpc2libGVQcm9wZXJ0eSIsInNlbGZCb3VuZHNWaXNpYmxlUHJvcGVydHkiLCJnZXRIZWxwZXJOb2RlVmlzaWJsZVByb3BlcnR5IiwiaGVscGVyVmlzaWJsZVByb3BlcnR5IiwiaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSIsInVzZUxlYWZOb2RlUHJvcGVydHkiLCJwb2ludGVyQXJlYVR5cGVQcm9wZXJ0eSIsInBvaW50ZXJQb3NpdGlvblByb3BlcnR5IiwiWkVSTyIsIm92ZXJJbnRlcmZhY2VQcm9wZXJ0eSIsInNlbGVjdGVkVHJhaWxQcm9wZXJ0eSIsInRyZWVIb3ZlclRyYWlsUHJvcGVydHkiLCJwb2ludGVyVHJhaWxQcm9wZXJ0eSIsInBvaW50Iiwib3ZlckludGVyZmFjZSIsInBvaW50ZXJBcmVhVHlwZSIsImlucHV0QmFzZWRQaWNraW5nIiwidmlzdWFsSGl0VGVzdCIsInJvb3ROb2RlIiwidHJhaWwiLCJoaXRUZXN0IiwidmFsdWUiLCJsZW5ndGgiLCJsYXN0Tm9kZSIsImlucHV0TGlzdGVuZXJzIiwicmVtb3ZlRGVzY2VuZGFudCIsImxpc3RlbmVycyIsImZpcnN0TGlzdGVuZXIiLCJ0YXJnZXROb2RlIiwiY29udGFpbnNOb2RlIiwic3VidHJhaWxUbyIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5IiwicHJldmlld1RyYWlsUHJvcGVydHkiLCJzZWxlY3RlZCIsInRyZWVIb3ZlciIsImFjdGl2ZSIsInByZXZpZXdTaGFwZVByb3BlcnR5IiwicHJldmlld1RyYWlsIiwiZ2V0U2hhcGUiLCJoZWxwZXJOb2RlUHJvcGVydHkiLCJzY3JlZW5WaWV3UHJvcGVydHkiLCJpbWFnZURhdGFQcm9wZXJ0eSIsImNvbG9yUHJvcGVydHkiLCJwb3NpdGlvbiIsImltYWdlRGF0YSIsIlRSQU5TUEFSRU5UIiwieCIsIk1hdGgiLCJmbG9vciIsIndpZHRoIiwieSIsImhlaWdodCIsImluZGV4IiwiZGF0YSIsImZ1enpQcm9wZXJ0eSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiZnV6eiIsImxhenlMaW5rIiwibWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eSIsIm1lYXN1cmluZ1RhcGVVbml0c1Byb3BlcnR5IiwibmFtZSIsIm11bHRpcGxpZXIiLCJsYXlvdXRCb3VuZHNQcm9wZXJ0eSIsIk5PVEhJTkciLCJoZWxwZXJSb290IiwicmVuZGVyZXIiLCJwb3NpdGlvblN0cmluZ1Byb3BlcnR5IiwiYmlkaXJlY3Rpb25hbCIsIm1hcCIsInZpZXciLCJ2aWV3UG9zaXRpb24iLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJwb3NpdGlvblRleHQiLCJmb250IiwiY29sb3JUZXh0TWFwIiwiY29sb3IiLCJ0b0hleFN0cmluZyIsInRvQ1NTIiwiY29sb3JTdHJpbmdQcm9wZXJ0eSIsImNvbG9yVGV4dCIsImxpbmsiLCJmaWxsIiwiZ2V0THVtaW5hbmNlIiwiQkxBQ0siLCJXSElURSIsImJvdW5kc0NvbG9yIiwic2VsZkJvdW5kc0NvbG9yIiwibm9uSW5wdXRCYXNlZENvbG9yIiwibW91c2VDb2xvciIsInRvdWNoQ29sb3IiLCJpbnB1dEJhc2VkQ29sb3IiLCJoaWdobGlnaHRCYXNlQ29sb3JQcm9wZXJ0eSIsImNvbG9yQmFja2dyb3VuZCIsImNvcm5lclJhZGl1cyIsInN0cm9rZSIsInByZXZpZXdOb2RlIiwidmlzaWJsZVByb3BlcnR5IiwicHJldmlld0JhY2tncm91bmQiLCJjaGlsZHJlbiIsInJlbW92ZUFsbENoaWxkcmVuIiwiYWRkQ2hpbGQiLCJib3VuZHMiLCJpc1ZhbGlkIiwic2NhbGUiLCJ3aW5kb3ciLCJkZXZpY2VQaXhlbFJhdGlvIiwibWluIiwic2VsZkJvdW5kcyIsImNlbnRlciIsInJhc3Rlcml6ZWQiLCJyZXNvbHV0aW9uIiwic291cmNlQm91bmRzIiwiZGlsYXRlZCIsInJvdW5kZWRPdXQiLCJzZWxlY3RlZE5vZGVDb250ZW50Iiwic3BhY2luZyIsImFsaWduIiwiY3JlYXRlSW5mbyIsImZ1enpDaGVja2JveCIsIkhlbHBlckNoZWNrYm94IiwibWVhc3VyaW5nVGFwZVZpc2libGVDaGVja2JveCIsInZpc3VhbFRyZWVWaXNpYmxlQ2hlY2tib3giLCJwZG9tVHJlZVZpc2libGVDaGVja2JveCIsImlucHV0QmFzZWRQaWNraW5nQ2hlY2tib3giLCJ1c2VMZWFmTm9kZUNoZWNrYm94IiwiZW5hYmxlZFByb3BlcnR5IiwiaGlnaGxpZ2h0VmlzaWJsZUNoZWNrYm94IiwibGFiZWxPcHRpb25zIiwiYm91bmRzVmlzaWJsZUNoZWNrYm94Iiwic2VsZkJvdW5kc1Zpc2libGVDaGVja2JveCIsImdldEhlbHBlck5vZGVWaXNpYmxlQ2hlY2tib3giLCJwb2ludGVyQXJlYVR5cGVSYWRpb0J1dHRvbkdyb3VwIiwiY3JlYXRlTm9kZSIsImZvbnRTaXplIiwib3JpZW50YXRpb24iLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJ4U3BhY2luZyIsInNlbGVjdGVkVHJhaWxDb250ZW50Iiwibm9kZXMiLCJzbGljZSIsImZvckVhY2giLCJpbmRleE9mIiwibGF5b3V0T3B0aW9ucyIsImxlZnRNYXJnaW4iLCJjdXJzb3IiLCJmaXJlIiwiZm9jdXNTZWxlY3RlZCIsImNvcHkiLCJhZGREZXNjZW5kYW50IiwiaXNWaXNpYmxlIiwiZ2V0T3BhY2l0eSIsImhhc1BpY2thYmxlRmFsc2VFcXVpdmFsZW50IiwiXyIsInNvbWUiLCJwaWNrYWJsZSIsInZpc2libGUiLCJoYXNQaWNrYWJsZVRydWVFcXVpdmFsZW50IiwiZ2V0TWF0cml4IiwiaXNJZGVudGl0eSIsIk1hdHJpeDNOb2RlIiwidmlzdWFsVHJlZU5vZGUiLCJUcmVlTm9kZSIsIlZpc3VhbFRyZWVOb2RlIiwicGRvbVRyZWVOb2RlIiwiUERPTVRyZWVOb2RlIiwiX3Jvb3RQRE9NSW5zdGFuY2UiLCJib3VuZHNQYXRoIiwid2l0aEFscGhhIiwibGluZURhc2giLCJsaW5lRGFzaE9mZnNldCIsImxvY2FsQm91bmRzIiwic2hhcGUiLCJ0cmFuc2Zvcm1lZCIsInNlbGZCb3VuZHNQYXRoIiwiaGlnaGxpZ2h0RmlsbFByb3BlcnR5IiwiaGlnaGxpZ2h0UGF0aCIsImhlbHBlck5vZGVDb250YWluZXIiLCJtYXRyaXgiLCJiYWNrZ3JvdW5kTm9kZSIsImFkZElucHV0TGlzdGVuZXIiLCJwcmVzcyIsInVuZGVyUG9pbnRlck5vZGUiLCJvcHRpb25zTm9kZSIsImNyZWF0ZUhlYWRlclRleHQiLCJfYWNjZXNzaWJsZSIsInVuZGVmaW5lZCIsInRvcE1hcmdpbiIsImhlbHBlclJlYWRvdXRDb250ZW50IiwiY3JlYXRlQ29sbGFwc2libGVIZWFkZXJUZXh0IiwiaGVscGVyUmVhZG91dENvbGxhcHNpYmxlIiwiaGVscGVyUmVhZG91dFBhbmVsIiwidHJhbnNsYXRlTm9kZSIsIndoZWVsIiwiZXZlbnQiLCJkZWx0YVkiLCJkb21FdmVudCIsIm1lYXN1cmluZ1RhcGVOb2RlIiwidGV4dEJhY2tncm91bmRDb2xvciIsImJhc2VQb3NpdGlvblByb3BlcnR5IiwidGlwUG9zaXRpb25Qcm9wZXJ0eSIsInJlc2l6ZUxpc3RlbmVyIiwic2l6ZSIsImhlbHBlckRpc3BsYXkiLCJ3aXRoTWF4WCIsIndpdGhNYXhZIiwibW91c2VBcmVhIiwidG91Y2hBcmVhIiwicmVzaXplIiwiZnJhbWVMaXN0ZW5lciIsImR0IiwiY29udGFpbnNQb2ludCIsInVwZGF0ZURpc3BsYXkiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJrZXkiLCJzY3JlZW4iLCJzZWxlY3RlZFNjcmVlblByb3BlcnR5IiwiaGFzVmlldyIsImFzc3VtZUZ1bGxXaW5kb3ciLCJpbml0aWFsaXplRXZlbnRzIiwiZGltZW5zaW9uUHJvcGVydHkiLCJhZGRMaXN0ZW5lciIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImRvbUVsZW1lbnQiLCJzdHlsZSIsInpJbmRleCIsIm9uTG9jYXRpb25FdmVudCIsInBvaW50ZXIiLCJtb3ZlIiwiZG93biIsInVwIiwiZ2V0R2xvYmFsVG9Mb2NhbE1hdHJpeCIsImdldFNjYWxlVmVjdG9yIiwiZm9yZWlnbk9iamVjdFJhc3Rlcml6YXRpb24iLCJkYXRhVVJJIiwiaW1hZ2UiLCJjcmVhdGVFbGVtZW50IiwiY2FudmFzIiwiY29udGV4dCIsImdldENvbnRleHQiLCJkcmF3SW1hZ2UiLCJnZXRJbWFnZURhdGEiLCJzcmMiLCJjb25zb2xlIiwibG9nIiwidW5saW5rIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJpbml0aWFsaXplIiwiY3RybEtleSIsImhlbHBlciIsInJlZ2lzdGVyIiwicHJvcGVydHkiLCJsYWJlbCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJib3hXaWR0aCIsIkNvbGxhcHNpYmxlVHJlZU5vZGUiLCJzZWxmTm9kZSIsImNyZWF0ZUNoaWxkcmVuIiwiaW5kZW50IiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsImNlbnRlclkiLCJleHBhbmRlZFByb3BlcnR5IiwiY2hpbGRUcmVlTm9kZXMiLCJlbGVtZW50cyIsImJ1dHRvblNpemUiLCJleHBhbmRDb2xsYXBzZVNoYXBlIiwibW92ZVRvUG9pbnQiLCJjcmVhdGVQb2xhciIsIlBJIiwicGx1c1hZIiwibGluZVRvIiwibGluZVRvUG9pbnQiLCJleHBhbmRDb2xsYXBzZUJ1dHRvbiIsImxpbmVDYXAiLCJsaW5lV2lkdGgiLCJyaWdodCIsImV4cGFuZGVkIiwicm90YXRpb24iLCJjaGlsZENvbnRhaW5lciIsImJvdHRvbSIsIm9uQ2hpbGRyZW5DaGFuZ2UiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJtdXRhdGUiLCJleHBhbmQiLCJjb2xsYXBzZSIsImV4cGFuZFJlY3VzaXZlbHkiLCJ0cmVlTm9kZSIsImNvbGxhcHNlUmVjdXJzaXZlbHkiLCJUUkVFX0ZPTlQiLCJuYW1lTm9kZSIsInN0cmluZyIsInNlbGZCYWNrZ3JvdW5kIiwiZXF1YWxzIiwiZW50ZXIiLCJleGl0IiwiY2hpbGQiLCJmaW5kIiwiY2hpbGRUcmVlTm9kZSIsImlzRXh0ZW5zaW9uT2YiLCJpbnN0YW5jZSIsImlzUERPTVZpc2libGUiLCJ0YWdOYW1lIiwid2VpZ2h0IiwibGFiZWxDb250ZW50IiwiaW5uZXJDb250ZW50IiwiZGVzY3JpcHRpb25Db250ZW50IiwicGFyZW50VHJhaWwiLCJwYXJlbnQiLCJmaWx0ZXIiLCJqb2luIiwiY3JlYXRlVHJlZU5vZGUiLCJyZWN0V2lkdGgiLCJ0cmVlQ29udGFpbmVyIiwiZHJhZyIsImxpc3RlbmVyIiwibW9kZWxEZWx0YSIsImRlbHRhWCIsImNvbnN0cmFpblRyZWUiLCJmb2N1c1BvaW50ZXIiLCJtdWx0aWxpbmsiLCJ0cmVlVmlzaWJsZSIsInJlY3RIZWlnaHQiLCJjbGlwQXJlYSIsInRyZWVNYXJnaW5YIiwidHJlZU1hcmdpblkiLCJ0b3AiLCJsZWZ0IiwiZm9jdXNUcmFpbCIsImxvY2FsVG9HbG9iYWxQb2ludCIsInN0ciIsImZvbnRXZWlnaHQiLCJib3VuZHNQcm9wZXJ0eSIsImlzRW1wdHkiLCJoZWFkZXJUZXh0Iiwic2lkZUxlbmd0aCIsInlTcGFjaW5nIiwibTAwIiwiY29sdW1uIiwicm93IiwibTAxIiwibTAyIiwibTEwIiwibTExIiwibTEyIiwibTIwIiwibTIxIiwibTIyIiwiU2hhcGVOb2RlIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJzdHJva2VQaWNrYWJsZSIsImNvcHlUb0NsaXBib2FyZCIsImdldFNWR1BhdGgiLCJJbWFnZU5vZGUiLCJnZXRJbWFnZSIsInR5cGVzIiwidHlwZSIsInJlZHVjZWRUeXBlcyIsImluY2x1ZGVzIiwicHVzaCIsImkiLCJyZXBlYXQiLCJhZGRSYXciLCJ2YWx1ZU5vZGUiLCJhZGRTaW1wbGUiLCJsaW5lV3JhcCIsImNvbG9yU3dhdGNoIiwiYWRkQ29sb3IiLCJyZXN1bHQiLCJpQ29sb3JUb0NvbG9yIiwiYWRkUGFpbnQiLCJwYWludCIsInN0b3BUb05vZGUiLCJzdG9wIiwicmF0aW8iLCJzdGFydCIsImVuZCIsInN0b3BzIiwic3RhcnRSYWRpdXMiLCJlbmRSYWRpdXMiLCJhZGROdW1iZXIiLCJudW1iZXIiLCJhZGRNYXRyaXgzIiwiYWRkQm91bmRzMiIsIkVWRVJZVEhJTkciLCJtaW5YIiwibWF4WCIsIm1pblkiLCJtYXhZIiwiYWRkU2hhcGUiLCJhZGRJbWFnZSIsInN1cHBsaWVkIiwicGhldGlvSUQiLCJzcGxpdCIsImVsZW1lbnQiLCJ3aWR0aFNpemFibGUiLCJwcmVmZXJyZWRXaWR0aCIsImxvY2FsUHJlZmVycmVkV2lkdGgiLCJtaW5pbXVtV2lkdGgiLCJsb2NhbE1pbmltdW1XaWR0aCIsImhlaWdodFNpemFibGUiLCJwcmVmZXJyZWRIZWlnaHQiLCJsb2NhbFByZWZlcnJlZEhlaWdodCIsIm1pbmltdW1IZWlnaHQiLCJsb2NhbE1pbmltdW1IZWlnaHQiLCJKU09OIiwic3RyaW5naWZ5IiwibGF5b3V0T3JpZ2luIiwibGluZVNwYWNpbmciLCJqdXN0aWZ5IiwianVzdGlmeUxpbmVzIiwid3JhcCIsInN0cmV0Y2giLCJncm93IiwicmlnaHRNYXJnaW4iLCJib3R0b21NYXJnaW4iLCJtaW5Db250ZW50V2lkdGgiLCJtaW5Db250ZW50SGVpZ2h0IiwibWF4Q29udGVudFdpZHRoIiwibWF4Q29udGVudEhlaWdodCIsInhBbGlnbiIsInlBbGlnbiIsInhTdHJldGNoIiwieVN0cmV0Y2giLCJ4R3JvdyIsInlHcm93IiwicmVjdEJvdW5kcyIsImNvcm5lclhSYWRpdXMiLCJjb3JuZXJZUmFkaXVzIiwieDEiLCJ5MSIsIngyIiwieTIiLCJyYWRpdXMiLCJib3VuZHNNZXRob2QiLCJnZXRGb250IiwiaW1hZ2VXaWR0aCIsImltYWdlSGVpZ2h0IiwiaW1hZ2VPcGFjaXR5IiwiaW1hZ2VCb3VuZHMiLCJpbml0aWFsV2lkdGgiLCJpbml0aWFsSGVpZ2h0IiwiaGl0VGVzdFBpeGVscyIsImNhbnZhc0JvdW5kcyIsImZpbGxQaWNrYWJsZSIsImxpbmVKb2luIiwibWl0ZXJMaW1pdCIsImFjY2Vzc2libGVOYW1lIiwiaGVscFRleHQiLCJwZG9tSGVhZGluZyIsImNvbnRhaW5lclRhZ05hbWUiLCJjb250YWluZXJBcmlhUm9sZSIsImlucHV0VHlwZSIsImlucHV0VmFsdWUiLCJwZG9tTmFtZXNwYWNlIiwiYXJpYUxhYmVsIiwiYXJpYVJvbGUiLCJhcmlhVmFsdWVUZXh0IiwibGFiZWxUYWdOYW1lIiwiYXBwZW5kTGFiZWwiLCJkZXNjcmlwdGlvblRhZ05hbWUiLCJhcHBlbmREZXNjcmlwdGlvbiIsInBkb21WaXNpYmxlIiwicGRvbU9yZGVyIiwib3BhY2l0eSIsImVuYWJsZWQiLCJpbnB1dEVuYWJsZWQiLCJ0cmFuc2Zvcm1Cb3VuZHMiLCJ1c2VzT3BhY2l0eSIsImxheWVyU3BsaXQiLCJjc3NUcmFuc2Zvcm0iLCJleGNsdWRlSW52aXNpYmxlIiwicHJldmVudEZpdCIsIndlYmdsU2NhbGUiLCJsb2NhbEJvdW5kc092ZXJyaWRkZW4iLCJpc0Zpbml0ZSIsImNvbnRlbnQiLCJpbmRpY2VzIiwibm9uUHJvcGVydHkiLCJ0b0NvbG9yIiwiaXNQYWludE5vblRyYW5zcGFyZW50IiwiYWxwaGEiLCJsb2NhbFBvaW50IiwiX3RyYW5zZm9ybSIsImdldEludmVyc2UiLCJ0aW1lc1ZlY3RvcjIiLCJfY2hpbGRyZW4iLCJjaGlsZEhpdCIsImFkZEFuY2VzdG9yIiwiaGFzU2hhcGUiLCJnZXRTdHJva2VkU2hhcGUiLCJjb250YWluc1BvaW50U2VsZiIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsImdldExvY2FsU2hhcGUiLCJ1c2VNb3VzZSIsInVzZVRvdWNoIiwidW5pb24iLCJnZXRTZWxmU2hhcGUiLCJoYXNDbGlwQXJlYSIsInNoYXBlSW50ZXJzZWN0aW9uIl0sInNvdXJjZXMiOlsiSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogU29tZSBpbi1zaW11bGF0aW9uIHV0aWxpdGllcyBkZXNpZ25lZCB0byBoZWxwIGRlc2lnbmVycyBhbmQgZGV2ZWxvcGVyc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGFuaW1hdGlvbkZyYW1lVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9hbmltYXRpb25GcmFtZVRpbWVyLmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNYXBwZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL01hcHBlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTWVhc3VyaW5nVGFwZU5vZGUgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL01lYXN1cmluZ1RhcGVOb2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENhbnZhc05vZGUsIENpcmNsZSwgQ29sb3IsIERpc3BsYXksIERPTSwgRHJhZ0xpc3RlbmVyLCBGaXJlTGlzdGVuZXIsIEZsb3dCb3gsIEZvbnQsIEdyYWRpZW50U3RvcCwgR3JpZEJveCwgSEJveCwgSW1hZ2UsIExheW91dE5vZGUsIExpbmUsIExpbmVhckdyYWRpZW50LCBleHRlbmRzSGVpZ2h0U2l6YWJsZSwgZXh0ZW5kc1dpZHRoU2l6YWJsZSwgTm9kZSwgTm9kZU9wdGlvbnMsIE5vZGVQYXR0ZXJuLCBQYWludCwgUGF0aCwgUGF0dGVybiwgUERPTUluc3RhbmNlLCBQcmVzc0xpc3RlbmVyLCBSYWRpYWxHcmFkaWVudCwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgUmljaFRleHRPcHRpb25zLCBTY2VuZXJ5RXZlbnQsIFNwYWNlciwgVENvbG9yLCBUZXh0LCBUZXh0T3B0aW9ucywgVFBhaW50LCBUcmFpbCwgVkJveCwgSFNlcGFyYXRvciwgV2ViR0xOb2RlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBBcXVhUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9zdW4vanMvQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XHJcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xyXG5pbXBvcnQgU2ltRGlzcGxheSBmcm9tICcuL1NpbURpc3BsYXkuanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IENoZWNrYm94LCB7IENoZWNrYm94T3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4vU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgaW5oZXJpdGFuY2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2luaGVyaXRhbmNlLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IEV4cGFuZENvbGxhcHNlQnV0dG9uIGZyb20gJy4uLy4uL3N1bi9qcy9FeHBhbmRDb2xsYXBzZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IGRlZmF1bHQgYXMgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LCBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tICcuLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5cclxuY29uc3Qgcm91bmQgPSAoIG46IG51bWJlciwgcGxhY2VzID0gMiApID0+IFV0aWxzLnRvRml4ZWQoIG4sIHBsYWNlcyApO1xyXG5cclxuY2xhc3MgUG9pbnRlckFyZWFUeXBlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNT1VTRSA9IG5ldyBQb2ludGVyQXJlYVR5cGUoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRPVUNIID0gbmV3IFBvaW50ZXJBcmVhVHlwZSgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTk9ORSA9IG5ldyBQb2ludGVyQXJlYVR5cGUoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggUG9pbnRlckFyZWFUeXBlICk7XHJcbn1cclxuXHJcbnR5cGUgSGVscGVyQ29tcGF0aWJsZU5vZGUgPSB7XHJcbiAgZ2V0SGVscGVyTm9kZSgpOiBOb2RlO1xyXG59ICYgTm9kZTtcclxuY29uc3QgaGFzSGVscGVyTm9kZSA9ICggbm9kZTogTm9kZSApOiBub2RlIGlzIEhlbHBlckNvbXBhdGlibGVOb2RlID0+IHtcclxuICByZXR1cm4gISEoIG5vZGUgYXMgSW50ZW50aW9uYWxBbnkgKS5nZXRIZWxwZXJOb2RlO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGVscGVyIHtcclxuICBwcml2YXRlIHNpbTogU2ltO1xyXG4gIHByaXZhdGUgc2ltRGlzcGxheTogRGlzcGxheTtcclxuICBwcml2YXRlIGhlbHBlckRpc3BsYXk/OiBEaXNwbGF5O1xyXG5cclxuICAvLyBXaGV0aGVyIHdlIHNob3VsZCB1c2UgdGhlIGlucHV0IHN5c3RlbSBmb3IgcGlja2luZywgb3IgaWYgd2Ugc2hvdWxkIGlnbm9yZSBpdCAoYW5kIHRoZSBmbGFncykgZm9yIHdoYXQgaXMgdmlzdWFsXHJcbiAgcHVibGljIGlucHV0QmFzZWRQaWNraW5nUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBXaGV0aGVyIHdlIHNob3VsZCByZXR1cm4gdGhlIGxlYWYtbW9zdCBUcmFpbCAoaW5zdGVhZCBvZiBmaW5kaW5nIHRoZSBvbmUgd2l0aCBpbnB1dCBsaXN0ZW5lcnMpXHJcbiAgcHVibGljIHVzZUxlYWZOb2RlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICBwdWJsaWMgcG9pbnRlckFyZWFUeXBlUHJvcGVydHk6IFByb3BlcnR5PFBvaW50ZXJBcmVhVHlwZT47XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIGhlbHBlciBpcyB2aXNpYmxlIChhY3RpdmUpIG9yIG5vdFxyXG4gIHB1YmxpYyBhY3RpdmVQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICBwdWJsaWMgdmlzdWFsVHJlZVZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHBkb21UcmVlVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgdW5kZXJQb2ludGVyVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgb3B0aW9uc1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHByZXZpZXdWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyBzZWxlY3RlZE5vZGVDb250ZW50VmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgc2VsZWN0ZWRUcmFpbENvbnRlbnRWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyBoaWdobGlnaHRWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyBib3VuZHNWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyBzZWxmQm91bmRzVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwdWJsaWMgZ2V0SGVscGVyTm9kZVZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIGVudGlyZSBoZWxwZXIgaXMgdmlzaWJsZSAob3IgY29sbGFwc2VkKVxyXG4gIHB1YmxpYyBoZWxwZXJWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBXaGVyZSB0aGUgY3VycmVudCBwb2ludGVyIGlzXHJcbiAgcHVibGljIHBvaW50ZXJQb3NpdGlvblByb3BlcnR5OiBUUHJvcGVydHk8VmVjdG9yMj47XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIHBvaW50ZXIgaXMgb3ZlciB0aGUgVUkgaW50ZXJmYWNlXHJcbiAgcHVibGljIG92ZXJJbnRlcmZhY2VQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIElmIHRoZSB1c2VyIGhhcyBjbGlja2VkIG9uIGEgVHJhaWwgYW5kIHNlbGVjdGVkIGl0XHJcbiAgcHVibGljIHNlbGVjdGVkVHJhaWxQcm9wZXJ0eTogVFByb3BlcnR5PFRyYWlsIHwgbnVsbD47XHJcblxyXG4gIC8vIFdoYXQgVHJhaWwgdGhlIHVzZXIgaXMgb3ZlciBpbiB0aGUgdHJlZSBVSVxyXG4gIHB1YmxpYyB0cmVlSG92ZXJUcmFpbFByb3BlcnR5OiBUUHJvcGVydHk8VHJhaWwgfCBudWxsPjtcclxuXHJcbiAgLy8gV2hhdCBUcmFpbCB0aGUgcG9pbnRlciBpcyBvdmVyIHJpZ2h0IG5vd1xyXG4gIHB1YmxpYyBwb2ludGVyVHJhaWxQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VHJhaWwgfCBudWxsPjtcclxuXHJcbiAgLy8gV2hhdCBUcmFpbCB0byBzaG93IGFzIGEgcHJldmlldyAoYW5kIHRvIGhpZ2hsaWdodCkgLSBzZWxlY3Rpb24gb3ZlcnJpZGVzIHdoYXQgdGhlIHBvaW50ZXIgaXMgb3ZlclxyXG4gIHB1YmxpYyBwcmV2aWV3VHJhaWxQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8VHJhaWwgfCBudWxsPjtcclxuXHJcbiAgLy8gQSBoZWxwZXItZGlzcGxheWVkIE5vZGUgY3JlYXRlZCB0byBoZWxwIHdpdGggZGVidWdnaW5nIHZhcmlvdXMgdHlwZXNcclxuICBwdWJsaWMgaGVscGVyTm9kZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxOb2RlIHwgbnVsbD47XHJcblxyXG4gIC8vIFRoZSBnbG9iYWwgc2hhcGUgb2Ygd2hhdCBpcyBzZWxlY3RlZFxyXG4gIHB1YmxpYyBwcmV2aWV3U2hhcGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8U2hhcGUgfCBudWxsPjtcclxuXHJcbiAgcHVibGljIHNjcmVlblZpZXdQcm9wZXJ0eTogVFByb3BlcnR5PFNjcmVlblZpZXcgfCBudWxsPjtcclxuXHJcbiAgLy8gSW1hZ2VEYXRhIGZyb20gdGhlIHNpbVxyXG4gIHB1YmxpYyBpbWFnZURhdGFQcm9wZXJ0eTogVFByb3BlcnR5PEltYWdlRGF0YSB8IG51bGw+O1xyXG5cclxuICAvLyBUaGUgcGl4ZWwgY29sb3IgdW5kZXIgdGhlIHBvaW50ZXJcclxuICBwdWJsaWMgY29sb3JQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNpbTogU2ltLCBzaW1EaXNwbGF5OiBTaW1EaXNwbGF5ICkge1xyXG5cclxuICAgIC8vIE5PVEU6IERvbid0IHBhdXNlIHRoZSBzaW0sIGRvbid0IHVzZSBmb3JlaWduIG9iamVjdCByYXN0ZXJpemF0aW9uIChkbyB0aGUgc21hcnRlciBpbnN0YW50IGFwcHJvYWNoKVxyXG4gICAgLy8gTk9URTogSW5mb3JtIGFib3V0IHByZXNlcnZlRHJhd2luZ0J1ZmZlciBxdWVyeSBwYXJhbWV0ZXJcclxuICAgIC8vIE5PVEU6IEFjdHVhbGx5IGdyYWIvcmVyZW5kZXIgdGhpbmdzIGZyb20gV2ViR0wvQ2FudmFzLCBzbyB0aGlzIHdvcmtzIG5pY2VseSBhbmQgYXQgYSBoaWdoZXIgcmVzb2x1dGlvblxyXG4gICAgLy8gTk9URTogU2NlbmVyeSBkcmF3YWJsZSB0cmVlXHJcblxyXG4gICAgdGhpcy5zaW0gPSBzaW07XHJcbiAgICB0aGlzLnNpbURpc3BsYXkgPSBzaW1EaXNwbGF5O1xyXG4gICAgdGhpcy5hY3RpdmVQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLnZpc3VhbFRyZWVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnBkb21UcmVlVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy51bmRlclBvaW50ZXJWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuICAgIHRoaXMub3B0aW9uc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5wcmV2aWV3VmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zZWxlY3RlZE5vZGVDb250ZW50VmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnNlbGVjdGVkVHJhaWxDb250ZW50VmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmhpZ2hsaWdodFZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ib3VuZHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc2VsZkJvdW5kc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuZ2V0SGVscGVyTm9kZVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5oZWxwZXJWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmlucHV0QmFzZWRQaWNraW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xyXG4gICAgdGhpcy51c2VMZWFmTm9kZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XHJcbiAgICB0aGlzLnBvaW50ZXJBcmVhVHlwZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIFBvaW50ZXJBcmVhVHlwZS5NT1VTRSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcclxuXHJcbiAgICB0aGlzLnBvaW50ZXJQb3NpdGlvblByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggVmVjdG9yMi5aRVJPICk7XHJcbiAgICB0aGlzLm92ZXJJbnRlcmZhY2VQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRUcmFpbFByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eTxUcmFpbCB8IG51bGw+KCBudWxsICk7XHJcbiAgICB0aGlzLnRyZWVIb3ZlclRyYWlsUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PFRyYWlsIHwgbnVsbD4oIG51bGwgKTtcclxuICAgIHRoaXMucG9pbnRlclRyYWlsUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMucG9pbnRlclBvc2l0aW9uUHJvcGVydHksIHRoaXMub3ZlckludGVyZmFjZVByb3BlcnR5LCB0aGlzLnBvaW50ZXJBcmVhVHlwZVByb3BlcnR5LCB0aGlzLmlucHV0QmFzZWRQaWNraW5nUHJvcGVydHkgXSwgKCBwb2ludCwgb3ZlckludGVyZmFjZSwgcG9pbnRlckFyZWFUeXBlLCBpbnB1dEJhc2VkUGlja2luZyApID0+IHtcclxuICAgICAgLy8gV2UncmUgbm90IG92ZXIgc29tZXRoaW5nIHdoaWxlIHdlJ3JlIG92ZXIgYW4gaW50ZXJmYWNlXHJcbiAgICAgIGlmICggb3ZlckludGVyZmFjZSApIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCAhaW5wdXRCYXNlZFBpY2tpbmcgKSB7XHJcbiAgICAgICAgcmV0dXJuIHZpc3VhbEhpdFRlc3QoIHNpbURpc3BsYXkucm9vdE5vZGUsIHBvaW50ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCB0cmFpbCA9IHNpbURpc3BsYXkucm9vdE5vZGUuaGl0VGVzdChcclxuICAgICAgICBwb2ludCxcclxuICAgICAgICBwb2ludGVyQXJlYVR5cGUgPT09IFBvaW50ZXJBcmVhVHlwZS5NT1VTRSxcclxuICAgICAgICBwb2ludGVyQXJlYVR5cGUgPT09IFBvaW50ZXJBcmVhVHlwZS5UT1VDSFxyXG4gICAgICApO1xyXG5cclxuICAgICAgaWYgKCB0cmFpbCAmJiAhdGhpcy51c2VMZWFmTm9kZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHdoaWxlICggdHJhaWwubGVuZ3RoID4gMCAmJiB0cmFpbC5sYXN0Tm9kZSgpLmlucHV0TGlzdGVuZXJzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICAgIHRyYWlsLnJlbW92ZURlc2NlbmRhbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCB0cmFpbC5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICB0cmFpbCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gUmVwc2VjdCBUYXJnZXROb2RlIHRvIGJlIGhlbHBmdWxcclxuICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRyYWlsLmxhc3ROb2RlKCkuaW5wdXRMaXN0ZW5lcnM7XHJcbiAgICAgICAgICBjb25zdCBmaXJzdExpc3RlbmVyID0gbGlzdGVuZXJzWyAwIF07XHJcbiAgICAgICAgICBpZiAoIGZpcnN0TGlzdGVuZXIgaW5zdGFuY2VvZiBQcmVzc0xpc3RlbmVyICYmIGZpcnN0TGlzdGVuZXIudGFyZ2V0Tm9kZSAmJiBmaXJzdExpc3RlbmVyLnRhcmdldE5vZGUgIT09IHRyYWlsLmxhc3ROb2RlKCkgJiYgdHJhaWwuY29udGFpbnNOb2RlKCBmaXJzdExpc3RlbmVyLnRhcmdldE5vZGUgKSApIHtcclxuICAgICAgICAgICAgdHJhaWwgPSB0cmFpbC5zdWJ0cmFpbFRvKCBmaXJzdExpc3RlbmVyLnRhcmdldE5vZGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cmFpbDtcclxuICAgIH0sIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbidcclxuICAgIH0gKTtcclxuICAgIHRoaXMucHJldmlld1RyYWlsUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LCB0aGlzLnRyZWVIb3ZlclRyYWlsUHJvcGVydHksIHRoaXMucG9pbnRlclRyYWlsUHJvcGVydHkgXSwgKCBzZWxlY3RlZCwgdHJlZUhvdmVyLCBhY3RpdmUgKSA9PiB7XHJcbiAgICAgIHJldHVybiBzZWxlY3RlZCA/IHNlbGVjdGVkIDogKCB0cmVlSG92ZXIgPyB0cmVlSG92ZXIgOiBhY3RpdmUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnByZXZpZXdTaGFwZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnByZXZpZXdUcmFpbFByb3BlcnR5LCB0aGlzLmlucHV0QmFzZWRQaWNraW5nUHJvcGVydHksIHRoaXMucG9pbnRlckFyZWFUeXBlUHJvcGVydHkgXSwgKCBwcmV2aWV3VHJhaWwsIGlucHV0QmFzZWRQaWNraW5nLCBwb2ludGVyQXJlYVR5cGUgKSA9PiB7XHJcbiAgICAgIGlmICggcHJldmlld1RyYWlsICkge1xyXG4gICAgICAgIGlmICggaW5wdXRCYXNlZFBpY2tpbmcgKSB7XHJcbiAgICAgICAgICByZXR1cm4gZ2V0U2hhcGUoIHByZXZpZXdUcmFpbCwgcG9pbnRlckFyZWFUeXBlID09PSBQb2ludGVyQXJlYVR5cGUuTU9VU0UsIHBvaW50ZXJBcmVhVHlwZSA9PT0gUG9pbnRlckFyZWFUeXBlLlRPVUNIICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIGdldFNoYXBlKCBwcmV2aWV3VHJhaWwsIGZhbHNlLCBmYWxzZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaGVscGVyTm9kZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnNlbGVjdGVkVHJhaWxQcm9wZXJ0eSBdLCB0cmFpbCA9PiB7XHJcbiAgICAgIGlmICggdHJhaWwgKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XHJcbiAgICAgICAgaWYgKCBoYXNIZWxwZXJOb2RlKCBub2RlICkgKSB7XHJcbiAgICAgICAgICByZXR1cm4gbm9kZS5nZXRIZWxwZXJOb2RlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zY3JlZW5WaWV3UHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PFNjcmVlblZpZXcgfCBudWxsPiggbnVsbCApO1xyXG5cclxuICAgIHRoaXMuaW1hZ2VEYXRhUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PEltYWdlRGF0YSB8IG51bGw+KCBudWxsICk7XHJcblxyXG4gICAgdGhpcy5jb2xvclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnBvaW50ZXJQb3NpdGlvblByb3BlcnR5LCB0aGlzLmltYWdlRGF0YVByb3BlcnR5IF0sICggcG9zaXRpb24sIGltYWdlRGF0YSApID0+IHtcclxuICAgICAgaWYgKCAhaW1hZ2VEYXRhICkge1xyXG4gICAgICAgIHJldHVybiBDb2xvci5UUkFOU1BBUkVOVDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCB4ID0gTWF0aC5mbG9vciggcG9zaXRpb24ueCAvIHRoaXMuc2ltRGlzcGxheS53aWR0aCAqIGltYWdlRGF0YS53aWR0aCApO1xyXG4gICAgICBjb25zdCB5ID0gTWF0aC5mbG9vciggcG9zaXRpb24ueSAvIHRoaXMuc2ltRGlzcGxheS5oZWlnaHQgKiBpbWFnZURhdGEuaGVpZ2h0ICk7XHJcblxyXG4gICAgICBjb25zdCBpbmRleCA9IDQgKiAoIHggKyBpbWFnZURhdGEud2lkdGggKiB5ICk7XHJcblxyXG4gICAgICBpZiAoIHggPCAwIHx8IHkgPCAwIHx8IHggPiBpbWFnZURhdGEud2lkdGggfHwgeSA+IGltYWdlRGF0YS5oZWlnaHQgKSB7XHJcbiAgICAgICAgcmV0dXJuIENvbG9yLlRSQU5TUEFSRU5UO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbmV3IENvbG9yKFxyXG4gICAgICAgIGltYWdlRGF0YS5kYXRhWyBpbmRleCBdLFxyXG4gICAgICAgIGltYWdlRGF0YS5kYXRhWyBpbmRleCArIDEgXSxcclxuICAgICAgICBpbWFnZURhdGEuZGF0YVsgaW5kZXggKyAyIF0sXHJcbiAgICAgICAgaW1hZ2VEYXRhLmRhdGFbIGluZGV4ICsgMyBdIC8gMjU1XHJcbiAgICAgICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBmdXp6UHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmZ1enosIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgZnV6elByb3BlcnR5LmxhenlMaW5rKCBmdXp6ID0+IHtcclxuICAgICAgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5mdXp6ID0gZnV6ejtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBtZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZVVuaXRzUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PHsgbmFtZTogc3RyaW5nOyBtdWx0aXBsaWVyOiBudW1iZXIgfT4oIHsgbmFtZTogJ3ZpZXcgdW5pdHMnLCBtdWx0aXBsaWVyOiAwIH0gKTtcclxuXHJcbiAgICBjb25zdCBsYXlvdXRCb3VuZHNQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIEJvdW5kczIuTk9USElORyApO1xyXG5cclxuICAgIGNvbnN0IGhlbHBlclJvb3QgPSBuZXcgTm9kZSgge1xyXG4gICAgICByZW5kZXJlcjogJ3N2ZydcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwb3NpdGlvblN0cmluZ1Byb3BlcnR5ID0gbmV3IE1hcHBlZFByb3BlcnR5KCB0aGlzLnBvaW50ZXJQb3NpdGlvblByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXHJcbiAgICAgIGJpZGlyZWN0aW9uYWw6IHRydWUsXHJcbiAgICAgIG1hcDogcG9zaXRpb24gPT4ge1xyXG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLnNjcmVlblZpZXdQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBpZiAoIHZpZXcgKSB7XHJcbiAgICAgICAgICBjb25zdCB2aWV3UG9zaXRpb24gPSB2aWV3Lmdsb2JhbFRvTG9jYWxQb2ludCggcG9zaXRpb24gKTtcclxuICAgICAgICAgIHJldHVybiBgZ2xvYmFsOiB4OiAke3JvdW5kKCBwb3NpdGlvbi54ICl9LCB5OiAke3JvdW5kKCBwb3NpdGlvbi55ICl9PGJyPnZpZXc6IHg6ICR7cm91bmQoIHZpZXdQb3NpdGlvbi54ICl9LCB5OiAke3JvdW5kKCB2aWV3UG9zaXRpb24ueSApfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuICctJztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHBvc2l0aW9uVGV4dCA9IG5ldyBSaWNoVGV4dCggcG9zaXRpb25TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEyIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb2xvclRleHRNYXAgPSAoIGNvbG9yOiBDb2xvciApID0+IHtcclxuICAgICAgcmV0dXJuIGAke2NvbG9yLnRvSGV4U3RyaW5nKCl9ICR7Y29sb3IudG9DU1MoKX1gO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGNvbG9yU3RyaW5nUHJvcGVydHkgPSBuZXcgTWFwcGVkUHJvcGVydHkoIHRoaXMuY29sb3JQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VULFxyXG4gICAgICBiaWRpcmVjdGlvbmFsOiB0cnVlLFxyXG4gICAgICBtYXA6IGNvbG9yVGV4dE1hcFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgY29sb3JUZXh0ID0gbmV3IFJpY2hUZXh0KCBjb2xvclN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jb2xvclByb3BlcnR5LmxpbmsoIGNvbG9yID0+IHtcclxuICAgICAgY29sb3JUZXh0LmZpbGwgPSBDb2xvci5nZXRMdW1pbmFuY2UoIGNvbG9yICkgPiAxMjggPyBDb2xvci5CTEFDSyA6IENvbG9yLldISVRFO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJvdW5kc0NvbG9yID0gbmV3IENvbG9yKCAnIzgwNDAwMCcgKTtcclxuICAgIGNvbnN0IHNlbGZCb3VuZHNDb2xvciA9IG5ldyBDb2xvciggJyMyMDgwMjAnICk7XHJcbiAgICBjb25zdCBub25JbnB1dEJhc2VkQ29sb3IgPSBuZXcgQ29sb3IoIDI1NSwgMTAwLCAwICk7XHJcbiAgICBjb25zdCBtb3VzZUNvbG9yID0gbmV3IENvbG9yKCAwLCAwLCAyNTUgKTtcclxuICAgIGNvbnN0IHRvdWNoQ29sb3IgPSBuZXcgQ29sb3IoIDI1NSwgMCwgMCApO1xyXG4gICAgY29uc3QgaW5wdXRCYXNlZENvbG9yID0gbmV3IENvbG9yKCAyMDAsIDAsIDIwMCApO1xyXG5cclxuICAgIGNvbnN0IGhpZ2hsaWdodEJhc2VDb2xvclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmlucHV0QmFzZWRQaWNraW5nUHJvcGVydHksIHRoaXMucG9pbnRlckFyZWFUeXBlUHJvcGVydHkgXSwgKCBpbnB1dEJhc2VkUGlja2luZywgcG9pbnRlckFyZWFUeXBlICkgPT4ge1xyXG4gICAgICBpZiAoIGlucHV0QmFzZWRQaWNraW5nICkge1xyXG4gICAgICAgIGlmICggcG9pbnRlckFyZWFUeXBlID09PSBQb2ludGVyQXJlYVR5cGUuTU9VU0UgKSB7XHJcbiAgICAgICAgICByZXR1cm4gbW91c2VDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHBvaW50ZXJBcmVhVHlwZSA9PT0gUG9pbnRlckFyZWFUeXBlLlRPVUNIICkge1xyXG4gICAgICAgICAgcmV0dXJuIHRvdWNoQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIGlucHV0QmFzZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG5vbklucHV0QmFzZWRDb2xvcjtcclxuICAgICAgfVxyXG4gICAgfSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb2xvckJhY2tncm91bmQgPSBuZXcgUGFuZWwoIGNvbG9yVGV4dCwge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IDAsXHJcbiAgICAgIHN0cm9rZTogbnVsbCxcclxuICAgICAgZmlsbDogdGhpcy5jb2xvclByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcHJldmlld05vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMucHJldmlld1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHByZXZpZXdCYWNrZ3JvdW5kID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMjAwLCAyMDAsIHtcclxuICAgICAgZmlsbDogbmV3IE5vZGVQYXR0ZXJuKCBuZXcgTm9kZSgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMCwgMTAsIHsgZmlsbDogJyNkZGQnIH0gKSxcclxuICAgICAgICAgIG5ldyBSZWN0YW5nbGUoIDEwLCAxMCwgMTAsIDEwLCB7IGZpbGw6ICcjZGRkJyB9ICksXHJcbiAgICAgICAgICBuZXcgUmVjdGFuZ2xlKCAwLCAxMCwgMTAsIDEwLCB7IGZpbGw6ICcjZmFmYWZhJyB9ICksXHJcbiAgICAgICAgICBuZXcgUmVjdGFuZ2xlKCAxMCwgMCwgMTAsIDEwLCB7IGZpbGw6ICcjZmFmYWZhJyB9IClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKSwgMiwgMCwgMCwgMjAsIDIwICksXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB0aGlzLnByZXZpZXdWaXNpYmxlUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnByZXZpZXdUcmFpbFByb3BlcnR5LmxpbmsoIHRyYWlsID0+IHtcclxuICAgICAgcHJldmlld05vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgaWYgKCB0cmFpbCApIHtcclxuICAgICAgICBwcmV2aWV3Tm9kZS5hZGRDaGlsZCggcHJldmlld0JhY2tncm91bmQgKTtcclxuICAgICAgICBjb25zdCBub2RlID0gdHJhaWwubGFzdE5vZGUoKTtcclxuICAgICAgICBpZiAoIG5vZGUuYm91bmRzLmlzVmFsaWQoKSApIHtcclxuICAgICAgICAgIGNvbnN0IHNjYWxlID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gKiAwLjkgKiBNYXRoLm1pbiggcHJldmlld0JhY2tncm91bmQuc2VsZkJvdW5kcy53aWR0aCAvIG5vZGUud2lkdGgsIHByZXZpZXdCYWNrZ3JvdW5kLnNlbGZCb3VuZHMuaGVpZ2h0IC8gbm9kZS5oZWlnaHQgKTtcclxuICAgICAgICAgIHByZXZpZXdOb2RlLmFkZENoaWxkKCBuZXcgTm9kZSgge1xyXG4gICAgICAgICAgICBzY2FsZTogc2NhbGUgLyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyxcclxuICAgICAgICAgICAgY2VudGVyOiBwcmV2aWV3QmFja2dyb3VuZC5jZW50ZXIsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgICAgbm9kZS5yYXN0ZXJpemVkKCB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uOiBzY2FsZSxcclxuICAgICAgICAgICAgICAgIHNvdXJjZUJvdW5kczogbm9kZS5ib3VuZHMuZGlsYXRlZCggbm9kZS5ib3VuZHMud2lkdGggKiAwLjAxICkucm91bmRlZE91dCgpXHJcbiAgICAgICAgICAgICAgfSApXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZUNvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAzLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuc2VsZWN0ZWROb2RlQ29udGVudFZpc2libGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5wcmV2aWV3VHJhaWxQcm9wZXJ0eS5saW5rKCB0cmFpbCA9PiB7XHJcbiAgICAgIHNlbGVjdGVkTm9kZUNvbnRlbnQuY2hpbGRyZW4gPSB0cmFpbCA/IGNyZWF0ZUluZm8oIHRyYWlsICkgOiBbXTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBmdXp6Q2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIGZ1enpQcm9wZXJ0eSwgJ0Z1enonICk7XHJcbiAgICBjb25zdCBtZWFzdXJpbmdUYXBlVmlzaWJsZUNoZWNrYm94ID0gbmV3IEhlbHBlckNoZWNrYm94KCBtZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5LCAnTWVhc3VyaW5nIFRhcGUnICk7XHJcbiAgICBjb25zdCB2aXN1YWxUcmVlVmlzaWJsZUNoZWNrYm94ID0gbmV3IEhlbHBlckNoZWNrYm94KCB0aGlzLnZpc3VhbFRyZWVWaXNpYmxlUHJvcGVydHksICdWaXN1YWwgVHJlZScgKTtcclxuICAgIGNvbnN0IHBkb21UcmVlVmlzaWJsZUNoZWNrYm94ID0gbmV3IEhlbHBlckNoZWNrYm94KCB0aGlzLnBkb21UcmVlVmlzaWJsZVByb3BlcnR5LCAnUERPTSBUcmVlJyApO1xyXG4gICAgY29uc3QgaW5wdXRCYXNlZFBpY2tpbmdDaGVja2JveCA9IG5ldyBIZWxwZXJDaGVja2JveCggdGhpcy5pbnB1dEJhc2VkUGlja2luZ1Byb3BlcnR5LCAnSW5wdXQtYmFzZWQnICk7XHJcbiAgICBjb25zdCB1c2VMZWFmTm9kZUNoZWNrYm94ID0gbmV3IEhlbHBlckNoZWNrYm94KCB0aGlzLnVzZUxlYWZOb2RlUHJvcGVydHksICdVc2UgTGVhZicsIHtcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiB0aGlzLmlucHV0QmFzZWRQaWNraW5nUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBoaWdobGlnaHRWaXNpYmxlQ2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIHRoaXMuaGlnaGxpZ2h0VmlzaWJsZVByb3BlcnR5LCAnSGlnaGxpZ2h0Jywge1xyXG4gICAgICBsYWJlbE9wdGlvbnM6IHtcclxuICAgICAgICBmaWxsOiBoaWdobGlnaHRCYXNlQ29sb3JQcm9wZXJ0eVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBib3VuZHNWaXNpYmxlQ2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIHRoaXMuYm91bmRzVmlzaWJsZVByb3BlcnR5LCAnQm91bmRzJywge1xyXG4gICAgICBsYWJlbE9wdGlvbnM6IHtcclxuICAgICAgICBmaWxsOiBib3VuZHNDb2xvclxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzZWxmQm91bmRzVmlzaWJsZUNoZWNrYm94ID0gbmV3IEhlbHBlckNoZWNrYm94KCB0aGlzLnNlbGZCb3VuZHNWaXNpYmxlUHJvcGVydHksICdTZWxmIEJvdW5kcycsIHtcclxuICAgICAgbGFiZWxPcHRpb25zOiB7XHJcbiAgICAgICAgZmlsbDogc2VsZkJvdW5kc0NvbG9yXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGdldEhlbHBlck5vZGVWaXNpYmxlQ2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIHRoaXMuZ2V0SGVscGVyTm9kZVZpc2libGVQcm9wZXJ0eSwgJ2dldEhlbHBlck5vZGUoKScgKTtcclxuXHJcbiAgICBjb25zdCBwb2ludGVyQXJlYVR5cGVSYWRpb0J1dHRvbkdyb3VwID0gbmV3IEFxdWFSYWRpb0J1dHRvbkdyb3VwPFBvaW50ZXJBcmVhVHlwZT4oIHRoaXMucG9pbnRlckFyZWFUeXBlUHJvcGVydHksIFtcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBQb2ludGVyQXJlYVR5cGUuTU9VU0UsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnTW91c2UnLCB7IGZvbnRTaXplOiAxMiB9IClcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBQb2ludGVyQXJlYVR5cGUuVE9VQ0gsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnVG91Y2gnLCB7IGZvbnRTaXplOiAxMiB9IClcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBQb2ludGVyQXJlYVR5cGUuTk9ORSxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdOb25lJywgeyBmb250U2l6ZTogMTIgfSApXHJcbiAgICAgIH1cclxuICAgIF0sIHtcclxuICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiB0aGlzLmlucHV0QmFzZWRQaWNraW5nUHJvcGVydHksXHJcbiAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHhTcGFjaW5nOiAzXHJcbiAgICAgIH0sXHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2VsZWN0ZWRUcmFpbENvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuc2VsZWN0ZWRUcmFpbENvbnRlbnRWaXNpYmxlUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnByZXZpZXdUcmFpbFByb3BlcnR5LmxpbmsoICggdHJhaWw6IFRyYWlsIHwgbnVsbCApID0+IHtcclxuICAgICAgc2VsZWN0ZWRUcmFpbENvbnRlbnQuY2hpbGRyZW4gPSBbXTtcclxuXHJcbiAgICAgIGlmICggdHJhaWwgKSB7XHJcblxyXG4gICAgICAgIHRyYWlsLm5vZGVzLnNsaWNlKCkuZm9yRWFjaCggKCBub2RlLCBpbmRleCApID0+IHtcclxuICAgICAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LmFkZENoaWxkKCBuZXcgUmljaFRleHQoIGAke2luZGV4ID4gMCA/IHRyYWlsLm5vZGVzWyBpbmRleCAtIDEgXS5jaGlsZHJlbi5pbmRleE9mKCBub2RlICkgOiAnLSd9ICR7bm9kZS5jb25zdHJ1Y3Rvci5uYW1lfWAsIHtcclxuICAgICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApLFxyXG4gICAgICAgICAgICBmaWxsOiBpbmRleCA9PT0gdHJhaWwubm9kZXMubGVuZ3RoIC0gMSA/ICdibGFjaycgOiAnI2JiYicsXHJcbiAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBsZWZ0TWFyZ2luOiBpbmRleCAqIDEwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICBpbnB1dExpc3RlbmVyczogWyBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgICAgICAgICAgZmlyZTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFRyYWlsUHJvcGVydHkudmFsdWUgPSB0cmFpbC5zdWJ0cmFpbFRvKCBub2RlICk7XHJcbiAgICAgICAgICAgICAgICBmb2N1c1NlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgICAgICAgIH0gKSBdXHJcbiAgICAgICAgICB9ICkgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgdHJhaWwubGFzdE5vZGUoKS5jaGlsZHJlbi5mb3JFYWNoKCAoIG5vZGUsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgICAgc2VsZWN0ZWRUcmFpbENvbnRlbnQuYWRkQ2hpbGQoIG5ldyBSaWNoVGV4dCggYCR7dHJhaWwubGFzdE5vZGUoKS5jaGlsZHJlbi5pbmRleE9mKCBub2RlICl9ICR7bm9kZS5jb25zdHJ1Y3Rvci5uYW1lfWAsIHtcclxuICAgICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApLFxyXG4gICAgICAgICAgICBmaWxsOiAnIzg4ZicsXHJcbiAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBsZWZ0TWFyZ2luOiB0cmFpbC5ub2Rlcy5sZW5ndGggKiAxMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgaW5wdXRMaXN0ZW5lcnM6IFsgbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgICAgICAgICAgIGZpcmU6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LnZhbHVlID0gdHJhaWwuY29weSgpLmFkZERlc2NlbmRhbnQoIG5vZGUsIGluZGV4ICk7XHJcbiAgICAgICAgICAgICAgICBmb2N1c1NlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgICAgICAgIH0gKSBdXHJcbiAgICAgICAgICB9ICkgKTtcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIFZpc2liaWxpdHkgY2hlY2tcclxuICAgICAgICBpZiAoICF0cmFpbC5pc1Zpc2libGUoKSApIHtcclxuICAgICAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LmFkZENoaWxkKCBuZXcgVGV4dCggJ2ludmlzaWJsZScsIHsgZmlsbDogJyM2MGEnLCBmb250U2l6ZTogMTIgfSApICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHRyYWlsLmdldE9wYWNpdHkoKSAhPT0gMSApIHtcclxuICAgICAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LmFkZENoaWxkKCBuZXcgVGV4dCggYG9wYWNpdHk6ICR7dHJhaWwuZ2V0T3BhY2l0eSgpfWAsIHsgZmlsbDogJyM4ODgnLCBmb250U2l6ZTogMTIgfSApICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBoYXNQaWNrYWJsZUZhbHNlRXF1aXZhbGVudCA9IF8uc29tZSggdHJhaWwubm9kZXMsIG5vZGUgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5vZGUucGlja2FibGUgPT09IGZhbHNlIHx8ICFub2RlLnZpc2libGU7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGNvbnN0IGhhc1BpY2thYmxlVHJ1ZUVxdWl2YWxlbnQgPSBfLnNvbWUoIHRyYWlsLm5vZGVzLCBub2RlID0+IHtcclxuICAgICAgICAgIHJldHVybiBub2RlLmlucHV0TGlzdGVuZXJzLmxlbmd0aCA+IDAgfHwgbm9kZS5waWNrYWJsZSA9PT0gdHJ1ZTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgaWYgKCAhaGFzUGlja2FibGVGYWxzZUVxdWl2YWxlbnQgJiYgaGFzUGlja2FibGVUcnVlRXF1aXZhbGVudCApIHtcclxuICAgICAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LmFkZENoaWxkKCBuZXcgVGV4dCggJ0hpdCBUZXN0ZWQnLCB7IGZpbGw6ICcjZjAwJywgZm9udFNpemU6IDEyIH0gKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCAhdHJhaWwuZ2V0TWF0cml4KCkuaXNJZGVudGl0eSgpICkge1xyXG4gICAgICAgICAgLy8gV2h5IGlzIHRoaXMgd3JhcHBlciBub2RlIG5lZWRlZD9cclxuICAgICAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LmFkZENoaWxkKCBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBuZXcgTWF0cml4M05vZGUoIHRyYWlsLmdldE1hdHJpeCgpICkgXSB9ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB2aXN1YWxUcmVlTm9kZSA9IG5ldyBUcmVlTm9kZSggdGhpcy52aXN1YWxUcmVlVmlzaWJsZVByb3BlcnR5LCB0aGlzLCAoKSA9PiBuZXcgVmlzdWFsVHJlZU5vZGUoIG5ldyBUcmFpbCggc2ltRGlzcGxheS5yb290Tm9kZSApLCB0aGlzICkgKTtcclxuICAgIGNvbnN0IHBkb21UcmVlTm9kZSA9IG5ldyBUcmVlTm9kZSggdGhpcy5wZG9tVHJlZVZpc2libGVQcm9wZXJ0eSwgdGhpcywgKCkgPT4gbmV3IFBET01UcmVlTm9kZSggc2ltRGlzcGxheS5fcm9vdFBET01JbnN0YW5jZSEsIHRoaXMgKSApO1xyXG5cclxuICAgIGNvbnN0IGZvY3VzU2VsZWN0ZWQgPSAoKSA9PiB7XHJcbiAgICAgIHZpc3VhbFRyZWVOb2RlLmZvY3VzU2VsZWN0ZWQoKTtcclxuICAgICAgcGRvbVRyZWVOb2RlLmZvY3VzU2VsZWN0ZWQoKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgYm91bmRzUGF0aCA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5ib3VuZHNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogYm91bmRzQ29sb3IsXHJcbiAgICAgIGZpbGw6IGJvdW5kc0NvbG9yLndpdGhBbHBoYSggMC4xICksXHJcbiAgICAgIGxpbmVEYXNoOiBbIDIsIDIgXSxcclxuICAgICAgbGluZURhc2hPZmZzZXQ6IDJcclxuICAgIH0gKTtcclxuICAgIHRoaXMucHJldmlld1RyYWlsUHJvcGVydHkubGluayggdHJhaWwgPT4ge1xyXG4gICAgICBpZiAoIHRyYWlsICYmIHRyYWlsLmxhc3ROb2RlKCkubG9jYWxCb3VuZHMuaXNWYWxpZCgpICkge1xyXG4gICAgICAgIGJvdW5kc1BhdGguc2hhcGUgPSBTaGFwZS5ib3VuZHMoIHRyYWlsLmxhc3ROb2RlKCkubG9jYWxCb3VuZHMgKS50cmFuc2Zvcm1lZCggdHJhaWwuZ2V0TWF0cml4KCkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBib3VuZHNQYXRoLnNoYXBlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNlbGZCb3VuZHNQYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB0aGlzLnNlbGZCb3VuZHNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogc2VsZkJvdW5kc0NvbG9yLFxyXG4gICAgICBmaWxsOiBzZWxmQm91bmRzQ29sb3Iud2l0aEFscGhhKCAwLjEgKSxcclxuICAgICAgbGluZURhc2g6IFsgMiwgMiBdLFxyXG4gICAgICBsaW5lRGFzaE9mZnNldDogMVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5wcmV2aWV3VHJhaWxQcm9wZXJ0eS5saW5rKCB0cmFpbCA9PiB7XHJcbiAgICAgIGlmICggdHJhaWwgJiYgdHJhaWwubGFzdE5vZGUoKS5zZWxmQm91bmRzLmlzVmFsaWQoKSApIHtcclxuICAgICAgICBzZWxmQm91bmRzUGF0aC5zaGFwZSA9IFNoYXBlLmJvdW5kcyggdHJhaWwubGFzdE5vZGUoKS5zZWxmQm91bmRzICkudHJhbnNmb3JtZWQoIHRyYWlsLmdldE1hdHJpeCgpICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc2VsZkJvdW5kc1BhdGguc2hhcGUgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaGlnaGxpZ2h0RmlsbFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBoaWdobGlnaHRCYXNlQ29sb3JQcm9wZXJ0eSBdLCBjb2xvciA9PiBjb2xvci53aXRoQWxwaGEoIDAuMiApLCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xyXG4gICAgY29uc3QgaGlnaGxpZ2h0UGF0aCA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIHN0cm9rZTogaGlnaGxpZ2h0QmFzZUNvbG9yUHJvcGVydHksXHJcbiAgICAgIGxpbmVEYXNoOiBbIDIsIDIgXSxcclxuICAgICAgZmlsbDogaGlnaGxpZ2h0RmlsbFByb3BlcnR5LFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuaGlnaGxpZ2h0VmlzaWJsZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnByZXZpZXdTaGFwZVByb3BlcnR5LmxpbmsoIHNoYXBlID0+IHtcclxuICAgICAgaGlnaGxpZ2h0UGF0aC5zaGFwZSA9IHNoYXBlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGhlbHBlck5vZGVDb250YWluZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuZ2V0SGVscGVyTm9kZVZpc2libGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zZWxlY3RlZFRyYWlsUHJvcGVydHkubGluayggdHJhaWwgPT4ge1xyXG4gICAgICBpZiAoIHRyYWlsICkge1xyXG4gICAgICAgIGhlbHBlck5vZGVDb250YWluZXIubWF0cml4ID0gdHJhaWwuZ2V0TWF0cml4KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuaGVscGVyTm9kZVByb3BlcnR5LmxpbmsoIG5vZGUgPT4ge1xyXG4gICAgICBoZWxwZXJOb2RlQ29udGFpbmVyLnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICAgIGlmICggbm9kZSApIHtcclxuICAgICAgICBoZWxwZXJOb2RlQ29udGFpbmVyLmFkZENoaWxkKCBub2RlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcblxyXG4gICAgLy8gdGhpcy5pbnB1dEJhc2VkUGlja2luZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcclxuICAgIC8vIHRoaXMudXNlTGVhZk5vZGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xyXG4gICAgLy8gdGhpcy5wb2ludGVyQXJlYVR5cGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBQb2ludGVyQXJlYVR5cGUuTU9VU0UsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XHJcblxyXG4gICAgaGVscGVyUm9vdC5hZGRDaGlsZCggYm91bmRzUGF0aCApO1xyXG4gICAgaGVscGVyUm9vdC5hZGRDaGlsZCggc2VsZkJvdW5kc1BhdGggKTtcclxuICAgIGhlbHBlclJvb3QuYWRkQ2hpbGQoIGhpZ2hsaWdodFBhdGggKTtcclxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICBiYWNrZ3JvdW5kTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgUHJlc3NMaXN0ZW5lcigge1xyXG4gICAgICBwcmVzczogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LnZhbHVlID0gdGhpcy5wb2ludGVyVHJhaWxQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBmb2N1c1NlbGVjdGVkKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKSApO1xyXG4gICAgaGVscGVyUm9vdC5hZGRDaGlsZCggYmFja2dyb3VuZE5vZGUgKTtcclxuICAgIGhlbHBlclJvb3QuYWRkQ2hpbGQoIGhlbHBlck5vZGVDb250YWluZXIgKTtcclxuXHJcbiAgICBjb25zdCB1bmRlclBvaW50ZXJOb2RlID0gbmV3IEZsb3dCb3goIHtcclxuICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgcG9zaXRpb25UZXh0LFxyXG4gICAgICAgIGNvbG9yQmFja2dyb3VuZFxyXG4gICAgICBdLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMudW5kZXJQb2ludGVyVmlzaWJsZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uc05vZGUgPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAzLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIGNyZWF0ZUhlYWRlclRleHQoICdUb29scycgKSxcclxuICAgICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgICAgc3BhY2luZzogMyxcclxuICAgICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgICAgICBmdXp6Q2hlY2tib3gsXHJcbiAgICAgICAgICAgICAgICBtZWFzdXJpbmdUYXBlVmlzaWJsZUNoZWNrYm94XHJcbiAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9ICksXHJcbiAgICAgICAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgICAgIHZpc3VhbFRyZWVWaXNpYmxlQ2hlY2tib3gsXHJcbiAgICAgICAgICAgICAgICAuLi4oIHNpbURpc3BsYXkuX2FjY2Vzc2libGUgPyBbIHBkb21UcmVlVmlzaWJsZUNoZWNrYm94IF0gOiBbXSApXHJcbiAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9IClcclxuICAgICAgICAgIF1cclxuICAgICAgICB9ICksXHJcbiAgICAgICAgY3JlYXRlSGVhZGVyVGV4dCggJ1BpY2tpbmcnLCB1bmRlZmluZWQsIHsgbGF5b3V0T3B0aW9uczogeyB0b3BNYXJnaW46IDMgfSB9ICksXHJcbiAgICAgICAgbmV3IFZCb3goIHtcclxuICAgICAgICAgIHNwYWNpbmc6IDMsXHJcbiAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgbmV3IEhCb3goIHtcclxuICAgICAgICAgICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICAgICAgaW5wdXRCYXNlZFBpY2tpbmdDaGVja2JveCxcclxuICAgICAgICAgICAgICAgIHVzZUxlYWZOb2RlQ2hlY2tib3hcclxuICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0gKSxcclxuICAgICAgICAgICAgcG9pbnRlckFyZWFUeXBlUmFkaW9CdXR0b25Hcm91cFxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBjcmVhdGVIZWFkZXJUZXh0KCAnU2hvdycsIHVuZGVmaW5lZCwgeyBsYXlvdXRPcHRpb25zOiB7IHRvcE1hcmdpbjogMyB9IH0gKSxcclxuICAgICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgICAgc3BhY2luZzogMyxcclxuICAgICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRWaXNpYmxlQ2hlY2tib3gsXHJcbiAgICAgICAgICAgICAgICBnZXRIZWxwZXJOb2RlVmlzaWJsZUNoZWNrYm94XHJcbiAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9ICksXHJcbiAgICAgICAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgICAgIGJvdW5kc1Zpc2libGVDaGVja2JveCxcclxuICAgICAgICAgICAgICAgIHNlbGZCb3VuZHNWaXNpYmxlQ2hlY2tib3hcclxuICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0gKVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMub3B0aW9uc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGhlbHBlclJlYWRvdXRDb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBjcmVhdGVDb2xsYXBzaWJsZUhlYWRlclRleHQoICdVbmRlciBQb2ludGVyJywgdGhpcy51bmRlclBvaW50ZXJWaXNpYmxlUHJvcGVydHksIHVuZGVyUG9pbnRlck5vZGUsIHsgbGF5b3V0T3B0aW9uczogeyB0b3BNYXJnaW46IDAgfSB9ICksXHJcbiAgICAgICAgdW5kZXJQb2ludGVyTm9kZSxcclxuICAgICAgICBjcmVhdGVDb2xsYXBzaWJsZUhlYWRlclRleHQoICdPcHRpb25zJywgdGhpcy5vcHRpb25zVmlzaWJsZVByb3BlcnR5LCBvcHRpb25zTm9kZSApLFxyXG4gICAgICAgIG9wdGlvbnNOb2RlLFxyXG4gICAgICAgIGNyZWF0ZUNvbGxhcHNpYmxlSGVhZGVyVGV4dCggJ1ByZXZpZXcnLCB0aGlzLnByZXZpZXdWaXNpYmxlUHJvcGVydHksIHByZXZpZXdOb2RlICksXHJcbiAgICAgICAgcHJldmlld05vZGUsXHJcbiAgICAgICAgY3JlYXRlQ29sbGFwc2libGVIZWFkZXJUZXh0KCAnU2VsZWN0ZWQgVHJhaWwnLCB0aGlzLnNlbGVjdGVkVHJhaWxDb250ZW50VmlzaWJsZVByb3BlcnR5LCBzZWxlY3RlZFRyYWlsQ29udGVudCApLFxyXG4gICAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LFxyXG4gICAgICAgIGNyZWF0ZUNvbGxhcHNpYmxlSGVhZGVyVGV4dCggJ1NlbGVjdGVkIE5vZGUnLCB0aGlzLnNlbGVjdGVkTm9kZUNvbnRlbnRWaXNpYmxlUHJvcGVydHksIHNlbGVjdGVkTm9kZUNvbnRlbnQgKSxcclxuICAgICAgICBzZWxlY3RlZE5vZGVDb250ZW50XHJcbiAgICAgIF0sXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5oZWxwZXJWaXNpYmxlUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGhlbHBlclJlYWRvdXRDb2xsYXBzaWJsZSA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgY3JlYXRlQ29sbGFwc2libGVIZWFkZXJUZXh0KCAnSGVscGVyJywgdGhpcy5oZWxwZXJWaXNpYmxlUHJvcGVydHksIGhlbHBlclJlYWRvdXRDb250ZW50ICksXHJcbiAgICAgICAgbmV3IEhTZXBhcmF0b3IoKSxcclxuICAgICAgICBoZWxwZXJSZWFkb3V0Q29udGVudFxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBoZWxwZXJSZWFkb3V0UGFuZWwgPSBuZXcgUGFuZWwoIGhlbHBlclJlYWRvdXRDb2xsYXBzaWJsZSwge1xyXG4gICAgICBmaWxsOiAncmdiYSgyNTUsMjU1LDI1NSwwLjg1KScsXHJcbiAgICAgIHN0cm9rZTogJ3JnYmEoMCwwLDAsMC44NSknLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDBcclxuICAgIH0gKTtcclxuICAgIGhlbHBlclJlYWRvdXRQYW5lbC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHRyYW5zbGF0ZU5vZGU6IHRydWUsXHJcbiAgICAgIHRhcmdldE5vZGU6IGhlbHBlclJlYWRvdXRQYW5lbCxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gQWxsb3cgc2Nyb2xsaW5nIHRvIHNjcm9sbCB0aGUgcGFuZWwncyBwb3NpdGlvblxyXG4gICAgaGVscGVyUmVhZG91dFBhbmVsLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgICAgd2hlZWw6IGV2ZW50ID0+IHtcclxuICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5kb21FdmVudCEuZGVsdGFZO1xyXG4gICAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSAxO1xyXG4gICAgICAgIGhlbHBlclJlYWRvdXRQYW5lbC55IC09IGRlbHRhWSAqIG11bHRpcGxpZXI7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGhlbHBlclJvb3QuYWRkQ2hpbGQoIGhlbHBlclJlYWRvdXRQYW5lbCApO1xyXG5cclxuICAgIGhlbHBlclJvb3QuYWRkQ2hpbGQoIHZpc3VhbFRyZWVOb2RlICk7XHJcbiAgICBoZWxwZXJSb290LmFkZENoaWxkKCBwZG9tVHJlZU5vZGUgKTtcclxuXHJcbiAgICBjb25zdCBtZWFzdXJpbmdUYXBlTm9kZSA9IG5ldyBNZWFzdXJpbmdUYXBlTm9kZSggbWVhc3VyaW5nVGFwZVVuaXRzUHJvcGVydHksIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBtZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0ZXh0QmFja2dyb3VuZENvbG9yOiAncmdiYSgwLDAsMCwwLjUpJ1xyXG4gICAgfSApO1xyXG4gICAgbWVhc3VyaW5nVGFwZU5vZGUuYmFzZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggMTAwLCAzMDAgKTtcclxuICAgIG1lYXN1cmluZ1RhcGVOb2RlLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggMjAwLCAzMDAgKTtcclxuICAgIGhlbHBlclJvb3QuYWRkQ2hpbGQoIG1lYXN1cmluZ1RhcGVOb2RlICk7XHJcblxyXG4gICAgY29uc3QgcmVzaXplTGlzdGVuZXIgPSAoIHNpemU6IERpbWVuc2lvbjIgKSA9PiB7XHJcbiAgICAgIHRoaXMuaGVscGVyRGlzcGxheSEud2lkdGggPSBzaXplLndpZHRoO1xyXG4gICAgICB0aGlzLmhlbHBlckRpc3BsYXkhLmhlaWdodCA9IHNpemUuaGVpZ2h0O1xyXG4gICAgICBsYXlvdXRCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IGxheW91dEJvdW5kc1Byb3BlcnR5LnZhbHVlLndpdGhNYXhYKCBzaXplLndpZHRoICkud2l0aE1heFkoIHNpemUuaGVpZ2h0ICk7XHJcbiAgICAgIGJhY2tncm91bmROb2RlLm1vdXNlQXJlYSA9IG5ldyBCb3VuZHMyKCAwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xyXG4gICAgICBiYWNrZ3JvdW5kTm9kZS50b3VjaEFyZWEgPSBuZXcgQm91bmRzMiggMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcclxuXHJcbiAgICAgIHZpc3VhbFRyZWVOb2RlLnJlc2l6ZSggc2l6ZSApO1xyXG4gICAgICBwZG9tVHJlZU5vZGUucmVzaXplKCBzaXplICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGZyYW1lTGlzdGVuZXIgPSAoIGR0OiBudW1iZXIgKSA9PiB7XHJcbiAgICAgIHRoaXMub3ZlckludGVyZmFjZVByb3BlcnR5LnZhbHVlID1cclxuICAgICAgICBoZWxwZXJSZWFkb3V0UGFuZWwuYm91bmRzLmNvbnRhaW5zUG9pbnQoIHRoaXMucG9pbnRlclBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSB8fFxyXG4gICAgICAgICggdGhpcy52aXN1YWxUcmVlVmlzaWJsZVByb3BlcnR5LnZhbHVlICYmIHZpc3VhbFRyZWVOb2RlLmJvdW5kcy5jb250YWluc1BvaW50KCB0aGlzLnBvaW50ZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKSB8fFxyXG4gICAgICAgICggdGhpcy5wZG9tVHJlZVZpc2libGVQcm9wZXJ0eS52YWx1ZSAmJiBwZG9tVHJlZU5vZGUuYm91bmRzLmNvbnRhaW5zUG9pbnQoIHRoaXMucG9pbnRlclBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSApIHx8XHJcbiAgICAgICAgaGVscGVyTm9kZUNvbnRhaW5lci5jb250YWluc1BvaW50KCB0aGlzLnBvaW50ZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICB0aGlzLmhlbHBlckRpc3BsYXk/LnVwZGF0ZURpc3BsYXkoKTtcclxuICAgIH07XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgKCBldmVudDogS2V5Ym9hcmRFdmVudCApID0+IHtcclxuICAgICAgaWYgKCBldmVudC5rZXkgPT09ICdFc2NhcGUnICkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWN0aXZlUHJvcGVydHkubGF6eUxpbmsoIGFjdGl2ZSA9PiB7XHJcbiAgICAgIGlmICggYWN0aXZlICkge1xyXG4gICAgICAgIHNpbS5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjb25zdCBzY3JlZW4gPSBzaW0uc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBpZiAoIHNjcmVlbi5oYXNWaWV3KCkgKSB7XHJcbiAgICAgICAgICB0aGlzLnNjcmVlblZpZXdQcm9wZXJ0eS52YWx1ZSA9IHNjcmVlbi52aWV3O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuc2NyZWVuVmlld1Byb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaGVscGVyRGlzcGxheSA9IG5ldyBEaXNwbGF5KCBoZWxwZXJSb290LCB7XHJcbiAgICAgICAgICBhc3N1bWVGdWxsV2luZG93OiB0cnVlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHRoaXMuaGVscGVyRGlzcGxheS5pbml0aWFsaXplRXZlbnRzKCk7XHJcblxyXG4gICAgICAgIHNpbS5kaW1lbnNpb25Qcm9wZXJ0eS5saW5rKCByZXNpemVMaXN0ZW5lciApO1xyXG4gICAgICAgIGFuaW1hdGlvbkZyYW1lVGltZXIuYWRkTGlzdGVuZXIoIGZyYW1lTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggdGhpcy5oZWxwZXJEaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuICAgICAgICB0aGlzLmhlbHBlckRpc3BsYXkuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAnMTAwMDAnO1xyXG5cclxuICAgICAgICBjb25zdCBvbkxvY2F0aW9uRXZlbnQgPSAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudCB8IE1vdXNlRXZlbnQ+ICkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wb2ludGVyUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGV2ZW50LnBvaW50ZXIucG9pbnQ7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5oZWxwZXJEaXNwbGF5LmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgICAgICAgIG1vdmU6IG9uTG9jYXRpb25FdmVudCxcclxuICAgICAgICAgIGRvd246IG9uTG9jYXRpb25FdmVudCxcclxuICAgICAgICAgIHVwOiBvbkxvY2F0aW9uRXZlbnRcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5zY3JlZW5WaWV3UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICBtZWFzdXJpbmdUYXBlVW5pdHNQcm9wZXJ0eS52YWx1ZSA9IHtcclxuICAgICAgICAgICAgbmFtZTogJ3ZpZXcgdW5pdHMnLFxyXG4gICAgICAgICAgICBtdWx0aXBsaWVyOiB0aGlzLnNjcmVlblZpZXdQcm9wZXJ0eS52YWx1ZS5nZXRHbG9iYWxUb0xvY2FsTWF0cml4KCkuZ2V0U2NhbGVWZWN0b3IoKS54XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zaW1EaXNwbGF5LmZvcmVpZ25PYmplY3RSYXN0ZXJpemF0aW9uKCAoIGRhdGFVUkk6IHN0cmluZyB8IG51bGwgKSA9PiB7XHJcbiAgICAgICAgICBpZiAoIGRhdGFVUkkgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2ltZycgKTtcclxuICAgICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbWFnZS53aWR0aDtcclxuICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xyXG4gICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoIGltYWdlLCAwLCAwICk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICggdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VEYXRhUHJvcGVydHkudmFsdWUgPSBjb250ZXh0LmdldEltYWdlRGF0YSggMCwgMCwgd2lkdGgsIGhlaWdodCApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBkYXRhVVJJO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnQ291bGQgbm90IGxvYWQgZm9yZWlnbiBvYmplY3QgcmFzdGVyaXphdGlvbicgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc2ltLmRpbWVuc2lvblByb3BlcnR5LnVubGluayggcmVzaXplTGlzdGVuZXIgKTtcclxuICAgICAgICBhbmltYXRpb25GcmFtZVRpbWVyLnJlbW92ZUxpc3RlbmVyKCBmcmFtZUxpc3RlbmVyICk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoIHRoaXMuaGVscGVyRGlzcGxheSEuZG9tRWxlbWVudCApO1xyXG5cclxuICAgICAgICB0aGlzLmhlbHBlckRpc3BsYXkhLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgICAgLy8gVW5wYXVzZSB0aGUgc2ltdWxhdGlvblxyXG4gICAgICAgIHNpbS5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIENsZWFyIGltYWdlRGF0YSBzaW5jZSBpdCB3b24ndCBiZSBhY2N1cmF0ZSB3aGVuIHdlIHJlLW9wZW5cclxuICAgICAgICB0aGlzLmltYWdlRGF0YVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gSGlkZSB0aGUgdHJlZSB3aGVuIGNsb3NpbmcsIHNvIGl0IHN0YXJ0cyB1cCBxdWlja2x5XHJcbiAgICAgICAgdGhpcy52aXN1YWxUcmVlVmlzaWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIFNpbmdsZXRvbiwgbGF6aWx5IGNyZWF0ZWQgc28gd2UgZG9uJ3Qgc2xvdyBkb3duIHN0YXJ0dXBcclxuICBwdWJsaWMgc3RhdGljIGhlbHBlcj86IEhlbHBlcjtcclxuXHJcbiAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCBzaW06IFNpbSwgc2ltRGlzcGxheTogU2ltRGlzcGxheSApOiB2b2lkIHtcclxuICAgIC8vIEN0cmwgKyBzaGlmdCArIEggKHdpbGwgb3BlbiB0aGUgaGVscGVyKVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCAoIGV2ZW50OiBLZXlib2FyZEV2ZW50ICkgPT4ge1xyXG4gICAgICBpZiAoIGV2ZW50LmN0cmxLZXkgJiYgZXZlbnQua2V5ID09PSAnSCcgKSB7XHJcblxyXG4gICAgICAgIC8vIExhenkgY3JlYXRpb25cclxuICAgICAgICBpZiAoICFIZWxwZXIuaGVscGVyICkge1xyXG4gICAgICAgICAgSGVscGVyLmhlbHBlciA9IG5ldyBIZWxwZXIoIHNpbSwgc2ltRGlzcGxheSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgSGVscGVyLmhlbHBlci5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9ICFIZWxwZXIuaGVscGVyLmFjdGl2ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ0hlbHBlcicsIEhlbHBlciApO1xyXG5cclxudHlwZSBIZWxwZXJDaGVja2JveFNlbGZPcHRpb25zID0ge1xyXG4gIGxhYmVsT3B0aW9ucz86IFJpY2hUZXh0T3B0aW9ucztcclxufTtcclxuXHJcbnR5cGUgSGVscGVyQ2hlY2tib3hPcHRpb25zID0gSGVscGVyQ2hlY2tib3hTZWxmT3B0aW9ucyAmIENoZWNrYm94T3B0aW9ucztcclxuXHJcbmNsYXNzIEhlbHBlckNoZWNrYm94IGV4dGVuZHMgQ2hlY2tib3gge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBsYWJlbDogc3RyaW5nLCBwcm92aWRlZE9wdGlvbnM/OiBIZWxwZXJDaGVja2JveE9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEhlbHBlckNoZWNrYm94T3B0aW9ucywgSGVscGVyQ2hlY2tib3hTZWxmT3B0aW9ucywgQ2hlY2tib3hPcHRpb25zPigpKCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXHJcbiAgICAgIGJveFdpZHRoOiAxNCxcclxuICAgICAgbGFiZWxPcHRpb25zOiB7XHJcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApXHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBwcm9wZXJ0eSwgbmV3IFJpY2hUZXh0KCBsYWJlbCwgb3B0aW9ucy5sYWJlbE9wdGlvbnMgKSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gY2xhc3MgRHJhZ2dhYmxlRGl2aWRlciBleHRlbmRzIFJlY3RhbmdsZSB7XHJcbi8vICAgY29uc3RydWN0b3IoIHByZWZlcnJlZEJvdW5kc1Byb3BlcnR5LCBvcmllbnRhdGlvbiwgaW5pdGlhbFNlcGFyYXRvckxvY2F0aW9uLCBwdXNoRnJvbU1heCApIHtcclxuLy9cclxuLy8gICAgIHN1cGVyKCB7XHJcbi8vICAgICAgIGZpbGw6ICcjNjY2JyxcclxuLy8gICAgICAgY3Vyc29yOiBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ3ctcmVzaXplJyA6ICduLXJlc2l6ZSdcclxuLy8gICAgIH0gKTtcclxuLy9cclxuLy8gICAgIHRoaXMubWluQm91bmRzUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApICk7XHJcbi8vICAgICB0aGlzLm1heEJvdW5kc1Byb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKSApO1xyXG4vL1xyXG4vLyAgICAgdGhpcy5wcmVmZXJyZWRCb3VuZHNQcm9wZXJ0eSA9IHByZWZlcnJlZEJvdW5kc1Byb3BlcnR5O1xyXG4vLyAgICAgdGhpcy5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xyXG4vLyAgICAgdGhpcy5wcmltYXJ5Q29vcmRpbmF0ZSA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyAneCcgOiAneSc7XHJcbi8vICAgICB0aGlzLnNlY29uZGFyeUNvb3JkaW5hdGUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ3knIDogJ3gnO1xyXG4vLyAgICAgdGhpcy5wcmltYXJ5TmFtZSA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyAnd2lkdGgnIDogJ2hlaWdodCc7XHJcbi8vICAgICB0aGlzLnNlY29uZGFyeU5hbWUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xyXG4vLyAgICAgdGhpcy5wcmltYXJ5UmVjdE5hbWUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ3JlY3RXaWR0aCcgOiAncmVjdEhlaWdodCc7XHJcbi8vICAgICB0aGlzLnNlY29uZGFyeVJlY3ROYW1lID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/ICdyZWN0SGVpZ2h0JyA6ICdyZWN0V2lkdGgnO1xyXG4vLyAgICAgdGhpcy5taW5Db29yZGluYXRlID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/ICdsZWZ0JyA6ICd0b3AnO1xyXG4vLyAgICAgdGhpcy5tYXhDb29yZGluYXRlID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/ICdyaWdodCcgOiAnYm90dG9tJztcclxuLy8gICAgIHRoaXMuY2VudGVyTmFtZSA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyAnY2VudGVyWCcgOiAnY2VudGVyWSc7XHJcbi8vICAgICB0aGlzLm1pbmltdW0gPSAxMDA7XHJcbi8vXHJcbi8vICAgICB0aGlzLnNlcGFyYXRvckxvY2F0aW9uID0gaW5pdGlhbFNlcGFyYXRvckxvY2F0aW9uO1xyXG4vL1xyXG4vLyAgICAgdGhpc1sgdGhpcy5wcmltYXJ5UmVjdE5hbWUgXSA9IDI7XHJcbi8vXHJcbi8vICAgICB2YXIgZHJhZ0xpc3RlbmVyID0gbmV3IHBoZXQuc2NlbmVyeS5EcmFnTGlzdGVuZXIoIHtcclxuLy8gICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG4vLyAgICAgICAgIHRoaXMuc2VwYXJhdG9yTG9jYXRpb24gPSBkcmFnTGlzdGVuZXIucGFyZW50UG9pbnRbIHRoaXMucHJpbWFyeUNvb3JkaW5hdGUgXTtcclxuLy8gICAgICAgICB0aGlzLmxheW91dCgpO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICB9ICk7XHJcbi8vICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGRyYWdMaXN0ZW5lciApO1xyXG4vL1xyXG4vLyAgICAgcHJlZmVycmVkQm91bmRzUHJvcGVydHkubGluayggKCBuZXdQcmVmZXJyZWRCb3VuZHMsIG9sZFByZWZlcnJlZEJvdW5kcyApID0+IHtcclxuLy8gICAgICAgaWYgKCBwdXNoRnJvbU1heCAmJiBvbGRQcmVmZXJyZWRCb3VuZHMgKSB7XHJcbi8vICAgICAgICAgdGhpcy5zZXBhcmF0b3JMb2NhdGlvbiArPSBuZXdQcmVmZXJyZWRCb3VuZHNbIHRoaXMubWF4Q29vcmRpbmF0ZSBdIC0gb2xkUHJlZmVycmVkQm91bmRzWyB0aGlzLm1heENvb3JkaW5hdGUgXTtcclxuLy8gICAgICAgfVxyXG4vLyAgICAgICBpZiAoICFwdXNoRnJvbU1heCAmJiBvbGRQcmVmZXJyZWRCb3VuZHMgKSB7XHJcbi8vICAgICAgICAgdGhpcy5zZXBhcmF0b3JMb2NhdGlvbiArPSBuZXdQcmVmZXJyZWRCb3VuZHNbIHRoaXMubWluQ29vcmRpbmF0ZSBdIC0gb2xkUHJlZmVycmVkQm91bmRzWyB0aGlzLm1pbkNvb3JkaW5hdGUgXTtcclxuLy8gICAgICAgfVxyXG4vLyAgICAgICB0aGlzLmxheW91dCgpO1xyXG4vLyAgICAgfSApO1xyXG4vLyAgIH1cclxuLy9cclxuLy8gICAvKipcclxuLy8gLy8gICAgKi9cclxuLy8gICBsYXlvdXQoKSB7XHJcbi8vICAgICB2YXIgcHJlZmVycmVkQm91bmRzID0gdGhpcy5wcmVmZXJyZWRCb3VuZHNQcm9wZXJ0eS52YWx1ZTtcclxuLy8gICAgIHZhciBzZXBhcmF0b3JMb2NhdGlvbiA9IHRoaXMuc2VwYXJhdG9yTG9jYXRpb247XHJcbi8vXHJcbi8vICAgICBpZiAoIHNlcGFyYXRvckxvY2F0aW9uIDwgcHJlZmVycmVkQm91bmRzWyB0aGlzLm1pbkNvb3JkaW5hdGUgXSArIHRoaXMubWluaW11bSApIHtcclxuLy8gICAgICAgc2VwYXJhdG9yTG9jYXRpb24gPSBwcmVmZXJyZWRCb3VuZHNbIHRoaXMubWluQ29vcmRpbmF0ZSBdICsgdGhpcy5taW5pbXVtO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgaWYgKCBzZXBhcmF0b3JMb2NhdGlvbiA+IHByZWZlcnJlZEJvdW5kc1sgdGhpcy5tYXhDb29yZGluYXRlIF0gLSB0aGlzLm1pbmltdW0gKSB7XHJcbi8vICAgICAgIGlmICggcHJlZmVycmVkQm91bmRzWyB0aGlzLnByaW1hcnlOYW1lIF0gPj0gdGhpcy5taW5pbXVtICogMiApIHtcclxuLy8gICAgICAgICBzZXBhcmF0b3JMb2NhdGlvbiA9IHByZWZlcnJlZEJvdW5kc1sgdGhpcy5tYXhDb29yZGluYXRlIF0gLSB0aGlzLm1pbmltdW07XHJcbi8vICAgICAgIH1cclxuLy8gICAgICAgZWxzZSB7XHJcbi8vICAgICAgICAgc2VwYXJhdG9yTG9jYXRpb24gPSBwcmVmZXJyZWRCb3VuZHNbIHRoaXMubWluQ29vcmRpbmF0ZSBdICsgcHJlZmVycmVkQm91bmRzWyB0aGlzLnByaW1hcnlOYW1lIF0gLyAyO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vXHJcbi8vICAgICB0aGlzWyB0aGlzLmNlbnRlck5hbWUgXSA9IHNlcGFyYXRvckxvY2F0aW9uO1xyXG4vLyAgICAgdGhpc1sgdGhpcy5zZWNvbmRhcnlDb29yZGluYXRlIF0gPSBwcmVmZXJyZWRCb3VuZHNbIHRoaXMuc2Vjb25kYXJ5Q29vcmRpbmF0ZSBdO1xyXG4vLyAgICAgdGhpc1sgdGhpcy5zZWNvbmRhcnlSZWN0TmFtZSBdID0gcHJlZmVycmVkQm91bmRzWyB0aGlzLnNlY29uZGFyeU5hbWUgXTtcclxuLy9cclxuLy8gICAgIGlmICggdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnICkge1xyXG4vLyAgICAgICB0aGlzLm1vdXNlQXJlYSA9IHRoaXMudG91Y2hBcmVhID0gdGhpcy5sb2NhbEJvdW5kcy5kaWxhdGVkWCggNSApO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgZWxzZSB7XHJcbi8vICAgICAgIHRoaXMubW91c2VBcmVhID0gdGhpcy50b3VjaEFyZWEgPSB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWRZKCA1ICk7XHJcbi8vICAgICB9XHJcbi8vXHJcbi8vICAgICB2YXIgbWluQm91bmRzID0gcHJlZmVycmVkQm91bmRzLmNvcHkoKTtcclxuLy8gICAgIHZhciBtYXhCb3VuZHMgPSBwcmVmZXJyZWRCb3VuZHMuY29weSgpO1xyXG4vLyAgICAgaWYgKCB0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgKSB7XHJcbi8vICAgICAgIG1pbkJvdW5kcy5tYXhYID0gc2VwYXJhdG9yTG9jYXRpb24gLSB0aGlzLndpZHRoIC8gMjtcclxuLy8gICAgICAgbWF4Qm91bmRzLm1pblggPSBzZXBhcmF0b3JMb2NhdGlvbiArIHRoaXMud2lkdGggLyAyO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgZWxzZSB7XHJcbi8vICAgICAgIG1pbkJvdW5kcy5tYXhZID0gc2VwYXJhdG9yTG9jYXRpb24gLSB0aGlzLmhlaWdodCAvIDI7XHJcbi8vICAgICAgIG1heEJvdW5kcy5taW5ZID0gc2VwYXJhdG9yTG9jYXRpb24gKyB0aGlzLmhlaWdodCAvIDI7XHJcbi8vICAgICB9XHJcbi8vICAgICB0aGlzLm1pbkJvdW5kc1Byb3BlcnR5LnZhbHVlID0gbWluQm91bmRzO1xyXG4vLyAgICAgdGhpcy5tYXhCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IG1heEJvdW5kcztcclxuLy8gICB9XHJcbi8vIH1cclxuXHJcbnR5cGUgQ29sbGFwc2libGVUcmVlTm9kZVNlbGZPcHRpb25zPFQ+ID0ge1xyXG4gIGNyZWF0ZUNoaWxkcmVuPzogKCkgPT4gVFtdO1xyXG4gIHNwYWNpbmc/OiBudW1iZXI7XHJcbiAgaW5kZW50PzogbnVtYmVyO1xyXG59O1xyXG5cclxudHlwZSBDb2xsYXBzaWJsZVRyZWVOb2RlT3B0aW9uczxUPiA9IENvbGxhcHNpYmxlVHJlZU5vZGVTZWxmT3B0aW9uczxUPiAmIE5vZGVPcHRpb25zO1xyXG5cclxuY2xhc3MgQ29sbGFwc2libGVUcmVlTm9kZTxUIGV4dGVuZHMgUERPTVRyZWVOb2RlIHwgVmlzdWFsVHJlZU5vZGU+IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBzZWxmTm9kZTogTm9kZTtcclxuICBwdWJsaWMgZXhwYW5kZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyBjaGlsZFRyZWVOb2RlczogT2JzZXJ2YWJsZUFycmF5PFQ+O1xyXG4gIHB1YmxpYyBleHBhbmRDb2xsYXBzZUJ1dHRvbjogTm9kZTtcclxuXHJcbiAgcHJpdmF0ZSBjaGlsZENvbnRhaW5lcjogTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWxmTm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogQ29sbGFwc2libGVUcmVlTm9kZU9wdGlvbnM8VD4gKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENvbGxhcHNpYmxlVHJlZU5vZGVPcHRpb25zPFQ+LCBDb2xsYXBzaWJsZVRyZWVOb2RlU2VsZk9wdGlvbnM8VD4sIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIGNyZWF0ZUNoaWxkcmVuOiAoKSA9PiBbXSxcclxuICAgICAgc3BhY2luZzogMCxcclxuICAgICAgaW5kZW50OiA1XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zZWxmTm9kZSA9IHNlbGZOb2RlO1xyXG4gICAgdGhpcy5zZWxmTm9kZS5jZW50ZXJZID0gMDtcclxuXHJcbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCB0cnVlICk7XHJcbiAgICB0aGlzLmNoaWxkVHJlZU5vZGVzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5PFQ+KCB7XHJcbiAgICAgIGVsZW1lbnRzOiBvcHRpb25zLmNyZWF0ZUNoaWxkcmVuKClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBidXR0b25TaXplID0gMTI7XHJcbiAgICBjb25zdCBleHBhbmRDb2xsYXBzZVNoYXBlID0gbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUb1BvaW50KCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBidXR0b25TaXplIC8gMi41LCAzIC8gNCAqIE1hdGguUEkgKS5wbHVzWFkoIGJ1dHRvblNpemUgLyA4LCAwICkgKVxyXG4gICAgICAubGluZVRvKCBidXR0b25TaXplIC8gOCwgMCApXHJcbiAgICAgIC5saW5lVG9Qb2ludCggVmVjdG9yMi5jcmVhdGVQb2xhciggYnV0dG9uU2l6ZSAvIDIuNSwgNSAvIDQgKiBNYXRoLlBJICkucGx1c1hZKCBidXR0b25TaXplIC8gOCwgMCApICk7XHJcbiAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uID0gbmV3IFJlY3RhbmdsZSggLWJ1dHRvblNpemUgLyAyLCAtYnV0dG9uU2l6ZSAvIDIsIGJ1dHRvblNpemUsIGJ1dHRvblNpemUsIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgUGF0aCggZXhwYW5kQ29sbGFwc2VTaGFwZSwge1xyXG4gICAgICAgICAgc3Ryb2tlOiAnIzg4OCcsXHJcbiAgICAgICAgICBsaW5lQ2FwOiAncm91bmQnLFxyXG4gICAgICAgICAgbGluZVdpZHRoOiAxLjVcclxuICAgICAgICB9IClcclxuICAgICAgXSxcclxuICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICByaWdodDogMFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5leHBhbmRlZFByb3BlcnR5LmxpbmsoIGV4cGFuZGVkID0+IHtcclxuICAgICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5yb3RhdGlvbiA9IGV4cGFuZGVkID8gTWF0aC5QSSAvIDIgOiAwO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgIGZpcmU6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkudmFsdWUgPSAhdGhpcy5leHBhbmRlZFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZENvbnRhaW5lciA9IG5ldyBGbG93Qm94KCB7XHJcbiAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLnNwYWNpbmcsXHJcbiAgICAgIGNoaWxkcmVuOiB0aGlzLmNoaWxkVHJlZU5vZGVzLFxyXG4gICAgICB4OiBvcHRpb25zLmluZGVudCxcclxuICAgICAgeTogdGhpcy5zZWxmTm9kZS5ib3R0b20gKyBvcHRpb25zLnNwYWNpbmcsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5leHBhbmRlZFByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNoaWxkQ29udGFpbmVyICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggc2VsZk5vZGUgKTtcclxuXHJcbiAgICBjb25zdCBvbkNoaWxkcmVuQ2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmNoaWxkQ29udGFpbmVyLmNoaWxkcmVuID0gdGhpcy5jaGlsZFRyZWVOb2RlcztcclxuICAgICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi52aXNpYmxlID0gdGhpcy5jaGlsZFRyZWVOb2Rlcy5sZW5ndGggPiAwO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmNoaWxkVHJlZU5vZGVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIG9uQ2hpbGRyZW5DaGFuZ2UoKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hpbGRUcmVlTm9kZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBvbkNoaWxkcmVuQ2hhbmdlKCk7XHJcbiAgICB9ICk7XHJcbiAgICBvbkNoaWxkcmVuQ2hhbmdlKCk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBleHBhbmQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbGxhcHNlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5leHBhbmRlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZXhwYW5kUmVjdXNpdmVseSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICB0aGlzLmNoaWxkVHJlZU5vZGVzLmZvckVhY2goIHRyZWVOb2RlID0+IHtcclxuICAgICAgdHJlZU5vZGUuZXhwYW5kUmVjdXNpdmVseSgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNvbGxhcHNlUmVjdXJzaXZlbHkoKTogdm9pZCB7XHJcbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIHRoaXMuY2hpbGRUcmVlTm9kZXMuZm9yRWFjaCggdHJlZU5vZGUgPT4ge1xyXG4gICAgICB0cmVlTm9kZS5jb2xsYXBzZVJlY3Vyc2l2ZWx5KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBWaXN1YWxUcmVlTm9kZSBleHRlbmRzIENvbGxhcHNpYmxlVHJlZU5vZGU8VmlzdWFsVHJlZU5vZGU+IHtcclxuXHJcbiAgcHVibGljIHRyYWlsOiBUcmFpbDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFpbDogVHJhaWwsIGhlbHBlcjogSGVscGVyICkge1xyXG5cclxuICAgIGNvbnN0IG5vZGUgPSB0cmFpbC5sYXN0Tm9kZSgpO1xyXG4gICAgY29uc3QgaXNWaXNpYmxlID0gdHJhaWwuaXNWaXNpYmxlKCk7XHJcblxyXG4gICAgY29uc3QgVFJFRV9GT05UID0gbmV3IEZvbnQoIHsgc2l6ZTogMTIgfSApO1xyXG5cclxuICAgIGNvbnN0IG5hbWVOb2RlID0gbmV3IEhCb3goIHsgc3BhY2luZzogNSB9ICk7XHJcblxyXG4gICAgY29uc3QgbmFtZSA9IG5vZGUuY29uc3RydWN0b3IubmFtZTtcclxuICAgIGlmICggbmFtZSApIHtcclxuICAgICAgbmFtZU5vZGUuYWRkQ2hpbGQoIG5ldyBUZXh0KCBuYW1lLCB7XHJcbiAgICAgICAgZm9udDogVFJFRV9GT05ULFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgICBmaWxsOiBpc1Zpc2libGUgPyAnIzAwMCcgOiAnIzYwYSdcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBUZXh0ICkge1xyXG4gICAgICBuYW1lTm9kZS5hZGRDaGlsZCggbmV3IFRleHQoICdcIicgKyBub2RlLnN0cmluZyArICdcIicsIHtcclxuICAgICAgICBmb250OiBUUkVFX0ZPTlQsXHJcbiAgICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICAgIGZpbGw6ICcjNjY2J1xyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWxmQmFja2dyb3VuZCA9IFJlY3RhbmdsZS5ib3VuZHMoIG5hbWVOb2RlLmJvdW5kcywge1xyXG4gICAgICBjaGlsZHJlbjogWyBuYW1lTm9kZSBdLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgZmlsbDogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBoZWxwZXIuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LCBoZWxwZXIucG9pbnRlclRyYWlsUHJvcGVydHkgXSwgKCBzZWxlY3RlZCwgYWN0aXZlICkgPT4ge1xyXG4gICAgICAgIGlmICggc2VsZWN0ZWQgJiYgdHJhaWwuZXF1YWxzKCBzZWxlY3RlZCApICkge1xyXG4gICAgICAgICAgcmV0dXJuICdyZ2JhKDAsMTI4LDI1NSwwLjQpJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGFjdGl2ZSAmJiB0cmFpbC5lcXVhbHMoIGFjdGl2ZSApICkge1xyXG4gICAgICAgICAgcmV0dXJuICdyZ2JhKDAsMTI4LDI1NSwwLjIpJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gJ3RyYW5zcGFyZW50JztcclxuICAgICAgICB9XHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgIH0gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHNlbGZCYWNrZ3JvdW5kLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgICAgZW50ZXI6ICgpID0+IHtcclxuICAgICAgICBoZWxwZXIudHJlZUhvdmVyVHJhaWxQcm9wZXJ0eS52YWx1ZSA9IHRyYWlsO1xyXG4gICAgICB9LFxyXG4gICAgICBleGl0OiAoKSA9PiB7XHJcbiAgICAgICAgaGVscGVyLnRyZWVIb3ZlclRyYWlsUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBzZWxmQmFja2dyb3VuZC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgIGZpcmU6ICgpID0+IHtcclxuICAgICAgICBoZWxwZXIuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LnZhbHVlID0gdHJhaWw7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKSApO1xyXG5cclxuICAgIHN1cGVyKCBzZWxmQmFja2dyb3VuZCwge1xyXG4gICAgICBjcmVhdGVDaGlsZHJlbjogKCkgPT4gdHJhaWwubGFzdE5vZGUoKS5jaGlsZHJlbi5tYXAoIGNoaWxkID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFZpc3VhbFRyZWVOb2RlKCB0cmFpbC5jb3B5KCkuYWRkRGVzY2VuZGFudCggY2hpbGQgKSwgaGVscGVyICk7XHJcbiAgICAgIH0gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGlmICggIW5vZGUudmlzaWJsZSApIHtcclxuICAgICAgdGhpcy5leHBhbmRlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50cmFpbCA9IHRyYWlsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZpbmQoIHRyYWlsOiBUcmFpbCApOiBWaXN1YWxUcmVlTm9kZSB8IG51bGwge1xyXG4gICAgaWYgKCB0cmFpbC5lcXVhbHMoIHRoaXMudHJhaWwgKSApIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgdHJlZU5vZGUgPSBfLmZpbmQoIHRoaXMuY2hpbGRUcmVlTm9kZXMsIGNoaWxkVHJlZU5vZGUgPT4ge1xyXG4gICAgICAgIHJldHVybiB0cmFpbC5pc0V4dGVuc2lvbk9mKCBjaGlsZFRyZWVOb2RlLnRyYWlsLCB0cnVlICk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgaWYgKCB0cmVlTm9kZSApIHtcclxuICAgICAgICByZXR1cm4gdHJlZU5vZGUuZmluZCggdHJhaWwgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUERPTVRyZWVOb2RlIGV4dGVuZHMgQ29sbGFwc2libGVUcmVlTm9kZTxQRE9NVHJlZU5vZGU+IHtcclxuXHJcbiAgcHVibGljIHRyYWlsOiBUcmFpbDtcclxuICBwdWJsaWMgaW5zdGFuY2U6IFBET01JbnN0YW5jZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpbnN0YW5jZTogUERPTUluc3RhbmNlLCBoZWxwZXI6IEhlbHBlciApIHtcclxuXHJcbiAgICBjb25zdCB0cmFpbCA9IGluc3RhbmNlLnRyYWlsITtcclxuICAgIGNvbnN0IGlzVmlzaWJsZSA9IHRyYWlsLmlzUERPTVZpc2libGUoKTtcclxuXHJcbiAgICBjb25zdCBUUkVFX0ZPTlQgPSBuZXcgRm9udCggeyBzaXplOiAxMiB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2VsZk5vZGUgPSBuZXcgSEJveCggeyBzcGFjaW5nOiA1IH0gKTtcclxuXHJcbiAgICBpZiAoIHRyYWlsLm5vZGVzLmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgZmlsbCA9IGlzVmlzaWJsZSA/ICcjMDAwJyA6ICcjNjBhJztcclxuICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XHJcblxyXG4gICAgICBpZiAoIG5vZGUudGFnTmFtZSApIHtcclxuICAgICAgICBzZWxmTm9kZS5hZGRDaGlsZCggbmV3IFRleHQoIG5vZGUudGFnTmFtZSwgeyBmb250OiBuZXcgRm9udCggeyBzaXplOiAxMiwgd2VpZ2h0OiAnYm9sZCcgfSApLCBmaWxsOiBmaWxsIH0gKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIG5vZGUubGFiZWxDb250ZW50ICkge1xyXG4gICAgICAgIHNlbGZOb2RlLmFkZENoaWxkKCBuZXcgVGV4dCggbm9kZS5sYWJlbENvbnRlbnQsIHsgZm9udDogVFJFRV9GT05ULCBmaWxsOiAnIzgwMCcgfSApICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBub2RlLmlubmVyQ29udGVudCApIHtcclxuICAgICAgICBzZWxmTm9kZS5hZGRDaGlsZCggbmV3IFRleHQoIG5vZGUuaW5uZXJDb250ZW50LCB7IGZvbnQ6IFRSRUVfRk9OVCwgZmlsbDogJyMwODAnIH0gKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbm9kZS5kZXNjcmlwdGlvbkNvbnRlbnQgKSB7XHJcbiAgICAgICAgc2VsZk5vZGUuYWRkQ2hpbGQoIG5ldyBUZXh0KCBub2RlLmRlc2NyaXB0aW9uQ29udGVudCwgeyBmb250OiBUUkVFX0ZPTlQsIGZpbGw6ICcjNDQ0JyB9ICkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcGFyZW50VHJhaWwgPSBpbnN0YW5jZS5wYXJlbnQgPyBpbnN0YW5jZS5wYXJlbnQudHJhaWwhIDogbmV3IFRyYWlsKCk7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSB0cmFpbC5ub2Rlcy5zbGljZSggcGFyZW50VHJhaWwubm9kZXMubGVuZ3RoICkubWFwKCBub2RlID0+IG5vZGUuY29uc3RydWN0b3IubmFtZSApLmZpbHRlciggbiA9PiBuICE9PSAnTm9kZScgKS5qb2luKCAnLCcgKTtcclxuXHJcbiAgICAgIGlmICggbmFtZSApIHtcclxuICAgICAgICBzZWxmTm9kZS5hZGRDaGlsZCggbmV3IFRleHQoIGAoJHtuYW1lfSlgLCB7IGZvbnQ6IFRSRUVfRk9OVCwgZmlsbDogJyMwMDgnIH0gKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc2VsZk5vZGUuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnKHJvb3QpJywgeyBmb250OiBUUkVFX0ZPTlQgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVmYWN0b3IgdGhpcyBjb2RlIG91dD9cclxuICAgIGNvbnN0IHNlbGZCYWNrZ3JvdW5kID0gUmVjdGFuZ2xlLmJvdW5kcyggc2VsZk5vZGUuYm91bmRzLCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgc2VsZk5vZGVcclxuICAgICAgXSxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIGZpbGw6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgaGVscGVyLnNlbGVjdGVkVHJhaWxQcm9wZXJ0eSwgaGVscGVyLnBvaW50ZXJUcmFpbFByb3BlcnR5IF0sICggc2VsZWN0ZWQsIGFjdGl2ZSApID0+IHtcclxuICAgICAgICBpZiAoIHNlbGVjdGVkICYmIHRyYWlsLmVxdWFscyggc2VsZWN0ZWQgKSApIHtcclxuICAgICAgICAgIHJldHVybiAncmdiYSgwLDEyOCwyNTUsMC40KSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBhY3RpdmUgJiYgdHJhaWwuZXF1YWxzKCBhY3RpdmUgKSApIHtcclxuICAgICAgICAgIHJldHVybiAncmdiYSgwLDEyOCwyNTUsMC4yKSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuICd0cmFuc3BhcmVudCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgICB9IClcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIHRyYWlsLmxlbmd0aCApIHtcclxuICAgICAgc2VsZkJhY2tncm91bmQuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICAgIGVudGVyOiAoKSA9PiB7XHJcbiAgICAgICAgICBoZWxwZXIudHJlZUhvdmVyVHJhaWxQcm9wZXJ0eS52YWx1ZSA9IHRyYWlsO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXhpdDogKCkgPT4ge1xyXG4gICAgICAgICAgaGVscGVyLnRyZWVIb3ZlclRyYWlsUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICBzZWxmQmFja2dyb3VuZC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgICAgZmlyZTogKCkgPT4ge1xyXG4gICAgICAgICAgaGVscGVyLnNlbGVjdGVkVHJhaWxQcm9wZXJ0eS52YWx1ZSA9IHRyYWlsO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlciggc2VsZkJhY2tncm91bmQsIHtcclxuICAgICAgY3JlYXRlQ2hpbGRyZW46ICgpID0+IGluc3RhbmNlLmNoaWxkcmVuLm1hcCggKCBpbnN0YW5jZTogUERPTUluc3RhbmNlICkgPT4gbmV3IFBET01UcmVlTm9kZSggaW5zdGFuY2UsIGhlbHBlciApIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XHJcbiAgICB0aGlzLnRyYWlsID0gdHJhaWw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZmluZCggdHJhaWw6IFRyYWlsICk6IFBET01UcmVlTm9kZSB8IG51bGwge1xyXG4gICAgaWYgKCB0cmFpbC5lcXVhbHMoIHRoaXMuaW5zdGFuY2UudHJhaWwhICkgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IHRyZWVOb2RlID0gXy5maW5kKCB0aGlzLmNoaWxkVHJlZU5vZGVzLCBjaGlsZFRyZWVOb2RlID0+IHtcclxuICAgICAgICByZXR1cm4gdHJhaWwuaXNFeHRlbnNpb25PZiggY2hpbGRUcmVlTm9kZS5pbnN0YW5jZS50cmFpbCEsIHRydWUgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBpZiAoIHRyZWVOb2RlICkge1xyXG4gICAgICAgIHJldHVybiB0cmVlTm9kZS5maW5kKCB0cmFpbCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBUcmVlTm9kZTxUIGV4dGVuZHMgKCBWaXN1YWxUcmVlTm9kZSB8IFBET01UcmVlTm9kZSApPiBleHRlbmRzIFJlY3RhbmdsZSB7XHJcblxyXG4gIHB1YmxpYyB0cmVlQ29udGFpbmVyOiBOb2RlO1xyXG4gIHB1YmxpYyB0cmVlTm9kZT86IFQ7XHJcbiAgcHVibGljIGhlbHBlcjogSGVscGVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZpc2libGVQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+LCBoZWxwZXI6IEhlbHBlciwgY3JlYXRlVHJlZU5vZGU6ICgpID0+IFQgKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICBmaWxsOiAncmdiYSgyNTUsMjU1LDI1NSwwLjg1KScsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgcmVjdFdpZHRoOiA0MDAsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBwaWNrYWJsZTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaGVscGVyID0gaGVscGVyO1xyXG5cclxuICAgIHRoaXMudHJlZUNvbnRhaW5lciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnRyZWVDb250YWluZXIgKTtcclxuXHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgdGFyZ2V0Tm9kZTogdGhpcyxcclxuICAgICAgZHJhZzogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XHJcbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgbGlzdGVuZXIubW9kZWxEZWx0YS54O1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICkgKTtcclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICB3aGVlbDogZXZlbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmRvbUV2ZW50IS5kZWx0YVg7XHJcbiAgICAgICAgY29uc3QgZGVsdGFZID0gZXZlbnQuZG9tRXZlbnQhLmRlbHRhWTtcclxuICAgICAgICBjb25zdCBtdWx0aXBsaWVyID0gMTtcclxuICAgICAgICBpZiAoIHRoaXMudHJlZU5vZGUgKSB7XHJcbiAgICAgICAgICB0aGlzLnRyZWVOb2RlLnggLT0gZGVsdGFYICogbXVsdGlwbGllcjtcclxuICAgICAgICAgIHRoaXMudHJlZU5vZGUueSAtPSBkZWx0YVkgKiBtdWx0aXBsaWVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnN0cmFpblRyZWUoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlcmUgaXNuJ3QgYSBzZWxlY3RlZCB0cmFpbCwgZm9jdXMgd2hhdGV2ZXIgb3VyIHBvaW50ZXIgaXMgb3ZlclxyXG4gICAgaGVscGVyLnBvaW50ZXJUcmFpbFByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIGlmICggIWhlbHBlci5zZWxlY3RlZFRyYWlsUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5mb2N1c1BvaW50ZXIoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgaGVscGVyLmFjdGl2ZVByb3BlcnR5LCB2aXNpYmxlUHJvcGVydHkgXSwgKCBhY3RpdmUsIHRyZWVWaXNpYmxlICkgPT4ge1xyXG4gICAgICBpZiAoIGFjdGl2ZSAmJiB0cmVlVmlzaWJsZSApIHtcclxuICAgICAgICB0aGlzLnRyZWVOb2RlID0gY3JlYXRlVHJlZU5vZGUoKTtcclxuXHJcbiAgICAgICAgLy8gSGF2ZSB0aGUgY29uc3RyYWluIHByb3Blcmx5IHBvc2l0aW9uIGl0XHJcbiAgICAgICAgdGhpcy50cmVlTm9kZS54ID0gNTAwO1xyXG4gICAgICAgIHRoaXMudHJlZU5vZGUueSA9IDUwMDtcclxuXHJcbiAgICAgICAgdGhpcy50cmVlQ29udGFpbmVyLmNoaWxkcmVuID0gWyB0aGlzLnRyZWVOb2RlIF07XHJcbiAgICAgICAgdGhpcy5mb2N1c1NlbGVjdGVkKCk7XHJcbiAgICAgICAgdGhpcy5jb25zdHJhaW5UcmVlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy50cmVlQ29udGFpbmVyLmNoaWxkcmVuID0gW107XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemUoIHNpemU6IERpbWVuc2lvbjIgKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlY3RIZWlnaHQgPSBzaXplLmhlaWdodDtcclxuICAgIHRoaXMucmlnaHQgPSBzaXplLndpZHRoO1xyXG4gICAgdGhpcy50cmVlQ29udGFpbmVyLmNsaXBBcmVhID0gU2hhcGUuYm91bmRzKCB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWQoIDEwICkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb25zdHJhaW5UcmVlKCk6IHZvaWQge1xyXG4gICAgY29uc3QgdHJlZU1hcmdpblggPSA4O1xyXG4gICAgY29uc3QgdHJlZU1hcmdpblkgPSA1O1xyXG5cclxuICAgIGlmICggdGhpcy50cmVlTm9kZSApIHtcclxuICAgICAgaWYgKCB0aGlzLnRyZWVOb2RlLmJvdHRvbSA8IHRoaXMuc2VsZkJvdW5kcy5ib3R0b20gLSB0cmVlTWFyZ2luWSApIHtcclxuICAgICAgICB0aGlzLnRyZWVOb2RlLmJvdHRvbSA9IHRoaXMuc2VsZkJvdW5kcy5ib3R0b20gLSB0cmVlTWFyZ2luWTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMudHJlZU5vZGUudG9wID4gdGhpcy5zZWxmQm91bmRzLnRvcCArIHRyZWVNYXJnaW5ZICkge1xyXG4gICAgICAgIHRoaXMudHJlZU5vZGUudG9wID0gdGhpcy5zZWxmQm91bmRzLnRvcCArIHRyZWVNYXJnaW5ZO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy50cmVlTm9kZS5yaWdodCA8IHRoaXMuc2VsZkJvdW5kcy5yaWdodCAtIHRyZWVNYXJnaW5YICkge1xyXG4gICAgICAgIHRoaXMudHJlZU5vZGUucmlnaHQgPSB0aGlzLnNlbGZCb3VuZHMucmlnaHQgLSB0cmVlTWFyZ2luWDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMudHJlZU5vZGUubGVmdCA+IHRoaXMuc2VsZkJvdW5kcy5sZWZ0ICsgdHJlZU1hcmdpblggKSB7XHJcbiAgICAgICAgdGhpcy50cmVlTm9kZS5sZWZ0ID0gdGhpcy5zZWxmQm91bmRzLmxlZnQgKyB0cmVlTWFyZ2luWDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGZvY3VzVHJhaWwoIHRyYWlsOiBUcmFpbCApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy50cmVlTm9kZSApIHtcclxuICAgICAgY29uc3QgdHJlZU5vZGUgPSB0aGlzLnRyZWVOb2RlLmZpbmQoIHRyYWlsICk7XHJcbiAgICAgIGlmICggdHJlZU5vZGUgKSB7XHJcbiAgICAgICAgY29uc3QgZGVsdGFZID0gdHJlZU5vZGUubG9jYWxUb0dsb2JhbFBvaW50KCB0cmVlTm9kZS5zZWxmTm9kZS5jZW50ZXIgKS55IC0gdGhpcy5jZW50ZXJZO1xyXG4gICAgICAgIHRoaXMudHJlZU5vZGUueSAtPSBkZWx0YVk7XHJcbiAgICAgICAgdGhpcy5jb25zdHJhaW5UcmVlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBmb2N1c1BvaW50ZXIoKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMuaGVscGVyLnBvaW50ZXJUcmFpbFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLmZvY3VzVHJhaWwoIHRoaXMuaGVscGVyLnBvaW50ZXJUcmFpbFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZm9jdXNTZWxlY3RlZCgpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5oZWxwZXIuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LnZhbHVlID09PSBudWxsICkgeyByZXR1cm47IH1cclxuXHJcbiAgICB0aGlzLmZvY3VzVHJhaWwoIHRoaXMuaGVscGVyLnNlbGVjdGVkVHJhaWxQcm9wZXJ0eS52YWx1ZSApO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgY3JlYXRlSGVhZGVyVGV4dCA9ICggc3RyOiBzdHJpbmcsIG5vZGU/OiBOb2RlLCBvcHRpb25zPzogVGV4dE9wdGlvbnMgKSA9PiB7XHJcbiAgcmV0dXJuIG5ldyBUZXh0KCBzdHIsIG1lcmdlKCB7XHJcbiAgICBmb250U2l6ZTogMTQsXHJcbiAgICBmb250V2VpZ2h0OiAnYm9sZCcsXHJcbiAgICB2aXNpYmxlUHJvcGVydHk6IG5vZGUgPyBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIG5vZGUuYm91bmRzUHJvcGVydHkgXSwgYm91bmRzID0+IHtcclxuICAgICAgcmV0dXJuICFib3VuZHMuaXNFbXB0eSgpO1xyXG4gICAgfSApIDogbmV3IFRpbnlQcm9wZXJ0eSggdHJ1ZSApXHJcbiAgfSwgb3B0aW9ucyApICk7XHJcbn07XHJcblxyXG5jb25zdCBjcmVhdGVDb2xsYXBzaWJsZUhlYWRlclRleHQgPSAoIHN0cjogc3RyaW5nLCB2aXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBub2RlPzogTm9kZSwgb3B0aW9ucz86IFRleHRPcHRpb25zICkgPT4ge1xyXG4gIGNvbnN0IGhlYWRlclRleHQgPSBjcmVhdGVIZWFkZXJUZXh0KCBzdHIsIG5vZGUsIG9wdGlvbnMgKTtcclxuICBoZWFkZXJUZXh0LmFkZElucHV0TGlzdGVuZXIoIG5ldyBGaXJlTGlzdGVuZXIoIHtcclxuICAgIGZpcmU6ICgpID0+IHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5LnZhbHVlID0gIXZpc2libGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH0sXHJcbiAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgfSApICk7XHJcbiAgaGVhZGVyVGV4dC5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgcmV0dXJuIG5ldyBIQm94KCB7XHJcbiAgICBzcGFjaW5nOiA3LFxyXG4gICAgY2hpbGRyZW46IFtcclxuICAgICAgbmV3IEV4cGFuZENvbGxhcHNlQnV0dG9uKCB2aXNpYmxlUHJvcGVydHksIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCwgc2lkZUxlbmd0aDogMTQgfSApLFxyXG4gICAgICBoZWFkZXJUZXh0XHJcbiAgICBdLFxyXG4gICAgdmlzaWJsZVByb3BlcnR5OiBoZWFkZXJUZXh0LnZpc2libGVQcm9wZXJ0eVxyXG4gIH0gKTtcclxufTtcclxuXHJcbmNsYXNzIE1hdHJpeDNOb2RlIGV4dGVuZHMgR3JpZEJveCB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXRyaXg6IE1hdHJpeDMgKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICB4U3BhY2luZzogNSxcclxuICAgICAgeVNwYWNpbmc6IDAsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoIG1hdHJpeC5tMDAoKSwgeyBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogMCwgcm93OiAwIH0gfSApLFxyXG4gICAgICAgIG5ldyBUZXh0KCBtYXRyaXgubTAxKCksIHsgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IDEsIHJvdzogMCB9IH0gKSxcclxuICAgICAgICBuZXcgVGV4dCggbWF0cml4Lm0wMigpLCB7IGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAyLCByb3c6IDAgfSB9ICksXHJcbiAgICAgICAgbmV3IFRleHQoIG1hdHJpeC5tMTAoKSwgeyBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogMCwgcm93OiAxIH0gfSApLFxyXG4gICAgICAgIG5ldyBUZXh0KCBtYXRyaXgubTExKCksIHsgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IDEsIHJvdzogMSB9IH0gKSxcclxuICAgICAgICBuZXcgVGV4dCggbWF0cml4Lm0xMigpLCB7IGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAyLCByb3c6IDEgfSB9ICksXHJcbiAgICAgICAgbmV3IFRleHQoIG1hdHJpeC5tMjAoKSwgeyBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogMCwgcm93OiAyIH0gfSApLFxyXG4gICAgICAgIG5ldyBUZXh0KCBtYXRyaXgubTIxKCksIHsgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IDEsIHJvdzogMiB9IH0gKSxcclxuICAgICAgICBuZXcgVGV4dCggbWF0cml4Lm0yMigpLCB7IGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAyLCByb3c6IDIgfSB9IClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgU2hhcGVOb2RlIGV4dGVuZHMgUGF0aCB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzaGFwZTogU2hhcGUgKSB7XHJcbiAgICBzdXBlciggc2hhcGUsIHtcclxuICAgICAgbWF4V2lkdGg6IDE1LFxyXG4gICAgICBtYXhIZWlnaHQ6IDE1LFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICBzdHJva2VQaWNrYWJsZTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgICBmaXJlOiAoKSA9PiBjb3B5VG9DbGlwYm9hcmQoIHNoYXBlLmdldFNWR1BhdGgoKSApLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEltYWdlTm9kZSBleHRlbmRzIEltYWdlIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGltYWdlOiBJbWFnZSApIHtcclxuICAgIHN1cGVyKCBpbWFnZS5nZXRJbWFnZSgpLCB7XHJcbiAgICAgIG1heFdpZHRoOiAxNSxcclxuICAgICAgbWF4SGVpZ2h0OiAxNVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgY3JlYXRlSW5mbyA9ICggdHJhaWw6IFRyYWlsICk6IE5vZGVbXSA9PiB7XHJcbiAgY29uc3QgY2hpbGRyZW4gPSBbXTtcclxuICBjb25zdCBub2RlID0gdHJhaWwubGFzdE5vZGUoKTtcclxuXHJcbiAgY29uc3QgdHlwZXMgPSBpbmhlcml0YW5jZSggbm9kZS5jb25zdHJ1Y3RvciApLm1hcCggdHlwZSA9PiB0eXBlLm5hbWUgKS5maWx0ZXIoIG5hbWUgPT4ge1xyXG4gICAgcmV0dXJuIG5hbWUgJiYgbmFtZSAhPT0gJ09iamVjdCc7XHJcbiAgfSApO1xyXG4gIGNvbnN0IHJlZHVjZWRUeXBlcyA9IHR5cGVzLmluY2x1ZGVzKCAnTm9kZScgKSA/IHR5cGVzLnNsaWNlKCAwLCB0eXBlcy5pbmRleE9mKCAnTm9kZScgKSApIDogdHlwZXM7XHJcblxyXG4gIGlmICggcmVkdWNlZFR5cGVzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICBjaGlsZHJlbi5wdXNoKCBuZXcgUmljaFRleHQoIHJlZHVjZWRUeXBlcy5tYXAoICggc3RyOiBzdHJpbmcsIGk6IG51bWJlciApID0+IHtcclxuICAgICAgcmV0dXJuIGkgPT09IDAgPyBgPGI+JHtzdHJ9PC9iPmAgOiBgPGJyPiZuYnNwOyR7Xy5yZXBlYXQoICcgICcsIGkgKX1leHRlbmRzICR7c3RyfWA7XHJcbiAgICB9ICkuam9pbiggJycgKSwgeyBmb250OiBuZXcgUGhldEZvbnQoIDEyICkgfSApICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBhZGRSYXcgPSAoIGtleTogc3RyaW5nLCB2YWx1ZU5vZGU6IE5vZGUgKSA9PiB7XHJcbiAgICBjaGlsZHJlbi5wdXNoKCBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAwLFxyXG4gICAgICBhbGlnbjogJ3RvcCcsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoIGtleSArICc6ICcsIHsgZm9udFNpemU6IDEyIH0gKSxcclxuICAgICAgICB2YWx1ZU5vZGVcclxuICAgICAgXVxyXG4gICAgfSApICk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgYWRkU2ltcGxlID0gKCBrZXk6IHN0cmluZywgdmFsdWU6IHVua25vd24gKSA9PiB7XHJcbiAgICBpZiAoIHZhbHVlICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgIGFkZFJhdygga2V5LCBuZXcgUmljaFRleHQoICcnICsgdmFsdWUsIHtcclxuICAgICAgICBsaW5lV3JhcDogNDAwLFxyXG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcclxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICBpbnB1dExpc3RlbmVyczogW1xyXG4gICAgICAgICAgbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgICAgICAgICBmaXJlOiAoKSA9PiBjb3B5VG9DbGlwYm9hcmQoICcnICsgdmFsdWUgKSxcclxuICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgICAgICAgfSApXHJcbiAgICAgICAgXVxyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBjb2xvclN3YXRjaCA9ICggY29sb3I6IENvbG9yICk6IE5vZGUgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDQsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAsIDEwLCB7IGZpbGw6IGNvbG9yLCBzdHJva2U6ICdibGFjaycsIGxpbmVXaWR0aDogMC41IH0gKSxcclxuICAgICAgICBuZXcgVGV4dCggY29sb3IudG9IZXhTdHJpbmcoKSwgeyBmb250U2l6ZTogMTIgfSApLFxyXG4gICAgICAgIG5ldyBUZXh0KCBjb2xvci50b0NTUygpLCB7IGZvbnRTaXplOiAxMiB9IClcclxuICAgICAgXSxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIGlucHV0TGlzdGVuZXJzOiBbXHJcbiAgICAgICAgbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgICAgICAgZmlyZTogKCkgPT4gY29weVRvQ2xpcGJvYXJkKCBjb2xvci50b0hleFN0cmluZygpICksXHJcbiAgICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBhZGRDb2xvciA9ICgga2V5OiBzdHJpbmcsIGNvbG9yOiBUQ29sb3IgKSA9PiB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBpQ29sb3JUb0NvbG9yKCBjb2xvciApO1xyXG4gICAgaWYgKCByZXN1bHQgIT09IG51bGwgKSB7XHJcbiAgICAgIGFkZFJhdygga2V5LCBjb2xvclN3YXRjaCggcmVzdWx0ICkgKTtcclxuICAgIH1cclxuICB9O1xyXG4gIGNvbnN0IGFkZFBhaW50ID0gKCBrZXk6IHN0cmluZywgcGFpbnQ6IFRQYWludCApID0+IHtcclxuICAgIGNvbnN0IHN0b3BUb05vZGUgPSAoIHN0b3A6IEdyYWRpZW50U3RvcCApOiBOb2RlID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBIQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogMyxcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgbmV3IFRleHQoIHN0b3AucmF0aW8sIHsgZm9udFNpemU6IDEyIH0gKSxcclxuICAgICAgICAgIGNvbG9yU3dhdGNoKCBpQ29sb3JUb0NvbG9yKCBzdG9wLmNvbG9yICkgfHwgQ29sb3IuVFJBTlNQQVJFTlQgKVxyXG4gICAgICAgIF1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoIHBhaW50IGluc3RhbmNlb2YgUGFpbnQgKSB7XHJcbiAgICAgIGlmICggcGFpbnQgaW5zdGFuY2VvZiBMaW5lYXJHcmFkaWVudCApIHtcclxuICAgICAgICBhZGRSYXcoIGtleSwgbmV3IFZCb3goIHtcclxuICAgICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgICBzcGFjaW5nOiAzLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgbmV3IFRleHQoIGBMaW5lYXJHcmFkaWVudCAoJHtwYWludC5zdGFydC54fSwke3BhaW50LnN0YXJ0Lnl9KSA9PiAoJHtwYWludC5lbmQueH0sJHtwYWludC5lbmQueX0pYCwgeyBmb250U2l6ZTogMTIgfSApLFxyXG4gICAgICAgICAgICAuLi5wYWludC5zdG9wcy5tYXAoIHN0b3BUb05vZGUgKVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwYWludCBpbnN0YW5jZW9mIFJhZGlhbEdyYWRpZW50ICkge1xyXG4gICAgICAgIGFkZFJhdygga2V5LCBuZXcgVkJveCgge1xyXG4gICAgICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgICAgIHNwYWNpbmc6IDMsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgVGV4dCggYFJhZGlhbEdyYWRpZW50ICgke3BhaW50LnN0YXJ0Lnh9LCR7cGFpbnQuc3RhcnQueX0pICR7cGFpbnQuc3RhcnRSYWRpdXN9ID0+ICgke3BhaW50LmVuZC54fSwke3BhaW50LmVuZC55fSkgJHtwYWludC5lbmRSYWRpdXN9YCwgeyBmb250U2l6ZTogMTIgfSApLFxyXG4gICAgICAgICAgICAuLi5wYWludC5zdG9wcy5tYXAoIHN0b3BUb05vZGUgKVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwYWludCBpbnN0YW5jZW9mIFBhdHRlcm4gKSB7XHJcbiAgICAgICAgYWRkUmF3KCBrZXksIG5ldyBWQm94KCB7XHJcbiAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICAgICAgc3BhY2luZzogMyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIG5ldyBUZXh0KCAnUGF0dGVybicsIHsgZm9udFNpemU6IDEyIH0gKSxcclxuICAgICAgICAgICAgbmV3IEltYWdlKCBwYWludC5pbWFnZSwgeyBtYXhXaWR0aDogMTAsIG1heEhlaWdodDogMTAgfSApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhZGRDb2xvcigga2V5LCBwYWludCApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGFkZE51bWJlciA9ICgga2V5OiBzdHJpbmcsIG51bWJlcjogbnVtYmVyICkgPT4gYWRkU2ltcGxlKCBrZXksIG51bWJlciApO1xyXG4gIGNvbnN0IGFkZE1hdHJpeDMgPSAoIGtleTogc3RyaW5nLCBtYXRyaXg6IE1hdHJpeDMgKSA9PiBhZGRSYXcoIGtleSwgbmV3IE1hdHJpeDNOb2RlKCBtYXRyaXggKSApO1xyXG4gIGNvbnN0IGFkZEJvdW5kczIgPSAoIGtleTogc3RyaW5nLCBib3VuZHM6IEJvdW5kczIgKSA9PiB7XHJcbiAgICBpZiAoIGJvdW5kcy5lcXVhbHMoIEJvdW5kczIuTk9USElORyApICkge1xyXG4gICAgICAvLyBETyBub3RoaW5nXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYm91bmRzLmVxdWFscyggQm91bmRzMi5FVkVSWVRISU5HICkgKSB7XHJcbiAgICAgIGFkZFNpbXBsZSgga2V5LCAnZXZlcnl0aGluZycgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhZGRSYXcoIGtleSwgbmV3IFJpY2hUZXh0KCBgeDogWyR7Ym91bmRzLm1pblh9LCAke2JvdW5kcy5tYXhYfV08YnI+eTogWyR7Ym91bmRzLm1pbll9LCAke2JvdW5kcy5tYXhZfV1gLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSB9ICkgKTtcclxuICAgIH1cclxuICB9O1xyXG4gIGNvbnN0IGFkZFNoYXBlID0gKCBrZXk6IHN0cmluZywgc2hhcGU6IFNoYXBlICkgPT4gYWRkUmF3KCBrZXksIG5ldyBTaGFwZU5vZGUoIHNoYXBlICkgKTtcclxuICBjb25zdCBhZGRJbWFnZSA9ICgga2V5OiBzdHJpbmcsIGltYWdlOiBJbWFnZSApID0+IGFkZFJhdygga2V5LCBuZXcgSW1hZ2VOb2RlKCBpbWFnZSApICk7XHJcblxyXG4gIGlmICggbm9kZS50YW5kZW0uc3VwcGxpZWQgKSB7XHJcbiAgICBhZGRTaW1wbGUoICd0YW5kZW0nLCBub2RlLnRhbmRlbS5waGV0aW9JRC5zcGxpdCggJy4nICkuam9pbiggJyAnICkgKTtcclxuICB9XHJcblxyXG4gIGlmICggbm9kZSBpbnN0YW5jZW9mIERPTSApIHtcclxuICAgIGFkZFNpbXBsZSggJ2VsZW1lbnQnLCBub2RlLmVsZW1lbnQuY29uc3RydWN0b3IubmFtZSApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBleHRlbmRzV2lkdGhTaXphYmxlKCBub2RlICkgKSB7XHJcbiAgICAhbm9kZS53aWR0aFNpemFibGUgJiYgYWRkU2ltcGxlKCAnd2lkdGhTaXphYmxlJywgbm9kZS53aWR0aFNpemFibGUgKTtcclxuICAgIG5vZGUucHJlZmVycmVkV2lkdGggIT09IG51bGwgJiYgYWRkU2ltcGxlKCAncHJlZmVycmVkV2lkdGgnLCBub2RlLnByZWZlcnJlZFdpZHRoICk7XHJcbiAgICBub2RlLnByZWZlcnJlZFdpZHRoICE9PSBub2RlLmxvY2FsUHJlZmVycmVkV2lkdGggJiYgYWRkU2ltcGxlKCAnbG9jYWxQcmVmZXJyZWRXaWR0aCcsIG5vZGUubG9jYWxQcmVmZXJyZWRXaWR0aCApO1xyXG4gICAgbm9kZS5taW5pbXVtV2lkdGggIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWluaW11bVdpZHRoJywgbm9kZS5taW5pbXVtV2lkdGggKTtcclxuICAgIG5vZGUubWluaW11bVdpZHRoICE9PSBub2RlLmxvY2FsTWluaW11bVdpZHRoICYmIGFkZFNpbXBsZSggJ2xvY2FsTWluaW11bVdpZHRoJywgbm9kZS5sb2NhbE1pbmltdW1XaWR0aCApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBleHRlbmRzSGVpZ2h0U2l6YWJsZSggbm9kZSApICkge1xyXG4gICAgIW5vZGUuaGVpZ2h0U2l6YWJsZSAmJiBhZGRTaW1wbGUoICdoZWlnaHRTaXphYmxlJywgbm9kZS5oZWlnaHRTaXphYmxlICk7XHJcbiAgICBub2RlLnByZWZlcnJlZEhlaWdodCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdwcmVmZXJyZWRIZWlnaHQnLCBub2RlLnByZWZlcnJlZEhlaWdodCApO1xyXG4gICAgbm9kZS5wcmVmZXJyZWRIZWlnaHQgIT09IG5vZGUubG9jYWxQcmVmZXJyZWRIZWlnaHQgJiYgYWRkU2ltcGxlKCAnbG9jYWxQcmVmZXJyZWRIZWlnaHQnLCBub2RlLmxvY2FsUHJlZmVycmVkSGVpZ2h0ICk7XHJcbiAgICBub2RlLm1pbmltdW1IZWlnaHQgIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWluaW11bUhlaWdodCcsIG5vZGUubWluaW11bUhlaWdodCApO1xyXG4gICAgbm9kZS5taW5pbXVtSGVpZ2h0ICE9PSBub2RlLmxvY2FsTWluaW11bUhlaWdodCAmJiBhZGRTaW1wbGUoICdsb2NhbE1pbmltdW1IZWlnaHQnLCBub2RlLmxvY2FsTWluaW11bUhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBub2RlLmxheW91dE9wdGlvbnMgKSB7XHJcbiAgICBhZGRTaW1wbGUoICdsYXlvdXRPcHRpb25zJywgSlNPTi5zdHJpbmdpZnkoIG5vZGUubGF5b3V0T3B0aW9ucywgbnVsbCwgMiApICk7XHJcbiAgfVxyXG5cclxuICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBMYXlvdXROb2RlICkge1xyXG4gICAgIW5vZGUucmVzaXplICYmIGFkZFNpbXBsZSggJ3Jlc2l6ZScsIG5vZGUucmVzaXplICk7XHJcbiAgICAhbm9kZS5sYXlvdXRPcmlnaW4uZXF1YWxzKCBWZWN0b3IyLlpFUk8gKSAmJiBhZGRTaW1wbGUoICdsYXlvdXRPcmlnaW4nLCBub2RlLmxheW91dE9yaWdpbiApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgRmxvd0JveCApIHtcclxuICAgIGFkZFNpbXBsZSggJ29yaWVudGF0aW9uJywgbm9kZS5vcmllbnRhdGlvbiApO1xyXG4gICAgYWRkU2ltcGxlKCAnYWxpZ24nLCBub2RlLmFsaWduICk7XHJcbiAgICBub2RlLnNwYWNpbmcgJiYgYWRkU2ltcGxlKCAnc3BhY2luZycsIG5vZGUuc3BhY2luZyApO1xyXG4gICAgbm9kZS5saW5lU3BhY2luZyAmJiBhZGRTaW1wbGUoICdsaW5lU3BhY2luZycsIG5vZGUubGluZVNwYWNpbmcgKTtcclxuICAgIGFkZFNpbXBsZSggJ2p1c3RpZnknLCBub2RlLmp1c3RpZnkgKTtcclxuICAgIG5vZGUuanVzdGlmeUxpbmVzICYmIGFkZFNpbXBsZSggJ2p1c3RpZnlMaW5lcycsIG5vZGUuanVzdGlmeUxpbmVzICk7XHJcbiAgICBub2RlLndyYXAgJiYgYWRkU2ltcGxlKCAnd3JhcCcsIG5vZGUud3JhcCApO1xyXG4gICAgbm9kZS5zdHJldGNoICYmIGFkZFNpbXBsZSggJ3N0cmV0Y2gnLCBub2RlLnN0cmV0Y2ggKTtcclxuICAgIG5vZGUuZ3JvdyAmJiBhZGRTaW1wbGUoICdncm93Jywgbm9kZS5ncm93ICk7XHJcbiAgICBub2RlLmxlZnRNYXJnaW4gJiYgYWRkU2ltcGxlKCAnbGVmdE1hcmdpbicsIG5vZGUubGVmdE1hcmdpbiApO1xyXG4gICAgbm9kZS5yaWdodE1hcmdpbiAmJiBhZGRTaW1wbGUoICdyaWdodE1hcmdpbicsIG5vZGUucmlnaHRNYXJnaW4gKTtcclxuICAgIG5vZGUudG9wTWFyZ2luICYmIGFkZFNpbXBsZSggJ3RvcE1hcmdpbicsIG5vZGUudG9wTWFyZ2luICk7XHJcbiAgICBub2RlLmJvdHRvbU1hcmdpbiAmJiBhZGRTaW1wbGUoICdib3R0b21NYXJnaW4nLCBub2RlLmJvdHRvbU1hcmdpbiApO1xyXG4gICAgbm9kZS5taW5Db250ZW50V2lkdGggIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWluQ29udGVudFdpZHRoJywgbm9kZS5taW5Db250ZW50V2lkdGggKTtcclxuICAgIG5vZGUubWluQ29udGVudEhlaWdodCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdtaW5Db250ZW50SGVpZ2h0Jywgbm9kZS5taW5Db250ZW50SGVpZ2h0ICk7XHJcbiAgICBub2RlLm1heENvbnRlbnRXaWR0aCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdtYXhDb250ZW50V2lkdGgnLCBub2RlLm1heENvbnRlbnRXaWR0aCApO1xyXG4gICAgbm9kZS5tYXhDb250ZW50SGVpZ2h0ICE9PSBudWxsICYmIGFkZFNpbXBsZSggJ21heENvbnRlbnRIZWlnaHQnLCBub2RlLm1heENvbnRlbnRIZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIGlmICggbm9kZSBpbnN0YW5jZW9mIEdyaWRCb3ggKSB7XHJcbiAgICBhZGRTaW1wbGUoICd4QWxpZ24nLCBub2RlLnhBbGlnbiApO1xyXG4gICAgYWRkU2ltcGxlKCAneUFsaWduJywgbm9kZS55QWxpZ24gKTtcclxuICAgIG5vZGUueFNwYWNpbmcgJiYgYWRkU2ltcGxlKCAneFNwYWNpbmcnLCBub2RlLnhTcGFjaW5nICk7XHJcbiAgICBub2RlLnlTcGFjaW5nICYmIGFkZFNpbXBsZSggJ3lTcGFjaW5nJywgbm9kZS55U3BhY2luZyApO1xyXG4gICAgbm9kZS54U3RyZXRjaCAmJiBhZGRTaW1wbGUoICd4U3RyZXRjaCcsIG5vZGUueFN0cmV0Y2ggKTtcclxuICAgIG5vZGUueVN0cmV0Y2ggJiYgYWRkU2ltcGxlKCAneVN0cmV0Y2gnLCBub2RlLnlTdHJldGNoICk7XHJcbiAgICBub2RlLnhHcm93ICYmIGFkZFNpbXBsZSggJ3hHcm93Jywgbm9kZS54R3JvdyApO1xyXG4gICAgbm9kZS55R3JvdyAmJiBhZGRTaW1wbGUoICd5R3JvdycsIG5vZGUueUdyb3cgKTtcclxuICAgIG5vZGUubGVmdE1hcmdpbiAmJiBhZGRTaW1wbGUoICdsZWZ0TWFyZ2luJywgbm9kZS5sZWZ0TWFyZ2luICk7XHJcbiAgICBub2RlLnJpZ2h0TWFyZ2luICYmIGFkZFNpbXBsZSggJ3JpZ2h0TWFyZ2luJywgbm9kZS5yaWdodE1hcmdpbiApO1xyXG4gICAgbm9kZS50b3BNYXJnaW4gJiYgYWRkU2ltcGxlKCAndG9wTWFyZ2luJywgbm9kZS50b3BNYXJnaW4gKTtcclxuICAgIG5vZGUuYm90dG9tTWFyZ2luICYmIGFkZFNpbXBsZSggJ2JvdHRvbU1hcmdpbicsIG5vZGUuYm90dG9tTWFyZ2luICk7XHJcbiAgICBub2RlLm1pbkNvbnRlbnRXaWR0aCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdtaW5Db250ZW50V2lkdGgnLCBub2RlLm1pbkNvbnRlbnRXaWR0aCApO1xyXG4gICAgbm9kZS5taW5Db250ZW50SGVpZ2h0ICE9PSBudWxsICYmIGFkZFNpbXBsZSggJ21pbkNvbnRlbnRIZWlnaHQnLCBub2RlLm1pbkNvbnRlbnRIZWlnaHQgKTtcclxuICAgIG5vZGUubWF4Q29udGVudFdpZHRoICE9PSBudWxsICYmIGFkZFNpbXBsZSggJ21heENvbnRlbnRXaWR0aCcsIG5vZGUubWF4Q29udGVudFdpZHRoICk7XHJcbiAgICBub2RlLm1heENvbnRlbnRIZWlnaHQgIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWF4Q29udGVudEhlaWdodCcsIG5vZGUubWF4Q29udGVudEhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgUmVjdGFuZ2xlICkge1xyXG4gICAgYWRkQm91bmRzMiggJ3JlY3RCb3VuZHMnLCBub2RlLnJlY3RCb3VuZHMgKTtcclxuICAgIGlmICggbm9kZS5jb3JuZXJYUmFkaXVzIHx8IG5vZGUuY29ybmVyWVJhZGl1cyApIHtcclxuICAgICAgaWYgKCBub2RlLmNvcm5lclhSYWRpdXMgPT09IG5vZGUuY29ybmVyWVJhZGl1cyApIHtcclxuICAgICAgICBhZGRTaW1wbGUoICdjb3JuZXJSYWRpdXMnLCBub2RlLmNvcm5lclJhZGl1cyApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFkZFNpbXBsZSggJ2Nvcm5lclhSYWRpdXMnLCBub2RlLmNvcm5lclhSYWRpdXMgKTtcclxuICAgICAgICBhZGRTaW1wbGUoICdjb3JuZXJZUmFkaXVzJywgbm9kZS5jb3JuZXJZUmFkaXVzICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICggbm9kZSBpbnN0YW5jZW9mIExpbmUgKSB7XHJcbiAgICBhZGRTaW1wbGUoICd4MScsIG5vZGUueDEgKTtcclxuICAgIGFkZFNpbXBsZSggJ3kxJywgbm9kZS55MSApO1xyXG4gICAgYWRkU2ltcGxlKCAneDInLCBub2RlLngyICk7XHJcbiAgICBhZGRTaW1wbGUoICd5MicsIG5vZGUueTIgKTtcclxuICB9XHJcblxyXG4gIGlmICggbm9kZSBpbnN0YW5jZW9mIENpcmNsZSApIHtcclxuICAgIGFkZFNpbXBsZSggJ3JhZGl1cycsIG5vZGUucmFkaXVzICk7XHJcbiAgfVxyXG5cclxuICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBUZXh0ICkge1xyXG4gICAgYWRkU2ltcGxlKCAndGV4dCcsIG5vZGUuc3RyaW5nICk7XHJcbiAgICBhZGRTaW1wbGUoICdmb250Jywgbm9kZS5mb250ICk7XHJcbiAgICBpZiAoIG5vZGUuYm91bmRzTWV0aG9kICE9PSAnaHlicmlkJyApIHtcclxuICAgICAgYWRkU2ltcGxlKCAnYm91bmRzTWV0aG9kJywgbm9kZS5ib3VuZHNNZXRob2QgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICggbm9kZSBpbnN0YW5jZW9mIFJpY2hUZXh0ICkge1xyXG4gICAgYWRkU2ltcGxlKCAndGV4dCcsIG5vZGUuc3RyaW5nICk7XHJcbiAgICBhZGRTaW1wbGUoICdmb250Jywgbm9kZS5mb250IGluc3RhbmNlb2YgRm9udCA/IG5vZGUuZm9udC5nZXRGb250KCkgOiBub2RlLmZvbnQgKTtcclxuICAgIGFkZFBhaW50KCAnZmlsbCcsIG5vZGUuZmlsbCApO1xyXG4gICAgYWRkUGFpbnQoICdzdHJva2UnLCBub2RlLnN0cm9rZSApO1xyXG4gICAgaWYgKCBub2RlLmJvdW5kc01ldGhvZCAhPT0gJ2h5YnJpZCcgKSB7XHJcbiAgICAgIGFkZFNpbXBsZSggJ2JvdW5kc01ldGhvZCcsIG5vZGUuYm91bmRzTWV0aG9kICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIG5vZGUubGluZVdyYXAgIT09IG51bGwgKSB7XHJcbiAgICAgIGFkZFNpbXBsZSggJ2xpbmVXcmFwJywgbm9kZS5saW5lV3JhcCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgSW1hZ2UgKSB7XHJcbiAgICBhZGRJbWFnZSggJ2ltYWdlJywgbm9kZSApO1xyXG4gICAgYWRkU2ltcGxlKCAnaW1hZ2VXaWR0aCcsIG5vZGUuaW1hZ2VXaWR0aCApO1xyXG4gICAgYWRkU2ltcGxlKCAnaW1hZ2VIZWlnaHQnLCBub2RlLmltYWdlSGVpZ2h0ICk7XHJcbiAgICBpZiAoIG5vZGUuaW1hZ2VPcGFjaXR5ICE9PSAxICkge1xyXG4gICAgICBhZGRTaW1wbGUoICdpbWFnZU9wYWNpdHknLCBub2RlLmltYWdlT3BhY2l0eSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBub2RlLmltYWdlQm91bmRzICkge1xyXG4gICAgICBhZGRCb3VuZHMyKCAnaW1hZ2VCb3VuZHMnLCBub2RlLmltYWdlQm91bmRzICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIG5vZGUuaW5pdGlhbFdpZHRoICkge1xyXG4gICAgICBhZGRTaW1wbGUoICdpbml0aWFsV2lkdGgnLCBub2RlLmluaXRpYWxXaWR0aCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBub2RlLmluaXRpYWxIZWlnaHQgKSB7XHJcbiAgICAgIGFkZFNpbXBsZSggJ2luaXRpYWxIZWlnaHQnLCBub2RlLmluaXRpYWxIZWlnaHQgKTtcclxuICAgIH1cclxuICAgIGlmICggbm9kZS5oaXRUZXN0UGl4ZWxzICkge1xyXG4gICAgICBhZGRTaW1wbGUoICdoaXRUZXN0UGl4ZWxzJywgbm9kZS5oaXRUZXN0UGl4ZWxzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBDYW52YXNOb2RlIHx8IG5vZGUgaW5zdGFuY2VvZiBXZWJHTE5vZGUgKSB7XHJcbiAgICBhZGRCb3VuZHMyKCAnY2FudmFzQm91bmRzJywgbm9kZS5jYW52YXNCb3VuZHMgKTtcclxuICB9XHJcblxyXG4gIGlmICggbm9kZSBpbnN0YW5jZW9mIFBhdGggKSB7XHJcbiAgICBpZiAoIG5vZGUuc2hhcGUgKSB7XHJcbiAgICAgIGFkZFNoYXBlKCAnc2hhcGUnLCBub2RlLnNoYXBlICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIG5vZGUuYm91bmRzTWV0aG9kICE9PSAnYWNjdXJhdGUnICkge1xyXG4gICAgICBhZGRTaW1wbGUoICdib3VuZHNNZXRob2QnLCBub2RlLmJvdW5kc01ldGhvZCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgUGF0aCB8fCBub2RlIGluc3RhbmNlb2YgVGV4dCApIHtcclxuICAgIGFkZFBhaW50KCAnZmlsbCcsIG5vZGUuZmlsbCApO1xyXG4gICAgYWRkUGFpbnQoICdzdHJva2UnLCBub2RlLnN0cm9rZSApO1xyXG4gICAgaWYgKCBub2RlLmxpbmVEYXNoLmxlbmd0aCApIHtcclxuICAgICAgYWRkU2ltcGxlKCAnbGluZURhc2gnLCBub2RlLmxpbmVEYXNoICk7XHJcbiAgICB9XHJcbiAgICBpZiAoICFub2RlLmZpbGxQaWNrYWJsZSApIHtcclxuICAgICAgYWRkU2ltcGxlKCAnZmlsbFBpY2thYmxlJywgbm9kZS5maWxsUGlja2FibGUgKTtcclxuICAgIH1cclxuICAgIGlmICggbm9kZS5zdHJva2VQaWNrYWJsZSApIHtcclxuICAgICAgYWRkU2ltcGxlKCAnc3Ryb2tlUGlja2FibGUnLCBub2RlLnN0cm9rZVBpY2thYmxlICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIG5vZGUubGluZVdpZHRoICE9PSAxICkge1xyXG4gICAgICBhZGRTaW1wbGUoICdsaW5lV2lkdGgnLCBub2RlLmxpbmVXaWR0aCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBub2RlLmxpbmVDYXAgIT09ICdidXR0JyApIHtcclxuICAgICAgYWRkU2ltcGxlKCAnbGluZUNhcCcsIG5vZGUubGluZUNhcCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBub2RlLmxpbmVKb2luICE9PSAnbWl0ZXInICkge1xyXG4gICAgICBhZGRTaW1wbGUoICdsaW5lSm9pbicsIG5vZGUubGluZUpvaW4gKTtcclxuICAgIH1cclxuICAgIGlmICggbm9kZS5saW5lRGFzaE9mZnNldCAhPT0gMCApIHtcclxuICAgICAgYWRkU2ltcGxlKCAnbGluZURhc2hPZmZzZXQnLCBub2RlLmxpbmVEYXNoT2Zmc2V0ICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIG5vZGUubWl0ZXJMaW1pdCAhPT0gMTAgKSB7XHJcbiAgICAgIGFkZFNpbXBsZSggJ21pdGVyTGltaXQnLCBub2RlLm1pdGVyTGltaXQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICggbm9kZS50YWdOYW1lICkge1xyXG4gICAgYWRkU2ltcGxlKCAndGFnTmFtZScsIG5vZGUudGFnTmFtZSApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUuYWNjZXNzaWJsZU5hbWUgKSB7XHJcbiAgICBhZGRTaW1wbGUoICdhY2Nlc3NpYmxlTmFtZScsIG5vZGUuYWNjZXNzaWJsZU5hbWUgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLmhlbHBUZXh0ICkge1xyXG4gICAgYWRkU2ltcGxlKCAnaGVscFRleHQnLCBub2RlLmhlbHBUZXh0ICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5wZG9tSGVhZGluZyApIHtcclxuICAgIGFkZFNpbXBsZSggJ3Bkb21IZWFkaW5nJywgbm9kZS5wZG9tSGVhZGluZyApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUuY29udGFpbmVyVGFnTmFtZSApIHtcclxuICAgIGFkZFNpbXBsZSggJ2NvbnRhaW5lclRhZ05hbWUnLCBub2RlLmNvbnRhaW5lclRhZ05hbWUgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLmNvbnRhaW5lckFyaWFSb2xlICkge1xyXG4gICAgYWRkU2ltcGxlKCAnY29udGFpbmVyQXJpYVJvbGUnLCBub2RlLmNvbnRhaW5lckFyaWFSb2xlICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5pbm5lckNvbnRlbnQgKSB7XHJcbiAgICBhZGRTaW1wbGUoICdpbm5lckNvbnRlbnQnLCBub2RlLmlubmVyQ29udGVudCApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUuaW5wdXRUeXBlICkge1xyXG4gICAgYWRkU2ltcGxlKCAnaW5wdXRUeXBlJywgbm9kZS5pbnB1dFR5cGUgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLmlucHV0VmFsdWUgKSB7XHJcbiAgICBhZGRTaW1wbGUoICdpbnB1dFZhbHVlJywgbm9kZS5pbnB1dFZhbHVlICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5wZG9tTmFtZXNwYWNlICkge1xyXG4gICAgYWRkU2ltcGxlKCAncGRvbU5hbWVzcGFjZScsIG5vZGUucGRvbU5hbWVzcGFjZSApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUuYXJpYUxhYmVsICkge1xyXG4gICAgYWRkU2ltcGxlKCAnYXJpYUxhYmVsJywgbm9kZS5hcmlhTGFiZWwgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLmFyaWFSb2xlICkge1xyXG4gICAgYWRkU2ltcGxlKCAnYXJpYVJvbGUnLCBub2RlLmFyaWFSb2xlICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5hcmlhVmFsdWVUZXh0ICkge1xyXG4gICAgYWRkU2ltcGxlKCAnYXJpYVZhbHVlVGV4dCcsIG5vZGUuYXJpYVZhbHVlVGV4dCApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUubGFiZWxUYWdOYW1lICkge1xyXG4gICAgYWRkU2ltcGxlKCAnbGFiZWxUYWdOYW1lJywgbm9kZS5sYWJlbFRhZ05hbWUgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLmxhYmVsQ29udGVudCApIHtcclxuICAgIGFkZFNpbXBsZSggJ2xhYmVsQ29udGVudCcsIG5vZGUubGFiZWxDb250ZW50ICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5hcHBlbmRMYWJlbCApIHtcclxuICAgIGFkZFNpbXBsZSggJ2FwcGVuZExhYmVsJywgbm9kZS5hcHBlbmRMYWJlbCApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUuZGVzY3JpcHRpb25UYWdOYW1lICkge1xyXG4gICAgYWRkU2ltcGxlKCAnZGVzY3JpcHRpb25UYWdOYW1lJywgbm9kZS5kZXNjcmlwdGlvblRhZ05hbWUgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLmRlc2NyaXB0aW9uQ29udGVudCApIHtcclxuICAgIGFkZFNpbXBsZSggJ2Rlc2NyaXB0aW9uQ29udGVudCcsIG5vZGUuZGVzY3JpcHRpb25Db250ZW50ICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5hcHBlbmREZXNjcmlwdGlvbiApIHtcclxuICAgIGFkZFNpbXBsZSggJ2FwcGVuZERlc2NyaXB0aW9uJywgbm9kZS5hcHBlbmREZXNjcmlwdGlvbiApO1xyXG4gIH1cclxuICBpZiAoICFub2RlLnBkb21WaXNpYmxlICkge1xyXG4gICAgYWRkU2ltcGxlKCAncGRvbVZpc2libGUnLCBub2RlLnBkb21WaXNpYmxlICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5wZG9tT3JkZXIgKSB7XHJcbiAgICBhZGRTaW1wbGUoICdwZG9tT3JkZXInLCBub2RlLnBkb21PcmRlci5tYXAoIG5vZGUgPT4gbm9kZSA9PT0gbnVsbCA/ICdudWxsJyA6IG5vZGUuY29uc3RydWN0b3IubmFtZSApICk7XHJcbiAgfVxyXG5cclxuICBpZiAoICFub2RlLnZpc2libGUgKSB7XHJcbiAgICBhZGRTaW1wbGUoICd2aXNpYmxlJywgbm9kZS52aXNpYmxlICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5vcGFjaXR5ICE9PSAxICkge1xyXG4gICAgYWRkTnVtYmVyKCAnb3BhY2l0eScsIG5vZGUub3BhY2l0eSApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUucGlja2FibGUgIT09IG51bGwgKSB7XHJcbiAgICBhZGRTaW1wbGUoICdwaWNrYWJsZScsIG5vZGUucGlja2FibGUgKTtcclxuICB9XHJcbiAgaWYgKCAhbm9kZS5lbmFibGVkICkge1xyXG4gICAgYWRkU2ltcGxlKCAnZW5hYmxlZCcsIG5vZGUuZW5hYmxlZCApO1xyXG4gIH1cclxuICBpZiAoICFub2RlLmlucHV0RW5hYmxlZCApIHtcclxuICAgIGFkZFNpbXBsZSggJ2lucHV0RW5hYmxlZCcsIG5vZGUuaW5wdXRFbmFibGVkICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5jdXJzb3IgIT09IG51bGwgKSB7XHJcbiAgICBhZGRTaW1wbGUoICdjdXJzb3InLCBub2RlLmN1cnNvciApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUudHJhbnNmb3JtQm91bmRzICkge1xyXG4gICAgYWRkU2ltcGxlKCAndHJhbnNmb3JtQm91bmRzJywgbm9kZS50cmFuc2Zvcm1Cb3VuZHMgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLnJlbmRlcmVyICkge1xyXG4gICAgYWRkU2ltcGxlKCAncmVuZGVyZXInLCBub2RlLnJlbmRlcmVyICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS51c2VzT3BhY2l0eSApIHtcclxuICAgIGFkZFNpbXBsZSggJ3VzZXNPcGFjaXR5Jywgbm9kZS51c2VzT3BhY2l0eSApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUubGF5ZXJTcGxpdCApIHtcclxuICAgIGFkZFNpbXBsZSggJ2xheWVyU3BsaXQnLCBub2RlLmxheWVyU3BsaXQgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLmNzc1RyYW5zZm9ybSApIHtcclxuICAgIGFkZFNpbXBsZSggJ2Nzc1RyYW5zZm9ybScsIG5vZGUuY3NzVHJhbnNmb3JtICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5leGNsdWRlSW52aXNpYmxlICkge1xyXG4gICAgYWRkU2ltcGxlKCAnZXhjbHVkZUludmlzaWJsZScsIG5vZGUuZXhjbHVkZUludmlzaWJsZSApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUucHJldmVudEZpdCApIHtcclxuICAgIGFkZFNpbXBsZSggJ3ByZXZlbnRGaXQnLCBub2RlLnByZXZlbnRGaXQgKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLndlYmdsU2NhbGUgIT09IG51bGwgKSB7XHJcbiAgICBhZGRTaW1wbGUoICd3ZWJnbFNjYWxlJywgbm9kZS53ZWJnbFNjYWxlICk7XHJcbiAgfVxyXG4gIGlmICggIW5vZGUubWF0cml4LmlzSWRlbnRpdHkoKSApIHtcclxuICAgIGFkZE1hdHJpeDMoICdtYXRyaXgnLCBub2RlLm1hdHJpeCApO1xyXG4gIH1cclxuICBpZiAoIG5vZGUubWF4V2lkdGggIT09IG51bGwgKSB7XHJcbiAgICBhZGRTaW1wbGUoICdtYXhXaWR0aCcsIG5vZGUubWF4V2lkdGggKTtcclxuICB9XHJcbiAgaWYgKCBub2RlLm1heEhlaWdodCAhPT0gbnVsbCApIHtcclxuICAgIGFkZFNpbXBsZSggJ21heEhlaWdodCcsIG5vZGUubWF4SGVpZ2h0ICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5jbGlwQXJlYSAhPT0gbnVsbCApIHtcclxuICAgIGFkZFNoYXBlKCAnY2xpcEFyZWEnLCBub2RlLmNsaXBBcmVhICk7XHJcbiAgfVxyXG4gIGlmICggbm9kZS5tb3VzZUFyZWEgIT09IG51bGwgKSB7XHJcbiAgICBpZiAoIG5vZGUubW91c2VBcmVhIGluc3RhbmNlb2YgQm91bmRzMiApIHtcclxuICAgICAgYWRkQm91bmRzMiggJ21vdXNlQXJlYScsIG5vZGUubW91c2VBcmVhICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYWRkU2hhcGUoICdtb3VzZUFyZWEnLCBub2RlLm1vdXNlQXJlYSApO1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoIG5vZGUudG91Y2hBcmVhICE9PSBudWxsICkge1xyXG4gICAgaWYgKCBub2RlLnRvdWNoQXJlYSBpbnN0YW5jZW9mIEJvdW5kczIgKSB7XHJcbiAgICAgIGFkZEJvdW5kczIoICd0b3VjaEFyZWEnLCBub2RlLnRvdWNoQXJlYSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFkZFNoYXBlKCAndG91Y2hBcmVhJywgbm9kZS50b3VjaEFyZWEgKTtcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCBub2RlLmlucHV0TGlzdGVuZXJzLmxlbmd0aCApIHtcclxuICAgIGFkZFNpbXBsZSggJ2lucHV0TGlzdGVuZXJzJywgbm9kZS5pbnB1dExpc3RlbmVycy5tYXAoIGxpc3RlbmVyID0+IGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKS5qb2luKCAnLCAnICkgKTtcclxuICB9XHJcblxyXG4gIGNoaWxkcmVuLnB1c2goIG5ldyBTcGFjZXIoIDUsIDUgKSApO1xyXG5cclxuICBhZGRCb3VuZHMyKCAnbG9jYWxCb3VuZHMnLCBub2RlLmxvY2FsQm91bmRzICk7XHJcbiAgaWYgKCBub2RlLmxvY2FsQm91bmRzT3ZlcnJpZGRlbiApIHtcclxuICAgIGFkZFNpbXBsZSggJ2xvY2FsQm91bmRzT3ZlcnJpZGRlbicsIG5vZGUubG9jYWxCb3VuZHNPdmVycmlkZGVuICk7XHJcbiAgfVxyXG4gIGFkZEJvdW5kczIoICdib3VuZHMnLCBub2RlLmJvdW5kcyApO1xyXG4gIGlmICggaXNGaW5pdGUoIG5vZGUud2lkdGggKSApIHtcclxuICAgIGFkZFNpbXBsZSggJ3dpZHRoJywgbm9kZS53aWR0aCApO1xyXG4gIH1cclxuICBpZiAoIGlzRmluaXRlKCBub2RlLmhlaWdodCApICkge1xyXG4gICAgYWRkU2ltcGxlKCAnaGVpZ2h0Jywgbm9kZS5oZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIGNoaWxkcmVuLnB1c2goIG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnQ29weSBQYXRoJywgeyBmb250U2l6ZTogMTIgfSApLFxyXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvcHlUb0NsaXBib2FyZCggJ3BoZXQuam9pc3QuZGlzcGxheS5yb290Tm9kZScgKyB0cmFpbC5pbmRpY2VzLm1hcCggaW5kZXggPT4ge1xyXG4gICAgICByZXR1cm4gYC5jaGlsZHJlblsgJHtpbmRleH0gXWA7XHJcbiAgICB9ICkuam9pbiggJycgKSApLFxyXG4gICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gIH0gKSApO1xyXG5cclxuICByZXR1cm4gY2hpbGRyZW47XHJcbn07XHJcblxyXG5jb25zdCBpQ29sb3JUb0NvbG9yID0gKCBjb2xvcjogVENvbG9yICk6IENvbG9yIHwgbnVsbCA9PiB7XHJcbiAgY29uc3Qgbm9uUHJvcGVydHk6IENvbG9yIHwgc3RyaW5nIHwgbnVsbCA9ICggY29sb3IgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5IHx8IGNvbG9yIGluc3RhbmNlb2YgVGlueVByb3BlcnR5ICkgPyBjb2xvci52YWx1ZSA6IGNvbG9yO1xyXG4gIHJldHVybiBub25Qcm9wZXJ0eSA9PT0gbnVsbCA/IG51bGwgOiBDb2xvci50b0NvbG9yKCBub25Qcm9wZXJ0eSApO1xyXG59O1xyXG5cclxuY29uc3QgaXNQYWludE5vblRyYW5zcGFyZW50ID0gKCBwYWludDogVFBhaW50ICk6IGJvb2xlYW4gPT4ge1xyXG4gIGlmICggcGFpbnQgaW5zdGFuY2VvZiBQYWludCApIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGNvbnN0IGNvbG9yID0gaUNvbG9yVG9Db2xvciggcGFpbnQgKTtcclxuICAgIHJldHVybiAhIWNvbG9yICYmIGNvbG9yLmFscGhhID4gMDtcclxuICB9XHJcbn07XHJcblxyXG4vLyBNaXNzaW5nIG9wdGltaXphdGlvbnMgb24gYm91bmRzIG9uIHB1cnBvc2UsIHNvIHdlIGhpdCB2aXN1YWwgY2hhbmdlc1xyXG5jb25zdCB2aXN1YWxIaXRUZXN0ID0gKCBub2RlOiBOb2RlLCBwb2ludDogVmVjdG9yMiApOiBUcmFpbCB8IG51bGwgPT4ge1xyXG4gIGlmICggIW5vZGUudmlzaWJsZSApIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBjb25zdCBsb2NhbFBvaW50ID0gbm9kZS5fdHJhbnNmb3JtLmdldEludmVyc2UoKS50aW1lc1ZlY3RvcjIoIHBvaW50ICk7XHJcblxyXG4gIGNvbnN0IGNsaXBBcmVhID0gbm9kZS5jbGlwQXJlYTtcclxuICBpZiAoIGNsaXBBcmVhICE9PSBudWxsICYmICFjbGlwQXJlYS5jb250YWluc1BvaW50KCBsb2NhbFBvaW50ICkgKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGZvciAoIGxldCBpID0gbm9kZS5fY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICBjb25zdCBjaGlsZCA9IG5vZGUuX2NoaWxkcmVuWyBpIF07XHJcblxyXG4gICAgY29uc3QgY2hpbGRIaXQgPSB2aXN1YWxIaXRUZXN0KCBjaGlsZCwgbG9jYWxQb2ludCApO1xyXG5cclxuICAgIGlmICggY2hpbGRIaXQgKSB7XHJcbiAgICAgIHJldHVybiBjaGlsZEhpdC5hZGRBbmNlc3Rvciggbm9kZSwgaSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gRGlkbid0IGhpdCBvdXIgY2hpbGRyZW4sIHNvIGNoZWNrIG91cnNlbGYgYXMgYSBsYXN0IHJlc29ydC4gQ2hlY2sgb3VyIHNlbGZCb3VuZHMgZmlyc3QsIHNvIHdlIGNhbiBwb3RlbnRpYWxseVxyXG4gIC8vIGF2b2lkIGhpdC10ZXN0aW5nIHRoZSBhY3R1YWwgb2JqZWN0ICh3aGljaCBtYXkgYmUgbW9yZSBleHBlbnNpdmUpLlxyXG4gIGlmICggbm9kZS5zZWxmQm91bmRzLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSApIHtcclxuXHJcbiAgICAvLyBJZ25vcmUgdGhvc2UgdHJhbnNwYXJlbnQgcGF0aHMuLi5cclxuICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIFBhdGggJiYgbm9kZS5oYXNTaGFwZSgpICkge1xyXG4gICAgICBpZiAoIGlzUGFpbnROb25UcmFuc3BhcmVudCggbm9kZS5maWxsICkgJiYgbm9kZS5nZXRTaGFwZSgpIS5jb250YWluc1BvaW50KCBsb2NhbFBvaW50ICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFpbCggbm9kZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggaXNQYWludE5vblRyYW5zcGFyZW50KCBub2RlLnN0cm9rZSApICYmIG5vZGUuZ2V0U3Ryb2tlZFNoYXBlKCkhLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSApIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYWlsKCBub2RlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBub2RlLmNvbnRhaW5zUG9pbnRTZWxmKCBsb2NhbFBvaW50ICkgKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVHJhaWwoIG5vZGUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIE5vIGhpdFxyXG4gIHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuY29uc3QgY29weVRvQ2xpcGJvYXJkID0gYXN5bmMgKCBzdHI6IHN0cmluZyApID0+IHtcclxuICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQoIHN0ciApO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0TG9jYWxTaGFwZSA9ICggbm9kZTogTm9kZSwgdXNlTW91c2U6IGJvb2xlYW4sIHVzZVRvdWNoOiBib29sZWFuICk6IFNoYXBlID0+IHtcclxuICBsZXQgc2hhcGUgPSBTaGFwZS51bmlvbiggW1xyXG4gICAgLi4uKCAoIHVzZU1vdXNlICYmIG5vZGUubW91c2VBcmVhICkgPyBbIG5vZGUubW91c2VBcmVhIGluc3RhbmNlb2YgU2hhcGUgPyBub2RlLm1vdXNlQXJlYSA6IFNoYXBlLmJvdW5kcyggbm9kZS5tb3VzZUFyZWEgKSBdIDogW10gKSxcclxuICAgIC4uLiggKCB1c2VUb3VjaCAmJiBub2RlLnRvdWNoQXJlYSApID8gWyBub2RlLnRvdWNoQXJlYSBpbnN0YW5jZW9mIFNoYXBlID8gbm9kZS50b3VjaEFyZWEgOiBTaGFwZS5ib3VuZHMoIG5vZGUudG91Y2hBcmVhICkgXSA6IFtdICksXHJcbiAgICBub2RlLmdldFNlbGZTaGFwZSgpLFxyXG5cclxuICAgIC4uLm5vZGUuY2hpbGRyZW4uZmlsdGVyKCBjaGlsZCA9PiB7XHJcbiAgICAgIHJldHVybiBjaGlsZC52aXNpYmxlICYmIGNoaWxkLnBpY2thYmxlICE9PSBmYWxzZTtcclxuICAgIH0gKS5tYXAoIGNoaWxkID0+IGdldExvY2FsU2hhcGUoIGNoaWxkLCB1c2VNb3VzZSwgdXNlVG91Y2ggKS50cmFuc2Zvcm1lZCggY2hpbGQubWF0cml4ICkgKVxyXG4gIF0uZmlsdGVyKCBzaGFwZSA9PiBzaGFwZS5ib3VuZHMuaXNWYWxpZCgpICkgKTtcclxuXHJcbiAgaWYgKCBub2RlLmhhc0NsaXBBcmVhKCkgKSB7XHJcbiAgICBzaGFwZSA9IHNoYXBlLnNoYXBlSW50ZXJzZWN0aW9uKCBub2RlLmNsaXBBcmVhISApO1xyXG4gIH1cclxuICByZXR1cm4gc2hhcGU7XHJcbn07XHJcblxyXG5jb25zdCBnZXRTaGFwZSA9ICggdHJhaWw6IFRyYWlsLCB1c2VNb3VzZTogYm9vbGVhbiwgdXNlVG91Y2g6IGJvb2xlYW4gKTogU2hhcGUgPT4ge1xyXG4gIGxldCBzaGFwZSA9IGdldExvY2FsU2hhcGUoIHRyYWlsLmxhc3ROb2RlKCksIHVzZU1vdXNlLCB1c2VUb3VjaCApO1xyXG5cclxuICBmb3IgKCBsZXQgaSA9IHRyYWlsLm5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgY29uc3Qgbm9kZSA9IHRyYWlsLm5vZGVzWyBpIF07XHJcblxyXG4gICAgaWYgKCBub2RlLmhhc0NsaXBBcmVhKCkgKSB7XHJcbiAgICAgIHNoYXBlID0gc2hhcGUuc2hhcGVJbnRlcnNlY3Rpb24oIG5vZGUuY2xpcEFyZWEhICk7XHJcbiAgICB9XHJcbiAgICBzaGFwZSA9IHNoYXBlLnRyYW5zZm9ybWVkKCBub2RlLm1hdHJpeCApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHNoYXBlO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQkFBbUIsTUFBTSxzQ0FBc0M7QUFDdEUsT0FBT0MsZUFBZSxNQUFNLGtDQUFrQztBQUM5RCxPQUFPQyxjQUFjLE1BQU0saUNBQWlDO0FBQzVELE9BQU9DLFlBQVksTUFBTSwrQkFBK0I7QUFDeEQsT0FBT0MsT0FBTyxNQUFNLHlCQUF5QjtBQUU3QyxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLE9BQU8sTUFBTSx5QkFBeUI7QUFDN0MsT0FBT0MsaUJBQWlCLE1BQU0sNENBQTRDO0FBQzFFLE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsU0FBU0MsVUFBVSxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFFQyxHQUFHLEVBQUVDLFlBQVksRUFBRUMsWUFBWSxFQUFFQyxPQUFPLEVBQUVDLElBQUksRUFBZ0JDLE9BQU8sRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLFVBQVUsRUFBRUMsSUFBSSxFQUFFQyxjQUFjLEVBQUVDLG9CQUFvQixFQUFFQyxtQkFBbUIsRUFBRUMsSUFBSSxFQUFlQyxXQUFXLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxPQUFPLEVBQWdCQyxhQUFhLEVBQUVDLGNBQWMsRUFBRUMsU0FBUyxFQUFFQyxRQUFRLEVBQWlDQyxNQUFNLEVBQVVDLElBQUksRUFBdUJDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxVQUFVLEVBQUVDLFNBQVMsUUFBUSw2QkFBNkI7QUFDdmQsT0FBT0MsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxPQUFPQyxvQkFBb0IsTUFBTSxzQ0FBc0M7QUFDdkUsT0FBT0MsTUFB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