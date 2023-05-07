// Copyright 2013-2023, University of Colorado Boulder

/**
 * Faucet with a pinball machine 'shooter'.
 * When the faucet is disabled, the flow rate is set to zero and the shooter is disabled.
 * Origin is at the bottom-center of the spout.
 *
 * The shooter is optionally interactive. When it's not interactive, the shooter and track are hidden.
 * When the shooter is interactive, it has the following features:
 *
 * (1) Close-on-release mode: When the user drags the slider, releasing it sets the flow to zero.
 * See options.closeToRelease: true.
 *
 * (2) Slider mode: When the user drags the slider, releasing it will leave the shooter wherever it is
 * released, and (if in the on position) the flow will continue. See options.closeToRelease: false.
 *
 * (3) Tap-to-dispense: When the user taps on the shooter without dragging, it's on/off state toggles.
 * If the shooter was in the off state when tapped, it opens and dispenses a configurable amount of fluid.
 * This feature can be enabled simultaneously with (1) and (2) above. See the various tapToDispense* options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import LinearFunction from '../../dot/js/LinearFunction.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import { Circle, DragListener, Image, InteractiveHighlighting, Node, Rectangle } from '../../scenery/js/imports.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import faucetBody_png from '../images/faucetBody_png.js';
import faucetFlange_png from '../images/faucetFlange_png.js';
import faucetFlangeDisabled_png from '../images/faucetFlangeDisabled_png.js';
import faucetHorizontalPipe_png from '../images/faucetHorizontalPipe_png.js';
import faucetKnob_png from '../images/faucetKnob_png.js';
import faucetKnobDisabled_png from '../images/faucetKnobDisabled_png.js';
import faucetShaft_png from '../images/faucetShaft_png.js';
import faucetSpout_png from '../images/faucetSpout_png.js';
import faucetStop_png from '../images/faucetStop_png.js';
import faucetTrack_png from '../images/faucetTrack_png.js';
import faucetVerticalPipe_png from '../images/faucetVerticalPipe_png.js';
import sceneryPhet from './sceneryPhet.js';
import optionize from '../../phet-core/js/optionize.js';
// constants
const DEBUG_ORIGIN = false; // when true, draws a red dot at the origin (bottom-center of the spout)
const SPOUT_OUTPUT_CENTER_X = 112; // center of spout in faucetBody_png
const HORIZONTAL_PIPE_X_OVERLAP = 1; // overlap between horizontal pipe and faucet body, so vertical seam is not visible
const VERTICAL_PIPE_Y_OVERLAP = 1; // overlap between vertical pipe and faucet body/spout, so horizontal seam is not visible
const SHOOTER_MIN_X_OFFSET = 4; // x-offset of shooter's off position in faucetTrack_png
const SHOOTER_MAX_X_OFFSET = 66; // x-offset of shooter's full-on position in faucetTrack_png
const SHOOTER_Y_OFFSET = 16; // y-offset of shooter's centerY in faucetTrack_png
const SHOOTER_WINDOW_BOUNDS = new Bounds2(10, 10, 90, 25); // bounds of the window in faucetBody_png, through which you see the shooter handle
const TRACK_Y_OFFSET = 15; // offset of the track's bottom from the top of faucetBody_png

export default class FaucetNode extends Node {
  constructor(maxFlowRate, flowRateProperty, enabledProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      horizontalPipeLength: SPOUT_OUTPUT_CENTER_X,
      verticalPipeLength: 43,
      tapToDispenseEnabled: true,
      tapToDispenseAmount: 0.25 * maxFlowRate,
      tapToDispenseInterval: 500,
      closeOnRelease: true,
      interactiveProperty: new Property(true),
      rasterizeHorizontalPipeNode: false,
      // ParentOptions
      scale: 1,
      enabledProperty: enabledProperty,
      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'FaucetNode',
      phetioType: FaucetNode.FaucetNodeIO,
      phetioEventType: EventType.USER
    }, providedOptions);
    assert && assert(1000 * options.tapToDispenseAmount / options.tapToDispenseInterval <= maxFlowRate);

    // shooter
    const shooterNode = new ShooterNode(enabledProperty, options.shooterOptions);

    // track that the shooter moves in
    const trackNode = new Image(faucetTrack_png);

    // horizontal pipe, tiled horizontally
    let horizontalPipeNode = new Image(faucetHorizontalPipe_png);
    const horizontalPipeWidth = options.horizontalPipeLength - SPOUT_OUTPUT_CENTER_X + HORIZONTAL_PIPE_X_OVERLAP;
    assert && assert(horizontalPipeWidth > 0);
    horizontalPipeNode.setScaleMagnitude(horizontalPipeWidth / faucetHorizontalPipe_png.width, 1);
    if (options.rasterizeHorizontalPipeNode) {
      horizontalPipeNode = horizontalPipeNode.rasterized();
    }

    // vertical pipe
    const verticalPipeNode = new Image(faucetVerticalPipe_png);
    const verticalPipeNodeHeight = options.verticalPipeLength + 2 * VERTICAL_PIPE_Y_OVERLAP;
    assert && assert(verticalPipeNodeHeight > 0);
    verticalPipeNode.setScaleMagnitude(1, verticalPipeNodeHeight / verticalPipeNode.height);

    // other nodes
    const spoutNode = new Image(faucetSpout_png);
    const bodyNode = new Image(faucetBody_png);
    const shooterWindowNode = new Rectangle(SHOOTER_WINDOW_BOUNDS.minX, SHOOTER_WINDOW_BOUNDS.minY, SHOOTER_WINDOW_BOUNDS.maxX - SHOOTER_WINDOW_BOUNDS.minX, SHOOTER_WINDOW_BOUNDS.maxY - SHOOTER_WINDOW_BOUNDS.minY, {
      fill: 'rgb(107,107,107)'
    });
    const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
    super(_.omit(options, Node.REQUIRES_BOUNDS_OPTION_KEYS));

    // rendering order
    this.addChild(shooterWindowNode);
    this.addChild(horizontalPipeNode);
    this.addChild(verticalPipeNode);
    this.addChild(spoutNode);
    this.addChild(bodyNode);
    this.addChild(shooterNode);
    this.addChild(trackNode);

    // origin
    if (DEBUG_ORIGIN) {
      this.addChild(new Circle({
        radius: 3,
        fill: 'red'
      }));
    }

    // layout
    {
      // spout's origin is at bottom-center
      spoutNode.centerX = 0;
      spoutNode.bottom = 0;

      // vertical pipe above spout
      verticalPipeNode.centerX = spoutNode.centerX;
      verticalPipeNode.bottom = spoutNode.top + VERTICAL_PIPE_Y_OVERLAP;

      // body above vertical pipe
      bodyNode.right = verticalPipeNode.right;
      bodyNode.bottom = verticalPipeNode.top + VERTICAL_PIPE_Y_OVERLAP;

      // shooter window is in the body's coordinate frame
      shooterWindowNode.translation = bodyNode.translation;

      // horizontal pipe connects to left edge of body
      horizontalPipeNode.right = bodyNode.left + HORIZONTAL_PIPE_X_OVERLAP;
      horizontalPipeNode.top = bodyNode.top;

      // track at top of body
      trackNode.left = bodyNode.left;
      trackNode.bottom = bodyNode.top + TRACK_Y_OFFSET;

      // shooter at top of body
      shooterNode.left = trackNode.left + SHOOTER_MIN_X_OFFSET;
      shooterNode.centerY = trackNode.top + SHOOTER_Y_OFFSET;
    }

    // x-offset relative to left edge of bodyNode
    const offsetToFlowRate = new LinearFunction(SHOOTER_MIN_X_OFFSET, SHOOTER_MAX_X_OFFSET, 0, maxFlowRate, true /* clamp */);

    // tap-to-dispense feature
    let tapToDispenseIsArmed = false; // should we do tap-to-dispense when the pointer is released?
    let tapToDispenseIsRunning = false; // is tap-to-dispense in progress?
    let timeoutID;
    let intervalID;
    const startTapToDispense = () => {
      if (enabledProperty.get() && tapToDispenseIsArmed) {
        // redundant guard
        const flowRate = options.tapToDispenseAmount / options.tapToDispenseInterval * 1000; // L/ms -> L/sec
        this.phetioStartEvent('startTapToDispense', {
          data: {
            flowRate: flowRate
          }
        });
        tapToDispenseIsArmed = false;
        tapToDispenseIsRunning = true;
        flowRateProperty.set(flowRate);
        timeoutID = stepTimer.setTimeout(() => {
          intervalID = stepTimer.setInterval(() => endTapToDispense(), options.tapToDispenseInterval);
        }, 0);
        this.phetioEndEvent();
      }
    };
    const endTapToDispense = () => {
      this.phetioStartEvent('endTapToDispense', {
        data: {
          flowRate: 0
        }
      });
      flowRateProperty.set(0);
      if (timeoutID !== null) {
        stepTimer.clearTimeout(timeoutID);
        timeoutID = null;
      }
      if (intervalID !== null) {
        stepTimer.clearInterval(intervalID);
        intervalID = null;
      }
      tapToDispenseIsRunning = false;
      this.phetioEndEvent();
    };
    let startXOffset = 0; // where the drag started, relative to the target node's origin, in parent view coordinates
    const dragListener = new DragListener({
      start: event => {
        if (enabledProperty.get()) {
          // prepare to do tap-to-dispense, will be canceled if the user drags before releasing the pointer
          tapToDispenseIsArmed = options.tapToDispenseEnabled;
          assert && assert(event.currentTarget);
          startXOffset = event.currentTarget.globalToParentPoint(event.pointer.point).x - event.currentTarget.left;
        }
      },
      // adjust the flow
      drag: (event, listener) => {
        // dragging is the cue that we're not doing tap-to-dispense
        tapToDispenseIsArmed = false;
        if (tapToDispenseIsRunning) {
          endTapToDispense();
        }

        // compute the new flow rate
        if (enabledProperty.get()) {
          // offsetToFlowRate is relative to bodyNode.left, so account for it
          const xOffset = listener.currentTarget.globalToParentPoint(event.pointer.point).x - startXOffset - bodyNode.left;
          const flowRate = offsetToFlowRate.evaluate(xOffset);
          flowRateProperty.set(flowRate);
        }
      },
      end: () => {
        if (enabledProperty.get()) {
          if (tapToDispenseIsArmed) {
            // tapping toggles the tap-to-dispense state
            tapToDispenseIsRunning || flowRateProperty.get() !== 0 ? endTapToDispense() : startTapToDispense();
          } else if (options.closeOnRelease) {
            // the shooter was dragged and released, so turn off the faucet
            flowRateProperty.set(0);
          }
        }
      },
      tandem: options.tandem.createTandem('dragListener'),
      // pdom - Even though this uses DragListener, allow discrete click events for alt input to let out a bit of
      // fluid at a time every press using tapToDispense.
      // TODO: https://github.com/phetsims/scenery-phet/issues/773 - If tapToDispense is false, the click will do
      //  nothing. If design likes this, use tapToDispense on click even if tapToDispenseEnabled is false.
      canClick: true
    });
    shooterNode.addInputListener(dragListener);
    const flowRateObserver = flowRate => {
      shooterNode.left = bodyNode.left + offsetToFlowRate.inverse(flowRate);
    };
    flowRateProperty.link(flowRateObserver);
    const enabledObserver = enabled => {
      if (!enabled && dragListener.isPressed) {
        dragListener.interrupt();
      }
      if (!enabled && tapToDispenseIsRunning) {
        endTapToDispense();
      }
    };
    enabledProperty.link(enabledObserver);
    this.mutate(boundsRequiredOptionKeys);

    // flow rate control is visible only when the faucet is interactive
    const interactiveObserver = interactive => {
      shooterNode.visible = trackNode.visible = interactive;

      // Non-interactive faucet nodes should not be keyboard navigable.  Must be done after super() (to AccessibleSlider)
      shooterNode.tagName = interactive ? 'button' : null;
    };
    options.interactiveProperty.link(interactiveObserver);

    // Add a link to flowRateProperty, to make it easier to find in Studio.
    // See https://github.com/phetsims/ph-scale/issues/123
    this.addLinkedElement(flowRateProperty, {
      tandem: options.tandem.createTandem('flowRateProperty')
    });
    this.disposeFaucetNode = () => {
      // Properties
      if (options.interactiveProperty.hasListener(interactiveObserver)) {
        options.interactiveProperty.unlink(interactiveObserver);
      }
      if (flowRateProperty.hasListener(flowRateObserver)) {
        flowRateProperty.unlink(flowRateObserver);
      }
      if (enabledProperty.hasListener(enabledObserver)) {
        enabledProperty.unlink(enabledObserver);
      }

      // Subcomponents
      dragListener.dispose();
      shooterNode.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'FaucetNode', this);
  }
  dispose() {
    this.disposeFaucetNode();
    super.dispose();
  }
  static FaucetNodeIO = new IOType('FaucetNodeIO', {
    valueType: FaucetNode,
    documentation: 'Faucet that emits fluid, typically user-controllable',
    supertype: Node.NodeIO,
    events: ['startTapToDispense', 'endTapToDispense']
  });
}
// no NodeOptions are included
/**
 * The 'shooter' is the interactive part of the faucet.
 */
