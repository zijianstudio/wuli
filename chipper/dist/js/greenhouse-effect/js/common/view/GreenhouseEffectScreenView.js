// Copyright 2021-2023, University of Colorado Boulder

/**
 * The base ScreenView for Greenhouse Effect, views for individual screens will extend this.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Path, VBox } from '../../../../scenery/js/imports.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectColors from '../GreenhouseEffectColors.js';
import GreenhouseEffectConstants from '../GreenhouseEffectConstants.js';
import EnergyLegend from './EnergyLegend.js';
const FRAME_WIDTH = 12; // in screen coords, empirically determined to do the job

class GreenhouseEffectScreenView extends ScreenView {
  /**
   * @param model
   * @param observationWindow
   * @param timeControlNode - The TimeControlNode may have screen specific functionality.
   *                                            TODO: The first three screens all use the same TimeControlNode as well
   *                                            as other components. Perhaps we need to have a subclass for these
   *                                            instead of providing the component with composition.
   * @param [providedOptions]
   */
  constructor(model, observationWindow, timeControlNode, providedOptions) {
    const options = optionize()({
      useClippingFrame: false,
      energyLegendOptions: {},
      observationWindowOptions: {}
    }, providedOptions);
    if (options.energyLegendOptions) {
      assert && assert(!options.energyLegendOptions.tandem, 'EnergyLegend Tandem is set by GreenhouseEffectScreenView');
    }
    super(options);

    // model instance that will be displayed in this view
    this.model = model;

    // Add the observation window to the view.  This is generally provided by the subclass.
    this.observationWindow = observationWindow;
    this.addChild(this.observationWindow);

    // In some cases, the rendering in the observation window can't be clipped using a clip area.  As of this writing,
    // the primary case where this occurs is when rendering photons, since they use WebGL.  In those cases, a frame can
    // be added around the observation window.  When this frame matches the background color of the screen view, the
    // contents of the window stays within its bounds.
    if (options.useClippingFrame) {
      const observationWindowBounds = this.observationWindow.getBounds();
      const clippingFramePath = Shape.bounds(observationWindowBounds.dilated(FRAME_WIDTH));
      clippingFramePath.moveTo(observationWindowBounds.minX, observationWindowBounds.minY);
      clippingFramePath.lineTo(observationWindowBounds.minX, observationWindowBounds.maxY);
      clippingFramePath.lineTo(observationWindowBounds.maxX, observationWindowBounds.maxY);
      clippingFramePath.lineTo(observationWindowBounds.maxX, observationWindowBounds.minY);
      clippingFramePath.close();
      const clippingFrame = new Path(clippingFramePath, {
        fill: GreenhouseEffectColors.screenBackgroundColorProperty
      });
      this.addChild(clippingFrame);
    }

    // area between right edge of ScreenView and observation window
    const rightWidth = this.layoutBounds.right - GreenhouseEffectConstants.SCREEN_VIEW_X_MARGIN - this.observationWindow.right - GreenhouseEffectConstants.OBSERVATION_WINDOW_RIGHT_SPACING;

    // energy legend, accessible in subtypes for layout purposes
    this.energyLegend = new EnergyLegend(rightWidth, combineOptions({
      tandem: options.tandem.createTandem('energyLegend')
    }, options.energyLegendOptions));

    // The parent node on the right side of the view where legends and controls are placed.  A VBox
    // is used to support dynamic layout in conjunction with phet-io.
    this.legendAndControlsVBox = new VBox({
      children: [this.energyLegend],
      align: 'left',
      spacing: 10
    });
    this.addChild(this.legendAndControlsVBox);
    this.timeControlNode = timeControlNode;
    this.addChild(this.timeControlNode);
    this.resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        this.reset();
      },
      right: this.layoutBounds.maxX - GreenhouseEffectConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - GreenhouseEffectConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem('resetAllButton')
    });
    this.addChild(this.resetAllButton);

    // layout code
    // height of area between bottom of the screen view and bottom of the observation window
    const bottomHeight = this.layoutBounds.height - this.observationWindow.bottom;

    // Several controls have layout relative to the TimeControlNode.
    this.timeControlNode.center = new Vector2(this.observationWindow.centerX, this.observationWindow.bottom + bottomHeight / 2);

    // The legends and controls are to the right of the observation window.
    this.legendAndControlsVBox.leftTop = this.observationWindow.rightTop.plusXY(GreenhouseEffectConstants.OBSERVATION_WINDOW_RIGHT_SPACING, 0);

    // Position the Reset All button.
    this.resetAllButton.right = this.layoutBounds.maxX - GreenhouseEffectConstants.SCREEN_VIEW_X_MARGIN;
    this.resetAllButton.centerY = this.timeControlNode.centerY;

    // Update the view then the model gets stepped.  This is needed because the observation windows may contain nodes
    // that need to be updated on model changes that don't have Property-based notifications of state changes.
    model.steppedEmitter.addListener(dt => {
      this.observationWindow.step(dt);
    });

    // pdom - order and assign components to their sections in the PDOM, for default components but can
    // be overridden by subtypes
    this.pdomPlayAreaNode.pdomOrder = [this.energyLegend, this.observationWindow];
    this.pdomControlAreaNode.pdomOrder = [this.timeControlNode, this.resetAllButton];
  }
  step(dt) {
    this.observationWindow.stepAlerters(dt);
  }

  /**
   * Resets view components.
   */
  reset() {
    // The order here is important - the model must be reset before the observation window.
    this.model.reset();
    this.observationWindow.reset();
  }
}
greenhouseEffect.register('GreenhouseEffectScreenView', GreenhouseEffectScreenView);
export default GreenhouseEffectScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIlNoYXBlIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJSZXNldEFsbEJ1dHRvbiIsIlBhdGgiLCJWQm94IiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkdyZWVuaG91c2VFZmZlY3RDb2xvcnMiLCJHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzIiwiRW5lcmd5TGVnZW5kIiwiRlJBTUVfV0lEVEgiLCJHcmVlbmhvdXNlRWZmZWN0U2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJvYnNlcnZhdGlvbldpbmRvdyIsInRpbWVDb250cm9sTm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ1c2VDbGlwcGluZ0ZyYW1lIiwiZW5lcmd5TGVnZW5kT3B0aW9ucyIsIm9ic2VydmF0aW9uV2luZG93T3B0aW9ucyIsImFzc2VydCIsInRhbmRlbSIsImFkZENoaWxkIiwib2JzZXJ2YXRpb25XaW5kb3dCb3VuZHMiLCJnZXRCb3VuZHMiLCJjbGlwcGluZ0ZyYW1lUGF0aCIsImJvdW5kcyIsImRpbGF0ZWQiLCJtb3ZlVG8iLCJtaW5YIiwibWluWSIsImxpbmVUbyIsIm1heFkiLCJtYXhYIiwiY2xvc2UiLCJjbGlwcGluZ0ZyYW1lIiwiZmlsbCIsInNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5IiwicmlnaHRXaWR0aCIsImxheW91dEJvdW5kcyIsInJpZ2h0IiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJPQlNFUlZBVElPTl9XSU5ET1dfUklHSFRfU1BBQ0lORyIsImVuZXJneUxlZ2VuZCIsImNyZWF0ZVRhbmRlbSIsImxlZ2VuZEFuZENvbnRyb2xzVkJveCIsImNoaWxkcmVuIiwiYWxpZ24iLCJzcGFjaW5nIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInJlc2V0IiwiYm90dG9tIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJib3R0b21IZWlnaHQiLCJoZWlnaHQiLCJjZW50ZXIiLCJjZW50ZXJYIiwibGVmdFRvcCIsInJpZ2h0VG9wIiwicGx1c1hZIiwiY2VudGVyWSIsInN0ZXBwZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkdCIsInN0ZXAiLCJwZG9tUGxheUFyZWFOb2RlIiwicGRvbU9yZGVyIiwicGRvbUNvbnRyb2xBcmVhTm9kZSIsInN0ZXBBbGVydGVycyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JlZW5ob3VzZUVmZmVjdFNjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIGJhc2UgU2NyZWVuVmlldyBmb3IgR3JlZW5ob3VzZSBFZmZlY3QsIHZpZXdzIGZvciBpbmRpdmlkdWFsIHNjcmVlbnMgd2lsbCBleHRlbmQgdGhpcy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldywgeyBTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IHsgUGF0aCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbG9ycyBmcm9tICcuLi9HcmVlbmhvdXNlRWZmZWN0Q29sb3JzLmpzJztcclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMgZnJvbSAnLi4vR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0TW9kZWwgZnJvbSAnLi4vbW9kZWwvR3JlZW5ob3VzZUVmZmVjdE1vZGVsLmpzJztcclxuaW1wb3J0IEVuZXJneUxlZ2VuZCwgeyBFbmVyZ3lMZWdlbmRPcHRpb25zIH0gZnJvbSAnLi9FbmVyZ3lMZWdlbmQuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93LCB7IEdyZWVuaG91c2VFZmZlY3RPYnNlcnZhdGlvbldpbmRvd09wdGlvbnMgfSBmcm9tICcuL0dyZWVuaG91c2VFZmZlY3RPYnNlcnZhdGlvbldpbmRvdy5qcyc7XHJcblxyXG5jb25zdCBGUkFNRV9XSURUSCA9IDEyOyAvLyBpbiBzY3JlZW4gY29vcmRzLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGRvIHRoZSBqb2JcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIGNvbnRyb2xzIHdoZXRoZXIgdG8gcHV0IHRoZSBjbGlwcGluZyBmcmFtZSBhcm91bmQgdGhlIG9ic2VydmF0aW9uIHdpbmRvd1xyXG4gIHVzZUNsaXBwaW5nRnJhbWU/OiBib29sZWFuO1xyXG5cclxuICAvLyBwYXNzZWQgYWxvbmcgdG8gdGhlIEVuZXJneUxlZ2VuZFxyXG4gIGVuZXJneUxlZ2VuZE9wdGlvbnM/OiBFbmVyZ3lMZWdlbmRPcHRpb25zO1xyXG5cclxuICAvLyBvcHRpb25zIHBhc3NlZCB0byB0aGUgR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93XHJcbiAgb2JzZXJ2YXRpb25XaW5kb3dPcHRpb25zPzogR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93T3B0aW9ucztcclxufTtcclxuZXhwb3J0IHR5cGUgR3JlZW5ob3VzZUVmZmVjdFNjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTY3JlZW5WaWV3T3B0aW9ucztcclxuXHJcbmNsYXNzIEdyZWVuaG91c2VFZmZlY3RTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IG1vZGVsOiBHcmVlbmhvdXNlRWZmZWN0TW9kZWw7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IG9ic2VydmF0aW9uV2luZG93OiBHcmVlbmhvdXNlRWZmZWN0T2JzZXJ2YXRpb25XaW5kb3c7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGVuZXJneUxlZ2VuZDogRW5lcmd5TGVnZW5kO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSBsZWdlbmRBbmRDb250cm9sc1ZCb3g6IFZCb3g7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHRpbWVDb250cm9sTm9kZTogVGltZUNvbnRyb2xOb2RlO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSByZXNldEFsbEJ1dHRvbjogUmVzZXRBbGxCdXR0b247XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBtb2RlbFxyXG4gICAqIEBwYXJhbSBvYnNlcnZhdGlvbldpbmRvd1xyXG4gICAqIEBwYXJhbSB0aW1lQ29udHJvbE5vZGUgLSBUaGUgVGltZUNvbnRyb2xOb2RlIG1heSBoYXZlIHNjcmVlbiBzcGVjaWZpYyBmdW5jdGlvbmFsaXR5LlxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUT0RPOiBUaGUgZmlyc3QgdGhyZWUgc2NyZWVucyBhbGwgdXNlIHRoZSBzYW1lIFRpbWVDb250cm9sTm9kZSBhcyB3ZWxsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG90aGVyIGNvbXBvbmVudHMuIFBlcmhhcHMgd2UgbmVlZCB0byBoYXZlIGEgc3ViY2xhc3MgZm9yIHRoZXNlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RlYWQgb2YgcHJvdmlkaW5nIHRoZSBjb21wb25lbnQgd2l0aCBjb21wb3NpdGlvbi5cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBHcmVlbmhvdXNlRWZmZWN0TW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZhdGlvbldpbmRvdzogR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGltZUNvbnRyb2xOb2RlOiBUaW1lQ29udHJvbE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBHcmVlbmhvdXNlRWZmZWN0U2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHcmVlbmhvdXNlRWZmZWN0U2NyZWVuVmlld09wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5WaWV3T3B0aW9ucz4oKSgge1xyXG4gICAgICB1c2VDbGlwcGluZ0ZyYW1lOiBmYWxzZSxcclxuICAgICAgZW5lcmd5TGVnZW5kT3B0aW9uczoge30sXHJcbiAgICAgIG9ic2VydmF0aW9uV2luZG93T3B0aW9uczoge31cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5lbmVyZ3lMZWdlbmRPcHRpb25zICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5lbmVyZ3lMZWdlbmRPcHRpb25zLnRhbmRlbSwgJ0VuZXJneUxlZ2VuZCBUYW5kZW0gaXMgc2V0IGJ5IEdyZWVuaG91c2VFZmZlY3RTY3JlZW5WaWV3JyApO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gbW9kZWwgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGlzIHZpZXdcclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICAvLyBBZGQgdGhlIG9ic2VydmF0aW9uIHdpbmRvdyB0byB0aGUgdmlldy4gIFRoaXMgaXMgZ2VuZXJhbGx5IHByb3ZpZGVkIGJ5IHRoZSBzdWJjbGFzcy5cclxuICAgIHRoaXMub2JzZXJ2YXRpb25XaW5kb3cgPSBvYnNlcnZhdGlvbldpbmRvdztcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMub2JzZXJ2YXRpb25XaW5kb3cgKTtcclxuXHJcbiAgICAvLyBJbiBzb21lIGNhc2VzLCB0aGUgcmVuZGVyaW5nIGluIHRoZSBvYnNlcnZhdGlvbiB3aW5kb3cgY2FuJ3QgYmUgY2xpcHBlZCB1c2luZyBhIGNsaXAgYXJlYS4gIEFzIG9mIHRoaXMgd3JpdGluZyxcclxuICAgIC8vIHRoZSBwcmltYXJ5IGNhc2Ugd2hlcmUgdGhpcyBvY2N1cnMgaXMgd2hlbiByZW5kZXJpbmcgcGhvdG9ucywgc2luY2UgdGhleSB1c2UgV2ViR0wuICBJbiB0aG9zZSBjYXNlcywgYSBmcmFtZSBjYW5cclxuICAgIC8vIGJlIGFkZGVkIGFyb3VuZCB0aGUgb2JzZXJ2YXRpb24gd2luZG93LiAgV2hlbiB0aGlzIGZyYW1lIG1hdGNoZXMgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIHNjcmVlbiB2aWV3LCB0aGVcclxuICAgIC8vIGNvbnRlbnRzIG9mIHRoZSB3aW5kb3cgc3RheXMgd2l0aGluIGl0cyBib3VuZHMuXHJcbiAgICBpZiAoIG9wdGlvbnMudXNlQ2xpcHBpbmdGcmFtZSApIHtcclxuICAgICAgY29uc3Qgb2JzZXJ2YXRpb25XaW5kb3dCb3VuZHMgPSB0aGlzLm9ic2VydmF0aW9uV2luZG93LmdldEJvdW5kcygpO1xyXG4gICAgICBjb25zdCBjbGlwcGluZ0ZyYW1lUGF0aCA9IFNoYXBlLmJvdW5kcyggb2JzZXJ2YXRpb25XaW5kb3dCb3VuZHMuZGlsYXRlZCggRlJBTUVfV0lEVEggKSApO1xyXG4gICAgICBjbGlwcGluZ0ZyYW1lUGF0aC5tb3ZlVG8oIG9ic2VydmF0aW9uV2luZG93Qm91bmRzLm1pblgsIG9ic2VydmF0aW9uV2luZG93Qm91bmRzLm1pblkgKTtcclxuICAgICAgY2xpcHBpbmdGcmFtZVBhdGgubGluZVRvKCBvYnNlcnZhdGlvbldpbmRvd0JvdW5kcy5taW5YLCBvYnNlcnZhdGlvbldpbmRvd0JvdW5kcy5tYXhZICk7XHJcbiAgICAgIGNsaXBwaW5nRnJhbWVQYXRoLmxpbmVUbyggb2JzZXJ2YXRpb25XaW5kb3dCb3VuZHMubWF4WCwgb2JzZXJ2YXRpb25XaW5kb3dCb3VuZHMubWF4WSApO1xyXG4gICAgICBjbGlwcGluZ0ZyYW1lUGF0aC5saW5lVG8oIG9ic2VydmF0aW9uV2luZG93Qm91bmRzLm1heFgsIG9ic2VydmF0aW9uV2luZG93Qm91bmRzLm1pblkgKTtcclxuICAgICAgY2xpcHBpbmdGcmFtZVBhdGguY2xvc2UoKTtcclxuXHJcbiAgICAgIGNvbnN0IGNsaXBwaW5nRnJhbWUgPSBuZXcgUGF0aCggY2xpcHBpbmdGcmFtZVBhdGgsIHtcclxuICAgICAgICBmaWxsOiBHcmVlbmhvdXNlRWZmZWN0Q29sb3JzLnNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggY2xpcHBpbmdGcmFtZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFyZWEgYmV0d2VlbiByaWdodCBlZGdlIG9mIFNjcmVlblZpZXcgYW5kIG9ic2VydmF0aW9uIHdpbmRvd1xyXG4gICAgY29uc3QgcmlnaHRXaWR0aCA9IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTiAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vYnNlcnZhdGlvbldpbmRvdy5yaWdodCAtIEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuT0JTRVJWQVRJT05fV0lORE9XX1JJR0hUX1NQQUNJTkc7XHJcblxyXG4gICAgLy8gZW5lcmd5IGxlZ2VuZCwgYWNjZXNzaWJsZSBpbiBzdWJ0eXBlcyBmb3IgbGF5b3V0IHB1cnBvc2VzXHJcbiAgICB0aGlzLmVuZXJneUxlZ2VuZCA9IG5ldyBFbmVyZ3lMZWdlbmQoIHJpZ2h0V2lkdGgsIGNvbWJpbmVPcHRpb25zPEVuZXJneUxlZ2VuZE9wdGlvbnM+KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5TGVnZW5kJyApXHJcbiAgICB9LCBvcHRpb25zLmVuZXJneUxlZ2VuZE9wdGlvbnMgKSApO1xyXG5cclxuICAgIC8vIFRoZSBwYXJlbnQgbm9kZSBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgdmlldyB3aGVyZSBsZWdlbmRzIGFuZCBjb250cm9scyBhcmUgcGxhY2VkLiAgQSBWQm94XHJcbiAgICAvLyBpcyB1c2VkIHRvIHN1cHBvcnQgZHluYW1pYyBsYXlvdXQgaW4gY29uanVuY3Rpb24gd2l0aCBwaGV0LWlvLlxyXG4gICAgdGhpcy5sZWdlbmRBbmRDb250cm9sc1ZCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyB0aGlzLmVuZXJneUxlZ2VuZCBdLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5sZWdlbmRBbmRDb250cm9sc1ZCb3ggKTtcclxuXHJcbiAgICB0aGlzLnRpbWVDb250cm9sTm9kZSA9IHRpbWVDb250cm9sTm9kZTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudGltZUNvbnRyb2xOb2RlICk7XHJcblxyXG4gICAgdGhpcy5yZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBtYXkgYmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTixcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5yZXNldEFsbEJ1dHRvbiApO1xyXG5cclxuICAgIC8vIGxheW91dCBjb2RlXHJcbiAgICAvLyBoZWlnaHQgb2YgYXJlYSBiZXR3ZWVuIGJvdHRvbSBvZiB0aGUgc2NyZWVuIHZpZXcgYW5kIGJvdHRvbSBvZiB0aGUgb2JzZXJ2YXRpb24gd2luZG93XHJcbiAgICBjb25zdCBib3R0b21IZWlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgLSB0aGlzLm9ic2VydmF0aW9uV2luZG93LmJvdHRvbTtcclxuXHJcbiAgICAvLyBTZXZlcmFsIGNvbnRyb2xzIGhhdmUgbGF5b3V0IHJlbGF0aXZlIHRvIHRoZSBUaW1lQ29udHJvbE5vZGUuXHJcbiAgICB0aGlzLnRpbWVDb250cm9sTm9kZS5jZW50ZXIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgdGhpcy5vYnNlcnZhdGlvbldpbmRvdy5jZW50ZXJYLFxyXG4gICAgICB0aGlzLm9ic2VydmF0aW9uV2luZG93LmJvdHRvbSArIGJvdHRvbUhlaWdodCAvIDJcclxuICAgICk7XHJcblxyXG4gICAgLy8gVGhlIGxlZ2VuZHMgYW5kIGNvbnRyb2xzIGFyZSB0byB0aGUgcmlnaHQgb2YgdGhlIG9ic2VydmF0aW9uIHdpbmRvdy5cclxuICAgIHRoaXMubGVnZW5kQW5kQ29udHJvbHNWQm94LmxlZnRUb3AgPSB0aGlzLm9ic2VydmF0aW9uV2luZG93LnJpZ2h0VG9wLnBsdXNYWShcclxuICAgICAgR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5PQlNFUlZBVElPTl9XSU5ET1dfUklHSFRfU1BBQ0lORyxcclxuICAgICAgMFxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiB0aGUgUmVzZXQgQWxsIGJ1dHRvbi5cclxuICAgIHRoaXMucmVzZXRBbGxCdXR0b24ucmlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTjtcclxuICAgIHRoaXMucmVzZXRBbGxCdXR0b24uY2VudGVyWSA9IHRoaXMudGltZUNvbnRyb2xOb2RlLmNlbnRlclk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSB2aWV3IHRoZW4gdGhlIG1vZGVsIGdldHMgc3RlcHBlZC4gIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgdGhlIG9ic2VydmF0aW9uIHdpbmRvd3MgbWF5IGNvbnRhaW4gbm9kZXNcclxuICAgIC8vIHRoYXQgbmVlZCB0byBiZSB1cGRhdGVkIG9uIG1vZGVsIGNoYW5nZXMgdGhhdCBkb24ndCBoYXZlIFByb3BlcnR5LWJhc2VkIG5vdGlmaWNhdGlvbnMgb2Ygc3RhdGUgY2hhbmdlcy5cclxuICAgIG1vZGVsLnN0ZXBwZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBkdCA9PiB7XHJcbiAgICAgIHRoaXMub2JzZXJ2YXRpb25XaW5kb3cuc3RlcCggZHQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwZG9tIC0gb3JkZXIgYW5kIGFzc2lnbiBjb21wb25lbnRzIHRvIHRoZWlyIHNlY3Rpb25zIGluIHRoZSBQRE9NLCBmb3IgZGVmYXVsdCBjb21wb25lbnRzIGJ1dCBjYW5cclxuICAgIC8vIGJlIG92ZXJyaWRkZW4gYnkgc3VidHlwZXNcclxuICAgIHRoaXMucGRvbVBsYXlBcmVhTm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIHRoaXMuZW5lcmd5TGVnZW5kLFxyXG4gICAgICB0aGlzLm9ic2VydmF0aW9uV2luZG93XHJcbiAgICBdO1xyXG4gICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlLnBkb21PcmRlciA9IFtcclxuICAgICAgdGhpcy50aW1lQ29udHJvbE5vZGUsXHJcbiAgICAgIHRoaXMucmVzZXRBbGxCdXR0b25cclxuICAgIF07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMub2JzZXJ2YXRpb25XaW5kb3cuc3RlcEFsZXJ0ZXJzKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHZpZXcgY29tcG9uZW50cy5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgcmVzZXQoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gVGhlIG9yZGVyIGhlcmUgaXMgaW1wb3J0YW50IC0gdGhlIG1vZGVsIG11c3QgYmUgcmVzZXQgYmVmb3JlIHRoZSBvYnNlcnZhdGlvbiB3aW5kb3cuXHJcbiAgICB0aGlzLm1vZGVsLnJlc2V0KCk7XHJcbiAgICB0aGlzLm9ic2VydmF0aW9uV2luZG93LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnR3JlZW5ob3VzZUVmZmVjdFNjcmVlblZpZXcnLCBHcmVlbmhvdXNlRWZmZWN0U2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBHcmVlbmhvdXNlRWZmZWN0U2NyZWVuVmlldztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQTZCLG9DQUFvQztBQUNsRixTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUFRLHVDQUF1QztBQUNqRixPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBRWxGLFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0Msc0JBQXNCLE1BQU0sOEJBQThCO0FBQ2pFLE9BQU9DLHlCQUF5QixNQUFNLGlDQUFpQztBQUV2RSxPQUFPQyxZQUFZLE1BQStCLG1CQUFtQjtBQUdyRSxNQUFNQyxXQUFXLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBZXhCLE1BQU1DLDBCQUEwQixTQUFTWixVQUFVLENBQUM7RUFRbEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NhLFdBQVdBLENBQUVDLEtBQTRCLEVBQzVCQyxpQkFBb0QsRUFDcERDLGVBQWdDLEVBQ2hDQyxlQUFtRCxFQUFHO0lBRXhFLE1BQU1DLE9BQU8sR0FBR2hCLFNBQVMsQ0FBb0UsQ0FBQyxDQUFFO01BQzlGaUIsZ0JBQWdCLEVBQUUsS0FBSztNQUN2QkMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO01BQ3ZCQyx3QkFBd0IsRUFBRSxDQUFDO0lBQzdCLENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixJQUFLQyxPQUFPLENBQUNFLG1CQUFtQixFQUFHO01BQ2pDRSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDSixPQUFPLENBQUNFLG1CQUFtQixDQUFDRyxNQUFNLEVBQUUsMERBQTJE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