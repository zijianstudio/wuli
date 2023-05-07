// Copyright 2014-2023, University of Colorado Boulder

/**
 * Banner that is used to present information to the user as they work through a challenge.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';
import ColorProportionsPrompt from './ColorProportionsPrompt.js';

const areaEqualsString = AreaBuilderStrings.areaEquals;
const perimeterEqualsString = AreaBuilderStrings.perimeterEquals;

// constants
const TEXT_FILL_COLOR = 'white';
const TITLE_FONT = new PhetFont( { size: 24, weight: 'bold' } ); // Font used for the title
const LARGER_FONT = new PhetFont( { size: 24 } ); // Font for single line text
const SMALLER_FONT = new PhetFont( { size: 18 } ); // Font for two-line text
const TITLE_INDENT = 15; // Empirically determined.
const ANIMATION_TIME = 0.6; // In seconds

class GameInfoBanner extends Rectangle {

  /**
   * @param {number} width
   * @param {number} height
   * @param {string} backgroundColor
   * @param {Object} [options]
   */
  constructor( width, height, backgroundColor, options ) {
    super( 0, 0, width, height, 0, 0, { fill: backgroundColor } );

    // @public These properties are the main API for this class, and they control what is and isn't shown on the banner.
    this.titleStringProperty = new Property( '' );
    this.buildSpecProperty = new Property( null );
    this.areaToFindProperty = new Property( null );

    // Define the title.
    const title = new Text( this.titleStringProperty, {
      font: TITLE_FONT,
      fill: TEXT_FILL_COLOR,
      centerY: height / 2,
      maxWidth: width * 0.3 // must be small enough that the prompt can also fit on the banner
    } );
    this.addChild( title );

    // Update the title when the title text changes.
    this.titleStringProperty.link( () => {
      title.centerY = height / 2;
      if ( this.buildSpecProperty.value === null && this.areaToFindProperty.value === null ) {
        // There is no build spec are area to find, so center the title in the banner.
        title.centerX = width / 2;
      }
      else {
        // There is a build spec, so the title should be on the left to make room.
        title.left = TITLE_INDENT;
      }
    } );

    // Define the build prompt, which is shown in both the challenge prompt and the solution.
    const buildPrompt = new Node();
    this.addChild( buildPrompt );
    const maxBuildPromptWidth = width / 2; // the build prompt has to fit in the banner with the title
    const areaPrompt = new Text( '', { font: SMALLER_FONT, fill: TEXT_FILL_COLOR, top: 0 } );
    buildPrompt.addChild( areaPrompt );
    const perimeterPrompt = new Text( '', { font: SMALLER_FONT, fill: TEXT_FILL_COLOR, top: 0 } );
    buildPrompt.addChild( perimeterPrompt );
    const colorProportionPrompt = new ColorProportionsPrompt( 'black', 'white',
      new Fraction( 1, 1 ), {
        font: new PhetFont( { size: 11 } ),
        textFill: TEXT_FILL_COLOR,
        top: 0
      } );
    buildPrompt.addChild( colorProportionPrompt );

    // Function that moves the title from the center of the banner to the left side if it isn't already there.
    function moveTitleToSide() {
      if ( title.centerX === width / 2 ) {
        // Move the title over
        new Animation( {
          from: title.left,
          to: TITLE_INDENT,
          setValue: left => { title.left = left; },
          duration: ANIMATION_TIME,
          easing: Easing.CUBIC_IN_OUT
        } ).start();

        // Fade in the build prompt if it is now set to be visible.
        if ( buildPrompt.visible ) {
          buildPrompt.opacity = 0;
          new Animation( {
            from: 0,
            to: 1,
            setValue: opacity => { buildPrompt.opacity = opacity; },
            duration: ANIMATION_TIME,
            easing: Easing.CUBIC_IN_OUT
          } ).start();
        }
      }
    }

    // Function that positions the build prompt such that its visible bounds are centered in the space to the left of
    // the title.
    function positionBuildPrompt() {
      const centerX = ( TITLE_INDENT + title.width + width - TITLE_INDENT ) / 2;
      const centerY = height / 2;
      buildPrompt.setScaleMagnitude( 1 );
      if ( buildPrompt.width > maxBuildPromptWidth ) {
        // scale the build prompt to fit with the title on the banner
        buildPrompt.setScaleMagnitude( maxBuildPromptWidth / buildPrompt.width );
      }
      buildPrompt.left += centerX - buildPrompt.visibleBounds.centerX;
      buildPrompt.top += centerY - buildPrompt.visibleBounds.centerY;
    }

    // Update the prompt or solution text based on the build spec.
    this.buildSpecProperty.link( buildSpec => {
      assert && assert( this.areaToFindProperty.value === null, 'Can\'t display area to find and build spec at the same time.' );
      assert && assert( buildSpec === null || buildSpec.area, 'Area must be specified in the build spec' );
      if ( buildSpec !== null ) {
        areaPrompt.string = StringUtils.format( areaEqualsString, buildSpec.area );
        areaPrompt.visible = true;
        if ( !buildSpec.perimeter && !buildSpec.proportions ) {
          areaPrompt.font = LARGER_FONT;
          perimeterPrompt.visible = false;
          colorProportionPrompt.visible = false;
        }
        else {
          areaPrompt.font = SMALLER_FONT;
          if ( buildSpec.perimeter ) {
            perimeterPrompt.string = StringUtils.format( perimeterEqualsString, buildSpec.perimeter );
            perimeterPrompt.visible = true;
          }
          else {
            perimeterPrompt.visible = false;
          }
          if ( buildSpec.proportions ) {
            areaPrompt.string += ',';
            colorProportionPrompt.color1 = buildSpec.proportions.color1;
            colorProportionPrompt.color2 = buildSpec.proportions.color2;
            colorProportionPrompt.color1Proportion = buildSpec.proportions.color1Proportion;
            colorProportionPrompt.visible = true;
          }
          else {
            colorProportionPrompt.visible = false;
          }
        }

        // Update the layout
        perimeterPrompt.top = areaPrompt.bottom + areaPrompt.height * 0.25; // Spacing empirically determined.
        colorProportionPrompt.left = areaPrompt.right + 10; // Spacing empirically determined
        colorProportionPrompt.centerY = areaPrompt.centerY;
        positionBuildPrompt();

        // Make sure the title is over on the left side.
        moveTitleToSide();
      }
      else {
        areaPrompt.visible = this.areaToFindProperty.value !== null;
        perimeterPrompt.visible = false;
        colorProportionPrompt.visible = false;
      }
    } );

    // Update the area indication (used in solution for 'find the area' challenges).
    this.areaToFindProperty.link( areaToFind => {
      assert && assert( this.buildSpecProperty.value === null, 'Can\'t display area to find and build spec at the same time.' );
      if ( areaToFind !== null ) {
        areaPrompt.string = StringUtils.format( areaEqualsString, areaToFind );
        areaPrompt.font = LARGER_FONT;
        areaPrompt.visible = true;

        // The other prompts (perimeter and color proportions) are not shown in this situation.
        perimeterPrompt.visible = false;
        colorProportionPrompt.visible = false;

        // Place the build prompt where it needs to go.
        positionBuildPrompt();

        // Make sure the title is over on the left side.
        moveTitleToSide();
      }
      else {
        areaPrompt.visible = this.buildSpecProperty.value !== null;
      }
    } );

    // Pass options through to parent class.
    this.mutate( options );
  }

  /**
   * @public
   */
  reset() {
    this.titleStringProperty.reset();
    this.buildSpecProperty.reset();
    this.areaToFindProperty.reset();
  }
}

areaBuilder.register( 'GameInfoBanner', GameInfoBanner );
export default GameInfoBanner;