// Copyright 2021-2023, University of Colorado Boulder

/**
 * Creates image views for base numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Color, Image, Node, Path } from '../../../../scenery/js/imports.js';
import digit0_png from '../../../mipmaps/digit0_png.js';
import digit1_png from '../../../mipmaps/digit1_png.js';
import digit2_png from '../../../mipmaps/digit2_png.js';
import digit3_png from '../../../mipmaps/digit3_png.js';
import digit4_png from '../../../mipmaps/digit4_png.js';
import digit5_png from '../../../mipmaps/digit5_png.js';
import digit6_png from '../../../mipmaps/digit6_png.js';
import digit7_png from '../../../mipmaps/digit7_png.js';
import digit8_png from '../../../mipmaps/digit8_png.js';
import digit9_png from '../../../mipmaps/digit9_png.js';
import paperBackground1000_png from '../../../mipmaps/paperBackground1000_png.js';
import paperBackground100_png from '../../../mipmaps/paperBackground100_png.js';
import paperBackground10_png from '../../../mipmaps/paperBackground10_png.js';
import paperBackground1_png from '../../../mipmaps/paperBackground1_png.js';
import countingCommon from '../../countingCommon.js';
import groupBackground1_png from '../../../mipmaps/groupBackground1_png.js';
import CountingObjectType from '../model/CountingObjectType.js';
import groupBackground10_png from '../../../mipmaps/groupBackground10_png.js';
import CountingCommonConstants from '../CountingCommonConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
// place => mipmap info
const BACKGROUND_IMAGE_MAP = new Map();
CountingObjectType.enumeration.values.forEach(countingObjectType => {
  if (countingObjectType === CountingObjectType.PAPER_NUMBER) {
    BACKGROUND_IMAGE_MAP.set(countingObjectType, {
      0: paperBackground1_png,
      1: paperBackground10_png,
      2: paperBackground100_png,
      3: paperBackground1000_png
    });
  } else {
    BACKGROUND_IMAGE_MAP.set(countingObjectType, {
      0: groupBackground1_png,
      1: groupBackground10_png
    });
  }
});

// digit => mipmap info
const DIGIT_IMAGE_MAP = {
  1: digit1_png,
  2: digit2_png,
  3: digit3_png,
  4: digit4_png,
  5: digit5_png,
  6: digit6_png,
  7: digit7_png,
  8: digit8_png,
  9: digit9_png
};

// place => x/y offsets for the first digit in each place
const PLACE_OFFSET_X = {
  0: 13.44,
  1: 13.02,
  2: 14.7,
  3: 19.74
};
const PLACE_OFFSET_Y = {
  0: 7.98,
  1: 12.39,
  2: 16.8,
  3: 21.42
};

// place => x/y offsets for the handle in each place
const PLACE_HANDLE_OFFSET_X = {
  0: 27.3,
  1: 29.82,
  2: 31.71,
  3: 35.91
};
const PLACE_HANDLE_OFFSET_Y = {
  0: 19.95,
  1: 15.54,
  2: 11.13,
  3: 6.51
};

// digit => horizontal offset for that digit (applied to all places, includes digit-specific information)
const DIGIT_OFFSET_X = {
  1: 16,
  2: -1.47,
  3: -1.47,
  4: -1.89,
  5: -3.78,
  6: -1.05,
  7: -5.04,
  8: -0.42,
  9: -2.1
};

// digit => horizontal offset, customized for each single digit base number
const FIRST_PLACE_DIGIT_OFFSET_X = {
  1: -12.81,
  2: 0,
  3: 0,
  4: 0,
  5: 1.05,
  6: 0,
  7: 3.15,
  8: 2.1,
  9: 3.15
};

// place => horizontal positions of the zeros in the base number
const ZERO_OFFSET = {
  0: [],
  1: [57.12],
  2: [111.3, 59.64],
  3: [173.25, 121.8, 70.35]
};

// distance that the handle stem should overlap with a paper number (since they don't have a clean edge, we want enough
// extra length to make sure there is no gap between the paper number background and the stem)
const PAPER_NUMBER_HANDLE_OVERLAP_Y = 2;
const HANDLE_LINE_WIDTH = 1.24;
const HANDLE_OUTER_CIRCLE_RADIUS = 4.6;
const HANDLE_INNER_CIRCLE_RADIUS = 2.1;
const HANDLE_COLOR_BLACK = Color.BLACK;
const HANDLE_COLOR_WHITE = Color.WHITE;
const IMAGE_SCALE = 0.21;
class BaseNumberNode extends Node {
  /**
   * Maps place (0-3) to a {Dimension2} with the width/height
   */
  static PAPER_NUMBER_DIMENSIONS = _.mapValues(BACKGROUND_IMAGE_MAP.get(CountingObjectType.PAPER_NUMBER), mipmap => new Dimension2(mipmap[0].width * IMAGE_SCALE, mipmap[0].height * IMAGE_SCALE));

  /**
   * Maps place (0-3) to a {Vector2} that is the offset of the upper-left corner of the BaseNumberNode relative to a
   * 1-digit BaseNumberNode.
   */
  static IMAGE_OFFSETS = [new Vector2(-21, 0), new Vector2(-70, -(PLACE_OFFSET_Y[1] - PLACE_OFFSET_Y[0])), new Vector2(-70 - (ZERO_OFFSET[2][0] - ZERO_OFFSET[1][0]), -(PLACE_OFFSET_Y[2] - PLACE_OFFSET_Y[0])), new Vector2(-70 - (ZERO_OFFSET[3][0] - ZERO_OFFSET[1][0]), -(PLACE_OFFSET_Y[3] - PLACE_OFFSET_Y[0]))];
  backgroundNode = null;
  constructor(baseNumber, opacity, providedOptions) {
    super();
    const options = optionize()({
      countingObjectType: CountingObjectType.PAPER_NUMBER,
      includeHandles: false,
      handleOffsetY: 0,
      groupingEnabled: true,
      isLargestBaseNumber: true,
      hasDescendant: false,
      isPartOfStack: false
    }, providedOptions);
    if (options.isLargestBaseNumber) {
      assert && assert(baseNumber.digit !== 0, 'largest base number cannot be 0');
    }
    let groupingEnabled = options.groupingEnabled;
    if (providedOptions === undefined || providedOptions?.groupingEnabled === undefined) {
      groupingEnabled = options.countingObjectType === CountingObjectType.PAPER_NUMBER;
    }

    // Paper numbers are countingObjects that have digits on a paper-like background instead of objects on a card.
    const isPaperNumber = options.countingObjectType === CountingObjectType.PAPER_NUMBER;
    assert && !groupingEnabled && assert(options.countingObjectType !== CountingObjectType.PAPER_NUMBER, 'Paper numbers are not allowed to turn off grouping.');

    // Translate everything by our offset
    this.translation = baseNumber.offset;

    // The off-white rectangle with a gray border, can have messy edges like ripped paper or clean edges like a card.
    const backgroundNode = new Image(BACKGROUND_IMAGE_MAP.get(options.countingObjectType)[baseNumber.place], {
      imageOpacity: opacity,
      scale: IMAGE_SCALE
    });
    const isStandaloneOne = baseNumber.numberValue === 1 && !options.isPartOfStack;

    // In this case, the largest BaseNumber doesn't get a handle. For example, with the paper number 1200, the 1 should
    // not get a handle because grabbing it would pull 1000 away from 200, and this can be accomplished by pulling the
    // 200 off instead. In the case of 2200, the first 2 should get a handle because grabbing it would pull off one 1000.
    const isOneAndLargestWithDescendants = options.isLargestBaseNumber && baseNumber.digit === 1 && options.hasDescendant;

    // Handle-drawing logic, drawing unless:
    //  * this base number is a standalone 1
    //  * removing the largest base number in this paper number would separate itself from its descendants
    if (options.includeHandles && !isStandaloneOne && !isOneAndLargestWithDescendants) {
      const handleOverlapLength = isPaperNumber ? PAPER_NUMBER_HANDLE_OVERLAP_Y : 0;
      const handleOverlapCompensation = PAPER_NUMBER_HANDLE_OVERLAP_Y - handleOverlapLength;
      const handleOffsetY = PLACE_HANDLE_OFFSET_Y[baseNumber.place] + options.handleOffsetY - handleOverlapCompensation;

      // The handle that attaches to the paper
      const handleStemShape = new Shape().moveTo(0, 0).lineTo(0, handleOffsetY);
      this.handleNode = new Node();
      this.addChild(this.handleNode);
      const handleStemNode = new Path(handleStemShape, {
        stroke: HANDLE_COLOR_BLACK,
        lineWidth: HANDLE_LINE_WIDTH
      });
      handleStemNode.centerX = options.hasDescendant ? PLACE_HANDLE_OFFSET_X[baseNumber.place] : backgroundNode.centerX;
      handleStemNode.bottom = backgroundNode.top + handleOverlapLength;
      this.handleNode.addChild(handleStemNode);
      let handleCircle;
      if (options.isLargestBaseNumber) {
        handleCircle = new Circle(HANDLE_OUTER_CIRCLE_RADIUS, {
          fill: HANDLE_COLOR_WHITE,
          stroke: HANDLE_COLOR_BLACK,
          lineWidth: HANDLE_LINE_WIDTH
        });
        handleCircle.addChild(new Circle(HANDLE_INNER_CIRCLE_RADIUS, {
          fill: HANDLE_COLOR_BLACK
        }));
      } else {
        handleCircle = new Circle(HANDLE_OUTER_CIRCLE_RADIUS, {
          fill: HANDLE_COLOR_BLACK
        });
      }
      handleCircle.centerX = handleStemNode.centerX;
      handleCircle.bottom = handleStemNode.top;
      this.handleNode.addChild(handleCircle);
    }

    // add the background paper on top of the handle
    if (groupingEnabled) {
      this.addChild(backgroundNode);
      this.backgroundNode = backgroundNode;
    }

    // Add a value representation depending on our CountingObjectType.
    if (isPaperNumber) {
      // Position of the initial digit
      let x = PLACE_OFFSET_X[baseNumber.place] + DIGIT_OFFSET_X[baseNumber.digit];
      const y = PLACE_OFFSET_Y[baseNumber.place];

      // We need to slightly offset some
      if (baseNumber.place === 0) {
        x += FIRST_PLACE_DIGIT_OFFSET_X[baseNumber.digit];
      }

      // The initial (non-zero) digit
      this.addChild(new Image(DIGIT_IMAGE_MAP[baseNumber.digit], {
        x: x,
        y: y,
        scale: IMAGE_SCALE
      }));

      // Add the zeros
      const digitZeroOffsets = ZERO_OFFSET[baseNumber.place];
      for (let i = 0; i < digitZeroOffsets.length; i++) {
        this.addChild(new Image(digit0_png, {
          x: digitZeroOffsets[i],
          y: y,
          scale: IMAGE_SCALE
        }));
      }
    } else {
      // If not a paper number, add images of our CountingObjectType.

      const value = baseNumber.numberValue;
      let numberOfRows = 5;
      let numberOfColumns = 2;
      let objectScale = 0.3;

      // If there is just a single, unstacked One
      if (value === CountingCommonConstants.ONE && !options.isPartOfStack) {
        numberOfRows = 1;
        numberOfColumns = 1;
        objectScale = 1;
      }

      // Each value is broken up into groups of 10, called a set. If greater than 10, the remainder will probably
      // be handled by a descendant card, except when exactly a multiple of 10 which won't have descendant cards.
      const numberOfSets = value === CountingCommonConstants.MAX_IMAGES_PER_COUNTING_OBJECT ? 2 : 1;
      const fullObjectWidth = CountingCommonConstants.COUNTING_OBJECT_SIZE.width;
      const fullObjectHeight = CountingCommonConstants.COUNTING_OBJECT_SIZE.height;
      const renderedObjectWidth = fullObjectWidth * objectScale;
      const renderedObjectHeight = fullObjectHeight * objectScale;
      const singleCardBounds = CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS;
      const width = singleCardBounds.width;
      const height = singleCardBounds.height;

      // This manual calculation is based on the unscaled width of one image, if you'd prefer it to be calculated (like
      // yMargin is), please speak to @chrisklus
      const xMargin = (width - fullObjectWidth) * 0.5;
      const yMargin = (height - numberOfRows * renderedObjectHeight) / (numberOfRows + 1);
      const yExtraMarginTop = backgroundNode.height - yMargin * (numberOfRows + 1) - renderedObjectHeight * numberOfRows;

      // add and position the object images
      const objectImages = [];
      for (let z = 0; z < numberOfSets; z++) {
        for (let i = 0; i < numberOfRows; i++) {
          for (let j = 0; j < numberOfColumns; j++) {
            const columnWidth = (width - (numberOfColumns + 1) * xMargin) / numberOfColumns;
            const centerX = (j + 1) * xMargin + j * columnWidth + columnWidth / 2 +
            // This is used to draw a second set for a double card exactly where the objects are when
            // stacked from a single card on a double
            z * (backgroundNode.width - width + 0.1);
            const rowHeight = (height - (numberOfRows + 1) * yMargin) / numberOfRows;
            const centerY = (i + 1) * yMargin + i * rowHeight + rowHeight / 2 + yExtraMarginTop;
            if (objectImages.length < value) {
              const objectImage = new Image(CountingCommonConstants.COUNTING_OBJECT_TYPE_TO_IMAGE.get(options.countingObjectType), {
                maxWidth: renderedObjectWidth,
                maxHeight: renderedObjectHeight,
                centerX: centerX,
                centerY: centerY
              });
              this.addChild(objectImage);
              objectImages.push(objectImage);
            } else {
              break;
            }
          }
        }
      }
    }
  }
}
countingCommon.register('BaseNumberNode', BaseNumberNode);
export default BaseNumberNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVmVjdG9yMiIsIlNoYXBlIiwiQ2lyY2xlIiwiQ29sb3IiLCJJbWFnZSIsIk5vZGUiLCJQYXRoIiwiZGlnaXQwX3BuZyIsImRpZ2l0MV9wbmciLCJkaWdpdDJfcG5nIiwiZGlnaXQzX3BuZyIsImRpZ2l0NF9wbmciLCJkaWdpdDVfcG5nIiwiZGlnaXQ2X3BuZyIsImRpZ2l0N19wbmciLCJkaWdpdDhfcG5nIiwiZGlnaXQ5X3BuZyIsInBhcGVyQmFja2dyb3VuZDEwMDBfcG5nIiwicGFwZXJCYWNrZ3JvdW5kMTAwX3BuZyIsInBhcGVyQmFja2dyb3VuZDEwX3BuZyIsInBhcGVyQmFja2dyb3VuZDFfcG5nIiwiY291bnRpbmdDb21tb24iLCJncm91cEJhY2tncm91bmQxX3BuZyIsIkNvdW50aW5nT2JqZWN0VHlwZSIsImdyb3VwQmFja2dyb3VuZDEwX3BuZyIsIkNvdW50aW5nQ29tbW9uQ29uc3RhbnRzIiwib3B0aW9uaXplIiwiQkFDS0dST1VORF9JTUFHRV9NQVAiLCJNYXAiLCJlbnVtZXJhdGlvbiIsInZhbHVlcyIsImZvckVhY2giLCJjb3VudGluZ09iamVjdFR5cGUiLCJQQVBFUl9OVU1CRVIiLCJzZXQiLCJESUdJVF9JTUFHRV9NQVAiLCJQTEFDRV9PRkZTRVRfWCIsIlBMQUNFX09GRlNFVF9ZIiwiUExBQ0VfSEFORExFX09GRlNFVF9YIiwiUExBQ0VfSEFORExFX09GRlNFVF9ZIiwiRElHSVRfT0ZGU0VUX1giLCJGSVJTVF9QTEFDRV9ESUdJVF9PRkZTRVRfWCIsIlpFUk9fT0ZGU0VUIiwiUEFQRVJfTlVNQkVSX0hBTkRMRV9PVkVSTEFQX1kiLCJIQU5ETEVfTElORV9XSURUSCIsIkhBTkRMRV9PVVRFUl9DSVJDTEVfUkFESVVTIiwiSEFORExFX0lOTkVSX0NJUkNMRV9SQURJVVMiLCJIQU5ETEVfQ09MT1JfQkxBQ0siLCJCTEFDSyIsIkhBTkRMRV9DT0xPUl9XSElURSIsIldISVRFIiwiSU1BR0VfU0NBTEUiLCJCYXNlTnVtYmVyTm9kZSIsIlBBUEVSX05VTUJFUl9ESU1FTlNJT05TIiwiXyIsIm1hcFZhbHVlcyIsImdldCIsIm1pcG1hcCIsIndpZHRoIiwiaGVpZ2h0IiwiSU1BR0VfT0ZGU0VUUyIsImJhY2tncm91bmROb2RlIiwiY29uc3RydWN0b3IiLCJiYXNlTnVtYmVyIiwib3BhY2l0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJpbmNsdWRlSGFuZGxlcyIsImhhbmRsZU9mZnNldFkiLCJncm91cGluZ0VuYWJsZWQiLCJpc0xhcmdlc3RCYXNlTnVtYmVyIiwiaGFzRGVzY2VuZGFudCIsImlzUGFydE9mU3RhY2siLCJhc3NlcnQiLCJkaWdpdCIsInVuZGVmaW5lZCIsImlzUGFwZXJOdW1iZXIiLCJ0cmFuc2xhdGlvbiIsIm9mZnNldCIsInBsYWNlIiwiaW1hZ2VPcGFjaXR5Iiwic2NhbGUiLCJpc1N0YW5kYWxvbmVPbmUiLCJudW1iZXJWYWx1ZSIsImlzT25lQW5kTGFyZ2VzdFdpdGhEZXNjZW5kYW50cyIsImhhbmRsZU92ZXJsYXBMZW5ndGgiLCJoYW5kbGVPdmVybGFwQ29tcGVuc2F0aW9uIiwiaGFuZGxlU3RlbVNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiaGFuZGxlTm9kZSIsImFkZENoaWxkIiwiaGFuZGxlU3RlbU5vZGUiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjZW50ZXJYIiwiYm90dG9tIiwidG9wIiwiaGFuZGxlQ2lyY2xlIiwiZmlsbCIsIngiLCJ5IiwiZGlnaXRaZXJvT2Zmc2V0cyIsImkiLCJsZW5ndGgiLCJ2YWx1ZSIsIm51bWJlck9mUm93cyIsIm51bWJlck9mQ29sdW1ucyIsIm9iamVjdFNjYWxlIiwiT05FIiwibnVtYmVyT2ZTZXRzIiwiTUFYX0lNQUdFU19QRVJfQ09VTlRJTkdfT0JKRUNUIiwiZnVsbE9iamVjdFdpZHRoIiwiQ09VTlRJTkdfT0JKRUNUX1NJWkUiLCJmdWxsT2JqZWN0SGVpZ2h0IiwicmVuZGVyZWRPYmplY3RXaWR0aCIsInJlbmRlcmVkT2JqZWN0SGVpZ2h0Iiwic2luZ2xlQ2FyZEJvdW5kcyIsIlNJTkdMRV9DT1VOVElOR19PQkpFQ1RfQk9VTkRTIiwieE1hcmdpbiIsInlNYXJnaW4iLCJ5RXh0cmFNYXJnaW5Ub3AiLCJvYmplY3RJbWFnZXMiLCJ6IiwiaiIsImNvbHVtbldpZHRoIiwicm93SGVpZ2h0IiwiY2VudGVyWSIsIm9iamVjdEltYWdlIiwiQ09VTlRJTkdfT0JKRUNUX1RZUEVfVE9fSU1BR0UiLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsInB1c2giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhc2VOdW1iZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgaW1hZ2Ugdmlld3MgZm9yIGJhc2UgbnVtYmVycy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgSW1hZ2UsIE1pcG1hcCwgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBkaWdpdDBfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQwX3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDFfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQxX3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDJfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQyX3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDNfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQzX3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDRfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQ0X3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDVfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQ1X3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDZfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQ2X3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDdfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQ3X3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDhfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQ4X3BuZy5qcyc7XHJcbmltcG9ydCBkaWdpdDlfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZGlnaXQ5X3BuZy5qcyc7XHJcbmltcG9ydCBwYXBlckJhY2tncm91bmQxMDAwX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL3BhcGVyQmFja2dyb3VuZDEwMDBfcG5nLmpzJztcclxuaW1wb3J0IHBhcGVyQmFja2dyb3VuZDEwMF9wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9wYXBlckJhY2tncm91bmQxMDBfcG5nLmpzJztcclxuaW1wb3J0IHBhcGVyQmFja2dyb3VuZDEwX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL3BhcGVyQmFja2dyb3VuZDEwX3BuZy5qcyc7XHJcbmltcG9ydCBwYXBlckJhY2tncm91bmQxX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL3BhcGVyQmFja2dyb3VuZDFfcG5nLmpzJztcclxuaW1wb3J0IGNvdW50aW5nQ29tbW9uIGZyb20gJy4uLy4uL2NvdW50aW5nQ29tbW9uLmpzJztcclxuaW1wb3J0IEJhc2VOdW1iZXIgZnJvbSAnLi4vbW9kZWwvQmFzZU51bWJlci5qcyc7XHJcbmltcG9ydCBncm91cEJhY2tncm91bmQxX3BuZyBmcm9tICcuLi8uLi8uLi9taXBtYXBzL2dyb3VwQmFja2dyb3VuZDFfcG5nLmpzJztcclxuaW1wb3J0IENvdW50aW5nT2JqZWN0VHlwZSBmcm9tICcuLi9tb2RlbC9Db3VudGluZ09iamVjdFR5cGUuanMnO1xyXG5pbXBvcnQgZ3JvdXBCYWNrZ3JvdW5kMTBfcG5nIGZyb20gJy4uLy4uLy4uL21pcG1hcHMvZ3JvdXBCYWNrZ3JvdW5kMTBfcG5nLmpzJztcclxuaW1wb3J0IENvdW50aW5nQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uL0NvdW50aW5nQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuXHJcbnR5cGUgSW1hZ2VNYXAgPSBSZWNvcmQ8bnVtYmVyLCBNaXBtYXA+O1xyXG50eXBlIE51bWJlck1hcCA9IFJlY29yZDxudW1iZXIsIG51bWJlcj47XHJcbnR5cGUgWmVyb09mZnNldCA9IFJlY29yZDxudW1iZXIsIG51bWJlcltdPjtcclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gVGhlIGNvdW50aW5nT2JqZWN0VHlwZSBvZiB0aGUgQ291bnRpbmdPYmplY3ROb2RlIHRoaXMgQmFzZU51bWJlck5vZGUgaXMgYSBwYXJ0IG9mLlxyXG4gIGNvdW50aW5nT2JqZWN0VHlwZT86IENvdW50aW5nT2JqZWN0VHlwZTtcclxuXHJcbiAgLy8gV2hldGhlciBncm91cGluZyBpcyBlbmFibGVkIGZvciB0aGUgQ291bnRpbmdPYmplY3QgdGhhdCB0aGlzIEJhc2VOdW1iZXJOb2RlIGlzIGEgcGFydCBvZi5cclxuICBncm91cGluZ0VuYWJsZWQ/OiBib29sZWFuO1xyXG5cclxuICAvLyBXaGV0aGVyIGhhbmRsZXMgYXJlIGFsbG93ZWQgb24gdGhpcyBCYXNlTnVtYmVyTm9kZS5cclxuICBpbmNsdWRlSGFuZGxlcz86IGJvb2xlYW47XHJcblxyXG4gIC8vIFN1cHBvcnRzIGNoYW5naW5nIHRoZSBsZW5ndGggb2YgdGhlIGhhbmRsZXMuIFBvc2l0aXZlIG51bWJlcnMgaW5jcmVhc2UgbGVuZ3RoLCBuZWdhdGl2ZSBudW1iZXIgZGVjcmVhc2UgbGVuZ3RoLlxyXG4gIGhhbmRsZU9mZnNldFk/OiBudW1iZXI7XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhpcyBCYXNlTnVtYmVyTm9kZSByZXByZXNlbnRzIHRoZSBsYXJnZXN0IEJhc2VOdW1iZXIgaW4gdGhlIENvdW50aW5nT2JqZWN0Tm9kZS5cclxuICBpc0xhcmdlc3RCYXNlTnVtYmVyPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gV2hldGhlciB0aGlzIEJhc2VOdW1iZXJOb2RlIGhhcyBvdGhlciBCYXNlTnVtYmVyTm9kZXMgb24gdG9wIG9mIGl0ICh0cnVlKSBvciBpcyB0aGUgc21hbGxlc3QgQmFzZU51bWJlck5vZGUgaW4gdGhlXHJcbiAgLy8gQ291bnRpbmdPYmplY3ROb2RlIChmYWxzZSkuXHJcbiAgaGFzRGVzY2VuZGFudD86IGJvb2xlYW47XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhpcyBCYXNlTnVtYmVyTm9kZSBzaGFyZXMgdGhlIENvdW50aW5nT2JqZWN0Tm9kZSBpdCBtYWtlcyB1cCB3aXRoIG90aGVyIEJhc2VOdW1iZXJOb2Rlcy5cclxuICBpc1BhcnRPZlN0YWNrPzogYm9vbGVhbjtcclxufTtcclxuZXhwb3J0IHR5cGUgQmFzZU51bWJlck5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnM7XHJcblxyXG4vLyBwbGFjZSA9PiBtaXBtYXAgaW5mb1xyXG5jb25zdCBCQUNLR1JPVU5EX0lNQUdFX01BUCA9IG5ldyBNYXAoKTtcclxuQ291bnRpbmdPYmplY3RUeXBlLmVudW1lcmF0aW9uLnZhbHVlcy5mb3JFYWNoKCBjb3VudGluZ09iamVjdFR5cGUgPT4ge1xyXG4gIGlmICggY291bnRpbmdPYmplY3RUeXBlID09PSBDb3VudGluZ09iamVjdFR5cGUuUEFQRVJfTlVNQkVSICkge1xyXG4gICAgQkFDS0dST1VORF9JTUFHRV9NQVAuc2V0KCBjb3VudGluZ09iamVjdFR5cGUsIHtcclxuICAgICAgMDogcGFwZXJCYWNrZ3JvdW5kMV9wbmcsXHJcbiAgICAgIDE6IHBhcGVyQmFja2dyb3VuZDEwX3BuZyxcclxuICAgICAgMjogcGFwZXJCYWNrZ3JvdW5kMTAwX3BuZyxcclxuICAgICAgMzogcGFwZXJCYWNrZ3JvdW5kMTAwMF9wbmdcclxuICAgIH0gKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBCQUNLR1JPVU5EX0lNQUdFX01BUC5zZXQoIGNvdW50aW5nT2JqZWN0VHlwZSwge1xyXG4gICAgICAwOiBncm91cEJhY2tncm91bmQxX3BuZyxcclxuICAgICAgMTogZ3JvdXBCYWNrZ3JvdW5kMTBfcG5nXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59ICk7XHJcblxyXG4vLyBkaWdpdCA9PiBtaXBtYXAgaW5mb1xyXG5jb25zdCBESUdJVF9JTUFHRV9NQVA6IEltYWdlTWFwID0ge1xyXG4gIDE6IGRpZ2l0MV9wbmcsXHJcbiAgMjogZGlnaXQyX3BuZyxcclxuICAzOiBkaWdpdDNfcG5nLFxyXG4gIDQ6IGRpZ2l0NF9wbmcsXHJcbiAgNTogZGlnaXQ1X3BuZyxcclxuICA2OiBkaWdpdDZfcG5nLFxyXG4gIDc6IGRpZ2l0N19wbmcsXHJcbiAgODogZGlnaXQ4X3BuZyxcclxuICA5OiBkaWdpdDlfcG5nXHJcbn07XHJcblxyXG4vLyBwbGFjZSA9PiB4L3kgb2Zmc2V0cyBmb3IgdGhlIGZpcnN0IGRpZ2l0IGluIGVhY2ggcGxhY2VcclxuY29uc3QgUExBQ0VfT0ZGU0VUX1g6IE51bWJlck1hcCA9IHsgMDogMTMuNDQsIDE6IDEzLjAyLCAyOiAxNC43LCAzOiAxOS43NCB9O1xyXG5jb25zdCBQTEFDRV9PRkZTRVRfWTogTnVtYmVyTWFwID0geyAwOiA3Ljk4LCAxOiAxMi4zOSwgMjogMTYuOCwgMzogMjEuNDIgfTtcclxuXHJcbi8vIHBsYWNlID0+IHgveSBvZmZzZXRzIGZvciB0aGUgaGFuZGxlIGluIGVhY2ggcGxhY2VcclxuY29uc3QgUExBQ0VfSEFORExFX09GRlNFVF9YOiBOdW1iZXJNYXAgPSB7IDA6IDI3LjMsIDE6IDI5LjgyLCAyOiAzMS43MSwgMzogMzUuOTEgfTtcclxuY29uc3QgUExBQ0VfSEFORExFX09GRlNFVF9ZOiBOdW1iZXJNYXAgPSB7IDA6IDE5Ljk1LCAxOiAxNS41NCwgMjogMTEuMTMsIDM6IDYuNTEgfTtcclxuXHJcbi8vIGRpZ2l0ID0+IGhvcml6b250YWwgb2Zmc2V0IGZvciB0aGF0IGRpZ2l0IChhcHBsaWVkIHRvIGFsbCBwbGFjZXMsIGluY2x1ZGVzIGRpZ2l0LXNwZWNpZmljIGluZm9ybWF0aW9uKVxyXG5jb25zdCBESUdJVF9PRkZTRVRfWDogTnVtYmVyTWFwID0ge1xyXG4gIDE6IDE2LFxyXG4gIDI6IC0xLjQ3LFxyXG4gIDM6IC0xLjQ3LFxyXG4gIDQ6IC0xLjg5LFxyXG4gIDU6IC0zLjc4LFxyXG4gIDY6IC0xLjA1LFxyXG4gIDc6IC01LjA0LFxyXG4gIDg6IC0wLjQyLFxyXG4gIDk6IC0yLjFcclxufTtcclxuXHJcbi8vIGRpZ2l0ID0+IGhvcml6b250YWwgb2Zmc2V0LCBjdXN0b21pemVkIGZvciBlYWNoIHNpbmdsZSBkaWdpdCBiYXNlIG51bWJlclxyXG5jb25zdCBGSVJTVF9QTEFDRV9ESUdJVF9PRkZTRVRfWDogTnVtYmVyTWFwID0geyAxOiAtMTIuODEsIDI6IDAsIDM6IDAsIDQ6IDAsIDU6IDEuMDUsIDY6IDAsIDc6IDMuMTUsIDg6IDIuMSwgOTogMy4xNSB9O1xyXG5cclxuLy8gcGxhY2UgPT4gaG9yaXpvbnRhbCBwb3NpdGlvbnMgb2YgdGhlIHplcm9zIGluIHRoZSBiYXNlIG51bWJlclxyXG5jb25zdCBaRVJPX09GRlNFVDogWmVyb09mZnNldCA9IHtcclxuICAwOiBbXSxcclxuICAxOiBbIDU3LjEyIF0sXHJcbiAgMjogWyAxMTEuMywgNTkuNjQgXSxcclxuICAzOiBbIDE3My4yNSwgMTIxLjgsIDcwLjM1IF1cclxufTtcclxuXHJcbi8vIGRpc3RhbmNlIHRoYXQgdGhlIGhhbmRsZSBzdGVtIHNob3VsZCBvdmVybGFwIHdpdGggYSBwYXBlciBudW1iZXIgKHNpbmNlIHRoZXkgZG9uJ3QgaGF2ZSBhIGNsZWFuIGVkZ2UsIHdlIHdhbnQgZW5vdWdoXHJcbi8vIGV4dHJhIGxlbmd0aCB0byBtYWtlIHN1cmUgdGhlcmUgaXMgbm8gZ2FwIGJldHdlZW4gdGhlIHBhcGVyIG51bWJlciBiYWNrZ3JvdW5kIGFuZCB0aGUgc3RlbSlcclxuY29uc3QgUEFQRVJfTlVNQkVSX0hBTkRMRV9PVkVSTEFQX1kgPSAyO1xyXG5cclxuY29uc3QgSEFORExFX0xJTkVfV0lEVEggPSAxLjI0O1xyXG5jb25zdCBIQU5ETEVfT1VURVJfQ0lSQ0xFX1JBRElVUyA9IDQuNjtcclxuY29uc3QgSEFORExFX0lOTkVSX0NJUkNMRV9SQURJVVMgPSAyLjE7XHJcbmNvbnN0IEhBTkRMRV9DT0xPUl9CTEFDSyA9IENvbG9yLkJMQUNLO1xyXG5jb25zdCBIQU5ETEVfQ09MT1JfV0hJVEUgPSBDb2xvci5XSElURTtcclxuXHJcbmNvbnN0IElNQUdFX1NDQUxFID0gMC4yMTtcclxuXHJcbmNsYXNzIEJhc2VOdW1iZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG5cclxuICAvKipcclxuICAgKiBNYXBzIHBsYWNlICgwLTMpIHRvIGEge0RpbWVuc2lvbjJ9IHdpdGggdGhlIHdpZHRoL2hlaWdodFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUEFQRVJfTlVNQkVSX0RJTUVOU0lPTlMgPSBfLm1hcFZhbHVlcyggQkFDS0dST1VORF9JTUFHRV9NQVAuZ2V0KCBDb3VudGluZ09iamVjdFR5cGUuUEFQRVJfTlVNQkVSICksXHJcbiAgICBtaXBtYXAgPT4gbmV3IERpbWVuc2lvbjIoIG1pcG1hcFsgMCBdLndpZHRoICogSU1BR0VfU0NBTEUsIG1pcG1hcFsgMCBdLmhlaWdodCAqIElNQUdFX1NDQUxFICkgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogTWFwcyBwbGFjZSAoMC0zKSB0byBhIHtWZWN0b3IyfSB0aGF0IGlzIHRoZSBvZmZzZXQgb2YgdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoZSBCYXNlTnVtYmVyTm9kZSByZWxhdGl2ZSB0byBhXHJcbiAgICogMS1kaWdpdCBCYXNlTnVtYmVyTm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElNQUdFX09GRlNFVFMgPSBbXHJcbiAgICBuZXcgVmVjdG9yMiggLTIxLCAwICksXHJcbiAgICBuZXcgVmVjdG9yMiggLTcwLCAtKCBQTEFDRV9PRkZTRVRfWVsgMSBdIC0gUExBQ0VfT0ZGU0VUX1lbIDAgXSApICksXHJcbiAgICBuZXcgVmVjdG9yMiggLTcwIC0gKCBaRVJPX09GRlNFVFsgMiBdWyAwIF0gLSBaRVJPX09GRlNFVFsgMSBdWyAwIF0gKSwgLSggUExBQ0VfT0ZGU0VUX1lbIDIgXSAtIFBMQUNFX09GRlNFVF9ZWyAwIF0gKSApLFxyXG4gICAgbmV3IFZlY3RvcjIoIC03MCAtICggWkVST19PRkZTRVRbIDMgXVsgMCBdIC0gWkVST19PRkZTRVRbIDEgXVsgMCBdICksIC0oIFBMQUNFX09GRlNFVF9ZWyAzIF0gLSBQTEFDRV9PRkZTRVRfWVsgMCBdICkgKVxyXG4gIF07XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBoYW5kbGVOb2RlOiBOb2RlIHwgdW5kZWZpbmVkO1xyXG4gIHB1YmxpYyByZWFkb25seSBiYWNrZ3JvdW5kTm9kZTogSW1hZ2UgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBiYXNlTnVtYmVyOiBCYXNlTnVtYmVyLCBvcGFjaXR5OiBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IEJhc2VOdW1iZXJOb2RlT3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxCYXNlTnVtYmVyTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zPigpKCB7XHJcbiAgICAgIGNvdW50aW5nT2JqZWN0VHlwZTogQ291bnRpbmdPYmplY3RUeXBlLlBBUEVSX05VTUJFUixcclxuICAgICAgaW5jbHVkZUhhbmRsZXM6IGZhbHNlLFxyXG4gICAgICBoYW5kbGVPZmZzZXRZOiAwLFxyXG4gICAgICBncm91cGluZ0VuYWJsZWQ6IHRydWUsXHJcbiAgICAgIGlzTGFyZ2VzdEJhc2VOdW1iZXI6IHRydWUsXHJcbiAgICAgIGhhc0Rlc2NlbmRhbnQ6IGZhbHNlLFxyXG4gICAgICBpc1BhcnRPZlN0YWNrOiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLmlzTGFyZ2VzdEJhc2VOdW1iZXIgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhc2VOdW1iZXIuZGlnaXQgIT09IDAsICdsYXJnZXN0IGJhc2UgbnVtYmVyIGNhbm5vdCBiZSAwJyApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBncm91cGluZ0VuYWJsZWQgPSBvcHRpb25zLmdyb3VwaW5nRW5hYmxlZDtcclxuICAgIGlmICggcHJvdmlkZWRPcHRpb25zID09PSB1bmRlZmluZWQgfHwgcHJvdmlkZWRPcHRpb25zPy5ncm91cGluZ0VuYWJsZWQgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgZ3JvdXBpbmdFbmFibGVkID0gb3B0aW9ucy5jb3VudGluZ09iamVjdFR5cGUgPT09IENvdW50aW5nT2JqZWN0VHlwZS5QQVBFUl9OVU1CRVI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGFwZXIgbnVtYmVycyBhcmUgY291bnRpbmdPYmplY3RzIHRoYXQgaGF2ZSBkaWdpdHMgb24gYSBwYXBlci1saWtlIGJhY2tncm91bmQgaW5zdGVhZCBvZiBvYmplY3RzIG9uIGEgY2FyZC5cclxuICAgIGNvbnN0IGlzUGFwZXJOdW1iZXIgPSBvcHRpb25zLmNvdW50aW5nT2JqZWN0VHlwZSA9PT0gQ291bnRpbmdPYmplY3RUeXBlLlBBUEVSX05VTUJFUjtcclxuXHJcbiAgICBhc3NlcnQgJiYgIWdyb3VwaW5nRW5hYmxlZCAmJiBhc3NlcnQoIG9wdGlvbnMuY291bnRpbmdPYmplY3RUeXBlICE9PSBDb3VudGluZ09iamVjdFR5cGUuUEFQRVJfTlVNQkVSLFxyXG4gICAgICAnUGFwZXIgbnVtYmVycyBhcmUgbm90IGFsbG93ZWQgdG8gdHVybiBvZmYgZ3JvdXBpbmcuJyApO1xyXG5cclxuICAgIC8vIFRyYW5zbGF0ZSBldmVyeXRoaW5nIGJ5IG91ciBvZmZzZXRcclxuICAgIHRoaXMudHJhbnNsYXRpb24gPSBiYXNlTnVtYmVyLm9mZnNldDtcclxuXHJcbiAgICAvLyBUaGUgb2ZmLXdoaXRlIHJlY3RhbmdsZSB3aXRoIGEgZ3JheSBib3JkZXIsIGNhbiBoYXZlIG1lc3N5IGVkZ2VzIGxpa2UgcmlwcGVkIHBhcGVyIG9yIGNsZWFuIGVkZ2VzIGxpa2UgYSBjYXJkLlxyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgSW1hZ2UoIEJBQ0tHUk9VTkRfSU1BR0VfTUFQLmdldCggb3B0aW9ucy5jb3VudGluZ09iamVjdFR5cGUgKVsgYmFzZU51bWJlci5wbGFjZSBdLCB7XHJcbiAgICAgIGltYWdlT3BhY2l0eTogb3BhY2l0eSxcclxuICAgICAgc2NhbGU6IElNQUdFX1NDQUxFXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaXNTdGFuZGFsb25lT25lID0gYmFzZU51bWJlci5udW1iZXJWYWx1ZSA9PT0gMSAmJiAhb3B0aW9ucy5pc1BhcnRPZlN0YWNrO1xyXG5cclxuICAgIC8vIEluIHRoaXMgY2FzZSwgdGhlIGxhcmdlc3QgQmFzZU51bWJlciBkb2Vzbid0IGdldCBhIGhhbmRsZS4gRm9yIGV4YW1wbGUsIHdpdGggdGhlIHBhcGVyIG51bWJlciAxMjAwLCB0aGUgMSBzaG91bGRcclxuICAgIC8vIG5vdCBnZXQgYSBoYW5kbGUgYmVjYXVzZSBncmFiYmluZyBpdCB3b3VsZCBwdWxsIDEwMDAgYXdheSBmcm9tIDIwMCwgYW5kIHRoaXMgY2FuIGJlIGFjY29tcGxpc2hlZCBieSBwdWxsaW5nIHRoZVxyXG4gICAgLy8gMjAwIG9mZiBpbnN0ZWFkLiBJbiB0aGUgY2FzZSBvZiAyMjAwLCB0aGUgZmlyc3QgMiBzaG91bGQgZ2V0IGEgaGFuZGxlIGJlY2F1c2UgZ3JhYmJpbmcgaXQgd291bGQgcHVsbCBvZmYgb25lIDEwMDAuXHJcbiAgICBjb25zdCBpc09uZUFuZExhcmdlc3RXaXRoRGVzY2VuZGFudHMgPSBvcHRpb25zLmlzTGFyZ2VzdEJhc2VOdW1iZXIgJiYgYmFzZU51bWJlci5kaWdpdCA9PT0gMSAmJiBvcHRpb25zLmhhc0Rlc2NlbmRhbnQ7XHJcblxyXG4gICAgLy8gSGFuZGxlLWRyYXdpbmcgbG9naWMsIGRyYXdpbmcgdW5sZXNzOlxyXG4gICAgLy8gICogdGhpcyBiYXNlIG51bWJlciBpcyBhIHN0YW5kYWxvbmUgMVxyXG4gICAgLy8gICogcmVtb3ZpbmcgdGhlIGxhcmdlc3QgYmFzZSBudW1iZXIgaW4gdGhpcyBwYXBlciBudW1iZXIgd291bGQgc2VwYXJhdGUgaXRzZWxmIGZyb20gaXRzIGRlc2NlbmRhbnRzXHJcbiAgICBpZiAoIG9wdGlvbnMuaW5jbHVkZUhhbmRsZXMgJiYgIWlzU3RhbmRhbG9uZU9uZSAmJiAhaXNPbmVBbmRMYXJnZXN0V2l0aERlc2NlbmRhbnRzICkge1xyXG5cclxuICAgICAgY29uc3QgaGFuZGxlT3ZlcmxhcExlbmd0aCA9IGlzUGFwZXJOdW1iZXIgPyBQQVBFUl9OVU1CRVJfSEFORExFX09WRVJMQVBfWSA6IDA7XHJcbiAgICAgIGNvbnN0IGhhbmRsZU92ZXJsYXBDb21wZW5zYXRpb24gPSBQQVBFUl9OVU1CRVJfSEFORExFX09WRVJMQVBfWSAtIGhhbmRsZU92ZXJsYXBMZW5ndGg7XHJcbiAgICAgIGNvbnN0IGhhbmRsZU9mZnNldFkgPSBQTEFDRV9IQU5ETEVfT0ZGU0VUX1lbIGJhc2VOdW1iZXIucGxhY2UgXSArIG9wdGlvbnMuaGFuZGxlT2Zmc2V0WSAtIGhhbmRsZU92ZXJsYXBDb21wZW5zYXRpb247XHJcblxyXG4gICAgICAvLyBUaGUgaGFuZGxlIHRoYXQgYXR0YWNoZXMgdG8gdGhlIHBhcGVyXHJcbiAgICAgIGNvbnN0IGhhbmRsZVN0ZW1TaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApLmxpbmVUbyggMCwgaGFuZGxlT2Zmc2V0WSApO1xyXG5cclxuICAgICAgdGhpcy5oYW5kbGVOb2RlID0gbmV3IE5vZGUoKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggdGhpcy5oYW5kbGVOb2RlICk7XHJcblxyXG4gICAgICBjb25zdCBoYW5kbGVTdGVtTm9kZSA9IG5ldyBQYXRoKCBoYW5kbGVTdGVtU2hhcGUsIHtcclxuICAgICAgICBzdHJva2U6IEhBTkRMRV9DT0xPUl9CTEFDSyxcclxuICAgICAgICBsaW5lV2lkdGg6IEhBTkRMRV9MSU5FX1dJRFRIXHJcbiAgICAgIH0gKTtcclxuICAgICAgaGFuZGxlU3RlbU5vZGUuY2VudGVyWCA9IG9wdGlvbnMuaGFzRGVzY2VuZGFudCA/IFBMQUNFX0hBTkRMRV9PRkZTRVRfWFsgYmFzZU51bWJlci5wbGFjZSBdIDogYmFja2dyb3VuZE5vZGUuY2VudGVyWDtcclxuICAgICAgaGFuZGxlU3RlbU5vZGUuYm90dG9tID0gYmFja2dyb3VuZE5vZGUudG9wICsgaGFuZGxlT3ZlcmxhcExlbmd0aDtcclxuICAgICAgdGhpcy5oYW5kbGVOb2RlLmFkZENoaWxkKCBoYW5kbGVTdGVtTm9kZSApO1xyXG5cclxuICAgICAgbGV0IGhhbmRsZUNpcmNsZTtcclxuXHJcbiAgICAgIGlmICggb3B0aW9ucy5pc0xhcmdlc3RCYXNlTnVtYmVyICkge1xyXG4gICAgICAgIGhhbmRsZUNpcmNsZSA9IG5ldyBDaXJjbGUoIEhBTkRMRV9PVVRFUl9DSVJDTEVfUkFESVVTLCB7XHJcbiAgICAgICAgICBmaWxsOiBIQU5ETEVfQ09MT1JfV0hJVEUsXHJcbiAgICAgICAgICBzdHJva2U6IEhBTkRMRV9DT0xPUl9CTEFDSyxcclxuICAgICAgICAgIGxpbmVXaWR0aDogSEFORExFX0xJTkVfV0lEVEhcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgaGFuZGxlQ2lyY2xlLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCBIQU5ETEVfSU5ORVJfQ0lSQ0xFX1JBRElVUywge1xyXG4gICAgICAgICAgZmlsbDogSEFORExFX0NPTE9SX0JMQUNLXHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaGFuZGxlQ2lyY2xlID0gbmV3IENpcmNsZSggSEFORExFX09VVEVSX0NJUkNMRV9SQURJVVMsIHtcclxuICAgICAgICAgIGZpbGw6IEhBTkRMRV9DT0xPUl9CTEFDS1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBoYW5kbGVDaXJjbGUuY2VudGVyWCA9IGhhbmRsZVN0ZW1Ob2RlLmNlbnRlclg7XHJcbiAgICAgIGhhbmRsZUNpcmNsZS5ib3R0b20gPSBoYW5kbGVTdGVtTm9kZS50b3A7XHJcbiAgICAgIHRoaXMuaGFuZGxlTm9kZS5hZGRDaGlsZCggaGFuZGxlQ2lyY2xlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIHRoZSBiYWNrZ3JvdW5kIHBhcGVyIG9uIHRvcCBvZiB0aGUgaGFuZGxlXHJcbiAgICBpZiAoIGdyb3VwaW5nRW5hYmxlZCApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggYmFja2dyb3VuZE5vZGUgKTtcclxuICAgICAgdGhpcy5iYWNrZ3JvdW5kTm9kZSA9IGJhY2tncm91bmROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBhIHZhbHVlIHJlcHJlc2VudGF0aW9uIGRlcGVuZGluZyBvbiBvdXIgQ291bnRpbmdPYmplY3RUeXBlLlxyXG4gICAgaWYgKCBpc1BhcGVyTnVtYmVyICkge1xyXG5cclxuICAgICAgLy8gUG9zaXRpb24gb2YgdGhlIGluaXRpYWwgZGlnaXRcclxuICAgICAgbGV0IHggPSBQTEFDRV9PRkZTRVRfWFsgYmFzZU51bWJlci5wbGFjZSBdICsgRElHSVRfT0ZGU0VUX1hbIGJhc2VOdW1iZXIuZGlnaXQgXTtcclxuICAgICAgY29uc3QgeSA9IFBMQUNFX09GRlNFVF9ZWyBiYXNlTnVtYmVyLnBsYWNlIF07XHJcblxyXG4gICAgICAvLyBXZSBuZWVkIHRvIHNsaWdodGx5IG9mZnNldCBzb21lXHJcbiAgICAgIGlmICggYmFzZU51bWJlci5wbGFjZSA9PT0gMCApIHtcclxuICAgICAgICB4ICs9IEZJUlNUX1BMQUNFX0RJR0lUX09GRlNFVF9YWyBiYXNlTnVtYmVyLmRpZ2l0IF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRoZSBpbml0aWFsIChub24temVybykgZGlnaXRcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IEltYWdlKCBESUdJVF9JTUFHRV9NQVBbIGJhc2VOdW1iZXIuZGlnaXQgXSwge1xyXG4gICAgICAgIHg6IHgsXHJcbiAgICAgICAgeTogeSxcclxuICAgICAgICBzY2FsZTogSU1BR0VfU0NBTEVcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIHplcm9zXHJcbiAgICAgIGNvbnN0IGRpZ2l0WmVyb09mZnNldHMgPSBaRVJPX09GRlNFVFsgYmFzZU51bWJlci5wbGFjZSBdO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkaWdpdFplcm9PZmZzZXRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBJbWFnZSggZGlnaXQwX3BuZywge1xyXG4gICAgICAgICAgeDogZGlnaXRaZXJvT2Zmc2V0c1sgaSBdLFxyXG4gICAgICAgICAgeTogeSxcclxuICAgICAgICAgIHNjYWxlOiBJTUFHRV9TQ0FMRVxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gSWYgbm90IGEgcGFwZXIgbnVtYmVyLCBhZGQgaW1hZ2VzIG9mIG91ciBDb3VudGluZ09iamVjdFR5cGUuXHJcblxyXG4gICAgICBjb25zdCB2YWx1ZSA9IGJhc2VOdW1iZXIubnVtYmVyVmFsdWU7XHJcblxyXG4gICAgICBsZXQgbnVtYmVyT2ZSb3dzID0gNTtcclxuICAgICAgbGV0IG51bWJlck9mQ29sdW1ucyA9IDI7XHJcbiAgICAgIGxldCBvYmplY3RTY2FsZSA9IDAuMztcclxuXHJcbiAgICAgIC8vIElmIHRoZXJlIGlzIGp1c3QgYSBzaW5nbGUsIHVuc3RhY2tlZCBPbmVcclxuICAgICAgaWYgKCB2YWx1ZSA9PT0gQ291bnRpbmdDb21tb25Db25zdGFudHMuT05FICYmICFvcHRpb25zLmlzUGFydE9mU3RhY2sgKSB7XHJcbiAgICAgICAgbnVtYmVyT2ZSb3dzID0gMTtcclxuICAgICAgICBudW1iZXJPZkNvbHVtbnMgPSAxO1xyXG4gICAgICAgIG9iamVjdFNjYWxlID0gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRWFjaCB2YWx1ZSBpcyBicm9rZW4gdXAgaW50byBncm91cHMgb2YgMTAsIGNhbGxlZCBhIHNldC4gSWYgZ3JlYXRlciB0aGFuIDEwLCB0aGUgcmVtYWluZGVyIHdpbGwgcHJvYmFibHlcclxuICAgICAgLy8gYmUgaGFuZGxlZCBieSBhIGRlc2NlbmRhbnQgY2FyZCwgZXhjZXB0IHdoZW4gZXhhY3RseSBhIG11bHRpcGxlIG9mIDEwIHdoaWNoIHdvbid0IGhhdmUgZGVzY2VuZGFudCBjYXJkcy5cclxuICAgICAgY29uc3QgbnVtYmVyT2ZTZXRzID0gdmFsdWUgPT09IENvdW50aW5nQ29tbW9uQ29uc3RhbnRzLk1BWF9JTUFHRVNfUEVSX0NPVU5USU5HX09CSkVDVCA/IDIgOiAxO1xyXG5cclxuICAgICAgY29uc3QgZnVsbE9iamVjdFdpZHRoID0gQ291bnRpbmdDb21tb25Db25zdGFudHMuQ09VTlRJTkdfT0JKRUNUX1NJWkUud2lkdGg7XHJcbiAgICAgIGNvbnN0IGZ1bGxPYmplY3RIZWlnaHQgPSBDb3VudGluZ0NvbW1vbkNvbnN0YW50cy5DT1VOVElOR19PQkpFQ1RfU0laRS5oZWlnaHQ7XHJcbiAgICAgIGNvbnN0IHJlbmRlcmVkT2JqZWN0V2lkdGggPSBmdWxsT2JqZWN0V2lkdGggKiBvYmplY3RTY2FsZTtcclxuICAgICAgY29uc3QgcmVuZGVyZWRPYmplY3RIZWlnaHQgPSBmdWxsT2JqZWN0SGVpZ2h0ICogb2JqZWN0U2NhbGU7XHJcbiAgICAgIGNvbnN0IHNpbmdsZUNhcmRCb3VuZHMgPSBDb3VudGluZ0NvbW1vbkNvbnN0YW50cy5TSU5HTEVfQ09VTlRJTkdfT0JKRUNUX0JPVU5EUztcclxuXHJcbiAgICAgIGNvbnN0IHdpZHRoID0gc2luZ2xlQ2FyZEJvdW5kcy53aWR0aDtcclxuICAgICAgY29uc3QgaGVpZ2h0ID0gc2luZ2xlQ2FyZEJvdW5kcy5oZWlnaHQ7XHJcblxyXG4gICAgICAvLyBUaGlzIG1hbnVhbCBjYWxjdWxhdGlvbiBpcyBiYXNlZCBvbiB0aGUgdW5zY2FsZWQgd2lkdGggb2Ygb25lIGltYWdlLCBpZiB5b3UnZCBwcmVmZXIgaXQgdG8gYmUgY2FsY3VsYXRlZCAobGlrZVxyXG4gICAgICAvLyB5TWFyZ2luIGlzKSwgcGxlYXNlIHNwZWFrIHRvIEBjaHJpc2tsdXNcclxuICAgICAgY29uc3QgeE1hcmdpbiA9ICggd2lkdGggLSBmdWxsT2JqZWN0V2lkdGggKSAqIDAuNTtcclxuICAgICAgY29uc3QgeU1hcmdpbiA9ICggaGVpZ2h0IC0gbnVtYmVyT2ZSb3dzICogcmVuZGVyZWRPYmplY3RIZWlnaHQgKSAvICggbnVtYmVyT2ZSb3dzICsgMSApO1xyXG4gICAgICBjb25zdCB5RXh0cmFNYXJnaW5Ub3AgPSBiYWNrZ3JvdW5kTm9kZS5oZWlnaHQgLSB5TWFyZ2luICogKCBudW1iZXJPZlJvd3MgKyAxICkgLSByZW5kZXJlZE9iamVjdEhlaWdodCAqIG51bWJlck9mUm93cztcclxuXHJcbiAgICAgIC8vIGFkZCBhbmQgcG9zaXRpb24gdGhlIG9iamVjdCBpbWFnZXNcclxuICAgICAgY29uc3Qgb2JqZWN0SW1hZ2VzOiBJbWFnZVtdID0gW107XHJcbiAgICAgIGZvciAoIGxldCB6ID0gMDsgeiA8IG51bWJlck9mU2V0czsgeisrICkge1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mUm93czsgaSsrICkge1xyXG4gICAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgbnVtYmVyT2ZDb2x1bW5zOyBqKysgKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjb2x1bW5XaWR0aCA9ICggd2lkdGggLSAoICggbnVtYmVyT2ZDb2x1bW5zICsgMSApICogeE1hcmdpbiApICkgLyBudW1iZXJPZkNvbHVtbnM7XHJcbiAgICAgICAgICAgIGNvbnN0IGNlbnRlclggPSAoICggaiArIDEgKSAqIHhNYXJnaW4gKSArICggaiAqIGNvbHVtbldpZHRoICkgKyAoIGNvbHVtbldpZHRoIC8gMiApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdXNlZCB0byBkcmF3IGEgc2Vjb25kIHNldCBmb3IgYSBkb3VibGUgY2FyZCBleGFjdGx5IHdoZXJlIHRoZSBvYmplY3RzIGFyZSB3aGVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzdGFja2VkIGZyb20gYSBzaW5nbGUgY2FyZCBvbiBhIGRvdWJsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeiAqICggYmFja2dyb3VuZE5vZGUud2lkdGggLSB3aWR0aCArIDAuMSApO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgcm93SGVpZ2h0ID0gKCBoZWlnaHQgLSAoICggbnVtYmVyT2ZSb3dzICsgMSApICogeU1hcmdpbiApICkgLyBudW1iZXJPZlJvd3M7XHJcbiAgICAgICAgICAgIGNvbnN0IGNlbnRlclkgPSAoICggaSArIDEgKSAqIHlNYXJnaW4gKSArICggaSAqIHJvd0hlaWdodCApICsgKCByb3dIZWlnaHQgLyAyICkgKyB5RXh0cmFNYXJnaW5Ub3A7XHJcblxyXG4gICAgICAgICAgICBpZiAoIG9iamVjdEltYWdlcy5sZW5ndGggPCB2YWx1ZSApIHtcclxuICAgICAgICAgICAgICBjb25zdCBvYmplY3RJbWFnZSA9IG5ldyBJbWFnZSggQ291bnRpbmdDb21tb25Db25zdGFudHMuQ09VTlRJTkdfT0JKRUNUX1RZUEVfVE9fSU1BR0UuZ2V0KCBvcHRpb25zLmNvdW50aW5nT2JqZWN0VHlwZSApLCB7XHJcbiAgICAgICAgICAgICAgICBtYXhXaWR0aDogcmVuZGVyZWRPYmplY3RXaWR0aCxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogcmVuZGVyZWRPYmplY3RIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJYOiBjZW50ZXJYLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyWTogY2VudGVyWVxyXG4gICAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKCBvYmplY3RJbWFnZSApO1xyXG4gICAgICAgICAgICAgIG9iamVjdEltYWdlcy5wdXNoKCBvYmplY3RJbWFnZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jb3VudGluZ0NvbW1vbi5yZWdpc3RlciggJ0Jhc2VOdW1iZXJOb2RlJywgQmFzZU51bWJlck5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJhc2VOdW1iZXJOb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxTQUFTQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsS0FBSyxFQUFVQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDNUYsT0FBT0MsVUFBVSxNQUFNLGdDQUFnQztBQUN2RCxPQUFPQyxVQUFVLE1BQU0sZ0NBQWdDO0FBQ3ZELE9BQU9DLFVBQVUsTUFBTSxnQ0FBZ0M7QUFDdkQsT0FBT0MsVUFBVSxNQUFNLGdDQUFnQztBQUN2RCxPQUFPQyxVQUFVLE1BQU0sZ0NBQWdDO0FBQ3ZELE9BQU9DLFVBQVUsTUFBTSxnQ0FBZ0M7QUFDdkQsT0FBT0MsVUFBVSxNQUFNLGdDQUFnQztBQUN2RCxPQUFPQyxVQUFVLE1BQU0sZ0NBQWdDO0FBQ3ZELE9BQU9DLFVBQVUsTUFBTSxnQ0FBZ0M7QUFDdkQsT0FBT0MsVUFBVSxNQUFNLGdDQUFnQztBQUN2RCxPQUFPQyx1QkFBdUIsTUFBTSw2Q0FBNkM7QUFDakYsT0FBT0Msc0JBQXNCLE1BQU0sNENBQTRDO0FBQy9FLE9BQU9DLHFCQUFxQixNQUFNLDJDQUEyQztBQUM3RSxPQUFPQyxvQkFBb0IsTUFBTSwwQ0FBMEM7QUFDM0UsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUVwRCxPQUFPQyxvQkFBb0IsTUFBTSwwQ0FBMEM7QUFDM0UsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDO0FBQy9ELE9BQU9DLHFCQUFxQixNQUFNLDJDQUEyQztBQUM3RSxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQStCN0Q7QUFDQSxNQUFNQyxvQkFBb0IsR0FBRyxJQUFJQyxHQUFHLENBQUMsQ0FBQztBQUN0Q0wsa0JBQWtCLENBQUNNLFdBQVcsQ0FBQ0MsTUFBTSxDQUFDQyxPQUFPLENBQUVDLGtCQUFrQixJQUFJO0VBQ25FLElBQUtBLGtCQUFrQixLQUFLVCxrQkFBa0IsQ0FBQ1UsWUFBWSxFQUFHO0lBQzVETixvQkFBb0IsQ0FBQ08sR0FBRyxDQUFFRixrQkFBa0IsRUFBRTtNQUM1QyxDQUFDLEVBQUVaLG9CQUFvQjtNQUN2QixDQUFDLEVBQUVELHFCQUFxQjtNQUN4QixDQUFDLEVBQUVELHNCQUFzQjtNQUN6QixDQUFDLEVBQUVEO0lBQ0wsQ0FBRSxDQUFDO0VBQ0wsQ0FBQyxNQUNJO0lBQ0hVLG9CQUFvQixDQUFDTyxHQUFHLENBQUVGLGtCQUFrQixFQUFFO01BQzVDLENBQUMsRUFBRVYsb0JBQW9CO01BQ3ZCLENBQUMsRUFBRUU7SUFDTCxDQUFFLENBQUM7RUFDTDtBQUNGLENBQUUsQ0FBQzs7QUFFSDtBQUNBLE1BQU1XLGVBQXlCLEdBQUc7RUFDaEMsQ0FBQyxFQUFFM0IsVUFBVTtFQUNiLENBQUMsRUFBRUMsVUFBVTtFQUNiLENBQUMsRUFBRUMsVUFBVTtFQUNiLENBQUMsRUFBRUMsVUFBVTtFQUNiLENBQUMsRUFBRUMsVUFBVTtFQUNiLENBQUMsRUFBRUMsVUFBVTtFQUNiLENBQUMsRUFBRUMsVUFBVTtFQUNiLENBQUMsRUFBRUMsVUFBVTtFQUNiLENBQUMsRUFBRUM7QUFDTCxDQUFDOztBQUVEO0FBQ0EsTUFBTW9CLGNBQXlCLEdBQUc7RUFBRSxDQUFDLEVBQUUsS0FBSztFQUFFLENBQUMsRUFBRSxLQUFLO0VBQUUsQ0FBQyxFQUFFLElBQUk7RUFBRSxDQUFDLEVBQUU7QUFBTSxDQUFDO0FBQzNFLE1BQU1DLGNBQXlCLEdBQUc7RUFBRSxDQUFDLEVBQUUsSUFBSTtFQUFFLENBQUMsRUFBRSxLQUFLO0VBQUUsQ0FBQyxFQUFFLElBQUk7RUFBRSxDQUFDLEVBQUU7QUFBTSxDQUFDOztBQUUxRTtBQUNBLE1BQU1DLHFCQUFnQyxHQUFHO0VBQUUsQ0FBQyxFQUFFLElBQUk7RUFBRSxDQUFDLEVBQUUsS0FBSztFQUFFLENBQUMsRUFBRSxLQUFLO0VBQUUsQ0FBQyxFQUFFO0FBQU0sQ0FBQztBQUNsRixNQUFNQyxxQkFBZ0MsR0FBRztFQUFFLENBQUMsRUFBRSxLQUFLO0VBQUUsQ0FBQyxFQUFFLEtBQUs7RUFBRSxDQUFDLEVBQUUsS0FBSztFQUFFLENBQUMsRUFBRTtBQUFLLENBQUM7O0FBRWxGO0FBQ0EsTUFBTUMsY0FBeUIsR0FBRztFQUNoQyxDQUFDLEVBQUUsRUFBRTtFQUNMLENBQUMsRUFBRSxDQUFDLElBQUk7RUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0VBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtFQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7RUFDUixDQUFDLEVBQUUsQ0FBQyxJQUFJO0VBQ1IsQ0FBQyxFQUFFLENBQUMsSUFBSTtFQUNSLENBQUMsRUFBRSxDQUFDLElBQUk7RUFDUixDQUFDLEVBQUUsQ0FBQztBQUNOLENBQUM7O0FBRUQ7QUFDQSxNQUFNQywwQkFBcUMsR0FBRztFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUs7RUFBRSxDQUFDLEVBQUUsQ0FBQztFQUFFLENBQUMsRUFBRSxDQUFDO0VBQUUsQ0FBQyxFQUFFLENBQUM7RUFBRSxDQUFDLEVBQUUsSUFBSTtFQUFFLENBQUMsRUFBRSxDQUFDO0VBQUUsQ0FBQyxFQUFFLElBQUk7RUFBRSxDQUFDLEVBQUUsR0FBRztFQUFFLENBQUMsRUFBRTtBQUFLLENBQUM7O0FBRXRIO0FBQ0EsTUFBTUMsV0FBdUIsR0FBRztFQUM5QixDQUFDLEVBQUUsRUFBRTtFQUNMLENBQUMsRUFBRSxDQUFFLEtBQUssQ0FBRTtFQUNaLENBQUMsRUFBRSxDQUFFLEtBQUssRUFBRSxLQUFLLENBQUU7RUFDbkIsQ0FBQyxFQUFFLENBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLO0FBQzNCLENBQUM7O0FBRUQ7QUFDQTtBQUNBLE1BQU1DLDZCQUE2QixHQUFHLENBQUM7QUFFdkMsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSTtBQUM5QixNQUFNQywwQkFBMEIsR0FBRyxHQUFHO0FBQ3RDLE1BQU1DLDBCQUEwQixHQUFHLEdBQUc7QUFDdEMsTUFBTUMsa0JBQWtCLEdBQUc1QyxLQUFLLENBQUM2QyxLQUFLO0FBQ3RDLE1BQU1DLGtCQUFrQixHQUFHOUMsS0FBSyxDQUFDK0MsS0FBSztBQUV0QyxNQUFNQyxXQUFXLEdBQUcsSUFBSTtBQUV4QixNQUFNQyxjQUFjLFNBQVMvQyxJQUFJLENBQUM7RUFHaEM7QUFDRjtBQUNBO0VBQ0UsT0FBdUJnRCx1QkFBdUIsR0FBR0MsQ0FBQyxDQUFDQyxTQUFTLENBQUU1QixvQkFBb0IsQ0FBQzZCLEdBQUcsQ0FBRWpDLGtCQUFrQixDQUFDVSxZQUFhLENBQUMsRUFDdkh3QixNQUFNLElBQUksSUFBSTFELFVBQVUsQ0FBRTBELE1BQU0sQ0FBRSxDQUFDLENBQUUsQ0FBQ0MsS0FBSyxHQUFHUCxXQUFXLEVBQUVNLE1BQU0sQ0FBRSxDQUFDLENBQUUsQ0FBQ0UsTUFBTSxHQUFHUixXQUFZLENBQUUsQ0FBQzs7RUFFakc7QUFDRjtBQUNBO0FBQ0E7RUFDRSxPQUF1QlMsYUFBYSxHQUFHLENBQ3JDLElBQUk1RCxPQUFPLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFDLEVBQ3JCLElBQUlBLE9BQU8sQ0FBRSxDQUFDLEVBQUUsRUFBRSxFQUFHcUMsY0FBYyxDQUFFLENBQUMsQ0FBRSxHQUFHQSxjQUFjLENBQUUsQ0FBQyxDQUFFLENBQUcsQ0FBQyxFQUNsRSxJQUFJckMsT0FBTyxDQUFFLENBQUMsRUFBRSxJQUFLMEMsV0FBVyxDQUFFLENBQUMsQ0FBRSxDQUFFLENBQUMsQ0FBRSxHQUFHQSxXQUFXLENBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQyxDQUFFLENBQUUsRUFBRSxFQUFHTCxjQUFjLENBQUUsQ0FBQyxDQUFFLEdBQUdBLGNBQWMsQ0FBRSxDQUFDLENBQUUsQ0FBRyxDQUFDLEVBQ3RILElBQUlyQyxPQUFPLENBQUUsQ0FBQyxFQUFFLElBQUswQyxXQUFXLENBQUUsQ0FBQyxDQUFFLENBQUUsQ0FBQyxDQUFFLEdBQUdBLFdBQVcsQ0FBRSxDQUFDLENBQUUsQ0FBRSxDQUFDLENBQUUsQ0FBRSxFQUFFLEVBQUdMLGNBQWMsQ0FBRSxDQUFDLENBQUUsR0FBR0EsY0FBYyxDQUFFLENBQUMsQ0FBRSxDQUFHLENBQUMsQ0FDdkg7RUFHZXdCLGNBQWMsR0FBaUIsSUFBSTtFQUU1Q0MsV0FBV0EsQ0FBRUMsVUFBc0IsRUFBRUMsT0FBZSxFQUFFQyxlQUF1QyxFQUFHO0lBQ3JHLEtBQUssQ0FBQyxDQUFDO0lBRVAsTUFBTUMsT0FBTyxHQUFHeEMsU0FBUyxDQUFxQyxDQUFDLENBQUU7TUFDL0RNLGtCQUFrQixFQUFFVCxrQkFBa0IsQ0FBQ1UsWUFBWTtNQUNuRGtDLGNBQWMsRUFBRSxLQUFLO01BQ3JCQyxhQUFhLEVBQUUsQ0FBQztNQUNoQkMsZUFBZSxFQUFFLElBQUk7TUFDckJDLG1CQUFtQixFQUFFLElBQUk7TUFDekJDLGFBQWEsRUFBRSxLQUFLO01BQ3BCQyxhQUFhLEVBQUU7SUFDakIsQ0FBQyxFQUFFUCxlQUFnQixDQUFDO0lBRXBCLElBQUtDLE9BQU8sQ0FBQ0ksbUJBQW1CLEVBQUc7TUFDakNHLE1BQU0sSUFBSUEsTUFBTSxDQUFFVixVQUFVLENBQUNXLEtBQUssS0FBSyxDQUFDLEVBQUUsaUNBQWtDLENBQUM7SUFDL0U7SUFFQSxJQUFJTCxlQUFlLEdBQUdILE9BQU8sQ0FBQ0csZUFBZTtJQUM3QyxJQUFLSixlQUFlLEtBQUtVLFNBQVMsSUFBSVYsZUFBZSxFQUFFSSxlQUFlLEtBQUtNLFNBQVMsRUFBRztNQUNyRk4sZUFBZSxHQUFHSCxPQUFPLENBQUNsQyxrQkFBa0IsS0FBS1Qsa0JBQWtCLENBQUNVLFlBQVk7SUFDbEY7O0lBRUE7SUFDQSxNQUFNMkMsYUFBYSxHQUFHVixPQUFPLENBQUNsQyxrQkFBa0IsS0FBS1Qsa0JBQWtCLENBQUNVLFlBQVk7SUFFcEZ3QyxNQUFNLElBQUksQ0FBQ0osZUFBZSxJQUFJSSxNQUFNLENBQUVQLE9BQU8sQ0FBQ2xDLGtCQUFrQixLQUFLVCxrQkFBa0IsQ0FBQ1UsWUFBWSxFQUNsRyxxREFBc0QsQ0FBQzs7SUFFekQ7SUFDQSxJQUFJLENBQUM0QyxXQUFXLEdBQUdkLFVBQVUsQ0FBQ2UsTUFBTTs7SUFFcEM7SUFDQSxNQUFNakIsY0FBYyxHQUFHLElBQUl6RCxLQUFLLENBQUV1QixvQkFBb0IsQ0FBQzZCLEdBQUcsQ0FBRVUsT0FBTyxDQUFDbEMsa0JBQW1CLENBQUMsQ0FBRStCLFVBQVUsQ0FBQ2dCLEtBQUssQ0FBRSxFQUFFO01BQzVHQyxZQUFZLEVBQUVoQixPQUFPO01BQ3JCaUIsS0FBSyxFQUFFOUI7SUFDVCxDQUFFLENBQUM7SUFFSCxNQUFNK0IsZUFBZSxHQUFHbkIsVUFBVSxDQUFDb0IsV0FBVyxLQUFLLENBQUMsSUFBSSxDQUFDakIsT0FBTyxDQUFDTSxhQUFhOztJQUU5RTtJQUNBO0lBQ0E7SUFDQSxNQUFNWSw4QkFBOEIsR0FBR2xCLE9BQU8sQ0FBQ0ksbUJBQW1CLElBQUlQLFVBQVUsQ0FBQ1csS0FBSyxLQUFLLENBQUMsSUFBSVIsT0FBTyxDQUFDSyxhQUFhOztJQUVySDtJQUNBO0lBQ0E7SUFDQSxJQUFLTCxPQUFPLENBQUNDLGNBQWMsSUFBSSxDQUFDZSxlQUFlLElBQUksQ0FBQ0UsOEJBQThCLEVBQUc7TUFFbkYsTUFBTUMsbUJBQW1CLEdBQUdULGFBQWEsR0FBR2pDLDZCQUE2QixHQUFHLENBQUM7TUFDN0UsTUFBTTJDLHlCQUF5QixHQUFHM0MsNkJBQTZCLEdBQUcwQyxtQkFBbUI7TUFDckYsTUFBTWpCLGFBQWEsR0FBRzdCLHFCQUFxQixDQUFFd0IsVUFBVSxDQUFDZ0IsS0FBSyxDQUFFLEdBQUdiLE9BQU8sQ0FBQ0UsYUFBYSxHQUFHa0IseUJBQXlCOztNQUVuSDtNQUNBLE1BQU1DLGVBQWUsR0FBRyxJQUFJdEYsS0FBSyxDQUFDLENBQUMsQ0FBQ3VGLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUNDLE1BQU0sQ0FBRSxDQUFDLEVBQUVyQixhQUFjLENBQUM7TUFFN0UsSUFBSSxDQUFDc0IsVUFBVSxHQUFHLElBQUlyRixJQUFJLENBQUMsQ0FBQztNQUM1QixJQUFJLENBQUNzRixRQUFRLENBQUUsSUFBSSxDQUFDRCxVQUFXLENBQUM7TUFFaEMsTUFBTUUsY0FBYyxHQUFHLElBQUl0RixJQUFJLENBQUVpRixlQUFlLEVBQUU7UUFDaERNLE1BQU0sRUFBRTlDLGtCQUFrQjtRQUMxQitDLFNBQVMsRUFBRWxEO01BQ2IsQ0FBRSxDQUFDO01BQ0hnRCxjQUFjLENBQUNHLE9BQU8sR0FBRzdCLE9BQU8sQ0FBQ0ssYUFBYSxHQUFHakMscUJBQXFCLENBQUV5QixVQUFVLENBQUNnQixLQUFLLENBQUUsR0FBR2xCLGNBQWMsQ0FBQ2tDLE9BQU87TUFDbkhILGNBQWMsQ0FBQ0ksTUFBTSxHQUFHbkMsY0FBYyxDQUFDb0MsR0FBRyxHQUFHWixtQkFBbUI7TUFDaEUsSUFBSSxDQUFDSyxVQUFVLENBQUNDLFFBQVEsQ0FBRUMsY0FBZSxDQUFDO01BRTFDLElBQUlNLFlBQVk7TUFFaEIsSUFBS2hDLE9BQU8sQ0FBQ0ksbUJBQW1CLEVBQUc7UUFDakM0QixZQUFZLEdBQUcsSUFBSWhHLE1BQU0sQ0FBRTJDLDBCQUEwQixFQUFFO1VBQ3JEc0QsSUFBSSxFQUFFbEQsa0JBQWtCO1VBQ3hCNEMsTUFBTSxFQUFFOUMsa0JBQWtCO1VBQzFCK0MsU0FBUyxFQUFFbEQ7UUFDYixDQUFFLENBQUM7UUFDSHNELFlBQVksQ0FBQ1AsUUFBUSxDQUFFLElBQUl6RixNQUFNLENBQUU0QywwQkFBMEIsRUFBRTtVQUM3RHFELElBQUksRUFBRXBEO1FBQ1IsQ0FBRSxDQUFFLENBQUM7TUFDUCxDQUFDLE1BQ0k7UUFDSG1ELFlBQVksR0FBRyxJQUFJaEcsTUFBTSxDQUFFMkMsMEJBQTBCLEVBQUU7VUFDckRzRCxJQUFJLEVBQUVwRDtRQUNSLENBQUUsQ0FBQztNQUNMO01BQ0FtRCxZQUFZLENBQUNILE9BQU8sR0FBR0gsY0FBYyxDQUFDRyxPQUFPO01BQzdDRyxZQUFZLENBQUNGLE1BQU0sR0FBR0osY0FBYyxDQUFDSyxHQUFHO01BQ3hDLElBQUksQ0FBQ1AsVUFBVSxDQUFDQyxRQUFRLENBQUVPLFlBQWEsQ0FBQztJQUMxQzs7SUFFQTtJQUNBLElBQUs3QixlQUFlLEVBQUc7TUFDckIsSUFBSSxDQUFDc0IsUUFBUSxDQUFFOUIsY0FBZSxDQUFDO01BQy9CLElBQUksQ0FBQ0EsY0FBYyxHQUFHQSxjQUFjO0lBQ3RDOztJQUVBO0lBQ0EsSUFBS2UsYUFBYSxFQUFHO01BRW5CO01BQ0EsSUFBSXdCLENBQUMsR0FBR2hFLGNBQWMsQ0FBRTJCLFVBQVUsQ0FBQ2dCLEtBQUssQ0FBRSxHQUFHdkMsY0FBYyxDQUFFdUIsVUFBVSxDQUFDVyxLQUFLLENBQUU7TUFDL0UsTUFBTTJCLENBQUMsR0FBR2hFLGNBQWMsQ0FBRTBCLFVBQVUsQ0FBQ2dCLEtBQUssQ0FBRTs7TUFFNUM7TUFDQSxJQUFLaEIsVUFBVSxDQUFDZ0IsS0FBSyxLQUFLLENBQUMsRUFBRztRQUM1QnFCLENBQUMsSUFBSTNELDBCQUEwQixDQUFFc0IsVUFBVSxDQUFDVyxLQUFLLENBQUU7TUFDckQ7O01BRUE7TUFDQSxJQUFJLENBQUNpQixRQUFRLENBQUUsSUFBSXZGLEtBQUssQ0FBRStCLGVBQWUsQ0FBRTRCLFVBQVUsQ0FBQ1csS0FBSyxDQUFFLEVBQUU7UUFDN0QwQixDQUFDLEVBQUVBLENBQUM7UUFDSkMsQ0FBQyxFQUFFQSxDQUFDO1FBQ0pwQixLQUFLLEVBQUU5QjtNQUNULENBQUUsQ0FBRSxDQUFDOztNQUVMO01BQ0EsTUFBTW1ELGdCQUFnQixHQUFHNUQsV0FBVyxDQUFFcUIsVUFBVSxDQUFDZ0IsS0FBSyxDQUFFO01BQ3hELEtBQU0sSUFBSXdCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0QsZ0JBQWdCLENBQUNFLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7UUFDbEQsSUFBSSxDQUFDWixRQUFRLENBQUUsSUFBSXZGLEtBQUssQ0FBRUcsVUFBVSxFQUFFO1VBQ3BDNkYsQ0FBQyxFQUFFRSxnQkFBZ0IsQ0FBRUMsQ0FBQyxDQUFFO1VBQ3hCRixDQUFDLEVBQUVBLENBQUM7VUFDSnBCLEtBQUssRUFBRTlCO1FBQ1QsQ0FBRSxDQUFFLENBQUM7TUFDUDtJQUNGLENBQUMsTUFDSTtNQUNIOztNQUVBLE1BQU1zRCxLQUFLLEdBQUcxQyxVQUFVLENBQUNvQixXQUFXO01BRXBDLElBQUl1QixZQUFZLEdBQUcsQ0FBQztNQUNwQixJQUFJQyxlQUFlLEdBQUcsQ0FBQztNQUN2QixJQUFJQyxXQUFXLEdBQUcsR0FBRzs7TUFFckI7TUFDQSxJQUFLSCxLQUFLLEtBQUtoRix1QkFBdUIsQ0FBQ29GLEdBQUcsSUFBSSxDQUFDM0MsT0FBTyxDQUFDTSxhQUFhLEVBQUc7UUFDckVrQyxZQUFZLEdBQUcsQ0FBQztRQUNoQkMsZUFBZSxHQUFHLENBQUM7UUFDbkJDLFdBQVcsR0FBRyxDQUFDO01BQ2pCOztNQUVBO01BQ0E7TUFDQSxNQUFNRSxZQUFZLEdBQUdMLEtBQUssS0FBS2hGLHVCQUF1QixDQUFDc0YsOEJBQThCLEdBQUcsQ0FBQyxHQUFHLENBQUM7TUFFN0YsTUFBTUMsZUFBZSxHQUFHdkYsdUJBQXVCLENBQUN3RixvQkFBb0IsQ0FBQ3ZELEtBQUs7TUFDMUUsTUFBTXdELGdCQUFnQixHQUFHekYsdUJBQXVCLENBQUN3RixvQkFBb0IsQ0FBQ3RELE1BQU07TUFDNUUsTUFBTXdELG1CQUFtQixHQUFHSCxlQUFlLEdBQUdKLFdBQVc7TUFDekQsTUFBTVEsb0JBQW9CLEdBQUdGLGdCQUFnQixHQUFHTixXQUFXO01BQzNELE1BQU1TLGdCQUFnQixHQUFHNUYsdUJBQXVCLENBQUM2Riw2QkFBNkI7TUFFOUUsTUFBTTVELEtBQUssR0FBRzJELGdCQUFnQixDQUFDM0QsS0FBSztNQUNwQyxNQUFNQyxNQUFNLEdBQUcwRCxnQkFBZ0IsQ0FBQzFELE1BQU07O01BRXRDO01BQ0E7TUFDQSxNQUFNNEQsT0FBTyxHQUFHLENBQUU3RCxLQUFLLEdBQUdzRCxlQUFlLElBQUssR0FBRztNQUNqRCxNQUFNUSxPQUFPLEdBQUcsQ0FBRTdELE1BQU0sR0FBRytDLFlBQVksR0FBR1Usb0JBQW9CLEtBQU9WLFlBQVksR0FBRyxDQUFDLENBQUU7TUFDdkYsTUFBTWUsZUFBZSxHQUFHNUQsY0FBYyxDQUFDRixNQUFNLEdBQUc2RCxPQUFPLElBQUtkLFlBQVksR0FBRyxDQUFDLENBQUUsR0FBR1Usb0JBQW9CLEdBQUdWLFlBQVk7O01BRXBIO01BQ0EsTUFBTWdCLFlBQXFCLEdBQUcsRUFBRTtNQUNoQyxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2IsWUFBWSxFQUFFYSxDQUFDLEVBQUUsRUFBRztRQUN2QyxLQUFNLElBQUlwQixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdHLFlBQVksRUFBRUgsQ0FBQyxFQUFFLEVBQUc7VUFDdkMsS0FBTSxJQUFJcUIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHakIsZUFBZSxFQUFFaUIsQ0FBQyxFQUFFLEVBQUc7WUFFMUMsTUFBTUMsV0FBVyxHQUFHLENBQUVuRSxLQUFLLEdBQUssQ0FBRWlELGVBQWUsR0FBRyxDQUFDLElBQUtZLE9BQVMsSUFBS1osZUFBZTtZQUN2RixNQUFNWixPQUFPLEdBQUssQ0FBRTZCLENBQUMsR0FBRyxDQUFDLElBQUtMLE9BQU8sR0FBT0ssQ0FBQyxHQUFHQyxXQUFhLEdBQUtBLFdBQVcsR0FBRyxDQUFHO1lBQ25FO1lBQ0E7WUFDQUYsQ0FBQyxJQUFLOUQsY0FBYyxDQUFDSCxLQUFLLEdBQUdBLEtBQUssR0FBRyxHQUFHLENBQUU7WUFFMUQsTUFBTW9FLFNBQVMsR0FBRyxDQUFFbkUsTUFBTSxHQUFLLENBQUUrQyxZQUFZLEdBQUcsQ0FBQyxJQUFLYyxPQUFTLElBQUtkLFlBQVk7WUFDaEYsTUFBTXFCLE9BQU8sR0FBSyxDQUFFeEIsQ0FBQyxHQUFHLENBQUMsSUFBS2lCLE9BQU8sR0FBT2pCLENBQUMsR0FBR3VCLFNBQVcsR0FBS0EsU0FBUyxHQUFHLENBQUcsR0FBR0wsZUFBZTtZQUVqRyxJQUFLQyxZQUFZLENBQUNsQixNQUFNLEdBQUdDLEtBQUssRUFBRztjQUNqQyxNQUFNdUIsV0FBVyxHQUFHLElBQUk1SCxLQUFLLENBQUVxQix1QkFBdUIsQ0FBQ3dHLDZCQUE2QixDQUFDekUsR0FBRyxDQUFFVSxPQUFPLENBQUNsQyxrQkFBbUIsQ0FBQyxFQUFFO2dCQUN0SGtHLFFBQVEsRUFBRWYsbUJBQW1CO2dCQUM3QmdCLFNBQVMsRUFBRWYsb0JBQW9CO2dCQUMvQnJCLE9BQU8sRUFBRUEsT0FBTztnQkFDaEJnQyxPQUFPLEVBQUVBO2NBQ1gsQ0FBRSxDQUFDO2NBQ0gsSUFBSSxDQUFDcEMsUUFBUSxDQUFFcUMsV0FBWSxDQUFDO2NBQzVCTixZQUFZLENBQUNVLElBQUksQ0FBRUosV0FBWSxDQUFDO1lBQ2xDLENBQUMsTUFDSTtjQUNIO1lBQ0Y7VUFDRjtRQUNGO01BQ0Y7SUFDRjtFQUNGO0FBQ0Y7QUFFQTNHLGNBQWMsQ0FBQ2dILFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRWpGLGNBQWUsQ0FBQztBQUUzRCxlQUFlQSxjQUFjIn0=