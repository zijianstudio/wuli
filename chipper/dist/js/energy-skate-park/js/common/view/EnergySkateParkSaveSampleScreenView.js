// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import merge from '../../../../phet-core/js/merge.js';
import energySkatePark from '../../energySkatePark.js';
import SamplesCanvasNode from '../../measure/view/SamplesCanvasNode.js';
import EnergySkateParkScreenView from './EnergySkateParkScreenView.js';
class EnergySkateParkSaveSampleScreenView extends EnergySkateParkScreenView {
  constructor(model, tandem, options) {
    options = merge({
      // {boolean} - true if
      drawSkaterPath: true
    }, options);
    super(model, tandem, options);

    // @private {SamplesCanvasNode|null}
    this.skaterSamplesNode = null;
    if (options.drawSkaterPath) {
      this.skaterSamplesNode = new SamplesCanvasNode(model, this.modelViewTransform);
      this.topLayer.addChild(this.skaterSamplesNode);
    }
  }

  /**
   * @public
   * @param {number} dt - in seconds
   */
  step(dt) {
    if (this.skaterSamplesNode) {
      this.skaterSamplesNode.step(dt);
    }
  }
}
energySkatePark.register('EnergySkateParkSaveSampleScreenView', EnergySkateParkSaveSampleScreenView);
export default EnergySkateParkSaveSampleScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsImVuZXJneVNrYXRlUGFyayIsIlNhbXBsZXNDYW52YXNOb2RlIiwiRW5lcmd5U2thdGVQYXJrU2NyZWVuVmlldyIsIkVuZXJneVNrYXRlUGFya1NhdmVTYW1wbGVTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsIm9wdGlvbnMiLCJkcmF3U2thdGVyUGF0aCIsInNrYXRlclNhbXBsZXNOb2RlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidG9wTGF5ZXIiLCJhZGRDaGlsZCIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW5lcmd5U2thdGVQYXJrU2F2ZVNhbXBsZVNjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi8uLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5pbXBvcnQgU2FtcGxlc0NhbnZhc05vZGUgZnJvbSAnLi4vLi4vbWVhc3VyZS92aWV3L1NhbXBsZXNDYW52YXNOb2RlLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya1NjcmVlblZpZXcgZnJvbSAnLi9FbmVyZ3lTa2F0ZVBhcmtTY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIEVuZXJneVNrYXRlUGFya1NhdmVTYW1wbGVTY3JlZW5WaWV3IGV4dGVuZHMgRW5lcmd5U2thdGVQYXJrU2NyZWVuVmlldyB7XHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSB0cnVlIGlmXHJcbiAgICAgIGRyYXdTa2F0ZXJQYXRoOiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcbiAgICBzdXBlciggbW9kZWwsIHRhbmRlbSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtTYW1wbGVzQ2FudmFzTm9kZXxudWxsfVxyXG4gICAgdGhpcy5za2F0ZXJTYW1wbGVzTm9kZSA9IG51bGw7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLmRyYXdTa2F0ZXJQYXRoICkge1xyXG4gICAgICB0aGlzLnNrYXRlclNhbXBsZXNOb2RlID0gbmV3IFNhbXBsZXNDYW52YXNOb2RlKCBtb2RlbCwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuICAgICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggdGhpcy5za2F0ZXJTYW1wbGVzTm9kZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGluIHNlY29uZHNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGlmICggdGhpcy5za2F0ZXJTYW1wbGVzTm9kZSApIHtcclxuICAgICAgdGhpcy5za2F0ZXJTYW1wbGVzTm9kZS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ0VuZXJneVNrYXRlUGFya1NhdmVTYW1wbGVTY3JlZW5WaWV3JywgRW5lcmd5U2thdGVQYXJrU2F2ZVNhbXBsZVNjcmVlblZpZXcgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVuZXJneVNrYXRlUGFya1NhdmVTYW1wbGVTY3JlZW5WaWV3O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsaUJBQWlCLE1BQU0seUNBQXlDO0FBQ3ZFLE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQztBQUV0RSxNQUFNQyxtQ0FBbUMsU0FBU0QseUJBQXlCLENBQUM7RUFDMUVFLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7SUFFcENBLE9BQU8sR0FBR1IsS0FBSyxDQUFFO01BRWY7TUFDQVMsY0FBYyxFQUFFO0lBQ2xCLENBQUMsRUFBRUQsT0FBUSxDQUFDO0lBQ1osS0FBSyxDQUFFRixLQUFLLEVBQUVDLE1BQU0sRUFBRUMsT0FBUSxDQUFDOztJQUUvQjtJQUNBLElBQUksQ0FBQ0UsaUJBQWlCLEdBQUcsSUFBSTtJQUU3QixJQUFLRixPQUFPLENBQUNDLGNBQWMsRUFBRztNQUM1QixJQUFJLENBQUNDLGlCQUFpQixHQUFHLElBQUlSLGlCQUFpQixDQUFFSSxLQUFLLEVBQUUsSUFBSSxDQUFDSyxrQkFBbUIsQ0FBQztNQUNoRixJQUFJLENBQUNDLFFBQVEsQ0FBQ0MsUUFBUSxDQUFFLElBQUksQ0FBQ0gsaUJBQWtCLENBQUM7SUFDbEQ7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFSSxJQUFJQSxDQUFFQyxFQUFFLEVBQUc7SUFDVCxJQUFLLElBQUksQ0FBQ0wsaUJBQWlCLEVBQUc7TUFDNUIsSUFBSSxDQUFDQSxpQkFBaUIsQ0FBQ0ksSUFBSSxDQUFFQyxFQUFHLENBQUM7SUFDbkM7RUFDRjtBQUNGO0FBR0FkLGVBQWUsQ0FBQ2UsUUFBUSxDQUFFLHFDQUFxQyxFQUFFWixtQ0FBb0MsQ0FBQztBQUV0RyxlQUFlQSxtQ0FBbUMifQ==