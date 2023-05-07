// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for the "more tools" screen, which adds more tools to the toolbox, and a few more controls for the laser.
 * This extends the IntroScreenView since it shares many of the same features.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import { DragListener, VBox } from '../../../../scenery/js/imports.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import bendingLight from '../../bendingLight.js';
import WavelengthControl from '../../common/view/WavelengthControl.js';
import IntroScreenView from '../../intro/view/IntroScreenView.js';
import LaserTypeAquaRadioButtonGroup from '../../intro/view/LaserTypeAquaRadioButtonGroup.js';
import VelocitySensorNode from './VelocitySensorNode.js';
import WaveSensorNode from './WaveSensorNode.js';
import LaserViewEnum from '../../common/model/LaserViewEnum.js';
import Multilink from '../../../../axon/js/Multilink.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

// constants
const arrowScale = 1.5E-14;
class MoreToolsScreenView extends IntroScreenView {
  /**
   * @param moreToolsModel - model of the more tools screen
   * @param [providedOptions]
   */
  constructor(moreToolsModel, providedOptions) {
    super(moreToolsModel, true,
    // hasMoreTools
    3,
    // indexOfRefractionDecimals

    // createLaserControlPanel
    model => new VBox({
      spacing: 10,
      align: 'left',
      children: [new LaserTypeAquaRadioButtonGroup(model.laserViewProperty), new WavelengthControl(model.wavelengthProperty, new Property(true), 120)]
    }), merge({
      verticalPlayAreaOffset: 0,
      horizontalPlayAreaOffset: 0
    }, providedOptions));
    this.waveSensorNode = null;
    this.moreToolsModel = moreToolsModel; // (read-only)

    // updates the visibility of speed controls
    Multilink.multilink([moreToolsModel.laserViewProperty, moreToolsModel.waveSensor.enabledProperty], (laserView, isWaveSensorEnabled) => {
      this.timeControlNode.visible = isWaveSensorEnabled || laserView === LaserViewEnum.WAVE;
    });
  }
  getWaveSensorIcon() {
    const modelViewTransform = this.modelViewTransform;
    const waveSensor = this.bendingLightModel.waveSensor;
    const waveSensorIcon = new WaveSensorNode(this.modelViewTransform, waveSensor.copy(), {
      scale: 0.4
    });
    waveSensorIcon.mouseArea = Shape.bounds(waveSensorIcon.localBounds);
    waveSensorIcon.touchArea = Shape.bounds(waveSensorIcon.localBounds);

    // (read-only)
    this.waveSensorNode = new WaveSensorNode(this.modelViewTransform, waveSensor);
    const waveSensorNode = this.waveSensorNode;
    waveSensor.enabledProperty.link(enabled => {
      waveSensorIcon.visible = !enabled;
      waveSensorNode.visible = enabled;
    });
    const dropInToolbox = this.dropInToolbox;
    const draggingTogetherProperty = new BooleanProperty(true);
    const createDragListener = (node, positionProperty, enabledProperty) => {
      return new DragListener({
        useParentOffset: true,
        positionProperty: positionProperty,
        transform: modelViewTransform,
        // The body node origin is at its top left, so translate the allowed drag area so that the center of the body node
        // will remain in bounds
        dragBoundsProperty: new DerivedProperty([this.visibleBoundsProperty, draggingTogetherProperty], visibleBounds => {
          return modelViewTransform.viewToModelBounds(visibleBounds.erodedX(draggingTogetherProperty.value ? 100 : 0));
        }),
        drag: () => {
          if (draggingTogetherProperty.value) {
            waveSensorNode.resetRelativePositions();
          }
        },
        end: () => {
          draggingTogetherProperty.value = false;
          this.bumpLeft(node, positionProperty);
          dropInToolbox(node, enabledProperty);
        }
      });
    };
    const probe1Listener = createDragListener(waveSensorNode.probe1Node, waveSensor.probe1.positionProperty, waveSensor.enabledProperty);
    waveSensorNode.probe1Node.addInputListener(probe1Listener);
    const probe2Listener = createDragListener(waveSensorNode.probe2Node, waveSensor.probe2.positionProperty, waveSensor.enabledProperty);
    waveSensorNode.probe2Node.addInputListener(probe2Listener);
    const bodyListener = createDragListener(waveSensorNode.bodyNode, waveSensor.bodyPositionProperty, waveSensor.enabledProperty);
    waveSensorNode.bodyNode.addInputListener(bodyListener);
    waveSensorIcon.addInputListener(DragListener.createForwardingListener(event => {
      // Show the probe in the play area and hide the icon
      waveSensor.enabledProperty.set(true);

      // Center the body label on the pointer
      const pt = waveSensorNode.bodyNode.globalToParentPoint(event.pointer.point).plusXY(0, -waveSensorNode.bodyNode.height / 2 + 5);
      waveSensor.bodyPositionProperty.value = modelViewTransform.viewToModelPosition(pt);
      waveSensorNode.resetRelativePositions();
      waveSensorNode.syncModelFromView();
      draggingTogetherProperty.value = true;
      waveSensorNode.resetRelativePositions();
      bodyListener.press(event);
      waveSensorNode.resetRelativePositions();
    }));
    this.afterLightLayer2.addChild(this.waveSensorNode);
    return waveSensorIcon;
  }
  getVelocitySensorIcon() {
    const moreToolsModel = this.bendingLightModel;
    const velocitySensorToolboxScale = 1.2;
    const velocitySensorIconNode = new VelocitySensorNode(this.modelViewTransform, moreToolsModel.velocitySensor.copy(), arrowScale, {
      scale: velocitySensorToolboxScale
    });
    velocitySensorIconNode.mouseArea = Shape.bounds(velocitySensorIconNode.localBounds);
    velocitySensorIconNode.touchArea = Shape.bounds(velocitySensorIconNode.localBounds);
    const velocitySensorNode = new VelocitySensorNode(this.modelViewTransform, moreToolsModel.velocitySensor, arrowScale, {
      scale: 2
    });
    moreToolsModel.velocitySensor.enabledProperty.link(enabled => {
      velocitySensorIconNode.visible = !enabled;
      velocitySensorNode.visible = enabled;
    });
    const velocitySensorListener = new DragListener({
      useParentOffset: true,
      positionProperty: moreToolsModel.velocitySensor.positionProperty,
      transform: this.modelViewTransform,
      // The body node origin is at its top left, so translate the allowed drag area so that the center of the body node
      // will remain in bounds
      dragBoundsProperty: new DerivedProperty([this.visibleBoundsProperty], visibleBounds => {
        return this.modelViewTransform.viewToModelBounds(new Rectangle(visibleBounds.left - velocitySensorNode.bounds.width / 2, visibleBounds.top, visibleBounds.width, visibleBounds.height));
      }),
      end: () => {
        this.bumpLeft(velocitySensorNode, this.moreToolsModel.velocitySensor.positionProperty);
        this.dropInToolbox(velocitySensorNode, this.moreToolsModel.velocitySensor.enabledProperty);
      }
    });
    velocitySensorNode.addInputListener(velocitySensorListener);

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the DragListener
    // for the node in the play area
    velocitySensorIconNode.addInputListener(DragListener.createForwardingListener(event => {
      // Show the protractor in the play area and hide the icon
      this.moreToolsModel.velocitySensor.enabledProperty.value = true;

      // Center the protractor on the pointer
      const viewPosition = velocitySensorNode.globalToParentPoint(event.pointer.point);
      const velocitySensorModelPosition = this.modelViewTransform.viewToModelPosition(viewPosition);
      this.moreToolsModel.velocitySensor.positionProperty.set(velocitySensorModelPosition);
      velocitySensorListener.press(event);
    }));
    this.afterLightLayer2.addChild(velocitySensorNode);
    return velocitySensorIconNode;
  }
  getAdditionalToolIcons() {
    return [this.getVelocitySensorIcon(), this.getWaveSensorIcon()];
  }

