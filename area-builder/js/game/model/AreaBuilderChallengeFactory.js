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
  const UNIT_SQUARE_SHAPE = new Shape()
    .moveTo( 0, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH )
    .lineTo( 0, UNIT_SQUARE_LENGTH )
    .close()
    .makeImmutable();
  const HORIZONTAL_DOUBLE_SQUARE_SHAPE = new Shape()
    .moveTo( 0, 0 )
    .lineTo( UNIT_SQUARE_LENGTH * 2, 0 )
    .lineTo( UNIT_SQUARE_LENGTH * 2, UNIT_SQUARE_LENGTH )
    .lineTo( 0, UNIT_SQUARE_LENGTH )
    .close()
    .makeImmutable();
  const VERTICAL_DOUBLE_SQUARE_SHAPE = new Shape()
    .moveTo( 0, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH * 2 )
    .lineTo( 0, UNIT_SQUARE_LENGTH * 2 )
    .close()
    .makeImmutable();
  const QUAD_SQUARE_SHAPE = new Shape()
    .moveTo( 0, 0 )
    .lineTo( UNIT_SQUARE_LENGTH * 2, 0 )
    .lineTo( UNIT_SQUARE_LENGTH * 2, UNIT_SQUARE_LENGTH * 2 )
    .lineTo( 0, UNIT_SQUARE_LENGTH * 2 )
    .close()
    .makeImmutable();
  const RIGHT_BOTTOM_TRIANGLE_SHAPE = new Shape()
    .moveTo( UNIT_SQUARE_LENGTH, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH )
    .lineTo( 0, UNIT_SQUARE_LENGTH )
    .lineTo( UNIT_SQUARE_LENGTH, 0 )
    .close()
    .makeImmutable();
  const LEFT_BOTTOM_TRIANGLE_SHAPE = new Shape()
    .moveTo( 0, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH )
    .lineTo( 0, UNIT_SQUARE_LENGTH )
    .lineTo( 0, 0 )
    .close()
    .makeImmutable();
  const RIGHT_TOP_TRIANGLE_SHAPE = new Shape()
    .moveTo( 0, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH )
    .lineTo( 0, 0 )
    .close()
    .makeImmutable();
  const LEFT_TOP_TRIANGLE_SHAPE = new Shape()
    .moveTo( 0, 0 )
    .lineTo( UNIT_SQUARE_LENGTH, 0 )
    .lineTo( 0, UNIT_SQUARE_LENGTH )
    .lineTo( 0, 0 )
    .close()
    .makeImmutable();

  // Shape kit with a set of basic shapes and a default color.
  const BASIC_RECTANGLES_SHAPE_KIT = [
    {
      shape: UNIT_SQUARE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: HORIZONTAL_DOUBLE_SQUARE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: VERTICAL_DOUBLE_SQUARE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: QUAD_SQUARE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    }
  ];

  const RECTANGLES_AND_TRIANGLES_SHAPE_KIT = [
    {
      shape: HORIZONTAL_DOUBLE_SQUARE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: UNIT_SQUARE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: VERTICAL_DOUBLE_SQUARE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: LEFT_BOTTOM_TRIANGLE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: LEFT_TOP_TRIANGLE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: RIGHT_BOTTOM_TRIANGLE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    },
    {
      shape: RIGHT_TOP_TRIANGLE_SHAPE,
      color: AreaBuilderSharedConstants.GREENISH_COLOR
    }
  ];

  // Color chooser for selecting randomized colors for 'find the area' challenges.
  const FIND_THE_AREA_COLOR_CHOOSER = {
    colorList: random.shuffle( [
      new Color( AreaBuilderSharedConstants.PALE_BLUE_COLOR ),
      new Color( AreaBuilderSharedConstants.PINKISH_COLOR ),
      new Color( AreaBuilderSharedConstants.PURPLISH_COLOR ),
      new Color( AreaBuilderSharedConstants.ORANGISH_COLOR ),
      new Color( AreaBuilderSharedConstants.DARK_GREEN_COLOR )
    ] ),
    index: 0,
    nextColor: function() {
      if ( this.index >= this.colorList.length ) {
        // Time to shuffle the color list.  Make sure that when we do, the color that was at the end of the previous
        // list isn't at the beginning of this one, or we'll get two of the same colors in a row.
        const lastColor = this.colorList[ this.colorList.length - 1 ];
        do {
          this.colorList = random.shuffle( this.colorList );
        } while ( this.colorList[ 0 ] === lastColor );

        // Reset the index.
        this.index = 0;
      }
      return this.colorList[ this.index++ ];
    }
  };

  // Color chooser for selecting randomized colors for 'build it' style challenges.
  const BUILD_IT_COLOR_CHOOSER = {
    colorList: random.shuffle( [
      new Color( AreaBuilderSharedConstants.GREENISH_COLOR ),
      new Color( AreaBuilderSharedConstants.PINKISH_COLOR ),
      new Color( AreaBuilderSharedConstants.ORANGISH_COLOR ),
      new Color( AreaBuilderSharedConstants.PALE_BLUE_COLOR )
    ] ),
    index: 0,
    nextColor: function() {
      if ( this.index >= this.colorList.length ) {
        // Time to shuffle the color list.  Make sure that when we do, the color that was at the end of the previous
        // list isn't at the beginning of this one, or we'll get two of the same colors in a row.
        const lastColor = this.colorList[ this.colorList.length - 1 ];
        do {
          this.colorList = random.shuffle( this.colorList );
        } while ( this.colorList[ 0 ] === lastColor );

        // Reset the index.
        this.index = 0;
      }
      return this.colorList[ this.index++ ];
    }
  };

  // Color pair chooser, used for selecting randomized colors for two tone 'build it' challenges.
  const COLOR_PAIR_CHOOSER = {
    colorPairList: random.shuffle( [
      {
        color1: AreaBuilderSharedConstants.GREENISH_COLOR,
        color2: AreaBuilderSharedConstants.DARK_GREEN_COLOR
      },
      {
        color1: AreaBuilderSharedConstants.PURPLISH_COLOR,
        color2: AreaBuilderSharedConstants.DARK_PURPLE_COLOR
      },
      {
        color1: AreaBuilderSharedConstants.PALE_BLUE_COLOR,
        color2: AreaBuilderSharedConstants.DARK_BLUE_COLOR
      },
      {
        color1: AreaBuilderSharedConstants.PINKISH_COLOR,
        color2: AreaBuilderSharedConstants.PURPLE_PINK_COLOR
      }
    ] ),
    index: 0,
    nextColorPair: function() {
      if ( this.index >= this.colorPairList.length ) {
        // Time to shuffle the list.
        const lastColorPair = this.colorPairList[ this.colorPairList.length - 1 ];
        do {
          this.colorPairList = random.shuffle( this.colorPairList );
        } while ( this.colorPairList[ 0 ] === lastColorPair );

        // Reset the index.
        this.index = 0;
      }
      return this.colorPairList[ this.index++ ];
    }
  };

  // -------------- private functions ---------------------------

  // Select a random element from an array
  function randomElement( array ) {
    return array[ Math.floor( random.nextDouble() * array.length ) ];
  }

  // Create a solution spec (a.k.a. an example solution) that represents a rectangle with the specified origin and size.
  function createMonochromeRectangularSolutionSpec( x, y, width, height, color ) {
    const solutionSpec = [];
    for ( let column = 0; column < width; column++ ) {
      for ( let row = 0; row < height; row++ ) {
        solutionSpec.push( {
          cellColumn: column + x,
          cellRow: row + y,
          color: color
        } );
      }
    }
    return solutionSpec;
  }

  // Create a solution spec (a.k.a. an example solution) for a two-tone challenge
  function createTwoColorRectangularSolutionSpec( x, y, width, height, color1, color2, color1proportion ) {
    const solutionSpec = [];
    for ( let row = 0; row < height; row++ ) {
      for ( let column = 0; column < width; column++ ) {
        solutionSpec.push( {
          cellColumn: column + x,
          cellRow: row + y,
          color: ( row * width + column ) / ( width * height ) < color1proportion ? color1 : color2
        } );
      }
    }
    return solutionSpec;
  }

  // Function for creating a 'shape kit' of the basic shapes of the specified color.
  function createBasicRectanglesShapeKit( color ) {
    const kit = [];
    BASIC_RECTANGLES_SHAPE_KIT.forEach( kitElement => {
      kit.push( { shape: kitElement.shape, color: color } );
    } );
    return kit;
  }

  function createTwoToneRectangleBuildKit( color1, color2 ) {
    const kit = [];
    BASIC_RECTANGLES_SHAPE_KIT.forEach( kitElement => {
      const color1Element = {
        shape: kitElement.shape,
        color: color1
      };
      kit.push( color1Element );
      const color2Element = {
        shape: kitElement.shape,
        color: color2
      };
      kit.push( color2Element );
    } );
    return kit;
  }

  function flipPerimeterPointsHorizontally( perimeterPointList ) {
    const reflectedPoints = [];
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    perimeterPointList.forEach( point => {
      minX = Math.min( point.x, minX );
      maxX = Math.max( point.x, maxX );
    } );
    perimeterPointList.forEach( point => {
      reflectedPoints.push( new Vector2( -1 * ( point.x - minX - maxX ), point.y ) );
    } );
    return reflectedPoints;
  }

  function flipPerimeterPointsVertically( perimeterPointList ) {
    const reflectedPoints = [];
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    perimeterPointList.forEach( point => {
      minY = Math.min( point.y, minY );
      maxY = Math.max( point.y, maxY );
    } );
    perimeterPointList.forEach( point => {
      reflectedPoints.push( new Vector2( point.x, -1 * ( point.y - minY - maxY ) ) );
    } );
    return reflectedPoints;
  }

  function createRectangularPerimeterShape( x, y, width, height, fillColor ) {
    return new PerimeterShape(
      // Exterior perimeters
      [
        [
          new Vector2( x, y ),
          new Vector2( x + width, y ),
          new Vector2( x + width, y + height ),
          new Vector2( x, y + height )
        ]
      ],

      // Interior perimeters
      [],

      // Unit size
      UNIT_SQUARE_LENGTH,

      // color
      {
        fillColor: fillColor,
        edgeColor: fillColor.colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR )
      }
    );
  }

  function createLShapedPerimeterShape( x, y, width, height, missingCorner, widthMissing, heightMissing, fillColor ) {
    assert && assert( width > widthMissing && height > heightMissing, 'Invalid parameters' );

    let perimeterPoints = [
      new Vector2( x + widthMissing, y ),
      new Vector2( x + width, y ),
      new Vector2( x + width, y + height ),
      new Vector2( x, y + height ),
      new Vector2( x, y + heightMissing ),
      new Vector2( x + widthMissing, y + heightMissing )
    ];

    if ( missingCorner === 'rightTop' || missingCorner === 'rightBottom' ) {
      perimeterPoints = flipPerimeterPointsHorizontally( perimeterPoints );
    }
    if ( missingCorner === 'leftBottom' || missingCorner === 'rightBottom' ) {
      perimeterPoints = flipPerimeterPointsVertically( perimeterPoints );
    }

    return new PerimeterShape( [ perimeterPoints ], [], UNIT_SQUARE_LENGTH, {
        fillColor: fillColor,
        edgeColor: fillColor.colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR )
      }
    );
  }

  // Create a perimeter shape with a cutout in the top, bottom, left, or right side.
  function createUShapedPerimeterShape( x, y, width, height, sideWithCutout, cutoutWidth, cutoutHeight, cutoutOffset, fillColor ) {
    let perimeterPoints = [ new Vector2( 0, 0 ), new Vector2( 0, 0 ), new Vector2( 0, 0 ), new Vector2( 0, 0 ), new Vector2( 0, 0 ), new Vector2( 0, 0 ), new Vector2( 0, 0 ), new Vector2( 0, 0 ) ];

    if ( sideWithCutout === 'left' || sideWithCutout === 'right' ) {
      perimeterPoints[ 0 ].setXY( x, y );
      perimeterPoints[ 1 ].setXY( x + width, y );
      perimeterPoints[ 2 ].setXY( x + width, y + height );
      perimeterPoints[ 3 ].setXY( x, y + height );
      perimeterPoints[ 4 ].setXY( x, y + cutoutOffset + cutoutHeight );
      perimeterPoints[ 5 ].setXY( x + cutoutWidth, y + cutoutOffset + cutoutHeight );
      perimeterPoints[ 6 ].setXY( x + cutoutWidth, y + cutoutOffset );
      perimeterPoints[ 7 ].setXY( x, y + cutoutOffset );
      if ( sideWithCutout === 'right' ) {
        perimeterPoints = flipPerimeterPointsHorizontally( perimeterPoints );
      }
    }
    else {
      perimeterPoints[ 0 ].setXY( x, y );
      perimeterPoints[ 1 ].setXY( x + cutoutOffset, y );
      perimeterPoints[ 2 ].setXY( x + cutoutOffset, y + cutoutHeight );
      perimeterPoints[ 3 ].setXY( x + cutoutOffset + cutoutWidth, y + cutoutHeight );
      perimeterPoints[ 4 ].setXY( x + cutoutOffset + cutoutWidth, y );
      perimeterPoints[ 5 ].setXY( x + width, y );
      perimeterPoints[ 6 ].setXY( x + width, y + height );
      perimeterPoints[ 7 ].setXY( x, y + height );
      if ( sideWithCutout === 'bottom' ) {
        perimeterPoints = flipPerimeterPointsVertically( perimeterPoints );
      }
    }

    return new PerimeterShape( [ perimeterPoints ], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR )
    } );
  }

  function createPerimeterShapeWithHole( x, y, width, height, holeWidth, holeHeight, holeXOffset, holeYOffset, fillColor ) {
    const exteriorPerimeterPoints = [
      new Vector2( x, y ),
      new Vector2( x + width, y ),
      new Vector2( x + width, y + height ),
      new Vector2( x, y + height )
    ];
    const interiorPerimeterPoints = [
      // Have to draw hole in opposite direction for it to appear.
      new Vector2( x + holeXOffset, y + holeYOffset ),
      new Vector2( x + holeXOffset, y + holeYOffset + holeHeight ),
      new Vector2( x + holeXOffset + holeWidth, y + holeYOffset + holeHeight ),
      new Vector2( x + holeXOffset + holeWidth, y + holeYOffset )
    ];

    return new PerimeterShape( [ exteriorPerimeterPoints ], [ interiorPerimeterPoints ], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR )
    } );
  }

  function createPerimeterShapeSlantedHypotenuseRightIsoscelesTriangle( x, y, edgeLength, cornerPosition, fillColor ) {
    let perimeterPoints = [ new Vector2( x, y ), new Vector2( x + edgeLength, y ), new Vector2( x, y + edgeLength ) ];
    if ( cornerPosition === 'rightTop' || cornerPosition === 'rightBottom' ) {
      perimeterPoints = flipPerimeterPointsHorizontally( perimeterPoints );
    }
    if ( cornerPosition === 'leftBottom' || cornerPosition === 'rightBottom' ) {
      perimeterPoints = flipPerimeterPointsVertically( perimeterPoints );
    }

    return new PerimeterShape( [ perimeterPoints ], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR )
    } );
  }

  function createPerimeterShapeLevelHypotenuseRightIsoscelesTriangle( x, y, hypotenuseLength, cornerPosition, fillColor ) {
    let perimeterPoints;
    if ( cornerPosition === 'centerTop' || cornerPosition === 'centerBottom' ) {
      perimeterPoints = [ new Vector2( x, y ), new Vector2( x + hypotenuseLength, y ),
        new Vector2( x + hypotenuseLength / 2, y + hypotenuseLength / 2 ) ];
      if ( cornerPosition === 'centerBottom' ) {
        perimeterPoints = flipPerimeterPointsVertically( perimeterPoints );
      }
    }
    else {
      perimeterPoints = [ new Vector2( x, y ), new Vector2( x, y + hypotenuseLength ),
        new Vector2( x + hypotenuseLength / 2, y + hypotenuseLength / 2 ) ];
      if ( cornerPosition === 'centerLeft' ) {
        perimeterPoints = flipPerimeterPointsHorizontally( perimeterPoints );
      }
    }

    // Reflect as appropriate to create the specified orientation.
    if ( cornerPosition === 'centerTop' || cornerPosition === 'rightBottom' ) {
      perimeterPoints = flipPerimeterPointsHorizontally( perimeterPoints );
    }
    if ( cornerPosition === 'leftBottom' || cornerPosition === 'rightBottom' ) {
      perimeterPoints = flipPerimeterPointsVertically( perimeterPoints );
    }

    return new PerimeterShape( [ perimeterPoints ], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR )
    } );
  }

  function createShapeWithDiagonalAndMissingCorner( x, y, width, height, diagonalPosition, diagonalSquareLength, cutWidth, cutHeight, fillColor ) {
    assert && assert( width - diagonalSquareLength >= cutWidth && height - diagonalSquareLength >= cutHeight, 'Invalid parameters' );

    let perimeterPoints = [];
    // Draw shape with diagonal in lower right corner, starting in upper right corner.
    perimeterPoints.push( new Vector2( x + width, y ) );
    perimeterPoints.push( new Vector2( x + width, y + height - diagonalSquareLength ) );
    perimeterPoints.push( new Vector2( x + width - diagonalSquareLength, y + height ) );
    perimeterPoints.push( new Vector2( x, y + height ) );
    perimeterPoints.push( new Vector2( x, y + cutHeight ) );
    perimeterPoints.push( new Vector2( x + cutWidth, y + cutHeight ) );
    perimeterPoints.push( new Vector2( x + cutWidth, y ) );

    // Reflect shape as needed to meet the specified orientation.
    if ( diagonalPosition === 'leftTop' || diagonalPosition === 'leftBottom' ) {
      perimeterPoints = flipPerimeterPointsHorizontally( perimeterPoints );
    }
    if ( diagonalPosition === 'rightTop' || diagonalPosition === 'leftTop' ) {
      perimeterPoints = flipPerimeterPointsVertically( perimeterPoints );
    }

    return new PerimeterShape( [ perimeterPoints ], [], UNIT_SQUARE_LENGTH, {
      fillColor: fillColor,
      edgeColor: fillColor.colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR )
    } );
  }

  // Return a value that indicates whether two challenges are similar, used when generating challenges that are
  // distinct enough to keep the game interesting.
  function isChallengeSimilar( challenge1, challenge2 ) {
    if ( challenge1.buildSpec && challenge2.buildSpec ) {
      if ( challenge1.buildSpec.proportions && challenge2.buildSpec.proportions ) {
        if ( challenge1.buildSpec.proportions.color1Proportion.denominator === challenge2.buildSpec.proportions.color1Proportion.denominator ) {
          if ( challenge1.buildSpec.perimeter && challenge2.buildSpec.perimeter || !challenge1.buildSpec.perimeter && !challenge2.buildSpec.perimeter ) {
            return true;
          }
        }
      }
      else if ( !challenge1.buildSpec.proportions && !challenge1.buildSpec.proportions ) {
        if ( challenge1.buildSpec.area === challenge2.buildSpec.area ) {
          return true;
        }
      }
    }
    else {
      if ( challenge1.backgroundShape && challenge2.backgroundShape ) {
        if ( challenge1.backgroundShape.unitArea === challenge2.backgroundShape.unitArea ) {
          return true;
        }
      }
    }

    // If we got to here, the challenges are not similar.
    return false;
  }

  // Test the challenge against the history of recently generated challenges to see if it is unique.
  function isChallengeUnique( challenge ) {
    let challengeIsUnique = true;
    for ( let i = 0; i < challengeHistory.length; i++ ) {
      if ( isChallengeSimilar( challenge, challengeHistory[ i ] ) ) {
        challengeIsUnique = false;
        break;
      }
    }
    return challengeIsUnique;
  }

  function generateBuildAreaChallenge() {

    // Create a unique challenge
    const width = random.nextIntBetween( 2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2 );
    let height = 0;
    while ( width * height < 8 || width * height > 36 ) {
      height = random.nextIntBetween( 0, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2 );
    }
    const color = BUILD_IT_COLOR_CHOOSER.nextColor();
    const exampleSolution = createMonochromeRectangularSolutionSpec(
      Math.floor( ( AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width ) / 2 ),
      Math.floor( ( AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height ) / 2 ),
      width,
      height,
      color
    );
    const challenge = AreaBuilderGameChallenge.createBuildAreaChallenge( width * height, createBasicRectanglesShapeKit( color ), exampleSolution );
    return challenge;
  }

  /**
   * Generate a 'build it' area+perimeter challenge that consists of two connected rectangles.  See the design spec
   * for details.
   */
  function generateTwoRectangleBuildAreaAndPerimeterChallenge() {

    // Create first rectangle dimensions
    const width1 = random.nextIntBetween( 2, 6 );
    let height1;
    do {
      height1 = random.nextIntBetween( 1, 4 );
    } while ( width1 % 2 === height1 % 2 );

    // Create second rectangle dimensions
    let width2 = 0;
    do {
      width2 = random.nextIntBetween( 1, 6 );
    } while ( width1 + width2 > AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2 );
    let height2;
    do {
      height2 = random.nextIntBetween( 1, 6 );
    } while ( width2 % 2 === height2 % 2 || height1 + height2 > AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2 );

    // Choose the amount of overlap
    const overlap = random.nextIntBetween( 1, Math.min( width1, width2 ) - 1 );

    const left = Math.floor( ( AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - ( width1 + width2 - overlap ) ) / 2 );
    const top = Math.floor( ( AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - ( height1 + height2 ) ) / 2 );

    // Create a solution spec by merging specs for each of the rectangles together.
    const color = BUILD_IT_COLOR_CHOOSER.nextColor();
    const solutionSpec = createMonochromeRectangularSolutionSpec( left, top, width1, height1, color ).concat(
      createMonochromeRectangularSolutionSpec( left + width1 - overlap, top + height1, width2, height2, color ) );

    return ( AreaBuilderGameChallenge.createBuildAreaAndPerimeterChallenge( width1 * height1 + width2 * height2,
      2 * width1 + 2 * height1 + 2 * width2 + 2 * height2 - 2 * overlap, createBasicRectanglesShapeKit( color ), solutionSpec ) );
  }

  function generateBuildAreaAndPerimeterChallenge() {

    let width;
    let height;

    // Width can be any value from 3 to 8 excluding 7, see design doc.
    do {
      width = random.nextIntBetween( 3, 8 );
    } while ( width === 0 || width === 7 );

    // Choose the height based on the total area.
    do {
      height = random.nextIntBetween( 3, 8 );
    } while ( width * height < 12 || width * height > 36 || height === 7 || height > AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2 );

    const color = BUILD_IT_COLOR_CHOOSER.nextColor();

    const exampleSolution = createMonochromeRectangularSolutionSpec(
      Math.floor( ( AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width ) / 2 ),
      Math.floor( ( AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height ) / 2 ),
      width,
      height,
      color
    );
    return AreaBuilderGameChallenge.createBuildAreaAndPerimeterChallenge( width * height,
      2 * width + 2 * height, createBasicRectanglesShapeKit( color ), exampleSolution );
  }

  function generateRectangularFindAreaChallenge() {
    let width;
    let height;
    do {
      width = random.nextIntBetween( 2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4 );
      height = random.nextIntBetween( 2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4 );
    } while ( width * height < 16 || width * height > 36 );
    const perimeterShape = createRectangularPerimeterShape( 0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH,
      FIND_THE_AREA_COLOR_CHOOSER.nextColor() );

    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, BASIC_RECTANGLES_SHAPE_KIT );
  }

  function generateLShapedFindAreaChallenge() {
    let width;
    let height;
    do {
      width = random.nextIntBetween( 2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4 );
      height = random.nextIntBetween( 2, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4 );
    } while ( width * height < 16 || width * height > 36 );
    const missingWidth = random.nextIntBetween( 1, width - 1 );
    const missingHeight = random.nextIntBetween( 1, height - 1 );
    const missingCorner = randomElement( [ 'leftTop', 'rightTop', 'leftBottom', 'rightBottom' ] );
    const perimeterShape = createLShapedPerimeterShape( 0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH,
      missingCorner, missingWidth * UNIT_SQUARE_LENGTH, missingHeight * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor() );

    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, BASIC_RECTANGLES_SHAPE_KIT );
  }

  function generateUShapedFindAreaChallenge() {
    let width;
    let height;
    do {
      width = random.nextIntBetween( 4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4 );
      height = random.nextIntBetween( 4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2 );
    } while ( width * height < 16 || width * height > 36 );
    const sideWithCutout = randomElement( [ 'left', 'right', 'top', 'bottom' ] );
    let cutoutWidth;
    let cutoutHeight;
    let cutoutOffset;
    if ( sideWithCutout === 'left' || sideWithCutout === 'right' ) {
      cutoutWidth = random.nextIntBetween( 2, width - 1 );
      cutoutHeight = random.nextIntBetween( 1, height - 2 );
      cutoutOffset = random.nextIntBetween( 1, height - cutoutHeight - 1 );
    }
    else {
      cutoutWidth = random.nextIntBetween( 1, width - 2 );
      cutoutHeight = random.nextIntBetween( 2, height - 1 );
      cutoutOffset = random.nextIntBetween( 1, width - cutoutWidth - 1 );
    }
    const perimeterShape = createUShapedPerimeterShape( 0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH,
      sideWithCutout, cutoutWidth * UNIT_SQUARE_LENGTH, cutoutHeight * UNIT_SQUARE_LENGTH,
      cutoutOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor() );

    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, BASIC_RECTANGLES_SHAPE_KIT );
  }

  function generateOShapedFindAreaChallenge() {
    let width;
    let height;
    do {
      width = random.nextIntBetween( 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4 );
      height = random.nextIntBetween( 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2 );
    } while ( width * height < 16 || width * height > 36 );
    const holeWidth = random.nextIntBetween( 1, width - 2 );
    const holeHeight = random.nextIntBetween( 1, height - 2 );
    const holeXOffset = random.nextIntBetween( 1, width - holeWidth - 1 );
    const holeYOffset = random.nextIntBetween( 1, height - holeHeight - 1 );
    const perimeterShape = createPerimeterShapeWithHole( 0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH,
      holeWidth * UNIT_SQUARE_LENGTH, holeHeight * UNIT_SQUARE_LENGTH, holeXOffset * UNIT_SQUARE_LENGTH,
      holeYOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor() );

    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, BASIC_RECTANGLES_SHAPE_KIT );
  }

  function generateIsoscelesRightTriangleSlantedHypotenuseFindAreaChallenge() {
    const cornerPosition = randomElement( [ 'leftTop', 'rightTop', 'rightBottom', 'leftBottom' ] );
    let edgeLength = 0;
    do {
      edgeLength = random.nextIntBetween( 4, Math.min( AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2,
        AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2 ) );
    } while ( edgeLength % 2 !== 0 );
    const perimeterShape = createPerimeterShapeSlantedHypotenuseRightIsoscelesTriangle( 0, 0,
      edgeLength * UNIT_SQUARE_LENGTH, cornerPosition, FIND_THE_AREA_COLOR_CHOOSER.nextColor() );
    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT );
  }

  function generateIsoscelesRightTriangleLevelHypotenuseFindAreaChallenge() {
    const cornerPosition = randomElement( [ 'centerTop', 'rightCenter', 'centerBottom', 'leftCenter' ] );
    let hypotenuseLength = 0;
    let maxHypotenuse;
    if ( cornerPosition === 'centerTop' || cornerPosition === 'centerBottom' ) {
      maxHypotenuse = AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4;
    }
    else {
      maxHypotenuse = AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2;
    }
    do {
      hypotenuseLength = random.nextIntBetween( 2, maxHypotenuse );
    } while ( hypotenuseLength % 2 !== 0 );
    const perimeterShape = createPerimeterShapeLevelHypotenuseRightIsoscelesTriangle( 0, 0,
      hypotenuseLength * UNIT_SQUARE_LENGTH, cornerPosition, FIND_THE_AREA_COLOR_CHOOSER.nextColor() );
    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT );
  }

  function generateLargeRectWithChipMissingChallenge() {
    const width = random.nextIntBetween( AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2 );
    const height = random.nextIntBetween( AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2 );
    const sideWithCutout = randomElement( [ 'left', 'right', 'top', 'bottom' ] );
    let cutoutWidth;
    let cutoutHeight;
    let cutoutOffset;
    if ( sideWithCutout === 'left' || sideWithCutout === 'right' ) {
      cutoutWidth = 1;
      cutoutHeight = random.nextIntBetween( 1, 3 );
      cutoutOffset = random.nextIntBetween( 1, height - cutoutHeight - 1 );
    }
    else {
      cutoutWidth = random.nextIntBetween( 1, 3 );
      cutoutHeight = 1;
      cutoutOffset = random.nextIntBetween( 1, width - cutoutWidth - 1 );
    }
    const perimeterShape = createUShapedPerimeterShape( 0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH,
      sideWithCutout, cutoutWidth * UNIT_SQUARE_LENGTH, cutoutHeight * UNIT_SQUARE_LENGTH,
      cutoutOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor() );

    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, BASIC_RECTANGLES_SHAPE_KIT );
  }

  function generateLargeRectWithSmallHoleMissingChallenge() {
    const width = random.nextIntBetween( AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 2 );
    const height = random.nextIntBetween( AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 2 );
    let holeWidth;
    let holeHeight;
    if ( random.nextDouble() < 0.5 ) {
      holeWidth = random.nextIntBetween( 1, 3 );
      holeHeight = 1;
    }
    else {
      holeHeight = random.nextIntBetween( 1, 3 );
      holeWidth = 1;
    }
    const holeXOffset = random.nextIntBetween( 1, width - holeWidth - 1 );
    const holeYOffset = random.nextIntBetween( 1, height - holeHeight - 1 );
    const perimeterShape = createPerimeterShapeWithHole( 0, 0, width * UNIT_SQUARE_LENGTH, height * UNIT_SQUARE_LENGTH,
      holeWidth * UNIT_SQUARE_LENGTH, holeHeight * UNIT_SQUARE_LENGTH, holeXOffset * UNIT_SQUARE_LENGTH,
      holeYOffset * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor() );

    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, BASIC_RECTANGLES_SHAPE_KIT );
  }

  function generateLargeRectWithPieceMissingChallenge() {
    return random.nextDouble() < 0.7 ? generateLargeRectWithChipMissingChallenge() : generateLargeRectWithSmallHoleMissingChallenge();
  }

  function generateShapeWithDiagonalFindAreaChallenge() {
    const width = random.nextIntBetween( 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - 4 );
    const height = random.nextIntBetween( 3, AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - 4 );
    const diagonalPosition = randomElement( [ 'leftTop', 'rightTop', 'leftBottom', 'rightBottom' ] );
    let diagonalSquareLength = 2;
    if ( height > 4 && width > 4 && random.nextDouble() > 0.5 ) {
      diagonalSquareLength = 4;
    }
    const cutWidth = random.nextIntBetween( 1, width - diagonalSquareLength );
    const cutHeight = random.nextIntBetween( 1, height - diagonalSquareLength );

    const perimeterShape = createShapeWithDiagonalAndMissingCorner( 0, 0, width * UNIT_SQUARE_LENGTH,
      height * UNIT_SQUARE_LENGTH, diagonalPosition, diagonalSquareLength * UNIT_SQUARE_LENGTH,
      cutWidth * UNIT_SQUARE_LENGTH, cutHeight * UNIT_SQUARE_LENGTH, FIND_THE_AREA_COLOR_CHOOSER.nextColor() );

    return AreaBuilderGameChallenge.createFindAreaChallenge( perimeterShape, RECTANGLES_AND_TRIANGLES_SHAPE_KIT );
  }

  function generateEasyProportionalBuildAreaChallenge() {
    return generateProportionalBuildAreaChallenge( 'easy', false );
  }

  function generateHarderProportionalBuildAreaChallenge() {
    return generateProportionalBuildAreaChallenge( 'harder', false );
  }

  function generateProportionalBuildAreaChallenge( difficulty, includePerimeter ) {
    assert && assert( difficulty === 'easy' || difficulty === 'harder' );
    let width;
    let height;

    // Randomly generate width, height, and the possible factors from which a proportional challenge can be created.
    const factors = [];
    do {
      height = random.nextIntBetween( 3, 6 );
      if ( height === 3 ) {
        width = random.nextIntBetween( 4, 8 );
      }
      else {
        width = random.nextIntBetween( 2, 10 );
      }

      const minFactor = difficulty === 'easy' ? 2 : 5;
      const maxFactor = difficulty === 'easy' ? 4 : 9;

      const area = width * height;
      for ( let i = minFactor; i <= maxFactor; i++ ) {
        if ( area % i === 0 ) {
          // This is a factor of the area.
          factors.push( i );
        }
      }
    } while ( factors.length === 0 );

    // Choose the fractional proportion.
    const fractionDenominator = randomElement( factors );
    let color1FractionNumerator;
    do {
      color1FractionNumerator = random.nextIntBetween( 1, fractionDenominator - 1 );
    } while ( Utils.gcd( color1FractionNumerator, fractionDenominator ) > 1 );
    const color1Fraction = new Fraction( color1FractionNumerator, fractionDenominator );

    // Choose the colors for this challenge
    const colorPair = COLOR_PAIR_CHOOSER.nextColorPair();

    // Create the example solution
    const exampleSolution = createTwoColorRectangularSolutionSpec(
      Math.floor( ( AreaBuilderGameModel.SHAPE_BOARD_UNIT_WIDTH - width ) / 2 ),
      Math.floor( ( AreaBuilderGameModel.SHAPE_BOARD_UNIT_HEIGHT - height ) / 2 ),
      width,
      height,
      colorPair.color1,
      colorPair.color2,
      color1Fraction.getValue()
    );

    const userShapes = createTwoToneRectangleBuildKit( colorPair.color1, colorPair.color2 );

    // Build the challenge from all the pieces.
    if ( includePerimeter ) {
      return AreaBuilderGameChallenge.createTwoToneBuildAreaAndPerimeterChallenge( width * height,
        ( 2 * width + 2 * height ), colorPair.color1, colorPair.color2, color1Fraction, userShapes, exampleSolution );
    }
    else {
      return AreaBuilderGameChallenge.createTwoToneBuildAreaChallenge( width * height, colorPair.color1,
        colorPair.color2, color1Fraction, userShapes, exampleSolution );
    }
  }

  function generateEasyProportionalBuildAreaAndPerimeterChallenge() {
    return generateProportionalBuildAreaChallenge( 'easy', true );
  }

  function generateHarderProportionalBuildAreaAndPerimeterChallenge() {
    return generateProportionalBuildAreaChallenge( 'harder', true );
  }

  // Challenge history, used to make sure unique challenges are generated.
  let challengeHistory = [];

  // Use the provided generation function to create challenges until a unique one has been created.
  function generateUniqueChallenge( generationFunction ) {
    let challenge;
    let uniqueChallengeGenerated = false;
    let attempts = 0;
    while ( !uniqueChallengeGenerated ) {
      challenge = generationFunction();
      attempts++;
      uniqueChallengeGenerated = isChallengeUnique( challenge );
      if ( attempts > 12 && !uniqueChallengeGenerated ) {
        // Remove the oldest half of challenges.
        challengeHistory = challengeHistory.slice( 0, challengeHistory.length / 2 );
        attempts = 0;
      }
    }

    challengeHistory.push( challenge );
    return challenge;
  }

  // Level 4 is required to limit the number of shapes available, to only allow unit squares, and to have not grid
  // control.  This function modifies the challenges to conform to this.
  function makeLevel4SpecificModifications( challenge ) {
    challenge.toolSpec.gridControl = false;
    challenge.userShapes = [
      {
        shape: UNIT_SQUARE_SHAPE,
        color: AreaBuilderSharedConstants.GREENISH_COLOR
      }
    ];

    // Limit the number of shapes to the length of the larger side.  This encourages certain strategies.
    assert && assert( challenge.backgroundShape.exteriorPerimeters.length === 1, 'Unexpected configuration for background shape.' );
    const perimeterShape = new PerimeterShape( challenge.backgroundShape.exteriorPerimeters, [], UNIT_SQUARE_LENGTH );
    challenge.userShapes[ 0 ].creationLimit = Math.max( perimeterShape.getWidth() / UNIT_SQUARE_LENGTH,
      perimeterShape.getHeight() / UNIT_SQUARE_LENGTH );
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
  this.generateChallengeSet = ( level, numChallenges ) => {
    let challengeSet = [];
    let tempChallenge;
    let triangleChallenges;
    switch( level ) {
      case 0:
        _.times( 3, () => { challengeSet.push( generateUniqueChallenge( generateBuildAreaChallenge ) ); } );
        _.times( 2, () => { challengeSet.push( generateUniqueChallenge( generateRectangularFindAreaChallenge ) ); } );
        challengeSet.push( generateUniqueChallenge( generateLShapedFindAreaChallenge ) );
        break;

      case 1:
        _.times( 3, () => { challengeSet.push( generateUniqueChallenge( generateBuildAreaAndPerimeterChallenge ) ); } );
        _.times( 3, () => { challengeSet.push( generateUniqueChallenge( generateTwoRectangleBuildAreaAndPerimeterChallenge ) ); } );
        break;

      case 2:
        challengeSet.push( generateUniqueChallenge( generateUShapedFindAreaChallenge ) );
        challengeSet.push( generateUniqueChallenge( generateOShapedFindAreaChallenge ) );
        challengeSet.push( generateUniqueChallenge( generateShapeWithDiagonalFindAreaChallenge ) );
        challengeSet = random.shuffle( challengeSet );
        triangleChallenges = random.shuffle( [
          generateUniqueChallenge( generateIsoscelesRightTriangleLevelHypotenuseFindAreaChallenge ),
          generateUniqueChallenge( generateIsoscelesRightTriangleSlantedHypotenuseFindAreaChallenge )
        ] );
        triangleChallenges.forEach( challenge => { challengeSet.push( challenge ); } );
        challengeSet.push( generateUniqueChallenge( generateLargeRectWithPieceMissingChallenge ) );
        break;

      case 3:
        // For this level, the grid is disabled for all challenges and some different build kits are used.
        challengeSet.push( makeLevel4SpecificModifications( generateUniqueChallenge( generateUShapedFindAreaChallenge ) ) );
        challengeSet.push( makeLevel4SpecificModifications( generateUniqueChallenge( generateOShapedFindAreaChallenge ) ) );
        challengeSet.push( makeLevel4SpecificModifications( generateUniqueChallenge( generateOShapedFindAreaChallenge ) ) );
        challengeSet.push( makeLevel4SpecificModifications( generateUniqueChallenge( generateShapeWithDiagonalFindAreaChallenge ) ) );
        challengeSet = random.shuffle( challengeSet );
        // For the next challenge, choose randomly from the shapes that don't have diagonals.
        tempChallenge = generateUniqueChallenge( randomElement( [ generateLShapedFindAreaChallenge, generateUShapedFindAreaChallenge ] ) );
        tempChallenge.toolSpec.gridControl = false;
        tempChallenge.userShapes = null;
        challengeSet.push( tempChallenge );
        tempChallenge = generateUniqueChallenge( generateShapeWithDiagonalFindAreaChallenge );
        tempChallenge.toolSpec.gridControl = false;
        tempChallenge.userShapes = null;
        challengeSet.push( tempChallenge );
        break;

      case 4:
        _.times( 3, () => { challengeSet.push( generateUniqueChallenge( generateEasyProportionalBuildAreaChallenge ) ); } );
        _.times( 3, () => { challengeSet.push( generateUniqueChallenge( generateHarderProportionalBuildAreaChallenge ) ); } );
        break;

      case 5:
        _.times( 3, () => { challengeSet.push( generateUniqueChallenge( generateEasyProportionalBuildAreaAndPerimeterChallenge ) ); } );
        _.times( 3, () => { challengeSet.push( generateUniqueChallenge( generateHarderProportionalBuildAreaAndPerimeterChallenge ) ); } );
        break;

      default:
        throw new Error( `Unsupported game level: ${level}` );
    }
    assert && assert( challengeSet.length === numChallenges, 'Error: Didn\'t generate correct number of challenges.' );
    return challengeSet;
  };
}

areaBuilder.register( 'AreaBuilderChallengeFactory', AreaBuilderChallengeFactory );
export default AreaBuilderChallengeFactory;