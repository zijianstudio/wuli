// Copyright 2021-2023, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import quadrilateral from './quadrilateral.js';

type StringsType = {
  'quadrilateral': {
    'titleStringProperty': LinkableProperty<string>;
  };
  'labelsStringProperty': LinkableProperty<string>;
  'markersStringProperty': LinkableProperty<string>;
  'diagonalsStringProperty': LinkableProperty<string>;
  'gridStringProperty': LinkableProperty<string>;
  'vertexAStringProperty': LinkableProperty<string>;
  'vertexBStringProperty': LinkableProperty<string>;
  'vertexCStringProperty': LinkableProperty<string>;
  'vertexDStringProperty': LinkableProperty<string>;
  'shapeNameHiddenStringProperty': LinkableProperty<string>;
  'resetShapeStringProperty': LinkableProperty<string>;
  'shapeNames': {
    'squareStringProperty': LinkableProperty<string>;
    'rectangleStringProperty': LinkableProperty<string>;
    'rhombusStringProperty': LinkableProperty<string>;
    'kiteStringProperty': LinkableProperty<string>;
    'isoscelesTrapezoidStringProperty': LinkableProperty<string>;
    'trapezoidStringProperty': LinkableProperty<string>;
    'concaveQuadrilateralStringProperty': LinkableProperty<string>;
    'convexQuadrilateralStringProperty': LinkableProperty<string>;
    'parallelogramStringProperty': LinkableProperty<string>;
    'dartStringProperty': LinkableProperty<string>;
    'triangleStringProperty': LinkableProperty<string>;
  };
  'keyboardHelpDialog': {
    'moveCornersOrSidesStringProperty': LinkableProperty<string>;
    'moveCornerOrSideStringProperty': LinkableProperty<string>;
    'moveInSmallerStepsStringProperty': LinkableProperty<string>;
    'mouseStringProperty': LinkableProperty<string>;
    'shapeShortcutsStringProperty': LinkableProperty<string>;
    'resetShapeStringProperty': LinkableProperty<string>;
  };
  'preferencesDialog': {
    'shapeSoundOptionsStringProperty': LinkableProperty<string>;
    'shapeSoundOptionsDescriptionStringProperty': LinkableProperty<string>;
    'layerSoundDesignDescriptionStringProperty': LinkableProperty<string>;
    'uniqueSoundDesignDescriptionStringProperty': LinkableProperty<string>;
    'playShapeSoundsForeverStringProperty': LinkableProperty<string>;
  };
  'smallStepsStringProperty': LinkableProperty<string>;
  'a11y': {
    'cornerLabelsAddedResponseStringProperty': LinkableProperty<string>;
    'cornerLabelsRemovedResponseStringProperty': LinkableProperty<string>;
    'cornerLabelsHintResponseStringProperty': LinkableProperty<string>;
    'markersAddedResponseStringProperty': LinkableProperty<string>;
    'markersRemovedResponseStringProperty': LinkableProperty<string>;
    'markersHintResponseStringProperty': LinkableProperty<string>;
    'gridLinesAddedResponseStringProperty': LinkableProperty<string>;
    'gridLinesRemovedResponseStringProperty': LinkableProperty<string>;
    'diagonalGuidesAddedResponseStringProperty': LinkableProperty<string>;
    'diagonalGuidesRemovedResponseStringProperty': LinkableProperty<string>;
    'diagonalGuidesHintResponseStringProperty': LinkableProperty<string>;
    'gridLinesHintResponseStringProperty': LinkableProperty<string>;
    'cornerAStringProperty': LinkableProperty<string>;
    'cornerBStringProperty': LinkableProperty<string>;
    'cornerCStringProperty': LinkableProperty<string>;
    'cornerDStringProperty': LinkableProperty<string>;
    'sideABStringProperty': LinkableProperty<string>;
    'sideBCStringProperty': LinkableProperty<string>;
    'sideCDStringProperty': LinkableProperty<string>;
    'sideDAStringProperty': LinkableProperty<string>;
    'aBStringProperty': LinkableProperty<string>;
    'bCStringProperty': LinkableProperty<string>;
    'cDStringProperty': LinkableProperty<string>;
    'dAStringProperty': LinkableProperty<string>;
    'voicing': {
      'overviewContentStringProperty': LinkableProperty<string>;
      'hintContentStringProperty': LinkableProperty<string>;
      'youHaveAShapeHintPatternStringProperty': LinkableProperty<string>;
      'youHaveASizedNamedShapePatternStringProperty': LinkableProperty<string>;
      'youHaveASizedShapePatternStringProperty': LinkableProperty<string>;
      'firstDetailsStatementPatternStringProperty': LinkableProperty<string>;
      'vertexHintResponseStringProperty': LinkableProperty<string>;
      'sideHintResponseStringProperty': LinkableProperty<string>;
      'details': {
        'allStringProperty': LinkableProperty<string>;
        'oppositeStringProperty': LinkableProperty<string>;
        'rightAnglesStringProperty': LinkableProperty<string>;
        'equalStringProperty': LinkableProperty<string>;
        'pairsOfAdjacentStringProperty': LinkableProperty<string>;
        'onePairOfAdjacentStringProperty': LinkableProperty<string>;
        'onePairOfOppositeStringProperty': LinkableProperty<string>;
        'noStringStringProperty': LinkableProperty<string>;
      };
      'sidesDescriptionPatternStringProperty': LinkableProperty<string>;
      'longestSidesDescriptionPatternStringProperty': LinkableProperty<string>;
      'longestSideDescriptionPatternStringProperty': LinkableProperty<string>;
      'shortestSidesDescriptionPatternStringProperty': LinkableProperty<string>;
      'shortestSideDescriptionPatternStringProperty': LinkableProperty<string>;
      'sideLengthDescriptionPatternStringProperty': LinkableProperty<string>;
      'cornersRightDescriptionStringProperty': LinkableProperty<string>;
      'widestCornersDescriptionPatternStringProperty': LinkableProperty<string>;
      'widestCornerDescriptionPatternStringProperty': LinkableProperty<string>;
      'smallestCornersDescriptionPatternStringProperty': LinkableProperty<string>;
      'smallestCornerDescriptionPatternStringProperty': LinkableProperty<string>;
      'cornersDescriptionPatternStringProperty': LinkableProperty<string>;
      'oppositeSidesTiltPatternStringProperty': LinkableProperty<string>;
      'oppositeSidesInParallelPatternStringProperty': LinkableProperty<string>;
      'oppositeSidesInParallelAsCornersChangeEquallyPatternStringProperty': LinkableProperty<string>;
      'oppositeSidesTiltAsShapeChangesPatternStringProperty': LinkableProperty<string>;
      'maintainingATrapezoidAsShapeChangesPatternStringProperty': LinkableProperty<string>;
      'adjacentSidesChangeEquallyAsShapeChangesPatternStringProperty': LinkableProperty<string>;
      'oppositeSidesEqualAsShapeChangesPatternStringProperty': LinkableProperty<string>;
      'maintainingAParallelogramAngleResponseStringProperty': LinkableProperty<string>;
      'maintainingAParallelogramLengthResponsePatternStringProperty': LinkableProperty<string>;
      'allRightAnglesAsShapeChangesPatternStringProperty': LinkableProperty<string>;
      'maintainingARhombusStringProperty': LinkableProperty<string>;
      'allSidesEqualAsShapeChangesPatternStringProperty': LinkableProperty<string>;
      'cornerFlatAsShapeChangesPatternStringProperty': LinkableProperty<string>;
      'adjacentSidesInLinePatternStringProperty': LinkableProperty<string>;
      'allSidesTiltAwayFromParallelStringProperty': LinkableProperty<string>;
      'allSidesTiltAwayFromParallelAsShapeChangesPatternStringProperty': LinkableProperty<string>;
      'tiltStringProperty': LinkableProperty<string>;
      'straightenStringProperty': LinkableProperty<string>;
      'biggerStringProperty': LinkableProperty<string>;
      'smallerStringProperty': LinkableProperty<string>;
      'sizes': {
        'tinyStringProperty': LinkableProperty<string>;
        'verySmallStringProperty': LinkableProperty<string>;
        'smallStringProperty': LinkableProperty<string>;
        'mediumSizedStringProperty': LinkableProperty<string>;
        'largeStringProperty': LinkableProperty<string>;
      };
      'shapeNames': {
        'withoutArticles': {
          'squareStringProperty': LinkableProperty<string>;
          'rectangleStringProperty': LinkableProperty<string>;
          'rhombusStringProperty': LinkableProperty<string>;
          'kiteStringProperty': LinkableProperty<string>;
          'isoscelesTrapezoidStringProperty': LinkableProperty<string>;
          'trapezoidStringProperty': LinkableProperty<string>;
          'concaveQuadrilateralStringProperty': LinkableProperty<string>;
          'convexQuadrilateralStringProperty': LinkableProperty<string>;
          'parallelogramStringProperty': LinkableProperty<string>;
          'dartStringProperty': LinkableProperty<string>;
          'triangleStringProperty': LinkableProperty<string>;
        };
        'withArticles': {
          'squareStringProperty': LinkableProperty<string>;
          'rectangleStringProperty': LinkableProperty<string>;
          'rhombusStringProperty': LinkableProperty<string>;
          'kiteStringProperty': LinkableProperty<string>;
          'isoscelesTrapezoidStringProperty': LinkableProperty<string>;
          'trapezoidStringProperty': LinkableProperty<string>;
          'concaveQuadrilateralStringProperty': LinkableProperty<string>;
          'convexQuadrilateralStringProperty': LinkableProperty<string>;
          'parallelogramStringProperty': LinkableProperty<string>;
          'dartStringProperty': LinkableProperty<string>;
          'triangleStringProperty': LinkableProperty<string>;
        }
      };
      'allRightAnglesAllSidesEqualStringProperty': LinkableProperty<string>;
      'allSidesEqualStringProperty': LinkableProperty<string>;
      'allRightAnglesStringProperty': LinkableProperty<string>;
      'oppositeSidesInParallelStringProperty': LinkableProperty<string>;
      'trapezoidDetailsPatternStringProperty': LinkableProperty<string>;
      'isoscelesTrapezoidDetailsPatternStringProperty': LinkableProperty<string>;
      'kiteDetailsPatternStringProperty': LinkableProperty<string>;
      'kiteDetailsShortPatternStringProperty': LinkableProperty<string>;
      'dartDetailsPatternStringProperty': LinkableProperty<string>;
      'dartDetailsShortPatternStringProperty': LinkableProperty<string>;
      'triangleDetailsPatternStringProperty': LinkableProperty<string>;
      'convexQuadrilateralDetailsStringProperty': LinkableProperty<string>;
      'concaveQuadrilateralDetailsPatternStringProperty': LinkableProperty<string>;
      'vertexObjectResponsePatternStringProperty': LinkableProperty<string>;
      'vertexObjectResponseWithWedgesPatternStringProperty': LinkableProperty<string>;
      'rightAngleStringProperty': LinkableProperty<string>;
      'angleFlatStringProperty': LinkableProperty<string>;
      'oneWedgeStringProperty': LinkableProperty<string>;
      'halfOneWedgeStringProperty': LinkableProperty<string>;
      'lessThanHalfOneWedgeStringProperty': LinkableProperty<string>;
      'justUnderOneWedgeStringProperty': LinkableProperty<string>;
      'justOverOneWedgeStringProperty': LinkableProperty<string>;
      'numberOfWedgesPatternStringProperty': LinkableProperty<string>;
      'numberOfWedgesAndAHalfPatternStringProperty': LinkableProperty<string>;
      'justOverNumberOfWedgesPatternStringProperty': LinkableProperty<string>;
      'justUnderNumberOfWedgesPatternStringProperty': LinkableProperty<string>;
      'oneUnitStringProperty': LinkableProperty<string>;
      'numberOfUnitsPatternStringProperty': LinkableProperty<string>;
      'numberOfUnitsAndAHalfPatternStringProperty': LinkableProperty<string>;
      'oneQuarterUnitStringProperty': LinkableProperty<string>;
      'numberAndOneQuarterUnitsPatternStringProperty': LinkableProperty<string>;
      'threeQuarterUnitsStringProperty': LinkableProperty<string>;
      'numberAndThreeQuarterUnitsPatternStringProperty': LinkableProperty<string>;
      'aboutOneUnitStringProperty': LinkableProperty<string>;
      'aboutNumberUnitsPatternStringProperty': LinkableProperty<string>;
      'aboutOneHalfUnitsStringProperty': LinkableProperty<string>;
      'oneHalfUnitsStringProperty': LinkableProperty<string>;
      'aboutNumberAndAHalfUnitsPatternStringProperty': LinkableProperty<string>;
      'aboutNumberQuarterUnitsPatternStringProperty': LinkableProperty<string>;
      'aboutFullNumberAndNumberQuarterUnitsPatternStringProperty': LinkableProperty<string>;
      'vertexDragObjectResponse': {
        'widerStringProperty': LinkableProperty<string>;
        'smallerStringProperty': LinkableProperty<string>;
        'vertexDragObjectResponsePatternStringProperty': LinkableProperty<string>;
      };
      'sideDragObjectResponse': {
        'shorterStringProperty': LinkableProperty<string>;
        'longerStringProperty': LinkableProperty<string>;
        'adjacentSidesChangePatternStringProperty': LinkableProperty<string>;
        'adjacentSidesChangeInLengthStringProperty': LinkableProperty<string>;
        'parallelAdjacentSidesChangePatternStringProperty': LinkableProperty<string>;
        'equalAdjacentSidesChangePatternStringProperty': LinkableProperty<string>;
        'adjacentSidesEqualStringProperty': LinkableProperty<string>;
        'equalToAdjacentSidesStringProperty': LinkableProperty<string>;
        'adjacentSidesParallelStringProperty': LinkableProperty<string>;
        'equalToOneAdjacentSideStringProperty': LinkableProperty<string>;
        'threeSidesEqualStringProperty': LinkableProperty<string>;
        'twoSidesEqualStringProperty': LinkableProperty<string>;
      };
      'farSmallerThanStringProperty': LinkableProperty<string>;
      'aboutHalfAsWideAsStringProperty': LinkableProperty<string>;
      'halfAsWideAsStringProperty': LinkableProperty<string>;
      'aLittleSmallerThanStringProperty': LinkableProperty<string>;
      'muchSmallerThanStringProperty': LinkableProperty<string>;
      'similarButSmallerThanStringProperty': LinkableProperty<string>;
      'equalToStringProperty': LinkableProperty<string>;
      'similarButWiderThanStringProperty': LinkableProperty<string>;
      'aLittleWiderThanStringProperty': LinkableProperty<string>;
      'muchWiderThanStringProperty': LinkableProperty<string>;
      'aboutTwiceAsWideAsStringProperty': LinkableProperty<string>;
      'twiceAsWideAsStringProperty': LinkableProperty<string>;
      'farWiderThanStringProperty': LinkableProperty<string>;
      'equalToAdjacentCornersStringProperty': LinkableProperty<string>;
      'equalToOneAdjacentCornerStringProperty': LinkableProperty<string>;
      'equalAdjacentCornersPatternStringProperty': LinkableProperty<string>;
      'smallerThanAdjacentCornersStringProperty': LinkableProperty<string>;
      'widerThanAdjacentCornersStringProperty': LinkableProperty<string>;
      'notEqualToAdjacentCornersStringProperty': LinkableProperty<string>;
      'farShorterThanStringProperty': LinkableProperty<string>;
      'aboutHalfAsLongAsStringProperty': LinkableProperty<string>;
      'halfAsLongAsStringProperty': LinkableProperty<string>;
      'aLittleShorterThanStringProperty': LinkableProperty<string>;
      'muchShorterThanStringProperty': LinkableProperty<string>;
      'similarButShorterThanStringProperty': LinkableProperty<string>;
      'similarButLongerThanStringProperty': LinkableProperty<string>;
      'aLittleLongerThanStringProperty': LinkableProperty<string>;
      'muchLongerThanStringProperty': LinkableProperty<string>;
      'aboutTwiceAsLongAsStringProperty': LinkableProperty<string>;
      'twiceAsLongAsStringProperty': LinkableProperty<string>;
      'farLongerThanStringProperty': LinkableProperty<string>;
      'parallelEqualSideObjectResponsePatternStringProperty': LinkableProperty<string>;
      'parallelSideObjectResponsePatternStringProperty': LinkableProperty<string>;
      'sideObjectResponsePatternStringProperty': LinkableProperty<string>;
      'sideUnitsObjectResponsePatternStringProperty': LinkableProperty<string>;
      'equalToAdjacentSidesStringProperty': LinkableProperty<string>;
      'equalToOneAdjacentSideStringProperty': LinkableProperty<string>;
      'equalAdjacentSidesPatternStringProperty': LinkableProperty<string>;
      'equalAdjacentParallelSidesPatternStringProperty': LinkableProperty<string>;
      'shorterThanAdjacentSidesStringProperty': LinkableProperty<string>;
      'shorterThanParallelAdjacentSidesStringProperty': LinkableProperty<string>;
      'longerThanAdjacentSidesStringProperty': LinkableProperty<string>;
      'longerThanParallelAdjacentSidesStringProperty': LinkableProperty<string>;
      'notEqualToAdjacentSidesStringProperty': LinkableProperty<string>;
      'notEqualToParallelAdjacentSidesStringProperty': LinkableProperty<string>;
      'backStringProperty': LinkableProperty<string>;
      'goneStringProperty': LinkableProperty<string>;
      'cornersBackStringProperty': LinkableProperty<string>;
      'cornersGoneStringProperty': LinkableProperty<string>;
      'cornerDetectedPatternStringProperty': LinkableProperty<string>;
      'shapeSoundControl': {
        'nameResponseStringProperty': LinkableProperty<string>;
        'enabledContextResponseStringProperty': LinkableProperty<string>;
        'disabledContextResponseStringProperty': LinkableProperty<string>;
        'hintResponseStringProperty': LinkableProperty<string>;
      };
      'resetShape': {
        'contextResponseStringProperty': LinkableProperty<string>;
      };
      'foundShapePatternStringProperty': LinkableProperty<string>;
      'shapeNameHiddenContextResponseStringProperty': LinkableProperty<string>;
      'shapeNameShownContextResponseStringProperty': LinkableProperty<string>;
      'angleComparisonPatternStringProperty': LinkableProperty<string>;
      'equalToOppositeCornerEqualToAdjacentCornersStringProperty': LinkableProperty<string>;
      'oppositeCornerStringProperty': LinkableProperty<string>;
      'adjacentCornersEqualStringProperty': LinkableProperty<string>;
      'adjacentCornersRightAnglesStringProperty': LinkableProperty<string>;
      'progressStatePatternStringProperty': LinkableProperty<string>;
      'blockedByEdgeStringProperty': LinkableProperty<string>;
      'blockedByInnerShapeStringProperty': LinkableProperty<string>;
      'minorIntervalsToggle': {
        'hintResponseStringProperty': LinkableProperty<string>;
        'lockedNameResponseStringProperty': LinkableProperty<string>;
        'unlockedNameResponseStringProperty': LinkableProperty<string>;
        'lockedContextResponseStringProperty': LinkableProperty<string>;
        'unlockedContextResponseStringProperty': LinkableProperty<string>;
      }
    };
    'keyboardHelpDialog': {
      'checkShapeDescriptionPatternStringProperty': LinkableProperty<string>;
      'resetShapeDescriptionPatternStringProperty': LinkableProperty<string>;
      'moveShapeDescriptionStringProperty': LinkableProperty<string>;
      'smallerStepsDescriptionStringProperty': LinkableProperty<string>;
    };
    'preferencesDialog': {
      'tracksPlayForeverToggle': {
        'checkedContextResponseStringProperty': LinkableProperty<string>;
        'uncheckedContextResponseStringProperty': LinkableProperty<string>;
      }
    }
  }
};

const QuadrilateralStrings = getStringModule( 'QUADRILATERAL' ) as StringsType;

quadrilateral.register( 'QuadrilateralStrings', QuadrilateralStrings );

export default QuadrilateralStrings;
