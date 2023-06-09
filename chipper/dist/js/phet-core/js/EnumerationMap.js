// Copyright 2019-2022, University of Colorado Boulder

/**
 * An object that contains a value for each item in an enumeration.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';
// T = enumeration value type
// U = mapped value type
class EnumerationMap {
  _map = new Map();
  /**
   * @param enumeration
   * @param factory - function( {TEnumeration.*} ) => {*}, maps an enumeration value to any value.
   */
  constructor(enumeration, factory) {
    this._enumeration = enumeration;
    this._values = enumeration.enumeration.values;
    this._values.forEach(entry => {
      assert && assert(!this._map.has(entry), 'Enumeration key override problem');
      this._map.set(entry, factory(entry));
    });
  }

  /**
   * Returns the value associated with the given enumeration entry.
   */
  get(entry) {
    assert && assert(this._values.includes(entry));
    assert && assert(this._map.has(entry));
    return this._map.get(entry);
  }

  /**
   * Sets the value associated with the given enumeration entry.
   */
  set(entry, value) {
    assert && assert(this._values.includes(entry));
    this._map.set(entry, value);
  }

  /**
   * Returns a new EnumerationMap with mapped values.
   *
   * @param mapFunction - function( {*}, {TEnumeration.*} ): {*}
   * @returns With the mapped values
   */
  map(mapFunction) {
    return new EnumerationMap(this._enumeration, entry => mapFunction(this.get(entry), entry));
  }

  /**
   * Calls the callback on each item of the enumeration map.
   *
   * @param callback - function(value:*, enumerationValue:*)
   */
  forEach(callback) {
    this._values.forEach(entry => callback(this.get(entry), entry));
  }

  /**
   * Returns the values stored in the map, as an array
   *
   */
  values() {
    return this._values.map(entry => this.get(entry));
  }
}
phetCore.register('EnumerationMap', EnumerationMap);
export default EnumerationMap;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsIkVudW1lcmF0aW9uTWFwIiwiX21hcCIsIk1hcCIsImNvbnN0cnVjdG9yIiwiZW51bWVyYXRpb24iLCJmYWN0b3J5IiwiX2VudW1lcmF0aW9uIiwiX3ZhbHVlcyIsInZhbHVlcyIsImZvckVhY2giLCJlbnRyeSIsImFzc2VydCIsImhhcyIsInNldCIsImdldCIsImluY2x1ZGVzIiwidmFsdWUiLCJtYXAiLCJtYXBGdW5jdGlvbiIsImNhbGxiYWNrIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbnVtZXJhdGlvbk1hcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBbiBvYmplY3QgdGhhdCBjb250YWlucyBhIHZhbHVlIGZvciBlYWNoIGl0ZW0gaW4gYW4gZW51bWVyYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XHJcblxyXG50eXBlIFRFbnVtZXJhdGlvbjxUPiA9IHtcclxuICBlbnVtZXJhdGlvbjoge1xyXG4gICAgdmFsdWVzOiBUW107XHJcbiAgfTtcclxufTtcclxuXHJcbi8vIFQgPSBlbnVtZXJhdGlvbiB2YWx1ZSB0eXBlXHJcbi8vIFUgPSBtYXBwZWQgdmFsdWUgdHlwZVxyXG5jbGFzcyBFbnVtZXJhdGlvbk1hcDxULCBVPiB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfZW51bWVyYXRpb246IFRFbnVtZXJhdGlvbjxUPjtcclxuICBwcml2YXRlIF9tYXAgPSBuZXcgTWFwPFQsIFU+KCk7XHJcbiAgcHJpdmF0ZSBfdmFsdWVzOiBUW107XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBlbnVtZXJhdGlvblxyXG4gICAqIEBwYXJhbSBmYWN0b3J5IC0gZnVuY3Rpb24oIHtURW51bWVyYXRpb24uKn0gKSA9PiB7Kn0sIG1hcHMgYW4gZW51bWVyYXRpb24gdmFsdWUgdG8gYW55IHZhbHVlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZW51bWVyYXRpb246IFRFbnVtZXJhdGlvbjxUPiwgZmFjdG9yeTogKCB0OiBUICkgPT4gVSApIHtcclxuXHJcbiAgICB0aGlzLl9lbnVtZXJhdGlvbiA9IGVudW1lcmF0aW9uO1xyXG5cclxuICAgIHRoaXMuX3ZhbHVlcyA9IGVudW1lcmF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcztcclxuICAgIHRoaXMuX3ZhbHVlcy5mb3JFYWNoKCBlbnRyeSA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9tYXAuaGFzKCBlbnRyeSApLCAnRW51bWVyYXRpb24ga2V5IG92ZXJyaWRlIHByb2JsZW0nICk7XHJcbiAgICAgIHRoaXMuX21hcC5zZXQoIGVudHJ5LCBmYWN0b3J5KCBlbnRyeSApICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGVudW1lcmF0aW9uIGVudHJ5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQoIGVudHJ5OiBUICk6IFUge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdmFsdWVzLmluY2x1ZGVzKCBlbnRyeSApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9tYXAuaGFzKCBlbnRyeSApICk7XHJcbiAgICByZXR1cm4gdGhpcy5fbWFwLmdldCggZW50cnkgKSE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGVudW1lcmF0aW9uIGVudHJ5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQoIGVudHJ5OiBULCB2YWx1ZTogVSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3ZhbHVlcy5pbmNsdWRlcyggZW50cnkgKSApO1xyXG4gICAgdGhpcy5fbWFwLnNldCggZW50cnksIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IEVudW1lcmF0aW9uTWFwIHdpdGggbWFwcGVkIHZhbHVlcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBtYXBGdW5jdGlvbiAtIGZ1bmN0aW9uKCB7Kn0sIHtURW51bWVyYXRpb24uKn0gKTogeyp9XHJcbiAgICogQHJldHVybnMgV2l0aCB0aGUgbWFwcGVkIHZhbHVlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBtYXAoIG1hcEZ1bmN0aW9uOiAoIHU6IFUsIHQ6IFQgKSA9PiBVICk6IEVudW1lcmF0aW9uTWFwPFQsIFU+IHtcclxuICAgIHJldHVybiBuZXcgRW51bWVyYXRpb25NYXAoIHRoaXMuX2VudW1lcmF0aW9uLCBlbnRyeSA9PiBtYXBGdW5jdGlvbiggdGhpcy5nZXQoIGVudHJ5ICksIGVudHJ5ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBjYWxsYmFjayBvbiBlYWNoIGl0ZW0gb2YgdGhlIGVudW1lcmF0aW9uIG1hcC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBjYWxsYmFjayAtIGZ1bmN0aW9uKHZhbHVlOiosIGVudW1lcmF0aW9uVmFsdWU6KilcclxuICAgKi9cclxuICBwdWJsaWMgZm9yRWFjaCggY2FsbGJhY2s6ICggdTogVSwgdDogVCApID0+IHZvaWQgKTogdm9pZCB7XHJcbiAgICB0aGlzLl92YWx1ZXMuZm9yRWFjaCggZW50cnkgPT4gY2FsbGJhY2soIHRoaXMuZ2V0KCBlbnRyeSApLCBlbnRyeSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZXMgc3RvcmVkIGluIHRoZSBtYXAsIGFzIGFuIGFycmF5XHJcbiAgICpcclxuICAgKi9cclxuICBwdWJsaWMgdmFsdWVzKCk6IFVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdmFsdWVzLm1hcCggZW50cnkgPT4gdGhpcy5nZXQoIGVudHJ5ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbnBoZXRDb3JlLnJlZ2lzdGVyKCAnRW51bWVyYXRpb25NYXAnLCBFbnVtZXJhdGlvbk1hcCApO1xyXG5leHBvcnQgZGVmYXVsdCBFbnVtZXJhdGlvbk1hcDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGVBQWU7QUFRcEM7QUFDQTtBQUNBLE1BQU1DLGNBQWMsQ0FBTztFQUVqQkMsSUFBSSxHQUFHLElBQUlDLEdBQUcsQ0FBTyxDQUFDO0VBRzlCO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLFdBQTRCLEVBQUVDLE9BQXNCLEVBQUc7SUFFekUsSUFBSSxDQUFDQyxZQUFZLEdBQUdGLFdBQVc7SUFFL0IsSUFBSSxDQUFDRyxPQUFPLEdBQUdILFdBQVcsQ0FBQ0EsV0FBVyxDQUFDSSxNQUFNO0lBQzdDLElBQUksQ0FBQ0QsT0FBTyxDQUFDRSxPQUFPLENBQUVDLEtBQUssSUFBSTtNQUM3QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNWLElBQUksQ0FBQ1csR0FBRyxDQUFFRixLQUFNLENBQUMsRUFBRSxrQ0FBbUMsQ0FBQztNQUMvRSxJQUFJLENBQUNULElBQUksQ0FBQ1ksR0FBRyxDQUFFSCxLQUFLLEVBQUVMLE9BQU8sQ0FBRUssS0FBTSxDQUFFLENBQUM7SUFDMUMsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0VBQ1NJLEdBQUdBLENBQUVKLEtBQVEsRUFBTTtJQUN4QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDSixPQUFPLENBQUNRLFFBQVEsQ0FBRUwsS0FBTSxDQUFFLENBQUM7SUFDbERDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ1YsSUFBSSxDQUFDVyxHQUFHLENBQUVGLEtBQU0sQ0FBRSxDQUFDO0lBQzFDLE9BQU8sSUFBSSxDQUFDVCxJQUFJLENBQUNhLEdBQUcsQ0FBRUosS0FBTSxDQUFDO0VBQy9COztFQUVBO0FBQ0Y7QUFDQTtFQUNTRyxHQUFHQSxDQUFFSCxLQUFRLEVBQUVNLEtBQVEsRUFBUztJQUNyQ0wsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDSixPQUFPLENBQUNRLFFBQVEsQ0FBRUwsS0FBTSxDQUFFLENBQUM7SUFDbEQsSUFBSSxDQUFDVCxJQUFJLENBQUNZLEdBQUcsQ0FBRUgsS0FBSyxFQUFFTSxLQUFNLENBQUM7RUFDL0I7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLEdBQUdBLENBQUVDLFdBQWdDLEVBQXlCO0lBQ25FLE9BQU8sSUFBSWxCLGNBQWMsQ0FBRSxJQUFJLENBQUNNLFlBQVksRUFBRUksS0FBSyxJQUFJUSxXQUFXLENBQUUsSUFBSSxDQUFDSixHQUFHLENBQUVKLEtBQU0sQ0FBQyxFQUFFQSxLQUFNLENBQUUsQ0FBQztFQUNsRzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NELE9BQU9BLENBQUVVLFFBQWdDLEVBQVM7SUFDdkQsSUFBSSxDQUFDWixPQUFPLENBQUNFLE9BQU8sQ0FBRUMsS0FBSyxJQUFJUyxRQUFRLENBQUUsSUFBSSxDQUFDTCxHQUFHLENBQUVKLEtBQU0sQ0FBQyxFQUFFQSxLQUFNLENBQUUsQ0FBQztFQUN2RTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNTRixNQUFNQSxDQUFBLEVBQVE7SUFDbkIsT0FBTyxJQUFJLENBQUNELE9BQU8sQ0FBQ1UsR0FBRyxDQUFFUCxLQUFLLElBQUksSUFBSSxDQUFDSSxHQUFHLENBQUVKLEtBQU0sQ0FBRSxDQUFDO0VBQ3ZEO0FBQ0Y7QUFFQVgsUUFBUSxDQUFDcUIsUUFBUSxDQUFFLGdCQUFnQixFQUFFcEIsY0FBZSxDQUFDO0FBQ3JELGVBQWVBLGNBQWMifQ==