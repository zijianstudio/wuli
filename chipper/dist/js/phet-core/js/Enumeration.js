// Copyright 2021-2022, University of Colorado Boulder

/**
 * This implementation auto-detects the enumeration values by Object.keys and instanceof. Every property that has a
 * type matching the enumeration type is marked as a value.  See sample usage in Orientation.ts.
 *
 * For general pattern see https://github.com/phetsims/phet-info/blob/master/doc/phet-software-design-patterns.md#enumeration
 *
 * This creates 2-way maps (key-to-value and value-to-key) for ease of use and to enable phet-io serialization.
 *
 * class T extends EnumerationValue {
 *     static a=new T();
 *     static b =new T();
 *     getName(){return 'he';}
 *     get thing(){return 'text';}
 *     static get age(){return 77;}
 *     static enumeration = new Enumeration( T );
 * }
 * T.enumeration.keys => ['a', 'b']
 * T.enumeration.values => [T, T]
 *
 * Note how `keys` only picks up 'a' and 'b'.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import phetCore from './phetCore.js';
import EnumerationValue from './EnumerationValue.js';
import inheritance from './inheritance.js';
import optionize from './optionize.js';
class Enumeration {
  // in the order that static instances are defined

  constructor(Enumeration, providedOptions) {
    const options = optionize()({
      phetioDocumentation: '',
      // Values are plucked from the supplied Enumeration, but in order to support subtyping (augmenting) Enumerations,
      // you can specify the rule for what counts as a member of the enumeration. This should only be used in the
      // special case of augmenting existing enumerations.
      instanceType: Enumeration
    }, providedOptions);
    this.phetioDocumentation = options.phetioDocumentation;
    const instanceType = options.instanceType;

    // Iterate over the type hierarchy to support augmenting enumerations, but reverse so that newly added enumeration
    // values appear after previously existing enumeration values
    const types = _.reverse(inheritance(Enumeration));
    assert && assert(types.includes(instanceType), 'the specified type should be in its own hierarchy');
    this.keys = [];
    this.values = [];
    types.forEach(type => {
      Object.keys(type).forEach(key => {
        const value = type[key];
        if (value instanceof instanceType) {
          assert && assert(key === key.toUpperCase(), 'keys should be upper case by convention');
          this.keys.push(key);
          this.values.push(value);

          // Only assign this to the lowest Enumeration in the hierarchy. Otherwise this would overwrite the
          // supertype-assigned Enumeration. See https://github.com/phetsims/phet-core/issues/102
          if (value instanceof Enumeration) {
            value.name = key;
            value.enumeration = this;
          }
        }
      });
    });
    assert && assert(this.keys.length > 0, 'no keys found');
    assert && assert(this.values.length > 0, 'no values found');
    this.Enumeration = Enumeration;
    EnumerationValue.sealedCache.add(Enumeration);
  }
  getKey(value) {
    return value.name;
  }
  getValue(key) {
    return this.Enumeration[key];
  }
  includes(value) {
    return this.values.includes(value);
  }
}
phetCore.register('Enumeration', Enumeration);
export default Enumeration;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsIkVudW1lcmF0aW9uVmFsdWUiLCJpbmhlcml0YW5jZSIsIm9wdGlvbml6ZSIsIkVudW1lcmF0aW9uIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImluc3RhbmNlVHlwZSIsInR5cGVzIiwiXyIsInJldmVyc2UiLCJhc3NlcnQiLCJpbmNsdWRlcyIsImtleXMiLCJ2YWx1ZXMiLCJmb3JFYWNoIiwidHlwZSIsIk9iamVjdCIsImtleSIsInZhbHVlIiwidG9VcHBlckNhc2UiLCJwdXNoIiwibmFtZSIsImVudW1lcmF0aW9uIiwibGVuZ3RoIiwic2VhbGVkQ2FjaGUiLCJhZGQiLCJnZXRLZXkiLCJnZXRWYWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW51bWVyYXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBhdXRvLWRldGVjdHMgdGhlIGVudW1lcmF0aW9uIHZhbHVlcyBieSBPYmplY3Qua2V5cyBhbmQgaW5zdGFuY2VvZi4gRXZlcnkgcHJvcGVydHkgdGhhdCBoYXMgYVxyXG4gKiB0eXBlIG1hdGNoaW5nIHRoZSBlbnVtZXJhdGlvbiB0eXBlIGlzIG1hcmtlZCBhcyBhIHZhbHVlLiAgU2VlIHNhbXBsZSB1c2FnZSBpbiBPcmllbnRhdGlvbi50cy5cclxuICpcclxuICogRm9yIGdlbmVyYWwgcGF0dGVybiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW5mby9ibG9iL21hc3Rlci9kb2MvcGhldC1zb2Z0d2FyZS1kZXNpZ24tcGF0dGVybnMubWQjZW51bWVyYXRpb25cclxuICpcclxuICogVGhpcyBjcmVhdGVzIDItd2F5IG1hcHMgKGtleS10by12YWx1ZSBhbmQgdmFsdWUtdG8ta2V5KSBmb3IgZWFzZSBvZiB1c2UgYW5kIHRvIGVuYWJsZSBwaGV0LWlvIHNlcmlhbGl6YXRpb24uXHJcbiAqXHJcbiAqIGNsYXNzIFQgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICogICAgIHN0YXRpYyBhPW5ldyBUKCk7XHJcbiAqICAgICBzdGF0aWMgYiA9bmV3IFQoKTtcclxuICogICAgIGdldE5hbWUoKXtyZXR1cm4gJ2hlJzt9XHJcbiAqICAgICBnZXQgdGhpbmcoKXtyZXR1cm4gJ3RleHQnO31cclxuICogICAgIHN0YXRpYyBnZXQgYWdlKCl7cmV0dXJuIDc3O31cclxuICogICAgIHN0YXRpYyBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggVCApO1xyXG4gKiB9XHJcbiAqIFQuZW51bWVyYXRpb24ua2V5cyA9PiBbJ2EnLCAnYiddXHJcbiAqIFQuZW51bWVyYXRpb24udmFsdWVzID0+IFtULCBUXVxyXG4gKlxyXG4gKiBOb3RlIGhvdyBga2V5c2Agb25seSBwaWNrcyB1cCAnYScgYW5kICdiJy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcclxuaW1wb3J0IFRFbnVtZXJhdGlvbiBmcm9tICcuL1RFbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4vRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuL2luaGVyaXRhbmNlLmpzJztcclxuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4vdHlwZXMvQ29uc3RydWN0b3IuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4vb3B0aW9uaXplLmpzJztcclxuXHJcbmV4cG9ydCB0eXBlIEVudW1lcmF0aW9uT3B0aW9uczxUIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZT4gPSB7XHJcbiAgcGhldGlvRG9jdW1lbnRhdGlvbj86IHN0cmluZztcclxuICBpbnN0YW5jZVR5cGU/OiBDb25zdHJ1Y3RvcjxUPjtcclxufTtcclxuXHJcbmNsYXNzIEVudW1lcmF0aW9uPFQgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlPiBpbXBsZW1lbnRzIFRFbnVtZXJhdGlvbjxUPiB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlczogVFtdOyAvLyBpbiB0aGUgb3JkZXIgdGhhdCBzdGF0aWMgaW5zdGFuY2VzIGFyZSBkZWZpbmVkXHJcbiAgcHVibGljIHJlYWRvbmx5IGtleXM6IHN0cmluZ1tdO1xyXG4gIHB1YmxpYyByZWFkb25seSBFbnVtZXJhdGlvbjogQ29uc3RydWN0b3I8VD4gJiBSZWNvcmQ8c3RyaW5nLCBUPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgcGhldGlvRG9jdW1lbnRhdGlvbj86IHN0cmluZztcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBFbnVtZXJhdGlvbjogQ29uc3RydWN0b3I8VD4sIHByb3ZpZGVkT3B0aW9ucz86IEVudW1lcmF0aW9uT3B0aW9uczxUPiApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVudW1lcmF0aW9uT3B0aW9uczxUPj4oKSgge1xyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnJyxcclxuXHJcbiAgICAgIC8vIFZhbHVlcyBhcmUgcGx1Y2tlZCBmcm9tIHRoZSBzdXBwbGllZCBFbnVtZXJhdGlvbiwgYnV0IGluIG9yZGVyIHRvIHN1cHBvcnQgc3VidHlwaW5nIChhdWdtZW50aW5nKSBFbnVtZXJhdGlvbnMsXHJcbiAgICAgIC8vIHlvdSBjYW4gc3BlY2lmeSB0aGUgcnVsZSBmb3Igd2hhdCBjb3VudHMgYXMgYSBtZW1iZXIgb2YgdGhlIGVudW1lcmF0aW9uLiBUaGlzIHNob3VsZCBvbmx5IGJlIHVzZWQgaW4gdGhlXHJcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBvZiBhdWdtZW50aW5nIGV4aXN0aW5nIGVudW1lcmF0aW9ucy5cclxuICAgICAgaW5zdGFuY2VUeXBlOiBFbnVtZXJhdGlvblxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgICB0aGlzLnBoZXRpb0RvY3VtZW50YXRpb24gPSBvcHRpb25zLnBoZXRpb0RvY3VtZW50YXRpb247XHJcblxyXG4gICAgY29uc3QgaW5zdGFuY2VUeXBlID0gb3B0aW9ucy5pbnN0YW5jZVR5cGU7XHJcblxyXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSB0eXBlIGhpZXJhcmNoeSB0byBzdXBwb3J0IGF1Z21lbnRpbmcgZW51bWVyYXRpb25zLCBidXQgcmV2ZXJzZSBzbyB0aGF0IG5ld2x5IGFkZGVkIGVudW1lcmF0aW9uXHJcbiAgICAvLyB2YWx1ZXMgYXBwZWFyIGFmdGVyIHByZXZpb3VzbHkgZXhpc3RpbmcgZW51bWVyYXRpb24gdmFsdWVzXHJcbiAgICBjb25zdCB0eXBlcyA9IF8ucmV2ZXJzZSggaW5oZXJpdGFuY2UoIEVudW1lcmF0aW9uICkgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlcy5pbmNsdWRlcyggaW5zdGFuY2VUeXBlICksICd0aGUgc3BlY2lmaWVkIHR5cGUgc2hvdWxkIGJlIGluIGl0cyBvd24gaGllcmFyY2h5JyApO1xyXG5cclxuICAgIHRoaXMua2V5cyA9IFtdO1xyXG4gICAgdGhpcy52YWx1ZXMgPSBbXTtcclxuICAgIHR5cGVzLmZvckVhY2goIHR5cGUgPT4ge1xyXG4gICAgICBPYmplY3Qua2V5cyggdHlwZSApLmZvckVhY2goIGtleSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0eXBlWyBrZXkgXTtcclxuICAgICAgICBpZiAoIHZhbHVlIGluc3RhbmNlb2YgaW5zdGFuY2VUeXBlICkge1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5ID09PSBrZXkudG9VcHBlckNhc2UoKSwgJ2tleXMgc2hvdWxkIGJlIHVwcGVyIGNhc2UgYnkgY29udmVudGlvbicgKTtcclxuICAgICAgICAgIHRoaXMua2V5cy5wdXNoKCBrZXkgKTtcclxuICAgICAgICAgIHRoaXMudmFsdWVzLnB1c2goIHZhbHVlICk7XHJcblxyXG4gICAgICAgICAgLy8gT25seSBhc3NpZ24gdGhpcyB0byB0aGUgbG93ZXN0IEVudW1lcmF0aW9uIGluIHRoZSBoaWVyYXJjaHkuIE90aGVyd2lzZSB0aGlzIHdvdWxkIG92ZXJ3cml0ZSB0aGVcclxuICAgICAgICAgIC8vIHN1cGVydHlwZS1hc3NpZ25lZCBFbnVtZXJhdGlvbi4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzEwMlxyXG4gICAgICAgICAgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIEVudW1lcmF0aW9uICkge1xyXG4gICAgICAgICAgICB2YWx1ZS5uYW1lID0ga2V5O1xyXG4gICAgICAgICAgICB2YWx1ZS5lbnVtZXJhdGlvbiA9IHRoaXM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5rZXlzLmxlbmd0aCA+IDAsICdubyBrZXlzIGZvdW5kJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy52YWx1ZXMubGVuZ3RoID4gMCwgJ25vIHZhbHVlcyBmb3VuZCcgKTtcclxuXHJcbiAgICB0aGlzLkVudW1lcmF0aW9uID0gRW51bWVyYXRpb24gYXMgQ29uc3RydWN0b3I8VD4gJiBSZWNvcmQ8c3RyaW5nLCBUPjtcclxuICAgIEVudW1lcmF0aW9uVmFsdWUuc2VhbGVkQ2FjaGUuYWRkKCBFbnVtZXJhdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEtleSggdmFsdWU6IFQgKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB2YWx1ZS5uYW1lO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFZhbHVlKCBrZXk6IHN0cmluZyApOiBUIHtcclxuICAgIHJldHVybiB0aGlzLkVudW1lcmF0aW9uWyBrZXkgXTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpbmNsdWRlcyggdmFsdWU6IFQgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy52YWx1ZXMuaW5jbHVkZXMoIHZhbHVlICk7XHJcbiAgfVxyXG59XHJcblxyXG5waGV0Q29yZS5yZWdpc3RlciggJ0VudW1lcmF0aW9uJywgRW51bWVyYXRpb24gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVudW1lcmF0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxlQUFlO0FBRXBDLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUNwRCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBRTFDLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFPdEMsTUFBTUMsV0FBVyxDQUF3RDtFQUMxQzs7RUFLdEJDLFdBQVdBLENBQUVELFdBQTJCLEVBQUVFLGVBQXVDLEVBQUc7SUFFekYsTUFBTUMsT0FBTyxHQUFHSixTQUFTLENBQXdCLENBQUMsQ0FBRTtNQUNsREssbUJBQW1CLEVBQUUsRUFBRTtNQUV2QjtNQUNBO01BQ0E7TUFDQUMsWUFBWSxFQUFFTDtJQUNoQixDQUFDLEVBQUVFLGVBQWdCLENBQUM7SUFDcEIsSUFBSSxDQUFDRSxtQkFBbUIsR0FBR0QsT0FBTyxDQUFDQyxtQkFBbUI7SUFFdEQsTUFBTUMsWUFBWSxHQUFHRixPQUFPLENBQUNFLFlBQVk7O0lBRXpDO0lBQ0E7SUFDQSxNQUFNQyxLQUFLLEdBQUdDLENBQUMsQ0FBQ0MsT0FBTyxDQUFFVixXQUFXLENBQUVFLFdBQVksQ0FBRSxDQUFDO0lBRXJEUyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsS0FBSyxDQUFDSSxRQUFRLENBQUVMLFlBQWEsQ0FBQyxFQUFFLG1EQUFvRCxDQUFDO0lBRXZHLElBQUksQ0FBQ00sSUFBSSxHQUFHLEVBQUU7SUFDZCxJQUFJLENBQUNDLE1BQU0sR0FBRyxFQUFFO0lBQ2hCTixLQUFLLENBQUNPLE9BQU8sQ0FBRUMsSUFBSSxJQUFJO01BQ3JCQyxNQUFNLENBQUNKLElBQUksQ0FBRUcsSUFBSyxDQUFDLENBQUNELE9BQU8sQ0FBRUcsR0FBRyxJQUFJO1FBQ2xDLE1BQU1DLEtBQUssR0FBR0gsSUFBSSxDQUFFRSxHQUFHLENBQUU7UUFDekIsSUFBS0MsS0FBSyxZQUFZWixZQUFZLEVBQUc7VUFDbkNJLE1BQU0sSUFBSUEsTUFBTSxDQUFFTyxHQUFHLEtBQUtBLEdBQUcsQ0FBQ0UsV0FBVyxDQUFDLENBQUMsRUFBRSx5Q0FBMEMsQ0FBQztVQUN4RixJQUFJLENBQUNQLElBQUksQ0FBQ1EsSUFBSSxDQUFFSCxHQUFJLENBQUM7VUFDckIsSUFBSSxDQUFDSixNQUFNLENBQUNPLElBQUksQ0FBRUYsS0FBTSxDQUFDOztVQUV6QjtVQUNBO1VBQ0EsSUFBS0EsS0FBSyxZQUFZakIsV0FBVyxFQUFHO1lBQ2xDaUIsS0FBSyxDQUFDRyxJQUFJLEdBQUdKLEdBQUc7WUFDaEJDLEtBQUssQ0FBQ0ksV0FBVyxHQUFHLElBQUk7VUFDMUI7UUFDRjtNQUNGLENBQUUsQ0FBQztJQUNMLENBQUUsQ0FBQztJQUVIWixNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNFLElBQUksQ0FBQ1csTUFBTSxHQUFHLENBQUMsRUFBRSxlQUFnQixDQUFDO0lBQ3pEYixNQUFNLElBQUlBLE1BQU0sQ0FBRSxJQUFJLENBQUNHLE1BQU0sQ0FBQ1UsTUFBTSxHQUFHLENBQUMsRUFBRSxpQkFBa0IsQ0FBQztJQUU3RCxJQUFJLENBQUN0QixXQUFXLEdBQUdBLFdBQWlEO0lBQ3BFSCxnQkFBZ0IsQ0FBQzBCLFdBQVcsQ0FBQ0MsR0FBRyxDQUFFeEIsV0FBWSxDQUFDO0VBQ2pEO0VBRU95QixNQUFNQSxDQUFFUixLQUFRLEVBQVc7SUFDaEMsT0FBT0EsS0FBSyxDQUFDRyxJQUFJO0VBQ25CO0VBRU9NLFFBQVFBLENBQUVWLEdBQVcsRUFBTTtJQUNoQyxPQUFPLElBQUksQ0FBQ2hCLFdBQVcsQ0FBRWdCLEdBQUcsQ0FBRTtFQUNoQztFQUVPTixRQUFRQSxDQUFFTyxLQUFRLEVBQVk7SUFDbkMsT0FBTyxJQUFJLENBQUNMLE1BQU0sQ0FBQ0YsUUFBUSxDQUFFTyxLQUFNLENBQUM7RUFDdEM7QUFDRjtBQUVBckIsUUFBUSxDQUFDK0IsUUFBUSxDQUFFLGFBQWEsRUFBRTNCLFdBQVksQ0FBQztBQUUvQyxlQUFlQSxXQUFXIn0=