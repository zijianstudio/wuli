// Copyright 2020-2022, University of Colorado Boulder

/**
 * A single column in the BallValuesPanel: usually displays a column of NumberDisplays of a single type of Ball Values
 * for all the Balls in the system, but also displays some other components, like Ball icons or Mass sliders. See
 * BallValuesPanelColumnTypes for and exhaustive list of all types of columns.
 *
 * Each column has:
 *   - Content Nodes - these are the main content Nodes of the column (the NumberDisplays, ball icons, etc.).
 *   - Label Nodes - these are the Labels above some of the columns (eg. the 'x' above the x-position NumberDisplays).
 *     If the column doesn't have a label, the label will be an empty Node. These are all aligned to have the same
 *     heights vertically in a AlignGroup.
 *
 * BallValuesColumnNode takes advantage of the prepopulatedBalls in the BallSystem, which all Balls in the system must
 * be apart of. Instead of creating a Content Node each time a Ball is added to the system, it creates all the Content
 * Nodes for every Ball at the start of the sim and adjusts their visibilities based on which Balls are in the
 * system. There is no performance loss since Balls not in the BallSystem are not stepped or updated (meaning their
 * values cannot be changed). BallValuesColumnNodes are created at the start of the sim and are never disposed.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { AlignGroup, RichText, VBox } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import Ball from '../model/Ball.js';
import BallSystem from '../model/BallSystem.js';
import BallMassSlider from './BallMassSlider.js';
import BallValuesPanelColumnTypes from './BallValuesPanelColumnTypes.js';
import BallValuesPanelNumberDisplay from './BallValuesPanelNumberDisplay.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import KeypadDialog from '../../../../scenery-phet/js/keypad/KeypadDialog.js';

// AlignGroups for the content and label Nodes of every BallValuesPanelColumnNode. Created to match the vertical height
// of each component in the BallValuesPanel across screens every screen.
const LABEL_ALIGN_GROUP = new AlignGroup({
  matchHorizontal: false,
  matchVertical: true
});
const CONTENT_ALIGN_GROUP = new AlignGroup({
  matchHorizontal: false,
  matchVertical: true
});
class BallValuesPanelColumnNode extends VBox {
  /**
   * @param {BallSystem} ballSystem - the system of Balls.
   * @param {BallValuesPanelColumnTypes} columnType
   * @param {KeypadDialog} keypadDialog - KeypadDialog instance for the screen.
   * @param {Object} [options]
   */
  constructor(ballSystem, columnType, keypadDialog, options) {
    assert && assert(ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}`);
    assert && assert(BallValuesPanelColumnTypes.includes(columnType), `invalid columnType: ${columnType}`);
    assert && assert(keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}`);
    options = merge({
      // {number} - y-spacing between each of the content Nodes.
      contentContainerSpacing: 3.5,
      // {number} - y-spacing between the label and first content Node.
      labelSpacing: 3
    }, options);

    // Set the spacing super-class option.
    assert && assert(!options.spacing, 'BallValuesPanelColumnNode sets spacing');
    assert && assert(!options.children, 'BallValuesPanelColumnNode sets children');
    options.spacing = options.labelSpacing;

    //----------------------------------------------------------------------------------------

    // Create the Label Node. See the comment at the top of this file for context.
    const labelNode = new RichText(BallValuesPanelColumnNode.getLabelString(columnType), {
      font: CollisionLabConstants.DISPLAY_FONT,
      maxWidth: 25 // constrain width for i18n, determined empirically
    });

    // Create the VBox container for the contentNodes of the column.
    const contentContainer = new VBox({
      spacing: options.contentContainerSpacing
    });

    // Loop through each possible Ball and create the corresponding contentNode. These Balls are NOT necessarily the
    // Balls currently within the BallSystem so we are responsible for updating visibility based on whether or not it is
    // the system.
    ballSystem.prepopulatedBalls.forEach(ball => {
      // Create the corresponding contentNode for each prepopulatedBall.
      const contentNode = BallValuesPanelColumnNode.createContentNode(ball, columnType, ballSystem, keypadDialog);

      // Add the content to the container.
      contentContainer.addChild(contentNode);

      // Observe when Balls are added or removed from the BallSystem, meaning the contentNode's visibility could change
      // if the ball is added or removed from the system. It should only be visible if the ball is in the BallSystem.
      ballSystem.balls.lengthProperty.link(() => {
        contentNode.visible = ballSystem.balls.includes(ball);
      });
    });

    // Set the children of this Node to the correct rendering order.
    options.children = [LABEL_ALIGN_GROUP.createBox(labelNode), contentContainer];
    super(options);
  }

  /**
   * Creates the contentNode that corresponds with the passed-in Ball and BallValuesPanelColumnType.
   * @private
   *
   * @param {Ball} ball
   * @param {BallValuesPanelColumnTypes} columnType
   * @param {BallSystem} ballSystem - the system of Balls.
   * @param {KeypadDialog} keypadDialog - KeypadDialog instance for the screen.
   * @returns {Node}
   */
  static createContentNode(ball, columnType, ballSystem, keypadDialog) {
    assert && assert(ball instanceof Ball, `invalid ball: ${ball}`);
    assert && assert(BallValuesPanelColumnTypes.includes(columnType), `invalid columnType: ${columnType}`);
    assert && assert(ballSystem instanceof BallSystem, `invalid ballSystem: ${ballSystem}`);
    assert && assert(keypadDialog instanceof KeypadDialog, `invalid keypadDialog: ${keypadDialog}`);

    // Flag that references the contentNode.
    let contentNode;
    if (columnType === BallValuesPanelColumnTypes.BALL_ICONS) {
      contentNode = CollisionLabIconFactory.createBallIcon(ball);
    } else if (columnType === BallValuesPanelColumnTypes.MASS_SLIDERS) {
      contentNode = new BallMassSlider(ball, ballSystem);
    } else {
      contentNode = new BallValuesPanelNumberDisplay(ball, columnType, ballSystem, keypadDialog);
    }

    // Wrap the contentNode in a AlignBox to match the height of all ContentNodes.
    return CONTENT_ALIGN_GROUP.createBox(contentNode);
  }

  /**
   * Gets the string for the label that corresponds with the passed-in BallValuesPanelColumnType. The label is
   * positioned above the content of the column.
   * @private
   *
   * @param {BallValuesPanelColumnTypes} columnType
   * @returns {string} - label to display. May use inlined HTML.
   */
  static getLabelString(columnType) {
    assert && assert(BallValuesPanelColumnTypes.includes(columnType), `invalid columnType: ${columnType}`);

    // Convenience function that gets the label for a component BallValuesPanelColumnType.
    const getComponentLabel = (label, component) => StringUtils.fillIn(CollisionLabStrings.pattern.symbolSubSymbol, {
      symbol1: label,
      symbol2: component
    });
    if (columnType === BallValuesPanelColumnTypes.X_POSITION) {
      return CollisionLabStrings.symbol.x;
    } else if (columnType === BallValuesPanelColumnTypes.Y_POSITION) {
      return CollisionLabStrings.symbol.y;
    } else if (columnType === BallValuesPanelColumnTypes.X_VELOCITY) {
      return getComponentLabel(CollisionLabStrings.symbol.velocity, CollisionLabStrings.symbol.x);
    } else if (columnType === BallValuesPanelColumnTypes.Y_VELOCITY) {
      return getComponentLabel(CollisionLabStrings.symbol.velocity, CollisionLabStrings.symbol.y);
    } else if (columnType === BallValuesPanelColumnTypes.X_MOMENTUM) {
      return getComponentLabel(CollisionLabStrings.symbol.momentum, CollisionLabStrings.symbol.x);
    } else if (columnType === BallValuesPanelColumnTypes.Y_MOMENTUM) {
      return getComponentLabel(CollisionLabStrings.symbol.momentum, CollisionLabStrings.symbol.y);
    } else {
      // At this point, the column doesn't have a specific label, so return the empty string.
      return '';
    }
  }
}
collisionLab.register('BallValuesPanelColumnNode', BallValuesPanelColumnNode);
export default BallValuesPanelColumnNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiQWxpZ25Hcm91cCIsIlJpY2hUZXh0IiwiVkJveCIsImNvbGxpc2lvbkxhYiIsIkNvbGxpc2lvbkxhYlN0cmluZ3MiLCJDb2xsaXNpb25MYWJDb25zdGFudHMiLCJCYWxsIiwiQmFsbFN5c3RlbSIsIkJhbGxNYXNzU2xpZGVyIiwiQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZXMiLCJCYWxsVmFsdWVzUGFuZWxOdW1iZXJEaXNwbGF5IiwiQ29sbGlzaW9uTGFiSWNvbkZhY3RvcnkiLCJLZXlwYWREaWFsb2ciLCJMQUJFTF9BTElHTl9HUk9VUCIsIm1hdGNoSG9yaXpvbnRhbCIsIm1hdGNoVmVydGljYWwiLCJDT05URU5UX0FMSUdOX0dST1VQIiwiQmFsbFZhbHVlc1BhbmVsQ29sdW1uTm9kZSIsImNvbnN0cnVjdG9yIiwiYmFsbFN5c3RlbSIsImNvbHVtblR5cGUiLCJrZXlwYWREaWFsb2ciLCJvcHRpb25zIiwiYXNzZXJ0IiwiaW5jbHVkZXMiLCJjb250ZW50Q29udGFpbmVyU3BhY2luZyIsImxhYmVsU3BhY2luZyIsInNwYWNpbmciLCJjaGlsZHJlbiIsImxhYmVsTm9kZSIsImdldExhYmVsU3RyaW5nIiwiZm9udCIsIkRJU1BMQVlfRk9OVCIsIm1heFdpZHRoIiwiY29udGVudENvbnRhaW5lciIsInByZXBvcHVsYXRlZEJhbGxzIiwiZm9yRWFjaCIsImJhbGwiLCJjb250ZW50Tm9kZSIsImNyZWF0ZUNvbnRlbnROb2RlIiwiYWRkQ2hpbGQiLCJiYWxscyIsImxlbmd0aFByb3BlcnR5IiwibGluayIsInZpc2libGUiLCJjcmVhdGVCb3giLCJCQUxMX0lDT05TIiwiY3JlYXRlQmFsbEljb24iLCJNQVNTX1NMSURFUlMiLCJnZXRDb21wb25lbnRMYWJlbCIsImxhYmVsIiwiY29tcG9uZW50IiwiZmlsbEluIiwicGF0dGVybiIsInN5bWJvbFN1YlN5bWJvbCIsInN5bWJvbDEiLCJzeW1ib2wyIiwiWF9QT1NJVElPTiIsInN5bWJvbCIsIngiLCJZX1BPU0lUSU9OIiwieSIsIlhfVkVMT0NJVFkiLCJ2ZWxvY2l0eSIsIllfVkVMT0NJVFkiLCJYX01PTUVOVFVNIiwibW9tZW50dW0iLCJZX01PTUVOVFVNIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYWxsVmFsdWVzUGFuZWxDb2x1bW5Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgc2luZ2xlIGNvbHVtbiBpbiB0aGUgQmFsbFZhbHVlc1BhbmVsOiB1c3VhbGx5IGRpc3BsYXlzIGEgY29sdW1uIG9mIE51bWJlckRpc3BsYXlzIG9mIGEgc2luZ2xlIHR5cGUgb2YgQmFsbCBWYWx1ZXNcclxuICogZm9yIGFsbCB0aGUgQmFsbHMgaW4gdGhlIHN5c3RlbSwgYnV0IGFsc28gZGlzcGxheXMgc29tZSBvdGhlciBjb21wb25lbnRzLCBsaWtlIEJhbGwgaWNvbnMgb3IgTWFzcyBzbGlkZXJzLiBTZWVcclxuICogQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZXMgZm9yIGFuZCBleGhhdXN0aXZlIGxpc3Qgb2YgYWxsIHR5cGVzIG9mIGNvbHVtbnMuXHJcbiAqXHJcbiAqIEVhY2ggY29sdW1uIGhhczpcclxuICogICAtIENvbnRlbnQgTm9kZXMgLSB0aGVzZSBhcmUgdGhlIG1haW4gY29udGVudCBOb2RlcyBvZiB0aGUgY29sdW1uICh0aGUgTnVtYmVyRGlzcGxheXMsIGJhbGwgaWNvbnMsIGV0Yy4pLlxyXG4gKiAgIC0gTGFiZWwgTm9kZXMgLSB0aGVzZSBhcmUgdGhlIExhYmVscyBhYm92ZSBzb21lIG9mIHRoZSBjb2x1bW5zIChlZy4gdGhlICd4JyBhYm92ZSB0aGUgeC1wb3NpdGlvbiBOdW1iZXJEaXNwbGF5cykuXHJcbiAqICAgICBJZiB0aGUgY29sdW1uIGRvZXNuJ3QgaGF2ZSBhIGxhYmVsLCB0aGUgbGFiZWwgd2lsbCBiZSBhbiBlbXB0eSBOb2RlLiBUaGVzZSBhcmUgYWxsIGFsaWduZWQgdG8gaGF2ZSB0aGUgc2FtZVxyXG4gKiAgICAgaGVpZ2h0cyB2ZXJ0aWNhbGx5IGluIGEgQWxpZ25Hcm91cC5cclxuICpcclxuICogQmFsbFZhbHVlc0NvbHVtbk5vZGUgdGFrZXMgYWR2YW50YWdlIG9mIHRoZSBwcmVwb3B1bGF0ZWRCYWxscyBpbiB0aGUgQmFsbFN5c3RlbSwgd2hpY2ggYWxsIEJhbGxzIGluIHRoZSBzeXN0ZW0gbXVzdFxyXG4gKiBiZSBhcGFydCBvZi4gSW5zdGVhZCBvZiBjcmVhdGluZyBhIENvbnRlbnQgTm9kZSBlYWNoIHRpbWUgYSBCYWxsIGlzIGFkZGVkIHRvIHRoZSBzeXN0ZW0sIGl0IGNyZWF0ZXMgYWxsIHRoZSBDb250ZW50XHJcbiAqIE5vZGVzIGZvciBldmVyeSBCYWxsIGF0IHRoZSBzdGFydCBvZiB0aGUgc2ltIGFuZCBhZGp1c3RzIHRoZWlyIHZpc2liaWxpdGllcyBiYXNlZCBvbiB3aGljaCBCYWxscyBhcmUgaW4gdGhlXHJcbiAqIHN5c3RlbS4gVGhlcmUgaXMgbm8gcGVyZm9ybWFuY2UgbG9zcyBzaW5jZSBCYWxscyBub3QgaW4gdGhlIEJhbGxTeXN0ZW0gYXJlIG5vdCBzdGVwcGVkIG9yIHVwZGF0ZWQgKG1lYW5pbmcgdGhlaXJcclxuICogdmFsdWVzIGNhbm5vdCBiZSBjaGFuZ2VkKS4gQmFsbFZhbHVlc0NvbHVtbk5vZGVzIGFyZSBjcmVhdGVkIGF0IHRoZSBzdGFydCBvZiB0aGUgc2ltIGFuZCBhcmUgbmV2ZXIgZGlzcG9zZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Hcm91cCwgUmljaFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJTdHJpbmdzIGZyb20gJy4uLy4uL0NvbGxpc2lvbkxhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29uc3RhbnRzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCYWxsIGZyb20gJy4uL21vZGVsL0JhbGwuanMnO1xyXG5pbXBvcnQgQmFsbFN5c3RlbSBmcm9tICcuLi9tb2RlbC9CYWxsU3lzdGVtLmpzJztcclxuaW1wb3J0IEJhbGxNYXNzU2xpZGVyIGZyb20gJy4vQmFsbE1hc3NTbGlkZXIuanMnO1xyXG5pbXBvcnQgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZXMgZnJvbSAnLi9CYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlcy5qcyc7XHJcbmltcG9ydCBCYWxsVmFsdWVzUGFuZWxOdW1iZXJEaXNwbGF5IGZyb20gJy4vQmFsbFZhbHVlc1BhbmVsTnVtYmVyRGlzcGxheS5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJJY29uRmFjdG9yeSBmcm9tICcuL0NvbGxpc2lvbkxhYkljb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IEtleXBhZERpYWxvZyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMva2V5cGFkL0tleXBhZERpYWxvZy5qcyc7XHJcblxyXG4vLyBBbGlnbkdyb3VwcyBmb3IgdGhlIGNvbnRlbnQgYW5kIGxhYmVsIE5vZGVzIG9mIGV2ZXJ5IEJhbGxWYWx1ZXNQYW5lbENvbHVtbk5vZGUuIENyZWF0ZWQgdG8gbWF0Y2ggdGhlIHZlcnRpY2FsIGhlaWdodFxyXG4vLyBvZiBlYWNoIGNvbXBvbmVudCBpbiB0aGUgQmFsbFZhbHVlc1BhbmVsIGFjcm9zcyBzY3JlZW5zIGV2ZXJ5IHNjcmVlbi5cclxuY29uc3QgTEFCRUxfQUxJR05fR1JPVVAgPSBuZXcgQWxpZ25Hcm91cCggeyBtYXRjaEhvcml6b250YWw6IGZhbHNlLCBtYXRjaFZlcnRpY2FsOiB0cnVlIH0gKTtcclxuY29uc3QgQ09OVEVOVF9BTElHTl9HUk9VUCA9IG5ldyBBbGlnbkdyb3VwKCB7IG1hdGNoSG9yaXpvbnRhbDogZmFsc2UsIG1hdGNoVmVydGljYWw6IHRydWUgfSApO1xyXG5cclxuY2xhc3MgQmFsbFZhbHVlc1BhbmVsQ29sdW1uTm9kZSBleHRlbmRzIFZCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0JhbGxTeXN0ZW19IGJhbGxTeXN0ZW0gLSB0aGUgc3lzdGVtIG9mIEJhbGxzLlxyXG4gICAqIEBwYXJhbSB7QmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZXN9IGNvbHVtblR5cGVcclxuICAgKiBAcGFyYW0ge0tleXBhZERpYWxvZ30ga2V5cGFkRGlhbG9nIC0gS2V5cGFkRGlhbG9nIGluc3RhbmNlIGZvciB0aGUgc2NyZWVuLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYmFsbFN5c3RlbSwgY29sdW1uVHlwZSwga2V5cGFkRGlhbG9nLCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbFN5c3RlbSBpbnN0YW5jZW9mIEJhbGxTeXN0ZW0sIGBpbnZhbGlkIGJhbGxTeXN0ZW06ICR7YmFsbFN5c3RlbX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlcy5pbmNsdWRlcyggY29sdW1uVHlwZSApLCBgaW52YWxpZCBjb2x1bW5UeXBlOiAke2NvbHVtblR5cGV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5cGFkRGlhbG9nIGluc3RhbmNlb2YgS2V5cGFkRGlhbG9nLCBgaW52YWxpZCBrZXlwYWREaWFsb2c6ICR7a2V5cGFkRGlhbG9nfWAgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0geS1zcGFjaW5nIGJldHdlZW4gZWFjaCBvZiB0aGUgY29udGVudCBOb2Rlcy5cclxuICAgICAgY29udGVudENvbnRhaW5lclNwYWNpbmc6IDMuNSxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0geS1zcGFjaW5nIGJldHdlZW4gdGhlIGxhYmVsIGFuZCBmaXJzdCBjb250ZW50IE5vZGUuXHJcbiAgICAgIGxhYmVsU3BhY2luZzogM1xyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHNwYWNpbmcgc3VwZXItY2xhc3Mgb3B0aW9uLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuc3BhY2luZywgJ0JhbGxWYWx1ZXNQYW5lbENvbHVtbk5vZGUgc2V0cyBzcGFjaW5nJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdCYWxsVmFsdWVzUGFuZWxDb2x1bW5Ob2RlIHNldHMgY2hpbGRyZW4nICk7XHJcbiAgICBvcHRpb25zLnNwYWNpbmcgPSBvcHRpb25zLmxhYmVsU3BhY2luZztcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIExhYmVsIE5vZGUuIFNlZSB0aGUgY29tbWVudCBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZSBmb3IgY29udGV4dC5cclxuICAgIGNvbnN0IGxhYmVsTm9kZSA9IG5ldyBSaWNoVGV4dCggQmFsbFZhbHVlc1BhbmVsQ29sdW1uTm9kZS5nZXRMYWJlbFN0cmluZyggY29sdW1uVHlwZSApLCB7XHJcbiAgICAgIGZvbnQ6IENvbGxpc2lvbkxhYkNvbnN0YW50cy5ESVNQTEFZX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAyNSAvLyBjb25zdHJhaW4gd2lkdGggZm9yIGkxOG4sIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIFZCb3ggY29udGFpbmVyIGZvciB0aGUgY29udGVudE5vZGVzIG9mIHRoZSBjb2x1bW4uXHJcbiAgICBjb25zdCBjb250ZW50Q29udGFpbmVyID0gbmV3IFZCb3goIHsgc3BhY2luZzogb3B0aW9ucy5jb250ZW50Q29udGFpbmVyU3BhY2luZyB9ICk7XHJcblxyXG4gICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggcG9zc2libGUgQmFsbCBhbmQgY3JlYXRlIHRoZSBjb3JyZXNwb25kaW5nIGNvbnRlbnROb2RlLiBUaGVzZSBCYWxscyBhcmUgTk9UIG5lY2Vzc2FyaWx5IHRoZVxyXG4gICAgLy8gQmFsbHMgY3VycmVudGx5IHdpdGhpbiB0aGUgQmFsbFN5c3RlbSBzbyB3ZSBhcmUgcmVzcG9uc2libGUgZm9yIHVwZGF0aW5nIHZpc2liaWxpdHkgYmFzZWQgb24gd2hldGhlciBvciBub3QgaXQgaXNcclxuICAgIC8vIHRoZSBzeXN0ZW0uXHJcbiAgICBiYWxsU3lzdGVtLnByZXBvcHVsYXRlZEJhbGxzLmZvckVhY2goIGJhbGwgPT4ge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBjb3JyZXNwb25kaW5nIGNvbnRlbnROb2RlIGZvciBlYWNoIHByZXBvcHVsYXRlZEJhbGwuXHJcbiAgICAgIGNvbnN0IGNvbnRlbnROb2RlID0gQmFsbFZhbHVlc1BhbmVsQ29sdW1uTm9kZS5jcmVhdGVDb250ZW50Tm9kZSggYmFsbCwgY29sdW1uVHlwZSwgYmFsbFN5c3RlbSwga2V5cGFkRGlhbG9nICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIGNvbnRlbnQgdG8gdGhlIGNvbnRhaW5lci5cclxuICAgICAgY29udGVudENvbnRhaW5lci5hZGRDaGlsZCggY29udGVudE5vZGUgKTtcclxuXHJcbiAgICAgIC8vIE9ic2VydmUgd2hlbiBCYWxscyBhcmUgYWRkZWQgb3IgcmVtb3ZlZCBmcm9tIHRoZSBCYWxsU3lzdGVtLCBtZWFuaW5nIHRoZSBjb250ZW50Tm9kZSdzIHZpc2liaWxpdHkgY291bGQgY2hhbmdlXHJcbiAgICAgIC8vIGlmIHRoZSBiYWxsIGlzIGFkZGVkIG9yIHJlbW92ZWQgZnJvbSB0aGUgc3lzdGVtLiBJdCBzaG91bGQgb25seSBiZSB2aXNpYmxlIGlmIHRoZSBiYWxsIGlzIGluIHRoZSBCYWxsU3lzdGVtLlxyXG4gICAgICBiYWxsU3lzdGVtLmJhbGxzLmxlbmd0aFByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgICBjb250ZW50Tm9kZS52aXNpYmxlID0gYmFsbFN5c3RlbS5iYWxscy5pbmNsdWRlcyggYmFsbCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBjaGlsZHJlbiBvZiB0aGlzIE5vZGUgdG8gdGhlIGNvcnJlY3QgcmVuZGVyaW5nIG9yZGVyLlxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgTEFCRUxfQUxJR05fR1JPVVAuY3JlYXRlQm94KCBsYWJlbE5vZGUgKSwgY29udGVudENvbnRhaW5lciBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBjb250ZW50Tm9kZSB0aGF0IGNvcnJlc3BvbmRzIHdpdGggdGhlIHBhc3NlZC1pbiBCYWxsIGFuZCBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JhbGx9IGJhbGxcclxuICAgKiBAcGFyYW0ge0JhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzfSBjb2x1bW5UeXBlXHJcbiAgICogQHBhcmFtIHtCYWxsU3lzdGVtfSBiYWxsU3lzdGVtIC0gdGhlIHN5c3RlbSBvZiBCYWxscy5cclxuICAgKiBAcGFyYW0ge0tleXBhZERpYWxvZ30ga2V5cGFkRGlhbG9nIC0gS2V5cGFkRGlhbG9nIGluc3RhbmNlIGZvciB0aGUgc2NyZWVuLlxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVDb250ZW50Tm9kZSggYmFsbCwgY29sdW1uVHlwZSwgYmFsbFN5c3RlbSwga2V5cGFkRGlhbG9nICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbCBpbnN0YW5jZW9mIEJhbGwsIGBpbnZhbGlkIGJhbGw6ICR7YmFsbH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlcy5pbmNsdWRlcyggY29sdW1uVHlwZSApLCBgaW52YWxpZCBjb2x1bW5UeXBlOiAke2NvbHVtblR5cGV9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFsbFN5c3RlbSBpbnN0YW5jZW9mIEJhbGxTeXN0ZW0sIGBpbnZhbGlkIGJhbGxTeXN0ZW06ICR7YmFsbFN5c3RlbX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXlwYWREaWFsb2cgaW5zdGFuY2VvZiBLZXlwYWREaWFsb2csIGBpbnZhbGlkIGtleXBhZERpYWxvZzogJHtrZXlwYWREaWFsb2d9YCApO1xyXG5cclxuICAgIC8vIEZsYWcgdGhhdCByZWZlcmVuY2VzIHRoZSBjb250ZW50Tm9kZS5cclxuICAgIGxldCBjb250ZW50Tm9kZTtcclxuXHJcbiAgICBpZiAoIGNvbHVtblR5cGUgPT09IEJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzLkJBTExfSUNPTlMgKSB7XHJcbiAgICAgIGNvbnRlbnROb2RlID0gQ29sbGlzaW9uTGFiSWNvbkZhY3RvcnkuY3JlYXRlQmFsbEljb24oIGJhbGwgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBjb2x1bW5UeXBlID09PSBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlcy5NQVNTX1NMSURFUlMgKSB7XHJcbiAgICAgIGNvbnRlbnROb2RlID0gbmV3IEJhbGxNYXNzU2xpZGVyKCBiYWxsLCBiYWxsU3lzdGVtICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29udGVudE5vZGUgPSBuZXcgQmFsbFZhbHVlc1BhbmVsTnVtYmVyRGlzcGxheSggYmFsbCwgY29sdW1uVHlwZSwgYmFsbFN5c3RlbSwga2V5cGFkRGlhbG9nICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV3JhcCB0aGUgY29udGVudE5vZGUgaW4gYSBBbGlnbkJveCB0byBtYXRjaCB0aGUgaGVpZ2h0IG9mIGFsbCBDb250ZW50Tm9kZXMuXHJcbiAgICByZXR1cm4gQ09OVEVOVF9BTElHTl9HUk9VUC5jcmVhdGVCb3goIGNvbnRlbnROb2RlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBzdHJpbmcgZm9yIHRoZSBsYWJlbCB0aGF0IGNvcnJlc3BvbmRzIHdpdGggdGhlIHBhc3NlZC1pbiBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlLiBUaGUgbGFiZWwgaXNcclxuICAgKiBwb3NpdGlvbmVkIGFib3ZlIHRoZSBjb250ZW50IG9mIHRoZSBjb2x1bW4uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZXN9IGNvbHVtblR5cGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIGxhYmVsIHRvIGRpc3BsYXkuIE1heSB1c2UgaW5saW5lZCBIVE1MLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRMYWJlbFN0cmluZyggY29sdW1uVHlwZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzLmluY2x1ZGVzKCBjb2x1bW5UeXBlICksIGBpbnZhbGlkIGNvbHVtblR5cGU6ICR7Y29sdW1uVHlwZX1gICk7XHJcblxyXG4gICAgLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gdGhhdCBnZXRzIHRoZSBsYWJlbCBmb3IgYSBjb21wb25lbnQgQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZS5cclxuICAgIGNvbnN0IGdldENvbXBvbmVudExhYmVsID0gKCBsYWJlbCwgY29tcG9uZW50ICkgPT4gU3RyaW5nVXRpbHMuZmlsbEluKCBDb2xsaXNpb25MYWJTdHJpbmdzLnBhdHRlcm4uc3ltYm9sU3ViU3ltYm9sLCB7XHJcbiAgICAgIHN5bWJvbDE6IGxhYmVsLFxyXG4gICAgICBzeW1ib2wyOiBjb21wb25lbnRcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIGNvbHVtblR5cGUgPT09IEJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzLlhfUE9TSVRJT04gKSB7XHJcbiAgICAgIHJldHVybiBDb2xsaXNpb25MYWJTdHJpbmdzLnN5bWJvbC54O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGNvbHVtblR5cGUgPT09IEJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzLllfUE9TSVRJT04gKSB7XHJcbiAgICAgIHJldHVybiBDb2xsaXNpb25MYWJTdHJpbmdzLnN5bWJvbC55O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGNvbHVtblR5cGUgPT09IEJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzLlhfVkVMT0NJVFkgKSB7XHJcbiAgICAgIHJldHVybiBnZXRDb21wb25lbnRMYWJlbCggQ29sbGlzaW9uTGFiU3RyaW5ncy5zeW1ib2wudmVsb2NpdHksIENvbGxpc2lvbkxhYlN0cmluZ3Muc3ltYm9sLnggKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBjb2x1bW5UeXBlID09PSBCYWxsVmFsdWVzUGFuZWxDb2x1bW5UeXBlcy5ZX1ZFTE9DSVRZICkge1xyXG4gICAgICByZXR1cm4gZ2V0Q29tcG9uZW50TGFiZWwoIENvbGxpc2lvbkxhYlN0cmluZ3Muc3ltYm9sLnZlbG9jaXR5LCBDb2xsaXNpb25MYWJTdHJpbmdzLnN5bWJvbC55ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggY29sdW1uVHlwZSA9PT0gQmFsbFZhbHVlc1BhbmVsQ29sdW1uVHlwZXMuWF9NT01FTlRVTSApIHtcclxuICAgICAgcmV0dXJuIGdldENvbXBvbmVudExhYmVsKCBDb2xsaXNpb25MYWJTdHJpbmdzLnN5bWJvbC5tb21lbnR1bSwgQ29sbGlzaW9uTGFiU3RyaW5ncy5zeW1ib2wueCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGNvbHVtblR5cGUgPT09IEJhbGxWYWx1ZXNQYW5lbENvbHVtblR5cGVzLllfTU9NRU5UVU0gKSB7XHJcbiAgICAgIHJldHVybiBnZXRDb21wb25lbnRMYWJlbCggQ29sbGlzaW9uTGFiU3RyaW5ncy5zeW1ib2wubW9tZW50dW0sIENvbGxpc2lvbkxhYlN0cmluZ3Muc3ltYm9sLnkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgY29sdW1uIGRvZXNuJ3QgaGF2ZSBhIHNwZWNpZmljIGxhYmVsLCBzbyByZXR1cm4gdGhlIGVtcHR5IHN0cmluZy5cclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnQmFsbFZhbHVlc1BhbmVsQ29sdW1uTm9kZScsIEJhbGxWYWx1ZXNQYW5lbENvbHVtbk5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgQmFsbFZhbHVlc1BhbmVsQ29sdW1uTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxTQUFTQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RSxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLG1CQUFtQixNQUFNLDhCQUE4QjtBQUM5RCxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFDL0QsT0FBT0MsSUFBSSxNQUFNLGtCQUFrQjtBQUNuQyxP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