class ShooterNode extends InteractiveHighlighting(Node) {
  constructor(enabledProperty, providedOptions) {
    const options = optionize()({
      knobScale: 0.6,
      touchAreaXDilation: 0,
      touchAreaYDilation: 0,
      mouseAreaXDilation: 0,
      mouseAreaYDilation: 0
    }, providedOptions);

    // knob
    const knobNode = new Image(faucetKnob_png);

    // set pointer areas before scaling
    knobNode.touchArea = knobNode.localBounds.dilatedXY(options.touchAreaXDilation, options.touchAreaYDilation);
    knobNode.mouseArea = knobNode.localBounds.dilatedXY(options.mouseAreaXDilation, options.mouseAreaYDilation);
    knobNode.scale(options.knobScale);
    const knobDisabledNode = new Image(faucetKnobDisabled_png);
    knobDisabledNode.scale(knobNode.getScaleVector());

    // shaft
    const shaftNode = new Image(faucetShaft_png);

    // flange
    const flangeNode = new Image(faucetFlange_png);
    const flangeDisabledNode = new Image(faucetFlangeDisabled_png);

    // stop
    const stopNode = new Image(faucetStop_png);
    super({
      children: [shaftNode, stopNode, flangeNode, flangeDisabledNode, knobNode, knobDisabledNode]
    });

    // layout, relative to shaft
    stopNode.x = shaftNode.x + 13;
    stopNode.centerY = shaftNode.centerY;
    flangeNode.left = shaftNode.right - 1; // a bit of overlap
    flangeNode.centerY = shaftNode.centerY;
    flangeDisabledNode.translation = flangeNode.translation;
    knobNode.left = flangeNode.right - 8; // a bit of overlap makes this look better
    knobNode.centerY = flangeNode.centerY;
    knobDisabledNode.translation = knobNode.translation;
    const enabledObserver = enabled => {
      // the entire shooter is draggable, but encourage dragging by the knob by changing its cursor
      this.pickable = enabled;
      knobNode.cursor = flangeNode.cursor = enabled ? 'pointer' : 'default';
      knobNode.visible = enabled;
      knobDisabledNode.visible = !enabled;
      flangeNode.visible = enabled;
      flangeDisabledNode.visible = !enabled;
    };
    enabledProperty.link(enabledObserver);
    this.disposeShooterNode = () => {
      if (enabledProperty.hasListener(enabledObserver)) {
        enabledProperty.unlink(enabledObserver);
      }
    };
  }
  dispose() {
    this.disposeShooterNode();
    super.dispose();
  }
}
sceneryPhet.register('FaucetNode', FaucetNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIkJvdW5kczIiLCJMaW5lYXJGdW5jdGlvbiIsIkluc3RhbmNlUmVnaXN0cnkiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJJbWFnZSIsIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIiwiTm9kZSIsIlJlY3RhbmdsZSIsIkV2ZW50VHlwZSIsIlRhbmRlbSIsIklPVHlwZSIsImZhdWNldEJvZHlfcG5nIiwiZmF1Y2V0RmxhbmdlX3BuZyIsImZhdWNldEZsYW5nZURpc2FibGVkX3BuZyIsImZhdWNldEhvcml6b250YWxQaXBlX3BuZyIsImZhdWNldEtub2JfcG5nIiwiZmF1Y2V0S25vYkRpc2FibGVkX3BuZyIsImZhdWNldFNoYWZ0X3BuZyIsImZhdWNldFNwb3V0X3BuZyIsImZhdWNldFN0b3BfcG5nIiwiZmF1Y2V0VHJhY2tfcG5nIiwiZmF1Y2V0VmVydGljYWxQaXBlX3BuZyIsInNjZW5lcnlQaGV0Iiwib3B0aW9uaXplIiwiREVCVUdfT1JJR0lOIiwiU1BPVVRfT1VUUFVUX0NFTlRFUl9YIiwiSE9SSVpPTlRBTF9QSVBFX1hfT1ZFUkxBUCIsIlZFUlRJQ0FMX1BJUEVfWV9PVkVSTEFQIiwiU0hPT1RFUl9NSU5fWF9PRkZTRVQiLCJTSE9PVEVSX01BWF9YX09GRlNFVCIsIlNIT09URVJfWV9PRkZTRVQiLCJTSE9PVEVSX1dJTkRPV19CT1VORFMiLCJUUkFDS19ZX09GRlNFVCIsIkZhdWNldE5vZGUiLCJjb25zdHJ1Y3RvciIsIm1heEZsb3dSYXRlIiwiZmxvd1JhdGVQcm9wZXJ0eSIsImVuYWJsZWRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJob3Jpem9udGFsUGlwZUxlbmd0aCIsInZlcnRpY2FsUGlwZUxlbmd0aCIsInRhcFRvRGlzcGVuc2VFbmFibGVkIiwidGFwVG9EaXNwZW5zZUFtb3VudCIsInRhcFRvRGlzcGVuc2VJbnRlcnZhbCIsImNsb3NlT25SZWxlYXNlIiwiaW50ZXJhY3RpdmVQcm9wZXJ0eSIsInJhc3Rlcml6ZUhvcml6b250YWxQaXBlTm9kZSIsInNjYWxlIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvVHlwZSIsIkZhdWNldE5vZGVJTyIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJhc3NlcnQiLCJzaG9vdGVyTm9kZSIsIlNob290ZXJOb2RlIiwic2hvb3Rlck9wdGlvbnMiLCJ0cmFja05vZGUiLCJob3Jpem9udGFsUGlwZU5vZGUiLCJob3Jpem9udGFsUGlwZVdpZHRoIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJ3aWR0aCIsInJhc3Rlcml6ZWQiLCJ2ZXJ0aWNhbFBpcGVOb2RlIiwidmVydGljYWxQaXBlTm9kZUhlaWdodCIsImhlaWdodCIsInNwb3V0Tm9kZSIsImJvZHlOb2RlIiwic2hvb3RlcldpbmRvd05vZGUiLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIiwiZmlsbCIsImJvdW5kc1JlcXVpcmVkT3B0aW9uS2V5cyIsIl8iLCJwaWNrIiwiUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTIiwib21pdCIsImFkZENoaWxkIiwicmFkaXVzIiwiY2VudGVyWCIsImJvdHRvbSIsInRvcCIsInJpZ2h0IiwidHJhbnNsYXRpb24iLCJsZWZ0IiwiY2VudGVyWSIsIm9mZnNldFRvRmxvd1JhdGUiLCJ0YXBUb0Rpc3BlbnNlSXNBcm1lZCIsInRhcFRvRGlzcGVuc2VJc1J1bm5pbmciLCJ0aW1lb3V0SUQiLCJpbnRlcnZhbElEIiwic3RhcnRUYXBUb0Rpc3BlbnNlIiwiZ2V0IiwiZmxvd1JhdGUiLCJwaGV0aW9TdGFydEV2ZW50IiwiZGF0YSIsInNldCIsInNldFRpbWVvdXQiLCJzZXRJbnRlcnZhbCIsImVuZFRhcFRvRGlzcGVuc2UiLCJwaGV0aW9FbmRFdmVudCIsImNsZWFyVGltZW91dCIsImNsZWFySW50ZXJ2YWwiLCJzdGFydFhPZmZzZXQiLCJkcmFnTGlzdGVuZXIiLCJzdGFydCIsImV2ZW50IiwiY3VycmVudFRhcmdldCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJ4IiwiZHJhZyIsImxpc3RlbmVyIiwieE9mZnNldCIsImV2YWx1YXRlIiwiZW5kIiwiY3JlYXRlVGFuZGVtIiwiY2FuQ2xpY2siLCJhZGRJbnB1dExpc3RlbmVyIiwiZmxvd1JhdGVPYnNlcnZlciIsImludmVyc2UiLCJsaW5rIiwiZW5hYmxlZE9ic2VydmVyIiwiZW5hYmxlZCIsImlzUHJlc3NlZCIsImludGVycnVwdCIsIm11dGF0ZSIsImludGVyYWN0aXZlT2JzZXJ2ZXIiLCJpbnRlcmFjdGl2ZSIsInZpc2libGUiLCJ0YWdOYW1lIiwiYWRkTGlua2VkRWxlbWVudCIsImRpc3Bvc2VGYXVjZXROb2RlIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJkaXNwb3NlIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwic3VwZXJ0eXBlIiwiTm9kZUlPIiwiZXZlbnRzIiwia25vYlNjYWxlIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibW91c2VBcmVhWERpbGF0aW9uIiwibW91c2VBcmVhWURpbGF0aW9uIiwia25vYk5vZGUiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsIm1vdXNlQXJlYSIsImtub2JEaXNhYmxlZE5vZGUiLCJnZXRTY2FsZVZlY3RvciIsInNoYWZ0Tm9kZSIsImZsYW5nZU5vZGUiLCJmbGFuZ2VEaXNhYmxlZE5vZGUiLCJzdG9wTm9kZSIsImNoaWxkcmVuIiwicGlja2FibGUiLCJjdXJzb3IiLCJkaXNwb3NlU2hvb3Rlck5vZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZhdWNldE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRmF1Y2V0IHdpdGggYSBwaW5iYWxsIG1hY2hpbmUgJ3Nob290ZXInLlxyXG4gKiBXaGVuIHRoZSBmYXVjZXQgaXMgZGlzYWJsZWQsIHRoZSBmbG93IHJhdGUgaXMgc2V0IHRvIHplcm8gYW5kIHRoZSBzaG9vdGVyIGlzIGRpc2FibGVkLlxyXG4gKiBPcmlnaW4gaXMgYXQgdGhlIGJvdHRvbS1jZW50ZXIgb2YgdGhlIHNwb3V0LlxyXG4gKlxyXG4gKiBUaGUgc2hvb3RlciBpcyBvcHRpb25hbGx5IGludGVyYWN0aXZlLiBXaGVuIGl0J3Mgbm90IGludGVyYWN0aXZlLCB0aGUgc2hvb3RlciBhbmQgdHJhY2sgYXJlIGhpZGRlbi5cclxuICogV2hlbiB0aGUgc2hvb3RlciBpcyBpbnRlcmFjdGl2ZSwgaXQgaGFzIHRoZSBmb2xsb3dpbmcgZmVhdHVyZXM6XHJcbiAqXHJcbiAqICgxKSBDbG9zZS1vbi1yZWxlYXNlIG1vZGU6IFdoZW4gdGhlIHVzZXIgZHJhZ3MgdGhlIHNsaWRlciwgcmVsZWFzaW5nIGl0IHNldHMgdGhlIGZsb3cgdG8gemVyby5cclxuICogU2VlIG9wdGlvbnMuY2xvc2VUb1JlbGVhc2U6IHRydWUuXHJcbiAqXHJcbiAqICgyKSBTbGlkZXIgbW9kZTogV2hlbiB0aGUgdXNlciBkcmFncyB0aGUgc2xpZGVyLCByZWxlYXNpbmcgaXQgd2lsbCBsZWF2ZSB0aGUgc2hvb3RlciB3aGVyZXZlciBpdCBpc1xyXG4gKiByZWxlYXNlZCwgYW5kIChpZiBpbiB0aGUgb24gcG9zaXRpb24pIHRoZSBmbG93IHdpbGwgY29udGludWUuIFNlZSBvcHRpb25zLmNsb3NlVG9SZWxlYXNlOiBmYWxzZS5cclxuICpcclxuICogKDMpIFRhcC10by1kaXNwZW5zZTogV2hlbiB0aGUgdXNlciB0YXBzIG9uIHRoZSBzaG9vdGVyIHdpdGhvdXQgZHJhZ2dpbmcsIGl0J3Mgb24vb2ZmIHN0YXRlIHRvZ2dsZXMuXHJcbiAqIElmIHRoZSBzaG9vdGVyIHdhcyBpbiB0aGUgb2ZmIHN0YXRlIHdoZW4gdGFwcGVkLCBpdCBvcGVucyBhbmQgZGlzcGVuc2VzIGEgY29uZmlndXJhYmxlIGFtb3VudCBvZiBmbHVpZC5cclxuICogVGhpcyBmZWF0dXJlIGNhbiBiZSBlbmFibGVkIHNpbXVsdGFuZW91c2x5IHdpdGggKDEpIGFuZCAoMikgYWJvdmUuIFNlZSB0aGUgdmFyaW91cyB0YXBUb0Rpc3BlbnNlKiBvcHRpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IExpbmVhckZ1bmN0aW9uIGZyb20gJy4uLy4uL2RvdC9qcy9MaW5lYXJGdW5jdGlvbi5qcyc7XHJcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIERyYWdMaXN0ZW5lciwgSW1hZ2UsIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IGZhdWNldEJvZHlfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRCb2R5X3BuZy5qcyc7XHJcbmltcG9ydCBmYXVjZXRGbGFuZ2VfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRGbGFuZ2VfcG5nLmpzJztcclxuaW1wb3J0IGZhdWNldEZsYW5nZURpc2FibGVkX3BuZyBmcm9tICcuLi9pbWFnZXMvZmF1Y2V0RmxhbmdlRGlzYWJsZWRfcG5nLmpzJztcclxuaW1wb3J0IGZhdWNldEhvcml6b250YWxQaXBlX3BuZyBmcm9tICcuLi9pbWFnZXMvZmF1Y2V0SG9yaXpvbnRhbFBpcGVfcG5nLmpzJztcclxuaW1wb3J0IGZhdWNldEtub2JfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRLbm9iX3BuZy5qcyc7XHJcbmltcG9ydCBmYXVjZXRLbm9iRGlzYWJsZWRfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRLbm9iRGlzYWJsZWRfcG5nLmpzJztcclxuaW1wb3J0IGZhdWNldFNoYWZ0X3BuZyBmcm9tICcuLi9pbWFnZXMvZmF1Y2V0U2hhZnRfcG5nLmpzJztcclxuaW1wb3J0IGZhdWNldFNwb3V0X3BuZyBmcm9tICcuLi9pbWFnZXMvZmF1Y2V0U3BvdXRfcG5nLmpzJztcclxuaW1wb3J0IGZhdWNldFN0b3BfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRTdG9wX3BuZy5qcyc7XHJcbmltcG9ydCBmYXVjZXRUcmFja19wbmcgZnJvbSAnLi4vaW1hZ2VzL2ZhdWNldFRyYWNrX3BuZy5qcyc7XHJcbmltcG9ydCBmYXVjZXRWZXJ0aWNhbFBpcGVfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRWZXJ0aWNhbFBpcGVfcG5nLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IHsgVGltZXJMaXN0ZW5lciB9IGZyb20gJy4uLy4uL2F4b24vanMvVGltZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFQlVHX09SSUdJTiA9IGZhbHNlOyAvLyB3aGVuIHRydWUsIGRyYXdzIGEgcmVkIGRvdCBhdCB0aGUgb3JpZ2luIChib3R0b20tY2VudGVyIG9mIHRoZSBzcG91dClcclxuY29uc3QgU1BPVVRfT1VUUFVUX0NFTlRFUl9YID0gMTEyOyAvLyBjZW50ZXIgb2Ygc3BvdXQgaW4gZmF1Y2V0Qm9keV9wbmdcclxuY29uc3QgSE9SSVpPTlRBTF9QSVBFX1hfT1ZFUkxBUCA9IDE7IC8vIG92ZXJsYXAgYmV0d2VlbiBob3Jpem9udGFsIHBpcGUgYW5kIGZhdWNldCBib2R5LCBzbyB2ZXJ0aWNhbCBzZWFtIGlzIG5vdCB2aXNpYmxlXHJcbmNvbnN0IFZFUlRJQ0FMX1BJUEVfWV9PVkVSTEFQID0gMTsgLy8gb3ZlcmxhcCBiZXR3ZWVuIHZlcnRpY2FsIHBpcGUgYW5kIGZhdWNldCBib2R5L3Nwb3V0LCBzbyBob3Jpem9udGFsIHNlYW0gaXMgbm90IHZpc2libGVcclxuY29uc3QgU0hPT1RFUl9NSU5fWF9PRkZTRVQgPSA0OyAvLyB4LW9mZnNldCBvZiBzaG9vdGVyJ3Mgb2ZmIHBvc2l0aW9uIGluIGZhdWNldFRyYWNrX3BuZ1xyXG5jb25zdCBTSE9PVEVSX01BWF9YX09GRlNFVCA9IDY2OyAvLyB4LW9mZnNldCBvZiBzaG9vdGVyJ3MgZnVsbC1vbiBwb3NpdGlvbiBpbiBmYXVjZXRUcmFja19wbmdcclxuY29uc3QgU0hPT1RFUl9ZX09GRlNFVCA9IDE2OyAvLyB5LW9mZnNldCBvZiBzaG9vdGVyJ3MgY2VudGVyWSBpbiBmYXVjZXRUcmFja19wbmdcclxuY29uc3QgU0hPT1RFUl9XSU5ET1dfQk9VTkRTID0gbmV3IEJvdW5kczIoIDEwLCAxMCwgOTAsIDI1ICk7IC8vIGJvdW5kcyBvZiB0aGUgd2luZG93IGluIGZhdWNldEJvZHlfcG5nLCB0aHJvdWdoIHdoaWNoIHlvdSBzZWUgdGhlIHNob290ZXIgaGFuZGxlXHJcbmNvbnN0IFRSQUNLX1lfT0ZGU0VUID0gMTU7IC8vIG9mZnNldCBvZiB0aGUgdHJhY2sncyBib3R0b20gZnJvbSB0aGUgdG9wIG9mIGZhdWNldEJvZHlfcG5nXHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGhvcml6b250YWxQaXBlTGVuZ3RoPzogbnVtYmVyOyAvLyBkaXN0YW5jZSBiZXR3ZWVuIGxlZnQgZWRnZSBvZiBob3Jpem9udGFsIHBpcGUgYW5kIHNwb3V0J3MgY2VudGVyXHJcbiAgdmVydGljYWxQaXBlTGVuZ3RoPzogbnVtYmVyOyAvLyBsZW5ndGggb2YgdGhlIHZlcnRpY2FsIHBpcGUgdGhhdCBjb25uZWN0cyB0aGUgZmF1Y2V0IGJvZHkgdG8gdGhlIHNwb3V0XHJcbiAgdGFwVG9EaXNwZW5zZUVuYWJsZWQ/OiBib29sZWFuOyAvLyB0YXAtdG8tZGlzcGVuc2UgZmVhdHVyZTogdGFwcGluZyB0aGUgc2hvb3RlciBkaXNwZW5zZXMgc29tZSBmbHVpZFxyXG4gIHRhcFRvRGlzcGVuc2VBbW91bnQ/OiBudW1iZXI7IC8vIHRhcC10by1kaXNwZW5zZSBmZWF0dXJlOiBhbW91bnQgdG8gZGlzcGVuc2UsIGluIExcclxuICB0YXBUb0Rpc3BlbnNlSW50ZXJ2YWw/OiBudW1iZXI7IC8vIHRhcC10by1kaXNwZW5zZSBmZWF0dXJlOiBhbW91bnQgb2YgdGltZSB0aGF0IGZsdWlkIGlzIGRpc3BlbnNlZCwgaW4gbWlsbGlzZWNvbmRzXHJcbiAgY2xvc2VPblJlbGVhc2U/OiBib29sZWFuOyAvLyB3aGVuIHRoZSBzaG9vdGVyIGlzIHJlbGVhc2VkLCBjbG9zZSB0aGUgZmF1Y2V0XHJcbiAgaW50ZXJhY3RpdmVQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+OyAvLyB3aGVuIHRoZSBmYXVjZXQgaXMgaW50ZXJhY3RpdmUsIHRoZSBmbG93IHJhdGUgY29udHJvbCBpcyB2aXNpYmxlLCBzZWUgaXNzdWUgIzY3XHJcblxyXG4gIC8vIE92ZXJjb21lIGEgZmxpY2tlcmluZyBwcm9ibGVtcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMTg3XHJcbiAgcmFzdGVyaXplSG9yaXpvbnRhbFBpcGVOb2RlPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gb3B0aW9ucyBmb3IgdGhlIG5lc3RlZCB0eXBlIFNob290ZXJOb2RlXHJcbiAgc2hvb3Rlck9wdGlvbnM/OiBTaG9vdGVyTm9kZU9wdGlvbnM7XHJcbn07XHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IE5vZGVPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBGYXVjZXROb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZhdWNldE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlRmF1Y2V0Tm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXhGbG93UmF0ZTogbnVtYmVyLCBmbG93UmF0ZVByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zPzogRmF1Y2V0Tm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGYXVjZXROb2RlT3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ3Nob290ZXJPcHRpb25zJz4sIFBhcmVudE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGhvcml6b250YWxQaXBlTGVuZ3RoOiBTUE9VVF9PVVRQVVRfQ0VOVEVSX1gsXHJcbiAgICAgIHZlcnRpY2FsUGlwZUxlbmd0aDogNDMsXHJcbiAgICAgIHRhcFRvRGlzcGVuc2VFbmFibGVkOiB0cnVlLFxyXG4gICAgICB0YXBUb0Rpc3BlbnNlQW1vdW50OiAwLjI1ICogbWF4Rmxvd1JhdGUsXHJcbiAgICAgIHRhcFRvRGlzcGVuc2VJbnRlcnZhbDogNTAwLFxyXG4gICAgICBjbG9zZU9uUmVsZWFzZTogdHJ1ZSxcclxuICAgICAgaW50ZXJhY3RpdmVQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCB0cnVlICksXHJcbiAgICAgIHJhc3Rlcml6ZUhvcml6b250YWxQaXBlTm9kZTogZmFsc2UsXHJcblxyXG4gICAgICAvLyBQYXJlbnRPcHRpb25zXHJcbiAgICAgIHNjYWxlOiAxLFxyXG4gICAgICBlbmFibGVkUHJvcGVydHk6IGVuYWJsZWRQcm9wZXJ0eSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdGYXVjZXROb2RlJyxcclxuICAgICAgcGhldGlvVHlwZTogRmF1Y2V0Tm9kZS5GYXVjZXROb2RlSU8sXHJcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVJcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICggMTAwMCAqIG9wdGlvbnMudGFwVG9EaXNwZW5zZUFtb3VudCAvIG9wdGlvbnMudGFwVG9EaXNwZW5zZUludGVydmFsICkgPD0gbWF4Rmxvd1JhdGUgKTtcclxuXHJcbiAgICAvLyBzaG9vdGVyXHJcbiAgICBjb25zdCBzaG9vdGVyTm9kZSA9IG5ldyBTaG9vdGVyTm9kZSggZW5hYmxlZFByb3BlcnR5LCBvcHRpb25zLnNob290ZXJPcHRpb25zICk7XHJcblxyXG4gICAgLy8gdHJhY2sgdGhhdCB0aGUgc2hvb3RlciBtb3ZlcyBpblxyXG4gICAgY29uc3QgdHJhY2tOb2RlID0gbmV3IEltYWdlKCBmYXVjZXRUcmFja19wbmcgKTtcclxuXHJcbiAgICAvLyBob3Jpem9udGFsIHBpcGUsIHRpbGVkIGhvcml6b250YWxseVxyXG4gICAgbGV0IGhvcml6b250YWxQaXBlTm9kZTogTm9kZSA9IG5ldyBJbWFnZSggZmF1Y2V0SG9yaXpvbnRhbFBpcGVfcG5nICk7XHJcbiAgICBjb25zdCBob3Jpem9udGFsUGlwZVdpZHRoID0gb3B0aW9ucy5ob3Jpem9udGFsUGlwZUxlbmd0aCAtIFNQT1VUX09VVFBVVF9DRU5URVJfWCArIEhPUklaT05UQUxfUElQRV9YX09WRVJMQVA7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBob3Jpem9udGFsUGlwZVdpZHRoID4gMCApO1xyXG4gICAgaG9yaXpvbnRhbFBpcGVOb2RlLnNldFNjYWxlTWFnbml0dWRlKCBob3Jpem9udGFsUGlwZVdpZHRoIC8gZmF1Y2V0SG9yaXpvbnRhbFBpcGVfcG5nLndpZHRoLCAxICk7XHJcbiAgICBpZiAoIG9wdGlvbnMucmFzdGVyaXplSG9yaXpvbnRhbFBpcGVOb2RlICkge1xyXG4gICAgICBob3Jpem9udGFsUGlwZU5vZGUgPSBob3Jpem9udGFsUGlwZU5vZGUucmFzdGVyaXplZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHZlcnRpY2FsIHBpcGVcclxuICAgIGNvbnN0IHZlcnRpY2FsUGlwZU5vZGUgPSBuZXcgSW1hZ2UoIGZhdWNldFZlcnRpY2FsUGlwZV9wbmcgKTtcclxuICAgIGNvbnN0IHZlcnRpY2FsUGlwZU5vZGVIZWlnaHQgPSBvcHRpb25zLnZlcnRpY2FsUGlwZUxlbmd0aCArICggMiAqIFZFUlRJQ0FMX1BJUEVfWV9PVkVSTEFQICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0aWNhbFBpcGVOb2RlSGVpZ2h0ID4gMCApO1xyXG4gICAgdmVydGljYWxQaXBlTm9kZS5zZXRTY2FsZU1hZ25pdHVkZSggMSwgdmVydGljYWxQaXBlTm9kZUhlaWdodCAvIHZlcnRpY2FsUGlwZU5vZGUuaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gb3RoZXIgbm9kZXNcclxuICAgIGNvbnN0IHNwb3V0Tm9kZSA9IG5ldyBJbWFnZSggZmF1Y2V0U3BvdXRfcG5nICk7XHJcbiAgICBjb25zdCBib2R5Tm9kZSA9IG5ldyBJbWFnZSggZmF1Y2V0Qm9keV9wbmcgKTtcclxuXHJcbiAgICBjb25zdCBzaG9vdGVyV2luZG93Tm9kZSA9IG5ldyBSZWN0YW5nbGUoIFNIT09URVJfV0lORE9XX0JPVU5EUy5taW5YLCBTSE9PVEVSX1dJTkRPV19CT1VORFMubWluWSxcclxuICAgICAgU0hPT1RFUl9XSU5ET1dfQk9VTkRTLm1heFggLSBTSE9PVEVSX1dJTkRPV19CT1VORFMubWluWCwgU0hPT1RFUl9XSU5ET1dfQk9VTkRTLm1heFkgLSBTSE9PVEVSX1dJTkRPV19CT1VORFMubWluWSxcclxuICAgICAgeyBmaWxsOiAncmdiKDEwNywxMDcsMTA3KScgfSApO1xyXG5cclxuICAgIGNvbnN0IGJvdW5kc1JlcXVpcmVkT3B0aW9uS2V5cyA9IF8ucGljayggb3B0aW9ucywgTm9kZS5SRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKTtcclxuXHJcbiAgICBzdXBlciggXy5vbWl0KCBvcHRpb25zLCBOb2RlLlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyApICk7XHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICB0aGlzLmFkZENoaWxkKCBzaG9vdGVyV2luZG93Tm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggaG9yaXpvbnRhbFBpcGVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB2ZXJ0aWNhbFBpcGVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzcG91dE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJvZHlOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzaG9vdGVyTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdHJhY2tOb2RlICk7XHJcblxyXG4gICAgLy8gb3JpZ2luXHJcbiAgICBpZiAoIERFQlVHX09SSUdJTiApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggeyByYWRpdXM6IDMsIGZpbGw6ICdyZWQnIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGxheW91dFxyXG4gICAge1xyXG4gICAgICAvLyBzcG91dCdzIG9yaWdpbiBpcyBhdCBib3R0b20tY2VudGVyXHJcbiAgICAgIHNwb3V0Tm9kZS5jZW50ZXJYID0gMDtcclxuICAgICAgc3BvdXROb2RlLmJvdHRvbSA9IDA7XHJcblxyXG4gICAgICAvLyB2ZXJ0aWNhbCBwaXBlIGFib3ZlIHNwb3V0XHJcbiAgICAgIHZlcnRpY2FsUGlwZU5vZGUuY2VudGVyWCA9IHNwb3V0Tm9kZS5jZW50ZXJYO1xyXG4gICAgICB2ZXJ0aWNhbFBpcGVOb2RlLmJvdHRvbSA9IHNwb3V0Tm9kZS50b3AgKyBWRVJUSUNBTF9QSVBFX1lfT1ZFUkxBUDtcclxuXHJcbiAgICAgIC8vIGJvZHkgYWJvdmUgdmVydGljYWwgcGlwZVxyXG4gICAgICBib2R5Tm9kZS5yaWdodCA9IHZlcnRpY2FsUGlwZU5vZGUucmlnaHQ7XHJcbiAgICAgIGJvZHlOb2RlLmJvdHRvbSA9IHZlcnRpY2FsUGlwZU5vZGUudG9wICsgVkVSVElDQUxfUElQRV9ZX09WRVJMQVA7XHJcblxyXG4gICAgICAvLyBzaG9vdGVyIHdpbmRvdyBpcyBpbiB0aGUgYm9keSdzIGNvb3JkaW5hdGUgZnJhbWVcclxuICAgICAgc2hvb3RlcldpbmRvd05vZGUudHJhbnNsYXRpb24gPSBib2R5Tm9kZS50cmFuc2xhdGlvbjtcclxuXHJcbiAgICAgIC8vIGhvcml6b250YWwgcGlwZSBjb25uZWN0cyB0byBsZWZ0IGVkZ2Ugb2YgYm9keVxyXG4gICAgICBob3Jpem9udGFsUGlwZU5vZGUucmlnaHQgPSBib2R5Tm9kZS5sZWZ0ICsgSE9SSVpPTlRBTF9QSVBFX1hfT1ZFUkxBUDtcclxuICAgICAgaG9yaXpvbnRhbFBpcGVOb2RlLnRvcCA9IGJvZHlOb2RlLnRvcDtcclxuXHJcbiAgICAgIC8vIHRyYWNrIGF0IHRvcCBvZiBib2R5XHJcbiAgICAgIHRyYWNrTm9kZS5sZWZ0ID0gYm9keU5vZGUubGVmdDtcclxuICAgICAgdHJhY2tOb2RlLmJvdHRvbSA9IGJvZHlOb2RlLnRvcCArIFRSQUNLX1lfT0ZGU0VUO1xyXG5cclxuICAgICAgLy8gc2hvb3RlciBhdCB0b3Agb2YgYm9keVxyXG4gICAgICBzaG9vdGVyTm9kZS5sZWZ0ID0gdHJhY2tOb2RlLmxlZnQgKyBTSE9PVEVSX01JTl9YX09GRlNFVDtcclxuICAgICAgc2hvb3Rlck5vZGUuY2VudGVyWSA9IHRyYWNrTm9kZS50b3AgKyBTSE9PVEVSX1lfT0ZGU0VUO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHgtb2Zmc2V0IHJlbGF0aXZlIHRvIGxlZnQgZWRnZSBvZiBib2R5Tm9kZVxyXG4gICAgY29uc3Qgb2Zmc2V0VG9GbG93UmF0ZSA9IG5ldyBMaW5lYXJGdW5jdGlvbiggU0hPT1RFUl9NSU5fWF9PRkZTRVQsIFNIT09URVJfTUFYX1hfT0ZGU0VULCAwLCBtYXhGbG93UmF0ZSwgdHJ1ZSAvKiBjbGFtcCAqLyApO1xyXG5cclxuICAgIC8vIHRhcC10by1kaXNwZW5zZSBmZWF0dXJlXHJcbiAgICBsZXQgdGFwVG9EaXNwZW5zZUlzQXJtZWQgPSBmYWxzZTsgLy8gc2hvdWxkIHdlIGRvIHRhcC10by1kaXNwZW5zZSB3aGVuIHRoZSBwb2ludGVyIGlzIHJlbGVhc2VkP1xyXG4gICAgbGV0IHRhcFRvRGlzcGVuc2VJc1J1bm5pbmcgPSBmYWxzZTsgLy8gaXMgdGFwLXRvLWRpc3BlbnNlIGluIHByb2dyZXNzP1xyXG4gICAgbGV0IHRpbWVvdXRJRDogVGltZXJMaXN0ZW5lciB8IG51bGw7XHJcbiAgICBsZXQgaW50ZXJ2YWxJRDogVGltZXJMaXN0ZW5lciB8IG51bGw7XHJcbiAgICBjb25zdCBzdGFydFRhcFRvRGlzcGVuc2UgPSAoKSA9PiB7XHJcbiAgICAgIGlmICggZW5hYmxlZFByb3BlcnR5LmdldCgpICYmIHRhcFRvRGlzcGVuc2VJc0FybWVkICkgeyAvLyByZWR1bmRhbnQgZ3VhcmRcclxuICAgICAgICBjb25zdCBmbG93UmF0ZSA9ICggb3B0aW9ucy50YXBUb0Rpc3BlbnNlQW1vdW50IC8gb3B0aW9ucy50YXBUb0Rpc3BlbnNlSW50ZXJ2YWwgKSAqIDEwMDA7IC8vIEwvbXMgLT4gTC9zZWNcclxuICAgICAgICB0aGlzLnBoZXRpb1N0YXJ0RXZlbnQoICdzdGFydFRhcFRvRGlzcGVuc2UnLCB7IGRhdGE6IHsgZmxvd1JhdGU6IGZsb3dSYXRlIH0gfSApO1xyXG4gICAgICAgIHRhcFRvRGlzcGVuc2VJc0FybWVkID0gZmFsc2U7XHJcbiAgICAgICAgdGFwVG9EaXNwZW5zZUlzUnVubmluZyA9IHRydWU7XHJcbiAgICAgICAgZmxvd1JhdGVQcm9wZXJ0eS5zZXQoIGZsb3dSYXRlICk7XHJcbiAgICAgICAgdGltZW91dElEID0gc3RlcFRpbWVyLnNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgICAgIGludGVydmFsSUQgPSBzdGVwVGltZXIuc2V0SW50ZXJ2YWwoICgpID0+IGVuZFRhcFRvRGlzcGVuc2UoKSwgb3B0aW9ucy50YXBUb0Rpc3BlbnNlSW50ZXJ2YWwgKTtcclxuICAgICAgICB9LCAwICk7XHJcbiAgICAgICAgdGhpcy5waGV0aW9FbmRFdmVudCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3QgZW5kVGFwVG9EaXNwZW5zZSA9ICgpID0+IHtcclxuICAgICAgdGhpcy5waGV0aW9TdGFydEV2ZW50KCAnZW5kVGFwVG9EaXNwZW5zZScsIHsgZGF0YTogeyBmbG93UmF0ZTogMCB9IH0gKTtcclxuICAgICAgZmxvd1JhdGVQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgICAgaWYgKCB0aW1lb3V0SUQgIT09IG51bGwgKSB7XHJcbiAgICAgICAgc3RlcFRpbWVyLmNsZWFyVGltZW91dCggdGltZW91dElEICk7XHJcbiAgICAgICAgdGltZW91dElEID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGludGVydmFsSUQgIT09IG51bGwgKSB7XHJcbiAgICAgICAgc3RlcFRpbWVyLmNsZWFySW50ZXJ2YWwoIGludGVydmFsSUQgKTtcclxuICAgICAgICBpbnRlcnZhbElEID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICB0YXBUb0Rpc3BlbnNlSXNSdW5uaW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucGhldGlvRW5kRXZlbnQoKTtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IHN0YXJ0WE9mZnNldCA9IDA7IC8vIHdoZXJlIHRoZSBkcmFnIHN0YXJ0ZWQsIHJlbGF0aXZlIHRvIHRoZSB0YXJnZXQgbm9kZSdzIG9yaWdpbiwgaW4gcGFyZW50IHZpZXcgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IGRyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuXHJcbiAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgaWYgKCBlbmFibGVkUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gcHJlcGFyZSB0byBkbyB0YXAtdG8tZGlzcGVuc2UsIHdpbGwgYmUgY2FuY2VsZWQgaWYgdGhlIHVzZXIgZHJhZ3MgYmVmb3JlIHJlbGVhc2luZyB0aGUgcG9pbnRlclxyXG4gICAgICAgICAgdGFwVG9EaXNwZW5zZUlzQXJtZWQgPSBvcHRpb25zLnRhcFRvRGlzcGVuc2VFbmFibGVkO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQuY3VycmVudFRhcmdldCApO1xyXG4gICAgICAgICAgc3RhcnRYT2Zmc2V0ID0gZXZlbnQuY3VycmVudFRhcmdldCEuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLnggLSBldmVudC5jdXJyZW50VGFyZ2V0IS5sZWZ0O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIGFkanVzdCB0aGUgZmxvd1xyXG4gICAgICBkcmFnOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuXHJcbiAgICAgICAgLy8gZHJhZ2dpbmcgaXMgdGhlIGN1ZSB0aGF0IHdlJ3JlIG5vdCBkb2luZyB0YXAtdG8tZGlzcGVuc2VcclxuICAgICAgICB0YXBUb0Rpc3BlbnNlSXNBcm1lZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICggdGFwVG9EaXNwZW5zZUlzUnVubmluZyApIHtcclxuICAgICAgICAgIGVuZFRhcFRvRGlzcGVuc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNvbXB1dGUgdGhlIG5ldyBmbG93IHJhdGVcclxuICAgICAgICBpZiAoIGVuYWJsZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBvZmZzZXRUb0Zsb3dSYXRlIGlzIHJlbGF0aXZlIHRvIGJvZHlOb2RlLmxlZnQsIHNvIGFjY291bnQgZm9yIGl0XHJcbiAgICAgICAgICBjb25zdCB4T2Zmc2V0ID0gbGlzdGVuZXIuY3VycmVudFRhcmdldC5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueCAtIHN0YXJ0WE9mZnNldCAtIGJvZHlOb2RlLmxlZnQ7XHJcbiAgICAgICAgICBjb25zdCBmbG93UmF0ZSA9IG9mZnNldFRvRmxvd1JhdGUuZXZhbHVhdGUoIHhPZmZzZXQgKTtcclxuXHJcbiAgICAgICAgICBmbG93UmF0ZVByb3BlcnR5LnNldCggZmxvd1JhdGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBpZiAoIGVuYWJsZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICBpZiAoIHRhcFRvRGlzcGVuc2VJc0FybWVkICkge1xyXG4gICAgICAgICAgICAvLyB0YXBwaW5nIHRvZ2dsZXMgdGhlIHRhcC10by1kaXNwZW5zZSBzdGF0ZVxyXG4gICAgICAgICAgICAoIHRhcFRvRGlzcGVuc2VJc1J1bm5pbmcgfHwgZmxvd1JhdGVQcm9wZXJ0eS5nZXQoKSAhPT0gMCApID8gZW5kVGFwVG9EaXNwZW5zZSgpIDogc3RhcnRUYXBUb0Rpc3BlbnNlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggb3B0aW9ucy5jbG9zZU9uUmVsZWFzZSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoZSBzaG9vdGVyIHdhcyBkcmFnZ2VkIGFuZCByZWxlYXNlZCwgc28gdHVybiBvZmYgdGhlIGZhdWNldFxyXG4gICAgICAgICAgICBmbG93UmF0ZVByb3BlcnR5LnNldCggMCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInICksXHJcblxyXG4gICAgICAvLyBwZG9tIC0gRXZlbiB0aG91Z2ggdGhpcyB1c2VzIERyYWdMaXN0ZW5lciwgYWxsb3cgZGlzY3JldGUgY2xpY2sgZXZlbnRzIGZvciBhbHQgaW5wdXQgdG8gbGV0IG91dCBhIGJpdCBvZlxyXG4gICAgICAvLyBmbHVpZCBhdCBhIHRpbWUgZXZlcnkgcHJlc3MgdXNpbmcgdGFwVG9EaXNwZW5zZS5cclxuICAgICAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNzczIC0gSWYgdGFwVG9EaXNwZW5zZSBpcyBmYWxzZSwgdGhlIGNsaWNrIHdpbGwgZG9cclxuICAgICAgLy8gIG5vdGhpbmcuIElmIGRlc2lnbiBsaWtlcyB0aGlzLCB1c2UgdGFwVG9EaXNwZW5zZSBvbiBjbGljayBldmVuIGlmIHRhcFRvRGlzcGVuc2VFbmFibGVkIGlzIGZhbHNlLlxyXG4gICAgICBjYW5DbGljazogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgc2hvb3Rlck5vZGUuYWRkSW5wdXRMaXN0ZW5lciggZHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgY29uc3QgZmxvd1JhdGVPYnNlcnZlciA9ICggZmxvd1JhdGU6IG51bWJlciApID0+IHtcclxuICAgICAgc2hvb3Rlck5vZGUubGVmdCA9IGJvZHlOb2RlLmxlZnQgKyBvZmZzZXRUb0Zsb3dSYXRlLmludmVyc2UoIGZsb3dSYXRlICk7XHJcbiAgICB9O1xyXG4gICAgZmxvd1JhdGVQcm9wZXJ0eS5saW5rKCBmbG93UmF0ZU9ic2VydmVyICk7XHJcblxyXG4gICAgY29uc3QgZW5hYmxlZE9ic2VydmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xyXG4gICAgICBpZiAoICFlbmFibGVkICYmIGRyYWdMaXN0ZW5lci5pc1ByZXNzZWQgKSB7XHJcbiAgICAgICAgZHJhZ0xpc3RlbmVyLmludGVycnVwdCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggIWVuYWJsZWQgJiYgdGFwVG9EaXNwZW5zZUlzUnVubmluZyApIHtcclxuICAgICAgICBlbmRUYXBUb0Rpc3BlbnNlKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBlbmFibGVkUHJvcGVydHkubGluayggZW5hYmxlZE9ic2VydmVyICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIGJvdW5kc1JlcXVpcmVkT3B0aW9uS2V5cyApO1xyXG5cclxuICAgIC8vIGZsb3cgcmF0ZSBjb250cm9sIGlzIHZpc2libGUgb25seSB3aGVuIHRoZSBmYXVjZXQgaXMgaW50ZXJhY3RpdmVcclxuICAgIGNvbnN0IGludGVyYWN0aXZlT2JzZXJ2ZXIgPSAoIGludGVyYWN0aXZlOiBib29sZWFuICkgPT4ge1xyXG4gICAgICBzaG9vdGVyTm9kZS52aXNpYmxlID0gdHJhY2tOb2RlLnZpc2libGUgPSBpbnRlcmFjdGl2ZTtcclxuXHJcbiAgICAgIC8vIE5vbi1pbnRlcmFjdGl2ZSBmYXVjZXQgbm9kZXMgc2hvdWxkIG5vdCBiZSBrZXlib2FyZCBuYXZpZ2FibGUuICBNdXN0IGJlIGRvbmUgYWZ0ZXIgc3VwZXIoKSAodG8gQWNjZXNzaWJsZVNsaWRlcilcclxuICAgICAgc2hvb3Rlck5vZGUudGFnTmFtZSA9IGludGVyYWN0aXZlID8gJ2J1dHRvbicgOiBudWxsO1xyXG4gICAgfTtcclxuICAgIG9wdGlvbnMuaW50ZXJhY3RpdmVQcm9wZXJ0eS5saW5rKCBpbnRlcmFjdGl2ZU9ic2VydmVyICk7XHJcblxyXG4gICAgLy8gQWRkIGEgbGluayB0byBmbG93UmF0ZVByb3BlcnR5LCB0byBtYWtlIGl0IGVhc2llciB0byBmaW5kIGluIFN0dWRpby5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGgtc2NhbGUvaXNzdWVzLzEyM1xyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBmbG93UmF0ZVByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZmxvd1JhdGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUZhdWNldE5vZGUgPSAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBQcm9wZXJ0aWVzXHJcbiAgICAgIGlmICggb3B0aW9ucy5pbnRlcmFjdGl2ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCBpbnRlcmFjdGl2ZU9ic2VydmVyICkgKSB7XHJcbiAgICAgICAgb3B0aW9ucy5pbnRlcmFjdGl2ZVByb3BlcnR5LnVubGluayggaW50ZXJhY3RpdmVPYnNlcnZlciApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggZmxvd1JhdGVQcm9wZXJ0eS5oYXNMaXN0ZW5lciggZmxvd1JhdGVPYnNlcnZlciApICkge1xyXG4gICAgICAgIGZsb3dSYXRlUHJvcGVydHkudW5saW5rKCBmbG93UmF0ZU9ic2VydmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBlbmFibGVkUHJvcGVydHkuaGFzTGlzdGVuZXIoIGVuYWJsZWRPYnNlcnZlciApICkge1xyXG4gICAgICAgIGVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGVuYWJsZWRPYnNlcnZlciApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdWJjb21wb25lbnRzXHJcbiAgICAgIGRyYWdMaXN0ZW5lci5kaXNwb3NlKCk7XHJcbiAgICAgIHNob290ZXJOb2RlLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXHJcbiAgICBhc3NlcnQgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnRmF1Y2V0Tm9kZScsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlRmF1Y2V0Tm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBGYXVjZXROb2RlSU8gPSBuZXcgSU9UeXBlKCAnRmF1Y2V0Tm9kZUlPJywge1xyXG4gICAgdmFsdWVUeXBlOiBGYXVjZXROb2RlLFxyXG4gICAgZG9jdW1lbnRhdGlvbjogJ0ZhdWNldCB0aGF0IGVtaXRzIGZsdWlkLCB0eXBpY2FsbHkgdXNlci1jb250cm9sbGFibGUnLFxyXG4gICAgc3VwZXJ0eXBlOiBOb2RlLk5vZGVJTyxcclxuICAgIGV2ZW50czogWyAnc3RhcnRUYXBUb0Rpc3BlbnNlJywgJ2VuZFRhcFRvRGlzcGVuc2UnIF1cclxuICB9ICk7XHJcbn1cclxuXHJcbnR5cGUgU2hvb3Rlck5vZGVTZWxmT3B0aW9ucyA9IHtcclxuICBrbm9iU2NhbGU/OiBudW1iZXI7IC8vIHZhbHVlcyBpbiB0aGUgcmFuZ2UgMC42IC0gMS4wIGxvb2sgZGVjZW50XHJcblxyXG4gIC8vIHBvaW50ZXIgYXJlYXNcclxuICB0b3VjaEFyZWFYRGlsYXRpb24/OiBudW1iZXI7XHJcbiAgdG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIG1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcclxuICBtb3VzZUFyZWFZRGlsYXRpb24/OiBudW1iZXI7XHJcbn07XHJcbnR5cGUgU2hvb3Rlck5vZGVPcHRpb25zID0gU2hvb3Rlck5vZGVTZWxmT3B0aW9uczsgLy8gbm8gTm9kZU9wdGlvbnMgYXJlIGluY2x1ZGVkXHJcblxyXG4vKipcclxuICogVGhlICdzaG9vdGVyJyBpcyB0aGUgaW50ZXJhY3RpdmUgcGFydCBvZiB0aGUgZmF1Y2V0LlxyXG4gKi9cclxuY2xhc3MgU2hvb3Rlck5vZGUgZXh0ZW5kcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggTm9kZSApIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU2hvb3Rlck5vZGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zPzogU2hvb3Rlck5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2hvb3Rlck5vZGVPcHRpb25zLCBTaG9vdGVyTm9kZVNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICBrbm9iU2NhbGU6IDAuNixcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAwLFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDAsXHJcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogMCxcclxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiAwXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBrbm9iXHJcbiAgICBjb25zdCBrbm9iTm9kZSA9IG5ldyBJbWFnZSggZmF1Y2V0S25vYl9wbmcgKTtcclxuXHJcbiAgICAvLyBzZXQgcG9pbnRlciBhcmVhcyBiZWZvcmUgc2NhbGluZ1xyXG4gICAga25vYk5vZGUudG91Y2hBcmVhID0ga25vYk5vZGUubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCBvcHRpb25zLnRvdWNoQXJlYVhEaWxhdGlvbiwgb3B0aW9ucy50b3VjaEFyZWFZRGlsYXRpb24gKTtcclxuICAgIGtub2JOb2RlLm1vdXNlQXJlYSA9IGtub2JOb2RlLmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggb3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24sIG9wdGlvbnMubW91c2VBcmVhWURpbGF0aW9uICk7XHJcblxyXG4gICAga25vYk5vZGUuc2NhbGUoIG9wdGlvbnMua25vYlNjYWxlICk7XHJcbiAgICBjb25zdCBrbm9iRGlzYWJsZWROb2RlID0gbmV3IEltYWdlKCBmYXVjZXRLbm9iRGlzYWJsZWRfcG5nICk7XHJcbiAgICBrbm9iRGlzYWJsZWROb2RlLnNjYWxlKCBrbm9iTm9kZS5nZXRTY2FsZVZlY3RvcigpICk7XHJcblxyXG4gICAgLy8gc2hhZnRcclxuICAgIGNvbnN0IHNoYWZ0Tm9kZSA9IG5ldyBJbWFnZSggZmF1Y2V0U2hhZnRfcG5nICk7XHJcblxyXG4gICAgLy8gZmxhbmdlXHJcbiAgICBjb25zdCBmbGFuZ2VOb2RlID0gbmV3IEltYWdlKCBmYXVjZXRGbGFuZ2VfcG5nICk7XHJcbiAgICBjb25zdCBmbGFuZ2VEaXNhYmxlZE5vZGUgPSBuZXcgSW1hZ2UoIGZhdWNldEZsYW5nZURpc2FibGVkX3BuZyApO1xyXG5cclxuICAgIC8vIHN0b3BcclxuICAgIGNvbnN0IHN0b3BOb2RlID0gbmV3IEltYWdlKCBmYXVjZXRTdG9wX3BuZyApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgc2hhZnROb2RlLFxyXG4gICAgICAgIHN0b3BOb2RlLFxyXG4gICAgICAgIGZsYW5nZU5vZGUsXHJcbiAgICAgICAgZmxhbmdlRGlzYWJsZWROb2RlLFxyXG4gICAgICAgIGtub2JOb2RlLFxyXG4gICAgICAgIGtub2JEaXNhYmxlZE5vZGVcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGxheW91dCwgcmVsYXRpdmUgdG8gc2hhZnRcclxuICAgIHN0b3BOb2RlLnggPSBzaGFmdE5vZGUueCArIDEzO1xyXG4gICAgc3RvcE5vZGUuY2VudGVyWSA9IHNoYWZ0Tm9kZS5jZW50ZXJZO1xyXG4gICAgZmxhbmdlTm9kZS5sZWZ0ID0gc2hhZnROb2RlLnJpZ2h0IC0gMTsgLy8gYSBiaXQgb2Ygb3ZlcmxhcFxyXG4gICAgZmxhbmdlTm9kZS5jZW50ZXJZID0gc2hhZnROb2RlLmNlbnRlclk7XHJcbiAgICBmbGFuZ2VEaXNhYmxlZE5vZGUudHJhbnNsYXRpb24gPSBmbGFuZ2VOb2RlLnRyYW5zbGF0aW9uO1xyXG4gICAga25vYk5vZGUubGVmdCA9IGZsYW5nZU5vZGUucmlnaHQgLSA4OyAvLyBhIGJpdCBvZiBvdmVybGFwIG1ha2VzIHRoaXMgbG9vayBiZXR0ZXJcclxuICAgIGtub2JOb2RlLmNlbnRlclkgPSBmbGFuZ2VOb2RlLmNlbnRlclk7XHJcbiAgICBrbm9iRGlzYWJsZWROb2RlLnRyYW5zbGF0aW9uID0ga25vYk5vZGUudHJhbnNsYXRpb247XHJcblxyXG4gICAgY29uc3QgZW5hYmxlZE9ic2VydmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xyXG4gICAgICAvLyB0aGUgZW50aXJlIHNob290ZXIgaXMgZHJhZ2dhYmxlLCBidXQgZW5jb3VyYWdlIGRyYWdnaW5nIGJ5IHRoZSBrbm9iIGJ5IGNoYW5naW5nIGl0cyBjdXJzb3JcclxuICAgICAgdGhpcy5waWNrYWJsZSA9IGVuYWJsZWQ7XHJcbiAgICAgIGtub2JOb2RlLmN1cnNvciA9IGZsYW5nZU5vZGUuY3Vyc29yID0gZW5hYmxlZCA/ICdwb2ludGVyJyA6ICdkZWZhdWx0JztcclxuICAgICAga25vYk5vZGUudmlzaWJsZSA9IGVuYWJsZWQ7XHJcbiAgICAgIGtub2JEaXNhYmxlZE5vZGUudmlzaWJsZSA9ICFlbmFibGVkO1xyXG4gICAgICBmbGFuZ2VOb2RlLnZpc2libGUgPSBlbmFibGVkO1xyXG4gICAgICBmbGFuZ2VEaXNhYmxlZE5vZGUudmlzaWJsZSA9ICFlbmFibGVkO1xyXG4gICAgfTtcclxuICAgIGVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkT2JzZXJ2ZXIgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VTaG9vdGVyTm9kZSA9ICgpID0+IHtcclxuICAgICAgaWYgKCBlbmFibGVkUHJvcGVydHkuaGFzTGlzdGVuZXIoIGVuYWJsZWRPYnNlcnZlciApICkge1xyXG4gICAgICAgIGVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGVuYWJsZWRPYnNlcnZlciApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VTaG9vdGVyTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdGYXVjZXROb2RlJywgRmF1Y2V0Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELE9BQU9DLFNBQVMsTUFBTSw0QkFBNEI7QUFDbEQsT0FBT0MsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxPQUFPQyxjQUFjLE1BQU0sZ0NBQWdDO0FBQzNELE9BQU9DLGdCQUFnQixNQUFNLHNEQUFzRDtBQUNuRixTQUFTQyxNQUFNLEVBQUVDLFlBQVksRUFBRUMsS0FBSyxFQUFFQyx1QkFBdUIsRUFBRUMsSUFBSSxFQUFlQyxTQUFTLFFBQVEsNkJBQTZCO0FBQ2hJLE9BQU9DLFNBQVMsTUFBTSw4QkFBOEI7QUFDcEQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLGNBQWMs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