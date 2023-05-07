// Copyright 2017-2021, University of Colorado Boulder

/**
 * Manages descriptions for the entire simulation Balloons and Static Electricity.  Has functions that put together
 * strings for descriptions that are used throughout several view types.
 *
 * @author Jesse Greenberg
 */

import Range from '../../../../../dot/js/Range.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import balloonsAndStaticElectricity from '../../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../../BASEA11yStrings.js';
import BASEConstants from '../../BASEConstants.js';
import PlayAreaMap from '../../model/PlayAreaMap.js';

// play area grid strings
const leftShoulderOfSweaterString = BASEA11yStrings.leftShoulderOfSweater.value;
const leftArmOfSweaterString = BASEA11yStrings.leftArmOfSweater.value;
const bottomLeftEdgeOfSweaterString = BASEA11yStrings.bottomLeftEdgeOfSweater.value;
const upperLeftSideOfSweaterString = BASEA11yStrings.upperLeftSideOfSweater.value;
const leftSideOfSweaterString = BASEA11yStrings.leftSideOfSweater.value;
const lowerLeftSideOfSweaterString = BASEA11yStrings.lowerLeftSideOfSweater.value;
const upperRightSideOfSweaterString = BASEA11yStrings.upperRightSideOfSweater.value;
const rightSideOfSweaterString = BASEA11yStrings.rightSideOfSweater.value;
const lowerRightSideOfSweater = BASEA11yStrings.lowerRightSideOfSweater.value;
const rightShoulderOfSweaterString = BASEA11yStrings.rightShoulderOfSweater.value;
const rightArmOfSweaterString = BASEA11yStrings.rightArmOfSweater.value;
const lowerRightArmOfSweaterString = BASEA11yStrings.lowerRightArmOfSweater.value;
const upperLeftSideOfPlayAreaString = BASEA11yStrings.upperLeftSideOfPlayArea.value;
const leftSideOfPlayAreaString = BASEA11yStrings.leftSideOfPlayArea.value;
const lowerLeftSideOfPlayAreaString = BASEA11yStrings.lowerLeftSideOfPlayArea.value;
const upperCenterOfPlayAreaString = BASEA11yStrings.upperCenterOfPlayArea.value;
const centerOfPlayAreaString = BASEA11yStrings.centerOfPlayArea.value;
const lowerCenterOfPlayAreaString = BASEA11yStrings.lowerCenterOfPlayArea.value;
const upperRightSideOfPlayAreaString = BASEA11yStrings.upperRightSideOfPlayArea.value;
const rightSideOfPlayAreaString = BASEA11yStrings.rightSideOfPlayArea.value;
const lowerRightSideOfPlayAreaString = BASEA11yStrings.lowerRightSideOfPlayArea.value;
const upperWallString = BASEA11yStrings.upperWall.value;
const wallString = BASEA11yStrings.wall.value;
const lowerWallString = BASEA11yStrings.lowerWall.value;
const upperRightEdgeOfPlayAreaString = BASEA11yStrings.upperRightEdgeOfPlayArea.value;
const rightEdgeOfPlayAreaString = BASEA11yStrings.rightEdgeOfPlayArea.value;
const lowerRightEdgeOfPlayAreaString = BASEA11yStrings.lowerRightEdgeOfPlayArea.value;

// charge strings
const noString = BASEA11yStrings.no.value;
const zeroString = BASEA11yStrings.zero.value;
const aFewString = BASEA11yStrings.aFew.value;
const severalString = BASEA11yStrings.several.value;
const manyString = BASEA11yStrings.many.value;
const negativeString = BASEA11yStrings.negative.value;
const eachBalloonString = BASEA11yStrings.eachBalloon.value;
const balloonNetChargePatternStringWithLabel = BASEA11yStrings.balloonNetChargePatternStringWithLabel.value;
const landmarkNearSweaterString = BASEA11yStrings.landmarkNearSweater.value;
const landmarkLeftEdgeString = BASEA11yStrings.landmarkLeftEdge.value;
const landmarkNearUpperWallString = BASEA11yStrings.landmarkNearUpperWall.value;
const landmarkNearWallString = BASEA11yStrings.landmarkNearWall.value;
const landmarkNearLowerWallString = BASEA11yStrings.landmarkNearLowerWall.value;
const landmarkNearUpperRightEdgeString = BASEA11yStrings.landmarkNearUpperRightEdge.value;
const landmarkNearRightEdgeString = BASEA11yStrings.landmarkNearRightEdge.value;
const landmarkNearLowerRightEdgeString = BASEA11yStrings.landmarkNearLowerRightEdge.value;
const landmarkAtCenterPlayAreaString = BASEA11yStrings.landmarkAtCenterPlayArea.value;
const landmarkAtUpperCenterPlayAreaString = BASEA11yStrings.landmarkAtUpperCenterPlayArea.value;
const landmarkAtLowerCenterPlayAreaString = BASEA11yStrings.landmarkAtLowerCenterPlayArea.value;
const upString = BASEA11yStrings.up.value;
const leftString = BASEA11yStrings.left.value;
const downString = BASEA11yStrings.down.value;
const rightString = BASEA11yStrings.right.value;
const upAndToTheRightString = BASEA11yStrings.upAndToTheRight.value;
const upAndToTheLeftString = BASEA11yStrings.upAndToTheLeft.value;
const downAndToTheRightString = BASEA11yStrings.downAndToTheRight.value;
const downAndToTheLeftString = BASEA11yStrings.downAndToTheLeft.value;

// charge strings
const summaryNeutralChargesPatternString = BASEA11yStrings.summaryNeutralChargesPattern.value;
const showingNoChargesString = BASEA11yStrings.showingNoCharges.value;

// constants
const POSITION_DESCRIPTION_MAP = {
  AT_LEFT_EDGE: {
    UPPER_PLAY_AREA: landmarkLeftEdgeString,
    CENTER_PLAY_AREA: landmarkLeftEdgeString,
    LOWER_PLAY_AREA: landmarkLeftEdgeString
  },
  LEFT_ARM: {
    UPPER_PLAY_AREA: leftShoulderOfSweaterString,
    CENTER_PLAY_AREA: leftArmOfSweaterString,
    LOWER_PLAY_AREA: bottomLeftEdgeOfSweaterString
  },
  LEFT_SIDE_OF_SWEATER: {
    UPPER_PLAY_AREA: upperLeftSideOfSweaterString,
    CENTER_PLAY_AREA: leftSideOfSweaterString,
    LOWER_PLAY_AREA: lowerLeftSideOfSweaterString
  },
  RIGHT_SIDE_OF_SWEATER: {
    UPPER_PLAY_AREA: upperRightSideOfSweaterString,
    CENTER_PLAY_AREA: rightSideOfSweaterString,
    LOWER_PLAY_AREA: lowerRightSideOfSweater
  },
  RIGHT_ARM: {
    UPPER_PLAY_AREA: rightShoulderOfSweaterString,
    CENTER_PLAY_AREA: rightArmOfSweaterString,
    LOWER_PLAY_AREA: lowerRightArmOfSweaterString
  },
  AT_VERY_CLOSE_TO_SWEATER: {
    UPPER_PLAY_AREA: landmarkNearSweaterString,
    CENTER_PLAY_AREA: landmarkNearSweaterString,
    LOWER_PLAY_AREA: landmarkNearSweaterString
  },
  AT_NEAR_SWEATER: {
    UPPER_PLAY_AREA: landmarkNearSweaterString,
    CENTER_PLAY_AREA: landmarkNearSweaterString,
    LOWER_PLAY_AREA: landmarkNearSweaterString
  },
  LEFT_PLAY_AREA: {
    UPPER_PLAY_AREA: upperLeftSideOfPlayAreaString,
    CENTER_PLAY_AREA: leftSideOfPlayAreaString,
    LOWER_PLAY_AREA: lowerLeftSideOfPlayAreaString
  },
  AT_CENTER_PLAY_AREA: {
    UPPER_PLAY_AREA: landmarkAtUpperCenterPlayAreaString,
    CENTER_PLAY_AREA: landmarkAtCenterPlayAreaString,
    LOWER_PLAY_AREA: landmarkAtLowerCenterPlayAreaString
  },
  CENTER_PLAY_AREA: {
    UPPER_PLAY_AREA: upperCenterOfPlayAreaString,
    CENTER_PLAY_AREA: centerOfPlayAreaString,
    LOWER_PLAY_AREA: lowerCenterOfPlayAreaString
  },
  RIGHT_PLAY_AREA: {
    UPPER_PLAY_AREA: upperRightSideOfPlayAreaString,
    CENTER_PLAY_AREA: rightSideOfPlayAreaString,
    LOWER_PLAY_AREA: lowerRightSideOfPlayAreaString
  },
  AT_NEAR_WALL: {
    UPPER_PLAY_AREA: landmarkNearUpperWallString,
    CENTER_PLAY_AREA: landmarkNearWallString,
    LOWER_PLAY_AREA: landmarkNearLowerWallString
  },
  AT_VERY_CLOSE_TO_WALL: {
    UPPER_PLAY_AREA: landmarkNearUpperWallString,
    CENTER_PLAY_AREA: landmarkNearWallString,
    LOWER_PLAY_AREA: landmarkNearLowerWallString
  },
  AT_WALL: {
    UPPER_PLAY_AREA: upperWallString,
    CENTER_PLAY_AREA: wallString,
    LOWER_PLAY_AREA: lowerWallString
  },
  WALL: {
    UPPER_PLAY_AREA: upperWallString,
    CENTER_PLAY_AREA: wallString,
    LOWER_PLAY_AREA: lowerWallString
  },
  AT_NEAR_RIGHT_EDGE: {
    UPPER_PLAY_AREA: landmarkNearUpperRightEdgeString,
    CENTER_PLAY_AREA: landmarkNearRightEdgeString,
    LOWER_PLAY_AREA: landmarkNearLowerRightEdgeString
  },
  AT_VERY_CLOSE_TO_RIGHT_EDGE: {
    UPPER_PLAY_AREA: landmarkNearUpperRightEdgeString,
    CENTER_PLAY_AREA: landmarkNearRightEdgeString,
    LOWER_PLAY_AREA: landmarkNearLowerRightEdgeString
  },
  RIGHT_EDGE: {
    UPPER_PLAY_AREA: upperRightEdgeOfPlayAreaString,
    CENTER_PLAY_AREA: rightEdgeOfPlayAreaString,
    LOWER_PLAY_AREA: lowerRightEdgeOfPlayAreaString
  },
  AT_RIGHT_EDGE: {
    UPPER_PLAY_AREA: upperRightEdgeOfPlayAreaString,
    CENTER_PLAY_AREA: rightEdgeOfPlayAreaString,
    LOWER_PLAY_AREA: lowerRightEdgeOfPlayAreaString
  }
};

