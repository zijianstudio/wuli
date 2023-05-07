// Copyright 2019-2022, University of Colorado Boulder

/**
 * Enumeration of the possible 'equation types.'
 *
 * @author Brandon Li
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import vectorAddition from '../../vectorAddition.js';
export default class EquationTypes extends EnumerationValue {
  // Adding two vectors to get a third. Shown as 'a + b = c' or 'd + e = f'
  static ADDITION = new EquationTypes();

  // Subtracting a vector from another to get a third. Shown as 'a - b = c' or 'd - e = f'
  static SUBTRACTION = new EquationTypes();

  // Negating the sum of two vectors to get a third.
  // Derived from '-( a + b ) = c', simplified to 'a + b + c = 0'
  // Shown as 'a + b + c = 0' or 'd + e + f = 0'
  static NEGATION = new EquationTypes();
  static enumeration = new Enumeration(EquationTypes);
}
vectorAddition.register('EquationTypes', EquationTypes);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJ2ZWN0b3JBZGRpdGlvbiIsIkVxdWF0aW9uVHlwZXMiLCJBRERJVElPTiIsIlNVQlRSQUNUSU9OIiwiTkVHQVRJT04iLCJlbnVtZXJhdGlvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXF1YXRpb25UeXBlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFbnVtZXJhdGlvbiBvZiB0aGUgcG9zc2libGUgJ2VxdWF0aW9uIHR5cGVzLidcclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IHZlY3RvckFkZGl0aW9uIGZyb20gJy4uLy4uL3ZlY3RvckFkZGl0aW9uLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWF0aW9uVHlwZXMgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuXHJcbiAgLy8gQWRkaW5nIHR3byB2ZWN0b3JzIHRvIGdldCBhIHRoaXJkLiBTaG93biBhcyAnYSArIGIgPSBjJyBvciAnZCArIGUgPSBmJ1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQURESVRJT04gPSBuZXcgRXF1YXRpb25UeXBlcygpO1xyXG5cclxuICAvLyBTdWJ0cmFjdGluZyBhIHZlY3RvciBmcm9tIGFub3RoZXIgdG8gZ2V0IGEgdGhpcmQuIFNob3duIGFzICdhIC0gYiA9IGMnIG9yICdkIC0gZSA9IGYnXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVUJUUkFDVElPTiA9IG5ldyBFcXVhdGlvblR5cGVzKCk7XHJcblxyXG4gIC8vIE5lZ2F0aW5nIHRoZSBzdW0gb2YgdHdvIHZlY3RvcnMgdG8gZ2V0IGEgdGhpcmQuXHJcbiAgLy8gRGVyaXZlZCBmcm9tICctKCBhICsgYiApID0gYycsIHNpbXBsaWZpZWQgdG8gJ2EgKyBiICsgYyA9IDAnXHJcbiAgLy8gU2hvd24gYXMgJ2EgKyBiICsgYyA9IDAnIG9yICdkICsgZSArIGYgPSAwJ1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTkVHQVRJT04gPSBuZXcgRXF1YXRpb25UeXBlcygpO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBFcXVhdGlvblR5cGVzICk7XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnRXF1YXRpb25UeXBlcycsIEVxdWF0aW9uVHlwZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFDM0UsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUVwRCxlQUFlLE1BQU1DLGFBQWEsU0FBU0YsZ0JBQWdCLENBQUM7RUFFMUQ7RUFDQSxPQUF1QkcsUUFBUSxHQUFHLElBQUlELGFBQWEsQ0FBQyxDQUFDOztFQUVyRDtFQUNBLE9BQXVCRSxXQUFXLEdBQUcsSUFBSUYsYUFBYSxDQUFDLENBQUM7O0VBRXhEO0VBQ0E7RUFDQTtFQUNBLE9BQXVCRyxRQUFRLEdBQUcsSUFBSUgsYUFBYSxDQUFDLENBQUM7RUFFckQsT0FBdUJJLFdBQVcsR0FBRyxJQUFJUCxXQUFXLENBQUVHLGFBQWMsQ0FBQztBQUN2RTtBQUVBRCxjQUFjLENBQUNNLFFBQVEsQ0FBRSxlQUFlLEVBQUVMLGFBQWMsQ0FBQyJ9