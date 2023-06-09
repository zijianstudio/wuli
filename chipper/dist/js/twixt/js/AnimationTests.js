// Copyright 2018-2021, University of Colorado Boulder

/**
 * Animation tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../axon/js/NumberProperty.js';
import Animation from './Animation.js';
QUnit.module('Animation');
QUnit.test('basic animation tests', assert => {
  assert.equal(1, 1, 'sanity check');
  const numberProperty = new NumberProperty(0);
  const targetValue = 7;
  const animation = new Animation({
    // Options for the Animation as a whole
    duration: 2,
    // Options for the one target to change
    property: numberProperty,
    to: targetValue,
    stepEmitter: null
  });
  animation.start();
  for (let i = 0; i < 10; i++) {
    animation.step(0.1);
  }
  assert.ok(Math.abs(numberProperty.value - targetValue / 2) < 1E-6, 'should be halfway there');
  for (let i = 0; i < 10; i++) {
    animation.step(0.1);
  }
  assert.ok(Math.abs(numberProperty.value - targetValue) < 1E-6, 'should be all the way there');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkFuaW1hdGlvbiIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsImVxdWFsIiwibnVtYmVyUHJvcGVydHkiLCJ0YXJnZXRWYWx1ZSIsImFuaW1hdGlvbiIsImR1cmF0aW9uIiwicHJvcGVydHkiLCJ0byIsInN0ZXBFbWl0dGVyIiwic3RhcnQiLCJpIiwic3RlcCIsIm9rIiwiTWF0aCIsImFicyIsInZhbHVlIl0sInNvdXJjZXMiOlsiQW5pbWF0aW9uVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW5pbWF0aW9uIHRlc3RzXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4vQW5pbWF0aW9uLmpzJztcclxuXHJcblFVbml0Lm1vZHVsZSggJ0FuaW1hdGlvbicgKTtcclxuXHJcblFVbml0LnRlc3QoICdiYXNpYyBhbmltYXRpb24gdGVzdHMnLCBhc3NlcnQgPT4ge1xyXG4gIGFzc2VydC5lcXVhbCggMSwgMSwgJ3Nhbml0eSBjaGVjaycgKTtcclxuXHJcbiAgY29uc3QgbnVtYmVyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgY29uc3QgdGFyZ2V0VmFsdWUgPSA3O1xyXG4gIGNvbnN0IGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgIC8vIE9wdGlvbnMgZm9yIHRoZSBBbmltYXRpb24gYXMgYSB3aG9sZVxyXG4gICAgZHVyYXRpb246IDIsXHJcblxyXG4gICAgLy8gT3B0aW9ucyBmb3IgdGhlIG9uZSB0YXJnZXQgdG8gY2hhbmdlXHJcbiAgICBwcm9wZXJ0eTogbnVtYmVyUHJvcGVydHksXHJcbiAgICB0bzogdGFyZ2V0VmFsdWUsXHJcblxyXG4gICAgc3RlcEVtaXR0ZXI6IG51bGxcclxuICB9ICk7XHJcbiAgYW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgMTA7IGkrKyApIHtcclxuICAgIGFuaW1hdGlvbi5zdGVwKCAwLjEgKTtcclxuICB9XHJcbiAgYXNzZXJ0Lm9rKCBNYXRoLmFicyggbnVtYmVyUHJvcGVydHkudmFsdWUgLSB0YXJnZXRWYWx1ZSAvIDIgKSA8IDFFLTYsICdzaG91bGQgYmUgaGFsZndheSB0aGVyZScgKTtcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCAxMDsgaSsrICkge1xyXG4gICAgYW5pbWF0aW9uLnN0ZXAoIDAuMSApO1xyXG4gIH1cclxuICBhc3NlcnQub2soIE1hdGguYWJzKCBudW1iZXJQcm9wZXJ0eS52YWx1ZSAtIHRhcmdldFZhbHVlICkgPCAxRS02LCAnc2hvdWxkIGJlIGFsbCB0aGUgd2F5IHRoZXJlJyApO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSxpQ0FBaUM7QUFDNUQsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUV0Q0MsS0FBSyxDQUFDQyxNQUFNLENBQUUsV0FBWSxDQUFDO0FBRTNCRCxLQUFLLENBQUNFLElBQUksQ0FBRSx1QkFBdUIsRUFBRUMsTUFBTSxJQUFJO0VBQzdDQSxNQUFNLENBQUNDLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGNBQWUsQ0FBQztFQUVwQyxNQUFNQyxjQUFjLEdBQUcsSUFBSVAsY0FBYyxDQUFFLENBQUUsQ0FBQztFQUU5QyxNQUFNUSxXQUFXLEdBQUcsQ0FBQztFQUNyQixNQUFNQyxTQUFTLEdBQUcsSUFBSVIsU0FBUyxDQUFFO0lBQy9CO0lBQ0FTLFFBQVEsRUFBRSxDQUFDO0lBRVg7SUFDQUMsUUFBUSxFQUFFSixjQUFjO0lBQ3hCSyxFQUFFLEVBQUVKLFdBQVc7SUFFZkssV0FBVyxFQUFFO0VBQ2YsQ0FBRSxDQUFDO0VBQ0hKLFNBQVMsQ0FBQ0ssS0FBSyxDQUFDLENBQUM7RUFDakIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsRUFBRSxFQUFFQSxDQUFDLEVBQUUsRUFBRztJQUM3Qk4sU0FBUyxDQUFDTyxJQUFJLENBQUUsR0FBSSxDQUFDO0VBQ3ZCO0VBQ0FYLE1BQU0sQ0FBQ1ksRUFBRSxDQUFFQyxJQUFJLENBQUNDLEdBQUcsQ0FBRVosY0FBYyxDQUFDYSxLQUFLLEdBQUdaLFdBQVcsR0FBRyxDQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUseUJBQTBCLENBQUM7RUFDakcsS0FBTSxJQUFJTyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsRUFBRSxFQUFFQSxDQUFDLEVBQUUsRUFBRztJQUM3Qk4sU0FBUyxDQUFDTyxJQUFJLENBQUUsR0FBSSxDQUFDO0VBQ3ZCO0VBQ0FYLE1BQU0sQ0FBQ1ksRUFBRSxDQUFFQyxJQUFJLENBQUNDLEdBQUcsQ0FBRVosY0FBYyxDQUFDYSxLQUFLLEdBQUdaLFdBQVksQ0FBQyxHQUFHLElBQUksRUFBRSw2QkFBOEIsQ0FBQztBQUNuRyxDQUFFLENBQUMifQ==