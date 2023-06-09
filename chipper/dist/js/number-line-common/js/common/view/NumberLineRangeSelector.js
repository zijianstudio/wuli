// Copyright 2020-2023, University of Colorado Boulder

/**
 * NumberLineRangeSelector is a ComboBox specialization that can be used to select from a set of ranges that are then
 * used to control the range of values displayed on a number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import NumberLineCommonStrings from '../../../../number-line-common/js/NumberLineCommonStrings.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants
const FONT = new PhetFont(16);
class NumberLineRangeSelector extends ComboBox {
  /**
   * @param {Property.<Range>} selectedRangeProperty
   * @param {Range[]} ranges
   * @param {Node} listBoxParentNode
   * @param {Object} [options]
   * @public
   */
  constructor(selectedRangeProperty, ranges, listBoxParentNode, options) {
    options = merge({
      listPosition: 'above',
      xMargin: 13,
      yMargin: 6,
      cornerRadius: 4,
      buttonTouchAreaXDilation: 7,
      buttonTouchAreaYDilation: 7,
      align: 'right'
    }, options);

    // Create the selection items for the range selection combo box.
    const rangeSelectionComboBoxItems = []; // {ComboBoxItem[]}
    ranges.forEach(range => {
      rangeSelectionComboBoxItems.push({
        value: range,
        createNode: () => new Text(StringUtils.fillIn(NumberLineCommonStrings.rangePattern, {
          lowValue: range.min,
          highValue: range.max
        }), {
          font: FONT,
          maxWidth: 150
        })
      });
    });
    super(selectedRangeProperty, rangeSelectionComboBoxItems, listBoxParentNode, options);
  }
}
numberLineCommon.register('NumberLineRangeSelector', NumberLineRangeSelector);
export default NumberLineRangeSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJMaW5lQ29tbW9uU3RyaW5ncyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIlRleHQiLCJDb21ib0JveCIsIm51bWJlckxpbmVDb21tb24iLCJGT05UIiwiTnVtYmVyTGluZVJhbmdlU2VsZWN0b3IiLCJjb25zdHJ1Y3RvciIsInNlbGVjdGVkUmFuZ2VQcm9wZXJ0eSIsInJhbmdlcyIsImxpc3RCb3hQYXJlbnROb2RlIiwib3B0aW9ucyIsImxpc3RQb3NpdGlvbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiY29ybmVyUmFkaXVzIiwiYnV0dG9uVG91Y2hBcmVhWERpbGF0aW9uIiwiYnV0dG9uVG91Y2hBcmVhWURpbGF0aW9uIiwiYWxpZ24iLCJyYW5nZVNlbGVjdGlvbkNvbWJvQm94SXRlbXMiLCJmb3JFYWNoIiwicmFuZ2UiLCJwdXNoIiwidmFsdWUiLCJjcmVhdGVOb2RlIiwiZmlsbEluIiwicmFuZ2VQYXR0ZXJuIiwibG93VmFsdWUiLCJtaW4iLCJoaWdoVmFsdWUiLCJtYXgiLCJmb250IiwibWF4V2lkdGgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk51bWJlckxpbmVSYW5nZVNlbGVjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE51bWJlckxpbmVSYW5nZVNlbGVjdG9yIGlzIGEgQ29tYm9Cb3ggc3BlY2lhbGl6YXRpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBzZWxlY3QgZnJvbSBhIHNldCBvZiByYW5nZXMgdGhhdCBhcmUgdGhlblxyXG4gKiB1c2VkIHRvIGNvbnRyb2wgdGhlIHJhbmdlIG9mIHZhbHVlcyBkaXNwbGF5ZWQgb24gYSBudW1iZXIgbGluZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyTGluZUNvbW1vblN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLWxpbmUtY29tbW9uL2pzL051bWJlckxpbmVDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDb21ib0JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZUNvbW1vbiBmcm9tICcuLi8uLi9udW1iZXJMaW5lQ29tbW9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBGT05UID0gbmV3IFBoZXRGb250KCAxNiApO1xyXG5cclxuY2xhc3MgTnVtYmVyTGluZVJhbmdlU2VsZWN0b3IgZXh0ZW5kcyBDb21ib0JveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPFJhbmdlPn0gc2VsZWN0ZWRSYW5nZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtSYW5nZVtdfSByYW5nZXNcclxuICAgKiBAcGFyYW0ge05vZGV9IGxpc3RCb3hQYXJlbnROb2RlXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2VsZWN0ZWRSYW5nZVByb3BlcnR5LCByYW5nZXMsIGxpc3RCb3hQYXJlbnROb2RlLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBsaXN0UG9zaXRpb246ICdhYm92ZScsXHJcbiAgICAgIHhNYXJnaW46IDEzLFxyXG4gICAgICB5TWFyZ2luOiA2LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDQsXHJcbiAgICAgIGJ1dHRvblRvdWNoQXJlYVhEaWxhdGlvbjogNyxcclxuICAgICAgYnV0dG9uVG91Y2hBcmVhWURpbGF0aW9uOiA3LFxyXG4gICAgICBhbGlnbjogJ3JpZ2h0J1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgc2VsZWN0aW9uIGl0ZW1zIGZvciB0aGUgcmFuZ2Ugc2VsZWN0aW9uIGNvbWJvIGJveC5cclxuICAgIGNvbnN0IHJhbmdlU2VsZWN0aW9uQ29tYm9Cb3hJdGVtcyA9IFtdOyAvLyB7Q29tYm9Cb3hJdGVtW119XHJcbiAgICByYW5nZXMuZm9yRWFjaCggcmFuZ2UgPT4ge1xyXG4gICAgICByYW5nZVNlbGVjdGlvbkNvbWJvQm94SXRlbXMucHVzaCgge1xyXG4gICAgICAgIHZhbHVlOiByYW5nZSxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dChcclxuICAgICAgICAgIFN0cmluZ1V0aWxzLmZpbGxJbiggTnVtYmVyTGluZUNvbW1vblN0cmluZ3MucmFuZ2VQYXR0ZXJuLCB7XHJcbiAgICAgICAgICAgIGxvd1ZhbHVlOiByYW5nZS5taW4sXHJcbiAgICAgICAgICAgIGhpZ2hWYWx1ZTogcmFuZ2UubWF4XHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICB7IGZvbnQ6IEZPTlQsIG1heFdpZHRoOiAxNTAgfVxyXG4gICAgICAgIClcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBzZWxlY3RlZFJhbmdlUHJvcGVydHksIHJhbmdlU2VsZWN0aW9uQ29tYm9Cb3hJdGVtcywgbGlzdEJveFBhcmVudE5vZGUsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlckxpbmVDb21tb24ucmVnaXN0ZXIoICdOdW1iZXJMaW5lUmFuZ2VTZWxlY3RvcicsIE51bWJlckxpbmVSYW5nZVNlbGVjdG9yICk7XHJcbmV4cG9ydCBkZWZhdWx0IE51bWJlckxpbmVSYW5nZVNlbGVjdG9yOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHVCQUF1QixNQUFNLDhEQUE4RDtBQUNsRyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCOztBQUV4RDtBQUNBLE1BQU1DLElBQUksR0FBRyxJQUFJSixRQUFRLENBQUUsRUFBRyxDQUFDO0FBRS9CLE1BQU1LLHVCQUF1QixTQUFTSCxRQUFRLENBQUM7RUFFN0M7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMscUJBQXFCLEVBQUVDLE1BQU0sRUFBRUMsaUJBQWlCLEVBQUVDLE9BQU8sRUFBRztJQUV2RUEsT0FBTyxHQUFHWixLQUFLLENBQUU7TUFDZmEsWUFBWSxFQUFFLE9BQU87TUFDckJDLE9BQU8sRUFBRSxFQUFFO01BQ1hDLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLFlBQVksRUFBRSxDQUFDO01BQ2ZDLHdCQUF3QixFQUFFLENBQUM7TUFDM0JDLHdCQUF3QixFQUFFLENBQUM7TUFDM0JDLEtBQUssRUFBRTtJQUNULENBQUMsRUFBRVAsT0FBUSxDQUFDOztJQUVaO0lBQ0EsTUFBTVEsMkJBQTJCLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDeENWLE1BQU0sQ0FBQ1csT0FBTyxDQUFFQyxLQUFLLElBQUk7TUFDdkJGLDJCQUEyQixDQUFDRyxJQUFJLENBQUU7UUFDaENDLEtBQUssRUFBRUYsS0FBSztRQUNaRyxVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJdEIsSUFBSSxDQUN4QkYsV0FBVyxDQUFDeUIsTUFBTSxDQUFFM0IsdUJBQXVCLENBQUM0QixZQUFZLEVBQUU7VUFDeERDLFFBQVEsRUFBRU4sS0FBSyxDQUFDTyxHQUFHO1VBQ25CQyxTQUFTLEVBQUVSLEtBQUssQ0FBQ1M7UUFDbkIsQ0FBRSxDQUFDLEVBQ0g7VUFBRUMsSUFBSSxFQUFFMUIsSUFBSTtVQUFFMkIsUUFBUSxFQUFFO1FBQUksQ0FDOUI7TUFDRixDQUFFLENBQUM7SUFDTCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUV4QixxQkFBcUIsRUFBRVcsMkJBQTJCLEVBQUVULGlCQUFpQixFQUFFQyxPQUFRLENBQUM7RUFDekY7QUFDRjtBQUVBUCxnQkFBZ0IsQ0FBQzZCLFFBQVEsQ0FBRSx5QkFBeUIsRUFBRTNCLHVCQUF3QixDQUFDO0FBQy9FLGVBQWVBLHVCQUF1QiJ9