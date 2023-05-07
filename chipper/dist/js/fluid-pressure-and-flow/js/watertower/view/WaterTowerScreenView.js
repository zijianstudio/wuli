// Copyright 2014-2022, University of Colorado Boulder

/**
 * View for the 'Water Tower' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PlayPauseButton from '../../../../scenery-phet/js/buttons/PlayPauseButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import StepForwardButton from '../../../../scenery-phet/js/buttons/StepForwardButton.js';
import FaucetNode from '../../../../scenery-phet/js/FaucetNode.js';
import GroundNode from '../../../../scenery-phet/js/GroundNode.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SkyNode from '../../../../scenery-phet/js/SkyNode.js';
import { Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Constants from '../../common/Constants.js';
import BarometerNode from '../../common/view/BarometerNode.js';
import ControlSlider from '../../common/view/ControlSlider.js';
import FPAFRuler from '../../common/view/FPAFRuler.js';
import UnitsControlPanel from '../../common/view/UnitsControlPanel.js';
import VelocitySensorNode from '../../common/view/VelocitySensorNode.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import FluidPressureAndFlowStrings from '../../FluidPressureAndFlowStrings.js';
import FaucetControlPanel from './FaucetControlPanel.js';
import HoseNode from './HoseNode.js';
import SluiceControlPanel from './SluiceControlPanel.js';
import ToolsControlPanel from './ToolsControlPanel.js';
import WaterDropsCanvasNode from './WaterDropsCanvasNode.js';
import WaterTowerNode from './WaterTowerNode.js';

//  strings
const feetString = FluidPressureAndFlowStrings.feet;
const fluidDensityString = FluidPressureAndFlowStrings.fluidDensity;
const gasolineString = FluidPressureAndFlowStrings.gasoline;
const honeyString = FluidPressureAndFlowStrings.honey;
const metersString = FluidPressureAndFlowStrings.meters;
const normalString = FluidPressureAndFlowStrings.normal;
const slowMotionString = FluidPressureAndFlowStrings.slowMotion;
const waterString = FluidPressureAndFlowStrings.water;

// constants
const INSET = 10;
class WaterTowerScreenView extends ScreenView {
  /**
   * @param {WaterTowerModel} waterTowerModel
   */
  constructor(waterTowerModel) {
    super(Constants.SCREEN_VIEW_OPTIONS);
    const textOptions = {
      font: new PhetFont(14)
    };

    // Invert the y-axis, so that y grows up.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(0, 350), 10); //1m = 10px, (0,0) - top left corner

    const groundY = modelViewTransform.modelToViewY(0);

    // TODO: find a way to not do this
    waterTowerModel.modelViewTransform = modelViewTransform;

    // This is a workaround, see See https://github.com/phetsims/fluid-pressure-and-flow/issues/87
    // add background -- sky
    // rectangle with uniform sky color for y < groundY - 200
    this.addChild(new Rectangle(-5000, -1000, 10000, 1000 + groundY - 198, {
      stroke: '#01ACE4',
      fill: '#01ACE4'
    }));
    // gradient background skynode between y = groundY - 200 and y = groundY
    this.addChild(new SkyNode(-5000, groundY - 200, 10000, 200, groundY));
    this.hoseDropsLayer = new WaterDropsCanvasNode(waterTowerModel.hoseDrops, waterTowerModel.fluidColorModel, waterTowerModel.modelViewTransform, {
      canvasBounds: new Bounds2(0, 0, 850, 350)
    });
    this.addChild(this.hoseDropsLayer);
    this.waterTowerDropsLayer = new WaterDropsCanvasNode(waterTowerModel.waterTowerDrops, waterTowerModel.fluidColorModel, waterTowerModel.modelViewTransform, {
      canvasBounds: new Bounds2(0, 0, 500, 350)
    });
    this.addChild(this.waterTowerDropsLayer);

    // add background -- earth
    this.addChild(new GroundNode(-5000, groundY, 10000, 10000, groundY + 50));

    // add the hose
    this.hoseNode = new HoseNode(waterTowerModel.hose, waterTowerModel.waterTower.tankPositionProperty, modelViewTransform, waterTowerModel.isHoseVisibleProperty);
    this.addChild(this.hoseNode);
    const waterTowerNode = new WaterTowerNode(waterTowerModel.waterTower, waterTowerModel.fluidColorModel, modelViewTransform, this.hoseNode);
    waterTowerNode.bottom = modelViewTransform.modelToViewY(0);
    this.addChild(waterTowerNode);
    this.faucetDropsLayer = new WaterDropsCanvasNode(waterTowerModel.faucetDrops, waterTowerModel.fluidColorModel, waterTowerModel.modelViewTransform, {
      canvasBounds: new Bounds2(50, 0, 150, 350)
    });
    this.addChild(this.faucetDropsLayer);
    const faucetNode = new FaucetNode(30, waterTowerModel.faucetFlowRateProperty, waterTowerModel.isFaucetEnabledProperty, {
      horizontalPipeLength: 1500,
      right: modelViewTransform.modelToViewX(waterTowerModel.faucetPosition.x) + 20,
      top: this.layoutBounds.top + INSET,
      scale: 0.3,
      // size of the faucet,
      closeOnRelease: false,
      // Faucet is interactive in manual mode, non-interactive in 'matchLeakage' mode, see #132
      interactiveProperty: new DerivedProperty([waterTowerModel.faucetModeProperty], faucetMode => faucetMode === 'manual'),
      shooterOptions: {
        touchAreaXDilation: 37,
        touchAreaYDilation: 60
      }
    });
    this.addChild(faucetNode);
    this.addChild(new FaucetControlPanel(waterTowerModel.faucetModeProperty, {
      left: faucetNode.right + INSET,
      bottom: faucetNode.bottom,
      fill: 'green'
    }));

    // tools control panel
    this.toolsControlPanel = new ToolsControlPanel(waterTowerModel, {
      right: this.layoutBounds.right - INSET,
      top: INSET
    });
    this.addChild(this.toolsControlPanel);
    this.addChild(new UnitsControlPanel(waterTowerModel.measureUnitsProperty, {
      left: this.toolsControlPanel.left,
      xMargin: 10,
      yMargin: 10,
      fontSize: 14,
      top: this.toolsControlPanel.bottom + INSET
    }));

    // all the movable tools are added to this layer
    const toolsLayer = new Node();
    this.addChild(toolsLayer);
    const unitsProperty = new DerivedProperty([waterTowerModel.measureUnitsProperty], measureUnits => {
      let units = {};
      if (measureUnits === 'metric') {
        units = {
          name: metersString,
          multiplier: 1
        };
      } else {
        // then it must be english
        units = {
          name: feetString,
          multiplier: 3.28
        };
      }
      return units;
    });
    const measuringTapeNode = new MeasuringTapeNode(unitsProperty, {
      visibleProperty: waterTowerModel.isMeasuringTapeVisibleProperty,
      basePositionProperty: waterTowerModel.measuringTapeBasePositionProperty,
      tipPositionProperty: waterTowerModel.measuringTapeTipPositionProperty,
      modelViewTransform: modelViewTransform,
      significantFigures: 2,
      lineColor: 'black',
      // color of the tapeline itself
      tipCircleColor: 'black',
      // color of the circle at the tip
      tipCircleRadius: 8,
      // radius of the circle on the tip
      isBaseCrosshairRotating: false,
      // do crosshairs rotate around their own axis to line up with the tapeline
      isTipCrosshairRotating: false,
      // do crosshairs rotate around their own axis to line up with the tapeline
      dragBounds: modelViewTransform.viewToModelBounds(this.layoutBounds.eroded(10))
    });
    const resetAllButton = new ResetAllButton({
      listener: () => {
        waterTowerModel.reset();
        this.hoseNode.reset();
        measuringTapeNode.reset();
        waterTowerNode.fillButton.enabled = true;
      },
      right: this.layoutBounds.right - INSET,
      bottom: this.layoutBounds.bottom - INSET
    });
    this.addChild(resetAllButton);

    // add the fluid density control slider
    const fluidDensityControlSlider = new ControlSlider(waterTowerModel.measureUnitsProperty, waterTowerModel.fluidDensityProperty, waterTowerModel.getFluidDensityString.bind(waterTowerModel), waterTowerModel.fluidDensityRange, waterTowerModel.fluidDensityControlExpandedProperty, {
      right: resetAllButton.left - 4 * INSET,
      bottom: this.layoutBounds.bottom - INSET,
      title: fluidDensityString,
      ticks: [{
        title: waterString,
        value: waterTowerModel.fluidDensityProperty.value
      }, {
        title: gasolineString,
        value: waterTowerModel.fluidDensityRange.min
      }, {
        title: honeyString,
        value: waterTowerModel.fluidDensityRange.max
      }]
    });
    this.addChild(fluidDensityControlSlider);

    // add the sluice control near bottom left
    const sluiceControlPanel = new SluiceControlPanel(waterTowerModel.isSluiceOpenProperty, {
      xMargin: 10,
      yMargin: 15,
      fill: '#1F5EFF',
      right: waterTowerNode.right + 36,
      bottom: this.layoutBounds.bottom - 70
    });
    this.addChild(sluiceControlPanel);

    // add play pause button and step button
    const stepButton = new StepForwardButton({
      enabledProperty: DerivedProperty.not(waterTowerModel.isPlayingProperty),
      listener: () => {
        waterTowerModel.stepInternal(0.016);
      },
      stroke: 'black',
      fill: '#005566',
      right: fluidDensityControlSlider.left - INSET,
      bottom: fluidDensityControlSlider.bottom - INSET
    });
    this.addChild(stepButton);
    const playPauseButton = new PlayPauseButton(waterTowerModel.isPlayingProperty, {
      stroke: 'black',
      fill: '#005566',
      y: stepButton.centerY,
      right: stepButton.left - INSET
    });
    this.addChild(playPauseButton);
    const speedControl = new VBox({
      align: 'left',
      spacing: 5,
      children: [new AquaRadioButton(waterTowerModel.speedProperty, 'slow', new Text(slowMotionString, textOptions), {
        radius: 6
      }), new AquaRadioButton(waterTowerModel.speedProperty, 'normal', new Text(normalString, textOptions), {
        radius: 6
      })]
    });
    this.addChild(speedControl.mutate({
      right: playPauseButton.left - INSET,
      bottom: playPauseButton.bottom
    }));

    // add the sensors panel
    const sensorPanel = new Rectangle(0, 0, 190, 105, 10, 10, {
      stroke: 'gray',
      lineWidth: 1,
      fill: '#f2fa6a',
      right: this.toolsControlPanel.left - INSET,
      top: this.toolsControlPanel.top
    });
    this.addChild(sensorPanel);

    // add barometers within the sensor panel bounds
    _.each(waterTowerModel.barometers, barometer => {
      barometer.reset();
      toolsLayer.addChild(new BarometerNode(modelViewTransform, barometer, waterTowerModel.measureUnitsProperty, [waterTowerModel.fluidDensityProperty, waterTowerModel.waterTower.tankPositionProperty, waterTowerModel.waterTower.fluidLevelProperty], waterTowerModel.getPressureAtCoords.bind(waterTowerModel), waterTowerModel.getPressureString.bind(waterTowerModel), sensorPanel.visibleBounds, this.layoutBounds.withMaxY(this.layoutBounds.maxY - 62), {
        minPressure: Constants.MIN_PRESSURE,
        maxPressure: Constants.MAX_PRESSURE
      }));
    });

    // add speedometers within the sensor panel bounds
    _.each(waterTowerModel.speedometers, velocitySensor => {
      velocitySensor.positionProperty.reset();
      toolsLayer.addChild(new VelocitySensorNode(modelViewTransform, velocitySensor, waterTowerModel.measureUnitsProperty, [], waterTowerModel.getWaterDropVelocityAt.bind(waterTowerModel), sensorPanel.visibleBounds, this.layoutBounds.withMaxY(this.layoutBounds.maxY - 72)));
    });
    toolsLayer.addChild(new FPAFRuler(waterTowerModel.isRulerVisibleProperty, waterTowerModel.rulerPositionProperty, waterTowerModel.measureUnitsProperty, modelViewTransform, this.layoutBounds, {
      rulerWidth: 40,
      rulerHeight: 30,
      meterMajorStickWidth: 5,
      feetMajorStickWidth: 3,
      scaleFont: 12,
      meterTicks: _.range(0, 31, 5),
      feetTicks: _.range(0, 101, 10),
      insetsWidth: 0
    }));
    toolsLayer.addChild(measuringTapeNode);
    waterTowerModel.isSluiceOpenProperty.link(isSluiceOpen => {
      if (isSluiceOpen) {
        waterTowerNode.sluiceGate.bottom = waterTowerNode.waterTankFrame.bottom + modelViewTransform.modelToViewDeltaY(waterTowerNode.waterTower.HOLE_SIZE) - 5;
      } else {
        waterTowerNode.sluiceGate.bottom = waterTowerNode.waterTankFrame.bottom;
      }
    });
    waterTowerModel.tankFullLevelDurationProperty.link(tankFullLevelDuration => {
      waterTowerNode.fillButton.enabled = tankFullLevelDuration < 0.2;
      waterTowerModel.isFaucetEnabledProperty.value = tankFullLevelDuration < 0.2;
    });

    // if the sim is paused, disable the fill button as soon as the tank is filled
    //TODO this is unnecessarily complicated
    new DerivedProperty([waterTowerModel.waterTower.fluidVolumeProperty], fluidVolume => {
      return fluidVolume === waterTowerModel.waterTower.TANK_VOLUME;
    }).link(() => {
      if (!waterTowerModel.isPlayingProperty.value) {
        waterTowerNode.fillButton.enabled = false;
        waterTowerModel.tankFullLevelDurationProperty.value = 1;
      }
    });

    // Handles the case when switching from play to pause or viceversa
    //TODO this is unnecessarily complicated
    waterTowerModel.isPlayingProperty.link(isPlaying => {
      if (waterTowerModel.waterTower.fluidVolumeProperty.value >= waterTowerModel.waterTower.TANK_VOLUME) {
        waterTowerModel.tankFullLevelDurationProperty.value = 1;
        if (!isPlaying) {
          // disable the fill button if the tank is full and switching from play to pause
          waterTowerNode.fillButton.enabled = false;
        }
      }
    });
    toolsLayer.moveToFront();
  }

  /**
   * @public
   */
  step(dt) {
    this.waterTowerDropsLayer.step(dt);
    this.hoseDropsLayer.step(dt);
    this.faucetDropsLayer.step(dt);
  }
}
fluidPressureAndFlow.register('WaterTowerScreenView', WaterTowerScreenView);
export default WaterTowerScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiUGxheVBhdXNlQnV0dG9uIiwiUmVzZXRBbGxCdXR0b24iLCJTdGVwRm9yd2FyZEJ1dHRvbiIsIkZhdWNldE5vZGUiLCJHcm91bmROb2RlIiwiTWVhc3VyaW5nVGFwZU5vZGUiLCJQaGV0Rm9udCIsIlNreU5vZGUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIlZCb3giLCJBcXVhUmFkaW9CdXR0b24iLCJDb25zdGFudHMiLCJCYXJvbWV0ZXJOb2RlIiwiQ29udHJvbFNsaWRlciIsIkZQQUZSdWxlciIsIlVuaXRzQ29udHJvbFBhbmVsIiwiVmVsb2NpdHlTZW5zb3JOb2RlIiwiZmx1aWRQcmVzc3VyZUFuZEZsb3ciLCJGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MiLCJGYXVjZXRDb250cm9sUGFuZWwiLCJIb3NlTm9kZSIsIlNsdWljZUNvbnRyb2xQYW5lbCIsIlRvb2xzQ29udHJvbFBhbmVsIiwiV2F0ZXJEcm9wc0NhbnZhc05vZGUiLCJXYXRlclRvd2VyTm9kZSIsImZlZXRTdHJpbmciLCJmZWV0IiwiZmx1aWREZW5zaXR5U3RyaW5nIiwiZmx1aWREZW5zaXR5IiwiZ2Fzb2xpbmVTdHJpbmciLCJnYXNvbGluZSIsImhvbmV5U3RyaW5nIiwiaG9uZXkiLCJtZXRlcnNTdHJpbmciLCJtZXRlcnMiLCJub3JtYWxTdHJpbmciLCJub3JtYWwiLCJzbG93TW90aW9uU3RyaW5nIiwic2xvd01vdGlvbiIsIndhdGVyU3RyaW5nIiwid2F0ZXIiLCJJTlNFVCIsIldhdGVyVG93ZXJTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJ3YXRlclRvd2VyTW9kZWwiLCJTQ1JFRU5fVklFV19PUFRJT05TIiwidGV4dE9wdGlvbnMiLCJmb250IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJaRVJPIiwiZ3JvdW5kWSIsIm1vZGVsVG9WaWV3WSIsImFkZENoaWxkIiwic3Ryb2tlIiwiZmlsbCIsImhvc2VEcm9wc0xheWVyIiwiaG9zZURyb3BzIiwiZmx1aWRDb2xvck1vZGVsIiwiY2FudmFzQm91bmRzIiwid2F0ZXJUb3dlckRyb3BzTGF5ZXIiLCJ3YXRlclRvd2VyRHJvcHMiLCJob3NlTm9kZSIsImhvc2UiLCJ3YXRlclRvd2VyIiwidGFua1Bvc2l0aW9uUHJvcGVydHkiLCJpc0hvc2VWaXNpYmxlUHJvcGVydHkiLCJ3YXRlclRvd2VyTm9kZSIsImJvdHRvbSIsImZhdWNldERyb3BzTGF5ZXIiLCJmYXVjZXREcm9wcyIsImZhdWNldE5vZGUiLCJmYXVjZXRGbG93UmF0ZVByb3BlcnR5IiwiaXNGYXVjZXRFbmFibGVkUHJvcGVydHkiLCJob3Jpem9udGFsUGlwZUxlbmd0aCIsInJpZ2h0IiwibW9kZWxUb1ZpZXdYIiwiZmF1Y2V0UG9zaXRpb24iLCJ4IiwidG9wIiwibGF5b3V0Qm91bmRzIiwic2NhbGUiLCJjbG9zZU9uUmVsZWFzZSIsImludGVyYWN0aXZlUHJvcGVydHkiLCJmYXVjZXRNb2RlUHJvcGVydHkiLCJmYXVjZXRNb2RlIiwic2hvb3Rlck9wdGlvbnMiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJsZWZ0IiwidG9vbHNDb250cm9sUGFuZWwiLCJtZWFzdXJlVW5pdHNQcm9wZXJ0eSIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiZm9udFNpemUiLCJ0b29sc0xheWVyIiwidW5pdHNQcm9wZXJ0eSIsIm1lYXN1cmVVbml0cyIsInVuaXRzIiwibmFtZSIsIm11bHRpcGxpZXIiLCJtZWFzdXJpbmdUYXBlTm9kZSIsInZpc2libGVQcm9wZXJ0eSIsImlzTWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eSIsImJhc2VQb3NpdGlvblByb3BlcnR5IiwibWVhc3VyaW5nVGFwZUJhc2VQb3NpdGlvblByb3BlcnR5IiwidGlwUG9zaXRpb25Qcm9wZXJ0eSIsIm1lYXN1cmluZ1RhcGVUaXBQb3NpdGlvblByb3BlcnR5Iiwic2lnbmlmaWNhbnRGaWd1cmVzIiwibGluZUNvbG9yIiwidGlwQ2lyY2xlQ29sb3IiLCJ0aXBDaXJjbGVSYWRpdXMiLCJpc0Jhc2VDcm9zc2hhaXJSb3RhdGluZyIsImlzVGlwQ3Jvc3NoYWlyUm90YXRpbmciLCJkcmFnQm91bmRzIiwidmlld1RvTW9kZWxCb3VuZHMiLCJlcm9kZWQiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwicmVzZXQiLCJmaWxsQnV0dG9uIiwiZW5hYmxlZCIsImZsdWlkRGVuc2l0eUNvbnRyb2xTbGlkZXIiLCJmbHVpZERlbnNpdHlQcm9wZXJ0eSIsImdldEZsdWlkRGVuc2l0eVN0cmluZyIsImJpbmQiLCJmbHVpZERlbnNpdHlSYW5nZSIsImZsdWlkRGVuc2l0eUNvbnRyb2xFeHBhbmRlZFByb3BlcnR5IiwidGl0bGUiLCJ0aWNrcyIsInZhbHVlIiwibWluIiwibWF4Iiwic2x1aWNlQ29udHJvbFBhbmVsIiwiaXNTbHVpY2VPcGVuUHJvcGVydHkiLCJzdGVwQnV0dG9uIiwiZW5hYmxlZFByb3BlcnR5Iiwibm90IiwiaXNQbGF5aW5nUHJvcGVydHkiLCJzdGVwSW50ZXJuYWwiLCJwbGF5UGF1c2VCdXR0b24iLCJ5IiwiY2VudGVyWSIsInNwZWVkQ29udHJvbCIsImFsaWduIiwic3BhY2luZyIsImNoaWxkcmVuIiwic3BlZWRQcm9wZXJ0eSIsInJhZGl1cyIsIm11dGF0ZSIsInNlbnNvclBhbmVsIiwibGluZVdpZHRoIiwiXyIsImVhY2giLCJiYXJvbWV0ZXJzIiwiYmFyb21ldGVyIiwiZmx1aWRMZXZlbFByb3BlcnR5IiwiZ2V0UHJlc3N1cmVBdENvb3JkcyIsImdldFByZXNzdXJlU3RyaW5nIiwidmlzaWJsZUJvdW5kcyIsIndpdGhNYXhZIiwibWF4WSIsIm1pblByZXNzdXJlIiwiTUlOX1BSRVNTVVJFIiwibWF4UHJlc3N1cmUiLCJNQVhfUFJFU1NVUkUiLCJzcGVlZG9tZXRlcnMiLCJ2ZWxvY2l0eVNlbnNvciIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXRXYXRlckRyb3BWZWxvY2l0eUF0IiwiaXNSdWxlclZpc2libGVQcm9wZXJ0eSIsInJ1bGVyUG9zaXRpb25Qcm9wZXJ0eSIsInJ1bGVyV2lkdGgiLCJydWxlckhlaWdodCIsIm1ldGVyTWFqb3JTdGlja1dpZHRoIiwiZmVldE1ham9yU3RpY2tXaWR0aCIsInNjYWxlRm9udCIsIm1ldGVyVGlja3MiLCJyYW5nZSIsImZlZXRUaWNrcyIsImluc2V0c1dpZHRoIiwibGluayIsImlzU2x1aWNlT3BlbiIsInNsdWljZUdhdGUiLCJ3YXRlclRhbmtGcmFtZSIsIm1vZGVsVG9WaWV3RGVsdGFZIiwiSE9MRV9TSVpFIiwidGFua0Z1bGxMZXZlbER1cmF0aW9uUHJvcGVydHkiLCJ0YW5rRnVsbExldmVsRHVyYXRpb24iLCJmbHVpZFZvbHVtZVByb3BlcnR5IiwiZmx1aWRWb2x1bWUiLCJUQU5LX1ZPTFVNRSIsImlzUGxheWluZyIsIm1vdmVUb0Zyb250Iiwic3RlcCIsImR0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJXYXRlclRvd2VyU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgJ1dhdGVyIFRvd2VyJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBQbGF5UGF1c2VCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUGxheVBhdXNlQnV0dG9uLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFN0ZXBGb3J3YXJkQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1N0ZXBGb3J3YXJkQnV0dG9uLmpzJztcclxuaW1wb3J0IEZhdWNldE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0ZhdWNldE5vZGUuanMnO1xyXG5pbXBvcnQgR3JvdW5kTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvR3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCBNZWFzdXJpbmdUYXBlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWVhc3VyaW5nVGFwZU5vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFNreU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1NreU5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24uanMnO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmFyb21ldGVyTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9CYXJvbWV0ZXJOb2RlLmpzJztcclxuaW1wb3J0IENvbnRyb2xTbGlkZXIgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQ29udHJvbFNsaWRlci5qcyc7XHJcbmltcG9ydCBGUEFGUnVsZXIgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRlBBRlJ1bGVyLmpzJztcclxuaW1wb3J0IFVuaXRzQ29udHJvbFBhbmVsIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1VuaXRzQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFZlbG9jaXR5U2Vuc29yTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9WZWxvY2l0eVNlbnNvck5vZGUuanMnO1xyXG5pbXBvcnQgZmx1aWRQcmVzc3VyZUFuZEZsb3cgZnJvbSAnLi4vLi4vZmx1aWRQcmVzc3VyZUFuZEZsb3cuanMnO1xyXG5pbXBvcnQgRmx1aWRQcmVzc3VyZUFuZEZsb3dTdHJpbmdzIGZyb20gJy4uLy4uL0ZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBGYXVjZXRDb250cm9sUGFuZWwgZnJvbSAnLi9GYXVjZXRDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgSG9zZU5vZGUgZnJvbSAnLi9Ib3NlTm9kZS5qcyc7XHJcbmltcG9ydCBTbHVpY2VDb250cm9sUGFuZWwgZnJvbSAnLi9TbHVpY2VDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgVG9vbHNDb250cm9sUGFuZWwgZnJvbSAnLi9Ub29sc0NvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBXYXRlckRyb3BzQ2FudmFzTm9kZSBmcm9tICcuL1dhdGVyRHJvcHNDYW52YXNOb2RlLmpzJztcclxuaW1wb3J0IFdhdGVyVG93ZXJOb2RlIGZyb20gJy4vV2F0ZXJUb3dlck5vZGUuanMnO1xyXG5cclxuLy8gIHN0cmluZ3NcclxuY29uc3QgZmVldFN0cmluZyA9IEZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncy5mZWV0O1xyXG5jb25zdCBmbHVpZERlbnNpdHlTdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MuZmx1aWREZW5zaXR5O1xyXG5jb25zdCBnYXNvbGluZVN0cmluZyA9IEZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncy5nYXNvbGluZTtcclxuY29uc3QgaG9uZXlTdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3MuaG9uZXk7XHJcbmNvbnN0IG1ldGVyc1N0cmluZyA9IEZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncy5tZXRlcnM7XHJcbmNvbnN0IG5vcm1hbFN0cmluZyA9IEZsdWlkUHJlc3N1cmVBbmRGbG93U3RyaW5ncy5ub3JtYWw7XHJcbmNvbnN0IHNsb3dNb3Rpb25TdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3Muc2xvd01vdGlvbjtcclxuY29uc3Qgd2F0ZXJTdHJpbmcgPSBGbHVpZFByZXNzdXJlQW5kRmxvd1N0cmluZ3Mud2F0ZXI7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSU5TRVQgPSAxMDtcclxuXHJcbmNsYXNzIFdhdGVyVG93ZXJTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7V2F0ZXJUb3dlck1vZGVsfSB3YXRlclRvd2VyTW9kZWxcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggd2F0ZXJUb3dlck1vZGVsICkge1xyXG5cclxuICAgIHN1cGVyKCBDb25zdGFudHMuU0NSRUVOX1ZJRVdfT1BUSU9OUyApO1xyXG5cclxuICAgIGNvbnN0IHRleHRPcHRpb25zID0geyBmb250OiBuZXcgUGhldEZvbnQoIDE0ICkgfTtcclxuXHJcbiAgICAvLyBJbnZlcnQgdGhlIHktYXhpcywgc28gdGhhdCB5IGdyb3dzIHVwLlxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyhcclxuICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgMzUwICksXHJcbiAgICAgIDEwICk7IC8vMW0gPSAxMHB4LCAoMCwwKSAtIHRvcCBsZWZ0IGNvcm5lclxyXG5cclxuICAgIGNvbnN0IGdyb3VuZFkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCAwICk7XHJcblxyXG4gICAgLy8gVE9ETzogZmluZCBhIHdheSB0byBub3QgZG8gdGhpc1xyXG4gICAgd2F0ZXJUb3dlck1vZGVsLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuXHJcbiAgICAvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCwgc2VlIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZmx1aWQtcHJlc3N1cmUtYW5kLWZsb3cvaXNzdWVzLzg3XHJcbiAgICAvLyBhZGQgYmFja2dyb3VuZCAtLSBza3lcclxuICAgIC8vIHJlY3RhbmdsZSB3aXRoIHVuaWZvcm0gc2t5IGNvbG9yIGZvciB5IDwgZ3JvdW5kWSAtIDIwMFxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggLTUwMDAsIC0xMDAwLCAxMDAwMCwgMTAwMCArIGdyb3VuZFkgLSAxOTgsIHtcclxuICAgICAgc3Ryb2tlOiAnIzAxQUNFNCcsXHJcbiAgICAgIGZpbGw6ICcjMDFBQ0U0J1xyXG4gICAgfSApICk7XHJcbiAgICAvLyBncmFkaWVudCBiYWNrZ3JvdW5kIHNreW5vZGUgYmV0d2VlbiB5ID0gZ3JvdW5kWSAtIDIwMCBhbmQgeSA9IGdyb3VuZFlcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBTa3lOb2RlKCAtNTAwMCwgZ3JvdW5kWSAtIDIwMCwgMTAwMDAsIDIwMCwgZ3JvdW5kWSApICk7XHJcblxyXG4gICAgdGhpcy5ob3NlRHJvcHNMYXllciA9IG5ldyBXYXRlckRyb3BzQ2FudmFzTm9kZSggd2F0ZXJUb3dlck1vZGVsLmhvc2VEcm9wcywgd2F0ZXJUb3dlck1vZGVsLmZsdWlkQ29sb3JNb2RlbCwgd2F0ZXJUb3dlck1vZGVsLm1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICBjYW52YXNCb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCA4NTAsIDM1MCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5ob3NlRHJvcHNMYXllciApO1xyXG5cclxuICAgIHRoaXMud2F0ZXJUb3dlckRyb3BzTGF5ZXIgPSBuZXcgV2F0ZXJEcm9wc0NhbnZhc05vZGUoIHdhdGVyVG93ZXJNb2RlbC53YXRlclRvd2VyRHJvcHMsIHdhdGVyVG93ZXJNb2RlbC5mbHVpZENvbG9yTW9kZWwsIHdhdGVyVG93ZXJNb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgY2FudmFzQm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgNTAwLCAzNTAgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy53YXRlclRvd2VyRHJvcHNMYXllciApO1xyXG5cclxuICAgIC8vIGFkZCBiYWNrZ3JvdW5kIC0tIGVhcnRoXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgR3JvdW5kTm9kZSggLTUwMDAsIGdyb3VuZFksIDEwMDAwLCAxMDAwMCwgZ3JvdW5kWSArIDUwICkgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGhvc2VcclxuICAgIHRoaXMuaG9zZU5vZGUgPSBuZXcgSG9zZU5vZGUoIHdhdGVyVG93ZXJNb2RlbC5ob3NlLCB3YXRlclRvd2VyTW9kZWwud2F0ZXJUb3dlci50YW5rUG9zaXRpb25Qcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtLCB3YXRlclRvd2VyTW9kZWwuaXNIb3NlVmlzaWJsZVByb3BlcnR5ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmhvc2VOb2RlICk7XHJcblxyXG4gICAgY29uc3Qgd2F0ZXJUb3dlck5vZGUgPSBuZXcgV2F0ZXJUb3dlck5vZGUoIHdhdGVyVG93ZXJNb2RlbC53YXRlclRvd2VyLCB3YXRlclRvd2VyTW9kZWwuZmx1aWRDb2xvck1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRoaXMuaG9zZU5vZGUgKTtcclxuICAgIHdhdGVyVG93ZXJOb2RlLmJvdHRvbSA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIDAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHdhdGVyVG93ZXJOb2RlICk7XHJcblxyXG4gICAgdGhpcy5mYXVjZXREcm9wc0xheWVyID0gbmV3IFdhdGVyRHJvcHNDYW52YXNOb2RlKCB3YXRlclRvd2VyTW9kZWwuZmF1Y2V0RHJvcHMsIHdhdGVyVG93ZXJNb2RlbC5mbHVpZENvbG9yTW9kZWwsIHdhdGVyVG93ZXJNb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgY2FudmFzQm91bmRzOiBuZXcgQm91bmRzMiggNTAsIDAsIDE1MCwgMzUwIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZmF1Y2V0RHJvcHNMYXllciApO1xyXG5cclxuICAgIGNvbnN0IGZhdWNldE5vZGUgPSBuZXcgRmF1Y2V0Tm9kZSggMzAsIHdhdGVyVG93ZXJNb2RlbC5mYXVjZXRGbG93UmF0ZVByb3BlcnR5LCB3YXRlclRvd2VyTW9kZWwuaXNGYXVjZXRFbmFibGVkUHJvcGVydHksIHtcclxuICAgICAgaG9yaXpvbnRhbFBpcGVMZW5ndGg6IDE1MDAsXHJcbiAgICAgIHJpZ2h0OiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB3YXRlclRvd2VyTW9kZWwuZmF1Y2V0UG9zaXRpb24ueCApICsgMjAsXHJcbiAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgSU5TRVQsXHJcbiAgICAgIHNjYWxlOiAwLjMsIC8vIHNpemUgb2YgdGhlIGZhdWNldCxcclxuICAgICAgY2xvc2VPblJlbGVhc2U6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gRmF1Y2V0IGlzIGludGVyYWN0aXZlIGluIG1hbnVhbCBtb2RlLCBub24taW50ZXJhY3RpdmUgaW4gJ21hdGNoTGVha2FnZScgbW9kZSwgc2VlICMxMzJcclxuICAgICAgaW50ZXJhY3RpdmVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB3YXRlclRvd2VyTW9kZWwuZmF1Y2V0TW9kZVByb3BlcnR5IF0sXHJcbiAgICAgICAgZmF1Y2V0TW9kZSA9PiBmYXVjZXRNb2RlID09PSAnbWFudWFsJyApLFxyXG4gICAgICBzaG9vdGVyT3B0aW9uczoge1xyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMzcsXHJcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA2MFxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmYXVjZXROb2RlICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEZhdWNldENvbnRyb2xQYW5lbCggd2F0ZXJUb3dlck1vZGVsLmZhdWNldE1vZGVQcm9wZXJ0eSwge1xyXG4gICAgICBsZWZ0OiBmYXVjZXROb2RlLnJpZ2h0ICsgSU5TRVQsXHJcbiAgICAgIGJvdHRvbTogZmF1Y2V0Tm9kZS5ib3R0b20sXHJcbiAgICAgIGZpbGw6ICdncmVlbidcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIHRvb2xzIGNvbnRyb2wgcGFuZWxcclxuICAgIHRoaXMudG9vbHNDb250cm9sUGFuZWwgPSBuZXcgVG9vbHNDb250cm9sUGFuZWwoIHdhdGVyVG93ZXJNb2RlbCwge1xyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSBJTlNFVCxcclxuICAgICAgdG9wOiBJTlNFVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy50b29sc0NvbnRyb2xQYW5lbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFVuaXRzQ29udHJvbFBhbmVsKCB3YXRlclRvd2VyTW9kZWwubWVhc3VyZVVuaXRzUHJvcGVydHksIHtcclxuICAgICAgbGVmdDogdGhpcy50b29sc0NvbnRyb2xQYW5lbC5sZWZ0LCB4TWFyZ2luOiAxMCwgeU1hcmdpbjogMTAsIGZvbnRTaXplOiAxNCxcclxuICAgICAgdG9wOiB0aGlzLnRvb2xzQ29udHJvbFBhbmVsLmJvdHRvbSArIElOU0VUXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBhbGwgdGhlIG1vdmFibGUgdG9vbHMgYXJlIGFkZGVkIHRvIHRoaXMgbGF5ZXJcclxuICAgIGNvbnN0IHRvb2xzTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdG9vbHNMYXllciApO1xyXG5cclxuICAgIGNvbnN0IHVuaXRzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHdhdGVyVG93ZXJNb2RlbC5tZWFzdXJlVW5pdHNQcm9wZXJ0eSBdLFxyXG4gICAgICBtZWFzdXJlVW5pdHMgPT4ge1xyXG4gICAgICAgIGxldCB1bml0cyA9IHt9O1xyXG4gICAgICAgIGlmICggbWVhc3VyZVVuaXRzID09PSAnbWV0cmljJyApIHtcclxuICAgICAgICAgIHVuaXRzID0geyBuYW1lOiBtZXRlcnNTdHJpbmcsIG11bHRpcGxpZXI6IDEgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyB0aGVuIGl0IG11c3QgYmUgZW5nbGlzaFxyXG4gICAgICAgICAgdW5pdHMgPSB7IG5hbWU6IGZlZXRTdHJpbmcsIG11bHRpcGxpZXI6IDMuMjggfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuaXRzO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZU5vZGUgPSBuZXcgTWVhc3VyaW5nVGFwZU5vZGUoIHVuaXRzUHJvcGVydHksIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB3YXRlclRvd2VyTW9kZWwuaXNNZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBiYXNlUG9zaXRpb25Qcm9wZXJ0eTogd2F0ZXJUb3dlck1vZGVsLm1lYXN1cmluZ1RhcGVCYXNlUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgdGlwUG9zaXRpb25Qcm9wZXJ0eTogd2F0ZXJUb3dlck1vZGVsLm1lYXN1cmluZ1RhcGVUaXBQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgc2lnbmlmaWNhbnRGaWd1cmVzOiAyLFxyXG4gICAgICBsaW5lQ29sb3I6ICdibGFjaycsIC8vIGNvbG9yIG9mIHRoZSB0YXBlbGluZSBpdHNlbGZcclxuICAgICAgdGlwQ2lyY2xlQ29sb3I6ICdibGFjaycsIC8vIGNvbG9yIG9mIHRoZSBjaXJjbGUgYXQgdGhlIHRpcFxyXG4gICAgICB0aXBDaXJjbGVSYWRpdXM6IDgsIC8vIHJhZGl1cyBvZiB0aGUgY2lyY2xlIG9uIHRoZSB0aXBcclxuICAgICAgaXNCYXNlQ3Jvc3NoYWlyUm90YXRpbmc6IGZhbHNlLCAvLyBkbyBjcm9zc2hhaXJzIHJvdGF0ZSBhcm91bmQgdGhlaXIgb3duIGF4aXMgdG8gbGluZSB1cCB3aXRoIHRoZSB0YXBlbGluZVxyXG4gICAgICBpc1RpcENyb3NzaGFpclJvdGF0aW5nOiBmYWxzZSwgLy8gZG8gY3Jvc3NoYWlycyByb3RhdGUgYXJvdW5kIHRoZWlyIG93biBheGlzIHRvIGxpbmUgdXAgd2l0aCB0aGUgdGFwZWxpbmVcclxuICAgICAgZHJhZ0JvdW5kczogbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsQm91bmRzKCB0aGlzLmxheW91dEJvdW5kcy5lcm9kZWQoIDEwICkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgd2F0ZXJUb3dlck1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5ob3NlTm9kZS5yZXNldCgpO1xyXG4gICAgICAgIG1lYXN1cmluZ1RhcGVOb2RlLnJlc2V0KCk7XHJcbiAgICAgICAgd2F0ZXJUb3dlck5vZGUuZmlsbEJ1dHRvbi5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gSU5TRVQsXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gSU5TRVRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBmbHVpZCBkZW5zaXR5IGNvbnRyb2wgc2xpZGVyXHJcbiAgICBjb25zdCBmbHVpZERlbnNpdHlDb250cm9sU2xpZGVyID0gbmV3IENvbnRyb2xTbGlkZXIoXHJcbiAgICAgIHdhdGVyVG93ZXJNb2RlbC5tZWFzdXJlVW5pdHNQcm9wZXJ0eSxcclxuICAgICAgd2F0ZXJUb3dlck1vZGVsLmZsdWlkRGVuc2l0eVByb3BlcnR5LFxyXG4gICAgICB3YXRlclRvd2VyTW9kZWwuZ2V0Rmx1aWREZW5zaXR5U3RyaW5nLmJpbmQoIHdhdGVyVG93ZXJNb2RlbCApLFxyXG4gICAgICB3YXRlclRvd2VyTW9kZWwuZmx1aWREZW5zaXR5UmFuZ2UsXHJcbiAgICAgIHdhdGVyVG93ZXJNb2RlbC5mbHVpZERlbnNpdHlDb250cm9sRXhwYW5kZWRQcm9wZXJ0eSwge1xyXG4gICAgICAgIHJpZ2h0OiByZXNldEFsbEJ1dHRvbi5sZWZ0IC0gNCAqIElOU0VULFxyXG4gICAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gSU5TRVQsXHJcbiAgICAgICAgdGl0bGU6IGZsdWlkRGVuc2l0eVN0cmluZyxcclxuICAgICAgICB0aWNrczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0aXRsZTogd2F0ZXJTdHJpbmcsXHJcbiAgICAgICAgICAgIHZhbHVlOiB3YXRlclRvd2VyTW9kZWwuZmx1aWREZW5zaXR5UHJvcGVydHkudmFsdWVcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRpdGxlOiBnYXNvbGluZVN0cmluZyxcclxuICAgICAgICAgICAgdmFsdWU6IHdhdGVyVG93ZXJNb2RlbC5mbHVpZERlbnNpdHlSYW5nZS5taW5cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRpdGxlOiBob25leVN0cmluZyxcclxuICAgICAgICAgICAgdmFsdWU6IHdhdGVyVG93ZXJNb2RlbC5mbHVpZERlbnNpdHlSYW5nZS5tYXhcclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGZsdWlkRGVuc2l0eUNvbnRyb2xTbGlkZXIgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIHNsdWljZSBjb250cm9sIG5lYXIgYm90dG9tIGxlZnRcclxuICAgIGNvbnN0IHNsdWljZUNvbnRyb2xQYW5lbCA9IG5ldyBTbHVpY2VDb250cm9sUGFuZWwoIHdhdGVyVG93ZXJNb2RlbC5pc1NsdWljZU9wZW5Qcm9wZXJ0eSwge1xyXG4gICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgeU1hcmdpbjogMTUsXHJcbiAgICAgIGZpbGw6ICcjMUY1RUZGJyxcclxuICAgICAgcmlnaHQ6IHdhdGVyVG93ZXJOb2RlLnJpZ2h0ICsgMzYsXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gNzBcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNsdWljZUNvbnRyb2xQYW5lbCApO1xyXG5cclxuICAgIC8vIGFkZCBwbGF5IHBhdXNlIGJ1dHRvbiBhbmQgc3RlcCBidXR0b25cclxuICAgIGNvbnN0IHN0ZXBCdXR0b24gPSBuZXcgU3RlcEZvcndhcmRCdXR0b24oIHtcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiBEZXJpdmVkUHJvcGVydHkubm90KCB3YXRlclRvd2VyTW9kZWwuaXNQbGF5aW5nUHJvcGVydHkgKSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHsgd2F0ZXJUb3dlck1vZGVsLnN0ZXBJbnRlcm5hbCggMC4wMTYgKTsgfSxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBmaWxsOiAnIzAwNTU2NicsXHJcbiAgICAgIHJpZ2h0OiBmbHVpZERlbnNpdHlDb250cm9sU2xpZGVyLmxlZnQgLSBJTlNFVCxcclxuICAgICAgYm90dG9tOiBmbHVpZERlbnNpdHlDb250cm9sU2xpZGVyLmJvdHRvbSAtIElOU0VUXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggc3RlcEJ1dHRvbiApO1xyXG5cclxuICAgIGNvbnN0IHBsYXlQYXVzZUJ1dHRvbiA9IG5ldyBQbGF5UGF1c2VCdXR0b24oIHdhdGVyVG93ZXJNb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eSxcclxuICAgICAgeyBzdHJva2U6ICdibGFjaycsIGZpbGw6ICcjMDA1NTY2JywgeTogc3RlcEJ1dHRvbi5jZW50ZXJZLCByaWdodDogc3RlcEJ1dHRvbi5sZWZ0IC0gSU5TRVQgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGxheVBhdXNlQnV0dG9uICk7XHJcblxyXG4gICAgY29uc3Qgc3BlZWRDb250cm9sID0gbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgQXF1YVJhZGlvQnV0dG9uKCB3YXRlclRvd2VyTW9kZWwuc3BlZWRQcm9wZXJ0eSwgJ3Nsb3cnLCBuZXcgVGV4dCggc2xvd01vdGlvblN0cmluZywgdGV4dE9wdGlvbnMgKSwgeyByYWRpdXM6IDYgfSApLFxyXG4gICAgICAgIG5ldyBBcXVhUmFkaW9CdXR0b24oIHdhdGVyVG93ZXJNb2RlbC5zcGVlZFByb3BlcnR5LCAnbm9ybWFsJywgbmV3IFRleHQoIG5vcm1hbFN0cmluZywgdGV4dE9wdGlvbnMgKSwgeyByYWRpdXM6IDYgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBzcGVlZENvbnRyb2wubXV0YXRlKCB7IHJpZ2h0OiBwbGF5UGF1c2VCdXR0b24ubGVmdCAtIElOU0VULCBib3R0b206IHBsYXlQYXVzZUJ1dHRvbi5ib3R0b20gfSApICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBzZW5zb3JzIHBhbmVsXHJcbiAgICBjb25zdCBzZW5zb3JQYW5lbCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDE5MCwgMTA1LCAxMCwgMTAsIHtcclxuICAgICAgc3Ryb2tlOiAnZ3JheScsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgZmlsbDogJyNmMmZhNmEnLFxyXG4gICAgICByaWdodDogdGhpcy50b29sc0NvbnRyb2xQYW5lbC5sZWZ0IC0gSU5TRVQsXHJcbiAgICAgIHRvcDogdGhpcy50b29sc0NvbnRyb2xQYW5lbC50b3BcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNlbnNvclBhbmVsICk7XHJcblxyXG4gICAgLy8gYWRkIGJhcm9tZXRlcnMgd2l0aGluIHRoZSBzZW5zb3IgcGFuZWwgYm91bmRzXHJcbiAgICBfLmVhY2goIHdhdGVyVG93ZXJNb2RlbC5iYXJvbWV0ZXJzLCBiYXJvbWV0ZXIgPT4ge1xyXG4gICAgICBiYXJvbWV0ZXIucmVzZXQoKTtcclxuICAgICAgdG9vbHNMYXllci5hZGRDaGlsZCggbmV3IEJhcm9tZXRlck5vZGUoXHJcbiAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICAgIGJhcm9tZXRlcixcclxuICAgICAgICB3YXRlclRvd2VyTW9kZWwubWVhc3VyZVVuaXRzUHJvcGVydHksXHJcbiAgICAgICAgWyB3YXRlclRvd2VyTW9kZWwuZmx1aWREZW5zaXR5UHJvcGVydHksIHdhdGVyVG93ZXJNb2RlbC53YXRlclRvd2VyLnRhbmtQb3NpdGlvblByb3BlcnR5LCB3YXRlclRvd2VyTW9kZWwud2F0ZXJUb3dlci5mbHVpZExldmVsUHJvcGVydHkgXSxcclxuICAgICAgICB3YXRlclRvd2VyTW9kZWwuZ2V0UHJlc3N1cmVBdENvb3Jkcy5iaW5kKCB3YXRlclRvd2VyTW9kZWwgKSxcclxuICAgICAgICB3YXRlclRvd2VyTW9kZWwuZ2V0UHJlc3N1cmVTdHJpbmcuYmluZCggd2F0ZXJUb3dlck1vZGVsICksXHJcbiAgICAgICAgc2Vuc29yUGFuZWwudmlzaWJsZUJvdW5kcyxcclxuICAgICAgICB0aGlzLmxheW91dEJvdW5kcy53aXRoTWF4WSggdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIDYyICksIHtcclxuICAgICAgICAgIG1pblByZXNzdXJlOiBDb25zdGFudHMuTUlOX1BSRVNTVVJFLFxyXG4gICAgICAgICAgbWF4UHJlc3N1cmU6IENvbnN0YW50cy5NQVhfUFJFU1NVUkVcclxuICAgICAgICB9ICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgc3BlZWRvbWV0ZXJzIHdpdGhpbiB0aGUgc2Vuc29yIHBhbmVsIGJvdW5kc1xyXG4gICAgXy5lYWNoKCB3YXRlclRvd2VyTW9kZWwuc3BlZWRvbWV0ZXJzLCB2ZWxvY2l0eVNlbnNvciA9PiB7XHJcbiAgICAgIHZlbG9jaXR5U2Vuc29yLnBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgdG9vbHNMYXllci5hZGRDaGlsZCggbmV3IFZlbG9jaXR5U2Vuc29yTm9kZSggbW9kZWxWaWV3VHJhbnNmb3JtLCB2ZWxvY2l0eVNlbnNvcixcclxuICAgICAgICB3YXRlclRvd2VyTW9kZWwubWVhc3VyZVVuaXRzUHJvcGVydHksIFtdLCB3YXRlclRvd2VyTW9kZWwuZ2V0V2F0ZXJEcm9wVmVsb2NpdHlBdC5iaW5kKCB3YXRlclRvd2VyTW9kZWwgKSxcclxuICAgICAgICBzZW5zb3JQYW5lbC52aXNpYmxlQm91bmRzLCB0aGlzLmxheW91dEJvdW5kcy53aXRoTWF4WSggdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIDcyICkgKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRvb2xzTGF5ZXIuYWRkQ2hpbGQoIG5ldyBGUEFGUnVsZXIoIHdhdGVyVG93ZXJNb2RlbC5pc1J1bGVyVmlzaWJsZVByb3BlcnR5LCB3YXRlclRvd2VyTW9kZWwucnVsZXJQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB3YXRlclRvd2VyTW9kZWwubWVhc3VyZVVuaXRzUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwgdGhpcy5sYXlvdXRCb3VuZHMsIHtcclxuICAgICAgICBydWxlcldpZHRoOiA0MCxcclxuICAgICAgICBydWxlckhlaWdodDogMzAsXHJcbiAgICAgICAgbWV0ZXJNYWpvclN0aWNrV2lkdGg6IDUsXHJcbiAgICAgICAgZmVldE1ham9yU3RpY2tXaWR0aDogMyxcclxuICAgICAgICBzY2FsZUZvbnQ6IDEyLFxyXG4gICAgICAgIG1ldGVyVGlja3M6IF8ucmFuZ2UoIDAsIDMxLCA1ICksXHJcbiAgICAgICAgZmVldFRpY2tzOiBfLnJhbmdlKCAwLCAxMDEsIDEwICksXHJcbiAgICAgICAgaW5zZXRzV2lkdGg6IDBcclxuICAgICAgfSApICk7XHJcbiAgICB0b29sc0xheWVyLmFkZENoaWxkKCBtZWFzdXJpbmdUYXBlTm9kZSApO1xyXG5cclxuXHJcbiAgICB3YXRlclRvd2VyTW9kZWwuaXNTbHVpY2VPcGVuUHJvcGVydHkubGluayggaXNTbHVpY2VPcGVuID0+IHtcclxuICAgICAgaWYgKCBpc1NsdWljZU9wZW4gKSB7XHJcbiAgICAgICAgd2F0ZXJUb3dlck5vZGUuc2x1aWNlR2F0ZS5ib3R0b20gPSB3YXRlclRvd2VyTm9kZS53YXRlclRhbmtGcmFtZS5ib3R0b20gKyBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIHdhdGVyVG93ZXJOb2RlLndhdGVyVG93ZXIuSE9MRV9TSVpFICkgLSA1O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHdhdGVyVG93ZXJOb2RlLnNsdWljZUdhdGUuYm90dG9tID0gd2F0ZXJUb3dlck5vZGUud2F0ZXJUYW5rRnJhbWUuYm90dG9tO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgd2F0ZXJUb3dlck1vZGVsLnRhbmtGdWxsTGV2ZWxEdXJhdGlvblByb3BlcnR5LmxpbmsoIHRhbmtGdWxsTGV2ZWxEdXJhdGlvbiA9PiB7XHJcbiAgICAgIHdhdGVyVG93ZXJOb2RlLmZpbGxCdXR0b24uZW5hYmxlZCA9ICggdGFua0Z1bGxMZXZlbER1cmF0aW9uIDwgMC4yICk7XHJcbiAgICAgIHdhdGVyVG93ZXJNb2RlbC5pc0ZhdWNldEVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9ICggdGFua0Z1bGxMZXZlbER1cmF0aW9uIDwgMC4yICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gaWYgdGhlIHNpbSBpcyBwYXVzZWQsIGRpc2FibGUgdGhlIGZpbGwgYnV0dG9uIGFzIHNvb24gYXMgdGhlIHRhbmsgaXMgZmlsbGVkXHJcbiAgICAvL1RPRE8gdGhpcyBpcyB1bm5lY2Vzc2FyaWx5IGNvbXBsaWNhdGVkXHJcbiAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHdhdGVyVG93ZXJNb2RlbC53YXRlclRvd2VyLmZsdWlkVm9sdW1lUHJvcGVydHkgXSwgZmx1aWRWb2x1bWUgPT4ge1xyXG4gICAgICByZXR1cm4gZmx1aWRWb2x1bWUgPT09IHdhdGVyVG93ZXJNb2RlbC53YXRlclRvd2VyLlRBTktfVk9MVU1FO1xyXG4gICAgfSApLmxpbmsoICgpID0+IHtcclxuICAgICAgaWYgKCAhd2F0ZXJUb3dlck1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHdhdGVyVG93ZXJOb2RlLmZpbGxCdXR0b24uZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHdhdGVyVG93ZXJNb2RlbC50YW5rRnVsbExldmVsRHVyYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IDE7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIYW5kbGVzIHRoZSBjYXNlIHdoZW4gc3dpdGNoaW5nIGZyb20gcGxheSB0byBwYXVzZSBvciB2aWNldmVyc2FcclxuICAgIC8vVE9ETyB0aGlzIGlzIHVubmVjZXNzYXJpbHkgY29tcGxpY2F0ZWRcclxuICAgIHdhdGVyVG93ZXJNb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eS5saW5rKCBpc1BsYXlpbmcgPT4ge1xyXG4gICAgICBpZiAoIHdhdGVyVG93ZXJNb2RlbC53YXRlclRvd2VyLmZsdWlkVm9sdW1lUHJvcGVydHkudmFsdWUgPj0gd2F0ZXJUb3dlck1vZGVsLndhdGVyVG93ZXIuVEFOS19WT0xVTUUgKSB7XHJcbiAgICAgICAgd2F0ZXJUb3dlck1vZGVsLnRhbmtGdWxsTGV2ZWxEdXJhdGlvblByb3BlcnR5LnZhbHVlID0gMTtcclxuICAgICAgICBpZiAoICFpc1BsYXlpbmcgKSB7XHJcbiAgICAgICAgICAvLyBkaXNhYmxlIHRoZSBmaWxsIGJ1dHRvbiBpZiB0aGUgdGFuayBpcyBmdWxsIGFuZCBzd2l0Y2hpbmcgZnJvbSBwbGF5IHRvIHBhdXNlXHJcbiAgICAgICAgICB3YXRlclRvd2VyTm9kZS5maWxsQnV0dG9uLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRvb2xzTGF5ZXIubW92ZVRvRnJvbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMud2F0ZXJUb3dlckRyb3BzTGF5ZXIuc3RlcCggZHQgKTtcclxuICAgIHRoaXMuaG9zZURyb3BzTGF5ZXIuc3RlcCggZHQgKTtcclxuICAgIHRoaXMuZmF1Y2V0RHJvcHNMYXllci5zdGVwKCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxuZmx1aWRQcmVzc3VyZUFuZEZsb3cucmVnaXN0ZXIoICdXYXRlclRvd2VyU2NyZWVuVmlldycsIFdhdGVyVG93ZXJTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFdhdGVyVG93ZXJTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLGVBQWUsTUFBTSx3REFBd0Q7QUFDcEYsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxpQkFBaUIsTUFBTSwwREFBMEQ7QUFDeEYsT0FBT0MsVUFBVSxNQUFNLDJDQUEyQztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sMkNBQTJDO0FBQ2xFLE9BQU9DLGlCQUFpQixNQUFNLGtEQUFrRDtBQUNoRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLE9BQU8sTUFBTSx3Q0FBd0M7QUFDNUQsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUMvRSxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLFNBQVMsTUFBTSwyQkFBMkI7QUFDakQsT0FBT0MsYUFBYSxNQUFNLG9DQUFvQztBQUM5RCxPQUFPQyxhQUFhLE1BQU0sb0NBQW9DO0FBQzlELE9BQU9DLFNBQVMsTUFBTSxnQ0FBZ0M7QUFDdEQsT0FBT0MsaUJBQWlCLE1BQU0sd0NBQXdDO0FBQ3RFLE9BQU9DLGtCQUFrQixNQUFNLHlDQUF5QztBQUN4RSxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsMkJBQTJCLE1BQU0sc0NBQXNDO0FBQzlFLE9BQU9DLGtCQUFrQixN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