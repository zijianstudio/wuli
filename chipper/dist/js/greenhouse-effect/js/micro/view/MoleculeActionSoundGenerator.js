// Copyright 2021-2022, University of Colorado Boulder

/**
 * A sound generator that produces sounds for the various actions that a molecule can take, such as vibrating, rotating,
 * becoming energized, and so forth.  This type watches a list of active molecules and hooks up listeners to each one
 * that will generate the various sounds.
 */

import merge from '../../../../phet-core/js/merge.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import absorbPhoton_mp3 from '../../../sounds/absorbPhoton_mp3.js';
import breakApart_mp3 from '../../../sounds/breakApart_mp3.js';
import energized_mp3 from '../../../sounds/energized_mp3.js';
import rotationClockwise_mp3 from '../../../sounds/rotationClockwise_mp3.js';
import rotationClockwiseSlowMotion_mp3 from '../../../sounds/rotationClockwiseSlowMotion_mp3.js';
import rotationCounterclockwise_mp3 from '../../../sounds/rotationCounterclockwise_mp3.js';
import rotationCounterclockwiseSlowMotion_mp3 from '../../../sounds/rotationCounterclockwiseSlowMotion_mp3.js';
import vibration_mp3 from '../../../sounds/vibration_mp3.js';
import vibrationSlowMotion_mp3 from '../../../sounds/vibrationSlowMotion_mp3.js';
import greenhouseEffect from '../../greenhouseEffect.js';

// constants
const ABSORPTION_TO_ACTIVITY_SOUND_DELAY = 0.2; // in seconds

