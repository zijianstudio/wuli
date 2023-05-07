// Copyright 2017-2022, University of Colorado Boulder

/**
 * Enumeration for which side our ratio is on (the left or right, where if only one is visible, it's the left)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import proportionPlayground from '../../proportionPlayground.js';
const Side = EnumerationDeprecated.byKeys(['LEFT', 'RIGHT'], {
  beforeFreeze(Side) {
    Side.opposite = side => {
      assert && assert(Side.includes(side));
      return side === Side.LEFT ? Side.RIGHT : Side.LEFT;
    };
  }
});
proportionPlayground.register('Side', Side);
export default Side;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJwcm9wb3J0aW9uUGxheWdyb3VuZCIsIlNpZGUiLCJieUtleXMiLCJiZWZvcmVGcmVlemUiLCJvcHBvc2l0ZSIsInNpZGUiLCJhc3NlcnQiLCJpbmNsdWRlcyIsIkxFRlQiLCJSSUdIVCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2lkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFbnVtZXJhdGlvbiBmb3Igd2hpY2ggc2lkZSBvdXIgcmF0aW8gaXMgb24gKHRoZSBsZWZ0IG9yIHJpZ2h0LCB3aGVyZSBpZiBvbmx5IG9uZSBpcyB2aXNpYmxlLCBpdCdzIHRoZSBsZWZ0KVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuXHJcbmNvbnN0IFNpZGUgPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbXHJcbiAgJ0xFRlQnLFxyXG4gICdSSUdIVCdcclxuXSwge1xyXG4gIGJlZm9yZUZyZWV6ZSggU2lkZSApIHtcclxuICAgIFNpZGUub3Bwb3NpdGUgPSBzaWRlID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggU2lkZS5pbmNsdWRlcyggc2lkZSApICk7XHJcblxyXG4gICAgICByZXR1cm4gKCBzaWRlID09PSBTaWRlLkxFRlQgKSA/IFNpZGUuUklHSFQgOiBTaWRlLkxFRlQ7XHJcbiAgICB9O1xyXG4gIH1cclxufSApO1xyXG5cclxucHJvcG9ydGlvblBsYXlncm91bmQucmVnaXN0ZXIoICdTaWRlJywgU2lkZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTaWRlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSxtREFBbUQ7QUFDckYsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBRWhFLE1BQU1DLElBQUksR0FBR0YscUJBQXFCLENBQUNHLE1BQU0sQ0FBRSxDQUN6QyxNQUFNLEVBQ04sT0FBTyxDQUNSLEVBQUU7RUFDREMsWUFBWUEsQ0FBRUYsSUFBSSxFQUFHO0lBQ25CQSxJQUFJLENBQUNHLFFBQVEsR0FBR0MsSUFBSSxJQUFJO01BQ3RCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsSUFBSSxDQUFDTSxRQUFRLENBQUVGLElBQUssQ0FBRSxDQUFDO01BRXpDLE9BQVNBLElBQUksS0FBS0osSUFBSSxDQUFDTyxJQUFJLEdBQUtQLElBQUksQ0FBQ1EsS0FBSyxHQUFHUixJQUFJLENBQUNPLElBQUk7SUFDeEQsQ0FBQztFQUNIO0FBQ0YsQ0FBRSxDQUFDO0FBRUhSLG9CQUFvQixDQUFDVSxRQUFRLENBQUUsTUFBTSxFQUFFVCxJQUFLLENBQUM7QUFDN0MsZUFBZUEsSUFBSSJ9