// Copyright 2016-2023, University of Colorado Boulder

/**
 * Cannon view.
 * Angle can change when user drags the cannon tip. Height can change when user drags cannon base.
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Color, DragListener, Image, Line, LinearGradient, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import cannonBarrelTop_png from '../../../images/cannonBarrelTop_png.js';
import cannonBarrel_png from '../../../mipmaps/cannonBarrel_png.js';
import cannonBaseBottom_png from '../../../mipmaps/cannonBaseBottom_png.js';
import cannonBaseTop_png from '../../../mipmaps/cannonBaseTop_png.js';
import projectileMotion from '../../projectileMotion.js';
import ProjectileMotionStrings from '../../ProjectileMotionStrings.js';
import ProjectileMotionConstants from '../ProjectileMotionConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';

// image

const mString = ProjectileMotionStrings.m;
const pattern0Value1UnitsString = ProjectileMotionStrings.pattern0Value1Units;
const pattern0Value1UnitsWithSpaceString = ProjectileMotionStrings.pattern0Value1UnitsWithSpace;

// constants
const CANNON_LENGTH = 4; // empirically determined in model coords
const ELLIPSE_WIDTH = 420; // empirically determined in view coordinates
const ELLIPSE_HEIGHT = 40; // empirically determined in view coordinates
const CYLINDER_DISTANCE_FROM_ORIGIN = 1.3; // empirically determined in model coords as it needs to update each time the mvt changes
const HEIGHT_LEADER_LINE_X = -1.5; // empirically determined in view coords
const CROSSHAIR_LENGTH = 120; // empirically determined in view coords
const ANGLE_RANGE = ProjectileMotionConstants.CANNON_ANGLE_RANGE;
const HEIGHT_RANGE = ProjectileMotionConstants.CANNON_HEIGHT_RANGE;
const LABEL_OPTIONS = ProjectileMotionConstants.LABEL_TEXT_OPTIONS;
const BRIGHT_GRAY_COLOR = new Color(230, 230, 230, 1);
const DARK_GRAY_COLOR = new Color(103, 103, 103, 1);
const TRANSPARENT_WHITE = 'rgba( 255, 255, 255, 0.6 )';
const ANGLE_RANGE_MINS = [5, -5, -20, -40]; // angle range minimums, corresponding to height through their index
const CUEING_ARROW_OPTIONS = {
  fill: 'rgb( 100, 200, 255 )',
  stroke: 'black',
  lineWidth: 1,
  tailWidth: 8,
  headWidth: 14,
  headHeight: 6
};
const MUZZLE_FLASH_SCALE_INITIAL = 0.4;
const MUZZLE_FLASH_SCALE_FINAL = 1.5;
const MUZZLE_FLASH_OPACITY_INITIAL = 1;
const MUZZLE_FLASH_OPACITY_FINAL = 0;
const MUZZLE_FLASH_DURATION = 0.4; //seconds

const DEGREES = MathSymbols.DEGREES;
const opacityLinearFunction = new LinearFunction(0, 1, MUZZLE_FLASH_OPACITY_INITIAL, MUZZLE_FLASH_OPACITY_FINAL);
const scaleLinearFunction = new LinearFunction(0, 1, MUZZLE_FLASH_SCALE_INITIAL, MUZZLE_FLASH_SCALE_FINAL);
class CannonNode extends Node {
  constructor(heightProperty, angleProperty, muzzleFlashStepper, transformProperty, screenView, providedOptions) {
    const options = optionize()({
      tandem: Tandem.REQUIRED
    }, providedOptions);
    super(options);

    // where the projectile is fired from
    const viewOrigin = transformProperty.value.modelToViewPosition(new Vector2(0, 0));

    // the cannon, muzzle flash, and pedestal are not visible underground
    const clipContainer = new Node(); // no transform, just for clip area

    const cylinderNode = new Node({
      y: viewOrigin.y
    });
    clipContainer.addChild(cylinderNode);

    // shape used for ground circle and top of pedestal
    const ellipseShape = Shape.ellipse(0, 0, ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, 0);

    // ground circle, which shows the "inside" of the circular hole that the cannon is sitting in
    const groundFill = new LinearGradient(-ELLIPSE_WIDTH / 2, 0, ELLIPSE_WIDTH / 2, 0).addColorStop(0.0, 'gray').addColorStop(0.3, 'white').addColorStop(1, 'gray');
    const groundCircle = new Path(ellipseShape, {
      y: viewOrigin.y,
      fill: groundFill,
      stroke: BRIGHT_GRAY_COLOR
    });

    // side of the cylinder
    const sideFill = new LinearGradient(-ELLIPSE_WIDTH / 2, 0, ELLIPSE_WIDTH / 2, 0).addColorStop(0.0, DARK_GRAY_COLOR).addColorStop(0.3, BRIGHT_GRAY_COLOR).addColorStop(1, DARK_GRAY_COLOR);
    const cylinderSide = new Path(null, {
      fill: sideFill,
      stroke: BRIGHT_GRAY_COLOR
    });
    cylinderNode.addChild(cylinderSide);

    // top of the cylinder
    const cylinderTop = new Path(ellipseShape, {
      fill: DARK_GRAY_COLOR,
      stroke: BRIGHT_GRAY_COLOR
    });
    cylinderNode.addChild(cylinderTop);

    // cannon
    const cannonBarrel = new Node({
      x: viewOrigin.x,
      y: viewOrigin.y
    });
    clipContainer.addChild(cannonBarrel);

    // A copy of the top part of the cannon barrel to 1) grab and change angle and 2) layout the cannonBarrel
    const cannonBarrelTop = new Image(cannonBarrelTop_png, {
      centerY: 0,
      opacity: 0
    });
    const cannonBarrelBase = new Image(cannonBarrel_png, {
      centerY: 0,
      right: cannonBarrelTop.right
    });
    cannonBarrel.addChild(cannonBarrelBase);
    cannonBarrel.addChild(cannonBarrelTop);
    const cannonBase = new Node({
      x: viewOrigin.x,
      y: viewOrigin.y
    });
    clipContainer.addChild(cannonBase);
    const cannonBaseBottom = new Image(cannonBaseBottom_png, {
      top: 0,
      centerX: 0
    });
    cannonBase.addChild(cannonBaseBottom);
    const cannonBaseTop = new Image(cannonBaseTop_png, {
      bottom: 0,
      centerX: 0
    });
    cannonBase.addChild(cannonBaseTop);
    const viewHeightLeaderLineX = transformProperty.value.modelToViewX(HEIGHT_LEADER_LINE_X);

    // add dashed line for indicating the height
    const heightLeaderLine = new Line(viewHeightLeaderLineX, viewOrigin.y, viewHeightLeaderLineX, transformProperty.value.modelToViewY(heightProperty.get()), {
      stroke: 'black',
      lineDash: [5, 5]
    });

    // added arrows for indicating height
    const heightLeaderArrows = new ArrowNode(viewHeightLeaderLineX, viewOrigin.y, viewHeightLeaderLineX, transformProperty.value.modelToViewY(heightProperty.get()), {
      headHeight: 5,
      headWidth: 5,
      tailWidth: 0,
      lineWidth: 0,
      doubleHead: true
    });

    // draw the line caps for the height leader line

    const heightLeaderLineTopCap = new Line(-6, 0, 6, 0, {
      stroke: 'black',
      lineWidth: 2
    });
    const heightLeaderLineBottomCap = new Line(-6, 0, 6, 0, {
      stroke: 'black',
      lineWidth: 2
    });
    heightLeaderLineBottomCap.x = heightLeaderArrows.tipX;
    heightLeaderLineBottomCap.y = viewOrigin.y;

    // height readout
    const heightLabelBackground = new Rectangle(0, 0, 0, 0, {
      fill: TRANSPARENT_WHITE
    });
    const heightLabelOptions = merge({
      pickable: true,
      maxWidth: 40 // empirically determined
    }, LABEL_OPTIONS);
    const heightLabelText = new Text(StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
      value: Utils.toFixedNumber(heightProperty.get(), 2),
      units: mString,
      tandem: options.tandem.createTandem('heightLabelText')
    }), heightLabelOptions);
    heightLabelText.setMouseArea(heightLabelText.bounds.dilatedXY(8, 10));
    heightLabelText.setTouchArea(heightLabelText.bounds.dilatedXY(10, 12));
    heightLabelText.centerX = heightLeaderArrows.tipX;

    // cueing arrow for dragging height
    const heightCueingTopArrow = new ArrowNode(0, -12, 0, -27, CUEING_ARROW_OPTIONS);
    const heightCueingBottomArrow = new ArrowNode(0, 17, 0, 32, CUEING_ARROW_OPTIONS);
    const heightCueingArrows = new Node({
      children: [heightCueingTopArrow, heightCueingBottomArrow]
    });
    heightCueingArrows.centerX = heightLeaderArrows.tipX;
    this.isIntroScreen = heightProperty.initialValue !== 0;
    this.heightCueingArrows = heightCueingArrows;

    // cueing arrow only visible on intro screen
    heightCueingArrows.visible = this.isIntroScreen;

    // angle indicator
    const angleIndicator = new Node();
    angleIndicator.x = viewOrigin.x; // centered at the origin, independent of the cylinder position

    // crosshair view
    const crosshairShape = new Shape().moveTo(-CROSSHAIR_LENGTH / 4, 0).lineTo(CROSSHAIR_LENGTH, 0).moveTo(0, -CROSSHAIR_LENGTH).lineTo(0, CROSSHAIR_LENGTH);
    const crosshair = new Path(crosshairShape, {
      stroke: 'gray'
    });
    angleIndicator.addChild(crosshair);
    const darkerCrosshairShape = new Shape().moveTo(-CROSSHAIR_LENGTH / 15, 0).lineTo(CROSSHAIR_LENGTH / 15, 0).moveTo(0, -CROSSHAIR_LENGTH / 15).lineTo(0, CROSSHAIR_LENGTH / 15);
    const darkerCrosshair = new Path(darkerCrosshairShape, {
      stroke: 'black',
      lineWidth: 3
    });
    angleIndicator.addChild(darkerCrosshair);

    // view for the angle arc
    const angleArc = new Path(null, {
      stroke: 'gray'
    });
    angleIndicator.addChild(angleArc);

    // angle readout
    const angleLabelBackground = new Rectangle(0, 0, 0, 0, {
      fill: TRANSPARENT_WHITE
    });
    angleIndicator.addChild(angleLabelBackground);
    const angleLabel = new Text(StringUtils.fillIn(pattern0Value1UnitsString, {
      value: Utils.toFixedNumber(angleProperty.get(), 2),
      units: DEGREES
    }), LABEL_OPTIONS);
    angleLabel.bottom = -5;
    angleLabel.left = CROSSHAIR_LENGTH * 2 / 3 + 10;
    angleIndicator.addChild(angleLabel);

    // muzzle flash

    // the flames are the shape of tear drops
    const tearDropShapeStrength = 3;
    const flameShape = new Shape();
    const radius = 100; // in view coordinates
    flameShape.moveTo(-radius, 0);
    let t;
    for (t = Math.PI / 24; t < 2 * Math.PI; t += Math.PI / 24) {
      const x = Math.cos(t) * radius;
      const y = Math.sin(t) * Math.pow(Math.sin(0.5 * t), tearDropShapeStrength) * radius;
      flameShape.lineTo(x, y);
    }
    flameShape.lineTo(-radius, 0);

    // create paths based on shape
    const outerFlame = new Path(flameShape, {
      fill: 'rgb( 255, 255, 0 )',
      stroke: null
    });
    const innerFlame = new Path(flameShape, {
      fill: 'rgb( 255, 200, 0 )',
      stroke: null
    });
    innerFlame.setScaleMagnitude(0.7);
    outerFlame.left = 0;
    innerFlame.left = 0;
    const muzzleFlash = new Node({
      opacity: 0,
      x: cannonBarrelTop.right,
      y: 0,
      children: [outerFlame, innerFlame]
    });
    cannonBarrel.addChild(muzzleFlash);
    this.muzzleFlashPlaying = false;
    this.muzzleFlashStage = 0; // 0 means animation starting, 1 means animation ended.

    // Listen to the muzzleFlashStepper to step the muzzle flash animation
    muzzleFlashStepper.addListener(dt => {
      if (this.muzzleFlashPlaying) {
        if (this.muzzleFlashStage < 1) {
          const animationPercentComplete = muzzleFlashDurationCompleteToAnimationPercentComplete(this.muzzleFlashStage);
          muzzleFlash.opacity = opacityLinearFunction.evaluate(animationPercentComplete);
          muzzleFlash.setScaleMagnitude(scaleLinearFunction.evaluate(animationPercentComplete));
          this.muzzleFlashStage += dt / MUZZLE_FLASH_DURATION;
        } else {
          muzzleFlash.opacity = MUZZLE_FLASH_OPACITY_FINAL;
          muzzleFlash.setScaleMagnitude(MUZZLE_FLASH_SCALE_FINAL);
          this.muzzleFlashPlaying = false;
        }
      }
    });

    // rendering order
    this.setChildren([groundCircle, clipContainer, heightLeaderLine, heightLeaderArrows, heightLeaderLineTopCap, heightLeaderLineBottomCap, heightLabelBackground, heightLabelText, heightCueingArrows, angleIndicator]);

    // Observe changes in model angle and update the cannon view
    angleProperty.link(angle => {
      cannonBarrel.setRotation(-angle * Math.PI / 180);
      const arcShape = angle > 0 ? Shape.arc(0, 0, CROSSHAIR_LENGTH * 2 / 3, 0, -angle * Math.PI / 180, true) : Shape.arc(0, 0, CROSSHAIR_LENGTH * 2 / 3, 0, -angle * Math.PI / 180);
      angleArc.setShape(arcShape);
      angleLabel.string = StringUtils.fillIn(pattern0Value1UnitsString, {
        value: Utils.toFixedNumber(angleProperty.get(), 2),
        units: DEGREES
      });
      angleLabelBackground.setRectWidth(angleLabel.width + 2);
      angleLabelBackground.setRectHeight(angleLabel.height);
      angleLabelBackground.center = angleLabel.center;
    });

    // starts at 1, but is updated by modelViewTransform.
    let scaleMagnitude = 1;

    // Function to transform everything to the right height
    const updateHeight = height => {
      const viewHeightPoint = Vector2.pool.create(0, transformProperty.value.modelToViewY(height));
      const heightInClipCoordinates = this.globalToLocalPoint(screenView.localToGlobalPoint(viewHeightPoint)).y;
      cannonBarrel.y = heightInClipCoordinates;
      cannonBase.y = heightInClipCoordinates;

      // The cannonBase and cylinder are siblings, so transform into the same coordinate frame.
      cylinderTop.y = cylinderNode.parentToLocalPoint(viewHeightPoint.setY(cannonBase.bottom)).y - ELLIPSE_HEIGHT / 4;
      viewHeightPoint.freeToPool();
      const sideShape = new Shape();
      sideShape.moveTo(-ELLIPSE_WIDTH / 2, 0).lineTo(-ELLIPSE_WIDTH / 2, cylinderTop.y).ellipticalArc(0, cylinderTop.y, ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, 0, Math.PI, 0, true).lineTo(ELLIPSE_WIDTH / 2, 0).ellipticalArc(0, 0, ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, 0, 0, Math.PI, false).close();
      cylinderSide.setShape(sideShape);
      const clipArea = new Shape();
      clipArea.moveTo(-ELLIPSE_WIDTH / 2, 0).lineTo(-ELLIPSE_WIDTH / 2, -ELLIPSE_WIDTH * 50) // high enough to include how high the cannon could be
      .lineTo(ELLIPSE_WIDTH * 2, -ELLIPSE_WIDTH * 50) // high enough to include how high the cannon could be
      .lineTo(ELLIPSE_WIDTH * 2, 0).lineTo(ELLIPSE_WIDTH / 2, 0).ellipticalArc(0, 0, ELLIPSE_WIDTH / 2, ELLIPSE_HEIGHT / 2, 0, 0, Math.PI, false).close();

      // this shape is made in the context of the cylinder, so transform it to match the cylinder's transform.
      // This doesn't need to happen ever again because the clipContainer is the parent to all Nodes that are updated on
      // layout change.
      clipContainer.setClipArea(clipArea.transformed(cylinderNode.matrix));
      heightLeaderArrows.setTailAndTip(heightLeaderArrows.tailX, heightLeaderArrows.tailY, heightLeaderArrows.tipX, transformProperty.value.modelToViewY(height));
      heightLeaderLine.setLine(heightLeaderArrows.tailX, heightLeaderArrows.tailY, heightLeaderArrows.tipX, heightLeaderArrows.tipY);
      heightLeaderLineTopCap.x = heightLeaderArrows.tipX;
      heightLeaderLineTopCap.y = heightLeaderArrows.tipY;
      heightLabelText.string = StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
        value: Utils.toFixedNumber(height, 2),
        units: mString
      });
      heightLabelText.centerX = heightLeaderArrows.tipX;
      heightLabelText.y = heightLeaderArrows.tipY - 5;
      heightLabelBackground.setRectWidth(heightLabelText.width + 2);
      heightLabelBackground.setRectHeight(heightLabelText.height);
      heightLabelBackground.center = heightLabelText.center;
      heightCueingArrows.y = heightLabelText.centerY;
      angleIndicator.y = transformProperty.value.modelToViewY(height);
    };

    // Observe changes in model height and update the cannon view
    heightProperty.link(height => {
      updateHeight(height);
      if (height < 4 && angleProperty.get() < ANGLE_RANGE_MINS[height]) {
        angleProperty.set(ANGLE_RANGE_MINS[height]);
      }
    });

    // Update the layout of cannon Nodes based on the current transform.
    const updateCannonLayout = () => {
      // Scale everything to be based on the cannon barrel.
      scaleMagnitude = transformProperty.value.modelToViewDeltaX(CANNON_LENGTH) / cannonBarrelTop.width;
      cylinderNode.setScaleMagnitude(scaleMagnitude);
      groundCircle.setScaleMagnitude(scaleMagnitude);
      cannonBarrel.setScaleMagnitude(scaleMagnitude);
      cannonBase.setScaleMagnitude(scaleMagnitude);

      // Transform the cylindrical Nodes over, because they are offset from the orgin.
      const newX = transformProperty.value.modelToViewX(CYLINDER_DISTANCE_FROM_ORIGIN);
      cylinderNode.x = newX;
      groundCircle.x = newX;
    };

    // Observe changes in modelviewtransform and update the view
    transformProperty.link(() => {
      updateCannonLayout();
      updateHeight(heightProperty.get());
    });

    // Links in CannonNode last for the lifetime of the sim, so they don't need to be disposed

    // variables used for drag listeners
    let startPoint;
    let startAngle;
    let startPointAngle;
    let mousePoint;
    let startHeight;

    // drag the tip of the cannon to change angle
    cannonBarrelTop.addInputListener(new DragListener({
      start: event => {
        startPoint = this.globalToLocalPoint(event.pointer.point);
        startAngle = angleProperty.get(); // degrees

        // find vector angles between mouse drag start and current points, to the base of the cannon
        startPointAngle = Vector2.pool.create(startPoint.x - cannonBase.x, startPoint.y - transformProperty.get().modelToViewY(heightProperty.get())).angle;
      },
      drag: event => {
        mousePoint = this.globalToLocalPoint(event.pointer.point);
        const mousePointAngle = Vector2.pool.create(mousePoint.x - cannonBase.x, mousePoint.y - transformProperty.get().modelToViewY(heightProperty.get())).angle;
        const angleChange = startPointAngle - mousePointAngle; // radians
        const angleChangeInDegrees = angleChange * 180 / Math.PI; // degrees

        const unboundedNewAngle = startAngle + angleChangeInDegrees;
        const angleRange = heightProperty.get() < 4 ? new Range(ANGLE_RANGE_MINS[heightProperty.get()], 90) : ANGLE_RANGE;

        // mouse dragged angle is within angle range
        if (angleRange.contains(unboundedNewAngle)) {
          const delta = providedOptions?.preciseCannonDelta ? 1 : 5;
          angleProperty.set(Utils.roundSymmetric(unboundedNewAngle / delta) * delta);
        }

        // the current, unchanged, angle is closer to max than min
        else if (angleRange.max + angleRange.min < 2 * angleProperty.get()) {
          angleProperty.set(angleRange.max);
        }

        // the current, unchanged, angle is closer or same distance to min than max
        else {
          angleProperty.set(angleRange.min);
        }
      },
      useInputListenerCursor: true,
      allowTouchSnag: true,
      tandem: options.tandem.createTandem('barrelTopDragListener'),
      phetioEnabledPropertyInstrumented: true
    }));

    // drag listener for controlling the height
    const heightDragListener = new DragListener({
      start: event => {
        startPoint = this.globalToLocalPoint(event.pointer.point);
        startHeight = transformProperty.value.modelToViewY(heightProperty.get()); // view units
      },

      drag: event => {
        mousePoint = this.globalToLocalPoint(event.pointer.point);
        const heightChange = mousePoint.y - startPoint.y;
        const unboundedNewHeight = transformProperty.get().viewToModelY(startHeight + heightChange);

        // mouse dragged height is within height range
        if (HEIGHT_RANGE.contains(unboundedNewHeight)) {
          heightProperty.set(Utils.roundSymmetric(unboundedNewHeight));
        }
        // the current, unchanged, height is closer to max than min
        else if (HEIGHT_RANGE.max + HEIGHT_RANGE.min < 2 * heightProperty.get()) {
          heightProperty.set(HEIGHT_RANGE.max);
        }
        // the current, unchanged, height is closer or same distance to min than max
        else {
          heightProperty.set(HEIGHT_RANGE.min);
        }
      },
      end: () => {
        heightCueingArrows.visible = false;
      },
      useInputListenerCursor: true,
      allowTouchSnag: true,
      tandem: options.tandem.createTandem('heightDragListener'),
      phetioEnabledPropertyInstrumented: true
    });

    // multiple parts of the cannon can be dragged to change height
    cannonBase.addInputListener(heightDragListener);
    cylinderSide.addInputListener(heightDragListener);
    cylinderTop.addInputListener(heightDragListener);
    cannonBarrelBase.addInputListener(heightDragListener);
    heightLabelText.addInputListener(heightDragListener);
    heightCueingArrows.addInputListener(heightDragListener);
    heightDragListener.enabledProperty.linkAttribute(heightCueingArrows, 'visible');
  }
  reset() {
    this.muzzleFlashStage = 1;
    this.heightCueingArrows.visible = this.isIntroScreen;
  }
  flashMuzzle() {
    this.muzzleFlashPlaying = true;
    this.muzzleFlashStage = 0;
  }
}
const muzzleFlashDurationCompleteToAnimationPercentComplete = timePercentComplete => {
  return -Math.pow(2, -10 * timePercentComplete) + 1; //easing out function
};

projectileMotion.register('CannonNode', CannonNode);
export default CannonNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIkxpbmVhckZ1bmN0aW9uIiwiU2hhcGUiLCJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiQXJyb3dOb2RlIiwiTWF0aFN5bWJvbHMiLCJDb2xvciIsIkRyYWdMaXN0ZW5lciIsIkltYWdlIiwiTGluZSIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVGFuZGVtIiwiY2Fubm9uQmFycmVsVG9wX3BuZyIsImNhbm5vbkJhcnJlbF9wbmciLCJjYW5ub25CYXNlQm90dG9tX3BuZyIsImNhbm5vbkJhc2VUb3BfcG5nIiwicHJvamVjdGlsZU1vdGlvbiIsIlByb2plY3RpbGVNb3Rpb25TdHJpbmdzIiwiUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyIsIm9wdGlvbml6ZSIsIm1TdHJpbmciLCJtIiwicGF0dGVybjBWYWx1ZTFVbml0c1N0cmluZyIsInBhdHRlcm4wVmFsdWUxVW5pdHMiLCJwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlU3RyaW5nIiwicGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZSIsIkNBTk5PTl9MRU5HVEgiLCJFTExJUFNFX1dJRFRIIiwiRUxMSVBTRV9IRUlHSFQiLCJDWUxJTkRFUl9ESVNUQU5DRV9GUk9NX09SSUdJTiIsIkhFSUdIVF9MRUFERVJfTElORV9YIiwiQ1JPU1NIQUlSX0xFTkdUSCIsIkFOR0xFX1JBTkdFIiwiQ0FOTk9OX0FOR0xFX1JBTkdFIiwiSEVJR0hUX1JBTkdFIiwiQ0FOTk9OX0hFSUdIVF9SQU5HRSIsIkxBQkVMX09QVElPTlMiLCJMQUJFTF9URVhUX09QVElPTlMiLCJCUklHSFRfR1JBWV9DT0xPUiIsIkRBUktfR1JBWV9DT0xPUiIsIlRSQU5TUEFSRU5UX1dISVRFIiwiQU5HTEVfUkFOR0VfTUlOUyIsIkNVRUlOR19BUlJPV19PUFRJT05TIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsInRhaWxXaWR0aCIsImhlYWRXaWR0aCIsImhlYWRIZWlnaHQiLCJNVVpaTEVfRkxBU0hfU0NBTEVfSU5JVElBTCIsIk1VWlpMRV9GTEFTSF9TQ0FMRV9GSU5BTCIsIk1VWlpMRV9GTEFTSF9PUEFDSVRZX0lOSVRJQUwiLCJNVVpaTEVfRkxBU0hfT1BBQ0lUWV9GSU5BTCIsIk1VWlpMRV9GTEFTSF9EVVJBVElPTiIsIkRFR1JFRVMiLCJvcGFjaXR5TGluZWFyRnVuY3Rpb24iLCJzY2FsZUxpbmVhckZ1bmN0aW9uIiwiQ2Fubm9uTm9kZSIsImNvbnN0cnVjdG9yIiwiaGVpZ2h0UHJvcGVydHkiLCJhbmdsZVByb3BlcnR5IiwibXV6emxlRmxhc2hTdGVwcGVyIiwidHJhbnNmb3JtUHJvcGVydHkiLCJzY3JlZW5WaWV3IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwidmlld09yaWdpbiIsInZhbHVlIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsImNsaXBDb250YWluZXIiLCJjeWxpbmRlck5vZGUiLCJ5IiwiYWRkQ2hpbGQiLCJlbGxpcHNlU2hhcGUiLCJlbGxpcHNlIiwiZ3JvdW5kRmlsbCIsImFkZENvbG9yU3RvcCIsImdyb3VuZENpcmNsZSIsInNpZGVGaWxsIiwiY3lsaW5kZXJTaWRlIiwiY3lsaW5kZXJUb3AiLCJjYW5ub25CYXJyZWwiLCJ4IiwiY2Fubm9uQmFycmVsVG9wIiwiY2VudGVyWSIsIm9wYWNpdHkiLCJjYW5ub25CYXJyZWxCYXNlIiwicmlnaHQiLCJjYW5ub25CYXNlIiwiY2Fubm9uQmFzZUJvdHRvbSIsInRvcCIsImNlbnRlclgiLCJjYW5ub25CYXNlVG9wIiwiYm90dG9tIiwidmlld0hlaWdodExlYWRlckxpbmVYIiwibW9kZWxUb1ZpZXdYIiwiaGVpZ2h0TGVhZGVyTGluZSIsIm1vZGVsVG9WaWV3WSIsImdldCIsImxpbmVEYXNoIiwiaGVpZ2h0TGVhZGVyQXJyb3dzIiwiZG91YmxlSGVhZCIsImhlaWdodExlYWRlckxpbmVUb3BDYXAiLCJoZWlnaHRMZWFkZXJMaW5lQm90dG9tQ2FwIiwidGlwWCIsImhlaWdodExhYmVsQmFja2dyb3VuZCIsImhlaWdodExhYmVsT3B0aW9ucyIsInBpY2thYmxlIiwibWF4V2lkdGgiLCJoZWlnaHRMYWJlbFRleHQiLCJmaWxsSW4iLCJ0b0ZpeGVkTnVtYmVyIiwidW5pdHMiLCJjcmVhdGVUYW5kZW0iLCJzZXRNb3VzZUFyZWEiLCJib3VuZHMiLCJkaWxhdGVkWFkiLCJzZXRUb3VjaEFyZWEiLCJoZWlnaHRDdWVpbmdUb3BBcnJvdyIsImhlaWdodEN1ZWluZ0JvdHRvbUFycm93IiwiaGVpZ2h0Q3VlaW5nQXJyb3dzIiwiY2hpbGRyZW4iLCJpc0ludHJvU2NyZWVuIiwiaW5pdGlhbFZhbHVlIiwidmlzaWJsZSIsImFuZ2xlSW5kaWNhdG9yIiwiY3Jvc3NoYWlyU2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjcm9zc2hhaXIiLCJkYXJrZXJDcm9zc2hhaXJTaGFwZSIsImRhcmtlckNyb3NzaGFpciIsImFuZ2xlQXJjIiwiYW5nbGVMYWJlbEJhY2tncm91bmQiLCJhbmdsZUxhYmVsIiwibGVmdCIsInRlYXJEcm9wU2hhcGVTdHJlbmd0aCIsImZsYW1lU2hhcGUiLCJyYWRpdXMiLCJ0IiwiTWF0aCIsIlBJIiwiY29zIiwic2luIiwicG93Iiwib3V0ZXJGbGFtZSIsImlubmVyRmxhbWUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsIm11enpsZUZsYXNoIiwibXV6emxlRmxhc2hQbGF5aW5nIiwibXV6emxlRmxhc2hTdGFnZSIsImFkZExpc3RlbmVyIiwiZHQiLCJhbmltYXRpb25QZXJjZW50Q29tcGxldGUiLCJtdXp6bGVGbGFzaER1cmF0aW9uQ29tcGxldGVUb0FuaW1hdGlvblBlcmNlbnRDb21wbGV0ZSIsImV2YWx1YXRlIiwic2V0Q2hpbGRyZW4iLCJsaW5rIiwiYW5nbGUiLCJzZXRSb3RhdGlvbiIsImFyY1NoYXBlIiwiYXJjIiwic2V0U2hhcGUiLCJzdHJpbmciLCJzZXRSZWN0V2lkdGgiLCJ3aWR0aCIsInNldFJlY3RIZWlnaHQiLCJoZWlnaHQiLCJjZW50ZXIiLCJzY2FsZU1hZ25pdHVkZSIsInVwZGF0ZUhlaWdodCIsInZpZXdIZWlnaHRQb2ludCIsInBvb2wiLCJjcmVhdGUiLCJoZWlnaHRJbkNsaXBDb29yZGluYXRlcyIsImdsb2JhbFRvTG9jYWxQb2ludCIsImxvY2FsVG9HbG9iYWxQb2ludCIsInBhcmVudFRvTG9jYWxQb2ludCIsInNldFkiLCJmcmVlVG9Qb29sIiwic2lkZVNoYXBlIiwiZWxsaXB0aWNhbEFyYyIsImNsb3NlIiwiY2xpcEFyZWEiLCJzZXRDbGlwQXJlYSIsInRyYW5zZm9ybWVkIiwibWF0cml4Iiwic2V0VGFpbEFuZFRpcCIsInRhaWxYIiwidGFpbFkiLCJzZXRMaW5lIiwidGlwWSIsInNldCIsInVwZGF0ZUNhbm5vbkxheW91dCIsIm1vZGVsVG9WaWV3RGVsdGFYIiwibmV3WCIsInN0YXJ0UG9pbnQiLCJzdGFydEFuZ2xlIiwic3RhcnRQb2ludEFuZ2xlIiwibW91c2VQb2ludCIsInN0YXJ0SGVpZ2h0IiwiYWRkSW5wdXRMaXN0ZW5lciIsInN0YXJ0IiwiZXZlbnQiLCJwb2ludGVyIiwicG9pbnQiLCJkcmFnIiwibW91c2VQb2ludEFuZ2xlIiwiYW5nbGVDaGFuZ2UiLCJhbmdsZUNoYW5nZUluRGVncmVlcyIsInVuYm91bmRlZE5ld0FuZ2xlIiwiYW5nbGVSYW5nZSIsImNvbnRhaW5zIiwiZGVsdGEiLCJwcmVjaXNlQ2Fubm9uRGVsdGEiLCJyb3VuZFN5bW1ldHJpYyIsIm1heCIsIm1pbiIsInVzZUlucHV0TGlzdGVuZXJDdXJzb3IiLCJhbGxvd1RvdWNoU25hZyIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImhlaWdodERyYWdMaXN0ZW5lciIsImhlaWdodENoYW5nZSIsInVuYm91bmRlZE5ld0hlaWdodCIsInZpZXdUb01vZGVsWSIsImVuZCIsImVuYWJsZWRQcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJyZXNldCIsImZsYXNoTXV6emxlIiwidGltZVBlcmNlbnRDb21wbGV0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2Fubm9uTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDYW5ub24gdmlldy5cclxuICogQW5nbGUgY2FuIGNoYW5nZSB3aGVuIHVzZXIgZHJhZ3MgdGhlIGNhbm5vbiB0aXAuIEhlaWdodCBjYW4gY2hhbmdlIHdoZW4gdXNlciBkcmFncyBjYW5ub24gYmFzZS5cclxuICpcclxuICogQGF1dGhvciBBbmRyZWEgTGluIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgRHJhZ0xpc3RlbmVyLCBJbWFnZSwgTGluZSwgTGluZWFyR3JhZGllbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgY2Fubm9uQmFycmVsVG9wX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY2Fubm9uQmFycmVsVG9wX3BuZy5qcyc7XHJcbmltcG9ydCBjYW5ub25CYXJyZWxfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvY2Fubm9uQmFycmVsX3BuZy5qcyc7XHJcbmltcG9ydCBjYW5ub25CYXNlQm90dG9tX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL2Nhbm5vbkJhc2VCb3R0b21fcG5nLmpzJztcclxuaW1wb3J0IGNhbm5vbkJhc2VUb3BfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvY2Fubm9uQmFzZVRvcF9wbmcuanMnO1xyXG5pbXBvcnQgcHJvamVjdGlsZU1vdGlvbiBmcm9tICcuLi8uLi9wcm9qZWN0aWxlTW90aW9uLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzIGZyb20gJy4uLy4uL1Byb2plY3RpbGVNb3Rpb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMgZnJvbSAnLi4vUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuXHJcbi8vIGltYWdlXHJcblxyXG5jb25zdCBtU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MubTtcclxuY29uc3QgcGF0dGVybjBWYWx1ZTFVbml0c1N0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLnBhdHRlcm4wVmFsdWUxVW5pdHM7XHJcbmNvbnN0IHBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5wYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENBTk5PTl9MRU5HVEggPSA0OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIGluIG1vZGVsIGNvb3Jkc1xyXG5jb25zdCBFTExJUFNFX1dJRFRIID0gNDIwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuY29uc3QgRUxMSVBTRV9IRUlHSFQgPSA0MDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbmNvbnN0IENZTElOREVSX0RJU1RBTkNFX0ZST01fT1JJR0lOID0gMS4zOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIGluIG1vZGVsIGNvb3JkcyBhcyBpdCBuZWVkcyB0byB1cGRhdGUgZWFjaCB0aW1lIHRoZSBtdnQgY2hhbmdlc1xyXG5jb25zdCBIRUlHSFRfTEVBREVSX0xJTkVfWCA9IC0xLjU7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgaW4gdmlldyBjb29yZHNcclxuY29uc3QgQ1JPU1NIQUlSX0xFTkdUSCA9IDEyMDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBpbiB2aWV3IGNvb3Jkc1xyXG5jb25zdCBBTkdMRV9SQU5HRSA9IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuQ0FOTk9OX0FOR0xFX1JBTkdFO1xyXG5jb25zdCBIRUlHSFRfUkFOR0UgPSBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLkNBTk5PTl9IRUlHSFRfUkFOR0U7XHJcbmNvbnN0IExBQkVMX09QVElPTlMgPSBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLkxBQkVMX1RFWFRfT1BUSU9OUztcclxuY29uc3QgQlJJR0hUX0dSQVlfQ09MT1IgPSBuZXcgQ29sb3IoIDIzMCwgMjMwLCAyMzAsIDEgKTtcclxuY29uc3QgREFSS19HUkFZX0NPTE9SID0gbmV3IENvbG9yKCAxMDMsIDEwMywgMTAzLCAxICk7XHJcbmNvbnN0IFRSQU5TUEFSRU5UX1dISVRFID0gJ3JnYmEoIDI1NSwgMjU1LCAyNTUsIDAuNiApJztcclxuY29uc3QgQU5HTEVfUkFOR0VfTUlOUyA9IFsgNSwgLTUsIC0yMCwgLTQwIF07IC8vIGFuZ2xlIHJhbmdlIG1pbmltdW1zLCBjb3JyZXNwb25kaW5nIHRvIGhlaWdodCB0aHJvdWdoIHRoZWlyIGluZGV4XHJcbmNvbnN0IENVRUlOR19BUlJPV19PUFRJT05TID0ge1xyXG4gIGZpbGw6ICdyZ2IoIDEwMCwgMjAwLCAyNTUgKScsXHJcbiAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gIGxpbmVXaWR0aDogMSxcclxuICB0YWlsV2lkdGg6IDgsXHJcbiAgaGVhZFdpZHRoOiAxNCxcclxuICBoZWFkSGVpZ2h0OiA2XHJcbn07XHJcblxyXG5jb25zdCBNVVpaTEVfRkxBU0hfU0NBTEVfSU5JVElBTCA9IDAuNDtcclxuY29uc3QgTVVaWkxFX0ZMQVNIX1NDQUxFX0ZJTkFMID0gMS41O1xyXG5jb25zdCBNVVpaTEVfRkxBU0hfT1BBQ0lUWV9JTklUSUFMID0gMTtcclxuY29uc3QgTVVaWkxFX0ZMQVNIX09QQUNJVFlfRklOQUwgPSAwO1xyXG5jb25zdCBNVVpaTEVfRkxBU0hfRFVSQVRJT04gPSAwLjQ7IC8vc2Vjb25kc1xyXG5cclxuY29uc3QgREVHUkVFUyA9IE1hdGhTeW1ib2xzLkRFR1JFRVM7XHJcblxyXG5jb25zdCBvcGFjaXR5TGluZWFyRnVuY3Rpb24gPSBuZXcgTGluZWFyRnVuY3Rpb24oIDAsIDEsIE1VWlpMRV9GTEFTSF9PUEFDSVRZX0lOSVRJQUwsIE1VWlpMRV9GTEFTSF9PUEFDSVRZX0ZJTkFMICk7XHJcbmNvbnN0IHNjYWxlTGluZWFyRnVuY3Rpb24gPSBuZXcgTGluZWFyRnVuY3Rpb24oIDAsIDEsIE1VWlpMRV9GTEFTSF9TQ0FMRV9JTklUSUFMLCBNVVpaTEVfRkxBU0hfU0NBTEVfRklOQUwgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcmVuZGVyZXI6IHN0cmluZyB8IG51bGw7XHJcbiAgcHJlY2lzZUNhbm5vbkRlbHRhOiBib29sZWFuO1xyXG4gIHRhbmRlbT86IFRhbmRlbTtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIENhbm5vbk5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcclxuXHJcbmNsYXNzIENhbm5vbk5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICBwcml2YXRlIGlzSW50cm9TY3JlZW46IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBoZWlnaHRDdWVpbmdBcnJvd3M6IE5vZGU7XHJcbiAgcHJpdmF0ZSBtdXp6bGVGbGFzaFBsYXlpbmc6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBtdXp6bGVGbGFzaFN0YWdlOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaGVpZ2h0UHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIGFuZ2xlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIG11enpsZUZsYXNoU3RlcHBlcjogRW1pdHRlcjxudW1iZXJbXT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1Qcm9wZXJ0eTogUHJvcGVydHk8TW9kZWxWaWV3VHJhbnNmb3JtMj4sIHNjcmVlblZpZXc6IFNjcmVlblZpZXcsIHByb3ZpZGVkT3B0aW9ucz86IENhbm5vbk5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q2Fubm9uTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB3aGVyZSB0aGUgcHJvamVjdGlsZSBpcyBmaXJlZCBmcm9tXHJcbiAgICBjb25zdCB2aWV3T3JpZ2luID0gdHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdQb3NpdGlvbiggbmV3IFZlY3RvcjIoIDAsIDAgKSApO1xyXG5cclxuICAgIC8vIHRoZSBjYW5ub24sIG11enpsZSBmbGFzaCwgYW5kIHBlZGVzdGFsIGFyZSBub3QgdmlzaWJsZSB1bmRlcmdyb3VuZFxyXG4gICAgY29uc3QgY2xpcENvbnRhaW5lciA9IG5ldyBOb2RlKCk7IC8vIG5vIHRyYW5zZm9ybSwganVzdCBmb3IgY2xpcCBhcmVhXHJcblxyXG4gICAgY29uc3QgY3lsaW5kZXJOb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgeTogdmlld09yaWdpbi55XHJcbiAgICB9ICk7XHJcbiAgICBjbGlwQ29udGFpbmVyLmFkZENoaWxkKCBjeWxpbmRlck5vZGUgKTtcclxuXHJcbiAgICAvLyBzaGFwZSB1c2VkIGZvciBncm91bmQgY2lyY2xlIGFuZCB0b3Agb2YgcGVkZXN0YWxcclxuICAgIGNvbnN0IGVsbGlwc2VTaGFwZSA9IFNoYXBlLmVsbGlwc2UoIDAsIDAsIEVMTElQU0VfV0lEVEggLyAyLCBFTExJUFNFX0hFSUdIVCAvIDIsIDAgKTtcclxuXHJcbiAgICAvLyBncm91bmQgY2lyY2xlLCB3aGljaCBzaG93cyB0aGUgXCJpbnNpZGVcIiBvZiB0aGUgY2lyY3VsYXIgaG9sZSB0aGF0IHRoZSBjYW5ub24gaXMgc2l0dGluZyBpblxyXG4gICAgY29uc3QgZ3JvdW5kRmlsbCA9IG5ldyBMaW5lYXJHcmFkaWVudCggLUVMTElQU0VfV0lEVEggLyAyLCAwLCBFTExJUFNFX1dJRFRIIC8gMiwgMCApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAuMCwgJ2dyYXknIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMC4zLCAnd2hpdGUnIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMSwgJ2dyYXknICk7XHJcbiAgICBjb25zdCBncm91bmRDaXJjbGUgPSBuZXcgUGF0aCggZWxsaXBzZVNoYXBlLCB7XHJcbiAgICAgIHk6IHZpZXdPcmlnaW4ueSxcclxuICAgICAgZmlsbDogZ3JvdW5kRmlsbCxcclxuICAgICAgc3Ryb2tlOiBCUklHSFRfR1JBWV9DT0xPUlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNpZGUgb2YgdGhlIGN5bGluZGVyXHJcbiAgICBjb25zdCBzaWRlRmlsbCA9IG5ldyBMaW5lYXJHcmFkaWVudCggLUVMTElQU0VfV0lEVEggLyAyLCAwLCBFTExJUFNFX1dJRFRIIC8gMiwgMCApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAuMCwgREFSS19HUkFZX0NPTE9SIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMC4zLCBCUklHSFRfR1JBWV9DT0xPUiApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDEsIERBUktfR1JBWV9DT0xPUiApO1xyXG4gICAgY29uc3QgY3lsaW5kZXJTaWRlID0gbmV3IFBhdGgoIG51bGwsIHsgZmlsbDogc2lkZUZpbGwsIHN0cm9rZTogQlJJR0hUX0dSQVlfQ09MT1IgfSApO1xyXG4gICAgY3lsaW5kZXJOb2RlLmFkZENoaWxkKCBjeWxpbmRlclNpZGUgKTtcclxuXHJcbiAgICAvLyB0b3Agb2YgdGhlIGN5bGluZGVyXHJcbiAgICBjb25zdCBjeWxpbmRlclRvcCA9IG5ldyBQYXRoKCBlbGxpcHNlU2hhcGUsIHsgZmlsbDogREFSS19HUkFZX0NPTE9SLCBzdHJva2U6IEJSSUdIVF9HUkFZX0NPTE9SIH0gKTtcclxuICAgIGN5bGluZGVyTm9kZS5hZGRDaGlsZCggY3lsaW5kZXJUb3AgKTtcclxuXHJcbiAgICAvLyBjYW5ub25cclxuICAgIGNvbnN0IGNhbm5vbkJhcnJlbCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHg6IHZpZXdPcmlnaW4ueCxcclxuICAgICAgeTogdmlld09yaWdpbi55XHJcbiAgICB9ICk7XHJcbiAgICBjbGlwQ29udGFpbmVyLmFkZENoaWxkKCBjYW5ub25CYXJyZWwgKTtcclxuXHJcbiAgICAvLyBBIGNvcHkgb2YgdGhlIHRvcCBwYXJ0IG9mIHRoZSBjYW5ub24gYmFycmVsIHRvIDEpIGdyYWIgYW5kIGNoYW5nZSBhbmdsZSBhbmQgMikgbGF5b3V0IHRoZSBjYW5ub25CYXJyZWxcclxuICAgIGNvbnN0IGNhbm5vbkJhcnJlbFRvcCA9IG5ldyBJbWFnZSggY2Fubm9uQmFycmVsVG9wX3BuZywgeyBjZW50ZXJZOiAwLCBvcGFjaXR5OiAwIH0gKTtcclxuICAgIGNvbnN0IGNhbm5vbkJhcnJlbEJhc2UgPSBuZXcgSW1hZ2UoIGNhbm5vbkJhcnJlbF9wbmcsIHsgY2VudGVyWTogMCwgcmlnaHQ6IGNhbm5vbkJhcnJlbFRvcC5yaWdodCB9ICk7XHJcblxyXG4gICAgY2Fubm9uQmFycmVsLmFkZENoaWxkKCBjYW5ub25CYXJyZWxCYXNlICk7XHJcbiAgICBjYW5ub25CYXJyZWwuYWRkQ2hpbGQoIGNhbm5vbkJhcnJlbFRvcCApO1xyXG5cclxuICAgIGNvbnN0IGNhbm5vbkJhc2UgPSBuZXcgTm9kZSgge1xyXG4gICAgICB4OiB2aWV3T3JpZ2luLngsXHJcbiAgICAgIHk6IHZpZXdPcmlnaW4ueVxyXG4gICAgfSApO1xyXG4gICAgY2xpcENvbnRhaW5lci5hZGRDaGlsZCggY2Fubm9uQmFzZSApO1xyXG5cclxuICAgIGNvbnN0IGNhbm5vbkJhc2VCb3R0b20gPSBuZXcgSW1hZ2UoIGNhbm5vbkJhc2VCb3R0b21fcG5nLCB7IHRvcDogMCwgY2VudGVyWDogMCB9ICk7XHJcbiAgICBjYW5ub25CYXNlLmFkZENoaWxkKCBjYW5ub25CYXNlQm90dG9tICk7XHJcbiAgICBjb25zdCBjYW5ub25CYXNlVG9wID0gbmV3IEltYWdlKCBjYW5ub25CYXNlVG9wX3BuZywgeyBib3R0b206IDAsIGNlbnRlclg6IDAgfSApO1xyXG4gICAgY2Fubm9uQmFzZS5hZGRDaGlsZCggY2Fubm9uQmFzZVRvcCApO1xyXG5cclxuICAgIGNvbnN0IHZpZXdIZWlnaHRMZWFkZXJMaW5lWCA9IHRyYW5zZm9ybVByb3BlcnR5LnZhbHVlLm1vZGVsVG9WaWV3WCggSEVJR0hUX0xFQURFUl9MSU5FX1ggKTtcclxuXHJcbiAgICAvLyBhZGQgZGFzaGVkIGxpbmUgZm9yIGluZGljYXRpbmcgdGhlIGhlaWdodFxyXG4gICAgY29uc3QgaGVpZ2h0TGVhZGVyTGluZSA9IG5ldyBMaW5lKFxyXG4gICAgICB2aWV3SGVpZ2h0TGVhZGVyTGluZVgsXHJcbiAgICAgIHZpZXdPcmlnaW4ueSxcclxuICAgICAgdmlld0hlaWdodExlYWRlckxpbmVYLFxyXG4gICAgICB0cmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld1koIGhlaWdodFByb3BlcnR5LmdldCgpICksIHtcclxuICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgbGluZURhc2g6IFsgNSwgNSBdXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gYWRkZWQgYXJyb3dzIGZvciBpbmRpY2F0aW5nIGhlaWdodFxyXG4gICAgY29uc3QgaGVpZ2h0TGVhZGVyQXJyb3dzID0gbmV3IEFycm93Tm9kZShcclxuICAgICAgdmlld0hlaWdodExlYWRlckxpbmVYLFxyXG4gICAgICB2aWV3T3JpZ2luLnksXHJcbiAgICAgIHZpZXdIZWlnaHRMZWFkZXJMaW5lWCxcclxuICAgICAgdHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdZKCBoZWlnaHRQcm9wZXJ0eS5nZXQoKSApLCB7XHJcbiAgICAgICAgaGVhZEhlaWdodDogNSxcclxuICAgICAgICBoZWFkV2lkdGg6IDUsXHJcbiAgICAgICAgdGFpbFdpZHRoOiAwLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMCxcclxuICAgICAgICBkb3VibGVIZWFkOiB0cnVlXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gZHJhdyB0aGUgbGluZSBjYXBzIGZvciB0aGUgaGVpZ2h0IGxlYWRlciBsaW5lXHJcblxyXG4gICAgY29uc3QgaGVpZ2h0TGVhZGVyTGluZVRvcENhcCA9IG5ldyBMaW5lKCAtNiwgMCwgNiwgMCwge1xyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGhlaWdodExlYWRlckxpbmVCb3R0b21DYXAgPSBuZXcgTGluZSggLTYsIDAsIDYsIDAsIHtcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDJcclxuICAgIH0gKTtcclxuICAgIGhlaWdodExlYWRlckxpbmVCb3R0b21DYXAueCA9IGhlaWdodExlYWRlckFycm93cy50aXBYO1xyXG4gICAgaGVpZ2h0TGVhZGVyTGluZUJvdHRvbUNhcC55ID0gdmlld09yaWdpbi55O1xyXG5cclxuICAgIC8vIGhlaWdodCByZWFkb3V0XHJcbiAgICBjb25zdCBoZWlnaHRMYWJlbEJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAwLCAwLCB7IGZpbGw6IFRSQU5TUEFSRU5UX1dISVRFIH0gKTtcclxuICAgIGNvbnN0IGhlaWdodExhYmVsT3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHBpY2thYmxlOiB0cnVlLFxyXG4gICAgICBtYXhXaWR0aDogNDAgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgfSwgTEFCRUxfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgaGVpZ2h0TGFiZWxUZXh0ID0gbmV3IFRleHQoIFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZywge1xyXG4gICAgICB2YWx1ZTogVXRpbHMudG9GaXhlZE51bWJlciggaGVpZ2h0UHJvcGVydHkuZ2V0KCksIDIgKSxcclxuICAgICAgdW5pdHM6IG1TdHJpbmcsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGVpZ2h0TGFiZWxUZXh0JyApXHJcbiAgICB9ICksIGhlaWdodExhYmVsT3B0aW9ucyApO1xyXG4gICAgaGVpZ2h0TGFiZWxUZXh0LnNldE1vdXNlQXJlYSggaGVpZ2h0TGFiZWxUZXh0LmJvdW5kcy5kaWxhdGVkWFkoIDgsIDEwICkgKTtcclxuICAgIGhlaWdodExhYmVsVGV4dC5zZXRUb3VjaEFyZWEoIGhlaWdodExhYmVsVGV4dC5ib3VuZHMuZGlsYXRlZFhZKCAxMCwgMTIgKSApO1xyXG4gICAgaGVpZ2h0TGFiZWxUZXh0LmNlbnRlclggPSBoZWlnaHRMZWFkZXJBcnJvd3MudGlwWDtcclxuXHJcbiAgICAvLyBjdWVpbmcgYXJyb3cgZm9yIGRyYWdnaW5nIGhlaWdodFxyXG4gICAgY29uc3QgaGVpZ2h0Q3VlaW5nVG9wQXJyb3cgPSBuZXcgQXJyb3dOb2RlKCAwLCAtMTIsIDAsIC0yNywgQ1VFSU5HX0FSUk9XX09QVElPTlMgKTtcclxuICAgIGNvbnN0IGhlaWdodEN1ZWluZ0JvdHRvbUFycm93ID0gbmV3IEFycm93Tm9kZSggMCwgMTcsIDAsIDMyLCBDVUVJTkdfQVJST1dfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgaGVpZ2h0Q3VlaW5nQXJyb3dzID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgaGVpZ2h0Q3VlaW5nVG9wQXJyb3csIGhlaWdodEN1ZWluZ0JvdHRvbUFycm93IF0gfSApO1xyXG4gICAgaGVpZ2h0Q3VlaW5nQXJyb3dzLmNlbnRlclggPSBoZWlnaHRMZWFkZXJBcnJvd3MudGlwWDtcclxuXHJcbiAgICB0aGlzLmlzSW50cm9TY3JlZW4gPSAoIGhlaWdodFByb3BlcnR5LmluaXRpYWxWYWx1ZSAhPT0gMCApO1xyXG4gICAgdGhpcy5oZWlnaHRDdWVpbmdBcnJvd3MgPSBoZWlnaHRDdWVpbmdBcnJvd3M7XHJcblxyXG4gICAgLy8gY3VlaW5nIGFycm93IG9ubHkgdmlzaWJsZSBvbiBpbnRybyBzY3JlZW5cclxuICAgIGhlaWdodEN1ZWluZ0Fycm93cy52aXNpYmxlID0gdGhpcy5pc0ludHJvU2NyZWVuO1xyXG5cclxuICAgIC8vIGFuZ2xlIGluZGljYXRvclxyXG4gICAgY29uc3QgYW5nbGVJbmRpY2F0b3IgPSBuZXcgTm9kZSgpO1xyXG4gICAgYW5nbGVJbmRpY2F0b3IueCA9IHZpZXdPcmlnaW4ueDsgLy8gY2VudGVyZWQgYXQgdGhlIG9yaWdpbiwgaW5kZXBlbmRlbnQgb2YgdGhlIGN5bGluZGVyIHBvc2l0aW9uXHJcblxyXG4gICAgLy8gY3Jvc3NoYWlyIHZpZXdcclxuICAgIGNvbnN0IGNyb3NzaGFpclNoYXBlID0gbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggLUNST1NTSEFJUl9MRU5HVEggLyA0LCAwIClcclxuICAgICAgLmxpbmVUbyggQ1JPU1NIQUlSX0xFTkdUSCwgMCApXHJcbiAgICAgIC5tb3ZlVG8oIDAsIC1DUk9TU0hBSVJfTEVOR1RIIClcclxuICAgICAgLmxpbmVUbyggMCwgQ1JPU1NIQUlSX0xFTkdUSCApO1xyXG5cclxuICAgIGNvbnN0IGNyb3NzaGFpciA9IG5ldyBQYXRoKCBjcm9zc2hhaXJTaGFwZSwgeyBzdHJva2U6ICdncmF5JyB9ICk7XHJcbiAgICBhbmdsZUluZGljYXRvci5hZGRDaGlsZCggY3Jvc3NoYWlyICk7XHJcblxyXG4gICAgY29uc3QgZGFya2VyQ3Jvc3NoYWlyU2hhcGUgPSBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvKCAtQ1JPU1NIQUlSX0xFTkdUSCAvIDE1LCAwIClcclxuICAgICAgLmxpbmVUbyggQ1JPU1NIQUlSX0xFTkdUSCAvIDE1LCAwIClcclxuICAgICAgLm1vdmVUbyggMCwgLUNST1NTSEFJUl9MRU5HVEggLyAxNSApXHJcbiAgICAgIC5saW5lVG8oIDAsIENST1NTSEFJUl9MRU5HVEggLyAxNSApO1xyXG5cclxuICAgIGNvbnN0IGRhcmtlckNyb3NzaGFpciA9IG5ldyBQYXRoKCBkYXJrZXJDcm9zc2hhaXJTaGFwZSwgeyBzdHJva2U6ICdibGFjaycsIGxpbmVXaWR0aDogMyB9ICk7XHJcbiAgICBhbmdsZUluZGljYXRvci5hZGRDaGlsZCggZGFya2VyQ3Jvc3NoYWlyICk7XHJcblxyXG4gICAgLy8gdmlldyBmb3IgdGhlIGFuZ2xlIGFyY1xyXG4gICAgY29uc3QgYW5nbGVBcmMgPSBuZXcgUGF0aCggbnVsbCwgeyBzdHJva2U6ICdncmF5JyB9ICk7XHJcbiAgICBhbmdsZUluZGljYXRvci5hZGRDaGlsZCggYW5nbGVBcmMgKTtcclxuXHJcbiAgICAvLyBhbmdsZSByZWFkb3V0XHJcbiAgICBjb25zdCBhbmdsZUxhYmVsQmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDAsIDAsIHsgZmlsbDogVFJBTlNQQVJFTlRfV0hJVEUgfSApO1xyXG4gICAgYW5nbGVJbmRpY2F0b3IuYWRkQ2hpbGQoIGFuZ2xlTGFiZWxCYWNrZ3JvdW5kICk7XHJcbiAgICBjb25zdCBhbmdsZUxhYmVsID0gbmV3IFRleHQoIFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybjBWYWx1ZTFVbml0c1N0cmluZywge1xyXG4gICAgICB2YWx1ZTogVXRpbHMudG9GaXhlZE51bWJlciggYW5nbGVQcm9wZXJ0eS5nZXQoKSwgMiApLFxyXG4gICAgICB1bml0czogREVHUkVFU1xyXG4gICAgfSApLCBMQUJFTF9PUFRJT05TICk7XHJcbiAgICBhbmdsZUxhYmVsLmJvdHRvbSA9IC01O1xyXG4gICAgYW5nbGVMYWJlbC5sZWZ0ID0gQ1JPU1NIQUlSX0xFTkdUSCAqIDIgLyAzICsgMTA7XHJcbiAgICBhbmdsZUluZGljYXRvci5hZGRDaGlsZCggYW5nbGVMYWJlbCApO1xyXG5cclxuICAgIC8vIG11enpsZSBmbGFzaFxyXG5cclxuICAgIC8vIHRoZSBmbGFtZXMgYXJlIHRoZSBzaGFwZSBvZiB0ZWFyIGRyb3BzXHJcbiAgICBjb25zdCB0ZWFyRHJvcFNoYXBlU3RyZW5ndGggPSAzO1xyXG4gICAgY29uc3QgZmxhbWVTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgY29uc3QgcmFkaXVzID0gMTAwOyAvLyBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgICBmbGFtZVNoYXBlLm1vdmVUbyggLXJhZGl1cywgMCApO1xyXG4gICAgbGV0IHQ7XHJcbiAgICBmb3IgKCB0ID0gTWF0aC5QSSAvIDI0OyB0IDwgMiAqIE1hdGguUEk7IHQgKz0gTWF0aC5QSSAvIDI0ICkge1xyXG4gICAgICBjb25zdCB4ID0gTWF0aC5jb3MoIHQgKSAqIHJhZGl1cztcclxuICAgICAgY29uc3QgeSA9IE1hdGguc2luKCB0ICkgKiBNYXRoLnBvdyggTWF0aC5zaW4oIDAuNSAqIHQgKSwgdGVhckRyb3BTaGFwZVN0cmVuZ3RoICkgKiByYWRpdXM7XHJcbiAgICAgIGZsYW1lU2hhcGUubGluZVRvKCB4LCB5ICk7XHJcbiAgICB9XHJcbiAgICBmbGFtZVNoYXBlLmxpbmVUbyggLXJhZGl1cywgMCApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBwYXRocyBiYXNlZCBvbiBzaGFwZVxyXG4gICAgY29uc3Qgb3V0ZXJGbGFtZSA9IG5ldyBQYXRoKCBmbGFtZVNoYXBlLCB7IGZpbGw6ICdyZ2IoIDI1NSwgMjU1LCAwICknLCBzdHJva2U6IG51bGwgfSApO1xyXG4gICAgY29uc3QgaW5uZXJGbGFtZSA9IG5ldyBQYXRoKCBmbGFtZVNoYXBlLCB7IGZpbGw6ICdyZ2IoIDI1NSwgMjAwLCAwICknLCBzdHJva2U6IG51bGwgfSApO1xyXG4gICAgaW5uZXJGbGFtZS5zZXRTY2FsZU1hZ25pdHVkZSggMC43ICk7XHJcbiAgICBvdXRlckZsYW1lLmxlZnQgPSAwO1xyXG4gICAgaW5uZXJGbGFtZS5sZWZ0ID0gMDtcclxuICAgIGNvbnN0IG11enpsZUZsYXNoID0gbmV3IE5vZGUoIHtcclxuICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgeDogY2Fubm9uQmFycmVsVG9wLnJpZ2h0LFxyXG4gICAgICB5OiAwLFxyXG4gICAgICBjaGlsZHJlbjogWyBvdXRlckZsYW1lLCBpbm5lckZsYW1lIF1cclxuICAgIH0gKTtcclxuICAgIGNhbm5vbkJhcnJlbC5hZGRDaGlsZCggbXV6emxlRmxhc2ggKTtcclxuXHJcbiAgICB0aGlzLm11enpsZUZsYXNoUGxheWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5tdXp6bGVGbGFzaFN0YWdlID0gMDsgLy8gMCBtZWFucyBhbmltYXRpb24gc3RhcnRpbmcsIDEgbWVhbnMgYW5pbWF0aW9uIGVuZGVkLlxyXG5cclxuICAgIC8vIExpc3RlbiB0byB0aGUgbXV6emxlRmxhc2hTdGVwcGVyIHRvIHN0ZXAgdGhlIG11enpsZSBmbGFzaCBhbmltYXRpb25cclxuICAgIG11enpsZUZsYXNoU3RlcHBlci5hZGRMaXN0ZW5lciggKCBkdDogbnVtYmVyICk6IHZvaWQgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMubXV6emxlRmxhc2hQbGF5aW5nICkge1xyXG4gICAgICAgIGlmICggdGhpcy5tdXp6bGVGbGFzaFN0YWdlIDwgMSApIHtcclxuICAgICAgICAgIGNvbnN0IGFuaW1hdGlvblBlcmNlbnRDb21wbGV0ZSA9IG11enpsZUZsYXNoRHVyYXRpb25Db21wbGV0ZVRvQW5pbWF0aW9uUGVyY2VudENvbXBsZXRlKCB0aGlzLm11enpsZUZsYXNoU3RhZ2UgKTtcclxuICAgICAgICAgIG11enpsZUZsYXNoLm9wYWNpdHkgPSBvcGFjaXR5TGluZWFyRnVuY3Rpb24uZXZhbHVhdGUoIGFuaW1hdGlvblBlcmNlbnRDb21wbGV0ZSApO1xyXG4gICAgICAgICAgbXV6emxlRmxhc2guc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlTGluZWFyRnVuY3Rpb24uZXZhbHVhdGUoIGFuaW1hdGlvblBlcmNlbnRDb21wbGV0ZSApICk7XHJcbiAgICAgICAgICB0aGlzLm11enpsZUZsYXNoU3RhZ2UgKz0gKCBkdCAvIE1VWlpMRV9GTEFTSF9EVVJBVElPTiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIG11enpsZUZsYXNoLm9wYWNpdHkgPSBNVVpaTEVfRkxBU0hfT1BBQ0lUWV9GSU5BTDtcclxuICAgICAgICAgIG11enpsZUZsYXNoLnNldFNjYWxlTWFnbml0dWRlKCBNVVpaTEVfRkxBU0hfU0NBTEVfRklOQUwgKTtcclxuICAgICAgICAgIHRoaXMubXV6emxlRmxhc2hQbGF5aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICB0aGlzLnNldENoaWxkcmVuKCBbXHJcbiAgICAgIGdyb3VuZENpcmNsZSxcclxuICAgICAgY2xpcENvbnRhaW5lcixcclxuICAgICAgaGVpZ2h0TGVhZGVyTGluZSxcclxuICAgICAgaGVpZ2h0TGVhZGVyQXJyb3dzLFxyXG4gICAgICBoZWlnaHRMZWFkZXJMaW5lVG9wQ2FwLFxyXG4gICAgICBoZWlnaHRMZWFkZXJMaW5lQm90dG9tQ2FwLFxyXG4gICAgICBoZWlnaHRMYWJlbEJhY2tncm91bmQsXHJcbiAgICAgIGhlaWdodExhYmVsVGV4dCxcclxuICAgICAgaGVpZ2h0Q3VlaW5nQXJyb3dzLFxyXG4gICAgICBhbmdsZUluZGljYXRvclxyXG4gICAgXSApO1xyXG5cclxuICAgIC8vIE9ic2VydmUgY2hhbmdlcyBpbiBtb2RlbCBhbmdsZSBhbmQgdXBkYXRlIHRoZSBjYW5ub24gdmlld1xyXG4gICAgYW5nbGVQcm9wZXJ0eS5saW5rKCBhbmdsZSA9PiB7XHJcbiAgICAgIGNhbm5vbkJhcnJlbC5zZXRSb3RhdGlvbiggLWFuZ2xlICogTWF0aC5QSSAvIDE4MCApO1xyXG4gICAgICBjb25zdCBhcmNTaGFwZSA9IGFuZ2xlID4gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgID8gU2hhcGUuYXJjKCAwLCAwLCBDUk9TU0hBSVJfTEVOR1RIICogMiAvIDMsIDAsIC1hbmdsZSAqIE1hdGguUEkgLyAxODAsIHRydWUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgIDogU2hhcGUuYXJjKCAwLCAwLCBDUk9TU0hBSVJfTEVOR1RIICogMiAvIDMsIDAsIC1hbmdsZSAqIE1hdGguUEkgLyAxODAgKTtcclxuICAgICAgYW5nbGVBcmMuc2V0U2hhcGUoIGFyY1NoYXBlICk7XHJcbiAgICAgIGFuZ2xlTGFiZWwuc3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuMFZhbHVlMVVuaXRzU3RyaW5nLCB7XHJcbiAgICAgICAgdmFsdWU6IFV0aWxzLnRvRml4ZWROdW1iZXIoIGFuZ2xlUHJvcGVydHkuZ2V0KCksIDIgKSxcclxuICAgICAgICB1bml0czogREVHUkVFU1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGFuZ2xlTGFiZWxCYWNrZ3JvdW5kLnNldFJlY3RXaWR0aCggYW5nbGVMYWJlbC53aWR0aCArIDIgKTtcclxuICAgICAgYW5nbGVMYWJlbEJhY2tncm91bmQuc2V0UmVjdEhlaWdodCggYW5nbGVMYWJlbC5oZWlnaHQgKTtcclxuICAgICAgYW5nbGVMYWJlbEJhY2tncm91bmQuY2VudGVyID0gYW5nbGVMYWJlbC5jZW50ZXI7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc3RhcnRzIGF0IDEsIGJ1dCBpcyB1cGRhdGVkIGJ5IG1vZGVsVmlld1RyYW5zZm9ybS5cclxuICAgIGxldCBzY2FsZU1hZ25pdHVkZSA9IDE7XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gdG8gdHJhbnNmb3JtIGV2ZXJ5dGhpbmcgdG8gdGhlIHJpZ2h0IGhlaWdodFxyXG4gICAgY29uc3QgdXBkYXRlSGVpZ2h0ID0gKCBoZWlnaHQ6IG51bWJlciApID0+IHtcclxuICAgICAgY29uc3Qgdmlld0hlaWdodFBvaW50ID0gVmVjdG9yMi5wb29sLmNyZWF0ZSggMCwgdHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdZKCBoZWlnaHQgKSApO1xyXG4gICAgICBjb25zdCBoZWlnaHRJbkNsaXBDb29yZGluYXRlcyA9IHRoaXMuZ2xvYmFsVG9Mb2NhbFBvaW50KCBzY3JlZW5WaWV3LmxvY2FsVG9HbG9iYWxQb2ludCggdmlld0hlaWdodFBvaW50ICkgKS55O1xyXG5cclxuICAgICAgY2Fubm9uQmFycmVsLnkgPSBoZWlnaHRJbkNsaXBDb29yZGluYXRlcztcclxuICAgICAgY2Fubm9uQmFzZS55ID0gaGVpZ2h0SW5DbGlwQ29vcmRpbmF0ZXM7XHJcblxyXG4gICAgICAvLyBUaGUgY2Fubm9uQmFzZSBhbmQgY3lsaW5kZXIgYXJlIHNpYmxpbmdzLCBzbyB0cmFuc2Zvcm0gaW50byB0aGUgc2FtZSBjb29yZGluYXRlIGZyYW1lLlxyXG4gICAgICBjeWxpbmRlclRvcC55ID0gY3lsaW5kZXJOb2RlLnBhcmVudFRvTG9jYWxQb2ludCggdmlld0hlaWdodFBvaW50LnNldFkoIGNhbm5vbkJhc2UuYm90dG9tICkgKS55IC0gRUxMSVBTRV9IRUlHSFQgLyA0O1xyXG4gICAgICB2aWV3SGVpZ2h0UG9pbnQuZnJlZVRvUG9vbCgpO1xyXG5cclxuICAgICAgY29uc3Qgc2lkZVNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICAgIHNpZGVTaGFwZS5tb3ZlVG8oIC1FTExJUFNFX1dJRFRIIC8gMiwgMCApXHJcbiAgICAgICAgLmxpbmVUbyggLUVMTElQU0VfV0lEVEggLyAyLCBjeWxpbmRlclRvcC55IClcclxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggMCwgY3lsaW5kZXJUb3AueSwgRUxMSVBTRV9XSURUSCAvIDIsIEVMTElQU0VfSEVJR0hUIC8gMiwgMCwgTWF0aC5QSSwgMCwgdHJ1ZSApXHJcbiAgICAgICAgLmxpbmVUbyggRUxMSVBTRV9XSURUSCAvIDIsIDAgKVxyXG4gICAgICAgIC5lbGxpcHRpY2FsQXJjKCAwLCAwLCBFTExJUFNFX1dJRFRIIC8gMiwgRUxMSVBTRV9IRUlHSFQgLyAyLCAwLCAwLCBNYXRoLlBJLCBmYWxzZSApXHJcbiAgICAgICAgLmNsb3NlKCk7XHJcbiAgICAgIGN5bGluZGVyU2lkZS5zZXRTaGFwZSggc2lkZVNoYXBlICk7XHJcblxyXG4gICAgICBjb25zdCBjbGlwQXJlYSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgICBjbGlwQXJlYS5tb3ZlVG8oIC1FTExJUFNFX1dJRFRIIC8gMiwgMCApXHJcbiAgICAgICAgLmxpbmVUbyggLUVMTElQU0VfV0lEVEggLyAyLCAtRUxMSVBTRV9XSURUSCAqIDUwICkgLy8gaGlnaCBlbm91Z2ggdG8gaW5jbHVkZSBob3cgaGlnaCB0aGUgY2Fubm9uIGNvdWxkIGJlXHJcbiAgICAgICAgLmxpbmVUbyggRUxMSVBTRV9XSURUSCAqIDIsIC1FTExJUFNFX1dJRFRIICogNTAgKSAvLyBoaWdoIGVub3VnaCB0byBpbmNsdWRlIGhvdyBoaWdoIHRoZSBjYW5ub24gY291bGQgYmVcclxuICAgICAgICAubGluZVRvKCBFTExJUFNFX1dJRFRIICogMiwgMCApXHJcbiAgICAgICAgLmxpbmVUbyggRUxMSVBTRV9XSURUSCAvIDIsIDAgKVxyXG4gICAgICAgIC5lbGxpcHRpY2FsQXJjKCAwLCAwLCBFTExJUFNFX1dJRFRIIC8gMiwgRUxMSVBTRV9IRUlHSFQgLyAyLCAwLCAwLCBNYXRoLlBJLCBmYWxzZSApXHJcbiAgICAgICAgLmNsb3NlKCk7XHJcblxyXG4gICAgICAvLyB0aGlzIHNoYXBlIGlzIG1hZGUgaW4gdGhlIGNvbnRleHQgb2YgdGhlIGN5bGluZGVyLCBzbyB0cmFuc2Zvcm0gaXQgdG8gbWF0Y2ggdGhlIGN5bGluZGVyJ3MgdHJhbnNmb3JtLlxyXG4gICAgICAvLyBUaGlzIGRvZXNuJ3QgbmVlZCB0byBoYXBwZW4gZXZlciBhZ2FpbiBiZWNhdXNlIHRoZSBjbGlwQ29udGFpbmVyIGlzIHRoZSBwYXJlbnQgdG8gYWxsIE5vZGVzIHRoYXQgYXJlIHVwZGF0ZWQgb25cclxuICAgICAgLy8gbGF5b3V0IGNoYW5nZS5cclxuICAgICAgY2xpcENvbnRhaW5lci5zZXRDbGlwQXJlYSggY2xpcEFyZWEudHJhbnNmb3JtZWQoIGN5bGluZGVyTm9kZS5tYXRyaXggKSApO1xyXG5cclxuICAgICAgaGVpZ2h0TGVhZGVyQXJyb3dzLnNldFRhaWxBbmRUaXAoXHJcbiAgICAgICAgaGVpZ2h0TGVhZGVyQXJyb3dzLnRhaWxYLFxyXG4gICAgICAgIGhlaWdodExlYWRlckFycm93cy50YWlsWSxcclxuICAgICAgICBoZWlnaHRMZWFkZXJBcnJvd3MudGlwWCxcclxuICAgICAgICB0cmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld1koIGhlaWdodCApXHJcbiAgICAgICk7XHJcbiAgICAgIGhlaWdodExlYWRlckxpbmUuc2V0TGluZSggaGVpZ2h0TGVhZGVyQXJyb3dzLnRhaWxYLCBoZWlnaHRMZWFkZXJBcnJvd3MudGFpbFksIGhlaWdodExlYWRlckFycm93cy50aXBYLCBoZWlnaHRMZWFkZXJBcnJvd3MudGlwWSApO1xyXG4gICAgICBoZWlnaHRMZWFkZXJMaW5lVG9wQ2FwLnggPSBoZWlnaHRMZWFkZXJBcnJvd3MudGlwWDtcclxuICAgICAgaGVpZ2h0TGVhZGVyTGluZVRvcENhcC55ID0gaGVpZ2h0TGVhZGVyQXJyb3dzLnRpcFk7XHJcbiAgICAgIGhlaWdodExhYmVsVGV4dC5zdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmcsIHtcclxuICAgICAgICB2YWx1ZTogVXRpbHMudG9GaXhlZE51bWJlciggaGVpZ2h0LCAyICksXHJcbiAgICAgICAgdW5pdHM6IG1TdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgICBoZWlnaHRMYWJlbFRleHQuY2VudGVyWCA9IGhlaWdodExlYWRlckFycm93cy50aXBYO1xyXG4gICAgICBoZWlnaHRMYWJlbFRleHQueSA9IGhlaWdodExlYWRlckFycm93cy50aXBZIC0gNTtcclxuICAgICAgaGVpZ2h0TGFiZWxCYWNrZ3JvdW5kLnNldFJlY3RXaWR0aCggaGVpZ2h0TGFiZWxUZXh0LndpZHRoICsgMiApO1xyXG4gICAgICBoZWlnaHRMYWJlbEJhY2tncm91bmQuc2V0UmVjdEhlaWdodCggaGVpZ2h0TGFiZWxUZXh0LmhlaWdodCApO1xyXG4gICAgICBoZWlnaHRMYWJlbEJhY2tncm91bmQuY2VudGVyID0gaGVpZ2h0TGFiZWxUZXh0LmNlbnRlcjtcclxuICAgICAgaGVpZ2h0Q3VlaW5nQXJyb3dzLnkgPSBoZWlnaHRMYWJlbFRleHQuY2VudGVyWTtcclxuXHJcbiAgICAgIGFuZ2xlSW5kaWNhdG9yLnkgPSB0cmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld1koIGhlaWdodCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgaW4gbW9kZWwgaGVpZ2h0IGFuZCB1cGRhdGUgdGhlIGNhbm5vbiB2aWV3XHJcbiAgICBoZWlnaHRQcm9wZXJ0eS5saW5rKCBoZWlnaHQgPT4ge1xyXG4gICAgICB1cGRhdGVIZWlnaHQoIGhlaWdodCApO1xyXG4gICAgICBpZiAoIGhlaWdodCA8IDQgJiYgYW5nbGVQcm9wZXJ0eS5nZXQoKSA8IEFOR0xFX1JBTkdFX01JTlNbIGhlaWdodCBdICkge1xyXG4gICAgICAgIGFuZ2xlUHJvcGVydHkuc2V0KCBBTkdMRV9SQU5HRV9NSU5TWyBoZWlnaHQgXSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBsYXlvdXQgb2YgY2Fubm9uIE5vZGVzIGJhc2VkIG9uIHRoZSBjdXJyZW50IHRyYW5zZm9ybS5cclxuICAgIGNvbnN0IHVwZGF0ZUNhbm5vbkxheW91dCA9ICgpID0+IHtcclxuXHJcbiAgICAgIC8vIFNjYWxlIGV2ZXJ5dGhpbmcgdG8gYmUgYmFzZWQgb24gdGhlIGNhbm5vbiBiYXJyZWwuXHJcbiAgICAgIHNjYWxlTWFnbml0dWRlID0gdHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdEZWx0YVgoIENBTk5PTl9MRU5HVEggKSAvIGNhbm5vbkJhcnJlbFRvcC53aWR0aDtcclxuICAgICAgY3lsaW5kZXJOb2RlLnNldFNjYWxlTWFnbml0dWRlKCBzY2FsZU1hZ25pdHVkZSApO1xyXG4gICAgICBncm91bmRDaXJjbGUuc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlTWFnbml0dWRlICk7XHJcbiAgICAgIGNhbm5vbkJhcnJlbC5zZXRTY2FsZU1hZ25pdHVkZSggc2NhbGVNYWduaXR1ZGUgKTtcclxuICAgICAgY2Fubm9uQmFzZS5zZXRTY2FsZU1hZ25pdHVkZSggc2NhbGVNYWduaXR1ZGUgKTtcclxuXHJcbiAgICAgIC8vIFRyYW5zZm9ybSB0aGUgY3lsaW5kcmljYWwgTm9kZXMgb3ZlciwgYmVjYXVzZSB0aGV5IGFyZSBvZmZzZXQgZnJvbSB0aGUgb3JnaW4uXHJcbiAgICAgIGNvbnN0IG5ld1ggPSB0cmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld1goIENZTElOREVSX0RJU1RBTkNFX0ZST01fT1JJR0lOICk7XHJcbiAgICAgIGN5bGluZGVyTm9kZS54ID0gbmV3WDtcclxuICAgICAgZ3JvdW5kQ2lyY2xlLnggPSBuZXdYO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgaW4gbW9kZWx2aWV3dHJhbnNmb3JtIGFuZCB1cGRhdGUgdGhlIHZpZXdcclxuICAgIHRyYW5zZm9ybVByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdXBkYXRlQ2Fubm9uTGF5b3V0KCk7XHJcbiAgICAgIHVwZGF0ZUhlaWdodCggaGVpZ2h0UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBMaW5rcyBpbiBDYW5ub25Ob2RlIGxhc3QgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLCBzbyB0aGV5IGRvbid0IG5lZWQgdG8gYmUgZGlzcG9zZWRcclxuXHJcbiAgICAvLyB2YXJpYWJsZXMgdXNlZCBmb3IgZHJhZyBsaXN0ZW5lcnNcclxuICAgIGxldCBzdGFydFBvaW50OiBWZWN0b3IyO1xyXG4gICAgbGV0IHN0YXJ0QW5nbGU6IG51bWJlcjtcclxuICAgIGxldCBzdGFydFBvaW50QW5nbGU6IG51bWJlcjtcclxuICAgIGxldCBtb3VzZVBvaW50OiBWZWN0b3IyO1xyXG4gICAgbGV0IHN0YXJ0SGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgLy8gZHJhZyB0aGUgdGlwIG9mIHRoZSBjYW5ub24gdG8gY2hhbmdlIGFuZ2xlXHJcbiAgICBjYW5ub25CYXJyZWxUb3AuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICBzdGFydDogZXZlbnQgPT4ge1xyXG4gICAgICAgIHN0YXJ0UG9pbnQgPSB0aGlzLmdsb2JhbFRvTG9jYWxQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBhbmdsZVByb3BlcnR5LmdldCgpOyAvLyBkZWdyZWVzXHJcblxyXG4gICAgICAgIC8vIGZpbmQgdmVjdG9yIGFuZ2xlcyBiZXR3ZWVuIG1vdXNlIGRyYWcgc3RhcnQgYW5kIGN1cnJlbnQgcG9pbnRzLCB0byB0aGUgYmFzZSBvZiB0aGUgY2Fubm9uXHJcbiAgICAgICAgc3RhcnRQb2ludEFuZ2xlID0gVmVjdG9yMi5wb29sLmNyZWF0ZShcclxuICAgICAgICAgIHN0YXJ0UG9pbnQueCAtIGNhbm5vbkJhc2UueCxcclxuICAgICAgICAgIHN0YXJ0UG9pbnQueSAtIHRyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WSggaGVpZ2h0UHJvcGVydHkuZ2V0KCkgKVxyXG4gICAgICAgICkuYW5nbGU7XHJcbiAgICAgIH0sXHJcbiAgICAgIGRyYWc6IGV2ZW50ID0+IHtcclxuICAgICAgICBtb3VzZVBvaW50ID0gdGhpcy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcclxuXHJcbiAgICAgICAgY29uc3QgbW91c2VQb2ludEFuZ2xlID0gVmVjdG9yMi5wb29sLmNyZWF0ZShcclxuICAgICAgICAgIG1vdXNlUG9pbnQueCAtIGNhbm5vbkJhc2UueCxcclxuICAgICAgICAgIG1vdXNlUG9pbnQueSAtIHRyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WSggaGVpZ2h0UHJvcGVydHkuZ2V0KCkgKVxyXG4gICAgICAgICkuYW5nbGU7XHJcbiAgICAgICAgY29uc3QgYW5nbGVDaGFuZ2UgPSBzdGFydFBvaW50QW5nbGUgLSBtb3VzZVBvaW50QW5nbGU7IC8vIHJhZGlhbnNcclxuICAgICAgICBjb25zdCBhbmdsZUNoYW5nZUluRGVncmVlcyA9IGFuZ2xlQ2hhbmdlICogMTgwIC8gTWF0aC5QSTsgLy8gZGVncmVlc1xyXG5cclxuICAgICAgICBjb25zdCB1bmJvdW5kZWROZXdBbmdsZSA9IHN0YXJ0QW5nbGUgKyBhbmdsZUNoYW5nZUluRGVncmVlcztcclxuXHJcbiAgICAgICAgY29uc3QgYW5nbGVSYW5nZSA9IGhlaWdodFByb3BlcnR5LmdldCgpIDwgNCA/IG5ldyBSYW5nZSggQU5HTEVfUkFOR0VfTUlOU1sgaGVpZ2h0UHJvcGVydHkuZ2V0KCkgXSwgOTAgKSA6IEFOR0xFX1JBTkdFO1xyXG5cclxuICAgICAgICAvLyBtb3VzZSBkcmFnZ2VkIGFuZ2xlIGlzIHdpdGhpbiBhbmdsZSByYW5nZVxyXG4gICAgICAgIGlmICggYW5nbGVSYW5nZS5jb250YWlucyggdW5ib3VuZGVkTmV3QW5nbGUgKSApIHtcclxuICAgICAgICAgIGNvbnN0IGRlbHRhID0gcHJvdmlkZWRPcHRpb25zPy5wcmVjaXNlQ2Fubm9uRGVsdGEgPyAxIDogNTtcclxuICAgICAgICAgIGFuZ2xlUHJvcGVydHkuc2V0KCBVdGlscy5yb3VuZFN5bW1ldHJpYyggdW5ib3VuZGVkTmV3QW5nbGUgLyBkZWx0YSApICogZGVsdGEgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHRoZSBjdXJyZW50LCB1bmNoYW5nZWQsIGFuZ2xlIGlzIGNsb3NlciB0byBtYXggdGhhbiBtaW5cclxuICAgICAgICBlbHNlIGlmICggYW5nbGVSYW5nZS5tYXggKyBhbmdsZVJhbmdlLm1pbiA8IDIgKiBhbmdsZVByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgYW5nbGVQcm9wZXJ0eS5zZXQoIGFuZ2xlUmFuZ2UubWF4ICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB0aGUgY3VycmVudCwgdW5jaGFuZ2VkLCBhbmdsZSBpcyBjbG9zZXIgb3Igc2FtZSBkaXN0YW5jZSB0byBtaW4gdGhhbiBtYXhcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGFuZ2xlUHJvcGVydHkuc2V0KCBhbmdsZVJhbmdlLm1pbiApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZUlucHV0TGlzdGVuZXJDdXJzb3I6IHRydWUsXHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JhcnJlbFRvcERyYWdMaXN0ZW5lcicgKSxcclxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBkcmFnIGxpc3RlbmVyIGZvciBjb250cm9sbGluZyB0aGUgaGVpZ2h0XHJcbiAgICBjb25zdCBoZWlnaHREcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgc3RhcnRQb2ludCA9IHRoaXMuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcbiAgICAgICAgc3RhcnRIZWlnaHQgPSB0cmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld1koIGhlaWdodFByb3BlcnR5LmdldCgpICk7IC8vIHZpZXcgdW5pdHNcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGRyYWc6IGV2ZW50ID0+IHtcclxuICAgICAgICBtb3VzZVBvaW50ID0gdGhpcy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcclxuICAgICAgICBjb25zdCBoZWlnaHRDaGFuZ2UgPSBtb3VzZVBvaW50LnkgLSBzdGFydFBvaW50Lnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVuYm91bmRlZE5ld0hlaWdodCA9IHRyYW5zZm9ybVByb3BlcnR5LmdldCgpLnZpZXdUb01vZGVsWSggc3RhcnRIZWlnaHQgKyBoZWlnaHRDaGFuZ2UgKTtcclxuXHJcbiAgICAgICAgLy8gbW91c2UgZHJhZ2dlZCBoZWlnaHQgaXMgd2l0aGluIGhlaWdodCByYW5nZVxyXG4gICAgICAgIGlmICggSEVJR0hUX1JBTkdFLmNvbnRhaW5zKCB1bmJvdW5kZWROZXdIZWlnaHQgKSApIHtcclxuICAgICAgICAgIGhlaWdodFByb3BlcnR5LnNldCggVXRpbHMucm91bmRTeW1tZXRyaWMoIHVuYm91bmRlZE5ld0hlaWdodCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRoZSBjdXJyZW50LCB1bmNoYW5nZWQsIGhlaWdodCBpcyBjbG9zZXIgdG8gbWF4IHRoYW4gbWluXHJcbiAgICAgICAgZWxzZSBpZiAoIEhFSUdIVF9SQU5HRS5tYXggKyBIRUlHSFRfUkFOR0UubWluIDwgMiAqIGhlaWdodFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgaGVpZ2h0UHJvcGVydHkuc2V0KCBIRUlHSFRfUkFOR0UubWF4ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRoZSBjdXJyZW50LCB1bmNoYW5nZWQsIGhlaWdodCBpcyBjbG9zZXIgb3Igc2FtZSBkaXN0YW5jZSB0byBtaW4gdGhhbiBtYXhcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGhlaWdodFByb3BlcnR5LnNldCggSEVJR0hUX1JBTkdFLm1pbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIGhlaWdodEN1ZWluZ0Fycm93cy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZUlucHV0TGlzdGVuZXJDdXJzb3I6IHRydWUsXHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hlaWdodERyYWdMaXN0ZW5lcicgKSxcclxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbXVsdGlwbGUgcGFydHMgb2YgdGhlIGNhbm5vbiBjYW4gYmUgZHJhZ2dlZCB0byBjaGFuZ2UgaGVpZ2h0XHJcbiAgICBjYW5ub25CYXNlLmFkZElucHV0TGlzdGVuZXIoIGhlaWdodERyYWdMaXN0ZW5lciApO1xyXG4gICAgY3lsaW5kZXJTaWRlLmFkZElucHV0TGlzdGVuZXIoIGhlaWdodERyYWdMaXN0ZW5lciApO1xyXG4gICAgY3lsaW5kZXJUb3AuYWRkSW5wdXRMaXN0ZW5lciggaGVpZ2h0RHJhZ0xpc3RlbmVyICk7XHJcbiAgICBjYW5ub25CYXJyZWxCYXNlLmFkZElucHV0TGlzdGVuZXIoIGhlaWdodERyYWdMaXN0ZW5lciApO1xyXG4gICAgaGVpZ2h0TGFiZWxUZXh0LmFkZElucHV0TGlzdGVuZXIoIGhlaWdodERyYWdMaXN0ZW5lciApO1xyXG4gICAgaGVpZ2h0Q3VlaW5nQXJyb3dzLmFkZElucHV0TGlzdGVuZXIoIGhlaWdodERyYWdMaXN0ZW5lciApO1xyXG5cclxuICAgIGhlaWdodERyYWdMaXN0ZW5lci5lbmFibGVkUHJvcGVydHkubGlua0F0dHJpYnV0ZSggaGVpZ2h0Q3VlaW5nQXJyb3dzLCAndmlzaWJsZScgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMubXV6emxlRmxhc2hTdGFnZSA9IDE7XHJcbiAgICB0aGlzLmhlaWdodEN1ZWluZ0Fycm93cy52aXNpYmxlID0gdGhpcy5pc0ludHJvU2NyZWVuO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZsYXNoTXV6emxlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5tdXp6bGVGbGFzaFBsYXlpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5tdXp6bGVGbGFzaFN0YWdlID0gMDtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IG11enpsZUZsYXNoRHVyYXRpb25Db21wbGV0ZVRvQW5pbWF0aW9uUGVyY2VudENvbXBsZXRlID0gKCB0aW1lUGVyY2VudENvbXBsZXRlOiBudW1iZXIgKTogbnVtYmVyID0+IHtcclxuICByZXR1cm4gLU1hdGgucG93KCAyLCAtMTAgKiB0aW1lUGVyY2VudENvbXBsZXRlICkgKyAxOyAvL2Vhc2luZyBvdXQgZnVuY3Rpb25cclxufTtcclxuXHJcbnByb2plY3RpbGVNb3Rpb24ucmVnaXN0ZXIoICdDYW5ub25Ob2RlJywgQ2Fubm9uTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2Fubm9uTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsY0FBYyxNQUFNLHNDQUFzQztBQUNqRSxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsU0FBU0MsS0FBSyxFQUFFQyxZQUFZLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxjQUFjLEVBQUVDLElBQUksRUFBZUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUksT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxtQkFBbUIsTUFBTSx3Q0FBd0M7QUFDeEUsT0FBT0MsZ0JBQWdCLE1BQU0sc0NBQXNDO0FBQ25FLE9BQU9DLG9CQUFvQixNQUFNLDBDQUEwQztBQUMzRSxPQUFPQyxpQkFBaUIsTUFBTSx1Q0FBdUM7QUFDckUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFLdkUsT0FBT0MsU0FBUyxNQUFNLHVDQUF1Qzs7QUFFN0Q7O0FBRUEsTUFBTUMsT0FBTyxHQUFHSCx1QkFBdUIsQ0FBQ0ksQ0FBQztBQUN6QyxNQUFNQyx5QkFBeUIsR0FBR0wsdUJBQXVCLENBQUNNLG1CQUFtQjtBQUM3RSxNQUFNQyxrQ0FBa0MsR0FBR1AsdUJBQXVCLENBQUNRLDRCQUE0Qjs7QUFFL0Y7QUFDQSxNQUFNQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekIsTUFBTUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLE1BQU1DLGNBQWMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUMzQixNQUFNQyw2QkFBNkIsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUMzQyxNQUFNQyxvQkFBb0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLE1BQU1DLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLE1BQU1DLFdBQVcsR0FBR2QseUJBQXlCLENBQUNlLGtCQUFrQjtBQUNoRSxNQUFNQyxZQUFZLEdBQUdoQix5QkFBeUIsQ0FBQ2lCLG1CQUFtQjtBQUNsRSxNQUFNQyxhQUFhLEdBQUdsQix5QkFBeUIsQ0FBQ21CLGtCQUFrQjtBQUNsRSxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJcEMsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUUsQ0FBQztBQUN2RCxNQUFNcUMsZUFBZSxHQUFHLElBQUlyQyxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBRSxDQUFDO0FBQ3JELE1BQU1zQyxpQkFBaUIsR0FBRyw0QkFBNEI7QUFDdEQsTUFBTUMsZ0JBQWdCLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDO0FBQzlDLE1BQU1DLG9CQUFvQixHQUFHO0VBQzNCQyxJQUFJLEVBQUUsc0JBQXNCO0VBQzVCQyxNQUFNLEVBQUUsT0FBTztFQUNmQyxTQUFTLEVBQUUsQ0FBQztFQUNaQyxTQUFTLEVBQUUsQ0FBQztFQUNaQyxTQUFTLEVBQUUsRUFBRTtFQUNiQyxVQUFVLEVBQUU7QUFDZCxDQUFDO0FBRUQsTUFBTUMsMEJBQTBCLEdBQUcsR0FBRztBQUN0QyxNQUFNQyx3QkFBd0IsR0FBRyxHQUFHO0FBQ3BDLE1BQU1DLDRCQUE0QixHQUFHLENBQUM7QUFDdEMsTUFBTUMsMEJBQTBCLEdBQUcsQ0FBQztBQUNwQyxNQUFNQyxxQkFBcUIsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFbkMsTUFBTUMsT0FBTyxHQUFHckQsV0FBVyxDQUFDcUQsT0FBTztBQUVuQyxNQUFNQyxxQkFBcUIsR0FBRyxJQUFJM0QsY0FBYyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUV1RCw0QkFBNEIsRUFBRUMsMEJBQTJCLENBQUM7QUFDbEgsTUFBTUksbUJBQW1CLEdBQUcsSUFBSTVELGNBQWMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFcUQsMEJBQTBCLEVBQUVDLHdCQUF5QixDQUFDO0FBVTVHLE1BQU1PLFVBQVUsU0FBU2xELElBQUksQ0FBQztFQU1yQm1ELFdBQVdBLENBQUVDLGNBQWdDLEVBQUVDLGFBQStCLEVBQUVDLGtCQUFxQyxFQUN4R0MsaUJBQWdELEVBQUVDLFVBQXNCLEVBQUVDLGVBQW1DLEVBQUc7SUFFbEksTUFBTUMsT0FBTyxHQUFHOUMsU0FBUyxDQUE4QyxDQUFDLENBQUU7TUFDeEUrQyxNQUFNLEVBQUV2RCxNQUFNLENBQUN3RDtJQUNqQixDQUFDLEVBQUVILGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFQyxPQUFRLENBQUM7O0lBRWhCO0lBQ0EsTUFBTUcsVUFBVSxHQUFHTixpQkFBaUIsQ0FBQ08sS0FBSyxDQUFDQyxtQkFBbUIsQ0FBRSxJQUFJM0UsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUUsQ0FBQzs7SUFFckY7SUFDQSxNQUFNNEUsYUFBYSxHQUFHLElBQUloRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRWxDLE1BQU1pRSxZQUFZLEdBQUcsSUFBSWpFLElBQUksQ0FBRTtNQUM3QmtFLENBQUMsRUFBRUwsVUFBVSxDQUFDSztJQUNoQixDQUFFLENBQUM7SUFDSEYsYUFBYSxDQUFDRyxRQUFRLENBQUVGLFlBQWEsQ0FBQzs7SUFFdEM7SUFDQSxNQUFNRyxZQUFZLEdBQUc5RSxLQUFLLENBQUMrRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRWpELGFBQWEsR0FBRyxDQUFDLEVBQUVDLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDOztJQUVwRjtJQUNBLE1BQU1pRCxVQUFVLEdBQUcsSUFBSXZFLGNBQWMsQ0FBRSxDQUFDcUIsYUFBYSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUVBLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQ2pGbUQsWUFBWSxDQUFFLEdBQUcsRUFBRSxNQUFPLENBQUMsQ0FDM0JBLFlBQVksQ0FBRSxHQUFHLEVBQUUsT0FBUSxDQUFDLENBQzVCQSxZQUFZLENBQUUsQ0FBQyxFQUFFLE1BQU8sQ0FBQztJQUM1QixNQUFNQyxZQUFZLEdBQUcsSUFBSXZFLElBQUksQ0FBRW1FLFlBQVksRUFBRTtNQUMzQ0YsQ0FBQyxFQUFFTCxVQUFVLENBQUNLLENBQUM7TUFDZjlCLElBQUksRUFBRWtDLFVBQVU7TUFDaEJqQyxNQUFNLEVBQUVOO0lBQ1YsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTTBDLFFBQVEsR0FBRyxJQUFJMUUsY0FBYyxDQUFFLENBQUNxQixhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRUEsYUFBYSxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FDL0VtRCxZQUFZLENBQUUsR0FBRyxFQUFFdkMsZUFBZ0IsQ0FBQyxDQUNwQ3VDLFlBQVksQ0FBRSxHQUFHLEVBQUV4QyxpQkFBa0IsQ0FBQyxDQUN0Q3dDLFlBQVksQ0FBRSxDQUFDLEVBQUV2QyxlQUFnQixDQUFDO0lBQ3JDLE1BQU0wQyxZQUFZLEdBQUcsSUFBSXpFLElBQUksQ0FBRSxJQUFJLEVBQUU7TUFBRW1DLElBQUksRUFBRXFDLFFBQVE7TUFBRXBDLE1BQU0sRUFBRU47SUFBa0IsQ0FBRSxDQUFDO0lBQ3BGa0MsWUFBWSxDQUFDRSxRQUFRLENBQUVPLFlBQWEsQ0FBQzs7SUFFckM7SUFDQSxNQUFNQyxXQUFXLEdBQUcsSUFBSTFFLElBQUksQ0FBRW1FLFlBQVksRUFBRTtNQUFFaEMsSUFBSSxFQUFFSixlQUFlO01BQUVLLE1BQU0sRUFBRU47SUFBa0IsQ0FBRSxDQUFDO0lBQ2xHa0MsWUFBWSxDQUFDRSxRQUFRLENBQUVRLFdBQVksQ0FBQzs7SUFFcEM7SUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSTVFLElBQUksQ0FBRTtNQUM3QjZFLENBQUMsRUFBRWhCLFVBQVUsQ0FBQ2dCLENBQUM7TUFDZlgsQ0FBQyxFQUFFTCxVQUFVLENBQUNLO0lBQ2hCLENBQUUsQ0FBQztJQUNIRixhQUFhLENBQUNHLFFBQVEsQ0FBRVMsWUFBYSxDQUFDOztJQUV0QztJQUNBLE1BQU1FLGVBQWUsR0FBRyxJQUFJakYsS0FBSyxDQUFFUSxtQkFBbUIsRUFBRTtNQUFFMEUsT0FBTyxFQUFFLENBQUM7TUFBRUMsT0FBTyxFQUFFO0lBQUUsQ0FBRSxDQUFDO0lBQ3BGLE1BQU1DLGdCQUFnQixHQUFHLElBQUlwRixLQUFLLENBQUVTLGdCQUFnQixFQUFFO01BQUV5RSxPQUFPLEVBQUUsQ0FBQztNQUFFRyxLQUFLLEVBQUVKLGVBQWUsQ0FBQ0k7SUFBTSxDQUFFLENBQUM7SUFFcEdOLFlBQVksQ0FBQ1QsUUFBUSxDQUFFYyxnQkFBaUIsQ0FBQztJQUN6Q0wsWUFBWSxDQUFDVCxRQUFRLENBQUVXLGVBQWdCLENBQUM7SUFFeEMsTUFBTUssVUFBVSxHQUFHLElBQUluRixJQUFJLENBQUU7TUFDM0I2RSxDQUFDLEVBQUVoQixVQUFVLENBQUNnQixDQUFDO01BQ2ZYLENBQUMsRUFBRUwsVUFBVSxDQUFDSztJQUNoQixDQUFFLENBQUM7SUFDSEYsYUFBYSxDQUFDRyxRQUFRLENBQUVnQixVQUFXLENBQUM7SUFFcEMsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSXZGLEtBQUssQ0FBRVUsb0JBQW9CLEVBQUU7TUFBRThFLEdBQUcsRUFBRSxDQUFDO01BQUVDLE9BQU8sRUFBRTtJQUFFLENBQUUsQ0FBQztJQUNsRkgsVUFBVSxDQUFDaEIsUUFBUSxDQUFFaUIsZ0JBQWlCLENBQUM7SUFDdkMsTUFBTUcsYUFBYSxHQUFHLElBQUkxRixLQUFLLENBQUVXLGlCQUFpQixFQUFFO01BQUVnRixNQUFNLEVBQUUsQ0FBQztNQUFFRixPQUFPLEVBQUU7SUFBRSxDQUFFLENBQUM7SUFDL0VILFVBQVUsQ0FBQ2hCLFFBQVEsQ0FBRW9CLGFBQWMsQ0FBQztJQUVwQyxNQUFNRSxxQkFBcUIsR0FBR2xDLGlCQUFpQixDQUFDTyxLQUFLLENBQUM0QixZQUFZLENBQUVuRSxvQkFBcUIsQ0FBQzs7SUFFMUY7SUFDQSxNQUFNb0UsZ0JBQWdCLEdBQUcsSUFBSTdGLElBQUksQ0FDL0IyRixxQkFBcUIsRUFDckI1QixVQUFVLENBQUNLLENBQUMsRUFDWnVCLHFCQUFxQixFQUNyQmxDLGlCQUFpQixDQUFDTyxLQUFLLENBQUM4QixZQUFZLENBQUV4QyxjQUFjLENBQUN5QyxHQUFHLENBQUMsQ0FBRSxDQUFDLEVBQUU7TUFDNUR4RCxNQUFNLEVBQUUsT0FBTztNQUNmeUQsUUFBUSxFQUFFLENBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbEIsQ0FDRixDQUFDOztJQUVEO0lBQ0EsTUFBTUMsa0JBQWtCLEdBQUcsSUFBSXRHLFNBQVMsQ0FDdENnRyxxQkFBcUIsRUFDckI1QixVQUFVLENBQUNLLENBQUMsRUFDWnVCLHFCQUFxQixFQUNyQmxDLGlCQUFpQixDQUFDTyxLQUFLLENBQUM4QixZQUFZLENBQUV4QyxjQUFjLENBQUN5QyxHQUFHLENBQUMsQ0FBRSxDQUFDLEVBQUU7TUFDNURwRCxVQUFVLEVBQUUsQ0FBQztNQUNiRCxTQUFTLEVBQUUsQ0FBQztNQUNaRCxTQUFTLEVBQUUsQ0FBQztNQUNaRCxTQUFTLEVBQUUsQ0FBQztNQUNaMEQsVUFBVSxFQUFFO0lBQ2QsQ0FDRixDQUFDOztJQUVEOztJQUVBLE1BQU1DLHNCQUFzQixHQUFHLElBQUluRyxJQUFJLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFDcER1QyxNQUFNLEVBQUUsT0FBTztNQUNmQyxTQUFTLEVBQUU7SUFDYixDQUFFLENBQUM7SUFFSCxNQUFNNEQseUJBQXlCLEdBQUcsSUFBSXBHLElBQUksQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtNQUN2RHVDLE1BQU0sRUFBRSxPQUFPO01BQ2ZDLFNBQVMsRUFBRTtJQUNiLENBQUUsQ0FBQztJQUNINEQseUJBQXlCLENBQUNyQixDQUFDLEdBQUdrQixrQkFBa0IsQ0FBQ0ksSUFBSTtJQUNyREQseUJBQXlCLENBQUNoQyxDQUFDLEdBQUdMLFVBQVUsQ0FBQ0ssQ0FBQzs7SUFFMUM7SUFDQSxNQUFNa0MscUJBQXFCLEdBQUcsSUFBSWxHLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFBRWtDLElBQUksRUFBRUg7SUFBa0IsQ0FBRSxDQUFDO0lBQ3RGLE1BQU1vRSxrQkFBa0IsR0FBRzlHLEtBQUssQ0FBRTtNQUNoQytHLFFBQVEsRUFBRSxJQUFJO01BQ2RDLFFBQVEsRUFBRSxFQUFFLENBQUM7SUFDZixDQUFDLEVBQUUxRSxhQUFjLENBQUM7SUFDbEIsTUFBTTJFLGVBQWUsR0FBRyxJQUFJckcsSUFBSSxDQUFFWCxXQUFXLENBQUNpSCxNQUFNLENBQUV4RixrQ0FBa0MsRUFBRTtNQUN4RjZDLEtBQUssRUFBRTNFLEtBQUssQ0FBQ3VILGFBQWEsQ0FBRXRELGNBQWMsQ0FBQ3lDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDO01BQ3JEYyxLQUFLLEVBQUU5RixPQUFPO01BQ2Q4QyxNQUFNLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTSxDQUFDaUQsWUFBWSxDQUFFLGlCQUFrQjtJQUN6RCxDQUFFLENBQUMsRUFBRVAsa0JBQW1CLENBQUM7SUFDekJHLGVBQWUsQ0FBQ0ssWUFBWSxDQUFFTCxlQUFlLENBQUNNLE1BQU0sQ0FBQ0MsU0FBUyxDQUFFLENBQUMsRUFBRSxFQUFHLENBQUUsQ0FBQztJQUN6RVAsZUFBZSxDQUFDUSxZQUFZLENBQUVSLGVBQWUsQ0FBQ00sTUFBTSxDQUFDQyxTQUFTLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBRSxDQUFDO0lBQzFFUCxlQUFlLENBQUNsQixPQUFPLEdBQUdTLGtCQUFrQixDQUFDSSxJQUFJOztJQUVqRDtJQUNBLE1BQU1jLG9CQUFvQixHQUFHLElBQUl4SCxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTBDLG9CQUFxQixDQUFDO0lBQ2xGLE1BQU0rRSx1QkFBdUIsR0FBRyxJQUFJekgsU0FBUyxDQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTBDLG9CQUFxQixDQUFDO0lBQ25GLE1BQU1nRixrQkFBa0IsR0FBRyxJQUFJbkgsSUFBSSxDQUFFO01BQUVvSCxRQUFRLEVBQUUsQ0FBRUgsb0JBQW9CLEVBQUVDLHVCQUF1QjtJQUFHLENBQUUsQ0FBQztJQUN0R0Msa0JBQWtCLENBQUM3QixPQUFPLEdBQUdTLGtCQUFrQixDQUFDSSxJQUFJO0lBRXBELElBQUksQ0FBQ2tCLGFBQWEsR0FBS2pFLGNBQWMsQ0FBQ2tFLFlBQVksS0FBSyxDQUFHO0lBQzFELElBQUksQ0FBQ0gsa0JBQWtCLEdBQUdBLGtCQUFrQjs7SUFFNUM7SUFDQUEsa0JBQWtCLENBQUNJLE9BQU8sR0FBRyxJQUFJLENBQUNGLGFBQWE7O0lBRS9DO0lBQ0EsTUFBTUcsY0FBYyxHQUFHLElBQUl4SCxJQUFJLENBQUMsQ0FBQztJQUNqQ3dILGNBQWMsQ0FBQzNDLENBQUMsR0FBR2hCLFVBQVUsQ0FBQ2dCLENBQUMsQ0FBQyxDQUFDOztJQUVqQztJQUNBLE1BQU00QyxjQUFjLEdBQUcsSUFBSW5JLEtBQUssQ0FBQyxDQUFDLENBQy9Cb0ksTUFBTSxDQUFFLENBQUNsRyxnQkFBZ0IsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQ2xDbUcsTUFBTSxDQUFFbkcsZ0JBQWdCLEVBQUUsQ0FBRSxDQUFDLENBQzdCa0csTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFDbEcsZ0JBQWlCLENBQUMsQ0FDOUJtRyxNQUFNLENBQUUsQ0FBQyxFQUFFbkcsZ0JBQWlCLENBQUM7SUFFaEMsTUFBTW9HLFNBQVMsR0FBRyxJQUFJM0gsSUFBSSxDQUFFd0gsY0FBYyxFQUFFO01BQUVwRixNQUFNLEVBQUU7SUFBTyxDQUFFLENBQUM7SUFDaEVtRixjQUFjLENBQUNyRCxRQUFRLENBQUV5RCxTQUFVLENBQUM7SUFFcEMsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSXZJLEtBQUssQ0FBQyxDQUFDLENBQ3JDb0ksTUFBTSxDQUFFLENBQUNsRyxnQkFBZ0IsR0FBRyxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQ25DbUcsTUFBTSxDQUFFbkcsZ0JBQWdCLEdBQUcsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUNsQ2tHLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBQ2xHLGdCQUFnQixHQUFHLEVBQUcsQ0FBQyxDQUNuQ21HLE1BQU0sQ0FBRSxDQUFDLEVBQUVuRyxnQkFBZ0IsR0FBRyxFQUFHLENBQUM7SUFFckMsTUFBTXNHLGVBQWUsR0FBRyxJQUFJN0gsSUFBSSxDQUFFNEgsb0JBQW9CLEVBQUU7TUFBRXhGLE1BQU0sRUFBRSxPQUFPO01BQUVDLFNBQVMsRUFBRTtJQUFFLENBQUUsQ0FBQztJQUMzRmtGLGNBQWMsQ0FBQ3JELFFBQVEsQ0FBRTJELGVBQWdCLENBQUM7O0lBRTFDO0lBQ0EsTUFBTUMsUUFBUSxHQUFHLElBQUk5SCxJQUFJLENBQUUsSUFBSSxFQUFFO01BQUVvQyxNQUFNLEVBQUU7SUFBTyxDQUFFLENBQUM7SUFDckRtRixjQUFjLENBQUNyRCxRQUFRLENBQUU0RCxRQUFTLENBQUM7O0lBRW5DO0lBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSTlILFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFBRWtDLElBQUksRUFBRUg7SUFBa0IsQ0FBRSxDQUFDO0lBQ3JGdUYsY0FBYyxDQUFDckQsUUFBUSxDQUFFNkQsb0JBQXFCLENBQUM7SUFDL0MsTUFBTUMsVUFBVSxHQUFHLElBQUk5SCxJQUFJLENBQUVYLFdBQVcsQ0FBQ2lILE1BQU0sQ0FBRTFGLHlCQUF5QixFQUFFO01BQzFFK0MsS0FBSyxFQUFFM0UsS0FBSyxDQUFDdUgsYUFBYSxDQUFFckQsYUFBYSxDQUFDd0MsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDcERjLEtBQUssRUFBRTVEO0lBQ1QsQ0FBRSxDQUFDLEVBQUVsQixhQUFjLENBQUM7SUFDcEJvRyxVQUFVLENBQUN6QyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCeUMsVUFBVSxDQUFDQyxJQUFJLEdBQUcxRyxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7SUFDL0NnRyxjQUFjLENBQUNyRCxRQUFRLENBQUU4RCxVQUFXLENBQUM7O0lBRXJDOztJQUVBO0lBQ0EsTUFBTUUscUJBQXFCLEdBQUcsQ0FBQztJQUMvQixNQUFNQyxVQUFVLEdBQUcsSUFBSTlJLEtBQUssQ0FBQyxDQUFDO0lBQzlCLE1BQU0rSSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDcEJELFVBQVUsQ0FBQ1YsTUFBTSxDQUFFLENBQUNXLE1BQU0sRUFBRSxDQUFFLENBQUM7SUFDL0IsSUFBSUMsQ0FBQztJQUNMLEtBQU1BLENBQUMsR0FBR0MsSUFBSSxDQUFDQyxFQUFFLEdBQUcsRUFBRSxFQUFFRixDQUFDLEdBQUcsQ0FBQyxHQUFHQyxJQUFJLENBQUNDLEVBQUUsRUFBRUYsQ0FBQyxJQUFJQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxFQUFFLEVBQUc7TUFDM0QsTUFBTTNELENBQUMsR0FBRzBELElBQUksQ0FBQ0UsR0FBRyxDQUFFSCxDQUFFLENBQUMsR0FBR0QsTUFBTTtNQUNoQyxNQUFNbkUsQ0FBQyxHQUFHcUUsSUFBSSxDQUFDRyxHQUFHLENBQUVKLENBQUUsQ0FBQyxHQUFHQyxJQUFJLENBQUNJLEdBQUcsQ0FBRUosSUFBSSxDQUFDRyxHQUFHLENBQUUsR0FBRyxHQUFHSixDQUFFLENBQUMsRUFBRUgscUJBQXNCLENBQUMsR0FBR0UsTUFBTTtNQUN6RkQsVUFBVSxDQUFDVCxNQUFNLENBQUU5QyxDQUFDLEVBQUVYLENBQUUsQ0FBQztJQUMzQjtJQUNBa0UsVUFBVSxDQUFDVCxNQUFNLENBQUUsQ0FBQ1UsTUFBTSxFQUFFLENBQUUsQ0FBQzs7SUFFL0I7SUFDQSxNQUFNTyxVQUFVLEdBQUcsSUFBSTNJLElBQUksQ0FBRW1JLFVBQVUsRUFBRTtNQUFFaEcsSUFBSSxFQUFFLG9CQUFvQjtNQUFFQyxNQUFNLEVBQUU7SUFBSyxDQUFFLENBQUM7SUFDdkYsTUFBTXdHLFVBQVUsR0FBRyxJQUFJNUksSUFBSSxDQUFFbUksVUFBVSxFQUFFO01BQUVoRyxJQUFJLEVBQUUsb0JBQW9CO01BQUVDLE1BQU0sRUFBRTtJQUFLLENBQUUsQ0FBQztJQUN2RndHLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUUsR0FBSSxDQUFDO0lBQ25DRixVQUFVLENBQUNWLElBQUksR0FBRyxDQUFDO0lBQ25CVyxVQUFVLENBQUNYLElBQUksR0FBRyxDQUFDO0lBQ25CLE1BQU1hLFdBQVcsR0FBRyxJQUFJL0ksSUFBSSxDQUFFO01BQzVCZ0YsT0FBTyxFQUFFLENBQUM7TUFDVkgsQ0FBQyxFQUFFQyxlQUFlLENBQUNJLEtBQUs7TUFDeEJoQixDQUFDLEVBQUUsQ0FBQztNQUNKa0QsUUFBUSxFQUFFLENBQUV3QixVQUFVLEVBQUVDLFVBQVU7SUFDcEMsQ0FBRSxDQUFDO0lBQ0hqRSxZQUFZLENBQUNULFFBQVEsQ0FBRTRFLFdBQVksQ0FBQztJQUVwQyxJQUFJLENBQUNDLGtCQUFrQixHQUFHLEtBQUs7SUFDL0IsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQzs7SUFFM0I7SUFDQTNGLGtCQUFrQixDQUFDNEYsV0FBVyxDQUFJQyxFQUFVLElBQVk7TUFDdEQsSUFBSyxJQUFJLENBQUNILGtCQUFrQixFQUFHO1FBQzdCLElBQUssSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxDQUFDLEVBQUc7VUFDL0IsTUFBTUcsd0JBQXdCLEdBQUdDLHFEQUFxRCxDQUFFLElBQUksQ0FBQ0osZ0JBQWlCLENBQUM7VUFDL0dGLFdBQVcsQ0FBQy9ELE9BQU8sR0FBR2hDLHFCQUFxQixDQUFDc0csUUFBUSxDQUFFRix3QkFBeUIsQ0FBQztVQUNoRkwsV0FBVyxDQUFDRCxpQkFBaUIsQ0FBRTdGLG1CQUFtQixDQUFDcUcsUUFBUSxDQUFFRix3QkFBeUIsQ0FBRSxDQUFDO1VBQ3pGLElBQUksQ0FBQ0gsZ0JBQWdCLElBQU1FLEVBQUUsR0FBR3JHLHFCQUF1QjtRQUN6RCxDQUFDLE1BQ0k7VUFDSGlHLFdBQVcsQ0FBQy9ELE9BQU8sR0FBR25DLDBCQUEwQjtVQUNoRGtHLFdBQVcsQ0FBQ0QsaUJBQWlCLENBQUVuRyx3QkFBeUIsQ0FBQztVQUN6RCxJQUFJLENBQUNxRyxrQkFBa0IsR0FBRyxLQUFLO1FBQ2pDO01BQ0Y7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNPLFdBQVcsQ0FBRSxDQUNoQi9FLFlBQVksRUFDWlIsYUFBYSxFQUNiMkIsZ0JBQWdCLEVBQ2hCSSxrQkFBa0IsRUFDbEJFLHNCQUFzQixFQUN0QkMseUJBQXlCLEVBQ3pCRSxxQkFBcUIsRUFDckJJLGVBQWUsRUFDZlcsa0JBQWtCLEVBQ2xCSyxjQUFjLENBQ2QsQ0FBQzs7SUFFSDtJQUNBbkUsYUFBYSxDQUFDbUcsSUFBSSxDQUFFQyxLQUFLLElBQUk7TUFDM0I3RSxZQUFZLENBQUM4RSxXQUFXLENBQUUsQ0FBQ0QsS0FBSyxHQUFHbEIsSUFBSSxDQUFDQyxFQUFFLEdBQUcsR0FBSSxDQUFDO01BQ2xELE1BQU1tQixRQUFRLEdBQUdGLEtBQUssR0FBRyxDQUFDLEdBQ1BuSyxLQUFLLENBQUNzSyxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRXBJLGdCQUFnQixHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUNpSSxLQUFLLEdBQUdsQixJQUFJLENBQUNDLEVBQUUsR0FBRyxHQUFHLEVBQUUsSUFBSyxDQUFDLEdBQzVFbEosS0FBSyxDQUFDc0ssR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVwSSxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDaUksS0FBSyxHQUFHbEIsSUFBSSxDQUFDQyxFQUFFLEdBQUcsR0FBSSxDQUFDO01BQ3pGVCxRQUFRLENBQUM4QixRQUFRLENBQUVGLFFBQVMsQ0FBQztNQUM3QjFCLFVBQVUsQ0FBQzZCLE1BQU0sR0FBR3RLLFdBQVcsQ0FBQ2lILE1BQU0sQ0FBRTFGLHlCQUF5QixFQUFFO1FBQ2pFK0MsS0FBSyxFQUFFM0UsS0FBSyxDQUFDdUgsYUFBYSxDQUFFckQsYUFBYSxDQUFDd0MsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUM7UUFDcERjLEtBQUssRUFBRTVEO01BQ1QsQ0FBRSxDQUFDO01BQ0hpRixvQkFBb0IsQ0FBQytCLFlBQVksQ0FBRTlCLFVBQVUsQ0FBQytCLEtBQUssR0FBRyxDQUFFLENBQUM7TUFDekRoQyxvQkFBb0IsQ0FBQ2lDLGFBQWEsQ0FBRWhDLFVBQVUsQ0FBQ2lDLE1BQU8sQ0FBQztNQUN2RGxDLG9CQUFvQixDQUFDbUMsTUFBTSxHQUFHbEMsVUFBVSxDQUFDa0MsTUFBTTtJQUNqRCxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJQyxjQUFjLEdBQUcsQ0FBQzs7SUFFdEI7SUFDQSxNQUFNQyxZQUFZLEdBQUtILE1BQWMsSUFBTTtNQUN6QyxNQUFNSSxlQUFlLEdBQUdsTCxPQUFPLENBQUNtTCxJQUFJLENBQUNDLE1BQU0sQ0FBRSxDQUFDLEVBQUVqSCxpQkFBaUIsQ0FBQ08sS0FBSyxDQUFDOEIsWUFBWSxDQUFFc0UsTUFBTyxDQUFFLENBQUM7TUFDaEcsTUFBTU8sdUJBQXVCLEdBQUcsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBRWxILFVBQVUsQ0FBQ21ILGtCQUFrQixDQUFFTCxlQUFnQixDQUFFLENBQUMsQ0FBQ3BHLENBQUM7TUFFN0dVLFlBQVksQ0FBQ1YsQ0FBQyxHQUFHdUcsdUJBQXVCO01BQ3hDdEYsVUFBVSxDQUFDakIsQ0FBQyxHQUFHdUcsdUJBQXVCOztNQUV0QztNQUNBOUYsV0FBVyxDQUFDVCxDQUFDLEdBQUdELFlBQVksQ0FBQzJHLGtCQUFrQixDQUFFTixlQUFlLENBQUNPLElBQUksQ0FBRTFGLFVBQVUsQ0FBQ0ssTUFBTyxDQUFFLENBQUMsQ0FBQ3RCLENBQUMsR0FBRzdDLGNBQWMsR0FBRyxDQUFDO01BQ25IaUosZUFBZSxDQUFDUSxVQUFVLENBQUMsQ0FBQztNQUU1QixNQUFNQyxTQUFTLEdBQUcsSUFBSXpMLEtBQUssQ0FBQyxDQUFDO01BQzdCeUwsU0FBUyxDQUFDckQsTUFBTSxDQUFFLENBQUN0RyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUN0Q3VHLE1BQU0sQ0FBRSxDQUFDdkcsYUFBYSxHQUFHLENBQUMsRUFBRXVELFdBQVcsQ0FBQ1QsQ0FBRSxDQUFDLENBQzNDOEcsYUFBYSxDQUFFLENBQUMsRUFBRXJHLFdBQVcsQ0FBQ1QsQ0FBQyxFQUFFOUMsYUFBYSxHQUFHLENBQUMsRUFBRUMsY0FBYyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUVrSCxJQUFJLENBQUNDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSyxDQUFDLENBQzdGYixNQUFNLENBQUV2RyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUM5QjRKLGFBQWEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFNUosYUFBYSxHQUFHLENBQUMsRUFBRUMsY0FBYyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFa0gsSUFBSSxDQUFDQyxFQUFFLEVBQUUsS0FBTSxDQUFDLENBQ2xGeUMsS0FBSyxDQUFDLENBQUM7TUFDVnZHLFlBQVksQ0FBQ21GLFFBQVEsQ0FBRWtCLFNBQVUsQ0FBQztNQUVsQyxNQUFNRyxRQUFRLEdBQUcsSUFBSTVMLEtBQUssQ0FBQyxDQUFDO01BQzVCNEwsUUFBUSxDQUFDeEQsTUFBTSxDQUFFLENBQUN0RyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUNyQ3VHLE1BQU0sQ0FBRSxDQUFDdkcsYUFBYSxHQUFHLENBQUMsRUFBRSxDQUFDQSxhQUFhLEdBQUcsRUFBRyxDQUFDLENBQUM7TUFBQSxDQUNsRHVHLE1BQU0sQ0FBRXZHLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBQ0EsYUFBYSxHQUFHLEVBQUcsQ0FBQyxDQUFDO01BQUEsQ0FDakR1RyxNQUFNLENBQUV2RyxhQUFhLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUM5QnVHLE1BQU0sQ0FBRXZHLGFBQWEsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQzlCNEosYUFBYSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU1SixhQUFhLEdBQUcsQ0FBQyxFQUFFQyxjQUFjLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVrSCxJQUFJLENBQUNDLEVBQUUsRUFBRSxLQUFNLENBQUMsQ0FDbEZ5QyxLQUFLLENBQUMsQ0FBQzs7TUFFVjtNQUNBO01BQ0E7TUFDQWpILGFBQWEsQ0FBQ21ILFdBQVcsQ0FBRUQsUUFBUSxDQUFDRSxXQUFXLENBQUVuSCxZQUFZLENBQUNvSCxNQUFPLENBQUUsQ0FBQztNQUV4RXRGLGtCQUFrQixDQUFDdUYsYUFBYSxDQUM5QnZGLGtCQUFrQixDQUFDd0YsS0FBSyxFQUN4QnhGLGtCQUFrQixDQUFDeUYsS0FBSyxFQUN4QnpGLGtCQUFrQixDQUFDSSxJQUFJLEVBQ3ZCNUMsaUJBQWlCLENBQUNPLEtBQUssQ0FBQzhCLFlBQVksQ0FBRXNFLE1BQU8sQ0FDL0MsQ0FBQztNQUNEdkUsZ0JBQWdCLENBQUM4RixPQUFPLENBQUUxRixrQkFBa0IsQ0FBQ3dGLEtBQUssRUFBRXhGLGtCQUFrQixDQUFDeUYsS0FBSyxFQUFFekYsa0JBQWtCLENBQUNJLElBQUksRUFBRUosa0JBQWtCLENBQUMyRixJQUFLLENBQUM7TUFDaEl6RixzQkFBc0IsQ0FBQ3BCLENBQUMsR0FBR2tCLGtCQUFrQixDQUFDSSxJQUFJO01BQ2xERixzQkFBc0IsQ0FBQy9CLENBQUMsR0FBRzZCLGtCQUFrQixDQUFDMkYsSUFBSTtNQUNsRGxGLGVBQWUsQ0FBQ3NELE1BQU0sR0FBR3RLLFdBQVcsQ0FBQ2lILE1BQU0sQ0FBRXhGLGtDQUFrQyxFQUFFO1FBQy9FNkMsS0FBSyxFQUFFM0UsS0FBSyxDQUFDdUgsYUFBYSxDQUFFd0QsTUFBTSxFQUFFLENBQUUsQ0FBQztRQUN2Q3ZELEtBQUssRUFBRTlGO01BQ1QsQ0FBRSxDQUFDO01BQ0gyRixlQUFlLENBQUNsQixPQUFPLEdBQUdTLGtCQUFrQixDQUFDSSxJQUFJO01BQ2pESyxlQUFlLENBQUN0QyxDQUFDLEdBQUc2QixrQkFBa0IsQ0FBQzJGLElBQUksR0FBRyxDQUFDO01BQy9DdEYscUJBQXFCLENBQUMyRCxZQUFZLENBQUV2RCxlQUFlLENBQUN3RCxLQUFLLEdBQUcsQ0FBRSxDQUFDO01BQy9ENUQscUJBQXFCLENBQUM2RCxhQUFhLENBQUV6RCxlQUFlLENBQUMwRCxNQUFPLENBQUM7TUFDN0Q5RCxxQkFBcUIsQ0FBQytELE1BQU0sR0FBRzNELGVBQWUsQ0FBQzJELE1BQU07TUFDckRoRCxrQkFBa0IsQ0FBQ2pELENBQUMsR0FBR3NDLGVBQWUsQ0FBQ3pCLE9BQU87TUFFOUN5QyxjQUFjLENBQUN0RCxDQUFDLEdBQUdYLGlCQUFpQixDQUFDTyxLQUFLLENBQUM4QixZQUFZLENBQUVzRSxNQUFPLENBQUM7SUFDbkUsQ0FBQzs7SUFFRDtJQUNBOUcsY0FBYyxDQUFDb0csSUFBSSxDQUFFVSxNQUFNLElBQUk7TUFDN0JHLFlBQVksQ0FBRUgsTUFBTyxDQUFDO01BQ3RCLElBQUtBLE1BQU0sR0FBRyxDQUFDLElBQUk3RyxhQUFhLENBQUN3QyxHQUFHLENBQUMsQ0FBQyxHQUFHM0QsZ0JBQWdCLENBQUVnSSxNQUFNLENBQUUsRUFBRztRQUNwRTdHLGFBQWEsQ0FBQ3NJLEdBQUcsQ0FBRXpKLGdCQUFnQixDQUFFZ0ksTUFBTSxDQUFHLENBQUM7TUFDakQ7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNMEIsa0JBQWtCLEdBQUdBLENBQUEsS0FBTTtNQUUvQjtNQUNBeEIsY0FBYyxHQUFHN0csaUJBQWlCLENBQUNPLEtBQUssQ0FBQytILGlCQUFpQixDQUFFMUssYUFBYyxDQUFDLEdBQUcyRCxlQUFlLENBQUNrRixLQUFLO01BQ25HL0YsWUFBWSxDQUFDNkUsaUJBQWlCLENBQUVzQixjQUFlLENBQUM7TUFDaEQ1RixZQUFZLENBQUNzRSxpQkFBaUIsQ0FBRXNCLGNBQWUsQ0FBQztNQUNoRHhGLFlBQVksQ0FBQ2tFLGlCQUFpQixDQUFFc0IsY0FBZSxDQUFDO01BQ2hEakYsVUFBVSxDQUFDMkQsaUJBQWlCLENBQUVzQixjQUFlLENBQUM7O01BRTlDO01BQ0EsTUFBTTBCLElBQUksR0FBR3ZJLGlCQUFpQixDQUFDTyxLQUFLLENBQUM0QixZQUFZLENBQUVwRSw2QkFBOEIsQ0FBQztNQUNsRjJDLFlBQVksQ0FBQ1ksQ0FBQyxHQUFHaUgsSUFBSTtNQUNyQnRILFlBQVksQ0FBQ0ssQ0FBQyxHQUFHaUgsSUFBSTtJQUN2QixDQUFDOztJQUVEO0lBQ0F2SSxpQkFBaUIsQ0FBQ2lHLElBQUksQ0FBRSxNQUFNO01BQzVCb0Msa0JBQWtCLENBQUMsQ0FBQztNQUNwQnZCLFlBQVksQ0FBRWpILGNBQWMsQ0FBQ3lDLEdBQUcsQ0FBQyxDQUFFLENBQUM7SUFDdEMsQ0FBRSxDQUFDOztJQUVIOztJQUVBO0lBQ0EsSUFBSWtHLFVBQW1CO0lBQ3ZCLElBQUlDLFVBQWtCO0lBQ3RCLElBQUlDLGVBQXVCO0lBQzNCLElBQUlDLFVBQW1CO0lBQ3ZCLElBQUlDLFdBQW1COztJQUV2QjtJQUNBckgsZUFBZSxDQUFDc0gsZ0JBQWdCLENBQUUsSUFBSXhNLFlBQVksQ0FBRTtNQUNsRHlNLEtBQUssRUFBRUMsS0FBSyxJQUFJO1FBQ2RQLFVBQVUsR0FBRyxJQUFJLENBQUNyQixrQkFBa0IsQ0FBRTRCLEtBQUssQ0FBQ0MsT0FBTyxDQUFDQyxLQUFNLENBQUM7UUFDM0RSLFVBQVUsR0FBRzNJLGFBQWEsQ0FBQ3dDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7UUFFbEM7UUFDQW9HLGVBQWUsR0FBRzdNLE9BQU8sQ0FBQ21MLElBQUksQ0FBQ0MsTUFBTSxDQUNuQ3VCLFVBQVUsQ0FBQ2xILENBQUMsR0FBR00sVUFBVSxDQUFDTixDQUFDLEVBQzNCa0gsVUFBVSxDQUFDN0gsQ0FBQyxHQUFHWCxpQkFBaUIsQ0FBQ3NDLEdBQUcsQ0FBQyxDQUFDLENBQUNELFlBQVksQ0FBRXhDLGNBQWMsQ0FBQ3lDLEdBQUcsQ0FBQyxDQUFFLENBQzVFLENBQUMsQ0FBQzRELEtBQUs7TUFDVCxDQUFDO01BQ0RnRCxJQUFJLEVBQUVILEtBQUssSUFBSTtRQUNiSixVQUFVLEdBQUcsSUFBSSxDQUFDeEIsa0JBQWtCLENBQUU0QixLQUFLLENBQUNDLE9BQU8sQ0FBQ0MsS0FBTSxDQUFDO1FBRTNELE1BQU1FLGVBQWUsR0FBR3ROLE9BQU8sQ0FBQ21MLElBQUksQ0FBQ0MsTUFBTSxDQUN6QzBCLFVBQVUsQ0FBQ3JILENBQUMsR0FBR00sVUFBVSxDQUFDTixDQUFDLEVBQzNCcUgsVUFBVSxDQUFDaEksQ0FBQyxHQUFHWCxpQkFBaUIsQ0FBQ3NDLEdBQUcsQ0FBQyxDQUFDLENBQUNELFlBQVksQ0FBRXhDLGNBQWMsQ0FBQ3lDLEdBQUcsQ0FBQyxDQUFFLENBQzVFLENBQUMsQ0FBQzRELEtBQUs7UUFDUCxNQUFNa0QsV0FBVyxHQUFHVixlQUFlLEdBQUdTLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU1FLG9CQUFvQixHQUFHRCxXQUFXLEdBQUcsR0FBRyxHQUFHcEUsSUFBSSxDQUFDQyxFQUFFLENBQUMsQ0FBQzs7UUFFMUQsTUFBTXFFLGlCQUFpQixHQUFHYixVQUFVLEdBQUdZLG9CQUFvQjtRQUUzRCxNQUFNRSxVQUFVLEdBQUcxSixjQUFjLENBQUN5QyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJM0csS0FBSyxDQUFFZ0QsZ0JBQWdCLENBQUVrQixjQUFjLENBQUN5QyxHQUFHLENBQUMsQ0FBQyxDQUFFLEVBQUUsRUFBRyxDQUFDLEdBQUdwRSxXQUFXOztRQUVySDtRQUNBLElBQUtxTCxVQUFVLENBQUNDLFFBQVEsQ0FBRUYsaUJBQWtCLENBQUMsRUFBRztVQUM5QyxNQUFNRyxLQUFLLEdBQUd2SixlQUFlLEVBQUV3SixrQkFBa0IsR0FBRyxDQUFDLEdBQUcsQ0FBQztVQUN6RDVKLGFBQWEsQ0FBQ3NJLEdBQUcsQ0FBRXhNLEtBQUssQ0FBQytOLGNBQWMsQ0FBRUwsaUJBQWlCLEdBQUdHLEtBQU0sQ0FBQyxHQUFHQSxLQUFNLENBQUM7UUFDaEY7O1FBRUE7UUFBQSxLQUNLLElBQUtGLFVBQVUsQ0FBQ0ssR0FBRyxHQUFHTCxVQUFVLENBQUNNLEdBQUcsR0FBRyxDQUFDLEdBQUcvSixhQUFhLENBQUN3QyxHQUFHLENBQUMsQ0FBQyxFQUFHO1VBQ3BFeEMsYUFBYSxDQUFDc0ksR0FBRyxDQUFFbUIsVUFBVSxDQUFDSyxHQUFJLENBQUM7UUFDckM7O1FBRUE7UUFBQSxLQUNLO1VBQ0g5SixhQUFhLENBQUNzSSxHQUFHLENBQUVtQixVQUFVLENBQUNNLEdBQUksQ0FBQztRQUNyQztNQUVGLENBQUM7TUFDREMsc0JBQXNCLEVBQUUsSUFBSTtNQUM1QkMsY0FBYyxFQUFFLElBQUk7TUFDcEIzSixNQUFNLEVBQUVELE9BQU8sQ0FBQ0MsTUFBTSxDQUFDaUQsWUFBWSxDQUFFLHVCQUF3QixDQUFDO01BQzlEMkcsaUNBQWlDLEVBQUU7SUFDckMsQ0FBRSxDQUFFLENBQUM7O0lBRUw7SUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJNU4sWUFBWSxDQUFFO01BQzNDeU0sS0FBSyxFQUFFQyxLQUFLLElBQUk7UUFDZFAsVUFBVSxHQUFHLElBQUksQ0FBQ3JCLGtCQUFrQixDQUFFNEIsS0FBSyxDQUFDQyxPQUFPLENBQUNDLEtBQU0sQ0FBQztRQUMzREwsV0FBVyxHQUFHNUksaUJBQWlCLENBQUNPLEtBQUssQ0FBQzhCLFlBQVksQ0FBRXhDLGNBQWMsQ0FBQ3lDLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDO01BQzlFLENBQUM7O01BRUQ0RyxJQUFJLEVBQUVILEtBQUssSUFBSTtRQUNiSixVQUFVLEdBQUcsSUFBSSxDQUFDeEIsa0JBQWtCLENBQUU0QixLQUFLLENBQUNDLE9BQU8sQ0FBQ0MsS0FBTSxDQUFDO1FBQzNELE1BQU1pQixZQUFZLEdBQUd2QixVQUFVLENBQUNoSSxDQUFDLEdBQUc2SCxVQUFVLENBQUM3SCxDQUFDO1FBRWhELE1BQU13SixrQkFBa0IsR0FBR25LLGlCQUFpQixDQUFDc0MsR0FBRyxDQUFDLENBQUMsQ0FBQzhILFlBQVksQ0FBRXhCLFdBQVcsR0FBR3NCLFlBQWEsQ0FBQzs7UUFFN0Y7UUFDQSxJQUFLOUwsWUFBWSxDQUFDb0wsUUFBUSxDQUFFVyxrQkFBbUIsQ0FBQyxFQUFHO1VBQ2pEdEssY0FBYyxDQUFDdUksR0FBRyxDQUFFeE0sS0FBSyxDQUFDK04sY0FBYyxDQUFFUSxrQkFBbUIsQ0FBRSxDQUFDO1FBQ2xFO1FBQ0E7UUFBQSxLQUNLLElBQUsvTCxZQUFZLENBQUN3TCxHQUFHLEdBQUd4TCxZQUFZLENBQUN5TCxHQUFHLEdBQUcsQ0FBQyxHQUFHaEssY0FBYyxDQUFDeUMsR0FBRyxDQUFDLENBQUMsRUFBRztVQUN6RXpDLGNBQWMsQ0FBQ3VJLEdBQUcsQ0FBRWhLLFlBQVksQ0FBQ3dMLEdBQUksQ0FBQztRQUN4QztRQUNBO1FBQUEsS0FDSztVQUNIL0osY0FBYyxDQUFDdUksR0FBRyxDQUFFaEssWUFBWSxDQUFDeUwsR0FBSSxDQUFDO1FBQ3hDO01BQ0YsQ0FBQztNQUVEUSxHQUFHLEVBQUVBLENBQUEsS0FBTTtRQUNUekcsa0JBQWtCLENBQUNJLE9BQU8sR0FBRyxLQUFLO01BQ3BDLENBQUM7TUFDRDhGLHNCQUFzQixFQUFFLElBQUk7TUFDNUJDLGNBQWMsRUFBRSxJQUFJO01BQ3BCM0osTUFBTSxFQUFFRCxPQUFPLENBQUNDLE1BQU0sQ0FBQ2lELFlBQVksQ0FBRSxvQkFBcUIsQ0FBQztNQUMzRDJHLGlDQUFpQyxFQUFFO0lBQ3JDLENBQUUsQ0FBQzs7SUFFSDtJQUNBcEksVUFBVSxDQUFDaUgsZ0JBQWdCLENBQUVvQixrQkFBbUIsQ0FBQztJQUNqRDlJLFlBQVksQ0FBQzBILGdCQUFnQixDQUFFb0Isa0JBQW1CLENBQUM7SUFDbkQ3SSxXQUFXLENBQUN5SCxnQkFBZ0IsQ0FBRW9CLGtCQUFtQixDQUFDO0lBQ2xEdkksZ0JBQWdCLENBQUNtSCxnQkFBZ0IsQ0FBRW9CLGtCQUFtQixDQUFDO0lBQ3ZEaEgsZUFBZSxDQUFDNEYsZ0JBQWdCLENBQUVvQixrQkFBbUIsQ0FBQztJQUN0RHJHLGtCQUFrQixDQUFDaUYsZ0JBQWdCLENBQUVvQixrQkFBbUIsQ0FBQztJQUV6REEsa0JBQWtCLENBQUNLLGVBQWUsQ0FBQ0MsYUFBYSxDQUFFM0csa0JBQWtCLEVBQUUsU0FBVSxDQUFDO0VBQ25GO0VBRU80RyxLQUFLQSxDQUFBLEVBQVM7SUFDbkIsSUFBSSxDQUFDOUUsZ0JBQWdCLEdBQUcsQ0FBQztJQUN6QixJQUFJLENBQUM5QixrQkFBa0IsQ0FBQ0ksT0FBTyxHQUFHLElBQUksQ0FBQ0YsYUFBYTtFQUN0RDtFQUVPMkcsV0FBV0EsQ0FBQSxFQUFTO0lBQ3pCLElBQUksQ0FBQ2hGLGtCQUFrQixHQUFHLElBQUk7SUFDOUIsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxDQUFDO0VBQzNCO0FBQ0Y7QUFFQSxNQUFNSSxxREFBcUQsR0FBSzRFLG1CQUEyQixJQUFjO0VBQ3ZHLE9BQU8sQ0FBQzFGLElBQUksQ0FBQ0ksR0FBRyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBR3NGLG1CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEQsQ0FBQzs7QUFFRHhOLGdCQUFnQixDQUFDeU4sUUFBUSxDQUFFLFlBQVksRUFBRWhMLFVBQVcsQ0FBQztBQUVyRCxlQUFlQSxVQUFVIn0=