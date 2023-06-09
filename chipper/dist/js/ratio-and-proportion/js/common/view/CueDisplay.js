// Copyright 2020-2022, University of Colorado Boulder

/**
 * Data type that holds the possible cue visuals that can be displayed for each ratio hand.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';
class CueDisplay extends EnumerationValue {
  static NONE = new CueDisplay();
  static W_S = new CueDisplay();
  static UP_DOWN = new CueDisplay();
  static ARROWS = new CueDisplay();
  static enumeration = new Enumeration(CueDisplay);
}
ratioAndProportion.register('CueDisplay', CueDisplay);
export default CueDisplay;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblZhbHVlIiwiRW51bWVyYXRpb24iLCJyYXRpb0FuZFByb3BvcnRpb24iLCJDdWVEaXNwbGF5IiwiTk9ORSIsIldfUyIsIlVQX0RPV04iLCJBUlJPV1MiLCJlbnVtZXJhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ3VlRGlzcGxheS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEYXRhIHR5cGUgdGhhdCBob2xkcyB0aGUgcG9zc2libGUgY3VlIHZpc3VhbHMgdGhhdCBjYW4gYmUgZGlzcGxheWVkIGZvciBlYWNoIHJhdGlvIGhhbmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgcmF0aW9BbmRQcm9wb3J0aW9uIGZyb20gJy4uLy4uL3JhdGlvQW5kUHJvcG9ydGlvbi5qcyc7XHJcblxyXG5jbGFzcyBDdWVEaXNwbGF5IGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBOT05FID0gbmV3IEN1ZURpc3BsYXkoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFdfUyA9IG5ldyBDdWVEaXNwbGF5KCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBVUF9ET1dOID0gbmV3IEN1ZURpc3BsYXkoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFSUk9XUyA9IG5ldyBDdWVEaXNwbGF5KCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIEN1ZURpc3BsYXkgKTtcclxufVxyXG5cclxucmF0aW9BbmRQcm9wb3J0aW9uLnJlZ2lzdGVyKCAnQ3VlRGlzcGxheScsIEN1ZURpc3BsYXkgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ3VlRGlzcGxheTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGdCQUFnQixNQUFNLDhDQUE4QztBQUMzRSxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUU1RCxNQUFNQyxVQUFVLFNBQVNILGdCQUFnQixDQUFDO0VBQ3hDLE9BQXVCSSxJQUFJLEdBQUcsSUFBSUQsVUFBVSxDQUFDLENBQUM7RUFDOUMsT0FBdUJFLEdBQUcsR0FBRyxJQUFJRixVQUFVLENBQUMsQ0FBQztFQUM3QyxPQUF1QkcsT0FBTyxHQUFHLElBQUlILFVBQVUsQ0FBQyxDQUFDO0VBQ2pELE9BQXVCSSxNQUFNLEdBQUcsSUFBSUosVUFBVSxDQUFDLENBQUM7RUFFaEQsT0FBdUJLLFdBQVcsR0FBRyxJQUFJUCxXQUFXLENBQUVFLFVBQVcsQ0FBQztBQUNwRTtBQUVBRCxrQkFBa0IsQ0FBQ08sUUFBUSxDQUFFLFlBQVksRUFBRU4sVUFBVyxDQUFDO0FBQ3ZELGVBQWVBLFVBQVUifQ==