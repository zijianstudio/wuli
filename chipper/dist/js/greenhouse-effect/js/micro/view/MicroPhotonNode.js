// Copyright 2021-2022, University of Colorado Boulder

/**
 * Node that represents a photon in the view.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import { Image, Node } from '../../../../scenery/js/imports.js';
import infraredPhoton_png from '../../../images/infraredPhoton_png.js';
import microwavePhoton_png from '../../../images/microwavePhoton_png.js';
import ultravioletPhoton_png from '../../../images/ultravioletPhoton_png.js';
import visiblePhoton_png from '../../../images/visiblePhoton_png.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import WavelengthConstants from '../model/WavelengthConstants.js';

// Map of photon wavelengths to visual images used for representing them.
const mapWavelengthToImageName = {};
mapWavelengthToImageName[WavelengthConstants.MICRO_WAVELENGTH] = microwavePhoton_png;
mapWavelengthToImageName[WavelengthConstants.IR_WAVELENGTH] = infraredPhoton_png;
mapWavelengthToImageName[WavelengthConstants.VISIBLE_WAVELENGTH] = visiblePhoton_png;
mapWavelengthToImageName[WavelengthConstants.UV_WAVELENGTH] = ultravioletPhoton_png;
class MicroPhotonNode extends Node {
  /**
   * Constructor for a photon node.
   *
   * @param {Photon} photon
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(photon, modelViewTransform) {
    // supertype constructor
    super();

    // Carry this node through the scope in nested functions.

    // @private
    this.photon = photon;
    this.modelViewTransform = modelViewTransform;

    // Lookup the image file that corresponds to the wavelength and add a centered image.
    assert && assert(mapWavelengthToImageName.hasOwnProperty(this.photon.wavelength));
    const photonImage = new Image(mapWavelengthToImageName[this.photon.wavelength]);
    this.addChild(photonImage);

    // Observe position changes.
    photon.positionProperty.link(position => {
      // Set overall position.
      this.center = this.modelViewTransform.modelToViewPosition(position);
    });
  }
}
greenhouseEffect.register('MicroPhotonNode', MicroPhotonNode);
export default MicroPhotonNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbWFnZSIsIk5vZGUiLCJpbmZyYXJlZFBob3Rvbl9wbmciLCJtaWNyb3dhdmVQaG90b25fcG5nIiwidWx0cmF2aW9sZXRQaG90b25fcG5nIiwidmlzaWJsZVBob3Rvbl9wbmciLCJncmVlbmhvdXNlRWZmZWN0IiwiV2F2ZWxlbmd0aENvbnN0YW50cyIsIm1hcFdhdmVsZW5ndGhUb0ltYWdlTmFtZSIsIk1JQ1JPX1dBVkVMRU5HVEgiLCJJUl9XQVZFTEVOR1RIIiwiVklTSUJMRV9XQVZFTEVOR1RIIiwiVVZfV0FWRUxFTkdUSCIsIk1pY3JvUGhvdG9uTm9kZSIsImNvbnN0cnVjdG9yIiwicGhvdG9uIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiYXNzZXJ0IiwiaGFzT3duUHJvcGVydHkiLCJ3YXZlbGVuZ3RoIiwicGhvdG9uSW1hZ2UiLCJhZGRDaGlsZCIsInBvc2l0aW9uUHJvcGVydHkiLCJsaW5rIiwicG9zaXRpb24iLCJjZW50ZXIiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNaWNyb1Bob3Rvbk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9kZSB0aGF0IHJlcHJlc2VudHMgYSBwaG90b24gaW4gdGhlIHZpZXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgeyBJbWFnZSwgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBpbmZyYXJlZFBob3Rvbl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2luZnJhcmVkUGhvdG9uX3BuZy5qcyc7XHJcbmltcG9ydCBtaWNyb3dhdmVQaG90b25fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9taWNyb3dhdmVQaG90b25fcG5nLmpzJztcclxuaW1wb3J0IHVsdHJhdmlvbGV0UGhvdG9uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvdWx0cmF2aW9sZXRQaG90b25fcG5nLmpzJztcclxuaW1wb3J0IHZpc2libGVQaG90b25fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy92aXNpYmxlUGhvdG9uX3BuZy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgV2F2ZWxlbmd0aENvbnN0YW50cyBmcm9tICcuLi9tb2RlbC9XYXZlbGVuZ3RoQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIE1hcCBvZiBwaG90b24gd2F2ZWxlbmd0aHMgdG8gdmlzdWFsIGltYWdlcyB1c2VkIGZvciByZXByZXNlbnRpbmcgdGhlbS5cclxuY29uc3QgbWFwV2F2ZWxlbmd0aFRvSW1hZ2VOYW1lID0ge307XHJcbm1hcFdhdmVsZW5ndGhUb0ltYWdlTmFtZVsgV2F2ZWxlbmd0aENvbnN0YW50cy5NSUNST19XQVZFTEVOR1RIIF0gPSBtaWNyb3dhdmVQaG90b25fcG5nO1xyXG5tYXBXYXZlbGVuZ3RoVG9JbWFnZU5hbWVbIFdhdmVsZW5ndGhDb25zdGFudHMuSVJfV0FWRUxFTkdUSCBdID0gaW5mcmFyZWRQaG90b25fcG5nO1xyXG5tYXBXYXZlbGVuZ3RoVG9JbWFnZU5hbWVbIFdhdmVsZW5ndGhDb25zdGFudHMuVklTSUJMRV9XQVZFTEVOR1RIIF0gPSB2aXNpYmxlUGhvdG9uX3BuZztcclxubWFwV2F2ZWxlbmd0aFRvSW1hZ2VOYW1lWyBXYXZlbGVuZ3RoQ29uc3RhbnRzLlVWX1dBVkVMRU5HVEggXSA9IHVsdHJhdmlvbGV0UGhvdG9uX3BuZztcclxuXHJcbmNsYXNzIE1pY3JvUGhvdG9uTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgYSBwaG90b24gbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGhvdG9ufSBwaG90b25cclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwaG90b24sIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuXHJcbiAgICAvLyBzdXBlcnR5cGUgY29uc3RydWN0b3JcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQ2FycnkgdGhpcyBub2RlIHRocm91Z2ggdGhlIHNjb3BlIGluIG5lc3RlZCBmdW5jdGlvbnMuXHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMucGhvdG9uID0gcGhvdG9uO1xyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcblxyXG4gICAgLy8gTG9va3VwIHRoZSBpbWFnZSBmaWxlIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHdhdmVsZW5ndGggYW5kIGFkZCBhIGNlbnRlcmVkIGltYWdlLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWFwV2F2ZWxlbmd0aFRvSW1hZ2VOYW1lLmhhc093blByb3BlcnR5KCB0aGlzLnBob3Rvbi53YXZlbGVuZ3RoICkgKTtcclxuICAgIGNvbnN0IHBob3RvbkltYWdlID0gbmV3IEltYWdlKCBtYXBXYXZlbGVuZ3RoVG9JbWFnZU5hbWVbIHRoaXMucGhvdG9uLndhdmVsZW5ndGggXSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBob3RvbkltYWdlICk7XHJcblxyXG4gICAgLy8gT2JzZXJ2ZSBwb3NpdGlvbiBjaGFuZ2VzLlxyXG4gICAgcGhvdG9uLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICAvLyBTZXQgb3ZlcmFsbCBwb3NpdGlvbi5cclxuICAgICAgdGhpcy5jZW50ZXIgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ01pY3JvUGhvdG9uTm9kZScsIE1pY3JvUGhvdG9uTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWljcm9QaG90b25Ob2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDL0QsT0FBT0Msa0JBQWtCLE1BQU0sdUNBQXVDO0FBQ3RFLE9BQU9DLG1CQUFtQixNQUFNLHdDQUF3QztBQUN4RSxPQUFPQyxxQkFBcUIsTUFBTSwwQ0FBMEM7QUFDNUUsT0FBT0MsaUJBQWlCLE1BQU0sc0NBQXNDO0FBQ3BFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxtQkFBbUIsTUFBTSxpQ0FBaUM7O0FBRWpFO0FBQ0EsTUFBTUMsd0JBQXdCLEdBQUcsQ0FBQyxDQUFDO0FBQ25DQSx3QkFBd0IsQ0FBRUQsbUJBQW1CLENBQUNFLGdCQUFnQixDQUFFLEdBQUdOLG1CQUFtQjtBQUN0Rkssd0JBQXdCLENBQUVELG1CQUFtQixDQUFDRyxhQUFhLENBQUUsR0FBR1Isa0JBQWtCO0FBQ2xGTSx3QkFBd0IsQ0FBRUQsbUJBQW1CLENBQUNJLGtCQUFrQixDQUFFLEdBQUdOLGlCQUFpQjtBQUN0Rkcsd0JBQXdCLENBQUVELG1CQUFtQixDQUFDSyxhQUFhLENBQUUsR0FBR1IscUJBQXFCO0FBRXJGLE1BQU1TLGVBQWUsU0FBU1osSUFBSSxDQUFDO0VBRWpDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFYSxXQUFXQSxDQUFFQyxNQUFNLEVBQUVDLGtCQUFrQixFQUFHO0lBRXhDO0lBQ0EsS0FBSyxDQUFDLENBQUM7O0lBRVA7O0lBRUE7SUFDQSxJQUFJLENBQUNELE1BQU0sR0FBR0EsTUFBTTtJQUNwQixJQUFJLENBQUNDLGtCQUFrQixHQUFHQSxrQkFBa0I7O0lBRTVDO0lBQ0FDLE1BQU0sSUFBSUEsTUFBTSxDQUFFVCx3QkFBd0IsQ0FBQ1UsY0FBYyxDQUFFLElBQUksQ0FBQ0gsTUFBTSxDQUFDSSxVQUFXLENBQUUsQ0FBQztJQUNyRixNQUFNQyxXQUFXLEdBQUcsSUFBSXBCLEtBQUssQ0FBRVEsd0JBQXdCLENBQUUsSUFBSSxDQUFDTyxNQUFNLENBQUNJLFVBQVUsQ0FBRyxDQUFDO0lBRW5GLElBQUksQ0FBQ0UsUUFBUSxDQUFFRCxXQUFZLENBQUM7O0lBRTVCO0lBQ0FMLE1BQU0sQ0FBQ08sZ0JBQWdCLENBQUNDLElBQUksQ0FBRUMsUUFBUSxJQUFJO01BQ3hDO01BQ0EsSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFDVCxrQkFBa0IsQ0FBQ1UsbUJBQW1CLENBQUVGLFFBQVMsQ0FBQztJQUN2RSxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFsQixnQkFBZ0IsQ0FBQ3FCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRWQsZUFBZ0IsQ0FBQztBQUUvRCxlQUFlQSxlQUFlIn0=