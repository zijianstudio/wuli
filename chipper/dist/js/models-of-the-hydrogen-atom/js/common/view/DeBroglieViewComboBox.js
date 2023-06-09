// Copyright 2022-2023, University of Colorado Boulder

/**
 * DeBroglieViewComboBox is the combo box for selecting which view of the de Broglie model show be displayed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ComboBox from '../../../../sun/js/ComboBox.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Text } from '../../../../scenery/js/imports.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';
export default class DeBroglieViewComboBox extends ComboBox {
  constructor(deBroglieViewProperty, listboxParent, providedOptions) {
    const options = optionize()({
      // ComboBoxOptions
      xMargin: 10,
      yMargin: 6
    }, providedOptions);
    const textOptions = {
      font: new PhetFont(14),
      maxWidth: 150
    };
    const radialViewText = new Text(ModelsOfTheHydrogenAtomStrings.radialViewStringProperty, optionize()({
      tandem: options.tandem.createTandem('radialViewText')
    }, textOptions));

    // threeDViewText does not match '3DViewText' tandem name because JavaScript identifiers cannot begin with a number.
    const threeDViewText = new Text(ModelsOfTheHydrogenAtomStrings['3DViewStringProperty'], optionize()({
      tandem: options.tandem.createTandem('3DViewText')
    }, textOptions));
    const brightnessViewText = new Text(ModelsOfTheHydrogenAtomStrings.brightnessViewStringProperty, optionize()({
      tandem: options.tandem.createTandem('brightnessViewText')
    }, textOptions));
    const items = [{
      value: 'radial',
      createNode: () => radialViewText,
      tandemName: `radial${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
    }, {
      value: '3D',
      createNode: () => threeDViewText,
      tandemName: `3D${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
    }, {
      value: 'brightness',
      createNode: () => brightnessViewText,
      tandemName: `brightness${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
    }];
    super(deBroglieViewProperty, items, listboxParent, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('DeBroglieViewComboBox', DeBroglieViewComboBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21ib0JveCIsIm9wdGlvbml6ZSIsIlRleHQiLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIlBoZXRGb250IiwiTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzIiwiRGVCcm9nbGllVmlld0NvbWJvQm94IiwiY29uc3RydWN0b3IiLCJkZUJyb2dsaWVWaWV3UHJvcGVydHkiLCJsaXN0Ym94UGFyZW50IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidGV4dE9wdGlvbnMiLCJmb250IiwibWF4V2lkdGgiLCJyYWRpYWxWaWV3VGV4dCIsInJhZGlhbFZpZXdTdHJpbmdQcm9wZXJ0eSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInRocmVlRFZpZXdUZXh0IiwiYnJpZ2h0bmVzc1ZpZXdUZXh0IiwiYnJpZ2h0bmVzc1ZpZXdTdHJpbmdQcm9wZXJ0eSIsIml0ZW1zIiwidmFsdWUiLCJjcmVhdGVOb2RlIiwidGFuZGVtTmFtZSIsIklURU1fVEFOREVNX05BTUVfU1VGRklYIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGVCcm9nbGllVmlld0NvbWJvQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlQnJvZ2xpZVZpZXdDb21ib0JveCBpcyB0aGUgY29tYm8gYm94IGZvciBzZWxlY3Rpbmcgd2hpY2ggdmlldyBvZiB0aGUgZGUgQnJvZ2xpZSBtb2RlbCBzaG93IGJlIGRpc3BsYXllZC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQ29tYm9Cb3gsIHsgQ29tYm9Cb3hJdGVtLCBDb21ib0JveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20gZnJvbSAnLi4vLi4vbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgeyBEZUJyb2dsaWVWaWV3IH0gZnJvbSAnLi4vbW9kZWwvRGVCcm9nbGllVmlldy5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBNb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MgZnJvbSAnLi4vLi4vTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBEZUJyb2dsaWVWaWV3Q29tYm9Cb3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlVHJhbnNsYXRpb25PcHRpb25zICYgUGlja1JlcXVpcmVkPENvbWJvQm94T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVCcm9nbGllVmlld0NvbWJvQm94IGV4dGVuZHMgQ29tYm9Cb3g8RGVCcm9nbGllVmlldz4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGRlQnJvZ2xpZVZpZXdQcm9wZXJ0eTogUHJvcGVydHk8RGVCcm9nbGllVmlldz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBsaXN0Ym94UGFyZW50OiBOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBEZUJyb2dsaWVWaWV3Q29tYm9Cb3hPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RGVCcm9nbGllVmlld0NvbWJvQm94T3B0aW9ucywgU2VsZk9wdGlvbnMsIENvbWJvQm94T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gQ29tYm9Cb3hPcHRpb25zXHJcbiAgICAgIHhNYXJnaW46IDEwLFxyXG4gICAgICB5TWFyZ2luOiA2XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0T3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNCApLFxyXG4gICAgICBtYXhXaWR0aDogMTUwXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHJhZGlhbFZpZXdUZXh0ID0gbmV3IFRleHQoIE1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncy5yYWRpYWxWaWV3U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbml6ZTxUZXh0T3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgVGV4dE9wdGlvbnM+KCkoIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhZGlhbFZpZXdUZXh0JyApXHJcbiAgICAgIH0sIHRleHRPcHRpb25zICkgKTtcclxuXHJcbiAgICAvLyB0aHJlZURWaWV3VGV4dCBkb2VzIG5vdCBtYXRjaCAnM0RWaWV3VGV4dCcgdGFuZGVtIG5hbWUgYmVjYXVzZSBKYXZhU2NyaXB0IGlkZW50aWZpZXJzIGNhbm5vdCBiZWdpbiB3aXRoIGEgbnVtYmVyLlxyXG4gICAgY29uc3QgdGhyZWVEVmlld1RleHQgPSBuZXcgVGV4dCggTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzWyAnM0RWaWV3U3RyaW5nUHJvcGVydHknIF0sXHJcbiAgICAgIG9wdGlvbml6ZTxUZXh0T3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgVGV4dE9wdGlvbnM+KCkoIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJzNEVmlld1RleHQnIClcclxuICAgICAgfSwgdGV4dE9wdGlvbnMgKSApO1xyXG5cclxuICAgIGNvbnN0IGJyaWdodG5lc3NWaWV3VGV4dCA9IG5ldyBUZXh0KCBNb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MuYnJpZ2h0bmVzc1ZpZXdTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9uaXplPFRleHRPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBUZXh0T3B0aW9ucz4oKSgge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYnJpZ2h0bmVzc1ZpZXdUZXh0JyApXHJcbiAgICAgIH0sIHRleHRPcHRpb25zICkgKTtcclxuXHJcbiAgICBjb25zdCBpdGVtczogQ29tYm9Cb3hJdGVtPERlQnJvZ2xpZVZpZXc+W10gPSBbXHJcbiAgICAgIHsgdmFsdWU6ICdyYWRpYWwnLCBjcmVhdGVOb2RlOiAoKSA9PiByYWRpYWxWaWV3VGV4dCwgdGFuZGVtTmFtZTogYHJhZGlhbCR7Q29tYm9Cb3guSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVh9YCB9LFxyXG4gICAgICB7IHZhbHVlOiAnM0QnLCBjcmVhdGVOb2RlOiAoKSA9PiB0aHJlZURWaWV3VGV4dCwgdGFuZGVtTmFtZTogYDNEJHtDb21ib0JveC5JVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH1gIH0sXHJcbiAgICAgIHsgdmFsdWU6ICdicmlnaHRuZXNzJywgY3JlYXRlTm9kZTogKCkgPT4gYnJpZ2h0bmVzc1ZpZXdUZXh0LCB0YW5kZW1OYW1lOiBgYnJpZ2h0bmVzcyR7Q29tYm9Cb3guSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVh9YCB9XHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBkZUJyb2dsaWVWaWV3UHJvcGVydHksIGl0ZW1zLCBsaXN0Ym94UGFyZW50LCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20ucmVnaXN0ZXIoICdEZUJyb2dsaWVWaWV3Q29tYm9Cb3gnLCBEZUJyb2dsaWVWaWV3Q29tYm9Cb3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUF5QyxnQ0FBZ0M7QUFDeEYsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsU0FBdUNDLElBQUksUUFBcUIsbUNBQW1DO0FBQ25HLE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUd0RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLDhCQUE4QixNQUFNLHlDQUF5QztBQU1wRixlQUFlLE1BQU1DLHFCQUFxQixTQUFTTixRQUFRLENBQWdCO0VBRWxFTyxXQUFXQSxDQUFFQyxxQkFBOEMsRUFDOUNDLGFBQW1CLEVBQ25CQyxlQUE2QyxFQUFHO0lBRWxFLE1BQU1DLE9BQU8sR0FBR1YsU0FBUyxDQUE2RCxDQUFDLENBQUU7TUFFdkY7TUFDQVcsT0FBTyxFQUFFLEVBQUU7TUFDWEMsT0FBTyxFQUFFO0lBQ1gsQ0FBQyxFQUFFSCxlQUFnQixDQUFDO0lBRXBCLE1BQU1JLFdBQVcsR0FBRztNQUNsQkMsSUFBSSxFQUFFLElBQUlYLFFBQVEsQ0FBRSxFQUFHLENBQUM7TUFDeEJZLFFBQVEsRUFBRTtJQUNaLENBQUM7SUFFRCxNQUFNQyxjQUFjLEdBQUcsSUFBSWYsSUFBSSxDQUFFRyw4QkFBOEIsQ0FBQ2Esd0JBQXdCLEVBQ3RGakIsU0FBUyxDQUE2QyxDQUFDLENBQUU7TUFDdkRrQixNQUFNLEVBQUVSLE9BQU8sQ0FBQ1EsTUFBTSxDQUFDQyxZQUFZLENBQUUsZ0JBQWlCO0lBQ3hELENBQUMsRUFBRU4sV0FBWSxDQUFFLENBQUM7O0lBRXBCO0lBQ0EsTUFBTU8sY0FBYyxHQUFHLElBQUluQixJQUFJLENBQUVHLDhCQUE4QixDQUFFLHNCQUFzQixDQUFFLEVBQ3ZGSixTQUFTLENBQTZDLENBQUMsQ0FBRTtNQUN2RGtCLE1BQU0sRUFBRVIsT0FBTyxDQUFDUSxNQUFNLENBQUNDLFlBQVksQ0FBRSxZQUFhO0lBQ3BELENBQUMsRUFBRU4sV0FBWSxDQUFFLENBQUM7SUFFcEIsTUFBTVEsa0JBQWtCLEdBQUcsSUFBSXBCLElBQUksQ0FBRUcsOEJBQThCLENBQUNrQiw0QkFBNEIsRUFDOUZ0QixTQUFTLENBQTZDLENBQUMsQ0FBRTtNQUN2RGtCLE1BQU0sRUFBRVIsT0FBTyxDQUFDUSxNQUFNLENBQUNDLFlBQVksQ0FBRSxvQkFBcUI7SUFDNUQsQ0FBQyxFQUFFTixXQUFZLENBQUUsQ0FBQztJQUVwQixNQUFNVSxLQUFvQyxHQUFHLENBQzNDO01BQUVDLEtBQUssRUFBRSxRQUFRO01BQUVDLFVBQVUsRUFBRUEsQ0FBQSxLQUFNVCxjQUFjO01BQUVVLFVBQVUsRUFBRyxTQUFRM0IsUUFBUSxDQUFDNEIsdUJBQXdCO0lBQUUsQ0FBQyxFQUM5RztNQUFFSCxLQUFLLEVBQUUsSUFBSTtNQUFFQyxVQUFVLEVBQUVBLENBQUEsS0FBTUwsY0FBYztNQUFFTSxVQUFVLEVBQUcsS0FBSTNCLFFBQVEsQ0FBQzRCLHVCQUF3QjtJQUFFLENBQUMsRUFDdEc7TUFBRUgsS0FBSyxFQUFFLFlBQVk7TUFBRUMsVUFBVSxFQUFFQSxDQUFBLEtBQU1KLGtCQUFrQjtNQUFFSyxVQUFVLEVBQUcsYUFBWTNCLFFBQVEsQ0FBQzRCLHVCQUF3QjtJQUFFLENBQUMsQ0FDM0g7SUFFRCxLQUFLLENBQUVwQixxQkFBcUIsRUFBRWdCLEtBQUssRUFBRWYsYUFBYSxFQUFFRSxPQUFRLENBQUM7RUFDL0Q7RUFFZ0JrQixPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQTFCLHVCQUF1QixDQUFDNEIsUUFBUSxDQUFFLHVCQUF1QixFQUFFekIscUJBQXNCLENBQUMifQ==