// Copyright 2019-2022, University of Colorado Boulder

/**
 * This is a graphical representation of a bicycle pump. A user can move the handle up and down.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Circle, DragListener, LinearGradient, Node, PaintColorProperty, Path, Rectangle, SceneryConstants } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sceneryPhet from './sceneryPhet.js';
import SegmentedBarGraphNode from './SegmentedBarGraphNode.js';

// The follow constants define the size and positions of the various components of the pump as proportions of the
// overall width and height of the node.
const PUMP_BASE_WIDTH_PROPORTION = 0.35;
const PUMP_BASE_HEIGHT_PROPORTION = 0.075;
const PUMP_BODY_HEIGHT_PROPORTION = 0.7;
const PUMP_BODY_WIDTH_PROPORTION = 0.07;
const PUMP_SHAFT_WIDTH_PROPORTION = PUMP_BODY_WIDTH_PROPORTION * 0.25;
const PUMP_SHAFT_HEIGHT_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION;
const PUMP_HANDLE_HEIGHT_PROPORTION = 0.05;
const CONE_HEIGHT_PROPORTION = 0.09;
const HOSE_CONNECTOR_HEIGHT_PROPORTION = 0.04;
const HOSE_CONNECTOR_WIDTH_PROPORTION = 0.05;
const SHAFT_OPENING_TILT_FACTOR = 0.33;
const BODY_TO_HOSE_ATTACH_POINT_X = 13;
const BODY_TO_HOSE_ATTACH_POINT_Y = -26;
export default class BicyclePumpNode extends Node {
  // parts of the pump needed by setPumpHandleToInitialPosition

  // DragListener for the pump handle

  /**
   * @param numberProperty - number of particles in the simulation
   * @param rangeProperty - allowed range
   * @param providedOptions
   */
  constructor(numberProperty, rangeProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      width: 200,
      height: 250,
      handleFill: '#adafb1',
      shaftFill: '#cacaca',
      bodyFill: '#d50000',
      bodyTopFill: '#997677',
      indicatorBackgroundFill: '#443333',
      indicatorRemainingFill: '#999999',
      hoseFill: '#b3b3b3',
      baseFill: '#aaaaaa',
      hoseCurviness: 1,
      hoseAttachmentOffset: new Vector2(100, 100),
      nodeEnabledProperty: null,
      injectionEnabledProperty: new BooleanProperty(true),
      handleTouchAreaXDilation: 15,
      handleTouchAreaYDilation: 15,
      handleMouseAreaXDilation: 0,
      handleMouseAreaYDilation: 0,
      dragListenerOptions: {},
      handleCursor: 'ns-resize',
      // NodeOptions
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'PumpNode'
    }, providedOptions);
    const width = options.width;
    const height = options.height;
    super(options);

    // does this instance own nodeEnabledProperty?
    const ownsEnabledProperty = !options.nodeEnabledProperty;
    this.nodeEnabledProperty = options.nodeEnabledProperty || new BooleanProperty(true);
    this.hoseAttachmentOffset = options.hoseAttachmentOffset;

    // create the base of the pump
    const baseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
    const baseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;
    const baseFillColorProperty = new PaintColorProperty(options.baseFill);
    const pumpBaseNode = createPumpBaseNode(baseWidth, baseHeight, baseFillColorProperty);

    // sizing for the body of the pump
    const pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
    const pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;

    // create the cone
    const coneHeight = height * CONE_HEIGHT_PROPORTION;
    const coneNode = createConeNode(pumpBodyWidth, coneHeight, baseFillColorProperty);
    coneNode.bottom = pumpBaseNode.top + 8;

    // use PaintColorProperty so that colors can be updated dynamically
    const bodyFillColorProperty = new PaintColorProperty(options.bodyFill);
    const bodyFillBrighterColorProperty = new PaintColorProperty(bodyFillColorProperty, {
      luminanceFactor: 0.2
    });
    const bodyFillDarkerColorProperty = new PaintColorProperty(bodyFillColorProperty, {
      luminanceFactor: -0.2
    });
    this.pumpBodyNode = new Rectangle(0, 0, pumpBodyWidth, pumpBodyHeight, 0, 0, {
      fill: new LinearGradient(0, 0, pumpBodyWidth, 0).addColorStop(0, bodyFillBrighterColorProperty).addColorStop(0.4, bodyFillColorProperty).addColorStop(0.7, bodyFillDarkerColorProperty)
    });
    this.pumpBodyNode.centerX = coneNode.centerX;
    this.pumpBodyNode.bottom = coneNode.top + 18;

    // use PaintColorProperty so that colors can be updated dynamically
    const bodyTopFillColorProperty = new PaintColorProperty(options.bodyTopFill);
    const bodyTopStrokeColorProperty = new PaintColorProperty(bodyTopFillColorProperty, {
      luminanceFactor: -0.3
    });

    // create the back part of the top of the body
    const bodyTopBackNode = createBodyTopHalfNode(pumpBodyWidth, -1, bodyTopFillColorProperty, bodyTopStrokeColorProperty);
    bodyTopBackNode.centerX = this.pumpBodyNode.centerX;
    bodyTopBackNode.bottom = this.pumpBodyNode.top;

    // create the front part of the top of the body
    const bodyTopFrontNode = createBodyTopHalfNode(pumpBodyWidth, 1, bodyTopFillColorProperty, bodyTopStrokeColorProperty);
    bodyTopFrontNode.centerX = this.pumpBodyNode.centerX;
    bodyTopFrontNode.top = bodyTopBackNode.bottom - 0.4; // tweak slightly to prevent pump body from showing through

    // create the bottom cap on the body
    const bodyBottomCapNode = new Path(new Shape().ellipse(0, 0, bodyTopFrontNode.width * 0.55, 3, 0), {
      fill: new PaintColorProperty(baseFillColorProperty, {
        luminanceFactor: -0.3
      }),
      centerX: bodyTopFrontNode.centerX,
      bottom: coneNode.top + 4
    });

    // create the node that will be used to indicate the remaining capacity
    const remainingCapacityIndicator = new SegmentedBarGraphNode(numberProperty, rangeProperty, {
      width: pumpBodyWidth * 0.6,
      height: pumpBodyHeight * 0.7,
      centerX: this.pumpBodyNode.centerX,
      centerY: (this.pumpBodyNode.top + coneNode.top) / 2,
      numSegments: 36,
      backgroundColor: options.indicatorBackgroundFill,
      fullyLitIndicatorColor: options.indicatorRemainingFill,
      indicatorHeightProportion: 0.7
    });

    // whether the hose should be attached to the left or right side of the pump cone
    const hoseAttachedOnRight = options.hoseAttachmentOffset.x > 0;
    const hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    const hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;

    // create the hose
    const hoseNode = new Path(new Shape().moveTo(hoseAttachedOnRight ? BODY_TO_HOSE_ATTACH_POINT_X : -BODY_TO_HOSE_ATTACH_POINT_X, BODY_TO_HOSE_ATTACH_POINT_Y).cubicCurveTo(options.hoseCurviness * (options.hoseAttachmentOffset.x - BODY_TO_HOSE_ATTACH_POINT_X), BODY_TO_HOSE_ATTACH_POINT_Y, 0, options.hoseAttachmentOffset.y, options.hoseAttachmentOffset.x - (hoseAttachedOnRight ? hoseConnectorWidth : -hoseConnectorWidth), options.hoseAttachmentOffset.y), {
      lineWidth: 4,
      stroke: options.hoseFill
    });

    // create the external hose connector, which connects the hose to an external point
    const externalHoseConnector = createHoseConnectorNode(hoseConnectorWidth, hoseConnectorHeight, baseFillColorProperty);
    externalHoseConnector.setTranslation(hoseAttachedOnRight ? options.hoseAttachmentOffset.x - externalHoseConnector.width : options.hoseAttachmentOffset.x, options.hoseAttachmentOffset.y - externalHoseConnector.height / 2);

    // create the local hose connector, which connects the hose to the cone
    const localHoseConnector = createHoseConnectorNode(hoseConnectorWidth, hoseConnectorHeight, baseFillColorProperty);
    const localHoseOffsetX = hoseAttachedOnRight ? BODY_TO_HOSE_ATTACH_POINT_X : -BODY_TO_HOSE_ATTACH_POINT_X;
    localHoseConnector.setTranslation(localHoseOffsetX - hoseConnectorWidth / 2, BODY_TO_HOSE_ATTACH_POINT_Y - localHoseConnector.height / 2);

    // sizing for the pump shaft
    const pumpShaftWidth = width * PUMP_SHAFT_WIDTH_PROPORTION;
    const pumpShaftHeight = height * PUMP_SHAFT_HEIGHT_PROPORTION;

    // use PaintColorProperty so that colors can be updated dynamically
    const shaftFillColorProperty = new PaintColorProperty(options.shaftFill);
    const shaftStrokeColorProperty = new PaintColorProperty(shaftFillColorProperty, {
      luminanceFactor: -0.38
    });

    // create the pump shaft, which is the part below the handle and inside the body
    this.pumpShaftNode = new Rectangle(0, 0, pumpShaftWidth, pumpShaftHeight, {
      fill: shaftFillColorProperty,
      stroke: shaftStrokeColorProperty,
      pickable: false
    });
    this.pumpShaftNode.x = -pumpShaftWidth / 2;

    // create the handle of the pump
    this.pumpHandleNode = createPumpHandleNode(options.handleFill);
    const pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;
    this.pumpHandleNode.touchArea = this.pumpHandleNode.localBounds.dilatedXY(options.handleTouchAreaXDilation, options.handleTouchAreaYDilation);
    this.pumpHandleNode.mouseArea = this.pumpHandleNode.localBounds.dilatedXY(options.handleMouseAreaXDilation, options.handleMouseAreaYDilation);
    this.pumpHandleNode.scale(pumpHandleHeight / this.pumpHandleNode.height);
    this.setPumpHandleToInitialPosition();

    // enable/disable behavior and appearance for the handle
    const enabledListener = enabled => {
      this.pumpHandleNode.interruptSubtreeInput();
      this.pumpHandleNode.pickable = enabled;
      this.pumpHandleNode.cursor = enabled ? options.handleCursor : 'default';
      this.pumpHandleNode.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
      this.pumpShaftNode.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
    };
    this.nodeEnabledProperty.link(enabledListener);

    // define the allowed range for the pump handle's movement
    const maxHandleYOffset = this.pumpHandleNode.centerY;
    const minHandleYOffset = maxHandleYOffset + -PUMP_SHAFT_HEIGHT_PROPORTION * pumpBodyHeight;
    this.handleDragListener = new HandleDragListener(numberProperty, rangeProperty, this.nodeEnabledProperty, options.injectionEnabledProperty, minHandleYOffset, maxHandleYOffset, this.pumpHandleNode, this.pumpShaftNode, combineOptions({
      tandem: options.tandem.createTandem('handleDragListener')
    }, options.dragListenerOptions));
    this.pumpHandleNode.addInputListener(this.handleDragListener);

    // add the pieces with the correct layering
    this.addChild(pumpBaseNode);
    this.addChild(bodyTopBackNode);
    this.addChild(bodyBottomCapNode);
    this.addChild(this.pumpShaftNode);
    this.addChild(this.pumpHandleNode);
    this.addChild(this.pumpBodyNode);
    this.addChild(remainingCapacityIndicator);
    this.addChild(bodyTopFrontNode);
    this.addChild(coneNode);
    this.addChild(hoseNode);
    this.addChild(externalHoseConnector);
    this.addChild(localHoseConnector);

    // With ?dev query parameter, place a red dot at the origin.
    if (phet.chipper.queryParameters.dev) {
      this.addChild(new Circle(2, {
        fill: 'red'
      }));
    }

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'BicyclePumpNode', this);
    this.disposeBicyclePumpNode = () => {
      this.handleDragListener.dispose(); // to unregister tandem

      if (ownsEnabledProperty) {
        this.nodeEnabledProperty.dispose();
      } else if (this.nodeEnabledProperty.hasListener(enabledListener)) {
        this.nodeEnabledProperty.unlink(enabledListener);
      }
    };
  }

  /**
   * Sets handle and shaft to their initial position
   */
  setPumpHandleToInitialPosition() {
    this.pumpHandleNode.bottom = this.pumpBodyNode.top - 18; // empirically determined
    this.pumpShaftNode.top = this.pumpHandleNode.bottom;
  }
  reset() {
    this.setPumpHandleToInitialPosition();
    this.handleDragListener.reset();
  }
  dispose() {
    this.disposeBicyclePumpNode();
    super.dispose();
  }
}

/**
 * Draws the base of the pump. Many of the multipliers and point positions were arrived at empirically.
 *
 * @param width - the width of the base
 * @param height - the height of the base
 * @param fill
 */
function createPumpBaseNode(width, height, fill) {
  // 3D effect is being used, so most of the height makes up the surface
  const topOfBaseHeight = height * 0.7;
  const halfOfBaseWidth = width / 2;

  // use PaintColorProperty so that colors can be updated dynamically
  const baseFillBrighterColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: 0.05
  });
  const baseFillDarkerColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: -0.2
  });
  const baseFillDarkestColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: -0.4
  });

  // rounded rectangle that is the top of the base
  const topOfBaseNode = new Rectangle(-halfOfBaseWidth, -topOfBaseHeight / 2, width, topOfBaseHeight, 20, 20, {
    fill: new LinearGradient(-halfOfBaseWidth, 0, halfOfBaseWidth, 0).addColorStop(0, baseFillBrighterColorProperty).addColorStop(0.5, fill).addColorStop(1, baseFillDarkerColorProperty)
  });
  const pumpBaseEdgeHeight = height * 0.65;
  const pumpBaseSideEdgeYControlPoint = pumpBaseEdgeHeight * 1.05;
  const pumpBaseBottomEdgeXCurveStart = width * 0.35;

  // the front edge of the pump base, draw counter-clockwise starting at left edge
  const pumpEdgeShape = new Shape().lineTo(-halfOfBaseWidth, 0).lineTo(-halfOfBaseWidth, pumpBaseEdgeHeight / 2).quadraticCurveTo(-halfOfBaseWidth, pumpBaseSideEdgeYControlPoint, -pumpBaseBottomEdgeXCurveStart, pumpBaseEdgeHeight).lineTo(pumpBaseBottomEdgeXCurveStart, pumpBaseEdgeHeight).quadraticCurveTo(halfOfBaseWidth, pumpBaseSideEdgeYControlPoint, halfOfBaseWidth, pumpBaseEdgeHeight / 2).lineTo(halfOfBaseWidth, 0).close();

  // color the front edge of the pump base
  const pumpEdgeNode = new Path(pumpEdgeShape, {
    fill: new LinearGradient(-halfOfBaseWidth, 0, halfOfBaseWidth, 0).addColorStop(0, baseFillDarkestColorProperty).addColorStop(0.15, baseFillDarkerColorProperty).addColorStop(1, baseFillDarkestColorProperty)
  });
  pumpEdgeNode.centerY = -pumpEdgeNode.height / 2;

  // 0.6 determined empirically for best positioning
  topOfBaseNode.bottom = pumpEdgeNode.bottom - pumpBaseEdgeHeight / 2 + 0.6;
  return new Node({
    children: [pumpEdgeNode, topOfBaseNode]
  });
}