/**
 * Generate a map from physical value to accessible descripton. Each described range has a length of
 * valueRange / descriptionArray.length
 *
 * @param {[].string} descriptionArray
 * @param {RangeWithValue} valueRange
 * @param {Object[]} [entries] - Additional entries to add to the mapped value range, will look something like
 *                             { description: {string}, range: {Range} }
 *
 * @returns {Object}
 */
const generateDescriptionMapWithEntries = (descriptionArray, valueRange, entries) => {
  entries = entries || [];
  const map = {};
  let minValue = valueRange.min;
  for (let i = 0; i < descriptionArray.length; i++) {
    const nextMin = minValue + valueRange.getLength() / descriptionArray.length;
    map[i] = {};
    map[i].description = descriptionArray[i];
    map[i].range = new Range(minValue, nextMin);

    // correct for any precision issues
    if (i === descriptionArray.length - 1) {
      map[descriptionArray.length - 1].range = new Range(minValue, valueRange.max);
    }
    minValue = nextMin;
  }
  if (entries.length > 0) {
    for (let j = 0; j < entries.length; j++) {
      map[descriptionArray.length + j] = entries[j];
    }
  }
  return map;
};
const relativeChargeStrings = [aFewString, severalString, manyString];
const RELATIVE_CHARGE_DESCRIPTION_MAP = generateDescriptionMapWithEntries(relativeChargeStrings, new Range(1, BASEConstants.MAX_BALLOON_CHARGE), [{
  range: new Range(0, 0),
  description: noString
}]);

