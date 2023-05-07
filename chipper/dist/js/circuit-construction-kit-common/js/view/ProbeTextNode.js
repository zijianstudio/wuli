// Copyright 2016-2023, University of Colorado Boulder

/**
 * Shows the title (above) and dynamic readout (below) for the ammeter and voltmeter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Color, Node, Rectangle, Text, VBox } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import optionize from '../../../phet-core/js/optionize.js';
import CCKCColors from './CCKCColors.js';
// constants
const TEXT_BOX_WIDTH = 140;
export default class ProbeTextNode extends VBox {
  /**
   * @param stringProperty - the text that should be displayed
   * @param showResultsProperty - true if the text should be displayed
   * @param title - the title
   * @param tandem
   * @param [providedOptions]
   */
  constructor(stringProperty, showResultsProperty, title, tandem, providedOptions) {
    const options = optionize()({
      spacing: providedOptions && providedOptions.seriesAmmeter ? 0.5 : 3,
      seriesAmmeter: false,
      pickable: false
    }, providedOptions);
    const readoutText = new Text(stringProperty, {
      fontSize: options.seriesAmmeter ? 46 : 40,
      maxWidth: TEXT_BOX_WIDTH - 20,
      fill: CCKCColors.textFillProperty,
      tandem: tandem.createTandem('probeReadoutText'),
      stringPropertyOptions: {
        phetioReadOnly: true
      }
    });
    const textBox = new Rectangle(0, 0, TEXT_BOX_WIDTH, 52, {
      cornerRadius: 10,
      lineWidth: 2,
      stroke: Color.BLACK,
      fill: Color.WHITE
    });

    // Text bounds is not updated eagerly, so wait for the bounds to change for layout
    const boundsListener = bounds => {
      if (readoutText.string === MathSymbols.NO_VALUE) {
        // --- is centered
        readoutText.centerX = textBox.centerX;
      } else {
        // numbers are right-aligned
        readoutText.right = textBox.right - 10;
      }

      // vertically center
      readoutText.centerY = textBox.centerY;
    };
    readoutText.boundsProperty.link(boundsListener);

    // Update visibility when show results property changes
    const updateVisibility = showResults => readoutText.setVisible(showResults);
    showResultsProperty.link(updateVisibility);

    // set the children
    const titleText = new Text(title, {
      fontSize: options.seriesAmmeter ? 33 : 42,
      maxWidth: TEXT_BOX_WIDTH,
      fill: CCKCColors.textFillProperty,
      tandem: options.seriesAmmeter ? tandem.createTandem('probeTitleText') : Tandem.OPT_OUT
    });
    options.children = [titleText, new Node({
      children: [textBox, readoutText]
    })];
    if (options.seriesAmmeter) {
      options.scale = 0.37;
    }
    super(options);
    this.readoutText = readoutText;
    this.titleText = titleText;
    this.disposeProbeTextNode = () => {
      readoutText.boundsProperty.unlink(boundsListener);
      textBox.dispose();
      showResultsProperty.unlink(updateVisibility);
    };
  }
  dispose() {
    this.disposeProbeTextNode();
    this.readoutText.dispose();
    this.titleText.dispose();
    super.dispose();
  }
}
circuitConstructionKitCommon.register('ProbeTextNode', ProbeTextNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xvciIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVkJveCIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24iLCJUYW5kZW0iLCJNYXRoU3ltYm9scyIsIm9wdGlvbml6ZSIsIkNDS0NDb2xvcnMiLCJURVhUX0JPWF9XSURUSCIsIlByb2JlVGV4dE5vZGUiLCJjb25zdHJ1Y3RvciIsInN0cmluZ1Byb3BlcnR5Iiwic2hvd1Jlc3VsdHNQcm9wZXJ0eSIsInRpdGxlIiwidGFuZGVtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNwYWNpbmciLCJzZXJpZXNBbW1ldGVyIiwicGlja2FibGUiLCJyZWFkb3V0VGV4dCIsImZvbnRTaXplIiwibWF4V2lkdGgiLCJmaWxsIiwidGV4dEZpbGxQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInN0cmluZ1Byb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwidGV4dEJveCIsImNvcm5lclJhZGl1cyIsImxpbmVXaWR0aCIsInN0cm9rZSIsIkJMQUNLIiwiV0hJVEUiLCJib3VuZHNMaXN0ZW5lciIsImJvdW5kcyIsInN0cmluZyIsIk5PX1ZBTFVFIiwiY2VudGVyWCIsInJpZ2h0IiwiY2VudGVyWSIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsInVwZGF0ZVZpc2liaWxpdHkiLCJzaG93UmVzdWx0cyIsInNldFZpc2libGUiLCJ0aXRsZVRleHQiLCJPUFRfT1VUIiwiY2hpbGRyZW4iLCJzY2FsZSIsImRpc3Bvc2VQcm9iZVRleHROb2RlIiwidW5saW5rIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUHJvYmVUZXh0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaG93cyB0aGUgdGl0bGUgKGFib3ZlKSBhbmQgZHluYW1pYyByZWFkb3V0IChiZWxvdykgZm9yIHRoZSBhbW1ldGVyIGFuZCB2b2x0bWV0ZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgQ0NLQ0NvbG9ycyBmcm9tICcuL0NDS0NDb2xvcnMuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVEVYVF9CT1hfV0lEVEggPSAxNDA7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHNlcmllc0FtbWV0ZXI/OiBib29sZWFuO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUHJvYmVUZXh0Tm9kZU9wdGlvbnMgPSBTdHJpY3RPbWl0PFNlbGZPcHRpb25zICYgVkJveE9wdGlvbnMsICdjaGlsZHJlbic+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvYmVUZXh0Tm9kZSBleHRlbmRzIFZCb3gge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVhZG91dFRleHQ6IFRleHQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0aXRsZVRleHQ6IFRleHQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUHJvYmVUZXh0Tm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHN0cmluZ1Byb3BlcnR5IC0gdGhlIHRleHQgdGhhdCBzaG91bGQgYmUgZGlzcGxheWVkXHJcbiAgICogQHBhcmFtIHNob3dSZXN1bHRzUHJvcGVydHkgLSB0cnVlIGlmIHRoZSB0ZXh0IHNob3VsZCBiZSBkaXNwbGF5ZWRcclxuICAgKiBAcGFyYW0gdGl0bGUgLSB0aGUgdGl0bGVcclxuICAgKiBAcGFyYW0gdGFuZGVtXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgc2hvd1Jlc3VsdHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sIHRpdGxlOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCB0YW5kZW06IFRhbmRlbSxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFByb2JlVGV4dE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UHJvYmVUZXh0Tm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBWQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBzcGFjaW5nOiBwcm92aWRlZE9wdGlvbnMgJiYgcHJvdmlkZWRPcHRpb25zLnNlcmllc0FtbWV0ZXIgPyAwLjUgOiAzLFxyXG4gICAgICBzZXJpZXNBbW1ldGVyOiBmYWxzZSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCByZWFkb3V0VGV4dCA9IG5ldyBUZXh0KCBzdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250U2l6ZTogb3B0aW9ucy5zZXJpZXNBbW1ldGVyID8gNDYgOiA0MCxcclxuICAgICAgbWF4V2lkdGg6IFRFWFRfQk9YX1dJRFRIIC0gMjAsXHJcbiAgICAgIGZpbGw6IENDS0NDb2xvcnMudGV4dEZpbGxQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvYmVSZWFkb3V0VGV4dCcgKSxcclxuICAgICAgc3RyaW5nUHJvcGVydHlPcHRpb25zOiB7XHJcbiAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRleHRCb3ggPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBURVhUX0JPWF9XSURUSCwgNTIsIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiAxMCxcclxuICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICBzdHJva2U6IENvbG9yLkJMQUNLLFxyXG4gICAgICBmaWxsOiBDb2xvci5XSElURVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRleHQgYm91bmRzIGlzIG5vdCB1cGRhdGVkIGVhZ2VybHksIHNvIHdhaXQgZm9yIHRoZSBib3VuZHMgdG8gY2hhbmdlIGZvciBsYXlvdXRcclxuICAgIGNvbnN0IGJvdW5kc0xpc3RlbmVyID0gKCBib3VuZHM6IEJvdW5kczIgKSA9PiB7XHJcbiAgICAgIGlmICggcmVhZG91dFRleHQuc3RyaW5nID09PSBNYXRoU3ltYm9scy5OT19WQUxVRSApIHtcclxuXHJcbiAgICAgICAgLy8gLS0tIGlzIGNlbnRlcmVkXHJcbiAgICAgICAgcmVhZG91dFRleHQuY2VudGVyWCA9IHRleHRCb3guY2VudGVyWDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gbnVtYmVycyBhcmUgcmlnaHQtYWxpZ25lZFxyXG4gICAgICAgIHJlYWRvdXRUZXh0LnJpZ2h0ID0gdGV4dEJveC5yaWdodCAtIDEwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB2ZXJ0aWNhbGx5IGNlbnRlclxyXG4gICAgICByZWFkb3V0VGV4dC5jZW50ZXJZID0gdGV4dEJveC5jZW50ZXJZO1xyXG4gICAgfTtcclxuICAgIHJlYWRvdXRUZXh0LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kc0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHZpc2liaWxpdHkgd2hlbiBzaG93IHJlc3VsdHMgcHJvcGVydHkgY2hhbmdlc1xyXG4gICAgY29uc3QgdXBkYXRlVmlzaWJpbGl0eSA9ICggc2hvd1Jlc3VsdHM6IGJvb2xlYW4gKSA9PiByZWFkb3V0VGV4dC5zZXRWaXNpYmxlKCBzaG93UmVzdWx0cyApO1xyXG4gICAgc2hvd1Jlc3VsdHNQcm9wZXJ0eS5saW5rKCB1cGRhdGVWaXNpYmlsaXR5ICk7XHJcblxyXG4gICAgLy8gc2V0IHRoZSBjaGlsZHJlblxyXG4gICAgY29uc3QgdGl0bGVUZXh0ID0gbmV3IFRleHQoIHRpdGxlLCB7XHJcbiAgICAgIGZvbnRTaXplOiBvcHRpb25zLnNlcmllc0FtbWV0ZXIgPyAzMyA6IDQyLFxyXG4gICAgICBtYXhXaWR0aDogVEVYVF9CT1hfV0lEVEgsXHJcbiAgICAgIGZpbGw6IENDS0NDb2xvcnMudGV4dEZpbGxQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnNlcmllc0FtbWV0ZXIgPyB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvYmVUaXRsZVRleHQnICkgOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgdGl0bGVUZXh0LCBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyB0ZXh0Qm94LCByZWFkb3V0VGV4dCBdXHJcbiAgICB9ICkgXTtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMuc2VyaWVzQW1tZXRlciApIHtcclxuICAgICAgb3B0aW9ucy5zY2FsZSA9IDAuMzc7XHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnJlYWRvdXRUZXh0ID0gcmVhZG91dFRleHQ7XHJcbiAgICB0aGlzLnRpdGxlVGV4dCA9IHRpdGxlVGV4dDtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VQcm9iZVRleHROb2RlID0gKCkgPT4ge1xyXG4gICAgICByZWFkb3V0VGV4dC5ib3VuZHNQcm9wZXJ0eS51bmxpbmsoIGJvdW5kc0xpc3RlbmVyICk7XHJcbiAgICAgIHRleHRCb3guZGlzcG9zZSgpO1xyXG4gICAgICBzaG93UmVzdWx0c1Byb3BlcnR5LnVubGluayggdXBkYXRlVmlzaWJpbGl0eSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlUHJvYmVUZXh0Tm9kZSgpO1xyXG4gICAgdGhpcy5yZWFkb3V0VGV4dC5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLnRpdGxlVGV4dC5kaXNwb3NlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnUHJvYmVUZXh0Tm9kZScsIFByb2JlVGV4dE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQXFCLGdDQUFnQztBQUNoRyxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFDN0UsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBRWpFLE9BQU9DLFNBQVMs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