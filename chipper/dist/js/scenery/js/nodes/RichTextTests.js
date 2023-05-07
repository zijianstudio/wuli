// Copyright 2021-2023, University of Colorado Boulder

/**
 * RichText tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import RichText from './RichText.js';
QUnit.module('RichText');
QUnit.test('Mutually exclusive options', assert => {
  assert.ok(true, 'always true, even when assertions are not on.');
  const stringProperty = new StringProperty('um, hoss?');
  window.assert && assert.throws(() => {
    return new RichText({
      // @ts-expect-error for testing
      string: 'hi',
      stringProperty: stringProperty
    });
  }, 'text and stringProperty values do not match');
});
QUnit.test('DerivedProperty stringProperty', assert => {
  assert.ok(true, 'always true, even when assertions are not on.');
  const string = 'oh boy, here we go';
  const stringProperty = new StringProperty(string);
  const extra = '!!';
  const aBitExtraForAStringProperty = new DerivedProperty([stringProperty], value => value + extra);
  const text = new RichText(aBitExtraForAStringProperty);
  assert.ok(text.stringProperty.value === string + extra);
  stringProperty.value = string + extra;
  assert.ok(text.string === string + extra + extra);
  window.assert && assert.throws(() => {
    text.string = 'hi';
  }, 'cannot set a derivedProperty');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIlJpY2hUZXh0IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siLCJzdHJpbmdQcm9wZXJ0eSIsIndpbmRvdyIsInRocm93cyIsInN0cmluZyIsImV4dHJhIiwiYUJpdEV4dHJhRm9yQVN0cmluZ1Byb3BlcnR5IiwidmFsdWUiLCJ0ZXh0Il0sInNvdXJjZXMiOlsiUmljaFRleHRUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSaWNoVGV4dCB0ZXN0c1xyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJpY2hUZXh0IGZyb20gJy4vUmljaFRleHQuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnUmljaFRleHQnICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnTXV0dWFsbHkgZXhjbHVzaXZlIG9wdGlvbnMnLCBhc3NlcnQgPT4ge1xyXG5cclxuICBhc3NlcnQub2soIHRydWUsICdhbHdheXMgdHJ1ZSwgZXZlbiB3aGVuIGFzc2VydGlvbnMgYXJlIG5vdCBvbi4nICk7XHJcblxyXG4gIGNvbnN0IHN0cmluZ1Byb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAndW0sIGhvc3M/JyApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBSaWNoVGV4dCgge1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBmb3IgdGVzdGluZ1xyXG4gICAgICBzdHJpbmc6ICdoaScsXHJcbiAgICAgIHN0cmluZ1Byb3BlcnR5OiBzdHJpbmdQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gIH0sICd0ZXh0IGFuZCBzdHJpbmdQcm9wZXJ0eSB2YWx1ZXMgZG8gbm90IG1hdGNoJyApO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0Rlcml2ZWRQcm9wZXJ0eSBzdHJpbmdQcm9wZXJ0eScsIGFzc2VydCA9PiB7XHJcblxyXG4gIGFzc2VydC5vayggdHJ1ZSwgJ2Fsd2F5cyB0cnVlLCBldmVuIHdoZW4gYXNzZXJ0aW9ucyBhcmUgbm90IG9uLicgKTtcclxuXHJcbiAgY29uc3Qgc3RyaW5nID0gJ29oIGJveSwgaGVyZSB3ZSBnbyc7XHJcbiAgY29uc3Qgc3RyaW5nUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIHN0cmluZyApO1xyXG5cclxuICBjb25zdCBleHRyYSA9ICchISc7XHJcbiAgY29uc3QgYUJpdEV4dHJhRm9yQVN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBzdHJpbmdQcm9wZXJ0eSBdLCB2YWx1ZSA9PiB2YWx1ZSArIGV4dHJhICk7XHJcblxyXG4gIGNvbnN0IHRleHQgPSBuZXcgUmljaFRleHQoIGFCaXRFeHRyYUZvckFTdHJpbmdQcm9wZXJ0eSApO1xyXG5cclxuICBhc3NlcnQub2soIHRleHQuc3RyaW5nUHJvcGVydHkudmFsdWUgPT09IHN0cmluZyArIGV4dHJhICk7XHJcbiAgc3RyaW5nUHJvcGVydHkudmFsdWUgPSBzdHJpbmcgKyBleHRyYTtcclxuICBhc3NlcnQub2soIHRleHQuc3RyaW5nID09PSBzdHJpbmcgKyBleHRyYSArIGV4dHJhICk7XHJcblxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgdGV4dC5zdHJpbmcgPSAnaGknO1xyXG4gIH0sICdjYW5ub3Qgc2V0IGEgZGVyaXZlZFByb3BlcnR5JyApO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxxQ0FBcUM7QUFDakUsT0FBT0MsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUVwQ0MsS0FBSyxDQUFDQyxNQUFNLENBQUUsVUFBVyxDQUFDO0FBRTFCRCxLQUFLLENBQUNFLElBQUksQ0FBRSw0QkFBNEIsRUFBRUMsTUFBTSxJQUFJO0VBRWxEQSxNQUFNLENBQUNDLEVBQUUsQ0FBRSxJQUFJLEVBQUUsK0NBQWdELENBQUM7RUFFbEUsTUFBTUMsY0FBYyxHQUFHLElBQUlQLGNBQWMsQ0FBRSxXQUFZLENBQUM7RUFDeERRLE1BQU0sQ0FBQ0gsTUFBTSxJQUFJQSxNQUFNLENBQUNJLE1BQU0sQ0FBRSxNQUFNO0lBQ3BDLE9BQU8sSUFBSVIsUUFBUSxDQUFFO01BRW5CO01BQ0FTLE1BQU0sRUFBRSxJQUFJO01BQ1pILGNBQWMsRUFBRUE7SUFDbEIsQ0FBRSxDQUFDO0VBQ0wsQ0FBQyxFQUFFLDZDQUE4QyxDQUFDO0FBRXBELENBQUUsQ0FBQztBQUVITCxLQUFLLENBQUNFLElBQUksQ0FBRSxnQ0FBZ0MsRUFBRUMsTUFBTSxJQUFJO0VBRXREQSxNQUFNLENBQUNDLEVBQUUsQ0FBRSxJQUFJLEVBQUUsK0NBQWdELENBQUM7RUFFbEUsTUFBTUksTUFBTSxHQUFHLG9CQUFvQjtFQUNuQyxNQUFNSCxjQUFjLEdBQUcsSUFBSVAsY0FBYyxDQUFFVSxNQUFPLENBQUM7RUFFbkQsTUFBTUMsS0FBSyxHQUFHLElBQUk7RUFDbEIsTUFBTUMsMkJBQTJCLEdBQUcsSUFBSWIsZUFBZSxDQUFFLENBQUVRLGNBQWMsQ0FBRSxFQUFFTSxLQUFLLElBQUlBLEtBQUssR0FBR0YsS0FBTSxDQUFDO0VBRXJHLE1BQU1HLElBQUksR0FBRyxJQUFJYixRQUFRLENBQUVXLDJCQUE0QixDQUFDO0VBRXhEUCxNQUFNLENBQUNDLEVBQUUsQ0FBRVEsSUFBSSxDQUFDUCxjQUFjLENBQUNNLEtBQUssS0FBS0gsTUFBTSxHQUFHQyxLQUFNLENBQUM7RUFDekRKLGNBQWMsQ0FBQ00sS0FBSyxHQUFHSCxNQUFNLEdBQUdDLEtBQUs7RUFDckNOLE1BQU0sQ0FBQ0MsRUFBRSxDQUFFUSxJQUFJLENBQUNKLE1BQU0sS0FBS0EsTUFBTSxHQUFHQyxLQUFLLEdBQUdBLEtBQU0sQ0FBQztFQUVuREgsTUFBTSxDQUFDSCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0ksTUFBTSxDQUFFLE1BQU07SUFDcENLLElBQUksQ0FBQ0osTUFBTSxHQUFHLElBQUk7RUFDcEIsQ0FBQyxFQUFFLDhCQUErQixDQUFDO0FBQ3JDLENBQUUsQ0FBQyJ9