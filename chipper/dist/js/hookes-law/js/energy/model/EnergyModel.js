// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for the "Energy" screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import SingleSpringSystem from '../../common/model/SingleSpringSystem.js';
import hookesLaw from '../../hookesLaw.js';
export default class EnergyModel {
  constructor(tandem) {
    this.system = new SingleSpringSystem({
      springOptions: {
        logName: 'spring',
        springConstantRange: new RangeWithValue(100, 400, 100),
        // units = N/m
        displacementRange: new RangeWithValue(-1, 1, 0) // units = m
      },

      tandem: tandem.createTandem('system')
    });
  }
  reset() {
    this.system.reset();
  }
}
hookesLaw.register('EnergyModel', EnergyModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZVdpdGhWYWx1ZSIsIlNpbmdsZVNwcmluZ1N5c3RlbSIsImhvb2tlc0xhdyIsIkVuZXJneU1vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJzeXN0ZW0iLCJzcHJpbmdPcHRpb25zIiwibG9nTmFtZSIsInNwcmluZ0NvbnN0YW50UmFuZ2UiLCJkaXNwbGFjZW1lbnRSYW5nZSIsImNyZWF0ZVRhbmRlbSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbmVyZ3lNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIFwiRW5lcmd5XCIgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2VXaXRoVmFsdWUuanMnO1xyXG5pbXBvcnQgVE1vZGVsIGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1RNb2RlbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBTaW5nbGVTcHJpbmdTeXN0ZW0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NpbmdsZVNwcmluZ1N5c3RlbS5qcyc7XHJcbmltcG9ydCBob29rZXNMYXcgZnJvbSAnLi4vLi4vaG9va2VzTGF3LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuZXJneU1vZGVsIGltcGxlbWVudHMgVE1vZGVsIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHN5c3RlbTogU2luZ2xlU3ByaW5nU3lzdGVtO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHRoaXMuc3lzdGVtID0gbmV3IFNpbmdsZVNwcmluZ1N5c3RlbSgge1xyXG4gICAgICBzcHJpbmdPcHRpb25zOiB7XHJcbiAgICAgICAgbG9nTmFtZTogJ3NwcmluZycsXHJcbiAgICAgICAgc3ByaW5nQ29uc3RhbnRSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCAxMDAsIDQwMCwgMTAwICksIC8vIHVuaXRzID0gTi9tXHJcbiAgICAgICAgZGlzcGxhY2VtZW50UmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggLTEsIDEsIDAgKSAvLyB1bml0cyA9IG1cclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3lzdGVtJyApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN5c3RlbS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnRW5lcmd5TW9kZWwnLCBFbmVyZ3lNb2RlbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sc0NBQXNDO0FBR2pFLE9BQU9DLGtCQUFrQixNQUFNLDBDQUEwQztBQUN6RSxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBRTFDLGVBQWUsTUFBTUMsV0FBVyxDQUFtQjtFQUkxQ0MsV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBRW5DLElBQUksQ0FBQ0MsTUFBTSxHQUFHLElBQUlMLGtCQUFrQixDQUFFO01BQ3BDTSxhQUFhLEVBQUU7UUFDYkMsT0FBTyxFQUFFLFFBQVE7UUFDakJDLG1CQUFtQixFQUFFLElBQUlULGNBQWMsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztRQUFFO1FBQzFEVSxpQkFBaUIsRUFBRSxJQUFJVixjQUFjLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDO01BQ3BELENBQUM7O01BQ0RLLE1BQU0sRUFBRUEsTUFBTSxDQUFDTSxZQUFZLENBQUUsUUFBUztJQUN4QyxDQUFFLENBQUM7RUFDTDtFQUVPQyxLQUFLQSxDQUFBLEVBQVM7SUFDbkIsSUFBSSxDQUFDTixNQUFNLENBQUNNLEtBQUssQ0FBQyxDQUFDO0VBQ3JCO0FBQ0Y7QUFFQVYsU0FBUyxDQUFDVyxRQUFRLENBQUUsYUFBYSxFQUFFVixXQUFZLENBQUMifQ==