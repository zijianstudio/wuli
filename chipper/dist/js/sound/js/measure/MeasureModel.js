// Copyright 2022, University of Colorado Boulder
/**
 * Model for the measure screen.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import Stopwatch from '../../../scenery-phet/js/Stopwatch.js';
import sound from '../sound.js';
import SoundModel from '../common/model/SoundModel.js';
export default class MeasureModel extends SoundModel {
  constructor() {
    super({
      initialAmplitude: 10
    });
    this.stopwatch = new Stopwatch({
      position: new Vector2(450, 50),
      timePropertyOptions: {
        range: new Range(0, 999.99)
      },
      isVisible: true
    });
    this.rulerPositionProperty = new Vector2Property(new Vector2(200, 460));
  }

  /**
   * Resets the model.
   */
  reset() {
    super.reset();
    this.stopwatch.reset();
    this.rulerPositionProperty.reset();
  }
}
sound.register('MeasureModel', MeasureModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJTdG9wd2F0Y2giLCJzb3VuZCIsIlNvdW5kTW9kZWwiLCJNZWFzdXJlTW9kZWwiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxBbXBsaXR1ZGUiLCJzdG9wd2F0Y2giLCJwb3NpdGlvbiIsInRpbWVQcm9wZXJ0eU9wdGlvbnMiLCJyYW5nZSIsImlzVmlzaWJsZSIsInJ1bGVyUG9zaXRpb25Qcm9wZXJ0eSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNZWFzdXJlTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSBtZWFzdXJlIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBQaWV0IEdvcmlzIChVbml2ZXJzaXR5IG9mIExldXZlbilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wd2F0Y2guanMnO1xyXG5pbXBvcnQgc291bmQgZnJvbSAnLi4vc291bmQuanMnO1xyXG5pbXBvcnQgU291bmRNb2RlbCBmcm9tICcuLi9jb21tb24vbW9kZWwvU291bmRNb2RlbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZWFzdXJlTW9kZWwgZXh0ZW5kcyBTb3VuZE1vZGVsIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgc3RvcHdhdGNoOiBTdG9wd2F0Y2g7XHJcbiAgcHVibGljIHJlYWRvbmx5IHJ1bGVyUG9zaXRpb25Qcm9wZXJ0eTogVmVjdG9yMlByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICBpbml0aWFsQW1wbGl0dWRlOiAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc3RvcHdhdGNoID0gbmV3IFN0b3B3YXRjaCgge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDQ1MCwgNTAgKSxcclxuICAgICAgdGltZVByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDk5OS45OSApXHJcbiAgICAgIH0sXHJcbiAgICAgIGlzVmlzaWJsZTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucnVsZXJQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDIwMCwgNDYwICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgbW9kZWwuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMuc3RvcHdhdGNoLnJlc2V0KCk7XHJcbiAgICB0aGlzLnJ1bGVyUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuc291bmQucmVnaXN0ZXIoICdNZWFzdXJlTW9kZWwnLCBNZWFzdXJlTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxlQUFlLE1BQU0sb0NBQW9DO0FBQ2hFLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsS0FBSyxNQUFNLGFBQWE7QUFDL0IsT0FBT0MsVUFBVSxNQUFNLCtCQUErQjtBQUV0RCxlQUFlLE1BQU1DLFlBQVksU0FBU0QsVUFBVSxDQUFDO0VBSTVDRSxXQUFXQSxDQUFBLEVBQUc7SUFDbkIsS0FBSyxDQUFFO01BQ0xDLGdCQUFnQixFQUFFO0lBQ3BCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUlOLFNBQVMsQ0FBRTtNQUM5Qk8sUUFBUSxFQUFFLElBQUlULE9BQU8sQ0FBRSxHQUFHLEVBQUUsRUFBRyxDQUFDO01BQ2hDVSxtQkFBbUIsRUFBRTtRQUNuQkMsS0FBSyxFQUFFLElBQUlaLEtBQUssQ0FBRSxDQUFDLEVBQUUsTUFBTztNQUM5QixDQUFDO01BQ0RhLFNBQVMsRUFBRTtJQUNiLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MscUJBQXFCLEdBQUcsSUFBSVosZUFBZSxDQUFFLElBQUlELE9BQU8sQ0FBRSxHQUFHLEVBQUUsR0FBSSxDQUFFLENBQUM7RUFDN0U7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCYyxLQUFLQSxDQUFBLEVBQVM7SUFDNUIsS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQztJQUNiLElBQUksQ0FBQ04sU0FBUyxDQUFDTSxLQUFLLENBQUMsQ0FBQztJQUN0QixJQUFJLENBQUNELHFCQUFxQixDQUFDQyxLQUFLLENBQUMsQ0FBQztFQUNwQztBQUNGO0FBRUFYLEtBQUssQ0FBQ1ksUUFBUSxDQUFFLGNBQWMsRUFBRVYsWUFBYSxDQUFDIn0=