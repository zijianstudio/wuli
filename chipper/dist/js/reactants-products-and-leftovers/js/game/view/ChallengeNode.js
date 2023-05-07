// Copyright 2014-2023, University of Colorado Boulder

/**
 * View of a Game challenge. This node is not 'active' (connected to the model) until the activate() function is called.
 * This supports the ability to preload a node, then activate it at some later time.  See issue #17.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import BoxType from '../../common/model/BoxType.js';
import RPALColors from '../../common/RPALColors.js';
import RPALConstants from '../../common/RPALConstants.js';
import HideBox from '../../common/view/HideBox.js';
import MoleculesEquationNode from '../../common/view/MoleculesEquationNode.js';
import QuantitiesNode from '../../common/view/QuantitiesNode.js';
import RightArrowNode from '../../common/view/RightArrowNode.js';
import DevStringUtils from '../../dev/DevStringUtils.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import PlayState from '../model/PlayState.js';
import GameButtons from './GameButtons.js';
import RandomBox from './RandomBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
const DEFAULT_MIN_ICON_SIZE = new Dimension2(0, 0);
export default class ChallengeNode extends Node {
  /**
   * @param model
   * @param challenge
   * @param challengeBounds - portion of the screen where the Challenge can be displayed
   * @param audioPlayer
   * @param [providedOptions]
   */
  constructor(model, challenge, challengeBounds, audioPlayer, providedOptions) {
    const options = optionize()({
      // SelfOptions
      boxSize: RPALConstants.GAME_BEFORE_AFTER_BOX_SIZE,
      quantityRange: RPALConstants.QUANTITY_RANGE,
      minIconSize: DEFAULT_MIN_ICON_SIZE
    }, providedOptions);
    super();

    // convenience variables, to improve readability
    const reaction = challenge.reaction;
    const guess = challenge.guess;
    const interactiveBox = challenge.interactiveBox;

    // which substances are visible depends on whether we're guessing 'Before' or 'After' quantities
    const reactants = interactiveBox === BoxType.BEFORE ? guess.reactants : reaction.reactants;
    const products = interactiveBox === BoxType.AFTER ? guess.products : reaction.products;
    const leftovers = interactiveBox === BoxType.AFTER ? guess.leftovers : reaction.leftovers;

    //------------------------------------------------------------------------------------
    // Equation
    //------------------------------------------------------------------------------------

    // equation
    const equationNode = new MoleculesEquationNode(reaction, {
      fill: 'black',
      top: challengeBounds.top + 10,
      plusXSpacing: 25,
      arrowXSpacing: 25
    });
    equationNode.left = challengeBounds.centerX - equationNode.arrowCenterX; // arrow at center of bounds

    // equations background
    const equationBackground = new Rectangle(0, 0, equationNode.width + 30, equationNode.height + 6, {
      cornerRadius: 3,
      fill: 'white',
      stroke: 'black',
      center: equationNode.center
    });
    this.addChild(equationBackground);
    this.addChild(equationNode);

    //------------------------------------------------------------------------------------
    // Property that tells us whether the 'Check' button should be enabled
    //------------------------------------------------------------------------------------

    // Check button is disabled if all guessable quantities are zero
    const quantityProperties = [];
    if (interactiveBox === BoxType.BEFORE) {
      guess.reactants.forEach(reactant => quantityProperties.push(reactant.quantityProperty));
    } else {
      guess.products.forEach(product => quantityProperties.push(product.quantityProperty));
      guess.leftovers.forEach(leftover => quantityProperties.push(leftover.quantityProperty));
    }

    // true if any quantity that the user can guess is non-zero
    this.checkButtonEnabledProperty = DerivedProperty.deriveAny(quantityProperties, () => !!_.find(quantityProperties, quantityProperty => quantityProperty.value !== 0));

    //------------------------------------------------------------------------------------
    // Boxes & arrow
    //------------------------------------------------------------------------------------

    // Arrow between boxes
    const arrowNode = new RightArrowNode({
      fill: RPALColors.STATUS_BAR_FILL,
      stroke: null,
      scale: 0.75,
      centerX: challengeBounds.centerX
      // y position handled below
    });

    this.addChild(arrowNode);

    // 'Before Reaction' box, with molecules at random positions
    const beforeBox = new RandomBox(reactants, {
      boxSize: options.boxSize,
      maxQuantity: options.quantityRange.max,
      right: arrowNode.left - 5,
      top: equationNode.bottom + 10
    });
    this.addChild(beforeBox);
    arrowNode.centerY = beforeBox.centerY;

    // 'After Reaction' box, with molecules at random positions
    const afterBox = new RandomBox(products.concat(leftovers), {
      boxSize: options.boxSize,
      maxQuantity: options.quantityRange.max,
      left: arrowNode.right + 5,
      top: beforeBox.top
    });
    this.addChild(afterBox);
    const guessBox = interactiveBox === BoxType.BEFORE ? beforeBox : afterBox;
    const answerBox = interactiveBox === BoxType.BEFORE ? afterBox : beforeBox;

    //------------------------------------------------------------------------------------
    // Face
    //------------------------------------------------------------------------------------

    const faceNode = new FaceWithPointsNode({
      visible: false,
      faceDiameter: 150,
      faceOpacity: 0.5,
      pointsAlignment: 'rightCenter',
      pointsFill: 'yellow',
      pointsStroke: 'rgb(50,50,50)',
      pointsOpacity: 0.65
    });
    this.addChild(faceNode);

    //------------------------------------------------------------------------------------
    // Question mark
    //------------------------------------------------------------------------------------

    const questionMark = new Text(ReactantsProductsAndLeftoversStrings.questionMarkStringProperty, {
      font: new PhetFont({
        size: 150,
        weight: 'bold'
      }),
      maxWidth: 0.75 * options.boxSize.width // constrain width for i18n
    });

    this.addChild(questionMark);

    // visible only until the user has entered a valid guess
    const checkButtonEnabledObserver = checkButtonEnabled => {
      questionMark.visible = !checkButtonEnabled;
      if (checkButtonEnabled) {
        this.checkButtonEnabledProperty.unlink(checkButtonEnabledObserver);
      }
    };
    // unlink is unnecessary, since this property belongs to this instance
    this.checkButtonEnabledProperty.link(checkButtonEnabledObserver);

    //------------------------------------------------------------------------------------
    // Buttons (Check, Try Again, ...)
    //------------------------------------------------------------------------------------

    const buttons = new GameButtons(model, this.checkButtonEnabledProperty, {
      maxTextWidth: 0.65 * options.boxSize.width
    });
    this.addChild(buttons);

    //------------------------------------------------------------------------------------
    // Everything below the boxes
    //------------------------------------------------------------------------------------

    // x-offsets of substances relative to their boxes
    const beforeXOffsets = QuantitiesNode.createXOffsets(reactants.length, options.boxSize.width);
    const afterXOffsets = QuantitiesNode.createXOffsets(products.length + leftovers.length, options.boxSize.width);
    const quantitiesNode = new QuantitiesNode(reactants, products, leftovers, beforeXOffsets, afterXOffsets, {
      interactiveBox: interactiveBox,
      boxWidth: options.boxSize.width,
      afterBoxXOffset: afterBox.left - beforeBox.left,
      minIconSize: options.minIconSize,
      quantityRange: options.quantityRange,
      hideNumbersBox: !challenge.numbersVisible,
      x: beforeBox.x,
      top: beforeBox.bottom + 4,
      tandem: Tandem.OPT_OUT //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/78
    });

    this.addChild(quantitiesNode);

    //------------------------------------------------------------------------------------
    // Optional 'Hide molecules' box, on top of the answer box.
    //------------------------------------------------------------------------------------

    const hideMoleculesBox = new HideBox({
      boxSize: options.boxSize,
      iconHeight: 0.4 * options.boxSize.height,
      cornerRadius: 3,
      left: answerBox.left,
      bottom: answerBox.bottom
    });
    this.addChild(hideMoleculesBox);

    //------------------------------------------------------------------------------------
    // Dynamic layout
    //------------------------------------------------------------------------------------

    // Center buttons inside bottom of interactive box.
    buttons.boundsProperty.link(() => {
      buttons.centerX = guessBox.centerX;
      buttons.bottom = guessBox.bottom - 15;
    });

    // Center question mark in negative space above buttons.
    const questionMarkMultilink = Multilink.multilink([questionMark.boundsProperty, buttons.boundsProperty], (questionMarkBounds, buttonBounds) => {
      questionMark.centerX = guessBox.centerX;
      if (buttonBounds.equals(Bounds2.NOTHING)) {
        questionMark.centerY = guessBox.centerY;
      } else {
        questionMark.centerY = guessBox.top + (buttons.top - guessBox.top) / 2;
      }
    });

    // Center face in negative space above buttons.
    const faceNodeMultilink = Multilink.multilink([buttons.boundsProperty], buttonBounds => {
      faceNode.centerX = guessBox.centerX;
      if (buttonBounds.equals(Bounds2.NOTHING)) {
        faceNode.centerY = guessBox.centerY;
      } else {
        faceNode.centerY = guessBox.top + (buttons.top - guessBox.top) / 2;
      }
    });

    //------------------------------------------------------------------------------------
    // Observers
    //------------------------------------------------------------------------------------

    // Move from "Try Again" to "Check" state when a quantity is changed, see reactants-products-and-leftovers#37.
    // Must be disposed.
    const answerChangedMultilink = Multilink.lazyMultilinkAny(quantityProperties, () => {
      if (model.playStateProperty.value === PlayState.TRY_AGAIN) {
        model.playStateProperty.value = PlayState.SECOND_CHECK;
      }
    });

    // handle PlayState changes
    const playStateObserver = playState => {
      // face
      let faceVisible = false;
      let facePoints = 0;
      if (playState === PlayState.TRY_AGAIN || playState === PlayState.SHOW_ANSWER) {
        audioPlayer.wrongAnswer();
        facePoints = 0;
        faceVisible = true;
      } else if (playState === PlayState.NEXT) {
        // Check facePoints instead of correctness of challenge, because correct answer has been filled in by now.
        facePoints = challenge.points;
        if (challenge.points > 0) {
          audioPlayer.correctAnswer();
          faceVisible = true;
        }
      }

      // Update the face
      faceNode.setPoints(facePoints);
      facePoints === 0 ? faceNode.frown() : faceNode.smile();
      faceNode.visible = faceVisible;

      // 'hide' boxes
      hideMoleculesBox.visible = playState !== PlayState.NEXT && !challenge.moleculesVisible;
      answerBox.visible = !hideMoleculesBox.visible; // also hide the answer box, so we don't see its stroke
      quantitiesNode.setHideNumbersBoxVisible(playState !== PlayState.NEXT && !challenge.numbersVisible);

      // switch between spinners and static numbers
      quantitiesNode.setInteractive(PlayState.INTERACTIVE_STATES.includes(playState));
    };
    model.playStateProperty.link(playStateObserver);

    //------------------------------------------------------------------------------------
    // Developer
    //------------------------------------------------------------------------------------

    // The answer to the current challenge, bottom center
    if (phet.chipper.queryParameters.showAnswers) {
      this.addChild(new Text(DevStringUtils.quantitiesString(reaction), {
        fill: 'red',
        font: new PhetFont(12),
        centerX: challengeBounds.centerX,
        bottom: challengeBounds.bottom - 5
      }));
    }
    this.mutate(options);
    this.disposeChallengeNode = () => {
      // Multilinks
      questionMarkMultilink.dispose();
      faceNodeMultilink.dispose();
      answerChangedMultilink.dispose();

      // Properties
      this.checkButtonEnabledProperty.dispose();
      if (model.playStateProperty.hasListener(playStateObserver)) {
        model.playStateProperty.unlink(playStateObserver);
      }

      // Nodes
      questionMark.dispose();
      buttons.dispose();
      beforeBox.dispose();
      afterBox.dispose();
      quantitiesNode.dispose();
    };
    this.playStateObserver = playStateObserver;
    this.buttons = buttons;
  }
  dispose() {
    this.disposeChallengeNode();
    super.dispose();
  }
}
reactantsProductsAndLeftovers.register('ChallengeNode', ChallengeNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIm9wdGlvbml6ZSIsIkZhY2VXaXRoUG9pbnRzTm9kZSIsIlBoZXRGb250IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJCb3hUeXBlIiwiUlBBTENvbG9ycyIsIlJQQUxDb25zdGFudHMiLCJIaWRlQm94IiwiTW9sZWN1bGVzRXF1YXRpb25Ob2RlIiwiUXVhbnRpdGllc05vZGUiLCJSaWdodEFycm93Tm9kZSIsIkRldlN0cmluZ1V0aWxzIiwicmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMiLCJSZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MiLCJQbGF5U3RhdGUiLCJHYW1lQnV0dG9ucyIsIlJhbmRvbUJveCIsIlRhbmRlbSIsIkRFRkFVTFRfTUlOX0lDT05fU0laRSIsIkNoYWxsZW5nZU5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiY2hhbGxlbmdlIiwiY2hhbGxlbmdlQm91bmRzIiwiYXVkaW9QbGF5ZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYm94U2l6ZSIsIkdBTUVfQkVGT1JFX0FGVEVSX0JPWF9TSVpFIiwicXVhbnRpdHlSYW5nZSIsIlFVQU5USVRZX1JBTkdFIiwibWluSWNvblNpemUiLCJyZWFjdGlvbiIsImd1ZXNzIiwiaW50ZXJhY3RpdmVCb3giLCJyZWFjdGFudHMiLCJCRUZPUkUiLCJwcm9kdWN0cyIsIkFGVEVSIiwibGVmdG92ZXJzIiwiZXF1YXRpb25Ob2RlIiwiZmlsbCIsInRvcCIsInBsdXNYU3BhY2luZyIsImFycm93WFNwYWNpbmciLCJsZWZ0IiwiY2VudGVyWCIsImFycm93Q2VudGVyWCIsImVxdWF0aW9uQmFja2dyb3VuZCIsIndpZHRoIiwiaGVpZ2h0IiwiY29ybmVyUmFkaXVzIiwic3Ryb2tlIiwiY2VudGVyIiwiYWRkQ2hpbGQiLCJxdWFudGl0eVByb3BlcnRpZXMiLCJmb3JFYWNoIiwicmVhY3RhbnQiLCJwdXNoIiwicXVhbnRpdHlQcm9wZXJ0eSIsInByb2R1Y3QiLCJsZWZ0b3ZlciIsImNoZWNrQnV0dG9uRW5hYmxlZFByb3BlcnR5IiwiZGVyaXZlQW55IiwiXyIsImZpbmQiLCJ2YWx1ZSIsImFycm93Tm9kZSIsIlNUQVRVU19CQVJfRklMTCIsInNjYWxlIiwiYmVmb3JlQm94IiwibWF4UXVhbnRpdHkiLCJtYXgiLCJyaWdodCIsImJvdHRvbSIsImNlbnRlclkiLCJhZnRlckJveCIsImNvbmNhdCIsImd1ZXNzQm94IiwiYW5zd2VyQm94IiwiZmFjZU5vZGUiLCJ2aXNpYmxlIiwiZmFjZURpYW1ldGVyIiwiZmFjZU9wYWNpdHkiLCJwb2ludHNBbGlnbm1lbnQiLCJwb2ludHNGaWxsIiwicG9pbnRzU3Ryb2tlIiwicG9pbnRzT3BhY2l0eSIsInF1ZXN0aW9uTWFyayIsInF1ZXN0aW9uTWFya1N0cmluZ1Byb3BlcnR5IiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJtYXhXaWR0aCIsImNoZWNrQnV0dG9uRW5hYmxlZE9ic2VydmVyIiwiY2hlY2tCdXR0b25FbmFibGVkIiwidW5saW5rIiwibGluayIsImJ1dHRvbnMiLCJtYXhUZXh0V2lkdGgiLCJiZWZvcmVYT2Zmc2V0cyIsImNyZWF0ZVhPZmZzZXRzIiwibGVuZ3RoIiwiYWZ0ZXJYT2Zmc2V0cyIsInF1YW50aXRpZXNOb2RlIiwiYm94V2lkdGgiLCJhZnRlckJveFhPZmZzZXQiLCJoaWRlTnVtYmVyc0JveCIsIm51bWJlcnNWaXNpYmxlIiwieCIsInRhbmRlbSIsIk9QVF9PVVQiLCJoaWRlTW9sZWN1bGVzQm94IiwiaWNvbkhlaWdodCIsImJvdW5kc1Byb3BlcnR5IiwicXVlc3Rpb25NYXJrTXVsdGlsaW5rIiwibXVsdGlsaW5rIiwicXVlc3Rpb25NYXJrQm91bmRzIiwiYnV0dG9uQm91bmRzIiwiZXF1YWxzIiwiTk9USElORyIsImZhY2VOb2RlTXVsdGlsaW5rIiwiYW5zd2VyQ2hhbmdlZE11bHRpbGluayIsImxhenlNdWx0aWxpbmtBbnkiLCJwbGF5U3RhdGVQcm9wZXJ0eSIsIlRSWV9BR0FJTiIsIlNFQ09ORF9DSEVDSyIsInBsYXlTdGF0ZU9ic2VydmVyIiwicGxheVN0YXRlIiwiZmFjZVZpc2libGUiLCJmYWNlUG9pbnRzIiwiU0hPV19BTlNXRVIiLCJ3cm9uZ0Fuc3dlciIsIk5FWFQiLCJwb2ludHMiLCJjb3JyZWN0QW5zd2VyIiwic2V0UG9pbnRzIiwiZnJvd24iLCJzbWlsZSIsIm1vbGVjdWxlc1Zpc2libGUiLCJzZXRIaWRlTnVtYmVyc0JveFZpc2libGUiLCJzZXRJbnRlcmFjdGl2ZSIsIklOVEVSQUNUSVZFX1NUQVRFUyIsImluY2x1ZGVzIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJzaG93QW5zd2VycyIsInF1YW50aXRpZXNTdHJpbmciLCJtdXRhdGUiLCJkaXNwb3NlQ2hhbGxlbmdlTm9kZSIsImRpc3Bvc2UiLCJoYXNMaXN0ZW5lciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2hhbGxlbmdlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IG9mIGEgR2FtZSBjaGFsbGVuZ2UuIFRoaXMgbm9kZSBpcyBub3QgJ2FjdGl2ZScgKGNvbm5lY3RlZCB0byB0aGUgbW9kZWwpIHVudGlsIHRoZSBhY3RpdmF0ZSgpIGZ1bmN0aW9uIGlzIGNhbGxlZC5cclxuICogVGhpcyBzdXBwb3J0cyB0aGUgYWJpbGl0eSB0byBwcmVsb2FkIGEgbm9kZSwgdGhlbiBhY3RpdmF0ZSBpdCBhdCBzb21lIGxhdGVyIHRpbWUuICBTZWUgaXNzdWUgIzE3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBGYWNlV2l0aFBvaW50c05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0ZhY2VXaXRoUG9pbnRzTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEdhbWVBdWRpb1BsYXllciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9HYW1lQXVkaW9QbGF5ZXIuanMnO1xyXG5pbXBvcnQgQm94VHlwZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQm94VHlwZS5qcyc7XHJcbmltcG9ydCBSUEFMQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9SUEFMQ29sb3JzLmpzJztcclxuaW1wb3J0IFJQQUxDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1JQQUxDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgSGlkZUJveCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9IaWRlQm94LmpzJztcclxuaW1wb3J0IE1vbGVjdWxlc0VxdWF0aW9uTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Nb2xlY3VsZXNFcXVhdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgUXVhbnRpdGllc05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUXVhbnRpdGllc05vZGUuanMnO1xyXG5pbXBvcnQgUmlnaHRBcnJvd05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUmlnaHRBcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgRGV2U3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vZGV2L0RldlN0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IHJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIGZyb20gJy4uLy4uL3JlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLmpzJztcclxuaW1wb3J0IFJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzU3RyaW5ncyBmcm9tICcuLi8uLi9SZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlIGZyb20gJy4uL21vZGVsL0NoYWxsZW5nZS5qcyc7XHJcbmltcG9ydCBHYW1lTW9kZWwgZnJvbSAnLi4vbW9kZWwvR2FtZU1vZGVsLmpzJztcclxuaW1wb3J0IFBsYXlTdGF0ZSBmcm9tICcuLi9tb2RlbC9QbGF5U3RhdGUuanMnO1xyXG5pbXBvcnQgR2FtZUJ1dHRvbnMgZnJvbSAnLi9HYW1lQnV0dG9ucy5qcyc7XHJcbmltcG9ydCBSYW5kb21Cb3ggZnJvbSAnLi9SYW5kb21Cb3guanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuY29uc3QgREVGQVVMVF9NSU5fSUNPTl9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDAsIDAgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgYm94U2l6ZT86IERpbWVuc2lvbjI7IC8vIHNpemUgb2YgdGhlICdCZWZvcmUnIGFuZCAnQWZ0ZXInIGJveGVzXHJcbiAgcXVhbnRpdHlSYW5nZT86IFJhbmdlOyAvLyByYW5nZSBvZiB0aGUgcXVhbnRpdHkgdmFsdWVzXHJcbiAgbWluSWNvblNpemU/OiBEaW1lbnNpb24yOyAvLyBtaW5pbXVtIGFtb3VudCBvZiBsYXlvdXQgc3BhY2UgcmVzZXJ2ZWQgZm9yIFN1YnN0YW5jZSBpY29uc1xyXG59O1xyXG5cclxudHlwZSBDaGFsbGVuZ2VOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhbGxlbmdlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGNoZWNrQnV0dG9uRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHBsYXlTdGF0ZU9ic2VydmVyOiAoIHBsYXlTdGF0ZTogUGxheVN0YXRlICkgPT4gdm9pZDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGJ1dHRvbnM6IEdhbWVCdXR0b25zO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNoYWxsZW5nZU5vZGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBtb2RlbFxyXG4gICAqIEBwYXJhbSBjaGFsbGVuZ2VcclxuICAgKiBAcGFyYW0gY2hhbGxlbmdlQm91bmRzIC0gcG9ydGlvbiBvZiB0aGUgc2NyZWVuIHdoZXJlIHRoZSBDaGFsbGVuZ2UgY2FuIGJlIGRpc3BsYXllZFxyXG4gICAqIEBwYXJhbSBhdWRpb1BsYXllclxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IEdhbWVNb2RlbCwgY2hhbGxlbmdlOiBDaGFsbGVuZ2UsIGNoYWxsZW5nZUJvdW5kczogQm91bmRzMiwgYXVkaW9QbGF5ZXI6IEdhbWVBdWRpb1BsYXllcixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IENoYWxsZW5nZU5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q2hhbGxlbmdlTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgYm94U2l6ZTogUlBBTENvbnN0YW50cy5HQU1FX0JFRk9SRV9BRlRFUl9CT1hfU0laRSxcclxuICAgICAgcXVhbnRpdHlSYW5nZTogUlBBTENvbnN0YW50cy5RVUFOVElUWV9SQU5HRSxcclxuICAgICAgbWluSWNvblNpemU6IERFRkFVTFRfTUlOX0lDT05fU0laRVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZXMsIHRvIGltcHJvdmUgcmVhZGFiaWxpdHlcclxuICAgIGNvbnN0IHJlYWN0aW9uID0gY2hhbGxlbmdlLnJlYWN0aW9uO1xyXG4gICAgY29uc3QgZ3Vlc3MgPSBjaGFsbGVuZ2UuZ3Vlc3M7XHJcbiAgICBjb25zdCBpbnRlcmFjdGl2ZUJveCA9IGNoYWxsZW5nZS5pbnRlcmFjdGl2ZUJveDtcclxuXHJcbiAgICAvLyB3aGljaCBzdWJzdGFuY2VzIGFyZSB2aXNpYmxlIGRlcGVuZHMgb24gd2hldGhlciB3ZSdyZSBndWVzc2luZyAnQmVmb3JlJyBvciAnQWZ0ZXInIHF1YW50aXRpZXNcclxuICAgIGNvbnN0IHJlYWN0YW50cyA9ICggaW50ZXJhY3RpdmVCb3ggPT09IEJveFR5cGUuQkVGT1JFICkgPyBndWVzcy5yZWFjdGFudHMgOiByZWFjdGlvbi5yZWFjdGFudHM7XHJcbiAgICBjb25zdCBwcm9kdWN0cyA9ICggaW50ZXJhY3RpdmVCb3ggPT09IEJveFR5cGUuQUZURVIgKSA/IGd1ZXNzLnByb2R1Y3RzIDogcmVhY3Rpb24ucHJvZHVjdHM7XHJcbiAgICBjb25zdCBsZWZ0b3ZlcnMgPSAoIGludGVyYWN0aXZlQm94ID09PSBCb3hUeXBlLkFGVEVSICkgPyBndWVzcy5sZWZ0b3ZlcnMgOiByZWFjdGlvbi5sZWZ0b3ZlcnM7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIEVxdWF0aW9uXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIGVxdWF0aW9uXHJcbiAgICBjb25zdCBlcXVhdGlvbk5vZGUgPSBuZXcgTW9sZWN1bGVzRXF1YXRpb25Ob2RlKCByZWFjdGlvbiwge1xyXG4gICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICB0b3A6IGNoYWxsZW5nZUJvdW5kcy50b3AgKyAxMCxcclxuICAgICAgcGx1c1hTcGFjaW5nOiAyNSxcclxuICAgICAgYXJyb3dYU3BhY2luZzogMjVcclxuICAgIH0gKTtcclxuICAgIGVxdWF0aW9uTm9kZS5sZWZ0ID0gY2hhbGxlbmdlQm91bmRzLmNlbnRlclggLSBlcXVhdGlvbk5vZGUuYXJyb3dDZW50ZXJYOyAvLyBhcnJvdyBhdCBjZW50ZXIgb2YgYm91bmRzXHJcblxyXG4gICAgLy8gZXF1YXRpb25zIGJhY2tncm91bmRcclxuICAgIGNvbnN0IGVxdWF0aW9uQmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGVxdWF0aW9uTm9kZS53aWR0aCArIDMwLCBlcXVhdGlvbk5vZGUuaGVpZ2h0ICsgNiwge1xyXG4gICAgICBjb3JuZXJSYWRpdXM6IDMsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgY2VudGVyOiBlcXVhdGlvbk5vZGUuY2VudGVyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggZXF1YXRpb25CYWNrZ3JvdW5kICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBlcXVhdGlvbk5vZGUgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gUHJvcGVydHkgdGhhdCB0ZWxscyB1cyB3aGV0aGVyIHRoZSAnQ2hlY2snIGJ1dHRvbiBzaG91bGQgYmUgZW5hYmxlZFxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDaGVjayBidXR0b24gaXMgZGlzYWJsZWQgaWYgYWxsIGd1ZXNzYWJsZSBxdWFudGl0aWVzIGFyZSB6ZXJvXHJcbiAgICBjb25zdCBxdWFudGl0eVByb3BlcnRpZXM6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj5bXSA9IFtdO1xyXG4gICAgaWYgKCBpbnRlcmFjdGl2ZUJveCA9PT0gQm94VHlwZS5CRUZPUkUgKSB7XHJcbiAgICAgIGd1ZXNzLnJlYWN0YW50cy5mb3JFYWNoKCByZWFjdGFudCA9PiBxdWFudGl0eVByb3BlcnRpZXMucHVzaCggcmVhY3RhbnQucXVhbnRpdHlQcm9wZXJ0eSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZ3Vlc3MucHJvZHVjdHMuZm9yRWFjaCggcHJvZHVjdCA9PiBxdWFudGl0eVByb3BlcnRpZXMucHVzaCggcHJvZHVjdC5xdWFudGl0eVByb3BlcnR5ICkgKTtcclxuICAgICAgZ3Vlc3MubGVmdG92ZXJzLmZvckVhY2goIGxlZnRvdmVyID0+IHF1YW50aXR5UHJvcGVydGllcy5wdXNoKCBsZWZ0b3Zlci5xdWFudGl0eVByb3BlcnR5ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0cnVlIGlmIGFueSBxdWFudGl0eSB0aGF0IHRoZSB1c2VyIGNhbiBndWVzcyBpcyBub24temVyb1xyXG4gICAgdGhpcy5jaGVja0J1dHRvbkVuYWJsZWRQcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5kZXJpdmVBbnkoIHF1YW50aXR5UHJvcGVydGllcywgKCkgPT5cclxuICAgICAgISFfLmZpbmQoIHF1YW50aXR5UHJvcGVydGllcywgcXVhbnRpdHlQcm9wZXJ0eSA9PiAoIHF1YW50aXR5UHJvcGVydHkudmFsdWUgIT09IDAgKSApXHJcbiAgICApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBCb3hlcyAmIGFycm93XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIEFycm93IGJldHdlZW4gYm94ZXNcclxuICAgIGNvbnN0IGFycm93Tm9kZSA9IG5ldyBSaWdodEFycm93Tm9kZSgge1xyXG4gICAgICBmaWxsOiBSUEFMQ29sb3JzLlNUQVRVU19CQVJfRklMTCxcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICBzY2FsZTogMC43NSxcclxuICAgICAgY2VudGVyWDogY2hhbGxlbmdlQm91bmRzLmNlbnRlclhcclxuICAgICAgLy8geSBwb3NpdGlvbiBoYW5kbGVkIGJlbG93XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhcnJvd05vZGUgKTtcclxuXHJcbiAgICAvLyAnQmVmb3JlIFJlYWN0aW9uJyBib3gsIHdpdGggbW9sZWN1bGVzIGF0IHJhbmRvbSBwb3NpdGlvbnNcclxuICAgIGNvbnN0IGJlZm9yZUJveCA9IG5ldyBSYW5kb21Cb3goIHJlYWN0YW50cywge1xyXG4gICAgICBib3hTaXplOiBvcHRpb25zLmJveFNpemUsXHJcbiAgICAgIG1heFF1YW50aXR5OiBvcHRpb25zLnF1YW50aXR5UmFuZ2UubWF4LFxyXG4gICAgICByaWdodDogYXJyb3dOb2RlLmxlZnQgLSA1LFxyXG4gICAgICB0b3A6IGVxdWF0aW9uTm9kZS5ib3R0b20gKyAxMFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYmVmb3JlQm94ICk7XHJcbiAgICBhcnJvd05vZGUuY2VudGVyWSA9IGJlZm9yZUJveC5jZW50ZXJZO1xyXG5cclxuICAgIC8vICdBZnRlciBSZWFjdGlvbicgYm94LCB3aXRoIG1vbGVjdWxlcyBhdCByYW5kb20gcG9zaXRpb25zXHJcbiAgICBjb25zdCBhZnRlckJveCA9IG5ldyBSYW5kb21Cb3goIHByb2R1Y3RzLmNvbmNhdCggbGVmdG92ZXJzICksIHtcclxuICAgICAgYm94U2l6ZTogb3B0aW9ucy5ib3hTaXplLFxyXG4gICAgICBtYXhRdWFudGl0eTogb3B0aW9ucy5xdWFudGl0eVJhbmdlLm1heCxcclxuICAgICAgbGVmdDogYXJyb3dOb2RlLnJpZ2h0ICsgNSxcclxuICAgICAgdG9wOiBiZWZvcmVCb3gudG9wXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhZnRlckJveCApO1xyXG5cclxuICAgIGNvbnN0IGd1ZXNzQm94ID0gKCBpbnRlcmFjdGl2ZUJveCA9PT0gQm94VHlwZS5CRUZPUkUgKSA/IGJlZm9yZUJveCA6IGFmdGVyQm94O1xyXG4gICAgY29uc3QgYW5zd2VyQm94ID0gKCBpbnRlcmFjdGl2ZUJveCA9PT0gQm94VHlwZS5CRUZPUkUgKSA/IGFmdGVyQm94IDogYmVmb3JlQm94O1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBGYWNlXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNvbnN0IGZhY2VOb2RlID0gbmV3IEZhY2VXaXRoUG9pbnRzTm9kZSgge1xyXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgZmFjZURpYW1ldGVyOiAxNTAsXHJcbiAgICAgIGZhY2VPcGFjaXR5OiAwLjUsXHJcbiAgICAgIHBvaW50c0FsaWdubWVudDogJ3JpZ2h0Q2VudGVyJyxcclxuICAgICAgcG9pbnRzRmlsbDogJ3llbGxvdycsXHJcbiAgICAgIHBvaW50c1N0cm9rZTogJ3JnYig1MCw1MCw1MCknLFxyXG4gICAgICBwb2ludHNPcGFjaXR5OiAwLjY1XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmYWNlTm9kZSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBRdWVzdGlvbiBtYXJrXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNvbnN0IHF1ZXN0aW9uTWFyayA9IG5ldyBUZXh0KCBSZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MucXVlc3Rpb25NYXJrU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE1MCwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gICAgICBtYXhXaWR0aDogMC43NSAqIG9wdGlvbnMuYm94U2l6ZS53aWR0aCAvLyBjb25zdHJhaW4gd2lkdGggZm9yIGkxOG5cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHF1ZXN0aW9uTWFyayApO1xyXG5cclxuICAgIC8vIHZpc2libGUgb25seSB1bnRpbCB0aGUgdXNlciBoYXMgZW50ZXJlZCBhIHZhbGlkIGd1ZXNzXHJcbiAgICBjb25zdCBjaGVja0J1dHRvbkVuYWJsZWRPYnNlcnZlciA9ICggY2hlY2tCdXR0b25FbmFibGVkOiBib29sZWFuICkgPT4ge1xyXG4gICAgICBxdWVzdGlvbk1hcmsudmlzaWJsZSA9ICFjaGVja0J1dHRvbkVuYWJsZWQ7XHJcbiAgICAgIGlmICggY2hlY2tCdXR0b25FbmFibGVkICkge1xyXG4gICAgICAgIHRoaXMuY2hlY2tCdXR0b25FbmFibGVkUHJvcGVydHkudW5saW5rKCBjaGVja0J1dHRvbkVuYWJsZWRPYnNlcnZlciApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgLy8gdW5saW5rIGlzIHVubmVjZXNzYXJ5LCBzaW5jZSB0aGlzIHByb3BlcnR5IGJlbG9uZ3MgdG8gdGhpcyBpbnN0YW5jZVxyXG4gICAgdGhpcy5jaGVja0J1dHRvbkVuYWJsZWRQcm9wZXJ0eS5saW5rKCBjaGVja0J1dHRvbkVuYWJsZWRPYnNlcnZlciApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBCdXR0b25zIChDaGVjaywgVHJ5IEFnYWluLCAuLi4pXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNvbnN0IGJ1dHRvbnMgPSBuZXcgR2FtZUJ1dHRvbnMoIG1vZGVsLCB0aGlzLmNoZWNrQnV0dG9uRW5hYmxlZFByb3BlcnR5LCB7XHJcbiAgICAgIG1heFRleHRXaWR0aDogMC42NSAqIG9wdGlvbnMuYm94U2l6ZS53aWR0aFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYnV0dG9ucyApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBFdmVyeXRoaW5nIGJlbG93IHRoZSBib3hlc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyB4LW9mZnNldHMgb2Ygc3Vic3RhbmNlcyByZWxhdGl2ZSB0byB0aGVpciBib3hlc1xyXG4gICAgY29uc3QgYmVmb3JlWE9mZnNldHMgPSBRdWFudGl0aWVzTm9kZS5jcmVhdGVYT2Zmc2V0cyggcmVhY3RhbnRzLmxlbmd0aCwgb3B0aW9ucy5ib3hTaXplLndpZHRoICk7XHJcbiAgICBjb25zdCBhZnRlclhPZmZzZXRzID0gUXVhbnRpdGllc05vZGUuY3JlYXRlWE9mZnNldHMoIHByb2R1Y3RzLmxlbmd0aCArIGxlZnRvdmVycy5sZW5ndGgsIG9wdGlvbnMuYm94U2l6ZS53aWR0aCApO1xyXG5cclxuICAgIGNvbnN0IHF1YW50aXRpZXNOb2RlID0gbmV3IFF1YW50aXRpZXNOb2RlKCByZWFjdGFudHMsIHByb2R1Y3RzLCBsZWZ0b3ZlcnMsIGJlZm9yZVhPZmZzZXRzLCBhZnRlclhPZmZzZXRzLCB7XHJcbiAgICAgIGludGVyYWN0aXZlQm94OiBpbnRlcmFjdGl2ZUJveCxcclxuICAgICAgYm94V2lkdGg6IG9wdGlvbnMuYm94U2l6ZS53aWR0aCxcclxuICAgICAgYWZ0ZXJCb3hYT2Zmc2V0OiBhZnRlckJveC5sZWZ0IC0gYmVmb3JlQm94LmxlZnQsXHJcbiAgICAgIG1pbkljb25TaXplOiBvcHRpb25zLm1pbkljb25TaXplLFxyXG4gICAgICBxdWFudGl0eVJhbmdlOiBvcHRpb25zLnF1YW50aXR5UmFuZ2UsXHJcbiAgICAgIGhpZGVOdW1iZXJzQm94OiAhY2hhbGxlbmdlLm51bWJlcnNWaXNpYmxlLFxyXG4gICAgICB4OiBiZWZvcmVCb3gueCxcclxuICAgICAgdG9wOiBiZWZvcmVCb3guYm90dG9tICsgNCxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3JlYWN0YW50cy1wcm9kdWN0cy1hbmQtbGVmdG92ZXJzL2lzc3Vlcy83OFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcXVhbnRpdGllc05vZGUgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gT3B0aW9uYWwgJ0hpZGUgbW9sZWN1bGVzJyBib3gsIG9uIHRvcCBvZiB0aGUgYW5zd2VyIGJveC5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29uc3QgaGlkZU1vbGVjdWxlc0JveCA9IG5ldyBIaWRlQm94KCB7XHJcbiAgICAgIGJveFNpemU6IG9wdGlvbnMuYm94U2l6ZSxcclxuICAgICAgaWNvbkhlaWdodDogMC40ICogb3B0aW9ucy5ib3hTaXplLmhlaWdodCxcclxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICBsZWZ0OiBhbnN3ZXJCb3gubGVmdCxcclxuICAgICAgYm90dG9tOiBhbnN3ZXJCb3guYm90dG9tXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBoaWRlTW9sZWN1bGVzQm94ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIER5bmFtaWMgbGF5b3V0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIENlbnRlciBidXR0b25zIGluc2lkZSBib3R0b20gb2YgaW50ZXJhY3RpdmUgYm94LlxyXG4gICAgYnV0dG9ucy5ib3VuZHNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGJ1dHRvbnMuY2VudGVyWCA9IGd1ZXNzQm94LmNlbnRlclg7XHJcbiAgICAgIGJ1dHRvbnMuYm90dG9tID0gZ3Vlc3NCb3guYm90dG9tIC0gMTU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ2VudGVyIHF1ZXN0aW9uIG1hcmsgaW4gbmVnYXRpdmUgc3BhY2UgYWJvdmUgYnV0dG9ucy5cclxuICAgIGNvbnN0IHF1ZXN0aW9uTWFya011bHRpbGluayA9IE11bHRpbGluay5tdWx0aWxpbmsoIFsgcXVlc3Rpb25NYXJrLmJvdW5kc1Byb3BlcnR5LCBidXR0b25zLmJvdW5kc1Byb3BlcnR5IF0sXHJcbiAgICAgICggcXVlc3Rpb25NYXJrQm91bmRzLCBidXR0b25Cb3VuZHMgKSA9PiB7XHJcbiAgICAgICAgcXVlc3Rpb25NYXJrLmNlbnRlclggPSBndWVzc0JveC5jZW50ZXJYO1xyXG4gICAgICAgIGlmICggYnV0dG9uQm91bmRzLmVxdWFscyggQm91bmRzMi5OT1RISU5HICkgKSB7XHJcbiAgICAgICAgICBxdWVzdGlvbk1hcmsuY2VudGVyWSA9IGd1ZXNzQm94LmNlbnRlclk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcXVlc3Rpb25NYXJrLmNlbnRlclkgPSBndWVzc0JveC50b3AgKyAoIGJ1dHRvbnMudG9wIC0gZ3Vlc3NCb3gudG9wICkgLyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIENlbnRlciBmYWNlIGluIG5lZ2F0aXZlIHNwYWNlIGFib3ZlIGJ1dHRvbnMuXHJcbiAgICBjb25zdCBmYWNlTm9kZU11bHRpbGluayA9IE11bHRpbGluay5tdWx0aWxpbmsoIFsgYnV0dG9ucy5ib3VuZHNQcm9wZXJ0eSBdLCBidXR0b25Cb3VuZHMgPT4ge1xyXG4gICAgICBmYWNlTm9kZS5jZW50ZXJYID0gZ3Vlc3NCb3guY2VudGVyWDtcclxuICAgICAgaWYgKCBidXR0b25Cb3VuZHMuZXF1YWxzKCBCb3VuZHMyLk5PVEhJTkcgKSApIHtcclxuICAgICAgICBmYWNlTm9kZS5jZW50ZXJZID0gZ3Vlc3NCb3guY2VudGVyWTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBmYWNlTm9kZS5jZW50ZXJZID0gZ3Vlc3NCb3gudG9wICsgKCBidXR0b25zLnRvcCAtIGd1ZXNzQm94LnRvcCApIC8gMjtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBPYnNlcnZlcnNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gTW92ZSBmcm9tIFwiVHJ5IEFnYWluXCIgdG8gXCJDaGVja1wiIHN0YXRlIHdoZW4gYSBxdWFudGl0eSBpcyBjaGFuZ2VkLCBzZWUgcmVhY3RhbnRzLXByb2R1Y3RzLWFuZC1sZWZ0b3ZlcnMjMzcuXHJcbiAgICAvLyBNdXN0IGJlIGRpc3Bvc2VkLlxyXG4gICAgY29uc3QgYW5zd2VyQ2hhbmdlZE11bHRpbGluayA9IE11bHRpbGluay5sYXp5TXVsdGlsaW5rQW55KCBxdWFudGl0eVByb3BlcnRpZXMsICgpID0+IHtcclxuICAgICAgaWYgKCBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gUGxheVN0YXRlLlRSWV9BR0FJTiApIHtcclxuICAgICAgICBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS52YWx1ZSA9IFBsYXlTdGF0ZS5TRUNPTkRfQ0hFQ0s7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBoYW5kbGUgUGxheVN0YXRlIGNoYW5nZXNcclxuICAgIGNvbnN0IHBsYXlTdGF0ZU9ic2VydmVyID0gKCBwbGF5U3RhdGU6IFBsYXlTdGF0ZSApID0+IHtcclxuXHJcbiAgICAgIC8vIGZhY2VcclxuICAgICAgbGV0IGZhY2VWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIGxldCBmYWNlUG9pbnRzID0gMDtcclxuICAgICAgaWYgKCBwbGF5U3RhdGUgPT09IFBsYXlTdGF0ZS5UUllfQUdBSU4gfHwgcGxheVN0YXRlID09PSBQbGF5U3RhdGUuU0hPV19BTlNXRVIgKSB7XHJcbiAgICAgICAgYXVkaW9QbGF5ZXIud3JvbmdBbnN3ZXIoKTtcclxuICAgICAgICBmYWNlUG9pbnRzID0gMDtcclxuICAgICAgICBmYWNlVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHBsYXlTdGF0ZSA9PT0gUGxheVN0YXRlLk5FWFQgKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgZmFjZVBvaW50cyBpbnN0ZWFkIG9mIGNvcnJlY3RuZXNzIG9mIGNoYWxsZW5nZSwgYmVjYXVzZSBjb3JyZWN0IGFuc3dlciBoYXMgYmVlbiBmaWxsZWQgaW4gYnkgbm93LlxyXG4gICAgICAgIGZhY2VQb2ludHMgPSBjaGFsbGVuZ2UucG9pbnRzO1xyXG4gICAgICAgIGlmICggY2hhbGxlbmdlLnBvaW50cyA+IDAgKSB7XHJcbiAgICAgICAgICBhdWRpb1BsYXllci5jb3JyZWN0QW5zd2VyKCk7XHJcbiAgICAgICAgICBmYWNlVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIGZhY2VcclxuICAgICAgZmFjZU5vZGUuc2V0UG9pbnRzKCBmYWNlUG9pbnRzICk7XHJcbiAgICAgICggZmFjZVBvaW50cyA9PT0gMCApID8gZmFjZU5vZGUuZnJvd24oKSA6IGZhY2VOb2RlLnNtaWxlKCk7XHJcbiAgICAgIGZhY2VOb2RlLnZpc2libGUgPSBmYWNlVmlzaWJsZTtcclxuXHJcbiAgICAgIC8vICdoaWRlJyBib3hlc1xyXG4gICAgICBoaWRlTW9sZWN1bGVzQm94LnZpc2libGUgPSAoIHBsYXlTdGF0ZSAhPT0gUGxheVN0YXRlLk5FWFQgKSAmJiAhY2hhbGxlbmdlLm1vbGVjdWxlc1Zpc2libGU7XHJcbiAgICAgIGFuc3dlckJveC52aXNpYmxlID0gIWhpZGVNb2xlY3VsZXNCb3gudmlzaWJsZTsgLy8gYWxzbyBoaWRlIHRoZSBhbnN3ZXIgYm94LCBzbyB3ZSBkb24ndCBzZWUgaXRzIHN0cm9rZVxyXG4gICAgICBxdWFudGl0aWVzTm9kZS5zZXRIaWRlTnVtYmVyc0JveFZpc2libGUoICggcGxheVN0YXRlICE9PSBQbGF5U3RhdGUuTkVYVCApICYmICFjaGFsbGVuZ2UubnVtYmVyc1Zpc2libGUgKTtcclxuXHJcbiAgICAgIC8vIHN3aXRjaCBiZXR3ZWVuIHNwaW5uZXJzIGFuZCBzdGF0aWMgbnVtYmVyc1xyXG4gICAgICBxdWFudGl0aWVzTm9kZS5zZXRJbnRlcmFjdGl2ZSggUGxheVN0YXRlLklOVEVSQUNUSVZFX1NUQVRFUy5pbmNsdWRlcyggcGxheVN0YXRlICkgKTtcclxuICAgIH07XHJcbiAgICBtb2RlbC5wbGF5U3RhdGVQcm9wZXJ0eS5saW5rKCBwbGF5U3RhdGVPYnNlcnZlciApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBEZXZlbG9wZXJcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gVGhlIGFuc3dlciB0byB0aGUgY3VycmVudCBjaGFsbGVuZ2UsIGJvdHRvbSBjZW50ZXJcclxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zaG93QW5zd2VycyApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IFRleHQoIERldlN0cmluZ1V0aWxzLnF1YW50aXRpZXNTdHJpbmcoIHJlYWN0aW9uICksIHtcclxuICAgICAgICBmaWxsOiAncmVkJyxcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEyICksXHJcbiAgICAgICAgY2VudGVyWDogY2hhbGxlbmdlQm91bmRzLmNlbnRlclgsXHJcbiAgICAgICAgYm90dG9tOiBjaGFsbGVuZ2VCb3VuZHMuYm90dG9tIC0gNVxyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUNoYWxsZW5nZU5vZGUgPSAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBNdWx0aWxpbmtzXHJcbiAgICAgIHF1ZXN0aW9uTWFya011bHRpbGluay5kaXNwb3NlKCk7XHJcbiAgICAgIGZhY2VOb2RlTXVsdGlsaW5rLmRpc3Bvc2UoKTtcclxuICAgICAgYW5zd2VyQ2hhbmdlZE11bHRpbGluay5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAvLyBQcm9wZXJ0aWVzXHJcbiAgICAgIHRoaXMuY2hlY2tCdXR0b25FbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgICBpZiAoIG1vZGVsLnBsYXlTdGF0ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCBwbGF5U3RhdGVPYnNlcnZlciApICkge1xyXG4gICAgICAgIG1vZGVsLnBsYXlTdGF0ZVByb3BlcnR5LnVubGluayggcGxheVN0YXRlT2JzZXJ2ZXIgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTm9kZXNcclxuICAgICAgcXVlc3Rpb25NYXJrLmRpc3Bvc2UoKTtcclxuICAgICAgYnV0dG9ucy5kaXNwb3NlKCk7XHJcbiAgICAgIGJlZm9yZUJveC5kaXNwb3NlKCk7XHJcbiAgICAgIGFmdGVyQm94LmRpc3Bvc2UoKTtcclxuICAgICAgcXVhbnRpdGllc05vZGUuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnBsYXlTdGF0ZU9ic2VydmVyID0gcGxheVN0YXRlT2JzZXJ2ZXI7XHJcbiAgICB0aGlzLmJ1dHRvbnMgPSBidXR0b25zO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VDaGFsbGVuZ2VOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5yZWdpc3RlciggJ0NoYWxsZW5nZU5vZGUnLCBDaGFsbGVuZ2VOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBRXhELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUV6RCxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBQzdELE9BQU9DLGtCQUFrQixNQUFNLG1EQUFtRDtBQUNsRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBZUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBRXRGLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLDRCQUE0QjtBQUNuRCxPQUFPQyxhQUFhLE1BQU0sK0JBQStCO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSw4QkFBOEI7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