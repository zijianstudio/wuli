// Copyright 2013-2022, University of Colorado Boulder

/**
 * Scenery node that represents a simple, non-interactive clock.  It is
 * intended for use in situations where an icon representing time is needed.
 *
 * @author John Blanco
 */

import optionize from '../../phet-core/js/optionize.js';
import { Circle, Line, Node } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
export default class SimpleClockIcon extends Node {
  constructor(radius, providedOptions) {
    super();
    const options = optionize()({
      // SelfOptions
      fill: 'white',
      stroke: 'black',
      lineWidth: 2
    }, providedOptions);
    this.addChild(new Circle(radius, options));
    this.addChild(new Circle(radius * 0.15, {
      fill: options.stroke
    }));
    const lineOptionsForClockHands = {
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      lineCap: 'round',
      lineJoin: 'round'
    };

    // Hands at 4 o'clock
    this.addChild(new Line(0, 0, 0, -radius * 0.75, lineOptionsForClockHands));
    this.addChild(new Line(0, 0, radius * 0.45, radius * 0.3, lineOptionsForClockHands));
    this.centerX = radius;
    this.centerY = radius;
    this.mutate(options);
  }
}
sceneryPhet.register('SimpleClockIcon', SimpleClockIcon);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDaXJjbGUiLCJMaW5lIiwiTm9kZSIsInNjZW5lcnlQaGV0IiwiU2ltcGxlQ2xvY2tJY29uIiwiY29uc3RydWN0b3IiLCJyYWRpdXMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFkZENoaWxkIiwibGluZU9wdGlvbnNGb3JDbG9ja0hhbmRzIiwibGluZUNhcCIsImxpbmVKb2luIiwiY2VudGVyWCIsImNlbnRlclkiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNpbXBsZUNsb2NrSWNvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5IG5vZGUgdGhhdCByZXByZXNlbnRzIGEgc2ltcGxlLCBub24taW50ZXJhY3RpdmUgY2xvY2suICBJdCBpc1xyXG4gKiBpbnRlbmRlZCBmb3IgdXNlIGluIHNpdHVhdGlvbnMgd2hlcmUgYW4gaWNvbiByZXByZXNlbnRpbmcgdGltZSBpcyBuZWVkZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIFRQYWludCwgTGluZSwgTGluZU9wdGlvbnMsIE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBmaWxsPzogVFBhaW50O1xyXG4gIHN0cm9rZT86IFRQYWludDtcclxuICBsaW5lV2lkdGg/OiBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBTaW1wbGVDbG9ja0ljb25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZUNsb2NrSWNvbiBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHJhZGl1czogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBTaW1wbGVDbG9ja0ljb25PcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTaW1wbGVDbG9ja0ljb25PcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCByYWRpdXMsIG9wdGlvbnMgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggcmFkaXVzICogMC4xNSwgeyBmaWxsOiBvcHRpb25zLnN0cm9rZSB9ICkgKTtcclxuICAgIGNvbnN0IGxpbmVPcHRpb25zRm9yQ2xvY2tIYW5kczogTGluZU9wdGlvbnMgPSB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXHJcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsXHJcbiAgICAgIGxpbmVDYXA6ICdyb3VuZCcsXHJcbiAgICAgIGxpbmVKb2luOiAncm91bmQnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEhhbmRzIGF0IDQgbydjbG9ja1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IExpbmUoIDAsIDAsIDAsIC1yYWRpdXMgKiAwLjc1LCBsaW5lT3B0aW9uc0ZvckNsb2NrSGFuZHMgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IExpbmUoIDAsIDAsIHJhZGl1cyAqIDAuNDUsIHJhZGl1cyAqIDAuMywgbGluZU9wdGlvbnNGb3JDbG9ja0hhbmRzICkgKTtcclxuICAgIHRoaXMuY2VudGVyWCA9IHJhZGl1cztcclxuICAgIHRoaXMuY2VudGVyWSA9IHJhZGl1cztcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdTaW1wbGVDbG9ja0ljb24nLCBTaW1wbGVDbG9ja0ljb24gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELFNBQVNDLE1BQU0sRUFBVUMsSUFBSSxFQUFlQyxJQUFJLFFBQXFCLDZCQUE2QjtBQUNsRyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBVTFDLGVBQWUsTUFBTUMsZUFBZSxTQUFTRixJQUFJLENBQUM7RUFFekNHLFdBQVdBLENBQUVDLE1BQWMsRUFBRUMsZUFBd0MsRUFBRztJQUU3RSxLQUFLLENBQUMsQ0FBQztJQUVQLE1BQU1DLE9BQU8sR0FBR1QsU0FBUyxDQUFtRCxDQUFDLENBQUU7TUFFN0U7TUFDQVUsSUFBSSxFQUFFLE9BQU87TUFDYkMsTUFBTSxFQUFFLE9BQU87TUFDZkMsU0FBUyxFQUFFO0lBQ2IsQ0FBQyxFQUFFSixlQUFnQixDQUFDO0lBRXBCLElBQUksQ0FBQ0ssUUFBUSxDQUFFLElBQUlaLE1BQU0sQ0FBRU0sTUFBTSxFQUFFRSxPQUFRLENBQUUsQ0FBQztJQUM5QyxJQUFJLENBQUNJLFFBQVEsQ0FBRSxJQUFJWixNQUFNLENBQUVNLE1BQU0sR0FBRyxJQUFJLEVBQUU7TUFBRUcsSUFBSSxFQUFFRCxPQUFPLENBQUNFO0lBQU8sQ0FBRSxDQUFFLENBQUM7SUFDdEUsTUFBTUcsd0JBQXFDLEdBQUc7TUFDNUNILE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNO01BQ3RCQyxTQUFTLEVBQUVILE9BQU8sQ0FBQ0csU0FBUztNQUM1QkcsT0FBTyxFQUFFLE9BQU87TUFDaEJDLFFBQVEsRUFBRTtJQUNaLENBQUM7O0lBRUQ7SUFDQSxJQUFJLENBQUNILFFBQVEsQ0FBRSxJQUFJWCxJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQ0ssTUFBTSxHQUFHLElBQUksRUFBRU8sd0JBQXlCLENBQUUsQ0FBQztJQUM5RSxJQUFJLENBQUNELFFBQVEsQ0FBRSxJQUFJWCxJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUssTUFBTSxHQUFHLElBQUksRUFBRUEsTUFBTSxHQUFHLEdBQUcsRUFBRU8sd0JBQXlCLENBQUUsQ0FBQztJQUN4RixJQUFJLENBQUNHLE9BQU8sR0FBR1YsTUFBTTtJQUNyQixJQUFJLENBQUNXLE9BQU8sR0FBR1gsTUFBTTtJQUVyQixJQUFJLENBQUNZLE1BQU0sQ0FBRVYsT0FBUSxDQUFDO0VBQ3hCO0FBQ0Y7QUFFQUwsV0FBVyxDQUFDZ0IsUUFBUSxDQUFFLGlCQUFpQixFQUFFZixlQUFnQixDQUFDIn0=