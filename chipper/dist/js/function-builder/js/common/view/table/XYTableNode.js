// Copyright 2016-2023, University of Colorado Boulder

/**
 * XY table, showing the mapping between input and output values for the functions in the builder.
 *
 * Requirements:
 * Each row is associated with an instance of a Card, and consists of input (x) and output (y) cells.
 * Rows for number cards are inserted in ascending numerical order.
 * Rows for symbolic cards (eg 'x') are appended to the table.
 * When a row is added, it's input cell is visible, it's output cell is invisible.
 * When a row is deleted, rows below it move up (handled automatically by using VBox).
 * The first 'page' in the table contains empty rows, otherwise there are no empty rows.
 * The values in the output cells reflect the functions in the builder.
 *
 * Performance is optimized so that the table synchronizes with the model only while updatesEnabled is true.
 * When updatesEnabled is changed from false to true, anything that is 'dirty' is updated.
 * See updatesEnabled and gridDirty flags.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Node, Path, Rectangle, VBox } from '../../../../../scenery/js/imports.js';
import CarouselButton from '../../../../../sun/js/buttons/CarouselButton.js';
import Animation from '../../../../../twixt/js/Animation.js';
import Easing from '../../../../../twixt/js/Easing.js';
import functionBuilder from '../../../functionBuilder.js';
import FBConstants from '../../FBConstants.js';
import FBQueryParameters from '../../FBQueryParameters.js';
import FBSymbols from '../../FBSymbols.js';
import EquationCard from '../../model/cards/EquationCard.js';
import NumberCard from '../../model/cards/NumberCard.js';
import XYTableHeading from './XYTableHeading.js';
import XYTableRow from './XYTableRow.js';
export default class XYTableNode extends VBox {
  /**
   * @param {Builder} builder
   * @param {Object} [options]
   */
  constructor(builder, options) {
    options = merge({
      size: FBConstants.TABLE_DRAWER_SIZE,
      numberOfRowsVisible: 3,
      // {number} number of rows visible in the scrolling area
      cornerRadius: 0,
      scrollingRegionFill: 'white',
      animationEnabled: true,
      // {boolean} is animation of scrolling enabled?
      updateEnabled: false,
      // {boolean} does this node update when the model changes?

      // column headings
      xSymbol: FBSymbols.X,
      ySymbol: FBSymbols.Y,
      headingFont: FBConstants.TABLE_XY_HEADING_FONT,
      headingYMargin: 2,
      headingBackground: 'rgb( 144, 226, 252 )'
    }, options);

    // options for scroll buttons
    const BUTTON_OPTIONS = {
      fireOnHold: false,
      // because scrolling is animated
      minWidth: options.size.width
    };

    // up button
    const upButton = new CarouselButton(merge({}, BUTTON_OPTIONS, {
      cornerRadius: 0,
      arrowDirection: 'up'
    }));

    // down button
    const downButton = new CarouselButton(merge({}, BUTTON_OPTIONS, {
      cornerRadius: options.cornerRadius,
      arrowDirection: 'down'
    }));

    // button touchAreas
    upButton.touchArea = upButton.localBounds.dilatedXY(10, 5).shiftedY(-5);
    downButton.touchArea = downButton.localBounds.dilatedXY(10, 5).shiftedY(-5);

    // column headings
    const headingNode = new XYTableHeading(options.xSymbol, options.ySymbol, {
      size: new Dimension2(options.size.width, 30),
      font: options.headingFont,
      fill: options.headingBackground,
      cornerRadii: {
        topLeft: options.cornerRadius,
        topRight: options.cornerRadius
      }
    });

    // window that rows scroll in
    const scrollingRegionHeight = options.size.height - headingNode.height - upButton.height - downButton.height;
    const scrollingRegion = new Rectangle(0, 0, options.size.width, scrollingRegionHeight, {
      fill: options.scrollingRegionFill
    });
    scrollingRegion.clipArea = Shape.bounds(scrollingRegion.localBounds);

    // parent for all {XYTableRow} rows, children in the same order as this.cards
    // Do not add anything that is not a XYTableRow to this node!
    const rowsParent = new VBox();

    // grid is drawn separately so we don't have weirdness with cell strokes overlapping
    const gridNode = new Path(null, {
      stroke: 'black',
      lineWidth: 0.5
    });

    // contents of the scrolling region
    const scrollingContents = new Node({
      children: [rowsParent, gridNode]
    });
    scrollingRegion.addChild(scrollingContents); // add after setting clipArea

    assert && assert(!options.children, 'decoration not supported');
    options.children = [headingNode, upButton, scrollingRegion, downButton];
    super(options);

    // @private
    this.builder = builder;
    this.numberOfRowsVisible = options.numberOfRowsVisible;
    this._animationEnabled = options.animationEnabled;
    this._updateEnabled = options.updateEnabled;
    this.gridDirty = true; // {boolean} does the grid need to be updated?
    this.rowsParent = rowsParent;
    this.gridNode = gridNode;
    this.rowSize = new Dimension2(options.size.width, scrollingRegionHeight / options.numberOfRowsVisible);
    if (options.updateEnabled) {
      this.updateGrid();
    }

    // @private number of rows in the table
    this.numberOfRowsProperty = new NumberProperty(0, {
      numberType: 'Integer'
    });

    // @private {Array.<NumberCard|EquationCard>} cards, in the order that they appear in the table
    this.cards = [];

    // @private {Property.<number>} the row number that appears at the top of the table
    this.rowNumberAtTopProperty = new NumberProperty(0, {
      numberType: 'Integer'
    });

    // {Animation} animation that vertically scrolls the rows
    let animation = null;

    // scroll
    // unlink unnecessary, instance owns this property
    this.rowNumberAtTopProperty.link(() => {
      // stop any animation that's in progress
      animation && animation.stop();
      const scrollY = -(this.rowNumberAtTopProperty.get() * this.rowSize.height);
      if (this.visible && this.animationEnabled) {
        // animate scrolling
        animation = new Animation({
          duration: 0.5,
          // seconds
          easing: Easing.QUADRATIC_IN_OUT,
          object: scrollingContents,
          attribute: 'y',
          to: scrollY
        });
        animation.start();
      } else {
        // move immediately, no animation
        scrollingContents.y = scrollY;
      }
    });

    // button state is dependent on number of rows and which rows are visible
    const updateButtonState = () => {
      upButton.enabled = this.rowNumberAtTopProperty.get() !== 0;
      downButton.enabled = this.numberOfRowsProperty.get() - this.rowNumberAtTopProperty.get() > options.numberOfRowsVisible;
    };
    // unlink unnecessary, instance owns these properties
    this.numberOfRowsProperty.link(updateButtonState);
    this.rowNumberAtTopProperty.link(updateButtonState);
    upButton.addListener(() => {
      this.rowNumberAtTopProperty.set(this.rowNumberAtTopProperty.get() - 1);
    });
    downButton.addListener(() => {
      this.rowNumberAtTopProperty.set(this.rowNumberAtTopProperty.get() + 1);
    });
  }

  /**
   * Updates the grid that delineates rows and columns. This grid is drawn separately from cells,
   * so that we don't have to deal with issues related to overlapping strokes around cells.
   * Draw one extra (empty) row so that we don't see a gap when animating after removing the last row.
   *
   * @private
   */
  updateGrid() {
    assert && assert(this.updateEnabled && this.gridDirty);

    // always show 1 page of cells, even if some are empty
    const numberOfRows = Math.max(this.numberOfRowsVisible, this.numberOfRowsProperty.get());
    const gridShape = new Shape();

    // horizontal lines between rows
    for (let i = 1; i < numberOfRows + 1; i++) {
      const y = i * this.rowSize.height;
      gridShape.moveTo(0, y).lineTo(this.rowSize.width, y);
    }

    // vertical line between columns
    const centerX = this.rowSize.width / 2;
    gridShape.moveTo(centerX, 0).lineTo(centerX, (numberOfRows + 1) * this.rowSize.height);
    this.gridNode.shape = gridShape;
    this.gridDirty = false;
  }

  /**
   * Adds a row to the table.
   * For NumberCard, cards are in ascending numeric order.
   * For EquationCard, cards are added to the end.
   *
   * @param {NumberCard|EquationCard} card - card that's associated with the row
   * @public
   */
  addRow(card) {
    assert && assert(!this.containsRow(card));
    assert && assert(card instanceof NumberCard || card instanceof EquationCard);

    // create the row
    const rowNode = new XYTableRow(card, this.builder, {
      size: this.rowSize,
      updateEnabled: this.updateEnabled
    });
    if (card instanceof NumberCard) {
      // Insert number cards in ascending numerical order. Determine insertion index by looking at cards in order,
      // until we encounter a symbolic card (eg, 'x', which is always at the end) or a card with a larger number.
      let insertIndex = this.cards.length;
      for (let i = 0; i < this.cards.length; i++) {
        const someCard = this.cards[i];
        if (someCard instanceof EquationCard || card.rationalNumber.valueOf() < someCard.rationalNumber.valueOf()) {
          insertIndex = i;
          break;
        }
      }
      this.cards.splice(insertIndex, 0, card);
      this.rowsParent.insertChild(insertIndex, rowNode);
    } else if (card instanceof EquationCard) {
      // add 'x' card to end
      this.cards.push(card);
      this.rowsParent.addChild(rowNode);
    } else {
      throw new Error('invalid card type');
    }
    this.numberOfRowsProperty.set(this.numberOfRowsProperty.get() + 1);

    // update the grid
    this.gridDirty = true;
    if (this.updateEnabled) {
      this.updateGrid();
    }
  }

  /**
   * Removes a row from the table. Rows below it move up.
   *
   * @param {NumberCard|EquationCard} card - card that's associated with the row
   * @public
   */
  removeRow(card) {
    const cardIndex = this.cards.indexOf(card);
    assert && assert(cardIndex !== -1);

    // remove card
    this.cards.splice(cardIndex, 1);

    // If the last row is visible at the bottom of the table, disable scrolling animation.
    // This prevents a situation that looks a little odd: rows will move up to reveal an empty
    // row at the bottom, then rows will scroll down.
    const wasAnimationEnabled = this.animationEnabled;
    if (this.rowNumberAtTopProperty.get() === this.numberOfRowsProperty.get() - this.numberOfRowsVisible) {
      this.animationEnabled = false;
    }

    // remove row, rows below it move up automatically since rowsParent is a VBox
    const rowNode = this.rowsParent.getChildAt(cardIndex);
    assert && assert(rowNode instanceof XYTableRow);
    this.rowsParent.removeChild(rowNode);
    rowNode.dispose();
    this.numberOfRowsProperty.set(this.numberOfRowsProperty.get() - 1);

    // update the grid
    this.gridDirty = true;
    if (this.updateEnabled) {
      this.updateGrid();
    }

    // if we're not on the first page, which allows empty rows...
    if (this.rowNumberAtTopProperty.get() !== 0) {
      // if there's an empty row at the bottom of the table, move all rows down
      if (this.numberOfRowsProperty.get() - this.numberOfRowsVisible < this.rowNumberAtTopProperty.get()) {
        this.rowNumberAtTopProperty.set(this.numberOfRowsProperty.get() - this.numberOfRowsVisible);
      }
    }
    this.animationEnabled = wasAnimationEnabled;
  }

  /**
   * Does the table contain a row for the specified card?
   *
   * @param {Card} card
   * @returns {boolean}
   * @public
   */
  containsRow(card) {
    return this.cards.indexOf(card) !== -1;
  }

  /**
   * Sets the visibility of the corresponding output cell.
   *
   * @param {NumberCard|EquationCard} card - card that's associated with the row
   * @param {boolean} visible
   * @public
   */
  setOutputCellVisible(card, visible) {
    const cardIndex = this.cards.indexOf(card);
    assert && assert(cardIndex !== -1);
    const rowNode = this.rowsParent.getChildAt(cardIndex);
    assert && assert(rowNode instanceof XYTableRow);
    rowNode.setOutputCellVisible(visible);
  }

  /**
   * Scrolls the table to make the corresponding row visible.
   * Does the minimal amount of scrolling necessary for the row to be visible.
   *
   * @param {NumberCard|EquationCard} card - card that's associated with the row
   * @public
   */
  scrollToRow(card) {
    const cardIndex = this.cards.indexOf(card);
    assert && assert(cardIndex !== -1);
    const rowNumberAtTop = this.rowNumberAtTopProperty.get();
    if (cardIndex < rowNumberAtTop) {
      this.rowNumberAtTopProperty.set(cardIndex);
    } else if (cardIndex > rowNumberAtTop + this.numberOfRowsVisible - 1) {
      this.rowNumberAtTopProperty.set(cardIndex - this.numberOfRowsVisible + 1);
    } else {
      // row is already visible
    }
  }

  /**
   * Determines whether animation is enabled for scrolling.
   *
   * @param {boolean} animationEnabled
   * @public
   *
   */
  setAnimationEnabled(animationEnabled) {
    this._animationEnabled = animationEnabled;
  }
  set animationEnabled(value) {
    this.setAnimationEnabled(value);
  }

  /**
   * Is animation enabled for scrolling?
   *
   * @returns {boolean}
   * @public
   */
  getAnimationEnabled() {
    return this._animationEnabled;
  }
  get animationEnabled() {
    return this.getAnimationEnabled();
  }

  /**
   * Determines whether updating of this node is enabled.
   *
   * @param {boolean} updateEnabled
   * @public
   *
   */
  setUpdateEnabled(updateEnabled) {
    FBQueryParameters.log && console.log(`${this.constructor.name}.setUpdateEnabled ${updateEnabled}`);
    const wasUpdateEnabled = this._updateEnabled;
    this._updateEnabled = updateEnabled;

    // set updateEnabled for rows
    this.rowsParent.getChildren().forEach(rowNode => {
      assert && assert(rowNode instanceof XYTableRow, 'did you add something to this.rowsParent that you should not have?');
      rowNode.updateEnabled = updateEnabled;
    });

    // update things specific to this node
    if (this.gridDirty && !wasUpdateEnabled && updateEnabled) {
      this.updateGrid();
    }
  }
  set updateEnabled(value) {
    this.setUpdateEnabled(value);
  }

  /**
   * Is updating of this node enabled?
   *
   * @returns {boolean}
   * @public
   */
  getUpdateEnabled() {
    return this._updateEnabled;
  }
  get updateEnabled() {
    return this.getUpdateEnabled();
  }
}
functionBuilder.register('XYTableNode', XYTableNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJTaGFwZSIsIm1lcmdlIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJWQm94IiwiQ2Fyb3VzZWxCdXR0b24iLCJBbmltYXRpb24iLCJFYXNpbmciLCJmdW5jdGlvbkJ1aWxkZXIiLCJGQkNvbnN0YW50cyIsIkZCUXVlcnlQYXJhbWV0ZXJzIiwiRkJTeW1ib2xzIiwiRXF1YXRpb25DYXJkIiwiTnVtYmVyQ2FyZCIsIlhZVGFibGVIZWFkaW5nIiwiWFlUYWJsZVJvdyIsIlhZVGFibGVOb2RlIiwiY29uc3RydWN0b3IiLCJidWlsZGVyIiwib3B0aW9ucyIsInNpemUiLCJUQUJMRV9EUkFXRVJfU0laRSIsIm51bWJlck9mUm93c1Zpc2libGUiLCJjb3JuZXJSYWRpdXMiLCJzY3JvbGxpbmdSZWdpb25GaWxsIiwiYW5pbWF0aW9uRW5hYmxlZCIsInVwZGF0ZUVuYWJsZWQiLCJ4U3ltYm9sIiwiWCIsInlTeW1ib2wiLCJZIiwiaGVhZGluZ0ZvbnQiLCJUQUJMRV9YWV9IRUFESU5HX0ZPTlQiLCJoZWFkaW5nWU1hcmdpbiIsImhlYWRpbmdCYWNrZ3JvdW5kIiwiQlVUVE9OX09QVElPTlMiLCJmaXJlT25Ib2xkIiwibWluV2lkdGgiLCJ3aWR0aCIsInVwQnV0dG9uIiwiYXJyb3dEaXJlY3Rpb24iLCJkb3duQnV0dG9uIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWFkiLCJzaGlmdGVkWSIsImhlYWRpbmdOb2RlIiwiZm9udCIsImZpbGwiLCJjb3JuZXJSYWRpaSIsInRvcExlZnQiLCJ0b3BSaWdodCIsInNjcm9sbGluZ1JlZ2lvbkhlaWdodCIsImhlaWdodCIsInNjcm9sbGluZ1JlZ2lvbiIsImNsaXBBcmVhIiwiYm91bmRzIiwicm93c1BhcmVudCIsImdyaWROb2RlIiwic3Ryb2tlIiwibGluZVdpZHRoIiwic2Nyb2xsaW5nQ29udGVudHMiLCJjaGlsZHJlbiIsImFkZENoaWxkIiwiYXNzZXJ0IiwiX2FuaW1hdGlvbkVuYWJsZWQiLCJfdXBkYXRlRW5hYmxlZCIsImdyaWREaXJ0eSIsInJvd1NpemUiLCJ1cGRhdGVHcmlkIiwibnVtYmVyT2ZSb3dzUHJvcGVydHkiLCJudW1iZXJUeXBlIiwiY2FyZHMiLCJyb3dOdW1iZXJBdFRvcFByb3BlcnR5IiwiYW5pbWF0aW9uIiwibGluayIsInN0b3AiLCJzY3JvbGxZIiwiZ2V0IiwidmlzaWJsZSIsImR1cmF0aW9uIiwiZWFzaW5nIiwiUVVBRFJBVElDX0lOX09VVCIsIm9iamVjdCIsImF0dHJpYnV0ZSIsInRvIiwic3RhcnQiLCJ5IiwidXBkYXRlQnV0dG9uU3RhdGUiLCJlbmFibGVkIiwiYWRkTGlzdGVuZXIiLCJzZXQiLCJudW1iZXJPZlJvd3MiLCJNYXRoIiwibWF4IiwiZ3JpZFNoYXBlIiwiaSIsIm1vdmVUbyIsImxpbmVUbyIsImNlbnRlclgiLCJzaGFwZSIsImFkZFJvdyIsImNhcmQiLCJjb250YWluc1JvdyIsInJvd05vZGUiLCJpbnNlcnRJbmRleCIsImxlbmd0aCIsInNvbWVDYXJkIiwicmF0aW9uYWxOdW1iZXIiLCJ2YWx1ZU9mIiwic3BsaWNlIiwiaW5zZXJ0Q2hpbGQiLCJwdXNoIiwiRXJyb3IiLCJyZW1vdmVSb3ciLCJjYXJkSW5kZXgiLCJpbmRleE9mIiwid2FzQW5pbWF0aW9uRW5hYmxlZCIsImdldENoaWxkQXQiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJzZXRPdXRwdXRDZWxsVmlzaWJsZSIsInNjcm9sbFRvUm93Iiwicm93TnVtYmVyQXRUb3AiLCJzZXRBbmltYXRpb25FbmFibGVkIiwidmFsdWUiLCJnZXRBbmltYXRpb25FbmFibGVkIiwic2V0VXBkYXRlRW5hYmxlZCIsImxvZyIsImNvbnNvbGUiLCJuYW1lIiwid2FzVXBkYXRlRW5hYmxlZCIsImdldENoaWxkcmVuIiwiZm9yRWFjaCIsImdldFVwZGF0ZUVuYWJsZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlhZVGFibGVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFhZIHRhYmxlLCBzaG93aW5nIHRoZSBtYXBwaW5nIGJldHdlZW4gaW5wdXQgYW5kIG91dHB1dCB2YWx1ZXMgZm9yIHRoZSBmdW5jdGlvbnMgaW4gdGhlIGJ1aWxkZXIuXHJcbiAqXHJcbiAqIFJlcXVpcmVtZW50czpcclxuICogRWFjaCByb3cgaXMgYXNzb2NpYXRlZCB3aXRoIGFuIGluc3RhbmNlIG9mIGEgQ2FyZCwgYW5kIGNvbnNpc3RzIG9mIGlucHV0ICh4KSBhbmQgb3V0cHV0ICh5KSBjZWxscy5cclxuICogUm93cyBmb3IgbnVtYmVyIGNhcmRzIGFyZSBpbnNlcnRlZCBpbiBhc2NlbmRpbmcgbnVtZXJpY2FsIG9yZGVyLlxyXG4gKiBSb3dzIGZvciBzeW1ib2xpYyBjYXJkcyAoZWcgJ3gnKSBhcmUgYXBwZW5kZWQgdG8gdGhlIHRhYmxlLlxyXG4gKiBXaGVuIGEgcm93IGlzIGFkZGVkLCBpdCdzIGlucHV0IGNlbGwgaXMgdmlzaWJsZSwgaXQncyBvdXRwdXQgY2VsbCBpcyBpbnZpc2libGUuXHJcbiAqIFdoZW4gYSByb3cgaXMgZGVsZXRlZCwgcm93cyBiZWxvdyBpdCBtb3ZlIHVwIChoYW5kbGVkIGF1dG9tYXRpY2FsbHkgYnkgdXNpbmcgVkJveCkuXHJcbiAqIFRoZSBmaXJzdCAncGFnZScgaW4gdGhlIHRhYmxlIGNvbnRhaW5zIGVtcHR5IHJvd3MsIG90aGVyd2lzZSB0aGVyZSBhcmUgbm8gZW1wdHkgcm93cy5cclxuICogVGhlIHZhbHVlcyBpbiB0aGUgb3V0cHV0IGNlbGxzIHJlZmxlY3QgdGhlIGZ1bmN0aW9ucyBpbiB0aGUgYnVpbGRlci5cclxuICpcclxuICogUGVyZm9ybWFuY2UgaXMgb3B0aW1pemVkIHNvIHRoYXQgdGhlIHRhYmxlIHN5bmNocm9uaXplcyB3aXRoIHRoZSBtb2RlbCBvbmx5IHdoaWxlIHVwZGF0ZXNFbmFibGVkIGlzIHRydWUuXHJcbiAqIFdoZW4gdXBkYXRlc0VuYWJsZWQgaXMgY2hhbmdlZCBmcm9tIGZhbHNlIHRvIHRydWUsIGFueXRoaW5nIHRoYXQgaXMgJ2RpcnR5JyBpcyB1cGRhdGVkLlxyXG4gKiBTZWUgdXBkYXRlc0VuYWJsZWQgYW5kIGdyaWREaXJ0eSBmbGFncy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENhcm91c2VsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Nhcm91c2VsQnV0dG9uLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXIgZnJvbSAnLi4vLi4vLi4vZnVuY3Rpb25CdWlsZGVyLmpzJztcclxuaW1wb3J0IEZCQ29uc3RhbnRzIGZyb20gJy4uLy4uL0ZCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZCUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL0ZCUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEZCU3ltYm9scyBmcm9tICcuLi8uLi9GQlN5bWJvbHMuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25DYXJkIGZyb20gJy4uLy4uL21vZGVsL2NhcmRzL0VxdWF0aW9uQ2FyZC5qcyc7XHJcbmltcG9ydCBOdW1iZXJDYXJkIGZyb20gJy4uLy4uL21vZGVsL2NhcmRzL051bWJlckNhcmQuanMnO1xyXG5pbXBvcnQgWFlUYWJsZUhlYWRpbmcgZnJvbSAnLi9YWVRhYmxlSGVhZGluZy5qcyc7XHJcbmltcG9ydCBYWVRhYmxlUm93IGZyb20gJy4vWFlUYWJsZVJvdy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBYWVRhYmxlTm9kZSBleHRlbmRzIFZCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0J1aWxkZXJ9IGJ1aWxkZXJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJ1aWxkZXIsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICBzaXplOiBGQkNvbnN0YW50cy5UQUJMRV9EUkFXRVJfU0laRSxcclxuICAgICAgbnVtYmVyT2ZSb3dzVmlzaWJsZTogMywgLy8ge251bWJlcn0gbnVtYmVyIG9mIHJvd3MgdmlzaWJsZSBpbiB0aGUgc2Nyb2xsaW5nIGFyZWFcclxuICAgICAgY29ybmVyUmFkaXVzOiAwLFxyXG4gICAgICBzY3JvbGxpbmdSZWdpb25GaWxsOiAnd2hpdGUnLFxyXG4gICAgICBhbmltYXRpb25FbmFibGVkOiB0cnVlLCAvLyB7Ym9vbGVhbn0gaXMgYW5pbWF0aW9uIG9mIHNjcm9sbGluZyBlbmFibGVkP1xyXG4gICAgICB1cGRhdGVFbmFibGVkOiBmYWxzZSwgLy8ge2Jvb2xlYW59IGRvZXMgdGhpcyBub2RlIHVwZGF0ZSB3aGVuIHRoZSBtb2RlbCBjaGFuZ2VzP1xyXG5cclxuICAgICAgLy8gY29sdW1uIGhlYWRpbmdzXHJcbiAgICAgIHhTeW1ib2w6IEZCU3ltYm9scy5YLFxyXG4gICAgICB5U3ltYm9sOiBGQlN5bWJvbHMuWSxcclxuICAgICAgaGVhZGluZ0ZvbnQ6IEZCQ29uc3RhbnRzLlRBQkxFX1hZX0hFQURJTkdfRk9OVCxcclxuICAgICAgaGVhZGluZ1lNYXJnaW46IDIsXHJcbiAgICAgIGhlYWRpbmdCYWNrZ3JvdW5kOiAncmdiKCAxNDQsIDIyNiwgMjUyICknXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIG9wdGlvbnMgZm9yIHNjcm9sbCBidXR0b25zXHJcbiAgICBjb25zdCBCVVRUT05fT1BUSU9OUyA9IHtcclxuICAgICAgZmlyZU9uSG9sZDogZmFsc2UsIC8vIGJlY2F1c2Ugc2Nyb2xsaW5nIGlzIGFuaW1hdGVkXHJcbiAgICAgIG1pbldpZHRoOiBvcHRpb25zLnNpemUud2lkdGhcclxuICAgIH07XHJcblxyXG4gICAgLy8gdXAgYnV0dG9uXHJcbiAgICBjb25zdCB1cEJ1dHRvbiA9IG5ldyBDYXJvdXNlbEJ1dHRvbiggbWVyZ2UoIHt9LCBCVVRUT05fT1BUSU9OUywge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IDAsXHJcbiAgICAgIGFycm93RGlyZWN0aW9uOiAndXAnXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBkb3duIGJ1dHRvblxyXG4gICAgY29uc3QgZG93bkJ1dHRvbiA9IG5ldyBDYXJvdXNlbEJ1dHRvbiggbWVyZ2UoIHt9LCBCVVRUT05fT1BUSU9OUywge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxyXG4gICAgICBhcnJvd0RpcmVjdGlvbjogJ2Rvd24nXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBidXR0b24gdG91Y2hBcmVhc1xyXG4gICAgdXBCdXR0b24udG91Y2hBcmVhID0gdXBCdXR0b24ubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCAxMCwgNSApLnNoaWZ0ZWRZKCAtNSApO1xyXG4gICAgZG93bkJ1dHRvbi50b3VjaEFyZWEgPSBkb3duQnV0dG9uLmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggMTAsIDUgKS5zaGlmdGVkWSggLTUgKTtcclxuXHJcbiAgICAvLyBjb2x1bW4gaGVhZGluZ3NcclxuICAgIGNvbnN0IGhlYWRpbmdOb2RlID0gbmV3IFhZVGFibGVIZWFkaW5nKCBvcHRpb25zLnhTeW1ib2wsIG9wdGlvbnMueVN5bWJvbCwge1xyXG4gICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggb3B0aW9ucy5zaXplLndpZHRoLCAzMCApLFxyXG4gICAgICBmb250OiBvcHRpb25zLmhlYWRpbmdGb250LFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmhlYWRpbmdCYWNrZ3JvdW5kLFxyXG4gICAgICBjb3JuZXJSYWRpaToge1xyXG4gICAgICAgIHRvcExlZnQ6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxyXG4gICAgICAgIHRvcFJpZ2h0OiBvcHRpb25zLmNvcm5lclJhZGl1c1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gd2luZG93IHRoYXQgcm93cyBzY3JvbGwgaW5cclxuICAgIGNvbnN0IHNjcm9sbGluZ1JlZ2lvbkhlaWdodCA9IG9wdGlvbnMuc2l6ZS5oZWlnaHQgLSBoZWFkaW5nTm9kZS5oZWlnaHQgLSB1cEJ1dHRvbi5oZWlnaHQgLSBkb3duQnV0dG9uLmhlaWdodDtcclxuICAgIGNvbnN0IHNjcm9sbGluZ1JlZ2lvbiA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIG9wdGlvbnMuc2l6ZS53aWR0aCwgc2Nyb2xsaW5nUmVnaW9uSGVpZ2h0LCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuc2Nyb2xsaW5nUmVnaW9uRmlsbFxyXG4gICAgfSApO1xyXG4gICAgc2Nyb2xsaW5nUmVnaW9uLmNsaXBBcmVhID0gU2hhcGUuYm91bmRzKCBzY3JvbGxpbmdSZWdpb24ubG9jYWxCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBwYXJlbnQgZm9yIGFsbCB7WFlUYWJsZVJvd30gcm93cywgY2hpbGRyZW4gaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhpcy5jYXJkc1xyXG4gICAgLy8gRG8gbm90IGFkZCBhbnl0aGluZyB0aGF0IGlzIG5vdCBhIFhZVGFibGVSb3cgdG8gdGhpcyBub2RlIVxyXG4gICAgY29uc3Qgcm93c1BhcmVudCA9IG5ldyBWQm94KCk7XHJcblxyXG4gICAgLy8gZ3JpZCBpcyBkcmF3biBzZXBhcmF0ZWx5IHNvIHdlIGRvbid0IGhhdmUgd2VpcmRuZXNzIHdpdGggY2VsbCBzdHJva2VzIG92ZXJsYXBwaW5nXHJcbiAgICBjb25zdCBncmlkTm9kZSA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAwLjVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjb250ZW50cyBvZiB0aGUgc2Nyb2xsaW5nIHJlZ2lvblxyXG4gICAgY29uc3Qgc2Nyb2xsaW5nQ29udGVudHMgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyByb3dzUGFyZW50LCBncmlkTm9kZSBdXHJcbiAgICB9ICk7XHJcbiAgICBzY3JvbGxpbmdSZWdpb24uYWRkQ2hpbGQoIHNjcm9sbGluZ0NvbnRlbnRzICk7IC8vIGFkZCBhZnRlciBzZXR0aW5nIGNsaXBBcmVhXHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdkZWNvcmF0aW9uIG5vdCBzdXBwb3J0ZWQnICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBoZWFkaW5nTm9kZSwgdXBCdXR0b24sIHNjcm9sbGluZ1JlZ2lvbiwgZG93bkJ1dHRvbiBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuYnVpbGRlciA9IGJ1aWxkZXI7XHJcbiAgICB0aGlzLm51bWJlck9mUm93c1Zpc2libGUgPSBvcHRpb25zLm51bWJlck9mUm93c1Zpc2libGU7XHJcbiAgICB0aGlzLl9hbmltYXRpb25FbmFibGVkID0gb3B0aW9ucy5hbmltYXRpb25FbmFibGVkO1xyXG4gICAgdGhpcy5fdXBkYXRlRW5hYmxlZCA9IG9wdGlvbnMudXBkYXRlRW5hYmxlZDtcclxuICAgIHRoaXMuZ3JpZERpcnR5ID0gdHJ1ZTsgLy8ge2Jvb2xlYW59IGRvZXMgdGhlIGdyaWQgbmVlZCB0byBiZSB1cGRhdGVkP1xyXG4gICAgdGhpcy5yb3dzUGFyZW50ID0gcm93c1BhcmVudDtcclxuICAgIHRoaXMuZ3JpZE5vZGUgPSBncmlkTm9kZTtcclxuICAgIHRoaXMucm93U2l6ZSA9IG5ldyBEaW1lbnNpb24yKCBvcHRpb25zLnNpemUud2lkdGgsIHNjcm9sbGluZ1JlZ2lvbkhlaWdodCAvIG9wdGlvbnMubnVtYmVyT2ZSb3dzVmlzaWJsZSApO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy51cGRhdGVFbmFibGVkICkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyaWQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBudW1iZXIgb2Ygcm93cyBpbiB0aGUgdGFibGVcclxuICAgIHRoaXMubnVtYmVyT2ZSb3dzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgbnVtYmVyVHlwZTogJ0ludGVnZXInIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPE51bWJlckNhcmR8RXF1YXRpb25DYXJkPn0gY2FyZHMsIGluIHRoZSBvcmRlciB0aGF0IHRoZXkgYXBwZWFyIGluIHRoZSB0YWJsZVxyXG4gICAgdGhpcy5jYXJkcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48bnVtYmVyPn0gdGhlIHJvdyBudW1iZXIgdGhhdCBhcHBlYXJzIGF0IHRoZSB0b3Agb2YgdGhlIHRhYmxlXHJcbiAgICB0aGlzLnJvd051bWJlckF0VG9wUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHsgbnVtYmVyVHlwZTogJ0ludGVnZXInIH0gKTtcclxuXHJcbiAgICAvLyB7QW5pbWF0aW9ufSBhbmltYXRpb24gdGhhdCB2ZXJ0aWNhbGx5IHNjcm9sbHMgdGhlIHJvd3NcclxuICAgIGxldCBhbmltYXRpb24gPSBudWxsO1xyXG5cclxuICAgIC8vIHNjcm9sbFxyXG4gICAgLy8gdW5saW5rIHVubmVjZXNzYXJ5LCBpbnN0YW5jZSBvd25zIHRoaXMgcHJvcGVydHlcclxuICAgIHRoaXMucm93TnVtYmVyQXRUb3BQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBzdG9wIGFueSBhbmltYXRpb24gdGhhdCdzIGluIHByb2dyZXNzXHJcbiAgICAgIGFuaW1hdGlvbiAmJiBhbmltYXRpb24uc3RvcCgpO1xyXG5cclxuICAgICAgY29uc3Qgc2Nyb2xsWSA9IC0oIHRoaXMucm93TnVtYmVyQXRUb3BQcm9wZXJ0eS5nZXQoKSAqIHRoaXMucm93U2l6ZS5oZWlnaHQgKTtcclxuICAgICAgaWYgKCB0aGlzLnZpc2libGUgJiYgdGhpcy5hbmltYXRpb25FbmFibGVkICkge1xyXG5cclxuICAgICAgICAvLyBhbmltYXRlIHNjcm9sbGluZ1xyXG4gICAgICAgIGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICAgIGR1cmF0aW9uOiAwLjUsIC8vIHNlY29uZHNcclxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVQsXHJcbiAgICAgICAgICBvYmplY3Q6IHNjcm9sbGluZ0NvbnRlbnRzLFxyXG4gICAgICAgICAgYXR0cmlidXRlOiAneScsXHJcbiAgICAgICAgICB0bzogc2Nyb2xsWVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBhbmltYXRpb24uc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gbW92ZSBpbW1lZGlhdGVseSwgbm8gYW5pbWF0aW9uXHJcbiAgICAgICAgc2Nyb2xsaW5nQ29udGVudHMueSA9IHNjcm9sbFk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBidXR0b24gc3RhdGUgaXMgZGVwZW5kZW50IG9uIG51bWJlciBvZiByb3dzIGFuZCB3aGljaCByb3dzIGFyZSB2aXNpYmxlXHJcbiAgICBjb25zdCB1cGRhdGVCdXR0b25TdGF0ZSA9ICgpID0+IHtcclxuICAgICAgdXBCdXR0b24uZW5hYmxlZCA9ICggdGhpcy5yb3dOdW1iZXJBdFRvcFByb3BlcnR5LmdldCgpICE9PSAwICk7XHJcbiAgICAgIGRvd25CdXR0b24uZW5hYmxlZCA9ICggdGhpcy5udW1iZXJPZlJvd3NQcm9wZXJ0eS5nZXQoKSAtIHRoaXMucm93TnVtYmVyQXRUb3BQcm9wZXJ0eS5nZXQoKSApID4gb3B0aW9ucy5udW1iZXJPZlJvd3NWaXNpYmxlO1xyXG4gICAgfTtcclxuICAgIC8vIHVubGluayB1bm5lY2Vzc2FyeSwgaW5zdGFuY2Ugb3ducyB0aGVzZSBwcm9wZXJ0aWVzXHJcbiAgICB0aGlzLm51bWJlck9mUm93c1Byb3BlcnR5LmxpbmsoIHVwZGF0ZUJ1dHRvblN0YXRlICk7XHJcbiAgICB0aGlzLnJvd051bWJlckF0VG9wUHJvcGVydHkubGluayggdXBkYXRlQnV0dG9uU3RhdGUgKTtcclxuXHJcbiAgICB1cEJ1dHRvbi5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLnJvd051bWJlckF0VG9wUHJvcGVydHkuc2V0KCB0aGlzLnJvd051bWJlckF0VG9wUHJvcGVydHkuZ2V0KCkgLSAxICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgZG93bkJ1dHRvbi5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLnJvd051bWJlckF0VG9wUHJvcGVydHkuc2V0KCB0aGlzLnJvd051bWJlckF0VG9wUHJvcGVydHkuZ2V0KCkgKyAxICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBncmlkIHRoYXQgZGVsaW5lYXRlcyByb3dzIGFuZCBjb2x1bW5zLiBUaGlzIGdyaWQgaXMgZHJhd24gc2VwYXJhdGVseSBmcm9tIGNlbGxzLFxyXG4gICAqIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZSB0byBkZWFsIHdpdGggaXNzdWVzIHJlbGF0ZWQgdG8gb3ZlcmxhcHBpbmcgc3Ryb2tlcyBhcm91bmQgY2VsbHMuXHJcbiAgICogRHJhdyBvbmUgZXh0cmEgKGVtcHR5KSByb3cgc28gdGhhdCB3ZSBkb24ndCBzZWUgYSBnYXAgd2hlbiBhbmltYXRpbmcgYWZ0ZXIgcmVtb3ZpbmcgdGhlIGxhc3Qgcm93LlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVHcmlkKCkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudXBkYXRlRW5hYmxlZCAmJiB0aGlzLmdyaWREaXJ0eSApO1xyXG5cclxuICAgIC8vIGFsd2F5cyBzaG93IDEgcGFnZSBvZiBjZWxscywgZXZlbiBpZiBzb21lIGFyZSBlbXB0eVxyXG4gICAgY29uc3QgbnVtYmVyT2ZSb3dzID0gTWF0aC5tYXgoIHRoaXMubnVtYmVyT2ZSb3dzVmlzaWJsZSwgdGhpcy5udW1iZXJPZlJvd3NQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIGNvbnN0IGdyaWRTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAgIC8vIGhvcml6b250YWwgbGluZXMgYmV0d2VlbiByb3dzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBudW1iZXJPZlJvd3MgKyAxOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHkgPSBpICogdGhpcy5yb3dTaXplLmhlaWdodDtcclxuICAgICAgZ3JpZFNoYXBlLm1vdmVUbyggMCwgeSApLmxpbmVUbyggdGhpcy5yb3dTaXplLndpZHRoLCB5ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmVydGljYWwgbGluZSBiZXR3ZWVuIGNvbHVtbnNcclxuICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLnJvd1NpemUud2lkdGggLyAyO1xyXG4gICAgZ3JpZFNoYXBlLm1vdmVUbyggY2VudGVyWCwgMCApLmxpbmVUbyggY2VudGVyWCwgKCBudW1iZXJPZlJvd3MgKyAxICkgKiB0aGlzLnJvd1NpemUuaGVpZ2h0ICk7XHJcblxyXG4gICAgdGhpcy5ncmlkTm9kZS5zaGFwZSA9IGdyaWRTaGFwZTtcclxuXHJcbiAgICB0aGlzLmdyaWREaXJ0eSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHJvdyB0byB0aGUgdGFibGUuXHJcbiAgICogRm9yIE51bWJlckNhcmQsIGNhcmRzIGFyZSBpbiBhc2NlbmRpbmcgbnVtZXJpYyBvcmRlci5cclxuICAgKiBGb3IgRXF1YXRpb25DYXJkLCBjYXJkcyBhcmUgYWRkZWQgdG8gdGhlIGVuZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyQ2FyZHxFcXVhdGlvbkNhcmR9IGNhcmQgLSBjYXJkIHRoYXQncyBhc3NvY2lhdGVkIHdpdGggdGhlIHJvd1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRSb3coIGNhcmQgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuY29udGFpbnNSb3coIGNhcmQgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2FyZCBpbnN0YW5jZW9mIE51bWJlckNhcmQgfHwgY2FyZCBpbnN0YW5jZW9mIEVxdWF0aW9uQ2FyZCApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgcm93XHJcbiAgICBjb25zdCByb3dOb2RlID0gbmV3IFhZVGFibGVSb3coIGNhcmQsIHRoaXMuYnVpbGRlciwge1xyXG4gICAgICBzaXplOiB0aGlzLnJvd1NpemUsXHJcbiAgICAgIHVwZGF0ZUVuYWJsZWQ6IHRoaXMudXBkYXRlRW5hYmxlZFxyXG4gICAgfSApO1xyXG5cclxuICAgIGlmICggY2FyZCBpbnN0YW5jZW9mIE51bWJlckNhcmQgKSB7XHJcblxyXG4gICAgICAvLyBJbnNlcnQgbnVtYmVyIGNhcmRzIGluIGFzY2VuZGluZyBudW1lcmljYWwgb3JkZXIuIERldGVybWluZSBpbnNlcnRpb24gaW5kZXggYnkgbG9va2luZyBhdCBjYXJkcyBpbiBvcmRlcixcclxuICAgICAgLy8gdW50aWwgd2UgZW5jb3VudGVyIGEgc3ltYm9saWMgY2FyZCAoZWcsICd4Jywgd2hpY2ggaXMgYWx3YXlzIGF0IHRoZSBlbmQpIG9yIGEgY2FyZCB3aXRoIGEgbGFyZ2VyIG51bWJlci5cclxuICAgICAgbGV0IGluc2VydEluZGV4ID0gdGhpcy5jYXJkcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2FyZHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgc29tZUNhcmQgPSB0aGlzLmNhcmRzWyBpIF07XHJcbiAgICAgICAgaWYgKCAoIHNvbWVDYXJkIGluc3RhbmNlb2YgRXF1YXRpb25DYXJkICkgfHwgKCBjYXJkLnJhdGlvbmFsTnVtYmVyLnZhbHVlT2YoKSA8IHNvbWVDYXJkLnJhdGlvbmFsTnVtYmVyLnZhbHVlT2YoKSApICkge1xyXG4gICAgICAgICAgaW5zZXJ0SW5kZXggPSBpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuY2FyZHMuc3BsaWNlKCBpbnNlcnRJbmRleCwgMCwgY2FyZCApO1xyXG4gICAgICB0aGlzLnJvd3NQYXJlbnQuaW5zZXJ0Q2hpbGQoIGluc2VydEluZGV4LCByb3dOb2RlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggY2FyZCBpbnN0YW5jZW9mIEVxdWF0aW9uQ2FyZCApIHtcclxuXHJcbiAgICAgIC8vIGFkZCAneCcgY2FyZCB0byBlbmRcclxuICAgICAgdGhpcy5jYXJkcy5wdXNoKCBjYXJkICk7XHJcbiAgICAgIHRoaXMucm93c1BhcmVudC5hZGRDaGlsZCggcm93Tm9kZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ2ludmFsaWQgY2FyZCB0eXBlJyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubnVtYmVyT2ZSb3dzUHJvcGVydHkuc2V0KCB0aGlzLm51bWJlck9mUm93c1Byb3BlcnR5LmdldCgpICsgMSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgZ3JpZFxyXG4gICAgdGhpcy5ncmlkRGlydHkgPSB0cnVlO1xyXG4gICAgaWYgKCB0aGlzLnVwZGF0ZUVuYWJsZWQgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JpZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIHJvdyBmcm9tIHRoZSB0YWJsZS4gUm93cyBiZWxvdyBpdCBtb3ZlIHVwLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJDYXJkfEVxdWF0aW9uQ2FyZH0gY2FyZCAtIGNhcmQgdGhhdCdzIGFzc29jaWF0ZWQgd2l0aCB0aGUgcm93XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZVJvdyggY2FyZCApIHtcclxuXHJcbiAgICBjb25zdCBjYXJkSW5kZXggPSB0aGlzLmNhcmRzLmluZGV4T2YoIGNhcmQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNhcmRJbmRleCAhPT0gLTEgKTtcclxuXHJcbiAgICAvLyByZW1vdmUgY2FyZFxyXG4gICAgdGhpcy5jYXJkcy5zcGxpY2UoIGNhcmRJbmRleCwgMSApO1xyXG5cclxuICAgIC8vIElmIHRoZSBsYXN0IHJvdyBpcyB2aXNpYmxlIGF0IHRoZSBib3R0b20gb2YgdGhlIHRhYmxlLCBkaXNhYmxlIHNjcm9sbGluZyBhbmltYXRpb24uXHJcbiAgICAvLyBUaGlzIHByZXZlbnRzIGEgc2l0dWF0aW9uIHRoYXQgbG9va3MgYSBsaXR0bGUgb2RkOiByb3dzIHdpbGwgbW92ZSB1cCB0byByZXZlYWwgYW4gZW1wdHlcclxuICAgIC8vIHJvdyBhdCB0aGUgYm90dG9tLCB0aGVuIHJvd3Mgd2lsbCBzY3JvbGwgZG93bi5cclxuICAgIGNvbnN0IHdhc0FuaW1hdGlvbkVuYWJsZWQgPSB0aGlzLmFuaW1hdGlvbkVuYWJsZWQ7XHJcbiAgICBpZiAoIHRoaXMucm93TnVtYmVyQXRUb3BQcm9wZXJ0eS5nZXQoKSA9PT0gdGhpcy5udW1iZXJPZlJvd3NQcm9wZXJ0eS5nZXQoKSAtIHRoaXMubnVtYmVyT2ZSb3dzVmlzaWJsZSApIHtcclxuICAgICAgdGhpcy5hbmltYXRpb25FbmFibGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIHJvdywgcm93cyBiZWxvdyBpdCBtb3ZlIHVwIGF1dG9tYXRpY2FsbHkgc2luY2Ugcm93c1BhcmVudCBpcyBhIFZCb3hcclxuICAgIGNvbnN0IHJvd05vZGUgPSB0aGlzLnJvd3NQYXJlbnQuZ2V0Q2hpbGRBdCggY2FyZEluZGV4ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByb3dOb2RlIGluc3RhbmNlb2YgWFlUYWJsZVJvdyApO1xyXG4gICAgdGhpcy5yb3dzUGFyZW50LnJlbW92ZUNoaWxkKCByb3dOb2RlICk7XHJcbiAgICByb3dOb2RlLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMubnVtYmVyT2ZSb3dzUHJvcGVydHkuc2V0KCB0aGlzLm51bWJlck9mUm93c1Byb3BlcnR5LmdldCgpIC0gMSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgZ3JpZFxyXG4gICAgdGhpcy5ncmlkRGlydHkgPSB0cnVlO1xyXG4gICAgaWYgKCB0aGlzLnVwZGF0ZUVuYWJsZWQgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JpZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHdlJ3JlIG5vdCBvbiB0aGUgZmlyc3QgcGFnZSwgd2hpY2ggYWxsb3dzIGVtcHR5IHJvd3MuLi5cclxuICAgIGlmICggdGhpcy5yb3dOdW1iZXJBdFRvcFByb3BlcnR5LmdldCgpICE9PSAwICkge1xyXG5cclxuICAgICAgLy8gaWYgdGhlcmUncyBhbiBlbXB0eSByb3cgYXQgdGhlIGJvdHRvbSBvZiB0aGUgdGFibGUsIG1vdmUgYWxsIHJvd3MgZG93blxyXG4gICAgICBpZiAoIHRoaXMubnVtYmVyT2ZSb3dzUHJvcGVydHkuZ2V0KCkgLSB0aGlzLm51bWJlck9mUm93c1Zpc2libGUgPCB0aGlzLnJvd051bWJlckF0VG9wUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgdGhpcy5yb3dOdW1iZXJBdFRvcFByb3BlcnR5LnNldCggdGhpcy5udW1iZXJPZlJvd3NQcm9wZXJ0eS5nZXQoKSAtIHRoaXMubnVtYmVyT2ZSb3dzVmlzaWJsZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hbmltYXRpb25FbmFibGVkID0gd2FzQW5pbWF0aW9uRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhlIHRhYmxlIGNvbnRhaW4gYSByb3cgZm9yIHRoZSBzcGVjaWZpZWQgY2FyZD9cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2FyZH0gY2FyZFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb250YWluc1JvdyggY2FyZCApIHtcclxuICAgIHJldHVybiAoIHRoaXMuY2FyZHMuaW5kZXhPZiggY2FyZCApICE9PSAtMSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgY29ycmVzcG9uZGluZyBvdXRwdXQgY2VsbC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyQ2FyZHxFcXVhdGlvbkNhcmR9IGNhcmQgLSBjYXJkIHRoYXQncyBhc3NvY2lhdGVkIHdpdGggdGhlIHJvd1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmlzaWJsZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRPdXRwdXRDZWxsVmlzaWJsZSggY2FyZCwgdmlzaWJsZSApIHtcclxuXHJcbiAgICBjb25zdCBjYXJkSW5kZXggPSB0aGlzLmNhcmRzLmluZGV4T2YoIGNhcmQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNhcmRJbmRleCAhPT0gLTEgKTtcclxuXHJcbiAgICBjb25zdCByb3dOb2RlID0gdGhpcy5yb3dzUGFyZW50LmdldENoaWxkQXQoIGNhcmRJbmRleCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcm93Tm9kZSBpbnN0YW5jZW9mIFhZVGFibGVSb3cgKTtcclxuICAgIHJvd05vZGUuc2V0T3V0cHV0Q2VsbFZpc2libGUoIHZpc2libGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNjcm9sbHMgdGhlIHRhYmxlIHRvIG1ha2UgdGhlIGNvcnJlc3BvbmRpbmcgcm93IHZpc2libGUuXHJcbiAgICogRG9lcyB0aGUgbWluaW1hbCBhbW91bnQgb2Ygc2Nyb2xsaW5nIG5lY2Vzc2FyeSBmb3IgdGhlIHJvdyB0byBiZSB2aXNpYmxlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJDYXJkfEVxdWF0aW9uQ2FyZH0gY2FyZCAtIGNhcmQgdGhhdCdzIGFzc29jaWF0ZWQgd2l0aCB0aGUgcm93XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNjcm9sbFRvUm93KCBjYXJkICkge1xyXG5cclxuICAgIGNvbnN0IGNhcmRJbmRleCA9IHRoaXMuY2FyZHMuaW5kZXhPZiggY2FyZCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2FyZEluZGV4ICE9PSAtMSApO1xyXG5cclxuICAgIGNvbnN0IHJvd051bWJlckF0VG9wID0gdGhpcy5yb3dOdW1iZXJBdFRvcFByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGlmICggY2FyZEluZGV4IDwgcm93TnVtYmVyQXRUb3AgKSB7XHJcbiAgICAgIHRoaXMucm93TnVtYmVyQXRUb3BQcm9wZXJ0eS5zZXQoIGNhcmRJbmRleCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGNhcmRJbmRleCA+IHJvd051bWJlckF0VG9wICsgdGhpcy5udW1iZXJPZlJvd3NWaXNpYmxlIC0gMSApIHtcclxuICAgICAgdGhpcy5yb3dOdW1iZXJBdFRvcFByb3BlcnR5LnNldCggY2FyZEluZGV4IC0gdGhpcy5udW1iZXJPZlJvd3NWaXNpYmxlICsgMSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIHJvdyBpcyBhbHJlYWR5IHZpc2libGVcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhbmltYXRpb24gaXMgZW5hYmxlZCBmb3Igc2Nyb2xsaW5nLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbmltYXRpb25FbmFibGVkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICovXHJcbiAgc2V0QW5pbWF0aW9uRW5hYmxlZCggYW5pbWF0aW9uRW5hYmxlZCApIHtcclxuICAgIHRoaXMuX2FuaW1hdGlvbkVuYWJsZWQgPSBhbmltYXRpb25FbmFibGVkO1xyXG4gIH1cclxuXHJcbiAgc2V0IGFuaW1hdGlvbkVuYWJsZWQoIHZhbHVlICkgeyB0aGlzLnNldEFuaW1hdGlvbkVuYWJsZWQoIHZhbHVlICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgYW5pbWF0aW9uIGVuYWJsZWQgZm9yIHNjcm9sbGluZz9cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRBbmltYXRpb25FbmFibGVkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FuaW1hdGlvbkVuYWJsZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgYW5pbWF0aW9uRW5hYmxlZCgpIHsgcmV0dXJuIHRoaXMuZ2V0QW5pbWF0aW9uRW5hYmxlZCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciB1cGRhdGluZyBvZiB0aGlzIG5vZGUgaXMgZW5hYmxlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXBkYXRlRW5hYmxlZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqL1xyXG4gIHNldFVwZGF0ZUVuYWJsZWQoIHVwZGF0ZUVuYWJsZWQgKSB7XHJcblxyXG4gICAgRkJRdWVyeVBhcmFtZXRlcnMubG9nICYmIGNvbnNvbGUubG9nKCBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9LnNldFVwZGF0ZUVuYWJsZWQgJHt1cGRhdGVFbmFibGVkfWAgKTtcclxuXHJcbiAgICBjb25zdCB3YXNVcGRhdGVFbmFibGVkID0gdGhpcy5fdXBkYXRlRW5hYmxlZDtcclxuICAgIHRoaXMuX3VwZGF0ZUVuYWJsZWQgPSB1cGRhdGVFbmFibGVkO1xyXG5cclxuICAgIC8vIHNldCB1cGRhdGVFbmFibGVkIGZvciByb3dzXHJcbiAgICB0aGlzLnJvd3NQYXJlbnQuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKCByb3dOb2RlID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcm93Tm9kZSBpbnN0YW5jZW9mIFhZVGFibGVSb3csICdkaWQgeW91IGFkZCBzb21ldGhpbmcgdG8gdGhpcy5yb3dzUGFyZW50IHRoYXQgeW91IHNob3VsZCBub3QgaGF2ZT8nICk7XHJcbiAgICAgIHJvd05vZGUudXBkYXRlRW5hYmxlZCA9IHVwZGF0ZUVuYWJsZWQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoaW5ncyBzcGVjaWZpYyB0byB0aGlzIG5vZGVcclxuICAgIGlmICggdGhpcy5ncmlkRGlydHkgJiYgIXdhc1VwZGF0ZUVuYWJsZWQgJiYgdXBkYXRlRW5hYmxlZCApIHtcclxuICAgICAgdGhpcy51cGRhdGVHcmlkKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXQgdXBkYXRlRW5hYmxlZCggdmFsdWUgKSB7IHRoaXMuc2V0VXBkYXRlRW5hYmxlZCggdmFsdWUgKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBJcyB1cGRhdGluZyBvZiB0aGlzIG5vZGUgZW5hYmxlZD9cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRVcGRhdGVFbmFibGVkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3VwZGF0ZUVuYWJsZWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgdXBkYXRlRW5hYmxlZCgpIHsgcmV0dXJuIHRoaXMuZ2V0VXBkYXRlRW5hYmxlZCgpOyB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ1hZVGFibGVOb2RlJywgWFlUYWJsZU5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sMENBQTBDO0FBQ3JFLE9BQU9DLFVBQVUsTUFBTSxxQ0FBcUM7QUFDNUQsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDbEYsT0FBT0MsY0FBYyxNQUFNLGlEQUFpRDtBQUM1RSxPQUFPQyxTQUFTLE1BQU0sc0NBQXNDO0FBQzVELE9BQU9DLE1BQU0sTUFBTSxtQ0FBbUM7QUFDdEQsT0FBT0MsZUFBZSxNQUFNLDZCQUE2QjtBQUN6RCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUMxRCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLFlBQVksTUFBTSxtQ0FBbUM7QUFDNUQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFFeEMsZUFBZSxNQUFNQyxXQUFXLFNBQVNaLElBQUksQ0FBQztFQUU1QztBQUNGO0FBQ0E7QUFDQTtFQUNFYSxXQUFXQSxDQUFFQyxPQUFPLEVBQUVDLE9BQU8sRUFBRztJQUU5QkEsT0FBTyxHQUFHbkIsS0FBSyxDQUFFO01BRWZvQixJQUFJLEVB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