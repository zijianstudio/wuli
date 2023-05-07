// Copyright 2019-2022, University of Colorado Boulder

/**
 * Enumeration for the various states that can occur during an Update check. See updateCheck.js for main usage.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import joist from './joist.js';
export default class UpdateState extends EnumerationValue {
  // Simulation version is equal to or greater than the currently published version.
  static UP_TO_DATE = new UpdateState();

  // Simulation version is less than currently published version (or equal but has a suffix)
  static OUT_OF_DATE = new UpdateState();

  // Request to server sent out, has not processed reply yet.
  static CHECKING = new UpdateState();

  // Last attempt to check failed, most likely offline
  static OFFLINE = new UpdateState();

  // No attempt as been made to check the version against the latest online.
  static UNCHECKED = new UpdateState();
  static enumeration = new Enumeration(UpdateState, {
    phetioDocumentation: 'Describes the states that can occur during an Update check'
  });
}
joist.register('UpdateState', UpdateState);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJqb2lzdCIsIlVwZGF0ZVN0YXRlIiwiVVBfVE9fREFURSIsIk9VVF9PRl9EQVRFIiwiQ0hFQ0tJTkciLCJPRkZMSU5FIiwiVU5DSEVDS0VEIiwiZW51bWVyYXRpb24iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJVcGRhdGVTdGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFbnVtZXJhdGlvbiBmb3IgdGhlIHZhcmlvdXMgc3RhdGVzIHRoYXQgY2FuIG9jY3VyIGR1cmluZyBhbiBVcGRhdGUgY2hlY2suIFNlZSB1cGRhdGVDaGVjay5qcyBmb3IgbWFpbiB1c2FnZS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXBkYXRlU3RhdGUgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuXHJcbiAgLy8gU2ltdWxhdGlvbiB2ZXJzaW9uIGlzIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiB0aGUgY3VycmVudGx5IHB1Ymxpc2hlZCB2ZXJzaW9uLlxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVVBfVE9fREFURSA9IG5ldyBVcGRhdGVTdGF0ZSgpO1xyXG5cclxuICAvLyBTaW11bGF0aW9uIHZlcnNpb24gaXMgbGVzcyB0aGFuIGN1cnJlbnRseSBwdWJsaXNoZWQgdmVyc2lvbiAob3IgZXF1YWwgYnV0IGhhcyBhIHN1ZmZpeClcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE9VVF9PRl9EQVRFID0gbmV3IFVwZGF0ZVN0YXRlKCk7XHJcblxyXG4gIC8vIFJlcXVlc3QgdG8gc2VydmVyIHNlbnQgb3V0LCBoYXMgbm90IHByb2Nlc3NlZCByZXBseSB5ZXQuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDSEVDS0lORyA9IG5ldyBVcGRhdGVTdGF0ZSgpO1xyXG5cclxuICAvLyBMYXN0IGF0dGVtcHQgdG8gY2hlY2sgZmFpbGVkLCBtb3N0IGxpa2VseSBvZmZsaW5lXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPRkZMSU5FID0gbmV3IFVwZGF0ZVN0YXRlKCk7XHJcblxyXG4gIC8vIE5vIGF0dGVtcHQgYXMgYmVlbiBtYWRlIHRvIGNoZWNrIHRoZSB2ZXJzaW9uIGFnYWluc3QgdGhlIGxhdGVzdCBvbmxpbmUuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBVTkNIRUNLRUQgPSBuZXcgVXBkYXRlU3RhdGUoKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggVXBkYXRlU3RhdGUsIHtcclxuICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdEZXNjcmliZXMgdGhlIHN0YXRlcyB0aGF0IGNhbiBvY2N1ciBkdXJpbmcgYW4gVXBkYXRlIGNoZWNrJ1xyXG4gIH0gKTtcclxufVxyXG5cclxuam9pc3QucmVnaXN0ZXIoICdVcGRhdGVTdGF0ZScsIFVwZGF0ZVN0YXRlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUMzRCxPQUFPQyxnQkFBZ0IsTUFBTSx3Q0FBd0M7QUFDckUsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFFOUIsZUFBZSxNQUFNQyxXQUFXLFNBQVNGLGdCQUFnQixDQUFDO0VBRXhEO0VBQ0EsT0FBdUJHLFVBQVUsR0FBRyxJQUFJRCxXQUFXLENBQUMsQ0FBQzs7RUFFckQ7RUFDQSxPQUF1QkUsV0FBVyxHQUFHLElBQUlGLFdBQVcsQ0FBQyxDQUFDOztFQUV0RDtFQUNBLE9BQXVCRyxRQUFRLEdBQUcsSUFBSUgsV0FBVyxDQUFDLENBQUM7O0VBRW5EO0VBQ0EsT0FBdUJJLE9BQU8sR0FBRyxJQUFJSixXQUFXLENBQUMsQ0FBQzs7RUFFbEQ7RUFDQSxPQUF1QkssU0FBUyxHQUFHLElBQUlMLFdBQVcsQ0FBQyxDQUFDO0VBRXBELE9BQXVCTSxXQUFXLEdBQUcsSUFBSVQsV0FBVyxDQUFFRyxXQUFXLEVBQUU7SUFDakVPLG1CQUFtQixFQUFFO0VBQ3ZCLENBQUUsQ0FBQztBQUNMO0FBRUFSLEtBQUssQ0FBQ1MsUUFBUSxDQUFFLGFBQWEsRUFBRVIsV0FBWSxDQUFDIn0=