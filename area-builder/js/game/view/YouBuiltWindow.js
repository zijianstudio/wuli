// Copyright 2014-2023, University of Colorado Boulder

/**
 * A Scenery node that is used to show the user what they constructed for a 'Build it' style of challenge.  It can be
 * dynamically updated if needed.
 *
 * @author John Blanco
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';
import ColorProportionsPrompt from './ColorProportionsPrompt.js';
import FeedbackWindow from './FeedbackWindow.js';

const areaEqualsString = AreaBuilderStrings.areaEquals;
const perimeterEqualsString = AreaBuilderStrings.perimeterEquals;
const youBuiltString = AreaBuilderStrings.youBuilt;

// constants
const LINE_SPACING = 5;

class YouBuiltWindow extends FeedbackWindow {

  /**
   * Constructor for the window that shows the user what they built.  It is constructed with no contents, and the
   * contents are added later when the build spec is set.
   *
   * @param maxWidth
   * @param {Object} [options]
   */
  constructor( maxWidth, options ) {

    super( youBuiltString, maxWidth, options );

    // Keep a snapshot of the currently portrayed build spec so that we can only update the portions that need it.
    this.currentBuildSpec = null;

    // area text
    this.areaTextNode = new Text( StringUtils.format( areaEqualsString, 99 ), {
      font: FeedbackWindow.NORMAL_TEXT_FONT,
      top: this.titleNode.bottom + LINE_SPACING
    } );
    if ( this.areaTextNode.width + 2 * FeedbackWindow.X_MARGIN > maxWidth ) {
      // Scale this text to fit in the window.  Not an issue in English, but could be needed in translated versions.
      this.areaTextNode.scale( ( maxWidth - 2 * FeedbackWindow.X_MARGIN ) / this.areaTextNode.width );
    }
    this.contentNode.addChild( this.areaTextNode );

    // perimeter text
    this.perimeterTextNode = new Text( StringUtils.format( perimeterEqualsString, 99 ), {
      font: FeedbackWindow.NORMAL_TEXT_FONT
    } );
    if ( this.perimeterTextNode.width + 2 * FeedbackWindow.X_MARGIN > maxWidth ) {
      // Scale this text to fit in the window.  Not an issue in English, but could be needed in translated versions.
      this.perimeterTextNode.scale( ( maxWidth - 2 * FeedbackWindow.X_MARGIN ) / this.perimeterTextNode.width );
    }

    // proportion info is initially set to null, added and removed when needed.
    this.proportionsInfoNode = null;
  }

  // @private
  proportionSpecsAreEqual( buildSpec1, buildSpec2 ) {

    // If one of the build specs is null and the other isn't, they aren't equal.
    if ( ( buildSpec1 === null && buildSpec2 !== null ) || ( buildSpec1 !== null && buildSpec2 === null ) ) {
      return false;
    }

    // If one has a proportions spec and the other doesn't, they aren't equal.
    if ( ( buildSpec1.proportions && !buildSpec2.proportions ) || ( !buildSpec1.proportions && buildSpec2.proportions ) ) {
      return false;
    }

    // If they both don't have a proportions spec, they are equal.
    if ( !buildSpec1.proportions && !buildSpec2.proportions ) {
      return true;
    }

    // At this point, both build specs appear to have proportions fields.  Verify that the fields are correct.
    assert && assert( buildSpec1.proportions.color1 && buildSpec1.proportions.color2 && buildSpec1.proportions.color1Proportion,
      'malformed proportions specification' );
    assert && assert( buildSpec2.proportions.color1 && buildSpec2.proportions.color2 && buildSpec2.proportions.color1Proportion,
      'malformed proportions specification' );

    // Return true if all elements of both proportions specs match, false otherwise.
    return ( buildSpec1.proportions.color1.equals( buildSpec2.proportions.color1 ) &&
             buildSpec1.proportions.color2.equals( buildSpec2.proportions.color2 ) &&
             buildSpec1.proportions.color1Proportion.equals( buildSpec2.proportions.color1Proportion ) );
  }

  // @public Sets the build spec that is currently being portrayed in the window.
  setBuildSpec( buildSpec ) {

    // Set the area value, which is always shown.
    this.areaTextNode.string = StringUtils.format( areaEqualsString, buildSpec.area );

    // If proportions have changed, update them.  They sit beneath the area in the layout so that it is clear that
    // they go together.
    if ( !this.proportionSpecsAreEqual( buildSpec, this.currentBuildSpec ) ) {
      if ( this.proportionsInfoNode ) {
        this.contentNode.removeChild( this.proportionsInfoNode );
        this.proportionsInfoNode = null;
      }
      if ( buildSpec.proportions ) {
        this.proportionsInfoNode = new ColorProportionsPrompt( buildSpec.proportions.color1,
          buildSpec.proportions.color2, buildSpec.proportions.color1Proportion, {
            top: this.areaTextNode.bottom + LINE_SPACING,
            multiLine: true
          }, {
            font: new PhetFont( 14 )
          } );
        this.contentNode.addChild( this.proportionsInfoNode );
      }
    }

    // If perimeter is specified, update it, otherwise hide it.
    if ( typeof ( buildSpec.perimeter ) !== 'undefined' ) {
      if ( !this.contentNode.hasChild( this.perimeterTextNode ) ) {
        this.contentNode.addChild( this.perimeterTextNode );
      }
      this.perimeterTextNode.string = StringUtils.format( perimeterEqualsString, buildSpec.perimeter );
      this.perimeterTextNode.visible = true;
      this.perimeterTextNode.top = ( this.proportionsInfoNode ? this.proportionsInfoNode.bottom : this.areaTextNode.bottom ) + LINE_SPACING;
    }
    else if ( this.contentNode.hasChild( this.perimeterTextNode ) ) {
      this.contentNode.removeChild( this.perimeterTextNode );
    }

    // Save a reference to this build spec.
    this.currentBuildSpec = buildSpec;
  }
}

areaBuilder.register( 'YouBuiltWindow', YouBuiltWindow );
export default YouBuiltWindow;