// Copyright 2021-2023, University of Colorado Boulder

/**
 * The "Energy Flux" meter for Greenhouse Effect. This includes a draggable sensor that can move about the Observation
 * Window and detect the flux of sunlight and infrared photons. A graphical representation of flux is displayed
 * in a panel with large arrows.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import WireNode from '../../../../scenery-phet/js/WireNode.js';
import { Color, DragListener, HBox, Line, Node, Path, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import AccessibleSlider from '../../../../sun/js/accessibility/AccessibleSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import SoundLevelEnum from '../../../../tambo/js/SoundLevelEnum.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import GreenhouseEffectColors from '../GreenhouseEffectColors.js';
import GreenhouseEffectConstants from '../GreenhouseEffectConstants.js';
import GreenhouseEffectOptions from '../GreenhouseEffectOptions.js';
import LayersModel from '../model/LayersModel.js';
import FluxMeterSoundGenerator from './FluxMeterSoundGenerator.js';
const sunlightStringProperty = GreenhouseEffectStrings.sunlightStringProperty;
const infraredStringProperty = GreenhouseEffectStrings.infraredStringProperty;
const energyFluxStringProperty = GreenhouseEffectStrings.fluxMeter.energyFluxStringProperty;
const METER_SPACING = 8; // spacing used in a few places for layout, in view coordinates
const SENSOR_STROKE_COLOR = 'rgb(254,153,18)';
const SENSOR_FILL_COLOR = 'rgba(200,200,200,0.6)';
const CUE_ARROW_LENGTH = 28; // length of the 'drag cue' arrows around the flux sensor
const FLUX_PANEL_X_MARGIN = 6;

// multiplier used to map energy flux values to arrow lengths in nominal (un-zoomed) case, empirically determined
const NOMINAL_FLUX_TO_ARROW_LENGTH_MULTIPLIER = 5E-6;

// Zoom factor for zooming in and out in the flux meter, only used if zoom is enabled.  This value was empirically
// determined in conjunction with others to make sure that the max outgoing IR will fix in the flux meter.
const FLUX_ARROW_ZOOM_FACTOR = 2.5;

// the number of zoom levels in each direction
const NUMBER_OF_ZOOM_OUT_LEVELS = 2;
const NUMBER_OF_ZOOM_IN_LEVELS = 1;
const CUE_ARROW_OPTIONS = {
  fill: SENSOR_STROKE_COLOR,
  lineWidth: 0.5,
  headWidth: 20,
  headHeight: 16,
  tailWidth: 7
};

// The height of the sensor in the view.  This is needed because the sensor model doesn't have any y-dimension height,
// so we use and arbitrary value that looks decent in the view.
const SENSOR_VIEW_HEIGHT = 10;

// The vertical range over which the flux meter is allowed to move.  The lower end allows the sensor to get close to the
// ground but not overlap with UI elements (see https://github.com/phetsims/greenhouse-effect/issues/248).  The upper
// end makes sure that the sensor stays fully within the observation window.
const FLUX_SENSOR_VERTICAL_RANGE = new Range(750, LayersModel.HEIGHT_OF_ATMOSPHERE - 700);
class FluxMeterNode extends Node {
  // the panel that contains the display showing energy flux, public for positioning in the view

  // a Property that tracks whether the sensor was dragged since startup or last reset, used to hide the queuing errors

  // zoom factor, only used if the zoom feature is enabled

  // sound generator for this node

  // displays for the flux, which consist of arrows and a background

  /**
   * @param model - model component for the FluxMeter
   * @param isPlayingProperty - a boolean Property that indicates whether the model in which the flux meter resides is
   *                            running
   * @param visibleProperty - a boolean Property that controls whether this node is visible
   * @param modelViewTransform
   * @param observationWindowViewBounds - bounds for the ObservationWindow to constrain dragging of the sensor
   * @param providedOptions
   */
  constructor(model, isPlayingProperty, visibleProperty, modelViewTransform, observationWindowViewBounds, providedOptions) {
    const options = optionize()({
      includeZoomButtons: false
    }, providedOptions);
    super();

    // Create the node that represents the wire connecting the panel and the sensor.
    const wireNode = new WireNode(new DerivedProperty([model.wireSensorAttachmentPositionProperty], position => modelViewTransform.modelToViewPosition(position)), new Vector2Property(new Vector2(100, 0)), new DerivedProperty([model.wireMeterAttachmentPositionProperty], position => modelViewTransform.modelToViewPosition(position)), new Vector2Property(new Vector2(-100, 0)), {
      stroke: new Color(90, 90, 90),
      lineWidth: 5
    });
    this.addChild(wireNode);
    const titleText = new Text(energyFluxStringProperty, {
      font: GreenhouseEffectConstants.TITLE_FONT,
      maxWidth: (FLUX_PANEL_X_MARGIN * 2 + EnergyFluxDisplay.WIDTH * 2 + METER_SPACING) * 0.9
    });
    this.zoomFactorProperty = new NumberProperty(0, {
      range: new Range(-NUMBER_OF_ZOOM_OUT_LEVELS, NUMBER_OF_ZOOM_IN_LEVELS)
    });
    const fluxToIndicatorLengthProperty = new DerivedProperty([this.zoomFactorProperty], zoomFactor => NOMINAL_FLUX_TO_ARROW_LENGTH_MULTIPLIER * Math.pow(FLUX_ARROW_ZOOM_FACTOR, zoomFactor));
    this.sunlightFluxDisplay = new EnergyFluxDisplay(model.fluxSensor.visibleLightDownEnergyRateTracker.energyRateProperty, model.fluxSensor.visibleLightUpEnergyRateTracker.energyRateProperty, fluxToIndicatorLengthProperty, sunlightStringProperty, GreenhouseEffectColors.sunlightColorProperty);
    this.infraredFluxDisplay = new EnergyFluxDisplay(model.fluxSensor.infraredLightDownEnergyRateTracker.energyRateProperty, model.fluxSensor.infraredLightUpEnergyRateTracker.energyRateProperty, fluxToIndicatorLengthProperty, infraredStringProperty, GreenhouseEffectColors.infraredColorProperty);
    const fluxArrows = new HBox({
      children: [this.sunlightFluxDisplay, this.infraredFluxDisplay],
      spacing: METER_SPACING
    });
    const zoomButtons = new MagnifyingGlassZoomButtonGroup(this.zoomFactorProperty, {
      spacing: 5,
      applyZoomIn: currentZoom => currentZoom + 1,
      applyZoomOut: currentZoom => currentZoom - 1,
      magnifyingGlassNodeOptions: {
        glassRadius: 6
      },
      buttonOptions: {
        baseColor: PhetColorScheme.PHET_LOGO_BLUE
      },
      tandem: options.tandem.createTandem('zoomButtonGroup')
    });

    // zoom buttons conditionally added to the view, but always created because I think that is required for PhET-iO
    const contentChildren = [titleText, fluxArrows];
    options.includeZoomButtons && contentChildren.push(zoomButtons);
    const content = new VBox({
      children: contentChildren,
      spacing: METER_SPACING
    });
    const fluxSensorNode = new FluxSensorNode(model.fluxSensor, modelViewTransform, {
      startDrag: () => {
        model.fluxSensor.isDraggingProperty.set(true);
      },
      drag: () => {
        // Hide the cue arrows if they are visible.
        this.wasDraggedProperty.set(true);

        // Clear the flux sensor if it is dragged while the main model is paused.  This prevents the display of flux
        // readings that are incorrect for the altitude at which the sensor is positioned.
        if (!isPlayingProperty.value) {
          model.fluxSensor.clearEnergyTrackers();
        }
      },
      endDrag: () => {
        model.fluxSensor.isDraggingProperty.set(false);
      }
    });
    this.addChild(fluxSensorNode);

    // The cueing arrows for the flux sensor are shown initially if globally enabled, then hidden after the first drag.
    this.wasDraggedProperty = new BooleanProperty(false);
    const cueingArrowsShownProperty = new DerivedProperty([this.wasDraggedProperty, GreenhouseEffectOptions.cueingArrowsEnabledProperty], (wasDragged, cueingArrowsEnabled) => !wasDragged && cueingArrowsEnabled);

    // colored arrows around the flux sensor, cues the user to drag it
    const cuingArrowsNode = new VBox({
      cursor: 'pointer',
      spacing: 15,
      children: [new ArrowNode(0, 0, 0, -CUE_ARROW_LENGTH, CUE_ARROW_OPTIONS), new ArrowNode(0, 0, 0, CUE_ARROW_LENGTH, CUE_ARROW_OPTIONS)],
      centerX: fluxSensorNode.bounds.maxX,
      visibleProperty: cueingArrowsShownProperty
    });
    this.addChild(cuingArrowsNode);

    // Reposition the cue arrows as the flux sensor moves.
    model.fluxSensor.altitudeProperty.link(altitude => {
      cuingArrowsNode.centerY = modelViewTransform.modelToViewY(altitude);
    });

    // create the panel
    this.fluxPanel = new Panel(content, {
      xMargin: FLUX_PANEL_X_MARGIN
    });
    this.addChild(this.fluxPanel);

    // listeners
    visibleProperty.link(visible => {
      this.visible = visible;
    });

    // the offset position for the drag pickup, so that the translation doesn't snap to the cursor position
    let startOffset = Vector2.ZERO;
    fluxSensorNode.addInputListener(new DragListener({
      start: event => {
        startOffset = fluxSensorNode.globalToParentPoint(event.pointer.point).subtract(fluxSensorNode.center);
        model.fluxSensor.isDraggingProperty.set(true);
      },
      drag: event => {
        // Hide the cue arrows if they are visible.
        this.wasDraggedProperty.set(true);

        // Clear the flux sensor if it is dragged while the main model is paused.  This prevents the display of flux
        // readings that are incorrect for the altitude at which the sensor is positioned.
        if (!isPlayingProperty.value) {
          model.fluxSensor.clearEnergyTrackers();
        }

        // Get the view position of the sensor.
        const viewPoint = fluxSensorNode.globalToParentPoint(event.pointer.point).subtract(startOffset);

        // Constrain the Y position in model space to just below the top of the atmosphere at the high end and just
        // above the ground at the low end.
        const modelY = FLUX_SENSOR_VERTICAL_RANGE.constrainValue(modelViewTransform.viewToModelY(viewPoint.y));

        // Set the altitude of the flux sensor based on the drag action.
        model.fluxSensor.altitudeProperty.set(modelY);
      },
      end: () => {
        model.fluxSensor.isDraggingProperty.set(false);
      },
      useInputListenerCursor: true,
      // phet-io
      tandem: options.tandem.createTandem('dragListener')
    }));

    // Add sound generation.
    this.soundGenerator = new FluxMeterSoundGenerator(model.fluxSensor.visibleLightUpEnergyRateTracker.energyRateProperty, model.fluxSensor.visibleLightDownEnergyRateTracker.energyRateProperty, model.fluxSensor.infraredLightUpEnergyRateTracker.energyRateProperty, model.fluxSensor.infraredLightDownEnergyRateTracker.energyRateProperty, {
      initialOutputLevel: 0.15,
      enableControlProperties: [isPlayingProperty, visibleProperty]
    });
    soundManager.addSoundGenerator(this.soundGenerator, {
      sonificationLevel: SoundLevelEnum.EXTRA,
      associatedViewNode: this
    });

    // Make some things available to the methods.
    this.isModelPlayingProperty = isPlayingProperty;

    // never disposed, no need to unlink
    model.fluxSensor.altitudeProperty.link(altitude => {
      fluxSensorNode.centerY = modelViewTransform.modelToViewY(altitude);
    });
  }
  step(dt) {
    this.soundGenerator.step(dt);
    this.sunlightFluxDisplay.updateFluxArrows();
    this.infraredFluxDisplay.updateFluxArrows();
  }
  reset() {
    this.wasDraggedProperty.reset();
    this.zoomFactorProperty.reset();
    this.soundGenerator.reset();
  }
}
/**
 * An inner class that implements a display for energy flux in the up and down directions.  The display consists of a
 * background with two arrows, one that grows upwards and another that grows down.  The background includes reference
 * lines so that the display can be zoomed in and out.
 *
 * @param energyDownProperty
 * @param energyUpProperty
 * @param fluxToArrowLengthMultiplierProperty -  multiplier maps the flux values from the meter to the arrow lengths
 * @param labelString
 * @param baseColor
 * @param providedOptions
 */