/**
 * Creates half of the opening at the top of the pump body. Passing in -1 for the sign creates the back half, and
 * passing in 1 creates the front.
 */
function createBodyTopHalfNode(width, sign, fill, stroke) {
  const bodyTopShape = new Shape().moveTo(0, 0).cubicCurveTo(0, sign * width * SHAFT_OPENING_TILT_FACTOR, width, sign * width * SHAFT_OPENING_TILT_FACTOR, width, 0);
  return new Path(bodyTopShape, {
    fill: fill,
    stroke: stroke
  });
}

/**
 * Creates a hose connector. The hose has one on each of its ends.
 */
function createHoseConnectorNode(width, height, fill) {
  // use PaintColorProperty so that colors can be updated dynamically
  const fillBrighterColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: 0.1
  });
  const fillDarkerColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: -0.2
  });
  const fillDarkestColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: -0.4
  });
  return new Rectangle(0, 0, width, height, 2, 2, {
    fill: new LinearGradient(0, 0, 0, height).addColorStop(0, fillDarkerColorProperty).addColorStop(0.3, fill).addColorStop(0.35, fillBrighterColorProperty).addColorStop(0.4, fillBrighterColorProperty).addColorStop(1, fillDarkestColorProperty)
  });
}

/**
 * Creates the cone, which connects the pump base to the pump body.
 * @param pumpBodyWidth - the width of the pump body (not quite as wide as the top of the cone)
 * @param height
 * @param fill
 */
function createConeNode(pumpBodyWidth, height, fill) {
  const coneTopWidth = pumpBodyWidth * 1.2;
  const coneTopRadiusY = 3;
  const coneTopRadiusX = coneTopWidth / 2;
  const coneBottomWidth = pumpBodyWidth * 2;
  const coneBottomRadiusY = 4;
  const coneBottomRadiusX = coneBottomWidth / 2;
  const coneShape = new Shape()

  // start in upper right corner of shape, draw top ellipse right to left
  .ellipticalArc(0, 0, coneTopRadiusX, coneTopRadiusY, 0, 0, Math.PI, false).lineTo(-coneBottomRadiusX, height) // line to bottom left corner of shape

  // draw bottom ellipse left to right
  .ellipticalArc(0, height, coneBottomRadiusX, coneBottomRadiusY, 0, Math.PI, 0, true).lineTo(coneTopRadiusX, 0); // line to upper right corner of shape

  // use PaintColorProperty so that colors can be updated dynamically
  const fillBrighterColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: 0.1
  });
  const fillDarkerColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: -0.4
  });
  const fillDarkestColorProperty = new PaintColorProperty(fill, {
    luminanceFactor: -0.5
  });
  const coneGradient = new LinearGradient(-coneBottomWidth / 2, 0, coneBottomWidth / 2, 0).addColorStop(0, fillDarkerColorProperty).addColorStop(0.3, fill).addColorStop(0.35, fillBrighterColorProperty).addColorStop(0.45, fillBrighterColorProperty).addColorStop(0.5, fill).addColorStop(1, fillDarkestColorProperty);
  return new Path(coneShape, {
    fill: coneGradient
  });
}

/**
 * Create the handle of the pump. This is the node that the user will interact with in order to use the pump.
 */
function createPumpHandleNode(fill) {
  // empirically determined constants
  const centerSectionWidth = 35;
  const centerCurveWidth = 14;
  const centerCurveHeight = 8;
  const numberOfGripBumps = 4;
  const gripSingleBumpWidth = 16;
  const gripSingleBumpHalfWidth = gripSingleBumpWidth / 2;
  const gripInterBumpWidth = gripSingleBumpWidth * 0.31;
  const gripEndHeight = 23;

  // start the handle from the center bottom, drawing around counterclockwise
  const pumpHandleShape = new Shape().moveTo(0, 0);

  /**
   * Add a "bump" to the top or bottom of the grip
   * @param shape - the shape to append to
   * @param sign - +1 for bottom side of grip, -1 for top side of grip
   */
  const addGripBump = (shape, sign) => {
    // control points for quadratic curve shape on grip
    const controlPointX = gripSingleBumpWidth / 2;
    const controlPointY = gripSingleBumpWidth / 2;

    // this is a grip bump
    shape.quadraticCurveToRelative(sign * controlPointX, sign * controlPointY, sign * gripSingleBumpWidth, 0);
  };

  // this is the lower right part of the handle, including half of the middle section and the grip bumps
  pumpHandleShape.lineToRelative(centerSectionWidth / 2, 0);
  pumpHandleShape.quadraticCurveToRelative(centerCurveWidth / 2, 0, centerCurveWidth, -centerCurveHeight);
  pumpHandleShape.lineToRelative(gripInterBumpWidth, 0);
  for (let i = 0; i < numberOfGripBumps - 1; i++) {
    addGripBump(pumpHandleShape, 1);
    pumpHandleShape.lineToRelative(gripInterBumpWidth, 0);
  }
  addGripBump(pumpHandleShape, 1);

  // this is the right edge of the handle
  pumpHandleShape.lineToRelative(0, -gripEndHeight);

  // this is the upper right part of the handle, including only the grip bumps
  for (let i = 0; i < numberOfGripBumps; i++) {
    addGripBump(pumpHandleShape, -1);
    pumpHandleShape.lineToRelative(-gripInterBumpWidth, 0);
  }

  // this is the upper middle section of the handle
  pumpHandleShape.quadraticCurveToRelative(-centerCurveWidth / 2, -centerCurveHeight, -centerCurveWidth, -centerCurveHeight);
  pumpHandleShape.lineToRelative(-centerSectionWidth, 0);
  pumpHandleShape.quadraticCurveToRelative(-centerCurveWidth / 2, 0, -centerCurveWidth, centerCurveHeight);
  pumpHandleShape.lineToRelative(-gripInterBumpWidth, 0);

  // this is the upper left part of the handle, including only the grip bumps
  for (let i = 0; i < numberOfGripBumps - 1; i++) {
    addGripBump(pumpHandleShape, -1);
    pumpHandleShape.lineToRelative(-gripInterBumpWidth, 0);
  }
  addGripBump(pumpHandleShape, -1);

  // this is the left edge of the handle
  pumpHandleShape.lineToRelative(0, gripEndHeight);

  // this is the lower left part of the handle, including the grip bumps and half of the middle section
  for (let i = 0; i < numberOfGripBumps; i++) {
    addGripBump(pumpHandleShape, 1);
    pumpHandleShape.lineToRelative(gripInterBumpWidth, 0);
  }
  pumpHandleShape.quadraticCurveToRelative(centerCurveWidth / 2, centerCurveHeight, centerCurveWidth, centerCurveHeight);
  pumpHandleShape.lineToRelative(centerSectionWidth / 2, 0);
  pumpHandleShape.close();

  // used to track where the current position is on the handle when drawing its gradient
  let handleGradientPosition = 0;

  /**
   * Adds a color stop to the given gradient at
   * @param gradient - the gradient being appended to
   * @param deltaDistance - the distance of this added color stop
   * @param totalDistance - the total width of the gradient
   * @param color - the color of this color stop
   */
  const addRelativeColorStop = (gradient, deltaDistance, totalDistance, color) => {
    const newPosition = handleGradientPosition + deltaDistance;
    let ratio = newPosition / totalDistance;
    ratio = ratio > 1 ? 1 : ratio;
    gradient.addColorStop(ratio, color);
    handleGradientPosition = newPosition;
  };

  // set up the gradient for the handle
  const pumpHandleWidth = pumpHandleShape.bounds.width;
  const pumpHandleGradient = new LinearGradient(-pumpHandleWidth / 2, 0, pumpHandleWidth / 2, 0);

  // use PaintColorProperty so that colors can be updated dynamically
  const handleFillColorProperty = new PaintColorProperty(fill);
  const handleFillDarkerColorProperty = new PaintColorProperty(handleFillColorProperty, {
    luminanceFactor: -0.35
  });

  // fill the left side handle gradient
  for (let i = 0; i < numberOfGripBumps; i++) {
    addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
    addRelativeColorStop(pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillColorProperty);
    addRelativeColorStop(pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillDarkerColorProperty);
    addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
    addRelativeColorStop(pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleFillDarkerColorProperty);
  }

  // fill the center section handle gradient
  addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
  addRelativeColorStop(pumpHandleGradient, centerCurveWidth + centerSectionWidth, pumpHandleWidth, handleFillColorProperty);
  addRelativeColorStop(pumpHandleGradient, centerCurveWidth, pumpHandleWidth, handleFillDarkerColorProperty);

  // fill the right side handle gradient
  for (let i = 0; i < numberOfGripBumps; i++) {
    addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
    addRelativeColorStop(pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleFillDarkerColorProperty);
    addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
    addRelativeColorStop(pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillColorProperty);
    addRelativeColorStop(pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillDarkerColorProperty);
  }
  return new Path(pumpHandleShape, {
    lineWidth: 2,
    stroke: 'black',
    fill: pumpHandleGradient
  });
}
/**
 * Drag listener for the pump's handle.
 */
