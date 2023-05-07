// Copyright 2018-2022, University of Colorado Boulder

/**
 * Creates a simple enumeration, with most of the boilerplate.
 *
 * An EnumerationDeprecated can be created like this:
 *
 *   const CardinalDirection = EnumerationDeprecated.byKeys( [ 'NORTH', 'SOUTH', 'EAST', 'WEST' ] );
 *
 * OR using rich values like so:
 *
 *   const CardinalDirection = EnumerationDeprecated.byMap( {NORTH: northObject, SOUTH: southObject, EAST: eastObject, WEST: westObject} );
 *
 * and values are referenced like this:
 *
 *   CardinalDirection.NORTH;
 *   CardinalDirection.SOUTH;
 *   CardinalDirection.EAST;
 *   CardinalDirection.WEST;
 *
 *   CardinalDirection.VALUES;
 *   // returns [ CardinalDirection.NORTH, CardinalDirection.SOUTH, CardinalDirection.EAST, CardinalDirection.WEST ]
 *
 * And support for checking whether any value is a value of the enumeration:
 *
 *   CardinalDirection.includes( CardinalDirection.NORTH ); // true
 *   CardinalDirection.includes( CardinalDirection.SOUTHWEST ); // false
 *   CardinalDirection.includes( 'NORTH' ); // false, values are not strings
 *
 * Conventions for using EnumerationDeprecated, from https://github.com/phetsims/phet-core/issues/53:
 *
 * (1) Enumerations are named like classes/types. Nothing in the name needs to identify that they are Enumerations.
 *     See the example above: CardinalDirection, not CardinalDirectionEnum or CardinalDirectionEnumeration.
 *
 * (2) EnumerationDeprecated values are named like constants, using uppercase. See the example above.
 *
 * (3) If an EnumerationDeprecated is closely related to some class, then make it a static field of that class. If an
 *     EnumerationDeprecated is specific to a Property, then the EnumerationDeprecated should likely be owned by the class that
 *     owns that Property.
 *
 * (4) If an EnumerationDeprecated is not closely related to some class, then put the EnumerationDeprecated in its own .js file.
 *     Do not combine multiple Enumerations into one file.
 *
 * (5) If a Property takes an EnumerationDeprecated value, its validation typically looks like this:
 *
 *     const cardinalDirectionProperty = new Property( CardinalDirection.NORTH, {
 *       validValues: CardinalDirection.VALUES
 *     }
 *
 * (6) Values of the EnumerationDeprecated are considered instances of the EnumerationDeprecated in documentation. For example, a method
 *     that that takes an EnumerationDeprecated value as an argument would be documented like this:
 *
 *     // @param {Scene} mode - value from Scene EnumerationDeprecated
 *     setSceneMode( mode ) {
 *       assert && assert( Scene.includes( mode ) );
 *       //...
 *     }
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import deprecationWarning from './deprecationWarning.js';
import merge from './merge.js';
import phetCore from './phetCore.js';

/**
 * @deprecated
 */
