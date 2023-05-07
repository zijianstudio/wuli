// Copyright 2022-2023, University of Colorado Boulder

/**
 * Responsible for all images for the Skater in this sim. Collects the images into usable classes to support
 * animation, selecting a different skater character, and selecting a different set of skater characters for
 * localization.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import dog_left_png from '../../../images/dog_left_png.js';
import dog_right_png from '../../../images/dog_right_png.js';
import dog_headshot_png from '../../../images/dog_headshot_png.js';
import cat_left_png from '../../../images/cat_left_png.js';
import cat_right_png from '../../../images/cat_right_png.js';
import cat_headshot_png from '../../../images/cat_headshot_png.js';
import elephant_left_png from '../../../images/elephant_left_png.js';
import elephant_right_png from '../../../images/elephant_right_png.js';
import elephant_headshot_png from '../../../images/elephant_headshot_png.js';
import goat_left_png from '../../../images/goat_left_png.js';
import goat_right_png from '../../../images/goat_right_png.js';
import goat_headshot_png from '../../../images/goat_headshot_png.js';
import skater1_set1_headshot_png from '../../../images/skater1_set1_headshot_png.js';
import skater1_set2_headshot_png from '../../../images/skater1_set2_headshot_png.js';
import skater1_set1_left_png from '../../../images/skater1_set1_left_png.js';
import skater1_set2_left_png from '../../../images/skater1_set2_left_png.js';
import skater1_set1_right_png from '../../../images/skater1_set1_right_png.js';
import skater1_set2_right_png from '../../../images/skater1_set2_right_png.js';
import skater2_set1_headshot_png from '../../../images/skater2_set1_headshot_png.js';
import skater2_set2_headshot_png from '../../../images/skater2_set2_headshot_png.js';
import skater2_set1_left_png from '../../../images/skater2_set1_left_png.js';
import skater2_set2_left_png from '../../../images/skater2_set2_left_png.js';
import skater2_set1_right_png from '../../../images/skater2_set1_right_png.js';
import skater2_set2_right_png from '../../../images/skater2_set2_right_png.js';
import skater3_set1_headshot_png from '../../../images/skater3_set1_headshot_png.js';
import skater3_set2_headshot_png from '../../../images/skater3_set2_headshot_png.js';
import skater3_set1_left_png from '../../../images/skater3_set1_left_png.js';
import skater3_set2_left_png from '../../../images/skater3_set2_left_png.js';
import skater3_set1_right_png from '../../../images/skater3_set1_right_png.js';
import skater3_set2_right_png from '../../../images/skater3_set2_right_png.js';
import skater4_set1_headshot_png from '../../../images/skater4_set1_headshot_png.js';
import skater4_set2_headshot_png from '../../../images/skater4_set2_headshot_png.js';
import skater4_set1_left_png from '../../../images/skater4_set1_left_png.js';
import skater4_set2_left_png from '../../../images/skater4_set2_left_png.js';
import skater4_set1_right_png from '../../../images/skater4_set1_right_png.js';
import skater4_set2_right_png from '../../../images/skater4_set2_right_png.js';
import skater5_set1_headshot_png from '../../../images/skater5_set1_headshot_png.js';
import skater5_set2_headshot_png from '../../../images/skater5_set2_headshot_png.js';
import skater5_set1_left_png from '../../../images/skater5_set1_left_png.js';
import skater5_set2_left_png from '../../../images/skater5_set2_left_png.js';
import skater5_set1_right_png from '../../../images/skater5_set1_right_png.js';
import skater5_set2_right_png from '../../../images/skater5_set2_right_png.js';
import skater6_set1_headshot_png from '../../../images/skater6_set1_headshot_png.js';
import skater6_set2_headshot_png from '../../../images/skater6_set2_headshot_png.js';
import skater6_set3_headshot_png from '../../../images/skater6_set3_headshot_png.js';
import skater6_set1_left_png from '../../../images/skater6_set1_left_png.js';
import skater6_set2_left_png from '../../../images/skater6_set2_left_png.js';
import skater6_set3_left_png from '../../../images/skater6_set3_left_png.js';
import skater6_set1_right_png from '../../../images/skater6_set1_right_png.js';
import skater6_set2_right_png from '../../../images/skater6_set2_right_png.js';
import skater6_set3_right_png from '../../../images/skater6_set3_right_png.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import HeadshotIcon from './HeadshotIcon.js';
import CharacterSet from '../../../../joist/js/preferences/CharacterSet.js';

const unitedStatesOfAmericaString = EnergySkateParkStrings.characterSet.unitedStatesOfAmericaStringProperty;
const africaString = EnergySkateParkStrings.characterSet.africaStringProperty;
const africaConservativeString = EnergySkateParkStrings.characterSet.africaModestStringProperty;

/**
 * A collection of images for a single skater character with the images used for each direction of motion and
 *  a headshot of the character for the UI to select a particular skater.
 */
