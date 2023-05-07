// Copyright 2014-2022, University of Colorado Boulder

/**
 * Indicator of polarity (positive or negative) used on E-field plates.
 * Origin at center of cross hairs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Circle, Line, Node } from '../../../../scenery/js/imports.js';
import moleculePolarity from '../../moleculePolarity.js';
export default class PolarityIndicator extends Node {
  constructor(polarity, radius = 20) {
    super();
    const pathOptions = {
      lineWidth: 4,
      stroke: 'black'
    };

    // circle
    this.addChild(new Circle(radius, pathOptions));

    // horizontal bar for plus or minus sign
    this.addChild(new Line(-0.5 * radius, 0, 0.5 * radius, 0, pathOptions));

    // vertical bar for plus sign
    if (polarity === 'positive') {
      this.addChild(new Line(0, -0.5 * radius, 0, 0.5 * radius, pathOptions));
    }

    // vertical connecting bar
    this.addChild(new Line(0, radius, 0, 2 * radius, pathOptions));
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
moleculePolarity.register('PolarityIndicator', PolarityIndicator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaXJjbGUiLCJMaW5lIiwiTm9kZSIsIm1vbGVjdWxlUG9sYXJpdHkiLCJQb2xhcml0eUluZGljYXRvciIsImNvbnN0cnVjdG9yIiwicG9sYXJpdHkiLCJyYWRpdXMiLCJwYXRoT3B0aW9ucyIsImxpbmVXaWR0aCIsInN0cm9rZSIsImFkZENoaWxkIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9sYXJpdHlJbmRpY2F0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW5kaWNhdG9yIG9mIHBvbGFyaXR5IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSkgdXNlZCBvbiBFLWZpZWxkIHBsYXRlcy5cclxuICogT3JpZ2luIGF0IGNlbnRlciBvZiBjcm9zcyBoYWlycy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBDaXJjbGUsIENpcmNsZU9wdGlvbnMsIExpbmUsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVQb2xhcml0eSBmcm9tICcuLi8uLi9tb2xlY3VsZVBvbGFyaXR5LmpzJztcclxuaW1wb3J0IHsgUG9sYXJpdHkgfSBmcm9tICcuLi9tb2RlbC9Qb2xhcml0eS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2xhcml0eUluZGljYXRvciBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBvbGFyaXR5OiBQb2xhcml0eSwgcmFkaXVzID0gMjAgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCBwYXRoT3B0aW9uczogQ2lyY2xlT3B0aW9ucyA9IHtcclxuICAgICAgbGluZVdpZHRoOiA0LFxyXG4gICAgICBzdHJva2U6ICdibGFjaydcclxuICAgIH07XHJcblxyXG4gICAgLy8gY2lyY2xlXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCByYWRpdXMsIHBhdGhPcHRpb25zICkgKTtcclxuXHJcbiAgICAvLyBob3Jpem9udGFsIGJhciBmb3IgcGx1cyBvciBtaW51cyBzaWduXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTGluZSggLTAuNSAqIHJhZGl1cywgMCwgMC41ICogcmFkaXVzLCAwLCBwYXRoT3B0aW9ucyApICk7XHJcblxyXG4gICAgLy8gdmVydGljYWwgYmFyIGZvciBwbHVzIHNpZ25cclxuICAgIGlmICggcG9sYXJpdHkgPT09ICdwb3NpdGl2ZScgKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBMaW5lKCAwLCAtMC41ICogcmFkaXVzLCAwLCAwLjUgKiByYWRpdXMsIHBhdGhPcHRpb25zICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB2ZXJ0aWNhbCBjb25uZWN0aW5nIGJhclxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IExpbmUoIDAsIHJhZGl1cywgMCwgMiAqIHJhZGl1cywgcGF0aE9wdGlvbnMgKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm1vbGVjdWxlUG9sYXJpdHkucmVnaXN0ZXIoICdQb2xhcml0eUluZGljYXRvcicsIFBvbGFyaXR5SW5kaWNhdG9yICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsTUFBTSxFQUFpQkMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUd4RCxlQUFlLE1BQU1DLGlCQUFpQixTQUFTRixJQUFJLENBQUM7RUFFM0NHLFdBQVdBLENBQUVDLFFBQWtCLEVBQUVDLE1BQU0sR0FBRyxFQUFFLEVBQUc7SUFFcEQsS0FBSyxDQUFDLENBQUM7SUFFUCxNQUFNQyxXQUEwQixHQUFHO01BQ2pDQyxTQUFTLEVBQUUsQ0FBQztNQUNaQyxNQUFNLEVBQUU7SUFDVixDQUFDOztJQUVEO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSVgsTUFBTSxDQUFFTyxNQUFNLEVBQUVDLFdBQVksQ0FBRSxDQUFDOztJQUVsRDtJQUNBLElBQUksQ0FBQ0csUUFBUSxDQUFFLElBQUlWLElBQUksQ0FBRSxDQUFDLEdBQUcsR0FBR00sTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUdBLE1BQU0sRUFBRSxDQUFDLEVBQUVDLFdBQVksQ0FBRSxDQUFDOztJQUUzRTtJQUNBLElBQUtGLFFBQVEsS0FBSyxVQUFVLEVBQUc7TUFDN0IsSUFBSSxDQUFDSyxRQUFRLENBQUUsSUFBSVYsSUFBSSxDQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBR00sTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUdBLE1BQU0sRUFBRUMsV0FBWSxDQUFFLENBQUM7SUFDN0U7O0lBRUE7SUFDQSxJQUFJLENBQUNHLFFBQVEsQ0FBRSxJQUFJVixJQUFJLENBQUUsQ0FBQyxFQUFFTSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBR0EsTUFBTSxFQUFFQyxXQUFZLENBQUUsQ0FBQztFQUNwRTtFQUVnQkksT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFULGdCQUFnQixDQUFDVyxRQUFRLENBQUUsbUJBQW1CLEVBQUVWLGlCQUFrQixDQUFDIn0=