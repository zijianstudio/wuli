// Copyright 2020-2022, University of Colorado Boulder

/**
 * ProtractorNode is a device for measuring angles.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../axon/js/NumberProperty.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import sceneryPhet from '../../scenery-phet/js/sceneryPhet.js';
import protractor_png from '../../scenery-phet/mipmaps/protractor_png.js';
import { DragListener, Image, Node, Path } from '../../scenery/js/imports.js';
export default class ProtractorNode extends Node {
  // angle of the protractor, in radians

  constructor(providedOptions) {
    const options = optionize()({
      angle: 0,
      rotatable: false,
      cursor: 'pointer'
    }, providedOptions);
    super();

    // Image
    const protractor_pngNode = new Image(protractor_png, {
      hitTestPixels: true // hit test only non-transparent pixels in the image
    });

    this.addChild(protractor_pngNode);
    this.angleProperty = new NumberProperty(options.angle);
    if (options.rotatable) {
      // Use nicknames for width and height, to make the Shape code easier to understand.
      const w = protractor_pngNode.getWidth();
      const h = protractor_pngNode.getHeight();

      // Outer ring of the protractor. Shape must match protractor_png!
      const outerRingShape = new Shape().moveTo(w, h / 2).ellipticalArc(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, true).lineTo(w * 0.2, h / 2).ellipticalArc(w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, false).lineTo(w, h / 2).ellipticalArc(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI, false).lineTo(w * 0.2, h / 2).ellipticalArc(w / 2, h / 2, w * 0.3, h * 0.3, 0, Math.PI, 0, true);
      const outerRingPath = new Path(outerRingShape, {
        stroke: phet.chipper.queryParameters.dev ? 'red' : null // show the Shape with ?dev
      });

      this.addChild(outerRingPath);

      // Rotate the protractor when its outer ring is dragged.
      let start;
      outerRingPath.addInputListener(new DragListener({
        start: event => {
          start = this.globalToParentPoint(event.pointer.point);
        },
        drag: event => {
          // compute the change in angle based on the new drag event
          const end = this.globalToParentPoint(event.pointer.point);
          const centerX = this.getCenterX();
          const centerY = this.getCenterY();
          const startAngle = Math.atan2(centerY - start.y, centerX - start.x);
          const angle = Math.atan2(centerY - end.y, centerX - end.x);

          // rotate the protractor model
          this.angleProperty.value += angle - startAngle;
          start = end;
        }
      }));

      // Rotate to match the protractor angle
      this.angleProperty.link(angle => {
        this.rotateAround(this.center, angle - this.getRotation());
      });
    }
    this.mutate(options);
  }
  reset() {
    this.angleProperty.reset();
  }

  /**
   * Creates an icon, to be used for toolboxes, checkboxes, etc.
   */
  static createIcon(options) {
    return new Image(protractor_png, options);
  }
}
sceneryPhet.register('ProtractorNode', ProtractorNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlNoYXBlIiwib3B0aW9uaXplIiwic2NlbmVyeVBoZXQiLCJwcm90cmFjdG9yX3BuZyIsIkRyYWdMaXN0ZW5lciIsIkltYWdlIiwiTm9kZSIsIlBhdGgiLCJQcm90cmFjdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImFuZ2xlIiwicm90YXRhYmxlIiwiY3Vyc29yIiwicHJvdHJhY3Rvcl9wbmdOb2RlIiwiaGl0VGVzdFBpeGVscyIsImFkZENoaWxkIiwiYW5nbGVQcm9wZXJ0eSIsInciLCJnZXRXaWR0aCIsImgiLCJnZXRIZWlnaHQiLCJvdXRlclJpbmdTaGFwZSIsIm1vdmVUbyIsImVsbGlwdGljYWxBcmMiLCJNYXRoIiwiUEkiLCJsaW5lVG8iLCJvdXRlclJpbmdQYXRoIiwic3Ryb2tlIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJkZXYiLCJzdGFydCIsImFkZElucHV0TGlzdGVuZXIiLCJldmVudCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJkcmFnIiwiZW5kIiwiY2VudGVyWCIsImdldENlbnRlclgiLCJjZW50ZXJZIiwiZ2V0Q2VudGVyWSIsInN0YXJ0QW5nbGUiLCJhdGFuMiIsInkiLCJ4IiwidmFsdWUiLCJsaW5rIiwicm90YXRlQXJvdW5kIiwiY2VudGVyIiwiZ2V0Um90YXRpb24iLCJtdXRhdGUiLCJyZXNldCIsImNyZWF0ZUljb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlByb3RyYWN0b3JOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByb3RyYWN0b3JOb2RlIGlzIGEgZGV2aWNlIGZvciBtZWFzdXJpbmcgYW5nbGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENoYW5kcmFzaGVrYXIgQmVtYWdvbmkgKEFjdHVhbCBDb25jZXB0cylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9zY2VuZXJ5UGhldC5qcyc7XHJcbmltcG9ydCBwcm90cmFjdG9yX3BuZyBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvbWlwbWFwcy9wcm90cmFjdG9yX3BuZy5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgSW1hZ2UsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIHdoZXRoZXIgdGhlIHByb3RyYWN0b3IgaXMgcm90YXRhYmxlIHZpYSB1c2VyIGludGVyYWN0aW9uXHJcbiAgcm90YXRhYmxlPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gdGhlIGluaXRpYWwgYW5nbGUgb2YgdGhlIHByb3RyYWN0b3IsIGluIHJhZGlhbnNcclxuICBhbmdsZT86IG51bWJlcjtcclxufTtcclxuZXhwb3J0IHR5cGUgUHJvdHJhY3Rvck5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb3RyYWN0b3JOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8vIGFuZ2xlIG9mIHRoZSBwcm90cmFjdG9yLCBpbiByYWRpYW5zXHJcbiAgcHVibGljIHJlYWRvbmx5IGFuZ2xlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUHJvdHJhY3Rvck5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UHJvdHJhY3Rvck5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgYW5nbGU6IDAsXHJcbiAgICAgIHJvdGF0YWJsZTogZmFsc2UsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEltYWdlXHJcbiAgICBjb25zdCBwcm90cmFjdG9yX3BuZ05vZGUgPSBuZXcgSW1hZ2UoIHByb3RyYWN0b3JfcG5nLCB7XHJcbiAgICAgIGhpdFRlc3RQaXhlbHM6IHRydWUgLy8gaGl0IHRlc3Qgb25seSBub24tdHJhbnNwYXJlbnQgcGl4ZWxzIGluIHRoZSBpbWFnZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcHJvdHJhY3Rvcl9wbmdOb2RlICk7XHJcblxyXG4gICAgdGhpcy5hbmdsZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmFuZ2xlICk7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnJvdGF0YWJsZSApIHtcclxuXHJcbiAgICAgIC8vIFVzZSBuaWNrbmFtZXMgZm9yIHdpZHRoIGFuZCBoZWlnaHQsIHRvIG1ha2UgdGhlIFNoYXBlIGNvZGUgZWFzaWVyIHRvIHVuZGVyc3RhbmQuXHJcbiAgICAgIGNvbnN0IHcgPSBwcm90cmFjdG9yX3BuZ05vZGUuZ2V0V2lkdGgoKTtcclxuICAgICAgY29uc3QgaCA9IHByb3RyYWN0b3JfcG5nTm9kZS5nZXRIZWlnaHQoKTtcclxuXHJcbiAgICAgIC8vIE91dGVyIHJpbmcgb2YgdGhlIHByb3RyYWN0b3IuIFNoYXBlIG11c3QgbWF0Y2ggcHJvdHJhY3Rvcl9wbmchXHJcbiAgICAgIGNvbnN0IG91dGVyUmluZ1NoYXBlID0gbmV3IFNoYXBlKClcclxuICAgICAgICAubW92ZVRvKCB3LCBoIC8gMiApXHJcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIHcgLyAyLCBoIC8gMiwgdyAvIDIsIGggLyAyLCAwLCAwLCBNYXRoLlBJLCB0cnVlIClcclxuICAgICAgICAubGluZVRvKCB3ICogMC4yLCBoIC8gMiApXHJcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIHcgLyAyLCBoIC8gMiwgdyAqIDAuMywgaCAqIDAuMywgMCwgTWF0aC5QSSwgMCwgZmFsc2UgKVxyXG4gICAgICAgIC5saW5lVG8oIHcsIGggLyAyIClcclxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggdyAvIDIsIGggLyAyLCB3IC8gMiwgaCAvIDIsIDAsIDAsIE1hdGguUEksIGZhbHNlIClcclxuICAgICAgICAubGluZVRvKCB3ICogMC4yLCBoIC8gMiApXHJcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIHcgLyAyLCBoIC8gMiwgdyAqIDAuMywgaCAqIDAuMywgMCwgTWF0aC5QSSwgMCwgdHJ1ZSApO1xyXG4gICAgICBjb25zdCBvdXRlclJpbmdQYXRoID0gbmV3IFBhdGgoIG91dGVyUmluZ1NoYXBlLCB7XHJcbiAgICAgICAgc3Ryb2tlOiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmRldiA/ICdyZWQnIDogbnVsbCAvLyBzaG93IHRoZSBTaGFwZSB3aXRoID9kZXZcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBvdXRlclJpbmdQYXRoICk7XHJcblxyXG4gICAgICAvLyBSb3RhdGUgdGhlIHByb3RyYWN0b3Igd2hlbiBpdHMgb3V0ZXIgcmluZyBpcyBkcmFnZ2VkLlxyXG4gICAgICBsZXQgc3RhcnQ6IFZlY3RvcjI7XHJcbiAgICAgIG91dGVyUmluZ1BhdGguYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgICBzdGFydCA9IHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIGNvbXB1dGUgdGhlIGNoYW5nZSBpbiBhbmdsZSBiYXNlZCBvbiB0aGUgbmV3IGRyYWcgZXZlbnRcclxuICAgICAgICAgIGNvbnN0IGVuZCA9IHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgICAgY29uc3QgY2VudGVyWCA9IHRoaXMuZ2V0Q2VudGVyWCgpO1xyXG4gICAgICAgICAgY29uc3QgY2VudGVyWSA9IHRoaXMuZ2V0Q2VudGVyWSgpO1xyXG4gICAgICAgICAgY29uc3Qgc3RhcnRBbmdsZSA9IE1hdGguYXRhbjIoIGNlbnRlclkgLSBzdGFydC55LCBjZW50ZXJYIC0gc3RhcnQueCApO1xyXG4gICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKCBjZW50ZXJZIC0gZW5kLnksIGNlbnRlclggLSBlbmQueCApO1xyXG5cclxuICAgICAgICAgIC8vIHJvdGF0ZSB0aGUgcHJvdHJhY3RvciBtb2RlbFxyXG4gICAgICAgICAgdGhpcy5hbmdsZVByb3BlcnR5LnZhbHVlICs9IGFuZ2xlIC0gc3RhcnRBbmdsZTtcclxuICAgICAgICAgIHN0YXJ0ID0gZW5kO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICAvLyBSb3RhdGUgdG8gbWF0Y2ggdGhlIHByb3RyYWN0b3IgYW5nbGVcclxuICAgICAgdGhpcy5hbmdsZVByb3BlcnR5LmxpbmsoIGFuZ2xlID0+IHtcclxuICAgICAgICB0aGlzLnJvdGF0ZUFyb3VuZCggdGhpcy5jZW50ZXIsIGFuZ2xlIC0gdGhpcy5nZXRSb3RhdGlvbigpICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5hbmdsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGljb24sIHRvIGJlIHVzZWQgZm9yIHRvb2xib3hlcywgY2hlY2tib3hlcywgZXRjLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlSWNvbiggb3B0aW9uczogTm9kZU9wdGlvbnMgKTogTm9kZSB7XHJcbiAgICByZXR1cm4gbmV3IEltYWdlKCBwcm90cmFjdG9yX3BuZywgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdQcm90cmFjdG9yTm9kZScsIFByb3RyYWN0b3JOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0saUNBQWlDO0FBRzVELFNBQVNDLEtBQUssUUFBUSwwQkFBMEI7QUFDaEQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUV2RCxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLGNBQWMsTUFBTSw4Q0FBOEM7QUFDekUsU0FBU0MsWUFBWSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBZUMsSUFBSSxR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