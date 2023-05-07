// Copyright 2020-2023, University of Colorado Boulder

/**
 * Control Panel at the middle-right of each screen that allows the user to manipulate certain Properties of
 * the simulation.
 *
 * @author Brandon Li
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import calculusGrapher from '../../calculusGrapher.js';
import CalculusGrapherColors from '../CalculusGrapherColors.js';
import optionize from '../../../../phet-core/js/optionize.js';
import CurveManipulationControls from './CurveManipulationControls.js';
import CurvePushButtonGroup from './CurvePushButtonGroup.js';
import PredictRadioButtonGroup from './PredictRadioButtonGroup.js';
import CalculusGrapherConstants from '../CalculusGrapherConstants.js';
export default class CalculusGrapherControlPanel extends Panel {
  // the Node contained inside this Panel

  constructor(curveManipulationProperties, predictSelectedProperty, predictEnabledProperty, interactiveCurveProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      hasSmoothButton: true,
      // PanelOptions
      stroke: CalculusGrapherColors.panelStrokeProperty,
      fill: CalculusGrapherColors.panelFillProperty,
      cornerRadius: CalculusGrapherConstants.CORNER_RADIUS,
      xMargin: CalculusGrapherConstants.PANEL_X_MARGIN,
      yMargin: CalculusGrapherConstants.PANEL_Y_MARGIN,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions);
    const predictRadioButtonGroup = new PredictRadioButtonGroup(predictSelectedProperty, options.tandem.createTandem('predictRadioButtonGroup'));

    // create controls associated with curve manipulation (slider and display) as well as curve mode buttons
    const curveManipulationControls = new CurveManipulationControls(curveManipulationProperties, predictEnabledProperty, options.tandem.createTandem('curveManipulationControls'));

    // create yellow curve buttons associated with undo, erase and (optionally) smoothing the curve
    const pushButtonGroup = new CurvePushButtonGroup(interactiveCurveProperty, options.hasSmoothButton, options.tandem.createTandem('pushButtonGroup'));

    // assemble all the scenery nodes
    const contentNode = new VBox({
      spacing: 12,
      children: [predictRadioButtonGroup, curveManipulationControls, pushButtonGroup]
    });
    super(contentNode, options);
    this.contentNode = contentNode;
  }
}
calculusGrapher.register('CalculusGrapherControlPanel', CalculusGrapherControlPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWQm94IiwiUGFuZWwiLCJjYWxjdWx1c0dyYXBoZXIiLCJDYWxjdWx1c0dyYXBoZXJDb2xvcnMiLCJvcHRpb25pemUiLCJDdXJ2ZU1hbmlwdWxhdGlvbkNvbnRyb2xzIiwiQ3VydmVQdXNoQnV0dG9uR3JvdXAiLCJQcmVkaWN0UmFkaW9CdXR0b25Hcm91cCIsIkNhbGN1bHVzR3JhcGhlckNvbnN0YW50cyIsIkNhbGN1bHVzR3JhcGhlckNvbnRyb2xQYW5lbCIsImNvbnN0cnVjdG9yIiwiY3VydmVNYW5pcHVsYXRpb25Qcm9wZXJ0aWVzIiwicHJlZGljdFNlbGVjdGVkUHJvcGVydHkiLCJwcmVkaWN0RW5hYmxlZFByb3BlcnR5IiwiaW50ZXJhY3RpdmVDdXJ2ZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImhhc1Ntb290aEJ1dHRvbiIsInN0cm9rZSIsInBhbmVsU3Ryb2tlUHJvcGVydHkiLCJmaWxsIiwicGFuZWxGaWxsUHJvcGVydHkiLCJjb3JuZXJSYWRpdXMiLCJDT1JORVJfUkFESVVTIiwieE1hcmdpbiIsIlBBTkVMX1hfTUFSR0lOIiwieU1hcmdpbiIsIlBBTkVMX1lfTUFSR0lOIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwicHJlZGljdFJhZGlvQnV0dG9uR3JvdXAiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJjdXJ2ZU1hbmlwdWxhdGlvbkNvbnRyb2xzIiwicHVzaEJ1dHRvbkdyb3VwIiwiY29udGVudE5vZGUiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNhbGN1bHVzR3JhcGhlckNvbnRyb2xQYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIFBhbmVsIGF0IHRoZSBtaWRkbGUtcmlnaHQgb2YgZWFjaCBzY3JlZW4gdGhhdCBhbGxvd3MgdGhlIHVzZXIgdG8gbWFuaXB1bGF0ZSBjZXJ0YWluIFByb3BlcnRpZXMgb2ZcclxuICogdGhlIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBOb2RlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBjYWxjdWx1c0dyYXBoZXIgZnJvbSAnLi4vLi4vY2FsY3VsdXNHcmFwaGVyLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlckNvbG9ycyBmcm9tICcuLi9DYWxjdWx1c0dyYXBoZXJDb2xvcnMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgQ3VydmVNYW5pcHVsYXRpb25Db250cm9scyBmcm9tICcuL0N1cnZlTWFuaXB1bGF0aW9uQ29udHJvbHMuanMnO1xyXG5pbXBvcnQgQ3VydmVQdXNoQnV0dG9uR3JvdXAgZnJvbSAnLi9DdXJ2ZVB1c2hCdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBDdXJ2ZU1hbmlwdWxhdGlvblByb3BlcnRpZXMgZnJvbSAnLi4vbW9kZWwvQ3VydmVNYW5pcHVsYXRpb25Qcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IFByZWRpY3RSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4vUHJlZGljdFJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgVHJhbnNmb3JtZWRDdXJ2ZSBmcm9tICcuLi9tb2RlbC9UcmFuc2Zvcm1lZEN1cnZlLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMgZnJvbSAnLi4vQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgaGFzU21vb3RoQnV0dG9uPzogYm9vbGVhbjsgLy8gc2hvdWxkIHRoZSAnU21vb3RoJyBidXR0b24gYmUgaW5jbHVkZWQgaW4gQ3VydmVQdXNoQnV0dG9uR3JvdXA/XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBDYWxjdWx1c0dyYXBoZXJDb250cm9sUGFuZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGFuZWxPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYWxjdWx1c0dyYXBoZXJDb250cm9sUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIHByaXZhdGUgY29udGVudE5vZGU6IE5vZGU7IC8vIHRoZSBOb2RlIGNvbnRhaW5lZCBpbnNpZGUgdGhpcyBQYW5lbFxyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGN1cnZlTWFuaXB1bGF0aW9uUHJvcGVydGllczogQ3VydmVNYW5pcHVsYXRpb25Qcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJlZGljdFNlbGVjdGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJlZGljdEVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZUN1cnZlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFRyYW5zZm9ybWVkQ3VydmU+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBDYWxjdWx1c0dyYXBoZXJDb250cm9sUGFuZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q2FsY3VsdXNHcmFwaGVyQ29udHJvbFBhbmVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhbmVsT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgaGFzU21vb3RoQnV0dG9uOiB0cnVlLFxyXG5cclxuICAgICAgLy8gUGFuZWxPcHRpb25zXHJcbiAgICAgIHN0cm9rZTogQ2FsY3VsdXNHcmFwaGVyQ29sb3JzLnBhbmVsU3Ryb2tlUHJvcGVydHksXHJcbiAgICAgIGZpbGw6IENhbGN1bHVzR3JhcGhlckNvbG9ycy5wYW5lbEZpbGxQcm9wZXJ0eSxcclxuICAgICAgY29ybmVyUmFkaXVzOiBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuQ09STkVSX1JBRElVUyxcclxuICAgICAgeE1hcmdpbjogQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLlBBTkVMX1hfTUFSR0lOLFxyXG4gICAgICB5TWFyZ2luOiBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuUEFORUxfWV9NQVJHSU4sXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBwcmVkaWN0UmFkaW9CdXR0b25Hcm91cCA9IG5ldyBQcmVkaWN0UmFkaW9CdXR0b25Hcm91cCggcHJlZGljdFNlbGVjdGVkUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZWRpY3RSYWRpb0J1dHRvbkdyb3VwJyApICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGNvbnRyb2xzIGFzc29jaWF0ZWQgd2l0aCBjdXJ2ZSBtYW5pcHVsYXRpb24gKHNsaWRlciBhbmQgZGlzcGxheSkgYXMgd2VsbCBhcyBjdXJ2ZSBtb2RlIGJ1dHRvbnNcclxuICAgIGNvbnN0IGN1cnZlTWFuaXB1bGF0aW9uQ29udHJvbHMgPSBuZXcgQ3VydmVNYW5pcHVsYXRpb25Db250cm9scyggY3VydmVNYW5pcHVsYXRpb25Qcm9wZXJ0aWVzLFxyXG4gICAgICBwcmVkaWN0RW5hYmxlZFByb3BlcnR5LCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjdXJ2ZU1hbmlwdWxhdGlvbkNvbnRyb2xzJyApICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHllbGxvdyBjdXJ2ZSBidXR0b25zIGFzc29jaWF0ZWQgd2l0aCB1bmRvLCBlcmFzZSBhbmQgKG9wdGlvbmFsbHkpIHNtb290aGluZyB0aGUgY3VydmVcclxuICAgIGNvbnN0IHB1c2hCdXR0b25Hcm91cCA9IG5ldyBDdXJ2ZVB1c2hCdXR0b25Hcm91cCggaW50ZXJhY3RpdmVDdXJ2ZVByb3BlcnR5LCBvcHRpb25zLmhhc1Ntb290aEJ1dHRvbixcclxuICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHVzaEJ1dHRvbkdyb3VwJyApICk7XHJcblxyXG4gICAgLy8gYXNzZW1ibGUgYWxsIHRoZSBzY2VuZXJ5IG5vZGVzXHJcbiAgICBjb25zdCBjb250ZW50Tm9kZSA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDEyLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHByZWRpY3RSYWRpb0J1dHRvbkdyb3VwLFxyXG4gICAgICAgIGN1cnZlTWFuaXB1bGF0aW9uQ29udHJvbHMsXHJcbiAgICAgICAgcHVzaEJ1dHRvbkdyb3VwXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudE5vZGUsIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmNvbnRlbnROb2RlID0gY29udGVudE5vZGU7XHJcbiAgfVxyXG59XHJcbmNhbGN1bHVzR3JhcGhlci5yZWdpc3RlciggJ0NhbGN1bHVzR3JhcGhlckNvbnRyb2xQYW5lbCcsIENhbGN1bHVzR3JhcGhlckNvbnRyb2xQYW5lbCApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBZUEsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxLQUFLLE1BQXdCLDZCQUE2QjtBQUNqRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUMvRCxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBQzdELE9BQU9DLHlCQUF5QixNQUFNLGdDQUFnQztBQUN0RSxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFFNUQsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBSWxFLE9BQU9DLHdCQUF3QixNQUFNLGdDQUFnQztBQVNyRSxlQUFlLE1BQU1DLDJCQUEyQixTQUFTUixLQUFLLENBQUM7RUFFbEM7O0VBRXBCUyxXQUFXQSxDQUFFQywyQkFBd0QsRUFDeERDLHVCQUEwQyxFQUMxQ0Msc0JBQWtELEVBQ2xEQyx3QkFBNkQsRUFDN0RDLGVBQW1ELEVBQUc7SUFFeEUsTUFBTUMsT0FBTyxHQUFHWixTQUFTLENBQWdFLENBQUMsQ0FBRTtNQUUxRjtNQUNBYSxlQUFlLEVBQUUsSUFBSTtNQUVyQjtNQUNBQyxNQUFNLEVBQUVmLHFCQUFxQixDQUFDZ0IsbUJBQW1CO01BQ2pEQyxJQUFJLEVBQUVqQixxQkFBcUIsQ0FBQ2tCLGlCQUFpQjtNQUM3Q0MsWUFBWSxFQUFFZCx3QkFBd0IsQ0FBQ2UsYUFBYTtNQUNwREMsT0FBTyxFQUFFaEIsd0JBQXdCLENBQUNpQixjQUFjO01BQ2hEQyxPQUFPLEVBQUVsQix3QkFBd0IsQ0FBQ21CLGNBQWM7TUFDaERDLHNCQUFzQixFQUFFO1FBQ3RCQyxjQUFjLEVBQUU7TUFDbEI7SUFDRixDQUFDLEVBQUVkLGVBQWdCLENBQUM7SUFFcEIsTUFBTWUsdUJBQXVCLEdBQUcsSUFBSXZCLHVCQUF1QixDQUFFSyx1QkFBdUIsRUFDbEZJLE9BQU8sQ0FBQ2UsTUFBTSxDQUFDQyxZQUFZLENBQUUseUJBQTBCLENBQUUsQ0FBQzs7SUFFNUQ7SUFDQSxNQUFNQyx5QkFBeUIsR0FBRyxJQUFJNUIseUJBQXlCLENBQUVNLDJCQUEyQixFQUMxRkUsc0JBQXNCLEVBQUVHLE9BQU8sQ0FBQ2UsTUFBTSxDQUFDQyxZQUFZLENBQUUsMkJBQTRCLENBQUUsQ0FBQzs7SUFFdEY7SUFDQSxNQUFNRSxlQUFlLEdBQUcsSUFBSTVCLG9CQUFvQixDQUFFUSx3QkFBd0IsRUFBRUUsT0FBTyxDQUFDQyxlQUFlLEVBQ2pHRCxPQUFPLENBQUNlLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGlCQUFrQixDQUFFLENBQUM7O0lBRXBEO0lBQ0EsTUFBTUcsV0FBVyxHQUFHLElBQUluQyxJQUFJLENBQUU7TUFDNUJvQyxPQUFPLEVBQUUsRUFBRTtNQUNYQyxRQUFRLEVBQUUsQ0FDUlAsdUJBQXVCLEVBQ3ZCRyx5QkFBeUIsRUFDekJDLGVBQWU7SUFFbkIsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFQyxXQUFXLEVBQUVuQixPQUFRLENBQUM7SUFFN0IsSUFBSSxDQUFDbUIsV0FBVyxHQUFHQSxXQUFXO0VBQ2hDO0FBQ0Y7QUFDQWpDLGVBQWUsQ0FBQ29DLFFBQVEsQ0FBRSw2QkFBNkIsRUFBRTdCLDJCQUE0QixDQUFDIn0=