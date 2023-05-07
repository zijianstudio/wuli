// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model of a race car in the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import DoubleNumberLine from '../../common/model/DoubleNumberLine.js';
import Marker from '../../common/model/Marker.js';
import MarkerEditor from '../../common/model/MarkerEditor.js';
import Rate from '../../common/model/Rate.js';
import URQueryParameters from '../../common/URQueryParameters.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import RaceTrack from './RaceTrack.js';
export default class RaceCar {
  /**
   * @param {HTMLImageElement} image
   * @param {Object} [options]
   */
  constructor(image, options) {
    options = merge({
      color: 'black',
      // {Color|string} color used for things that are associated with the car (markers, spinners, ...)
      rate: new Rate(50, 2),
      // {Rate} initial rate, in miles per hour
      visible: true,
      // {boolean} is this car visible?
      trackLength: 200,
      // {number} length of this car's track
      numeratorMaxDecimals: 1,
      // {number} decimal places shown for numerator (miles)
      denominatorMaxDecimals: 2,
      // {number} decimal places shown for denominator (hours)
      majorMarkerSpacing: 25 // {number} spacing for major markers on this car's double number line
    }, options);

    // @public (read-only)
    this.image = image;
    this.color = options.color;
    this.rate = options.rate;

    // @public the car's distance from the starting line, in miles
    this.distanceProperty = new NumberProperty(0);

    // @public time for this car, in hours
    this.timeProperty = new NumberProperty(0);

    // @public is this car visible?
    this.visibleProperty = new BooleanProperty(options.visible);

    // @public
    this.track = new RaceTrack({
      length: options.trackLength
    });

    // Specifies the interval for major markers
    const isMajorMarker = (numerator, denominator) => {
      return numerator % options.majorMarkerSpacing === 0;
    };

    // @public
    this.doubleNumberLine = new DoubleNumberLine(this.rate.unitRateProperty, {
      numeratorOptions: {
        axisLabel: UnitRatesStrings.miles,
        maxDigits: 5,
        maxDecimals: options.numeratorMaxDecimals,
        trimZeros: true
      },
      denominatorOptions: {
        axisLabel: UnitRatesStrings.hours,
        maxDigits: 4,
        maxDecimals: options.denominatorMaxDecimals,
        trimZeros: true
      },
      // Numerator axis is fixed at 200 miles, so we will mutate the denominator (hours) when rate changes
      fixedAxis: 'numerator',
      fixedAxisRange: new Range(0, 200),
      // Specifies the interval for major markers
      isMajorMarker: isMajorMarker
    });

    // @public
    this.markerEditor = new MarkerEditor(this.rate.unitRateProperty, {
      numeratorMaxDecimals: options.numeratorMaxDecimals,
      denominatorMaxDecimals: options.denominatorMaxDecimals
    });

    // create a marker when the car reaches the finish line. unlink not needed
    let persistentMarker = null;
    this.distanceProperty.link(distance => {
      // make the current persistent marker erasable
      if (persistentMarker) {
        persistentMarker.erasable = true;
        persistentMarker = null;
      }

      // create a marker that is not erasable
      if (distance === this.track.lengthProperty.value) {
        persistentMarker = new Marker(distance, this.timeProperty.value, 'race', {
          isMajor: isMajorMarker(distance, this.timeProperty.value),
          color: this.color,
          erasable: false
        });
        this.doubleNumberLine.addMarker(persistentMarker);
      }
    });
  }

  // @public
  reset() {
    this.rate.reset();
    this.distanceProperty.reset();
    this.visibleProperty.reset();
    this.timeProperty.reset();
    this.track.reset();
    this.doubleNumberLine.reset();
    this.markerEditor.reset();
  }

  // @public moves the car to the starting line and resets the time
  resetRace() {
    this.distanceProperty.reset();
    this.timeProperty.reset();
  }

  /**
   * Is the car at the finish line?
   * @returns {boolean}
   * @public
   */
  isAtFinish() {
    return this.distanceProperty.value === this.track.lengthProperty.value;
  }

