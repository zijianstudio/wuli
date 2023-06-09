// Copyright 2022, University of Colorado Boulder

/**
 * Demo for various toggle buttons.
 *
 * @author various contributors
 */

import Checkbox from '../../Checkbox.js';
import RoundStickyToggleButton from '../../buttons/RoundStickyToggleButton.js';
import BooleanRectangularStickyToggleButton from '../../buttons/BooleanRectangularStickyToggleButton.js';
import { Color, Font, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
export default function demoToggleButtons(layoutBounds) {
  // For enabling/disabling all buttons
  const buttonsEnabledProperty = new BooleanProperty(true);
  const buttonsEnabledCheckbox = new Checkbox(buttonsEnabledProperty, new Text('buttons enabled', {
    font: new Font({
      size: 20
    })
  }));

  // Demonstrate using arbitrary values for toggle button.  Wrap in extra
  // quotes so it is clear that it is a string in the debugging UI.
  const roundToggleButtonProperty = new Property('off');
  roundToggleButtonProperty.lazyLink(value => console.log(`roundToggleButtonProperty.value = ${value}`));
  const roundStickyToggleButton = new RoundStickyToggleButton(roundToggleButtonProperty, 'off', 'on', {
    baseColor: new Color(255, 0, 0),
    enabledProperty: buttonsEnabledProperty
  });
  const booleanRectangularToggleButtonProperty = new BooleanProperty(false);
  booleanRectangularToggleButtonProperty.lazyLink(value => console.log(`booleanRectangularToggleButtonProperty.value = ${value}`));
  const booleanRectangularStickyToggleButton = new BooleanRectangularStickyToggleButton(booleanRectangularToggleButtonProperty, {
    baseColor: new Color(0, 200, 200),
    enabledProperty: buttonsEnabledProperty,
    size: new Dimension2(50, 35)
  });
  return new VBox({
    spacing: 35,
    children: [new HBox({
      children: [roundStickyToggleButton, booleanRectangularStickyToggleButton],
      spacing: 15
    }), buttonsEnabledCheckbox],
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGVja2JveCIsIlJvdW5kU3RpY2t5VG9nZ2xlQnV0dG9uIiwiQm9vbGVhblJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uIiwiQ29sb3IiLCJGb250IiwiSEJveCIsIlRleHQiLCJWQm94IiwiQm9vbGVhblByb3BlcnR5IiwiUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiZGVtb1RvZ2dsZUJ1dHRvbnMiLCJsYXlvdXRCb3VuZHMiLCJidXR0b25zRW5hYmxlZFByb3BlcnR5IiwiYnV0dG9uc0VuYWJsZWRDaGVja2JveCIsImZvbnQiLCJzaXplIiwicm91bmRUb2dnbGVCdXR0b25Qcm9wZXJ0eSIsImxhenlMaW5rIiwidmFsdWUiLCJjb25zb2xlIiwibG9nIiwicm91bmRTdGlja3lUb2dnbGVCdXR0b24iLCJiYXNlQ29sb3IiLCJlbmFibGVkUHJvcGVydHkiLCJib29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25Qcm9wZXJ0eSIsImJvb2xlYW5SZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbiIsInNwYWNpbmciLCJjaGlsZHJlbiIsImNlbnRlciJdLCJzb3VyY2VzIjpbImRlbW9Ub2dnbGVCdXR0b25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciB2YXJpb3VzIHRvZ2dsZSBidXR0b25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIHZhcmlvdXMgY29udHJpYnV0b3JzXHJcbiAqL1xyXG5cclxuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFJvdW5kU3RpY2t5VG9nZ2xlQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvUm91bmRTdGlja3lUb2dnbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgQm9vbGVhblJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvQm9vbGVhblJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIEZvbnQsIEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9Ub2dnbGVCdXR0b25zKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XHJcblxyXG4gIC8vIEZvciBlbmFibGluZy9kaXNhYmxpbmcgYWxsIGJ1dHRvbnNcclxuICBjb25zdCBidXR0b25zRW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xyXG4gIGNvbnN0IGJ1dHRvbnNFbmFibGVkQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIGJ1dHRvbnNFbmFibGVkUHJvcGVydHksIG5ldyBUZXh0KCAnYnV0dG9ucyBlbmFibGVkJywge1xyXG4gICAgZm9udDogbmV3IEZvbnQoIHsgc2l6ZTogMjAgfSApXHJcbiAgfSApICk7XHJcblxyXG4gIC8vIERlbW9uc3RyYXRlIHVzaW5nIGFyYml0cmFyeSB2YWx1ZXMgZm9yIHRvZ2dsZSBidXR0b24uICBXcmFwIGluIGV4dHJhXHJcbiAgLy8gcXVvdGVzIHNvIGl0IGlzIGNsZWFyIHRoYXQgaXQgaXMgYSBzdHJpbmcgaW4gdGhlIGRlYnVnZ2luZyBVSS5cclxuICBjb25zdCByb3VuZFRvZ2dsZUJ1dHRvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnb2ZmJyApO1xyXG4gIHJvdW5kVG9nZ2xlQnV0dG9uUHJvcGVydHkubGF6eUxpbmsoIHZhbHVlID0+IGNvbnNvbGUubG9nKCBgcm91bmRUb2dnbGVCdXR0b25Qcm9wZXJ0eS52YWx1ZSA9ICR7dmFsdWV9YCApICk7XHJcbiAgY29uc3Qgcm91bmRTdGlja3lUb2dnbGVCdXR0b24gPSBuZXcgUm91bmRTdGlja3lUb2dnbGVCdXR0b24oIHJvdW5kVG9nZ2xlQnV0dG9uUHJvcGVydHksICdvZmYnLCAnb24nLCB7XHJcbiAgICBiYXNlQ29sb3I6IG5ldyBDb2xvciggMjU1LCAwLCAwICksXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHlcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICBib29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25Qcm9wZXJ0eS5sYXp5TGluayggdmFsdWUgPT4gY29uc29sZS5sb2coIGBib29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25Qcm9wZXJ0eS52YWx1ZSA9ICR7dmFsdWV9YCApICk7XHJcbiAgY29uc3QgYm9vbGVhblJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uID0gbmV3IEJvb2xlYW5SZWN0YW5ndWxhclN0aWNreVRvZ2dsZUJ1dHRvbiggYm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uUHJvcGVydHksIHtcclxuICAgIGJhc2VDb2xvcjogbmV3IENvbG9yKCAwLCAyMDAsIDIwMCApLFxyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDUwLCAzNSApXHJcbiAgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IFZCb3goIHtcclxuICAgIHNwYWNpbmc6IDM1LFxyXG4gICAgY2hpbGRyZW46IFtcclxuICAgICAgbmV3IEhCb3goIHtcclxuICAgICAgICBjaGlsZHJlbjogWyByb3VuZFN0aWNreVRvZ2dsZUJ1dHRvbiwgYm9vbGVhblJlY3Rhbmd1bGFyU3RpY2t5VG9nZ2xlQnV0dG9uIF0sXHJcbiAgICAgICAgc3BhY2luZzogMTVcclxuICAgICAgfSApLFxyXG4gICAgICBidXR0b25zRW5hYmxlZENoZWNrYm94XHJcbiAgICBdLFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxtQkFBbUI7QUFDeEMsT0FBT0MsdUJBQXVCLE1BQU0sMENBQTBDO0FBQzlFLE9BQU9DLG9DQUFvQyxNQUFNLHVEQUF1RDtBQUN4RyxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFRQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFFdkYsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFFekQsZUFBZSxTQUFTQyxpQkFBaUJBLENBQUVDLFlBQXFCLEVBQVM7RUFFdkU7RUFDQSxNQUFNQyxzQkFBc0IsR0FBRyxJQUFJTCxlQUFlLENBQUUsSUFBSyxDQUFDO0VBQzFELE1BQU1NLHNCQUFzQixHQUFHLElBQUlkLFFBQVEsQ0FBRWEsc0JBQXNCLEVBQUUsSUFBSVAsSUFBSSxDQUFFLGlCQUFpQixFQUFFO0lBQ2hHUyxJQUFJLEVBQUUsSUFBSVgsSUFBSSxDQUFFO01BQUVZLElBQUksRUFBRTtJQUFHLENBQUU7RUFDL0IsQ0FBRSxDQUFFLENBQUM7O0VBRUw7RUFDQTtFQUNBLE1BQU1DLHlCQUF5QixHQUFHLElBQUlSLFFBQVEsQ0FBRSxLQUFNLENBQUM7RUFDdkRRLHlCQUF5QixDQUFDQyxRQUFRLENBQUVDLEtBQUssSUFBSUMsT0FBTyxDQUFDQyxHQUFHLENBQUcscUNBQW9DRixLQUFNLEVBQUUsQ0FBRSxDQUFDO0VBQzFHLE1BQU1HLHVCQUF1QixHQUFHLElBQUlyQix1QkFBdUIsQ0FBRWdCLHlCQUF5QixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDbkdNLFNBQVMsRUFBRSxJQUFJcEIsS0FBSyxDQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0lBQ2pDcUIsZUFBZSxFQUFFWDtFQUNuQixDQUFFLENBQUM7RUFFSCxNQUFNWSxzQ0FBc0MsR0FBRyxJQUFJakIsZUFBZSxDQUFFLEtBQU0sQ0FBQztFQUMzRWlCLHNDQUFzQyxDQUFDUCxRQUFRLENBQUVDLEtBQUssSUFBSUMsT0FBTyxDQUFDQyxHQUFHLENBQUcsa0RBQWlERixLQUFNLEVBQUUsQ0FBRSxDQUFDO0VBQ3BJLE1BQU1PLG9DQUFvQyxHQUFHLElBQUl4QixvQ0FBb0MsQ0FBRXVCLHNDQUFzQyxFQUFFO0lBQzdIRixTQUFTLEVBQUUsSUFBSXBCLEtBQUssQ0FBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztJQUNuQ3FCLGVBQWUsRUFBRVgsc0JBQXNCO0lBQ3ZDRyxJQUFJLEVBQUUsSUFBSU4sVUFBVSxDQUFFLEVBQUUsRUFBRSxFQUFHO0VBQy9CLENBQUUsQ0FBQztFQUVILE9BQU8sSUFBSUgsSUFBSSxDQUFFO0lBQ2ZvQixPQUFPLEVBQUUsRUFBRTtJQUNYQyxRQUFRLEVBQUUsQ0FDUixJQUFJdkIsSUFBSSxDQUFFO01BQ1J1QixRQUFRLEVBQUUsQ0FBRU4sdUJBQXVCLEVBQUVJLG9DQUFvQyxDQUFFO01BQzNFQyxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUMsRUFDSGIsc0JBQXNCLENBQ3ZCO0lBQ0RlLE1BQU0sRUFBRWpCLFlBQVksQ0FBQ2lCO0VBQ3ZCLENBQUUsQ0FBQztBQUNMIn0=