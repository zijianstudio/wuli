// Copyright 2018-2022, University of Colorado Boulder

/**
 * Shape for the 'play' icon that appears on buttons and other UI components.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../kite/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
export default class PlayIconShape extends Shape {
  constructor(width, height) {
    super();

    // triangle that points to the right
    this.moveTo(0, 0);
    this.lineTo(width, height / 2);
    this.lineTo(0, height);
    this.close();
  }
}
sceneryPhet.register('PlayIconShape', PlayIconShape);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsInNjZW5lcnlQaGV0IiwiUGxheUljb25TaGFwZSIsImNvbnN0cnVjdG9yIiwid2lkdGgiLCJoZWlnaHQiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGxheUljb25TaGFwZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaGFwZSBmb3IgdGhlICdwbGF5JyBpY29uIHRoYXQgYXBwZWFycyBvbiBidXR0b25zIGFuZCBvdGhlciBVSSBjb21wb25lbnRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheUljb25TaGFwZSBleHRlbmRzIFNoYXBlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gdHJpYW5nbGUgdGhhdCBwb2ludHMgdG8gdGhlIHJpZ2h0XHJcbiAgICB0aGlzLm1vdmVUbyggMCwgMCApO1xyXG4gICAgdGhpcy5saW5lVG8oIHdpZHRoLCBoZWlnaHQgLyAyICk7XHJcbiAgICB0aGlzLmxpbmVUbyggMCwgaGVpZ2h0ICk7XHJcbiAgICB0aGlzLmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1BsYXlJY29uU2hhcGUnLCBQbGF5SWNvblNoYXBlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSwwQkFBMEI7QUFDaEQsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUUxQyxlQUFlLE1BQU1DLGFBQWEsU0FBU0YsS0FBSyxDQUFDO0VBRXhDRyxXQUFXQSxDQUFFQyxLQUFhLEVBQUVDLE1BQWMsRUFBRztJQUNsRCxLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLElBQUksQ0FBQ0MsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDbkIsSUFBSSxDQUFDQyxNQUFNLENBQUVILEtBQUssRUFBRUMsTUFBTSxHQUFHLENBQUUsQ0FBQztJQUNoQyxJQUFJLENBQUNFLE1BQU0sQ0FBRSxDQUFDLEVBQUVGLE1BQU8sQ0FBQztJQUN4QixJQUFJLENBQUNHLEtBQUssQ0FBQyxDQUFDO0VBQ2Q7QUFDRjtBQUVBUCxXQUFXLENBQUNRLFFBQVEsQ0FBRSxlQUFlLEVBQUVQLGFBQWMsQ0FBQyJ9