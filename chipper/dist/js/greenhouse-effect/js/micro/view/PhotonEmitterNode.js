// Copyright 2021-2022, University of Colorado Boulder

/**
 * Node that represents the photon emitter in the view.  The graphical representation of the emitter changes based on
 * wavelength of photons that the model is set to emit. This node is set up such that setting its offset on the
 * photon emission point in the model should position it correctly.  This assumes that photons are
 * emitted to the right.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Node, Text } from '../../../../scenery/js/imports.js';
import BooleanRoundStickyToggleButton from '../../../../sun/js/buttons/BooleanRoundStickyToggleButton.js';
import flashlightOff_png from '../../../images/flashlightOff_png.js';
import infraredSourceOff_png from '../../../images/infraredSourceOff_png.js';
import uvSourceOff_png from '../../../images/uvSourceOff_png.js';
import flashlight_png from '../../../mipmaps/flashlight_png.js';
import infraredSource_png from '../../../mipmaps/infraredSource_png.js';
import microwaveSource_png from '../../../mipmaps/microwaveSource_png.js';
import uvSource_png from '../../../mipmaps/uvSource_png.js';
import GreenhouseEffectQueryParameters from '../../common/GreenhouseEffectQueryParameters.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import WavelengthConstants from '../model/WavelengthConstants.js';
const lightSourceButtonLabelPatternStringProperty = GreenhouseEffectStrings.a11y.lightSource.buttonLabelPatternStringProperty;
const lightSourcePressedButtonHelpTextStringProperty = GreenhouseEffectStrings.a11y.lightSource.buttonPressedHelpTextStringProperty;
const lightSourceUnpressedButtonHelpTextStringProperty = GreenhouseEffectStrings.a11y.lightSource.buttonUnpressedHelpTextStringProperty;
const openSciEdEnergySourceStringProperty = GreenhouseEffectStrings.openSciEd.energySourceStringProperty;
class PhotonEmitterNode extends Node {
  /**
   * Constructor for the photon emitter node.
   *
   * @param {number} width - Desired width of the emitter image in screen coords.
   * @param {PhotonAbsorptionModel} model
   * @param {Tandem} tandem
   */
  constructor(width, model, tandem) {
    // supertype constructor
    super();

    // @private
    this.model = model;

    // @public (read-only) {number} height of the label requested by Open Sci Ed, will be 0 if not in that mode
    this.openSciEdLabelHeight = 0;
    if (GreenhouseEffectQueryParameters.openSciEd) {
      // add a label to the photon emitter since there is only one possible light source
      this.lightSourceLabel = new Text(openSciEdEnergySourceStringProperty, {
        font: new PhetFont(11),
        fill: 'white',
        maxWidth: 150
      });
      this.addChild(this.lightSourceLabel);
      this.openSciEdLabelHeight = this.lightSourceLabel.height;
    }

    // create the 'on' button for the emitter
    this.button = new BooleanRoundStickyToggleButton(this.model.photonEmitterOnProperty, {
      radius: 15,
      baseColor: '#33dd33',
      // pdom
      appendDescription: true,
      tandem: tandem.createTandem('button')
    });

    // pdom - this button is indicated as a 'switch' for assistive technology
    this.button.setAriaRole('switch');

    // pdom - signify button is 'pressed' when down - note this is used in addition to aria-pressed (set in the
    // supertype) as using both sounds best in NVDA
    const setAriaPressed = value => this.button.setPDOMAttribute('aria-checked', value);
    model.photonEmitterOnProperty.link(setAriaPressed);

    // update the photon emitter upon changes to the photon wavelength
    model.photonWavelengthProperty.link(photonWavelength => {
      const emitterTandemName = WavelengthConstants.getTandemName(photonWavelength);
      this.updateImage(width, photonWavelength, tandem, emitterTandemName);
    });
    model.photonEmitterOnProperty.link(on => {
      if (model.photonWavelengthProperty.get() !== WavelengthConstants.MICRO_WAVELENGTH) {
        this.photonEmitterOnImage.visible = on;
      }

      // pdom - update the help text for the emitter
      this.button.descriptionContent = on ? lightSourcePressedButtonHelpTextStringProperty.value : lightSourceUnpressedButtonHelpTextStringProperty.value;
    });
  }

  /**
   * Set the appropriate images based on the current setting for the wavelength of the emitted photons.
   * The emitter is composed of layered 'on' and an 'off' images.
   *
   * @param {number} emitterWidth
   * @param {number} photonWavelength - wavelength of emitted photon to determine if a new control slider needs to be added
   * @param {Tandem} tandem
   * @param {string} emitterTandemName
   * @private
   */
  updateImage(emitterWidth, photonWavelength, tandem, emitterTandemName) {
    // remove any existing children
    this.removeAllChildren();

    // create the wavelength dependent images and nodes
    if (photonWavelength === WavelengthConstants.IR_WAVELENGTH) {
      this.photonEmitterOnImage = new Image(infraredSource_png);
      this.photonEmitterOffImage = new Image(infraredSourceOff_png);
    } else if (photonWavelength === WavelengthConstants.VISIBLE_WAVELENGTH) {
      this.photonEmitterOnImage = new Image(flashlight_png);
      this.photonEmitterOffImage = new Image(flashlightOff_png);
    } else if (photonWavelength === WavelengthConstants.UV_WAVELENGTH) {
      this.photonEmitterOnImage = new Image(uvSource_png);
      this.photonEmitterOffImage = new Image(uvSourceOff_png);
    } else if (photonWavelength === WavelengthConstants.MICRO_WAVELENGTH) {
      this.photonEmitterOnImage = new Image(microwaveSource_png);
    }

    // scale, center - no 'off' image for microwave emitter
    if (photonWavelength !== WavelengthConstants.MICRO_WAVELENGTH) {
      this.photonEmitterOffImage.scale(emitterWidth / this.photonEmitterOffImage.width);
      this.photonEmitterOffImage.center = new Vector2(0, 0);
      this.addChild(this.photonEmitterOffImage);
      this.photonEmitterOnImage.visible = this.model.photonEmitterOnProperty.get();
    }

    // scale the on image by the desired width of the emitter and add to top
    this.photonEmitterOnImage.scale(emitterWidth / this.photonEmitterOnImage.width);
    this.photonEmitterOnImage.center = new Vector2(0, 0);
    this.addChild(this.photonEmitterOnImage);
    if (GreenhouseEffectQueryParameters.openSciEd) {
      assert && assert(this.lightSourceLabel, 'label should be defined for Open Sci Ed');
      this.addChild(this.lightSourceLabel);
      this.lightSourceLabel.centerTop = this.photonEmitterOnImage.centerBottom.plusXY(0, 5);
    }

    // pdom - update the accessible name for the button
    this.button.innerContent = StringUtils.fillIn(lightSourceButtonLabelPatternStringProperty.value, {
      lightSource: WavelengthConstants.getLightSourceName(photonWavelength)
    });

    // add the button to the correct position on the photon emitter
    this.button.left = this.photonEmitterOffImage.centerX - 20;
    this.button.centerY = this.photonEmitterOffImage.centerY;
    if (!this.hasChild(this.button)) {
      this.addChild(this.button);
    }
  }
}
greenhouseEffect.register('PhotonEmitterNode', PhotonEmitterNode);
export default PhotonEmitterNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIkltYWdlIiwiTm9kZSIsIlRleHQiLCJCb29sZWFuUm91bmRTdGlja3lUb2dnbGVCdXR0b24iLCJmbGFzaGxpZ2h0T2ZmX3BuZyIsImluZnJhcmVkU291cmNlT2ZmX3BuZyIsInV2U291cmNlT2ZmX3BuZyIsImZsYXNobGlnaHRfcG5nIiwiaW5mcmFyZWRTb3VyY2VfcG5nIiwibWljcm93YXZlU291cmNlX3BuZyIsInV2U291cmNlX3BuZyIsIkdyZWVuaG91c2VFZmZlY3RRdWVyeVBhcmFtZXRlcnMiLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MiLCJXYXZlbGVuZ3RoQ29uc3RhbnRzIiwibGlnaHRTb3VyY2VCdXR0b25MYWJlbFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJsaWdodFNvdXJjZSIsImJ1dHRvbkxhYmVsUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwibGlnaHRTb3VyY2VQcmVzc2VkQnV0dG9uSGVscFRleHRTdHJpbmdQcm9wZXJ0eSIsImJ1dHRvblByZXNzZWRIZWxwVGV4dFN0cmluZ1Byb3BlcnR5IiwibGlnaHRTb3VyY2VVbnByZXNzZWRCdXR0b25IZWxwVGV4dFN0cmluZ1Byb3BlcnR5IiwiYnV0dG9uVW5wcmVzc2VkSGVscFRleHRTdHJpbmdQcm9wZXJ0eSIsIm9wZW5TY2lFZEVuZXJneVNvdXJjZVN0cmluZ1Byb3BlcnR5Iiwib3BlblNjaUVkIiwiZW5lcmd5U291cmNlU3RyaW5nUHJvcGVydHkiLCJQaG90b25FbWl0dGVyTm9kZSIsImNvbnN0cnVjdG9yIiwid2lkdGgiLCJtb2RlbCIsInRhbmRlbSIsIm9wZW5TY2lFZExhYmVsSGVpZ2h0IiwibGlnaHRTb3VyY2VMYWJlbCIsImZvbnQiLCJmaWxsIiwibWF4V2lkdGgiLCJhZGRDaGlsZCIsImhlaWdodCIsImJ1dHRvbiIsInBob3RvbkVtaXR0ZXJPblByb3BlcnR5IiwicmFkaXVzIiwiYmFzZUNvbG9yIiwiYXBwZW5kRGVzY3JpcHRpb24iLCJjcmVhdGVUYW5kZW0iLCJzZXRBcmlhUm9sZSIsInNldEFyaWFQcmVzc2VkIiwidmFsdWUiLCJzZXRQRE9NQXR0cmlidXRlIiwibGluayIsInBob3RvbldhdmVsZW5ndGhQcm9wZXJ0eSIsInBob3RvbldhdmVsZW5ndGgiLCJlbWl0dGVyVGFuZGVtTmFtZSIsImdldFRhbmRlbU5hbWUiLCJ1cGRhdGVJbWFnZSIsIm9uIiwiZ2V0IiwiTUlDUk9fV0FWRUxFTkdUSCIsInBob3RvbkVtaXR0ZXJPbkltYWdlIiwidmlzaWJsZSIsImRlc2NyaXB0aW9uQ29udGVudCIsImVtaXR0ZXJXaWR0aCIsInJlbW92ZUFsbENoaWxkcmVuIiwiSVJfV0FWRUxFTkdUSCIsInBob3RvbkVtaXR0ZXJPZmZJbWFnZSIsIlZJU0lCTEVfV0FWRUxFTkdUSCIsIlVWX1dBVkVMRU5HVEgiLCJzY2FsZSIsImNlbnRlciIsImFzc2VydCIsImNlbnRlclRvcCIsImNlbnRlckJvdHRvbSIsInBsdXNYWSIsImlubmVyQ29udGVudCIsImZpbGxJbiIsImdldExpZ2h0U291cmNlTmFtZSIsImxlZnQiLCJjZW50ZXJYIiwiY2VudGVyWSIsImhhc0NoaWxkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQaG90b25FbWl0dGVyTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOb2RlIHRoYXQgcmVwcmVzZW50cyB0aGUgcGhvdG9uIGVtaXR0ZXIgaW4gdGhlIHZpZXcuICBUaGUgZ3JhcGhpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyIGNoYW5nZXMgYmFzZWQgb25cclxuICogd2F2ZWxlbmd0aCBvZiBwaG90b25zIHRoYXQgdGhlIG1vZGVsIGlzIHNldCB0byBlbWl0LiBUaGlzIG5vZGUgaXMgc2V0IHVwIHN1Y2ggdGhhdCBzZXR0aW5nIGl0cyBvZmZzZXQgb24gdGhlXHJcbiAqIHBob3RvbiBlbWlzc2lvbiBwb2ludCBpbiB0aGUgbW9kZWwgc2hvdWxkIHBvc2l0aW9uIGl0IGNvcnJlY3RseS4gIFRoaXMgYXNzdW1lcyB0aGF0IHBob3RvbnMgYXJlXHJcbiAqIGVtaXR0ZWQgdG8gdGhlIHJpZ2h0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Sb3VuZFN0aWNreVRvZ2dsZUJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9Cb29sZWFuUm91bmRTdGlja3lUb2dnbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgZmxhc2hsaWdodE9mZl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2ZsYXNobGlnaHRPZmZfcG5nLmpzJztcclxuaW1wb3J0IGluZnJhcmVkU291cmNlT2ZmX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvaW5mcmFyZWRTb3VyY2VPZmZfcG5nLmpzJztcclxuaW1wb3J0IHV2U291cmNlT2ZmX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvdXZTb3VyY2VPZmZfcG5nLmpzJztcclxuaW1wb3J0IGZsYXNobGlnaHRfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZmxhc2hsaWdodF9wbmcuanMnO1xyXG5pbXBvcnQgaW5mcmFyZWRTb3VyY2VfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvaW5mcmFyZWRTb3VyY2VfcG5nLmpzJztcclxuaW1wb3J0IG1pY3Jvd2F2ZVNvdXJjZV9wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9taWNyb3dhdmVTb3VyY2VfcG5nLmpzJztcclxuaW1wb3J0IHV2U291cmNlX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL3V2U291cmNlX3BuZy5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0UXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL2NvbW1vbi9HcmVlbmhvdXNlRWZmZWN0UXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyBmcm9tICcuLi8uLi9HcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBXYXZlbGVuZ3RoQ29uc3RhbnRzIGZyb20gJy4uL21vZGVsL1dhdmVsZW5ndGhDb25zdGFudHMuanMnO1xyXG5cclxuY29uc3QgbGlnaHRTb3VyY2VCdXR0b25MYWJlbFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkubGlnaHRTb3VyY2UuYnV0dG9uTGFiZWxQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGxpZ2h0U291cmNlUHJlc3NlZEJ1dHRvbkhlbHBUZXh0U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmxpZ2h0U291cmNlLmJ1dHRvblByZXNzZWRIZWxwVGV4dFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBsaWdodFNvdXJjZVVucHJlc3NlZEJ1dHRvbkhlbHBUZXh0U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmxpZ2h0U291cmNlLmJ1dHRvblVucHJlc3NlZEhlbHBUZXh0U3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG9wZW5TY2lFZEVuZXJneVNvdXJjZVN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3Mub3BlblNjaUVkLmVuZXJneVNvdXJjZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuY2xhc3MgUGhvdG9uRW1pdHRlck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIHRoZSBwaG90b24gZW1pdHRlciBub2RlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gRGVzaXJlZCB3aWR0aCBvZiB0aGUgZW1pdHRlciBpbWFnZSBpbiBzY3JlZW4gY29vcmRzLlxyXG4gICAqIEBwYXJhbSB7UGhvdG9uQWJzb3JwdGlvbk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggd2lkdGgsIG1vZGVsLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy8gc3VwZXJ0eXBlIGNvbnN0cnVjdG9yXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7bnVtYmVyfSBoZWlnaHQgb2YgdGhlIGxhYmVsIHJlcXVlc3RlZCBieSBPcGVuIFNjaSBFZCwgd2lsbCBiZSAwIGlmIG5vdCBpbiB0aGF0IG1vZGVcclxuICAgIHRoaXMub3BlblNjaUVkTGFiZWxIZWlnaHQgPSAwO1xyXG5cclxuICAgIGlmICggR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycy5vcGVuU2NpRWQgKSB7XHJcblxyXG4gICAgICAvLyBhZGQgYSBsYWJlbCB0byB0aGUgcGhvdG9uIGVtaXR0ZXIgc2luY2UgdGhlcmUgaXMgb25seSBvbmUgcG9zc2libGUgbGlnaHQgc291cmNlXHJcbiAgICAgIHRoaXMubGlnaHRTb3VyY2VMYWJlbCA9IG5ldyBUZXh0KCBvcGVuU2NpRWRFbmVyZ3lTb3VyY2VTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTEgKSxcclxuICAgICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICAgIG1heFdpZHRoOiAxNTBcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmxpZ2h0U291cmNlTGFiZWwgKTtcclxuXHJcbiAgICAgIHRoaXMub3BlblNjaUVkTGFiZWxIZWlnaHQgPSB0aGlzLmxpZ2h0U291cmNlTGFiZWwuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgJ29uJyBidXR0b24gZm9yIHRoZSBlbWl0dGVyXHJcbiAgICB0aGlzLmJ1dHRvbiA9IG5ldyBCb29sZWFuUm91bmRTdGlja3lUb2dnbGVCdXR0b24oIHRoaXMubW9kZWwucGhvdG9uRW1pdHRlck9uUHJvcGVydHksIHtcclxuICAgICAgcmFkaXVzOiAxNSxcclxuICAgICAgYmFzZUNvbG9yOiAnIzMzZGQzMycsXHJcblxyXG4gICAgICAvLyBwZG9tXHJcbiAgICAgIGFwcGVuZERlc2NyaXB0aW9uOiB0cnVlLFxyXG5cclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGRvbSAtIHRoaXMgYnV0dG9uIGlzIGluZGljYXRlZCBhcyBhICdzd2l0Y2gnIGZvciBhc3Npc3RpdmUgdGVjaG5vbG9neVxyXG4gICAgdGhpcy5idXR0b24uc2V0QXJpYVJvbGUoICdzd2l0Y2gnICk7XHJcblxyXG4gICAgLy8gcGRvbSAtIHNpZ25pZnkgYnV0dG9uIGlzICdwcmVzc2VkJyB3aGVuIGRvd24gLSBub3RlIHRoaXMgaXMgdXNlZCBpbiBhZGRpdGlvbiB0byBhcmlhLXByZXNzZWQgKHNldCBpbiB0aGVcclxuICAgIC8vIHN1cGVydHlwZSkgYXMgdXNpbmcgYm90aCBzb3VuZHMgYmVzdCBpbiBOVkRBXHJcbiAgICBjb25zdCBzZXRBcmlhUHJlc3NlZCA9IHZhbHVlID0+IHRoaXMuYnV0dG9uLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLWNoZWNrZWQnLCB2YWx1ZSApO1xyXG4gICAgbW9kZWwucGhvdG9uRW1pdHRlck9uUHJvcGVydHkubGluayggc2V0QXJpYVByZXNzZWQgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHBob3RvbiBlbWl0dGVyIHVwb24gY2hhbmdlcyB0byB0aGUgcGhvdG9uIHdhdmVsZW5ndGhcclxuICAgIG1vZGVsLnBob3RvbldhdmVsZW5ndGhQcm9wZXJ0eS5saW5rKCBwaG90b25XYXZlbGVuZ3RoID0+IHtcclxuICAgICAgY29uc3QgZW1pdHRlclRhbmRlbU5hbWUgPSBXYXZlbGVuZ3RoQ29uc3RhbnRzLmdldFRhbmRlbU5hbWUoIHBob3RvbldhdmVsZW5ndGggKTtcclxuICAgICAgdGhpcy51cGRhdGVJbWFnZSggd2lkdGgsIHBob3RvbldhdmVsZW5ndGgsIHRhbmRlbSwgZW1pdHRlclRhbmRlbU5hbWUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBtb2RlbC5waG90b25FbWl0dGVyT25Qcm9wZXJ0eS5saW5rKCBvbiA9PiB7XHJcbiAgICAgIGlmICggbW9kZWwucGhvdG9uV2F2ZWxlbmd0aFByb3BlcnR5LmdldCgpICE9PSBXYXZlbGVuZ3RoQ29uc3RhbnRzLk1JQ1JPX1dBVkVMRU5HVEggKSB7XHJcbiAgICAgICAgdGhpcy5waG90b25FbWl0dGVyT25JbWFnZS52aXNpYmxlID0gb247XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHBkb20gLSB1cGRhdGUgdGhlIGhlbHAgdGV4dCBmb3IgdGhlIGVtaXR0ZXJcclxuICAgICAgdGhpcy5idXR0b24uZGVzY3JpcHRpb25Db250ZW50ID0gb24gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWdodFNvdXJjZVByZXNzZWRCdXR0b25IZWxwVGV4dFN0cmluZ1Byb3BlcnR5LnZhbHVlIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlnaHRTb3VyY2VVbnByZXNzZWRCdXR0b25IZWxwVGV4dFN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgYXBwcm9wcmlhdGUgaW1hZ2VzIGJhc2VkIG9uIHRoZSBjdXJyZW50IHNldHRpbmcgZm9yIHRoZSB3YXZlbGVuZ3RoIG9mIHRoZSBlbWl0dGVkIHBob3RvbnMuXHJcbiAgICogVGhlIGVtaXR0ZXIgaXMgY29tcG9zZWQgb2YgbGF5ZXJlZCAnb24nIGFuZCBhbiAnb2ZmJyBpbWFnZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZW1pdHRlcldpZHRoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBob3RvbldhdmVsZW5ndGggLSB3YXZlbGVuZ3RoIG9mIGVtaXR0ZWQgcGhvdG9uIHRvIGRldGVybWluZSBpZiBhIG5ldyBjb250cm9sIHNsaWRlciBuZWVkcyB0byBiZSBhZGRlZFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZW1pdHRlclRhbmRlbU5hbWVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUltYWdlKCBlbWl0dGVyV2lkdGgsIHBob3RvbldhdmVsZW5ndGgsIHRhbmRlbSwgZW1pdHRlclRhbmRlbU5hbWUgKSB7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGFueSBleGlzdGluZyBjaGlsZHJlblxyXG4gICAgdGhpcy5yZW1vdmVBbGxDaGlsZHJlbigpO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgd2F2ZWxlbmd0aCBkZXBlbmRlbnQgaW1hZ2VzIGFuZCBub2Rlc1xyXG4gICAgaWYgKCBwaG90b25XYXZlbGVuZ3RoID09PSBXYXZlbGVuZ3RoQ29uc3RhbnRzLklSX1dBVkVMRU5HVEggKSB7XHJcbiAgICAgIHRoaXMucGhvdG9uRW1pdHRlck9uSW1hZ2UgPSBuZXcgSW1hZ2UoIGluZnJhcmVkU291cmNlX3BuZyApO1xyXG4gICAgICB0aGlzLnBob3RvbkVtaXR0ZXJPZmZJbWFnZSA9IG5ldyBJbWFnZSggaW5mcmFyZWRTb3VyY2VPZmZfcG5nICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggcGhvdG9uV2F2ZWxlbmd0aCA9PT0gV2F2ZWxlbmd0aENvbnN0YW50cy5WSVNJQkxFX1dBVkVMRU5HVEggKSB7XHJcbiAgICAgIHRoaXMucGhvdG9uRW1pdHRlck9uSW1hZ2UgPSBuZXcgSW1hZ2UoIGZsYXNobGlnaHRfcG5nICk7XHJcbiAgICAgIHRoaXMucGhvdG9uRW1pdHRlck9mZkltYWdlID0gbmV3IEltYWdlKCBmbGFzaGxpZ2h0T2ZmX3BuZyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHBob3RvbldhdmVsZW5ndGggPT09IFdhdmVsZW5ndGhDb25zdGFudHMuVVZfV0FWRUxFTkdUSCApIHtcclxuICAgICAgdGhpcy5waG90b25FbWl0dGVyT25JbWFnZSA9IG5ldyBJbWFnZSggdXZTb3VyY2VfcG5nICk7XHJcbiAgICAgIHRoaXMucGhvdG9uRW1pdHRlck9mZkltYWdlID0gbmV3IEltYWdlKCB1dlNvdXJjZU9mZl9wbmcgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBwaG90b25XYXZlbGVuZ3RoID09PSBXYXZlbGVuZ3RoQ29uc3RhbnRzLk1JQ1JPX1dBVkVMRU5HVEggKSB7XHJcbiAgICAgIHRoaXMucGhvdG9uRW1pdHRlck9uSW1hZ2UgPSBuZXcgSW1hZ2UoIG1pY3Jvd2F2ZVNvdXJjZV9wbmcgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzY2FsZSwgY2VudGVyIC0gbm8gJ29mZicgaW1hZ2UgZm9yIG1pY3Jvd2F2ZSBlbWl0dGVyXHJcbiAgICBpZiAoIHBob3RvbldhdmVsZW5ndGggIT09IFdhdmVsZW5ndGhDb25zdGFudHMuTUlDUk9fV0FWRUxFTkdUSCApIHtcclxuICAgICAgdGhpcy5waG90b25FbWl0dGVyT2ZmSW1hZ2Uuc2NhbGUoIGVtaXR0ZXJXaWR0aCAvIHRoaXMucGhvdG9uRW1pdHRlck9mZkltYWdlLndpZHRoICk7XHJcbiAgICAgIHRoaXMucGhvdG9uRW1pdHRlck9mZkltYWdlLmNlbnRlciA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucGhvdG9uRW1pdHRlck9mZkltYWdlICk7XHJcblxyXG4gICAgICB0aGlzLnBob3RvbkVtaXR0ZXJPbkltYWdlLnZpc2libGUgPSB0aGlzLm1vZGVsLnBob3RvbkVtaXR0ZXJPblByb3BlcnR5LmdldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNjYWxlIHRoZSBvbiBpbWFnZSBieSB0aGUgZGVzaXJlZCB3aWR0aCBvZiB0aGUgZW1pdHRlciBhbmQgYWRkIHRvIHRvcFxyXG4gICAgdGhpcy5waG90b25FbWl0dGVyT25JbWFnZS5zY2FsZSggZW1pdHRlcldpZHRoIC8gdGhpcy5waG90b25FbWl0dGVyT25JbWFnZS53aWR0aCApO1xyXG4gICAgdGhpcy5waG90b25FbWl0dGVyT25JbWFnZS5jZW50ZXIgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5waG90b25FbWl0dGVyT25JbWFnZSApO1xyXG5cclxuICAgIGlmICggR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycy5vcGVuU2NpRWQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGlnaHRTb3VyY2VMYWJlbCwgJ2xhYmVsIHNob3VsZCBiZSBkZWZpbmVkIGZvciBPcGVuIFNjaSBFZCcgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggdGhpcy5saWdodFNvdXJjZUxhYmVsICk7XHJcbiAgICAgIHRoaXMubGlnaHRTb3VyY2VMYWJlbC5jZW50ZXJUb3AgPSB0aGlzLnBob3RvbkVtaXR0ZXJPbkltYWdlLmNlbnRlckJvdHRvbS5wbHVzWFkoIDAsIDUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwZG9tIC0gdXBkYXRlIHRoZSBhY2Nlc3NpYmxlIG5hbWUgZm9yIHRoZSBidXR0b25cclxuICAgIHRoaXMuYnV0dG9uLmlubmVyQ29udGVudCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggbGlnaHRTb3VyY2VCdXR0b25MYWJlbFBhdHRlcm5TdHJpbmdQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICBsaWdodFNvdXJjZTogV2F2ZWxlbmd0aENvbnN0YW50cy5nZXRMaWdodFNvdXJjZU5hbWUoIHBob3RvbldhdmVsZW5ndGggKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgYnV0dG9uIHRvIHRoZSBjb3JyZWN0IHBvc2l0aW9uIG9uIHRoZSBwaG90b24gZW1pdHRlclxyXG4gICAgdGhpcy5idXR0b24ubGVmdCA9IHRoaXMucGhvdG9uRW1pdHRlck9mZkltYWdlLmNlbnRlclggLSAyMDtcclxuICAgIHRoaXMuYnV0dG9uLmNlbnRlclkgPSB0aGlzLnBob3RvbkVtaXR0ZXJPZmZJbWFnZS5jZW50ZXJZO1xyXG4gICAgaWYgKCAhdGhpcy5oYXNDaGlsZCggdGhpcy5idXR0b24gKSApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggdGhpcy5idXR0b24gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdQaG90b25FbWl0dGVyTm9kZScsIFBob3RvbkVtaXR0ZXJOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQaG90b25FbWl0dGVyTm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDckUsT0FBT0MsOEJBQThCLE1BQU0sOERBQThEO0FBQ3pHLE9BQU9DLGlCQUFpQixNQUFNLHNDQUFzQztBQUNwRSxPQUFPQyxxQkFBcUIsTUFBTSwwQ0FBMEM7QUFDNUUsT0FBT0MsZUFBZSxNQUFNLG9DQUFvQztBQUNoRSxPQUFPQyxjQUFjLE1BQU0sb0NBQW9DO0FBQy9ELE9BQU9DLGtCQUFrQixNQUFNLHdDQUF3QztBQUN2RSxPQUFPQyxtQkFBbUIsTUFBTSx5Q0FBeUM7QUFDekUsT0FBT0MsWUFBWSxNQUFNLGtDQUFrQztBQUMzRCxPQUFPQywrQkFBK0IsTUFBTSxpREFBaUQ7QUFDN0YsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxtQkFBbUIsTUFBTSxpQ0FBaUM7QUFFakUsTUFBTUMsMkNBQTJDLEdBQUdGLHVCQUF1QixDQUFDRyxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsZ0NBQWdDO0FBQzdILE1BQU1DLDhDQUE4QyxHQUFHTix1QkFBdUIsQ0FBQ0csSUFBSSxDQUFDQyxXQUFXLENBQUNHLG1DQUFtQztBQUNuSSxNQUFNQyxnREFBZ0QsR0FBR1IsdUJBQXVCLENBQUNHLElBQUksQ0FBQ0MsV0FBVyxDQUFDSyxxQ0FBcUM7QUFDdkksTUFBTUMsbUNBQW1DLEdBQUdWLHVCQUF1QixDQUFDVyxTQUFTLENBQUNDLDBCQUEwQjtBQUV4RyxNQUFNQyxpQkFBaUIsU0FBU3pCLElBQUksQ0FBQztFQUVuQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFMEIsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRztJQUVsQztJQUNBLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSSxDQUFDRCxLQUFLLEdBQUdBLEtBQUs7O0lBRWxCO0lBQ0EsSUFBSSxDQUFDRSxvQkFBb0IsR0FBRyxDQUFDO0lBRTdCLElBQUtwQiwrQkFBK0IsQ0FBQ2EsU0FBUyxFQUFHO01BRS9DO01BQ0EsSUFBSSxDQUFDUSxnQkFBZ0IsR0FBRyxJQUFJOUIsSUFBSSxDQUFFcUIsbUNBQW1DLEVBQUU7UUFDckVVLElBQUksRUFBRSxJQUFJbEMsUUFBUSxDQUFFLEVBQUcsQ0FBQztRQUN4Qm1DLElBQUksRUFBRSxPQUFPO1FBQ2JDLFFBQVEsRUFBRTtNQUNaLENBQUUsQ0FBQztNQUNILElBQUksQ0FBQ0MsUUFBUSxDQUFFLElBQUksQ0FBQ0osZ0JBQWlCLENBQUM7TUFFdEMsSUFBSSxDQUFDRCxvQkFBb0IsR0FBRyxJQUFJLENBQUNDLGdCQUFnQixDQUFDSyxNQUFNO0lBQzFEOztJQUVBO0lBQ0EsSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSW5DLDhCQUE4QixDQUFFLElBQUksQ0FBQzBCLEtBQUssQ0FBQ1UsdUJBQXVCLEVBQUU7TUFDcEZDLE1BQU0sRUFBRSxFQUFFO01BQ1ZDLFNBQVMsRUFBRSxTQUFTO01BRXBCO01BQ0FDLGlCQUFpQixFQUFFLElBQUk7TUFFdkJaLE1BQU0sRUFBRUEsTUFBTSxDQUFDYSxZQUFZLENBQUUsUUFBUztJQUN4QyxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNMLE1BQU0sQ0FBQ00sV0FBVyxDQUFFLFFBQVMsQ0FBQzs7SUFFbkM7SUFDQTtJQUNBLE1BQU1DLGNBQWMsR0FBR0MsS0FBSyxJQUFJLElBQUksQ0FBQ1IsTUFBTSxDQUFDUyxnQkFBZ0IsQ0FBRSxjQUFjLEVBQUVELEtBQU0sQ0FBQztJQUNyRmpCLEtBQUssQ0FBQ1UsdUJBQXVCLENBQUNTLElBQUksQ0FBRUgsY0FBZSxDQUFDOztJQUVwRDtJQUNBaEIsS0FBSyxDQUFDb0Isd0JBQXdCLENBQUNELElBQUksQ0FBRUUsZ0JBQWdCLElBQUk7TUFDdkQsTUFBTUMsaUJBQWlCLEdBQUdyQyxtQkFBbUIsQ0FBQ3NDLGFBQWEsQ0FBRUYsZ0JBQWlCLENBQUM7TUFDL0UsSUFBSSxDQUFDRyxXQUFXLENBQUV6QixLQUFLLEVBQUVzQixnQkFBZ0IsRUFBRXBCLE1BQU0sRUFBRXFCLGlCQUFrQixDQUFDO0lBQ3hFLENBQUUsQ0FBQztJQUVIdEIsS0FBSyxDQUFDVSx1QkFBdUIsQ0FBQ1MsSUFBSSxDQUFFTSxFQUFFLElBQUk7TUFDeEMsSUFBS3pCLEtBQUssQ0FBQ29CLHdCQUF3QixDQUFDTSxHQUFHLENBQUMsQ0FBQyxLQUFLekMsbUJBQW1CLENBQUMwQyxnQkFBZ0IsRUFBRztRQUNuRixJQUFJLENBQUNDLG9CQUFvQixDQUFDQyxPQUFPLEdBQUdKLEVBQUU7TUFDeEM7O01BRUE7TUFDQSxJQUFJLENBQUNoQixNQUFNLENBQUNxQixrQkFBa0IsR0FBR0wsRUFBRSxHQUNGbkMsOENBQThDLENBQUMyQixLQUFLLEdBQ3BEekIsZ0RBQWdELENBQUN5QixLQUFLO0lBQ3pGLENBQUUsQ0FBQztFQUNMOztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLFdBQVdBLENBQUVPLFlBQVksRUFBRVYsZ0JBQWdCLEVBQUVwQixNQUFNLEVBQUVxQixpQkFBaUIsRUFBRztJQUV2RTtJQUNBLElBQUksQ0FBQ1UsaUJBQWlCLENBQUMsQ0FBQzs7SUFFeEI7SUFDQSxJQUFLWCxnQkFBZ0IsS0FBS3BDLG1CQUFtQixDQUFDZ0QsYUFBYSxFQUFHO01BQzVELElBQUksQ0FBQ0wsb0JBQW9CLEdBQUcsSUFBSXpELEtBQUssQ0FBRVEsa0JBQW1CLENBQUM7TUFDM0QsSUFBSSxDQUFDdUQscUJBQXFCLEdBQUcsSUFBSS9ELEtBQUssQ0FBRUsscUJBQXNCLENBQUM7SUFDakUsQ0FBQyxNQUNJLElBQUs2QyxnQkFBZ0IsS0FBS3BDLG1CQUFtQixDQUFDa0Qsa0JBQWtCLEVBQUc7TUFDdEUsSUFBSSxDQUFDUCxvQkFBb0IsR0FBRyxJQUFJekQsS0FBSyxDQUFFTyxjQUFlLENBQUM7TUFDdkQsSUFBSSxDQUFDd0QscUJBQXFCLEdBQUcsSUFBSS9ELEtBQUssQ0FBRUksaUJBQWtCLENBQUM7SUFDN0QsQ0FBQyxNQUNJLElBQUs4QyxnQkFBZ0IsS0FBS3BDLG1CQUFtQixDQUFDbUQsYUFBYSxFQUFHO01BQ2pFLElBQUksQ0FBQ1Isb0JBQW9CLEdBQUcsSUFBSXpELEtBQUssQ0FBRVUsWUFBYSxDQUFDO01BQ3JELElBQUksQ0FBQ3FELHFCQUFxQixHQUFHLElBQUkvRCxLQUFLLENBQUVNLGVBQWdCLENBQUM7SUFDM0QsQ0FBQyxNQUNJLElBQUs0QyxnQkFBZ0IsS0FBS3BDLG1CQUFtQixDQUFDMEMsZ0JBQWdCLEVBQUc7TUFDcEUsSUFBSSxDQUFDQyxvQkFBb0IsR0FBRyxJQUFJekQsS0FBSyxDQUFFUyxtQkFBb0IsQ0FBQztJQUM5RDs7SUFFQTtJQUNBLElBQUt5QyxnQkFBZ0IsS0FBS3BDLG1CQUFtQixDQUFDMEMsZ0JBQWdCLEVBQUc7TUFDL0QsSUFBSSxDQUFDTyxxQkFBcUIsQ0FBQ0csS0FBSyxDQUFFTixZQUFZLEdBQUcsSUFBSSxDQUFDRyxxQkFBcUIsQ0FBQ25DLEtBQU0sQ0FBQztNQUNuRixJQUFJLENBQUNtQyxxQkFBcUIsQ0FBQ0ksTUFBTSxHQUFHLElBQUl0RSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUN2RCxJQUFJLENBQUN1QyxRQUFRLENBQUUsSUFBSSxDQUFDMkIscUJBQXNCLENBQUM7TUFFM0MsSUFBSSxDQUFDTixvQkFBb0IsQ0FBQ0MsT0FBTyxHQUFHLElBQUksQ0FBQzdCLEtBQUssQ0FBQ1UsdUJBQXVCLENBQUNnQixHQUFHLENBQUMsQ0FBQztJQUM5RTs7SUFFQTtJQUNBLElBQUksQ0FBQ0Usb0JBQW9CLENBQUNTLEtBQUssQ0FBRU4sWUFBWSxHQUFHLElBQUksQ0FBQ0gsb0JBQW9CLENBQUM3QixLQUFNLENBQUM7SUFDakYsSUFBSSxDQUFDNkIsb0JBQW9CLENBQUNVLE1BQU0sR0FBRyxJQUFJdEUsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDdEQsSUFBSSxDQUFDdUMsUUFBUSxDQUFFLElBQUksQ0FBQ3FCLG9CQUFxQixDQUFDO0lBRTFDLElBQUs5QywrQkFBK0IsQ0FBQ2EsU0FBUyxFQUFHO01BQy9DNEMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDcEMsZ0JBQWdCLEVBQUUseUNBQTBDLENBQUM7TUFDcEYsSUFBSSxDQUFDSSxRQUFRLENBQUUsSUFBSSxDQUFDSixnQkFBaUIsQ0FBQztNQUN0QyxJQUFJLENBQUNBLGdCQUFnQixDQUFDcUMsU0FBUyxHQUFHLElBQUksQ0FBQ1osb0JBQW9CLENBQUNhLFlBQVksQ0FBQ0MsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDekY7O0lBRUE7SUFDQSxJQUFJLENBQUNqQyxNQUFNLENBQUNrQyxZQUFZLEdBQUcxRSxXQUFXLENBQUMyRSxNQUFNLENBQUUxRCwyQ0FBMkMsQ0FBQytCLEtBQUssRUFBRTtNQUNoRzdCLFdBQVcsRUFBRUgsbUJBQW1CLENBQUM0RCxrQkFBa0IsQ0FBRXhCLGdCQUFpQjtJQUN4RSxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNaLE1BQU0sQ0FBQ3FDLElBQUksR0FBRyxJQUFJLENBQUNaLHFCQUFxQixDQUFDYSxPQUFPLEdBQUcsRUFBRTtJQUMxRCxJQUFJLENBQUN0QyxNQUFNLENBQUN1QyxPQUFPLEdBQUcsSUFBSSxDQUFDZCxxQkFBcUIsQ0FBQ2MsT0FBTztJQUN4RCxJQUFLLENBQUMsSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSSxDQUFDeEMsTUFBTyxDQUFDLEVBQUc7TUFDbkMsSUFBSSxDQUFDRixRQUFRLENBQUUsSUFBSSxDQUFDRSxNQUFPLENBQUM7SUFDOUI7RUFDRjtBQUNGO0FBRUExQixnQkFBZ0IsQ0FBQ21FLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRXJELGlCQUFrQixDQUFDO0FBRW5FLGVBQWVBLGlCQUFpQiJ9