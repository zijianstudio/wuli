// Copyright 2019-2022, University of Colorado Boulder

/**
 * Represents a specific challenge (set of fractions/pieces/targets and the given state of its solution).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Anton Ulyanov, Andrey Zelenkov (Mlearner)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FilledPartition from '../../game/model/FilledPartition.js';
import FillType from '../../game/model/FillType.js';
import ShapePartition from '../../game/model/ShapePartition.js';
import MatchPiece from './MatchPiece.js';
import MatchSpot from './MatchSpot.js';
import MatchTarget from './MatchTarget.js';

// constants
const NUM_PAIRS = 6;
const PIECE_COLORS = [FractionsCommonColors.shapeBlueProperty, FractionsCommonColors.shapeGreenProperty, FractionsCommonColors.shapeRedProperty];
class MatchingChallenge {
  /**
   * @param {number} levelNumber
   * @param {Object} config
   */
  constructor(levelNumber, config) {
    config = merge({
      // {Array.<Fraction>}
      fractions: [],
      // {Array.<ShapePartition>} optional
      shapePartitions: [...ShapePartition.PIES, ...ShapePartition.HORIZONTAL_BARS, ...ShapePartition.VERTICAL_BARS, ...ShapePartition.PLUS_SIGNS.filter(shapePartition => shapePartition.length > 3), ...ShapePartition.GRIDS, ...ShapePartition.PYRAMIDS, ...ShapePartition.POLYGONS, ...ShapePartition.DIAGONAL_LS.filter(shapePartition => shapePartition.length > 2), ...ShapePartition.INTERLEAVED_LS, ShapePartition.TETRIS, ShapePartition.SIX_FLOWER, ShapePartition.FIVE_POINT, ShapePartition.NINJA_STAR, ShapePartition.HEX_RING],
      // {boolean}
      hasMixedNumbers: false,
      // {Array.<FillType>} optional
      fillTypes: [FillType.SEQUENTIAL],
      // {Array.<number>} optional
      numericScaleFactors: [1],
      // {Property.<boolean>} optional
      timeVisibleProperty: new BooleanProperty(true),
      // {number}
      previousBestTime: Number.POSITIVE_INFINITY
    }, config);
    assert && assert(config.fractions.length > 0);

    // @public {Property.<boolean>}
    this.timeVisibleProperty = config.timeVisibleProperty;

    // @public {number}
    this.levelNumber = levelNumber;
    this.previousBestTime = config.previousBestTime;

    // @public {Property.<MatchingChallenge.State>}
    this.stateProperty = new Property(MatchingChallenge.State.NO_COMPARISON);

    // @public {Property.<number>}
    this.scoreProperty = new NumberProperty(0);
    this.lastScoreGainProperty = new NumberProperty(0);

    // @public {Property.<boolean>}
    this.wasLastAttemptFailureProperty = new BooleanProperty(false);

    // @public {Property.<number>}
    this.elapsedTimeProperty = new NumberProperty(0);

    // @public {boolean}
    this.isNewBestTime = false;

    // @public {Emitter} - Fires correct/incorrect whenever "check" is pressed, based on the result
    this.correctEmitter = new Emitter();
    this.incorrectEmitter = new Emitter();

    // @public {Emitter} - Fires when the challenge is fully completed
    this.completedEmitter = new Emitter();

    // @public {boolean}
    this.isComplete = false;

    // @public {MatchingChallenge} - Set externally if, when going from this challenge to the specified one, there
    // should instead be a "refresh" animation instead of "next" challenge.
    this.refreshedChallenge = null;

    // @public {Array.<MatchSpot>}
    this.sourceSpots = _.range(0, 2 * NUM_PAIRS).map(() => new MatchSpot());
    this.scaleSpots = _.range(0, 2).map(() => new MatchSpot({
      isScale: true
    }));

    // @public {Property.<MatchSpot>}
    this.lastChangedScaleSpotProperty = new Property(this.scaleSpots[0]);
    this.scaleSpots.forEach(scaleSpot => {
      scaleSpot.pieceProperty.lazyLink(() => {
        this.lastChangedScaleSpotProperty.value = scaleSpot;
      });
    });

    // @public {Array.<MatchTarget>}
    this.targets = _.range(0, NUM_PAIRS).map(() => new MatchTarget());
    const pieces = [];
    const fractions = dotRandom.shuffle(config.fractions).slice(0, NUM_PAIRS);
    const hasGreaterThanOne = _.some(fractions, fraction => Fraction.ONE.isLessThan(fraction));
    fractions.forEach((fraction, index) => {
      const scaleFactor = dotRandom.sample(config.numericScaleFactors);
      const scaledFraction = new Fraction(fraction.numerator * scaleFactor, fraction.denominator * scaleFactor);
      const fillType = dotRandom.sample(config.fillTypes);
      const shapePartitions = ShapePartition.supportsDenominator(config.shapePartitions, fraction.denominator);
      [0, 1].forEach(subIndex => {
        // First (generally 3) fractions should be numbers
        const shapePartition = subIndex === 0 && index < NUM_PAIRS / 2 ? null : dotRandom.sample(shapePartitions);
        const color = PIECE_COLORS[(index + subIndex) % 3];
        const filledPartitions = shapePartition ? FilledPartition.fill(shapePartition, fraction, color, fillType) : null;
        const piece = new MatchPiece(filledPartitions ? fraction : scaledFraction, filledPartitions, config.hasMixedNumbers, hasGreaterThanOne, {
          grab: () => {
            if (piece.spotProperty.value) {
              piece.spotProperty.value.pieceProperty.value = null;
              piece.spotProperty.value = null;
            }
          },
          drop: () => {
            const distanceFunction = spot => spot.positionProperty.value.distance(piece.positionProperty.value);
            const openSpots = [...this.sourceSpots, ...this.scaleSpots].filter(spot => spot.pieceProperty.value === null);
            const closestSpot = _.minBy([...this.sourceSpots, ...this.scaleSpots], distanceFunction);
            const closestOpenSpot = _.minBy(openSpots, distanceFunction);
            assert && assert(closestOpenSpot);

            // If the user drops the piece on the scale, it will replace any existing piece
            if (_.includes(this.scaleSpots, closestSpot) && closestSpot.pieceProperty.value) {
              const existingPiece = closestSpot.pieceProperty.value;
              existingPiece.moveToSpot(closestOpenSpot);
              closestSpot.pieceProperty.value = null;
              piece.moveToSpot(closestSpot);
            } else {
              piece.moveToSpot(closestOpenSpot);
            }
          }
        });
        pieces.push(piece);
      });
    });

    // @public {Array.<MatchPiece>}
    this.pieces = dotRandom.shuffle(pieces);

    // Connect the pieces to the initial source spots
    this.pieces.forEach((piece, index) => {
      const sourceSpot = this.sourceSpots[index];
      piece.spotProperty.value = sourceSpot;
      sourceSpot.pieceProperty.value = piece;
    });

    // @private {Array.<MatchPiece>}
    this.lastFailedPair = [];
    Multilink.multilink(this.scaleSpots.map(scaleSpot => scaleSpot.pieceProperty), (leftPiece, rightPiece) => {
      if (!leftPiece || !rightPiece) {
        this.stateProperty.value = MatchingChallenge.State.NO_COMPARISON;
      } else if (this.stateProperty.value === MatchingChallenge.State.NO_COMPARISON && leftPiece && rightPiece && (!_.includes(this.lastFailedPair, leftPiece) || !_.includes(this.lastFailedPair, rightPiece))) {
        this.stateProperty.value = MatchingChallenge.State.COMPARISON;
      }
    });
  }

  /**
   * Takes the pieces stored in the scale spots, and moves them to the next open target.
   * @public
   */
  collect() {
    const leftPiece = this.scaleSpots[0].pieceProperty.value;
    const rightPiece = this.scaleSpots[1].pieceProperty.value;
    const target = _.find(this.targets, target => !target.isFilledProperty.value);
    target.layout(leftPiece, rightPiece);

    // Hook up the spot/piece changes
    this.scaleSpots.forEach(scaleSpot => {
      scaleSpot.pieceProperty.value = null;
    });
    leftPiece.moveToSpot(target.spots[0], {
      scale: leftPiece.targetScale
    });
    rightPiece.moveToSpot(target.spots[1], {
      scale: rightPiece.targetScale
    });
    target.isFilledProperty.value = true;
    this.wasLastAttemptFailureProperty.value = false;
    if (_.every(this.targets, target => target.isFilledProperty.value)) {
      const isPerfectRun = this.scoreProperty.value === this.targets.length * 2;
      const isImprovedTime = this.elapsedTimeProperty.value < this.previousBestTime;
      if (isPerfectRun && isImprovedTime) {
        this.isNewBestTime = true;
      }
      this.isComplete = true;
      this.completedEmitter.emit();
    }
  }

  /**
   * Compares the pieces stored in the scale spots, with either a "correct" (matching) or "incorrect" answer.
   * @public
   */
  compare() {
    const leftPiece = this.scaleSpots[0].pieceProperty.value;
    const rightPiece = this.scaleSpots[1].pieceProperty.value;
    if (leftPiece.fraction.reduced().equals(rightPiece.fraction.reduced())) {
      const scoreDelta = this.wasLastAttemptFailureProperty.value ? 1 : 2;
      this.lastScoreGainProperty.value = scoreDelta;
      this.stateProperty.value = MatchingChallenge.State.MATCHED;
      this.scoreProperty.value += scoreDelta;
      this.correctEmitter.emit();
    } else {
      if (this.wasLastAttemptFailureProperty.value) {
        this.stateProperty.value = MatchingChallenge.State.SHOW_ANSWER;
      } else {
        this.stateProperty.value = MatchingChallenge.State.TRY_AGAIN;
      }
      this.lastFailedPair = [leftPiece, rightPiece];
      this.wasLastAttemptFailureProperty.value = true;
      this.lastScoreGainProperty.value = 0;
      this.incorrectEmitter.emit();
    }
  }

  /**
   * Handles the "try again" press behavior, which will remove the chart and buttons for the given (failed) pair.
   * @public
   */
  tryAgain() {
    this.stateProperty.value = MatchingChallenge.State.NO_COMPARISON;
  }

  /**
   * Given that the scale pieces don't match, it swaps out one with the "correct" piece, and animates both.
   * @public
   */
  showAnswer() {
    const changingSpot = this.lastChangedScaleSpotProperty.value;
    const stationarySpot = this.scaleSpots[(this.scaleSpots.indexOf(changingSpot) + 1) % 2];
    const discardPiece = changingSpot.pieceProperty.value;
    const matchedPiece = _.find(this.pieces, piece => {
      return _.includes(this.sourceSpots, piece.spotProperty.value) && piece.fraction.reduced().equals(stationarySpot.pieceProperty.value.fraction.reduced());
    });

    // In the case where we are dragging the other pieces that would be required, we won't complete the "show answer".
    if (!matchedPiece) {
      return;
    }
    discardPiece.moveToSpot(matchedPiece.spotProperty.value);
    matchedPiece.moveToSpot(changingSpot);
    this.stateProperty.value = MatchingChallenge.State.MATCHED;
  }

  /**
   * If both scales are empty, fill them with a matching pair.
   * @public
   */
  cheat() {
    // Only do things if both scales are empty, and there is one unfilled target
    if (_.every(this.scaleSpots, spot => spot.pieceProperty.value === null) && _.some(this.targets, target => !target.isFilledProperty.value)) {
      const firstPiece = _.find(this.pieces, piece => _.includes(this.sourceSpots, piece.spotProperty.value));
      const secondPiece = _.find(this.pieces, piece => {
        return piece !== firstPiece && _.includes(this.sourceSpots, piece.spotProperty.value) && piece.fraction.reduced().equals(firstPiece.fraction.reduced());
      });
      firstPiece.moveToSpot(this.scaleSpots[0]);
      secondPiece.moveToSpot(this.scaleSpots[1]);
    }
  }

  /**
   * Steps the model forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    // Only increase elapsed time if there is at least one unfilled target
    if (_.some(this.targets, target => !target.isFilledProperty.value)) {
      this.elapsedTimeProperty.value += dt;
    }
    this.pieces.forEach(piece => piece.step(dt));
  }
}

// @public {EnumerationDeprecated} - The main state values for the model
MatchingChallenge.State = EnumerationDeprecated.byKeys(['NO_COMPARISON', 'COMPARISON', 'MATCHED', 'TRY_AGAIN', 'SHOW_ANSWER']);
fractionsCommon.register('MatchingChallenge', MatchingChallenge);
export default MatchingChallenge;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIm1lcmdlIiwiRnJhY3Rpb24iLCJGcmFjdGlvbnNDb21tb25Db2xvcnMiLCJmcmFjdGlvbnNDb21tb24iLCJGaWxsZWRQYXJ0aXRpb24iLCJGaWxsVHlwZSIsIlNoYXBlUGFydGl0aW9uIiwiTWF0Y2hQaWVjZSIsIk1hdGNoU3BvdCIsIk1hdGNoVGFyZ2V0IiwiTlVNX1BBSVJTIiwiUElFQ0VfQ09MT1JTIiwic2hhcGVCbHVlUHJvcGVydHkiLCJzaGFwZUdyZWVuUHJvcGVydHkiLCJzaGFwZVJlZFByb3BlcnR5IiwiTWF0Y2hpbmdDaGFsbGVuZ2UiLCJjb25zdHJ1Y3RvciIsImxldmVsTnVtYmVyIiwiY29uZmlnIiwiZnJhY3Rpb25zIiwic2hhcGVQYXJ0aXRpb25zIiwiUElFUyIsIkhPUklaT05UQUxfQkFSUyIsIlZFUlRJQ0FMX0JBUlMiLCJQTFVTX1NJR05TIiwiZmlsdGVyIiwic2hhcGVQYXJ0aXRpb24iLCJsZW5ndGgiLCJHUklEUyIsIlBZUkFNSURTIiwiUE9MWUdPTlMiLCJESUFHT05BTF9MUyIsIklOVEVSTEVBVkVEX0xTIiwiVEVUUklTIiwiU0lYX0ZMT1dFUiIsIkZJVkVfUE9JTlQiLCJOSU5KQV9TVEFSIiwiSEVYX1JJTkciLCJoYXNNaXhlZE51bWJlcnMiLCJmaWxsVHlwZXMiLCJTRVFVRU5USUFMIiwibnVtZXJpY1NjYWxlRmFjdG9ycyIsInRpbWVWaXNpYmxlUHJvcGVydHkiLCJwcmV2aW91c0Jlc3RUaW1lIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJhc3NlcnQiLCJzdGF0ZVByb3BlcnR5IiwiU3RhdGUiLCJOT19DT01QQVJJU09OIiwic2NvcmVQcm9wZXJ0eSIsImxhc3RTY29yZUdhaW5Qcm9wZXJ0eSIsIndhc0xhc3RBdHRlbXB0RmFpbHVyZVByb3BlcnR5IiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsImlzTmV3QmVzdFRpbWUiLCJjb3JyZWN0RW1pdHRlciIsImluY29ycmVjdEVtaXR0ZXIiLCJjb21wbGV0ZWRFbWl0dGVyIiwiaXNDb21wbGV0ZSIsInJlZnJlc2hlZENoYWxsZW5nZSIsInNvdXJjZVNwb3RzIiwiXyIsInJhbmdlIiwibWFwIiwic2NhbGVTcG90cyIsImlzU2NhbGUiLCJsYXN0Q2hhbmdlZFNjYWxlU3BvdFByb3BlcnR5IiwiZm9yRWFjaCIsInNjYWxlU3BvdCIsInBpZWNlUHJvcGVydHkiLCJsYXp5TGluayIsInZhbHVlIiwidGFyZ2V0cyIsInBpZWNlcyIsInNodWZmbGUiLCJzbGljZSIsImhhc0dyZWF0ZXJUaGFuT25lIiwic29tZSIsImZyYWN0aW9uIiwiT05FIiwiaXNMZXNzVGhhbiIsImluZGV4Iiwic2NhbGVGYWN0b3IiLCJzYW1wbGUiLCJzY2FsZWRGcmFjdGlvbiIsIm51bWVyYXRvciIsImRlbm9taW5hdG9yIiwiZmlsbFR5cGUiLCJzdXBwb3J0c0Rlbm9taW5hdG9yIiwic3ViSW5kZXgiLCJjb2xvciIsImZpbGxlZFBhcnRpdGlvbnMiLCJmaWxsIiwicGllY2UiLCJncmFiIiwic3BvdFByb3BlcnR5IiwiZHJvcCIsImRpc3RhbmNlRnVuY3Rpb24iLCJzcG90IiwicG9zaXRpb25Qcm9wZXJ0eSIsImRpc3RhbmNlIiwib3BlblNwb3RzIiwiY2xvc2VzdFNwb3QiLCJtaW5CeSIsImNsb3Nlc3RPcGVuU3BvdCIsImluY2x1ZGVzIiwiZXhpc3RpbmdQaWVjZSIsIm1vdmVUb1Nwb3QiLCJwdXNoIiwic291cmNlU3BvdCIsImxhc3RGYWlsZWRQYWlyIiwibXVsdGlsaW5rIiwibGVmdFBpZWNlIiwicmlnaHRQaWVjZSIsIkNPTVBBUklTT04iLCJjb2xsZWN0IiwidGFyZ2V0IiwiZmluZCIsImlzRmlsbGVkUHJvcGVydHkiLCJsYXlvdXQiLCJzcG90cyIsInNjYWxlIiwidGFyZ2V0U2NhbGUiLCJldmVyeSIsImlzUGVyZmVjdFJ1biIsImlzSW1wcm92ZWRUaW1lIiwiZW1pdCIsImNvbXBhcmUiLCJyZWR1Y2VkIiwiZXF1YWxzIiwic2NvcmVEZWx0YSIsIk1BVENIRUQiLCJTSE9XX0FOU1dFUiIsIlRSWV9BR0FJTiIsInRyeUFnYWluIiwic2hvd0Fuc3dlciIsImNoYW5naW5nU3BvdCIsInN0YXRpb25hcnlTcG90IiwiaW5kZXhPZiIsImRpc2NhcmRQaWVjZSIsIm1hdGNoZWRQaWVjZSIsImNoZWF0IiwiZmlyc3RQaWVjZSIsInNlY29uZFBpZWNlIiwic3RlcCIsImR0IiwiYnlLZXlzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXRjaGluZ0NoYWxsZW5nZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgc3BlY2lmaWMgY2hhbGxlbmdlIChzZXQgb2YgZnJhY3Rpb25zL3BpZWNlcy90YXJnZXRzIGFuZCB0aGUgZ2l2ZW4gc3RhdGUgb2YgaXRzIHNvbHV0aW9uKS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIEFudG9uIFVseWFub3YsIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL0ZyYWN0aW9uLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uc0NvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9GcmFjdGlvbnNDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcbmltcG9ydCBGaWxsZWRQYXJ0aXRpb24gZnJvbSAnLi4vLi4vZ2FtZS9tb2RlbC9GaWxsZWRQYXJ0aXRpb24uanMnO1xyXG5pbXBvcnQgRmlsbFR5cGUgZnJvbSAnLi4vLi4vZ2FtZS9tb2RlbC9GaWxsVHlwZS5qcyc7XHJcbmltcG9ydCBTaGFwZVBhcnRpdGlvbiBmcm9tICcuLi8uLi9nYW1lL21vZGVsL1NoYXBlUGFydGl0aW9uLmpzJztcclxuaW1wb3J0IE1hdGNoUGllY2UgZnJvbSAnLi9NYXRjaFBpZWNlLmpzJztcclxuaW1wb3J0IE1hdGNoU3BvdCBmcm9tICcuL01hdGNoU3BvdC5qcyc7XHJcbmltcG9ydCBNYXRjaFRhcmdldCBmcm9tICcuL01hdGNoVGFyZ2V0LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOVU1fUEFJUlMgPSA2O1xyXG5jb25zdCBQSUVDRV9DT0xPUlMgPSBbXHJcbiAgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLnNoYXBlQmx1ZVByb3BlcnR5LFxyXG4gIEZyYWN0aW9uc0NvbW1vbkNvbG9ycy5zaGFwZUdyZWVuUHJvcGVydHksXHJcbiAgRnJhY3Rpb25zQ29tbW9uQ29sb3JzLnNoYXBlUmVkUHJvcGVydHlcclxuXTtcclxuXHJcbmNsYXNzIE1hdGNoaW5nQ2hhbGxlbmdlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGV2ZWxOdW1iZXJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGxldmVsTnVtYmVyLCBjb25maWcgKSB7XHJcblxyXG4gICAgY29uZmlnID0gbWVyZ2UoIHtcclxuICAgICAgLy8ge0FycmF5LjxGcmFjdGlvbj59XHJcbiAgICAgIGZyYWN0aW9uczogW10sXHJcblxyXG4gICAgICAvLyB7QXJyYXkuPFNoYXBlUGFydGl0aW9uPn0gb3B0aW9uYWxcclxuICAgICAgc2hhcGVQYXJ0aXRpb25zOiBbXHJcbiAgICAgICAgLi4uU2hhcGVQYXJ0aXRpb24uUElFUyxcclxuICAgICAgICAuLi5TaGFwZVBhcnRpdGlvbi5IT1JJWk9OVEFMX0JBUlMsXHJcbiAgICAgICAgLi4uU2hhcGVQYXJ0aXRpb24uVkVSVElDQUxfQkFSUyxcclxuICAgICAgICAuLi5TaGFwZVBhcnRpdGlvbi5QTFVTX1NJR05TLmZpbHRlciggc2hhcGVQYXJ0aXRpb24gPT4gc2hhcGVQYXJ0aXRpb24ubGVuZ3RoID4gMyApLFxyXG4gICAgICAgIC4uLlNoYXBlUGFydGl0aW9uLkdSSURTLFxyXG4gICAgICAgIC4uLlNoYXBlUGFydGl0aW9uLlBZUkFNSURTLFxyXG4gICAgICAgIC4uLlNoYXBlUGFydGl0aW9uLlBPTFlHT05TLFxyXG4gICAgICAgIC4uLlNoYXBlUGFydGl0aW9uLkRJQUdPTkFMX0xTLmZpbHRlciggc2hhcGVQYXJ0aXRpb24gPT4gc2hhcGVQYXJ0aXRpb24ubGVuZ3RoID4gMiApLFxyXG4gICAgICAgIC4uLlNoYXBlUGFydGl0aW9uLklOVEVSTEVBVkVEX0xTLFxyXG4gICAgICAgIFNoYXBlUGFydGl0aW9uLlRFVFJJUyxcclxuICAgICAgICBTaGFwZVBhcnRpdGlvbi5TSVhfRkxPV0VSLFxyXG4gICAgICAgIFNoYXBlUGFydGl0aW9uLkZJVkVfUE9JTlQsXHJcbiAgICAgICAgU2hhcGVQYXJ0aXRpb24uTklOSkFfU1RBUixcclxuICAgICAgICBTaGFwZVBhcnRpdGlvbi5IRVhfUklOR1xyXG4gICAgICBdLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59XHJcbiAgICAgIGhhc01peGVkTnVtYmVyczogZmFsc2UsXHJcblxyXG4gICAgICAvLyB7QXJyYXkuPEZpbGxUeXBlPn0gb3B0aW9uYWxcclxuICAgICAgZmlsbFR5cGVzOiBbXHJcbiAgICAgICAgRmlsbFR5cGUuU0VRVUVOVElBTFxyXG4gICAgICBdLFxyXG5cclxuICAgICAgLy8ge0FycmF5LjxudW1iZXI+fSBvcHRpb25hbFxyXG4gICAgICBudW1lcmljU2NhbGVGYWN0b3JzOiBbIDEgXSxcclxuXHJcbiAgICAgIC8vIHtQcm9wZXJ0eS48Ym9vbGVhbj59IG9wdGlvbmFsXHJcbiAgICAgIHRpbWVWaXNpYmxlUHJvcGVydHk6IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKSxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9XHJcbiAgICAgIHByZXZpb3VzQmVzdFRpbWU6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxyXG4gICAgfSwgY29uZmlnICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29uZmlnLmZyYWN0aW9ucy5sZW5ndGggPiAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fVxyXG4gICAgdGhpcy50aW1lVmlzaWJsZVByb3BlcnR5ID0gY29uZmlnLnRpbWVWaXNpYmxlUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5sZXZlbE51bWJlciA9IGxldmVsTnVtYmVyO1xyXG4gICAgdGhpcy5wcmV2aW91c0Jlc3RUaW1lID0gY29uZmlnLnByZXZpb3VzQmVzdFRpbWU7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPE1hdGNoaW5nQ2hhbGxlbmdlLlN0YXRlPn1cclxuICAgIHRoaXMuc3RhdGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggTWF0Y2hpbmdDaGFsbGVuZ2UuU3RhdGUuTk9fQ09NUEFSSVNPTiApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5zY29yZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcbiAgICB0aGlzLmxhc3RTY29yZUdhaW5Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMud2FzTGFzdEF0dGVtcHRGYWlsdXJlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuaXNOZXdCZXN0VGltZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VtaXR0ZXJ9IC0gRmlyZXMgY29ycmVjdC9pbmNvcnJlY3Qgd2hlbmV2ZXIgXCJjaGVja1wiIGlzIHByZXNzZWQsIGJhc2VkIG9uIHRoZSByZXN1bHRcclxuICAgIHRoaXMuY29ycmVjdEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy5pbmNvcnJlY3RFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbWl0dGVyfSAtIEZpcmVzIHdoZW4gdGhlIGNoYWxsZW5nZSBpcyBmdWxseSBjb21wbGV0ZWRcclxuICAgIHRoaXMuY29tcGxldGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuaXNDb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge01hdGNoaW5nQ2hhbGxlbmdlfSAtIFNldCBleHRlcm5hbGx5IGlmLCB3aGVuIGdvaW5nIGZyb20gdGhpcyBjaGFsbGVuZ2UgdG8gdGhlIHNwZWNpZmllZCBvbmUsIHRoZXJlXHJcbiAgICAvLyBzaG91bGQgaW5zdGVhZCBiZSBhIFwicmVmcmVzaFwiIGFuaW1hdGlvbiBpbnN0ZWFkIG9mIFwibmV4dFwiIGNoYWxsZW5nZS5cclxuICAgIHRoaXMucmVmcmVzaGVkQ2hhbGxlbmdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48TWF0Y2hTcG90Pn1cclxuICAgIHRoaXMuc291cmNlU3BvdHMgPSBfLnJhbmdlKCAwLCAyICogTlVNX1BBSVJTICkubWFwKCAoKSA9PiBuZXcgTWF0Y2hTcG90KCkgKTtcclxuICAgIHRoaXMuc2NhbGVTcG90cyA9IF8ucmFuZ2UoIDAsIDIgKS5tYXAoICgpID0+IG5ldyBNYXRjaFNwb3QoIHsgaXNTY2FsZTogdHJ1ZSB9ICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48TWF0Y2hTcG90Pn1cclxuICAgIHRoaXMubGFzdENoYW5nZWRTY2FsZVNwb3RQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdGhpcy5zY2FsZVNwb3RzWyAwIF0gKTtcclxuICAgIHRoaXMuc2NhbGVTcG90cy5mb3JFYWNoKCBzY2FsZVNwb3QgPT4ge1xyXG4gICAgICBzY2FsZVNwb3QucGllY2VQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubGFzdENoYW5nZWRTY2FsZVNwb3RQcm9wZXJ0eS52YWx1ZSA9IHNjYWxlU3BvdDtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxNYXRjaFRhcmdldD59XHJcbiAgICB0aGlzLnRhcmdldHMgPSBfLnJhbmdlKCAwLCBOVU1fUEFJUlMgKS5tYXAoICgpID0+IG5ldyBNYXRjaFRhcmdldCgpICk7XHJcblxyXG4gICAgY29uc3QgcGllY2VzID0gW107XHJcbiAgICBjb25zdCBmcmFjdGlvbnMgPSBkb3RSYW5kb20uc2h1ZmZsZSggY29uZmlnLmZyYWN0aW9ucyApLnNsaWNlKCAwLCBOVU1fUEFJUlMgKTtcclxuICAgIGNvbnN0IGhhc0dyZWF0ZXJUaGFuT25lID0gXy5zb21lKCBmcmFjdGlvbnMsIGZyYWN0aW9uID0+IEZyYWN0aW9uLk9ORS5pc0xlc3NUaGFuKCBmcmFjdGlvbiApICk7XHJcblxyXG4gICAgZnJhY3Rpb25zLmZvckVhY2goICggZnJhY3Rpb24sIGluZGV4ICkgPT4ge1xyXG4gICAgICBjb25zdCBzY2FsZUZhY3RvciA9IGRvdFJhbmRvbS5zYW1wbGUoIGNvbmZpZy5udW1lcmljU2NhbGVGYWN0b3JzICk7XHJcbiAgICAgIGNvbnN0IHNjYWxlZEZyYWN0aW9uID0gbmV3IEZyYWN0aW9uKCBmcmFjdGlvbi5udW1lcmF0b3IgKiBzY2FsZUZhY3RvciwgZnJhY3Rpb24uZGVub21pbmF0b3IgKiBzY2FsZUZhY3RvciApO1xyXG4gICAgICBjb25zdCBmaWxsVHlwZSA9IGRvdFJhbmRvbS5zYW1wbGUoIGNvbmZpZy5maWxsVHlwZXMgKTtcclxuICAgICAgY29uc3Qgc2hhcGVQYXJ0aXRpb25zID0gU2hhcGVQYXJ0aXRpb24uc3VwcG9ydHNEZW5vbWluYXRvciggY29uZmlnLnNoYXBlUGFydGl0aW9ucywgZnJhY3Rpb24uZGVub21pbmF0b3IgKTtcclxuXHJcbiAgICAgIFsgMCwgMSBdLmZvckVhY2goIHN1YkluZGV4ID0+IHtcclxuICAgICAgICAvLyBGaXJzdCAoZ2VuZXJhbGx5IDMpIGZyYWN0aW9ucyBzaG91bGQgYmUgbnVtYmVyc1xyXG4gICAgICAgIGNvbnN0IHNoYXBlUGFydGl0aW9uID0gKCBzdWJJbmRleCA9PT0gMCAmJiBpbmRleCA8IE5VTV9QQUlSUyAvIDIgKSA/IG51bGwgOiBkb3RSYW5kb20uc2FtcGxlKCBzaGFwZVBhcnRpdGlvbnMgKTtcclxuICAgICAgICBjb25zdCBjb2xvciA9IFBJRUNFX0NPTE9SU1sgKCBpbmRleCArIHN1YkluZGV4ICkgJSAzIF07XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbGxlZFBhcnRpdGlvbnMgPSBzaGFwZVBhcnRpdGlvbiA/IEZpbGxlZFBhcnRpdGlvbi5maWxsKCBzaGFwZVBhcnRpdGlvbiwgZnJhY3Rpb24sIGNvbG9yLCBmaWxsVHlwZSApIDogbnVsbDtcclxuICAgICAgICBjb25zdCBwaWVjZSA9IG5ldyBNYXRjaFBpZWNlKCBmaWxsZWRQYXJ0aXRpb25zID8gZnJhY3Rpb24gOiBzY2FsZWRGcmFjdGlvbiwgZmlsbGVkUGFydGl0aW9ucywgY29uZmlnLmhhc01peGVkTnVtYmVycywgaGFzR3JlYXRlclRoYW5PbmUsIHtcclxuICAgICAgICAgIGdyYWI6ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCBwaWVjZS5zcG90UHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgICAgcGllY2Uuc3BvdFByb3BlcnR5LnZhbHVlLnBpZWNlUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgIHBpZWNlLnNwb3RQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkcm9wOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlRnVuY3Rpb24gPSBzcG90ID0+IHNwb3QucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggcGllY2UucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICAgICAgICBjb25zdCBvcGVuU3BvdHMgPSBbIC4uLnRoaXMuc291cmNlU3BvdHMsIC4uLnRoaXMuc2NhbGVTcG90cyBdLmZpbHRlciggc3BvdCA9PiBzcG90LnBpZWNlUHJvcGVydHkudmFsdWUgPT09IG51bGwgKTtcclxuICAgICAgICAgICAgY29uc3QgY2xvc2VzdFNwb3QgPSBfLm1pbkJ5KCBbIC4uLnRoaXMuc291cmNlU3BvdHMsIC4uLnRoaXMuc2NhbGVTcG90cyBdLCBkaXN0YW5jZUZ1bmN0aW9uICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsb3Nlc3RPcGVuU3BvdCA9IF8ubWluQnkoIG9wZW5TcG90cywgZGlzdGFuY2VGdW5jdGlvbiApO1xyXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjbG9zZXN0T3BlblNwb3QgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHRoZSB1c2VyIGRyb3BzIHRoZSBwaWVjZSBvbiB0aGUgc2NhbGUsIGl0IHdpbGwgcmVwbGFjZSBhbnkgZXhpc3RpbmcgcGllY2VcclxuICAgICAgICAgICAgaWYgKCBfLmluY2x1ZGVzKCB0aGlzLnNjYWxlU3BvdHMsIGNsb3Nlc3RTcG90ICkgJiYgY2xvc2VzdFNwb3QucGllY2VQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1BpZWNlID0gY2xvc2VzdFNwb3QucGllY2VQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgICAgICBleGlzdGluZ1BpZWNlLm1vdmVUb1Nwb3QoIGNsb3Nlc3RPcGVuU3BvdCApO1xyXG4gICAgICAgICAgICAgIGNsb3Nlc3RTcG90LnBpZWNlUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgIHBpZWNlLm1vdmVUb1Nwb3QoIGNsb3Nlc3RTcG90ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGllY2UubW92ZVRvU3BvdCggY2xvc2VzdE9wZW5TcG90ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgcGllY2VzLnB1c2goIHBpZWNlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48TWF0Y2hQaWVjZT59XHJcbiAgICB0aGlzLnBpZWNlcyA9IGRvdFJhbmRvbS5zaHVmZmxlKCBwaWVjZXMgKTtcclxuXHJcbiAgICAvLyBDb25uZWN0IHRoZSBwaWVjZXMgdG8gdGhlIGluaXRpYWwgc291cmNlIHNwb3RzXHJcbiAgICB0aGlzLnBpZWNlcy5mb3JFYWNoKCAoIHBpZWNlLCBpbmRleCApID0+IHtcclxuICAgICAgY29uc3Qgc291cmNlU3BvdCA9IHRoaXMuc291cmNlU3BvdHNbIGluZGV4IF07XHJcblxyXG4gICAgICBwaWVjZS5zcG90UHJvcGVydHkudmFsdWUgPSBzb3VyY2VTcG90O1xyXG4gICAgICBzb3VyY2VTcG90LnBpZWNlUHJvcGVydHkudmFsdWUgPSBwaWVjZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPE1hdGNoUGllY2U+fVxyXG4gICAgdGhpcy5sYXN0RmFpbGVkUGFpciA9IFtdO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggdGhpcy5zY2FsZVNwb3RzLm1hcCggc2NhbGVTcG90ID0+IHNjYWxlU3BvdC5waWVjZVByb3BlcnR5ICksICggbGVmdFBpZWNlLCByaWdodFBpZWNlICkgPT4ge1xyXG4gICAgICBpZiAoICFsZWZ0UGllY2UgfHwgIXJpZ2h0UGllY2UgKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID0gTWF0Y2hpbmdDaGFsbGVuZ2UuU3RhdGUuTk9fQ09NUEFSSVNPTjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID09PSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5OT19DT01QQVJJU09OICYmXHJcbiAgICAgICAgICAgICAgICBsZWZ0UGllY2UgJiZcclxuICAgICAgICAgICAgICAgIHJpZ2h0UGllY2UgJiZcclxuICAgICAgICAgICAgICAgICggIV8uaW5jbHVkZXMoIHRoaXMubGFzdEZhaWxlZFBhaXIsIGxlZnRQaWVjZSApIHx8ICFfLmluY2x1ZGVzKCB0aGlzLmxhc3RGYWlsZWRQYWlyLCByaWdodFBpZWNlICkgKSApIHtcclxuICAgICAgICB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5DT01QQVJJU09OO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlcyB0aGUgcGllY2VzIHN0b3JlZCBpbiB0aGUgc2NhbGUgc3BvdHMsIGFuZCBtb3ZlcyB0aGVtIHRvIHRoZSBuZXh0IG9wZW4gdGFyZ2V0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb2xsZWN0KCkge1xyXG4gICAgY29uc3QgbGVmdFBpZWNlID0gdGhpcy5zY2FsZVNwb3RzWyAwIF0ucGllY2VQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHJpZ2h0UGllY2UgPSB0aGlzLnNjYWxlU3BvdHNbIDEgXS5waWVjZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldCA9IF8uZmluZCggdGhpcy50YXJnZXRzLCB0YXJnZXQgPT4gIXRhcmdldC5pc0ZpbGxlZFByb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgdGFyZ2V0LmxheW91dCggbGVmdFBpZWNlLCByaWdodFBpZWNlICk7XHJcblxyXG4gICAgLy8gSG9vayB1cCB0aGUgc3BvdC9waWVjZSBjaGFuZ2VzXHJcbiAgICB0aGlzLnNjYWxlU3BvdHMuZm9yRWFjaCggc2NhbGVTcG90ID0+IHtcclxuICAgICAgc2NhbGVTcG90LnBpZWNlUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGxlZnRQaWVjZS5tb3ZlVG9TcG90KCB0YXJnZXQuc3BvdHNbIDAgXSwge1xyXG4gICAgICBzY2FsZTogbGVmdFBpZWNlLnRhcmdldFNjYWxlXHJcbiAgICB9ICk7XHJcbiAgICByaWdodFBpZWNlLm1vdmVUb1Nwb3QoIHRhcmdldC5zcG90c1sgMSBdLCB7XHJcbiAgICAgIHNjYWxlOiByaWdodFBpZWNlLnRhcmdldFNjYWxlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGFyZ2V0LmlzRmlsbGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgdGhpcy53YXNMYXN0QXR0ZW1wdEZhaWx1cmVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmICggXy5ldmVyeSggdGhpcy50YXJnZXRzLCB0YXJnZXQgPT4gdGFyZ2V0LmlzRmlsbGVkUHJvcGVydHkudmFsdWUgKSApIHtcclxuICAgICAgY29uc3QgaXNQZXJmZWN0UnVuID0gdGhpcy5zY29yZVByb3BlcnR5LnZhbHVlID09PSB0aGlzLnRhcmdldHMubGVuZ3RoICogMjtcclxuICAgICAgY29uc3QgaXNJbXByb3ZlZFRpbWUgPSB0aGlzLmVsYXBzZWRUaW1lUHJvcGVydHkudmFsdWUgPCB0aGlzLnByZXZpb3VzQmVzdFRpbWU7XHJcbiAgICAgIGlmICggaXNQZXJmZWN0UnVuICYmIGlzSW1wcm92ZWRUaW1lICkge1xyXG4gICAgICAgIHRoaXMuaXNOZXdCZXN0VGltZSA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaXNDb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgIHRoaXMuY29tcGxldGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wYXJlcyB0aGUgcGllY2VzIHN0b3JlZCBpbiB0aGUgc2NhbGUgc3BvdHMsIHdpdGggZWl0aGVyIGEgXCJjb3JyZWN0XCIgKG1hdGNoaW5nKSBvciBcImluY29ycmVjdFwiIGFuc3dlci5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29tcGFyZSgpIHtcclxuICAgIGNvbnN0IGxlZnRQaWVjZSA9IHRoaXMuc2NhbGVTcG90c1sgMCBdLnBpZWNlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCByaWdodFBpZWNlID0gdGhpcy5zY2FsZVNwb3RzWyAxIF0ucGllY2VQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBpZiAoIGxlZnRQaWVjZS5mcmFjdGlvbi5yZWR1Y2VkKCkuZXF1YWxzKCByaWdodFBpZWNlLmZyYWN0aW9uLnJlZHVjZWQoKSApICkge1xyXG4gICAgICBjb25zdCBzY29yZURlbHRhID0gdGhpcy53YXNMYXN0QXR0ZW1wdEZhaWx1cmVQcm9wZXJ0eS52YWx1ZSA/IDEgOiAyO1xyXG4gICAgICB0aGlzLmxhc3RTY29yZUdhaW5Qcm9wZXJ0eS52YWx1ZSA9IHNjb3JlRGVsdGE7XHJcbiAgICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS52YWx1ZSA9IE1hdGNoaW5nQ2hhbGxlbmdlLlN0YXRlLk1BVENIRUQ7XHJcblxyXG4gICAgICB0aGlzLnNjb3JlUHJvcGVydHkudmFsdWUgKz0gc2NvcmVEZWx0YTtcclxuXHJcbiAgICAgIHRoaXMuY29ycmVjdEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmICggdGhpcy53YXNMYXN0QXR0ZW1wdEZhaWx1cmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5TSE9XX0FOU1dFUjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5UUllfQUdBSU47XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5sYXN0RmFpbGVkUGFpciA9IFsgbGVmdFBpZWNlLCByaWdodFBpZWNlIF07XHJcbiAgICAgIHRoaXMud2FzTGFzdEF0dGVtcHRGYWlsdXJlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmxhc3RTY29yZUdhaW5Qcm9wZXJ0eS52YWx1ZSA9IDA7XHJcblxyXG4gICAgICB0aGlzLmluY29ycmVjdEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyB0aGUgXCJ0cnkgYWdhaW5cIiBwcmVzcyBiZWhhdmlvciwgd2hpY2ggd2lsbCByZW1vdmUgdGhlIGNoYXJ0IGFuZCBidXR0b25zIGZvciB0aGUgZ2l2ZW4gKGZhaWxlZCkgcGFpci5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdHJ5QWdhaW4oKSB7XHJcbiAgICB0aGlzLnN0YXRlUHJvcGVydHkudmFsdWUgPSBNYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZS5OT19DT01QQVJJU09OO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2l2ZW4gdGhhdCB0aGUgc2NhbGUgcGllY2VzIGRvbid0IG1hdGNoLCBpdCBzd2FwcyBvdXQgb25lIHdpdGggdGhlIFwiY29ycmVjdFwiIHBpZWNlLCBhbmQgYW5pbWF0ZXMgYm90aC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2hvd0Fuc3dlcigpIHtcclxuICAgIGNvbnN0IGNoYW5naW5nU3BvdCA9IHRoaXMubGFzdENoYW5nZWRTY2FsZVNwb3RQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHN0YXRpb25hcnlTcG90ID0gdGhpcy5zY2FsZVNwb3RzWyAoIHRoaXMuc2NhbGVTcG90cy5pbmRleE9mKCBjaGFuZ2luZ1Nwb3QgKSArIDEgKSAlIDIgXTtcclxuICAgIGNvbnN0IGRpc2NhcmRQaWVjZSA9IGNoYW5naW5nU3BvdC5waWVjZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgbWF0Y2hlZFBpZWNlID0gXy5maW5kKCB0aGlzLnBpZWNlcywgcGllY2UgPT4ge1xyXG4gICAgICByZXR1cm4gXy5pbmNsdWRlcyggdGhpcy5zb3VyY2VTcG90cywgcGllY2Uuc3BvdFByb3BlcnR5LnZhbHVlICkgJiZcclxuICAgICAgICAgICAgIHBpZWNlLmZyYWN0aW9uLnJlZHVjZWQoKS5lcXVhbHMoIHN0YXRpb25hcnlTcG90LnBpZWNlUHJvcGVydHkudmFsdWUuZnJhY3Rpb24ucmVkdWNlZCgpICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSW4gdGhlIGNhc2Ugd2hlcmUgd2UgYXJlIGRyYWdnaW5nIHRoZSBvdGhlciBwaWVjZXMgdGhhdCB3b3VsZCBiZSByZXF1aXJlZCwgd2Ugd29uJ3QgY29tcGxldGUgdGhlIFwic2hvdyBhbnN3ZXJcIi5cclxuICAgIGlmICggIW1hdGNoZWRQaWVjZSApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc2NhcmRQaWVjZS5tb3ZlVG9TcG90KCBtYXRjaGVkUGllY2Uuc3BvdFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICBtYXRjaGVkUGllY2UubW92ZVRvU3BvdCggY2hhbmdpbmdTcG90ICk7XHJcblxyXG4gICAgdGhpcy5zdGF0ZVByb3BlcnR5LnZhbHVlID0gTWF0Y2hpbmdDaGFsbGVuZ2UuU3RhdGUuTUFUQ0hFRDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIGJvdGggc2NhbGVzIGFyZSBlbXB0eSwgZmlsbCB0aGVtIHdpdGggYSBtYXRjaGluZyBwYWlyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjaGVhdCgpIHtcclxuICAgIC8vIE9ubHkgZG8gdGhpbmdzIGlmIGJvdGggc2NhbGVzIGFyZSBlbXB0eSwgYW5kIHRoZXJlIGlzIG9uZSB1bmZpbGxlZCB0YXJnZXRcclxuICAgIGlmICggXy5ldmVyeSggdGhpcy5zY2FsZVNwb3RzLCBzcG90ID0+IHNwb3QucGllY2VQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApICYmXHJcbiAgICAgICAgIF8uc29tZSggdGhpcy50YXJnZXRzLCB0YXJnZXQgPT4gIXRhcmdldC5pc0ZpbGxlZFByb3BlcnR5LnZhbHVlICkgKSB7XHJcbiAgICAgIGNvbnN0IGZpcnN0UGllY2UgPSBfLmZpbmQoIHRoaXMucGllY2VzLCBwaWVjZSA9PiBfLmluY2x1ZGVzKCB0aGlzLnNvdXJjZVNwb3RzLCBwaWVjZS5zcG90UHJvcGVydHkudmFsdWUgKSApO1xyXG4gICAgICBjb25zdCBzZWNvbmRQaWVjZSA9IF8uZmluZCggdGhpcy5waWVjZXMsIHBpZWNlID0+IHtcclxuICAgICAgICByZXR1cm4gcGllY2UgIT09IGZpcnN0UGllY2UgJiZcclxuICAgICAgICAgICAgICAgXy5pbmNsdWRlcyggdGhpcy5zb3VyY2VTcG90cywgcGllY2Uuc3BvdFByb3BlcnR5LnZhbHVlICkgJiZcclxuICAgICAgICAgICAgICAgcGllY2UuZnJhY3Rpb24ucmVkdWNlZCgpLmVxdWFscyggZmlyc3RQaWVjZS5mcmFjdGlvbi5yZWR1Y2VkKCkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgZmlyc3RQaWVjZS5tb3ZlVG9TcG90KCB0aGlzLnNjYWxlU3BvdHNbIDAgXSApO1xyXG4gICAgICBzZWNvbmRQaWVjZS5tb3ZlVG9TcG90KCB0aGlzLnNjYWxlU3BvdHNbIDEgXSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIG1vZGVsIGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIC8vIE9ubHkgaW5jcmVhc2UgZWxhcHNlZCB0aW1lIGlmIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSB1bmZpbGxlZCB0YXJnZXRcclxuICAgIGlmICggXy5zb21lKCB0aGlzLnRhcmdldHMsIHRhcmdldCA9PiAhdGFyZ2V0LmlzRmlsbGVkUHJvcGVydHkudmFsdWUgKSApIHtcclxuICAgICAgdGhpcy5lbGFwc2VkVGltZVByb3BlcnR5LnZhbHVlICs9IGR0O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucGllY2VzLmZvckVhY2goIHBpZWNlID0+IHBpZWNlLnN0ZXAoIGR0ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEBwdWJsaWMge0VudW1lcmF0aW9uRGVwcmVjYXRlZH0gLSBUaGUgbWFpbiBzdGF0ZSB2YWx1ZXMgZm9yIHRoZSBtb2RlbFxyXG5NYXRjaGluZ0NoYWxsZW5nZS5TdGF0ZSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFtcclxuICAnTk9fQ09NUEFSSVNPTicsXHJcbiAgJ0NPTVBBUklTT04nLFxyXG4gICdNQVRDSEVEJyxcclxuICAnVFJZX0FHQUlOJyxcclxuICAnU0hPV19BTlNXRVInXHJcbl0gKTtcclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ01hdGNoaW5nQ2hhbGxlbmdlJywgTWF0Y2hpbmdDaGFsbGVuZ2UgKTtcclxuZXhwb3J0IGRlZmF1bHQgTWF0Y2hpbmdDaGFsbGVuZ2U7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MscUJBQXFCLE1BQU0sbURBQW1EO0FBQ3JGLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLDZDQUE2QztBQUNsRSxPQUFPQyxxQkFBcUIsTUFBTSw0Q0FBNEM7QUFDOUUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxlQUFlLE1BQU0scUNBQXFDO0FBQ2pFLE9BQU9DLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBQ3hDLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjs7QUFFMUM7QUFDQSxNQUFNQyxTQUFTLEdBQUcsQ0FBQztBQUNuQixNQUFNQyxZQUFZLEdBQUcs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