// Copyright 2023, University of Colorado Boulder

/**
 * SubitizeTimeControl is the 'Subitize Time' control in the Preferences dialog.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Font, RichText, Text } from '../../../../scenery/js/imports.js';
import numberPlay from '../../numberPlay.js';
import NumberPlayStrings from '../../NumberPlayStrings.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import Property from '../../../../axon/js/Property.js';
import PreferencesControl from '../../../../joist/js/preferences/PreferencesControl.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import NumberSuiteCommonConstants from '../../../../number-suite-common/js/common/NumberSuiteCommonConstants.js';
export default class SubitizeTimeControl extends PreferencesControl {
  constructor(subitizeTimeShownProperty, providedOptions) {
    const labelText = new Text(NumberPlayStrings.subitizeTimeStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS);

    //TODO https://github.com/phetsims/joist/issues/842 Are these the options we would like to use as constants for a preferences number spinner?
    const spinner = new NumberSpinner(subitizeTimeShownProperty, new Property(subitizeTimeShownProperty.rangeProperty.value), {
      arrowsPosition: 'leftRight',
      deltaValue: 0.1,
      numberDisplayOptions: {
        valuePattern: '{{value}} s',
        decimalPlaces: 1,
        align: 'center',
        xMargin: 10,
        yMargin: 3,
        textOptions: {
          font: new Font({
            size: NumberSuiteCommonConstants.PREFERENCES_FONT_SIZE
          })
        }
      }
    });
    const descriptionText = new RichText(NumberPlayStrings.subitizeTimeDescriptionStringProperty, PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS);
    super(optionize()({
      // PreferencesControlOptions
      labelNode: labelText,
      controlNode: spinner,
      descriptionNode: descriptionText
    }, providedOptions));
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
numberPlay.register('SubitizeTimeControl', SubitizeTimeControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb250IiwiUmljaFRleHQiLCJUZXh0IiwibnVtYmVyUGxheSIsIk51bWJlclBsYXlTdHJpbmdzIiwiTnVtYmVyU3Bpbm5lciIsIlByb3BlcnR5IiwiUHJlZmVyZW5jZXNDb250cm9sIiwiUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMiLCJvcHRpb25pemUiLCJOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cyIsIlN1Yml0aXplVGltZUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsInN1Yml0aXplVGltZVNob3duUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJsYWJlbFRleHQiLCJzdWJpdGl6ZVRpbWVTdHJpbmdQcm9wZXJ0eSIsIkNPTlRST0xfTEFCRUxfT1BUSU9OUyIsInNwaW5uZXIiLCJyYW5nZVByb3BlcnR5IiwidmFsdWUiLCJhcnJvd3NQb3NpdGlvbiIsImRlbHRhVmFsdWUiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInZhbHVlUGF0dGVybiIsImRlY2ltYWxQbGFjZXMiLCJhbGlnbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidGV4dE9wdGlvbnMiLCJmb250Iiwic2l6ZSIsIlBSRUZFUkVOQ0VTX0ZPTlRfU0laRSIsImRlc2NyaXB0aW9uVGV4dCIsInN1Yml0aXplVGltZURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJDT05UUk9MX0RFU0NSSVBUSU9OX09QVElPTlMiLCJsYWJlbE5vZGUiLCJjb250cm9sTm9kZSIsImRlc2NyaXB0aW9uTm9kZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN1Yml0aXplVGltZUNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN1Yml0aXplVGltZUNvbnRyb2wgaXMgdGhlICdTdWJpdGl6ZSBUaW1lJyBjb250cm9sIGluIHRoZSBQcmVmZXJlbmNlcyBkaWFsb2cuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBGb250LCBSaWNoVGV4dCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBudW1iZXJQbGF5IGZyb20gJy4uLy4uL251bWJlclBsYXkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGxheVN0cmluZ3MgZnJvbSAnLi4vLi4vTnVtYmVyUGxheVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3Bpbm5lciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvTnVtYmVyU3Bpbm5lci5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0NvbnRyb2wsIHsgUHJlZmVyZW5jZXNDb250cm9sT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzQ29udHJvbC5qcyc7XHJcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItc3VpdGUtY29tbW9uL2pzL2NvbW1vbi9OdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBTdWJpdGl6ZVRpbWVDb250cm9sT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcclxuICBTdHJpY3RPbWl0PFByZWZlcmVuY2VzQ29udHJvbE9wdGlvbnMsICdsYWJlbE5vZGUnIHwgJ2Rlc2NyaXB0aW9uTm9kZScgfCAnY29udHJvbE5vZGUnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN1Yml0aXplVGltZUNvbnRyb2wgZXh0ZW5kcyBQcmVmZXJlbmNlc0NvbnRyb2wge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN1Yml0aXplVGltZVNob3duUHJvcGVydHk6IE51bWJlclByb3BlcnR5LCBwcm92aWRlZE9wdGlvbnM/OiBTdWJpdGl6ZVRpbWVDb250cm9sT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBsYWJlbFRleHQgPSBuZXcgVGV4dCggTnVtYmVyUGxheVN0cmluZ3Muc3ViaXRpemVUaW1lU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIFByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLkNPTlRST0xfTEFCRUxfT1BUSU9OUyApO1xyXG5cclxuICAgIC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzg0MiBBcmUgdGhlc2UgdGhlIG9wdGlvbnMgd2Ugd291bGQgbGlrZSB0byB1c2UgYXMgY29uc3RhbnRzIGZvciBhIHByZWZlcmVuY2VzIG51bWJlciBzcGlubmVyP1xyXG4gICAgY29uc3Qgc3Bpbm5lciA9IG5ldyBOdW1iZXJTcGlubmVyKCBzdWJpdGl6ZVRpbWVTaG93blByb3BlcnR5LCBuZXcgUHJvcGVydHk8UmFuZ2U+KCBzdWJpdGl6ZVRpbWVTaG93blByb3BlcnR5LnJhbmdlUHJvcGVydHkudmFsdWUgKSwge1xyXG4gICAgICBhcnJvd3NQb3NpdGlvbjogJ2xlZnRSaWdodCcsXHJcbiAgICAgIGRlbHRhVmFsdWU6IDAuMSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICB2YWx1ZVBhdHRlcm46ICd7e3ZhbHVlfX0gcycsXHJcbiAgICAgICAgZGVjaW1hbFBsYWNlczogMSxcclxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgeE1hcmdpbjogMTAsXHJcbiAgICAgICAgeU1hcmdpbjogMyxcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogbmV3IEZvbnQoIHsgc2l6ZTogTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuUFJFRkVSRU5DRVNfRk9OVF9TSVpFIH0gKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGRlc2NyaXB0aW9uVGV4dCA9IG5ldyBSaWNoVGV4dCggTnVtYmVyUGxheVN0cmluZ3Muc3ViaXRpemVUaW1lRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMuQ09OVFJPTF9ERVNDUklQVElPTl9PUFRJT05TICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbml6ZTxTdWJpdGl6ZVRpbWVDb250cm9sT3B0aW9ucywgU2VsZk9wdGlvbnMsIFByZWZlcmVuY2VzQ29udHJvbE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFByZWZlcmVuY2VzQ29udHJvbE9wdGlvbnNcclxuICAgICAgbGFiZWxOb2RlOiBsYWJlbFRleHQsXHJcbiAgICAgIGNvbnRyb2xOb2RlOiBzcGlubmVyLFxyXG4gICAgICBkZXNjcmlwdGlvbk5vZGU6IGRlc2NyaXB0aW9uVGV4dFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJQbGF5LnJlZ2lzdGVyKCAnU3ViaXRpemVUaW1lQ29udHJvbCcsIFN1Yml0aXplVGltZUNvbnRyb2wgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN4RSxPQUFPQyxVQUFVLE1BQU0scUJBQXFCO0FBQzVDLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUMxRCxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBRS9ELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0Msa0JBQWtCLE1BQXFDLHdEQUF3RDtBQUN0SCxPQUFPQywwQkFBMEIsTUFBTSxnRUFBZ0U7QUFDdkcsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0MsMEJBQTBCLE1BQU0seUVBQXlFO0FBUWhILGVBQWUsTUFBTUMsbUJBQW1CLFNBQVNKLGtCQUFrQixDQUFDO0VBRTNESyxXQUFXQSxDQUFFQyx5QkFBeUMsRUFBRUMsZUFBNEMsRUFBRztJQUU1RyxNQUFNQyxTQUFTLEdBQUcsSUFBSWIsSUFBSSxDQUFFRSxpQkFBaUIsQ0FBQ1ksMEJBQTBCLEVBQ3RFUiwwQkFBMEIsQ0FBQ1MscUJBQXNCLENBQUM7O0lBRXBEO0lBQ0EsTUFBTUMsT0FBTyxHQUFHLElBQUliLGFBQWEsQ0FBRVEseUJBQXlCLEVBQUUsSUFBSVAsUUFBUSxDQUFTTyx5QkFBeUIsQ0FBQ00sYUFBYSxDQUFDQyxLQUFNLENBQUMsRUFBRTtNQUNsSUMsY0FBYyxFQUFFLFdBQVc7TUFDM0JDLFVBQVUsRUFBRSxHQUFHO01BQ2ZDLG9CQUFvQixFQUFFO1FBQ3BCQyxZQUFZLEVBQUUsYUFBYTtRQUMzQkMsYUFBYSxFQUFFLENBQUM7UUFDaEJDLEtBQUssRUFBRSxRQUFRO1FBQ2ZDLE9BQU8sRUFBRSxFQUFFO1FBQ1hDLE9BQU8sRUFBRSxDQUFDO1FBQ1ZDLFdBQVcsRUFBRTtVQUNYQyxJQUFJLEVBQUUsSUFBSTlCLElBQUksQ0FBRTtZQUFFK0IsSUFBSSxFQUFFckIsMEJBQTBCLENBQUNzQjtVQUFzQixDQUFFO1FBQzdFO01BQ0Y7SUFDRixDQUFFLENBQUM7SUFFSCxNQUFNQyxlQUFlLEdBQUcsSUFBSWhDLFFBQVEsQ0FBRUcsaUJBQWlCLENBQUM4QixxQ0FBcUMsRUFDM0YxQiwwQkFBMEIsQ0FBQzJCLDJCQUE0QixDQUFDO0lBRTFELEtBQUssQ0FBRTFCLFNBQVMsQ0FBcUUsQ0FBQyxDQUFFO01BRXRGO01BQ0EyQixTQUFTLEVBQUVyQixTQUFTO01BQ3BCc0IsV0FBVyxFQUFFbkIsT0FBTztNQUNwQm9CLGVBQWUsRUFBRUw7SUFDbkIsQ0FBQyxFQUFFbkIsZUFBZ0IsQ0FBRSxDQUFDO0VBQ3hCO0VBRWdCeUIsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFwQyxVQUFVLENBQUNzQyxRQUFRLENBQUUscUJBQXFCLEVBQUU5QixtQkFBb0IsQ0FBQyJ9