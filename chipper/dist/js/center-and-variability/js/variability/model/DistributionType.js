// Copyright 2023, University of Colorado Boulder

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import centerAndVariability from '../../centerAndVariability.js';

/**
 * DistributionType is used to identify the selected distribution type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export default class DistributionType extends EnumerationValue {
  static KICKER_1 = new DistributionType();
  static KICKER_2 = new DistributionType();
  static KICKER_3 = new DistributionType();
  static KICKER_4 = new DistributionType();
  static enumeration = new Enumeration(DistributionType, {});
}
centerAndVariability.register('DistributionType', DistributionType);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIkRpc3RyaWJ1dGlvblR5cGUiLCJLSUNLRVJfMSIsIktJQ0tFUl8yIiwiS0lDS0VSXzMiLCJLSUNLRVJfNCIsImVudW1lcmF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEaXN0cmlidXRpb25UeXBlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBjZW50ZXJBbmRWYXJpYWJpbGl0eSBmcm9tICcuLi8uLi9jZW50ZXJBbmRWYXJpYWJpbGl0eS5qcyc7XHJcblxyXG4vKipcclxuICogRGlzdHJpYnV0aW9uVHlwZSBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBzZWxlY3RlZCBkaXN0cmlidXRpb24gdHlwZS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXN0cmlidXRpb25UeXBlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLSUNLRVJfMSA9IG5ldyBEaXN0cmlidXRpb25UeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLSUNLRVJfMiA9IG5ldyBEaXN0cmlidXRpb25UeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLSUNLRVJfMyA9IG5ldyBEaXN0cmlidXRpb25UeXBlKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLSUNLRVJfNCA9IG5ldyBEaXN0cmlidXRpb25UeXBlKCk7XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBEaXN0cmlidXRpb25UeXBlLCB7fSApO1xyXG59XHJcblxyXG5jZW50ZXJBbmRWYXJpYWJpbGl0eS5yZWdpc3RlciggJ0Rpc3RyaWJ1dGlvblR5cGUnLCBEaXN0cmlidXRpb25UeXBlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLGdCQUFnQixNQUFNLDhDQUE4QztBQUMzRSxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7O0FBRWhFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0YsZ0JBQWdCLENBQUM7RUFDN0QsT0FBdUJHLFFBQVEsR0FBRyxJQUFJRCxnQkFBZ0IsQ0FBQyxDQUFDO0VBQ3hELE9BQXVCRSxRQUFRLEdBQUcsSUFBSUYsZ0JBQWdCLENBQUMsQ0FBQztFQUN4RCxPQUF1QkcsUUFBUSxHQUFHLElBQUlILGdCQUFnQixDQUFDLENBQUM7RUFDeEQsT0FBdUJJLFFBQVEsR0FBRyxJQUFJSixnQkFBZ0IsQ0FBQyxDQUFDO0VBRXhELE9BQXdCSyxXQUFXLEdBQUcsSUFBSVIsV0FBVyxDQUFFRyxnQkFBZ0IsRUFBRSxDQUFDLENBQUUsQ0FBQztBQUMvRTtBQUVBRCxvQkFBb0IsQ0FBQ08sUUFBUSxDQUFFLGtCQUFrQixFQUFFTixnQkFBaUIsQ0FBQyJ9