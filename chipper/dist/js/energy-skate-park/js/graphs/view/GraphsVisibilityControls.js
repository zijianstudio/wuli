// Copyright 2019-2022, University of Colorado Boulder

/**
 * The visibility controls for "Graphs" screen - controls for grid and reference height visibility moved to a different
 * panel to create more space in the ScreenView.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Panel from '../../../../sun/js/Panel.js';
import EnergySkateParkVisibilityControls from '../../common/view/EnergySkateParkVisibilityControls.js';
import energySkatePark from '../../energySkatePark.js';
class GraphsVisibilityControls extends Panel {
  /**
   * @param {GraphsModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(model, tandem, options) {
    const content = new EnergySkateParkVisibilityControls(model, tandem, {
      showPieChartCheckbox: false,
      showSpeedCheckbox: false,
      showReferenceHeightCheckbox: true
    });
    super(content, options);
  }
}
energySkatePark.register('GraphsVisibilityControls', GraphsVisibilityControls);
export default GraphsVisibilityControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYW5lbCIsIkVuZXJneVNrYXRlUGFya1Zpc2liaWxpdHlDb250cm9scyIsImVuZXJneVNrYXRlUGFyayIsIkdyYXBoc1Zpc2liaWxpdHlDb250cm9scyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJvcHRpb25zIiwiY29udGVudCIsInNob3dQaWVDaGFydENoZWNrYm94Iiwic2hvd1NwZWVkQ2hlY2tib3giLCJzaG93UmVmZXJlbmNlSGVpZ2h0Q2hlY2tib3giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyYXBoc1Zpc2liaWxpdHlDb250cm9scy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgdmlzaWJpbGl0eSBjb250cm9scyBmb3IgXCJHcmFwaHNcIiBzY3JlZW4gLSBjb250cm9scyBmb3IgZ3JpZCBhbmQgcmVmZXJlbmNlIGhlaWdodCB2aXNpYmlsaXR5IG1vdmVkIHRvIGEgZGlmZmVyZW50XHJcbiAqIHBhbmVsIHRvIGNyZWF0ZSBtb3JlIHNwYWNlIGluIHRoZSBTY3JlZW5WaWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya1Zpc2liaWxpdHlDb250cm9scyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FbmVyZ3lTa2F0ZVBhcmtWaXNpYmlsaXR5Q29udHJvbHMuanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcblxyXG5jbGFzcyBHcmFwaHNWaXNpYmlsaXR5Q29udHJvbHMgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7R3JhcGhzTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgRW5lcmd5U2thdGVQYXJrVmlzaWJpbGl0eUNvbnRyb2xzKCBtb2RlbCwgdGFuZGVtLCB7XHJcbiAgICAgIHNob3dQaWVDaGFydENoZWNrYm94OiBmYWxzZSxcclxuICAgICAgc2hvd1NwZWVkQ2hlY2tib3g6IGZhbHNlLFxyXG4gICAgICBzaG93UmVmZXJlbmNlSGVpZ2h0Q2hlY2tib3g6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5U2thdGVQYXJrLnJlZ2lzdGVyKCAnR3JhcGhzVmlzaWJpbGl0eUNvbnRyb2xzJywgR3JhcGhzVmlzaWJpbGl0eUNvbnRyb2xzICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdyYXBoc1Zpc2liaWxpdHlDb250cm9sczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLGlDQUFpQyxNQUFNLHdEQUF3RDtBQUN0RyxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLHdCQUF3QixTQUFTSCxLQUFLLENBQUM7RUFFM0M7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBQ3BDLE1BQU1DLE9BQU8sR0FBRyxJQUFJUCxpQ0FBaUMsQ0FBRUksS0FBSyxFQUFFQyxNQUFNLEVBQUU7TUFDcEVHLG9CQUFvQixFQUFFLEtBQUs7TUFDM0JDLGlCQUFpQixFQUFFLEtBQUs7TUFDeEJDLDJCQUEyQixFQUFFO0lBQy9CLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRUgsT0FBTyxFQUFFRCxPQUFRLENBQUM7RUFDM0I7QUFDRjtBQUVBTCxlQUFlLENBQUNVLFFBQVEsQ0FBRSwwQkFBMEIsRUFBRVQsd0JBQXlCLENBQUM7QUFDaEYsZUFBZUEsd0JBQXdCIn0=