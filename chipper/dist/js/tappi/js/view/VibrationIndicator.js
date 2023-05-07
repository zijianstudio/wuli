// Copyright 2019-2022, University of Colorado Boulder

/**
 * A way to visualize haptic feedback. This is an icon that looks like a phone with zig zag lines around it to
 * represent vibration. When vibrating, the zig zags are visible and jostle around and the phone screen turns
 * a different color.
 *
 * @author Jesse Greenberg
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import { Shape } from '../../../kite/js/imports.js';
import { Circle, Node, Path, Rectangle } from '../../../scenery/js/imports.js';
import tappi from '../tappi.js';
class VibrationIndicator extends Node {
  /**
   * @param {BooleanProperty} vibratingProperty - vibration running?
   */
  constructor(vibratingProperty) {
    super();

    // @private {NumberProperty} - elapsed time for animation
    this.timeProperty = new NumberProperty(0);

    // @private
    this.vibratingProperty = vibratingProperty;

    // draw a phone
    const phoneBody = new Rectangle(0, 0, 40, 75, 4, 4, {
      fill: 'white'
    });
    const screen = new Rectangle(0, 0, phoneBody.width - 5, phoneBody.height - 20, {
      fill: 'white',
      center: phoneBody.center
    });
    const homeButton = new Circle(2, {
      fill: 'black',
      center: phoneBody.centerBottom.minusXY(0, 5)
    });
    const speaker = new Rectangle(0, 0, phoneBody.width * 0.35, phoneBody.height * 0.03, 4, 4, {
      fill: 'black',
      center: phoneBody.centerTop.plusXY(0, 5)
    });
    phoneBody.addChild(screen);
    phoneBody.addChild(homeButton);
    phoneBody.addChild(speaker);

    // vibration indicators
    const vibrationShape = new Shape();
    vibrationShape.moveTo(0, 0);
    vibrationShape.zigZagTo(0, screen.height, phoneBody.width * 0.10, 3, true);
    const leftVibrationCenter = phoneBody.leftCenter.minusXY(8, 0);
    const rightVibrationCenter = phoneBody.rightCenter.plusXY(8, 0);
    this.leftVibrationPath = new Path(vibrationShape, {
      stroke: 'orange',
      lineWidth: 4,
      rightCenter: leftVibrationCenter
    });
    this.leftVibrationPath.setScaleMagnitude(-1, 1);
    this.rightVibrationPath = new Path(vibrationShape, {
      stroke: 'orange',
      lineWidth: 4,
      leftCenter: rightVibrationCenter
    });
    phoneBody.addChild(this.leftVibrationPath);
    phoneBody.addChild(this.rightVibrationPath);
    const panel = new Rectangle(0, 0, phoneBody.width, phoneBody.height + 10, 5, 5, {
      fill: 'black'
    });
    phoneBody.center = panel.center;
    panel.addChild(phoneBody);
    this.addChild(panel);
    this.vibratingProperty.link(vibrating => {
      screen.fill = vibrating ? 'lightblue' : 'grey';
      this.leftVibrationPath.visible = vibrating;
      this.rightVibrationPath.visible = vibrating;

      // when vibration stops, reset the vibration icons back to their initial positions
      this.leftVibrationPath.center = leftVibrationCenter;
      this.rightVibrationPath.center = rightVibrationCenter;
    });
  }

  /**
   * Animate the indicator if vibrating.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.timeProperty.set(this.timeProperty.get() + dt);
    if (this.vibratingProperty.get()) {
      const xJostle = -Math.sin(this.timeProperty.get() * 70);
      const yJostle = 0.5 * Math.sin(this.timeProperty.get() * 10);
      this.rightVibrationPath.translate(xJostle, yJostle);
      this.leftVibrationPath.translate(xJostle, yJostle);
    }
  }
}
tappi.register('VibrationIndicator', VibrationIndicator);
export default VibrationIndicator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlNoYXBlIiwiQ2lyY2xlIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJ0YXBwaSIsIlZpYnJhdGlvbkluZGljYXRvciIsImNvbnN0cnVjdG9yIiwidmlicmF0aW5nUHJvcGVydHkiLCJ0aW1lUHJvcGVydHkiLCJwaG9uZUJvZHkiLCJmaWxsIiwic2NyZWVuIiwid2lkdGgiLCJoZWlnaHQiLCJjZW50ZXIiLCJob21lQnV0dG9uIiwiY2VudGVyQm90dG9tIiwibWludXNYWSIsInNwZWFrZXIiLCJjZW50ZXJUb3AiLCJwbHVzWFkiLCJhZGRDaGlsZCIsInZpYnJhdGlvblNoYXBlIiwibW92ZVRvIiwiemlnWmFnVG8iLCJsZWZ0VmlicmF0aW9uQ2VudGVyIiwibGVmdENlbnRlciIsInJpZ2h0VmlicmF0aW9uQ2VudGVyIiwicmlnaHRDZW50ZXIiLCJsZWZ0VmlicmF0aW9uUGF0aCIsInN0cm9rZSIsImxpbmVXaWR0aCIsInNldFNjYWxlTWFnbml0dWRlIiwicmlnaHRWaWJyYXRpb25QYXRoIiwicGFuZWwiLCJsaW5rIiwidmlicmF0aW5nIiwidmlzaWJsZSIsInN0ZXAiLCJkdCIsInNldCIsImdldCIsInhKb3N0bGUiLCJNYXRoIiwic2luIiwieUpvc3RsZSIsInRyYW5zbGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmlicmF0aW9uSW5kaWNhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgd2F5IHRvIHZpc3VhbGl6ZSBoYXB0aWMgZmVlZGJhY2suIFRoaXMgaXMgYW4gaWNvbiB0aGF0IGxvb2tzIGxpa2UgYSBwaG9uZSB3aXRoIHppZyB6YWcgbGluZXMgYXJvdW5kIGl0IHRvXHJcbiAqIHJlcHJlc2VudCB2aWJyYXRpb24uIFdoZW4gdmlicmF0aW5nLCB0aGUgemlnIHphZ3MgYXJlIHZpc2libGUgYW5kIGpvc3RsZSBhcm91bmQgYW5kIHRoZSBwaG9uZSBzY3JlZW4gdHVybnNcclxuICogYSBkaWZmZXJlbnQgY29sb3IuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHRhcHBpIGZyb20gJy4uL3RhcHBpLmpzJztcclxuXHJcbmNsYXNzIFZpYnJhdGlvbkluZGljYXRvciBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gdmlicmF0aW5nUHJvcGVydHkgLSB2aWJyYXRpb24gcnVubmluZz9cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdmlicmF0aW5nUHJvcGVydHkgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOdW1iZXJQcm9wZXJ0eX0gLSBlbGFwc2VkIHRpbWUgZm9yIGFuaW1hdGlvblxyXG4gICAgdGhpcy50aW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy52aWJyYXRpbmdQcm9wZXJ0eSA9IHZpYnJhdGluZ1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIGRyYXcgYSBwaG9uZVxyXG4gICAgY29uc3QgcGhvbmVCb2R5ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgNDAsIDc1LCA0LCA0LCB7IGZpbGw6ICd3aGl0ZScgfSApO1xyXG4gICAgY29uc3Qgc2NyZWVuID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgcGhvbmVCb2R5LndpZHRoIC0gNSwgcGhvbmVCb2R5LmhlaWdodCAtIDIwLCB7XHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIGNlbnRlcjogcGhvbmVCb2R5LmNlbnRlclxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgaG9tZUJ1dHRvbiA9IG5ldyBDaXJjbGUoIDIsIHtcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgY2VudGVyOiBwaG9uZUJvZHkuY2VudGVyQm90dG9tLm1pbnVzWFkoIDAsIDUgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3BlYWtlciA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHBob25lQm9keS53aWR0aCAqIDAuMzUsIHBob25lQm9keS5oZWlnaHQgKiAwLjAzLCA0LCA0LCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIGNlbnRlcjogcGhvbmVCb2R5LmNlbnRlclRvcC5wbHVzWFkoIDAsIDUgKVxyXG4gICAgfSApO1xyXG4gICAgcGhvbmVCb2R5LmFkZENoaWxkKCBzY3JlZW4gKTtcclxuICAgIHBob25lQm9keS5hZGRDaGlsZCggaG9tZUJ1dHRvbiApO1xyXG4gICAgcGhvbmVCb2R5LmFkZENoaWxkKCBzcGVha2VyICk7XHJcblxyXG4gICAgLy8gdmlicmF0aW9uIGluZGljYXRvcnNcclxuICAgIGNvbnN0IHZpYnJhdGlvblNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICB2aWJyYXRpb25TaGFwZS5tb3ZlVG8oIDAsIDAgKTtcclxuICAgIHZpYnJhdGlvblNoYXBlLnppZ1phZ1RvKCAwLCBzY3JlZW4uaGVpZ2h0LCBwaG9uZUJvZHkud2lkdGggKiAwLjEwLCAzLCB0cnVlICk7XHJcblxyXG4gICAgY29uc3QgbGVmdFZpYnJhdGlvbkNlbnRlciA9IHBob25lQm9keS5sZWZ0Q2VudGVyLm1pbnVzWFkoIDgsIDAgKTtcclxuICAgIGNvbnN0IHJpZ2h0VmlicmF0aW9uQ2VudGVyID0gcGhvbmVCb2R5LnJpZ2h0Q2VudGVyLnBsdXNYWSggOCwgMCApO1xyXG5cclxuICAgIHRoaXMubGVmdFZpYnJhdGlvblBhdGggPSBuZXcgUGF0aCggdmlicmF0aW9uU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiAnb3JhbmdlJyxcclxuICAgICAgbGluZVdpZHRoOiA0LFxyXG4gICAgICByaWdodENlbnRlcjogbGVmdFZpYnJhdGlvbkNlbnRlclxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5sZWZ0VmlicmF0aW9uUGF0aC5zZXRTY2FsZU1hZ25pdHVkZSggLTEsIDEgKTtcclxuXHJcbiAgICB0aGlzLnJpZ2h0VmlicmF0aW9uUGF0aCA9IG5ldyBQYXRoKCB2aWJyYXRpb25TaGFwZSwge1xyXG4gICAgICBzdHJva2U6ICdvcmFuZ2UnLFxyXG4gICAgICBsaW5lV2lkdGg6IDQsXHJcbiAgICAgIGxlZnRDZW50ZXI6IHJpZ2h0VmlicmF0aW9uQ2VudGVyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgcGhvbmVCb2R5LmFkZENoaWxkKCB0aGlzLmxlZnRWaWJyYXRpb25QYXRoICk7XHJcbiAgICBwaG9uZUJvZHkuYWRkQ2hpbGQoIHRoaXMucmlnaHRWaWJyYXRpb25QYXRoICk7XHJcblxyXG4gICAgY29uc3QgcGFuZWwgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBwaG9uZUJvZHkud2lkdGgsIHBob25lQm9keS5oZWlnaHQgKyAxMCwgNSwgNSwge1xyXG4gICAgICBmaWxsOiAnYmxhY2snXHJcbiAgICB9ICk7XHJcbiAgICBwaG9uZUJvZHkuY2VudGVyID0gcGFuZWwuY2VudGVyO1xyXG4gICAgcGFuZWwuYWRkQ2hpbGQoIHBob25lQm9keSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBhbmVsICk7XHJcblxyXG4gICAgdGhpcy52aWJyYXRpbmdQcm9wZXJ0eS5saW5rKCB2aWJyYXRpbmcgPT4ge1xyXG4gICAgICBzY3JlZW4uZmlsbCA9IHZpYnJhdGluZyA/ICdsaWdodGJsdWUnIDogJ2dyZXknO1xyXG5cclxuICAgICAgdGhpcy5sZWZ0VmlicmF0aW9uUGF0aC52aXNpYmxlID0gdmlicmF0aW5nO1xyXG4gICAgICB0aGlzLnJpZ2h0VmlicmF0aW9uUGF0aC52aXNpYmxlID0gdmlicmF0aW5nO1xyXG5cclxuICAgICAgLy8gd2hlbiB2aWJyYXRpb24gc3RvcHMsIHJlc2V0IHRoZSB2aWJyYXRpb24gaWNvbnMgYmFjayB0byB0aGVpciBpbml0aWFsIHBvc2l0aW9uc1xyXG4gICAgICB0aGlzLmxlZnRWaWJyYXRpb25QYXRoLmNlbnRlciA9IGxlZnRWaWJyYXRpb25DZW50ZXI7XHJcbiAgICAgIHRoaXMucmlnaHRWaWJyYXRpb25QYXRoLmNlbnRlciA9IHJpZ2h0VmlicmF0aW9uQ2VudGVyO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0ZSB0aGUgaW5kaWNhdG9yIGlmIHZpYnJhdGluZy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMudGltZVByb3BlcnR5LnNldCggdGhpcy50aW1lUHJvcGVydHkuZ2V0KCkgKyBkdCApO1xyXG5cclxuICAgIGlmICggdGhpcy52aWJyYXRpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgY29uc3QgeEpvc3RsZSA9IC1NYXRoLnNpbiggdGhpcy50aW1lUHJvcGVydHkuZ2V0KCkgKiA3MCApO1xyXG4gICAgICBjb25zdCB5Sm9zdGxlID0gMC41ICogTWF0aC5zaW4oIHRoaXMudGltZVByb3BlcnR5LmdldCgpICogMTAgKTtcclxuXHJcbiAgICAgIHRoaXMucmlnaHRWaWJyYXRpb25QYXRoLnRyYW5zbGF0ZSggeEpvc3RsZSwgeUpvc3RsZSApO1xyXG4gICAgICB0aGlzLmxlZnRWaWJyYXRpb25QYXRoLnRyYW5zbGF0ZSggeEpvc3RsZSwgeUpvc3RsZSApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxudGFwcGkucmVnaXN0ZXIoICdWaWJyYXRpb25JbmRpY2F0b3InLCBWaWJyYXRpb25JbmRpY2F0b3IgKTtcclxuZXhwb3J0IGRlZmF1bHQgVmlicmF0aW9uSW5kaWNhdG9yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxTQUFTQyxLQUFLLFFBQVEsNkJBQTZCO0FBQ25ELFNBQVNDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxnQ0FBZ0M7QUFDOUUsT0FBT0MsS0FBSyxNQUFNLGFBQWE7QUFFL0IsTUFBTUMsa0JBQWtCLFNBQVNKLElBQUksQ0FBQztFQUVwQztBQUNGO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsaUJBQWlCLEVBQUc7SUFDL0IsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxJQUFJLENBQUNDLFlBQVksR0FBRyxJQUFJVixjQUFjLENBQUUsQ0FBRSxDQUFDOztJQUUzQztJQUNBLElBQUksQ0FBQ1MsaUJBQWlCLEdBQUdBLGlCQUFpQjs7SUFFMUM7SUFDQSxNQUFNRSxTQUFTLEdBQUcsSUFBSU4sU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQUVPLElBQUksRUFBRTtJQUFRLENBQUUsQ0FBQztJQUN4RSxNQUFNQyxNQUFNLEdBQUcsSUFBSVIsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVNLFNBQVMsQ0FBQ0csS0FBSyxHQUFHLENBQUMsRUFBRUgsU0FBUyxDQUFDSSxNQUFNLEdBQUcsRUFBRSxFQUFFO01BQzlFSCxJQUFJLEVBQUUsT0FBTztNQUNiSSxNQUFNLEVBQUVMLFNBQVMsQ0FBQ0s7SUFDcEIsQ0FBRSxDQUFDO0lBQ0gsTUFBTUMsVUFBVSxHQUFHLElBQUlmLE1BQU0sQ0FBRSxDQUFDLEVBQUU7TUFDaENVLElBQUksRUFBRSxPQUFPO01BQ2JJLE1BQU0sRUFBRUwsU0FBUyxDQUFDTyxZQUFZ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