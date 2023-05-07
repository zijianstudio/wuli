// Copyright 2023, University of Colorado Boulder

/**
 * TangentCheckbox is the checkbox labeled 'Tangent', for making the tangent feature visible.
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
import TangentScrubberNode from './TangentScrubberNode.js';
import CalculusGrapherCheckboxGroup from './CalculusGrapherCheckboxGroup.js';
export default class TangentCheckbox extends Checkbox {
  constructor(scrubberVisibleProperty, predictEnabledProperty, tandem) {
    const icon = TangentScrubberNode.createIcon();
    const text = new RichText(CalculusGrapherStrings.checkbox.tangentStringProperty, {
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
calculusGrapher.register('TangentCheckbox', TangentCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJjb21iaW5lT3B0aW9ucyIsIkhCb3giLCJSaWNoVGV4dCIsIkNoZWNrYm94IiwiY2FsY3VsdXNHcmFwaGVyIiwiQ2FsY3VsdXNHcmFwaGVyU3RyaW5ncyIsIkNhbGN1bHVzR3JhcGhlckNvbnN0YW50cyIsIlRhbmdlbnRTY3J1YmJlck5vZGUiLCJDYWxjdWx1c0dyYXBoZXJDaGVja2JveEdyb3VwIiwiVGFuZ2VudENoZWNrYm94IiwiY29uc3RydWN0b3IiLCJzY3J1YmJlclZpc2libGVQcm9wZXJ0eSIsInByZWRpY3RFbmFibGVkUHJvcGVydHkiLCJ0YW5kZW0iLCJpY29uIiwiY3JlYXRlSWNvbiIsInRleHQiLCJjaGVja2JveCIsInRhbmdlbnRTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJDT05UUk9MX0ZPTlQiLCJtYXhXaWR0aCIsIlJJQ0hfVEVYVF9NQVhfV0lEVEgiLCJtYXhIZWlnaHQiLCJSSUNIX1RFWFRfTUFYX0hFSUdIVCIsImNyZWF0ZVRhbmRlbSIsImJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsIkNIRUNLQk9YX09QVElPTlMiLCJlbmFibGVkUHJvcGVydHkiLCJub3QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRhbmdlbnRDaGVja2JveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGFuZ2VudENoZWNrYm94IGlzIHRoZSBjaGVja2JveCBsYWJlbGVkICdUYW5nZW50JywgZm9yIG1ha2luZyB0aGUgdGFuZ2VudCBmZWF0dXJlIHZpc2libGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgSEJveCwgUmljaFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3gsIHsgQ2hlY2tib3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGNhbGN1bHVzR3JhcGhlciBmcm9tICcuLi8uLi9jYWxjdWx1c0dyYXBoZXIuanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyU3RyaW5ncyBmcm9tICcuLi8uLi9DYWxjdWx1c0dyYXBoZXJTdHJpbmdzLmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlckNvbnN0YW50cyBmcm9tICcuLi9DYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgVGFuZ2VudFNjcnViYmVyTm9kZSBmcm9tICcuL1RhbmdlbnRTY3J1YmJlck5vZGUuanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyQ2hlY2tib3hHcm91cCBmcm9tICcuL0NhbGN1bHVzR3JhcGhlckNoZWNrYm94R3JvdXAuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFuZ2VudENoZWNrYm94IGV4dGVuZHMgQ2hlY2tib3gge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNjcnViYmVyVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByZWRpY3RFbmFibGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBpY29uID0gVGFuZ2VudFNjcnViYmVyTm9kZS5jcmVhdGVJY29uKCk7XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBSaWNoVGV4dCggQ2FsY3VsdXNHcmFwaGVyU3RyaW5ncy5jaGVja2JveC50YW5nZW50U3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLkNPTlRST0xfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IENhbGN1bHVzR3JhcGhlckNoZWNrYm94R3JvdXAuUklDSF9URVhUX01BWF9XSURUSCxcclxuICAgICAgbWF4SGVpZ2h0OiBDYWxjdWx1c0dyYXBoZXJDaGVja2JveEdyb3VwLlJJQ0hfVEVYVF9NQVhfSEVJR0hULFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgaWNvbiwgdGV4dCBdLFxyXG4gICAgICBzcGFjaW5nOiA4XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHNjcnViYmVyVmlzaWJsZVByb3BlcnR5LCBib3gsIGNvbWJpbmVPcHRpb25zPENoZWNrYm94T3B0aW9ucz4oXHJcbiAgICAgIHt9LCBDYWxjdWx1c0dyYXBoZXJDb25zdGFudHMuQ0hFQ0tCT1hfT1BUSU9OUywge1xyXG4gICAgICAgIGVuYWJsZWRQcm9wZXJ0eTogRGVyaXZlZFByb3BlcnR5Lm5vdCggcHJlZGljdEVuYWJsZWRQcm9wZXJ0eSApLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICAgIH0gKSApO1xyXG4gIH1cclxufVxyXG5cclxuY2FsY3VsdXNHcmFwaGVyLnJlZ2lzdGVyKCAnVGFuZ2VudENoZWNrYm94JywgVGFuZ2VudENoZWNrYm94ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUdwRSxTQUFTQyxjQUFjLFFBQVEsdUNBQXVDO0FBQ3RFLFNBQVNDLElBQUksRUFBRUMsUUFBUSxRQUFRLG1DQUFtQztBQUNsRSxPQUFPQyxRQUFRLE1BQTJCLGdDQUFnQztBQUUxRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHNCQUFzQixNQUFNLGlDQUFpQztBQUNwRSxPQUFPQyx3QkFBd0IsTUFBTSxnQ0FBZ0M7QUFDckUsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBQzFELE9BQU9DLDRCQUE0QixNQUFNLG1DQUFtQztBQUU1RSxlQUFlLE1BQU1DLGVBQWUsU0FBU04sUUFBUSxDQUFDO0VBRTdDTyxXQUFXQSxDQUFFQyx1QkFBMEMsRUFDMUNDLHNCQUFrRCxFQUFFQyxNQUFjLEVBQUc7SUFFdkYsTUFBTUMsSUFBSSxHQUFHUCxtQkFBbUIsQ0FBQ1EsVUFBVSxDQUFDLENBQUM7SUFFN0MsTUFBTUMsSUFBSSxHQUFHLElBQUlkLFFBQVEsQ0FBRUcsc0JBQXNCLENBQUNZLFFBQVEsQ0FBQ0MscUJBQXFCLEVBQUU7TUFDaEZDLElBQUksRUFBRWIsd0JBQXdCLENBQUNjLFlBQVk7TUFDM0NDLFFBQVEsRUFBRWIsNEJBQTRCLENBQUNjLG1CQUFtQjtNQUMxREMsU0FBUyxFQUFFZiw0QkFBNEIsQ0FBQ2dCLG9CQUFvQjtNQUM1RFgsTUFBTSxFQUFFQSxNQUFNLENBQUNZLFlBQVksQ0FBRSxNQUFPO0lBQ3RDLENBQUUsQ0FBQztJQUVILE1BQU1DLEdBQUcsR0FBRyxJQUFJekIsSUFBSSxDQUFFO01BQ3BCMEIsUUFBUSxFQUFFLENBQUViLElBQUksRUFBRUUsSUFBSSxDQUFFO01BQ3hCWSxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVqQix1QkFBdUIsRUFBRWUsR0FBRyxFQUFFMUIsY0FBYyxDQUNqRCxDQUFDLENBQUMsRUFBRU0sd0JBQXdCLENBQUN1QixnQkFBZ0IsRUFBRTtNQUM3Q0MsZUFBZSxFQUFFL0IsZUFBZSxDQUFDZ0MsR0FBRyxDQUFFbkIsc0JBQXVCLENBQUM7TUFDOURDLE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUUsQ0FBQztFQUNUO0FBQ0Y7QUFFQVQsZUFBZSxDQUFDNEIsUUFBUSxDQUFFLGlCQUFpQixFQUFFdkIsZUFBZ0IsQ0FBQyJ9