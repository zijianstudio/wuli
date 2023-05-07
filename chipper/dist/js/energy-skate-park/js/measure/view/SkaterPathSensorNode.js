// Copyright 2018-2023, University of Colorado Boulder

/**
 * The sensor that reads information from the samples along the skater path. Includes the body, wire, and sensor. The
 * body is stationary and the sensor can be dragged to sample positions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ProbeNode from '../../../../scenery-phet/js/ProbeNode.js';
import WireNode from '../../../../scenery-phet/js/WireNode.js';
import { AlignGroup, DragListener, HBox, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import EnergySkateParkConstants from '../../common/EnergySkateParkConstants.js';
import EnergySkateParkColorScheme from '../../common/view/EnergySkateParkColorScheme.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
const energyEnergyString = EnergySkateParkStrings.energies.energyStringProperty;
const energyJoulesPatternString = EnergySkateParkStrings.pathSensor.energyJoulesPatternStringProperty;
const energyKineticString = EnergySkateParkStrings.energies.kineticStringProperty;
const energyPotentialString = EnergySkateParkStrings.energies.potentialStringProperty;
const energyThermalString = EnergySkateParkStrings.energies.thermalStringProperty;
const energyTotalString = EnergySkateParkStrings.energies.totalStringProperty;
const heightMetersPatternString = EnergySkateParkStrings.pathSensor.heightMetersPatternStringProperty;
const speedMetersPerSecondPatternString = EnergySkateParkStrings.pathSensor.speedMetersPerSecondPatternStringProperty;

// constants
const TITLE_CONTENT_SPACING = 5.5; // spacing between the "Energy" title and the rest of the content
const LABEL_VALUE_SPACING = 5.5; // spacing between label text and the value readout rectangle
const PROBE_READOUT_SPACING = 5; // spacing between the probe and the height/speed readouts
const LAYOUT_SPACING = 2;
const TEXT_COLOR = 'white';
const TITLE_FONT = new PhetFont(16);
const LABEL_FONT = new PhetFont(15.5);
const ENTRY_MAX_WIDTH = 75;

// arbitrary range for energies, but required so that this can use NumberDisplay. With this value, the width of the
// NumberDisplay looks good and if released from within dev bounds, the energy will never get this large.
const ENERGY_RANGE = new Range(-20000, 20000);

// offset so that the center of the probe aligns with sample positions
const PROBE_CENTER_OFFSET = new Vector2(5.5, 0);
const SENSOR_COLOR = 'rgb( 103, 80, 113 )';

// max distance between sample and probe center for the sample to be displayed, in view coordinates
const PROBE_THRESHOLD_DISTANCE = 10;
class SkaterPathSensorNode extends Node {
  /**
   * @param {ObservableArrayDef.<EnergySkateParkDataSample>} samples
   * @param {Vector2Property} sensorProbePositionProperty
   * @param {Vector2Property} sensorBodyPositionProperty
   * @param {Property.<Bounds2>} modelBoundsProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {EnergySkateParkControlPanel} controlPanel - so the readout doesn't occlude control panel bounds
   * @param {Object} [options]
   */
  constructor(samples, sensorProbePositionProperty, sensorBodyPositionProperty, modelBoundsProperty, modelViewTransform, controlPanel, options) {
    options = merge({
      // prevent block fitting so that things don't jiggle as the probe moves, see
      preventFit: true
    }, options);
    super(options);

    // @private - so the height speed readout doesn't occlude this
    this.screenViewControlPanel = controlPanel;
    this.modelViewTransform = modelViewTransform;
    this.samples = samples;

    // labels and value rectangles are in the same align group so that all entries have same width and height for
    // layout
    const alignGroup = new AlignGroup({
      matchHorizontal: false
    });
    const kineticLabelBox = SkaterPathSensorNode.createLabelBox(alignGroup, energyKineticString);
    const potentialLabelBox = SkaterPathSensorNode.createLabelBox(alignGroup, energyPotentialString);
    const thermalLabelBox = SkaterPathSensorNode.createLabelBox(alignGroup, energyThermalString);
    const totalLabelBox = SkaterPathSensorNode.createLabelBox(alignGroup, energyTotalString);

    // label for the probe
    const energyLabel = new Text(energyEnergyString, {
      font: TITLE_FONT,
      fill: TEXT_COLOR,
      maxWidth: 90
    });

    // @private {Property.<number|null> for the NumberDisplays, null unless probe is over a skater sample
    const validationOptions = {
      valueType: [null, 'number']
    };
    this.kineticValueProperty = new Property(null, validationOptions);
    this.potentialValueProperty = new Property(null, validationOptions);
    this.thermalValueProperty = new Property(null, validationOptions);
    this.totalValueProperty = new Property(null, validationOptions);

    // NumberDisplays for the body of the sensor, wrapped in an AlignBox
    this.kineticRectangleBox = SkaterPathSensorNode.createReadoutBox(alignGroup, this.kineticValueProperty);
    this.potentialRectangleBox = SkaterPathSensorNode.createReadoutBox(alignGroup, this.potentialValueProperty);
    this.thermalRectangleBox = SkaterPathSensorNode.createReadoutBox(alignGroup, this.thermalValueProperty);
    this.totalRectangleBox = SkaterPathSensorNode.createReadoutBox(alignGroup, this.totalValueProperty);

    // @private - Height and speed are read to the right of the probe in a transparent panel for enhanced
    // visibility. We want the panel to resize as the text changes for different skater samples
    this.heightReadout = new Text('', {
      font: LABEL_FONT
    });
    this.speedReadout = new Text('', {
      font: LABEL_FONT
    });
    this.heightSpeedVBox = new VBox({
      children: [this.heightReadout, this.speedReadout],
      align: 'left'
    });
    this.heightSpeedRectangle = new Rectangle(this.heightSpeedVBox.bounds, {
      fill: EnergySkateParkColorScheme.transparentPanelFill
    });
    this.heightSpeedRectangle.addChild(this.heightSpeedVBox);

    // layout - labels horizontally aligned with readouts in a VBox
    const content = new VBox({
      children: [energyLabel, new HBox({
        children: [new VBox({
          align: 'left',
          children: [kineticLabelBox, potentialLabelBox, thermalLabelBox, totalLabelBox],
          spacing: LAYOUT_SPACING
        }), new VBox({
          children: [this.kineticRectangleBox, this.potentialRectangleBox, this.thermalRectangleBox, this.totalRectangleBox],
          spacing: LAYOUT_SPACING
        })],
        spacing: LABEL_VALUE_SPACING
      })],
      spacing: TITLE_CONTENT_SPACING
    });

    // the body is a rounded rectangle
    const body = new Rectangle(content.bounds.dilated(7), EnergySkateParkConstants.PANEL_CORNER_RADIUS, EnergySkateParkConstants.PANEL_CORNER_RADIUS, {
      fill: SENSOR_COLOR,
      stroke: 'rgb(210,210,210)',
      lineWidth: 2
    });
    body.addChild(content);
    sensorBodyPositionProperty.link(bodyPosition => {
      body.leftTop = modelViewTransform.modelToViewPosition(bodyPosition);
    });

    // the probe
    this.probeNode = new ProbeNode({
      scale: 0.5,
      rotation: Math.PI / 2,
      color: SENSOR_COLOR,
      sensorTypeFunction: ProbeNode.crosshairs(),
      center: modelViewTransform.modelToViewPosition(sensorProbePositionProperty.get()),
      cursor: 'pointer'
    });
    sensorProbePositionProperty.link(position => {
      this.probeNode.translation = modelViewTransform.modelToViewPosition(position);
    });

    // points and control points for the wire
    const p1Property = new DerivedProperty([sensorBodyPositionProperty], bodyPosition => {
      return body.getCenterBottom().minusXY(0, 5);
    });
    const normal1Property = new DerivedProperty([sensorProbePositionProperty, sensorBodyPositionProperty], sensorPosition => {
      // changes with the probe position so the wire looks like it has slack as it gets longer
      const viewPosition = modelViewTransform.modelToViewPosition(sensorPosition);
      const distanceToBody = viewPosition.minus(p1Property.get());
      return new Vector2(distanceToBody.x / 3, Math.max(distanceToBody.y, body.height * 2));
    });
    const p2Property = new DerivedProperty([sensorProbePositionProperty], sensorPosition => {
      // calculate the left of the probe in view coordinates
      const viewPosition = modelViewTransform.modelToViewPosition(sensorPosition);
      const viewWidth = this.probeNode.width;
      return viewPosition.minusXY(viewWidth / 2, 0);
    });
    const normal2Property = new Vector2Property(new Vector2(-25, 0));
    const wireNode = new WireNode(p1Property, normal1Property, p2Property, normal2Property, {
      lineWidth: 4
    });

    // wire node behind body so the connection point where wire and body meet are clean
    this.addChild(wireNode);
    this.addChild(body);
    this.addChild(this.probeNode);
    this.addChild(this.heightSpeedRectangle);

    // @private - {EnergySkateParkDataSample|null} - the skater sample currently being inspected, reference so we can un-inspect
    // without looping through all samples
    this.inspectedSample = null;
    this.boundUpdateSensorDisplay = this.updateSensorDisplay.bind(this);

    // display the inspected sample, which could change if the sensor is being dragged, or if a sample is added/removed
    // from under the sensor
    sensorProbePositionProperty.link(this.boundUpdateSensorDisplay);
    samples.addItemRemovedListener(this.boundUpdateSensorDisplay);
    samples.addItemAddedListener(this.boundUpdateSensorDisplay);

    // add a drag listener to the probe body
    this.probeNode.addInputListener(new DragListener({
      transform: modelViewTransform,
      positionProperty: sensorProbePositionProperty,
      dragBoundsProperty: modelBoundsProperty,
      tandem: options.tandem.createTandem('dragListener')
    }));
  }

  /**
   * Update the sensor display, showing information about the inspected sample if one is underneath the sensor. If
   * no sample is under the sensor, the display is cleared.
   *
   * @private
   */
  updateSensorDisplay() {
    let sampleToDisplay = null;

    // finds sample under the sensor, or the closest one to the center point if there are multiple
    const probeCenterWithOffset = this.probeNode.getCenter().plus(PROBE_CENTER_OFFSET);
    const viewProbePoint = this.localToParentPoint(probeCenterWithOffset);
    let minDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.samples.length; i++) {
      const sampleViewPoint = this.modelViewTransform.modelToViewPosition(this.samples.get(i).position);
      const distanceToSample = Vector2.getDistanceBetweenVectors(sampleViewPoint, viewProbePoint);
      if (distanceToSample < PROBE_THRESHOLD_DISTANCE && distanceToSample < minDistance) {
        sampleToDisplay = this.samples.get(i);
        minDistance = distanceToSample;
      }
    }
    if (sampleToDisplay) {
      this.displayState(sampleToDisplay);

      // update the display whenever sample energies update, listener removed in clearDisplay
      this.updateDisplayListener = this.displayState.bind(this, sampleToDisplay);
      sampleToDisplay.updatedEmitter.addListener(this.updateDisplayListener);
    } else if (this.inspectedSample) {
      this.clearDisplay(this.inspectedSample);
    }
  }

  /**
   * Display values associated with a sample of skater state.
   * @private
   * @param  {EnergySkateParkDataSample} dataSample
   */
  displayState(dataSample) {
    if (this.inspectedSample) {
      this.inspectedSample.inspectedProperty.set(false);
    }
    this.inspectedSample = dataSample;
    dataSample.inspectedProperty.set(true);

    // set values for display
    this.kineticValueProperty.value = dataSample.kineticEnergy;
    this.potentialValueProperty.value = dataSample.potentialEnergy;
    this.thermalValueProperty.value = dataSample.thermalEnergy;
    this.totalValueProperty.value = dataSample.totalEnergy;

    // set values for height and speed readout
    this.heightReadout.string = StringUtils.fillIn(heightMetersPatternString, {
      value: this.formatValue(dataSample.position.y - dataSample.referenceHeight)
    });
    this.speedReadout.string = StringUtils.fillIn(speedMetersPerSecondPatternString, {
      value: this.formatValue(dataSample.speed)
    });
    this.heightSpeedRectangle.visible = true;
    this.positionReadouts(dataSample);
  }

  /**
   * Position and sizes the height/speed readout which appears to the right of the probe, unless that would
   * occlude the screen view control panel
   *
   * @private
   */
  positionReadouts(dataSample) {
    this.heightSpeedRectangle.setRectBounds(this.heightSpeedVBox.bounds);
    this.heightSpeedRectangle.leftCenter = this.probeNode.rightCenter.plusXY(PROBE_READOUT_SPACING, 0);

    // determine occlusion case from position of the sample point rather than the probe position so that
    // the display doesn't move around when measuring a single point
    const spacing = this.heightSpeedRectangle.width + this.probeNode.width / 2;
    const sampleViewPoint = this.modelViewTransform.modelToViewPosition(dataSample.position);
    if (Math.abs(sampleViewPoint.x - this.screenViewControlPanel.left) < spacing) {
      this.heightSpeedRectangle.leftTop = this.probeNode.leftBottom.plusXY(0, PROBE_READOUT_SPACING);
    }
  }

  /**
   * Formats values in the height/speed display adjacent to the sensor when a data
   * point is under the wand.
   * @public
   *
   * @param  {number} value
   * @returns {string}
   */
  formatValue(value) {
    return Utils.toFixed(value, 2);
  }

  /**
   * Clear all values in the displays.
   * @private
   *
   * @param {EnergySkateParkDataSample} dataSample
   */
  clearDisplay(dataSample) {
    // setting Properties to null will show MathSymbols.NO_VALUE in NumberDisplay
    this.kineticValueProperty.value = null;
    this.potentialValueProperty.value = null;
    this.thermalValueProperty.value = null;
    this.totalValueProperty.value = null;
    assert && assert(this.updateDisplayListener, `listener not attached to dataSample emitter,
       dataSample: ${dataSample},
       this.inspectedSample: ${this.inspectedSample}`, `update listenerL:  ${this.updateDisplayListener}`);
    this.inspectedSample.updatedEmitter.removeListener(this.updateDisplayListener);
    this.inspectedSample = null;
    this.updateDisplayListener = null;
    dataSample.inspectedProperty.set(false);
    this.heightSpeedRectangle.visible = false;
  }

  /**
   * Create label text and wrap with an AlignBox so that all labels and readouts have the same dimensions for layout.
   * @private
   *
   * @param  {AlignGroup} alignGroup
   * @param  {string} labelString
   * @returns {AlignBox}
   */
  static createLabelBox(alignGroup, labelString) {
    const labelText = new Text(labelString, {
      fill: TEXT_COLOR,
      font: LABEL_FONT,
      maxWidth: ENTRY_MAX_WIDTH
    });
    return alignGroup.createBox(labelText, {
      xAlign: 'left'
    });
  }

  /**
   * Create a rectangle to contain value readouts, wrapped in an align box so that labels and this rectangle all
   * have the same dimensions for layout purposes.
   * @private
   *
   * @param {AlignGroup} alignGroup
   * @param {NumberProperty} valueProperty
   * @returns {AlignBox}
   */
  static createReadoutBox(alignGroup, valueProperty) {
    const numberDisplay = new NumberDisplay(valueProperty, ENERGY_RANGE, {
      backgroundStroke: 'black',
      backgroundFill: EnergySkateParkColorScheme.panelFill,
      cornerRadius: 3,
      textOptions: {
        font: LABEL_FONT,
        maxWidth: ENTRY_MAX_WIDTH
      },
      decimalPlaces: 1,
      minBackgroundWidth: 68,
      // determined by inspection, in addition to ENERGY_RANGE because the range is arbitrary
      valuePattern: energyJoulesPatternString,
      // these value displays get smaller than their cordner radius with very long
      // strings, so we will always use full height for consistent layout
      useFullHeight: true,
      // when there are no values, hide units
      noValuePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,
      noValueAlign: 'center'
    });
    return alignGroup.createBox(numberDisplay, {
      xAlign: 'right'
    });
  }
}
energySkatePark.register('SkaterPathSensorNode', SkaterPathSensorNode);
export default SkaterPathSensorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIk51bWJlckRpc3BsYXkiLCJQaGV0Rm9udCIsIlByb2JlTm9kZSIsIldpcmVOb2RlIiwiQWxpZ25Hcm91cCIsIkRyYWdMaXN0ZW5lciIsIkhCb3giLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIlZCb3giLCJTdW5Db25zdGFudHMiLCJFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMiLCJFbmVyZ3lTa2F0ZVBhcmtDb2xvclNjaGVtZSIsImVuZXJneVNrYXRlUGFyayIsIkVuZXJneVNrYXRlUGFya1N0cmluZ3MiLCJlbmVyZ3lFbmVyZ3lTdHJpbmciLCJlbmVyZ2llcyIsImVuZXJneVN0cmluZ1Byb3BlcnR5IiwiZW5lcmd5Sm91bGVzUGF0dGVyblN0cmluZyIsInBhdGhTZW5zb3IiLCJlbmVyZ3lKb3VsZXNQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJlbmVyZ3lLaW5ldGljU3RyaW5nIiwia2luZXRpY1N0cmluZ1Byb3BlcnR5IiwiZW5lcmd5UG90ZW50aWFsU3RyaW5nIiwicG90ZW50aWFsU3RyaW5nUHJvcGVydHkiLCJlbmVyZ3lUaGVybWFsU3RyaW5nIiwidGhlcm1hbFN0cmluZ1Byb3BlcnR5IiwiZW5lcmd5VG90YWxTdHJpbmciLCJ0b3RhbFN0cmluZ1Byb3BlcnR5IiwiaGVpZ2h0TWV0ZXJzUGF0dGVyblN0cmluZyIsImhlaWdodE1ldGVyc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInNwZWVkTWV0ZXJzUGVyU2Vjb25kUGF0dGVyblN0cmluZyIsInNwZWVkTWV0ZXJzUGVyU2Vjb25kUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiVElUTEVfQ09OVEVOVF9TUEFDSU5HIiwiTEFCRUxfVkFMVUVfU1BBQ0lORyIsIlBST0JFX1JFQURPVVRfU1BBQ0lORyIsIkxBWU9VVF9TUEFDSU5HIiwiVEVYVF9DT0xPUiIsIlRJVExFX0ZPTlQiLCJMQUJFTF9GT05UIiwiRU5UUllfTUFYX1dJRFRIIiwiRU5FUkdZX1JBTkdFIiwiUFJPQkVfQ0VOVEVSX09GRlNFVCIsIlNFTlNPUl9DT0xPUiIsIlBST0JFX1RIUkVTSE9MRF9ESVNUQU5DRSIsIlNrYXRlclBhdGhTZW5zb3JOb2RlIiwiY29uc3RydWN0b3IiLCJzYW1wbGVzIiwic2Vuc29yUHJvYmVQb3NpdGlvblByb3BlcnR5Iiwic2Vuc29yQm9keVBvc2l0aW9uUHJvcGVydHkiLCJtb2RlbEJvdW5kc1Byb3BlcnR5IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY29udHJvbFBhbmVsIiwib3B0aW9ucyIsInByZXZlbnRGaXQiLCJzY3JlZW5WaWV3Q29udHJvbFBhbmVsIiwiYWxpZ25Hcm91cCIsIm1hdGNoSG9yaXpvbnRhbCIsImtpbmV0aWNMYWJlbEJveCIsImNyZWF0ZUxhYmVsQm94IiwicG90ZW50aWFsTGFiZWxCb3giLCJ0aGVybWFsTGFiZWxCb3giLCJ0b3RhbExhYmVsQm94IiwiZW5lcmd5TGFiZWwiLCJmb250IiwiZmlsbCIsIm1heFdpZHRoIiwidmFsaWRhdGlvbk9wdGlvbnMiLCJ2YWx1ZVR5cGUiLCJraW5ldGljVmFsdWVQcm9wZXJ0eSIsInBvdGVudGlhbFZhbHVlUHJvcGVydHkiLCJ0aGVybWFsVmFsdWVQcm9wZXJ0eSIsInRvdGFsVmFsdWVQcm9wZXJ0eSIsImtpbmV0aWNSZWN0YW5nbGVCb3giLCJjcmVhdGVSZWFkb3V0Qm94IiwicG90ZW50aWFsUmVjdGFuZ2xlQm94IiwidGhlcm1hbFJlY3RhbmdsZUJveCIsInRvdGFsUmVjdGFuZ2xlQm94IiwiaGVpZ2h0UmVhZG91dCIsInNwZWVkUmVhZG91dCIsImhlaWdodFNwZWVkVkJveCIsImNoaWxkcmVuIiwiYWxpZ24iLCJoZWlnaHRTcGVlZFJlY3RhbmdsZSIsImJvdW5kcyIsInRyYW5zcGFyZW50UGFuZWxGaWxsIiwiYWRkQ2hpbGQiLCJjb250ZW50Iiwic3BhY2luZyIsImJvZHkiLCJkaWxhdGVkIiwiUEFORUxfQ09STkVSX1JBRElVUyIsInN0cm9rZSIsImxpbmVXaWR0aCIsImxpbmsiLCJib2R5UG9zaXRpb24iLCJsZWZ0VG9wIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInByb2JlTm9kZSIsInNjYWxlIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJjb2xvciIsInNlbnNvclR5cGVGdW5jdGlvbiIsImNyb3NzaGFpcnMiLCJjZW50ZXIiLCJnZXQiLCJjdXJzb3IiLCJwb3NpdGlvbiIsInRyYW5zbGF0aW9uIiwicDFQcm9wZXJ0eSIsImdldENlbnRlckJvdHRvbSIsIm1pbnVzWFkiLCJub3JtYWwxUHJvcGVydHkiLCJzZW5zb3JQb3NpdGlvbiIsInZpZXdQb3NpdGlvbiIsImRpc3RhbmNlVG9Cb2R5IiwibWludXMiLCJ4IiwibWF4IiwieSIsImhlaWdodCIsInAyUHJvcGVydHkiLCJ2aWV3V2lkdGgiLCJ3aWR0aCIsIm5vcm1hbDJQcm9wZXJ0eSIsIndpcmVOb2RlIiwiaW5zcGVjdGVkU2FtcGxlIiwiYm91bmRVcGRhdGVTZW5zb3JEaXNwbGF5IiwidXBkYXRlU2Vuc29yRGlzcGxheSIsImJpbmQiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRJbnB1dExpc3RlbmVyIiwidHJhbnNmb3JtIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInNhbXBsZVRvRGlzcGxheSIsInByb2JlQ2VudGVyV2l0aE9mZnNldCIsImdldENlbnRlciIsInBsdXMiLCJ2aWV3UHJvYmVQb2ludCIsImxvY2FsVG9QYXJlbnRQb2ludCIsIm1pbkRpc3RhbmNlIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJpIiwibGVuZ3RoIiwic2FtcGxlVmlld1BvaW50IiwiZGlzdGFuY2VUb1NhbXBsZSIsImdldERpc3RhbmNlQmV0d2VlblZlY3RvcnMiLCJkaXNwbGF5U3RhdGUiLCJ1cGRhdGVEaXNwbGF5TGlzdGVuZXIiLCJ1cGRhdGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiY2xlYXJEaXNwbGF5IiwiZGF0YVNhbXBsZSIsImluc3BlY3RlZFByb3BlcnR5Iiwic2V0IiwidmFsdWUiLCJraW5ldGljRW5lcmd5IiwicG90ZW50aWFsRW5lcmd5IiwidGhlcm1hbEVuZXJneSIsInRvdGFsRW5lcmd5Iiwic3RyaW5nIiwiZmlsbEluIiwiZm9ybWF0VmFsdWUiLCJyZWZlcmVuY2VIZWlnaHQiLCJzcGVlZCIsInZpc2libGUiLCJwb3NpdGlvblJlYWRvdXRzIiwic2V0UmVjdEJvdW5kcyIsImxlZnRDZW50ZXIiLCJyaWdodENlbnRlciIsInBsdXNYWSIsImFicyIsImxlZnQiLCJsZWZ0Qm90dG9tIiwidG9GaXhlZCIsImFzc2VydCIsInJlbW92ZUxpc3RlbmVyIiwibGFiZWxTdHJpbmciLCJsYWJlbFRleHQiLCJjcmVhdGVCb3giLCJ4QWxpZ24iLCJ2YWx1ZVByb3BlcnR5IiwibnVtYmVyRGlzcGxheSIsImJhY2tncm91bmRTdHJva2UiLCJiYWNrZ3JvdW5kRmlsbCIsInBhbmVsRmlsbCIsImNvcm5lclJhZGl1cyIsInRleHRPcHRpb25zIiwiZGVjaW1hbFBsYWNlcyIsIm1pbkJhY2tncm91bmRXaWR0aCIsInZhbHVlUGF0dGVybiIsInVzZUZ1bGxIZWlnaHQiLCJub1ZhbHVlUGF0dGVybiIsIlZBTFVFX05BTUVEX1BMQUNFSE9MREVSIiwibm9WYWx1ZUFsaWduIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTa2F0ZXJQYXRoU2Vuc29yTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgc2Vuc29yIHRoYXQgcmVhZHMgaW5mb3JtYXRpb24gZnJvbSB0aGUgc2FtcGxlcyBhbG9uZyB0aGUgc2thdGVyIHBhdGguIEluY2x1ZGVzIHRoZSBib2R5LCB3aXJlLCBhbmQgc2Vuc29yLiBUaGVcclxuICogYm9keSBpcyBzdGF0aW9uYXJ5IGFuZCB0aGUgc2Vuc29yIGNhbiBiZSBkcmFnZ2VkIHRvIHNhbXBsZSBwb3NpdGlvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBOdW1iZXJEaXNwbGF5IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJEaXNwbGF5LmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBQcm9iZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1Byb2JlTm9kZS5qcyc7XHJcbmltcG9ydCBXaXJlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvV2lyZU5vZGUuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkdyb3VwLCBEcmFnTGlzdGVuZXIsIEhCb3gsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBTdW5Db25zdGFudHMgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1N1bkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0VuZXJneVNrYXRlUGFya0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtDb2xvclNjaGVtZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FbmVyZ3lTa2F0ZVBhcmtDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBlbmVyZ3lTa2F0ZVBhcmsgZnJvbSAnLi4vLi4vZW5lcmd5U2thdGVQYXJrLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya1N0cmluZ3MgZnJvbSAnLi4vLi4vRW5lcmd5U2thdGVQYXJrU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBlbmVyZ3lFbmVyZ3lTdHJpbmcgPSBFbmVyZ3lTa2F0ZVBhcmtTdHJpbmdzLmVuZXJnaWVzLmVuZXJneVN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBlbmVyZ3lKb3VsZXNQYXR0ZXJuU3RyaW5nID0gRW5lcmd5U2thdGVQYXJrU3RyaW5ncy5wYXRoU2Vuc29yLmVuZXJneUpvdWxlc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgZW5lcmd5S2luZXRpY1N0cmluZyA9IEVuZXJneVNrYXRlUGFya1N0cmluZ3MuZW5lcmdpZXMua2luZXRpY1N0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBlbmVyZ3lQb3RlbnRpYWxTdHJpbmcgPSBFbmVyZ3lTa2F0ZVBhcmtTdHJpbmdzLmVuZXJnaWVzLnBvdGVudGlhbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBlbmVyZ3lUaGVybWFsU3RyaW5nID0gRW5lcmd5U2thdGVQYXJrU3RyaW5ncy5lbmVyZ2llcy50aGVybWFsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGVuZXJneVRvdGFsU3RyaW5nID0gRW5lcmd5U2thdGVQYXJrU3RyaW5ncy5lbmVyZ2llcy50b3RhbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBoZWlnaHRNZXRlcnNQYXR0ZXJuU3RyaW5nID0gRW5lcmd5U2thdGVQYXJrU3RyaW5ncy5wYXRoU2Vuc29yLmhlaWdodE1ldGVyc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlZWRNZXRlcnNQZXJTZWNvbmRQYXR0ZXJuU3RyaW5nID0gRW5lcmd5U2thdGVQYXJrU3RyaW5ncy5wYXRoU2Vuc29yLnNwZWVkTWV0ZXJzUGVyU2Vjb25kUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRJVExFX0NPTlRFTlRfU1BBQ0lORyA9IDUuNTsgLy8gc3BhY2luZyBiZXR3ZWVuIHRoZSBcIkVuZXJneVwiIHRpdGxlIGFuZCB0aGUgcmVzdCBvZiB0aGUgY29udGVudFxyXG5jb25zdCBMQUJFTF9WQUxVRV9TUEFDSU5HID0gNS41OyAvLyBzcGFjaW5nIGJldHdlZW4gbGFiZWwgdGV4dCBhbmQgdGhlIHZhbHVlIHJlYWRvdXQgcmVjdGFuZ2xlXHJcbmNvbnN0IFBST0JFX1JFQURPVVRfU1BBQ0lORyA9IDU7IC8vIHNwYWNpbmcgYmV0d2VlbiB0aGUgcHJvYmUgYW5kIHRoZSBoZWlnaHQvc3BlZWQgcmVhZG91dHNcclxuY29uc3QgTEFZT1VUX1NQQUNJTkcgPSAyO1xyXG5jb25zdCBURVhUX0NPTE9SID0gJ3doaXRlJztcclxuY29uc3QgVElUTEVfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTYgKTtcclxuY29uc3QgTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTUuNSApO1xyXG5jb25zdCBFTlRSWV9NQVhfV0lEVEggPSA3NTtcclxuXHJcbi8vIGFyYml0cmFyeSByYW5nZSBmb3IgZW5lcmdpZXMsIGJ1dCByZXF1aXJlZCBzbyB0aGF0IHRoaXMgY2FuIHVzZSBOdW1iZXJEaXNwbGF5LiBXaXRoIHRoaXMgdmFsdWUsIHRoZSB3aWR0aCBvZiB0aGVcclxuLy8gTnVtYmVyRGlzcGxheSBsb29rcyBnb29kIGFuZCBpZiByZWxlYXNlZCBmcm9tIHdpdGhpbiBkZXYgYm91bmRzLCB0aGUgZW5lcmd5IHdpbGwgbmV2ZXIgZ2V0IHRoaXMgbGFyZ2UuXHJcbmNvbnN0IEVORVJHWV9SQU5HRSA9IG5ldyBSYW5nZSggLTIwMDAwLCAyMDAwMCApO1xyXG5cclxuLy8gb2Zmc2V0IHNvIHRoYXQgdGhlIGNlbnRlciBvZiB0aGUgcHJvYmUgYWxpZ25zIHdpdGggc2FtcGxlIHBvc2l0aW9uc1xyXG5jb25zdCBQUk9CRV9DRU5URVJfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDUuNSwgMCApO1xyXG5cclxuY29uc3QgU0VOU09SX0NPTE9SID0gJ3JnYiggMTAzLCA4MCwgMTEzICknO1xyXG5cclxuLy8gbWF4IGRpc3RhbmNlIGJldHdlZW4gc2FtcGxlIGFuZCBwcm9iZSBjZW50ZXIgZm9yIHRoZSBzYW1wbGUgdG8gYmUgZGlzcGxheWVkLCBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbmNvbnN0IFBST0JFX1RIUkVTSE9MRF9ESVNUQU5DRSA9IDEwO1xyXG5cclxuY2xhc3MgU2thdGVyUGF0aFNlbnNvck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYnNlcnZhYmxlQXJyYXlEZWYuPEVuZXJneVNrYXRlUGFya0RhdGFTYW1wbGU+fSBzYW1wbGVzXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyUHJvcGVydHl9IHNlbnNvclByb2JlUG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMlByb3BlcnR5fSBzZW5zb3JCb2R5UG9zaXRpb25Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPEJvdW5kczI+fSBtb2RlbEJvdW5kc1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge0VuZXJneVNrYXRlUGFya0NvbnRyb2xQYW5lbH0gY29udHJvbFBhbmVsIC0gc28gdGhlIHJlYWRvdXQgZG9lc24ndCBvY2NsdWRlIGNvbnRyb2wgcGFuZWwgYm91bmRzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzYW1wbGVzLCBzZW5zb3JQcm9iZVBvc2l0aW9uUHJvcGVydHksIHNlbnNvckJvZHlQb3NpdGlvblByb3BlcnR5LCBtb2RlbEJvdW5kc1Byb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGNvbnRyb2xQYW5lbCwgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gcHJldmVudCBibG9jayBmaXR0aW5nIHNvIHRoYXQgdGhpbmdzIGRvbid0IGppZ2dsZSBhcyB0aGUgcHJvYmUgbW92ZXMsIHNlZVxyXG4gICAgICBwcmV2ZW50Rml0OiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gc28gdGhlIGhlaWdodCBzcGVlZCByZWFkb3V0IGRvZXNuJ3Qgb2NjbHVkZSB0aGlzXHJcbiAgICB0aGlzLnNjcmVlblZpZXdDb250cm9sUGFuZWwgPSBjb250cm9sUGFuZWw7XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuXHJcbiAgICB0aGlzLnNhbXBsZXMgPSBzYW1wbGVzO1xyXG5cclxuICAgIC8vIGxhYmVscyBhbmQgdmFsdWUgcmVjdGFuZ2xlcyBhcmUgaW4gdGhlIHNhbWUgYWxpZ24gZ3JvdXAgc28gdGhhdCBhbGwgZW50cmllcyBoYXZlIHNhbWUgd2lkdGggYW5kIGhlaWdodCBmb3JcclxuICAgIC8vIGxheW91dFxyXG4gICAgY29uc3QgYWxpZ25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCB7IG1hdGNoSG9yaXpvbnRhbDogZmFsc2UgfSApO1xyXG5cclxuICAgIGNvbnN0IGtpbmV0aWNMYWJlbEJveCA9IFNrYXRlclBhdGhTZW5zb3JOb2RlLmNyZWF0ZUxhYmVsQm94KCBhbGlnbkdyb3VwLCBlbmVyZ3lLaW5ldGljU3RyaW5nICk7XHJcbiAgICBjb25zdCBwb3RlbnRpYWxMYWJlbEJveCA9IFNrYXRlclBhdGhTZW5zb3JOb2RlLmNyZWF0ZUxhYmVsQm94KCBhbGlnbkdyb3VwLCBlbmVyZ3lQb3RlbnRpYWxTdHJpbmcgKTtcclxuICAgIGNvbnN0IHRoZXJtYWxMYWJlbEJveCA9IFNrYXRlclBhdGhTZW5zb3JOb2RlLmNyZWF0ZUxhYmVsQm94KCBhbGlnbkdyb3VwLCBlbmVyZ3lUaGVybWFsU3RyaW5nICk7XHJcbiAgICBjb25zdCB0b3RhbExhYmVsQm94ID0gU2thdGVyUGF0aFNlbnNvck5vZGUuY3JlYXRlTGFiZWxCb3goIGFsaWduR3JvdXAsIGVuZXJneVRvdGFsU3RyaW5nICk7XHJcblxyXG4gICAgLy8gbGFiZWwgZm9yIHRoZSBwcm9iZVxyXG4gICAgY29uc3QgZW5lcmd5TGFiZWwgPSBuZXcgVGV4dCggZW5lcmd5RW5lcmd5U3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IFRJVExFX0ZPTlQsXHJcbiAgICAgIGZpbGw6IFRFWFRfQ09MT1IsXHJcbiAgICAgIG1heFdpZHRoOiA5MFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48bnVtYmVyfG51bGw+IGZvciB0aGUgTnVtYmVyRGlzcGxheXMsIG51bGwgdW5sZXNzIHByb2JlIGlzIG92ZXIgYSBza2F0ZXIgc2FtcGxlXHJcbiAgICBjb25zdCB2YWxpZGF0aW9uT3B0aW9ucyA9IHsgdmFsdWVUeXBlOiBbIG51bGwsICdudW1iZXInIF0gfTtcclxuICAgIHRoaXMua2luZXRpY1ZhbHVlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHZhbGlkYXRpb25PcHRpb25zICk7XHJcbiAgICB0aGlzLnBvdGVudGlhbFZhbHVlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHZhbGlkYXRpb25PcHRpb25zICk7XHJcbiAgICB0aGlzLnRoZXJtYWxWYWx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsLCB2YWxpZGF0aW9uT3B0aW9ucyApO1xyXG4gICAgdGhpcy50b3RhbFZhbHVlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHZhbGlkYXRpb25PcHRpb25zICk7XHJcblxyXG4gICAgLy8gTnVtYmVyRGlzcGxheXMgZm9yIHRoZSBib2R5IG9mIHRoZSBzZW5zb3IsIHdyYXBwZWQgaW4gYW4gQWxpZ25Cb3hcclxuICAgIHRoaXMua2luZXRpY1JlY3RhbmdsZUJveCA9IFNrYXRlclBhdGhTZW5zb3JOb2RlLmNyZWF0ZVJlYWRvdXRCb3goIGFsaWduR3JvdXAsIHRoaXMua2luZXRpY1ZhbHVlUHJvcGVydHkgKTtcclxuICAgIHRoaXMucG90ZW50aWFsUmVjdGFuZ2xlQm94ID0gU2thdGVyUGF0aFNlbnNvck5vZGUuY3JlYXRlUmVhZG91dEJveCggYWxpZ25Hcm91cCwgdGhpcy5wb3RlbnRpYWxWYWx1ZVByb3BlcnR5ICk7XHJcbiAgICB0aGlzLnRoZXJtYWxSZWN0YW5nbGVCb3ggPSBTa2F0ZXJQYXRoU2Vuc29yTm9kZS5jcmVhdGVSZWFkb3V0Qm94KCBhbGlnbkdyb3VwLCB0aGlzLnRoZXJtYWxWYWx1ZVByb3BlcnR5ICk7XHJcbiAgICB0aGlzLnRvdGFsUmVjdGFuZ2xlQm94ID0gU2thdGVyUGF0aFNlbnNvck5vZGUuY3JlYXRlUmVhZG91dEJveCggYWxpZ25Hcm91cCwgdGhpcy50b3RhbFZhbHVlUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIEhlaWdodCBhbmQgc3BlZWQgYXJlIHJlYWQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwcm9iZSBpbiBhIHRyYW5zcGFyZW50IHBhbmVsIGZvciBlbmhhbmNlZFxyXG4gICAgLy8gdmlzaWJpbGl0eS4gV2Ugd2FudCB0aGUgcGFuZWwgdG8gcmVzaXplIGFzIHRoZSB0ZXh0IGNoYW5nZXMgZm9yIGRpZmZlcmVudCBza2F0ZXIgc2FtcGxlc1xyXG4gICAgdGhpcy5oZWlnaHRSZWFkb3V0ID0gbmV3IFRleHQoICcnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApO1xyXG4gICAgdGhpcy5zcGVlZFJlYWRvdXQgPSBuZXcgVGV4dCggJycsIHsgZm9udDogTEFCRUxfRk9OVCB9ICk7XHJcbiAgICB0aGlzLmhlaWdodFNwZWVkVkJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHRoaXMuaGVpZ2h0UmVhZG91dCwgdGhpcy5zcGVlZFJlYWRvdXQgXSxcclxuICAgICAgYWxpZ246ICdsZWZ0J1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaGVpZ2h0U3BlZWRSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCB0aGlzLmhlaWdodFNwZWVkVkJveC5ib3VuZHMsIHtcclxuICAgICAgZmlsbDogRW5lcmd5U2thdGVQYXJrQ29sb3JTY2hlbWUudHJhbnNwYXJlbnRQYW5lbEZpbGxcclxuICAgIH0gKTtcclxuICAgIHRoaXMuaGVpZ2h0U3BlZWRSZWN0YW5nbGUuYWRkQ2hpbGQoIHRoaXMuaGVpZ2h0U3BlZWRWQm94ICk7XHJcblxyXG4gICAgLy8gbGF5b3V0IC0gbGFiZWxzIGhvcml6b250YWxseSBhbGlnbmVkIHdpdGggcmVhZG91dHMgaW4gYSBWQm94XHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBlbmVyZ3lMYWJlbCxcclxuICAgICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgbmV3IFZCb3goIHtcclxuICAgICAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgICAgICBraW5ldGljTGFiZWxCb3gsIHBvdGVudGlhbExhYmVsQm94LCB0aGVybWFsTGFiZWxCb3gsIHRvdGFsTGFiZWxCb3hcclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIHNwYWNpbmc6IExBWU9VVF9TUEFDSU5HXHJcbiAgICAgICAgICAgIH0gKSxcclxuICAgICAgICAgICAgbmV3IFZCb3goIHtcclxuICAgICAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICAgICAgdGhpcy5raW5ldGljUmVjdGFuZ2xlQm94LCB0aGlzLnBvdGVudGlhbFJlY3RhbmdsZUJveCwgdGhpcy50aGVybWFsUmVjdGFuZ2xlQm94LCB0aGlzLnRvdGFsUmVjdGFuZ2xlQm94XHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICBzcGFjaW5nOiBMQVlPVVRfU1BBQ0lOR1xyXG4gICAgICAgICAgICB9IClcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBzcGFjaW5nOiBMQUJFTF9WQUxVRV9TUEFDSU5HXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF0sIHNwYWNpbmc6IFRJVExFX0NPTlRFTlRfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRoZSBib2R5IGlzIGEgcm91bmRlZCByZWN0YW5nbGVcclxuICAgIGNvbnN0IGJvZHkgPSBuZXcgUmVjdGFuZ2xlKCBjb250ZW50LmJvdW5kcy5kaWxhdGVkKCA3ICksIEVuZXJneVNrYXRlUGFya0NvbnN0YW50cy5QQU5FTF9DT1JORVJfUkFESVVTLCBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuUEFORUxfQ09STkVSX1JBRElVUywge1xyXG4gICAgICBmaWxsOiBTRU5TT1JfQ09MT1IsXHJcbiAgICAgIHN0cm9rZTogJ3JnYigyMTAsMjEwLDIxMCknLFxyXG4gICAgICBsaW5lV2lkdGg6IDJcclxuICAgIH0gKTtcclxuICAgIGJvZHkuYWRkQ2hpbGQoIGNvbnRlbnQgKTtcclxuXHJcbiAgICBzZW5zb3JCb2R5UG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBib2R5UG9zaXRpb24gPT4ge1xyXG4gICAgICBib2R5LmxlZnRUb3AgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggYm9keVBvc2l0aW9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGhlIHByb2JlXHJcbiAgICB0aGlzLnByb2JlTm9kZSA9IG5ldyBQcm9iZU5vZGUoIHtcclxuICAgICAgc2NhbGU6IDAuNSxcclxuICAgICAgcm90YXRpb246IE1hdGguUEkgLyAyLFxyXG4gICAgICBjb2xvcjogU0VOU09SX0NPTE9SLFxyXG4gICAgICBzZW5zb3JUeXBlRnVuY3Rpb246IFByb2JlTm9kZS5jcm9zc2hhaXJzKCksXHJcbiAgICAgIGNlbnRlcjogbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHNlbnNvclByb2JlUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHNlbnNvclByb2JlUG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIHRoaXMucHJvYmVOb2RlLnRyYW5zbGF0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcG9pbnRzIGFuZCBjb250cm9sIHBvaW50cyBmb3IgdGhlIHdpcmVcclxuICAgIGNvbnN0IHAxUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHNlbnNvckJvZHlQb3NpdGlvblByb3BlcnR5IF0sIGJvZHlQb3NpdGlvbiA9PiB7XHJcbiAgICAgIHJldHVybiBib2R5LmdldENlbnRlckJvdHRvbSgpLm1pbnVzWFkoIDAsIDUgKTtcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG5vcm1hbDFQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgc2Vuc29yUHJvYmVQb3NpdGlvblByb3BlcnR5LCBzZW5zb3JCb2R5UG9zaXRpb25Qcm9wZXJ0eSBdLCBzZW5zb3JQb3NpdGlvbiA9PiB7XHJcblxyXG4gICAgICAvLyBjaGFuZ2VzIHdpdGggdGhlIHByb2JlIHBvc2l0aW9uIHNvIHRoZSB3aXJlIGxvb2tzIGxpa2UgaXQgaGFzIHNsYWNrIGFzIGl0IGdldHMgbG9uZ2VyXHJcbiAgICAgIGNvbnN0IHZpZXdQb3NpdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBzZW5zb3JQb3NpdGlvbiApO1xyXG4gICAgICBjb25zdCBkaXN0YW5jZVRvQm9keSA9IHZpZXdQb3NpdGlvbi5taW51cyggcDFQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICByZXR1cm4gbmV3IFZlY3RvcjIoIGRpc3RhbmNlVG9Cb2R5LnggLyAzLCBNYXRoLm1heCggZGlzdGFuY2VUb0JvZHkueSwgYm9keS5oZWlnaHQgKiAyICkgKTtcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHAyUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHNlbnNvclByb2JlUG9zaXRpb25Qcm9wZXJ0eSBdLCBzZW5zb3JQb3NpdGlvbiA9PiB7XHJcblxyXG4gICAgICAvLyBjYWxjdWxhdGUgdGhlIGxlZnQgb2YgdGhlIHByb2JlIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgICAgY29uc3Qgdmlld1Bvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHNlbnNvclBvc2l0aW9uICk7XHJcbiAgICAgIGNvbnN0IHZpZXdXaWR0aCA9IHRoaXMucHJvYmVOb2RlLndpZHRoO1xyXG4gICAgICByZXR1cm4gdmlld1Bvc2l0aW9uLm1pbnVzWFkoIHZpZXdXaWR0aCAvIDIsIDAgKTtcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG5vcm1hbDJQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAtMjUsIDAgKSApO1xyXG5cclxuICAgIGNvbnN0IHdpcmVOb2RlID0gbmV3IFdpcmVOb2RlKCBwMVByb3BlcnR5LCBub3JtYWwxUHJvcGVydHksIHAyUHJvcGVydHksIG5vcm1hbDJQcm9wZXJ0eSwge1xyXG4gICAgICBsaW5lV2lkdGg6IDRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB3aXJlIG5vZGUgYmVoaW5kIGJvZHkgc28gdGhlIGNvbm5lY3Rpb24gcG9pbnQgd2hlcmUgd2lyZSBhbmQgYm9keSBtZWV0IGFyZSBjbGVhblxyXG4gICAgdGhpcy5hZGRDaGlsZCggd2lyZU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJvZHkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucHJvYmVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmhlaWdodFNwZWVkUmVjdGFuZ2xlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB7RW5lcmd5U2thdGVQYXJrRGF0YVNhbXBsZXxudWxsfSAtIHRoZSBza2F0ZXIgc2FtcGxlIGN1cnJlbnRseSBiZWluZyBpbnNwZWN0ZWQsIHJlZmVyZW5jZSBzbyB3ZSBjYW4gdW4taW5zcGVjdFxyXG4gICAgLy8gd2l0aG91dCBsb29waW5nIHRocm91Z2ggYWxsIHNhbXBsZXNcclxuICAgIHRoaXMuaW5zcGVjdGVkU2FtcGxlID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmJvdW5kVXBkYXRlU2Vuc29yRGlzcGxheSA9IHRoaXMudXBkYXRlU2Vuc29yRGlzcGxheS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gZGlzcGxheSB0aGUgaW5zcGVjdGVkIHNhbXBsZSwgd2hpY2ggY291bGQgY2hhbmdlIGlmIHRoZSBzZW5zb3IgaXMgYmVpbmcgZHJhZ2dlZCwgb3IgaWYgYSBzYW1wbGUgaXMgYWRkZWQvcmVtb3ZlZFxyXG4gICAgLy8gZnJvbSB1bmRlciB0aGUgc2Vuc29yXHJcbiAgICBzZW5zb3JQcm9iZVBvc2l0aW9uUHJvcGVydHkubGluayggdGhpcy5ib3VuZFVwZGF0ZVNlbnNvckRpc3BsYXkgKTtcclxuICAgIHNhbXBsZXMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggdGhpcy5ib3VuZFVwZGF0ZVNlbnNvckRpc3BsYXkgKTtcclxuICAgIHNhbXBsZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoIHRoaXMuYm91bmRVcGRhdGVTZW5zb3JEaXNwbGF5ICk7XHJcblxyXG4gICAgLy8gYWRkIGEgZHJhZyBsaXN0ZW5lciB0byB0aGUgcHJvYmUgYm9keVxyXG4gICAgdGhpcy5wcm9iZU5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB0cmFuc2Zvcm06IG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogc2Vuc29yUHJvYmVQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG1vZGVsQm91bmRzUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApXHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgc2Vuc29yIGRpc3BsYXksIHNob3dpbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGluc3BlY3RlZCBzYW1wbGUgaWYgb25lIGlzIHVuZGVybmVhdGggdGhlIHNlbnNvci4gSWZcclxuICAgKiBubyBzYW1wbGUgaXMgdW5kZXIgdGhlIHNlbnNvciwgdGhlIGRpc3BsYXkgaXMgY2xlYXJlZC5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlU2Vuc29yRGlzcGxheSgpIHtcclxuICAgIGxldCBzYW1wbGVUb0Rpc3BsYXkgPSBudWxsO1xyXG5cclxuICAgIC8vIGZpbmRzIHNhbXBsZSB1bmRlciB0aGUgc2Vuc29yLCBvciB0aGUgY2xvc2VzdCBvbmUgdG8gdGhlIGNlbnRlciBwb2ludCBpZiB0aGVyZSBhcmUgbXVsdGlwbGVcclxuICAgIGNvbnN0IHByb2JlQ2VudGVyV2l0aE9mZnNldCA9IHRoaXMucHJvYmVOb2RlLmdldENlbnRlcigpLnBsdXMoIFBST0JFX0NFTlRFUl9PRkZTRVQgKTtcclxuICAgIGNvbnN0IHZpZXdQcm9iZVBvaW50ID0gdGhpcy5sb2NhbFRvUGFyZW50UG9pbnQoIHByb2JlQ2VudGVyV2l0aE9mZnNldCApO1xyXG4gICAgbGV0IG1pbkRpc3RhbmNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zYW1wbGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBzYW1wbGVWaWV3UG9pbnQgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCB0aGlzLnNhbXBsZXMuZ2V0KCBpICkucG9zaXRpb24gKTtcclxuICAgICAgY29uc3QgZGlzdGFuY2VUb1NhbXBsZSA9IFZlY3RvcjIuZ2V0RGlzdGFuY2VCZXR3ZWVuVmVjdG9ycyggc2FtcGxlVmlld1BvaW50LCB2aWV3UHJvYmVQb2ludCApO1xyXG5cclxuICAgICAgaWYgKCBkaXN0YW5jZVRvU2FtcGxlIDwgUFJPQkVfVEhSRVNIT0xEX0RJU1RBTkNFICYmIGRpc3RhbmNlVG9TYW1wbGUgPCBtaW5EaXN0YW5jZSApIHtcclxuICAgICAgICBzYW1wbGVUb0Rpc3BsYXkgPSB0aGlzLnNhbXBsZXMuZ2V0KCBpICk7XHJcbiAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZVRvU2FtcGxlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBzYW1wbGVUb0Rpc3BsYXkgKSB7XHJcbiAgICAgIHRoaXMuZGlzcGxheVN0YXRlKCBzYW1wbGVUb0Rpc3BsYXkgKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgZGlzcGxheSB3aGVuZXZlciBzYW1wbGUgZW5lcmdpZXMgdXBkYXRlLCBsaXN0ZW5lciByZW1vdmVkIGluIGNsZWFyRGlzcGxheVxyXG4gICAgICB0aGlzLnVwZGF0ZURpc3BsYXlMaXN0ZW5lciA9IHRoaXMuZGlzcGxheVN0YXRlLmJpbmQoIHRoaXMsIHNhbXBsZVRvRGlzcGxheSApO1xyXG4gICAgICBzYW1wbGVUb0Rpc3BsYXkudXBkYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMudXBkYXRlRGlzcGxheUxpc3RlbmVyICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5pbnNwZWN0ZWRTYW1wbGUgKSB7XHJcbiAgICAgIHRoaXMuY2xlYXJEaXNwbGF5KCB0aGlzLmluc3BlY3RlZFNhbXBsZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcGxheSB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIGEgc2FtcGxlIG9mIHNrYXRlciBzdGF0ZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSAge0VuZXJneVNrYXRlUGFya0RhdGFTYW1wbGV9IGRhdGFTYW1wbGVcclxuICAgKi9cclxuICBkaXNwbGF5U3RhdGUoIGRhdGFTYW1wbGUgKSB7XHJcbiAgICBpZiAoIHRoaXMuaW5zcGVjdGVkU2FtcGxlICkge1xyXG4gICAgICB0aGlzLmluc3BlY3RlZFNhbXBsZS5pbnNwZWN0ZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbnNwZWN0ZWRTYW1wbGUgPSBkYXRhU2FtcGxlO1xyXG4gICAgZGF0YVNhbXBsZS5pbnNwZWN0ZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuXHJcbiAgICAvLyBzZXQgdmFsdWVzIGZvciBkaXNwbGF5XHJcbiAgICB0aGlzLmtpbmV0aWNWYWx1ZVByb3BlcnR5LnZhbHVlID0gZGF0YVNhbXBsZS5raW5ldGljRW5lcmd5O1xyXG4gICAgdGhpcy5wb3RlbnRpYWxWYWx1ZVByb3BlcnR5LnZhbHVlID0gZGF0YVNhbXBsZS5wb3RlbnRpYWxFbmVyZ3k7XHJcbiAgICB0aGlzLnRoZXJtYWxWYWx1ZVByb3BlcnR5LnZhbHVlID0gZGF0YVNhbXBsZS50aGVybWFsRW5lcmd5O1xyXG4gICAgdGhpcy50b3RhbFZhbHVlUHJvcGVydHkudmFsdWUgPSBkYXRhU2FtcGxlLnRvdGFsRW5lcmd5O1xyXG5cclxuICAgIC8vIHNldCB2YWx1ZXMgZm9yIGhlaWdodCBhbmQgc3BlZWQgcmVhZG91dFxyXG4gICAgdGhpcy5oZWlnaHRSZWFkb3V0LnN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggaGVpZ2h0TWV0ZXJzUGF0dGVyblN0cmluZywge1xyXG4gICAgICB2YWx1ZTogdGhpcy5mb3JtYXRWYWx1ZSggZGF0YVNhbXBsZS5wb3NpdGlvbi55IC0gZGF0YVNhbXBsZS5yZWZlcmVuY2VIZWlnaHQgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zcGVlZFJlYWRvdXQuc3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzcGVlZE1ldGVyc1BlclNlY29uZFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgdmFsdWU6IHRoaXMuZm9ybWF0VmFsdWUoIGRhdGFTYW1wbGUuc3BlZWQgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaGVpZ2h0U3BlZWRSZWN0YW5nbGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICB0aGlzLnBvc2l0aW9uUmVhZG91dHMoIGRhdGFTYW1wbGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBvc2l0aW9uIGFuZCBzaXplcyB0aGUgaGVpZ2h0L3NwZWVkIHJlYWRvdXQgd2hpY2ggYXBwZWFycyB0byB0aGUgcmlnaHQgb2YgdGhlIHByb2JlLCB1bmxlc3MgdGhhdCB3b3VsZFxyXG4gICAqIG9jY2x1ZGUgdGhlIHNjcmVlbiB2aWV3IGNvbnRyb2wgcGFuZWxcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcG9zaXRpb25SZWFkb3V0cyggZGF0YVNhbXBsZSApIHtcclxuICAgIHRoaXMuaGVpZ2h0U3BlZWRSZWN0YW5nbGUuc2V0UmVjdEJvdW5kcyggdGhpcy5oZWlnaHRTcGVlZFZCb3guYm91bmRzICk7XHJcbiAgICB0aGlzLmhlaWdodFNwZWVkUmVjdGFuZ2xlLmxlZnRDZW50ZXIgPSB0aGlzLnByb2JlTm9kZS5yaWdodENlbnRlci5wbHVzWFkoIFBST0JFX1JFQURPVVRfU1BBQ0lORywgMCApO1xyXG5cclxuICAgIC8vIGRldGVybWluZSBvY2NsdXNpb24gY2FzZSBmcm9tIHBvc2l0aW9uIG9mIHRoZSBzYW1wbGUgcG9pbnQgcmF0aGVyIHRoYW4gdGhlIHByb2JlIHBvc2l0aW9uIHNvIHRoYXRcclxuICAgIC8vIHRoZSBkaXNwbGF5IGRvZXNuJ3QgbW92ZSBhcm91bmQgd2hlbiBtZWFzdXJpbmcgYSBzaW5nbGUgcG9pbnRcclxuICAgIGNvbnN0IHNwYWNpbmcgPSB0aGlzLmhlaWdodFNwZWVkUmVjdGFuZ2xlLndpZHRoICsgdGhpcy5wcm9iZU5vZGUud2lkdGggLyAyO1xyXG4gICAgY29uc3Qgc2FtcGxlVmlld1BvaW50ID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggZGF0YVNhbXBsZS5wb3NpdGlvbiApO1xyXG4gICAgaWYgKCBNYXRoLmFicyggc2FtcGxlVmlld1BvaW50LnggLSB0aGlzLnNjcmVlblZpZXdDb250cm9sUGFuZWwubGVmdCApIDwgc3BhY2luZyApIHtcclxuICAgICAgdGhpcy5oZWlnaHRTcGVlZFJlY3RhbmdsZS5sZWZ0VG9wID0gdGhpcy5wcm9iZU5vZGUubGVmdEJvdHRvbS5wbHVzWFkoIDAsIFBST0JFX1JFQURPVVRfU1BBQ0lORyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9ybWF0cyB2YWx1ZXMgaW4gdGhlIGhlaWdodC9zcGVlZCBkaXNwbGF5IGFkamFjZW50IHRvIHRoZSBzZW5zb3Igd2hlbiBhIGRhdGFcclxuICAgKiBwb2ludCBpcyB1bmRlciB0aGUgd2FuZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHZhbHVlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBmb3JtYXRWYWx1ZSggdmFsdWUgKSB7XHJcbiAgICByZXR1cm4gVXRpbHMudG9GaXhlZCggdmFsdWUsIDIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIGFsbCB2YWx1ZXMgaW4gdGhlIGRpc3BsYXlzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VuZXJneVNrYXRlUGFya0RhdGFTYW1wbGV9IGRhdGFTYW1wbGVcclxuICAgKi9cclxuICBjbGVhckRpc3BsYXkoIGRhdGFTYW1wbGUgKSB7XHJcblxyXG4gICAgLy8gc2V0dGluZyBQcm9wZXJ0aWVzIHRvIG51bGwgd2lsbCBzaG93IE1hdGhTeW1ib2xzLk5PX1ZBTFVFIGluIE51bWJlckRpc3BsYXlcclxuICAgIHRoaXMua2luZXRpY1ZhbHVlUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgdGhpcy5wb3RlbnRpYWxWYWx1ZVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgIHRoaXMudGhlcm1hbFZhbHVlUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgdGhpcy50b3RhbFZhbHVlUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudXBkYXRlRGlzcGxheUxpc3RlbmVyLFxyXG4gICAgICBgbGlzdGVuZXIgbm90IGF0dGFjaGVkIHRvIGRhdGFTYW1wbGUgZW1pdHRlcixcclxuICAgICAgIGRhdGFTYW1wbGU6ICR7ZGF0YVNhbXBsZX0sXHJcbiAgICAgICB0aGlzLmluc3BlY3RlZFNhbXBsZTogJHt0aGlzLmluc3BlY3RlZFNhbXBsZX1gLFxyXG4gICAgICAgYHVwZGF0ZSBsaXN0ZW5lckw6ICAke3RoaXMudXBkYXRlRGlzcGxheUxpc3RlbmVyfWBcclxuICAgICk7XHJcbiAgICB0aGlzLmluc3BlY3RlZFNhbXBsZS51cGRhdGVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy51cGRhdGVEaXNwbGF5TGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmluc3BlY3RlZFNhbXBsZSA9IG51bGw7XHJcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXlMaXN0ZW5lciA9IG51bGw7XHJcblxyXG4gICAgZGF0YVNhbXBsZS5pbnNwZWN0ZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICB0aGlzLmhlaWdodFNwZWVkUmVjdGFuZ2xlLnZpc2libGUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBsYWJlbCB0ZXh0IGFuZCB3cmFwIHdpdGggYW4gQWxpZ25Cb3ggc28gdGhhdCBhbGwgbGFiZWxzIGFuZCByZWFkb3V0cyBoYXZlIHRoZSBzYW1lIGRpbWVuc2lvbnMgZm9yIGxheW91dC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7QWxpZ25Hcm91cH0gYWxpZ25Hcm91cFxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbGFiZWxTdHJpbmdcclxuICAgKiBAcmV0dXJucyB7QWxpZ25Cb3h9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUxhYmVsQm94KCBhbGlnbkdyb3VwLCBsYWJlbFN0cmluZyApIHtcclxuICAgIGNvbnN0IGxhYmVsVGV4dCA9IG5ldyBUZXh0KCBsYWJlbFN0cmluZywgeyBmaWxsOiBURVhUX0NPTE9SLCBmb250OiBMQUJFTF9GT05ULCBtYXhXaWR0aDogRU5UUllfTUFYX1dJRFRIIH0gKTtcclxuICAgIHJldHVybiBhbGlnbkdyb3VwLmNyZWF0ZUJveCggbGFiZWxUZXh0LCB7IHhBbGlnbjogJ2xlZnQnIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIHJlY3RhbmdsZSB0byBjb250YWluIHZhbHVlIHJlYWRvdXRzLCB3cmFwcGVkIGluIGFuIGFsaWduIGJveCBzbyB0aGF0IGxhYmVscyBhbmQgdGhpcyByZWN0YW5nbGUgYWxsXHJcbiAgICogaGF2ZSB0aGUgc2FtZSBkaW1lbnNpb25zIGZvciBsYXlvdXQgcHVycG9zZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QWxpZ25Hcm91cH0gYWxpZ25Hcm91cFxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IHZhbHVlUHJvcGVydHlcclxuICAgKiBAcmV0dXJucyB7QWxpZ25Cb3h9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZVJlYWRvdXRCb3goIGFsaWduR3JvdXAsIHZhbHVlUHJvcGVydHkgKSB7XHJcblxyXG4gICAgY29uc3QgbnVtYmVyRGlzcGxheSA9IG5ldyBOdW1iZXJEaXNwbGF5KCB2YWx1ZVByb3BlcnR5LCBFTkVSR1lfUkFOR0UsIHtcclxuICAgICAgYmFja2dyb3VuZFN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgYmFja2dyb3VuZEZpbGw6IEVuZXJneVNrYXRlUGFya0NvbG9yU2NoZW1lLnBhbmVsRmlsbCxcclxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgIGZvbnQ6IExBQkVMX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IEVOVFJZX01BWF9XSURUSFxyXG4gICAgICB9LFxyXG4gICAgICBkZWNpbWFsUGxhY2VzOiAxLFxyXG4gICAgICBtaW5CYWNrZ3JvdW5kV2lkdGg6IDY4LCAvLyBkZXRlcm1pbmVkIGJ5IGluc3BlY3Rpb24sIGluIGFkZGl0aW9uIHRvIEVORVJHWV9SQU5HRSBiZWNhdXNlIHRoZSByYW5nZSBpcyBhcmJpdHJhcnlcclxuICAgICAgdmFsdWVQYXR0ZXJuOiBlbmVyZ3lKb3VsZXNQYXR0ZXJuU3RyaW5nLFxyXG5cclxuICAgICAgLy8gdGhlc2UgdmFsdWUgZGlzcGxheXMgZ2V0IHNtYWxsZXIgdGhhbiB0aGVpciBjb3JkbmVyIHJhZGl1cyB3aXRoIHZlcnkgbG9uZ1xyXG4gICAgICAvLyBzdHJpbmdzLCBzbyB3ZSB3aWxsIGFsd2F5cyB1c2UgZnVsbCBoZWlnaHQgZm9yIGNvbnNpc3RlbnQgbGF5b3V0XHJcbiAgICAgIHVzZUZ1bGxIZWlnaHQ6IHRydWUsXHJcblxyXG4gICAgICAvLyB3aGVuIHRoZXJlIGFyZSBubyB2YWx1ZXMsIGhpZGUgdW5pdHNcclxuICAgICAgbm9WYWx1ZVBhdHRlcm46IFN1bkNvbnN0YW50cy5WQUxVRV9OQU1FRF9QTEFDRUhPTERFUixcclxuICAgICAgbm9WYWx1ZUFsaWduOiAnY2VudGVyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBhbGlnbkdyb3VwLmNyZWF0ZUJveCggbnVtYmVyRGlzcGxheSwgeyB4QWxpZ246ICdyaWdodCcgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5U2thdGVQYXJrLnJlZ2lzdGVyKCAnU2thdGVyUGF0aFNlbnNvck5vZGUnLCBTa2F0ZXJQYXRoU2Vuc29yTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTa2F0ZXJQYXRoU2Vuc29yTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsYUFBYSxNQUFNLDhDQUE4QztBQUN4RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxVQUFVLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJ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