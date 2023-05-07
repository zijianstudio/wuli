// Copyright 2014-2022, University of Colorado Boulder

/**
 * A factory object that creates the challenges for the Area Builder game.
 *
 * @author John Blanco
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { Color } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import PerimeterShape from '../../common/model/PerimeterShape.js';
import AreaBuilderGameChallenge from './AreaBuilderGameChallenge.js';
import AreaBuilderGameModel from './AreaBuilderGameModel.js';

// constants
const UNIT_SQUARE_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH; // In screen coords

function AreaBuilderChallengeFactory() {
  const random = dotRandom;

  // Basic shapes used in the 'creator kits'.
  const UNIT_SQUARE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).lineTo(0, UNIT_SQUARE_LENGTH).close().makeImmutable();
  const HORIZONTAL_DOUBLE_SQUARE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH * 2, 0).lineTo(UNIT_SQUARE_LENGTH * 2, UNIT_SQUARE_LENGTH).lineTo(0, UNIT_SQUARE_LENGTH).close().makeImmutable();
  const VERTICAL_DOUBLE_SQUARE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH * 2).lineTo(0, UNIT_SQUARE_LENGTH * 2).close().makeImmutable();
  const QUAD_SQUARE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH * 2, 0).lineTo(UNIT_SQUARE_LENGTH * 2, UNIT_SQUARE_LENGTH * 2).lineTo(0, UNIT_SQUARE_LENGTH * 2).close().makeImmutable();
  const RIGHT_BOTTOM_TRIANGLE_SHAPE = new Shape().moveTo(UNIT_SQUARE_LENGTH, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).lineTo(0, UNIT_SQUARE_LENGTH).lineTo(UNIT_SQUARE_LENGTH, 0).close().makeImmutable();
  const LEFT_BOTTOM_TRIANGLE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).lineTo(0, UNIT_SQUARE_LENGTH).lineTo(0, 0).close().makeImmutable();
  const RIGHT_TOP_TRIANGLE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, 0).lineTo(UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH).lineTo(0, 0).close().makeImmutable();
  const LEFT_TOP_TRIANGLE_SHAPE = new Shape().moveTo(0, 0).lineTo(UNIT_SQUARE_LENGTH, 0).lineTo(0, UNIT_SQUARE_LENGTH).lineTo(0, 0).close().makeImmutable();

  // Shape kit with a set of basic shapes and a default color.
  const BASIC_RECTANGLES_SHAPE_KIT = [{
    shape: UNIT_SQUARE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: HORIZONTAL_DOUBLE_SQUARE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: VERTICAL_DOUBLE_SQUARE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: QUAD_SQUARE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }];
  const RECTANGLES_AND_TRIANGLES_SHAPE_KIT = [{
    shape: HORIZONTAL_DOUBLE_SQUARE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: UNIT_SQUARE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: VERTICAL_DOUBLE_SQUARE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: LEFT_BOTTOM_TRIANGLE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: LEFT_TOP_TRIANGLE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: RIGHT_BOTTOM_TRIANGLE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }, {
    shape: RIGHT_TOP_TRIANGLE_SHAPE,
    color: AreaBuilderSharedConstants.GREENISH_COLOR
  }];

  // Color chooser for selecting randomized colors for 'find the area' challenges.
  const FIND_THE_AREA_COLOR_CHOOSER = {
    colorList: random.shuffle([new Color(AreaBuilderSharedConstants.PALE_BLUE_COLOR), new Color(AreaBuilderSharedConstants.PINKISH_COLOR), new Color(AreaBuilderSharedConstants.PURPLISH_COLOR), new Color(AreaBuilderSharedConstants.ORANGISH_COLOR), new Color(AreaBuilderSharedConstants.DARK_GREEN_COLOR)]),
    index: 0,
    nextColor: function () {
      if (this.index >= this.colorList.length) {
        // Time to shuffle the color list.  Make sure that when we do, the color that was at the end of the previous
        // list isn't at the beginning of this one, or we'll get two of the same colors in a row.
        const lastColor = this.colorList[this.colorList.length - 1];
        do {
          this.colorList = random.shuffle(this.colorList);
        } while (this.colorList[0] === lastColor);

        // Reset the index.
        this.index = 0;
      }
      return this.colorList[this.index++];
    }
  };

  // Color chooser for selecting randomized colors for 'build it' style challenges.
  const BUILD_IT_COLOR_CHOOSER = {
    colorList: random.shuffle([new Color(AreaBuilderSharedConstants.GREENISH_COLOR), new Color(AreaBuilderSharedConstants.PINKISH_COLOR), new Color(AreaBuilderSharedConstants.ORANGISH_COLOR), new Color(AreaBuilderSharedConstants.PALE_BLUE_COLOR)]),
    index: 0,
    nextColor: function () {
      if (this.index >= this.colorList.length) {
        // Time to shuffle the color list.  Make sure that when we do, the color that was at the end of the previous
        // list isn't at the beginning of this one, or we'll get two of the same colors in a row.
        const lastColor = this.colorList[this.colorList.length - 1];
        do {
          this.colorList = random.shuffle(this.colorList);
        } while (this.colorList[0] === lastColor);

        // Reset the index.
        this.index = 0;
      }
      return this.colorList[this.index++];
    }
  };

  // Color pair chooser, used for selecting randomized colors for two tone 'build it' challenges.
  const COLOR_PAIR_CHOOSER = {
    colorPairList: random.shuffle([{
      color1: AreaBuilderSharedConstants.GREENISH_COLOR,
      color2: AreaBuilderSharedConstants.DARK_GREEN_COLOR
    }, {
      color1: AreaBuilderSharedConstants.PURPLISH_COLOR,
      color2: AreaBuilderSharedConstants.DARK_PURPLE_COLOR
    }, {
      color1: AreaBuilderSharedConstants.PALE_BLUE_COLOR,
      color2: AreaBuilderSharedConstants.DARK_BLUE_COLOR
    }, {
      color1: AreaBuilderSharedConstants.PINKISH_COLOR,
      color2: AreaBuilderSharedConstants.PURPLE_PINK_COLOR
    }]),
    index: 0,
    nextColorPair: function () {
      if (this.index >= this.colorPairList.length) {
        // Time to shuffle the list.
        const lastColorPair = this.colorPairList[this.colorPairList.length - 1];
        do {
          this.colorPairList = random.shuffle(this.colorPairList);
        } while (this.colorPairList[0] === lastColorPair);

        // Reset the index.
        this.index = 0;
      }
      return this.colorPairList[this.index++];
    }
  };

  // -------------- private functions ---------------------------

  // Select a random element from an array
  function randomElement(array) {
    return array[Math.floor(random.nextDouble() * array.length)];
  }

  // Create a solution spec (a.k.a. an example solution) that represents a rectangle with the specified origin and size.
  function createMonochromeRectangularSolutionSpec(x, y, width, height, color) {
    const solutionSpec = [];
    for (let column = 0; column < width; column++) {
      for (let row = 0; row < height; row++) {
        solutionSpec.push({
          cellColumn: column + x,
          cellRow: row + y,
          color: color
        });
      }
    }
    return solutionSpec;
  }

  // Create a solution spec (a.k.a. an example solution) for a two-tone challenge
  function createTwoColorRectangularSolutionSpec(x, y, width, height, color1, color2, color1proportion) {
    const solutionSpec = [];
    for (let row = 0; row < height; row++) {
      for (let column = 0; column < width; column++) {
        solutionSpec.push({
          cellColumn: column + x,
          cellRow: row + y,
          color: (row * width + column) / (width * height) < color1proportion ? color1 : color2
        });
      }
    }
    return solutionSpec;
  }

  // Function for creating a 'shape kit' of the basic shapes of the specified color.
  function createBasicRectanglesShapeKit(color) {
    const kit = [];
    BASIC_RECTANGLES_SHAPE_KIT.forEach(kitElement => {
      kit.push({
        shape: kitElement.shape,
        color: color
      });
    });
    return kit;
  }
  function createTwoToneRectangleBuildKit(color1, color2) {
    const kit = [];
    BASIC_RECTANGLES_SHAPE_KIT.forEach(kitElement => {
      const color1Element = {
        shape: kitElement.shape,
        color: color1
      };
      kit.push(color1Element);
      const color2Element = {
        shape: kitElement.shape,
        color: color2
      };
      kit.push(color2Element);
    });
    return kit;
  }
  function flipPerimeterPointsHorizontally(perimeterPointList) {
    const reflectedPoints = [];
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    perimeterPointList.forEach(point => {
      minX = Math.min(point.x, minX);
      maxX = Math.max(point.x, maxX);
    });
    perimeterPointList.forEach(point => {
      reflectedPoints.push(new Vector2(-1 * (point.x - minX - maxX), point.y));
    });
    return reflectedPoints;
  }
  function flipPerimeterPointsVertically(perimeterPointList) {
    const reflectedPoints = [];
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    perimeterPointList.forEach(point => {
      minY = Math.min(point.y, minY);
      maxY = Math.max(point.y, maxY);
    });
    perimeterPointList.forEach(point => {
      reflectedPoints.push(new Vector2(point.x, -1 * (point.y - minY - maxY)));
    });
    return reflectedPoints;
  }
  function createRectangularPerimeterShape(x, y, width, height, fillColor) {
    return new PerimeterShape(
    // Exterior perimeters
    [[new Vector2(x, y), new Vector2(x + width, y), new Vector2(x + width, y + height), new Vector2(x, y + height)]],
    // Interior perimeters
    [],
    // Unit size
    UNIT_SQUARE_LENGTH,
    // color
    {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
    });
  }
  function createLShapedPerimeterShape(x, y, width, height, missingCorner, widthMissing, heightMissing, fillColor) {
    assert && assert(width > widthMissing && height > heightMissing, 'Invalid parameters');
    let perimeterPoints = [new Vector2(x + widthMissing, y), new Vector2(x + width, y), new Vector2(x + width, y + height), new Vector2(x, y + height), new Vector2(x, y + heightMissing), new Vector2(x + widthMissing, y + heightMissing)];
    if (missingCorner === 'rightTop' || missingCorner === 'rightBottom') {
      perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
    }
    if (missingCorner === 'leftBottom' || missingCorner === 'rightBottom') {
      perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
    }
    return new PerimeterShape([perimeterPoints], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
    });
  }

  // Create a perimeter shape with a cutout in the top, bottom, left, or right side.
  function createUShapedPerimeterShape(x, y, width, height, sideWithCutout, cutoutWidth, cutoutHeight, cutoutOffset, fillColor) {
    let perimeterPoints = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
    if (sideWithCutout === 'left' || sideWithCutout === 'right') {
      perimeterPoints[0].setXY(x, y);
      perimeterPoints[1].setXY(x + width, y);
      perimeterPoints[2].setXY(x + width, y + height);
      perimeterPoints[3].setXY(x, y + height);
      perimeterPoints[4].setXY(x, y + cutoutOffset + cutoutHeight);
      perimeterPoints[5].setXY(x + cutoutWidth, y + cutoutOffset + cutoutHeight);
      perimeterPoints[6].setXY(x + cutoutWidth, y + cutoutOffset);
      perimeterPoints[7].setXY(x, y + cutoutOffset);
      if (sideWithCutout === 'right') {
        perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
      }
    } else {
      perimeterPoints[0].setXY(x, y);
      perimeterPoints[1].setXY(x + cutoutOffset, y);
      perimeterPoints[2].setXY(x + cutoutOffset, y + cutoutHeight);
      perimeterPoints[3].setXY(x + cutoutOffset + cutoutWidth, y + cutoutHeight);
      perimeterPoints[4].setXY(x + cutoutOffset + cutoutWidth, y);
      perimeterPoints[5].setXY(x + width, y);
      perimeterPoints[6].setXY(x + width, y + height);
      perimeterPoints[7].setXY(x, y + height);
      if (sideWithCutout === 'bottom') {
        perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
      }
    }
    return new PerimeterShape([perimeterPoints], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
    });
  }
  function createPerimeterShapeWithHole(x, y, width, height, holeWidth, holeHeight, holeXOffset, holeYOffset, fillColor) {
    const exteriorPerimeterPoints = [new Vector2(x, y), new Vector2(x + width, y), new Vector2(x + width, y + height), new Vector2(x, y + height)];
    const interiorPerimeterPoints = [
    // Have to draw hole in opposite direction for it to appear.
    new Vector2(x + holeXOffset, y + holeYOffset), new Vector2(x + holeXOffset, y + holeYOffset + holeHeight), new Vector2(x + holeXOffset + holeWidth, y + holeYOffset + holeHeight), new Vector2(x + holeXOffset + holeWidth, y + holeYOffset)];
    return new PerimeterShape([exteriorPerimeterPoints], [interiorPerimeterPoints], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
    });
  }
  function createPerimeterShapeSlantedHypotenuseRightIsoscelesTriangle(x, y, edgeLength, cornerPosition, fillColor) {
    let perimeterPoints = [new Vector2(x, y), new Vector2(x + edgeLength, y), new Vector2(x, y + edgeLength)];
    if (cornerPosition === 'rightTop' || cornerPosition === 'rightBottom') {
      perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
    }
    if (cornerPosition === 'leftBottom' || cornerPosition === 'rightBottom') {
      perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
    }
    return new PerimeterShape([perimeterPoints], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
    });
  }
  function createPerimeterShapeLevelHypotenuseRightIsoscelesTriangle(x, y, hypotenuseLength, cornerPosition, fillColor) {
    let perimeterPoints;
    if (cornerPosition === 'centerTop' || cornerPosition === 'centerBottom') {
      perimeterPoints = [new Vector2(x, y), new Vector2(x + hypotenuseLength, y), new Vector2(x + hypotenuseLength / 2, y + hypotenuseLength / 2)];
      if (cornerPosition === 'centerBottom') {
        perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
      }
    } else {
      perimeterPoints = [new Vector2(x, y), new Vector2(x, y + hypotenuseLength), new Vector2(x + hypotenuseLength / 2, y + hypotenuseLength / 2)];
      if (cornerPosition === 'centerLeft') {
        perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
      }
    }

    // Reflect as appropriate to create the specified orientation.
    if (cornerPosition === 'centerTop' || cornerPosition === 'rightBottom') {
      perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
    }
    if (cornerPosition === 'leftBottom' || cornerPosition === 'rightBottom') {
      perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
    }
    return new PerimeterShape([perimeterPoints], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
    });
  }
  function createShapeWithDiagonalAndMissingCorner(x, y, width, height, diagonalPosition, diagonalSquareLength, cutWidth, cutHeight, fillColor) {
    assert && assert(width - diagonalSquareLength >= cutWidth && height - diagonalSquareLength >= cutHeight, 'Invalid parameters');
    let perimeterPoints = [];
    // Draw shape with diagonal in lower right corner, starting in upper right corner.
    perimeterPoints.push(new Vector2(x + width, y));
    perimeterPoints.push(new Vector2(x + width, y + height - diagonalSquareLength));
    perimeterPoints.push(new Vector2(x + width - diagonalSquareLength, y + height));
    perimeterPoints.push(new Vector2(x, y + height));
    perimeterPoints.push(new Vector2(x, y + cutHeight));
    perimeterPoints.push(new Vector2(x + cutWidth, y + cutHeight));
    perimeterPoints.push(new Vector2(x + cutWidth, y));

    // Reflect shape as needed to meet the specified orientation.
    if (diagonalPosition === 'leftTop' || diagonalPosition === 'leftBottom') {
      perimeterPoints = flipPerimeterPointsHorizontally(perimeterPoints);
    }
    if (diagonalPosition === 'rightTop' || diagonalPosition === 'leftTop') {
      perimeterPoints = flipPerimeterPointsVertically(perimeterPoints);
    }
    return new PerimeterShape([perimeterPoints], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR)
    });
  }

  // Return a value that indicates whether two challenges are similar, used when generating challenges that are
  // distinct enough to keep the game interesting.
  function isChallengeSimilar(challenge1, challenge2) {
    if (challenge1.buildSpec && challenge2.buildSpec) {
      if (challenge1.buildSpec.proportions && challenge2.buildSpec.proportions) {
        if (challenge1.buildSpec.proportions.color1Proportion.denominator === challenge2.buildSpec.proportions.color1Proportion.denominator) {
          if (challenge1.buildSpec.perimeter && challenge2.buildSpec.perimeter || !challenge1.buildSpec.perimeter && !challenge2.buildSpec.perimeter) {
            return true;
          }
        }
      } else if (!challenge1.buildSpec.proportions && !challenge1.buildSpec.proportions) {
        if (challenge1.buildSpec.area === challenge2.buildSpec.area) {
          return true;
        }
      }
    } else {
      if (challenge1.backgroundShape && challenge2.backgroundShape) {
        if (challenge1.backgroundShape.unitArea === challenge2.backgroundShape.unitArea) {
          return true;
        }
      }
    }

    // If we got to here, the challenges are not similar.
    return false;
  }

  // Test the challenge against the history of recently generated challenges to see if it is unique.
  function isChallengeUnique(challenge) {
    let challengeIsUnique = true;
    for (let i = 0; i < challengeHistory.length; i++) {
      if (isChallengeSimilar(challenge, challengeHistory[i])) {
        challengeIsUnique = false;
        break;
      }
    }
    return challengeIsUnique;
  }
  function generateBuildAreaChallenge() {
    // Create a unique challenge
    const width = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2);
    let height = 0;
    while (width * height < 8 || width * height > 36) {
      height = random.nextIntBetween(0, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
    }
    const color = BUILD_IT_COLOR_CHOOSER.nextColor();
    const exampleSolution = createMonochromeRectangularSolutionSpec(Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width) / 2), Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height) / 2), width, height, color);
    const challenge = AreaBuilderGameChallenge.createBuildAreaChallenge(width * height, createBasicRectanglesShapeKit(color), exampleSolution);
    return challenge;
  }

  /**
   * Generate a 'build it' area+perimeter challenge that consists of two connected rectangles.  See the design spec
   * for details.
   */
  function generateTwoRectangleBuildAreaAndPerimeterChallenge() {
    // Create first rectangle dimensions
    const width1 = random.nextIntBetween(2, 6);
    let height1;
    do {
      height1 = random.nextIntBetween(1, 4);
    } while (width1 % 2 === height1 % 2);

    // Create second rectangle dimensions
    let width2 = 0;
    do {
      width2 = random.nextIntBetween(1, 6);
    } while (width1 + width2 > AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2);
    let height2;
    do {
      height2 = random.nextIntBetween(1, 6);
    } while (width2 % 2 === height2 % 2 || height1 + height2 > AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);

    // Choose the amount of overlap
    const overlap = random.nextIntBetween(1, Math.min(width1, width2) - 1);
    const left = Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - (width1 + width2 - overlap)) / 2);
    const top = Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - (height1 + height2)) / 2);

    // Create a solution spec by merging specs for each of the rectangles together.
    const color = BUILD_IT_COLOR_CHOOSER.nextColor();
    const solutionSpec = createMonochromeRectangularSolutionSpec(left, top, width1, height1, color).concat(createMonochromeRectangularSolutionSpec(left + width1 - overlap, top + height1, width2, height2, color));
    return AreaBuilderGameChallenge.createBuildAreaAndPerimeterChallenge(width1 * height1 + width2 * height2, 2 * width1 + 2 * height1 + 2 * width2 + 2 * height2 - 2 * overlap, createBasicRectanglesShapeKit(color), solutionSpec);
  }
  function generateBuildAreaAndPerimeterChallenge() {
    let width;
    let height;

    // Width can be any value from 3 to 8 excluding 7, see design doc.
    do {
      width = random.nextIntBetween(3, 8);
    } while (width === 0 || width === 7);

    // Choose the height based on the total area.
    do {
      height = random.nextIntBetween(3, 8);
    } while (width * height < 12 || width * height > 36 || height === 7 || height > AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
    const color = BUILD_IT_COLOR_CHOOSER.nextColor();
    const exampleSolution = createMonochromeRectangularSolutionSpec(Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width) / 2), Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height) / 2), width, height, color);
    return AreaBuilderGameChallenge.createBuildAreaAndPerimeterChallenge(width * height, 2 * width + 2 * height, createBasicRectanglesShapeKit(color), exampleSolution);
  }
  function generateRectangularFindAreaChallenge() {
    let width;
    let height;
    do {
      width = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
      height = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4);
    } while (width * height < 16 || width * height > 36);
    const perimeterShape = createRectangularPerimeterShape(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
  }
  function generateLShapedFindAreaChallenge() {
    let width;
    let height;
    do {
      width = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
      height = random.nextIntBetween(2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4);
    } while (width * height < 16 || width * height > 36);
    const missingWidth = random.nextIntBetween(1, width - 1);
    const missingHeight = random.nextIntBetween(1, height - 1);
    const missingCorner = randomElement(['leftTop', 'rightTop', 'leftBottom', 'rightBottom']);
    const perimeterShape = createLShapedPerimeterShape(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, missingCorner, missingWidth * UNIT_SQUARE_LENGTH, missingHeight * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
  }
  function generateUShapedFindAreaChallenge() {
    let width;
    let height;
    do {
      width = random.nextIntBetween(4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
      height = random.nextIntBetween(4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
    } while (width * height < 16 || width * height > 36);
    const sideWithCutout = randomElement(['left', 'right', 'top', 'bottom']);
    let cutoutWidth;
    let cutoutHeight;
    let cutoutOffset;
    if (sideWithCutout === 'left' || sideWithCutout === 'right') {
      cutoutWidth = random.nextIntBetween(2, width - 1);
      cutoutHeight = random.nextIntBetween(1, height - 2);
      cutoutOffset = random.nextIntBetween(1, height - cutoutHeight - 1);
    } else {
      cutoutWidth = random.nextIntBetween(1, width - 2);
      cutoutHeight = random.nextIntBetween(2, height - 1);
      cutoutOffset = random.nextIntBetween(1, width - cutoutWidth - 1);
    }
    const perimeterShape = createUShapedPerimeterShape(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, sideWithCutout, cutoutWidth * UNIT_SQUARE_LENGTH, cutoutHeight * UNIT_SQUARE_LENGTH, cutoutOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
  }
  function generateOShapedFindAreaChallenge() {
    let width;
    let height;
    do {
      width = random.nextIntBetween(3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
      height = random.nextIntBetween(3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
    } while (width * height < 16 || width * height > 36);
    const holeWidth = random.nextIntBetween(1, width - 2);
    const holeHeight = random.nextIntBetween(1, height - 2);
    const holeXOffset = random.nextIntBetween(1, width - holeWidth - 1);
    const holeYOffset = random.nextIntBetween(1, height - holeHeight - 1);
    const perimeterShape = createPerimeterShapeWithHole(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, holeWidth * UNIT_SQUARE_LENGTH, holeHeight * UNIT_SQUARE_LENGTH, holeXOffset * UNIT_SQUARE_LENGTH, holeYOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
  }
  function generateIsoscelesRightTriangleSlantedHypotenuseFindAreaChallenge() {
    const cornerPosition = randomElement(['leftTop', 'rightTop', 'rightBottom', 'leftBottom']);
    let edgeLength = 0;
    do {
      edgeLength = random.nextIntBetween(4, Math.min(AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2));
    } while (edgeLength % 2 !== 0);
    const perimeterShape = createPerimeterShapeSlantedHypotenuseRightIsoscelesTriangle(0, 0, edgeLength * UNIT_SQUARE_LENGTH, cornerPosition, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT);
  }
  function generateIsoscelesRightTriangleLevelHypotenuseFindAreaChallenge() {
    const cornerPosition = randomElement(['centerTop', 'rightCenter', 'centerBottom', 'leftCenter']);
    let hypotenuseLength = 0;
    let maxHypotenuse;
    if (cornerPosition === 'centerTop' || cornerPosition === 'centerBottom') {
      maxHypotenuse = AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4;
    } else {
      maxHypotenuse = AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2;
    }
    do {
      hypotenuseLength = random.nextIntBetween(2, maxHypotenuse);
    } while (hypotenuseLength % 2 !== 0);
    const perimeterShape = createPerimeterShapeLevelHypotenuseRightIsoscelesTriangle(0, 0, hypotenuseLength * UNIT_SQUARE_LENGTH, cornerPosition, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT);
  }
  function generateLargeRectWithChipMissingChallenge() {
    const width = random.nextIntBetween(AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2);
    const height = random.nextIntBetween(AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
    const sideWithCutout = randomElement(['left', 'right', 'top', 'bottom']);
    let cutoutWidth;
    let cutoutHeight;
    let cutoutOffset;
    if (sideWithCutout === 'left' || sideWithCutout === 'right') {
      cutoutWidth = 1;
      cutoutHeight = random.nextIntBetween(1, 3);
      cutoutOffset = random.nextIntBetween(1, height - cutoutHeight - 1);
    } else {
      cutoutWidth = random.nextIntBetween(1, 3);
      cutoutHeight = 1;
      cutoutOffset = random.nextIntBetween(1, width - cutoutWidth - 1);
    }
    const perimeterShape = createUShapedPerimeterShape(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, sideWithCutout, cutoutWidth * UNIT_SQUARE_LENGTH, cutoutHeight * UNIT_SQUARE_LENGTH, cutoutOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
  }
  function generateLargeRectWithSmallHoleMissingChallenge() {
    const width = random.nextIntBetween(AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2);
    const height = random.nextIntBetween(AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2);
    let holeWidth;
    let holeHeight;
    if (random.nextDouble() < 0.5) {
      holeWidth = random.nextIntBetween(1, 3);
      holeHeight = 1;
    } else {
      holeHeight = random.nextIntBetween(1, 3);
      holeWidth = 1;
    }
    const holeXOffset = random.nextIntBetween(1, width - holeWidth - 1);
    const holeYOffset = random.nextIntBetween(1, height - holeHeight - 1);
    const perimeterShape = createPerimeterShapeWithHole(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, holeWidth * UNIT_SQUARE_LENGTH, holeHeight * UNIT_SQUARE_LENGTH, holeXOffset * UNIT_SQUARE_LENGTH, holeYOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, BASIC_RECTANGLES_SHAPE_KIT);
  }
  function generateLargeRectWithPieceMissingChallenge() {
    return random.nextDouble() < 0.7 ? generateLargeRectWithChipMissingChallenge() : generateLargeRectWithSmallHoleMissingChallenge();
  }
  function generateShapeWithDiagonalFindAreaChallenge() {
    const width = random.nextIntBetween(3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4);
    const height = random.nextIntBetween(3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4);
    const diagonalPosition = randomElement(['leftTop', 'rightTop', 'leftBottom', 'rightBottom']);
    let diagonalSquareLength = 2;
    if (height > 4 && width > 4 && random.nextDouble() > 0.5) {
      diagonalSquareLength = 4;
    }
    const cutWidth = random.nextIntBetween(1, width - diagonalSquareLength);
    const cutHeight = random.nextIntBetween(1, height - diagonalSquareLength);
    const perimeterShape = createShapeWithDiagonalAndMissingCorner(0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH, diagonalPosition, diagonalSquareLength * UNIT_SQUARE_LENGTH, cutWidth * UNIT_SQUARE_LENGTH, cutHeight * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor());
    return AreaBuilderGameChallenge.createFindAreaChallenge(perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT);
  }
  function generateEasyProportionalBuildAreaChallenge() {
    return generateProportionalBuildAreaChallenge('easy', false);
  }
  function generateHarderProportionalBuildAreaChallenge() {
    return generateProportionalBuildAreaChallenge('harder', false);
  }
  function generateProportionalBuildAreaChallenge(difficulty, includePerimeter) {
    assert && assert(difficulty === 'easy' || difficulty === 'harder');
    let width;
    let height;

    // Randomly generate width, height, and the possible factors from which a proportional challenge can be created.
    const factors = [];
    do {
      height = random.nextIntBetween(3, 6);
      if (height === 3) {
        width = random.nextIntBetween(4, 8);
      } else {
        width = random.nextIntBetween(2, 10);
      }
      const minFactor = difficulty === 'easy' ? 2 : 5;
      const maxFactor = difficulty === 'easy' ? 4 : 9;
      const area = width * height;
      for (let i = minFactor; i <= maxFactor; i++) {
        if (area % i === 0) {
          // This is a factor of the area.
          factors.push(i);
        }
      }
    } while (factors.length === 0);

    // Choose the fractional proportion.
    const fractionDenominator = randomElement(factors);
    let color1FractionNumerator;
    do {
      color1FractionNumerator = random.nextIntBetween(1, fractionDenominator - 1);
    } while (Utils.gcd(color1FractionNumerator, fractionDenominator) > 1);
    const color1Fraction = new Fraction(color1FractionNumerator, fractionDenominator);

    // Choose the colors for this challenge
    const colorPair = COLOR_PAIR_CHOOSER.nextColorPair();

    // Create the example solution
    const exampleSolution = createTwoColorRectangularSolutionSpec(Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width) / 2), Math.floor((AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height) / 2), width, height, colorPair.color1, colorPair.color2, color1Fraction.getValue());
    const userShapes = createTwoToneRectangleBuildKit(colorPair.color1, colorPair.color2);

    // Build the challenge from all the pieces.
    if (includePerimeter) {
      return AreaBuilderGameChallenge.createTwoToneBuildAreaAndPerimeterChallenge(width * height, 2 * width + 2 * height, colorPair.color1, colorPair.color2, color1Fraction, userShapes, exampleSolution);
    } else {
      return AreaBuilderGameChallenge.createTwoToneBuildAreaChallenge(width * height, colorPair.color1, colorPair.color2, color1Fraction, userShapes, exampleSolution);
    }
  }
  function generateEasyProportionalBuildAreaAndPerimeterChallenge() {
    return generateProportionalBuildAreaChallenge('easy', true);
  }
  function generateHarderProportionalBuildAreaAndPerimeterChallenge() {
    return generateProportionalBuildAreaChallenge('harder', true);
  }

  // Challenge history, used to make sure unique challenges are generated.
  let challengeHistory = [];

  // Use the provided generation function to create challenges until a unique one has been created.
  function generateUniqueChallenge(generationFunction) {
    let challenge;
    let uniqueChallengeGenerated = false;
    let attempts = 0;
    while (!uniqueChallengeGenerated) {
      challenge = generationFunction();
      attempts++;
      uniqueChallengeGenerated = isChallengeUnique(challenge);
      if (attempts > 12 && !uniqueChallengeGenerated) {
        // Remove the oldest half of challenges.
        challengeHistory = challengeHistory.slice(0, challengeHistory.length / 2);
        attempts = 0;
      }
    }
    challengeHistory.push(challenge);
    return challenge;
  }

  // Level 4 is required to limit the number of shapes available, to only allow unit squares, and to have not grid
  // control.  This function modifies the challenges to conform to this.
  function makeLevel4SpecificModifications(challenge) {
    challenge.toolSpec.gridControl = false;
    challenge.userShapes = [{
      shape: UNIT_SQUARE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    }];

    // Limit the number of shapes to the length of the larger side.  This encourages certain strategies.
    assert && assert(challenge.backgroundShape.exteriorPerimeters.length === 1, 'Unexpected configuration for background shape.');
    const perimeterShape = new PerimeterShape(challenge.backgroundShape.exteriorPerimeters, [], UNIT_SQUARE_LENGTH);
    challenge.userShapes[0].creationLimit = Math.max(perimeterShape.getWidth() / UNIT_SQUARE_LENGTH, perimeterShape.getHeight() / UNIT_SQUARE_LENGTH);
    return challenge;
  }

  /**
   * Generate a set of challenges for the given game level.
   *
   * @public
   * @param level
   * @param numChallenges
   * @returns {Array}
   */
  this.generateChallengeSet = (level, numChallenges) => {
    let challengeSet = [];
    let tempChallenge;
    let triangleChallenges;
    switch (level) {
      case 0:
        _.times(3, () => {
          challengeSet.push(generateUniqueChallenge(generateBuildAreaChallenge));
        });
        _.times(2, () => {
          challengeSet.push(generateUniqueChallenge(generateRectangularFindAreaChallenge));
        });
        challengeSet.push(generateUniqueChallenge(generateLShapedFindAreaChallenge));
        break;
      case 1:
        _.times(3, () => {
          challengeSet.push(generateUniqueChallenge(generateBuildAreaAndPerimeterChallenge));
        });
        _.times(3, () => {
          challengeSet.push(generateUniqueChallenge(generateTwoRectangleBuildAreaAndPerimeterChallenge));
        });
        break;
      case 2:
        challengeSet.push(generateUniqueChallenge(generateUShapedFindAreaChallenge));
        challengeSet.push(generateUniqueChallenge(generateOShapedFindAreaChallenge));
        challengeSet.push(generateUniqueChallenge(generateShapeWithDiagonalFindAreaChallenge));
        challengeSet = random.shuffle(challengeSet);
        triangleChallenges = random.shuffle([generateUniqueChallenge(generateIsoscelesRightTriangleLevelHypotenuseFindAreaChallenge), generateUniqueChallenge(generateIsoscelesRightTriangleSlantedHypotenuseFindAreaChallenge)]);
        triangleChallenges.forEach(challenge => {
          challengeSet.push(challenge);
        });
        challengeSet.push(generateUniqueChallenge(generateLargeRectWithPieceMissingChallenge));
        break;
      case 3:
        // For this level, the grid is disabled for all challenges and some different build kits are used.
        challengeSet.push(makeLevel4SpecificModifications(generateUniqueChallenge(generateUShapedFindAreaChallenge)));
        challengeSet.push(makeLevel4SpecificModifications(generateUniqueChallenge(generateOShapedFindAreaChallenge)));
        challengeSet.push(makeLevel4SpecificModifications(generateUniqueChallenge(generateOShapedFindAreaChallenge)));
        challengeSet.push(makeLevel4SpecificModifications(generateUniqueChallenge(generateShapeWithDiagonalFindAreaChallenge)));
        challengeSet = random.shuffle(challengeSet);
        // For the next challenge, choose randomly from the shapes that don't have diagonals.
        tempChallenge = generateUniqueChallenge(randomElement([generateLShapedFindAreaChallenge, generateUShapedFindAreaChallenge]));
        tempChallenge.toolSpec.gridControl = false;
        tempChallenge.userShapes = null;
        challengeSet.push(tempChallenge);
        tempChallenge = generateUniqueChallenge(generateShapeWithDiagonalFindAreaChallenge);
        tempChallenge.toolSpec.gridControl = false;
        tempChallenge.userShapes = null;
        challengeSet.push(tempChallenge);
        break;
      case 4:
        _.times(3, () => {
          challengeSet.push(generateUniqueChallenge(generateEasyProportionalBuildAreaChallenge));
        });
        _.times(3, () => {
          challengeSet.push(generateUniqueChallenge(generateHarderProportionalBuildAreaChallenge));
        });
        break;
      case 5:
        _.times(3, () => {
          challengeSet.push(generateUniqueChallenge(generateEasyProportionalBuildAreaAndPerimeterChallenge));
        });
        _.times(3, () => {
          challengeSet.push(generateUniqueChallenge(generateHarderProportionalBuildAreaAndPerimeterChallenge));
        });
        break;
      default:
        throw new Error(`Unsupported game level: ${level}`);
    }
    assert && assert(challengeSet.length === numChallenges, 'Error: Didn\'t generate correct number of challenges.');
    return challengeSet;
  };
}
areaBuilder.register('AreaBuilderChallengeFactory', AreaBuilderChallengeFactory);
export default AreaBuilderChallengeFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIkZyYWN0aW9uIiwiQ29sb3IiLCJhcmVhQnVpbGRlciIsIkFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIiwiUGVyaW1ldGVyU2hhcGUiLCJBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UiLCJBcmVhQnVpbGRlckdhbWVNb2RlbCIsIlVOSVRfU1FVQVJFX0xFTkdUSCIsIkFyZWFCdWlsZGVyQ2hhbGxlbmdlRmFjdG9yeSIsInJhbmRvbSIsIlVOSVRfU1FVQVJFX1NIQVBFIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJtYWtlSW1tdXRhYmxlIiwiSE9SSVpPTlRBTF9ET1VCTEVfU1FVQVJFX1NIQVBFIiwiVkVSVElDQUxfRE9VQkxFX1NRVUFSRV9TSEFQRSIsIlFVQURfU1FVQVJFX1NIQVBFIiwiUklHSFRfQk9UVE9NX1RSSUFOR0xFX1NIQVBFIiwiTEVGVF9CT1RUT01fVFJJQU5HTEVfU0hBUEUiLCJSSUdIVF9UT1BfVFJJQU5HTEVfU0hBUEUiLCJMRUZUX1RPUF9UUklBTkdMRV9TSEFQRSIsIkJBU0lDX1JFQ1RBTkdMRVNfU0hBUEVfS0lUIiwic2hhcGUiLCJjb2xvciIsIkdSRUVOSVNIX0NPTE9SIiwiUkVDVEFOR0xFU19BTkRfVFJJQU5HTEVTX1NIQVBFX0tJVCIsIkZJTkRfVEhFX0FSRUFfQ09MT1JfQ0hPT1NFUiIsImNvbG9yTGlzdCIsInNodWZmbGUiLCJQQUxFX0JMVUVfQ09MT1IiLCJQSU5LSVNIX0NPTE9SIiwiUFVSUExJU0hfQ09MT1IiLCJPUkFOR0lTSF9DT0xPUiIsIkRBUktfR1JFRU5fQ09MT1IiLCJpbmRleCIsIm5leHRDb2xvciIsImxlbmd0aCIsImxhc3RDb2xvciIsIkJVSUxEX0lUX0NPTE9SX0NIT09TRVIiLCJDT0xPUl9QQUlSX0NIT09TRVIiLCJjb2xvclBhaXJMaXN0IiwiY29sb3IxIiwiY29sb3IyIiwiREFSS19QVVJQTEVfQ09MT1IiLCJEQVJLX0JMVUVfQ09MT1IiLCJQVVJQTEVfUElOS19DT0xPUiIsIm5leHRDb2xvclBhaXIiLCJsYXN0Q29sb3JQYWlyIiwicmFuZG9tRWxlbWVudCIsImFycmF5IiwiTWF0aCIsImZsb29yIiwibmV4dERvdWJsZSIsImNyZWF0ZU1vbm9jaHJvbWVSZWN0YW5ndWxhclNvbHV0aW9uU3BlYyIsIngiLCJ5Iiwid2lkdGgiLCJoZWlnaHQiLCJzb2x1dGlvblNwZWMiLCJjb2x1bW4iLCJyb3ciLCJwdXNoIiwiY2VsbENvbHVtbiIsImNlbGxSb3ciLCJjcmVhdGVUd29Db2xvclJlY3Rhbmd1bGFyU29sdXRpb25TcGVjIiwiY29sb3IxcHJvcG9ydGlvbiIsImNyZWF0ZUJhc2ljUmVjdGFuZ2xlc1NoYXBlS2l0Iiwia2l0IiwiZm9yRWFjaCIsImtpdEVsZW1lbnQiLCJjcmVhdGVUd29Ub25lUmVjdGFuZ2xlQnVpbGRLaXQiLCJjb2xvcjFFbGVtZW50IiwiY29sb3IyRWxlbWVudCIsImZsaXBQZXJpbWV0ZXJQb2ludHNIb3Jpem9udGFsbHkiLCJwZXJpbWV0ZXJQb2ludExpc3QiLCJyZWZsZWN0ZWRQb2ludHMiLCJtaW5YIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJtYXhYIiwiTkVHQVRJVkVfSU5GSU5JVFkiLCJwb2ludCIsIm1pbiIsIm1heCIsImZsaXBQZXJpbWV0ZXJQb2ludHNWZXJ0aWNhbGx5IiwibWluWSIsIm1heFkiLCJjcmVhdGVSZWN0YW5ndWxhclBlcmltZXRlclNoYXBlIiwiZmlsbENvbG9yIiwiZWRnZUNvbG9yIiwiY29sb3JVdGlsc0RhcmtlciIsIlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIiwiY3JlYXRlTFNoYXBlZFBlcmltZXRlclNoYXBlIiwibWlzc2luZ0Nvcm5lciIsIndpZHRoTWlzc2luZyIsImhlaWdodE1pc3NpbmciLCJhc3NlcnQiLCJwZXJpbWV0ZXJQb2ludHMiLCJjcmVhdGVVU2hhcGVkUGVyaW1ldGVyU2hhcGUiLCJzaWRlV2l0aEN1dG91dCIsImN1dG91dFdpZHRoIiwiY3V0b3V0SGVpZ2h0IiwiY3V0b3V0T2Zmc2V0Iiwic2V0WFkiLCJjcmVhdGVQZXJpbWV0ZXJTaGFwZVdpdGhIb2xlIiwiaG9sZVdpZHRoIiwiaG9sZUhlaWdodCIsImhvbGVYT2Zmc2V0IiwiaG9sZVlPZmZzZXQiLCJleHRlcmlvclBlcmltZXRlclBvaW50cyIsImludGVyaW9yUGVyaW1ldGVyUG9pbnRzIiwiY3JlYXRlUGVyaW1ldGVyU2hhcGVTbGFudGVkSHlwb3RlbnVzZVJpZ2h0SXNvc2NlbGVzVHJpYW5nbGUiLCJlZGdlTGVuZ3RoIiwiY29ybmVyUG9zaXRpb24iLCJjcmVhdGVQZXJpbWV0ZXJTaGFwZUxldmVsSHlwb3RlbnVzZVJpZ2h0SXNvc2NlbGVzVHJpYW5nbGUiLCJoeXBvdGVudXNlTGVuZ3RoIiwiY3JlYXRlU2hhcGVXaXRoRGlhZ29uYWxBbmRNaXNzaW5nQ29ybmVyIiwiZGlhZ29uYWxQb3NpdGlvbiIsImRpYWdvbmFsU3F1YXJlTGVuZ3RoIiwiY3V0V2lkdGgiLCJjdXRIZWlnaHQiLCJpc0NoYWxsZW5nZVNpbWlsYXIiLCJjaGFsbGVuZ2UxIiwiY2hhbGxlbmdlMiIsImJ1aWxkU3BlYyIsInByb3BvcnRpb25zIiwiY29sb3IxUHJvcG9ydGlvbiIsImRlbm9taW5hdG9yIiwicGVyaW1ldGVyIiwiYXJlYSIsImJhY2tncm91bmRTaGFwZSIsInVuaXRBcmVhIiwiaXNDaGFsbGVuZ2VVbmlxdWUiLCJjaGFsbGVuZ2UiLCJjaGFsbGVuZ2VJc1VuaXF1ZSIsImkiLCJjaGFsbGVuZ2VIaXN0b3J5IiwiZ2VuZXJhdGVCdWlsZEFyZWFDaGFsbGVuZ2UiLCJuZXh0SW50QmV0d2VlbiIsIlNIQVBFX0JPQVJEX1VOSVRfV0lEVEgiLCJTSEFQRV9CT0FSRF9VTklUX0hFSUdIVCIsImV4YW1wbGVTb2x1dGlvbiIsImNyZWF0ZUJ1aWxkQXJlYUNoYWxsZW5nZSIsImdlbmVyYXRlVHdvUmVjdGFuZ2xlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlIiwid2lkdGgxIiwiaGVpZ2h0MSIsIndpZHRoMiIsImhlaWdodDIiLCJvdmVybGFwIiwibGVmdCIsInRvcCIsImNvbmNhdCIsImNyZWF0ZUJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSIsImdlbmVyYXRlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlIiwiZ2VuZXJhdGVSZWN0YW5ndWxhckZpbmRBcmVhQ2hhbGxlbmdlIiwicGVyaW1ldGVyU2hhcGUiLCJjcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSIsImdlbmVyYXRlTFNoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlIiwibWlzc2luZ1dpZHRoIiwibWlzc2luZ0hlaWdodCIsImdlbmVyYXRlVVNoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlIiwiZ2VuZXJhdGVPU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UiLCJnZW5lcmF0ZUlzb3NjZWxlc1JpZ2h0VHJpYW5nbGVTbGFudGVkSHlwb3RlbnVzZUZpbmRBcmVhQ2hhbGxlbmdlIiwiZ2VuZXJhdGVJc29zY2VsZXNSaWdodFRyaWFuZ2xlTGV2ZWxIeXBvdGVudXNlRmluZEFyZWFDaGFsbGVuZ2UiLCJtYXhIeXBvdGVudXNlIiwiZ2VuZXJhdGVMYXJnZVJlY3RXaXRoQ2hpcE1pc3NpbmdDaGFsbGVuZ2UiLCJnZW5lcmF0ZUxhcmdlUmVjdFdpdGhTbWFsbEhvbGVNaXNzaW5nQ2hhbGxlbmdlIiwiZ2VuZXJhdGVMYXJnZVJlY3RXaXRoUGllY2VNaXNzaW5nQ2hhbGxlbmdlIiwiZ2VuZXJhdGVTaGFwZVdpdGhEaWFnb25hbEZpbmRBcmVhQ2hhbGxlbmdlIiwiZ2VuZXJhdGVFYXN5UHJvcG9ydGlvbmFsQnVpbGRBcmVhQ2hhbGxlbmdlIiwiZ2VuZXJhdGVQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UiLCJnZW5lcmF0ZUhhcmRlclByb3BvcnRpb25hbEJ1aWxkQXJlYUNoYWxsZW5nZSIsImRpZmZpY3VsdHkiLCJpbmNsdWRlUGVyaW1ldGVyIiwiZmFjdG9ycyIsIm1pbkZhY3RvciIsIm1heEZhY3RvciIsImZyYWN0aW9uRGVub21pbmF0b3IiLCJjb2xvcjFGcmFjdGlvbk51bWVyYXRvciIsImdjZCIsImNvbG9yMUZyYWN0aW9uIiwiY29sb3JQYWlyIiwiZ2V0VmFsdWUiLCJ1c2VyU2hhcGVzIiwiY3JlYXRlVHdvVG9uZUJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSIsImNyZWF0ZVR3b1RvbmVCdWlsZEFyZWFDaGFsbGVuZ2UiLCJnZW5lcmF0ZUVhc3lQcm9wb3J0aW9uYWxCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UiLCJnZW5lcmF0ZUhhcmRlclByb3BvcnRpb25hbEJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSIsImdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlIiwiZ2VuZXJhdGlvbkZ1bmN0aW9uIiwidW5pcXVlQ2hhbGxlbmdlR2VuZXJhdGVkIiwiYXR0ZW1wdHMiLCJzbGljZSIsIm1ha2VMZXZlbDRTcGVjaWZpY01vZGlmaWNhdGlvbnMiLCJ0b29sU3BlYyIsImdyaWRDb250cm9sIiwiZXh0ZXJpb3JQZXJpbWV0ZXJzIiwiY3JlYXRpb25MaW1pdCIsImdldFdpZHRoIiwiZ2V0SGVpZ2h0IiwiZ2VuZXJhdGVDaGFsbGVuZ2VTZXQiLCJsZXZlbCIsIm51bUNoYWxsZW5nZXMiLCJjaGFsbGVuZ2VTZXQiLCJ0ZW1wQ2hhbGxlbmdlIiwidHJpYW5nbGVDaGFsbGVuZ2VzIiwiXyIsInRpbWVzIiwiRXJyb3IiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyZWFCdWlsZGVyQ2hhbGxlbmdlRmFjdG9yeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGZhY3Rvcnkgb2JqZWN0IHRoYXQgY3JlYXRlcyB0aGUgY2hhbGxlbmdlcyBmb3IgdGhlIEFyZWEgQnVpbGRlciBnYW1lLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcclxuaW1wb3J0IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9BcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQZXJpbWV0ZXJTaGFwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUGVyaW1ldGVyU2hhcGUuanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlIGZyb20gJy4vQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmpzJztcclxuaW1wb3J0IEFyZWFCdWlsZGVyR2FtZU1vZGVsIGZyb20gJy4vQXJlYUJ1aWxkZXJHYW1lTW9kZWwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFVOSVRfU1FVQVJFX0xFTkdUSCA9IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlVOSVRfU1FVQVJFX0xFTkdUSDsgLy8gSW4gc2NyZWVuIGNvb3Jkc1xyXG5cclxuZnVuY3Rpb24gQXJlYUJ1aWxkZXJDaGFsbGVuZ2VGYWN0b3J5KCkge1xyXG5cclxuICBjb25zdCByYW5kb20gPSBkb3RSYW5kb207XHJcblxyXG4gIC8vIEJhc2ljIHNoYXBlcyB1c2VkIGluIHRoZSAnY3JlYXRvciBraXRzJy5cclxuICBjb25zdCBVTklUX1NRVUFSRV9TSEFQRSA9IG5ldyBTaGFwZSgpXHJcbiAgICAubW92ZVRvKCAwLCAwIClcclxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCwgMCApXHJcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIFVOSVRfU1FVQVJFX0xFTkdUSCApXHJcbiAgICAubGluZVRvKCAwLCBVTklUX1NRVUFSRV9MRU5HVEggKVxyXG4gICAgLmNsb3NlKClcclxuICAgIC5tYWtlSW1tdXRhYmxlKCk7XHJcbiAgY29uc3QgSE9SSVpPTlRBTF9ET1VCTEVfU1FVQVJFX1NIQVBFID0gbmV3IFNoYXBlKClcclxuICAgIC5tb3ZlVG8oIDAsIDAgKVxyXG4gICAgLmxpbmVUbyggVU5JVF9TUVVBUkVfTEVOR1RIICogMiwgMCApXHJcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEggKiAyLCBVTklUX1NRVUFSRV9MRU5HVEggKVxyXG4gICAgLmxpbmVUbyggMCwgVU5JVF9TUVVBUkVfTEVOR1RIIClcclxuICAgIC5jbG9zZSgpXHJcbiAgICAubWFrZUltbXV0YWJsZSgpO1xyXG4gIGNvbnN0IFZFUlRJQ0FMX0RPVUJMRV9TUVVBUkVfU0hBUEUgPSBuZXcgU2hhcGUoKVxyXG4gICAgLm1vdmVUbyggMCwgMCApXHJcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIDAgKVxyXG4gICAgLmxpbmVUbyggVU5JVF9TUVVBUkVfTEVOR1RILCBVTklUX1NRVUFSRV9MRU5HVEggKiAyIClcclxuICAgIC5saW5lVG8oIDAsIFVOSVRfU1FVQVJFX0xFTkdUSCAqIDIgKVxyXG4gICAgLmNsb3NlKClcclxuICAgIC5tYWtlSW1tdXRhYmxlKCk7XHJcbiAgY29uc3QgUVVBRF9TUVVBUkVfU0hBUEUgPSBuZXcgU2hhcGUoKVxyXG4gICAgLm1vdmVUbyggMCwgMCApXHJcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEggKiAyLCAwIClcclxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCAqIDIsIFVOSVRfU1FVQVJFX0xFTkdUSCAqIDIgKVxyXG4gICAgLmxpbmVUbyggMCwgVU5JVF9TUVVBUkVfTEVOR1RIICogMiApXHJcbiAgICAuY2xvc2UoKVxyXG4gICAgLm1ha2VJbW11dGFibGUoKTtcclxuICBjb25zdCBSSUdIVF9CT1RUT01fVFJJQU5HTEVfU0hBUEUgPSBuZXcgU2hhcGUoKVxyXG4gICAgLm1vdmVUbyggVU5JVF9TUVVBUkVfTEVOR1RILCAwIClcclxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCwgVU5JVF9TUVVBUkVfTEVOR1RIIClcclxuICAgIC5saW5lVG8oIDAsIFVOSVRfU1FVQVJFX0xFTkdUSCApXHJcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIDAgKVxyXG4gICAgLmNsb3NlKClcclxuICAgIC5tYWtlSW1tdXRhYmxlKCk7XHJcbiAgY29uc3QgTEVGVF9CT1RUT01fVFJJQU5HTEVfU0hBUEUgPSBuZXcgU2hhcGUoKVxyXG4gICAgLm1vdmVUbyggMCwgMCApXHJcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIFVOSVRfU1FVQVJFX0xFTkdUSCApXHJcbiAgICAubGluZVRvKCAwLCBVTklUX1NRVUFSRV9MRU5HVEggKVxyXG4gICAgLmxpbmVUbyggMCwgMCApXHJcbiAgICAuY2xvc2UoKVxyXG4gICAgLm1ha2VJbW11dGFibGUoKTtcclxuICBjb25zdCBSSUdIVF9UT1BfVFJJQU5HTEVfU0hBUEUgPSBuZXcgU2hhcGUoKVxyXG4gICAgLm1vdmVUbyggMCwgMCApXHJcbiAgICAubGluZVRvKCBVTklUX1NRVUFSRV9MRU5HVEgsIDAgKVxyXG4gICAgLmxpbmVUbyggVU5JVF9TUVVBUkVfTEVOR1RILCBVTklUX1NRVUFSRV9MRU5HVEggKVxyXG4gICAgLmxpbmVUbyggMCwgMCApXHJcbiAgICAuY2xvc2UoKVxyXG4gICAgLm1ha2VJbW11dGFibGUoKTtcclxuICBjb25zdCBMRUZUX1RPUF9UUklBTkdMRV9TSEFQRSA9IG5ldyBTaGFwZSgpXHJcbiAgICAubW92ZVRvKCAwLCAwIClcclxuICAgIC5saW5lVG8oIFVOSVRfU1FVQVJFX0xFTkdUSCwgMCApXHJcbiAgICAubGluZVRvKCAwLCBVTklUX1NRVUFSRV9MRU5HVEggKVxyXG4gICAgLmxpbmVUbyggMCwgMCApXHJcbiAgICAuY2xvc2UoKVxyXG4gICAgLm1ha2VJbW11dGFibGUoKTtcclxuXHJcbiAgLy8gU2hhcGUga2l0IHdpdGggYSBzZXQgb2YgYmFzaWMgc2hhcGVzIGFuZCBhIGRlZmF1bHQgY29sb3IuXHJcbiAgY29uc3QgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQgPSBbXHJcbiAgICB7XHJcbiAgICAgIHNoYXBlOiBVTklUX1NRVUFSRV9TSEFQRSxcclxuICAgICAgY29sb3I6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBzaGFwZTogSE9SSVpPTlRBTF9ET1VCTEVfU1FVQVJFX1NIQVBFLFxyXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHNoYXBlOiBWRVJUSUNBTF9ET1VCTEVfU1FVQVJFX1NIQVBFLFxyXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHNoYXBlOiBRVUFEX1NRVUFSRV9TSEFQRSxcclxuICAgICAgY29sb3I6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SXHJcbiAgICB9XHJcbiAgXTtcclxuXHJcbiAgY29uc3QgUkVDVEFOR0xFU19BTkRfVFJJQU5HTEVTX1NIQVBFX0tJVCA9IFtcclxuICAgIHtcclxuICAgICAgc2hhcGU6IEhPUklaT05UQUxfRE9VQkxFX1NRVUFSRV9TSEFQRSxcclxuICAgICAgY29sb3I6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBzaGFwZTogVU5JVF9TUVVBUkVfU0hBUEUsXHJcbiAgICAgIGNvbG9yOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUlxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgc2hhcGU6IFZFUlRJQ0FMX0RPVUJMRV9TUVVBUkVfU0hBUEUsXHJcbiAgICAgIGNvbG9yOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUlxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgc2hhcGU6IExFRlRfQk9UVE9NX1RSSUFOR0xFX1NIQVBFLFxyXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHNoYXBlOiBMRUZUX1RPUF9UUklBTkdMRV9TSEFQRSxcclxuICAgICAgY29sb3I6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBzaGFwZTogUklHSFRfQk9UVE9NX1RSSUFOR0xFX1NIQVBFLFxyXG4gICAgICBjb2xvcjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1JcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHNoYXBlOiBSSUdIVF9UT1BfVFJJQU5HTEVfU0hBUEUsXHJcbiAgICAgIGNvbG9yOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUlxyXG4gICAgfVxyXG4gIF07XHJcblxyXG4gIC8vIENvbG9yIGNob29zZXIgZm9yIHNlbGVjdGluZyByYW5kb21pemVkIGNvbG9ycyBmb3IgJ2ZpbmQgdGhlIGFyZWEnIGNoYWxsZW5nZXMuXHJcbiAgY29uc3QgRklORF9USEVfQVJFQV9DT0xPUl9DSE9PU0VSID0ge1xyXG4gICAgY29sb3JMaXN0OiByYW5kb20uc2h1ZmZsZSggW1xyXG4gICAgICBuZXcgQ29sb3IoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBBTEVfQkxVRV9DT0xPUiApLFxyXG4gICAgICBuZXcgQ29sb3IoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBJTktJU0hfQ09MT1IgKSxcclxuICAgICAgbmV3IENvbG9yKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QVVJQTElTSF9DT0xPUiApLFxyXG4gICAgICBuZXcgQ29sb3IoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLk9SQU5HSVNIX0NPTE9SICksXHJcbiAgICAgIG5ldyBDb2xvciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuREFSS19HUkVFTl9DT0xPUiApXHJcbiAgICBdICksXHJcbiAgICBpbmRleDogMCxcclxuICAgIG5leHRDb2xvcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICggdGhpcy5pbmRleCA+PSB0aGlzLmNvbG9yTGlzdC5sZW5ndGggKSB7XHJcbiAgICAgICAgLy8gVGltZSB0byBzaHVmZmxlIHRoZSBjb2xvciBsaXN0LiAgTWFrZSBzdXJlIHRoYXQgd2hlbiB3ZSBkbywgdGhlIGNvbG9yIHRoYXQgd2FzIGF0IHRoZSBlbmQgb2YgdGhlIHByZXZpb3VzXHJcbiAgICAgICAgLy8gbGlzdCBpc24ndCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoaXMgb25lLCBvciB3ZSdsbCBnZXQgdHdvIG9mIHRoZSBzYW1lIGNvbG9ycyBpbiBhIHJvdy5cclxuICAgICAgICBjb25zdCBsYXN0Q29sb3IgPSB0aGlzLmNvbG9yTGlzdFsgdGhpcy5jb2xvckxpc3QubGVuZ3RoIC0gMSBdO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgIHRoaXMuY29sb3JMaXN0ID0gcmFuZG9tLnNodWZmbGUoIHRoaXMuY29sb3JMaXN0ICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIHRoaXMuY29sb3JMaXN0WyAwIF0gPT09IGxhc3RDb2xvciApO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aGUgaW5kZXguXHJcbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMuY29sb3JMaXN0WyB0aGlzLmluZGV4KysgXTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBDb2xvciBjaG9vc2VyIGZvciBzZWxlY3RpbmcgcmFuZG9taXplZCBjb2xvcnMgZm9yICdidWlsZCBpdCcgc3R5bGUgY2hhbGxlbmdlcy5cclxuICBjb25zdCBCVUlMRF9JVF9DT0xPUl9DSE9PU0VSID0ge1xyXG4gICAgY29sb3JMaXN0OiByYW5kb20uc2h1ZmZsZSggW1xyXG4gICAgICBuZXcgQ29sb3IoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkdSRUVOSVNIX0NPTE9SICksXHJcbiAgICAgIG5ldyBDb2xvciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUElOS0lTSF9DT0xPUiApLFxyXG4gICAgICBuZXcgQ29sb3IoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLk9SQU5HSVNIX0NPTE9SICksXHJcbiAgICAgIG5ldyBDb2xvciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEFMRV9CTFVFX0NPTE9SIClcclxuICAgIF0gKSxcclxuICAgIGluZGV4OiAwLFxyXG4gICAgbmV4dENvbG9yOiBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCB0aGlzLmluZGV4ID49IHRoaXMuY29sb3JMaXN0Lmxlbmd0aCApIHtcclxuICAgICAgICAvLyBUaW1lIHRvIHNodWZmbGUgdGhlIGNvbG9yIGxpc3QuICBNYWtlIHN1cmUgdGhhdCB3aGVuIHdlIGRvLCB0aGUgY29sb3IgdGhhdCB3YXMgYXQgdGhlIGVuZCBvZiB0aGUgcHJldmlvdXNcclxuICAgICAgICAvLyBsaXN0IGlzbid0IGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhpcyBvbmUsIG9yIHdlJ2xsIGdldCB0d28gb2YgdGhlIHNhbWUgY29sb3JzIGluIGEgcm93LlxyXG4gICAgICAgIGNvbnN0IGxhc3RDb2xvciA9IHRoaXMuY29sb3JMaXN0WyB0aGlzLmNvbG9yTGlzdC5sZW5ndGggLSAxIF07XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgdGhpcy5jb2xvckxpc3QgPSByYW5kb20uc2h1ZmZsZSggdGhpcy5jb2xvckxpc3QgKTtcclxuICAgICAgICB9IHdoaWxlICggdGhpcy5jb2xvckxpc3RbIDAgXSA9PT0gbGFzdENvbG9yICk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBpbmRleC5cclxuICAgICAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5jb2xvckxpc3RbIHRoaXMuaW5kZXgrKyBdO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIENvbG9yIHBhaXIgY2hvb3NlciwgdXNlZCBmb3Igc2VsZWN0aW5nIHJhbmRvbWl6ZWQgY29sb3JzIGZvciB0d28gdG9uZSAnYnVpbGQgaXQnIGNoYWxsZW5nZXMuXHJcbiAgY29uc3QgQ09MT1JfUEFJUl9DSE9PU0VSID0ge1xyXG4gICAgY29sb3JQYWlyTGlzdDogcmFuZG9tLnNodWZmbGUoIFtcclxuICAgICAge1xyXG4gICAgICAgIGNvbG9yMTogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1IsXHJcbiAgICAgICAgY29sb3IyOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5EQVJLX0dSRUVOX0NPTE9SXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjb2xvcjE6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBVUlBMSVNIX0NPTE9SLFxyXG4gICAgICAgIGNvbG9yMjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuREFSS19QVVJQTEVfQ09MT1JcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNvbG9yMTogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEFMRV9CTFVFX0NPTE9SLFxyXG4gICAgICAgIGNvbG9yMjogQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuREFSS19CTFVFX0NPTE9SXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjb2xvcjE6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBJTktJU0hfQ09MT1IsXHJcbiAgICAgICAgY29sb3IyOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QVVJQTEVfUElOS19DT0xPUlxyXG4gICAgICB9XHJcbiAgICBdICksXHJcbiAgICBpbmRleDogMCxcclxuICAgIG5leHRDb2xvclBhaXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoIHRoaXMuaW5kZXggPj0gdGhpcy5jb2xvclBhaXJMaXN0Lmxlbmd0aCApIHtcclxuICAgICAgICAvLyBUaW1lIHRvIHNodWZmbGUgdGhlIGxpc3QuXHJcbiAgICAgICAgY29uc3QgbGFzdENvbG9yUGFpciA9IHRoaXMuY29sb3JQYWlyTGlzdFsgdGhpcy5jb2xvclBhaXJMaXN0Lmxlbmd0aCAtIDEgXTtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICB0aGlzLmNvbG9yUGFpckxpc3QgPSByYW5kb20uc2h1ZmZsZSggdGhpcy5jb2xvclBhaXJMaXN0ICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIHRoaXMuY29sb3JQYWlyTGlzdFsgMCBdID09PSBsYXN0Q29sb3JQYWlyICk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBpbmRleC5cclxuICAgICAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5jb2xvclBhaXJMaXN0WyB0aGlzLmluZGV4KysgXTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLSBwcml2YXRlIGZ1bmN0aW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gU2VsZWN0IGEgcmFuZG9tIGVsZW1lbnQgZnJvbSBhbiBhcnJheVxyXG4gIGZ1bmN0aW9uIHJhbmRvbUVsZW1lbnQoIGFycmF5ICkge1xyXG4gICAgcmV0dXJuIGFycmF5WyBNYXRoLmZsb29yKCByYW5kb20ubmV4dERvdWJsZSgpICogYXJyYXkubGVuZ3RoICkgXTtcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZSBhIHNvbHV0aW9uIHNwZWMgKGEuay5hLiBhbiBleGFtcGxlIHNvbHV0aW9uKSB0aGF0IHJlcHJlc2VudHMgYSByZWN0YW5nbGUgd2l0aCB0aGUgc3BlY2lmaWVkIG9yaWdpbiBhbmQgc2l6ZS5cclxuICBmdW5jdGlvbiBjcmVhdGVNb25vY2hyb21lUmVjdGFuZ3VsYXJTb2x1dGlvblNwZWMoIHgsIHksIHdpZHRoLCBoZWlnaHQsIGNvbG9yICkge1xyXG4gICAgY29uc3Qgc29sdXRpb25TcGVjID0gW107XHJcbiAgICBmb3IgKCBsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgd2lkdGg7IGNvbHVtbisrICkge1xyXG4gICAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgaGVpZ2h0OyByb3crKyApIHtcclxuICAgICAgICBzb2x1dGlvblNwZWMucHVzaCgge1xyXG4gICAgICAgICAgY2VsbENvbHVtbjogY29sdW1uICsgeCxcclxuICAgICAgICAgIGNlbGxSb3c6IHJvdyArIHksXHJcbiAgICAgICAgICBjb2xvcjogY29sb3JcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBzb2x1dGlvblNwZWM7XHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGUgYSBzb2x1dGlvbiBzcGVjIChhLmsuYS4gYW4gZXhhbXBsZSBzb2x1dGlvbikgZm9yIGEgdHdvLXRvbmUgY2hhbGxlbmdlXHJcbiAgZnVuY3Rpb24gY3JlYXRlVHdvQ29sb3JSZWN0YW5ndWxhclNvbHV0aW9uU3BlYyggeCwgeSwgd2lkdGgsIGhlaWdodCwgY29sb3IxLCBjb2xvcjIsIGNvbG9yMXByb3BvcnRpb24gKSB7XHJcbiAgICBjb25zdCBzb2x1dGlvblNwZWMgPSBbXTtcclxuICAgIGZvciAoIGxldCByb3cgPSAwOyByb3cgPCBoZWlnaHQ7IHJvdysrICkge1xyXG4gICAgICBmb3IgKCBsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgd2lkdGg7IGNvbHVtbisrICkge1xyXG4gICAgICAgIHNvbHV0aW9uU3BlYy5wdXNoKCB7XHJcbiAgICAgICAgICBjZWxsQ29sdW1uOiBjb2x1bW4gKyB4LFxyXG4gICAgICAgICAgY2VsbFJvdzogcm93ICsgeSxcclxuICAgICAgICAgIGNvbG9yOiAoIHJvdyAqIHdpZHRoICsgY29sdW1uICkgLyAoIHdpZHRoICogaGVpZ2h0ICkgPCBjb2xvcjFwcm9wb3J0aW9uID8gY29sb3IxIDogY29sb3IyXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc29sdXRpb25TcGVjO1xyXG4gIH1cclxuXHJcbiAgLy8gRnVuY3Rpb24gZm9yIGNyZWF0aW5nIGEgJ3NoYXBlIGtpdCcgb2YgdGhlIGJhc2ljIHNoYXBlcyBvZiB0aGUgc3BlY2lmaWVkIGNvbG9yLlxyXG4gIGZ1bmN0aW9uIGNyZWF0ZUJhc2ljUmVjdGFuZ2xlc1NoYXBlS2l0KCBjb2xvciApIHtcclxuICAgIGNvbnN0IGtpdCA9IFtdO1xyXG4gICAgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQuZm9yRWFjaCgga2l0RWxlbWVudCA9PiB7XHJcbiAgICAgIGtpdC5wdXNoKCB7IHNoYXBlOiBraXRFbGVtZW50LnNoYXBlLCBjb2xvcjogY29sb3IgfSApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIGtpdDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZVR3b1RvbmVSZWN0YW5nbGVCdWlsZEtpdCggY29sb3IxLCBjb2xvcjIgKSB7XHJcbiAgICBjb25zdCBraXQgPSBbXTtcclxuICAgIEJBU0lDX1JFQ1RBTkdMRVNfU0hBUEVfS0lULmZvckVhY2goIGtpdEVsZW1lbnQgPT4ge1xyXG4gICAgICBjb25zdCBjb2xvcjFFbGVtZW50ID0ge1xyXG4gICAgICAgIHNoYXBlOiBraXRFbGVtZW50LnNoYXBlLFxyXG4gICAgICAgIGNvbG9yOiBjb2xvcjFcclxuICAgICAgfTtcclxuICAgICAga2l0LnB1c2goIGNvbG9yMUVsZW1lbnQgKTtcclxuICAgICAgY29uc3QgY29sb3IyRWxlbWVudCA9IHtcclxuICAgICAgICBzaGFwZToga2l0RWxlbWVudC5zaGFwZSxcclxuICAgICAgICBjb2xvcjogY29sb3IyXHJcbiAgICAgIH07XHJcbiAgICAgIGtpdC5wdXNoKCBjb2xvcjJFbGVtZW50ICk7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4ga2l0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmxpcFBlcmltZXRlclBvaW50c0hvcml6b250YWxseSggcGVyaW1ldGVyUG9pbnRMaXN0ICkge1xyXG4gICAgY29uc3QgcmVmbGVjdGVkUG9pbnRzID0gW107XHJcbiAgICBsZXQgbWluWCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGxldCBtYXhYID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xyXG4gICAgcGVyaW1ldGVyUG9pbnRMaXN0LmZvckVhY2goIHBvaW50ID0+IHtcclxuICAgICAgbWluWCA9IE1hdGgubWluKCBwb2ludC54LCBtaW5YICk7XHJcbiAgICAgIG1heFggPSBNYXRoLm1heCggcG9pbnQueCwgbWF4WCApO1xyXG4gICAgfSApO1xyXG4gICAgcGVyaW1ldGVyUG9pbnRMaXN0LmZvckVhY2goIHBvaW50ID0+IHtcclxuICAgICAgcmVmbGVjdGVkUG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCAtMSAqICggcG9pbnQueCAtIG1pblggLSBtYXhYICksIHBvaW50LnkgKSApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHJlZmxlY3RlZFBvaW50cztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZsaXBQZXJpbWV0ZXJQb2ludHNWZXJ0aWNhbGx5KCBwZXJpbWV0ZXJQb2ludExpc3QgKSB7XHJcbiAgICBjb25zdCByZWZsZWN0ZWRQb2ludHMgPSBbXTtcclxuICAgIGxldCBtaW5ZID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgbGV0IG1heFkgPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XHJcbiAgICBwZXJpbWV0ZXJQb2ludExpc3QuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG4gICAgICBtaW5ZID0gTWF0aC5taW4oIHBvaW50LnksIG1pblkgKTtcclxuICAgICAgbWF4WSA9IE1hdGgubWF4KCBwb2ludC55LCBtYXhZICk7XHJcbiAgICB9ICk7XHJcbiAgICBwZXJpbWV0ZXJQb2ludExpc3QuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG4gICAgICByZWZsZWN0ZWRQb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIHBvaW50LngsIC0xICogKCBwb2ludC55IC0gbWluWSAtIG1heFkgKSApICk7XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gcmVmbGVjdGVkUG9pbnRzO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlUmVjdGFuZ3VsYXJQZXJpbWV0ZXJTaGFwZSggeCwgeSwgd2lkdGgsIGhlaWdodCwgZmlsbENvbG9yICkge1xyXG4gICAgcmV0dXJuIG5ldyBQZXJpbWV0ZXJTaGFwZShcclxuICAgICAgLy8gRXh0ZXJpb3IgcGVyaW1ldGVyc1xyXG4gICAgICBbXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIHgsIHkgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGgsIHkgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGgsIHkgKyBoZWlnaHQgKSxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCB4LCB5ICsgaGVpZ2h0IClcclxuICAgICAgICBdXHJcbiAgICAgIF0sXHJcblxyXG4gICAgICAvLyBJbnRlcmlvciBwZXJpbWV0ZXJzXHJcbiAgICAgIFtdLFxyXG5cclxuICAgICAgLy8gVW5pdCBzaXplXHJcbiAgICAgIFVOSVRfU1FVQVJFX0xFTkdUSCxcclxuXHJcbiAgICAgIC8vIGNvbG9yXHJcbiAgICAgIHtcclxuICAgICAgICBmaWxsQ29sb3I6IGZpbGxDb2xvcixcclxuICAgICAgICBlZGdlQ29sb3I6IGZpbGxDb2xvci5jb2xvclV0aWxzRGFya2VyKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiApXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVMU2hhcGVkUGVyaW1ldGVyU2hhcGUoIHgsIHksIHdpZHRoLCBoZWlnaHQsIG1pc3NpbmdDb3JuZXIsIHdpZHRoTWlzc2luZywgaGVpZ2h0TWlzc2luZywgZmlsbENvbG9yICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggPiB3aWR0aE1pc3NpbmcgJiYgaGVpZ2h0ID4gaGVpZ2h0TWlzc2luZywgJ0ludmFsaWQgcGFyYW1ldGVycycgKTtcclxuXHJcbiAgICBsZXQgcGVyaW1ldGVyUG9pbnRzID0gW1xyXG4gICAgICBuZXcgVmVjdG9yMiggeCArIHdpZHRoTWlzc2luZywgeSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggeCArIHdpZHRoLCB5ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGgsIHkgKyBoZWlnaHQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIHgsIHkgKyBoZWlnaHQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIHgsIHkgKyBoZWlnaHRNaXNzaW5nICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGhNaXNzaW5nLCB5ICsgaGVpZ2h0TWlzc2luZyApXHJcbiAgICBdO1xyXG5cclxuICAgIGlmICggbWlzc2luZ0Nvcm5lciA9PT0gJ3JpZ2h0VG9wJyB8fCBtaXNzaW5nQ29ybmVyID09PSAncmlnaHRCb3R0b20nICkge1xyXG4gICAgICBwZXJpbWV0ZXJQb2ludHMgPSBmbGlwUGVyaW1ldGVyUG9pbnRzSG9yaXpvbnRhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcclxuICAgIH1cclxuICAgIGlmICggbWlzc2luZ0Nvcm5lciA9PT0gJ2xlZnRCb3R0b20nIHx8IG1pc3NpbmdDb3JuZXIgPT09ICdyaWdodEJvdHRvbScgKSB7XHJcbiAgICAgIHBlcmltZXRlclBvaW50cyA9IGZsaXBQZXJpbWV0ZXJQb2ludHNWZXJ0aWNhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFBlcmltZXRlclNoYXBlKCBbIHBlcmltZXRlclBvaW50cyBdLCBbXSwgVU5JVF9TUVVBUkVfTEVOR1RILCB7XHJcbiAgICAgICAgZmlsbENvbG9yOiBmaWxsQ29sb3IsXHJcbiAgICAgICAgZWRnZUNvbG9yOiBmaWxsQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3JlYXRlIGEgcGVyaW1ldGVyIHNoYXBlIHdpdGggYSBjdXRvdXQgaW4gdGhlIHRvcCwgYm90dG9tLCBsZWZ0LCBvciByaWdodCBzaWRlLlxyXG4gIGZ1bmN0aW9uIGNyZWF0ZVVTaGFwZWRQZXJpbWV0ZXJTaGFwZSggeCwgeSwgd2lkdGgsIGhlaWdodCwgc2lkZVdpdGhDdXRvdXQsIGN1dG91dFdpZHRoLCBjdXRvdXRIZWlnaHQsIGN1dG91dE9mZnNldCwgZmlsbENvbG9yICkge1xyXG4gICAgbGV0IHBlcmltZXRlclBvaW50cyA9IFsgbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDAgKSBdO1xyXG5cclxuICAgIGlmICggc2lkZVdpdGhDdXRvdXQgPT09ICdsZWZ0JyB8fCBzaWRlV2l0aEN1dG91dCA9PT0gJ3JpZ2h0JyApIHtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAwIF0uc2V0WFkoIHgsIHkgKTtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAxIF0uc2V0WFkoIHggKyB3aWR0aCwgeSApO1xyXG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDIgXS5zZXRYWSggeCArIHdpZHRoLCB5ICsgaGVpZ2h0ICk7XHJcbiAgICAgIHBlcmltZXRlclBvaW50c1sgMyBdLnNldFhZKCB4LCB5ICsgaGVpZ2h0ICk7XHJcbiAgICAgIHBlcmltZXRlclBvaW50c1sgNCBdLnNldFhZKCB4LCB5ICsgY3V0b3V0T2Zmc2V0ICsgY3V0b3V0SGVpZ2h0ICk7XHJcbiAgICAgIHBlcmltZXRlclBvaW50c1sgNSBdLnNldFhZKCB4ICsgY3V0b3V0V2lkdGgsIHkgKyBjdXRvdXRPZmZzZXQgKyBjdXRvdXRIZWlnaHQgKTtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzWyA2IF0uc2V0WFkoIHggKyBjdXRvdXRXaWR0aCwgeSArIGN1dG91dE9mZnNldCApO1xyXG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDcgXS5zZXRYWSggeCwgeSArIGN1dG91dE9mZnNldCApO1xyXG4gICAgICBpZiAoIHNpZGVXaXRoQ3V0b3V0ID09PSAncmlnaHQnICkge1xyXG4gICAgICAgIHBlcmltZXRlclBvaW50cyA9IGZsaXBQZXJpbWV0ZXJQb2ludHNIb3Jpem9udGFsbHkoIHBlcmltZXRlclBvaW50cyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAwIF0uc2V0WFkoIHgsIHkgKTtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAxIF0uc2V0WFkoIHggKyBjdXRvdXRPZmZzZXQsIHkgKTtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAyIF0uc2V0WFkoIHggKyBjdXRvdXRPZmZzZXQsIHkgKyBjdXRvdXRIZWlnaHQgKTtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzWyAzIF0uc2V0WFkoIHggKyBjdXRvdXRPZmZzZXQgKyBjdXRvdXRXaWR0aCwgeSArIGN1dG91dEhlaWdodCApO1xyXG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDQgXS5zZXRYWSggeCArIGN1dG91dE9mZnNldCArIGN1dG91dFdpZHRoLCB5ICk7XHJcbiAgICAgIHBlcmltZXRlclBvaW50c1sgNSBdLnNldFhZKCB4ICsgd2lkdGgsIHkgKTtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzWyA2IF0uc2V0WFkoIHggKyB3aWR0aCwgeSArIGhlaWdodCApO1xyXG4gICAgICBwZXJpbWV0ZXJQb2ludHNbIDcgXS5zZXRYWSggeCwgeSArIGhlaWdodCApO1xyXG4gICAgICBpZiAoIHNpZGVXaXRoQ3V0b3V0ID09PSAnYm90dG9tJyApIHtcclxuICAgICAgICBwZXJpbWV0ZXJQb2ludHMgPSBmbGlwUGVyaW1ldGVyUG9pbnRzVmVydGljYWxseSggcGVyaW1ldGVyUG9pbnRzICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFBlcmltZXRlclNoYXBlKCBbIHBlcmltZXRlclBvaW50cyBdLCBbXSwgVU5JVF9TUVVBUkVfTEVOR1RILCB7XHJcbiAgICAgIGZpbGxDb2xvcjogZmlsbENvbG9yLFxyXG4gICAgICBlZGdlQ29sb3I6IGZpbGxDb2xvci5jb2xvclV0aWxzRGFya2VyKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVQZXJpbWV0ZXJTaGFwZVdpdGhIb2xlKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBob2xlV2lkdGgsIGhvbGVIZWlnaHQsIGhvbGVYT2Zmc2V0LCBob2xlWU9mZnNldCwgZmlsbENvbG9yICkge1xyXG4gICAgY29uc3QgZXh0ZXJpb3JQZXJpbWV0ZXJQb2ludHMgPSBbXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB4LCB5ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGgsIHkgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIHggKyB3aWR0aCwgeSArIGhlaWdodCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggeCwgeSArIGhlaWdodCApXHJcbiAgICBdO1xyXG4gICAgY29uc3QgaW50ZXJpb3JQZXJpbWV0ZXJQb2ludHMgPSBbXHJcbiAgICAgIC8vIEhhdmUgdG8gZHJhdyBob2xlIGluIG9wcG9zaXRlIGRpcmVjdGlvbiBmb3IgaXQgdG8gYXBwZWFyLlxyXG4gICAgICBuZXcgVmVjdG9yMiggeCArIGhvbGVYT2Zmc2V0LCB5ICsgaG9sZVlPZmZzZXQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIHggKyBob2xlWE9mZnNldCwgeSArIGhvbGVZT2Zmc2V0ICsgaG9sZUhlaWdodCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggeCArIGhvbGVYT2Zmc2V0ICsgaG9sZVdpZHRoLCB5ICsgaG9sZVlPZmZzZXQgKyBob2xlSGVpZ2h0ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB4ICsgaG9sZVhPZmZzZXQgKyBob2xlV2lkdGgsIHkgKyBob2xlWU9mZnNldCApXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiBuZXcgUGVyaW1ldGVyU2hhcGUoIFsgZXh0ZXJpb3JQZXJpbWV0ZXJQb2ludHMgXSwgWyBpbnRlcmlvclBlcmltZXRlclBvaW50cyBdLCBVTklUX1NRVUFSRV9MRU5HVEgsIHtcclxuICAgICAgZmlsbENvbG9yOiBmaWxsQ29sb3IsXHJcbiAgICAgIGVkZ2VDb2xvcjogZmlsbENvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZVBlcmltZXRlclNoYXBlU2xhbnRlZEh5cG90ZW51c2VSaWdodElzb3NjZWxlc1RyaWFuZ2xlKCB4LCB5LCBlZGdlTGVuZ3RoLCBjb3JuZXJQb3NpdGlvbiwgZmlsbENvbG9yICkge1xyXG4gICAgbGV0IHBlcmltZXRlclBvaW50cyA9IFsgbmV3IFZlY3RvcjIoIHgsIHkgKSwgbmV3IFZlY3RvcjIoIHggKyBlZGdlTGVuZ3RoLCB5ICksIG5ldyBWZWN0b3IyKCB4LCB5ICsgZWRnZUxlbmd0aCApIF07XHJcbiAgICBpZiAoIGNvcm5lclBvc2l0aW9uID09PSAncmlnaHRUb3AnIHx8IGNvcm5lclBvc2l0aW9uID09PSAncmlnaHRCb3R0b20nICkge1xyXG4gICAgICBwZXJpbWV0ZXJQb2ludHMgPSBmbGlwUGVyaW1ldGVyUG9pbnRzSG9yaXpvbnRhbGx5KCBwZXJpbWV0ZXJQb2ludHMgKTtcclxuICAgIH1cclxuICAgIGlmICggY29ybmVyUG9zaXRpb24gPT09ICdsZWZ0Qm90dG9tJyB8fCBjb3JuZXJQb3NpdGlvbiA9PT0gJ3JpZ2h0Qm90dG9tJyApIHtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzID0gZmxpcFBlcmltZXRlclBvaW50c1ZlcnRpY2FsbHkoIHBlcmltZXRlclBvaW50cyApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgUGVyaW1ldGVyU2hhcGUoIFsgcGVyaW1ldGVyUG9pbnRzIF0sIFtdLCBVTklUX1NRVUFSRV9MRU5HVEgsIHtcclxuICAgICAgZmlsbENvbG9yOiBmaWxsQ29sb3IsXHJcbiAgICAgIGVkZ2VDb2xvcjogZmlsbENvbG9yLmNvbG9yVXRpbHNEYXJrZXIoIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZVBlcmltZXRlclNoYXBlTGV2ZWxIeXBvdGVudXNlUmlnaHRJc29zY2VsZXNUcmlhbmdsZSggeCwgeSwgaHlwb3RlbnVzZUxlbmd0aCwgY29ybmVyUG9zaXRpb24sIGZpbGxDb2xvciApIHtcclxuICAgIGxldCBwZXJpbWV0ZXJQb2ludHM7XHJcbiAgICBpZiAoIGNvcm5lclBvc2l0aW9uID09PSAnY2VudGVyVG9wJyB8fCBjb3JuZXJQb3NpdGlvbiA9PT0gJ2NlbnRlckJvdHRvbScgKSB7XHJcbiAgICAgIHBlcmltZXRlclBvaW50cyA9IFsgbmV3IFZlY3RvcjIoIHgsIHkgKSwgbmV3IFZlY3RvcjIoIHggKyBoeXBvdGVudXNlTGVuZ3RoLCB5ICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIHggKyBoeXBvdGVudXNlTGVuZ3RoIC8gMiwgeSArIGh5cG90ZW51c2VMZW5ndGggLyAyICkgXTtcclxuICAgICAgaWYgKCBjb3JuZXJQb3NpdGlvbiA9PT0gJ2NlbnRlckJvdHRvbScgKSB7XHJcbiAgICAgICAgcGVyaW1ldGVyUG9pbnRzID0gZmxpcFBlcmltZXRlclBvaW50c1ZlcnRpY2FsbHkoIHBlcmltZXRlclBvaW50cyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzID0gWyBuZXcgVmVjdG9yMiggeCwgeSApLCBuZXcgVmVjdG9yMiggeCwgeSArIGh5cG90ZW51c2VMZW5ndGggKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggeCArIGh5cG90ZW51c2VMZW5ndGggLyAyLCB5ICsgaHlwb3RlbnVzZUxlbmd0aCAvIDIgKSBdO1xyXG4gICAgICBpZiAoIGNvcm5lclBvc2l0aW9uID09PSAnY2VudGVyTGVmdCcgKSB7XHJcbiAgICAgICAgcGVyaW1ldGVyUG9pbnRzID0gZmxpcFBlcmltZXRlclBvaW50c0hvcml6b250YWxseSggcGVyaW1ldGVyUG9pbnRzICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBSZWZsZWN0IGFzIGFwcHJvcHJpYXRlIHRvIGNyZWF0ZSB0aGUgc3BlY2lmaWVkIG9yaWVudGF0aW9uLlxyXG4gICAgaWYgKCBjb3JuZXJQb3NpdGlvbiA9PT0gJ2NlbnRlclRvcCcgfHwgY29ybmVyUG9zaXRpb24gPT09ICdyaWdodEJvdHRvbScgKSB7XHJcbiAgICAgIHBlcmltZXRlclBvaW50cyA9IGZsaXBQZXJpbWV0ZXJQb2ludHNIb3Jpem9udGFsbHkoIHBlcmltZXRlclBvaW50cyApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBjb3JuZXJQb3NpdGlvbiA9PT0gJ2xlZnRCb3R0b20nIHx8IGNvcm5lclBvc2l0aW9uID09PSAncmlnaHRCb3R0b20nICkge1xyXG4gICAgICBwZXJpbWV0ZXJQb2ludHMgPSBmbGlwUGVyaW1ldGVyUG9pbnRzVmVydGljYWxseSggcGVyaW1ldGVyUG9pbnRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQZXJpbWV0ZXJTaGFwZSggWyBwZXJpbWV0ZXJQb2ludHMgXSwgW10sIFVOSVRfU1FVQVJFX0xFTkdUSCwge1xyXG4gICAgICBmaWxsQ29sb3I6IGZpbGxDb2xvcixcclxuICAgICAgZWRnZUNvbG9yOiBmaWxsQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlU2hhcGVXaXRoRGlhZ29uYWxBbmRNaXNzaW5nQ29ybmVyKCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBkaWFnb25hbFBvc2l0aW9uLCBkaWFnb25hbFNxdWFyZUxlbmd0aCwgY3V0V2lkdGgsIGN1dEhlaWdodCwgZmlsbENvbG9yICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggLSBkaWFnb25hbFNxdWFyZUxlbmd0aCA+PSBjdXRXaWR0aCAmJiBoZWlnaHQgLSBkaWFnb25hbFNxdWFyZUxlbmd0aCA+PSBjdXRIZWlnaHQsICdJbnZhbGlkIHBhcmFtZXRlcnMnICk7XHJcblxyXG4gICAgbGV0IHBlcmltZXRlclBvaW50cyA9IFtdO1xyXG4gICAgLy8gRHJhdyBzaGFwZSB3aXRoIGRpYWdvbmFsIGluIGxvd2VyIHJpZ2h0IGNvcm5lciwgc3RhcnRpbmcgaW4gdXBwZXIgcmlnaHQgY29ybmVyLlxyXG4gICAgcGVyaW1ldGVyUG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGgsIHkgKSApO1xyXG4gICAgcGVyaW1ldGVyUG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCB4ICsgd2lkdGgsIHkgKyBoZWlnaHQgLSBkaWFnb25hbFNxdWFyZUxlbmd0aCApICk7XHJcbiAgICBwZXJpbWV0ZXJQb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIHggKyB3aWR0aCAtIGRpYWdvbmFsU3F1YXJlTGVuZ3RoLCB5ICsgaGVpZ2h0ICkgKTtcclxuICAgIHBlcmltZXRlclBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggeCwgeSArIGhlaWdodCApICk7XHJcbiAgICBwZXJpbWV0ZXJQb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIHgsIHkgKyBjdXRIZWlnaHQgKSApO1xyXG4gICAgcGVyaW1ldGVyUG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCB4ICsgY3V0V2lkdGgsIHkgKyBjdXRIZWlnaHQgKSApO1xyXG4gICAgcGVyaW1ldGVyUG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCB4ICsgY3V0V2lkdGgsIHkgKSApO1xyXG5cclxuICAgIC8vIFJlZmxlY3Qgc2hhcGUgYXMgbmVlZGVkIHRvIG1lZXQgdGhlIHNwZWNpZmllZCBvcmllbnRhdGlvbi5cclxuICAgIGlmICggZGlhZ29uYWxQb3NpdGlvbiA9PT0gJ2xlZnRUb3AnIHx8IGRpYWdvbmFsUG9zaXRpb24gPT09ICdsZWZ0Qm90dG9tJyApIHtcclxuICAgICAgcGVyaW1ldGVyUG9pbnRzID0gZmxpcFBlcmltZXRlclBvaW50c0hvcml6b250YWxseSggcGVyaW1ldGVyUG9pbnRzICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIGRpYWdvbmFsUG9zaXRpb24gPT09ICdyaWdodFRvcCcgfHwgZGlhZ29uYWxQb3NpdGlvbiA9PT0gJ2xlZnRUb3AnICkge1xyXG4gICAgICBwZXJpbWV0ZXJQb2ludHMgPSBmbGlwUGVyaW1ldGVyUG9pbnRzVmVydGljYWxseSggcGVyaW1ldGVyUG9pbnRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQZXJpbWV0ZXJTaGFwZSggWyBwZXJpbWV0ZXJQb2ludHMgXSwgW10sIFVOSVRfU1FVQVJFX0xFTkdUSCwge1xyXG4gICAgICBmaWxsQ29sb3I6IGZpbGxDb2xvcixcclxuICAgICAgZWRnZUNvbG9yOiBmaWxsQ29sb3IuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJuIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciB0d28gY2hhbGxlbmdlcyBhcmUgc2ltaWxhciwgdXNlZCB3aGVuIGdlbmVyYXRpbmcgY2hhbGxlbmdlcyB0aGF0IGFyZVxyXG4gIC8vIGRpc3RpbmN0IGVub3VnaCB0byBrZWVwIHRoZSBnYW1lIGludGVyZXN0aW5nLlxyXG4gIGZ1bmN0aW9uIGlzQ2hhbGxlbmdlU2ltaWxhciggY2hhbGxlbmdlMSwgY2hhbGxlbmdlMiApIHtcclxuICAgIGlmICggY2hhbGxlbmdlMS5idWlsZFNwZWMgJiYgY2hhbGxlbmdlMi5idWlsZFNwZWMgKSB7XHJcbiAgICAgIGlmICggY2hhbGxlbmdlMS5idWlsZFNwZWMucHJvcG9ydGlvbnMgJiYgY2hhbGxlbmdlMi5idWlsZFNwZWMucHJvcG9ydGlvbnMgKSB7XHJcbiAgICAgICAgaWYgKCBjaGFsbGVuZ2UxLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjFQcm9wb3J0aW9uLmRlbm9taW5hdG9yID09PSBjaGFsbGVuZ2UyLmJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjFQcm9wb3J0aW9uLmRlbm9taW5hdG9yICkge1xyXG4gICAgICAgICAgaWYgKCBjaGFsbGVuZ2UxLmJ1aWxkU3BlYy5wZXJpbWV0ZXIgJiYgY2hhbGxlbmdlMi5idWlsZFNwZWMucGVyaW1ldGVyIHx8ICFjaGFsbGVuZ2UxLmJ1aWxkU3BlYy5wZXJpbWV0ZXIgJiYgIWNoYWxsZW5nZTIuYnVpbGRTcGVjLnBlcmltZXRlciApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhY2hhbGxlbmdlMS5idWlsZFNwZWMucHJvcG9ydGlvbnMgJiYgIWNoYWxsZW5nZTEuYnVpbGRTcGVjLnByb3BvcnRpb25zICkge1xyXG4gICAgICAgIGlmICggY2hhbGxlbmdlMS5idWlsZFNwZWMuYXJlYSA9PT0gY2hhbGxlbmdlMi5idWlsZFNwZWMuYXJlYSApIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmICggY2hhbGxlbmdlMS5iYWNrZ3JvdW5kU2hhcGUgJiYgY2hhbGxlbmdlMi5iYWNrZ3JvdW5kU2hhcGUgKSB7XHJcbiAgICAgICAgaWYgKCBjaGFsbGVuZ2UxLmJhY2tncm91bmRTaGFwZS51bml0QXJlYSA9PT0gY2hhbGxlbmdlMi5iYWNrZ3JvdW5kU2hhcGUudW5pdEFyZWEgKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSBnb3QgdG8gaGVyZSwgdGhlIGNoYWxsZW5nZXMgYXJlIG5vdCBzaW1pbGFyLlxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gVGVzdCB0aGUgY2hhbGxlbmdlIGFnYWluc3QgdGhlIGhpc3Rvcnkgb2YgcmVjZW50bHkgZ2VuZXJhdGVkIGNoYWxsZW5nZXMgdG8gc2VlIGlmIGl0IGlzIHVuaXF1ZS5cclxuICBmdW5jdGlvbiBpc0NoYWxsZW5nZVVuaXF1ZSggY2hhbGxlbmdlICkge1xyXG4gICAgbGV0IGNoYWxsZW5nZUlzVW5pcXVlID0gdHJ1ZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoYWxsZW5nZUhpc3RvcnkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggaXNDaGFsbGVuZ2VTaW1pbGFyKCBjaGFsbGVuZ2UsIGNoYWxsZW5nZUhpc3RvcnlbIGkgXSApICkge1xyXG4gICAgICAgIGNoYWxsZW5nZUlzVW5pcXVlID0gZmFsc2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjaGFsbGVuZ2VJc1VuaXF1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQnVpbGRBcmVhQ2hhbGxlbmdlKCkge1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHVuaXF1ZSBjaGFsbGVuZ2VcclxuICAgIGNvbnN0IHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gMiApO1xyXG4gICAgbGV0IGhlaWdodCA9IDA7XHJcbiAgICB3aGlsZSAoIHdpZHRoICogaGVpZ2h0IDwgOCB8fCB3aWR0aCAqIGhlaWdodCA+IDM2ICkge1xyXG4gICAgICBoZWlnaHQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDAsIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gMiApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY29sb3IgPSBCVUlMRF9JVF9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpO1xyXG4gICAgY29uc3QgZXhhbXBsZVNvbHV0aW9uID0gY3JlYXRlTW9ub2Nocm9tZVJlY3Rhbmd1bGFyU29sdXRpb25TcGVjKFxyXG4gICAgICBNYXRoLmZsb29yKCAoIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSB3aWR0aCApIC8gMiApLFxyXG4gICAgICBNYXRoLmZsb29yKCAoIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gaGVpZ2h0ICkgLyAyICksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHQsXHJcbiAgICAgIGNvbG9yXHJcbiAgICApO1xyXG4gICAgY29uc3QgY2hhbGxlbmdlID0gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUJ1aWxkQXJlYUNoYWxsZW5nZSggd2lkdGggKiBoZWlnaHQsIGNyZWF0ZUJhc2ljUmVjdGFuZ2xlc1NoYXBlS2l0KCBjb2xvciApLCBleGFtcGxlU29sdXRpb24gKTtcclxuICAgIHJldHVybiBjaGFsbGVuZ2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSBhICdidWlsZCBpdCcgYXJlYStwZXJpbWV0ZXIgY2hhbGxlbmdlIHRoYXQgY29uc2lzdHMgb2YgdHdvIGNvbm5lY3RlZCByZWN0YW5nbGVzLiAgU2VlIHRoZSBkZXNpZ24gc3BlY1xyXG4gICAqIGZvciBkZXRhaWxzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlVHdvUmVjdGFuZ2xlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlKCkge1xyXG5cclxuICAgIC8vIENyZWF0ZSBmaXJzdCByZWN0YW5nbGUgZGltZW5zaW9uc1xyXG4gICAgY29uc3Qgd2lkdGgxID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCA2ICk7XHJcbiAgICBsZXQgaGVpZ2h0MTtcclxuICAgIGRvIHtcclxuICAgICAgaGVpZ2h0MSA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgNCApO1xyXG4gICAgfSB3aGlsZSAoIHdpZHRoMSAlIDIgPT09IGhlaWdodDEgJSAyICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHNlY29uZCByZWN0YW5nbGUgZGltZW5zaW9uc1xyXG4gICAgbGV0IHdpZHRoMiA9IDA7XHJcbiAgICBkbyB7XHJcbiAgICAgIHdpZHRoMiA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgNiApO1xyXG4gICAgfSB3aGlsZSAoIHdpZHRoMSArIHdpZHRoMiA+IEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSAyICk7XHJcbiAgICBsZXQgaGVpZ2h0MjtcclxuICAgIGRvIHtcclxuICAgICAgaGVpZ2h0MiA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgNiApO1xyXG4gICAgfSB3aGlsZSAoIHdpZHRoMiAlIDIgPT09IGhlaWdodDIgJSAyIHx8IGhlaWdodDEgKyBoZWlnaHQyID4gQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICk7XHJcblxyXG4gICAgLy8gQ2hvb3NlIHRoZSBhbW91bnQgb2Ygb3ZlcmxhcFxyXG4gICAgY29uc3Qgb3ZlcmxhcCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgTWF0aC5taW4oIHdpZHRoMSwgd2lkdGgyICkgLSAxICk7XHJcblxyXG4gICAgY29uc3QgbGVmdCA9IE1hdGguZmxvb3IoICggQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtICggd2lkdGgxICsgd2lkdGgyIC0gb3ZlcmxhcCApICkgLyAyICk7XHJcbiAgICBjb25zdCB0b3AgPSBNYXRoLmZsb29yKCAoIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gKCBoZWlnaHQxICsgaGVpZ2h0MiApICkgLyAyICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgc29sdXRpb24gc3BlYyBieSBtZXJnaW5nIHNwZWNzIGZvciBlYWNoIG9mIHRoZSByZWN0YW5nbGVzIHRvZ2V0aGVyLlxyXG4gICAgY29uc3QgY29sb3IgPSBCVUlMRF9JVF9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpO1xyXG4gICAgY29uc3Qgc29sdXRpb25TcGVjID0gY3JlYXRlTW9ub2Nocm9tZVJlY3Rhbmd1bGFyU29sdXRpb25TcGVjKCBsZWZ0LCB0b3AsIHdpZHRoMSwgaGVpZ2h0MSwgY29sb3IgKS5jb25jYXQoXHJcbiAgICAgIGNyZWF0ZU1vbm9jaHJvbWVSZWN0YW5ndWxhclNvbHV0aW9uU3BlYyggbGVmdCArIHdpZHRoMSAtIG92ZXJsYXAsIHRvcCArIGhlaWdodDEsIHdpZHRoMiwgaGVpZ2h0MiwgY29sb3IgKSApO1xyXG5cclxuICAgIHJldHVybiAoIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UoIHdpZHRoMSAqIGhlaWdodDEgKyB3aWR0aDIgKiBoZWlnaHQyLFxyXG4gICAgICAyICogd2lkdGgxICsgMiAqIGhlaWdodDEgKyAyICogd2lkdGgyICsgMiAqIGhlaWdodDIgLSAyICogb3ZlcmxhcCwgY3JlYXRlQmFzaWNSZWN0YW5nbGVzU2hhcGVLaXQoIGNvbG9yICksIHNvbHV0aW9uU3BlYyApICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5lcmF0ZUJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSgpIHtcclxuXHJcbiAgICBsZXQgd2lkdGg7XHJcbiAgICBsZXQgaGVpZ2h0O1xyXG5cclxuICAgIC8vIFdpZHRoIGNhbiBiZSBhbnkgdmFsdWUgZnJvbSAzIHRvIDggZXhjbHVkaW5nIDcsIHNlZSBkZXNpZ24gZG9jLlxyXG4gICAgZG8ge1xyXG4gICAgICB3aWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMywgOCApO1xyXG4gICAgfSB3aGlsZSAoIHdpZHRoID09PSAwIHx8IHdpZHRoID09PSA3ICk7XHJcblxyXG4gICAgLy8gQ2hvb3NlIHRoZSBoZWlnaHQgYmFzZWQgb24gdGhlIHRvdGFsIGFyZWEuXHJcbiAgICBkbyB7XHJcbiAgICAgIGhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMywgOCApO1xyXG4gICAgfSB3aGlsZSAoIHdpZHRoICogaGVpZ2h0IDwgMTIgfHwgd2lkdGggKiBoZWlnaHQgPiAzNiB8fCBoZWlnaHQgPT09IDcgfHwgaGVpZ2h0ID4gQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICk7XHJcblxyXG4gICAgY29uc3QgY29sb3IgPSBCVUlMRF9JVF9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpO1xyXG5cclxuICAgIGNvbnN0IGV4YW1wbGVTb2x1dGlvbiA9IGNyZWF0ZU1vbm9jaHJvbWVSZWN0YW5ndWxhclNvbHV0aW9uU3BlYyhcclxuICAgICAgTWF0aC5mbG9vciggKCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gd2lkdGggKSAvIDIgKSxcclxuICAgICAgTWF0aC5mbG9vciggKCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIGhlaWdodCApIC8gMiApLFxyXG4gICAgICB3aWR0aCxcclxuICAgICAgaGVpZ2h0LFxyXG4gICAgICBjb2xvclxyXG4gICAgKTtcclxuICAgIHJldHVybiBBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UuY3JlYXRlQnVpbGRBcmVhQW5kUGVyaW1ldGVyQ2hhbGxlbmdlKCB3aWR0aCAqIGhlaWdodCxcclxuICAgICAgMiAqIHdpZHRoICsgMiAqIGhlaWdodCwgY3JlYXRlQmFzaWNSZWN0YW5nbGVzU2hhcGVLaXQoIGNvbG9yICksIGV4YW1wbGVTb2x1dGlvbiApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVSZWN0YW5ndWxhckZpbmRBcmVhQ2hhbGxlbmdlKCkge1xyXG4gICAgbGV0IHdpZHRoO1xyXG4gICAgbGV0IGhlaWdodDtcclxuICAgIGRvIHtcclxuICAgICAgd2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDIsIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSA0ICk7XHJcbiAgICAgIGhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMiwgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSA0ICk7XHJcbiAgICB9IHdoaWxlICggd2lkdGggKiBoZWlnaHQgPCAxNiB8fCB3aWR0aCAqIGhlaWdodCA+IDM2ICk7XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IGNyZWF0ZVJlY3Rhbmd1bGFyUGVyaW1ldGVyU2hhcGUoIDAsIDAsIHdpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBoZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXHJcbiAgICAgIEZJTkRfVEhFX0FSRUFfQ09MT1JfQ0hPT1NFUi5uZXh0Q29sb3IoKSApO1xyXG5cclxuICAgIHJldHVybiBBcmVhQnVpbGRlckdhbWVDaGFsbGVuZ2UuY3JlYXRlRmluZEFyZWFDaGFsbGVuZ2UoIHBlcmltZXRlclNoYXBlLCBCQVNJQ19SRUNUQU5HTEVTX1NIQVBFX0tJVCApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVMU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UoKSB7XHJcbiAgICBsZXQgd2lkdGg7XHJcbiAgICBsZXQgaGVpZ2h0O1xyXG4gICAgZG8ge1xyXG4gICAgICB3aWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMiwgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIDQgKTtcclxuICAgICAgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDQgKTtcclxuICAgIH0gd2hpbGUgKCB3aWR0aCAqIGhlaWdodCA8IDE2IHx8IHdpZHRoICogaGVpZ2h0ID4gMzYgKTtcclxuICAgIGNvbnN0IG1pc3NpbmdXaWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgd2lkdGggLSAxICk7XHJcbiAgICBjb25zdCBtaXNzaW5nSGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBoZWlnaHQgLSAxICk7XHJcbiAgICBjb25zdCBtaXNzaW5nQ29ybmVyID0gcmFuZG9tRWxlbWVudCggWyAnbGVmdFRvcCcsICdyaWdodFRvcCcsICdsZWZ0Qm90dG9tJywgJ3JpZ2h0Qm90dG9tJyBdICk7XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IGNyZWF0ZUxTaGFwZWRQZXJpbWV0ZXJTaGFwZSggMCwgMCwgd2lkdGggKiBVTklUX1NRVUFSRV9MRU5HVEgsIGhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCxcclxuICAgICAgbWlzc2luZ0Nvcm5lciwgbWlzc2luZ1dpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBtaXNzaW5nSGVpZ2h0ICogVU5JVF9TUVVBUkVfTEVOR1RILCBGSU5EX1RIRV9BUkVBX0NPTE9SX0NIT09TRVIubmV4dENvbG9yKCkgKTtcclxuXHJcbiAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlKCBwZXJpbWV0ZXJTaGFwZSwgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlVVNoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlKCkge1xyXG4gICAgbGV0IHdpZHRoO1xyXG4gICAgbGV0IGhlaWdodDtcclxuICAgIGRvIHtcclxuICAgICAgd2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDQsIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSA0ICk7XHJcbiAgICAgIGhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggNCwgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICk7XHJcbiAgICB9IHdoaWxlICggd2lkdGggKiBoZWlnaHQgPCAxNiB8fCB3aWR0aCAqIGhlaWdodCA+IDM2ICk7XHJcbiAgICBjb25zdCBzaWRlV2l0aEN1dG91dCA9IHJhbmRvbUVsZW1lbnQoIFsgJ2xlZnQnLCAncmlnaHQnLCAndG9wJywgJ2JvdHRvbScgXSApO1xyXG4gICAgbGV0IGN1dG91dFdpZHRoO1xyXG4gICAgbGV0IGN1dG91dEhlaWdodDtcclxuICAgIGxldCBjdXRvdXRPZmZzZXQ7XHJcbiAgICBpZiAoIHNpZGVXaXRoQ3V0b3V0ID09PSAnbGVmdCcgfHwgc2lkZVdpdGhDdXRvdXQgPT09ICdyaWdodCcgKSB7XHJcbiAgICAgIGN1dG91dFdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCB3aWR0aCAtIDEgKTtcclxuICAgICAgY3V0b3V0SGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBoZWlnaHQgLSAyICk7XHJcbiAgICAgIGN1dG91dE9mZnNldCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgaGVpZ2h0IC0gY3V0b3V0SGVpZ2h0IC0gMSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGN1dG91dFdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCB3aWR0aCAtIDIgKTtcclxuICAgICAgY3V0b3V0SGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCBoZWlnaHQgLSAxICk7XHJcbiAgICAgIGN1dG91dE9mZnNldCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgd2lkdGggLSBjdXRvdXRXaWR0aCAtIDEgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHBlcmltZXRlclNoYXBlID0gY3JlYXRlVVNoYXBlZFBlcmltZXRlclNoYXBlKCAwLCAwLCB3aWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaGVpZ2h0ICogVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICBzaWRlV2l0aEN1dG91dCwgY3V0b3V0V2lkdGggKiBVTklUX1NRVUFSRV9MRU5HVEgsIGN1dG91dEhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCxcclxuICAgICAgY3V0b3V0T2Zmc2V0ICogVU5JVF9TUVVBUkVfTEVOR1RILCBGSU5EX1RIRV9BUkVBX0NPTE9SX0NIT09TRVIubmV4dENvbG9yKCkgKTtcclxuXHJcbiAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlKCBwZXJpbWV0ZXJTaGFwZSwgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlT1NoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlKCkge1xyXG4gICAgbGV0IHdpZHRoO1xyXG4gICAgbGV0IGhlaWdodDtcclxuICAgIGRvIHtcclxuICAgICAgd2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDMsIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSA0ICk7XHJcbiAgICAgIGhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMywgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICk7XHJcbiAgICB9IHdoaWxlICggd2lkdGggKiBoZWlnaHQgPCAxNiB8fCB3aWR0aCAqIGhlaWdodCA+IDM2ICk7XHJcbiAgICBjb25zdCBob2xlV2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIHdpZHRoIC0gMiApO1xyXG4gICAgY29uc3QgaG9sZUhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgaGVpZ2h0IC0gMiApO1xyXG4gICAgY29uc3QgaG9sZVhPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIHdpZHRoIC0gaG9sZVdpZHRoIC0gMSApO1xyXG4gICAgY29uc3QgaG9sZVlPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIGhlaWdodCAtIGhvbGVIZWlnaHQgLSAxICk7XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IGNyZWF0ZVBlcmltZXRlclNoYXBlV2l0aEhvbGUoIDAsIDAsIHdpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBoZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXHJcbiAgICAgIGhvbGVXaWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaG9sZUhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaG9sZVhPZmZzZXQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXHJcbiAgICAgIGhvbGVZT2Zmc2V0ICogVU5JVF9TUVVBUkVfTEVOR1RILCBGSU5EX1RIRV9BUkVBX0NPTE9SX0NIT09TRVIubmV4dENvbG9yKCkgKTtcclxuXHJcbiAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlKCBwZXJpbWV0ZXJTaGFwZSwgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlSXNvc2NlbGVzUmlnaHRUcmlhbmdsZVNsYW50ZWRIeXBvdGVudXNlRmluZEFyZWFDaGFsbGVuZ2UoKSB7XHJcbiAgICBjb25zdCBjb3JuZXJQb3NpdGlvbiA9IHJhbmRvbUVsZW1lbnQoIFsgJ2xlZnRUb3AnLCAncmlnaHRUb3AnLCAncmlnaHRCb3R0b20nLCAnbGVmdEJvdHRvbScgXSApO1xyXG4gICAgbGV0IGVkZ2VMZW5ndGggPSAwO1xyXG4gICAgZG8ge1xyXG4gICAgICBlZGdlTGVuZ3RoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCA0LCBNYXRoLm1pbiggQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIDIsXHJcbiAgICAgICAgQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSAyICkgKTtcclxuICAgIH0gd2hpbGUgKCBlZGdlTGVuZ3RoICUgMiAhPT0gMCApO1xyXG4gICAgY29uc3QgcGVyaW1ldGVyU2hhcGUgPSBjcmVhdGVQZXJpbWV0ZXJTaGFwZVNsYW50ZWRIeXBvdGVudXNlUmlnaHRJc29zY2VsZXNUcmlhbmdsZSggMCwgMCxcclxuICAgICAgZWRnZUxlbmd0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgY29ybmVyUG9zaXRpb24sIEZJTkRfVEhFX0FSRUFfQ09MT1JfQ0hPT1NFUi5uZXh0Q29sb3IoKSApO1xyXG4gICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSggcGVyaW1ldGVyU2hhcGUsIFJFQ1RBTkdMRVNfQU5EX1RSSUFOR0xFU19TSEFQRV9LSVQgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlSXNvc2NlbGVzUmlnaHRUcmlhbmdsZUxldmVsSHlwb3RlbnVzZUZpbmRBcmVhQ2hhbGxlbmdlKCkge1xyXG4gICAgY29uc3QgY29ybmVyUG9zaXRpb24gPSByYW5kb21FbGVtZW50KCBbICdjZW50ZXJUb3AnLCAncmlnaHRDZW50ZXInLCAnY2VudGVyQm90dG9tJywgJ2xlZnRDZW50ZXInIF0gKTtcclxuICAgIGxldCBoeXBvdGVudXNlTGVuZ3RoID0gMDtcclxuICAgIGxldCBtYXhIeXBvdGVudXNlO1xyXG4gICAgaWYgKCBjb3JuZXJQb3NpdGlvbiA9PT0gJ2NlbnRlclRvcCcgfHwgY29ybmVyUG9zaXRpb24gPT09ICdjZW50ZXJCb3R0b20nICkge1xyXG4gICAgICBtYXhIeXBvdGVudXNlID0gQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIDQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbWF4SHlwb3RlbnVzZSA9IEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gMjtcclxuICAgIH1cclxuICAgIGRvIHtcclxuICAgICAgaHlwb3RlbnVzZUxlbmd0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMiwgbWF4SHlwb3RlbnVzZSApO1xyXG4gICAgfSB3aGlsZSAoIGh5cG90ZW51c2VMZW5ndGggJSAyICE9PSAwICk7XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IGNyZWF0ZVBlcmltZXRlclNoYXBlTGV2ZWxIeXBvdGVudXNlUmlnaHRJc29zY2VsZXNUcmlhbmdsZSggMCwgMCxcclxuICAgICAgaHlwb3RlbnVzZUxlbmd0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgY29ybmVyUG9zaXRpb24sIEZJTkRfVEhFX0FSRUFfQ09MT1JfQ0hPT1NFUi5uZXh0Q29sb3IoKSApO1xyXG4gICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSggcGVyaW1ldGVyU2hhcGUsIFJFQ1RBTkdMRVNfQU5EX1RSSUFOR0xFU19TSEFQRV9LSVQgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlTGFyZ2VSZWN0V2l0aENoaXBNaXNzaW5nQ2hhbGxlbmdlKCkge1xyXG4gICAgY29uc3Qgd2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSA0LCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gMiApO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDMsIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gMiApO1xyXG4gICAgY29uc3Qgc2lkZVdpdGhDdXRvdXQgPSByYW5kb21FbGVtZW50KCBbICdsZWZ0JywgJ3JpZ2h0JywgJ3RvcCcsICdib3R0b20nIF0gKTtcclxuICAgIGxldCBjdXRvdXRXaWR0aDtcclxuICAgIGxldCBjdXRvdXRIZWlnaHQ7XHJcbiAgICBsZXQgY3V0b3V0T2Zmc2V0O1xyXG4gICAgaWYgKCBzaWRlV2l0aEN1dG91dCA9PT0gJ2xlZnQnIHx8IHNpZGVXaXRoQ3V0b3V0ID09PSAncmlnaHQnICkge1xyXG4gICAgICBjdXRvdXRXaWR0aCA9IDE7XHJcbiAgICAgIGN1dG91dEhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgMyApO1xyXG4gICAgICBjdXRvdXRPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIGhlaWdodCAtIGN1dG91dEhlaWdodCAtIDEgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjdXRvdXRXaWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgMyApO1xyXG4gICAgICBjdXRvdXRIZWlnaHQgPSAxO1xyXG4gICAgICBjdXRvdXRPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIHdpZHRoIC0gY3V0b3V0V2lkdGggLSAxICk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IGNyZWF0ZVVTaGFwZWRQZXJpbWV0ZXJTaGFwZSggMCwgMCwgd2lkdGggKiBVTklUX1NRVUFSRV9MRU5HVEgsIGhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCxcclxuICAgICAgc2lkZVdpdGhDdXRvdXQsIGN1dG91dFdpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBjdXRvdXRIZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXHJcbiAgICAgIGN1dG91dE9mZnNldCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgRklORF9USEVfQVJFQV9DT0xPUl9DSE9PU0VSLm5leHRDb2xvcigpICk7XHJcblxyXG4gICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVGaW5kQXJlYUNoYWxsZW5nZSggcGVyaW1ldGVyU2hhcGUsIEJBU0lDX1JFQ1RBTkdMRVNfU0hBUEVfS0lUICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5lcmF0ZUxhcmdlUmVjdFdpdGhTbWFsbEhvbGVNaXNzaW5nQ2hhbGxlbmdlKCkge1xyXG4gICAgY29uc3Qgd2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfV0lEVEggLSA0LCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gMiApO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDMsIEFyZWFCdWlsZGVyR2FtZU1vZGVsLlNIQVBFX0JPQVJEX1VOSVRfSEVJR0hUIC0gMiApO1xyXG4gICAgbGV0IGhvbGVXaWR0aDtcclxuICAgIGxldCBob2xlSGVpZ2h0O1xyXG4gICAgaWYgKCByYW5kb20ubmV4dERvdWJsZSgpIDwgMC41ICkge1xyXG4gICAgICBob2xlV2lkdGggPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIDMgKTtcclxuICAgICAgaG9sZUhlaWdodCA9IDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaG9sZUhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMSwgMyApO1xyXG4gICAgICBob2xlV2lkdGggPSAxO1xyXG4gICAgfVxyXG4gICAgY29uc3QgaG9sZVhPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIHdpZHRoIC0gaG9sZVdpZHRoIC0gMSApO1xyXG4gICAgY29uc3QgaG9sZVlPZmZzZXQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIGhlaWdodCAtIGhvbGVIZWlnaHQgLSAxICk7XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IGNyZWF0ZVBlcmltZXRlclNoYXBlV2l0aEhvbGUoIDAsIDAsIHdpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILCBoZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXHJcbiAgICAgIGhvbGVXaWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaG9sZUhlaWdodCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgaG9sZVhPZmZzZXQgKiBVTklUX1NRVUFSRV9MRU5HVEgsXHJcbiAgICAgIGhvbGVZT2Zmc2V0ICogVU5JVF9TUVVBUkVfTEVOR1RILCBGSU5EX1RIRV9BUkVBX0NPTE9SX0NIT09TRVIubmV4dENvbG9yKCkgKTtcclxuXHJcbiAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlKCBwZXJpbWV0ZXJTaGFwZSwgQkFTSUNfUkVDVEFOR0xFU19TSEFQRV9LSVQgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlTGFyZ2VSZWN0V2l0aFBpZWNlTWlzc2luZ0NoYWxsZW5nZSgpIHtcclxuICAgIHJldHVybiByYW5kb20ubmV4dERvdWJsZSgpIDwgMC43ID8gZ2VuZXJhdGVMYXJnZVJlY3RXaXRoQ2hpcE1pc3NpbmdDaGFsbGVuZ2UoKSA6IGdlbmVyYXRlTGFyZ2VSZWN0V2l0aFNtYWxsSG9sZU1pc3NpbmdDaGFsbGVuZ2UoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdlbmVyYXRlU2hhcGVXaXRoRGlhZ29uYWxGaW5kQXJlYUNoYWxsZW5nZSgpIHtcclxuICAgIGNvbnN0IHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAzLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX1dJRFRIIC0gNCApO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAzLCBBcmVhQnVpbGRlckdhbWVNb2RlbC5TSEFQRV9CT0FSRF9VTklUX0hFSUdIVCAtIDQgKTtcclxuICAgIGNvbnN0IGRpYWdvbmFsUG9zaXRpb24gPSByYW5kb21FbGVtZW50KCBbICdsZWZ0VG9wJywgJ3JpZ2h0VG9wJywgJ2xlZnRCb3R0b20nLCAncmlnaHRCb3R0b20nIF0gKTtcclxuICAgIGxldCBkaWFnb25hbFNxdWFyZUxlbmd0aCA9IDI7XHJcbiAgICBpZiAoIGhlaWdodCA+IDQgJiYgd2lkdGggPiA0ICYmIHJhbmRvbS5uZXh0RG91YmxlKCkgPiAwLjUgKSB7XHJcbiAgICAgIGRpYWdvbmFsU3F1YXJlTGVuZ3RoID0gNDtcclxuICAgIH1cclxuICAgIGNvbnN0IGN1dFdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCB3aWR0aCAtIGRpYWdvbmFsU3F1YXJlTGVuZ3RoICk7XHJcbiAgICBjb25zdCBjdXRIZWlnaHQgPSByYW5kb20ubmV4dEludEJldHdlZW4oIDEsIGhlaWdodCAtIGRpYWdvbmFsU3F1YXJlTGVuZ3RoICk7XHJcblxyXG4gICAgY29uc3QgcGVyaW1ldGVyU2hhcGUgPSBjcmVhdGVTaGFwZVdpdGhEaWFnb25hbEFuZE1pc3NpbmdDb3JuZXIoIDAsIDAsIHdpZHRoICogVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICBoZWlnaHQgKiBVTklUX1NRVUFSRV9MRU5HVEgsIGRpYWdvbmFsUG9zaXRpb24sIGRpYWdvbmFsU3F1YXJlTGVuZ3RoICogVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICBjdXRXaWR0aCAqIFVOSVRfU1FVQVJFX0xFTkdUSCwgY3V0SGVpZ2h0ICogVU5JVF9TUVVBUkVfTEVOR1RILCBGSU5EX1RIRV9BUkVBX0NPTE9SX0NIT09TRVIubmV4dENvbG9yKCkgKTtcclxuXHJcbiAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZUZpbmRBcmVhQ2hhbGxlbmdlKCBwZXJpbWV0ZXJTaGFwZSwgUkVDVEFOR0xFU19BTkRfVFJJQU5HTEVTX1NIQVBFX0tJVCApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVFYXN5UHJvcG9ydGlvbmFsQnVpbGRBcmVhQ2hhbGxlbmdlKCkge1xyXG4gICAgcmV0dXJuIGdlbmVyYXRlUHJvcG9ydGlvbmFsQnVpbGRBcmVhQ2hhbGxlbmdlKCAnZWFzeScsIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5lcmF0ZUhhcmRlclByb3BvcnRpb25hbEJ1aWxkQXJlYUNoYWxsZW5nZSgpIHtcclxuICAgIHJldHVybiBnZW5lcmF0ZVByb3BvcnRpb25hbEJ1aWxkQXJlYUNoYWxsZW5nZSggJ2hhcmRlcicsIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5lcmF0ZVByb3BvcnRpb25hbEJ1aWxkQXJlYUNoYWxsZW5nZSggZGlmZmljdWx0eSwgaW5jbHVkZVBlcmltZXRlciApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRpZmZpY3VsdHkgPT09ICdlYXN5JyB8fCBkaWZmaWN1bHR5ID09PSAnaGFyZGVyJyApO1xyXG4gICAgbGV0IHdpZHRoO1xyXG4gICAgbGV0IGhlaWdodDtcclxuXHJcbiAgICAvLyBSYW5kb21seSBnZW5lcmF0ZSB3aWR0aCwgaGVpZ2h0LCBhbmQgdGhlIHBvc3NpYmxlIGZhY3RvcnMgZnJvbSB3aGljaCBhIHByb3BvcnRpb25hbCBjaGFsbGVuZ2UgY2FuIGJlIGNyZWF0ZWQuXHJcbiAgICBjb25zdCBmYWN0b3JzID0gW107XHJcbiAgICBkbyB7XHJcbiAgICAgIGhlaWdodCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggMywgNiApO1xyXG4gICAgICBpZiAoIGhlaWdodCA9PT0gMyApIHtcclxuICAgICAgICB3aWR0aCA9IHJhbmRvbS5uZXh0SW50QmV0d2VlbiggNCwgOCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHdpZHRoID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAyLCAxMCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtaW5GYWN0b3IgPSBkaWZmaWN1bHR5ID09PSAnZWFzeScgPyAyIDogNTtcclxuICAgICAgY29uc3QgbWF4RmFjdG9yID0gZGlmZmljdWx0eSA9PT0gJ2Vhc3knID8gNCA6IDk7XHJcblxyXG4gICAgICBjb25zdCBhcmVhID0gd2lkdGggKiBoZWlnaHQ7XHJcbiAgICAgIGZvciAoIGxldCBpID0gbWluRmFjdG9yOyBpIDw9IG1heEZhY3RvcjsgaSsrICkge1xyXG4gICAgICAgIGlmICggYXJlYSAlIGkgPT09IDAgKSB7XHJcbiAgICAgICAgICAvLyBUaGlzIGlzIGEgZmFjdG9yIG9mIHRoZSBhcmVhLlxyXG4gICAgICAgICAgZmFjdG9ycy5wdXNoKCBpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IHdoaWxlICggZmFjdG9ycy5sZW5ndGggPT09IDAgKTtcclxuXHJcbiAgICAvLyBDaG9vc2UgdGhlIGZyYWN0aW9uYWwgcHJvcG9ydGlvbi5cclxuICAgIGNvbnN0IGZyYWN0aW9uRGVub21pbmF0b3IgPSByYW5kb21FbGVtZW50KCBmYWN0b3JzICk7XHJcbiAgICBsZXQgY29sb3IxRnJhY3Rpb25OdW1lcmF0b3I7XHJcbiAgICBkbyB7XHJcbiAgICAgIGNvbG9yMUZyYWN0aW9uTnVtZXJhdG9yID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBmcmFjdGlvbkRlbm9taW5hdG9yIC0gMSApO1xyXG4gICAgfSB3aGlsZSAoIFV0aWxzLmdjZCggY29sb3IxRnJhY3Rpb25OdW1lcmF0b3IsIGZyYWN0aW9uRGVub21pbmF0b3IgKSA+IDEgKTtcclxuICAgIGNvbnN0IGNvbG9yMUZyYWN0aW9uID0gbmV3IEZyYWN0aW9uKCBjb2xvcjFGcmFjdGlvbk51bWVyYXRvciwgZnJhY3Rpb25EZW5vbWluYXRvciApO1xyXG5cclxuICAgIC8vIENob29zZSB0aGUgY29sb3JzIGZvciB0aGlzIGNoYWxsZW5nZVxyXG4gICAgY29uc3QgY29sb3JQYWlyID0gQ09MT1JfUEFJUl9DSE9PU0VSLm5leHRDb2xvclBhaXIoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGV4YW1wbGUgc29sdXRpb25cclxuICAgIGNvbnN0IGV4YW1wbGVTb2x1dGlvbiA9IGNyZWF0ZVR3b0NvbG9yUmVjdGFuZ3VsYXJTb2x1dGlvblNwZWMoXHJcbiAgICAgIE1hdGguZmxvb3IoICggQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9XSURUSCAtIHdpZHRoICkgLyAyICksXHJcbiAgICAgIE1hdGguZmxvb3IoICggQXJlYUJ1aWxkZXJHYW1lTW9kZWwuU0hBUEVfQk9BUkRfVU5JVF9IRUlHSFQgLSBoZWlnaHQgKSAvIDIgKSxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodCxcclxuICAgICAgY29sb3JQYWlyLmNvbG9yMSxcclxuICAgICAgY29sb3JQYWlyLmNvbG9yMixcclxuICAgICAgY29sb3IxRnJhY3Rpb24uZ2V0VmFsdWUoKVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCB1c2VyU2hhcGVzID0gY3JlYXRlVHdvVG9uZVJlY3RhbmdsZUJ1aWxkS2l0KCBjb2xvclBhaXIuY29sb3IxLCBjb2xvclBhaXIuY29sb3IyICk7XHJcblxyXG4gICAgLy8gQnVpbGQgdGhlIGNoYWxsZW5nZSBmcm9tIGFsbCB0aGUgcGllY2VzLlxyXG4gICAgaWYgKCBpbmNsdWRlUGVyaW1ldGVyICkge1xyXG4gICAgICByZXR1cm4gQXJlYUJ1aWxkZXJHYW1lQ2hhbGxlbmdlLmNyZWF0ZVR3b1RvbmVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UoIHdpZHRoICogaGVpZ2h0LFxyXG4gICAgICAgICggMiAqIHdpZHRoICsgMiAqIGhlaWdodCApLCBjb2xvclBhaXIuY29sb3IxLCBjb2xvclBhaXIuY29sb3IyLCBjb2xvcjFGcmFjdGlvbiwgdXNlclNoYXBlcywgZXhhbXBsZVNvbHV0aW9uICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIEFyZWFCdWlsZGVyR2FtZUNoYWxsZW5nZS5jcmVhdGVUd29Ub25lQnVpbGRBcmVhQ2hhbGxlbmdlKCB3aWR0aCAqIGhlaWdodCwgY29sb3JQYWlyLmNvbG9yMSxcclxuICAgICAgICBjb2xvclBhaXIuY29sb3IyLCBjb2xvcjFGcmFjdGlvbiwgdXNlclNoYXBlcywgZXhhbXBsZVNvbHV0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZW5lcmF0ZUVhc3lQcm9wb3J0aW9uYWxCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UoKSB7XHJcbiAgICByZXR1cm4gZ2VuZXJhdGVQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UoICdlYXN5JywgdHJ1ZSApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVIYXJkZXJQcm9wb3J0aW9uYWxCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UoKSB7XHJcbiAgICByZXR1cm4gZ2VuZXJhdGVQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UoICdoYXJkZXInLCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGFsbGVuZ2UgaGlzdG9yeSwgdXNlZCB0byBtYWtlIHN1cmUgdW5pcXVlIGNoYWxsZW5nZXMgYXJlIGdlbmVyYXRlZC5cclxuICBsZXQgY2hhbGxlbmdlSGlzdG9yeSA9IFtdO1xyXG5cclxuICAvLyBVc2UgdGhlIHByb3ZpZGVkIGdlbmVyYXRpb24gZnVuY3Rpb24gdG8gY3JlYXRlIGNoYWxsZW5nZXMgdW50aWwgYSB1bmlxdWUgb25lIGhhcyBiZWVuIGNyZWF0ZWQuXHJcbiAgZnVuY3Rpb24gZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRpb25GdW5jdGlvbiApIHtcclxuICAgIGxldCBjaGFsbGVuZ2U7XHJcbiAgICBsZXQgdW5pcXVlQ2hhbGxlbmdlR2VuZXJhdGVkID0gZmFsc2U7XHJcbiAgICBsZXQgYXR0ZW1wdHMgPSAwO1xyXG4gICAgd2hpbGUgKCAhdW5pcXVlQ2hhbGxlbmdlR2VuZXJhdGVkICkge1xyXG4gICAgICBjaGFsbGVuZ2UgPSBnZW5lcmF0aW9uRnVuY3Rpb24oKTtcclxuICAgICAgYXR0ZW1wdHMrKztcclxuICAgICAgdW5pcXVlQ2hhbGxlbmdlR2VuZXJhdGVkID0gaXNDaGFsbGVuZ2VVbmlxdWUoIGNoYWxsZW5nZSApO1xyXG4gICAgICBpZiAoIGF0dGVtcHRzID4gMTIgJiYgIXVuaXF1ZUNoYWxsZW5nZUdlbmVyYXRlZCApIHtcclxuICAgICAgICAvLyBSZW1vdmUgdGhlIG9sZGVzdCBoYWxmIG9mIGNoYWxsZW5nZXMuXHJcbiAgICAgICAgY2hhbGxlbmdlSGlzdG9yeSA9IGNoYWxsZW5nZUhpc3Rvcnkuc2xpY2UoIDAsIGNoYWxsZW5nZUhpc3RvcnkubGVuZ3RoIC8gMiApO1xyXG4gICAgICAgIGF0dGVtcHRzID0gMDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNoYWxsZW5nZUhpc3RvcnkucHVzaCggY2hhbGxlbmdlICk7XHJcbiAgICByZXR1cm4gY2hhbGxlbmdlO1xyXG4gIH1cclxuXHJcbiAgLy8gTGV2ZWwgNCBpcyByZXF1aXJlZCB0byBsaW1pdCB0aGUgbnVtYmVyIG9mIHNoYXBlcyBhdmFpbGFibGUsIHRvIG9ubHkgYWxsb3cgdW5pdCBzcXVhcmVzLCBhbmQgdG8gaGF2ZSBub3QgZ3JpZFxyXG4gIC8vIGNvbnRyb2wuICBUaGlzIGZ1bmN0aW9uIG1vZGlmaWVzIHRoZSBjaGFsbGVuZ2VzIHRvIGNvbmZvcm0gdG8gdGhpcy5cclxuICBmdW5jdGlvbiBtYWtlTGV2ZWw0U3BlY2lmaWNNb2RpZmljYXRpb25zKCBjaGFsbGVuZ2UgKSB7XHJcbiAgICBjaGFsbGVuZ2UudG9vbFNwZWMuZ3JpZENvbnRyb2wgPSBmYWxzZTtcclxuICAgIGNoYWxsZW5nZS51c2VyU2hhcGVzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgc2hhcGU6IFVOSVRfU1FVQVJFX1NIQVBFLFxyXG4gICAgICAgIGNvbG9yOiBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUlxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIC8vIExpbWl0IHRoZSBudW1iZXIgb2Ygc2hhcGVzIHRvIHRoZSBsZW5ndGggb2YgdGhlIGxhcmdlciBzaWRlLiAgVGhpcyBlbmNvdXJhZ2VzIGNlcnRhaW4gc3RyYXRlZ2llcy5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNoYWxsZW5nZS5iYWNrZ3JvdW5kU2hhcGUuZXh0ZXJpb3JQZXJpbWV0ZXJzLmxlbmd0aCA9PT0gMSwgJ1VuZXhwZWN0ZWQgY29uZmlndXJhdGlvbiBmb3IgYmFja2dyb3VuZCBzaGFwZS4nICk7XHJcbiAgICBjb25zdCBwZXJpbWV0ZXJTaGFwZSA9IG5ldyBQZXJpbWV0ZXJTaGFwZSggY2hhbGxlbmdlLmJhY2tncm91bmRTaGFwZS5leHRlcmlvclBlcmltZXRlcnMsIFtdLCBVTklUX1NRVUFSRV9MRU5HVEggKTtcclxuICAgIGNoYWxsZW5nZS51c2VyU2hhcGVzWyAwIF0uY3JlYXRpb25MaW1pdCA9IE1hdGgubWF4KCBwZXJpbWV0ZXJTaGFwZS5nZXRXaWR0aCgpIC8gVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICBwZXJpbWV0ZXJTaGFwZS5nZXRIZWlnaHQoKSAvIFVOSVRfU1FVQVJFX0xFTkdUSCApO1xyXG4gICAgcmV0dXJuIGNoYWxsZW5nZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgc2V0IG9mIGNoYWxsZW5nZXMgZm9yIHRoZSBnaXZlbiBnYW1lIGxldmVsLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSBsZXZlbFxyXG4gICAqIEBwYXJhbSBudW1DaGFsbGVuZ2VzXHJcbiAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAqL1xyXG4gIHRoaXMuZ2VuZXJhdGVDaGFsbGVuZ2VTZXQgPSAoIGxldmVsLCBudW1DaGFsbGVuZ2VzICkgPT4ge1xyXG4gICAgbGV0IGNoYWxsZW5nZVNldCA9IFtdO1xyXG4gICAgbGV0IHRlbXBDaGFsbGVuZ2U7XHJcbiAgICBsZXQgdHJpYW5nbGVDaGFsbGVuZ2VzO1xyXG4gICAgc3dpdGNoKCBsZXZlbCApIHtcclxuICAgICAgY2FzZSAwOlxyXG4gICAgICAgIF8udGltZXMoIDMsICgpID0+IHsgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZUJ1aWxkQXJlYUNoYWxsZW5nZSApICk7IH0gKTtcclxuICAgICAgICBfLnRpbWVzKCAyLCAoKSA9PiB7IGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVSZWN0YW5ndWxhckZpbmRBcmVhQ2hhbGxlbmdlICkgKTsgfSApO1xyXG4gICAgICAgIGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVMU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UgKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIF8udGltZXMoIDMsICgpID0+IHsgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZUJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSApICk7IH0gKTtcclxuICAgICAgICBfLnRpbWVzKCAzLCAoKSA9PiB7IGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVUd29SZWN0YW5nbGVCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UgKSApOyB9ICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZVVTaGFwZWRGaW5kQXJlYUNoYWxsZW5nZSApICk7XHJcbiAgICAgICAgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZU9TaGFwZWRGaW5kQXJlYUNoYWxsZW5nZSApICk7XHJcbiAgICAgICAgY2hhbGxlbmdlU2V0LnB1c2goIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZVNoYXBlV2l0aERpYWdvbmFsRmluZEFyZWFDaGFsbGVuZ2UgKSApO1xyXG4gICAgICAgIGNoYWxsZW5nZVNldCA9IHJhbmRvbS5zaHVmZmxlKCBjaGFsbGVuZ2VTZXQgKTtcclxuICAgICAgICB0cmlhbmdsZUNoYWxsZW5nZXMgPSByYW5kb20uc2h1ZmZsZSggW1xyXG4gICAgICAgICAgZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlSXNvc2NlbGVzUmlnaHRUcmlhbmdsZUxldmVsSHlwb3RlbnVzZUZpbmRBcmVhQ2hhbGxlbmdlICksXHJcbiAgICAgICAgICBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVJc29zY2VsZXNSaWdodFRyaWFuZ2xlU2xhbnRlZEh5cG90ZW51c2VGaW5kQXJlYUNoYWxsZW5nZSApXHJcbiAgICAgICAgXSApO1xyXG4gICAgICAgIHRyaWFuZ2xlQ2hhbGxlbmdlcy5mb3JFYWNoKCBjaGFsbGVuZ2UgPT4geyBjaGFsbGVuZ2VTZXQucHVzaCggY2hhbGxlbmdlICk7IH0gKTtcclxuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlTGFyZ2VSZWN0V2l0aFBpZWNlTWlzc2luZ0NoYWxsZW5nZSApICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgLy8gRm9yIHRoaXMgbGV2ZWwsIHRoZSBncmlkIGlzIGRpc2FibGVkIGZvciBhbGwgY2hhbGxlbmdlcyBhbmQgc29tZSBkaWZmZXJlbnQgYnVpbGQga2l0cyBhcmUgdXNlZC5cclxuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggbWFrZUxldmVsNFNwZWNpZmljTW9kaWZpY2F0aW9ucyggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlVVNoYXBlZEZpbmRBcmVhQ2hhbGxlbmdlICkgKSApO1xyXG4gICAgICAgIGNoYWxsZW5nZVNldC5wdXNoKCBtYWtlTGV2ZWw0U3BlY2lmaWNNb2RpZmljYXRpb25zKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVPU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UgKSApICk7XHJcbiAgICAgICAgY2hhbGxlbmdlU2V0LnB1c2goIG1ha2VMZXZlbDRTcGVjaWZpY01vZGlmaWNhdGlvbnMoIGdlbmVyYXRlVW5pcXVlQ2hhbGxlbmdlKCBnZW5lcmF0ZU9TaGFwZWRGaW5kQXJlYUNoYWxsZW5nZSApICkgKTtcclxuICAgICAgICBjaGFsbGVuZ2VTZXQucHVzaCggbWFrZUxldmVsNFNwZWNpZmljTW9kaWZpY2F0aW9ucyggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlU2hhcGVXaXRoRGlhZ29uYWxGaW5kQXJlYUNoYWxsZW5nZSApICkgKTtcclxuICAgICAgICBjaGFsbGVuZ2VTZXQgPSByYW5kb20uc2h1ZmZsZSggY2hhbGxlbmdlU2V0ICk7XHJcbiAgICAgICAgLy8gRm9yIHRoZSBuZXh0IGNoYWxsZW5nZSwgY2hvb3NlIHJhbmRvbWx5IGZyb20gdGhlIHNoYXBlcyB0aGF0IGRvbid0IGhhdmUgZGlhZ29uYWxzLlxyXG4gICAgICAgIHRlbXBDaGFsbGVuZ2UgPSBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggcmFuZG9tRWxlbWVudCggWyBnZW5lcmF0ZUxTaGFwZWRGaW5kQXJlYUNoYWxsZW5nZSwgZ2VuZXJhdGVVU2hhcGVkRmluZEFyZWFDaGFsbGVuZ2UgXSApICk7XHJcbiAgICAgICAgdGVtcENoYWxsZW5nZS50b29sU3BlYy5ncmlkQ29udHJvbCA9IGZhbHNlO1xyXG4gICAgICAgIHRlbXBDaGFsbGVuZ2UudXNlclNoYXBlcyA9IG51bGw7XHJcbiAgICAgICAgY2hhbGxlbmdlU2V0LnB1c2goIHRlbXBDaGFsbGVuZ2UgKTtcclxuICAgICAgICB0ZW1wQ2hhbGxlbmdlID0gZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlU2hhcGVXaXRoRGlhZ29uYWxGaW5kQXJlYUNoYWxsZW5nZSApO1xyXG4gICAgICAgIHRlbXBDaGFsbGVuZ2UudG9vbFNwZWMuZ3JpZENvbnRyb2wgPSBmYWxzZTtcclxuICAgICAgICB0ZW1wQ2hhbGxlbmdlLnVzZXJTaGFwZXMgPSBudWxsO1xyXG4gICAgICAgIGNoYWxsZW5nZVNldC5wdXNoKCB0ZW1wQ2hhbGxlbmdlICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDQ6XHJcbiAgICAgICAgXy50aW1lcyggMywgKCkgPT4geyBjaGFsbGVuZ2VTZXQucHVzaCggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlRWFzeVByb3BvcnRpb25hbEJ1aWxkQXJlYUNoYWxsZW5nZSApICk7IH0gKTtcclxuICAgICAgICBfLnRpbWVzKCAzLCAoKSA9PiB7IGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVIYXJkZXJQcm9wb3J0aW9uYWxCdWlsZEFyZWFDaGFsbGVuZ2UgKSApOyB9ICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIDU6XHJcbiAgICAgICAgXy50aW1lcyggMywgKCkgPT4geyBjaGFsbGVuZ2VTZXQucHVzaCggZ2VuZXJhdGVVbmlxdWVDaGFsbGVuZ2UoIGdlbmVyYXRlRWFzeVByb3BvcnRpb25hbEJ1aWxkQXJlYUFuZFBlcmltZXRlckNoYWxsZW5nZSApICk7IH0gKTtcclxuICAgICAgICBfLnRpbWVzKCAzLCAoKSA9PiB7IGNoYWxsZW5nZVNldC5wdXNoKCBnZW5lcmF0ZVVuaXF1ZUNoYWxsZW5nZSggZ2VuZXJhdGVIYXJkZXJQcm9wb3J0aW9uYWxCdWlsZEFyZWFBbmRQZXJpbWV0ZXJDaGFsbGVuZ2UgKSApOyB9ICk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYFVuc3VwcG9ydGVkIGdhbWUgbGV2ZWw6ICR7bGV2ZWx9YCApO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2hhbGxlbmdlU2V0Lmxlbmd0aCA9PT0gbnVtQ2hhbGxlbmdlcywgJ0Vycm9yOiBEaWRuXFwndCBnZW5lcmF0ZSBjb3JyZWN0IG51bWJlciBvZiBjaGFsbGVuZ2VzLicgKTtcclxuICAgIHJldHVybiBjaGFsbGVuZ2VTZXQ7XHJcbiAgfTtcclxufVxyXG5cclxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdBcmVhQnVpbGRlckNoYWxsZW5nZUZhY3RvcnknLCBBcmVhQnVpbGRlckNoYWxsZW5nZUZhY3RvcnkgKTtcclxuZXhwb3J0IGRlZmF1bHQgQXJlYUJ1aWxkZXJDaGFsbGVuZ2VGYWN0b3J5OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFT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