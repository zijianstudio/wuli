// Copyright 2022, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
import tandemNamespace from '../tandemNamespace.js';

// Cache each parameterized IOType so that it is only created once.
const cache = new Map();
const joinKeys = keys => keys.join('|');
const EnumerationIO = enumerationContainer => {
  const enumeration = enumerationContainer.enumeration;

  // This caching implementation should be kept in sync with the other parametric IO Type caching implementations.
  if (!cache.has(enumeration)) {
    // Enumeration supports additional documentation, so the values can be described.
    const additionalDocs = enumeration.phetioDocumentation ? ` ${enumeration.phetioDocumentation}` : '';
    const keys = enumeration.keys;
    const values = enumeration.values;
    const ioTypeName = `EnumerationIO(${joinKeys(keys)})`;
    assert && assert(!Array.from(cache.values()).find(ioType => ioType.typeName === ioTypeName), 'There was already another IO Type with the same name: ' + ioTypeName);
    cache.set(enumeration, new IOType(ioTypeName, {
      validValues: values,
      documentation: `Possible values: ${keys.join(', ')}.${additionalDocs}`,
      toStateObject: value => enumeration.getKey(value),
      fromStateObject: stateObject => {
        assert && assert(typeof stateObject === 'string', 'unsupported EnumerationIO value type, expected string'); // eslint-disable-line no-simple-type-checking-assertions
        assert && assert(keys.includes(stateObject), `Unrecognized value: ${stateObject}`);
        return enumeration.getValue(stateObject);
      },
      stateSchema: StateSchema.asValue(`${joinKeys(keys)}`, {
        isValidValue: key => keys.includes(key)
      })
    }));
  }
  return cache.get(enumeration);
};
tandemNamespace.register('EnumerationIO', EnumerationIO);
export default EnumerationIO;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJT1R5cGUiLCJTdGF0ZVNjaGVtYSIsInRhbmRlbU5hbWVzcGFjZSIsImNhY2hlIiwiTWFwIiwiam9pbktleXMiLCJrZXlzIiwiam9pbiIsIkVudW1lcmF0aW9uSU8iLCJlbnVtZXJhdGlvbkNvbnRhaW5lciIsImVudW1lcmF0aW9uIiwiaGFzIiwiYWRkaXRpb25hbERvY3MiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwidmFsdWVzIiwiaW9UeXBlTmFtZSIsImFzc2VydCIsIkFycmF5IiwiZnJvbSIsImZpbmQiLCJpb1R5cGUiLCJ0eXBlTmFtZSIsInNldCIsInZhbGlkVmFsdWVzIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJ2YWx1ZSIsImdldEtleSIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiaW5jbHVkZXMiLCJnZXRWYWx1ZSIsInN0YXRlU2NoZW1hIiwiYXNWYWx1ZSIsImlzVmFsaWRWYWx1ZSIsImtleSIsImdldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW51bWVyYXRpb25JTy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IFRFbnVtZXJhdGlvbiwgeyBFbnVtZXJhdGlvbkNvbnRhaW5lciB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9URW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vSU9UeXBlLmpzJztcclxuaW1wb3J0IFN0YXRlU2NoZW1hIGZyb20gJy4vU3RhdGVTY2hlbWEuanMnO1xyXG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4uL3RhbmRlbU5hbWVzcGFjZS5qcyc7XHJcblxyXG4vLyBDYWNoZSBlYWNoIHBhcmFtZXRlcml6ZWQgSU9UeXBlIHNvIHRoYXQgaXQgaXMgb25seSBjcmVhdGVkIG9uY2UuXHJcbmNvbnN0IGNhY2hlID0gbmV3IE1hcDxURW51bWVyYXRpb248RW51bWVyYXRpb25WYWx1ZT4sIElPVHlwZT4oKTtcclxuXHJcbmNvbnN0IGpvaW5LZXlzID0gKCBrZXlzOiBzdHJpbmdbXSApID0+IGtleXMuam9pbiggJ3wnICk7XHJcblxyXG5jb25zdCBFbnVtZXJhdGlvbklPID0gPFQgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlPiggZW51bWVyYXRpb25Db250YWluZXI6IEVudW1lcmF0aW9uQ29udGFpbmVyPFQ+ICk6IElPVHlwZSA9PiB7XHJcbiAgY29uc3QgZW51bWVyYXRpb24gPSBlbnVtZXJhdGlvbkNvbnRhaW5lci5lbnVtZXJhdGlvbjtcclxuXHJcbiAgLy8gVGhpcyBjYWNoaW5nIGltcGxlbWVudGF0aW9uIHNob3VsZCBiZSBrZXB0IGluIHN5bmMgd2l0aCB0aGUgb3RoZXIgcGFyYW1ldHJpYyBJTyBUeXBlIGNhY2hpbmcgaW1wbGVtZW50YXRpb25zLlxyXG4gIGlmICggIWNhY2hlLmhhcyggZW51bWVyYXRpb24gKSApIHtcclxuXHJcbiAgICAvLyBFbnVtZXJhdGlvbiBzdXBwb3J0cyBhZGRpdGlvbmFsIGRvY3VtZW50YXRpb24sIHNvIHRoZSB2YWx1ZXMgY2FuIGJlIGRlc2NyaWJlZC5cclxuICAgIGNvbnN0IGFkZGl0aW9uYWxEb2NzID0gZW51bWVyYXRpb24ucGhldGlvRG9jdW1lbnRhdGlvbiA/IGAgJHtlbnVtZXJhdGlvbi5waGV0aW9Eb2N1bWVudGF0aW9ufWAgOiAnJztcclxuXHJcbiAgICBjb25zdCBrZXlzID0gZW51bWVyYXRpb24ua2V5cztcclxuICAgIGNvbnN0IHZhbHVlcyA9IGVudW1lcmF0aW9uLnZhbHVlcztcclxuXHJcbiAgICBjb25zdCBpb1R5cGVOYW1lID0gYEVudW1lcmF0aW9uSU8oJHtqb2luS2V5cygga2V5cyApfSlgO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICFBcnJheS5mcm9tKCBjYWNoZS52YWx1ZXMoKSApLmZpbmQoIGlvVHlwZSA9PiBpb1R5cGUudHlwZU5hbWUgPT09IGlvVHlwZU5hbWUgKSxcclxuICAgICAgJ1RoZXJlIHdhcyBhbHJlYWR5IGFub3RoZXIgSU8gVHlwZSB3aXRoIHRoZSBzYW1lIG5hbWU6ICcgKyBpb1R5cGVOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIGNhY2hlLnNldCggZW51bWVyYXRpb24sIG5ldyBJT1R5cGU8VCwgc3RyaW5nPiggaW9UeXBlTmFtZSwge1xyXG4gICAgICB2YWxpZFZhbHVlczogdmFsdWVzLFxyXG4gICAgICBkb2N1bWVudGF0aW9uOiBgUG9zc2libGUgdmFsdWVzOiAke2tleXMuam9pbiggJywgJyApfS4ke2FkZGl0aW9uYWxEb2NzfWAsXHJcbiAgICAgIHRvU3RhdGVPYmplY3Q6ICggdmFsdWU6IFQgKSA9PiBlbnVtZXJhdGlvbi5nZXRLZXkoIHZhbHVlICksXHJcbiAgICAgIGZyb21TdGF0ZU9iamVjdDogKCBzdGF0ZU9iamVjdDogc3RyaW5nICk6IFQgPT4ge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBzdGF0ZU9iamVjdCA9PT0gJ3N0cmluZycsICd1bnN1cHBvcnRlZCBFbnVtZXJhdGlvbklPIHZhbHVlIHR5cGUsIGV4cGVjdGVkIHN0cmluZycgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5cy5pbmNsdWRlcyggc3RhdGVPYmplY3QgKSwgYFVucmVjb2duaXplZCB2YWx1ZTogJHtzdGF0ZU9iamVjdH1gICk7XHJcbiAgICAgICAgcmV0dXJuIGVudW1lcmF0aW9uLmdldFZhbHVlKCBzdGF0ZU9iamVjdCApITtcclxuICAgICAgfSxcclxuICAgICAgc3RhdGVTY2hlbWE6IFN0YXRlU2NoZW1hLmFzVmFsdWU8RW51bWVyYXRpb25WYWx1ZSwgc3RyaW5nPiggYCR7am9pbktleXMoIGtleXMgKX1gLCB7XHJcbiAgICAgICAgaXNWYWxpZFZhbHVlOiAoIGtleTogc3RyaW5nICkgPT4ga2V5cy5pbmNsdWRlcygga2V5IClcclxuICAgICAgfSApXHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBjYWNoZS5nZXQoIGVudW1lcmF0aW9uICkhO1xyXG59O1xyXG5cclxudGFuZGVtTmFtZXNwYWNlLnJlZ2lzdGVyKCAnRW51bWVyYXRpb25JTycsIEVudW1lcmF0aW9uSU8gKTtcclxuZXhwb3J0IGRlZmF1bHQgRW51bWVyYXRpb25JTzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLE1BQU0sTUFBTSxhQUFhO0FBQ2hDLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFDMUMsT0FBT0MsZUFBZSxNQUFNLHVCQUF1Qjs7QUFFbkQ7QUFDQSxNQUFNQyxLQUFLLEdBQUcsSUFBSUMsR0FBRyxDQUF5QyxDQUFDO0FBRS9ELE1BQU1DLFFBQVEsR0FBS0MsSUFBYyxJQUFNQSxJQUFJLENBQUNDLElBQUksQ0FBRSxHQUFJLENBQUM7QUFFdkQsTUFBTUMsYUFBYSxHQUFpQ0Msb0JBQTZDLElBQWM7RUFDN0csTUFBTUMsV0FBVyxHQUFHRCxvQkFBb0IsQ0FBQ0MsV0FBVzs7RUFFcEQ7RUFDQSxJQUFLLENBQUNQLEtBQUssQ0FBQ1EsR0FBRyxDQUFFRCxXQUFZLENBQUMsRUFBRztJQUUvQjtJQUNBLE1BQU1FLGNBQWMsR0FBR0YsV0FBVyxDQUFDRyxtQkFBbUIsR0FBSSxJQUFHSCxXQUFXLENBQUNHLG1CQUFvQixFQUFDLEdBQUcsRUFBRTtJQUVuRyxNQUFNUCxJQUFJLEdBQUdJLFdBQVcsQ0FBQ0osSUFBSTtJQUM3QixNQUFNUSxNQUFNLEdBQUdKLFdBQVcsQ0FBQ0ksTUFBTTtJQUVqQyxNQUFNQyxVQUFVLEdBQUksaUJBQWdCVixRQUFRLENBQUVDLElBQUssQ0FBRSxHQUFFO0lBRXZEVSxNQUFNLElBQUlBLE1BQU0sQ0FDZCxDQUFDQyxLQUFLLENBQUNDLElBQUksQ0FBRWYsS0FBSyxDQUFDVyxNQUFNLENBQUMsQ0FBRSxDQUFDLENBQUNLLElBQUksQ0FBRUMsTUFBTSxJQUFJQSxNQUFNLENBQUNDLFFBQVEsS0FBS04sVUFBVyxDQUFDLEVBQzlFLHdEQUF3RCxHQUFHQSxVQUM3RCxDQUFDO0lBRURaLEtBQUssQ0FBQ21CLEdBQUcsQ0FBRVosV0FBVyxFQUFFLElBQUlWLE1BQU0sQ0FBYWUsVUFBVSxFQUFFO01BQ3pEUSxXQUFXLEVBQUVULE1BQU07TUFDbkJVLGFBQWEsRUFBRyxvQkFBbUJsQixJQUFJLENBQUNDLElBQUksQ0FBRSxJQUFLLENBQUUsSUFBR0ssY0FBZSxFQUFDO01BQ3hFYSxhQUFhLEVBQUlDLEtBQVEsSUFBTWhCLFdBQVcsQ0FBQ2lCLE1BQU0sQ0FBRUQsS0FBTSxDQUFDO01BQzFERSxlQUFlLEVBQUlDLFdBQW1CLElBQVM7UUFDN0NiLE1BQU0sSUFBSUEsTUFBTSxDQUFFLE9BQU9hLFdBQVcsS0FBSyxRQUFRLEVBQUUsdURBQXdELENBQUMsQ0FBQyxDQUFDO1FBQzlHYixNQUFNLElBQUlBLE1BQU0sQ0FBRVYsSUFBSSxDQUFDd0IsUUFBUSxDQUFFRCxXQUFZLENBQUMsRUFBRyx1QkFBc0JBLFdBQVksRUFBRSxDQUFDO1FBQ3RGLE9BQU9uQixXQUFXLENBQUNxQixRQUFRLENBQUVGLFdBQVksQ0FBQztNQUM1QyxDQUFDO01BQ0RHLFdBQVcsRUFBRS9CLFdBQVcsQ0FBQ2dDLE9BQU8sQ0FBNkIsR0FBRTVCLFFBQVEsQ0FBRUMsSUFBSyxDQUFFLEVBQUMsRUFBRTtRQUNqRjRCLFlBQVksRUFBSUMsR0FBVyxJQUFNN0IsSUFBSSxDQUFDd0IsUUFBUSxDQUFFSyxHQUFJO01BQ3RELENBQUU7SUFDSixDQUFFLENBQUUsQ0FBQztFQUNQO0VBRUEsT0FBT2hDLEtBQUssQ0FBQ2lDLEdBQUcsQ0FBRTFCLFdBQVksQ0FBQztBQUNqQyxDQUFDO0FBRURSLGVBQWUsQ0FBQ21DLFFBQVEsQ0FBRSxlQUFlLEVBQUU3QixhQUFjLENBQUM7QUFDMUQsZUFBZUEsYUFBYSJ9