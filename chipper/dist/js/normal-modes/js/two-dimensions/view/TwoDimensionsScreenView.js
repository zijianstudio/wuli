// Copyright 2020-2022, University of Colorado Boulder

/**
 * The view for the 'Two Dimensions' Screen.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NormalModesColors from '../../common/NormalModesColors.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import NormalModesControlPanel from '../../common/view/NormalModesControlPanel.js';
import SpringNode from '../../common/view/SpringNode.js';
import normalModes from '../../normalModes.js';
import MassNode2D from './MassNode2D.js';
import NormalModeAmplitudesAccordionBox from './NormalModeAmplitudesAccordionBox.js';
class TwoDimensionsScreenView extends ScreenView {
  /**
   * @param {TwoDimensionsModel} model
   * @param {Object} [options]
   */
  constructor(model, options) {
    options = merge({
      tandem: Tandem.REQUIRED
    }, options);
    super(options);

    // TODO https://github.com/phetsims/normal-modes/issues/38 magic numbers
    // The center point of borderWalls
    const viewOrigin = new Vector2((this.layoutBounds.maxX - 420) / 2, this.layoutBounds.maxY / 2);
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, viewOrigin, (this.layoutBounds.maxX - 2 * NormalModesConstants.SCREEN_VIEW_X_MARGIN - 420) / 2);
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        resetView();
      },
      right: this.layoutBounds.maxX - NormalModesConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - NormalModesConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem('resetAllButton')
    });

    // Untitled control panel
    const controlPanel = new NormalModesControlPanel(model, merge({
      right: this.layoutBounds.maxX - NormalModesConstants.SCREEN_VIEW_X_MARGIN - resetAllButton.width - 10,
      top: NormalModesConstants.SCREEN_VIEW_Y_MARGIN,
      cornerRadius: 5,
      xMargin: 8,
      yMargin: 8,
      numberOfMassesFormatter: value => Math.pow(value, 2) // See https://github.com/phetsims/normal-modes/issues/69
    }, NormalModesColors.PANEL_COLORS));

    // Springs
    const xSpringNodes = [];
    model.springsX.forEach(springArray => {
      springArray.forEach(spring => {
        const springNode = new SpringNode(spring, modelViewTransform, model.springsVisibleProperty, options.tandem.createTandem('springNodes'));
        xSpringNodes.push(springNode);
      });
    });
    const ySpringNodes = [];
    model.springsY.forEach(springArray => {
      springArray.forEach(spring => {
        const springNode = new SpringNode(spring, modelViewTransform, model.springsVisibleProperty, options.tandem.createTandem('springNodes'));
        ySpringNodes.push(springNode);
      });
    });
    const springNodesParent = new Node({
      children: [...xSpringNodes, ...ySpringNodes]
    });

    // Walls (box)
    const topLeftPoint = modelViewTransform.modelToViewPosition(new Vector2(-1, 1));
    const bottomRightPoint = modelViewTransform.modelToViewPosition(new Vector2(1, -1));
    const borderWalls = new Rectangle(new Bounds2(topLeftPoint.x, topLeftPoint.y, bottomRightPoint.x, bottomRightPoint.y), {
      stroke: NormalModesColors.WALL_COLORS.stroke,
      lineWidth: 2
    });

    // Normal Mode Amplitudes accordion box
    const normalModeAmplitudesAccordionBox = new NormalModeAmplitudesAccordionBox(model, merge({
      right: controlPanel.right,
      bottom: borderWalls.bottom,
      cornerRadius: 5
    }, NormalModesColors.PANEL_COLORS));

    // Drag bounds for the masses is defined by borderWalls.
    // See https://github.com/phetsims/normal-modes/issues/68
    const massDragBounds = modelViewTransform.viewToModelBounds(borderWalls.bounds);

    // Masses - use slice to ignore the virtual stationary masses at the walls
    const massNodes = [];
    model.masses.slice(1, model.masses.length - 1).forEach(massArray => {
      massArray.slice(1, massArray.length - 1).forEach(mass => {
        const massNode = new MassNode2D(mass, modelViewTransform, model, massDragBounds, options.tandem.createTandem('massNodes'));
        massNodes.push(massNode);
      });
    });
    const massNodesParent = new Node({
      children: massNodes
    });
    const screenViewRootNode = new Node({
      children: [controlPanel, normalModeAmplitudesAccordionBox, resetAllButton, springNodesParent, borderWalls, massNodesParent]
    });
    this.addChild(screenViewRootNode);

    // When the number of masses is changed, interrupt any dragging that may be in progress.
    model.numberOfMassesProperty.link(numberOfMasses => {
      massNodesParent.interruptSubtreeInput();
    });
    const resetView = () => {
      normalModeAmplitudesAccordionBox.expandedProperty.reset();
    };
  }
}
normalModes.register('TwoDimensionsScreenView', TwoDimensionsScreenView);
export default TwoDimensionsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJtZXJnZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJSZXNldEFsbEJ1dHRvbiIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUYW5kZW0iLCJOb3JtYWxNb2Rlc0NvbG9ycyIsIk5vcm1hbE1vZGVzQ29uc3RhbnRzIiwiTm9ybWFsTW9kZXNDb250cm9sUGFuZWwiLCJTcHJpbmdOb2RlIiwibm9ybWFsTW9kZXMiLCJNYXNzTm9kZTJEIiwiTm9ybWFsTW9kZUFtcGxpdHVkZXNBY2NvcmRpb25Cb3giLCJUd29EaW1lbnNpb25zU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJvcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ2aWV3T3JpZ2luIiwibGF5b3V0Qm91bmRzIiwibWF4WCIsIm1heFkiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIlpFUk8iLCJTQ1JFRU5fVklFV19YX01BUkdJTiIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZXNldCIsInJlc2V0VmlldyIsInJpZ2h0IiwiYm90dG9tIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJjcmVhdGVUYW5kZW0iLCJjb250cm9sUGFuZWwiLCJ3aWR0aCIsInRvcCIsImNvcm5lclJhZGl1cyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibnVtYmVyT2ZNYXNzZXNGb3JtYXR0ZXIiLCJ2YWx1ZSIsIk1hdGgiLCJwb3ciLCJQQU5FTF9DT0xPUlMiLCJ4U3ByaW5nTm9kZXMiLCJzcHJpbmdzWCIsImZvckVhY2giLCJzcHJpbmdBcnJheSIsInNwcmluZyIsInNwcmluZ05vZGUiLCJzcHJpbmdzVmlzaWJsZVByb3BlcnR5IiwicHVzaCIsInlTcHJpbmdOb2RlcyIsInNwcmluZ3NZIiwic3ByaW5nTm9kZXNQYXJlbnQiLCJjaGlsZHJlbiIsInRvcExlZnRQb2ludCIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJib3R0b21SaWdodFBvaW50IiwiYm9yZGVyV2FsbHMiLCJ4IiwieSIsInN0cm9rZSIsIldBTExfQ09MT1JTIiwibGluZVdpZHRoIiwibm9ybWFsTW9kZUFtcGxpdHVkZXNBY2NvcmRpb25Cb3giLCJtYXNzRHJhZ0JvdW5kcyIsInZpZXdUb01vZGVsQm91bmRzIiwiYm91bmRzIiwibWFzc05vZGVzIiwibWFzc2VzIiwic2xpY2UiLCJsZW5ndGgiLCJtYXNzQXJyYXkiLCJtYXNzIiwibWFzc05vZGUiLCJtYXNzTm9kZXNQYXJlbnQiLCJzY3JlZW5WaWV3Um9vdE5vZGUiLCJhZGRDaGlsZCIsIm51bWJlck9mTWFzc2VzUHJvcGVydHkiLCJsaW5rIiwibnVtYmVyT2ZNYXNzZXMiLCJleHBhbmRlZFByb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUd29EaW1lbnNpb25zU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgdmlldyBmb3IgdGhlICdUd28gRGltZW5zaW9ucycgU2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFRoaWFnbyBkZSBNZW5kb27Dp2EgTWlsZGVtYmVyZ2VyIChVVEZQUilcclxuICogQGF1dGhvciBGcmFuY28gQmFycHAgR29tZXMgKFVURlBSKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE5vcm1hbE1vZGVzQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9Ob3JtYWxNb2Rlc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBOb3JtYWxNb2Rlc0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vTm9ybWFsTW9kZXNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTm9ybWFsTW9kZXNDb250cm9sUGFuZWwgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTm9ybWFsTW9kZXNDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgU3ByaW5nTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TcHJpbmdOb2RlLmpzJztcclxuaW1wb3J0IG5vcm1hbE1vZGVzIGZyb20gJy4uLy4uL25vcm1hbE1vZGVzLmpzJztcclxuaW1wb3J0IE1hc3NOb2RlMkQgZnJvbSAnLi9NYXNzTm9kZTJELmpzJztcclxuaW1wb3J0IE5vcm1hbE1vZGVBbXBsaXR1ZGVzQWNjb3JkaW9uQm94IGZyb20gJy4vTm9ybWFsTW9kZUFtcGxpdHVkZXNBY2NvcmRpb25Cb3guanMnO1xyXG5cclxuY2xhc3MgVHdvRGltZW5zaW9uc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUd29EaW1lbnNpb25zTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25vcm1hbC1tb2Rlcy9pc3N1ZXMvMzggbWFnaWMgbnVtYmVyc1xyXG4gICAgLy8gVGhlIGNlbnRlciBwb2ludCBvZiBib3JkZXJXYWxsc1xyXG4gICAgY29uc3Qgdmlld09yaWdpbiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAoIHRoaXMubGF5b3V0Qm91bmRzLm1heFggLSA0MjAgKSAvIDIsXHJcbiAgICAgICggdGhpcy5sYXlvdXRCb3VuZHMubWF4WSApIC8gMlxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nKFxyXG4gICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgIHZpZXdPcmlnaW4sXHJcbiAgICAgICggdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDIgKiBOb3JtYWxNb2Rlc0NvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTiAtIDQyMCApIC8gMlxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBtYXkgYmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHJlc2V0VmlldygpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIE5vcm1hbE1vZGVzQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBOb3JtYWxNb2Rlc0NvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFVudGl0bGVkIGNvbnRyb2wgcGFuZWxcclxuICAgIGNvbnN0IGNvbnRyb2xQYW5lbCA9IG5ldyBOb3JtYWxNb2Rlc0NvbnRyb2xQYW5lbCggbW9kZWwsIG1lcmdlKCB7XHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gTm9ybWFsTW9kZXNDb25zdGFudHMuU0NSRUVOX1ZJRVdfWF9NQVJHSU4gLSByZXNldEFsbEJ1dHRvbi53aWR0aCAtIDEwLFxyXG4gICAgICB0b3A6IE5vcm1hbE1vZGVzQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDUsXHJcbiAgICAgIHhNYXJnaW46IDgsXHJcbiAgICAgIHlNYXJnaW46IDgsXHJcbiAgICAgIG51bWJlck9mTWFzc2VzRm9ybWF0dGVyOiB2YWx1ZSA9PiBNYXRoLnBvdyggdmFsdWUsIDIgKSAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25vcm1hbC1tb2Rlcy9pc3N1ZXMvNjlcclxuICAgIH0sIE5vcm1hbE1vZGVzQ29sb3JzLlBBTkVMX0NPTE9SUyApICk7XHJcblxyXG4gICAgLy8gU3ByaW5nc1xyXG4gICAgY29uc3QgeFNwcmluZ05vZGVzID0gW107XHJcbiAgICBtb2RlbC5zcHJpbmdzWC5mb3JFYWNoKCBzcHJpbmdBcnJheSA9PiB7XHJcbiAgICAgIHNwcmluZ0FycmF5LmZvckVhY2goIHNwcmluZyA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3ByaW5nTm9kZSA9IG5ldyBTcHJpbmdOb2RlKFxyXG4gICAgICAgICAgc3ByaW5nLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG1vZGVsLnNwcmluZ3NWaXNpYmxlUHJvcGVydHksIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwcmluZ05vZGVzJyApXHJcbiAgICAgICAgKTtcclxuICAgICAgICB4U3ByaW5nTm9kZXMucHVzaCggc3ByaW5nTm9kZSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB5U3ByaW5nTm9kZXMgPSBbXTtcclxuICAgIG1vZGVsLnNwcmluZ3NZLmZvckVhY2goIHNwcmluZ0FycmF5ID0+IHtcclxuICAgICAgc3ByaW5nQXJyYXkuZm9yRWFjaCggc3ByaW5nID0+IHtcclxuICAgICAgICBjb25zdCBzcHJpbmdOb2RlID0gbmV3IFNwcmluZ05vZGUoXHJcbiAgICAgICAgICBzcHJpbmcsIG1vZGVsVmlld1RyYW5zZm9ybSwgbW9kZWwuc3ByaW5nc1Zpc2libGVQcm9wZXJ0eSwgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3ByaW5nTm9kZXMnIClcclxuICAgICAgICApO1xyXG4gICAgICAgIHlTcHJpbmdOb2Rlcy5wdXNoKCBzcHJpbmdOb2RlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHNwcmluZ05vZGVzUGFyZW50ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgLi4ueFNwcmluZ05vZGVzLCAuLi55U3ByaW5nTm9kZXMgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdhbGxzIChib3gpXHJcbiAgICBjb25zdCB0b3BMZWZ0UG9pbnQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbmV3IFZlY3RvcjIoIC0xLCAxICkgKTtcclxuICAgIGNvbnN0IGJvdHRvbVJpZ2h0UG9pbnQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbmV3IFZlY3RvcjIoIDEsIC0xICkgKTtcclxuICAgIGNvbnN0IGJvcmRlcldhbGxzID0gbmV3IFJlY3RhbmdsZShcclxuICAgICAgbmV3IEJvdW5kczIoIHRvcExlZnRQb2ludC54LCB0b3BMZWZ0UG9pbnQueSwgYm90dG9tUmlnaHRQb2ludC54LCBib3R0b21SaWdodFBvaW50LnkgKSwge1xyXG4gICAgICAgIHN0cm9rZTogTm9ybWFsTW9kZXNDb2xvcnMuV0FMTF9DT0xPUlMuc3Ryb2tlLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gTm9ybWFsIE1vZGUgQW1wbGl0dWRlcyBhY2NvcmRpb24gYm94XHJcbiAgICBjb25zdCBub3JtYWxNb2RlQW1wbGl0dWRlc0FjY29yZGlvbkJveCA9IG5ldyBOb3JtYWxNb2RlQW1wbGl0dWRlc0FjY29yZGlvbkJveCggbW9kZWwsIG1lcmdlKCB7XHJcbiAgICAgIHJpZ2h0OiBjb250cm9sUGFuZWwucmlnaHQsXHJcbiAgICAgIGJvdHRvbTogYm9yZGVyV2FsbHMuYm90dG9tLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDVcclxuICAgIH0sIE5vcm1hbE1vZGVzQ29sb3JzLlBBTkVMX0NPTE9SUyApICk7XHJcblxyXG4gICAgLy8gRHJhZyBib3VuZHMgZm9yIHRoZSBtYXNzZXMgaXMgZGVmaW5lZCBieSBib3JkZXJXYWxscy5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbm9ybWFsLW1vZGVzL2lzc3Vlcy82OFxyXG4gICAgY29uc3QgbWFzc0RyYWdCb3VuZHMgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxCb3VuZHMoIGJvcmRlcldhbGxzLmJvdW5kcyApO1xyXG5cclxuICAgIC8vIE1hc3NlcyAtIHVzZSBzbGljZSB0byBpZ25vcmUgdGhlIHZpcnR1YWwgc3RhdGlvbmFyeSBtYXNzZXMgYXQgdGhlIHdhbGxzXHJcbiAgICBjb25zdCBtYXNzTm9kZXMgPSBbXTtcclxuICAgIG1vZGVsLm1hc3Nlcy5zbGljZSggMSwgbW9kZWwubWFzc2VzLmxlbmd0aCAtIDEgKS5mb3JFYWNoKCBtYXNzQXJyYXkgPT4ge1xyXG4gICAgICBtYXNzQXJyYXkuc2xpY2UoIDEsIG1hc3NBcnJheS5sZW5ndGggLSAxICkuZm9yRWFjaCggbWFzcyA9PiB7XHJcbiAgICAgICAgY29uc3QgbWFzc05vZGUgPSBuZXcgTWFzc05vZGUyRCggbWFzcywgbW9kZWxWaWV3VHJhbnNmb3JtLCBtb2RlbCwgbWFzc0RyYWdCb3VuZHMsIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hc3NOb2RlcycgKSApO1xyXG4gICAgICAgIG1hc3NOb2Rlcy5wdXNoKCBtYXNzTm9kZSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBtYXNzTm9kZXNQYXJlbnQgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogbWFzc05vZGVzXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2NyZWVuVmlld1Jvb3ROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBjb250cm9sUGFuZWwsXHJcbiAgICAgICAgbm9ybWFsTW9kZUFtcGxpdHVkZXNBY2NvcmRpb25Cb3gsXHJcbiAgICAgICAgcmVzZXRBbGxCdXR0b24sXHJcbiAgICAgICAgc3ByaW5nTm9kZXNQYXJlbnQsXHJcbiAgICAgICAgYm9yZGVyV2FsbHMsXHJcbiAgICAgICAgbWFzc05vZGVzUGFyZW50XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNjcmVlblZpZXdSb290Tm9kZSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIG51bWJlciBvZiBtYXNzZXMgaXMgY2hhbmdlZCwgaW50ZXJydXB0IGFueSBkcmFnZ2luZyB0aGF0IG1heSBiZSBpbiBwcm9ncmVzcy5cclxuICAgIG1vZGVsLm51bWJlck9mTWFzc2VzUHJvcGVydHkubGluayggbnVtYmVyT2ZNYXNzZXMgPT4ge1xyXG4gICAgICBtYXNzTm9kZXNQYXJlbnQuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcmVzZXRWaWV3ID0gKCkgPT4ge1xyXG4gICAgICBub3JtYWxNb2RlQW1wbGl0dWRlc0FjY29yZGlvbkJveC5leHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxubm9ybWFsTW9kZXMucmVnaXN0ZXIoICdUd29EaW1lbnNpb25zU2NyZWVuVmlldycsIFR3b0RpbWVuc2lvbnNTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFR3b0RpbWVuc2lvbnNTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLFFBQVEsbUNBQW1DO0FBQ25FLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsaUJBQWlCLE1BQU0sbUNBQW1DO0FBQ2pFLE9BQU9DLG9CQUFvQixNQUFNLHNDQUFzQztBQUN2RSxPQUFPQyx1QkFBdUIsTUFBTSw4Q0FBOEM7QUFDbEYsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFDeEMsT0FBT0MsZ0NBQWdDLE1BQU0sdUNBQXVD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