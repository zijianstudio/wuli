// Copyright 2022, University of Colorado Boulder

/**
 * Demonstrates how to create custom help with KeyboardHelpSection.
 */

import KeyboardHelpIconFactory from '../../keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../keyboard/help/KeyboardHelpSection.js';
import TextKeyNode from '../../keyboard/TextKeyNode.js';
import KeyboardHelpSectionRow from '../../keyboard/help/KeyboardHelpSectionRow.js';
export default function demoKeyboardHelpSection(layoutBounds) {
  const labelWithIcon = KeyboardHelpSectionRow.labelWithIcon('Label With Icon:', new TextKeyNode('Hi'), {
    labelInnerContent: 'Label With Icon Hi'
  });
  const labelWithIconList = KeyboardHelpSectionRow.labelWithIconList('Label With Icon List:', [new TextKeyNode('Hi'), new TextKeyNode('Hello'), new TextKeyNode('Ahoy\' Manatee')], {
    labelInnerContent: 'Label with icon list of hi, hello, Ahoy Manatee.'
  });
  const labelWithArrowKeysRowIcon = KeyboardHelpSectionRow.labelWithIcon('Label with arrows:', KeyboardHelpIconFactory.arrowKeysRowIcon(), {
    labelInnerContent: 'Label with arrows, up, left, down, right'
  });
  const labelWithUpDownArrowKeysRowIcon = KeyboardHelpSectionRow.labelWithIcon('Label with up down arrows:', KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
    labelInnerContent: 'Label with up down arrows'
  });
  const labelWithLeftRightArrowKeysRowIcon = KeyboardHelpSectionRow.labelWithIcon('Label with left right arrows:', KeyboardHelpIconFactory.leftRightArrowKeysRowIcon(), {
    labelInnerContent: 'Label with left right arrows'
  });
  const content = [labelWithIcon, labelWithIconList, labelWithArrowKeysRowIcon, labelWithUpDownArrowKeysRowIcon, labelWithLeftRightArrowKeysRowIcon];
  return new KeyboardHelpSection('Custom Help Content', content, {
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlib2FyZEhlbHBJY29uRmFjdG9yeSIsIktleWJvYXJkSGVscFNlY3Rpb24iLCJUZXh0S2V5Tm9kZSIsIktleWJvYXJkSGVscFNlY3Rpb25Sb3ciLCJkZW1vS2V5Ym9hcmRIZWxwU2VjdGlvbiIsImxheW91dEJvdW5kcyIsImxhYmVsV2l0aEljb24iLCJsYWJlbElubmVyQ29udGVudCIsImxhYmVsV2l0aEljb25MaXN0IiwibGFiZWxXaXRoQXJyb3dLZXlzUm93SWNvbiIsImFycm93S2V5c1Jvd0ljb24iLCJsYWJlbFdpdGhVcERvd25BcnJvd0tleXNSb3dJY29uIiwidXBEb3duQXJyb3dLZXlzUm93SWNvbiIsImxhYmVsV2l0aExlZnRSaWdodEFycm93S2V5c1Jvd0ljb24iLCJsZWZ0UmlnaHRBcnJvd0tleXNSb3dJY29uIiwiY29udGVudCIsImNlbnRlciJdLCJzb3VyY2VzIjpbImRlbW9LZXlib2FyZEhlbHBTZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vbnN0cmF0ZXMgaG93IHRvIGNyZWF0ZSBjdXN0b20gaGVscCB3aXRoIEtleWJvYXJkSGVscFNlY3Rpb24uXHJcbiAqL1xyXG5cclxuaW1wb3J0IEtleWJvYXJkSGVscEljb25GYWN0b3J5IGZyb20gJy4uLy4uL2tleWJvYXJkL2hlbHAvS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuLi8uLi9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xyXG5pbXBvcnQgVGV4dEtleU5vZGUgZnJvbSAnLi4vLi4va2V5Ym9hcmQvVGV4dEtleU5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgS2V5Ym9hcmRIZWxwU2VjdGlvblJvdyBmcm9tICcuLi8uLi9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscFNlY3Rpb25Sb3cuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0tleWJvYXJkSGVscFNlY3Rpb24oIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcclxuXHJcbiAgY29uc3QgbGFiZWxXaXRoSWNvbiA9IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cubGFiZWxXaXRoSWNvbiggJ0xhYmVsIFdpdGggSWNvbjonLCBuZXcgVGV4dEtleU5vZGUoICdIaScgKSwge1xyXG4gICAgbGFiZWxJbm5lckNvbnRlbnQ6ICdMYWJlbCBXaXRoIEljb24gSGknXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBsYWJlbFdpdGhJY29uTGlzdCA9IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cubGFiZWxXaXRoSWNvbkxpc3QoICdMYWJlbCBXaXRoIEljb24gTGlzdDonLCBbXHJcbiAgICBuZXcgVGV4dEtleU5vZGUoICdIaScgKSxcclxuICAgIG5ldyBUZXh0S2V5Tm9kZSggJ0hlbGxvJyApLFxyXG4gICAgbmV3IFRleHRLZXlOb2RlKCAnQWhveVxcJyBNYW5hdGVlJyApXHJcbiAgXSwge1xyXG4gICAgbGFiZWxJbm5lckNvbnRlbnQ6ICdMYWJlbCB3aXRoIGljb24gbGlzdCBvZiBoaSwgaGVsbG8sIEFob3kgTWFuYXRlZS4nXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBsYWJlbFdpdGhBcnJvd0tleXNSb3dJY29uID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uKCAnTGFiZWwgd2l0aCBhcnJvd3M6JyxcclxuICAgIEtleWJvYXJkSGVscEljb25GYWN0b3J5LmFycm93S2V5c1Jvd0ljb24oKSwge1xyXG4gICAgICBsYWJlbElubmVyQ29udGVudDogJ0xhYmVsIHdpdGggYXJyb3dzLCB1cCwgbGVmdCwgZG93biwgcmlnaHQnXHJcbiAgICB9ICk7XHJcblxyXG4gIGNvbnN0IGxhYmVsV2l0aFVwRG93bkFycm93S2V5c1Jvd0ljb24gPSBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb24oICdMYWJlbCB3aXRoIHVwIGRvd24gYXJyb3dzOicsXHJcbiAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS51cERvd25BcnJvd0tleXNSb3dJY29uKCksIHtcclxuICAgICAgbGFiZWxJbm5lckNvbnRlbnQ6ICdMYWJlbCB3aXRoIHVwIGRvd24gYXJyb3dzJ1xyXG4gICAgfSApO1xyXG5cclxuICBjb25zdCBsYWJlbFdpdGhMZWZ0UmlnaHRBcnJvd0tleXNSb3dJY29uID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uKCAnTGFiZWwgd2l0aCBsZWZ0IHJpZ2h0IGFycm93czonLFxyXG4gICAgS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkubGVmdFJpZ2h0QXJyb3dLZXlzUm93SWNvbigpLCB7XHJcbiAgICAgIGxhYmVsSW5uZXJDb250ZW50OiAnTGFiZWwgd2l0aCBsZWZ0IHJpZ2h0IGFycm93cydcclxuICAgIH0gKTtcclxuXHJcbiAgY29uc3QgY29udGVudCA9IFtcclxuICAgIGxhYmVsV2l0aEljb24sXHJcbiAgICBsYWJlbFdpdGhJY29uTGlzdCxcclxuICAgIGxhYmVsV2l0aEFycm93S2V5c1Jvd0ljb24sXHJcbiAgICBsYWJlbFdpdGhVcERvd25BcnJvd0tleXNSb3dJY29uLFxyXG4gICAgbGFiZWxXaXRoTGVmdFJpZ2h0QXJyb3dLZXlzUm93SWNvblxyXG4gIF07XHJcblxyXG4gIHJldHVybiBuZXcgS2V5Ym9hcmRIZWxwU2VjdGlvbiggJ0N1c3RvbSBIZWxwIENvbnRlbnQnLCBjb250ZW50LCB7XHJcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcclxuICB9ICk7XHJcbn0iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSx1QkFBdUIsTUFBTSxnREFBZ0Q7QUFDcEYsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFHdkQsT0FBT0Msc0JBQXNCLE1BQU0sK0NBQStDO0FBRWxGLGVBQWUsU0FBU0MsdUJBQXVCQSxDQUFFQyxZQUFxQixFQUFTO0VBRTdFLE1BQU1DLGFBQWEsR0FBR0gsc0JBQXNCLENBQUNHLGFBQWEsQ0FBRSxrQkFBa0IsRUFBRSxJQUFJSixXQUFXLENBQUUsSUFBSyxDQUFDLEVBQUU7SUFDdkdLLGlCQUFpQixFQUFFO0VBQ3JCLENBQUUsQ0FBQztFQUVILE1BQU1DLGlCQUFpQixHQUFHTCxzQkFBc0IsQ0FBQ0ssaUJBQWlCLENBQUUsdUJBQXVCLEVBQUUsQ0FDM0YsSUFBSU4sV0FBVyxDQUFFLElBQUssQ0FBQyxFQUN2QixJQUFJQSxXQUFXLENBQUUsT0FBUSxDQUFDLEVBQzFCLElBQUlBLFdBQVcsQ0FBRSxnQkFBaUIsQ0FBQyxDQUNwQyxFQUFFO0lBQ0RLLGlCQUFpQixFQUFFO0VBQ3JCLENBQUUsQ0FBQztFQUVILE1BQU1FLHlCQUF5QixHQUFHTixzQkFBc0IsQ0FBQ0csYUFBYSxDQUFFLG9CQUFvQixFQUMxRk4sdUJBQXVCLENBQUNVLGdCQUFnQixDQUFDLENBQUMsRUFBRTtJQUMxQ0gsaUJBQWlCLEVBQUU7RUFDckIsQ0FBRSxDQUFDO0VBRUwsTUFBTUksK0JBQStCLEdBQUdSLHNCQUFzQixDQUFDRyxhQUFhLENBQUUsNEJBQTRCLEVBQ3hHTix1QkFBdUIsQ0FBQ1ksc0JBQXNCLENBQUMsQ0FBQyxFQUFFO0lBQ2hETCxpQkFBaUIsRUFBRTtFQUNyQixDQUFFLENBQUM7RUFFTCxNQUFNTSxrQ0FBa0MsR0FBR1Ysc0JBQXNCLENBQUNHLGFBQWEsQ0FBRSwrQkFBK0IsRUFDOUdOLHVCQUF1QixDQUFDYyx5QkFBeUIsQ0FBQyxDQUFDLEVBQUU7SUFDbkRQLGlCQUFpQixFQUFFO0VBQ3JCLENBQUUsQ0FBQztFQUVMLE1BQU1RLE9BQU8sR0FBRyxDQUNkVCxhQUFhLEVBQ2JFLGlCQUFpQixFQUNqQkMseUJBQXlCLEVBQ3pCRSwrQkFBK0IsRUFDL0JFLGtDQUFrQyxDQUNuQztFQUVELE9BQU8sSUFBSVosbUJBQW1CLENBQUUscUJBQXFCLEVBQUVjLE9BQU8sRUFBRTtJQUM5REMsTUFBTSxFQUFFWCxZQUFZLENBQUNXO0VBQ3ZCLENBQUUsQ0FBQztBQUNMIn0=