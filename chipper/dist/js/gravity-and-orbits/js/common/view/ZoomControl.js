// Copyright 2013-2022, University of Colorado Boulder

/**
 * Container for scale slider. This file is not a direct port from the Java version.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Node, Rectangle, SceneryConstants } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import VSlider from '../../../../sun/js/VSlider.js';
import gravityAndOrbits from '../../gravityAndOrbits.js';
import GravityAndOrbitsConstants from '../GravityAndOrbitsConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';

// constants
const TRACK_SIZE = new Dimension2(3, 140);
const THUMB_SIZE = new Dimension2(28, 20);
const STEP = 0.1;
const BUTTON_SIZE = 25;
class ZoomControl extends Node {
  /**
   * @param scaleProperty - Scale property for observing and updating.
   * @param tandem
   * @param [providedOptions]
   */
  constructor(scaleProperty, tandem, providedOptions) {
    const options = optionize()({
      scale: 0.8,
      tandem: tandem,
      phetioEnabledPropertyInstrumented: true,
      disabledOpacity: SceneryConstants.DISABLED_OPACITY
    }, providedOptions);
    super();
    const slider = new VSlider(scaleProperty, GravityAndOrbitsConstants.ZOOM_RANGE, {
      trackSize: TRACK_SIZE,
      thumbSize: THUMB_SIZE,
      // custom thumb colors
      thumbFill: '#98BECF',
      thumbFillHighlighted: '#B3D3E2',
      tandem: tandem.createTandem('slider'),
      phetioReadOnly: true
    });
    slider.translate(-TRACK_SIZE.height - THUMB_SIZE.height - 17, -TRACK_SIZE.width / 2);

    // add slide line
    this.addChild(slider);

    // Add buttons last so their hit areas will be in front for overlapping touch areas on touch devices

    // add plus button
    const plusButton = new SliderButton(scaleProperty, GravityAndOrbitsConstants.ZOOM_RANGE, STEP, true, {
      tandem: tandem.createTandem('plusButton')
    });
    plusButton.centerBottom = slider.centerTop;
    this.addChild(plusButton);

    // add minus button
    const minusButton = new SliderButton(scaleProperty, GravityAndOrbitsConstants.ZOOM_RANGE, STEP, false, {
      tandem: tandem.createTandem('minusButton')
    });
    minusButton.centerTop = slider.centerBottom;
    this.addChild(minusButton);
    this.mutate(options);
  }
}
gravityAndOrbits.register('ZoomControl', ZoomControl);
class SliderButton extends RectangularPushButton {
  /**
   * @param scaleProperty - Scale property for updating.
   * @param range - Working range of slider.
   * @param step step of scale changes
   * @param isIncrease flag for defining type of button
   * @param [providedOptions]
   */
  constructor(scaleProperty, range, step, isIncrease, providedOptions) {
    // create default view
    const sample = new Node({
      children: [new Rectangle(0, 0, BUTTON_SIZE, BUTTON_SIZE, 2, 2, {
        fill: '#DBD485'
      }), new Rectangle(4, BUTTON_SIZE / 2 - 1, BUTTON_SIZE - 8, 2, {
        fill: 'black'
      })]
    });

    // increase or decrease view
    if (isIncrease) {
      sample.addChild(new Rectangle(BUTTON_SIZE / 2 - 1, 4, 2, BUTTON_SIZE - 8, {
        fill: 'black'
      }));
    }
    const options = optionize()({
      content: sample,
      xMargin: 0,
      yMargin: 0,
      phetioReadOnly: true,
      listener: () => {
        scaleProperty.value = Math.max(Math.min(scaleProperty.value + (isIncrease ? step : -step), range.max), range.min);
      }
    }, providedOptions);
    super(options);

    // add disabling effect for buttons
    if (isIncrease) {
      // plus button
      scaleProperty.link(scaleValue => this.setEnabled(scaleValue !== range.max));
    } else {
      // minus button
      scaleProperty.link(scaleValue => this.setEnabled(scaleValue !== range.min));
    }

    // Increase the touch area in all directions except toward the slider knob,
    // so that they won't interfere too much on touch devices
    const dilationSize = 15;
    const dilateTop = isIncrease ? dilationSize : 0;
    const dilateBottom = isIncrease ? 0 : dilationSize;
    this.touchArea = Shape.bounds(new Bounds2(this.localBounds.minX - dilationSize, this.localBounds.minY - dilateTop, this.localBounds.maxX + dilationSize, this.localBounds.maxY + dilateBottom));
  }
}
export default ZoomControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlNoYXBlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlNjZW5lcnlDb25zdGFudHMiLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJWU2xpZGVyIiwiZ3Jhdml0eUFuZE9yYml0cyIsIkdyYXZpdHlBbmRPcmJpdHNDb25zdGFudHMiLCJvcHRpb25pemUiLCJUUkFDS19TSVpFIiwiVEhVTUJfU0laRSIsIlNURVAiLCJCVVRUT05fU0laRSIsIlpvb21Db250cm9sIiwiY29uc3RydWN0b3IiLCJzY2FsZVByb3BlcnR5IiwidGFuZGVtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNjYWxlIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiZGlzYWJsZWRPcGFjaXR5IiwiRElTQUJMRURfT1BBQ0lUWSIsInNsaWRlciIsIlpPT01fUkFOR0UiLCJ0cmFja1NpemUiLCJ0aHVtYlNpemUiLCJ0aHVtYkZpbGwiLCJ0aHVtYkZpbGxIaWdobGlnaHRlZCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwidHJhbnNsYXRlIiwiaGVpZ2h0Iiwid2lkdGgiLCJhZGRDaGlsZCIsInBsdXNCdXR0b24iLCJTbGlkZXJCdXR0b24iLCJjZW50ZXJCb3R0b20iLCJjZW50ZXJUb3AiLCJtaW51c0J1dHRvbiIsIm11dGF0ZSIsInJlZ2lzdGVyIiwicmFuZ2UiLCJzdGVwIiwiaXNJbmNyZWFzZSIsInNhbXBsZSIsImNoaWxkcmVuIiwiZmlsbCIsImNvbnRlbnQiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImxpc3RlbmVyIiwidmFsdWUiLCJNYXRoIiwibWF4IiwibWluIiwibGluayIsInNjYWxlVmFsdWUiLCJzZXRFbmFibGVkIiwiZGlsYXRpb25TaXplIiwiZGlsYXRlVG9wIiwiZGlsYXRlQm90dG9tIiwidG91Y2hBcmVhIiwiYm91bmRzIiwibG9jYWxCb3VuZHMiLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIl0sInNvdXJjZXMiOlsiWm9vbUNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udGFpbmVyIGZvciBzY2FsZSBzbGlkZXIuIFRoaXMgZmlsZSBpcyBub3QgYSBkaXJlY3QgcG9ydCBmcm9tIHRoZSBKYXZhIHZlcnNpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlLCBTY2VuZXJ5Q29uc3RhbnRzIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiwgeyBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFZTbGlkZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1ZTbGlkZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgZ3Jhdml0eUFuZE9yYml0cyBmcm9tICcuLi8uLi9ncmF2aXR5QW5kT3JiaXRzLmpzJztcclxuaW1wb3J0IEdyYXZpdHlBbmRPcmJpdHNDb25zdGFudHMgZnJvbSAnLi4vR3Jhdml0eUFuZE9yYml0c0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRSQUNLX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMywgMTQwICk7XHJcbmNvbnN0IFRIVU1CX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMjgsIDIwICk7XHJcbmNvbnN0IFNURVAgPSAwLjE7XHJcbmNvbnN0IEJVVFRPTl9TSVpFID0gMjU7XHJcblxyXG50eXBlIFpvb21Db250cm9sT3B0aW9ucyA9IE5vZGVPcHRpb25zO1xyXG5cclxuY2xhc3MgWm9vbUNvbnRyb2wgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHNjYWxlUHJvcGVydHkgLSBTY2FsZSBwcm9wZXJ0eSBmb3Igb2JzZXJ2aW5nIGFuZCB1cGRhdGluZy5cclxuICAgKiBAcGFyYW0gdGFuZGVtXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY2FsZVByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+LCB0YW5kZW06IFRhbmRlbSwgcHJvdmlkZWRPcHRpb25zPzogWm9vbUNvbnRyb2xPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Wm9vbUNvbnRyb2xPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICBzY2FsZTogMC44LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLFxyXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCBzbGlkZXIgPSBuZXcgVlNsaWRlciggc2NhbGVQcm9wZXJ0eSwgR3Jhdml0eUFuZE9yYml0c0NvbnN0YW50cy5aT09NX1JBTkdFLCB7XHJcbiAgICAgIHRyYWNrU2l6ZTogVFJBQ0tfU0laRSxcclxuICAgICAgdGh1bWJTaXplOiBUSFVNQl9TSVpFLFxyXG5cclxuICAgICAgLy8gY3VzdG9tIHRodW1iIGNvbG9yc1xyXG4gICAgICB0aHVtYkZpbGw6ICcjOThCRUNGJyxcclxuICAgICAgdGh1bWJGaWxsSGlnaGxpZ2h0ZWQ6ICcjQjNEM0UyJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2xpZGVyJyApLFxyXG5cclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICBzbGlkZXIudHJhbnNsYXRlKCAtVFJBQ0tfU0laRS5oZWlnaHQgLSBUSFVNQl9TSVpFLmhlaWdodCAtIDE3LCAtVFJBQ0tfU0laRS53aWR0aCAvIDIgKTtcclxuXHJcbiAgICAvLyBhZGQgc2xpZGUgbGluZVxyXG4gICAgdGhpcy5hZGRDaGlsZCggc2xpZGVyICk7XHJcblxyXG4gICAgLy8gQWRkIGJ1dHRvbnMgbGFzdCBzbyB0aGVpciBoaXQgYXJlYXMgd2lsbCBiZSBpbiBmcm9udCBmb3Igb3ZlcmxhcHBpbmcgdG91Y2ggYXJlYXMgb24gdG91Y2ggZGV2aWNlc1xyXG5cclxuICAgIC8vIGFkZCBwbHVzIGJ1dHRvblxyXG4gICAgY29uc3QgcGx1c0J1dHRvbiA9IG5ldyBTbGlkZXJCdXR0b24oIHNjYWxlUHJvcGVydHksIEdyYXZpdHlBbmRPcmJpdHNDb25zdGFudHMuWk9PTV9SQU5HRSwgU1RFUCwgdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbHVzQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcbiAgICBwbHVzQnV0dG9uLmNlbnRlckJvdHRvbSA9IHNsaWRlci5jZW50ZXJUb3A7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwbHVzQnV0dG9uICk7XHJcblxyXG4gICAgLy8gYWRkIG1pbnVzIGJ1dHRvblxyXG4gICAgY29uc3QgbWludXNCdXR0b24gPSBuZXcgU2xpZGVyQnV0dG9uKCBzY2FsZVByb3BlcnR5LCBHcmF2aXR5QW5kT3JiaXRzQ29uc3RhbnRzLlpPT01fUkFOR0UsIFNURVAsIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21pbnVzQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcbiAgICBtaW51c0J1dHRvbi5jZW50ZXJUb3AgPSBzbGlkZXIuY2VudGVyQm90dG9tO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbWludXNCdXR0b24gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUFuZE9yYml0cy5yZWdpc3RlciggJ1pvb21Db250cm9sJywgWm9vbUNvbnRyb2wgKTtcclxuXHJcbmNsYXNzIFNsaWRlckJ1dHRvbiBleHRlbmRzIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHNjYWxlUHJvcGVydHkgLSBTY2FsZSBwcm9wZXJ0eSBmb3IgdXBkYXRpbmcuXHJcbiAgICogQHBhcmFtIHJhbmdlIC0gV29ya2luZyByYW5nZSBvZiBzbGlkZXIuXHJcbiAgICogQHBhcmFtIHN0ZXAgc3RlcCBvZiBzY2FsZSBjaGFuZ2VzXHJcbiAgICogQHBhcmFtIGlzSW5jcmVhc2UgZmxhZyBmb3IgZGVmaW5pbmcgdHlwZSBvZiBidXR0b25cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNjYWxlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIHJhbmdlOiBSYW5nZSwgc3RlcDogbnVtYmVyLCBpc0luY3JlYXNlOiBib29sZWFuLCBwcm92aWRlZE9wdGlvbnM/OiBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zICkge1xyXG5cclxuICAgIC8vIGNyZWF0ZSBkZWZhdWx0IHZpZXdcclxuICAgIGNvbnN0IHNhbXBsZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgQlVUVE9OX1NJWkUsIEJVVFRPTl9TSVpFLCAyLCAyLCB7IGZpbGw6ICcjREJENDg1JyB9ICksXHJcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggNCwgQlVUVE9OX1NJWkUgLyAyIC0gMSwgQlVUVE9OX1NJWkUgLSA4LCAyLCB7IGZpbGw6ICdibGFjaycgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIFxyXG4gICAgLy8gaW5jcmVhc2Ugb3IgZGVjcmVhc2Ugdmlld1xyXG4gICAgaWYgKCBpc0luY3JlYXNlICkge1xyXG4gICAgICBzYW1wbGUuYWRkQ2hpbGQoIG5ldyBSZWN0YW5nbGUoIEJVVFRPTl9TSVpFIC8gMiAtIDEsIDQsIDIsIEJVVFRPTl9TSVpFIC0gOCwgeyBmaWxsOiAnYmxhY2snIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucz4oKSgge1xyXG4gICAgICBjb250ZW50OiBzYW1wbGUsXHJcbiAgICAgIHhNYXJnaW46IDAsXHJcbiAgICAgIHlNYXJnaW46IDAsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHNjYWxlUHJvcGVydHkudmFsdWUgPSBNYXRoLm1heChcclxuICAgICAgICAgIE1hdGgubWluKCBzY2FsZVByb3BlcnR5LnZhbHVlICsgKCBpc0luY3JlYXNlID8gc3RlcCA6IC1zdGVwICksIHJhbmdlLm1heCApLFxyXG4gICAgICAgICAgcmFuZ2UubWluICk7XHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gYWRkIGRpc2FibGluZyBlZmZlY3QgZm9yIGJ1dHRvbnNcclxuICAgIGlmICggaXNJbmNyZWFzZSApIHtcclxuXHJcbiAgICAgIC8vIHBsdXMgYnV0dG9uXHJcbiAgICAgIHNjYWxlUHJvcGVydHkubGluayggc2NhbGVWYWx1ZSA9PiB0aGlzLnNldEVuYWJsZWQoIHNjYWxlVmFsdWUgIT09IHJhbmdlLm1heCApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIG1pbnVzIGJ1dHRvblxyXG4gICAgICBzY2FsZVByb3BlcnR5LmxpbmsoIHNjYWxlVmFsdWUgPT4gdGhpcy5zZXRFbmFibGVkKCBzY2FsZVZhbHVlICE9PSByYW5nZS5taW4gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEluY3JlYXNlIHRoZSB0b3VjaCBhcmVhIGluIGFsbCBkaXJlY3Rpb25zIGV4Y2VwdCB0b3dhcmQgdGhlIHNsaWRlciBrbm9iLFxyXG4gICAgLy8gc28gdGhhdCB0aGV5IHdvbid0IGludGVyZmVyZSB0b28gbXVjaCBvbiB0b3VjaCBkZXZpY2VzXHJcbiAgICBjb25zdCBkaWxhdGlvblNpemUgPSAxNTtcclxuICAgIGNvbnN0IGRpbGF0ZVRvcCA9ICggaXNJbmNyZWFzZSApID8gZGlsYXRpb25TaXplIDogMDtcclxuICAgIGNvbnN0IGRpbGF0ZUJvdHRvbSA9ICggaXNJbmNyZWFzZSApID8gMCA6IGRpbGF0aW9uU2l6ZTtcclxuICAgIHRoaXMudG91Y2hBcmVhID0gU2hhcGUuYm91bmRzKCBuZXcgQm91bmRzMihcclxuICAgICAgdGhpcy5sb2NhbEJvdW5kcy5taW5YIC0gZGlsYXRpb25TaXplLFxyXG4gICAgICB0aGlzLmxvY2FsQm91bmRzLm1pblkgLSBkaWxhdGVUb3AsXHJcbiAgICAgIHRoaXMubG9jYWxCb3VuZHMubWF4WCArIGRpbGF0aW9uU2l6ZSxcclxuICAgICAgdGhpcy5sb2NhbEJvdW5kcy5tYXhZICsgZGlsYXRlQm90dG9tICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFpvb21Db250cm9sOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFFbkQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELFNBQVNDLElBQUksRUFBZUMsU0FBUyxFQUFFQyxnQkFBZ0IsUUFBUSxtQ0FBbUM7QUFDbEcsT0FBT0MscUJBQXFCLE1BQXdDLHFEQUFxRDtBQUN6SCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBRW5ELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFDdkUsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7O0FBRW5GO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUlWLFVBQVUsQ0FBRSxDQUFDLEVBQUUsR0FBSSxDQUFDO0FBQzNDLE1BQU1XLFVBQVUsR0FBRyxJQUFJWCxVQUFVLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQztBQUMzQyxNQUFNWSxJQUFJLEdBQUcsR0FBRztBQUNoQixNQUFNQyxXQUFXLEdBQUcsRUFBRTtBQUl0QixNQUFNQyxXQUFXLFNBQVNaLElBQUksQ0FBQztFQUU3QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NhLFdBQVdBLENBQUVDLGFBQStCLEVBQUVDLE1BQWMsRUFB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