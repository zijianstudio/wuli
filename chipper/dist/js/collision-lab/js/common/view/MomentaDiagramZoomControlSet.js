// Copyright 2020-2021, University of Colorado Boulder

/**
 * A view specialized to display Controls for the user to change the zoom factor of the 'Momenta Diagram'. For the
 * 'Collision Lab' simulation, it is positioned at the bottom-right corner of the MomentaDiagramAccordionBox and
 * appears on all screens.
 *
 * Consists of two ZoomButtons for zooming in and zooming out. Responsible for disabling any buttons that would
 * exceed the zoom range. ZoomControlSets are also not intended to be disposed.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import ZoomButton from '../../../../scenery-phet/js/buttons/ZoomButton.js';
import { HBox } from '../../../../scenery/js/imports.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import MomentaDiagram from '../model/MomentaDiagram.js';
class MomentaDiagramZoomControlSet extends HBox {
  /**
   * @param {MomentaDiagram} momentaDiagram - the Momenta Diagram that is being zoomed in or out.
   * @param {Object} [options]
   */
  constructor(momentaDiagram, options) {
    assert && assert(momentaDiagram instanceof MomentaDiagram, `invalid momentaDiagram: ${momentaDiagram}`);
    options = merge({
      // {Object} - passed to both ZoomButton instances.
      zoomButtonOptions: {
        baseColor: ColorConstants.LIGHT_BLUE,
        magnifyingGlassOptions: {
          glassRadius: 8
        },
        xMargin: 5,
        yMargin: 3,
        touchAreaXDilation: 3.5,
        touchAreaYDilation: 6
      },
      // superclass options
      spacing: 10
    }, options);
    assert && assert(!options.zoomButtonOptions.in, 'MomentaDiagramZoomControlSet sets zoomButtonOptions.in');
    assert && assert(!options.listener, 'MomentaDiagramZoomControlSet sets zoomButtonOptions.listener');
    assert && assert(!options.children, 'MomentaDiagramZoomControlSet sets children');

    //----------------------------------------------------------------------------------------

    // Create the zoom-out button.
    const zoomOutButton = new ZoomButton(merge({}, options.zoomButtonOptions, {
      in: false,
      listener: () => {
        momentaDiagram.zoomOut();
      }
    }));

    // Create the zoom-in button.
    const zoomInButton = new ZoomButton(merge({}, options.zoomButtonOptions, {
      in: true,
      listener: () => {
        momentaDiagram.zoomIn();
      }
    }));

    // Set the children of this Node in the correct rendering order.
    options.children = [zoomOutButton, zoomInButton];

    //----------------------------------------------------------------------------------------

    // Observe when the zoom Property changes and disable a button if we reach the min or max. Link lasts for the
    // lifetime of the sim and is never disposed since ZoomControlSets are never disposed.
    momentaDiagram.zoomProperty.link(zoomFactor => {
      zoomOutButton.enabled = zoomFactor > CollisionLabConstants.MOMENTA_DIAGRAM_ZOOM_RANGE.min;
      zoomInButton.enabled = zoomFactor < CollisionLabConstants.MOMENTA_DIAGRAM_ZOOM_RANGE.max;
    });
    super(options);
  }
}
collisionLab.register('MomentaDiagramZoomControlSet', MomentaDiagramZoomControlSet);
export default MomentaDiagramZoomControlSet;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlpvb21CdXR0b24iLCJIQm94IiwiQ29sb3JDb25zdGFudHMiLCJjb2xsaXNpb25MYWIiLCJDb2xsaXNpb25MYWJDb25zdGFudHMiLCJNb21lbnRhRGlhZ3JhbSIsIk1vbWVudGFEaWFncmFtWm9vbUNvbnRyb2xTZXQiLCJjb25zdHJ1Y3RvciIsIm1vbWVudGFEaWFncmFtIiwib3B0aW9ucyIsImFzc2VydCIsInpvb21CdXR0b25PcHRpb25zIiwiYmFzZUNvbG9yIiwiTElHSFRfQkxVRSIsIm1hZ25pZnlpbmdHbGFzc09wdGlvbnMiLCJnbGFzc1JhZGl1cyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwic3BhY2luZyIsImluIiwibGlzdGVuZXIiLCJjaGlsZHJlbiIsInpvb21PdXRCdXR0b24iLCJ6b29tT3V0Iiwiem9vbUluQnV0dG9uIiwiem9vbUluIiwiem9vbVByb3BlcnR5IiwibGluayIsInpvb21GYWN0b3IiLCJlbmFibGVkIiwiTU9NRU5UQV9ESUFHUkFNX1pPT01fUkFOR0UiLCJtaW4iLCJtYXgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vbWVudGFEaWFncmFtWm9vbUNvbnRyb2xTZXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSB2aWV3IHNwZWNpYWxpemVkIHRvIGRpc3BsYXkgQ29udHJvbHMgZm9yIHRoZSB1c2VyIHRvIGNoYW5nZSB0aGUgem9vbSBmYWN0b3Igb2YgdGhlICdNb21lbnRhIERpYWdyYW0nLiBGb3IgdGhlXHJcbiAqICdDb2xsaXNpb24gTGFiJyBzaW11bGF0aW9uLCBpdCBpcyBwb3NpdGlvbmVkIGF0IHRoZSBib3R0b20tcmlnaHQgY29ybmVyIG9mIHRoZSBNb21lbnRhRGlhZ3JhbUFjY29yZGlvbkJveCBhbmRcclxuICogYXBwZWFycyBvbiBhbGwgc2NyZWVucy5cclxuICpcclxuICogQ29uc2lzdHMgb2YgdHdvIFpvb21CdXR0b25zIGZvciB6b29taW5nIGluIGFuZCB6b29taW5nIG91dC4gUmVzcG9uc2libGUgZm9yIGRpc2FibGluZyBhbnkgYnV0dG9ucyB0aGF0IHdvdWxkXHJcbiAqIGV4Y2VlZCB0aGUgem9vbSByYW5nZS4gWm9vbUNvbnRyb2xTZXRzIGFyZSBhbHNvIG5vdCBpbnRlbmRlZCB0byBiZSBkaXNwb3NlZC5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBab29tQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1pvb21CdXR0b24uanMnO1xyXG5pbXBvcnQgeyBIQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENvbG9yQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9Db2xvckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBjb2xsaXNpb25MYWIgZnJvbSAnLi4vLi4vY29sbGlzaW9uTGFiLmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkNvbnN0YW50cyBmcm9tICcuLi9Db2xsaXNpb25MYWJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTW9tZW50YURpYWdyYW0gZnJvbSAnLi4vbW9kZWwvTW9tZW50YURpYWdyYW0uanMnO1xyXG5cclxuY2xhc3MgTW9tZW50YURpYWdyYW1ab29tQ29udHJvbFNldCBleHRlbmRzIEhCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01vbWVudGFEaWFncmFtfSBtb21lbnRhRGlhZ3JhbSAtIHRoZSBNb21lbnRhIERpYWdyYW0gdGhhdCBpcyBiZWluZyB6b29tZWQgaW4gb3Igb3V0LlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9tZW50YURpYWdyYW0sIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb21lbnRhRGlhZ3JhbSBpbnN0YW5jZW9mIE1vbWVudGFEaWFncmFtLCBgaW52YWxpZCBtb21lbnRhRGlhZ3JhbTogJHttb21lbnRhRGlhZ3JhbX1gICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7T2JqZWN0fSAtIHBhc3NlZCB0byBib3RoIFpvb21CdXR0b24gaW5zdGFuY2VzLlxyXG4gICAgICB6b29tQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGJhc2VDb2xvcjogQ29sb3JDb25zdGFudHMuTElHSFRfQkxVRSxcclxuICAgICAgICBtYWduaWZ5aW5nR2xhc3NPcHRpb25zOiB7XHJcbiAgICAgICAgICBnbGFzc1JhZGl1czogOFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeE1hcmdpbjogNSxcclxuICAgICAgICB5TWFyZ2luOiAzLFxyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMy41LFxyXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNlxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gc3VwZXJjbGFzcyBvcHRpb25zXHJcbiAgICAgIHNwYWNpbmc6IDEwXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnpvb21CdXR0b25PcHRpb25zLmluLCAnTW9tZW50YURpYWdyYW1ab29tQ29udHJvbFNldCBzZXRzIHpvb21CdXR0b25PcHRpb25zLmluJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMubGlzdGVuZXIsICdNb21lbnRhRGlhZ3JhbVpvb21Db250cm9sU2V0IHNldHMgem9vbUJ1dHRvbk9wdGlvbnMubGlzdGVuZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ01vbWVudGFEaWFncmFtWm9vbUNvbnRyb2xTZXQgc2V0cyBjaGlsZHJlbicgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHpvb20tb3V0IGJ1dHRvbi5cclxuICAgIGNvbnN0IHpvb21PdXRCdXR0b24gPSBuZXcgWm9vbUJ1dHRvbiggbWVyZ2UoIHt9LCBvcHRpb25zLnpvb21CdXR0b25PcHRpb25zLCB7XHJcbiAgICAgIGluOiBmYWxzZSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHsgbW9tZW50YURpYWdyYW0uem9vbU91dCgpOyB9XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHpvb20taW4gYnV0dG9uLlxyXG4gICAgY29uc3Qgem9vbUluQnV0dG9uID0gbmV3IFpvb21CdXR0b24oIG1lcmdlKCB7fSwgb3B0aW9ucy56b29tQnV0dG9uT3B0aW9ucywge1xyXG4gICAgICBpbjogdHJ1ZSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHsgbW9tZW50YURpYWdyYW0uem9vbUluKCk7IH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBOb2RlIGluIHRoZSBjb3JyZWN0IHJlbmRlcmluZyBvcmRlci5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIHpvb21PdXRCdXR0b24sXHJcbiAgICAgIHpvb21JbkJ1dHRvblxyXG4gICAgXTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIHpvb20gUHJvcGVydHkgY2hhbmdlcyBhbmQgZGlzYWJsZSBhIGJ1dHRvbiBpZiB3ZSByZWFjaCB0aGUgbWluIG9yIG1heC4gTGluayBsYXN0cyBmb3IgdGhlXHJcbiAgICAvLyBsaWZldGltZSBvZiB0aGUgc2ltIGFuZCBpcyBuZXZlciBkaXNwb3NlZCBzaW5jZSBab29tQ29udHJvbFNldHMgYXJlIG5ldmVyIGRpc3Bvc2VkLlxyXG4gICAgbW9tZW50YURpYWdyYW0uem9vbVByb3BlcnR5LmxpbmsoIHpvb21GYWN0b3IgPT4ge1xyXG4gICAgICB6b29tT3V0QnV0dG9uLmVuYWJsZWQgPSB6b29tRmFjdG9yID4gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLk1PTUVOVEFfRElBR1JBTV9aT09NX1JBTkdFLm1pbjtcclxuICAgICAgem9vbUluQnV0dG9uLmVuYWJsZWQgPSB6b29tRmFjdG9yIDwgQ29sbGlzaW9uTGFiQ29uc3RhbnRzLk1PTUVOVEFfRElBR1JBTV9aT09NX1JBTkdFLm1heDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnTW9tZW50YURpYWdyYW1ab29tQ29udHJvbFNldCcsIE1vbWVudGFEaWFncmFtWm9vbUNvbnRyb2xTZXQgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9tZW50YURpYWdyYW1ab29tQ29udHJvbFNldDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsVUFBVSxNQUFNLG1EQUFtRDtBQUMxRSxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFDL0QsT0FBT0MsY0FBYyxNQUFNLDRCQUE0QjtBQUV2RCxNQUFNQyw0QkFBNEIsU0FBU0wsSUFBSSxDQUFDO0VBRTlDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VNLFdBQVdBLENBQUVDLGNBQWMsRUFBRUMsT0FBTyxFQUFHO0lBQ3JDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsY0FBYyxZQUFZSCxjQUFjLEVBQUcsMkJBQTBCRyxjQUFlLEVBQUUsQ0FBQztJQUV6R0MsT0FBTyxHQUFHVixLQUFLLENBQUU7TUFFZjtNQUNBWSxpQkFBaUIsRUFBRTtRQUNqQkMsU0FBUyxFQUFFVixjQUFjLENBQUNXLFVBQVU7UUFDcENDLHNCQUFzQixFQUFFO1VBQ3RCQyxXQUFXLEVBQUU7UUFDZixDQUFDO1FBQ0RDLE9BQU8sRUFBRSxDQUFDO1FBQ1ZDLE9BQU8sRUFBRSxDQUFDO1FBQ1ZDLGtCQUFrQixFQUFFLEdBQUc7UUFDdkJDLGtCQUFrQixFQUFFO01BQ3RCLENBQUM7TUFFRDtNQUNBQyxPQUFPLEVBQUU7SUFFWCxDQUFDLEVBQUVYLE9BQVEsQ0FBQztJQUVaQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDRCxPQUFPLENBQUNFLGlCQUFpQixDQUFDVSxFQUFFLEVBQUUsd0RBQXlELENBQUM7SUFDM0dYLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNELE9BQU8sQ0FBQ2EsUUFBUSxFQUFFLDhEQUErRCxDQUFDO0lBQ3JHWixNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDRCxPQUFPLENBQUNjLFFBQVEsRUFBRSw0Q0FBNkMsQ0FBQzs7SUFFbkY7O0lBRUE7SUFDQSxNQUFNQyxhQUFhLEdBQUcsSUFBSXhCLFVBQVUsQ0FBRUQsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFVSxPQUFPLENBQUNFLGlCQUFpQixFQUFFO01BQzFFVSxFQUFFLEVBQUUsS0FBSztNQUNUQyxRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUFFZCxjQUFjLENBQUNpQixPQUFPLENBQUMsQ0FBQztNQUFFO0lBQzlDLENBQUUsQ0FBRSxDQUFDOztJQUVMO0lBQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUkxQixVQUFVLENBQUVELEtBQUssQ0FBRSxDQUFDLENBQUMsRUFBRVUsT0FBTyxDQUFDRSxpQkFBaUIsRUFBRTtNQUN6RVUsRUFBRSxFQUFFLElBQUk7TUFDUkMsUUFBUSxFQUFFQSxDQUFBLEtBQU07UUFBRWQsY0FBYyxDQUFDbUIsTUFBTSxDQUFDLENBQUM7TUFBRTtJQUM3QyxDQUFFLENBQUUsQ0FBQzs7SUFFTDtJQUNBbEIsT0FBTyxDQUFDYyxRQUFRLEdBQUcsQ0FDakJDLGFBQWEsRUFDYkUsWUFBWSxDQUNiOztJQUVEOztJQUVBO0lBQ0E7SUFDQWxCLGNBQWMsQ0FBQ29CLFlBQVksQ0FBQ0MsSUFBSSxDQUFFQyxVQUFVLElBQUk7TUFDOUNOLGFBQWEsQ0FBQ08sT0FBTyxHQUFHRCxVQUFVLEdBQUcxQixxQkFBcUIsQ0FBQzRCLDBCQUEwQixDQUFDQyxHQUFHO01BQ3pGUCxZQUFZLENBQUNLLE9BQU8sR0FBR0QsVUFBVSxHQUFHMUIscUJBQXFCLENBQUM0QiwwQkFBMEIsQ0FBQ0UsR0FBRztJQUMxRixDQUFFLENBQUM7SUFFSCxLQUFLLENBQUV6QixPQUFRLENBQUM7RUFDbEI7QUFDRjtBQUVBTixZQUFZLENBQUNnQyxRQUFRLENBQUUsOEJBQThCLEVBQUU3Qiw0QkFBNkIsQ0FBQztBQUNyRixlQUFlQSw0QkFBNEIifQ==