class HandleDragListener extends DragListener {
  constructor(numberProperty, rangeProperty, nodeEnabledProperty, injectionEnabledProperty, minHandleYOffset, maxHandleYOffset, pumpHandleNode, pumpShaftNode, providedOptions) {
    assert && assert(maxHandleYOffset > minHandleYOffset, 'bogus offsets');
    const options = optionize()({
      // HandleDragListenerSelfOptions
      numberOfParticlesPerPumpAction: 10,
      addParticlesOneAtATime: true
    }, providedOptions);
    let pumpingDistanceAccumulation = 0;

    // How far the pump shaft needs to travel before the pump releases a particle.
    // The subtracted constant was empirically determined to ensure that numberOfParticlesPerPumpAction is correct.
    const pumpingDistanceRequiredToAddParticle = (maxHandleYOffset - minHandleYOffset) / options.numberOfParticlesPerPumpAction - 0.01;
    options.drag = event => {
      // update the handle and shaft position based on the user's pointer position
      const dragPositionY = pumpHandleNode.globalToParentPoint(event.pointer.point).y;
      const handlePosition = Utils.clamp(dragPositionY, minHandleYOffset, maxHandleYOffset);
      pumpHandleNode.centerY = handlePosition;
      pumpShaftNode.top = pumpHandleNode.bottom;
      let numberOfBatchParticles = 0; // number of particles to add all at once

      if (this.lastHandlePosition !== null) {
        const travelDistance = handlePosition - this.lastHandlePosition;
        if (travelDistance > 0) {
          // This motion is in the downward direction, so add its distance to the pumping distance.
          pumpingDistanceAccumulation += travelDistance;
          while (pumpingDistanceAccumulation >= pumpingDistanceRequiredToAddParticle) {
            // add a particle
            if (nodeEnabledProperty.value && injectionEnabledProperty.value && numberProperty.value + numberOfBatchParticles < rangeProperty.value.max) {
              if (options.addParticlesOneAtATime) {
                numberProperty.value++;
              } else {
                numberOfBatchParticles++;
              }
            }
            pumpingDistanceAccumulation -= pumpingDistanceRequiredToAddParticle;
          }
        } else {
          pumpingDistanceAccumulation = 0;
        }
      }

      // Add particles in one batch.
      if (!options.addParticlesOneAtATime) {
        numberProperty.value += numberOfBatchParticles;
      } else {
        assert && assert(numberOfBatchParticles === 0, 'unexpected batched particles');
      }
      this.lastHandlePosition = handlePosition;
    };
    super(options);
    this.lastHandlePosition = null;
  }
  reset() {
    this.lastHandlePosition = null;
  }
}
sceneryPhet.register('BicyclePumpNode', BicyclePumpNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkNpcmNsZSIsIkRyYWdMaXN0ZW5lciIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlBhaW50Q29sb3JQcm9wZXJ0eSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJTY2VuZXJ5Q29uc3RhbnRzIiwiVGFuZGVtIiwic2NlbmVyeVBoZXQiLCJTZWdtZW50ZWRCYXJHcmFwaE5vZGUiLCJQVU1QX0JBU0VfV0lEVEhfUFJPUE9SVElPTiIsIlBVTVBfQkFTRV9IRUlHSFRfUFJPUE9SVElPTiIsIlBVTVBfQk9EWV9IRUlHSFRfUFJPUE9SVElPTiIsIlBVTVBfQk9EWV9XSURUSF9QUk9QT1JUSU9OIiwiUFVNUF9TSEFGVF9XSURUSF9QUk9QT1JUSU9OIiwiUFVNUF9TSEFGVF9IRUlHSFRfUFJPUE9SVElPTiIsIlBVTVBfSEFORExFX0hFSUdIVF9QUk9QT1JUSU9OIiwiQ09ORV9IRUlHSFRfUFJPUE9SVElPTiIsIkhPU0VfQ09OTkVDVE9SX0hFSUdIVF9QUk9QT1JUSU9OIiwiSE9TRV9DT05ORUNUT1JfV0lEVEhfUFJPUE9SVElPTiIsIlNIQUZUX09QRU5JTkdfVElMVF9GQUNUT1IiLCJCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1giLCJCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1kiLCJCaWN5Y2xlUHVtcE5vZGUiLCJjb25zdHJ1Y3RvciIsIm51bWJlclByb3BlcnR5IiwicmFuZ2VQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ3aWR0aCIsImhlaWdodCIsImhhbmRsZUZpbGwiLCJzaGFmdEZpbGwiLCJib2R5RmlsbCIsImJvZHlUb3BGaWxsIiwiaW5kaWNhdG9yQmFja2dyb3VuZEZpbGwiLCJpbmRpY2F0b3JSZW1haW5pbmdGaWxsIiwiaG9zZUZpbGwiLCJiYXNlRmlsbCIsImhvc2VDdXJ2aW5lc3MiLCJob3NlQXR0YWNobWVudE9mZnNldCIsIm5vZGVFbmFibGVkUHJvcGVydHkiLCJpbmplY3Rpb25FbmFibGVkUHJvcGVydHkiLCJoYW5kbGVUb3VjaEFyZWFYRGlsYXRpb24iLCJoYW5kbGVUb3VjaEFyZWFZRGlsYXRpb24iLCJoYW5kbGVNb3VzZUFyZWFYRGlsYXRpb24iLCJoYW5kbGVNb3VzZUFyZWFZRGlsYXRpb24iLCJkcmFnTGlzdGVuZXJPcHRpb25zIiwiaGFuZGxlQ3Vyc29yIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4Iiwib3duc0VuYWJsZWRQcm9wZXJ0eSIsImJhc2VXaWR0aCIsImJhc2VIZWlnaHQiLCJiYXNlRmlsbENvbG9yUHJvcGVydHkiLCJwdW1wQmFzZU5vZGUiLCJjcmVhdGVQdW1wQmFzZU5vZGUiLCJwdW1wQm9keVdpZHRoIiwicHVtcEJvZHlIZWlnaHQiLCJjb25lSGVpZ2h0IiwiY29uZU5vZGUiLCJjcmVhdGVDb25lTm9kZSIsImJvdHRvbSIsInRvcCIsImJvZHlGaWxsQ29sb3JQcm9wZXJ0eSIsImJvZHlGaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5IiwibHVtaW5hbmNlRmFjdG9yIiwiYm9keUZpbGxEYXJrZXJDb2xvclByb3BlcnR5IiwicHVtcEJvZHlOb2RlIiwiZmlsbCIsImFkZENvbG9yU3RvcCIsImNlbnRlclgiLCJib2R5VG9wRmlsbENvbG9yUHJvcGVydHkiLCJib2R5VG9wU3Ryb2tlQ29sb3JQcm9wZXJ0eSIsImJvZHlUb3BCYWNrTm9kZSIsImNyZWF0ZUJvZHlUb3BIYWxmTm9kZSIsImJvZHlUb3BGcm9udE5vZGUiLCJib2R5Qm90dG9tQ2FwTm9kZSIsImVsbGlwc2UiLCJyZW1haW5pbmdDYXBhY2l0eUluZGljYXRvciIsImNlbnRlclkiLCJudW1TZWdtZW50cyIsImJhY2tncm91bmRDb2xvciIsImZ1bGx5TGl0SW5kaWNhdG9yQ29sb3IiLCJpbmRpY2F0b3JIZWlnaHRQcm9wb3J0aW9uIiwiaG9zZUF0dGFjaGVkT25SaWdodCIsIngiLCJob3NlQ29ubmVjdG9yV2lkdGgiLCJob3NlQ29ubmVjdG9ySGVpZ2h0IiwiaG9zZU5vZGUiLCJtb3ZlVG8iLCJjdWJpY0N1cnZlVG8iLCJ5IiwibGluZVdpZHRoIiwic3Ryb2tlIiwiZXh0ZXJuYWxIb3NlQ29ubmVjdG9yIiwiY3JlYXRlSG9zZUNvbm5lY3Rvck5vZGUiLCJzZXRUcmFuc2xhdGlvbiIsImxvY2FsSG9zZUNvbm5lY3RvciIsImxvY2FsSG9zZU9mZnNldFgiLCJwdW1wU2hhZnRXaWR0aCIsInB1bXBTaGFmdEhlaWdodCIsInNoYWZ0RmlsbENvbG9yUHJvcGVydHkiLCJzaGFmdFN0cm9rZUNvbG9yUHJvcGVydHkiLCJwdW1wU2hhZnROb2RlIiwicGlja2FibGUiLCJwdW1wSGFuZGxlTm9kZSIsImNyZWF0ZVB1bXBIYW5kbGVOb2RlIiwicHVtcEhhbmRsZUhlaWdodCIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwibW91c2VBcmVhIiwic2NhbGUiLCJzZXRQdW1wSGFuZGxlVG9Jbml0aWFsUG9zaXRpb24iLCJlbmFibGVkTGlzdGVuZXIiLCJlbmFibGVkIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwiY3Vyc29yIiwib3BhY2l0eSIsIkRJU0FCTEVEX09QQUNJVFkiLCJsaW5rIiwibWF4SGFuZGxlWU9mZnNldCIsIm1pbkhhbmRsZVlPZmZzZXQiLCJoYW5kbGVEcmFnTGlzdGVuZXIiLCJIYW5kbGVEcmFnTGlzdGVuZXIiLCJjcmVhdGVUYW5kZW0iLCJhZGRJbnB1dExpc3RlbmVyIiwiYWRkQ2hpbGQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImRldiIsImFzc2VydCIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsImRpc3Bvc2VCaWN5Y2xlUHVtcE5vZGUiLCJkaXNwb3NlIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJyZXNldCIsInRvcE9mQmFzZUhlaWdodCIsImhhbGZPZkJhc2VXaWR0aCIsImJhc2VGaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5IiwiYmFzZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5IiwiYmFzZUZpbGxEYXJrZXN0Q29sb3JQcm9wZXJ0eSIsInRvcE9mQmFzZU5vZGUiLCJwdW1wQmFzZUVkZ2VIZWlnaHQiLCJwdW1wQmFzZVNpZGVFZGdlWUNvbnRyb2xQb2ludCIsInB1bXBCYXNlQm90dG9tRWRnZVhDdXJ2ZVN0YXJ0IiwicHVtcEVkZ2VTaGFwZSIsImxpbmVUbyIsInF1YWRyYXRpY0N1cnZlVG8iLCJjbG9zZSIsInB1bXBFZGdlTm9kZSIsImNoaWxkcmVuIiwic2lnbiIsImJvZHlUb3BTaGFwZSIsImZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkiLCJmaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSIsImZpbGxEYXJrZXN0Q29sb3JQcm9wZXJ0eSIsImNvbmVUb3BXaWR0aCIsImNvbmVUb3BSYWRpdXNZIiwiY29uZVRvcFJhZGl1c1giLCJjb25lQm90dG9tV2lkdGgiLCJjb25lQm90dG9tUmFkaXVzWSIsImNvbmVCb3R0b21SYWRpdXNYIiwiY29uZVNoYXBlIiwiZWxsaXB0aWNhbEFyYyIsIk1hdGgiLCJQSSIsImNvbmVHcmFkaWVudCIsImNlbnRlclNlY3Rpb25XaWR0aCIsImNlbnRlckN1cnZlV2lkdGgiLCJjZW50ZXJDdXJ2ZUhlaWdodCIsIm51bWJlck9mR3JpcEJ1bXBzIiwiZ3JpcFNpbmdsZUJ1bXBXaWR0aCIsImdyaXBTaW5nbGVCdW1wSGFsZldpZHRoIiwiZ3JpcEludGVyQnVtcFdpZHRoIiwiZ3JpcEVuZEhlaWdodCIsInB1bXBIYW5kbGVTaGFwZSIsImFkZEdyaXBCdW1wIiwic2hhcGUiLCJjb250cm9sUG9pbnRYIiwiY29udHJvbFBvaW50WSIsInF1YWRyYXRpY0N1cnZlVG9SZWxhdGl2ZSIsImxpbmVUb1JlbGF0aXZlIiwiaSIsImhhbmRsZUdyYWRpZW50UG9zaXRpb24iLCJhZGRSZWxhdGl2ZUNvbG9yU3RvcCIsImdyYWRpZW50IiwiZGVsdGFEaXN0YW5jZSIsInRvdGFsRGlzdGFuY2UiLCJjb2xvciIsIm5ld1Bvc2l0aW9uIiwicmF0aW8iLCJwdW1wSGFuZGxlV2lkdGgiLCJib3VuZHMiLCJwdW1wSGFuZGxlR3JhZGllbnQiLCJoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSIsImhhbmRsZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5IiwibnVtYmVyT2ZQYXJ0aWNsZXNQZXJQdW1wQWN0aW9uIiwiYWRkUGFydGljbGVzT25lQXRBVGltZSIsInB1bXBpbmdEaXN0YW5jZUFjY3VtdWxhdGlvbiIsInB1bXBpbmdEaXN0YW5jZVJlcXVpcmVkVG9BZGRQYXJ0aWNsZSIsImRyYWciLCJldmVudCIsImRyYWdQb3NpdGlvblkiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwiaGFuZGxlUG9zaXRpb24iLCJjbGFtcCIsIm51bWJlck9mQmF0Y2hQYXJ0aWNsZXMiLCJsYXN0SGFuZGxlUG9zaXRpb24iLCJ0cmF2ZWxEaXN0YW5jZSIsInZhbHVlIiwibWF4IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCaWN5Y2xlUHVtcE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBpcyBhIGdyYXBoaWNhbCByZXByZXNlbnRhdGlvbiBvZiBhIGJpY3ljbGUgcHVtcC4gQSB1c2VyIGNhbiBtb3ZlIHRoZSBoYW5kbGUgdXAgYW5kIGRvd24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBTaWRkaGFydGhhIENoaW50aGFwYWxseSAoQWN0dWFsIENvbmNlcHRzKVxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2F1cmFiaCBUb3RleVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgRHJhZ0xpc3RlbmVyLCBEcmFnTGlzdGVuZXJPcHRpb25zLCBUQ29sb3IsIExpbmVhckdyYWRpZW50LCBOb2RlLCBOb2RlT3B0aW9ucywgUGFpbnRDb2xvclByb3BlcnR5LCBQYXRoLCBQcmVzc2VkRHJhZ0xpc3RlbmVyLCBQcmVzc0xpc3RlbmVyRXZlbnQsIFJlY3RhbmdsZSwgU2NlbmVyeUNvbnN0YW50cyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IFNlZ21lbnRlZEJhckdyYXBoTm9kZSBmcm9tICcuL1NlZ21lbnRlZEJhckdyYXBoTm9kZS5qcyc7XHJcblxyXG4vLyBUaGUgZm9sbG93IGNvbnN0YW50cyBkZWZpbmUgdGhlIHNpemUgYW5kIHBvc2l0aW9ucyBvZiB0aGUgdmFyaW91cyBjb21wb25lbnRzIG9mIHRoZSBwdW1wIGFzIHByb3BvcnRpb25zIG9mIHRoZVxyXG4vLyBvdmVyYWxsIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIG5vZGUuXHJcbmNvbnN0IFBVTVBfQkFTRV9XSURUSF9QUk9QT1JUSU9OID0gMC4zNTtcclxuY29uc3QgUFVNUF9CQVNFX0hFSUdIVF9QUk9QT1JUSU9OID0gMC4wNzU7XHJcbmNvbnN0IFBVTVBfQk9EWV9IRUlHSFRfUFJPUE9SVElPTiA9IDAuNztcclxuY29uc3QgUFVNUF9CT0RZX1dJRFRIX1BST1BPUlRJT04gPSAwLjA3O1xyXG5jb25zdCBQVU1QX1NIQUZUX1dJRFRIX1BST1BPUlRJT04gPSBQVU1QX0JPRFlfV0lEVEhfUFJPUE9SVElPTiAqIDAuMjU7XHJcbmNvbnN0IFBVTVBfU0hBRlRfSEVJR0hUX1BST1BPUlRJT04gPSBQVU1QX0JPRFlfSEVJR0hUX1BST1BPUlRJT047XHJcbmNvbnN0IFBVTVBfSEFORExFX0hFSUdIVF9QUk9QT1JUSU9OID0gMC4wNTtcclxuY29uc3QgQ09ORV9IRUlHSFRfUFJPUE9SVElPTiA9IDAuMDk7XHJcbmNvbnN0IEhPU0VfQ09OTkVDVE9SX0hFSUdIVF9QUk9QT1JUSU9OID0gMC4wNDtcclxuY29uc3QgSE9TRV9DT05ORUNUT1JfV0lEVEhfUFJPUE9SVElPTiA9IDAuMDU7XHJcbmNvbnN0IFNIQUZUX09QRU5JTkdfVElMVF9GQUNUT1IgPSAwLjMzO1xyXG5jb25zdCBCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1ggPSAxMztcclxuY29uc3QgQk9EWV9UT19IT1NFX0FUVEFDSF9QT0lOVF9ZID0gLTI2O1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgd2lkdGg/OiBudW1iZXI7XHJcbiAgaGVpZ2h0PzogbnVtYmVyO1xyXG5cclxuICAvLyB2YXJpb3VzIGNvbG9ycyB1c2VkIGJ5IHRoZSBwdW1wXHJcbiAgaGFuZGxlRmlsbD86IFRDb2xvcjtcclxuICBzaGFmdEZpbGw/OiBUQ29sb3I7XHJcbiAgYm9keUZpbGw/OiBUQ29sb3I7XHJcbiAgYm9keVRvcEZpbGw/OiBUQ29sb3I7XHJcbiAgaW5kaWNhdG9yQmFja2dyb3VuZEZpbGw/OiBUQ29sb3I7XHJcbiAgaW5kaWNhdG9yUmVtYWluaW5nRmlsbD86IFRDb2xvcjtcclxuICBob3NlRmlsbD86IFRDb2xvcjtcclxuICBiYXNlRmlsbD86IFRDb2xvcjsgLy8gdGhpcyBjb2xvciBpcyBhbHNvIHVzZWQgZm9yIHRoZSBjb25lIHNoYXBlIGFuZCBob3NlIGNvbm5lY3RvcnNcclxuXHJcbiAgLy8gZ3JlYXRlciB2YWx1ZSA9IGN1cnZ5IGhvc2UsIHNtYWxsZXIgdmFsdWUgPSBzdHJhaWdodGVyIGhvc2VcclxuICBob3NlQ3VydmluZXNzPzogbnVtYmVyO1xyXG5cclxuICAvLyB3aGVyZSB0aGUgaG9zZSB3aWxsIGF0dGFjaCBleHRlcm5hbGx5IHJlbGF0aXZlIHRvIHRoZSBvcmlnaW4gb2YgdGhlIHB1bXBcclxuICBob3NlQXR0YWNobWVudE9mZnNldD86IFZlY3RvcjI7XHJcblxyXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0aGUgcHVtcCB3aWxsIGludGVyYWN0aXZlLiBJZiB0aGUgcHVtcCdzIHJhbmdlIGNoYW5nZXMsIHRoZSBwdW1wc1xyXG4gIC8vIGluZGljYXRvciB3aWxsIHVwZGF0ZSByZWdhcmRsZXNzIG9mIGVuYWJsZWRQcm9wZXJ0eS4gSWYgbnVsbCwgdGhpcyBQcm9wZXJ0eSB3aWxsIGJlIGNyZWF0ZWQuXHJcbiAgbm9kZUVuYWJsZWRQcm9wZXJ0eT86IFRQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XHJcblxyXG4gIC8vIHtCb29sZWFuUHJvcGVydHl9IC0gZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwdW1wIGlzIGFibGUgdG8gaW5qZWN0IHBhcnRpY2xlcyB3aGVuIHRoZSBwdW1wIGlzIHN0aWxsIGludGVyYWN0aXZlLlxyXG4gIC8vIFRoaXMgaXMgbmVlZGVkIGZvciB3aGVuIGEgdXNlciBpcyBwdW1waW5nIGluIHBhcnRpY2xlcyB0b28gcXVpY2tseSBmb3IgYSBtb2RlbCB0byBoYW5kbGUgKHNvIHRoZSBpbmplY3Rpb25cclxuICAvLyBuZWVkcyB0aHJvdHRsaW5nKSwgYnV0IHRoZSBwdW1wIHNob3VsZCBub3QgYmVjb21lIG5vbi1pbnRlcmFjdGl2ZSBhcyBhIHJlc3VsdCxcclxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N0YXRlcy1vZi1tYXR0ZXIvaXNzdWVzLzI3NlxyXG4gIGluamVjdGlvbkVuYWJsZWRQcm9wZXJ0eT86IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gcG9pbnRlciBhcmVhc1xyXG4gIGhhbmRsZVRvdWNoQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcclxuICBoYW5kbGVUb3VjaEFyZWFZRGlsYXRpb24/OiBudW1iZXI7XHJcbiAgaGFuZGxlTW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIGhhbmRsZU1vdXNlQXJlYVlEaWxhdGlvbj86IG51bWJlcjtcclxuXHJcbiAgZHJhZ0xpc3RlbmVyT3B0aW9ucz86IEhhbmRsZURyYWdMaXN0ZW5lck9wdGlvbnM7XHJcblxyXG4gIC8vIGN1cnNvciBmb3IgdGhlIHB1bXAgaGFuZGxlIHdoZW4gaXQncyBlbmFibGVkXHJcbiAgaGFuZGxlQ3Vyc29yPzogJ25zLXJlc2l6ZSc7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBCaWN5Y2xlUHVtcE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJpY3ljbGVQdW1wTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgbm9kZUVuYWJsZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBob3NlQXR0YWNobWVudE9mZnNldDogVmVjdG9yMjtcclxuXHJcbiAgLy8gcGFydHMgb2YgdGhlIHB1bXAgbmVlZGVkIGJ5IHNldFB1bXBIYW5kbGVUb0luaXRpYWxQb3NpdGlvblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcHVtcEJvZHlOb2RlOiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcHVtcFNoYWZ0Tm9kZTogTm9kZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHB1bXBIYW5kbGVOb2RlOiBOb2RlO1xyXG5cclxuICAvLyBEcmFnTGlzdGVuZXIgZm9yIHRoZSBwdW1wIGhhbmRsZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgaGFuZGxlRHJhZ0xpc3RlbmVyOiBIYW5kbGVEcmFnTGlzdGVuZXI7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUJpY3ljbGVQdW1wTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIG51bWJlclByb3BlcnR5IC0gbnVtYmVyIG9mIHBhcnRpY2xlcyBpbiB0aGUgc2ltdWxhdGlvblxyXG4gICAqIEBwYXJhbSByYW5nZVByb3BlcnR5IC0gYWxsb3dlZCByYW5nZVxyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG51bWJlclByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHJhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IEJpY3ljbGVQdW1wTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxCaWN5Y2xlUHVtcE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIHdpZHRoOiAyMDAsXHJcbiAgICAgIGhlaWdodDogMjUwLFxyXG4gICAgICBoYW5kbGVGaWxsOiAnI2FkYWZiMScsXHJcbiAgICAgIHNoYWZ0RmlsbDogJyNjYWNhY2EnLFxyXG4gICAgICBib2R5RmlsbDogJyNkNTAwMDAnLFxyXG4gICAgICBib2R5VG9wRmlsbDogJyM5OTc2NzcnLFxyXG4gICAgICBpbmRpY2F0b3JCYWNrZ3JvdW5kRmlsbDogJyM0NDMzMzMnLFxyXG4gICAgICBpbmRpY2F0b3JSZW1haW5pbmdGaWxsOiAnIzk5OTk5OScsXHJcbiAgICAgIGhvc2VGaWxsOiAnI2IzYjNiMycsXHJcbiAgICAgIGJhc2VGaWxsOiAnI2FhYWFhYScsXHJcbiAgICAgIGhvc2VDdXJ2aW5lc3M6IDEsXHJcbiAgICAgIGhvc2VBdHRhY2htZW50T2Zmc2V0OiBuZXcgVmVjdG9yMiggMTAwLCAxMDAgKSxcclxuICAgICAgbm9kZUVuYWJsZWRQcm9wZXJ0eTogbnVsbCxcclxuICAgICAgaW5qZWN0aW9uRW5hYmxlZFByb3BlcnR5OiBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksXHJcbiAgICAgIGhhbmRsZVRvdWNoQXJlYVhEaWxhdGlvbjogMTUsXHJcbiAgICAgIGhhbmRsZVRvdWNoQXJlYVlEaWxhdGlvbjogMTUsXHJcbiAgICAgIGhhbmRsZU1vdXNlQXJlYVhEaWxhdGlvbjogMCxcclxuICAgICAgaGFuZGxlTW91c2VBcmVhWURpbGF0aW9uOiAwLFxyXG4gICAgICBkcmFnTGlzdGVuZXJPcHRpb25zOiB7fSxcclxuICAgICAgaGFuZGxlQ3Vyc29yOiAnbnMtcmVzaXplJyxcclxuXHJcbiAgICAgIC8vIE5vZGVPcHRpb25zXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnUHVtcE5vZGUnXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB3aWR0aCA9IG9wdGlvbnMud2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGRvZXMgdGhpcyBpbnN0YW5jZSBvd24gbm9kZUVuYWJsZWRQcm9wZXJ0eT9cclxuICAgIGNvbnN0IG93bnNFbmFibGVkUHJvcGVydHkgPSAhb3B0aW9ucy5ub2RlRW5hYmxlZFByb3BlcnR5O1xyXG5cclxuICAgIHRoaXMubm9kZUVuYWJsZWRQcm9wZXJ0eSA9IG9wdGlvbnMubm9kZUVuYWJsZWRQcm9wZXJ0eSB8fCBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcblxyXG4gICAgdGhpcy5ob3NlQXR0YWNobWVudE9mZnNldCA9IG9wdGlvbnMuaG9zZUF0dGFjaG1lbnRPZmZzZXQ7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBiYXNlIG9mIHRoZSBwdW1wXHJcbiAgICBjb25zdCBiYXNlV2lkdGggPSB3aWR0aCAqIFBVTVBfQkFTRV9XSURUSF9QUk9QT1JUSU9OO1xyXG4gICAgY29uc3QgYmFzZUhlaWdodCA9IGhlaWdodCAqIFBVTVBfQkFTRV9IRUlHSFRfUFJPUE9SVElPTjtcclxuICAgIGNvbnN0IGJhc2VGaWxsQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIG9wdGlvbnMuYmFzZUZpbGwgKTtcclxuICAgIGNvbnN0IHB1bXBCYXNlTm9kZSA9IGNyZWF0ZVB1bXBCYXNlTm9kZSggYmFzZVdpZHRoLCBiYXNlSGVpZ2h0LCBiYXNlRmlsbENvbG9yUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBzaXppbmcgZm9yIHRoZSBib2R5IG9mIHRoZSBwdW1wXHJcbiAgICBjb25zdCBwdW1wQm9keVdpZHRoID0gd2lkdGggKiBQVU1QX0JPRFlfV0lEVEhfUFJPUE9SVElPTjtcclxuICAgIGNvbnN0IHB1bXBCb2R5SGVpZ2h0ID0gaGVpZ2h0ICogUFVNUF9CT0RZX0hFSUdIVF9QUk9QT1JUSU9OO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgY29uZVxyXG4gICAgY29uc3QgY29uZUhlaWdodCA9IGhlaWdodCAqIENPTkVfSEVJR0hUX1BST1BPUlRJT047XHJcbiAgICBjb25zdCBjb25lTm9kZSA9IGNyZWF0ZUNvbmVOb2RlKCBwdW1wQm9keVdpZHRoLCBjb25lSGVpZ2h0LCBiYXNlRmlsbENvbG9yUHJvcGVydHkgKTtcclxuICAgIGNvbmVOb2RlLmJvdHRvbSA9IHB1bXBCYXNlTm9kZS50b3AgKyA4O1xyXG5cclxuICAgIC8vIHVzZSBQYWludENvbG9yUHJvcGVydHkgc28gdGhhdCBjb2xvcnMgY2FuIGJlIHVwZGF0ZWQgZHluYW1pY2FsbHlcclxuICAgIGNvbnN0IGJvZHlGaWxsQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIG9wdGlvbnMuYm9keUZpbGwgKTtcclxuICAgIGNvbnN0IGJvZHlGaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggYm9keUZpbGxDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogMC4yIH0gKTtcclxuICAgIGNvbnN0IGJvZHlGaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGJvZHlGaWxsQ29sb3JQcm9wZXJ0eSwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjIgfSApO1xyXG5cclxuICAgIHRoaXMucHVtcEJvZHlOb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgcHVtcEJvZHlXaWR0aCwgcHVtcEJvZHlIZWlnaHQsIDAsIDAsIHtcclxuICAgICAgZmlsbDogbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCBwdW1wQm9keVdpZHRoLCAwIClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBib2R5RmlsbEJyaWdodGVyQ29sb3JQcm9wZXJ0eSApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC40LCBib2R5RmlsbENvbG9yUHJvcGVydHkgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAuNywgYm9keUZpbGxEYXJrZXJDb2xvclByb3BlcnR5IClcclxuICAgIH0gKTtcclxuICAgIHRoaXMucHVtcEJvZHlOb2RlLmNlbnRlclggPSBjb25lTm9kZS5jZW50ZXJYO1xyXG4gICAgdGhpcy5wdW1wQm9keU5vZGUuYm90dG9tID0gY29uZU5vZGUudG9wICsgMTg7XHJcblxyXG4gICAgLy8gdXNlIFBhaW50Q29sb3JQcm9wZXJ0eSBzbyB0aGF0IGNvbG9ycyBjYW4gYmUgdXBkYXRlZCBkeW5hbWljYWxseVxyXG4gICAgY29uc3QgYm9keVRvcEZpbGxDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggb3B0aW9ucy5ib2R5VG9wRmlsbCApO1xyXG4gICAgY29uc3QgYm9keVRvcFN0cm9rZUNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBib2R5VG9wRmlsbENvbG9yUHJvcGVydHksIHsgbHVtaW5hbmNlRmFjdG9yOiAtMC4zIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGJhY2sgcGFydCBvZiB0aGUgdG9wIG9mIHRoZSBib2R5XHJcbiAgICBjb25zdCBib2R5VG9wQmFja05vZGUgPSBjcmVhdGVCb2R5VG9wSGFsZk5vZGUoIHB1bXBCb2R5V2lkdGgsIC0xLCBib2R5VG9wRmlsbENvbG9yUHJvcGVydHksIGJvZHlUb3BTdHJva2VDb2xvclByb3BlcnR5ICk7XHJcbiAgICBib2R5VG9wQmFja05vZGUuY2VudGVyWCA9IHRoaXMucHVtcEJvZHlOb2RlLmNlbnRlclg7XHJcbiAgICBib2R5VG9wQmFja05vZGUuYm90dG9tID0gdGhpcy5wdW1wQm9keU5vZGUudG9wO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgZnJvbnQgcGFydCBvZiB0aGUgdG9wIG9mIHRoZSBib2R5XHJcbiAgICBjb25zdCBib2R5VG9wRnJvbnROb2RlID0gY3JlYXRlQm9keVRvcEhhbGZOb2RlKCBwdW1wQm9keVdpZHRoLCAxLCBib2R5VG9wRmlsbENvbG9yUHJvcGVydHksIGJvZHlUb3BTdHJva2VDb2xvclByb3BlcnR5ICk7XHJcbiAgICBib2R5VG9wRnJvbnROb2RlLmNlbnRlclggPSB0aGlzLnB1bXBCb2R5Tm9kZS5jZW50ZXJYO1xyXG4gICAgYm9keVRvcEZyb250Tm9kZS50b3AgPSBib2R5VG9wQmFja05vZGUuYm90dG9tIC0gMC40OyAvLyB0d2VhayBzbGlnaHRseSB0byBwcmV2ZW50IHB1bXAgYm9keSBmcm9tIHNob3dpbmcgdGhyb3VnaFxyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgYm90dG9tIGNhcCBvbiB0aGUgYm9keVxyXG4gICAgY29uc3QgYm9keUJvdHRvbUNhcE5vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKCkuZWxsaXBzZSggMCwgMCwgYm9keVRvcEZyb250Tm9kZS53aWR0aCAqIDAuNTUsIDMsIDAgKSwge1xyXG4gICAgICBmaWxsOiBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBiYXNlRmlsbENvbG9yUHJvcGVydHksIHsgbHVtaW5hbmNlRmFjdG9yOiAtMC4zIH0gKSxcclxuICAgICAgY2VudGVyWDogYm9keVRvcEZyb250Tm9kZS5jZW50ZXJYLFxyXG4gICAgICBib3R0b206IGNvbmVOb2RlLnRvcCArIDRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIG5vZGUgdGhhdCB3aWxsIGJlIHVzZWQgdG8gaW5kaWNhdGUgdGhlIHJlbWFpbmluZyBjYXBhY2l0eVxyXG4gICAgY29uc3QgcmVtYWluaW5nQ2FwYWNpdHlJbmRpY2F0b3IgPSBuZXcgU2VnbWVudGVkQmFyR3JhcGhOb2RlKCBudW1iZXJQcm9wZXJ0eSwgcmFuZ2VQcm9wZXJ0eSwge1xyXG4gICAgICAgIHdpZHRoOiBwdW1wQm9keVdpZHRoICogMC42LFxyXG4gICAgICAgIGhlaWdodDogcHVtcEJvZHlIZWlnaHQgKiAwLjcsXHJcbiAgICAgICAgY2VudGVyWDogdGhpcy5wdW1wQm9keU5vZGUuY2VudGVyWCxcclxuICAgICAgICBjZW50ZXJZOiAoIHRoaXMucHVtcEJvZHlOb2RlLnRvcCArIGNvbmVOb2RlLnRvcCApIC8gMixcclxuICAgICAgICBudW1TZWdtZW50czogMzYsXHJcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBvcHRpb25zLmluZGljYXRvckJhY2tncm91bmRGaWxsLFxyXG4gICAgICAgIGZ1bGx5TGl0SW5kaWNhdG9yQ29sb3I6IG9wdGlvbnMuaW5kaWNhdG9yUmVtYWluaW5nRmlsbCxcclxuICAgICAgICBpbmRpY2F0b3JIZWlnaHRQcm9wb3J0aW9uOiAwLjdcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyB3aGV0aGVyIHRoZSBob3NlIHNob3VsZCBiZSBhdHRhY2hlZCB0byB0aGUgbGVmdCBvciByaWdodCBzaWRlIG9mIHRoZSBwdW1wIGNvbmVcclxuICAgIGNvbnN0IGhvc2VBdHRhY2hlZE9uUmlnaHQgPSBvcHRpb25zLmhvc2VBdHRhY2htZW50T2Zmc2V0LnggPiAwO1xyXG4gICAgY29uc3QgaG9zZUNvbm5lY3RvcldpZHRoID0gd2lkdGggKiBIT1NFX0NPTk5FQ1RPUl9XSURUSF9QUk9QT1JUSU9OO1xyXG4gICAgY29uc3QgaG9zZUNvbm5lY3RvckhlaWdodCA9IGhlaWdodCAqIEhPU0VfQ09OTkVDVE9SX0hFSUdIVF9QUk9QT1JUSU9OO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgaG9zZVxyXG4gICAgY29uc3QgaG9zZU5vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggaG9zZUF0dGFjaGVkT25SaWdodCA/IEJPRFlfVE9fSE9TRV9BVFRBQ0hfUE9JTlRfWCA6IC1CT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1gsXHJcbiAgICAgICAgQk9EWV9UT19IT1NFX0FUVEFDSF9QT0lOVF9ZIClcclxuICAgICAgLmN1YmljQ3VydmVUbyggb3B0aW9ucy5ob3NlQ3VydmluZXNzICogKCBvcHRpb25zLmhvc2VBdHRhY2htZW50T2Zmc2V0LnggLSBCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1ggKSxcclxuICAgICAgICBCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1ksXHJcbiAgICAgICAgMCwgb3B0aW9ucy5ob3NlQXR0YWNobWVudE9mZnNldC55LFxyXG4gICAgICAgIG9wdGlvbnMuaG9zZUF0dGFjaG1lbnRPZmZzZXQueCAtICggaG9zZUF0dGFjaGVkT25SaWdodCA/IGhvc2VDb25uZWN0b3JXaWR0aCA6IC1ob3NlQ29ubmVjdG9yV2lkdGggKSxcclxuICAgICAgICBvcHRpb25zLmhvc2VBdHRhY2htZW50T2Zmc2V0LnkgKSwge1xyXG4gICAgICBsaW5lV2lkdGg6IDQsXHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5ob3NlRmlsbFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgZXh0ZXJuYWwgaG9zZSBjb25uZWN0b3IsIHdoaWNoIGNvbm5lY3RzIHRoZSBob3NlIHRvIGFuIGV4dGVybmFsIHBvaW50XHJcbiAgICBjb25zdCBleHRlcm5hbEhvc2VDb25uZWN0b3IgPSBjcmVhdGVIb3NlQ29ubmVjdG9yTm9kZSggaG9zZUNvbm5lY3RvcldpZHRoLCBob3NlQ29ubmVjdG9ySGVpZ2h0LCBiYXNlRmlsbENvbG9yUHJvcGVydHkgKTtcclxuICAgIGV4dGVybmFsSG9zZUNvbm5lY3Rvci5zZXRUcmFuc2xhdGlvbihcclxuICAgICAgaG9zZUF0dGFjaGVkT25SaWdodCA/IG9wdGlvbnMuaG9zZUF0dGFjaG1lbnRPZmZzZXQueCAtIGV4dGVybmFsSG9zZUNvbm5lY3Rvci53aWR0aCA6IG9wdGlvbnMuaG9zZUF0dGFjaG1lbnRPZmZzZXQueCxcclxuICAgICAgb3B0aW9ucy5ob3NlQXR0YWNobWVudE9mZnNldC55IC0gZXh0ZXJuYWxIb3NlQ29ubmVjdG9yLmhlaWdodCAvIDJcclxuICAgICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBsb2NhbCBob3NlIGNvbm5lY3Rvciwgd2hpY2ggY29ubmVjdHMgdGhlIGhvc2UgdG8gdGhlIGNvbmVcclxuICAgIGNvbnN0IGxvY2FsSG9zZUNvbm5lY3RvciA9IGNyZWF0ZUhvc2VDb25uZWN0b3JOb2RlKCBob3NlQ29ubmVjdG9yV2lkdGgsIGhvc2VDb25uZWN0b3JIZWlnaHQsIGJhc2VGaWxsQ29sb3JQcm9wZXJ0eSApO1xyXG4gICAgY29uc3QgbG9jYWxIb3NlT2Zmc2V0WCA9IGhvc2VBdHRhY2hlZE9uUmlnaHQgPyBCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1ggOiAtQk9EWV9UT19IT1NFX0FUVEFDSF9QT0lOVF9YO1xyXG4gICAgbG9jYWxIb3NlQ29ubmVjdG9yLnNldFRyYW5zbGF0aW9uKFxyXG4gICAgICBsb2NhbEhvc2VPZmZzZXRYIC0gaG9zZUNvbm5lY3RvcldpZHRoIC8gMixcclxuICAgICAgQk9EWV9UT19IT1NFX0FUVEFDSF9QT0lOVF9ZIC0gbG9jYWxIb3NlQ29ubmVjdG9yLmhlaWdodCAvIDJcclxuICAgICk7XHJcblxyXG4gICAgLy8gc2l6aW5nIGZvciB0aGUgcHVtcCBzaGFmdFxyXG4gICAgY29uc3QgcHVtcFNoYWZ0V2lkdGggPSB3aWR0aCAqIFBVTVBfU0hBRlRfV0lEVEhfUFJPUE9SVElPTjtcclxuICAgIGNvbnN0IHB1bXBTaGFmdEhlaWdodCA9IGhlaWdodCAqIFBVTVBfU0hBRlRfSEVJR0hUX1BST1BPUlRJT047XHJcblxyXG4gICAgLy8gdXNlIFBhaW50Q29sb3JQcm9wZXJ0eSBzbyB0aGF0IGNvbG9ycyBjYW4gYmUgdXBkYXRlZCBkeW5hbWljYWxseVxyXG4gICAgY29uc3Qgc2hhZnRGaWxsQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIG9wdGlvbnMuc2hhZnRGaWxsICk7XHJcbiAgICBjb25zdCBzaGFmdFN0cm9rZUNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBzaGFmdEZpbGxDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMzggfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgcHVtcCBzaGFmdCwgd2hpY2ggaXMgdGhlIHBhcnQgYmVsb3cgdGhlIGhhbmRsZSBhbmQgaW5zaWRlIHRoZSBib2R5XHJcbiAgICB0aGlzLnB1bXBTaGFmdE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBwdW1wU2hhZnRXaWR0aCwgcHVtcFNoYWZ0SGVpZ2h0LCB7XHJcbiAgICAgIGZpbGw6IHNoYWZ0RmlsbENvbG9yUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogc2hhZnRTdHJva2VDb2xvclByb3BlcnR5LFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIHRoaXMucHVtcFNoYWZ0Tm9kZS54ID0gLXB1bXBTaGFmdFdpZHRoIC8gMjtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGhhbmRsZSBvZiB0aGUgcHVtcFxyXG4gICAgdGhpcy5wdW1wSGFuZGxlTm9kZSA9IGNyZWF0ZVB1bXBIYW5kbGVOb2RlKCBvcHRpb25zLmhhbmRsZUZpbGwgKTtcclxuICAgIGNvbnN0IHB1bXBIYW5kbGVIZWlnaHQgPSBoZWlnaHQgKiBQVU1QX0hBTkRMRV9IRUlHSFRfUFJPUE9SVElPTjtcclxuICAgIHRoaXMucHVtcEhhbmRsZU5vZGUudG91Y2hBcmVhID1cclxuICAgICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIG9wdGlvbnMuaGFuZGxlVG91Y2hBcmVhWERpbGF0aW9uLCBvcHRpb25zLmhhbmRsZVRvdWNoQXJlYVlEaWxhdGlvbiApO1xyXG4gICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5tb3VzZUFyZWEgPVxyXG4gICAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggb3B0aW9ucy5oYW5kbGVNb3VzZUFyZWFYRGlsYXRpb24sIG9wdGlvbnMuaGFuZGxlTW91c2VBcmVhWURpbGF0aW9uICk7XHJcbiAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLnNjYWxlKCBwdW1wSGFuZGxlSGVpZ2h0IC8gdGhpcy5wdW1wSGFuZGxlTm9kZS5oZWlnaHQgKTtcclxuICAgIHRoaXMuc2V0UHVtcEhhbmRsZVRvSW5pdGlhbFBvc2l0aW9uKCk7XHJcblxyXG4gICAgLy8gZW5hYmxlL2Rpc2FibGUgYmVoYXZpb3IgYW5kIGFwcGVhcmFuY2UgZm9yIHRoZSBoYW5kbGVcclxuICAgIGNvbnN0IGVuYWJsZWRMaXN0ZW5lciA9ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHtcclxuICAgICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5waWNrYWJsZSA9IGVuYWJsZWQ7XHJcbiAgICAgIHRoaXMucHVtcEhhbmRsZU5vZGUuY3Vyc29yID0gZW5hYmxlZCA/IG9wdGlvbnMuaGFuZGxlQ3Vyc29yIDogJ2RlZmF1bHQnO1xyXG4gICAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLm9wYWNpdHkgPSBlbmFibGVkID8gMSA6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWTtcclxuICAgICAgdGhpcy5wdW1wU2hhZnROb2RlLm9wYWNpdHkgPSBlbmFibGVkID8gMSA6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWTtcclxuICAgIH07XHJcbiAgICB0aGlzLm5vZGVFbmFibGVkUHJvcGVydHkubGluayggZW5hYmxlZExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gZGVmaW5lIHRoZSBhbGxvd2VkIHJhbmdlIGZvciB0aGUgcHVtcCBoYW5kbGUncyBtb3ZlbWVudFxyXG4gICAgY29uc3QgbWF4SGFuZGxlWU9mZnNldCA9IHRoaXMucHVtcEhhbmRsZU5vZGUuY2VudGVyWTtcclxuICAgIGNvbnN0IG1pbkhhbmRsZVlPZmZzZXQgPSBtYXhIYW5kbGVZT2Zmc2V0ICsgKCAtUFVNUF9TSEFGVF9IRUlHSFRfUFJPUE9SVElPTiAqIHB1bXBCb2R5SGVpZ2h0ICk7XHJcblxyXG4gICAgdGhpcy5oYW5kbGVEcmFnTGlzdGVuZXIgPSBuZXcgSGFuZGxlRHJhZ0xpc3RlbmVyKCBudW1iZXJQcm9wZXJ0eSwgcmFuZ2VQcm9wZXJ0eSwgdGhpcy5ub2RlRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICBvcHRpb25zLmluamVjdGlvbkVuYWJsZWRQcm9wZXJ0eSwgbWluSGFuZGxlWU9mZnNldCwgbWF4SGFuZGxlWU9mZnNldCwgdGhpcy5wdW1wSGFuZGxlTm9kZSwgdGhpcy5wdW1wU2hhZnROb2RlLFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxIYW5kbGVEcmFnTGlzdGVuZXJPcHRpb25zPigge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGFuZGxlRHJhZ0xpc3RlbmVyJyApXHJcbiAgICAgIH0sIG9wdGlvbnMuZHJhZ0xpc3RlbmVyT3B0aW9ucyApXHJcbiAgICApO1xyXG4gICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmhhbmRsZURyYWdMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgcGllY2VzIHdpdGggdGhlIGNvcnJlY3QgbGF5ZXJpbmdcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHB1bXBCYXNlTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYm9keVRvcEJhY2tOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBib2R5Qm90dG9tQ2FwTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wdW1wU2hhZnROb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnB1bXBIYW5kbGVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnB1bXBCb2R5Tm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmVtYWluaW5nQ2FwYWNpdHlJbmRpY2F0b3IgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJvZHlUb3BGcm9udE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbmVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBob3NlTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZXh0ZXJuYWxIb3NlQ29ubmVjdG9yICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsb2NhbEhvc2VDb25uZWN0b3IgKTtcclxuXHJcbiAgICAvLyBXaXRoID9kZXYgcXVlcnkgcGFyYW1ldGVyLCBwbGFjZSBhIHJlZCBkb3QgYXQgdGhlIG9yaWdpbi5cclxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBDaXJjbGUoIDIsIHsgZmlsbDogJ3JlZCcgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXHJcbiAgICBhc3NlcnQgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnQmljeWNsZVB1bXBOb2RlJywgdGhpcyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUJpY3ljbGVQdW1wTm9kZSA9ICgpID0+IHtcclxuICAgICAgdGhpcy5oYW5kbGVEcmFnTGlzdGVuZXIuZGlzcG9zZSgpOyAvLyB0byB1bnJlZ2lzdGVyIHRhbmRlbVxyXG5cclxuICAgICAgaWYgKCBvd25zRW5hYmxlZFByb3BlcnR5ICkge1xyXG4gICAgICAgIHRoaXMubm9kZUVuYWJsZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMubm9kZUVuYWJsZWRQcm9wZXJ0eS5oYXNMaXN0ZW5lciggZW5hYmxlZExpc3RlbmVyICkgKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlRW5hYmxlZFByb3BlcnR5LnVubGluayggZW5hYmxlZExpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGhhbmRsZSBhbmQgc2hhZnQgdG8gdGhlaXIgaW5pdGlhbCBwb3NpdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0UHVtcEhhbmRsZVRvSW5pdGlhbFBvc2l0aW9uKCk6IHZvaWQge1xyXG4gICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5ib3R0b20gPSB0aGlzLnB1bXBCb2R5Tm9kZS50b3AgLSAxODsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgdGhpcy5wdW1wU2hhZnROb2RlLnRvcCA9IHRoaXMucHVtcEhhbmRsZU5vZGUuYm90dG9tO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXRQdW1wSGFuZGxlVG9Jbml0aWFsUG9zaXRpb24oKTtcclxuICAgIHRoaXMuaGFuZGxlRHJhZ0xpc3RlbmVyLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZUJpY3ljbGVQdW1wTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIERyYXdzIHRoZSBiYXNlIG9mIHRoZSBwdW1wLiBNYW55IG9mIHRoZSBtdWx0aXBsaWVycyBhbmQgcG9pbnQgcG9zaXRpb25zIHdlcmUgYXJyaXZlZCBhdCBlbXBpcmljYWxseS5cclxuICpcclxuICogQHBhcmFtIHdpZHRoIC0gdGhlIHdpZHRoIG9mIHRoZSBiYXNlXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSB0aGUgaGVpZ2h0IG9mIHRoZSBiYXNlXHJcbiAqIEBwYXJhbSBmaWxsXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVQdW1wQmFzZU5vZGUoIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmaWxsOiBUQ29sb3IgKTogTm9kZSB7XHJcblxyXG4gIC8vIDNEIGVmZmVjdCBpcyBiZWluZyB1c2VkLCBzbyBtb3N0IG9mIHRoZSBoZWlnaHQgbWFrZXMgdXAgdGhlIHN1cmZhY2VcclxuICBjb25zdCB0b3BPZkJhc2VIZWlnaHQgPSBoZWlnaHQgKiAwLjc7XHJcbiAgY29uc3QgaGFsZk9mQmFzZVdpZHRoID0gd2lkdGggLyAyO1xyXG5cclxuICAvLyB1c2UgUGFpbnRDb2xvclByb3BlcnR5IHNvIHRoYXQgY29sb3JzIGNhbiBiZSB1cGRhdGVkIGR5bmFtaWNhbGx5XHJcbiAgY29uc3QgYmFzZUZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBmaWxsLCB7IGx1bWluYW5jZUZhY3RvcjogMC4wNSB9ICk7XHJcbiAgY29uc3QgYmFzZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjIgfSApO1xyXG4gIGNvbnN0IGJhc2VGaWxsRGFya2VzdENvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBmaWxsLCB7IGx1bWluYW5jZUZhY3RvcjogLTAuNCB9ICk7XHJcblxyXG4gIC8vIHJvdW5kZWQgcmVjdGFuZ2xlIHRoYXQgaXMgdGhlIHRvcCBvZiB0aGUgYmFzZVxyXG4gIGNvbnN0IHRvcE9mQmFzZU5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAtaGFsZk9mQmFzZVdpZHRoLCAtdG9wT2ZCYXNlSGVpZ2h0IC8gMiwgd2lkdGgsIHRvcE9mQmFzZUhlaWdodCwgMjAsIDIwLCB7XHJcbiAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIC1oYWxmT2ZCYXNlV2lkdGgsIDAsIGhhbGZPZkJhc2VXaWR0aCwgMCApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAsIGJhc2VGaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5IClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMC41LCBmaWxsIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMSwgYmFzZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5IClcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IHB1bXBCYXNlRWRnZUhlaWdodCA9IGhlaWdodCAqIDAuNjU7XHJcbiAgY29uc3QgcHVtcEJhc2VTaWRlRWRnZVlDb250cm9sUG9pbnQgPSBwdW1wQmFzZUVkZ2VIZWlnaHQgKiAxLjA1O1xyXG4gIGNvbnN0IHB1bXBCYXNlQm90dG9tRWRnZVhDdXJ2ZVN0YXJ0ID0gd2lkdGggKiAwLjM1O1xyXG5cclxuICAvLyB0aGUgZnJvbnQgZWRnZSBvZiB0aGUgcHVtcCBiYXNlLCBkcmF3IGNvdW50ZXItY2xvY2t3aXNlIHN0YXJ0aW5nIGF0IGxlZnQgZWRnZVxyXG4gIGNvbnN0IHB1bXBFZGdlU2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgLmxpbmVUbyggLWhhbGZPZkJhc2VXaWR0aCwgMCApXHJcbiAgICAubGluZVRvKCAtaGFsZk9mQmFzZVdpZHRoLCBwdW1wQmFzZUVkZ2VIZWlnaHQgLyAyIClcclxuICAgIC5xdWFkcmF0aWNDdXJ2ZVRvKCAtaGFsZk9mQmFzZVdpZHRoLCBwdW1wQmFzZVNpZGVFZGdlWUNvbnRyb2xQb2ludCwgLXB1bXBCYXNlQm90dG9tRWRnZVhDdXJ2ZVN0YXJ0LCBwdW1wQmFzZUVkZ2VIZWlnaHQgKVxyXG4gICAgLmxpbmVUbyggcHVtcEJhc2VCb3R0b21FZGdlWEN1cnZlU3RhcnQsIHB1bXBCYXNlRWRnZUhlaWdodCApXHJcbiAgICAucXVhZHJhdGljQ3VydmVUbyggaGFsZk9mQmFzZVdpZHRoLCBwdW1wQmFzZVNpZGVFZGdlWUNvbnRyb2xQb2ludCwgaGFsZk9mQmFzZVdpZHRoLCBwdW1wQmFzZUVkZ2VIZWlnaHQgLyAyIClcclxuICAgIC5saW5lVG8oIGhhbGZPZkJhc2VXaWR0aCwgMCApXHJcbiAgICAuY2xvc2UoKTtcclxuXHJcbiAgLy8gY29sb3IgdGhlIGZyb250IGVkZ2Ugb2YgdGhlIHB1bXAgYmFzZVxyXG4gIGNvbnN0IHB1bXBFZGdlTm9kZSA9IG5ldyBQYXRoKCBwdW1wRWRnZVNoYXBlLCB7XHJcbiAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIC1oYWxmT2ZCYXNlV2lkdGgsIDAsIGhhbGZPZkJhc2VXaWR0aCwgMCApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAsIGJhc2VGaWxsRGFya2VzdENvbG9yUHJvcGVydHkgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAwLjE1LCBiYXNlRmlsbERhcmtlckNvbG9yUHJvcGVydHkgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAxLCBiYXNlRmlsbERhcmtlc3RDb2xvclByb3BlcnR5IClcclxuICB9ICk7XHJcblxyXG4gIHB1bXBFZGdlTm9kZS5jZW50ZXJZID0gLXB1bXBFZGdlTm9kZS5oZWlnaHQgLyAyO1xyXG5cclxuICAvLyAwLjYgZGV0ZXJtaW5lZCBlbXBpcmljYWxseSBmb3IgYmVzdCBwb3NpdGlvbmluZ1xyXG4gIHRvcE9mQmFzZU5vZGUuYm90dG9tID0gcHVtcEVkZ2VOb2RlLmJvdHRvbSAtIHB1bXBCYXNlRWRnZUhlaWdodCAvIDIgKyAwLjY7XHJcbiAgcmV0dXJuIG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIHB1bXBFZGdlTm9kZSwgdG9wT2ZCYXNlTm9kZSBdIH0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgaGFsZiBvZiB0aGUgb3BlbmluZyBhdCB0aGUgdG9wIG9mIHRoZSBwdW1wIGJvZHkuIFBhc3NpbmcgaW4gLTEgZm9yIHRoZSBzaWduIGNyZWF0ZXMgdGhlIGJhY2sgaGFsZiwgYW5kXHJcbiAqIHBhc3NpbmcgaW4gMSBjcmVhdGVzIHRoZSBmcm9udC5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUJvZHlUb3BIYWxmTm9kZSggd2lkdGg6IG51bWJlciwgc2lnbjogMSB8IC0xLCBmaWxsOiBUQ29sb3IsIHN0cm9rZTogVENvbG9yICk6IE5vZGUge1xyXG4gIGNvbnN0IGJvZHlUb3BTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAubW92ZVRvKCAwLCAwIClcclxuICAgIC5jdWJpY0N1cnZlVG8oXHJcbiAgICAgIDAsXHJcbiAgICAgIHNpZ24gKiB3aWR0aCAqIFNIQUZUX09QRU5JTkdfVElMVF9GQUNUT1IsXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBzaWduICogd2lkdGggKiBTSEFGVF9PUEVOSU5HX1RJTFRfRkFDVE9SLFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgMFxyXG4gICAgKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQYXRoKCBib2R5VG9wU2hhcGUsIHtcclxuICAgIGZpbGw6IGZpbGwsXHJcbiAgICBzdHJva2U6IHN0cm9rZVxyXG4gIH0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBob3NlIGNvbm5lY3Rvci4gVGhlIGhvc2UgaGFzIG9uZSBvbiBlYWNoIG9mIGl0cyBlbmRzLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlSG9zZUNvbm5lY3Rvck5vZGUoIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmaWxsOiBUQ29sb3IgKTogTm9kZSB7XHJcblxyXG4gIC8vIHVzZSBQYWludENvbG9yUHJvcGVydHkgc28gdGhhdCBjb2xvcnMgY2FuIGJlIHVwZGF0ZWQgZHluYW1pY2FsbHlcclxuICBjb25zdCBmaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCwgeyBsdW1pbmFuY2VGYWN0b3I6IDAuMSB9ICk7XHJcbiAgY29uc3QgZmlsbERhcmtlckNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBmaWxsLCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMiB9ICk7XHJcbiAgY29uc3QgZmlsbERhcmtlc3RDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjQgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IFJlY3RhbmdsZSggMCwgMCwgd2lkdGgsIGhlaWdodCwgMiwgMiwge1xyXG4gICAgZmlsbDogbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBoZWlnaHQgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAwLCBmaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAuMywgZmlsbCApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAuMzUsIGZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAwLjQsIGZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAxLCBmaWxsRGFya2VzdENvbG9yUHJvcGVydHkgKVxyXG4gIH0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIGNvbmUsIHdoaWNoIGNvbm5lY3RzIHRoZSBwdW1wIGJhc2UgdG8gdGhlIHB1bXAgYm9keS5cclxuICogQHBhcmFtIHB1bXBCb2R5V2lkdGggLSB0aGUgd2lkdGggb2YgdGhlIHB1bXAgYm9keSAobm90IHF1aXRlIGFzIHdpZGUgYXMgdGhlIHRvcCBvZiB0aGUgY29uZSlcclxuICogQHBhcmFtIGhlaWdodFxyXG4gKiBAcGFyYW0gZmlsbFxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQ29uZU5vZGUoIHB1bXBCb2R5V2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGZpbGw6IFRDb2xvciApOiBOb2RlIHtcclxuICBjb25zdCBjb25lVG9wV2lkdGggPSBwdW1wQm9keVdpZHRoICogMS4yO1xyXG4gIGNvbnN0IGNvbmVUb3BSYWRpdXNZID0gMztcclxuICBjb25zdCBjb25lVG9wUmFkaXVzWCA9IGNvbmVUb3BXaWR0aCAvIDI7XHJcbiAgY29uc3QgY29uZUJvdHRvbVdpZHRoID0gcHVtcEJvZHlXaWR0aCAqIDI7XHJcbiAgY29uc3QgY29uZUJvdHRvbVJhZGl1c1kgPSA0O1xyXG4gIGNvbnN0IGNvbmVCb3R0b21SYWRpdXNYID0gY29uZUJvdHRvbVdpZHRoIC8gMjtcclxuXHJcbiAgY29uc3QgY29uZVNoYXBlID0gbmV3IFNoYXBlKClcclxuXHJcbiAgICAvLyBzdGFydCBpbiB1cHBlciByaWdodCBjb3JuZXIgb2Ygc2hhcGUsIGRyYXcgdG9wIGVsbGlwc2UgcmlnaHQgdG8gbGVmdFxyXG4gICAgLmVsbGlwdGljYWxBcmMoIDAsIDAsIGNvbmVUb3BSYWRpdXNYLCBjb25lVG9wUmFkaXVzWSwgMCwgMCwgTWF0aC5QSSwgZmFsc2UgKVxyXG4gICAgLmxpbmVUbyggLWNvbmVCb3R0b21SYWRpdXNYLCBoZWlnaHQgKSAvLyBsaW5lIHRvIGJvdHRvbSBsZWZ0IGNvcm5lciBvZiBzaGFwZVxyXG5cclxuICAgIC8vIGRyYXcgYm90dG9tIGVsbGlwc2UgbGVmdCB0byByaWdodFxyXG4gICAgLmVsbGlwdGljYWxBcmMoIDAsIGhlaWdodCwgY29uZUJvdHRvbVJhZGl1c1gsIGNvbmVCb3R0b21SYWRpdXNZLCAwLCBNYXRoLlBJLCAwLCB0cnVlIClcclxuICAgIC5saW5lVG8oIGNvbmVUb3BSYWRpdXNYLCAwICk7IC8vIGxpbmUgdG8gdXBwZXIgcmlnaHQgY29ybmVyIG9mIHNoYXBlXHJcblxyXG4gIC8vIHVzZSBQYWludENvbG9yUHJvcGVydHkgc28gdGhhdCBjb2xvcnMgY2FuIGJlIHVwZGF0ZWQgZHluYW1pY2FsbHlcclxuICBjb25zdCBmaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCwgeyBsdW1pbmFuY2VGYWN0b3I6IDAuMSB9ICk7XHJcbiAgY29uc3QgZmlsbERhcmtlckNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBmaWxsLCB7IGx1bWluYW5jZUZhY3RvcjogLTAuNCB9ICk7XHJcbiAgY29uc3QgZmlsbERhcmtlc3RDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjUgfSApO1xyXG5cclxuICBjb25zdCBjb25lR3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIC1jb25lQm90dG9tV2lkdGggLyAyLCAwLCBjb25lQm90dG9tV2lkdGggLyAyLCAwIClcclxuICAgIC5hZGRDb2xvclN0b3AoIDAsIGZpbGxEYXJrZXJDb2xvclByb3BlcnR5IClcclxuICAgIC5hZGRDb2xvclN0b3AoIDAuMywgZmlsbCApXHJcbiAgICAuYWRkQ29sb3JTdG9wKCAwLjM1LCBmaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5IClcclxuICAgIC5hZGRDb2xvclN0b3AoIDAuNDUsIGZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkgKVxyXG4gICAgLmFkZENvbG9yU3RvcCggMC41LCBmaWxsIClcclxuICAgIC5hZGRDb2xvclN0b3AoIDEsIGZpbGxEYXJrZXN0Q29sb3JQcm9wZXJ0eSApO1xyXG5cclxuICByZXR1cm4gbmV3IFBhdGgoIGNvbmVTaGFwZSwge1xyXG4gICAgZmlsbDogY29uZUdyYWRpZW50XHJcbiAgfSApO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHRoZSBoYW5kbGUgb2YgdGhlIHB1bXAuIFRoaXMgaXMgdGhlIG5vZGUgdGhhdCB0aGUgdXNlciB3aWxsIGludGVyYWN0IHdpdGggaW4gb3JkZXIgdG8gdXNlIHRoZSBwdW1wLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlUHVtcEhhbmRsZU5vZGUoIGZpbGw6IFRDb2xvciApOiBOb2RlIHtcclxuXHJcbiAgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBjb25zdGFudHNcclxuICBjb25zdCBjZW50ZXJTZWN0aW9uV2lkdGggPSAzNTtcclxuICBjb25zdCBjZW50ZXJDdXJ2ZVdpZHRoID0gMTQ7XHJcbiAgY29uc3QgY2VudGVyQ3VydmVIZWlnaHQgPSA4O1xyXG4gIGNvbnN0IG51bWJlck9mR3JpcEJ1bXBzID0gNDtcclxuICBjb25zdCBncmlwU2luZ2xlQnVtcFdpZHRoID0gMTY7XHJcbiAgY29uc3QgZ3JpcFNpbmdsZUJ1bXBIYWxmV2lkdGggPSBncmlwU2luZ2xlQnVtcFdpZHRoIC8gMjtcclxuICBjb25zdCBncmlwSW50ZXJCdW1wV2lkdGggPSBncmlwU2luZ2xlQnVtcFdpZHRoICogMC4zMTtcclxuICBjb25zdCBncmlwRW5kSGVpZ2h0ID0gMjM7XHJcblxyXG4gIC8vIHN0YXJ0IHRoZSBoYW5kbGUgZnJvbSB0aGUgY2VudGVyIGJvdHRvbSwgZHJhd2luZyBhcm91bmQgY291bnRlcmNsb2Nrd2lzZVxyXG4gIGNvbnN0IHB1bXBIYW5kbGVTaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApO1xyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBcImJ1bXBcIiB0byB0aGUgdG9wIG9yIGJvdHRvbSBvZiB0aGUgZ3JpcFxyXG4gICAqIEBwYXJhbSBzaGFwZSAtIHRoZSBzaGFwZSB0byBhcHBlbmQgdG9cclxuICAgKiBAcGFyYW0gc2lnbiAtICsxIGZvciBib3R0b20gc2lkZSBvZiBncmlwLCAtMSBmb3IgdG9wIHNpZGUgb2YgZ3JpcFxyXG4gICAqL1xyXG4gIGNvbnN0IGFkZEdyaXBCdW1wID0gKCBzaGFwZTogU2hhcGUsIHNpZ246IDEgfCAtMSApID0+IHtcclxuXHJcbiAgICAvLyBjb250cm9sIHBvaW50cyBmb3IgcXVhZHJhdGljIGN1cnZlIHNoYXBlIG9uIGdyaXBcclxuICAgIGNvbnN0IGNvbnRyb2xQb2ludFggPSBncmlwU2luZ2xlQnVtcFdpZHRoIC8gMjtcclxuICAgIGNvbnN0IGNvbnRyb2xQb2ludFkgPSBncmlwU2luZ2xlQnVtcFdpZHRoIC8gMjtcclxuXHJcbiAgICAvLyB0aGlzIGlzIGEgZ3JpcCBidW1wXHJcbiAgICBzaGFwZS5xdWFkcmF0aWNDdXJ2ZVRvUmVsYXRpdmUoXHJcbiAgICAgIHNpZ24gKiBjb250cm9sUG9pbnRYLFxyXG4gICAgICBzaWduICogY29udHJvbFBvaW50WSxcclxuICAgICAgc2lnbiAqIGdyaXBTaW5nbGVCdW1wV2lkdGgsXHJcbiAgICAgIDAgKTtcclxuICB9O1xyXG5cclxuICAvLyB0aGlzIGlzIHRoZSBsb3dlciByaWdodCBwYXJ0IG9mIHRoZSBoYW5kbGUsIGluY2x1ZGluZyBoYWxmIG9mIHRoZSBtaWRkbGUgc2VjdGlvbiBhbmQgdGhlIGdyaXAgYnVtcHNcclxuICBwdW1wSGFuZGxlU2hhcGUubGluZVRvUmVsYXRpdmUoIGNlbnRlclNlY3Rpb25XaWR0aCAvIDIsIDAgKTtcclxuICBwdW1wSGFuZGxlU2hhcGUucXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCBjZW50ZXJDdXJ2ZVdpZHRoIC8gMiwgMCwgY2VudGVyQ3VydmVXaWR0aCwgLWNlbnRlckN1cnZlSGVpZ2h0ICk7XHJcbiAgcHVtcEhhbmRsZVNoYXBlLmxpbmVUb1JlbGF0aXZlKCBncmlwSW50ZXJCdW1wV2lkdGgsIDAgKTtcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkdyaXBCdW1wcyAtIDE7IGkrKyApIHtcclxuICAgIGFkZEdyaXBCdW1wKCBwdW1wSGFuZGxlU2hhcGUsIDEgKTtcclxuICAgIHB1bXBIYW5kbGVTaGFwZS5saW5lVG9SZWxhdGl2ZSggZ3JpcEludGVyQnVtcFdpZHRoLCAwICk7XHJcbiAgfVxyXG4gIGFkZEdyaXBCdW1wKCBwdW1wSGFuZGxlU2hhcGUsIDEgKTtcclxuXHJcbiAgLy8gdGhpcyBpcyB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgaGFuZGxlXHJcbiAgcHVtcEhhbmRsZVNoYXBlLmxpbmVUb1JlbGF0aXZlKCAwLCAtZ3JpcEVuZEhlaWdodCApO1xyXG5cclxuICAvLyB0aGlzIGlzIHRoZSB1cHBlciByaWdodCBwYXJ0IG9mIHRoZSBoYW5kbGUsIGluY2x1ZGluZyBvbmx5IHRoZSBncmlwIGJ1bXBzXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZHcmlwQnVtcHM7IGkrKyApIHtcclxuICAgIGFkZEdyaXBCdW1wKCBwdW1wSGFuZGxlU2hhcGUsIC0xICk7XHJcbiAgICBwdW1wSGFuZGxlU2hhcGUubGluZVRvUmVsYXRpdmUoIC1ncmlwSW50ZXJCdW1wV2lkdGgsIDAgKTtcclxuICB9XHJcblxyXG4gIC8vIHRoaXMgaXMgdGhlIHVwcGVyIG1pZGRsZSBzZWN0aW9uIG9mIHRoZSBoYW5kbGVcclxuICBwdW1wSGFuZGxlU2hhcGUucXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCAtY2VudGVyQ3VydmVXaWR0aCAvIDIsIC1jZW50ZXJDdXJ2ZUhlaWdodCwgLWNlbnRlckN1cnZlV2lkdGgsIC1jZW50ZXJDdXJ2ZUhlaWdodCApO1xyXG4gIHB1bXBIYW5kbGVTaGFwZS5saW5lVG9SZWxhdGl2ZSggLWNlbnRlclNlY3Rpb25XaWR0aCwgMCApO1xyXG4gIHB1bXBIYW5kbGVTaGFwZS5xdWFkcmF0aWNDdXJ2ZVRvUmVsYXRpdmUoIC1jZW50ZXJDdXJ2ZVdpZHRoIC8gMiwgMCwgLWNlbnRlckN1cnZlV2lkdGgsIGNlbnRlckN1cnZlSGVpZ2h0ICk7XHJcbiAgcHVtcEhhbmRsZVNoYXBlLmxpbmVUb1JlbGF0aXZlKCAtZ3JpcEludGVyQnVtcFdpZHRoLCAwICk7XHJcblxyXG4gIC8vIHRoaXMgaXMgdGhlIHVwcGVyIGxlZnQgcGFydCBvZiB0aGUgaGFuZGxlLCBpbmNsdWRpbmcgb25seSB0aGUgZ3JpcCBidW1wc1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mR3JpcEJ1bXBzIC0gMTsgaSsrICkge1xyXG4gICAgYWRkR3JpcEJ1bXAoIHB1bXBIYW5kbGVTaGFwZSwgLTEgKTtcclxuICAgIHB1bXBIYW5kbGVTaGFwZS5saW5lVG9SZWxhdGl2ZSggLWdyaXBJbnRlckJ1bXBXaWR0aCwgMCApO1xyXG4gIH1cclxuICBhZGRHcmlwQnVtcCggcHVtcEhhbmRsZVNoYXBlLCAtMSApO1xyXG5cclxuICAvLyB0aGlzIGlzIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIGhhbmRsZVxyXG4gIHB1bXBIYW5kbGVTaGFwZS5saW5lVG9SZWxhdGl2ZSggMCwgZ3JpcEVuZEhlaWdodCApO1xyXG5cclxuICAvLyB0aGlzIGlzIHRoZSBsb3dlciBsZWZ0IHBhcnQgb2YgdGhlIGhhbmRsZSwgaW5jbHVkaW5nIHRoZSBncmlwIGJ1bXBzIGFuZCBoYWxmIG9mIHRoZSBtaWRkbGUgc2VjdGlvblxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mR3JpcEJ1bXBzOyBpKysgKSB7XHJcbiAgICBhZGRHcmlwQnVtcCggcHVtcEhhbmRsZVNoYXBlLCAxICk7XHJcbiAgICBwdW1wSGFuZGxlU2hhcGUubGluZVRvUmVsYXRpdmUoIGdyaXBJbnRlckJ1bXBXaWR0aCwgMCApO1xyXG4gIH1cclxuICBwdW1wSGFuZGxlU2hhcGUucXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCBjZW50ZXJDdXJ2ZVdpZHRoIC8gMiwgY2VudGVyQ3VydmVIZWlnaHQsIGNlbnRlckN1cnZlV2lkdGgsIGNlbnRlckN1cnZlSGVpZ2h0ICk7XHJcbiAgcHVtcEhhbmRsZVNoYXBlLmxpbmVUb1JlbGF0aXZlKCBjZW50ZXJTZWN0aW9uV2lkdGggLyAyLCAwICk7XHJcbiAgcHVtcEhhbmRsZVNoYXBlLmNsb3NlKCk7XHJcblxyXG4gIC8vIHVzZWQgdG8gdHJhY2sgd2hlcmUgdGhlIGN1cnJlbnQgcG9zaXRpb24gaXMgb24gdGhlIGhhbmRsZSB3aGVuIGRyYXdpbmcgaXRzIGdyYWRpZW50XHJcbiAgbGV0IGhhbmRsZUdyYWRpZW50UG9zaXRpb24gPSAwO1xyXG5cclxuICAvKipcclxuICAgKiBBZGRzIGEgY29sb3Igc3RvcCB0byB0aGUgZ2l2ZW4gZ3JhZGllbnQgYXRcclxuICAgKiBAcGFyYW0gZ3JhZGllbnQgLSB0aGUgZ3JhZGllbnQgYmVpbmcgYXBwZW5kZWQgdG9cclxuICAgKiBAcGFyYW0gZGVsdGFEaXN0YW5jZSAtIHRoZSBkaXN0YW5jZSBvZiB0aGlzIGFkZGVkIGNvbG9yIHN0b3BcclxuICAgKiBAcGFyYW0gdG90YWxEaXN0YW5jZSAtIHRoZSB0b3RhbCB3aWR0aCBvZiB0aGUgZ3JhZGllbnRcclxuICAgKiBAcGFyYW0gY29sb3IgLSB0aGUgY29sb3Igb2YgdGhpcyBjb2xvciBzdG9wXHJcbiAgICovXHJcbiAgY29uc3QgYWRkUmVsYXRpdmVDb2xvclN0b3AgPSAoIGdyYWRpZW50OiBMaW5lYXJHcmFkaWVudCwgZGVsdGFEaXN0YW5jZTogbnVtYmVyLCB0b3RhbERpc3RhbmNlOiBudW1iZXIsIGNvbG9yOiBUQ29sb3IgKSA9PiB7XHJcbiAgICBjb25zdCBuZXdQb3NpdGlvbiA9IGhhbmRsZUdyYWRpZW50UG9zaXRpb24gKyBkZWx0YURpc3RhbmNlO1xyXG4gICAgbGV0IHJhdGlvID0gbmV3UG9zaXRpb24gLyB0b3RhbERpc3RhbmNlO1xyXG4gICAgcmF0aW8gPSByYXRpbyA+IDEgPyAxIDogcmF0aW87XHJcblxyXG4gICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKCByYXRpbywgY29sb3IgKTtcclxuICAgIGhhbmRsZUdyYWRpZW50UG9zaXRpb24gPSBuZXdQb3NpdGlvbjtcclxuICB9O1xyXG5cclxuICAvLyBzZXQgdXAgdGhlIGdyYWRpZW50IGZvciB0aGUgaGFuZGxlXHJcbiAgY29uc3QgcHVtcEhhbmRsZVdpZHRoID0gcHVtcEhhbmRsZVNoYXBlLmJvdW5kcy53aWR0aDtcclxuICBjb25zdCBwdW1wSGFuZGxlR3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIC1wdW1wSGFuZGxlV2lkdGggLyAyLCAwLCBwdW1wSGFuZGxlV2lkdGggLyAyLCAwICk7XHJcblxyXG4gIC8vIHVzZSBQYWludENvbG9yUHJvcGVydHkgc28gdGhhdCBjb2xvcnMgY2FuIGJlIHVwZGF0ZWQgZHluYW1pY2FsbHlcclxuICBjb25zdCBoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGZpbGwgKTtcclxuICBjb25zdCBoYW5kbGVGaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGhhbmRsZUZpbGxDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMzUgfSApO1xyXG5cclxuICAvLyBmaWxsIHRoZSBsZWZ0IHNpZGUgaGFuZGxlIGdyYWRpZW50XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZHcmlwQnVtcHM7IGkrKyApIHtcclxuICAgIGFkZFJlbGF0aXZlQ29sb3JTdG9wKCBwdW1wSGFuZGxlR3JhZGllbnQsIDAsIHB1bXBIYW5kbGVXaWR0aCwgaGFuZGxlRmlsbENvbG9yUHJvcGVydHkgKTtcclxuICAgIGFkZFJlbGF0aXZlQ29sb3JTdG9wKCBwdW1wSGFuZGxlR3JhZGllbnQsIGdyaXBTaW5nbGVCdW1wSGFsZldpZHRoLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxDb2xvclByb3BlcnR5ICk7XHJcbiAgICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCBncmlwU2luZ2xlQnVtcEhhbGZXaWR0aCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSApO1xyXG4gICAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgMCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSApO1xyXG4gICAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgZ3JpcEludGVyQnVtcFdpZHRoLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5ICk7XHJcbiAgfVxyXG5cclxuICAvLyBmaWxsIHRoZSBjZW50ZXIgc2VjdGlvbiBoYW5kbGUgZ3JhZGllbnRcclxuICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCAwLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxDb2xvclByb3BlcnR5ICk7XHJcbiAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgY2VudGVyQ3VydmVXaWR0aCArIGNlbnRlclNlY3Rpb25XaWR0aCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSApO1xyXG4gIGFkZFJlbGF0aXZlQ29sb3JTdG9wKCBwdW1wSGFuZGxlR3JhZGllbnQsIGNlbnRlckN1cnZlV2lkdGgsIHB1bXBIYW5kbGVXaWR0aCwgaGFuZGxlRmlsbERhcmtlckNvbG9yUHJvcGVydHkgKTtcclxuXHJcbiAgLy8gZmlsbCB0aGUgcmlnaHQgc2lkZSBoYW5kbGUgZ3JhZGllbnRcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkdyaXBCdW1wczsgaSsrICkge1xyXG4gICAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgMCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSApO1xyXG4gICAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgZ3JpcEludGVyQnVtcFdpZHRoLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5ICk7XHJcbiAgICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCAwLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxDb2xvclByb3BlcnR5ICk7XHJcbiAgICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCBncmlwU2luZ2xlQnVtcEhhbGZXaWR0aCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSApO1xyXG4gICAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgZ3JpcFNpbmdsZUJ1bXBIYWxmV2lkdGgsIHB1bXBIYW5kbGVXaWR0aCwgaGFuZGxlRmlsbERhcmtlckNvbG9yUHJvcGVydHkgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBuZXcgUGF0aCggcHVtcEhhbmRsZVNoYXBlLCB7XHJcbiAgICBsaW5lV2lkdGg6IDIsXHJcbiAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICBmaWxsOiBwdW1wSGFuZGxlR3JhZGllbnRcclxuICB9ICk7XHJcbn1cclxuXHJcbnR5cGUgSGFuZGxlRHJhZ0xpc3RlbmVyU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIHtudW1iZXJ9IG51bWJlciBvZiBwYXJ0aWNsZXMgcmVsZWFzZWQgYnkgdGhlIHB1bXAgZHVyaW5nIG9uZSBwdW1waW5nIGFjdGlvblxyXG4gIG51bWJlck9mUGFydGljbGVzUGVyUHVtcEFjdGlvbj86IG51bWJlcjtcclxuXHJcbiAgLy8ge2Jvb2xlYW59IGlmIGZhbHNlLCBwYXJ0aWNsZXMgYXJlIGFkZGVkIGFzIGEgYmF0Y2ggYXQgdGhlIGVuZCBvZiBlYWNoIHB1bXBpbmcgbW90aW9uXHJcbiAgYWRkUGFydGljbGVzT25lQXRBVGltZT86IGJvb2xlYW47XHJcbn07XHJcblxyXG50eXBlIEhhbmRsZURyYWdMaXN0ZW5lck9wdGlvbnMgPSBIYW5kbGVEcmFnTGlzdGVuZXJTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8RHJhZ0xpc3RlbmVyT3B0aW9uczxQcmVzc2VkRHJhZ0xpc3RlbmVyPiwgJ2RyYWcnPjtcclxuXHJcbi8qKlxyXG4gKiBEcmFnIGxpc3RlbmVyIGZvciB0aGUgcHVtcCdzIGhhbmRsZS5cclxuICovXHJcbmNsYXNzIEhhbmRsZURyYWdMaXN0ZW5lciBleHRlbmRzIERyYWdMaXN0ZW5lciB7XHJcblxyXG4gIHByaXZhdGUgbGFzdEhhbmRsZVBvc2l0aW9uOiBudW1iZXIgfCBudWxsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG51bWJlclByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHJhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPixcclxuICAgICAgICAgICAgICAgICAgICAgIG5vZGVFbmFibGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIG1pbkhhbmRsZVlPZmZzZXQ6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIG1heEhhbmRsZVlPZmZzZXQ6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIHB1bXBIYW5kbGVOb2RlOiBOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHVtcFNoYWZ0Tm9kZTogTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IEhhbmRsZURyYWdMaXN0ZW5lck9wdGlvbnNcclxuICApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXhIYW5kbGVZT2Zmc2V0ID4gbWluSGFuZGxlWU9mZnNldCwgJ2JvZ3VzIG9mZnNldHMnICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxIYW5kbGVEcmFnTGlzdGVuZXJPcHRpb25zLCBIYW5kbGVEcmFnTGlzdGVuZXJTZWxmT3B0aW9ucywgRHJhZ0xpc3RlbmVyT3B0aW9uczxQcmVzc2VkRHJhZ0xpc3RlbmVyPj4oKSgge1xyXG5cclxuICAgICAgLy8gSGFuZGxlRHJhZ0xpc3RlbmVyU2VsZk9wdGlvbnNcclxuICAgICAgbnVtYmVyT2ZQYXJ0aWNsZXNQZXJQdW1wQWN0aW9uOiAxMCxcclxuICAgICAgYWRkUGFydGljbGVzT25lQXRBVGltZTogdHJ1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgbGV0IHB1bXBpbmdEaXN0YW5jZUFjY3VtdWxhdGlvbiA9IDA7XHJcblxyXG4gICAgLy8gSG93IGZhciB0aGUgcHVtcCBzaGFmdCBuZWVkcyB0byB0cmF2ZWwgYmVmb3JlIHRoZSBwdW1wIHJlbGVhc2VzIGEgcGFydGljbGUuXHJcbiAgICAvLyBUaGUgc3VidHJhY3RlZCBjb25zdGFudCB3YXMgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBlbnN1cmUgdGhhdCBudW1iZXJPZlBhcnRpY2xlc1BlclB1bXBBY3Rpb24gaXMgY29ycmVjdC5cclxuICAgIGNvbnN0IHB1bXBpbmdEaXN0YW5jZVJlcXVpcmVkVG9BZGRQYXJ0aWNsZSA9XHJcbiAgICAgICggbWF4SGFuZGxlWU9mZnNldCAtIG1pbkhhbmRsZVlPZmZzZXQgKSAvIG9wdGlvbnMubnVtYmVyT2ZQYXJ0aWNsZXNQZXJQdW1wQWN0aW9uIC0gMC4wMTtcclxuXHJcbiAgICBvcHRpb25zLmRyYWcgPSAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKSA9PiB7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGhlIGhhbmRsZSBhbmQgc2hhZnQgcG9zaXRpb24gYmFzZWQgb24gdGhlIHVzZXIncyBwb2ludGVyIHBvc2l0aW9uXHJcbiAgICAgIGNvbnN0IGRyYWdQb3NpdGlvblkgPSBwdW1wSGFuZGxlTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueTtcclxuICAgICAgY29uc3QgaGFuZGxlUG9zaXRpb24gPSBVdGlscy5jbGFtcCggZHJhZ1Bvc2l0aW9uWSwgbWluSGFuZGxlWU9mZnNldCwgbWF4SGFuZGxlWU9mZnNldCApO1xyXG4gICAgICBwdW1wSGFuZGxlTm9kZS5jZW50ZXJZID0gaGFuZGxlUG9zaXRpb247XHJcbiAgICAgIHB1bXBTaGFmdE5vZGUudG9wID0gcHVtcEhhbmRsZU5vZGUuYm90dG9tO1xyXG5cclxuICAgICAgbGV0IG51bWJlck9mQmF0Y2hQYXJ0aWNsZXMgPSAwOyAvLyBudW1iZXIgb2YgcGFydGljbGVzIHRvIGFkZCBhbGwgYXQgb25jZVxyXG5cclxuICAgICAgaWYgKCB0aGlzLmxhc3RIYW5kbGVQb3NpdGlvbiAhPT0gbnVsbCApIHtcclxuICAgICAgICBjb25zdCB0cmF2ZWxEaXN0YW5jZSA9IGhhbmRsZVBvc2l0aW9uIC0gdGhpcy5sYXN0SGFuZGxlUG9zaXRpb247XHJcbiAgICAgICAgaWYgKCB0cmF2ZWxEaXN0YW5jZSA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgLy8gVGhpcyBtb3Rpb24gaXMgaW4gdGhlIGRvd253YXJkIGRpcmVjdGlvbiwgc28gYWRkIGl0cyBkaXN0YW5jZSB0byB0aGUgcHVtcGluZyBkaXN0YW5jZS5cclxuICAgICAgICAgIHB1bXBpbmdEaXN0YW5jZUFjY3VtdWxhdGlvbiArPSB0cmF2ZWxEaXN0YW5jZTtcclxuICAgICAgICAgIHdoaWxlICggcHVtcGluZ0Rpc3RhbmNlQWNjdW11bGF0aW9uID49IHB1bXBpbmdEaXN0YW5jZVJlcXVpcmVkVG9BZGRQYXJ0aWNsZSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBhIHBhcnRpY2xlXHJcbiAgICAgICAgICAgIGlmICggbm9kZUVuYWJsZWRQcm9wZXJ0eS52YWx1ZSAmJiBpbmplY3Rpb25FbmFibGVkUHJvcGVydHkudmFsdWUgJiZcclxuICAgICAgICAgICAgICAgICBudW1iZXJQcm9wZXJ0eS52YWx1ZSArIG51bWJlck9mQmF0Y2hQYXJ0aWNsZXMgPCByYW5nZVByb3BlcnR5LnZhbHVlLm1heCApIHtcclxuICAgICAgICAgICAgICBpZiAoIG9wdGlvbnMuYWRkUGFydGljbGVzT25lQXRBVGltZSApIHtcclxuICAgICAgICAgICAgICAgIG51bWJlclByb3BlcnR5LnZhbHVlKys7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZCYXRjaFBhcnRpY2xlcysrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwdW1waW5nRGlzdGFuY2VBY2N1bXVsYXRpb24gLT0gcHVtcGluZ0Rpc3RhbmNlUmVxdWlyZWRUb0FkZFBhcnRpY2xlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHB1bXBpbmdEaXN0YW5jZUFjY3VtdWxhdGlvbiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgcGFydGljbGVzIGluIG9uZSBiYXRjaC5cclxuICAgICAgaWYgKCAhb3B0aW9ucy5hZGRQYXJ0aWNsZXNPbmVBdEFUaW1lICkge1xyXG4gICAgICAgIG51bWJlclByb3BlcnR5LnZhbHVlICs9IG51bWJlck9mQmF0Y2hQYXJ0aWNsZXM7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVyT2ZCYXRjaFBhcnRpY2xlcyA9PT0gMCwgJ3VuZXhwZWN0ZWQgYmF0Y2hlZCBwYXJ0aWNsZXMnICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubGFzdEhhbmRsZVBvc2l0aW9uID0gaGFuZGxlUG9zaXRpb247XHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5sYXN0SGFuZGxlUG9zaXRpb24gPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5sYXN0SGFuZGxlUG9zaXRpb24gPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdCaWN5Y2xlUHVtcE5vZGUnLCBCaWN5Y2xlUHVtcE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLGtDQUFrQztBQUk5RCxPQUFPQyxLQUFLLE1BQU0sdUJBQXVCO0FBRXpDLE9BQU9DLE9BQU8sTUFBTSx5QkFBeUI7QUFDN0MsU0FBU0MsS0FBSyxRQUFRLDBCQUEwQjtBQUNoRCxPQUFPQyxnQkFBZ0IsTUFBTSxzREFBc0Q7QUFDbkYsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQVEsaUNBQWlDO0FBQzNFLFNBQVNDLE1BQU0sRUFBRUMsWUFBWSxFQUErQkMsY0FBYyxFQUFFQyxJQUFJLEVBQWVDLGtCQUFrQixFQUFFQyxJQUFJLEVBQTJDQyxTQUFTLEVBQUVDLGdCQUFnQixRQUFRLDZCQUE2QjtBQUNsTyxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLFdBQVcs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