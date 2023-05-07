// Copyright 2015-2023, University of Colorado Boulder

/**
 * Conductivity tester. Light bulb connected to a battery, with draggable probes.
 * When the probes are both immersed in solution, the circuit is completed, and the bulb glows.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import Vector2Property from '../../dot/js/Vector2Property.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import { Circle, DragListener, Image, Node, Path, Rectangle, Text } from '../../scenery/js/imports.js';
import batteryDCell_png from '../images/batteryDCell_png.js';
import LightBulbNode from './LightBulbNode.js';
import MinusNode from './MinusNode.js';
import PhetFont from './PhetFont.js';
import PlusNode from './PlusNode.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
// constants
const SHOW_TESTER_ORIGIN = false; // draws a red circle at the tester's origin, for debugging
const SHOW_PROBE_ORIGIN = false; // draws a red circle at the origin of probes, for debugging
const DEFAULT_SHORT_CIRCUIT_FONT = new PhetFont(14);
class ConductivityTesterNode extends Node {
  /**
   * @param brightnessProperty brightness of bulb varies from 0 (off) to 1 (full on)
   * @param positionProperty position of the tester, at bottom-center of the bulb (model coordinate frame)
   * @param positiveProbePositionProperty position of bottom-center of the positive probe (model coordinate frame)
   * @param negativeProbePositionProperty position of bottom-center of the negative probe (model coordinate frame)
   * @param providedOptions
   */
  constructor(brightnessProperty, positionProperty, positiveProbePositionProperty, negativeProbePositionProperty, providedOptions) {
    // NOTE! Since positionProperty determines translation, avoid options related to translation!
    const options = optionize()({
      modelViewTransform: ModelViewTransform2.createIdentity(),
      interactive: true,
      // set to false if you're creating an icon
      bulbImageScale: 0.33,
      batteryDCell_pngScale: 0.6,
      // common to both probes
      probeSize: new Dimension2(20, 68),
      probeLineWidth: 0.5,
      probeDragYRange: null,
      probeCursor: 'pointer',
      // positive probe
      positiveProbeFill: 'red',
      positiveProbeStroke: 'black',
      positiveLabelFill: 'white',
      // negative probe
      negativeProbeFill: 'black',
      negativeProbeStroke: 'black',
      negativeLabelFill: 'white',
      // wires
      wireStroke: 'black',
      wireLineWidth: 1.5,
      bulbToBatteryWireLength: 40,
      // short-circuit indicator
      shortCircuitFont: DEFAULT_SHORT_CIRCUIT_FONT,
      shortCircuitFill: 'black'
    }, providedOptions);

    // bulb, origin at bottom center of base
    const lightBulbNode = new LightBulbNode(brightnessProperty, {
      bulbImageScale: options.bulbImageScale
    });

    // short-circuit indicator, centered above the light bulb
    assert && assert(brightnessProperty.get() === 0, 'layout will be incorrect if lightBulbNode has rays');
    const shortCircuitNode = new Text(SceneryPhetStrings.shortCircuitStringProperty, {
      font: options.shortCircuitFont,
      fill: options.shortCircuitFill,
      visible: false // initial state is no short circuit
    });

    shortCircuitNode.boundsProperty.link(bounds => {
      shortCircuitNode.centerX = lightBulbNode.centerX;
      shortCircuitNode.bottom = lightBulbNode.top;
    });

    // battery
    const battery = new Image(batteryDCell_png, {
      scale: options.batteryDCell_pngScale,
      left: options.bulbToBatteryWireLength,
      centerY: 0
    });

    // wire from bulb base to battery
    const bulbBatteryWire = new Path(new Shape().moveTo(0, 0).lineTo(options.bulbToBatteryWireLength, 0), {
      stroke: options.wireStroke,
      lineWidth: options.wireLineWidth
    });

    // apparatus (bulb + battery), origin at bottom center of bulb's base
    const apparatusNode = new Node({
      children: [bulbBatteryWire, battery, lightBulbNode, shortCircuitNode]
    });
    if (SHOW_TESTER_ORIGIN) {
      apparatusNode.addChild(new Circle(2, {
        fill: 'red'
      }));
    }

    // wire from battery terminal to positive probe
    const positiveWire = new WireNode(battery.getGlobalBounds().right, battery.getGlobalBounds().centerY, options.modelViewTransform.modelToViewX(positiveProbePositionProperty.get().x) - options.modelViewTransform.modelToViewX(positionProperty.get().x), options.modelViewTransform.modelToViewY(positiveProbePositionProperty.get().y) - options.modelViewTransform.modelToViewY(positionProperty.get().y) - options.probeSize.height, {
      stroke: options.wireStroke,
      lineWidth: options.wireLineWidth
    });

    // wire from base of bulb (origin) to negative probe
    const negativeWire = new WireNode(-5, -5,
    // specific to bulb image file
    options.modelViewTransform.modelToViewX(negativeProbePositionProperty.get().x) - options.modelViewTransform.modelToViewX(positionProperty.get().x), options.modelViewTransform.modelToViewY(negativeProbePositionProperty.get().y) - options.modelViewTransform.modelToViewY(positionProperty.get().y) - options.probeSize.height, {
      stroke: options.wireStroke,
      lineWidth: options.wireLineWidth
    });

    // drag listener for probes
    let clickYOffset = 0;
    const probeDragListener = new DragListener({
      start: event => {
        const currentTarget = event.currentTarget;
        clickYOffset = currentTarget.globalToParentPoint(event.pointer.point).y - currentTarget.y;
      },
      // probes move together
      drag: (event, listener) => {
        // do dragging in view coordinate frame
        const positionView = options.modelViewTransform.modelToViewPosition(positionProperty.get());
        let yView = listener.currentTarget.globalToParentPoint(event.pointer.point).y + positionView.y - clickYOffset;
        if (options.probeDragYRange) {
          yView = Utils.clamp(yView, positionView.y + options.probeDragYRange.min, positionView.y + options.probeDragYRange.max);
        }

        // convert to model coordinate frame
        const yModel = options.modelViewTransform.viewToModelY(yView);
        positiveProbePositionProperty.set(new Vector2(positiveProbePositionProperty.get().x, yModel));
        negativeProbePositionProperty.set(new Vector2(negativeProbePositionProperty.get().x, yModel));
      },
      tandem: options.tandem.createTandem('probeDragListener')
    });

    // probes
    const positiveProbe = new ProbeNode(new PlusNode({
      fill: options.positiveLabelFill
    }), {
      size: options.probeSize,
      fill: options.positiveProbeFill,
      stroke: options.positiveProbeStroke,
      lineWidth: options.probeLineWidth
    });
    const negativeProbe = new ProbeNode(new MinusNode({
      fill: options.negativeLabelFill
    }), {
      size: options.probeSize,
      fill: options.negativeProbeFill,
      stroke: options.negativeProbeStroke,
      lineWidth: options.probeLineWidth
    });
    if (options.interactive) {
      positiveProbe.cursor = options.probeCursor;
      positiveProbe.addInputListener(probeDragListener);
      negativeProbe.cursor = options.probeCursor;
      negativeProbe.addInputListener(probeDragListener);
    }
    options.children = [positiveWire, negativeWire, positiveProbe, negativeProbe, apparatusNode];
    super(options);

    // when the position changes ...
    const positionObserver = (position, oldPosition) => {
      // move the entire tester
      this.translation = options.modelViewTransform.modelToViewPosition(position);

      // probes move with the tester
      if (oldPosition) {
        const dx = position.x - oldPosition.x;
        const dy = position.y - oldPosition.y;
        positiveProbePositionProperty.set(new Vector2(positiveProbePositionProperty.get().x + dx, positiveProbePositionProperty.get().y + dy));
        negativeProbePositionProperty.set(new Vector2(negativeProbePositionProperty.get().x + dx, negativeProbePositionProperty.get().y + dy));
      }
    };
    positionProperty.link(positionObserver);

    // update positive wire if end point was changed
    const positiveProbeObserver = positiveProbePosition => {
      positiveProbe.centerX = options.modelViewTransform.modelToViewX(positiveProbePosition.x) - options.modelViewTransform.modelToViewX(positionProperty.get().x);
      positiveProbe.bottom = options.modelViewTransform.modelToViewY(positiveProbePosition.y) - options.modelViewTransform.modelToViewY(positionProperty.get().y);
      positiveWire.setEndPoint(positiveProbe.x, positiveProbe.y - options.probeSize.height);
    };
    positiveProbePositionProperty.link(positiveProbeObserver);

    // update negative wire if end point was changed
    const negativeProbeObserver = negativeProbePosition => {
      negativeProbe.centerX = options.modelViewTransform.modelToViewX(negativeProbePosition.x) - options.modelViewTransform.modelToViewX(positionProperty.get().x);
      negativeProbe.bottom = options.modelViewTransform.modelToViewY(negativeProbePosition.y) - options.modelViewTransform.modelToViewY(positionProperty.get().y);
      negativeWire.setEndPoint(negativeProbe.x, negativeProbe.y - options.probeSize.height);
    };
    negativeProbePositionProperty.link(negativeProbeObserver);
    this.shortCircuitNode = shortCircuitNode;

    // To prevent light from updating when invisible
    this.visibleProperty.link(visible => {
      lightBulbNode.visible = visible;
    });
    this.disposeConductivityTesterNode = () => {
      shortCircuitNode.dispose();

      // unlink from axon properties
      positionProperty.unlink(positionObserver);
      positiveProbePositionProperty.unlink(positiveProbeObserver);
      negativeProbePositionProperty.unlink(negativeProbeObserver);

      // dispose of sub-components
      lightBulbNode.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'ConductivityTesterNode', this);
  }

  /**
   * Is 'Short circuit' shown above the light bulb?
   */
  get shortCircuit() {
    return this.shortCircuitNode.visible;
  }

  /**
   * Determines whether 'Short circuit' is shown above the light bulb. Note that it is the client's responsibility
   * to ensure that the bulb's brightness (as set by brightnessProperty) is appropriate for a short circuit.
   */
  set shortCircuit(value) {
    this.shortCircuitNode.visible = value;
  }

  /**
   * Convenience function for creating an icon.
   * @param brightness 0-1 (off to full on)
   * @param positiveProbeXOffset x-offset of the positive probe, relative to the bulb's tip
   * @param negativeProbeXOffset x-offset of the negative probe, relative to the bulb's tip
   * @param bothProbesYOffset y-offset of both probes, relative to the bulb's tip
   * @param providedOptions
   */
  static createIcon(brightness, positiveProbeXOffset, negativeProbeXOffset, bothProbesYOffset, providedOptions) {
    const options = combineOptions({
      interactive: false
    }, providedOptions);
    return new ConductivityTesterNode(new Property(brightness), new Vector2Property(new Vector2(0, 0)), new Vector2Property(new Vector2(positiveProbeXOffset, bothProbesYOffset)), new Vector2Property(new Vector2(negativeProbeXOffset, bothProbesYOffset)), options);
  }
  dispose() {
    this.disposeConductivityTesterNode();
    super.dispose();
  }
}
sceneryPhet.register('ConductivityTesterNode', ConductivityTesterNode);
/**
 * Conductivity probe, origin at bottom center.
 */
