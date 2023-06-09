// Copyright 2019-2023, University of Colorado Boulder

/**
 * Class for the 'Ten Frame' accordion box, which is the panel in the upper right corner of the sim that displays a
 * dot-grid representation of the current number.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import NumberPlayStrings from '../../NumberPlayStrings.js';
import numberPlay from '../../numberPlay.js';
import NumberPlayConstants from '../NumberPlayConstants.js';
import TenFrameNode from '../../../../number-suite-common/js/common/view/TenFrameNode.js';
import NumberSuiteCommonAccordionBox from '../../../../number-suite-common/js/common/view/NumberSuiteCommonAccordionBox.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Property from '../../../../axon/js/Property.js';

// types

class TenFrameAccordionBox extends NumberSuiteCommonAccordionBox {
  constructor(currentNumberProperty, sumRange, height, providedOptions) {
    const tenFrameNode = new TenFrameNode(currentNumberProperty, sumRange);

    // Singular vs plural title, based on how many 'ten frames' we have.
    // See https://github.com/phetsims/number-play/issues/192
    const titleStringProperty = tenFrameNode.numberOfTenFrames > 1 ? NumberPlayStrings.tenFramesStringProperty : NumberPlayStrings.tenFrameStringProperty;
    const options = optionize()({
      titleStringProperty: titleStringProperty,
      titleTextOptions: {
        maxWidth: NumberPlayConstants.UPPER_OUTER_AB_TITLE_MAX_WIDTH
      }
    }, providedOptions);
    super(NumberPlayConstants.UPPER_OUTER_ACCORDION_BOX_WIDTH, new Property(height), options);
    tenFrameNode.scale(height / tenFrameNode.height / 2);
    tenFrameNode.centerX = this.contentBoundsProperty.value.centerX + options.tenFrameOffsetX;
    tenFrameNode.centerY = this.contentBoundsProperty.value.centerY;
    this.contentNode.addChild(tenFrameNode);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
numberPlay.register('TenFrameAccordionBox', TenFrameAccordionBox);
export default TenFrameAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQbGF5U3RyaW5ncyIsIm51bWJlclBsYXkiLCJOdW1iZXJQbGF5Q29uc3RhbnRzIiwiVGVuRnJhbWVOb2RlIiwiTnVtYmVyU3VpdGVDb21tb25BY2NvcmRpb25Cb3giLCJvcHRpb25pemUiLCJQcm9wZXJ0eSIsIlRlbkZyYW1lQWNjb3JkaW9uQm94IiwiY29uc3RydWN0b3IiLCJjdXJyZW50TnVtYmVyUHJvcGVydHkiLCJzdW1SYW5nZSIsImhlaWdodCIsInByb3ZpZGVkT3B0aW9ucyIsInRlbkZyYW1lTm9kZSIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJudW1iZXJPZlRlbkZyYW1lcyIsInRlbkZyYW1lc1N0cmluZ1Byb3BlcnR5IiwidGVuRnJhbWVTdHJpbmdQcm9wZXJ0eSIsIm9wdGlvbnMiLCJ0aXRsZVRleHRPcHRpb25zIiwibWF4V2lkdGgiLCJVUFBFUl9PVVRFUl9BQl9USVRMRV9NQVhfV0lEVEgiLCJVUFBFUl9PVVRFUl9BQ0NPUkRJT05fQk9YX1dJRFRIIiwic2NhbGUiLCJjZW50ZXJYIiwiY29udGVudEJvdW5kc1Byb3BlcnR5IiwidmFsdWUiLCJ0ZW5GcmFtZU9mZnNldFgiLCJjZW50ZXJZIiwiY29udGVudE5vZGUiLCJhZGRDaGlsZCIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRlbkZyYW1lQWNjb3JkaW9uQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENsYXNzIGZvciB0aGUgJ1RlbiBGcmFtZScgYWNjb3JkaW9uIGJveCwgd2hpY2ggaXMgdGhlIHBhbmVsIGluIHRoZSB1cHBlciByaWdodCBjb3JuZXIgb2YgdGhlIHNpbSB0aGF0IGRpc3BsYXlzIGFcclxuICogZG90LWdyaWQgcmVwcmVzZW50YXRpb24gb2YgdGhlIGN1cnJlbnQgbnVtYmVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclBsYXlTdHJpbmdzIGZyb20gJy4uLy4uL051bWJlclBsYXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IG51bWJlclBsYXkgZnJvbSAnLi4vLi4vbnVtYmVyUGxheS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQbGF5Q29uc3RhbnRzIGZyb20gJy4uL051bWJlclBsYXlDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgVGVuRnJhbWVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1zdWl0ZS1jb21tb24vanMvY29tbW9uL3ZpZXcvVGVuRnJhbWVOb2RlLmpzJztcclxuaW1wb3J0IE51bWJlclN1aXRlQ29tbW9uQWNjb3JkaW9uQm94LCB7IE51bWJlclN1aXRlQ29tbW9uQWNjb3JkaW9uQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1zdWl0ZS1jb21tb24vanMvY29tbW9uL3ZpZXcvTnVtYmVyU3VpdGVDb21tb25BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuXHJcbi8vIHR5cGVzXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgdGVuRnJhbWVPZmZzZXRYOiBudW1iZXI7XHJcbn07XHJcbmV4cG9ydCB0eXBlIFRlbkZyYW1lQWNjb3JkaW9uQm94T3B0aW9ucyA9IFNlbGZPcHRpb25zICZcclxuICBTdHJpY3RPbWl0PE51bWJlclN1aXRlQ29tbW9uQWNjb3JkaW9uQm94T3B0aW9ucywgJ3RpdGxlU3RyaW5nUHJvcGVydHknIHwgJ3RpdGxlVGV4dE9wdGlvbnMnPjtcclxuXHJcbmNsYXNzIFRlbkZyYW1lQWNjb3JkaW9uQm94IGV4dGVuZHMgTnVtYmVyU3VpdGVDb21tb25BY2NvcmRpb25Cb3gge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGN1cnJlbnROdW1iZXJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiwgc3VtUmFuZ2U6IFJhbmdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBudW1iZXIsIHByb3ZpZGVkT3B0aW9uczogVGVuRnJhbWVBY2NvcmRpb25Cb3hPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IHRlbkZyYW1lTm9kZSA9IG5ldyBUZW5GcmFtZU5vZGUoIGN1cnJlbnROdW1iZXJQcm9wZXJ0eSwgc3VtUmFuZ2UgKTtcclxuXHJcbiAgICAvLyBTaW5ndWxhciB2cyBwbHVyYWwgdGl0bGUsIGJhc2VkIG9uIGhvdyBtYW55ICd0ZW4gZnJhbWVzJyB3ZSBoYXZlLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItcGxheS9pc3N1ZXMvMTkyXHJcbiAgICBjb25zdCB0aXRsZVN0cmluZ1Byb3BlcnR5ID0gKCB0ZW5GcmFtZU5vZGUubnVtYmVyT2ZUZW5GcmFtZXMgPiAxICkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlclBsYXlTdHJpbmdzLnRlbkZyYW1lc1N0cmluZ1Byb3BlcnR5IDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOdW1iZXJQbGF5U3RyaW5ncy50ZW5GcmFtZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VGVuRnJhbWVBY2NvcmRpb25Cb3hPcHRpb25zLCBTZWxmT3B0aW9ucywgTnVtYmVyU3VpdGVDb21tb25BY2NvcmRpb25Cb3hPcHRpb25zPigpKCB7XHJcbiAgICAgIHRpdGxlU3RyaW5nUHJvcGVydHk6IHRpdGxlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHRpdGxlVGV4dE9wdGlvbnM6IHtcclxuICAgICAgICBtYXhXaWR0aDogTnVtYmVyUGxheUNvbnN0YW50cy5VUFBFUl9PVVRFUl9BQl9USVRMRV9NQVhfV0lEVEhcclxuICAgICAgfVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIE51bWJlclBsYXlDb25zdGFudHMuVVBQRVJfT1VURVJfQUNDT1JESU9OX0JPWF9XSURUSCwgbmV3IFByb3BlcnR5PG51bWJlcj4oIGhlaWdodCApLCBvcHRpb25zICk7XHJcblxyXG4gICAgdGVuRnJhbWVOb2RlLnNjYWxlKCBoZWlnaHQgLyB0ZW5GcmFtZU5vZGUuaGVpZ2h0IC8gMiApO1xyXG4gICAgdGVuRnJhbWVOb2RlLmNlbnRlclggPSB0aGlzLmNvbnRlbnRCb3VuZHNQcm9wZXJ0eS52YWx1ZS5jZW50ZXJYICsgb3B0aW9ucy50ZW5GcmFtZU9mZnNldFg7XHJcbiAgICB0ZW5GcmFtZU5vZGUuY2VudGVyWSA9IHRoaXMuY29udGVudEJvdW5kc1Byb3BlcnR5LnZhbHVlLmNlbnRlclk7XHJcbiAgICB0aGlzLmNvbnRlbnROb2RlLmFkZENoaWxkKCB0ZW5GcmFtZU5vZGUgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJQbGF5LnJlZ2lzdGVyKCAnVGVuRnJhbWVBY2NvcmRpb25Cb3gnLCBUZW5GcmFtZUFjY29yZGlvbkJveCApO1xyXG5leHBvcnQgZGVmYXVsdCBUZW5GcmFtZUFjY29yZGlvbkJveDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0MsVUFBVSxNQUFNLHFCQUFxQjtBQUM1QyxPQUFPQyxtQkFBbUIsTUFBTSwyQkFBMkI7QUFDM0QsT0FBT0MsWUFBWSxNQUFNLGdFQUFnRTtBQUN6RixPQUFPQyw2QkFBNkIsTUFBZ0QsaUZBQWlGO0FBQ3JLLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFJN0QsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQzs7QUFFdEQ7O0FBT0EsTUFBTUMsb0JBQW9CLFNBQVNILDZCQUE2QixDQUFDO0VBRXhESSxXQUFXQSxDQUFFQyxxQkFBZ0QsRUFBRUMsUUFBZSxFQUNqRUMsTUFBYyxFQUFFQyxlQUE0QyxFQUFHO0lBRWpGLE1BQU1DLFlBQVksR0FBRyxJQUFJVixZQUFZLENBQUVNLHFCQUFxQixFQUFFQyxRQUFTLENBQUM7O0lBRXhFO0lBQ0E7SUFDQSxNQUFNSSxtQkFBbUIsR0FBS0QsWUFBWSxDQUFDRSxpQkFBaUIsR0FBRyxDQUFDLEdBQ3BDZixpQkFBaUIsQ0FBQ2dCLHVCQUF1QixHQUN6Q2hCLGlCQUFpQixDQUFDaUIsc0JBQXNCO0lBRXBFLE1BQU1DLE9BQU8sR0FBR2IsU0FBUyxDQUFpRixDQUFDLENBQUU7TUFDM0dTLG1CQUFtQixFQUFFQSxtQkFBbUI7TUFDeENLLGdCQUFnQixFQUFFO1FBQ2hCQyxRQUFRLEVBQUVsQixtQkFBbUIsQ0FBQ21CO01BQ2hDO0lBQ0YsQ0FBQyxFQUFFVCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRVYsbUJBQW1CLENBQUNvQiwrQkFBK0IsRUFBRSxJQUFJaEIsUUFBUSxDQUFVSyxNQUFPLENBQUMsRUFBRU8sT0FBUSxDQUFDO0lBRXJHTCxZQUFZLENBQUNVLEtBQUssQ0FBRVosTUFBTSxHQUFHRSxZQUFZLENBQUNGLE1BQU0sR0FBRyxDQUFFLENBQUM7SUFDdERFLFlBQVksQ0FBQ1csT0FBTyxHQUFHLElBQUksQ0FBQ0MscUJBQXFCLENBQUNDLEtBQUssQ0FBQ0YsT0FBTyxHQUFHTixPQUFPLENBQUNTLGVBQWU7SUFDekZkLFlBQVksQ0FBQ2UsT0FBTyxHQUFHLElBQUksQ0FBQ0gscUJBQXFCLENBQUNDLEtBQUssQ0FBQ0UsT0FBTztJQUMvRCxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsUUFBUSxDQUFFakIsWUFBYSxDQUFDO0VBQzNDO0VBRWdCa0IsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUE5QixVQUFVLENBQUNnQyxRQUFRLENBQUUsc0JBQXNCLEVBQUUxQixvQkFBcUIsQ0FBQztBQUNuRSxlQUFlQSxvQkFBb0IifQ==