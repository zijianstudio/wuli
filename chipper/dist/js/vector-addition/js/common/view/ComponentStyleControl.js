// Copyright 2019-2023, University of Colorado Boulder

/**
 * ComponentStyleControl is the control for selecting how to visually represent component vectors.
 * It consists of a labeled group of radio buttons.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Brandon Li
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignBox, Text, VBox } from '../../../../scenery/js/imports.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionStrings from '../../VectorAdditionStrings.js';
import ComponentVectorStyles from '../model/ComponentVectorStyles.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import ComponentStyleRadioButtonGroup from './ComponentStyleRadioButtonGroup.js';
export default class ComponentStyleControl extends VBox {
  /**
   * @param {EnumerationProperty} componentStyleProperty - value of type ComponentVectorStyles
   * @param {Object} [options]
   */
  constructor(componentStyleProperty, options) {
    assert && assert(componentStyleProperty instanceof EnumerationProperty && ComponentVectorStyles.enumeration.includes(componentStyleProperty.value), `invalid componentStyleProperty: ${componentStyleProperty}`);
    options = merge({
      align: 'left',
      spacing: VectorAdditionConstants.GRAPH_CONTROL_PANEL_Y_SPACING,
      maxWidth: 200
    }, options);
    const children = [];

    // 'Components' label, left justified
    const componentsText = new Text(VectorAdditionStrings.components, {
      font: VectorAdditionConstants.TITLE_FONT,
      maxWidth: options.maxWidth
    });
    children.push(componentsText);

    // Radio buttons, centered in maxWidth by using an AlignBox
    const componentStyleRadioButtonGroup = new ComponentStyleRadioButtonGroup(componentStyleProperty);
    children.push(new AlignBox(componentStyleRadioButtonGroup, {
      alignBounds: new Bounds2(0, 0, options.maxWidth, componentStyleRadioButtonGroup.height)
    }));
    assert && assert(!options.children, 'ComponentStyleControl sets children');
    options.children = children;
    super(options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'ComponentStyleControl is not intended to be disposed');
  }
}
vectorAddition.register('ComponentStyleControl', ComponentStyleControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiQm91bmRzMiIsIm1lcmdlIiwiQWxpZ25Cb3giLCJUZXh0IiwiVkJveCIsInZlY3RvckFkZGl0aW9uIiwiVmVjdG9yQWRkaXRpb25TdHJpbmdzIiwiQ29tcG9uZW50VmVjdG9yU3R5bGVzIiwiVmVjdG9yQWRkaXRpb25Db25zdGFudHMiLCJDb21wb25lbnRTdHlsZVJhZGlvQnV0dG9uR3JvdXAiLCJDb21wb25lbnRTdHlsZUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsImNvbXBvbmVudFN0eWxlUHJvcGVydHkiLCJvcHRpb25zIiwiYXNzZXJ0IiwiZW51bWVyYXRpb24iLCJpbmNsdWRlcyIsInZhbHVlIiwiYWxpZ24iLCJzcGFjaW5nIiwiR1JBUEhfQ09OVFJPTF9QQU5FTF9ZX1NQQUNJTkciLCJtYXhXaWR0aCIsImNoaWxkcmVuIiwiY29tcG9uZW50c1RleHQiLCJjb21wb25lbnRzIiwiZm9udCIsIlRJVExFX0ZPTlQiLCJwdXNoIiwiY29tcG9uZW50U3R5bGVSYWRpb0J1dHRvbkdyb3VwIiwiYWxpZ25Cb3VuZHMiLCJoZWlnaHQiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb21wb25lbnRTdHlsZUNvbnRyb2wuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tcG9uZW50U3R5bGVDb250cm9sIGlzIHRoZSBjb250cm9sIGZvciBzZWxlY3RpbmcgaG93IHRvIHZpc3VhbGx5IHJlcHJlc2VudCBjb21wb25lbnQgdmVjdG9ycy5cclxuICogSXQgY29uc2lzdHMgb2YgYSBsYWJlbGVkIGdyb3VwIG9mIHJhZGlvIGJ1dHRvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEFsaWduQm94LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHZlY3RvckFkZGl0aW9uIGZyb20gJy4uLy4uL3ZlY3RvckFkZGl0aW9uLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uU3RyaW5ncyBmcm9tICcuLi8uLi9WZWN0b3JBZGRpdGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ29tcG9uZW50VmVjdG9yU3R5bGVzIGZyb20gJy4uL21vZGVsL0NvbXBvbmVudFZlY3RvclN0eWxlcy5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cyBmcm9tICcuLi9WZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDb21wb25lbnRTdHlsZVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi9Db21wb25lbnRTdHlsZVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcG9uZW50U3R5bGVDb250cm9sIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eX0gY29tcG9uZW50U3R5bGVQcm9wZXJ0eSAtIHZhbHVlIG9mIHR5cGUgQ29tcG9uZW50VmVjdG9yU3R5bGVzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb21wb25lbnRTdHlsZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbXBvbmVudFN0eWxlUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5ICYmIENvbXBvbmVudFZlY3RvclN0eWxlcy5lbnVtZXJhdGlvbi5pbmNsdWRlcyggY29tcG9uZW50U3R5bGVQcm9wZXJ0eS52YWx1ZSApLFxyXG4gICAgICBgaW52YWxpZCBjb21wb25lbnRTdHlsZVByb3BlcnR5OiAke2NvbXBvbmVudFN0eWxlUHJvcGVydHl9YCApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5HUkFQSF9DT05UUk9MX1BBTkVMX1lfU1BBQ0lORyxcclxuICAgICAgbWF4V2lkdGg6IDIwMFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuID0gW107XHJcblxyXG4gICAgLy8gJ0NvbXBvbmVudHMnIGxhYmVsLCBsZWZ0IGp1c3RpZmllZFxyXG4gICAgY29uc3QgY29tcG9uZW50c1RleHQgPSBuZXcgVGV4dCggVmVjdG9yQWRkaXRpb25TdHJpbmdzLmNvbXBvbmVudHMsIHtcclxuICAgICAgZm9udDogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMubWF4V2lkdGhcclxuICAgIH0gKTtcclxuICAgIGNoaWxkcmVuLnB1c2goIGNvbXBvbmVudHNUZXh0ICk7XHJcblxyXG4gICAgLy8gUmFkaW8gYnV0dG9ucywgY2VudGVyZWQgaW4gbWF4V2lkdGggYnkgdXNpbmcgYW4gQWxpZ25Cb3hcclxuICAgIGNvbnN0IGNvbXBvbmVudFN0eWxlUmFkaW9CdXR0b25Hcm91cCA9IG5ldyBDb21wb25lbnRTdHlsZVJhZGlvQnV0dG9uR3JvdXAoIGNvbXBvbmVudFN0eWxlUHJvcGVydHkgKTtcclxuICAgIGNoaWxkcmVuLnB1c2goIG5ldyBBbGlnbkJveCggY29tcG9uZW50U3R5bGVSYWRpb0J1dHRvbkdyb3VwLCB7XHJcbiAgICAgIGFsaWduQm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgb3B0aW9ucy5tYXhXaWR0aCwgY29tcG9uZW50U3R5bGVSYWRpb0J1dHRvbkdyb3VwLmhlaWdodCApXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ0NvbXBvbmVudFN0eWxlQ29udHJvbCBzZXRzIGNoaWxkcmVuJyApO1xyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnQ29tcG9uZW50U3R5bGVDb250cm9sIGlzIG5vdCBpbnRlbmRlZCB0byBiZSBkaXNwb3NlZCcgKTtcclxuICB9XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnQ29tcG9uZW50U3R5bGVDb250cm9sJywgQ29tcG9uZW50U3R5bGVDb250cm9sICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxtQkFBbUIsTUFBTSw0Q0FBNEM7QUFDNUUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hFLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLHFCQUFxQixNQUFNLG1DQUFtQztBQUNyRSxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0MsOEJBQThCLE1BQU0scUNBQXFDO0FBRWhGLGVBQWUsTUFBTUMscUJBQXFCLFNBQVNOLElBQUksQ0FBQztFQUV0RDtBQUNGO0FBQ0E7QUFDQTtFQUNFTyxXQUFXQSxDQUFFQyxzQkFBc0IsRUFBRUMsT0FBTyxFQUFHO0lBRTdDQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsc0JBQXNCLFlBQVliLG1CQUFtQixJQUFJUSxxQkFBcUIsQ0FBQ1EsV0FBVyxDQUFDQyxRQUFRLENBQUVKLHNCQUFzQixDQUFDSyxLQUFNLENBQUMsRUFDbEosbUNBQWtDTCxzQkFBdUIsRUFBRSxDQUFDO0lBRS9EQyxPQUFPLEdBQUdaLEtBQUssQ0FBRTtNQUNmaUIsS0FBSyxFQUFFLE1BQU07TUFDYkMsT0FBTyxFQUFFWCx1QkFBdUIsQ0FBQ1ksNkJBQTZCO01BQzlEQyxRQUFRLEVBQUU7SUFDWixDQUFDLEVBQUVSLE9BQVEsQ0FBQztJQUVaLE1BQU1TLFFBQVEsR0FBRyxFQUFFOztJQUVuQjtJQUNBLE1BQU1DLGNBQWMsR0FBRyxJQUFJcEIsSUFBSSxDQUFFRyxxQkFBcUIsQ0FBQ2tCLFVBQVUsRUFBRTtNQUNqRUMsSUFBSSxFQUFFakIsdUJBQXVCLENBQUNrQixVQUFVO01BQ3hDTCxRQUFRLEVBQUVSLE9BQU8sQ0FBQ1E7SUFDcEIsQ0FBRSxDQUFDO0lBQ0hDLFFBQVEsQ0FBQ0ssSUFBSSxDQUFFSixjQUFlLENBQUM7O0lBRS9CO0lBQ0EsTUFBTUssOEJBQThCLEdBQUcsSUFBSW5CLDhCQUE4QixDQUFFRyxzQkFBdUIsQ0FBQztJQUNuR1UsUUFBUSxDQUFDSyxJQUFJLENBQUUsSUFBSXpCLFFBQVEsQ0FBRTBCLDhCQUE4QixFQUFFO01BQzNEQyxXQUFXLEVBQUUsSUFBSTdCLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFYSxPQUFPLENBQUNRLFFBQVEsRUFBRU8sOEJBQThCLENBQUNFLE1BQU87SUFDMUYsQ0FBRSxDQUFFLENBQUM7SUFFTGhCLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNELE9BQU8sQ0FBQ1MsUUFBUSxFQUFFLHFDQUFzQyxDQUFDO0lBQzVFVCxPQUFPLENBQUNTLFFBQVEsR0FBR0EsUUFBUTtJQUUzQixLQUFLLENBQUVULE9BQVEsQ0FBQztFQUNsQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFa0IsT0FBT0EsQ0FBQSxFQUFHO0lBQ1JqQixNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsc0RBQXVELENBQUM7RUFDbkY7QUFDRjtBQUVBVCxjQUFjLENBQUMyQixRQUFRLENBQUUsdUJBQXVCLEVBQUV0QixxQkFBc0IsQ0FBQyJ9