// Copyright 2022-2023, University of Colorado Boulder

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color, Image, LinearGradient, Node, Path, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import infraredPhoton_png from '../../../images/infraredPhoton_png.js';
import visiblePhoton_png from '../../../images/visiblePhoton_png.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectColors from '../GreenhouseEffectColors.js';
import GreenhouseEffectConstants from '../GreenhouseEffectConstants.js';

// constants
const HOME_ICON_WIDTH = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width;
const HOME_ICON_HEIGHT = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height;
const GROUND_HEIGHT = HOME_ICON_HEIGHT * 3 / 8;
const UPPER_SKY_COLOR = new Color('#3378C1');
const LOWER_SKY_COLOR = new Color('#B5E1F2');
const PHOTON_WIDTH = 45;
const WAVE_AMPLITUDE = 50; // in screen coordinates
const IR_WAVELENGTH = 60; // in screen coordinates
const VISIBLE_WAVELENGTH = 30; // in screen coordinates
const WAVE_LINE_WIDTH = 7;
const WAVE_LINE_CAP = 'round';
const WAVE_ALPHA = 0.5;
const LAYER_THICKNESS = HOME_ICON_HEIGHT * 0.1;
const GRASS_BASE_COLOR = new Color('#117c13');

/**
 * An object with static methods for creating the icons used in the Greenhouse Effect simulation.
 */
