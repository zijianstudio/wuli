// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model for 'RGB' screen
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import EventTimer from '../../../../phet-core/js/EventTimer.js';
import { Color } from '../../../../scenery/js/imports.js';
import colorVision from '../../colorVision.js';
import ColorVisionModel from '../../common/model/ColorVisionModel.js';
import RGBConstants from '../RGBConstants.js';
import RGBPhotonBeam from './RGBPhotonBeam.js';
import RGBPhotonEventModel from './RGBPhotonEventModel.js';

// constants
const PERCENT_RANGE = new Range(0, 100);
const COLOR_SCALE_FACTOR = 2.55; // for multiplying a percent by to get an rgb color intensity

class RGBModel extends ColorVisionModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    super(tandem);

    // @public
    // The values of the properties redIntensity, greenIntensity, and blueIntensity are determined
    // from the sliders, and determine the density of the photons coming out of the flashlights.
    // Range is 0-100.
    this.redIntensityProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('redIntensityProperty'),
      units: '%',
      range: PERCENT_RANGE
    });
    this.greenIntensityProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('greenIntensityProperty'),
      units: '%',
      range: PERCENT_RANGE
    });
    this.blueIntensityProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('blueIntensityProperty'),
      units: '%',
      range: PERCENT_RANGE
    });

    // @private
    // The perceivedIntensity properties determine the color of the thought bubbles.
    // They are calculated by taking the intensity value of the most recent photon to
    // reach the end of the photon beam (the person's eye). Each photon keeps a record of the
    // intensity for this reason, even though it is not used in determining intensity of the
    // photon itself, which is constant.
    // Range is 0-100.
    this.perceivedRedIntensityProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('perceivedRedIntensityProperty'),
      units: '%',
      range: PERCENT_RANGE
    });
    this.perceivedGreenIntensityProperty = new NumberProperty(0, {
      value: 0,
      tandem: tandem.createTandem('perceivedGreenIntensityProperty'),
      units: '%',
      range: PERCENT_RANGE
    });
    this.perceivedBlueIntensityProperty = new NumberProperty(0, {
      value: 0,
      tandem: tandem.createTandem('perceivedBlueIntensityProperty'),
      units: '%',
      range: PERCENT_RANGE
    });

    // @private
    this.redBeam = new RGBPhotonBeam('#ff0000', this.redIntensityProperty, this.perceivedRedIntensityProperty, RGBConstants.RED_BEAM_LENGTH, tandem.createTandem('redBeam'));
    this.greenBeam = new RGBPhotonBeam('#00ff00', this.greenIntensityProperty, this.perceivedGreenIntensityProperty, RGBConstants.GREEN_BEAM_LENGTH, tandem.createTandem('greenBeam'));
    this.blueBeam = new RGBPhotonBeam('#0000ff', this.blueIntensityProperty, this.perceivedBlueIntensityProperty, RGBConstants.BLUE_BEAM_LENGTH, tandem.createTandem('blueBeam'));

    // @public {Property.<Color|string>}
    // based on the combination of the three perceived intensities, this determines the thought bubble color
    this.perceivedColorProperty = new DerivedProperty([this.perceivedRedIntensityProperty, this.perceivedGreenIntensityProperty, this.perceivedBlueIntensityProperty], (redIntensity, greenIntensity, blueIntensity) => new Color(Math.floor(redIntensity * COLOR_SCALE_FACTOR), Math.floor(greenIntensity * COLOR_SCALE_FACTOR), Math.floor(blueIntensity * COLOR_SCALE_FACTOR)), {
      tandem: tandem.createTandem('perceivedColorProperty'),
      phetioValueType: Color.ColorIO
    });

    // create a ConstantEventModel for each beam
    const redEventModel = new RGBPhotonEventModel(this.redIntensityProperty);
    const greenEventModel = new RGBPhotonEventModel(this.greenIntensityProperty);
    const blueEventModel = new RGBPhotonEventModel(this.blueIntensityProperty);

    // create an EventTimer for each beam, used to regulate when to create new photons for each beam
    // @private
    this.redEventTimer = new EventTimer(redEventModel, timeElapsed => {
      this.redBeam.createPhoton(timeElapsed);
    });

    // @private
    this.greenEventTimer = new EventTimer(greenEventModel, timeElapsed => {
      this.greenBeam.createPhoton(timeElapsed);
    });

    // @private
    this.blueEventTimer = new EventTimer(blueEventModel, timeElapsed => {
      this.blueBeam.createPhoton(timeElapsed);
    });

    // link the intensity of each beam to the rate of their event timers
    // we need to 0 out the timeBeforeNextEvent, otherwise there is a long delay in seeing the first photon from
    // the time when the slider is initially moved.
    this.redIntensityProperty.link(() => {
      this.redEventTimer.timeBeforeNextEvent = 0;
    });
    this.greenIntensityProperty.link(() => {
      this.greenEventTimer.timeBeforeNextEvent = 0;
    });
    this.blueIntensityProperty.link(() => {
      this.blueEventTimer.timeBeforeNextEvent = 0;
    });
  }

  // @private
  // convenience method for stepping all of the beams at once, used in step and manualStep
  stepBeams(timeElapsed) {
    this.redBeam.updateAnimationFrame(timeElapsed);
    this.greenBeam.updateAnimationFrame(timeElapsed);
    this.blueBeam.updateAnimationFrame(timeElapsed);
  }

  // @private
  // convenience method for stepping all of the timers at once
  stepTimers(dt) {
    this.redEventTimer.step(dt);
    this.greenEventTimer.step(dt);
    this.blueEventTimer.step(dt);
  }

  // @public
  step(dt) {
    // Cap DT, see https://github.com/phetsims/color-vision/issues/115 and https://github.com/phetsims/joist/issues/130
    dt = Math.min(dt, 0.5);
    if (this.playingProperty.value) {
      this.stepBeams(dt);
      this.stepTimers(dt);
    }
  }

  // @public @override
  // step one frame, assuming 60fps
  manualStep() {
    this.stepBeams(1 / 60);
    this.stepTimers(1 / 60);
  }

  // @public @override
  reset() {
    super.reset();
    this.redIntensityProperty.reset();
    this.greenIntensityProperty.reset();
    this.blueIntensityProperty.reset();
    this.perceivedRedIntensityProperty.reset();
    this.perceivedGreenIntensityProperty.reset();
    this.perceivedBlueIntensityProperty.reset();
    this.redBeam.reset();
    this.greenBeam.reset();
    this.blueBeam.reset();
  }
}
colorVision.register('RGBModel', RGBModel);
export default RGBModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiRXZlbnRUaW1lciIsIkNvbG9yIiwiY29sb3JWaXNpb24iLCJDb2xvclZpc2lvbk1vZGVsIiwiUkdCQ29uc3RhbnRzIiwiUkdCUGhvdG9uQmVhbSIsIlJHQlBob3RvbkV2ZW50TW9kZWwiLCJQRVJDRU5UX1JBTkdFIiwiQ09MT1JfU0NBTEVfRkFDVE9SIiwiUkdCTW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsInJlZEludGVuc2l0eVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwidW5pdHMiLCJyYW5nZSIsImdyZWVuSW50ZW5zaXR5UHJvcGVydHkiLCJibHVlSW50ZW5zaXR5UHJvcGVydHkiLCJwZXJjZWl2ZWRSZWRJbnRlbnNpdHlQcm9wZXJ0eSIsInBlcmNlaXZlZEdyZWVuSW50ZW5zaXR5UHJvcGVydHkiLCJ2YWx1ZSIsInBlcmNlaXZlZEJsdWVJbnRlbnNpdHlQcm9wZXJ0eSIsInJlZEJlYW0iLCJSRURfQkVBTV9MRU5HVEgiLCJncmVlbkJlYW0iLCJHUkVFTl9CRUFNX0xFTkdUSCIsImJsdWVCZWFtIiwiQkxVRV9CRUFNX0xFTkdUSCIsInBlcmNlaXZlZENvbG9yUHJvcGVydHkiLCJyZWRJbnRlbnNpdHkiLCJncmVlbkludGVuc2l0eSIsImJsdWVJbnRlbnNpdHkiLCJNYXRoIiwiZmxvb3IiLCJwaGV0aW9WYWx1ZVR5cGUiLCJDb2xvcklPIiwicmVkRXZlbnRNb2RlbCIsImdyZWVuRXZlbnRNb2RlbCIsImJsdWVFdmVudE1vZGVsIiwicmVkRXZlbnRUaW1lciIsInRpbWVFbGFwc2VkIiwiY3JlYXRlUGhvdG9uIiwiZ3JlZW5FdmVudFRpbWVyIiwiYmx1ZUV2ZW50VGltZXIiLCJsaW5rIiwidGltZUJlZm9yZU5leHRFdmVudCIsInN0ZXBCZWFtcyIsInVwZGF0ZUFuaW1hdGlvbkZyYW1lIiwic3RlcFRpbWVycyIsImR0Iiwic3RlcCIsIm1pbiIsInBsYXlpbmdQcm9wZXJ0eSIsIm1hbnVhbFN0ZXAiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUkdCTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yICdSR0InIHNjcmVlblxyXG4gKlxyXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgRXZlbnRUaW1lciBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRXZlbnRUaW1lci5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNvbG9yVmlzaW9uIGZyb20gJy4uLy4uL2NvbG9yVmlzaW9uLmpzJztcclxuaW1wb3J0IENvbG9yVmlzaW9uTW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0NvbG9yVmlzaW9uTW9kZWwuanMnO1xyXG5pbXBvcnQgUkdCQ29uc3RhbnRzIGZyb20gJy4uL1JHQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBSR0JQaG90b25CZWFtIGZyb20gJy4vUkdCUGhvdG9uQmVhbS5qcyc7XHJcbmltcG9ydCBSR0JQaG90b25FdmVudE1vZGVsIGZyb20gJy4vUkdCUGhvdG9uRXZlbnRNb2RlbC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgUEVSQ0VOVF9SQU5HRSA9IG5ldyBSYW5nZSggMCwgMTAwICk7XHJcbmNvbnN0IENPTE9SX1NDQUxFX0ZBQ1RPUiA9IDIuNTU7IC8vIGZvciBtdWx0aXBseWluZyBhIHBlcmNlbnQgYnkgdG8gZ2V0IGFuIHJnYiBjb2xvciBpbnRlbnNpdHlcclxuXHJcbmNsYXNzIFJHQk1vZGVsIGV4dGVuZHMgQ29sb3JWaXNpb25Nb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB0YW5kZW0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICAvLyBUaGUgdmFsdWVzIG9mIHRoZSBwcm9wZXJ0aWVzIHJlZEludGVuc2l0eSwgZ3JlZW5JbnRlbnNpdHksIGFuZCBibHVlSW50ZW5zaXR5IGFyZSBkZXRlcm1pbmVkXHJcbiAgICAvLyBmcm9tIHRoZSBzbGlkZXJzLCBhbmQgZGV0ZXJtaW5lIHRoZSBkZW5zaXR5IG9mIHRoZSBwaG90b25zIGNvbWluZyBvdXQgb2YgdGhlIGZsYXNobGlnaHRzLlxyXG4gICAgLy8gUmFuZ2UgaXMgMC0xMDAuXHJcbiAgICB0aGlzLnJlZEludGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlZEludGVuc2l0eVByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJyUnLFxyXG4gICAgICByYW5nZTogUEVSQ0VOVF9SQU5HRVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ncmVlbkludGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyZWVuSW50ZW5zaXR5UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnJScsXHJcbiAgICAgIHJhbmdlOiBQRVJDRU5UX1JBTkdFXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJsdWVJbnRlbnNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdibHVlSW50ZW5zaXR5UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnJScsXHJcbiAgICAgIHJhbmdlOiBQRVJDRU5UX1JBTkdFXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIC8vIFRoZSBwZXJjZWl2ZWRJbnRlbnNpdHkgcHJvcGVydGllcyBkZXRlcm1pbmUgdGhlIGNvbG9yIG9mIHRoZSB0aG91Z2h0IGJ1YmJsZXMuXHJcbiAgICAvLyBUaGV5IGFyZSBjYWxjdWxhdGVkIGJ5IHRha2luZyB0aGUgaW50ZW5zaXR5IHZhbHVlIG9mIHRoZSBtb3N0IHJlY2VudCBwaG90b24gdG9cclxuICAgIC8vIHJlYWNoIHRoZSBlbmQgb2YgdGhlIHBob3RvbiBiZWFtICh0aGUgcGVyc29uJ3MgZXllKS4gRWFjaCBwaG90b24ga2VlcHMgYSByZWNvcmQgb2YgdGhlXHJcbiAgICAvLyBpbnRlbnNpdHkgZm9yIHRoaXMgcmVhc29uLCBldmVuIHRob3VnaCBpdCBpcyBub3QgdXNlZCBpbiBkZXRlcm1pbmluZyBpbnRlbnNpdHkgb2YgdGhlXHJcbiAgICAvLyBwaG90b24gaXRzZWxmLCB3aGljaCBpcyBjb25zdGFudC5cclxuICAgIC8vIFJhbmdlIGlzIDAtMTAwLlxyXG4gICAgdGhpcy5wZXJjZWl2ZWRSZWRJbnRlbnNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwZXJjZWl2ZWRSZWRJbnRlbnNpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICclJyxcclxuICAgICAgcmFuZ2U6IFBFUkNFTlRfUkFOR0VcclxuICAgIH0gKTtcclxuICAgIHRoaXMucGVyY2VpdmVkR3JlZW5JbnRlbnNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB2YWx1ZTogMCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGVyY2VpdmVkR3JlZW5JbnRlbnNpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICclJyxcclxuICAgICAgcmFuZ2U6IFBFUkNFTlRfUkFOR0VcclxuICAgIH0gKTtcclxuICAgIHRoaXMucGVyY2VpdmVkQmx1ZUludGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHZhbHVlOiAwLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwZXJjZWl2ZWRCbHVlSW50ZW5zaXR5UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnJScsXHJcbiAgICAgIHJhbmdlOiBQRVJDRU5UX1JBTkdFXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMucmVkQmVhbSA9IG5ldyBSR0JQaG90b25CZWFtKFxyXG4gICAgICAnI2ZmMDAwMCcsXHJcbiAgICAgIHRoaXMucmVkSW50ZW5zaXR5UHJvcGVydHksXHJcbiAgICAgIHRoaXMucGVyY2VpdmVkUmVkSW50ZW5zaXR5UHJvcGVydHksXHJcbiAgICAgIFJHQkNvbnN0YW50cy5SRURfQkVBTV9MRU5HVEgsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWRCZWFtJyApICk7XHJcbiAgICB0aGlzLmdyZWVuQmVhbSA9IG5ldyBSR0JQaG90b25CZWFtKFxyXG4gICAgICAnIzAwZmYwMCcsXHJcbiAgICAgIHRoaXMuZ3JlZW5JbnRlbnNpdHlQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5wZXJjZWl2ZWRHcmVlbkludGVuc2l0eVByb3BlcnR5LFxyXG4gICAgICBSR0JDb25zdGFudHMuR1JFRU5fQkVBTV9MRU5HVEgsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmVlbkJlYW0nICkgKTtcclxuICAgIHRoaXMuYmx1ZUJlYW0gPSBuZXcgUkdCUGhvdG9uQmVhbShcclxuICAgICAgJyMwMDAwZmYnLFxyXG4gICAgICB0aGlzLmJsdWVJbnRlbnNpdHlQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5wZXJjZWl2ZWRCbHVlSW50ZW5zaXR5UHJvcGVydHksXHJcbiAgICAgIFJHQkNvbnN0YW50cy5CTFVFX0JFQU1fTEVOR1RILFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmx1ZUJlYW0nICkgKTtcclxuXHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPENvbG9yfHN0cmluZz59XHJcbiAgICAvLyBiYXNlZCBvbiB0aGUgY29tYmluYXRpb24gb2YgdGhlIHRocmVlIHBlcmNlaXZlZCBpbnRlbnNpdGllcywgdGhpcyBkZXRlcm1pbmVzIHRoZSB0aG91Z2h0IGJ1YmJsZSBjb2xvclxyXG4gICAgdGhpcy5wZXJjZWl2ZWRDb2xvclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xyXG4gICAgICAgIHRoaXMucGVyY2VpdmVkUmVkSW50ZW5zaXR5UHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5wZXJjZWl2ZWRHcmVlbkludGVuc2l0eVByb3BlcnR5LFxyXG4gICAgICAgIHRoaXMucGVyY2VpdmVkQmx1ZUludGVuc2l0eVByb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggcmVkSW50ZW5zaXR5LCBncmVlbkludGVuc2l0eSwgYmx1ZUludGVuc2l0eSApID0+IG5ldyBDb2xvcihcclxuICAgICAgICBNYXRoLmZsb29yKCByZWRJbnRlbnNpdHkgKiBDT0xPUl9TQ0FMRV9GQUNUT1IgKSxcclxuICAgICAgICBNYXRoLmZsb29yKCBncmVlbkludGVuc2l0eSAqIENPTE9SX1NDQUxFX0ZBQ1RPUiApLFxyXG4gICAgICAgIE1hdGguZmxvb3IoIGJsdWVJbnRlbnNpdHkgKiBDT0xPUl9TQ0FMRV9GQUNUT1IgKSApLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGVyY2VpdmVkQ29sb3JQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IENvbG9yLkNvbG9ySU9cclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIENvbnN0YW50RXZlbnRNb2RlbCBmb3IgZWFjaCBiZWFtXHJcbiAgICBjb25zdCByZWRFdmVudE1vZGVsID0gbmV3IFJHQlBob3RvbkV2ZW50TW9kZWwoIHRoaXMucmVkSW50ZW5zaXR5UHJvcGVydHkgKTtcclxuICAgIGNvbnN0IGdyZWVuRXZlbnRNb2RlbCA9IG5ldyBSR0JQaG90b25FdmVudE1vZGVsKCB0aGlzLmdyZWVuSW50ZW5zaXR5UHJvcGVydHkgKTtcclxuICAgIGNvbnN0IGJsdWVFdmVudE1vZGVsID0gbmV3IFJHQlBob3RvbkV2ZW50TW9kZWwoIHRoaXMuYmx1ZUludGVuc2l0eVByb3BlcnR5ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuIEV2ZW50VGltZXIgZm9yIGVhY2ggYmVhbSwgdXNlZCB0byByZWd1bGF0ZSB3aGVuIHRvIGNyZWF0ZSBuZXcgcGhvdG9ucyBmb3IgZWFjaCBiZWFtXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5yZWRFdmVudFRpbWVyID0gbmV3IEV2ZW50VGltZXIoIHJlZEV2ZW50TW9kZWwsIHRpbWVFbGFwc2VkID0+IHtcclxuICAgICAgdGhpcy5yZWRCZWFtLmNyZWF0ZVBob3RvbiggdGltZUVsYXBzZWQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5ncmVlbkV2ZW50VGltZXIgPSBuZXcgRXZlbnRUaW1lciggZ3JlZW5FdmVudE1vZGVsLCB0aW1lRWxhcHNlZCA9PiB7XHJcbiAgICAgIHRoaXMuZ3JlZW5CZWFtLmNyZWF0ZVBob3RvbiggdGltZUVsYXBzZWQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5ibHVlRXZlbnRUaW1lciA9IG5ldyBFdmVudFRpbWVyKCBibHVlRXZlbnRNb2RlbCwgdGltZUVsYXBzZWQgPT4ge1xyXG4gICAgICB0aGlzLmJsdWVCZWFtLmNyZWF0ZVBob3RvbiggdGltZUVsYXBzZWQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsaW5rIHRoZSBpbnRlbnNpdHkgb2YgZWFjaCBiZWFtIHRvIHRoZSByYXRlIG9mIHRoZWlyIGV2ZW50IHRpbWVyc1xyXG4gICAgLy8gd2UgbmVlZCB0byAwIG91dCB0aGUgdGltZUJlZm9yZU5leHRFdmVudCwgb3RoZXJ3aXNlIHRoZXJlIGlzIGEgbG9uZyBkZWxheSBpbiBzZWVpbmcgdGhlIGZpcnN0IHBob3RvbiBmcm9tXHJcbiAgICAvLyB0aGUgdGltZSB3aGVuIHRoZSBzbGlkZXIgaXMgaW5pdGlhbGx5IG1vdmVkLlxyXG4gICAgdGhpcy5yZWRJbnRlbnNpdHlQcm9wZXJ0eS5saW5rKCAoKSA9PiB7IHRoaXMucmVkRXZlbnRUaW1lci50aW1lQmVmb3JlTmV4dEV2ZW50ID0gMDsgfSApO1xyXG4gICAgdGhpcy5ncmVlbkludGVuc2l0eVByb3BlcnR5LmxpbmsoICgpID0+IHsgdGhpcy5ncmVlbkV2ZW50VGltZXIudGltZUJlZm9yZU5leHRFdmVudCA9IDA7IH0gKTtcclxuICAgIHRoaXMuYmx1ZUludGVuc2l0eVByb3BlcnR5LmxpbmsoICgpID0+IHsgdGhpcy5ibHVlRXZlbnRUaW1lci50aW1lQmVmb3JlTmV4dEV2ZW50ID0gMDsgfSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgLy8gY29udmVuaWVuY2UgbWV0aG9kIGZvciBzdGVwcGluZyBhbGwgb2YgdGhlIGJlYW1zIGF0IG9uY2UsIHVzZWQgaW4gc3RlcCBhbmQgbWFudWFsU3RlcFxyXG4gIHN0ZXBCZWFtcyggdGltZUVsYXBzZWQgKSB7XHJcbiAgICB0aGlzLnJlZEJlYW0udXBkYXRlQW5pbWF0aW9uRnJhbWUoIHRpbWVFbGFwc2VkICk7XHJcbiAgICB0aGlzLmdyZWVuQmVhbS51cGRhdGVBbmltYXRpb25GcmFtZSggdGltZUVsYXBzZWQgKTtcclxuICAgIHRoaXMuYmx1ZUJlYW0udXBkYXRlQW5pbWF0aW9uRnJhbWUoIHRpbWVFbGFwc2VkICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIC8vIGNvbnZlbmllbmNlIG1ldGhvZCBmb3Igc3RlcHBpbmcgYWxsIG9mIHRoZSB0aW1lcnMgYXQgb25jZVxyXG4gIHN0ZXBUaW1lcnMoIGR0ICkge1xyXG4gICAgdGhpcy5yZWRFdmVudFRpbWVyLnN0ZXAoIGR0ICk7XHJcbiAgICB0aGlzLmdyZWVuRXZlbnRUaW1lci5zdGVwKCBkdCApO1xyXG4gICAgdGhpcy5ibHVlRXZlbnRUaW1lci5zdGVwKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIC8vIENhcCBEVCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb2xvci12aXNpb24vaXNzdWVzLzExNSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xMzBcclxuICAgIGR0ID0gTWF0aC5taW4oIGR0LCAwLjUgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMucGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnN0ZXBCZWFtcyggZHQgKTtcclxuICAgICAgdGhpcy5zdGVwVGltZXJzKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyBAb3ZlcnJpZGVcclxuICAvLyBzdGVwIG9uZSBmcmFtZSwgYXNzdW1pbmcgNjBmcHNcclxuICBtYW51YWxTdGVwKCkge1xyXG4gICAgdGhpcy5zdGVwQmVhbXMoIDEgLyA2MCApO1xyXG4gICAgdGhpcy5zdGVwVGltZXJzKCAxIC8gNjAgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgQG92ZXJyaWRlXHJcbiAgcmVzZXQoKSB7XHJcblxyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnJlZEludGVuc2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmdyZWVuSW50ZW5zaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYmx1ZUludGVuc2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBlcmNlaXZlZFJlZEludGVuc2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBlcmNlaXZlZEdyZWVuSW50ZW5zaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucGVyY2VpdmVkQmx1ZUludGVuc2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgdGhpcy5yZWRCZWFtLnJlc2V0KCk7XHJcbiAgICB0aGlzLmdyZWVuQmVhbS5yZXNldCgpO1xyXG4gICAgdGhpcy5ibHVlQmVhbS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuY29sb3JWaXNpb24ucmVnaXN0ZXIoICdSR0JNb2RlbCcsIFJHQk1vZGVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSR0JNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsVUFBVSxNQUFNLHdDQUF3QztBQUMvRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0MsZ0JBQWdCLE1BQU0sd0NBQXdDO0FBQ3JFLE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7O0FBRTFEO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLElBQUlSLEtBQUssQ0FBRSxDQUFDLEVBQUUsR0FBSSxDQUFDO0FBQ3pDLE1BQU1TLGtCQUFrQixHQUFHLElB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