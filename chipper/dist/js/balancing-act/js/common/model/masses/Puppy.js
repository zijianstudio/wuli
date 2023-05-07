// Copyright 2014-2021, University of Colorado Boulder

import puppy_png from '../../../../images/puppy_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 6; // In kg
const HEIGHT = 0.6; // In meters

class Puppy extends ImageMass {
  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor(initialPosition, isMystery) {
    super(MASS, puppy_png, HEIGHT, initialPosition, isMystery);
    this.centerOfMassXOffset = 0.03; // Empirically determined.
  }
}

balancingAct.register('Puppy', Puppy);
export default Puppy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwdXBweV9wbmciLCJiYWxhbmNpbmdBY3QiLCJJbWFnZU1hc3MiLCJNQVNTIiwiSEVJR0hUIiwiUHVwcHkiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxQb3NpdGlvbiIsImlzTXlzdGVyeSIsImNlbnRlck9mTWFzc1hPZmZzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlB1cHB5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuXHJcbmltcG9ydCBwdXBweV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vaW1hZ2VzL3B1cHB5X3BuZy5qcyc7XHJcbmltcG9ydCBiYWxhbmNpbmdBY3QgZnJvbSAnLi4vLi4vLi4vYmFsYW5jaW5nQWN0LmpzJztcclxuaW1wb3J0IEltYWdlTWFzcyBmcm9tICcuLi9JbWFnZU1hc3MuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BU1MgPSA2OyAvLyBJbiBrZ1xyXG5jb25zdCBIRUlHSFQgPSAwLjY7IC8vIEluIG1ldGVyc1xyXG5cclxuY2xhc3MgUHVwcHkgZXh0ZW5kcyBJbWFnZU1hc3Mge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gaW5pdGlhbFBvc2l0aW9uXHJcbiAgICogQHBhcmFtIGlzTXlzdGVyeVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpbml0aWFsUG9zaXRpb24sIGlzTXlzdGVyeSApIHtcclxuICAgIHN1cGVyKCBNQVNTLCBwdXBweV9wbmcsIEhFSUdIVCwgaW5pdGlhbFBvc2l0aW9uLCBpc015c3RlcnkgKTtcclxuICAgIHRoaXMuY2VudGVyT2ZNYXNzWE9mZnNldCA9IDAuMDM7IC8vIEVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbiAgfVxyXG59XHJcblxyXG5iYWxhbmNpbmdBY3QucmVnaXN0ZXIoICdQdXBweScsIFB1cHB5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQdXBweTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE9BQU9BLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUJBQWlCOztBQUV2QztBQUNBLE1BQU1DLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQixNQUFNQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRXBCLE1BQU1DLEtBQUssU0FBU0gsU0FBUyxDQUFDO0VBRTVCO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLGVBQWUsRUFBRUMsU0FBUyxFQUFHO0lBQ3hDLEtBQUssQ0FBRUwsSUFBSSxFQUFFSCxTQUFTLEVBQUVJLE1BQU0sRUFBRUcsZUFBZSxFQUFFQyxTQUFVLENBQUM7SUFDNUQsSUFBSSxDQUFDQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsQ0FBQztFQUNuQztBQUNGOztBQUVBUixZQUFZLENBQUNTLFFBQVEsQ0FBRSxPQUFPLEVBQUVMLEtBQU0sQ0FBQztBQUV2QyxlQUFlQSxLQUFLIn0=