// maps  direction to a description string
const DIRECTION_MAP = {
  UP: upString,
  DOWN: downString,
  LEFT: leftString,
  RIGHT: rightString,
  UP_RIGHT: upAndToTheRightString,
  UP_LEFT: upAndToTheLeftString,
  DOWN_RIGHT: downAndToTheRightString,
  DOWN_LEFT: downAndToTheLeftString
};
const BASEDescriber = {
  /**
   * Get the position description for the balloon. This is not a full description, but a short
   * descsription. Regions are defined in PlayAreaMap.  This will get called very often and needs to be quick.
   *
   * @param {Vector2} position - position of the balloon, relative to its center
   * @returns {string}
   */
  getPositionDescription(position, wallVisible) {
    const landmarks = PlayAreaMap.LANDMARK_RANGES;
    const columns = PlayAreaMap.COLUMN_RANGES;
    const positions = PlayAreaMap.X_POSITIONS;
    const rows = PlayAreaMap.ROW_RANGES;

    // loop through keys manually to prevent a many closures from being created during object iteration in 'for in'
    // loops
    const columnsKeys = Object.keys(columns);
    const rowKeys = Object.keys(rows);
    const landmarkKeys = Object.keys(landmarks);
    const positionKeys = Object.keys(positions);
    let i;
    let currentPosition;
    let currentLandmark;
    let currentColumn;
    let currentRow;

    // critical x positions take priority, start there
    for (i = 0; i < positionKeys.length; i++) {
      if (position.x === positions[positionKeys[i]]) {
        currentPosition = positionKeys[i];
      }
    }
    for (i = 0; i < landmarkKeys.length; i++) {
      if (landmarks[landmarkKeys[i]].contains(position.x)) {
        currentLandmark = landmarkKeys[i];
      }
    }

    // landmark takes priority - only find column if we couldn't find landmark
    if (!currentLandmark) {
      for (i = 0; i < columnsKeys.length; i++) {
        if (columns[columnsKeys[i]].contains(position.x)) {
          currentColumn = columnsKeys[i];
        }
      }
    }
    for (i = 0; i < rowKeys.length; i++) {
      if (rows[rowKeys[i]].contains(position.y)) {
        currentRow = rowKeys[i];
      }
    }

    // use position, column, or landmark, whichever was found, prioritizing position
    currentColumn = currentPosition || currentLandmark || currentColumn;
    assert && assert(currentColumn && currentRow, 'item should be in a row or column of the play area');

    // the wall and the right edge of the play area overlap, so if the wall is visible chose that description
    if (wallVisible && (currentColumn === 'RIGHT_EDGE' || currentColumn === 'AT_RIGHT_EDGE')) {
      currentColumn = 'WALL';
    }
    if (!wallVisible && BASEDescriber.inWallColumn(currentColumn)) {
      currentColumn = 'RIGHT_PLAY_AREA';
    }
    return POSITION_DESCRIPTION_MAP[currentColumn][currentRow];
  },
  /**
   * Returns whether or not the column is in one of the 'wall' columns, could  be at, near, or very close to wall.
   * @private
   *
   * @param {string} column - one of keys in POSITION_DESCRIPTION_MAP
   * @returns {boolean}
   */
  inWallColumn(column) {
    return column === 'AT_WALL' || column === 'AT_NEAR_WALL' || column === 'WALL' || column === 'AT_VERY_CLOSE_TO_WALL';
  },
  /**
   * Get a fragment that describes the relative charge for an objet, like 'a few' or 'several', to be used in
   * string patterns
   *
   * @param  {number} charge
   * @returns {string}
   */
  getRelativeChargeDescription(charge) {
    // the description is mapped to the absolute value of charge
    const absCharge = Math.abs(charge);
    const keys = Object.keys(RELATIVE_CHARGE_DESCRIPTION_MAP);
    let description;
    for (let i = 0; i < keys.length; i++) {
      const value = RELATIVE_CHARGE_DESCRIPTION_MAP[keys[i]];
      if (value.range.contains(absCharge)) {
        description = value.description;
        break;
      }
    }
    assert && assert(description, 'no relative description found for charge value, check value or entries in description map');
    return description;
  },
  /**
   * For a given charge, get the described range. Useful for comparing ranges before and after
   * a charge pickup. Descriptions are generated relative to the absolute value of the charge.
   *
   * @param  {number} charge
   * @returns {Range}
   */
  getDescribedChargeRange(charge) {
    const describedCharge = Math.abs(charge);
    const keys = Object.keys(RELATIVE_CHARGE_DESCRIPTION_MAP);
    let range;
    for (let i = 0; i < keys.length; i++) {
      const value = RELATIVE_CHARGE_DESCRIPTION_MAP[keys[i]];
      if (value.range.contains(describedCharge)) {
        range = value.range;
        break;
      }
    }
    assert && assert(range, `no charge range found for charge ${charge}`);
    return range;
  },
  /**
   * Returns true if both balloons the same described charge range.
   *
   * @param {BalloonModel} balloonA
   * @param {BalloonModel} balloonB
   *
   * @returns {[type]} [description]
   */
  getBalloonsVisibleWithSameChargeRange(balloonA, balloonB) {
    const rangeA = BASEDescriber.getDescribedChargeRange(balloonA.chargeProperty.get());
    const rangeB = BASEDescriber.getDescribedChargeRange(balloonB.chargeProperty.get());
    const visibleA = balloonA.isVisibleProperty.get();
    const visibleB = balloonB.isVisibleProperty.get();
    return rangeA.equals(rangeB) && visibleA && visibleB;
  },
  /**
   * Get a direction description from one of BalloonDirectionEnum. Something like down', or 'up and to the left'.
   * @public
   *
   * @param {string} direction - one of BalloonDirectionEnum
   * @returns {string}
   */
  getDirectionDescription(direction) {
    return DIRECTION_MAP[direction];
  },
  /**
   * Get a description of the net charge for each balloon, including the label 'Each balloon'. Will return something
   * like
   * "Each balloon has negative net charge." or
   * "Each balloon has zero net charge."
   *
   * @returns {string}
   */
  getNetChargeDescriptionWithLabel(charge) {
    const chargeAmountString = charge < 0 ? negativeString : zeroString;
    return StringUtils.fillIn(balloonNetChargePatternStringWithLabel, {
      chargeAmount: chargeAmountString,
      balloon: eachBalloonString
    });
  },
  /**
   * Get a description for the charges shown when the object is neutral. When neutral, the object will either be
   * showing no charges, or showing "{{many}} pairs of negative and positive charges". Will return something like
   *
   * "no charges shown" or
   * "showing many pairs of positive and negative charges"
   *
   * @param {string} chargesShown
   * @param {number} numberOfCharges
   * @returns {string}
   */
  getNeutralChargesShownDescription(chargesShown, numberOfCharges) {
    let description;
    const relativeCharge = BASEDescriber.getRelativeChargeDescription(numberOfCharges);
    if (chargesShown === 'all') {
      description = StringUtils.fillIn(summaryNeutralChargesPatternString, {
        amount: relativeCharge
      });
    } else {
      description = showingNoChargesString;
    }
    return description;
  }
};
balloonsAndStaticElectricity.register('BASEDescriber', BASEDescriber);
export default BASEDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlN0cmluZ1V0aWxzIiwiYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eSIsIkJBU0VBMTF5U3RyaW5ncyIsIkJBU0VDb25zdGFudHMiLCJQbGF5QXJlYU1hcCIsImxlZnRTaG91bGRlck9mU3dlYXRlclN0cmluZyIsImxlZnRTaG91bGRlck9mU3dlYXRlciIsInZhbHVlIiwibGVmdEFybU9mU3dlYXRlclN0cmluZyIsImxlZnRBcm1PZlN3ZWF0ZXIiLCJib3R0b21MZWZ0RWRnZU9mU3dlYXRlclN0cmluZyIsImJvdHRvbUxlZnRFZGdlT2ZTd2VhdGVyIiwidXBwZXJMZWZ0U2lkZU9mU3dlYXRlclN0cmluZyIsInVwcGVyTGVmdFNpZGVPZlN3ZWF0ZXIiLCJsZWZ0U2lkZU9mU3dlYXRlclN0cmluZyIsImxlZnRTaWRlT2ZTd2VhdGVyIiwibG93ZXJMZWZ0U2lkZU9mU3dlYXRlclN0cmluZyIsImxvd2VyTGVmdFNpZGVPZlN3ZWF0ZXIiLCJ1cHBlclJpZ2h0U2lkZU9mU3dlYXRlclN0cmluZyIsInVwcGVyUmlnaHRTaWRlT2ZTd2VhdGVyIiwicmlnaHRTaWRlT2ZTd2VhdGVyU3RyaW5nIiwicmlnaHRTaWRlT2ZTd2VhdGVyIiwibG93ZXJSaWdodFNpZGVPZlN3ZWF0ZXIiLCJyaWdodFNob3VsZGVyT2ZTd2VhdGVyU3RyaW5nIiwicmlnaHRTaG91bGRlck9mU3dlYXRlciIsInJpZ2h0QXJtT2ZTd2VhdGVyU3RyaW5nIiwicmlnaHRBcm1PZlN3ZWF0ZXIiLCJsb3dlclJpZ2h0QXJtT2ZTd2VhdGVyU3RyaW5nIiwibG93ZXJSaWdodEFybU9mU3dlYXRlciIsInVwcGVyTGVmdFNpZGVPZlBsYXlBcmVhU3RyaW5nIiwidXBwZXJMZWZ0U2lkZU9mUGxheUFyZWEiLCJsZWZ0U2lkZU9mUGxheUFyZWFTdHJpbmciLCJsZWZ0U2lkZU9mUGxheUFyZWEiLCJsb3dlckxlZnRTaWRlT2ZQbGF5QXJlYVN0cmluZyIsImxvd2VyTGVmdFNpZGVPZlBsYXlBcmVhIiwidXBwZXJDZW50ZXJPZlBsYXlBcmVhU3RyaW5nIiwidXBwZXJDZW50ZXJPZlBsYXlBcmVhIiwiY2VudGVyT2ZQbGF5QXJlYVN0cmluZyIsImNlbnRlck9mUGxheUFyZWEiLCJsb3dlckNlbnRlck9mUGxheUFyZWFTdHJpbmciLCJsb3dlckNlbnRlck9mUGxheUFyZWEiLCJ1cHBlclJpZ2h0U2lkZU9mUGxheUFyZWFTdHJpbmciLCJ1cHBlclJpZ2h0U2lkZU9mUGxheUFyZWEiLCJyaWdodFNpZGVPZlBsYXlBcmVhU3RyaW5nIiwicmlnaHRTaWRlT2ZQbGF5QXJlYSIsImxvd2VyUmlnaHRTaWRlT2ZQbGF5QXJlYVN0cmluZyIsImxvd2VyUmlnaHRTaWRlT2ZQbGF5QXJlYSIsInVwcGVyV2FsbFN0cmluZyIsInVwcGVyV2FsbCIsIndhbGxTdHJpbmciLCJ3YWxsIiwibG93ZXJXYWxsU3RyaW5nIiwibG93ZXJXYWxsIiwidXBwZXJSaWdodEVkZ2VPZlBsYXlBcmVhU3RyaW5nIiwidXBwZXJSaWdodEVkZ2VPZlBsYXlBcmVhIiwicmlnaHRFZGdlT2ZQbGF5QXJlYVN0cmluZyIsInJpZ2h0RWRnZU9mUGxheUFyZWEiLCJsb3dlclJpZ2h0RWRnZU9mUGxheUFyZWFTdHJpbmciLCJsb3dlclJpZ2h0RWRnZU9mUGxheUFyZWEiLCJub1N0cmluZyIsIm5vIiwiemVyb1N0cmluZyIsInplcm8iLCJhRmV3U3RyaW5nIiwiYUZldyIsInNldmVyYWxTdHJpbmciLCJzZXZlcmFsIiwibWFueVN0cmluZyIsIm1hbnkiLCJuZWdhdGl2ZVN0cmluZyIsIm5lZ2F0aXZlIiwiZWFjaEJhbGxvb25TdHJpbmciLCJlYWNoQmFsbG9vbiIsImJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nV2l0aExhYmVsIiwibGFuZG1hcmtOZWFyU3dlYXRlclN0cmluZyIsImxhbmRtYXJrTmVhclN3ZWF0ZXIiLCJsYW5kbWFya0xlZnRFZGdlU3RyaW5nIiwibGFuZG1hcmtMZWZ0RWRnZSIsImxhbmRtYXJrTmVhclVwcGVyV2FsbFN0cmluZyIsImxhbmRtYXJrTmVhclVwcGVyV2FsbCIsImxhbmRtYXJrTmVhcldhbGxTdHJpbmciLCJsYW5kbWFya05lYXJXYWxsIiwibGFuZG1hcmtOZWFyTG93ZXJXYWxsU3RyaW5nIiwibGFuZG1hcmtOZWFyTG93ZXJXYWxsIiwibGFuZG1hcmtOZWFyVXBwZXJSaWdodEVkZ2VTdHJpbmciLCJsYW5kbWFya05lYXJVcHBlclJpZ2h0RWRnZSIsImxhbmRtYXJrTmVhclJpZ2h0RWRnZVN0cmluZyIsImxhbmRtYXJrTmVhclJpZ2h0RWRnZSIsImxhbmRtYXJrTmVhckxvd2VyUmlnaHRFZGdlU3RyaW5nIiwibGFuZG1hcmtOZWFyTG93ZXJSaWdodEVkZ2UiLCJsYW5kbWFya0F0Q2VudGVyUGxheUFyZWFTdHJpbmciLCJsYW5kbWFya0F0Q2VudGVyUGxheUFyZWEiLCJsYW5kbWFya0F0VXBwZXJDZW50ZXJQbGF5QXJlYVN0cmluZyIsImxhbmRtYXJrQXRVcHBlckNlbnRlclBsYXlBcmVhIiwibGFuZG1hcmtBdExvd2VyQ2VudGVyUGxheUFyZWFTdHJpbmciLCJsYW5kbWFya0F0TG93ZXJDZW50ZXJQbGF5QXJlYSIsInVwU3RyaW5nIiwidXAiLCJsZWZ0U3RyaW5nIiwibGVmdCIsImRvd25TdHJpbmciLCJkb3duIiwicmlnaHRTdHJpbmciLCJyaWdodCIsInVwQW5kVG9UaGVSaWdodFN0cmluZyIsInVwQW5kVG9UaGVSaWdodCIsInVwQW5kVG9UaGVMZWZ0U3RyaW5nIiwidXBBbmRUb1RoZUxlZnQiLCJkb3duQW5kVG9UaGVSaWdodFN0cmluZyIsImRvd25BbmRUb1RoZVJpZ2h0IiwiZG93bkFuZFRvVGhlTGVmdFN0cmluZyIsImRvd25BbmRUb1RoZUxlZnQiLCJzdW1tYXJ5TmV1dHJhbENoYXJnZXNQYXR0ZXJuU3RyaW5nIiwic3VtbWFyeU5ldXRyYWxDaGFyZ2VzUGF0dGVybiIsInNob3dpbmdOb0NoYXJnZXNTdHJpbmciLCJzaG93aW5nTm9DaGFyZ2VzIiwiUE9TSVRJT05fREVTQ1JJUFRJT05fTUFQIiwiQVRfTEVGVF9FREdFIiwiVVBQRVJfUExBWV9BUkVBIiwiQ0VOVEVSX1BMQVlfQVJFQSIsIkxPV0VSX1BMQVlfQVJFQSIsIkxFRlRfQVJNIiwiTEVGVF9TSURFX09GX1NXRUFURVIiLCJSSUdIVF9TSURFX09GX1NXRUFURVIiLCJSSUdIVF9BUk0iLCJBVF9WRVJZX0NMT1NFX1RPX1NXRUFURVIiLCJBVF9ORUFSX1NXRUFURVIiLCJMRUZUX1BMQVlfQVJFQSIsIkFUX0NFTlRFUl9QTEFZX0FSRUEiLCJSSUdIVF9QTEFZX0FSRUEiLCJBVF9ORUFSX1dBTEwiLCJBVF9WRVJZX0NMT1NFX1RPX1dBTEwiLCJBVF9XQUxMIiwiV0FMTCIsIkFUX05FQVJfUklHSFRfRURHRSIsIkFUX1ZFUllfQ0xPU0VfVE9fUklHSFRfRURHRSIsIlJJR0hUX0VER0UiLCJBVF9SSUdIVF9FREdFIiwiZ2VuZXJhdGVEZXNjcmlwdGlvbk1hcFdpdGhFbnRyaWVzIiwiZGVzY3JpcHRpb25BcnJheSIsInZhbHVlUmFuZ2UiLCJlbnRyaWVzIiwibWFwIiwibWluVmFsdWUiLCJtaW4iLCJpIiwibGVuZ3RoIiwibmV4dE1pbiIsImdldExlbmd0aCIsImRlc2NyaXB0aW9uIiwicmFuZ2UiLCJtYXgiLCJqIiwicmVsYXRpdmVDaGFyZ2VTdHJpbmdzIiwiUkVMQVRJVkVfQ0hBUkdFX0RFU0NSSVBUSU9OX01BUCIsIk1BWF9CQUxMT09OX0NIQVJHRSIsIkRJUkVDVElPTl9NQVAiLCJVUCIsIkRPV04iLCJMRUZUIiwiUklHSFQiLCJVUF9SSUdIVCIsIlVQX0xFRlQiLCJET1dOX1JJR0hUIiwiRE9XTl9MRUZUIiwiQkFTRURlc2NyaWJlciIsImdldFBvc2l0aW9uRGVzY3JpcHRpb24iLCJwb3NpdGlvbiIsIndhbGxWaXNpYmxlIiwibGFuZG1hcmtzIiwiTEFORE1BUktfUkFOR0VTIiwiY29sdW1ucyIsIkNPTFVNTl9SQU5HRVMiLCJwb3NpdGlvbnMiLCJYX1BPU0lUSU9OUyIsInJvd3MiLCJST1dfUkFOR0VTIiwiY29sdW1uc0tleXMiLCJPYmplY3QiLCJrZXlzIiwicm93S2V5cyIsImxhbmRtYXJrS2V5cyIsInBvc2l0aW9uS2V5cyIsImN1cnJlbnRQb3NpdGlvbiIsImN1cnJlbnRMYW5kbWFyayIsImN1cnJlbnRDb2x1bW4iLCJjdXJyZW50Um93IiwieCIsImNvbnRhaW5zIiwieSIsImFzc2VydCIsImluV2FsbENvbHVtbiIsImNvbHVtbiIsImdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24iLCJjaGFyZ2UiLCJhYnNDaGFyZ2UiLCJNYXRoIiwiYWJzIiwiZ2V0RGVzY3JpYmVkQ2hhcmdlUmFuZ2UiLCJkZXNjcmliZWRDaGFyZ2UiLCJnZXRCYWxsb29uc1Zpc2libGVXaXRoU2FtZUNoYXJnZVJhbmdlIiwiYmFsbG9vbkEiLCJiYWxsb29uQiIsInJhbmdlQSIsImNoYXJnZVByb3BlcnR5IiwiZ2V0IiwicmFuZ2VCIiwidmlzaWJsZUEiLCJpc1Zpc2libGVQcm9wZXJ0eSIsInZpc2libGVCIiwiZXF1YWxzIiwiZ2V0RGlyZWN0aW9uRGVzY3JpcHRpb24iLCJkaXJlY3Rpb24iLCJnZXROZXRDaGFyZ2VEZXNjcmlwdGlvbldpdGhMYWJlbCIsImNoYXJnZUFtb3VudFN0cmluZyIsImZpbGxJbiIsImNoYXJnZUFtb3VudCIsImJhbGxvb24iLCJnZXROZXV0cmFsQ2hhcmdlc1Nob3duRGVzY3JpcHRpb24iLCJjaGFyZ2VzU2hvd24iLCJudW1iZXJPZkNoYXJnZXMiLCJyZWxhdGl2ZUNoYXJnZSIsImFtb3VudCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQkFTRURlc2NyaWJlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYW5hZ2VzIGRlc2NyaXB0aW9ucyBmb3IgdGhlIGVudGlyZSBzaW11bGF0aW9uIEJhbGxvb25zIGFuZCBTdGF0aWMgRWxlY3RyaWNpdHkuICBIYXMgZnVuY3Rpb25zIHRoYXQgcHV0IHRvZ2V0aGVyXHJcbiAqIHN0cmluZ3MgZm9yIGRlc2NyaXB0aW9ucyB0aGF0IGFyZSB1c2VkIHRocm91Z2hvdXQgc2V2ZXJhbCB2aWV3IHR5cGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IGJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkgZnJvbSAnLi4vLi4vLi4vYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5qcyc7XHJcbmltcG9ydCBCQVNFQTExeVN0cmluZ3MgZnJvbSAnLi4vLi4vQkFTRUExMXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJBU0VDb25zdGFudHMgZnJvbSAnLi4vLi4vQkFTRUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQbGF5QXJlYU1hcCBmcm9tICcuLi8uLi9tb2RlbC9QbGF5QXJlYU1hcC5qcyc7XHJcblxyXG4vLyBwbGF5IGFyZWEgZ3JpZCBzdHJpbmdzXHJcbmNvbnN0IGxlZnRTaG91bGRlck9mU3dlYXRlclN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sZWZ0U2hvdWxkZXJPZlN3ZWF0ZXIudmFsdWU7XHJcbmNvbnN0IGxlZnRBcm1PZlN3ZWF0ZXJTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MubGVmdEFybU9mU3dlYXRlci52YWx1ZTtcclxuY29uc3QgYm90dG9tTGVmdEVkZ2VPZlN3ZWF0ZXJTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYm90dG9tTGVmdEVkZ2VPZlN3ZWF0ZXIudmFsdWU7XHJcblxyXG5jb25zdCB1cHBlckxlZnRTaWRlT2ZTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnVwcGVyTGVmdFNpZGVPZlN3ZWF0ZXIudmFsdWU7XHJcbmNvbnN0IGxlZnRTaWRlT2ZTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxlZnRTaWRlT2ZTd2VhdGVyLnZhbHVlO1xyXG5jb25zdCBsb3dlckxlZnRTaWRlT2ZTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxvd2VyTGVmdFNpZGVPZlN3ZWF0ZXIudmFsdWU7XHJcblxyXG5jb25zdCB1cHBlclJpZ2h0U2lkZU9mU3dlYXRlclN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy51cHBlclJpZ2h0U2lkZU9mU3dlYXRlci52YWx1ZTtcclxuY29uc3QgcmlnaHRTaWRlT2ZTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnJpZ2h0U2lkZU9mU3dlYXRlci52YWx1ZTtcclxuY29uc3QgbG93ZXJSaWdodFNpZGVPZlN3ZWF0ZXIgPSBCQVNFQTExeVN0cmluZ3MubG93ZXJSaWdodFNpZGVPZlN3ZWF0ZXIudmFsdWU7XHJcblxyXG5jb25zdCByaWdodFNob3VsZGVyT2ZTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnJpZ2h0U2hvdWxkZXJPZlN3ZWF0ZXIudmFsdWU7XHJcbmNvbnN0IHJpZ2h0QXJtT2ZTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnJpZ2h0QXJtT2ZTd2VhdGVyLnZhbHVlO1xyXG5jb25zdCBsb3dlclJpZ2h0QXJtT2ZTd2VhdGVyU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxvd2VyUmlnaHRBcm1PZlN3ZWF0ZXIudmFsdWU7XHJcblxyXG5jb25zdCB1cHBlckxlZnRTaWRlT2ZQbGF5QXJlYVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy51cHBlckxlZnRTaWRlT2ZQbGF5QXJlYS52YWx1ZTtcclxuY29uc3QgbGVmdFNpZGVPZlBsYXlBcmVhU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxlZnRTaWRlT2ZQbGF5QXJlYS52YWx1ZTtcclxuY29uc3QgbG93ZXJMZWZ0U2lkZU9mUGxheUFyZWFTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MubG93ZXJMZWZ0U2lkZU9mUGxheUFyZWEudmFsdWU7XHJcblxyXG5jb25zdCB1cHBlckNlbnRlck9mUGxheUFyZWFTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXBwZXJDZW50ZXJPZlBsYXlBcmVhLnZhbHVlO1xyXG5jb25zdCBjZW50ZXJPZlBsYXlBcmVhU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmNlbnRlck9mUGxheUFyZWEudmFsdWU7XHJcbmNvbnN0IGxvd2VyQ2VudGVyT2ZQbGF5QXJlYVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sb3dlckNlbnRlck9mUGxheUFyZWEudmFsdWU7XHJcblxyXG5jb25zdCB1cHBlclJpZ2h0U2lkZU9mUGxheUFyZWFTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXBwZXJSaWdodFNpZGVPZlBsYXlBcmVhLnZhbHVlO1xyXG5jb25zdCByaWdodFNpZGVPZlBsYXlBcmVhU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnJpZ2h0U2lkZU9mUGxheUFyZWEudmFsdWU7XHJcbmNvbnN0IGxvd2VyUmlnaHRTaWRlT2ZQbGF5QXJlYVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sb3dlclJpZ2h0U2lkZU9mUGxheUFyZWEudmFsdWU7XHJcblxyXG5jb25zdCB1cHBlcldhbGxTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXBwZXJXYWxsLnZhbHVlO1xyXG5jb25zdCB3YWxsU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLndhbGwudmFsdWU7XHJcbmNvbnN0IGxvd2VyV2FsbFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sb3dlcldhbGwudmFsdWU7XHJcblxyXG5jb25zdCB1cHBlclJpZ2h0RWRnZU9mUGxheUFyZWFTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXBwZXJSaWdodEVkZ2VPZlBsYXlBcmVhLnZhbHVlO1xyXG5jb25zdCByaWdodEVkZ2VPZlBsYXlBcmVhU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnJpZ2h0RWRnZU9mUGxheUFyZWEudmFsdWU7XHJcbmNvbnN0IGxvd2VyUmlnaHRFZGdlT2ZQbGF5QXJlYVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sb3dlclJpZ2h0RWRnZU9mUGxheUFyZWEudmFsdWU7XHJcblxyXG4vLyBjaGFyZ2Ugc3RyaW5nc1xyXG5jb25zdCBub1N0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5uby52YWx1ZTtcclxuY29uc3QgemVyb1N0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy56ZXJvLnZhbHVlO1xyXG5jb25zdCBhRmV3U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmFGZXcudmFsdWU7XHJcbmNvbnN0IHNldmVyYWxTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc2V2ZXJhbC52YWx1ZTtcclxuY29uc3QgbWFueVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5tYW55LnZhbHVlO1xyXG5jb25zdCBuZWdhdGl2ZVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5uZWdhdGl2ZS52YWx1ZTtcclxuXHJcbmNvbnN0IGVhY2hCYWxsb29uU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmVhY2hCYWxsb29uLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uTmV0Q2hhcmdlUGF0dGVyblN0cmluZ1dpdGhMYWJlbCA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uTmV0Q2hhcmdlUGF0dGVyblN0cmluZ1dpdGhMYWJlbC52YWx1ZTtcclxuXHJcbmNvbnN0IGxhbmRtYXJrTmVhclN3ZWF0ZXJTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MubGFuZG1hcmtOZWFyU3dlYXRlci52YWx1ZTtcclxuY29uc3QgbGFuZG1hcmtMZWZ0RWRnZVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sYW5kbWFya0xlZnRFZGdlLnZhbHVlO1xyXG5jb25zdCBsYW5kbWFya05lYXJVcHBlcldhbGxTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MubGFuZG1hcmtOZWFyVXBwZXJXYWxsLnZhbHVlO1xyXG5jb25zdCBsYW5kbWFya05lYXJXYWxsU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxhbmRtYXJrTmVhcldhbGwudmFsdWU7XHJcbmNvbnN0IGxhbmRtYXJrTmVhckxvd2VyV2FsbFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sYW5kbWFya05lYXJMb3dlcldhbGwudmFsdWU7XHJcbmNvbnN0IGxhbmRtYXJrTmVhclVwcGVyUmlnaHRFZGdlU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxhbmRtYXJrTmVhclVwcGVyUmlnaHRFZGdlLnZhbHVlO1xyXG5jb25zdCBsYW5kbWFya05lYXJSaWdodEVkZ2VTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MubGFuZG1hcmtOZWFyUmlnaHRFZGdlLnZhbHVlO1xyXG5jb25zdCBsYW5kbWFya05lYXJMb3dlclJpZ2h0RWRnZVN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5sYW5kbWFya05lYXJMb3dlclJpZ2h0RWRnZS52YWx1ZTtcclxuY29uc3QgbGFuZG1hcmtBdENlbnRlclBsYXlBcmVhU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxhbmRtYXJrQXRDZW50ZXJQbGF5QXJlYS52YWx1ZTtcclxuY29uc3QgbGFuZG1hcmtBdFVwcGVyQ2VudGVyUGxheUFyZWFTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MubGFuZG1hcmtBdFVwcGVyQ2VudGVyUGxheUFyZWEudmFsdWU7XHJcbmNvbnN0IGxhbmRtYXJrQXRMb3dlckNlbnRlclBsYXlBcmVhU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxhbmRtYXJrQXRMb3dlckNlbnRlclBsYXlBcmVhLnZhbHVlO1xyXG5cclxuY29uc3QgdXBTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXAudmFsdWU7XHJcbmNvbnN0IGxlZnRTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MubGVmdC52YWx1ZTtcclxuY29uc3QgZG93blN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5kb3duLnZhbHVlO1xyXG5jb25zdCByaWdodFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5yaWdodC52YWx1ZTtcclxuY29uc3QgdXBBbmRUb1RoZVJpZ2h0U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnVwQW5kVG9UaGVSaWdodC52YWx1ZTtcclxuY29uc3QgdXBBbmRUb1RoZUxlZnRTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MudXBBbmRUb1RoZUxlZnQudmFsdWU7XHJcbmNvbnN0IGRvd25BbmRUb1RoZVJpZ2h0U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmRvd25BbmRUb1RoZVJpZ2h0LnZhbHVlO1xyXG5jb25zdCBkb3duQW5kVG9UaGVMZWZ0U3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmRvd25BbmRUb1RoZUxlZnQudmFsdWU7XHJcblxyXG4vLyBjaGFyZ2Ugc3RyaW5nc1xyXG5jb25zdCBzdW1tYXJ5TmV1dHJhbENoYXJnZXNQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnN1bW1hcnlOZXV0cmFsQ2hhcmdlc1BhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHNob3dpbmdOb0NoYXJnZXNTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc2hvd2luZ05vQ2hhcmdlcy52YWx1ZTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBQT1NJVElPTl9ERVNDUklQVElPTl9NQVAgPSB7XHJcbiAgQVRfTEVGVF9FREdFOiB7XHJcbiAgICBVUFBFUl9QTEFZX0FSRUE6IGxhbmRtYXJrTGVmdEVkZ2VTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiBsYW5kbWFya0xlZnRFZGdlU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsYW5kbWFya0xlZnRFZGdlU3RyaW5nXHJcbiAgfSxcclxuICBMRUZUX0FSTToge1xyXG4gICAgVVBQRVJfUExBWV9BUkVBOiBsZWZ0U2hvdWxkZXJPZlN3ZWF0ZXJTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiBsZWZ0QXJtT2ZTd2VhdGVyU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBib3R0b21MZWZ0RWRnZU9mU3dlYXRlclN0cmluZ1xyXG4gIH0sXHJcbiAgTEVGVF9TSURFX09GX1NXRUFURVI6IHtcclxuICAgIFVQUEVSX1BMQVlfQVJFQTogdXBwZXJMZWZ0U2lkZU9mU3dlYXRlclN0cmluZyxcclxuICAgIENFTlRFUl9QTEFZX0FSRUE6IGxlZnRTaWRlT2ZTd2VhdGVyU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsb3dlckxlZnRTaWRlT2ZTd2VhdGVyU3RyaW5nXHJcbiAgfSxcclxuICBSSUdIVF9TSURFX09GX1NXRUFURVI6IHtcclxuICAgIFVQUEVSX1BMQVlfQVJFQTogdXBwZXJSaWdodFNpZGVPZlN3ZWF0ZXJTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiByaWdodFNpZGVPZlN3ZWF0ZXJTdHJpbmcsXHJcbiAgICBMT1dFUl9QTEFZX0FSRUE6IGxvd2VyUmlnaHRTaWRlT2ZTd2VhdGVyXHJcbiAgfSxcclxuICBSSUdIVF9BUk06IHtcclxuICAgIFVQUEVSX1BMQVlfQVJFQTogcmlnaHRTaG91bGRlck9mU3dlYXRlclN0cmluZyxcclxuICAgIENFTlRFUl9QTEFZX0FSRUE6IHJpZ2h0QXJtT2ZTd2VhdGVyU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsb3dlclJpZ2h0QXJtT2ZTd2VhdGVyU3RyaW5nXHJcbiAgfSxcclxuICBBVF9WRVJZX0NMT1NFX1RPX1NXRUFURVI6IHtcclxuICAgIFVQUEVSX1BMQVlfQVJFQTogbGFuZG1hcmtOZWFyU3dlYXRlclN0cmluZyxcclxuICAgIENFTlRFUl9QTEFZX0FSRUE6IGxhbmRtYXJrTmVhclN3ZWF0ZXJTdHJpbmcsXHJcbiAgICBMT1dFUl9QTEFZX0FSRUE6IGxhbmRtYXJrTmVhclN3ZWF0ZXJTdHJpbmdcclxuICB9LFxyXG4gIEFUX05FQVJfU1dFQVRFUjoge1xyXG4gICAgVVBQRVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJTd2VhdGVyU3RyaW5nLFxyXG4gICAgQ0VOVEVSX1BMQVlfQVJFQTogbGFuZG1hcmtOZWFyU3dlYXRlclN0cmluZyxcclxuICAgIExPV0VSX1BMQVlfQVJFQTogbGFuZG1hcmtOZWFyU3dlYXRlclN0cmluZ1xyXG4gIH0sXHJcbiAgTEVGVF9QTEFZX0FSRUE6IHtcclxuICAgIFVQUEVSX1BMQVlfQVJFQTogdXBwZXJMZWZ0U2lkZU9mUGxheUFyZWFTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiBsZWZ0U2lkZU9mUGxheUFyZWFTdHJpbmcsXHJcbiAgICBMT1dFUl9QTEFZX0FSRUE6IGxvd2VyTGVmdFNpZGVPZlBsYXlBcmVhU3RyaW5nXHJcbiAgfSxcclxuICBBVF9DRU5URVJfUExBWV9BUkVBOiB7XHJcbiAgICBVUFBFUl9QTEFZX0FSRUE6IGxhbmRtYXJrQXRVcHBlckNlbnRlclBsYXlBcmVhU3RyaW5nLFxyXG4gICAgQ0VOVEVSX1BMQVlfQVJFQTogbGFuZG1hcmtBdENlbnRlclBsYXlBcmVhU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsYW5kbWFya0F0TG93ZXJDZW50ZXJQbGF5QXJlYVN0cmluZ1xyXG4gIH0sXHJcbiAgQ0VOVEVSX1BMQVlfQVJFQToge1xyXG4gICAgVVBQRVJfUExBWV9BUkVBOiB1cHBlckNlbnRlck9mUGxheUFyZWFTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiBjZW50ZXJPZlBsYXlBcmVhU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsb3dlckNlbnRlck9mUGxheUFyZWFTdHJpbmdcclxuICB9LFxyXG4gIFJJR0hUX1BMQVlfQVJFQToge1xyXG4gICAgVVBQRVJfUExBWV9BUkVBOiB1cHBlclJpZ2h0U2lkZU9mUGxheUFyZWFTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiByaWdodFNpZGVPZlBsYXlBcmVhU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsb3dlclJpZ2h0U2lkZU9mUGxheUFyZWFTdHJpbmdcclxuICB9LFxyXG4gIEFUX05FQVJfV0FMTDoge1xyXG4gICAgVVBQRVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJVcHBlcldhbGxTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJXYWxsU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJMb3dlcldhbGxTdHJpbmdcclxuICB9LFxyXG4gIEFUX1ZFUllfQ0xPU0VfVE9fV0FMTDoge1xyXG4gICAgVVBQRVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJVcHBlcldhbGxTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJXYWxsU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJMb3dlcldhbGxTdHJpbmdcclxuICB9LFxyXG4gIEFUX1dBTEw6IHtcclxuICAgIFVQUEVSX1BMQVlfQVJFQTogdXBwZXJXYWxsU3RyaW5nLFxyXG4gICAgQ0VOVEVSX1BMQVlfQVJFQTogd2FsbFN0cmluZyxcclxuICAgIExPV0VSX1BMQVlfQVJFQTogbG93ZXJXYWxsU3RyaW5nXHJcbiAgfSxcclxuICBXQUxMOiB7XHJcbiAgICBVUFBFUl9QTEFZX0FSRUE6IHVwcGVyV2FsbFN0cmluZyxcclxuICAgIENFTlRFUl9QTEFZX0FSRUE6IHdhbGxTdHJpbmcsXHJcbiAgICBMT1dFUl9QTEFZX0FSRUE6IGxvd2VyV2FsbFN0cmluZ1xyXG4gIH0sXHJcbiAgQVRfTkVBUl9SSUdIVF9FREdFOiB7XHJcbiAgICBVUFBFUl9QTEFZX0FSRUE6IGxhbmRtYXJrTmVhclVwcGVyUmlnaHRFZGdlU3RyaW5nLFxyXG4gICAgQ0VOVEVSX1BMQVlfQVJFQTogbGFuZG1hcmtOZWFyUmlnaHRFZGdlU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJMb3dlclJpZ2h0RWRnZVN0cmluZ1xyXG4gIH0sXHJcbiAgQVRfVkVSWV9DTE9TRV9UT19SSUdIVF9FREdFOiB7XHJcbiAgICBVUFBFUl9QTEFZX0FSRUE6IGxhbmRtYXJrTmVhclVwcGVyUmlnaHRFZGdlU3RyaW5nLFxyXG4gICAgQ0VOVEVSX1BMQVlfQVJFQTogbGFuZG1hcmtOZWFyUmlnaHRFZGdlU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsYW5kbWFya05lYXJMb3dlclJpZ2h0RWRnZVN0cmluZ1xyXG4gIH0sXHJcbiAgUklHSFRfRURHRToge1xyXG4gICAgVVBQRVJfUExBWV9BUkVBOiB1cHBlclJpZ2h0RWRnZU9mUGxheUFyZWFTdHJpbmcsXHJcbiAgICBDRU5URVJfUExBWV9BUkVBOiByaWdodEVkZ2VPZlBsYXlBcmVhU3RyaW5nLFxyXG4gICAgTE9XRVJfUExBWV9BUkVBOiBsb3dlclJpZ2h0RWRnZU9mUGxheUFyZWFTdHJpbmdcclxuICB9LFxyXG4gIEFUX1JJR0hUX0VER0U6IHtcclxuICAgIFVQUEVSX1BMQVlfQVJFQTogdXBwZXJSaWdodEVkZ2VPZlBsYXlBcmVhU3RyaW5nLFxyXG4gICAgQ0VOVEVSX1BMQVlfQVJFQTogcmlnaHRFZGdlT2ZQbGF5QXJlYVN0cmluZyxcclxuICAgIExPV0VSX1BMQVlfQVJFQTogbG93ZXJSaWdodEVkZ2VPZlBsYXlBcmVhU3RyaW5nXHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIGEgbWFwIGZyb20gcGh5c2ljYWwgdmFsdWUgdG8gYWNjZXNzaWJsZSBkZXNjcmlwdG9uLiBFYWNoIGRlc2NyaWJlZCByYW5nZSBoYXMgYSBsZW5ndGggb2ZcclxuICogdmFsdWVSYW5nZSAvIGRlc2NyaXB0aW9uQXJyYXkubGVuZ3RoXHJcbiAqXHJcbiAqIEBwYXJhbSB7W10uc3RyaW5nfSBkZXNjcmlwdGlvbkFycmF5XHJcbiAqIEBwYXJhbSB7UmFuZ2VXaXRoVmFsdWV9IHZhbHVlUmFuZ2VcclxuICogQHBhcmFtIHtPYmplY3RbXX0gW2VudHJpZXNdIC0gQWRkaXRpb25hbCBlbnRyaWVzIHRvIGFkZCB0byB0aGUgbWFwcGVkIHZhbHVlIHJhbmdlLCB3aWxsIGxvb2sgc29tZXRoaW5nIGxpa2VcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZGVzY3JpcHRpb246IHtzdHJpbmd9LCByYW5nZToge1JhbmdlfSB9XHJcbiAqXHJcbiAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAqL1xyXG5jb25zdCBnZW5lcmF0ZURlc2NyaXB0aW9uTWFwV2l0aEVudHJpZXMgPSAoIGRlc2NyaXB0aW9uQXJyYXksIHZhbHVlUmFuZ2UsIGVudHJpZXMgKSA9PiB7XHJcbiAgZW50cmllcyA9IGVudHJpZXMgfHwgW107XHJcbiAgY29uc3QgbWFwID0ge307XHJcblxyXG4gIGxldCBtaW5WYWx1ZSA9IHZhbHVlUmFuZ2UubWluO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGRlc2NyaXB0aW9uQXJyYXkubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgY29uc3QgbmV4dE1pbiA9IG1pblZhbHVlICsgdmFsdWVSYW5nZS5nZXRMZW5ndGgoKSAvIGRlc2NyaXB0aW9uQXJyYXkubGVuZ3RoO1xyXG5cclxuICAgIG1hcFsgaSBdID0ge307XHJcbiAgICBtYXBbIGkgXS5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uQXJyYXlbIGkgXTtcclxuICAgIG1hcFsgaSBdLnJhbmdlID0gbmV3IFJhbmdlKCBtaW5WYWx1ZSwgbmV4dE1pbiApO1xyXG5cclxuICAgIC8vIGNvcnJlY3QgZm9yIGFueSBwcmVjaXNpb24gaXNzdWVzXHJcbiAgICBpZiAoIGkgPT09IGRlc2NyaXB0aW9uQXJyYXkubGVuZ3RoIC0gMSApIHtcclxuICAgICAgbWFwWyBkZXNjcmlwdGlvbkFycmF5Lmxlbmd0aCAtIDEgXS5yYW5nZSA9IG5ldyBSYW5nZSggbWluVmFsdWUsIHZhbHVlUmFuZ2UubWF4ICk7XHJcbiAgICB9XHJcblxyXG4gICAgbWluVmFsdWUgPSBuZXh0TWluO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBlbnRyaWVzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBlbnRyaWVzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICBtYXBbIGRlc2NyaXB0aW9uQXJyYXkubGVuZ3RoICsgaiBdID0gZW50cmllc1sgaiBdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG1hcDtcclxufTtcclxuXHJcbmNvbnN0IHJlbGF0aXZlQ2hhcmdlU3RyaW5ncyA9IFsgYUZld1N0cmluZywgc2V2ZXJhbFN0cmluZywgbWFueVN0cmluZyBdO1xyXG5jb25zdCBSRUxBVElWRV9DSEFSR0VfREVTQ1JJUFRJT05fTUFQID0gZ2VuZXJhdGVEZXNjcmlwdGlvbk1hcFdpdGhFbnRyaWVzKCByZWxhdGl2ZUNoYXJnZVN0cmluZ3MsIG5ldyBSYW5nZSggMSwgQkFTRUNvbnN0YW50cy5NQVhfQkFMTE9PTl9DSEFSR0UgKSwgWyB7XHJcbiAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMCApLFxyXG4gIGRlc2NyaXB0aW9uOiBub1N0cmluZ1xyXG59IF0gKTtcclxuXHJcbi8vIG1hcHMgIGRpcmVjdGlvbiB0byBhIGRlc2NyaXB0aW9uIHN0cmluZ1xyXG5jb25zdCBESVJFQ1RJT05fTUFQID0ge1xyXG4gIFVQOiB1cFN0cmluZyxcclxuICBET1dOOiBkb3duU3RyaW5nLFxyXG4gIExFRlQ6IGxlZnRTdHJpbmcsXHJcbiAgUklHSFQ6IHJpZ2h0U3RyaW5nLFxyXG4gIFVQX1JJR0hUOiB1cEFuZFRvVGhlUmlnaHRTdHJpbmcsXHJcbiAgVVBfTEVGVDogdXBBbmRUb1RoZUxlZnRTdHJpbmcsXHJcbiAgRE9XTl9SSUdIVDogZG93bkFuZFRvVGhlUmlnaHRTdHJpbmcsXHJcbiAgRE9XTl9MRUZUOiBkb3duQW5kVG9UaGVMZWZ0U3RyaW5nXHJcbn07XHJcblxyXG5jb25zdCBCQVNFRGVzY3JpYmVyID0ge1xyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHBvc2l0aW9uIGRlc2NyaXB0aW9uIGZvciB0aGUgYmFsbG9vbi4gVGhpcyBpcyBub3QgYSBmdWxsIGRlc2NyaXB0aW9uLCBidXQgYSBzaG9ydFxyXG4gICAqIGRlc2NzcmlwdGlvbi4gUmVnaW9ucyBhcmUgZGVmaW5lZCBpbiBQbGF5QXJlYU1hcC4gIFRoaXMgd2lsbCBnZXQgY2FsbGVkIHZlcnkgb2Z0ZW4gYW5kIG5lZWRzIHRvIGJlIHF1aWNrLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvbiAtIHBvc2l0aW9uIG9mIHRoZSBiYWxsb29uLCByZWxhdGl2ZSB0byBpdHMgY2VudGVyXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRQb3NpdGlvbkRlc2NyaXB0aW9uKCBwb3NpdGlvbiwgd2FsbFZpc2libGUgKSB7XHJcblxyXG4gICAgY29uc3QgbGFuZG1hcmtzID0gUGxheUFyZWFNYXAuTEFORE1BUktfUkFOR0VTO1xyXG4gICAgY29uc3QgY29sdW1ucyA9IFBsYXlBcmVhTWFwLkNPTFVNTl9SQU5HRVM7XHJcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBQbGF5QXJlYU1hcC5YX1BPU0lUSU9OUztcclxuICAgIGNvbnN0IHJvd3MgPSBQbGF5QXJlYU1hcC5ST1dfUkFOR0VTO1xyXG5cclxuICAgIC8vIGxvb3AgdGhyb3VnaCBrZXlzIG1hbnVhbGx5IHRvIHByZXZlbnQgYSBtYW55IGNsb3N1cmVzIGZyb20gYmVpbmcgY3JlYXRlZCBkdXJpbmcgb2JqZWN0IGl0ZXJhdGlvbiBpbiAnZm9yIGluJ1xyXG4gICAgLy8gbG9vcHNcclxuICAgIGNvbnN0IGNvbHVtbnNLZXlzID0gT2JqZWN0LmtleXMoIGNvbHVtbnMgKTtcclxuICAgIGNvbnN0IHJvd0tleXMgPSBPYmplY3Qua2V5cyggcm93cyApO1xyXG4gICAgY29uc3QgbGFuZG1hcmtLZXlzID0gT2JqZWN0LmtleXMoIGxhbmRtYXJrcyApO1xyXG4gICAgY29uc3QgcG9zaXRpb25LZXlzID0gT2JqZWN0LmtleXMoIHBvc2l0aW9ucyApO1xyXG5cclxuICAgIGxldCBpO1xyXG4gICAgbGV0IGN1cnJlbnRQb3NpdGlvbjtcclxuICAgIGxldCBjdXJyZW50TGFuZG1hcms7XHJcbiAgICBsZXQgY3VycmVudENvbHVtbjtcclxuICAgIGxldCBjdXJyZW50Um93O1xyXG5cclxuICAgIC8vIGNyaXRpY2FsIHggcG9zaXRpb25zIHRha2UgcHJpb3JpdHksIHN0YXJ0IHRoZXJlXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IHBvc2l0aW9uS2V5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCBwb3NpdGlvbi54ID09PSBwb3NpdGlvbnNbIHBvc2l0aW9uS2V5c1sgaSBdIF0gKSB7XHJcbiAgICAgICAgY3VycmVudFBvc2l0aW9uID0gcG9zaXRpb25LZXlzWyBpIF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IGxhbmRtYXJrS2V5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCBsYW5kbWFya3NbIGxhbmRtYXJrS2V5c1sgaSBdIF0uY29udGFpbnMoIHBvc2l0aW9uLnggKSApIHtcclxuICAgICAgICBjdXJyZW50TGFuZG1hcmsgPSBsYW5kbWFya0tleXNbIGkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGxhbmRtYXJrIHRha2VzIHByaW9yaXR5IC0gb25seSBmaW5kIGNvbHVtbiBpZiB3ZSBjb3VsZG4ndCBmaW5kIGxhbmRtYXJrXHJcbiAgICBpZiAoICFjdXJyZW50TGFuZG1hcmsgKSB7XHJcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgY29sdW1uc0tleXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCBjb2x1bW5zWyBjb2x1bW5zS2V5c1sgaSBdIF0uY29udGFpbnMoIHBvc2l0aW9uLnggKSApIHtcclxuICAgICAgICAgIGN1cnJlbnRDb2x1bW4gPSBjb2x1bW5zS2V5c1sgaSBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yICggaSA9IDA7IGkgPCByb3dLZXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHJvd3NbIHJvd0tleXNbIGkgXSBdLmNvbnRhaW5zKCBwb3NpdGlvbi55ICkgKSB7XHJcbiAgICAgICAgY3VycmVudFJvdyA9IHJvd0tleXNbIGkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVzZSBwb3NpdGlvbiwgY29sdW1uLCBvciBsYW5kbWFyaywgd2hpY2hldmVyIHdhcyBmb3VuZCwgcHJpb3JpdGl6aW5nIHBvc2l0aW9uXHJcbiAgICBjdXJyZW50Q29sdW1uID0gY3VycmVudFBvc2l0aW9uIHx8IGN1cnJlbnRMYW5kbWFyayB8fCBjdXJyZW50Q29sdW1uO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY3VycmVudENvbHVtbiAmJiBjdXJyZW50Um93LCAnaXRlbSBzaG91bGQgYmUgaW4gYSByb3cgb3IgY29sdW1uIG9mIHRoZSBwbGF5IGFyZWEnICk7XHJcblxyXG4gICAgLy8gdGhlIHdhbGwgYW5kIHRoZSByaWdodCBlZGdlIG9mIHRoZSBwbGF5IGFyZWEgb3ZlcmxhcCwgc28gaWYgdGhlIHdhbGwgaXMgdmlzaWJsZSBjaG9zZSB0aGF0IGRlc2NyaXB0aW9uXHJcbiAgICBpZiAoIHdhbGxWaXNpYmxlICYmICggY3VycmVudENvbHVtbiA9PT0gJ1JJR0hUX0VER0UnIHx8IGN1cnJlbnRDb2x1bW4gPT09ICdBVF9SSUdIVF9FREdFJyApICkge1xyXG4gICAgICBjdXJyZW50Q29sdW1uID0gJ1dBTEwnO1xyXG4gICAgfVxyXG4gICAgaWYgKCAhd2FsbFZpc2libGUgJiYgQkFTRURlc2NyaWJlci5pbldhbGxDb2x1bW4oIGN1cnJlbnRDb2x1bW4gKSApIHtcclxuICAgICAgY3VycmVudENvbHVtbiA9ICdSSUdIVF9QTEFZX0FSRUEnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBQT1NJVElPTl9ERVNDUklQVElPTl9NQVBbIGN1cnJlbnRDb2x1bW4gXVsgY3VycmVudFJvdyBdO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGNvbHVtbiBpcyBpbiBvbmUgb2YgdGhlICd3YWxsJyBjb2x1bW5zLCBjb3VsZCAgYmUgYXQsIG5lYXIsIG9yIHZlcnkgY2xvc2UgdG8gd2FsbC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvbHVtbiAtIG9uZSBvZiBrZXlzIGluIFBPU0lUSU9OX0RFU0NSSVBUSU9OX01BUFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGluV2FsbENvbHVtbiggY29sdW1uICkge1xyXG4gICAgcmV0dXJuICggY29sdW1uID09PSAnQVRfV0FMTCcgfHwgY29sdW1uID09PSAnQVRfTkVBUl9XQUxMJyB8fCBjb2x1bW4gPT09ICdXQUxMJyB8fCBjb2x1bW4gPT09ICdBVF9WRVJZX0NMT1NFX1RPX1dBTEwnICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZnJhZ21lbnQgdGhhdCBkZXNjcmliZXMgdGhlIHJlbGF0aXZlIGNoYXJnZSBmb3IgYW4gb2JqZXQsIGxpa2UgJ2EgZmV3JyBvciAnc2V2ZXJhbCcsIHRvIGJlIHVzZWQgaW5cclxuICAgKiBzdHJpbmcgcGF0dGVybnNcclxuICAgKlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gY2hhcmdlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCBjaGFyZ2UgKSB7XHJcblxyXG4gICAgLy8gdGhlIGRlc2NyaXB0aW9uIGlzIG1hcHBlZCB0byB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgY2hhcmdlXHJcbiAgICBjb25zdCBhYnNDaGFyZ2UgPSBNYXRoLmFicyggY2hhcmdlICk7XHJcblxyXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKCBSRUxBVElWRV9DSEFSR0VfREVTQ1JJUFRJT05fTUFQICk7XHJcbiAgICBsZXQgZGVzY3JpcHRpb247XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdmFsdWUgPSBSRUxBVElWRV9DSEFSR0VfREVTQ1JJUFRJT05fTUFQWyBrZXlzWyBpIF0gXTtcclxuICAgICAgaWYgKCB2YWx1ZS5yYW5nZS5jb250YWlucyggYWJzQ2hhcmdlICkgKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSB2YWx1ZS5kZXNjcmlwdGlvbjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlc2NyaXB0aW9uLCAnbm8gcmVsYXRpdmUgZGVzY3JpcHRpb24gZm91bmQgZm9yIGNoYXJnZSB2YWx1ZSwgY2hlY2sgdmFsdWUgb3IgZW50cmllcyBpbiBkZXNjcmlwdGlvbiBtYXAnICk7XHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb247XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIGEgZ2l2ZW4gY2hhcmdlLCBnZXQgdGhlIGRlc2NyaWJlZCByYW5nZS4gVXNlZnVsIGZvciBjb21wYXJpbmcgcmFuZ2VzIGJlZm9yZSBhbmQgYWZ0ZXJcclxuICAgKiBhIGNoYXJnZSBwaWNrdXAuIERlc2NyaXB0aW9ucyBhcmUgZ2VuZXJhdGVkIHJlbGF0aXZlIHRvIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgY2hhcmdlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBjaGFyZ2VcclxuICAgKiBAcmV0dXJucyB7UmFuZ2V9XHJcbiAgICovXHJcbiAgZ2V0RGVzY3JpYmVkQ2hhcmdlUmFuZ2UoIGNoYXJnZSApIHtcclxuXHJcbiAgICBjb25zdCBkZXNjcmliZWRDaGFyZ2UgPSBNYXRoLmFicyggY2hhcmdlICk7XHJcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoIFJFTEFUSVZFX0NIQVJHRV9ERVNDUklQVElPTl9NQVAgKTtcclxuXHJcbiAgICBsZXQgcmFuZ2U7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB2YWx1ZSA9IFJFTEFUSVZFX0NIQVJHRV9ERVNDUklQVElPTl9NQVBbIGtleXNbIGkgXSBdO1xyXG4gICAgICBpZiAoIHZhbHVlLnJhbmdlLmNvbnRhaW5zKCBkZXNjcmliZWRDaGFyZ2UgKSApIHtcclxuICAgICAgICByYW5nZSA9IHZhbHVlLnJhbmdlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmFuZ2UsIGBubyBjaGFyZ2UgcmFuZ2UgZm91bmQgZm9yIGNoYXJnZSAke2NoYXJnZX1gICk7XHJcbiAgICByZXR1cm4gcmFuZ2U7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIGJvdGggYmFsbG9vbnMgdGhlIHNhbWUgZGVzY3JpYmVkIGNoYXJnZSByYW5nZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QmFsbG9vbk1vZGVsfSBiYWxsb29uQVxyXG4gICAqIEBwYXJhbSB7QmFsbG9vbk1vZGVsfSBiYWxsb29uQlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxyXG4gICAqL1xyXG4gIGdldEJhbGxvb25zVmlzaWJsZVdpdGhTYW1lQ2hhcmdlUmFuZ2UoIGJhbGxvb25BLCBiYWxsb29uQiApIHtcclxuICAgIGNvbnN0IHJhbmdlQSA9IEJBU0VEZXNjcmliZXIuZ2V0RGVzY3JpYmVkQ2hhcmdlUmFuZ2UoIGJhbGxvb25BLmNoYXJnZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICBjb25zdCByYW5nZUIgPSBCQVNFRGVzY3JpYmVyLmdldERlc2NyaWJlZENoYXJnZVJhbmdlKCBiYWxsb29uQi5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSApO1xyXG5cclxuICAgIGNvbnN0IHZpc2libGVBID0gYmFsbG9vbkEuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCB2aXNpYmxlQiA9IGJhbGxvb25CLmlzVmlzaWJsZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIHJldHVybiByYW5nZUEuZXF1YWxzKCByYW5nZUIgKSAmJiAoIHZpc2libGVBICYmIHZpc2libGVCICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGlyZWN0aW9uIGRlc2NyaXB0aW9uIGZyb20gb25lIG9mIEJhbGxvb25EaXJlY3Rpb25FbnVtLiBTb21ldGhpbmcgbGlrZSBkb3duJywgb3IgJ3VwIGFuZCB0byB0aGUgbGVmdCcuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAtIG9uZSBvZiBCYWxsb29uRGlyZWN0aW9uRW51bVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0RGlyZWN0aW9uRGVzY3JpcHRpb24oIGRpcmVjdGlvbiApIHtcclxuICAgIHJldHVybiBESVJFQ1RJT05fTUFQWyBkaXJlY3Rpb24gXTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBkZXNjcmlwdGlvbiBvZiB0aGUgbmV0IGNoYXJnZSBmb3IgZWFjaCBiYWxsb29uLCBpbmNsdWRpbmcgdGhlIGxhYmVsICdFYWNoIGJhbGxvb24nLiBXaWxsIHJldHVybiBzb21ldGhpbmdcclxuICAgKiBsaWtlXHJcbiAgICogXCJFYWNoIGJhbGxvb24gaGFzIG5lZ2F0aXZlIG5ldCBjaGFyZ2UuXCIgb3JcclxuICAgKiBcIkVhY2ggYmFsbG9vbiBoYXMgemVybyBuZXQgY2hhcmdlLlwiXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldE5ldENoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsKCBjaGFyZ2UgKSB7XHJcbiAgICBjb25zdCBjaGFyZ2VBbW91bnRTdHJpbmcgPSBjaGFyZ2UgPCAwID8gbmVnYXRpdmVTdHJpbmcgOiB6ZXJvU3RyaW5nO1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vbk5ldENoYXJnZVBhdHRlcm5TdHJpbmdXaXRoTGFiZWwsIHtcclxuICAgICAgY2hhcmdlQW1vdW50OiBjaGFyZ2VBbW91bnRTdHJpbmcsXHJcbiAgICAgIGJhbGxvb246IGVhY2hCYWxsb29uU3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gZm9yIHRoZSBjaGFyZ2VzIHNob3duIHdoZW4gdGhlIG9iamVjdCBpcyBuZXV0cmFsLiBXaGVuIG5ldXRyYWwsIHRoZSBvYmplY3Qgd2lsbCBlaXRoZXIgYmVcclxuICAgKiBzaG93aW5nIG5vIGNoYXJnZXMsIG9yIHNob3dpbmcgXCJ7e21hbnl9fSBwYWlycyBvZiBuZWdhdGl2ZSBhbmQgcG9zaXRpdmUgY2hhcmdlc1wiLiBXaWxsIHJldHVybiBzb21ldGhpbmcgbGlrZVxyXG4gICAqXHJcbiAgICogXCJubyBjaGFyZ2VzIHNob3duXCIgb3JcclxuICAgKiBcInNob3dpbmcgbWFueSBwYWlycyBvZiBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgY2hhcmdlc1wiXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcmdlc1Nob3duXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mQ2hhcmdlc1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0TmV1dHJhbENoYXJnZXNTaG93bkRlc2NyaXB0aW9uKCBjaGFyZ2VzU2hvd24sIG51bWJlck9mQ2hhcmdlcyApIHtcclxuICAgIGxldCBkZXNjcmlwdGlvbjtcclxuXHJcbiAgICBjb25zdCByZWxhdGl2ZUNoYXJnZSA9IEJBU0VEZXNjcmliZXIuZ2V0UmVsYXRpdmVDaGFyZ2VEZXNjcmlwdGlvbiggbnVtYmVyT2ZDaGFyZ2VzICk7XHJcbiAgICBpZiAoIGNoYXJnZXNTaG93biA9PT0gJ2FsbCcgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzdW1tYXJ5TmV1dHJhbENoYXJnZXNQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgYW1vdW50OiByZWxhdGl2ZUNoYXJnZVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBzaG93aW5nTm9DaGFyZ2VzU3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcbn07XHJcblxyXG5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LnJlZ2lzdGVyKCAnQkFTRURlc2NyaWJlcicsIEJBU0VEZXNjcmliZXIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJBU0VEZXNjcmliZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxXQUFXLE1BQU0sa0RBQWtEO0FBQzFFLE9BQU9DLDRCQUE0QixNQUFNLDBDQUEwQztBQUNuRixPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0MsV0FBVyxNQUFNLDRCQUE0Qjs7QUFFcEQ7QUFDQSxNQUFNQywyQkFBMkIsR0FBR0gsZUFBZSxDQUFDSSxxQkFBcUIsQ0FBQ0MsS0FBSztBQUMvRSxNQUFNQyxzQkFBc0IsR0FBR04sZUFBZSxDQUFDTyxnQkFBZ0IsQ0FBQ0YsS0FBSztBQUNyRSxNQUFNRyw2QkFBNkIsR0FBR1IsZUFBZSxDQUFDUyx1QkFBdUIsQ0FBQ0osS0FBSztBQUVuRixNQUFNSyw0QkFBNEIsR0FBR1YsZUFBZSxDQUFDVyxzQkFBc0IsQ0FBQ04sS0FBSztBQUNqRixNQUFNTyx1QkFBdUIsR0FBR1osZUFBZSxDQUFDYSxpQkFBaUIsQ0FBQ1IsS0FBSztBQUN2RSxNQUFNUyw0QkFBNEIsR0FBR2QsZUFBZSxDQUFDZSxzQkFBc0IsQ0FBQ1YsS0FBSztBQUVqRixNQUFNVyw2QkFBNkIsR0FBR2hCLGVBQWUsQ0FBQ2lCLHVCQUF1QixDQUFDWixLQUFLO0FBQ25GLE1BQU1hLHdCQUF3QixHQUFHbEIsZUFBZSxDQUFDbUIsa0JBQWtCLENBQUNkLEtBQUs7QUFDekUsTUFBTWUsdUJBQXVCLEdBQUdwQixlQUFlLENBQUNvQix1QkFBdUIsQ0FBQ2Ys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