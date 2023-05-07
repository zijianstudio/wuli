// Copyright 2019-2022, University of Colorado Boulder

/**
 * Displayed when the fuse trips
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import Animation from '../../../twixt/js/Animation.js';
import Easing from '../../../twixt/js/Easing.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
export default class FuseTripAnimation extends Node {
  constructor(providedOptions) {
    super();

    // Geometry sampled by exporting circuit-construction-kit-common/assets/spark.ai to SVG then copying the
    // polylines data
    const polylines = ['29.2,11.5 34.3,1.9 34.7,12.8 50.7,1.8 38.7,16.9 49.6,17.6 39.8,22.5', '11.1,22.5 1.5,17.3 12.4,16.9 1.3,1 16.5,13 17.2,2.1 22.1,11.8', '22.8,40.5 17.7,50.1 17.3,39.2 1.3,50.2 13.3,35.1 2.4,34.4 12.2,29.5', '40.9,29.5 50.5,34.7 39.6,35.1 50.7,51 35.5,39 34.8,49.9 29.9,40.2'];
    const shape = new Shape();

    // Parse the string data and render each string as a set of connected line segments.
    polylines.forEach(polyline => {
      const pairs = polyline.split(' ');
      const vectors = pairs.map(pair => {
        const p = pair.split(',');
        return new Vector2(Number(p[0]), Number(p[1]));
      });
      shape.moveToPoint(vectors[0]);
      for (let i = 1; i < vectors.length; i++) {
        shape.lineToPoint(vectors[i]);
      }
    });
    const path = new Path(shape, {
      stroke: 'yellow',
      lineWidth: 2
    });
    providedOptions = providedOptions || {};
    providedOptions.children = [path];
    this.mutate(providedOptions);
    const animation = new Animation({
      setValue: value => {
        const center = this.center;
        const scale = Utils.linear(0, 1, 0.75, 2, value);
        const opacity = Utils.clamp(Utils.linear(0.8, 1, 1, 0, value), 0, 1);
        this.setScaleMagnitude(scale);
        this.setOpacity(opacity);
        this.center = center;
      },
      from: 0,
      to: 1,
      duration: 0.3,
      easing: Easing.QUADRATIC_IN_OUT
    });
    animation.endedEmitter.addListener(() => this.dispose());
    animation.start();
  }
}
circuitConstructionKitCommon.register('FuseTripAnimation', FuseTripAnimation);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIk5vZGUiLCJQYXRoIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkZ1c2VUcmlwQW5pbWF0aW9uIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJwb2x5bGluZXMiLCJzaGFwZSIsImZvckVhY2giLCJwb2x5bGluZSIsInBhaXJzIiwic3BsaXQiLCJ2ZWN0b3JzIiwibWFwIiwicGFpciIsInAiLCJOdW1iZXIiLCJtb3ZlVG9Qb2ludCIsImkiLCJsZW5ndGgiLCJsaW5lVG9Qb2ludCIsInBhdGgiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjaGlsZHJlbiIsIm11dGF0ZSIsImFuaW1hdGlvbiIsInNldFZhbHVlIiwidmFsdWUiLCJjZW50ZXIiLCJzY2FsZSIsImxpbmVhciIsIm9wYWNpdHkiLCJjbGFtcCIsInNldFNjYWxlTWFnbml0dWRlIiwic2V0T3BhY2l0eSIsImZyb20iLCJ0byIsImR1cmF0aW9uIiwiZWFzaW5nIiwiUVVBRFJBVElDX0lOX09VVCIsImVuZGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZSIsInN0YXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGdXNlVHJpcEFuaW1hdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5ZWQgd2hlbiB0aGUgZnVzZSB0cmlwc1xyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGdXNlVHJpcEFuaW1hdGlvbiBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IE5vZGVPcHRpb25zICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBHZW9tZXRyeSBzYW1wbGVkIGJ5IGV4cG9ydGluZyBjaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2Fzc2V0cy9zcGFyay5haSB0byBTVkcgdGhlbiBjb3B5aW5nIHRoZVxyXG4gICAgLy8gcG9seWxpbmVzIGRhdGFcclxuICAgIGNvbnN0IHBvbHlsaW5lcyA9IFtcclxuICAgICAgJzI5LjIsMTEuNSAzNC4zLDEuOSAzNC43LDEyLjggNTAuNywxLjggMzguNywxNi45IDQ5LjYsMTcuNiAzOS44LDIyLjUnLFxyXG4gICAgICAnMTEuMSwyMi41IDEuNSwxNy4zIDEyLjQsMTYuOSAxLjMsMSAxNi41LDEzIDE3LjIsMi4xIDIyLjEsMTEuOCcsXHJcbiAgICAgICcyMi44LDQwLjUgMTcuNyw1MC4xIDE3LjMsMzkuMiAxLjMsNTAuMiAxMy4zLDM1LjEgMi40LDM0LjQgMTIuMiwyOS41JyxcclxuICAgICAgJzQwLjksMjkuNSA1MC41LDM0LjcgMzkuNiwzNS4xIDUwLjcsNTEgMzUuNSwzOSAzNC44LDQ5LjkgMjkuOSw0MC4yJyBdO1xyXG5cclxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gICAgLy8gUGFyc2UgdGhlIHN0cmluZyBkYXRhIGFuZCByZW5kZXIgZWFjaCBzdHJpbmcgYXMgYSBzZXQgb2YgY29ubmVjdGVkIGxpbmUgc2VnbWVudHMuXHJcbiAgICBwb2x5bGluZXMuZm9yRWFjaCggcG9seWxpbmUgPT4ge1xyXG4gICAgICBjb25zdCBwYWlycyA9IHBvbHlsaW5lLnNwbGl0KCAnICcgKTtcclxuICAgICAgY29uc3QgdmVjdG9ycyA9IHBhaXJzLm1hcCggcGFpciA9PiB7XHJcbiAgICAgICAgY29uc3QgcCA9IHBhaXIuc3BsaXQoICcsJyApO1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yMiggTnVtYmVyKCBwWyAwIF0gKSwgTnVtYmVyKCBwWyAxIF0gKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHNoYXBlLm1vdmVUb1BvaW50KCB2ZWN0b3JzWyAwIF0gKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAxOyBpIDwgdmVjdG9ycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBzaGFwZS5saW5lVG9Qb2ludCggdmVjdG9yc1sgaSBdICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwYXRoID0gbmV3IFBhdGgoIHNoYXBlLCB7IHN0cm9rZTogJ3llbGxvdycsIGxpbmVXaWR0aDogMiB9ICk7XHJcbiAgICBwcm92aWRlZE9wdGlvbnMgPSBwcm92aWRlZE9wdGlvbnMgfHwge307XHJcbiAgICBwcm92aWRlZE9wdGlvbnMuY2hpbGRyZW4gPSBbIHBhdGggXTtcclxuICAgIHRoaXMubXV0YXRlKCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBhbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgIHNldFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5jZW50ZXI7XHJcbiAgICAgICAgY29uc3Qgc2NhbGUgPSBVdGlscy5saW5lYXIoIDAsIDEsIDAuNzUsIDIsIHZhbHVlICk7XHJcbiAgICAgICAgY29uc3Qgb3BhY2l0eSA9IFV0aWxzLmNsYW1wKCBVdGlscy5saW5lYXIoIDAuOCwgMSwgMSwgMCwgdmFsdWUgKSwgMCwgMSApO1xyXG4gICAgICAgIHRoaXMuc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlICk7XHJcbiAgICAgICAgdGhpcy5zZXRPcGFjaXR5KCBvcGFjaXR5ICk7XHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBjZW50ZXI7XHJcbiAgICAgIH0sXHJcbiAgICAgIGZyb206IDAsXHJcbiAgICAgIHRvOiAxLFxyXG4gICAgICBkdXJhdGlvbjogMC4zLFxyXG4gICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgICB9ICk7XHJcbiAgICBhbmltYXRpb24uZW5kZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB0aGlzLmRpc3Bvc2UoKSApO1xyXG4gICAgYW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnRnVzZVRyaXBBbmltYXRpb24nLCBGdXNlVHJpcEFuaW1hdGlvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxTQUFTQyxJQUFJLEVBQWVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDeEUsT0FBT0MsU0FBUyxNQUFNLGdDQUFnQztBQUN0RCxPQUFPQyxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLDRCQUE0QixNQUFNLG9DQUFvQztBQUU3RSxlQUFlLE1BQU1DLGlCQUFp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