  /**
   * Update chart node and wave.
   */
  updateWaveShape() {
    super.updateWaveShape();
    if (this.waveSensorNode && this.waveSensorNode.waveSensor.enabledProperty.get()) {
      this.waveSensorNode.waveSensor.step();
      this.waveSensorNode.chartNode.step(this.moreToolsModel.time);
    }
  }
}
bendingLight.register('MoreToolsScreenView', MoreToolsScreenView);
export default MoreToolsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRyYWdMaXN0ZW5lciIsIlZCb3giLCJTaGFwZSIsIm1lcmdlIiwiYmVuZGluZ0xpZ2h0IiwiV2F2ZWxlbmd0aENvbnRyb2wiLCJJbnRyb1NjcmVlblZpZXciLCJMYXNlclR5cGVBcXVhUmFkaW9CdXR0b25Hcm91cCIsIlZlbG9jaXR5U2Vuc29yTm9kZSIsIldhdmVTZW5zb3JOb2RlIiwiTGFzZXJWaWV3RW51bSIsIk11bHRpbGluayIsIkRlcml2ZWRQcm9wZXJ0eSIsIlJlY3RhbmdsZSIsIkJvb2xlYW5Qcm9wZXJ0eSIsImFycm93U2NhbGUiLCJNb3JlVG9vbHNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb3JlVG9vbHNNb2RlbCIsInByb3ZpZGVkT3B0aW9ucyIsIm1vZGVsIiwic3BhY2luZyIsImFsaWduIiwiY2hpbGRyZW4iLCJsYXNlclZpZXdQcm9wZXJ0eSIsIndhdmVsZW5ndGhQcm9wZXJ0eSIsInZlcnRpY2FsUGxheUFyZWFPZmZzZXQiLCJob3Jpem9udGFsUGxheUFyZWFPZmZzZXQiLCJ3YXZlU2Vuc29yTm9kZSIsIm11bHRpbGluayIsIndhdmVTZW5zb3IiLCJlbmFibGVkUHJvcGVydHkiLCJsYXNlclZpZXciLCJpc1dhdmVTZW5zb3JFbmFibGVkIiwidGltZUNvbnRyb2xOb2RlIiwidmlzaWJsZSIsIldBVkUiLCJnZXRXYXZlU2Vuc29ySWNvbiIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImJlbmRpbmdMaWdodE1vZGVsIiwid2F2ZVNlbnNvckljb24iLCJjb3B5Iiwic2NhbGUiLCJtb3VzZUFyZWEiLCJib3VuZHMiLCJsb2NhbEJvdW5kcyIsInRvdWNoQXJlYSIsImxpbmsiLCJlbmFibGVkIiwiZHJvcEluVG9vbGJveCIsImRyYWdnaW5nVG9nZXRoZXJQcm9wZXJ0eSIsImNyZWF0ZURyYWdMaXN0ZW5lciIsIm5vZGUiLCJwb3NpdGlvblByb3BlcnR5IiwidXNlUGFyZW50T2Zmc2V0IiwidHJhbnNmb3JtIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwidmlzaWJsZUJvdW5kcyIsInZpZXdUb01vZGVsQm91bmRzIiwiZXJvZGVkWCIsInZhbHVlIiwiZHJhZyIsInJlc2V0UmVsYXRpdmVQb3NpdGlvbnMiLCJlbmQiLCJidW1wTGVmdCIsInByb2JlMUxpc3RlbmVyIiwicHJvYmUxTm9kZSIsInByb2JlMSIsImFkZElucHV0TGlzdGVuZXIiLCJwcm9iZTJMaXN0ZW5lciIsInByb2JlMk5vZGUiLCJwcm9iZTIiLCJib2R5TGlzdGVuZXIiLCJib2R5Tm9kZSIsImJvZHlQb3NpdGlvblByb3BlcnR5IiwiY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyIiwiZXZlbnQiLCJzZXQiLCJwdCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJwbHVzWFkiLCJoZWlnaHQiLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwic3luY01vZGVsRnJvbVZpZXciLCJwcmVzcyIsImFmdGVyTGlnaHRMYXllcjIiLCJhZGRDaGlsZCIsImdldFZlbG9jaXR5U2Vuc29ySWNvbiIsInZlbG9jaXR5U2Vuc29yVG9vbGJveFNjYWxlIiwidmVsb2NpdHlTZW5zb3JJY29uTm9kZSIsInZlbG9jaXR5U2Vuc29yIiwidmVsb2NpdHlTZW5zb3JOb2RlIiwidmVsb2NpdHlTZW5zb3JMaXN0ZW5lciIsImxlZnQiLCJ3aWR0aCIsInRvcCIsInZpZXdQb3NpdGlvbiIsInZlbG9jaXR5U2Vuc29yTW9kZWxQb3NpdGlvbiIsImdldEFkZGl0aW9uYWxUb29sSWNvbnMiLCJ1cGRhdGVXYXZlU2hhcGUiLCJnZXQiLCJzdGVwIiwiY2hhcnROb2RlIiwidGltZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9yZVRvb2xzU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgXCJtb3JlIHRvb2xzXCIgc2NyZWVuLCB3aGljaCBhZGRzIG1vcmUgdG9vbHMgdG8gdGhlIHRvb2xib3gsIGFuZCBhIGZldyBtb3JlIGNvbnRyb2xzIGZvciB0aGUgbGFzZXIuXHJcbiAqIFRoaXMgZXh0ZW5kcyB0aGUgSW50cm9TY3JlZW5WaWV3IHNpbmNlIGl0IHNoYXJlcyBtYW55IG9mIHRoZSBzYW1lIGZlYXR1cmVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgTm9kZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuaW1wb3J0IFdhdmVsZW5ndGhDb250cm9sIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1dhdmVsZW5ndGhDb250cm9sLmpzJztcclxuaW1wb3J0IEludHJvU2NyZWVuVmlldywgeyBJbnRyb1NjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vaW50cm8vdmlldy9JbnRyb1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgTGFzZXJUeXBlQXF1YVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vaW50cm8vdmlldy9MYXNlclR5cGVBcXVhUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBNb3JlVG9vbHNNb2RlbCBmcm9tICcuLi9tb2RlbC9Nb3JlVG9vbHNNb2RlbC5qcyc7XHJcbmltcG9ydCBWZWxvY2l0eVNlbnNvck5vZGUgZnJvbSAnLi9WZWxvY2l0eVNlbnNvck5vZGUuanMnO1xyXG5pbXBvcnQgV2F2ZVNlbnNvck5vZGUgZnJvbSAnLi9XYXZlU2Vuc29yTm9kZS5qcyc7XHJcbmltcG9ydCBMYXNlclZpZXdFbnVtIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9MYXNlclZpZXdFbnVtLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgQmVuZGluZ0xpZ2h0TW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0JlbmRpbmdMaWdodE1vZGVsLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBhcnJvd1NjYWxlID0gMS41RS0xNDtcclxuXHJcbnR5cGUgTW9yZVRvb2xzU2NyZWVuVmlld09wdGlvbnMgPSBJbnRyb1NjcmVlblZpZXdPcHRpb25zO1xyXG5cclxuY2xhc3MgTW9yZVRvb2xzU2NyZWVuVmlldyBleHRlbmRzIEludHJvU2NyZWVuVmlldyB7XHJcbiAgcHJpdmF0ZSBtb3JlVG9vbHNNb2RlbDogTW9yZVRvb2xzTW9kZWw7XHJcbiAgcHJpdmF0ZSB3YXZlU2Vuc29yTm9kZTogV2F2ZVNlbnNvck5vZGUgfCBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gbW9yZVRvb2xzTW9kZWwgLSBtb2RlbCBvZiB0aGUgbW9yZSB0b29scyBzY3JlZW5cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vcmVUb29sc01vZGVsOiBNb3JlVG9vbHNNb2RlbCwgcHJvdmlkZWRPcHRpb25zPzogTW9yZVRvb2xzU2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG1vcmVUb29sc01vZGVsLFxyXG4gICAgICB0cnVlLCAvLyBoYXNNb3JlVG9vbHNcclxuICAgICAgMywgLy8gaW5kZXhPZlJlZnJhY3Rpb25EZWNpbWFsc1xyXG5cclxuICAgICAgLy8gY3JlYXRlTGFzZXJDb250cm9sUGFuZWxcclxuICAgICAgKCBtb2RlbDogQmVuZGluZ0xpZ2h0TW9kZWwgKSA9PiBuZXcgVkJveCgge1xyXG4gICAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBMYXNlclR5cGVBcXVhUmFkaW9CdXR0b25Hcm91cCggbW9kZWwubGFzZXJWaWV3UHJvcGVydHkgKSxcclxuICAgICAgICAgIG5ldyBXYXZlbGVuZ3RoQ29udHJvbCggbW9kZWwud2F2ZWxlbmd0aFByb3BlcnR5LCBuZXcgUHJvcGVydHk8Ym9vbGVhbj4oIHRydWUgKSwgMTIwIClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKSwgbWVyZ2UoIHtcclxuICAgICAgICB2ZXJ0aWNhbFBsYXlBcmVhT2Zmc2V0OiAwLFxyXG4gICAgICAgIGhvcml6b250YWxQbGF5QXJlYU9mZnNldDogMFxyXG4gICAgICB9LCBwcm92aWRlZE9wdGlvbnMgKSApO1xyXG5cclxuICAgIHRoaXMud2F2ZVNlbnNvck5vZGUgPSBudWxsO1xyXG4gICAgdGhpcy5tb3JlVG9vbHNNb2RlbCA9IG1vcmVUb29sc01vZGVsOyAvLyAocmVhZC1vbmx5KVxyXG5cclxuICAgIC8vIHVwZGF0ZXMgdGhlIHZpc2liaWxpdHkgb2Ygc3BlZWQgY29udHJvbHNcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbW9yZVRvb2xzTW9kZWwubGFzZXJWaWV3UHJvcGVydHksIG1vcmVUb29sc01vZGVsLndhdmVTZW5zb3IuZW5hYmxlZFByb3BlcnR5IF0sXHJcbiAgICAgICggbGFzZXJWaWV3LCBpc1dhdmVTZW5zb3JFbmFibGVkICkgPT4ge1xyXG4gICAgICAgIHRoaXMudGltZUNvbnRyb2xOb2RlLnZpc2libGUgPSBpc1dhdmVTZW5zb3JFbmFibGVkIHx8IGxhc2VyVmlldyA9PT0gTGFzZXJWaWV3RW51bS5XQVZFO1xyXG4gICAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFdhdmVTZW5zb3JJY29uKCk6IFdhdmVTZW5zb3JOb2RlIHtcclxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtO1xyXG5cclxuICAgIGNvbnN0IHdhdmVTZW5zb3IgPSAoIHRoaXMuYmVuZGluZ0xpZ2h0TW9kZWwgYXMgTW9yZVRvb2xzTW9kZWwgKS53YXZlU2Vuc29yO1xyXG4gICAgY29uc3Qgd2F2ZVNlbnNvckljb24gPSBuZXcgV2F2ZVNlbnNvck5vZGUoXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICB3YXZlU2Vuc29yLmNvcHkoKSwge1xyXG4gICAgICAgIHNjYWxlOiAwLjRcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHdhdmVTZW5zb3JJY29uLm1vdXNlQXJlYSA9IFNoYXBlLmJvdW5kcyggd2F2ZVNlbnNvckljb24ubG9jYWxCb3VuZHMgKTtcclxuICAgIHdhdmVTZW5zb3JJY29uLnRvdWNoQXJlYSA9IFNoYXBlLmJvdW5kcyggd2F2ZVNlbnNvckljb24ubG9jYWxCb3VuZHMgKTtcclxuXHJcbiAgICAvLyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy53YXZlU2Vuc29yTm9kZSA9IG5ldyBXYXZlU2Vuc29yTm9kZShcclxuICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHdhdmVTZW5zb3JcclxuICAgICk7XHJcbiAgICBjb25zdCB3YXZlU2Vuc29yTm9kZSA9IHRoaXMud2F2ZVNlbnNvck5vZGU7XHJcbiAgICB3YXZlU2Vuc29yLmVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcclxuICAgICAgd2F2ZVNlbnNvckljb24udmlzaWJsZSA9ICFlbmFibGVkO1xyXG4gICAgICB3YXZlU2Vuc29yTm9kZS52aXNpYmxlID0gZW5hYmxlZDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBkcm9wSW5Ub29sYm94ID0gdGhpcy5kcm9wSW5Ub29sYm94O1xyXG5cclxuICAgIGNvbnN0IGRyYWdnaW5nVG9nZXRoZXJQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICBjb25zdCBjcmVhdGVEcmFnTGlzdGVuZXIgPSAoIG5vZGU6IE5vZGUsIHBvc2l0aW9uUHJvcGVydHk6IFByb3BlcnR5PFZlY3RvcjI+LCBlbmFibGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+ICkgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICAgIHVzZVBhcmVudE9mZnNldDogdHJ1ZSxcclxuICAgICAgICBwb3NpdGlvblByb3BlcnR5OiBwb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICAgIHRyYW5zZm9ybTogbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICAgIC8vIFRoZSBib2R5IG5vZGUgb3JpZ2luIGlzIGF0IGl0cyB0b3AgbGVmdCwgc28gdHJhbnNsYXRlIHRoZSBhbGxvd2VkIGRyYWcgYXJlYSBzbyB0aGF0IHRoZSBjZW50ZXIgb2YgdGhlIGJvZHkgbm9kZVxyXG4gICAgICAgIC8vIHdpbGwgcmVtYWluIGluIGJvdW5kc1xyXG4gICAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSwgZHJhZ2dpbmdUb2dldGhlclByb3BlcnR5IF0sIHZpc2libGVCb3VuZHMgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyggdmlzaWJsZUJvdW5kcy5lcm9kZWRYKCBkcmFnZ2luZ1RvZ2V0aGVyUHJvcGVydHkudmFsdWUgPyAxMDAgOiAwICkgKTtcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgZHJhZzogKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCBkcmFnZ2luZ1RvZ2V0aGVyUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIHdhdmVTZW5zb3JOb2RlLnJlc2V0UmVsYXRpdmVQb3NpdGlvbnMoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgICAgZHJhZ2dpbmdUb2dldGhlclByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLmJ1bXBMZWZ0KCBub2RlLCBwb3NpdGlvblByb3BlcnR5ICk7XHJcbiAgICAgICAgICBkcm9wSW5Ub29sYm94KCBub2RlLCBlbmFibGVkUHJvcGVydHkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgcHJvYmUxTGlzdGVuZXIgPSBjcmVhdGVEcmFnTGlzdGVuZXIoXHJcbiAgICAgIHdhdmVTZW5zb3JOb2RlLnByb2JlMU5vZGUsXHJcbiAgICAgIHdhdmVTZW5zb3IucHJvYmUxLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHdhdmVTZW5zb3IuZW5hYmxlZFByb3BlcnR5XHJcbiAgICApO1xyXG4gICAgd2F2ZVNlbnNvck5vZGUucHJvYmUxTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBwcm9iZTFMaXN0ZW5lciApO1xyXG5cclxuICAgIGNvbnN0IHByb2JlMkxpc3RlbmVyID0gY3JlYXRlRHJhZ0xpc3RlbmVyKFxyXG4gICAgICB3YXZlU2Vuc29yTm9kZS5wcm9iZTJOb2RlLFxyXG4gICAgICB3YXZlU2Vuc29yLnByb2JlMi5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB3YXZlU2Vuc29yLmVuYWJsZWRQcm9wZXJ0eVxyXG4gICAgKTtcclxuICAgIHdhdmVTZW5zb3JOb2RlLnByb2JlMk5vZGUuYWRkSW5wdXRMaXN0ZW5lciggcHJvYmUyTGlzdGVuZXIgKTtcclxuXHJcbiAgICBjb25zdCBib2R5TGlzdGVuZXIgPSBjcmVhdGVEcmFnTGlzdGVuZXIoXHJcbiAgICAgIHdhdmVTZW5zb3JOb2RlLmJvZHlOb2RlLFxyXG4gICAgICB3YXZlU2Vuc29yLmJvZHlQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB3YXZlU2Vuc29yLmVuYWJsZWRQcm9wZXJ0eVxyXG4gICAgKTtcclxuICAgIHdhdmVTZW5zb3JOb2RlLmJvZHlOb2RlLmFkZElucHV0TGlzdGVuZXIoIGJvZHlMaXN0ZW5lciApO1xyXG5cclxuICAgIHdhdmVTZW5zb3JJY29uLmFkZElucHV0TGlzdGVuZXIoIERyYWdMaXN0ZW5lci5jcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIoIGV2ZW50ID0+IHtcclxuXHJcbiAgICAgIC8vIFNob3cgdGhlIHByb2JlIGluIHRoZSBwbGF5IGFyZWEgYW5kIGhpZGUgdGhlIGljb25cclxuICAgICAgd2F2ZVNlbnNvci5lbmFibGVkUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcblxyXG4gICAgICAvLyBDZW50ZXIgdGhlIGJvZHkgbGFiZWwgb24gdGhlIHBvaW50ZXJcclxuICAgICAgY29uc3QgcHQgPSB3YXZlU2Vuc29yTm9kZS5ib2R5Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50IClcclxuICAgICAgICAucGx1c1hZKCAwLCAtd2F2ZVNlbnNvck5vZGUuYm9keU5vZGUuaGVpZ2h0IC8gMiArIDUgKTtcclxuICAgICAgd2F2ZVNlbnNvci5ib2R5UG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFBvc2l0aW9uKCBwdCApO1xyXG4gICAgICB3YXZlU2Vuc29yTm9kZS5yZXNldFJlbGF0aXZlUG9zaXRpb25zKCk7XHJcbiAgICAgIHdhdmVTZW5zb3JOb2RlLnN5bmNNb2RlbEZyb21WaWV3KCk7XHJcblxyXG4gICAgICBkcmFnZ2luZ1RvZ2V0aGVyUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB3YXZlU2Vuc29yTm9kZS5yZXNldFJlbGF0aXZlUG9zaXRpb25zKCk7XHJcbiAgICAgIGJvZHlMaXN0ZW5lci5wcmVzcyggZXZlbnQgKTtcclxuICAgICAgd2F2ZVNlbnNvck5vZGUucmVzZXRSZWxhdGl2ZVBvc2l0aW9ucygpO1xyXG4gICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5hZnRlckxpZ2h0TGF5ZXIyLmFkZENoaWxkKCB0aGlzLndhdmVTZW5zb3JOb2RlICk7XHJcbiAgICByZXR1cm4gd2F2ZVNlbnNvckljb247XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFZlbG9jaXR5U2Vuc29ySWNvbigpOiBWZWxvY2l0eVNlbnNvck5vZGUge1xyXG4gICAgY29uc3QgbW9yZVRvb2xzTW9kZWwgPSB0aGlzLmJlbmRpbmdMaWdodE1vZGVsIGFzIE1vcmVUb29sc01vZGVsO1xyXG4gICAgY29uc3QgdmVsb2NpdHlTZW5zb3JUb29sYm94U2NhbGUgPSAxLjI7XHJcbiAgICBjb25zdCB2ZWxvY2l0eVNlbnNvckljb25Ob2RlID0gbmV3IFZlbG9jaXR5U2Vuc29yTm9kZShcclxuICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIG1vcmVUb29sc01vZGVsLnZlbG9jaXR5U2Vuc29yLmNvcHkoKSxcclxuICAgICAgYXJyb3dTY2FsZSwge1xyXG4gICAgICAgIHNjYWxlOiB2ZWxvY2l0eVNlbnNvclRvb2xib3hTY2FsZVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdmVsb2NpdHlTZW5zb3JJY29uTm9kZS5tb3VzZUFyZWEgPSBTaGFwZS5ib3VuZHMoIHZlbG9jaXR5U2Vuc29ySWNvbk5vZGUubG9jYWxCb3VuZHMgKTtcclxuICAgIHZlbG9jaXR5U2Vuc29ySWNvbk5vZGUudG91Y2hBcmVhID0gU2hhcGUuYm91bmRzKCB2ZWxvY2l0eVNlbnNvckljb25Ob2RlLmxvY2FsQm91bmRzICk7XHJcblxyXG4gICAgY29uc3QgdmVsb2NpdHlTZW5zb3JOb2RlID0gbmV3IFZlbG9jaXR5U2Vuc29yTm9kZShcclxuICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIG1vcmVUb29sc01vZGVsLnZlbG9jaXR5U2Vuc29yLFxyXG4gICAgICBhcnJvd1NjYWxlLCB7XHJcbiAgICAgICAgc2NhbGU6IDJcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIG1vcmVUb29sc01vZGVsLnZlbG9jaXR5U2Vuc29yLmVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcclxuICAgICAgdmVsb2NpdHlTZW5zb3JJY29uTm9kZS52aXNpYmxlID0gIWVuYWJsZWQ7XHJcbiAgICAgIHZlbG9jaXR5U2Vuc29yTm9kZS52aXNpYmxlID0gZW5hYmxlZDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB2ZWxvY2l0eVNlbnNvckxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB1c2VQYXJlbnRPZmZzZXQ6IHRydWUsXHJcbiAgICAgIHBvc2l0aW9uUHJvcGVydHk6IG1vcmVUb29sc01vZGVsLnZlbG9jaXR5U2Vuc29yLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHRyYW5zZm9ybTogdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIC8vIFRoZSBib2R5IG5vZGUgb3JpZ2luIGlzIGF0IGl0cyB0b3AgbGVmdCwgc28gdHJhbnNsYXRlIHRoZSBhbGxvd2VkIGRyYWcgYXJlYSBzbyB0aGF0IHRoZSBjZW50ZXIgb2YgdGhlIGJvZHkgbm9kZVxyXG4gICAgICAvLyB3aWxsIHJlbWFpbiBpbiBib3VuZHNcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5IF0sIHZpc2libGVCb3VuZHMgPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyggbmV3IFJlY3RhbmdsZShcclxuICAgICAgICAgIHZpc2libGVCb3VuZHMubGVmdCAtIHZlbG9jaXR5U2Vuc29yTm9kZS5ib3VuZHMud2lkdGggLyAyLFxyXG4gICAgICAgICAgdmlzaWJsZUJvdW5kcy50b3AsXHJcbiAgICAgICAgICB2aXNpYmxlQm91bmRzLndpZHRoLFxyXG4gICAgICAgICAgdmlzaWJsZUJvdW5kcy5oZWlnaHRcclxuICAgICAgICApICk7XHJcbiAgICAgIH0gKSxcclxuICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5idW1wTGVmdCggdmVsb2NpdHlTZW5zb3JOb2RlLCB0aGlzLm1vcmVUb29sc01vZGVsLnZlbG9jaXR5U2Vuc29yLnBvc2l0aW9uUHJvcGVydHkgKTtcclxuICAgICAgICB0aGlzLmRyb3BJblRvb2xib3goXHJcbiAgICAgICAgICB2ZWxvY2l0eVNlbnNvck5vZGUsXHJcbiAgICAgICAgICB0aGlzLm1vcmVUb29sc01vZGVsLnZlbG9jaXR5U2Vuc29yLmVuYWJsZWRQcm9wZXJ0eVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHZlbG9jaXR5U2Vuc29yTm9kZS5hZGRJbnB1dExpc3RlbmVyKCB2ZWxvY2l0eVNlbnNvckxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQWRkIGFuIGlucHV0IGxpc3RlbmVyIHRvIHRoZSB0b29sYm94IGljb24gZm9yIHRoZSBwcm90cmFjdG9yLCB3aGljaCBmb3J3YXJkcyBldmVudHMgdG8gdGhlIERyYWdMaXN0ZW5lclxyXG4gICAgLy8gZm9yIHRoZSBub2RlIGluIHRoZSBwbGF5IGFyZWFcclxuICAgIHZlbG9jaXR5U2Vuc29ySWNvbk5vZGUuYWRkSW5wdXRMaXN0ZW5lciggRHJhZ0xpc3RlbmVyLmNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciggZXZlbnQgPT4ge1xyXG5cclxuICAgICAgLy8gU2hvdyB0aGUgcHJvdHJhY3RvciBpbiB0aGUgcGxheSBhcmVhIGFuZCBoaWRlIHRoZSBpY29uXHJcbiAgICAgIHRoaXMubW9yZVRvb2xzTW9kZWwudmVsb2NpdHlTZW5zb3IuZW5hYmxlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIENlbnRlciB0aGUgcHJvdHJhY3RvciBvbiB0aGUgcG9pbnRlclxyXG4gICAgICBjb25zdCB2aWV3UG9zaXRpb24gPSB2ZWxvY2l0eVNlbnNvck5vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG4gICAgICBjb25zdCB2ZWxvY2l0eVNlbnNvck1vZGVsUG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFBvc2l0aW9uKCB2aWV3UG9zaXRpb24gKTtcclxuICAgICAgdGhpcy5tb3JlVG9vbHNNb2RlbC52ZWxvY2l0eVNlbnNvci5wb3NpdGlvblByb3BlcnR5LnNldCggdmVsb2NpdHlTZW5zb3JNb2RlbFBvc2l0aW9uICk7XHJcbiAgICAgIHZlbG9jaXR5U2Vuc29yTGlzdGVuZXIucHJlc3MoIGV2ZW50ICk7XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLmFmdGVyTGlnaHRMYXllcjIuYWRkQ2hpbGQoIHZlbG9jaXR5U2Vuc29yTm9kZSApO1xyXG4gICAgcmV0dXJuIHZlbG9jaXR5U2Vuc29ySWNvbk5vZGU7XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgZ2V0QWRkaXRpb25hbFRvb2xJY29ucygpOiAoIFdhdmVTZW5zb3JOb2RlIHwgVmVsb2NpdHlTZW5zb3JOb2RlIClbXSB7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICB0aGlzLmdldFZlbG9jaXR5U2Vuc29ySWNvbigpLFxyXG4gICAgICB0aGlzLmdldFdhdmVTZW5zb3JJY29uKClcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgY2hhcnQgbm9kZSBhbmQgd2F2ZS5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlV2F2ZVNoYXBlKCk6IHZvaWQge1xyXG4gICAgc3VwZXIudXBkYXRlV2F2ZVNoYXBlKCk7XHJcbiAgICBpZiAoIHRoaXMud2F2ZVNlbnNvck5vZGUgJiYgdGhpcy53YXZlU2Vuc29yTm9kZS53YXZlU2Vuc29yLmVuYWJsZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy53YXZlU2Vuc29yTm9kZS53YXZlU2Vuc29yLnN0ZXAoKTtcclxuICAgICAgdGhpcy53YXZlU2Vuc29yTm9kZS5jaGFydE5vZGUuc3RlcCggdGhpcy5tb3JlVG9vbHNNb2RlbC50aW1lICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5iZW5kaW5nTGlnaHQucmVnaXN0ZXIoICdNb3JlVG9vbHNTY3JlZW5WaWV3JywgTW9yZVRvb2xzU2NyZWVuVmlldyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW9yZVRvb2xzU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsU0FBU0MsWUFBWSxFQUFRQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzVFLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLGlCQUFpQixNQUFNLHdDQUF3QztBQUN0RSxPQUFPQyxlQUFlLE1BQWtDLHFDQUFxQztBQUM3RixPQUFPQyw2QkFBNkIsTUFB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