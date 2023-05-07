// Copyright 2022, University of Colorado Boulder

/**
 * Demo for Checkbox
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { Font, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../Checkbox.js';
export default function demoCheckbox(layoutBounds) {
  const property = new BooleanProperty(true);
  const enabledProperty = new BooleanProperty(true, {
    phetioFeatured: true
  });
  const checkbox = new Checkbox(property, new Text('My Awesome Checkbox', {
    font: new Font({
      size: 30
    })
  }), {
    enabledProperty: enabledProperty
  });
  const enabledCheckbox = new Checkbox(enabledProperty, new Text('enabled', {
    font: new Font({
      size: 20
    })
  }));
  return new VBox({
    children: [checkbox, enabledCheckbox],
    spacing: 30,
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJGb250IiwiVGV4dCIsIlZCb3giLCJDaGVja2JveCIsImRlbW9DaGVja2JveCIsImxheW91dEJvdW5kcyIsInByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwicGhldGlvRmVhdHVyZWQiLCJjaGVja2JveCIsImZvbnQiLCJzaXplIiwiZW5hYmxlZENoZWNrYm94IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiY2VudGVyIl0sInNvdXJjZXMiOlsiZGVtb0NoZWNrYm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciBDaGVja2JveFxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCB7IEZvbnQsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vQ2hlY2tib3guanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0NoZWNrYm94KCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XHJcblxyXG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xyXG4gIGNvbnN0IGVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfSApO1xyXG5cclxuICBjb25zdCBjaGVja2JveCA9IG5ldyBDaGVja2JveCggcHJvcGVydHksIG5ldyBUZXh0KCAnTXkgQXdlc29tZSBDaGVja2JveCcsIHtcclxuICAgIGZvbnQ6IG5ldyBGb250KCB7IHNpemU6IDMwIH0gKVxyXG4gIH0gKSwge1xyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBlbmFibGVkUHJvcGVydHlcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGVuYWJsZWRDaGVja2JveCA9IG5ldyBDaGVja2JveCggZW5hYmxlZFByb3BlcnR5LCBuZXcgVGV4dCggJ2VuYWJsZWQnLCB7XHJcbiAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiAyMCB9IClcclxuICB9ICkgKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBWQm94KCB7XHJcbiAgICBjaGlsZHJlbjogWyBjaGVja2JveCwgZW5hYmxlZENoZWNrYm94IF0sXHJcbiAgICBzcGFjaW5nOiAzMCxcclxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxyXG4gIH0gKTtcclxufSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFFcEUsU0FBU0MsSUFBSSxFQUFRQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDMUUsT0FBT0MsUUFBUSxNQUFNLG1CQUFtQjtBQUV4QyxlQUFlLFNBQVNDLFlBQVlBLENBQUVDLFlBQXFCLEVBQVM7RUFFbEUsTUFBTUMsUUFBUSxHQUFHLElBQUlQLGVBQWUsQ0FBRSxJQUFLLENBQUM7RUFDNUMsTUFBTVEsZUFBZSxHQUFHLElBQUlSLGVBQWUsQ0FBRSxJQUFJLEVBQUU7SUFBRVMsY0FBYyxFQUFFO0VBQUssQ0FBRSxDQUFDO0VBRTdFLE1BQU1DLFFBQVEsR0FBRyxJQUFJTixRQUFRLENBQUVHLFFBQVEsRUFBRSxJQUFJTCxJQUFJLENBQUUscUJBQXFCLEVBQUU7SUFDeEVTLElBQUksRUFBRSxJQUFJVixJQUFJLENBQUU7TUFBRVcsSUFBSSxFQUFFO0lBQUcsQ0FBRTtFQUMvQixDQUFFLENBQUMsRUFBRTtJQUNISixlQUFlLEVBQUVBO0VBQ25CLENBQUUsQ0FBQztFQUVILE1BQU1LLGVBQWUsR0FBRyxJQUFJVCxRQUFRLENBQUVJLGVBQWUsRUFBRSxJQUFJTixJQUFJLENBQUUsU0FBUyxFQUFFO0lBQzFFUyxJQUFJLEVBQUUsSUFBSVYsSUFBSSxDQUFFO01BQUVXLElBQUksRUFBRTtJQUFHLENBQUU7RUFDL0IsQ0FBRSxDQUFFLENBQUM7RUFFTCxPQUFPLElBQUlULElBQUksQ0FBRTtJQUNmVyxRQUFRLEVBQUUsQ0FBRUosUUFBUSxFQUFFRyxlQUFlLENBQUU7SUFDdkNFLE9BQU8sRUFBRSxFQUFFO0lBQ1hDLE1BQU0sRUFBRVYsWUFBWSxDQUFDVTtFQUN2QixDQUFFLENBQUM7QUFDTCJ9