class GreenhouseEffectIconFactory {
  /**
   * Create the icon for the "Waves" screen, which consists of a simple landscape background and some yellow and red
   * waves that represent visible and IR light.
   */
  static createWavesHomeScreenIcon() {
    const background = GreenhouseEffectIconFactory.createGroundAndSkyBackground();

    // Create derived properties for the wave colors so that a non-opaque value can be used.
    const irWaveColorProperty = new DerivedProperty([GreenhouseEffectColors.infraredColorProperty], baseColor => baseColor?.withAlpha(WAVE_ALPHA));
    const sunlightWaveColorProperty = new DerivedProperty([GreenhouseEffectColors.sunlightColorProperty], baseColor => baseColor?.withAlpha(WAVE_ALPHA));

    // Create the wave nodes.
    const waves = [];
    waves.push(new Path(GreenhouseEffectIconFactory.createWaveShape(IR_WAVELENGTH, 4, -Math.PI * 0.65), {
      stroke: irWaveColorProperty,
      lineWidth: WAVE_LINE_WIDTH,
      lineCap: WAVE_LINE_CAP,
      left: HOME_ICON_WIDTH * 0.1,
      bottom: HOME_ICON_HEIGHT * 0.8
    }));
    waves.push(new Path(GreenhouseEffectIconFactory.createWaveShape(IR_WAVELENGTH, 3, Math.PI * 0.65), {
      stroke: irWaveColorProperty,
      lineWidth: WAVE_LINE_WIDTH,
      lineCap: WAVE_LINE_CAP,
      left: HOME_ICON_WIDTH * 0.7,
      bottom: HOME_ICON_HEIGHT * 0.8
    }));
    waves.push(new Path(GreenhouseEffectIconFactory.createWaveShape(VISIBLE_WAVELENGTH, 10, Math.PI / 2), {
      lineWidth: WAVE_LINE_WIDTH,
      stroke: sunlightWaveColorProperty,
      lineCap: WAVE_LINE_CAP,
      centerX: HOME_ICON_WIDTH / 2,
      top: 0
    }));
    const iconNode = new Node({
      children: [background, ...waves]
    });
    return new ScreenIcon(iconNode, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    });
  }

  /**
   * Create the icon for the "Photons" screen, which consists of a simple landscape background and some yellow and red
   * photons scattered about that represent visible and IR light.
   */
  static createPhotonsHomeScreenIcon() {
    // Create a background of grass and sky.
    const background = GreenhouseEffectIconFactory.createGroundAndSkyBackground();

    // Create the photons.
    const visiblePhotons = GreenhouseEffectIconFactory.createPhotonImageSet([0.15, 0.65, 0.3, 0.1, 0.5], GreenhouseEffectConstants.VISIBLE_WAVELENGTH);
    const infraredPhotons = GreenhouseEffectIconFactory.createPhotonImageSet([0.6, 0.4, 0.5, 0.3], GreenhouseEffectConstants.INFRARED_WAVELENGTH);
    const iconNode = new Node({
      children: [background, ...visiblePhotons, ...infraredPhotons]
    });
    return new ScreenIcon(iconNode, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    });
  }
  static createLayerModelHomeScreenIcon() {
    const background = GreenhouseEffectIconFactory.createGroundAndSkyBackground(new Color('#3d3635'));

    // Create the layers, which are meant to look like panes of glass seen edge on.
    const layers = [];
    const numberOfLayers = 1;
    const layerSpacing = (HOME_ICON_HEIGHT - GROUND_HEIGHT) / (numberOfLayers + 1);
    _.times(numberOfLayers, index => {
      layers.push(new Rectangle(0, 0, HOME_ICON_WIDTH, LAYER_THICKNESS, {
        fill: Color.WHITE.withAlpha(0.5),
        stroke: Color.DARK_GRAY,
        centerY: (index + 1) * layerSpacing
      }));
    });

    // Create the photons.
    const visiblePhotons = GreenhouseEffectIconFactory.createPhotonImageSet([0.2, 0.45, 0.7, 0.55, 0.1], GreenhouseEffectConstants.VISIBLE_WAVELENGTH);
    const infraredPhotons = GreenhouseEffectIconFactory.createPhotonImageSet([0.5, 0.3, 0.4, 0.65], GreenhouseEffectConstants.INFRARED_WAVELENGTH);
    const iconNode = new Node({
      children: [background, ...visiblePhotons, ...infraredPhotons, ...layers]
    });
    return new ScreenIcon(iconNode, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    });
  }
  static createMicroScreenHomeIcon() {
    return new Rectangle(0, 0, HOME_ICON_WIDTH, HOME_ICON_HEIGHT, {
      fill: Color.ORANGE
    });
  }
  static createGroundAndSkyBackground(groundBaseColor = GRASS_BASE_COLOR) {
    return new VBox({
      children: [
      // sky
      new Rectangle(0, 0, HOME_ICON_WIDTH, HOME_ICON_HEIGHT - GROUND_HEIGHT, {
        fill: new LinearGradient(0, 0, 0, HOME_ICON_HEIGHT - GROUND_HEIGHT).addColorStop(0, UPPER_SKY_COLOR).addColorStop(1, LOWER_SKY_COLOR)
      }),
      // ground
      new Rectangle(0, 0, HOME_ICON_WIDTH, GROUND_HEIGHT, {
        fill: new LinearGradient(0, 0, 0, GROUND_HEIGHT).addColorStop(0, groundBaseColor.colorUtilsBrighter(0.5)).addColorStop(1, groundBaseColor.colorUtilsDarker(0.3))
      })]
    });
  }

  /**
   * Helper function to create a wave shape.
   */
  static createWaveShape(wavelength, numberOfCycles, rotation) {
    // Create the shape from interconnected
    const waveShape = new Shape().moveTo(0, 0);
    _.times(numberOfCycles, index => {
      waveShape.cubicCurveTo((index + 1 / 3) * wavelength, WAVE_AMPLITUDE, (index + 2 / 3) * wavelength, -WAVE_AMPLITUDE, (index + 1) * wavelength, 0);
    });

    // Create a matrix to rotate the wave around its origin.
    const rotationMatrix = new Matrix3();
    rotationMatrix.setToRotationZ(rotation);
    return waveShape.transformed(rotationMatrix);
  }

  /**
   * Create a set of photons nodes given a list of proportionate Y positions.  The photons will be spaced evenly in the
   * X direction.
   */
  static createPhotonImageSet(proportionateYPositions, wavelength) {
    const photonProportionatePositions = [];
    proportionateYPositions.forEach((proportionateYPosition, index) => {
      photonProportionatePositions.push(new Vector2((index + 0.5) / proportionateYPositions.length, proportionateYPosition));
    });
    const imageSource = wavelength === GreenhouseEffectConstants.INFRARED_WAVELENGTH ? infraredPhoton_png : visiblePhoton_png;
    return photonProportionatePositions.map(proportionatePosition => {
      const photonImage = new Image(imageSource, {
        centerX: proportionatePosition.x * HOME_ICON_WIDTH,
        centerY: proportionatePosition.y * HOME_ICON_HEIGHT
      });
      photonImage.scale(PHOTON_WIDTH / photonImage.width);
      return photonImage;
    });
  }
}
greenhouseEffect.register('GreenhouseEffectIconFactory', GreenhouseEffectIconFactory);
export default GreenhouseEffectIconFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNYXRyaXgzIiwiVmVjdG9yMiIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJTaGFwZSIsIkNvbG9yIiwiSW1hZ2UiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVkJveCIsImluZnJhcmVkUGhvdG9uX3BuZyIsInZpc2libGVQaG90b25fcG5nIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkdyZWVuaG91c2VFZmZlY3RDb2xvcnMiLCJHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzIiwiSE9NRV9JQ09OX1dJRFRIIiwiTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUiLCJ3aWR0aCIsIkhPTUVfSUNPTl9IRUlHSFQiLCJoZWlnaHQiLCJHUk9VTkRfSEVJR0hUIiwiVVBQRVJfU0tZX0NPTE9SIiwiTE9XRVJfU0tZX0NPTE9SIiwiUEhPVE9OX1dJRFRIIiwiV0FWRV9BTVBMSVRVREUiLCJJUl9XQVZFTEVOR1RIIiwiVklTSUJMRV9XQVZFTEVOR1RIIiwiV0FWRV9MSU5FX1dJRFRIIiwiV0FWRV9MSU5FX0NBUCIsIldBVkVfQUxQSEEiLCJMQVlFUl9USElDS05FU1MiLCJHUkFTU19CQVNFX0NPTE9SIiwiR3JlZW5ob3VzZUVmZmVjdEljb25GYWN0b3J5IiwiY3JlYXRlV2F2ZXNIb21lU2NyZWVuSWNvbiIsImJhY2tncm91bmQiLCJjcmVhdGVHcm91bmRBbmRTa3lCYWNrZ3JvdW5kIiwiaXJXYXZlQ29sb3JQcm9wZXJ0eSIsImluZnJhcmVkQ29sb3JQcm9wZXJ0eSIsImJhc2VDb2xvciIsIndpdGhBbHBoYSIsInN1bmxpZ2h0V2F2ZUNvbG9yUHJvcGVydHkiLCJzdW5saWdodENvbG9yUHJvcGVydHkiLCJ3YXZlcyIsInB1c2giLCJjcmVhdGVXYXZlU2hhcGUiLCJNYXRoIiwiUEkiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJsaW5lQ2FwIiwibGVmdCIsImJvdHRvbSIsImNlbnRlclgiLCJ0b3AiLCJpY29uTm9kZSIsImNoaWxkcmVuIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwiY3JlYXRlUGhvdG9uc0hvbWVTY3JlZW5JY29uIiwidmlzaWJsZVBob3RvbnMiLCJjcmVhdGVQaG90b25JbWFnZVNldCIsImluZnJhcmVkUGhvdG9ucyIsIklORlJBUkVEX1dBVkVMRU5HVEgiLCJjcmVhdGVMYXllck1vZGVsSG9tZVNjcmVlbkljb24iLCJsYXllcnMiLCJudW1iZXJPZkxheWVycyIsImxheWVyU3BhY2luZyIsIl8iLCJ0aW1lcyIsImluZGV4IiwiZmlsbCIsIldISVRFIiwiREFSS19HUkFZIiwiY2VudGVyWSIsImNyZWF0ZU1pY3JvU2NyZWVuSG9tZUljb24iLCJPUkFOR0UiLCJncm91bmRCYXNlQ29sb3IiLCJhZGRDb2xvclN0b3AiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJjb2xvclV0aWxzRGFya2VyIiwid2F2ZWxlbmd0aCIsIm51bWJlck9mQ3ljbGVzIiwicm90YXRpb24iLCJ3YXZlU2hhcGUiLCJtb3ZlVG8iLCJjdWJpY0N1cnZlVG8iLCJyb3RhdGlvbk1hdHJpeCIsInNldFRvUm90YXRpb25aIiwidHJhbnNmb3JtZWQiLCJwcm9wb3J0aW9uYXRlWVBvc2l0aW9ucyIsInBob3RvblByb3BvcnRpb25hdGVQb3NpdGlvbnMiLCJmb3JFYWNoIiwicHJvcG9ydGlvbmF0ZVlQb3NpdGlvbiIsImxlbmd0aCIsImltYWdlU291cmNlIiwibWFwIiwicHJvcG9ydGlvbmF0ZVBvc2l0aW9uIiwicGhvdG9uSW1hZ2UiLCJ4IiwieSIsInNjYWxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmVlbmhvdXNlRWZmZWN0SWNvbkZhY3RvcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIEltYWdlLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGluZnJhcmVkUGhvdG9uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvaW5mcmFyZWRQaG90b25fcG5nLmpzJztcclxuaW1wb3J0IHZpc2libGVQaG90b25fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy92aXNpYmxlUGhvdG9uX3BuZy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbG9ycyBmcm9tICcuLi9HcmVlbmhvdXNlRWZmZWN0Q29sb3JzLmpzJztcclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMgZnJvbSAnLi4vR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSE9NRV9JQ09OX1dJRFRIID0gU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoO1xyXG5jb25zdCBIT01FX0lDT05fSEVJR0hUID0gU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLmhlaWdodDtcclxuY29uc3QgR1JPVU5EX0hFSUdIVCA9IEhPTUVfSUNPTl9IRUlHSFQgKiAzIC8gODtcclxuY29uc3QgVVBQRVJfU0tZX0NPTE9SID0gbmV3IENvbG9yKCAnIzMzNzhDMScgKTtcclxuY29uc3QgTE9XRVJfU0tZX0NPTE9SID0gbmV3IENvbG9yKCAnI0I1RTFGMicgKTtcclxuY29uc3QgUEhPVE9OX1dJRFRIID0gNDU7XHJcbmNvbnN0IFdBVkVfQU1QTElUVURFID0gNTA7IC8vIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG5jb25zdCBJUl9XQVZFTEVOR1RIID0gNjA7IC8vIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG5jb25zdCBWSVNJQkxFX1dBVkVMRU5HVEggPSAzMDsgLy8gaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbmNvbnN0IFdBVkVfTElORV9XSURUSCA9IDc7XHJcbmNvbnN0IFdBVkVfTElORV9DQVAgPSAncm91bmQnO1xyXG5jb25zdCBXQVZFX0FMUEhBID0gMC41O1xyXG5jb25zdCBMQVlFUl9USElDS05FU1MgPSBIT01FX0lDT05fSEVJR0hUICogMC4xO1xyXG5jb25zdCBHUkFTU19CQVNFX0NPTE9SID0gbmV3IENvbG9yKCAnIzExN2MxMycgKTtcclxuXHJcbi8qKlxyXG4gKiBBbiBvYmplY3Qgd2l0aCBzdGF0aWMgbWV0aG9kcyBmb3IgY3JlYXRpbmcgdGhlIGljb25zIHVzZWQgaW4gdGhlIEdyZWVuaG91c2UgRWZmZWN0IHNpbXVsYXRpb24uXHJcbiAqL1xyXG5jbGFzcyBHcmVlbmhvdXNlRWZmZWN0SWNvbkZhY3Rvcnkge1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIGljb24gZm9yIHRoZSBcIldhdmVzXCIgc2NyZWVuLCB3aGljaCBjb25zaXN0cyBvZiBhIHNpbXBsZSBsYW5kc2NhcGUgYmFja2dyb3VuZCBhbmQgc29tZSB5ZWxsb3cgYW5kIHJlZFxyXG4gICAqIHdhdmVzIHRoYXQgcmVwcmVzZW50IHZpc2libGUgYW5kIElSIGxpZ2h0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlV2F2ZXNIb21lU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kID0gR3JlZW5ob3VzZUVmZmVjdEljb25GYWN0b3J5LmNyZWF0ZUdyb3VuZEFuZFNreUJhY2tncm91bmQoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgZGVyaXZlZCBwcm9wZXJ0aWVzIGZvciB0aGUgd2F2ZSBjb2xvcnMgc28gdGhhdCBhIG5vbi1vcGFxdWUgdmFsdWUgY2FuIGJlIHVzZWQuXHJcbiAgICBjb25zdCBpcldhdmVDb2xvclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBHcmVlbmhvdXNlRWZmZWN0Q29sb3JzLmluZnJhcmVkQ29sb3JQcm9wZXJ0eSBdLFxyXG4gICAgICBiYXNlQ29sb3IgPT4gYmFzZUNvbG9yPy53aXRoQWxwaGEoIFdBVkVfQUxQSEEgKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IHN1bmxpZ2h0V2F2ZUNvbG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIEdyZWVuaG91c2VFZmZlY3RDb2xvcnMuc3VubGlnaHRDb2xvclByb3BlcnR5IF0sXHJcbiAgICAgIGJhc2VDb2xvciA9PiBiYXNlQ29sb3I/LndpdGhBbHBoYSggV0FWRV9BTFBIQSApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgd2F2ZSBub2Rlcy5cclxuICAgIGNvbnN0IHdhdmVzID0gW107XHJcbiAgICB3YXZlcy5wdXNoKCBuZXcgUGF0aCggR3JlZW5ob3VzZUVmZmVjdEljb25GYWN0b3J5LmNyZWF0ZVdhdmVTaGFwZSggSVJfV0FWRUxFTkdUSCwgNCwgLU1hdGguUEkgKiAwLjY1ICksIHtcclxuICAgICAgc3Ryb2tlOiBpcldhdmVDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IFdBVkVfTElORV9XSURUSCxcclxuICAgICAgbGluZUNhcDogV0FWRV9MSU5FX0NBUCxcclxuICAgICAgbGVmdDogSE9NRV9JQ09OX1dJRFRIICogMC4xLFxyXG4gICAgICBib3R0b206IEhPTUVfSUNPTl9IRUlHSFQgKiAwLjhcclxuICAgIH0gKSApO1xyXG4gICAgd2F2ZXMucHVzaCggbmV3IFBhdGgoIEdyZWVuaG91c2VFZmZlY3RJY29uRmFjdG9yeS5jcmVhdGVXYXZlU2hhcGUoIElSX1dBVkVMRU5HVEgsIDMsIE1hdGguUEkgKiAwLjY1ICksIHtcclxuICAgICAgc3Ryb2tlOiBpcldhdmVDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IFdBVkVfTElORV9XSURUSCxcclxuICAgICAgbGluZUNhcDogV0FWRV9MSU5FX0NBUCxcclxuICAgICAgbGVmdDogSE9NRV9JQ09OX1dJRFRIICogMC43LFxyXG4gICAgICBib3R0b206IEhPTUVfSUNPTl9IRUlHSFQgKiAwLjhcclxuICAgIH0gKSApO1xyXG4gICAgd2F2ZXMucHVzaCggbmV3IFBhdGgoIEdyZWVuaG91c2VFZmZlY3RJY29uRmFjdG9yeS5jcmVhdGVXYXZlU2hhcGUoIFZJU0lCTEVfV0FWRUxFTkdUSCwgMTAsIE1hdGguUEkgLyAyICksIHtcclxuICAgICAgbGluZVdpZHRoOiBXQVZFX0xJTkVfV0lEVEgsXHJcbiAgICAgIHN0cm9rZTogc3VubGlnaHRXYXZlQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgbGluZUNhcDogV0FWRV9MSU5FX0NBUCxcclxuICAgICAgY2VudGVyWDogSE9NRV9JQ09OX1dJRFRIIC8gMixcclxuICAgICAgdG9wOiAwXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGJhY2tncm91bmQsIC4uLndhdmVzIF0gfSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcclxuICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSB0aGUgaWNvbiBmb3IgdGhlIFwiUGhvdG9uc1wiIHNjcmVlbiwgd2hpY2ggY29uc2lzdHMgb2YgYSBzaW1wbGUgbGFuZHNjYXBlIGJhY2tncm91bmQgYW5kIHNvbWUgeWVsbG93IGFuZCByZWRcclxuICAgKiBwaG90b25zIHNjYXR0ZXJlZCBhYm91dCB0aGF0IHJlcHJlc2VudCB2aXNpYmxlIGFuZCBJUiBsaWdodC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZVBob3RvbnNIb21lU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBiYWNrZ3JvdW5kIG9mIGdyYXNzIGFuZCBza3kuXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kID0gR3JlZW5ob3VzZUVmZmVjdEljb25GYWN0b3J5LmNyZWF0ZUdyb3VuZEFuZFNreUJhY2tncm91bmQoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHBob3RvbnMuXHJcbiAgICBjb25zdCB2aXNpYmxlUGhvdG9ucyA9IEdyZWVuaG91c2VFZmZlY3RJY29uRmFjdG9yeS5jcmVhdGVQaG90b25JbWFnZVNldChcclxuICAgICAgWyAwLjE1LCAwLjY1LCAwLjMsIDAuMSwgMC41IF0sXHJcbiAgICAgIEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuVklTSUJMRV9XQVZFTEVOR1RIXHJcbiAgICApO1xyXG4gICAgY29uc3QgaW5mcmFyZWRQaG90b25zID0gR3JlZW5ob3VzZUVmZmVjdEljb25GYWN0b3J5LmNyZWF0ZVBob3RvbkltYWdlU2V0KFxyXG4gICAgICBbIDAuNiwgMC40LCAwLjUsIDAuMyBdLFxyXG4gICAgICBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLklORlJBUkVEX1dBVkVMRU5HVEhcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgaWNvbk5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBiYWNrZ3JvdW5kLCAuLi52aXNpYmxlUGhvdG9ucywgLi4uaW5mcmFyZWRQaG90b25zIF0gfSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcclxuICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlTGF5ZXJNb2RlbEhvbWVTY3JlZW5JY29uKCk6IFNjcmVlbkljb24ge1xyXG5cclxuICAgIGNvbnN0IGJhY2tncm91bmQgPSBHcmVlbmhvdXNlRWZmZWN0SWNvbkZhY3RvcnkuY3JlYXRlR3JvdW5kQW5kU2t5QmFja2dyb3VuZCggbmV3IENvbG9yKCAnIzNkMzYzNScgKSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbGF5ZXJzLCB3aGljaCBhcmUgbWVhbnQgdG8gbG9vayBsaWtlIHBhbmVzIG9mIGdsYXNzIHNlZW4gZWRnZSBvbi5cclxuICAgIGNvbnN0IGxheWVyczogTm9kZVtdID0gW107XHJcbiAgICBjb25zdCBudW1iZXJPZkxheWVycyA9IDE7XHJcbiAgICBjb25zdCBsYXllclNwYWNpbmcgPSAoIEhPTUVfSUNPTl9IRUlHSFQgLSBHUk9VTkRfSEVJR0hUICkgLyAoIG51bWJlck9mTGF5ZXJzICsgMSApO1xyXG4gICAgXy50aW1lcyggbnVtYmVyT2ZMYXllcnMsIGluZGV4ID0+IHtcclxuICAgICAgbGF5ZXJzLnB1c2goIG5ldyBSZWN0YW5nbGUoIDAsIDAsIEhPTUVfSUNPTl9XSURUSCwgTEFZRVJfVEhJQ0tORVNTLCB7XHJcbiAgICAgICAgZmlsbDogQ29sb3IuV0hJVEUud2l0aEFscGhhKCAwLjUgKSxcclxuICAgICAgICBzdHJva2U6IENvbG9yLkRBUktfR1JBWSxcclxuICAgICAgICBjZW50ZXJZOiAoIGluZGV4ICsgMSApICogbGF5ZXJTcGFjaW5nXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgcGhvdG9ucy5cclxuICAgIGNvbnN0IHZpc2libGVQaG90b25zID0gR3JlZW5ob3VzZUVmZmVjdEljb25GYWN0b3J5LmNyZWF0ZVBob3RvbkltYWdlU2V0KFxyXG4gICAgICBbIDAuMiwgMC40NSwgMC43LCAwLjU1LCAwLjEgXSxcclxuICAgICAgR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5WSVNJQkxFX1dBVkVMRU5HVEhcclxuICAgICk7XHJcbiAgICBjb25zdCBpbmZyYXJlZFBob3RvbnMgPSBHcmVlbmhvdXNlRWZmZWN0SWNvbkZhY3RvcnkuY3JlYXRlUGhvdG9uSW1hZ2VTZXQoXHJcbiAgICAgIFsgMC41LCAwLjMsIDAuNCwgMC42NSBdLFxyXG4gICAgICBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLklORlJBUkVEX1dBVkVMRU5HVEhcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgaWNvbk5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBiYWNrZ3JvdW5kLCAuLi52aXNpYmxlUGhvdG9ucywgLi4uaW5mcmFyZWRQaG90b25zLCAuLi5sYXllcnMgXSB9ICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBTY3JlZW5JY29uKCBpY29uTm9kZSwge1xyXG4gICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVNaWNyb1NjcmVlbkhvbWVJY29uKCk6IE5vZGUge1xyXG4gICAgcmV0dXJuIG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIDAsXHJcbiAgICAgIDAsXHJcbiAgICAgIEhPTUVfSUNPTl9XSURUSCxcclxuICAgICAgSE9NRV9JQ09OX0hFSUdIVCxcclxuICAgICAgeyBmaWxsOiBDb2xvci5PUkFOR0UgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIGNyZWF0ZUdyb3VuZEFuZFNreUJhY2tncm91bmQoIGdyb3VuZEJhc2VDb2xvcjogQ29sb3IgPSBHUkFTU19CQVNFX0NPTE9SICk6IE5vZGUge1xyXG4gICAgcmV0dXJuIG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcblxyXG4gICAgICAgIC8vIHNreVxyXG4gICAgICAgIG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgICAgICAwLFxyXG4gICAgICAgICAgMCxcclxuICAgICAgICAgIEhPTUVfSUNPTl9XSURUSCxcclxuICAgICAgICAgIEhPTUVfSUNPTl9IRUlHSFQgLSBHUk9VTkRfSEVJR0hULFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIDAsIDAsIDAsIEhPTUVfSUNPTl9IRUlHSFQgLSBHUk9VTkRfSEVJR0hUIClcclxuICAgICAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBVUFBFUl9TS1lfQ09MT1IgKVxyXG4gICAgICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDEsIExPV0VSX1NLWV9DT0xPUiApXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKSxcclxuXHJcbiAgICAgICAgLy8gZ3JvdW5kXHJcbiAgICAgICAgbmV3IFJlY3RhbmdsZShcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICAwLFxyXG4gICAgICAgICAgSE9NRV9JQ09OX1dJRFRILFxyXG4gICAgICAgICAgR1JPVU5EX0hFSUdIVCxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgZmlsbDogbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBHUk9VTkRfSEVJR0hUIClcclxuICAgICAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBncm91bmRCYXNlQ29sb3IuY29sb3JVdGlsc0JyaWdodGVyKCAwLjUgKSApXHJcbiAgICAgICAgICAgICAgLmFkZENvbG9yU3RvcCggMSwgZ3JvdW5kQmFzZUNvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIDAuMyApIClcclxuICAgICAgICAgIH1cclxuICAgICAgICApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYSB3YXZlIHNoYXBlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIGNyZWF0ZVdhdmVTaGFwZSggd2F2ZWxlbmd0aDogbnVtYmVyLCBudW1iZXJPZkN5Y2xlczogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyICk6IFNoYXBlIHtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHNoYXBlIGZyb20gaW50ZXJjb25uZWN0ZWRcclxuICAgIGNvbnN0IHdhdmVTaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApO1xyXG4gICAgXy50aW1lcyggbnVtYmVyT2ZDeWNsZXMsICggaW5kZXg6IG51bWJlciApID0+IHtcclxuICAgICAgd2F2ZVNoYXBlLmN1YmljQ3VydmVUbyhcclxuICAgICAgICAoIGluZGV4ICsgMSAvIDMgKSAqIHdhdmVsZW5ndGgsXHJcbiAgICAgICAgV0FWRV9BTVBMSVRVREUsXHJcbiAgICAgICAgKCBpbmRleCArIDIgLyAzICkgKiB3YXZlbGVuZ3RoLFxyXG4gICAgICAgIC1XQVZFX0FNUExJVFVERSxcclxuICAgICAgICAoIGluZGV4ICsgMSApICogd2F2ZWxlbmd0aCxcclxuICAgICAgICAwXHJcbiAgICAgICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgbWF0cml4IHRvIHJvdGF0ZSB0aGUgd2F2ZSBhcm91bmQgaXRzIG9yaWdpbi5cclxuICAgIGNvbnN0IHJvdGF0aW9uTWF0cml4ID0gbmV3IE1hdHJpeDMoKTtcclxuICAgIHJvdGF0aW9uTWF0cml4LnNldFRvUm90YXRpb25aKCByb3RhdGlvbiApO1xyXG5cclxuICAgIHJldHVybiB3YXZlU2hhcGUudHJhbnNmb3JtZWQoIHJvdGF0aW9uTWF0cml4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBzZXQgb2YgcGhvdG9ucyBub2RlcyBnaXZlbiBhIGxpc3Qgb2YgcHJvcG9ydGlvbmF0ZSBZIHBvc2l0aW9ucy4gIFRoZSBwaG90b25zIHdpbGwgYmUgc3BhY2VkIGV2ZW5seSBpbiB0aGVcclxuICAgKiBYIGRpcmVjdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyBjcmVhdGVQaG90b25JbWFnZVNldCggcHJvcG9ydGlvbmF0ZVlQb3NpdGlvbnM6IG51bWJlcltdLCB3YXZlbGVuZ3RoOiBudW1iZXIgKTogTm9kZVtdIHtcclxuICAgIGNvbnN0IHBob3RvblByb3BvcnRpb25hdGVQb3NpdGlvbnM6IFZlY3RvcjJbXSA9IFtdO1xyXG4gICAgcHJvcG9ydGlvbmF0ZVlQb3NpdGlvbnMuZm9yRWFjaCggKCBwcm9wb3J0aW9uYXRlWVBvc2l0aW9uLCBpbmRleCApID0+IHtcclxuICAgICAgcGhvdG9uUHJvcG9ydGlvbmF0ZVBvc2l0aW9ucy5wdXNoKCBuZXcgVmVjdG9yMihcclxuICAgICAgICAoIGluZGV4ICsgMC41ICkgLyAoIHByb3BvcnRpb25hdGVZUG9zaXRpb25zLmxlbmd0aCApLFxyXG4gICAgICAgIHByb3BvcnRpb25hdGVZUG9zaXRpb25cclxuICAgICAgKSApO1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgaW1hZ2VTb3VyY2UgPSB3YXZlbGVuZ3RoID09PSBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLklORlJBUkVEX1dBVkVMRU5HVEggP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZyYXJlZFBob3Rvbl9wbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlUGhvdG9uX3BuZztcclxuICAgIHJldHVybiBwaG90b25Qcm9wb3J0aW9uYXRlUG9zaXRpb25zLm1hcCggcHJvcG9ydGlvbmF0ZVBvc2l0aW9uID0+IHtcclxuICAgICAgICBjb25zdCBwaG90b25JbWFnZSA9IG5ldyBJbWFnZSggaW1hZ2VTb3VyY2UsIHtcclxuICAgICAgICAgIGNlbnRlclg6IHByb3BvcnRpb25hdGVQb3NpdGlvbi54ICogSE9NRV9JQ09OX1dJRFRILFxyXG4gICAgICAgICAgY2VudGVyWTogcHJvcG9ydGlvbmF0ZVBvc2l0aW9uLnkgKiBIT01FX0lDT05fSEVJR0hUXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHBob3RvbkltYWdlLnNjYWxlKCBQSE9UT05fV0lEVEggLyBwaG90b25JbWFnZS53aWR0aCApO1xyXG4gICAgICAgIHJldHVybiBwaG90b25JbWFnZTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdHcmVlbmhvdXNlRWZmZWN0SWNvbkZhY3RvcnknLCBHcmVlbmhvdXNlRWZmZWN0SWNvbkZhY3RvcnkgKTtcclxuZXhwb3J0IGRlZmF1bHQgR3JlZW5ob3VzZUVmZmVjdEljb25GYWN0b3J5O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELFNBQVNDLEtBQUssRUFBRUMsS0FBSyxFQUFFQyxjQUFjLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDN0csT0FBT0Msa0JBQWtCLE1BQU0sdUNBQXVDO0FBQ3RFLE9BQU9DLGlCQUFpQixNQUFNLHNDQUFzQztBQUNwRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0Msc0JBQXNCLE1BQU0sOEJBQThCO0FBQ2pFLE9BQU9DLHlCQUF5QixNQUFNLGlDQUFpQzs7QUFFdkU7QUFDQSxNQUFN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