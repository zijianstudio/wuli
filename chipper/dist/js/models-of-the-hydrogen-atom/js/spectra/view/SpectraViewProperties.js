// Copyright 2019-2023, University of Colorado Boulder

/**
 * SpectraViewProperties defines Properties that are specific to the view in the 'Spectra' screen.
 * It adds no additional Properties to the base class, but is provided for symmetry in the model-view type hierarchy.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import MOTHAViewProperties from '../../common/view/MOTHAViewProperties.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
export default class SpectraViewProperties extends MOTHAViewProperties {
  constructor(providedOptions) {
    super(providedOptions);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('SpectraViewProperties', SpectraViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNT1RIQVZpZXdQcm9wZXJ0aWVzIiwibW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20iLCJTcGVjdHJhVmlld1Byb3BlcnRpZXMiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNwZWN0cmFWaWV3UHJvcGVydGllcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTcGVjdHJhVmlld1Byb3BlcnRpZXMgZGVmaW5lcyBQcm9wZXJ0aWVzIHRoYXQgYXJlIHNwZWNpZmljIHRvIHRoZSB2aWV3IGluIHRoZSAnU3BlY3RyYScgc2NyZWVuLlxyXG4gKiBJdCBhZGRzIG5vIGFkZGl0aW9uYWwgUHJvcGVydGllcyB0byB0aGUgYmFzZSBjbGFzcywgYnV0IGlzIHByb3ZpZGVkIGZvciBzeW1tZXRyeSBpbiB0aGUgbW9kZWwtdmlldyB0eXBlIGhpZXJhcmNoeS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBNT1RIQVZpZXdQcm9wZXJ0aWVzLCB7IE1PVEhBVmlld1Byb3BlcnRpZXNPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTU9USEFWaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgU3BlY3RyYVZpZXdQcm9wZXJ0aWVzT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTU9USEFWaWV3UHJvcGVydGllc09wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGVjdHJhVmlld1Byb3BlcnRpZXMgZXh0ZW5kcyBNT1RIQVZpZXdQcm9wZXJ0aWVzIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IFNwZWN0cmFWaWV3UHJvcGVydGllc09wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20ucmVnaXN0ZXIoICdTcGVjdHJhVmlld1Byb3BlcnRpZXMnLCBTcGVjdHJhVmlld1Byb3BlcnRpZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxtQkFBbUIsTUFBc0MsMENBQTBDO0FBQzFHLE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQU10RSxlQUFlLE1BQU1DLHFCQUFxQixTQUFTRixtQkFBbUIsQ0FBQztFQUU5REcsV0FBV0EsQ0FBRUMsZUFBNkMsRUFBRztJQUNsRSxLQUFLLENBQUVBLGVBQWdCLENBQUM7RUFDMUI7RUFFZ0JDLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBSix1QkFBdUIsQ0FBQ00sUUFBUSxDQUFFLHVCQUF1QixFQUFFTCxxQkFBc0IsQ0FBQyJ9