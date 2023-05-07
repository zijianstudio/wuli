// Copyright 2014-2022, University of Colorado Boulder

/**
 * View for the 'RGB' screen
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Image, VBox } from '../../../../scenery/js/imports.js';
import flashlight0Deg_png from '../../../images/flashlight0Deg_png.js';
import flashlightNeg45Deg_png from '../../../images/flashlightNeg45Deg_png.js';
import flashlightPos45Deg_png from '../../../images/flashlightPos45Deg_png.js';
import colorVision from '../../colorVision.js';
import ColorVisionConstants from '../../common/ColorVisionConstants.js';
import ColorVisionScreenView from '../../common/view/ColorVisionScreenView.js';
import HeadNode from '../../common/view/HeadNode.js';
import RGBConstants from '../RGBConstants.js';
import RGBPhotonBeamNode from './RGBPhotonBeamNode.js';
import RGBSlider from './RGBSlider.js';

// constants
const BEAM_ANGLE = Math.PI / 6;
const FLASHLIGHT_SCALE = 0.73;
class RGBScreenView extends ColorVisionScreenView {
  /**
   * @param {RGBModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super(model, tandem);

    // Add photon beams
    // @private
    this.redBeam = new RGBPhotonBeamNode(model.redBeam, tandem.createTandem('redBeam'), {
      canvasBounds: new Bounds2(0, 0, RGBConstants.RED_BEAM_LENGTH, ColorVisionConstants.BEAM_HEIGHT),
      x: 280,
      y: 190,
      rotation: -BEAM_ANGLE
    });

    // @private
    this.greenBeam = new RGBPhotonBeamNode(model.greenBeam, tandem.createTandem('greenBeam'), {
      canvasBounds: new Bounds2(0, 0, RGBConstants.GREEN_BEAM_LENGTH, ColorVisionConstants.BEAM_HEIGHT),
      x: 320
    });
    this.greenBeam.centerY = this.layoutBounds.centerY + ColorVisionConstants.CENTER_Y_OFFSET;

    // @private
    this.blueBeam = new RGBPhotonBeamNode(model.blueBeam, tandem.createTandem('blueBeam'), {
      canvasBounds: new Bounds2(0, 0, RGBConstants.BLUE_BEAM_LENGTH, ColorVisionConstants.BEAM_HEIGHT),
      x: 320,
      y: 145,
      rotation: BEAM_ANGLE
    });

    // add head node
    const beamArray = [this.redBeam, this.blueBeam, this.greenBeam];
    const headNode = new HeadNode(model.headModeProperty, this.layoutBounds.bottom, beamArray, tandem.createTandem('headNode'));
    this.pdomControlAreaNode.addChild(headNode);

    // Add flashlights
    const redFlashlightNode = new Image(flashlightNeg45Deg_png, {
      scale: FLASHLIGHT_SCALE
    });
    const greenFlashlightNode = new Image(flashlight0Deg_png, {
      scale: FLASHLIGHT_SCALE
    });
    const blueFlashlightNode = new Image(flashlightPos45Deg_png, {
      scale: FLASHLIGHT_SCALE
    });
    const flashlightVBox = new VBox({
      children: [redFlashlightNode, greenFlashlightNode, blueFlashlightNode],
      spacing: 85,
      right: this.layoutBounds.maxX - 84,
      centerY: this.layoutBounds.centerY + ColorVisionConstants.CENTER_Y_OFFSET
    });
    this.pdomControlAreaNode.addChild(flashlightVBox);

    // Add sliders
    const redSlider = new RGBSlider(model.redIntensityProperty, 'red', tandem.createTandem('redSlider'));
    const greenSlider = new RGBSlider(model.greenIntensityProperty, 'green', tandem.createTandem('greenSlider'));
    const blueSlider = new RGBSlider(model.blueIntensityProperty, 'blue', tandem.createTandem('blueSlider'));
    const sliderVBox = new VBox({
      children: [redSlider, greenSlider, blueSlider],
      spacing: 15,
      right: this.layoutBounds.maxX - 30,
      centerY: flashlightVBox.centerY
    });
    this.pdomControlAreaNode.addChild(sliderVBox);

    // set the tab navigation order
    this.pdomControlAreaNode.pdomOrder = [sliderVBox, headNode, this.timeControlNode, this.resetAllButton];
  }

  // @public
  step(dt) {
    // Cap dt, see https://github.com/phetsims/color-vision/issues/115 and https://github.com/phetsims/joist/issues/130
    dt = Math.min(dt, 0.5);
    this.redBeam.step(dt);
    this.greenBeam.step(dt);
    this.blueBeam.step(dt);
  }
}
colorVision.register('RGBScreenView', RGBScreenView);
export default RGBScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiSW1hZ2UiLCJWQm94IiwiZmxhc2hsaWdodDBEZWdfcG5nIiwiZmxhc2hsaWdodE5lZzQ1RGVnX3BuZyIsImZsYXNobGlnaHRQb3M0NURlZ19wbmciLCJjb2xvclZpc2lvbiIsIkNvbG9yVmlzaW9uQ29uc3RhbnRzIiwiQ29sb3JWaXNpb25TY3JlZW5WaWV3IiwiSGVhZE5vZGUiLCJSR0JDb25zdGFudHMiLCJSR0JQaG90b25CZWFtTm9kZSIsIlJHQlNsaWRlciIsIkJFQU1fQU5HTEUiLCJNYXRoIiwiUEkiLCJGTEFTSExJR0hUX1NDQUxFIiwiUkdCU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJyZWRCZWFtIiwiY3JlYXRlVGFuZGVtIiwiY2FudmFzQm91bmRzIiwiUkVEX0JFQU1fTEVOR1RIIiwiQkVBTV9IRUlHSFQiLCJ4IiwieSIsInJvdGF0aW9uIiwiZ3JlZW5CZWFtIiwiR1JFRU5fQkVBTV9MRU5HVEgiLCJjZW50ZXJZIiwibGF5b3V0Qm91bmRzIiwiQ0VOVEVSX1lfT0ZGU0VUIiwiYmx1ZUJlYW0iLCJCTFVFX0JFQU1fTEVOR1RIIiwiYmVhbUFycmF5IiwiaGVhZE5vZGUiLCJoZWFkTW9kZVByb3BlcnR5IiwiYm90dG9tIiwicGRvbUNvbnRyb2xBcmVhTm9kZSIsImFkZENoaWxkIiwicmVkRmxhc2hsaWdodE5vZGUiLCJzY2FsZSIsImdyZWVuRmxhc2hsaWdodE5vZGUiLCJibHVlRmxhc2hsaWdodE5vZGUiLCJmbGFzaGxpZ2h0VkJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsInJpZ2h0IiwibWF4WCIsInJlZFNsaWRlciIsInJlZEludGVuc2l0eVByb3BlcnR5IiwiZ3JlZW5TbGlkZXIiLCJncmVlbkludGVuc2l0eVByb3BlcnR5IiwiYmx1ZVNsaWRlciIsImJsdWVJbnRlbnNpdHlQcm9wZXJ0eSIsInNsaWRlclZCb3giLCJwZG9tT3JkZXIiLCJ0aW1lQ29udHJvbE5vZGUiLCJyZXNldEFsbEJ1dHRvbiIsInN0ZXAiLCJkdCIsIm1pbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUkdCU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgJ1JHQicgc2NyZWVuXHJcbiAqXHJcbiAqIEBhdXRob3IgQWFyb24gRGF2aXMgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmbGFzaGxpZ2h0MERlZ19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2ZsYXNobGlnaHQwRGVnX3BuZy5qcyc7XHJcbmltcG9ydCBmbGFzaGxpZ2h0TmVnNDVEZWdfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9mbGFzaGxpZ2h0TmVnNDVEZWdfcG5nLmpzJztcclxuaW1wb3J0IGZsYXNobGlnaHRQb3M0NURlZ19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2ZsYXNobGlnaHRQb3M0NURlZ19wbmcuanMnO1xyXG5pbXBvcnQgY29sb3JWaXNpb24gZnJvbSAnLi4vLi4vY29sb3JWaXNpb24uanMnO1xyXG5pbXBvcnQgQ29sb3JWaXNpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0NvbG9yVmlzaW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENvbG9yVmlzaW9uU2NyZWVuVmlldyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Db2xvclZpc2lvblNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgSGVhZE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvSGVhZE5vZGUuanMnO1xyXG5pbXBvcnQgUkdCQ29uc3RhbnRzIGZyb20gJy4uL1JHQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBSR0JQaG90b25CZWFtTm9kZSBmcm9tICcuL1JHQlBob3RvbkJlYW1Ob2RlLmpzJztcclxuaW1wb3J0IFJHQlNsaWRlciBmcm9tICcuL1JHQlNsaWRlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQkVBTV9BTkdMRSA9IE1hdGguUEkgLyA2O1xyXG5jb25zdCBGTEFTSExJR0hUX1NDQUxFID0gMC43MztcclxuXHJcbmNsYXNzIFJHQlNjcmVlblZpZXcgZXh0ZW5kcyBDb2xvclZpc2lvblNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1JHQk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlciggbW9kZWwsIHRhbmRlbSApO1xyXG5cclxuICAgIC8vIEFkZCBwaG90b24gYmVhbXNcclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnJlZEJlYW0gPSBuZXcgUkdCUGhvdG9uQmVhbU5vZGUoIG1vZGVsLnJlZEJlYW0sIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWRCZWFtJyApLCB7XHJcbiAgICAgIGNhbnZhc0JvdW5kczogbmV3IEJvdW5kczIoIDAsIDAsIFJHQkNvbnN0YW50cy5SRURfQkVBTV9MRU5HVEgsIENvbG9yVmlzaW9uQ29uc3RhbnRzLkJFQU1fSEVJR0hUICksXHJcbiAgICAgIHg6IDI4MCxcclxuICAgICAgeTogMTkwLFxyXG4gICAgICByb3RhdGlvbjogLUJFQU1fQU5HTEVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5ncmVlbkJlYW0gPSBuZXcgUkdCUGhvdG9uQmVhbU5vZGUoIG1vZGVsLmdyZWVuQmVhbSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyZWVuQmVhbScgKSwge1xyXG4gICAgICBjYW52YXNCb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCBSR0JDb25zdGFudHMuR1JFRU5fQkVBTV9MRU5HVEgsIENvbG9yVmlzaW9uQ29uc3RhbnRzLkJFQU1fSEVJR0hUICksXHJcbiAgICAgIHg6IDMyMFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ncmVlbkJlYW0uY2VudGVyWSA9IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclkgKyBDb2xvclZpc2lvbkNvbnN0YW50cy5DRU5URVJfWV9PRkZTRVQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuYmx1ZUJlYW0gPSBuZXcgUkdCUGhvdG9uQmVhbU5vZGUoIG1vZGVsLmJsdWVCZWFtLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmx1ZUJlYW0nICksIHtcclxuICAgICAgY2FudmFzQm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgUkdCQ29uc3RhbnRzLkJMVUVfQkVBTV9MRU5HVEgsIENvbG9yVmlzaW9uQ29uc3RhbnRzLkJFQU1fSEVJR0hUICksXHJcbiAgICAgIHg6IDMyMCxcclxuICAgICAgeTogMTQ1LFxyXG4gICAgICByb3RhdGlvbjogQkVBTV9BTkdMRVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCBoZWFkIG5vZGVcclxuICAgIGNvbnN0IGJlYW1BcnJheSA9IFsgdGhpcy5yZWRCZWFtLCB0aGlzLmJsdWVCZWFtLCB0aGlzLmdyZWVuQmVhbSBdO1xyXG4gICAgY29uc3QgaGVhZE5vZGUgPSBuZXcgSGVhZE5vZGUoIG1vZGVsLmhlYWRNb2RlUHJvcGVydHksIHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSwgYmVhbUFycmF5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGVhZE5vZGUnICkgKTtcclxuICAgIHRoaXMucGRvbUNvbnRyb2xBcmVhTm9kZS5hZGRDaGlsZCggaGVhZE5vZGUgKTtcclxuXHJcbiAgICAvLyBBZGQgZmxhc2hsaWdodHNcclxuICAgIGNvbnN0IHJlZEZsYXNobGlnaHROb2RlID0gbmV3IEltYWdlKCBmbGFzaGxpZ2h0TmVnNDVEZWdfcG5nLCB7IHNjYWxlOiBGTEFTSExJR0hUX1NDQUxFIH0gKTtcclxuICAgIGNvbnN0IGdyZWVuRmxhc2hsaWdodE5vZGUgPSBuZXcgSW1hZ2UoIGZsYXNobGlnaHQwRGVnX3BuZywgeyBzY2FsZTogRkxBU0hMSUdIVF9TQ0FMRSB9ICk7XHJcbiAgICBjb25zdCBibHVlRmxhc2hsaWdodE5vZGUgPSBuZXcgSW1hZ2UoIGZsYXNobGlnaHRQb3M0NURlZ19wbmcsIHsgc2NhbGU6IEZMQVNITElHSFRfU0NBTEUgfSApO1xyXG5cclxuICAgIGNvbnN0IGZsYXNobGlnaHRWQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICByZWRGbGFzaGxpZ2h0Tm9kZSxcclxuICAgICAgICBncmVlbkZsYXNobGlnaHROb2RlLFxyXG4gICAgICAgIGJsdWVGbGFzaGxpZ2h0Tm9kZSBdLFxyXG4gICAgICBzcGFjaW5nOiA4NSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLm1heFggLSA4NCxcclxuICAgICAgY2VudGVyWTogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWSArIENvbG9yVmlzaW9uQ29uc3RhbnRzLkNFTlRFUl9ZX09GRlNFVFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucGRvbUNvbnRyb2xBcmVhTm9kZS5hZGRDaGlsZCggZmxhc2hsaWdodFZCb3ggKTtcclxuXHJcbiAgICAvLyBBZGQgc2xpZGVyc1xyXG4gICAgY29uc3QgcmVkU2xpZGVyID0gbmV3IFJHQlNsaWRlciggbW9kZWwucmVkSW50ZW5zaXR5UHJvcGVydHksICdyZWQnLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVkU2xpZGVyJyApICk7XHJcbiAgICBjb25zdCBncmVlblNsaWRlciA9IG5ldyBSR0JTbGlkZXIoIG1vZGVsLmdyZWVuSW50ZW5zaXR5UHJvcGVydHksICdncmVlbicsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmVlblNsaWRlcicgKSApO1xyXG4gICAgY29uc3QgYmx1ZVNsaWRlciA9IG5ldyBSR0JTbGlkZXIoIG1vZGVsLmJsdWVJbnRlbnNpdHlQcm9wZXJ0eSwgJ2JsdWUnLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmx1ZVNsaWRlcicgKSApO1xyXG5cclxuICAgIGNvbnN0IHNsaWRlclZCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHJlZFNsaWRlcixcclxuICAgICAgICBncmVlblNsaWRlcixcclxuICAgICAgICBibHVlU2xpZGVyIF0sXHJcbiAgICAgIHNwYWNpbmc6IDE1LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDMwLFxyXG4gICAgICBjZW50ZXJZOiBmbGFzaGxpZ2h0VkJveC5jZW50ZXJZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlLmFkZENoaWxkKCBzbGlkZXJWQm94ICk7XHJcblxyXG4gICAgLy8gc2V0IHRoZSB0YWIgbmF2aWdhdGlvbiBvcmRlclxyXG4gICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlLnBkb21PcmRlciA9IFtcclxuICAgICAgc2xpZGVyVkJveCxcclxuICAgICAgaGVhZE5vZGUsXHJcbiAgICAgIHRoaXMudGltZUNvbnRyb2xOb2RlLFxyXG4gICAgICB0aGlzLnJlc2V0QWxsQnV0dG9uXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgLy8gQ2FwIGR0LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbG9yLXZpc2lvbi9pc3N1ZXMvMTE1IGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzEzMFxyXG4gICAgZHQgPSBNYXRoLm1pbiggZHQsIDAuNSApO1xyXG4gICAgdGhpcy5yZWRCZWFtLnN0ZXAoIGR0ICk7XHJcbiAgICB0aGlzLmdyZWVuQmVhbS5zdGVwKCBkdCApO1xyXG4gICAgdGhpcy5ibHVlQmVhbS5zdGVwKCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxuY29sb3JWaXNpb24ucmVnaXN0ZXIoICdSR0JTY3JlZW5WaWV3JywgUkdCU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBSR0JTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9ELE9BQU9DLGtCQUFrQixNQUFNLHVDQUF1QztBQUN0RSxPQUFPQyxzQkFBc0IsTUFBTSwyQ0FBMkM7QUFDOUUsT0FBT0Msc0JBQXNCLE1BQU0sMkNBQTJDO0FBQzlFLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msb0JBQW9CLE1BQU0sc0NBQXNDO0FBQ3ZFLE9BQU9DLHFCQUFxQixNQUFNLDRDQUE0QztBQUM5RSxPQUFPQyxRQUFRLE1BQU0sK0JBQStCO0FBQ3BELE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7O0FBRXRDO0FBQ0EsTUFBTUMsVUFBVSxHQUFHQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDO0FBQzlCLE1BQU1DLGdCQUFnQixHQUFHLElBQUk7QUFFN0IsTUFBTUMsYUFBYSxTQUFTVCxxQkFBcUIsQ0FBQztFQUVoRDtBQUNGO0FBQ0E7QUFDQTtFQUNFVSxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRztJQUUzQixLQUFLLENBQUVELEtBQUssRUFBRUMsTUFBTyxDQUFDOztJQUV0QjtJQUNBO0lBQ0EsSUFBSSxDQUFDQyxPQUFPLEdBQUcsSUFBSVYsaUJBQWlCLENBQUVRLEtBQUss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