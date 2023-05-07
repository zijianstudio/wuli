// Copyright 2018-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * For each scene, shows one node for each wave generator, each with its own on/off button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import RoundStickyToggleButton from '../../../../sun/js/buttons/RoundStickyToggleButton.js';
import waveInterference from '../../waveInterference.js';
import Scene from '../model/Scene.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
import DisturbanceTypeIconNode from './DisturbanceTypeIconNode.js';
class WaveGeneratorNode extends Node {
  /**
   * @param scene
   * @param waveAreaNode - for bounds
   * @param buttonPosition - x offset
   * @param isPrimarySource
   * @param sourceNode - for the wave generators, shared with scenery DAG
   * @param [verticalOffset] - offset for the hose, so the water has some distance to fall
   * @param [buttonOffset] - offset for the button, so it can be positioned on the pipe
   * @param [showButtonBackground] - true if a new background for the button should be added
   */
  constructor(scene, waveAreaNode, buttonPosition, isPrimarySource, sourceNode, verticalOffset = 0, buttonOffset = 0, showButtonBackground = false) {
    const pulseIcon = new DisturbanceTypeIconNode(Scene.DisturbanceType.PULSE, {
      scale: 0.36,
      stroked: true
    });
    const buttonPressedProperty = isPrimarySource ? scene.button1PressedProperty : scene.button2PressedProperty;

    // Adapter to play the waveGeneratorButtonSound for the scene.
    const soundPlayer = {
      play() {
        scene.waveGeneratorButtonSound(buttonPressedProperty.value);
      }
    };
    const buttonOptions = {
      centerY: sourceNode.centerY + buttonOffset,
      left: buttonPosition,
      radius: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_RADIUS,
      content: pulseIcon,
      touchAreaDilation: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_TOUCH_AREA_DILATION,
      baseColor: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_COLOR,
      soundPlayer: soundPlayer
    };
    const button = new RoundStickyToggleButton(buttonPressedProperty, false, true, buttonOptions);
    const children = [sourceNode];
    if (showButtonBackground) {
      const diameter = button.width * 1.3;
      children.push(new ShadedSphereNode(diameter, {
        center: button.center,
        mainColor: '#b1b1b1',
        highlightColor: 'white',
        shadowColor: 'black',
        highlightXOffset: -0.2,
        highlightYOffset: -0.5
      }));
    }
    children.push(button);
    const nodeWithButton = new Node({
      children: children
    });
    const updateEnabled = () => {
      if (scene.disturbanceTypeProperty.value === Scene.DisturbanceType.PULSE) {
        button.enabled = !scene.pulseFiringProperty.value && !scene.isAboutToFireProperty.value;
      } else if (scene.disturbanceTypeProperty.value === Scene.DisturbanceType.CONTINUOUS) {
        button.enabled = true;
      }
    };

    // When changing between PULSE and CONTINUOUS, update the buttons.
    scene.disturbanceTypeProperty.link(disturbanceType => {
      pulseIcon.visible = disturbanceType === Scene.DisturbanceType.PULSE;
      updateEnabled();
    });
    scene.pulseFiringProperty.link(updateEnabled);
    scene.isAboutToFireProperty.link(updateEnabled);
    super({
      children: [nodeWithButton]
    });
    const sourceSeparationProperty = scene.desiredSourceSeparationProperty || scene.sourceSeparationProperty;
    sourceSeparationProperty.link(sourceSeparation => {
      // Distance between the sources, or 0 if there is only 1 source
      const separation = scene.numberOfSources === 2 ? sourceSeparation : 0;
      if (!isPrimarySource) {
        nodeWithButton.visible = separation > 0;
      }
      const sign = isPrimarySource ? 1 : -1;
      const viewSeparation = scene.modelViewTransform.modelToViewDeltaY(separation);
      nodeWithButton.centerY = waveAreaNode.centerY + sign * viewSeparation / 2 + verticalOffset;
    });
  }
}
waveInterference.register('WaveGeneratorNode', WaveGeneratorNode);
export default WaveGeneratorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFkZWRTcGhlcmVOb2RlIiwiTm9kZSIsIlJvdW5kU3RpY2t5VG9nZ2xlQnV0dG9uIiwid2F2ZUludGVyZmVyZW5jZSIsIlNjZW5lIiwiV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyIsIkRpc3R1cmJhbmNlVHlwZUljb25Ob2RlIiwiV2F2ZUdlbmVyYXRvck5vZGUiLCJjb25zdHJ1Y3RvciIsInNjZW5lIiwid2F2ZUFyZWFOb2RlIiwiYnV0dG9uUG9zaXRpb24iLCJpc1ByaW1hcnlTb3VyY2UiLCJzb3VyY2VOb2RlIiwidmVydGljYWxPZmZzZXQiLCJidXR0b25PZmZzZXQiLCJzaG93QnV0dG9uQmFja2dyb3VuZCIsInB1bHNlSWNvbiIsIkRpc3R1cmJhbmNlVHlwZSIsIlBVTFNFIiwic2NhbGUiLCJzdHJva2VkIiwiYnV0dG9uUHJlc3NlZFByb3BlcnR5IiwiYnV0dG9uMVByZXNzZWRQcm9wZXJ0eSIsImJ1dHRvbjJQcmVzc2VkUHJvcGVydHkiLCJzb3VuZFBsYXllciIsInBsYXkiLCJ3YXZlR2VuZXJhdG9yQnV0dG9uU291bmQiLCJ2YWx1ZSIsImJ1dHRvbk9wdGlvbnMiLCJjZW50ZXJZIiwibGVmdCIsInJhZGl1cyIsIldBVkVfR0VORVJBVE9SX0JVVFRPTl9SQURJVVMiLCJjb250ZW50IiwidG91Y2hBcmVhRGlsYXRpb24iLCJXQVZFX0dFTkVSQVRPUl9CVVRUT05fVE9VQ0hfQVJFQV9ESUxBVElPTiIsImJhc2VDb2xvciIsIldBVkVfR0VORVJBVE9SX0JVVFRPTl9DT0xPUiIsImJ1dHRvbiIsImNoaWxkcmVuIiwiZGlhbWV0ZXIiLCJ3aWR0aCIsInB1c2giLCJjZW50ZXIiLCJtYWluQ29sb3IiLCJoaWdobGlnaHRDb2xvciIsInNoYWRvd0NvbG9yIiwiaGlnaGxpZ2h0WE9mZnNldCIsImhpZ2hsaWdodFlPZmZzZXQiLCJub2RlV2l0aEJ1dHRvbiIsInVwZGF0ZUVuYWJsZWQiLCJkaXN0dXJiYW5jZVR5cGVQcm9wZXJ0eSIsImVuYWJsZWQiLCJwdWxzZUZpcmluZ1Byb3BlcnR5IiwiaXNBYm91dFRvRmlyZVByb3BlcnR5IiwiQ09OVElOVU9VUyIsImxpbmsiLCJkaXN0dXJiYW5jZVR5cGUiLCJ2aXNpYmxlIiwic291cmNlU2VwYXJhdGlvblByb3BlcnR5IiwiZGVzaXJlZFNvdXJjZVNlcGFyYXRpb25Qcm9wZXJ0eSIsInNvdXJjZVNlcGFyYXRpb24iLCJzZXBhcmF0aW9uIiwibnVtYmVyT2ZTb3VyY2VzIiwic2lnbiIsInZpZXdTZXBhcmF0aW9uIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwibW9kZWxUb1ZpZXdEZWx0YVkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVHZW5lcmF0b3JOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBAdHMtbm9jaGVja1xyXG4vKipcclxuICogRm9yIGVhY2ggc2NlbmUsIHNob3dzIG9uZSBub2RlIGZvciBlYWNoIHdhdmUgZ2VuZXJhdG9yLCBlYWNoIHdpdGggaXRzIG93biBvbi9vZmYgYnV0dG9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaGFkZWRTcGhlcmVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkZWRTcGhlcmVOb2RlLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSb3VuZFN0aWNreVRvZ2dsZUJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9Sb3VuZFN0aWNreVRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgU2NlbmUgZnJvbSAnLi4vbW9kZWwvU2NlbmUuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi9XYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IERpc3R1cmJhbmNlVHlwZUljb25Ob2RlIGZyb20gJy4vRGlzdHVyYmFuY2VUeXBlSWNvbk5vZGUuanMnO1xyXG5cclxuY2xhc3MgV2F2ZUdlbmVyYXRvck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHNjZW5lXHJcbiAgICogQHBhcmFtIHdhdmVBcmVhTm9kZSAtIGZvciBib3VuZHNcclxuICAgKiBAcGFyYW0gYnV0dG9uUG9zaXRpb24gLSB4IG9mZnNldFxyXG4gICAqIEBwYXJhbSBpc1ByaW1hcnlTb3VyY2VcclxuICAgKiBAcGFyYW0gc291cmNlTm9kZSAtIGZvciB0aGUgd2F2ZSBnZW5lcmF0b3JzLCBzaGFyZWQgd2l0aCBzY2VuZXJ5IERBR1xyXG4gICAqIEBwYXJhbSBbdmVydGljYWxPZmZzZXRdIC0gb2Zmc2V0IGZvciB0aGUgaG9zZSwgc28gdGhlIHdhdGVyIGhhcyBzb21lIGRpc3RhbmNlIHRvIGZhbGxcclxuICAgKiBAcGFyYW0gW2J1dHRvbk9mZnNldF0gLSBvZmZzZXQgZm9yIHRoZSBidXR0b24sIHNvIGl0IGNhbiBiZSBwb3NpdGlvbmVkIG9uIHRoZSBwaXBlXHJcbiAgICogQHBhcmFtIFtzaG93QnV0dG9uQmFja2dyb3VuZF0gLSB0cnVlIGlmIGEgbmV3IGJhY2tncm91bmQgZm9yIHRoZSBidXR0b24gc2hvdWxkIGJlIGFkZGVkXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY2VuZSwgd2F2ZUFyZWFOb2RlLCBidXR0b25Qb3NpdGlvbiwgaXNQcmltYXJ5U291cmNlLCBzb3VyY2VOb2RlLFxyXG4gICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9IDAsXHJcbiAgICAgICAgICAgICAgIGJ1dHRvbk9mZnNldCA9IDAsXHJcbiAgICAgICAgICAgICAgIHNob3dCdXR0b25CYWNrZ3JvdW5kID0gZmFsc2UgKSB7XHJcbiAgICBjb25zdCBwdWxzZUljb24gPSBuZXcgRGlzdHVyYmFuY2VUeXBlSWNvbk5vZGUoIFNjZW5lLkRpc3R1cmJhbmNlVHlwZS5QVUxTRSwge1xyXG4gICAgICBzY2FsZTogMC4zNixcclxuICAgICAgc3Ryb2tlZDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvblByZXNzZWRQcm9wZXJ0eSA9IGlzUHJpbWFyeVNvdXJjZSA/IHNjZW5lLmJ1dHRvbjFQcmVzc2VkUHJvcGVydHkgOiBzY2VuZS5idXR0b24yUHJlc3NlZFByb3BlcnR5O1xyXG5cclxuICAgIC8vIEFkYXB0ZXIgdG8gcGxheSB0aGUgd2F2ZUdlbmVyYXRvckJ1dHRvblNvdW5kIGZvciB0aGUgc2NlbmUuXHJcbiAgICBjb25zdCBzb3VuZFBsYXllciA9IHtcclxuICAgICAgcGxheSgpIHtcclxuICAgICAgICBzY2VuZS53YXZlR2VuZXJhdG9yQnV0dG9uU291bmQoIGJ1dHRvblByZXNzZWRQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvbk9wdGlvbnMgPSB7XHJcbiAgICAgIGNlbnRlclk6IHNvdXJjZU5vZGUuY2VudGVyWSArIGJ1dHRvbk9mZnNldCxcclxuICAgICAgbGVmdDogYnV0dG9uUG9zaXRpb24sXHJcbiAgICAgIHJhZGl1czogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5XQVZFX0dFTkVSQVRPUl9CVVRUT05fUkFESVVTLFxyXG4gICAgICBjb250ZW50OiBwdWxzZUljb24sXHJcbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLldBVkVfR0VORVJBVE9SX0JVVFRPTl9UT1VDSF9BUkVBX0RJTEFUSU9OLFxyXG4gICAgICBiYXNlQ29sb3I6IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuV0FWRV9HRU5FUkFUT1JfQlVUVE9OX0NPTE9SLFxyXG4gICAgICBzb3VuZFBsYXllcjogc291bmRQbGF5ZXJcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgYnV0dG9uID0gbmV3IFJvdW5kU3RpY2t5VG9nZ2xlQnV0dG9uKCBidXR0b25QcmVzc2VkUHJvcGVydHksIGZhbHNlLCB0cnVlLCBidXR0b25PcHRpb25zICk7XHJcbiAgICBjb25zdCBjaGlsZHJlbiA9IFsgc291cmNlTm9kZSBdO1xyXG4gICAgaWYgKCBzaG93QnV0dG9uQmFja2dyb3VuZCApIHtcclxuICAgICAgY29uc3QgZGlhbWV0ZXIgPSBidXR0b24ud2lkdGggKiAxLjM7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBTaGFkZWRTcGhlcmVOb2RlKCBkaWFtZXRlciwge1xyXG4gICAgICAgIGNlbnRlcjogYnV0dG9uLmNlbnRlcixcclxuICAgICAgICBtYWluQ29sb3I6ICcjYjFiMWIxJyxcclxuICAgICAgICBoaWdobGlnaHRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICBzaGFkb3dDb2xvcjogJ2JsYWNrJyxcclxuICAgICAgICBoaWdobGlnaHRYT2Zmc2V0OiAtMC4yLFxyXG4gICAgICAgIGhpZ2hsaWdodFlPZmZzZXQ6IC0wLjVcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcbiAgICBjaGlsZHJlbi5wdXNoKCBidXR0b24gKTtcclxuICAgIGNvbnN0IG5vZGVXaXRoQnV0dG9uID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IGNoaWxkcmVuIH0gKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVFbmFibGVkID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIHNjZW5lLmRpc3R1cmJhbmNlVHlwZVByb3BlcnR5LnZhbHVlID09PSBTY2VuZS5EaXN0dXJiYW5jZVR5cGUuUFVMU0UgKSB7XHJcbiAgICAgICAgYnV0dG9uLmVuYWJsZWQgPSAhc2NlbmUucHVsc2VGaXJpbmdQcm9wZXJ0eS52YWx1ZSAmJiAhc2NlbmUuaXNBYm91dFRvRmlyZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBzY2VuZS5kaXN0dXJiYW5jZVR5cGVQcm9wZXJ0eS52YWx1ZSA9PT0gU2NlbmUuRGlzdHVyYmFuY2VUeXBlLkNPTlRJTlVPVVMgKSB7XHJcbiAgICAgICAgYnV0dG9uLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFdoZW4gY2hhbmdpbmcgYmV0d2VlbiBQVUxTRSBhbmQgQ09OVElOVU9VUywgdXBkYXRlIHRoZSBidXR0b25zLlxyXG4gICAgc2NlbmUuZGlzdHVyYmFuY2VUeXBlUHJvcGVydHkubGluayggZGlzdHVyYmFuY2VUeXBlID0+IHtcclxuICAgICAgICBwdWxzZUljb24udmlzaWJsZSA9IGRpc3R1cmJhbmNlVHlwZSA9PT0gU2NlbmUuRGlzdHVyYmFuY2VUeXBlLlBVTFNFO1xyXG4gICAgICAgIHVwZGF0ZUVuYWJsZWQoKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHNjZW5lLnB1bHNlRmlyaW5nUHJvcGVydHkubGluayggdXBkYXRlRW5hYmxlZCApO1xyXG4gICAgc2NlbmUuaXNBYm91dFRvRmlyZVByb3BlcnR5LmxpbmsoIHVwZGF0ZUVuYWJsZWQgKTtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIG5vZGVXaXRoQnV0dG9uIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzb3VyY2VTZXBhcmF0aW9uUHJvcGVydHkgPSBzY2VuZS5kZXNpcmVkU291cmNlU2VwYXJhdGlvblByb3BlcnR5IHx8IHNjZW5lLnNvdXJjZVNlcGFyYXRpb25Qcm9wZXJ0eTtcclxuICAgIHNvdXJjZVNlcGFyYXRpb25Qcm9wZXJ0eS5saW5rKCBzb3VyY2VTZXBhcmF0aW9uID0+IHtcclxuXHJcbiAgICAgIC8vIERpc3RhbmNlIGJldHdlZW4gdGhlIHNvdXJjZXMsIG9yIDAgaWYgdGhlcmUgaXMgb25seSAxIHNvdXJjZVxyXG4gICAgICBjb25zdCBzZXBhcmF0aW9uID0gc2NlbmUubnVtYmVyT2ZTb3VyY2VzID09PSAyID8gc291cmNlU2VwYXJhdGlvbiA6IDA7XHJcbiAgICAgIGlmICggIWlzUHJpbWFyeVNvdXJjZSApIHtcclxuICAgICAgICBub2RlV2l0aEJ1dHRvbi52aXNpYmxlID0gc2VwYXJhdGlvbiA+IDA7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgc2lnbiA9IGlzUHJpbWFyeVNvdXJjZSA/IDEgOiAtMTtcclxuICAgICAgY29uc3Qgdmlld1NlcGFyYXRpb24gPSBzY2VuZS5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIHNlcGFyYXRpb24gKTtcclxuXHJcbiAgICAgIG5vZGVXaXRoQnV0dG9uLmNlbnRlclkgPSB3YXZlQXJlYU5vZGUuY2VudGVyWSArIHNpZ24gKiB2aWV3U2VwYXJhdGlvbiAvIDIgKyB2ZXJ0aWNhbE9mZnNldDtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbndhdmVJbnRlcmZlcmVuY2UucmVnaXN0ZXIoICdXYXZlR2VuZXJhdG9yTm9kZScsIFdhdmVHZW5lcmF0b3JOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFdhdmVHZW5lcmF0b3JOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0saURBQWlEO0FBQzlFLFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsdUJBQXVCLE1BQU0sdURBQXVEO0FBQzNGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxLQUFLLE1BQU0sbUJBQW1CO0FBQ3JDLE9BQU9DLHlCQUF5QixNQUFNLGlDQUFpQztBQUN2RSxPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7QUFFbEUsTUFBTUMsaUJBQWlCLFNBQVNOLElBQUksQ0FBQztFQUVuQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTTyxXQUFXQSxDQUFFQyxLQUFLLEVB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