class EnergyFluxDisplay extends Node {
  constructor(energyDownProperty, energyUpProperty, fluxToArrowLengthMultiplierProperty, labelStringProperty, baseColorProperty, providedOptions) {
    const options = optionize()({
      // lots of empirically determined values here, chosen to make the thing look decent
      height: 340,
      arrowNodeOptions: {
        headHeight: 16,
        headWidth: 16,
        tailWidth: 8,
        fill: baseColorProperty
      }
    }, providedOptions);
    super();
    this.energyDownProperty = energyDownProperty;
    this.energyUpProperty = energyUpProperty;
    this.fluxToArrowLengthMultiplierProperty = fluxToArrowLengthMultiplierProperty;
    const labelText = new Text(labelStringProperty, {
      font: GreenhouseEffectConstants.CONTENT_FONT,
      maxWidth: EnergyFluxDisplay.WIDTH
    });
    this.addChild(labelText);

    // Create and add a rectangle that is invisible but acts as a container for the energy arrows and reference lines.
    // Its shape is used as a clip area for the display so that arrows and reference lines don't go beyond the height of
    // this display.
    const boundsRectangle = new Rectangle(0, 0, EnergyFluxDisplay.WIDTH, options.height, 5, 5);
    this.addChild(boundsRectangle);

    // Make the size available to the methods.
    this.size = new Dimension2(boundsRectangle.width, boundsRectangle.height);
    this.addChild(new VBox({
      children: [labelText, boundsRectangle],
      spacing: 5
    }));

    // Add the Path that will display reference lines behind the arrows.
    const referenceLinesNode = new Path(null, {
      stroke: Color.GRAY.withAlpha(0.3),
      lineWidth: 2
    });
    boundsRectangle.addChild(referenceLinesNode);

    // Set a clip area so that the arrows don't go outside the background.
    boundsRectangle.clipArea = Shape.bounds(boundsRectangle.getRectBounds());

    // Create and add the arrows.
    this.downArrow = new ArrowNode(boundsRectangle.width / 2, boundsRectangle.height / 2, boundsRectangle.width / 2, boundsRectangle.height / 2, options.arrowNodeOptions);
    this.upArrow = new ArrowNode(boundsRectangle.width / 2, boundsRectangle.height / 2, boundsRectangle.width / 2, boundsRectangle.height / 2, options.arrowNodeOptions);
    boundsRectangle.addChild(this.downArrow);
    boundsRectangle.addChild(this.upArrow);
    const darkenedBaseColorProperty = new DerivedProperty([baseColorProperty], color => color.colorUtilsDarker(0.25));

    // Add a horizontal line at the origin of the arrows that can be seen when the arrows have no length.
    const centerIndicatorLine = new Line(0, 0, boundsRectangle.width * 0.5, 0, {
      centerX: boundsRectangle.width / 2,
      centerY: boundsRectangle.height / 2,
      stroke: darkenedBaseColorProperty,
      lineWidth: 3
    });
    boundsRectangle.addChild(centerIndicatorLine);

    // Define a reference flux value that will be used to define the spacing between the reference marks.  This value
    // was empirically determined to provide the desired look, and is based on the flux values that naturally occur in
    // the model.
    const referenceFlux = 5E6;

    // Update the background reference marks when the zoom level changes.
    fluxToArrowLengthMultiplierProperty.link(fluxToArrowLengthMultiplier => {
      const referenceLinesShape = new Shape();
      const interReferenceLineDistance = fluxToArrowLengthMultiplier * referenceFlux;
      const referenceLineWidth = boundsRectangle.width * 0.5; // empirically determined

      // Loop, creating the shape that will represent the reference lines.
      for (let distanceFromCenter = interReferenceLineDistance; distanceFromCenter < boundsRectangle.height / 2; distanceFromCenter += interReferenceLineDistance) {
        // Add lines in both the upward and downward directions.
        referenceLinesShape.moveTo(0, distanceFromCenter);
        referenceLinesShape.lineTo(referenceLineWidth, distanceFromCenter);
        referenceLinesShape.moveTo(0, -distanceFromCenter);
        referenceLinesShape.lineTo(referenceLineWidth, -distanceFromCenter);
      }

      // Set the shape and its position.
      referenceLinesNode.setShape(referenceLinesShape);
      referenceLinesNode.centerX = boundsRectangle.width / 2;
      referenceLinesNode.centerY = boundsRectangle.height / 2;

      // Update the flux arrows for the new multiplier.
      this.updateFluxArrows();
    });
  }

  /**
   * Update the arrows that represent the amount of flux.  This is done as a method called during a step instead of
   * being based on linkages to the energy properties for better performance, see
   * https://github.com/phetsims/greenhouse-effect/issues/265#issuecomment-1405870321.
   */
  updateFluxArrows() {
    // update the down arrow
    const energyDown = this.energyDownProperty.value;
    const downArrowHeight = this.size.height / 2 + this.getArrowHeightFromFlux(energyDown);
    this.downArrow.visible = Math.abs(energyDown) > 0;
    this.downArrow.setTip(this.size.width / 2, downArrowHeight);

    // update the up arrow
    const energyUp = this.energyUpProperty.value;
    const upArrowHeight = this.size.height / 2 - this.getArrowHeightFromFlux(energyUp);
    this.upArrow.visible = Math.abs(energyUp) > 0;
    this.upArrow.setTip(this.size.width / 2, upArrowHeight);
  }

  /**
   * Map the flux to a value for the height of the flux arrow.
   */
  getArrowHeightFromFlux(flux) {
    return flux * this.fluxToArrowLengthMultiplierProperty.value;
  }

  // an empirically determined value used in part to set the overall width of the panel
  static WIDTH = 45;
}

/**
 * An inner class to support alternative input for the flux sensor with AccessibleSlider so that arrow keys
 * change the altitude.
 */

