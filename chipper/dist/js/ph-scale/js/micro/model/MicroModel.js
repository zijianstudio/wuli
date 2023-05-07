// Copyright 2013-2023, University of Colorado Boulder

/**
 * MicroModel is the model for the 'Micro' screen.  It extends the PHModel, substituting a different solution
 * model, and omitting the pH meter.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PHModel from '../../common/model/PHModel.js';
import phScale from '../../phScale.js';
import MicroSolution from './MicroSolution.js';
export default class MicroModel extends PHModel {
  constructor(providedOptions) {
    const options = optionize()({
      // Creates the solution needed by the Micro screen
      createSolution: (solutionProperty, maxVolume, tandem) => new MicroSolution(solutionProperty, {
        maxVolume: maxVolume,
        tandem: tandem
      })
    }, providedOptions);
    super(options);
  }
}
phScale.register('MicroModel', MicroModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQSE1vZGVsIiwicGhTY2FsZSIsIk1pY3JvU29sdXRpb24iLCJNaWNyb01vZGVsIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY3JlYXRlU29sdXRpb24iLCJzb2x1dGlvblByb3BlcnR5IiwibWF4Vm9sdW1lIiwidGFuZGVtIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNaWNyb01vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1pY3JvTW9kZWwgaXMgdGhlIG1vZGVsIGZvciB0aGUgJ01pY3JvJyBzY3JlZW4uICBJdCBleHRlbmRzIHRoZSBQSE1vZGVsLCBzdWJzdGl0dXRpbmcgYSBkaWZmZXJlbnQgc29sdXRpb25cclxuICogbW9kZWwsIGFuZCBvbWl0dGluZyB0aGUgcEggbWV0ZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQSE1vZGVsLCB7IFBITW9kZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1BITW9kZWwuanMnO1xyXG5pbXBvcnQgcGhTY2FsZSBmcm9tICcuLi8uLi9waFNjYWxlLmpzJztcclxuaW1wb3J0IE1pY3JvU29sdXRpb24gZnJvbSAnLi9NaWNyb1NvbHV0aW9uLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBNaWNyb01vZGVsT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFBITW9kZWxPcHRpb25zPE1pY3JvU29sdXRpb24+LCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWNyb01vZGVsIGV4dGVuZHMgUEhNb2RlbDxNaWNyb1NvbHV0aW9uPiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBNaWNyb01vZGVsT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE1pY3JvTW9kZWxPcHRpb25zLCBTZWxmT3B0aW9ucywgUEhNb2RlbE9wdGlvbnM8TWljcm9Tb2x1dGlvbj4+KCkoIHtcclxuXHJcbiAgICAgIC8vIENyZWF0ZXMgdGhlIHNvbHV0aW9uIG5lZWRlZCBieSB0aGUgTWljcm8gc2NyZWVuXHJcbiAgICAgIGNyZWF0ZVNvbHV0aW9uOiAoIHNvbHV0aW9uUHJvcGVydHksIG1heFZvbHVtZSwgdGFuZGVtICkgPT4gbmV3IE1pY3JvU29sdXRpb24oIHNvbHV0aW9uUHJvcGVydHksIHtcclxuICAgICAgICBtYXhWb2x1bWU6IG1heFZvbHVtZSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgICB9IClcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5waFNjYWxlLnJlZ2lzdGVyKCAnTWljcm9Nb2RlbCcsIE1pY3JvTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyxPQUFPLE1BQTBCLCtCQUErQjtBQUN2RSxPQUFPQyxPQUFPLE1BQU0sa0JBQWtCO0FBQ3RDLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFNOUMsZUFBZSxNQUFNQyxVQUFVLFNBQVNILE9BQU8sQ0FBZ0I7RUFFdERJLFdBQVdBLENBQUVDLGVBQWtDLEVBQUc7SUFFdkQsTUFBTUMsT0FBTyxHQUFHUCxTQUFTLENBQWdFLENBQUMsQ0FBRTtNQUUxRjtNQUNBUSxjQUFjLEVBQUVBLENBQUVDLGdCQUFnQixFQUFFQyxTQUFTLEVBQUVDLE1BQU0sS0FBTSxJQUFJUixhQUFhLENBQUVNLGdCQUFnQixFQUFFO1FBQzlGQyxTQUFTLEVBQUVBLFNBQVM7UUFDcEJDLE1BQU0sRUFBRUE7TUFDVixDQUFFO0lBQ0osQ0FBQyxFQUFFTCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDO0VBQ2xCO0FBQ0Y7QUFFQUwsT0FBTyxDQUFDVSxRQUFRLENBQUUsWUFBWSxFQUFFUixVQUFXLENBQUMifQ==