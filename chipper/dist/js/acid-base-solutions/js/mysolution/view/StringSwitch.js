// Copyright 2022, University of Colorado Boulder

/**
 * StringSwitch is an ABSwitch that switches between string values, and is labeled with strings.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { AlignBox, AlignGroup, Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
export default class StringSwitch extends ABSwitch {
  constructor(property, valueA, stringAProperty, valueB, stringBProperty, providedOptions) {
    const options = providedOptions;

    // To give both labels the same effective width, and keep the toggle switch centered
    const alignGroup = new AlignGroup();

    // A
    const textA = new Text(stringAProperty, combineOptions({}, options.textOptions, {
      tandem: options.tandem.createTandem(`${valueA}Text`)
    }));
    const nodeA = new AlignBox(textA, {
      group: alignGroup,
      xAlign: 'right'
    });

    // B
    const textB = new Text(stringBProperty, combineOptions({}, options.textOptions, {
      tandem: options.tandem.createTandem(`${valueB}Text`)
    }));
    const nodeB = new AlignBox(textB, {
      group: alignGroup,
      xAlign: 'left'
    });
    super(property, valueA, nodeA, valueB, nodeB, options);
    this.disposeStringSwitch = () => {
      textA.dispose();
      textB.dispose();
    };
  }
  dispose() {
    this.disposeStringSwitch();
    super.dispose();
  }
}
acidBaseSolutions.register('StringSwitch', StringSwitch);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbGlnbkJveCIsIkFsaWduR3JvdXAiLCJUZXh0IiwiQUJTd2l0Y2giLCJjb21iaW5lT3B0aW9ucyIsImFjaWRCYXNlU29sdXRpb25zIiwiU3RyaW5nU3dpdGNoIiwiY29uc3RydWN0b3IiLCJwcm9wZXJ0eSIsInZhbHVlQSIsInN0cmluZ0FQcm9wZXJ0eSIsInZhbHVlQiIsInN0cmluZ0JQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJhbGlnbkdyb3VwIiwidGV4dEEiLCJ0ZXh0T3B0aW9ucyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm5vZGVBIiwiZ3JvdXAiLCJ4QWxpZ24iLCJ0ZXh0QiIsIm5vZGVCIiwiZGlzcG9zZVN0cmluZ1N3aXRjaCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0cmluZ1N3aXRjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3RyaW5nU3dpdGNoIGlzIGFuIEFCU3dpdGNoIHRoYXQgc3dpdGNoZXMgYmV0d2VlbiBzdHJpbmcgdmFsdWVzLCBhbmQgaXMgbGFiZWxlZCB3aXRoIHN0cmluZ3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduR3JvdXAsIFRleHQsIFRleHRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFCU3dpdGNoLCB7IEFCU3dpdGNoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BQlN3aXRjaC5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBhY2lkQmFzZVNvbHV0aW9ucyBmcm9tICcuLi8uLi9hY2lkQmFzZVNvbHV0aW9ucy5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHRleHRPcHRpb25zPzogU3RyaWN0T21pdDxUZXh0T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgU3RyaW5nU3dpdGNoT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQUJTd2l0Y2hPcHRpb25zICYgUGlja1JlcXVpcmVkPEFCU3dpdGNoT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RyaW5nU3dpdGNoPFQgZXh0ZW5kcyBzdHJpbmc+IGV4dGVuZHMgQUJTd2l0Y2g8VD4ge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VTdHJpbmdTd2l0Y2g6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydHk6IFByb3BlcnR5PFQ+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWVBOiBULCBzdHJpbmdBUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZUI6IFQsIHN0cmluZ0JQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogU3RyaW5nU3dpdGNoT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gcHJvdmlkZWRPcHRpb25zO1xyXG5cclxuICAgIC8vIFRvIGdpdmUgYm90aCBsYWJlbHMgdGhlIHNhbWUgZWZmZWN0aXZlIHdpZHRoLCBhbmQga2VlcCB0aGUgdG9nZ2xlIHN3aXRjaCBjZW50ZXJlZFxyXG4gICAgY29uc3QgYWxpZ25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCk7XHJcblxyXG4gICAgLy8gQVxyXG4gICAgY29uc3QgdGV4dEEgPSBuZXcgVGV4dCggc3RyaW5nQVByb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHt9LCBvcHRpb25zLnRleHRPcHRpb25zLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBgJHt2YWx1ZUF9VGV4dGAgKVxyXG4gICAgfSApICk7XHJcbiAgICBjb25zdCBub2RlQSA9IG5ldyBBbGlnbkJveCggdGV4dEEsIHtcclxuICAgICAgZ3JvdXA6IGFsaWduR3JvdXAsXHJcbiAgICAgIHhBbGlnbjogJ3JpZ2h0J1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEJcclxuICAgIGNvbnN0IHRleHRCID0gbmV3IFRleHQoIHN0cmluZ0JQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7fSwgb3B0aW9ucy50ZXh0T3B0aW9ucywge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggYCR7dmFsdWVCfVRleHRgIClcclxuICAgIH0gKSApO1xyXG4gICAgY29uc3Qgbm9kZUIgPSBuZXcgQWxpZ25Cb3goIHRleHRCLCB7XHJcbiAgICAgIGdyb3VwOiBhbGlnbkdyb3VwLFxyXG4gICAgICB4QWxpZ246ICdsZWZ0J1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBwcm9wZXJ0eSwgdmFsdWVBLCBub2RlQSwgdmFsdWVCLCBub2RlQiwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVN0cmluZ1N3aXRjaCA9ICgpID0+IHtcclxuICAgICAgdGV4dEEuZGlzcG9zZSgpO1xyXG4gICAgICB0ZXh0Qi5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VTdHJpbmdTd2l0Y2goKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmFjaWRCYXNlU29sdXRpb25zLnJlZ2lzdGVyKCAnU3RyaW5nU3dpdGNoJywgU3RyaW5nU3dpdGNoICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLFFBQVEsRUFBRUMsVUFBVSxFQUFFQyxJQUFJLFFBQXFCLG1DQUFtQztBQUMzRixPQUFPQyxRQUFRLE1BQTJCLGdDQUFnQztBQUMxRSxTQUFTQyxjQUFjLFFBQVEsdUNBQXVDO0FBQ3RFLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQVkxRCxlQUFlLE1BQU1DLFlBQVksU0FBMkJILFFBQVEsQ0FBSTtFQUkvREksV0FBV0EsQ0FBRUMsUUFBcUIsRUFDckJDLE1BQVMsRUFBRUMsZUFBMEMsRUFDckRDLE1BQVMsRUFBRUMsZUFBMEMsRUFDckRDLGVBQW9DLEVBQUc7SUFFekQsTUFBTUMsT0FBTyxHQUFHRCxlQUFlOztJQUUvQjtJQUNBLE1BQU1FLFVBQVUsR0FBRyxJQUFJZCxVQUFVLENBQUMsQ0FBQzs7SUFFbkM7SUFDQSxNQUFNZSxLQUFLLEdBQUcsSUFBSWQsSUFBSSxDQUFFUSxlQUFlLEVBQUVOLGNBQWMsQ0FBZSxDQUFDLENBQUMsRUFBRVUsT0FBTyxDQUFDRyxXQUFXLEVBQUU7TUFDN0ZDLE1BQU0sRUFBRUosT0FBTyxDQUFDSSxNQUFNLENBQUNDLFlBQVksQ0FBRyxHQUFFVixNQUFPLE1BQU07SUFDdkQsQ0FBRSxDQUFFLENBQUM7SUFDTCxNQUFNVyxLQUFLLEdBQUcsSUFBSXBCLFFBQVEsQ0FBRWdCLEtBQUssRUFBRTtNQUNqQ0ssS0FBSyxFQUFFTixVQUFVO01BQ2pCTyxNQUFNLEVBQUU7SUFDVixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyxLQUFLLEdBQUcsSUFBSXJCLElBQUksQ0FBRVUsZUFBZSxFQUFFUixjQUFjLENBQWUsQ0FBQyxDQUFDLEVBQUVVLE9BQU8sQ0FBQ0csV0FBVyxFQUFFO01BQzdGQyxNQUFNLEVBQUVKLE9BQU8sQ0FBQ0ksTUFBTSxDQUFDQyxZQUFZLENBQUcsR0FBRVIsTUFBTyxNQUFNO0lBQ3ZELENBQUUsQ0FBRSxDQUFDO0lBQ0wsTUFBTWEsS0FBSyxHQUFHLElBQUl4QixRQUFRLENBQUV1QixLQUFLLEVBQUU7TUFDakNGLEtBQUssRUFBRU4sVUFBVTtNQUNqQk8sTUFBTSxFQUFFO0lBQ1YsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFZCxRQUFRLEVBQUVDLE1BQU0sRUFBRVcsS0FBSyxFQUFFVCxNQUFNLEVBQUVhLEtBQUssRUFBRVYsT0FBUSxDQUFDO0lBRXhELElBQUksQ0FBQ1csbUJBQW1CLEdBQUcsTUFBTTtNQUMvQlQsS0FBSyxDQUFDVSxPQUFPLENBQUMsQ0FBQztNQUNmSCxLQUFLLENBQUNHLE9BQU8sQ0FBQyxDQUFDO0lBQ2pCLENBQUM7RUFDSDtFQUVnQkEsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0QsbUJBQW1CLENBQUMsQ0FBQztJQUMxQixLQUFLLENBQUNDLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQXJCLGlCQUFpQixDQUFDc0IsUUFBUSxDQUFFLGNBQWMsRUFBRXJCLFlBQWEsQ0FBQyJ9