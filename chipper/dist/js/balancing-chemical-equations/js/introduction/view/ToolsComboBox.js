// Copyright 2014-2023, University of Colorado Boulder

/**
 * 'Tools' combo box, for selecting the visual representation for "balanced".
 *
 * @author Vasily Shakhov (MLearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Text } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import charts_png from '../../../images/charts_png.js';
import scales_png from '../../../mipmaps/scales_png.js';
import balancingChemicalEquations from '../../balancingChemicalEquations.js';
import BalancingChemicalEquationsStrings from '../../BalancingChemicalEquationsStrings.js';
import BalancedRepresentation from '../../common/model/BalancedRepresentation.js';

// constants
const FONT = new PhetFont(22);
export default class ToolsComboBox extends ComboBox {
  constructor(balanceRepresentationProperty, listboxParent) {
    const items = [{
      value: BalancedRepresentation.NONE,
      createNode: () => new Text(BalancingChemicalEquationsStrings.noneStringProperty, {
        font: FONT,
        maxWidth: 100
      })
    }, {
      value: BalancedRepresentation.BALANCE_SCALES,
      createNode: () => new Image(scales_png, {
        scale: 0.1875
      })
    }, {
      value: BalancedRepresentation.BAR_CHARTS,
      createNode: () => new Image(charts_png, {
        scale: 0.375
      })
    }];
    super(balanceRepresentationProperty, items, listboxParent, {
      xMargin: 10,
      yMargin: 5,
      cornerRadius: 4,
      maxWidth: 600
    });
  }
}
balancingChemicalEquations.register('ToolsComboBox', ToolsComboBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIkltYWdlIiwiVGV4dCIsIkNvbWJvQm94IiwiY2hhcnRzX3BuZyIsInNjYWxlc19wbmciLCJiYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucyIsIkJhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zU3RyaW5ncyIsIkJhbGFuY2VkUmVwcmVzZW50YXRpb24iLCJGT05UIiwiVG9vbHNDb21ib0JveCIsImNvbnN0cnVjdG9yIiwiYmFsYW5jZVJlcHJlc2VudGF0aW9uUHJvcGVydHkiLCJsaXN0Ym94UGFyZW50IiwiaXRlbXMiLCJ2YWx1ZSIsIk5PTkUiLCJjcmVhdGVOb2RlIiwibm9uZVN0cmluZ1Byb3BlcnR5IiwiZm9udCIsIm1heFdpZHRoIiwiQkFMQU5DRV9TQ0FMRVMiLCJzY2FsZSIsIkJBUl9DSEFSVFMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImNvcm5lclJhZGl1cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVG9vbHNDb21ib0JveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiAnVG9vbHMnIGNvbWJvIGJveCwgZm9yIHNlbGVjdGluZyB0aGUgdmlzdWFsIHJlcHJlc2VudGF0aW9uIGZvciBcImJhbGFuY2VkXCIuXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1MZWFybmVyKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSwgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDb21ib0JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgY2hhcnRzX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY2hhcnRzX3BuZy5qcyc7XHJcbmltcG9ydCBzY2FsZXNfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvc2NhbGVzX3BuZy5qcyc7XHJcbmltcG9ydCBiYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucyBmcm9tICcuLi8uLi9iYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucy5qcyc7XHJcbmltcG9ydCBCYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9uc1N0cmluZ3MgZnJvbSAnLi4vLi4vQmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJhbGFuY2VkUmVwcmVzZW50YXRpb24gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0JhbGFuY2VkUmVwcmVzZW50YXRpb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZPTlQgPSBuZXcgUGhldEZvbnQoIDIyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb29sc0NvbWJvQm94IGV4dGVuZHMgQ29tYm9Cb3g8QmFsYW5jZWRSZXByZXNlbnRhdGlvbj4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJhbGFuY2VSZXByZXNlbnRhdGlvblByb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PEJhbGFuY2VkUmVwcmVzZW50YXRpb24+LCBsaXN0Ym94UGFyZW50OiBOb2RlICkge1xyXG5cclxuICAgIGNvbnN0IGl0ZW1zID0gW1xyXG4gICAgICB7IHZhbHVlOiBCYWxhbmNlZFJlcHJlc2VudGF0aW9uLk5PTkUsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBCYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9uc1N0cmluZ3Mubm9uZVN0cmluZ1Byb3BlcnR5LCB7IGZvbnQ6IEZPTlQsIG1heFdpZHRoOiAxMDAgfSApIH0sXHJcbiAgICAgIHsgdmFsdWU6IEJhbGFuY2VkUmVwcmVzZW50YXRpb24uQkFMQU5DRV9TQ0FMRVMsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBJbWFnZSggc2NhbGVzX3BuZywgeyBzY2FsZTogMC4xODc1IH0gKSB9LFxyXG4gICAgICB7IHZhbHVlOiBCYWxhbmNlZFJlcHJlc2VudGF0aW9uLkJBUl9DSEFSVFMsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBJbWFnZSggY2hhcnRzX3BuZywgeyBzY2FsZTogMC4zNzUgfSApIH1cclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIGJhbGFuY2VSZXByZXNlbnRhdGlvblByb3BlcnR5LCBpdGVtcywgbGlzdGJveFBhcmVudCwge1xyXG4gICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgeU1hcmdpbjogNSxcclxuICAgICAgY29ybmVyUmFkaXVzOiA0LFxyXG4gICAgICBtYXhXaWR0aDogNjAwXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5iYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucy5yZWdpc3RlciggJ1Rvb2xzQ29tYm9Cb3gnLCBUb29sc0NvbWJvQm94ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxLQUFLLEVBQVFDLElBQUksUUFBUSxtQ0FBbUM7QUFDckUsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQyxVQUFVLE1BQU0sK0JBQStCO0FBQ3RELE9BQU9DLFVBQVUsTUFBTSxnQ0FBZ0M7QUFDdkQsT0FBT0MsMEJBQTBCLE1BQU0scUNBQXFDO0FBQzVFLE9BQU9DLGlDQUFpQyxNQUFNLDRDQUE0QztBQUMxRixPQUFPQyxzQkFBc0IsTUFBTSw4Q0FBOEM7O0FBRWpGO0FBQ0EsTUFBTUMsSUFBSSxHQUFHLElBQUlULFFBQVEsQ0FBRSxFQUFHLENBQUM7QUFFL0IsZUFBZSxNQUFNVSxhQUFhLFNBQVNQLFFBQVEsQ0FBeUI7RUFFbkVRLFdBQVdBLENBQUVDLDZCQUEwRSxFQUFFQyxhQUFtQixFQUFHO0lBRXBILE1BQU1DLEtBQUssR0FBRyxDQUNaO01BQUVDLEtBQUssRUFBRVAsc0JBQXNCLENBQUNRLElBQUk7TUFBRUMsVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSWYsSUFBSSxDQUFFSyxpQ0FBaUMsQ0FBQ1csa0JBQWtCLEVBQUU7UUFBRUMsSUFBSSxFQUFFVixJQUFJO1FBQUVXLFFBQVEsRUFBRTtNQUFJLENBQUU7SUFBRSxDQUFDLEVBQ3pKO01BQUVMLEtBQUssRUFBRVAsc0JBQXNCLENBQUNhLGNBQWM7TUFBRUosVUFBVSxFQUFFQSxDQUFBLEtBQU0sSUFBSWhCLEtBQUssQ0FBRUksVUFBVSxFQUFFO1FBQUVpQixLQUFLLEVBQUU7TUFBTyxDQUFFO0lBQUUsQ0FBQyxFQUM5RztNQUFFUCxLQUFLLEVBQUVQLHNCQUFzQixDQUFDZSxVQUFVO01BQUVOLFVBQVUsRUFBRUEsQ0FBQSxLQUFNLElBQUloQixLQUFLLENBQUVHLFVBQVUsRUFBRTtRQUFFa0IsS0FBSyxFQUFFO01BQU0sQ0FBRTtJQUFFLENBQUMsQ0FDMUc7SUFFRCxLQUFLLENBQUVWLDZCQUE2QixFQUFFRSxLQUFLLEVBQUVELGFBQWEsRUFBRTtNQUMxRFcsT0FBTyxFQUFFLEVBQUU7TUFDWEMsT0FBTyxFQUFFLENBQUM7TUFDVkMsWUFBWSxFQUFFLENBQUM7TUFDZk4sUUFBUSxFQUFFO0lBQ1osQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBZCwwQkFBMEIsQ0FBQ3FCLFFBQVEsQ0FBRSxlQUFlLEVBQUVqQixhQUFjLENBQUMifQ==