// Copyright 2016-2022, University of Colorado Boulder

/**
 * The node for the Billiards Scene, including two tables and spinners for each.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { HBox } from '../../../../../scenery/js/imports.js';
import proportionPlayground from '../../../proportionPlayground.js';
import Side from '../../model/Side.js';
import SceneNode from '../SceneNode.js';
import BilliardsTableControl from './BilliardsTableControl.js';
import BilliardTableIcon from './BilliardTableIcon.js';

// constants
const ICON_SCALE_OPTIONS = {
  scale: 0.3
};
class BilliardsSceneNode extends SceneNode {
  /**
   * @param {BilliardsScene} scene - the model
   * @param {Bounds2} layoutBounds - the region within which all visual components should be layed out
   * @param {Tandem} tandem
   */
  constructor(scene, layoutBounds, tandem) {
    const billiardsCenterY = layoutBounds.height * 0.45;

    // Create the left/right tables
    const leftBilliardsTableControl = new BilliardsTableControl(scene.leftTable, tandem.createTandem('leftBilliardsTableControl'), {
      centerY: billiardsCenterY,
      allowDragToResize: !scene.predictMode,
      side: Side.LEFT
    });
    const rightBilliardsTableControl = new BilliardsTableControl(scene.rightTable, tandem.createTandem('rightBilliardsTableControl'), {
      centerY: billiardsCenterY,
      allowDragToResize: !scene.predictMode,
      side: Side.RIGHT
    });
    const iconBilliardsSize = 120;
    super(scene, layoutBounds, {
      sceneIcon: new BilliardTableIcon(iconBilliardsSize, iconBilliardsSize, {
        scale: 0.3
      }),
      leftControl: leftBilliardsTableControl,
      rightControl: rightBilliardsTableControl,
      leftSwitchIcon: new BilliardTableIcon(iconBilliardsSize, iconBilliardsSize, ICON_SCALE_OPTIONS),
      rightSwitchIcon: new HBox({
        spacing: 10,
        children: [new BilliardTableIcon(iconBilliardsSize, iconBilliardsSize, ICON_SCALE_OPTIONS), new BilliardTableIcon(iconBilliardsSize, iconBilliardsSize, ICON_SCALE_OPTIONS)]
      }),
      controlAlign: 'bottom',
      tandem: tandem
    });

    // When the ABSwitch is toggled, show/hide the rightmost table and update the layout.
    scene.showBothProperty.link(showBoth => {
      if (showBoth) {
        leftBilliardsTableControl.left = 20;
        rightBilliardsTableControl.right = layoutBounds.right - 20;
      } else {
        leftBilliardsTableControl.setBilliardsCenter(layoutBounds.centerX);
      }
      this.updateControlButton();
    });
  }
}
proportionPlayground.register('BilliardsSceneNode', BilliardsSceneNode);
export default BilliardsSceneNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIQm94IiwicHJvcG9ydGlvblBsYXlncm91bmQiLCJTaWRlIiwiU2NlbmVOb2RlIiwiQmlsbGlhcmRzVGFibGVDb250cm9sIiwiQmlsbGlhcmRUYWJsZUljb24iLCJJQ09OX1NDQUxFX09QVElPTlMiLCJzY2FsZSIsIkJpbGxpYXJkc1NjZW5lTm9kZSIsImNvbnN0cnVjdG9yIiwic2NlbmUiLCJsYXlvdXRCb3VuZHMiLCJ0YW5kZW0iLCJiaWxsaWFyZHNDZW50ZXJZIiwiaGVpZ2h0IiwibGVmdEJpbGxpYXJkc1RhYmxlQ29udHJvbCIsImxlZnRUYWJsZSIsImNyZWF0ZVRhbmRlbSIsImNlbnRlclkiLCJhbGxvd0RyYWdUb1Jlc2l6ZSIsInByZWRpY3RNb2RlIiwic2lkZSIsIkxFRlQiLCJyaWdodEJpbGxpYXJkc1RhYmxlQ29udHJvbCIsInJpZ2h0VGFibGUiLCJSSUdIVCIsImljb25CaWxsaWFyZHNTaXplIiwic2NlbmVJY29uIiwibGVmdENvbnRyb2wiLCJyaWdodENvbnRyb2wiLCJsZWZ0U3dpdGNoSWNvbiIsInJpZ2h0U3dpdGNoSWNvbiIsInNwYWNpbmciLCJjaGlsZHJlbiIsImNvbnRyb2xBbGlnbiIsInNob3dCb3RoUHJvcGVydHkiLCJsaW5rIiwic2hvd0JvdGgiLCJsZWZ0IiwicmlnaHQiLCJzZXRCaWxsaWFyZHNDZW50ZXIiLCJjZW50ZXJYIiwidXBkYXRlQ29udHJvbEJ1dHRvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmlsbGlhcmRzU2NlbmVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBub2RlIGZvciB0aGUgQmlsbGlhcmRzIFNjZW5lLCBpbmNsdWRpbmcgdHdvIHRhYmxlcyBhbmQgc3Bpbm5lcnMgZm9yIGVhY2guXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgSEJveCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBwcm9wb3J0aW9uUGxheWdyb3VuZCBmcm9tICcuLi8uLi8uLi9wcm9wb3J0aW9uUGxheWdyb3VuZC5qcyc7XHJcbmltcG9ydCBTaWRlIGZyb20gJy4uLy4uL21vZGVsL1NpZGUuanMnO1xyXG5pbXBvcnQgU2NlbmVOb2RlIGZyb20gJy4uL1NjZW5lTm9kZS5qcyc7XHJcbmltcG9ydCBCaWxsaWFyZHNUYWJsZUNvbnRyb2wgZnJvbSAnLi9CaWxsaWFyZHNUYWJsZUNvbnRyb2wuanMnO1xyXG5pbXBvcnQgQmlsbGlhcmRUYWJsZUljb24gZnJvbSAnLi9CaWxsaWFyZFRhYmxlSWNvbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSUNPTl9TQ0FMRV9PUFRJT05TID0geyBzY2FsZTogMC4zIH07XHJcblxyXG5jbGFzcyBCaWxsaWFyZHNTY2VuZU5vZGUgZXh0ZW5kcyBTY2VuZU5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QmlsbGlhcmRzU2NlbmV9IHNjZW5lIC0gdGhlIG1vZGVsXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBsYXlvdXRCb3VuZHMgLSB0aGUgcmVnaW9uIHdpdGhpbiB3aGljaCBhbGwgdmlzdWFsIGNvbXBvbmVudHMgc2hvdWxkIGJlIGxheWVkIG91dFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2NlbmUsIGxheW91dEJvdW5kcywgdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IGJpbGxpYXJkc0NlbnRlclkgPSBsYXlvdXRCb3VuZHMuaGVpZ2h0ICogMC40NTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGxlZnQvcmlnaHQgdGFibGVzXHJcbiAgICBjb25zdCBsZWZ0QmlsbGlhcmRzVGFibGVDb250cm9sID0gbmV3IEJpbGxpYXJkc1RhYmxlQ29udHJvbCggc2NlbmUubGVmdFRhYmxlLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVmdEJpbGxpYXJkc1RhYmxlQ29udHJvbCcgKSwge1xyXG4gICAgICBjZW50ZXJZOiBiaWxsaWFyZHNDZW50ZXJZLFxyXG4gICAgICBhbGxvd0RyYWdUb1Jlc2l6ZTogIXNjZW5lLnByZWRpY3RNb2RlLFxyXG4gICAgICBzaWRlOiBTaWRlLkxFRlRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHJpZ2h0QmlsbGlhcmRzVGFibGVDb250cm9sID0gbmV3IEJpbGxpYXJkc1RhYmxlQ29udHJvbCggc2NlbmUucmlnaHRUYWJsZSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JpZ2h0QmlsbGlhcmRzVGFibGVDb250cm9sJyApLCB7XHJcbiAgICAgIGNlbnRlclk6IGJpbGxpYXJkc0NlbnRlclksXHJcbiAgICAgIGFsbG93RHJhZ1RvUmVzaXplOiAhc2NlbmUucHJlZGljdE1vZGUsXHJcbiAgICAgIHNpZGU6IFNpZGUuUklHSFRcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBpY29uQmlsbGlhcmRzU2l6ZSA9IDEyMDtcclxuICAgIHN1cGVyKCBzY2VuZSwgbGF5b3V0Qm91bmRzLCB7XHJcbiAgICAgIHNjZW5lSWNvbjogbmV3IEJpbGxpYXJkVGFibGVJY29uKCBpY29uQmlsbGlhcmRzU2l6ZSwgaWNvbkJpbGxpYXJkc1NpemUsIHsgc2NhbGU6IDAuMyB9ICksXHJcbiAgICAgIGxlZnRDb250cm9sOiBsZWZ0QmlsbGlhcmRzVGFibGVDb250cm9sLFxyXG4gICAgICByaWdodENvbnRyb2w6IHJpZ2h0QmlsbGlhcmRzVGFibGVDb250cm9sLFxyXG4gICAgICBsZWZ0U3dpdGNoSWNvbjogbmV3IEJpbGxpYXJkVGFibGVJY29uKCBpY29uQmlsbGlhcmRzU2l6ZSwgaWNvbkJpbGxpYXJkc1NpemUsIElDT05fU0NBTEVfT1BUSU9OUyApLFxyXG4gICAgICByaWdodFN3aXRjaEljb246IG5ldyBIQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBCaWxsaWFyZFRhYmxlSWNvbiggaWNvbkJpbGxpYXJkc1NpemUsIGljb25CaWxsaWFyZHNTaXplLCBJQ09OX1NDQUxFX09QVElPTlMgKSxcclxuICAgICAgICAgIG5ldyBCaWxsaWFyZFRhYmxlSWNvbiggaWNvbkJpbGxpYXJkc1NpemUsIGljb25CaWxsaWFyZHNTaXplLCBJQ09OX1NDQUxFX09QVElPTlMgKSBdXHJcbiAgICAgIH0gKSxcclxuICAgICAgY29udHJvbEFsaWduOiAnYm90dG9tJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBBQlN3aXRjaCBpcyB0b2dnbGVkLCBzaG93L2hpZGUgdGhlIHJpZ2h0bW9zdCB0YWJsZSBhbmQgdXBkYXRlIHRoZSBsYXlvdXQuXHJcbiAgICBzY2VuZS5zaG93Qm90aFByb3BlcnR5LmxpbmsoIHNob3dCb3RoID0+IHtcclxuICAgICAgaWYgKCBzaG93Qm90aCApIHtcclxuICAgICAgICBsZWZ0QmlsbGlhcmRzVGFibGVDb250cm9sLmxlZnQgPSAyMDtcclxuICAgICAgICByaWdodEJpbGxpYXJkc1RhYmxlQ29udHJvbC5yaWdodCA9IGxheW91dEJvdW5kcy5yaWdodCAtIDIwO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGxlZnRCaWxsaWFyZHNUYWJsZUNvbnRyb2wuc2V0QmlsbGlhcmRzQ2VudGVyKCBsYXlvdXRCb3VuZHMuY2VudGVyWCApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMudXBkYXRlQ29udHJvbEJ1dHRvbigpO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxucHJvcG9ydGlvblBsYXlncm91bmQucmVnaXN0ZXIoICdCaWxsaWFyZHNTY2VuZU5vZGUnLCBCaWxsaWFyZHNTY2VuZU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZh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