// Copyright 2017-2022, University of Colorado Boulder

/**
 * Single position of all accessibility strings.  These strings are not meant to be translatable yet.  Rosetta needs
 * some work to provide translators with context for these strings, and we want to receive some community feedback
 * before these strings are submitted for translation.
 *
 * @author Jesse Greenberg
 */

import balloonsAndStaticElectricity from '../balloonsAndStaticElectricity.js';
const BASEA11yStrings = {
  //------------------------------------------------------------------------
  // General utility strings
  //------------------------------------------------------------------------
  singleStatementPattern: {
    value: '{{statement}}.'
  },
  //--------------------------------------------------------------------------
  // General labels
  //--------------------------------------------------------------------------
  position: {
    value: 'position'
  },
  positions: {
    value: 'positions'
  },
  //--------------------------------------------------------------------------
  // Play Area map grid strings
  //--------------------------------------------------------------------------
  leftShoulderOfSweater: {
    value: 'left shoulder of sweater'
  },
  leftArmOfSweater: {
    value: 'left arm of sweater'
  },
  bottomLeftEdgeOfSweater: {
    value: 'lower-left arm of sweater'
  },
  upperLeftSideOfSweater: {
    value: 'upper-left side of sweater'
  },
  leftSideOfSweater: {
    value: 'left side of sweater'
  },
  lowerLeftSideOfSweater: {
    value: 'lower-left side of sweater'
  },
  upperRightSideOfSweater: {
    value: 'upper-right side of sweater'
  },
  rightSideOfSweater: {
    value: 'right side of sweater'
  },
  lowerRightSideOfSweater: {
    value: 'lower-right side of sweater'
  },
  rightShoulderOfSweater: {
    value: 'right shoulder of sweater'
  },
  rightArmOfSweater: {
    value: 'right arm of sweater'
  },
  lowerRightArmOfSweater: {
    value: 'lower-right arm of sweater'
  },
  upperLeftSideOfPlayArea: {
    value: 'upper-left side of Play Area'
  },
  leftSideOfPlayArea: {
    value: 'left side of Play Area'
  },
  lowerLeftSideOfPlayArea: {
    value: 'lower-left side of Play Area'
  },
  upperCenterOfPlayArea: {
    value: 'upper-center of Play Area'
  },
  centerOfPlayArea: {
    value: 'center of Play Area'
  },
  lowerCenterOfPlayArea: {
    value: 'lower-center of Play Area'
  },
  upperRightSideOfPlayArea: {
    value: 'upper-right side of Play Area'
  },
  rightSideOfPlayArea: {
    value: 'right side of Play Area'
  },
  lowerRightSideOfPlayArea: {
    value: 'lower-right side of Play Area'
  },
  upperWall: {
    value: 'upper wall'
  },
  wall: {
    value: 'wall'
  },
  lowerWall: {
    value: 'lower wall'
  },
  upperRightEdgeOfPlayArea: {
    value: 'upper-right edge of Play Area'
  },
  rightEdgeOfPlayArea: {
    value: 'right edge of Play Area'
  },
  lowerRightEdgeOfPlayArea: {
    value: 'lower-right edge of Play Area'
  },
  //--------------------------------------------------------------------------
  // Play Area landmark strings, 'near' or  'at' added  through string patterns
  //--------------------------------------------------------------------------
  landmarkNearSweater: {
    value: 'sweater'
  },
  landmarkLeftEdge: {
    value: 'left edge'
  },
  landmarkNearUpperWall: {
    value: 'upper wall'
  },
  landmarkNearWall: {
    value: 'wall'
  },
  landmarkNearLowerWall: {
    value: 'lower wall'
  },
  landmarkNearUpperRightEdge: {
    value: 'upper right edge'
  },
  landmarkNearRightEdge: {
    value: 'right edge'
  },
  landmarkNearLowerRightEdge: {
    value: 'lower-right edge'
  },
  landmarkAtCenterPlayArea: {
    value: 'center of Play Area'
  },
  landmarkAtUpperCenterPlayArea: {
    value: 'upper-center of Play Area'
  },
  landmarkAtLowerCenterPlayArea: {
    value: 'lower-center of Play Area'
  },
  balloonVeryCloseTo: {
    value: 'Very close to'
  },
  //--------------------------------------------------------------------------
  // Boundary or Critical position strings
  //--------------------------------------------------------------------------
  atLeftEdge: {
    value: 'At left edge.'
  },
  atTop: {
    value: 'At top.'
  },
  atBottom: {
    value: 'At bottom.'
  },
  atRightEdge: {
    value: 'At right edge.'
  },
  atWall: {
    value: 'At wall.'
  },
  onSweater: {
    value: 'On Sweater'
  },
  offSweater: {
    value: 'Off sweater.'
  },
  //--------------------------------------------------------------------------
  // Charge capacity strings
  //--------------------------------------------------------------------------
  neutral: {
    value: 'neutral'
  },
  negative: {
    value: 'negative'
  },
  positive: {
    value: 'positive'
  },
  no: {
    value: 'no'
  },
  aFew: {
    value: 'a few'
  },
  several: {
    value: 'several'
  },
  many: {
    value: 'many'
  },
  all: {
    value: 'all'
  },
  zero: {
    value: 'zero'
  },
  sweater: {
    value: 'sweater'
  },
  // alerts for when wall is added or removed from play area
  wallRemoved: {
    value: 'Wall removed from Play Area.'
  },
  wallAdded: {
    value: 'Wall added to Play Area.'
  },
  //------------------------------------------------------------------------
  // screen summary strings
  //------------------------------------------------------------------------
  simOpening: {
    value: 'The Play Area is a small room. The Control Area has buttons, a checkbox, and radio buttons to change conditions in the room.'
  },
  // objects for the screen summary
  roomObjectsPattern: {
    value: 'Currently, room has {{description}}.'
  },
  aYellowBalloon: {
    value: 'a yellow balloon,'
  },
  aGreenBalloon: {
    value: 'a green balloon,'
  },
  aSweater: {
    value: 'a sweater,'
  },
  andASweater: {
    value: 'and a sweater'
  },
  andARemovableWall: {
    value: 'and a removable wall'
  },
  summaryYellowGreenSweaterWallPattern: {
    value: '{{yellowBalloon}} {{greenBalloon}} {{sweater}} {{wall}}'
  },
  summaryYellowGreenSweaterPattern: {
    value: '{{yellowBalloon}} {{greenBalloon}} {{sweater}}'
  },
  summaryYellowSweaterWallPattern: {
    value: '{{yellowBalloon}} {{sweater}} {{wall}}'
  },
  summaryYellowSweaterPattern: {
    value: '{{yellowBalloon}} {{sweater}}'
  },
  inducedChargePattern: {
    value: 'Negative charges in {{wallPosition}} move away from {{balloon}} {{inductionAmount}}'
  },
  inducedChargeNoAmountPattern: {
    value: 'Negative charges in {{wallPosition}} move away from {{balloon}}.'
  },
  summaryBalloonNeutralCharge: {
    value: 'a few pairs of negative and positive charges'
  },
  summaryBalloonChargePattern: {
    value: '{{balloonCharge}}, {{showingCharge}}.'
  },
  summaryEachBalloonChargePattern: {
    value: '{{yellowBalloon}} {{greenBalloon}}'
  },
  summarySweaterAndWall: {
    value: 'Sweater and wall'
  },
  initialObjectPositions: {
    value: 'Yellow balloon is at center of Play Area, evenly between sweater and wall. Sweater is at far left, wall at far right.'
  },
  // general charge information for the screen summary
  summaryObjectHasChargePattern: {
    value: '{{object}} has {{charge}} net charge'
  },
  summaryObjectsHaveChargePattern: {
    value: '{{objects}} have {{charge}} net charge'
  },
  summaryNeutralChargesPattern: {
    value: '{{amount}} pairs of negative and positive charges'
  },
  summaryObjectChargePattern: {
    value: '{{object}}, {{charge}}.'
  },
  summaryObjectEachHasPattern: {
    value: '{{object}}, each has {{charge}}.'
  },
  summaryObjectEachPattern: {
    value: '{{object}}, each {{charge}}.'
  },
  summarySweaterWallPattern: {
    value: '{{sweater}} {{wall}}'
  },
  // summary phrases when both balloons are inducing charge
  summarySecondBalloonInducingChargePattern: {
    value: 'from Green Balloon {{amount}}.'
  },
  summaryBothBalloonsPattern: {
    value: '{{yellowBalloon}}, {{greenBalloon}} Positive charges do not move.'
  },
  //------------------------------------------------------------------------
  // Induced charge strings
  //------------------------------------------------------------------------
  aLittleBit: {
    value: 'a little bit'
  },
  aLot: {
    value: 'a lot'
  },
  quiteALot: {
    value: 'quite a lot'
  },
  //------------------------------------------------------------------------
  // Charge view strings
  //------------------------------------------------------------------------
  showingNoCharges: {
    value: 'showing no charges'
  },
  //------------------------------------------------------------------------
  // Object strings (strings shared between all objects)
  //------------------------------------------------------------------------
  manyChargePairs: {
    value: 'many pairs of negative and positive charges'
  },
  //------------------------------------------------------------------------
  // Sweater strings
  //------------------------------------------------------------------------
  sweaterLabel: {
    value: 'Sweater'
  },
  sweaterPosition: {
    value: 'At left edge of Play Area.'
  },
  sweaterDescriptionPattern: {
    value: '{{position}} {{charge}}'
  },
  sweaterChargePattern: {
    value: '{{netCharge}}, {{relativeCharge}}'
  },
  sweaterNetChargePattern: {
    value: 'Has {{netCharge}} net charge'
  },
  sweaterRelativeChargePattern: {
    value: '{{charge}} more positive charges than negative charges'
  },
  sweaterShowingPattern: {
    value: 'showing {{charge}} positive charges'
  },
  sweaterRelativeChargeAllPattern: {
    value: '{{charge}} more positive charges than negative charges'
  },
  sweaterRelativeChargeDifferencesPattern: {
    value: 'showing {{charge}} positive charges'
  },
  sweaterNoMoreCharges: {
    value: 'no more negative charges, only positive charges'
  },
  showingAllPositiveCharges: {
    value: 'showing all positive charges'
  },
  sweaterHasRelativeChargePattern: {
    value: 'Sweater has {{relativeCharge}}.'
  },
  sweaterHasNetChargeShowingPattern: {
    value: 'Sweater has positive net charge, {{showing}}.'
  },
  positiveNetCharge: {
    value: 'positive net charge'
  },
  neutralNetCharge: {
    value: 'neutral net charge'
  },
  netNeutral: {
    value: 'neutral net'
  },
  netPositive: {
    value: 'positive net'
  },
  //------------------------------------------------------------------------
  // Wall strings
  //------------------------------------------------------------------------
  wallDescriptionPattern: {
    value: '{{position}}. {{charge}}.'
  },
  wallPosition: {
    value: 'At right edge of Play Area'
  },
  wallNoNetCharge: {
    value: 'Has zero net charge'
  },
  wallHasManyCharges: {
    value: 'Wall has many pairs of negative and positive charges.'
  },
  wallChargeWithoutInducedPattern: {
    value: '{{netCharge}}, {{shownCharges}}'
  },
  wallChargeWithInducedPattern: {
    value: '{{netCharge}}, {{shownCharges}}. {{inducedCharge}}'
  },
  wallTwoBalloonInducedChargePattern: {
    value: '{{yellowBalloon}} {{greenBalloon}}'
  },
  wallNoChangeInChargesPattern: {
    value: 'In {{position}}, no change in charges' // punctuation inserted in another string pattern
  },

  wallChargePatternStringWithLabel: {
    value: 'Wall {{wallCharge}}'
  },
  wallRubPattern: {
    value: '{{position}} {{charge}}'
  },
  wallRubAllPattern: {
    value: 'No transfer of charge. {{inducedCharge}}'
  },
  wallRubDiffPattern: {
    value: '{{balloonCharge}} {{wallCharge}}'
  },
  wallRubbingWithPairsPattern: {
    value: '{{rubbingAlert}} Wall has many pairs of negative and positive charges.'
  },
  noChangeInCharges: {
    value: 'No change in charges'
  },
  noChangeInNetCharge: {
    value: 'No change in net charge'
  },
  wallInducedChargeSummaryPattern: {
    value: '{{inducedCharge}} {{positiveCharges}}'
  },
  wallInducedChargeWithManyPairsPattern: {
    value: '{{inducedCharge}} {{chargePairs}}'
  },
  //--------------------------------------------------------------------------
  // Induced charge change strings
  //--------------------------------------------------------------------------
  moreInducedChargePattern: {
    value: 'Negative charges in {{position}} {{movement}} from {{balloon}}.'
  },
  lessInducedChargePattern: {
    value: 'Negative charges in {{position}} {{movement}}.'
  },
  moveAwayALittleMore: {
    value: 'move away a little more'
  },
  beginToReturn: {
    value: 'begin to return'
  },
  returnALittleMore: {
    value: 'return a little more'
  },
  positiveChargesDoNotMove: {
    value: 'Positive charges do not move'
  },
  //------------------------------------------------------------------------
  // Balloon strings
  //------------------------------------------------------------------------
  greenBalloonLabel: {
    value: 'Green Balloon'
  },
  yellowBalloonLabel: {
    value: 'Yellow Balloon'
  },
  grabBalloonPattern: {
    value: 'Grab {{balloon}}'
  },
  eachBalloon: {
    value: 'Each balloon'
  },
  bothBalloons: {
    value: 'balloons'
  },
  grabBalloonToPlay: {
    value: 'Grab balloon to play.'
  },
  grabBalloonKeyboardHelp: {
    value: 'Look for grab button to play. Once grabbed, use keyboard shortcuts to move balloon. Space to release.'
  },
  balloonPositionAttractiveStatePattern: {
    value: '{{attractiveState}} {{position}}'
  },
  balloonShowAllChargesPattern: {
    value: '{{stateAndPosition}} {{netCharge}}, {{relativeCharge}}.'
  },
  balloonLabelWithAttractiveStatePattern: {
    value: '{{balloonLabel}}, {{attractiveStateAndPosition}}'
  },
  // describing the attractive state of a balloon
  balloonStickingTo: {
    value: 'Sticking to'
  },
  balloonOn: {
    value: 'On'
  },
  balloonAt: {
    value: 'At'
  },
  balloonNear: {
    value: 'Near'
  },
  // balloon charge strings
  balloonNetChargePattern: {
    value: 'Has {{chargeAmount}} net charge'
  },
  balloonNetChargePatternStringWithLabel: {
    value: '{{balloon}} has {{chargeAmount}} net charge'
  },
  balloonZero: {
    value: 'zero'
  },
  balloonNegative: {
    value: 'negative'
  },
  balloonRelativeChargePattern: {
    value: '{{amount}} more negative charges than positive charges'
  },
  balloonChargeDifferencesPattern: {
    value: 'showing {{amount}} negative charges'
  },
  balloonHasRelativeChargePattern: {
    value: '{{balloonLabel}} has {{relativeCharge}}'
  },
  balloonHasNetChargePattern: {
    value: '{{balloon}} has {{charge}} net charge, {{showing}}'
  },
  //--------------------------------------------------------------------------
  // Balloon interaction strings
  //--------------------------------------------------------------------------
  released: {
    value: 'Released'
  },
  //--------------------------------------------------------------------------
  // Balloon movement strings
  //--------------------------------------------------------------------------
  initialMovementPattern: {
    value: 'Moves {{velocity}} {{direction}}.'
  },
  twoBalloonInitialMovementPattern: {
    value: '{{balloon}}, moves {{velocity}} {{direction}}.'
  },
  // described velocities
  extremelySlowly: {
    value: 'extremely slowly'
  },
  verySlowly: {
    value: 'very slowly'
  },
  slowly: {
    value: 'slowly'
  },
  quickly: {
    value: 'quickly'
  },
  veryQuickly: {
    value: 'very quickly'
  },
  noChangeAndPositionPattern: {
    value: 'No change in position. {{position}}'
  },
  twoBalloonNoChangeAndPositionPattern: {
    value: '{{balloon}}, no change in position. {{position}}'
  },
  noChangeWithInducedChargePattern: {
    value: '{{noChange}} {{inducedCharge}}'
  },
  continuousMovementPattern: {
    value: 'Moving {{direction}}.'
  },
  continuousMovementWithLandmarkPattern: {
    value: '{{movementDirection}} {{landmark}}.'
  },
  continuousMovementWithLabelPattern: {
    value: '{{balloonLabel}}, moving {{direction}}.'
  },
  nowDirectionPattern: {
    value: 'Now {{direction}}.'
  },
  twoBalloonNowDirectionPattern: {
    value: '{{balloon}}, now {{direction}}.'
  },
  // when balloon hits wall and there is a change in charges
  balloonPositionNoChangePattern: {
    value: '{{position}} {{inducedCharge}}'
  },
  //--------------------------------------------------------------------------
  // Balloon Dragging strings, single statement with no other context
  //--------------------------------------------------------------------------
  upDragging: {
    value: 'Up.'
  },
  leftDragging: {
    value: 'Left.'
  },
  downDragging: {
    value: 'Down.'
  },
  rightDragging: {
    value: 'Right.'
  },
  upAndToTheRightDragging: {
    value: 'Up and to the right.'
  },
  upAndToTheLeftDragging: {
    value: 'Up and to the left.'
  },
  downAndToTheRightDragging: {
    value: 'Down and to the right.'
  },
  downAndToTheLeftDragging: {
    value: 'Down and to the left.'
  },
  // similar to dragging direction strings, but in context so not capitalized and no punctuation
  up: {
    value: 'up'
  },
  left: {
    value: 'left'
  },
  down: {
    value: 'down'
  },
  right: {
    value: 'right'
  },
  upAndToTheRight: {
    value: 'up and to the right'
  },
  upAndToTheLeft: {
    value: 'up and to the left'
  },
  downAndToTheRight: {
    value: 'down and to the right'
  },
  downAndToTheLeft: {
    value: 'down and to the left'
  },
  // dragging, specific cues when the balloon enters an important area
  balloonAtPositionPattern: {
    value: 'At {{position}}'
  },
  balloonNewRegionPattern: {
    value: '{{nearOrAt}} {{position}}'
  },
  closerToObjectPattern: {
    value: 'Closer to {{object}}'
  },
  topEdgeOfPlayArea: {
    value: 'top edge of Play Area'
  },
  bottomEdgeOfPlayArea: {
    value: 'bottom edge of Play Area'
  },
  //--------------------------------------------------------------------------
  // Balloon grabbing strings (when the balloon is initially picked up)
  //--------------------------------------------------------------------------
  grabbedNonePattern: {
    value: 'Grabbed. {{position}}'
  },
  grabbedChargePattern: {
    value: 'Grabbed. {{position}} {{charge}}'
  },
  grabbedWithOtherChargePattern: {
    value: '{{balloonCharge}} {{otherObjectCharge}}'
  },
  grabbedWithHelpPattern: {
    value: '{{grabbedAlert}} {{help}}'
  },
  balloonHasChargePattern: {
    value: 'Has {{charge}}'
  },
  balloonHasChargeShowingPattern: {
    value: 'Has {{charge}} net charge, {{showing}}'
  },
  balloonRelativeChargeAllPattern: {
    value: 'Has {{charge}}'
  },
  combinedChargePattern: {
    value: '{{grabbedBalloon}}. {{otherBalloon}}'
  },
  keyboardInteractionCue: {
    value: 'Press W, A, S, or D key to move balloon. Space to release.'
  },
  touchInteractionCue: {
    value: 'Drag finger to move balloon. Lift finger to release.'
  },
  //--------------------------------------------------------------------------
  // Balloon sweater rubbing strings
  //--------------------------------------------------------------------------
  balloonPicksUpChargesPattern: {
    value: '{{balloon}} picks up negative charges from sweater'
  },
  balloonPicksUpChargesDiffPattern: {
    value: '{{pickUp}}. Same increase of positive charges on sweater.'
  },
  balloonPicksUpMoreChargesPattern: {
    value: '{{balloon}} picks up more negative charges'
  },
  balloonPicksUpMoreChargesDiffPattern: {
    value: '{{pickUp}}. Same increase of positive charges on sweater.'
  },
  balloonSweaterRelativeChargesPattern: {
    value: '{{balloon}} {{sweater}}'
  },
  lastChargePickedUpPattern: {
    value: '{{sweater}} {{balloon}}.'
  },
  //--------------------------------------------------------------------------
  // Balloon rubbing strings, fail to pick up charges
  //--------------------------------------------------------------------------
  noChargePickupPattern: {
    value: '{{noChange}}. {{balloonPosition}}. {{moreChargesPosition}}'
  },
  nochargePickupWithObjectChargeAndHint: {
    value: '{{noChange}}. {{balloonPosition}}. {{sweaterCharge}} {{balloonCharge}} {{hint}}'
  },
  noChargePickupHintPattern: {
    value: '{{noChange}}. {{balloonPosition}}. {{hint}}'
  },
  releaseHint: {
    value: 'Press Space to release.'
  },
  moreChargesPattern: {
    value: '{{moreCharges}} {{direction}}.'
  },
  moreChargesFurtherPattern: {
    value: '{{moreCharges}} further {{direction}}.'
  },
  morePairsOfCharges: {
    value: 'More pairs of charges'
  },
  moreHiddenPairsOfCharges: {
    value: 'More hidden pairs of charges'
  },
  //--------------------------------------------------------------------------
  // Balloon jumping strings
  //--------------------------------------------------------------------------
  nearSweater: {
    value: 'Near sweater.'
  },
  positionAndInducedChargePattern: {
    value: '{{position}}. {{inducedCharge}}'
  },
  //------------------------------------------------------------------------
  // Control panel strings
  //------------------------------------------------------------------------
  balloonSettingsLabel: {
    value: 'Balloon Settings'
  },
  chargeSettingsDescription: {
    value: 'Choose how you see or hear charge information.'
  },
  chargeSettingsLabel: {
    value: 'Charge Settings'
  },
  showAllChargesAlert: {
    value: 'No charges hidden.'
  },
  shoNoChargesAlert: {
    value: 'All charges hidden.'
  },
  showChargeDifferencesAlert: {
    value: 'Only unpaired charges shown.'
  },
  resetBalloonsDescriptionPattern: {
    value: 'Reset {{balloons}} to start {{positions}} and an uncharged state.'
  },
  // balloon grab cue
  balloonButtonHelp: {
    value: 'Look for grab button to play.'
  },
  // misc labels
  removeWallDescription: {
    value: 'Play with or without the wall.'
  },
  twoBalloonExperimentDescription: {
    value: 'Play with two balloons or just one.'
  },
  balloon: {
    value: 'Balloon'
  },
  balloons: {
    value: 'Balloons'
  },
  twoBalloonExperimentLabel: {
    value: 'Two-Balloon Experiments'
  },
  wallLabel: {
    value: 'Wall'
  },
  // alert when the balloons are reset
  resetBalloonsAlertPattern: {
    value: '{{balloons}} and sweater reset.'
  },
  // alerts when balloons added/removed from play area
  balloonAddedPattern: {
    value: '{{balloonLabel}} added to Play Area.'
  },
  balloonRemovedPattern: {
    value: '{{balloonLabel}} removed from Play Area.'
  },
  balloonAddedWithPositionPattern: {
    value: '{{balloonLabel}} added. {{position}}.'
  },
  balloonPositionNearOtherPattern: {
    value: '{{position}}, next to {{otherBalloon}}'
  },
  //--------------------------------------------------------------------------
  // Keyboard shortcuts help content strings
  //--------------------------------------------------------------------------
  grabOrReleaseBalloonDescription: {
    value: 'Grab or release the balloon with Space or Enter keys.'
  },
  moveGrabbedBalloonDescription: {
    value: 'Move grabbed balloon up, left, down, or right with Arrow keys or with letter keys W, A, S, or D.'
  },
  moveSlowerDescription: {
    value: 'Move slower with Shift plus Arrow keys or Shift plus letter keys W, A, S, or D.'
  },
  jumpsCloseToSweaterDescription: {
    value: 'Jump close to sweater with J plus S.'
  },
  jumpsCloseToWwallDescription: {
    value: 'Jump to wall with J plus W.'
  },
  jumpsNearWallDescription: {
    value: 'Jump to near wall with J plus N.'
  },
  jumpstoCenterDescription: {
    value: 'Jump to center with J plus C.'
  }
};
if (phet.chipper.queryParameters.stringTest === 'xss') {
  for (const key in BASEA11yStrings) {
    BASEA11yStrings[key].value += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.position.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
  }
}

