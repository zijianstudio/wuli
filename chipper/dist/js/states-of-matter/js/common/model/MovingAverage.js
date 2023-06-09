// Copyright 2019-2020, University of Colorado Boulder

/**
 * simple moving average calculator
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import statesOfMatter from '../../statesOfMatter.js';
class MovingAverage {
  /**
   * @param {number} size
   * @param {Object} [options]
   */
  constructor(size, options) {
    options = merge({
      initialValue: 0
    }, options);

    // @public
    this.size = size;
    this.average = 0;

    // @private
    this.initialValue = options.initialValue;
    this.array = new Array(size);

    // set up initial values
    this.reset();
  }

  /**
   * add a value to the moving average
   * @param {number} newValue
   * @public
   */
  addValue(newValue) {
    const replacedValue = this.array[this.currentIndex];
    this.array[this.currentIndex] = newValue;
    this.currentIndex = (this.currentIndex + 1) % this.size;
    this.total = this.total - replacedValue + newValue;
    this.average = this.total / this.size;
  }

  /**
   * @public
   */
  reset() {
    for (let i = 0; i < this.size; i++) {
      this.array[i] = this.initialValue;
    }
    this.total = this.initialValue * this.size;
    this.average = this.total / this.size;
    this.currentIndex = 0;
  }
}
statesOfMatter.register('MovingAverage', MovingAverage);
export default MovingAverage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsInN0YXRlc09mTWF0dGVyIiwiTW92aW5nQXZlcmFnZSIsImNvbnN0cnVjdG9yIiwic2l6ZSIsIm9wdGlvbnMiLCJpbml0aWFsVmFsdWUiLCJhdmVyYWdlIiwiYXJyYXkiLCJBcnJheSIsInJlc2V0IiwiYWRkVmFsdWUiLCJuZXdWYWx1ZSIsInJlcGxhY2VkVmFsdWUiLCJjdXJyZW50SW5kZXgiLCJ0b3RhbCIsImkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vdmluZ0F2ZXJhZ2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogc2ltcGxlIG1vdmluZyBhdmVyYWdlIGNhbGN1bGF0b3JcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHN0YXRlc09mTWF0dGVyIGZyb20gJy4uLy4uL3N0YXRlc09mTWF0dGVyLmpzJztcclxuXHJcbmNsYXNzIE1vdmluZ0F2ZXJhZ2Uge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2l6ZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgaW5pdGlhbFZhbHVlOiAwXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5zaXplID0gc2l6ZTtcclxuICAgIHRoaXMuYXZlcmFnZSA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuaW5pdGlhbFZhbHVlID0gb3B0aW9ucy5pbml0aWFsVmFsdWU7XHJcbiAgICB0aGlzLmFycmF5ID0gbmV3IEFycmF5KCBzaXplICk7XHJcblxyXG4gICAgLy8gc2V0IHVwIGluaXRpYWwgdmFsdWVzXHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhZGQgYSB2YWx1ZSB0byB0aGUgbW92aW5nIGF2ZXJhZ2VcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3VmFsdWVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkVmFsdWUoIG5ld1ZhbHVlICkge1xyXG4gICAgY29uc3QgcmVwbGFjZWRWYWx1ZSA9IHRoaXMuYXJyYXlbIHRoaXMuY3VycmVudEluZGV4IF07XHJcbiAgICB0aGlzLmFycmF5WyB0aGlzLmN1cnJlbnRJbmRleCBdID0gbmV3VmFsdWU7XHJcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9ICggdGhpcy5jdXJyZW50SW5kZXggKyAxICkgJSB0aGlzLnNpemU7XHJcbiAgICB0aGlzLnRvdGFsID0gKCB0aGlzLnRvdGFsIC0gcmVwbGFjZWRWYWx1ZSApICsgbmV3VmFsdWU7XHJcbiAgICB0aGlzLmF2ZXJhZ2UgPSB0aGlzLnRvdGFsIC8gdGhpcy5zaXplO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zaXplOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYXJyYXlbIGkgXSA9IHRoaXMuaW5pdGlhbFZhbHVlO1xyXG4gICAgfVxyXG4gICAgdGhpcy50b3RhbCA9IHRoaXMuaW5pdGlhbFZhbHVlICogdGhpcy5zaXplO1xyXG4gICAgdGhpcy5hdmVyYWdlID0gdGhpcy50b3RhbCAvIHRoaXMuc2l6ZTtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICB9XHJcbn1cclxuXHJcbnN0YXRlc09mTWF0dGVyLnJlZ2lzdGVyKCAnTW92aW5nQXZlcmFnZScsIE1vdmluZ0F2ZXJhZ2UgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW92aW5nQXZlcmFnZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBRXBELE1BQU1DLGFBQWEsQ0FBQztFQUVsQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRztJQUUzQkEsT0FBTyxHQUFHTCxLQUFLLENBQUU7TUFDZk0sWUFBWSxFQUFFO0lBQ2hCLENBQUMsRUFBRUQsT0FBUSxDQUFDOztJQUVaO0lBQ0EsSUFBSSxDQUFDRCxJQUFJLEdBQUdBLElBQUk7SUFDaEIsSUFBSSxDQUFDRyxPQUFPLEdBQUcsQ0FBQzs7SUFFaEI7SUFDQSxJQUFJLENBQUNELFlBQVksR0FBR0QsT0FBTyxDQUFDQyxZQUFZO0lBQ3hDLElBQUksQ0FBQ0UsS0FBSyxHQUFHLElBQUlDLEtBQUssQ0FBRUwsSUFBSyxDQUFDOztJQUU5QjtJQUNBLElBQUksQ0FBQ00sS0FBSyxDQUFDLENBQUM7RUFDZDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFFBQVFBLENBQUVDLFFBQVEsRUFBRztJQUNuQixNQUFNQyxhQUFhLEdBQUcsSUFBSSxDQUFDTCxLQUFLLENBQUUsSUFBSSxDQUFDTSxZQUFZLENBQUU7SUFDckQsSUFBSSxDQUFDTixLQUFLLENBQUUsSUFBSSxDQUFDTSxZQUFZLENBQUUsR0FBR0YsUUFBUTtJQUMxQyxJQUFJLENBQUNFLFlBQVksR0FBRyxDQUFFLElBQUksQ0FBQ0EsWUFBWSxHQUFHLENBQUMsSUFBSyxJQUFJLENBQUNWLElBQUk7SUFDekQsSUFBSSxDQUFDVyxLQUFLLEdBQUssSUFBSSxDQUFDQSxLQUFLLEdBQUdGLGFBQWEsR0FBS0QsUUFBUTtJQUN0RCxJQUFJLENBQUNMLE9BQU8sR0FBRyxJQUFJLENBQUNRLEtBQUssR0FBRyxJQUFJLENBQUNYLElBQUk7RUFDdkM7O0VBRUE7QUFDRjtBQUNBO0VBQ0VNLEtBQUtBLENBQUEsRUFBRztJQUNOLEtBQU0sSUFBSU0sQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ1osSUFBSSxFQUFFWSxDQUFDLEVBQUUsRUFBRztNQUNwQyxJQUFJLENBQUNSLEtBQUssQ0FBRVEsQ0FBQyxDQUFFLEdBQUcsSUFBSSxDQUFDVixZQUFZO0lBQ3JDO0lBQ0EsSUFBSSxDQUFDUyxLQUFLLEdBQUcsSUFBSSxDQUFDVCxZQUFZLEdBQUcsSUFBSSxDQUFDRixJQUFJO0lBQzFDLElBQUksQ0FBQ0csT0FBTyxHQUFHLElBQUksQ0FBQ1EsS0FBSyxHQUFHLElBQUksQ0FBQ1gsSUFBSTtJQUNyQyxJQUFJLENBQUNVLFlBQVksR0FBRyxDQUFDO0VBQ3ZCO0FBQ0Y7QUFFQWIsY0FBYyxDQUFDZ0IsUUFBUSxDQUFFLGVBQWUsRUFBRWYsYUFBYyxDQUFDO0FBQ3pELGVBQWVBLGFBQWEifQ==