class EnumerationDeprecated {
  /**
   * @param {Object} config - must provide keys such as {keys:['RED','BLUE]}
   *                          - or map such as {map:{RED: myRedValue, BLUE: myBlueValue}}
   *
   * @private - clients should use EnumerationDeprecated.byKeys or EnumerationDeprecated.byMap
   */
  constructor(config) {
    deprecationWarning('EnumerationDeprecated should be exchanged for classes that extend EnumerationValue, see WilderEnumerationPatterns for examples.');
    assert && assert(config, 'config must be provided');
    const keysProvided = !!config.keys;
    const mapProvided = !!config.map;
    assert && assert(keysProvided !== mapProvided, 'must provide one or the other but not both of keys/map');
    const keys = config.keys || Object.keys(config.map);
    const map = config.map || {};
    config = merge({
      // {string|null} Will be appended to the EnumerationIO documentation, if provided
      phetioDocumentation: null,
      // {function(EnumerationDeprecated):|null} If provided, it will be called as beforeFreeze( enumeration ) just before the
      // enumeration is frozen. Since it's not possible to modify the enumeration after
      // it is frozen (e.g. adding convenience functions), and there is no reference to
      // the enumeration object beforehand, this allows defining custom values/methods
      // on the enumeration object itself.
      beforeFreeze: null
    }, config);
    assert && assert(Array.isArray(keys), 'Values should be an array');
    assert && assert(_.uniq(keys).length === keys.length, 'There should be no duplicated values provided');
    assert && keys.forEach(value => assert(typeof value === 'string', 'Each value should be a string'));
    assert && keys.forEach(value => assert(/^[A-Z][A-Z0-9_]*$/g.test(value), 'EnumerationDeprecated values should be uppercase alphanumeric with underscores and begin with a letter'));
    assert && assert(!_.includes(keys, 'VALUES'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');
    assert && assert(!_.includes(keys, 'KEYS'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');
    assert && assert(!_.includes(keys, 'includes'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');

    // @public (phet-io) - provides additional documentation for PhET-iO which can be viewed in studio
    // Note this uses the same term as used by PhetioObject, but via a different channel.
    this.phetioDocumentation = config.phetioDocumentation;

    // @public {string[]} (read-only) - the string keys of the enumeration
    this.KEYS = keys;

    // @public {Object[]} (read-only) - the object values of the enumeration
    this.VALUES = [];
    keys.forEach(key => {
      const value = map[key] || {};

      // Set attributes of the enumeration value
      assert && assert(value.name === undefined, '"rich" enumeration values cannot provide their own name attribute');
      assert && assert(value.toString === Object.prototype.toString, '"rich" enumeration values cannot provide their own toString');

      // @public {string} (read-only) - PhET-iO public API relies on this mapping, do not change it lightly
      value.name = key;

      // @public {function():string} (read-only)
      value.toString = () => key;

      // Assign to the enumeration
      this[key] = value;
      this.VALUES.push(value);
    });
    config.beforeFreeze && config.beforeFreeze(this);
    assert && Object.freeze(this);
    assert && Object.freeze(this.VALUES);
    assert && Object.freeze(this.KEYS);
    assert && keys.forEach(key => assert && Object.freeze(map[key]));
  }

  /**
   * Based solely on the keys in EnumerationDeprecated.
   * @public
   *
   * @returns {String}
   */

  toString() {
    return this.KEYS.join(', ');
  }

  /**
   * Checks whether the given value is a value of this enumeration. Should generally be used for assertions
   * @public
   *
   * @param {Object} value
   * @returns {boolean}
   */
  includes(value) {
    return _.includes(this.VALUES, value);
  }

  /**
   * To support consistent API with Enumeration.
   * @public
   * @param {string} key
   * @returns {*}
   */
  getValue(key) {
    return this[key];
  }

  /**
   * To support consistent API with Enumeration.
   * @public
   * @param {Object} enumerationValue
   * @returns {string}
   */
  getKey(enumerationValue) {
    return enumerationValue.name;
  }

  /**
   * To support consistent API with Enumeration.
   * @public
   * @returns {Object[]}
   */
  get values() {
    return this.VALUES;
  }

  /**
   * To support consistent API with Enumeration.
   * @public
   * @returns {string[]}
   */
  get keys() {
    return this.KEYS;
  }

  /**
   * To support consistent API with Enumeration.
   * @public
   * @returns {EnumerationDeprecated}
   */
  get enumeration() {
    return this;
  }

  /**
   * Creates an enumeration based on the provided string array
   * @param {string[]} keys - such as ['RED','BLUE']
   * @param {Object} [options]
   * @returns {EnumerationDeprecated}
   * @public
   */
  static byKeys(keys, options) {
    assert && assert(Array.isArray(keys), 'keys must be an array');
    assert && assert(!options || options.keys === undefined);
    return new EnumerationDeprecated(merge({
      keys: keys
    }, options));
  }

  /**
   * Creates a "rich" enumeration based on the provided map
   * @param {Object} map - such as {RED: myRedValue, BLUE: myBlueValue}
   * @param {Object} [options]
   * @returns {EnumerationDeprecated}
   * @public
   */
  static byMap(map, options) {
    assert && assert(!options || options.map === undefined);
    if (assert) {
      const values = _.values(map);
      assert && assert(values.length >= 1, 'must have at least 2 entries in an enumeration');
      assert && assert(_.every(values, value => value.constructor === values[0].constructor), 'Values must have same constructor');
    }
    return new EnumerationDeprecated(merge({
      map: map
    }, options));
  }
}
phetCore.register('EnumerationDeprecated', EnumerationDeprecated);
export default EnumerationDeprecated;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZXByZWNhdGlvbldhcm5pbmciLCJtZXJnZSIsInBoZXRDb3JlIiwiRW51bWVyYXRpb25EZXByZWNhdGVkIiwiY29uc3RydWN0b3IiLCJjb25maWciLCJhc3NlcnQiLCJrZXlzUHJvdmlkZWQiLCJrZXlzIiwibWFwUHJvdmlkZWQiLCJtYXAiLCJPYmplY3QiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiYmVmb3JlRnJlZXplIiwiQXJyYXkiLCJpc0FycmF5IiwiXyIsInVuaXEiLCJsZW5ndGgiLCJmb3JFYWNoIiwidmFsdWUiLCJ0ZXN0IiwiaW5jbHVkZXMiLCJLRVlTIiwiVkFMVUVTIiwia2V5IiwibmFtZSIsInVuZGVmaW5lZCIsInRvU3RyaW5nIiwicHJvdG90eXBlIiwicHVzaCIsImZyZWV6ZSIsImpvaW4iLCJnZXRWYWx1ZSIsImdldEtleSIsImVudW1lcmF0aW9uVmFsdWUiLCJ2YWx1ZXMiLCJlbnVtZXJhdGlvbiIsImJ5S2V5cyIsIm9wdGlvbnMiLCJieU1hcCIsImV2ZXJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHNpbXBsZSBlbnVtZXJhdGlvbiwgd2l0aCBtb3N0IG9mIHRoZSBib2lsZXJwbGF0ZS5cclxuICpcclxuICogQW4gRW51bWVyYXRpb25EZXByZWNhdGVkIGNhbiBiZSBjcmVhdGVkIGxpa2UgdGhpczpcclxuICpcclxuICogICBjb25zdCBDYXJkaW5hbERpcmVjdGlvbiA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ05PUlRIJywgJ1NPVVRIJywgJ0VBU1QnLCAnV0VTVCcgXSApO1xyXG4gKlxyXG4gKiBPUiB1c2luZyByaWNoIHZhbHVlcyBsaWtlIHNvOlxyXG4gKlxyXG4gKiAgIGNvbnN0IENhcmRpbmFsRGlyZWN0aW9uID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5TWFwKCB7Tk9SVEg6IG5vcnRoT2JqZWN0LCBTT1VUSDogc291dGhPYmplY3QsIEVBU1Q6IGVhc3RPYmplY3QsIFdFU1Q6IHdlc3RPYmplY3R9ICk7XHJcbiAqXHJcbiAqIGFuZCB2YWx1ZXMgYXJlIHJlZmVyZW5jZWQgbGlrZSB0aGlzOlxyXG4gKlxyXG4gKiAgIENhcmRpbmFsRGlyZWN0aW9uLk5PUlRIO1xyXG4gKiAgIENhcmRpbmFsRGlyZWN0aW9uLlNPVVRIO1xyXG4gKiAgIENhcmRpbmFsRGlyZWN0aW9uLkVBU1Q7XHJcbiAqICAgQ2FyZGluYWxEaXJlY3Rpb24uV0VTVDtcclxuICpcclxuICogICBDYXJkaW5hbERpcmVjdGlvbi5WQUxVRVM7XHJcbiAqICAgLy8gcmV0dXJucyBbIENhcmRpbmFsRGlyZWN0aW9uLk5PUlRILCBDYXJkaW5hbERpcmVjdGlvbi5TT1VUSCwgQ2FyZGluYWxEaXJlY3Rpb24uRUFTVCwgQ2FyZGluYWxEaXJlY3Rpb24uV0VTVCBdXHJcbiAqXHJcbiAqIEFuZCBzdXBwb3J0IGZvciBjaGVja2luZyB3aGV0aGVyIGFueSB2YWx1ZSBpcyBhIHZhbHVlIG9mIHRoZSBlbnVtZXJhdGlvbjpcclxuICpcclxuICogICBDYXJkaW5hbERpcmVjdGlvbi5pbmNsdWRlcyggQ2FyZGluYWxEaXJlY3Rpb24uTk9SVEggKTsgLy8gdHJ1ZVxyXG4gKiAgIENhcmRpbmFsRGlyZWN0aW9uLmluY2x1ZGVzKCBDYXJkaW5hbERpcmVjdGlvbi5TT1VUSFdFU1QgKTsgLy8gZmFsc2VcclxuICogICBDYXJkaW5hbERpcmVjdGlvbi5pbmNsdWRlcyggJ05PUlRIJyApOyAvLyBmYWxzZSwgdmFsdWVzIGFyZSBub3Qgc3RyaW5nc1xyXG4gKlxyXG4gKiBDb252ZW50aW9ucyBmb3IgdXNpbmcgRW51bWVyYXRpb25EZXByZWNhdGVkLCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzUzOlxyXG4gKlxyXG4gKiAoMSkgRW51bWVyYXRpb25zIGFyZSBuYW1lZCBsaWtlIGNsYXNzZXMvdHlwZXMuIE5vdGhpbmcgaW4gdGhlIG5hbWUgbmVlZHMgdG8gaWRlbnRpZnkgdGhhdCB0aGV5IGFyZSBFbnVtZXJhdGlvbnMuXHJcbiAqICAgICBTZWUgdGhlIGV4YW1wbGUgYWJvdmU6IENhcmRpbmFsRGlyZWN0aW9uLCBub3QgQ2FyZGluYWxEaXJlY3Rpb25FbnVtIG9yIENhcmRpbmFsRGlyZWN0aW9uRW51bWVyYXRpb24uXHJcbiAqXHJcbiAqICgyKSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgdmFsdWVzIGFyZSBuYW1lZCBsaWtlIGNvbnN0YW50cywgdXNpbmcgdXBwZXJjYXNlLiBTZWUgdGhlIGV4YW1wbGUgYWJvdmUuXHJcbiAqXHJcbiAqICgzKSBJZiBhbiBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgaXMgY2xvc2VseSByZWxhdGVkIHRvIHNvbWUgY2xhc3MsIHRoZW4gbWFrZSBpdCBhIHN0YXRpYyBmaWVsZCBvZiB0aGF0IGNsYXNzLiBJZiBhblxyXG4gKiAgICAgRW51bWVyYXRpb25EZXByZWNhdGVkIGlzIHNwZWNpZmljIHRvIGEgUHJvcGVydHksIHRoZW4gdGhlIEVudW1lcmF0aW9uRGVwcmVjYXRlZCBzaG91bGQgbGlrZWx5IGJlIG93bmVkIGJ5IHRoZSBjbGFzcyB0aGF0XHJcbiAqICAgICBvd25zIHRoYXQgUHJvcGVydHkuXHJcbiAqXHJcbiAqICg0KSBJZiBhbiBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgaXMgbm90IGNsb3NlbHkgcmVsYXRlZCB0byBzb21lIGNsYXNzLCB0aGVuIHB1dCB0aGUgRW51bWVyYXRpb25EZXByZWNhdGVkIGluIGl0cyBvd24gLmpzIGZpbGUuXHJcbiAqICAgICBEbyBub3QgY29tYmluZSBtdWx0aXBsZSBFbnVtZXJhdGlvbnMgaW50byBvbmUgZmlsZS5cclxuICpcclxuICogKDUpIElmIGEgUHJvcGVydHkgdGFrZXMgYW4gRW51bWVyYXRpb25EZXByZWNhdGVkIHZhbHVlLCBpdHMgdmFsaWRhdGlvbiB0eXBpY2FsbHkgbG9va3MgbGlrZSB0aGlzOlxyXG4gKlxyXG4gKiAgICAgY29uc3QgY2FyZGluYWxEaXJlY3Rpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggQ2FyZGluYWxEaXJlY3Rpb24uTk9SVEgsIHtcclxuICogICAgICAgdmFsaWRWYWx1ZXM6IENhcmRpbmFsRGlyZWN0aW9uLlZBTFVFU1xyXG4gKiAgICAgfVxyXG4gKlxyXG4gKiAoNikgVmFsdWVzIG9mIHRoZSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgYXJlIGNvbnNpZGVyZWQgaW5zdGFuY2VzIG9mIHRoZSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgaW4gZG9jdW1lbnRhdGlvbi4gRm9yIGV4YW1wbGUsIGEgbWV0aG9kXHJcbiAqICAgICB0aGF0IHRoYXQgdGFrZXMgYW4gRW51bWVyYXRpb25EZXByZWNhdGVkIHZhbHVlIGFzIGFuIGFyZ3VtZW50IHdvdWxkIGJlIGRvY3VtZW50ZWQgbGlrZSB0aGlzOlxyXG4gKlxyXG4gKiAgICAgLy8gQHBhcmFtIHtTY2VuZX0gbW9kZSAtIHZhbHVlIGZyb20gU2NlbmUgRW51bWVyYXRpb25EZXByZWNhdGVkXHJcbiAqICAgICBzZXRTY2VuZU1vZGUoIG1vZGUgKSB7XHJcbiAqICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIFNjZW5lLmluY2x1ZGVzKCBtb2RlICkgKTtcclxuICogICAgICAgLy8uLi5cclxuICogICAgIH1cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBkZXByZWNhdGlvbldhcm5pbmcgZnJvbSAnLi9kZXByZWNhdGlvbldhcm5pbmcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi9tZXJnZS5qcyc7XHJcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcclxuXHJcbi8qKlxyXG4gKiBAZGVwcmVjYXRlZFxyXG4gKi9cclxuY2xhc3MgRW51bWVyYXRpb25EZXByZWNhdGVkIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIG11c3QgcHJvdmlkZSBrZXlzIHN1Y2ggYXMge2tleXM6WydSRUQnLCdCTFVFXX1cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgLSBvciBtYXAgc3VjaCBhcyB7bWFwOntSRUQ6IG15UmVkVmFsdWUsIEJMVUU6IG15Qmx1ZVZhbHVlfX1cclxuICAgKlxyXG4gICAqIEBwcml2YXRlIC0gY2xpZW50cyBzaG91bGQgdXNlIEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMgb3IgRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5TWFwXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvbmZpZyApIHtcclxuICAgIGRlcHJlY2F0aW9uV2FybmluZyggJ0VudW1lcmF0aW9uRGVwcmVjYXRlZCBzaG91bGQgYmUgZXhjaGFuZ2VkIGZvciBjbGFzc2VzIHRoYXQgZXh0ZW5kIEVudW1lcmF0aW9uVmFsdWUsIHNlZSBXaWxkZXJFbnVtZXJhdGlvblBhdHRlcm5zIGZvciBleGFtcGxlcy4nICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29uZmlnLCAnY29uZmlnIG11c3QgYmUgcHJvdmlkZWQnICk7XHJcblxyXG4gICAgY29uc3Qga2V5c1Byb3ZpZGVkID0gISFjb25maWcua2V5cztcclxuICAgIGNvbnN0IG1hcFByb3ZpZGVkID0gISFjb25maWcubWFwO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5c1Byb3ZpZGVkICE9PSBtYXBQcm92aWRlZCwgJ211c3QgcHJvdmlkZSBvbmUgb3IgdGhlIG90aGVyIGJ1dCBub3QgYm90aCBvZiBrZXlzL21hcCcgKTtcclxuXHJcbiAgICBjb25zdCBrZXlzID0gY29uZmlnLmtleXMgfHwgT2JqZWN0LmtleXMoIGNvbmZpZy5tYXAgKTtcclxuICAgIGNvbnN0IG1hcCA9IGNvbmZpZy5tYXAgfHwge307XHJcblxyXG4gICAgY29uZmlnID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtzdHJpbmd8bnVsbH0gV2lsbCBiZSBhcHBlbmRlZCB0byB0aGUgRW51bWVyYXRpb25JTyBkb2N1bWVudGF0aW9uLCBpZiBwcm92aWRlZFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBudWxsLFxyXG5cclxuICAgICAgLy8ge2Z1bmN0aW9uKEVudW1lcmF0aW9uRGVwcmVjYXRlZCk6fG51bGx9IElmIHByb3ZpZGVkLCBpdCB3aWxsIGJlIGNhbGxlZCBhcyBiZWZvcmVGcmVlemUoIGVudW1lcmF0aW9uICkganVzdCBiZWZvcmUgdGhlXHJcbiAgICAgIC8vIGVudW1lcmF0aW9uIGlzIGZyb3plbi4gU2luY2UgaXQncyBub3QgcG9zc2libGUgdG8gbW9kaWZ5IHRoZSBlbnVtZXJhdGlvbiBhZnRlclxyXG4gICAgICAvLyBpdCBpcyBmcm96ZW4gKGUuZy4gYWRkaW5nIGNvbnZlbmllbmNlIGZ1bmN0aW9ucyksIGFuZCB0aGVyZSBpcyBubyByZWZlcmVuY2UgdG9cclxuICAgICAgLy8gdGhlIGVudW1lcmF0aW9uIG9iamVjdCBiZWZvcmVoYW5kLCB0aGlzIGFsbG93cyBkZWZpbmluZyBjdXN0b20gdmFsdWVzL21ldGhvZHNcclxuICAgICAgLy8gb24gdGhlIGVudW1lcmF0aW9uIG9iamVjdCBpdHNlbGYuXHJcbiAgICAgIGJlZm9yZUZyZWV6ZTogbnVsbFxyXG4gICAgfSwgY29uZmlnICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSgga2V5cyApLCAnVmFsdWVzIHNob3VsZCBiZSBhbiBhcnJheScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8udW5pcSgga2V5cyApLmxlbmd0aCA9PT0ga2V5cy5sZW5ndGgsICdUaGVyZSBzaG91bGQgYmUgbm8gZHVwbGljYXRlZCB2YWx1ZXMgcHJvdmlkZWQnICk7XHJcbiAgICBhc3NlcnQgJiYga2V5cy5mb3JFYWNoKCB2YWx1ZSA9PiBhc3NlcnQoIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycsICdFYWNoIHZhbHVlIHNob3VsZCBiZSBhIHN0cmluZycgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGtleXMuZm9yRWFjaCggdmFsdWUgPT4gYXNzZXJ0KCAvXltBLVpdW0EtWjAtOV9dKiQvZy50ZXN0KCB2YWx1ZSApLFxyXG4gICAgICAnRW51bWVyYXRpb25EZXByZWNhdGVkIHZhbHVlcyBzaG91bGQgYmUgdXBwZXJjYXNlIGFscGhhbnVtZXJpYyB3aXRoIHVuZGVyc2NvcmVzIGFuZCBiZWdpbiB3aXRoIGEgbGV0dGVyJyApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhXy5pbmNsdWRlcygga2V5cywgJ1ZBTFVFUycgKSxcclxuICAgICAgJ1RoaXMgaXMgdGhlIG5hbWUgb2YgYSBidWlsdC1pbiBwcm92aWRlZCB2YWx1ZSwgc28gaXQgY2Fubm90IGJlIGluY2x1ZGVkIGFzIGFuIGVudW1lcmF0aW9uIHZhbHVlJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIGtleXMsICdLRVlTJyApLFxyXG4gICAgICAnVGhpcyBpcyB0aGUgbmFtZSBvZiBhIGJ1aWx0LWluIHByb3ZpZGVkIHZhbHVlLCBzbyBpdCBjYW5ub3QgYmUgaW5jbHVkZWQgYXMgYW4gZW51bWVyYXRpb24gdmFsdWUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhXy5pbmNsdWRlcygga2V5cywgJ2luY2x1ZGVzJyApLFxyXG4gICAgICAnVGhpcyBpcyB0aGUgbmFtZSBvZiBhIGJ1aWx0LWluIHByb3ZpZGVkIHZhbHVlLCBzbyBpdCBjYW5ub3QgYmUgaW5jbHVkZWQgYXMgYW4gZW51bWVyYXRpb24gdmFsdWUnICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocGhldC1pbykgLSBwcm92aWRlcyBhZGRpdGlvbmFsIGRvY3VtZW50YXRpb24gZm9yIFBoRVQtaU8gd2hpY2ggY2FuIGJlIHZpZXdlZCBpbiBzdHVkaW9cclxuICAgIC8vIE5vdGUgdGhpcyB1c2VzIHRoZSBzYW1lIHRlcm0gYXMgdXNlZCBieSBQaGV0aW9PYmplY3QsIGJ1dCB2aWEgYSBkaWZmZXJlbnQgY2hhbm5lbC5cclxuICAgIHRoaXMucGhldGlvRG9jdW1lbnRhdGlvbiA9IGNvbmZpZy5waGV0aW9Eb2N1bWVudGF0aW9uO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge3N0cmluZ1tdfSAocmVhZC1vbmx5KSAtIHRoZSBzdHJpbmcga2V5cyBvZiB0aGUgZW51bWVyYXRpb25cclxuICAgIHRoaXMuS0VZUyA9IGtleXM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JqZWN0W119IChyZWFkLW9ubHkpIC0gdGhlIG9iamVjdCB2YWx1ZXMgb2YgdGhlIGVudW1lcmF0aW9uXHJcbiAgICB0aGlzLlZBTFVFUyA9IFtdO1xyXG5cclxuICAgIGtleXMuZm9yRWFjaCgga2V5ID0+IHtcclxuICAgICAgY29uc3QgdmFsdWUgPSBtYXBbIGtleSBdIHx8IHt9O1xyXG5cclxuICAgICAgLy8gU2V0IGF0dHJpYnV0ZXMgb2YgdGhlIGVudW1lcmF0aW9uIHZhbHVlXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlLm5hbWUgPT09IHVuZGVmaW5lZCwgJ1wicmljaFwiIGVudW1lcmF0aW9uIHZhbHVlcyBjYW5ub3QgcHJvdmlkZSB0aGVpciBvd24gbmFtZSBhdHRyaWJ1dGUnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlLnRvU3RyaW5nID09PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLCAnXCJyaWNoXCIgZW51bWVyYXRpb24gdmFsdWVzIGNhbm5vdCBwcm92aWRlIHRoZWlyIG93biB0b1N0cmluZycgKTtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge3N0cmluZ30gKHJlYWQtb25seSkgLSBQaEVULWlPIHB1YmxpYyBBUEkgcmVsaWVzIG9uIHRoaXMgbWFwcGluZywgZG8gbm90IGNoYW5nZSBpdCBsaWdodGx5XHJcbiAgICAgIHZhbHVlLm5hbWUgPSBrZXk7XHJcblxyXG4gICAgICAvLyBAcHVibGljIHtmdW5jdGlvbigpOnN0cmluZ30gKHJlYWQtb25seSlcclxuICAgICAgdmFsdWUudG9TdHJpbmcgPSAoKSA9PiBrZXk7XHJcblxyXG4gICAgICAvLyBBc3NpZ24gdG8gdGhlIGVudW1lcmF0aW9uXHJcbiAgICAgIHRoaXNbIGtleSBdID0gdmFsdWU7XHJcbiAgICAgIHRoaXMuVkFMVUVTLnB1c2goIHZhbHVlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uZmlnLmJlZm9yZUZyZWV6ZSAmJiBjb25maWcuYmVmb3JlRnJlZXplKCB0aGlzICk7XHJcbiAgICBhc3NlcnQgJiYgT2JqZWN0LmZyZWV6ZSggdGhpcyApO1xyXG4gICAgYXNzZXJ0ICYmIE9iamVjdC5mcmVlemUoIHRoaXMuVkFMVUVTICk7XHJcbiAgICBhc3NlcnQgJiYgT2JqZWN0LmZyZWV6ZSggdGhpcy5LRVlTICk7XHJcbiAgICBhc3NlcnQgJiYga2V5cy5mb3JFYWNoKCBrZXkgPT4gYXNzZXJ0ICYmIE9iamVjdC5mcmVlemUoIG1hcFsga2V5IF0gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQmFzZWQgc29sZWx5IG9uIHRoZSBrZXlzIGluIEVudW1lcmF0aW9uRGVwcmVjYXRlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7U3RyaW5nfVxyXG4gICAqL1xyXG5cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiB0aGlzLktFWVMuam9pbiggJywgJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGlzIGEgdmFsdWUgb2YgdGhpcyBlbnVtZXJhdGlvbi4gU2hvdWxkIGdlbmVyYWxseSBiZSB1c2VkIGZvciBhc3NlcnRpb25zXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaW5jbHVkZXMoIHZhbHVlICkge1xyXG4gICAgcmV0dXJuIF8uaW5jbHVkZXMoIHRoaXMuVkFMVUVTLCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG8gc3VwcG9ydCBjb25zaXN0ZW50IEFQSSB3aXRoIEVudW1lcmF0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcbiAgICogQHJldHVybnMgeyp9XHJcbiAgICovXHJcbiAgZ2V0VmFsdWUoIGtleSApIHtcclxuICAgIHJldHVybiB0aGlzWyBrZXkgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvIHN1cHBvcnQgY29uc2lzdGVudCBBUEkgd2l0aCBFbnVtZXJhdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVudW1lcmF0aW9uVmFsdWVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEtleSggZW51bWVyYXRpb25WYWx1ZSApIHtcclxuICAgIHJldHVybiBlbnVtZXJhdGlvblZhbHVlLm5hbWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUbyBzdXBwb3J0IGNvbnNpc3RlbnQgQVBJIHdpdGggRW51bWVyYXRpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtPYmplY3RbXX1cclxuICAgKi9cclxuICBnZXQgdmFsdWVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuVkFMVUVTO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG8gc3VwcG9ydCBjb25zaXN0ZW50IEFQSSB3aXRoIEVudW1lcmF0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nW119XHJcbiAgICovXHJcbiAgZ2V0IGtleXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5LRVlTO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG8gc3VwcG9ydCBjb25zaXN0ZW50IEFQSSB3aXRoIEVudW1lcmF0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7RW51bWVyYXRpb25EZXByZWNhdGVkfVxyXG4gICAqL1xyXG4gIGdldCBlbnVtZXJhdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBlbnVtZXJhdGlvbiBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgc3RyaW5nIGFycmF5XHJcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0ga2V5cyAtIHN1Y2ggYXMgWydSRUQnLCdCTFVFJ11cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHJldHVybnMge0VudW1lcmF0aW9uRGVwcmVjYXRlZH1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RhdGljIGJ5S2V5cygga2V5cywgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGtleXMgKSwgJ2tleXMgbXVzdCBiZSBhbiBhcnJheScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zIHx8IG9wdGlvbnMua2V5cyA9PT0gdW5kZWZpbmVkICk7XHJcbiAgICByZXR1cm4gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZCggbWVyZ2UoIHsga2V5czoga2V5cyB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBcInJpY2hcIiBlbnVtZXJhdGlvbiBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgbWFwXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1hcCAtIHN1Y2ggYXMge1JFRDogbXlSZWRWYWx1ZSwgQkxVRTogbXlCbHVlVmFsdWV9XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtFbnVtZXJhdGlvbkRlcHJlY2F0ZWR9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0YXRpYyBieU1hcCggbWFwLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMgfHwgb3B0aW9ucy5tYXAgPT09IHVuZGVmaW5lZCApO1xyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlcyA9IF8udmFsdWVzKCBtYXAgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWVzLmxlbmd0aCA+PSAxLCAnbXVzdCBoYXZlIGF0IGxlYXN0IDIgZW50cmllcyBpbiBhbiBlbnVtZXJhdGlvbicgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdmFsdWVzLCB2YWx1ZSA9PiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gdmFsdWVzWyAwIF0uY29uc3RydWN0b3IgKSwgJ1ZhbHVlcyBtdXN0IGhhdmUgc2FtZSBjb25zdHJ1Y3RvcicgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkKCBtZXJnZSggeyBtYXA6IG1hcCB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbnBoZXRDb3JlLnJlZ2lzdGVyKCAnRW51bWVyYXRpb25EZXByZWNhdGVkJywgRW51bWVyYXRpb25EZXByZWNhdGVkICk7XHJcbmV4cG9ydCBkZWZhdWx0IEVudW1lcmF0aW9uRGVwcmVjYXRlZDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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