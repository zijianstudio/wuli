// Copyright 2023, University of Colorado Boulder

/**
 * TwentyModel is the model for the 'Twenty' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberPlayModel from '../../common/model/NumberPlayModel.js';
import numberPlay from '../../numberPlay.js';
import numberPlayUtteranceQueue from '../../common/view/numberPlayUtteranceQueue.js';
import NumberPlayConstants from '../../common/NumberPlayConstants.js';
export default class TwentyModel extends NumberPlayModel {
  constructor(tandem) {
    super(NumberPlayConstants.MAX_SUM, numberPlayUtteranceQueue.twentyScreenSpeechDataProperty, tandem);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
numberPlay.register('TwentyModel', TwentyModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQbGF5TW9kZWwiLCJudW1iZXJQbGF5IiwibnVtYmVyUGxheVV0dGVyYW5jZVF1ZXVlIiwiTnVtYmVyUGxheUNvbnN0YW50cyIsIlR3ZW50eU1vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJNQVhfU1VNIiwidHdlbnR5U2NyZWVuU3BlZWNoRGF0YVByb3BlcnR5IiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVHdlbnR5TW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFR3ZW50eU1vZGVsIGlzIHRoZSBtb2RlbCBmb3IgdGhlICdUd2VudHknIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQbGF5TW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL051bWJlclBsYXlNb2RlbC5qcyc7XHJcbmltcG9ydCBudW1iZXJQbGF5IGZyb20gJy4uLy4uL251bWJlclBsYXkuanMnO1xyXG5pbXBvcnQgbnVtYmVyUGxheVV0dGVyYW5jZVF1ZXVlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L251bWJlclBsYXlVdHRlcmFuY2VRdWV1ZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQbGF5Q29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9OdW1iZXJQbGF5Q29uc3RhbnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR3ZW50eU1vZGVsIGV4dGVuZHMgTnVtYmVyUGxheU1vZGVsIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSApIHtcclxuICAgIHN1cGVyKCBOdW1iZXJQbGF5Q29uc3RhbnRzLk1BWF9TVU0sIG51bWJlclBsYXlVdHRlcmFuY2VRdWV1ZS50d2VudHlTY3JlZW5TcGVlY2hEYXRhUHJvcGVydHksIHRhbmRlbSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlclBsYXkucmVnaXN0ZXIoICdUd2VudHlNb2RlbCcsIFR3ZW50eU1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxVQUFVLE1BQU0scUJBQXFCO0FBQzVDLE9BQU9DLHdCQUF3QixNQUFNLCtDQUErQztBQUNwRixPQUFPQyxtQkFBbUIsTUFBTSxxQ0FBcUM7QUFFckUsZUFBZSxNQUFNQyxXQUFXLFNBQVNKLGVBQWUsQ0FBQztFQUVoREssV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBQ25DLEtBQUssQ0FBRUgsbUJBQW1CLENBQUNJLE9BQU8sRUFBRUwsd0JBQXdCLENBQUNNLDhCQUE4QixFQUFFRixNQUFPLENBQUM7RUFDdkc7RUFFZ0JHLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBUixVQUFVLENBQUNVLFFBQVEsQ0FBRSxhQUFhLEVBQUVQLFdBQVksQ0FBQyJ9