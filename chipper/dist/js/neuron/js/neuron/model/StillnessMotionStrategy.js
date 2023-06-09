// Copyright 2014-2020, University of Colorado Boulder
/**
 * Motion strategy that does not do any motion, i.e. just leaves the model element in the same position.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MotionStrategy from './MotionStrategy.js';
class StillnessMotionStrategy extends MotionStrategy {
  constructor() {
    super();
  }

  // @public, @override
  move(movableModelElement, fadableModelElement, dt) {
    // Does nothing, since the object is not moving.
  }

  // @public
  static getInstance() {
    if (!StillnessMotionStrategy.instance) {
      // No need to create new instance of StillnessMotionStrategy , it is stateless
      // Using a single strategy instance to avoid allocation
      StillnessMotionStrategy.instance = new StillnessMotionStrategy();
    }
    return StillnessMotionStrategy.instance;
  }
}
neuron.register('StillnessMotionStrategy', StillnessMotionStrategy);
export default StillnessMotionStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJNb3Rpb25TdHJhdGVneSIsIlN0aWxsbmVzc01vdGlvblN0cmF0ZWd5IiwiY29uc3RydWN0b3IiLCJtb3ZlIiwibW92YWJsZU1vZGVsRWxlbWVudCIsImZhZGFibGVNb2RlbEVsZW1lbnQiLCJkdCIsImdldEluc3RhbmNlIiwiaW5zdGFuY2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0aWxsbmVzc01vdGlvblN0cmF0ZWd5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogTW90aW9uIHN0cmF0ZWd5IHRoYXQgZG9lcyBub3QgZG8gYW55IG1vdGlvbiwgaS5lLiBqdXN0IGxlYXZlcyB0aGUgbW9kZWwgZWxlbWVudCBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICovXHJcblxyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcbmltcG9ydCBNb3Rpb25TdHJhdGVneSBmcm9tICcuL01vdGlvblN0cmF0ZWd5LmpzJztcclxuXHJcbmNsYXNzIFN0aWxsbmVzc01vdGlvblN0cmF0ZWd5IGV4dGVuZHMgTW90aW9uU3RyYXRlZ3kge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljLCBAb3ZlcnJpZGVcclxuICBtb3ZlKCBtb3ZhYmxlTW9kZWxFbGVtZW50LCBmYWRhYmxlTW9kZWxFbGVtZW50LCBkdCApIHtcclxuICAgIC8vIERvZXMgbm90aGluZywgc2luY2UgdGhlIG9iamVjdCBpcyBub3QgbW92aW5nLlxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpIHtcclxuICAgIGlmICggIVN0aWxsbmVzc01vdGlvblN0cmF0ZWd5Lmluc3RhbmNlICkge1xyXG4gICAgICAvLyBObyBuZWVkIHRvIGNyZWF0ZSBuZXcgaW5zdGFuY2Ugb2YgU3RpbGxuZXNzTW90aW9uU3RyYXRlZ3kgLCBpdCBpcyBzdGF0ZWxlc3NcclxuICAgICAgLy8gVXNpbmcgYSBzaW5nbGUgc3RyYXRlZ3kgaW5zdGFuY2UgdG8gYXZvaWQgYWxsb2NhdGlvblxyXG4gICAgICBTdGlsbG5lc3NNb3Rpb25TdHJhdGVneS5pbnN0YW5jZSA9IG5ldyBTdGlsbG5lc3NNb3Rpb25TdHJhdGVneSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFN0aWxsbmVzc01vdGlvblN0cmF0ZWd5Lmluc3RhbmNlO1xyXG4gIH1cclxufVxyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnU3RpbGxuZXNzTW90aW9uU3RyYXRlZ3knLCBTdGlsbG5lc3NNb3Rpb25TdHJhdGVneSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU3RpbGxuZXNzTW90aW9uU3RyYXRlZ3k7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGlCQUFpQjtBQUNwQyxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBRWhELE1BQU1DLHVCQUF1QixTQUFTRCxjQUFjLENBQUM7RUFFbkRFLFdBQVdBLENBQUEsRUFBRztJQUNaLEtBQUssQ0FBQyxDQUFDO0VBQ1Q7O0VBRUE7RUFDQUMsSUFBSUEsQ0FBRUMsbUJBQW1CLEVBQUVDLG1CQUFtQixFQUFFQyxFQUFFLEVBQUc7SUFDbkQ7RUFBQTs7RUFHRjtFQUNBLE9BQU9DLFdBQVdBLENBQUEsRUFBRztJQUNuQixJQUFLLENBQUNOLHVCQUF1QixDQUFDTyxRQUFRLEVBQUc7TUFDdkM7TUFDQTtNQUNBUCx1QkFBdUIsQ0FBQ08sUUFBUSxHQUFHLElBQUlQLHVCQUF1QixDQUFDLENBQUM7SUFDbEU7SUFDQSxPQUFPQSx1QkFBdUIsQ0FBQ08sUUFBUTtFQUN6QztBQUNGO0FBRUFULE1BQU0sQ0FBQ1UsUUFBUSxDQUFFLHlCQUF5QixFQUFFUix1QkFBd0IsQ0FBQztBQUVyRSxlQUFlQSx1QkFBdUIifQ==