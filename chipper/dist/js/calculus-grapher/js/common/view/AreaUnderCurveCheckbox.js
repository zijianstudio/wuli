// Copyright 2023, University of Colorado Boulder

/**
 * AreaUnderCurveCheckbox is the checkbox labeled 'Area Under Curve', for making the area-under-curve feature visible.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { HBox, RichText } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import calculusGrapher from '../../calculusGrapher.js';
import CalculusGrapherStrings from '../../CalculusGrapherStrings.js';
import CalculusGrapherConstants from '../CalculusGrapherConstants.js';
import AreaUnderCurveScrubberNode from './AreaUnderCurveScrubberNode.js';
import CalculusGrapherCheckboxGroup from './CalculusGrapherCheckboxGroup.js';
export default class AreaUnderCurveCheckbox extends Checkbox {
  constructor(scrubberVisibleProperty, predictEnabledProperty, tandem) {
    const icon = AreaUnderCurveScrubberNode.createIcon();
    const text = new RichText(CalculusGrapherStrings.checkbox.areaUnderCurveStringProperty, {
      font: CalculusGrapherConstants.CONTROL_FONT,
      maxWidth: CalculusGrapherCheckboxGroup.RICH_TEXT_MAX_WIDTH,
      maxHeight: CalculusGrapherCheckboxGroup.RICH_TEXT_MAX_HEIGHT,
      tandem: tandem.createTandem('text')
    });
    const box = new HBox({
      children: [icon, text],
      spacing: 8
    });
    super(scrubberVisibleProperty, box, combineOptions({}, CalculusGrapherConstants.CHECKBOX_OPTIONS, {
      enabledProperty: DerivedProperty.not(predictEnabledProperty),
      tandem: tandem
    }));
  }
}
calculusGrapher.register('AreaUnderCurveCheckbox', AreaUnderCurveCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJjb21iaW5lT3B0aW9ucyIsIkhCb3giLCJSaWNoVGV4dCIsIkNoZWNrYm94IiwiY2FsY3VsdXNHcmFwaGVyIiwiQ2FsY3VsdXNHcmFwaGVyU3RyaW5ncyIsIkNhbGN1bHVzR3JhcGhlckNvbnN0YW50cyIsIkFyZWFVbmRlckN1cnZlU2NydWJiZXJOb2RlIiwiQ2FsY3VsdXNHcmFwaGVyQ2hlY2tib3hHcm91cCIsIkFyZWFVbmRlckN1cnZlQ2hlY2tib3giLCJjb25zdHJ1Y3RvciIsInNjcnViYmVyVmlzaWJsZVByb3BlcnR5IiwicHJlZGljdEVuYWJsZWRQcm9wZXJ0eSIsInRhbmRlbSIsImljb24iLCJjcmVhdGVJY29uIiwidGV4dCIsImNoZWNrYm94IiwiYXJlYVVuZGVyQ3VydmVTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJDT05UUk9MX0ZPTlQiLCJtYXhXaWR0aCIsIlJJQ0hfVEVYVF9NQVhfV0lEVEgiLCJtYXhIZWlnaHQiLCJSSUNIX1RFWFRfTUFYX0hFSUdIVCIsImNyZWF0ZVRhbmRlbSIsImJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsIkNIRUNLQk9YX09QVElPTlMiLCJlbmFibGVkUHJvcGVydHkiLCJub3QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyZWFVbmRlckN1cnZlQ2hlY2tib3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFyZWFVbmRlckN1cnZlQ2hlY2tib3ggaXMgdGhlIGNoZWNrYm94IGxhYmVsZWQgJ0FyZWEgVW5kZXIgQ3VydmUnLCBmb3IgbWFraW5nIHRoZSBhcmVhLXVuZGVyLWN1cnZlIGZlYXR1cmUgdmlzaWJsZS5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBSaWNoVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGVja2JveCwgeyBDaGVja2JveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgY2FsY3VsdXNHcmFwaGVyIGZyb20gJy4uLy4uL2NhbGN1bHVzR3JhcGhlci5qcyc7XHJcbmltcG9ydCBDYWxjdWx1c0dyYXBoZXJTdHJpbmdzIGZyb20gJy4uLy4uL0NhbGN1bHVzR3JhcGhlclN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzIGZyb20gJy4uL0NhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBBcmVhVW5kZXJDdXJ2ZVNjcnViYmVyTm9kZSBmcm9tICcuL0FyZWFVbmRlckN1cnZlU2NydWJiZXJOb2RlLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlckNoZWNrYm94R3JvdXAgZnJvbSAnLi9DYWxjdWx1c0dyYXBoZXJDaGVja2JveEdyb3VwLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFyZWFVbmRlckN1cnZlQ2hlY2tib3ggZXh0ZW5kcyBDaGVja2JveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NydWJiZXJWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJlZGljdEVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IGljb24gPSBBcmVhVW5kZXJDdXJ2ZVNjcnViYmVyTm9kZS5jcmVhdGVJY29uKCk7XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBSaWNoVGV4dCggQ2FsY3VsdXNHcmFwaGVyU3RyaW5ncy5jaGVja2JveC5hcmVhVW5kZXJDdXJ2ZVN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IENhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5DT05UUk9MX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiBDYWxjdWx1c0dyYXBoZXJDaGVja2JveEdyb3VwLlJJQ0hfVEVYVF9NQVhfV0lEVEgsXHJcbiAgICAgIG1heEhlaWdodDogQ2FsY3VsdXNHcmFwaGVyQ2hlY2tib3hHcm91cC5SSUNIX1RFWFRfTUFYX0hFSUdIVCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGljb24sIHRleHQgXSxcclxuICAgICAgc3BhY2luZzogOFxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBzY3J1YmJlclZpc2libGVQcm9wZXJ0eSwgYm94LCBjb21iaW5lT3B0aW9uczxDaGVja2JveE9wdGlvbnM+KFxyXG4gICAgICB7fSwgQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLkNIRUNLQk9YX09QVElPTlMsIHtcclxuICAgICAgICBlbmFibGVkUHJvcGVydHk6IERlcml2ZWRQcm9wZXJ0eS5ub3QoIHByZWRpY3RFbmFibGVkUHJvcGVydHkgKSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgICB9ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmNhbGN1bHVzR3JhcGhlci5yZWdpc3RlciggJ0FyZWFVbmRlckN1cnZlQ2hlY2tib3gnLCBBcmVhVW5kZXJDdXJ2ZUNoZWNrYm94ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUdwRSxTQUFTQyxjQUFjLFFBQVEsdUNBQXVDO0FBQ3RFLFNBQVNDLElBQUksRUFBRUMsUUFBUSxRQUFRLG1DQUFtQztBQUNsRSxPQUFPQyxRQUFRLE1BQTJCLGdDQUFnQztBQUUxRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQyx3QkFBd0IsTUFBTSxnQ0FBZ0M7QUFDckUsT0FBT0MsMEJBQTBCLE1BQU0saUNBQWlDO0FBQ3hFLE9BQU9DLDRCQUE0QixNQUFNLG1DQUFtQztBQUU1RSxlQUFlLE1BQU1DLHNCQUFzQixTQUFTTixRQUFRLENBQUM7RUFFcERPLFdBQVdBLENBQUVDLHVCQUEwQyxFQUMxQ0Msc0JBQWtELEVBQUVDLE1BQWMsRUFBRztJQUV2RixNQUFNQyxJQUFJLEdBQUdQLDBCQUEwQixDQUFDUSxVQUFVLENBQUMsQ0FBQztJQUVwRCxNQUFNQyxJQUFJLEdBQUcsSUFBSWQsUUFBUSxDQUFFRyxzQkFBc0IsQ0FBQ1ksUUFBUSxDQUFDQyw0QkFBNEIsRUFBRTtNQUN2RkMsSUFBSSxFQUFFYix3QkFBd0IsQ0FBQ2MsWUFBWTtNQUMzQ0MsUUFBUSxFQUFFYiw0QkFBNEIsQ0FBQ2MsbUJBQW1CO01BQzFEQyxTQUFTLEVBQUVmLDRCQUE0QixDQUFDZ0Isb0JBQW9CO01BQzVEWCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ1ksWUFBWSxDQUFFLE1BQU87SUFDdEMsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsR0FBRyxHQUFHLElBQUl6QixJQUFJLENBQUU7TUFDcEIwQixRQUFRLEVBQUUsQ0FBRWIsSUFBSSxFQUFFRSxJQUFJLENBQUU7TUFDeEJZLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRWpCLHVCQUF1QixFQUFFZSxHQUFHLEVBQUUxQixjQUFjLENBQ2pELENBQUMsQ0FBQyxFQUFFTSx3QkFBd0IsQ0FBQ3VCLGdCQUFnQixFQUFFO01BQzdDQyxlQUFlLEVBQUUvQixlQUFlLENBQUNnQyxHQUFHLENBQUVuQixzQkFBdUIsQ0FBQztNQUM5REMsTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBRSxDQUFDO0VBQ1Q7QUFDRjtBQUVBVCxlQUFlLENBQUM0QixRQUFRLENBQUUsd0JBQXdCLEVBQUV2QixzQkFBdUIsQ0FBQyJ9