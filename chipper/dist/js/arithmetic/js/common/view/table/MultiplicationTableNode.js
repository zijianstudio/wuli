// Copyright 2014-2023, University of Colorado Boulder

/**
 * A Scenery node that represents a set of multiplication tables.  It contains a table for each of the levels in the
 * provided levelModels parameter, and handles the hiding and showing of the appropriate table based on the currently
 * active level.  Each table is made up of a set of cells that define the headers and the body of the table.
 *
 * This is generally used as a base class, and more specialized behavior is added in the descendent classes.
 *
 * @author Andrey Zelenkov (MLearner)
 * @author John Blanco
 */

import Dimension2 from '../../../../../dot/js/Dimension2.js';
import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import ScreenView from '../../../../../joist/js/ScreenView.js';
import MathSymbols from '../../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../../scenery/js/imports.js';
import Animation from '../../../../../twixt/js/Animation.js';
import Easing from '../../../../../twixt/js/Easing.js';
import arithmetic from '../../../arithmetic.js';
import ArithmeticConstants from '../../ArithmeticConstants.js';
import GameState from '../../model/GameState.js';
import MultiplicationTableBodyCell from './MultiplicationTableBodyCell.js';
import MultiplicationTableHeaderCell from './MultiplicationTableHeaderCell.js';

// constants
const TABLE_SIZE = new Dimension2(434, 320); // table size in screen coordinates, empirically determined
const ANSWER_ANIMATION_TIME = 0.8; // in seconds

// Starting point for the animation of the answer.  It is not ideal that this is a constant, because it means that if
// the layout changes, this will need to be manually updated, but it's tricky to get it coordinated with the layout
// in some other way.
const ANSWER_ANIMATION_ORIGIN = new Vector2(370, 380);
class MultiplicationTableNode extends Node {
  /**
   * @param {Property.<number>} levelNumberProperty - level property.
   * @param {Property.<GameState>} stateProperty - current state property
   * @param {Array.<LevelModel>} levelModels - array of models for each level
   * @param {boolean} animateAnswer - flag that controls whether answer appears to fly into the cell or just appears
   */
  constructor(levelNumberProperty, stateProperty, levelModels, animateAnswer) {
    super();
    this.levelNumberProperty = levelNumberProperty; // @protected - needs to be available to sub-classes
    this.viewForLevel = new Array(levelModels.length); // @private - array with views for each level

    // @private - three-dimensional array of the cells, indexed by [levelNumber][multiplicand][multiplier]
    this.cells = new Array(levelModels.length);

    // add stroke for all multiplication table views
    const backgroundRect = new Rectangle(0, 0, 0, 0, {
      fill: 'white',
      cursor: 'pointer' // this is done so that the cursor doesn't change when moving between cells
    });

    this.addChild(backgroundRect);

    // create view of multiplication table for each of the levels
    levelModels.forEach((level, levelIndex) => {
      const tableSize = level.tableSize;
      const cellOptions = {
        lineWidth: Math.max(Math.ceil(TABLE_SIZE.width / (tableSize + 1) / 40), 2),
        width: TABLE_SIZE.width / (tableSize + 1),
        height: TABLE_SIZE.height / (tableSize + 1)
      };
      const levelRootNode = new Node({
        visible: false
      }); // root node for a single level
      let row;
      let column;

      // init store for cells
      this.cells[levelIndex] = new Array(tableSize + 1);
      let cell;
      let cellTop = 0;
      let cellLeft = 0;

      // create the table row by row
      for (row = 0; row <= tableSize; row++) {
        this.cells[levelIndex][row] = new Array(tableSize + 1);

        // first row
        if (row === 0) {
          for (column = 0; column <= tableSize; column++) {
            // first cell is the multiplier operator, others are multipliers
            if (column === 0) {
              cell = new MultiplicationTableHeaderCell(MathSymbols.TIMES, cellOptions, {
                // specify font and size, equation empirically determined, makes font smaller for larger tables
                font: new PhetFont({
                  size: Utils.roundSymmetric(cellOptions.height * 0.85)
                })
              });
            } else {
              cell = new MultiplicationTableHeaderCell(column.toString(), cellOptions);
            }
            cell.top = cellTop;
            cell.left = cellLeft;
            cellLeft += cellOptions.width;
            levelRootNode.addChild(cell);
            this.cells[levelIndex][row][column] = cell;
          }
        }

        // other rows
        else {
          for (column = 0; column <= tableSize; column++) {
            // first cell in each row is a multiplier, others are products
            if (column === 0) {
              cell = new MultiplicationTableHeaderCell(row.toString(), cellOptions);
            } else {
              cell = new MultiplicationTableBodyCell((row * column).toString(), cellOptions);
            }
            cell.top = cellTop;
            cell.left = cellLeft;
            cellLeft += cellOptions.width;
            levelRootNode.addChild(cell);
            this.cells[levelIndex][row][column] = cell;
          }
        }
        cellTop += cellOptions.height;
        cellLeft = 0;
      }

      // add view to node
      this.addChild(levelRootNode);

      // save view
      this.viewForLevel[levelIndex] = levelRootNode;
    });

    // set background size
    backgroundRect.setRectWidth(this.bounds.width);
    backgroundRect.setRectHeight(this.bounds.height);
    levelNumberProperty.link((levelNumberCurrent, levelNumberPrev) => {
      // show multiplication table view for the current level
      if (this.viewForLevel[levelNumberCurrent]) {
        this.viewForLevel[levelNumberCurrent].visible = true;
      }

      // hide previous multiplication table view
      if (this.viewForLevel[levelNumberPrev]) {
        this.viewForLevel[levelNumberPrev].visible = false;
      }
    });

    // @private - node that will be used to animate the answer moving from the equation to the position of the cell.
    this.flyingProduct = new Text('X', {
      font: ArithmeticConstants.EQUATION_FONT_TEXT,
      fill: 'white',
      visible: false
    });
    this.addChild(this.flyingProduct);

    // @private - define the animation that will move the flying product
    this.flyingProductAnimation = null;

    // update the visible answers each time the user gets a correct answer
    stateProperty.link((newState, oldState) => {
      if (newState === GameState.DISPLAYING_CORRECT_ANSWER_FEEDBACK || oldState === GameState.SELECTING_LEVEL) {
        const level = levelNumberProperty.value; // convenience var
        const levelModel = levelModels[level]; // convenience var

        // make sure the appropriate cells are displaying their numerical values
        for (let multiplicand = 1; multiplicand <= levelModel.tableSize; multiplicand++) {
          for (let multiplier = 1; multiplier <= levelModel.tableSize; multiplier++) {
            const cell = this.cells[levelNumberProperty.value][multiplicand][multiplier];
            if (levelModel.isCellUsed(multiplicand, multiplier)) {
              // If the cell is marked as used but the text is not yet visible, animate the product to the cell.
              if (animateAnswer && !cell.isTextVisible()) {
                // Animate the product moving from the equation to the appropriate cell within the table.
                (() => {
                  const destinationCell = cell;
                  this.flyingProduct.string = destinationCell.getTextString();
                  this.flyingProduct.setScaleMagnitude(1);
                  const flyingProductDestination = this.globalToLocalPoint(destinationCell.parentToGlobalPoint(destinationCell.center));

                  // create the animation
                  this.flyingProductAnimation = new Animation({
                    duration: ANSWER_ANIMATION_TIME,
                    targets: [
                    // position
                    {
                      object: this.flyingProduct,
                      attribute: 'center',
                      from: ANSWER_ANIMATION_ORIGIN,
                      to: flyingProductDestination,
                      easing: Easing.CUBIC_IN_OUT
                    },
                    // scale
                    {
                      from: 1,
                      to: destinationCell.getTextHeight() / this.flyingProduct.height,
                      setValue: newScale => {
                        this.flyingProduct.setScaleMagnitude(newScale);
                      },
                      easing: Easing.CUBIC_IN_OUT
                    }]
                  });
                  this.flyingProductAnimation.beginEmitter.addListener(() => {
                    this.flyingProduct.visible = true;
                  });
                  this.flyingProductAnimation.finishEmitter.addListener(() => {
                    destinationCell.showText();
                    this.flyingProduct.visible = false;
                    this.flyingProductAnimation = null;
                  });

                  // start the animation
                  this.flyingProductAnimation.start();
                })();
              } else {
                // No animation, so just show the text.
                cell.showText();
              }
            } else {
              cell.hideText();
            }
          }
        }
      }
    });
  }

