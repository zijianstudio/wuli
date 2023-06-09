// Copyright 2022-2023, University of Colorado Boulder

/**
 * Demo for AquaRadioButtonGroup
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import { Font, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../buttons/RectangularRadioButtonGroup.js';
export default function demoRectangularRadioButtonGroup(layoutBounds) {
  const font = new Font({
    size: 20
  });
  const horizontalChoices = ['left', 'center', 'right'];
  const horizontalProperty = new StringProperty(horizontalChoices[0]);
  const horizontalItems = _.map(horizontalChoices, choice => {
    return {
      createNode: () => new Text(choice, {
        font: font
      }),
      value: choice
    };
  });
  const horizontalGroup = new RectangularRadioButtonGroup(horizontalProperty, horizontalItems, {
    orientation: 'horizontal'
  });
  const verticalChoices = ['top', 'center', 'bottom'];
  const verticalProperty = new StringProperty(verticalChoices[0]);
  const verticalItems = _.map(verticalChoices, choice => {
    return {
      createNode: () => new Text(choice, {
        font: font
      }),
      value: choice
    };
  });
  const verticalGroup = new RectangularRadioButtonGroup(verticalProperty, verticalItems, {
    orientation: 'vertical'
  });
  return new VBox({
    children: [horizontalGroup, verticalGroup],
    spacing: 80,
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIkZvbnQiLCJUZXh0IiwiVkJveCIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsImRlbW9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJsYXlvdXRCb3VuZHMiLCJmb250Iiwic2l6ZSIsImhvcml6b250YWxDaG9pY2VzIiwiaG9yaXpvbnRhbFByb3BlcnR5IiwiaG9yaXpvbnRhbEl0ZW1zIiwiXyIsIm1hcCIsImNob2ljZSIsImNyZWF0ZU5vZGUiLCJ2YWx1ZSIsImhvcml6b250YWxHcm91cCIsIm9yaWVudGF0aW9uIiwidmVydGljYWxDaG9pY2VzIiwidmVydGljYWxQcm9wZXJ0eSIsInZlcnRpY2FsSXRlbXMiLCJ2ZXJ0aWNhbEdyb3VwIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwiY2VudGVyIl0sInNvdXJjZXMiOlsiZGVtb1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciBBcXVhUmFkaW9CdXR0b25Hcm91cFxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgeyBGb250LCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XHJcblxyXG4gIGNvbnN0IGZvbnQgPSBuZXcgRm9udCggeyBzaXplOiAyMCB9ICk7XHJcblxyXG4gIGNvbnN0IGhvcml6b250YWxDaG9pY2VzID0gWyAnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnIF07XHJcbiAgY29uc3QgaG9yaXpvbnRhbFByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCBob3Jpem9udGFsQ2hvaWNlc1sgMCBdICk7XHJcbiAgY29uc3QgaG9yaXpvbnRhbEl0ZW1zID0gXy5tYXAoIGhvcml6b250YWxDaG9pY2VzLFxyXG4gICAgY2hvaWNlID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggY2hvaWNlLCB7IGZvbnQ6IGZvbnQgfSApLFxyXG4gICAgICAgIHZhbHVlOiBjaG9pY2VcclxuICAgICAgfTtcclxuICAgIH0gKTtcclxuICBjb25zdCBob3Jpem9udGFsR3JvdXAgPSBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKCBob3Jpem9udGFsUHJvcGVydHksIGhvcml6b250YWxJdGVtcywge1xyXG4gICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJ1xyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgdmVydGljYWxDaG9pY2VzID0gWyAndG9wJywgJ2NlbnRlcicsICdib3R0b20nIF07XHJcbiAgY29uc3QgdmVydGljYWxQcm9wZXJ0eSA9IG5ldyBTdHJpbmdQcm9wZXJ0eSggdmVydGljYWxDaG9pY2VzWyAwIF0gKTtcclxuICBjb25zdCB2ZXJ0aWNhbEl0ZW1zID0gXy5tYXAoIHZlcnRpY2FsQ2hvaWNlcyxcclxuICAgIGNob2ljZSA9PiB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoIGNob2ljZSwgeyBmb250OiBmb250IH0gKSxcclxuICAgICAgICB2YWx1ZTogY2hvaWNlXHJcbiAgICAgIH07XHJcbiAgICB9ICk7XHJcbiAgY29uc3QgdmVydGljYWxHcm91cCA9IG5ldyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAoIHZlcnRpY2FsUHJvcGVydHksIHZlcnRpY2FsSXRlbXMsIHtcclxuICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnXHJcbiAgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IFZCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbIGhvcml6b250YWxHcm91cCwgdmVydGljYWxHcm91cCBdLFxyXG4gICAgc3BhY2luZzogODAsXHJcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcclxuICB9ICk7XHJcbn0iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sdUNBQXVDO0FBRWxFLFNBQVNDLElBQUksRUFBUUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzFFLE9BQU9DLDJCQUEyQixNQUFNLDhDQUE4QztBQUV0RixlQUFlLFNBQVNDLCtCQUErQkEsQ0FBRUMsWUFBcUIsRUFBUztFQUVyRixNQUFNQyxJQUFJLEdBQUcsSUFBSU4sSUFBSSxDQUFFO0lBQUVPLElBQUksRUFBRTtFQUFHLENBQUUsQ0FBQztFQUVyQyxNQUFNQyxpQkFBaUIsR0FBRyxDQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFFO0VBQ3ZELE1BQU1DLGtCQUFrQixHQUFHLElBQUlWLGNBQWMsQ0FBRVMsaUJBQWlCLENBQUUsQ0FBQyxDQUFHLENBQUM7RUFDdkUsTUFBTUUsZUFBZSxHQUFHQyxDQUFDLENBQUNDLEdBQUcsQ0FBRUosaUJBQWlCLEVBQzlDSyxNQUFNLElBQUk7SUFDUixPQUFPO01BQ0xDLFVBQVUsRUFBRUEsQ0FBQSxLQUFNLElBQUliLElBQUksQ0FBRVksTUFBTSxFQUFFO1FBQUVQLElBQUksRUFBRUE7TUFBSyxDQUFFLENBQUM7TUFDcERTLEtBQUssRUFBRUY7SUFDVCxDQUFDO0VBQ0gsQ0FBRSxDQUFDO0VBQ0wsTUFBTUcsZUFBZSxHQUFHLElBQUliLDJCQUEyQixDQUFFTSxrQkFBa0IsRUFBRUMsZUFBZSxFQUFFO0lBQzVGTyxXQUFXLEVBQUU7RUFDZixDQUFFLENBQUM7RUFFSCxNQUFNQyxlQUFlLEdBQUcsQ0FBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBRTtFQUNyRCxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJcEIsY0FBYyxDQUFFbUIsZUFBZSxDQUFFLENBQUMsQ0FBRyxDQUFDO0VBQ25FLE1BQU1FLGFBQWEsR0FBR1QsQ0FBQyxDQUFDQyxHQUFHLENBQUVNLGVBQWUsRUFDMUNMLE1BQU0sSUFBSTtJQUNSLE9BQU87TUFDTEMsVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSWIsSUFBSSxDQUFFWSxNQUFNLEVBQUU7UUFBRVAsSUFBSSxFQUFFQTtNQUFLLENBQUUsQ0FBQztNQUNwRFMsS0FBSyxFQUFFRjtJQUNULENBQUM7RUFDSCxDQUFFLENBQUM7RUFDTCxNQUFNUSxhQUFhLEdBQUcsSUFBSWxCLDJCQUEyQixDQUFFZ0IsZ0JBQWdCLEVBQUVDLGFBQWEsRUFBRTtJQUN0RkgsV0FBVyxFQUFFO0VBQ2YsQ0FBRSxDQUFDO0VBRUgsT0FBTyxJQUFJZixJQUFJLENBQUU7SUFDZm9CLFFBQVEsRUFBRSxDQUFFTixlQUFlLEVBQUVLLGFBQWEsQ0FBRTtJQUM1Q0UsT0FBTyxFQUFFLEVBQUU7SUFDWEMsTUFBTSxFQUFFbkIsWUFBWSxDQUFDbUI7RUFDdkIsQ0FBRSxDQUFDO0FBQ0wifQ==