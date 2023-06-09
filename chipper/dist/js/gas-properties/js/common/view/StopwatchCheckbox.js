// Copyright 2022, University of Colorado Boulder

/**
 * StopwatchCheckbox is the 'Stopwatch' check box, used to control visibility of the stopwatch.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';
import GasPropertiesCheckbox from './GasPropertiesCheckbox.js';
import GasPropertiesIconFactory from './GasPropertiesIconFactory.js';
export default class StopwatchCheckbox extends GasPropertiesCheckbox {
  constructor(stopwatchVisibleProperty, providedOptions) {
    const options = optionize()({
      // GasPropertiesCheckboxOptions
      textStringProperty: GasPropertiesStrings.stopwatchStringProperty,
      icon: GasPropertiesIconFactory.createStopwatchIcon()
    }, providedOptions);
    super(stopwatchVisibleProperty, options);
  }
}
gasProperties.register('StopwatchCheckbox', StopwatchCheckbox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1N0cmluZ3MiLCJHYXNQcm9wZXJ0aWVzQ2hlY2tib3giLCJHYXNQcm9wZXJ0aWVzSWNvbkZhY3RvcnkiLCJTdG9wd2F0Y2hDaGVja2JveCIsImNvbnN0cnVjdG9yIiwic3RvcHdhdGNoVmlzaWJsZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRleHRTdHJpbmdQcm9wZXJ0eSIsInN0b3B3YXRjaFN0cmluZ1Byb3BlcnR5IiwiaWNvbiIsImNyZWF0ZVN0b3B3YXRjaEljb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0b3B3YXRjaENoZWNrYm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTdG9wd2F0Y2hDaGVja2JveCBpcyB0aGUgJ1N0b3B3YXRjaCcgY2hlY2sgYm94LCB1c2VkIHRvIGNvbnRyb2wgdmlzaWJpbGl0eSBvZiB0aGUgc3RvcHdhdGNoLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IGdhc1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vZ2FzUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzU3RyaW5ncyBmcm9tICcuLi8uLi9HYXNQcm9wZXJ0aWVzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzQ2hlY2tib3gsIHsgR2FzUHJvcGVydGllc0NoZWNrYm94T3B0aW9ucyB9IGZyb20gJy4vR2FzUHJvcGVydGllc0NoZWNrYm94LmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNJY29uRmFjdG9yeSBmcm9tICcuL0dhc1Byb3BlcnRpZXNJY29uRmFjdG9yeS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgU3RvcHdhdGNoQ2hlY2tib3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEdhc1Byb3BlcnRpZXNDaGVja2JveE9wdGlvbnMsICd0ZXh0U3RyaW5nUHJvcGVydHknIHwgJ2ljb24nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3B3YXRjaENoZWNrYm94IGV4dGVuZHMgR2FzUHJvcGVydGllc0NoZWNrYm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdG9wd2F0Y2hWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM6IFN0b3B3YXRjaENoZWNrYm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFN0b3B3YXRjaENoZWNrYm94T3B0aW9ucywgU2VsZk9wdGlvbnMsIEdhc1Byb3BlcnRpZXNDaGVja2JveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEdhc1Byb3BlcnRpZXNDaGVja2JveE9wdGlvbnNcclxuICAgICAgdGV4dFN0cmluZ1Byb3BlcnR5OiBHYXNQcm9wZXJ0aWVzU3RyaW5ncy5zdG9wd2F0Y2hTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgaWNvbjogR2FzUHJvcGVydGllc0ljb25GYWN0b3J5LmNyZWF0ZVN0b3B3YXRjaEljb24oKVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHN0b3B3YXRjaFZpc2libGVQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZ2FzUHJvcGVydGllcy5yZWdpc3RlciggJ1N0b3B3YXRjaENoZWNrYm94JywgU3RvcHdhdGNoQ2hlY2tib3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MscUJBQXFCLE1BQXdDLDRCQUE0QjtBQUNoRyxPQUFPQyx3QkFBd0IsTUFBTSwrQkFBK0I7QUFNcEUsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU0YscUJBQXFCLENBQUM7RUFFNURHLFdBQVdBLENBQUVDLHdCQUEyQyxFQUFFQyxlQUF5QyxFQUFHO0lBRTNHLE1BQU1DLE9BQU8sR0FBR1QsU0FBUyxDQUFzRSxDQUFDLENBQUU7TUFFaEc7TUFDQVUsa0JBQWtCLEVBQUVSLG9CQUFvQixDQUFDUyx1QkFBdUI7TUFDaEVDLElBQUksRUFBRVIsd0JBQXdCLENBQUNTLG1CQUFtQixDQUFDO0lBQ3JELENBQUMsRUFBRUwsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVELHdCQUF3QixFQUFFRSxPQUFRLENBQUM7RUFDNUM7QUFDRjtBQUVBUixhQUFhLENBQUNhLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRVQsaUJBQWtCLENBQUMifQ==