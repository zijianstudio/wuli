// Copyright 2014-2022, University of Colorado Boulder

/**
 * This type makes the radii of all objects much larger than the true physical values to make them visible on
 * the same scale. Configuration file for setting up the model scene parameters. This is typically done by
 * multiplying the real values by the desired scales. SunEarth and SunEarthMoon should be as similar as possible
 * (aside from the addition of the moon).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import SceneFactory from '../common/SceneFactory.js';
import gravityAndOrbits from '../gravityAndOrbits.js';

// constants
const SUN_RADIUS_MULTIPLIER = 50; // sun radius multiplier for SunEarthMode and SunEarthMoonMode, tuned by hand
const EARTH_MOON_RADIUS_MULTIPLIER = 800; // earth and moon radius multiplier for SunEarthMode and SunEarthMoonMode, tuned by hand

/**
 * Convenience function that converts days to seconds, using days * hoursPerDay * minutesPerHour * secondsPerMinute
 */
const daysToSeconds = days => days * 24 * 60 * 60;
class ModelSceneFactory extends SceneFactory {
  constructor(model, modelTandem, viewTandem) {
    super(model, new SunEarthModeConfig(), new SunEarthMoonModeConfig(), new PlanetMoonModeConfig(), new EarthSpaceStationModeConfig(), modelTandem, viewTandem, {
      adjustMoonPathLength: true,
      // adjust the moon path length in model
      adjustMoonOrbit: true
    });
  }
}
gravityAndOrbits.register('ModelSceneFactory', ModelSceneFactory);

/**
 * Model configuration for a system with the sun and the earth.
 */
class SunEarthModeConfig extends SceneFactory.SunEarthModeConfig {
  constructor() {
    super();
    this.sun.radius *= SUN_RADIUS_MULTIPLIER;
    this.planet.radius *= EARTH_MOON_RADIUS_MULTIPLIER;

    // Sun shouldn't move in model modes
    this.sun.isMovable = false;
    this.forceScale *= 0.58; // Tuned so the default force arrow takes 1/2 grid cell
  }
}

gravityAndOrbits.register('SunEarthModeConfig', SunEarthModeConfig);

/**
 * Model configuration for a system with the sun, earth and moon.
 */
class SunEarthMoonModeConfig extends SceneFactory.SunEarthMoonModeConfig {
  constructor() {
    super();
    this.sun.radius *= SUN_RADIUS_MULTIPLIER;
    this.planet.radius *= EARTH_MOON_RADIUS_MULTIPLIER;
    this.moon.radius *= EARTH_MOON_RADIUS_MULTIPLIER;
    this.moon.vx *= 21;
    this.moon.y = this.planet.radius * 1.7;

    // Sun shouldn't move in model modes
    this.sun.isMovable = false;
    this.forceScale *= 0.58; // Tuned so the default force arrow takes 1/2 grid cell
  }
}

gravityAndOrbits.register('SunEarthMoonModeConfig', SunEarthMoonModeConfig);
class PlanetMoonModeConfig extends SceneFactory.PlanetMoonModeConfig {
  constructor() {
    super({
      moonRotationPeriod: daysToSeconds(27.322)
    });
    const radiusMultiplier = 15; // tuned by hand
    this.planet.radius *= radiusMultiplier;
    this.moon.radius *= radiusMultiplier;

    // so that default gravity force takes up 1/2 cell in grid
    this.forceScale *= 0.79;
  }
}
gravityAndOrbits.register('PlanetMoonModeConfig', PlanetMoonModeConfig);

/**
 * Model configuration for a system with the earth and a space station.
 */
