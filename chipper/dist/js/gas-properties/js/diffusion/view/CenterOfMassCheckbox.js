// Copyright 2022, University of Colorado Boulder

/**
 * CenterOfMassCheckbox is the checkbox used to show/hide the center-of-mass indicators on the container.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import GasPropertiesCheckbox from '../../common/view/GasPropertiesCheckbox.js';
import GasPropertiesIconFactory from '../../common/view/GasPropertiesIconFactory.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';
export default class CenterOfMassCheckbox extends GasPropertiesCheckbox {
  constructor(centerOfMassVisibleProperty, providedOptions) {
    const options = optionize()({
      // GasPropertiesCheckboxOptions
      textStringProperty: GasPropertiesStrings.centerOfMassStringProperty,
      icon: GasPropertiesIconFactory.createCenterOfMassIcon(),
      textIconSpacing: 12
    }, providedOptions);
    super(centerOfMassVisibleProperty, options);
  }
}
gasProperties.register('CenterOfMassCheckbox', CenterOfMassCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJHYXNQcm9wZXJ0aWVzQ2hlY2tib3giLCJHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1N0cmluZ3MiLCJDZW50ZXJPZk1hc3NDaGVja2JveCIsImNvbnN0cnVjdG9yIiwiY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRleHRTdHJpbmdQcm9wZXJ0eSIsImNlbnRlck9mTWFzc1N0cmluZ1Byb3BlcnR5IiwiaWNvbiIsImNyZWF0ZUNlbnRlck9mTWFzc0ljb24iLCJ0ZXh0SWNvblNwYWNpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNlbnRlck9mTWFzc0NoZWNrYm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDZW50ZXJPZk1hc3NDaGVja2JveCBpcyB0aGUgY2hlY2tib3ggdXNlZCB0byBzaG93L2hpZGUgdGhlIGNlbnRlci1vZi1tYXNzIGluZGljYXRvcnMgb24gdGhlIGNvbnRhaW5lci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzQ2hlY2tib3gsIHsgR2FzUHJvcGVydGllc0NoZWNrYm94T3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0dhc1Byb3BlcnRpZXNDaGVja2JveC5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvR2FzUHJvcGVydGllc0ljb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IGdhc1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vZ2FzUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzU3RyaW5ncyBmcm9tICcuLi8uLi9HYXNQcm9wZXJ0aWVzU3RyaW5ncy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgQ2VudGVyT2ZNYXNzQ2hlY2tib3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEdhc1Byb3BlcnRpZXNDaGVja2JveE9wdGlvbnMsICd0ZXh0U3RyaW5nUHJvcGVydHknIHwgJ2ljb24nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENlbnRlck9mTWFzc0NoZWNrYm94IGV4dGVuZHMgR2FzUHJvcGVydGllc0NoZWNrYm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjZW50ZXJPZk1hc3NWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM6IENlbnRlck9mTWFzc0NoZWNrYm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENlbnRlck9mTWFzc0NoZWNrYm94T3B0aW9ucywgU2VsZk9wdGlvbnMsIEdhc1Byb3BlcnRpZXNDaGVja2JveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEdhc1Byb3BlcnRpZXNDaGVja2JveE9wdGlvbnNcclxuICAgICAgdGV4dFN0cmluZ1Byb3BlcnR5OiBHYXNQcm9wZXJ0aWVzU3RyaW5ncy5jZW50ZXJPZk1hc3NTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgaWNvbjogR2FzUHJvcGVydGllc0ljb25GYWN0b3J5LmNyZWF0ZUNlbnRlck9mTWFzc0ljb24oKSxcclxuICAgICAgdGV4dEljb25TcGFjaW5nOiAxMlxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGNlbnRlck9mTWFzc1Zpc2libGVQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ0NlbnRlck9mTWFzc0NoZWNrYm94JywgQ2VudGVyT2ZNYXNzQ2hlY2tib3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0MscUJBQXFCLE1BQXdDLDRDQUE0QztBQUNoSCxPQUFPQyx3QkFBd0IsTUFBTSwrQ0FBK0M7QUFDcEYsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFNaEUsZUFBZSxNQUFNQyxvQkFBb0IsU0FBU0oscUJBQXFCLENBQUM7RUFFL0RLLFdBQVdBLENBQUVDLDJCQUE4QyxFQUFFQyxlQUE0QyxFQUFHO0lBRWpILE1BQU1DLE9BQU8sR0FBR1QsU0FBUyxDQUF5RSxDQUFDLENBQUU7TUFFbkc7TUFDQVUsa0JBQWtCLEVBQUVOLG9CQUFvQixDQUFDTywwQkFBMEI7TUFDbkVDLElBQUksRUFBRVYsd0JBQXdCLENBQUNXLHNCQUFzQixDQUFDLENBQUM7TUFDdkRDLGVBQWUsRUFBRTtJQUNuQixDQUFDLEVBQUVOLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFRCwyQkFBMkIsRUFBRUUsT0FBUSxDQUFDO0VBQy9DO0FBQ0Y7QUFFQU4sYUFBYSxDQUFDWSxRQUFRLENBQUUsc0JBQXNCLEVBQUVWLG9CQUFxQixDQUFDIn0=