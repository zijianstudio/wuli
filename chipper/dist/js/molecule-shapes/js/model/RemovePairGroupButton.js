// Copyright 2014-2022, University of Colorado Boulder

/**
 * A red button with an 'X' that, when clicked, will remove an atom (with a bond type) or a lone pair from the main molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import MoleculeShapesColors from '../common/view/MoleculeShapesColors.js';
import moleculeShapes from '../moleculeShapes.js';
const CROSS_SIZE = 10;
const crossNode = new Path(new Shape().moveTo(0, 0).lineTo(CROSS_SIZE, CROSS_SIZE).moveTo(0, CROSS_SIZE).lineTo(CROSS_SIZE, 0), {
  stroke: '#fff',
  lineWidth: 3
});
class RemovePairGroupButton extends RectangularPushButton {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    super(merge({
      content: new Node({
        children: [crossNode]
      }),
      xMargin: 5,
      yMargin: 5
    }, options));
    MoleculeShapesColors.removePairGroupProperty.link(color => {
      this.baseColor = color;
    });
  }
}
moleculeShapes.register('RemovePairGroupButton', RemovePairGroupButton);
export default RemovePairGroupButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJNb2xlY3VsZVNoYXBlc0NvbG9ycyIsIm1vbGVjdWxlU2hhcGVzIiwiQ1JPU1NfU0laRSIsImNyb3NzTm9kZSIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsImxpbmVXaWR0aCIsIlJlbW92ZVBhaXJHcm91cEJ1dHRvbiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImNvbnRlbnQiLCJjaGlsZHJlbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwicmVtb3ZlUGFpckdyb3VwUHJvcGVydHkiLCJsaW5rIiwiY29sb3IiLCJiYXNlQ29sb3IiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlbW92ZVBhaXJHcm91cEJ1dHRvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHJlZCBidXR0b24gd2l0aCBhbiAnWCcgdGhhdCwgd2hlbiBjbGlja2VkLCB3aWxsIHJlbW92ZSBhbiBhdG9tICh3aXRoIGEgYm9uZCB0eXBlKSBvciBhIGxvbmUgcGFpciBmcm9tIHRoZSBtYWluIG1vbGVjdWxlXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNDb2xvcnMgZnJvbSAnLi4vY29tbW9uL3ZpZXcvTW9sZWN1bGVTaGFwZXNDb2xvcnMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5cclxuY29uc3QgQ1JPU1NfU0laRSA9IDEwO1xyXG5jb25zdCBjcm9zc05vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAwICkubGluZVRvKCBDUk9TU19TSVpFLCBDUk9TU19TSVpFICkubW92ZVRvKCAwLCBDUk9TU19TSVpFICkubGluZVRvKCBDUk9TU19TSVpFLCAwICksIHtcclxuICBzdHJva2U6ICcjZmZmJyxcclxuICBsaW5lV2lkdGg6IDNcclxufSApO1xyXG5cclxuY2xhc3MgUmVtb3ZlUGFpckdyb3VwQnV0dG9uIGV4dGVuZHMgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG1lcmdlKCB7XHJcbiAgICAgIGNvbnRlbnQ6IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGNyb3NzTm9kZSBdIH0gKSxcclxuICAgICAgeE1hcmdpbjogNSxcclxuICAgICAgeU1hcmdpbjogNVxyXG4gICAgfSwgb3B0aW9ucyApICk7XHJcblxyXG4gICAgTW9sZWN1bGVTaGFwZXNDb2xvcnMucmVtb3ZlUGFpckdyb3VwUHJvcGVydHkubGluayggY29sb3IgPT4ge1xyXG4gICAgICB0aGlzLmJhc2VDb2xvciA9IGNvbG9yO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdSZW1vdmVQYWlyR3JvdXBCdXR0b24nLCBSZW1vdmVQYWlyR3JvdXBCdXR0b24gKTtcclxuZXhwb3J0IGRlZmF1bHQgUmVtb3ZlUGFpckdyb3VwQnV0dG9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsNkJBQTZCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQzNELE9BQU9DLHFCQUFxQixNQUFNLGtEQUFrRDtBQUNwRixPQUFPQyxvQkFBb0IsTUFBTSx3Q0FBd0M7QUFDekUsT0FBT0MsY0FBYyxNQUFNLHNCQUFzQjtBQUVqRCxNQUFNQyxVQUFVLEdBQUcsRUFBRTtBQUNyQixNQUFNQyxTQUFTLEdBQUcsSUFBSUwsSUFBSSxDQUFFLElBQUlILEtBQUssQ0FBQyxDQUFDLENBQUNTLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUNDLE1BQU0sQ0FBRUgsVUFBVSxFQUFFQSxVQUFXLENBQUMsQ0FBQ0UsTUFBTSxDQUFFLENBQUMsRUFBRUYsVUFBVyxDQUFDLENBQUNHLE1BQU0sQ0FBRUgsVUFBVSxFQUFFLENBQUUsQ0FBQyxFQUFFO0VBQ3ZJSSxNQUFNLEVBQUUsTUFBTTtFQUNkQyxTQUFTLEVBQUU7QUFDYixDQUFFLENBQUM7QUFFSCxNQUFNQyxxQkFBcUIsU0FBU1QscUJBQXFCLENBQUM7RUFDeEQ7QUFDRjtBQUNBO0VBQ0VVLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQixLQUFLLENBQUVkLEtBQUssQ0FBRTtNQUNaZSxPQUFPLEVBQUUsSUFBSWQsSUFBSSxDQUFFO1FBQUVlLFFBQVEsRUFBRSxDQUFFVCxTQUFTO01BQUcsQ0FBRSxDQUFDO01BQ2hEVSxPQUFPLEVBQUUsQ0FBQztNQUNWQyxPQUFPLEVBQUU7SUFDWCxDQUFDLEVBQUVKLE9BQVEsQ0FBRSxDQUFDO0lBRWRWLG9CQUFvQixDQUFDZSx1QkFBdUIsQ0FBQ0MsSUFBSSxDQUFFQyxLQUFLLElBQUk7TUFDMUQsSUFBSSxDQUFDQyxTQUFTLEdBQUdELEtBQUs7SUFDeEIsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBaEIsY0FBYyxDQUFDa0IsUUFBUSxDQUFFLHVCQUF1QixFQUFFWCxxQkFBc0IsQ0FBQztBQUN6RSxlQUFlQSxxQkFBcUIifQ==