class EarthSpaceStationModeConfig extends SceneFactory.EarthSpaceStationModeConfig {
  constructor() {
    super();

    // tuned by hand
    this.planet.radius *= 0.8;
    this.satellite.radius *= 20000;
  }
}
gravityAndOrbits.register('EarthSpaceStationModeConfig', EarthSpaceStationModeConfig);
export default ModelSceneFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY2VuZUZhY3RvcnkiLCJncmF2aXR5QW5kT3JiaXRzIiwiU1VOX1JBRElVU19NVUxUSVBMSUVSIiwiRUFSVEhfTU9PTl9SQURJVVNfTVVMVElQTElFUiIsImRheXNUb1NlY29uZHMiLCJkYXlzIiwiTW9kZWxTY2VuZUZhY3RvcnkiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibW9kZWxUYW5kZW0iLCJ2aWV3VGFuZGVtIiwiU3VuRWFydGhNb2RlQ29uZmlnIiwiU3VuRWFydGhNb29uTW9kZUNvbmZpZyIsIlBsYW5ldE1vb25Nb2RlQ29uZmlnIiwiRWFydGhTcGFjZVN0YXRpb25Nb2RlQ29uZmlnIiwiYWRqdXN0TW9vblBhdGhMZW5ndGgiLCJhZGp1c3RNb29uT3JiaXQiLCJyZWdpc3RlciIsInN1biIsInJhZGl1cyIsInBsYW5ldCIsImlzTW92YWJsZSIsImZvcmNlU2NhbGUiLCJtb29uIiwidngiLCJ5IiwibW9vblJvdGF0aW9uUGVyaW9kIiwicmFkaXVzTXVsdGlwbGllciIsInNhdGVsbGl0ZSJdLCJzb3VyY2VzIjpbIk1vZGVsU2NlbmVGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgdHlwZSBtYWtlcyB0aGUgcmFkaWkgb2YgYWxsIG9iamVjdHMgbXVjaCBsYXJnZXIgdGhhbiB0aGUgdHJ1ZSBwaHlzaWNhbCB2YWx1ZXMgdG8gbWFrZSB0aGVtIHZpc2libGUgb25cclxuICogdGhlIHNhbWUgc2NhbGUuIENvbmZpZ3VyYXRpb24gZmlsZSBmb3Igc2V0dGluZyB1cCB0aGUgbW9kZWwgc2NlbmUgcGFyYW1ldGVycy4gVGhpcyBpcyB0eXBpY2FsbHkgZG9uZSBieVxyXG4gKiBtdWx0aXBseWluZyB0aGUgcmVhbCB2YWx1ZXMgYnkgdGhlIGRlc2lyZWQgc2NhbGVzLiBTdW5FYXJ0aCBhbmQgU3VuRWFydGhNb29uIHNob3VsZCBiZSBhcyBzaW1pbGFyIGFzIHBvc3NpYmxlXHJcbiAqIChhc2lkZSBmcm9tIHRoZSBhZGRpdGlvbiBvZiB0aGUgbW9vbikuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQWFyb24gRGF2aXMgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEdyYXZpdHlBbmRPcmJpdHNNb2RlbCBmcm9tICcuLi9jb21tb24vbW9kZWwvR3Jhdml0eUFuZE9yYml0c01vZGVsLmpzJztcclxuaW1wb3J0IFNjZW5lRmFjdG9yeSBmcm9tICcuLi9jb21tb24vU2NlbmVGYWN0b3J5LmpzJztcclxuaW1wb3J0IGdyYXZpdHlBbmRPcmJpdHMgZnJvbSAnLi4vZ3Jhdml0eUFuZE9yYml0cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU1VOX1JBRElVU19NVUxUSVBMSUVSID0gNTA7IC8vIHN1biByYWRpdXMgbXVsdGlwbGllciBmb3IgU3VuRWFydGhNb2RlIGFuZCBTdW5FYXJ0aE1vb25Nb2RlLCB0dW5lZCBieSBoYW5kXHJcbmNvbnN0IEVBUlRIX01PT05fUkFESVVTX01VTFRJUExJRVIgPSA4MDA7IC8vIGVhcnRoIGFuZCBtb29uIHJhZGl1cyBtdWx0aXBsaWVyIGZvciBTdW5FYXJ0aE1vZGUgYW5kIFN1bkVhcnRoTW9vbk1vZGUsIHR1bmVkIGJ5IGhhbmRcclxuXHJcbi8qKlxyXG4gKiBDb252ZW5pZW5jZSBmdW5jdGlvbiB0aGF0IGNvbnZlcnRzIGRheXMgdG8gc2Vjb25kcywgdXNpbmcgZGF5cyAqIGhvdXJzUGVyRGF5ICogbWludXRlc1BlckhvdXIgKiBzZWNvbmRzUGVyTWludXRlXHJcbiAqL1xyXG5jb25zdCBkYXlzVG9TZWNvbmRzID0gKCBkYXlzOiBudW1iZXIgKSA9PiBkYXlzICogMjQgKiA2MCAqIDYwO1xyXG5cclxuY2xhc3MgTW9kZWxTY2VuZUZhY3RvcnkgZXh0ZW5kcyBTY2VuZUZhY3Rvcnkge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBHcmF2aXR5QW5kT3JiaXRzTW9kZWwsIG1vZGVsVGFuZGVtOiBUYW5kZW0sIHZpZXdUYW5kZW06IFRhbmRlbSApIHtcclxuICAgIHN1cGVyKFxyXG4gICAgICBtb2RlbCxcclxuICAgICAgbmV3IFN1bkVhcnRoTW9kZUNvbmZpZygpLFxyXG4gICAgICBuZXcgU3VuRWFydGhNb29uTW9kZUNvbmZpZygpLFxyXG4gICAgICBuZXcgUGxhbmV0TW9vbk1vZGVDb25maWcoKSxcclxuICAgICAgbmV3IEVhcnRoU3BhY2VTdGF0aW9uTW9kZUNvbmZpZygpLFxyXG4gICAgICBtb2RlbFRhbmRlbSwgdmlld1RhbmRlbSwge1xyXG4gICAgICAgIGFkanVzdE1vb25QYXRoTGVuZ3RoOiB0cnVlLCAvLyBhZGp1c3QgdGhlIG1vb24gcGF0aCBsZW5ndGggaW4gbW9kZWxcclxuICAgICAgICBhZGp1c3RNb29uT3JiaXQ6IHRydWVcclxuICAgICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUFuZE9yYml0cy5yZWdpc3RlciggJ01vZGVsU2NlbmVGYWN0b3J5JywgTW9kZWxTY2VuZUZhY3RvcnkgKTtcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBjb25maWd1cmF0aW9uIGZvciBhIHN5c3RlbSB3aXRoIHRoZSBzdW4gYW5kIHRoZSBlYXJ0aC5cclxuICovXHJcbmNsYXNzIFN1bkVhcnRoTW9kZUNvbmZpZyBleHRlbmRzIFNjZW5lRmFjdG9yeS5TdW5FYXJ0aE1vZGVDb25maWcge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLnN1bi5yYWRpdXMgKj0gU1VOX1JBRElVU19NVUxUSVBMSUVSO1xyXG4gICAgdGhpcy5wbGFuZXQucmFkaXVzICo9IEVBUlRIX01PT05fUkFESVVTX01VTFRJUExJRVI7XHJcblxyXG4gICAgLy8gU3VuIHNob3VsZG4ndCBtb3ZlIGluIG1vZGVsIG1vZGVzXHJcbiAgICB0aGlzLnN1bi5pc01vdmFibGUgPSBmYWxzZTtcclxuICAgIHRoaXMuZm9yY2VTY2FsZSEgKj0gMC41ODsgLy8gVHVuZWQgc28gdGhlIGRlZmF1bHQgZm9yY2UgYXJyb3cgdGFrZXMgMS8yIGdyaWQgY2VsbFxyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUFuZE9yYml0cy5yZWdpc3RlciggJ1N1bkVhcnRoTW9kZUNvbmZpZycsIFN1bkVhcnRoTW9kZUNvbmZpZyApO1xyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGNvbmZpZ3VyYXRpb24gZm9yIGEgc3lzdGVtIHdpdGggdGhlIHN1biwgZWFydGggYW5kIG1vb24uXHJcbiAqL1xyXG5jbGFzcyBTdW5FYXJ0aE1vb25Nb2RlQ29uZmlnIGV4dGVuZHMgU2NlbmVGYWN0b3J5LlN1bkVhcnRoTW9vbk1vZGVDb25maWcge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLnN1bi5yYWRpdXMgKj0gU1VOX1JBRElVU19NVUxUSVBMSUVSO1xyXG4gICAgdGhpcy5wbGFuZXQucmFkaXVzICo9IEVBUlRIX01PT05fUkFESVVTX01VTFRJUExJRVI7XHJcbiAgICB0aGlzLm1vb24ucmFkaXVzICo9IEVBUlRIX01PT05fUkFESVVTX01VTFRJUExJRVI7XHJcblxyXG4gICAgdGhpcy5tb29uLnZ4ICo9IDIxO1xyXG4gICAgdGhpcy5tb29uLnkgPSB0aGlzLnBsYW5ldC5yYWRpdXMgKiAxLjc7XHJcblxyXG4gICAgLy8gU3VuIHNob3VsZG4ndCBtb3ZlIGluIG1vZGVsIG1vZGVzXHJcbiAgICB0aGlzLnN1bi5pc01vdmFibGUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmZvcmNlU2NhbGUhICo9IDAuNTg7IC8vIFR1bmVkIHNvIHRoZSBkZWZhdWx0IGZvcmNlIGFycm93IHRha2VzIDEvMiBncmlkIGNlbGxcclxuICB9XHJcbn1cclxuXHJcbmdyYXZpdHlBbmRPcmJpdHMucmVnaXN0ZXIoICdTdW5FYXJ0aE1vb25Nb2RlQ29uZmlnJywgU3VuRWFydGhNb29uTW9kZUNvbmZpZyApO1xyXG5cclxuY2xhc3MgUGxhbmV0TW9vbk1vZGVDb25maWcgZXh0ZW5kcyBTY2VuZUZhY3RvcnkuUGxhbmV0TW9vbk1vZGVDb25maWcge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBzdXBlciggeyBtb29uUm90YXRpb25QZXJpb2Q6IGRheXNUb1NlY29uZHMoIDI3LjMyMiApIH0gKTtcclxuXHJcbiAgICBjb25zdCByYWRpdXNNdWx0aXBsaWVyID0gMTU7IC8vIHR1bmVkIGJ5IGhhbmRcclxuICAgIHRoaXMucGxhbmV0LnJhZGl1cyAqPSByYWRpdXNNdWx0aXBsaWVyO1xyXG4gICAgdGhpcy5tb29uLnJhZGl1cyAqPSByYWRpdXNNdWx0aXBsaWVyO1xyXG5cclxuICAgIC8vIHNvIHRoYXQgZGVmYXVsdCBncmF2aXR5IGZvcmNlIHRha2VzIHVwIDEvMiBjZWxsIGluIGdyaWRcclxuICAgIHRoaXMuZm9yY2VTY2FsZSEgKj0gMC43OTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXZpdHlBbmRPcmJpdHMucmVnaXN0ZXIoICdQbGFuZXRNb29uTW9kZUNvbmZpZycsIFBsYW5ldE1vb25Nb2RlQ29uZmlnICk7XHJcblxyXG4vKipcclxuICogTW9kZWwgY29uZmlndXJhdGlvbiBmb3IgYSBzeXN0ZW0gd2l0aCB0aGUgZWFydGggYW5kIGEgc3BhY2Ugc3RhdGlvbi5cclxuICovXHJcbmNsYXNzIEVhcnRoU3BhY2VTdGF0aW9uTW9kZUNvbmZpZyBleHRlbmRzIFNjZW5lRmFjdG9yeS5FYXJ0aFNwYWNlU3RhdGlvbk1vZGVDb25maWcge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gdHVuZWQgYnkgaGFuZFxyXG4gICAgdGhpcy5wbGFuZXQucmFkaXVzICo9IDAuODtcclxuICAgIHRoaXMuc2F0ZWxsaXRlLnJhZGl1cyAqPSAyMDAwMDtcclxuICB9XHJcbn1cclxuXHJcbmdyYXZpdHlBbmRPcmJpdHMucmVnaXN0ZXIoICdFYXJ0aFNwYWNlU3RhdGlvbk1vZGVDb25maWcnLCBFYXJ0aFNwYWNlU3RhdGlvbk1vZGVDb25maWcgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsU2NlbmVGYWN0b3J5OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLFlBQVksTUFBTSwyQkFBMkI7QUFDcEQsT0FBT0MsZ0JBQWdCLE1BQU0sd0JBQXdCOztBQUVyRDtBQUNBLE1BQU1DLHFCQUFxQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLE1BQU1DLDRCQUE0QixHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUUxQztBQUNBO0FBQ0E7QUFDQSxNQUFNQyxhQUFhLEdBQUtDLElBQVksSUFBTUEsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUU3RCxNQUFNQyxpQkFBaUIsU0FBU04sWUFBWSxDQUFDO0VBRXBDTyxXQUFXQSxDQUFFQyxLQUE0QixFQUFFQyxXQUFtQixFQUFFQyxVQUFrQixFQUFHO0lBQzFGLEtBQUssQ0FDSEYsS0FBSyxFQUNMLElBQUlHLGtCQUFrQixDQUFDLENBQUMsRUFDeEIsSUFBSUMsc0JBQXNCLENBQUMsQ0FBQyxFQUM1QixJQUFJQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQzFCLElBQUlDLDJCQUEyQixDQUFDLENBQUMsRUFDakNMLFdBQVcsRUFBRUMsVUFBVSxFQUFFO01BQ3ZCSyxvQkFBb0IsRUFBRSxJQUFJO01BQUU7TUFDNUJDLGVBQWUsRUFBRTtJQUNuQixDQUFFLENBQUM7RUFDUDtBQUNGO0FBRUFmLGdCQUFnQixDQUFDZ0IsUUFBUSxDQUFFLG1CQUFtQixFQUFFWCxpQkFBa0IsQ0FBQzs7QUFFbkU7QUFDQTtBQUNB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