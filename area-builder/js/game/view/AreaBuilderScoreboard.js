// Copyright 2014-2023, University of Colorado Boulder

/**
 * Panel that shows the level, the current challenge, the score, and the time if enabled.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import GameTimer from '../../../../vegas/js/GameTimer.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';

const labelScorePatternString = VegasStrings.label.scorePattern;
const labelTimeString = VegasStrings.label.time;
const levelString = AreaBuilderStrings.level;
const pattern0Challenge1MaxString = AreaBuilderStrings.pattern[ '0challenge' ][ '1max' ];

class AreaBuilderScoreboard extends Node {

  /**
   * @param levelProperty
   * @param problemNumberProperty
   * @param problemsPerLevel
   * @param scoreProperty
   * @param elapsedTimeProperty
   * @param {Object} [options]
   */
  constructor( levelProperty, problemNumberProperty, problemsPerLevel, scoreProperty, elapsedTimeProperty, options ) {
    super();

    options = merge( { maxWidth: Number.POSITIVE_INFINITY }, options );

    // Properties that control which elements are visible and which are hidden.  This constitutes the primary API.
    this.timeVisibleProperty = new Property( true );

    // Create the labels
    const levelIndicator = new Text( '', {
      font: new PhetFont( { size: 20, weight: 'bold' } ),
      maxWidth: options.maxWidth
    } );
    levelProperty.link( level => {
      levelIndicator.string = StringUtils.format( levelString, level + 1 );
    } );
    const currentChallengeIndicator = new Text( '', { font: new PhetFont( { size: 16 } ), maxWidth: options.maxWidth } );
    problemNumberProperty.link( currentChallenge => {
      currentChallengeIndicator.string = StringUtils.format( pattern0Challenge1MaxString, currentChallenge + 1, problemsPerLevel );
    } );
    const scoreIndicator = new Text( '', { font: new PhetFont( 20 ), maxWidth: options.maxWidth } );
    scoreProperty.link( score => {
      scoreIndicator.string = StringUtils.format( labelScorePatternString, score );
    } );
    const elapsedTimeIndicator = new Text( '', { font: new PhetFont( 20 ), maxWidth: options.maxWidth } );
    elapsedTimeProperty.link( elapsedTime => {
      elapsedTimeIndicator.string = StringUtils.format( labelTimeString, GameTimer.formatTime( elapsedTime ) );
    } );

    // Create the panel.
    const vBox = new VBox( {
      children: [
        levelIndicator,
        currentChallengeIndicator,
        scoreIndicator,
        elapsedTimeIndicator
      ],
      spacing: 12
    } );
    this.addChild( vBox );

    // Add/remove the time indicator.
    this.timeVisibleProperty.link( timeVisible => {
      if ( timeVisible && !vBox.hasChild( elapsedTimeIndicator ) ) {
        // Insert just after the score indicator.
        vBox.insertChild( vBox.indexOfChild( scoreIndicator ) + 1, elapsedTimeIndicator );
      }
      else if ( !timeVisible && vBox.hasChild( elapsedTimeIndicator ) ) {
        vBox.removeChild( elapsedTimeIndicator );
      }
    } );

    this.mutate( options );
  }
}

areaBuilder.register( 'AreaBuilderScoreboard', AreaBuilderScoreboard );
export default AreaBuilderScoreboard;