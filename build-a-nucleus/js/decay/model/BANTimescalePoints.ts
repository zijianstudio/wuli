// Copyright 2022, University of Colorado Boulder

/**
 * BANTimescalePoints identifies meaningful sets of points on a timescale with seconds as the unit of time.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import buildANucleus from '../../buildANucleus.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';

const SECONDS_IN_A_YEAR = 365 * 24 * 60 * 60; // 365 days x 24 hrs/day x 60 min/hr x 60 sec/min
const TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = Math.pow( 10, -19 );

class BANTimescalePoints extends EnumerationValue {

  public static readonly TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS = new BANTimescalePoints(
    BuildANucleusStrings.A + BuildANucleusStrings.timeForLightToCrossANucleus, Math.pow( 10, -23 ) );

  public static readonly TIME_FOR_LIGHT_TO_CROSS_AN_ATOM = new BANTimescalePoints(
    BuildANucleusStrings.B + BuildANucleusStrings.timeForLightToCrossAnAtom, TIME_FOR_LIGHT_TO_CROSS_AN_ATOM );

  public static readonly TIME_FOR_LIGHT_TO_CROSS_ONE_THOUSAND_ATOMS = new BANTimescalePoints(
    BuildANucleusStrings.C + BuildANucleusStrings.timeForLightToCrossOneThousandAtoms,
    TIME_FOR_LIGHT_TO_CROSS_AN_ATOM * 1000 );

  public static readonly TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER = new BANTimescalePoints(
    BuildANucleusStrings.D + BuildANucleusStrings.timeForSoundToTravelOneMillimeter, 2e-6 );

  public static readonly A_BLINK_OF_AN_EYE = new BANTimescalePoints(
    BuildANucleusStrings.E + BuildANucleusStrings.aBlinkOfAnEye, 1 / 3 );

  public static readonly ONE_MINUTE = new BANTimescalePoints(
    BuildANucleusStrings.F + BuildANucleusStrings.oneMinute, 60 );

  public static readonly ONE_YEAR = new BANTimescalePoints(
    BuildANucleusStrings.G + BuildANucleusStrings.oneYear, SECONDS_IN_A_YEAR );

  public static readonly AVERAGE_HUMAN_LIFESPAN = new BANTimescalePoints(
    BuildANucleusStrings.H + BuildANucleusStrings.averageHumanLifespan, 72.6 * SECONDS_IN_A_YEAR );

  public static readonly AGE_OF_THE_UNIVERSE = new BANTimescalePoints(
    BuildANucleusStrings.I + BuildANucleusStrings.ageOfTheUniverse, 13.77e9 * SECONDS_IN_A_YEAR );

  public static readonly LIFETIME_OF_LONGEST_LIVED_STARS = new BANTimescalePoints(
    BuildANucleusStrings.J + BuildANucleusStrings.lifetimeOfLongestLivedStars, 450e18 );

  public static readonly enumeration = new Enumeration( BANTimescalePoints );

  public readonly timescaleItem: string;
  public readonly numberOfSeconds: number;

  public constructor( timescaleItem: string, numberOfSeconds: number ) {
    super();

    this.timescaleItem = timescaleItem;
    this.numberOfSeconds = numberOfSeconds;
  }
}

buildANucleus.register( 'BANTimescalePoints', BANTimescalePoints );
export default BANTimescalePoints;