  /**
   * Updates the car and timer.
   * @param {number} dt - elapsed time since previous call to step, in seconds
   * @public
   */
  step(dt) {
    if (this.visibleProperty.value && this.distanceProperty.value < this.track.lengthProperty.value) {
      // Map from sim time (seconds) to race time (hours).
      // see https://github.com/phetsims/unit-rates/issues/95
      const deltaRaceTime = Utils.linear(0, 1, 0, URQueryParameters.raceTimeScale, dt);

      // distance traveled, in miles
      const deltaDistance = deltaRaceTime * this.rate.unitRateProperty.value;
      if (this.distanceProperty.value + deltaDistance >= this.track.lengthProperty.value) {
        // car has reached the finish line
        this.timeProperty.value = this.track.lengthProperty.value / this.rate.unitRateProperty.value;
        this.distanceProperty.value = this.track.lengthProperty.value;
      } else {
        // move incrementally
        this.timeProperty.value = this.timeProperty.value + deltaRaceTime;
        this.distanceProperty.value = this.distanceProperty.value + deltaDistance;
      }
    }
  }
}
unitRates.register('RaceCar', RaceCar);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJtZXJnZSIsIkRvdWJsZU51bWJlckxpbmUiLCJNYXJrZXIiLCJNYXJrZXJFZGl0b3IiLCJSYXRlIiwiVVJRdWVyeVBhcmFtZXRlcnMiLCJ1bml0UmF0ZXMiLCJVbml0UmF0ZXNTdHJpbmdzIiwiUmFjZVRyYWNrIiwiUmFjZUNhciIsImNvbnN0cnVjdG9yIiwiaW1hZ2UiLCJvcHRpb25zIiwiY29sb3IiLCJyYXRlIiwidmlzaWJsZSIsInRyYWNrTGVuZ3RoIiwibnVtZXJhdG9yTWF4RGVjaW1hbHMiLCJkZW5vbWluYXRvck1heERlY2ltYWxzIiwibWFqb3JNYXJrZXJTcGFjaW5nIiwiZGlzdGFuY2VQcm9wZXJ0eSIsInRpbWVQcm9wZXJ0eSIsInZpc2libGVQcm9wZXJ0eSIsInRyYWNrIiwibGVuZ3RoIiwiaXNNYWpvck1hcmtlciIsIm51bWVyYXRvciIsImRlbm9taW5hdG9yIiwiZG91YmxlTnVtYmVyTGluZSIsInVuaXRSYXRlUHJvcGVydHkiLCJudW1lcmF0b3JPcHRpb25zIiwiYXhpc0xhYmVsIiwibWlsZXMiLCJtYXhEaWdpdHMiLCJtYXhEZWNpbWFscyIsInRyaW1aZXJvcyIsImRlbm9taW5hdG9yT3B0aW9ucyIsImhvdXJzIiwiZml4ZWRBeGlzIiwiZml4ZWRBeGlzUmFuZ2UiLCJtYXJrZXJFZGl0b3IiLCJwZXJzaXN0ZW50TWFya2VyIiwibGluayIsImRpc3RhbmNlIiwiZXJhc2FibGUiLCJsZW5ndGhQcm9wZXJ0eSIsInZhbHVlIiwiaXNNYWpvciIsImFkZE1hcmtlciIsInJlc2V0IiwicmVzZXRSYWNlIiwiaXNBdEZpbmlzaCIsInN0ZXAiLCJkdCIsImRlbHRhUmFjZVRpbWUiLCJsaW5lYXIiLCJyYWNlVGltZVNjYWxlIiwiZGVsdGFEaXN0YW5jZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmFjZUNhci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBvZiBhIHJhY2UgY2FyIGluIHRoZSAnUmFjaW5nIExhYicgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBEb3VibGVOdW1iZXJMaW5lIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Eb3VibGVOdW1iZXJMaW5lLmpzJztcclxuaW1wb3J0IE1hcmtlciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTWFya2VyLmpzJztcclxuaW1wb3J0IE1hcmtlckVkaXRvciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTWFya2VyRWRpdG9yLmpzJztcclxuaW1wb3J0IFJhdGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1JhdGUuanMnO1xyXG5pbXBvcnQgVVJRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL1VSUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IHVuaXRSYXRlcyBmcm9tICcuLi8uLi91bml0UmF0ZXMuanMnO1xyXG5pbXBvcnQgVW5pdFJhdGVzU3RyaW5ncyBmcm9tICcuLi8uLi9Vbml0UmF0ZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IFJhY2VUcmFjayBmcm9tICcuL1JhY2VUcmFjay5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSYWNlQ2FyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtIVE1MSW1hZ2VFbGVtZW50fSBpbWFnZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW1hZ2UsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGNvbG9yOiAnYmxhY2snLCAvLyB7Q29sb3J8c3RyaW5nfSBjb2xvciB1c2VkIGZvciB0aGluZ3MgdGhhdCBhcmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYXIgKG1hcmtlcnMsIHNwaW5uZXJzLCAuLi4pXHJcbiAgICAgIHJhdGU6IG5ldyBSYXRlKCA1MCwgMiApLCAvLyB7UmF0ZX0gaW5pdGlhbCByYXRlLCBpbiBtaWxlcyBwZXIgaG91clxyXG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyB7Ym9vbGVhbn0gaXMgdGhpcyBjYXIgdmlzaWJsZT9cclxuICAgICAgdHJhY2tMZW5ndGg6IDIwMCwgLy8ge251bWJlcn0gbGVuZ3RoIG9mIHRoaXMgY2FyJ3MgdHJhY2tcclxuICAgICAgbnVtZXJhdG9yTWF4RGVjaW1hbHM6IDEsIC8vIHtudW1iZXJ9IGRlY2ltYWwgcGxhY2VzIHNob3duIGZvciBudW1lcmF0b3IgKG1pbGVzKVxyXG4gICAgICBkZW5vbWluYXRvck1heERlY2ltYWxzOiAyLCAvLyB7bnVtYmVyfSBkZWNpbWFsIHBsYWNlcyBzaG93biBmb3IgZGVub21pbmF0b3IgKGhvdXJzKVxyXG4gICAgICBtYWpvck1hcmtlclNwYWNpbmc6IDI1IC8vIHtudW1iZXJ9IHNwYWNpbmcgZm9yIG1ham9yIG1hcmtlcnMgb24gdGhpcyBjYXIncyBkb3VibGUgbnVtYmVyIGxpbmVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLmltYWdlID0gaW1hZ2U7XHJcbiAgICB0aGlzLmNvbG9yID0gb3B0aW9ucy5jb2xvcjtcclxuICAgIHRoaXMucmF0ZSA9IG9wdGlvbnMucmF0ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHRoZSBjYXIncyBkaXN0YW5jZSBmcm9tIHRoZSBzdGFydGluZyBsaW5lLCBpbiBtaWxlc1xyXG4gICAgdGhpcy5kaXN0YW5jZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB0aW1lIGZvciB0aGlzIGNhciwgaW4gaG91cnNcclxuICAgIHRoaXMudGltZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBpcyB0aGlzIGNhciB2aXNpYmxlP1xyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBvcHRpb25zLnZpc2libGUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnRyYWNrID0gbmV3IFJhY2VUcmFjayggeyBsZW5ndGg6IG9wdGlvbnMudHJhY2tMZW5ndGggfSApO1xyXG5cclxuICAgIC8vIFNwZWNpZmllcyB0aGUgaW50ZXJ2YWwgZm9yIG1ham9yIG1hcmtlcnNcclxuICAgIGNvbnN0IGlzTWFqb3JNYXJrZXIgPSAoIG51bWVyYXRvciwgZGVub21pbmF0b3IgKSA9PiB7XHJcbiAgICAgIHJldHVybiAoIG51bWVyYXRvciAlIG9wdGlvbnMubWFqb3JNYXJrZXJTcGFjaW5nID09PSAwICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuZG91YmxlTnVtYmVyTGluZSA9IG5ldyBEb3VibGVOdW1iZXJMaW5lKCB0aGlzLnJhdGUudW5pdFJhdGVQcm9wZXJ0eSwge1xyXG4gICAgICBudW1lcmF0b3JPcHRpb25zOiB7XHJcbiAgICAgICAgYXhpc0xhYmVsOiBVbml0UmF0ZXNTdHJpbmdzLm1pbGVzLFxyXG4gICAgICAgIG1heERpZ2l0czogNSxcclxuICAgICAgICBtYXhEZWNpbWFsczogb3B0aW9ucy5udW1lcmF0b3JNYXhEZWNpbWFscyxcclxuICAgICAgICB0cmltWmVyb3M6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgZGVub21pbmF0b3JPcHRpb25zOiB7XHJcbiAgICAgICAgYXhpc0xhYmVsOiBVbml0UmF0ZXNTdHJpbmdzLmhvdXJzLFxyXG4gICAgICAgIG1heERpZ2l0czogNCxcclxuICAgICAgICBtYXhEZWNpbWFsczogb3B0aW9ucy5kZW5vbWluYXRvck1heERlY2ltYWxzLFxyXG4gICAgICAgIHRyaW1aZXJvczogdHJ1ZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gTnVtZXJhdG9yIGF4aXMgaXMgZml4ZWQgYXQgMjAwIG1pbGVzLCBzbyB3ZSB3aWxsIG11dGF0ZSB0aGUgZGVub21pbmF0b3IgKGhvdXJzKSB3aGVuIHJhdGUgY2hhbmdlc1xyXG4gICAgICBmaXhlZEF4aXM6ICdudW1lcmF0b3InLFxyXG4gICAgICBmaXhlZEF4aXNSYW5nZTogbmV3IFJhbmdlKCAwLCAyMDAgKSxcclxuXHJcbiAgICAgIC8vIFNwZWNpZmllcyB0aGUgaW50ZXJ2YWwgZm9yIG1ham9yIG1hcmtlcnNcclxuICAgICAgaXNNYWpvck1hcmtlcjogaXNNYWpvck1hcmtlclxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMubWFya2VyRWRpdG9yID0gbmV3IE1hcmtlckVkaXRvciggdGhpcy5yYXRlLnVuaXRSYXRlUHJvcGVydHksIHtcclxuICAgICAgbnVtZXJhdG9yTWF4RGVjaW1hbHM6IG9wdGlvbnMubnVtZXJhdG9yTWF4RGVjaW1hbHMsXHJcbiAgICAgIGRlbm9taW5hdG9yTWF4RGVjaW1hbHM6IG9wdGlvbnMuZGVub21pbmF0b3JNYXhEZWNpbWFsc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIG1hcmtlciB3aGVuIHRoZSBjYXIgcmVhY2hlcyB0aGUgZmluaXNoIGxpbmUuIHVubGluayBub3QgbmVlZGVkXHJcbiAgICBsZXQgcGVyc2lzdGVudE1hcmtlciA9IG51bGw7XHJcbiAgICB0aGlzLmRpc3RhbmNlUHJvcGVydHkubGluayggZGlzdGFuY2UgPT4ge1xyXG5cclxuICAgICAgLy8gbWFrZSB0aGUgY3VycmVudCBwZXJzaXN0ZW50IG1hcmtlciBlcmFzYWJsZVxyXG4gICAgICBpZiAoIHBlcnNpc3RlbnRNYXJrZXIgKSB7XHJcbiAgICAgICAgcGVyc2lzdGVudE1hcmtlci5lcmFzYWJsZSA9IHRydWU7XHJcbiAgICAgICAgcGVyc2lzdGVudE1hcmtlciA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGNyZWF0ZSBhIG1hcmtlciB0aGF0IGlzIG5vdCBlcmFzYWJsZVxyXG4gICAgICBpZiAoIGRpc3RhbmNlID09PSB0aGlzLnRyYWNrLmxlbmd0aFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHBlcnNpc3RlbnRNYXJrZXIgPSBuZXcgTWFya2VyKCBkaXN0YW5jZSwgdGhpcy50aW1lUHJvcGVydHkudmFsdWUsICdyYWNlJywge1xyXG4gICAgICAgICAgaXNNYWpvcjogaXNNYWpvck1hcmtlciggZGlzdGFuY2UsIHRoaXMudGltZVByb3BlcnR5LnZhbHVlICksXHJcbiAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvcixcclxuICAgICAgICAgIGVyYXNhYmxlOiBmYWxzZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLmRvdWJsZU51bWJlckxpbmUuYWRkTWFya2VyKCBwZXJzaXN0ZW50TWFya2VyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZXNldCgpIHtcclxuICAgIHRoaXMucmF0ZS5yZXNldCgpO1xyXG4gICAgdGhpcy5kaXN0YW5jZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50aW1lUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudHJhY2sucmVzZXQoKTtcclxuICAgIHRoaXMuZG91YmxlTnVtYmVyTGluZS5yZXNldCgpO1xyXG4gICAgdGhpcy5tYXJrZXJFZGl0b3IucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgbW92ZXMgdGhlIGNhciB0byB0aGUgc3RhcnRpbmcgbGluZSBhbmQgcmVzZXRzIHRoZSB0aW1lXHJcbiAgcmVzZXRSYWNlKCkge1xyXG4gICAgdGhpcy5kaXN0YW5jZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhlIGNhciBhdCB0aGUgZmluaXNoIGxpbmU/XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzQXRGaW5pc2goKSB7XHJcbiAgICByZXR1cm4gKCB0aGlzLmRpc3RhbmNlUHJvcGVydHkudmFsdWUgPT09IHRoaXMudHJhY2subGVuZ3RoUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGNhciBhbmQgdGltZXIuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gZWxhcHNlZCB0aW1lIHNpbmNlIHByZXZpb3VzIGNhbGwgdG8gc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGlmICggdGhpcy52aXNpYmxlUHJvcGVydHkudmFsdWUgJiYgKCB0aGlzLmRpc3RhbmNlUHJvcGVydHkudmFsdWUgPCB0aGlzLnRyYWNrLmxlbmd0aFByb3BlcnR5LnZhbHVlICkgKSB7XHJcblxyXG4gICAgICAvLyBNYXAgZnJvbSBzaW0gdGltZSAoc2Vjb25kcykgdG8gcmFjZSB0aW1lIChob3VycykuXHJcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdW5pdC1yYXRlcy9pc3N1ZXMvOTVcclxuICAgICAgY29uc3QgZGVsdGFSYWNlVGltZSA9IFV0aWxzLmxpbmVhciggMCwgMSwgMCwgVVJRdWVyeVBhcmFtZXRlcnMucmFjZVRpbWVTY2FsZSwgZHQgKTtcclxuXHJcbiAgICAgIC8vIGRpc3RhbmNlIHRyYXZlbGVkLCBpbiBtaWxlc1xyXG4gICAgICBjb25zdCBkZWx0YURpc3RhbmNlID0gZGVsdGFSYWNlVGltZSAqIHRoaXMucmF0ZS51bml0UmF0ZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmRpc3RhbmNlUHJvcGVydHkudmFsdWUgKyBkZWx0YURpc3RhbmNlID49IHRoaXMudHJhY2subGVuZ3RoUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgIC8vIGNhciBoYXMgcmVhY2hlZCB0aGUgZmluaXNoIGxpbmVcclxuICAgICAgICB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMudHJhY2subGVuZ3RoUHJvcGVydHkudmFsdWUgLyB0aGlzLnJhdGUudW5pdFJhdGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlUHJvcGVydHkudmFsdWUgPSB0aGlzLnRyYWNrLmxlbmd0aFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBtb3ZlIGluY3JlbWVudGFsbHlcclxuICAgICAgICB0aGlzLnRpbWVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMudGltZVByb3BlcnR5LnZhbHVlICsgZGVsdGFSYWNlVGltZTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlUHJvcGVydHkudmFsdWUgPSB0aGlzLmRpc3RhbmNlUHJvcGVydHkudmFsdWUgKyBkZWx0YURpc3RhbmNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdSYWNlQ2FyJywgUmFj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