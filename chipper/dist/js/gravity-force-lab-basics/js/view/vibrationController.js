// Copyright 2020-2022, University of Colorado Boulder

/**
 * Manages vibration for gravity-force-lab-basics.
 *
 * @author Jesse Greenberg
 */

import Multilink from '../../../axon/js/Multilink.js';
import LinearFunction from '../../../dot/js/LinearFunction.js';
import Utils from '../../../dot/js/Utils.js';
import VibrationPatterns from '../../../tappi/js/VibrationPatterns.js';
import GFLBConstants from '../GFLBConstants.js';
import gravityForceLabBasics from '../gravityForceLabBasics.js';

// constants
// extreme values for the intensity of vibration pattern representing mass
const LOW_MASS_INTENSITY = 0.3;
const HIGH_MASS_INTENSITY = 1;
const minMass = GFLBConstants.MASS_RANGE.min;
const maxMass = GFLBConstants.MASS_RANGE.max;
class VibrationController {
  constructor() {}

  /**
   * @public
   * @param vibrationManageriOS
   * @param model
   */
  initialize(vibrationManageriOS, model) {
    const paradigmChoice = phet.chipper.queryParameters.vibrationParadigm;
    let forceIntensityMap;
    let forceSharpnessMap;
    if (paradigmChoice === '1') {
      // in this paradigm we are trying to convey the inverse square law and still have vibration
      // detectable for the full range of motion. So rather than map intensity/sharpness directly
      // to force, intensity is mapped like 1/r^2 with distance, and sharpness is mapped linearly
      // to the mass

      // intensity increases exponentially with distance
      // using distance at max mass, so that changes can be felt clearly without requiring "constant
      // size" to be checked
      const minIntensity = 0.4;
      const maxIntensity = 1;
      forceIntensityMap = force => {
        const minSeparation = model.getSumRadiusWithSeparation() / 1000;
        const separation = (model.object2.positionProperty.get() - model.object1.positionProperty.get()) / 1000;

        // an offset for the inverse square function such that the intensity is 1 when separation
        // is at minimum for the given sphere radii
        const xOffset = Math.pow(1 / (maxIntensity - minIntensity), 0.5) - minSeparation;
        const intensity = 1 / Math.pow(separation + xOffset, 2) + minIntensity;
        return Utils.clamp(intensity, minIntensity, maxIntensity);
      };

      // sharpness increases linearly with mass
      const massSharpnessMap = new LinearFunction(2 * minMass, 2 * maxMass, 0.4, 1);
      forceSharpnessMap = mass => {
        return massSharpnessMap.evaluate(model.object1.valueProperty.value + model.object2.valueProperty.value);
      };
    }
    let forceIntensityValue = forceIntensityMap(model.forceProperty.get());
    let forceSharpnessValue = forceSharpnessMap(model.forceProperty.get());
    model.forceProperty.link(force => {
      // only change intensity of vibration while a mass is being dragged
      if (model.object1.isDraggingProperty.value || model.object2.isDraggingProperty.value) {
        forceIntensityValue = forceIntensityMap(force);
        forceSharpnessValue = forceSharpnessMap(force);
        vibrationManageriOS.setVibrationIntensity(forceIntensityValue);
        vibrationManageriOS.setVibrationSharpness(forceSharpnessValue);
      }
    });
    Multilink.multilink([model.object1.isDraggingProperty, model.object2.isDraggingProperty], (object1Dragging, object2Dragging) => {
      if (object1Dragging || object2Dragging) {
        vibrationManageriOS.vibrateContinuous();
        vibrationManageriOS.setVibrationIntensity(forceIntensityValue);
        vibrationManageriOS.setVibrationSharpness(forceSharpnessValue);
      } else {
        vibrationManageriOS.stop();
      }
    });

    // maps the mass value to the intensity of vibration
    const massIntensityFunction = new LinearFunction(minMass, maxMass, LOW_MASS_INTENSITY, HIGH_MASS_INTENSITY);

    // a single pulse per mass change, with dynamic intensity
    const clickingMassVibrationListener = mass => {
      vibrationManageriOS.vibrateContinuous({
        duration: 0.030,
        intensity: massIntensityFunction.evaluate(mass)
      });
    };
    model.object1.valueProperty.lazyLink(clickingMassVibrationListener);
    model.object2.valueProperty.lazyLink(clickingMassVibrationListener);

    // after resetting or activating a checkbox, request the interactionSuccess pattern
    model.resetInProgressProperty.lazyLink(inProgress => {
      if (!inProgress) {
        VibrationPatterns.interactionSuccess(vibrationManageriOS);
      }
    });
    model.showForceValuesProperty.lazyLink(showForceValues => {
      VibrationPatterns.interactionSuccess(vibrationManageriOS);
    });
    model.showDistanceProperty.lazyLink(showDistance => {
      VibrationPatterns.interactionSuccess(vibrationManageriOS);
    });
    model.constantRadiusProperty.lazyLink(constantRadius => {
      VibrationPatterns.interactionSuccess(vibrationManageriOS);
    });
  }
}
const vibrationController = new VibrationController();
gravityForceLabBasics.register('VibrationController', VibrationController);
export default vibrationController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJMaW5lYXJGdW5jdGlvbiIsIlV0aWxzIiwiVmlicmF0aW9uUGF0dGVybnMiLCJHRkxCQ29uc3RhbnRzIiwiZ3Jhdml0eUZvcmNlTGFiQmFzaWNzIiwiTE9XX01BU1NfSU5URU5TSVRZIiwiSElHSF9NQVNTX0lOVEVOU0lUWSIsIm1pbk1hc3MiLCJNQVNTX1JBTkdFIiwibWluIiwibWF4TWFzcyIsIm1heCIsIlZpYnJhdGlvbkNvbnRyb2xsZXIiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxpemUiLCJ2aWJyYXRpb25NYW5hZ2VyaU9TIiwibW9kZWwiLCJwYXJhZGlnbUNob2ljZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwidmlicmF0aW9uUGFyYWRpZ20iLCJmb3JjZUludGVuc2l0eU1hcCIsImZvcmNlU2hhcnBuZXNzTWFwIiwibWluSW50ZW5zaXR5IiwibWF4SW50ZW5zaXR5IiwiZm9yY2UiLCJtaW5TZXBhcmF0aW9uIiwiZ2V0U3VtUmFkaXVzV2l0aFNlcGFyYXRpb24iLCJzZXBhcmF0aW9uIiwib2JqZWN0MiIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJvYmplY3QxIiwieE9mZnNldCIsIk1hdGgiLCJwb3ciLCJpbnRlbnNpdHkiLCJjbGFtcCIsIm1hc3NTaGFycG5lc3NNYXAiLCJtYXNzIiwiZXZhbHVhdGUiLCJ2YWx1ZVByb3BlcnR5IiwidmFsdWUiLCJmb3JjZUludGVuc2l0eVZhbHVlIiwiZm9yY2VQcm9wZXJ0eSIsImZvcmNlU2hhcnBuZXNzVmFsdWUiLCJsaW5rIiwiaXNEcmFnZ2luZ1Byb3BlcnR5Iiwic2V0VmlicmF0aW9uSW50ZW5zaXR5Iiwic2V0VmlicmF0aW9uU2hhcnBuZXNzIiwibXVsdGlsaW5rIiwib2JqZWN0MURyYWdnaW5nIiwib2JqZWN0MkRyYWdnaW5nIiwidmlicmF0ZUNvbnRpbnVvdXMiLCJzdG9wIiwibWFzc0ludGVuc2l0eUZ1bmN0aW9uIiwiY2xpY2tpbmdNYXNzVmlicmF0aW9uTGlzdGVuZXIiLCJkdXJhdGlvbiIsImxhenlMaW5rIiwicmVzZXRJblByb2dyZXNzUHJvcGVydHkiLCJpblByb2dyZXNzIiwiaW50ZXJhY3Rpb25TdWNjZXNzIiwic2hvd0ZvcmNlVmFsdWVzUHJvcGVydHkiLCJzaG93Rm9yY2VWYWx1ZXMiLCJzaG93RGlzdGFuY2VQcm9wZXJ0eSIsInNob3dEaXN0YW5jZSIsImNvbnN0YW50UmFkaXVzUHJvcGVydHkiLCJjb25zdGFudFJhZGl1cyIsInZpYnJhdGlvbkNvbnRyb2xsZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbInZpYnJhdGlvbkNvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFuYWdlcyB2aWJyYXRpb24gZm9yIGdyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IExpbmVhckZ1bmN0aW9uIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9MaW5lYXJGdW5jdGlvbi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmlicmF0aW9uUGF0dGVybnMgZnJvbSAnLi4vLi4vLi4vdGFwcGkvanMvVmlicmF0aW9uUGF0dGVybnMuanMnO1xyXG5pbXBvcnQgR0ZMQkNvbnN0YW50cyBmcm9tICcuLi9HRkxCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGdyYXZpdHlGb3JjZUxhYkJhc2ljcyBmcm9tICcuLi9ncmF2aXR5Rm9yY2VMYWJCYXNpY3MuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIGV4dHJlbWUgdmFsdWVzIGZvciB0aGUgaW50ZW5zaXR5IG9mIHZpYnJhdGlvbiBwYXR0ZXJuIHJlcHJlc2VudGluZyBtYXNzXHJcbmNvbnN0IExPV19NQVNTX0lOVEVOU0lUWSA9IDAuMztcclxuY29uc3QgSElHSF9NQVNTX0lOVEVOU0lUWSA9IDE7XHJcblxyXG5jb25zdCBtaW5NYXNzID0gR0ZMQkNvbnN0YW50cy5NQVNTX1JBTkdFLm1pbjtcclxuY29uc3QgbWF4TWFzcyA9IEdGTEJDb25zdGFudHMuTUFTU19SQU5HRS5tYXg7XHJcblxyXG5jbGFzcyBWaWJyYXRpb25Db250cm9sbGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0gdmlicmF0aW9uTWFuYWdlcmlPU1xyXG4gICAqIEBwYXJhbSBtb2RlbFxyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIHZpYnJhdGlvbk1hbmFnZXJpT1MsIG1vZGVsICkge1xyXG4gICAgY29uc3QgcGFyYWRpZ21DaG9pY2UgPSBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnZpYnJhdGlvblBhcmFkaWdtO1xyXG5cclxuICAgIGxldCBmb3JjZUludGVuc2l0eU1hcDtcclxuICAgIGxldCBmb3JjZVNoYXJwbmVzc01hcDtcclxuXHJcbiAgICBpZiAoIHBhcmFkaWdtQ2hvaWNlID09PSAnMScgKSB7XHJcblxyXG4gICAgICAvLyBpbiB0aGlzIHBhcmFkaWdtIHdlIGFyZSB0cnlpbmcgdG8gY29udmV5IHRoZSBpbnZlcnNlIHNxdWFyZSBsYXcgYW5kIHN0aWxsIGhhdmUgdmlicmF0aW9uXHJcbiAgICAgIC8vIGRldGVjdGFibGUgZm9yIHRoZSBmdWxsIHJhbmdlIG9mIG1vdGlvbi4gU28gcmF0aGVyIHRoYW4gbWFwIGludGVuc2l0eS9zaGFycG5lc3MgZGlyZWN0bHlcclxuICAgICAgLy8gdG8gZm9yY2UsIGludGVuc2l0eSBpcyBtYXBwZWQgbGlrZSAxL3JeMiB3aXRoIGRpc3RhbmNlLCBhbmQgc2hhcnBuZXNzIGlzIG1hcHBlZCBsaW5lYXJseVxyXG4gICAgICAvLyB0byB0aGUgbWFzc1xyXG5cclxuICAgICAgLy8gaW50ZW5zaXR5IGluY3JlYXNlcyBleHBvbmVudGlhbGx5IHdpdGggZGlzdGFuY2VcclxuICAgICAgLy8gdXNpbmcgZGlzdGFuY2UgYXQgbWF4IG1hc3MsIHNvIHRoYXQgY2hhbmdlcyBjYW4gYmUgZmVsdCBjbGVhcmx5IHdpdGhvdXQgcmVxdWlyaW5nIFwiY29uc3RhbnRcclxuICAgICAgLy8gc2l6ZVwiIHRvIGJlIGNoZWNrZWRcclxuICAgICAgY29uc3QgbWluSW50ZW5zaXR5ID0gMC40O1xyXG4gICAgICBjb25zdCBtYXhJbnRlbnNpdHkgPSAxO1xyXG4gICAgICBmb3JjZUludGVuc2l0eU1hcCA9IGZvcmNlID0+IHtcclxuICAgICAgICBjb25zdCBtaW5TZXBhcmF0aW9uID0gbW9kZWwuZ2V0U3VtUmFkaXVzV2l0aFNlcGFyYXRpb24oKSAvIDEwMDA7XHJcbiAgICAgICAgY29uc3Qgc2VwYXJhdGlvbiA9ICggbW9kZWwub2JqZWN0Mi5wb3NpdGlvblByb3BlcnR5LmdldCgpIC0gbW9kZWwub2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LmdldCgpICkgLyAxMDAwO1xyXG5cclxuICAgICAgICAvLyBhbiBvZmZzZXQgZm9yIHRoZSBpbnZlcnNlIHNxdWFyZSBmdW5jdGlvbiBzdWNoIHRoYXQgdGhlIGludGVuc2l0eSBpcyAxIHdoZW4gc2VwYXJhdGlvblxyXG4gICAgICAgIC8vIGlzIGF0IG1pbmltdW0gZm9yIHRoZSBnaXZlbiBzcGhlcmUgcmFkaWlcclxuICAgICAgICBjb25zdCB4T2Zmc2V0ID0gTWF0aC5wb3coIDEgLyAoIG1heEludGVuc2l0eSAtIG1pbkludGVuc2l0eSApLCAwLjUgKSAtIG1pblNlcGFyYXRpb247XHJcbiAgICAgICAgY29uc3QgaW50ZW5zaXR5ID0gMSAvIE1hdGgucG93KCBzZXBhcmF0aW9uICsgeE9mZnNldCwgMiApICsgbWluSW50ZW5zaXR5O1xyXG4gICAgICAgIHJldHVybiBVdGlscy5jbGFtcCggaW50ZW5zaXR5LCBtaW5JbnRlbnNpdHksIG1heEludGVuc2l0eSApO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gc2hhcnBuZXNzIGluY3JlYXNlcyBsaW5lYXJseSB3aXRoIG1hc3NcclxuICAgICAgY29uc3QgbWFzc1NoYXJwbmVzc01hcCA9IG5ldyBMaW5lYXJGdW5jdGlvbiggMiAqIG1pbk1hc3MsIDIgKiBtYXhNYXNzLCAwLjQsIDEgKTtcclxuICAgICAgZm9yY2VTaGFycG5lc3NNYXAgPSBtYXNzID0+IHtcclxuICAgICAgICByZXR1cm4gbWFzc1NoYXJwbmVzc01hcC5ldmFsdWF0ZSggbW9kZWwub2JqZWN0MS52YWx1ZVByb3BlcnR5LnZhbHVlICsgbW9kZWwub2JqZWN0Mi52YWx1ZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZvcmNlSW50ZW5zaXR5VmFsdWUgPSBmb3JjZUludGVuc2l0eU1hcCggbW9kZWwuZm9yY2VQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgbGV0IGZvcmNlU2hhcnBuZXNzVmFsdWUgPSBmb3JjZVNoYXJwbmVzc01hcCggbW9kZWwuZm9yY2VQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgbW9kZWwuZm9yY2VQcm9wZXJ0eS5saW5rKCBmb3JjZSA9PiB7XHJcblxyXG4gICAgICAvLyBvbmx5IGNoYW5nZSBpbnRlbnNpdHkgb2YgdmlicmF0aW9uIHdoaWxlIGEgbWFzcyBpcyBiZWluZyBkcmFnZ2VkXHJcbiAgICAgIGlmICggbW9kZWwub2JqZWN0MS5pc0RyYWdnaW5nUHJvcGVydHkudmFsdWUgfHwgbW9kZWwub2JqZWN0Mi5pc0RyYWdnaW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgZm9yY2VJbnRlbnNpdHlWYWx1ZSA9IGZvcmNlSW50ZW5zaXR5TWFwKCBmb3JjZSApO1xyXG4gICAgICAgIGZvcmNlU2hhcnBuZXNzVmFsdWUgPSBmb3JjZVNoYXJwbmVzc01hcCggZm9yY2UgKTtcclxuICAgICAgICB2aWJyYXRpb25NYW5hZ2VyaU9TLnNldFZpYnJhdGlvbkludGVuc2l0eSggZm9yY2VJbnRlbnNpdHlWYWx1ZSApO1xyXG4gICAgICAgIHZpYnJhdGlvbk1hbmFnZXJpT1Muc2V0VmlicmF0aW9uU2hhcnBuZXNzKCBmb3JjZVNoYXJwbmVzc1ZhbHVlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLm9iamVjdDEuaXNEcmFnZ2luZ1Byb3BlcnR5LCBtb2RlbC5vYmplY3QyLmlzRHJhZ2dpbmdQcm9wZXJ0eSBdLCAoIG9iamVjdDFEcmFnZ2luZywgb2JqZWN0MkRyYWdnaW5nICkgPT4ge1xyXG4gICAgICBpZiAoIG9iamVjdDFEcmFnZ2luZyB8fCBvYmplY3QyRHJhZ2dpbmcgKSB7XHJcbiAgICAgICAgdmlicmF0aW9uTWFuYWdlcmlPUy52aWJyYXRlQ29udGludW91cygpO1xyXG4gICAgICAgIHZpYnJhdGlvbk1hbmFnZXJpT1Muc2V0VmlicmF0aW9uSW50ZW5zaXR5KCBmb3JjZUludGVuc2l0eVZhbHVlICk7XHJcbiAgICAgICAgdmlicmF0aW9uTWFuYWdlcmlPUy5zZXRWaWJyYXRpb25TaGFycG5lc3MoIGZvcmNlU2hhcnBuZXNzVmFsdWUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB2aWJyYXRpb25NYW5hZ2VyaU9TLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG1hcHMgdGhlIG1hc3MgdmFsdWUgdG8gdGhlIGludGVuc2l0eSBvZiB2aWJyYXRpb25cclxuICAgIGNvbnN0IG1hc3NJbnRlbnNpdHlGdW5jdGlvbiA9IG5ldyBMaW5lYXJGdW5jdGlvbiggbWluTWFzcywgbWF4TWFzcywgTE9XX01BU1NfSU5URU5TSVRZLCBISUdIX01BU1NfSU5URU5TSVRZICk7XHJcblxyXG4gICAgLy8gYSBzaW5nbGUgcHVsc2UgcGVyIG1hc3MgY2hhbmdlLCB3aXRoIGR5bmFtaWMgaW50ZW5zaXR5XHJcbiAgICBjb25zdCBjbGlja2luZ01hc3NWaWJyYXRpb25MaXN0ZW5lciA9IG1hc3MgPT4ge1xyXG4gICAgICB2aWJyYXRpb25NYW5hZ2VyaU9TLnZpYnJhdGVDb250aW51b3VzKCB7XHJcbiAgICAgICAgZHVyYXRpb246IDAuMDMwLFxyXG4gICAgICAgIGludGVuc2l0eTogbWFzc0ludGVuc2l0eUZ1bmN0aW9uLmV2YWx1YXRlKCBtYXNzIClcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2RlbC5vYmplY3QxLnZhbHVlUHJvcGVydHkubGF6eUxpbmsoIGNsaWNraW5nTWFzc1ZpYnJhdGlvbkxpc3RlbmVyICk7XHJcbiAgICBtb2RlbC5vYmplY3QyLnZhbHVlUHJvcGVydHkubGF6eUxpbmsoIGNsaWNraW5nTWFzc1ZpYnJhdGlvbkxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gYWZ0ZXIgcmVzZXR0aW5nIG9yIGFjdGl2YXRpbmcgYSBjaGVja2JveCwgcmVxdWVzdCB0aGUgaW50ZXJhY3Rpb25TdWNjZXNzIHBhdHRlcm5cclxuICAgIG1vZGVsLnJlc2V0SW5Qcm9ncmVzc1Byb3BlcnR5LmxhenlMaW5rKCBpblByb2dyZXNzID0+IHtcclxuICAgICAgaWYgKCAhaW5Qcm9ncmVzcyApIHtcclxuICAgICAgICBWaWJyYXRpb25QYXR0ZXJucy5pbnRlcmFjdGlvblN1Y2Nlc3MoIHZpYnJhdGlvbk1hbmFnZXJpT1MgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgbW9kZWwuc2hvd0ZvcmNlVmFsdWVzUHJvcGVydHkubGF6eUxpbmsoIHNob3dGb3JjZVZhbHVlcyA9PiB7XHJcbiAgICAgIFZpYnJhdGlvblBhdHRlcm5zLmludGVyYWN0aW9uU3VjY2VzcyggdmlicmF0aW9uTWFuYWdlcmlPUyApO1xyXG4gICAgfSApO1xyXG4gICAgbW9kZWwuc2hvd0Rpc3RhbmNlUHJvcGVydHkubGF6eUxpbmsoIHNob3dEaXN0YW5jZSA9PiB7XHJcbiAgICAgIFZpYnJhdGlvblBhdHRlcm5zLmludGVyYWN0aW9uU3VjY2VzcyggdmlicmF0aW9uTWFuYWdlcmlPUyApO1xyXG4gICAgfSApO1xyXG4gICAgbW9kZWwuY29uc3RhbnRSYWRpdXNQcm9wZXJ0eS5sYXp5TGluayggY29uc3RhbnRSYWRpdXMgPT4ge1xyXG4gICAgICBWaWJyYXRpb25QYXR0ZXJucy5pbnRlcmFjdGlvblN1Y2Nlc3MoIHZpYnJhdGlvbk1hbmFnZXJpT1MgKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHZpYnJhdGlvbkNvbnRyb2xsZXIgPSBuZXcgVmlicmF0aW9uQ29udHJvbGxlcigpO1xyXG5cclxuZ3Jhdml0eUZvcmNlTGFiQmFzaWNzLnJlZ2lzdGVyKCAnVmlicmF0aW9uQ29udHJvbGxlcicsIFZpYnJhdGlvbkNvbnRyb2xsZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgdmlicmF0aW9uQ29udHJvbGxlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLCtCQUErQjtBQUNyRCxPQUFPQyxjQUFjLE1BQU0sbUNBQW1DO0FBQzlELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsaUJBQWlCLE1BQU0sd0NBQXdDO0FBQ3RFLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCOztBQUUvRDtBQUNBO0FBQ0EsTUFBTUMsa0JBQWtCLEdBQUcsR0FBRztBQUM5QixNQUFNQyxtQkFBbUIsR0FBRyxDQUFDO0FBRTdCLE1BQU1DLE9BQU8sR0FBR0osYUFBYSxDQUFDSyxVQUFVLENBQUNDLEdBQUc7QUFDNUMsTUFBTUMsT0FBTyxHQUFHUCxhQUFhLENBQUNLLFVBQVUsQ0FBQ0csR0FBRztBQUU1QyxNQUFNQyxtQkFBbUIsQ0FBQztFQUN4QkMsV0FBV0EsQ0FBQSxFQUFHLENBQUM7O0VBRWY7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxVQUFVQSxDQUFFQyxtQkFBbUIsRUFBRUMsS0FBSyxFQUFHO0lBQ3ZDLE1BQU1DLGNBQWMsR0FBR0MsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsaUJBQWlCO0lBRXJFLElBQUlDLGlCQUFpQjtJQUNyQixJQUFJQyxpQkFBaUI7SUFFckIsSUFBS04sY0FBYyxLQUFLLEdBQUcsRUFBRztNQUU1QjtNQUNBO01BQ0E7TUFDQTs7TUFFQTtNQUNBO01BQ0E7TUFDQSxNQUFNTyxZQUFZLEdBQUcsR0FBRztNQUN4QixNQUFNQyxZQUFZLEdBQUcsQ0FBQztNQUN0QkgsaUJBQWlCLEdBQUdJLEtBQUssSUFBSTtRQUMzQixNQUFNQyxhQUFhLEdBQUdYLEtBQUssQ0FBQ1ksMEJBQTBCLENBQUMsQ0FBQyxHQUFHLElBQUk7UUFDL0QsTUFBTUMsVUFBVSxHQUFHLENBQUViLEtBQUssQ0FBQ2MsT0FBTyxDQUFDQyxnQkFBZ0IsQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBR2hCLEtBQUssQ0FBQ2lCLE9BQU8sQ0FBQ0YsZ0JBQWdCLENBQUNDLEdBQUcsQ0FBQyxDQUFDLElBQUssSUFBSTs7UUFFekc7UUFDQTtRQUNBLE1BQU1FLE9BQU8sR0FBR0MsSUFBSSxDQUFDQyxHQUFHLENBQUUsQ0FBQyxJQUFLWCxZQUFZLEdBQUdELFlBQVksQ0FBRSxFQUFFLEdBQUksQ0FBQyxHQUFHRyxhQUFhO1FBQ3BGLE1BQU1VLFNBQVMsR0FBRyxDQUFDLEdBQUdGLElBQUksQ0FBQ0MsR0FBRyxDQUFFUCxVQUFVLEdBQUdLLE9BQU8sRUFBRSxDQUFFLENBQUMsR0FBR1YsWUFBWTtRQUN4RSxPQUFPdkIsS0FBSyxDQUFDcUMsS0FBSyxDQUFFRCxTQUFTLEVBQUViLFlBQVksRUFBRUMsWUFBYSxDQUFDO01BQzdELENBQUM7O01BRUQ7TUFDQSxNQUFNYyxnQkFBZ0IsR0FBRyxJQUFJdkMsY0FBYyxDQUFFLENBQUMsR0FBR08sT0FBTyxFQUFFLENBQUMsR0FBR0csT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFFLENBQUM7TUFDL0VhLGlCQUFpQixHQUFHaUIsSUFBSSxJQUFJO1FBQzFCLE9BQU9ELGdCQUFnQixDQUFDRSxRQUFRLENBQUV6QixLQUFLLENBQUNpQixPQUFPLENBQUNTLGFBQWEsQ0FBQ0MsS0FBSyxHQUFHM0IsS0FBSyxDQUFDYyxPQUFPLENBQUNZLGFBQWEsQ0FBQ0MsS0FBTSxDQUFDO01BQzNHLENBQUM7SUFDSDtJQUVBLElBQUlDLG1CQUFtQixHQUFHdEIsaUJBQWlCLENBQUVOLEtBQUssQ0FBQzZCLGFBQWEsQ0FBQ2IsR0FBRyxDQUFDLENBQUUsQ0FBQztJQUN4RSxJQUFJYyxtQkFBbUIsR0FBR3ZCLGlCQUFpQixDQUFFUCxLQUFLLENBQUM2QixhQUFhLENBQUNiLEdBQUcsQ0FBQyxDQUFFLENBQUM7SUFDeEVoQixLQUFLLENBQUM2QixhQUFhLENBQUNFLElBQUksQ0FBRXJCLEtBQUssSUFBSTtNQUVqQztNQUNBLElBQUtWLEtBQUssQ0FBQ2lCLE9BQU8sQ0FBQ2Usa0JBQWtCLENBQUNMLEtBQUssSUFBSTNCLEtBQUssQ0FBQ2MsT0FBTyxDQUFDa0Isa0JBQWtCLENBQUNMLEtBQUssRUFBRztRQUN0RkMsbUJBQW1CLEdBQUd0QixpQkFBaUIsQ0FBRUksS0FBTSxDQUFDO1FBQ2hEb0IsbUJBQW1CLEdBQUd2QixpQkFBaUIsQ0FBRUcsS0FBTSxDQUFDO1FBQ2hEWCxtQkFBbUIsQ0FBQ2tDLHFCQUFxQixDQUFFTCxtQkFBb0IsQ0FBQztRQUNoRTdCLG1CQUFtQixDQUFDbUMscUJBQXFCLENBQUVKLG1CQUFvQixDQUFDO01BQ2xFO0lBQ0YsQ0FBRSxDQUFDO0lBRUgvQyxTQUFTLENBQUNvRCxTQUFTLENBQUUsQ0FBRW5DLEtBQUssQ0FBQ2lCLE9BQU8sQ0FBQ2Usa0JBQWtCLEVBQUVoQyxLQUFLLENBQUNjLE9BQU8sQ0FBQ2tCLGtCQUFrQixDQUFFLEVBQUUsQ0FBRUksZUFBZSxFQUFFQyxlQUFlLEtBQU07TUFDbkksSUFBS0QsZUFBZSxJQUFJQyxlQUFlLEVBQUc7UUFDeEN0QyxtQkFBbUIsQ0FBQ3VDLGlCQUFpQixDQUFDLENBQUM7UUFDdkN2QyxtQkFBbUIsQ0FBQ2tDLHFCQUFxQixDQUFFTCxtQkFBb0IsQ0FBQztRQUNoRTdCLG1CQUFtQixDQUFDbUMscUJBQXFCLENBQUVKLG1CQUFvQixDQUFDO01BQ2xFLENBQUMsTUFDSTtRQUNIL0IsbUJBQW1CLENBQUN3QyxJQUFJLENBQUMsQ0FBQztNQUM1QjtJQUNGLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLHFCQUFxQixHQUFHLElBQUl4RCxjQUFjLENBQUVPLE9BQU8sRUFBRUcsT0FBTyxFQUFFTCxrQkFBa0IsRUFBRUMsbUJBQW9CLENBQUM7O0lBRTdHO0lBQ0EsTUFBTW1ELDZCQUE2QixHQUFHakIsSUFBSSxJQUFJO01BQzVDekIsbUJBQW1CLENBQUN1QyxpQkFBaUIsQ0FBRTtRQUNyQ0ksUUFBUSxFQUFFLEtBQUs7UUFDZnJCLFNBQVMsRUFBRW1CLHFCQUFxQixDQUFDZixRQUFRLENBQUVELElBQUs7TUFDbEQsQ0FBRSxDQUFDO0lBQ0wsQ0FBQztJQUVEeEIsS0FBSyxDQUFDaUIsT0FBTyxDQUFDUyxhQUFhLENBQUNpQixRQUFRLENBQUVGLDZCQUE4QixDQUFDO0lBQ3JFekMsS0FBSyxDQUFDYyxPQUFPLENBQUNZLGFBQWEsQ0FBQ2lCLFFBQVEsQ0FBRUYsNkJBQThCLENBQUM7O0lBRXJFO0lBQ0F6QyxLQUFLLENBQUM0Qyx1QkFBdUIsQ0FBQ0QsUUFBUSxDQUFFRSxVQUFVLElBQUk7TUFDcEQsSUFBSyxDQUFDQSxVQUFVLEVBQUc7UUFDakIzRCxpQkFBaUIsQ0FBQzRELGtCQUFrQixDQUFFL0MsbUJBQW9CLENBQUM7TUFDN0Q7SUFDRixDQUFFLENBQUM7SUFDSEMsS0FBSyxDQUFDK0MsdUJBQXVCLENBQUNKLFFBQVEsQ0FBRUssZUFBZSxJQUFJO01BQ3pEOUQsaUJBQWlCLENBQUM0RCxrQkFBa0IsQ0FBRS9DLG1CQUFvQixDQUFDO0lBQzdELENBQUUsQ0FBQztJQUNIQyxLQUFLLENBQUNpRCxvQkFBb0IsQ0FBQ04sUUFBUSxDQUFFTyxZQUFZLElBQUk7TUFDbkRoRSxpQkFBaUIsQ0FBQzRELGtCQUFrQixDQUFFL0MsbUJBQW9CLENBQUM7SUFDN0QsQ0FBRSxDQUFDO0lBQ0hDLEtBQUssQ0FBQ21ELHNCQUFzQixDQUFDUixRQUFRLENBQUVTLGNBQWMsSUFBSTtNQUN2RGxFLGlCQUFpQixDQUFDNEQsa0JBQWtCLENBQUUvQyxtQkFBb0IsQ0FBQztJQUM3RCxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUEsTUFBTXNELG1CQUFtQixHQUFHLElBQUl6RCxtQkFBbUIsQ0FBQyxDQUFDO0FBRXJEUixxQkFBcUIsQ0FBQ2tFLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRTFELG1CQUFvQixDQUFDO0FBQzVFLGVBQWV5RCxtQkFBbUIifQ==