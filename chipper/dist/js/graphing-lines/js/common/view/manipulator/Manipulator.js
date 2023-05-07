// Copyright 2013-2023, University of Colorado Boulder

/**
 * Base type for all line manipulators.
 * A pseudo-3D sphere with a halo that appears during interactions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../../phet-core/js/optionize.js';
import ShadedSphereNode from '../../../../../scenery-phet/js/ShadedSphereNode.js';
import { Circle, Color, Node, PressListener } from '../../../../../scenery/js/imports.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import graphingLines from '../../../graphingLines.js';
export default class Manipulator extends Node {
  /**
   * @param radius radius of the sphere
   * @param color base color used to shade the sphere
   * @param [providedOptions]
   */
  constructor(radius, color, providedOptions) {
    const mainColor = Color.toColor(color);
    const options = optionize()({
      haloAlpha: 0.5,
      // ShadedSphereNodeOptions
      mainColor: mainColor,
      highlightColor: Color.WHITE,
      shadowColor: mainColor.darkerColor(),
      lineWidth: 1,
      stroke: mainColor.darkerColor(),
      // NodeOptions
      cursor: 'pointer',
      mouseArea: Shape.circle(0, 0, 1.5 * radius),
      touchArea: Shape.circle(0, 0, 1.5 * radius)
    }, providedOptions);
    super();

    // add a halo only if alpha it will be visible, useful for creating non-interactive manipulator icons
    if (options.haloAlpha !== 0) {
      const haloNode = new Circle(1.75 * radius, {
        fill: mainColor.withAlpha(options.haloAlpha),
        pickable: false,
        visible: false,
        renderer: 'canvas' // Workaround for Firefox graphics artifacts, see phetsims/graphing-lines/issues/119
      });

      this.addChild(haloNode);

      // halo visibility
      const pressListener = new PressListener({
        attach: false,
        tandem: Tandem.OPT_OUT
      });
      pressListener.isHighlightedProperty.link(isHighlighted => {
        haloNode.visible = isHighlighted;
      });
      this.addInputListener(pressListener);
    }
    const sphereNode = new ShadedSphereNode(2 * radius, {
      mainColor: options.mainColor,
      highlightColor: options.highlightColor,
      shadowColor: options.shadowColor,
      lineWidth: options.lineWidth,
      stroke: options.stroke
    });
    this.addChild(sphereNode);
    this.mutate(options);
  }

  /**
   * Creates a non-interactive manipulator icon.
   */
  static createIcon(radius, color, providedOptions) {
    // turn off options related to interactivity, see constructor
    const options = combineOptions({}, providedOptions, {
      haloAlpha: 0,
      pickable: false,
      mouseArea: null,
      touchArea: null
    });
    return new Manipulator(radius, color, options);
  }
}
graphingLines.register('Manipulator', Manipulator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiU2hhZGVkU3BoZXJlTm9kZSIsIkNpcmNsZSIsIkNvbG9yIiwiTm9kZSIsIlByZXNzTGlzdGVuZXIiLCJUYW5kZW0iLCJncmFwaGluZ0xpbmVzIiwiTWFuaXB1bGF0b3IiLCJjb25zdHJ1Y3RvciIsInJhZGl1cyIsImNvbG9yIiwicHJvdmlkZWRPcHRpb25zIiwibWFpbkNvbG9yIiwidG9Db2xvciIsIm9wdGlvbnMiLCJoYWxvQWxwaGEiLCJoaWdobGlnaHRDb2xvciIsIldISVRFIiwic2hhZG93Q29sb3IiLCJkYXJrZXJDb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsImN1cnNvciIsIm1vdXNlQXJlYSIsImNpcmNsZSIsInRvdWNoQXJlYSIsImhhbG9Ob2RlIiwiZmlsbCIsIndpdGhBbHBoYSIsInBpY2thYmxlIiwidmlzaWJsZSIsInJlbmRlcmVyIiwiYWRkQ2hpbGQiLCJwcmVzc0xpc3RlbmVyIiwiYXR0YWNoIiwidGFuZGVtIiwiT1BUX09VVCIsImlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eSIsImxpbmsiLCJpc0hpZ2hsaWdodGVkIiwiYWRkSW5wdXRMaXN0ZW5lciIsInNwaGVyZU5vZGUiLCJtdXRhdGUiLCJjcmVhdGVJY29uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYW5pcHVsYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHR5cGUgZm9yIGFsbCBsaW5lIG1hbmlwdWxhdG9ycy5cclxuICogQSBwc2V1ZG8tM0Qgc3BoZXJlIHdpdGggYSBoYWxvIHRoYXQgYXBwZWFycyBkdXJpbmcgaW50ZXJhY3Rpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgU2hhZGVkU3BoZXJlTm9kZSwgeyBTaGFkZWRTcGhlcmVOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkZWRTcGhlcmVOb2RlLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgTm9kZSwgTm9kZU9wdGlvbnMsIFByZXNzTGlzdGVuZXIsIFRDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gQWxwaGEgY2hhbm5lbCBvZiB0aGUgaGFsbywgWzAsMV0uIFNldHRpbmcgdGhpcyB0byAwIHJlc3VsdHMgaW4gbm8gaGFsby5cclxuICBoYWxvQWxwaGE/OiBudW1iZXI7XHJcbn0gJiBQaWNrT3B0aW9uYWw8U2hhZGVkU3BoZXJlTm9kZU9wdGlvbnMsICdtYWluQ29sb3InIHwgJ2hpZ2hsaWdodENvbG9yJyB8ICdzaGFkb3dDb2xvcicgfCAnbGluZVdpZHRoJyB8ICdzdHJva2UnPjtcclxuXHJcbmV4cG9ydCB0eXBlIE1hbmlwdWxhdG9yT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYW5pcHVsYXRvciBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gcmFkaXVzIHJhZGl1cyBvZiB0aGUgc3BoZXJlXHJcbiAgICogQHBhcmFtIGNvbG9yIGJhc2UgY29sb3IgdXNlZCB0byBzaGFkZSB0aGUgc3BoZXJlXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCByYWRpdXM6IG51bWJlciwgY29sb3I6IFRDb2xvciwgcHJvdmlkZWRPcHRpb25zPzogTWFuaXB1bGF0b3JPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG1haW5Db2xvciA9IENvbG9yLnRvQ29sb3IoIGNvbG9yICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNYW5pcHVsYXRvck9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgaGFsb0FscGhhOiAwLjUsXHJcblxyXG4gICAgICAvLyBTaGFkZWRTcGhlcmVOb2RlT3B0aW9uc1xyXG4gICAgICBtYWluQ29sb3I6IG1haW5Db2xvcixcclxuICAgICAgaGlnaGxpZ2h0Q29sb3I6IENvbG9yLldISVRFLFxyXG4gICAgICBzaGFkb3dDb2xvcjogbWFpbkNvbG9yLmRhcmtlckNvbG9yKCksXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgc3Ryb2tlOiBtYWluQ29sb3IuZGFya2VyQ29sb3IoKSxcclxuXHJcbiAgICAgIC8vIE5vZGVPcHRpb25zXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICBtb3VzZUFyZWE6IFNoYXBlLmNpcmNsZSggMCwgMCwgMS41ICogcmFkaXVzICksXHJcbiAgICAgIHRvdWNoQXJlYTogU2hhcGUuY2lyY2xlKCAwLCAwLCAxLjUgKiByYWRpdXMgKVxyXG5cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gYWRkIGEgaGFsbyBvbmx5IGlmIGFscGhhIGl0IHdpbGwgYmUgdmlzaWJsZSwgdXNlZnVsIGZvciBjcmVhdGluZyBub24taW50ZXJhY3RpdmUgbWFuaXB1bGF0b3IgaWNvbnNcclxuICAgIGlmICggb3B0aW9ucy5oYWxvQWxwaGEgIT09IDAgKSB7XHJcblxyXG4gICAgICBjb25zdCBoYWxvTm9kZSA9IG5ldyBDaXJjbGUoIDEuNzUgKiByYWRpdXMsIHtcclxuICAgICAgICBmaWxsOiBtYWluQ29sb3Iud2l0aEFscGhhKCBvcHRpb25zLmhhbG9BbHBoYSApLFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICByZW5kZXJlcjogJ2NhbnZhcycgLy8gV29ya2Fyb3VuZCBmb3IgRmlyZWZveCBncmFwaGljcyBhcnRpZmFjdHMsIHNlZSBwaGV0c2ltcy9ncmFwaGluZy1saW5lcy9pc3N1ZXMvMTE5XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggaGFsb05vZGUgKTtcclxuXHJcbiAgICAgIC8vIGhhbG8gdmlzaWJpbGl0eVxyXG4gICAgICBjb25zdCBwcmVzc0xpc3RlbmVyID0gbmV3IFByZXNzTGlzdGVuZXIoIHtcclxuICAgICAgICBhdHRhY2g6IGZhbHNlLFxyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgICAgfSApO1xyXG4gICAgICBwcmVzc0xpc3RlbmVyLmlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eS5saW5rKCBpc0hpZ2hsaWdodGVkID0+IHtcclxuICAgICAgICBoYWxvTm9kZS52aXNpYmxlID0gaXNIaWdobGlnaHRlZDtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHByZXNzTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzcGhlcmVOb2RlID0gbmV3IFNoYWRlZFNwaGVyZU5vZGUoIDIgKiByYWRpdXMsIHtcclxuICAgICAgbWFpbkNvbG9yOiBvcHRpb25zLm1haW5Db2xvcixcclxuICAgICAgaGlnaGxpZ2h0Q29sb3I6IG9wdGlvbnMuaGlnaGxpZ2h0Q29sb3IsXHJcbiAgICAgIHNoYWRvd0NvbG9yOiBvcHRpb25zLnNoYWRvd0NvbG9yLFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoLFxyXG4gICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzcGhlcmVOb2RlICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBub24taW50ZXJhY3RpdmUgbWFuaXB1bGF0b3IgaWNvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUljb24oIHJhZGl1czogbnVtYmVyLCBjb2xvcjogVENvbG9yLCBwcm92aWRlZE9wdGlvbnM/OiBNYW5pcHVsYXRvck9wdGlvbnMgKTogTWFuaXB1bGF0b3Ige1xyXG5cclxuICAgIC8vIHR1cm4gb2ZmIG9wdGlvbnMgcmVsYXRlZCB0byBpbnRlcmFjdGl2aXR5LCBzZWUgY29uc3RydWN0b3JcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxNYW5pcHVsYXRvck9wdGlvbnM+KCB7fSwgcHJvdmlkZWRPcHRpb25zLCB7XHJcbiAgICAgIGhhbG9BbHBoYTogMCxcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICBtb3VzZUFyZWE6IG51bGwsXHJcbiAgICAgIHRvdWNoQXJlYTogbnVsbFxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgTWFuaXB1bGF0b3IoIHJhZGl1cywgY29sb3IsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdNYW5pcHVsYXRvcicsIE1hbmlwdWxhdG9yICk7Il0sIm1hcHBp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