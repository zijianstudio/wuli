// Copyright 2017-2023, University of Colorado Boulder

/**
 * Node responsible for representing the mass object.
 *
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, DragListener, Line, LinearGradient, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import massesAndSprings from '../../massesAndSprings.js';
import MassesAndSpringsStrings from '../../MassesAndSpringsStrings.js';
import MassesAndSpringsConstants from '../MassesAndSpringsConstants.js';
import ForcesMode from '../model/ForcesMode.js';
import ForceVectorArrow from './ForceVectorArrow.js';
import VectorArrow from './VectorArrow.js';
const massValueString = MassesAndSpringsStrings.massValue;
const questionMarkString = MassesAndSpringsStrings.questionMark;

// constants
const ARROW_SIZE_DEFAULT = 25;
class MassNode extends Node {
  /**
   * @param {Mass} mass - model object
   * @param {ModelViewTransform2} modelViewTransform2
   * @param {Property.<Bounds2>} dragBoundsProperty
   * @param {MassesAndSpringsModel} model
   * @param {Tandem} tandem
   */
  constructor(mass, modelViewTransform2, dragBoundsProperty, model, tandem) {
    super({
      cursor: 'pointer'
    });

    // @public {Mass} (read-only)
    this.mass = mass;

    // @public (read-write) determines if the mass's velocity is below a specific value, so the period trace is hidden.
    this.thresholdReached = false;
    let hookHeight = modelViewTransform2.modelToViewDeltaY(-MassesAndSpringsConstants.HOOK_HEIGHT);
    if (mass.icon) {
      hookHeight = modelViewTransform2.modelToViewDeltaY(-MassesAndSpringsConstants.HOOK_HEIGHT * 0.34);
    }

    // @public {Rectangle}
    this.rect = new Rectangle({
      stroke: 'black',
      boundsMethod: 'unstroked',
      lineWidth: 0.5
    });
    this.addChild(this.rect);

    // Bounds that limit where we can drag our mass should be dependent on how large our mass is
    const modelBoundsProperty = new DerivedProperty([dragBoundsProperty, mass.heightProperty], (dragBounds, massHeight) => {
      const modelBounds = modelViewTransform2.viewToModelBounds(dragBounds);
      modelBounds.minY += massHeight;
      return modelBounds;
    });

    // Update the size of the massNode. Link exists for sim duration. No need to unlink.
    mass.radiusProperty.link(radiusValue => {
      this.rect.rectBounds = new Bounds2(modelViewTransform2.modelToViewDeltaX(-radiusValue), hookHeight, modelViewTransform2.modelToViewDeltaX(radiusValue), modelViewTransform2.modelToViewDeltaY(-mass.cylinderHeightProperty.get()) + hookHeight);
      this.rect.fill = new LinearGradient(-this.rect.width / 2, 0, this.rect.width / 2, 0).addColorStop(0, Color.toColor(mass.color).colorUtilsBrighter(0.3)).addColorStop(0.2, Color.toColor(mass.color).colorUtilsBrighter(0.8)).addColorStop(0.7, mass.color);

      // We are constraining the draggable bounds on our massNodes except when the mass is attached to a spring.
      const minY = mass.userControlledProperty.value ? modelBoundsProperty.value.minY : MassesAndSpringsConstants.FLOOR_Y + MassesAndSpringsConstants.SHELF_HEIGHT + mass.heightProperty.value;
      if (mass.positionProperty.value.y < minY && !mass.springProperty.value) {
        mass.positionProperty.set(new Vector2(mass.positionProperty.value.x, minY));
      }
    });

    // Sets the gradient on the massNode.
    this.rect.fill = new LinearGradient(-this.rect.width / 2, 0, this.rect.width / 2, 0).addColorStop(0, Color.toColor(mass.color).colorUtilsBrighter(0.1)).addColorStop(0.2, Color.toColor(mass.color).colorUtilsBrighter(0.6)).addColorStop(0.7, mass.color);
    const hookShape = new Shape();
    const radius = hookHeight / 4;
    hookShape.arc(0, 0, radius, Math.PI, 0.5 * Math.PI);
    hookShape.lineTo(0, hookHeight / 2);

    // @public {Path} Used for hook on massNode.
    this.hookNode = new Path(hookShape, {
      stroke: 'black',
      lineWidth: 1.5,
      lineCap: 'round',
      centerX: this.rect.centerX,
      boundsMethod: 'unstroked',
      bottom: this.rect.top
    });
    this.addChild(this.hookNode);

    // Background added so all of svg elements are painted.
    // See https://github.com/phetsims/masses-and-springs/issues/278
    this.background = new Rectangle(this.bounds.dilated(1.25), {
      pickable: false,
      fill: 'transparent'
    });
    this.addChild(this.background);
    if (!mass.icon) {
      const labelString = mass.mysteryLabel ? questionMarkString : StringUtils.fillIn(massValueString, {
        mass: mass.mass * 1000
      });
      const label = new Text(labelString, {
        font: new PhetFont({
          size: 12,
          weight: 'bold'
        }),
        centerY: this.rect.centerY,
        centerX: 0,
        pickable: false,
        maxWidth: !mass.adjustable ? this.rect.width : 30,
        // Adjustable masses require smaller label maxWidth.
        tandem: tandem.createTandem('labelText')
      });
      this.addChild(label);
      mass.massProperty.link(() => {
        label.center = this.rect.center;
      });

      // Adjust the mass label for adjustable masses.
      if (this.mass.adjustable) {
        this.mass.massProperty.link(massValue => {
          label.setString(StringUtils.fillIn(massValueString, {
            mass: Utils.roundSymmetric(massValue * 1000)
          }));
          label.center = this.rect.center;
        });
      }
    }

    // Handler that moves the particle in model space.
    const onDrag = () => {
      if (this.mass.springProperty.value) {
        this.mass.springProperty.value.buttonEnabledProperty.set(false);
      }

      // Checks if mass should be attached/detached to spring and adjusts its position if so.
      model.adjustDraggedMassPosition(this.mass, dragBoundsProperty.value);
    };

    // @public {DragListener} (read-write)
    this.dragListener = new DragListener({
      positionProperty: this.mass.positionProperty,
      useParentOffset: true,
      // Allow moving a finger (touch) across a node to pick it up.
      dragBoundsProperty: modelBoundsProperty,
      allowTouchSnag: true,
      transform: modelViewTransform2,
      tandem: tandem.createTandem('dragListener'),
      start: () => {
        onDrag();
        mass.userControlledProperty.set(true);
        if (this.mass.springProperty.value) {
          this.mass.springProperty.value.buttonEnabledProperty.set(false);
        }
        this.moveToFront();
      },
      end: () => {
        onDrag();
        mass.userControlledProperty.set(false);
        if (mass.springProperty.value) {
          mass.springProperty.value.periodTraceResetEmitter.emit();
        }
      }
    });
    this.mass.positionProperty.link(position => {
      this.translation = modelViewTransform2.modelToViewPosition(position);
    });
    Multilink.multilink([mass.userControlledProperty, modelBoundsProperty], (userControlled, modelDragBounds) => {
      // Masses won't jump back into the model bounds attached to spring.
      // See https://github.com/phetsims/masses-and-springs/issues/291
      if (mass.springProperty.value && !userControlled) {
        this.dragListener.dragBounds.set(Bounds2.EVERYTHING);
      } else {
        this.dragListener.dragBounds.set(modelDragBounds);
      }
    });
    this.addInputListener(this.dragListener);
    const forceNullLine = new Line({
      stroke: 'black',
      cursor: 'pointer'
    });

    // Arrows created for vectors associated with mass nodes
    const velocityArrow = new VectorArrow(MassesAndSpringsConstants.VELOCITY_ARROW_COLOR);
    const accelerationArrow = new VectorArrow(MassesAndSpringsConstants.ACCELERATION_ARROW_COLOR);
    const gravityForceArrow = new ForceVectorArrow(MassesAndSpringsConstants.GRAVITY_ARROW_COLOR);
    const springForceArrow = new ForceVectorArrow(MassesAndSpringsConstants.SPRING_ARROW_COLOR);
    const netForceArrow = new ForceVectorArrow('black');
    if (!mass.icon) {
      this.addChild(velocityArrow);
      this.addChild(accelerationArrow);
      this.addChild(gravityForceArrow);
      this.addChild(springForceArrow);
      this.addChild(netForceArrow);
      this.addChild(forceNullLine);
    }

    // Used to position the vectors on the left of right side of the massNode depending on the attached spring.
    let forcesOrientation = 1;
    this.mass.springProperty.link(spring => {
      if (spring) {
        forcesOrientation = spring.forcesOrientationProperty.value;
      }
    });

    /**
     * Show/hide the velocity and acceleration arrows when appropriate
     * @param {Property.<boolean>} arrowVisibilityProperty
     * @param {Node} arrowNode
     *
     */
    const updateArrowVisibility = (arrowVisibilityProperty, arrowNode) => {
      Multilink.multilink([mass.springProperty, arrowVisibilityProperty, mass.userControlledProperty], (spring, vectorVisibility, userControlled) => {
        arrowNode.visible = !!spring && vectorVisibility && !userControlled;
      });
    };

    /**
     * Show/hide the spring and gravity force vectors when appropriate
     * @param {Property.<boolean>} arrowVisibilityProperty
     * @param {Node} arrowNode
     *
     */
    const updateForceVisibility = (arrowVisibilityProperty, arrowNode) => {
      Multilink.multilink([mass.springProperty, arrowVisibilityProperty, model.forcesModeProperty], (spring, springVectorVisibility, forcesMode) => {
        arrowNode.visible = !!spring && springVectorVisibility && forcesMode === ForcesMode.FORCES;
      });
    };

    // Show/hide the velocity arrow
    updateArrowVisibility(model.velocityVectorVisibilityProperty, velocityArrow);

    // Show/hide the acceleration arrow
    updateArrowVisibility(model.accelerationVectorVisibilityProperty, accelerationArrow);

    // Show/hide the spring force arrow
    updateForceVisibility(model.springVectorVisibilityProperty, springForceArrow);

    // Show/hide the gravity force arrow
    updateForceVisibility(model.gravityVectorVisibilityProperty, gravityForceArrow);

    // Show/hide the net force arrow
    Multilink.multilink([mass.springProperty, model.forcesModeProperty], (spring, forcesMode) => {
      netForceArrow.visible = !!spring && forcesMode === ForcesMode.NET_FORCES;
    });

    // Show/hide line at base of vectors
    Multilink.multilink([mass.springProperty, model.gravityVectorVisibilityProperty, model.springVectorVisibilityProperty, model.forcesModeProperty], (spring, gravityForceVisible, springForceVisible, forcesMode) => {
      forceNullLine.visible = !!spring && (gravityForceVisible || springForceVisible || forcesMode === ForcesMode.NET_FORCES);
    });

    /**
     * Updates the arrow by using .setTailAndTip(). Used to make code concise.
     *
     * @param {VectorArrow|ForceVectorArrow} arrow - arrow to be updated
     * @param {Vector2} position
     * @param {number} xOffset
     * @param {number} y2 - number that will be used for y2 value in setTailAndTip()
     */
    const updateArrow = (arrow, position, xOffset, y2) => {
      arrow.setTailAndTip(this.rect.centerX + xOffset, position.y + this.rect.centerY, this.rect.centerX + xOffset, position.y + this.rect.centerY + y2);
    };

    // Links for handling the length of the vectors in response to the system.
    const scalingFactor = 3;
    let xOffset;
    let y2;
    let position;
    Multilink.multilink([mass.verticalVelocityProperty, model.accelerationVectorVisibilityProperty], (velocity, accelerationVisible) => {
      xOffset = accelerationVisible ? -8 : 0;
      position = mass.positionProperty.get();
      y2 = -ARROW_SIZE_DEFAULT * velocity * scalingFactor;
      updateArrow(velocityArrow, position, xOffset, y2);
    });

    // When gravity changes, update the gravitational force arrow
    Multilink.multilink([mass.springProperty, mass.gravityProperty], (spring, gravity) => {
      const gravitationalAcceleration = mass.mass * gravity;
      position = mass.positionProperty.get();
      xOffset = forcesOrientation * 45;
      y2 = ARROW_SIZE_DEFAULT * gravitationalAcceleration;
      updateArrow(gravityForceArrow, position, xOffset, y2);
    });

    // When the spring force changes, update the spring force arrow
    Multilink.multilink([mass.springForceProperty], springForce => {
      position = mass.positionProperty.get();
      xOffset = forcesOrientation * 45;
      y2 = -ARROW_SIZE_DEFAULT * springForce;
      updateArrow(springForceArrow, position, xOffset, y2);
    });

    // When net force changes changes, update the net force arrow
    assert && assert(mass.springProperty.get() === null, 'We currently assume that the masses don\'t start attached to the springs');
    Multilink.multilink([mass.netForceProperty, model.accelerationVectorVisibilityProperty, mass.accelerationProperty, model.velocityVectorVisibilityProperty], (netForce, accelerationVisible, netAcceleration, velocityVisible) => {
      position = mass.positionProperty.get();
      if (Math.abs(netForce) > 1E-6) {
        xOffset = forcesOrientation * 45;
        y2 = -ARROW_SIZE_DEFAULT * netForce;
        updateArrow(netForceArrow, position, xOffset, y2);
      } else {
        netForceArrow.setTailAndTip(0, 0, 0, 0);
      }
      if (Math.abs(netAcceleration) > 1E-6) {
        xOffset = velocityVisible ? 8 : 0;
        y2 = -ARROW_SIZE_DEFAULT * netAcceleration / scalingFactor;
        updateArrow(accelerationArrow, position, xOffset, y2);
      } else {
        accelerationArrow.setTailAndTip(0, 0, 0, 0);
      }
    });

    // When the mass's position changes update the forces baseline marker
    mass.positionProperty.link(position => {
      forceNullLine.setLine(this.rect.centerX + forcesOrientation * 40, position.y + this.rect.centerY, this.rect.centerX + forcesOrientation * 50, position.y + this.rect.centerY);
    });
  }
}
massesAndSprings.register('MassNode', MassNode);
export default MassNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJCb3VuZHMyIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJTdHJpbmdVdGlscyIsIlBoZXRGb250IiwiQ29sb3IiLCJEcmFnTGlzdGVuZXIiLCJMaW5lIiwiTGluZWFyR3JhZGllbnQiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJtYXNzZXNBbmRTcHJpbmdzIiwiTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MiLCJNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzIiwiRm9yY2VzTW9kZSIsIkZvcmNlVmVjdG9yQXJyb3ciLCJWZWN0b3JBcnJvdyIsIm1hc3NWYWx1ZVN0cmluZyIsIm1hc3NWYWx1ZSIsInF1ZXN0aW9uTWFya1N0cmluZyIsInF1ZXN0aW9uTWFyayIsIkFSUk9XX1NJWkVfREVGQVVMVCIsIk1hc3NOb2RlIiwiY29uc3RydWN0b3IiLCJtYXNzIiwibW9kZWxWaWV3VHJhbnNmb3JtMiIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsIm1vZGVsIiwidGFuZGVtIiwiY3Vyc29yIiwidGhyZXNob2xkUmVhY2hlZCIsImhvb2tIZWlnaHQiLCJtb2RlbFRvVmlld0RlbHRhWSIsIkhPT0tfSEVJR0hUIiwiaWNvbiIsInJlY3QiLCJzdHJva2UiLCJib3VuZHNNZXRob2QiLCJsaW5lV2lkdGgiLCJhZGRDaGlsZCIsIm1vZGVsQm91bmRzUHJvcGVydHkiLCJoZWlnaHRQcm9wZXJ0eSIsImRyYWdCb3VuZHMiLCJtYXNzSGVpZ2h0IiwibW9kZWxCb3VuZHMiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsIm1pblkiLCJyYWRpdXNQcm9wZXJ0eSIsImxpbmsiLCJyYWRpdXNWYWx1ZSIsInJlY3RCb3VuZHMiLCJtb2RlbFRvVmlld0RlbHRhWCIsImN5bGluZGVySGVpZ2h0UHJvcGVydHkiLCJnZXQiLCJmaWxsIiwid2lkdGgiLCJhZGRDb2xvclN0b3AiLCJ0b0NvbG9yIiwiY29sb3IiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwidmFsdWUiLCJGTE9PUl9ZIiwiU0hFTEZfSEVJR0hUIiwicG9zaXRpb25Qcm9wZXJ0eSIsInkiLCJzcHJpbmdQcm9wZXJ0eSIsInNldCIsIngiLCJob29rU2hhcGUiLCJyYWRpdXMiLCJhcmMiLCJNYXRoIiwiUEkiLCJsaW5lVG8iLCJob29rTm9kZSIsImxpbmVDYXAiLCJjZW50ZXJYIiwiYm90dG9tIiwidG9wIiwiYmFja2dyb3VuZCIsImJvdW5kcyIsImRpbGF0ZWQiLCJwaWNrYWJsZSIsImxhYmVsU3RyaW5nIiwibXlzdGVyeUxhYmVsIiwiZmlsbEluIiwibGFiZWwiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsImNlbnRlclkiLCJtYXhXaWR0aCIsImFkanVzdGFibGUiLCJjcmVhdGVUYW5kZW0iLCJtYXNzUHJvcGVydHkiLCJjZW50ZXIiLCJzZXRTdHJpbmciLCJyb3VuZFN5bW1ldHJpYyIsIm9uRHJhZyIsImJ1dHRvbkVuYWJsZWRQcm9wZXJ0eSIsImFkanVzdERyYWdnZWRNYXNzUG9zaXRpb24iLCJkcmFnTGlzdGVuZXIiLCJ1c2VQYXJlbnRPZmZzZXQiLCJhbGxvd1RvdWNoU25hZyIsInRyYW5zZm9ybSIsInN0YXJ0IiwibW92ZVRvRnJvbnQiLCJlbmQiLCJwZXJpb2RUcmFjZVJlc2V0RW1pdHRlciIsImVtaXQiLCJwb3NpdGlvbiIsInRyYW5zbGF0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsIm11bHRpbGluayIsInVzZXJDb250cm9sbGVkIiwibW9kZWxEcmFnQm91bmRzIiwiRVZFUllUSElORyIsImFkZElucHV0TGlzdGVuZXIiLCJmb3JjZU51bGxMaW5lIiwidmVsb2NpdHlBcnJvdyIsIlZFTE9DSVRZX0FSUk9XX0NPTE9SIiwiYWNjZWxlcmF0aW9uQXJyb3ciLCJBQ0NFTEVSQVRJT05fQVJST1dfQ09MT1IiLCJncmF2aXR5Rm9yY2VBcnJvdyIsIkdSQVZJVFlfQVJST1dfQ09MT1IiLCJzcHJpbmdGb3JjZUFycm93IiwiU1BSSU5HX0FSUk9XX0NPTE9SIiwibmV0Rm9yY2VBcnJvdyIsImZvcmNlc09yaWVudGF0aW9uIiwic3ByaW5nIiwiZm9yY2VzT3JpZW50YXRpb25Qcm9wZXJ0eSIsInVwZGF0ZUFycm93VmlzaWJpbGl0eSIsImFycm93VmlzaWJpbGl0eVByb3BlcnR5IiwiYXJyb3dOb2RlIiwidmVjdG9yVmlzaWJpbGl0eSIsInZpc2libGUiLCJ1cGRhdGVGb3JjZVZpc2liaWxpdHkiLCJmb3JjZXNNb2RlUHJvcGVydHkiLCJzcHJpbmdWZWN0b3JWaXNpYmlsaXR5IiwiZm9yY2VzTW9kZSIsIkZPUkNFUyIsInZlbG9jaXR5VmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5IiwiYWNjZWxlcmF0aW9uVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5Iiwic3ByaW5nVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5IiwiZ3Jhdml0eVZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eSIsIk5FVF9GT1JDRVMiLCJncmF2aXR5Rm9yY2VWaXNpYmxlIiwic3ByaW5nRm9yY2VWaXNpYmxlIiwidXBkYXRlQXJyb3ciLCJhcnJvdyIsInhPZmZzZXQiLCJ5MiIsInNldFRhaWxBbmRUaXAiLCJzY2FsaW5nRmFjdG9yIiwidmVydGljYWxWZWxvY2l0eVByb3BlcnR5IiwidmVsb2NpdHkiLCJhY2NlbGVyYXRpb25WaXNpYmxlIiwiZ3Jhdml0eVByb3BlcnR5IiwiZ3Jhdml0eSIsImdyYXZpdGF0aW9uYWxBY2NlbGVyYXRpb24iLCJzcHJpbmdGb3JjZVByb3BlcnR5Iiwic3ByaW5nRm9yY2UiLCJhc3NlcnQiLCJuZXRGb3JjZVByb3BlcnR5IiwiYWNjZWxlcmF0aW9uUHJvcGVydHkiLCJuZXRGb3JjZSIsIm5ldEFjY2VsZXJhdGlvbiIsInZlbG9jaXR5VmlzaWJsZSIsImFicyIsInNldExpbmUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hc3NOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgcmVzcG9uc2libGUgZm9yIHJlcHJlc2VudGluZyB0aGUgbWFzcyBvYmplY3QuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBEcmFnTGlzdGVuZXIsIExpbmUsIExpbmVhckdyYWRpZW50LCBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWFzc2VzQW5kU3ByaW5ncyBmcm9tICcuLi8uLi9tYXNzZXNBbmRTcHJpbmdzLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzIGZyb20gJy4uLy4uL01hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMgZnJvbSAnLi4vTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGb3JjZXNNb2RlIGZyb20gJy4uL21vZGVsL0ZvcmNlc01vZGUuanMnO1xyXG5pbXBvcnQgRm9yY2VWZWN0b3JBcnJvdyBmcm9tICcuL0ZvcmNlVmVjdG9yQXJyb3cuanMnO1xyXG5pbXBvcnQgVmVjdG9yQXJyb3cgZnJvbSAnLi9WZWN0b3JBcnJvdy5qcyc7XHJcblxyXG5jb25zdCBtYXNzVmFsdWVTdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5tYXNzVmFsdWU7XHJcbmNvbnN0IHF1ZXN0aW9uTWFya1N0cmluZyA9IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLnF1ZXN0aW9uTWFyaztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBBUlJPV19TSVpFX0RFRkFVTFQgPSAyNTtcclxuXHJcbmNsYXNzIE1hc3NOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYXNzfSBtYXNzIC0gbW9kZWwgb2JqZWN0XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm0yXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Qm91bmRzMj59IGRyYWdCb3VuZHNQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7TWFzc2VzQW5kU3ByaW5nc01vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbWFzcywgbW9kZWxWaWV3VHJhbnNmb3JtMiwgZHJhZ0JvdW5kc1Byb3BlcnR5LCBtb2RlbCwgdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHsgY3Vyc29yOiAncG9pbnRlcicgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge01hc3N9IChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLm1hc3MgPSBtYXNzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpIGRldGVybWluZXMgaWYgdGhlIG1hc3MncyB2ZWxvY2l0eSBpcyBiZWxvdyBhIHNwZWNpZmljIHZhbHVlLCBzbyB0aGUgcGVyaW9kIHRyYWNlIGlzIGhpZGRlbi5cclxuICAgIHRoaXMudGhyZXNob2xkUmVhY2hlZCA9IGZhbHNlO1xyXG5cclxuICAgIGxldCBob29rSGVpZ2h0ID0gbW9kZWxWaWV3VHJhbnNmb3JtMi5tb2RlbFRvVmlld0RlbHRhWSggLU1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuSE9PS19IRUlHSFQgKTtcclxuICAgIGlmICggbWFzcy5pY29uICkge1xyXG4gICAgICBob29rSGVpZ2h0ID0gbW9kZWxWaWV3VHJhbnNmb3JtMi5tb2RlbFRvVmlld0RlbHRhWSggLU1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuSE9PS19IRUlHSFQgKiAwLjM0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UmVjdGFuZ2xlfVxyXG4gICAgdGhpcy5yZWN0ID0gbmV3IFJlY3RhbmdsZSgge1xyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGJvdW5kc01ldGhvZDogJ3Vuc3Ryb2tlZCcsXHJcbiAgICAgIGxpbmVXaWR0aDogMC41XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJlY3QgKTtcclxuXHJcbiAgICAvLyBCb3VuZHMgdGhhdCBsaW1pdCB3aGVyZSB3ZSBjYW4gZHJhZyBvdXIgbWFzcyBzaG91bGQgYmUgZGVwZW5kZW50IG9uIGhvdyBsYXJnZSBvdXIgbWFzcyBpc1xyXG4gICAgY29uc3QgbW9kZWxCb3VuZHNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgZHJhZ0JvdW5kc1Byb3BlcnR5LCBtYXNzLmhlaWdodFByb3BlcnR5IF0sXHJcbiAgICAgICggZHJhZ0JvdW5kcywgbWFzc0hlaWdodCApID0+IHtcclxuICAgICAgICBjb25zdCBtb2RlbEJvdW5kcyA9IG1vZGVsVmlld1RyYW5zZm9ybTIudmlld1RvTW9kZWxCb3VuZHMoIGRyYWdCb3VuZHMgKTtcclxuICAgICAgICBtb2RlbEJvdW5kcy5taW5ZICs9IG1hc3NIZWlnaHQ7XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsQm91bmRzO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBzaXplIG9mIHRoZSBtYXNzTm9kZS4gTGluayBleGlzdHMgZm9yIHNpbSBkdXJhdGlvbi4gTm8gbmVlZCB0byB1bmxpbmsuXHJcbiAgICBtYXNzLnJhZGl1c1Byb3BlcnR5LmxpbmsoIHJhZGl1c1ZhbHVlID0+IHtcclxuXHJcbiAgICAgIHRoaXMucmVjdC5yZWN0Qm91bmRzID0gbmV3IEJvdW5kczIoXHJcbiAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtMi5tb2RlbFRvVmlld0RlbHRhWCggLXJhZGl1c1ZhbHVlICksXHJcbiAgICAgICAgaG9va0hlaWdodCxcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0yLm1vZGVsVG9WaWV3RGVsdGFYKCByYWRpdXNWYWx1ZSApLFxyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTIubW9kZWxUb1ZpZXdEZWx0YVkoIC1tYXNzLmN5bGluZGVySGVpZ2h0UHJvcGVydHkuZ2V0KCkgKSArIGhvb2tIZWlnaHQgKTtcclxuXHJcbiAgICAgIHRoaXMucmVjdC5maWxsID0gbmV3IExpbmVhckdyYWRpZW50KCAtdGhpcy5yZWN0LndpZHRoIC8gMiwgMCwgdGhpcy5yZWN0LndpZHRoIC8gMiwgMCApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgQ29sb3IudG9Db2xvciggbWFzcy5jb2xvciApLmNvbG9yVXRpbHNCcmlnaHRlciggMC4zICkgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAuMiwgQ29sb3IudG9Db2xvciggbWFzcy5jb2xvciApLmNvbG9yVXRpbHNCcmlnaHRlciggMC44ICkgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAuNywgbWFzcy5jb2xvciApO1xyXG5cclxuICAgICAgLy8gV2UgYXJlIGNvbnN0cmFpbmluZyB0aGUgZHJhZ2dhYmxlIGJvdW5kcyBvbiBvdXIgbWFzc05vZGVzIGV4Y2VwdCB3aGVuIHRoZSBtYXNzIGlzIGF0dGFjaGVkIHRvIGEgc3ByaW5nLlxyXG4gICAgICBjb25zdCBtaW5ZID0gbWFzcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlID9cclxuICAgICAgICAgICAgICAgICAgIG1vZGVsQm91bmRzUHJvcGVydHkudmFsdWUubWluWSA6XHJcbiAgICAgICAgICAgICAgICAgICBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLkZMT09SX1kgKyBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLlNIRUxGX0hFSUdIVCArIG1hc3MuaGVpZ2h0UHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICBpZiAoIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55IDwgbWluWSAmJiAhbWFzcy5zcHJpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBtYXNzLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggbWFzcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLngsIG1pblkgKSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2V0cyB0aGUgZ3JhZGllbnQgb24gdGhlIG1hc3NOb2RlLlxyXG4gICAgdGhpcy5yZWN0LmZpbGwgPSBuZXcgTGluZWFyR3JhZGllbnQoIC10aGlzLnJlY3Qud2lkdGggLyAyLCAwLCB0aGlzLnJlY3Qud2lkdGggLyAyLCAwIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMCwgQ29sb3IudG9Db2xvciggbWFzcy5jb2xvciApLmNvbG9yVXRpbHNCcmlnaHRlciggMC4xICkgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAwLjIsIENvbG9yLnRvQ29sb3IoIG1hc3MuY29sb3IgKS5jb2xvclV0aWxzQnJpZ2h0ZXIoIDAuNiApIClcclxuICAgICAgLmFkZENvbG9yU3RvcCggMC43LCBtYXNzLmNvbG9yICk7XHJcblxyXG4gICAgY29uc3QgaG9va1NoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBjb25zdCByYWRpdXMgPSBob29rSGVpZ2h0IC8gNDtcclxuICAgIGhvb2tTaGFwZS5hcmMoIDAsIDAsIHJhZGl1cywgTWF0aC5QSSwgKCAwLjUgKiBNYXRoLlBJICkgKTtcclxuICAgIGhvb2tTaGFwZS5saW5lVG8oIDAsIGhvb2tIZWlnaHQgLyAyICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UGF0aH0gVXNlZCBmb3IgaG9vayBvbiBtYXNzTm9kZS5cclxuICAgIHRoaXMuaG9va05vZGUgPSBuZXcgUGF0aCggaG9va1NoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAxLjUsXHJcbiAgICAgIGxpbmVDYXA6ICdyb3VuZCcsXHJcbiAgICAgIGNlbnRlclg6IHRoaXMucmVjdC5jZW50ZXJYLFxyXG4gICAgICBib3VuZHNNZXRob2Q6ICd1bnN0cm9rZWQnLFxyXG4gICAgICBib3R0b206IHRoaXMucmVjdC50b3BcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuaG9va05vZGUgKTtcclxuXHJcbiAgICAvLyBCYWNrZ3JvdW5kIGFkZGVkIHNvIGFsbCBvZiBzdmcgZWxlbWVudHMgYXJlIHBhaW50ZWQuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21hc3Nlcy1hbmQtc3ByaW5ncy9pc3N1ZXMvMjc4XHJcbiAgICB0aGlzLmJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCB0aGlzLmJvdW5kcy5kaWxhdGVkKCAxLjI1ICksIHsgcGlja2FibGU6IGZhbHNlLCBmaWxsOiAndHJhbnNwYXJlbnQnIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYmFja2dyb3VuZCApO1xyXG5cclxuICAgIGlmICggIW1hc3MuaWNvbiApIHtcclxuICAgICAgY29uc3QgbGFiZWxTdHJpbmcgPSBtYXNzLm15c3RlcnlMYWJlbCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25NYXJrU3RyaW5nIDogU3RyaW5nVXRpbHMuZmlsbEluKCBtYXNzVmFsdWVTdHJpbmcsIHsgbWFzczogbWFzcy5tYXNzICogMTAwMCB9ICk7XHJcbiAgICAgIGNvbnN0IGxhYmVsID0gbmV3IFRleHQoIGxhYmVsU3RyaW5nLCB7XHJcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDEyLCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgICAgY2VudGVyWTogdGhpcy5yZWN0LmNlbnRlclksXHJcbiAgICAgICAgY2VudGVyWDogMCxcclxuICAgICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgICAgbWF4V2lkdGg6ICFtYXNzLmFkanVzdGFibGUgPyB0aGlzLnJlY3Qud2lkdGggOiAzMCwgLy8gQWRqdXN0YWJsZSBtYXNzZXMgcmVxdWlyZSBzbWFsbGVyIGxhYmVsIG1heFdpZHRoLlxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVGV4dCcgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGxhYmVsICk7XHJcblxyXG4gICAgICBtYXNzLm1hc3NQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgICAgbGFiZWwuY2VudGVyID0gdGhpcy5yZWN0LmNlbnRlcjtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gQWRqdXN0IHRoZSBtYXNzIGxhYmVsIGZvciBhZGp1c3RhYmxlIG1hc3Nlcy5cclxuICAgICAgaWYgKCB0aGlzLm1hc3MuYWRqdXN0YWJsZSApIHtcclxuICAgICAgICB0aGlzLm1hc3MubWFzc1Byb3BlcnR5LmxpbmsoIG1hc3NWYWx1ZSA9PiB7XHJcbiAgICAgICAgICBsYWJlbC5zZXRTdHJpbmcoIFN0cmluZ1V0aWxzLmZpbGxJbiggbWFzc1ZhbHVlU3RyaW5nLCB7IG1hc3M6IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBtYXNzVmFsdWUgKiAxMDAwICkgfSApICk7XHJcbiAgICAgICAgICBsYWJlbC5jZW50ZXIgPSB0aGlzLnJlY3QuY2VudGVyO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZXIgdGhhdCBtb3ZlcyB0aGUgcGFydGljbGUgaW4gbW9kZWwgc3BhY2UuXHJcbiAgICBjb25zdCBvbkRyYWcgPSAoKSA9PiB7XHJcblxyXG4gICAgICBpZiAoIHRoaXMubWFzcy5zcHJpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLm1hc3Muc3ByaW5nUHJvcGVydHkudmFsdWUuYnV0dG9uRW5hYmxlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2tzIGlmIG1hc3Mgc2hvdWxkIGJlIGF0dGFjaGVkL2RldGFjaGVkIHRvIHNwcmluZyBhbmQgYWRqdXN0cyBpdHMgcG9zaXRpb24gaWYgc28uXHJcbiAgICAgIG1vZGVsLmFkanVzdERyYWdnZWRNYXNzUG9zaXRpb24oIHRoaXMubWFzcywgZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0RyYWdMaXN0ZW5lcn0gKHJlYWQtd3JpdGUpXHJcbiAgICB0aGlzLmRyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogdGhpcy5tYXNzLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHVzZVBhcmVudE9mZnNldDogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIEFsbG93IG1vdmluZyBhIGZpbmdlciAodG91Y2gpIGFjcm9zcyBhIG5vZGUgdG8gcGljayBpdCB1cC5cclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBtb2RlbEJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuICAgICAgdHJhbnNmb3JtOiBtb2RlbFZpZXdUcmFuc2Zvcm0yLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInICksXHJcblxyXG4gICAgICBzdGFydDogKCkgPT4ge1xyXG4gICAgICAgIG9uRHJhZygpO1xyXG4gICAgICAgIG1hc3MudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm1hc3Muc3ByaW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICB0aGlzLm1hc3Muc3ByaW5nUHJvcGVydHkudmFsdWUuYnV0dG9uRW5hYmxlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBvbkRyYWcoKTtcclxuICAgICAgICBtYXNzLnVzZXJDb250cm9sbGVkUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgIGlmICggbWFzcy5zcHJpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgIG1hc3Muc3ByaW5nUHJvcGVydHkudmFsdWUucGVyaW9kVHJhY2VSZXNldEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubWFzcy5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybTIubW9kZWxUb1ZpZXdQb3NpdGlvbiggcG9zaXRpb24gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1hc3MudXNlckNvbnRyb2xsZWRQcm9wZXJ0eSwgbW9kZWxCb3VuZHNQcm9wZXJ0eSBdLCAoICggdXNlckNvbnRyb2xsZWQsIG1vZGVsRHJhZ0JvdW5kcyApID0+IHtcclxuXHJcbiAgICAgIC8vIE1hc3NlcyB3b24ndCBqdW1wIGJhY2sgaW50byB0aGUgbW9kZWwgYm91bmRzIGF0dGFjaGVkIHRvIHNwcmluZy5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9tYXNzZXMtYW5kLXNwcmluZ3MvaXNzdWVzLzI5MVxyXG4gICAgICBpZiAoIG1hc3Muc3ByaW5nUHJvcGVydHkudmFsdWUgJiYgIXVzZXJDb250cm9sbGVkICkge1xyXG4gICAgICAgIHRoaXMuZHJhZ0xpc3RlbmVyLmRyYWdCb3VuZHMuc2V0KCBCb3VuZHMyLkVWRVJZVEhJTkcgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmRyYWdMaXN0ZW5lci5kcmFnQm91bmRzLnNldCggbW9kZWxEcmFnQm91bmRzICk7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5kcmFnTGlzdGVuZXIgKTtcclxuXHJcbiAgICBjb25zdCBmb3JjZU51bGxMaW5lID0gbmV3IExpbmUoIHtcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFycm93cyBjcmVhdGVkIGZvciB2ZWN0b3JzIGFzc29jaWF0ZWQgd2l0aCBtYXNzIG5vZGVzXHJcbiAgICBjb25zdCB2ZWxvY2l0eUFycm93ID0gbmV3IFZlY3RvckFycm93KCBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLlZFTE9DSVRZX0FSUk9XX0NPTE9SICk7XHJcbiAgICBjb25zdCBhY2NlbGVyYXRpb25BcnJvdyA9IG5ldyBWZWN0b3JBcnJvdyggTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5BQ0NFTEVSQVRJT05fQVJST1dfQ09MT1IgKTtcclxuICAgIGNvbnN0IGdyYXZpdHlGb3JjZUFycm93ID0gbmV3IEZvcmNlVmVjdG9yQXJyb3coIE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuR1JBVklUWV9BUlJPV19DT0xPUiApO1xyXG4gICAgY29uc3Qgc3ByaW5nRm9yY2VBcnJvdyA9IG5ldyBGb3JjZVZlY3RvckFycm93KCBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLlNQUklOR19BUlJPV19DT0xPUiApO1xyXG4gICAgY29uc3QgbmV0Rm9yY2VBcnJvdyA9IG5ldyBGb3JjZVZlY3RvckFycm93KCAnYmxhY2snICk7XHJcblxyXG4gICAgaWYgKCAhbWFzcy5pY29uICkge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB2ZWxvY2l0eUFycm93ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGFjY2VsZXJhdGlvbkFycm93ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGdyYXZpdHlGb3JjZUFycm93ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHNwcmluZ0ZvcmNlQXJyb3cgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV0Rm9yY2VBcnJvdyApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBmb3JjZU51bGxMaW5lICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXNlZCB0byBwb3NpdGlvbiB0aGUgdmVjdG9ycyBvbiB0aGUgbGVmdCBvZiByaWdodCBzaWRlIG9mIHRoZSBtYXNzTm9kZSBkZXBlbmRpbmcgb24gdGhlIGF0dGFjaGVkIHNwcmluZy5cclxuICAgIGxldCBmb3JjZXNPcmllbnRhdGlvbiA9IDE7XHJcbiAgICB0aGlzLm1hc3Muc3ByaW5nUHJvcGVydHkubGluayggc3ByaW5nID0+IHtcclxuICAgICAgaWYgKCBzcHJpbmcgKSB7XHJcbiAgICAgICAgZm9yY2VzT3JpZW50YXRpb24gPSBzcHJpbmcuZm9yY2VzT3JpZW50YXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdy9oaWRlIHRoZSB2ZWxvY2l0eSBhbmQgYWNjZWxlcmF0aW9uIGFycm93cyB3aGVuIGFwcHJvcHJpYXRlXHJcbiAgICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gYXJyb3dWaXNpYmlsaXR5UHJvcGVydHlcclxuICAgICAqIEBwYXJhbSB7Tm9kZX0gYXJyb3dOb2RlXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBjb25zdCB1cGRhdGVBcnJvd1Zpc2liaWxpdHkgPSAoIGFycm93VmlzaWJpbGl0eVByb3BlcnR5LCBhcnJvd05vZGUgKSA9PiB7XHJcbiAgICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbWFzcy5zcHJpbmdQcm9wZXJ0eSwgYXJyb3dWaXNpYmlsaXR5UHJvcGVydHksIG1hc3MudXNlckNvbnRyb2xsZWRQcm9wZXJ0eSBdLFxyXG4gICAgICAgICggc3ByaW5nLCB2ZWN0b3JWaXNpYmlsaXR5LCB1c2VyQ29udHJvbGxlZCApID0+IHtcclxuICAgICAgICAgIGFycm93Tm9kZS52aXNpYmxlID0gISFzcHJpbmcgJiYgdmVjdG9yVmlzaWJpbGl0eSAmJiAhdXNlckNvbnRyb2xsZWQ7XHJcbiAgICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cvaGlkZSB0aGUgc3ByaW5nIGFuZCBncmF2aXR5IGZvcmNlIHZlY3RvcnMgd2hlbiBhcHByb3ByaWF0ZVxyXG4gICAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGFycm93VmlzaWJpbGl0eVByb3BlcnR5XHJcbiAgICAgKiBAcGFyYW0ge05vZGV9IGFycm93Tm9kZVxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgY29uc3QgdXBkYXRlRm9yY2VWaXNpYmlsaXR5ID0gKCBhcnJvd1Zpc2liaWxpdHlQcm9wZXJ0eSwgYXJyb3dOb2RlICkgPT4ge1xyXG4gICAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1hc3Muc3ByaW5nUHJvcGVydHksIGFycm93VmlzaWJpbGl0eVByb3BlcnR5LCBtb2RlbC5mb3JjZXNNb2RlUHJvcGVydHkgXSxcclxuICAgICAgICAoIHNwcmluZywgc3ByaW5nVmVjdG9yVmlzaWJpbGl0eSwgZm9yY2VzTW9kZSApID0+IHtcclxuICAgICAgICAgIGFycm93Tm9kZS52aXNpYmxlID0gISFzcHJpbmcgJiYgc3ByaW5nVmVjdG9yVmlzaWJpbGl0eSAmJiBmb3JjZXNNb2RlID09PSBGb3JjZXNNb2RlLkZPUkNFUztcclxuICAgICAgICB9ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFNob3cvaGlkZSB0aGUgdmVsb2NpdHkgYXJyb3dcclxuICAgIHVwZGF0ZUFycm93VmlzaWJpbGl0eSggbW9kZWwudmVsb2NpdHlWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHksIHZlbG9jaXR5QXJyb3cgKTtcclxuXHJcbiAgICAvLyBTaG93L2hpZGUgdGhlIGFjY2VsZXJhdGlvbiBhcnJvd1xyXG4gICAgdXBkYXRlQXJyb3dWaXNpYmlsaXR5KCBtb2RlbC5hY2NlbGVyYXRpb25WZWN0b3JWaXNpYmlsaXR5UHJvcGVydHksIGFjY2VsZXJhdGlvbkFycm93ICk7XHJcblxyXG4gICAgLy8gU2hvdy9oaWRlIHRoZSBzcHJpbmcgZm9yY2UgYXJyb3dcclxuICAgIHVwZGF0ZUZvcmNlVmlzaWJpbGl0eSggbW9kZWwuc3ByaW5nVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5LCBzcHJpbmdGb3JjZUFycm93ICk7XHJcblxyXG4gICAgLy8gU2hvdy9oaWRlIHRoZSBncmF2aXR5IGZvcmNlIGFycm93XHJcbiAgICB1cGRhdGVGb3JjZVZpc2liaWxpdHkoIG1vZGVsLmdyYXZpdHlWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHksIGdyYXZpdHlGb3JjZUFycm93ICk7XHJcblxyXG4gICAgLy8gU2hvdy9oaWRlIHRoZSBuZXQgZm9yY2UgYXJyb3dcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbWFzcy5zcHJpbmdQcm9wZXJ0eSwgbW9kZWwuZm9yY2VzTW9kZVByb3BlcnR5IF0sXHJcbiAgICAgICggc3ByaW5nLCBmb3JjZXNNb2RlICkgPT4ge1xyXG4gICAgICAgIG5ldEZvcmNlQXJyb3cudmlzaWJsZSA9ICEhc3ByaW5nICYmIGZvcmNlc01vZGUgPT09IEZvcmNlc01vZGUuTkVUX0ZPUkNFUztcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIFNob3cvaGlkZSBsaW5lIGF0IGJhc2Ugb2YgdmVjdG9yc1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICAgIG1hc3Muc3ByaW5nUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwuZ3Jhdml0eVZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5zcHJpbmdWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwuZm9yY2VzTW9kZVByb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggc3ByaW5nLCBncmF2aXR5Rm9yY2VWaXNpYmxlLCBzcHJpbmdGb3JjZVZpc2libGUsIGZvcmNlc01vZGUgKSA9PiB7XHJcbiAgICAgICAgZm9yY2VOdWxsTGluZS52aXNpYmxlID0gISFzcHJpbmcgJiYgKCBncmF2aXR5Rm9yY2VWaXNpYmxlIHx8IHNwcmluZ0ZvcmNlVmlzaWJsZSB8fCBmb3JjZXNNb2RlID09PSBGb3JjZXNNb2RlLk5FVF9GT1JDRVMgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgYXJyb3cgYnkgdXNpbmcgLnNldFRhaWxBbmRUaXAoKS4gVXNlZCB0byBtYWtlIGNvZGUgY29uY2lzZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1ZlY3RvckFycm93fEZvcmNlVmVjdG9yQXJyb3d9IGFycm93IC0gYXJyb3cgdG8gYmUgdXBkYXRlZFxyXG4gICAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhPZmZzZXRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5MiAtIG51bWJlciB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgeTIgdmFsdWUgaW4gc2V0VGFpbEFuZFRpcCgpXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHVwZGF0ZUFycm93ID0gKCBhcnJvdywgcG9zaXRpb24sIHhPZmZzZXQsIHkyICkgPT4ge1xyXG4gICAgICBhcnJvdy5zZXRUYWlsQW5kVGlwKFxyXG4gICAgICAgIHRoaXMucmVjdC5jZW50ZXJYICsgeE9mZnNldCxcclxuICAgICAgICBwb3NpdGlvbi55ICsgdGhpcy5yZWN0LmNlbnRlclksXHJcbiAgICAgICAgdGhpcy5yZWN0LmNlbnRlclggKyB4T2Zmc2V0LFxyXG4gICAgICAgIHBvc2l0aW9uLnkgKyB0aGlzLnJlY3QuY2VudGVyWSArIHkyXHJcbiAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIExpbmtzIGZvciBoYW5kbGluZyB0aGUgbGVuZ3RoIG9mIHRoZSB2ZWN0b3JzIGluIHJlc3BvbnNlIHRvIHRoZSBzeXN0ZW0uXHJcbiAgICBjb25zdCBzY2FsaW5nRmFjdG9yID0gMztcclxuICAgIGxldCB4T2Zmc2V0O1xyXG4gICAgbGV0IHkyO1xyXG4gICAgbGV0IHBvc2l0aW9uO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICBtYXNzLnZlcnRpY2FsVmVsb2NpdHlQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuYWNjZWxlcmF0aW9uVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5XHJcbiAgICBdLCAoIHZlbG9jaXR5LCBhY2NlbGVyYXRpb25WaXNpYmxlICkgPT4ge1xyXG4gICAgICB4T2Zmc2V0ID0gYWNjZWxlcmF0aW9uVmlzaWJsZSA/IC04IDogMDtcclxuICAgICAgcG9zaXRpb24gPSBtYXNzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIHkyID0gLUFSUk9XX1NJWkVfREVGQVVMVCAqIHZlbG9jaXR5ICogc2NhbGluZ0ZhY3RvcjtcclxuICAgICAgdXBkYXRlQXJyb3coIHZlbG9jaXR5QXJyb3csIHBvc2l0aW9uLCB4T2Zmc2V0LCB5MiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gZ3Jhdml0eSBjaGFuZ2VzLCB1cGRhdGUgdGhlIGdyYXZpdGF0aW9uYWwgZm9yY2UgYXJyb3dcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbWFzcy5zcHJpbmdQcm9wZXJ0eSwgbWFzcy5ncmF2aXR5UHJvcGVydHkgXSxcclxuICAgICAgKCBzcHJpbmcsIGdyYXZpdHkgKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZ3Jhdml0YXRpb25hbEFjY2VsZXJhdGlvbiA9IG1hc3MubWFzcyAqIGdyYXZpdHk7XHJcbiAgICAgICAgcG9zaXRpb24gPSBtYXNzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgeE9mZnNldCA9IGZvcmNlc09yaWVudGF0aW9uICogNDU7XHJcbiAgICAgICAgeTIgPSBBUlJPV19TSVpFX0RFRkFVTFQgKiBncmF2aXRhdGlvbmFsQWNjZWxlcmF0aW9uO1xyXG4gICAgICAgIHVwZGF0ZUFycm93KCBncmF2aXR5Rm9yY2VBcnJvdywgcG9zaXRpb24sIHhPZmZzZXQsIHkyICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBzcHJpbmcgZm9yY2UgY2hhbmdlcywgdXBkYXRlIHRoZSBzcHJpbmcgZm9yY2UgYXJyb3dcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbWFzcy5zcHJpbmdGb3JjZVByb3BlcnR5IF0sXHJcbiAgICAgIHNwcmluZ0ZvcmNlID0+IHtcclxuICAgICAgICBwb3NpdGlvbiA9IG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICB4T2Zmc2V0ID0gZm9yY2VzT3JpZW50YXRpb24gKiA0NTtcclxuICAgICAgICB5MiA9IC1BUlJPV19TSVpFX0RFRkFVTFQgKiBzcHJpbmdGb3JjZTtcclxuICAgICAgICB1cGRhdGVBcnJvdyggc3ByaW5nRm9yY2VBcnJvdywgcG9zaXRpb24sIHhPZmZzZXQsIHkyICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIG5ldCBmb3JjZSBjaGFuZ2VzIGNoYW5nZXMsIHVwZGF0ZSB0aGUgbmV0IGZvcmNlIGFycm93XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXNzLnNwcmluZ1Byb3BlcnR5LmdldCgpID09PSBudWxsLCAnV2UgY3VycmVudGx5IGFzc3VtZSB0aGF0IHRoZSBtYXNzZXMgZG9uXFwndCBzdGFydCBhdHRhY2hlZCB0byB0aGUgc3ByaW5ncycgKTtcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgbWFzcy5uZXRGb3JjZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5hY2NlbGVyYXRpb25WZWN0b3JWaXNpYmlsaXR5UHJvcGVydHksXHJcbiAgICAgIG1hc3MuYWNjZWxlcmF0aW9uUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnZlbG9jaXR5VmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5XHJcbiAgICBdLCAoIG5ldEZvcmNlLCBhY2NlbGVyYXRpb25WaXNpYmxlLCBuZXRBY2NlbGVyYXRpb24sIHZlbG9jaXR5VmlzaWJsZSApID0+IHtcclxuICAgICAgcG9zaXRpb24gPSBtYXNzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGlmICggTWF0aC5hYnMoIG5ldEZvcmNlICkgPiAxRS02ICkge1xyXG4gICAgICAgIHhPZmZzZXQgPSBmb3JjZXNPcmllbnRhdGlvbiAqIDQ1O1xyXG4gICAgICAgIHkyID0gLUFSUk9XX1NJWkVfREVGQVVMVCAqIG5ldEZvcmNlO1xyXG4gICAgICAgIHVwZGF0ZUFycm93KCBuZXRGb3JjZUFycm93LCBwb3NpdGlvbiwgeE9mZnNldCwgeTIgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBuZXRGb3JjZUFycm93LnNldFRhaWxBbmRUaXAoIDAsIDAsIDAsIDAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIE1hdGguYWJzKCBuZXRBY2NlbGVyYXRpb24gKSA+IDFFLTYgKSB7XHJcbiAgICAgICAgeE9mZnNldCA9IHZlbG9jaXR5VmlzaWJsZSA/IDggOiAwO1xyXG4gICAgICAgIHkyID0gLUFSUk9XX1NJWkVfREVGQVVMVCAqIG5ldEFjY2VsZXJhdGlvbiAvIHNjYWxpbmdGYWN0b3I7XHJcbiAgICAgICAgdXBkYXRlQXJyb3coIGFjY2VsZXJhdGlvbkFycm93LCBwb3NpdGlvbiwgeE9mZnNldCwgeTIgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhY2NlbGVyYXRpb25BcnJvdy5zZXRUYWlsQW5kVGlwKCAwLCAwLCAwLCAwICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBtYXNzJ3MgcG9zaXRpb24gY2hhbmdlcyB1cGRhdGUgdGhlIGZvcmNlcyBiYXNlbGluZSBtYXJrZXJcclxuICAgIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIGZvcmNlTnVsbExpbmUuc2V0TGluZShcclxuICAgICAgICB0aGlzLnJlY3QuY2VudGVyWCArIGZvcmNlc09yaWVudGF0aW9uICogNDAsIHBvc2l0aW9uLnkgKyB0aGlzLnJlY3QuY2VudGVyWSxcclxuICAgICAgICB0aGlzLnJlY3QuY2VudGVyWCArIGZvcmNlc09yaWVudGF0aW9uICogNTAsIHBvc2l0aW9uLnkgKyB0aGlzLnJlY3QuY2VudGVyWVxyXG4gICAgICApO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxubWFzc2VzQW5kU3ByaW5ncy5yZWdpc3RlciggJ01hc3NOb2RlJywgTWFzc05vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hc3NOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxP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