// Copyright 2017-2022, University of Colorado Boulder

/**
 * Node for handling the representation of an oscillating spring.
 *
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ParametricSpringNode from '../../../../scenery-phet/js/ParametricSpringNode.js';
import massesAndSprings from '../../massesAndSprings.js';

// constants
const LINEAR_LOOP_MAPPING = new LinearFunction(0.1, 0.5, 2, 12);
const MAP_NUMBER_OF_LOOPS = springLength => Utils.roundSymmetric(LINEAR_LOOP_MAPPING.evaluate(springLength));
class OscillatingSpringNode extends ParametricSpringNode {
  /**
   * @param {Spring} spring
   * @param {ModelViewTransform2} modelViewTransform2
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(spring, modelViewTransform2, tandem, options) {
    options = merge({
      deltaPhase: 3 * Math.PI / 2,
      loops: MAP_NUMBER_OF_LOOPS(spring.lengthProperty.get()),
      // {number} number of loops in the coil
      pointsPerLoop: 28,
      // {number} number of points per loop
      radius: 6.5,
      // {number} radius of a loop with aspect ratio of 1:1
      aspectRatio: 4,
      // {number} y:x aspect ratio of the loop radius
      unitDisplacementLength: modelViewTransform2.viewToModelDeltaY(1),
      // {number} view length of 1 meter of displacement
      minLineWidth: 1,
      // {number} lineWidth used to stroke the spring for minimum spring constant
      deltaLineWidth: 1.5,
      // increase in line width per 1 unit of spring constant increase
      leftEndLength: -15,
      // {number} length of the horizontal line added to the left end of the coil
      rightEndLength: -15,
      // {number} length of the horizontal line added to the right end of the coil
      rotation: Math.PI / 2,
      // {number} angle in radians of rotation of spring,
      boundsMethod: 'safePadding',
      tandem: tandem
    }, options);
    super(options);
    const self = this;

    // @public {Spring} (read-only)
    this.spring = spring;
    this.translation = modelViewTransform2.modelToViewPosition(new Vector2(spring.positionProperty.get().x, spring.positionProperty.get().y - length));
    function updateViewLength() {
      // ParametricSpringNode calculations
      // Value of coilStretch is in view coordinates and doesn't have model units.
      const coilStretch = modelViewTransform2.modelToViewDeltaY(spring.lengthProperty.get()) - (options.leftEndLength + options.rightEndLength);
      const xScale = coilStretch / (self.loopsProperty.get() * self.radiusProperty.get());

      // The wrong side of the PSN is static, so we have to put the spring in reverse and update the length AND position.
      // Spring is rotated to be rotated so XScale relates to Y-direction in view
      self.xScaleProperty.set(xScale);
      self.y = modelViewTransform2.modelToViewY(spring.positionProperty.get().y - spring.lengthProperty.get());
    }

    // Link exists for sim duration. No need to unlink.
    spring.naturalRestingLengthProperty.link(springLength => {
      this.loopsProperty.set(MAP_NUMBER_OF_LOOPS(springLength));
      updateViewLength();
    });

    // Link exists for sim duration. No need to unlink.
    spring.lengthProperty.link(() => {
      updateViewLength();
    });

    // ParametricSpringNode width update. SpringConstant determines lineWidth
    // Link exists for sim duration. No need to unlink.
    spring.thicknessProperty.link(thickness => {
      this.lineWidthProperty.set(thickness);
    });
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.spring.reset();
  }
}

// @public
OscillatingSpringNode.MAP_NUMBER_OF_LOOPS = MAP_NUMBER_OF_LOOPS;
massesAndSprings.register('OscillatingSpringNode', OscillatingSpringNode);
export default OscillatingSpringNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lYXJGdW5jdGlvbiIsIlV0aWxzIiwiVmVjdG9yMiIsIm1lcmdlIiwiUGFyYW1ldHJpY1NwcmluZ05vZGUiLCJtYXNzZXNBbmRTcHJpbmdzIiwiTElORUFSX0xPT1BfTUFQUElORyIsIk1BUF9OVU1CRVJfT0ZfTE9PUFMiLCJzcHJpbmdMZW5ndGgiLCJyb3VuZFN5bW1ldHJpYyIsImV2YWx1YXRlIiwiT3NjaWxsYXRpbmdTcHJpbmdOb2RlIiwiY29uc3RydWN0b3IiLCJzcHJpbmciLCJtb2RlbFZpZXdUcmFuc2Zvcm0yIiwidGFuZGVtIiwib3B0aW9ucyIsImRlbHRhUGhhc2UiLCJNYXRoIiwiUEkiLCJsb29wcyIsImxlbmd0aFByb3BlcnR5IiwiZ2V0IiwicG9pbnRzUGVyTG9vcCIsInJhZGl1cyIsImFzcGVjdFJhdGlvIiwidW5pdERpc3BsYWNlbWVudExlbmd0aCIsInZpZXdUb01vZGVsRGVsdGFZIiwibWluTGluZVdpZHRoIiwiZGVsdGFMaW5lV2lkdGgiLCJsZWZ0RW5kTGVuZ3RoIiwicmlnaHRFbmRMZW5ndGgiLCJyb3RhdGlvbiIsImJvdW5kc01ldGhvZCIsInNlbGYiLCJ0cmFuc2xhdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwieCIsInkiLCJsZW5ndGgiLCJ1cGRhdGVWaWV3TGVuZ3RoIiwiY29pbFN0cmV0Y2giLCJtb2RlbFRvVmlld0RlbHRhWSIsInhTY2FsZSIsImxvb3BzUHJvcGVydHkiLCJyYWRpdXNQcm9wZXJ0eSIsInhTY2FsZVByb3BlcnR5Iiwic2V0IiwibW9kZWxUb1ZpZXdZIiwibmF0dXJhbFJlc3RpbmdMZW5ndGhQcm9wZXJ0eSIsImxpbmsiLCJ0aGlja25lc3NQcm9wZXJ0eSIsInRoaWNrbmVzcyIsImxpbmVXaWR0aFByb3BlcnR5IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk9zY2lsbGF0aW5nU3ByaW5nTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOb2RlIGZvciBoYW5kbGluZyB0aGUgcmVwcmVzZW50YXRpb24gb2YgYW4gb3NjaWxsYXRpbmcgc3ByaW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hdHQgUGVubmluZ3RvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IExpbmVhckZ1bmN0aW9uIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9MaW5lYXJGdW5jdGlvbi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGFyYW1ldHJpY1NwcmluZ05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BhcmFtZXRyaWNTcHJpbmdOb2RlLmpzJztcclxuaW1wb3J0IG1hc3Nlc0FuZFNwcmluZ3MgZnJvbSAnLi4vLi4vbWFzc2VzQW5kU3ByaW5ncy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTElORUFSX0xPT1BfTUFQUElORyA9IG5ldyBMaW5lYXJGdW5jdGlvbiggMC4xLCAwLjUsIDIsIDEyICk7XHJcbmNvbnN0IE1BUF9OVU1CRVJfT0ZfTE9PUFMgPSBzcHJpbmdMZW5ndGggPT4gVXRpbHMucm91bmRTeW1tZXRyaWMoIExJTkVBUl9MT09QX01BUFBJTkcuZXZhbHVhdGUoIHNwcmluZ0xlbmd0aCApICk7XHJcblxyXG5jbGFzcyBPc2NpbGxhdGluZ1NwcmluZ05vZGUgZXh0ZW5kcyBQYXJhbWV0cmljU3ByaW5nTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U3ByaW5nfSBzcHJpbmdcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybTJcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzcHJpbmcsIG1vZGVsVmlld1RyYW5zZm9ybTIsIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgZGVsdGFQaGFzZTogMyAqIE1hdGguUEkgLyAyLFxyXG4gICAgICBsb29wczogTUFQX05VTUJFUl9PRl9MT09QUyggc3ByaW5nLmxlbmd0aFByb3BlcnR5LmdldCgpICksIC8vIHtudW1iZXJ9IG51bWJlciBvZiBsb29wcyBpbiB0aGUgY29pbFxyXG4gICAgICBwb2ludHNQZXJMb29wOiAyOCwgLy8ge251bWJlcn0gbnVtYmVyIG9mIHBvaW50cyBwZXIgbG9vcFxyXG4gICAgICByYWRpdXM6IDYuNSwgLy8ge251bWJlcn0gcmFkaXVzIG9mIGEgbG9vcCB3aXRoIGFzcGVjdCByYXRpbyBvZiAxOjFcclxuICAgICAgYXNwZWN0UmF0aW86IDQsIC8vIHtudW1iZXJ9IHk6eCBhc3BlY3QgcmF0aW8gb2YgdGhlIGxvb3AgcmFkaXVzXHJcbiAgICAgIHVuaXREaXNwbGFjZW1lbnRMZW5ndGg6IG1vZGVsVmlld1RyYW5zZm9ybTIudmlld1RvTW9kZWxEZWx0YVkoIDEgKSwgLy8ge251bWJlcn0gdmlldyBsZW5ndGggb2YgMSBtZXRlciBvZiBkaXNwbGFjZW1lbnRcclxuICAgICAgbWluTGluZVdpZHRoOiAxLCAvLyB7bnVtYmVyfSBsaW5lV2lkdGggdXNlZCB0byBzdHJva2UgdGhlIHNwcmluZyBmb3IgbWluaW11bSBzcHJpbmcgY29uc3RhbnRcclxuICAgICAgZGVsdGFMaW5lV2lkdGg6IDEuNSwgLy8gaW5jcmVhc2UgaW4gbGluZSB3aWR0aCBwZXIgMSB1bml0IG9mIHNwcmluZyBjb25zdGFudCBpbmNyZWFzZVxyXG4gICAgICBsZWZ0RW5kTGVuZ3RoOiAtMTUsIC8vIHtudW1iZXJ9IGxlbmd0aCBvZiB0aGUgaG9yaXpvbnRhbCBsaW5lIGFkZGVkIHRvIHRoZSBsZWZ0IGVuZCBvZiB0aGUgY29pbFxyXG4gICAgICByaWdodEVuZExlbmd0aDogLTE1LCAvLyB7bnVtYmVyfSBsZW5ndGggb2YgdGhlIGhvcml6b250YWwgbGluZSBhZGRlZCB0byB0aGUgcmlnaHQgZW5kIG9mIHRoZSBjb2lsXHJcbiAgICAgIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiwgLy8ge251bWJlcn0gYW5nbGUgaW4gcmFkaWFucyBvZiByb3RhdGlvbiBvZiBzcHJpbmcsXHJcbiAgICAgIGJvdW5kc01ldGhvZDogJ3NhZmVQYWRkaW5nJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U3ByaW5nfSAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5zcHJpbmcgPSBzcHJpbmc7XHJcblxyXG4gICAgdGhpcy50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybTIubW9kZWxUb1ZpZXdQb3NpdGlvbihcclxuICAgICAgbmV3IFZlY3RvcjIoIHNwcmluZy5wb3NpdGlvblByb3BlcnR5LmdldCgpLngsXHJcbiAgICAgICAgc3ByaW5nLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSAtIGxlbmd0aCApICk7XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlVmlld0xlbmd0aCgpIHtcclxuXHJcbiAgICAgIC8vIFBhcmFtZXRyaWNTcHJpbmdOb2RlIGNhbGN1bGF0aW9uc1xyXG4gICAgICAvLyBWYWx1ZSBvZiBjb2lsU3RyZXRjaCBpcyBpbiB2aWV3IGNvb3JkaW5hdGVzIGFuZCBkb2Vzbid0IGhhdmUgbW9kZWwgdW5pdHMuXHJcbiAgICAgIGNvbnN0IGNvaWxTdHJldGNoID0gKFxyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTIubW9kZWxUb1ZpZXdEZWx0YVkoIHNwcmluZy5sZW5ndGhQcm9wZXJ0eS5nZXQoKSApXHJcbiAgICAgICAgLSAoIG9wdGlvbnMubGVmdEVuZExlbmd0aCArIG9wdGlvbnMucmlnaHRFbmRMZW5ndGggKSApO1xyXG4gICAgICBjb25zdCB4U2NhbGUgPSBjb2lsU3RyZXRjaCAvICggc2VsZi5sb29wc1Byb3BlcnR5LmdldCgpICogc2VsZi5yYWRpdXNQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgICAgLy8gVGhlIHdyb25nIHNpZGUgb2YgdGhlIFBTTiBpcyBzdGF0aWMsIHNvIHdlIGhhdmUgdG8gcHV0IHRoZSBzcHJpbmcgaW4gcmV2ZXJzZSBhbmQgdXBkYXRlIHRoZSBsZW5ndGggQU5EIHBvc2l0aW9uLlxyXG4gICAgICAvLyBTcHJpbmcgaXMgcm90YXRlZCB0byBiZSByb3RhdGVkIHNvIFhTY2FsZSByZWxhdGVzIHRvIFktZGlyZWN0aW9uIGluIHZpZXdcclxuICAgICAgc2VsZi54U2NhbGVQcm9wZXJ0eS5zZXQoIHhTY2FsZSApO1xyXG4gICAgICBzZWxmLnkgPSBtb2RlbFZpZXdUcmFuc2Zvcm0yLm1vZGVsVG9WaWV3WSggc3ByaW5nLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSAtIHNwcmluZy5sZW5ndGhQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmsgZXhpc3RzIGZvciBzaW0gZHVyYXRpb24uIE5vIG5lZWQgdG8gdW5saW5rLlxyXG4gICAgc3ByaW5nLm5hdHVyYWxSZXN0aW5nTGVuZ3RoUHJvcGVydHkubGluayggc3ByaW5nTGVuZ3RoID0+IHtcclxuICAgICAgdGhpcy5sb29wc1Byb3BlcnR5LnNldCggTUFQX05VTUJFUl9PRl9MT09QUyggc3ByaW5nTGVuZ3RoICkgKTtcclxuICAgICAgdXBkYXRlVmlld0xlbmd0aCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIExpbmsgZXhpc3RzIGZvciBzaW0gZHVyYXRpb24uIE5vIG5lZWQgdG8gdW5saW5rLlxyXG4gICAgc3ByaW5nLmxlbmd0aFByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdXBkYXRlVmlld0xlbmd0aCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFBhcmFtZXRyaWNTcHJpbmdOb2RlIHdpZHRoIHVwZGF0ZS4gU3ByaW5nQ29uc3RhbnQgZGV0ZXJtaW5lcyBsaW5lV2lkdGhcclxuICAgIC8vIExpbmsgZXhpc3RzIGZvciBzaW0gZHVyYXRpb24uIE5vIG5lZWQgdG8gdW5saW5rLlxyXG4gICAgc3ByaW5nLnRoaWNrbmVzc1Byb3BlcnR5LmxpbmsoIHRoaWNrbmVzcyA9PiB7XHJcbiAgICAgIHRoaXMubGluZVdpZHRoUHJvcGVydHkuc2V0KCB0aGlja25lc3MgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLnNwcmluZy5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHB1YmxpY1xyXG5Pc2NpbGxhdGluZ1NwcmluZ05vZGUuTUFQX05VTUJFUl9PRl9MT09QUyA9IE1BUF9OVU1CRVJfT0ZfTE9PUFM7XHJcblxyXG5tYXNzZXNBbmRTcHJpbmdzLnJlZ2lzdGVyKCAnT3NjaWxsYXRpbmdTcHJpbmdOb2RlJywgT3NjaWxsYXRpbmdTcHJpbmdOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE9zY2lsbGF0aW5nU3ByaW5nTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sc0NBQXNDO0FBQ2pFLE9BQU9D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