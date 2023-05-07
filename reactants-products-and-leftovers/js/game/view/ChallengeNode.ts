// Copyright 2014-2023, University of Colorado Boulder

/**
 * View of a Game challenge. This node is not 'active' (connected to the model) until the activate() function is called.
 * This supports the ability to preload a node, then activate it at some later time.  See issue #17.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, NodeOptions, Rectangle, Text } from '../../../../scenery/js/imports.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
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
import Challenge from '../model/Challenge.js';
import GameModel from '../model/GameModel.js';
import PlayState from '../model/PlayState.js';
import GameButtons from './GameButtons.js';
import RandomBox from './RandomBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';

const DEFAULT_MIN_ICON_SIZE = new Dimension2( 0, 0 );

type SelfOptions = {
  boxSize?: Dimension2; // size of the 'Before' and 'After' boxes
  quantityRange?: Range; // range of the quantity values
  minIconSize?: Dimension2; // minimum amount of layout space reserved for Substance icons
};

type ChallengeNodeOptions = SelfOptions;

export default class ChallengeNode extends Node {

  private readonly checkButtonEnabledProperty: TReadOnlyProperty<boolean>;
  private readonly playStateObserver: ( playState: PlayState ) => void;
  private readonly buttons: GameButtons;
  private readonly disposeChallengeNode: () => void;

  /**
   * @param model
   * @param challenge
   * @param challengeBounds - portion of the screen where the Challenge can be displayed
   * @param audioPlayer
   * @param [providedOptions]
   */
  public constructor( model: GameModel, challenge: Challenge, challengeBounds: Bounds2, audioPlayer: GameAudioPlayer,
                      providedOptions?: ChallengeNodeOptions ) {

    const options = optionize<ChallengeNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      boxSize: RPALConstants.GAME_BEFORE_AFTER_BOX_SIZE,
      quantityRange: RPALConstants.QUANTITY_RANGE,
      minIconSize: DEFAULT_MIN_ICON_SIZE
    }, providedOptions );

    super();

    // convenience variables, to improve readability
    const reaction = challenge.reaction;
    const guess = challenge.guess;
    const interactiveBox = challenge.interactiveBox;

    // which substances are visible depends on whether we're guessing 'Before' or 'After' quantities
    const reactants = ( interactiveBox === BoxType.BEFORE ) ? guess.reactants : reaction.reactants;
    const products = ( interactiveBox === BoxType.AFTER ) ? guess.products : reaction.products;
    const leftovers = ( interactiveBox === BoxType.AFTER ) ? guess.leftovers : reaction.leftovers;

    //------------------------------------------------------------------------------------
    // Equation
    //------------------------------------------------------------------------------------

    // equation
    const equationNode = new MoleculesEquationNode( reaction, {
      fill: 'black',
      top: challengeBounds.top + 10,
      plusXSpacing: 25,
      arrowXSpacing: 25
    } );
    equationNode.left = challengeBounds.centerX - equationNode.arrowCenterX; // arrow at center of bounds

    // equations background
    const equationBackground = new Rectangle( 0, 0, equationNode.width + 30, equationNode.height + 6, {
      cornerRadius: 3,
      fill: 'white',
      stroke: 'black',
      center: equationNode.center
    } );

    this.addChild( equationBackground );
    this.addChild( equationNode );

    //------------------------------------------------------------------------------------
    // Property that tells us whether the 'Check' button should be enabled
    //------------------------------------------------------------------------------------

    // Check button is disabled if all guessable quantities are zero
    const quantityProperties: TReadOnlyProperty<number>[] = [];
    if ( interactiveBox === BoxType.BEFORE ) {
      guess.reactants.forEach( reactant => quantityProperties.push( reactant.quantityProperty ) );
    }
    else {
      guess.products.forEach( product => quantityProperties.push( product.quantityProperty ) );
      guess.leftovers.forEach( leftover => quantityProperties.push( leftover.quantityProperty ) );
    }

    // true if any quantity that the user can guess is non-zero
    this.checkButtonEnabledProperty = DerivedProperty.deriveAny( quantityProperties, () =>
      !!_.find( quantityProperties, quantityProperty => ( quantityProperty.value !== 0 ) )
    );

    //------------------------------------------------------------------------------------
    // Boxes & arrow
    //------------------------------------------------------------------------------------

    // Arrow between boxes
    const arrowNode = new RightArrowNode( {
      fill: RPALColors.STATUS_BAR_FILL,
      stroke: null,
      scale: 0.75,
      centerX: challengeBounds.centerX
      // y position handled below
    } );
    this.addChild( arrowNode );

    // 'Before Reaction' box, with molecules at random positions
    const beforeBox = new RandomBox( reactants, {
      boxSize: options.boxSize,
      maxQuantity: options.quantityRange.max,
      right: arrowNode.left - 5,
      top: equationNode.bottom + 10
    } );
    this.addChild( beforeBox );
    arrowNode.centerY = beforeBox.centerY;

    // 'After Reaction' box, with molecules at random positions
    const afterBox = new RandomBox( products.concat( leftovers ), {
      boxSize: options.boxSize,
      maxQuantity: options.quantityRange.max,
      left: arrowNode.right + 5,
      top: beforeBox.top
    } );
    this.addChild( afterBox );

    const guessBox = ( interactiveBox === BoxType.BEFORE ) ? beforeBox : afterBox;
    const answerBox = ( interactiveBox === BoxType.BEFORE ) ? afterBox : beforeBox;

    //------------------------------------------------------------------------------------
    // Face
    //------------------------------------------------------------------------------------

    const faceNode = new FaceWithPointsNode( {
      visible: false,
      faceDiameter: 150,
      faceOpacity: 0.5,
      pointsAlignment: 'rightCenter',
      pointsFill: 'yellow',
      pointsStroke: 'rgb(50,50,50)',
      pointsOpacity: 0.65
    } );
    this.addChild( faceNode );

    //------------------------------------------------------------------------------------
    // Question mark
    //------------------------------------------------------------------------------------

    const questionMark = new Text( ReactantsProductsAndLeftoversStrings.questionMarkStringProperty, {
      font: new PhetFont( { size: 150, weight: 'bold' } ),
      maxWidth: 0.75 * options.boxSize.width // constrain width for i18n
    } );
    this.addChild( questionMark );

    // visible only until the user has entered a valid guess
    const checkButtonEnabledObserver = ( checkButtonEnabled: boolean ) => {
      questionMark.visible = !checkButtonEnabled;
      if ( checkButtonEnabled ) {
        this.checkButtonEnabledProperty.unlink( checkButtonEnabledObserver );
      }
    };
    // unlink is unnecessary, since this property belongs to this instance
    this.checkButtonEnabledProperty.link( checkButtonEnabledObserver );

    //------------------------------------------------------------------------------------
    // Buttons (Check, Try Again, ...)
    //------------------------------------------------------------------------------------

    const buttons = new GameButtons( model, this.checkButtonEnabledProperty, {
      maxTextWidth: 0.65 * options.boxSize.width
    } );
    this.addChild( buttons );

    //------------------------------------------------------------------------------------
    // Everything below the boxes
    //------------------------------------------------------------------------------------

    // x-offsets of substances relative to their boxes
    const beforeXOffsets = QuantitiesNode.createXOffsets( reactants.length, options.boxSize.width );
    const afterXOffsets = QuantitiesNode.createXOffsets( products.length + leftovers.length, options.boxSize.width );

    const quantitiesNode = new QuantitiesNode( reactants, products, leftovers, beforeXOffsets, afterXOffsets, {
      interactiveBox: interactiveBox,
      boxWidth: options.boxSize.width,
      afterBoxXOffset: afterBox.left - beforeBox.left,
      minIconSize: options.minIconSize,
      quantityRange: options.quantityRange,
      hideNumbersBox: !challenge.numbersVisible,
      x: beforeBox.x,
      top: beforeBox.bottom + 4,
      tandem: Tandem.OPT_OUT //TODO https://github.com/phetsims/reactants-products-and-leftovers/issues/78
    } );
    this.addChild( quantitiesNode );

    //------------------------------------------------------------------------------------
    // Optional 'Hide molecules' box, on top of the answer box.
    //------------------------------------------------------------------------------------

    const hideMoleculesBox = new HideBox( {
      boxSize: options.boxSize,
      iconHeight: 0.4 * options.boxSize.height,
      cornerRadius: 3,
      left: answerBox.left,
      bottom: answerBox.bottom
    } );
    this.addChild( hideMoleculesBox );

    //------------------------------------------------------------------------------------
    // Dynamic layout
    //------------------------------------------------------------------------------------

    // Center buttons inside bottom of interactive box.
    buttons.boundsProperty.link( () => {
      buttons.centerX = guessBox.centerX;
      buttons.bottom = guessBox.bottom - 15;
    } );

    // Center question mark in negative space above buttons.
    const questionMarkMultilink = Multilink.multilink( [ questionMark.boundsProperty, buttons.boundsProperty ],
      ( questionMarkBounds, buttonBounds ) => {
        questionMark.centerX = guessBox.centerX;
        if ( buttonBounds.equals( Bounds2.NOTHING ) ) {
          questionMark.centerY = guessBox.centerY;
        }
        else {
          questionMark.centerY = guessBox.top + ( buttons.top - guessBox.top ) / 2;
        }
      } );

    // Center face in negative space above buttons.
    const faceNodeMultilink = Multilink.multilink( [ buttons.boundsProperty ], buttonBounds => {
      faceNode.centerX = guessBox.centerX;
      if ( buttonBounds.equals( Bounds2.NOTHING ) ) {
        faceNode.centerY = guessBox.centerY;
      }
      else {
        faceNode.centerY = guessBox.top + ( buttons.top - guessBox.top ) / 2;
      }
    } );

    //------------------------------------------------------------------------------------
    // Observers
    //------------------------------------------------------------------------------------

    // Move from "Try Again" to "Check" state when a quantity is changed, see reactants-products-and-leftovers#37.
    // Must be disposed.
    const answerChangedMultilink = Multilink.lazyMultilinkAny( quantityProperties, () => {
      if ( model.playStateProperty.value === PlayState.TRY_AGAIN ) {
        model.playStateProperty.value = PlayState.SECOND_CHECK;
      }
    } );

    // handle PlayState changes
    const playStateObserver = ( playState: PlayState ) => {

      // face
      let faceVisible = false;
      let facePoints = 0;
      if ( playState === PlayState.TRY_AGAIN || playState === PlayState.SHOW_ANSWER ) {
        audioPlayer.wrongAnswer();
        facePoints = 0;
        faceVisible = true;
      }
      else if ( playState === PlayState.NEXT ) {
        // Check facePoints instead of correctness of challenge, because correct answer has been filled in by now.
        facePoints = challenge.points;
        if ( challenge.points > 0 ) {
          audioPlayer.correctAnswer();
          faceVisible = true;
        }
      }

      // Update the face
      faceNode.setPoints( facePoints );
      ( facePoints === 0 ) ? faceNode.frown() : faceNode.smile();
      faceNode.visible = faceVisible;

      // 'hide' boxes
      hideMoleculesBox.visible = ( playState !== PlayState.NEXT ) && !challenge.moleculesVisible;
      answerBox.visible = !hideMoleculesBox.visible; // also hide the answer box, so we don't see its stroke
      quantitiesNode.setHideNumbersBoxVisible( ( playState !== PlayState.NEXT ) && !challenge.numbersVisible );

      // switch between spinners and static numbers
      quantitiesNode.setInteractive( PlayState.INTERACTIVE_STATES.includes( playState ) );
    };
    model.playStateProperty.link( playStateObserver );

    //------------------------------------------------------------------------------------
    // Developer
    //------------------------------------------------------------------------------------

    // The answer to the current challenge, bottom center
    if ( phet.chipper.queryParameters.showAnswers ) {
      this.addChild( new Text( DevStringUtils.quantitiesString( reaction ), {
        fill: 'red',
        font: new PhetFont( 12 ),
        centerX: challengeBounds.centerX,
        bottom: challengeBounds.bottom - 5
      } ) );
    }

    this.mutate( options );

    this.disposeChallengeNode = () => {

      // Multilinks
      questionMarkMultilink.dispose();
      faceNodeMultilink.dispose();
      answerChangedMultilink.dispose();

      // Properties
      this.checkButtonEnabledProperty.dispose();
      if ( model.playStateProperty.hasListener( playStateObserver ) ) {
        model.playStateProperty.unlink( playStateObserver );
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

  public override dispose(): void {
    this.disposeChallengeNode();
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'ChallengeNode', ChallengeNode );