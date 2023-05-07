// Copyright 2017-2023, University of Colorado Boulder

/**
 * A scene in the 'Mystery' screen in 'Function Builder: Basics'.
 * This Mystery screen deals with Pattern (image) cards and functions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import beaker_png from '../../../../function-builder/images/cards/beaker_png.js';
import butterfly_png from '../../../../function-builder/images/cards/butterfly_png.js';
import cherries_png from '../../../../function-builder/images/cards/cherries_png.js';
import circle_png from '../../../../function-builder/images/cards/circle_png.js';
import feet_png from '../../../../function-builder/images/cards/feet_png.js';
import planet_png from '../../../../function-builder/images/cards/planet_png.js';
import rectangle_png from '../../../../function-builder/images/cards/rectangle_png.js';
import snowflake_png from '../../../../function-builder/images/cards/snowflake_png.js';
import star_png from '../../../../function-builder/images/cards/star_png.js';
import stickFigure_png from '../../../../function-builder/images/cards/stickFigure_png.js';
import sun_png from '../../../../function-builder/images/cards/sun_png.js';
import triangle_png from '../../../../function-builder/images/cards/triangle_png.js';
import FBConstants from '../../../../function-builder/js/common/FBConstants.js';
import FBQueryParameters from '../../../../function-builder/js/common/FBQueryParameters.js';
import Builder from '../../../../function-builder/js/common/model/builder/Builder.js';
import FunctionCreator from '../../../../function-builder/js/common/model/functions/FunctionCreator.js';
import Scene from '../../../../function-builder/js/common/model/Scene.js';
import FBIconFactory from '../../../../function-builder/js/common/view/FBIconFactory.js'; // eslint-disable-line no-view-imported-from-model
import MysteryChallenges from '../../../../function-builder/js/mystery/model/MysteryChallenges.js';
import Erase from '../../../../function-builder/js/patterns/model/functions/Erase.js';
import Grayscale from '../../../../function-builder/js/patterns/model/functions/Grayscale.js';
import Identity from '../../../../function-builder/js/patterns/model/functions/Identity.js';
import InvertRGB from '../../../../function-builder/js/patterns/model/functions/InvertRGB.js';
import Mirror from '../../../../function-builder/js/patterns/model/functions/Mirror.js';
import Rotate180 from '../../../../function-builder/js/patterns/model/functions/Rotate180.js';
import Rotate90 from '../../../../function-builder/js/patterns/model/functions/Rotate90.js';
import Shrink from '../../../../function-builder/js/patterns/model/functions/Shrink.js';
import Warhol from '../../../../function-builder/js/patterns/model/functions/Warhol.js';
import merge from '../../../../phet-core/js/merge.js';
import functionBuilderBasics from '../../functionBuilderBasics.js';

class FBBMysteryScene extends Scene {

  /**
   * @param {ImageFunction[][]} challengePool
   * @param {Object} [options]
   */
  constructor( challengePool, options ) {

    options = merge( {
      numberOfSlots: 1,
      numberOfEachCard: 1
    }, options );

    // {Node} scene selection icon
    assert && assert( !options.iconNode );
    options.iconNode = FBIconFactory.createSceneIcon( options.numberOfSlots );

    // Create enough instances of each function type to support the case where all functions
    // in a challenge have the same type.
    assert && assert( !options.numberOfEachFunction );
    options.numberOfEachFunction = options.numberOfSlots;

    // validate the challenge pool
    if ( assert ) {

      // limit scope of for-loop var using IIFE
      ( () => {
        for ( let i = 0; i < challengePool.length; i++ ) {

          const challenge = challengePool[ i ]; // {ImageFunction[]}

          // validate challenge
          assert && assert( challenge.length === options.numberOfSlots,
            `incorrect number of functions in challenge: ${challenge}` );
        }
      } )();
    }

    // {HTMLImageElement[]} images for the input cards, in the order that they appear in the carousel
    const cardContent = [
      feet_png,
      snowflake_png,
      butterfly_png,
      stickFigure_png,
      planet_png,
      sun_png,
      beaker_png,
      cherries_png,
      rectangle_png,
      circle_png,
      triangle_png,
      star_png
    ];

    // {FunctionCreator[]} function creators, in the order that functions appear in the carousel.
    const functionCreators = [
      new FunctionCreator( Mirror ),
      new FunctionCreator( Rotate90 ),
      new FunctionCreator( Grayscale ),
      new FunctionCreator( Rotate180 ),
      new FunctionCreator( Identity ),
      new FunctionCreator( InvertRGB ),
      new FunctionCreator( Erase ),
      new FunctionCreator( Shrink ),
      new FunctionCreator( Warhol )
    ];

    const builderWidth = Scene.computeBuilderWidth( options.numberOfSlots );
    const builderX = ( FBConstants.SCREEN_VIEW_LAYOUT_BOUNDS.width / 2 ) - ( builderWidth / 2 );
    const builder = new Builder( {
      numberOfSlots: options.numberOfSlots,
      width: builderWidth,
      position: new Vector2( builderX, FBConstants.BUILDER_Y )
    } );

    super( cardContent, functionCreators, builder, options );

    // @private
    this.numberOfSlots = options.numberOfSlots;

    // @public the challenge that is displayed
    this.challengeProperty = new Property( challengePool[ MysteryChallenges.DEFAULT_CHALLENGE_INDEX ] );
    this.challengePool = challengePool; // (read-only) for debug only, the original challenge pool, do not modify!

    // @private
    this.availableChallenges = challengePool.slice( 0 ); // available challenges
    this.availableChallenges.splice( MysteryChallenges.DEFAULT_CHALLENGE_INDEX, 1 ); // remove the default challenge
  }

  /**
   * Resets the scene.
   * Resets the challenge to its initial value, restocks the challenge pool.
   *
   * @public
   * @override
   */
  reset() {
    super.reset();

    // force notification when initial challenge is displayed
    if ( this.challengeProperty.get() === this.challengeProperty.initialValue ) {
      this.challengeProperty.notifyListenersStatic();
    }
    else {
      this.challengeProperty.reset();
    }

    // restock the available challenges, with default challenge removed
    this.availableChallenges = this.challengePool.slice( 0 );
    this.availableChallenges.splice( MysteryChallenges.DEFAULT_CHALLENGE_INDEX, 1 );
  }

  /**
   * Advances to the next randomly-selected challenge.  After a challenge has been selected, it is not selected
   * again until all challenges in the pool have been selected.
   *
   * @public
   */
  nextChallenge() {

    // available pool is empty
    if ( this.availableChallenges.length === 0 ) {

      // restock the pool
      this.availableChallenges = this.challengePool.slice( 0 );

      // remove the current challenge, so we don't select it twice in a row
      if ( !FBQueryParameters.playAll ) {
        const currentChallengeIndex = this.availableChallenges.indexOf( this.challengeProperty.get() );
        this.availableChallenges.splice( currentChallengeIndex, 1 );
        assert && assert( this.availableChallenges.length === this.challengePool.length - 1 );
      }
    }

    // randomly select a challenge from the available pool
    const challengeIndex = FBQueryParameters.playAll ? 0 : dotRandom.nextInt( this.availableChallenges.length );
    assert && assert( challengeIndex >= 0 && challengeIndex < this.availableChallenges.length );
    const challenge = this.availableChallenges[ challengeIndex ];

    // remove the challenge from the available pool
    this.availableChallenges.splice( challengeIndex, 1 );

    this.challengeProperty.set( challenge );
  }
}

functionBuilderBasics.register( 'FBBMysteryScene', FBBMysteryScene );
export default FBBMysteryScene;