class ProbeNode extends Node {
  constructor(labelNode, providedOptions) {
    const options = optionize()({
      size: new Dimension2(20, 60),
      fill: 'white',
      stroke: 'black',
      lineWidth: 1.5
    }, providedOptions);
    super();

    // plate
    const plateNode = new Rectangle(-options.size.width / 2, -options.size.height, options.size.width, options.size.height, {
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth
    });

    // scale the label to fix, place it towards bottom center
    labelNode.setScaleMagnitude(0.5 * options.size.width / labelNode.width);
    labelNode.centerX = plateNode.centerX;
    labelNode.bottom = plateNode.bottom - 10;

    // rendering order
    this.addChild(plateNode);
    this.addChild(labelNode);
    if (SHOW_PROBE_ORIGIN) {
      this.addChild(new Circle(2, {
        fill: 'red'
      }));
    }

    // expand touch area
    this.touchArea = this.localBounds.dilatedXY(10, 10);
    this.mutate(options);
  }
}
/**
 * Wires that connect to the probes.
 */
class WireNode extends Path {
  constructor(startX, startY, endX, endY, providedOptions) {
    super(null);
    this.startPoint = {
      x: startX,
      y: startY
    };

    // control point offsets for when probe is to left of light bulb
    this.controlPointOffset = {
      x: 30,
      y: -50
    };
    if (endX < startX) {
      // probe is to right of light bulb, flip sign on control point x-offset
      this.controlPointOffset.x = -this.controlPointOffset.x;
    }
    this.setEndPoint(endX, endY);
    this.mutate(providedOptions);
  }

