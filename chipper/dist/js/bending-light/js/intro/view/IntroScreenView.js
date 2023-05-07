// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for intro screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ProtractorNode from '../../../../scenery-phet/js/ProtractorNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { DragListener, HBox, Path, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLight from '../../bendingLight.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import BendingLightScreenView from '../../common/view/BendingLightScreenView.js';
import FloatingLayout from '../../common/view/FloatingLayout.js';
import IntensityMeterNode from '../../common/view/IntensityMeterNode.js';
import MediumControlPanel from '../../common/view/MediumControlPanel.js';
import MediumNode from '../../common/view/MediumNode.js';
import AngleIcon from './AngleIcon.js';
import AngleNode from './AngleNode.js';
import NormalLine from './NormalLine.js';
import WaveCanvasNode from './WaveCanvasNode.js';
import WaveWebGLNode from './WaveWebGLNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import LaserViewEnum from '../../common/model/LaserViewEnum.js';
import Multilink from '../../../../axon/js/Multilink.js';
import optionize from '../../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
const anglesStringProperty = BendingLightStrings.anglesStringProperty;
const materialStringProperty = BendingLightStrings.materialStringProperty;
const normalLineStringProperty = BendingLightStrings.normalLineStringProperty;

// constants
const INSET = 10;
class IntroScreenView extends BendingLightScreenView {
  /**
   * @param introModel - model of intro screen
   * @param hasMoreTools - whether contain more tools
   * @param indexOfRefractionDecimals - decimalPlaces to show for index of refraction
   * @param createLaserControlPanel
   * @param [providedOptions]
   */
  constructor(introModel, hasMoreTools, indexOfRefractionDecimals, createLaserControlPanel, providedOptions) {
    const options = optionize()({
      // in the Intro screen, it is shifted 102 to the left since there is extra room above the protractor toolbox
      // for the laser to traverse to.
      horizontalPlayAreaOffset: 102,
      /**
       * Specify how the drag angle should be clamped, in this case the laser must remain in the top left quadrant
       */
      clampDragAngle: angle => {
        while (angle < 0) {
          angle += Math.PI * 2;
        }
        return Utils.clamp(angle, Math.PI / 2, Math.PI);
      },
      /**
       * Indicate if the laser is not at its max angle, and therefore can be dragged to larger angles
       */
      clockwiseArrowNotAtMax: laserAngle => {
        if (introModel.laserViewProperty.value === LaserViewEnum.RAY) {
          return laserAngle < Math.PI;
        } else {
          return laserAngle < BendingLightConstants.MAX_ANGLE_IN_WAVE_MODE;
        }
      },
      /**
       * indicate if the laser is not at its min angle, and can therefore be dragged to smaller angles.
       */
      ccwArrowNotAtMax: laserAngle => laserAngle > Math.PI / 2
    }, providedOptions);
    super(introModel,
    // laserHasKnob
    false, options);
    this.introModel = introModel; // (read-only)

    const stageWidth = this.layoutBounds.width;
    const stageHeight = this.layoutBounds.height;

    // add MediumNodes for top and bottom
    this.mediumNode.addChild(new MediumNode(this.modelViewTransform, introModel.topMediumProperty));
    this.mediumNode.addChild(new MediumNode(this.modelViewTransform, introModel.bottomMediumProperty));
    this.stepEmitter = new Emitter();

    // add control panels for setting the index of refraction for each medium
    const topMediumControlPanel = new MediumControlPanel(this, introModel.mediumColorFactory, introModel.topMediumProperty, materialStringProperty, true, introModel.wavelengthProperty, indexOfRefractionDecimals, {
      yMargin: 7
    });
    const topMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    topMediumControlPanel.setTranslation(stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - topMediumControlPanelXOffset, this.modelViewTransform.modelToViewY(0) - 2 * INSET - topMediumControlPanel.getHeight() + 4);
    this.topMediumControlPanel = topMediumControlPanel;
    this.afterLightLayer3.addChild(topMediumControlPanel);

    // add control panels for setting the index of refraction for each medium
    const bottomMediumControlPanelXOffset = hasMoreTools ? 4 : 0;
    const bottomMediumControlPanel = new MediumControlPanel(this, introModel.mediumColorFactory, introModel.bottomMediumProperty, materialStringProperty, true, introModel.wavelengthProperty, indexOfRefractionDecimals, {
      yMargin: 7
    });
    bottomMediumControlPanel.setTranslation(stageWidth - topMediumControlPanel.getWidth() - 2 * INSET - bottomMediumControlPanelXOffset, this.modelViewTransform.modelToViewY(0) + 2 * INSET + 1);
    this.bottomMediumControlPanel = bottomMediumControlPanel;
    this.afterLightLayer3.addChild(bottomMediumControlPanel);

    // add a line that will show the border between the mediums even when both n's are the same... Just a thin line will
    // be fine.
    this.beforeLightLayer.addChild(new Path(this.modelViewTransform.modelToViewShape(new Shape().moveTo(-1, 0).lineTo(1, 0)), {
      stroke: 'gray',
      pickable: false
    }));

    // show the normal line where the laser strikes the interface between mediums
    const normalLineHeight = stageHeight / 2;
    const normalLine = new NormalLine(normalLineHeight, [7, 6], {
      x: this.modelViewTransform.modelToViewX(0),
      y: this.modelViewTransform.modelToViewY(0) - normalLineHeight / 2
    });
    this.afterLightLayer2.addChild(normalLine);

    // Add the angle node
    this.afterLightLayer2.addChild(new AngleNode(this.introModel.showAnglesProperty, this.introModel.laser.onProperty, this.introModel.showNormalProperty, this.introModel.rays, this.modelViewTransform,
    // Method to add a step listener
    stepCallback => this.stepEmitter.addListener(stepCallback)));
    introModel.showNormalProperty.linkAttribute(normalLine, 'visible');
    Multilink.multilink([introModel.laserViewProperty, introModel.laser.onProperty, introModel.intensityMeter.sensorPositionProperty, introModel.topMediumProperty, introModel.bottomMediumProperty, introModel.laser.emissionPointProperty, introModel.laser.colorProperty], () => {
      for (let k = 0; k < this.incidentWaveLayer.getChildrenCount(); k++) {
        // @ts-expect-error
        this.incidentWaveLayer.children[k].step();
      }
      this.incidentWaveLayer.setVisible(introModel.laser.onProperty.value && introModel.laserViewProperty.value === LaserViewEnum.WAVE);
    });

    // add laser view panel
    const laserViewXOffset = hasMoreTools ? 13 : 12;
    const laserViewYOffset = hasMoreTools ? 2 * INSET - 4 : 2 * INSET;
    const laserControlPanel = new Panel(createLaserControlPanel(introModel), {
      cornerRadius: 5,
      xMargin: 9,
      yMargin: 6,
      fill: '#EEEEEE',
      stroke: '#696969',
      lineWidth: 1.5,
      left: this.layoutBounds.minX + laserViewXOffset,
      top: this.layoutBounds.top + laserViewYOffset
    });
    this.laserViewLayer.addChild(laserControlPanel);

    // text for checkboxes
    const normalText = new Text(normalLineStringProperty, {
      fontSize: 12
    });
    const angleText = new Text(anglesStringProperty, {
      fontSize: 12
    });

    // add normal checkbox
    const normalIcon = new NormalLine(17, [4, 3]);
    const normalCheckbox = new Checkbox(introModel.showNormalProperty, new HBox({
      children: [normalText, normalIcon],
      spacing: 12
    }), {
      boxWidth: 15,
      spacing: 5
    });

    // add angle checkbox
    const angleIcon = new AngleIcon();
    const angleCheckbox = new Checkbox(introModel.showAnglesProperty, new HBox({
      children: [angleText, angleIcon],
      spacing: 12
    }), {
      boxWidth: 15,
      spacing: 5
    });
    const checkboxPanelChildren = hasMoreTools ? [normalCheckbox, angleCheckbox] : [normalCheckbox];
    const checkboxPanel = new VBox({
      children: checkboxPanelChildren,
      spacing: 6,
      align: 'left',
      bottom: this.layoutBounds.maxY - 10
    });
    this.beforeLightLayer2.addChild(checkboxPanel);

    // create the protractor node
    const protractorNodeIcon = ProtractorNode.createIcon({
      scale: 0.24,
      cursor: 'pointer'
    });
    protractorNodeIcon.mouseArea = Shape.bounds(protractorNodeIcon.localBounds);
    protractorNodeIcon.touchArea = Shape.bounds(protractorNodeIcon.localBounds);
    this.showProtractorProperty.link(showProtractor => {
      protractorNodeIcon.visible = !showProtractor;
    });
    const protractorNode = new ProtractorNode({
      visibleProperty: this.showProtractorProperty,
      scale: 0.8
    });
    const protractorPosition = new Vector2(protractorNode.centerX, protractorNode.centerY);
    const protractorPositionProperty = new Property(protractorPosition);

    // When a node is released, check if it is over the toolbox.  If so, drop it in.
    const dropInToolbox = (node, enabledProperty) => {
      if (node.getGlobalBounds().intersectsBounds(this.toolbox.getGlobalBounds())) {
        enabledProperty.value = false;
      }
    };
    this.dropInToolbox = dropInToolbox;
    const protractorNodeListener = new DragListener({
      useParentOffset: true,
      dragBoundsProperty: this.visibleBoundsProperty,
      positionProperty: protractorPositionProperty,
      end: () => dropInToolbox(protractorNode, this.showProtractorProperty)
    });

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the DragListener
    // for the node in the play area
    protractorNodeIcon.addInputListener(DragListener.createForwardingListener(event => {
      // Show the protractor in the play area and hide the icon
      this.showProtractorProperty.value = true;

      // Center the protractor on the pointer
      protractorPositionProperty.value = protractorNode.globalToParentPoint(event.pointer.point);
      protractorNodeListener.press(event);
    }));
    this.showProtractorProperty.linkAttribute(protractorNode, 'visible');
    const modelViewTransform = this.modelViewTransform;

    // When a node is dropped behind a control panel, move it to the side so it won't be lost.
    const bumpLeft = (node, positionProperty) => {
      while (node.getGlobalBounds().intersectsBounds(topMediumControlPanel.getGlobalBounds()) || node.getGlobalBounds().intersectsBounds(bottomMediumControlPanel.getGlobalBounds())) {
        positionProperty.value = positionProperty.value.plusXY(modelViewTransform.viewToModelDeltaX(-20), 0);
      }
    };
    protractorPositionProperty.link(protractorPosition => {
      protractorNode.center = protractorPosition;
    });
    protractorNode.addInputListener(protractorNodeListener);

    // add intensity meter
    const intensityMeterNodeIcon = new IntensityMeterNode(this.modelViewTransform, introModel.intensityMeter.copy(), {
      scale: 0.45,
      cursor: 'pointer'
    });
    intensityMeterNodeIcon.mouseArea = Shape.bounds(intensityMeterNodeIcon.localBounds);
    intensityMeterNodeIcon.touchArea = Shape.bounds(intensityMeterNodeIcon.localBounds);
    const intensityMeterNode = new IntensityMeterNode(this.modelViewTransform, introModel.intensityMeter);
    introModel.intensityMeter.enabledProperty.link(enabled => {
      intensityMeterNode.visible = enabled;
      intensityMeterNodeIcon.visible = !enabled;
    });
    const probeListener = new DragListener({
      positionProperty: introModel.intensityMeter.sensorPositionProperty,
      transform: modelViewTransform,
      dragBoundsProperty: new DerivedProperty([this.visibleBoundsProperty], visibleBounds => {
        return modelViewTransform.viewToModelBounds(visibleBounds);
      }),
      end: () => {
        bumpLeft(intensityMeterNode.probeNode, introModel.intensityMeter.sensorPositionProperty);
        dropInToolbox(intensityMeterNode.probeNode, introModel.intensityMeter.enabledProperty);
      }
    });
    intensityMeterNode.probeNode.addInputListener(probeListener);
    let draggingTogether = true;
    const bodyListener = new DragListener({
      useParentOffset: true,
      positionProperty: introModel.intensityMeter.bodyPositionProperty,
      transform: modelViewTransform,
      // The body node origin is at its top left, so translate the allowed drag area so that the center of the body node
      // will remain in bounds
      dragBoundsProperty: new DerivedProperty([this.visibleBoundsProperty], visibleBounds => {
        return modelViewTransform.viewToModelBounds(new Rectangle(visibleBounds.left - intensityMeterNode.bodyNode.bounds.width / 2, visibleBounds.top - intensityMeterNode.bodyNode.bounds.height / 2, visibleBounds.width - intensityMeterNode.bodyNode.width, visibleBounds.height));
      }),
      drag: () => {
        if (draggingTogether) {
          intensityMeterNode.resetRelativePositions();
        }
      },
      end: () => {
        draggingTogether = false;
        bumpLeft(intensityMeterNode.bodyNode, introModel.intensityMeter.bodyPositionProperty);
        dropInToolbox(intensityMeterNode.bodyNode, introModel.intensityMeter.enabledProperty);
      }
    });
    intensityMeterNode.bodyNode.addInputListener(bodyListener);

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the DragListener
    // for the node in the play area
    intensityMeterNodeIcon.addInputListener(DragListener.createForwardingListener(event => {
      // Show the probe in the play area and hide the icon
      introModel.intensityMeter.enabledProperty.value = true;

      // Center the center-bottom of the body on the pointer
      const bodyViewPosition = intensityMeterNode.bodyNode.globalToParentPoint(event.pointer.point).plusXY(-intensityMeterNode.bodyNode.width / 2, -intensityMeterNode.bodyNode.height + 5);
      introModel.intensityMeter.bodyPositionProperty.value = modelViewTransform.viewToModelPosition(bodyViewPosition);
      intensityMeterNode.resetRelativePositions();
      intensityMeterNode.syncModelFromView();
      draggingTogether = true;
      bodyListener.press(event);
    }));

    // for subclass usage in MoreToolsScreenView
    this.bumpLeft = bumpLeft;
    let toolboxNodes = [protractorNodeIcon, intensityMeterNodeIcon];
    toolboxNodes = toolboxNodes.concat(this.getAdditionalToolIcons());
    this.toolbox = new Panel(new VBox({
      spacing: 10,
      children: toolboxNodes,
      excludeInvisibleChildrenFromBounds: false
    }), {
      xMargin: 10,
      yMargin: 10,
      stroke: '#696969',
      lineWidth: 1.5,
      fill: '#EEEEEE',
      bottom: checkboxPanel.top - 15
    });
    this.beforeLightLayer2.addChild(this.toolbox);
    this.beforeLightLayer2.addChild(protractorNode);
    this.beforeLightLayer2.addChild(intensityMeterNode);

    // add reset all button
    const resetAllButton = new ResetAllButton({
      listener: () => this.reset(),
      bottom: this.layoutBounds.bottom - 14,
      right: this.layoutBounds.right - 2 * INSET,
      radius: 19
    });
    this.afterLightLayer2.addChild(resetAllButton);

    // add sim speed controls
    this.timeControlNode = new TimeControlNode(introModel.isPlayingProperty, {
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => {
            introModel.updateSimulationTimeAndWaveShape(TimeSpeed.NORMAL);
            this.updateWaveShape();
          }
        }
      },
      speedRadioButtonGroupOnLeft: true,
      timeSpeedProperty: introModel.speedProperty,
      left: checkboxPanel.right + 75,
      bottom: this.layoutBounds.maxY - 10
    });
    this.beforeLightLayer.addChild(this.timeControlNode);
    if (!hasMoreTools) {
      // show play pause and step buttons only in wave view
      introModel.laserViewProperty.link(laserType => this.timeControlNode.setVisible(laserType === LaserViewEnum.WAVE));
    }
    FloatingLayout.floatRight(this, [topMediumControlPanel, bottomMediumControlPanel, resetAllButton]);
    FloatingLayout.floatLeft(this, [laserControlPanel, this.toolbox]);

    // Indent the checkboxes a bit so it looks more natural
    FloatingLayout.floatLeft(this, [checkboxPanel], 10);
    FloatingLayout.floatTop(this, [laserControlPanel]);
    FloatingLayout.floatBottom(this, [checkboxPanel, resetAllButton, this.timeControlNode]);
    this.visibleBoundsProperty.link(() => {
      this.toolbox.bottom = checkboxPanel.top - 10;
    });
  }

  /**
   * restore initial conditions
   */
  reset() {
    super.reset();
    this.introModel.reset();
    this.topMediumControlPanel.reset();
    this.bottomMediumControlPanel.reset();
  }

  /**
   * Allow subclasses to provide more tools
   */
  getAdditionalToolIcons() {
    return [];
  }

  /**
   * Called by the animation loop.
   */
  step() {
    this.stepEmitter.emit();
    super.step();
    if (this.introModel.isPlayingProperty.value) {
      this.updateWaveShape();
    }
  }

  /**
   * Update wave shape.
   */
  updateWaveShape() {
    if (this.introModel.laserViewProperty.value === LaserViewEnum.WAVE) {
      for (let k = 0; k < this.incidentWaveLayer.getChildrenCount(); k++) {
        // @ts-expect-error
        this.incidentWaveLayer.children[k].step();
      }
    }
  }

  /**
   * Add light representations which are specific to this view.  In this case it is the wave representation.
   */
  addLightNodes(bendingLightModel) {
    this.addChild(this.incidentWaveLayer);

    // if WebGL is supported add WaveWebGLNode otherwise wave is rendered with the canvas.
    if (bendingLightModel.allowWebGL) {
      const waveWebGLNode = new WaveWebGLNode(this.modelViewTransform, bendingLightModel.rays);
      this.incidentWaveLayer.addChild(waveWebGLNode);
    } else {
      const waveCanvasNode = new WaveCanvasNode(this.bendingLightModel.rays, this.modelViewTransform, {
        // @ts-expect-error
        canvasBounds: new Bounds2(0, 0, 1000, 1000)
      });
      this.incidentWaveLayer.addChild(waveCanvasNode);
      this.visibleBoundsProperty.link(visibleBounds => {
        waveCanvasNode.setCanvasBounds(visibleBounds);
      });
    }
  }
}
bendingLight.register('IntroScreenView', IntroScreenView);
export default IntroScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiUHJvcGVydHkiLCJCb3VuZHMyIiwiUmVjdGFuZ2xlIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJSZXNldEFsbEJ1dHRvbiIsIlByb3RyYWN0b3JOb2RlIiwiVGltZUNvbnRyb2xOb2RlIiwiRHJhZ0xpc3RlbmVyIiwiSEJveCIsIlBhdGgiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiUGFuZWwiLCJiZW5kaW5nTGlnaHQiLCJCZW5kaW5nTGlnaHRTdHJpbmdzIiwiQmVuZGluZ0xpZ2h0Q29uc3RhbnRzIiwiQmVuZGluZ0xpZ2h0U2NyZWVuVmlldyIsIkZsb2F0aW5nTGF5b3V0IiwiSW50ZW5zaXR5TWV0ZXJOb2RlIiwiTWVkaXVtQ29udHJvbFBhbmVsIiwiTWVkaXVtTm9kZSIsIkFuZ2xlSWNvbiIsIkFuZ2xlTm9kZSIsIk5vcm1hbExpbmUiLCJXYXZlQ2FudmFzTm9kZSIsIldhdmVXZWJHTE5vZGUiLCJUaW1lU3BlZWQiLCJMYXNlclZpZXdFbnVtIiwiTXVsdGlsaW5rIiwib3B0aW9uaXplIiwiRGVyaXZlZFByb3BlcnR5IiwiYW5nbGVzU3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbFN0cmluZ1Byb3BlcnR5Iiwibm9ybWFsTGluZVN0cmluZ1Byb3BlcnR5IiwiSU5TRVQiLCJJbnRyb1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsImludHJvTW9kZWwiLCJoYXNNb3JlVG9vbHMiLCJpbmRleE9mUmVmcmFjdGlvbkRlY2ltYWxzIiwiY3JlYXRlTGFzZXJDb250cm9sUGFuZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaG9yaXpvbnRhbFBsYXlBcmVhT2Zmc2V0IiwiY2xhbXBEcmFnQW5nbGUiLCJhbmdsZSIsIk1hdGgiLCJQSSIsImNsYW1wIiwiY2xvY2t3aXNlQXJyb3dOb3RBdE1heCIsImxhc2VyQW5nbGUiLCJsYXNlclZpZXdQcm9wZXJ0eSIsInZhbHVlIiwiUkFZIiwiTUFYX0FOR0xFX0lOX1dBVkVfTU9ERSIsImNjd0Fycm93Tm90QXRNYXgiLCJzdGFnZVdpZHRoIiwibGF5b3V0Qm91bmRzIiwid2lkdGgiLCJzdGFnZUhlaWdodCIsImhlaWdodCIsIm1lZGl1bU5vZGUiLCJhZGRDaGlsZCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInRvcE1lZGl1bVByb3BlcnR5IiwiYm90dG9tTWVkaXVtUHJvcGVydHkiLCJzdGVwRW1pdHRlciIsInRvcE1lZGl1bUNvbnRyb2xQYW5lbCIsIm1lZGl1bUNvbG9yRmFjdG9yeSIsIndhdmVsZW5ndGhQcm9wZXJ0eSIsInlNYXJnaW4iLCJ0b3BNZWRpdW1Db250cm9sUGFuZWxYT2Zmc2V0Iiwic2V0VHJhbnNsYXRpb24iLCJnZXRXaWR0aCIsIm1vZGVsVG9WaWV3WSIsImdldEhlaWdodCIsImFmdGVyTGlnaHRMYXllcjMiLCJib3R0b21NZWRpdW1Db250cm9sUGFuZWxYT2Zmc2V0IiwiYm90dG9tTWVkaXVtQ29udHJvbFBhbmVsIiwiYmVmb3JlTGlnaHRMYXllciIsIm1vZGVsVG9WaWV3U2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJzdHJva2UiLCJwaWNrYWJsZSIsIm5vcm1hbExpbmVIZWlnaHQiLCJub3JtYWxMaW5lIiwieCIsIm1vZGVsVG9WaWV3WCIsInkiLCJhZnRlckxpZ2h0TGF5ZXIyIiwic2hvd0FuZ2xlc1Byb3BlcnR5IiwibGFzZXIiLCJvblByb3BlcnR5Iiwic2hvd05vcm1hbFByb3BlcnR5IiwicmF5cyIsInN0ZXBDYWxsYmFjayIsImFkZExpc3RlbmVyIiwibGlua0F0dHJpYnV0ZSIsIm11bHRpbGluayIsImludGVuc2l0eU1ldGVyIiwic2Vuc29yUG9zaXRpb25Qcm9wZXJ0eSIsImVtaXNzaW9uUG9pbnRQcm9wZXJ0eSIsImNvbG9yUHJvcGVydHkiLCJrIiwiaW5jaWRlbnRXYXZlTGF5ZXIiLCJnZXRDaGlsZHJlbkNvdW50IiwiY2hpbGRyZW4iLCJzdGVwIiwic2V0VmlzaWJsZSIsIldBVkUiLCJsYXNlclZpZXdYT2Zmc2V0IiwibGFzZXJWaWV3WU9mZnNldCIsImxhc2VyQ29udHJvbFBhbmVsIiwiY29ybmVyUmFkaXVzIiwieE1hcmdpbiIsImZpbGwiLCJsaW5lV2lkdGgiLCJsZWZ0IiwibWluWCIsInRvcCIsImxhc2VyVmlld0xheWVyIiwibm9ybWFsVGV4dCIsImZvbnRTaXplIiwiYW5nbGVUZXh0Iiwibm9ybWFsSWNvbiIsIm5vcm1hbENoZWNrYm94Iiwic3BhY2luZyIsImJveFdpZHRoIiwiYW5nbGVJY29uIiwiYW5nbGVDaGVja2JveCIsImNoZWNrYm94UGFuZWxDaGlsZHJlbiIsImNoZWNrYm94UGFuZWwiLCJhbGlnbiIsImJvdHRvbSIsIm1heFkiLCJiZWZvcmVMaWdodExheWVyMiIsInByb3RyYWN0b3JOb2RlSWNvbiIsImNyZWF0ZUljb24iLCJzY2FsZSIsImN1cnNvciIsIm1vdXNlQXJlYSIsImJvdW5kcyIsImxvY2FsQm91bmRzIiwidG91Y2hBcmVhIiwic2hvd1Byb3RyYWN0b3JQcm9wZXJ0eSIsImxpbmsiLCJzaG93UHJvdHJhY3RvciIsInZpc2libGUiLCJwcm90cmFjdG9yTm9kZSIsInZpc2libGVQcm9wZXJ0eSIsInByb3RyYWN0b3JQb3NpdGlvbiIsImNlbnRlclgiLCJjZW50ZXJZIiwicHJvdHJhY3RvclBvc2l0aW9uUHJvcGVydHkiLCJkcm9wSW5Ub29sYm94Iiwibm9kZSIsImVuYWJsZWRQcm9wZXJ0eSIsImdldEdsb2JhbEJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJ0b29sYm94IiwicHJvdHJhY3Rvck5vZGVMaXN0ZW5lciIsInVzZVBhcmVudE9mZnNldCIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJlbmQiLCJhZGRJbnB1dExpc3RlbmVyIiwiY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyIiwiZXZlbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwicHJlc3MiLCJidW1wTGVmdCIsInBsdXNYWSIsInZpZXdUb01vZGVsRGVsdGFYIiwiY2VudGVyIiwiaW50ZW5zaXR5TWV0ZXJOb2RlSWNvbiIsImNvcHkiLCJpbnRlbnNpdHlNZXRlck5vZGUiLCJlbmFibGVkIiwicHJvYmVMaXN0ZW5lciIsInRyYW5zZm9ybSIsInZpc2libGVCb3VuZHMiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsInByb2JlTm9kZSIsImRyYWdnaW5nVG9nZXRoZXIiLCJib2R5TGlzdGVuZXIiLCJib2R5UG9zaXRpb25Qcm9wZXJ0eSIsImJvZHlOb2RlIiwiZHJhZyIsInJlc2V0UmVsYXRpdmVQb3NpdGlvbnMiLCJib2R5Vmlld1Bvc2l0aW9uIiwidmlld1RvTW9kZWxQb3NpdGlvbiIsInN5bmNNb2RlbEZyb21WaWV3IiwidG9vbGJveE5vZGVzIiwiY29uY2F0IiwiZ2V0QWRkaXRpb25hbFRvb2xJY29ucyIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwicmVzZXQiLCJyaWdodCIsInJhZGl1cyIsInRpbWVDb250cm9sTm9kZSIsImlzUGxheWluZ1Byb3BlcnR5IiwicGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnMiLCJzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnMiLCJ1cGRhdGVTaW11bGF0aW9uVGltZUFuZFdhdmVTaGFwZSIsIk5PUk1BTCIsInVwZGF0ZVdhdmVTaGFwZSIsInNwZWVkUmFkaW9CdXR0b25Hcm91cE9uTGVmdCIsInRpbWVTcGVlZFByb3BlcnR5Iiwic3BlZWRQcm9wZXJ0eSIsImxhc2VyVHlwZSIsImZsb2F0UmlnaHQiLCJmbG9hdExlZnQiLCJmbG9hdFRvcCIsImZsb2F0Qm90dG9tIiwiZW1pdCIsImFkZExpZ2h0Tm9kZXMiLCJiZW5kaW5nTGlnaHRNb2RlbCIsImFsbG93V2ViR0wiLCJ3YXZlV2ViR0xOb2RlIiwid2F2ZUNhbnZhc05vZGUiLCJjYW52YXNCb3VuZHMiLCJzZXRDYW52YXNCb3VuZHMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkludHJvU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBpbnRybyBzY3JlZW5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTaWRkaGFydGhhIENoaW50aGFwYWxseSAoQWN0dWFsIENvbmNlcHRzKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQcm90cmFjdG9yTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUHJvdHJhY3Rvck5vZGUuanMnO1xyXG5pbXBvcnQgVGltZUNvbnRyb2xOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lQ29udHJvbE5vZGUuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIEhCb3gsIE5vZGUsIFBhdGgsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodFN0cmluZ3MgZnJvbSAnLi4vLi4vQmVuZGluZ0xpZ2h0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCZW5kaW5nTGlnaHRDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0JlbmRpbmdMaWdodENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCZW5kaW5nTGlnaHRTY3JlZW5WaWV3LCB7IEJlbmRpbmdMaWdodFNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQmVuZGluZ0xpZ2h0U2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBGbG9hdGluZ0xheW91dCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9GbG9hdGluZ0xheW91dC5qcyc7XHJcbmltcG9ydCBJbnRlbnNpdHlNZXRlck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvSW50ZW5zaXR5TWV0ZXJOb2RlLmpzJztcclxuaW1wb3J0IE1lZGl1bUNvbnRyb2xQYW5lbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9NZWRpdW1Db250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgTWVkaXVtTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9NZWRpdW1Ob2RlLmpzJztcclxuaW1wb3J0IEludHJvTW9kZWwgZnJvbSAnLi4vbW9kZWwvSW50cm9Nb2RlbC5qcyc7XHJcbmltcG9ydCBBbmdsZUljb24gZnJvbSAnLi9BbmdsZUljb24uanMnO1xyXG5pbXBvcnQgQW5nbGVOb2RlIGZyb20gJy4vQW5nbGVOb2RlLmpzJztcclxuaW1wb3J0IE5vcm1hbExpbmUgZnJvbSAnLi9Ob3JtYWxMaW5lLmpzJztcclxuaW1wb3J0IFdhdmVDYW52YXNOb2RlIGZyb20gJy4vV2F2ZUNhbnZhc05vZGUuanMnO1xyXG5pbXBvcnQgV2F2ZVdlYkdMTm9kZSBmcm9tICcuL1dhdmVXZWJHTE5vZGUuanMnO1xyXG5pbXBvcnQgQmVuZGluZ0xpZ2h0TW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0JlbmRpbmdMaWdodE1vZGVsLmpzJztcclxuaW1wb3J0IFRpbWVTcGVlZCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZVNwZWVkLmpzJztcclxuaW1wb3J0IExhc2VyVmlld0VudW0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0xhc2VyVmlld0VudW0uanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCBhbmdsZXNTdHJpbmdQcm9wZXJ0eSA9IEJlbmRpbmdMaWdodFN0cmluZ3MuYW5nbGVzU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG1hdGVyaWFsU3RyaW5nUHJvcGVydHkgPSBCZW5kaW5nTGlnaHRTdHJpbmdzLm1hdGVyaWFsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG5vcm1hbExpbmVTdHJpbmdQcm9wZXJ0eSA9IEJlbmRpbmdMaWdodFN0cmluZ3Mubm9ybWFsTGluZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IElOU0VUID0gMTA7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxudHlwZSBQYXJlbnRPcHRpb25zID0gQmVuZGluZ0xpZ2h0U2NyZWVuVmlld09wdGlvbnM7XHJcbnR5cGUgSW50cm9TY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcclxuXHJcbmNsYXNzIEludHJvU2NyZWVuVmlldyBleHRlbmRzIEJlbmRpbmdMaWdodFNjcmVlblZpZXcge1xyXG4gIHByaXZhdGUgaW50cm9Nb2RlbDogSW50cm9Nb2RlbDtcclxuICBwcml2YXRlIHN0ZXBFbWl0dGVyOiBURW1pdHRlcjtcclxuICBwcm90ZWN0ZWQgdG9wTWVkaXVtQ29udHJvbFBhbmVsOiBNZWRpdW1Db250cm9sUGFuZWw7XHJcbiAgcHJvdGVjdGVkIGJvdHRvbU1lZGl1bUNvbnRyb2xQYW5lbDogTWVkaXVtQ29udHJvbFBhbmVsO1xyXG4gIHByb3RlY3RlZCBkcm9wSW5Ub29sYm94OiAoIG5vZGU6IE5vZGUsIGVuYWJsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4gKSA9PiB2b2lkO1xyXG4gIHByb3RlY3RlZCBidW1wTGVmdDogKCBub2RlOiBOb2RlLCBwb3NpdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IyPiApID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSB0b29sYm94OiBQYW5lbDtcclxuICBwcm90ZWN0ZWQgdGltZUNvbnRyb2xOb2RlOiBUaW1lQ29udHJvbE5vZGU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBpbnRyb01vZGVsIC0gbW9kZWwgb2YgaW50cm8gc2NyZWVuXHJcbiAgICogQHBhcmFtIGhhc01vcmVUb29scyAtIHdoZXRoZXIgY29udGFpbiBtb3JlIHRvb2xzXHJcbiAgICogQHBhcmFtIGluZGV4T2ZSZWZyYWN0aW9uRGVjaW1hbHMgLSBkZWNpbWFsUGxhY2VzIHRvIHNob3cgZm9yIGluZGV4IG9mIHJlZnJhY3Rpb25cclxuICAgKiBAcGFyYW0gY3JlYXRlTGFzZXJDb250cm9sUGFuZWxcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGludHJvTW9kZWw6IEludHJvTW9kZWwsIGhhc01vcmVUb29sczogYm9vbGVhbiwgaW5kZXhPZlJlZnJhY3Rpb25EZWNpbWFsczogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY3JlYXRlTGFzZXJDb250cm9sUGFuZWw6ICggbW9kZWw6IEJlbmRpbmdMaWdodE1vZGVsICkgPT4gTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogSW50cm9TY3JlZW5WaWV3T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEludHJvU2NyZWVuVmlld09wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBpbiB0aGUgSW50cm8gc2NyZWVuLCBpdCBpcyBzaGlmdGVkIDEwMiB0byB0aGUgbGVmdCBzaW5jZSB0aGVyZSBpcyBleHRyYSByb29tIGFib3ZlIHRoZSBwcm90cmFjdG9yIHRvb2xib3hcclxuICAgICAgLy8gZm9yIHRoZSBsYXNlciB0byB0cmF2ZXJzZSB0by5cclxuICAgICAgaG9yaXpvbnRhbFBsYXlBcmVhT2Zmc2V0OiAxMDIsXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU3BlY2lmeSBob3cgdGhlIGRyYWcgYW5nbGUgc2hvdWxkIGJlIGNsYW1wZWQsIGluIHRoaXMgY2FzZSB0aGUgbGFzZXIgbXVzdCByZW1haW4gaW4gdGhlIHRvcCBsZWZ0IHF1YWRyYW50XHJcbiAgICAgICAqL1xyXG4gICAgICBjbGFtcERyYWdBbmdsZTogKCBhbmdsZTogbnVtYmVyICkgPT4ge1xyXG4gICAgICAgIHdoaWxlICggYW5nbGUgPCAwICkgeyBhbmdsZSArPSBNYXRoLlBJICogMjsgfVxyXG4gICAgICAgIHJldHVybiBVdGlscy5jbGFtcCggYW5nbGUsIE1hdGguUEkgLyAyLCBNYXRoLlBJICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBJbmRpY2F0ZSBpZiB0aGUgbGFzZXIgaXMgbm90IGF0IGl0cyBtYXggYW5nbGUsIGFuZCB0aGVyZWZvcmUgY2FuIGJlIGRyYWdnZWQgdG8gbGFyZ2VyIGFuZ2xlc1xyXG4gICAgICAgKi9cclxuICAgICAgY2xvY2t3aXNlQXJyb3dOb3RBdE1heDogKCBsYXNlckFuZ2xlOiBudW1iZXIgKSA9PiB7XHJcbiAgICAgICAgaWYgKCBpbnRyb01vZGVsLmxhc2VyVmlld1Byb3BlcnR5LnZhbHVlID09PSBMYXNlclZpZXdFbnVtLlJBWSApIHtcclxuICAgICAgICAgIHJldHVybiBsYXNlckFuZ2xlIDwgTWF0aC5QSTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gbGFzZXJBbmdsZSA8IEJlbmRpbmdMaWdodENvbnN0YW50cy5NQVhfQU5HTEVfSU5fV0FWRV9NT0RFO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgLyoqXHJcbiAgICAgICAqIGluZGljYXRlIGlmIHRoZSBsYXNlciBpcyBub3QgYXQgaXRzIG1pbiBhbmdsZSwgYW5kIGNhbiB0aGVyZWZvcmUgYmUgZHJhZ2dlZCB0byBzbWFsbGVyIGFuZ2xlcy5cclxuICAgICAgICovXHJcbiAgICAgIGNjd0Fycm93Tm90QXRNYXg6ICggbGFzZXJBbmdsZTogbnVtYmVyICkgPT4gbGFzZXJBbmdsZSA+IE1hdGguUEkgLyAyXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgaW50cm9Nb2RlbCxcclxuXHJcbiAgICAgIC8vIGxhc2VySGFzS25vYlxyXG4gICAgICBmYWxzZSxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmludHJvTW9kZWwgPSBpbnRyb01vZGVsOyAvLyAocmVhZC1vbmx5KVxyXG5cclxuICAgIGNvbnN0IHN0YWdlV2lkdGggPSB0aGlzLmxheW91dEJvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IHN0YWdlSGVpZ2h0ID0gdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0O1xyXG5cclxuICAgIC8vIGFkZCBNZWRpdW1Ob2RlcyBmb3IgdG9wIGFuZCBib3R0b21cclxuICAgIHRoaXMubWVkaXVtTm9kZS5hZGRDaGlsZCggbmV3IE1lZGl1bU5vZGUoIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLCBpbnRyb01vZGVsLnRvcE1lZGl1bVByb3BlcnR5ICkgKTtcclxuICAgIHRoaXMubWVkaXVtTm9kZS5hZGRDaGlsZCggbmV3IE1lZGl1bU5vZGUoIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLCBpbnRyb01vZGVsLmJvdHRvbU1lZGl1bVByb3BlcnR5ICkgKTtcclxuXHJcbiAgICB0aGlzLnN0ZXBFbWl0dGVyID0gbmV3IEVtaXR0ZXI8W10+KCk7XHJcblxyXG4gICAgLy8gYWRkIGNvbnRyb2wgcGFuZWxzIGZvciBzZXR0aW5nIHRoZSBpbmRleCBvZiByZWZyYWN0aW9uIGZvciBlYWNoIG1lZGl1bVxyXG4gICAgY29uc3QgdG9wTWVkaXVtQ29udHJvbFBhbmVsID0gbmV3IE1lZGl1bUNvbnRyb2xQYW5lbCggdGhpcywgaW50cm9Nb2RlbC5tZWRpdW1Db2xvckZhY3RvcnksXHJcbiAgICAgIGludHJvTW9kZWwudG9wTWVkaXVtUHJvcGVydHksIG1hdGVyaWFsU3RyaW5nUHJvcGVydHksIHRydWUsIGludHJvTW9kZWwud2F2ZWxlbmd0aFByb3BlcnR5LCBpbmRleE9mUmVmcmFjdGlvbkRlY2ltYWxzLCB7XHJcbiAgICAgICAgeU1hcmdpbjogN1xyXG4gICAgICB9ICk7XHJcbiAgICBjb25zdCB0b3BNZWRpdW1Db250cm9sUGFuZWxYT2Zmc2V0ID0gaGFzTW9yZVRvb2xzID8gNCA6IDA7XHJcbiAgICB0b3BNZWRpdW1Db250cm9sUGFuZWwuc2V0VHJhbnNsYXRpb24oXHJcbiAgICAgIHN0YWdlV2lkdGggLSB0b3BNZWRpdW1Db250cm9sUGFuZWwuZ2V0V2lkdGgoKSAtIDIgKiBJTlNFVCAtIHRvcE1lZGl1bUNvbnRyb2xQYW5lbFhPZmZzZXQsXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggMCApIC0gMiAqIElOU0VUIC0gdG9wTWVkaXVtQ29udHJvbFBhbmVsLmdldEhlaWdodCgpICsgNCApO1xyXG5cclxuICAgIHRoaXMudG9wTWVkaXVtQ29udHJvbFBhbmVsID0gdG9wTWVkaXVtQ29udHJvbFBhbmVsO1xyXG5cclxuICAgIHRoaXMuYWZ0ZXJMaWdodExheWVyMy5hZGRDaGlsZCggdG9wTWVkaXVtQ29udHJvbFBhbmVsICk7XHJcblxyXG4gICAgLy8gYWRkIGNvbnRyb2wgcGFuZWxzIGZvciBzZXR0aW5nIHRoZSBpbmRleCBvZiByZWZyYWN0aW9uIGZvciBlYWNoIG1lZGl1bVxyXG4gICAgY29uc3QgYm90dG9tTWVkaXVtQ29udHJvbFBhbmVsWE9mZnNldCA9IGhhc01vcmVUb29scyA/IDQgOiAwO1xyXG4gICAgY29uc3QgYm90dG9tTWVkaXVtQ29udHJvbFBhbmVsID0gbmV3IE1lZGl1bUNvbnRyb2xQYW5lbCggdGhpcywgaW50cm9Nb2RlbC5tZWRpdW1Db2xvckZhY3RvcnksXHJcbiAgICAgIGludHJvTW9kZWwuYm90dG9tTWVkaXVtUHJvcGVydHksIG1hdGVyaWFsU3RyaW5nUHJvcGVydHksIHRydWUsIGludHJvTW9kZWwud2F2ZWxlbmd0aFByb3BlcnR5LCBpbmRleE9mUmVmcmFjdGlvbkRlY2ltYWxzLCB7XHJcbiAgICAgICAgeU1hcmdpbjogN1xyXG4gICAgICB9ICk7XHJcbiAgICBib3R0b21NZWRpdW1Db250cm9sUGFuZWwuc2V0VHJhbnNsYXRpb24oXHJcbiAgICAgIHN0YWdlV2lkdGggLSB0b3BNZWRpdW1Db250cm9sUGFuZWwuZ2V0V2lkdGgoKSAtIDIgKiBJTlNFVCAtIGJvdHRvbU1lZGl1bUNvbnRyb2xQYW5lbFhPZmZzZXQsXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggMCApICsgMiAqIElOU0VUICsgMSApO1xyXG5cclxuICAgIHRoaXMuYm90dG9tTWVkaXVtQ29udHJvbFBhbmVsID0gYm90dG9tTWVkaXVtQ29udHJvbFBhbmVsO1xyXG4gICAgdGhpcy5hZnRlckxpZ2h0TGF5ZXIzLmFkZENoaWxkKCBib3R0b21NZWRpdW1Db250cm9sUGFuZWwgKTtcclxuXHJcbiAgICAvLyBhZGQgYSBsaW5lIHRoYXQgd2lsbCBzaG93IHRoZSBib3JkZXIgYmV0d2VlbiB0aGUgbWVkaXVtcyBldmVuIHdoZW4gYm90aCBuJ3MgYXJlIHRoZSBzYW1lLi4uIEp1c3QgYSB0aGluIGxpbmUgd2lsbFxyXG4gICAgLy8gYmUgZmluZS5cclxuICAgIHRoaXMuYmVmb3JlTGlnaHRMYXllci5hZGRDaGlsZCggbmV3IFBhdGgoIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIC0xLCAwIClcclxuICAgICAgLmxpbmVUbyggMSwgMCApICksIHtcclxuICAgICAgc3Ryb2tlOiAnZ3JheScsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gc2hvdyB0aGUgbm9ybWFsIGxpbmUgd2hlcmUgdGhlIGxhc2VyIHN0cmlrZXMgdGhlIGludGVyZmFjZSBiZXR3ZWVuIG1lZGl1bXNcclxuICAgIGNvbnN0IG5vcm1hbExpbmVIZWlnaHQgPSBzdGFnZUhlaWdodCAvIDI7XHJcbiAgICBjb25zdCBub3JtYWxMaW5lID0gbmV3IE5vcm1hbExpbmUoIG5vcm1hbExpbmVIZWlnaHQsIFsgNywgNiBdLCB7XHJcbiAgICAgIHg6IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggMCApLFxyXG4gICAgICB5OiB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIDAgKSAtIG5vcm1hbExpbmVIZWlnaHQgLyAyXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFmdGVyTGlnaHRMYXllcjIuYWRkQ2hpbGQoIG5vcm1hbExpbmUgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGFuZ2xlIG5vZGVcclxuICAgIHRoaXMuYWZ0ZXJMaWdodExheWVyMi5hZGRDaGlsZCggbmV3IEFuZ2xlTm9kZShcclxuICAgICAgdGhpcy5pbnRyb01vZGVsLnNob3dBbmdsZXNQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5pbnRyb01vZGVsLmxhc2VyLm9uUHJvcGVydHksXHJcbiAgICAgIHRoaXMuaW50cm9Nb2RlbC5zaG93Tm9ybWFsUHJvcGVydHksXHJcbiAgICAgIHRoaXMuaW50cm9Nb2RlbC5yYXlzLFxyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSxcclxuXHJcbiAgICAgIC8vIE1ldGhvZCB0byBhZGQgYSBzdGVwIGxpc3RlbmVyXHJcbiAgICAgICggc3RlcENhbGxiYWNrOiAoKSA9PiB2b2lkICkgPT4gdGhpcy5zdGVwRW1pdHRlci5hZGRMaXN0ZW5lciggc3RlcENhbGxiYWNrIClcclxuICAgICkgKTtcclxuXHJcbiAgICBpbnRyb01vZGVsLnNob3dOb3JtYWxQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBub3JtYWxMaW5lLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXHJcbiAgICAgIGludHJvTW9kZWwubGFzZXJWaWV3UHJvcGVydHksXHJcbiAgICAgIGludHJvTW9kZWwubGFzZXIub25Qcm9wZXJ0eSxcclxuICAgICAgaW50cm9Nb2RlbC5pbnRlbnNpdHlNZXRlci5zZW5zb3JQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBpbnRyb01vZGVsLnRvcE1lZGl1bVByb3BlcnR5LFxyXG4gICAgICBpbnRyb01vZGVsLmJvdHRvbU1lZGl1bVByb3BlcnR5LFxyXG4gICAgICBpbnRyb01vZGVsLmxhc2VyLmVtaXNzaW9uUG9pbnRQcm9wZXJ0eSxcclxuICAgICAgaW50cm9Nb2RlbC5sYXNlci5jb2xvclByb3BlcnR5XHJcbiAgICBdLCAoKSA9PiB7XHJcbiAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IHRoaXMuaW5jaWRlbnRXYXZlTGF5ZXIuZ2V0Q2hpbGRyZW5Db3VudCgpOyBrKysgKSB7XHJcblxyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICB0aGlzLmluY2lkZW50V2F2ZUxheWVyLmNoaWxkcmVuWyBrIF0uc3RlcCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuaW5jaWRlbnRXYXZlTGF5ZXIuc2V0VmlzaWJsZSggaW50cm9Nb2RlbC5sYXNlci5vblByb3BlcnR5LnZhbHVlICYmIGludHJvTW9kZWwubGFzZXJWaWV3UHJvcGVydHkudmFsdWUgPT09IExhc2VyVmlld0VudW0uV0FWRSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCBsYXNlciB2aWV3IHBhbmVsXHJcbiAgICBjb25zdCBsYXNlclZpZXdYT2Zmc2V0ID0gaGFzTW9yZVRvb2xzID8gMTMgOiAxMjtcclxuICAgIGNvbnN0IGxhc2VyVmlld1lPZmZzZXQgPSBoYXNNb3JlVG9vbHMgPyAyICogSU5TRVQgLSA0IDogMiAqIElOU0VUO1xyXG5cclxuICAgIGNvbnN0IGxhc2VyQ29udHJvbFBhbmVsID0gbmV3IFBhbmVsKCBjcmVhdGVMYXNlckNvbnRyb2xQYW5lbCggaW50cm9Nb2RlbCApLCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogNSxcclxuICAgICAgeE1hcmdpbjogOSxcclxuICAgICAgeU1hcmdpbjogNixcclxuICAgICAgZmlsbDogJyNFRUVFRUUnLFxyXG4gICAgICBzdHJva2U6ICcjNjk2OTY5JyxcclxuICAgICAgbGluZVdpZHRoOiAxLjUsXHJcbiAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLm1pblggKyBsYXNlclZpZXdYT2Zmc2V0LFxyXG4gICAgICB0b3A6IHRoaXMubGF5b3V0Qm91bmRzLnRvcCArIGxhc2VyVmlld1lPZmZzZXRcclxuICAgIH0gKTtcclxuICAgIHRoaXMubGFzZXJWaWV3TGF5ZXIuYWRkQ2hpbGQoIGxhc2VyQ29udHJvbFBhbmVsICk7XHJcblxyXG4gICAgLy8gdGV4dCBmb3IgY2hlY2tib3hlc1xyXG4gICAgY29uc3Qgbm9ybWFsVGV4dCA9IG5ldyBUZXh0KCBub3JtYWxMaW5lU3RyaW5nUHJvcGVydHksIHsgZm9udFNpemU6IDEyIH0gKTtcclxuICAgIGNvbnN0IGFuZ2xlVGV4dCA9IG5ldyBUZXh0KCBhbmdsZXNTdHJpbmdQcm9wZXJ0eSwgeyBmb250U2l6ZTogMTIgfSApO1xyXG5cclxuICAgIC8vIGFkZCBub3JtYWwgY2hlY2tib3hcclxuICAgIGNvbnN0IG5vcm1hbEljb24gPSBuZXcgTm9ybWFsTGluZSggMTcsIFsgNCwgMyBdICk7XHJcbiAgICBjb25zdCBub3JtYWxDaGVja2JveCA9IG5ldyBDaGVja2JveCggaW50cm9Nb2RlbC5zaG93Tm9ybWFsUHJvcGVydHksIG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbm9ybWFsVGV4dCwgbm9ybWFsSWNvblxyXG4gICAgICBdLCBzcGFjaW5nOiAxMlxyXG4gICAgfSApLCB7XHJcbiAgICAgIGJveFdpZHRoOiAxNSxcclxuICAgICAgc3BhY2luZzogNVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCBhbmdsZSBjaGVja2JveFxyXG4gICAgY29uc3QgYW5nbGVJY29uID0gbmV3IEFuZ2xlSWNvbigpO1xyXG4gICAgY29uc3QgYW5nbGVDaGVja2JveCA9IG5ldyBDaGVja2JveCggaW50cm9Nb2RlbC5zaG93QW5nbGVzUHJvcGVydHksIG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgYW5nbGVUZXh0LCBhbmdsZUljb25cclxuICAgICAgXSwgc3BhY2luZzogMTJcclxuICAgIH0gKSwge1xyXG4gICAgICBib3hXaWR0aDogMTUsXHJcbiAgICAgIHNwYWNpbmc6IDVcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjaGVja2JveFBhbmVsQ2hpbGRyZW4gPSBoYXNNb3JlVG9vbHMgPyBbIG5vcm1hbENoZWNrYm94LCBhbmdsZUNoZWNrYm94IF0gOiBbIG5vcm1hbENoZWNrYm94IF07XHJcbiAgICBjb25zdCBjaGVja2JveFBhbmVsID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IGNoZWNrYm94UGFuZWxDaGlsZHJlbixcclxuICAgICAgc3BhY2luZzogNixcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gMTBcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYmVmb3JlTGlnaHRMYXllcjIuYWRkQ2hpbGQoIGNoZWNrYm94UGFuZWwgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIHByb3RyYWN0b3Igbm9kZVxyXG4gICAgY29uc3QgcHJvdHJhY3Rvck5vZGVJY29uID0gUHJvdHJhY3Rvck5vZGUuY3JlYXRlSWNvbigge1xyXG4gICAgICBzY2FsZTogMC4yNCxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgIH0gKTtcclxuICAgIHByb3RyYWN0b3JOb2RlSWNvbi5tb3VzZUFyZWEgPSBTaGFwZS5ib3VuZHMoIHByb3RyYWN0b3JOb2RlSWNvbi5sb2NhbEJvdW5kcyApO1xyXG4gICAgcHJvdHJhY3Rvck5vZGVJY29uLnRvdWNoQXJlYSA9IFNoYXBlLmJvdW5kcyggcHJvdHJhY3Rvck5vZGVJY29uLmxvY2FsQm91bmRzICk7XHJcbiAgICB0aGlzLnNob3dQcm90cmFjdG9yUHJvcGVydHkubGluayggc2hvd1Byb3RyYWN0b3IgPT4ge1xyXG4gICAgICBwcm90cmFjdG9yTm9kZUljb24udmlzaWJsZSA9ICFzaG93UHJvdHJhY3RvcjtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwcm90cmFjdG9yTm9kZSA9IG5ldyBQcm90cmFjdG9yTm9kZSgge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuc2hvd1Byb3RyYWN0b3JQcm9wZXJ0eSxcclxuICAgICAgc2NhbGU6IDAuOFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcHJvdHJhY3RvclBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIHByb3RyYWN0b3JOb2RlLmNlbnRlclgsIHByb3RyYWN0b3JOb2RlLmNlbnRlclkgKTtcclxuICAgIGNvbnN0IHByb3RyYWN0b3JQb3NpdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBwcm90cmFjdG9yUG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyBXaGVuIGEgbm9kZSBpcyByZWxlYXNlZCwgY2hlY2sgaWYgaXQgaXMgb3ZlciB0aGUgdG9vbGJveC4gIElmIHNvLCBkcm9wIGl0IGluLlxyXG4gICAgY29uc3QgZHJvcEluVG9vbGJveCA9ICggbm9kZTogTm9kZSwgZW5hYmxlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiApID0+IHtcclxuICAgICAgaWYgKCBub2RlLmdldEdsb2JhbEJvdW5kcygpLmludGVyc2VjdHNCb3VuZHMoIHRoaXMudG9vbGJveC5nZXRHbG9iYWxCb3VuZHMoKSApICkge1xyXG4gICAgICAgIGVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5kcm9wSW5Ub29sYm94ID0gZHJvcEluVG9vbGJveDtcclxuICAgIGNvbnN0IHByb3RyYWN0b3JOb2RlTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHVzZVBhcmVudE9mZnNldDogdHJ1ZSxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogcHJvdHJhY3RvclBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIGVuZDogKCkgPT4gZHJvcEluVG9vbGJveCggcHJvdHJhY3Rvck5vZGUsIHRoaXMuc2hvd1Byb3RyYWN0b3JQcm9wZXJ0eSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIGFuIGlucHV0IGxpc3RlbmVyIHRvIHRoZSB0b29sYm94IGljb24gZm9yIHRoZSBwcm90cmFjdG9yLCB3aGljaCBmb3J3YXJkcyBldmVudHMgdG8gdGhlIERyYWdMaXN0ZW5lclxyXG4gICAgLy8gZm9yIHRoZSBub2RlIGluIHRoZSBwbGF5IGFyZWFcclxuICAgIHByb3RyYWN0b3JOb2RlSWNvbi5hZGRJbnB1dExpc3RlbmVyKCBEcmFnTGlzdGVuZXIuY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyKCBldmVudCA9PiB7XHJcbiAgICAgIC8vIFNob3cgdGhlIHByb3RyYWN0b3IgaW4gdGhlIHBsYXkgYXJlYSBhbmQgaGlkZSB0aGUgaWNvblxyXG4gICAgICB0aGlzLnNob3dQcm90cmFjdG9yUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gQ2VudGVyIHRoZSBwcm90cmFjdG9yIG9uIHRoZSBwb2ludGVyXHJcbiAgICAgIHByb3RyYWN0b3JQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcHJvdHJhY3Rvck5vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG5cclxuICAgICAgcHJvdHJhY3Rvck5vZGVMaXN0ZW5lci5wcmVzcyggZXZlbnQgKTtcclxuICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMuc2hvd1Byb3RyYWN0b3JQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBwcm90cmFjdG9yTm9kZSwgJ3Zpc2libGUnICk7XHJcblxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm07XHJcblxyXG4gICAgLy8gV2hlbiBhIG5vZGUgaXMgZHJvcHBlZCBiZWhpbmQgYSBjb250cm9sIHBhbmVsLCBtb3ZlIGl0IHRvIHRoZSBzaWRlIHNvIGl0IHdvbid0IGJlIGxvc3QuXHJcbiAgICBjb25zdCBidW1wTGVmdCA9ICggbm9kZTogTm9kZSwgcG9zaXRpb25Qcm9wZXJ0eTogUHJvcGVydHk8VmVjdG9yMj4gKSA9PiB7XHJcbiAgICAgIHdoaWxlICggbm9kZS5nZXRHbG9iYWxCb3VuZHMoKS5pbnRlcnNlY3RzQm91bmRzKCB0b3BNZWRpdW1Db250cm9sUGFuZWwuZ2V0R2xvYmFsQm91bmRzKCkgKSB8fFxyXG4gICAgICAgICAgICAgIG5vZGUuZ2V0R2xvYmFsQm91bmRzKCkuaW50ZXJzZWN0c0JvdW5kcyggYm90dG9tTWVkaXVtQ29udHJvbFBhbmVsLmdldEdsb2JhbEJvdW5kcygpICkgKSB7XHJcbiAgICAgICAgcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHBvc2l0aW9uUHJvcGVydHkudmFsdWUucGx1c1hZKCBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YVgoIC0yMCApLCAwICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHJvdHJhY3RvclBvc2l0aW9uUHJvcGVydHkubGluayggcHJvdHJhY3RvclBvc2l0aW9uID0+IHtcclxuICAgICAgcHJvdHJhY3Rvck5vZGUuY2VudGVyID0gcHJvdHJhY3RvclBvc2l0aW9uO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHByb3RyYWN0b3JOb2RlLmFkZElucHV0TGlzdGVuZXIoIHByb3RyYWN0b3JOb2RlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBhZGQgaW50ZW5zaXR5IG1ldGVyXHJcbiAgICBjb25zdCBpbnRlbnNpdHlNZXRlck5vZGVJY29uID0gbmV3IEludGVuc2l0eU1ldGVyTm9kZSggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sIGludHJvTW9kZWwuaW50ZW5zaXR5TWV0ZXIuY29weSgpLCB7XHJcbiAgICAgIHNjYWxlOiAwLjQ1LFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgfSApO1xyXG4gICAgaW50ZW5zaXR5TWV0ZXJOb2RlSWNvbi5tb3VzZUFyZWEgPSBTaGFwZS5ib3VuZHMoIGludGVuc2l0eU1ldGVyTm9kZUljb24ubG9jYWxCb3VuZHMgKTtcclxuICAgIGludGVuc2l0eU1ldGVyTm9kZUljb24udG91Y2hBcmVhID0gU2hhcGUuYm91bmRzKCBpbnRlbnNpdHlNZXRlck5vZGVJY29uLmxvY2FsQm91bmRzICk7XHJcblxyXG4gICAgY29uc3QgaW50ZW5zaXR5TWV0ZXJOb2RlID0gbmV3IEludGVuc2l0eU1ldGVyTm9kZSggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sIGludHJvTW9kZWwuaW50ZW5zaXR5TWV0ZXIgKTtcclxuICAgIGludHJvTW9kZWwuaW50ZW5zaXR5TWV0ZXIuZW5hYmxlZFByb3BlcnR5LmxpbmsoIGVuYWJsZWQgPT4ge1xyXG4gICAgICBpbnRlbnNpdHlNZXRlck5vZGUudmlzaWJsZSA9IGVuYWJsZWQ7XHJcbiAgICAgIGludGVuc2l0eU1ldGVyTm9kZUljb24udmlzaWJsZSA9ICFlbmFibGVkO1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcHJvYmVMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogaW50cm9Nb2RlbC5pbnRlbnNpdHlNZXRlci5zZW5zb3JQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB0cmFuc2Zvcm06IG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5IF0sIHZpc2libGVCb3VuZHMgPT4ge1xyXG4gICAgICAgIHJldHVybiBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxCb3VuZHMoIHZpc2libGVCb3VuZHMgKTtcclxuICAgICAgfSApLFxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBidW1wTGVmdCggaW50ZW5zaXR5TWV0ZXJOb2RlLnByb2JlTm9kZSwgaW50cm9Nb2RlbC5pbnRlbnNpdHlNZXRlci5zZW5zb3JQb3NpdGlvblByb3BlcnR5ICk7XHJcbiAgICAgICAgZHJvcEluVG9vbGJveCggaW50ZW5zaXR5TWV0ZXJOb2RlLnByb2JlTm9kZSwgaW50cm9Nb2RlbC5pbnRlbnNpdHlNZXRlci5lbmFibGVkUHJvcGVydHkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgaW50ZW5zaXR5TWV0ZXJOb2RlLnByb2JlTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBwcm9iZUxpc3RlbmVyICk7XHJcblxyXG4gICAgbGV0IGRyYWdnaW5nVG9nZXRoZXIgPSB0cnVlO1xyXG4gICAgY29uc3QgYm9keUxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB1c2VQYXJlbnRPZmZzZXQ6IHRydWUsXHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IGludHJvTW9kZWwuaW50ZW5zaXR5TWV0ZXIuYm9keVBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHRyYW5zZm9ybTogbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG5cclxuICAgICAgLy8gVGhlIGJvZHkgbm9kZSBvcmlnaW4gaXMgYXQgaXRzIHRvcCBsZWZ0LCBzbyB0cmFuc2xhdGUgdGhlIGFsbG93ZWQgZHJhZyBhcmVhIHNvIHRoYXQgdGhlIGNlbnRlciBvZiB0aGUgYm9keSBub2RlXHJcbiAgICAgIC8vIHdpbGwgcmVtYWluIGluIGJvdW5kc1xyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkgXSwgdmlzaWJsZUJvdW5kcyA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyggbmV3IFJlY3RhbmdsZShcclxuICAgICAgICAgIHZpc2libGVCb3VuZHMubGVmdCAtIGludGVuc2l0eU1ldGVyTm9kZS5ib2R5Tm9kZS5ib3VuZHMud2lkdGggLyAyLFxyXG4gICAgICAgICAgdmlzaWJsZUJvdW5kcy50b3AgLSBpbnRlbnNpdHlNZXRlck5vZGUuYm9keU5vZGUuYm91bmRzLmhlaWdodCAvIDIsXHJcbiAgICAgICAgICB2aXNpYmxlQm91bmRzLndpZHRoIC0gaW50ZW5zaXR5TWV0ZXJOb2RlLmJvZHlOb2RlLndpZHRoLFxyXG4gICAgICAgICAgdmlzaWJsZUJvdW5kcy5oZWlnaHRcclxuICAgICAgICApICk7XHJcbiAgICAgIH0gKSxcclxuICAgICAgZHJhZzogKCkgPT4ge1xyXG4gICAgICAgIGlmICggZHJhZ2dpbmdUb2dldGhlciApIHtcclxuICAgICAgICAgIGludGVuc2l0eU1ldGVyTm9kZS5yZXNldFJlbGF0aXZlUG9zaXRpb25zKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgZHJhZ2dpbmdUb2dldGhlciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBidW1wTGVmdCggaW50ZW5zaXR5TWV0ZXJOb2RlLmJvZHlOb2RlLCBpbnRyb01vZGVsLmludGVuc2l0eU1ldGVyLmJvZHlQb3NpdGlvblByb3BlcnR5ICk7XHJcbiAgICAgICAgZHJvcEluVG9vbGJveCggaW50ZW5zaXR5TWV0ZXJOb2RlLmJvZHlOb2RlLCBpbnRyb01vZGVsLmludGVuc2l0eU1ldGVyLmVuYWJsZWRQcm9wZXJ0eSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBpbnRlbnNpdHlNZXRlck5vZGUuYm9keU5vZGUuYWRkSW5wdXRMaXN0ZW5lciggYm9keUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQWRkIGFuIGlucHV0IGxpc3RlbmVyIHRvIHRoZSB0b29sYm94IGljb24gZm9yIHRoZSBwcm90cmFjdG9yLCB3aGljaCBmb3J3YXJkcyBldmVudHMgdG8gdGhlIERyYWdMaXN0ZW5lclxyXG4gICAgLy8gZm9yIHRoZSBub2RlIGluIHRoZSBwbGF5IGFyZWFcclxuICAgIGludGVuc2l0eU1ldGVyTm9kZUljb24uYWRkSW5wdXRMaXN0ZW5lciggRHJhZ0xpc3RlbmVyLmNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciggZXZlbnQgPT4ge1xyXG5cclxuICAgICAgLy8gU2hvdyB0aGUgcHJvYmUgaW4gdGhlIHBsYXkgYXJlYSBhbmQgaGlkZSB0aGUgaWNvblxyXG4gICAgICBpbnRyb01vZGVsLmludGVuc2l0eU1ldGVyLmVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgICAvLyBDZW50ZXIgdGhlIGNlbnRlci1ib3R0b20gb2YgdGhlIGJvZHkgb24gdGhlIHBvaW50ZXJcclxuICAgICAgY29uc3QgYm9keVZpZXdQb3NpdGlvbiA9IGludGVuc2l0eU1ldGVyTm9kZS5ib2R5Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50IClcclxuICAgICAgICAucGx1c1hZKCAtaW50ZW5zaXR5TWV0ZXJOb2RlLmJvZHlOb2RlLndpZHRoIC8gMiwgLWludGVuc2l0eU1ldGVyTm9kZS5ib2R5Tm9kZS5oZWlnaHQgKyA1ICk7XHJcbiAgICAgIGludHJvTW9kZWwuaW50ZW5zaXR5TWV0ZXIuYm9keVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggYm9keVZpZXdQb3NpdGlvbiApO1xyXG4gICAgICBpbnRlbnNpdHlNZXRlck5vZGUucmVzZXRSZWxhdGl2ZVBvc2l0aW9ucygpO1xyXG4gICAgICBpbnRlbnNpdHlNZXRlck5vZGUuc3luY01vZGVsRnJvbVZpZXcoKTtcclxuXHJcbiAgICAgIGRyYWdnaW5nVG9nZXRoZXIgPSB0cnVlO1xyXG5cclxuICAgICAgYm9keUxpc3RlbmVyLnByZXNzKCBldmVudCApO1xyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gZm9yIHN1YmNsYXNzIHVzYWdlIGluIE1vcmVUb29sc1NjcmVlblZpZXdcclxuICAgIHRoaXMuYnVtcExlZnQgPSBidW1wTGVmdDtcclxuXHJcbiAgICBsZXQgdG9vbGJveE5vZGVzID0gW1xyXG4gICAgICBwcm90cmFjdG9yTm9kZUljb24sXHJcbiAgICAgIGludGVuc2l0eU1ldGVyTm9kZUljb25cclxuICAgIF07XHJcblxyXG4gICAgdG9vbGJveE5vZGVzID0gdG9vbGJveE5vZGVzLmNvbmNhdCggdGhpcy5nZXRBZGRpdGlvbmFsVG9vbEljb25zKCkgKTtcclxuICAgIHRoaXMudG9vbGJveCA9IG5ldyBQYW5lbCggbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGNoaWxkcmVuOiB0b29sYm94Tm9kZXMsXHJcbiAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGZhbHNlXHJcbiAgICB9ICksIHtcclxuICAgICAgeE1hcmdpbjogMTAsXHJcbiAgICAgIHlNYXJnaW46IDEwLFxyXG4gICAgICBzdHJva2U6ICcjNjk2OTY5JyxcclxuICAgICAgbGluZVdpZHRoOiAxLjUsIGZpbGw6ICcjRUVFRUVFJyxcclxuICAgICAgYm90dG9tOiBjaGVja2JveFBhbmVsLnRvcCAtIDE1XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJlZm9yZUxpZ2h0TGF5ZXIyLmFkZENoaWxkKCB0aGlzLnRvb2xib3ggKTtcclxuICAgIHRoaXMuYmVmb3JlTGlnaHRMYXllcjIuYWRkQ2hpbGQoIHByb3RyYWN0b3JOb2RlICk7XHJcbiAgICB0aGlzLmJlZm9yZUxpZ2h0TGF5ZXIyLmFkZENoaWxkKCBpbnRlbnNpdHlNZXRlck5vZGUgKTtcclxuXHJcbiAgICAvLyBhZGQgcmVzZXQgYWxsIGJ1dHRvblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHRoaXMucmVzZXQoKSxcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSAxNCxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gMiAqIElOU0VULFxyXG4gICAgICByYWRpdXM6IDE5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZnRlckxpZ2h0TGF5ZXIyLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG5cclxuICAgIC8vIGFkZCBzaW0gc3BlZWQgY29udHJvbHNcclxuICAgIHRoaXMudGltZUNvbnRyb2xOb2RlID0gbmV3IFRpbWVDb250cm9sTm9kZSggaW50cm9Nb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICAgICAgaW50cm9Nb2RlbC51cGRhdGVTaW11bGF0aW9uVGltZUFuZFdhdmVTaGFwZSggVGltZVNwZWVkLk5PUk1BTCApO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVdhdmVTaGFwZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgc3BlZWRSYWRpb0J1dHRvbkdyb3VwT25MZWZ0OiB0cnVlLFxyXG4gICAgICB0aW1lU3BlZWRQcm9wZXJ0eTogaW50cm9Nb2RlbC5zcGVlZFByb3BlcnR5LFxyXG4gICAgICBsZWZ0OiBjaGVja2JveFBhbmVsLnJpZ2h0ICsgNzUsXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIDEwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJlZm9yZUxpZ2h0TGF5ZXIuYWRkQ2hpbGQoIHRoaXMudGltZUNvbnRyb2xOb2RlICk7XHJcblxyXG4gICAgaWYgKCAhaGFzTW9yZVRvb2xzICkge1xyXG5cclxuICAgICAgLy8gc2hvdyBwbGF5IHBhdXNlIGFuZCBzdGVwIGJ1dHRvbnMgb25seSBpbiB3YXZlIHZpZXdcclxuICAgICAgaW50cm9Nb2RlbC5sYXNlclZpZXdQcm9wZXJ0eS5saW5rKCBsYXNlclR5cGUgPT4gdGhpcy50aW1lQ29udHJvbE5vZGUuc2V0VmlzaWJsZSggbGFzZXJUeXBlID09PSBMYXNlclZpZXdFbnVtLldBVkUgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIEZsb2F0aW5nTGF5b3V0LmZsb2F0UmlnaHQoIHRoaXMsIFsgdG9wTWVkaXVtQ29udHJvbFBhbmVsLCBib3R0b21NZWRpdW1Db250cm9sUGFuZWwsIHJlc2V0QWxsQnV0dG9uIF0gKTtcclxuICAgIEZsb2F0aW5nTGF5b3V0LmZsb2F0TGVmdCggdGhpcywgWyBsYXNlckNvbnRyb2xQYW5lbCwgdGhpcy50b29sYm94IF0gKTtcclxuXHJcbiAgICAvLyBJbmRlbnQgdGhlIGNoZWNrYm94ZXMgYSBiaXQgc28gaXQgbG9va3MgbW9yZSBuYXR1cmFsXHJcbiAgICBGbG9hdGluZ0xheW91dC5mbG9hdExlZnQoIHRoaXMsIFsgY2hlY2tib3hQYW5lbCBdLCAxMCApO1xyXG5cclxuICAgIEZsb2F0aW5nTGF5b3V0LmZsb2F0VG9wKCB0aGlzLCBbIGxhc2VyQ29udHJvbFBhbmVsIF0gKTtcclxuICAgIEZsb2F0aW5nTGF5b3V0LmZsb2F0Qm90dG9tKCB0aGlzLCBbIGNoZWNrYm94UGFuZWwsIHJlc2V0QWxsQnV0dG9uLCB0aGlzLnRpbWVDb250cm9sTm9kZSBdICk7XHJcblxyXG4gICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLnRvb2xib3guYm90dG9tID0gY2hlY2tib3hQYW5lbC50b3AgLSAxMDtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlc3RvcmUgaW5pdGlhbCBjb25kaXRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMuaW50cm9Nb2RlbC5yZXNldCgpO1xyXG4gICAgdGhpcy50b3BNZWRpdW1Db250cm9sUGFuZWwucmVzZXQoKTtcclxuICAgIHRoaXMuYm90dG9tTWVkaXVtQ29udHJvbFBhbmVsLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGxvdyBzdWJjbGFzc2VzIHRvIHByb3ZpZGUgbW9yZSB0b29sc1xyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBnZXRBZGRpdGlvbmFsVG9vbEljb25zKCk6IE5vZGVbXSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgYnkgdGhlIGFuaW1hdGlvbiBsb29wLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdGVwRW1pdHRlci5lbWl0KCk7XHJcbiAgICBzdXBlci5zdGVwKCk7XHJcbiAgICBpZiAoIHRoaXMuaW50cm9Nb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy51cGRhdGVXYXZlU2hhcGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB3YXZlIHNoYXBlLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCB1cGRhdGVXYXZlU2hhcGUoKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMuaW50cm9Nb2RlbC5sYXNlclZpZXdQcm9wZXJ0eS52YWx1ZSA9PT0gTGFzZXJWaWV3RW51bS5XQVZFICkge1xyXG4gICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCB0aGlzLmluY2lkZW50V2F2ZUxheWVyLmdldENoaWxkcmVuQ291bnQoKTsgaysrICkge1xyXG5cclxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgICAgdGhpcy5pbmNpZGVudFdhdmVMYXllci5jaGlsZHJlblsgayBdLnN0ZXAoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGxpZ2h0IHJlcHJlc2VudGF0aW9ucyB3aGljaCBhcmUgc3BlY2lmaWMgdG8gdGhpcyB2aWV3LiAgSW4gdGhpcyBjYXNlIGl0IGlzIHRoZSB3YXZlIHJlcHJlc2VudGF0aW9uLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBhZGRMaWdodE5vZGVzKCBiZW5kaW5nTGlnaHRNb2RlbDogQmVuZGluZ0xpZ2h0TW9kZWwgKTogdm9pZCB7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5pbmNpZGVudFdhdmVMYXllciApO1xyXG5cclxuICAgIC8vIGlmIFdlYkdMIGlzIHN1cHBvcnRlZCBhZGQgV2F2ZVdlYkdMTm9kZSBvdGhlcndpc2Ugd2F2ZSBpcyByZW5kZXJlZCB3aXRoIHRoZSBjYW52YXMuXHJcbiAgICBpZiAoIGJlbmRpbmdMaWdodE1vZGVsLmFsbG93V2ViR0wgKSB7XHJcbiAgICAgIGNvbnN0IHdhdmVXZWJHTE5vZGUgPSBuZXcgV2F2ZVdlYkdMTm9kZSggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sIGJlbmRpbmdMaWdodE1vZGVsLnJheXMgKTtcclxuICAgICAgdGhpcy5pbmNpZGVudFdhdmVMYXllci5hZGRDaGlsZCggd2F2ZVdlYkdMTm9kZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IHdhdmVDYW52YXNOb2RlID0gbmV3IFdhdmVDYW52YXNOb2RlKCB0aGlzLmJlbmRpbmdMaWdodE1vZGVsLnJheXMsIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcblxyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICBjYW52YXNCb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAwLCAxMDAwIClcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmluY2lkZW50V2F2ZUxheWVyLmFkZENoaWxkKCB3YXZlQ2FudmFzTm9kZSApO1xyXG4gICAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS5saW5rKCAoIHZpc2libGVCb3VuZHM6IEJvdW5kczIgKSA9PiB7XHJcbiAgICAgICAgd2F2ZUNhbnZhc05vZGUuc2V0Q2FudmFzQm91bmRzKCB2aXNpYmxlQm91bmRzICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ0ludHJvU2NyZWVuVmlldycsIEludHJvU2NyZWVuVmlldyApO1xyXG5cclxuZXhwb3J0IHR5cGUgeyBJbnRyb1NjcmVlblZpZXdPcHRpb25zIH07XHJcbmV4cG9ydCBkZWZhdWx0IEludHJvU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0MsY0FBYyxNQUFNLCtDQUErQztBQUMxRSxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLFNBQVNDLFlBQVksRUFBRUMsSUFBSSxFQUFRQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RixPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxtQkFBbUIsTUFBTSw4QkFBOEI7QUFDOUQsT0FBT0MscUJBQXFCLE1BQU0sdUNBQXVDO0FBQ3pFLE9BQU9DLHNCQUFzQixNQUF5Qyw2Q0FBNkM7QUFDbkgsT0FBT0MsY0FBYyxNQUFNLHFDQUFxQztBQUNoRSxPQUFPQyxrQkFBa0IsTUFBTSx5Q0FBeUM7QUFDeEUsT0FBT0Msa0JBQWtCLE1BQU0seUNBQXlDO0FBQ3hFLE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFFeEQsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUN0QyxPQUFPQyxTQUFTLE1BQU0sZ0JB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