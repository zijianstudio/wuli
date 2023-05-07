// Copyright 2016-2022, University of Colorado Boulder

/**
 * Manages accessibility descriptions for a balloon in this simulation. Is responsible for functions that
 * generate descriptions, as well as adding updating descriptive content and announcing alerts when model Properties
 * change.
 *
 * Some alerts require polling because they have to be announced after a lack of property change after some interaction.
 * For instance, after a balloon is released, if it doesn't move due to an applied force we need to alert that there
 * was no movement. So BalloonDecriber manages the before/after values necessary to accomplish this. Property observers
 * are used where possible, but for alerts that need to be timed around those that use polling, it is more
 * straight forward to have those use polling as well.
 *
 * This file is quite large. It distributes some logic into additional files (BalloonPositionDescriber,
 * BalloonChargeDescriber) that describe particular aspects of a balloon. Further abstraction doesn't feel helpful
 * as it all pertains to general balloon description, so I decided to keep the remaining functions in this file for
 * easy discoverability.
 *
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import merge from '../../../../../phet-core/js/merge.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import Alerter from '../../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import AriaLiveAnnouncer from '../../../../../utterance-queue/js/AriaLiveAnnouncer.js';
import Utterance from '../../../../../utterance-queue/js/Utterance.js';
import balloonsAndStaticElectricity from '../../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../../BASEA11yStrings.js';
import BASEConstants from '../../BASEConstants.js';
import PlayAreaMap from '../../model/PlayAreaMap.js';
import BalloonChargeDescriber from './BalloonChargeDescriber.js';
import BalloonPositionDescriber from './BalloonPositionDescriber.js';
import BASEDescriber from './BASEDescriber.js';
import SweaterDescriber from './SweaterDescriber.js';
import WallDescriber from './WallDescriber.js';
const balloonShowAllChargesPatternString = BASEA11yStrings.balloonShowAllChargesPattern.value;
const balloonAtPositionPatternString = BASEA11yStrings.balloonAtPositionPattern.value;
const singleStatementPatternString = BASEA11yStrings.singleStatementPattern.value;
const balloonPicksUpChargesPatternString = BASEA11yStrings.balloonPicksUpChargesPattern.value;
const balloonPicksUpMoreChargesPatternString = BASEA11yStrings.balloonPicksUpMoreChargesPattern.value;
const balloonPicksUpChargesDiffPatternString = BASEA11yStrings.balloonPicksUpChargesDiffPattern.value;
const balloonPicksUpMoreChargesDiffPatternString = BASEA11yStrings.balloonPicksUpMoreChargesDiffPattern.value;
const balloonSweaterRelativeChargesPatternString = BASEA11yStrings.balloonSweaterRelativeChargesPattern.value;
const lastChargePickedUpPatternString = BASEA11yStrings.lastChargePickedUpPattern.value;
const noChargePickupPatternString = BASEA11yStrings.noChargePickupPattern.value;
const noChangeInChargesString = BASEA11yStrings.noChangeInCharges.value;
const noChangeInNetChargeString = BASEA11yStrings.noChangeInNetCharge.value;
const noChargePickupHintPatternString = BASEA11yStrings.noChargePickupHintPattern.value;
const nochargePickupWithObjectChargeAndHint = BASEA11yStrings.nochargePickupWithObjectChargeAndHint.value;
const releaseHintString = BASEA11yStrings.releaseHint.value;
const balloonAddedPatternString = BASEA11yStrings.balloonAddedPattern.value;
const balloonRemovedPatternString = BASEA11yStrings.balloonRemovedPattern.value;
const balloonAddedWithPositionPatternString = BASEA11yStrings.balloonAddedWithPositionPattern.value;
const wallRubbingWithPairsPattern = BASEA11yStrings.wallRubbingWithPairsPattern.value;
const wallRubPatternString = BASEA11yStrings.wallRubPattern.value;
const wallRubAllPatternString = BASEA11yStrings.wallRubAllPattern.value;
const wallRubDiffPatternString = BASEA11yStrings.wallRubDiffPattern.value;

// constants
// in ms, delay before announcing an alert that describes independent movement, to give the model time to respond
const RELEASE_DESCRIPTION_TIME_DELAY = 50;

// in ms, limits frequency of charge pickup alerts
const CHARGE_DESCRIPTION_REFRESH_RATE = 2000;

// in ms, time between alerts that tell user balloon continues to move due to force
const RELEASE_DESCRIPTION_REFRESH_RATE = 5000;
class BalloonDescriber extends Alerter {
  /**
   * @param {BASEModel} model
   * @param {WallModel} wall
   * @param {BalloonModel} balloon
   * @param {string} accessibleLabel - accessible name for the balloon being described
   * @param {string} otherAccessibleLabel - accessible name for the other balloon being described
   * @param {Node} nodeToAlertWith - need a connected Node to alert to a description UtteranceQueue
   */
  constructor(model, wall, balloon, accessibleLabel, otherAccessibleLabel, nodeToAlertWith) {
    super({
      descriptionAlertNode: nodeToAlertWith
    });
    // @private
    this.model = model;
    this.wall = wall;
    this.balloonModel = balloon;
    this.accessibleName = accessibleLabel;
    this.otherAccessibleName = otherAccessibleLabel;
    this.showChargesProperty = model.showChargesProperty;
    this.nodeToAlertWith = nodeToAlertWith;

    // @private - manages descriptions about the balloon related to charge
    this.chargeDescriber = new BalloonChargeDescriber(model, balloon, accessibleLabel, otherAccessibleLabel);

    // @private - manages descriptions about the  balloon related to balloon movement and position
    this.movementDescriber = new BalloonPositionDescriber(this, model, balloon, accessibleLabel, otherAccessibleLabel);

    // @private - used to track previous values after an interaction so that we can accurately describe how
    // the model has changed
    this.describedChargeRange = null;

    // @private (a11y) {boolean} - a flag that manages whether or not we should alert the first charge pickup of the
    // balloon, will be set to true every time the balloon enters or leaves the sweater so that in this case, we hear
    // "Balloon picks up negative charges from sweater"
    this.alertFirstPickup = false;

    // @private (a11y) {boolean} - a flag that manages how often we should announce a charge
    // pickup alert, every time interval of CHARGE_DESCRIPTION_REFRESH_RATE, this is set to true so we don't
    // alert every time the balloon picks up a charges.
    this.alertNextPickup = false;

    // @private - variables tracking state and how it changes between description steps, see step() below
    this.describedVelocity = balloon.velocityProperty.get();
    this.describedDragVelocity = balloon.dragVelocityProperty.get();
    this.describedPosition = balloon.positionProperty.get();
    this.describedVisible = balloon.isVisibleProperty.get();
    this.describedTouchingWall = balloon.touchingWallProperty.get();
    this.describedIsDragged = balloon.isDraggedProperty.get();
    this.describedWallVisible = wall.isVisibleProperty.get();
    this.describedDirection = null;
    this.describedCharge = 0;

    // @private {Utterance} - utterances to be sent to the queue, with a bit of a delay they won't spam
    // the user if they hit the queue to frequently
    const utteranceOptions = {
      alertStableDelay: 500
    };
    this.directionUtterance = new Utterance();
    this.movementUtterance = new Utterance(merge(utteranceOptions, {
      // trying to make movement alerts assertive to reduce pile up of alerts while dragging the balloon, see
      // https://github.com/phetsims/balloons-and-static-electricity/issues/491
      announcerOptions: {
        ariaLivePriority: AriaLiveAnnouncer.AriaLive.ASSERTIVE
      }
    }));
    this.inducedChargeChangeUtterance = new Utterance(utteranceOptions);
    this.noChargePickupUtterance = new Utterance(utteranceOptions);
    this.chargePickupUtterance = new Utterance(utteranceOptions);

    // @private {Utterance} utterances for specific events that let us make things assertive/polite
    this.grabReleaseUtterance = new Utterance({
      // grab/release alerts are assertive, see https://github.com/phetsims/balloons-and-static-electricity/issues/491
      announcerOptions: {
        ariaLivePriority: AriaLiveAnnouncer.AriaLive.ASSERTIVE
      }
    });

    // @private - used to determine change in position during a single drag movement, copied to avoid reference issues
    this.oldDragPosition = balloon.positionProperty.get().copy();

    // @private - monitors position delta in a single drag
    this.dragDelta = new Vector2(0, 0);

    // @private - used to watch how much charge is picked up in a single drag action
    this.chargeOnStartDrag = balloon.chargeProperty.get();

    // @private - used to determine how much charge is picked up in a single drag action
    this.chargeOnEndDrag = balloon.chargeProperty.get();

    // @private - time since an alert related to charge pickup has been announced
    this.timeSinceChargeAlert = 0;

    // @private {boolean} - every time we drag, mark this as true so we know to describe a lack of charge pick up
    // on the sweater. Once this rub has been described, set to false
    this.rubAlertDirty = false;

    // @private {boolean} - whether or not we describe direction changes. After certain interactions we do not want
    // to describe the direction, or the direction is included implicitly in another alert
    this.describeDirection = true;

    // @private {boolean} - flag that indicates that user actions have lead to it being time for a "wall rub" to be
    // described
    this.describeWallRub = false;

    // @private {boolean} - a flag that tracks if the initial movement of the balloon after release has
    // been described. Gets reset whenever the balloon is picked up, and when the wall is removed while
    // the balloon is sticking to the wall. True so we get non alert on start up
    this.initialMovementDescribed = true;

    // @private {boolean} - timer tracking amount of time between release alerts, used to space out alerts describing
    // continuous independent movement like "Moving left...Moving left...Moving left...", and so on
    this.timeSinceReleaseAlert = 0;

    // @private {boolean} - flag that will prevent the firing of the "no movement" alert, set to true with toggling
    // balloon visibility as a special case so we don't trigger this alert when added to the play area
    this.preventNoMovementAlert = false;

    // when visibility changes, generate the alert and be sure to describe initial movement the next time the
    // balloon is released or added to the play area
    balloon.isVisibleProperty.lazyLink(isVisible => {
      this.alertDescriptionUtterance(this.getVisibilityChangedDescription());
      this.initialMovementDescribed = false;
      this.preventNoMovementAlert = true;
    });

    // pdom - if we enter/leave the sweater announce that immediately
    balloon.onSweaterProperty.link(onSweater => {
      if (balloon.isDraggedProperty.get()) {
        this.alertDescriptionUtterance(this.movementDescriber.getOnSweaterString(onSweater));
      }

      // entering sweater, indicate that we need to alert the next charge pickup
      this.alertFirstPickup = true;
    });

    // @private {number} distance the balloon has moved since we last sent an alert to the utteranceQueue. After a
    // successful alert we don't send any alerts to the utterance queue until we have substantial balloon movement
    // to avoid a pile-up of alerts.
    this.distanceSinceDirectionAlert = 0;

    // @private {Vector2} the position of the balloon when we send an alert to the utteranceQueue. After a successful
    // alert, we don't alert again until there is sufficient movement to avoid a pile-up of alerts
    this.positionOnAlert = this.balloonModel.positionProperty.get();
    this.balloonModel.positionProperty.link(position => {
      this.distanceSinceDirectionAlert = position.minus(this.positionOnAlert).magnitude;
    });

    // when drag velocity starts from zero, or hits zero, update charge counts on start/end drag so we can determine
    // how much charge has been picked up in a single interaction
    this.balloonModel.dragVelocityProperty.link((velocity, oldVelocity) => {
      if (oldVelocity) {
        if (oldVelocity.equals(Vector2.ZERO)) {
          // we just started dragging
          this.chargeOnStartDrag = balloon.chargeProperty.get();
        } else if (velocity.equals(Vector2.ZERO)) {
          // we just finished a drag interaction
          this.chargeOnEndDrag = balloon.chargeProperty.get();
        }
      }
    });
  }

  /**
   * Reset the describer, resetting flags that are required to manipulate provided descriptions.
   * @public
   */
  reset() {
    this.chargeDescriber.reset();
    this.describedChargeRange = null;
    this.alertFirstPickup = false;
    this.alertNextPickup = false;

    // reset all variables tracking previous descriptions
    this.describedVelocity = this.balloonModel.velocityProperty.get();
    this.describedDragVelocity = this.balloonModel.dragVelocityProperty.get();
    this.describedPosition = this.balloonModel.positionProperty.get();
    this.describedVisible = this.balloonModel.isVisibleProperty.get();
    this.describedTouchingWall = this.balloonModel.touchingWallProperty.get();
    this.describedIsDragged = this.balloonModel.isDraggedProperty.get();
    this.describedWallVisible = this.wall.isVisibleProperty.get();
    this.describedDirection = null;
    this.describedCharge = 0;
    this.oldDragPosition = this.balloonModel.positionProperty.get().copy();
    this.dragDelta = new Vector2(0, 0);
    this.chargeOnStartDrag = this.balloonModel.chargeProperty.get();
    this.chargeOnEndDrag = this.balloonModel.chargeProperty.get();
    this.timeSinceChargeAlert = 0;
    this.rubAlertDirty = false;
    this.describeDirection = true;
    this.describeWallRub = false;
    this.initialMovementDescribed = true;
    this.timeSinceReleaseAlert = 0;
    this.preventNoMovementAlert = false;
    this.distanceSinceDirectionAlert = 0;
    this.positionOnAlert = this.balloonModel.positionProperty.get();
  }

  /**
   * Send an alert to the utteranceQueue, but save the position when we do so to track
   *
   * @public
   *
   * @param {TAlertable} alertable
   */
  sendAlert(alertable) {
    this.alertDescriptionUtterance(alertable);
    this.positionOnAlert = this.balloonModel.positionProperty.get();
  }

  /**
   * Returns true if the balloon is being dragged with a pointer, but the movement is too small to describe.
   * @private
   */
  shortMovementFromPointer() {
    return this.balloonModel.draggingWithPointer && this.distanceSinceDirectionAlert < 25;
  }

  /**
   * Get the description for the balloon, the content that can be read by an assistive device in the Parallel DOM.
   * Dependent on position, charge, and charge visibility. Will return something like:
   * "At center of play area. Has zero net charge, no more negative charge than positive charges." or
   * "At center of play area, next to green balloon."
   *
   * @public
   *
   * @returns {string}
   */
  getBalloonDescription() {
    let description;
    const showCharges = this.showChargesProperty.get();
    let attractiveStateAndPositionString = this.movementDescriber.getAttractiveStateAndPositionDescription();
    attractiveStateAndPositionString = StringUtils.fillIn(singleStatementPatternString, {
      statement: attractiveStateAndPositionString
    });
    if (showCharges === 'none') {
      description = attractiveStateAndPositionString;
    } else {
      // balloon net charge description
      const netChargeDescriptionString = this.chargeDescriber.getNetChargeDescription();

      // balloon relative charge string, dependent on charge visibility
      const relativeChargesString = BalloonChargeDescriber.getRelativeChargeDescription(this.balloonModel, showCharges);
      description = StringUtils.fillIn(balloonShowAllChargesPatternString, {
        stateAndPosition: attractiveStateAndPositionString,
        netCharge: netChargeDescriptionString,
        relativeCharge: relativeChargesString
      });
    }
    return description;
  }

  /**
   * Get the alert description for when a charge is picked up off of the sweater. Dependent
   * on charge view, whether the balloon has picked up charges already since moving on to the
   * sweater, and the number of charges that the balloon has picked up.
   *
   * @public
   *
   * @param  {boolean} firstPickup - special behavior if the first charge pickup since landing on sweater
   * @returns {string}
   */
  getChargePickupDescription(firstPickup) {
    let description;
    const shownCharges = this.showChargesProperty.get();
    const newCharge = this.balloonModel.chargeProperty.get();
    const newRange = BASEDescriber.getDescribedChargeRange(newCharge);
    if (shownCharges === 'none') {
      description = this.movementDescriber.getAttractiveStateAndPositionDescription();
      description = StringUtils.fillIn(singleStatementPatternString, {
        statement: description
      });
    } else if (firstPickup) {
      // if this is the first charge picked up after moving onto sweater, generate
      // a special description to announce that charges have been transfered
      description = this.getInitialChargePickupDescription();
    } else if (!this.describedChargeRange || !newRange.equals(this.describedChargeRange)) {
      // if we have entered a new described range since the previous charge alert,
      // we will generate a special description that mentions the relative charges
      const sweaterCharge = this.model.sweater.chargeProperty.get();

      // relative charge of balloon, as a sentance
      let relativeBalloonCharge = BalloonChargeDescriber.getRelativeChargeDescriptionWithLabel(this.balloonModel, shownCharges, this.accessibleName);
      relativeBalloonCharge = StringUtils.fillIn(singleStatementPatternString, {
        statement: relativeBalloonCharge
      });
      const relativeSweaterCharge = SweaterDescriber.getRelativeChargeDescriptionWithLabel(sweaterCharge, shownCharges);
      description = StringUtils.fillIn(balloonSweaterRelativeChargesPatternString, {
        balloon: relativeBalloonCharge,
        sweater: relativeSweaterCharge
      });
      this.describedChargeRange = BASEDescriber.getDescribedChargeRange(newCharge);
    } else {
      // in same described range of charges, describe how balloon picks up more charges
      const picksUpCharges = StringUtils.fillIn(balloonPicksUpMoreChargesPatternString, {
        balloon: this.accessibleName
      });
      if (shownCharges === 'all') {
        description = StringUtils.fillIn(singleStatementPatternString, {
          statement: picksUpCharges
        });
      } else if (shownCharges === 'diff') {
        description = StringUtils.fillIn(balloonPicksUpMoreChargesDiffPatternString, {
          pickUp: picksUpCharges
        });
      }
      this.describedChargeRange = BASEDescriber.getDescribedChargeRange(newCharge);
    }
    assert && assert(description, `no charge pickup alert generated for charge view ${shownCharges}`);
    return description;
  }

  /**
   * The first time the balloon picks up charges from the sweater after leaving the play
   * area, we get an initial alert like
   * "Yellow Balloon picks up negative charges from sweater."
   *
   * @public
   *
   * @returns {string}
   */
  getInitialChargePickupDescription() {
    let description;
    const shownCharges = this.showChargesProperty.get();
    const picksUpCharges = StringUtils.fillIn(balloonPicksUpChargesPatternString, {
      balloon: this.accessibleName
    });
    if (shownCharges === 'all') {
      description = StringUtils.fillIn(singleStatementPatternString, {
        statement: picksUpCharges
      });
    } else if (shownCharges === 'diff') {
      description = StringUtils.fillIn(balloonPicksUpChargesDiffPatternString, {
        pickUp: picksUpCharges
      });
    }
    return description;
  }

  /**
   * Get an alert that describes that no charges were picked up during the drag interaction. This alert is dependent
   * on which charges are visible. Will return a string like
   *
   * "No change in charges. On left side of sweater. More pairs of charges down and to the right." or
   * "No change in net charge. On left side of sweater. More hidden pairs of charges down and to the right." or
   * "On left side of sweater". or
   * "No change in charges. On right side of sweater. Sweater has positive net charge. Yellow Balloon has negative
   * net charge. Press space to release."
   *
   * @public
   *
   * @returns {string}
   */
  getNoChargePickupDescription() {
    let alert;
    const chargesShown = this.showChargesProperty.get();
    const balloonPositionString = this.movementDescriber.getAttractiveStateAndPositionDescription();
    const sweaterCharge = this.model.sweater.chargeProperty.get();
    if (chargesShown === 'none') {
      // if no charges are shown, just describe position of balloon as a complete sentence
      alert = StringUtils.fillIn(singleStatementPatternString, {
        statement: balloonPositionString
      });
    } else if (sweaterCharge < BASEConstants.MAX_BALLOON_CHARGE) {
      // there are still charges on the sweater
      const sweaterCharges = this.model.sweater.minusCharges;
      const moreChargesString = SweaterDescriber.getMoreChargesDescription(this.balloonModel, sweaterCharge, sweaterCharges, chargesShown);
      if (chargesShown === 'all') {
        alert = StringUtils.fillIn(noChargePickupPatternString, {
          noChange: noChangeInChargesString,
          balloonPosition: balloonPositionString,
          moreChargesPosition: moreChargesString
        });
      } else if (chargesShown === 'diff') {
        alert = StringUtils.fillIn(noChargePickupPatternString, {
          noChange: noChangeInNetChargeString,
          balloonPosition: balloonPositionString,
          moreChargesPosition: moreChargesString
        });
      }
    } else {
      // there are no more charges remaining on the sweater
      if (chargesShown === 'all') {
        const relativeSweaterCharge = SweaterDescriber.getNetChargeDescription(sweaterCharge);
        let relativeBalloonCharge = this.chargeDescriber.getNetChargeDescriptionWithLabel();
        relativeBalloonCharge = StringUtils.fillIn(singleStatementPatternString, {
          statement: relativeBalloonCharge
        });
        alert = StringUtils.fillIn(nochargePickupWithObjectChargeAndHint, {
          noChange: noChangeInChargesString,
          balloonPosition: balloonPositionString,
          sweaterCharge: relativeSweaterCharge,
          balloonCharge: relativeBalloonCharge,
          hint: releaseHintString
        });
      } else if (chargesShown === 'diff') {
        alert = StringUtils.fillIn(noChargePickupHintPatternString, {
          noChange: noChangeInNetChargeString,
          balloonPosition: balloonPositionString,
          hint: releaseHintString
        });
      }
    }
    return alert;
  }

  /**
   * Get a description of the balloon rubbing on the wall, including a description for the
   * induced charge if there is any and depending on the charge view. Will return something like
   *
   * "At wall. No transfer of charge. In wall, no change in charges." or
   * "At upper wall. No transfer of charge. Negative charges in upper wall move away from yellow balloon a lot.
   * Positive charges do not move." or
   * "At upper wall." or
   * "At lower wall. Yellow balloon has negative net charge, showing several more negative charges than positive charges."
   *
   * @public
   *
   * @returns {string}
   */
  getWallRubbingDescription() {
    let descriptionString;
    let chargeString;

    // the position string is used for all charge views, used as a single sentence
    const positionString = this.movementDescriber.getBalloonPositionDescription();
    let atPositionString = StringUtils.fillIn(balloonAtPositionPatternString, {
      position: positionString
    });
    atPositionString = StringUtils.fillIn(singleStatementPatternString, {
      statement: atPositionString
    });
    const shownCharges = this.showChargesProperty.get();
    const wallVisible = this.wall.isVisibleProperty.get();
    if (shownCharges === 'none') {
      descriptionString = atPositionString;
    } else {
      if (shownCharges === 'all') {
        let inducedChargeString;

        // if balloons are adjacent, the resultant induced charge description is modified
        if (this.model.getBalloonsAdjacent()) {
          const thisInducingAndVisible = this.balloonModel.inducingChargeAndVisible();
          const otherInducingAndVisible = this.balloonModel.other.inducingChargeAndVisible();
          if (thisInducingAndVisible && otherInducingAndVisible) {
            // if both inducing charge, combine induced charge description with "both balloons"
            inducedChargeString = WallDescriber.getCombinedInducedChargeDescription(this.balloonModel, wallVisible);
          } else if (!thisInducingAndVisible && !otherInducingAndVisible) {
            // neither balloon is inducing charge, just use normal induced charge description
            inducedChargeString = WallDescriber.getInducedChargeDescription(this.balloonModel, this.accessibleName, wallVisible);
          } else {
            assert && assert(this.balloonModel.inducingChargeAndVisible() !== this.balloonModel.other.inducingChargeAndVisible());

            // only one balloon is inducing charge, describe whichever one is currently inducing charge
            let inducingBalloon;
            let balloonLabel;
            if (this.balloonModel.inducingChargeAndVisible()) {
              inducingBalloon = this.balloonModel;
              balloonLabel = this.accessibleName;
            } else {
              inducingBalloon = this.balloonModel.other;
              balloonLabel = this.otherAccessibleName;
            }
            inducedChargeString = WallDescriber.getInducedChargeDescription(inducingBalloon, balloonLabel, wallVisible);
          }
        } else {
          inducedChargeString = WallDescriber.getInducedChargeDescription(this.balloonModel, this.accessibleName, wallVisible);
        }

        // wrap induced charge string with punctuation
        inducedChargeString = StringUtils.fillIn(singleStatementPatternString, {
          statement: inducedChargeString
        });
        chargeString = StringUtils.fillIn(wallRubAllPatternString, {
          inducedCharge: inducedChargeString
        });
      } else {
        let wallChargeString = WallDescriber.getWallChargeDescriptionWithLabel(this.model.yellowBalloon, this.model.greenBalloon, this.model.getBalloonsAdjacent(), wallVisible, shownCharges);
        let balloonChargeString = BalloonChargeDescriber.getRelativeChargeDescriptionWithLabel(this.balloonModel, shownCharges, this.accessibleName);

        // balloon charge doesn't include punctuation
        balloonChargeString = StringUtils.fillIn(singleStatementPatternString, {
          statement: balloonChargeString
        });
        wallChargeString = StringUtils.fillIn(singleStatementPatternString, {
          statement: wallChargeString
        });

        // if balloons are adjacent, the relative charge description for both balloons must be included
        if (this.model.getBalloonsAdjacent()) {
          balloonChargeString = this.chargeDescriber.getCombinedRelativeChargeDescription();
          balloonChargeString = StringUtils.fillIn(singleStatementPatternString, {
            statement: balloonChargeString
          });
          chargeString = StringUtils.fillIn(wallRubDiffPatternString, {
            balloonCharge: balloonChargeString,
            wallCharge: wallChargeString
          });
        } else {
          chargeString = StringUtils.fillIn(wallRubDiffPatternString, {
            balloonCharge: balloonChargeString,
            wallCharge: wallChargeString
          });
        }
      }

      // combine charge and position portions of the description for 'all' and 'diff' charge views
      descriptionString = StringUtils.fillIn(wallRubPatternString, {
        position: atPositionString,
        charge: chargeString
      });
    }
    return descriptionString;
  }

  /**
   * Get an alert that describes the rubbing interaction, with a reminder that the wall has many pairs of charges.
   * Will return something like:
   * "At upper wall. No transfer of charge. In upper wall, no change in charges. Wall has many pairs of negative
   * and positive charges."
   *
   * @public
   *
   * @returns {string}
   */
  getWallRubbingDescriptionWithChargePairs() {
    return StringUtils.fillIn(wallRubbingWithPairsPattern, {
      rubbingAlert: this.getWallRubbingDescription()
    });
  }

  /**
   * Get the description when the balloon has picked up the last charge on the sweater.
   * Dependent on the charge view.
   *
   * @public
   *
   * @returns {string}
   */
  getLastChargePickupDescription() {
    const shownCharges = this.showChargesProperty.get();
    const charge = this.balloonModel.chargeProperty.get();
    const sweaterChargeString = SweaterDescriber.getNoMoreChargesAlert(charge, shownCharges);
    const balloonChargeString = BalloonChargeDescriber.getRelativeChargeDescriptionWithLabel(this.balloonModel, shownCharges, this.accessibleName);
    return StringUtils.fillIn(lastChargePickedUpPatternString, {
      sweater: sweaterChargeString,
      balloon: balloonChargeString
    });
  }

  /**
   * Get a description for when a balloon is added to the play area. Will change depending on whether balloon has been
   * successfully moved and whether the two balloons are adjacent to each other. Will return something like
   * "Green balloon added to play area" or
   * "Green balloon added. Sticking to left shoulder of sweater." or
   * "Green balloon added. On left side of play area, next to yellow balloon."
   *
   * @public
   *
   * @returns {string}
   */
  getVisibilityChangedDescription() {
    let description;
    const positionProperty = this.balloonModel.positionProperty;
    const visible = this.balloonModel.isVisibleProperty.get();
    if (!visible) {
      // if removed, simply notify removal
      description = StringUtils.fillIn(balloonRemovedPatternString, {
        balloonLabel: this.accessibleName
      });
    } else {
      if (positionProperty.get().equals(positionProperty.initialValue)) {
        // if add at initial position, generic string
        description = StringUtils.fillIn(balloonAddedPatternString, {
          balloonLabel: this.accessibleName
        });
      } else {
        // if not at initial position, include attractive state and position
        description = StringUtils.fillIn(balloonAddedWithPositionPatternString, {
          balloonLabel: this.accessibleName,
          position: this.movementDescriber.getAttractiveStateAndPositionDescription()
        });
      }
    }
    return description;
  }

  /**
   * Step the describer, driving all alerts that describe interactions with the balloon and its independent
   * movement. It also describes lack of movement or interaction, which requires polling. Rather than implement
   * portions of this with polling and other portions with Property observers, it was more straight forward
   * to implement everything in this step function. The alternative distributed the implementation across several
   * functions, it is easier to manage here. The sacrifice is that we have to track values we care about before and
   * after each step.
   *
   * Adding each of these in the step function also lets us directly control the order of these alerts. This is
   * better than having Property listeners that might get called in an undesirable order.
   *
   * @public
   */
  step(dt) {
    // for readability
    let utterance = '';
    const model = this.balloonModel;

    // grab next values to describe
    const nextVelocity = model.velocityProperty.get();
    const nextDragVelocity = model.dragVelocityProperty.get();
    const nextPosition = model.positionProperty.get();
    const nextVisible = model.isVisibleProperty.get();
    const nextTouchingWall = model.touchingWallProperty.get();
    const nextIsDragged = model.isDraggedProperty.get();
    const nextWallVisible = this.wall.isVisibleProperty.get();
    const nextCharge = model.chargeProperty.get();

    // update timers that determine the next time certain alerts should be announced
    this.timeSinceChargeAlert += dt * 1000;
    if (!model.isDraggedProperty.get()) {
      this.timeSinceReleaseAlert += dt * 1000;
    }
    if (!this.shortMovementFromPointer()) {
      // alerts related to balloon direction
      if (this.describeDirection && this.balloonModel.directionProperty.get() && this.describedDirection !== this.balloonModel.directionProperty.get()) {
        if (this.balloonModel.isDraggedProperty.get() || model.timeSinceRelease > RELEASE_DESCRIPTION_TIME_DELAY) {
          this.directionUtterance.alert = this.movementDescriber.getDirectionChangedDescription();
          this.sendAlert(this.directionUtterance);
          this.describedDirection = this.balloonModel.directionProperty.get();
        }
      }

      // announce an alert that describes lack of charge pickup whil rubbing on sweater
      if (this.timeSinceChargeAlert > CHARGE_DESCRIPTION_REFRESH_RATE) {
        if (this.chargeOnStartDrag === this.chargeOnEndDrag) {
          if (this.rubAlertDirty) {
            if (nextIsDragged && model.onSweater()) {
              this.noChargePickupUtterance.alert = this.getNoChargePickupDescription();
              this.sendAlert(this.noChargePickupUtterance);
            }
          }
        }
        this.alertNextPickup = true;
        this.timeSinceChargeAlert = 0;
        this.rubAlertDirty = false;
      }
    }

    // alerts related to balloon charge
    if (this.describedCharge !== nextCharge) {
      let alert;

      // the first charge pickup and subsequent pickups (behind a refresh rate) should be announced
      if (this.alertNextPickup || this.alertFirstPickup) {
        alert = this.getChargePickupDescription(this.alertFirstPickup);
        this.chargePickupUtterance.alert = alert;
        this.sendAlert(this.chargePickupUtterance);
      }

      // announce pickup of last charge, as long as charges are visible
      if (Math.abs(nextCharge) === BASEConstants.MAX_BALLOON_CHARGE && this.showChargesProperty.get() !== 'none') {
        alert = this.getLastChargePickupDescription();
        this.chargePickupUtterance.alert = alert;
        this.sendAlert(this.chargePickupUtterance);
      }

      // reset flags
      this.alertFirstPickup = false;
      this.alertNextPickup = false;
    }

    // alerts that might stem from changes to balloon velocity (independent movement)
    if (!nextVelocity.equals(this.describedVelocity)) {
      if (nextVelocity.equals(Vector2.ZERO)) {
        if (model.isDraggedProperty.get()) {
          if (model.onSweater() || model.touchingWall()) {
            // while dragging, just attractive state and position
            this.sendAlert(this.movementDescriber.getAttractiveStateAndPositionDescriptionWithLabel());
          }
        } else if (model.onSweater()) {
          // if we stop on the sweater, announce that we are sticking to it
          this.sendAlert(this.movementDescriber.getAttractiveStateAndPositionDescriptionWithLabel());
        } else {
          // if we stop along anywhere else in the play area, describe that movement has stopped
          // special case: if the balloon is touching the wall for the first time, don't describe this because
          // the section of this function observing that state will describe this
          if (nextTouchingWall === this.describedTouchingWall) {
            this.sendAlert(this.movementDescriber.getMovementStopsDescription());
          }
        }
      }
    }

    // alerts that might come from changes to balloon drag velocity
    if (!nextDragVelocity.equals(this.describedDragVelocity)) {
      // if we start from zero, we are initiating a drag - update the charge on start for this case and start
      // describing wall rubs
      if (this.describedDragVelocity.equals(Vector2.ZERO)) {
        this.describeWallRub = true;
      }

      // if the drag velocity is zero, describe how the position has changed since the last drag - this is preferable
      // to alerting every position because 1) it reduces the number of alerts that occur and 2) it waits until
      // a user has finished interacting to make an announcement, and AT produce garbled/interrupted output if
      // user makes an interaction while a new alert is being announced
      if (model.isDraggedProperty.get() && nextDragVelocity.equals(Vector2.ZERO) && !this.shortMovementFromPointer()) {
        // ignore changes that occur while the user is "jumping" the balloon (using hotkeys to snap to a new position)
        if (!model.jumping) {
          // how much balloon has moved in a single drag
          const dragDelta = nextPosition.minus(this.oldDragPosition);

          // when we complete a keyboard drag, set timer to refresh rate so that we trigger a new description next
          // time we move the balloon
          this.timeSinceChargeAlert = CHARGE_DESCRIPTION_REFRESH_RATE;

          // if in the play area, information about movement through the play area
          const inLandmark = PlayAreaMap.inLandmarkColumn(model.getCenter());
          const onSweater = model.onSweater();
          const touchingWall = model.touchingWall();
          if (!inLandmark && !onSweater && !touchingWall) {
            utterance = this.movementDescriber.getKeyboardMovementAlert();
          } else if (inLandmark) {
            // just announce landmark as we move through it
            utterance = this.movementDescriber.getLandmarkDragDescription();
          } else if (model.touchingWall() && this.describeWallRub) {
            utterance = this.getWallRubbingDescription();
          }
          if (utterance) {
            // assign an id so that we only announce the most recent alert in the utteranceQueue
            this.movementUtterance.alert = utterance;
            this.sendAlert(this.movementUtterance);
          }

          // describe the change in induced charge due to balloon dragging
          if (this.chargeDescriber.describeInducedChargeChange()) {
            utterance = '';
            const wallVisible = this.wall.isVisibleProperty.get();
            assert && assert(this.balloonModel.isCharged(), 'balloon should be charged to describe induced charge');

            // if there is purely vertical motion, do not include information about amount of charge displacement
            if (dragDelta.x === 0) {
              utterance = WallDescriber.getInducedChargeDescriptionWithNoAmount(model, this.accessibleName, wallVisible);
            } else {
              utterance = this.chargeDescriber.getInducedChargeChangeDescription();
            }
            this.inducedChargeChangeUtterance.alert = utterance;
            this.sendAlert(this.inducedChargeChangeUtterance);
          }

          // update flags that indicate which alerts should come next
          this.rubAlertDirty = true;
        }

        // if velocity has just become zero after a jump, we just completed a jumping interaction
        if (model.jumping) {
          model.jumping = false;
        }

        // update the old dragging position for next time, copy so we can compare by value
        this.oldDragPosition = nextPosition.copy();
      }
    }

    // describe any updates that might come from the balloon touches or leaves the wall - don't describe if we are
    // currently touching the balloon since the jump will generate a unique alert
    if (this.describedTouchingWall !== nextTouchingWall) {
      if (!model.jumping) {
        if (nextTouchingWall) {
          if (model.isDraggedProperty.get() && this.showChargesProperty.get() === 'all') {
            this.sendAlert(this.getWallRubbingDescriptionWithChargePairs());
            this.describeWallRub = false;
          } else {
            // generates a description of how the balloon interacts with the wall
            if (nextVisible) {
              this.sendAlert(this.movementDescriber.getMovementStopsDescription());
            }
          }
        }
      }
    }

    // any alerts that might be generated when the balloon is picked up and released
    if (this.describedIsDragged !== nextIsDragged) {
      utterance = '';
      if (nextIsDragged) {
        utterance = this.movementDescriber.getGrabbedAlert();
        this.grabReleaseUtterance.alert = utterance;
        this.sendAlert(this.grabReleaseUtterance);

        // we have been picked up successfully, start describing direction
        this.describeDirection = true;
      } else {
        // don't describe direction until initial release description happens
        this.describeDirection = false;
      }

      // reset flags that track description content
      this.initialMovementDescribed = false;
    }

    // any balloon specific alerts that might come from changes to wall visibility
    if (this.describedWallVisible !== nextWallVisible) {
      // if the wall is removed while a balloon is touching the wall, we will need to describe how the balloon
      // responds, just like a release
      if (!nextWallVisible && this.describedTouchingWall) {
        this.initialMovementDescribed = false;
      }
    }

    // any changes to position from independent balloon movement (not dragging)
    if (nextVisible && !nextIsDragged) {
      utterance = '';
      if (!this.initialMovementDescribed) {
        if (model.timeSinceRelease > RELEASE_DESCRIPTION_TIME_DELAY) {
          this.initialMovementDescribed = true;

          // get the initial alert describing balloon release
          if (!nextVelocity.equals(Vector2.ZERO)) {
            utterance = this.movementDescriber.getInitialReleaseDescription();
            this.sendAlert(utterance);
            this.describedDirection = this.balloonModel.directionProperty.get();

            // after describing initial movement, continue to describe direction changes
            this.describeDirection = true;
          } else if (nextVelocity.equals(Vector2.ZERO)) {
            // describe that the balloon was released and there was no resulting movement - but don't describe this
            // when the balloon is first added to the play area
            if (!this.preventNoMovementAlert) {
              utterance = this.movementDescriber.getNoChangeReleaseDescription();
              this.sendAlert(utterance);
            }
            this.preventNoMovementAlert = false;
          }

          // reset timer for release alert
          this.timeSinceReleaseAlert = 0;
        }
      } else if (this.timeSinceReleaseAlert > RELEASE_DESCRIPTION_REFRESH_RATE) {
        // if the balloon is moving slowly, alert a continuous movement description
        if (this.movementDescriber.balloonMovingAtContinuousDescriptionVelocity()) {
          utterance = this.movementDescriber.getContinuousReleaseDescription();
          this.sendAlert(utterance);

          // reset timer
          this.timeSinceReleaseAlert = 0;
        }
      }
    }

    // update variables for next step
    this.describedVelocity = nextVelocity;
    this.describedDragVelocity = nextDragVelocity;
    this.describedPosition = nextPosition;
    this.describedVisible = nextVisible;
    this.describedTouchingWall = nextTouchingWall;
    this.describedIsDragged = nextIsDragged;
    this.describedWallVisible = nextWallVisible;
    this.describedCharge = nextCharge;
  }
}
balloonsAndStaticElectricity.register('BalloonDescriber', BalloonDescriber);
export default BalloonDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIkFsZXJ0ZXIiLCJBcmlhTGl2ZUFubm91bmNlciIsIlV0dGVyYW5jZSIsImJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkiLCJCQVNFQTExeVN0cmluZ3MiLCJCQVNFQ29uc3RhbnRzIiwiUGxheUFyZWFNYXAiLCJCYWxsb29uQ2hhcmdlRGVzY3JpYmVyIiwiQmFsbG9vblBvc2l0aW9uRGVzY3JpYmVyIiwiQkFTRURlc2NyaWJlciIsIlN3ZWF0ZXJEZXNjcmliZXIiLCJXYWxsRGVzY3JpYmVyIiwiYmFsbG9vblNob3dBbGxDaGFyZ2VzUGF0dGVyblN0cmluZyIsImJhbGxvb25TaG93QWxsQ2hhcmdlc1BhdHRlcm4iLCJ2YWx1ZSIsImJhbGxvb25BdFBvc2l0aW9uUGF0dGVyblN0cmluZyIsImJhbGxvb25BdFBvc2l0aW9uUGF0dGVybiIsInNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmciLCJzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuIiwiYmFsbG9vblBpY2tzVXBDaGFyZ2VzUGF0dGVyblN0cmluZyIsImJhbGxvb25QaWNrc1VwQ2hhcmdlc1BhdHRlcm4iLCJiYWxsb29uUGlja3NVcE1vcmVDaGFyZ2VzUGF0dGVyblN0cmluZyIsImJhbGxvb25QaWNrc1VwTW9yZUNoYXJnZXNQYXR0ZXJuIiwiYmFsbG9vblBpY2tzVXBDaGFyZ2VzRGlmZlBhdHRlcm5TdHJpbmciLCJiYWxsb29uUGlja3NVcENoYXJnZXNEaWZmUGF0dGVybiIsImJhbGxvb25QaWNrc1VwTW9yZUNoYXJnZXNEaWZmUGF0dGVyblN0cmluZyIsImJhbGxvb25QaWNrc1VwTW9yZUNoYXJnZXNEaWZmUGF0dGVybiIsImJhbGxvb25Td2VhdGVyUmVsYXRpdmVDaGFyZ2VzUGF0dGVyblN0cmluZyIsImJhbGxvb25Td2VhdGVyUmVsYXRpdmVDaGFyZ2VzUGF0dGVybiIsImxhc3RDaGFyZ2VQaWNrZWRVcFBhdHRlcm5TdHJpbmciLCJsYXN0Q2hhcmdlUGlja2VkVXBQYXR0ZXJuIiwibm9DaGFyZ2VQaWNrdXBQYXR0ZXJuU3RyaW5nIiwibm9DaGFyZ2VQaWNrdXBQYXR0ZXJuIiwibm9DaGFuZ2VJbkNoYXJnZXNTdHJpbmciLCJub0NoYW5nZUluQ2hhcmdlcyIsIm5vQ2hhbmdlSW5OZXRDaGFyZ2VTdHJpbmciLCJub0NoYW5nZUluTmV0Q2hhcmdlIiwibm9DaGFyZ2VQaWNrdXBIaW50UGF0dGVyblN0cmluZyIsIm5vQ2hhcmdlUGlja3VwSGludFBhdHRlcm4iLCJub2NoYXJnZVBpY2t1cFdpdGhPYmplY3RDaGFyZ2VBbmRIaW50IiwicmVsZWFzZUhpbnRTdHJpbmciLCJyZWxlYXNlSGludCIsImJhbGxvb25BZGRlZFBhdHRlcm5TdHJpbmciLCJiYWxsb29uQWRkZWRQYXR0ZXJuIiwiYmFsbG9vblJlbW92ZWRQYXR0ZXJuU3RyaW5nIiwiYmFsbG9vblJlbW92ZWRQYXR0ZXJuIiwiYmFsbG9vbkFkZGVkV2l0aFBvc2l0aW9uUGF0dGVyblN0cmluZyIsImJhbGxvb25BZGRlZFdpdGhQb3NpdGlvblBhdHRlcm4iLCJ3YWxsUnViYmluZ1dpdGhQYWlyc1BhdHRlcm4iLCJ3YWxsUnViUGF0dGVyblN0cmluZyIsIndhbGxSdWJQYXR0ZXJuIiwid2FsbFJ1YkFsbFBhdHRlcm5TdHJpbmciLCJ3YWxsUnViQWxsUGF0dGVybiIsIndhbGxSdWJEaWZmUGF0dGVyblN0cmluZyIsIndhbGxSdWJEaWZmUGF0dGVybiIsIlJFTEVBU0VfREVTQ1JJUFRJT05fVElNRV9ERUxBWSIsIkNIQVJHRV9ERVNDUklQVElPTl9SRUZSRVNIX1JBVEUiLCJSRUxFQVNFX0RFU0NSSVBUSU9OX1JFRlJFU0hfUkFURSIsIkJhbGxvb25EZXNjcmliZXIiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwid2FsbCIsImJhbGxvb24iLCJhY2Nlc3NpYmxlTGFiZWwiLCJvdGhlckFjY2Vzc2libGVMYWJlbCIsIm5vZGVUb0FsZXJ0V2l0aCIsImRlc2NyaXB0aW9uQWxlcnROb2RlIiwiYmFsbG9vbk1vZGVsIiwiYWNjZXNzaWJsZU5hbWUiLCJvdGhlckFjY2Vzc2libGVOYW1lIiwic2hvd0NoYXJnZXNQcm9wZXJ0eSIsImNoYXJnZURlc2NyaWJlciIsIm1vdmVtZW50RGVzY3JpYmVyIiwiZGVzY3JpYmVkQ2hhcmdlUmFuZ2UiLCJhbGVydEZpcnN0UGlja3VwIiwiYWxlcnROZXh0UGlja3VwIiwiZGVzY3JpYmVkVmVsb2NpdHkiLCJ2ZWxvY2l0eVByb3BlcnR5IiwiZ2V0IiwiZGVzY3JpYmVkRHJhZ1ZlbG9jaXR5IiwiZHJhZ1ZlbG9jaXR5UHJvcGVydHkiLCJkZXNjcmliZWRQb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJkZXNjcmliZWRWaXNpYmxlIiwiaXNWaXNpYmxlUHJvcGVydHkiLCJkZXNjcmliZWRUb3VjaGluZ1dhbGwiLCJ0b3VjaGluZ1dhbGxQcm9wZXJ0eSIsImRlc2NyaWJlZElzRHJhZ2dlZCIsImlzRHJhZ2dlZFByb3BlcnR5IiwiZGVzY3JpYmVkV2FsbFZpc2libGUiLCJkZXNjcmliZWREaXJlY3Rpb24iLCJkZXNjcmliZWRDaGFyZ2UiLCJ1dHRlcmFuY2VPcHRpb25zIiwiYWxlcnRTdGFibGVEZWxheSIsImRpcmVjdGlvblV0dGVyYW5jZSIsIm1vdmVtZW50VXR0ZXJhbmNlIiwiYW5ub3VuY2VyT3B0aW9ucyIsImFyaWFMaXZlUHJpb3JpdHkiLCJBcmlhTGl2ZSIsIkFTU0VSVElWRSIsImluZHVjZWRDaGFyZ2VDaGFuZ2VVdHRlcmFuY2UiLCJub0NoYXJnZVBpY2t1cFV0dGVyYW5jZSIsImNoYXJnZVBpY2t1cFV0dGVyYW5jZSIsImdyYWJSZWxlYXNlVXR0ZXJhbmNlIiwib2xkRHJhZ1Bvc2l0aW9uIiwiY29weSIsImRyYWdEZWx0YSIsImNoYXJnZU9uU3RhcnREcmFnIiwiY2hhcmdlUHJvcGVydHkiLCJjaGFyZ2VPbkVuZERyYWciLCJ0aW1lU2luY2VDaGFyZ2VBbGVydCIsInJ1YkFsZXJ0RGlydHkiLCJkZXNjcmliZURpcmVjdGlvbiIsImRlc2NyaWJlV2FsbFJ1YiIsImluaXRpYWxNb3ZlbWVudERlc2NyaWJlZCIsInRpbWVTaW5jZVJlbGVhc2VBbGVydCIsInByZXZlbnROb01vdmVtZW50QWxlcnQiLCJsYXp5TGluayIsImlzVmlzaWJsZSIsImFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UiLCJnZXRWaXNpYmlsaXR5Q2hhbmdlZERlc2NyaXB0aW9uIiwib25Td2VhdGVyUHJvcGVydHkiLCJsaW5rIiwib25Td2VhdGVyIiwiZ2V0T25Td2VhdGVyU3RyaW5nIiwiZGlzdGFuY2VTaW5jZURpcmVjdGlvbkFsZXJ0IiwicG9zaXRpb25PbkFsZXJ0IiwicG9zaXRpb24iLCJtaW51cyIsIm1hZ25pdHVkZSIsInZlbG9jaXR5Iiwib2xkVmVsb2NpdHkiLCJlcXVhbHMiLCJaRVJPIiwicmVzZXQiLCJzZW5kQWxlcnQiLCJhbGVydGFibGUiLCJzaG9ydE1vdmVtZW50RnJvbVBvaW50ZXIiLCJkcmFnZ2luZ1dpdGhQb2ludGVyIiwiZ2V0QmFsbG9vbkRlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb24iLCJzaG93Q2hhcmdlcyIsImF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uU3RyaW5nIiwiZ2V0QXR0cmFjdGl2ZVN0YXRlQW5kUG9zaXRpb25EZXNjcmlwdGlvbiIsImZpbGxJbiIsInN0YXRlbWVudCIsIm5ldENoYXJnZURlc2NyaXB0aW9uU3RyaW5nIiwiZ2V0TmV0Q2hhcmdlRGVzY3JpcHRpb24iLCJyZWxhdGl2ZUNoYXJnZXNTdHJpbmciLCJnZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uIiwic3RhdGVBbmRQb3NpdGlvbiIsIm5ldENoYXJnZSIsInJlbGF0aXZlQ2hhcmdlIiwiZ2V0Q2hhcmdlUGlja3VwRGVzY3JpcHRpb24iLCJmaXJzdFBpY2t1cCIsInNob3duQ2hhcmdlcyIsIm5ld0NoYXJnZSIsIm5ld1JhbmdlIiwiZ2V0RGVzY3JpYmVkQ2hhcmdlUmFuZ2UiLCJnZXRJbml0aWFsQ2hhcmdlUGlja3VwRGVzY3JpcHRpb24iLCJzd2VhdGVyQ2hhcmdlIiwic3dlYXRlciIsInJlbGF0aXZlQmFsbG9vbkNoYXJnZSIsImdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwiLCJyZWxhdGl2ZVN3ZWF0ZXJDaGFyZ2UiLCJwaWNrc1VwQ2hhcmdlcyIsInBpY2tVcCIsImFzc2VydCIsImdldE5vQ2hhcmdlUGlja3VwRGVzY3JpcHRpb24iLCJhbGVydCIsImNoYXJnZXNTaG93biIsImJhbGxvb25Qb3NpdGlvblN0cmluZyIsIk1BWF9CQUxMT09OX0NIQVJHRSIsInN3ZWF0ZXJDaGFyZ2VzIiwibWludXNDaGFyZ2VzIiwibW9yZUNoYXJnZXNTdHJpbmciLCJnZXRNb3JlQ2hhcmdlc0Rlc2NyaXB0aW9uIiwibm9DaGFuZ2UiLCJiYWxsb29uUG9zaXRpb24iLCJtb3JlQ2hhcmdlc1Bvc2l0aW9uIiwiZ2V0TmV0Q2hhcmdlRGVzY3JpcHRpb25XaXRoTGFiZWwiLCJiYWxsb29uQ2hhcmdlIiwiaGludCIsImdldFdhbGxSdWJiaW5nRGVzY3JpcHRpb24iLCJkZXNjcmlwdGlvblN0cmluZyIsImNoYXJnZVN0cmluZyIsInBvc2l0aW9uU3RyaW5nIiwiZ2V0QmFsbG9vblBvc2l0aW9uRGVzY3JpcHRpb24iLCJhdFBvc2l0aW9uU3RyaW5nIiwid2FsbFZpc2libGUiLCJpbmR1Y2VkQ2hhcmdlU3RyaW5nIiwiZ2V0QmFsbG9vbnNBZGphY2VudCIsInRoaXNJbmR1Y2luZ0FuZFZpc2libGUiLCJpbmR1Y2luZ0NoYXJnZUFuZFZpc2libGUiLCJvdGhlckluZHVjaW5nQW5kVmlzaWJsZSIsIm90aGVyIiwiZ2V0Q29tYmluZWRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24iLCJnZXRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24iLCJpbmR1Y2luZ0JhbGxvb24iLCJiYWxsb29uTGFiZWwiLCJpbmR1Y2VkQ2hhcmdlIiwid2FsbENoYXJnZVN0cmluZyIsImdldFdhbGxDaGFyZ2VEZXNjcmlwdGlvbldpdGhMYWJlbCIsInllbGxvd0JhbGxvb24iLCJncmVlbkJhbGxvb24iLCJiYWxsb29uQ2hhcmdlU3RyaW5nIiwiZ2V0Q29tYmluZWRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uIiwid2FsbENoYXJnZSIsImNoYXJnZSIsImdldFdhbGxSdWJiaW5nRGVzY3JpcHRpb25XaXRoQ2hhcmdlUGFpcnMiLCJydWJiaW5nQWxlcnQiLCJnZXRMYXN0Q2hhcmdlUGlja3VwRGVzY3JpcHRpb24iLCJzd2VhdGVyQ2hhcmdlU3RyaW5nIiwiZ2V0Tm9Nb3JlQ2hhcmdlc0FsZXJ0IiwidmlzaWJsZSIsImluaXRpYWxWYWx1ZSIsInN0ZXAiLCJkdCIsInV0dGVyYW5jZSIsIm5leHRWZWxvY2l0eSIsIm5leHREcmFnVmVsb2NpdHkiLCJuZXh0UG9zaXRpb24iLCJuZXh0VmlzaWJsZSIsIm5leHRUb3VjaGluZ1dhbGwiLCJuZXh0SXNEcmFnZ2VkIiwibmV4dFdhbGxWaXNpYmxlIiwibmV4dENoYXJnZSIsImRpcmVjdGlvblByb3BlcnR5IiwidGltZVNpbmNlUmVsZWFzZSIsImdldERpcmVjdGlvbkNoYW5nZWREZXNjcmlwdGlvbiIsIk1hdGgiLCJhYnMiLCJ0b3VjaGluZ1dhbGwiLCJnZXRBdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uV2l0aExhYmVsIiwiZ2V0TW92ZW1lbnRTdG9wc0Rlc2NyaXB0aW9uIiwianVtcGluZyIsImluTGFuZG1hcmsiLCJpbkxhbmRtYXJrQ29sdW1uIiwiZ2V0Q2VudGVyIiwiZ2V0S2V5Ym9hcmRNb3ZlbWVudEFsZXJ0IiwiZ2V0TGFuZG1hcmtEcmFnRGVzY3JpcHRpb24iLCJkZXNjcmliZUluZHVjZWRDaGFyZ2VDaGFuZ2UiLCJpc0NoYXJnZWQiLCJ4IiwiZ2V0SW5kdWNlZENoYXJnZURlc2NyaXB0aW9uV2l0aE5vQW1vdW50IiwiZ2V0SW5kdWNlZENoYXJnZUNoYW5nZURlc2NyaXB0aW9uIiwiZ2V0R3JhYmJlZEFsZXJ0IiwiZ2V0SW5pdGlhbFJlbGVhc2VEZXNjcmlwdGlvbiIsImdldE5vQ2hhbmdlUmVsZWFzZURlc2NyaXB0aW9uIiwiYmFsbG9vbk1vdmluZ0F0Q29udGludW91c0Rlc2NyaXB0aW9uVmVsb2NpdHkiLCJnZXRDb250aW51b3VzUmVsZWFzZURlc2NyaXB0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYWxsb29uRGVzY3JpYmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1hbmFnZXMgYWNjZXNzaWJpbGl0eSBkZXNjcmlwdGlvbnMgZm9yIGEgYmFsbG9vbiBpbiB0aGlzIHNpbXVsYXRpb24uIElzIHJlc3BvbnNpYmxlIGZvciBmdW5jdGlvbnMgdGhhdFxyXG4gKiBnZW5lcmF0ZSBkZXNjcmlwdGlvbnMsIGFzIHdlbGwgYXMgYWRkaW5nIHVwZGF0aW5nIGRlc2NyaXB0aXZlIGNvbnRlbnQgYW5kIGFubm91bmNpbmcgYWxlcnRzIHdoZW4gbW9kZWwgUHJvcGVydGllc1xyXG4gKiBjaGFuZ2UuXHJcbiAqXHJcbiAqIFNvbWUgYWxlcnRzIHJlcXVpcmUgcG9sbGluZyBiZWNhdXNlIHRoZXkgaGF2ZSB0byBiZSBhbm5vdW5jZWQgYWZ0ZXIgYSBsYWNrIG9mIHByb3BlcnR5IGNoYW5nZSBhZnRlciBzb21lIGludGVyYWN0aW9uLlxyXG4gKiBGb3IgaW5zdGFuY2UsIGFmdGVyIGEgYmFsbG9vbiBpcyByZWxlYXNlZCwgaWYgaXQgZG9lc24ndCBtb3ZlIGR1ZSB0byBhbiBhcHBsaWVkIGZvcmNlIHdlIG5lZWQgdG8gYWxlcnQgdGhhdCB0aGVyZVxyXG4gKiB3YXMgbm8gbW92ZW1lbnQuIFNvIEJhbGxvb25EZWNyaWJlciBtYW5hZ2VzIHRoZSBiZWZvcmUvYWZ0ZXIgdmFsdWVzIG5lY2Vzc2FyeSB0byBhY2NvbXBsaXNoIHRoaXMuIFByb3BlcnR5IG9ic2VydmVyc1xyXG4gKiBhcmUgdXNlZCB3aGVyZSBwb3NzaWJsZSwgYnV0IGZvciBhbGVydHMgdGhhdCBuZWVkIHRvIGJlIHRpbWVkIGFyb3VuZCB0aG9zZSB0aGF0IHVzZSBwb2xsaW5nLCBpdCBpcyBtb3JlXHJcbiAqIHN0cmFpZ2h0IGZvcndhcmQgdG8gaGF2ZSB0aG9zZSB1c2UgcG9sbGluZyBhcyB3ZWxsLlxyXG4gKlxyXG4gKiBUaGlzIGZpbGUgaXMgcXVpdGUgbGFyZ2UuIEl0IGRpc3RyaWJ1dGVzIHNvbWUgbG9naWMgaW50byBhZGRpdGlvbmFsIGZpbGVzIChCYWxsb29uUG9zaXRpb25EZXNjcmliZXIsXHJcbiAqIEJhbGxvb25DaGFyZ2VEZXNjcmliZXIpIHRoYXQgZGVzY3JpYmUgcGFydGljdWxhciBhc3BlY3RzIG9mIGEgYmFsbG9vbi4gRnVydGhlciBhYnN0cmFjdGlvbiBkb2Vzbid0IGZlZWwgaGVscGZ1bFxyXG4gKiBhcyBpdCBhbGwgcGVydGFpbnMgdG8gZ2VuZXJhbCBiYWxsb29uIGRlc2NyaXB0aW9uLCBzbyBJIGRlY2lkZWQgdG8ga2VlcCB0aGUgcmVtYWluaW5nIGZ1bmN0aW9ucyBpbiB0aGlzIGZpbGUgZm9yXHJcbiAqIGVhc3kgZGlzY292ZXJhYmlsaXR5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQWxlcnRlciBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9kZXNjcmliZXJzL0FsZXJ0ZXIuanMnO1xyXG5pbXBvcnQgQXJpYUxpdmVBbm5vdW5jZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL0FyaWFMaXZlQW5ub3VuY2VyLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IGJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkgZnJvbSAnLi4vLi4vLi4vYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5qcyc7XHJcbmltcG9ydCBCQVNFQTExeVN0cmluZ3MgZnJvbSAnLi4vLi4vQkFTRUExMXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJBU0VDb25zdGFudHMgZnJvbSAnLi4vLi4vQkFTRUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQbGF5QXJlYU1hcCBmcm9tICcuLi8uLi9tb2RlbC9QbGF5QXJlYU1hcC5qcyc7XHJcbmltcG9ydCBCYWxsb29uQ2hhcmdlRGVzY3JpYmVyIGZyb20gJy4vQmFsbG9vbkNoYXJnZURlc2NyaWJlci5qcyc7XHJcbmltcG9ydCBCYWxsb29uUG9zaXRpb25EZXNjcmliZXIgZnJvbSAnLi9CYWxsb29uUG9zaXRpb25EZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgQkFTRURlc2NyaWJlciBmcm9tICcuL0JBU0VEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgU3dlYXRlckRlc2NyaWJlciBmcm9tICcuL1N3ZWF0ZXJEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgV2FsbERlc2NyaWJlciBmcm9tICcuL1dhbGxEZXNjcmliZXIuanMnO1xyXG5cclxuY29uc3QgYmFsbG9vblNob3dBbGxDaGFyZ2VzUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uU2hvd0FsbENoYXJnZXNQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uQXRQb3NpdGlvblBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vbkF0UG9zaXRpb25QYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLnNpbmdsZVN0YXRlbWVudFBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGJhbGxvb25QaWNrc1VwQ2hhcmdlc1BhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblBpY2tzVXBDaGFyZ2VzUGF0dGVybi52YWx1ZTtcclxuY29uc3QgYmFsbG9vblBpY2tzVXBNb3JlQ2hhcmdlc1BhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblBpY2tzVXBNb3JlQ2hhcmdlc1BhdHRlcm4udmFsdWU7XHJcbmNvbnN0IGJhbGxvb25QaWNrc1VwQ2hhcmdlc0RpZmZQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25QaWNrc1VwQ2hhcmdlc0RpZmZQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uUGlja3NVcE1vcmVDaGFyZ2VzRGlmZlBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblBpY2tzVXBNb3JlQ2hhcmdlc0RpZmZQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uU3dlYXRlclJlbGF0aXZlQ2hhcmdlc1BhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblN3ZWF0ZXJSZWxhdGl2ZUNoYXJnZXNQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBsYXN0Q2hhcmdlUGlja2VkVXBQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmxhc3RDaGFyZ2VQaWNrZWRVcFBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IG5vQ2hhcmdlUGlja3VwUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5ub0NoYXJnZVBpY2t1cFBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IG5vQ2hhbmdlSW5DaGFyZ2VzU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLm5vQ2hhbmdlSW5DaGFyZ2VzLnZhbHVlO1xyXG5jb25zdCBub0NoYW5nZUluTmV0Q2hhcmdlU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLm5vQ2hhbmdlSW5OZXRDaGFyZ2UudmFsdWU7XHJcbmNvbnN0IG5vQ2hhcmdlUGlja3VwSGludFBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Mubm9DaGFyZ2VQaWNrdXBIaW50UGF0dGVybi52YWx1ZTtcclxuY29uc3Qgbm9jaGFyZ2VQaWNrdXBXaXRoT2JqZWN0Q2hhcmdlQW5kSGludCA9IEJBU0VBMTF5U3RyaW5ncy5ub2NoYXJnZVBpY2t1cFdpdGhPYmplY3RDaGFyZ2VBbmRIaW50LnZhbHVlO1xyXG5jb25zdCByZWxlYXNlSGludFN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5yZWxlYXNlSGludC52YWx1ZTtcclxuY29uc3QgYmFsbG9vbkFkZGVkUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy5iYWxsb29uQWRkZWRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uUmVtb3ZlZFBhdHRlcm5TdHJpbmcgPSBCQVNFQTExeVN0cmluZ3MuYmFsbG9vblJlbW92ZWRQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCBiYWxsb29uQWRkZWRXaXRoUG9zaXRpb25QYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLmJhbGxvb25BZGRlZFdpdGhQb3NpdGlvblBhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHdhbGxSdWJiaW5nV2l0aFBhaXJzUGF0dGVybiA9IEJBU0VBMTF5U3RyaW5ncy53YWxsUnViYmluZ1dpdGhQYWlyc1BhdHRlcm4udmFsdWU7XHJcbmNvbnN0IHdhbGxSdWJQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLndhbGxSdWJQYXR0ZXJuLnZhbHVlO1xyXG5jb25zdCB3YWxsUnViQWxsUGF0dGVyblN0cmluZyA9IEJBU0VBMTF5U3RyaW5ncy53YWxsUnViQWxsUGF0dGVybi52YWx1ZTtcclxuY29uc3Qgd2FsbFJ1YkRpZmZQYXR0ZXJuU3RyaW5nID0gQkFTRUExMXlTdHJpbmdzLndhbGxSdWJEaWZmUGF0dGVybi52YWx1ZTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBpbiBtcywgZGVsYXkgYmVmb3JlIGFubm91bmNpbmcgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgaW5kZXBlbmRlbnQgbW92ZW1lbnQsIHRvIGdpdmUgdGhlIG1vZGVsIHRpbWUgdG8gcmVzcG9uZFxyXG5jb25zdCBSRUxFQVNFX0RFU0NSSVBUSU9OX1RJTUVfREVMQVkgPSA1MDtcclxuXHJcbi8vIGluIG1zLCBsaW1pdHMgZnJlcXVlbmN5IG9mIGNoYXJnZSBwaWNrdXAgYWxlcnRzXHJcbmNvbnN0IENIQVJHRV9ERVNDUklQVElPTl9SRUZSRVNIX1JBVEUgPSAyMDAwO1xyXG5cclxuLy8gaW4gbXMsIHRpbWUgYmV0d2VlbiBhbGVydHMgdGhhdCB0ZWxsIHVzZXIgYmFsbG9vbiBjb250aW51ZXMgdG8gbW92ZSBkdWUgdG8gZm9yY2VcclxuY29uc3QgUkVMRUFTRV9ERVNDUklQVElPTl9SRUZSRVNIX1JBVEUgPSA1MDAwO1xyXG5cclxuY2xhc3MgQmFsbG9vbkRlc2NyaWJlciBleHRlbmRzIEFsZXJ0ZXIge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QkFTRU1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7V2FsbE1vZGVsfSB3YWxsXHJcbiAgICogQHBhcmFtIHtCYWxsb29uTW9kZWx9IGJhbGxvb25cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWNjZXNzaWJsZUxhYmVsIC0gYWNjZXNzaWJsZSBuYW1lIGZvciB0aGUgYmFsbG9vbiBiZWluZyBkZXNjcmliZWRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3RoZXJBY2Nlc3NpYmxlTGFiZWwgLSBhY2Nlc3NpYmxlIG5hbWUgZm9yIHRoZSBvdGhlciBiYWxsb29uIGJlaW5nIGRlc2NyaWJlZFxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVRvQWxlcnRXaXRoIC0gbmVlZCBhIGNvbm5lY3RlZCBOb2RlIHRvIGFsZXJ0IHRvIGEgZGVzY3JpcHRpb24gVXR0ZXJhbmNlUXVldWVcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHdhbGwsIGJhbGxvb24sIGFjY2Vzc2libGVMYWJlbCwgb3RoZXJBY2Nlc3NpYmxlTGFiZWwsIG5vZGVUb0FsZXJ0V2l0aCApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBkZXNjcmlwdGlvbkFsZXJ0Tm9kZTogbm9kZVRvQWxlcnRXaXRoXHJcbiAgICB9ICk7XHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG4gICAgdGhpcy53YWxsID0gd2FsbDtcclxuICAgIHRoaXMuYmFsbG9vbk1vZGVsID0gYmFsbG9vbjtcclxuICAgIHRoaXMuYWNjZXNzaWJsZU5hbWUgPSBhY2Nlc3NpYmxlTGFiZWw7XHJcbiAgICB0aGlzLm90aGVyQWNjZXNzaWJsZU5hbWUgPSBvdGhlckFjY2Vzc2libGVMYWJlbDtcclxuICAgIHRoaXMuc2hvd0NoYXJnZXNQcm9wZXJ0eSA9IG1vZGVsLnNob3dDaGFyZ2VzUHJvcGVydHk7XHJcbiAgICB0aGlzLm5vZGVUb0FsZXJ0V2l0aCA9IG5vZGVUb0FsZXJ0V2l0aDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIG1hbmFnZXMgZGVzY3JpcHRpb25zIGFib3V0IHRoZSBiYWxsb29uIHJlbGF0ZWQgdG8gY2hhcmdlXHJcbiAgICB0aGlzLmNoYXJnZURlc2NyaWJlciA9IG5ldyBCYWxsb29uQ2hhcmdlRGVzY3JpYmVyKCBtb2RlbCwgYmFsbG9vbiwgYWNjZXNzaWJsZUxhYmVsLCBvdGhlckFjY2Vzc2libGVMYWJlbCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gbWFuYWdlcyBkZXNjcmlwdGlvbnMgYWJvdXQgdGhlICBiYWxsb29uIHJlbGF0ZWQgdG8gYmFsbG9vbiBtb3ZlbWVudCBhbmQgcG9zaXRpb25cclxuICAgIHRoaXMubW92ZW1lbnREZXNjcmliZXIgPSBuZXcgQmFsbG9vblBvc2l0aW9uRGVzY3JpYmVyKCB0aGlzLCBtb2RlbCwgYmFsbG9vbiwgYWNjZXNzaWJsZUxhYmVsLCBvdGhlckFjY2Vzc2libGVMYWJlbCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdXNlZCB0byB0cmFjayBwcmV2aW91cyB2YWx1ZXMgYWZ0ZXIgYW4gaW50ZXJhY3Rpb24gc28gdGhhdCB3ZSBjYW4gYWNjdXJhdGVseSBkZXNjcmliZSBob3dcclxuICAgIC8vIHRoZSBtb2RlbCBoYXMgY2hhbmdlZFxyXG4gICAgdGhpcy5kZXNjcmliZWRDaGFyZ2VSYW5nZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgKGExMXkpIHtib29sZWFufSAtIGEgZmxhZyB0aGF0IG1hbmFnZXMgd2hldGhlciBvciBub3Qgd2Ugc2hvdWxkIGFsZXJ0IHRoZSBmaXJzdCBjaGFyZ2UgcGlja3VwIG9mIHRoZVxyXG4gICAgLy8gYmFsbG9vbiwgd2lsbCBiZSBzZXQgdG8gdHJ1ZSBldmVyeSB0aW1lIHRoZSBiYWxsb29uIGVudGVycyBvciBsZWF2ZXMgdGhlIHN3ZWF0ZXIgc28gdGhhdCBpbiB0aGlzIGNhc2UsIHdlIGhlYXJcclxuICAgIC8vIFwiQmFsbG9vbiBwaWNrcyB1cCBuZWdhdGl2ZSBjaGFyZ2VzIGZyb20gc3dlYXRlclwiXHJcbiAgICB0aGlzLmFsZXJ0Rmlyc3RQaWNrdXAgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAoYTExeSkge2Jvb2xlYW59IC0gYSBmbGFnIHRoYXQgbWFuYWdlcyBob3cgb2Z0ZW4gd2Ugc2hvdWxkIGFubm91bmNlIGEgY2hhcmdlXHJcbiAgICAvLyBwaWNrdXAgYWxlcnQsIGV2ZXJ5IHRpbWUgaW50ZXJ2YWwgb2YgQ0hBUkdFX0RFU0NSSVBUSU9OX1JFRlJFU0hfUkFURSwgdGhpcyBpcyBzZXQgdG8gdHJ1ZSBzbyB3ZSBkb24ndFxyXG4gICAgLy8gYWxlcnQgZXZlcnkgdGltZSB0aGUgYmFsbG9vbiBwaWNrcyB1cCBhIGNoYXJnZXMuXHJcbiAgICB0aGlzLmFsZXJ0TmV4dFBpY2t1cCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdmFyaWFibGVzIHRyYWNraW5nIHN0YXRlIGFuZCBob3cgaXQgY2hhbmdlcyBiZXR3ZWVuIGRlc2NyaXB0aW9uIHN0ZXBzLCBzZWUgc3RlcCgpIGJlbG93XHJcbiAgICB0aGlzLmRlc2NyaWJlZFZlbG9jaXR5ID0gYmFsbG9vbi52ZWxvY2l0eVByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy5kZXNjcmliZWREcmFnVmVsb2NpdHkgPSBiYWxsb29uLmRyYWdWZWxvY2l0eVByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy5kZXNjcmliZWRQb3NpdGlvbiA9IGJhbGxvb24ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMuZGVzY3JpYmVkVmlzaWJsZSA9IGJhbGxvb24uaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLmRlc2NyaWJlZFRvdWNoaW5nV2FsbCA9IGJhbGxvb24udG91Y2hpbmdXYWxsUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLmRlc2NyaWJlZElzRHJhZ2dlZCA9IGJhbGxvb24uaXNEcmFnZ2VkUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLmRlc2NyaWJlZFdhbGxWaXNpYmxlID0gd2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMuZGVzY3JpYmVkRGlyZWN0aW9uID0gbnVsbDtcclxuICAgIHRoaXMuZGVzY3JpYmVkQ2hhcmdlID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VXR0ZXJhbmNlfSAtIHV0dGVyYW5jZXMgdG8gYmUgc2VudCB0byB0aGUgcXVldWUsIHdpdGggYSBiaXQgb2YgYSBkZWxheSB0aGV5IHdvbid0IHNwYW1cclxuICAgIC8vIHRoZSB1c2VyIGlmIHRoZXkgaGl0IHRoZSBxdWV1ZSB0byBmcmVxdWVudGx5XHJcbiAgICBjb25zdCB1dHRlcmFuY2VPcHRpb25zID0geyBhbGVydFN0YWJsZURlbGF5OiA1MDAgfTtcclxuICAgIHRoaXMuZGlyZWN0aW9uVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgpO1xyXG4gICAgdGhpcy5tb3ZlbWVudFV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIG1lcmdlKCB1dHRlcmFuY2VPcHRpb25zLCB7XHJcblxyXG4gICAgICAvLyB0cnlpbmcgdG8gbWFrZSBtb3ZlbWVudCBhbGVydHMgYXNzZXJ0aXZlIHRvIHJlZHVjZSBwaWxlIHVwIG9mIGFsZXJ0cyB3aGlsZSBkcmFnZ2luZyB0aGUgYmFsbG9vbiwgc2VlXHJcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy80OTFcclxuICAgICAgYW5ub3VuY2VyT3B0aW9uczoge1xyXG4gICAgICAgIGFyaWFMaXZlUHJpb3JpdHk6IEFyaWFMaXZlQW5ub3VuY2VyLkFyaWFMaXZlLkFTU0VSVElWRVxyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuICAgIHRoaXMuaW5kdWNlZENoYXJnZUNoYW5nZVV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHV0dGVyYW5jZU9wdGlvbnMgKTtcclxuICAgIHRoaXMubm9DaGFyZ2VQaWNrdXBVdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCB1dHRlcmFuY2VPcHRpb25zICk7XHJcbiAgICB0aGlzLmNoYXJnZVBpY2t1cFV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHV0dGVyYW5jZU9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VXR0ZXJhbmNlfSB1dHRlcmFuY2VzIGZvciBzcGVjaWZpYyBldmVudHMgdGhhdCBsZXQgdXMgbWFrZSB0aGluZ3MgYXNzZXJ0aXZlL3BvbGl0ZVxyXG4gICAgdGhpcy5ncmFiUmVsZWFzZVV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHtcclxuXHJcbiAgICAgIC8vIGdyYWIvcmVsZWFzZSBhbGVydHMgYXJlIGFzc2VydGl2ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy80OTFcclxuICAgICAgYW5ub3VuY2VyT3B0aW9uczoge1xyXG4gICAgICAgIGFyaWFMaXZlUHJpb3JpdHk6IEFyaWFMaXZlQW5ub3VuY2VyLkFyaWFMaXZlLkFTU0VSVElWRVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB1c2VkIHRvIGRldGVybWluZSBjaGFuZ2UgaW4gcG9zaXRpb24gZHVyaW5nIGEgc2luZ2xlIGRyYWcgbW92ZW1lbnQsIGNvcGllZCB0byBhdm9pZCByZWZlcmVuY2UgaXNzdWVzXHJcbiAgICB0aGlzLm9sZERyYWdQb3NpdGlvbiA9IGJhbGxvb24ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5jb3B5KCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBtb25pdG9ycyBwb3NpdGlvbiBkZWx0YSBpbiBhIHNpbmdsZSBkcmFnXHJcbiAgICB0aGlzLmRyYWdEZWx0YSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB1c2VkIHRvIHdhdGNoIGhvdyBtdWNoIGNoYXJnZSBpcyBwaWNrZWQgdXAgaW4gYSBzaW5nbGUgZHJhZyBhY3Rpb25cclxuICAgIHRoaXMuY2hhcmdlT25TdGFydERyYWcgPSBiYWxsb29uLmNoYXJnZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdXNlZCB0byBkZXRlcm1pbmUgaG93IG11Y2ggY2hhcmdlIGlzIHBpY2tlZCB1cCBpbiBhIHNpbmdsZSBkcmFnIGFjdGlvblxyXG4gICAgdGhpcy5jaGFyZ2VPbkVuZERyYWcgPSBiYWxsb29uLmNoYXJnZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGltZSBzaW5jZSBhbiBhbGVydCByZWxhdGVkIHRvIGNoYXJnZSBwaWNrdXAgaGFzIGJlZW4gYW5ub3VuY2VkXHJcbiAgICB0aGlzLnRpbWVTaW5jZUNoYXJnZUFsZXJ0ID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBldmVyeSB0aW1lIHdlIGRyYWcsIG1hcmsgdGhpcyBhcyB0cnVlIHNvIHdlIGtub3cgdG8gZGVzY3JpYmUgYSBsYWNrIG9mIGNoYXJnZSBwaWNrIHVwXHJcbiAgICAvLyBvbiB0aGUgc3dlYXRlci4gT25jZSB0aGlzIHJ1YiBoYXMgYmVlbiBkZXNjcmliZWQsIHNldCB0byBmYWxzZVxyXG4gICAgdGhpcy5ydWJBbGVydERpcnR5ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3Qgd2UgZGVzY3JpYmUgZGlyZWN0aW9uIGNoYW5nZXMuIEFmdGVyIGNlcnRhaW4gaW50ZXJhY3Rpb25zIHdlIGRvIG5vdCB3YW50XHJcbiAgICAvLyB0byBkZXNjcmliZSB0aGUgZGlyZWN0aW9uLCBvciB0aGUgZGlyZWN0aW9uIGlzIGluY2x1ZGVkIGltcGxpY2l0bHkgaW4gYW5vdGhlciBhbGVydFxyXG4gICAgdGhpcy5kZXNjcmliZURpcmVjdGlvbiA9IHRydWU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gZmxhZyB0aGF0IGluZGljYXRlcyB0aGF0IHVzZXIgYWN0aW9ucyBoYXZlIGxlYWQgdG8gaXQgYmVpbmcgdGltZSBmb3IgYSBcIndhbGwgcnViXCIgdG8gYmVcclxuICAgIC8vIGRlc2NyaWJlZFxyXG4gICAgdGhpcy5kZXNjcmliZVdhbGxSdWIgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBhIGZsYWcgdGhhdCB0cmFja3MgaWYgdGhlIGluaXRpYWwgbW92ZW1lbnQgb2YgdGhlIGJhbGxvb24gYWZ0ZXIgcmVsZWFzZSBoYXNcclxuICAgIC8vIGJlZW4gZGVzY3JpYmVkLiBHZXRzIHJlc2V0IHdoZW5ldmVyIHRoZSBiYWxsb29uIGlzIHBpY2tlZCB1cCwgYW5kIHdoZW4gdGhlIHdhbGwgaXMgcmVtb3ZlZCB3aGlsZVxyXG4gICAgLy8gdGhlIGJhbGxvb24gaXMgc3RpY2tpbmcgdG8gdGhlIHdhbGwuIFRydWUgc28gd2UgZ2V0IG5vbiBhbGVydCBvbiBzdGFydCB1cFxyXG4gICAgdGhpcy5pbml0aWFsTW92ZW1lbnREZXNjcmliZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIHRpbWVyIHRyYWNraW5nIGFtb3VudCBvZiB0aW1lIGJldHdlZW4gcmVsZWFzZSBhbGVydHMsIHVzZWQgdG8gc3BhY2Ugb3V0IGFsZXJ0cyBkZXNjcmliaW5nXHJcbiAgICAvLyBjb250aW51b3VzIGluZGVwZW5kZW50IG1vdmVtZW50IGxpa2UgXCJNb3ZpbmcgbGVmdC4uLk1vdmluZyBsZWZ0Li4uTW92aW5nIGxlZnQuLi5cIiwgYW5kIHNvIG9uXHJcbiAgICB0aGlzLnRpbWVTaW5jZVJlbGVhc2VBbGVydCA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gZmxhZyB0aGF0IHdpbGwgcHJldmVudCB0aGUgZmlyaW5nIG9mIHRoZSBcIm5vIG1vdmVtZW50XCIgYWxlcnQsIHNldCB0byB0cnVlIHdpdGggdG9nZ2xpbmdcclxuICAgIC8vIGJhbGxvb24gdmlzaWJpbGl0eSBhcyBhIHNwZWNpYWwgY2FzZSBzbyB3ZSBkb24ndCB0cmlnZ2VyIHRoaXMgYWxlcnQgd2hlbiBhZGRlZCB0byB0aGUgcGxheSBhcmVhXHJcbiAgICB0aGlzLnByZXZlbnROb01vdmVtZW50QWxlcnQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyB3aGVuIHZpc2liaWxpdHkgY2hhbmdlcywgZ2VuZXJhdGUgdGhlIGFsZXJ0IGFuZCBiZSBzdXJlIHRvIGRlc2NyaWJlIGluaXRpYWwgbW92ZW1lbnQgdGhlIG5leHQgdGltZSB0aGVcclxuICAgIC8vIGJhbGxvb24gaXMgcmVsZWFzZWQgb3IgYWRkZWQgdG8gdGhlIHBsYXkgYXJlYVxyXG4gICAgYmFsbG9vbi5pc1Zpc2libGVQcm9wZXJ0eS5sYXp5TGluayggaXNWaXNpYmxlID0+IHtcclxuICAgICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCB0aGlzLmdldFZpc2liaWxpdHlDaGFuZ2VkRGVzY3JpcHRpb24oKSApO1xyXG4gICAgICB0aGlzLmluaXRpYWxNb3ZlbWVudERlc2NyaWJlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnByZXZlbnROb01vdmVtZW50QWxlcnQgPSB0cnVlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBkb20gLSBpZiB3ZSBlbnRlci9sZWF2ZSB0aGUgc3dlYXRlciBhbm5vdW5jZSB0aGF0IGltbWVkaWF0ZWx5XHJcbiAgICBiYWxsb29uLm9uU3dlYXRlclByb3BlcnR5LmxpbmsoIG9uU3dlYXRlciA9PiB7XHJcbiAgICAgIGlmICggYmFsbG9vbi5pc0RyYWdnZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIHRoaXMubW92ZW1lbnREZXNjcmliZXIuZ2V0T25Td2VhdGVyU3RyaW5nKCBvblN3ZWF0ZXIgKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBlbnRlcmluZyBzd2VhdGVyLCBpbmRpY2F0ZSB0aGF0IHdlIG5lZWQgdG8gYWxlcnQgdGhlIG5leHQgY2hhcmdlIHBpY2t1cFxyXG4gICAgICB0aGlzLmFsZXJ0Rmlyc3RQaWNrdXAgPSB0cnVlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IGRpc3RhbmNlIHRoZSBiYWxsb29uIGhhcyBtb3ZlZCBzaW5jZSB3ZSBsYXN0IHNlbnQgYW4gYWxlcnQgdG8gdGhlIHV0dGVyYW5jZVF1ZXVlLiBBZnRlciBhXHJcbiAgICAvLyBzdWNjZXNzZnVsIGFsZXJ0IHdlIGRvbid0IHNlbmQgYW55IGFsZXJ0cyB0byB0aGUgdXR0ZXJhbmNlIHF1ZXVlIHVudGlsIHdlIGhhdmUgc3Vic3RhbnRpYWwgYmFsbG9vbiBtb3ZlbWVudFxyXG4gICAgLy8gdG8gYXZvaWQgYSBwaWxlLXVwIG9mIGFsZXJ0cy5cclxuICAgIHRoaXMuZGlzdGFuY2VTaW5jZURpcmVjdGlvbkFsZXJ0ID0gMDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn0gdGhlIHBvc2l0aW9uIG9mIHRoZSBiYWxsb29uIHdoZW4gd2Ugc2VuZCBhbiBhbGVydCB0byB0aGUgdXR0ZXJhbmNlUXVldWUuIEFmdGVyIGEgc3VjY2Vzc2Z1bFxyXG4gICAgLy8gYWxlcnQsIHdlIGRvbid0IGFsZXJ0IGFnYWluIHVudGlsIHRoZXJlIGlzIHN1ZmZpY2llbnQgbW92ZW1lbnQgdG8gYXZvaWQgYSBwaWxlLXVwIG9mIGFsZXJ0c1xyXG4gICAgdGhpcy5wb3NpdGlvbk9uQWxlcnQgPSB0aGlzLmJhbGxvb25Nb2RlbC5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIHRoaXMuYmFsbG9vbk1vZGVsLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLmRpc3RhbmNlU2luY2VEaXJlY3Rpb25BbGVydCA9IHBvc2l0aW9uLm1pbnVzKCB0aGlzLnBvc2l0aW9uT25BbGVydCApLm1hZ25pdHVkZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB3aGVuIGRyYWcgdmVsb2NpdHkgc3RhcnRzIGZyb20gemVybywgb3IgaGl0cyB6ZXJvLCB1cGRhdGUgY2hhcmdlIGNvdW50cyBvbiBzdGFydC9lbmQgZHJhZyBzbyB3ZSBjYW4gZGV0ZXJtaW5lXHJcbiAgICAvLyBob3cgbXVjaCBjaGFyZ2UgaGFzIGJlZW4gcGlja2VkIHVwIGluIGEgc2luZ2xlIGludGVyYWN0aW9uXHJcbiAgICB0aGlzLmJhbGxvb25Nb2RlbC5kcmFnVmVsb2NpdHlQcm9wZXJ0eS5saW5rKCAoIHZlbG9jaXR5LCBvbGRWZWxvY2l0eSApID0+IHtcclxuICAgICAgaWYgKCBvbGRWZWxvY2l0eSApIHtcclxuICAgICAgICBpZiAoIG9sZFZlbG9jaXR5LmVxdWFscyggVmVjdG9yMi5aRVJPICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gd2UganVzdCBzdGFydGVkIGRyYWdnaW5nXHJcbiAgICAgICAgICB0aGlzLmNoYXJnZU9uU3RhcnREcmFnID0gYmFsbG9vbi5jaGFyZ2VQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHZlbG9jaXR5LmVxdWFscyggVmVjdG9yMi5aRVJPICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gd2UganVzdCBmaW5pc2hlZCBhIGRyYWcgaW50ZXJhY3Rpb25cclxuICAgICAgICAgIHRoaXMuY2hhcmdlT25FbmREcmFnID0gYmFsbG9vbi5jaGFyZ2VQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgZGVzY3JpYmVyLCByZXNldHRpbmcgZmxhZ3MgdGhhdCBhcmUgcmVxdWlyZWQgdG8gbWFuaXB1bGF0ZSBwcm92aWRlZCBkZXNjcmlwdGlvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5jaGFyZ2VEZXNjcmliZXIucmVzZXQoKTtcclxuICAgIHRoaXMuZGVzY3JpYmVkQ2hhcmdlUmFuZ2UgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuYWxlcnRGaXJzdFBpY2t1cCA9IGZhbHNlO1xyXG4gICAgdGhpcy5hbGVydE5leHRQaWNrdXAgPSBmYWxzZTtcclxuXHJcbiAgICAvLyByZXNldCBhbGwgdmFyaWFibGVzIHRyYWNraW5nIHByZXZpb3VzIGRlc2NyaXB0aW9uc1xyXG4gICAgdGhpcy5kZXNjcmliZWRWZWxvY2l0eSA9IHRoaXMuYmFsbG9vbk1vZGVsLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLmRlc2NyaWJlZERyYWdWZWxvY2l0eSA9IHRoaXMuYmFsbG9vbk1vZGVsLmRyYWdWZWxvY2l0eVByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy5kZXNjcmliZWRQb3NpdGlvbiA9IHRoaXMuYmFsbG9vbk1vZGVsLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLmRlc2NyaWJlZFZpc2libGUgPSB0aGlzLmJhbGxvb25Nb2RlbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMuZGVzY3JpYmVkVG91Y2hpbmdXYWxsID0gdGhpcy5iYWxsb29uTW9kZWwudG91Y2hpbmdXYWxsUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLmRlc2NyaWJlZElzRHJhZ2dlZCA9IHRoaXMuYmFsbG9vbk1vZGVsLmlzRHJhZ2dlZFByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy5kZXNjcmliZWRXYWxsVmlzaWJsZSA9IHRoaXMud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMuZGVzY3JpYmVkRGlyZWN0aW9uID0gbnVsbDtcclxuICAgIHRoaXMuZGVzY3JpYmVkQ2hhcmdlID0gMDtcclxuXHJcbiAgICB0aGlzLm9sZERyYWdQb3NpdGlvbiA9IHRoaXMuYmFsbG9vbk1vZGVsLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuY29weSgpO1xyXG4gICAgdGhpcy5kcmFnRGVsdGEgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy5jaGFyZ2VPblN0YXJ0RHJhZyA9IHRoaXMuYmFsbG9vbk1vZGVsLmNoYXJnZVByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy5jaGFyZ2VPbkVuZERyYWcgPSB0aGlzLmJhbGxvb25Nb2RlbC5jaGFyZ2VQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMudGltZVNpbmNlQ2hhcmdlQWxlcnQgPSAwO1xyXG4gICAgdGhpcy5ydWJBbGVydERpcnR5ID0gZmFsc2U7XHJcbiAgICB0aGlzLmRlc2NyaWJlRGlyZWN0aW9uID0gdHJ1ZTtcclxuICAgIHRoaXMuZGVzY3JpYmVXYWxsUnViID0gZmFsc2U7XHJcbiAgICB0aGlzLmluaXRpYWxNb3ZlbWVudERlc2NyaWJlZCA9IHRydWU7XHJcbiAgICB0aGlzLnRpbWVTaW5jZVJlbGVhc2VBbGVydCA9IDA7XHJcbiAgICB0aGlzLnByZXZlbnROb01vdmVtZW50QWxlcnQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmRpc3RhbmNlU2luY2VEaXJlY3Rpb25BbGVydCA9IDA7XHJcbiAgICB0aGlzLnBvc2l0aW9uT25BbGVydCA9IHRoaXMuYmFsbG9vbk1vZGVsLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZW5kIGFuIGFsZXJ0IHRvIHRoZSB1dHRlcmFuY2VRdWV1ZSwgYnV0IHNhdmUgdGhlIHBvc2l0aW9uIHdoZW4gd2UgZG8gc28gdG8gdHJhY2tcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VEFsZXJ0YWJsZX0gYWxlcnRhYmxlXHJcbiAgICovXHJcbiAgc2VuZEFsZXJ0KCBhbGVydGFibGUgKSB7XHJcbiAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIGFsZXJ0YWJsZSApO1xyXG4gICAgdGhpcy5wb3NpdGlvbk9uQWxlcnQgPSB0aGlzLmJhbGxvb25Nb2RlbC5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBiYWxsb29uIGlzIGJlaW5nIGRyYWdnZWQgd2l0aCBhIHBvaW50ZXIsIGJ1dCB0aGUgbW92ZW1lbnQgaXMgdG9vIHNtYWxsIHRvIGRlc2NyaWJlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2hvcnRNb3ZlbWVudEZyb21Qb2ludGVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYmFsbG9vbk1vZGVsLmRyYWdnaW5nV2l0aFBvaW50ZXIgJiYgKCB0aGlzLmRpc3RhbmNlU2luY2VEaXJlY3Rpb25BbGVydCA8IDI1ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGRlc2NyaXB0aW9uIGZvciB0aGUgYmFsbG9vbiwgdGhlIGNvbnRlbnQgdGhhdCBjYW4gYmUgcmVhZCBieSBhbiBhc3Npc3RpdmUgZGV2aWNlIGluIHRoZSBQYXJhbGxlbCBET00uXHJcbiAgICogRGVwZW5kZW50IG9uIHBvc2l0aW9uLCBjaGFyZ2UsIGFuZCBjaGFyZ2UgdmlzaWJpbGl0eS4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2U6XHJcbiAgICogXCJBdCBjZW50ZXIgb2YgcGxheSBhcmVhLiBIYXMgemVybyBuZXQgY2hhcmdlLCBubyBtb3JlIG5lZ2F0aXZlIGNoYXJnZSB0aGFuIHBvc2l0aXZlIGNoYXJnZXMuXCIgb3JcclxuICAgKiBcIkF0IGNlbnRlciBvZiBwbGF5IGFyZWEsIG5leHQgdG8gZ3JlZW4gYmFsbG9vbi5cIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRCYWxsb29uRGVzY3JpcHRpb24oKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb247XHJcbiAgICBjb25zdCBzaG93Q2hhcmdlcyA9IHRoaXMuc2hvd0NoYXJnZXNQcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICBsZXQgYXR0cmFjdGl2ZVN0YXRlQW5kUG9zaXRpb25TdHJpbmcgPSB0aGlzLm1vdmVtZW50RGVzY3JpYmVyLmdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb24oKTtcclxuICAgIGF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIHN0YXRlbWVudDogYXR0cmFjdGl2ZVN0YXRlQW5kUG9zaXRpb25TdHJpbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIHNob3dDaGFyZ2VzID09PSAnbm9uZScgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uID0gYXR0cmFjdGl2ZVN0YXRlQW5kUG9zaXRpb25TdHJpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIGJhbGxvb24gbmV0IGNoYXJnZSBkZXNjcmlwdGlvblxyXG4gICAgICBjb25zdCBuZXRDaGFyZ2VEZXNjcmlwdGlvblN0cmluZyA9IHRoaXMuY2hhcmdlRGVzY3JpYmVyLmdldE5ldENoYXJnZURlc2NyaXB0aW9uKCk7XHJcblxyXG4gICAgICAvLyBiYWxsb29uIHJlbGF0aXZlIGNoYXJnZSBzdHJpbmcsIGRlcGVuZGVudCBvbiBjaGFyZ2UgdmlzaWJpbGl0eVxyXG4gICAgICBjb25zdCByZWxhdGl2ZUNoYXJnZXNTdHJpbmcgPSBCYWxsb29uQ2hhcmdlRGVzY3JpYmVyLmdldFJlbGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24oIHRoaXMuYmFsbG9vbk1vZGVsLCBzaG93Q2hhcmdlcyApO1xyXG5cclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGJhbGxvb25TaG93QWxsQ2hhcmdlc1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBzdGF0ZUFuZFBvc2l0aW9uOiBhdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvblN0cmluZyxcclxuICAgICAgICBuZXRDaGFyZ2U6IG5ldENoYXJnZURlc2NyaXB0aW9uU3RyaW5nLFxyXG4gICAgICAgIHJlbGF0aXZlQ2hhcmdlOiByZWxhdGl2ZUNoYXJnZXNTdHJpbmdcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWxlcnQgZGVzY3JpcHRpb24gZm9yIHdoZW4gYSBjaGFyZ2UgaXMgcGlja2VkIHVwIG9mZiBvZiB0aGUgc3dlYXRlci4gRGVwZW5kZW50XHJcbiAgICogb24gY2hhcmdlIHZpZXcsIHdoZXRoZXIgdGhlIGJhbGxvb24gaGFzIHBpY2tlZCB1cCBjaGFyZ2VzIGFscmVhZHkgc2luY2UgbW92aW5nIG9uIHRvIHRoZVxyXG4gICAqIHN3ZWF0ZXIsIGFuZCB0aGUgbnVtYmVyIG9mIGNoYXJnZXMgdGhhdCB0aGUgYmFsbG9vbiBoYXMgcGlja2VkIHVwLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gZmlyc3RQaWNrdXAgLSBzcGVjaWFsIGJlaGF2aW9yIGlmIHRoZSBmaXJzdCBjaGFyZ2UgcGlja3VwIHNpbmNlIGxhbmRpbmcgb24gc3dlYXRlclxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Q2hhcmdlUGlja3VwRGVzY3JpcHRpb24oIGZpcnN0UGlja3VwICkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uO1xyXG4gICAgY29uc3Qgc2hvd25DaGFyZ2VzID0gdGhpcy5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGNvbnN0IG5ld0NoYXJnZSA9IHRoaXMuYmFsbG9vbk1vZGVsLmNoYXJnZVByb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgbmV3UmFuZ2UgPSBCQVNFRGVzY3JpYmVyLmdldERlc2NyaWJlZENoYXJnZVJhbmdlKCBuZXdDaGFyZ2UgKTtcclxuXHJcbiAgICBpZiAoIHNob3duQ2hhcmdlcyA9PT0gJ25vbmUnICkge1xyXG4gICAgICBkZXNjcmlwdGlvbiA9IHRoaXMubW92ZW1lbnREZXNjcmliZXIuZ2V0QXR0cmFjdGl2ZVN0YXRlQW5kUG9zaXRpb25EZXNjcmlwdGlvbigpO1xyXG4gICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywgeyBzdGF0ZW1lbnQ6IGRlc2NyaXB0aW9uIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBmaXJzdFBpY2t1cCApIHtcclxuXHJcbiAgICAgIC8vIGlmIHRoaXMgaXMgdGhlIGZpcnN0IGNoYXJnZSBwaWNrZWQgdXAgYWZ0ZXIgbW92aW5nIG9udG8gc3dlYXRlciwgZ2VuZXJhdGVcclxuICAgICAgLy8gYSBzcGVjaWFsIGRlc2NyaXB0aW9uIHRvIGFubm91bmNlIHRoYXQgY2hhcmdlcyBoYXZlIGJlZW4gdHJhbnNmZXJlZFxyXG4gICAgICBkZXNjcmlwdGlvbiA9IHRoaXMuZ2V0SW5pdGlhbENoYXJnZVBpY2t1cERlc2NyaXB0aW9uKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggIXRoaXMuZGVzY3JpYmVkQ2hhcmdlUmFuZ2UgfHwgIW5ld1JhbmdlLmVxdWFscyggdGhpcy5kZXNjcmliZWRDaGFyZ2VSYW5nZSApICkge1xyXG5cclxuICAgICAgLy8gaWYgd2UgaGF2ZSBlbnRlcmVkIGEgbmV3IGRlc2NyaWJlZCByYW5nZSBzaW5jZSB0aGUgcHJldmlvdXMgY2hhcmdlIGFsZXJ0LFxyXG4gICAgICAvLyB3ZSB3aWxsIGdlbmVyYXRlIGEgc3BlY2lhbCBkZXNjcmlwdGlvbiB0aGF0IG1lbnRpb25zIHRoZSByZWxhdGl2ZSBjaGFyZ2VzXHJcbiAgICAgIGNvbnN0IHN3ZWF0ZXJDaGFyZ2UgPSB0aGlzLm1vZGVsLnN3ZWF0ZXIuY2hhcmdlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICAvLyByZWxhdGl2ZSBjaGFyZ2Ugb2YgYmFsbG9vbiwgYXMgYSBzZW50YW5jZVxyXG4gICAgICBsZXQgcmVsYXRpdmVCYWxsb29uQ2hhcmdlID0gQmFsbG9vbkNoYXJnZURlc2NyaWJlci5nZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsKCB0aGlzLmJhbGxvb25Nb2RlbCwgc2hvd25DaGFyZ2VzLCB0aGlzLmFjY2Vzc2libGVOYW1lICk7XHJcbiAgICAgIHJlbGF0aXZlQmFsbG9vbkNoYXJnZSA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHN0YXRlbWVudDogcmVsYXRpdmVCYWxsb29uQ2hhcmdlXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc3QgcmVsYXRpdmVTd2VhdGVyQ2hhcmdlID0gU3dlYXRlckRlc2NyaWJlci5nZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsKCBzd2VhdGVyQ2hhcmdlLCBzaG93bkNoYXJnZXMgKTtcclxuXHJcbiAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBiYWxsb29uU3dlYXRlclJlbGF0aXZlQ2hhcmdlc1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBiYWxsb29uOiByZWxhdGl2ZUJhbGxvb25DaGFyZ2UsXHJcbiAgICAgICAgc3dlYXRlcjogcmVsYXRpdmVTd2VhdGVyQ2hhcmdlXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuZGVzY3JpYmVkQ2hhcmdlUmFuZ2UgPSBCQVNFRGVzY3JpYmVyLmdldERlc2NyaWJlZENoYXJnZVJhbmdlKCBuZXdDaGFyZ2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gaW4gc2FtZSBkZXNjcmliZWQgcmFuZ2Ugb2YgY2hhcmdlcywgZGVzY3JpYmUgaG93IGJhbGxvb24gcGlja3MgdXAgbW9yZSBjaGFyZ2VzXHJcbiAgICAgIGNvbnN0IHBpY2tzVXBDaGFyZ2VzID0gU3RyaW5nVXRpbHMuZmlsbEluKCBiYWxsb29uUGlja3NVcE1vcmVDaGFyZ2VzUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIGJhbGxvb246IHRoaXMuYWNjZXNzaWJsZU5hbWVcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgaWYgKCBzaG93bkNoYXJnZXMgPT09ICdhbGwnICkge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICBzdGF0ZW1lbnQ6IHBpY2tzVXBDaGFyZ2VzXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBzaG93bkNoYXJnZXMgPT09ICdkaWZmJyApIHtcclxuICAgICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vblBpY2tzVXBNb3JlQ2hhcmdlc0RpZmZQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICBwaWNrVXA6IHBpY2tzVXBDaGFyZ2VzXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmRlc2NyaWJlZENoYXJnZVJhbmdlID0gQkFTRURlc2NyaWJlci5nZXREZXNjcmliZWRDaGFyZ2VSYW5nZSggbmV3Q2hhcmdlICk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGVzY3JpcHRpb24sIGBubyBjaGFyZ2UgcGlja3VwIGFsZXJ0IGdlbmVyYXRlZCBmb3IgY2hhcmdlIHZpZXcgJHtzaG93bkNoYXJnZXN9YCApO1xyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGZpcnN0IHRpbWUgdGhlIGJhbGxvb24gcGlja3MgdXAgY2hhcmdlcyBmcm9tIHRoZSBzd2VhdGVyIGFmdGVyIGxlYXZpbmcgdGhlIHBsYXlcclxuICAgKiBhcmVhLCB3ZSBnZXQgYW4gaW5pdGlhbCBhbGVydCBsaWtlXHJcbiAgICogXCJZZWxsb3cgQmFsbG9vbiBwaWNrcyB1cCBuZWdhdGl2ZSBjaGFyZ2VzIGZyb20gc3dlYXRlci5cIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRJbml0aWFsQ2hhcmdlUGlja3VwRGVzY3JpcHRpb24oKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb247XHJcbiAgICBjb25zdCBzaG93bkNoYXJnZXMgPSB0aGlzLnNob3dDaGFyZ2VzUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgY29uc3QgcGlja3NVcENoYXJnZXMgPSBTdHJpbmdVdGlscy5maWxsSW4oIGJhbGxvb25QaWNrc1VwQ2hhcmdlc1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgYmFsbG9vbjogdGhpcy5hY2Nlc3NpYmxlTmFtZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGlmICggc2hvd25DaGFyZ2VzID09PSAnYWxsJyApIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBzdGF0ZW1lbnQ6IHBpY2tzVXBDaGFyZ2VzXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBzaG93bkNoYXJnZXMgPT09ICdkaWZmJyApIHtcclxuICAgICAgZGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGJhbGxvb25QaWNrc1VwQ2hhcmdlc0RpZmZQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgcGlja1VwOiBwaWNrc1VwQ2hhcmdlc1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFsZXJ0IHRoYXQgZGVzY3JpYmVzIHRoYXQgbm8gY2hhcmdlcyB3ZXJlIHBpY2tlZCB1cCBkdXJpbmcgdGhlIGRyYWcgaW50ZXJhY3Rpb24uIFRoaXMgYWxlcnQgaXMgZGVwZW5kZW50XHJcbiAgICogb24gd2hpY2ggY2hhcmdlcyBhcmUgdmlzaWJsZS4gV2lsbCByZXR1cm4gYSBzdHJpbmcgbGlrZVxyXG4gICAqXHJcbiAgICogXCJObyBjaGFuZ2UgaW4gY2hhcmdlcy4gT24gbGVmdCBzaWRlIG9mIHN3ZWF0ZXIuIE1vcmUgcGFpcnMgb2YgY2hhcmdlcyBkb3duIGFuZCB0byB0aGUgcmlnaHQuXCIgb3JcclxuICAgKiBcIk5vIGNoYW5nZSBpbiBuZXQgY2hhcmdlLiBPbiBsZWZ0IHNpZGUgb2Ygc3dlYXRlci4gTW9yZSBoaWRkZW4gcGFpcnMgb2YgY2hhcmdlcyBkb3duIGFuZCB0byB0aGUgcmlnaHQuXCIgb3JcclxuICAgKiBcIk9uIGxlZnQgc2lkZSBvZiBzd2VhdGVyXCIuIG9yXHJcbiAgICogXCJObyBjaGFuZ2UgaW4gY2hhcmdlcy4gT24gcmlnaHQgc2lkZSBvZiBzd2VhdGVyLiBTd2VhdGVyIGhhcyBwb3NpdGl2ZSBuZXQgY2hhcmdlLiBZZWxsb3cgQmFsbG9vbiBoYXMgbmVnYXRpdmVcclxuICAgKiBuZXQgY2hhcmdlLiBQcmVzcyBzcGFjZSB0byByZWxlYXNlLlwiXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldE5vQ2hhcmdlUGlja3VwRGVzY3JpcHRpb24oKSB7XHJcbiAgICBsZXQgYWxlcnQ7XHJcbiAgICBjb25zdCBjaGFyZ2VzU2hvd24gPSB0aGlzLnNob3dDaGFyZ2VzUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgY29uc3QgYmFsbG9vblBvc2l0aW9uU3RyaW5nID0gdGhpcy5tb3ZlbWVudERlc2NyaWJlci5nZXRBdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uKCk7XHJcbiAgICBjb25zdCBzd2VhdGVyQ2hhcmdlID0gdGhpcy5tb2RlbC5zd2VhdGVyLmNoYXJnZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGlmICggY2hhcmdlc1Nob3duID09PSAnbm9uZScgKSB7XHJcblxyXG4gICAgICAvLyBpZiBubyBjaGFyZ2VzIGFyZSBzaG93biwganVzdCBkZXNjcmliZSBwb3NpdGlvbiBvZiBiYWxsb29uIGFzIGEgY29tcGxldGUgc2VudGVuY2VcclxuICAgICAgYWxlcnQgPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBzdGF0ZW1lbnQ6IGJhbGxvb25Qb3NpdGlvblN0cmluZ1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggc3dlYXRlckNoYXJnZSA8IEJBU0VDb25zdGFudHMuTUFYX0JBTExPT05fQ0hBUkdFICkge1xyXG5cclxuICAgICAgLy8gdGhlcmUgYXJlIHN0aWxsIGNoYXJnZXMgb24gdGhlIHN3ZWF0ZXJcclxuICAgICAgY29uc3Qgc3dlYXRlckNoYXJnZXMgPSB0aGlzLm1vZGVsLnN3ZWF0ZXIubWludXNDaGFyZ2VzO1xyXG4gICAgICBjb25zdCBtb3JlQ2hhcmdlc1N0cmluZyA9IFN3ZWF0ZXJEZXNjcmliZXIuZ2V0TW9yZUNoYXJnZXNEZXNjcmlwdGlvbiggdGhpcy5iYWxsb29uTW9kZWwsIHN3ZWF0ZXJDaGFyZ2UsIHN3ZWF0ZXJDaGFyZ2VzLCBjaGFyZ2VzU2hvd24gKTtcclxuICAgICAgaWYgKCBjaGFyZ2VzU2hvd24gPT09ICdhbGwnICkge1xyXG4gICAgICAgIGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBub0NoYXJnZVBpY2t1cFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIG5vQ2hhbmdlOiBub0NoYW5nZUluQ2hhcmdlc1N0cmluZyxcclxuICAgICAgICAgIGJhbGxvb25Qb3NpdGlvbjogYmFsbG9vblBvc2l0aW9uU3RyaW5nLFxyXG4gICAgICAgICAgbW9yZUNoYXJnZXNQb3NpdGlvbjogbW9yZUNoYXJnZXNTdHJpbmdcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGNoYXJnZXNTaG93biA9PT0gJ2RpZmYnICkge1xyXG4gICAgICAgIGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBub0NoYXJnZVBpY2t1cFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIG5vQ2hhbmdlOiBub0NoYW5nZUluTmV0Q2hhcmdlU3RyaW5nLFxyXG4gICAgICAgICAgYmFsbG9vblBvc2l0aW9uOiBiYWxsb29uUG9zaXRpb25TdHJpbmcsXHJcbiAgICAgICAgICBtb3JlQ2hhcmdlc1Bvc2l0aW9uOiBtb3JlQ2hhcmdlc1N0cmluZ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyB0aGVyZSBhcmUgbm8gbW9yZSBjaGFyZ2VzIHJlbWFpbmluZyBvbiB0aGUgc3dlYXRlclxyXG4gICAgICBpZiAoIGNoYXJnZXNTaG93biA9PT0gJ2FsbCcgKSB7XHJcbiAgICAgICAgY29uc3QgcmVsYXRpdmVTd2VhdGVyQ2hhcmdlID0gU3dlYXRlckRlc2NyaWJlci5nZXROZXRDaGFyZ2VEZXNjcmlwdGlvbiggc3dlYXRlckNoYXJnZSApO1xyXG4gICAgICAgIGxldCByZWxhdGl2ZUJhbGxvb25DaGFyZ2UgPSB0aGlzLmNoYXJnZURlc2NyaWJlci5nZXROZXRDaGFyZ2VEZXNjcmlwdGlvbldpdGhMYWJlbCgpO1xyXG4gICAgICAgIHJlbGF0aXZlQmFsbG9vbkNoYXJnZSA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywgeyBzdGF0ZW1lbnQ6IHJlbGF0aXZlQmFsbG9vbkNoYXJnZSB9ICk7XHJcblxyXG4gICAgICAgIGFsZXJ0ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBub2NoYXJnZVBpY2t1cFdpdGhPYmplY3RDaGFyZ2VBbmRIaW50LCB7XHJcbiAgICAgICAgICBub0NoYW5nZTogbm9DaGFuZ2VJbkNoYXJnZXNTdHJpbmcsXHJcbiAgICAgICAgICBiYWxsb29uUG9zaXRpb246IGJhbGxvb25Qb3NpdGlvblN0cmluZyxcclxuICAgICAgICAgIHN3ZWF0ZXJDaGFyZ2U6IHJlbGF0aXZlU3dlYXRlckNoYXJnZSxcclxuICAgICAgICAgIGJhbGxvb25DaGFyZ2U6IHJlbGF0aXZlQmFsbG9vbkNoYXJnZSxcclxuICAgICAgICAgIGhpbnQ6IHJlbGVhc2VIaW50U3RyaW5nXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBjaGFyZ2VzU2hvd24gPT09ICdkaWZmJyApIHtcclxuICAgICAgICBhbGVydCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggbm9DaGFyZ2VQaWNrdXBIaW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgbm9DaGFuZ2U6IG5vQ2hhbmdlSW5OZXRDaGFyZ2VTdHJpbmcsXHJcbiAgICAgICAgICBiYWxsb29uUG9zaXRpb246IGJhbGxvb25Qb3NpdGlvblN0cmluZyxcclxuICAgICAgICAgIGhpbnQ6IHJlbGVhc2VIaW50U3RyaW5nXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFsZXJ0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIGJhbGxvb24gcnViYmluZyBvbiB0aGUgd2FsbCwgaW5jbHVkaW5nIGEgZGVzY3JpcHRpb24gZm9yIHRoZVxyXG4gICAqIGluZHVjZWQgY2hhcmdlIGlmIHRoZXJlIGlzIGFueSBhbmQgZGVwZW5kaW5nIG9uIHRoZSBjaGFyZ2Ugdmlldy4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKlxyXG4gICAqIFwiQXQgd2FsbC4gTm8gdHJhbnNmZXIgb2YgY2hhcmdlLiBJbiB3YWxsLCBubyBjaGFuZ2UgaW4gY2hhcmdlcy5cIiBvclxyXG4gICAqIFwiQXQgdXBwZXIgd2FsbC4gTm8gdHJhbnNmZXIgb2YgY2hhcmdlLiBOZWdhdGl2ZSBjaGFyZ2VzIGluIHVwcGVyIHdhbGwgbW92ZSBhd2F5IGZyb20geWVsbG93IGJhbGxvb24gYSBsb3QuXHJcbiAgICogUG9zaXRpdmUgY2hhcmdlcyBkbyBub3QgbW92ZS5cIiBvclxyXG4gICAqIFwiQXQgdXBwZXIgd2FsbC5cIiBvclxyXG4gICAqIFwiQXQgbG93ZXIgd2FsbC4gWWVsbG93IGJhbGxvb24gaGFzIG5lZ2F0aXZlIG5ldCBjaGFyZ2UsIHNob3dpbmcgc2V2ZXJhbCBtb3JlIG5lZ2F0aXZlIGNoYXJnZXMgdGhhbiBwb3NpdGl2ZSBjaGFyZ2VzLlwiXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFdhbGxSdWJiaW5nRGVzY3JpcHRpb24oKSB7XHJcbiAgICBsZXQgZGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgICBsZXQgY2hhcmdlU3RyaW5nO1xyXG5cclxuICAgIC8vIHRoZSBwb3NpdGlvbiBzdHJpbmcgaXMgdXNlZCBmb3IgYWxsIGNoYXJnZSB2aWV3cywgdXNlZCBhcyBhIHNpbmdsZSBzZW50ZW5jZVxyXG4gICAgY29uc3QgcG9zaXRpb25TdHJpbmcgPSB0aGlzLm1vdmVtZW50RGVzY3JpYmVyLmdldEJhbGxvb25Qb3NpdGlvbkRlc2NyaXB0aW9uKCk7XHJcbiAgICBsZXQgYXRQb3NpdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vbkF0UG9zaXRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvblN0cmluZ1xyXG4gICAgfSApO1xyXG4gICAgYXRQb3NpdGlvblN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICBzdGF0ZW1lbnQ6IGF0UG9zaXRpb25TdHJpbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzaG93bkNoYXJnZXMgPSB0aGlzLnNob3dDaGFyZ2VzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCB3YWxsVmlzaWJsZSA9IHRoaXMud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGlmICggc2hvd25DaGFyZ2VzID09PSAnbm9uZScgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9uU3RyaW5nID0gYXRQb3NpdGlvblN0cmluZztcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIHNob3duQ2hhcmdlcyA9PT0gJ2FsbCcgKSB7XHJcbiAgICAgICAgbGV0IGluZHVjZWRDaGFyZ2VTdHJpbmc7XHJcblxyXG4gICAgICAgIC8vIGlmIGJhbGxvb25zIGFyZSBhZGphY2VudCwgdGhlIHJlc3VsdGFudCBpbmR1Y2VkIGNoYXJnZSBkZXNjcmlwdGlvbiBpcyBtb2RpZmllZFxyXG4gICAgICAgIGlmICggdGhpcy5tb2RlbC5nZXRCYWxsb29uc0FkamFjZW50KCkgKSB7XHJcblxyXG4gICAgICAgICAgY29uc3QgdGhpc0luZHVjaW5nQW5kVmlzaWJsZSA9IHRoaXMuYmFsbG9vbk1vZGVsLmluZHVjaW5nQ2hhcmdlQW5kVmlzaWJsZSgpO1xyXG4gICAgICAgICAgY29uc3Qgb3RoZXJJbmR1Y2luZ0FuZFZpc2libGUgPSB0aGlzLmJhbGxvb25Nb2RlbC5vdGhlci5pbmR1Y2luZ0NoYXJnZUFuZFZpc2libGUoKTtcclxuXHJcbiAgICAgICAgICBpZiAoIHRoaXNJbmR1Y2luZ0FuZFZpc2libGUgJiYgb3RoZXJJbmR1Y2luZ0FuZFZpc2libGUgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBib3RoIGluZHVjaW5nIGNoYXJnZSwgY29tYmluZSBpbmR1Y2VkIGNoYXJnZSBkZXNjcmlwdGlvbiB3aXRoIFwiYm90aCBiYWxsb29uc1wiXHJcbiAgICAgICAgICAgIGluZHVjZWRDaGFyZ2VTdHJpbmcgPSBXYWxsRGVzY3JpYmVyLmdldENvbWJpbmVkSW5kdWNlZENoYXJnZURlc2NyaXB0aW9uKCB0aGlzLmJhbGxvb25Nb2RlbCwgd2FsbFZpc2libGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCAhdGhpc0luZHVjaW5nQW5kVmlzaWJsZSAmJiAhb3RoZXJJbmR1Y2luZ0FuZFZpc2libGUgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBuZWl0aGVyIGJhbGxvb24gaXMgaW5kdWNpbmcgY2hhcmdlLCBqdXN0IHVzZSBub3JtYWwgaW5kdWNlZCBjaGFyZ2UgZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgaW5kdWNlZENoYXJnZVN0cmluZyA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZURlc2NyaXB0aW9uKCB0aGlzLmJhbGxvb25Nb2RlbCwgdGhpcy5hY2Nlc3NpYmxlTmFtZSwgd2FsbFZpc2libGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJhbGxvb25Nb2RlbC5pbmR1Y2luZ0NoYXJnZUFuZFZpc2libGUoKSAhPT0gdGhpcy5iYWxsb29uTW9kZWwub3RoZXIuaW5kdWNpbmdDaGFyZ2VBbmRWaXNpYmxlKCkgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG9ubHkgb25lIGJhbGxvb24gaXMgaW5kdWNpbmcgY2hhcmdlLCBkZXNjcmliZSB3aGljaGV2ZXIgb25lIGlzIGN1cnJlbnRseSBpbmR1Y2luZyBjaGFyZ2VcclxuICAgICAgICAgICAgbGV0IGluZHVjaW5nQmFsbG9vbjtcclxuICAgICAgICAgICAgbGV0IGJhbGxvb25MYWJlbDtcclxuICAgICAgICAgICAgaWYgKCB0aGlzLmJhbGxvb25Nb2RlbC5pbmR1Y2luZ0NoYXJnZUFuZFZpc2libGUoKSApIHtcclxuICAgICAgICAgICAgICBpbmR1Y2luZ0JhbGxvb24gPSB0aGlzLmJhbGxvb25Nb2RlbDtcclxuICAgICAgICAgICAgICBiYWxsb29uTGFiZWwgPSB0aGlzLmFjY2Vzc2libGVOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIGluZHVjaW5nQmFsbG9vbiA9IHRoaXMuYmFsbG9vbk1vZGVsLm90aGVyO1xyXG4gICAgICAgICAgICAgIGJhbGxvb25MYWJlbCA9IHRoaXMub3RoZXJBY2Nlc3NpYmxlTmFtZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW5kdWNlZENoYXJnZVN0cmluZyA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZURlc2NyaXB0aW9uKCBpbmR1Y2luZ0JhbGxvb24sIGJhbGxvb25MYWJlbCwgd2FsbFZpc2libGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpbmR1Y2VkQ2hhcmdlU3RyaW5nID0gV2FsbERlc2NyaWJlci5nZXRJbmR1Y2VkQ2hhcmdlRGVzY3JpcHRpb24oIHRoaXMuYmFsbG9vbk1vZGVsLCB0aGlzLmFjY2Vzc2libGVOYW1lLCB3YWxsVmlzaWJsZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gd3JhcCBpbmR1Y2VkIGNoYXJnZSBzdHJpbmcgd2l0aCBwdW5jdHVhdGlvblxyXG4gICAgICAgIGluZHVjZWRDaGFyZ2VTdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHsgc3RhdGVtZW50OiBpbmR1Y2VkQ2hhcmdlU3RyaW5nIH0gKTtcclxuXHJcbiAgICAgICAgY2hhcmdlU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCB3YWxsUnViQWxsUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgaW5kdWNlZENoYXJnZTogaW5kdWNlZENoYXJnZVN0cmluZ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBsZXQgd2FsbENoYXJnZVN0cmluZyA9IFdhbGxEZXNjcmliZXIuZ2V0V2FsbENoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsKCB0aGlzLm1vZGVsLnllbGxvd0JhbGxvb24sIHRoaXMubW9kZWwuZ3JlZW5CYWxsb29uLCB0aGlzLm1vZGVsLmdldEJhbGxvb25zQWRqYWNlbnQoKSwgd2FsbFZpc2libGUsIHNob3duQ2hhcmdlcyApO1xyXG4gICAgICAgIGxldCBiYWxsb29uQ2hhcmdlU3RyaW5nID0gQmFsbG9vbkNoYXJnZURlc2NyaWJlci5nZXRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uV2l0aExhYmVsKCB0aGlzLmJhbGxvb25Nb2RlbCwgc2hvd25DaGFyZ2VzLCB0aGlzLmFjY2Vzc2libGVOYW1lICk7XHJcblxyXG4gICAgICAgIC8vIGJhbGxvb24gY2hhcmdlIGRvZXNuJ3QgaW5jbHVkZSBwdW5jdHVhdGlvblxyXG4gICAgICAgIGJhbGxvb25DaGFyZ2VTdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHNpbmdsZVN0YXRlbWVudFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgIHN0YXRlbWVudDogYmFsbG9vbkNoYXJnZVN0cmluZ1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgd2FsbENoYXJnZVN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2luZ2xlU3RhdGVtZW50UGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgc3RhdGVtZW50OiB3YWxsQ2hhcmdlU3RyaW5nXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBpZiBiYWxsb29ucyBhcmUgYWRqYWNlbnQsIHRoZSByZWxhdGl2ZSBjaGFyZ2UgZGVzY3JpcHRpb24gZm9yIGJvdGggYmFsbG9vbnMgbXVzdCBiZSBpbmNsdWRlZFxyXG4gICAgICAgIGlmICggdGhpcy5tb2RlbC5nZXRCYWxsb29uc0FkamFjZW50KCkgKSB7XHJcbiAgICAgICAgICBiYWxsb29uQ2hhcmdlU3RyaW5nID0gdGhpcy5jaGFyZ2VEZXNjcmliZXIuZ2V0Q29tYmluZWRSZWxhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCk7XHJcbiAgICAgICAgICBiYWxsb29uQ2hhcmdlU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzaW5nbGVTdGF0ZW1lbnRQYXR0ZXJuU3RyaW5nLCB7IHN0YXRlbWVudDogYmFsbG9vbkNoYXJnZVN0cmluZyB9ICk7XHJcblxyXG4gICAgICAgICAgY2hhcmdlU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCB3YWxsUnViRGlmZlBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICAgICAgYmFsbG9vbkNoYXJnZTogYmFsbG9vbkNoYXJnZVN0cmluZyxcclxuICAgICAgICAgICAgd2FsbENoYXJnZTogd2FsbENoYXJnZVN0cmluZ1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNoYXJnZVN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggd2FsbFJ1YkRpZmZQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICAgIGJhbGxvb25DaGFyZ2U6IGJhbGxvb25DaGFyZ2VTdHJpbmcsXHJcbiAgICAgICAgICAgIHdhbGxDaGFyZ2U6IHdhbGxDaGFyZ2VTdHJpbmdcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGNvbWJpbmUgY2hhcmdlIGFuZCBwb3NpdGlvbiBwb3J0aW9ucyBvZiB0aGUgZGVzY3JpcHRpb24gZm9yICdhbGwnIGFuZCAnZGlmZicgY2hhcmdlIHZpZXdzXHJcbiAgICAgIGRlc2NyaXB0aW9uU3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCB3YWxsUnViUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHBvc2l0aW9uOiBhdFBvc2l0aW9uU3RyaW5nLFxyXG4gICAgICAgIGNoYXJnZTogY2hhcmdlU3RyaW5nXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgdGhlIHJ1YmJpbmcgaW50ZXJhY3Rpb24sIHdpdGggYSByZW1pbmRlciB0aGF0IHRoZSB3YWxsIGhhcyBtYW55IHBhaXJzIG9mIGNoYXJnZXMuXHJcbiAgICogV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2U6XHJcbiAgICogXCJBdCB1cHBlciB3YWxsLiBObyB0cmFuc2ZlciBvZiBjaGFyZ2UuIEluIHVwcGVyIHdhbGwsIG5vIGNoYW5nZSBpbiBjaGFyZ2VzLiBXYWxsIGhhcyBtYW55IHBhaXJzIG9mIG5lZ2F0aXZlXHJcbiAgICogYW5kIHBvc2l0aXZlIGNoYXJnZXMuXCJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0V2FsbFJ1YmJpbmdEZXNjcmlwdGlvbldpdGhDaGFyZ2VQYWlycygpIHtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHdhbGxSdWJiaW5nV2l0aFBhaXJzUGF0dGVybiwge1xyXG4gICAgICBydWJiaW5nQWxlcnQ6IHRoaXMuZ2V0V2FsbFJ1YmJpbmdEZXNjcmlwdGlvbigpXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGRlc2NyaXB0aW9uIHdoZW4gdGhlIGJhbGxvb24gaGFzIHBpY2tlZCB1cCB0aGUgbGFzdCBjaGFyZ2Ugb24gdGhlIHN3ZWF0ZXIuXHJcbiAgICogRGVwZW5kZW50IG9uIHRoZSBjaGFyZ2Ugdmlldy5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0TGFzdENoYXJnZVBpY2t1cERlc2NyaXB0aW9uKCkge1xyXG4gICAgY29uc3Qgc2hvd25DaGFyZ2VzID0gdGhpcy5zaG93Q2hhcmdlc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgY2hhcmdlID0gdGhpcy5iYWxsb29uTW9kZWwuY2hhcmdlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgY29uc3Qgc3dlYXRlckNoYXJnZVN0cmluZyA9IFN3ZWF0ZXJEZXNjcmliZXIuZ2V0Tm9Nb3JlQ2hhcmdlc0FsZXJ0KCBjaGFyZ2UsIHNob3duQ2hhcmdlcyApO1xyXG4gICAgY29uc3QgYmFsbG9vbkNoYXJnZVN0cmluZyA9IEJhbGxvb25DaGFyZ2VEZXNjcmliZXIuZ2V0UmVsYXRpdmVDaGFyZ2VEZXNjcmlwdGlvbldpdGhMYWJlbCggdGhpcy5iYWxsb29uTW9kZWwsIHNob3duQ2hhcmdlcywgdGhpcy5hY2Nlc3NpYmxlTmFtZSApO1xyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGxhc3RDaGFyZ2VQaWNrZWRVcFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgc3dlYXRlcjogc3dlYXRlckNoYXJnZVN0cmluZyxcclxuICAgICAgYmFsbG9vbjogYmFsbG9vbkNoYXJnZVN0cmluZ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gZm9yIHdoZW4gYSBiYWxsb29uIGlzIGFkZGVkIHRvIHRoZSBwbGF5IGFyZWEuIFdpbGwgY2hhbmdlIGRlcGVuZGluZyBvbiB3aGV0aGVyIGJhbGxvb24gaGFzIGJlZW5cclxuICAgKiBzdWNjZXNzZnVsbHkgbW92ZWQgYW5kIHdoZXRoZXIgdGhlIHR3byBiYWxsb29ucyBhcmUgYWRqYWNlbnQgdG8gZWFjaCBvdGhlci4gV2lsbCByZXR1cm4gc29tZXRoaW5nIGxpa2VcclxuICAgKiBcIkdyZWVuIGJhbGxvb24gYWRkZWQgdG8gcGxheSBhcmVhXCIgb3JcclxuICAgKiBcIkdyZWVuIGJhbGxvb24gYWRkZWQuIFN0aWNraW5nIHRvIGxlZnQgc2hvdWxkZXIgb2Ygc3dlYXRlci5cIiBvclxyXG4gICAqIFwiR3JlZW4gYmFsbG9vbiBhZGRlZC4gT24gbGVmdCBzaWRlIG9mIHBsYXkgYXJlYSwgbmV4dCB0byB5ZWxsb3cgYmFsbG9vbi5cIlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRWaXNpYmlsaXR5Q2hhbmdlZERlc2NyaXB0aW9uKCkge1xyXG4gICAgbGV0IGRlc2NyaXB0aW9uO1xyXG4gICAgY29uc3QgcG9zaXRpb25Qcm9wZXJ0eSA9IHRoaXMuYmFsbG9vbk1vZGVsLnBvc2l0aW9uUHJvcGVydHk7XHJcbiAgICBjb25zdCB2aXNpYmxlID0gdGhpcy5iYWxsb29uTW9kZWwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgaWYgKCAhdmlzaWJsZSApIHtcclxuXHJcbiAgICAgIC8vIGlmIHJlbW92ZWQsIHNpbXBseSBub3RpZnkgcmVtb3ZhbFxyXG4gICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vblJlbW92ZWRQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgYmFsbG9vbkxhYmVsOiB0aGlzLmFjY2Vzc2libGVOYW1lXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIHBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZXF1YWxzKCBwb3NpdGlvblByb3BlcnR5LmluaXRpYWxWYWx1ZSApICkge1xyXG5cclxuICAgICAgICAvLyBpZiBhZGQgYXQgaW5pdGlhbCBwb3NpdGlvbiwgZ2VuZXJpYyBzdHJpbmdcclxuICAgICAgICBkZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggYmFsbG9vbkFkZGVkUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgICAgYmFsbG9vbkxhYmVsOiB0aGlzLmFjY2Vzc2libGVOYW1lXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBpZiBub3QgYXQgaW5pdGlhbCBwb3NpdGlvbiwgaW5jbHVkZSBhdHRyYWN0aXZlIHN0YXRlIGFuZCBwb3NpdGlvblxyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBiYWxsb29uQWRkZWRXaXRoUG9zaXRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICBiYWxsb29uTGFiZWw6IHRoaXMuYWNjZXNzaWJsZU5hbWUsXHJcbiAgICAgICAgICBwb3NpdGlvbjogdGhpcy5tb3ZlbWVudERlc2NyaWJlci5nZXRBdHRyYWN0aXZlU3RhdGVBbmRQb3NpdGlvbkRlc2NyaXB0aW9uKClcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzY3JpcHRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwIHRoZSBkZXNjcmliZXIsIGRyaXZpbmcgYWxsIGFsZXJ0cyB0aGF0IGRlc2NyaWJlIGludGVyYWN0aW9ucyB3aXRoIHRoZSBiYWxsb29uIGFuZCBpdHMgaW5kZXBlbmRlbnRcclxuICAgKiBtb3ZlbWVudC4gSXQgYWxzbyBkZXNjcmliZXMgbGFjayBvZiBtb3ZlbWVudCBvciBpbnRlcmFjdGlvbiwgd2hpY2ggcmVxdWlyZXMgcG9sbGluZy4gUmF0aGVyIHRoYW4gaW1wbGVtZW50XHJcbiAgICogcG9ydGlvbnMgb2YgdGhpcyB3aXRoIHBvbGxpbmcgYW5kIG90aGVyIHBvcnRpb25zIHdpdGggUHJvcGVydHkgb2JzZXJ2ZXJzLCBpdCB3YXMgbW9yZSBzdHJhaWdodCBmb3J3YXJkXHJcbiAgICogdG8gaW1wbGVtZW50IGV2ZXJ5dGhpbmcgaW4gdGhpcyBzdGVwIGZ1bmN0aW9uLiBUaGUgYWx0ZXJuYXRpdmUgZGlzdHJpYnV0ZWQgdGhlIGltcGxlbWVudGF0aW9uIGFjcm9zcyBzZXZlcmFsXHJcbiAgICogZnVuY3Rpb25zLCBpdCBpcyBlYXNpZXIgdG8gbWFuYWdlIGhlcmUuIFRoZSBzYWNyaWZpY2UgaXMgdGhhdCB3ZSBoYXZlIHRvIHRyYWNrIHZhbHVlcyB3ZSBjYXJlIGFib3V0IGJlZm9yZSBhbmRcclxuICAgKiBhZnRlciBlYWNoIHN0ZXAuXHJcbiAgICpcclxuICAgKiBBZGRpbmcgZWFjaCBvZiB0aGVzZSBpbiB0aGUgc3RlcCBmdW5jdGlvbiBhbHNvIGxldHMgdXMgZGlyZWN0bHkgY29udHJvbCB0aGUgb3JkZXIgb2YgdGhlc2UgYWxlcnRzLiBUaGlzIGlzXHJcbiAgICogYmV0dGVyIHRoYW4gaGF2aW5nIFByb3BlcnR5IGxpc3RlbmVycyB0aGF0IG1pZ2h0IGdldCBjYWxsZWQgaW4gYW4gdW5kZXNpcmFibGUgb3JkZXIuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcblxyXG4gICAgLy8gZm9yIHJlYWRhYmlsaXR5XHJcbiAgICBsZXQgdXR0ZXJhbmNlID0gJyc7XHJcbiAgICBjb25zdCBtb2RlbCA9IHRoaXMuYmFsbG9vbk1vZGVsO1xyXG5cclxuICAgIC8vIGdyYWIgbmV4dCB2YWx1ZXMgdG8gZGVzY3JpYmVcclxuICAgIGNvbnN0IG5leHRWZWxvY2l0eSA9IG1vZGVsLnZlbG9jaXR5UHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBuZXh0RHJhZ1ZlbG9jaXR5ID0gbW9kZWwuZHJhZ1ZlbG9jaXR5UHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBtb2RlbC5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3QgbmV4dFZpc2libGUgPSBtb2RlbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IG5leHRUb3VjaGluZ1dhbGwgPSBtb2RlbC50b3VjaGluZ1dhbGxQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IG5leHRJc0RyYWdnZWQgPSBtb2RlbC5pc0RyYWdnZWRQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IG5leHRXYWxsVmlzaWJsZSA9IHRoaXMud2FsbC5pc1Zpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IG5leHRDaGFyZ2UgPSBtb2RlbC5jaGFyZ2VQcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGltZXJzIHRoYXQgZGV0ZXJtaW5lIHRoZSBuZXh0IHRpbWUgY2VydGFpbiBhbGVydHMgc2hvdWxkIGJlIGFubm91bmNlZFxyXG4gICAgdGhpcy50aW1lU2luY2VDaGFyZ2VBbGVydCArPSBkdCAqIDEwMDA7XHJcbiAgICBpZiAoICFtb2RlbC5pc0RyYWdnZWRQcm9wZXJ0eS5nZXQoKSApIHsgdGhpcy50aW1lU2luY2VSZWxlYXNlQWxlcnQgKz0gZHQgKiAxMDAwOyB9XHJcblxyXG4gICAgaWYgKCAhdGhpcy5zaG9ydE1vdmVtZW50RnJvbVBvaW50ZXIoKSApIHtcclxuXHJcbiAgICAgIC8vIGFsZXJ0cyByZWxhdGVkIHRvIGJhbGxvb24gZGlyZWN0aW9uXHJcbiAgICAgIGlmICggdGhpcy5kZXNjcmliZURpcmVjdGlvbiAmJlxyXG4gICAgICAgICAgIHRoaXMuYmFsbG9vbk1vZGVsLmRpcmVjdGlvblByb3BlcnR5LmdldCgpICYmXHJcbiAgICAgICAgICAgdGhpcy5kZXNjcmliZWREaXJlY3Rpb24gIT09IHRoaXMuYmFsbG9vbk1vZGVsLmRpcmVjdGlvblByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMuYmFsbG9vbk1vZGVsLmlzRHJhZ2dlZFByb3BlcnR5LmdldCgpIHx8IG1vZGVsLnRpbWVTaW5jZVJlbGVhc2UgPiBSRUxFQVNFX0RFU0NSSVBUSU9OX1RJTUVfREVMQVkgKSB7XHJcbiAgICAgICAgICB0aGlzLmRpcmVjdGlvblV0dGVyYW5jZS5hbGVydCA9IHRoaXMubW92ZW1lbnREZXNjcmliZXIuZ2V0RGlyZWN0aW9uQ2hhbmdlZERlc2NyaXB0aW9uKCk7XHJcblxyXG4gICAgICAgICAgdGhpcy5zZW5kQWxlcnQoIHRoaXMuZGlyZWN0aW9uVXR0ZXJhbmNlICk7XHJcbiAgICAgICAgICB0aGlzLmRlc2NyaWJlZERpcmVjdGlvbiA9IHRoaXMuYmFsbG9vbk1vZGVsLmRpcmVjdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYW5ub3VuY2UgYW4gYWxlcnQgdGhhdCBkZXNjcmliZXMgbGFjayBvZiBjaGFyZ2UgcGlja3VwIHdoaWwgcnViYmluZyBvbiBzd2VhdGVyXHJcbiAgICAgIGlmICggdGhpcy50aW1lU2luY2VDaGFyZ2VBbGVydCA+IENIQVJHRV9ERVNDUklQVElPTl9SRUZSRVNIX1JBVEUgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmNoYXJnZU9uU3RhcnREcmFnID09PSB0aGlzLmNoYXJnZU9uRW5kRHJhZyApIHtcclxuICAgICAgICAgIGlmICggdGhpcy5ydWJBbGVydERpcnR5ICkge1xyXG4gICAgICAgICAgICBpZiAoIG5leHRJc0RyYWdnZWQgJiYgbW9kZWwub25Td2VhdGVyKCkgKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5ub0NoYXJnZVBpY2t1cFV0dGVyYW5jZS5hbGVydCA9IHRoaXMuZ2V0Tm9DaGFyZ2VQaWNrdXBEZXNjcmlwdGlvbigpO1xyXG4gICAgICAgICAgICAgIHRoaXMuc2VuZEFsZXJ0KCB0aGlzLm5vQ2hhcmdlUGlja3VwVXR0ZXJhbmNlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWxlcnROZXh0UGlja3VwID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnRpbWVTaW5jZUNoYXJnZUFsZXJ0ID0gMDtcclxuICAgICAgICB0aGlzLnJ1YkFsZXJ0RGlydHkgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFsZXJ0cyByZWxhdGVkIHRvIGJhbGxvb24gY2hhcmdlXHJcbiAgICBpZiAoIHRoaXMuZGVzY3JpYmVkQ2hhcmdlICE9PSBuZXh0Q2hhcmdlICkge1xyXG4gICAgICBsZXQgYWxlcnQ7XHJcblxyXG4gICAgICAvLyB0aGUgZmlyc3QgY2hhcmdlIHBpY2t1cCBhbmQgc3Vic2VxdWVudCBwaWNrdXBzIChiZWhpbmQgYSByZWZyZXNoIHJhdGUpIHNob3VsZCBiZSBhbm5vdW5jZWRcclxuICAgICAgaWYgKCB0aGlzLmFsZXJ0TmV4dFBpY2t1cCB8fCB0aGlzLmFsZXJ0Rmlyc3RQaWNrdXAgKSB7XHJcbiAgICAgICAgYWxlcnQgPSB0aGlzLmdldENoYXJnZVBpY2t1cERlc2NyaXB0aW9uKCB0aGlzLmFsZXJ0Rmlyc3RQaWNrdXAgKTtcclxuICAgICAgICB0aGlzLmNoYXJnZVBpY2t1cFV0dGVyYW5jZS5hbGVydCA9IGFsZXJ0O1xyXG4gICAgICAgIHRoaXMuc2VuZEFsZXJ0KCB0aGlzLmNoYXJnZVBpY2t1cFV0dGVyYW5jZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhbm5vdW5jZSBwaWNrdXAgb2YgbGFzdCBjaGFyZ2UsIGFzIGxvbmcgYXMgY2hhcmdlcyBhcmUgdmlzaWJsZVxyXG4gICAgICBpZiAoIE1hdGguYWJzKCBuZXh0Q2hhcmdlICkgPT09IEJBU0VDb25zdGFudHMuTUFYX0JBTExPT05fQ0hBUkdFICYmIHRoaXMuc2hvd0NoYXJnZXNQcm9wZXJ0eS5nZXQoKSAhPT0gJ25vbmUnICkge1xyXG4gICAgICAgIGFsZXJ0ID0gdGhpcy5nZXRMYXN0Q2hhcmdlUGlja3VwRGVzY3JpcHRpb24oKTtcclxuICAgICAgICB0aGlzLmNoYXJnZVBpY2t1cFV0dGVyYW5jZS5hbGVydCA9IGFsZXJ0O1xyXG4gICAgICAgIHRoaXMuc2VuZEFsZXJ0KCB0aGlzLmNoYXJnZVBpY2t1cFV0dGVyYW5jZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXNldCBmbGFnc1xyXG4gICAgICB0aGlzLmFsZXJ0Rmlyc3RQaWNrdXAgPSBmYWxzZTtcclxuICAgICAgdGhpcy5hbGVydE5leHRQaWNrdXAgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhbGVydHMgdGhhdCBtaWdodCBzdGVtIGZyb20gY2hhbmdlcyB0byBiYWxsb29uIHZlbG9jaXR5IChpbmRlcGVuZGVudCBtb3ZlbWVudClcclxuICAgIGlmICggIW5leHRWZWxvY2l0eS5lcXVhbHMoIHRoaXMuZGVzY3JpYmVkVmVsb2NpdHkgKSApIHtcclxuICAgICAgaWYgKCBuZXh0VmVsb2NpdHkuZXF1YWxzKCBWZWN0b3IyLlpFUk8gKSApIHtcclxuICAgICAgICBpZiAoIG1vZGVsLmlzRHJhZ2dlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgICAgaWYgKCBtb2RlbC5vblN3ZWF0ZXIoKSB8fCBtb2RlbC50b3VjaGluZ1dhbGwoKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHdoaWxlIGRyYWdnaW5nLCBqdXN0IGF0dHJhY3RpdmUgc3RhdGUgYW5kIHBvc2l0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuc2VuZEFsZXJ0KCB0aGlzLm1vdmVtZW50RGVzY3JpYmVyLmdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb25XaXRoTGFiZWwoKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggbW9kZWwub25Td2VhdGVyKCkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gaWYgd2Ugc3RvcCBvbiB0aGUgc3dlYXRlciwgYW5ub3VuY2UgdGhhdCB3ZSBhcmUgc3RpY2tpbmcgdG8gaXRcclxuICAgICAgICAgIHRoaXMuc2VuZEFsZXJ0KCB0aGlzLm1vdmVtZW50RGVzY3JpYmVyLmdldEF0dHJhY3RpdmVTdGF0ZUFuZFBvc2l0aW9uRGVzY3JpcHRpb25XaXRoTGFiZWwoKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBpZiB3ZSBzdG9wIGFsb25nIGFueXdoZXJlIGVsc2UgaW4gdGhlIHBsYXkgYXJlYSwgZGVzY3JpYmUgdGhhdCBtb3ZlbWVudCBoYXMgc3RvcHBlZFxyXG4gICAgICAgICAgLy8gc3BlY2lhbCBjYXNlOiBpZiB0aGUgYmFsbG9vbiBpcyB0b3VjaGluZyB0aGUgd2FsbCBmb3IgdGhlIGZpcnN0IHRpbWUsIGRvbid0IGRlc2NyaWJlIHRoaXMgYmVjYXVzZVxyXG4gICAgICAgICAgLy8gdGhlIHNlY3Rpb24gb2YgdGhpcyBmdW5jdGlvbiBvYnNlcnZpbmcgdGhhdCBzdGF0ZSB3aWxsIGRlc2NyaWJlIHRoaXNcclxuICAgICAgICAgIGlmICggbmV4dFRvdWNoaW5nV2FsbCA9PT0gdGhpcy5kZXNjcmliZWRUb3VjaGluZ1dhbGwgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VuZEFsZXJ0KCB0aGlzLm1vdmVtZW50RGVzY3JpYmVyLmdldE1vdmVtZW50U3RvcHNEZXNjcmlwdGlvbigpICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWxlcnRzIHRoYXQgbWlnaHQgY29tZSBmcm9tIGNoYW5nZXMgdG8gYmFsbG9vbiBkcmFnIHZlbG9jaXR5XHJcbiAgICBpZiAoICFuZXh0RHJhZ1ZlbG9jaXR5LmVxdWFscyggdGhpcy5kZXNjcmliZWREcmFnVmVsb2NpdHkgKSApIHtcclxuXHJcbiAgICAgIC8vIGlmIHdlIHN0YXJ0IGZyb20gemVybywgd2UgYXJlIGluaXRpYXRpbmcgYSBkcmFnIC0gdXBkYXRlIHRoZSBjaGFyZ2Ugb24gc3RhcnQgZm9yIHRoaXMgY2FzZSBhbmQgc3RhcnRcclxuICAgICAgLy8gZGVzY3JpYmluZyB3YWxsIHJ1YnNcclxuICAgICAgaWYgKCB0aGlzLmRlc2NyaWJlZERyYWdWZWxvY2l0eS5lcXVhbHMoIFZlY3RvcjIuWkVSTyApICkge1xyXG4gICAgICAgIHRoaXMuZGVzY3JpYmVXYWxsUnViID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgdGhlIGRyYWcgdmVsb2NpdHkgaXMgemVybywgZGVzY3JpYmUgaG93IHRoZSBwb3NpdGlvbiBoYXMgY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCBkcmFnIC0gdGhpcyBpcyBwcmVmZXJhYmxlXHJcbiAgICAgIC8vIHRvIGFsZXJ0aW5nIGV2ZXJ5IHBvc2l0aW9uIGJlY2F1c2UgMSkgaXQgcmVkdWNlcyB0aGUgbnVtYmVyIG9mIGFsZXJ0cyB0aGF0IG9jY3VyIGFuZCAyKSBpdCB3YWl0cyB1bnRpbFxyXG4gICAgICAvLyBhIHVzZXIgaGFzIGZpbmlzaGVkIGludGVyYWN0aW5nIHRvIG1ha2UgYW4gYW5ub3VuY2VtZW50LCBhbmQgQVQgcHJvZHVjZSBnYXJibGVkL2ludGVycnVwdGVkIG91dHB1dCBpZlxyXG4gICAgICAvLyB1c2VyIG1ha2VzIGFuIGludGVyYWN0aW9uIHdoaWxlIGEgbmV3IGFsZXJ0IGlzIGJlaW5nIGFubm91bmNlZFxyXG4gICAgICBpZiAoIG1vZGVsLmlzRHJhZ2dlZFByb3BlcnR5LmdldCgpICYmIG5leHREcmFnVmVsb2NpdHkuZXF1YWxzKCBWZWN0b3IyLlpFUk8gKSAmJiAhdGhpcy5zaG9ydE1vdmVtZW50RnJvbVBvaW50ZXIoKSApIHtcclxuXHJcbiAgICAgICAgLy8gaWdub3JlIGNoYW5nZXMgdGhhdCBvY2N1ciB3aGlsZSB0aGUgdXNlciBpcyBcImp1bXBpbmdcIiB0aGUgYmFsbG9vbiAodXNpbmcgaG90a2V5cyB0byBzbmFwIHRvIGEgbmV3IHBvc2l0aW9uKVxyXG4gICAgICAgIGlmICggIW1vZGVsLmp1bXBpbmcgKSB7XHJcblxyXG4gICAgICAgICAgLy8gaG93IG11Y2ggYmFsbG9vbiBoYXMgbW92ZWQgaW4gYSBzaW5nbGUgZHJhZ1xyXG4gICAgICAgICAgY29uc3QgZHJhZ0RlbHRhID0gbmV4dFBvc2l0aW9uLm1pbnVzKCB0aGlzLm9sZERyYWdQb3NpdGlvbiApO1xyXG5cclxuICAgICAgICAgIC8vIHdoZW4gd2UgY29tcGxldGUgYSBrZXlib2FyZCBkcmFnLCBzZXQgdGltZXIgdG8gcmVmcmVzaCByYXRlIHNvIHRoYXQgd2UgdHJpZ2dlciBhIG5ldyBkZXNjcmlwdGlvbiBuZXh0XHJcbiAgICAgICAgICAvLyB0aW1lIHdlIG1vdmUgdGhlIGJhbGxvb25cclxuICAgICAgICAgIHRoaXMudGltZVNpbmNlQ2hhcmdlQWxlcnQgPSBDSEFSR0VfREVTQ1JJUFRJT05fUkVGUkVTSF9SQVRFO1xyXG5cclxuICAgICAgICAgIC8vIGlmIGluIHRoZSBwbGF5IGFyZWEsIGluZm9ybWF0aW9uIGFib3V0IG1vdmVtZW50IHRocm91Z2ggdGhlIHBsYXkgYXJlYVxyXG4gICAgICAgICAgY29uc3QgaW5MYW5kbWFyayA9IFBsYXlBcmVhTWFwLmluTGFuZG1hcmtDb2x1bW4oIG1vZGVsLmdldENlbnRlcigpICk7XHJcbiAgICAgICAgICBjb25zdCBvblN3ZWF0ZXIgPSBtb2RlbC5vblN3ZWF0ZXIoKTtcclxuICAgICAgICAgIGNvbnN0IHRvdWNoaW5nV2FsbCA9IG1vZGVsLnRvdWNoaW5nV2FsbCgpO1xyXG4gICAgICAgICAgaWYgKCAhaW5MYW5kbWFyayAmJiAhb25Td2VhdGVyICYmICF0b3VjaGluZ1dhbGwgKSB7XHJcbiAgICAgICAgICAgIHV0dGVyYW5jZSA9IHRoaXMubW92ZW1lbnREZXNjcmliZXIuZ2V0S2V5Ym9hcmRNb3ZlbWVudEFsZXJ0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggaW5MYW5kbWFyayApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGp1c3QgYW5ub3VuY2UgbGFuZG1hcmsgYXMgd2UgbW92ZSB0aHJvdWdoIGl0XHJcbiAgICAgICAgICAgIHV0dGVyYW5jZSA9IHRoaXMubW92ZW1lbnREZXNjcmliZXIuZ2V0TGFuZG1hcmtEcmFnRGVzY3JpcHRpb24oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBtb2RlbC50b3VjaGluZ1dhbGwoKSAmJiB0aGlzLmRlc2NyaWJlV2FsbFJ1YiApIHtcclxuICAgICAgICAgICAgdXR0ZXJhbmNlID0gdGhpcy5nZXRXYWxsUnViYmluZ0Rlc2NyaXB0aW9uKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCB1dHRlcmFuY2UgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBhc3NpZ24gYW4gaWQgc28gdGhhdCB3ZSBvbmx5IGFubm91bmNlIHRoZSBtb3N0IHJlY2VudCBhbGVydCBpbiB0aGUgdXR0ZXJhbmNlUXVldWVcclxuICAgICAgICAgICAgdGhpcy5tb3ZlbWVudFV0dGVyYW5jZS5hbGVydCA9IHV0dGVyYW5jZTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kQWxlcnQoIHRoaXMubW92ZW1lbnRVdHRlcmFuY2UgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBkZXNjcmliZSB0aGUgY2hhbmdlIGluIGluZHVjZWQgY2hhcmdlIGR1ZSB0byBiYWxsb29uIGRyYWdnaW5nXHJcbiAgICAgICAgICBpZiAoIHRoaXMuY2hhcmdlRGVzY3JpYmVyLmRlc2NyaWJlSW5kdWNlZENoYXJnZUNoYW5nZSgpICkge1xyXG4gICAgICAgICAgICB1dHRlcmFuY2UgPSAnJztcclxuICAgICAgICAgICAgY29uc3Qgd2FsbFZpc2libGUgPSB0aGlzLndhbGwuaXNWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJhbGxvb25Nb2RlbC5pc0NoYXJnZWQoKSwgJ2JhbGxvb24gc2hvdWxkIGJlIGNoYXJnZWQgdG8gZGVzY3JpYmUgaW5kdWNlZCBjaGFyZ2UnICk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBwdXJlbHkgdmVydGljYWwgbW90aW9uLCBkbyBub3QgaW5jbHVkZSBpbmZvcm1hdGlvbiBhYm91dCBhbW91bnQgb2YgY2hhcmdlIGRpc3BsYWNlbWVudFxyXG4gICAgICAgICAgICBpZiAoIGRyYWdEZWx0YS54ID09PSAwICkge1xyXG4gICAgICAgICAgICAgIHV0dGVyYW5jZSA9IFdhbGxEZXNjcmliZXIuZ2V0SW5kdWNlZENoYXJnZURlc2NyaXB0aW9uV2l0aE5vQW1vdW50KCBtb2RlbCwgdGhpcy5hY2Nlc3NpYmxlTmFtZSwgd2FsbFZpc2libGUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICB1dHRlcmFuY2UgPSB0aGlzLmNoYXJnZURlc2NyaWJlci5nZXRJbmR1Y2VkQ2hhcmdlQ2hhbmdlRGVzY3JpcHRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pbmR1Y2VkQ2hhcmdlQ2hhbmdlVXR0ZXJhbmNlLmFsZXJ0ID0gdXR0ZXJhbmNlO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmRBbGVydCggdGhpcy5pbmR1Y2VkQ2hhcmdlQ2hhbmdlVXR0ZXJhbmNlICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gdXBkYXRlIGZsYWdzIHRoYXQgaW5kaWNhdGUgd2hpY2ggYWxlcnRzIHNob3VsZCBjb21lIG5leHRcclxuICAgICAgICAgIHRoaXMucnViQWxlcnREaXJ0eSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpZiB2ZWxvY2l0eSBoYXMganVzdCBiZWNvbWUgemVybyBhZnRlciBhIGp1bXAsIHdlIGp1c3QgY29tcGxldGVkIGEganVtcGluZyBpbnRlcmFjdGlvblxyXG4gICAgICAgIGlmICggbW9kZWwuanVtcGluZyApIHtcclxuICAgICAgICAgIG1vZGVsLmp1bXBpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgb2xkIGRyYWdnaW5nIHBvc2l0aW9uIGZvciBuZXh0IHRpbWUsIGNvcHkgc28gd2UgY2FuIGNvbXBhcmUgYnkgdmFsdWVcclxuICAgICAgICB0aGlzLm9sZERyYWdQb3NpdGlvbiA9IG5leHRQb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBkZXNjcmliZSBhbnkgdXBkYXRlcyB0aGF0IG1pZ2h0IGNvbWUgZnJvbSB0aGUgYmFsbG9vbiB0b3VjaGVzIG9yIGxlYXZlcyB0aGUgd2FsbCAtIGRvbid0IGRlc2NyaWJlIGlmIHdlIGFyZVxyXG4gICAgLy8gY3VycmVudGx5IHRvdWNoaW5nIHRoZSBiYWxsb29uIHNpbmNlIHRoZSBqdW1wIHdpbGwgZ2VuZXJhdGUgYSB1bmlxdWUgYWxlcnRcclxuICAgIGlmICggdGhpcy5kZXNjcmliZWRUb3VjaGluZ1dhbGwgIT09IG5leHRUb3VjaGluZ1dhbGwgKSB7XHJcbiAgICAgIGlmICggIW1vZGVsLmp1bXBpbmcgKSB7XHJcbiAgICAgICAgaWYgKCBuZXh0VG91Y2hpbmdXYWxsICkge1xyXG4gICAgICAgICAgaWYgKCBtb2RlbC5pc0RyYWdnZWRQcm9wZXJ0eS5nZXQoKSAmJiB0aGlzLnNob3dDaGFyZ2VzUHJvcGVydHkuZ2V0KCkgPT09ICdhbGwnICkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbmRBbGVydCggdGhpcy5nZXRXYWxsUnViYmluZ0Rlc2NyaXB0aW9uV2l0aENoYXJnZVBhaXJzKCkgKTtcclxuICAgICAgICAgICAgdGhpcy5kZXNjcmliZVdhbGxSdWIgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gZ2VuZXJhdGVzIGEgZGVzY3JpcHRpb24gb2YgaG93IHRoZSBiYWxsb29uIGludGVyYWN0cyB3aXRoIHRoZSB3YWxsXHJcbiAgICAgICAgICAgIGlmICggbmV4dFZpc2libGUgKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zZW5kQWxlcnQoIHRoaXMubW92ZW1lbnREZXNjcmliZXIuZ2V0TW92ZW1lbnRTdG9wc0Rlc2NyaXB0aW9uKCkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFueSBhbGVydHMgdGhhdCBtaWdodCBiZSBnZW5lcmF0ZWQgd2hlbiB0aGUgYmFsbG9vbiBpcyBwaWNrZWQgdXAgYW5kIHJlbGVhc2VkXHJcbiAgICBpZiAoIHRoaXMuZGVzY3JpYmVkSXNEcmFnZ2VkICE9PSBuZXh0SXNEcmFnZ2VkICkge1xyXG4gICAgICB1dHRlcmFuY2UgPSAnJztcclxuXHJcbiAgICAgIGlmICggbmV4dElzRHJhZ2dlZCApIHtcclxuICAgICAgICB1dHRlcmFuY2UgPSB0aGlzLm1vdmVtZW50RGVzY3JpYmVyLmdldEdyYWJiZWRBbGVydCgpO1xyXG4gICAgICAgIHRoaXMuZ3JhYlJlbGVhc2VVdHRlcmFuY2UuYWxlcnQgPSB1dHRlcmFuY2U7XHJcbiAgICAgICAgdGhpcy5zZW5kQWxlcnQoIHRoaXMuZ3JhYlJlbGVhc2VVdHRlcmFuY2UgKTtcclxuXHJcbiAgICAgICAgLy8gd2UgaGF2ZSBiZWVuIHBpY2tlZCB1cCBzdWNjZXNzZnVsbHksIHN0YXJ0IGRlc2NyaWJpbmcgZGlyZWN0aW9uXHJcbiAgICAgICAgdGhpcy5kZXNjcmliZURpcmVjdGlvbiA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGRvbid0IGRlc2NyaWJlIGRpcmVjdGlvbiB1bnRpbCBpbml0aWFsIHJlbGVhc2UgZGVzY3JpcHRpb24gaGFwcGVuc1xyXG4gICAgICAgIHRoaXMuZGVzY3JpYmVEaXJlY3Rpb24gPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmVzZXQgZmxhZ3MgdGhhdCB0cmFjayBkZXNjcmlwdGlvbiBjb250ZW50XHJcbiAgICAgIHRoaXMuaW5pdGlhbE1vdmVtZW50RGVzY3JpYmVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYW55IGJhbGxvb24gc3BlY2lmaWMgYWxlcnRzIHRoYXQgbWlnaHQgY29tZSBmcm9tIGNoYW5nZXMgdG8gd2FsbCB2aXNpYmlsaXR5XHJcbiAgICBpZiAoIHRoaXMuZGVzY3JpYmVkV2FsbFZpc2libGUgIT09IG5leHRXYWxsVmlzaWJsZSApIHtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSB3YWxsIGlzIHJlbW92ZWQgd2hpbGUgYSBiYWxsb29uIGlzIHRvdWNoaW5nIHRoZSB3YWxsLCB3ZSB3aWxsIG5lZWQgdG8gZGVzY3JpYmUgaG93IHRoZSBiYWxsb29uXHJcbiAgICAgIC8vIHJlc3BvbmRzLCBqdXN0IGxpa2UgYSByZWxlYXNlXHJcbiAgICAgIGlmICggIW5leHRXYWxsVmlzaWJsZSAmJiB0aGlzLmRlc2NyaWJlZFRvdWNoaW5nV2FsbCApIHtcclxuICAgICAgICB0aGlzLmluaXRpYWxNb3ZlbWVudERlc2NyaWJlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYW55IGNoYW5nZXMgdG8gcG9zaXRpb24gZnJvbSBpbmRlcGVuZGVudCBiYWxsb29uIG1vdmVtZW50IChub3QgZHJhZ2dpbmcpXHJcbiAgICBpZiAoIG5leHRWaXNpYmxlICYmICFuZXh0SXNEcmFnZ2VkICkge1xyXG4gICAgICB1dHRlcmFuY2UgPSAnJztcclxuXHJcbiAgICAgIGlmICggIXRoaXMuaW5pdGlhbE1vdmVtZW50RGVzY3JpYmVkICkge1xyXG4gICAgICAgIGlmICggbW9kZWwudGltZVNpbmNlUmVsZWFzZSA+IFJFTEVBU0VfREVTQ1JJUFRJT05fVElNRV9ERUxBWSApIHtcclxuXHJcbiAgICAgICAgICB0aGlzLmluaXRpYWxNb3ZlbWVudERlc2NyaWJlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgLy8gZ2V0IHRoZSBpbml0aWFsIGFsZXJ0IGRlc2NyaWJpbmcgYmFsbG9vbiByZWxlYXNlXHJcbiAgICAgICAgICBpZiAoICFuZXh0VmVsb2NpdHkuZXF1YWxzKCBWZWN0b3IyLlpFUk8gKSApIHtcclxuXHJcbiAgICAgICAgICAgIHV0dGVyYW5jZSA9IHRoaXMubW92ZW1lbnREZXNjcmliZXIuZ2V0SW5pdGlhbFJlbGVhc2VEZXNjcmlwdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmRBbGVydCggdXR0ZXJhbmNlICk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzY3JpYmVkRGlyZWN0aW9uID0gdGhpcy5iYWxsb29uTW9kZWwuZGlyZWN0aW9uUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBhZnRlciBkZXNjcmliaW5nIGluaXRpYWwgbW92ZW1lbnQsIGNvbnRpbnVlIHRvIGRlc2NyaWJlIGRpcmVjdGlvbiBjaGFuZ2VzXHJcbiAgICAgICAgICAgIHRoaXMuZGVzY3JpYmVEaXJlY3Rpb24gPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIG5leHRWZWxvY2l0eS5lcXVhbHMoIFZlY3RvcjIuWkVSTyApICkge1xyXG5cclxuICAgICAgICAgICAgLy8gZGVzY3JpYmUgdGhhdCB0aGUgYmFsbG9vbiB3YXMgcmVsZWFzZWQgYW5kIHRoZXJlIHdhcyBubyByZXN1bHRpbmcgbW92ZW1lbnQgLSBidXQgZG9uJ3QgZGVzY3JpYmUgdGhpc1xyXG4gICAgICAgICAgICAvLyB3aGVuIHRoZSBiYWxsb29uIGlzIGZpcnN0IGFkZGVkIHRvIHRoZSBwbGF5IGFyZWFcclxuICAgICAgICAgICAgaWYgKCAhdGhpcy5wcmV2ZW50Tm9Nb3ZlbWVudEFsZXJ0ICkge1xyXG4gICAgICAgICAgICAgIHV0dGVyYW5jZSA9IHRoaXMubW92ZW1lbnREZXNjcmliZXIuZ2V0Tm9DaGFuZ2VSZWxlYXNlRGVzY3JpcHRpb24oKTtcclxuICAgICAgICAgICAgICB0aGlzLnNlbmRBbGVydCggdXR0ZXJhbmNlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wcmV2ZW50Tm9Nb3ZlbWVudEFsZXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gcmVzZXQgdGltZXIgZm9yIHJlbGVhc2UgYWxlcnRcclxuICAgICAgICAgIHRoaXMudGltZVNpbmNlUmVsZWFzZUFsZXJ0ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHRoaXMudGltZVNpbmNlUmVsZWFzZUFsZXJ0ID4gUkVMRUFTRV9ERVNDUklQVElPTl9SRUZSRVNIX1JBVEUgKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIHRoZSBiYWxsb29uIGlzIG1vdmluZyBzbG93bHksIGFsZXJ0IGEgY29udGludW91cyBtb3ZlbWVudCBkZXNjcmlwdGlvblxyXG4gICAgICAgIGlmICggdGhpcy5tb3ZlbWVudERlc2NyaWJlci5iYWxsb29uTW92aW5nQXRDb250aW51b3VzRGVzY3JpcHRpb25WZWxvY2l0eSgpICkge1xyXG4gICAgICAgICAgdXR0ZXJhbmNlID0gdGhpcy5tb3ZlbWVudERlc2NyaWJlci5nZXRDb250aW51b3VzUmVsZWFzZURlc2NyaXB0aW9uKCk7XHJcbiAgICAgICAgICB0aGlzLnNlbmRBbGVydCggdXR0ZXJhbmNlICk7XHJcblxyXG4gICAgICAgICAgLy8gcmVzZXQgdGltZXJcclxuICAgICAgICAgIHRoaXMudGltZVNpbmNlUmVsZWFzZUFsZXJ0ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdmFyaWFibGVzIGZvciBuZXh0IHN0ZXBcclxuICAgIHRoaXMuZGVzY3JpYmVkVmVsb2NpdHkgPSBuZXh0VmVsb2NpdHk7XHJcbiAgICB0aGlzLmRlc2NyaWJlZERyYWdWZWxvY2l0eSA9IG5leHREcmFnVmVsb2NpdHk7XHJcbiAgICB0aGlzLmRlc2NyaWJlZFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xyXG4gICAgdGhpcy5kZXNjcmliZWRWaXNpYmxlID0gbmV4dFZpc2libGU7XHJcbiAgICB0aGlzLmRlc2NyaWJlZFRvdWNoaW5nV2FsbCA9IG5leHRUb3VjaGluZ1dhbGw7XHJcbiAgICB0aGlzLmRlc2NyaWJlZElzRHJhZ2dlZCA9IG5leHRJc0RyYWdnZWQ7XHJcbiAgICB0aGlzLmRlc2NyaWJlZFdhbGxWaXNpYmxlID0gbmV4dFdhbGxWaXNpYmxlO1xyXG4gICAgdGhpcy5kZXNjcmliZWRDaGFyZ2UgPSBuZXh0Q2hhcmdlO1xyXG4gIH1cclxufVxyXG5cclxuYmFsbG9vbnNBbmRTdGF0aWNFbGVjdHJpY2l0eS5yZWdpc3RlciggJ0JhbGxvb25EZXNjcmliZXInLCBCYWxsb29uRGVzY3JpYmVyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCYWxsb29uRGVzY3JpYmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxPQUFPQyxXQUFXLE1BQU0sa0RBQWtEO0FBQzFFLE9BQU9DLE9BQU8sTUFBTSxvRUFBb0U7QUFDeEYsT0FBT0MsaUJBQWlCLE1BQU0sd0RBQXdEO0FBQ3RGLE9BQU9DLFNBQVMsTUFBTSxnREFBZ0Q7QUFDdEUsT0FBT0MsNEJBQTRCLE1BQU0sMENBQTBDO0FBQ25GLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxXQUFXLE1BQU0sNEJBQTRCO0FBQ3BELE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUNoRSxPQUFPQyx3QkFBd0IsTUFBTSwrQkFBK0I7QUFDcEUsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFDcEQsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxNQUFNQyxrQ0FBa0MsR0FBR1IsZUFBZSxDQUFDUyw0QkFBNEIsQ0FBQ0MsS0FBSztBQUM3RixNQUFNQyw4QkFBOEIsR0FBR1gsZUFBZSxDQUFDWSx3QkFBd0IsQ0FBQ0YsS0FB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