  // Sets the end point coordinates, the point attached to the probe.
  setEndPoint(endX, endY) {
    const startX = this.startPoint.x;
    const startY = this.startPoint.y;
    const controlPointXOffset = this.controlPointOffset.x;
    const controlPointYOffset = this.controlPointOffset.y;
    this.setShape(new Shape().moveTo(startX, startY).cubicCurveTo(startX + controlPointXOffset, startY, endX, endY + controlPointYOffset, endX, endY));
  }
}
export default ConductivityTesterNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJJbWFnZSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImJhdHRlcnlEQ2VsbF9wbmciLCJMaWdodEJ1bGJOb2RlIiwiTWludXNOb2RlIiwiUGhldEZvbnQiLCJQbHVzTm9kZSIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiU0hPV19URVNURVJfT1JJR0lOIiwiU0hPV19QUk9CRV9PUklHSU4iLCJERUZBVUxUX1NIT1JUX0NJUkNVSVRfRk9OVCIsIkNvbmR1Y3Rpdml0eVRlc3Rlck5vZGUiLCJjb25zdHJ1Y3RvciIsImJyaWdodG5lc3NQcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eSIsIm5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZUlkZW50aXR5IiwiaW50ZXJhY3RpdmUiLCJidWxiSW1hZ2VTY2FsZSIsImJhdHRlcnlEQ2VsbF9wbmdTY2FsZSIsInByb2JlU2l6ZSIsInByb2JlTGluZVdpZHRoIiwicHJvYmVEcmFnWVJhbmdlIiwicHJvYmVDdXJzb3IiLCJwb3NpdGl2ZVByb2JlRmlsbCIsInBvc2l0aXZlUHJvYmVTdHJva2UiLCJwb3NpdGl2ZUxhYmVsRmlsbCIsIm5lZ2F0aXZlUHJvYmVGaWxsIiwibmVnYXRpdmVQcm9iZVN0cm9rZSIsIm5lZ2F0aXZlTGFiZWxGaWxsIiwid2lyZVN0cm9rZSIsIndpcmVMaW5lV2lkdGgiLCJidWxiVG9CYXR0ZXJ5V2lyZUxlbmd0aCIsInNob3J0Q2lyY3VpdEZvbnQiLCJzaG9ydENpcmN1aXRGaWxsIiwibGlnaHRCdWxiTm9kZSIsImFzc2VydCIsImdldCIsInNob3J0Q2lyY3VpdE5vZGUiLCJzaG9ydENpcmN1aXRTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJmaWxsIiwidmlzaWJsZSIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImJvdW5kcyIsImNlbnRlclgiLCJib3R0b20iLCJ0b3AiLCJiYXR0ZXJ5Iiwic2NhbGUiLCJsZWZ0IiwiY2VudGVyWSIsImJ1bGJCYXR0ZXJ5V2lyZSIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFwcGFyYXR1c05vZGUiLCJjaGlsZHJlbiIsImFkZENoaWxkIiwicG9zaXRpdmVXaXJlIiwiV2lyZU5vZGUiLCJnZXRHbG9iYWxCb3VuZHMiLCJyaWdodCIsIm1vZGVsVG9WaWV3WCIsIngiLCJtb2RlbFRvVmlld1kiLCJ5IiwiaGVpZ2h0IiwibmVnYXRpdmVXaXJlIiwiY2xpY2tZT2Zmc2V0IiwicHJvYmVEcmFnTGlzdGVuZXIiLCJzdGFydCIsImV2ZW50IiwiY3VycmVudFRhcmdldCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJkcmFnIiwibGlzdGVuZXIiLCJwb3NpdGlvblZpZXciLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwieVZpZXciLCJjbGFtcCIsIm1pbiIsIm1heCIsInlNb2RlbCIsInZpZXdUb01vZGVsWSIsInNldCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBvc2l0aXZlUHJvYmUiLCJQcm9iZU5vZGUiLCJzaXplIiwibmVnYXRpdmVQcm9iZSIsImN1cnNvciIsImFkZElucHV0TGlzdGVuZXIiLCJwb3NpdGlvbk9ic2VydmVyIiwicG9zaXRpb24iLCJvbGRQb3NpdGlvbiIsInRyYW5zbGF0aW9uIiwiZHgiLCJkeSIsInBvc2l0aXZlUHJvYmVPYnNlcnZlciIsInBvc2l0aXZlUHJvYmVQb3NpdGlvbiIsInNldEVuZFBvaW50IiwibmVnYXRpdmVQcm9iZU9ic2VydmVyIiwibmVnYXRpdmVQcm9iZVBvc2l0aW9uIiwidmlzaWJsZVByb3BlcnR5IiwiZGlzcG9zZUNvbmR1Y3Rpdml0eVRlc3Rlck5vZGUiLCJkaXNwb3NlIiwidW5saW5rIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJzaG9ydENpcmN1aXQiLCJ2YWx1ZSIsImNyZWF0ZUljb24iLCJicmlnaHRuZXNzIiwicG9zaXRpdmVQcm9iZVhPZmZzZXQiLCJuZWdhdGl2ZVByb2JlWE9mZnNldCIsImJvdGhQcm9iZXNZT2Zmc2V0IiwicmVnaXN0ZXIiLCJsYWJlbE5vZGUiLCJwbGF0ZU5vZGUiLCJ3aWR0aCIsInNldFNjYWxlTWFnbml0dWRlIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWFkiLCJtdXRhdGUiLCJzdGFydFgiLCJzdGFydFkiLCJlbmRYIiwiZW5kWSIsInN0YXJ0UG9pbnQiLCJjb250cm9sUG9pbnRPZmZzZXQiLCJjb250cm9sUG9pbnRYT2Zmc2V0IiwiY29udHJvbFBvaW50WU9mZnNldCIsInNldFNoYXBlIiwiY3ViaWNDdXJ2ZVRvIl0sInNvdXJjZXMiOlsiQ29uZHVjdGl2aXR5VGVzdGVyTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb25kdWN0aXZpdHkgdGVzdGVyLiBMaWdodCBidWxiIGNvbm5lY3RlZCB0byBhIGJhdHRlcnksIHdpdGggZHJhZ2dhYmxlIHByb2Jlcy5cclxuICogV2hlbiB0aGUgcHJvYmVzIGFyZSBib3RoIGltbWVyc2VkIGluIHNvbHV0aW9uLCB0aGUgY2lyY3VpdCBpcyBjb21wbGV0ZWQsIGFuZCB0aGUgYnVsYiBnbG93cy5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgRHJhZ0xpc3RlbmVyLCBGb250LCBJbWFnZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFBhdGhPcHRpb25zLCBSZWN0YW5nbGUsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBiYXR0ZXJ5RENlbGxfcG5nIGZyb20gJy4uL2ltYWdlcy9iYXR0ZXJ5RENlbGxfcG5nLmpzJztcclxuaW1wb3J0IExpZ2h0QnVsYk5vZGUgZnJvbSAnLi9MaWdodEJ1bGJOb2RlLmpzJztcclxuaW1wb3J0IE1pbnVzTm9kZSBmcm9tICcuL01pbnVzTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFBsdXNOb2RlIGZyb20gJy4vUGx1c05vZGUuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU0hPV19URVNURVJfT1JJR0lOID0gZmFsc2U7IC8vIGRyYXdzIGEgcmVkIGNpcmNsZSBhdCB0aGUgdGVzdGVyJ3Mgb3JpZ2luLCBmb3IgZGVidWdnaW5nXHJcbmNvbnN0IFNIT1dfUFJPQkVfT1JJR0lOID0gZmFsc2U7IC8vIGRyYXdzIGEgcmVkIGNpcmNsZSBhdCB0aGUgb3JpZ2luIG9mIHByb2JlcywgZm9yIGRlYnVnZ2luZ1xyXG5jb25zdCBERUZBVUxUX1NIT1JUX0NJUkNVSVRfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTQgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIG1vZGVsVmlld1RyYW5zZm9ybT86IE1vZGVsVmlld1RyYW5zZm9ybTI7XHJcbiAgaW50ZXJhY3RpdmU/OiBib29sZWFuOyAvLyBzZXQgdG8gZmFsc2UgaWYgeW91J3JlIGNyZWF0aW5nIGFuIGljb25cclxuICBidWxiSW1hZ2VTY2FsZT86IG51bWJlcjtcclxuICBiYXR0ZXJ5RENlbGxfcG5nU2NhbGU/OiBudW1iZXI7XHJcblxyXG4gIC8vIGNvbW1vbiB0byBib3RoIHByb2Jlc1xyXG4gIHByb2JlU2l6ZT86IERpbWVuc2lvbjI7IC8vIHByb2JlIGRpbWVuc2lvbnMsIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICBwcm9iZUxpbmVXaWR0aD86IG51bWJlcjtcclxuICBwcm9iZURyYWdZUmFuZ2U/OiBSYW5nZSB8IG51bGw7IC8vIHktYXhpcyBkcmFnIHJhbmdlLCByZWxhdGl2ZSB0byBwb3NpdGlvblByb3BlcnR5LCBpbiB2aWV3IGNvb3JkaW5hdGVzLiBudWxsIG1lYW5zIG5vIGNvbnN0cmFpbnQuXHJcbiAgcHJvYmVDdXJzb3I/OiBzdHJpbmc7XHJcblxyXG4gIC8vIHBvc2l0aXZlIHByb2JlXHJcbiAgcG9zaXRpdmVQcm9iZUZpbGw/OiBUQ29sb3I7XHJcbiAgcG9zaXRpdmVQcm9iZVN0cm9rZT86IFRDb2xvcjtcclxuICBwb3NpdGl2ZUxhYmVsRmlsbD86IFRDb2xvcjtcclxuXHJcbiAgLy8gbmVnYXRpdmUgcHJvYmVcclxuICBuZWdhdGl2ZVByb2JlRmlsbD86IFRDb2xvcjtcclxuICBuZWdhdGl2ZVByb2JlU3Ryb2tlPzogVENvbG9yO1xyXG4gIG5lZ2F0aXZlTGFiZWxGaWxsPzogVENvbG9yO1xyXG5cclxuICAvLyB3aXJlc1xyXG4gIHdpcmVTdHJva2U/OiBUQ29sb3I7XHJcbiAgd2lyZUxpbmVXaWR0aD86IG51bWJlcjtcclxuICBidWxiVG9CYXR0ZXJ5V2lyZUxlbmd0aD86IG51bWJlcjsgLy8gbGVuZ3RoIG9mIHRoZSB3aXJlIGJldHdlZW4gYnVsYiBhbmQgYmF0dGVyeSwgaW4gdmlldyBjb29yZGluYXRlc1xyXG5cclxuICAvLyBzaG9ydC1jaXJjdWl0IGluZGljYXRvclxyXG4gIHNob3J0Q2lyY3VpdEZvbnQ/OiBGb250O1xyXG4gIHNob3J0Q2lyY3VpdEZpbGw/OiBUQ29sb3I7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBDb25kdWN0aXZpdHlUZXN0ZXJOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcclxuICBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPiAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuY2xhc3MgQ29uZHVjdGl2aXR5VGVzdGVyTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHNob3J0Q2lyY3VpdE5vZGU6IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQ29uZHVjdGl2aXR5VGVzdGVyTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGJyaWdodG5lc3NQcm9wZXJ0eSBicmlnaHRuZXNzIG9mIGJ1bGIgdmFyaWVzIGZyb20gMCAob2ZmKSB0byAxIChmdWxsIG9uKVxyXG4gICAqIEBwYXJhbSBwb3NpdGlvblByb3BlcnR5IHBvc2l0aW9uIG9mIHRoZSB0ZXN0ZXIsIGF0IGJvdHRvbS1jZW50ZXIgb2YgdGhlIGJ1bGIgKG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUpXHJcbiAgICogQHBhcmFtIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5IHBvc2l0aW9uIG9mIGJvdHRvbS1jZW50ZXIgb2YgdGhlIHBvc2l0aXZlIHByb2JlIChtb2RlbCBjb29yZGluYXRlIGZyYW1lKVxyXG4gICAqIEBwYXJhbSBuZWdhdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eSBwb3NpdGlvbiBvZiBib3R0b20tY2VudGVyIG9mIHRoZSBuZWdhdGl2ZSBwcm9iZSAobW9kZWwgY29vcmRpbmF0ZSBmcmFtZSlcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBicmlnaHRuZXNzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblByb3BlcnR5OiBUUHJvcGVydHk8VmVjdG9yMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eTogVFByb3BlcnR5PFZlY3RvcjI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgbmVnYXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHk6IFRQcm9wZXJ0eTxWZWN0b3IyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IENvbmR1Y3Rpdml0eVRlc3Rlck5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIC8vIE5PVEUhIFNpbmNlIHBvc2l0aW9uUHJvcGVydHkgZGV0ZXJtaW5lcyB0cmFuc2xhdGlvbiwgYXZvaWQgb3B0aW9ucyByZWxhdGVkIHRvIHRyYW5zbGF0aW9uIVxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb25kdWN0aXZpdHlUZXN0ZXJOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlSWRlbnRpdHkoKSxcclxuICAgICAgaW50ZXJhY3RpdmU6IHRydWUsIC8vIHNldCB0byBmYWxzZSBpZiB5b3UncmUgY3JlYXRpbmcgYW4gaWNvblxyXG4gICAgICBidWxiSW1hZ2VTY2FsZTogMC4zMyxcclxuICAgICAgYmF0dGVyeURDZWxsX3BuZ1NjYWxlOiAwLjYsXHJcblxyXG4gICAgICAvLyBjb21tb24gdG8gYm90aCBwcm9iZXNcclxuICAgICAgcHJvYmVTaXplOiBuZXcgRGltZW5zaW9uMiggMjAsIDY4ICksXHJcbiAgICAgIHByb2JlTGluZVdpZHRoOiAwLjUsXHJcbiAgICAgIHByb2JlRHJhZ1lSYW5nZTogbnVsbCxcclxuICAgICAgcHJvYmVDdXJzb3I6ICdwb2ludGVyJyxcclxuXHJcbiAgICAgIC8vIHBvc2l0aXZlIHByb2JlXHJcbiAgICAgIHBvc2l0aXZlUHJvYmVGaWxsOiAncmVkJyxcclxuICAgICAgcG9zaXRpdmVQcm9iZVN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgcG9zaXRpdmVMYWJlbEZpbGw6ICd3aGl0ZScsXHJcblxyXG4gICAgICAvLyBuZWdhdGl2ZSBwcm9iZVxyXG4gICAgICBuZWdhdGl2ZVByb2JlRmlsbDogJ2JsYWNrJyxcclxuICAgICAgbmVnYXRpdmVQcm9iZVN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbmVnYXRpdmVMYWJlbEZpbGw6ICd3aGl0ZScsXHJcblxyXG4gICAgICAvLyB3aXJlc1xyXG4gICAgICB3aXJlU3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICB3aXJlTGluZVdpZHRoOiAxLjUsXHJcbiAgICAgIGJ1bGJUb0JhdHRlcnlXaXJlTGVuZ3RoOiA0MCxcclxuXHJcbiAgICAgIC8vIHNob3J0LWNpcmN1aXQgaW5kaWNhdG9yXHJcbiAgICAgIHNob3J0Q2lyY3VpdEZvbnQ6IERFRkFVTFRfU0hPUlRfQ0lSQ1VJVF9GT05ULFxyXG4gICAgICBzaG9ydENpcmN1aXRGaWxsOiAnYmxhY2snXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBidWxiLCBvcmlnaW4gYXQgYm90dG9tIGNlbnRlciBvZiBiYXNlXHJcbiAgICBjb25zdCBsaWdodEJ1bGJOb2RlID0gbmV3IExpZ2h0QnVsYk5vZGUoIGJyaWdodG5lc3NQcm9wZXJ0eSwge1xyXG4gICAgICBidWxiSW1hZ2VTY2FsZTogb3B0aW9ucy5idWxiSW1hZ2VTY2FsZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNob3J0LWNpcmN1aXQgaW5kaWNhdG9yLCBjZW50ZXJlZCBhYm92ZSB0aGUgbGlnaHQgYnVsYlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYnJpZ2h0bmVzc1Byb3BlcnR5LmdldCgpID09PSAwLCAnbGF5b3V0IHdpbGwgYmUgaW5jb3JyZWN0IGlmIGxpZ2h0QnVsYk5vZGUgaGFzIHJheXMnICk7XHJcbiAgICBjb25zdCBzaG9ydENpcmN1aXROb2RlID0gbmV3IFRleHQoIFNjZW5lcnlQaGV0U3RyaW5ncy5zaG9ydENpcmN1aXRTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBvcHRpb25zLnNob3J0Q2lyY3VpdEZvbnQsXHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuc2hvcnRDaXJjdWl0RmlsbCxcclxuICAgICAgdmlzaWJsZTogZmFsc2UgLy8gaW5pdGlhbCBzdGF0ZSBpcyBubyBzaG9ydCBjaXJjdWl0XHJcbiAgICB9ICk7XHJcbiAgICBzaG9ydENpcmN1aXROb2RlLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIHNob3J0Q2lyY3VpdE5vZGUuY2VudGVyWCA9IGxpZ2h0QnVsYk5vZGUuY2VudGVyWDtcclxuICAgICAgc2hvcnRDaXJjdWl0Tm9kZS5ib3R0b20gPSBsaWdodEJ1bGJOb2RlLnRvcDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBiYXR0ZXJ5XHJcbiAgICBjb25zdCBiYXR0ZXJ5ID0gbmV3IEltYWdlKCBiYXR0ZXJ5RENlbGxfcG5nLCB7XHJcbiAgICAgIHNjYWxlOiBvcHRpb25zLmJhdHRlcnlEQ2VsbF9wbmdTY2FsZSxcclxuICAgICAgbGVmdDogb3B0aW9ucy5idWxiVG9CYXR0ZXJ5V2lyZUxlbmd0aCxcclxuICAgICAgY2VudGVyWTogMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHdpcmUgZnJvbSBidWxiIGJhc2UgdG8gYmF0dGVyeVxyXG4gICAgY29uc3QgYnVsYkJhdHRlcnlXaXJlID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApLmxpbmVUbyggb3B0aW9ucy5idWxiVG9CYXR0ZXJ5V2lyZUxlbmd0aCwgMCApLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy53aXJlU3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMud2lyZUxpbmVXaWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFwcGFyYXR1cyAoYnVsYiArIGJhdHRlcnkpLCBvcmlnaW4gYXQgYm90dG9tIGNlbnRlciBvZiBidWxiJ3MgYmFzZVxyXG4gICAgY29uc3QgYXBwYXJhdHVzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgYnVsYkJhdHRlcnlXaXJlLFxyXG4gICAgICAgIGJhdHRlcnksXHJcbiAgICAgICAgbGlnaHRCdWxiTm9kZSxcclxuICAgICAgICBzaG9ydENpcmN1aXROb2RlXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIGlmICggU0hPV19URVNURVJfT1JJR0lOICkge1xyXG4gICAgICBhcHBhcmF0dXNOb2RlLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCAyLCB7IGZpbGw6ICdyZWQnIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHdpcmUgZnJvbSBiYXR0ZXJ5IHRlcm1pbmFsIHRvIHBvc2l0aXZlIHByb2JlXHJcbiAgICBjb25zdCBwb3NpdGl2ZVdpcmUgPSBuZXcgV2lyZU5vZGUoXHJcbiAgICAgIGJhdHRlcnkuZ2V0R2xvYmFsQm91bmRzKCkucmlnaHQsXHJcbiAgICAgIGJhdHRlcnkuZ2V0R2xvYmFsQm91bmRzKCkuY2VudGVyWSxcclxuICAgICAgb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICkgLSBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCApLFxyXG4gICAgICBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LmdldCgpLnkgKSAtIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICkgLSBvcHRpb25zLnByb2JlU2l6ZS5oZWlnaHQsXHJcbiAgICAgIHsgc3Ryb2tlOiBvcHRpb25zLndpcmVTdHJva2UsIGxpbmVXaWR0aDogb3B0aW9ucy53aXJlTGluZVdpZHRoIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gd2lyZSBmcm9tIGJhc2Ugb2YgYnVsYiAob3JpZ2luKSB0byBuZWdhdGl2ZSBwcm9iZVxyXG4gICAgY29uc3QgbmVnYXRpdmVXaXJlID0gbmV3IFdpcmVOb2RlKFxyXG4gICAgICAtNSwgLTUsIC8vIHNwZWNpZmljIHRvIGJ1bGIgaW1hZ2UgZmlsZVxyXG4gICAgICBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LmdldCgpLnggKSAtIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICksXHJcbiAgICAgIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggbmVnYXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSApIC0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBwb3NpdGlvblByb3BlcnR5LmdldCgpLnkgKSAtIG9wdGlvbnMucHJvYmVTaXplLmhlaWdodCxcclxuICAgICAgeyBzdHJva2U6IG9wdGlvbnMud2lyZVN0cm9rZSwgbGluZVdpZHRoOiBvcHRpb25zLndpcmVMaW5lV2lkdGggfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBkcmFnIGxpc3RlbmVyIGZvciBwcm9iZXNcclxuICAgIGxldCBjbGlja1lPZmZzZXQgPSAwO1xyXG4gICAgY29uc3QgcHJvYmVEcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcblxyXG4gICAgICBzdGFydDogZXZlbnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRUYXJnZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0ITtcclxuICAgICAgICBjbGlja1lPZmZzZXQgPSBjdXJyZW50VGFyZ2V0Lmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS55IC0gY3VycmVudFRhcmdldC55O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gcHJvYmVzIG1vdmUgdG9nZXRoZXJcclxuICAgICAgZHJhZzogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGRvIGRyYWdnaW5nIGluIHZpZXcgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uVmlldyA9IG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgICBsZXQgeVZpZXcgPSBsaXN0ZW5lci5jdXJyZW50VGFyZ2V0Lmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS55ICsgcG9zaXRpb25WaWV3LnkgLSBjbGlja1lPZmZzZXQ7XHJcbiAgICAgICAgaWYgKCBvcHRpb25zLnByb2JlRHJhZ1lSYW5nZSApIHtcclxuICAgICAgICAgIHlWaWV3ID0gVXRpbHMuY2xhbXAoIHlWaWV3LCBwb3NpdGlvblZpZXcueSArIG9wdGlvbnMucHJvYmVEcmFnWVJhbmdlLm1pbiwgcG9zaXRpb25WaWV3LnkgKyBvcHRpb25zLnByb2JlRHJhZ1lSYW5nZS5tYXggKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNvbnZlcnQgdG8gbW9kZWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAgICAgIGNvbnN0IHlNb2RlbCA9IG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWSggeVZpZXcgKTtcclxuICAgICAgICBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54LCB5TW9kZWwgKSApO1xyXG4gICAgICAgIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LmdldCgpLngsIHlNb2RlbCApICk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Byb2JlRHJhZ0xpc3RlbmVyJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcHJvYmVzXHJcbiAgICBjb25zdCBwb3NpdGl2ZVByb2JlID0gbmV3IFByb2JlTm9kZSggbmV3IFBsdXNOb2RlKCB7IGZpbGw6IG9wdGlvbnMucG9zaXRpdmVMYWJlbEZpbGwgfSApLCB7XHJcbiAgICAgIHNpemU6IG9wdGlvbnMucHJvYmVTaXplLFxyXG4gICAgICBmaWxsOiBvcHRpb25zLnBvc2l0aXZlUHJvYmVGaWxsLFxyXG4gICAgICBzdHJva2U6IG9wdGlvbnMucG9zaXRpdmVQcm9iZVN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnByb2JlTGluZVdpZHRoXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBuZWdhdGl2ZVByb2JlID0gbmV3IFByb2JlTm9kZSggbmV3IE1pbnVzTm9kZSggeyBmaWxsOiBvcHRpb25zLm5lZ2F0aXZlTGFiZWxGaWxsIH0gKSwge1xyXG4gICAgICBzaXplOiBvcHRpb25zLnByb2JlU2l6ZSxcclxuICAgICAgZmlsbDogb3B0aW9ucy5uZWdhdGl2ZVByb2JlRmlsbCxcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLm5lZ2F0aXZlUHJvYmVTdHJva2UsXHJcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5wcm9iZUxpbmVXaWR0aFxyXG4gICAgfSApO1xyXG4gICAgaWYgKCBvcHRpb25zLmludGVyYWN0aXZlICkge1xyXG4gICAgICBwb3NpdGl2ZVByb2JlLmN1cnNvciA9IG9wdGlvbnMucHJvYmVDdXJzb3I7XHJcbiAgICAgIHBvc2l0aXZlUHJvYmUuYWRkSW5wdXRMaXN0ZW5lciggcHJvYmVEcmFnTGlzdGVuZXIgKTtcclxuICAgICAgbmVnYXRpdmVQcm9iZS5jdXJzb3IgPSBvcHRpb25zLnByb2JlQ3Vyc29yO1xyXG4gICAgICBuZWdhdGl2ZVByb2JlLmFkZElucHV0TGlzdGVuZXIoIHByb2JlRHJhZ0xpc3RlbmVyICk7XHJcbiAgICB9XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgcG9zaXRpdmVXaXJlLCBuZWdhdGl2ZVdpcmUsIHBvc2l0aXZlUHJvYmUsIG5lZ2F0aXZlUHJvYmUsIGFwcGFyYXR1c05vZGUgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHdoZW4gdGhlIHBvc2l0aW9uIGNoYW5nZXMgLi4uXHJcbiAgICBjb25zdCBwb3NpdGlvbk9ic2VydmVyID0gKCBwb3NpdGlvbjogVmVjdG9yMiwgb2xkUG9zaXRpb246IFZlY3RvcjIgfCBudWxsICkgPT4ge1xyXG5cclxuICAgICAgLy8gbW92ZSB0aGUgZW50aXJlIHRlc3RlclxyXG4gICAgICB0aGlzLnRyYW5zbGF0aW9uID0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggcG9zaXRpb24gKTtcclxuXHJcbiAgICAgIC8vIHByb2JlcyBtb3ZlIHdpdGggdGhlIHRlc3RlclxyXG4gICAgICBpZiAoIG9sZFBvc2l0aW9uICkge1xyXG4gICAgICAgIGNvbnN0IGR4ID0gcG9zaXRpb24ueCAtIG9sZFBvc2l0aW9uLng7XHJcbiAgICAgICAgY29uc3QgZHkgPSBwb3NpdGlvbi55IC0gb2xkUG9zaXRpb24ueTtcclxuICAgICAgICBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICsgZHgsXHJcbiAgICAgICAgICBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICsgZHkgKSApO1xyXG4gICAgICAgIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LmdldCgpLnggKyBkeCxcclxuICAgICAgICAgIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LmdldCgpLnkgKyBkeSApICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBwb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uT2JzZXJ2ZXIgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgcG9zaXRpdmUgd2lyZSBpZiBlbmQgcG9pbnQgd2FzIGNoYW5nZWRcclxuICAgIGNvbnN0IHBvc2l0aXZlUHJvYmVPYnNlcnZlciA9ICggcG9zaXRpdmVQcm9iZVBvc2l0aW9uOiBWZWN0b3IyICkgPT4ge1xyXG4gICAgICBwb3NpdGl2ZVByb2JlLmNlbnRlclggPSBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBvc2l0aXZlUHJvYmVQb3NpdGlvbi54ICkgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCApO1xyXG4gICAgICBwb3NpdGl2ZVByb2JlLmJvdHRvbSA9IG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcG9zaXRpdmVQcm9iZVBvc2l0aW9uLnkgKSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBwb3NpdGlvblByb3BlcnR5LmdldCgpLnkgKTtcclxuICAgICAgcG9zaXRpdmVXaXJlLnNldEVuZFBvaW50KCBwb3NpdGl2ZVByb2JlLngsIHBvc2l0aXZlUHJvYmUueSAtIG9wdGlvbnMucHJvYmVTaXplLmhlaWdodCApO1xyXG4gICAgfTtcclxuICAgIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aXZlUHJvYmVPYnNlcnZlciApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBuZWdhdGl2ZSB3aXJlIGlmIGVuZCBwb2ludCB3YXMgY2hhbmdlZFxyXG4gICAgY29uc3QgbmVnYXRpdmVQcm9iZU9ic2VydmVyID0gKCBuZWdhdGl2ZVByb2JlUG9zaXRpb246IFZlY3RvcjIgKSA9PiB7XHJcbiAgICAgIG5lZ2F0aXZlUHJvYmUuY2VudGVyWCA9IG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggbmVnYXRpdmVQcm9iZVBvc2l0aW9uLnggKSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICk7XHJcbiAgICAgIG5lZ2F0aXZlUHJvYmUuYm90dG9tID0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBuZWdhdGl2ZVByb2JlUG9zaXRpb24ueSApIC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIHBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSApO1xyXG4gICAgICBuZWdhdGl2ZVdpcmUuc2V0RW5kUG9pbnQoIG5lZ2F0aXZlUHJvYmUueCwgbmVnYXRpdmVQcm9iZS55IC0gb3B0aW9ucy5wcm9iZVNpemUuaGVpZ2h0ICk7XHJcbiAgICB9O1xyXG4gICAgbmVnYXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkubGluayggbmVnYXRpdmVQcm9iZU9ic2VydmVyICk7XHJcblxyXG4gICAgdGhpcy5zaG9ydENpcmN1aXROb2RlID0gc2hvcnRDaXJjdWl0Tm9kZTtcclxuXHJcbiAgICAvLyBUbyBwcmV2ZW50IGxpZ2h0IGZyb20gdXBkYXRpbmcgd2hlbiBpbnZpc2libGVcclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICBsaWdodEJ1bGJOb2RlLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUNvbmR1Y3Rpdml0eVRlc3Rlck5vZGUgPSAoKSA9PiB7XHJcblxyXG4gICAgICBzaG9ydENpcmN1aXROb2RlLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIC8vIHVubGluayBmcm9tIGF4b24gcHJvcGVydGllc1xyXG4gICAgICBwb3NpdGlvblByb3BlcnR5LnVubGluayggcG9zaXRpb25PYnNlcnZlciApO1xyXG4gICAgICBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHBvc2l0aXZlUHJvYmVPYnNlcnZlciApO1xyXG4gICAgICBuZWdhdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIG5lZ2F0aXZlUHJvYmVPYnNlcnZlciApO1xyXG5cclxuICAgICAgLy8gZGlzcG9zZSBvZiBzdWItY29tcG9uZW50c1xyXG4gICAgICBsaWdodEJ1bGJOb2RlLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXHJcbiAgICBhc3NlcnQgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnQ29uZHVjdGl2aXR5VGVzdGVyTm9kZScsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzICdTaG9ydCBjaXJjdWl0JyBzaG93biBhYm92ZSB0aGUgbGlnaHQgYnVsYj9cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IHNob3J0Q2lyY3VpdCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuc2hvcnRDaXJjdWl0Tm9kZS52aXNpYmxlOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciAnU2hvcnQgY2lyY3VpdCcgaXMgc2hvd24gYWJvdmUgdGhlIGxpZ2h0IGJ1bGIuIE5vdGUgdGhhdCBpdCBpcyB0aGUgY2xpZW50J3MgcmVzcG9uc2liaWxpdHlcclxuICAgKiB0byBlbnN1cmUgdGhhdCB0aGUgYnVsYidzIGJyaWdodG5lc3MgKGFzIHNldCBieSBicmlnaHRuZXNzUHJvcGVydHkpIGlzIGFwcHJvcHJpYXRlIGZvciBhIHNob3J0IGNpcmN1aXQuXHJcbiAgICovXHJcbiAgcHVibGljIHNldCBzaG9ydENpcmN1aXQoIHZhbHVlOiBib29sZWFuICkgeyB0aGlzLnNob3J0Q2lyY3VpdE5vZGUudmlzaWJsZSA9IHZhbHVlOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhbiBpY29uLlxyXG4gICAqIEBwYXJhbSBicmlnaHRuZXNzIDAtMSAob2ZmIHRvIGZ1bGwgb24pXHJcbiAgICogQHBhcmFtIHBvc2l0aXZlUHJvYmVYT2Zmc2V0IHgtb2Zmc2V0IG9mIHRoZSBwb3NpdGl2ZSBwcm9iZSwgcmVsYXRpdmUgdG8gdGhlIGJ1bGIncyB0aXBcclxuICAgKiBAcGFyYW0gbmVnYXRpdmVQcm9iZVhPZmZzZXQgeC1vZmZzZXQgb2YgdGhlIG5lZ2F0aXZlIHByb2JlLCByZWxhdGl2ZSB0byB0aGUgYnVsYidzIHRpcFxyXG4gICAqIEBwYXJhbSBib3RoUHJvYmVzWU9mZnNldCB5LW9mZnNldCBvZiBib3RoIHByb2JlcywgcmVsYXRpdmUgdG8gdGhlIGJ1bGIncyB0aXBcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVJY29uKCBicmlnaHRuZXNzOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGl2ZVByb2JlWE9mZnNldDogbnVtYmVyLCBuZWdhdGl2ZVByb2JlWE9mZnNldDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm90aFByb2Jlc1lPZmZzZXQ6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogU3RyaWN0T21pdDxDb25kdWN0aXZpdHlUZXN0ZXJOb2RlT3B0aW9ucywgJ2ludGVyYWN0aXZlJz4gKTogTm9kZSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPENvbmR1Y3Rpdml0eVRlc3Rlck5vZGVPcHRpb25zPigge1xyXG4gICAgICBpbnRlcmFjdGl2ZTogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBuZXcgQ29uZHVjdGl2aXR5VGVzdGVyTm9kZShcclxuICAgICAgbmV3IFByb3BlcnR5KCBicmlnaHRuZXNzICksXHJcbiAgICAgIG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAwLCAwICkgKSxcclxuICAgICAgbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIHBvc2l0aXZlUHJvYmVYT2Zmc2V0LCBib3RoUHJvYmVzWU9mZnNldCApICksXHJcbiAgICAgIG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCBuZWdhdGl2ZVByb2JlWE9mZnNldCwgYm90aFByb2Jlc1lPZmZzZXQgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VDb25kdWN0aXZpdHlUZXN0ZXJOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0NvbmR1Y3Rpdml0eVRlc3Rlck5vZGUnLCBDb25kdWN0aXZpdHlUZXN0ZXJOb2RlICk7XHJcblxyXG50eXBlIFByb2JlTm9kZVNlbGZPcHRpb25zID0ge1xyXG4gIHNpemU/OiBEaW1lbnNpb24yO1xyXG4gIGZpbGw/OiBUQ29sb3I7XHJcbiAgc3Ryb2tlPzogVENvbG9yO1xyXG4gIGxpbmVXaWR0aD86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgUHJvYmVOb2RlT3B0aW9ucyA9IFByb2JlTm9kZVNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG4vKipcclxuICogQ29uZHVjdGl2aXR5IHByb2JlLCBvcmlnaW4gYXQgYm90dG9tIGNlbnRlci5cclxuICovXHJcbmNsYXNzIFByb2JlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxhYmVsTm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogUHJvYmVOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFByb2JlTm9kZU9wdGlvbnMsIFByb2JlTm9kZVNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggMjAsIDYwICksXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAxLjVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gcGxhdGVcclxuICAgIGNvbnN0IHBsYXRlTm9kZSA9IG5ldyBSZWN0YW5nbGUoIC1vcHRpb25zLnNpemUud2lkdGggLyAyLCAtb3B0aW9ucy5zaXplLmhlaWdodCwgb3B0aW9ucy5zaXplLndpZHRoLCBvcHRpb25zLnNpemUuaGVpZ2h0LCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuZmlsbCxcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLnN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNjYWxlIHRoZSBsYWJlbCB0byBmaXgsIHBsYWNlIGl0IHRvd2FyZHMgYm90dG9tIGNlbnRlclxyXG4gICAgbGFiZWxOb2RlLnNldFNjYWxlTWFnbml0dWRlKCAwLjUgKiBvcHRpb25zLnNpemUud2lkdGggLyBsYWJlbE5vZGUud2lkdGggKTtcclxuICAgIGxhYmVsTm9kZS5jZW50ZXJYID0gcGxhdGVOb2RlLmNlbnRlclg7XHJcbiAgICBsYWJlbE5vZGUuYm90dG9tID0gcGxhdGVOb2RlLmJvdHRvbSAtIDEwO1xyXG5cclxuICAgIC8vIHJlbmRlcmluZyBvcmRlclxyXG4gICAgdGhpcy5hZGRDaGlsZCggcGxhdGVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsYWJlbE5vZGUgKTtcclxuICAgIGlmICggU0hPV19QUk9CRV9PUklHSU4gKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBDaXJjbGUoIDIsIHsgZmlsbDogJ3JlZCcgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZXhwYW5kIHRvdWNoIGFyZWFcclxuICAgIHRoaXMudG91Y2hBcmVhID0gdGhpcy5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDEwLCAxMCApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG50eXBlIFdpcmVQb2ludCA9IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfTtcclxuXHJcbi8qKlxyXG4gKiBXaXJlcyB0aGF0IGNvbm5lY3QgdG8gdGhlIHByb2Jlcy5cclxuICovXHJcbmNsYXNzIFdpcmVOb2RlIGV4dGVuZHMgUGF0aCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3RhcnRQb2ludDogV2lyZVBvaW50O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY29udHJvbFBvaW50T2Zmc2V0OiBXaXJlUG9pbnQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RhcnRYOiBudW1iZXIsIHN0YXJ0WTogbnVtYmVyLCBlbmRYOiBudW1iZXIsIGVuZFk6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogUGF0aE9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG51bGwgKTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0UG9pbnQgPSB7IHg6IHN0YXJ0WCwgeTogc3RhcnRZIH07XHJcblxyXG4gICAgLy8gY29udHJvbCBwb2ludCBvZmZzZXRzIGZvciB3aGVuIHByb2JlIGlzIHRvIGxlZnQgb2YgbGlnaHQgYnVsYlxyXG4gICAgdGhpcy5jb250cm9sUG9pbnRPZmZzZXQgPSB7IHg6IDMwLCB5OiAtNTAgfTtcclxuICAgIGlmICggZW5kWCA8IHN0YXJ0WCApIHtcclxuICAgICAgLy8gcHJvYmUgaXMgdG8gcmlnaHQgb2YgbGlnaHQgYnVsYiwgZmxpcCBzaWduIG9uIGNvbnRyb2wgcG9pbnQgeC1vZmZzZXRcclxuICAgICAgdGhpcy5jb250cm9sUG9pbnRPZmZzZXQueCA9IC10aGlzLmNvbnRyb2xQb2ludE9mZnNldC54O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2V0RW5kUG9pbnQoIGVuZFgsIGVuZFkgKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvLyBTZXRzIHRoZSBlbmQgcG9pbnQgY29vcmRpbmF0ZXMsIHRoZSBwb2ludCBhdHRhY2hlZCB0byB0aGUgcHJvYmUuXHJcbiAgcHVibGljIHNldEVuZFBvaW50KCBlbmRYOiBudW1iZXIsIGVuZFk6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBzdGFydFggPSB0aGlzLnN0YXJ0UG9pbnQueDtcclxuICAgIGNvbnN0IHN0YXJ0WSA9IHRoaXMuc3RhcnRQb2ludC55O1xyXG4gICAgY29uc3QgY29udHJvbFBvaW50WE9mZnNldCA9IHRoaXMuY29udHJvbFBvaW50T2Zmc2V0Lng7XHJcbiAgICBjb25zdCBjb250cm9sUG9pbnRZT2Zmc2V0ID0gdGhpcy5jb250cm9sUG9pbnRPZmZzZXQueTtcclxuXHJcbiAgICB0aGlzLnNldFNoYXBlKCBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvKCBzdGFydFgsIHN0YXJ0WSApXHJcbiAgICAgIC5jdWJpY0N1cnZlVG8oIHN0YXJ0WCArIGNvbnRyb2xQb2ludFhPZmZzZXQsIHN0YXJ0WSwgZW5kWCwgZW5kWSArIGNvbnRyb2xQb2ludFlPZmZzZXQsIGVuZFgsIGVuZFkgKVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbmR1Y3Rpdml0eVRlc3Rlck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxPQUFPQSxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLHVCQUF1QjtBQUV6QyxPQUFPQyxPQUFPLE1BQU0seUJBQXlCO0FBQzdDLE9BQU9DLGVBQWUsTUFBTSxpQ0FBaUM7QUFDN0QsU0FBU0MsS0FBSyxRQUFRLDBCQUEwQjtBQUNoRCxPQUFPQyxnQkFBZ0IsTUFBTSxzREFBc0Q7QUFDbkYsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQVEsaUNBQWlDO0FBQzNFLE9BQU9DLG1CQUFtQixNQUFNLGlEQUFpRDtBQUNqRixTQUFTQyxNQUFNLEVBQUVDLFlBQVksRUFBUUMsS0FBSyxFQUFFQyxJQUFJLEVBQWVDLElBQUksRUFBZUMsU0FBUyxFQUFVQyxJQUFJLFFBQVEsNkJBQTZCO0FBQzlJLE9BQU9DLGdCQUFnQixNQUFNLCtCQUErQjtBQUM1RCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFJeEQ7QUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsQyxNQUFNQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNqQyxNQUFNQywwQkFBMEIsR0FBRyxJQUFJTixRQUFRLENBQUUsRUFBRyxDQUFDO0FBc0NyRCxNQUFNTyxzQkFBc0IsU0FBU2QsSUFBSSxDQUFDO0VBS3hDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NlLFdBQVdBLENBQUVDLGtCQUE2QyxFQUM3Q0MsZ0JBQW9DLEVBQ3BDQyw2QkFBaUQsRUFDakRDLDZCQUFpRCxFQUNqREMsZUFBK0MsRUFBRztJQUVwRTtJQUNBLE1BQU1DLE9BQU8sR0FBRzNCLFNBQVMsQ0FBMEQsQ0FBQyxDQUFFO01BRXBGNEIsa0JBQWtCLEVBQUUxQixtQkFBbUIsQ0FBQzJCLGNBQWMsQ0FBQyxDQUFDO01BQ3hEQyxXQUFXLEVBQUUsSUFBSTtNQUFFO01BQ25CQyxjQUFjLEVBQUUsSUFBSTtNQUNwQkMscUJBQXFCLEVBQUUsR0FBRztNQUUxQjtNQUNBQyxTQUFTLEVBQUUsSUFBSXZDLFVBQVUsQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDO01BQ25Dd0MsY0FBYyxFQUFFLEdBQUc7TUFDbkJDLGVBQWUsRUFBRSxJQUFJO01BQ3JCQyxXQUFXLEVBQUUsU0FBUztNQUV0QjtNQUNBQyxpQkFBaUIsRUFBRSxLQUFLO01BQ3hCQyxtQkFBbUIsRUFBRSxPQUFPO01BQzVCQyxpQkFBaUIsRUFBRSxPQUFPO01BRTFCO01BQ0FDLGlCQUFpQixFQUFFLE9BQU87TUFDMUJDLG1CQUFtQixFQUFFLE9BQU87TUFDNUJDLGlCQUFpQixFQUFFLE9BQU87TUFFMUI7TUFDQUMsVUFBVSxFQUFFLE9BQU87TUFDbkJDLGFBQWEsRUFBRSxHQUFHO01BQ2xCQyx1QkFBdUIsRUFBRSxFQUFFO01BRTNCO01BQ0FDLGdCQUFnQixFQUFFM0IsMEJBQTBCO01BQzVDNEIsZ0JBQWdCLEVBQUU7SUFDcEIsQ0FBQyxFQUFFckIsZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQSxNQUFNc0IsYUFBYSxHQUFHLElBQUlyQyxhQUFhLENBQUVXLGtCQUFrQixFQUFFO01BQzNEUyxjQUFjLEVBQUVKLE9BQU8sQ0FBQ0k7SUFDMUIsQ0FBRSxDQUFDOztJQUVIO0lBQ0FrQixNQUFNLElBQUlBLE1BQU0sQ0FBRTNCLGtCQUFrQixDQUFDNEIsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsb0RBQXFELENBQUM7SUFDeEcsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSTFDLElBQUksQ0FBRU8sa0JBQWtCLENBQUNvQywwQkFBMEIsRUFBRTtNQUNoRkMsSUFBSSxFQUFFMUIsT0FBTyxDQUFDbUIsZ0JBQWdCO01BQzlCUSxJQUFJLEVBQUUzQixPQUFPLENBQUNvQixnQkFBZ0I7TUFDOUJRLE9BQU8sRUFBRSxLQUFLLENBQUM7SUFDakIsQ0FBRSxDQUFDOztJQUNISixnQkFBZ0IsQ0FBQ0ssY0FBYyxDQUFDQyxJQUFJLENBQUVDLE1BQU0sSUFBSTtNQUM5Q1AsZ0JBQWdCLENBQUNRLE9BQU8sR0FBR1gsYUFBYSxDQUFDVyxPQUFPO01BQ2hEUixnQkFBZ0IsQ0FBQ1MsTUFBTSxHQUFHWixhQUFhLENBQUNhLEdBQUc7SUFDN0MsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMsT0FBTyxHQUFHLElBQUl6RCxLQUFLLENBQUVLLGdCQUFnQixFQUFFO01BQzNDcUQsS0FBSyxFQUFFcEMsT0FBTyxDQUFDSyxxQkFBcUI7TUFDcENnQyxJQUFJLEVBQUVyQyxPQUFPLENBQUNrQix1QkFBdUI7TUFDckNvQixPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBSTNELElBQUksQ0FBRSxJQUFJVCxLQUFLLENBQUMsQ0FBQyxDQUFDcUUsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBQ0MsTUFBTSxDQUFFekMsT0FBTyxDQUFDa0IsdUJBQXVCLEVBQUUsQ0FBRSxDQUFDLEVBQUU7TUFDekd3QixNQUFNLEVBQUUxQyxPQUFPLENBQUNnQixVQUFVO01BQzFCMkIsU0FBUyxFQUFFM0MsT0FBTyxDQUFDaUI7SUFDckIsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTTJCLGFBQWEsR0FBRyxJQUFJakUsSUFBSSxDQUFFO01BQzlCa0UsUUFBUSxFQUFFLENBQ1JOLGVBQWUsRUFDZkosT0FBTyxFQUNQZCxhQUFhLEVBQ2JHLGdCQUFnQjtJQUVwQixDQUFFLENBQUM7SUFDSCxJQUFLbEMsa0JBQWtCLEVBQUc7TUFDeEJzRCxhQUFhLENBQUNFLFFBQVEsQ0FBRSxJQUFJdEUsTUFBTSxDQUFFLENBQUMsRUFBRTtRQUFFbUQsSUFBSSxFQUFFO01BQU0sQ0FBRSxDQUFFLENBQUM7SUFDNUQ7O0lBRUE7SUFDQSxNQUFNb0IsWUFBWSxHQUFHLElBQUlDLFFBQVEsQ0FDL0JiLE9BQU8sQ0FBQ2MsZUFBZSxDQUFDLENBQUMsQ0FBQ0MsS0FBSyxFQUMvQmYsT0FBTyxDQUFDYyxlQUFlLENBQUMsQ0FBQyxDQUFDWCxPQUFPLEVBQ2pDdEMsT0FBTyxDQUFDQyxrQkFBa0IsQ0FBQ2tELFlBQVksQ0FBRXRELDZCQUE2QixDQUFDMEIsR0FBRyxDQUFDLENBQUMsQ0FBQzZCLENBQUUsQ0FBQyxHQUFHcEQsT0FBTyxDQUFDQyxrQkFBa0IsQ0FBQ2tELFlBQVksQ0FBRXZELGdCQUFnQixDQUFDMkIsR0FBRyxDQUFDLENBQUMsQ0FBQzZCLENBQUUsQ0FBQyxFQUN0SnBELE9BQU8sQ0FBQ0Msa0JBQWtCLENBQUNvRCxZQUFZLENBQUV4RCw2QkFBNkIsQ0FBQzBCLEdBQUcsQ0FBQyxDQUFDLENBQUMrQixDQUFFLENBQUMsR0FBR3RELE9BQU8sQ0FBQ0Msa0JBQWtCLENBQUNvRCxZQUFZLENBQUV6RCxnQkFBZ0IsQ0FBQzJCLEdBQUcsQ0FBQyxDQUFDLENBQUMrQixDQUFFLENBQUMsR0FBR3RELE9BQU8sQ0FBQ00sU0FBUyxDQUFDaUQsTUFBTSxFQUNqTDtNQUFFYixNQUFNLEVBQUUxQyxPQUFPLENBQUNnQixVQUFVO01BQUUyQixTQUFTLEVBQUUzQyxPQUFPLENBQUNpQjtJQUFjLENBQ2pFLENBQUM7O0lBRUQ7SUFDQSxNQUFNdUMsWUFBWSxHQUFHLElBQUlSLFFBQVEsQ0FDL0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQUU7SUFDUmhELE9BQU8sQ0FBQ0Msa0JBQWtCLENBQUNrRCxZQUFZLENBQUVyRCw2QkFBNkIsQ0FBQ3lCLEdBQUcsQ0FBQyxDQUFDLENBQUM2QixDQUFFLENBQUMsR0FBR3BELE9BQU8sQ0FBQ0Msa0JBQWtCLENBQUNrRCxZQUFZLENBQUV2RCxnQkFBZ0IsQ0FBQzJCLEdBQUcsQ0FBQyxDQUFDLENBQUM2QixDQUFFLENBQUMsRUFDdEpwRCxPQUFPLENBQUNDLGtCQUFrQixDQUFDb0QsWUFBWSxDQUFFdkQsNkJBQTZCLENBQUN5QixHQUFHLENBQUMsQ0FBQyxDQUFDK0IsQ0FBRSxDQUFDLEdBQUd0RCxPQUFPLENBQUNDLGtCQUFrQixDQUFDb0QsWUFBWSxDQUFFekQsZ0JBQWdCLENBQUMyQixHQUFHLENBQUMsQ0FBQyxDQUFDK0IsQ0FBRSxDQUFDLEdBQUd0RCxPQUFPLENBQUNNLFNBQVMsQ0FBQ2lELE1BQU0sRUFDakw7TUFBRWIsTUFBTSxFQUFFMUMsT0FBTyxDQUFDZ0IsVUFBVTtNQUFFMkIsU0FBUyxFQUFFM0MsT0FBTyxDQUFDaUI7SUFBYyxDQUNqRSxDQUFDOztJQUVEO0lBQ0EsSUFBSXdDLFlBQVksR0FBRyxDQUFDO0lBQ3BCLE1BQU1DLGlCQUFpQixHQUFHLElBQUlqRixZQUFZLENBQUU7TUFFMUNrRixLQUFLLEVBQUVDLEtBQUssSUFBSTtRQUNkLE1BQU1DLGFBQWEsR0FBR0QsS0FBSyxDQUFDQyxhQUFjO1FBQzFDSixZQUFZLEdBQUdJLGFBQWEsQ0FBQ0MsbUJBQW1CLENBQUVGLEtBQUssQ0FBQ0csT0FBTyxDQUFDQyxLQUFNLENBQUMsQ0FBQ1YsQ0FBQyxHQUFHTyxhQUFhLENBQUNQLENBQUM7TUFDN0YsQ0FBQztNQUVEO01BQ0FXLElBQUksRUFBRUEsQ0FBRUwsS0FBSyxFQUFFTSxRQUFRLEtBQU07UUFFM0I7UUFDQSxNQUFNQyxZQUFZLEdBQUduRSxPQUFPLENBQUNDLGtCQUFrQixDQUFDbUUsbUJBQW1CLENBQUV4RSxnQkFBZ0IsQ0FBQzJCLEdBQUcsQ0FBQyxDQUFFLENBQUM7UUFDN0YsSUFBSThDLEtBQUssR0FBR0gsUUFBUSxDQUFDTCxhQUFhLENBQUNDLG1CQUFtQixDQUFFRixLQUFLLENBQUNHLE9BQU8sQ0FBQ0MsS0FBTSxDQUFDLENBQUNWLENBQUMsR0FBR2EsWUFBWSxDQUFDYixDQUFDLEdBQUdHLFlBQVk7UUFDL0csSUFBS3pELE9BQU8sQ0FBQ1EsZUFBZSxFQUFHO1VBQzdCNkQsS0FBSyxHQUFHckcsS0FBSyxDQUFDc0csS0FBSyxDQUFFRCxLQUFLLEVBQUVGLFlBQVksQ0FBQ2IsQ0FBQyxHQUFHdEQsT0FBTyxDQUFDUSxlQUFlLENBQUMrRCxHQUFHLEVBQUVKLFlBQVksQ0FBQ2IsQ0FBQyxHQUFHdEQsT0FBTyxDQUFDUSxlQUFlLENBQUNnRSxHQUFJLENBQUM7UUFDMUg7O1FBRUE7UUFDQSxNQUFNQyxNQUFNLEdBQUd6RSxPQUFPLENBQUNDLGtCQUFrQixDQUFDeUUsWUFBWSxDQUFFTCxLQUFNLENBQUM7UUFDL0R4RSw2QkFBNkIsQ0FBQzhFLEdBQUcsQ0FBRSxJQUFJMUcsT0FBTyxDQUFFNEIsNkJBQTZCLENBQUMwQixHQUFHLENBQUMsQ0FBQyxDQUFDNkIsQ0FBQyxFQUFFcUIsTUFBTyxDQUFFLENBQUM7UUFDakczRSw2QkFBNkIsQ0FBQzZFLEdBQUcsQ0FBRSxJQUFJMUcsT0FBTyxDQUFFNkIsNkJBQTZCLENBQUN5QixHQUFHLENBQUMsQ0FBQyxDQUFDNkIsQ0FBQyxFQUFFcUIsTUFBTyxDQUFFLENBQUM7TUFDbkcsQ0FBQztNQUVERyxNQUFNLEVBQUU1RSxPQUFPLENBQUM0RSxNQUFNLENBQUNDLFlBQVksQ0FBRSxtQkFBb0I7SUFDM0QsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMsYUFBYSxHQUFHLElBQUlDLFNBQVMsQ0FBRSxJQUFJNUYsUUFBUSxDQUFFO01BQUV3QyxJQUFJLEVBQUUzQixPQUFPLENBQUNZO0lBQWtCLENBQUUsQ0FBQyxFQUFFO01BQ3hGb0UsSUFBSSxFQUFFaEYsT0FBTyxDQUFDTSxTQUFTO01BQ3ZCcUIsSUFBSSxFQUFFM0IsT0FBTyxDQUFDVSxpQkFBaUI7TUFDL0JnQyxNQUFNLEVBQUUxQyxPQUFPLENBQUNXLG1CQUFtQjtNQUNuQ2dDLFNBQVMsRUFBRTNDLE9BQU8sQ0FBQ087SUFDckIsQ0FBRSxDQUFDO0lBQ0gsTUFBTTBFLGFBQWEsR0FBRyxJQUFJRixTQUFTLENBQUUsSUFBSTlGLFNBQVMsQ0FBRTtNQUFFMEMsSUFBSSxFQUFFM0IsT0FBTyxDQUFDZTtJQUFrQixDQUFFLENBQUMsRUFBRTtNQUN6RmlFLElBQUksRUFBRWhGLE9BQU8sQ0FBQ00sU0FBUztNQUN2QnFCLElBQUksRUFBRTNCLE9BQU8sQ0FBQ2EsaUJBQWlCO01BQy9CNkIsTUFBTSxFQUFFMUMsT0FBTyxDQUFDYyxtQkFBbUI7TUFDbkM2QixTQUFTLEVBQUUzQyxPQUFPLENBQUNPO0lBQ3JCLENBQUUsQ0FBQztJQUNILElBQUtQLE9BQU8sQ0FBQ0csV0FBVyxFQUFHO01BQ3pCMkUsYUFBYSxDQUFDSSxNQUFNLEdBQUdsRixPQUFPLENBQUNTLFdBQVc7TUFDMUNxRSxhQUFhLENBQUNLLGdCQUFnQixDQUFFekIsaUJBQWtCLENBQUM7TUFDbkR1QixhQUFhLENBQUNDLE1BQU0sR0FBR2xGLE9BQU8sQ0FBQ1MsV0FBVztNQUMxQ3dFLGFBQWEsQ0FBQ0UsZ0JBQWdCLENBQUV6QixpQkFBa0IsQ0FBQztJQUNyRDtJQUVBMUQsT0FBTyxDQUFDNkMsUUFBUSxHQUFHLENBQUVFLFlBQVksRUFBRVMsWUFBWSxFQUFFc0IsYUFBYSxFQUFFRyxhQUFhLEVBQUVyQyxhQUFhLENBQUU7SUFFOUYsS0FBSyxDQUFFNUMsT0FBUSxDQUFDOztJQUVoQjtJQUNBLE1BQU1vRixnQkFBZ0IsR0FBR0EsQ0FBRUMsUUFBaUIsRUFBRUMsV0FBMkIsS0FBTTtNQUU3RTtNQUNBLElBQUksQ0FBQ0MsV0FBVyxHQUFHdkYsT0FBTyxDQUFDQyxrQkFBa0IsQ0FBQ21FLG1CQUFtQixDQUFFaUIsUUFBUyxDQUFDOztNQUU3RTtNQUNBLElBQUtDLFdBQVcsRUFBRztRQUNqQixNQUFNRSxFQUFFLEdBQUdILFFBQVEsQ0FBQ2pDLENBQUMsR0FBR2tDLFdBQVcsQ0FBQ2xDLENBQUM7UUFDckMsTUFBTXFDLEVBQUUsR0FBR0osUUFBUSxDQUFDL0IsQ0FBQyxHQUFHZ0MsV0FBVyxDQUFDaEMsQ0FBQztRQUNyQ3pELDZCQUE2QixDQUFDOEUsR0FBRyxDQUFFLElBQUkxRyxPQUFPLENBQUU0Qiw2QkFBNkIsQ0FBQzBCLEdBQUcsQ0FBQyxDQUFDLENBQUM2QixDQUFDLEdBQUdvQyxFQUFFLEVBQ3hGM0YsNkJBQTZCLENBQUMwQixHQUFHLENBQUMsQ0FBQyxDQUFDK0IsQ0FBQyxHQUFHbUMsRUFBRyxDQUFFLENBQUM7UUFDaEQzRiw2QkFBNkIsQ0FBQzZFLEdBQUcsQ0FBRSxJQUFJMUcsT0FBTyxDQUFFNkIsNkJBQTZCLENBQUN5QixHQUFHLENBQUMsQ0FBQyxDQUFDNkIsQ0FBQyxHQUFHb0MsRUFBRSxFQUN4RjFGLDZCQUE2QixDQUFDeUIsR0FBRyxDQUFDLENBQUMsQ0FBQytCLENBQUMsR0FBR21DLEVBQUcsQ0FBRSxDQUFDO01BQ2xEO0lBQ0YsQ0FBQztJQUNEN0YsZ0JBQWdCLENBQUNrQyxJQUFJLENBQUVzRCxnQkFBaUIsQ0FBQzs7SUFFekM7SUFDQSxNQUFNTSxxQkFBcUIsR0FBS0MscUJBQThCLElBQU07TUFDbEViLGFBQWEsQ0FBQzlDLE9BQU8sR0FBR2hDLE9BQU8sQ0FBQ0Msa0JBQWtCLENBQUNrRCxZQUFZLENBQUV3QyxxQkFBcUIsQ0FBQ3ZDLENBQUUsQ0FBQyxHQUNsRXBELE9BQU8sQ0FBQ0Msa0JBQWtCLENBQUNrRCxZQUFZLENBQUV2RCxnQkFBZ0IsQ0FBQzJCLEdBQUcsQ0FBQyxDQUFDLENBQUM2QixDQUFFLENBQUM7TUFDM0YwQixhQUFhLENBQUM3QyxNQUFNLEdBQUdqQyxPQUFPLENBQUNDLGtCQUFrQixDQUFDb0QsWUFBWSxDQUFFc0MscUJBQXFCLENBQUNyQyxDQUFFLENBQUMsR0FDbEV0RCxPQUFPLENBQUNDLGtCQUFrQixDQUFDb0QsWUFBWSxDQUFFekQsZ0JBQWdCLENBQUMyQixHQUFHLENBQUMsQ0FBQyxDQUFDK0IsQ0FBRSxDQUFDO01BQzFGUCxZQUFZLENBQUM2QyxXQUFXLENBQUVkLGFBQWEsQ0FBQzFCLENBQUMsRUFBRTBCLGFBQWEsQ0FBQ3hCLENBQUMsR0FBR3RELE9BQU8sQ0FBQ00sU0FBUyxDQUFDaUQsTUFBTyxDQUFDO0lBQ3pGLENBQUM7SUFDRDFELDZCQUE2QixDQUFDaUMsSUFBSSxDQUFFNEQscUJBQXNCLENBQUM7O0lBRTNEO0lBQ0EsTUFBTUcscUJBQXFCLEdBQUtDLHFCQUE4QixJQUFNO01BQ2xFYixhQUFhLENBQUNqRCxPQUFPLEdBQUdoQyxPQUFPLENBQUNDLGtCQUFrQixDQUFDa0QsWUFBWSxDQUFFMkMscUJBQXFCLENBQUMxQyxDQUFFLENBQUMsR0FDbEVwRCxPQUFPLENBQUNDLGtCQUFrQixDQUFDa0QsWUFBWSxDQUFFdkQsZ0JBQWdCLENBQUMyQixHQUFHLENBQUMsQ0FBQyxDQUFDNkIsQ0FBRSxDQUFDO01BQzNGNkIsYUFBYSxDQUFDaEQsTUFBTSxHQUFHakMsT0FBTyxDQUFDQyxrQkFBa0IsQ0FBQ29ELFlBQVksQ0FBRXlDLHFCQUFxQixDQUFDeEMsQ0FBRSxDQUFDLEdBQ2xFdEQsT0FBTyxDQUFDQyxrQkFBa0IsQ0FBQ29ELFlBQVksQ0FBRXpELGdCQUFnQixDQUFDMkIsR0FBRyxDQUFDLENBQUMsQ0FBQytCLENBQUUsQ0FBQztNQUMxRkUsWUFBWSxDQUFDb0MsV0FBVyxDQUFFWCxhQUFhLENBQUM3QixDQUFDLEVBQUU2QixhQUFhLENBQUMzQixDQUFDLEdBQUd0RCxPQUFPLENBQUNNLFNBQVMsQ0FBQ2lELE1BQU8sQ0FBQztJQUN6RixDQUFDO0lBQ0R6RCw2QkFBNkIsQ0FBQ2dDLElBQUksQ0FBRStELHFCQUFzQixDQUFDO0lBRTNELElBQUksQ0FBQ3JFLGdCQUFnQixHQUFHQSxnQkFBZ0I7O0lBRXhDO0lBQ0EsSUFBSSxDQUFDdUUsZUFBZSxDQUFDakUsSUFBSSxDQUFFRixPQUFPLElBQUk7TUFDcENQLGFBQWEsQ0FBQ08sT0FBTyxHQUFHQSxPQUFPO0lBQ2pDLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ29FLDZCQUE2QixHQUFHLE1BQU07TUFFekN4RSxnQkFBZ0IsQ0FBQ3lFLE9BQU8sQ0FBQyxDQUFDOztNQUUxQjtNQUNBckcsZ0JBQWdCLENBQUNzRyxNQUFNLENBQUVkLGdCQUFpQixDQUFDO01BQzNDdkYsNkJBQTZCLENBQUNxRyxNQUFNLENBQUVSLHFCQUFzQixDQUFDO01BQzdENUYsNkJBQTZCLENBQUNvRyxNQUFNLENBQUVMLHFCQUFzQixDQUFDOztNQUU3RDtNQUNBeEUsYUFBYSxDQUFDNEUsT0FBTyxDQUFDLENBQUM7SUFDekIsQ0FBQzs7SUFFRDtJQUNBM0UsTUFBTSxJQUFJNkUsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsTUFBTSxJQUFJbEksZ0JBQWdCLENBQUNtSSxlQUFlLENBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFFLElBQUssQ0FBQztFQUNySTs7RUFFQTtBQUNGO0FBQ0E7RUFDRSxJQUFXQyxZQUFZQSxDQUFBLEVBQVk7SUFBRSxPQUFPLElBQUksQ0FBQ2hGLGdCQUFnQixDQUFDSSxPQUFPO0VBQUU7O0VBRTNFO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBVzRFLFlBQVlBLENBQUVDLEtBQWMsRUFBRztJQUFFLElBQUksQ0FBQ2pGLGdCQUFnQixDQUFDSSxPQUFPLEdBQUc2RSxLQUFLO0VBQUU7O0VBRW5GO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxPQUFjQyxVQUFVQSxDQUFFQyxVQUFrQixFQUNsQkMsb0JBQTRCLEVBQUVDLG9CQUE0QixFQUMxREMsaUJBQXlCLEVBQ3pCL0csZUFBeUUsRUFBUztJQUUxRyxNQUFNQyxPQUFPLEdBQUcxQixjQUFjLENBQWlDO01BQzdENkIsV0FBVyxFQUFFO0lBQ2YsQ0FBQyxFQUFFSixlQUFnQixDQUFDO0lBRXBCLE9BQU8sSUFBSU4sc0JBQXNCLENBQy9CLElBQUkzQixRQUFRLENBQUU2SSxVQUFXLENBQUMsRUFDMUIsSUFBSXpJLGVBQWUsQ0FBRSxJQUFJRCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBRSxDQUFDLEVBQzFDLElBQUlDLGVBQWUsQ0FBRSxJQUFJRCxPQUFPLENBQUUySSxvQkFBb0IsRUFBRUUsaUJBQWtCLENBQUUsQ0FBQyxFQUM3RSxJQUFJNUksZUFBZSxDQUFFLElBQUlELE9BQU8sQ0FBRTRJLG9CQUFvQixFQUFFQyxpQkFBa0IsQ0FBRSxDQUFDLEVBQzdFOUcsT0FDRixDQUFDO0VBQ0g7RUFFZ0JpRyxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDRCw2QkFBNkIsQ0FBQyxDQUFDO0lBQ3BDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBN0csV0FBVyxDQUFDMkgsUUFBUSxDQUFFLHdCQUF3QixFQUFFdEgsc0JBQXVCLENBQUM7QUFXeEU7QUFDQTtBQUNBO0FBQ0EsTUFBTXNGLFNBQVMsU0FBU3BHLElBQUksQ0FBQztFQUVwQmUsV0FBV0EsQ0FBRXNILFNBQWUsRUFBRWpILGVBQWtDLEVBQUc7SUFFeEUsTUFBTUMsT0FBTyxHQUFHM0IsU0FBUyxDQUFzRCxDQUFDLENBQUU7TUFDaEYyRyxJQUFJLEVBQUUsSUFBSWpILFVBQVUsQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDO01BQzlCNEQsSUFBSSxFQUFFLE9BQU87TUFDYmUsTUFBTSxFQUFFLE9BQU87TUFDZkMsU0FBUyxFQUFFO0lBQ2IsQ0FBQyxFQUFFNUMsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLE1BQU1rSCxTQUFTLEdBQUcsSUFBSXBJLFNBQVMsQ0FBRSxDQUFDbUIsT0FBTyxDQUFDZ0YsSUFBSSxDQUFDa0MsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDbEgsT0FBTyxDQUFDZ0YsSUFBSSxDQUFDekIsTUFBTSxFQUFFdkQsT0FBTyxDQUFDZ0YsSUFBSSxDQUFDa0MsS0FBSyxFQUFFbEgsT0FBTyxDQUFDZ0YsSUFBSSxDQUFDekIsTUFBTSxFQUFFO01BQ3ZINUIsSUFBSSxFQUFFM0IsT0FBTyxDQUFDMkIsSUFBSTtNQUNsQmUsTUFBTSxFQUFFMUMsT0FBTyxDQUFDMEMsTUFBTTtNQUN0QkMsU0FBUyxFQUFFM0MsT0FBTyxDQUFDMkM7SUFDckIsQ0FBRSxDQUFDOztJQUVIO0lBQ0FxRSxTQUFTLENBQUNHLGlCQUFpQixDQUFFLEdBQUcsR0FBR25ILE9BQU8sQ0FBQ2dGLElBQUksQ0FBQ2tDLEtBQUssR0FBR0YsU0FBUyxDQUFDRSxLQUFNLENBQUM7SUFDekVGLFNBQVMsQ0FBQ2hGLE9BQU8sR0FBR2lGLFNBQVMsQ0FBQ2pGLE9BQU87SUFDckNnRixTQUFTLENBQUMvRSxNQUFNLEdBQUdnRixTQUFTLENBQUNoRixNQUFNLEdBQUcsRUFBRTs7SUFFeEM7SUFDQSxJQUFJLENBQUNhLFFBQVEsQ0FBRW1FLFNBQVUsQ0FBQztJQUMxQixJQUFJLENBQUNuRSxRQUFRLENBQUVrRSxTQUFVLENBQUM7SUFDMUIsSUFBS3pILGlCQUFpQixFQUFHO01BQ3ZCLElBQUksQ0FBQ3VELFFBQVEsQ0FBRSxJQUFJdEUsTUFBTSxDQUFFLENBQUMsRUFBRTtRQUFFbUQsSUFBSSxFQUFFO01BQU0sQ0FBRSxDQUFFLENBQUM7SUFDbkQ7O0lBRUE7SUFDQSxJQUFJLENBQUN5RixTQUFTLEdBQUcsSUFBSSxDQUFDQyxXQUFXLENBQUNDLFNBQVMsQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDO0lBRXJELElBQUksQ0FBQ0MsTUFBTSxDQUFFdkgsT0FBUSxDQUFDO0VBQ3hCO0FBQ0Y7QUFJQTtBQUNBO0FBQ0E7QUFDQSxNQUFNZ0QsUUFBUSxTQUFTcEUsSUFBSSxDQUFDO0VBS25CYyxXQUFXQSxDQUFFOEgsTUFBYyxFQUFFQyxNQUFjLEVBQUVDLElBQVksRUFBRUMsSUFBWSxFQUFFNUgsZUFBNkIsRUFBRztJQUU5RyxLQUFLLENBQUUsSUFBSyxDQUFDO0lBRWIsSUFBSSxDQUFDNkgsVUFBVSxHQUFHO01BQUV4RSxDQUFDLEVBQUVvRSxNQUFNO01BQUVsRSxDQUFDLEVBQUVtRTtJQUFPLENBQUM7O0lBRTFDO0lBQ0EsSUFBSSxDQUFDSSxrQkFBa0IsR0FBRztNQUFFekUsQ0FBQyxFQUFFLEVBQUU7TUFBRUUsQ0FBQyxFQUFFLENBQUM7SUFBRyxDQUFDO0lBQzNDLElBQUtvRSxJQUFJLEdBQUdGLE1BQU0sRUFBRztNQUNuQjtNQUNBLElBQUksQ0FBQ0ssa0JBQWtCLENBQUN6RSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUN5RSxrQkFBa0IsQ0FBQ3pFLENBQUM7SUFDeEQ7SUFFQSxJQUFJLENBQUN3QyxXQUFXLENBQUU4QixJQUFJLEVBQUVDLElBQUssQ0FBQztJQUU5QixJQUFJLENBQUNKLE1BQU0sQ0FBRXhILGVBQWdCLENBQUM7RUFDaEM7O0VBRUE7RUFDTzZGLFdBQVdBLENBQUU4QixJQUFZLEVBQUVDLElBQVksRUFBUztJQUVyRCxNQUFNSCxNQUFNLEdBQUcsSUFBSSxDQUFDSSxVQUFVLENBQUN4RSxDQUFDO0lBQ2hDLE1BQU1xRSxNQUFNLEdBQUcsSUFBSSxDQUFDRyxVQUFVLENBQUN0RSxDQUFDO0lBQ2hDLE1BQU13RSxtQkFBbUIsR0FBRyxJQUFJLENBQUNELGtCQUFrQixDQUFDekUsQ0FBQztJQUNyRCxNQUFNMkUsbUJBQW1CLEdBQUcsSUFBSSxDQUFDRixrQkFBa0IsQ0FBQ3ZFLENBQUM7SUFFckQsSUFBSSxDQUFDMEUsUUFBUSxDQUFFLElBQUk3SixLQUFLLENBQUMsQ0FBQyxDQUN2QnFFLE1BQU0sQ0FBRWdGLE1BQU0sRUFBRUMsTUFBTyxDQUFDLENBQ3hCUSxZQUFZLENBQUVULE1BQU0sR0FBR00sbUJBQW1CLEVBQUVMLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEdBQUdJLG1CQUFtQixFQUFFTCxJQUFJLEVBQUVDLElBQUssQ0FDcEcsQ0FBQztFQUNIO0FBQ0Y7QUFFQSxlQUFlbEksc0JBQXNCIn0=