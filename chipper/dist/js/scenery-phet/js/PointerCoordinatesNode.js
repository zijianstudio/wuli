// Copyright 2019-2023, University of Colorado Boulder

/**
 * Shows the model and view coordinates that correspond to the cursor position.
 * Originally implemented for use in gas-properties, where it was used exclusively for debugging.
 * CAUTION! This adds a listener to the Display, see notes below.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../dot/js/Utils.js';
import getGlobal from '../../phet-core/js/getGlobal.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Rectangle, RichText } from '../../scenery/js/imports.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
const DEFAULT_FONT = new PhetFont(14);
// not propagated to super!

export default class PointerCoordinatesNode extends Node {
  /**
   * @param modelViewTransform
   * @param providedOptions - not propagated to super!
   */
  constructor(modelViewTransform, providedOptions) {
    const options = optionize()({
      display: getGlobal('phet.joist.display'),
      pickable: false,
      font: DEFAULT_FONT,
      textColor: 'black',
      align: 'center',
      modelDecimalPlaces: 1,
      viewDecimalPlaces: 0,
      backgroundColor: 'rgba( 255, 255, 255, 0.5 )'
    }, providedOptions);
    const textNode = new RichText('', {
      font: options.font,
      fill: options.textColor,
      align: options.align
    });
    const backgroundNode = new Rectangle(0, 0, 1, 1, {
      fill: options.backgroundColor
    });
    super({
      children: [backgroundNode, textNode],
      pickable: false
    });

    // Update the coordinates to match the pointer position.
    // Add the input listener to the Display, so that other things in the sim will receive events.
    // Scenery does not support having one event sent through two different trails.
    // Note that this will continue to receive events when the current screen is inactive!
    options.display.addInputListener({
      move: event => {
        // (x,y) in view coordinates
        const viewPoint = this.globalToParentPoint(event.pointer.point);
        const xView = Utils.toFixed(viewPoint.x, options.viewDecimalPlaces);
        const yView = Utils.toFixed(viewPoint.y, options.viewDecimalPlaces);

        // (x,y) in model coordinates
        const modelPoint = modelViewTransform.viewToModelPosition(viewPoint);
        const xModel = Utils.toFixed(modelPoint.x, options.modelDecimalPlaces);
        const yModel = Utils.toFixed(modelPoint.y, options.modelDecimalPlaces);

        // Update coordinates display.
        textNode.string = `(${xView},${yView})<br>(${xModel},${yModel})`;

        // Resize background
        backgroundNode.setRect(0, 0, textNode.width + 4, textNode.height + 4);
        textNode.center = backgroundNode.center;

        // Center above the cursor.
        this.centerX = viewPoint.x;
        this.bottom = viewPoint.y - 3;
      }
    });
  }
}
sceneryPhet.register('PointerCoordinatesNode', PointerCoordinatesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsImdldEdsb2JhbCIsIm9wdGlvbml6ZSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJERUZBVUxUX0ZPTlQiLCJQb2ludGVyQ29vcmRpbmF0ZXNOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZGlzcGxheSIsInBpY2thYmxlIiwiZm9udCIsInRleHRDb2xvciIsImFsaWduIiwibW9kZWxEZWNpbWFsUGxhY2VzIiwidmlld0RlY2ltYWxQbGFjZXMiLCJiYWNrZ3JvdW5kQ29sb3IiLCJ0ZXh0Tm9kZSIsImZpbGwiLCJiYWNrZ3JvdW5kTm9kZSIsImNoaWxkcmVuIiwiYWRkSW5wdXRMaXN0ZW5lciIsIm1vdmUiLCJldmVudCIsInZpZXdQb2ludCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJ4VmlldyIsInRvRml4ZWQiLCJ4IiwieVZpZXciLCJ5IiwibW9kZWxQb2ludCIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJ4TW9kZWwiLCJ5TW9kZWwiLCJzdHJpbmciLCJzZXRSZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJjZW50ZXIiLCJjZW50ZXJYIiwiYm90dG9tIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb2ludGVyQ29vcmRpbmF0ZXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIHRoZSBtb2RlbCBhbmQgdmlldyBjb29yZGluYXRlcyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGN1cnNvciBwb3NpdGlvbi5cclxuICogT3JpZ2luYWxseSBpbXBsZW1lbnRlZCBmb3IgdXNlIGluIGdhcy1wcm9wZXJ0aWVzLCB3aGVyZSBpdCB3YXMgdXNlZCBleGNsdXNpdmVseSBmb3IgZGVidWdnaW5nLlxyXG4gKiBDQVVUSU9OISBUaGlzIGFkZHMgYSBsaXN0ZW5lciB0byB0aGUgRGlzcGxheSwgc2VlIG5vdGVzIGJlbG93LlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgZ2V0R2xvYmFsIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9nZXRHbG9iYWwuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCB7IERpc3BsYXksIEZvbnQsIFRDb2xvciwgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgUmljaFRleHRBbGlnbiwgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcblxyXG5jb25zdCBERUZBVUxUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICBkaXNwbGF5PzogRGlzcGxheTtcclxuICBwaWNrYWJsZT86IGJvb2xlYW47XHJcblxyXG4gIC8vIFJpY2hUZXh0XHJcbiAgZm9udD86IEZvbnQ7XHJcbiAgdGV4dENvbG9yPzogVENvbG9yO1xyXG4gIGFsaWduPzogUmljaFRleHRBbGlnbjtcclxuICBtb2RlbERlY2ltYWxQbGFjZXM/OiBudW1iZXI7XHJcbiAgdmlld0RlY2ltYWxQbGFjZXM/OiBudW1iZXI7XHJcblxyXG4gIC8vIFJlY3RhbmdsZVxyXG4gIGJhY2tncm91bmRDb2xvcj86IFRDb2xvcjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFBvaW50ZXJDb29yZGluYXRlc05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnM7IC8vIG5vdCBwcm9wYWdhdGVkIHRvIHN1cGVyIVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9pbnRlckNvb3JkaW5hdGVzTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9ucyAtIG5vdCBwcm9wYWdhdGVkIHRvIHN1cGVyIVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBwcm92aWRlZE9wdGlvbnM/OiBQb2ludGVyQ29vcmRpbmF0ZXNOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFBvaW50ZXJDb29yZGluYXRlc05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucz4oKSgge1xyXG4gICAgICBkaXNwbGF5OiBnZXRHbG9iYWwoICdwaGV0LmpvaXN0LmRpc3BsYXknICksXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgZm9udDogREVGQVVMVF9GT05ULFxyXG4gICAgICB0ZXh0Q29sb3I6ICdibGFjaycsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgbW9kZWxEZWNpbWFsUGxhY2VzOiAxLFxyXG4gICAgICB2aWV3RGVjaW1hbFBsYWNlczogMCxcclxuICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSggMjU1LCAyNTUsIDI1NSwgMC41ICknXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0Tm9kZSA9IG5ldyBSaWNoVGV4dCggJycsIHtcclxuICAgICAgZm9udDogb3B0aW9ucy5mb250LFxyXG4gICAgICBmaWxsOiBvcHRpb25zLnRleHRDb2xvcixcclxuICAgICAgYWxpZ246IG9wdGlvbnMuYWxpZ25cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIDEsIHtcclxuICAgICAgZmlsbDogb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3JcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogWyBiYWNrZ3JvdW5kTm9kZSwgdGV4dE5vZGUgXSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBjb29yZGluYXRlcyB0byBtYXRjaCB0aGUgcG9pbnRlciBwb3NpdGlvbi5cclxuICAgIC8vIEFkZCB0aGUgaW5wdXQgbGlzdGVuZXIgdG8gdGhlIERpc3BsYXksIHNvIHRoYXQgb3RoZXIgdGhpbmdzIGluIHRoZSBzaW0gd2lsbCByZWNlaXZlIGV2ZW50cy5cclxuICAgIC8vIFNjZW5lcnkgZG9lcyBub3Qgc3VwcG9ydCBoYXZpbmcgb25lIGV2ZW50IHNlbnQgdGhyb3VnaCB0d28gZGlmZmVyZW50IHRyYWlscy5cclxuICAgIC8vIE5vdGUgdGhhdCB0aGlzIHdpbGwgY29udGludWUgdG8gcmVjZWl2ZSBldmVudHMgd2hlbiB0aGUgY3VycmVudCBzY3JlZW4gaXMgaW5hY3RpdmUhXHJcbiAgICBvcHRpb25zLmRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICBtb3ZlOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vICh4LHkpIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgICAgICBjb25zdCB2aWV3UG9pbnQgPSB0aGlzLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcclxuICAgICAgICBjb25zdCB4VmlldyA9IFV0aWxzLnRvRml4ZWQoIHZpZXdQb2ludC54LCBvcHRpb25zLnZpZXdEZWNpbWFsUGxhY2VzICk7XHJcbiAgICAgICAgY29uc3QgeVZpZXcgPSBVdGlscy50b0ZpeGVkKCB2aWV3UG9pbnQueSwgb3B0aW9ucy52aWV3RGVjaW1hbFBsYWNlcyApO1xyXG5cclxuICAgICAgICAvLyAoeCx5KSBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgICAgIGNvbnN0IG1vZGVsUG9pbnQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggdmlld1BvaW50ICk7XHJcbiAgICAgICAgY29uc3QgeE1vZGVsID0gVXRpbHMudG9GaXhlZCggbW9kZWxQb2ludC54LCBvcHRpb25zLm1vZGVsRGVjaW1hbFBsYWNlcyApO1xyXG4gICAgICAgIGNvbnN0IHlNb2RlbCA9IFV0aWxzLnRvRml4ZWQoIG1vZGVsUG9pbnQueSwgb3B0aW9ucy5tb2RlbERlY2ltYWxQbGFjZXMgKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGNvb3JkaW5hdGVzIGRpc3BsYXkuXHJcbiAgICAgICAgdGV4dE5vZGUuc3RyaW5nID0gYCgke3hWaWV3fSwke3lWaWV3fSk8YnI+KCR7eE1vZGVsfSwke3lNb2RlbH0pYDtcclxuXHJcbiAgICAgICAgLy8gUmVzaXplIGJhY2tncm91bmRcclxuICAgICAgICBiYWNrZ3JvdW5kTm9kZS5zZXRSZWN0KCAwLCAwLCB0ZXh0Tm9kZS53aWR0aCArIDQsIHRleHROb2RlLmhlaWdodCArIDQgKTtcclxuICAgICAgICB0ZXh0Tm9kZS5jZW50ZXIgPSBiYWNrZ3JvdW5kTm9kZS5jZW50ZXI7XHJcblxyXG4gICAgICAgIC8vIENlbnRlciBhYm92ZSB0aGUgY3Vyc29yLlxyXG4gICAgICAgIHRoaXMuY2VudGVyWCA9IHZpZXdQb2ludC54O1xyXG4gICAgICAgIHRoaXMuYm90dG9tID0gdmlld1BvaW50LnkgLSAzO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1BvaW50ZXJDb29yZGluYXRlc05vZGUnLCBQb2ludGVyQ29vcmRpbmF0ZXNOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sdUJBQXVCO0FBQ3pDLE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUV2RCxTQUFnQ0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFFBQVEsUUFBcUMsNkJBQTZCO0FBQzNILE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBQ3BDLE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFFMUMsTUFBTUMsWUFBWSxHQUFHLElBQUlGLFFBQVEsQ0FBRSxFQUFHLENBQUM7QUFrQmtCOztBQUV6RCxlQUFlLE1BQU1HLHNCQUFzQixTQUFTTixJQUFJLENBQUM7RUFFdkQ7QUFDRjtBQUNBO0FBQ0E7RUFDU08sV0FBV0EsQ0FBRUMsa0JBQXVDLEVBQUVDLGVBQStDLEVBQUc7SUFFN0csTUFBTUMsT0FBTyxHQUFHWCxTQUFTLENBQTZDLENBQUMsQ0FBRTtNQUN2RVksT0FBTyxFQUFFYixTQUFTLENBQUUsb0JBQXFCLENBQUM7TUFDMUNjLFFBQVEsRUFBRSxLQUFLO01BQ2ZDLElBQUksRUFBRVIsWUFBWTtNQUNsQlMsU0FBUyxFQUFFLE9BQU87TUFDbEJDLEtBQUssRUFBRSxRQUFRO01BQ2ZDLGtCQUFrQixFQUFFLENBQUM7TUFDckJDLGlCQUFpQixFQUFFLENBQUM7TUFDcEJDLGVBQWUsRUFBRTtJQUNuQixDQUFDLEVBQUVULGVBQWdCLENBQUM7SUFFcEIsTUFBTVUsUUFBUSxHQUFHLElBQUlqQixRQUFRLENBQUUsRUFBRSxFQUFFO01BQ2pDVyxJQUFJLEVBQUVILE9BQU8sQ0FBQ0csSUFBSTtNQUNsQk8sSUFBSSxFQUFFVixPQUFPLENBQUNJLFNBQVM7TUFDdkJDLEtBQUssRUFBRUwsT0FBTyxDQUFDSztJQUNqQixDQUFFLENBQUM7SUFFSCxNQUFNTSxjQUFjLEdBQUcsSUFBSXBCLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFDaERtQixJQUFJLEVBQUVWLE9BQU8sQ0FBQ1E7SUFDaEIsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFO01BQ0xJLFFBQVEsRUFBRSxDQUFFRCxjQUFjLEVBQUVGLFFBQVEsQ0FBRTtNQUN0Q1AsUUFBUSxFQUFFO0lBQ1osQ0FBRSxDQUFDOztJQUVIO0lBQ0E7SUFDQTtJQUNBO0lBQ0FGLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDWSxnQkFBZ0IsQ0FBRTtNQUNoQ0MsSUFBSSxFQUFJQyxLQUFtQixJQUFNO1FBRS9CO1FBQ0EsTUFBTUMsU0FBUyxHQUFHLElBQUksQ0FBQ0MsbUJBQW1CLENBQUVGLEtBQUssQ0FBQ0csT0FBTyxDQUFDQyxLQUFNLENBQUM7UUFDakUsTUFBTUMsS0FBSyxHQUFHakMsS0FBSyxDQUFDa0MsT0FBTyxDQUFFTCxTQUFTLENBQUNNLENBQUMsRUFBRXRCLE9BQU8sQ0FBQ08saUJBQWtCLENBQUM7UUFDckUsTUFBTWdCLEtBQUssR0FBR3BDLEtBQUssQ0FBQ2tDLE9BQU8sQ0FBRUwsU0FBUyxDQUFDUSxDQUFDLEVBQUV4QixPQUFPLENBQUNPLGlCQUFrQixDQUFDOztRQUVyRTtRQUNBLE1BQU1rQixVQUFVLEdBQUczQixrQkFBa0IsQ0FBQzRCLG1CQUFtQixDQUFFVixTQUFVLENBQUM7UUFDdEUsTUFBTVcsTUFBTSxHQUFHeEMsS0FBSyxDQUFDa0MsT0FBTyxDQUFFSSxVQUFVLENBQUNILENBQUMsRUFBRXRCLE9BQU8sQ0FBQ00sa0JBQW1CLENBQUM7UUFDeEUsTUFBTXNCLE1BQU0sR0FBR3pDLEtBQUssQ0FBQ2tDLE9BQU8sQ0FBRUksVUFBVSxDQUFDRCxDQUFDLEVBQUV4QixPQUFPLENBQUNNLGtCQUFtQixDQUFDOztRQUV4RTtRQUNBRyxRQUFRLENBQUNvQixNQUFNLEdBQUksSUFBR1QsS0FBTSxJQUFHRyxLQUFNLFNBQVFJLE1BQU8sSUFBR0MsTUFBTyxHQUFFOztRQUVoRTtRQUNBakIsY0FBYyxDQUFDbUIsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVyQixRQUFRLENBQUNzQixLQUFLLEdBQUcsQ0FBQyxFQUFFdEIsUUFBUSxDQUFDdUIsTUFBTSxHQUFHLENBQUUsQ0FBQztRQUN2RXZCLFFBQVEsQ0FBQ3dCLE1BQU0sR0FBR3RCLGNBQWMsQ0FBQ3NCLE1BQU07O1FBRXZDO1FBQ0EsSUFBSSxDQUFDQyxPQUFPLEdBQUdsQixTQUFTLENBQUNNLENBQUM7UUFDMUIsSUFBSSxDQUFDYSxNQUFNLEdBQUduQixTQUFTLENBQUNRLENBQUMsR0FBRyxDQUFDO01BQy9CO0lBQ0YsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBOUIsV0FBVyxDQUFDMEMsUUFBUSxDQUFFLHdCQUF3QixFQUFFeEMsc0JBQXVCLENBQUMifQ==