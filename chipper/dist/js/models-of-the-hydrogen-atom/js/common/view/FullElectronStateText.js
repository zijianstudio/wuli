// Copyright 2022, University of Colorado Boulder

/**
 * FullElectronStateText displays the full state (n,l,m) of the electron, used for the Schrodinger model.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { RichText } from '../../../../scenery/js/imports.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';
import MOTHAColors from '../MOTHAColors.js';
import MOTHASymbols from '../MOTHASymbols.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
export default class FullElectronStateText extends RichText {
  constructor(primaryStateProperty, secondaryStateProperty, tertiaryStateProperty, providedOptions) {
    const options = optionize()({
      // TextOptions
      font: new PhetFont(16),
      fill: MOTHAColors.stateDisplayFillProperty
    }, providedOptions);
    const stringProperty = new PatternStringProperty(ModelsOfTheHydrogenAtomStrings.nlmEqualsStringProperty, {
      nSymbol: MOTHASymbols.nStringProperty,
      nValue: primaryStateProperty,
      lSymbol: MOTHASymbols.lStringProperty,
      lValue: secondaryStateProperty,
      mSymbol: MOTHASymbols.mStringProperty,
      mValue: tertiaryStateProperty
    });
    super(stringProperty, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('FullElectronStateText', FullElectronStateText);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQaGV0Rm9udCIsIlJpY2hUZXh0IiwibW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20iLCJNb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MiLCJNT1RIQUNvbG9ycyIsIk1PVEhBU3ltYm9scyIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIkZ1bGxFbGVjdHJvblN0YXRlVGV4dCIsImNvbnN0cnVjdG9yIiwicHJpbWFyeVN0YXRlUHJvcGVydHkiLCJzZWNvbmRhcnlTdGF0ZVByb3BlcnR5IiwidGVydGlhcnlTdGF0ZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZvbnQiLCJmaWxsIiwic3RhdGVEaXNwbGF5RmlsbFByb3BlcnR5Iiwic3RyaW5nUHJvcGVydHkiLCJubG1FcXVhbHNTdHJpbmdQcm9wZXJ0eSIsIm5TeW1ib2wiLCJuU3RyaW5nUHJvcGVydHkiLCJuVmFsdWUiLCJsU3ltYm9sIiwibFN0cmluZ1Byb3BlcnR5IiwibFZhbHVlIiwibVN5bWJvbCIsIm1TdHJpbmdQcm9wZXJ0eSIsIm1WYWx1ZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZ1bGxFbGVjdHJvblN0YXRlVGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRnVsbEVsZWN0cm9uU3RhdGVUZXh0IGRpc3BsYXlzIHRoZSBmdWxsIHN0YXRlIChuLGwsbSkgb2YgdGhlIGVsZWN0cm9uLCB1c2VkIGZvciB0aGUgU2Nocm9kaW5nZXIgbW9kZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFJpY2hUZXh0LCBSaWNoVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20gZnJvbSAnLi4vLi4vbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzIGZyb20gJy4uLy4uL01vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBNT1RIQUNvbG9ycyBmcm9tICcuLi9NT1RIQUNvbG9ycy5qcyc7XHJcbmltcG9ydCBNT1RIQVN5bWJvbHMgZnJvbSAnLi4vTU9USEFTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgRnVsbEVsZWN0cm9uU3RhdGVOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxSaWNoVGV4dE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZ1bGxFbGVjdHJvblN0YXRlVGV4dCBleHRlbmRzIFJpY2hUZXh0IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcmltYXJ5U3RhdGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVN0YXRlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB0ZXJ0aWFyeVN0YXRlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEZ1bGxFbGVjdHJvblN0YXRlTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGdWxsRWxlY3Ryb25TdGF0ZU5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUmljaFRleHRPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBUZXh0T3B0aW9uc1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgICAgIGZpbGw6IE1PVEhBQ29sb3JzLnN0YXRlRGlzcGxheUZpbGxQcm9wZXJ0eVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3Qgc3RyaW5nUHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBNb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MubmxtRXF1YWxzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgblN5bWJvbDogTU9USEFTeW1ib2xzLm5TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgblZhbHVlOiBwcmltYXJ5U3RhdGVQcm9wZXJ0eSxcclxuICAgICAgbFN5bWJvbDogTU9USEFTeW1ib2xzLmxTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgbFZhbHVlOiBzZWNvbmRhcnlTdGF0ZVByb3BlcnR5LFxyXG4gICAgICBtU3ltYm9sOiBNT1RIQVN5bWJvbHMubVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBtVmFsdWU6IHRlcnRpYXJ5U3RhdGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBzdHJpbmdQcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnRnVsbEVsZWN0cm9uU3RhdGVUZXh0JywgRnVsbEVsZWN0cm9uU3RhdGVUZXh0ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBaUNDLFFBQVEsUUFBeUIsbUNBQW1DO0FBQ3JHLE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyw4QkFBOEIsTUFBTSx5Q0FBeUM7QUFDcEYsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBQzdDLE9BQU9DLHFCQUFxQixNQUFNLDhDQUE4QztBQU1oRixlQUFlLE1BQU1DLHFCQUFxQixTQUFTTixRQUFRLENBQUM7RUFFbkRPLFdBQVdBLENBQUVDLG9CQUErQyxFQUMvQ0Msc0JBQWlELEVBQ2pEQyxxQkFBZ0QsRUFDaERDLGVBQTZDLEVBQUc7SUFFbEUsTUFBTUMsT0FBTyxHQUFHZCxTQUFTLENBQTZELENBQUMsQ0FBRTtNQUV2RjtNQUNBZSxJQUFJLEVBQUUsSUFBSWQsUUFBUSxDQUFFLEVBQUcsQ0FBQztNQUN4QmUsSUFBSSxFQUFFWCxXQUFXLENBQUNZO0lBQ3BCLENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixNQUFNSyxjQUFjLEdBQUcsSUFBSVgscUJBQXFCLENBQUVILDhCQUE4QixDQUFDZSx1QkFBdUIsRUFBRTtNQUN4R0MsT0FBTyxFQUFFZCxZQUFZLENBQUNlLGVBQWU7TUFDckNDLE1BQU0sRUFBRVosb0JBQW9CO01BQzVCYSxPQUFPLEVBQUVqQixZQUFZLENBQUNrQixlQUFlO01BQ3JDQyxNQUFNLEVBQUVkLHNCQUFzQjtNQUM5QmUsT0FBTyxFQUFFcEIsWUFBWSxDQUFDcUIsZUFBZTtNQUNyQ0MsTUFBTSxFQUFFaEI7SUFDVixDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVNLGNBQWMsRUFBRUosT0FBUSxDQUFDO0VBQ2xDO0VBRWdCZSxPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQTFCLHVCQUF1QixDQUFDNEIsUUFBUSxDQUFFLHVCQUF1QixFQUFFdkIscUJBQXNCLENBQUMifQ==