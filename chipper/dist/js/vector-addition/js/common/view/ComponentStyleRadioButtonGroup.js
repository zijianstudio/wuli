// Copyright 2019-2023, University of Colorado Boulder

/**
 * ComponentStyleRadioButtonGroup is a group of radio buttons, arranged in a grid, for selecting component style.
 * It does not use RectangularRadioButtonGroup, because that class does not support a grid layout.
 * See https://github.com/phetsims/sun/issues/513 for context.
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import RectangularRadioButton from '../../../../sun/js/buttons/RectangularRadioButton.js';
import vectorAddition from '../../vectorAddition.js';
import ComponentVectorStyles from '../model/ComponentVectorStyles.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import GridBox from './GridBox.js';
import VectorAdditionIconFactory from './VectorAdditionIconFactory.js';
export default class ComponentStyleRadioButtonGroup extends Node {
  /**
   * @param {EnumerationProperty.<ComponentVectorStyles>} componentStyleProperty
   */
  constructor(componentStyleProperty) {
    assert && assert(componentStyleProperty instanceof EnumerationProperty && ComponentVectorStyles.enumeration.includes(componentStyleProperty.value), `invalid componentStyleProperty: ${componentStyleProperty}`);

    // Create the radio buttons. Note that order of enum values determines order of buttons.
    const buttons = [];
    ComponentVectorStyles.enumeration.values.forEach(componentStyle => {
      buttons.push(new RectangularRadioButton(componentStyleProperty, componentStyle, merge({}, VectorAdditionConstants.RADIO_BUTTON_GROUP_OPTIONS, {
        content: VectorAdditionIconFactory.createComponentStyleRadioButtonIcon(componentStyle)
      })));
    });

    // Arrange the buttons in a grid
    const gridBox = new GridBox(buttons, {
      columns: 2
    });
    super({
      children: [gridBox]
    });
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'ComponentStyleRadioButtonGroup is not intended to be disposed');
  }
}
vectorAddition.register('ComponentStyleRadioButtonGroup', ComponentStyleRadioButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwibWVyZ2UiLCJOb2RlIiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiIsInZlY3RvckFkZGl0aW9uIiwiQ29tcG9uZW50VmVjdG9yU3R5bGVzIiwiVmVjdG9yQWRkaXRpb25Db25zdGFudHMiLCJHcmlkQm94IiwiVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeSIsIkNvbXBvbmVudFN0eWxlUmFkaW9CdXR0b25Hcm91cCIsImNvbnN0cnVjdG9yIiwiY29tcG9uZW50U3R5bGVQcm9wZXJ0eSIsImFzc2VydCIsImVudW1lcmF0aW9uIiwiaW5jbHVkZXMiLCJ2YWx1ZSIsImJ1dHRvbnMiLCJ2YWx1ZXMiLCJmb3JFYWNoIiwiY29tcG9uZW50U3R5bGUiLCJwdXNoIiwiUkFESU9fQlVUVE9OX0dST1VQX09QVElPTlMiLCJjb250ZW50IiwiY3JlYXRlQ29tcG9uZW50U3R5bGVSYWRpb0J1dHRvbkljb24iLCJncmlkQm94IiwiY29sdW1ucyIsImNoaWxkcmVuIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29tcG9uZW50U3R5bGVSYWRpb0J1dHRvbkdyb3VwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbXBvbmVudFN0eWxlUmFkaW9CdXR0b25Hcm91cCBpcyBhIGdyb3VwIG9mIHJhZGlvIGJ1dHRvbnMsIGFycmFuZ2VkIGluIGEgZ3JpZCwgZm9yIHNlbGVjdGluZyBjb21wb25lbnQgc3R5bGUuXHJcbiAqIEl0IGRvZXMgbm90IHVzZSBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAsIGJlY2F1c2UgdGhhdCBjbGFzcyBkb2VzIG5vdCBzdXBwb3J0IGEgZ3JpZCBsYXlvdXQuXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy81MTMgZm9yIGNvbnRleHQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbi5qcyc7XHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi8uLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBDb21wb25lbnRWZWN0b3JTdHlsZXMgZnJvbSAnLi4vbW9kZWwvQ29tcG9uZW50VmVjdG9yU3R5bGVzLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdyaWRCb3ggZnJvbSAnLi9HcmlkQm94LmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uSWNvbkZhY3RvcnkgZnJvbSAnLi9WZWN0b3JBZGRpdGlvbkljb25GYWN0b3J5LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBvbmVudFN0eWxlUmFkaW9CdXR0b25Hcm91cCBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0VudW1lcmF0aW9uUHJvcGVydHkuPENvbXBvbmVudFZlY3RvclN0eWxlcz59IGNvbXBvbmVudFN0eWxlUHJvcGVydHlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29tcG9uZW50U3R5bGVQcm9wZXJ0eSApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb21wb25lbnRTdHlsZVByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSAmJiBDb21wb25lbnRWZWN0b3JTdHlsZXMuZW51bWVyYXRpb24uaW5jbHVkZXMoIGNvbXBvbmVudFN0eWxlUHJvcGVydHkudmFsdWUgKSxcclxuICAgICAgYGludmFsaWQgY29tcG9uZW50U3R5bGVQcm9wZXJ0eTogJHtjb21wb25lbnRTdHlsZVByb3BlcnR5fWAgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHJhZGlvIGJ1dHRvbnMuIE5vdGUgdGhhdCBvcmRlciBvZiBlbnVtIHZhbHVlcyBkZXRlcm1pbmVzIG9yZGVyIG9mIGJ1dHRvbnMuXHJcbiAgICBjb25zdCBidXR0b25zID0gW107XHJcbiAgICBDb21wb25lbnRWZWN0b3JTdHlsZXMuZW51bWVyYXRpb24udmFsdWVzLmZvckVhY2goIGNvbXBvbmVudFN0eWxlID0+IHtcclxuICAgICAgYnV0dG9ucy5wdXNoKCBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiggY29tcG9uZW50U3R5bGVQcm9wZXJ0eSwgY29tcG9uZW50U3R5bGUsXHJcbiAgICAgICAgbWVyZ2UoIHt9LCBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5SQURJT19CVVRUT05fR1JPVVBfT1BUSU9OUywge1xyXG4gICAgICAgICAgY29udGVudDogVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeS5jcmVhdGVDb21wb25lbnRTdHlsZVJhZGlvQnV0dG9uSWNvbiggY29tcG9uZW50U3R5bGUgKVxyXG4gICAgICAgIH0gKSApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQXJyYW5nZSB0aGUgYnV0dG9ucyBpbiBhIGdyaWRcclxuICAgIGNvbnN0IGdyaWRCb3ggPSBuZXcgR3JpZEJveCggYnV0dG9ucywge1xyXG4gICAgICBjb2x1bW5zOiAyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFsgZ3JpZEJveCBdXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnQ29tcG9uZW50U3R5bGVSYWRpb0J1dHRvbkdyb3VwIGlzIG5vdCBpbnRlbmRlZCB0byBiZSBkaXNwb3NlZCcgKTtcclxuICB9XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnQ29tcG9uZW50U3R5bGVSYWRpb0J1dHRvbkdyb3VwJywgQ29tcG9uZW50U3R5bGVSYWRpb0J1dHRvbkdyb3VwICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0Msc0JBQXNCLE1BQU0sc0RBQXNEO0FBQ3pGLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MscUJBQXFCLE1BQU0sbUNBQW1DO0FBQ3JFLE9BQU9DLHVCQUF1QixNQUFNLCtCQUErQjtBQUNuRSxPQUFPQyxPQUFPLE1BQU0sY0FBYztBQUNsQyxPQUFPQyx5QkFBeUIsTUFBTSxnQ0FBZ0M7QUFFdEUsZUFBZSxNQUFNQyw4QkFBOEIsU0FBU1AsSUFBSSxDQUFDO0VBRS9EO0FBQ0Y7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxzQkFBc0IsRUFBRztJQUVwQ0MsTUFBTSxJQUFJQSxNQUFNLENBQUVELHNCQUFzQixZQUFZWCxtQkFBbUIsSUFBSUsscUJBQXFCLENBQUNRLFdBQVcsQ0FBQ0MsUUFBUSxDQUFFSCxzQkFBc0IsQ0FBQ0ksS0FBTSxDQUFDLEVBQ2xKLG1DQUFrQ0osc0JBQXVCLEVBQUUsQ0FBQzs7SUFFL0Q7SUFDQSxNQUFNSyxPQUFPLEdBQUcsRUFBRTtJQUNsQlgscUJBQXFCLENBQUNRLFdBQVcsQ0FBQ0ksTUFBTSxDQUFDQyxPQUFPLENBQUVDLGNBQWMsSUFBSTtNQUNsRUgsT0FBTyxDQUFDSSxJQUFJLENBQUUsSUFBSWpCLHNCQUFzQixDQUFFUSxzQkFBc0IsRUFBRVEsY0FBYyxFQUM5RWxCLEtBQUssQ0FBRSxDQUFDLENBQUMsRUFBRUssdUJBQXVCLENBQUNlLDBCQUEwQixFQUFFO1FBQzdEQyxPQUFPLEVBQUVkLHlCQUF5QixDQUFDZSxtQ0FBbUMsQ0FBRUosY0FBZTtNQUN6RixDQUFFLENBQUUsQ0FBRSxDQUFDO0lBQ1gsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUssT0FBTyxHQUFHLElBQUlqQixPQUFPLENBQUVTLE9BQU8sRUFBRTtNQUNwQ1MsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFO01BQ0xDLFFBQVEsRUFBRSxDQUFFRixPQUFPO0lBQ3JCLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VHLE9BQU9BLENBQUEsRUFBRztJQUNSZixNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsK0RBQWdFLENBQUM7RUFDNUY7QUFDRjtBQUVBUixjQUFjLENBQUN3QixRQUFRLENBQUUsZ0NBQWdDLEVBQUVuQiw4QkFBK0IsQ0FBQyJ9