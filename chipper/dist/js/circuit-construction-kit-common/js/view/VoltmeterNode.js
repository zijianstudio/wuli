// Copyright 2016-2023, University of Colorado Boulder

/**
 * Displays the Voltmeter, which has 2 probes and detects potential differences. Exists for the life of the sim and
 * hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import { Color, DragListener, Image, Node, Rectangle, Text } from '../../../scenery/js/imports.js';
import probeBlack_png from '../../mipmaps/probeBlack_png.js';
import probeRed_png from '../../mipmaps/probeRed_png.js';
import voltmeterBody_png from '../../mipmaps/voltmeterBody_png.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CCKCUtils from '../CCKCUtils.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ProbeTextNode from './ProbeTextNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import optionize from '../../../phet-core/js/optionize.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import Multilink from '../../../axon/js/Multilink.js';
const voltageStringProperty = CircuitConstructionKitCommonStrings.voltageStringProperty;

// constants
const VOLTMETER_PROBE_TIP_LENGTH = 20; // The probe tip is about 20 view coordinates tall
const VOLTMETER_NUMBER_SAMPLE_POINTS = 10; // Number of points along the edge of the voltmeter tip to detect voltages

// unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
const PROBE_CONNECTION_POINT_DY = -18;
const PROBE_CONNECTION_POINT_DX = 8;
const SCALE = 0.5; // overall scale factor for the nodes
const PROBE_SCALE = 0.67 * SCALE; // multiplied by the SCALE above
const PROBE_ANGLE = 22 * Math.PI * 2 / 360;
const CONTROL_POINT_X = 30;
const CONTROL_POINT_Y1 = 15;
const CONTROL_POINT_Y2 = 60;
export default class VoltmeterNode extends Node {
  // so events can be forwarded from the toolbox

  static PROBE_ANGLE = PROBE_ANGLE;

  /**
   * @param voltmeter - the model Voltmeter to be shown by this node
   * @param model
   * @param circuitNode
   * @param [providedOptions]
   */
  constructor(voltmeter, model, circuitNode, providedOptions) {
    const options = optionize()({
      tandem: Tandem.REQUIRED,
      pickable: true,
      // Whether this will be used as an icon or not.
      isIcon: false,
      // Draggable bounds
      visibleBoundsProperty: null,
      // Whether values can be displayed (hidden after user makes a change in some Black Box modes).
      showResultsProperty: new BooleanProperty(true),
      // Whether the phet-io index of the meter appears in the label
      showPhetioIndex: false,
      // Instrumentation is handled in Meter.isActiveProperty
      phetioVisiblePropertyInstrumented: false
    }, providedOptions);
    const blackProbeNode = new Rectangle(-2, -2, 4, 4, {
      // the hit area
      fill: CCKCQueryParameters.showVoltmeterSamplePoints ? Color.BLACK : null,
      cursor: 'pointer',
      children: [new Image(probeBlack_png, {
        scale: PROBE_SCALE,
        rotation: PROBE_ANGLE,
        // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
        // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
        x: -9.5,
        y: -5
      })]
    });
    const redProbeNode = new Rectangle(-2, -2, 4, 4, {
      // the hit area
      fill: CCKCQueryParameters.showVoltmeterSamplePoints ? Color.RED : null,
      cursor: 'pointer',
      children: [new Image(probeRed_png, {
        scale: PROBE_SCALE,
        rotation: -PROBE_ANGLE,
        // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
        // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
        x: -11,
        y: +4
      })]
    });

    // Displays the voltage reading
    const voltageReadoutProperty = new DerivedProperty([voltmeter.voltageProperty, CircuitConstructionKitCommonStrings.voltageUnitsStringProperty], voltage => voltage === null ? MathSymbols.NO_VALUE : CCKCUtils.createVoltageReadout(voltage), {
      tandem: options.tandem.createTandem('probeReadoutText').createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });
    const probeTextProperty = new DerivedProperty([voltageStringProperty], voltageString => options.showPhetioIndex ? voltageString + ' ' + voltmeter.phetioIndex : voltageString, {
      tandem: options.tandem.createTandem('probeTitleText').createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });
    const probeTextNode = new ProbeTextNode(voltageReadoutProperty, options.showResultsProperty, probeTextProperty,
    // No need for an extra level of nesting in the tandem tree, since that is just an implementation detail
    // and not a feature
    options.tandem, {
      centerX: voltmeterBody_png[0].width / 2,
      centerY: voltmeterBody_png[0].height / 2
    });
    const bodyNode = new Image(voltmeterBody_png, {
      scale: SCALE,
      cursor: 'pointer',
      children: [probeTextNode]
    });

    /**
     * Creates a Vector2Property with a new Vector2 at the specified position.
     * @param [x]
     * @param [y]
     */
    const createVector2Property = function (x = 0, y = 0) {
      return new Vector2Property(new Vector2(x, y));
    };
    const blackWireBodyPositionProperty = createVector2Property();
    const blackWireProbePositionProperty = createVector2Property();
    const blackWireNode = new WireNode(blackWireBodyPositionProperty, createVector2Property(-CONTROL_POINT_X, CONTROL_POINT_Y1), blackWireProbePositionProperty, createVector2Property(-CONTROL_POINT_X, CONTROL_POINT_Y2), {
      stroke: Color.BLACK,
      lineWidth: 3,
      pickable: false
    });
    const redWireBodyPositionProperty = createVector2Property();
    const redWireProbePositionProperty = createVector2Property();
    const redWireNode = new WireNode(redWireBodyPositionProperty, createVector2Property(CONTROL_POINT_X, CONTROL_POINT_Y1), redWireProbePositionProperty, createVector2Property(CONTROL_POINT_X, CONTROL_POINT_Y2), {
      stroke: Color.RED,
      lineWidth: 3,
      pickable: false
    });

    // When the voltmeter body moves, update the node and wires
    Multilink.multilink([voltmeter.bodyPositionProperty, voltmeter.isActiveProperty], (bodyPosition, isActive) => {
      // Drag the body by the center
      bodyNode.center = bodyPosition;
      blackWireBodyPositionProperty.value = bodyNode.centerBottom.plusXY(-PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY);
      redWireBodyPositionProperty.value = bodyNode.centerBottom.plusXY(PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY);

      // When dragging out of the toolbox, the probes move with the body
      if (voltmeter.isDraggingProbesWithBodyProperty.get()) {
        const probeY = -30 - bodyNode.height / 2;
        const probeOffsetX = 78;
        const constrain = pt => options.visibleBoundsProperty ? options.visibleBoundsProperty.value.eroded(CCKCConstants.DRAG_BOUNDS_EROSION).closestPointTo(pt) : pt;
        voltmeter.redProbePositionProperty.set(constrain(bodyPosition.plusXY(+probeOffsetX, probeY)));
        voltmeter.blackProbePositionProperty.set(constrain(bodyPosition.plusXY(-probeOffsetX, probeY)));
      }
    });

    /**
     * Creates listeners for the link function to update the probe node and wire when probe position changes.
     */
    const probeMovedCallback = (probeNode, probePositionProperty, sign) => {
      return probePosition => {
        probeNode.translation = probePosition;

        // Sampled manually, will need to change if probe angle changes
        probePositionProperty.value = probeNode.centerBottom.plusXY(32 * sign, -4);
      };
    };

    // When the probe moves, update the node and wire
    voltmeter.redProbePositionProperty.link(probeMovedCallback(redProbeNode, redWireProbePositionProperty, +1));
    voltmeter.blackProbePositionProperty.link(probeMovedCallback(blackProbeNode, blackWireProbePositionProperty, -1));
    super(options);
    super.addChild(bodyNode);
    super.addChild(blackWireNode);
    super.addChild(blackProbeNode);
    super.addChild(redWireNode);
    super.addChild(redProbeNode);
    this.circuitNode = circuitNode;
    this.voltmeter = voltmeter;
    this.redProbeNode = redProbeNode;
    this.blackProbeNode = blackProbeNode;

    // For the real version (not the icon), add drag listeners and update visibility
    if (!options.isIcon) {
      // Show the voltmeter when icon dragged out of the toolbox
      voltmeter.isActiveProperty.linkAttribute(this, 'visible');

      /**
       * Gets a drag handler for one of the probes.
       */
      const createProbeDragListener = (positionProperty, tandem) => {
        const probeDragListener = new DragListener({
          positionProperty: positionProperty,
          start: () => this.moveToFront(),
          tandem: tandem.createTandem('probeDragListener'),
          dragBoundsProperty: new DerivedProperty([options.visibleBoundsProperty], visibleBounds => {
            return visibleBounds.eroded(CCKCConstants.DRAG_BOUNDS_EROSION);
          })
        });
        return probeDragListener;
      };
      const redProbeDragListener = createProbeDragListener(voltmeter.redProbePositionProperty, options.tandem.createTandem('redProbeDragListener'));
      const blackProbeDragListener = createProbeDragListener(voltmeter.blackProbePositionProperty, options.tandem.createTandem('blackProbeDragListener'));
      this.redProbeNode.addInputListener(redProbeDragListener);
      this.blackProbeNode.addInputListener(blackProbeDragListener);
      const erodedBoundsProperty = new DerivedProperty([options.visibleBoundsProperty], visibleBounds => {
        return visibleBounds.eroded(CCKCConstants.DRAG_BOUNDS_EROSION);
      });
      this.dragHandler = new DragListener({
        positionProperty: voltmeter.bodyPositionProperty,
        tandem: options.tandem.createTandem('dragListener'),
        useParentOffset: true,
        dragBoundsProperty: erodedBoundsProperty,
        start: event => {
          this.moveToFront();
        },
        end: () => {
          voltmeter.droppedEmitter.emit(bodyNode.globalBounds);

          // After dropping in the play area the probes move independently of the body
          voltmeter.isDraggingProbesWithBodyProperty.set(false);
        },
        // adds support for zoomed coordinate frame, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/301
        targetNode: this
      });
      erodedBoundsProperty.link(erodedBounds => {
        voltmeter.redProbePositionProperty.set(erodedBounds.closestPointTo(voltmeter.redProbePositionProperty.value));
        voltmeter.blackProbePositionProperty.set(erodedBounds.closestPointTo(voltmeter.blackProbePositionProperty.value));
        voltmeter.bodyPositionProperty.set(erodedBounds.closestPointTo(voltmeter.bodyPositionProperty.value));
      });
      bodyNode.addInputListener(this.dragHandler);

      /**
       * Starting at the tip, iterate down over several samples and return the first hit, if any.
       * @param probeNode
       * @param probeTip
       * @param sign - the direction the probe is rotated
       * @returns - if connected returns VoltageConnection otherwise null
       */
      const findConnection = (probeNode, probeTip, sign) => {
        const probeTipVector = Vector2.createPolar(VOLTMETER_PROBE_TIP_LENGTH, sign * VoltmeterNode.PROBE_ANGLE + Math.PI / 2);
        const probeTipTail = probeTip.plus(probeTipVector);
        for (let i = 0; i < VOLTMETER_NUMBER_SAMPLE_POINTS; i++) {
          const samplePoint = probeTip.blend(probeTipTail, i / VOLTMETER_NUMBER_SAMPLE_POINTS);
          const voltageConnection = circuitNode.getVoltageConnection(samplePoint);

          // For debugging, depict the points where the sampling happens
          if (CCKCQueryParameters.showVoltmeterSamplePoints) {
            // Note, these get erased when changing between lifelike/schematic
            this.circuitNode.addChild(new Rectangle(-1, -1, 2, 2, {
              fill: Color.BLACK,
              translation: samplePoint
            }));
          }
          if (voltageConnection) {
            return voltageConnection;
          }
        }
        return null;
      };

      /**
       * Detection for voltmeter probe + circuit intersection is done in the view since view bounds are used
       */
      const updateVoltmeter = () => {
        if (voltmeter.isActiveProperty.get()) {
          const blackConnection = findConnection(blackProbeNode, voltmeter.blackProbePositionProperty.get(), +1);
          const redConnection = findConnection(redProbeNode, voltmeter.redProbePositionProperty.get(), -1);
          const voltage = this.circuitNode.circuit.getVoltageBetweenConnections(redConnection, blackConnection, false);
          voltmeter.blackConnectionProperty.set(blackConnection);
          voltmeter.redConnectionProperty.set(redConnection);
          voltmeter.voltageProperty.value = voltage;
        }
      };
      model.circuit.circuitChangedEmitter.addListener(updateVoltmeter);
      voltmeter.redProbePositionProperty.link(updateVoltmeter);
      voltmeter.blackProbePositionProperty.link(updateVoltmeter);
    } else {
      this.dragHandler = null;
    }

    // When rendered as an icon, the touch area should span the bounds (no gaps between probes and body)
    if (options.isIcon) {
      this.touchArea = this.bounds.copy();
      this.mouseArea = this.bounds.copy();
      this.cursor = 'pointer';
    }
    this.addLinkedElement(voltmeter, {
      tandem: this.tandem.createTandem('voltmeter')
    });
  }

  /**
   * Forward a drag from the toolbox to the play area node.
   */
  startDrag(event) {
    this.dragHandler.press(event);
  }
}
circuitConstructionKitCommon.register('VoltmeterNode', VoltmeterNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiV2lyZU5vZGUiLCJDb2xvciIsIkRyYWdMaXN0ZW5lciIsIkltYWdlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJwcm9iZUJsYWNrX3BuZyIsInByb2JlUmVkX3BuZyIsInZvbHRtZXRlckJvZHlfcG5nIiwiQ0NLQ0NvbnN0YW50cyIsIkNDS0NRdWVyeVBhcmFtZXRlcnMiLCJDQ0tDVXRpbHMiLCJDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncyIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24iLCJQcm9iZVRleHROb2RlIiwiVGFuZGVtIiwiTWF0aFN5bWJvbHMiLCJvcHRpb25pemUiLCJTdHJpbmdJTyIsIk11bHRpbGluayIsInZvbHRhZ2VTdHJpbmdQcm9wZXJ0eSIsIlZPTFRNRVRFUl9QUk9CRV9USVBfTEVOR1RIIiwiVk9MVE1FVEVSX05VTUJFUl9TQU1QTEVfUE9JTlRTIiwiUFJPQkVfQ09OTkVDVElPTl9QT0lOVF9EWSIsIlBST0JFX0NPTk5FQ1RJT05fUE9JTlRfRFgiLCJTQ0FMRSIsIlBST0JFX1NDQUxFIiwiUFJPQkVfQU5HTEUiLCJNYXRoIiwiUEkiLCJDT05UUk9MX1BPSU5UX1giLCJDT05UUk9MX1BPSU5UX1kxIiwiQ09OVFJPTF9QT0lOVF9ZMiIsIlZvbHRtZXRlck5vZGUiLCJjb25zdHJ1Y3RvciIsInZvbHRtZXRlciIsIm1vZGVsIiwiY2lyY3VpdE5vZGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaWNrYWJsZSIsImlzSWNvbiIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInNob3dSZXN1bHRzUHJvcGVydHkiLCJzaG93UGhldGlvSW5kZXgiLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJibGFja1Byb2JlTm9kZSIsImZpbGwiLCJzaG93Vm9sdG1ldGVyU2FtcGxlUG9pbnRzIiwiQkxBQ0siLCJjdXJzb3IiLCJjaGlsZHJlbiIsInNjYWxlIiwicm90YXRpb24iLCJ4IiwieSIsInJlZFByb2JlTm9kZSIsIlJFRCIsInZvbHRhZ2VSZWFkb3V0UHJvcGVydHkiLCJ2b2x0YWdlUHJvcGVydHkiLCJ2b2x0YWdlVW5pdHNTdHJpbmdQcm9wZXJ0eSIsInZvbHRhZ2UiLCJOT19WQUxVRSIsImNyZWF0ZVZvbHRhZ2VSZWFkb3V0IiwiY3JlYXRlVGFuZGVtIiwiU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FIiwicGhldGlvVmFsdWVUeXBlIiwicHJvYmVUZXh0UHJvcGVydHkiLCJ2b2x0YWdlU3RyaW5nIiwicGhldGlvSW5kZXgiLCJwcm9iZVRleHROb2RlIiwiY2VudGVyWCIsIndpZHRoIiwiY2VudGVyWSIsImhlaWdodCIsImJvZHlOb2RlIiwiY3JlYXRlVmVjdG9yMlByb3BlcnR5IiwiYmxhY2tXaXJlQm9keVBvc2l0aW9uUHJvcGVydHkiLCJibGFja1dpcmVQcm9iZVBvc2l0aW9uUHJvcGVydHkiLCJibGFja1dpcmVOb2RlIiwic3Ryb2tlIiwibGluZVdpZHRoIiwicmVkV2lyZUJvZHlQb3NpdGlvblByb3BlcnR5IiwicmVkV2lyZVByb2JlUG9zaXRpb25Qcm9wZXJ0eSIsInJlZFdpcmVOb2RlIiwibXVsdGlsaW5rIiwiYm9keVBvc2l0aW9uUHJvcGVydHkiLCJpc0FjdGl2ZVByb3BlcnR5IiwiYm9keVBvc2l0aW9uIiwiaXNBY3RpdmUiLCJjZW50ZXIiLCJ2YWx1ZSIsImNlbnRlckJvdHRvbSIsInBsdXNYWSIsImlzRHJhZ2dpbmdQcm9iZXNXaXRoQm9keVByb3BlcnR5IiwiZ2V0IiwicHJvYmVZIiwicHJvYmVPZmZzZXRYIiwiY29uc3RyYWluIiwicHQiLCJlcm9kZWQiLCJEUkFHX0JPVU5EU19FUk9TSU9OIiwiY2xvc2VzdFBvaW50VG8iLCJyZWRQcm9iZVBvc2l0aW9uUHJvcGVydHkiLCJzZXQiLCJibGFja1Byb2JlUG9zaXRpb25Qcm9wZXJ0eSIsInByb2JlTW92ZWRDYWxsYmFjayIsInByb2JlTm9kZSIsInByb2JlUG9zaXRpb25Qcm9wZXJ0eSIsInNpZ24iLCJwcm9iZVBvc2l0aW9uIiwidHJhbnNsYXRpb24iLCJsaW5rIiwiYWRkQ2hpbGQiLCJsaW5rQXR0cmlidXRlIiwiY3JlYXRlUHJvYmVEcmFnTGlzdGVuZXIiLCJwb3NpdGlvblByb3BlcnR5IiwicHJvYmVEcmFnTGlzdGVuZXIiLCJzdGFydCIsIm1vdmVUb0Zyb250IiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwidmlzaWJsZUJvdW5kcyIsInJlZFByb2JlRHJhZ0xpc3RlbmVyIiwiYmxhY2tQcm9iZURyYWdMaXN0ZW5lciIsImFkZElucHV0TGlzdGVuZXIiLCJlcm9kZWRCb3VuZHNQcm9wZXJ0eSIsImRyYWdIYW5kbGVyIiwidXNlUGFyZW50T2Zmc2V0IiwiZXZlbnQiLCJlbmQiLCJkcm9wcGVkRW1pdHRlciIsImVtaXQiLCJnbG9iYWxCb3VuZHMiLCJ0YXJnZXROb2RlIiwiZXJvZGVkQm91bmRzIiwiZmluZENvbm5lY3Rpb24iLCJwcm9iZVRpcCIsInByb2JlVGlwVmVjdG9yIiwiY3JlYXRlUG9sYXIiLCJwcm9iZVRpcFRhaWwiLCJwbHVzIiwiaSIsInNhbXBsZVBvaW50IiwiYmxlbmQiLCJ2b2x0YWdlQ29ubmVjdGlvbiIsImdldFZvbHRhZ2VDb25uZWN0aW9uIiwidXBkYXRlVm9sdG1ldGVyIiwiYmxhY2tDb25uZWN0aW9uIiwicmVkQ29ubmVjdGlvbiIsImNpcmN1aXQiLCJnZXRWb2x0YWdlQmV0d2VlbkNvbm5lY3Rpb25zIiwiYmxhY2tDb25uZWN0aW9uUHJvcGVydHkiLCJyZWRDb25uZWN0aW9uUHJvcGVydHkiLCJjaXJjdWl0Q2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInRvdWNoQXJlYSIsImJvdW5kcyIsImNvcHkiLCJtb3VzZUFyZWEiLCJhZGRMaW5rZWRFbGVtZW50Iiwic3RhcnREcmFnIiwicHJlc3MiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZvbHRtZXRlck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGlzcGxheXMgdGhlIFZvbHRtZXRlciwgd2hpY2ggaGFzIDIgcHJvYmVzIGFuZCBkZXRlY3RzIHBvdGVudGlhbCBkaWZmZXJlbmNlcy4gRXhpc3RzIGZvciB0aGUgbGlmZSBvZiB0aGUgc2ltIGFuZFxyXG4gKiBoZW5jZSBkb2VzIG5vdCByZXF1aXJlIGEgZGlzcG9zZSBpbXBsZW1lbnRhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IFdpcmVOb2RlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9XaXJlTm9kZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBEcmFnTGlzdGVuZXIsIEltYWdlLCBOb2RlLCBOb2RlT3B0aW9ucywgUHJlc3NMaXN0ZW5lckV2ZW50LCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcHJvYmVCbGFja19wbmcgZnJvbSAnLi4vLi4vbWlwbWFwcy9wcm9iZUJsYWNrX3BuZy5qcyc7XHJcbmltcG9ydCBwcm9iZVJlZF9wbmcgZnJvbSAnLi4vLi4vbWlwbWFwcy9wcm9iZVJlZF9wbmcuanMnO1xyXG5pbXBvcnQgdm9sdG1ldGVyQm9keV9wbmcgZnJvbSAnLi4vLi4vbWlwbWFwcy92b2x0bWV0ZXJCb2R5X3BuZy5qcyc7XHJcbmltcG9ydCBDQ0tDQ29uc3RhbnRzIGZyb20gJy4uL0NDS0NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ0NLQ1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9DQ0tDUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IENDS0NVdGlscyBmcm9tICcuLi9DQ0tDVXRpbHMuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MgZnJvbSAnLi4vQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IFByb2JlVGV4dE5vZGUgZnJvbSAnLi9Qcm9iZVRleHROb2RlLmpzJztcclxuaW1wb3J0IFZvbHRtZXRlciBmcm9tICcuLi9tb2RlbC9Wb2x0bWV0ZXIuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdENvbnN0cnVjdGlvbktpdE1vZGVsIGZyb20gJy4uL21vZGVsL0NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRNb2RlbC5qcyc7XHJcbmltcG9ydCBDaXJjdWl0Tm9kZSBmcm9tICcuL0NpcmN1aXROb2RlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5cclxuY29uc3Qgdm9sdGFnZVN0cmluZ1Byb3BlcnR5ID0gQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3Mudm9sdGFnZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFZPTFRNRVRFUl9QUk9CRV9USVBfTEVOR1RIID0gMjA7IC8vIFRoZSBwcm9iZSB0aXAgaXMgYWJvdXQgMjAgdmlldyBjb29yZGluYXRlcyB0YWxsXHJcbmNvbnN0IFZPTFRNRVRFUl9OVU1CRVJfU0FNUExFX1BPSU5UUyA9IDEwOyAvLyBOdW1iZXIgb2YgcG9pbnRzIGFsb25nIHRoZSBlZGdlIG9mIHRoZSB2b2x0bWV0ZXIgdGlwIHRvIGRldGVjdCB2b2x0YWdlc1xyXG5cclxuLy8gdW5zaWduZWQgbWVhc3VyZW1lbnRzIGZvciB0aGUgY2lyY2xlcyBvbiB0aGUgdm9sdG1ldGVyIGJvZHkgaW1hZ2UsIGZvciB3aGVyZSB0aGUgcHJvYmUgd2lyZXMgY29ubmVjdFxyXG5jb25zdCBQUk9CRV9DT05ORUNUSU9OX1BPSU5UX0RZID0gLTE4O1xyXG5jb25zdCBQUk9CRV9DT05ORUNUSU9OX1BPSU5UX0RYID0gODtcclxuXHJcbmNvbnN0IFNDQUxFID0gMC41OyAvLyBvdmVyYWxsIHNjYWxlIGZhY3RvciBmb3IgdGhlIG5vZGVzXHJcbmNvbnN0IFBST0JFX1NDQUxFID0gMC42NyAqIFNDQUxFOyAvLyBtdWx0aXBsaWVkIGJ5IHRoZSBTQ0FMRSBhYm92ZVxyXG5jb25zdCBQUk9CRV9BTkdMRSA9IDIyICogTWF0aC5QSSAqIDIgLyAzNjA7XHJcblxyXG5jb25zdCBDT05UUk9MX1BPSU5UX1ggPSAzMDtcclxuY29uc3QgQ09OVFJPTF9QT0lOVF9ZMSA9IDE1O1xyXG5jb25zdCBDT05UUk9MX1BPSU5UX1kyID0gNjA7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGlzSWNvbj86IGJvb2xlYW47XHJcbiAgdmlzaWJsZUJvdW5kc1Byb3BlcnR5PzogUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPiB8IG51bGw7XHJcbiAgc2hvd1Jlc3VsdHNQcm9wZXJ0eT86IFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgc2hvd1BoZXRpb0luZGV4PzogYm9vbGVhbjtcclxufTtcclxudHlwZSBWb2x0bWV0ZXJOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWb2x0bWV0ZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjaXJjdWl0Tm9kZTogQ2lyY3VpdE5vZGUgfCBudWxsO1xyXG4gIHB1YmxpYyByZWFkb25seSB2b2x0bWV0ZXI6IFZvbHRtZXRlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHJlZFByb2JlTm9kZTogUmVjdGFuZ2xlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYmxhY2tQcm9iZU5vZGU6IFJlY3RhbmdsZTtcclxuXHJcbiAgLy8gc28gZXZlbnRzIGNhbiBiZSBmb3J3YXJkZWQgZnJvbSB0aGUgdG9vbGJveFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZHJhZ0hhbmRsZXI6IERyYWdMaXN0ZW5lciB8IG51bGw7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQUk9CRV9BTkdMRSA9IFBST0JFX0FOR0xFO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gdm9sdG1ldGVyIC0gdGhlIG1vZGVsIFZvbHRtZXRlciB0byBiZSBzaG93biBieSB0aGlzIG5vZGVcclxuICAgKiBAcGFyYW0gbW9kZWxcclxuICAgKiBAcGFyYW0gY2lyY3VpdE5vZGVcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZvbHRtZXRlcjogVm9sdG1ldGVyLCBtb2RlbDogQ2lyY3VpdENvbnN0cnVjdGlvbktpdE1vZGVsIHwgbnVsbCwgY2lyY3VpdE5vZGU6IENpcmN1aXROb2RlIHwgbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFZvbHRtZXRlck5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Vm9sdG1ldGVyTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcblxyXG4gICAgICBwaWNrYWJsZTogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIFdoZXRoZXIgdGhpcyB3aWxsIGJlIHVzZWQgYXMgYW4gaWNvbiBvciBub3QuXHJcbiAgICAgIGlzSWNvbjogZmFsc2UsXHJcblxyXG4gICAgICAvLyBEcmFnZ2FibGUgYm91bmRzXHJcbiAgICAgIHZpc2libGVCb3VuZHNQcm9wZXJ0eTogbnVsbCxcclxuXHJcbiAgICAgIC8vIFdoZXRoZXIgdmFsdWVzIGNhbiBiZSBkaXNwbGF5ZWQgKGhpZGRlbiBhZnRlciB1c2VyIG1ha2VzIGEgY2hhbmdlIGluIHNvbWUgQmxhY2sgQm94IG1vZGVzKS5cclxuICAgICAgc2hvd1Jlc3VsdHNQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApLFxyXG5cclxuICAgICAgLy8gV2hldGhlciB0aGUgcGhldC1pbyBpbmRleCBvZiB0aGUgbWV0ZXIgYXBwZWFycyBpbiB0aGUgbGFiZWxcclxuICAgICAgc2hvd1BoZXRpb0luZGV4OiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIEluc3RydW1lbnRhdGlvbiBpcyBoYW5kbGVkIGluIE1ldGVyLmlzQWN0aXZlUHJvcGVydHlcclxuICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxyXG5cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGJsYWNrUHJvYmVOb2RlID0gbmV3IFJlY3RhbmdsZSggLTIsIC0yLCA0LCA0LCB7IC8vIHRoZSBoaXQgYXJlYVxyXG4gICAgICBmaWxsOiBDQ0tDUXVlcnlQYXJhbWV0ZXJzLnNob3dWb2x0bWV0ZXJTYW1wbGVQb2ludHMgPyBDb2xvci5CTEFDSyA6IG51bGwsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICBjaGlsZHJlbjogWyBuZXcgSW1hZ2UoIHByb2JlQmxhY2tfcG5nLCB7XHJcbiAgICAgICAgc2NhbGU6IFBST0JFX1NDQUxFLFxyXG4gICAgICAgIHJvdGF0aW9uOiBQUk9CRV9BTkdMRSxcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lZCBlbXBpcmljYWxseSBieSBzaG93aW5nIHRoZSBwcm9iZSBob3Qgc3BvdCBhbmQgem9vbWluZyBpbiBieSBhIGZhY3RvciBvZiAyIGluXHJcbiAgICAgICAgLy8gQ2lyY3VpdENvbnN0cnVjdGlvbktpdE1vZGVsLiAgV2lsbCBuZWVkIHRvIGNoYW5nZSBpZiBQUk9CRV9BTkdMRSBjaGFuZ2VzXHJcbiAgICAgICAgeDogLTkuNSxcclxuICAgICAgICB5OiAtNVxyXG4gICAgICB9ICkgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHJlZFByb2JlTm9kZSA9IG5ldyBSZWN0YW5nbGUoIC0yLCAtMiwgNCwgNCwgeyAvLyB0aGUgaGl0IGFyZWFcclxuICAgICAgZmlsbDogQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5zaG93Vm9sdG1ldGVyU2FtcGxlUG9pbnRzID8gQ29sb3IuUkVEIDogbnVsbCxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBJbWFnZSggcHJvYmVSZWRfcG5nLCB7XHJcbiAgICAgICAgc2NhbGU6IFBST0JFX1NDQUxFLFxyXG4gICAgICAgIHJvdGF0aW9uOiAtUFJPQkVfQU5HTEUsXHJcblxyXG4gICAgICAgIC8vIERldGVybWluZWQgZW1waXJpY2FsbHkgYnkgc2hvd2luZyB0aGUgcHJvYmUgaG90IHNwb3QgYW5kIHpvb21pbmcgaW4gYnkgYSBmYWN0b3Igb2YgMiBpblxyXG4gICAgICAgIC8vIENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRNb2RlbC4gIFdpbGwgbmVlZCB0byBjaGFuZ2UgaWYgUFJPQkVfQU5HTEUgY2hhbmdlc1xyXG4gICAgICAgIHg6IC0xMSxcclxuICAgICAgICB5OiArNFxyXG4gICAgICB9ICkgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERpc3BsYXlzIHRoZSB2b2x0YWdlIHJlYWRpbmdcclxuICAgIGNvbnN0IHZvbHRhZ2VSZWFkb3V0UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXHJcbiAgICAgICAgdm9sdG1ldGVyLnZvbHRhZ2VQcm9wZXJ0eSxcclxuICAgICAgICBDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncy52b2x0YWdlVW5pdHNTdHJpbmdQcm9wZXJ0eVxyXG4gICAgICBdLCB2b2x0YWdlID0+XHJcbiAgICAgICAgdm9sdGFnZSA9PT0gbnVsbCA/IE1hdGhTeW1ib2xzLk5PX1ZBTFVFIDogQ0NLQ1V0aWxzLmNyZWF0ZVZvbHRhZ2VSZWFkb3V0KCB2b2x0YWdlICksIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Byb2JlUmVhZG91dFRleHQnICkuY3JlYXRlVGFuZGVtKCBUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogU3RyaW5nSU9cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBwcm9iZVRleHRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdm9sdGFnZVN0cmluZ1Byb3BlcnR5IF0sIHZvbHRhZ2VTdHJpbmcgPT5cclxuICAgICAgICBvcHRpb25zLnNob3dQaGV0aW9JbmRleCA/IHZvbHRhZ2VTdHJpbmcgKyAnICcgKyB2b2x0bWV0ZXIucGhldGlvSW5kZXggOiB2b2x0YWdlU3RyaW5nLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcm9iZVRpdGxlVGV4dCcgKS5jcmVhdGVUYW5kZW0oIFRleHQuU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBTdHJpbmdJT1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHByb2JlVGV4dE5vZGUgPSBuZXcgUHJvYmVUZXh0Tm9kZShcclxuICAgICAgdm9sdGFnZVJlYWRvdXRQcm9wZXJ0eSwgb3B0aW9ucy5zaG93UmVzdWx0c1Byb3BlcnR5LCBwcm9iZVRleHRQcm9wZXJ0eSxcclxuXHJcbiAgICAgIC8vIE5vIG5lZWQgZm9yIGFuIGV4dHJhIGxldmVsIG9mIG5lc3RpbmcgaW4gdGhlIHRhbmRlbSB0cmVlLCBzaW5jZSB0aGF0IGlzIGp1c3QgYW4gaW1wbGVtZW50YXRpb24gZGV0YWlsXHJcbiAgICAgIC8vIGFuZCBub3QgYSBmZWF0dXJlXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLCB7XHJcbiAgICAgICAgY2VudGVyWDogdm9sdG1ldGVyQm9keV9wbmdbIDAgXS53aWR0aCAvIDIsXHJcbiAgICAgICAgY2VudGVyWTogdm9sdG1ldGVyQm9keV9wbmdbIDAgXS5oZWlnaHQgLyAyXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBib2R5Tm9kZSA9IG5ldyBJbWFnZSggdm9sdG1ldGVyQm9keV9wbmcsIHtcclxuICAgICAgc2NhbGU6IFNDQUxFLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgY2hpbGRyZW46IFsgcHJvYmVUZXh0Tm9kZSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgVmVjdG9yMlByb3BlcnR5IHdpdGggYSBuZXcgVmVjdG9yMiBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uLlxyXG4gICAgICogQHBhcmFtIFt4XVxyXG4gICAgICogQHBhcmFtIFt5XVxyXG4gICAgICovXHJcbiAgICBjb25zdCBjcmVhdGVWZWN0b3IyUHJvcGVydHkgPSBmdW5jdGlvbiggeCA9IDAsIHkgPSAwICkge1xyXG4gICAgICByZXR1cm4gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIHgsIHkgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBibGFja1dpcmVCb2R5UG9zaXRpb25Qcm9wZXJ0eSA9IGNyZWF0ZVZlY3RvcjJQcm9wZXJ0eSgpO1xyXG4gICAgY29uc3QgYmxhY2tXaXJlUHJvYmVQb3NpdGlvblByb3BlcnR5ID0gY3JlYXRlVmVjdG9yMlByb3BlcnR5KCk7XHJcbiAgICBjb25zdCBibGFja1dpcmVOb2RlID0gbmV3IFdpcmVOb2RlKFxyXG4gICAgICBibGFja1dpcmVCb2R5UG9zaXRpb25Qcm9wZXJ0eSwgY3JlYXRlVmVjdG9yMlByb3BlcnR5KCAtQ09OVFJPTF9QT0lOVF9YLCBDT05UUk9MX1BPSU5UX1kxICksXHJcbiAgICAgIGJsYWNrV2lyZVByb2JlUG9zaXRpb25Qcm9wZXJ0eSwgY3JlYXRlVmVjdG9yMlByb3BlcnR5KCAtQ09OVFJPTF9QT0lOVF9YLCBDT05UUk9MX1BPSU5UX1kyICksIHtcclxuICAgICAgICBzdHJva2U6IENvbG9yLkJMQUNLLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMyxcclxuICAgICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCByZWRXaXJlQm9keVBvc2l0aW9uUHJvcGVydHkgPSBjcmVhdGVWZWN0b3IyUHJvcGVydHkoKTtcclxuICAgIGNvbnN0IHJlZFdpcmVQcm9iZVBvc2l0aW9uUHJvcGVydHkgPSBjcmVhdGVWZWN0b3IyUHJvcGVydHkoKTtcclxuICAgIGNvbnN0IHJlZFdpcmVOb2RlID0gbmV3IFdpcmVOb2RlKFxyXG4gICAgICByZWRXaXJlQm9keVBvc2l0aW9uUHJvcGVydHksIGNyZWF0ZVZlY3RvcjJQcm9wZXJ0eSggQ09OVFJPTF9QT0lOVF9YLCBDT05UUk9MX1BPSU5UX1kxICksXHJcbiAgICAgIHJlZFdpcmVQcm9iZVBvc2l0aW9uUHJvcGVydHksIGNyZWF0ZVZlY3RvcjJQcm9wZXJ0eSggQ09OVFJPTF9QT0lOVF9YLCBDT05UUk9MX1BPSU5UX1kyICksIHtcclxuICAgICAgICBzdHJva2U6IENvbG9yLlJFRCxcclxuICAgICAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdm9sdG1ldGVyIGJvZHkgbW92ZXMsIHVwZGF0ZSB0aGUgbm9kZSBhbmQgd2lyZXNcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgdm9sdG1ldGVyLmJvZHlQb3NpdGlvblByb3BlcnR5LCB2b2x0bWV0ZXIuaXNBY3RpdmVQcm9wZXJ0eSBdLCAoIGJvZHlQb3NpdGlvbiwgaXNBY3RpdmUgKSA9PiB7XHJcblxyXG4gICAgICAvLyBEcmFnIHRoZSBib2R5IGJ5IHRoZSBjZW50ZXJcclxuICAgICAgYm9keU5vZGUuY2VudGVyID0gYm9keVBvc2l0aW9uO1xyXG5cclxuICAgICAgYmxhY2tXaXJlQm9keVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBib2R5Tm9kZS5jZW50ZXJCb3R0b20ucGx1c1hZKCAtUFJPQkVfQ09OTkVDVElPTl9QT0lOVF9EWCwgUFJPQkVfQ09OTkVDVElPTl9QT0lOVF9EWSApO1xyXG4gICAgICByZWRXaXJlQm9keVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBib2R5Tm9kZS5jZW50ZXJCb3R0b20ucGx1c1hZKCBQUk9CRV9DT05ORUNUSU9OX1BPSU5UX0RYLCBQUk9CRV9DT05ORUNUSU9OX1BPSU5UX0RZICk7XHJcblxyXG4gICAgICAvLyBXaGVuIGRyYWdnaW5nIG91dCBvZiB0aGUgdG9vbGJveCwgdGhlIHByb2JlcyBtb3ZlIHdpdGggdGhlIGJvZHlcclxuICAgICAgaWYgKCB2b2x0bWV0ZXIuaXNEcmFnZ2luZ1Byb2Jlc1dpdGhCb2R5UHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgY29uc3QgcHJvYmVZID0gLTMwIC0gYm9keU5vZGUuaGVpZ2h0IC8gMjtcclxuICAgICAgICBjb25zdCBwcm9iZU9mZnNldFggPSA3ODtcclxuXHJcbiAgICAgICAgY29uc3QgY29uc3RyYWluID0gKCBwdDogVmVjdG9yMiApID0+IG9wdGlvbnMudmlzaWJsZUJvdW5kc1Byb3BlcnR5ID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy52aXNpYmxlQm91bmRzUHJvcGVydHkudmFsdWUuZXJvZGVkKCBDQ0tDQ29uc3RhbnRzLkRSQUdfQk9VTkRTX0VST1NJT04gKS5jbG9zZXN0UG9pbnRUbyggcHQgKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB0O1xyXG5cclxuICAgICAgICB2b2x0bWV0ZXIucmVkUHJvYmVQb3NpdGlvblByb3BlcnR5LnNldCggY29uc3RyYWluKCBib2R5UG9zaXRpb24ucGx1c1hZKCArcHJvYmVPZmZzZXRYLCBwcm9iZVkgKSApICk7XHJcbiAgICAgICAgdm9sdG1ldGVyLmJsYWNrUHJvYmVQb3NpdGlvblByb3BlcnR5LnNldCggY29uc3RyYWluKCBib2R5UG9zaXRpb24ucGx1c1hZKCAtcHJvYmVPZmZzZXRYLCBwcm9iZVkgKSApICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgbGlzdGVuZXJzIGZvciB0aGUgbGluayBmdW5jdGlvbiB0byB1cGRhdGUgdGhlIHByb2JlIG5vZGUgYW5kIHdpcmUgd2hlbiBwcm9iZSBwb3NpdGlvbiBjaGFuZ2VzLlxyXG4gICAgICovXHJcbiAgICBjb25zdCBwcm9iZU1vdmVkQ2FsbGJhY2sgPSAoIHByb2JlTm9kZTogTm9kZSwgcHJvYmVQb3NpdGlvblByb3BlcnR5OiBWZWN0b3IyUHJvcGVydHksIHNpZ246IG51bWJlciApID0+IHtcclxuICAgICAgcmV0dXJuICggcHJvYmVQb3NpdGlvbjogVmVjdG9yMiApID0+IHtcclxuICAgICAgICBwcm9iZU5vZGUudHJhbnNsYXRpb24gPSBwcm9iZVBvc2l0aW9uO1xyXG5cclxuICAgICAgICAvLyBTYW1wbGVkIG1hbnVhbGx5LCB3aWxsIG5lZWQgdG8gY2hhbmdlIGlmIHByb2JlIGFuZ2xlIGNoYW5nZXNcclxuICAgICAgICBwcm9iZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwcm9iZU5vZGUuY2VudGVyQm90dG9tLnBsdXNYWSggMzIgKiBzaWduLCAtNCApO1xyXG4gICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBwcm9iZSBtb3ZlcywgdXBkYXRlIHRoZSBub2RlIGFuZCB3aXJlXHJcbiAgICB2b2x0bWV0ZXIucmVkUHJvYmVQb3NpdGlvblByb3BlcnR5LmxpbmsoIHByb2JlTW92ZWRDYWxsYmFjayggcmVkUHJvYmVOb2RlLCByZWRXaXJlUHJvYmVQb3NpdGlvblByb3BlcnR5LCArMSApICk7XHJcbiAgICB2b2x0bWV0ZXIuYmxhY2tQcm9iZVBvc2l0aW9uUHJvcGVydHkubGluayggcHJvYmVNb3ZlZENhbGxiYWNrKCBibGFja1Byb2JlTm9kZSwgYmxhY2tXaXJlUHJvYmVQb3NpdGlvblByb3BlcnR5LCAtMSApICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlci5hZGRDaGlsZCggYm9keU5vZGUgKTtcclxuICAgIHN1cGVyLmFkZENoaWxkKCBibGFja1dpcmVOb2RlICk7XHJcbiAgICBzdXBlci5hZGRDaGlsZCggYmxhY2tQcm9iZU5vZGUgKTtcclxuICAgIHN1cGVyLmFkZENoaWxkKCByZWRXaXJlTm9kZSApO1xyXG4gICAgc3VwZXIuYWRkQ2hpbGQoIHJlZFByb2JlTm9kZSApO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdE5vZGUgPSBjaXJjdWl0Tm9kZTtcclxuXHJcbiAgICB0aGlzLnZvbHRtZXRlciA9IHZvbHRtZXRlcjtcclxuICAgIHRoaXMucmVkUHJvYmVOb2RlID0gcmVkUHJvYmVOb2RlO1xyXG4gICAgdGhpcy5ibGFja1Byb2JlTm9kZSA9IGJsYWNrUHJvYmVOb2RlO1xyXG5cclxuICAgIC8vIEZvciB0aGUgcmVhbCB2ZXJzaW9uIChub3QgdGhlIGljb24pLCBhZGQgZHJhZyBsaXN0ZW5lcnMgYW5kIHVwZGF0ZSB2aXNpYmlsaXR5XHJcbiAgICBpZiAoICFvcHRpb25zLmlzSWNvbiApIHtcclxuXHJcbiAgICAgIC8vIFNob3cgdGhlIHZvbHRtZXRlciB3aGVuIGljb24gZHJhZ2dlZCBvdXQgb2YgdGhlIHRvb2xib3hcclxuICAgICAgdm9sdG1ldGVyLmlzQWN0aXZlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcywgJ3Zpc2libGUnICk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogR2V0cyBhIGRyYWcgaGFuZGxlciBmb3Igb25lIG9mIHRoZSBwcm9iZXMuXHJcbiAgICAgICAqL1xyXG4gICAgICBjb25zdCBjcmVhdGVQcm9iZURyYWdMaXN0ZW5lciA9ICggcG9zaXRpb25Qcm9wZXJ0eTogVmVjdG9yMlByb3BlcnR5LCB0YW5kZW06IFRhbmRlbSApID0+IHtcclxuICAgICAgICBjb25zdCBwcm9iZURyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgICBzdGFydDogKCkgPT4gdGhpcy5tb3ZlVG9Gcm9udCgpLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvYmVEcmFnTGlzdGVuZXInICksXHJcbiAgICAgICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgb3B0aW9ucy52aXNpYmxlQm91bmRzUHJvcGVydHkhIF0sICggdmlzaWJsZUJvdW5kczogQm91bmRzMiApID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpc2libGVCb3VuZHMuZXJvZGVkKCBDQ0tDQ29uc3RhbnRzLkRSQUdfQk9VTkRTX0VST1NJT04gKTtcclxuICAgICAgICAgIH0gKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICByZXR1cm4gcHJvYmVEcmFnTGlzdGVuZXI7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCByZWRQcm9iZURyYWdMaXN0ZW5lciA9IGNyZWF0ZVByb2JlRHJhZ0xpc3RlbmVyKCB2b2x0bWV0ZXIucmVkUHJvYmVQb3NpdGlvblByb3BlcnR5LCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWRQcm9iZURyYWdMaXN0ZW5lcicgKSApO1xyXG4gICAgICBjb25zdCBibGFja1Byb2JlRHJhZ0xpc3RlbmVyID0gY3JlYXRlUHJvYmVEcmFnTGlzdGVuZXIoIHZvbHRtZXRlci5ibGFja1Byb2JlUG9zaXRpb25Qcm9wZXJ0eSwgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmxhY2tQcm9iZURyYWdMaXN0ZW5lcicgKSApO1xyXG5cclxuICAgICAgdGhpcy5yZWRQcm9iZU5vZGUuYWRkSW5wdXRMaXN0ZW5lciggcmVkUHJvYmVEcmFnTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5ibGFja1Byb2JlTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBibGFja1Byb2JlRHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgICBjb25zdCBlcm9kZWRCb3VuZHNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgb3B0aW9ucy52aXNpYmxlQm91bmRzUHJvcGVydHkhIF0sICggdmlzaWJsZUJvdW5kczogQm91bmRzMiApID0+IHtcclxuICAgICAgICByZXR1cm4gdmlzaWJsZUJvdW5kcy5lcm9kZWQoIENDS0NDb25zdGFudHMuRFJBR19CT1VORFNfRVJPU0lPTiApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLmRyYWdIYW5kbGVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG5cclxuICAgICAgICBwb3NpdGlvblByb3BlcnR5OiB2b2x0bWV0ZXIuYm9keVBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInICksXHJcbiAgICAgICAgdXNlUGFyZW50T2Zmc2V0OiB0cnVlLFxyXG4gICAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogZXJvZGVkQm91bmRzUHJvcGVydHksXHJcbiAgICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcclxuICAgICAgICAgIHRoaXMubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgICAgdm9sdG1ldGVyLmRyb3BwZWRFbWl0dGVyLmVtaXQoIGJvZHlOb2RlLmdsb2JhbEJvdW5kcyApO1xyXG5cclxuICAgICAgICAgIC8vIEFmdGVyIGRyb3BwaW5nIGluIHRoZSBwbGF5IGFyZWEgdGhlIHByb2JlcyBtb3ZlIGluZGVwZW5kZW50bHkgb2YgdGhlIGJvZHlcclxuICAgICAgICAgIHZvbHRtZXRlci5pc0RyYWdnaW5nUHJvYmVzV2l0aEJvZHlQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gYWRkcyBzdXBwb3J0IGZvciB6b29tZWQgY29vcmRpbmF0ZSBmcmFtZSwgc2VlXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vaXNzdWVzLzMwMVxyXG4gICAgICAgIHRhcmdldE5vZGU6IHRoaXNcclxuICAgICAgfSApO1xyXG4gICAgICBlcm9kZWRCb3VuZHNQcm9wZXJ0eS5saW5rKCAoIGVyb2RlZEJvdW5kczogQm91bmRzMiApID0+IHtcclxuICAgICAgICB2b2x0bWV0ZXIucmVkUHJvYmVQb3NpdGlvblByb3BlcnR5LnNldCggZXJvZGVkQm91bmRzLmNsb3Nlc3RQb2ludFRvKCB2b2x0bWV0ZXIucmVkUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKTtcclxuICAgICAgICB2b2x0bWV0ZXIuYmxhY2tQcm9iZVBvc2l0aW9uUHJvcGVydHkuc2V0KCBlcm9kZWRCb3VuZHMuY2xvc2VzdFBvaW50VG8oIHZvbHRtZXRlci5ibGFja1Byb2JlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgICAgICAgdm9sdG1ldGVyLmJvZHlQb3NpdGlvblByb3BlcnR5LnNldCggZXJvZGVkQm91bmRzLmNsb3Nlc3RQb2ludFRvKCB2b2x0bWV0ZXIuYm9keVBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGJvZHlOb2RlLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuZHJhZ0hhbmRsZXIgKTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTdGFydGluZyBhdCB0aGUgdGlwLCBpdGVyYXRlIGRvd24gb3ZlciBzZXZlcmFsIHNhbXBsZXMgYW5kIHJldHVybiB0aGUgZmlyc3QgaGl0LCBpZiBhbnkuXHJcbiAgICAgICAqIEBwYXJhbSBwcm9iZU5vZGVcclxuICAgICAgICogQHBhcmFtIHByb2JlVGlwXHJcbiAgICAgICAqIEBwYXJhbSBzaWduIC0gdGhlIGRpcmVjdGlvbiB0aGUgcHJvYmUgaXMgcm90YXRlZFxyXG4gICAgICAgKiBAcmV0dXJucyAtIGlmIGNvbm5lY3RlZCByZXR1cm5zIFZvbHRhZ2VDb25uZWN0aW9uIG90aGVyd2lzZSBudWxsXHJcbiAgICAgICAqL1xyXG4gICAgICBjb25zdCBmaW5kQ29ubmVjdGlvbiA9ICggcHJvYmVOb2RlOiBOb2RlLCBwcm9iZVRpcDogVmVjdG9yMiwgc2lnbjogbnVtYmVyICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHByb2JlVGlwVmVjdG9yID0gVmVjdG9yMi5jcmVhdGVQb2xhciggVk9MVE1FVEVSX1BST0JFX1RJUF9MRU5HVEgsIHNpZ24gKiBWb2x0bWV0ZXJOb2RlLlBST0JFX0FOR0xFICsgTWF0aC5QSSAvIDIgKTtcclxuICAgICAgICBjb25zdCBwcm9iZVRpcFRhaWwgPSBwcm9iZVRpcC5wbHVzKCBwcm9iZVRpcFZlY3RvciApO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IFZPTFRNRVRFUl9OVU1CRVJfU0FNUExFX1BPSU5UUzsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3Qgc2FtcGxlUG9pbnQgPSBwcm9iZVRpcC5ibGVuZCggcHJvYmVUaXBUYWlsLCBpIC8gVk9MVE1FVEVSX05VTUJFUl9TQU1QTEVfUE9JTlRTICk7XHJcbiAgICAgICAgICBjb25zdCB2b2x0YWdlQ29ubmVjdGlvbiA9IGNpcmN1aXROb2RlIS5nZXRWb2x0YWdlQ29ubmVjdGlvbiggc2FtcGxlUG9pbnQgKTtcclxuXHJcbiAgICAgICAgICAvLyBGb3IgZGVidWdnaW5nLCBkZXBpY3QgdGhlIHBvaW50cyB3aGVyZSB0aGUgc2FtcGxpbmcgaGFwcGVuc1xyXG4gICAgICAgICAgaWYgKCBDQ0tDUXVlcnlQYXJhbWV0ZXJzLnNob3dWb2x0bWV0ZXJTYW1wbGVQb2ludHMgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RlLCB0aGVzZSBnZXQgZXJhc2VkIHdoZW4gY2hhbmdpbmcgYmV0d2VlbiBsaWZlbGlrZS9zY2hlbWF0aWNcclxuICAgICAgICAgICAgdGhpcy5jaXJjdWl0Tm9kZSEuYWRkQ2hpbGQoIG5ldyBSZWN0YW5nbGUoIC0xLCAtMSwgMiwgMiwge1xyXG4gICAgICAgICAgICAgIGZpbGw6IENvbG9yLkJMQUNLLFxyXG4gICAgICAgICAgICAgIHRyYW5zbGF0aW9uOiBzYW1wbGVQb2ludFxyXG4gICAgICAgICAgICB9ICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggdm9sdGFnZUNvbm5lY3Rpb24gKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2b2x0YWdlQ29ubmVjdGlvbjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogRGV0ZWN0aW9uIGZvciB2b2x0bWV0ZXIgcHJvYmUgKyBjaXJjdWl0IGludGVyc2VjdGlvbiBpcyBkb25lIGluIHRoZSB2aWV3IHNpbmNlIHZpZXcgYm91bmRzIGFyZSB1c2VkXHJcbiAgICAgICAqL1xyXG4gICAgICBjb25zdCB1cGRhdGVWb2x0bWV0ZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCB2b2x0bWV0ZXIuaXNBY3RpdmVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICAgIGNvbnN0IGJsYWNrQ29ubmVjdGlvbiA9IGZpbmRDb25uZWN0aW9uKCBibGFja1Byb2JlTm9kZSwgdm9sdG1ldGVyLmJsYWNrUHJvYmVQb3NpdGlvblByb3BlcnR5LmdldCgpLCArMSApO1xyXG4gICAgICAgICAgY29uc3QgcmVkQ29ubmVjdGlvbiA9IGZpbmRDb25uZWN0aW9uKCByZWRQcm9iZU5vZGUsIHZvbHRtZXRlci5yZWRQcm9iZVBvc2l0aW9uUHJvcGVydHkuZ2V0KCksIC0xICk7XHJcbiAgICAgICAgICBjb25zdCB2b2x0YWdlID0gdGhpcy5jaXJjdWl0Tm9kZSEuY2lyY3VpdC5nZXRWb2x0YWdlQmV0d2VlbkNvbm5lY3Rpb25zKCByZWRDb25uZWN0aW9uLCBibGFja0Nvbm5lY3Rpb24sIGZhbHNlICk7XHJcbiAgICAgICAgICB2b2x0bWV0ZXIuYmxhY2tDb25uZWN0aW9uUHJvcGVydHkuc2V0KCBibGFja0Nvbm5lY3Rpb24gKTtcclxuICAgICAgICAgIHZvbHRtZXRlci5yZWRDb25uZWN0aW9uUHJvcGVydHkuc2V0KCByZWRDb25uZWN0aW9uICk7XHJcbiAgICAgICAgICB2b2x0bWV0ZXIudm9sdGFnZVByb3BlcnR5LnZhbHVlID0gdm9sdGFnZTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIG1vZGVsIS5jaXJjdWl0LmNpcmN1aXRDaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlVm9sdG1ldGVyICk7XHJcbiAgICAgIHZvbHRtZXRlci5yZWRQcm9iZVBvc2l0aW9uUHJvcGVydHkubGluayggdXBkYXRlVm9sdG1ldGVyICk7XHJcbiAgICAgIHZvbHRtZXRlci5ibGFja1Byb2JlUG9zaXRpb25Qcm9wZXJ0eS5saW5rKCB1cGRhdGVWb2x0bWV0ZXIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmRyYWdIYW5kbGVyID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXaGVuIHJlbmRlcmVkIGFzIGFuIGljb24sIHRoZSB0b3VjaCBhcmVhIHNob3VsZCBzcGFuIHRoZSBib3VuZHMgKG5vIGdhcHMgYmV0d2VlbiBwcm9iZXMgYW5kIGJvZHkpXHJcbiAgICBpZiAoIG9wdGlvbnMuaXNJY29uICkge1xyXG4gICAgICB0aGlzLnRvdWNoQXJlYSA9IHRoaXMuYm91bmRzLmNvcHkoKTtcclxuICAgICAgdGhpcy5tb3VzZUFyZWEgPSB0aGlzLmJvdW5kcy5jb3B5KCk7XHJcbiAgICAgIHRoaXMuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggdm9sdG1ldGVyLCB7XHJcbiAgICAgIHRhbmRlbTogdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdG1ldGVyJyApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3J3YXJkIGEgZHJhZyBmcm9tIHRoZSB0b29sYm94IHRvIHRoZSBwbGF5IGFyZWEgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhcnREcmFnKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xyXG4gICAgdGhpcy5kcmFnSGFuZGxlciEucHJlc3MoIGV2ZW50ICk7XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnVm9sdG1ldGVyTm9kZScsIFZvbHRtZXRlck5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0scUNBQXFDO0FBQ2pFLE9BQU9DLGVBQWUsTUFBTSxxQ0FBcUM7QUFDakUsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxlQUFlLE1BQU0sb0NBQW9DO0FBQ2hFLE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsU0FBU0MsS0FBSyxFQUFFQyxZQUFZLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFtQ0MsU0FBUyxFQUFFQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQ25JLE9BQU9DLGNBQWMsTUFBTSxpQ0FBaUM7QUFDNUQsT0FBT0MsWUFBWSxNQUFNLCtCQUErQjtBQUN4RCxPQUFPQyxpQkFBaUIsTUFBTSxvQ0FBb0M7QUFDbEUsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjtBQUMvQyxPQUFPQyxtQkFBbUIsTUFBTSwyQkFBMkI7QUFDM0QsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjtBQUN2QyxPQUFPQyxtQ0FBbUMsTUFBTSwyQ0FBMkM7QUFDM0YsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBQzdFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFJOUMsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUVqRCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBRWpFLE9BQU9DLFNBQVMsTUFBTSxvQ0FBb0M7QUFDMUQsT0FBT0MsUUFBUSxNQUFNLHNDQUFzQztBQUMzRCxPQUFPQyxTQUFTLE1BQU0sK0JBQStCO0FBRXJELE1BQU1DLHFCQUFxQixHQUFHUixtQ0FBbUMsQ0FBQ1EscUJBQXFCOztBQUV2RjtBQUNBLE1BQU1DLDBCQUEwQixHQUFHLEVBQUUsQ0FB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