class SkaterImageSet {
  constructor( leftImage, rightImage, headshotImage ) {
    this.leftImage = leftImage;
    this.rightImage = rightImage;
    this.headshotImage = headshotImage;
  }
}

/**
 * A collection of SkaterImageSets. One SkaterCharacterSet is active at a time. The user can select one of the
 * SkaterImageSets of the SkaterCharacterSet in simulation controls. A different SkaterCharacterSet can be selected
 * from preferences.
 */
class SkaterCharacterSet extends CharacterSet {
  constructor( labelString, imageSet1, imageSet2, imageSet3, imageSet4, imageSet5, imageSet6, imageSet7, imageSet8 ) {
    const headshotIcon = new HeadshotIcon( imageSet1.headshotImage );

    super( headshotIcon, labelString );
    this.imageSet1 = imageSet1;
    this.imageSet2 = imageSet2;
    this.imageSet3 = imageSet3;
    this.imageSet4 = imageSet4;
    this.imageSet5 = imageSet5;
    this.imageSet6 = imageSet6;
    this.imageSet7 = imageSet7;
    this.imageSet8 = imageSet8;
  }
}

const CHARACTER_SET_1 = new SkaterCharacterSet(
  unitedStatesOfAmericaString,
  new SkaterImageSet( skater1_set1_left_png, skater1_set1_right_png, skater1_set1_headshot_png ),
  new SkaterImageSet( skater2_set1_left_png, skater2_set1_right_png, skater2_set1_headshot_png ),
  new SkaterImageSet( skater3_set1_left_png, skater3_set1_right_png, skater3_set1_headshot_png ),
  new SkaterImageSet( skater4_set1_left_png, skater4_set1_right_png, skater4_set1_headshot_png ),
  new SkaterImageSet( skater5_set1_left_png, skater5_set1_right_png, skater5_set1_headshot_png ),
  new SkaterImageSet( skater6_set1_left_png, skater6_set1_right_png, skater6_set1_headshot_png ),
  new SkaterImageSet( cat_left_png, cat_right_png, cat_headshot_png ),
  new SkaterImageSet( dog_left_png, dog_right_png, dog_headshot_png )
);

const CHARACTER_SET_2 = new SkaterCharacterSet(
  africaString,
  new SkaterImageSet( skater1_set2_left_png, skater1_set2_right_png, skater1_set2_headshot_png ),
  new SkaterImageSet( skater2_set2_left_png, skater2_set2_right_png, skater2_set2_headshot_png ),
  new SkaterImageSet( skater3_set2_left_png, skater3_set2_right_png, skater3_set2_headshot_png ),
  new SkaterImageSet( skater4_set2_left_png, skater4_set2_right_png, skater4_set2_headshot_png ),
  new SkaterImageSet( skater5_set2_left_png, skater5_set2_right_png, skater5_set2_headshot_png ),
  new SkaterImageSet( skater6_set2_left_png, skater6_set2_right_png, skater6_set2_headshot_png ),
  new SkaterImageSet( goat_left_png, goat_right_png, goat_headshot_png ),
  new SkaterImageSet( elephant_left_png, elephant_right_png, elephant_headshot_png )
);

const CHARACTER_SET_3 = new SkaterCharacterSet(
  africaConservativeString,
  new SkaterImageSet( skater1_set2_left_png, skater1_set2_right_png, skater1_set2_headshot_png ),
  new SkaterImageSet( skater2_set2_left_png, skater2_set2_right_png, skater2_set2_headshot_png ),
  new SkaterImageSet( skater3_set2_left_png, skater3_set2_right_png, skater3_set2_headshot_png ),
  new SkaterImageSet( skater4_set2_left_png, skater4_set2_right_png, skater4_set2_headshot_png ),
  new SkaterImageSet( skater5_set2_left_png, skater5_set2_right_png, skater5_set2_headshot_png ),
  new SkaterImageSet( skater6_set3_left_png, skater6_set3_right_png, skater6_set3_headshot_png ),
  new SkaterImageSet( goat_left_png, goat_right_png, goat_headshot_png ),
  new SkaterImageSet( elephant_left_png, elephant_right_png, elephant_headshot_png )
);

const SkaterImages = {
  SKATER_CHARACTER_SETS: [
    CHARACTER_SET_1,
    CHARACTER_SET_2,
    CHARACTER_SET_3
  ],

  CHARACTER_SET_1: CHARACTER_SET_1,
  CHARACTER_SET_2: CHARACTER_SET_2,
  CHARACTER_SET_3: CHARACTER_SET_3,

  IMAGES_PER_SET: 8
};

energySkatePark.register( 'SkaterImages', SkaterImages );
export default SkaterImages;