// verify that object is immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(BASEA11yStrings);
}
balloonsAndStaticElectricity.register('BASEA11yStrings', BASEA11yStrings);
export default BASEA11yStrings;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IiwiQkFTRUExMXlTdHJpbmdzIiwic2luZ2xlU3RhdGVtZW50UGF0dGVybiIsInZhbHVlIiwicG9zaXRpb24iLCJwb3NpdGlvbnMiLCJsZWZ0U2hvdWxkZXJPZlN3ZWF0ZXIiLCJsZWZ0QXJtT2ZTd2VhdGVyIiwiYm90dG9tTGVmdEVkZ2VPZlN3ZWF0ZXIiLCJ1cHBlckxlZnRTaWRlT2ZTd2VhdGVyIiwibGVmdFNpZGVPZlN3ZWF0ZXIiLCJsb3dlckxlZnRTaWRlT2ZTd2VhdGVyIiwidXBwZXJSaWdodFNpZGVPZlN3ZWF0ZXIiLCJyaWdodFNpZGVPZlN3ZWF0ZXIiLCJsb3dlclJpZ2h0U2lkZU9mU3dlYXRlciIsInJpZ2h0U2hvdWxkZXJPZlN3ZWF0ZXIiLCJyaWdodEFybU9mU3dlYXRlciIsImxvd2VyUmlnaHRBcm1PZlN3ZWF0ZXIiLCJ1cHBlckxlZnRTaWRlT2ZQbGF5QXJlYSIsImxlZnRTaWRlT2ZQbGF5QXJlYSIsImxvd2VyTGVmdFNpZGVPZlBsYXlBcmVhIiwidXBwZXJDZW50ZXJPZlBsYXlBcmVhIiwiY2VudGVyT2ZQbGF5QXJlYSIsImxvd2VyQ2VudGVyT2ZQbGF5QXJlYSIsInVwcGVyUmlnaHRTaWRlT2ZQbGF5QXJlYSIsInJpZ2h0U2lkZU9mUGxheUFyZWEiLCJsb3dlclJpZ2h0U2lkZU9mUGxheUFyZWEiLCJ1cHBlcldhbGwiLCJ3YWxsIiwibG93ZXJXYWxsIiwidXBwZXJSaWdodEVkZ2VPZlBsYXlBcmVhIiwicmlnaHRFZGdlT2ZQbGF5QXJlYSIsImxvd2VyUmlnaHRFZGdlT2ZQbGF5QXJlYSIsImxhbmRtYXJrTmVhclN3ZWF0ZXIiLCJsYW5kbWFya0xlZnRFZGdlIiwibGFuZG1hcmtOZWFyVXBwZXJXYWxsIiwibGFuZG1hcmtOZWFyV2FsbCIsImxhbmRtYXJrTmVhckxvd2VyV2FsbCIsImxhbmRtYXJrTmVhclVwcGVyUmlnaHRFZGdlIiwibGFuZG1hcmtOZWFyUmlnaHRFZGdlIiwibGFuZG1hcmtOZWFyTG93ZXJSaWdodEVkZ2UiLCJsYW5kbWFya0F0Q2VudGVyUGxheUFyZWEiLCJsYW5kbWFya0F0VXBwZXJDZW50ZXJQbGF5QXJlYSIsImxhbmRtYXJrQXRMb3dlckNlbnRlclBsYXlBcmVhIiwiYmFsbG9vblZlcnlDbG9zZVRvIiwiYXRMZWZ0RWRnZSIsImF0VG9wIiwiYXRCb3R0b20iLCJhdFJpZ2h0RWRnZSIsImF0V2FsbCIsIm9uU3dlYXRlciIsIm9mZlN3ZWF0ZXIiLCJuZXV0cmFsIiwibmVnYXRpdmUiLCJwb3NpdGl2ZSIsIm5vIiwiYUZldyIsInNldmVyYWwiLCJtYW55IiwiYWxsIiwiemVybyIsInN3ZWF0ZXIiLCJ3YWxsUmVtb3ZlZCIsIndhbGxBZGRlZCIsInNpbU9wZW5pbmciLCJyb29tT2JqZWN0c1BhdHRlcm4iLCJhWWVsbG93QmFsbG9vbiIsImFHcmVlbkJhbGxvb24iLCJhU3dlYXRlciIsImFuZEFTd2VhdGVyIiwiYW5kQVJlbW92YWJsZVdhbGwiLCJzdW1tYXJ5WWVsbG93R3JlZW5Td2VhdGVyV2FsbFBhdHRlcm4iLCJzdW1tYXJ5WWVsbG93R3JlZW5Td2VhdGVyUGF0dGVybiIsInN1bW1hcnlZZWxsb3dTd2VhdGVyV2FsbFBhdHRlcm4iLCJzdW1tYXJ5WWVsbG93U3dlYXRlclBhdHRlcm4iLCJpbmR1Y2VkQ2hhcmdlUGF0dGVybiIsImluZHVjZWRDaGFyZ2VOb0Ftb3VudFBhdHRlcm4iLCJzdW1tYXJ5QmFsbG9vbk5ldXRyYWxDaGFyZ2UiLCJzdW1tYXJ5QmFsbG9vbkNoYXJnZVBhdHRlcm4iLCJzdW1tYXJ5RWFjaEJhbGxvb25DaGFyZ2VQYXR0ZXJuIiwic3VtbWFyeVN3ZWF0ZXJBbmRXYWxsIiwiaW5pdGlhbE9iamVjdFBvc2l0aW9ucyIsInN1bW1hcnlPYmplY3RIYXNDaGFyZ2VQYXR0ZXJuIiwic3VtbWFyeU9iamVjdHNIYXZlQ2hhcmdlUGF0dGVybiIsInN1bW1hcnlOZXV0cmFsQ2hhcmdlc1BhdHRlcm4iLCJzdW1tYXJ5T2JqZWN0Q2hhcmdlUGF0dGVybiIsInN1bW1hcnlPYmplY3RFYWNoSGFzUGF0dGVybiIsInN1bW1hcnlPYmplY3RFYWNoUGF0dGVybiIsInN1bW1hcnlTd2VhdGVyV2FsbFBhdHRlcm4iLCJzdW1tYXJ5U2Vjb25kQmFsbG9vbkluZHVjaW5nQ2hhcmdlUGF0dGVybiIsInN1bW1hcnlCb3RoQmFsbG9vbnNQYXR0ZXJuIiwiYUxpdHRsZUJpdCIsImFMb3QiLCJxdWl0ZUFMb3QiLCJzaG93aW5nTm9DaGFyZ2VzIiwibWFueUNoYXJnZVBhaXJzIiwic3dlYXRlckxhYmVsIiwic3dlYXRlclBvc2l0aW9uIiwic3dlYXRlckRlc2NyaXB0aW9uUGF0dGVybiIsInN3ZWF0ZXJDaGFyZ2VQYXR0ZXJuIiwic3dlYXRlck5ldENoYXJnZVBhdHRlcm4iLCJzd2VhdGVyUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuIiwic3dlYXRlclNob3dpbmdQYXR0ZXJuIiwic3dlYXRlclJlbGF0aXZlQ2hhcmdlQWxsUGF0dGVybiIsInN3ZWF0ZXJSZWxhdGl2ZUNoYXJnZURpZmZlcmVuY2VzUGF0dGVybiIsInN3ZWF0ZXJOb01vcmVDaGFyZ2VzIiwic2hvd2luZ0FsbFBvc2l0aXZlQ2hhcmdlcyIsInN3ZWF0ZXJIYXNSZWxhdGl2ZUNoYXJnZVBhdHRlcm4iLCJzd2VhdGVySGFzTmV0Q2hhcmdlU2hvd2luZ1BhdHRlcm4iLCJwb3NpdGl2ZU5ldENoYXJnZSIsIm5ldXRyYWxOZXRDaGFyZ2UiLCJuZXROZXV0cmFsIiwibmV0UG9zaXRpdmUiLCJ3YWxsRGVzY3JpcHRpb25QYXR0ZXJuIiwid2FsbFBvc2l0aW9uIiwid2FsbE5vTmV0Q2hhcmdlIiwid2FsbEhhc01hbnlDaGFyZ2VzIiwid2FsbENoYXJnZVdpdGhvdXRJbmR1Y2VkUGF0dGVybiIsIndhbGxDaGFyZ2VXaXRoSW5kdWNlZFBhdHRlcm4iLCJ3YWxsVHdvQmFsbG9vbkluZHVjZWRDaGFyZ2VQYXR0ZXJuIiwid2FsbE5vQ2hhbmdlSW5DaGFyZ2VzUGF0dGVybiIsIndhbGxDaGFyZ2VQYXR0ZXJuU3RyaW5nV2l0aExhYmVsIiwid2FsbFJ1YlBhdHRlcm4iLCJ3YWxsUnViQWxsUGF0dGVybiIsIndhbGxSdWJEaWZmUGF0dGVybiIsIndhbGxSdWJiaW5nV2l0aFBhaXJzUGF0dGVybiIsIm5vQ2hhbmdlSW5DaGFyZ2VzIiwibm9DaGFuZ2VJbk5ldENoYXJnZSIsIndhbGxJbmR1Y2VkQ2hhcmdlU3VtbWFyeVBhdHRlcm4iLCJ3YWxsSW5kdWNlZENoYXJnZVdpdGhNYW55UGFpcnNQYXR0ZXJuIiwibW9yZUluZHVjZWRDaGFyZ2VQYXR0ZXJuIiwibGVzc0luZHVjZWRDaGFyZ2VQYXR0ZXJuIiwibW92ZUF3YXlBTGl0dGxlTW9yZSIsImJlZ2luVG9SZXR1cm4iLCJyZXR1cm5BTGl0dGxlTW9yZSIsInBvc2l0aXZlQ2hhcmdlc0RvTm90TW92ZSIsImdyZWVuQmFsbG9vbkxhYmVsIiwieWVsbG93QmFsbG9vbkxhYmVsIiwiZ3JhYkJhbGxvb25QYXR0ZXJuIiwiZWFjaEJhbGxvb24iLCJib3RoQmFsbG9vbnMiLCJncmFiQmFsbG9vblRvUGxheSIsImdyYWJCYWxsb29uS2V5Ym9hcmRIZWxwIiwiYmFsbG9vblBvc2l0aW9uQXR0cmFjdGl2ZVN0YXRlUGF0dGVybiIsImJhbGxvb25TaG93QWxsQ2hhcmdlc1BhdHRlcm4iLCJiYWxsb29uTGFiZWxXaXRoQXR0cmFjdGl2ZVN0YXRlUGF0dGVybiIsImJhbGxvb25TdGlja2luZ1RvIiwiYmFsbG9vbk9uIiwiYmFsbG9vbkF0IiwiYmFsbG9vbk5lYXIiLCJiYWxsb29uTmV0Q2hhcmdlUGF0dGVybiIsImJhbGxvb25OZXRDaGFyZ2VQYXR0ZXJuU3RyaW5nV2l0aExhYmVsIiwiYmFsbG9vblplcm8iLCJiYWxsb29uTmVnYXRpdmUiLCJiYWxsb29uUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuIiwiYmFsbG9vbkNoYXJnZURpZmZlcmVuY2VzUGF0dGVybiIsImJhbGxvb25IYXNSZWxhdGl2ZUNoYXJnZVBhdHRlcm4iLCJiYWxsb29uSGFzTmV0Q2hhcmdlUGF0dGVybiIsInJlbGVhc2VkIiwiaW5pdGlhbE1vdmVtZW50UGF0dGVybiIsInR3b0JhbGxvb25Jbml0aWFsTW92ZW1lbnRQYXR0ZXJuIiwiZXh0cmVtZWx5U2xvd2x5IiwidmVyeVNsb3dseSIsInNsb3dseSIsInF1aWNrbHkiLCJ2ZXJ5UXVpY2tseSIsIm5vQ2hhbmdlQW5kUG9zaXRpb25QYXR0ZXJuIiwidHdvQmFsbG9vbk5vQ2hhbmdlQW5kUG9zaXRpb25QYXR0ZXJuIiwibm9DaGFuZ2VXaXRoSW5kdWNlZENoYXJnZVBhdHRlcm4iLCJjb250aW51b3VzTW92ZW1lbnRQYXR0ZXJuIiwiY29udGludW91c01vdmVtZW50V2l0aExhbmRtYXJrUGF0dGVybiIsImNvbnRpbnVvdXNNb3ZlbWVudFdpdGhMYWJlbFBhdHRlcm4iLCJub3dEaXJlY3Rpb25QYXR0ZXJuIiwidHdvQmFsbG9vbk5vd0RpcmVjdGlvblBhdHRlcm4iLCJiYWxsb29uUG9zaXRpb25Ob0NoYW5nZVBhdHRlcm4iLCJ1cERyYWdnaW5nIiwibGVmdERyYWdnaW5nIiwiZG93bkRyYWdnaW5nIiwicmlnaHREcmFnZ2luZyIsInVwQW5kVG9UaGVSaWdodERyYWdnaW5nIiwidXBBbmRUb1RoZUxlZnREcmFnZ2luZyIsImRvd25BbmRUb1RoZVJpZ2h0RHJhZ2dpbmciLCJkb3duQW5kVG9UaGVMZWZ0RHJhZ2dpbmciLCJ1cCIsImxlZnQiLCJkb3duIiwicmlnaHQiLCJ1cEFuZFRvVGhlUmlnaHQiLCJ1cEFuZFRvVGhlTGVmdCIsImRvd25BbmRUb1RoZVJpZ2h0IiwiZG93bkFuZFRvVGhlTGVmdCIsImJhbGxvb25BdFBvc2l0aW9uUGF0dGVybiIsImJhbGxvb25OZXdSZWdpb25QYXR0ZXJuIiwiY2xvc2VyVG9PYmplY3RQYXR0ZXJuIiwidG9wRWRnZU9mUGxheUFyZWEiLCJib3R0b21FZGdlT2ZQbGF5QXJlYSIsImdyYWJiZWROb25lUGF0dGVybiIsImdyYWJiZWRDaGFyZ2VQYXR0ZXJuIiwiZ3JhYmJlZFdpdGhPdGhlckNoYXJnZVBhdHRlcm4iLCJncmFiYmVkV2l0aEhlbHBQYXR0ZXJuIiwiYmFsbG9vbkhhc0NoYXJnZVBhdHRlcm4iLCJiYWxsb29uSGFzQ2hhcmdlU2hvd2luZ1BhdHRlcm4iLCJiYWxsb29uUmVsYXRpdmVDaGFyZ2VBbGxQYXR0ZXJuIiwiY29tYmluZWRDaGFyZ2VQYXR0ZXJuIiwia2V5Ym9hcmRJbnRlcmFjdGlvbkN1ZSIsInRvdWNoSW50ZXJhY3Rpb25DdWUiLCJiYWxsb29uUGlja3NVcENoYXJnZXNQYXR0ZXJuIiwiYmFsbG9vblBpY2tzVXBDaGFyZ2VzRGlmZlBhdHRlcm4iLCJiYWxsb29uUGlja3NVcE1vcmVDaGFyZ2VzUGF0dGVybiIsImJhbGxvb25QaWNrc1VwTW9yZUNoYXJnZXNEaWZmUGF0dGVybiIsImJhbGxvb25Td2VhdGVyUmVsYXRpdmVDaGFyZ2VzUGF0dGVybiIsImxhc3RDaGFyZ2VQaWNrZWRVcFBhdHRlcm4iLCJub0NoYXJnZVBpY2t1cFBhdHRlcm4iLCJub2NoYXJnZVBpY2t1cFdpdGhPYmplY3RDaGFyZ2VBbmRIaW50Iiwibm9DaGFyZ2VQaWNrdXBIaW50UGF0dGVybiIsInJlbGVhc2VIaW50IiwibW9yZUNoYXJnZXNQYXR0ZXJuIiwibW9yZUNoYXJnZXNGdXJ0aGVyUGF0dGVybiIsIm1vcmVQYWlyc09mQ2hhcmdlcyIsIm1vcmVIaWRkZW5QYWlyc09mQ2hhcmdlcyIsIm5lYXJTd2VhdGVyIiwicG9zaXRpb25BbmRJbmR1Y2VkQ2hhcmdlUGF0dGVybiIsImJhbGxvb25TZXR0aW5nc0xhYmVsIiwiY2hhcmdlU2V0dGluZ3NEZXNjcmlwdGlvbiIsImNoYXJnZVNldHRpbmdzTGFiZWwiLCJzaG93QWxsQ2hhcmdlc0FsZXJ0Iiwic2hvTm9DaGFyZ2VzQWxlcnQiLCJzaG93Q2hhcmdlRGlmZmVyZW5jZXNBbGVydCIsInJlc2V0QmFsbG9vbnNEZXNjcmlwdGlvblBhdHRlcm4iLCJiYWxsb29uQnV0dG9uSGVscCIsInJlbW92ZVdhbGxEZXNjcmlwdGlvbiIsInR3b0JhbGxvb25FeHBlcmltZW50RGVzY3JpcHRpb24iLCJiYWxsb29uIiwiYmFsbG9vbnMiLCJ0d29CYWxsb29uRXhwZXJpbWVudExhYmVsIiwid2FsbExhYmVsIiwicmVzZXRCYWxsb29uc0FsZXJ0UGF0dGVybiIsImJhbGxvb25BZGRlZFBhdHRlcm4iLCJiYWxsb29uUmVtb3ZlZFBhdHRlcm4iLCJiYWxsb29uQWRkZWRXaXRoUG9zaXRpb25QYXR0ZXJuIiwiYmFsbG9vblBvc2l0aW9uTmVhck90aGVyUGF0dGVybiIsImdyYWJPclJlbGVhc2VCYWxsb29uRGVzY3JpcHRpb24iLCJtb3ZlR3JhYmJlZEJhbGxvb25EZXNjcmlwdGlvbiIsIm1vdmVTbG93ZXJEZXNjcmlwdGlvbiIsImp1bXBzQ2xvc2VUb1N3ZWF0ZXJEZXNjcmlwdGlvbiIsImp1bXBzQ2xvc2VUb1d3YWxsRGVzY3JpcHRpb24iLCJqdW1wc05lYXJXYWxsRGVzY3JpcHRpb24iLCJqdW1wc3RvQ2VudGVyRGVzY3JpcHRpb24iLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInN0cmluZ1Rlc3QiLCJrZXkiLCJhc3NlcnQiLCJPYmplY3QiLCJmcmVlemUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJBU0VBMTF5U3RyaW5ncy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaW5nbGUgcG9zaXRpb24gb2YgYWxsIGFjY2Vzc2liaWxpdHkgc3RyaW5ncy4gIFRoZXNlIHN0cmluZ3MgYXJlIG5vdCBtZWFudCB0byBiZSB0cmFuc2xhdGFibGUgeWV0LiAgUm9zZXR0YSBuZWVkc1xyXG4gKiBzb21lIHdvcmsgdG8gcHJvdmlkZSB0cmFuc2xhdG9ycyB3aXRoIGNvbnRleHQgZm9yIHRoZXNlIHN0cmluZ3MsIGFuZCB3ZSB3YW50IHRvIHJlY2VpdmUgc29tZSBjb21tdW5pdHkgZmVlZGJhY2tcclxuICogYmVmb3JlIHRoZXNlIHN0cmluZ3MgYXJlIHN1Ym1pdHRlZCBmb3IgdHJhbnNsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IGJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkgZnJvbSAnLi4vYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5qcyc7XHJcblxyXG5jb25zdCBCQVNFQTExeVN0cmluZ3MgPSB7XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gR2VuZXJhbCB1dGlsaXR5IHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIHNpbmdsZVN0YXRlbWVudFBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tzdGF0ZW1lbnR9fS4nXHJcbiAgfSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEdlbmVyYWwgbGFiZWxzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIHBvc2l0aW9uOiB7XHJcbiAgICB2YWx1ZTogJ3Bvc2l0aW9uJ1xyXG4gIH0sXHJcbiAgcG9zaXRpb25zOiB7XHJcbiAgICB2YWx1ZTogJ3Bvc2l0aW9ucydcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gUGxheSBBcmVhIG1hcCBncmlkIHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgbGVmdFNob3VsZGVyT2ZTd2VhdGVyOiB7XHJcbiAgICB2YWx1ZTogJ2xlZnQgc2hvdWxkZXIgb2Ygc3dlYXRlcidcclxuICB9LFxyXG4gIGxlZnRBcm1PZlN3ZWF0ZXI6IHtcclxuICAgIHZhbHVlOiAnbGVmdCBhcm0gb2Ygc3dlYXRlcidcclxuICB9LFxyXG4gIGJvdHRvbUxlZnRFZGdlT2ZTd2VhdGVyOiB7XHJcbiAgICB2YWx1ZTogJ2xvd2VyLWxlZnQgYXJtIG9mIHN3ZWF0ZXInXHJcbiAgfSxcclxuICB1cHBlckxlZnRTaWRlT2ZTd2VhdGVyOiB7XHJcbiAgICB2YWx1ZTogJ3VwcGVyLWxlZnQgc2lkZSBvZiBzd2VhdGVyJ1xyXG4gIH0sXHJcbiAgbGVmdFNpZGVPZlN3ZWF0ZXI6IHtcclxuICAgIHZhbHVlOiAnbGVmdCBzaWRlIG9mIHN3ZWF0ZXInXHJcbiAgfSxcclxuICBsb3dlckxlZnRTaWRlT2ZTd2VhdGVyOiB7XHJcbiAgICB2YWx1ZTogJ2xvd2VyLWxlZnQgc2lkZSBvZiBzd2VhdGVyJ1xyXG4gIH0sXHJcbiAgdXBwZXJSaWdodFNpZGVPZlN3ZWF0ZXI6IHtcclxuICAgIHZhbHVlOiAndXBwZXItcmlnaHQgc2lkZSBvZiBzd2VhdGVyJ1xyXG4gIH0sXHJcbiAgcmlnaHRTaWRlT2ZTd2VhdGVyOiB7XHJcbiAgICB2YWx1ZTogJ3JpZ2h0IHNpZGUgb2Ygc3dlYXRlcidcclxuICB9LFxyXG4gIGxvd2VyUmlnaHRTaWRlT2ZTd2VhdGVyOiB7XHJcbiAgICB2YWx1ZTogJ2xvd2VyLXJpZ2h0IHNpZGUgb2Ygc3dlYXRlcidcclxuICB9LFxyXG4gIHJpZ2h0U2hvdWxkZXJPZlN3ZWF0ZXI6IHtcclxuICAgIHZhbHVlOiAncmlnaHQgc2hvdWxkZXIgb2Ygc3dlYXRlcidcclxuICB9LFxyXG4gIHJpZ2h0QXJtT2ZTd2VhdGVyOiB7XHJcbiAgICB2YWx1ZTogJ3JpZ2h0IGFybSBvZiBzd2VhdGVyJ1xyXG4gIH0sXHJcbiAgbG93ZXJSaWdodEFybU9mU3dlYXRlcjoge1xyXG4gICAgdmFsdWU6ICdsb3dlci1yaWdodCBhcm0gb2Ygc3dlYXRlcidcclxuICB9LFxyXG4gIHVwcGVyTGVmdFNpZGVPZlBsYXlBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ3VwcGVyLWxlZnQgc2lkZSBvZiBQbGF5IEFyZWEnXHJcbiAgfSxcclxuICBsZWZ0U2lkZU9mUGxheUFyZWE6IHtcclxuICAgIHZhbHVlOiAnbGVmdCBzaWRlIG9mIFBsYXkgQXJlYSdcclxuICB9LFxyXG4gIGxvd2VyTGVmdFNpZGVPZlBsYXlBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ2xvd2VyLWxlZnQgc2lkZSBvZiBQbGF5IEFyZWEnXHJcbiAgfSxcclxuICB1cHBlckNlbnRlck9mUGxheUFyZWE6IHtcclxuICAgIHZhbHVlOiAndXBwZXItY2VudGVyIG9mIFBsYXkgQXJlYSdcclxuICB9LFxyXG4gIGNlbnRlck9mUGxheUFyZWE6IHtcclxuICAgIHZhbHVlOiAnY2VudGVyIG9mIFBsYXkgQXJlYSdcclxuICB9LFxyXG4gIGxvd2VyQ2VudGVyT2ZQbGF5QXJlYToge1xyXG4gICAgdmFsdWU6ICdsb3dlci1jZW50ZXIgb2YgUGxheSBBcmVhJ1xyXG4gIH0sXHJcbiAgdXBwZXJSaWdodFNpZGVPZlBsYXlBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ3VwcGVyLXJpZ2h0IHNpZGUgb2YgUGxheSBBcmVhJ1xyXG4gIH0sXHJcbiAgcmlnaHRTaWRlT2ZQbGF5QXJlYToge1xyXG4gICAgdmFsdWU6ICdyaWdodCBzaWRlIG9mIFBsYXkgQXJlYSdcclxuICB9LFxyXG4gIGxvd2VyUmlnaHRTaWRlT2ZQbGF5QXJlYToge1xyXG4gICAgdmFsdWU6ICdsb3dlci1yaWdodCBzaWRlIG9mIFBsYXkgQXJlYSdcclxuICB9LFxyXG4gIHVwcGVyV2FsbDoge1xyXG4gICAgdmFsdWU6ICd1cHBlciB3YWxsJ1xyXG4gIH0sXHJcbiAgd2FsbDoge1xyXG4gICAgdmFsdWU6ICd3YWxsJ1xyXG4gIH0sXHJcbiAgbG93ZXJXYWxsOiB7XHJcbiAgICB2YWx1ZTogJ2xvd2VyIHdhbGwnXHJcbiAgfSxcclxuICB1cHBlclJpZ2h0RWRnZU9mUGxheUFyZWE6IHtcclxuICAgIHZhbHVlOiAndXBwZXItcmlnaHQgZWRnZSBvZiBQbGF5IEFyZWEnXHJcbiAgfSxcclxuICByaWdodEVkZ2VPZlBsYXlBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ3JpZ2h0IGVkZ2Ugb2YgUGxheSBBcmVhJ1xyXG4gIH0sXHJcbiAgbG93ZXJSaWdodEVkZ2VPZlBsYXlBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ2xvd2VyLXJpZ2h0IGVkZ2Ugb2YgUGxheSBBcmVhJ1xyXG4gIH0sXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBQbGF5IEFyZWEgbGFuZG1hcmsgc3RyaW5ncywgJ25lYXInIG9yICAnYXQnIGFkZGVkICB0aHJvdWdoIHN0cmluZyBwYXR0ZXJuc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICBsYW5kbWFya05lYXJTd2VhdGVyOiB7XHJcbiAgICB2YWx1ZTogJ3N3ZWF0ZXInXHJcbiAgfSxcclxuICBsYW5kbWFya0xlZnRFZGdlOiB7XHJcbiAgICB2YWx1ZTogJ2xlZnQgZWRnZSdcclxuICB9LFxyXG4gIGxhbmRtYXJrTmVhclVwcGVyV2FsbDoge1xyXG4gICAgdmFsdWU6ICd1cHBlciB3YWxsJ1xyXG4gIH0sXHJcbiAgbGFuZG1hcmtOZWFyV2FsbDoge1xyXG4gICAgdmFsdWU6ICd3YWxsJ1xyXG4gIH0sXHJcbiAgbGFuZG1hcmtOZWFyTG93ZXJXYWxsOiB7XHJcbiAgICB2YWx1ZTogJ2xvd2VyIHdhbGwnXHJcbiAgfSxcclxuICBsYW5kbWFya05lYXJVcHBlclJpZ2h0RWRnZToge1xyXG4gICAgdmFsdWU6ICd1cHBlciByaWdodCBlZGdlJ1xyXG4gIH0sXHJcbiAgbGFuZG1hcmtOZWFyUmlnaHRFZGdlOiB7XHJcbiAgICB2YWx1ZTogJ3JpZ2h0IGVkZ2UnXHJcbiAgfSxcclxuICBsYW5kbWFya05lYXJMb3dlclJpZ2h0RWRnZToge1xyXG4gICAgdmFsdWU6ICdsb3dlci1yaWdodCBlZGdlJ1xyXG4gIH0sXHJcbiAgbGFuZG1hcmtBdENlbnRlclBsYXlBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ2NlbnRlciBvZiBQbGF5IEFyZWEnXHJcbiAgfSxcclxuICBsYW5kbWFya0F0VXBwZXJDZW50ZXJQbGF5QXJlYToge1xyXG4gICAgdmFsdWU6ICd1cHBlci1jZW50ZXIgb2YgUGxheSBBcmVhJ1xyXG4gIH0sXHJcbiAgbGFuZG1hcmtBdExvd2VyQ2VudGVyUGxheUFyZWE6IHtcclxuICAgIHZhbHVlOiAnbG93ZXItY2VudGVyIG9mIFBsYXkgQXJlYSdcclxuICB9LFxyXG4gIGJhbGxvb25WZXJ5Q2xvc2VUbzoge1xyXG4gICAgdmFsdWU6ICdWZXJ5IGNsb3NlIHRvJ1xyXG4gIH0sXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBCb3VuZGFyeSBvciBDcml0aWNhbCBwb3NpdGlvbiBzdHJpbmdzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGF0TGVmdEVkZ2U6IHtcclxuICAgIHZhbHVlOiAnQXQgbGVmdCBlZGdlLidcclxuICB9LFxyXG4gIGF0VG9wOiB7XHJcbiAgICB2YWx1ZTogJ0F0IHRvcC4nXHJcbiAgfSxcclxuICBhdEJvdHRvbToge1xyXG4gICAgdmFsdWU6ICdBdCBib3R0b20uJ1xyXG4gIH0sXHJcbiAgYXRSaWdodEVkZ2U6IHtcclxuICAgIHZhbHVlOiAnQXQgcmlnaHQgZWRnZS4nXHJcbiAgfSxcclxuICBhdFdhbGw6IHtcclxuICAgIHZhbHVlOiAnQXQgd2FsbC4nXHJcbiAgfSxcclxuICBvblN3ZWF0ZXI6IHtcclxuICAgIHZhbHVlOiAnT24gU3dlYXRlcidcclxuICB9LFxyXG4gIG9mZlN3ZWF0ZXI6IHtcclxuICAgIHZhbHVlOiAnT2ZmIHN3ZWF0ZXIuJ1xyXG4gIH0sXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBDaGFyZ2UgY2FwYWNpdHkgc3RyaW5nc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICBuZXV0cmFsOiB7XHJcbiAgICB2YWx1ZTogJ25ldXRyYWwnXHJcbiAgfSxcclxuICBuZWdhdGl2ZToge1xyXG4gICAgdmFsdWU6ICduZWdhdGl2ZSdcclxuICB9LFxyXG4gIHBvc2l0aXZlOiB7XHJcbiAgICB2YWx1ZTogJ3Bvc2l0aXZlJ1xyXG4gIH0sXHJcblxyXG4gIG5vOiB7XHJcbiAgICB2YWx1ZTogJ25vJ1xyXG4gIH0sXHJcbiAgYUZldzoge1xyXG4gICAgdmFsdWU6ICdhIGZldydcclxuICB9LFxyXG4gIHNldmVyYWw6IHtcclxuICAgIHZhbHVlOiAnc2V2ZXJhbCdcclxuICB9LFxyXG4gIG1hbnk6IHtcclxuICAgIHZhbHVlOiAnbWFueSdcclxuICB9LFxyXG4gIGFsbDoge1xyXG4gICAgdmFsdWU6ICdhbGwnXHJcbiAgfSxcclxuICB6ZXJvOiB7XHJcbiAgICB2YWx1ZTogJ3plcm8nXHJcbiAgfSxcclxuXHJcbiAgc3dlYXRlcjoge1xyXG4gICAgdmFsdWU6ICdzd2VhdGVyJ1xyXG4gIH0sXHJcblxyXG4gIC8vIGFsZXJ0cyBmb3Igd2hlbiB3YWxsIGlzIGFkZGVkIG9yIHJlbW92ZWQgZnJvbSBwbGF5IGFyZWFcclxuICB3YWxsUmVtb3ZlZDoge1xyXG4gICAgdmFsdWU6ICdXYWxsIHJlbW92ZWQgZnJvbSBQbGF5IEFyZWEuJ1xyXG4gIH0sXHJcbiAgd2FsbEFkZGVkOiB7XHJcbiAgICB2YWx1ZTogJ1dhbGwgYWRkZWQgdG8gUGxheSBBcmVhLidcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIHNjcmVlbiBzdW1tYXJ5IHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIHNpbU9wZW5pbmc6IHtcclxuICAgIHZhbHVlOiAnVGhlIFBsYXkgQXJlYSBpcyBhIHNtYWxsIHJvb20uIFRoZSBDb250cm9sIEFyZWEgaGFzIGJ1dHRvbnMsIGEgY2hlY2tib3gsIGFuZCByYWRpbyBidXR0b25zIHRvIGNoYW5nZSBjb25kaXRpb25zIGluIHRoZSByb29tLidcclxuICB9LFxyXG5cclxuICAvLyBvYmplY3RzIGZvciB0aGUgc2NyZWVuIHN1bW1hcnlcclxuICByb29tT2JqZWN0c1BhdHRlcm46IHtcclxuICAgIHZhbHVlOiAnQ3VycmVudGx5LCByb29tIGhhcyB7e2Rlc2NyaXB0aW9ufX0uJ1xyXG4gIH0sXHJcbiAgYVllbGxvd0JhbGxvb246IHtcclxuICAgIHZhbHVlOiAnYSB5ZWxsb3cgYmFsbG9vbiwnXHJcbiAgfSxcclxuICBhR3JlZW5CYWxsb29uOiB7XHJcbiAgICB2YWx1ZTogJ2EgZ3JlZW4gYmFsbG9vbiwnXHJcbiAgfSxcclxuICBhU3dlYXRlcjoge1xyXG4gICAgdmFsdWU6ICdhIHN3ZWF0ZXIsJ1xyXG4gIH0sXHJcbiAgYW5kQVN3ZWF0ZXI6IHtcclxuICAgIHZhbHVlOiAnYW5kIGEgc3dlYXRlcidcclxuICB9LFxyXG4gIGFuZEFSZW1vdmFibGVXYWxsOiB7XHJcbiAgICB2YWx1ZTogJ2FuZCBhIHJlbW92YWJsZSB3YWxsJ1xyXG4gIH0sXHJcbiAgc3VtbWFyeVllbGxvd0dyZWVuU3dlYXRlcldhbGxQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7eWVsbG93QmFsbG9vbn19IHt7Z3JlZW5CYWxsb29ufX0ge3tzd2VhdGVyfX0ge3t3YWxsfX0nXHJcbiAgfSxcclxuICBzdW1tYXJ5WWVsbG93R3JlZW5Td2VhdGVyUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3llbGxvd0JhbGxvb259fSB7e2dyZWVuQmFsbG9vbn19IHt7c3dlYXRlcn19J1xyXG4gIH0sXHJcbiAgc3VtbWFyeVllbGxvd1N3ZWF0ZXJXYWxsUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3llbGxvd0JhbGxvb259fSB7e3N3ZWF0ZXJ9fSB7e3dhbGx9fSdcclxuICB9LFxyXG4gIHN1bW1hcnlZZWxsb3dTd2VhdGVyUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3llbGxvd0JhbGxvb259fSB7e3N3ZWF0ZXJ9fSdcclxuICB9LFxyXG4gIGluZHVjZWRDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ05lZ2F0aXZlIGNoYXJnZXMgaW4ge3t3YWxsUG9zaXRpb259fSBtb3ZlIGF3YXkgZnJvbSB7e2JhbGxvb259fSB7e2luZHVjdGlvbkFtb3VudH19J1xyXG4gIH0sXHJcbiAgaW5kdWNlZENoYXJnZU5vQW1vdW50UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdOZWdhdGl2ZSBjaGFyZ2VzIGluIHt7d2FsbFBvc2l0aW9ufX0gbW92ZSBhd2F5IGZyb20ge3tiYWxsb29ufX0uJ1xyXG4gIH0sXHJcbiAgc3VtbWFyeUJhbGxvb25OZXV0cmFsQ2hhcmdlOiB7XHJcbiAgICB2YWx1ZTogJ2EgZmV3IHBhaXJzIG9mIG5lZ2F0aXZlIGFuZCBwb3NpdGl2ZSBjaGFyZ2VzJ1xyXG4gIH0sXHJcbiAgc3VtbWFyeUJhbGxvb25DaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7YmFsbG9vbkNoYXJnZX19LCB7e3Nob3dpbmdDaGFyZ2V9fS4nXHJcbiAgfSxcclxuICBzdW1tYXJ5RWFjaEJhbGxvb25DaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7eWVsbG93QmFsbG9vbn19IHt7Z3JlZW5CYWxsb29ufX0nXHJcbiAgfSxcclxuICBzdW1tYXJ5U3dlYXRlckFuZFdhbGw6IHtcclxuICAgIHZhbHVlOiAnU3dlYXRlciBhbmQgd2FsbCdcclxuICB9LFxyXG4gIGluaXRpYWxPYmplY3RQb3NpdGlvbnM6IHtcclxuICAgIHZhbHVlOiAnWWVsbG93IGJhbGxvb24gaXMgYXQgY2VudGVyIG9mIFBsYXkgQXJlYSwgZXZlbmx5IGJldHdlZW4gc3dlYXRlciBhbmQgd2FsbC4gU3dlYXRlciBpcyBhdCBmYXIgbGVmdCwgd2FsbCBhdCBmYXIgcmlnaHQuJ1xyXG4gIH0sXHJcblxyXG4gIC8vIGdlbmVyYWwgY2hhcmdlIGluZm9ybWF0aW9uIGZvciB0aGUgc2NyZWVuIHN1bW1hcnlcclxuICBzdW1tYXJ5T2JqZWN0SGFzQ2hhcmdlUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e29iamVjdH19IGhhcyB7e2NoYXJnZX19IG5ldCBjaGFyZ2UnXHJcbiAgfSxcclxuICBzdW1tYXJ5T2JqZWN0c0hhdmVDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7b2JqZWN0c319IGhhdmUge3tjaGFyZ2V9fSBuZXQgY2hhcmdlJ1xyXG4gIH0sXHJcbiAgc3VtbWFyeU5ldXRyYWxDaGFyZ2VzUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2Ftb3VudH19IHBhaXJzIG9mIG5lZ2F0aXZlIGFuZCBwb3NpdGl2ZSBjaGFyZ2VzJ1xyXG4gIH0sXHJcbiAgc3VtbWFyeU9iamVjdENoYXJnZVBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tvYmplY3R9fSwge3tjaGFyZ2V9fS4nXHJcbiAgfSxcclxuICBzdW1tYXJ5T2JqZWN0RWFjaEhhc1BhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tvYmplY3R9fSwgZWFjaCBoYXMge3tjaGFyZ2V9fS4nXHJcbiAgfSxcclxuICBzdW1tYXJ5T2JqZWN0RWFjaFBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tvYmplY3R9fSwgZWFjaCB7e2NoYXJnZX19LidcclxuICB9LFxyXG4gIHN1bW1hcnlTd2VhdGVyV2FsbFBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tzd2VhdGVyfX0ge3t3YWxsfX0nXHJcbiAgfSxcclxuXHJcbiAgLy8gc3VtbWFyeSBwaHJhc2VzIHdoZW4gYm90aCBiYWxsb29ucyBhcmUgaW5kdWNpbmcgY2hhcmdlXHJcbiAgc3VtbWFyeVNlY29uZEJhbGxvb25JbmR1Y2luZ0NoYXJnZVBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAnZnJvbSBHcmVlbiBCYWxsb29uIHt7YW1vdW50fX0uJ1xyXG4gIH0sXHJcbiAgc3VtbWFyeUJvdGhCYWxsb29uc1BhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3t5ZWxsb3dCYWxsb29ufX0sIHt7Z3JlZW5CYWxsb29ufX0gUG9zaXRpdmUgY2hhcmdlcyBkbyBub3QgbW92ZS4nXHJcbiAgfSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBJbmR1Y2VkIGNoYXJnZSBzdHJpbmdzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICBhTGl0dGxlQml0OiB7XHJcbiAgICB2YWx1ZTogJ2EgbGl0dGxlIGJpdCdcclxuICB9LFxyXG4gIGFMb3Q6IHtcclxuICAgIHZhbHVlOiAnYSBsb3QnXHJcbiAgfSxcclxuICBxdWl0ZUFMb3Q6IHtcclxuICAgIHZhbHVlOiAncXVpdGUgYSBsb3QnXHJcbiAgfSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBDaGFyZ2UgdmlldyBzdHJpbmdzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICBzaG93aW5nTm9DaGFyZ2VzOiB7XHJcbiAgICB2YWx1ZTogJ3Nob3dpbmcgbm8gY2hhcmdlcydcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIE9iamVjdCBzdHJpbmdzIChzdHJpbmdzIHNoYXJlZCBiZXR3ZWVuIGFsbCBvYmplY3RzKVxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgbWFueUNoYXJnZVBhaXJzOiB7XHJcbiAgICB2YWx1ZTogJ21hbnkgcGFpcnMgb2YgbmVnYXRpdmUgYW5kIHBvc2l0aXZlIGNoYXJnZXMnXHJcbiAgfSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBTd2VhdGVyIHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIHN3ZWF0ZXJMYWJlbDoge1xyXG4gICAgdmFsdWU6ICdTd2VhdGVyJ1xyXG4gIH0sXHJcbiAgc3dlYXRlclBvc2l0aW9uOiB7XHJcbiAgICB2YWx1ZTogJ0F0IGxlZnQgZWRnZSBvZiBQbGF5IEFyZWEuJ1xyXG4gIH0sXHJcbiAgc3dlYXRlckRlc2NyaXB0aW9uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3Bvc2l0aW9ufX0ge3tjaGFyZ2V9fSdcclxuICB9LFxyXG4gIHN3ZWF0ZXJDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7bmV0Q2hhcmdlfX0sIHt7cmVsYXRpdmVDaGFyZ2V9fSdcclxuICB9LFxyXG4gIHN3ZWF0ZXJOZXRDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ0hhcyB7e25ldENoYXJnZX19IG5ldCBjaGFyZ2UnXHJcbiAgfSxcclxuICBzd2VhdGVyUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7Y2hhcmdlfX0gbW9yZSBwb3NpdGl2ZSBjaGFyZ2VzIHRoYW4gbmVnYXRpdmUgY2hhcmdlcydcclxuICB9LFxyXG4gIHN3ZWF0ZXJTaG93aW5nUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdzaG93aW5nIHt7Y2hhcmdlfX0gcG9zaXRpdmUgY2hhcmdlcydcclxuICB9LFxyXG4gIHN3ZWF0ZXJSZWxhdGl2ZUNoYXJnZUFsbFBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tjaGFyZ2V9fSBtb3JlIHBvc2l0aXZlIGNoYXJnZXMgdGhhbiBuZWdhdGl2ZSBjaGFyZ2VzJ1xyXG4gIH0sXHJcbiAgc3dlYXRlclJlbGF0aXZlQ2hhcmdlRGlmZmVyZW5jZXNQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3Nob3dpbmcge3tjaGFyZ2V9fSBwb3NpdGl2ZSBjaGFyZ2VzJ1xyXG4gIH0sXHJcbiAgc3dlYXRlck5vTW9yZUNoYXJnZXM6IHtcclxuICAgIHZhbHVlOiAnbm8gbW9yZSBuZWdhdGl2ZSBjaGFyZ2VzLCBvbmx5IHBvc2l0aXZlIGNoYXJnZXMnXHJcbiAgfSxcclxuICBzaG93aW5nQWxsUG9zaXRpdmVDaGFyZ2VzOiB7XHJcbiAgICB2YWx1ZTogJ3Nob3dpbmcgYWxsIHBvc2l0aXZlIGNoYXJnZXMnXHJcbiAgfSxcclxuICBzd2VhdGVySGFzUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ1N3ZWF0ZXIgaGFzIHt7cmVsYXRpdmVDaGFyZ2V9fS4nXHJcbiAgfSxcclxuICBzd2VhdGVySGFzTmV0Q2hhcmdlU2hvd2luZ1BhdHRlcm46IHtcclxuICAgIHZhbHVlOiAnU3dlYXRlciBoYXMgcG9zaXRpdmUgbmV0IGNoYXJnZSwge3tzaG93aW5nfX0uJ1xyXG4gIH0sXHJcbiAgcG9zaXRpdmVOZXRDaGFyZ2U6IHtcclxuICAgIHZhbHVlOiAncG9zaXRpdmUgbmV0IGNoYXJnZSdcclxuICB9LFxyXG4gIG5ldXRyYWxOZXRDaGFyZ2U6IHtcclxuICAgIHZhbHVlOiAnbmV1dHJhbCBuZXQgY2hhcmdlJ1xyXG4gIH0sXHJcbiAgbmV0TmV1dHJhbDoge1xyXG4gICAgdmFsdWU6ICduZXV0cmFsIG5ldCdcclxuICB9LFxyXG4gIG5ldFBvc2l0aXZlOiB7XHJcbiAgICB2YWx1ZTogJ3Bvc2l0aXZlIG5ldCdcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFdhbGwgc3RyaW5nc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgd2FsbERlc2NyaXB0aW9uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3Bvc2l0aW9ufX0uIHt7Y2hhcmdlfX0uJ1xyXG4gIH0sXHJcbiAgd2FsbFBvc2l0aW9uOiB7XHJcbiAgICB2YWx1ZTogJ0F0IHJpZ2h0IGVkZ2Ugb2YgUGxheSBBcmVhJ1xyXG4gIH0sXHJcbiAgd2FsbE5vTmV0Q2hhcmdlOiB7XHJcbiAgICB2YWx1ZTogJ0hhcyB6ZXJvIG5ldCBjaGFyZ2UnXHJcbiAgfSxcclxuICB3YWxsSGFzTWFueUNoYXJnZXM6IHtcclxuICAgIHZhbHVlOiAnV2FsbCBoYXMgbWFueSBwYWlycyBvZiBuZWdhdGl2ZSBhbmQgcG9zaXRpdmUgY2hhcmdlcy4nXHJcbiAgfSxcclxuICB3YWxsQ2hhcmdlV2l0aG91dEluZHVjZWRQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7bmV0Q2hhcmdlfX0sIHt7c2hvd25DaGFyZ2VzfX0nXHJcbiAgfSxcclxuICB3YWxsQ2hhcmdlV2l0aEluZHVjZWRQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7bmV0Q2hhcmdlfX0sIHt7c2hvd25DaGFyZ2VzfX0uIHt7aW5kdWNlZENoYXJnZX19J1xyXG4gIH0sXHJcbiAgd2FsbFR3b0JhbGxvb25JbmR1Y2VkQ2hhcmdlUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3llbGxvd0JhbGxvb259fSB7e2dyZWVuQmFsbG9vbn19J1xyXG4gIH0sXHJcbiAgd2FsbE5vQ2hhbmdlSW5DaGFyZ2VzUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdJbiB7e3Bvc2l0aW9ufX0sIG5vIGNoYW5nZSBpbiBjaGFyZ2VzJyAvLyBwdW5jdHVhdGlvbiBpbnNlcnRlZCBpbiBhbm90aGVyIHN0cmluZyBwYXR0ZXJuXHJcbiAgfSxcclxuICB3YWxsQ2hhcmdlUGF0dGVyblN0cmluZ1dpdGhMYWJlbDoge1xyXG4gICAgdmFsdWU6ICdXYWxsIHt7d2FsbENoYXJnZX19J1xyXG4gIH0sXHJcbiAgd2FsbFJ1YlBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3twb3NpdGlvbn19IHt7Y2hhcmdlfX0nXHJcbiAgfSxcclxuICB3YWxsUnViQWxsUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdObyB0cmFuc2ZlciBvZiBjaGFyZ2UuIHt7aW5kdWNlZENoYXJnZX19J1xyXG4gIH0sXHJcbiAgd2FsbFJ1YkRpZmZQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7YmFsbG9vbkNoYXJnZX19IHt7d2FsbENoYXJnZX19J1xyXG4gIH0sXHJcbiAgd2FsbFJ1YmJpbmdXaXRoUGFpcnNQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7cnViYmluZ0FsZXJ0fX0gV2FsbCBoYXMgbWFueSBwYWlycyBvZiBuZWdhdGl2ZSBhbmQgcG9zaXRpdmUgY2hhcmdlcy4nXHJcbiAgfSxcclxuICBub0NoYW5nZUluQ2hhcmdlczoge1xyXG4gICAgdmFsdWU6ICdObyBjaGFuZ2UgaW4gY2hhcmdlcydcclxuICB9LFxyXG4gIG5vQ2hhbmdlSW5OZXRDaGFyZ2U6IHtcclxuICAgIHZhbHVlOiAnTm8gY2hhbmdlIGluIG5ldCBjaGFyZ2UnXHJcbiAgfSxcclxuICB3YWxsSW5kdWNlZENoYXJnZVN1bW1hcnlQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7aW5kdWNlZENoYXJnZX19IHt7cG9zaXRpdmVDaGFyZ2VzfX0nXHJcbiAgfSxcclxuICB3YWxsSW5kdWNlZENoYXJnZVdpdGhNYW55UGFpcnNQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7aW5kdWNlZENoYXJnZX19IHt7Y2hhcmdlUGFpcnN9fSdcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gSW5kdWNlZCBjaGFyZ2UgY2hhbmdlIHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgbW9yZUluZHVjZWRDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ05lZ2F0aXZlIGNoYXJnZXMgaW4ge3twb3NpdGlvbn19IHt7bW92ZW1lbnR9fSBmcm9tIHt7YmFsbG9vbn19LidcclxuICB9LFxyXG4gIGxlc3NJbmR1Y2VkQ2hhcmdlUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdOZWdhdGl2ZSBjaGFyZ2VzIGluIHt7cG9zaXRpb259fSB7e21vdmVtZW50fX0uJ1xyXG4gIH0sXHJcbiAgbW92ZUF3YXlBTGl0dGxlTW9yZToge1xyXG4gICAgdmFsdWU6ICdtb3ZlIGF3YXkgYSBsaXR0bGUgbW9yZSdcclxuICB9LFxyXG4gIGJlZ2luVG9SZXR1cm46IHtcclxuICAgIHZhbHVlOiAnYmVnaW4gdG8gcmV0dXJuJ1xyXG4gIH0sXHJcbiAgcmV0dXJuQUxpdHRsZU1vcmU6IHtcclxuICAgIHZhbHVlOiAncmV0dXJuIGEgbGl0dGxlIG1vcmUnXHJcbiAgfSxcclxuICBwb3NpdGl2ZUNoYXJnZXNEb05vdE1vdmU6IHtcclxuICAgIHZhbHVlOiAnUG9zaXRpdmUgY2hhcmdlcyBkbyBub3QgbW92ZSdcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEJhbGxvb24gc3RyaW5nc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgZ3JlZW5CYWxsb29uTGFiZWw6IHtcclxuICAgIHZhbHVlOiAnR3JlZW4gQmFsbG9vbidcclxuICB9LFxyXG4gIHllbGxvd0JhbGxvb25MYWJlbDoge1xyXG4gICAgdmFsdWU6ICdZZWxsb3cgQmFsbG9vbidcclxuICB9LFxyXG4gIGdyYWJCYWxsb29uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdHcmFiIHt7YmFsbG9vbn19J1xyXG4gIH0sXHJcbiAgZWFjaEJhbGxvb246IHtcclxuICAgIHZhbHVlOiAnRWFjaCBiYWxsb29uJ1xyXG4gIH0sXHJcbiAgYm90aEJhbGxvb25zOiB7XHJcbiAgICB2YWx1ZTogJ2JhbGxvb25zJ1xyXG4gIH0sXHJcbiAgZ3JhYkJhbGxvb25Ub1BsYXk6IHtcclxuICAgIHZhbHVlOiAnR3JhYiBiYWxsb29uIHRvIHBsYXkuJ1xyXG4gIH0sXHJcbiAgZ3JhYkJhbGxvb25LZXlib2FyZEhlbHA6IHtcclxuICAgIHZhbHVlOiAnTG9vayBmb3IgZ3JhYiBidXR0b24gdG8gcGxheS4gT25jZSBncmFiYmVkLCB1c2Uga2V5Ym9hcmQgc2hvcnRjdXRzIHRvIG1vdmUgYmFsbG9vbi4gU3BhY2UgdG8gcmVsZWFzZS4nXHJcbiAgfSxcclxuICBiYWxsb29uUG9zaXRpb25BdHRyYWN0aXZlU3RhdGVQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7YXR0cmFjdGl2ZVN0YXRlfX0ge3twb3NpdGlvbn19J1xyXG4gIH0sXHJcbiAgYmFsbG9vblNob3dBbGxDaGFyZ2VzUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3N0YXRlQW5kUG9zaXRpb259fSB7e25ldENoYXJnZX19LCB7e3JlbGF0aXZlQ2hhcmdlfX0uJ1xyXG4gIH0sXHJcbiAgYmFsbG9vbkxhYmVsV2l0aEF0dHJhY3RpdmVTdGF0ZVBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tiYWxsb29uTGFiZWx9fSwge3thdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbn19J1xyXG4gIH0sXHJcblxyXG4gIC8vIGRlc2NyaWJpbmcgdGhlIGF0dHJhY3RpdmUgc3RhdGUgb2YgYSBiYWxsb29uXHJcbiAgYmFsbG9vblN0aWNraW5nVG86IHtcclxuICAgIHZhbHVlOiAnU3RpY2tpbmcgdG8nXHJcbiAgfSxcclxuICBiYWxsb29uT246IHtcclxuICAgIHZhbHVlOiAnT24nXHJcbiAgfSxcclxuICBiYWxsb29uQXQ6IHtcclxuICAgIHZhbHVlOiAnQXQnXHJcbiAgfSxcclxuICBiYWxsb29uTmVhcjoge1xyXG4gICAgdmFsdWU6ICdOZWFyJ1xyXG4gIH0sXHJcblxyXG4gIC8vIGJhbGxvb24gY2hhcmdlIHN0cmluZ3NcclxuICBiYWxsb29uTmV0Q2hhcmdlUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdIYXMge3tjaGFyZ2VBbW91bnR9fSBuZXQgY2hhcmdlJ1xyXG4gIH0sXHJcbiAgYmFsbG9vbk5ldENoYXJnZVBhdHRlcm5TdHJpbmdXaXRoTGFiZWw6IHtcclxuICAgIHZhbHVlOiAne3tiYWxsb29ufX0gaGFzIHt7Y2hhcmdlQW1vdW50fX0gbmV0IGNoYXJnZSdcclxuICB9LFxyXG4gIGJhbGxvb25aZXJvOiB7XHJcbiAgICB2YWx1ZTogJ3plcm8nXHJcbiAgfSxcclxuICBiYWxsb29uTmVnYXRpdmU6IHtcclxuICAgIHZhbHVlOiAnbmVnYXRpdmUnXHJcbiAgfSxcclxuICBiYWxsb29uUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7YW1vdW50fX0gbW9yZSBuZWdhdGl2ZSBjaGFyZ2VzIHRoYW4gcG9zaXRpdmUgY2hhcmdlcydcclxuICB9LFxyXG4gIGJhbGxvb25DaGFyZ2VEaWZmZXJlbmNlc1BhdHRlcm46IHtcclxuICAgIHZhbHVlOiAnc2hvd2luZyB7e2Ftb3VudH19IG5lZ2F0aXZlIGNoYXJnZXMnXHJcbiAgfSxcclxuICBiYWxsb29uSGFzUmVsYXRpdmVDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7YmFsbG9vbkxhYmVsfX0gaGFzIHt7cmVsYXRpdmVDaGFyZ2V9fSdcclxuICB9LFxyXG5cclxuICBiYWxsb29uSGFzTmV0Q2hhcmdlUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb259fSBoYXMge3tjaGFyZ2V9fSBuZXQgY2hhcmdlLCB7e3Nob3dpbmd9fSdcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gQmFsbG9vbiBpbnRlcmFjdGlvbiBzdHJpbmdzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIHJlbGVhc2VkOiB7XHJcbiAgICB2YWx1ZTogJ1JlbGVhc2VkJ1xyXG4gIH0sXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBCYWxsb29uIG1vdmVtZW50IHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgaW5pdGlhbE1vdmVtZW50UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdNb3ZlcyB7e3ZlbG9jaXR5fX0ge3tkaXJlY3Rpb259fS4nXHJcbiAgfSxcclxuICB0d29CYWxsb29uSW5pdGlhbE1vdmVtZW50UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb259fSwgbW92ZXMge3t2ZWxvY2l0eX19IHt7ZGlyZWN0aW9ufX0uJ1xyXG4gIH0sXHJcblxyXG4gIC8vIGRlc2NyaWJlZCB2ZWxvY2l0aWVzXHJcbiAgZXh0cmVtZWx5U2xvd2x5OiB7XHJcbiAgICB2YWx1ZTogJ2V4dHJlbWVseSBzbG93bHknXHJcbiAgfSxcclxuICB2ZXJ5U2xvd2x5OiB7XHJcbiAgICB2YWx1ZTogJ3Zlcnkgc2xvd2x5J1xyXG4gIH0sXHJcbiAgc2xvd2x5OiB7XHJcbiAgICB2YWx1ZTogJ3Nsb3dseSdcclxuICB9LFxyXG4gIHF1aWNrbHk6IHtcclxuICAgIHZhbHVlOiAncXVpY2tseSdcclxuICB9LFxyXG4gIHZlcnlRdWlja2x5OiB7XHJcbiAgICB2YWx1ZTogJ3ZlcnkgcXVpY2tseSdcclxuICB9LFxyXG5cclxuICBub0NoYW5nZUFuZFBvc2l0aW9uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdObyBjaGFuZ2UgaW4gcG9zaXRpb24uIHt7cG9zaXRpb259fSdcclxuICB9LFxyXG4gIHR3b0JhbGxvb25Ob0NoYW5nZUFuZFBvc2l0aW9uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb259fSwgbm8gY2hhbmdlIGluIHBvc2l0aW9uLiB7e3Bvc2l0aW9ufX0nXHJcbiAgfSxcclxuICBub0NoYW5nZVdpdGhJbmR1Y2VkQ2hhcmdlUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e25vQ2hhbmdlfX0ge3tpbmR1Y2VkQ2hhcmdlfX0nXHJcbiAgfSxcclxuXHJcbiAgY29udGludW91c01vdmVtZW50UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdNb3Zpbmcge3tkaXJlY3Rpb259fS4nXHJcbiAgfSxcclxuICBjb250aW51b3VzTW92ZW1lbnRXaXRoTGFuZG1hcmtQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7bW92ZW1lbnREaXJlY3Rpb259fSB7e2xhbmRtYXJrfX0uJ1xyXG4gIH0sXHJcbiAgY29udGludW91c01vdmVtZW50V2l0aExhYmVsUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb25MYWJlbH19LCBtb3Zpbmcge3tkaXJlY3Rpb259fS4nXHJcbiAgfSxcclxuXHJcbiAgbm93RGlyZWN0aW9uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdOb3cge3tkaXJlY3Rpb259fS4nXHJcbiAgfSxcclxuICB0d29CYWxsb29uTm93RGlyZWN0aW9uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb259fSwgbm93IHt7ZGlyZWN0aW9ufX0uJ1xyXG4gIH0sXHJcblxyXG4gIC8vIHdoZW4gYmFsbG9vbiBoaXRzIHdhbGwgYW5kIHRoZXJlIGlzIGEgY2hhbmdlIGluIGNoYXJnZXNcclxuICBiYWxsb29uUG9zaXRpb25Ob0NoYW5nZVBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3twb3NpdGlvbn19IHt7aW5kdWNlZENoYXJnZX19J1xyXG4gIH0sXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBCYWxsb29uIERyYWdnaW5nIHN0cmluZ3MsIHNpbmdsZSBzdGF0ZW1lbnQgd2l0aCBubyBvdGhlciBjb250ZXh0XHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIHVwRHJhZ2dpbmc6IHtcclxuICAgIHZhbHVlOiAnVXAuJ1xyXG4gIH0sXHJcbiAgbGVmdERyYWdnaW5nOiB7XHJcbiAgICB2YWx1ZTogJ0xlZnQuJ1xyXG4gIH0sXHJcbiAgZG93bkRyYWdnaW5nOiB7XHJcbiAgICB2YWx1ZTogJ0Rvd24uJ1xyXG4gIH0sXHJcbiAgcmlnaHREcmFnZ2luZzoge1xyXG4gICAgdmFsdWU6ICdSaWdodC4nXHJcbiAgfSxcclxuICB1cEFuZFRvVGhlUmlnaHREcmFnZ2luZzoge1xyXG4gICAgdmFsdWU6ICdVcCBhbmQgdG8gdGhlIHJpZ2h0LidcclxuICB9LFxyXG4gIHVwQW5kVG9UaGVMZWZ0RHJhZ2dpbmc6IHtcclxuICAgIHZhbHVlOiAnVXAgYW5kIHRvIHRoZSBsZWZ0LidcclxuICB9LFxyXG4gIGRvd25BbmRUb1RoZVJpZ2h0RHJhZ2dpbmc6IHtcclxuICAgIHZhbHVlOiAnRG93biBhbmQgdG8gdGhlIHJpZ2h0LidcclxuICB9LFxyXG4gIGRvd25BbmRUb1RoZUxlZnREcmFnZ2luZzoge1xyXG4gICAgdmFsdWU6ICdEb3duIGFuZCB0byB0aGUgbGVmdC4nXHJcbiAgfSxcclxuXHJcbiAgLy8gc2ltaWxhciB0byBkcmFnZ2luZyBkaXJlY3Rpb24gc3RyaW5ncywgYnV0IGluIGNvbnRleHQgc28gbm90IGNhcGl0YWxpemVkIGFuZCBubyBwdW5jdHVhdGlvblxyXG4gIHVwOiB7XHJcbiAgICB2YWx1ZTogJ3VwJ1xyXG4gIH0sXHJcbiAgbGVmdDoge1xyXG4gICAgdmFsdWU6ICdsZWZ0J1xyXG4gIH0sXHJcbiAgZG93bjoge1xyXG4gICAgdmFsdWU6ICdkb3duJ1xyXG4gIH0sXHJcbiAgcmlnaHQ6IHtcclxuICAgIHZhbHVlOiAncmlnaHQnXHJcbiAgfSxcclxuICB1cEFuZFRvVGhlUmlnaHQ6IHtcclxuICAgIHZhbHVlOiAndXAgYW5kIHRvIHRoZSByaWdodCdcclxuICB9LFxyXG4gIHVwQW5kVG9UaGVMZWZ0OiB7XHJcbiAgICB2YWx1ZTogJ3VwIGFuZCB0byB0aGUgbGVmdCdcclxuICB9LFxyXG4gIGRvd25BbmRUb1RoZVJpZ2h0OiB7XHJcbiAgICB2YWx1ZTogJ2Rvd24gYW5kIHRvIHRoZSByaWdodCdcclxuICB9LFxyXG4gIGRvd25BbmRUb1RoZUxlZnQ6IHtcclxuICAgIHZhbHVlOiAnZG93biBhbmQgdG8gdGhlIGxlZnQnXHJcbiAgfSxcclxuXHJcbiAgLy8gZHJhZ2dpbmcsIHNwZWNpZmljIGN1ZXMgd2hlbiB0aGUgYmFsbG9vbiBlbnRlcnMgYW4gaW1wb3J0YW50IGFyZWFcclxuICBiYWxsb29uQXRQb3NpdGlvblBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAnQXQge3twb3NpdGlvbn19J1xyXG4gIH0sXHJcbiAgYmFsbG9vbk5ld1JlZ2lvblBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tuZWFyT3JBdH19IHt7cG9zaXRpb259fSdcclxuICB9LFxyXG4gIGNsb3NlclRvT2JqZWN0UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdDbG9zZXIgdG8ge3tvYmplY3R9fSdcclxuICB9LFxyXG4gIHRvcEVkZ2VPZlBsYXlBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ3RvcCBlZGdlIG9mIFBsYXkgQXJlYSdcclxuICB9LFxyXG4gIGJvdHRvbUVkZ2VPZlBsYXlBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ2JvdHRvbSBlZGdlIG9mIFBsYXkgQXJlYSdcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gQmFsbG9vbiBncmFiYmluZyBzdHJpbmdzICh3aGVuIHRoZSBiYWxsb29uIGlzIGluaXRpYWxseSBwaWNrZWQgdXApXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGdyYWJiZWROb25lUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdHcmFiYmVkLiB7e3Bvc2l0aW9ufX0nXHJcbiAgfSxcclxuICBncmFiYmVkQ2hhcmdlUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdHcmFiYmVkLiB7e3Bvc2l0aW9ufX0ge3tjaGFyZ2V9fSdcclxuICB9LFxyXG4gIGdyYWJiZWRXaXRoT3RoZXJDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7YmFsbG9vbkNoYXJnZX19IHt7b3RoZXJPYmplY3RDaGFyZ2V9fSdcclxuICB9LFxyXG4gIGdyYWJiZWRXaXRoSGVscFBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tncmFiYmVkQWxlcnR9fSB7e2hlbHB9fSdcclxuICB9LFxyXG4gIGJhbGxvb25IYXNDaGFyZ2VQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ0hhcyB7e2NoYXJnZX19J1xyXG4gIH0sXHJcbiAgYmFsbG9vbkhhc0NoYXJnZVNob3dpbmdQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ0hhcyB7e2NoYXJnZX19IG5ldCBjaGFyZ2UsIHt7c2hvd2luZ319J1xyXG4gIH0sXHJcbiAgYmFsbG9vblJlbGF0aXZlQ2hhcmdlQWxsUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdIYXMge3tjaGFyZ2V9fSdcclxuICB9LFxyXG4gIGNvbWJpbmVkQ2hhcmdlUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2dyYWJiZWRCYWxsb29ufX0uIHt7b3RoZXJCYWxsb29ufX0nXHJcbiAgfSxcclxuICBrZXlib2FyZEludGVyYWN0aW9uQ3VlOiB7XHJcbiAgICB2YWx1ZTogJ1ByZXNzIFcsIEEsIFMsIG9yIEQga2V5IHRvIG1vdmUgYmFsbG9vbi4gU3BhY2UgdG8gcmVsZWFzZS4nXHJcbiAgfSxcclxuICB0b3VjaEludGVyYWN0aW9uQ3VlOiB7XHJcbiAgICB2YWx1ZTogJ0RyYWcgZmluZ2VyIHRvIG1vdmUgYmFsbG9vbi4gTGlmdCBmaW5nZXIgdG8gcmVsZWFzZS4nXHJcbiAgfSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEJhbGxvb24gc3dlYXRlciBydWJiaW5nIHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgYmFsbG9vblBpY2tzVXBDaGFyZ2VzUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb259fSBwaWNrcyB1cCBuZWdhdGl2ZSBjaGFyZ2VzIGZyb20gc3dlYXRlcidcclxuICB9LFxyXG4gIGJhbGxvb25QaWNrc1VwQ2hhcmdlc0RpZmZQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7cGlja1VwfX0uIFNhbWUgaW5jcmVhc2Ugb2YgcG9zaXRpdmUgY2hhcmdlcyBvbiBzd2VhdGVyLidcclxuICB9LFxyXG4gIGJhbGxvb25QaWNrc1VwTW9yZUNoYXJnZXNQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7YmFsbG9vbn19IHBpY2tzIHVwIG1vcmUgbmVnYXRpdmUgY2hhcmdlcydcclxuICB9LFxyXG4gIGJhbGxvb25QaWNrc1VwTW9yZUNoYXJnZXNEaWZmUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3BpY2tVcH19LiBTYW1lIGluY3JlYXNlIG9mIHBvc2l0aXZlIGNoYXJnZXMgb24gc3dlYXRlci4nXHJcbiAgfSxcclxuICBiYWxsb29uU3dlYXRlclJlbGF0aXZlQ2hhcmdlc1BhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3tiYWxsb29ufX0ge3tzd2VhdGVyfX0nXHJcbiAgfSxcclxuICBsYXN0Q2hhcmdlUGlja2VkVXBQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7c3dlYXRlcn19IHt7YmFsbG9vbn19LidcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gQmFsbG9vbiBydWJiaW5nIHN0cmluZ3MsIGZhaWwgdG8gcGljayB1cCBjaGFyZ2VzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIG5vQ2hhcmdlUGlja3VwUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e25vQ2hhbmdlfX0uIHt7YmFsbG9vblBvc2l0aW9ufX0uIHt7bW9yZUNoYXJnZXNQb3NpdGlvbn19J1xyXG4gIH0sXHJcbiAgbm9jaGFyZ2VQaWNrdXBXaXRoT2JqZWN0Q2hhcmdlQW5kSGludDoge1xyXG4gICAgdmFsdWU6ICd7e25vQ2hhbmdlfX0uIHt7YmFsbG9vblBvc2l0aW9ufX0uIHt7c3dlYXRlckNoYXJnZX19IHt7YmFsbG9vbkNoYXJnZX19IHt7aGludH19J1xyXG4gIH0sXHJcbiAgbm9DaGFyZ2VQaWNrdXBIaW50UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e25vQ2hhbmdlfX0uIHt7YmFsbG9vblBvc2l0aW9ufX0uIHt7aGludH19J1xyXG4gIH0sXHJcbiAgcmVsZWFzZUhpbnQ6IHtcclxuICAgIHZhbHVlOiAnUHJlc3MgU3BhY2UgdG8gcmVsZWFzZS4nXHJcbiAgfSxcclxuICBtb3JlQ2hhcmdlc1BhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3ttb3JlQ2hhcmdlc319IHt7ZGlyZWN0aW9ufX0uJ1xyXG4gIH0sXHJcbiAgbW9yZUNoYXJnZXNGdXJ0aGVyUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e21vcmVDaGFyZ2VzfX0gZnVydGhlciB7e2RpcmVjdGlvbn19LidcclxuICB9LFxyXG4gIG1vcmVQYWlyc09mQ2hhcmdlczoge1xyXG4gICAgdmFsdWU6ICdNb3JlIHBhaXJzIG9mIGNoYXJnZXMnXHJcbiAgfSxcclxuICBtb3JlSGlkZGVuUGFpcnNPZkNoYXJnZXM6IHtcclxuICAgIHZhbHVlOiAnTW9yZSBoaWRkZW4gcGFpcnMgb2YgY2hhcmdlcydcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gQmFsbG9vbiBqdW1waW5nIHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgbmVhclN3ZWF0ZXI6IHtcclxuICAgIHZhbHVlOiAnTmVhciBzd2VhdGVyLidcclxuICB9LFxyXG4gIHBvc2l0aW9uQW5kSW5kdWNlZENoYXJnZVBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAne3twb3NpdGlvbn19LiB7e2luZHVjZWRDaGFyZ2V9fSdcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIENvbnRyb2wgcGFuZWwgc3RyaW5nc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgYmFsbG9vblNldHRpbmdzTGFiZWw6IHtcclxuICAgIHZhbHVlOiAnQmFsbG9vbiBTZXR0aW5ncydcclxuICB9LFxyXG4gIGNoYXJnZVNldHRpbmdzRGVzY3JpcHRpb246IHtcclxuICAgIHZhbHVlOiAnQ2hvb3NlIGhvdyB5b3Ugc2VlIG9yIGhlYXIgY2hhcmdlIGluZm9ybWF0aW9uLidcclxuICB9LFxyXG4gIGNoYXJnZVNldHRpbmdzTGFiZWw6IHtcclxuICAgIHZhbHVlOiAnQ2hhcmdlIFNldHRpbmdzJ1xyXG4gIH0sXHJcbiAgc2hvd0FsbENoYXJnZXNBbGVydDoge1xyXG4gICAgdmFsdWU6ICdObyBjaGFyZ2VzIGhpZGRlbi4nXHJcbiAgfSxcclxuICBzaG9Ob0NoYXJnZXNBbGVydDoge1xyXG4gICAgdmFsdWU6ICdBbGwgY2hhcmdlcyBoaWRkZW4uJ1xyXG4gIH0sXHJcbiAgc2hvd0NoYXJnZURpZmZlcmVuY2VzQWxlcnQ6IHtcclxuICAgIHZhbHVlOiAnT25seSB1bnBhaXJlZCBjaGFyZ2VzIHNob3duLidcclxuICB9LFxyXG4gIHJlc2V0QmFsbG9vbnNEZXNjcmlwdGlvblBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAnUmVzZXQge3tiYWxsb29uc319IHRvIHN0YXJ0IHt7cG9zaXRpb25zfX0gYW5kIGFuIHVuY2hhcmdlZCBzdGF0ZS4nXHJcbiAgfSxcclxuXHJcbiAgLy8gYmFsbG9vbiBncmFiIGN1ZVxyXG4gIGJhbGxvb25CdXR0b25IZWxwOiB7XHJcbiAgICB2YWx1ZTogJ0xvb2sgZm9yIGdyYWIgYnV0dG9uIHRvIHBsYXkuJ1xyXG4gIH0sXHJcblxyXG4gIC8vIG1pc2MgbGFiZWxzXHJcbiAgcmVtb3ZlV2FsbERlc2NyaXB0aW9uOiB7XHJcbiAgICB2YWx1ZTogJ1BsYXkgd2l0aCBvciB3aXRob3V0IHRoZSB3YWxsLidcclxuICB9LFxyXG4gIHR3b0JhbGxvb25FeHBlcmltZW50RGVzY3JpcHRpb246IHtcclxuICAgIHZhbHVlOiAnUGxheSB3aXRoIHR3byBiYWxsb29ucyBvciBqdXN0IG9uZS4nXHJcbiAgfSxcclxuXHJcbiAgYmFsbG9vbjoge1xyXG4gICAgdmFsdWU6ICdCYWxsb29uJ1xyXG4gIH0sXHJcbiAgYmFsbG9vbnM6IHtcclxuICAgIHZhbHVlOiAnQmFsbG9vbnMnXHJcbiAgfSxcclxuICB0d29CYWxsb29uRXhwZXJpbWVudExhYmVsOiB7XHJcbiAgICB2YWx1ZTogJ1R3by1CYWxsb29uIEV4cGVyaW1lbnRzJ1xyXG4gIH0sXHJcbiAgd2FsbExhYmVsOiB7XHJcbiAgICB2YWx1ZTogJ1dhbGwnXHJcbiAgfSxcclxuXHJcbiAgLy8gYWxlcnQgd2hlbiB0aGUgYmFsbG9vbnMgYXJlIHJlc2V0XHJcbiAgcmVzZXRCYWxsb29uc0FsZXJ0UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb25zfX0gYW5kIHN3ZWF0ZXIgcmVzZXQuJ1xyXG4gIH0sXHJcblxyXG4gIC8vIGFsZXJ0cyB3aGVuIGJhbGxvb25zIGFkZGVkL3JlbW92ZWQgZnJvbSBwbGF5IGFyZWFcclxuICBiYWxsb29uQWRkZWRQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7YmFsbG9vbkxhYmVsfX0gYWRkZWQgdG8gUGxheSBBcmVhLidcclxuICB9LFxyXG4gIGJhbGxvb25SZW1vdmVkUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb25MYWJlbH19IHJlbW92ZWQgZnJvbSBQbGF5IEFyZWEuJ1xyXG4gIH0sXHJcbiAgYmFsbG9vbkFkZGVkV2l0aFBvc2l0aW9uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e2JhbGxvb25MYWJlbH19IGFkZGVkLiB7e3Bvc2l0aW9ufX0uJ1xyXG4gIH0sXHJcbiAgYmFsbG9vblBvc2l0aW9uTmVhck90aGVyUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3Bvc2l0aW9ufX0sIG5leHQgdG8ge3tvdGhlckJhbGxvb259fSdcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gS2V5Ym9hcmQgc2hvcnRjdXRzIGhlbHAgY29udGVudCBzdHJpbmdzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGdyYWJPclJlbGVhc2VCYWxsb29uRGVzY3JpcHRpb246IHtcclxuICAgIHZhbHVlOiAnR3JhYiBvciByZWxlYXNlIHRoZSBiYWxsb29uIHdpdGggU3BhY2Ugb3IgRW50ZXIga2V5cy4nXHJcbiAgfSxcclxuICBtb3ZlR3JhYmJlZEJhbGxvb25EZXNjcmlwdGlvbjoge1xyXG4gICAgdmFsdWU6ICdNb3ZlIGdyYWJiZWQgYmFsbG9vbiB1cCwgbGVmdCwgZG93biwgb3IgcmlnaHQgd2l0aCBBcnJvdyBrZXlzIG9yIHdpdGggbGV0dGVyIGtleXMgVywgQSwgUywgb3IgRC4nXHJcbiAgfSxcclxuICBtb3ZlU2xvd2VyRGVzY3JpcHRpb246IHtcclxuICAgIHZhbHVlOiAnTW92ZSBzbG93ZXIgd2l0aCBTaGlmdCBwbHVzIEFycm93IGtleXMgb3IgU2hpZnQgcGx1cyBsZXR0ZXIga2V5cyBXLCBBLCBTLCBvciBELidcclxuICB9LFxyXG4gIGp1bXBzQ2xvc2VUb1N3ZWF0ZXJEZXNjcmlwdGlvbjoge1xyXG4gICAgdmFsdWU6ICdKdW1wIGNsb3NlIHRvIHN3ZWF0ZXIgd2l0aCBKIHBsdXMgUy4nXHJcbiAgfSxcclxuICBqdW1wc0Nsb3NlVG9Xd2FsbERlc2NyaXB0aW9uOiB7XHJcbiAgICB2YWx1ZTogJ0p1bXAgdG8gd2FsbCB3aXRoIEogcGx1cyBXLidcclxuICB9LFxyXG4gIGp1bXBzTmVhcldhbGxEZXNjcmlwdGlvbjoge1xyXG4gICAgdmFsdWU6ICdKdW1wIHRvIG5lYXIgd2FsbCB3aXRoIEogcGx1cyBOLidcclxuICB9LFxyXG4gIGp1bXBzdG9DZW50ZXJEZXNjcmlwdGlvbjoge1xyXG4gICAgdmFsdWU6ICdKdW1wIHRvIGNlbnRlciB3aXRoIEogcGx1cyBDLidcclxuICB9XHJcbn07XHJcblxyXG5pZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuc3RyaW5nVGVzdCA9PT0gJ3hzcycgKSB7XHJcbiAgZm9yICggY29uc3Qga2V5IGluIEJBU0VBMTF5U3RyaW5ncyApIHtcclxuICAgIEJBU0VBMTF5U3RyaW5nc1sga2V5IF0udmFsdWUgKz0gJzxpbWcgc3JjPVwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQURVbEVRVlFJVzJOa1lHRDREd0FCQ1FFQnR4bU43d0FBQUFCSlJVNUVya0pnZ2c9PVwiIG9ubG9hZD1cIndpbmRvdy5wb3NpdGlvbi5ocmVmPWF0b2IoXFwnYUhSMGNITTZMeTkzZDNjdWVXOTFkSFZpWlM1amIyMHZkMkYwWTJnL2RqMWtVWGMwZHpsWFoxaGpVUT09XFwnKVwiIC8+JztcclxuICB9XHJcbn1cclxuXHJcbi8vIHZlcmlmeSB0aGF0IG9iamVjdCBpcyBpbW11dGFibGUsIHdpdGhvdXQgdGhlIHJ1bnRpbWUgcGVuYWx0eSBpbiBwcm9kdWN0aW9uIGNvZGVcclxuaWYgKCBhc3NlcnQgKSB7IE9iamVjdC5mcmVlemUoIEJBU0VBMTF5U3RyaW5ncyApOyB9XHJcblxyXG5iYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5LnJlZ2lzdGVyKCAnQkFTRUExMXlTdHJpbmdzJywgQkFTRUExMXlTdHJpbmdzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCQVNFQTExeVN0cmluZ3M7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFFN0UsTUFBTUMsZUFBZSxHQUFHO0VBRXRCO0VBQ0E7RUFDQTtFQUNBQyxzQkFBc0IsRUFBRTtJQUN0QkMsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUVEO0VBQ0E7RUFDQTtFQUNBQyxRQUFRLEVBQUU7SUFDUkQsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNERSxTQUFTLEVBQUU7SUFDVEYsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUVEO0VBQ0E7RUFDQTtFQUNBRyxxQkFBcUIsRUFBRTtJQUNyQkgsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNESSxnQkFBZ0IsRUFBRTtJQUNoQkosS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNESyx1QkFBdUIsRUFBRTtJQUN2QkwsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNETSxzQkFBc0IsRUFBRTtJQUN0Qk4sS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNETyxpQkFBaUIsRUFBRTtJQUNqQlAsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNEUSxzQkFBc0IsRUFBRTtJQUN0QlIsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNEUyx1QkFBdUIsRUFBRTtJQUN2QlQsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNEVSxrQkFBa0IsRUFBRTtJQUNsQlYsS0FBSyxFQUFF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