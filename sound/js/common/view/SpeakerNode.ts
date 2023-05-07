// Copyright 2022, University of Colorado Boulder
/* eslint-disable */
/**
 * Node for the speaker, oscillates with the values of the oscillatorProperty.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import { Node, Image } from '../../../../scenery/js/imports.js';
import speakerL10Image from '../../../../scenery-phet/images/speaker/speaker_L10_png.js';
import speakerL1Image from '../../../../scenery-phet/images/speaker/speaker_L1_png.js';
import speakerL2Image from '../../../../scenery-phet/images/speaker/speaker_L2_png.js';
import speakerL3Image from '../../../../scenery-phet/images/speaker/speaker_L3_png.js';
import speakerL4Image from '../../../../scenery-phet/images/speaker/speaker_L4_png.js';
import speakerL5Image from '../../../../scenery-phet/images/speaker/speaker_L5_png.js';
import speakerL6Image from '../../../../scenery-phet/images/speaker/speaker_L6_png.js';
import speakerL7Image from '../../../../scenery-phet/images/speaker/speaker_L7_png.js';
import speakerL8Image from '../../../../scenery-phet/images/speaker/speaker_L8_png.js';
import speakerL9Image from '../../../../scenery-phet/images/speaker/speaker_L9_png.js';
import speakerImageMID from '../../../../scenery-phet/images/speaker/speaker_MID_png.js';
import speakerR10Image from '../../../../scenery-phet/images/speaker/speaker_R10_png.js';
import speakerR1Image from '../../../../scenery-phet/images/speaker/speaker_R1_png.js';
import speakerR2Image from '../../../../scenery-phet/images/speaker/speaker_R2_png.js';
import speakerR3Image from '../../../../scenery-phet/images/speaker/speaker_R3_png.js';
import speakerR4Image from '../../../../scenery-phet/images/speaker/speaker_R4_png.js';
import speakerR5Image from '../../../../scenery-phet/images/speaker/speaker_R5_png.js';
import speakerR6Image from '../../../../scenery-phet/images/speaker/speaker_R6_png.js';
import speakerR7Image from '../../../../scenery-phet/images/speaker/speaker_R7_png.js';
import speakerR8Image from '../../../../scenery-phet/images/speaker/speaker_R8_png.js';
import speakerR9Image from '../../../../scenery-phet/images/speaker/speaker_R9_png.js';
import SoundConstants from '../../common/SoundConstants.js';
import sound from '../../sound.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

// variables
const speakers = [
  speakerL10Image,
  speakerL9Image,
  speakerL8Image,
  speakerL7Image,
  speakerL6Image,
  speakerL5Image,
  speakerL4Image,
  speakerL3Image,
  speakerL2Image,
  speakerL1Image,
  speakerImageMID,
  speakerR1Image,
  speakerR2Image,
  speakerR3Image,
  speakerR4Image,
  speakerR5Image,
  speakerR6Image,
  speakerR7Image,
  speakerR8Image,
  speakerR9Image,
  speakerR10Image
];

export default class SpeakerNode extends Node {
  constructor( oscillatorProperty: TReadOnlyProperty<number> ) {
    super();

    const image = new Image( speakerImageMID, {
      scale: 0.75
    } );

    this.children = [ image ];

    oscillatorProperty.link( value => {
      const max = SoundConstants.AMPLITUDE_RANGE.max * SoundConstants.AMPLITUDE_CALIBRATION_SCALE;

      // Sign is chosen so that the membrane forward corresponds to a high pressure outside the speaker,
      // see https://github.com/phetsims/wave-interference/issues/178
      const interpolated = Utils.linear( -max, max, 0, speakers.length - 1, value );
      const index = Utils.roundSymmetric( interpolated );
      image.image = speakers[ index ];
    } );
  }
}

sound.register( 'SpeakerNode', SpeakerNode );