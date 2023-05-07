// Copyright 2022-2023, University of Colorado Boulder

/**
 * Manages creation, dragging, positioning of CardNode instances.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import { LinearGradient, Node, Text } from '../../../../scenery/js/imports.js';
import CardNode from './CardNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Range from '../../../../dot/js/Range.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Panel from '../../../../sun/js/Panel.js';
import CAVConstants from '../../common/CAVConstants.js';
import CenterAndVariabilityStrings from '../../CenterAndVariabilityStrings.js';
import MedianBarNode from '../../common/view/MedianBarNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import Easing from '../../../../twixt/js/Easing.js';
import Animation from '../../../../twixt/js/Animation.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import AsyncCounter from '../../common/model/AsyncCounter.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import DragIndicatorArrowNode from '../../common/view/DragIndicatorArrowNode.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';

// constants
const CARD_SPACING = 10;
const getCardPositionX = index => index * (CardNode.CARD_WIDTH + CARD_SPACING);
export default class CardNodeContainer extends Node {
  // Each card is associated with one "cell", no two cards can be associated with the same cell.  The leftmost cell is 0.
  // The cells linearly map to locations across the screen.
  cardNodeCells = [];

  // Fires if the cardNodeCells may have changed
  cardNodeCellsChangedEmitter = new Emitter();
  medianBarNode = new MedianBarNode({
    notchDirection: 'up',
    barStyle: 'split'
  });

  // Indicates whether the user has ever dragged a card. It's used to hide the drag indicator arrow after
  // the user dragged a card
  cardLayer = new Node();
  isReadyForCelebration = false;
  remainingCelebrationAnimations = [];
  dataSortedNodeAnimation = null;
  wasSortedBefore = true;
  constructor(model, options) {
    super(options);
    this.model = model;

    // TODO-UX: maybe this should be converted to track distance for individual cards, see https://github.com/phetsims/center-and-variability/issues/111
    // Accumulated card drag distance, for purposes of hiding the drag indicator node
    const totalDragDistanceProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('totalDragDistanceProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'For PhET-iO internal use only. Accumulated card drag distance, for purposes of hiding the drag indicator node'
    });
    this.hasDraggedCardProperty = new DerivedProperty([totalDragDistanceProperty], totalDragDistance => {
      return totalDragDistance > 15;
    });
    this.cardNodes = model.cards.map((cardModel, index) => {
      const cardNode = new CardNode(cardModel, new Vector2(0, 0), () => this.getDragRange(), {
        tandem: options.tandem.createTandem('cardNodes').createTandem('cardNode' + index)
      });
      this.cardLayer.addChild(cardNode);

      // Update the position of all cards (via animation) whenever any card is dragged
      cardNode.positionProperty.link(this.createDragPositionListener(cardNode));

      // When a card is dropped, send it to its home cell
      cardNode.dragListener.isPressedProperty.link(isPressed => {
        if (isPressed) {
          // TODO: multitouch concerns.  Should it be null|true|false?  Or maybe after celebration, set it to true because we know it is sorted?
          this.wasSortedBefore = this.isDataSorted();
        }
        if (!isPressed && !phet.joist.sim.isSettingPhetioStateProperty.value) {
          // Animate the dropped card home
          this.animateToHomeCell(cardNode, 0.2);
          if (this.isReadyForCelebration) {
            const inProgressAnimations = this.cardNodeCells.filter(cardNode => cardNode.animation).map(cardNode => cardNode.animation);

            // Setup a callback for animation when all current animations finish
            const asyncCounter = new AsyncCounter(inProgressAnimations.length, () => {
              // we know at least one card exists because we're in a dragListener link
              const leftmostCard = this.cardNodeCells[0];
              if (leftmostCard) {
                dataSortedNode.centerX = getCardPositionX((this.cardNodeCells.length - 1) / 2) + leftmostCard.width / 2;
                dataSortedNode.bottom = leftmostCard.top - 7;
              } else {
                dataSortedNode.centerX = getCardPositionX((this.cardNodeCells.length - 1) / 2);
                dataSortedNode.bottom = -7.5;
              }
              if (dataSortedNode.left < 0) {
                dataSortedNode.left = 0;
              }
              dataSortedNode.visible = true;
              dataSortedNode.opacity = 1;

              // If the user sorted the data again before the data sorted message was hidden, clear out the timer.
              if (this.dataSortedNodeAnimation) {
                this.dataSortedNodeAnimation.stop();
              }

              // start a timer to hide the data sorted node
              this.dataSortedNodeAnimation = new Animation({
                duration: 0.6,
                delay: 2,
                targets: [{
                  property: dataSortedNode.opacityProperty,
                  to: 0,
                  easing: Easing.QUADRATIC_IN_OUT
                }]
              });
              this.dataSortedNodeAnimation.finishEmitter.addListener(() => {
                dataSortedNode.visible = false;
                this.dataSortedNodeAnimation = null;
              });
              this.dataSortedNodeAnimation.start();
              const cardBeingDragged = this.cardNodeCells.filter(cardNode => cardNode.dragListener.isPressed).length;
              const cardsAnimating = this.cardNodeCells.filter(cardNode => cardNode.animation).length;
              if (cardBeingDragged === 0 && cardsAnimating === 0) {
                this.pickable = false;
                this.animateRandomCelebration(() => {
                  this.isReadyForCelebration = false;
                  this.pickable = true;
                });
              }
            });

            // Notify the asyncCounter when any in-progress animation finishes
            inProgressAnimations.forEach(animation => {
              animation.endedEmitter.addListener(() => asyncCounter.increment());
            });
          }
        }
      });

      // Accumulate drag distance
      cardNode.dragDistanceEmitter.addListener(distance => {
        totalDragDistanceProperty.value += distance;
      });
      cardModel.isActiveProperty.link(isActive => {
        if (isActive && !phet.joist.sim.isSettingPhetioStateProperty.value) {
          let targetIndex = this.cardNodeCells.length;
          if (this.model.isSortingDataProperty.value) {
            const newValue = cardNode.soccerBall.valueProperty.value;
            const existingLowerCardNodes = this.cardNodeCells.filter(cardNode => cardNode.soccerBall.valueProperty.value <= newValue);
            const lowerNeighborCardNode = _.maxBy(existingLowerCardNodes, cardNode => this.cardNodeCells.indexOf(cardNode));
            targetIndex = lowerNeighborCardNode ? this.cardNodeCells.indexOf(lowerNeighborCardNode) + 1 : 0;
          }
          this.cardNodeCells.splice(targetIndex, 0, cardNode);
          this.setAtHomeCell(cardNode);

          // Animate all displaced cards
          for (let i = targetIndex; i < this.cardNodeCells.length; i++) {
            this.animateToHomeCell(this.cardNodeCells[i]);
          }
          this.cardNodeCellsChangedEmitter.emit();
        }
      });
      return cardNode;
    });
    this.addChild(this.medianBarNode);
    const objectCreatedListener = soccerBall => {
      // A ball landed OR a value changed
      soccerBall.valueProperty.link(value => {
        if (this.model.isSortingDataProperty.value && value !== null) {
          this.sortData();
        }
      });
    };
    model.selectedSceneModelProperty.value.getActiveSoccerBalls().forEach(objectCreatedListener);
    model.isSortingDataProperty.link(isSortingData => {
      if (isSortingData) {
        this.sortData();
      }
    });
    const dataSortedTextNode = new Text(CenterAndVariabilityStrings.youSortedTheDataStringProperty, {
      font: new PhetFont(15)
    });
    const dataSortedNode = new Panel(dataSortedTextNode, {
      stroke: null,
      cornerRadius: 4,
      lineWidth: 2,
      visible: false
    });

    // create a rotated linear gradient
    const gradientMargin = 20;
    const startPoint = new Vector2(dataSortedNode.left + gradientMargin, dataSortedNode.top + gradientMargin);
    const endPoint = new Vector2(dataSortedNode.right - gradientMargin, dataSortedNode.bottom - gradientMargin);
    const gradient = new LinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    gradient.addColorStop(0, '#fa9696');
    gradient.addColorStop(0.2, '#ffa659');
    gradient.addColorStop(0.4, '#ebd75e');
    gradient.addColorStop(0.6, '#8ce685');
    gradient.addColorStop(0.8, '#7fd7f0');
    gradient.addColorStop(1, '#927feb');
    gradient.setTransformMatrix(Matrix3.rotationAroundPoint(Math.PI / 4 * 1.2, dataSortedNode.center));
    dataSortedNode.stroke = gradient;
    this.addChild(dataSortedNode);
    this.addChild(this.cardLayer);
    this.dragIndicatorArrowNode = new DragIndicatorArrowNode({
      tandem: options.tandem.createTandem('dragIndicatorArrowNode')
    });

    // Add or remove the arrow node child
    const dragIndicatorContainer = new Node();
    this.addChild(dragIndicatorContainer);
    const updateDragIndicator = () => {
      const leftCard = this.cardNodeCells[0];
      const rightCard = this.cardNodeCells[1];
      const hasPressedCard = this.hasDraggedCardProperty.value;
      const newChildren = leftCard && rightCard && !hasPressedCard ? [this.dragIndicatorArrowNode] : [];
      if (newChildren.length !== dragIndicatorContainer.children.length) {
        dragIndicatorContainer.children = newChildren;
        if (leftCard && rightCard) {
          this.dragIndicatorArrowNode.centerBottom = leftCard.bounds.centerTop.plusXY(0, -8);
        }
      }
    };
    this.cardNodeCellsChangedEmitter.addListener(updateDragIndicator);
    this.hasDraggedCardProperty.link(updateDragIndicator);
    const medianTextNode = new Text(new PatternStringProperty(CenterAndVariabilityStrings.medianEqualsValuePatternStringProperty, {
      value: model.selectedSceneModelProperty.value.medianValueProperty
    }), {
      font: CAVConstants.MAIN_FONT,
      maxWidth: 300
    });
    const medianReadoutPanel = new Panel(medianTextNode, {
      stroke: 'lightgray',
      lineWidth: 0.6,
      cornerRadius: 4
    });
    this.addChild(medianReadoutPanel);
    const updateMedianNode = () => {
      const leftmostCard = this.cardNodeCells[0];
      const MARGIN_X = CARD_SPACING / 2 - MedianBarNode.HALF_SPLIT_WIDTH;
      const MARGIN_Y = 5;

      // Only redraw the shape if the feature is selected and the data is sorted, and there is at least one card
      if (model.isShowingTopMedianProperty.value && this.isDataSorted() && leftmostCard) {
        const barY = leftmostCard.bottom + MARGIN_Y;
        const rightmostCard = this.cardNodeCells[this.cardNodeCells.length - 1];
        const left = getCardPositionX(0) - MARGIN_X;
        const right = getCardPositionX(this.cardNodeCells.length - 1) + rightmostCard.width + MARGIN_X;
        this.medianBarNode.setMedianBarShape(barY, left, (left + right) / 2, right, false);
      } else {
        this.medianBarNode.clear();
      }
      if (leftmostCard) {
        medianReadoutPanel.centerX = getCardPositionX((this.cardNodeCells.length - 1) / 2) + leftmostCard.width / 2;
        if (medianReadoutPanel.left < 0) {
          medianReadoutPanel.left = 0;
        }
        medianReadoutPanel.top = leftmostCard.bottom + MARGIN_Y + 13;
        medianReadoutPanel.visible = model.isShowingTopMedianProperty.value;
      } else {
        medianReadoutPanel.visible = false;
      }
    };
    this.cardNodeCellsChangedEmitter.addListener(updateMedianNode);
    model.selectedSceneModelProperty.value.medianValueProperty.link(updateMedianNode);
    model.isShowingTopMedianProperty.link(updateMedianNode);
    model.selectedSceneModelProperty.value.objectChangedEmitter.addListener(updateMedianNode);
    medianTextNode.boundsProperty.link(updateMedianNode);
    model.selectedSceneModelProperty.value.resetEmitter.addListener(() => {
      totalDragDistanceProperty.reset();
      dataSortedNode.visible = false;
      if (this.dataSortedNodeAnimation) {
        this.dataSortedNodeAnimation.stop();
        this.dataSortedNodeAnimation = null;
      }
    });
  }

  // The listener which is linked to the cardNode.positionProperty
  createDragPositionListener(cardNode) {
    return position => {
      if (cardNode.dragListener.isPressedProperty.value) {
        const originalCell = this.cardNodeCells.indexOf(cardNode);

        // Find the closest cell to the dragged card
        const dragCell = this.getClosestCell(position.x);

        // The drag delta can suggest a match further than a neighboring cell. But we must do pairwise swaps with
        // neighbors only in order to maintain the correct ordering. See https://github.com/phetsims/center-and-variability/issues/78
        const closestCell = dragCell > originalCell ? originalCell + 1 : dragCell < originalCell ? originalCell - 1 : originalCell;
        const currentOccupant = this.cardNodeCells[closestCell];

        // No-op if the dragged card is near its home cell
        if (currentOccupant !== cardNode) {
          // it's just a pairwise swap
          this.cardNodeCells[closestCell] = cardNode;
          this.cardNodeCells[originalCell] = currentOccupant;

          // Just animated the displaced occupant
          this.animateToHomeCell(currentOccupant);

          // See if the user unsorted the data.  If so, uncheck the "Sort Data" checkbox
          if (this.model.isSortingDataProperty.value && !this.isDataSorted()) {
            this.model.isSortingDataProperty.value = false;
          }

          // celebrate after the card was dropped and gets to its home
          this.isReadyForCelebration = this.isDataSorted() && !this.wasSortedBefore;
          this.cardNodeCellsChangedEmitter.emit();
        }
      }
    };
  }
  animateRandomCelebration(callback) {
    if (this.remainingCelebrationAnimations.length === 0) {
      const animations = [() => this.animateCelebration1(callback), () => this.animateCelebration2(callback), () => this.animateCelebration3(callback)];
      this.remainingCelebrationAnimations.push(...animations);
    }
    const animation = dotRandom.sample(this.remainingCelebrationAnimations);
    arrayRemove(this.remainingCelebrationAnimations, animation);
    animation();
  }

  /**
   * The cards grow and then shrink back to normal size.
   */
  animateCelebration1(callback) {
    const asyncCounter = new AsyncCounter(this.cardNodeCells.length, callback);
    this.cardNodeCells.forEach(cardNode => {
      const initialScale = cardNode.getScaleVector().x;
      const center = cardNode.center.copy();
      const scaleProperty = new NumberProperty(initialScale);
      scaleProperty.link(scale => cardNode.setScaleMagnitude(scale));
      const scaleUpAnimation = new Animation({
        duration: 0.2,
        targets: [{
          property: scaleProperty,
          to: initialScale * 1.2,
          easing: Easing.QUADRATIC_IN_OUT
        }]
      });
      const updatePosition = () => {
        cardNode.center = center;
      };
      scaleUpAnimation.updateEmitter.addListener(updatePosition);
      const scaleDownAnimation = new Animation({
        duration: 0.2,
        targets: [{
          property: scaleProperty,
          to: initialScale,
          easing: Easing.QUADRATIC_IN_OUT
        }]
      });
      scaleDownAnimation.updateEmitter.addListener(updatePosition);
      scaleDownAnimation.endedEmitter.addListener(() => asyncCounter.increment());
      scaleUpAnimation.then(scaleDownAnimation);
      scaleUpAnimation.start();
    });
  }

  /**
   * The cards do one clockwise rotation.
   */
  animateCelebration2(callback) {
    const asyncCounter = new AsyncCounter(this.cardNodeCells.length, callback);
    this.cardNodeCells.forEach(cardNode => {
      const center = cardNode.center.copy();
      const rotationProperty = new NumberProperty(0);
      rotationProperty.link(rotation => cardNode.setRotation(rotation));
      const animation = new Animation({
        duration: 0.6,
        targets: [{
          property: rotationProperty,
          to: 2 * Math.PI,
          easing: Easing.QUADRATIC_IN_OUT
        }]
      });
      const updatePosition = () => {
        cardNode.center = center;
      };
      animation.updateEmitter.addListener(updatePosition);
      animation.endedEmitter.addListener(() => asyncCounter.increment());
      animation.start();
    });
  }

  /**
   * The cards do the "wave" from left to right.
   */
  animateCelebration3(callback) {
    const asyncCounter = new AsyncCounter(this.cardNodeCells.length, callback);
    this.cardNodeCells.forEach((cardNode, index) => {
      const initialPositionY = cardNode.y;
      const jumpHeight = 30;
      const positionYProperty = new NumberProperty(initialPositionY);
      positionYProperty.link(positionY => {
        cardNode.y = positionY;
      });
      const goUpAnimation = new Animation({
        duration: 0.2,
        targets: [{
          property: positionYProperty,
          to: initialPositionY - jumpHeight,
          easing: Easing.QUADRATIC_IN_OUT
        }]
      });
      goUpAnimation.endedEmitter.addListener(() => {
        const goDownAnimation = new Animation({
          duration: 0.2,
          targets: [{
            property: positionYProperty,
            to: initialPositionY,
            easing: Easing.QUADRATIC_IN_OUT
          }]
        });
        goDownAnimation.endedEmitter.addListener(() => asyncCounter.increment());
        goDownAnimation.start();
      });

      // offset starting the animation for each card
      stepTimer.setTimeout(() => {
        goUpAnimation.start();
      }, index * 60);
    });
  }

  /**
   * Check if all of the data is in order, by using the cells associated with the card node.  Note that means
   * it is using the cell the card may be animating to.
   */
  isDataSorted() {
    let lastValue = null;
    for (let i = 0; i < this.cardNodeCells.length; i++) {
      const value = this.cardNodeCells[i].soccerBall.valueProperty.value;
      if (lastValue !== null && value < lastValue) {
        return false;
      }
      lastValue = value;
    }
    return true;
  }
  getHomePosition(cardNode) {
    const homeIndex = this.cardNodeCells.indexOf(cardNode);
    return new Vector2(getCardPositionX(homeIndex), 0);
  }
  animateToHomeCell(cardNode, duration = 0.3) {
    cardNode.animateTo(this.getHomePosition(cardNode), duration);
  }
  setAtHomeCell(cardNode) {
    cardNode.positionProperty.value = this.getHomePosition(cardNode);
  }

  /**
   * Find the cell the dragged card is closest to
   */
  getClosestCell(x) {
    if (this.cardNodeCells.length === 0) {
      return 0;
    } else {
      const cellIndices = _.range(this.cardNodeCells.length);
      return _.minBy(cellIndices, index => Math.abs(x - getCardPositionX(index)));
    }
  }
  getCardNode(soccerBall) {
    return this.cardNodeCells.find(cardNode => cardNode.soccerBall === soccerBall) || null;
  }
  sortData() {
    // If the card is visible, the value property should be non-null
    const sorted = _.sortBy(this.cardNodeCells, cardNode => cardNode.soccerBall.valueProperty.value);
    this.cardNodeCells.length = 0;
    this.cardNodeCells.push(...sorted);
    this.cardNodeCells.forEach(cardNode => this.animateToHomeCell(cardNode, 0.5));
    this.cardNodeCellsChangedEmitter.emit();
  }
  getDragRange() {
    const maxX = this.cardNodeCells.length > 0 ? getCardPositionX(this.cardNodeCells.length - 1) : 0;
    return new Range(0, maxX);
  }
}
centerAndVariability.register('CardNodeContainer', CardNodeContainer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlRleHQiLCJDYXJkTm9kZSIsIlZlY3RvcjIiLCJSYW5nZSIsIkVtaXR0ZXIiLCJQYW5lbCIsIkNBVkNvbnN0YW50cyIsIkNlbnRlckFuZFZhcmlhYmlsaXR5U3RyaW5ncyIsIk1lZGlhbkJhck5vZGUiLCJOdW1iZXJQcm9wZXJ0eSIsIkRlcml2ZWRQcm9wZXJ0eSIsImFycmF5UmVtb3ZlIiwic3RlcFRpbWVyIiwiRWFzaW5nIiwiQW5pbWF0aW9uIiwiZG90UmFuZG9tIiwiQXN5bmNDb3VudGVyIiwiUGhldEZvbnQiLCJNYXRyaXgzIiwiRHJhZ0luZGljYXRvckFycm93Tm9kZSIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIkNBUkRfU1BBQ0lORyIsImdldENhcmRQb3NpdGlvblgiLCJpbmRleCIsIkNBUkRfV0lEVEgiLCJDYXJkTm9kZUNvbnRhaW5lciIsImNhcmROb2RlQ2VsbHMiLCJjYXJkTm9kZUNlbGxzQ2hhbmdlZEVtaXR0ZXIiLCJtZWRpYW5CYXJOb2RlIiwibm90Y2hEaXJlY3Rpb24iLCJiYXJTdHlsZSIsImNhcmRMYXllciIsImlzUmVhZHlGb3JDZWxlYnJhdGlvbiIsInJlbWFpbmluZ0NlbGVicmF0aW9uQW5pbWF0aW9ucyIsImRhdGFTb3J0ZWROb2RlQW5pbWF0aW9uIiwid2FzU29ydGVkQmVmb3JlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm9wdGlvbnMiLCJ0b3RhbERyYWdEaXN0YW5jZVByb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiaGFzRHJhZ2dlZENhcmRQcm9wZXJ0eSIsInRvdGFsRHJhZ0Rpc3RhbmNlIiwiY2FyZE5vZGVzIiwiY2FyZHMiLCJtYXAiLCJjYXJkTW9kZWwiLCJjYXJkTm9kZSIsImdldERyYWdSYW5nZSIsImFkZENoaWxkIiwicG9zaXRpb25Qcm9wZXJ0eSIsImxpbmsiLCJjcmVhdGVEcmFnUG9zaXRpb25MaXN0ZW5lciIsImRyYWdMaXN0ZW5lciIsImlzUHJlc3NlZFByb3BlcnR5IiwiaXNQcmVzc2VkIiwiaXNEYXRhU29ydGVkIiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInZhbHVlIiwiYW5pbWF0ZVRvSG9tZUNlbGwiLCJpblByb2dyZXNzQW5pbWF0aW9ucyIsImZpbHRlciIsImFuaW1hdGlvbiIsImFzeW5jQ291bnRlciIsImxlbmd0aCIsImxlZnRtb3N0Q2FyZCIsImRhdGFTb3J0ZWROb2RlIiwiY2VudGVyWCIsIndpZHRoIiwiYm90dG9tIiwidG9wIiwibGVmdCIsInZpc2libGUiLCJvcGFjaXR5Iiwic3RvcCIsImR1cmF0aW9uIiwiZGVsYXkiLCJ0YXJnZXRzIiwicHJvcGVydHkiLCJvcGFjaXR5UHJvcGVydHkiLCJ0byIsImVhc2luZyIsIlFVQURSQVRJQ19JTl9PVVQiLCJmaW5pc2hFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJzdGFydCIsImNhcmRCZWluZ0RyYWdnZWQiLCJjYXJkc0FuaW1hdGluZyIsInBpY2thYmxlIiwiYW5pbWF0ZVJhbmRvbUNlbGVicmF0aW9uIiwiZm9yRWFjaCIsImVuZGVkRW1pdHRlciIsImluY3JlbWVudCIsImRyYWdEaXN0YW5jZUVtaXR0ZXIiLCJkaXN0YW5jZSIsImlzQWN0aXZlUHJvcGVydHkiLCJpc0FjdGl2ZSIsInRhcmdldEluZGV4IiwiaXNTb3J0aW5nRGF0YVByb3BlcnR5IiwibmV3VmFsdWUiLCJzb2NjZXJCYWxsIiwidmFsdWVQcm9wZXJ0eSIsImV4aXN0aW5nTG93ZXJDYXJkTm9kZXMiLCJsb3dlck5laWdoYm9yQ2FyZE5vZGUiLCJfIiwibWF4QnkiLCJpbmRleE9mIiwic3BsaWNlIiwic2V0QXRIb21lQ2VsbCIsImkiLCJlbWl0Iiwib2JqZWN0Q3JlYXRlZExpc3RlbmVyIiwic29ydERhdGEiLCJzZWxlY3RlZFNjZW5lTW9kZWxQcm9wZXJ0eSIsImdldEFjdGl2ZVNvY2NlckJhbGxzIiwiaXNTb3J0aW5nRGF0YSIsImRhdGFTb3J0ZWRUZXh0Tm9kZSIsInlvdVNvcnRlZFRoZURhdGFTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJzdHJva2UiLCJjb3JuZXJSYWRpdXMiLCJsaW5lV2lkdGgiLCJncmFkaWVudE1hcmdpbiIsInN0YXJ0UG9pbnQiLCJlbmRQb2ludCIsInJpZ2h0IiwiZ3JhZGllbnQiLCJ4IiwieSIsImFkZENvbG9yU3RvcCIsInNldFRyYW5zZm9ybU1hdHJpeCIsInJvdGF0aW9uQXJvdW5kUG9pbnQiLCJNYXRoIiwiUEkiLCJjZW50ZXIiLCJkcmFnSW5kaWNhdG9yQXJyb3dOb2RlIiwiZHJhZ0luZGljYXRvckNvbnRhaW5lciIsInVwZGF0ZURyYWdJbmRpY2F0b3IiLCJsZWZ0Q2FyZCIsInJpZ2h0Q2FyZCIsImhhc1ByZXNzZWRDYXJkIiwibmV3Q2hpbGRyZW4iLCJjaGlsZHJlbiIsImNlbnRlckJvdHRvbSIsImJvdW5kcyIsImNlbnRlclRvcCIsInBsdXNYWSIsIm1lZGlhblRleHROb2RlIiwibWVkaWFuRXF1YWxzVmFsdWVQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJtZWRpYW5WYWx1ZVByb3BlcnR5IiwiTUFJTl9GT05UIiwibWF4V2lkdGgiLCJtZWRpYW5SZWFkb3V0UGFuZWwiLCJ1cGRhdGVNZWRpYW5Ob2RlIiwiTUFSR0lOX1giLCJIQUxGX1NQTElUX1dJRFRIIiwiTUFSR0lOX1kiLCJpc1Nob3dpbmdUb3BNZWRpYW5Qcm9wZXJ0eSIsImJhclkiLCJyaWdodG1vc3RDYXJkIiwic2V0TWVkaWFuQmFyU2hhcGUiLCJjbGVhciIsIm9iamVjdENoYW5nZWRFbWl0dGVyIiwiYm91bmRzUHJvcGVydHkiLCJyZXNldEVtaXR0ZXIiLCJyZXNldCIsInBvc2l0aW9uIiwib3JpZ2luYWxDZWxsIiwiZHJhZ0NlbGwiLCJnZXRDbG9zZXN0Q2VsbCIsImNsb3Nlc3RDZWxsIiwiY3VycmVudE9jY3VwYW50IiwiY2FsbGJhY2siLCJhbmltYXRpb25zIiwiYW5pbWF0ZUNlbGVicmF0aW9uMSIsImFuaW1hdGVDZWxlYnJhdGlvbjIiLCJhbmltYXRlQ2VsZWJyYXRpb24zIiwicHVzaCIsInNhbXBsZSIsImluaXRpYWxTY2FsZSIsImdldFNjYWxlVmVjdG9yIiwiY29weSIsInNjYWxlUHJvcGVydHkiLCJzY2FsZSIsInNldFNjYWxlTWFnbml0dWRlIiwic2NhbGVVcEFuaW1hdGlvbiIsInVwZGF0ZVBvc2l0aW9uIiwidXBkYXRlRW1pdHRlciIsInNjYWxlRG93bkFuaW1hdGlvbiIsInRoZW4iLCJyb3RhdGlvblByb3BlcnR5Iiwicm90YXRpb24iLCJzZXRSb3RhdGlvbiIsImluaXRpYWxQb3NpdGlvblkiLCJqdW1wSGVpZ2h0IiwicG9zaXRpb25ZUHJvcGVydHkiLCJwb3NpdGlvblkiLCJnb1VwQW5pbWF0aW9uIiwiZ29Eb3duQW5pbWF0aW9uIiwic2V0VGltZW91dCIsImxhc3RWYWx1ZSIsImdldEhvbWVQb3NpdGlvbiIsImhvbWVJbmRleCIsImFuaW1hdGVUbyIsImNlbGxJbmRpY2VzIiwicmFuZ2UiLCJtaW5CeSIsImFicyIsImdldENhcmROb2RlIiwiZmluZCIsInNvcnRlZCIsInNvcnRCeSIsIm1heFgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNhcmROb2RlQ29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1hbmFnZXMgY3JlYXRpb24sIGRyYWdnaW5nLCBwb3NpdGlvbmluZyBvZiBDYXJkTm9kZSBpbnN0YW5jZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgY2VudGVyQW5kVmFyaWFiaWxpdHkgZnJvbSAnLi4vLi4vY2VudGVyQW5kVmFyaWFiaWxpdHkuanMnO1xyXG5pbXBvcnQgeyBMaW5lYXJHcmFkaWVudCwgTm9kZSwgTm9kZU9wdGlvbnMsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTb2NjZXJCYWxsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Tb2NjZXJCYWxsLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IENhcmROb2RlIGZyb20gJy4vQ2FyZE5vZGUuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IENBVkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQ0FWQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENlbnRlckFuZFZhcmlhYmlsaXR5U3RyaW5ncyBmcm9tICcuLi8uLi9DZW50ZXJBbmRWYXJpYWJpbGl0eVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTWVkaWFuQmFyTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9NZWRpYW5CYXJOb2RlLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgQXN5bmNDb3VudGVyIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Bc3luY0NvdW50ZXIuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgRHJhZ0luZGljYXRvckFycm93Tm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9EcmFnSW5kaWNhdG9yQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTWVkaWFuTW9kZWwgZnJvbSAnLi4vLi4vbWVkaWFuL21vZGVsL01lZGlhbk1vZGVsLmpzJztcclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ0FSRF9TUEFDSU5HID0gMTA7XHJcbmNvbnN0IGdldENhcmRQb3NpdGlvblggPSAoIGluZGV4OiBudW1iZXIgKSA9PiBpbmRleCAqICggQ2FyZE5vZGUuQ0FSRF9XSURUSCArIENBUkRfU1BBQ0lORyApO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIENhcmROb2RlQ29udGFpbmVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhcmROb2RlQ29udGFpbmVyIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8vIEVhY2ggY2FyZCBpcyBhc3NvY2lhdGVkIHdpdGggb25lIFwiY2VsbFwiLCBubyB0d28gY2FyZHMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc2FtZSBjZWxsLiAgVGhlIGxlZnRtb3N0IGNlbGwgaXMgMC5cclxuICAvLyBUaGUgY2VsbHMgbGluZWFybHkgbWFwIHRvIGxvY2F0aW9ucyBhY3Jvc3MgdGhlIHNjcmVlbi5cclxuICBwdWJsaWMgcmVhZG9ubHkgY2FyZE5vZGVDZWxsczogQ2FyZE5vZGVbXSA9IFtdO1xyXG5cclxuICAvLyBGaXJlcyBpZiB0aGUgY2FyZE5vZGVDZWxscyBtYXkgaGF2ZSBjaGFuZ2VkXHJcbiAgcHVibGljIHJlYWRvbmx5IGNhcmROb2RlQ2VsbHNDaGFuZ2VkRW1pdHRlcjogVEVtaXR0ZXIgPSBuZXcgRW1pdHRlcjxbXT4oKTtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb2RlbDogTWVkaWFuTW9kZWw7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNhcmROb2RlczogQ2FyZE5vZGVbXTtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1lZGlhbkJhck5vZGUgPSBuZXcgTWVkaWFuQmFyTm9kZSgge1xyXG4gICAgbm90Y2hEaXJlY3Rpb246ICd1cCcsXHJcbiAgICBiYXJTdHlsZTogJ3NwbGl0J1xyXG4gIH0gKTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRyYWdJbmRpY2F0b3JBcnJvd05vZGU6IEFycm93Tm9kZTtcclxuXHJcbiAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHVzZXIgaGFzIGV2ZXIgZHJhZ2dlZCBhIGNhcmQuIEl0J3MgdXNlZCB0byBoaWRlIHRoZSBkcmFnIGluZGljYXRvciBhcnJvdyBhZnRlclxyXG4gIC8vIHRoZSB1c2VyIGRyYWdnZWQgYSBjYXJkXHJcbiAgcHJpdmF0ZSByZWFkb25seSBoYXNEcmFnZ2VkQ2FyZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IGNhcmRMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgcHJpdmF0ZSBpc1JlYWR5Rm9yQ2VsZWJyYXRpb24gPSBmYWxzZTtcclxuICBwcml2YXRlIHJlbWFpbmluZ0NlbGVicmF0aW9uQW5pbWF0aW9uczogKCAoKSA9PiB2b2lkIClbXSA9IFtdO1xyXG4gIHByaXZhdGUgZGF0YVNvcnRlZE5vZGVBbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgd2FzU29ydGVkQmVmb3JlID0gdHJ1ZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogTWVkaWFuTW9kZWwsIG9wdGlvbnM6IENhcmROb2RlQ29udGFpbmVyT3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICAvLyBUT0RPLVVYOiBtYXliZSB0aGlzIHNob3VsZCBiZSBjb252ZXJ0ZWQgdG8gdHJhY2sgZGlzdGFuY2UgZm9yIGluZGl2aWR1YWwgY2FyZHMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2VudGVyLWFuZC12YXJpYWJpbGl0eS9pc3N1ZXMvMTExXHJcbiAgICAvLyBBY2N1bXVsYXRlZCBjYXJkIGRyYWcgZGlzdGFuY2UsIGZvciBwdXJwb3NlcyBvZiBoaWRpbmcgdGhlIGRyYWcgaW5kaWNhdG9yIG5vZGVcclxuICAgIGNvbnN0IHRvdGFsRHJhZ0Rpc3RhbmNlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b3RhbERyYWdEaXN0YW5jZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0ZvciBQaEVULWlPIGludGVybmFsIHVzZSBvbmx5LiBBY2N1bXVsYXRlZCBjYXJkIGRyYWcgZGlzdGFuY2UsIGZvciBwdXJwb3NlcyBvZiBoaWRpbmcgdGhlIGRyYWcgaW5kaWNhdG9yIG5vZGUnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmhhc0RyYWdnZWRDYXJkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRvdGFsRHJhZ0Rpc3RhbmNlUHJvcGVydHkgXSwgdG90YWxEcmFnRGlzdGFuY2UgPT4ge1xyXG4gICAgICByZXR1cm4gdG90YWxEcmFnRGlzdGFuY2UgPiAxNTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNhcmROb2RlcyA9IG1vZGVsLmNhcmRzLm1hcCggKCBjYXJkTW9kZWwsIGluZGV4ICkgPT4ge1xyXG4gICAgICBjb25zdCBjYXJkTm9kZSA9IG5ldyBDYXJkTm9kZSggY2FyZE1vZGVsLCBuZXcgVmVjdG9yMiggMCwgMCApLCAoKSA9PiB0aGlzLmdldERyYWdSYW5nZSgpLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjYXJkTm9kZXMnICkuY3JlYXRlVGFuZGVtKCAnY2FyZE5vZGUnICsgaW5kZXggKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGlzLmNhcmRMYXllci5hZGRDaGlsZCggY2FyZE5vZGUgKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgYWxsIGNhcmRzICh2aWEgYW5pbWF0aW9uKSB3aGVuZXZlciBhbnkgY2FyZCBpcyBkcmFnZ2VkXHJcbiAgICAgIGNhcmROb2RlLnBvc2l0aW9uUHJvcGVydHkubGluayggdGhpcy5jcmVhdGVEcmFnUG9zaXRpb25MaXN0ZW5lciggY2FyZE5vZGUgKSApO1xyXG5cclxuICAgICAgLy8gV2hlbiBhIGNhcmQgaXMgZHJvcHBlZCwgc2VuZCBpdCB0byBpdHMgaG9tZSBjZWxsXHJcbiAgICAgIGNhcmROb2RlLmRyYWdMaXN0ZW5lci5pc1ByZXNzZWRQcm9wZXJ0eS5saW5rKCBpc1ByZXNzZWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIGlzUHJlc3NlZCApIHtcclxuXHJcbiAgICAgICAgICAvLyBUT0RPOiBtdWx0aXRvdWNoIGNvbmNlcm5zLiAgU2hvdWxkIGl0IGJlIG51bGx8dHJ1ZXxmYWxzZT8gIE9yIG1heWJlIGFmdGVyIGNlbGVicmF0aW9uLCBzZXQgaXQgdG8gdHJ1ZSBiZWNhdXNlIHdlIGtub3cgaXQgaXMgc29ydGVkP1xyXG4gICAgICAgICAgdGhpcy53YXNTb3J0ZWRCZWZvcmUgPSB0aGlzLmlzRGF0YVNvcnRlZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCAhaXNQcmVzc2VkICYmICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAgIC8vIEFuaW1hdGUgdGhlIGRyb3BwZWQgY2FyZCBob21lXHJcbiAgICAgICAgICB0aGlzLmFuaW1hdGVUb0hvbWVDZWxsKCBjYXJkTm9kZSwgMC4yICk7XHJcblxyXG4gICAgICAgICAgaWYgKCB0aGlzLmlzUmVhZHlGb3JDZWxlYnJhdGlvbiApIHtcclxuICAgICAgICAgICAgY29uc3QgaW5Qcm9ncmVzc0FuaW1hdGlvbnMgPSB0aGlzLmNhcmROb2RlQ2VsbHMuZmlsdGVyKCBjYXJkTm9kZSA9PiBjYXJkTm9kZS5hbmltYXRpb24gKVxyXG4gICAgICAgICAgICAgIC5tYXAoIGNhcmROb2RlID0+IGNhcmROb2RlLmFuaW1hdGlvbiEgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldHVwIGEgY2FsbGJhY2sgZm9yIGFuaW1hdGlvbiB3aGVuIGFsbCBjdXJyZW50IGFuaW1hdGlvbnMgZmluaXNoXHJcbiAgICAgICAgICAgIGNvbnN0IGFzeW5jQ291bnRlciA9IG5ldyBBc3luY0NvdW50ZXIoIGluUHJvZ3Jlc3NBbmltYXRpb25zLmxlbmd0aCwgKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAvLyB3ZSBrbm93IGF0IGxlYXN0IG9uZSBjYXJkIGV4aXN0cyBiZWNhdXNlIHdlJ3JlIGluIGEgZHJhZ0xpc3RlbmVyIGxpbmtcclxuICAgICAgICAgICAgICBjb25zdCBsZWZ0bW9zdENhcmQgPSB0aGlzLmNhcmROb2RlQ2VsbHNbIDAgXSE7XHJcblxyXG4gICAgICAgICAgICAgIGlmICggbGVmdG1vc3RDYXJkICkge1xyXG4gICAgICAgICAgICAgICAgZGF0YVNvcnRlZE5vZGUuY2VudGVyWCA9IGdldENhcmRQb3NpdGlvblgoICggdGhpcy5jYXJkTm9kZUNlbGxzLmxlbmd0aCAtIDEgKSAvIDIgKSArIGxlZnRtb3N0Q2FyZC53aWR0aCAvIDI7XHJcbiAgICAgICAgICAgICAgICBkYXRhU29ydGVkTm9kZS5ib3R0b20gPSBsZWZ0bW9zdENhcmQudG9wIC0gNztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhU29ydGVkTm9kZS5jZW50ZXJYID0gZ2V0Q2FyZFBvc2l0aW9uWCggKCB0aGlzLmNhcmROb2RlQ2VsbHMubGVuZ3RoIC0gMSApIC8gMiApO1xyXG4gICAgICAgICAgICAgICAgZGF0YVNvcnRlZE5vZGUuYm90dG9tID0gLTcuNTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICggZGF0YVNvcnRlZE5vZGUubGVmdCA8IDAgKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhU29ydGVkTm9kZS5sZWZ0ID0gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZGF0YVNvcnRlZE5vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgZGF0YVNvcnRlZE5vZGUub3BhY2l0eSA9IDE7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmIHRoZSB1c2VyIHNvcnRlZCB0aGUgZGF0YSBhZ2FpbiBiZWZvcmUgdGhlIGRhdGEgc29ydGVkIG1lc3NhZ2Ugd2FzIGhpZGRlbiwgY2xlYXIgb3V0IHRoZSB0aW1lci5cclxuICAgICAgICAgICAgICBpZiAoIHRoaXMuZGF0YVNvcnRlZE5vZGVBbmltYXRpb24gKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFTb3J0ZWROb2RlQW5pbWF0aW9uLnN0b3AoKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIC8vIHN0YXJ0IGEgdGltZXIgdG8gaGlkZSB0aGUgZGF0YSBzb3J0ZWQgbm9kZVxyXG4gICAgICAgICAgICAgIHRoaXMuZGF0YVNvcnRlZE5vZGVBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMC42LFxyXG4gICAgICAgICAgICAgICAgZGVsYXk6IDIsXHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzOiBbIHtcclxuICAgICAgICAgICAgICAgICAgcHJvcGVydHk6IGRhdGFTb3J0ZWROb2RlLm9wYWNpdHlQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgICAgdG86IDAsXHJcbiAgICAgICAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcclxuICAgICAgICAgICAgICAgIH0gXVxyXG4gICAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgICAgICB0aGlzLmRhdGFTb3J0ZWROb2RlQW5pbWF0aW9uLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRhdGFTb3J0ZWROb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVNvcnRlZE5vZGVBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgICAgICB0aGlzLmRhdGFTb3J0ZWROb2RlQW5pbWF0aW9uLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGNhcmRCZWluZ0RyYWdnZWQgPSB0aGlzLmNhcmROb2RlQ2VsbHMuZmlsdGVyKCBjYXJkTm9kZSA9PiBjYXJkTm9kZS5kcmFnTGlzdGVuZXIuaXNQcmVzc2VkICkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNhcmRzQW5pbWF0aW5nID0gdGhpcy5jYXJkTm9kZUNlbGxzLmZpbHRlciggY2FyZE5vZGUgPT4gY2FyZE5vZGUuYW5pbWF0aW9uICkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgIGlmICggY2FyZEJlaW5nRHJhZ2dlZCA9PT0gMCAmJiBjYXJkc0FuaW1hdGluZyA9PT0gMCApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlja2FibGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVSYW5kb21DZWxlYnJhdGlvbiggKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgdGhpcy5pc1JlYWR5Rm9yQ2VsZWJyYXRpb24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5waWNrYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIGFzeW5jQ291bnRlciB3aGVuIGFueSBpbi1wcm9ncmVzcyBhbmltYXRpb24gZmluaXNoZXNcclxuICAgICAgICAgICAgaW5Qcm9ncmVzc0FuaW1hdGlvbnMuZm9yRWFjaCggYW5pbWF0aW9uID0+IHtcclxuICAgICAgICAgICAgICBhbmltYXRpb24uZW5kZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBhc3luY0NvdW50ZXIuaW5jcmVtZW50KCkgKTtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gQWNjdW11bGF0ZSBkcmFnIGRpc3RhbmNlXHJcbiAgICAgIGNhcmROb2RlLmRyYWdEaXN0YW5jZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIGRpc3RhbmNlID0+IHtcclxuICAgICAgICB0b3RhbERyYWdEaXN0YW5jZVByb3BlcnR5LnZhbHVlICs9IGRpc3RhbmNlO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBjYXJkTW9kZWwuaXNBY3RpdmVQcm9wZXJ0eS5saW5rKCBpc0FjdGl2ZSA9PiB7XHJcbiAgICAgICAgaWYgKCBpc0FjdGl2ZSAmJiAhcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgICBsZXQgdGFyZ2V0SW5kZXggPSB0aGlzLmNhcmROb2RlQ2VsbHMubGVuZ3RoO1xyXG4gICAgICAgICAgaWYgKCB0aGlzLm1vZGVsLmlzU29ydGluZ0RhdGFQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBjYXJkTm9kZS5zb2NjZXJCYWxsLnZhbHVlUHJvcGVydHkudmFsdWUhO1xyXG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ0xvd2VyQ2FyZE5vZGVzID0gdGhpcy5jYXJkTm9kZUNlbGxzLmZpbHRlciggY2FyZE5vZGUgPT4gY2FyZE5vZGUuc29jY2VyQmFsbC52YWx1ZVByb3BlcnR5LnZhbHVlISA8PSBuZXdWYWx1ZSApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbG93ZXJOZWlnaGJvckNhcmROb2RlID0gXy5tYXhCeSggZXhpc3RpbmdMb3dlckNhcmROb2RlcywgY2FyZE5vZGUgPT4gdGhpcy5jYXJkTm9kZUNlbGxzLmluZGV4T2YoIGNhcmROb2RlICkgKTtcclxuICAgICAgICAgICAgdGFyZ2V0SW5kZXggPSBsb3dlck5laWdoYm9yQ2FyZE5vZGUgPyB0aGlzLmNhcmROb2RlQ2VsbHMuaW5kZXhPZiggbG93ZXJOZWlnaGJvckNhcmROb2RlICkgKyAxIDogMDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmNhcmROb2RlQ2VsbHMuc3BsaWNlKCB0YXJnZXRJbmRleCwgMCwgY2FyZE5vZGUgKTtcclxuICAgICAgICAgIHRoaXMuc2V0QXRIb21lQ2VsbCggY2FyZE5vZGUgKTtcclxuXHJcbiAgICAgICAgICAvLyBBbmltYXRlIGFsbCBkaXNwbGFjZWQgY2FyZHNcclxuICAgICAgICAgIGZvciAoIGxldCBpID0gdGFyZ2V0SW5kZXg7IGkgPCB0aGlzLmNhcmROb2RlQ2VsbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZVRvSG9tZUNlbGwoIHRoaXMuY2FyZE5vZGVDZWxsc1sgaSBdICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5jYXJkTm9kZUNlbGxzQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgcmV0dXJuIGNhcmROb2RlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubWVkaWFuQmFyTm9kZSApO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdENyZWF0ZWRMaXN0ZW5lciA9ICggc29jY2VyQmFsbDogU29jY2VyQmFsbCApID0+IHtcclxuXHJcbiAgICAgIC8vIEEgYmFsbCBsYW5kZWQgT1IgYSB2YWx1ZSBjaGFuZ2VkXHJcbiAgICAgIHNvY2NlckJhbGwudmFsdWVQcm9wZXJ0eS5saW5rKCB2YWx1ZSA9PiB7XHJcbiAgICAgICAgaWYgKCB0aGlzLm1vZGVsLmlzU29ydGluZ0RhdGFQcm9wZXJ0eS52YWx1ZSAmJiB2YWx1ZSAhPT0gbnVsbCApIHtcclxuICAgICAgICAgIHRoaXMuc29ydERhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgbW9kZWwuc2VsZWN0ZWRTY2VuZU1vZGVsUHJvcGVydHkudmFsdWUuZ2V0QWN0aXZlU29jY2VyQmFsbHMoKS5mb3JFYWNoKCBvYmplY3RDcmVhdGVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICBtb2RlbC5pc1NvcnRpbmdEYXRhUHJvcGVydHkubGluayggaXNTb3J0aW5nRGF0YSA9PiB7XHJcbiAgICAgIGlmICggaXNTb3J0aW5nRGF0YSApIHtcclxuICAgICAgICB0aGlzLnNvcnREYXRhKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBkYXRhU29ydGVkVGV4dE5vZGUgPSBuZXcgVGV4dCggQ2VudGVyQW5kVmFyaWFiaWxpdHlTdHJpbmdzLnlvdVNvcnRlZFRoZURhdGFTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE1IClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGRhdGFTb3J0ZWROb2RlID0gbmV3IFBhbmVsKCBkYXRhU29ydGVkVGV4dE5vZGUsIHtcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDQsXHJcbiAgICAgIGxpbmVXaWR0aDogMixcclxuICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSByb3RhdGVkIGxpbmVhciBncmFkaWVudFxyXG4gICAgY29uc3QgZ3JhZGllbnRNYXJnaW4gPSAyMDtcclxuICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBuZXcgVmVjdG9yMiggZGF0YVNvcnRlZE5vZGUubGVmdCArIGdyYWRpZW50TWFyZ2luLCBkYXRhU29ydGVkTm9kZS50b3AgKyBncmFkaWVudE1hcmdpbiApO1xyXG4gICAgY29uc3QgZW5kUG9pbnQgPSBuZXcgVmVjdG9yMiggZGF0YVNvcnRlZE5vZGUucmlnaHQgLSBncmFkaWVudE1hcmdpbiwgZGF0YVNvcnRlZE5vZGUuYm90dG9tIC0gZ3JhZGllbnRNYXJnaW4gKTtcclxuICAgIGNvbnN0IGdyYWRpZW50ID0gbmV3IExpbmVhckdyYWRpZW50KCBzdGFydFBvaW50LngsIHN0YXJ0UG9pbnQueSwgZW5kUG9pbnQueCwgZW5kUG9pbnQueSApO1xyXG4gICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKCAwLCAnI2ZhOTY5NicgKTtcclxuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCggMC4yLCAnI2ZmYTY1OScgKTtcclxuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCggMC40LCAnI2ViZDc1ZScgKTtcclxuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCggMC42LCAnIzhjZTY4NScgKTtcclxuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCggMC44LCAnIzdmZDdmMCcgKTtcclxuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCggMSwgJyM5MjdmZWInICk7XHJcbiAgICBncmFkaWVudC5zZXRUcmFuc2Zvcm1NYXRyaXgoIE1hdHJpeDMucm90YXRpb25Bcm91bmRQb2ludCggTWF0aC5QSSAvIDQgKiAxLjIsIGRhdGFTb3J0ZWROb2RlLmNlbnRlciApICk7XHJcbiAgICBkYXRhU29ydGVkTm9kZS5zdHJva2UgPSBncmFkaWVudDtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBkYXRhU29ydGVkTm9kZSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY2FyZExheWVyICk7XHJcblxyXG4gICAgdGhpcy5kcmFnSW5kaWNhdG9yQXJyb3dOb2RlID0gbmV3IERyYWdJbmRpY2F0b3JBcnJvd05vZGUoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnSW5kaWNhdG9yQXJyb3dOb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIG9yIHJlbW92ZSB0aGUgYXJyb3cgbm9kZSBjaGlsZFxyXG4gICAgY29uc3QgZHJhZ0luZGljYXRvckNvbnRhaW5lciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBkcmFnSW5kaWNhdG9yQ29udGFpbmVyICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlRHJhZ0luZGljYXRvciA9ICgpID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IGxlZnRDYXJkID0gdGhpcy5jYXJkTm9kZUNlbGxzWyAwIF07XHJcbiAgICAgIGNvbnN0IHJpZ2h0Q2FyZCA9IHRoaXMuY2FyZE5vZGVDZWxsc1sgMSBdO1xyXG5cclxuICAgICAgY29uc3QgaGFzUHJlc3NlZENhcmQgPSB0aGlzLmhhc0RyYWdnZWRDYXJkUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgICBjb25zdCBuZXdDaGlsZHJlbiA9IGxlZnRDYXJkICYmIHJpZ2h0Q2FyZCAmJiAhaGFzUHJlc3NlZENhcmQgPyBbIHRoaXMuZHJhZ0luZGljYXRvckFycm93Tm9kZSBdIDogW107XHJcblxyXG4gICAgICBpZiAoIG5ld0NoaWxkcmVuLmxlbmd0aCAhPT0gZHJhZ0luZGljYXRvckNvbnRhaW5lci5jaGlsZHJlbi5sZW5ndGggKSB7XHJcbiAgICAgICAgZHJhZ0luZGljYXRvckNvbnRhaW5lci5jaGlsZHJlbiA9IG5ld0NoaWxkcmVuO1xyXG5cclxuICAgICAgICBpZiAoIGxlZnRDYXJkICYmIHJpZ2h0Q2FyZCApIHtcclxuICAgICAgICAgIHRoaXMuZHJhZ0luZGljYXRvckFycm93Tm9kZS5jZW50ZXJCb3R0b20gPSBsZWZ0Q2FyZC5ib3VuZHMuY2VudGVyVG9wLnBsdXNYWSggMCwgLTggKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLmNhcmROb2RlQ2VsbHNDaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlRHJhZ0luZGljYXRvciApO1xyXG4gICAgdGhpcy5oYXNEcmFnZ2VkQ2FyZFByb3BlcnR5LmxpbmsoIHVwZGF0ZURyYWdJbmRpY2F0b3IgKTtcclxuXHJcbiAgICBjb25zdCBtZWRpYW5UZXh0Tm9kZSA9IG5ldyBUZXh0KCBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBDZW50ZXJBbmRWYXJpYWJpbGl0eVN0cmluZ3MubWVkaWFuRXF1YWxzVmFsdWVQYXR0ZXJuU3RyaW5nUHJvcGVydHksIHsgdmFsdWU6IG1vZGVsLnNlbGVjdGVkU2NlbmVNb2RlbFByb3BlcnR5LnZhbHVlLm1lZGlhblZhbHVlUHJvcGVydHkgfSApLCB7XHJcbiAgICAgIGZvbnQ6IENBVkNvbnN0YW50cy5NQUlOX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiAzMDBcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG1lZGlhblJlYWRvdXRQYW5lbCA9IG5ldyBQYW5lbCggbWVkaWFuVGV4dE5vZGUsIHtcclxuICAgICAgc3Ryb2tlOiAnbGlnaHRncmF5JyxcclxuICAgICAgbGluZVdpZHRoOiAwLjYsXHJcbiAgICAgIGNvcm5lclJhZGl1czogNFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbWVkaWFuUmVhZG91dFBhbmVsICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlTWVkaWFuTm9kZSA9ICgpID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IGxlZnRtb3N0Q2FyZCA9IHRoaXMuY2FyZE5vZGVDZWxsc1sgMCBdO1xyXG5cclxuICAgICAgY29uc3QgTUFSR0lOX1ggPSBDQVJEX1NQQUNJTkcgLyAyIC0gTWVkaWFuQmFyTm9kZS5IQUxGX1NQTElUX1dJRFRIO1xyXG4gICAgICBjb25zdCBNQVJHSU5fWSA9IDU7XHJcblxyXG4gICAgICAvLyBPbmx5IHJlZHJhdyB0aGUgc2hhcGUgaWYgdGhlIGZlYXR1cmUgaXMgc2VsZWN0ZWQgYW5kIHRoZSBkYXRhIGlzIHNvcnRlZCwgYW5kIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBjYXJkXHJcbiAgICAgIGlmICggbW9kZWwuaXNTaG93aW5nVG9wTWVkaWFuUHJvcGVydHkudmFsdWUgJiYgdGhpcy5pc0RhdGFTb3J0ZWQoKSAmJiBsZWZ0bW9zdENhcmQgKSB7XHJcbiAgICAgICAgY29uc3QgYmFyWSA9IGxlZnRtb3N0Q2FyZC5ib3R0b20gKyBNQVJHSU5fWTtcclxuXHJcbiAgICAgICAgY29uc3QgcmlnaHRtb3N0Q2FyZCA9IHRoaXMuY2FyZE5vZGVDZWxsc1sgdGhpcy5jYXJkTm9kZUNlbGxzLmxlbmd0aCAtIDEgXTtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gZ2V0Q2FyZFBvc2l0aW9uWCggMCApIC0gTUFSR0lOX1g7XHJcbiAgICAgICAgY29uc3QgcmlnaHQgPSBnZXRDYXJkUG9zaXRpb25YKCB0aGlzLmNhcmROb2RlQ2VsbHMubGVuZ3RoIC0gMSApICsgcmlnaHRtb3N0Q2FyZC53aWR0aCArIE1BUkdJTl9YO1xyXG5cclxuICAgICAgICB0aGlzLm1lZGlhbkJhck5vZGUuc2V0TWVkaWFuQmFyU2hhcGUoIGJhclksIGxlZnQsICggbGVmdCArIHJpZ2h0ICkgLyAyLCByaWdodCwgZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLm1lZGlhbkJhck5vZGUuY2xlYXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBsZWZ0bW9zdENhcmQgKSB7XHJcbiAgICAgICAgbWVkaWFuUmVhZG91dFBhbmVsLmNlbnRlclggPSBnZXRDYXJkUG9zaXRpb25YKCAoIHRoaXMuY2FyZE5vZGVDZWxscy5sZW5ndGggLSAxICkgLyAyICkgKyBsZWZ0bW9zdENhcmQud2lkdGggLyAyO1xyXG4gICAgICAgIGlmICggbWVkaWFuUmVhZG91dFBhbmVsLmxlZnQgPCAwICkge1xyXG4gICAgICAgICAgbWVkaWFuUmVhZG91dFBhbmVsLmxlZnQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZWRpYW5SZWFkb3V0UGFuZWwudG9wID0gbGVmdG1vc3RDYXJkLmJvdHRvbSArIE1BUkdJTl9ZICsgMTM7XHJcbiAgICAgICAgbWVkaWFuUmVhZG91dFBhbmVsLnZpc2libGUgPSBtb2RlbC5pc1Nob3dpbmdUb3BNZWRpYW5Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBtZWRpYW5SZWFkb3V0UGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5jYXJkTm9kZUNlbGxzQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZU1lZGlhbk5vZGUgKTtcclxuICAgIG1vZGVsLnNlbGVjdGVkU2NlbmVNb2RlbFByb3BlcnR5LnZhbHVlLm1lZGlhblZhbHVlUHJvcGVydHkubGluayggdXBkYXRlTWVkaWFuTm9kZSApO1xyXG4gICAgbW9kZWwuaXNTaG93aW5nVG9wTWVkaWFuUHJvcGVydHkubGluayggdXBkYXRlTWVkaWFuTm9kZSApO1xyXG4gICAgbW9kZWwuc2VsZWN0ZWRTY2VuZU1vZGVsUHJvcGVydHkudmFsdWUub2JqZWN0Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZU1lZGlhbk5vZGUgKTtcclxuICAgIG1lZGlhblRleHROb2RlLmJvdW5kc1Byb3BlcnR5LmxpbmsoIHVwZGF0ZU1lZGlhbk5vZGUgKTtcclxuXHJcbiAgICBtb2RlbC5zZWxlY3RlZFNjZW5lTW9kZWxQcm9wZXJ0eS52YWx1ZS5yZXNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdG90YWxEcmFnRGlzdGFuY2VQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICBkYXRhU29ydGVkTm9kZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIGlmICggdGhpcy5kYXRhU29ydGVkTm9kZUFuaW1hdGlvbiApIHtcclxuICAgICAgICB0aGlzLmRhdGFTb3J0ZWROb2RlQW5pbWF0aW9uLnN0b3AoKTtcclxuICAgICAgICB0aGlzLmRhdGFTb3J0ZWROb2RlQW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIGxpc3RlbmVyIHdoaWNoIGlzIGxpbmtlZCB0byB0aGUgY2FyZE5vZGUucG9zaXRpb25Qcm9wZXJ0eVxyXG4gIHByaXZhdGUgY3JlYXRlRHJhZ1Bvc2l0aW9uTGlzdGVuZXIoIGNhcmROb2RlOiBDYXJkTm9kZSApOiAoIHBvc2l0aW9uOiBWZWN0b3IyICkgPT4gdm9pZCB7XHJcbiAgICByZXR1cm4gKCBwb3NpdGlvbjogVmVjdG9yMiApID0+IHtcclxuICAgICAgaWYgKCBjYXJkTm9kZS5kcmFnTGlzdGVuZXIuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsQ2VsbCA9IHRoaXMuY2FyZE5vZGVDZWxscy5pbmRleE9mKCBjYXJkTm9kZSApO1xyXG5cclxuICAgICAgICAvLyBGaW5kIHRoZSBjbG9zZXN0IGNlbGwgdG8gdGhlIGRyYWdnZWQgY2FyZFxyXG4gICAgICAgIGNvbnN0IGRyYWdDZWxsID0gdGhpcy5nZXRDbG9zZXN0Q2VsbCggcG9zaXRpb24ueCApO1xyXG5cclxuICAgICAgICAvLyBUaGUgZHJhZyBkZWx0YSBjYW4gc3VnZ2VzdCBhIG1hdGNoIGZ1cnRoZXIgdGhhbiBhIG5laWdoYm9yaW5nIGNlbGwuIEJ1dCB3ZSBtdXN0IGRvIHBhaXJ3aXNlIHN3YXBzIHdpdGhcclxuICAgICAgICAvLyBuZWlnaGJvcnMgb25seSBpbiBvcmRlciB0byBtYWludGFpbiB0aGUgY29ycmVjdCBvcmRlcmluZy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jZW50ZXItYW5kLXZhcmlhYmlsaXR5L2lzc3Vlcy83OFxyXG4gICAgICAgIGNvbnN0IGNsb3Nlc3RDZWxsID0gZHJhZ0NlbGwgPiBvcmlnaW5hbENlbGwgPyBvcmlnaW5hbENlbGwgKyAxIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdDZWxsIDwgb3JpZ2luYWxDZWxsID8gb3JpZ2luYWxDZWxsIC0gMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbENlbGw7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRPY2N1cGFudCA9IHRoaXMuY2FyZE5vZGVDZWxsc1sgY2xvc2VzdENlbGwgXTtcclxuXHJcbiAgICAgICAgLy8gTm8tb3AgaWYgdGhlIGRyYWdnZWQgY2FyZCBpcyBuZWFyIGl0cyBob21lIGNlbGxcclxuICAgICAgICBpZiAoIGN1cnJlbnRPY2N1cGFudCAhPT0gY2FyZE5vZGUgKSB7XHJcblxyXG4gICAgICAgICAgLy8gaXQncyBqdXN0IGEgcGFpcndpc2Ugc3dhcFxyXG4gICAgICAgICAgdGhpcy5jYXJkTm9kZUNlbGxzWyBjbG9zZXN0Q2VsbCBdID0gY2FyZE5vZGU7XHJcbiAgICAgICAgICB0aGlzLmNhcmROb2RlQ2VsbHNbIG9yaWdpbmFsQ2VsbCBdID0gY3VycmVudE9jY3VwYW50O1xyXG5cclxuICAgICAgICAgIC8vIEp1c3QgYW5pbWF0ZWQgdGhlIGRpc3BsYWNlZCBvY2N1cGFudFxyXG4gICAgICAgICAgdGhpcy5hbmltYXRlVG9Ib21lQ2VsbCggY3VycmVudE9jY3VwYW50ICk7XHJcblxyXG4gICAgICAgICAgLy8gU2VlIGlmIHRoZSB1c2VyIHVuc29ydGVkIHRoZSBkYXRhLiAgSWYgc28sIHVuY2hlY2sgdGhlIFwiU29ydCBEYXRhXCIgY2hlY2tib3hcclxuICAgICAgICAgIGlmICggdGhpcy5tb2RlbC5pc1NvcnRpbmdEYXRhUHJvcGVydHkudmFsdWUgJiYgIXRoaXMuaXNEYXRhU29ydGVkKCkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuaXNTb3J0aW5nRGF0YVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gY2VsZWJyYXRlIGFmdGVyIHRoZSBjYXJkIHdhcyBkcm9wcGVkIGFuZCBnZXRzIHRvIGl0cyBob21lXHJcbiAgICAgICAgICB0aGlzLmlzUmVhZHlGb3JDZWxlYnJhdGlvbiA9IHRoaXMuaXNEYXRhU29ydGVkKCkgJiYgIXRoaXMud2FzU29ydGVkQmVmb3JlO1xyXG5cclxuICAgICAgICAgIHRoaXMuY2FyZE5vZGVDZWxsc0NoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFuaW1hdGVSYW5kb21DZWxlYnJhdGlvbiggY2FsbGJhY2s6ICgpID0+IHZvaWQgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMucmVtYWluaW5nQ2VsZWJyYXRpb25BbmltYXRpb25zLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgY29uc3QgYW5pbWF0aW9ucyA9IFtcclxuICAgICAgICAoKSA9PiB0aGlzLmFuaW1hdGVDZWxlYnJhdGlvbjEoIGNhbGxiYWNrICksXHJcbiAgICAgICAgKCkgPT4gdGhpcy5hbmltYXRlQ2VsZWJyYXRpb24yKCBjYWxsYmFjayApLFxyXG4gICAgICAgICgpID0+IHRoaXMuYW5pbWF0ZUNlbGVicmF0aW9uMyggY2FsbGJhY2sgKVxyXG4gICAgICBdO1xyXG5cclxuICAgICAgdGhpcy5yZW1haW5pbmdDZWxlYnJhdGlvbkFuaW1hdGlvbnMucHVzaCggLi4uYW5pbWF0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFuaW1hdGlvbiA9IGRvdFJhbmRvbS5zYW1wbGUoIHRoaXMucmVtYWluaW5nQ2VsZWJyYXRpb25BbmltYXRpb25zICk7XHJcbiAgICBhcnJheVJlbW92ZSggdGhpcy5yZW1haW5pbmdDZWxlYnJhdGlvbkFuaW1hdGlvbnMsIGFuaW1hdGlvbiApO1xyXG4gICAgYW5pbWF0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgY2FyZHMgZ3JvdyBhbmQgdGhlbiBzaHJpbmsgYmFjayB0byBub3JtYWwgc2l6ZS5cclxuICAgKi9cclxuICBwcml2YXRlIGFuaW1hdGVDZWxlYnJhdGlvbjEoIGNhbGxiYWNrOiAoKSA9PiB2b2lkICk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IGFzeW5jQ291bnRlciA9IG5ldyBBc3luY0NvdW50ZXIoIHRoaXMuY2FyZE5vZGVDZWxscy5sZW5ndGgsIGNhbGxiYWNrICk7XHJcblxyXG4gICAgdGhpcy5jYXJkTm9kZUNlbGxzLmZvckVhY2goIGNhcmROb2RlID0+IHtcclxuICAgICAgY29uc3QgaW5pdGlhbFNjYWxlID0gY2FyZE5vZGUuZ2V0U2NhbGVWZWN0b3IoKS54O1xyXG4gICAgICBjb25zdCBjZW50ZXIgPSBjYXJkTm9kZS5jZW50ZXIuY29weSgpO1xyXG5cclxuICAgICAgY29uc3Qgc2NhbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggaW5pdGlhbFNjYWxlICk7XHJcbiAgICAgIHNjYWxlUHJvcGVydHkubGluayggc2NhbGUgPT4gY2FyZE5vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlICkgKTtcclxuXHJcbiAgICAgIGNvbnN0IHNjYWxlVXBBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgZHVyYXRpb246IDAuMixcclxuICAgICAgICB0YXJnZXRzOiBbIHtcclxuICAgICAgICAgIHByb3BlcnR5OiBzY2FsZVByb3BlcnR5LFxyXG4gICAgICAgICAgdG86IGluaXRpYWxTY2FsZSAqIDEuMixcclxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcclxuICAgICAgICB9IF1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3QgdXBkYXRlUG9zaXRpb24gPSAoKSA9PiB7XHJcbiAgICAgICAgY2FyZE5vZGUuY2VudGVyID0gY2VudGVyO1xyXG4gICAgICB9O1xyXG4gICAgICBzY2FsZVVwQW5pbWF0aW9uLnVwZGF0ZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZVBvc2l0aW9uICk7XHJcblxyXG4gICAgICBjb25zdCBzY2FsZURvd25BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgZHVyYXRpb246IDAuMixcclxuICAgICAgICB0YXJnZXRzOiBbIHtcclxuICAgICAgICAgIHByb3BlcnR5OiBzY2FsZVByb3BlcnR5LFxyXG4gICAgICAgICAgdG86IGluaXRpYWxTY2FsZSxcclxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcclxuICAgICAgICB9IF1cclxuICAgICAgfSApO1xyXG4gICAgICBzY2FsZURvd25BbmltYXRpb24udXBkYXRlRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlUG9zaXRpb24gKTtcclxuICAgICAgc2NhbGVEb3duQW5pbWF0aW9uLmVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gYXN5bmNDb3VudGVyLmluY3JlbWVudCgpICk7XHJcblxyXG4gICAgICBzY2FsZVVwQW5pbWF0aW9uLnRoZW4oIHNjYWxlRG93bkFuaW1hdGlvbiApO1xyXG5cclxuICAgICAgc2NhbGVVcEFuaW1hdGlvbi5zdGFydCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGNhcmRzIGRvIG9uZSBjbG9ja3dpc2Ugcm90YXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhbmltYXRlQ2VsZWJyYXRpb24yKCBjYWxsYmFjazogKCkgPT4gdm9pZCApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBhc3luY0NvdW50ZXIgPSBuZXcgQXN5bmNDb3VudGVyKCB0aGlzLmNhcmROb2RlQ2VsbHMubGVuZ3RoLCBjYWxsYmFjayApO1xyXG5cclxuICAgIHRoaXMuY2FyZE5vZGVDZWxscy5mb3JFYWNoKCBjYXJkTm9kZSA9PiB7XHJcbiAgICAgIGNvbnN0IGNlbnRlciA9IGNhcmROb2RlLmNlbnRlci5jb3B5KCk7XHJcblxyXG4gICAgICBjb25zdCByb3RhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcbiAgICAgIHJvdGF0aW9uUHJvcGVydHkubGluayggcm90YXRpb24gPT4gY2FyZE5vZGUuc2V0Um90YXRpb24oIHJvdGF0aW9uICkgKTtcclxuXHJcbiAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICBkdXJhdGlvbjogMC42LFxyXG4gICAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgICAgcHJvcGVydHk6IHJvdGF0aW9uUHJvcGVydHksXHJcbiAgICAgICAgICB0bzogMiAqIE1hdGguUEksXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgICAgICAgfSBdXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc3QgdXBkYXRlUG9zaXRpb24gPSAoKSA9PiB7XHJcbiAgICAgICAgY2FyZE5vZGUuY2VudGVyID0gY2VudGVyO1xyXG4gICAgICB9O1xyXG4gICAgICBhbmltYXRpb24udXBkYXRlRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlUG9zaXRpb24gKTtcclxuICAgICAgYW5pbWF0aW9uLmVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gYXN5bmNDb3VudGVyLmluY3JlbWVudCgpICk7XHJcbiAgICAgIGFuaW1hdGlvbi5zdGFydCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGNhcmRzIGRvIHRoZSBcIndhdmVcIiBmcm9tIGxlZnQgdG8gcmlnaHQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhbmltYXRlQ2VsZWJyYXRpb24zKCBjYWxsYmFjazogKCkgPT4gdm9pZCApOiB2b2lkIHtcclxuICAgIGNvbnN0IGFzeW5jQ291bnRlciA9IG5ldyBBc3luY0NvdW50ZXIoIHRoaXMuY2FyZE5vZGVDZWxscy5sZW5ndGgsIGNhbGxiYWNrICk7XHJcblxyXG4gICAgdGhpcy5jYXJkTm9kZUNlbGxzLmZvckVhY2goICggY2FyZE5vZGUsIGluZGV4ICkgPT4ge1xyXG4gICAgICBjb25zdCBpbml0aWFsUG9zaXRpb25ZID0gY2FyZE5vZGUueTtcclxuICAgICAgY29uc3QganVtcEhlaWdodCA9IDMwO1xyXG4gICAgICBjb25zdCBwb3NpdGlvbllQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggaW5pdGlhbFBvc2l0aW9uWSApO1xyXG4gICAgICBwb3NpdGlvbllQcm9wZXJ0eS5saW5rKCBwb3NpdGlvblkgPT4geyBjYXJkTm9kZS55ID0gcG9zaXRpb25ZOyB9ICk7XHJcblxyXG4gICAgICBjb25zdCBnb1VwQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgIGR1cmF0aW9uOiAwLjIsXHJcbiAgICAgICAgdGFyZ2V0czogWyB7XHJcbiAgICAgICAgICBwcm9wZXJ0eTogcG9zaXRpb25ZUHJvcGVydHksXHJcbiAgICAgICAgICB0bzogaW5pdGlhbFBvc2l0aW9uWSAtIGp1bXBIZWlnaHQsXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgICAgICAgfSBdXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGdvVXBBbmltYXRpb24uZW5kZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZ29Eb3duQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgICAgZHVyYXRpb246IDAuMixcclxuICAgICAgICAgIHRhcmdldHM6IFsge1xyXG4gICAgICAgICAgICBwcm9wZXJ0eTogcG9zaXRpb25ZUHJvcGVydHksXHJcbiAgICAgICAgICAgIHRvOiBpbml0aWFsUG9zaXRpb25ZLFxyXG4gICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgICAgICAgICB9IF1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgZ29Eb3duQW5pbWF0aW9uLmVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gYXN5bmNDb3VudGVyLmluY3JlbWVudCgpICk7XHJcbiAgICAgICAgZ29Eb3duQW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIG9mZnNldCBzdGFydGluZyB0aGUgYW5pbWF0aW9uIGZvciBlYWNoIGNhcmRcclxuICAgICAgc3RlcFRpbWVyLnNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgICBnb1VwQW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgICAgIH0sIGluZGV4ICogNjAgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmIGFsbCBvZiB0aGUgZGF0YSBpcyBpbiBvcmRlciwgYnkgdXNpbmcgdGhlIGNlbGxzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FyZCBub2RlLiAgTm90ZSB0aGF0IG1lYW5zXHJcbiAgICogaXQgaXMgdXNpbmcgdGhlIGNlbGwgdGhlIGNhcmQgbWF5IGJlIGFuaW1hdGluZyB0by5cclxuICAgKi9cclxuICBwcml2YXRlIGlzRGF0YVNvcnRlZCgpOiBib29sZWFuIHtcclxuICAgIGxldCBsYXN0VmFsdWUgPSBudWxsO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jYXJkTm9kZUNlbGxzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuY2FyZE5vZGVDZWxsc1sgaSBdLnNvY2NlckJhbGwudmFsdWVQcm9wZXJ0eS52YWx1ZSE7XHJcblxyXG4gICAgICBpZiAoIGxhc3RWYWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSA8IGxhc3RWYWx1ZSApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdFZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0SG9tZVBvc2l0aW9uKCBjYXJkTm9kZTogQ2FyZE5vZGUgKTogVmVjdG9yMiB7XHJcbiAgICBjb25zdCBob21lSW5kZXggPSB0aGlzLmNhcmROb2RlQ2VsbHMuaW5kZXhPZiggY2FyZE5vZGUgKTtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggZ2V0Q2FyZFBvc2l0aW9uWCggaG9tZUluZGV4ICksIDAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhbmltYXRlVG9Ib21lQ2VsbCggY2FyZE5vZGU6IENhcmROb2RlLCBkdXJhdGlvbiA9IDAuMyApOiB2b2lkIHtcclxuICAgIGNhcmROb2RlLmFuaW1hdGVUbyggdGhpcy5nZXRIb21lUG9zaXRpb24oIGNhcmROb2RlICksIGR1cmF0aW9uICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0QXRIb21lQ2VsbCggY2FyZE5vZGU6IENhcmROb2RlICk6IHZvaWQge1xyXG4gICAgY2FyZE5vZGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMuZ2V0SG9tZVBvc2l0aW9uKCBjYXJkTm9kZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZCB0aGUgY2VsbCB0aGUgZHJhZ2dlZCBjYXJkIGlzIGNsb3Nlc3QgdG9cclxuICAgKi9cclxuICBwcml2YXRlIGdldENsb3Nlc3RDZWxsKCB4OiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGlmICggdGhpcy5jYXJkTm9kZUNlbGxzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgY2VsbEluZGljZXMgPSBfLnJhbmdlKCB0aGlzLmNhcmROb2RlQ2VsbHMubGVuZ3RoICk7XHJcbiAgICAgIHJldHVybiBfLm1pbkJ5KCBjZWxsSW5kaWNlcywgaW5kZXggPT4gTWF0aC5hYnMoIHggLSBnZXRDYXJkUG9zaXRpb25YKCBpbmRleCApICkgKSE7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldENhcmROb2RlKCBzb2NjZXJCYWxsOiBTb2NjZXJCYWxsICk6IENhcmROb2RlIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5jYXJkTm9kZUNlbGxzLmZpbmQoIGNhcmROb2RlID0+IGNhcmROb2RlLnNvY2NlckJhbGwgPT09IHNvY2NlckJhbGwgKSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzb3J0RGF0YSgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBJZiB0aGUgY2FyZCBpcyB2aXNpYmxlLCB0aGUgdmFsdWUgcHJvcGVydHkgc2hvdWxkIGJlIG5vbi1udWxsXHJcbiAgICBjb25zdCBzb3J0ZWQgPSBfLnNvcnRCeSggdGhpcy5jYXJkTm9kZUNlbGxzLCBjYXJkTm9kZSA9PiBjYXJkTm9kZS5zb2NjZXJCYWxsLnZhbHVlUHJvcGVydHkudmFsdWUgKTtcclxuICAgIHRoaXMuY2FyZE5vZGVDZWxscy5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5jYXJkTm9kZUNlbGxzLnB1c2goIC4uLnNvcnRlZCApO1xyXG4gICAgdGhpcy5jYXJkTm9kZUNlbGxzLmZvckVhY2goIGNhcmROb2RlID0+IHRoaXMuYW5pbWF0ZVRvSG9tZUNlbGwoIGNhcmROb2RlLCAwLjUgKSApO1xyXG4gICAgdGhpcy5jYXJkTm9kZUNlbGxzQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXREcmFnUmFuZ2UoKTogUmFuZ2Uge1xyXG4gICAgY29uc3QgbWF4WCA9IHRoaXMuY2FyZE5vZGVDZWxscy5sZW5ndGggPiAwID8gZ2V0Q2FyZFBvc2l0aW9uWCggdGhpcy5jYXJkTm9kZUNlbGxzLmxlbmd0aCAtIDEgKSA6IDA7XHJcbiAgICByZXR1cm4gbmV3IFJhbmdlKCAwLCBtYXhYICk7XHJcbiAgfVxyXG59XHJcblxyXG5jZW50ZXJBbmRWYXJpYWJpbGl0eS5yZWdpc3RlciggJ0NhcmROb2RlQ29udGFpbmVyJywgQ2FyZE5vZGVDb250YWluZXIgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxvQkFBb0IsTUFBTSwrQkFBK0I7QUFD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