  /**
   * Set all cells for given level to the default background color
   * @param {number} level
   * @public
   */
  setCellsToDefaultColor(level) {
    this.cells[level].forEach(multiplicands => {
      multiplicands.forEach(cell => {
        cell.setNormal();
      });
    });
  }

  /**
   * Clear all cells for the given level, meaning that the text is hidden and the background color is set to default.
   * @param {number} level
   * @public
   */
  clearCells(level) {
    this.setCellsToDefaultColor(level);
    this.cells[level].forEach((cellRow, cellRowIndex) => {
      if (cellRowIndex > 0) {
        cellRow.forEach((cell, index) => {
          if (index > 0) {
            cell.hideText();
          }
        });
      }
    });
  }

  // @public - refresh the level, may need additional behavior added by subclasses
  refreshLevel(level) {
    if (this.flyingProductAnimation) {
      // A refresh was initiated while the animation was in progress.  This is a race condition, and details about
      // it can be seen in https://github.com/phetsims/arithmetic/issues/148.  The animation should be cancelled.
      this.flyingProductAnimation.stop();
      self.flyingProductAnimation = null;
      this.flyingProduct.visible = false;
    }
    this.clearCells(level);
  }

  /**
   * Get the position, in global coordinates, of the specified cell.
   *
   * @param level
   * @param column
   * @param row
   * @public
   */
  whereIsCellCenter(level, column, row) {
    // Find the parent screen by moving up the scene graph.
    const cell = this.cells[level][row][column];
    let testNode = cell;
    let parentScreen = null;
    while (testNode !== null) {
      if (testNode instanceof ScreenView) {
        parentScreen = testNode;
        break;
      }
      testNode = testNode.parents[0]; // Move up the scene graph by one level
    }

    return parentScreen.globalToLocalPoint(cell.parentToGlobalPoint(cell.center));
  }
}
arithmetic.register('MultiplicationTableNode', MultiplicationTableNode);
export default MultiplicationTableNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIk1hdGhTeW1ib2xzIiwiUGhldEZvbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkFuaW1hdGlvbiIsIkVhc2luZyIsImFyaXRobWV0aWMiLCJBcml0aG1ldGljQ29uc3RhbnRzIiwiR2FtZVN0YXRlIiwiTXVsdGlwbGljYXRpb25UYWJsZUJvZHlDZWxsIiwiTXVsdGlwbGljYXRpb25UYWJsZUhlYWRlckNlbGwiLCJUQUJMRV9TSVpFIiwiQU5TV0VSX0FOSU1BVElPTl9USU1FIiwiQU5TV0VSX0FOSU1BVElPTl9PUklHSU4iLCJNdWx0aXBsaWNhdGlvblRhYmxlTm9kZSIsImNvbnN0cnVjdG9yIiwibGV2ZWxOdW1iZXJQcm9wZXJ0eSIsInN0YXRlUHJvcGVydHkiLCJsZXZlbE1vZGVscyIsImFuaW1hdGVBbnN3ZXIiLCJ2aWV3Rm9yTGV2ZWwiLCJBcnJheSIsImxlbmd0aCIsImNlbGxzIiwiYmFja2dyb3VuZFJlY3QiLCJmaWxsIiwiY3Vyc29yIiwiYWRkQ2hpbGQiLCJmb3JFYWNoIiwibGV2ZWwiLCJsZXZlbEluZGV4IiwidGFibGVTaXplIiwiY2VsbE9wdGlvbnMiLCJsaW5lV2lkdGgiLCJNYXRoIiwibWF4IiwiY2VpbCIsIndpZHRoIiwiaGVpZ2h0IiwibGV2ZWxSb290Tm9kZSIsInZpc2libGUiLCJyb3ciLCJjb2x1bW4iLCJjZWxsIiwiY2VsbFRvcCIsImNlbGxMZWZ0IiwiVElNRVMiLCJmb250Iiwic2l6ZSIsInJvdW5kU3ltbWV0cmljIiwidG9TdHJpbmciLCJ0b3AiLCJsZWZ0Iiwic2V0UmVjdFdpZHRoIiwiYm91bmRzIiwic2V0UmVjdEhlaWdodCIsImxpbmsiLCJsZXZlbE51bWJlckN1cnJlbnQiLCJsZXZlbE51bWJlclByZXYiLCJmbHlpbmdQcm9kdWN0IiwiRVFVQVRJT05fRk9OVF9URVhUIiwiZmx5aW5nUHJvZHVjdEFuaW1hdGlvbiIsIm5ld1N0YXRlIiwib2xkU3RhdGUiLCJESVNQTEFZSU5HX0NPUlJFQ1RfQU5TV0VSX0ZFRURCQUNLIiwiU0VMRUNUSU5HX0xFVkVMIiwidmFsdWUiLCJsZXZlbE1vZGVsIiwibXVsdGlwbGljYW5kIiwibXVsdGlwbGllciIsImlzQ2VsbFVzZWQiLCJpc1RleHRWaXNpYmxlIiwiZGVzdGluYXRpb25DZWxsIiwic3RyaW5nIiwiZ2V0VGV4dFN0cmluZyIsInNldFNjYWxlTWFnbml0dWRlIiwiZmx5aW5nUHJvZHVjdERlc3RpbmF0aW9uIiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwicGFyZW50VG9HbG9iYWxQb2ludCIsImNlbnRlciIsImR1cmF0aW9uIiwidGFyZ2V0cyIsIm9iamVjdCIsImF0dHJpYnV0ZSIsImZyb20iLCJ0byIsImVhc2luZyIsIkNVQklDX0lOX09VVCIsImdldFRleHRIZWlnaHQiLCJzZXRWYWx1ZSIsIm5ld1NjYWxlIiwiYmVnaW5FbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJmaW5pc2hFbWl0dGVyIiwic2hvd1RleHQiLCJzdGFydCIsImhpZGVUZXh0Iiwic2V0Q2VsbHNUb0RlZmF1bHRDb2xvciIsIm11bHRpcGxpY2FuZHMiLCJzZXROb3JtYWwiLCJjbGVhckNlbGxzIiwiY2VsbFJvdyIsImNlbGxSb3dJbmRleCIsImluZGV4IiwicmVmcmVzaExldmVsIiwic3RvcCIsInNlbGYiLCJ3aGVyZUlzQ2VsbENlbnRlciIsInRlc3ROb2RlIiwicGFyZW50U2NyZWVuIiwicGFyZW50cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTXVsdGlwbGljYXRpb25UYWJsZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBTY2VuZXJ5IG5vZGUgdGhhdCByZXByZXNlbnRzIGEgc2V0IG9mIG11bHRpcGxpY2F0aW9uIHRhYmxlcy4gIEl0IGNvbnRhaW5zIGEgdGFibGUgZm9yIGVhY2ggb2YgdGhlIGxldmVscyBpbiB0aGVcclxuICogcHJvdmlkZWQgbGV2ZWxNb2RlbHMgcGFyYW1ldGVyLCBhbmQgaGFuZGxlcyB0aGUgaGlkaW5nIGFuZCBzaG93aW5nIG9mIHRoZSBhcHByb3ByaWF0ZSB0YWJsZSBiYXNlZCBvbiB0aGUgY3VycmVudGx5XHJcbiAqIGFjdGl2ZSBsZXZlbC4gIEVhY2ggdGFibGUgaXMgbWFkZSB1cCBvZiBhIHNldCBvZiBjZWxscyB0aGF0IGRlZmluZSB0aGUgaGVhZGVycyBhbmQgdGhlIGJvZHkgb2YgdGhlIHRhYmxlLlxyXG4gKlxyXG4gKiBUaGlzIGlzIGdlbmVyYWxseSB1c2VkIGFzIGEgYmFzZSBjbGFzcywgYW5kIG1vcmUgc3BlY2lhbGl6ZWQgYmVoYXZpb3IgaXMgYWRkZWQgaW4gdGhlIGRlc2NlbmRlbnQgY2xhc3Nlcy5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1MZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IGFyaXRobWV0aWMgZnJvbSAnLi4vLi4vLi4vYXJpdGhtZXRpYy5qcyc7XHJcbmltcG9ydCBBcml0aG1ldGljQ29uc3RhbnRzIGZyb20gJy4uLy4uL0FyaXRobWV0aWNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgR2FtZVN0YXRlIGZyb20gJy4uLy4uL21vZGVsL0dhbWVTdGF0ZS5qcyc7XHJcbmltcG9ydCBNdWx0aXBsaWNhdGlvblRhYmxlQm9keUNlbGwgZnJvbSAnLi9NdWx0aXBsaWNhdGlvblRhYmxlQm9keUNlbGwuanMnO1xyXG5pbXBvcnQgTXVsdGlwbGljYXRpb25UYWJsZUhlYWRlckNlbGwgZnJvbSAnLi9NdWx0aXBsaWNhdGlvblRhYmxlSGVhZGVyQ2VsbC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVEFCTEVfU0laRSA9IG5ldyBEaW1lbnNpb24yKCA0MzQsIDMyMCApOyAvLyB0YWJsZSBzaXplIGluIHNjcmVlbiBjb29yZGluYXRlcywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5jb25zdCBBTlNXRVJfQU5JTUFUSU9OX1RJTUUgPSAwLjg7IC8vIGluIHNlY29uZHNcclxuXHJcbi8vIFN0YXJ0aW5nIHBvaW50IGZvciB0aGUgYW5pbWF0aW9uIG9mIHRoZSBhbnN3ZXIuICBJdCBpcyBub3QgaWRlYWwgdGhhdCB0aGlzIGlzIGEgY29uc3RhbnQsIGJlY2F1c2UgaXQgbWVhbnMgdGhhdCBpZlxyXG4vLyB0aGUgbGF5b3V0IGNoYW5nZXMsIHRoaXMgd2lsbCBuZWVkIHRvIGJlIG1hbnVhbGx5IHVwZGF0ZWQsIGJ1dCBpdCdzIHRyaWNreSB0byBnZXQgaXQgY29vcmRpbmF0ZWQgd2l0aCB0aGUgbGF5b3V0XHJcbi8vIGluIHNvbWUgb3RoZXIgd2F5LlxyXG5jb25zdCBBTlNXRVJfQU5JTUFUSU9OX09SSUdJTiA9IG5ldyBWZWN0b3IyKCAzNzAsIDM4MCApO1xyXG5cclxuY2xhc3MgTXVsdGlwbGljYXRpb25UYWJsZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gbGV2ZWxOdW1iZXJQcm9wZXJ0eSAtIGxldmVsIHByb3BlcnR5LlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPEdhbWVTdGF0ZT59IHN0YXRlUHJvcGVydHkgLSBjdXJyZW50IHN0YXRlIHByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtBcnJheS48TGV2ZWxNb2RlbD59IGxldmVsTW9kZWxzIC0gYXJyYXkgb2YgbW9kZWxzIGZvciBlYWNoIGxldmVsXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbmltYXRlQW5zd2VyIC0gZmxhZyB0aGF0IGNvbnRyb2xzIHdoZXRoZXIgYW5zd2VyIGFwcGVhcnMgdG8gZmx5IGludG8gdGhlIGNlbGwgb3IganVzdCBhcHBlYXJzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGxldmVsTnVtYmVyUHJvcGVydHksIHN0YXRlUHJvcGVydHksIGxldmVsTW9kZWxzLCBhbmltYXRlQW5zd2VyICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLmxldmVsTnVtYmVyUHJvcGVydHkgPSBsZXZlbE51bWJlclByb3BlcnR5OyAvLyBAcHJvdGVjdGVkIC0gbmVlZHMgdG8gYmUgYXZhaWxhYmxlIHRvIHN1Yi1jbGFzc2VzXHJcbiAgICB0aGlzLnZpZXdGb3JMZXZlbCA9IG5ldyBBcnJheSggbGV2ZWxNb2RlbHMubGVuZ3RoICk7IC8vIEBwcml2YXRlIC0gYXJyYXkgd2l0aCB2aWV3cyBmb3IgZWFjaCBsZXZlbFxyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhyZWUtZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIGNlbGxzLCBpbmRleGVkIGJ5IFtsZXZlbE51bWJlcl1bbXVsdGlwbGljYW5kXVttdWx0aXBsaWVyXVxyXG4gICAgdGhpcy5jZWxscyA9IG5ldyBBcnJheSggbGV2ZWxNb2RlbHMubGVuZ3RoICk7XHJcblxyXG4gICAgLy8gYWRkIHN0cm9rZSBmb3IgYWxsIG11bHRpcGxpY2F0aW9uIHRhYmxlIHZpZXdzXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kUmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDAsIDAsIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicgLy8gdGhpcyBpcyBkb25lIHNvIHRoYXQgdGhlIGN1cnNvciBkb2Vzbid0IGNoYW5nZSB3aGVuIG1vdmluZyBiZXR3ZWVuIGNlbGxzXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiYWNrZ3JvdW5kUmVjdCApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB2aWV3IG9mIG11bHRpcGxpY2F0aW9uIHRhYmxlIGZvciBlYWNoIG9mIHRoZSBsZXZlbHNcclxuICAgIGxldmVsTW9kZWxzLmZvckVhY2goICggbGV2ZWwsIGxldmVsSW5kZXggKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRhYmxlU2l6ZSA9IGxldmVsLnRhYmxlU2l6ZTtcclxuICAgICAgY29uc3QgY2VsbE9wdGlvbnMgPSB7XHJcbiAgICAgICAgbGluZVdpZHRoOiBNYXRoLm1heCggTWF0aC5jZWlsKCAoIFRBQkxFX1NJWkUud2lkdGggLyAoIHRhYmxlU2l6ZSArIDEgKSApIC8gNDAgKSwgMiApLFxyXG4gICAgICAgIHdpZHRoOiBUQUJMRV9TSVpFLndpZHRoIC8gKCB0YWJsZVNpemUgKyAxICksXHJcbiAgICAgICAgaGVpZ2h0OiBUQUJMRV9TSVpFLmhlaWdodCAvICggdGFibGVTaXplICsgMSApXHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IGxldmVsUm9vdE5vZGUgPSBuZXcgTm9kZSggeyB2aXNpYmxlOiBmYWxzZSB9ICk7IC8vIHJvb3Qgbm9kZSBmb3IgYSBzaW5nbGUgbGV2ZWxcclxuICAgICAgbGV0IHJvdztcclxuICAgICAgbGV0IGNvbHVtbjtcclxuXHJcbiAgICAgIC8vIGluaXQgc3RvcmUgZm9yIGNlbGxzXHJcbiAgICAgIHRoaXMuY2VsbHNbIGxldmVsSW5kZXggXSA9IG5ldyBBcnJheSggdGFibGVTaXplICsgMSApO1xyXG5cclxuICAgICAgbGV0IGNlbGw7XHJcbiAgICAgIGxldCBjZWxsVG9wID0gMDtcclxuICAgICAgbGV0IGNlbGxMZWZ0ID0gMDtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSB0aGUgdGFibGUgcm93IGJ5IHJvd1xyXG4gICAgICBmb3IgKCByb3cgPSAwOyByb3cgPD0gdGFibGVTaXplOyByb3crKyApIHtcclxuICAgICAgICB0aGlzLmNlbGxzWyBsZXZlbEluZGV4IF1bIHJvdyBdID0gbmV3IEFycmF5KCB0YWJsZVNpemUgKyAxICk7XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IHJvd1xyXG4gICAgICAgIGlmICggcm93ID09PSAwICkge1xyXG4gICAgICAgICAgZm9yICggY29sdW1uID0gMDsgY29sdW1uIDw9IHRhYmxlU2l6ZTsgY29sdW1uKysgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBmaXJzdCBjZWxsIGlzIHRoZSBtdWx0aXBsaWVyIG9wZXJhdG9yLCBvdGhlcnMgYXJlIG11bHRpcGxpZXJzXHJcbiAgICAgICAgICAgIGlmICggY29sdW1uID09PSAwICkge1xyXG4gICAgICAgICAgICAgIGNlbGwgPSBuZXcgTXVsdGlwbGljYXRpb25UYWJsZUhlYWRlckNlbGwoIE1hdGhTeW1ib2xzLlRJTUVTLCBjZWxsT3B0aW9ucywge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNwZWNpZnkgZm9udCBhbmQgc2l6ZSwgZXF1YXRpb24gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCwgbWFrZXMgZm9udCBzbWFsbGVyIGZvciBsYXJnZXIgdGFibGVzXHJcbiAgICAgICAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogVXRpbHMucm91bmRTeW1tZXRyaWMoIGNlbGxPcHRpb25zLmhlaWdodCAqIDAuODUgKSB9IClcclxuICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2VsbCA9IG5ldyBNdWx0aXBsaWNhdGlvblRhYmxlSGVhZGVyQ2VsbCggY29sdW1uLnRvU3RyaW5nKCksIGNlbGxPcHRpb25zICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2VsbC50b3AgPSBjZWxsVG9wO1xyXG4gICAgICAgICAgICBjZWxsLmxlZnQgPSBjZWxsTGVmdDtcclxuICAgICAgICAgICAgY2VsbExlZnQgKz0gY2VsbE9wdGlvbnMud2lkdGg7XHJcbiAgICAgICAgICAgIGxldmVsUm9vdE5vZGUuYWRkQ2hpbGQoIGNlbGwgKTtcclxuICAgICAgICAgICAgdGhpcy5jZWxsc1sgbGV2ZWxJbmRleCBdWyByb3cgXVsgY29sdW1uIF0gPSBjZWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb3RoZXIgcm93c1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgZm9yICggY29sdW1uID0gMDsgY29sdW1uIDw9IHRhYmxlU2l6ZTsgY29sdW1uKysgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBmaXJzdCBjZWxsIGluIGVhY2ggcm93IGlzIGEgbXVsdGlwbGllciwgb3RoZXJzIGFyZSBwcm9kdWN0c1xyXG4gICAgICAgICAgICBpZiAoIGNvbHVtbiA9PT0gMCApIHtcclxuICAgICAgICAgICAgICBjZWxsID0gbmV3IE11bHRpcGxpY2F0aW9uVGFibGVIZWFkZXJDZWxsKCByb3cudG9TdHJpbmcoKSwgY2VsbE9wdGlvbnMgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBjZWxsID0gbmV3IE11bHRpcGxpY2F0aW9uVGFibGVCb2R5Q2VsbChcclxuICAgICAgICAgICAgICAgICggcm93ICogY29sdW1uICkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgICAgIGNlbGxPcHRpb25zXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjZWxsLnRvcCA9IGNlbGxUb3A7XHJcbiAgICAgICAgICAgIGNlbGwubGVmdCA9IGNlbGxMZWZ0O1xyXG4gICAgICAgICAgICBjZWxsTGVmdCArPSBjZWxsT3B0aW9ucy53aWR0aDtcclxuICAgICAgICAgICAgbGV2ZWxSb290Tm9kZS5hZGRDaGlsZCggY2VsbCApO1xyXG4gICAgICAgICAgICB0aGlzLmNlbGxzWyBsZXZlbEluZGV4IF1bIHJvdyBdWyBjb2x1bW4gXSA9IGNlbGw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNlbGxUb3AgKz0gY2VsbE9wdGlvbnMuaGVpZ2h0O1xyXG4gICAgICAgIGNlbGxMZWZ0ID0gMDtcclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIC8vIGFkZCB2aWV3IHRvIG5vZGVcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbGV2ZWxSb290Tm9kZSApO1xyXG5cclxuICAgICAgLy8gc2F2ZSB2aWV3XHJcbiAgICAgIHRoaXMudmlld0ZvckxldmVsWyBsZXZlbEluZGV4IF0gPSBsZXZlbFJvb3ROb2RlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNldCBiYWNrZ3JvdW5kIHNpemVcclxuICAgIGJhY2tncm91bmRSZWN0LnNldFJlY3RXaWR0aCggdGhpcy5ib3VuZHMud2lkdGggKTtcclxuICAgIGJhY2tncm91bmRSZWN0LnNldFJlY3RIZWlnaHQoIHRoaXMuYm91bmRzLmhlaWdodCApO1xyXG5cclxuICAgIGxldmVsTnVtYmVyUHJvcGVydHkubGluayggKCBsZXZlbE51bWJlckN1cnJlbnQsIGxldmVsTnVtYmVyUHJldiApID0+IHtcclxuXHJcbiAgICAgIC8vIHNob3cgbXVsdGlwbGljYXRpb24gdGFibGUgdmlldyBmb3IgdGhlIGN1cnJlbnQgbGV2ZWxcclxuICAgICAgaWYgKCB0aGlzLnZpZXdGb3JMZXZlbFsgbGV2ZWxOdW1iZXJDdXJyZW50IF0gKSB7XHJcbiAgICAgICAgdGhpcy52aWV3Rm9yTGV2ZWxbIGxldmVsTnVtYmVyQ3VycmVudCBdLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBoaWRlIHByZXZpb3VzIG11bHRpcGxpY2F0aW9uIHRhYmxlIHZpZXdcclxuICAgICAgaWYgKCB0aGlzLnZpZXdGb3JMZXZlbFsgbGV2ZWxOdW1iZXJQcmV2IF0gKSB7XHJcbiAgICAgICAgdGhpcy52aWV3Rm9yTGV2ZWxbIGxldmVsTnVtYmVyUHJldiBdLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gbm9kZSB0aGF0IHdpbGwgYmUgdXNlZCB0byBhbmltYXRlIHRoZSBhbnN3ZXIgbW92aW5nIGZyb20gdGhlIGVxdWF0aW9uIHRvIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2VsbC5cclxuICAgIHRoaXMuZmx5aW5nUHJvZHVjdCA9IG5ldyBUZXh0KCAnWCcsIHtcclxuICAgICAgZm9udDogQXJpdGhtZXRpY0NvbnN0YW50cy5FUVVBVElPTl9GT05UX1RFWFQsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmZseWluZ1Byb2R1Y3QgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGRlZmluZSB0aGUgYW5pbWF0aW9uIHRoYXQgd2lsbCBtb3ZlIHRoZSBmbHlpbmcgcHJvZHVjdFxyXG4gICAgdGhpcy5mbHlpbmdQcm9kdWN0QW5pbWF0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHZpc2libGUgYW5zd2VycyBlYWNoIHRpbWUgdGhlIHVzZXIgZ2V0cyBhIGNvcnJlY3QgYW5zd2VyXHJcbiAgICBzdGF0ZVByb3BlcnR5LmxpbmsoICggbmV3U3RhdGUsIG9sZFN0YXRlICkgPT4ge1xyXG4gICAgICBpZiAoIG5ld1N0YXRlID09PSBHYW1lU3RhdGUuRElTUExBWUlOR19DT1JSRUNUX0FOU1dFUl9GRUVEQkFDSyB8fCBvbGRTdGF0ZSA9PT0gR2FtZVN0YXRlLlNFTEVDVElOR19MRVZFTCApIHtcclxuXHJcbiAgICAgICAgY29uc3QgbGV2ZWwgPSBsZXZlbE51bWJlclByb3BlcnR5LnZhbHVlOyAvLyBjb252ZW5pZW5jZSB2YXJcclxuICAgICAgICBjb25zdCBsZXZlbE1vZGVsID0gbGV2ZWxNb2RlbHNbIGxldmVsIF07IC8vIGNvbnZlbmllbmNlIHZhclxyXG5cclxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIGFwcHJvcHJpYXRlIGNlbGxzIGFyZSBkaXNwbGF5aW5nIHRoZWlyIG51bWVyaWNhbCB2YWx1ZXNcclxuICAgICAgICBmb3IgKCBsZXQgbXVsdGlwbGljYW5kID0gMTsgbXVsdGlwbGljYW5kIDw9IGxldmVsTW9kZWwudGFibGVTaXplOyBtdWx0aXBsaWNhbmQrKyApIHtcclxuICAgICAgICAgIGZvciAoIGxldCBtdWx0aXBsaWVyID0gMTsgbXVsdGlwbGllciA8PSBsZXZlbE1vZGVsLnRhYmxlU2l6ZTsgbXVsdGlwbGllcisrICkge1xyXG4gICAgICAgICAgICBjb25zdCBjZWxsID0gdGhpcy5jZWxsc1sgbGV2ZWxOdW1iZXJQcm9wZXJ0eS52YWx1ZSBdWyBtdWx0aXBsaWNhbmQgXVsgbXVsdGlwbGllciBdO1xyXG4gICAgICAgICAgICBpZiAoIGxldmVsTW9kZWwuaXNDZWxsVXNlZCggbXVsdGlwbGljYW5kLCBtdWx0aXBsaWVyICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmIHRoZSBjZWxsIGlzIG1hcmtlZCBhcyB1c2VkIGJ1dCB0aGUgdGV4dCBpcyBub3QgeWV0IHZpc2libGUsIGFuaW1hdGUgdGhlIHByb2R1Y3QgdG8gdGhlIGNlbGwuXHJcbiAgICAgICAgICAgICAgaWYgKCBhbmltYXRlQW5zd2VyICYmICFjZWxsLmlzVGV4dFZpc2libGUoKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBbmltYXRlIHRoZSBwcm9kdWN0IG1vdmluZyBmcm9tIHRoZSBlcXVhdGlvbiB0byB0aGUgYXBwcm9wcmlhdGUgY2VsbCB3aXRoaW4gdGhlIHRhYmxlLlxyXG4gICAgICAgICAgICAgICAgKCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc3RpbmF0aW9uQ2VsbCA9IGNlbGw7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZmx5aW5nUHJvZHVjdC5zdHJpbmcgPSBkZXN0aW5hdGlvbkNlbGwuZ2V0VGV4dFN0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmZseWluZ1Byb2R1Y3Quc2V0U2NhbGVNYWduaXR1ZGUoIDEgKTtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgZmx5aW5nUHJvZHVjdERlc3RpbmF0aW9uID0gdGhpcy5nbG9iYWxUb0xvY2FsUG9pbnQoIGRlc3RpbmF0aW9uQ2VsbC5wYXJlbnRUb0dsb2JhbFBvaW50KCBkZXN0aW5hdGlvbkNlbGwuY2VudGVyICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZmx5aW5nUHJvZHVjdEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogQU5TV0VSX0FOSU1BVElPTl9USU1FLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldHM6IFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBwb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Q6IHRoaXMuZmx5aW5nUHJvZHVjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogQU5TV0VSX0FOSU1BVElPTl9PUklHSU4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBmbHlpbmdQcm9kdWN0RGVzdGluYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVFxyXG4gICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZVxyXG4gICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogZGVzdGluYXRpb25DZWxsLmdldFRleHRIZWlnaHQoKSAvIHRoaXMuZmx5aW5nUHJvZHVjdC5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlOiBuZXdTY2FsZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbHlpbmdQcm9kdWN0LnNldFNjYWxlTWFnbml0dWRlKCBuZXdTY2FsZSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5mbHlpbmdQcm9kdWN0QW5pbWF0aW9uLmJlZ2luRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmx5aW5nUHJvZHVjdC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmZseWluZ1Byb2R1Y3RBbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uQ2VsbC5zaG93VGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmx5aW5nUHJvZHVjdC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mbHlpbmdQcm9kdWN0QW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gc3RhcnQgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgICAgICAgICAgICB0aGlzLmZseWluZ1Byb2R1Y3RBbmltYXRpb24uc3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIH0gKSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIE5vIGFuaW1hdGlvbiwgc28ganVzdCBzaG93IHRoZSB0ZXh0LlxyXG4gICAgICAgICAgICAgICAgY2VsbC5zaG93VGV4dCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBjZWxsLmhpZGVUZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBhbGwgY2VsbHMgZm9yIGdpdmVuIGxldmVsIHRvIHRoZSBkZWZhdWx0IGJhY2tncm91bmQgY29sb3JcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0Q2VsbHNUb0RlZmF1bHRDb2xvciggbGV2ZWwgKSB7XHJcbiAgICB0aGlzLmNlbGxzWyBsZXZlbCBdLmZvckVhY2goIG11bHRpcGxpY2FuZHMgPT4ge1xyXG4gICAgICBtdWx0aXBsaWNhbmRzLmZvckVhY2goIGNlbGwgPT4ge1xyXG4gICAgICAgIGNlbGwuc2V0Tm9ybWFsKCk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIGFsbCBjZWxscyBmb3IgdGhlIGdpdmVuIGxldmVsLCBtZWFuaW5nIHRoYXQgdGhlIHRleHQgaXMgaGlkZGVuIGFuZCB0aGUgYmFja2dyb3VuZCBjb2xvciBpcyBzZXQgdG8gZGVmYXVsdC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXJDZWxscyggbGV2ZWwgKSB7XHJcbiAgICB0aGlzLnNldENlbGxzVG9EZWZhdWx0Q29sb3IoIGxldmVsICk7XHJcbiAgICB0aGlzLmNlbGxzWyBsZXZlbCBdLmZvckVhY2goICggY2VsbFJvdywgY2VsbFJvd0luZGV4ICkgPT4ge1xyXG4gICAgICBpZiAoIGNlbGxSb3dJbmRleCA+IDAgKSB7XHJcbiAgICAgICAgY2VsbFJvdy5mb3JFYWNoKCAoIGNlbGwsIGluZGV4ICkgPT4ge1xyXG4gICAgICAgICAgaWYgKCBpbmRleCA+IDAgKSB7XHJcbiAgICAgICAgICAgIGNlbGwuaGlkZVRleHQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgLSByZWZyZXNoIHRoZSBsZXZlbCwgbWF5IG5lZWQgYWRkaXRpb25hbCBiZWhhdmlvciBhZGRlZCBieSBzdWJjbGFzc2VzXHJcbiAgcmVmcmVzaExldmVsKCBsZXZlbCApIHtcclxuICAgIGlmICggdGhpcy5mbHlpbmdQcm9kdWN0QW5pbWF0aW9uICkge1xyXG5cclxuICAgICAgLy8gQSByZWZyZXNoIHdhcyBpbml0aWF0ZWQgd2hpbGUgdGhlIGFuaW1hdGlvbiB3YXMgaW4gcHJvZ3Jlc3MuICBUaGlzIGlzIGEgcmFjZSBjb25kaXRpb24sIGFuZCBkZXRhaWxzIGFib3V0XHJcbiAgICAgIC8vIGl0IGNhbiBiZSBzZWVuIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcml0aG1ldGljL2lzc3Vlcy8xNDguICBUaGUgYW5pbWF0aW9uIHNob3VsZCBiZSBjYW5jZWxsZWQuXHJcbiAgICAgIHRoaXMuZmx5aW5nUHJvZHVjdEFuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICAgIHNlbGYuZmx5aW5nUHJvZHVjdEFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgIHRoaXMuZmx5aW5nUHJvZHVjdC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLmNsZWFyQ2VsbHMoIGxldmVsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHBvc2l0aW9uLCBpbiBnbG9iYWwgY29vcmRpbmF0ZXMsIG9mIHRoZSBzcGVjaWZpZWQgY2VsbC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBsZXZlbFxyXG4gICAqIEBwYXJhbSBjb2x1bW5cclxuICAgKiBAcGFyYW0gcm93XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHdoZXJlSXNDZWxsQ2VudGVyKCBsZXZlbCwgY29sdW1uLCByb3cgKSB7XHJcblxyXG4gICAgLy8gRmluZCB0aGUgcGFyZW50IHNjcmVlbiBieSBtb3ZpbmcgdXAgdGhlIHNjZW5lIGdyYXBoLlxyXG4gICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbHNbIGxldmVsIF1bIHJvdyBdWyBjb2x1bW4gXTtcclxuICAgIGxldCB0ZXN0Tm9kZSA9IGNlbGw7XHJcbiAgICBsZXQgcGFyZW50U2NyZWVuID0gbnVsbDtcclxuICAgIHdoaWxlICggdGVzdE5vZGUgIT09IG51bGwgKSB7XHJcbiAgICAgIGlmICggdGVzdE5vZGUgaW5zdGFuY2VvZiBTY3JlZW5WaWV3ICkge1xyXG4gICAgICAgIHBhcmVudFNjcmVlbiA9IHRlc3ROb2RlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIHRlc3ROb2RlID0gdGVzdE5vZGUucGFyZW50c1sgMCBdOyAvLyBNb3ZlIHVwIHRoZSBzY2VuZSBncmFwaCBieSBvbmUgbGV2ZWxcclxuICAgIH1cclxuICAgIHJldHVybiBwYXJlbnRTY3JlZW4uZ2xvYmFsVG9Mb2NhbFBvaW50KCBjZWxsLnBhcmVudFRvR2xvYmFsUG9pbnQoIGNlbGwuY2VudGVyICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmFyaXRobWV0aWMucmVnaXN0ZXIoICdNdWx0aXBsaWNhdGlvblRhYmxlTm9kZScsIE11bHRpcGxpY2F0aW9uVGFibGVOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNdWx0aXBsaWNhdGlvblRhYmxlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxxQ0FBcUM7QUFDNUQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLFVBQVUsTUFBTSx1Q0FBdUM7QUFDOUQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxRQUFRLE1BQU0sNENBQTRDO0FBQ2pFLFNBQVNDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsc0NBQXNDO0FBQzVFLE9BQU9DLFNBQVMsTUFBTSxzQ0FBc0M7QUFDNUQsT0FBT0MsTUFBTSxNQUFNLG1DQUFtQztBQUN0RCxPQUFPQyxVQUFVLE1BQU0sd0JBQXdCO0FBQy9DLE9BQU9DLG1CQUFtQixNQUFNLDhCQUE4QjtBQUM5RCxPQUFPQyxTQUFTLE1BQU0sMEJBQTBCO0FBQ2hELE9BQU9DLDJCQUEyQixNQUFNLGtDQUFrQztBQUMxRSxPQUFPQyw2QkFBNkIsTUFBTSxvQ0FBb0M7O0FBRTlFO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUloQixVQUFVLENBQUUsR0FBRyxFQUFFLEdBQUksQ0FB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