class MoleculeActionSoundGenerator extends SoundGenerator {
  /**
   * @param {ObservableArrayDef.<Molecule>}activeMolecules
   * @param {BooleanProperty} simIsRunningProperty
   * @param {BooleanProperty} isSlowMotionProperty
   * @param {Object} [options]
   */
  constructor(activeMolecules, simIsRunningProperty, isSlowMotionProperty, options) {
    options = merge({}, options);
    super(options);

    // photon absorbed sound
    const photonAbsorbedSoundClip = new SoundClip(absorbPhoton_mp3, {
      initialOutputLevel: 0.1
    });
    photonAbsorbedSoundClip.connect(this.soundSourceDestination);
    const photonAbsorbedSoundPlayer = () => {
      photonAbsorbedSoundClip.play();
    };

    // break apart sound
    const breakApartSoundClip = new SoundClip(breakApart_mp3, {
      initialOutputLevel: 1
    });
    breakApartSoundClip.connect(this.soundSourceDestination);
    const breakApartSoundPlayer = () => {
      breakApartSoundClip.play();
    };

    // "energized" sound, which is played when the molecule enters a higher-energy state (depicted in the view as glowing)
    const moleculeEnergizedLoop = new SoundClip(energized_mp3, {
      loop: true,
      initialOutputLevel: 0.3,
      enableControlProperties: [simIsRunningProperty]
    });
    moleculeEnergizedLoop.connect(this.soundSourceDestination);
    const updateMoleculeEnergizedSound = moleculeEnergized => {
      if (moleculeEnergized) {
        moleculeEnergizedLoop.play(ABSORPTION_TO_ACTIVITY_SOUND_DELAY);
      } else {
        moleculeEnergizedLoop.stop();
      }
    };

    // rotation sounds
    const rotationLoopOptions = {
      initialOutputLevel: 0.3,
      loop: true,
      enableControlProperties: [simIsRunningProperty]
    };

    // clockwise normal speed
    const rotateClockwiseNormalSpeedLoop = new SoundClip(rotationClockwise_mp3, rotationLoopOptions);
    rotateClockwiseNormalSpeedLoop.connect(this.soundSourceDestination);

    // clockwise slow motion
    const rotateClockwiseSlowMotionLoop = new SoundClip(rotationClockwiseSlowMotion_mp3, rotationLoopOptions);
    rotateClockwiseSlowMotionLoop.connect(this.soundSourceDestination);

    // counterclockwise normal speed
    const rotateCounterclockwiseNormalSpeedLoop = new SoundClip(rotationCounterclockwise_mp3, rotationLoopOptions);
    rotateCounterclockwiseNormalSpeedLoop.connect(this.soundSourceDestination);

    // counterclockwise slow motion
    const rotateCounterclockwiseSlowMotionLoop = new SoundClip(rotationCounterclockwiseSlowMotion_mp3, rotationLoopOptions);
    rotateCounterclockwiseSlowMotionLoop.connect(this.soundSourceDestination);
    const updateRotationSound = rotating => {
      if (rotating) {
        // Verify that there is only one molecule that needs this sound.  At the time of this writing - mid-March 2020 -
        // there are not multiple copies of the loops, and there would need to be in order to support more molecules.
        assert && assert(activeMolecules.length <= 1, 'sound generation can only be handled for one molecule');

        // play a sound based on the direction of rotation and the currently selected sound from the Preferences dialog
        const molecule = activeMolecules.get(0);
        if (molecule.rotationDirectionClockwiseProperty.value) {
          if (isSlowMotionProperty.value) {
            rotateClockwiseSlowMotionLoop.play(ABSORPTION_TO_ACTIVITY_SOUND_DELAY);
          } else {
            rotateClockwiseNormalSpeedLoop.play(ABSORPTION_TO_ACTIVITY_SOUND_DELAY);
          }
        } else {
          if (isSlowMotionProperty.value) {
            rotateCounterclockwiseSlowMotionLoop.play(ABSORPTION_TO_ACTIVITY_SOUND_DELAY);
          } else {
            rotateCounterclockwiseNormalSpeedLoop.play(ABSORPTION_TO_ACTIVITY_SOUND_DELAY);
          }
        }
      } else {
        rotateClockwiseNormalSpeedLoop.stop();
        rotateClockwiseSlowMotionLoop.stop();
        rotateCounterclockwiseNormalSpeedLoop.stop();
        rotateCounterclockwiseSlowMotionLoop.stop();
      }
    };

    // vibration sounds
    const vibrationLoopOptions = {
      initialOutputLevel: 0.4,
      loop: true,
      enableControlProperties: [simIsRunningProperty]
    };

    // vibration normal speed
    const moleculeVibrationNormalSpeedLoop = new SoundClip(vibration_mp3, vibrationLoopOptions);
    moleculeVibrationNormalSpeedLoop.connect(this.soundSourceDestination);

    // vibration slow motion
    const moleculeVibrationSlowMotionLoop = new SoundClip(vibrationSlowMotion_mp3, {
      initialOutputLevel: 0.4,
      loop: true,
      enableControlProperties: [simIsRunningProperty]
    });
    moleculeVibrationSlowMotionLoop.connect(this.soundSourceDestination);

    // function for updating the vibration sound
    const updateVibrationSound = vibrating => {
      if (vibrating) {
        // Verify that there is only one molecule that needs this sound.  At the time of this writing - mid-March 2020 -
        // there are not multiple copies of the loops, and there would need to be in order to support more molecules.
        assert && assert(activeMolecules.length <= 1, 'sound generation can only be handled for one molecule');

        // start the vibration sound playing (this will have no effect if the sound is already playing)
        if (isSlowMotionProperty.value) {
          moleculeVibrationSlowMotionLoop.play(ABSORPTION_TO_ACTIVITY_SOUND_DELAY);
        } else {
          moleculeVibrationNormalSpeedLoop.play(ABSORPTION_TO_ACTIVITY_SOUND_DELAY);
        }
      } else {
        moleculeVibrationNormalSpeedLoop.stop();
        moleculeVibrationSlowMotionLoop.stop();
      }
    };

    // switch between normal speed and slow motion sounds if the setting changes while a sound is playing
    isSlowMotionProperty.link(isSlowMotion => {
      if (isSlowMotion) {
        if (moleculeVibrationNormalSpeedLoop.isPlaying) {
          moleculeVibrationNormalSpeedLoop.stop();
          moleculeVibrationSlowMotionLoop.play();
        }
        if (rotateClockwiseNormalSpeedLoop.isPlaying) {
          rotateClockwiseNormalSpeedLoop.stop();
          rotateClockwiseSlowMotionLoop.play();
        }
        if (rotateCounterclockwiseNormalSpeedLoop.isPlaying) {
          rotateCounterclockwiseNormalSpeedLoop.stop();
          rotateCounterclockwiseSlowMotionLoop.play();
        }
      } else {
        if (moleculeVibrationSlowMotionLoop.isPlaying) {
          moleculeVibrationSlowMotionLoop.stop();
          moleculeVibrationNormalSpeedLoop.play();
        }
        if (rotateClockwiseSlowMotionLoop.isPlaying) {
          rotateClockwiseSlowMotionLoop.stop();
          rotateClockwiseNormalSpeedLoop.play();
        }
        if (rotateCounterclockwiseSlowMotionLoop.isPlaying) {
          rotateCounterclockwiseSlowMotionLoop.stop();
          rotateCounterclockwiseNormalSpeedLoop.play();
        }
      }
    });

    // function that adds all of the listeners involved in producing the molecule action sounds
    const addSoundPlayersToMolecule = molecule => {
      molecule.photonAbsorbedEmitter.addListener(photonAbsorbedSoundPlayer);
      molecule.brokeApartEmitter.addListener(breakApartSoundPlayer);
      molecule.highElectronicEnergyStateProperty.link(updateMoleculeEnergizedSound);
      molecule.rotatingProperty.link(updateRotationSound);
      molecule.vibratingProperty.link(updateVibrationSound);
    };

    // hook up listeners for any molecules that are already on the list
    activeMolecules.forEach(activeMolecule => {
      addSoundPlayersToMolecule(activeMolecule);
    });

    // listen for new molecules and add the listeners that produce the action sounds when one arrives
    activeMolecules.addItemAddedListener(addedMolecule => {
      addSoundPlayersToMolecule(addedMolecule);
    });

    // remove the sound-producing listeners when a molecule is removed
    activeMolecules.addItemRemovedListener(removedMolecule => {
      if (removedMolecule.photonAbsorbedEmitter.hasListener(photonAbsorbedSoundPlayer)) {
        removedMolecule.photonAbsorbedEmitter.removeListener(photonAbsorbedSoundPlayer);
      }
      if (removedMolecule.brokeApartEmitter.hasListener(breakApartSoundPlayer)) {
        removedMolecule.brokeApartEmitter.removeListener(breakApartSoundPlayer);
      }
      if (removedMolecule.highElectronicEnergyStateProperty.hasListener(updateMoleculeEnergizedSound)) {
        removedMolecule.highElectronicEnergyStateProperty.unlink(updateMoleculeEnergizedSound);
      }
      if (removedMolecule.rotatingProperty.hasListener(updateRotationSound)) {
        removedMolecule.rotatingProperty.unlink(updateRotationSound);
      }
      if (removedMolecule.vibratingProperty.hasListener(updateVibrationSound)) {
        removedMolecule.vibratingProperty.unlink(updateVibrationSound);
      }
    });
  }
}
greenhouseEffect.register('MoleculeActionSoundGenerator', MoleculeActionSoundGenerator);
export default MoleculeActionSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlNvdW5kQ2xpcCIsIlNvdW5kR2VuZXJhdG9yIiwiYWJzb3JiUGhvdG9uX21wMyIsImJyZWFrQXBhcnRfbXAzIiwiZW5lcmdpemVkX21wMyIsInJvdGF0aW9uQ2xvY2t3aXNlX21wMyIsInJvdGF0aW9uQ2xvY2t3aXNlU2xvd01vdGlvbl9tcDMiLCJyb3RhdGlvbkNvdW50ZXJjbG9ja3dpc2VfbXAzIiwicm90YXRpb25Db3VudGVyY2xvY2t3aXNlU2xvd01vdGlvbl9tcDMiLCJ2aWJyYXRpb25fbXAzIiwidmlicmF0aW9uU2xvd01vdGlvbl9tcDMiLCJncmVlbmhvdXNlRWZmZWN0IiwiQUJTT1JQVElPTl9UT19BQ1RJVklUWV9TT1VORF9ERUxBWSIsIk1vbGVjdWxlQWN0aW9uU291bmRHZW5lcmF0b3IiLCJjb25zdHJ1Y3RvciIsImFjdGl2ZU1vbGVjdWxlcyIsInNpbUlzUnVubmluZ1Byb3BlcnR5IiwiaXNTbG93TW90aW9uUHJvcGVydHkiLCJvcHRpb25zIiwicGhvdG9uQWJzb3JiZWRTb3VuZENsaXAiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJjb25uZWN0Iiwic291bmRTb3VyY2VEZXN0aW5hdGlvbiIsInBob3RvbkFic29yYmVkU291bmRQbGF5ZXIiLCJwbGF5IiwiYnJlYWtBcGFydFNvdW5kQ2xpcCIsImJyZWFrQXBhcnRTb3VuZFBsYXllciIsIm1vbGVjdWxlRW5lcmdpemVkTG9vcCIsImxvb3AiLCJlbmFibGVDb250cm9sUHJvcGVydGllcyIsInVwZGF0ZU1vbGVjdWxlRW5lcmdpemVkU291bmQiLCJtb2xlY3VsZUVuZXJnaXplZCIsInN0b3AiLCJyb3RhdGlvbkxvb3BPcHRpb25zIiwicm90YXRlQ2xvY2t3aXNlTm9ybWFsU3BlZWRMb29wIiwicm90YXRlQ2xvY2t3aXNlU2xvd01vdGlvbkxvb3AiLCJyb3RhdGVDb3VudGVyY2xvY2t3aXNlTm9ybWFsU3BlZWRMb29wIiwicm90YXRlQ291bnRlcmNsb2Nrd2lzZVNsb3dNb3Rpb25Mb29wIiwidXBkYXRlUm90YXRpb25Tb3VuZCIsInJvdGF0aW5nIiwiYXNzZXJ0IiwibGVuZ3RoIiwibW9sZWN1bGUiLCJnZXQiLCJyb3RhdGlvbkRpcmVjdGlvbkNsb2Nrd2lzZVByb3BlcnR5IiwidmFsdWUiLCJ2aWJyYXRpb25Mb29wT3B0aW9ucyIsIm1vbGVjdWxlVmlicmF0aW9uTm9ybWFsU3BlZWRMb29wIiwibW9sZWN1bGVWaWJyYXRpb25TbG93TW90aW9uTG9vcCIsInVwZGF0ZVZpYnJhdGlvblNvdW5kIiwidmlicmF0aW5nIiwibGluayIsImlzU2xvd01vdGlvbiIsImlzUGxheWluZyIsImFkZFNvdW5kUGxheWVyc1RvTW9sZWN1bGUiLCJwaG90b25BYnNvcmJlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImJyb2tlQXBhcnRFbWl0dGVyIiwiaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZVByb3BlcnR5Iiwicm90YXRpbmdQcm9wZXJ0eSIsInZpYnJhdGluZ1Byb3BlcnR5IiwiZm9yRWFjaCIsImFjdGl2ZU1vbGVjdWxlIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRlZE1vbGVjdWxlIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsInJlbW92ZWRNb2xlY3VsZSIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vbGVjdWxlQWN0aW9uU291bmRHZW5lcmF0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBzb3VuZCBnZW5lcmF0b3IgdGhhdCBwcm9kdWNlcyBzb3VuZHMgZm9yIHRoZSB2YXJpb3VzIGFjdGlvbnMgdGhhdCBhIG1vbGVjdWxlIGNhbiB0YWtlLCBzdWNoIGFzIHZpYnJhdGluZywgcm90YXRpbmcsXHJcbiAqIGJlY29taW5nIGVuZXJnaXplZCwgYW5kIHNvIGZvcnRoLiAgVGhpcyB0eXBlIHdhdGNoZXMgYSBsaXN0IG9mIGFjdGl2ZSBtb2xlY3VsZXMgYW5kIGhvb2tzIHVwIGxpc3RlbmVycyB0byBlYWNoIG9uZVxyXG4gKiB0aGF0IHdpbGwgZ2VuZXJhdGUgdGhlIHZhcmlvdXMgc291bmRzLlxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IFNvdW5kR2VuZXJhdG9yIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgYWJzb3JiUGhvdG9uX21wMyBmcm9tICcuLi8uLi8uLi9zb3VuZHMvYWJzb3JiUGhvdG9uX21wMy5qcyc7XHJcbmltcG9ydCBicmVha0FwYXJ0X21wMyBmcm9tICcuLi8uLi8uLi9zb3VuZHMvYnJlYWtBcGFydF9tcDMuanMnO1xyXG5pbXBvcnQgZW5lcmdpemVkX21wMyBmcm9tICcuLi8uLi8uLi9zb3VuZHMvZW5lcmdpemVkX21wMy5qcyc7XHJcbmltcG9ydCByb3RhdGlvbkNsb2Nrd2lzZV9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3JvdGF0aW9uQ2xvY2t3aXNlX21wMy5qcyc7XHJcbmltcG9ydCByb3RhdGlvbkNsb2Nrd2lzZVNsb3dNb3Rpb25fbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy9yb3RhdGlvbkNsb2Nrd2lzZVNsb3dNb3Rpb25fbXAzLmpzJztcclxuaW1wb3J0IHJvdGF0aW9uQ291bnRlcmNsb2Nrd2lzZV9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3JvdGF0aW9uQ291bnRlcmNsb2Nrd2lzZV9tcDMuanMnO1xyXG5pbXBvcnQgcm90YXRpb25Db3VudGVyY2xvY2t3aXNlU2xvd01vdGlvbl9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3JvdGF0aW9uQ291bnRlcmNsb2Nrd2lzZVNsb3dNb3Rpb25fbXAzLmpzJztcclxuaW1wb3J0IHZpYnJhdGlvbl9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3ZpYnJhdGlvbl9tcDMuanMnO1xyXG5pbXBvcnQgdmlicmF0aW9uU2xvd01vdGlvbl9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL3ZpYnJhdGlvblNsb3dNb3Rpb25fbXAzLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQUJTT1JQVElPTl9UT19BQ1RJVklUWV9TT1VORF9ERUxBWSA9IDAuMjsgLy8gaW4gc2Vjb25kc1xyXG5cclxuY2xhc3MgTW9sZWN1bGVBY3Rpb25Tb3VuZEdlbmVyYXRvciBleHRlbmRzIFNvdW5kR2VuZXJhdG9yIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYnNlcnZhYmxlQXJyYXlEZWYuPE1vbGVjdWxlPn1hY3RpdmVNb2xlY3VsZXNcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gc2ltSXNSdW5uaW5nUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gaXNTbG93TW90aW9uUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGFjdGl2ZU1vbGVjdWxlcywgc2ltSXNSdW5uaW5nUHJvcGVydHksIGlzU2xvd01vdGlvblByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIG9wdGlvbnMgKTtcclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gcGhvdG9uIGFic29yYmVkIHNvdW5kXHJcbiAgICBjb25zdCBwaG90b25BYnNvcmJlZFNvdW5kQ2xpcCA9IG5ldyBTb3VuZENsaXAoIGFic29yYlBob3Rvbl9tcDMsIHsgaW5pdGlhbE91dHB1dExldmVsOiAwLjEgfSApO1xyXG4gICAgcGhvdG9uQWJzb3JiZWRTb3VuZENsaXAuY29ubmVjdCggdGhpcy5zb3VuZFNvdXJjZURlc3RpbmF0aW9uICk7XHJcbiAgICBjb25zdCBwaG90b25BYnNvcmJlZFNvdW5kUGxheWVyID0gKCkgPT4ge1xyXG4gICAgICBwaG90b25BYnNvcmJlZFNvdW5kQ2xpcC5wbGF5KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGJyZWFrIGFwYXJ0IHNvdW5kXHJcbiAgICBjb25zdCBicmVha0FwYXJ0U291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggYnJlYWtBcGFydF9tcDMsIHsgaW5pdGlhbE91dHB1dExldmVsOiAxIH0gKTtcclxuICAgIGJyZWFrQXBhcnRTb3VuZENsaXAuY29ubmVjdCggdGhpcy5zb3VuZFNvdXJjZURlc3RpbmF0aW9uICk7XHJcbiAgICBjb25zdCBicmVha0FwYXJ0U291bmRQbGF5ZXIgPSAoKSA9PiB7XHJcbiAgICAgIGJyZWFrQXBhcnRTb3VuZENsaXAucGxheSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBcImVuZXJnaXplZFwiIHNvdW5kLCB3aGljaCBpcyBwbGF5ZWQgd2hlbiB0aGUgbW9sZWN1bGUgZW50ZXJzIGEgaGlnaGVyLWVuZXJneSBzdGF0ZSAoZGVwaWN0ZWQgaW4gdGhlIHZpZXcgYXMgZ2xvd2luZylcclxuICAgIGNvbnN0IG1vbGVjdWxlRW5lcmdpemVkTG9vcCA9IG5ldyBTb3VuZENsaXAoIGVuZXJnaXplZF9tcDMsIHtcclxuICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjMsXHJcbiAgICAgIGVuYWJsZUNvbnRyb2xQcm9wZXJ0aWVzOiBbIHNpbUlzUnVubmluZ1Byb3BlcnR5IF1cclxuICAgIH0gKTtcclxuICAgIG1vbGVjdWxlRW5lcmdpemVkTG9vcC5jb25uZWN0KCB0aGlzLnNvdW5kU291cmNlRGVzdGluYXRpb24gKTtcclxuICAgIGNvbnN0IHVwZGF0ZU1vbGVjdWxlRW5lcmdpemVkU291bmQgPSBtb2xlY3VsZUVuZXJnaXplZCA9PiB7XHJcbiAgICAgIGlmICggbW9sZWN1bGVFbmVyZ2l6ZWQgKSB7XHJcbiAgICAgICAgbW9sZWN1bGVFbmVyZ2l6ZWRMb29wLnBsYXkoIEFCU09SUFRJT05fVE9fQUNUSVZJVFlfU09VTkRfREVMQVkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBtb2xlY3VsZUVuZXJnaXplZExvb3Auc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHJvdGF0aW9uIHNvdW5kc1xyXG4gICAgY29uc3Qgcm90YXRpb25Mb29wT3B0aW9ucyA9IHtcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjMsXHJcbiAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgIGVuYWJsZUNvbnRyb2xQcm9wZXJ0aWVzOiBbIHNpbUlzUnVubmluZ1Byb3BlcnR5IF1cclxuICAgIH07XHJcblxyXG4gICAgLy8gY2xvY2t3aXNlIG5vcm1hbCBzcGVlZFxyXG4gICAgY29uc3Qgcm90YXRlQ2xvY2t3aXNlTm9ybWFsU3BlZWRMb29wID0gbmV3IFNvdW5kQ2xpcChcclxuICAgICAgcm90YXRpb25DbG9ja3dpc2VfbXAzLFxyXG4gICAgICByb3RhdGlvbkxvb3BPcHRpb25zXHJcbiAgICApO1xyXG4gICAgcm90YXRlQ2xvY2t3aXNlTm9ybWFsU3BlZWRMb29wLmNvbm5lY3QoIHRoaXMuc291bmRTb3VyY2VEZXN0aW5hdGlvbiApO1xyXG5cclxuICAgIC8vIGNsb2Nrd2lzZSBzbG93IG1vdGlvblxyXG4gICAgY29uc3Qgcm90YXRlQ2xvY2t3aXNlU2xvd01vdGlvbkxvb3AgPSBuZXcgU291bmRDbGlwKFxyXG4gICAgICByb3RhdGlvbkNsb2Nrd2lzZVNsb3dNb3Rpb25fbXAzLFxyXG4gICAgICByb3RhdGlvbkxvb3BPcHRpb25zXHJcbiAgICApO1xyXG4gICAgcm90YXRlQ2xvY2t3aXNlU2xvd01vdGlvbkxvb3AuY29ubmVjdCggdGhpcy5zb3VuZFNvdXJjZURlc3RpbmF0aW9uICk7XHJcblxyXG4gICAgLy8gY291bnRlcmNsb2Nrd2lzZSBub3JtYWwgc3BlZWRcclxuICAgIGNvbnN0IHJvdGF0ZUNvdW50ZXJjbG9ja3dpc2VOb3JtYWxTcGVlZExvb3AgPSBuZXcgU291bmRDbGlwKFxyXG4gICAgICByb3RhdGlvbkNvdW50ZXJjbG9ja3dpc2VfbXAzLFxyXG4gICAgICByb3RhdGlvbkxvb3BPcHRpb25zXHJcbiAgICApO1xyXG4gICAgcm90YXRlQ291bnRlcmNsb2Nrd2lzZU5vcm1hbFNwZWVkTG9vcC5jb25uZWN0KCB0aGlzLnNvdW5kU291cmNlRGVzdGluYXRpb24gKTtcclxuXHJcbiAgICAvLyBjb3VudGVyY2xvY2t3aXNlIHNsb3cgbW90aW9uXHJcbiAgICBjb25zdCByb3RhdGVDb3VudGVyY2xvY2t3aXNlU2xvd01vdGlvbkxvb3AgPSBuZXcgU291bmRDbGlwKFxyXG4gICAgICByb3RhdGlvbkNvdW50ZXJjbG9ja3dpc2VTbG93TW90aW9uX21wMyxcclxuICAgICAgcm90YXRpb25Mb29wT3B0aW9uc1xyXG4gICAgKTtcclxuICAgIHJvdGF0ZUNvdW50ZXJjbG9ja3dpc2VTbG93TW90aW9uTG9vcC5jb25uZWN0KCB0aGlzLnNvdW5kU291cmNlRGVzdGluYXRpb24gKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVSb3RhdGlvblNvdW5kID0gcm90YXRpbmcgPT4ge1xyXG4gICAgICBpZiAoIHJvdGF0aW5nICkge1xyXG5cclxuICAgICAgICAvLyBWZXJpZnkgdGhhdCB0aGVyZSBpcyBvbmx5IG9uZSBtb2xlY3VsZSB0aGF0IG5lZWRzIHRoaXMgc291bmQuICBBdCB0aGUgdGltZSBvZiB0aGlzIHdyaXRpbmcgLSBtaWQtTWFyY2ggMjAyMCAtXHJcbiAgICAgICAgLy8gdGhlcmUgYXJlIG5vdCBtdWx0aXBsZSBjb3BpZXMgb2YgdGhlIGxvb3BzLCBhbmQgdGhlcmUgd291bGQgbmVlZCB0byBiZSBpbiBvcmRlciB0byBzdXBwb3J0IG1vcmUgbW9sZWN1bGVzLlxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFjdGl2ZU1vbGVjdWxlcy5sZW5ndGggPD0gMSwgJ3NvdW5kIGdlbmVyYXRpb24gY2FuIG9ubHkgYmUgaGFuZGxlZCBmb3Igb25lIG1vbGVjdWxlJyApO1xyXG5cclxuICAgICAgICAvLyBwbGF5IGEgc291bmQgYmFzZWQgb24gdGhlIGRpcmVjdGlvbiBvZiByb3RhdGlvbiBhbmQgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzb3VuZCBmcm9tIHRoZSBQcmVmZXJlbmNlcyBkaWFsb2dcclxuICAgICAgICBjb25zdCBtb2xlY3VsZSA9IGFjdGl2ZU1vbGVjdWxlcy5nZXQoIDAgKTtcclxuICAgICAgICBpZiAoIG1vbGVjdWxlLnJvdGF0aW9uRGlyZWN0aW9uQ2xvY2t3aXNlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICBpZiAoIGlzU2xvd01vdGlvblByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgICByb3RhdGVDbG9ja3dpc2VTbG93TW90aW9uTG9vcC5wbGF5KCBBQlNPUlBUSU9OX1RPX0FDVElWSVRZX1NPVU5EX0RFTEFZICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcm90YXRlQ2xvY2t3aXNlTm9ybWFsU3BlZWRMb29wLnBsYXkoIEFCU09SUFRJT05fVE9fQUNUSVZJVFlfU09VTkRfREVMQVkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAoIGlzU2xvd01vdGlvblByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgICByb3RhdGVDb3VudGVyY2xvY2t3aXNlU2xvd01vdGlvbkxvb3AucGxheSggQUJTT1JQVElPTl9UT19BQ1RJVklUWV9TT1VORF9ERUxBWSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJvdGF0ZUNvdW50ZXJjbG9ja3dpc2VOb3JtYWxTcGVlZExvb3AucGxheSggQUJTT1JQVElPTl9UT19BQ1RJVklUWV9TT1VORF9ERUxBWSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByb3RhdGVDbG9ja3dpc2VOb3JtYWxTcGVlZExvb3Auc3RvcCgpO1xyXG4gICAgICAgIHJvdGF0ZUNsb2Nrd2lzZVNsb3dNb3Rpb25Mb29wLnN0b3AoKTtcclxuICAgICAgICByb3RhdGVDb3VudGVyY2xvY2t3aXNlTm9ybWFsU3BlZWRMb29wLnN0b3AoKTtcclxuICAgICAgICByb3RhdGVDb3VudGVyY2xvY2t3aXNlU2xvd01vdGlvbkxvb3Auc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHZpYnJhdGlvbiBzb3VuZHNcclxuICAgIGNvbnN0IHZpYnJhdGlvbkxvb3BPcHRpb25zID0ge1xyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNCxcclxuICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgZW5hYmxlQ29udHJvbFByb3BlcnRpZXM6IFsgc2ltSXNSdW5uaW5nUHJvcGVydHkgXVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyB2aWJyYXRpb24gbm9ybWFsIHNwZWVkXHJcbiAgICBjb25zdCBtb2xlY3VsZVZpYnJhdGlvbk5vcm1hbFNwZWVkTG9vcCA9IG5ldyBTb3VuZENsaXAoIHZpYnJhdGlvbl9tcDMsIHZpYnJhdGlvbkxvb3BPcHRpb25zICk7XHJcbiAgICBtb2xlY3VsZVZpYnJhdGlvbk5vcm1hbFNwZWVkTG9vcC5jb25uZWN0KCB0aGlzLnNvdW5kU291cmNlRGVzdGluYXRpb24gKTtcclxuXHJcbiAgICAvLyB2aWJyYXRpb24gc2xvdyBtb3Rpb25cclxuICAgIGNvbnN0IG1vbGVjdWxlVmlicmF0aW9uU2xvd01vdGlvbkxvb3AgPSBuZXcgU291bmRDbGlwKCB2aWJyYXRpb25TbG93TW90aW9uX21wMywge1xyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNCxcclxuICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgZW5hYmxlQ29udHJvbFByb3BlcnRpZXM6IFsgc2ltSXNSdW5uaW5nUHJvcGVydHkgXVxyXG4gICAgfSApO1xyXG4gICAgbW9sZWN1bGVWaWJyYXRpb25TbG93TW90aW9uTG9vcC5jb25uZWN0KCB0aGlzLnNvdW5kU291cmNlRGVzdGluYXRpb24gKTtcclxuXHJcbiAgICAvLyBmdW5jdGlvbiBmb3IgdXBkYXRpbmcgdGhlIHZpYnJhdGlvbiBzb3VuZFxyXG4gICAgY29uc3QgdXBkYXRlVmlicmF0aW9uU291bmQgPSB2aWJyYXRpbmcgPT4ge1xyXG4gICAgICBpZiAoIHZpYnJhdGluZyApIHtcclxuXHJcbiAgICAgICAgLy8gVmVyaWZ5IHRoYXQgdGhlcmUgaXMgb25seSBvbmUgbW9sZWN1bGUgdGhhdCBuZWVkcyB0aGlzIHNvdW5kLiAgQXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nIC0gbWlkLU1hcmNoIDIwMjAgLVxyXG4gICAgICAgIC8vIHRoZXJlIGFyZSBub3QgbXVsdGlwbGUgY29waWVzIG9mIHRoZSBsb29wcywgYW5kIHRoZXJlIHdvdWxkIG5lZWQgdG8gYmUgaW4gb3JkZXIgdG8gc3VwcG9ydCBtb3JlIG1vbGVjdWxlcy5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhY3RpdmVNb2xlY3VsZXMubGVuZ3RoIDw9IDEsICdzb3VuZCBnZW5lcmF0aW9uIGNhbiBvbmx5IGJlIGhhbmRsZWQgZm9yIG9uZSBtb2xlY3VsZScgKTtcclxuXHJcbiAgICAgICAgLy8gc3RhcnQgdGhlIHZpYnJhdGlvbiBzb3VuZCBwbGF5aW5nICh0aGlzIHdpbGwgaGF2ZSBubyBlZmZlY3QgaWYgdGhlIHNvdW5kIGlzIGFscmVhZHkgcGxheWluZylcclxuICAgICAgICBpZiAoIGlzU2xvd01vdGlvblByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgbW9sZWN1bGVWaWJyYXRpb25TbG93TW90aW9uTG9vcC5wbGF5KCBBQlNPUlBUSU9OX1RPX0FDVElWSVRZX1NPVU5EX0RFTEFZICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgbW9sZWN1bGVWaWJyYXRpb25Ob3JtYWxTcGVlZExvb3AucGxheSggQUJTT1JQVElPTl9UT19BQ1RJVklUWV9TT1VORF9ERUxBWSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBtb2xlY3VsZVZpYnJhdGlvbk5vcm1hbFNwZWVkTG9vcC5zdG9wKCk7XHJcbiAgICAgICAgbW9sZWN1bGVWaWJyYXRpb25TbG93TW90aW9uTG9vcC5zdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gc3dpdGNoIGJldHdlZW4gbm9ybWFsIHNwZWVkIGFuZCBzbG93IG1vdGlvbiBzb3VuZHMgaWYgdGhlIHNldHRpbmcgY2hhbmdlcyB3aGlsZSBhIHNvdW5kIGlzIHBsYXlpbmdcclxuICAgIGlzU2xvd01vdGlvblByb3BlcnR5LmxpbmsoIGlzU2xvd01vdGlvbiA9PiB7XHJcblxyXG4gICAgICBpZiAoIGlzU2xvd01vdGlvbiApIHtcclxuICAgICAgICBpZiAoIG1vbGVjdWxlVmlicmF0aW9uTm9ybWFsU3BlZWRMb29wLmlzUGxheWluZyApIHtcclxuICAgICAgICAgIG1vbGVjdWxlVmlicmF0aW9uTm9ybWFsU3BlZWRMb29wLnN0b3AoKTtcclxuICAgICAgICAgIG1vbGVjdWxlVmlicmF0aW9uU2xvd01vdGlvbkxvb3AucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHJvdGF0ZUNsb2Nrd2lzZU5vcm1hbFNwZWVkTG9vcC5pc1BsYXlpbmcgKSB7XHJcbiAgICAgICAgICByb3RhdGVDbG9ja3dpc2VOb3JtYWxTcGVlZExvb3Auc3RvcCgpO1xyXG4gICAgICAgICAgcm90YXRlQ2xvY2t3aXNlU2xvd01vdGlvbkxvb3AucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHJvdGF0ZUNvdW50ZXJjbG9ja3dpc2VOb3JtYWxTcGVlZExvb3AuaXNQbGF5aW5nICkge1xyXG4gICAgICAgICAgcm90YXRlQ291bnRlcmNsb2Nrd2lzZU5vcm1hbFNwZWVkTG9vcC5zdG9wKCk7XHJcbiAgICAgICAgICByb3RhdGVDb3VudGVyY2xvY2t3aXNlU2xvd01vdGlvbkxvb3AucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpZiAoIG1vbGVjdWxlVmlicmF0aW9uU2xvd01vdGlvbkxvb3AuaXNQbGF5aW5nICkge1xyXG4gICAgICAgICAgbW9sZWN1bGVWaWJyYXRpb25TbG93TW90aW9uTG9vcC5zdG9wKCk7XHJcbiAgICAgICAgICBtb2xlY3VsZVZpYnJhdGlvbk5vcm1hbFNwZWVkTG9vcC5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggcm90YXRlQ2xvY2t3aXNlU2xvd01vdGlvbkxvb3AuaXNQbGF5aW5nICkge1xyXG4gICAgICAgICAgcm90YXRlQ2xvY2t3aXNlU2xvd01vdGlvbkxvb3Auc3RvcCgpO1xyXG4gICAgICAgICAgcm90YXRlQ2xvY2t3aXNlTm9ybWFsU3BlZWRMb29wLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCByb3RhdGVDb3VudGVyY2xvY2t3aXNlU2xvd01vdGlvbkxvb3AuaXNQbGF5aW5nICkge1xyXG4gICAgICAgICAgcm90YXRlQ291bnRlcmNsb2Nrd2lzZVNsb3dNb3Rpb25Mb29wLnN0b3AoKTtcclxuICAgICAgICAgIHJvdGF0ZUNvdW50ZXJjbG9ja3dpc2VOb3JtYWxTcGVlZExvb3AucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGZ1bmN0aW9uIHRoYXQgYWRkcyBhbGwgb2YgdGhlIGxpc3RlbmVycyBpbnZvbHZlZCBpbiBwcm9kdWNpbmcgdGhlIG1vbGVjdWxlIGFjdGlvbiBzb3VuZHNcclxuICAgIGNvbnN0IGFkZFNvdW5kUGxheWVyc1RvTW9sZWN1bGUgPSBtb2xlY3VsZSA9PiB7XHJcbiAgICAgIG1vbGVjdWxlLnBob3RvbkFic29yYmVkRW1pdHRlci5hZGRMaXN0ZW5lciggcGhvdG9uQWJzb3JiZWRTb3VuZFBsYXllciApO1xyXG4gICAgICBtb2xlY3VsZS5icm9rZUFwYXJ0RW1pdHRlci5hZGRMaXN0ZW5lciggYnJlYWtBcGFydFNvdW5kUGxheWVyICk7XHJcbiAgICAgIG1vbGVjdWxlLmhpZ2hFbGVjdHJvbmljRW5lcmd5U3RhdGVQcm9wZXJ0eS5saW5rKCB1cGRhdGVNb2xlY3VsZUVuZXJnaXplZFNvdW5kICk7XHJcbiAgICAgIG1vbGVjdWxlLnJvdGF0aW5nUHJvcGVydHkubGluayggdXBkYXRlUm90YXRpb25Tb3VuZCApO1xyXG4gICAgICBtb2xlY3VsZS52aWJyYXRpbmdQcm9wZXJ0eS5saW5rKCB1cGRhdGVWaWJyYXRpb25Tb3VuZCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBob29rIHVwIGxpc3RlbmVycyBmb3IgYW55IG1vbGVjdWxlcyB0aGF0IGFyZSBhbHJlYWR5IG9uIHRoZSBsaXN0XHJcbiAgICBhY3RpdmVNb2xlY3VsZXMuZm9yRWFjaCggYWN0aXZlTW9sZWN1bGUgPT4ge1xyXG4gICAgICBhZGRTb3VuZFBsYXllcnNUb01vbGVjdWxlKCBhY3RpdmVNb2xlY3VsZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGxpc3RlbiBmb3IgbmV3IG1vbGVjdWxlcyBhbmQgYWRkIHRoZSBsaXN0ZW5lcnMgdGhhdCBwcm9kdWNlIHRoZSBhY3Rpb24gc291bmRzIHdoZW4gb25lIGFycml2ZXNcclxuICAgIGFjdGl2ZU1vbGVjdWxlcy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkZWRNb2xlY3VsZSA9PiB7XHJcbiAgICAgIGFkZFNvdW5kUGxheWVyc1RvTW9sZWN1bGUoIGFkZGVkTW9sZWN1bGUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIHNvdW5kLXByb2R1Y2luZyBsaXN0ZW5lcnMgd2hlbiBhIG1vbGVjdWxlIGlzIHJlbW92ZWRcclxuICAgIGFjdGl2ZU1vbGVjdWxlcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmVkTW9sZWN1bGUgPT4ge1xyXG4gICAgICBpZiAoIHJlbW92ZWRNb2xlY3VsZS5waG90b25BYnNvcmJlZEVtaXR0ZXIuaGFzTGlzdGVuZXIoIHBob3RvbkFic29yYmVkU291bmRQbGF5ZXIgKSApIHtcclxuICAgICAgICByZW1vdmVkTW9sZWN1bGUucGhvdG9uQWJzb3JiZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBwaG90b25BYnNvcmJlZFNvdW5kUGxheWVyICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByZW1vdmVkTW9sZWN1bGUuYnJva2VBcGFydEVtaXR0ZXIuaGFzTGlzdGVuZXIoIGJyZWFrQXBhcnRTb3VuZFBsYXllciApICkge1xyXG4gICAgICAgIHJlbW92ZWRNb2xlY3VsZS5icm9rZUFwYXJ0RW1pdHRlci5yZW1vdmVMaXN0ZW5lciggYnJlYWtBcGFydFNvdW5kUGxheWVyICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByZW1vdmVkTW9sZWN1bGUuaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB1cGRhdGVNb2xlY3VsZUVuZXJnaXplZFNvdW5kICkgKSB7XHJcbiAgICAgICAgcmVtb3ZlZE1vbGVjdWxlLmhpZ2hFbGVjdHJvbmljRW5lcmd5U3RhdGVQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZU1vbGVjdWxlRW5lcmdpemVkU291bmQgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHJlbW92ZWRNb2xlY3VsZS5yb3RhdGluZ1Byb3BlcnR5Lmhhc0xpc3RlbmVyKCB1cGRhdGVSb3RhdGlvblNvdW5kICkgKSB7XHJcbiAgICAgICAgcmVtb3ZlZE1vbGVjdWxlLnJvdGF0aW5nUHJvcGVydHkudW5saW5rKCB1cGRhdGVSb3RhdGlvblNvdW5kICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByZW1vdmVkTW9sZWN1bGUudmlicmF0aW5nUHJvcGVydHkuaGFzTGlzdGVuZXIoIHVwZGF0ZVZpYnJhdGlvblNvdW5kICkgKSB7XHJcbiAgICAgICAgcmVtb3ZlZE1vbGVjdWxlLnZpYnJhdGluZ1Byb3BlcnR5LnVubGluayggdXBkYXRlVmlicmF0aW9uU291bmQgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ01vbGVjdWxlQWN0aW9uU291bmRHZW5lcmF0b3InLCBNb2xlY3VsZUFjdGlvblNvdW5kR2VuZXJhdG9yICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1vbGVjdWxlQWN0aW9uU291bmRHZW5lcmF0b3I7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLG9EQUFvRDtBQUMxRSxPQUFPQyxjQUFjLE1BQU0seURBQXlEO0FBQ3BGLE9BQU9DLGdCQUFnQixNQUFNLHFDQUFxQztBQUNsRSxPQUFPQyxjQUFjLE1BQU0sbUNBQW1DO0FBQzlELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MscUJBQXFCLE1BQU0sMENBQTBDO0FBQzVFLE9BQU9DLCtCQUErQixNQUFNLG9EQUFvRDtBQUNoRyxPQUFPQyw0QkFBNEIsTUFBTSxpREFBaUQ7QUFDMUYsT0FBT0Msc0NBQXNDLE1BQU0sMkRBQTJEO0FBQzlHLE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsdUJBQXVCLE1BQU0sNENBQTRDO0FBQ2hGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjs7QUFFeEQ7QUFDQSxNQUFNQyxrQ0FBa0MsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFaEQsTUFBTUMsNEJBQTRCLFNBQVNaLGNBQWMsQ0FBQztFQUV4RDtBQUNG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