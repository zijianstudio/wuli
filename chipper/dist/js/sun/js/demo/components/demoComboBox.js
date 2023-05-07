// Copyright 2022-2023, University of Colorado Boulder

/**
 * Demo for ComboBox
 */

import ComboBox from '../../ComboBox.js';
import Checkbox from '../../Checkbox.js';
import { Font, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Property from '../../../../axon/js/Property.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
const FONT = new Font({
  size: 20
});
export default function demoComboBox(layoutBounds) {
  const values = ['one', 'two', 'three', 'four', 'five', 'six'];
  const items = [];
  values.forEach(value => {
    items.push({
      value: value,
      createNode: () => new Text(value, {
        font: FONT
      })
    });
  });
  const selectedItemProperty = new Property(values[0]);
  const listParent = new Node();
  const enabledProperty = new BooleanProperty(true);
  const comboBox = new ComboBox(selectedItemProperty, items, listParent, {
    highlightFill: 'yellow',
    listPosition: 'above',
    enabledProperty: enabledProperty
  });
  const enabledCheckbox = new Checkbox(enabledProperty, new Text('enabled', {
    font: FONT
  }));
  const uiComponents = new VBox({
    children: [comboBox, enabledCheckbox],
    spacing: 40,
    center: layoutBounds.center
  });
  return new Node({
    children: [uiComponents, listParent]
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21ib0JveCIsIkNoZWNrYm94IiwiRm9udCIsIk5vZGUiLCJUZXh0IiwiVkJveCIsIlByb3BlcnR5IiwiQm9vbGVhblByb3BlcnR5IiwiRk9OVCIsInNpemUiLCJkZW1vQ29tYm9Cb3giLCJsYXlvdXRCb3VuZHMiLCJ2YWx1ZXMiLCJpdGVtcyIsImZvckVhY2giLCJ2YWx1ZSIsInB1c2giLCJjcmVhdGVOb2RlIiwiZm9udCIsInNlbGVjdGVkSXRlbVByb3BlcnR5IiwibGlzdFBhcmVudCIsImVuYWJsZWRQcm9wZXJ0eSIsImNvbWJvQm94IiwiaGlnaGxpZ2h0RmlsbCIsImxpc3RQb3NpdGlvbiIsImVuYWJsZWRDaGVja2JveCIsInVpQ29tcG9uZW50cyIsImNoaWxkcmVuIiwic3BhY2luZyIsImNlbnRlciJdLCJzb3VyY2VzIjpbImRlbW9Db21ib0JveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciBDb21ib0JveFxyXG4gKi9cclxuXHJcbmltcG9ydCBDb21ib0JveCwgeyBDb21ib0JveEl0ZW0gfSBmcm9tICcuLi8uLi9Db21ib0JveC5qcyc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IHsgRm9udCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCBGT05UID0gbmV3IEZvbnQoIHsgc2l6ZTogMjAgfSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0NvbWJvQm94KCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XHJcblxyXG4gIGNvbnN0IHZhbHVlcyA9IFsgJ29uZScsICd0d28nLCAndGhyZWUnLCAnZm91cicsICdmaXZlJywgJ3NpeCcgXTtcclxuICBjb25zdCBpdGVtczogQ29tYm9Cb3hJdGVtPHN0cmluZz5bXSA9IFtdO1xyXG4gIHZhbHVlcy5mb3JFYWNoKCB2YWx1ZSA9PiB7XHJcbiAgICBpdGVtcy5wdXNoKCB7XHJcbiAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoIHZhbHVlLCB7IGZvbnQ6IEZPTlQgfSApXHJcbiAgICB9ICk7XHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBzZWxlY3RlZEl0ZW1Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdmFsdWVzWyAwIF0gKTtcclxuXHJcbiAgY29uc3QgbGlzdFBhcmVudCA9IG5ldyBOb2RlKCk7XHJcblxyXG4gIGNvbnN0IGVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgY29uc3QgY29tYm9Cb3ggPSBuZXcgQ29tYm9Cb3goIHNlbGVjdGVkSXRlbVByb3BlcnR5LCBpdGVtcywgbGlzdFBhcmVudCwge1xyXG4gICAgaGlnaGxpZ2h0RmlsbDogJ3llbGxvdycsXHJcbiAgICBsaXN0UG9zaXRpb246ICdhYm92ZScsXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGVuYWJsZWRQcm9wZXJ0eVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgZW5hYmxlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBlbmFibGVkUHJvcGVydHksIG5ldyBUZXh0KCAnZW5hYmxlZCcsIHsgZm9udDogRk9OVCB9ICkgKTtcclxuXHJcbiAgY29uc3QgdWlDb21wb25lbnRzID0gbmV3IFZCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbIGNvbWJvQm94LCBlbmFibGVkQ2hlY2tib3ggXSxcclxuICAgIHNwYWNpbmc6IDQwLFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXHJcbiAgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgdWlDb21wb25lbnRzLCBsaXN0UGFyZW50IF0gfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUF3QixtQkFBbUI7QUFDMUQsT0FBT0MsUUFBUSxNQUFNLG1CQUFtQjtBQUV4QyxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzFFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxNQUFNQyxJQUFJLEdBQUcsSUFBSU4sSUFBSSxDQUFFO0VBQUVPLElBQUksRUFBRTtBQUFHLENBQUUsQ0FBQztBQUVyQyxlQUFlLFNBQVNDLFlBQVlBLENBQUVDLFlBQXFCLEVBQVM7RUFFbEUsTUFBTUMsTUFBTSxHQUFHLENBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUU7RUFDL0QsTUFBTUMsS0FBNkIsR0FBRyxFQUFFO0VBQ3hDRCxNQUFNLENBQUNFLE9BQU8sQ0FBRUMsS0FBSyxJQUFJO0lBQ3ZCRixLQUFLLENBQUNHLElBQUksQ0FBRTtNQUNWRCxLQUFLLEVBQUVBLEtBQUs7TUFDWkUsVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSWIsSUFBSSxDQUFFVyxLQUFLLEVBQUU7UUFBRUcsSUFBSSxFQUFFVjtNQUFLLENBQUU7SUFDcEQsQ0FBRSxDQUFDO0VBQ0wsQ0FBRSxDQUFDO0VBRUgsTUFBTVcsb0JBQW9CLEdBQUcsSUFBSWIsUUFBUSxDQUFFTSxNQUFNLENBQUUsQ0FBQyxDQUFHLENBQUM7RUFFeEQsTUFBTVEsVUFBVSxHQUFHLElBQUlqQixJQUFJLENBQUMsQ0FBQztFQUU3QixNQUFNa0IsZUFBZSxHQUFHLElBQUlkLGVBQWUsQ0FBRSxJQUFLLENBQUM7RUFFbkQsTUFBTWUsUUFBUSxHQUFHLElBQUl0QixRQUFRLENBQUVtQixvQkFBb0IsRUFBRU4sS0FBSyxFQUFFTyxVQUFVLEVBQUU7SUFDdEVHLGFBQWEsRUFBRSxRQUFRO0lBQ3ZCQyxZQUFZLEVBQUUsT0FBTztJQUNyQkgsZUFBZSxFQUFFQTtFQUNuQixDQUFFLENBQUM7RUFFSCxNQUFNSSxlQUFlLEdBQUcsSUFBSXhCLFFBQVEsQ0FBRW9CLGVBQWUsRUFBRSxJQUFJakIsSUFBSSxDQUFFLFNBQVMsRUFBRTtJQUFFYyxJQUFJLEVBQUVWO0VBQUssQ0FBRSxDQUFFLENBQUM7RUFFOUYsTUFBTWtCLFlBQVksR0FBRyxJQUFJckIsSUFBSSxDQUFFO0lBQzdCc0IsUUFBUSxFQUFFLENBQUVMLFFBQVEsRUFBRUcsZUFBZSxDQUFFO0lBQ3ZDRyxPQUFPLEVBQUUsRUFBRTtJQUNYQyxNQUFNLEVBQUVsQixZQUFZLENBQUNrQjtFQUN2QixDQUFFLENBQUM7RUFFSCxPQUFPLElBQUkxQixJQUFJLENBQUU7SUFBRXdCLFFBQVEsRUFBRSxDQUFFRCxZQUFZLEVBQUVOLFVBQVU7RUFBRyxDQUFFLENBQUM7QUFDL0QifQ==