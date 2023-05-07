// Copyright 2019-2022, University of Colorado Boulder

/**
 * A tandem for a dynamic element that stores the name of the archetype that defines its dynamic element's schema.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Tandem, { DYNAMIC_ARCHETYPE_NAME } from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';
class DynamicTandem extends Tandem {
  constructor(parentTandem, name, options) {
    assert && assert(parentTandem, 'DynamicTandem must have a parentTandem');
    super(parentTandem, name, {
      ...options,
      isValidTandemName: name => /^[a-zA-Z0-9_]+$/.test(name)
    });
  }

  /**
   * See Tandem.getArchetypalPhetioID, in this case, look up the corresponding archetype.
   * A dynamic phetioID contains text like .................'sim.screen1.particles.particles_7.visibleProperty'
   * This method looks up the corresponding archetype like..'sim.screen1.particles.archetype.visibleProperty'
   */
  getArchetypalPhetioID() {
    assert && assert(this.parentTandem, 'Group elements must be in a Group');
    return window.phetio.PhetioIDUtils.append(this.parentTandem.getArchetypalPhetioID(), DYNAMIC_ARCHETYPE_NAME);
  }
  static DYNAMIC_ARCHETYPE_NAME = DYNAMIC_ARCHETYPE_NAME;
}
tandemNamespace.register('DynamicTandem', DynamicTandem);
export default DynamicTandem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJEWU5BTUlDX0FSQ0hFVFlQRV9OQU1FIiwidGFuZGVtTmFtZXNwYWNlIiwiRHluYW1pY1RhbmRlbSIsImNvbnN0cnVjdG9yIiwicGFyZW50VGFuZGVtIiwibmFtZSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJpc1ZhbGlkVGFuZGVtTmFtZSIsInRlc3QiLCJnZXRBcmNoZXR5cGFsUGhldGlvSUQiLCJ3aW5kb3ciLCJwaGV0aW8iLCJQaGV0aW9JRFV0aWxzIiwiYXBwZW5kIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEeW5hbWljVGFuZGVtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdGFuZGVtIGZvciBhIGR5bmFtaWMgZWxlbWVudCB0aGF0IHN0b3JlcyB0aGUgbmFtZSBvZiB0aGUgYXJjaGV0eXBlIHRoYXQgZGVmaW5lcyBpdHMgZHluYW1pYyBlbGVtZW50J3Mgc2NoZW1hLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0sIHsgRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSwgVGFuZGVtT3B0aW9ucyB9IGZyb20gJy4vVGFuZGVtLmpzJztcclxuaW1wb3J0IHRhbmRlbU5hbWVzcGFjZSBmcm9tICcuL3RhbmRlbU5hbWVzcGFjZS5qcyc7XHJcblxyXG50eXBlIER5bmFtaWNUYW5kZW1PcHRpb25zID0gU3RyaWN0T21pdDxUYW5kZW1PcHRpb25zLCAnaXNWYWxpZFRhbmRlbU5hbWUnPjtcclxuXHJcbmNsYXNzIER5bmFtaWNUYW5kZW0gZXh0ZW5kcyBUYW5kZW0ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBhcmVudFRhbmRlbTogVGFuZGVtLCBuYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBEeW5hbWljVGFuZGVtT3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcmVudFRhbmRlbSwgJ0R5bmFtaWNUYW5kZW0gbXVzdCBoYXZlIGEgcGFyZW50VGFuZGVtJyApO1xyXG4gICAgc3VwZXIoIHBhcmVudFRhbmRlbSwgbmFtZSwge1xyXG4gICAgICAuLi5vcHRpb25zLFxyXG4gICAgICBpc1ZhbGlkVGFuZGVtTmFtZTogKCBuYW1lOiBzdHJpbmcgKSA9PiAvXlthLXpBLVowLTlfXSskLy50ZXN0KCBuYW1lIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlZSBUYW5kZW0uZ2V0QXJjaGV0eXBhbFBoZXRpb0lELCBpbiB0aGlzIGNhc2UsIGxvb2sgdXAgdGhlIGNvcnJlc3BvbmRpbmcgYXJjaGV0eXBlLlxyXG4gICAqIEEgZHluYW1pYyBwaGV0aW9JRCBjb250YWlucyB0ZXh0IGxpa2UgLi4uLi4uLi4uLi4uLi4uLi4nc2ltLnNjcmVlbjEucGFydGljbGVzLnBhcnRpY2xlc183LnZpc2libGVQcm9wZXJ0eSdcclxuICAgKiBUaGlzIG1ldGhvZCBsb29rcyB1cCB0aGUgY29ycmVzcG9uZGluZyBhcmNoZXR5cGUgbGlrZS4uJ3NpbS5zY3JlZW4xLnBhcnRpY2xlcy5hcmNoZXR5cGUudmlzaWJsZVByb3BlcnR5J1xyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRBcmNoZXR5cGFsUGhldGlvSUQoKTogc3RyaW5nIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50VGFuZGVtLCAnR3JvdXAgZWxlbWVudHMgbXVzdCBiZSBpbiBhIEdyb3VwJyApO1xyXG4gICAgcmV0dXJuIHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5hcHBlbmQoIHRoaXMucGFyZW50VGFuZGVtIS5nZXRBcmNoZXR5cGFsUGhldGlvSUQoKSwgRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBEWU5BTUlDX0FSQ0hFVFlQRV9OQU1FID0gRFlOQU1JQ19BUkNIRVRZUEVfTkFNRTtcclxufVxyXG5cclxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnRHluYW1pY1RhbmRlbScsIER5bmFtaWNUYW5kZW0gKTtcclxuZXhwb3J0IGRlZmF1bHQgRHluYW1pY1RhbmRlbTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLE1BQU0sSUFBSUMsc0JBQXNCLFFBQXVCLGFBQWE7QUFDM0UsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUlsRCxNQUFNQyxhQUFhLFNBQVNILE1BQU0sQ0FBQztFQUUxQkksV0FBV0EsQ0FBRUMsWUFBb0IsRUFBRUMsSUFBWSxFQUFFQyxPQUE4QixFQUFHO0lBQ3ZGQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsWUFBWSxFQUFFLHdDQUF5QyxDQUFDO0lBQzFFLEtBQUssQ0FBRUEsWUFBWSxFQUFFQyxJQUFJLEVBQUU7TUFDekIsR0FBR0MsT0FBTztNQUNWRSxpQkFBaUIsRUFBSUgsSUFBWSxJQUFNLGlCQUFpQixDQUFDSSxJQUFJLENBQUVKLElBQUs7SUFDdEUsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNrQksscUJBQXFCQSxDQUFBLEVBQVc7SUFDOUNILE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ0gsWUFBWSxFQUFFLG1DQUFvQyxDQUFDO0lBQzFFLE9BQU9PLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDQyxhQUFhLENBQUNDLE1BQU0sQ0FBRSxJQUFJLENBQUNWLFlBQVksQ0FBRU0scUJBQXFCLENBQUMsQ0FBQyxFQUFFVixzQkFBdUIsQ0FBQztFQUNqSDtFQUVBLE9BQXVCQSxzQkFBc0IsR0FBR0Esc0JBQXNCO0FBQ3hFO0FBRUFDLGVBQWUsQ0FBQ2MsUUFBUSxDQUFFLGVBQWUsRUFBRWIsYUFBYyxDQUFDO0FBQzFELGVBQWVBLGFBQWEifQ==