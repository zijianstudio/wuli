// Copyright 2021-2023, University of Colorado Boulder

/**
 * A LayoutCell that has margins, and can be positioned and sized relative to those. Used for Flow/Grid layouts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import OrientationPair from '../../../../phet-core/js/OrientationPair.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { Font, LayoutAlign, LayoutCell, Node, NodePattern, Path, PressListener, Rectangle, RichText, scenery, Text } from '../../imports.js';

// Interface expected to be overridden by subtypes (GridCell, FlowCell)

// NOTE: This would be an abstract class, but that is incompatible with how mixin constraints work in TypeScript
export default class MarginLayoutCell extends LayoutCell {
  preferredSizeSet = new OrientationPair(false, false);

  // These will get overridden, they're needed since mixins have many limitations and we'd have to have a ton of casts
  // without these existing.
  // (scenery-internal)
  // (scenery-internal) Set to be the bounds available for the cell
  lastAvailableBounds = Bounds2.NOTHING.copy();

  // (scenery-internal) Set to be the bounds used by the cell
  lastUsedBounds = Bounds2.NOTHING.copy();

  /**
   * NOTE: Consider this scenery-internal AND protected. It's effectively a protected constructor for an abstract type,
   * but cannot be due to how mixins constrain things (TypeScript doesn't work with private/protected things like this)
   *
   * (scenery-internal)
   */
  constructor(constraint, node, proxy) {
    super(constraint, node, proxy);
    this._marginConstraint = constraint;
  }

  /**
   * Positions and sizes the cell (used for grid and flow layouts)
   * (scenery-internal)
   *
   * Returns the cell's bounds
   */
  reposition(orientation, lineSize, linePosition, stretch, originOffset, align) {
    // Mimicking https://www.w3.org/TR/css-flexbox-1/#align-items-property for baseline (for our origin)
    // Origin will sync all origin-based items (so their origin matches), and then position ALL of that as if it was
    // align:left or align:top (depending on the orientation).

    const preferredSize = stretch && this.isSizable(orientation) ? lineSize : this.getMinimumSize(orientation);
    this.attemptPreferredSize(orientation, preferredSize);
    if (align === LayoutAlign.ORIGIN) {
      this.positionOrigin(orientation, linePosition + originOffset);
    } else {
      this.positionStart(orientation, linePosition + (lineSize - this.getCellBounds()[orientation.size]) * align.padRatio);
    }
    const cellBounds = this.getCellBounds();
    assert && assert(cellBounds.isFinite());
    this.lastAvailableBounds[orientation.minCoordinate] = linePosition;
    this.lastAvailableBounds[orientation.maxCoordinate] = linePosition + lineSize;
    this.lastUsedBounds.set(cellBounds);
    return cellBounds;
  }

  /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */
  get effectiveLeftMargin() {
    return this._leftMargin !== null ? this._leftMargin : this._marginConstraint._leftMargin;
  }

  /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */
  get effectiveRightMargin() {
    return this._rightMargin !== null ? this._rightMargin : this._marginConstraint._rightMargin;
  }

  /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */
  get effectiveTopMargin() {
    return this._topMargin !== null ? this._topMargin : this._marginConstraint._topMargin;
  }

  /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */
  get effectiveBottomMargin() {
    return this._bottomMargin !== null ? this._bottomMargin : this._marginConstraint._bottomMargin;
  }

  /**
   * (scenery-internal)
   */
  getEffectiveMinMargin(orientation) {
    return orientation === Orientation.HORIZONTAL ? this.effectiveLeftMargin : this.effectiveTopMargin;
  }

  /**
   * (scenery-internal)
   */
  getEffectiveMaxMargin(orientation) {
    return orientation === Orientation.HORIZONTAL ? this.effectiveRightMargin : this.effectiveBottomMargin;
  }

  /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */
  get effectiveMinContentWidth() {
    return this._minContentWidth !== null ? this._minContentWidth : this._marginConstraint._minContentWidth;
  }

  /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */
  get effectiveMinContentHeight() {
    return this._minContentHeight !== null ? this._minContentHeight : this._marginConstraint._minContentHeight;
  }

  /**
   * (scenery-internal)
   */
  getEffectiveMinContent(orientation) {
    return orientation === Orientation.HORIZONTAL ? this.effectiveMinContentWidth : this.effectiveMinContentHeight;
  }

  /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */
  get effectiveMaxContentWidth() {
    return this._maxContentWidth !== null ? this._maxContentWidth : this._marginConstraint._maxContentWidth;
  }

  /**
   * Returns the used value, with this cell's value taking precedence over the constraint's default
   * (scenery-internal)
   */
  get effectiveMaxContentHeight() {
    return this._maxContentHeight !== null ? this._maxContentHeight : this._marginConstraint._maxContentHeight;
  }

  /**
   * (scenery-internal)
   */
  getEffectiveMaxContent(orientation) {
    return orientation === Orientation.HORIZONTAL ? this.effectiveMaxContentWidth : this.effectiveMaxContentHeight;
  }

  /**
   * Returns the effective minimum size this cell can take (including the margins)
   * (scenery-internal)
   */
  getMinimumSize(orientation) {
    return this.getEffectiveMinMargin(orientation) + Math.max(this.proxy.getMinimum(orientation), this.getEffectiveMinContent(orientation) || 0) + this.getEffectiveMaxMargin(orientation);
  }

  /**
   * Returns the effective maximum size this cell can take (including the margins)
   * (scenery-internal)
   */
  getMaximumSize(orientation) {
    return this.getEffectiveMinMargin(orientation) + (this.getEffectiveMaxContent(orientation) || Number.POSITIVE_INFINITY) + this.getEffectiveMaxMargin(orientation);
  }

  /**
   * Sets a preferred size on the content, obeying many constraints.
   * (scenery-internal)
   */
  attemptPreferredSize(orientation, value) {
    if (this.proxy[orientation.sizable]) {
      const minimumSize = this.getMinimumSize(orientation);
      const maximumSize = this.getMaximumSize(orientation);
      assert && assert(isFinite(minimumSize));
      assert && assert(maximumSize >= minimumSize);
      value = Utils.clamp(value, minimumSize, maximumSize);
      let preferredSize = value - this.getEffectiveMinMargin(orientation) - this.getEffectiveMaxMargin(orientation);
      const maxSize = this.proxy.getMax(orientation);
      if (maxSize !== null) {
        preferredSize = Math.min(maxSize, preferredSize);
      }
      this._marginConstraint.setProxyPreferredSize(orientation, this.proxy, preferredSize);

      // Record that we set
      this.preferredSizeSet.set(orientation, true);
    }
  }

  /**
   * Unsets the preferred size (if WE set it)
   * (scenery-internal)
   */
  unsetPreferredSize(orientation) {
    if (this.proxy[orientation.sizable]) {
      this._marginConstraint.setProxyPreferredSize(orientation, this.proxy, null);
    }
  }

  /**
   * Sets the left/top position of the (content+margin) for the cell in the constraint's ancestor coordinate frame.
   * (scenery-internal)
   */
  positionStart(orientation, value) {
    const start = this.getEffectiveMinMargin(orientation) + value;
    this._marginConstraint.setProxyMinSide(orientation, this.proxy, start);
  }

  /**
   * Sets the x/y value of the content for the cell in the constraint's ancestor coordinate frame.
   * (scenery-internal)
   */
  positionOrigin(orientation, value) {
    this._marginConstraint.setProxyOrigin(orientation, this.proxy, value);
  }

  /**
   * Returns the bounding box of the cell if it was repositioned to have its origin shifted to the origin of the
   * ancestor node's local coordinate frame.
   * (scenery-internal)
   */
  getOriginBounds() {
    return this.getCellBounds().shiftedXY(-this.proxy.x, -this.proxy.y);
  }

  /**
   * The current bounds of the cell (with margins included)
   * (scenery-internal)
   */
  getCellBounds() {
    return this.proxy.bounds.withOffsets(this.effectiveLeftMargin, this.effectiveTopMargin, this.effectiveRightMargin, this.effectiveBottomMargin);
  }
  dispose() {
    // Unset the specified preferred sizes that were set by our layout (when we're removed)
    Orientation.enumeration.values.forEach(orientation => {
      if (this.preferredSizeSet.get(orientation)) {
        this.unsetPreferredSize(orientation);
      }
    });
    super.dispose();
  }
  static createHelperNode(cells, layoutBounds, cellToText) {
    const container = new Node();
    const lineWidth = 0.4;
    const availableCellsShape = Shape.union(cells.map(cell => Shape.bounds(cell.lastAvailableBounds)));
    const usedCellsShape = Shape.union(cells.map(cell => Shape.bounds(cell.lastUsedBounds)));
    const usedContentShape = Shape.union(cells.map(cell => Shape.bounds(cell.proxy.bounds)));
    const spacingShape = Shape.bounds(layoutBounds).shapeDifference(availableCellsShape);
    const emptyShape = availableCellsShape.shapeDifference(usedCellsShape);
    const marginShape = usedCellsShape.shapeDifference(usedContentShape);
    const createLabeledTexture = (label, foreground, background) => {
      const text = new Text(label, {
        font: new Font({
          size: 6,
          family: 'monospace'
        }),
        fill: foreground
      });
      const rectangle = Rectangle.bounds(text.bounds, {
        fill: background,
        children: [text]
      });
      return new NodePattern(rectangle, 4, Math.floor(rectangle.left), Math.ceil(rectangle.top + 1), Math.floor(rectangle.width), Math.floor(rectangle.height - 2), Matrix3.rotation2(-Math.PI / 4));
    };
    container.addChild(new Path(spacingShape, {
      fill: createLabeledTexture('spacing', '#000', '#fff'),
      opacity: 0.6
    }));
    container.addChild(new Path(emptyShape, {
      fill: createLabeledTexture('empty', '#aaa', '#000'),
      opacity: 0.6
    }));
    container.addChild(new Path(marginShape, {
      fill: createLabeledTexture('margin', '#600', '#f00'),
      opacity: 0.6
    }));
    container.addChild(Rectangle.bounds(layoutBounds, {
      stroke: 'white',
      lineDash: [2, 2],
      lineDashOffset: 2,
      lineWidth: lineWidth
    }));
    container.addChild(Rectangle.bounds(layoutBounds, {
      stroke: 'black',
      lineDash: [2, 2],
      lineWidth: lineWidth
    }));
    cells.forEach(cell => {
      container.addChild(Rectangle.bounds(cell.getCellBounds(), {
        stroke: 'rgba(0,255,0,1)',
        lineWidth: lineWidth
      }));
    });
    cells.forEach(cell => {
      container.addChild(Rectangle.bounds(cell.proxy.bounds, {
        stroke: 'rgba(255,0,0,1)',
        lineWidth: lineWidth
      }));
    });
    cells.forEach(cell => {
      const bounds = cell.getCellBounds();
      const hoverListener = new PressListener({
        tandem: Tandem.OPT_OUT
      });
      container.addChild(Rectangle.bounds(bounds, {
        inputListeners: [hoverListener]
      }));
      let str = cellToText(cell);
      if (cell.effectiveLeftMargin) {
        str += `leftMargin: ${cell.effectiveLeftMargin}\n`;
      }
      if (cell.effectiveRightMargin) {
        str += `rightMargin: ${cell.effectiveRightMargin}\n`;
      }
      if (cell.effectiveTopMargin) {
        str += `topMargin: ${cell.effectiveTopMargin}\n`;
      }
      if (cell.effectiveBottomMargin) {
        str += `bottomMargin: ${cell.effectiveBottomMargin}\n`;
      }
      if (cell.effectiveMinContentWidth) {
        str += `minContentWidth: ${cell.effectiveMinContentWidth}\n`;
      }
      if (cell.effectiveMinContentHeight) {
        str += `minContentHeight: ${cell.effectiveMinContentHeight}\n`;
      }
      if (cell.effectiveMaxContentWidth) {
        str += `maxContentWidth: ${cell.effectiveMaxContentWidth}\n`;
      }
      if (cell.effectiveMaxContentHeight) {
        str += `maxContentHeight: ${cell.effectiveMaxContentHeight}\n`;
      }
      str += `layoutOptions: ${JSON.stringify(cell.node.layoutOptions, null, 2).replace(/ /g, '&nbsp;')}\n`;
      const hoverText = new RichText(str.trim().replace(/\n/g, '<br>'), {
        font: new Font({
          size: 12
        })
      });
      const hoverNode = Rectangle.bounds(hoverText.bounds.dilated(3), {
        fill: 'rgba(255,255,255,0.8)',
        children: [hoverText],
        leftTop: bounds.leftTop
      });
      container.addChild(hoverNode);
      hoverListener.isOverProperty.link(isOver => {
        hoverNode.visible = isOver;
      });
    });
    return container;
  }
}
scenery.register('MarginLayoutCell', MarginLayoutCell);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlV0aWxzIiwiU2hhcGUiLCJPcmllbnRhdGlvbiIsIk9yaWVudGF0aW9uUGFpciIsIlRhbmRlbSIsIkZvbnQiLCJMYXlvdXRBbGlnbiIsIkxheW91dENlbGwiLCJOb2RlIiwiTm9kZVBhdHRlcm4iLCJQYXRoIiwiUHJlc3NMaXN0ZW5lciIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0Iiwic2NlbmVyeSIsIlRleHQiLCJNYXJnaW5MYXlvdXRDZWxsIiwicHJlZmVycmVkU2l6ZVNldCIsImxhc3RBdmFpbGFibGVCb3VuZHMiLCJOT1RISU5HIiwiY29weSIsImxhc3RVc2VkQm91bmRzIiwiY29uc3RydWN0b3IiLCJjb25zdHJhaW50Iiwibm9kZSIsInByb3h5IiwiX21hcmdpbkNvbnN0cmFpbnQiLCJyZXBvc2l0aW9uIiwib3JpZW50YXRpb24iLCJsaW5lU2l6ZSIsImxpbmVQb3NpdGlvbiIsInN0cmV0Y2giLCJvcmlnaW5PZmZzZXQiLCJhbGlnbiIsInByZWZlcnJlZFNpemUiLCJpc1NpemFibGUiLCJnZXRNaW5pbXVtU2l6ZSIsImF0dGVtcHRQcmVmZXJyZWRTaXplIiwiT1JJR0lOIiwicG9zaXRpb25PcmlnaW4iLCJwb3NpdGlvblN0YXJ0IiwiZ2V0Q2VsbEJvdW5kcyIsInNpemUiLCJwYWRSYXRpbyIsImNlbGxCb3VuZHMiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsIm1pbkNvb3JkaW5hdGUiLCJtYXhDb29yZGluYXRlIiwic2V0IiwiZWZmZWN0aXZlTGVmdE1hcmdpbiIsIl9sZWZ0TWFyZ2luIiwiZWZmZWN0aXZlUmlnaHRNYXJnaW4iLCJfcmlnaHRNYXJnaW4iLCJlZmZlY3RpdmVUb3BNYXJnaW4iLCJfdG9wTWFyZ2luIiwiZWZmZWN0aXZlQm90dG9tTWFyZ2luIiwiX2JvdHRvbU1hcmdpbiIsImdldEVmZmVjdGl2ZU1pbk1hcmdpbiIsIkhPUklaT05UQUwiLCJnZXRFZmZlY3RpdmVNYXhNYXJnaW4iLCJlZmZlY3RpdmVNaW5Db250ZW50V2lkdGgiLCJfbWluQ29udGVudFdpZHRoIiwiZWZmZWN0aXZlTWluQ29udGVudEhlaWdodCIsIl9taW5Db250ZW50SGVpZ2h0IiwiZ2V0RWZmZWN0aXZlTWluQ29udGVudCIsImVmZmVjdGl2ZU1heENvbnRlbnRXaWR0aCIsIl9tYXhDb250ZW50V2lkdGgiLCJlZmZlY3RpdmVNYXhDb250ZW50SGVpZ2h0IiwiX21heENvbnRlbnRIZWlnaHQiLCJnZXRFZmZlY3RpdmVNYXhDb250ZW50IiwiTWF0aCIsIm1heCIsImdldE1pbmltdW0iLCJnZXRNYXhpbXVtU2l6ZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwidmFsdWUiLCJzaXphYmxlIiwibWluaW11bVNpemUiLCJtYXhpbXVtU2l6ZSIsImNsYW1wIiwibWF4U2l6ZSIsImdldE1heCIsIm1pbiIsInNldFByb3h5UHJlZmVycmVkU2l6ZSIsInVuc2V0UHJlZmVycmVkU2l6ZSIsInN0YXJ0Iiwic2V0UHJveHlNaW5TaWRlIiwic2V0UHJveHlPcmlnaW4iLCJnZXRPcmlnaW5Cb3VuZHMiLCJzaGlmdGVkWFkiLCJ4IiwieSIsImJvdW5kcyIsIndpdGhPZmZzZXRzIiwiZGlzcG9zZSIsImVudW1lcmF0aW9uIiwidmFsdWVzIiwiZm9yRWFjaCIsImdldCIsImNyZWF0ZUhlbHBlck5vZGUiLCJjZWxscyIsImxheW91dEJvdW5kcyIsImNlbGxUb1RleHQiLCJjb250YWluZXIiLCJsaW5lV2lkdGgiLCJhdmFpbGFibGVDZWxsc1NoYXBlIiwidW5pb24iLCJtYXAiLCJjZWxsIiwidXNlZENlbGxzU2hhcGUiLCJ1c2VkQ29udGVudFNoYXBlIiwic3BhY2luZ1NoYXBlIiwic2hhcGVEaWZmZXJlbmNlIiwiZW1wdHlTaGFwZSIsIm1hcmdpblNoYXBlIiwiY3JlYXRlTGFiZWxlZFRleHR1cmUiLCJsYWJlbCIsImZvcmVncm91bmQiLCJiYWNrZ3JvdW5kIiwidGV4dCIsImZvbnQiLCJmYW1pbHkiLCJmaWxsIiwicmVjdGFuZ2xlIiwiY2hpbGRyZW4iLCJmbG9vciIsImxlZnQiLCJjZWlsIiwidG9wIiwid2lkdGgiLCJoZWlnaHQiLCJyb3RhdGlvbjIiLCJQSSIsImFkZENoaWxkIiwib3BhY2l0eSIsInN0cm9rZSIsImxpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJob3Zlckxpc3RlbmVyIiwidGFuZGVtIiwiT1BUX09VVCIsImlucHV0TGlzdGVuZXJzIiwic3RyIiwiSlNPTiIsInN0cmluZ2lmeSIsImxheW91dE9wdGlvbnMiLCJyZXBsYWNlIiwiaG92ZXJUZXh0IiwidHJpbSIsImhvdmVyTm9kZSIsImRpbGF0ZWQiLCJsZWZ0VG9wIiwiaXNPdmVyUHJvcGVydHkiLCJsaW5rIiwiaXNPdmVyIiwidmlzaWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFyZ2luTGF5b3V0Q2VsbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIExheW91dENlbGwgdGhhdCBoYXMgbWFyZ2lucywgYW5kIGNhbiBiZSBwb3NpdGlvbmVkIGFuZCBzaXplZCByZWxhdGl2ZSB0byB0aG9zZS4gVXNlZCBmb3IgRmxvdy9HcmlkIGxheW91dHNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IE9yaWVudGF0aW9uUGFpciBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb25QYWlyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IHsgRm9udCwgVENvbG9yLCBMYXlvdXRBbGlnbiwgTGF5b3V0Q2VsbCwgTGF5b3V0UHJveHksIE5vZGUsIE5vZGVMYXlvdXRDb25zdHJhaW50LCBOb2RlUGF0dGVybiwgUGF0aCwgUHJlc3NMaXN0ZW5lciwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgc2NlbmVyeSwgVGV4dCB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xyXG5cclxuLy8gSW50ZXJmYWNlIGV4cGVjdGVkIHRvIGJlIG92ZXJyaWRkZW4gYnkgc3VidHlwZXMgKEdyaWRDZWxsLCBGbG93Q2VsbClcclxuZXhwb3J0IHR5cGUgTWFyZ2luTGF5b3V0ID0ge1xyXG4gIF9sZWZ0TWFyZ2luOiBudW1iZXIgfCBudWxsO1xyXG4gIF9yaWdodE1hcmdpbjogbnVtYmVyIHwgbnVsbDtcclxuICBfdG9wTWFyZ2luOiBudW1iZXIgfCBudWxsO1xyXG4gIF9ib3R0b21NYXJnaW46IG51bWJlciB8IG51bGw7XHJcbiAgX21pbkNvbnRlbnRXaWR0aDogbnVtYmVyIHwgbnVsbDtcclxuICBfbWluQ29udGVudEhlaWdodDogbnVtYmVyIHwgbnVsbDtcclxuICBfbWF4Q29udGVudFdpZHRoOiBudW1iZXIgfCBudWxsO1xyXG4gIF9tYXhDb250ZW50SGVpZ2h0OiBudW1iZXIgfCBudWxsO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTWFyZ2luTGF5b3V0Q29uc3RyYWludCA9IE5vZGVMYXlvdXRDb25zdHJhaW50ICYgTWFyZ2luTGF5b3V0O1xyXG5cclxuLy8gTk9URTogVGhpcyB3b3VsZCBiZSBhbiBhYnN0cmFjdCBjbGFzcywgYnV0IHRoYXQgaXMgaW5jb21wYXRpYmxlIHdpdGggaG93IG1peGluIGNvbnN0cmFpbnRzIHdvcmsgaW4gVHlwZVNjcmlwdFxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXJnaW5MYXlvdXRDZWxsIGV4dGVuZHMgTGF5b3V0Q2VsbCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX21hcmdpbkNvbnN0cmFpbnQ6IE1hcmdpbkxheW91dENvbnN0cmFpbnQ7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlZmVycmVkU2l6ZVNldDogT3JpZW50YXRpb25QYWlyPGJvb2xlYW4+ID0gbmV3IE9yaWVudGF0aW9uUGFpcjxib29sZWFuPiggZmFsc2UsIGZhbHNlICk7XHJcblxyXG4gIC8vIFRoZXNlIHdpbGwgZ2V0IG92ZXJyaWRkZW4sIHRoZXkncmUgbmVlZGVkIHNpbmNlIG1peGlucyBoYXZlIG1hbnkgbGltaXRhdGlvbnMgYW5kIHdlJ2QgaGF2ZSB0byBoYXZlIGEgdG9uIG9mIGNhc3RzXHJcbiAgLy8gd2l0aG91dCB0aGVzZSBleGlzdGluZy5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcclxuICBwdWJsaWMgX2xlZnRNYXJnaW4hOiBudW1iZXIgfCBudWxsO1xyXG4gIHB1YmxpYyBfcmlnaHRNYXJnaW4hOiBudW1iZXIgfCBudWxsO1xyXG4gIHB1YmxpYyBfdG9wTWFyZ2luITogbnVtYmVyIHwgbnVsbDtcclxuICBwdWJsaWMgX2JvdHRvbU1hcmdpbiE6IG51bWJlciB8IG51bGw7XHJcbiAgcHVibGljIF9taW5Db250ZW50V2lkdGghOiBudW1iZXIgfCBudWxsO1xyXG4gIHB1YmxpYyBfbWluQ29udGVudEhlaWdodCE6IG51bWJlciB8IG51bGw7XHJcbiAgcHVibGljIF9tYXhDb250ZW50V2lkdGghOiBudW1iZXIgfCBudWxsO1xyXG4gIHB1YmxpYyBfbWF4Q29udGVudEhlaWdodCE6IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKSBTZXQgdG8gYmUgdGhlIGJvdW5kcyBhdmFpbGFibGUgZm9yIHRoZSBjZWxsXHJcbiAgcHVibGljIGxhc3RBdmFpbGFibGVCb3VuZHM6IEJvdW5kczIgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG5cclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgU2V0IHRvIGJlIHRoZSBib3VuZHMgdXNlZCBieSB0aGUgY2VsbFxyXG4gIHB1YmxpYyBsYXN0VXNlZEJvdW5kczogQm91bmRzMiA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5PVEU6IENvbnNpZGVyIHRoaXMgc2NlbmVyeS1pbnRlcm5hbCBBTkQgcHJvdGVjdGVkLiBJdCdzIGVmZmVjdGl2ZWx5IGEgcHJvdGVjdGVkIGNvbnN0cnVjdG9yIGZvciBhbiBhYnN0cmFjdCB0eXBlLFxyXG4gICAqIGJ1dCBjYW5ub3QgYmUgZHVlIHRvIGhvdyBtaXhpbnMgY29uc3RyYWluIHRoaW5ncyAoVHlwZVNjcmlwdCBkb2Vzbid0IHdvcmsgd2l0aCBwcml2YXRlL3Byb3RlY3RlZCB0aGluZ3MgbGlrZSB0aGlzKVxyXG4gICAqXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb25zdHJhaW50OiBNYXJnaW5MYXlvdXRDb25zdHJhaW50LCBub2RlOiBOb2RlLCBwcm94eTogTGF5b3V0UHJveHkgfCBudWxsICkge1xyXG4gICAgc3VwZXIoIGNvbnN0cmFpbnQsIG5vZGUsIHByb3h5ICk7XHJcblxyXG4gICAgdGhpcy5fbWFyZ2luQ29uc3RyYWludCA9IGNvbnN0cmFpbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQb3NpdGlvbnMgYW5kIHNpemVzIHRoZSBjZWxsICh1c2VkIGZvciBncmlkIGFuZCBmbG93IGxheW91dHMpXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBSZXR1cm5zIHRoZSBjZWxsJ3MgYm91bmRzXHJcbiAgICovXHJcbiAgcHVibGljIHJlcG9zaXRpb24oIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgbGluZVNpemU6IG51bWJlciwgbGluZVBvc2l0aW9uOiBudW1iZXIsIHN0cmV0Y2g6IGJvb2xlYW4sIG9yaWdpbk9mZnNldDogbnVtYmVyLCBhbGlnbjogTGF5b3V0QWxpZ24gKTogQm91bmRzMiB7XHJcbiAgICAvLyBNaW1pY2tpbmcgaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1mbGV4Ym94LTEvI2FsaWduLWl0ZW1zLXByb3BlcnR5IGZvciBiYXNlbGluZSAoZm9yIG91ciBvcmlnaW4pXHJcbiAgICAvLyBPcmlnaW4gd2lsbCBzeW5jIGFsbCBvcmlnaW4tYmFzZWQgaXRlbXMgKHNvIHRoZWlyIG9yaWdpbiBtYXRjaGVzKSwgYW5kIHRoZW4gcG9zaXRpb24gQUxMIG9mIHRoYXQgYXMgaWYgaXQgd2FzXHJcbiAgICAvLyBhbGlnbjpsZWZ0IG9yIGFsaWduOnRvcCAoZGVwZW5kaW5nIG9uIHRoZSBvcmllbnRhdGlvbikuXHJcblxyXG4gICAgY29uc3QgcHJlZmVycmVkU2l6ZSA9ICggc3RyZXRjaCAmJiB0aGlzLmlzU2l6YWJsZSggb3JpZW50YXRpb24gKSApID8gbGluZVNpemUgOiB0aGlzLmdldE1pbmltdW1TaXplKCBvcmllbnRhdGlvbiApO1xyXG5cclxuICAgIHRoaXMuYXR0ZW1wdFByZWZlcnJlZFNpemUoIG9yaWVudGF0aW9uLCBwcmVmZXJyZWRTaXplICk7XHJcblxyXG4gICAgaWYgKCBhbGlnbiA9PT0gTGF5b3V0QWxpZ24uT1JJR0lOICkge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uT3JpZ2luKCBvcmllbnRhdGlvbiwgbGluZVBvc2l0aW9uICsgb3JpZ2luT2Zmc2V0ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5wb3NpdGlvblN0YXJ0KCBvcmllbnRhdGlvbiwgbGluZVBvc2l0aW9uICsgKCBsaW5lU2l6ZSAtIHRoaXMuZ2V0Q2VsbEJvdW5kcygpWyBvcmllbnRhdGlvbi5zaXplIF0gKSAqIGFsaWduLnBhZFJhdGlvICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2VsbEJvdW5kcyA9IHRoaXMuZ2V0Q2VsbEJvdW5kcygpO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNlbGxCb3VuZHMuaXNGaW5pdGUoKSApO1xyXG5cclxuICAgIHRoaXMubGFzdEF2YWlsYWJsZUJvdW5kc1sgb3JpZW50YXRpb24ubWluQ29vcmRpbmF0ZSBdID0gbGluZVBvc2l0aW9uO1xyXG4gICAgdGhpcy5sYXN0QXZhaWxhYmxlQm91bmRzWyBvcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0gPSBsaW5lUG9zaXRpb24gKyBsaW5lU2l6ZTtcclxuICAgIHRoaXMubGFzdFVzZWRCb3VuZHMuc2V0KCBjZWxsQm91bmRzICk7XHJcblxyXG4gICAgcmV0dXJuIGNlbGxCb3VuZHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB1c2VkIHZhbHVlLCB3aXRoIHRoaXMgY2VsbCdzIHZhbHVlIHRha2luZyBwcmVjZWRlbmNlIG92ZXIgdGhlIGNvbnN0cmFpbnQncyBkZWZhdWx0XHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBlZmZlY3RpdmVMZWZ0TWFyZ2luKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGVmdE1hcmdpbiAhPT0gbnVsbCA/IHRoaXMuX2xlZnRNYXJnaW4gOiB0aGlzLl9tYXJnaW5Db25zdHJhaW50Ll9sZWZ0TWFyZ2luITtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHVzZWQgdmFsdWUsIHdpdGggdGhpcyBjZWxsJ3MgdmFsdWUgdGFraW5nIHByZWNlZGVuY2Ugb3ZlciB0aGUgY29uc3RyYWludCdzIGRlZmF1bHRcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGVmZmVjdGl2ZVJpZ2h0TWFyZ2luKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmlnaHRNYXJnaW4gIT09IG51bGwgPyB0aGlzLl9yaWdodE1hcmdpbiA6IHRoaXMuX21hcmdpbkNvbnN0cmFpbnQuX3JpZ2h0TWFyZ2luITtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHVzZWQgdmFsdWUsIHdpdGggdGhpcyBjZWxsJ3MgdmFsdWUgdGFraW5nIHByZWNlZGVuY2Ugb3ZlciB0aGUgY29uc3RyYWludCdzIGRlZmF1bHRcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGVmZmVjdGl2ZVRvcE1hcmdpbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RvcE1hcmdpbiAhPT0gbnVsbCA/IHRoaXMuX3RvcE1hcmdpbiA6IHRoaXMuX21hcmdpbkNvbnN0cmFpbnQuX3RvcE1hcmdpbiE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB1c2VkIHZhbHVlLCB3aXRoIHRoaXMgY2VsbCdzIHZhbHVlIHRha2luZyBwcmVjZWRlbmNlIG92ZXIgdGhlIGNvbnN0cmFpbnQncyBkZWZhdWx0XHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBlZmZlY3RpdmVCb3R0b21NYXJnaW4oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9ib3R0b21NYXJnaW4gIT09IG51bGwgPyB0aGlzLl9ib3R0b21NYXJnaW4gOiB0aGlzLl9tYXJnaW5Db25zdHJhaW50Ll9ib3R0b21NYXJnaW4hO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGdldEVmZmVjdGl2ZU1pbk1hcmdpbiggb3JpZW50YXRpb246IE9yaWVudGF0aW9uICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyB0aGlzLmVmZmVjdGl2ZUxlZnRNYXJnaW4gOiB0aGlzLmVmZmVjdGl2ZVRvcE1hcmdpbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRFZmZlY3RpdmVNYXhNYXJnaW4oIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMID8gdGhpcy5lZmZlY3RpdmVSaWdodE1hcmdpbiA6IHRoaXMuZWZmZWN0aXZlQm90dG9tTWFyZ2luO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdXNlZCB2YWx1ZSwgd2l0aCB0aGlzIGNlbGwncyB2YWx1ZSB0YWtpbmcgcHJlY2VkZW5jZSBvdmVyIHRoZSBjb25zdHJhaW50J3MgZGVmYXVsdFxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZWZmZWN0aXZlTWluQ29udGVudFdpZHRoKCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX21pbkNvbnRlbnRXaWR0aCAhPT0gbnVsbCA/IHRoaXMuX21pbkNvbnRlbnRXaWR0aCA6IHRoaXMuX21hcmdpbkNvbnN0cmFpbnQuX21pbkNvbnRlbnRXaWR0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHVzZWQgdmFsdWUsIHdpdGggdGhpcyBjZWxsJ3MgdmFsdWUgdGFraW5nIHByZWNlZGVuY2Ugb3ZlciB0aGUgY29uc3RyYWludCdzIGRlZmF1bHRcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGVmZmVjdGl2ZU1pbkNvbnRlbnRIZWlnaHQoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbWluQ29udGVudEhlaWdodCAhPT0gbnVsbCA/IHRoaXMuX21pbkNvbnRlbnRIZWlnaHQgOiB0aGlzLl9tYXJnaW5Db25zdHJhaW50Ll9taW5Db250ZW50SGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGdldEVmZmVjdGl2ZU1pbkNvbnRlbnQoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXIgfCBudWxsIHtcclxuICAgIHJldHVybiBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/IHRoaXMuZWZmZWN0aXZlTWluQ29udGVudFdpZHRoIDogdGhpcy5lZmZlY3RpdmVNaW5Db250ZW50SGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdXNlZCB2YWx1ZSwgd2l0aCB0aGlzIGNlbGwncyB2YWx1ZSB0YWtpbmcgcHJlY2VkZW5jZSBvdmVyIHRoZSBjb25zdHJhaW50J3MgZGVmYXVsdFxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZWZmZWN0aXZlTWF4Q29udGVudFdpZHRoKCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX21heENvbnRlbnRXaWR0aCAhPT0gbnVsbCA/IHRoaXMuX21heENvbnRlbnRXaWR0aCA6IHRoaXMuX21hcmdpbkNvbnN0cmFpbnQuX21heENvbnRlbnRXaWR0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHVzZWQgdmFsdWUsIHdpdGggdGhpcyBjZWxsJ3MgdmFsdWUgdGFraW5nIHByZWNlZGVuY2Ugb3ZlciB0aGUgY29uc3RyYWludCdzIGRlZmF1bHRcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGVmZmVjdGl2ZU1heENvbnRlbnRIZWlnaHQoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbWF4Q29udGVudEhlaWdodCAhPT0gbnVsbCA/IHRoaXMuX21heENvbnRlbnRIZWlnaHQgOiB0aGlzLl9tYXJnaW5Db25zdHJhaW50Ll9tYXhDb250ZW50SGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGdldEVmZmVjdGl2ZU1heENvbnRlbnQoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXIgfCBudWxsIHtcclxuICAgIHJldHVybiBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/IHRoaXMuZWZmZWN0aXZlTWF4Q29udGVudFdpZHRoIDogdGhpcy5lZmZlY3RpdmVNYXhDb250ZW50SGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZWZmZWN0aXZlIG1pbmltdW0gc2l6ZSB0aGlzIGNlbGwgY2FuIHRha2UgKGluY2x1ZGluZyB0aGUgbWFyZ2lucylcclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TWluaW11bVNpemUoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0RWZmZWN0aXZlTWluTWFyZ2luKCBvcmllbnRhdGlvbiApICtcclxuICAgICAgICAgICBNYXRoLm1heCggdGhpcy5wcm94eS5nZXRNaW5pbXVtKCBvcmllbnRhdGlvbiApLCB0aGlzLmdldEVmZmVjdGl2ZU1pbkNvbnRlbnQoIG9yaWVudGF0aW9uICkgfHwgMCApICtcclxuICAgICAgICAgICB0aGlzLmdldEVmZmVjdGl2ZU1heE1hcmdpbiggb3JpZW50YXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGVmZmVjdGl2ZSBtYXhpbXVtIHNpemUgdGhpcyBjZWxsIGNhbiB0YWtlIChpbmNsdWRpbmcgdGhlIG1hcmdpbnMpXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGdldE1heGltdW1TaXplKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldEVmZmVjdGl2ZU1pbk1hcmdpbiggb3JpZW50YXRpb24gKSArXHJcbiAgICAgICAgICAgKCB0aGlzLmdldEVmZmVjdGl2ZU1heENvbnRlbnQoIG9yaWVudGF0aW9uICkgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICkgK1xyXG4gICAgICAgICAgIHRoaXMuZ2V0RWZmZWN0aXZlTWF4TWFyZ2luKCBvcmllbnRhdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhIHByZWZlcnJlZCBzaXplIG9uIHRoZSBjb250ZW50LCBvYmV5aW5nIG1hbnkgY29uc3RyYWludHMuXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGF0dGVtcHRQcmVmZXJyZWRTaXplKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24sIHZhbHVlOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMucHJveHlbIG9yaWVudGF0aW9uLnNpemFibGUgXSApIHtcclxuICAgICAgY29uc3QgbWluaW11bVNpemUgPSB0aGlzLmdldE1pbmltdW1TaXplKCBvcmllbnRhdGlvbiApO1xyXG4gICAgICBjb25zdCBtYXhpbXVtU2l6ZSA9IHRoaXMuZ2V0TWF4aW11bVNpemUoIG9yaWVudGF0aW9uICk7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggbWluaW11bVNpemUgKSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXhpbXVtU2l6ZSA+PSBtaW5pbXVtU2l6ZSApO1xyXG5cclxuICAgICAgdmFsdWUgPSBVdGlscy5jbGFtcCggdmFsdWUsIG1pbmltdW1TaXplLCBtYXhpbXVtU2l6ZSApO1xyXG5cclxuICAgICAgbGV0IHByZWZlcnJlZFNpemUgPSB2YWx1ZSAtIHRoaXMuZ2V0RWZmZWN0aXZlTWluTWFyZ2luKCBvcmllbnRhdGlvbiApIC0gdGhpcy5nZXRFZmZlY3RpdmVNYXhNYXJnaW4oIG9yaWVudGF0aW9uICk7XHJcbiAgICAgIGNvbnN0IG1heFNpemUgPSB0aGlzLnByb3h5LmdldE1heCggb3JpZW50YXRpb24gKTtcclxuICAgICAgaWYgKCBtYXhTaXplICE9PSBudWxsICkge1xyXG4gICAgICAgIHByZWZlcnJlZFNpemUgPSBNYXRoLm1pbiggbWF4U2l6ZSwgcHJlZmVycmVkU2l6ZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9tYXJnaW5Db25zdHJhaW50LnNldFByb3h5UHJlZmVycmVkU2l6ZSggb3JpZW50YXRpb24sIHRoaXMucHJveHksIHByZWZlcnJlZFNpemUgKTtcclxuXHJcbiAgICAgIC8vIFJlY29yZCB0aGF0IHdlIHNldFxyXG4gICAgICB0aGlzLnByZWZlcnJlZFNpemVTZXQuc2V0KCBvcmllbnRhdGlvbiwgdHJ1ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW5zZXRzIHRoZSBwcmVmZXJyZWQgc2l6ZSAoaWYgV0Ugc2V0IGl0KVxyXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqL1xyXG4gIHB1YmxpYyB1bnNldFByZWZlcnJlZFNpemUoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5wcm94eVsgb3JpZW50YXRpb24uc2l6YWJsZSBdICkge1xyXG4gICAgICB0aGlzLl9tYXJnaW5Db25zdHJhaW50LnNldFByb3h5UHJlZmVycmVkU2l6ZSggb3JpZW50YXRpb24sIHRoaXMucHJveHksIG51bGwgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGxlZnQvdG9wIHBvc2l0aW9uIG9mIHRoZSAoY29udGVudCttYXJnaW4pIGZvciB0aGUgY2VsbCBpbiB0aGUgY29uc3RyYWludCdzIGFuY2VzdG9yIGNvb3JkaW5hdGUgZnJhbWUuXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHBvc2l0aW9uU3RhcnQoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgdmFsdWU6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRFZmZlY3RpdmVNaW5NYXJnaW4oIG9yaWVudGF0aW9uICkgKyB2YWx1ZTtcclxuXHJcbiAgICB0aGlzLl9tYXJnaW5Db25zdHJhaW50LnNldFByb3h5TWluU2lkZSggb3JpZW50YXRpb24sIHRoaXMucHJveHksIHN0YXJ0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB4L3kgdmFsdWUgb2YgdGhlIGNvbnRlbnQgZm9yIHRoZSBjZWxsIGluIHRoZSBjb25zdHJhaW50J3MgYW5jZXN0b3IgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgcG9zaXRpb25PcmlnaW4oIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgdmFsdWU6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuX21hcmdpbkNvbnN0cmFpbnQuc2V0UHJveHlPcmlnaW4oIG9yaWVudGF0aW9uLCB0aGlzLnByb3h5LCB2YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYm91bmRpbmcgYm94IG9mIHRoZSBjZWxsIGlmIGl0IHdhcyByZXBvc2l0aW9uZWQgdG8gaGF2ZSBpdHMgb3JpZ2luIHNoaWZ0ZWQgdG8gdGhlIG9yaWdpbiBvZiB0aGVcclxuICAgKiBhbmNlc3RvciBub2RlJ3MgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0T3JpZ2luQm91bmRzKCk6IEJvdW5kczIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VsbEJvdW5kcygpLnNoaWZ0ZWRYWSggLXRoaXMucHJveHkueCwgLXRoaXMucHJveHkueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGN1cnJlbnQgYm91bmRzIG9mIHRoZSBjZWxsICh3aXRoIG1hcmdpbnMgaW5jbHVkZWQpXHJcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIGdldENlbGxCb3VuZHMoKTogQm91bmRzMiB7XHJcbiAgICByZXR1cm4gdGhpcy5wcm94eS5ib3VuZHMud2l0aE9mZnNldHMoXHJcbiAgICAgIHRoaXMuZWZmZWN0aXZlTGVmdE1hcmdpbixcclxuICAgICAgdGhpcy5lZmZlY3RpdmVUb3BNYXJnaW4sXHJcbiAgICAgIHRoaXMuZWZmZWN0aXZlUmlnaHRNYXJnaW4sXHJcbiAgICAgIHRoaXMuZWZmZWN0aXZlQm90dG9tTWFyZ2luXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAvLyBVbnNldCB0aGUgc3BlY2lmaWVkIHByZWZlcnJlZCBzaXplcyB0aGF0IHdlcmUgc2V0IGJ5IG91ciBsYXlvdXQgKHdoZW4gd2UncmUgcmVtb3ZlZClcclxuICAgIE9yaWVudGF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcy5mb3JFYWNoKCBvcmllbnRhdGlvbiA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5wcmVmZXJyZWRTaXplU2V0LmdldCggb3JpZW50YXRpb24gKSApIHtcclxuICAgICAgICB0aGlzLnVuc2V0UHJlZmVycmVkU2l6ZSggb3JpZW50YXRpb24gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlSGVscGVyTm9kZTxDZWxsIGV4dGVuZHMgTWFyZ2luTGF5b3V0Q2VsbD4oIGNlbGxzOiBDZWxsW10sIGxheW91dEJvdW5kczogQm91bmRzMiwgY2VsbFRvVGV4dDogKCBjZWxsOiBDZWxsICkgPT4gc3RyaW5nICk6IE5vZGUge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IGxpbmVXaWR0aCA9IDAuNDtcclxuXHJcbiAgICBjb25zdCBhdmFpbGFibGVDZWxsc1NoYXBlID0gU2hhcGUudW5pb24oIGNlbGxzLm1hcCggY2VsbCA9PiBTaGFwZS5ib3VuZHMoIGNlbGwubGFzdEF2YWlsYWJsZUJvdW5kcyApICkgKTtcclxuICAgIGNvbnN0IHVzZWRDZWxsc1NoYXBlID0gU2hhcGUudW5pb24oIGNlbGxzLm1hcCggY2VsbCA9PiBTaGFwZS5ib3VuZHMoIGNlbGwubGFzdFVzZWRCb3VuZHMgKSApICk7XHJcbiAgICBjb25zdCB1c2VkQ29udGVudFNoYXBlID0gU2hhcGUudW5pb24oIGNlbGxzLm1hcCggY2VsbCA9PiBTaGFwZS5ib3VuZHMoIGNlbGwucHJveHkuYm91bmRzICkgKSApO1xyXG4gICAgY29uc3Qgc3BhY2luZ1NoYXBlID0gU2hhcGUuYm91bmRzKCBsYXlvdXRCb3VuZHMgKS5zaGFwZURpZmZlcmVuY2UoIGF2YWlsYWJsZUNlbGxzU2hhcGUgKTtcclxuICAgIGNvbnN0IGVtcHR5U2hhcGUgPSBhdmFpbGFibGVDZWxsc1NoYXBlLnNoYXBlRGlmZmVyZW5jZSggdXNlZENlbGxzU2hhcGUgKTtcclxuICAgIGNvbnN0IG1hcmdpblNoYXBlID0gdXNlZENlbGxzU2hhcGUuc2hhcGVEaWZmZXJlbmNlKCB1c2VkQ29udGVudFNoYXBlICk7XHJcblxyXG4gICAgY29uc3QgY3JlYXRlTGFiZWxlZFRleHR1cmUgPSAoIGxhYmVsOiBzdHJpbmcsIGZvcmVncm91bmQ6IFRDb2xvciwgYmFja2dyb3VuZDogVENvbG9yICkgPT4ge1xyXG4gICAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHQoIGxhYmVsLCB7XHJcbiAgICAgICAgZm9udDogbmV3IEZvbnQoIHsgc2l6ZTogNiwgZmFtaWx5OiAnbW9ub3NwYWNlJyB9ICksXHJcbiAgICAgICAgZmlsbDogZm9yZWdyb3VuZFxyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IHJlY3RhbmdsZSA9IFJlY3RhbmdsZS5ib3VuZHMoIHRleHQuYm91bmRzLCB7XHJcbiAgICAgICAgZmlsbDogYmFja2dyb3VuZCxcclxuICAgICAgICBjaGlsZHJlbjogWyB0ZXh0IF1cclxuICAgICAgfSApO1xyXG4gICAgICByZXR1cm4gbmV3IE5vZGVQYXR0ZXJuKFxyXG4gICAgICAgIHJlY3RhbmdsZSxcclxuICAgICAgICA0LFxyXG4gICAgICAgIE1hdGguZmxvb3IoIHJlY3RhbmdsZS5sZWZ0ICksXHJcbiAgICAgICAgTWF0aC5jZWlsKCByZWN0YW5nbGUudG9wICsgMSApLFxyXG4gICAgICAgIE1hdGguZmxvb3IoIHJlY3RhbmdsZS53aWR0aCApLFxyXG4gICAgICAgIE1hdGguZmxvb3IoIHJlY3RhbmdsZS5oZWlnaHQgLSAyICksXHJcbiAgICAgICAgTWF0cml4My5yb3RhdGlvbjIoIC1NYXRoLlBJIC8gNCApXHJcbiAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnRhaW5lci5hZGRDaGlsZCggbmV3IFBhdGgoIHNwYWNpbmdTaGFwZSwge1xyXG4gICAgICBmaWxsOiBjcmVhdGVMYWJlbGVkVGV4dHVyZSggJ3NwYWNpbmcnLCAnIzAwMCcsICcjZmZmJyApLFxyXG4gICAgICBvcGFjaXR5OiAwLjZcclxuICAgIH0gKSApO1xyXG4gICAgY29udGFpbmVyLmFkZENoaWxkKCBuZXcgUGF0aCggZW1wdHlTaGFwZSwge1xyXG4gICAgICBmaWxsOiBjcmVhdGVMYWJlbGVkVGV4dHVyZSggJ2VtcHR5JywgJyNhYWEnLCAnIzAwMCcgKSxcclxuICAgICAgb3BhY2l0eTogMC42XHJcbiAgICB9ICkgKTtcclxuICAgIGNvbnRhaW5lci5hZGRDaGlsZCggbmV3IFBhdGgoIG1hcmdpblNoYXBlLCB7XHJcbiAgICAgIGZpbGw6IGNyZWF0ZUxhYmVsZWRUZXh0dXJlKCAnbWFyZ2luJywgJyM2MDAnLCAnI2YwMCcgKSxcclxuICAgICAgb3BhY2l0eTogMC42XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICBjb250YWluZXIuYWRkQ2hpbGQoIFJlY3RhbmdsZS5ib3VuZHMoIGxheW91dEJvdW5kcywge1xyXG4gICAgICBzdHJva2U6ICd3aGl0ZScsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDIsIDIgXSxcclxuICAgICAgbGluZURhc2hPZmZzZXQ6IDIsXHJcbiAgICAgIGxpbmVXaWR0aDogbGluZVdpZHRoXHJcbiAgICB9ICkgKTtcclxuICAgIGNvbnRhaW5lci5hZGRDaGlsZCggUmVjdGFuZ2xlLmJvdW5kcyggbGF5b3V0Qm91bmRzLCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZURhc2g6IFsgMiwgMiBdLFxyXG4gICAgICBsaW5lV2lkdGg6IGxpbmVXaWR0aFxyXG4gICAgfSApICk7XHJcblxyXG4gICAgY2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgIGNvbnRhaW5lci5hZGRDaGlsZCggUmVjdGFuZ2xlLmJvdW5kcyggY2VsbC5nZXRDZWxsQm91bmRzKCksIHtcclxuICAgICAgICBzdHJva2U6ICdyZ2JhKDAsMjU1LDAsMSknLFxyXG4gICAgICAgIGxpbmVXaWR0aDogbGluZVdpZHRoXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNlbGxzLmZvckVhY2goIGNlbGwgPT4ge1xyXG4gICAgICBjb250YWluZXIuYWRkQ2hpbGQoIFJlY3RhbmdsZS5ib3VuZHMoIGNlbGwucHJveHkuYm91bmRzLCB7XHJcbiAgICAgICAgc3Ryb2tlOiAncmdiYSgyNTUsMCwwLDEpJyxcclxuICAgICAgICBsaW5lV2lkdGg6IGxpbmVXaWR0aFxyXG4gICAgICB9ICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcclxuICAgICAgY29uc3QgYm91bmRzID0gY2VsbC5nZXRDZWxsQm91bmRzKCk7XHJcblxyXG4gICAgICBjb25zdCBob3Zlckxpc3RlbmVyID0gbmV3IFByZXNzTGlzdGVuZXIoIHtcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29udGFpbmVyLmFkZENoaWxkKCBSZWN0YW5nbGUuYm91bmRzKCBib3VuZHMsIHtcclxuICAgICAgICBpbnB1dExpc3RlbmVyczogWyBob3Zlckxpc3RlbmVyIF1cclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICBsZXQgc3RyID0gY2VsbFRvVGV4dCggY2VsbCApO1xyXG5cclxuICAgICAgaWYgKCBjZWxsLmVmZmVjdGl2ZUxlZnRNYXJnaW4gKSB7XHJcbiAgICAgICAgc3RyICs9IGBsZWZ0TWFyZ2luOiAke2NlbGwuZWZmZWN0aXZlTGVmdE1hcmdpbn1cXG5gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggY2VsbC5lZmZlY3RpdmVSaWdodE1hcmdpbiApIHtcclxuICAgICAgICBzdHIgKz0gYHJpZ2h0TWFyZ2luOiAke2NlbGwuZWZmZWN0aXZlUmlnaHRNYXJnaW59XFxuYDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGNlbGwuZWZmZWN0aXZlVG9wTWFyZ2luICkge1xyXG4gICAgICAgIHN0ciArPSBgdG9wTWFyZ2luOiAke2NlbGwuZWZmZWN0aXZlVG9wTWFyZ2lufVxcbmA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBjZWxsLmVmZmVjdGl2ZUJvdHRvbU1hcmdpbiApIHtcclxuICAgICAgICBzdHIgKz0gYGJvdHRvbU1hcmdpbjogJHtjZWxsLmVmZmVjdGl2ZUJvdHRvbU1hcmdpbn1cXG5gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggY2VsbC5lZmZlY3RpdmVNaW5Db250ZW50V2lkdGggKSB7XHJcbiAgICAgICAgc3RyICs9IGBtaW5Db250ZW50V2lkdGg6ICR7Y2VsbC5lZmZlY3RpdmVNaW5Db250ZW50V2lkdGh9XFxuYDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGNlbGwuZWZmZWN0aXZlTWluQ29udGVudEhlaWdodCApIHtcclxuICAgICAgICBzdHIgKz0gYG1pbkNvbnRlbnRIZWlnaHQ6ICR7Y2VsbC5lZmZlY3RpdmVNaW5Db250ZW50SGVpZ2h0fVxcbmA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBjZWxsLmVmZmVjdGl2ZU1heENvbnRlbnRXaWR0aCApIHtcclxuICAgICAgICBzdHIgKz0gYG1heENvbnRlbnRXaWR0aDogJHtjZWxsLmVmZmVjdGl2ZU1heENvbnRlbnRXaWR0aH1cXG5gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggY2VsbC5lZmZlY3RpdmVNYXhDb250ZW50SGVpZ2h0ICkge1xyXG4gICAgICAgIHN0ciArPSBgbWF4Q29udGVudEhlaWdodDogJHtjZWxsLmVmZmVjdGl2ZU1heENvbnRlbnRIZWlnaHR9XFxuYDtcclxuICAgICAgfVxyXG4gICAgICBzdHIgKz0gYGxheW91dE9wdGlvbnM6ICR7SlNPTi5zdHJpbmdpZnkoIGNlbGwubm9kZS5sYXlvdXRPcHRpb25zLCBudWxsLCAyICkucmVwbGFjZSggLyAvZywgJyZuYnNwOycgKX1cXG5gO1xyXG5cclxuICAgICAgY29uc3QgaG92ZXJUZXh0ID0gbmV3IFJpY2hUZXh0KCBzdHIudHJpbSgpLnJlcGxhY2UoIC9cXG4vZywgJzxicj4nICksIHtcclxuICAgICAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiAxMiB9IClcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCBob3Zlck5vZGUgPSBSZWN0YW5nbGUuYm91bmRzKCBob3ZlclRleHQuYm91bmRzLmRpbGF0ZWQoIDMgKSwge1xyXG4gICAgICAgIGZpbGw6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuOCknLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbIGhvdmVyVGV4dCBdLFxyXG4gICAgICAgIGxlZnRUb3A6IGJvdW5kcy5sZWZ0VG9wXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29udGFpbmVyLmFkZENoaWxkKCBob3Zlck5vZGUgKTtcclxuICAgICAgaG92ZXJMaXN0ZW5lci5pc092ZXJQcm9wZXJ0eS5saW5rKCBpc092ZXIgPT4ge1xyXG4gICAgICAgIGhvdmVyTm9kZS52aXNpYmxlID0gaXNPdmVyO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdNYXJnaW5MYXlvdXRDZWxsJywgTWFyZ2luTGF5b3V0Q2VsbCApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLGVBQWUsTUFBTSw2Q0FBNkM7QUFDekUsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxTQUFTQyxJQUFJLEVBQVVDLFdBQVcsRUFBRUMsVUFBVSxFQUFlQyxJQUFJLEVBQXdCQyxXQUFXLEVBQUVDLElBQUksRUFBRUMsYUFBYSxFQUFFQyxTQUFTLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxJQUFJLFFBQVEsa0JBQWtCOztBQUV2TDs7QUFjQTtBQUNBLGVBQWUsTUFBTUMsZ0JBQWdCLFNBQVNULFVBQVUsQ0FBQztFQUl0Q1UsZ0JBQWdCLEdBQTZCLElBQUlkLGVBQWUsQ0FBVyxLQUFLLEVBQUUsS0FBTSxDQUFDOztFQUUxRztFQUNBO0VBQ0E7RUFVQTtFQUNPZSxtQkFBbUIsR0FBWXBCLE9BQU8sQ0FBQ3FCLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDLENBQUM7O0VBRTVEO0VBQ09DLGNBQWMsR0FBWXZCLE9BQU8sQ0FBQ3FCLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDLENBQUM7O0VBRXZEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTRSxXQUFXQSxDQUFFQyxVQUFrQyxFQUFFQyxJQUFVLEVBQUVDLEtBQXlCLEVBQUc7SUFDOUYs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