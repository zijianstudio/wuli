// Copyright 2017-2023, University of Colorado Boulder

/**
 * Scene for the 'Mystery' screen in 'Function Builder: Basics'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import FBColors from '../../../../function-builder/js/common/FBColors.js';
import FBQueryParameters from '../../../../function-builder/js/common/FBQueryParameters.js';
import ImageCard from '../../../../function-builder/js/common/model/cards/ImageCard.js';
import ImageCardNode from '../../../../function-builder/js/common/view/cards/ImageCardNode.js';
import CardContainer from '../../../../function-builder/js/common/view/containers/CardContainer.js';
import SceneNode from '../../../../function-builder/js/common/view/SceneNode.js';
import merge from '../../../../phet-core/js/merge.js';
import EyeToggleButton from '../../../../scenery-phet/js/buttons/EyeToggleButton.js';
import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import functionBuilderBasics from '../../functionBuilderBasics.js';
import FBBMysteryFunctionNode from './FBBMysteryFunctionNode.js';

// constants
const QUESTION_MARK_COLORS = [ 'red', 'rgb( 0, 170, 255 )', 'green', 'orange', 'magenta' ];

class FBBMysterySceneNode extends SceneNode {

  /**
   * @param {MysteryScene} scene - model for this scene
   * @param {Bounds2} layoutBounds - layoutBounds of the parent ScreenView
   * @param {Object} [options]
   */
  constructor( scene, layoutBounds, options ) {

    options = merge( {

      /*
       * Mystery scenes have a hidden function carousel, which is where we get functions for composing challenges.
       * This approach was necessary because the Mystery screen was added late in the development process, and
       * the existence of the function carousel was (by that point) required by too many things.
       */
      functionCarouselVisible: false,

      // Hide the checkbox that lets us show/hide the identify of functions in the builder.
      hideFunctionsCheckboxVisible: false,

      // Show an image on the 'See Inside' checkbox icon
      seeInsideIconType: 'image'

    }, options );

    super( scene, layoutBounds, FBBMysteryFunctionNode, options );

    const self = this;

    // Toggle buttons below each builder slot, for revealing identity of functions
    this.revealProperties = [];  // {Property.<boolean>[]}
    this.revealButtons = []; // {EyeToggleButton[]}
    for ( let i = 0; i < scene.builder.numberOfSlots; i++ ) {

      // create a closure for slotNumber using an IIFE
      ( () => {

        const slotNumber = i;

        // Property associated with the slot
        const revealProperty = new BooleanProperty( false );
        self.revealProperties.push( revealProperty );

        // wire up Property to control the function that's in the slot
        // unlink unnecessary, instances exist for lifetime of the sim
        revealProperty.link( reveal => {
          const functionNode = self.builderNode.getFunctionNode( slotNumber );
          if ( functionNode ) {
            functionNode.identityVisibleProperty.set( reveal );
          }
        } );

        // button below the slot
        const slotPosition = scene.builder.slots[ slotNumber ].position;
        const revealButton = new EyeToggleButton( revealProperty, {
          baseColor: FBColors.HIDDEN_FUNCTION,
          scale: 0.75,
          centerX: slotPosition.x,
          top: slotPosition.y + 65
        } );
        self.revealButtons.push( revealButton );
        self.controlsLayer.addChild( revealButton );

        // touchArea
        revealButton.touchArea = revealButton.localBounds.dilatedXY( 25, 15 );

      } )();
    }

    // button for generating a new challenge
    const generateButton = new RefreshButton( {
      listener: () => scene.nextChallenge(),
      iconHeight: 38,
      xMargin: 18,
      yMargin: 10,
      centerX: this.builderNode.centerX,
      top: this.builderNode.bottom + 65
    } );
    this.addChild( generateButton );

    // @private shows the answer below the generate button, for debugging, i18n not required
    this.answerNode = new Text( 'answer', {
      font: new PhetFont( 18 ),
      centerX: generateButton.centerX,
      top: generateButton.bottom + 10
    } );
    if ( phet.chipper.queryParameters.showAnswers ) {
      this.addChild( this.answerNode );
    }

    // Update when the challenge changes.
    // unlink unnecessary, instances exist for lifetime of the sim
    scene.challengeProperty.lazyLink( challenge => this.updateChallenge() );

    // Enable features based on number of cards that have been moved to the output carousel.
    // unlink unnecessary, instances exist for lifetime of the sim.
    this.outputCarousel.numberOfCardsProperty.link( numberOfCards => {

      // enabled function reveal buttons
      this.revealButtons.forEach( revealButton => {
        revealButton.enabled = revealButton.enabled || ( numberOfCards === 3 );
      } );

      // enable 'See Inside' checkbox
      this.seeInsideCheckbox.enabled = this.seeInsideCheckbox.enabled || ( numberOfCards === 1 );
    } );

    // @private colors for the '?' on function nodes
    this.questionMarkColors = dotRandom.shuffle( QUESTION_MARK_COLORS );

    // @private
    this.scene = scene;
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.resetChallengeControls();
  }

  /**
   * Creates the card containers that go in the input and output carousels.
   *
   * @param {Scene} scene
   * @param {Object} [containerOptions] - see CardContainer options
   * @returns {CarouselItem[]}
   * @protected
   * @override
   */
  createCardCarouselItems( scene, containerOptions ) {
    const containers = [];
    scene.cardContent.forEach( cardImage => {
      containers.push( {
        createNode: tandem => new CardContainer( ImageCard, ImageCardNode, cardImage, containerOptions )
      } );
    } );
    return containers;
  }

  /**
   * Resets controls that need to be reset each time the challenge changes.
   *
   * @private
   */
  resetChallengeControls() {

    // reset Properties for revealing function identity
    this.revealProperties.forEach( revealProperty => revealProperty.reset() );

    // disable buttons for revealing function identity
    this.revealButtons.forEach( revealButton => {
      revealButton.enabled = false;
    } );

    // reset 'See Inside' property
    this.seeInsideProperty.reset();

    // disable 'See Inside' checkbox
    this.seeInsideCheckbox.enabled = false;
  }

  /**
   * Completes initialization by displaying the first challenge.
   *
   * @public
   * @override
   */
  completeInitialization() {
    super.completeInitialization();
    this.updateChallenge();
  }

  /**
   * Synchronizes the displayed challenge with the model.
   *
   * @private
   */
  updateChallenge() {

    this.resetCarousels();
    this.builderNode.reset();
    this.resetFunctions();
    this.resetCards();

    const functionConstructors = this.scene.challengeProperty.get(); // {constructor[]}

    const questionMarkColors = this.getQuestionMarkColors( this.scene.builder.numberOfSlots );

    // transfer functions from carousel to builder, configured to match the challenge
    let slotNumber = 0;
    let answerText = '';
    for ( let i = 0; i < functionConstructors.length; i++ ) {

      // get a function node from the carousel
      const functionNode = this.getFunctionNode( functionConstructors[ i ] );

      // change the color of its question mark
      functionNode.setQuestionMarkColor( questionMarkColors[ i ] );

      // move the function to the builder
      functionNode.moveToBuilder( slotNumber );

      // hide the function's identity
      functionNode.identityVisibleProperty.set( false );

      // add to answer text
      answerText += functionNode.functionInstance.name;
      if ( i < functionConstructors.length - 1 ) {
        answerText += ' > ';
      }

      slotNumber++;
    }

    // Resets controls that need to be reset each time the challenge changes.
    this.resetChallengeControls();

    // show the answer for debugging
    this.answerNode.string = answerText;
    this.answerNode.centerX = this.builderNode.centerX;

    if ( FBQueryParameters.populateOutput ) {
      this.populateOutputCarousel();
    }
  }

  /**
   * Given a function constructor, get a corresponding FunctionNode from the carousel.
   * @param {constructor} functionConstructor - constructor for an ImageFunction
   * @returns {ImageFunctionNode}
   * @public
   */
  getFunctionNode( functionConstructor ) {

    // get the container that has functions of the specified type
    let functionContainer = null;
    for ( let i = 0; i < this.functionContainers.length && !functionContainer; i++ ) {
      if ( this.functionContainers[ i ].getFunctionConstructor() === functionConstructor ) {
        functionContainer = this.functionContainers[ i ];
      }
    }
    assert && assert( functionContainer, 'functionContainer not found' );
    assert && assert( !functionContainer.isEmpty(), 'functionContainer is empty' );

    // get the first item in the container
    return functionContainer.getContents()[ 0 ];
  }

  /**
   * Gets a set of question mark colors, containing no duplicates.
   * @param {number} numberOfColors
   * @returns {Color[]|string[]}
   * @public
   */
  getQuestionMarkColors( numberOfColors ) {

    assert && assert( numberOfColors <= QUESTION_MARK_COLORS.length );

    const colors = [];
    while ( colors.length < numberOfColors ) {

      // remove first color from the pool
      const color = this.questionMarkColors[ 0 ];
      this.questionMarkColors.splice( 0, 1 );

      // prevent duplicate colors
      if ( colors.indexOf( color ) === -1 ) {
        colors.push( color );
      }

      // replenish the colors
      if ( this.questionMarkColors.length === 0 ) {
        this.questionMarkColors = dotRandom.shuffle( QUESTION_MARK_COLORS );

        // prevent choosing the same color consecutively
        if ( this.questionMarkColors[ 0 ] === color ) {
          this.questionMarkColors.splice( 0, 1 );
        }
      }
    }
    assert && assert( colors.length === numberOfColors );
    return colors;
  }
}

functionBuilderBasics.register( 'FBBMysterySceneNode', FBBMysterySceneNode );
export default FBBMysterySceneNode;