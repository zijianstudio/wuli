// Copyright 2020-2021, University of Colorado Boulder

/**
 * Bond between two atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Atom from '../../../../nitroglycerin/js/Atom.js';
import buildAMolecule from '../../buildAMolecule.js';
class Bond {
  /**
   * @param {Atom} a
   * @param {Atom} b
   */
  constructor(a, b) {
    assert && assert(a !== b, 'Bonds cannot connect an atom to itself');

    // @public {Atom}
    this.a = a;

    // @public {Atom}
    this.b = b;
  }

  /**
   * Checks if the passed in atom is equal to one of the bond's atoms
   * @param {Atom|PubChemAtom*} atom
   *
   * @public
   * @returns {boolean}
   */
  contains(atom) {
    assert && assert(atom instanceof Atom);
    return atom === this.a || atom === this.b;
  }

  /**
   * Returns the other atom within the bond that isn't the passed in atom
   * @param {Atom|PubChemAtom*} atom
   *
   * @public
   * @returns {Atom}
   */
  getOtherAtom(atom) {
    assert && assert(atom instanceof Atom);
    assert && assert(this.contains(atom));
    return this.a === atom ? this.b : this.a;
  }

  /**
   * Returns serialized form of bond data
   * @param {number} index - Index of bond within molecule
   *
   * @public
   * @returns {string}
   */
  toSerial2(index) {
    return `${index}`;
  }
}
buildAMolecule.register('Bond', Bond);
export default Bond;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdG9tIiwiYnVpbGRBTW9sZWN1bGUiLCJCb25kIiwiY29uc3RydWN0b3IiLCJhIiwiYiIsImFzc2VydCIsImNvbnRhaW5zIiwiYXRvbSIsImdldE90aGVyQXRvbSIsInRvU2VyaWFsMiIsImluZGV4IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCb25kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJvbmQgYmV0d2VlbiB0d28gYXRvbXNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQXRvbSBmcm9tICcuLi8uLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL0F0b20uanMnO1xyXG5pbXBvcnQgYnVpbGRBTW9sZWN1bGUgZnJvbSAnLi4vLi4vYnVpbGRBTW9sZWN1bGUuanMnO1xyXG5cclxuY2xhc3MgQm9uZCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtBdG9tfSBhXHJcbiAgICogQHBhcmFtIHtBdG9tfSBiXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGEsIGIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhICE9PSBiLCAnQm9uZHMgY2Fubm90IGNvbm5lY3QgYW4gYXRvbSB0byBpdHNlbGYnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXRvbX1cclxuICAgIHRoaXMuYSA9IGE7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXRvbX1cclxuICAgIHRoaXMuYiA9IGI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgaWYgdGhlIHBhc3NlZCBpbiBhdG9tIGlzIGVxdWFsIHRvIG9uZSBvZiB0aGUgYm9uZCdzIGF0b21zXHJcbiAgICogQHBhcmFtIHtBdG9tfFB1YkNoZW1BdG9tKn0gYXRvbVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGNvbnRhaW5zKCBhdG9tICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXRvbSBpbnN0YW5jZW9mIEF0b20gKTtcclxuICAgIHJldHVybiBhdG9tID09PSB0aGlzLmEgfHwgYXRvbSA9PT0gdGhpcy5iO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgb3RoZXIgYXRvbSB3aXRoaW4gdGhlIGJvbmQgdGhhdCBpc24ndCB0aGUgcGFzc2VkIGluIGF0b21cclxuICAgKiBAcGFyYW0ge0F0b218UHViQ2hlbUF0b20qfSBhdG9tXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge0F0b219XHJcbiAgICovXHJcbiAgZ2V0T3RoZXJBdG9tKCBhdG9tICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXRvbSBpbnN0YW5jZW9mIEF0b20gKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29udGFpbnMoIGF0b20gKSApO1xyXG4gICAgcmV0dXJuICggdGhpcy5hID09PSBhdG9tID8gdGhpcy5iIDogdGhpcy5hICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHNlcmlhbGl6ZWQgZm9ybSBvZiBib25kIGRhdGFcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBJbmRleCBvZiBib25kIHdpdGhpbiBtb2xlY3VsZVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgdG9TZXJpYWwyKCBpbmRleCApIHtcclxuICAgIHJldHVybiBgJHtpbmRleH1gO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTW9sZWN1bGUucmVnaXN0ZXIoICdCb25kJywgQm9uZCApO1xyXG5leHBvcnQgZGVmYXVsdCBCb25kOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLElBQUksTUFBTSxzQ0FBc0M7QUFDdkQsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUVwRCxNQUFNQyxJQUFJLENBQUM7RUFDVDtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRztJQUNsQkMsTUFBTSxJQUFJQSxNQUFNLENBQUVGLENBQUMsS0FBS0MsQ0FBQyxFQUFFLHdDQUF5QyxDQUFDOztJQUVyRTtJQUNBLElBQUksQ0FBQ0QsQ0FBQyxHQUFHQSxDQUFDOztJQUVWO0lBQ0EsSUFBSSxDQUFDQyxDQUFDLEdBQUdBLENBQUM7RUFDWjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxRQUFRQSxDQUFFQyxJQUFJLEVBQUc7SUFDZkYsTUFBTSxJQUFJQSxNQUFNLENBQUVFLElBQUksWUFBWVIsSUFBSyxDQUFDO0lBQ3hDLE9BQU9RLElBQUksS0FBSyxJQUFJLENBQUNKLENBQUMsSUFBSUksSUFBSSxLQUFLLElBQUksQ0FBQ0gsQ0FBQztFQUMzQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxZQUFZQSxDQUFFRCxJQUFJLEVBQUc7SUFDbkJGLE1BQU0sSUFBSUEsTUFBTSxDQUFFRSxJQUFJLFlBQVlSLElBQUssQ0FBQztJQUN4Q00sTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDQyxRQUFRLENBQUVDLElBQUssQ0FBRSxDQUFDO0lBQ3pDLE9BQVMsSUFBSSxDQUFDSixDQUFDLEtBQUtJLElBQUksR0FBRyxJQUFJLENBQUNILENBQUMsR0FBRyxJQUFJLENBQUNELENBQUM7RUFDNUM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sU0FBU0EsQ0FBRUMsS0FBSyxFQUFHO0lBQ2pCLE9BQVEsR0FBRUEsS0FBTSxFQUFDO0VBQ25CO0FBQ0Y7QUFFQVYsY0FBYyxDQUFDVyxRQUFRLENBQUUsTUFBTSxFQUFFVixJQUFLLENBQUM7QUFDdkMsZUFBZUEsSUFBSSJ9