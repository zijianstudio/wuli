// Copyright 2020-2022, University of Colorado Boulder

/**
 * Factory to create icons for home screens and the nav-bar.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Image, Rectangle } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../../common/BAMConstants.js';
import MoleculeList from '../../common/model/MoleculeList.js';
import Molecule3DNode from '../../common/view/view3d/Molecule3DNode.js';

// Options for screen icons
const SCREEN_ICON_OPTIONS = {
  maxIconWidthProportion: 1,
  maxIconHeightProportion: 1
};
const BAMIconFactory = {
  /**
   * Create an image for the complete molecule with preferred Image options.
   *
   * @param {CompleteMolecule} completeMolecule
   * @param {number} width
   * @param {number} height
   * @param {number} scale
   * @param {boolean} toCollectionBox
   * @returns {Image}
   */
  createIconImage(completeMolecule, width, height, scale, toCollectionBox) {
    const moleculeNode = new Molecule3DNode(completeMolecule, new Bounds2(0, 0, width, height), false);
    const transformMatrix = Molecule3DNode.initialTransforms[completeMolecule.getGeneralFormula()];
    if (transformMatrix) {
      moleculeNode.transformMolecule(transformMatrix);
    }
    moleculeNode.draw();
    return new Image(moleculeNode.canvas.toDataURL(), {
      initialWidth: toCollectionBox ? 0 : moleculeNode.canvas.width,
      initialHeight: toCollectionBox ? 0 : moleculeNode.canvas.height,
      scale: scale
    });
  },
  /**
   * Create the home screen and nav-bar icon for the Single screen.
   *
   * @public
   * @returns {ScreenIcon}
   */
  createSingleScreenIcon() {
    // Create icon from complete Molecule
    const moleculeIcon = BAMIconFactory.createIconImage(MoleculeList.H2O, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0.85, false);
    const wrapperNode = new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
      fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR,
      children: [moleculeIcon]
    });

    // Adjust the position of the molecule icon.
    moleculeIcon.center = wrapperNode.center.plusXY(0, 20);

    // Return the icon in its wrapper
    return new ScreenIcon(wrapperNode, SCREEN_ICON_OPTIONS);
  },
  /**
   * Create the home screen and nav-bar icon for the Multiple
   *
   * @public
   * @returns {ScreenIcon}
   */
  createMultipleScreenIcon() {
    // Iconize first O2 Molecule
    const moleculeIconOne = BAMIconFactory.createIconImage(MoleculeList.O2, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0.50, false);

    // Iconize second O2 Molecule
    const moleculeIconTwo = BAMIconFactory.createIconImage(MoleculeList.O2, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0.50, false);

    // Wrapper node to house molecule icons
    const wrapperNode = new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
      fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR,
      children: [moleculeIconOne, moleculeIconTwo]
    });

    // Adjust the position of the molecule icons.
    moleculeIconOne.center = wrapperNode.center.minusXY(125, 0);
    moleculeIconTwo.center = wrapperNode.center.plusXY(115, 0);
    return new ScreenIcon(wrapperNode, SCREEN_ICON_OPTIONS);
  },
  /**
   * Create the home screen and nav-bar icon for the Playground screen.
   *
   * @public
   * @returns {ScreenIcon}
   */
  createPlaygroundScreenIcon() {
    // Iconize first O2 Molecule
    const moleculeIcon = BAMIconFactory.createIconImage(MoleculeList.C2H4O2, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0.95, false);
    const wrapperNode = new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, 0, 0, {
      fill: BAMConstants.PLAY_AREA_BACKGROUND_COLOR,
      children: [moleculeIcon]
    });
    moleculeIcon.center = wrapperNode.center.minusXY(0, 10);
    return new ScreenIcon(wrapperNode, SCREEN_ICON_OPTIONS);
  }
};
buildAMolecule.register('BAMIconFactory', BAMIconFactory);
export default BAMIconFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU2NyZWVuIiwiU2NyZWVuSWNvbiIsIkltYWdlIiwiUmVjdGFuZ2xlIiwiYnVpbGRBTW9sZWN1bGUiLCJCQU1Db25zdGFudHMiLCJNb2xlY3VsZUxpc3QiLCJNb2xlY3VsZTNETm9kZSIsIlNDUkVFTl9JQ09OX09QVElPTlMiLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJCQU1JY29uRmFjdG9yeSIsImNyZWF0ZUljb25JbWFnZSIsImNvbXBsZXRlTW9sZWN1bGUiLCJ3aWR0aCIsImhlaWdodCIsInNjYWxlIiwidG9Db2xsZWN0aW9uQm94IiwibW9sZWN1bGVOb2RlIiwidHJhbnNmb3JtTWF0cml4IiwiaW5pdGlhbFRyYW5zZm9ybXMiLCJnZXRHZW5lcmFsRm9ybXVsYSIsInRyYW5zZm9ybU1vbGVjdWxlIiwiZHJhdyIsImNhbnZhcyIsInRvRGF0YVVSTCIsImluaXRpYWxXaWR0aCIsImluaXRpYWxIZWlnaHQiLCJjcmVhdGVTaW5nbGVTY3JlZW5JY29uIiwibW9sZWN1bGVJY29uIiwiSDJPIiwiTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUiLCJ3cmFwcGVyTm9kZSIsImZpbGwiLCJQTEFZX0FSRUFfQkFDS0dST1VORF9DT0xPUiIsImNoaWxkcmVuIiwiY2VudGVyIiwicGx1c1hZIiwiY3JlYXRlTXVsdGlwbGVTY3JlZW5JY29uIiwibW9sZWN1bGVJY29uT25lIiwiTzIiLCJtb2xlY3VsZUljb25Ud28iLCJtaW51c1hZIiwiY3JlYXRlUGxheWdyb3VuZFNjcmVlbkljb24iLCJDMkg0TzIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJBTUljb25GYWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEZhY3RvcnkgdG8gY3JlYXRlIGljb25zIGZvciBob21lIHNjcmVlbnMgYW5kIHRoZSBuYXYtYmFyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYnVpbGRBTW9sZWN1bGUgZnJvbSAnLi4vLi4vYnVpbGRBTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgQkFNQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9CQU1Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVMaXN0IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Nb2xlY3VsZUxpc3QuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGUzRE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvdmlldzNkL01vbGVjdWxlM0ROb2RlLmpzJztcclxuXHJcbi8vIE9wdGlvbnMgZm9yIHNjcmVlbiBpY29uc1xyXG5jb25zdCBTQ1JFRU5fSUNPTl9PUFRJT05TID0ge1xyXG4gIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxufTtcclxuXHJcbmNvbnN0IEJBTUljb25GYWN0b3J5ID0ge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbiBpbWFnZSBmb3IgdGhlIGNvbXBsZXRlIG1vbGVjdWxlIHdpdGggcHJlZmVycmVkIEltYWdlIG9wdGlvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvbXBsZXRlTW9sZWN1bGV9IGNvbXBsZXRlTW9sZWN1bGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlXHJcbiAgICogQHBhcmFtIHtib29sZWFufSB0b0NvbGxlY3Rpb25Cb3hcclxuICAgKiBAcmV0dXJucyB7SW1hZ2V9XHJcbiAgICovXHJcbiAgY3JlYXRlSWNvbkltYWdlKCBjb21wbGV0ZU1vbGVjdWxlLCB3aWR0aCwgaGVpZ2h0LCBzY2FsZSwgdG9Db2xsZWN0aW9uQm94ICkge1xyXG4gICAgY29uc3QgbW9sZWN1bGVOb2RlID0gbmV3IE1vbGVjdWxlM0ROb2RlKCBjb21wbGV0ZU1vbGVjdWxlLCBuZXcgQm91bmRzMiggMCwgMCwgd2lkdGgsIGhlaWdodCApLCBmYWxzZSApO1xyXG4gICAgY29uc3QgdHJhbnNmb3JtTWF0cml4ID0gTW9sZWN1bGUzRE5vZGUuaW5pdGlhbFRyYW5zZm9ybXNbIGNvbXBsZXRlTW9sZWN1bGUuZ2V0R2VuZXJhbEZvcm11bGEoKSBdO1xyXG4gICAgaWYgKCB0cmFuc2Zvcm1NYXRyaXggKSB7XHJcbiAgICAgIG1vbGVjdWxlTm9kZS50cmFuc2Zvcm1Nb2xlY3VsZSggdHJhbnNmb3JtTWF0cml4ICk7XHJcbiAgICB9XHJcbiAgICBtb2xlY3VsZU5vZGUuZHJhdygpO1xyXG4gICAgcmV0dXJuIG5ldyBJbWFnZSggbW9sZWN1bGVOb2RlLmNhbnZhcy50b0RhdGFVUkwoKSwge1xyXG4gICAgICBpbml0aWFsV2lkdGg6IHRvQ29sbGVjdGlvbkJveCA/IDAgOiBtb2xlY3VsZU5vZGUuY2FudmFzLndpZHRoLFxyXG4gICAgICBpbml0aWFsSGVpZ2h0OiB0b0NvbGxlY3Rpb25Cb3ggPyAwIDogbW9sZWN1bGVOb2RlLmNhbnZhcy5oZWlnaHQsXHJcbiAgICAgIHNjYWxlOiBzY2FsZVxyXG4gICAgfSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSB0aGUgaG9tZSBzY3JlZW4gYW5kIG5hdi1iYXIgaWNvbiBmb3IgdGhlIFNpbmdsZSBzY3JlZW4uXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge1NjcmVlbkljb259XHJcbiAgICovXHJcbiAgY3JlYXRlU2luZ2xlU2NyZWVuSWNvbigpIHtcclxuXHJcbiAgICAvLyBDcmVhdGUgaWNvbiBmcm9tIGNvbXBsZXRlIE1vbGVjdWxlXHJcbiAgICBjb25zdCBtb2xlY3VsZUljb24gPSBCQU1JY29uRmFjdG9yeS5jcmVhdGVJY29uSW1hZ2UoXHJcbiAgICAgIE1vbGVjdWxlTGlzdC5IMk8sXHJcbiAgICAgIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS53aWR0aCxcclxuICAgICAgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLmhlaWdodCxcclxuICAgICAgMC44NSxcclxuICAgICAgZmFsc2VcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgd3JhcHBlck5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGgsIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQsIDAsIDAsIHtcclxuICAgICAgZmlsbDogQkFNQ29uc3RhbnRzLlBMQVlfQVJFQV9CQUNLR1JPVU5EX0NPTE9SLFxyXG4gICAgICBjaGlsZHJlbjogWyBtb2xlY3VsZUljb24gXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkanVzdCB0aGUgcG9zaXRpb24gb2YgdGhlIG1vbGVjdWxlIGljb24uXHJcbiAgICBtb2xlY3VsZUljb24uY2VudGVyID0gd3JhcHBlck5vZGUuY2VudGVyLnBsdXNYWSggMCwgMjAgKTtcclxuXHJcbiAgICAvLyBSZXR1cm4gdGhlIGljb24gaW4gaXRzIHdyYXBwZXJcclxuICAgIHJldHVybiBuZXcgU2NyZWVuSWNvbiggd3JhcHBlck5vZGUsIFNDUkVFTl9JQ09OX09QVElPTlMgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIGhvbWUgc2NyZWVuIGFuZCBuYXYtYmFyIGljb24gZm9yIHRoZSBNdWx0aXBsZVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtTY3JlZW5JY29ufVxyXG4gICAqL1xyXG4gIGNyZWF0ZU11bHRpcGxlU2NyZWVuSWNvbigpIHtcclxuXHJcbiAgICAvLyBJY29uaXplIGZpcnN0IE8yIE1vbGVjdWxlXHJcbiAgICBjb25zdCBtb2xlY3VsZUljb25PbmUgPSBCQU1JY29uRmFjdG9yeS5jcmVhdGVJY29uSW1hZ2UoXHJcbiAgICAgIE1vbGVjdWxlTGlzdC5PMixcclxuICAgICAgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoLFxyXG4gICAgICBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUuaGVpZ2h0LFxyXG4gICAgICAwLjUwLFxyXG4gICAgICBmYWxzZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBJY29uaXplIHNlY29uZCBPMiBNb2xlY3VsZVxyXG4gICAgY29uc3QgbW9sZWN1bGVJY29uVHdvID0gQkFNSWNvbkZhY3RvcnkuY3JlYXRlSWNvbkltYWdlKFxyXG4gICAgICBNb2xlY3VsZUxpc3QuTzIsXHJcbiAgICAgIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS53aWR0aCxcclxuICAgICAgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLmhlaWdodCxcclxuICAgICAgMC41MCxcclxuICAgICAgZmFsc2VcclxuICAgICk7XHJcblxyXG4gICAgLy8gV3JhcHBlciBub2RlIHRvIGhvdXNlIG1vbGVjdWxlIGljb25zXHJcbiAgICBjb25zdCB3cmFwcGVyTm9kZSA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIDAsIDAsIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS53aWR0aCwgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLmhlaWdodCwgMCwgMCwge1xyXG4gICAgICAgIGZpbGw6IEJBTUNvbnN0YW50cy5QTEFZX0FSRUFfQkFDS0dST1VORF9DT0xPUixcclxuICAgICAgICBjaGlsZHJlbjogWyBtb2xlY3VsZUljb25PbmUsIG1vbGVjdWxlSWNvblR3byBdXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGp1c3QgdGhlIHBvc2l0aW9uIG9mIHRoZSBtb2xlY3VsZSBpY29ucy5cclxuICAgIG1vbGVjdWxlSWNvbk9uZS5jZW50ZXIgPSB3cmFwcGVyTm9kZS5jZW50ZXIubWludXNYWSggMTI1LCAwICk7XHJcbiAgICBtb2xlY3VsZUljb25Ud28uY2VudGVyID0gd3JhcHBlck5vZGUuY2VudGVyLnBsdXNYWSggMTE1LCAwICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBTY3JlZW5JY29uKCB3cmFwcGVyTm9kZSwgU0NSRUVOX0lDT05fT1BUSU9OUyApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSB0aGUgaG9tZSBzY3JlZW4gYW5kIG5hdi1iYXIgaWNvbiBmb3IgdGhlIFBsYXlncm91bmQgc2NyZWVuLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtTY3JlZW5JY29ufVxyXG4gICAqL1xyXG4gIGNyZWF0ZVBsYXlncm91bmRTY3JlZW5JY29uKCkge1xyXG5cclxuICAgIC8vIEljb25pemUgZmlyc3QgTzIgTW9sZWN1bGVcclxuICAgIGNvbnN0IG1vbGVjdWxlSWNvbiA9IEJBTUljb25GYWN0b3J5LmNyZWF0ZUljb25JbWFnZShcclxuICAgICAgTW9sZWN1bGVMaXN0LkMySDRPMixcclxuICAgICAgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoLFxyXG4gICAgICBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUuaGVpZ2h0LFxyXG4gICAgICAwLjk1LFxyXG4gICAgICBmYWxzZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCB3cmFwcGVyTm9kZSA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIDAsIDAsIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS53aWR0aCwgU2NyZWVuLk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLmhlaWdodCwgMCwgMCwge1xyXG4gICAgICAgIGZpbGw6IEJBTUNvbnN0YW50cy5QTEFZX0FSRUFfQkFDS0dST1VORF9DT0xPUixcclxuICAgICAgICBjaGlsZHJlbjogWyBtb2xlY3VsZUljb24gXVxyXG4gICAgICB9ICk7XHJcbiAgICBtb2xlY3VsZUljb24uY2VudGVyID0gd3JhcHBlck5vZGUuY2VudGVyLm1pbnVzWFkoIDAsIDEwICk7XHJcbiAgICByZXR1cm4gbmV3IFNjcmVlbkljb24oIHdyYXBwZXJOb2RlLCBTQ1JFRU5fSUNPTl9PUFRJT05TICk7XHJcbiAgfVxyXG59O1xyXG5cclxuYnVpbGRBTW9sZWN1bGUucmVnaXN0ZXIoICdCQU1JY29uRmFjdG9yeScsIEJBTUljb25GYWN0b3J5ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJBTUljb25GYWN0b3J5OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxTQUFTQyxLQUFLLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsY0FBYyxNQUFNLDRDQUE0Qzs7QUFFdkU7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRztFQUMxQkMsc0JBQXNCLEVBQUUsQ0FBQztFQUN6QkMsdUJBQXVCLEVB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