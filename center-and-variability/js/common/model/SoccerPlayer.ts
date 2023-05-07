// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class for a manipulable data point which could be a soccer ball or, in the lab screen, a colored sphere.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import Property from '../../../../axon/js/Property.js';
import Pose from './Pose.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';

export default class SoccerPlayer {
  public readonly poseProperty = new Property<Pose>( Pose.STANDING );

  // Also used to determine the artwork for rendering the SoccerPlayerNode
  public readonly initialPlaceInLine: number;

  public timestampWhenPoisedBegan: number | null = null;
  public readonly isActiveProperty: BooleanProperty;

  public constructor( placeInLine: number ) {
    this.isActiveProperty = new BooleanProperty( placeInLine === 0 );
    this.initialPlaceInLine = placeInLine;
  }

  public reset(): void {
    this.poseProperty.reset();
    this.timestampWhenPoisedBegan = null;
    this.isActiveProperty.reset();
  }
}

centerAndVariability.register( 'SoccerPlayer', SoccerPlayer );