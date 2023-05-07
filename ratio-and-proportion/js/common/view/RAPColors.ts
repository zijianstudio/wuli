// Copyright 2020-2022, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the Ratio and Proportion simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';

// Even though there is only one Profile, it is still nice to use this pattern for color organizing.
const RAPColors = {
  tickMarksAndLabelsInFitnessProperty: new ProfileColorProperty( ratioAndProportion, 'tickMarksAndLabelsInFitness', {
    default: Color.DARK_GRAY
  } ),
  tickMarksAndLabelsOutOfFitnessProperty: new ProfileColorProperty( ratioAndProportion, 'tickMarksAndLabelsOutOfFitness', {
    default: Color.GRAY
  } ),

  // the color will jump from backgroundInterpolationToFitness to this when actually in ratio
  backgroundInFitnessProperty: new ProfileColorProperty( ratioAndProportion, 'backgroundInFitness', {
    default: new Color( '#5ab46c' )
  } ),

  // this will be the max of the interpolation for the background color
  backgroundInterpolationToFitnessProperty: new ProfileColorProperty( ratioAndProportion, 'backgroundInterpolationToFitness', {
    default: new Color( '#77ce81' )
  } ),
  backgroundOutOfFitnessProperty: new ProfileColorProperty( ratioAndProportion, 'backgroundOutOfFitness', {
    default: new Color( 'white' )
  } ),

  // cue arrows around the ratio hands.
  cueArrowsProperty: new ProfileColorProperty( ratioAndProportion, 'cueArrows', {
    default: Color.DARK_GRAY
  } ),
  createScreenHandProperty: new ProfileColorProperty( ratioAndProportion, 'createScreenHand', {
    default: new Color( '#8d5cbd' )
  } ),
  discoverChallenge1Property: new ProfileColorProperty( ratioAndProportion, 'discoverChallenge1', {
    default: new Color( 233, 69, 69 )
  } ),
  discoverChallenge2Property: new ProfileColorProperty( ratioAndProportion, 'discoverChallenge2', {
    default: new Color( 87, 182, 221 )
  } ),
  discoverChallenge3Property: new ProfileColorProperty( ratioAndProportion, 'discoverChallenge3', {
    default: new Color( 255, 200, 0 )
  } )
};

ratioAndProportion.register( 'RAPColors', RAPColors );
export default RAPColors;