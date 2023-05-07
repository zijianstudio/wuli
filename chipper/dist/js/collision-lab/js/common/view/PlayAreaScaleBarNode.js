// Copyright 2020-2022, University of Colorado Boulder

/**
 * PlayAreaScaleBarNode is a specialized view to display a arrow scale-bar, which samples some portion of a
 * PlayArea's bounds and indicates its width/height. In the 'Collision Lab' simulation, its purpose is to allow the user
 * gauge the size of the PlayArea.
 *
 * It is drawn vertically for two dimensional PlayAreas and it is drawn horizontally for one dimensional PlayAreas.
 * It looks like this (but with solid arrow heads):
 *                        _
 *    0.5 m               ∧
 * |<—————>|   OR   0.5 m │
 *                        ∨
 *                        ̅
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { FlowBox, HBox, Line, Text } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabColors from '../CollisionLabColors.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
class PlayAreaScaleBarNode extends FlowBox {
  /**
   * @param {number} length - the width or height of the scale-bar, in model units (meters).
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(length, modelViewTransform, options) {
    assert && assert(typeof length === 'number' && length > 0, `invalid length: ${length}`);
    assert && assert(modelViewTransform instanceof ModelViewTransform2, `invalid modelViewTransform: ${modelViewTransform}`);
    options = merge({
      // {Orientation} - the orientation of the scale-bar. Either HORIZONTAL or VERTICAL.
      scaleBarOrientation: Orientation.HORIZONTAL,
      // {Object} - passed to the ArrowNode instance.
      arrowOptions: {
        headWidth: 7.5,
        headHeight: 7,
        tailWidth: 2.9,
        lineWidth: 0
      },
      // Side-bar
      sideBarLength: 8,
      // {number} - the length of the bars on the side of the ArrowNode
      sideBarLineWidth: 1,
      // {number} - the line-width of the bars on the side of the ArrowNode

      // Label
      labelMargin: 0,
      // {number} - margin between the label and the arrow.
      labelFont: CollisionLabConstants.DISPLAY_FONT
    }, options);

    //----------------------------------------------------------------------------------------

    // Verify that only some options were provided.
    assert && assert(!options.orientation, 'PlayAreaScaleBarNode sets orientation');
    assert && assert(!options.spacing, 'PlayAreaScaleBarNode sets spacing');
    assert && assert(!options.children, 'PlayAreaScaleBarNode sets children');
    assert && assert(!options.arrowOptions.fill, 'PlayAreaScaleBarNode sets arrowOptions.fill');
    assert && assert(!options.arrowOptions.stroke, 'PlayAreaScaleBarNode sets arrowOptions.stroke');
    assert && assert(!options.arrowOptions.doubleHead, 'PlayAreaScaleBarNode sets arrowOptions.doubleHead');

    //----------------------------------------------------------------------------------------

    // Concatenate the label string. Looks like '0.5 m'
    const labelString = StringUtils.fillIn(CollisionLabStrings.pattern.valueSpaceUnits, {
      value: length,
      units: CollisionLabStrings.units.meters
    });

    // Create the Label of the scale-bar.
    const labelNode = new Text(labelString, {
      font: options.labelFont,
      // Constrain width for i18n. Determined empirically (also based on the orientation).
      maxWidth: options.scaleBarOrientation === Orientation.HORIZONTAL ? modelViewTransform.modelToViewDeltaX(length) * 0.75 : 35
    });

    /*----------------------------------------------------------------------------*
     * First draw the arrow and the side-bars. Draw it horizontally and rotate if the orientation is VERTICAL.
     *----------------------------------------------------------------------------*/

    // Create the left side-bar.
    const leftSideBar = new Line(0, 0, 0, options.sideBarLength, {
      lineWidth: options.sideBarLineWidth,
      stroke: CollisionLabColors.SCALE_BAR_COLOR
    });

    // Create the ArrowNode.
    const arrowNode = new ArrowNode(0, 0, modelViewTransform.modelToViewDeltaX(length) - 2 * options.sideBarLineWidth, 0, merge({
      stroke: CollisionLabColors.SCALE_BAR_COLOR,
      fill: CollisionLabColors.SCALE_BAR_COLOR,
      doubleHead: true
    }, options.arrowOptions));

    // Create the right side-bar.
    const rightSideBar = new Line(0, 0, 0, options.sideBarLength, {
      lineWidth: options.sideBarLineWidth,
      stroke: CollisionLabColors.SCALE_BAR_COLOR
    });

    // Wrap the arrow and side-bars in a HBox.
    const sideBarsAndArrowsContainer = new HBox({
      children: [leftSideBar, arrowNode, rightSideBar]
    });

    // Rotate the sideBarsAndArrowsContainer if the orientation is VERTICAL.
    if (options.scaleBarOrientation === Orientation.VERTICAL) {
      sideBarsAndArrowsContainer.rotate(Math.PI / 2);
    }

    //----------------------------------------------------------------------------------------

    // Set the children of the FlowBox.
    options.children = [labelNode, sideBarsAndArrowsContainer];

    // Set the spacing and orientation of the FlowBox.
    options.spacing = options.labelMargin;
    options.orientation = options.scaleBarOrientation.opposite.flowBoxOrientation;
    super(options);
  }
}
collisionLab.register('PlayAreaScaleBarNode', PlayAreaScaleBarNode);
export default PlayAreaScaleBarNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIk9yaWVudGF0aW9uIiwiU3RyaW5nVXRpbHMiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiQXJyb3dOb2RlIiwiRmxvd0JveCIsIkhCb3giLCJMaW5lIiwiVGV4dCIsImNvbGxpc2lvbkxhYiIsIkNvbGxpc2lvbkxhYlN0cmluZ3MiLCJDb2xsaXNpb25MYWJDb2xvcnMiLCJDb2xsaXNpb25MYWJDb25zdGFudHMiLCJQbGF5QXJlYVNjYWxlQmFyTm9kZSIsImNvbnN0cnVjdG9yIiwibGVuZ3RoIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwib3B0aW9ucyIsImFzc2VydCIsInNjYWxlQmFyT3JpZW50YXRpb24iLCJIT1JJWk9OVEFMIiwiYXJyb3dPcHRpb25zIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsInRhaWxXaWR0aCIsImxpbmVXaWR0aCIsInNpZGVCYXJMZW5ndGgiLCJzaWRlQmFyTGluZVdpZHRoIiwibGFiZWxNYXJnaW4iLCJsYWJlbEZvbnQiLCJESVNQTEFZX0ZPTlQiLCJvcmllbnRhdGlvbiIsInNwYWNpbmciLCJjaGlsZHJlbiIsImZpbGwiLCJzdHJva2UiLCJkb3VibGVIZWFkIiwibGFiZWxTdHJpbmciLCJmaWxsSW4iLCJwYXR0ZXJuIiwidmFsdWVTcGFjZVVuaXRzIiwidmFsdWUiLCJ1bml0cyIsIm1ldGVycyIsImxhYmVsTm9kZSIsImZvbnQiLCJtYXhXaWR0aCIsIm1vZGVsVG9WaWV3RGVsdGFYIiwibGVmdFNpZGVCYXIiLCJTQ0FMRV9CQVJfQ09MT1IiLCJhcnJvd05vZGUiLCJyaWdodFNpZGVCYXIiLCJzaWRlQmFyc0FuZEFycm93c0NvbnRhaW5lciIsIlZFUlRJQ0FMIiwicm90YXRlIiwiTWF0aCIsIlBJIiwib3Bwb3NpdGUiLCJmbG93Qm94T3JpZW50YXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYXlBcmVhU2NhbGVCYXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBsYXlBcmVhU2NhbGVCYXJOb2RlIGlzIGEgc3BlY2lhbGl6ZWQgdmlldyB0byBkaXNwbGF5IGEgYXJyb3cgc2NhbGUtYmFyLCB3aGljaCBzYW1wbGVzIHNvbWUgcG9ydGlvbiBvZiBhXHJcbiAqIFBsYXlBcmVhJ3MgYm91bmRzIGFuZCBpbmRpY2F0ZXMgaXRzIHdpZHRoL2hlaWdodC4gSW4gdGhlICdDb2xsaXNpb24gTGFiJyBzaW11bGF0aW9uLCBpdHMgcHVycG9zZSBpcyB0byBhbGxvdyB0aGUgdXNlclxyXG4gKiBnYXVnZSB0aGUgc2l6ZSBvZiB0aGUgUGxheUFyZWEuXHJcbiAqXHJcbiAqIEl0IGlzIGRyYXduIHZlcnRpY2FsbHkgZm9yIHR3byBkaW1lbnNpb25hbCBQbGF5QXJlYXMgYW5kIGl0IGlzIGRyYXduIGhvcml6b250YWxseSBmb3Igb25lIGRpbWVuc2lvbmFsIFBsYXlBcmVhcy5cclxuICogSXQgbG9va3MgbGlrZSB0aGlzIChidXQgd2l0aCBzb2xpZCBhcnJvdyBoZWFkcyk6XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgX1xyXG4gKiAgICAwLjUgbSAgICAgICAgICAgICAgIOKIp1xyXG4gKiB8POKAlOKAlOKAlOKAlOKAlD58ICAgT1IgICAwLjUgbSDilIJcclxuICogICAgICAgICAgICAgICAgICAgICAgICDiiKhcclxuICogICAgICAgICAgICAgICAgICAgICAgICDMhVxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCB7IEZsb3dCb3gsIEhCb3gsIExpbmUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJTdHJpbmdzIGZyb20gJy4uLy4uL0NvbGxpc2lvbkxhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29sb3JzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbG9ycy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDb25zdGFudHMgZnJvbSAnLi4vQ29sbGlzaW9uTGFiQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIFBsYXlBcmVhU2NhbGVCYXJOb2RlIGV4dGVuZHMgRmxvd0JveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggLSB0aGUgd2lkdGggb3IgaGVpZ2h0IG9mIHRoZSBzY2FsZS1iYXIsIGluIG1vZGVsIHVuaXRzIChtZXRlcnMpLlxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBsZW5ndGgsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBsZW5ndGggPT09ICdudW1iZXInICYmIGxlbmd0aCA+IDAsIGBpbnZhbGlkIGxlbmd0aDogJHtsZW5ndGh9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW9kZWxWaWV3VHJhbnNmb3JtIGluc3RhbmNlb2YgTW9kZWxWaWV3VHJhbnNmb3JtMiwgYGludmFsaWQgbW9kZWxWaWV3VHJhbnNmb3JtOiAke21vZGVsVmlld1RyYW5zZm9ybX1gICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7T3JpZW50YXRpb259IC0gdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBzY2FsZS1iYXIuIEVpdGhlciBIT1JJWk9OVEFMIG9yIFZFUlRJQ0FMLlxyXG4gICAgICBzY2FsZUJhck9yaWVudGF0aW9uOiBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLFxyXG5cclxuICAgICAgLy8ge09iamVjdH0gLSBwYXNzZWQgdG8gdGhlIEFycm93Tm9kZSBpbnN0YW5jZS5cclxuICAgICAgYXJyb3dPcHRpb25zOiB7XHJcbiAgICAgICAgaGVhZFdpZHRoOiA3LjUsXHJcbiAgICAgICAgaGVhZEhlaWdodDogNyxcclxuICAgICAgICB0YWlsV2lkdGg6IDIuOSxcclxuICAgICAgICBsaW5lV2lkdGg6IDBcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFNpZGUtYmFyXHJcbiAgICAgIHNpZGVCYXJMZW5ndGg6IDgsICAgIC8vIHtudW1iZXJ9IC0gdGhlIGxlbmd0aCBvZiB0aGUgYmFycyBvbiB0aGUgc2lkZSBvZiB0aGUgQXJyb3dOb2RlXHJcbiAgICAgIHNpZGVCYXJMaW5lV2lkdGg6IDEsIC8vIHtudW1iZXJ9IC0gdGhlIGxpbmUtd2lkdGggb2YgdGhlIGJhcnMgb24gdGhlIHNpZGUgb2YgdGhlIEFycm93Tm9kZVxyXG5cclxuICAgICAgLy8gTGFiZWxcclxuICAgICAgbGFiZWxNYXJnaW46IDAsIC8vIHtudW1iZXJ9IC0gbWFyZ2luIGJldHdlZW4gdGhlIGxhYmVsIGFuZCB0aGUgYXJyb3cuXHJcbiAgICAgIGxhYmVsRm9udDogQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkRJU1BMQVlfRk9OVFxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBWZXJpZnkgdGhhdCBvbmx5IHNvbWUgb3B0aW9ucyB3ZXJlIHByb3ZpZGVkLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMub3JpZW50YXRpb24sICdQbGF5QXJlYVNjYWxlQmFyTm9kZSBzZXRzIG9yaWVudGF0aW9uJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuc3BhY2luZywgJ1BsYXlBcmVhU2NhbGVCYXJOb2RlIHNldHMgc3BhY2luZycgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnUGxheUFyZWFTY2FsZUJhck5vZGUgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmFycm93T3B0aW9ucy5maWxsLCAnUGxheUFyZWFTY2FsZUJhck5vZGUgc2V0cyBhcnJvd09wdGlvbnMuZmlsbCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmFycm93T3B0aW9ucy5zdHJva2UsICdQbGF5QXJlYVNjYWxlQmFyTm9kZSBzZXRzIGFycm93T3B0aW9ucy5zdHJva2UnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5hcnJvd09wdGlvbnMuZG91YmxlSGVhZCwgJ1BsYXlBcmVhU2NhbGVCYXJOb2RlIHNldHMgYXJyb3dPcHRpb25zLmRvdWJsZUhlYWQnICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQ29uY2F0ZW5hdGUgdGhlIGxhYmVsIHN0cmluZy4gTG9va3MgbGlrZSAnMC41IG0nXHJcbiAgICBjb25zdCBsYWJlbFN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggQ29sbGlzaW9uTGFiU3RyaW5ncy5wYXR0ZXJuLnZhbHVlU3BhY2VVbml0cywge1xyXG4gICAgICB2YWx1ZTogbGVuZ3RoLFxyXG4gICAgICB1bml0czogQ29sbGlzaW9uTGFiU3RyaW5ncy51bml0cy5tZXRlcnNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIExhYmVsIG9mIHRoZSBzY2FsZS1iYXIuXHJcbiAgICBjb25zdCBsYWJlbE5vZGUgPSBuZXcgVGV4dCggbGFiZWxTdHJpbmcsIHtcclxuICAgICAgZm9udDogb3B0aW9ucy5sYWJlbEZvbnQsXHJcblxyXG4gICAgICAvLyBDb25zdHJhaW4gd2lkdGggZm9yIGkxOG4uIERldGVybWluZWQgZW1waXJpY2FsbHkgKGFsc28gYmFzZWQgb24gdGhlIG9yaWVudGF0aW9uKS5cclxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMuc2NhbGVCYXJPcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/XHJcbiAgICAgICAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIGxlbmd0aCApICogMC43NSA6IDM1XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAgICogRmlyc3QgZHJhdyB0aGUgYXJyb3cgYW5kIHRoZSBzaWRlLWJhcnMuIERyYXcgaXQgaG9yaXpvbnRhbGx5IGFuZCByb3RhdGUgaWYgdGhlIG9yaWVudGF0aW9uIGlzIFZFUlRJQ0FMLlxyXG4gICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGxlZnQgc2lkZS1iYXIuXHJcbiAgICBjb25zdCBsZWZ0U2lkZUJhciA9IG5ldyBMaW5lKCAwLCAwLCAwLCBvcHRpb25zLnNpZGVCYXJMZW5ndGgsIHtcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnNpZGVCYXJMaW5lV2lkdGgsXHJcbiAgICAgIHN0cm9rZTogQ29sbGlzaW9uTGFiQ29sb3JzLlNDQUxFX0JBUl9DT0xPUlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgQXJyb3dOb2RlLlxyXG4gICAgY29uc3QgYXJyb3dOb2RlID0gbmV3IEFycm93Tm9kZSggMCwgMCxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBsZW5ndGggKSAtIDIgKiBvcHRpb25zLnNpZGVCYXJMaW5lV2lkdGgsIDAsIG1lcmdlKCB7XHJcbiAgICAgICAgc3Ryb2tlOiBDb2xsaXNpb25MYWJDb2xvcnMuU0NBTEVfQkFSX0NPTE9SLFxyXG4gICAgICAgIGZpbGw6IENvbGxpc2lvbkxhYkNvbG9ycy5TQ0FMRV9CQVJfQ09MT1IsXHJcbiAgICAgICAgZG91YmxlSGVhZDogdHJ1ZVxyXG4gICAgICB9LCBvcHRpb25zLmFycm93T3B0aW9ucyApICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSByaWdodCBzaWRlLWJhci5cclxuICAgIGNvbnN0IHJpZ2h0U2lkZUJhciA9IG5ldyBMaW5lKCAwLCAwLCAwLCBvcHRpb25zLnNpZGVCYXJMZW5ndGgsIHtcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnNpZGVCYXJMaW5lV2lkdGgsXHJcbiAgICAgIHN0cm9rZTogQ29sbGlzaW9uTGFiQ29sb3JzLlNDQUxFX0JBUl9DT0xPUlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdyYXAgdGhlIGFycm93IGFuZCBzaWRlLWJhcnMgaW4gYSBIQm94LlxyXG4gICAgY29uc3Qgc2lkZUJhcnNBbmRBcnJvd3NDb250YWluZXIgPSBuZXcgSEJveCggeyBjaGlsZHJlbjogWyBsZWZ0U2lkZUJhciwgYXJyb3dOb2RlLCByaWdodFNpZGVCYXIgXSB9ICk7XHJcblxyXG4gICAgLy8gUm90YXRlIHRoZSBzaWRlQmFyc0FuZEFycm93c0NvbnRhaW5lciBpZiB0aGUgb3JpZW50YXRpb24gaXMgVkVSVElDQUwuXHJcbiAgICBpZiAoIG9wdGlvbnMuc2NhbGVCYXJPcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uVkVSVElDQUwgKSB7IHNpZGVCYXJzQW5kQXJyb3dzQ29udGFpbmVyLnJvdGF0ZSggTWF0aC5QSSAvIDIgKTsgfVxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFNldCB0aGUgY2hpbGRyZW4gb2YgdGhlIEZsb3dCb3guXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICBsYWJlbE5vZGUsXHJcbiAgICAgIHNpZGVCYXJzQW5kQXJyb3dzQ29udGFpbmVyXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIFNldCB0aGUgc3BhY2luZyBhbmQgb3JpZW50YXRpb24gb2YgdGhlIEZsb3dCb3guXHJcbiAgICBvcHRpb25zLnNwYWNpbmcgPSBvcHRpb25zLmxhYmVsTWFyZ2luO1xyXG4gICAgb3B0aW9ucy5vcmllbnRhdGlvbiA9IG9wdGlvbnMuc2NhbGVCYXJPcmllbnRhdGlvbi5vcHBvc2l0ZS5mbG93Qm94T3JpZW50YXRpb247XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ1BsYXlBcmVhU2NhbGVCYXJOb2RlJywgUGxheUFyZWFTY2FsZUJhck5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgUGxheUFyZWFTY2FsZUJhck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNB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