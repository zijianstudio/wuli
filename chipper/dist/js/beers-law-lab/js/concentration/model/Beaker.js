// Copyright 2013-2022, University of Colorado Boulder

/**
 * Beaker is the model of a simple beaker.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import beersLawLab from '../../beersLawLab.js';
export default class Beaker {
  // x-coordinate of the left wall
  // x-coordinate of the right wall

  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      position: Vector2.ZERO,
      size: new Dimension2(600, 300),
      volume: 1
    }, providedOptions);
    this.position = options.position;
    this.size = options.size;
    this.volume = options.volume;
    this.left = this.position.x - this.size.width / 2;
    this.right = this.position.x + this.size.width / 2;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
}
beersLawLab.register('Beaker', Beaker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsImJlZXJzTGF3TGFiIiwiQmVha2VyIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicG9zaXRpb24iLCJaRVJPIiwic2l6ZSIsInZvbHVtZSIsImxlZnQiLCJ4Iiwid2lkdGgiLCJyaWdodCIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJlYWtlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCZWFrZXIgaXMgdGhlIG1vZGVsIG9mIGEgc2ltcGxlIGJlYWtlci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IGJlZXJzTGF3TGFiIGZyb20gJy4uLy4uL2JlZXJzTGF3TGFiLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcG9zaXRpb24/OiBWZWN0b3IyO1xyXG4gIHNpemU/OiBEaW1lbnNpb24yO1xyXG4gIHZvbHVtZT86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgQmVha2VyT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmVha2VyIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHBvc2l0aW9uOiBWZWN0b3IyO1xyXG4gIHB1YmxpYyByZWFkb25seSBzaXplOiBEaW1lbnNpb24yO1xyXG4gIHB1YmxpYyByZWFkb25seSB2b2x1bWU6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGxlZnQ6IG51bWJlcjsgLy8geC1jb29yZGluYXRlIG9mIHRoZSBsZWZ0IHdhbGxcclxuICBwdWJsaWMgcmVhZG9ubHkgcmlnaHQ6IG51bWJlcjsgLy8geC1jb29yZGluYXRlIG9mIHRoZSByaWdodCB3YWxsXHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogQmVha2VyT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJlYWtlck9wdGlvbnMsIFNlbGZPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBwb3NpdGlvbjogVmVjdG9yMi5aRVJPLFxyXG4gICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggNjAwLCAzMDAgKSxcclxuICAgICAgdm9sdW1lOiAxXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnBvc2l0aW9uID0gb3B0aW9ucy5wb3NpdGlvbjtcclxuICAgIHRoaXMuc2l6ZSA9IG9wdGlvbnMuc2l6ZTtcclxuICAgIHRoaXMudm9sdW1lID0gb3B0aW9ucy52b2x1bWU7XHJcblxyXG4gICAgdGhpcy5sZWZ0ID0gdGhpcy5wb3NpdGlvbi54IC0gKCB0aGlzLnNpemUud2lkdGggLyAyICk7XHJcbiAgICB0aGlzLnJpZ2h0ID0gdGhpcy5wb3NpdGlvbi54ICsgKCB0aGlzLnNpemUud2lkdGggLyAyICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gIH1cclxufVxyXG5cclxuYmVlcnNMYXdMYWIucmVnaXN0ZXIoICdCZWFrZXInLCBCZWFrZXIgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQVU5QyxlQUFlLE1BQU1DLE1BQU0sQ0FBQztFQU1JO0VBQ0M7O0VBRXhCQyxXQUFXQSxDQUFFQyxlQUErQixFQUFHO0lBRXBELE1BQU1DLE9BQU8sR0FBR0wsU0FBUyxDQUE2QixDQUFDLENBQUU7TUFFdkQ7TUFDQU0sUUFBUSxFQUFFUCxPQUFPLENBQUNRLElBQUk7TUFDdEJDLElBQUksRUFBRSxJQUFJVixVQUFVLENBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztNQUNoQ1csTUFBTSxFQUFFO0lBQ1YsQ0FBQyxFQUFFTCxlQUFnQixDQUFDO0lBRXBCLElBQUksQ0FBQ0UsUUFBUSxHQUFHRCxPQUFPLENBQUNDLFFBQVE7SUFDaEMsSUFBSSxDQUFDRSxJQUFJLEdBQUdILE9BQU8sQ0FBQ0csSUFBSTtJQUN4QixJQUFJLENBQUNDLE1BQU0sR0FBR0osT0FBTyxDQUFDSSxNQUFNO0lBRTVCLElBQUksQ0FBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQ0osUUFBUSxDQUFDSyxDQUFDLEdBQUssSUFBSSxDQUFDSCxJQUFJLENBQUNJLEtBQUssR0FBRyxDQUFHO0lBQ3JELElBQUksQ0FBQ0MsS0FBSyxHQUFHLElBQUksQ0FBQ1AsUUFBUSxDQUFDSyxDQUFDLEdBQUssSUFBSSxDQUFDSCxJQUFJLENBQUNJLEtBQUssR0FBRyxDQUFHO0VBQ3hEO0VBRU9FLE9BQU9BLENBQUEsRUFBUztJQUNyQkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0VBQzNGO0FBQ0Y7QUFFQWQsV0FBVyxDQUFDZSxRQUFRLENBQUUsUUFBUSxFQUFFZCxNQUFPLENBQUMifQ==