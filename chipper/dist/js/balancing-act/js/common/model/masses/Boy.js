// Copyright 2013-2021, University of Colorado Boulder

/**
 * Model element that represents a boy who is roughly 6 years old.  The data
 * for his height and weight came from:
 * http://www.disabled-world.com/artman/publish/height-weight-teens.shtml
 *
 * @author John Blanco
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import boySitting_png from '../../../../mipmaps/boySitting_png.js';
import boyStanding_png from '../../../../mipmaps/boyStanding_png.js';
import balancingAct from '../../../balancingAct.js';
import HumanMass from './HumanMass.js';

// constants
const MASS = 20; // in kg
const STANDING_HEIGHT = 1.1; // In meters.
const SITTING_HEIGHT = 0.65; // In meters.
const SITTING_CENTER_OF_MASS_X_OFFSET = 0.1; // In meters, determined visually.  Update if image changes.

class Boy extends HumanMass {
  constructor() {
    super(MASS, boyStanding_png, STANDING_HEIGHT, boySitting_png, SITTING_HEIGHT, Vector2.ZERO, SITTING_CENTER_OF_MASS_X_OFFSET, false);
    this.centerOfMassXOffset = 0.03; // Empirically determined.
  }
}

balancingAct.register('Boy', Boy);
export default Boy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiYm95U2l0dGluZ19wbmciLCJib3lTdGFuZGluZ19wbmciLCJiYWxhbmNpbmdBY3QiLCJIdW1hbk1hc3MiLCJNQVNTIiwiU1RBTkRJTkdfSEVJR0hUIiwiU0lUVElOR19IRUlHSFQiLCJTSVRUSU5HX0NFTlRFUl9PRl9NQVNTX1hfT0ZGU0VUIiwiQm95IiwiY29uc3RydWN0b3IiLCJaRVJPIiwiY2VudGVyT2ZNYXNzWE9mZnNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQm95LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGEgYm95IHdobyBpcyByb3VnaGx5IDYgeWVhcnMgb2xkLiAgVGhlIGRhdGFcclxuICogZm9yIGhpcyBoZWlnaHQgYW5kIHdlaWdodCBjYW1lIGZyb206XHJcbiAqIGh0dHA6Ly93d3cuZGlzYWJsZWQtd29ybGQuY29tL2FydG1hbi9wdWJsaXNoL2hlaWdodC13ZWlnaHQtdGVlbnMuc2h0bWxcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGJveVNpdHRpbmdfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvYm95U2l0dGluZ19wbmcuanMnO1xyXG5pbXBvcnQgYm95U3RhbmRpbmdfcG5nIGZyb20gJy4uLy4uLy4uLy4uL21pcG1hcHMvYm95U3RhbmRpbmdfcG5nLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0FjdCBmcm9tICcuLi8uLi8uLi9iYWxhbmNpbmdBY3QuanMnO1xyXG5pbXBvcnQgSHVtYW5NYXNzIGZyb20gJy4vSHVtYW5NYXNzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVNTID0gMjA7IC8vIGluIGtnXHJcbmNvbnN0IFNUQU5ESU5HX0hFSUdIVCA9IDEuMTsgLy8gSW4gbWV0ZXJzLlxyXG5jb25zdCBTSVRUSU5HX0hFSUdIVCA9IDAuNjU7IC8vIEluIG1ldGVycy5cclxuY29uc3QgU0lUVElOR19DRU5URVJfT0ZfTUFTU19YX09GRlNFVCA9IDAuMTsgLy8gSW4gbWV0ZXJzLCBkZXRlcm1pbmVkIHZpc3VhbGx5LiAgVXBkYXRlIGlmIGltYWdlIGNoYW5nZXMuXHJcblxyXG5jbGFzcyBCb3kgZXh0ZW5kcyBIdW1hbk1hc3Mge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCBNQVNTLCBib3lTdGFuZGluZ19wbmcsIFNUQU5ESU5HX0hFSUdIVCwgYm95U2l0dGluZ19wbmcsIFNJVFRJTkdfSEVJR0hULFxyXG4gICAgICBWZWN0b3IyLlpFUk8sIFNJVFRJTkdfQ0VOVEVSX09GX01BU1NfWF9PRkZTRVQsIGZhbHNlICk7XHJcbiAgICB0aGlzLmNlbnRlck9mTWFzc1hPZmZzZXQgPSAwLjAzOyAvLyBFbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQWN0LnJlZ2lzdGVyKCAnQm95JywgQm95ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCb3k7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxZQUFZLE1BQU0sMEJBQTBCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7O0FBRXRDO0FBQ0EsTUFBTUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLE1BQU1DLGVBQWUsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM3QixNQUFNQyxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDN0IsTUFBTUMsK0JBQStCLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRTdDLE1BQU1DLEdBQUcsU0FBU0wsU0FBUyxDQUFDO0VBRTFCTSxXQUFXQSxDQUFBLEVBQUc7SUFDWixLQUFLLENBQUVMLElBQUksRUFBRUgsZUFBZSxFQUFFSSxlQUFlLEVBQUVMLGNBQWMsRUFBRU0sY0FBYyxFQUMzRVAsT0FBTyxDQUFDVyxJQUFJLEVBQUVILCtCQUErQixFQUFFLEtBQU0sQ0FBQztJQUN4RCxJQUFJLENBQUNJLG1CQUFtQixHQUFHLElBQUksQ0FBQyxDQUFDO0VBQ25DO0FBQ0Y7O0FBRUFULFlBQVksQ0FBQ1UsUUFBUSxDQUFFLEtBQUssRUFBRUosR0FBSSxDQUFDO0FBRW5DLGVBQWVBLEdBQUcifQ==