// Copyright 2022, University of Colorado Boulder
/**
 * View for the reflection screen.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import { Node, Rectangle } from '../../../scenery/js/imports.js';
import SoundConstants from '../common/SoundConstants.js';
import ReflectionControlPanel from '../common/view/ReflectionControlPanel.js';
import SoundModeControlPanel from '../common/view/SoundModeControlPanel.js';
import sound from '../sound.js';
import SoundScreenView from '../common/view/SoundScreenView.js';
export default class ReflectionView extends SoundScreenView {
  // control panel for the angle and position of the reflection wall

  // control panel for controlling wether the speaker emits waves continuously or pulses

  // rectangle representing the reflection wall

  // container for the reflector, needed for rotation

  constructor(model) {
    super(model);
    this.reflectionControlPanel = new ReflectionControlPanel(model, this.contolPanelAlignGroup);
    this.soundModeControlPanel = new SoundModeControlPanel(model, this.contolPanelAlignGroup);
    this.reflector = new Rectangle(0, 0, SoundConstants.WAVE_AREA_WIDTH * 2, 4, {
      fill: '#f3d99b',
      stroke: 'black',
      lineWidth: 1
    });
    this.reflector.setY(model.modelViewTransform.modelToViewY(SoundConstants.WAVE_AREA_WIDTH));
    model.wallAngleProperty.link(prop => {
      this.reflector.setRotation(-prop);
      this.canvasNode.setWallAngle(prop);
    });
    this.reflectorContainer = new Node();
    this.reflectorContainer.addChild(this.reflector);
    this.reflectorContainer.setClipArea(Shape.rect(model.modelViewTransform.modelToViewX(0), model.modelViewTransform.modelToViewY(0), model.modelViewTransform.modelToViewDeltaX(SoundConstants.WAVE_AREA_WIDTH), model.modelViewTransform.modelToViewDeltaY(SoundConstants.WAVE_AREA_WIDTH)));
    model.wallPositionXProperty.link(prop => {
      this.reflector.setX(model.modelViewTransform.modelToViewX(prop));
      this.canvasNode.setWallPositionX(model.modelToLatticeTransform.modelToViewX(prop));
    });
    this.addChild(this.reflectorContainer);
    this.reflectionControlPanel.mutate({
      right: this.layoutBounds.right - SoundConstants.CONTROL_PANEL_MARGIN,
      top: this.controlPanel.bottom + SoundConstants.CONTROL_PANEL_SPACING
    });
    this.addChild(this.reflectionControlPanel);
    this.soundModeControlPanel.mutate({
      right: this.layoutBounds.right - SoundConstants.CONTROL_PANEL_MARGIN,
      top: this.reflectionControlPanel.bottom + SoundConstants.CONTROL_PANEL_SPACING
    });
    this.addChild(this.soundModeControlPanel);
  }
}
sound.register('ReflectionView', ReflectionView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJTb3VuZENvbnN0YW50cyIsIlJlZmxlY3Rpb25Db250cm9sUGFuZWwiLCJTb3VuZE1vZGVDb250cm9sUGFuZWwiLCJzb3VuZCIsIlNvdW5kU2NyZWVuVmlldyIsIlJlZmxlY3Rpb25WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInJlZmxlY3Rpb25Db250cm9sUGFuZWwiLCJjb250b2xQYW5lbEFsaWduR3JvdXAiLCJzb3VuZE1vZGVDb250cm9sUGFuZWwiLCJyZWZsZWN0b3IiLCJXQVZFX0FSRUFfV0lEVEgiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwic2V0WSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm1vZGVsVG9WaWV3WSIsIndhbGxBbmdsZVByb3BlcnR5IiwibGluayIsInByb3AiLCJzZXRSb3RhdGlvbiIsImNhbnZhc05vZGUiLCJzZXRXYWxsQW5nbGUiLCJyZWZsZWN0b3JDb250YWluZXIiLCJhZGRDaGlsZCIsInNldENsaXBBcmVhIiwicmVjdCIsIm1vZGVsVG9WaWV3WCIsIm1vZGVsVG9WaWV3RGVsdGFYIiwibW9kZWxUb1ZpZXdEZWx0YVkiLCJ3YWxsUG9zaXRpb25YUHJvcGVydHkiLCJzZXRYIiwic2V0V2FsbFBvc2l0aW9uWCIsIm1vZGVsVG9MYXR0aWNlVHJhbnNmb3JtIiwibXV0YXRlIiwicmlnaHQiLCJsYXlvdXRCb3VuZHMiLCJDT05UUk9MX1BBTkVMX01BUkdJTiIsInRvcCIsImNvbnRyb2xQYW5lbCIsImJvdHRvbSIsIkNPTlRST0xfUEFORUxfU1BBQ0lORyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVmbGVjdGlvblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogVmlldyBmb3IgdGhlIHJlZmxlY3Rpb24gc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFBpZXQgR29yaXMgKFVuaXZlcnNpdHkgb2YgTGV1dmVuKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFNvdW5kQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9Tb3VuZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBSZWZsZWN0aW9uQ29udHJvbFBhbmVsIGZyb20gJy4uL2NvbW1vbi92aWV3L1JlZmxlY3Rpb25Db250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgU291bmRNb2RlQ29udHJvbFBhbmVsIGZyb20gJy4uL2NvbW1vbi92aWV3L1NvdW5kTW9kZUNvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBzb3VuZCBmcm9tICcuLi9zb3VuZC5qcyc7XHJcbmltcG9ydCBTb3VuZFNjcmVlblZpZXcgZnJvbSAnLi4vY29tbW9uL3ZpZXcvU291bmRTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFJlZmxlY3Rpb25Nb2RlbCBmcm9tICcuLi9yZWZsZWN0aW9uL1JlZmxlY3Rpb25Nb2RlbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWZsZWN0aW9uVmlldyBleHRlbmRzIFNvdW5kU2NyZWVuVmlldyB7XHJcblxyXG4gIC8vIGNvbnRyb2wgcGFuZWwgZm9yIHRoZSBhbmdsZSBhbmQgcG9zaXRpb24gb2YgdGhlIHJlZmxlY3Rpb24gd2FsbFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVmbGVjdGlvbkNvbnRyb2xQYW5lbDogUmVmbGVjdGlvbkNvbnRyb2xQYW5lbDtcclxuXHJcbiAgLy8gY29udHJvbCBwYW5lbCBmb3IgY29udHJvbGxpbmcgd2V0aGVyIHRoZSBzcGVha2VyIGVtaXRzIHdhdmVzIGNvbnRpbnVvdXNseSBvciBwdWxzZXNcclxuICBwcml2YXRlIHJlYWRvbmx5IHNvdW5kTW9kZUNvbnRyb2xQYW5lbDogU291bmRNb2RlQ29udHJvbFBhbmVsO1xyXG5cclxuICAvLyByZWN0YW5nbGUgcmVwcmVzZW50aW5nIHRoZSByZWZsZWN0aW9uIHdhbGxcclxuICBwcml2YXRlIHJlYWRvbmx5IHJlZmxlY3RvcjogUmVjdGFuZ2xlO1xyXG5cclxuICAvLyBjb250YWluZXIgZm9yIHRoZSByZWZsZWN0b3IsIG5lZWRlZCBmb3Igcm90YXRpb25cclxuICBwcml2YXRlIHJlYWRvbmx5IHJlZmxlY3RvckNvbnRhaW5lcjogTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogUmVmbGVjdGlvbk1vZGVsICkge1xyXG4gICAgc3VwZXIoIG1vZGVsICk7XHJcblxyXG4gICAgdGhpcy5yZWZsZWN0aW9uQ29udHJvbFBhbmVsID0gbmV3IFJlZmxlY3Rpb25Db250cm9sUGFuZWwoIG1vZGVsLCB0aGlzLmNvbnRvbFBhbmVsQWxpZ25Hcm91cCApO1xyXG5cclxuICAgIHRoaXMuc291bmRNb2RlQ29udHJvbFBhbmVsID0gbmV3IFNvdW5kTW9kZUNvbnRyb2xQYW5lbCggbW9kZWwsIHRoaXMuY29udG9sUGFuZWxBbGlnbkdyb3VwICk7XHJcblxyXG4gICAgdGhpcy5yZWZsZWN0b3IgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBTb3VuZENvbnN0YW50cy5XQVZFX0FSRUFfV0lEVEggKiAyLCA0LCB7XHJcbiAgICAgIGZpbGw6ICcjZjNkOTliJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDFcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJlZmxlY3Rvci5zZXRZKCBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0hLm1vZGVsVG9WaWV3WSggU291bmRDb25zdGFudHMuV0FWRV9BUkVBX1dJRFRIICkgKTtcclxuXHJcbiAgICBtb2RlbC53YWxsQW5nbGVQcm9wZXJ0eS5saW5rKCBwcm9wID0+IHtcclxuICAgICAgdGhpcy5yZWZsZWN0b3Iuc2V0Um90YXRpb24oIC1wcm9wICk7XHJcbiAgICAgIHRoaXMuY2FudmFzTm9kZS5zZXRXYWxsQW5nbGUoIHByb3AgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJlZmxlY3RvckNvbnRhaW5lciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLnJlZmxlY3RvckNvbnRhaW5lci5hZGRDaGlsZCggdGhpcy5yZWZsZWN0b3IgKTtcclxuICAgIHRoaXMucmVmbGVjdG9yQ29udGFpbmVyLnNldENsaXBBcmVhKCBTaGFwZS5yZWN0KCBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0hLm1vZGVsVG9WaWV3WCggMCApLCBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0hLm1vZGVsVG9WaWV3WSggMCApLCBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0hLm1vZGVsVG9WaWV3RGVsdGFYKCBTb3VuZENvbnN0YW50cy5XQVZFX0FSRUFfV0lEVEggKSwgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtIS5tb2RlbFRvVmlld0RlbHRhWSggU291bmRDb25zdGFudHMuV0FWRV9BUkVBX1dJRFRIICkgKSApO1xyXG5cclxuICAgIG1vZGVsLndhbGxQb3NpdGlvblhQcm9wZXJ0eS5saW5rKCBwcm9wID0+IHtcclxuICAgICAgdGhpcy5yZWZsZWN0b3Iuc2V0WCggbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtIS5tb2RlbFRvVmlld1goIHByb3AgKSApO1xyXG4gICAgICB0aGlzLmNhbnZhc05vZGUuc2V0V2FsbFBvc2l0aW9uWCggbW9kZWwubW9kZWxUb0xhdHRpY2VUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBwcm9wICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJlZmxlY3RvckNvbnRhaW5lciApO1xyXG5cclxuICAgIHRoaXMucmVmbGVjdGlvbkNvbnRyb2xQYW5lbC5tdXRhdGUoIHtcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gU291bmRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9NQVJHSU4sXHJcbiAgICAgIHRvcDogdGhpcy5jb250cm9sUGFuZWwuYm90dG9tICsgU291bmRDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9TUEFDSU5HXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5yZWZsZWN0aW9uQ29udHJvbFBhbmVsICk7XHJcblxyXG4gICAgdGhpcy5zb3VuZE1vZGVDb250cm9sUGFuZWwubXV0YXRlKCB7XHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIFNvdW5kQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfTUFSR0lOLFxyXG4gICAgICB0b3A6IHRoaXMucmVmbGVjdGlvbkNvbnRyb2xQYW5lbC5ib3R0b20gKyBTb3VuZENvbnN0YW50cy5DT05UUk9MX1BBTkVMX1NQQUNJTkdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnNvdW5kTW9kZUNvbnRyb2xQYW5lbCApO1xyXG4gIH1cclxufVxyXG5cclxuc291bmQucmVnaXN0ZXIoICdSZWZsZWN0aW9uVmlldycsIFJlZmxlY3Rpb25WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsNkJBQTZCO0FBQ25ELFNBQVNDLElBQUksRUFBRUMsU0FBUyxRQUFRLGdDQUFnQztBQUNoRSxPQUFPQyxjQUFjLE1BQU0sNkJBQTZCO0FBQ3hELE9BQU9DLHNCQUFzQixNQUFNLDBDQUEwQztBQUM3RSxPQUFPQyxxQkFBcUIsTUFBTSx5Q0FBeUM7QUFDM0UsT0FBT0MsS0FBSyxNQUFNLGFBQWE7QUFDL0IsT0FBT0MsZUFBZSxNQUFNLG1DQUFtQztBQUcvRCxlQUFlLE1BQU1DLGNBQWMsU0FBU0QsZUFBZSxDQUFDO0VBRTFEOztFQUdBOztFQUdBOztF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