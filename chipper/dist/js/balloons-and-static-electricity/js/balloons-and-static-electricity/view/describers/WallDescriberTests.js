// Copyright 2018-2021, University of Colorado Boulder

/**
 * Tests for screen summary descriptions for balloons-and-static-electricity. These descriptions are invisible, but
 * available for screen reader users.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import PlayAreaMap from '../../model/PlayAreaMap.js';
import WallDescriber from './WallDescriber.js';
QUnit.module('WallDescriber', {
  beforeEach: () => {
    window.baseModel.reset();
  }
});
QUnit.test('WallDescriber tests', assert => {
  window.baseModel.reset();
  const wallNode = window.baseView.wallNode;

  // on page load
  let actualDescription = wallNode.descriptionContent;
  let expectedDescription = 'At right edge of Play Area. Has zero net charge, many pairs of negative and positive charges.';
  assert.equal(actualDescription, expectedDescription);

  // yellow balloon neutral at wall, all charges shown
  window.baseModel.yellowBalloon.setCenter(new Vector2(PlayAreaMap.X_POSITIONS.AT_WALL, PlayAreaMap.Y_BOUNDARY_POSITIONS.AT_TOP));
  actualDescription = wallNode.descriptionContent;
  expectedDescription = 'At right edge of Play Area. Has zero net charge, many pairs of negative and positive charges.';
  assert.equal(actualDescription, expectedDescription);

  // yellow balloon inducing charge in upper wall, all charges shown
  window.baseModel.yellowBalloon.chargeProperty.set(-10);
  window.baseModel.yellowBalloon.setCenter(new Vector2(PlayAreaMap.X_POSITIONS.AT_WALL, PlayAreaMap.Y_BOUNDARY_POSITIONS.AT_TOP + 1));
  WallDescriber.getWallChargeDescription(window.baseModel.yellowBalloon, window.baseModel.greenBalloon, window.baseModel.balloonsAdjacentProperty.get(), window.baseModel.wall.isVisibleProperty.get(), 'all');
  actualDescription = wallNode.descriptionContent;
  expectedDescription = 'At right edge of Play Area. Has zero net charge, many pairs of negative and positive charges. ' + 'Negative charges in upper wall move away from Yellow Balloon a little bit. Positive charges do not move.';
  assert.equal(actualDescription, expectedDescription);

  // both balloons inducing a charge in upper wall
  window.baseModel.greenBalloon.chargeProperty.set(-10);
  window.baseModel.greenBalloon.isVisibleProperty.set(true);
  window.baseModel.greenBalloon.setCenter(window.baseModel.yellowBalloon.getCenter());
  actualDescription = wallNode.descriptionContent;
  expectedDescription = 'At right edge of Play Area. Has zero net charge, many pairs of negative and positive charges. ' + 'Negative charges in upper wall move away from balloons a little bit. Positive charges do not move.';
  assert.equal(actualDescription, expectedDescription);

  // both balloons inducing charge in upper wall, no charges shown
  window.baseModel.showChargesProperty.set('none');
  actualDescription = wallNode.descriptionContent;
  expectedDescription = 'At right edge of Play Area.';
  assert.equal(actualDescription, expectedDescription);

  // both balloons inducing charge in upper wall, charge differences shown
  window.baseModel.showChargesProperty.set('diff');
  actualDescription = wallNode.descriptionContent;
  expectedDescription = 'At right edge of Play Area. Has zero net charge, showing no charges.';
  assert.equal(actualDescription, expectedDescription);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiUGxheUFyZWFNYXAiLCJXYWxsRGVzY3JpYmVyIiwiUVVuaXQiLCJtb2R1bGUiLCJiZWZvcmVFYWNoIiwid2luZG93IiwiYmFzZU1vZGVsIiwicmVzZXQiLCJ0ZXN0IiwiYXNzZXJ0Iiwid2FsbE5vZGUiLCJiYXNlVmlldyIsImFjdHVhbERlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb25Db250ZW50IiwiZXhwZWN0ZWREZXNjcmlwdGlvbiIsImVxdWFsIiwieWVsbG93QmFsbG9vbiIsInNldENlbnRlciIsIlhfUE9TSVRJT05TIiwiQVRfV0FMTCIsIllfQk9VTkRBUllfUE9TSVRJT05TIiwiQVRfVE9QIiwiY2hhcmdlUHJvcGVydHkiLCJzZXQiLCJnZXRXYWxsQ2hhcmdlRGVzY3JpcHRpb24iLCJncmVlbkJhbGxvb24iLCJiYWxsb29uc0FkamFjZW50UHJvcGVydHkiLCJnZXQiLCJ3YWxsIiwiaXNWaXNpYmxlUHJvcGVydHkiLCJnZXRDZW50ZXIiLCJzaG93Q2hhcmdlc1Byb3BlcnR5Il0sInNvdXJjZXMiOlsiV2FsbERlc2NyaWJlclRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRlc3RzIGZvciBzY3JlZW4gc3VtbWFyeSBkZXNjcmlwdGlvbnMgZm9yIGJhbGxvb25zLWFuZC1zdGF0aWMtZWxlY3RyaWNpdHkuIFRoZXNlIGRlc2NyaXB0aW9ucyBhcmUgaW52aXNpYmxlLCBidXRcclxuICogYXZhaWxhYmxlIGZvciBzY3JlZW4gcmVhZGVyIHVzZXJzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBQbGF5QXJlYU1hcCBmcm9tICcuLi8uLi9tb2RlbC9QbGF5QXJlYU1hcC5qcyc7XHJcbmltcG9ydCBXYWxsRGVzY3JpYmVyIGZyb20gJy4vV2FsbERlc2NyaWJlci5qcyc7XHJcblxyXG5RVW5pdC5tb2R1bGUoICdXYWxsRGVzY3JpYmVyJywge1xyXG4gIGJlZm9yZUVhY2g6ICgpID0+IHtcclxuICAgIHdpbmRvdy5iYXNlTW9kZWwucmVzZXQoKTtcclxuICB9XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdXYWxsRGVzY3JpYmVyIHRlc3RzJywgYXNzZXJ0ID0+IHtcclxuICB3aW5kb3cuYmFzZU1vZGVsLnJlc2V0KCk7XHJcblxyXG4gIGNvbnN0IHdhbGxOb2RlID0gd2luZG93LmJhc2VWaWV3LndhbGxOb2RlO1xyXG5cclxuICAvLyBvbiBwYWdlIGxvYWRcclxuICBsZXQgYWN0dWFsRGVzY3JpcHRpb24gPSB3YWxsTm9kZS5kZXNjcmlwdGlvbkNvbnRlbnQ7XHJcbiAgbGV0IGV4cGVjdGVkRGVzY3JpcHRpb24gPSAnQXQgcmlnaHQgZWRnZSBvZiBQbGF5IEFyZWEuIEhhcyB6ZXJvIG5ldCBjaGFyZ2UsIG1hbnkgcGFpcnMgb2YgbmVnYXRpdmUgYW5kIHBvc2l0aXZlIGNoYXJnZXMuJztcclxuICBhc3NlcnQuZXF1YWwoIGFjdHVhbERlc2NyaXB0aW9uLCBleHBlY3RlZERlc2NyaXB0aW9uICk7XHJcblxyXG4gIC8vIHllbGxvdyBiYWxsb29uIG5ldXRyYWwgYXQgd2FsbCwgYWxsIGNoYXJnZXMgc2hvd25cclxuICB3aW5kb3cuYmFzZU1vZGVsLnllbGxvd0JhbGxvb24uc2V0Q2VudGVyKCBuZXcgVmVjdG9yMiggUGxheUFyZWFNYXAuWF9QT1NJVElPTlMuQVRfV0FMTCwgUGxheUFyZWFNYXAuWV9CT1VOREFSWV9QT1NJVElPTlMuQVRfVE9QICkgKTtcclxuICBhY3R1YWxEZXNjcmlwdGlvbiA9IHdhbGxOb2RlLmRlc2NyaXB0aW9uQ29udGVudDtcclxuICBleHBlY3RlZERlc2NyaXB0aW9uID0gJ0F0IHJpZ2h0IGVkZ2Ugb2YgUGxheSBBcmVhLiBIYXMgemVybyBuZXQgY2hhcmdlLCBtYW55IHBhaXJzIG9mIG5lZ2F0aXZlIGFuZCBwb3NpdGl2ZSBjaGFyZ2VzLic7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhY3R1YWxEZXNjcmlwdGlvbiwgZXhwZWN0ZWREZXNjcmlwdGlvbiApO1xyXG5cclxuICAvLyB5ZWxsb3cgYmFsbG9vbiBpbmR1Y2luZyBjaGFyZ2UgaW4gdXBwZXIgd2FsbCwgYWxsIGNoYXJnZXMgc2hvd25cclxuICB3aW5kb3cuYmFzZU1vZGVsLnllbGxvd0JhbGxvb24uY2hhcmdlUHJvcGVydHkuc2V0KCAtMTAgKTtcclxuICB3aW5kb3cuYmFzZU1vZGVsLnllbGxvd0JhbGxvb24uc2V0Q2VudGVyKCBuZXcgVmVjdG9yMiggUGxheUFyZWFNYXAuWF9QT1NJVElPTlMuQVRfV0FMTCwgUGxheUFyZWFNYXAuWV9CT1VOREFSWV9QT1NJVElPTlMuQVRfVE9QICsgMSApICk7XHJcbiAgV2FsbERlc2NyaWJlci5nZXRXYWxsQ2hhcmdlRGVzY3JpcHRpb24oIHdpbmRvdy5iYXNlTW9kZWwueWVsbG93QmFsbG9vbiwgd2luZG93LmJhc2VNb2RlbC5ncmVlbkJhbGxvb24sIHdpbmRvdy5iYXNlTW9kZWwuYmFsbG9vbnNBZGphY2VudFByb3BlcnR5LmdldCgpLCB3aW5kb3cuYmFzZU1vZGVsLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCksICdhbGwnICk7XHJcbiAgYWN0dWFsRGVzY3JpcHRpb24gPSB3YWxsTm9kZS5kZXNjcmlwdGlvbkNvbnRlbnQ7XHJcbiAgZXhwZWN0ZWREZXNjcmlwdGlvbiA9ICdBdCByaWdodCBlZGdlIG9mIFBsYXkgQXJlYS4gSGFzIHplcm8gbmV0IGNoYXJnZSwgbWFueSBwYWlycyBvZiBuZWdhdGl2ZSBhbmQgcG9zaXRpdmUgY2hhcmdlcy4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdOZWdhdGl2ZSBjaGFyZ2VzIGluIHVwcGVyIHdhbGwgbW92ZSBhd2F5IGZyb20gWWVsbG93IEJhbGxvb24gYSBsaXR0bGUgYml0LiBQb3NpdGl2ZSBjaGFyZ2VzIGRvIG5vdCBtb3ZlLic7XHJcbiAgYXNzZXJ0LmVxdWFsKCBhY3R1YWxEZXNjcmlwdGlvbiwgZXhwZWN0ZWREZXNjcmlwdGlvbiApO1xyXG5cclxuXHJcbiAgLy8gYm90aCBiYWxsb29ucyBpbmR1Y2luZyBhIGNoYXJnZSBpbiB1cHBlciB3YWxsXHJcbiAgd2luZG93LmJhc2VNb2RlbC5ncmVlbkJhbGxvb24uY2hhcmdlUHJvcGVydHkuc2V0KCAtMTAgKTtcclxuICB3aW5kb3cuYmFzZU1vZGVsLmdyZWVuQmFsbG9vbi5pc1Zpc2libGVQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICB3aW5kb3cuYmFzZU1vZGVsLmdyZWVuQmFsbG9vbi5zZXRDZW50ZXIoIHdpbmRvdy5iYXNlTW9kZWwueWVsbG93QmFsbG9vbi5nZXRDZW50ZXIoKSApO1xyXG4gIGFjdHVhbERlc2NyaXB0aW9uID0gd2FsbE5vZGUuZGVzY3JpcHRpb25Db250ZW50O1xyXG4gIGV4cGVjdGVkRGVzY3JpcHRpb24gPSAnQXQgcmlnaHQgZWRnZSBvZiBQbGF5IEFyZWEuIEhhcyB6ZXJvIG5ldCBjaGFyZ2UsIG1hbnkgcGFpcnMgb2YgbmVnYXRpdmUgYW5kIHBvc2l0aXZlIGNoYXJnZXMuICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnTmVnYXRpdmUgY2hhcmdlcyBpbiB1cHBlciB3YWxsIG1vdmUgYXdheSBmcm9tIGJhbGxvb25zIGEgbGl0dGxlIGJpdC4gUG9zaXRpdmUgY2hhcmdlcyBkbyBub3QgbW92ZS4nO1xyXG4gIGFzc2VydC5lcXVhbCggYWN0dWFsRGVzY3JpcHRpb24sIGV4cGVjdGVkRGVzY3JpcHRpb24gKTtcclxuXHJcbiAgLy8gYm90aCBiYWxsb29ucyBpbmR1Y2luZyBjaGFyZ2UgaW4gdXBwZXIgd2FsbCwgbm8gY2hhcmdlcyBzaG93blxyXG4gIHdpbmRvdy5iYXNlTW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eS5zZXQoICdub25lJyApO1xyXG4gIGFjdHVhbERlc2NyaXB0aW9uID0gd2FsbE5vZGUuZGVzY3JpcHRpb25Db250ZW50O1xyXG4gIGV4cGVjdGVkRGVzY3JpcHRpb24gPSAnQXQgcmlnaHQgZWRnZSBvZiBQbGF5IEFyZWEuJztcclxuICBhc3NlcnQuZXF1YWwoIGFjdHVhbERlc2NyaXB0aW9uLCBleHBlY3RlZERlc2NyaXB0aW9uICk7XHJcblxyXG4gIC8vIGJvdGggYmFsbG9vbnMgaW5kdWNpbmcgY2hhcmdlIGluIHVwcGVyIHdhbGwsIGNoYXJnZSBkaWZmZXJlbmNlcyBzaG93blxyXG4gIHdpbmRvdy5iYXNlTW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eS5zZXQoICdkaWZmJyApO1xyXG4gIGFjdHVhbERlc2NyaXB0aW9uID0gd2FsbE5vZGUuZGVzY3JpcHRpb25Db250ZW50O1xyXG4gIGV4cGVjdGVkRGVzY3JpcHRpb24gPSAnQXQgcmlnaHQgZWRnZSBvZiBQbGF5IEFyZWEuIEhhcyB6ZXJvIG5ldCBjaGFyZ2UsIHNob3dpbmcgbm8gY2hhcmdlcy4nO1xyXG4gIGFzc2VydC5lcXVhbCggYWN0dWFsRGVzY3JpcHRpb24sIGV4cGVjdGVkRGVzY3JpcHRpb24gKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLDRCQUE0QjtBQUNwRCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBRTlDQyxLQUFLLENBQUNDLE1BQU0sQ0FBRSxlQUFlLEVBQUU7RUFDN0JDLFVBQVUsRUFBRUEsQ0FBQSxLQUFNO0lBQ2hCQyxNQUFNLENBQUNDLFNBQVMsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7RUFDMUI7QUFDRixDQUFFLENBQUM7QUFFSEwsS0FBSyxDQUFDTSxJQUFJLENBQUUscUJBQXFCLEVBQUVDLE1BQU0sSUFBSTtFQUMzQ0osTUFBTSxDQUFDQyxTQUFTLENBQUNDLEtBQUss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