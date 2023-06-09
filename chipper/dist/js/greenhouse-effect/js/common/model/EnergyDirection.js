// Copyright 2021-2022, University of Colorado Boulder

/**
 * EnergyDirection is an enum for the directions in which energy can propagate in this sim.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import greenhouseEffect from '../../greenhouseEffect.js';
const UP_VECTOR = new Vector2(0, 1);
const DOWN_VECTOR = new Vector2(0, -1);
class EnergyDirection extends EnumerationValue {
  static UP = new EnergyDirection();
  static DOWN = new EnergyDirection();

  /**
   * Get a vector corresponding to the provided enum value.
   */
  static toVector(enumValue) {
    if (enumValue === EnergyDirection.UP) {
      return UP_VECTOR;
    } else {
      assert && assert(enumValue === EnergyDirection.DOWN, 'illegal direction');
      return DOWN_VECTOR;
    }
  }

  /**
   * Get the opposite of the provided direction.
   */
  static getOpposite(enumValue) {
    return enumValue === EnergyDirection.UP ? EnergyDirection.DOWN : EnergyDirection.UP;
  }
  static enumeration = new Enumeration(EnergyDirection);
}
greenhouseEffect.register('EnergyDirection', EnergyDirection);
export default EnergyDirection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIlVQX1ZFQ1RPUiIsIkRPV05fVkVDVE9SIiwiRW5lcmd5RGlyZWN0aW9uIiwiVVAiLCJET1dOIiwidG9WZWN0b3IiLCJlbnVtVmFsdWUiLCJhc3NlcnQiLCJnZXRPcHBvc2l0ZSIsImVudW1lcmF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbmVyZ3lEaXJlY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRW5lcmd5RGlyZWN0aW9uIGlzIGFuIGVudW0gZm9yIHRoZSBkaXJlY3Rpb25zIGluIHdoaWNoIGVuZXJneSBjYW4gcHJvcGFnYXRlIGluIHRoaXMgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcblxyXG5jb25zdCBVUF9WRUNUT1IgPSBuZXcgVmVjdG9yMiggMCwgMSApO1xyXG5jb25zdCBET1dOX1ZFQ1RPUiA9IG5ldyBWZWN0b3IyKCAwLCAtMSApO1xyXG5cclxuY2xhc3MgRW5lcmd5RGlyZWN0aW9uIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBVUCA9IG5ldyBFbmVyZ3lEaXJlY3Rpb24oKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERPV04gPSBuZXcgRW5lcmd5RGlyZWN0aW9uKCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIHZlY3RvciBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm92aWRlZCBlbnVtIHZhbHVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdG9WZWN0b3IoIGVudW1WYWx1ZTogRW5lcmd5RGlyZWN0aW9uICk6IFZlY3RvcjIge1xyXG4gICAgaWYgKCBlbnVtVmFsdWUgPT09IEVuZXJneURpcmVjdGlvbi5VUCApIHtcclxuICAgICAgcmV0dXJuIFVQX1ZFQ1RPUjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbnVtVmFsdWUgPT09IEVuZXJneURpcmVjdGlvbi5ET1dOLCAnaWxsZWdhbCBkaXJlY3Rpb24nICk7XHJcbiAgICAgIHJldHVybiBET1dOX1ZFQ1RPUjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgb3Bwb3NpdGUgb2YgdGhlIHByb3ZpZGVkIGRpcmVjdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldE9wcG9zaXRlKCBlbnVtVmFsdWU6IEVuZXJneURpcmVjdGlvbiApOiBFbmVyZ3lEaXJlY3Rpb24ge1xyXG4gICAgcmV0dXJuIGVudW1WYWx1ZSA9PT0gRW5lcmd5RGlyZWN0aW9uLlVQID9cclxuICAgICAgICAgICBFbmVyZ3lEaXJlY3Rpb24uRE9XTiA6XHJcbiAgICAgICAgICAgRW5lcmd5RGlyZWN0aW9uLlVQO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggRW5lcmd5RGlyZWN0aW9uICk7XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdFbmVyZ3lEaXJlY3Rpb24nLCBFbmVyZ3lEaXJlY3Rpb24gKTtcclxuZXhwb3J0IGRlZmF1bHQgRW5lcmd5RGlyZWN0aW9uO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLGdCQUFnQixNQUFNLDhDQUE4QztBQUMzRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFFeEQsTUFBTUMsU0FBUyxHQUFHLElBQUlKLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0FBQ3JDLE1BQU1LLFdBQVcsR0FBRyxJQUFJTCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO0FBRXhDLE1BQU1NLGVBQWUsU0FBU0osZ0JBQWdCLENBQUM7RUFDN0MsT0FBdUJLLEVBQUUsR0FBRyxJQUFJRCxlQUFlLENBQUMsQ0FBQztFQUNqRCxPQUF1QkUsSUFBSSxHQUFHLElBQUlGLGVBQWUsQ0FBQyxDQUFDOztFQUVuRDtBQUNGO0FBQ0E7RUFDRSxPQUFjRyxRQUFRQSxDQUFFQyxTQUEwQixFQUFZO0lBQzVELElBQUtBLFNBQVMsS0FBS0osZUFBZSxDQUFDQyxFQUFFLEVBQUc7TUFDdEMsT0FBT0gsU0FBUztJQUNsQixDQUFDLE1BQ0k7TUFDSE8sTUFBTSxJQUFJQSxNQUFNLENBQUVELFNBQVMsS0FBS0osZUFBZSxDQUFDRSxJQUFJLEVBQUUsbUJBQW9CLENBQUM7TUFDM0UsT0FBT0gsV0FBVztJQUNwQjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNFLE9BQWNPLFdBQVdBLENBQUVGLFNBQTBCLEVBQW9CO0lBQ3ZFLE9BQU9BLFNBQVMsS0FBS0osZUFBZSxDQUFDQyxFQUFFLEdBQ2hDRCxlQUFlLENBQUNFLElBQUksR0FDcEJGLGVBQWUsQ0FBQ0MsRUFBRTtFQUMzQjtFQUVBLE9BQXVCTSxXQUFXLEdBQUcsSUFBSVosV0FBVyxDQUFFSyxlQUFnQixDQUFDO0FBQ3pFO0FBRUFILGdCQUFnQixDQUFDVyxRQUFRLENBQUUsaUJBQWlCLEVBQUVSLGVBQWdCLENBQUM7QUFDL0QsZUFBZUEsZUFBZSJ9