class FluxSensorNode extends AccessibleSlider(Node, 0) {
  constructor(fluxSensor, modelViewTransform, providedOptions) {
    const options = optionize()({
      valueProperty: fluxSensor.altitudeProperty,
      enabledRangeProperty: new Property(FLUX_SENSOR_VERTICAL_RANGE),
      keyboardStep: FLUX_SENSOR_VERTICAL_RANGE.getLength() / 30,
      a11yCreateAriaValueText: value => `${Utils.roundSymmetric(value)} m`
    }, providedOptions);
    super(options);
    const fluxSensorWidth = modelViewTransform.modelToViewDeltaX(fluxSensor.size.width);
    const fluxSensorTouchAreaYDilation = 10;
    const sensorNode = new Rectangle(0, 0, fluxSensorWidth, SENSOR_VIEW_HEIGHT, 5, 5, {
      stroke: SENSOR_STROKE_COLOR,
      fill: SENSOR_FILL_COLOR,
      lineWidth: 2,
      cursor: 'ns-resize',
      center: modelViewTransform.modelToViewXY(fluxSensor.xPosition, fluxSensor.altitudeProperty.value),
      touchArea: Shape.rectangle(0, -fluxSensorTouchAreaYDilation, fluxSensorWidth, SENSOR_VIEW_HEIGHT + fluxSensorTouchAreaYDilation * 2)
    });
    this.addChild(sensorNode);
  }
}
greenhouseEffect.register('FluxMeterNode', FluxMeterNode);
export default FluxMeterNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiVXRpbHMiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiU2hhcGUiLCJvcHRpb25pemUiLCJBcnJvd05vZGUiLCJNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAiLCJQaGV0Q29sb3JTY2hlbWUiLCJXaXJlTm9kZSIsIkNvbG9yIiwiRHJhZ0xpc3RlbmVyIiwiSEJveCIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiQWNjZXNzaWJsZVNsaWRlciIsIlBhbmVsIiwiU291bmRMZXZlbEVudW0iLCJzb3VuZE1hbmFnZXIiLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MiLCJHcmVlbmhvdXNlRWZmZWN0Q29sb3JzIiwiR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyIsIkdyZWVuaG91c2VFZmZlY3RPcHRpb25zIiwiTGF5ZXJzTW9kZWwiLCJGbHV4TWV0ZXJTb3VuZEdlbmVyYXRvciIsInN1bmxpZ2h0U3RyaW5nUHJvcGVydHkiLCJpbmZyYXJlZFN0cmluZ1Byb3BlcnR5IiwiZW5lcmd5Rmx1eFN0cmluZ1Byb3BlcnR5IiwiZmx1eE1ldGVyIiwiTUVURVJfU1BBQ0lORyIsIlNFTlNPUl9TVFJPS0VfQ09MT1IiLCJTRU5TT1JfRklMTF9DT0xPUiIsIkNVRV9BUlJPV19MRU5HVEgiLCJGTFVYX1BBTkVMX1hfTUFSR0lOIiwiTk9NSU5BTF9GTFVYX1RPX0FSUk9XX0xFTkdUSF9NVUxUSVBMSUVSIiwiRkxVWF9BUlJPV19aT09NX0ZBQ1RPUiIsIk5VTUJFUl9PRl9aT09NX09VVF9MRVZFTFMiLCJOVU1CRVJfT0ZfWk9PTV9JTl9MRVZFTFMiLCJDVUVfQVJST1dfT1BUSU9OUyIsImZpbGwiLCJsaW5lV2lkdGgiLCJoZWFkV2lkdGgiLCJoZWFkSGVpZ2h0IiwidGFpbFdpZHRoIiwiU0VOU09SX1ZJRVdfSEVJR0hUIiwiRkxVWF9TRU5TT1JfVkVSVElDQUxfUkFOR0UiLCJIRUlHSFRfT0ZfQVRNT1NQSEVSRSIsIkZsdXhNZXRlck5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJ2aXNpYmxlUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJvYnNlcnZhdGlvbldpbmRvd1ZpZXdCb3VuZHMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaW5jbHVkZVpvb21CdXR0b25zIiwid2lyZU5vZGUiLCJ3aXJlU2Vuc29yQXR0YWNobWVudFBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJ3aXJlTWV0ZXJBdHRhY2htZW50UG9zaXRpb25Qcm9wZXJ0eSIsInN0cm9rZSIsImFkZENoaWxkIiwidGl0bGVUZXh0IiwiZm9udCIsIlRJVExFX0ZPTlQiLCJtYXhXaWR0aCIsIkVuZXJneUZsdXhEaXNwbGF5IiwiV0lEVEgiLCJ6b29tRmFjdG9yUHJvcGVydHkiLCJyYW5nZSIsImZsdXhUb0luZGljYXRvckxlbmd0aFByb3BlcnR5Iiwiem9vbUZhY3RvciIsIk1hdGgiLCJwb3ciLCJzdW5saWdodEZsdXhEaXNwbGF5IiwiZmx1eFNlbnNvciIsInZpc2libGVMaWdodERvd25FbmVyZ3lSYXRlVHJhY2tlciIsImVuZXJneVJhdGVQcm9wZXJ0eSIsInZpc2libGVMaWdodFVwRW5lcmd5UmF0ZVRyYWNrZXIiLCJzdW5saWdodENvbG9yUHJvcGVydHkiLCJpbmZyYXJlZEZsdXhEaXNwbGF5IiwiaW5mcmFyZWRMaWdodERvd25FbmVyZ3lSYXRlVHJhY2tlciIsImluZnJhcmVkTGlnaHRVcEVuZXJneVJhdGVUcmFja2VyIiwiaW5mcmFyZWRDb2xvclByb3BlcnR5IiwiZmx1eEFycm93cyIsImNoaWxkcmVuIiwic3BhY2luZyIsInpvb21CdXR0b25zIiwiYXBwbHlab29tSW4iLCJjdXJyZW50Wm9vbSIsImFwcGx5Wm9vbU91dCIsIm1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zIiwiZ2xhc3NSYWRpdXMiLCJidXR0b25PcHRpb25zIiwiYmFzZUNvbG9yIiwiUEhFVF9MT0dPX0JMVUUiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJjb250ZW50Q2hpbGRyZW4iLCJwdXNoIiwiY29udGVudCIsImZsdXhTZW5zb3JOb2RlIiwiRmx1eFNlbnNvck5vZGUiLCJzdGFydERyYWciLCJpc0RyYWdnaW5nUHJvcGVydHkiLCJzZXQiLCJkcmFnIiwid2FzRHJhZ2dlZFByb3BlcnR5IiwidmFsdWUiLCJjbGVhckVuZXJneVRyYWNrZXJzIiwiZW5kRHJhZyIsImN1ZWluZ0Fycm93c1Nob3duUHJvcGVydHkiLCJjdWVpbmdBcnJvd3NFbmFibGVkUHJvcGVydHkiLCJ3YXNEcmFnZ2VkIiwiY3VlaW5nQXJyb3dzRW5hYmxlZCIsImN1aW5nQXJyb3dzTm9kZSIsImN1cnNvciIsImNlbnRlclgiLCJib3VuZHMiLCJtYXhYIiwiYWx0aXR1ZGVQcm9wZXJ0eSIsImxpbmsiLCJhbHRpdHVkZSIsImNlbnRlclkiLCJtb2RlbFRvVmlld1kiLCJmbHV4UGFuZWwiLCJ4TWFyZ2luIiwidmlzaWJsZSIsInN0YXJ0T2Zmc2V0IiwiWkVSTyIsImFkZElucHV0TGlzdGVuZXIiLCJzdGFydCIsImV2ZW50IiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsInN1YnRyYWN0IiwiY2VudGVyIiwidmlld1BvaW50IiwibW9kZWxZIiwiY29uc3RyYWluVmFsdWUiLCJ2aWV3VG9Nb2RlbFkiLCJ5IiwiZW5kIiwidXNlSW5wdXRMaXN0ZW5lckN1cnNvciIsInNvdW5kR2VuZXJhdG9yIiwiaW5pdGlhbE91dHB1dExldmVsIiwiZW5hYmxlQ29udHJvbFByb3BlcnRpZXMiLCJhZGRTb3VuZEdlbmVyYXRvciIsInNvbmlmaWNhdGlvbkxldmVsIiwiRVhUUkEiLCJhc3NvY2lhdGVkVmlld05vZGUiLCJpc01vZGVsUGxheWluZ1Byb3BlcnR5Iiwic3RlcCIsImR0IiwidXBkYXRlRmx1eEFycm93cyIsInJlc2V0IiwiZW5lcmd5RG93blByb3BlcnR5IiwiZW5lcmd5VXBQcm9wZXJ0eSIsImZsdXhUb0Fycm93TGVuZ3RoTXVsdGlwbGllclByb3BlcnR5IiwibGFiZWxTdHJpbmdQcm9wZXJ0eSIsImJhc2VDb2xvclByb3BlcnR5IiwiaGVpZ2h0IiwiYXJyb3dOb2RlT3B0aW9ucyIsImxhYmVsVGV4dCIsIkNPTlRFTlRfRk9OVCIsImJvdW5kc1JlY3RhbmdsZSIsInNpemUiLCJ3aWR0aCIsInJlZmVyZW5jZUxpbmVzTm9kZSIsIkdSQVkiLCJ3aXRoQWxwaGEiLCJjbGlwQXJlYSIsImdldFJlY3RCb3VuZHMiLCJkb3duQXJyb3ciLCJ1cEFycm93IiwiZGFya2VuZWRCYXNlQ29sb3JQcm9wZXJ0eSIsImNvbG9yIiwiY29sb3JVdGlsc0RhcmtlciIsImNlbnRlckluZGljYXRvckxpbmUiLCJyZWZlcmVuY2VGbHV4IiwiZmx1eFRvQXJyb3dMZW5ndGhNdWx0aXBsaWVyIiwicmVmZXJlbmNlTGluZXNTaGFwZSIsImludGVyUmVmZXJlbmNlTGluZURpc3RhbmNlIiwicmVmZXJlbmNlTGluZVdpZHRoIiwiZGlzdGFuY2VGcm9tQ2VudGVyIiwibW92ZVRvIiwibGluZVRvIiwic2V0U2hhcGUiLCJlbmVyZ3lEb3duIiwiZG93bkFycm93SGVpZ2h0IiwiZ2V0QXJyb3dIZWlnaHRGcm9tRmx1eCIsImFicyIsInNldFRpcCIsImVuZXJneVVwIiwidXBBcnJvd0hlaWdodCIsImZsdXgiLCJ2YWx1ZVByb3BlcnR5IiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJrZXlib2FyZFN0ZXAiLCJnZXRMZW5ndGgiLCJhMTF5Q3JlYXRlQXJpYVZhbHVlVGV4dCIsInJvdW5kU3ltbWV0cmljIiwiZmx1eFNlbnNvcldpZHRoIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJmbHV4U2Vuc29yVG91Y2hBcmVhWURpbGF0aW9uIiwic2Vuc29yTm9kZSIsIm1vZGVsVG9WaWV3WFkiLCJ4UG9zaXRpb24iLCJ0b3VjaEFyZWEiLCJyZWN0YW5nbGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZsdXhNZXRlck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIFwiRW5lcmd5IEZsdXhcIiBtZXRlciBmb3IgR3JlZW5ob3VzZSBFZmZlY3QuIFRoaXMgaW5jbHVkZXMgYSBkcmFnZ2FibGUgc2Vuc29yIHRoYXQgY2FuIG1vdmUgYWJvdXQgdGhlIE9ic2VydmF0aW9uXHJcbiAqIFdpbmRvdyBhbmQgZGV0ZWN0IHRoZSBmbHV4IG9mIHN1bmxpZ2h0IGFuZCBpbmZyYXJlZCBwaG90b25zLiBBIGdyYXBoaWNhbCByZXByZXNlbnRhdGlvbiBvZiBmbHV4IGlzIGRpc3BsYXllZFxyXG4gKiBpbiBhIHBhbmVsIHdpdGggbGFyZ2UgYXJyb3dzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUsIHsgQXJyb3dOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgV2lyZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1dpcmVOb2RlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIENvbG9yUHJvcGVydHksIERyYWdMaXN0ZW5lciwgSEJveCwgTGluZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFJlY3RhbmdsZSwgU2NlbmVyeUV2ZW50LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFjY2Vzc2libGVTbGlkZXIsIHsgQWNjZXNzaWJsZVNsaWRlck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYWNjZXNzaWJpbGl0eS9BY2Nlc3NpYmxlU2xpZGVyLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBTb3VuZExldmVsRW51bSBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9Tb3VuZExldmVsRW51bS5qcyc7XHJcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyBmcm9tICcuLi8uLi9HcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0Q29sb3JzIGZyb20gJy4uL0dyZWVuaG91c2VFZmZlY3RDb2xvcnMuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyBmcm9tICcuLi9HcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RPcHRpb25zIGZyb20gJy4uL0dyZWVuaG91c2VFZmZlY3RPcHRpb25zLmpzJztcclxuaW1wb3J0IEZsdXhNZXRlciBmcm9tICcuLi9tb2RlbC9GbHV4TWV0ZXIuanMnO1xyXG5pbXBvcnQgRmx1eFNlbnNvciBmcm9tICcuLi9tb2RlbC9GbHV4U2Vuc29yLmpzJztcclxuaW1wb3J0IExheWVyc01vZGVsIGZyb20gJy4uL21vZGVsL0xheWVyc01vZGVsLmpzJztcclxuaW1wb3J0IEZsdXhNZXRlclNvdW5kR2VuZXJhdG9yIGZyb20gJy4vRmx1eE1ldGVyU291bmRHZW5lcmF0b3IuanMnO1xyXG5cclxuY29uc3Qgc3VubGlnaHRTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLnN1bmxpZ2h0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGluZnJhcmVkU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5pbmZyYXJlZFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBlbmVyZ3lGbHV4U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5mbHV4TWV0ZXIuZW5lcmd5Rmx1eFN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY29uc3QgTUVURVJfU1BBQ0lORyA9IDg7IC8vIHNwYWNpbmcgdXNlZCBpbiBhIGZldyBwbGFjZXMgZm9yIGxheW91dCwgaW4gdmlldyBjb29yZGluYXRlc1xyXG5jb25zdCBTRU5TT1JfU1RST0tFX0NPTE9SID0gJ3JnYigyNTQsMTUzLDE4KSc7XHJcbmNvbnN0IFNFTlNPUl9GSUxMX0NPTE9SID0gJ3JnYmEoMjAwLDIwMCwyMDAsMC42KSc7XHJcbmNvbnN0IENVRV9BUlJPV19MRU5HVEggPSAyODsgLy8gbGVuZ3RoIG9mIHRoZSAnZHJhZyBjdWUnIGFycm93cyBhcm91bmQgdGhlIGZsdXggc2Vuc29yXHJcbmNvbnN0IEZMVVhfUEFORUxfWF9NQVJHSU4gPSA2O1xyXG5cclxuLy8gbXVsdGlwbGllciB1c2VkIHRvIG1hcCBlbmVyZ3kgZmx1eCB2YWx1ZXMgdG8gYXJyb3cgbGVuZ3RocyBpbiBub21pbmFsICh1bi16b29tZWQpIGNhc2UsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuY29uc3QgTk9NSU5BTF9GTFVYX1RPX0FSUk9XX0xFTkdUSF9NVUxUSVBMSUVSID0gNUUtNjtcclxuXHJcbi8vIFpvb20gZmFjdG9yIGZvciB6b29taW5nIGluIGFuZCBvdXQgaW4gdGhlIGZsdXggbWV0ZXIsIG9ubHkgdXNlZCBpZiB6b29tIGlzIGVuYWJsZWQuICBUaGlzIHZhbHVlIHdhcyBlbXBpcmljYWxseVxyXG4vLyBkZXRlcm1pbmVkIGluIGNvbmp1bmN0aW9uIHdpdGggb3RoZXJzIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBtYXggb3V0Z29pbmcgSVIgd2lsbCBmaXggaW4gdGhlIGZsdXggbWV0ZXIuXHJcbmNvbnN0IEZMVVhfQVJST1dfWk9PTV9GQUNUT1IgPSAyLjU7XHJcblxyXG4vLyB0aGUgbnVtYmVyIG9mIHpvb20gbGV2ZWxzIGluIGVhY2ggZGlyZWN0aW9uXHJcbmNvbnN0IE5VTUJFUl9PRl9aT09NX09VVF9MRVZFTFMgPSAyO1xyXG5jb25zdCBOVU1CRVJfT0ZfWk9PTV9JTl9MRVZFTFMgPSAxO1xyXG5cclxuY29uc3QgQ1VFX0FSUk9XX09QVElPTlMgPSB7XHJcbiAgZmlsbDogU0VOU09SX1NUUk9LRV9DT0xPUixcclxuICBsaW5lV2lkdGg6IDAuNSxcclxuICBoZWFkV2lkdGg6IDIwLFxyXG4gIGhlYWRIZWlnaHQ6IDE2LFxyXG4gIHRhaWxXaWR0aDogN1xyXG59O1xyXG5cclxuLy8gVGhlIGhlaWdodCBvZiB0aGUgc2Vuc29yIGluIHRoZSB2aWV3LiAgVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB0aGUgc2Vuc29yIG1vZGVsIGRvZXNuJ3QgaGF2ZSBhbnkgeS1kaW1lbnNpb24gaGVpZ2h0LFxyXG4vLyBzbyB3ZSB1c2UgYW5kIGFyYml0cmFyeSB2YWx1ZSB0aGF0IGxvb2tzIGRlY2VudCBpbiB0aGUgdmlldy5cclxuY29uc3QgU0VOU09SX1ZJRVdfSEVJR0hUID0gMTA7XHJcblxyXG4vLyBUaGUgdmVydGljYWwgcmFuZ2Ugb3ZlciB3aGljaCB0aGUgZmx1eCBtZXRlciBpcyBhbGxvd2VkIHRvIG1vdmUuICBUaGUgbG93ZXIgZW5kIGFsbG93cyB0aGUgc2Vuc29yIHRvIGdldCBjbG9zZSB0byB0aGVcclxuLy8gZ3JvdW5kIGJ1dCBub3Qgb3ZlcmxhcCB3aXRoIFVJIGVsZW1lbnRzIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyZWVuaG91c2UtZWZmZWN0L2lzc3Vlcy8yNDgpLiAgVGhlIHVwcGVyXHJcbi8vIGVuZCBtYWtlcyBzdXJlIHRoYXQgdGhlIHNlbnNvciBzdGF5cyBmdWxseSB3aXRoaW4gdGhlIG9ic2VydmF0aW9uIHdpbmRvdy5cclxuY29uc3QgRkxVWF9TRU5TT1JfVkVSVElDQUxfUkFOR0UgPSBuZXcgUmFuZ2UoIDc1MCwgTGF5ZXJzTW9kZWwuSEVJR0hUX09GX0FUTU9TUEhFUkUgLSA3MDAgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIFdoZXRoZXIgdG8gaW5jbHVkZSBhIFpvb21CdXR0b25Hcm91cCBvbiB0aGlzIEZsdXhNZXRlck5vZGUuIEJ1dHRvbnMgYWxsb3cgXCJ6b29taW5nXCIgaW50byB0aGUgbWV0ZXIgYnkgc2NhbGluZ1xyXG4gIC8vIHRoZSBkaXNwbGF5IGFycm93cy5cclxuICBpbmNsdWRlWm9vbUJ1dHRvbnM/OiBib29sZWFuO1xyXG59O1xyXG50eXBlIFBhcmVudE9wdGlvbnMgPSBOb2RlT3B0aW9ucztcclxuZXhwb3J0IHR5cGUgRmx1eE1ldGVyTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQYXJlbnRPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5jbGFzcyBGbHV4TWV0ZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8vIHRoZSBwYW5lbCB0aGF0IGNvbnRhaW5zIHRoZSBkaXNwbGF5IHNob3dpbmcgZW5lcmd5IGZsdXgsIHB1YmxpYyBmb3IgcG9zaXRpb25pbmcgaW4gdGhlIHZpZXdcclxuICBwdWJsaWMgcmVhZG9ubHkgZmx1eFBhbmVsOiBQYW5lbDtcclxuXHJcbiAgLy8gYSBQcm9wZXJ0eSB0aGF0IHRyYWNrcyB3aGV0aGVyIHRoZSBzZW5zb3Igd2FzIGRyYWdnZWQgc2luY2Ugc3RhcnR1cCBvciBsYXN0IHJlc2V0LCB1c2VkIHRvIGhpZGUgdGhlIHF1ZXVpbmcgZXJyb3JzXHJcbiAgcHJpdmF0ZSByZWFkb25seSB3YXNEcmFnZ2VkUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcclxuXHJcbiAgLy8gem9vbSBmYWN0b3IsIG9ubHkgdXNlZCBpZiB0aGUgem9vbSBmZWF0dXJlIGlzIGVuYWJsZWRcclxuICBwcml2YXRlIHJlYWRvbmx5IHpvb21GYWN0b3JQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcblxyXG4gIC8vIHNvdW5kIGdlbmVyYXRvciBmb3IgdGhpcyBub2RlXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzb3VuZEdlbmVyYXRvcjogRmx1eE1ldGVyU291bmRHZW5lcmF0b3I7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgaXNNb2RlbFBsYXlpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIGRpc3BsYXlzIGZvciB0aGUgZmx1eCwgd2hpY2ggY29uc2lzdCBvZiBhcnJvd3MgYW5kIGEgYmFja2dyb3VuZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3VubGlnaHRGbHV4RGlzcGxheTogRW5lcmd5Rmx1eERpc3BsYXk7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBpbmZyYXJlZEZsdXhEaXNwbGF5OiBFbmVyZ3lGbHV4RGlzcGxheTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIG1vZGVsIC0gbW9kZWwgY29tcG9uZW50IGZvciB0aGUgRmx1eE1ldGVyXHJcbiAgICogQHBhcmFtIGlzUGxheWluZ1Byb3BlcnR5IC0gYSBib29sZWFuIFByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhlIG1vZGVsIGluIHdoaWNoIHRoZSBmbHV4IG1ldGVyIHJlc2lkZXMgaXNcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nXHJcbiAgICogQHBhcmFtIHZpc2libGVQcm9wZXJ0eSAtIGEgYm9vbGVhbiBQcm9wZXJ0eSB0aGF0IGNvbnRyb2xzIHdoZXRoZXIgdGhpcyBub2RlIGlzIHZpc2libGVcclxuICAgKiBAcGFyYW0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIG9ic2VydmF0aW9uV2luZG93Vmlld0JvdW5kcyAtIGJvdW5kcyBmb3IgdGhlIE9ic2VydmF0aW9uV2luZG93IHRvIGNvbnN0cmFpbiBkcmFnZ2luZyBvZiB0aGUgc2Vuc29yXHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IEZsdXhNZXRlcixcclxuICAgICAgICAgICAgICAgICAgICAgIGlzUGxheWluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHZpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZhdGlvbldpbmRvd1ZpZXdCb3VuZHM6IEJvdW5kczIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBGbHV4TWV0ZXJOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEZsdXhNZXRlck5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xyXG4gICAgICBpbmNsdWRlWm9vbUJ1dHRvbnM6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbm9kZSB0aGF0IHJlcHJlc2VudHMgdGhlIHdpcmUgY29ubmVjdGluZyB0aGUgcGFuZWwgYW5kIHRoZSBzZW5zb3IuXHJcbiAgICBjb25zdCB3aXJlTm9kZSA9IG5ldyBXaXJlTm9kZShcclxuICAgICAgbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgICBbIG1vZGVsLndpcmVTZW5zb3JBdHRhY2htZW50UG9zaXRpb25Qcm9wZXJ0eSBdLFxyXG4gICAgICAgIHBvc2l0aW9uID0+IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb3NpdGlvbiApXHJcbiAgICAgICksXHJcbiAgICAgIG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAxMDAsIDAgKSApLFxyXG4gICAgICBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICAgIFsgbW9kZWwud2lyZU1ldGVyQXR0YWNobWVudFBvc2l0aW9uUHJvcGVydHkgXSxcclxuICAgICAgICBwb3NpdGlvbiA9PiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggcG9zaXRpb24gKVxyXG4gICAgICApLFxyXG4gICAgICBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggLTEwMCwgMCApICksIHtcclxuICAgICAgICBzdHJva2U6IG5ldyBDb2xvciggOTAsIDkwLCA5MCApLFxyXG4gICAgICAgIGxpbmVXaWR0aDogNVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggd2lyZU5vZGUgKTtcclxuXHJcbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggZW5lcmd5Rmx1eFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6ICggRkxVWF9QQU5FTF9YX01BUkdJTiAqIDIgKyBFbmVyZ3lGbHV4RGlzcGxheS5XSURUSCAqIDIgKyBNRVRFUl9TUEFDSU5HICkgKiAwLjlcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnpvb21GYWN0b3JQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAtTlVNQkVSX09GX1pPT01fT1VUX0xFVkVMUywgTlVNQkVSX09GX1pPT01fSU5fTEVWRUxTIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBmbHV4VG9JbmRpY2F0b3JMZW5ndGhQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy56b29tRmFjdG9yUHJvcGVydHkgXSwgem9vbUZhY3RvciA9PlxyXG4gICAgICBOT01JTkFMX0ZMVVhfVE9fQVJST1dfTEVOR1RIX01VTFRJUExJRVIgKiBNYXRoLnBvdyggRkxVWF9BUlJPV19aT09NX0ZBQ1RPUiwgem9vbUZhY3RvciApXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuc3VubGlnaHRGbHV4RGlzcGxheSA9IG5ldyBFbmVyZ3lGbHV4RGlzcGxheShcclxuICAgICAgbW9kZWwuZmx1eFNlbnNvci52aXNpYmxlTGlnaHREb3duRW5lcmd5UmF0ZVRyYWNrZXIuZW5lcmd5UmF0ZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5mbHV4U2Vuc29yLnZpc2libGVMaWdodFVwRW5lcmd5UmF0ZVRyYWNrZXIuZW5lcmd5UmF0ZVByb3BlcnR5LFxyXG4gICAgICBmbHV4VG9JbmRpY2F0b3JMZW5ndGhQcm9wZXJ0eSxcclxuICAgICAgc3VubGlnaHRTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgR3JlZW5ob3VzZUVmZmVjdENvbG9ycy5zdW5saWdodENvbG9yUHJvcGVydHlcclxuICAgICk7XHJcbiAgICB0aGlzLmluZnJhcmVkRmx1eERpc3BsYXkgPSBuZXcgRW5lcmd5Rmx1eERpc3BsYXkoXHJcbiAgICAgIG1vZGVsLmZsdXhTZW5zb3IuaW5mcmFyZWRMaWdodERvd25FbmVyZ3lSYXRlVHJhY2tlci5lbmVyZ3lSYXRlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmZsdXhTZW5zb3IuaW5mcmFyZWRMaWdodFVwRW5lcmd5UmF0ZVRyYWNrZXIuZW5lcmd5UmF0ZVByb3BlcnR5LFxyXG4gICAgICBmbHV4VG9JbmRpY2F0b3JMZW5ndGhQcm9wZXJ0eSxcclxuICAgICAgaW5mcmFyZWRTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgR3JlZW5ob3VzZUVmZmVjdENvbG9ycy5pbmZyYXJlZENvbG9yUHJvcGVydHlcclxuICAgICk7XHJcbiAgICBjb25zdCBmbHV4QXJyb3dzID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgdGhpcy5zdW5saWdodEZsdXhEaXNwbGF5LCB0aGlzLmluZnJhcmVkRmx1eERpc3BsYXkgXSxcclxuICAgICAgc3BhY2luZzogTUVURVJfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHpvb21CdXR0b25zID0gbmV3IE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCggdGhpcy56b29tRmFjdG9yUHJvcGVydHksIHtcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgYXBwbHlab29tSW46ICggY3VycmVudFpvb206IG51bWJlciApID0+IGN1cnJlbnRab29tICsgMSxcclxuICAgICAgYXBwbHlab29tT3V0OiAoIGN1cnJlbnRab29tOiBudW1iZXIgKSA9PiBjdXJyZW50Wm9vbSAtIDEsXHJcbiAgICAgIG1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgZ2xhc3NSYWRpdXM6IDZcclxuICAgICAgfSxcclxuICAgICAgYnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLlBIRVRfTE9HT19CTFVFXHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnem9vbUJ1dHRvbkdyb3VwJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gem9vbSBidXR0b25zIGNvbmRpdGlvbmFsbHkgYWRkZWQgdG8gdGhlIHZpZXcsIGJ1dCBhbHdheXMgY3JlYXRlZCBiZWNhdXNlIEkgdGhpbmsgdGhhdCBpcyByZXF1aXJlZCBmb3IgUGhFVC1pT1xyXG4gICAgY29uc3QgY29udGVudENoaWxkcmVuOiBOb2RlW10gPSBbIHRpdGxlVGV4dCwgZmx1eEFycm93cyBdO1xyXG4gICAgb3B0aW9ucy5pbmNsdWRlWm9vbUJ1dHRvbnMgJiYgY29udGVudENoaWxkcmVuLnB1c2goIHpvb21CdXR0b25zICk7XHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHsgY2hpbGRyZW46IGNvbnRlbnRDaGlsZHJlbiwgc3BhY2luZzogTUVURVJfU1BBQ0lORyB9ICk7XHJcblxyXG4gICAgY29uc3QgZmx1eFNlbnNvck5vZGUgPSBuZXcgRmx1eFNlbnNvck5vZGUoIG1vZGVsLmZsdXhTZW5zb3IsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICBzdGFydERyYWc6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5mbHV4U2Vuc29yLmlzRHJhZ2dpbmdQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgfSxcclxuICAgICAgZHJhZzogKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBIaWRlIHRoZSBjdWUgYXJyb3dzIGlmIHRoZXkgYXJlIHZpc2libGUuXHJcbiAgICAgICAgdGhpcy53YXNEcmFnZ2VkUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcblxyXG4gICAgICAgIC8vIENsZWFyIHRoZSBmbHV4IHNlbnNvciBpZiBpdCBpcyBkcmFnZ2VkIHdoaWxlIHRoZSBtYWluIG1vZGVsIGlzIHBhdXNlZC4gIFRoaXMgcHJldmVudHMgdGhlIGRpc3BsYXkgb2YgZmx1eFxyXG4gICAgICAgIC8vIHJlYWRpbmdzIHRoYXQgYXJlIGluY29ycmVjdCBmb3IgdGhlIGFsdGl0dWRlIGF0IHdoaWNoIHRoZSBzZW5zb3IgaXMgcG9zaXRpb25lZC5cclxuICAgICAgICBpZiAoICFpc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgIG1vZGVsLmZsdXhTZW5zb3IuY2xlYXJFbmVyZ3lUcmFja2VycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgZW5kRHJhZzogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLmZsdXhTZW5zb3IuaXNEcmFnZ2luZ1Byb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZmx1eFNlbnNvck5vZGUgKTtcclxuXHJcbiAgICAvLyBUaGUgY3VlaW5nIGFycm93cyBmb3IgdGhlIGZsdXggc2Vuc29yIGFyZSBzaG93biBpbml0aWFsbHkgaWYgZ2xvYmFsbHkgZW5hYmxlZCwgdGhlbiBoaWRkZW4gYWZ0ZXIgdGhlIGZpcnN0IGRyYWcuXHJcbiAgICB0aGlzLndhc0RyYWdnZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICBjb25zdCBjdWVpbmdBcnJvd3NTaG93blByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLndhc0RyYWdnZWRQcm9wZXJ0eSwgR3JlZW5ob3VzZUVmZmVjdE9wdGlvbnMuY3VlaW5nQXJyb3dzRW5hYmxlZFByb3BlcnR5IF0sXHJcbiAgICAgICggd2FzRHJhZ2dlZCwgY3VlaW5nQXJyb3dzRW5hYmxlZCApID0+ICF3YXNEcmFnZ2VkICYmIGN1ZWluZ0Fycm93c0VuYWJsZWRcclxuICAgICk7XHJcblxyXG4gICAgLy8gY29sb3JlZCBhcnJvd3MgYXJvdW5kIHRoZSBmbHV4IHNlbnNvciwgY3VlcyB0aGUgdXNlciB0byBkcmFnIGl0XHJcbiAgICBjb25zdCBjdWluZ0Fycm93c05vZGUgPSBuZXcgVkJveCgge1xyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgc3BhY2luZzogMTUsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgLUNVRV9BUlJPV19MRU5HVEgsIENVRV9BUlJPV19PUFRJT05TICksXHJcbiAgICAgICAgbmV3IEFycm93Tm9kZSggMCwgMCwgMCwgQ1VFX0FSUk9XX0xFTkdUSCwgQ1VFX0FSUk9XX09QVElPTlMgKVxyXG4gICAgICBdLFxyXG4gICAgICBjZW50ZXJYOiBmbHV4U2Vuc29yTm9kZS5ib3VuZHMubWF4WCxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBjdWVpbmdBcnJvd3NTaG93blByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjdWluZ0Fycm93c05vZGUgKTtcclxuXHJcbiAgICAvLyBSZXBvc2l0aW9uIHRoZSBjdWUgYXJyb3dzIGFzIHRoZSBmbHV4IHNlbnNvciBtb3Zlcy5cclxuICAgIG1vZGVsLmZsdXhTZW5zb3IuYWx0aXR1ZGVQcm9wZXJ0eS5saW5rKCBhbHRpdHVkZSA9PiB7XHJcbiAgICAgIGN1aW5nQXJyb3dzTm9kZS5jZW50ZXJZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggYWx0aXR1ZGUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIHBhbmVsXHJcbiAgICB0aGlzLmZsdXhQYW5lbCA9IG5ldyBQYW5lbCggY29udGVudCwge1xyXG4gICAgICB4TWFyZ2luOiBGTFVYX1BBTkVMX1hfTUFSR0lOXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmZsdXhQYW5lbCApO1xyXG5cclxuICAgIC8vIGxpc3RlbmVyc1xyXG4gICAgdmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRoZSBvZmZzZXQgcG9zaXRpb24gZm9yIHRoZSBkcmFnIHBpY2t1cCwgc28gdGhhdCB0aGUgdHJhbnNsYXRpb24gZG9lc24ndCBzbmFwIHRvIHRoZSBjdXJzb3IgcG9zaXRpb25cclxuICAgIGxldCBzdGFydE9mZnNldDogVmVjdG9yMiA9IFZlY3RvcjIuWkVSTztcclxuXHJcbiAgICBmbHV4U2Vuc29yTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHN0YXJ0OiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XHJcbiAgICAgICAgc3RhcnRPZmZzZXQgPSBmbHV4U2Vuc29yTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkuc3VidHJhY3QoIGZsdXhTZW5zb3JOb2RlLmNlbnRlciApO1xyXG4gICAgICAgIG1vZGVsLmZsdXhTZW5zb3IuaXNEcmFnZ2luZ1Byb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICB9LFxyXG4gICAgICBkcmFnOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgdGhlIGN1ZSBhcnJvd3MgaWYgdGhleSBhcmUgdmlzaWJsZS5cclxuICAgICAgICB0aGlzLndhc0RyYWdnZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYXIgdGhlIGZsdXggc2Vuc29yIGlmIGl0IGlzIGRyYWdnZWQgd2hpbGUgdGhlIG1haW4gbW9kZWwgaXMgcGF1c2VkLiAgVGhpcyBwcmV2ZW50cyB0aGUgZGlzcGxheSBvZiBmbHV4XHJcbiAgICAgICAgLy8gcmVhZGluZ3MgdGhhdCBhcmUgaW5jb3JyZWN0IGZvciB0aGUgYWx0aXR1ZGUgYXQgd2hpY2ggdGhlIHNlbnNvciBpcyBwb3NpdGlvbmVkLlxyXG4gICAgICAgIGlmICggIWlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgbW9kZWwuZmx1eFNlbnNvci5jbGVhckVuZXJneVRyYWNrZXJzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIHZpZXcgcG9zaXRpb24gb2YgdGhlIHNlbnNvci5cclxuICAgICAgICBjb25zdCB2aWV3UG9pbnQgPSBmbHV4U2Vuc29yTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkuc3VidHJhY3QoIHN0YXJ0T2Zmc2V0ICk7XHJcblxyXG4gICAgICAgIC8vIENvbnN0cmFpbiB0aGUgWSBwb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSB0byBqdXN0IGJlbG93IHRoZSB0b3Agb2YgdGhlIGF0bW9zcGhlcmUgYXQgdGhlIGhpZ2ggZW5kIGFuZCBqdXN0XHJcbiAgICAgICAgLy8gYWJvdmUgdGhlIGdyb3VuZCBhdCB0aGUgbG93IGVuZC5cclxuICAgICAgICBjb25zdCBtb2RlbFkgPSBGTFVYX1NFTlNPUl9WRVJUSUNBTF9SQU5HRS5jb25zdHJhaW5WYWx1ZSggbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWSggdmlld1BvaW50LnkgKSApO1xyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIGFsdGl0dWRlIG9mIHRoZSBmbHV4IHNlbnNvciBiYXNlZCBvbiB0aGUgZHJhZyBhY3Rpb24uXHJcbiAgICAgICAgbW9kZWwuZmx1eFNlbnNvci5hbHRpdHVkZVByb3BlcnR5LnNldCggbW9kZWxZICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLmZsdXhTZW5zb3IuaXNEcmFnZ2luZ1Byb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgfSxcclxuICAgICAgdXNlSW5wdXRMaXN0ZW5lckN1cnNvcjogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInIClcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEFkZCBzb3VuZCBnZW5lcmF0aW9uLlxyXG4gICAgdGhpcy5zb3VuZEdlbmVyYXRvciA9IG5ldyBGbHV4TWV0ZXJTb3VuZEdlbmVyYXRvcihcclxuICAgICAgbW9kZWwuZmx1eFNlbnNvci52aXNpYmxlTGlnaHRVcEVuZXJneVJhdGVUcmFja2VyLmVuZXJneVJhdGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuZmx1eFNlbnNvci52aXNpYmxlTGlnaHREb3duRW5lcmd5UmF0ZVRyYWNrZXIuZW5lcmd5UmF0ZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5mbHV4U2Vuc29yLmluZnJhcmVkTGlnaHRVcEVuZXJneVJhdGVUcmFja2VyLmVuZXJneVJhdGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuZmx1eFNlbnNvci5pbmZyYXJlZExpZ2h0RG93bkVuZXJneVJhdGVUcmFja2VyLmVuZXJneVJhdGVQcm9wZXJ0eSxcclxuICAgICAge1xyXG4gICAgICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC4xNSxcclxuICAgICAgICBlbmFibGVDb250cm9sUHJvcGVydGllczogWyBpc1BsYXlpbmdQcm9wZXJ0eSwgdmlzaWJsZVByb3BlcnR5IF1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggdGhpcy5zb3VuZEdlbmVyYXRvciwge1xyXG4gICAgICBzb25pZmljYXRpb25MZXZlbDogU291bmRMZXZlbEVudW0uRVhUUkEsXHJcbiAgICAgIGFzc29jaWF0ZWRWaWV3Tm9kZTogdGhpc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE1ha2Ugc29tZSB0aGluZ3MgYXZhaWxhYmxlIHRvIHRoZSBtZXRob2RzLlxyXG4gICAgdGhpcy5pc01vZGVsUGxheWluZ1Byb3BlcnR5ID0gaXNQbGF5aW5nUHJvcGVydHk7XHJcblxyXG4gICAgLy8gbmV2ZXIgZGlzcG9zZWQsIG5vIG5lZWQgdG8gdW5saW5rXHJcbiAgICBtb2RlbC5mbHV4U2Vuc29yLmFsdGl0dWRlUHJvcGVydHkubGluayggYWx0aXR1ZGUgPT4ge1xyXG4gICAgICBmbHV4U2Vuc29yTm9kZS5jZW50ZXJZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggYWx0aXR1ZGUgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5zb3VuZEdlbmVyYXRvci5zdGVwKCBkdCApO1xyXG4gICAgdGhpcy5zdW5saWdodEZsdXhEaXNwbGF5LnVwZGF0ZUZsdXhBcnJvd3MoKTtcclxuICAgIHRoaXMuaW5mcmFyZWRGbHV4RGlzcGxheS51cGRhdGVGbHV4QXJyb3dzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLndhc0RyYWdnZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy56b29tRmFjdG9yUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc291bmRHZW5lcmF0b3IucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbnR5cGUgRW5lcmd5Rmx1eERpc3BsYXlBcnJvd1NlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBoZWlnaHQgb2YgdGhlIGJhY2tncm91bmQgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbiAgaGVpZ2h0PzogbnVtYmVyO1xyXG5cclxuICAvLyBvcHRpb25zIHRoYXQgYXJlIHBhc3NlZCB0aHJvdWdoIHRvIHRoZSBhcnJvdyBub2Rlc1xyXG4gIGFycm93Tm9kZU9wdGlvbnM/OiBBcnJvd05vZGVPcHRpb25zO1xyXG59O1xyXG5cclxudHlwZSBFbmVyZ3lGbHV4RGlzcGxheU9wdGlvbnMgPSBFbmVyZ3lGbHV4RGlzcGxheUFycm93U2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcclxuXHJcbi8qKlxyXG4gKiBBbiBpbm5lciBjbGFzcyB0aGF0IGltcGxlbWVudHMgYSBkaXNwbGF5IGZvciBlbmVyZ3kgZmx1eCBpbiB0aGUgdXAgYW5kIGRvd24gZGlyZWN0aW9ucy4gIFRoZSBkaXNwbGF5IGNvbnNpc3RzIG9mIGFcclxuICogYmFja2dyb3VuZCB3aXRoIHR3byBhcnJvd3MsIG9uZSB0aGF0IGdyb3dzIHVwd2FyZHMgYW5kIGFub3RoZXIgdGhhdCBncm93cyBkb3duLiAgVGhlIGJhY2tncm91bmQgaW5jbHVkZXMgcmVmZXJlbmNlXHJcbiAqIGxpbmVzIHNvIHRoYXQgdGhlIGRpc3BsYXkgY2FuIGJlIHpvb21lZCBpbiBhbmQgb3V0LlxyXG4gKlxyXG4gKiBAcGFyYW0gZW5lcmd5RG93blByb3BlcnR5XHJcbiAqIEBwYXJhbSBlbmVyZ3lVcFByb3BlcnR5XHJcbiAqIEBwYXJhbSBmbHV4VG9BcnJvd0xlbmd0aE11bHRpcGxpZXJQcm9wZXJ0eSAtICBtdWx0aXBsaWVyIG1hcHMgdGhlIGZsdXggdmFsdWVzIGZyb20gdGhlIG1ldGVyIHRvIHRoZSBhcnJvdyBsZW5ndGhzXHJcbiAqIEBwYXJhbSBsYWJlbFN0cmluZ1xyXG4gKiBAcGFyYW0gYmFzZUNvbG9yXHJcbiAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICovXHJcbmNsYXNzIEVuZXJneUZsdXhEaXNwbGF5IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZW5lcmd5VXBQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGVuZXJneURvd25Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGZsdXhUb0Fycm93TGVuZ3RoTXVsdGlwbGllclByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdXBBcnJvdzogQXJyb3dOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZG93bkFycm93OiBBcnJvd05vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzaXplOiBEaW1lbnNpb24yO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVuZXJneURvd25Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIGVuZXJneVVwUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBmbHV4VG9BcnJvd0xlbmd0aE11bHRpcGxpZXJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JQcm9wZXJ0eTogQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IEVuZXJneUZsdXhEaXNwbGF5T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVuZXJneUZsdXhEaXNwbGF5T3B0aW9ucywgRW5lcmd5Rmx1eERpc3BsYXlBcnJvd1NlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gbG90cyBvZiBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHZhbHVlcyBoZXJlLCBjaG9zZW4gdG8gbWFrZSB0aGUgdGhpbmcgbG9vayBkZWNlbnRcclxuICAgICAgaGVpZ2h0OiAzNDAsXHJcbiAgICAgIGFycm93Tm9kZU9wdGlvbnM6IHtcclxuICAgICAgICBoZWFkSGVpZ2h0OiAxNixcclxuICAgICAgICBoZWFkV2lkdGg6IDE2LFxyXG4gICAgICAgIHRhaWxXaWR0aDogOCxcclxuICAgICAgICBmaWxsOiBiYXNlQ29sb3JQcm9wZXJ0eVxyXG4gICAgICB9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMuZW5lcmd5RG93blByb3BlcnR5ID0gZW5lcmd5RG93blByb3BlcnR5O1xyXG4gICAgdGhpcy5lbmVyZ3lVcFByb3BlcnR5ID0gZW5lcmd5VXBQcm9wZXJ0eTtcclxuICAgIHRoaXMuZmx1eFRvQXJyb3dMZW5ndGhNdWx0aXBsaWVyUHJvcGVydHkgPSBmbHV4VG9BcnJvd0xlbmd0aE11bHRpcGxpZXJQcm9wZXJ0eTtcclxuXHJcbiAgICBjb25zdCBsYWJlbFRleHQgPSBuZXcgVGV4dCggbGFiZWxTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLkNPTlRFTlRfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IEVuZXJneUZsdXhEaXNwbGF5LldJRFRIXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsYWJlbFRleHQgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCBhIHJlY3RhbmdsZSB0aGF0IGlzIGludmlzaWJsZSBidXQgYWN0cyBhcyBhIGNvbnRhaW5lciBmb3IgdGhlIGVuZXJneSBhcnJvd3MgYW5kIHJlZmVyZW5jZSBsaW5lcy5cclxuICAgIC8vIEl0cyBzaGFwZSBpcyB1c2VkIGFzIGEgY2xpcCBhcmVhIGZvciB0aGUgZGlzcGxheSBzbyB0aGF0IGFycm93cyBhbmQgcmVmZXJlbmNlIGxpbmVzIGRvbid0IGdvIGJleW9uZCB0aGUgaGVpZ2h0IG9mXHJcbiAgICAvLyB0aGlzIGRpc3BsYXkuXHJcbiAgICBjb25zdCBib3VuZHNSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBFbmVyZ3lGbHV4RGlzcGxheS5XSURUSCwgb3B0aW9ucy5oZWlnaHQsIDUsIDUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJvdW5kc1JlY3RhbmdsZSApO1xyXG5cclxuICAgIC8vIE1ha2UgdGhlIHNpemUgYXZhaWxhYmxlIHRvIHRoZSBtZXRob2RzLlxyXG4gICAgdGhpcy5zaXplID0gbmV3IERpbWVuc2lvbjIoIGJvdW5kc1JlY3RhbmdsZS53aWR0aCwgYm91bmRzUmVjdGFuZ2xlLmhlaWdodCApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGxhYmVsVGV4dCwgYm91bmRzUmVjdGFuZ2xlIF0sXHJcbiAgICAgIHNwYWNpbmc6IDVcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgUGF0aCB0aGF0IHdpbGwgZGlzcGxheSByZWZlcmVuY2UgbGluZXMgYmVoaW5kIHRoZSBhcnJvd3MuXHJcbiAgICBjb25zdCByZWZlcmVuY2VMaW5lc05vZGUgPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBzdHJva2U6IENvbG9yLkdSQVkud2l0aEFscGhhKCAwLjMgKSxcclxuICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICB9ICk7XHJcbiAgICBib3VuZHNSZWN0YW5nbGUuYWRkQ2hpbGQoIHJlZmVyZW5jZUxpbmVzTm9kZSApO1xyXG5cclxuICAgIC8vIFNldCBhIGNsaXAgYXJlYSBzbyB0aGF0IHRoZSBhcnJvd3MgZG9uJ3QgZ28gb3V0c2lkZSB0aGUgYmFja2dyb3VuZC5cclxuICAgIGJvdW5kc1JlY3RhbmdsZS5jbGlwQXJlYSA9IFNoYXBlLmJvdW5kcyggYm91bmRzUmVjdGFuZ2xlLmdldFJlY3RCb3VuZHMoKSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBhcnJvd3MuXHJcbiAgICB0aGlzLmRvd25BcnJvdyA9IG5ldyBBcnJvd05vZGUoXHJcbiAgICAgIGJvdW5kc1JlY3RhbmdsZS53aWR0aCAvIDIsXHJcbiAgICAgIGJvdW5kc1JlY3RhbmdsZS5oZWlnaHQgLyAyLFxyXG4gICAgICBib3VuZHNSZWN0YW5nbGUud2lkdGggLyAyLFxyXG4gICAgICBib3VuZHNSZWN0YW5nbGUuaGVpZ2h0IC8gMixcclxuICAgICAgb3B0aW9ucy5hcnJvd05vZGVPcHRpb25zXHJcbiAgICApO1xyXG4gICAgdGhpcy51cEFycm93ID0gbmV3IEFycm93Tm9kZShcclxuICAgICAgYm91bmRzUmVjdGFuZ2xlLndpZHRoIC8gMixcclxuICAgICAgYm91bmRzUmVjdGFuZ2xlLmhlaWdodCAvIDIsXHJcbiAgICAgIGJvdW5kc1JlY3RhbmdsZS53aWR0aCAvIDIsXHJcbiAgICAgIGJvdW5kc1JlY3RhbmdsZS5oZWlnaHQgLyAyLFxyXG4gICAgICBvcHRpb25zLmFycm93Tm9kZU9wdGlvbnNcclxuICAgICk7XHJcbiAgICBib3VuZHNSZWN0YW5nbGUuYWRkQ2hpbGQoIHRoaXMuZG93bkFycm93ICk7XHJcbiAgICBib3VuZHNSZWN0YW5nbGUuYWRkQ2hpbGQoIHRoaXMudXBBcnJvdyApO1xyXG5cclxuICAgIGNvbnN0IGRhcmtlbmVkQmFzZUNvbG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGJhc2VDb2xvclByb3BlcnR5IF0sXHJcbiAgICAgIGNvbG9yID0+IGNvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIDAuMjUgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZGQgYSBob3Jpem9udGFsIGxpbmUgYXQgdGhlIG9yaWdpbiBvZiB0aGUgYXJyb3dzIHRoYXQgY2FuIGJlIHNlZW4gd2hlbiB0aGUgYXJyb3dzIGhhdmUgbm8gbGVuZ3RoLlxyXG4gICAgY29uc3QgY2VudGVySW5kaWNhdG9yTGluZSA9IG5ldyBMaW5lKCAwLCAwLCBib3VuZHNSZWN0YW5nbGUud2lkdGggKiAwLjUsIDAsIHtcclxuICAgICAgY2VudGVyWDogYm91bmRzUmVjdGFuZ2xlLndpZHRoIC8gMixcclxuICAgICAgY2VudGVyWTogYm91bmRzUmVjdGFuZ2xlLmhlaWdodCAvIDIsXHJcbiAgICAgIHN0cm9rZTogZGFya2VuZWRCYXNlQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgbGluZVdpZHRoOiAzXHJcbiAgICB9ICk7XHJcbiAgICBib3VuZHNSZWN0YW5nbGUuYWRkQ2hpbGQoIGNlbnRlckluZGljYXRvckxpbmUgKTtcclxuXHJcbiAgICAvLyBEZWZpbmUgYSByZWZlcmVuY2UgZmx1eCB2YWx1ZSB0aGF0IHdpbGwgYmUgdXNlZCB0byBkZWZpbmUgdGhlIHNwYWNpbmcgYmV0d2VlbiB0aGUgcmVmZXJlbmNlIG1hcmtzLiAgVGhpcyB2YWx1ZVxyXG4gICAgLy8gd2FzIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gcHJvdmlkZSB0aGUgZGVzaXJlZCBsb29rLCBhbmQgaXMgYmFzZWQgb24gdGhlIGZsdXggdmFsdWVzIHRoYXQgbmF0dXJhbGx5IG9jY3VyIGluXHJcbiAgICAvLyB0aGUgbW9kZWwuXHJcbiAgICBjb25zdCByZWZlcmVuY2VGbHV4ID0gNUU2O1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgYmFja2dyb3VuZCByZWZlcmVuY2UgbWFya3Mgd2hlbiB0aGUgem9vbSBsZXZlbCBjaGFuZ2VzLlxyXG4gICAgZmx1eFRvQXJyb3dMZW5ndGhNdWx0aXBsaWVyUHJvcGVydHkubGluayggZmx1eFRvQXJyb3dMZW5ndGhNdWx0aXBsaWVyID0+IHtcclxuICAgICAgY29uc3QgcmVmZXJlbmNlTGluZXNTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgICBjb25zdCBpbnRlclJlZmVyZW5jZUxpbmVEaXN0YW5jZSA9IGZsdXhUb0Fycm93TGVuZ3RoTXVsdGlwbGllciAqIHJlZmVyZW5jZUZsdXg7XHJcbiAgICAgIGNvbnN0IHJlZmVyZW5jZUxpbmVXaWR0aCA9IGJvdW5kc1JlY3RhbmdsZS53aWR0aCAqIDAuNTsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuICAgICAgLy8gTG9vcCwgY3JlYXRpbmcgdGhlIHNoYXBlIHRoYXQgd2lsbCByZXByZXNlbnQgdGhlIHJlZmVyZW5jZSBsaW5lcy5cclxuICAgICAgZm9yICggbGV0IGRpc3RhbmNlRnJvbUNlbnRlciA9IGludGVyUmVmZXJlbmNlTGluZURpc3RhbmNlO1xyXG4gICAgICAgICAgICBkaXN0YW5jZUZyb21DZW50ZXIgPCBib3VuZHNSZWN0YW5nbGUuaGVpZ2h0IC8gMjtcclxuICAgICAgICAgICAgZGlzdGFuY2VGcm9tQ2VudGVyICs9IGludGVyUmVmZXJlbmNlTGluZURpc3RhbmNlICkge1xyXG5cclxuICAgICAgICAvLyBBZGQgbGluZXMgaW4gYm90aCB0aGUgdXB3YXJkIGFuZCBkb3dud2FyZCBkaXJlY3Rpb25zLlxyXG4gICAgICAgIHJlZmVyZW5jZUxpbmVzU2hhcGUubW92ZVRvKCAwLCBkaXN0YW5jZUZyb21DZW50ZXIgKTtcclxuICAgICAgICByZWZlcmVuY2VMaW5lc1NoYXBlLmxpbmVUbyggcmVmZXJlbmNlTGluZVdpZHRoLCBkaXN0YW5jZUZyb21DZW50ZXIgKTtcclxuICAgICAgICByZWZlcmVuY2VMaW5lc1NoYXBlLm1vdmVUbyggMCwgLWRpc3RhbmNlRnJvbUNlbnRlciApO1xyXG4gICAgICAgIHJlZmVyZW5jZUxpbmVzU2hhcGUubGluZVRvKCByZWZlcmVuY2VMaW5lV2lkdGgsIC1kaXN0YW5jZUZyb21DZW50ZXIgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2V0IHRoZSBzaGFwZSBhbmQgaXRzIHBvc2l0aW9uLlxyXG4gICAgICByZWZlcmVuY2VMaW5lc05vZGUuc2V0U2hhcGUoIHJlZmVyZW5jZUxpbmVzU2hhcGUgKTtcclxuICAgICAgcmVmZXJlbmNlTGluZXNOb2RlLmNlbnRlclggPSBib3VuZHNSZWN0YW5nbGUud2lkdGggLyAyO1xyXG4gICAgICByZWZlcmVuY2VMaW5lc05vZGUuY2VudGVyWSA9IGJvdW5kc1JlY3RhbmdsZS5oZWlnaHQgLyAyO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIHRoZSBmbHV4IGFycm93cyBmb3IgdGhlIG5ldyBtdWx0aXBsaWVyLlxyXG4gICAgICB0aGlzLnVwZGF0ZUZsdXhBcnJvd3MoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgYXJyb3dzIHRoYXQgcmVwcmVzZW50IHRoZSBhbW91bnQgb2YgZmx1eC4gIFRoaXMgaXMgZG9uZSBhcyBhIG1ldGhvZCBjYWxsZWQgZHVyaW5nIGEgc3RlcCBpbnN0ZWFkIG9mXHJcbiAgICogYmVpbmcgYmFzZWQgb24gbGlua2FnZXMgdG8gdGhlIGVuZXJneSBwcm9wZXJ0aWVzIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UsIHNlZVxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmVlbmhvdXNlLWVmZmVjdC9pc3N1ZXMvMjY1I2lzc3VlY29tbWVudC0xNDA1ODcwMzIxLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVGbHV4QXJyb3dzKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgZG93biBhcnJvd1xyXG4gICAgY29uc3QgZW5lcmd5RG93biA9IHRoaXMuZW5lcmd5RG93blByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgZG93bkFycm93SGVpZ2h0ID0gdGhpcy5zaXplLmhlaWdodCAvIDIgKyB0aGlzLmdldEFycm93SGVpZ2h0RnJvbUZsdXgoIGVuZXJneURvd24gKTtcclxuICAgIHRoaXMuZG93bkFycm93LnZpc2libGUgPSBNYXRoLmFicyggZW5lcmd5RG93biApID4gMDtcclxuICAgIHRoaXMuZG93bkFycm93LnNldFRpcCggdGhpcy5zaXplLndpZHRoIC8gMiwgZG93bkFycm93SGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSB1cCBhcnJvd1xyXG4gICAgY29uc3QgZW5lcmd5VXAgPSB0aGlzLmVuZXJneVVwUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCB1cEFycm93SGVpZ2h0ID0gdGhpcy5zaXplLmhlaWdodCAvIDIgLSB0aGlzLmdldEFycm93SGVpZ2h0RnJvbUZsdXgoIGVuZXJneVVwICk7XHJcbiAgICB0aGlzLnVwQXJyb3cudmlzaWJsZSA9IE1hdGguYWJzKCBlbmVyZ3lVcCApID4gMDtcclxuICAgIHRoaXMudXBBcnJvdy5zZXRUaXAoIHRoaXMuc2l6ZS53aWR0aCAvIDIsIHVwQXJyb3dIZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcCB0aGUgZmx1eCB0byBhIHZhbHVlIGZvciB0aGUgaGVpZ2h0IG9mIHRoZSBmbHV4IGFycm93LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0QXJyb3dIZWlnaHRGcm9tRmx1eCggZmx1eDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gZmx1eCAqIHRoaXMuZmx1eFRvQXJyb3dMZW5ndGhNdWx0aXBsaWVyUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG5cclxuICAvLyBhbiBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHZhbHVlIHVzZWQgaW4gcGFydCB0byBzZXQgdGhlIG92ZXJhbGwgd2lkdGggb2YgdGhlIHBhbmVsXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBXSURUSCA9IDQ1O1xyXG59XHJcblxyXG4vKipcclxuICogQW4gaW5uZXIgY2xhc3MgdG8gc3VwcG9ydCBhbHRlcm5hdGl2ZSBpbnB1dCBmb3IgdGhlIGZsdXggc2Vuc29yIHdpdGggQWNjZXNzaWJsZVNsaWRlciBzbyB0aGF0IGFycm93IGtleXNcclxuICogY2hhbmdlIHRoZSBhbHRpdHVkZS5cclxuICovXHJcbnR5cGUgRmx1eFNlbnNvck5vZGVTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbnR5cGUgRmx1eFNlbnNvck5vZGVQYXJlbnRPcHRpb25zID0gQWNjZXNzaWJsZVNsaWRlck9wdGlvbnMgJiBOb2RlT3B0aW9ucztcclxudHlwZSBGbHV4U2Vuc29yTm9kZU9wdGlvbnMgPSBOb2RlT3B0aW9ucyAmIFN0cmljdE9taXQ8QWNjZXNzaWJsZVNsaWRlck9wdGlvbnMsICd2YWx1ZVByb3BlcnR5JyB8ICdlbmFibGVkUmFuZ2VQcm9wZXJ0eSc+O1xyXG5cclxuY2xhc3MgRmx1eFNlbnNvck5vZGUgZXh0ZW5kcyBBY2Nlc3NpYmxlU2xpZGVyKCBOb2RlLCAwICkge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZmx1eFNlbnNvcjogRmx1eFNlbnNvciwgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBwcm92aWRlZE9wdGlvbnM/OiBGbHV4U2Vuc29yTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGbHV4U2Vuc29yTm9kZU9wdGlvbnMsIEZsdXhTZW5zb3JOb2RlU2VsZk9wdGlvbnMsIEZsdXhTZW5zb3JOb2RlUGFyZW50T3B0aW9ucz4oKSgge1xyXG4gICAgICB2YWx1ZVByb3BlcnR5OiBmbHV4U2Vuc29yLmFsdGl0dWRlUHJvcGVydHksXHJcbiAgICAgIGVuYWJsZWRSYW5nZVByb3BlcnR5OiBuZXcgUHJvcGVydHkoIEZMVVhfU0VOU09SX1ZFUlRJQ0FMX1JBTkdFICksXHJcbiAgICAgIGtleWJvYXJkU3RlcDogRkxVWF9TRU5TT1JfVkVSVElDQUxfUkFOR0UuZ2V0TGVuZ3RoKCkgLyAzMCxcclxuICAgICAgYTExeUNyZWF0ZUFyaWFWYWx1ZVRleHQ6IHZhbHVlID0+IGAke1V0aWxzLnJvdW5kU3ltbWV0cmljKCB2YWx1ZSApfSBtYFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBmbHV4U2Vuc29yV2lkdGggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIGZsdXhTZW5zb3Iuc2l6ZS53aWR0aCApO1xyXG4gICAgY29uc3QgZmx1eFNlbnNvclRvdWNoQXJlYVlEaWxhdGlvbiA9IDEwO1xyXG4gICAgY29uc3Qgc2Vuc29yTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGZsdXhTZW5zb3JXaWR0aCwgU0VOU09SX1ZJRVdfSEVJR0hULCA1LCA1LCB7XHJcbiAgICAgIHN0cm9rZTogU0VOU09SX1NUUk9LRV9DT0xPUixcclxuICAgICAgZmlsbDogU0VOU09SX0ZJTExfQ09MT1IsXHJcbiAgICAgIGxpbmVXaWR0aDogMixcclxuICAgICAgY3Vyc29yOiAnbnMtcmVzaXplJyxcclxuICAgICAgY2VudGVyOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWSggZmx1eFNlbnNvci54UG9zaXRpb24sIGZsdXhTZW5zb3IuYWx0aXR1ZGVQcm9wZXJ0eS52YWx1ZSApLFxyXG4gICAgICB0b3VjaEFyZWE6IFNoYXBlLnJlY3RhbmdsZShcclxuICAgICAgICAwLFxyXG4gICAgICAgIC1mbHV4U2Vuc29yVG91Y2hBcmVhWURpbGF0aW9uLFxyXG4gICAgICAgIGZsdXhTZW5zb3JXaWR0aCxcclxuICAgICAgICBTRU5TT1JfVklFV19IRUlHSFQgKyBmbHV4U2Vuc29yVG91Y2hBcmVhWURpbGF0aW9uICogMlxyXG4gICAgICApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzZW5zb3JOb2RlICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnRmx1eE1ldGVyTm9kZScsIEZsdXhNZXRlck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgRmx1eE1ldGVyTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFHdEQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFJbkYsT0FBT0MsU0FBUyxNQUE0QiwwQ0FBMEM7QUFDdEYsT0FBT0MsOEJBQThCLE1BQU0sK0RBQStEO0FBQzFH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