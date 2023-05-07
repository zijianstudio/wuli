// Copyright 2014-2023, University of Colorado Boulder

/**
 * Radio buttons for selecting between a set of mutually-exclusive tools.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Image } from '../../../../scenery/js/imports.js';
import RectangularRadioButton from '../../../../sun/js/buttons/RectangularRadioButton.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import lightBulbIcon_png from '../../../images/lightBulbIcon_png.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
import PHMeterNode from './PHMeterNode.js';
import PHPaperNode from './PHPaperNode.js';
export default class ToolsRadioButtonGroup extends RectangularRadioButtonGroup {
  constructor(toolModeProperty, tandem) {
    const items = [{
      value: 'pHMeter',
      createNode: () => PHMeterNode.createIcon(),
      tandemName: `phMeter${RectangularRadioButton.TANDEM_NAME_SUFFIX}`
    }, {
      value: 'pHPaper',
      createNode: () => PHPaperNode.createIcon(8, 30),
      tandemName: `phPaper${RectangularRadioButton.TANDEM_NAME_SUFFIX}`
    }, {
      value: 'conductivity',
      createNode: () => new Image(lightBulbIcon_png),
      tandemName: `conductivity${RectangularRadioButton.TANDEM_NAME_SUFFIX}`
    }];
    super(toolModeProperty, items, {
      orientation: 'horizontal',
      spacing: 5,
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 9
      },
      tandem: tandem
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
acidBaseSolutions.register('ToolsRadioButtonGroup', ToolsRadioButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbWFnZSIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b24iLCJSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJsaWdodEJ1bGJJY29uX3BuZyIsImFjaWRCYXNlU29sdXRpb25zIiwiUEhNZXRlck5vZGUiLCJQSFBhcGVyTm9kZSIsIlRvb2xzUmFkaW9CdXR0b25Hcm91cCIsImNvbnN0cnVjdG9yIiwidG9vbE1vZGVQcm9wZXJ0eSIsInRhbmRlbSIsIml0ZW1zIiwidmFsdWUiLCJjcmVhdGVOb2RlIiwiY3JlYXRlSWNvbiIsInRhbmRlbU5hbWUiLCJUQU5ERU1fTkFNRV9TVUZGSVgiLCJvcmllbnRhdGlvbiIsInNwYWNpbmciLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJ4TWFyZ2luIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVG9vbHNSYWRpb0J1dHRvbkdyb3VwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJhZGlvIGJ1dHRvbnMgZm9yIHNlbGVjdGluZyBiZXR3ZWVuIGEgc2V0IG9mIG11dHVhbGx5LWV4Y2x1c2l2ZSB0b29scy5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdVbmlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nVW5pb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbi5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAsIHsgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwSXRlbSB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBsaWdodEJ1bGJJY29uX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvbGlnaHRCdWxiSWNvbl9wbmcuanMnO1xyXG5pbXBvcnQgYWNpZEJhc2VTb2x1dGlvbnMgZnJvbSAnLi4vLi4vYWNpZEJhc2VTb2x1dGlvbnMuanMnO1xyXG5pbXBvcnQgeyBUb29sTW9kZSB9IGZyb20gJy4vVG9vbE1vZGUuanMnO1xyXG5pbXBvcnQgUEhNZXRlck5vZGUgZnJvbSAnLi9QSE1ldGVyTm9kZS5qcyc7XHJcbmltcG9ydCBQSFBhcGVyTm9kZSBmcm9tICcuL1BIUGFwZXJOb2RlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvb2xzUmFkaW9CdXR0b25Hcm91cCBleHRlbmRzIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cDxUb29sTW9kZT4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRvb2xNb2RlUHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8VG9vbE1vZGU+LCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBpdGVtczogUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwSXRlbTxUb29sTW9kZT5bXSA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiAncEhNZXRlcicsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gUEhNZXRlck5vZGUuY3JlYXRlSWNvbigpLFxyXG4gICAgICAgIHRhbmRlbU5hbWU6IGBwaE1ldGVyJHtSZWN0YW5ndWxhclJhZGlvQnV0dG9uLlRBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogJ3BIUGFwZXInLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IFBIUGFwZXJOb2RlLmNyZWF0ZUljb24oIDgsIDMwICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYHBoUGFwZXIke1JlY3Rhbmd1bGFyUmFkaW9CdXR0b24uVEFOREVNX05BTUVfU1VGRklYfWBcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiAnY29uZHVjdGl2aXR5JyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgSW1hZ2UoIGxpZ2h0QnVsYkljb25fcG5nICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYGNvbmR1Y3Rpdml0eSR7UmVjdGFuZ3VsYXJSYWRpb0J1dHRvbi5UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCB0b29sTW9kZVByb3BlcnR5LCBpdGVtcywge1xyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICBzcGFjaW5nOiA1LFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBiYXNlQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgeE1hcmdpbjogOVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmFjaWRCYXNlU29sdXRpb25zLnJlZ2lzdGVyKCAnVG9vbHNSYWRpb0J1dHRvbkdyb3VwJywgVG9vbHNSYWRpb0J1dHRvbkdyb3VwICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsU0FBU0EsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxzQkFBc0IsTUFBTSxzREFBc0Q7QUFDekYsT0FBT0MsMkJBQTJCLE1BQTJDLDJEQUEyRDtBQUV4SSxPQUFPQyxpQkFBaUIsTUFBTSxzQ0FBc0M7QUFDcEUsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCO0FBRTFELE9BQU9DLFdBQVcsTUFBTSxrQkFBa0I7QUFDMUMsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUUxQyxlQUFlLE1BQU1DLHFCQUFxQixTQUFTTCwyQkFBMkIsQ0FBVztFQUVoRk0sV0FBV0EsQ0FBRUMsZ0JBQStDLEVBQUVDLE1BQWMsRUFBRztJQUVwRixNQUFNQyxLQUFrRCxHQUFHLENBQ3pEO01BQ0VDLEtBQUssRUFBRSxTQUFTO01BQ2hCQyxVQUFVLEVBQUVBLENBQUEsS0FBTVIsV0FBVyxDQUFDUyxVQUFVLENBQUMsQ0FBQztNQUMxQ0MsVUFBVSxFQUFHLFVBQVNkLHNCQUFzQixDQUFDZSxrQkFBbUI7SUFDbEUsQ0FBQyxFQUNEO01BQ0VKLEtBQUssRUFBRSxTQUFTO01BQ2hCQyxVQUFVLEVBQUVBLENBQUEsS0FBTVAsV0FBVyxDQUFDUSxVQUFVLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQztNQUNqREMsVUFBVSxFQUFHLFVBQVNkLHNCQUFzQixDQUFDZSxrQkFBbUI7SUFDbEUsQ0FBQyxFQUNEO01BQ0VKLEtBQUssRUFBRSxjQUFjO01BQ3JCQyxVQUFVLEVBQUVBLENBQUEsS0FBTSxJQUFJYixLQUFLLENBQUVHLGlCQUFrQixDQUFDO01BQ2hEWSxVQUFVLEVBQUcsZUFBY2Qsc0JBQXNCLENBQUNlLGtCQUFtQjtJQUN2RSxDQUFDLENBQ0Y7SUFFRCxLQUFLLENBQUVQLGdCQUFnQixFQUFFRSxLQUFLLEVBQUU7TUFDOUJNLFdBQVcsRUFBRSxZQUFZO01BQ3pCQyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxrQkFBa0IsRUFBRTtRQUNsQkMsU0FBUyxFQUFFLE9BQU87UUFDbEJDLE9BQU8sRUFBRTtNQUNYLENBQUM7TUFDRFgsTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBQztFQUNMO0VBRWdCWSxPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQWxCLGlCQUFpQixDQUFDb0IsUUFBUSxDQUFFLHVCQUF1QixFQUFFakIscUJBQXNCLENBQUMifQ==