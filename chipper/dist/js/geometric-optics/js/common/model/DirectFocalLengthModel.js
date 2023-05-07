// Copyright 2022-2023, University of Colorado Boulder

/**
 * DirectFocalLengthModel is the model where focal length is set directly.
 * IOR is fixed, and ROC is derived from focal length and IOR.
 * See https://github.com/phetsims/geometric-optics/issues/255
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import geometricOptics from '../../geometricOptics.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import GOPreferences from './GOPreferences.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class DirectFocalLengthModel extends PhetioObject {
  // see FocalLengthModel

  // Resets things that are specific to this class.

  constructor(opticSurfaceTypeProperty, providedOptions) {
    const options = optionize()({
      // PhetioObjectOptions
      phetioState: false,
      phetioDocumentation: 'Model of focal length that is used when ' + `${GOPreferences.focalLengthModelTypeProperty.tandem.phetioID} ` + 'is set to \'direct\'. Ignored for flat mirror. In this model:' + '<ul>' + '<li>focal length is settable' + '<li>index of refraction is fixed' + '<li>radius of curvature is derived' + '</ul>'
    }, providedOptions);
    super(options);
    this.focalLengthMagnitudeProperty = new NumberProperty(options.focalLengthMagnitudeRange.defaultValue, {
      units: 'cm',
      range: options.focalLengthMagnitudeRange,
      tandem: options.tandem.createTandem('focalLengthMagnitudeProperty'),
      phetioFeatured: true,
      phetioDocumentation: 'magnitude of the focal length (no sign)'
    });
    assert && assert(options.indexOfRefractionRange?.getLength() === 0, 'indexOfRefraction should be a fixed value');
    this.indexOfRefractionProperty = new NumberProperty(options.indexOfRefractionRange.defaultValue, {
      range: options.indexOfRefractionRange,
      // units: unitless
      tandem: options.tandem.createTandem('indexOfRefractionProperty'),
      phetioReadOnly: true
    });
    this.radiusOfCurvatureMagnitudeProperty = new DerivedProperty([opticSurfaceTypeProperty, this.focalLengthMagnitudeProperty, this.indexOfRefractionProperty], (opticSurfaceType, focalLengthMagnitude, indexOfRefraction) => focalLengthMagnitude * (2 * (indexOfRefraction - 1)), {
      units: 'cm',
      tandem: options.tandem.createTandem('radiusOfCurvatureMagnitudeProperty'),
      phetioDocumentation: 'magnitude of the radius of curvature (no sign)',
      phetioValueType: NumberIO
    });
    this.resetDirectFocalLengthModel = () => {
      this.focalLengthMagnitudeProperty.reset();
      this.indexOfRefractionProperty.reset();
    };
  }

  /**
   * Synchronizes with another focal-length model by copying the values that are settable in this model.
   * Constrain values so that floating-point error doesn't cause range exceptions.
   */
  syncToModel(model) {
    assert && assert(model !== this);
    this.focalLengthMagnitudeProperty.value = this.focalLengthMagnitudeProperty.range.constrainValue(model.focalLengthMagnitudeProperty.value);
  }
  reset() {
    this.resetDirectFocalLengthModel();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
geometricOptics.register('DirectFocalLengthModel', DirectFocalLengthModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0aW9PYmplY3QiLCJOdW1iZXJQcm9wZXJ0eSIsIkRlcml2ZWRQcm9wZXJ0eSIsImdlb21ldHJpY09wdGljcyIsIk51bWJlcklPIiwiR09QcmVmZXJlbmNlcyIsIm9wdGlvbml6ZSIsIkRpcmVjdEZvY2FsTGVuZ3RoTW9kZWwiLCJjb25zdHJ1Y3RvciIsIm9wdGljU3VyZmFjZVR5cGVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJmb2NhbExlbmd0aE1vZGVsVHlwZVByb3BlcnR5IiwidGFuZGVtIiwicGhldGlvSUQiLCJmb2NhbExlbmd0aE1hZ25pdHVkZVByb3BlcnR5IiwiZm9jYWxMZW5ndGhNYWduaXR1ZGVSYW5nZSIsImRlZmF1bHRWYWx1ZSIsInVuaXRzIiwicmFuZ2UiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9GZWF0dXJlZCIsImFzc2VydCIsImluZGV4T2ZSZWZyYWN0aW9uUmFuZ2UiLCJnZXRMZW5ndGgiLCJpbmRleE9mUmVmcmFjdGlvblByb3BlcnR5IiwicGhldGlvUmVhZE9ubHkiLCJyYWRpdXNPZkN1cnZhdHVyZU1hZ25pdHVkZVByb3BlcnR5Iiwib3B0aWNTdXJmYWNlVHlwZSIsImZvY2FsTGVuZ3RoTWFnbml0dWRlIiwiaW5kZXhPZlJlZnJhY3Rpb24iLCJwaGV0aW9WYWx1ZVR5cGUiLCJyZXNldERpcmVjdEZvY2FsTGVuZ3RoTW9kZWwiLCJyZXNldCIsInN5bmNUb01vZGVsIiwibW9kZWwiLCJ2YWx1ZSIsImNvbnN0cmFpblZhbHVlIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGlyZWN0Rm9jYWxMZW5ndGhNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXJlY3RGb2NhbExlbmd0aE1vZGVsIGlzIHRoZSBtb2RlbCB3aGVyZSBmb2NhbCBsZW5ndGggaXMgc2V0IGRpcmVjdGx5LlxyXG4gKiBJT1IgaXMgZml4ZWQsIGFuZCBST0MgaXMgZGVyaXZlZCBmcm9tIGZvY2FsIGxlbmd0aCBhbmQgSU9SLlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dlb21ldHJpYy1vcHRpY3MvaXNzdWVzLzI1NVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IE9wdGljU3VyZmFjZVR5cGUgfSBmcm9tICcuL09wdGljU3VyZmFjZVR5cGUuanMnO1xyXG5pbXBvcnQgRm9jYWxMZW5ndGhNb2RlbCBmcm9tICcuL0ZvY2FsTGVuZ3RoTW9kZWwuanMnO1xyXG5pbXBvcnQgUmFuZ2VXaXRoVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlV2l0aFZhbHVlLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IEdPUHJlZmVyZW5jZXMgZnJvbSAnLi9HT1ByZWZlcmVuY2VzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgZm9jYWxMZW5ndGhNYWduaXR1ZGVSYW5nZTogUmFuZ2VXaXRoVmFsdWU7XHJcbiAgaW5kZXhPZlJlZnJhY3Rpb25SYW5nZTogUmFuZ2VXaXRoVmFsdWU7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEaXJlY3RGb2NhbExlbmd0aE1vZGVsT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpcmVjdEZvY2FsTGVuZ3RoTW9kZWwgZXh0ZW5kcyBQaGV0aW9PYmplY3QgaW1wbGVtZW50cyBGb2NhbExlbmd0aE1vZGVsIHtcclxuXHJcbiAgLy8gc2VlIEZvY2FsTGVuZ3RoTW9kZWxcclxuICBwdWJsaWMgcmVhZG9ubHkgcmFkaXVzT2ZDdXJ2YXR1cmVNYWduaXR1ZGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaW5kZXhPZlJlZnJhY3Rpb25Qcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcbiAgcHVibGljIHJlYWRvbmx5IGZvY2FsTGVuZ3RoTWFnbml0dWRlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyBSZXNldHMgdGhpbmdzIHRoYXQgYXJlIHNwZWNpZmljIHRvIHRoaXMgY2xhc3MuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByZXNldERpcmVjdEZvY2FsTGVuZ3RoTW9kZWw6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aWNTdXJmYWNlVHlwZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxPcHRpY1N1cmZhY2VUeXBlPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogRGlyZWN0Rm9jYWxMZW5ndGhNb2RlbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEaXJlY3RGb2NhbExlbmd0aE1vZGVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFBoZXRpb09iamVjdE9wdGlvbnNcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnTW9kZWwgb2YgZm9jYWwgbGVuZ3RoIHRoYXQgaXMgdXNlZCB3aGVuICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtHT1ByZWZlcmVuY2VzLmZvY2FsTGVuZ3RoTW9kZWxUeXBlUHJvcGVydHkudGFuZGVtLnBoZXRpb0lEfSBgICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lzIHNldCB0byBcXCdkaXJlY3RcXCcuIElnbm9yZWQgZm9yIGZsYXQgbWlycm9yLiBJbiB0aGlzIG1vZGVsOicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnPHVsPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPmZvY2FsIGxlbmd0aCBpcyBzZXR0YWJsZScgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPmluZGV4IG9mIHJlZnJhY3Rpb24gaXMgZml4ZWQnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT5yYWRpdXMgb2YgY3VydmF0dXJlIGlzIGRlcml2ZWQnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvdWw+J1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmZvY2FsTGVuZ3RoTWFnbml0dWRlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuZm9jYWxMZW5ndGhNYWduaXR1ZGVSYW5nZS5kZWZhdWx0VmFsdWUsIHtcclxuICAgICAgdW5pdHM6ICdjbScsXHJcbiAgICAgIHJhbmdlOiBvcHRpb25zLmZvY2FsTGVuZ3RoTWFnbml0dWRlUmFuZ2UsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZm9jYWxMZW5ndGhNYWduaXR1ZGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdtYWduaXR1ZGUgb2YgdGhlIGZvY2FsIGxlbmd0aCAobm8gc2lnbiknXHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5pbmRleE9mUmVmcmFjdGlvblJhbmdlPy5nZXRMZW5ndGgoKSA9PT0gMCwgJ2luZGV4T2ZSZWZyYWN0aW9uIHNob3VsZCBiZSBhIGZpeGVkIHZhbHVlJyApO1xyXG4gICAgdGhpcy5pbmRleE9mUmVmcmFjdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmluZGV4T2ZSZWZyYWN0aW9uUmFuZ2UuZGVmYXVsdFZhbHVlLCB7XHJcbiAgICAgIHJhbmdlOiBvcHRpb25zLmluZGV4T2ZSZWZyYWN0aW9uUmFuZ2UsXHJcbiAgICAgIC8vIHVuaXRzOiB1bml0bGVzc1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2luZGV4T2ZSZWZyYWN0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yYWRpdXNPZkN1cnZhdHVyZU1hZ25pdHVkZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBvcHRpY1N1cmZhY2VUeXBlUHJvcGVydHksIHRoaXMuZm9jYWxMZW5ndGhNYWduaXR1ZGVQcm9wZXJ0eSwgdGhpcy5pbmRleE9mUmVmcmFjdGlvblByb3BlcnR5IF0sXHJcbiAgICAgICggb3B0aWNTdXJmYWNlVHlwZSwgZm9jYWxMZW5ndGhNYWduaXR1ZGUsIGluZGV4T2ZSZWZyYWN0aW9uICkgPT5cclxuICAgICAgICBmb2NhbExlbmd0aE1hZ25pdHVkZSAqICggMiAqICggaW5kZXhPZlJlZnJhY3Rpb24gLSAxICkgKSwge1xyXG4gICAgICAgIHVuaXRzOiAnY20nLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmFkaXVzT2ZDdXJ2YXR1cmVNYWduaXR1ZGVQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnbWFnbml0dWRlIG9mIHRoZSByYWRpdXMgb2YgY3VydmF0dXJlIChubyBzaWduKScsXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yZXNldERpcmVjdEZvY2FsTGVuZ3RoTW9kZWwgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZm9jYWxMZW5ndGhNYWduaXR1ZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB0aGlzLmluZGV4T2ZSZWZyYWN0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTeW5jaHJvbml6ZXMgd2l0aCBhbm90aGVyIGZvY2FsLWxlbmd0aCBtb2RlbCBieSBjb3B5aW5nIHRoZSB2YWx1ZXMgdGhhdCBhcmUgc2V0dGFibGUgaW4gdGhpcyBtb2RlbC5cclxuICAgKiBDb25zdHJhaW4gdmFsdWVzIHNvIHRoYXQgZmxvYXRpbmctcG9pbnQgZXJyb3IgZG9lc24ndCBjYXVzZSByYW5nZSBleGNlcHRpb25zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzeW5jVG9Nb2RlbCggbW9kZWw6IEZvY2FsTGVuZ3RoTW9kZWwgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbCAhPT0gdGhpcyApO1xyXG4gICAgdGhpcy5mb2NhbExlbmd0aE1hZ25pdHVkZVByb3BlcnR5LnZhbHVlID1cclxuICAgICAgdGhpcy5mb2NhbExlbmd0aE1hZ25pdHVkZVByb3BlcnR5LnJhbmdlLmNvbnN0cmFpblZhbHVlKCBtb2RlbC5mb2NhbExlbmd0aE1hZ25pdHVkZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0RGlyZWN0Rm9jYWxMZW5ndGhNb2RlbCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdlb21ldHJpY09wdGljcy5yZWdpc3RlciggJ0RpcmVjdEZvY2FsTGVuZ3RoTW9kZWwnLCBEaXJlY3RGb2NhbExlbmd0aE1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFLQSxPQUFPQSxZQUFZLE1BQStCLHVDQUF1QztBQUN6RixPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBRWxFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQVU3RCxlQUFlLE1BQU1DLHNCQUFzQixTQUFTUCxZQUFZLENBQTZCO0VBRTNGOztFQUtBOztFQUdPUSxXQUFXQSxDQUFFQyx3QkFBNkQsRUFDN0RDLGVBQThDLEVBQUc7SUFFbkUsTUFBTUMsT0FBTyxHQUFHTCxTQUFTLENBQWtFLENBQUMsQ0FBRTtNQUU1RjtNQUNBTSxXQUFXLEVBQUUsS0FBSztNQUNsQkMsbUJBQW1CLEVBQUUsMENBQTBDLEdBQ3pDLEdBQUVSLGFBQWEsQ0FBQ1MsNEJBQTRCLENBQUNDLE1BQU0sQ0FBQ0MsUUFBUyxHQUFFLEdBQ2hFLCtEQUErRCxHQUMvRCxNQUFNLEdBQ04sOEJBQThCLEdBQzlCLGtDQUFrQyxHQUNsQyxvQ0FBb0MsR0FDcEM7SUFDdkIsQ0FBQyxFQUFFTixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ00sNEJBQTRCLEdBQUcsSUFBSWhCLGNBQWMsQ0FBRVUsT0FBTyxDQUFDTyx5QkFBeUIsQ0FBQ0MsWUFBWSxFQUFFO01BQ3RHQyxLQUFLLEVBQUUsSUFBSTtNQUNYQyxLQUFLLEVBQUVWLE9BQU8sQ0FBQ08seUJBQXlCO01BQ3hDSCxNQUFNLEVBQUVKLE9BQU8sQ0FBQ0ksTUFBTSxDQUFDTyxZQUFZLENBQUUsOEJBQStCLENBQUM7TUFDckVDLGNBQWMsRUFBRSxJQUFJO01BQ3BCVixtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7SUFFSFcsTUFBTSxJQUFJQSxNQUFNLENBQUViLE9BQU8sQ0FBQ2Msc0JBQXNCLEVBQUVDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLDJDQUE0QyxDQUFDO0lBQ2xILElBQUksQ0FBQ0MseUJBQXlCLEdBQUcsSUFBSTFCLGNBQWMsQ0FBRVUsT0FBTyxDQUFDYyxzQkFBc0IsQ0FBQ04sWUFBWSxFQUFFO01BQ2hHRSxLQUFLLEVBQUVWLE9BQU8sQ0FBQ2Msc0JBQXNCO01BQ3JDO01BQ0FWLE1BQU0sRUFBRUosT0FBTyxDQUFDSSxNQUFNLENBQUNPLFlBQVksQ0FBRSwyQkFBNEIsQ0FBQztNQUNsRU0sY0FBYyxFQUFFO0lBQ2xCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0Msa0NBQWtDLEdBQUcsSUFBSTNCLGVBQWUsQ0FDM0QsQ0FBRU8sd0JBQXdCLEVBQUUsSUFBSSxDQUFDUSw0QkFBNEIsRUFBRSxJQUFJLENBQUNVLHlCQUF5QixDQUFFLEVBQy9GLENBQUVHLGdCQUFnQixFQUFFQyxvQkFBb0IsRUFBRUMsaUJBQWlCLEtBQ3pERCxvQkFBb0IsSUFBSyxDQUFDLElBQUtDLGlCQUFpQixHQUFHLENBQUMsQ0FBRSxDQUFFLEVBQUU7TUFDMURaLEtBQUssRUFBRSxJQUFJO01BQ1hMLE1BQU0sRUFBRUosT0FBTyxDQUFDSSxNQUFNLENBQUNPLFlBQVksQ0FBRSxvQ0FBcUMsQ0FBQztNQUMzRVQsbUJBQW1CLEVBQUUsZ0RBQWdEO01BQ3JFb0IsZUFBZSxFQUFFN0I7SUFDbkIsQ0FBRSxDQUFDO0lBRUwsSUFBSSxDQUFDOEIsMkJBQTJCLEdBQUcsTUFBTTtNQUN2QyxJQUFJLENBQUNqQiw0QkFBNEIsQ0FBQ2tCLEtBQUssQ0FBQyxDQUFDO01BQ3pDLElBQUksQ0FBQ1IseUJBQXlCLENBQUNRLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLENBQUM7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNTQyxXQUFXQSxDQUFFQyxLQUF1QixFQUFTO0lBQ2xEYixNQUFNLElBQUlBLE1BQU0sQ0FBRWEsS0FBSyxLQUFLLElBQUssQ0FBQztJQUNsQyxJQUFJLENBQUNwQiw0QkFBNEIsQ0FBQ3FCLEtBQUssR0FDckMsSUFBSSxDQUFDckIsNEJBQTRCLENBQUNJLEtBQUssQ0FBQ2tCLGNBQWMsQ0FBRUYsS0FBSyxDQUFDcEIsNEJBQTRCLENBQUNxQixLQUFNLENBQUM7RUFDdEc7RUFFT0gsS0FBS0EsQ0FBQSxFQUFTO0lBQ25CLElBQUksQ0FBQ0QsMkJBQTJCLENBQUMsQ0FBQztFQUNwQztFQUVnQk0sT0FBT0EsQ0FBQSxFQUFTO0lBQzlCaEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ2dCLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQXJDLGVBQWUsQ0FBQ3NDLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRWxDLHNCQUF1QixDQUFDIn0=