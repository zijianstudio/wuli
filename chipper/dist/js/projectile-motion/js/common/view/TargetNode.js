// Copyright 2016-2023, University of Colorado Boulder

/**
 * View for the target.
 * X position can change when user drags the cannon, y remains constant (on the ground)
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import StarNode from '../../../../scenery-phet/js/StarNode.js';
import { Circle, DragListener, Node } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import projectileMotion from '../../projectileMotion.js';
import ProjectileMotionStrings from '../../ProjectileMotionStrings.js';
import ProjectileMotionConstants from '../ProjectileMotionConstants.js';
const mString = ProjectileMotionStrings.m;
const pattern0Value1UnitsWithSpaceString = ProjectileMotionStrings.pattern0Value1UnitsWithSpace;

// constants
const TARGET_DIAMETER = ProjectileMotionConstants.TARGET_WIDTH;
const TARGET_HEIGHT = ProjectileMotionConstants.TARGET_HEIGHT;
const REWARD_NODE_INITIAL_Y_OFFSET = -10; // in screen coords
const REWARD_NODE_Y_MOVEMENT = 70; // in screen coords
const REWARD_NODE_GROWTH_AMOUNT = 0.5; // scale factor, larger = more growth

class TargetNode extends Node {
  // for coordinate transforms as well as adding the stars as children

  // local var to improve readability

  // keeps track of rewardNodes that animate when projectile has scored

  constructor(target, transformProperty, screenView, providedOptions) {
    const options = optionize()({
      phetioInputEnabledPropertyInstrumented: true,
      tandem: Tandem.REQUIRED
    }, providedOptions);
    super(options);
    this.screenView = screenView;
    this.positionProperty = target.positionProperty;
    this.transformProperty = transformProperty;

    // red and white circles of the target
    const outerCircle = new Circle(1, {
      fill: 'red',
      stroke: 'black',
      lineWidth: this.transformProperty.get().viewToModelDeltaX(1)
    });
    const middleCircle = new Circle(2 / 3, {
      fill: 'white',
      stroke: 'black',
      lineWidth: this.transformProperty.get().viewToModelDeltaX(0.5)
    });
    const innerCircle = new Circle(1 / 3, {
      fill: 'red',
      stroke: 'black',
      lineWidth: this.transformProperty.get().viewToModelDeltaX(0.5)
    });

    // target view
    const targetView = new Node({
      pickable: true,
      cursor: 'pointer',
      children: [outerCircle, middleCircle, innerCircle]
    });

    // scaling the target to the right size
    const viewRadius = this.transformProperty.get().modelToViewDeltaX(TARGET_DIAMETER) / 2;
    const targetHeightInView = TARGET_HEIGHT / TARGET_DIAMETER * viewRadius;
    targetView.setScaleMagnitude(viewRadius, targetHeightInView);

    // center on model's positionProperty
    targetView.center = this.transformProperty.get().modelToViewPosition(Vector2.pool.create(this.positionProperty.get(), 0));

    // add target to scene graph
    this.addChild(targetView);

    // variables used in drag handler
    let startPoint;
    let startX;
    let mousePoint;
    const horizontalDragHandler = new DragListener({
      start: event => {
        startPoint = screenView.globalToLocalPoint(event.pointer.point);
        startX = targetView.centerX; // view units
      },

      drag: event => {
        mousePoint = screenView.globalToLocalPoint(event.pointer.point);

        // change in x, view units
        const xChange = mousePoint.x - startPoint.x;
        const newTargetX = Utils.roundSymmetric(this.transformProperty.get().viewToModelX(startX + xChange) * 10) / 10;
        this.positionProperty.set(Utils.clamp(newTargetX, this.positionProperty.range.min, this.positionProperty.range.max));
      },
      allowTouchSnag: true,
      tandem: options.tandem.createTandem('dragListener')
    });

    // drag target to change horizontal position
    targetView.addInputListener(horizontalDragHandler);

    // update the range based on the current transform
    this.updateTargetXRange(this.transformProperty.get());

    // text readout for horizontal distance from fire, which is origin, which is base of cannon
    const distancePattern = StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
      units: mString
    });
    const distanceLabel = new NumberDisplay(this.positionProperty, this.positionProperty.range, combineOptions({}, ProjectileMotionConstants.NUMBER_DISPLAY_OPTIONS, {
      textOptions: {
        fill: 'black'
      },
      valuePattern: distancePattern,
      xMargin: 10.5,
      yMargin: 2,
      decimalPlaces: 1,
      cursor: 'pointer',
      tandem: options.tandem.createTandem('numberDisplay'),
      phetioDocumentation: 'The number display in model coordinates of how far the cannon is from the target'
    }));
    this.addChild(distanceLabel);

    // drag text to change horizontal position
    distanceLabel.addInputListener(horizontalDragHandler);
    this.rewardNodes = [];

    // listen to model for whether target indicator should be shown
    target.scoredEmitter.addListener(numberOfStars => {
      let rewardNode;
      if (numberOfStars === 1) {
        rewardNode = new Node({
          children: [new StarNode({
            x: 0,
            y: -30
          })]
        });
      } else if (numberOfStars === 2) {
        rewardNode = new Node({
          children: [new StarNode({
            x: -20,
            y: -20
          }), new StarNode({
            x: 20,
            y: -20
          })]
        });
      } else {
        assert && assert(numberOfStars === 3, '3 stars expected here');
        rewardNode = new Node({
          children: [new StarNode({
            x: -30,
            y: -20
          }), new StarNode({
            x: 0,
            y: -30
          }), new StarNode({
            x: 30,
            y: -20
          })]
        });
      }
      const rewardNodeStartPosition = new Vector2(targetView.centerX, targetView.centerY + REWARD_NODE_INITIAL_Y_OFFSET);
      rewardNode.center = rewardNodeStartPosition;
      screenView.addChild(rewardNode);
      this.rewardNodes.push(rewardNode);

      // animate the reward node (one to three stars) to move up, expand, and fade out
      const rewardNodeAnimation = new Animation({
        duration: 1,
        easing: Easing.QUADRATIC_OUT,
        setValue: newYPos => {
          rewardNode.centerY = newYPos;
          const animationProportionCompleted = Math.abs(newYPos - rewardNodeStartPosition.y) / REWARD_NODE_Y_MOVEMENT;
          rewardNode.opacity = 1 - animationProportionCompleted;
          rewardNode.setScaleMagnitude(1 + animationProportionCompleted * REWARD_NODE_GROWTH_AMOUNT);
        },
        from: rewardNodeStartPosition.y,
        to: rewardNodeStartPosition.y - REWARD_NODE_Y_MOVEMENT
      });

      // remove the reward node when the animation finishes
      rewardNodeAnimation.finishEmitter.addListener(() => {
        this.rewardNodes.splice(this.rewardNodes.indexOf(rewardNode), 1);
        rewardNode.dispose();
      });

      // kick off the animation
      rewardNodeAnimation.start();
    });

    // Observe changes in the model horizontal position and update the view correspondingly
    const updateHorizontalPosition = targetX => {
      targetView.centerX = this.transformProperty.get().modelToViewX(targetX);
      distanceLabel.centerX = targetView.centerX;
      distanceLabel.top = targetView.bottom + 2;
      this.rewardNodes.forEach(rewardNode => {
        rewardNode.x = targetView.centerX;
      });
    };
    this.positionProperty.link(updateHorizontalPosition);

    // Observe changes in the modelViewTransform and update the view
    this.transformProperty.link(transform => {
      this.updateTargetXRange(transform);
      const viewRadius = transform.modelToViewDeltaX(TARGET_DIAMETER) / 2;
      targetView.setScaleMagnitude(viewRadius, targetHeightInView);
      updateHorizontalPosition(this.positionProperty.get());
    });

    // The node lasts for the lifetime of the sim, so its links/references don't need to be disposed
  }

  updateTargetXRange(transform) {
    const newRange = new Range(transform.viewToModelX(this.screenView.layoutBounds.minX), transform.viewToModelX(this.screenView.layoutBounds.maxX));
    this.positionProperty.setValueAndRange(Utils.clamp(this.positionProperty.value, newRange.min, newRange.max), newRange);
  }

  /**
   * Remove animations
   */
  reset() {
    this.rewardNodes.forEach(rewardNode => {
      if (this.screenView.hasChild(rewardNode)) {
        this.screenView.removeChild(rewardNode);
      }
    });
    this.rewardNodes = [];

    // reset the range of the target
    this.updateTargetXRange(this.transformProperty.value);
  }
}
projectileMotion.register('TargetNode', TargetNode);
export default TargetNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiU3RyaW5nVXRpbHMiLCJOdW1iZXJEaXNwbGF5IiwiU3Rhck5vZGUiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiVGFuZGVtIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwicHJvamVjdGlsZU1vdGlvbiIsIlByb2plY3RpbGVNb3Rpb25TdHJpbmdzIiwiUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyIsIm1TdHJpbmciLCJtIiwicGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZyIsInBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2UiLCJUQVJHRVRfRElBTUVURVIiLCJUQVJHRVRfV0lEVEgiLCJUQVJHRVRfSEVJR0hUIiwiUkVXQVJEX05PREVfSU5JVElBTF9ZX09GRlNFVCIsIlJFV0FSRF9OT0RFX1lfTU9WRU1FTlQiLCJSRVdBUkRfTk9ERV9HUk9XVEhfQU1PVU5UIiwiVGFyZ2V0Tm9kZSIsImNvbnN0cnVjdG9yIiwidGFyZ2V0IiwidHJhbnNmb3JtUHJvcGVydHkiLCJzY3JlZW5WaWV3IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwb3NpdGlvblByb3BlcnR5Iiwib3V0ZXJDaXJjbGUiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiZ2V0Iiwidmlld1RvTW9kZWxEZWx0YVgiLCJtaWRkbGVDaXJjbGUiLCJpbm5lckNpcmNsZSIsInRhcmdldFZpZXciLCJwaWNrYWJsZSIsImN1cnNvciIsImNoaWxkcmVuIiwidmlld1JhZGl1cyIsIm1vZGVsVG9WaWV3RGVsdGFYIiwidGFyZ2V0SGVpZ2h0SW5WaWV3Iiwic2V0U2NhbGVNYWduaXR1ZGUiLCJjZW50ZXIiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwicG9vbCIsImNyZWF0ZSIsImFkZENoaWxkIiwic3RhcnRQb2ludCIsInN0YXJ0WCIsIm1vdXNlUG9pbnQiLCJob3Jpem9udGFsRHJhZ0hhbmRsZXIiLCJzdGFydCIsImV2ZW50IiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwicG9pbnRlciIsInBvaW50IiwiY2VudGVyWCIsImRyYWciLCJ4Q2hhbmdlIiwieCIsIm5ld1RhcmdldFgiLCJyb3VuZFN5bW1ldHJpYyIsInZpZXdUb01vZGVsWCIsInNldCIsImNsYW1wIiwicmFuZ2UiLCJtaW4iLCJtYXgiLCJhbGxvd1RvdWNoU25hZyIsImNyZWF0ZVRhbmRlbSIsImFkZElucHV0TGlzdGVuZXIiLCJ1cGRhdGVUYXJnZXRYUmFuZ2UiLCJkaXN0YW5jZVBhdHRlcm4iLCJmaWxsSW4iLCJ1bml0cyIsImRpc3RhbmNlTGFiZWwiLCJOVU1CRVJfRElTUExBWV9PUFRJT05TIiwidGV4dE9wdGlvbnMiLCJ2YWx1ZVBhdHRlcm4iLCJ4TWFyZ2luIiwieU1hcmdpbiIsImRlY2ltYWxQbGFjZXMiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicmV3YXJkTm9kZXMiLCJzY29yZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJudW1iZXJPZlN0YXJzIiwicmV3YXJkTm9kZSIsInkiLCJhc3NlcnQiLCJyZXdhcmROb2RlU3RhcnRQb3NpdGlvbiIsImNlbnRlclkiLCJwdXNoIiwicmV3YXJkTm9kZUFuaW1hdGlvbiIsImR1cmF0aW9uIiwiZWFzaW5nIiwiUVVBRFJBVElDX09VVCIsInNldFZhbHVlIiwibmV3WVBvcyIsImFuaW1hdGlvblByb3BvcnRpb25Db21wbGV0ZWQiLCJNYXRoIiwiYWJzIiwib3BhY2l0eSIsImZyb20iLCJ0byIsImZpbmlzaEVtaXR0ZXIiLCJzcGxpY2UiLCJpbmRleE9mIiwiZGlzcG9zZSIsInVwZGF0ZUhvcml6b250YWxQb3NpdGlvbiIsInRhcmdldFgiLCJtb2RlbFRvVmlld1giLCJ0b3AiLCJib3R0b20iLCJmb3JFYWNoIiwibGluayIsInRyYW5zZm9ybSIsIm5ld1JhbmdlIiwibGF5b3V0Qm91bmRzIiwibWluWCIsIm1heFgiLCJzZXRWYWx1ZUFuZFJhbmdlIiwidmFsdWUiLCJyZXNldCIsImhhc0NoaWxkIiwicmVtb3ZlQ2hpbGQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRhcmdldE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgdGhlIHRhcmdldC5cclxuICogWCBwb3NpdGlvbiBjYW4gY2hhbmdlIHdoZW4gdXNlciBkcmFncyB0aGUgY2Fubm9uLCB5IHJlbWFpbnMgY29uc3RhbnQgKG9uIHRoZSBncm91bmQpXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBOdW1iZXJEaXNwbGF5LCB7IE51bWJlckRpc3BsYXlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckRpc3BsYXkuanMnO1xyXG5pbXBvcnQgU3Rhck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1N0YXJOb2RlLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBEcmFnTGlzdGVuZXIsIE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBwcm9qZWN0aWxlTW90aW9uIGZyb20gJy4uLy4uL3Byb2plY3RpbGVNb3Rpb24uanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU1vdGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgVGFyZ2V0IGZyb20gJy4uL21vZGVsL1RhcmdldC5qcyc7XHJcbmltcG9ydCBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzIGZyb20gJy4uL1Byb2plY3RpbGVNb3Rpb25Db25zdGFudHMuanMnO1xyXG5cclxuY29uc3QgbVN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLm07XHJcbmNvbnN0IHBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5wYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRBUkdFVF9ESUFNRVRFUiA9IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuVEFSR0VUX1dJRFRIO1xyXG5jb25zdCBUQVJHRVRfSEVJR0hUID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5UQVJHRVRfSEVJR0hUO1xyXG5jb25zdCBSRVdBUkRfTk9ERV9JTklUSUFMX1lfT0ZGU0VUID0gLTEwOyAvLyBpbiBzY3JlZW4gY29vcmRzXHJcbmNvbnN0IFJFV0FSRF9OT0RFX1lfTU9WRU1FTlQgPSA3MDsgLy8gaW4gc2NyZWVuIGNvb3Jkc1xyXG5jb25zdCBSRVdBUkRfTk9ERV9HUk9XVEhfQU1PVU5UID0gMC41OyAvLyBzY2FsZSBmYWN0b3IsIGxhcmdlciA9IG1vcmUgZ3Jvd3RoXHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgVGFyZ2V0Tm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5cclxuY2xhc3MgVGFyZ2V0Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvLyBmb3IgY29vcmRpbmF0ZSB0cmFuc2Zvcm1zIGFzIHdlbGwgYXMgYWRkaW5nIHRoZSBzdGFycyBhcyBjaGlsZHJlblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NyZWVuVmlldzogU2NyZWVuVmlldztcclxuXHJcbiAgLy8gbG9jYWwgdmFyIHRvIGltcHJvdmUgcmVhZGFiaWxpdHlcclxuICBwcml2YXRlIHJlYWRvbmx5IHBvc2l0aW9uUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdHJhbnNmb3JtUHJvcGVydHk6IFByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+O1xyXG5cclxuICAvLyBrZWVwcyB0cmFjayBvZiByZXdhcmROb2RlcyB0aGF0IGFuaW1hdGUgd2hlbiBwcm9qZWN0aWxlIGhhcyBzY29yZWRcclxuICBwcml2YXRlIHJld2FyZE5vZGVzOiBOb2RlW107XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFyZ2V0OiBUYXJnZXQsIHRyYW5zZm9ybVByb3BlcnR5OiBQcm9wZXJ0eTxNb2RlbFZpZXdUcmFuc2Zvcm0yPiwgc2NyZWVuVmlldzogU2NyZWVuVmlldywgcHJvdmlkZWRPcHRpb25zPzogVGFyZ2V0Tm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUYXJnZXROb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnNjcmVlblZpZXcgPSBzY3JlZW5WaWV3O1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gdGFyZ2V0LnBvc2l0aW9uUHJvcGVydHk7XHJcbiAgICB0aGlzLnRyYW5zZm9ybVByb3BlcnR5ID0gdHJhbnNmb3JtUHJvcGVydHk7XHJcblxyXG4gICAgLy8gcmVkIGFuZCB3aGl0ZSBjaXJjbGVzIG9mIHRoZSB0YXJnZXRcclxuICAgIGNvbnN0IG91dGVyQ2lyY2xlID0gbmV3IENpcmNsZSggMSwge1xyXG4gICAgICBmaWxsOiAncmVkJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IHRoaXMudHJhbnNmb3JtUHJvcGVydHkuZ2V0KCkudmlld1RvTW9kZWxEZWx0YVgoIDEgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbWlkZGxlQ2lyY2xlID0gbmV3IENpcmNsZSggMiAvIDMsIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IHRoaXMudHJhbnNmb3JtUHJvcGVydHkuZ2V0KCkudmlld1RvTW9kZWxEZWx0YVgoIDAuNSApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBpbm5lckNpcmNsZSA9IG5ldyBDaXJjbGUoIDEgLyAzLCB7XHJcbiAgICAgIGZpbGw6ICdyZWQnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogdGhpcy50cmFuc2Zvcm1Qcm9wZXJ0eS5nZXQoKS52aWV3VG9Nb2RlbERlbHRhWCggMC41IClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB0YXJnZXQgdmlld1xyXG4gICAgY29uc3QgdGFyZ2V0VmlldyA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHBpY2thYmxlOiB0cnVlLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgY2hpbGRyZW46IFsgb3V0ZXJDaXJjbGUsIG1pZGRsZUNpcmNsZSwgaW5uZXJDaXJjbGUgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNjYWxpbmcgdGhlIHRhcmdldCB0byB0aGUgcmlnaHQgc2l6ZVxyXG4gICAgY29uc3Qgdmlld1JhZGl1cyA9IHRoaXMudHJhbnNmb3JtUHJvcGVydHkuZ2V0KCkubW9kZWxUb1ZpZXdEZWx0YVgoIFRBUkdFVF9ESUFNRVRFUiApIC8gMjtcclxuICAgIGNvbnN0IHRhcmdldEhlaWdodEluVmlldyA9IFRBUkdFVF9IRUlHSFQgLyBUQVJHRVRfRElBTUVURVIgKiB2aWV3UmFkaXVzO1xyXG4gICAgdGFyZ2V0Vmlldy5zZXRTY2FsZU1hZ25pdHVkZSggdmlld1JhZGl1cywgdGFyZ2V0SGVpZ2h0SW5WaWV3ICk7XHJcblxyXG4gICAgLy8gY2VudGVyIG9uIG1vZGVsJ3MgcG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAgdGFyZ2V0Vmlldy5jZW50ZXIgPSB0aGlzLnRyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3UG9zaXRpb24oIFZlY3RvcjIucG9vbC5jcmVhdGUoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSwgMCApICk7XHJcblxyXG4gICAgLy8gYWRkIHRhcmdldCB0byBzY2VuZSBncmFwaFxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGFyZ2V0VmlldyApO1xyXG5cclxuICAgIC8vIHZhcmlhYmxlcyB1c2VkIGluIGRyYWcgaGFuZGxlclxyXG4gICAgbGV0IHN0YXJ0UG9pbnQ6IFZlY3RvcjI7XHJcbiAgICBsZXQgc3RhcnRYOiBudW1iZXI7XHJcbiAgICBsZXQgbW91c2VQb2ludDtcclxuICAgIGNvbnN0IGhvcml6b250YWxEcmFnSGFuZGxlciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcclxuICAgICAgICBzdGFydFBvaW50ID0gc2NyZWVuVmlldy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcclxuICAgICAgICBzdGFydFggPSB0YXJnZXRWaWV3LmNlbnRlclg7IC8vIHZpZXcgdW5pdHNcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGRyYWc6IGV2ZW50ID0+IHtcclxuICAgICAgICBtb3VzZVBvaW50ID0gc2NyZWVuVmlldy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcclxuXHJcbiAgICAgICAgLy8gY2hhbmdlIGluIHgsIHZpZXcgdW5pdHNcclxuICAgICAgICBjb25zdCB4Q2hhbmdlID0gbW91c2VQb2ludC54IC0gc3RhcnRQb2ludC54O1xyXG5cclxuICAgICAgICBjb25zdCBuZXdUYXJnZXRYID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMudHJhbnNmb3JtUHJvcGVydHkuZ2V0KCkudmlld1RvTW9kZWxYKCBzdGFydFggKyB4Q2hhbmdlICkgKiAxMCApIC8gMTA7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggVXRpbHMuY2xhbXAoIG5ld1RhcmdldFgsIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5yYW5nZS5taW4sIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5yYW5nZS5tYXggKSApO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZHJhZyB0YXJnZXQgdG8gY2hhbmdlIGhvcml6b250YWwgcG9zaXRpb25cclxuICAgIHRhcmdldFZpZXcuYWRkSW5wdXRMaXN0ZW5lciggaG9yaXpvbnRhbERyYWdIYW5kbGVyICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSByYW5nZSBiYXNlZCBvbiB0aGUgY3VycmVudCB0cmFuc2Zvcm1cclxuICAgIHRoaXMudXBkYXRlVGFyZ2V0WFJhbmdlKCB0aGlzLnRyYW5zZm9ybVByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy8gdGV4dCByZWFkb3V0IGZvciBob3Jpem9udGFsIGRpc3RhbmNlIGZyb20gZmlyZSwgd2hpY2ggaXMgb3JpZ2luLCB3aGljaCBpcyBiYXNlIG9mIGNhbm5vblxyXG4gICAgY29uc3QgZGlzdGFuY2VQYXR0ZXJuID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlU3RyaW5nLCB7IHVuaXRzOiBtU3RyaW5nIH0gKTtcclxuICAgIGNvbnN0IGRpc3RhbmNlTGFiZWwgPSBuZXcgTnVtYmVyRGlzcGxheShcclxuICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkucmFuZ2UsXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPE51bWJlckRpc3BsYXlPcHRpb25zPigge30sIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuTlVNQkVSX0RJU1BMQVlfT1BUSU9OUywge1xyXG4gICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICBmaWxsOiAnYmxhY2snXHJcbiAgICAgICAgfSxcclxuICAgICAgICB2YWx1ZVBhdHRlcm46IGRpc3RhbmNlUGF0dGVybixcclxuICAgICAgICB4TWFyZ2luOiAxMC41LFxyXG4gICAgICAgIHlNYXJnaW46IDIsXHJcbiAgICAgICAgZGVjaW1hbFBsYWNlczogMSxcclxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlckRpc3BsYXknICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBudW1iZXIgZGlzcGxheSBpbiBtb2RlbCBjb29yZGluYXRlcyBvZiBob3cgZmFyIHRoZSBjYW5ub24gaXMgZnJvbSB0aGUgdGFyZ2V0J1xyXG4gICAgICB9IClcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggZGlzdGFuY2VMYWJlbCApO1xyXG5cclxuICAgIC8vIGRyYWcgdGV4dCB0byBjaGFuZ2UgaG9yaXpvbnRhbCBwb3NpdGlvblxyXG4gICAgZGlzdGFuY2VMYWJlbC5hZGRJbnB1dExpc3RlbmVyKCBob3Jpem9udGFsRHJhZ0hhbmRsZXIgKTtcclxuXHJcbiAgICB0aGlzLnJld2FyZE5vZGVzID0gW107XHJcblxyXG4gICAgLy8gbGlzdGVuIHRvIG1vZGVsIGZvciB3aGV0aGVyIHRhcmdldCBpbmRpY2F0b3Igc2hvdWxkIGJlIHNob3duXHJcbiAgICB0YXJnZXQuc2NvcmVkRW1pdHRlci5hZGRMaXN0ZW5lciggbnVtYmVyT2ZTdGFycyA9PiB7XHJcblxyXG4gICAgICBsZXQgcmV3YXJkTm9kZTogTm9kZTtcclxuICAgICAgaWYgKCBudW1iZXJPZlN0YXJzID09PSAxICkge1xyXG4gICAgICAgIHJld2FyZE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgbmV3IFN0YXJOb2RlKCB7IHg6IDAsIHk6IC0zMCB9IClcclxuICAgICAgICAgIF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIG51bWJlck9mU3RhcnMgPT09IDIgKSB7XHJcbiAgICAgICAgcmV3YXJkTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgU3Rhck5vZGUoIHsgeDogLTIwLCB5OiAtMjAgfSApLFxyXG4gICAgICAgICAgICBuZXcgU3Rhck5vZGUoIHsgeDogMjAsIHk6IC0yMCB9IClcclxuICAgICAgICAgIF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVyT2ZTdGFycyA9PT0gMywgJzMgc3RhcnMgZXhwZWN0ZWQgaGVyZScgKTtcclxuICAgICAgICByZXdhcmROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIG5ldyBTdGFyTm9kZSggeyB4OiAtMzAsIHk6IC0yMCB9ICksXHJcbiAgICAgICAgICAgIG5ldyBTdGFyTm9kZSggeyB4OiAwLCB5OiAtMzAgfSApLFxyXG4gICAgICAgICAgICBuZXcgU3Rhck5vZGUoIHsgeDogMzAsIHk6IC0yMCB9IClcclxuICAgICAgICAgIF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgcmV3YXJkTm9kZVN0YXJ0UG9zaXRpb24gPSBuZXcgVmVjdG9yMiggdGFyZ2V0Vmlldy5jZW50ZXJYLCB0YXJnZXRWaWV3LmNlbnRlclkgKyBSRVdBUkRfTk9ERV9JTklUSUFMX1lfT0ZGU0VUICk7XHJcbiAgICAgIHJld2FyZE5vZGUuY2VudGVyID0gcmV3YXJkTm9kZVN0YXJ0UG9zaXRpb247XHJcbiAgICAgIHNjcmVlblZpZXcuYWRkQ2hpbGQoIHJld2FyZE5vZGUgKTtcclxuICAgICAgdGhpcy5yZXdhcmROb2Rlcy5wdXNoKCByZXdhcmROb2RlICk7XHJcblxyXG4gICAgICAvLyBhbmltYXRlIHRoZSByZXdhcmQgbm9kZSAob25lIHRvIHRocmVlIHN0YXJzKSB0byBtb3ZlIHVwLCBleHBhbmQsIGFuZCBmYWRlIG91dFxyXG4gICAgICBjb25zdCByZXdhcmROb2RlQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgIGR1cmF0aW9uOiAxLFxyXG4gICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19PVVQsXHJcbiAgICAgICAgc2V0VmFsdWU6ICggbmV3WVBvczogbnVtYmVyICkgPT4ge1xyXG4gICAgICAgICAgcmV3YXJkTm9kZS5jZW50ZXJZID0gbmV3WVBvcztcclxuICAgICAgICAgIGNvbnN0IGFuaW1hdGlvblByb3BvcnRpb25Db21wbGV0ZWQgPSBNYXRoLmFicyggbmV3WVBvcyAtIHJld2FyZE5vZGVTdGFydFBvc2l0aW9uLnkgKSAvIFJFV0FSRF9OT0RFX1lfTU9WRU1FTlQ7XHJcbiAgICAgICAgICByZXdhcmROb2RlLm9wYWNpdHkgPSAxIC0gYW5pbWF0aW9uUHJvcG9ydGlvbkNvbXBsZXRlZDtcclxuICAgICAgICAgIHJld2FyZE5vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIDEgKyAoIGFuaW1hdGlvblByb3BvcnRpb25Db21wbGV0ZWQgKiBSRVdBUkRfTk9ERV9HUk9XVEhfQU1PVU5UICkgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZyb206IHJld2FyZE5vZGVTdGFydFBvc2l0aW9uLnksXHJcbiAgICAgICAgdG86IHJld2FyZE5vZGVTdGFydFBvc2l0aW9uLnkgLSBSRVdBUkRfTk9ERV9ZX01PVkVNRU5UXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgcmV3YXJkIG5vZGUgd2hlbiB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzXHJcbiAgICAgIHJld2FyZE5vZGVBbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmV3YXJkTm9kZXMuc3BsaWNlKCB0aGlzLnJld2FyZE5vZGVzLmluZGV4T2YoIHJld2FyZE5vZGUgKSwgMSApO1xyXG4gICAgICAgIHJld2FyZE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBraWNrIG9mZiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgIHJld2FyZE5vZGVBbmltYXRpb24uc3RhcnQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgaW4gdGhlIG1vZGVsIGhvcml6b250YWwgcG9zaXRpb24gYW5kIHVwZGF0ZSB0aGUgdmlldyBjb3JyZXNwb25kaW5nbHlcclxuICAgIGNvbnN0IHVwZGF0ZUhvcml6b250YWxQb3NpdGlvbiA9ICggdGFyZ2V0WDogbnVtYmVyICkgPT4ge1xyXG4gICAgICB0YXJnZXRWaWV3LmNlbnRlclggPSB0aGlzLnRyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WCggdGFyZ2V0WCApO1xyXG4gICAgICBkaXN0YW5jZUxhYmVsLmNlbnRlclggPSB0YXJnZXRWaWV3LmNlbnRlclg7XHJcbiAgICAgIGRpc3RhbmNlTGFiZWwudG9wID0gdGFyZ2V0Vmlldy5ib3R0b20gKyAyO1xyXG4gICAgICB0aGlzLnJld2FyZE5vZGVzLmZvckVhY2goIHJld2FyZE5vZGUgPT4ge1xyXG4gICAgICAgIHJld2FyZE5vZGUueCA9IHRhcmdldFZpZXcuY2VudGVyWDtcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGluayggdXBkYXRlSG9yaXpvbnRhbFBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gT2JzZXJ2ZSBjaGFuZ2VzIGluIHRoZSBtb2RlbFZpZXdUcmFuc2Zvcm0gYW5kIHVwZGF0ZSB0aGUgdmlld1xyXG4gICAgdGhpcy50cmFuc2Zvcm1Qcm9wZXJ0eS5saW5rKCB0cmFuc2Zvcm0gPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVRhcmdldFhSYW5nZSggdHJhbnNmb3JtICk7XHJcbiAgICAgIGNvbnN0IHZpZXdSYWRpdXMgPSB0cmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIFRBUkdFVF9ESUFNRVRFUiApIC8gMjtcclxuICAgICAgdGFyZ2V0Vmlldy5zZXRTY2FsZU1hZ25pdHVkZSggdmlld1JhZGl1cywgdGFyZ2V0SGVpZ2h0SW5WaWV3ICk7XHJcbiAgICAgIHVwZGF0ZUhvcml6b250YWxQb3NpdGlvbiggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlIG5vZGUgbGFzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLCBzbyBpdHMgbGlua3MvcmVmZXJlbmNlcyBkb24ndCBuZWVkIHRvIGJlIGRpc3Bvc2VkXHJcblxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVUYXJnZXRYUmFuZ2UoIHRyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBuZXdSYW5nZSA9IG5ldyBSYW5nZShcclxuICAgICAgdHJhbnNmb3JtLnZpZXdUb01vZGVsWCggdGhpcy5zY3JlZW5WaWV3LmxheW91dEJvdW5kcy5taW5YICksXHJcbiAgICAgIHRyYW5zZm9ybS52aWV3VG9Nb2RlbFgoIHRoaXMuc2NyZWVuVmlldy5sYXlvdXRCb3VuZHMubWF4WCApXHJcbiAgICApO1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldFZhbHVlQW5kUmFuZ2UoIFV0aWxzLmNsYW1wKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsIG5ld1JhbmdlLm1pbiwgbmV3UmFuZ2UubWF4ICksIG5ld1JhbmdlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYW5pbWF0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMucmV3YXJkTm9kZXMuZm9yRWFjaCggcmV3YXJkTm9kZSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5zY3JlZW5WaWV3Lmhhc0NoaWxkKCByZXdhcmROb2RlICkgKSB7XHJcbiAgICAgICAgdGhpcy5zY3JlZW5WaWV3LnJlbW92ZUNoaWxkKCByZXdhcmROb2RlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMucmV3YXJkTm9kZXMgPSBbXTtcclxuXHJcbiAgICAvLyByZXNldCB0aGUgcmFuZ2Ugb2YgdGhlIHRhcmdldFxyXG4gICAgdGhpcy51cGRhdGVUYXJnZXRYUmFuZ2UoIHRoaXMudHJhbnNmb3JtUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcbn1cclxuXHJcbnByb2plY3RpbGVNb3Rpb24ucmVnaXN0ZXIoICdUYXJnZXROb2RlJywgVGFyZ2V0Tm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGFyZ2V0Tm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBMEIsdUNBQXVDO0FBQ25HLE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFFdkUsT0FBT0MsYUFBYSxNQUFnQyw4Q0FBOEM7QUFDbEcsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxNQUFNLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxRQUFxQixtQ0FBbUM7QUFDM0YsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUV0RSxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFFdkUs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