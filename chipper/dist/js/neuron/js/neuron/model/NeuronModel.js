// Copyright 2014-2022, University of Colorado Boulder
/**
 * Model for the 'Neuron' screen. This class represents the main class for modeling the axon.  It acts as the central
 * place where the interaction between the membrane, the particles (i.e. ions), and the gates is all governed.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import neuron from '../../neuron.js';
import MathUtils from '../common/MathUtils.js';
import NeuronConstants from '../common/NeuronConstants.js';
import RecordAndPlaybackModel from '../recordandplayback/RecordAndPlaybackModel.js';
import AxonMembrane from './AxonMembrane.js';
import MembraneChannelFactory from './MembraneChannelFactory.js';
import MembraneChannelTypes from './MembraneChannelTypes.js';
import MembraneCrossingDirection from './MembraneCrossingDirection.js';
import ModifiedHodgkinHuxleyModel from './ModifiedHodgkinHuxleyModel.js';
import NeuronModelState from './NeuronModelState.js';
import ParticleFactory from './ParticleFactory.js';
import ParticlePosition from './ParticlePosition.js';
import ParticleType from './ParticleType.js';
import PlaybackParticle from './PlaybackParticle.js';
import SlowBrownianMotionStrategy from './SlowBrownianMotionStrategy.js';
import SodiumDualGatedChannel from './SodiumDualGatedChannel.js';
import TimedFadeInStrategy from './TimedFadeInStrategy.js';

// default configuration values
const DEFAULT_FOR_SHOW_ALL_IONS = true;
const DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY = false;
const DEFAULT_FOR_CHARGES_SHOWN = false;
const DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN = false;

// numbers of the various types of channels that are present on the membrane
const NUM_GATED_SODIUM_CHANNELS = 20;
const NUM_GATED_POTASSIUM_CHANNELS = 20;
const NUM_SODIUM_LEAK_CHANNELS = 3;
const NUM_POTASSIUM_LEAK_CHANNELS = 7;

// nominal concentration values
const NOMINAL_SODIUM_EXTERIOR_CONCENTRATION = 145; // In millimolar (mM)
const NOMINAL_SODIUM_INTERIOR_CONCENTRATION = 10; // In millimolar (mM)
const NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION = 4; // In millimolar (mM)
const NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION = 140; // In millimolar (mM)

// numbers of "bulk" ions in and out of the cell when visible
const NUM_SODIUM_IONS_OUTSIDE_CELL = 450;
const NUM_SODIUM_IONS_INSIDE_CELL = 6;
const NUM_POTASSIUM_IONS_OUTSIDE_CELL = 45;
const NUM_POTASSIUM_IONS_INSIDE_CELL = 150;

// Define the amount of delay between the values changing in the HH model until the concentration readouts are
// updated.  This is needed to make sure that the concentration readouts don't change before visible potassium or
// sodium ions have crossed the membrane.
const CONCENTRATION_READOUT_DELAY = 0.0005; // in seconds of sim time

// Define the thresholds for determining whether an action potential should be considered to be in progress.  These
// values relate to the rate of flow through the gated sodium, gated potassium, and combination of the sodium and
// potassium leakage. If the values from the HH model exceed any of these, and action potential is considered to be in
// progress. The values were determined empirically, and different HH models may require different values here.
const POTASSIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.001;
const SODIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.001;
const LEAKAGE_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.444;

// Define the rates at which concentration changes during action potential.  These values combined with the
// conductance at each time step are used to calculate the concentration changes.
const INTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM = 0.4;
const EXTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM = 7;
const INTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM = 2.0;
const EXTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM = 0.05;

// threshold of significant difference for concentration values
const CONCENTRATION_DIFF_THRESHOLD = 0.000001;

// Define the rate at which concentration is restored to nominal value.  Higher value means quicker restoration.
const CONCENTRATION_RESTORATION_FACTOR = 1000;

// value that controls how much of a change of the membrane potential must occur before a notification is sent out
const MEMBRANE_POTENTIAL_CHANGE_THRESHOLD = 0.005;

// default values of opacity for newly created particles
const FOREGROUND_PARTICLE_DEFAULT_OPACITY = 0.25;
const BACKGROUND_PARTICLE_DEFAULT_OPACITY = 0.10; // default alpha in Java was 0.05, which isn't visible in the canvas so slightly increasing to 0.10

class NeuronModel extends RecordAndPlaybackModel {
  constructor() {
    const maxRecordPoints = Math.ceil(NeuronConstants.TIME_SPAN * 1000 / NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT);
    super(maxRecordPoints);
    this.axonMembrane = new AxonMembrane();

    // @public - events emitted by this model
    this.channelRepresentationChanged = new Emitter();
    this.particlesMoved = new Emitter();

    // @public, read-only - list of the particles that come and go when the simulation is working in real time
    this.transientParticles = createObservableArray();

    // @private - backup of the transient particles, used to restore them when returning to live mode after doing playback
    this.transientParticlesBackup = createObservableArray();

    // @public, read-only - particles that are "in the background", meaning that they are always present and they don't
    // cross the membrane
    this.backgroundParticles = createObservableArray();

    // @public, read-only - list of particles that are shown during playback
    this.playbackParticles = createObservableArray();
    this.membraneChannels = createObservableArray(); // @public, read-only
    this.hodgkinHuxleyModel = new ModifiedHodgkinHuxleyModel(); // @public

    // @public, read-only - various model values
    this.crossSectionInnerRadius = (this.axonMembrane.getCrossSectionDiameter() - this.axonMembrane.getMembraneThickness()) / 2;
    this.crossSectionOuterRadius = (this.axonMembrane.getCrossSectionDiameter() + this.axonMembrane.getMembraneThickness()) / 2;
    this.sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
    this.sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
    this.potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
    this.potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;

    // @public
    this.potentialChartVisibleProperty = new Property(DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY); // @public
    this.chargesShownProperty = new Property(DEFAULT_FOR_CHARGES_SHOWN); // @public
    this.concentrationReadoutVisibleProperty = new Property(DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN);
    this.membranePotentialProperty = new Property(0);
    this.stimulusLockoutProperty = new Property(false);
    this.allIonsSimulatedProperty = new Property(DEFAULT_FOR_SHOW_ALL_IONS); // controls whether all ions, or just those near membrane, are simulated
    this.playbackParticlesVisibleProperty = new Property(false);
    this.concentrationChangedProperty = new Property(false);
    this.stimulusPulseInitiatedProperty = new Property(false);
    this.neuronModelPlaybackStateProperty = new Property(null);

    // @public, part of a workaround for an issue with refreshing canvases when nothing is drawn, see
    // https://github.com/phetsims/neuron/issues/100 and https://github.com/phetsims/scenery/issues/503
    this.atLeastOneParticlePresentProperty = new Property(false);

    // add a listener that will stimulate the HH model then the traveling action potential reaches the cross section
    this.axonMembrane.travelingActionPotentialReachedCrossSection.addListener(() => {
      // The action potential has arrived at the cross section, so stimulate the model the simulates the action
      // potential voltages and current flows.
      this.hodgkinHuxleyModel.stimulate();
      if (window.phet.neuron.profiler && window.phet.neuron.profiler.setting === 1) {
        // If enabled, start collecting profiling data, which will automatically be spat out to the console (or as
        // an alert dialog on iOS) when completed.  The duration value is empirically determined to be the time for
        // the particles to appear, cross the membrane, and fade out.
        window.phet.neuron.profiler.startDataAnalysis(6000);
      }
    });

    // add a listener that will add and remove the background or 'bulk' particles based on simulation settings
    this.allIonsSimulatedProperty.lazyLink(allIonsSimulated => {
      // This should never change while stimulus is locked out, and we depend on the UI to enforce this rule.
      // Otherwise, background particles could come and go during and action potential or during playback, which would
      // be hard to handle.
      assert && assert(!this.isStimulusInitiationLockedOut(), 'all ions setting changed when stimulus was locked out');
      if (allIonsSimulated) {
        // add the background particles
        this.addInitialBulkParticles();
      } else {
        // remove the background particles
        this.backgroundParticles.clear();
      }

      // update the property that indicates whether there is at least one particle present
      this.atLeastOneParticlePresentProperty.set(this.backgroundParticles.length + this.transientParticles.length + this.playbackParticles.length > 0);
    });

    // Use an immediately invoked function expression (IIFE) a function to add the initial channels.  The pattern is
    // intended to be such that the potassium and sodium gated channels are right next to each other, with occasional
    // leak channels interspersed.  There should be one or more of each type of channel on the top of the membrane so
    // when the user zooms in, they can see all types.
    (() => {
      let angle = Math.PI * 0.45;
      const totalNumChannels = NUM_GATED_SODIUM_CHANNELS + NUM_GATED_POTASSIUM_CHANNELS + NUM_SODIUM_LEAK_CHANNELS + NUM_POTASSIUM_LEAK_CHANNELS;
      const angleIncrement = Math.PI * 2 / totalNumChannels;
      let gatedSodiumChannelsAdded = 0;
      let gatedPotassiumChannelsAdded = 0;
      let sodiumLeakChannelsAdded = 0;
      let potassiumLeakChannelsAdded = 0;

      // Add some of each type so that they are visible at the top portion of the membrane.
      if (NUM_SODIUM_LEAK_CHANNELS > 0) {
        this.addChannel(MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL, angle);
        sodiumLeakChannelsAdded++;
        angle += angleIncrement;
      }
      if (NUM_GATED_POTASSIUM_CHANNELS > 0) {
        this.addChannel(MembraneChannelTypes.POTASSIUM_GATED_CHANNEL, angle);
        gatedPotassiumChannelsAdded++;
        angle += angleIncrement;
      }
      if (NUM_GATED_SODIUM_CHANNELS > 0) {
        this.addChannel(MembraneChannelTypes.SODIUM_GATED_CHANNEL, angle);
        gatedSodiumChannelsAdded++;
        angle += angleIncrement;
      }
      if (NUM_POTASSIUM_LEAK_CHANNELS > 0) {
        this.addChannel(MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL, angle);
        potassiumLeakChannelsAdded++;
        angle += angleIncrement;
      }

      // Now loop through the rest of the membrane's circumference adding the various types of gates.
      for (let i = 0; i < totalNumChannels - 4; i++) {
        // Calculate the "urgency" for each type of gate.
        const gatedSodiumUrgency = NUM_GATED_SODIUM_CHANNELS / gatedSodiumChannelsAdded;
        const gatedPotassiumUrgency = NUM_GATED_POTASSIUM_CHANNELS / gatedPotassiumChannelsAdded;
        const potassiumLeakUrgency = NUM_POTASSIUM_LEAK_CHANNELS / potassiumLeakChannelsAdded;
        const sodiumLeakUrgency = NUM_SODIUM_LEAK_CHANNELS / sodiumLeakChannelsAdded;
        let channelTypeToAdd = null;
        if (gatedSodiumUrgency >= gatedPotassiumUrgency && gatedSodiumUrgency >= potassiumLeakUrgency && gatedSodiumUrgency >= sodiumLeakUrgency) {
          // Add a gated sodium channel.
          channelTypeToAdd = MembraneChannelTypes.SODIUM_GATED_CHANNEL;
          gatedSodiumChannelsAdded++;
        } else if (gatedPotassiumUrgency > gatedSodiumUrgency && gatedPotassiumUrgency >= potassiumLeakUrgency && gatedPotassiumUrgency >= sodiumLeakUrgency) {
          // Add a gated potassium channel.
          channelTypeToAdd = MembraneChannelTypes.POTASSIUM_GATED_CHANNEL;
          gatedPotassiumChannelsAdded++;
        } else if (potassiumLeakUrgency > gatedSodiumUrgency && potassiumLeakUrgency > gatedPotassiumUrgency && potassiumLeakUrgency >= sodiumLeakUrgency) {
          // Add a potassium leak channel.
          channelTypeToAdd = MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL;
          potassiumLeakChannelsAdded++;
        } else if (sodiumLeakUrgency > gatedSodiumUrgency && sodiumLeakUrgency > gatedPotassiumUrgency && sodiumLeakUrgency > potassiumLeakUrgency) {
          // Add a sodium leak channel.
          channelTypeToAdd = MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL;
          sodiumLeakChannelsAdded++;
        } else {
          assert && assert(false); // Should never get here, so debug if it does.
        }

        this.addChannel(channelTypeToAdd, angle);
        angle += angleIncrement;
      }
    })();

    // Note: It is expected that the model will be reset once it has been created, and this will set the initial state,
    // including adding the particles to the model.
    this.timeProperty.link(this.updateRecordPlayBack.bind(this));
    this.modeProperty.link(this.updateRecordPlayBack.bind(this));
    this.reset(); // This does initialization
  }

  /**
   * dispatched from NeuronClockModelAdapter's step function
   * @param {number} dt - delta time, in seconds
   * @public
   */
  step(dt) {
    if (dt < 0) {
      // this is a backwards time step, so make sure that we are in the playback mode
      this.setPlayback();

      // If the current simulation time is past the end of the max recorded time, set the time to the max recorded
      // value so that the cursor will appear on the chart (if visible), thus allowing the user to interact with it.
      if (this.getTime() > this.getMaxRecordedTime()) {
        this.setTime(this.getMaxRecordedTime());
      }
    }
    super.step(dt);

    // If we are currently in playback mode and we have reached the end of the recorded data, we should automatically
    // switch to record mode.
    if (this.isPlayback() && this.getTime() >= this.getMaxRecordedTime()) {
      this.setModeRecord();
      this.setPlaying(true);
    }
  }

  /**
   * Step the actual mode, which is done by stepping each of the constituent elements of the model.  This is called
   * by the active RecordAndPlayback Model mode, see the RecordAndPlayBackModel step function.
   * @param {number} dt
   * @returns {NeuronModelState}
   * @public
   */
  stepInTime(dt) {
    // Step the membrane in time.  This is done prior to stepping the HH model because the traveling action potential
    // is part of the membrane, so if it reaches the cross section in this time step the membrane potential will be
    // modified.
    this.axonMembrane.stepInTime(dt);

    // This is a step forward in time.  Update the value of the membrane potential by stepping the Hodgkins-Huxley
    // model.
    this.hodgkinHuxleyModel.stepInTime(dt);

    // There is a bit of a threshold on sending out notifications of membrane voltage changes, since otherwise the
    // natural "noise" in the model causes notifications to be sent out continuously.
    if (Math.abs(this.membranePotentialProperty.get() - this.hodgkinHuxleyModel.getMembraneVoltage()) > MEMBRANE_POTENTIAL_CHANGE_THRESHOLD) {
      this.membranePotentialProperty.set(this.hodgkinHuxleyModel.getMembraneVoltage());
    }

    // Update the stimulus lockout state.
    this.updateStimulusLockoutState();

    // OPTIMIZATION NOTE: For better performance, and because the contents of the observable arrays are not being
    // modified, the following loops reach into the observable arrays and loop on the regular array contained within.

    // Step the channels.
    this.membraneChannels.forEach(channel => {
      channel.stepInTime(dt);
    });
    this.transientParticles.forEach(particle => {
      particle.stepInTime(dt);
    });

    // Step the background particles, which causes them to exhibit a
    // little Brownian motion
    this.backgroundParticles.forEach(particle => {
      particle.stepInTime(dt);
    });

    // Adjust the overall potassium and sodium concentration levels based parameters of the HH model.  This is done
    // solely to provide values that can be displayed to the user, and are not used for anything else in the model.
    let concentrationChanged = this.concentrationChangedProperty.set(false);
    let difference;
    const potassiumConductance = this.hodgkinHuxleyModel.get_delayed_n4(CONCENTRATION_READOUT_DELAY);
    if (potassiumConductance !== 0) {
      // Potassium is moving out of the cell as part of the process of
      // an action potential, so adjust the interior and exterior
      // concentration values.
      this.potassiumExteriorConcentration += potassiumConductance * dt * EXTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM;
      this.potassiumInteriorConcentration -= potassiumConductance * dt * INTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM;
      concentrationChanged = true;
    } else {
      if (this.potassiumExteriorConcentration !== NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION) {
        difference = this.potassiumExteriorConcentration - NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;
        if (difference < CONCENTRATION_DIFF_THRESHOLD) {
          // Close enough to consider it fully restored.
          this.potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;
        } else {
          // Move closer to the nominal value.
          this.potassiumExteriorConcentration -= difference * CONCENTRATION_RESTORATION_FACTOR * dt;
        }
        concentrationChanged = true;
      }
      if (this.potassiumInteriorConcentration !== NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION) {
        difference = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION - this.potassiumInteriorConcentration;
        if (difference < CONCENTRATION_DIFF_THRESHOLD) {
          // Close enough to consider it fully restored.
          this.potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
        } else {
          // Move closer to the nominal value.
          this.potassiumInteriorConcentration += difference * CONCENTRATION_RESTORATION_FACTOR * dt;
        }
        concentrationChanged = true;
      }
    }
    const sodiumConductance = this.hodgkinHuxleyModel.get_delayed_m3h(CONCENTRATION_READOUT_DELAY);
    if (this.hodgkinHuxleyModel.get_m3h() !== 0) {
      // Sodium is moving in to the cell as part of the process of an
      // action potential, so adjust the interior and exterior
      // concentration values.
      this.sodiumExteriorConcentration -= sodiumConductance * dt * EXTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM;
      this.sodiumInteriorConcentration += sodiumConductance * dt * INTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM;
      concentrationChanged = true;
    } else {
      if (this.sodiumExteriorConcentration !== NOMINAL_SODIUM_EXTERIOR_CONCENTRATION) {
        difference = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION - this.sodiumExteriorConcentration;
        if (difference < CONCENTRATION_DIFF_THRESHOLD) {
          // Close enough to consider it fully restored.
          this.sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
        } else {
          // Move closer to the nominal value.
          this.sodiumExteriorConcentration += difference * CONCENTRATION_RESTORATION_FACTOR * dt;
        }
        concentrationChanged = true;
      }
      if (this.sodiumInteriorConcentration !== NOMINAL_SODIUM_INTERIOR_CONCENTRATION) {
        difference = this.sodiumInteriorConcentration - NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
        if (difference < CONCENTRATION_DIFF_THRESHOLD) {
          // Close enough to consider it fully restored.
          this.sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
        } else {
          // Move closer to the nominal value.
          this.sodiumInteriorConcentration -= difference * CONCENTRATION_RESTORATION_FACTOR * dt;
        }
        concentrationChanged = true;
      }
    }
    if (concentrationChanged) {
      this.concentrationChangedProperty.set(true);
    }

    // Update the flag that indicates whether these is at least one particle present in the model.
    this.atLeastOneParticlePresentProperty.set(this.backgroundParticles.length + this.transientParticles.length + this.playbackParticles.length > 0);

    // Emit the event that lets the view know that the particles should be redrawn.
    this.particlesMoved.emit();

    // If any one channel's state is changed, trigger a channel representation changed event
    const channelStateChanged = membraneChannel => membraneChannel.channelStateChangedProperty.get();
    if (_.some(this.membraneChannels, channelStateChanged)) {
      this.channelRepresentationChanged.emit();
    }

    // Return model state after each time step.
    return this.getState();
  }

  /**
   * update some properties that can change as playback progresses
   * @protected
   */
  updateRecordPlayBack() {
    this.updateStimulusLockoutState();
    this.updateSimAndPlaybackParticleVisibility();
  }

  /**
   * Reset the neuron model.  This should restore everything to the initial state.
   * @public
   */
  reset() {
    // Reset the superclass, which contains the recording state & data.
    super.resetAll();

    // Reset the axon membrane.
    this.axonMembrane.reset();

    // Remove all existing particles.
    this.removeAllParticles();

    // Reset the HH model.
    this.hodgkinHuxleyModel.reset();

    // Reset all membrane channels.
    this.membraneChannels.forEach(membraneChannel => {
      membraneChannel.reset();
    });

    // Send notification of membrane channel change to make sure that channels are re-rendered.
    this.channelRepresentationChanged.emit();

    // Reset the concentration readout values.
    let concentrationChanged = this.concentrationChangedProperty.set(false);
    if (this.sodiumExteriorConcentration !== NOMINAL_SODIUM_EXTERIOR_CONCENTRATION) {
      this.sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
      concentrationChanged = true;
    }
    if (this.sodiumInteriorConcentration !== NOMINAL_SODIUM_INTERIOR_CONCENTRATION) {
      this.sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
      concentrationChanged = true;
    }
    if (this.potassiumExteriorConcentration !== NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION) {
      this.potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;
      concentrationChanged = true;
    }
    if (this.potassiumInteriorConcentration !== NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION) {
      this.potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
      concentrationChanged = true;
    }
    if (concentrationChanged) {
      this.concentrationChangedProperty.set(true); // Trigger concentrationReadout change
    }

    // Reset the stimulation lockout.
    this.setStimulusLockout(false);

    // Set the membrane chart to its initial state.
    this.setPotentialChartVisible(DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY);

    // Set the concentration readout visibility to its initial state.
    this.setConcentrationReadoutVisible(DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN);

    // Set the visibility of the charge symbols to its initial state.
    this.setChargesShown(DEFAULT_FOR_CHARGES_SHOWN);

    // Set the state of 'all ions simulated'.  If the default is on, cycle it off first to force a change so that
    // background particles are added.
    if (DEFAULT_FOR_SHOW_ALL_IONS === true) {
      this.setAllIonsSimulated(false);
    }
    this.setAllIonsSimulated(DEFAULT_FOR_SHOW_ALL_IONS);

    // Set the state of the record-and-playback model to be "live" (neither recording nor playing) and unpaused.
    this.clearHistory();
    this.setModeLive();
    this.setPlaying(true);
  }

  /**
   * Clear the recorded data.
   * @public
   * @override
   */
  clearHistory() {
    this.transientParticlesBackup.clear();
    super.clearHistory();
  }

  /**
   * Starts a particle of the specified type moving through the specified channel.  If one or more particles of the
   * needed type exist within the capture zone for this channel, one will be chosen and set to move through, and
   * another will be created to essentially take its place (though the newly created one will probably be in a
   * slightly different place for better visual effect).  If none of the needed particles exist, two will be created,
   * and one will move through the channel and the other will just hang out in the zone.
   *
   * Note that it is not guaranteed that the particle will make it through the channel, since it is possible that the
   * channel could close before the particle goes through it.
   *
   * @param {ParticleType.string} particleType
   * @param {MembraneChannel}channel
   * @param {number} maxVelocity
   * @param {MembraneCrossingDirection.string} direction
   * @public
   */
  requestParticleThroughChannel(particleType, channel, maxVelocity, direction) {
    let captureZone;
    if (direction === MembraneCrossingDirection.IN_TO_OUT) {
      captureZone = channel.getInteriorCaptureZone();
    } else {
      captureZone = channel.getExteriorCaptureZone();
    }
    const particleToCapture = this.createTransientParticle(particleType, captureZone);

    // Make the particle fade in.
    particleToCapture.setFadeStrategy(new TimedFadeInStrategy(0.0005));

    // Set a motion strategy that will cause this particle to move across the membrane.
    channel.moveParticleThroughNeuronMembrane(particleToCapture, maxVelocity);
  }

  /**
   * Return a value indicating whether simulation of all ions is currently turned on in the simulation.  And yes, it
   * would be more grammatically correct to set "areAllIonsSimulated", but we are sticking with the convention for
   * boolean variables.  So get over it.
   * @public
   */
  isAllIonsSimulated() {
    return this.allIonsSimulatedProperty.get();
  }

  /**
   * Set the boolean value that indicates whether all ions are shown in the simulation, or just those that are moving
   * across the membrane.
   * @param {boolean} allIonsSimulated
   * @public
   */
  setAllIonsSimulated(allIonsSimulated) {
    this.allIonsSimulatedProperty.set(allIonsSimulated);
  }

  /**
   * Add the "bulk particles", which are particles that are inside and outside of the membrane and, except in cases
   * where they happen to end up positioned close to the membrane, they generally stay where initially positioned.
   * @private
   */
  addInitialBulkParticles() {
    // Make a list of pre-existing particles.
    const preExistingParticles = _.clone(this.transientParticles);

    // Add the initial particles.
    this.addBackgroundParticles(ParticleType.SODIUM_ION, ParticlePosition.INSIDE_MEMBRANE, NUM_SODIUM_IONS_INSIDE_CELL);
    this.addBackgroundParticles(ParticleType.SODIUM_ION, ParticlePosition.OUTSIDE_MEMBRANE, NUM_SODIUM_IONS_OUTSIDE_CELL);
    this.addBackgroundParticles(ParticleType.POTASSIUM_ION, ParticlePosition.INSIDE_MEMBRANE, NUM_POTASSIUM_IONS_INSIDE_CELL);
    this.addBackgroundParticles(ParticleType.POTASSIUM_ION, ParticlePosition.OUTSIDE_MEMBRANE, NUM_POTASSIUM_IONS_OUTSIDE_CELL);

    // Look at each sodium gate and, if there are no ions in its capture zone, add some.
    this.membraneChannels.forEach(membraneChannel => {
      if (membraneChannel instanceof SodiumDualGatedChannel) {
        const captureZone = membraneChannel.getExteriorCaptureZone();
        const numParticlesInZone = this.scanCaptureZoneForFreeParticles(captureZone, ParticleType.SODIUM_ION);
        if (numParticlesInZone === 0) {
          this.addBackgroundParticlesToZone(ParticleType.SODIUM_ION, captureZone, Math.floor(dotRandom.nextDouble() * 2) + 1);
        }
      }
    });

    // Set all new particles to exhibit simple Brownian motion.
    this.backgroundParticles.forEach(backgroundParticle => {
      if (preExistingParticles.indexOf(backgroundParticle) === -1) {
        backgroundParticle.setMotionStrategy(new SlowBrownianMotionStrategy(backgroundParticle.getPositionX(), backgroundParticle.getPositionY()));
      }
    });
  }

  /**
   * Create a particle of the specified type in the specified capture zone. In general, this method will be used when
   * a particle is or may soon be needed to travel through a membrane channel.
   * @param {ParticleType.string} particleType
   * @param {CaptureZone} captureZone
   * @returns {Particle}
   * @private
   */
  createTransientParticle(particleType, captureZone) {
    const newParticle = ParticleFactory.createParticle(particleType);
    this.transientParticles.add(newParticle);
    if (captureZone) {
      // to avoid creation of new Vector2 instances the capture zone updates the particles position
      captureZone.assignNewParticlePosition(newParticle);
    }
    newParticle.continueExistingProperty.lazyLink(newValue => {
      if (!newValue) {
        this.transientParticles.remove(newParticle);
      }
    });
    return newParticle;
  }

  /**
   * Add the specified particles to the model.
   * @param {ParticleType.string} particleType
   * @param {ParticlePosition} position
   * @param {number} numberToAdd
   * @private
   */
  addBackgroundParticles(particleType, position, numberToAdd) {
    let newParticle = null;
    _.times(numberToAdd, value => {
      newParticle = this.createBackgroundParticle(particleType);
      if (position === ParticlePosition.INSIDE_MEMBRANE) {
        this.positionParticleInsideMembrane(newParticle);
      } else {
        this.positionParticleOutsideMembrane(newParticle);
      }
      // Set the opacity.
      if (dotRandom.nextDouble() >= 0.5) {
        // replaced for nextBoolean
        newParticle.setOpacity(FOREGROUND_PARTICLE_DEFAULT_OPACITY);
      } else {
        newParticle.setOpacity(BACKGROUND_PARTICLE_DEFAULT_OPACITY);
      }
    });
  }

  /**
   * Add the specified particles to the given capture zone.
   * @param {ParticleType.string} particleType
   * @param {CaptureZone} captureZone
   * @param {number} numberToAdd
   * @private
   */
  addBackgroundParticlesToZone(particleType, captureZone, numberToAdd) {
    let newParticle = null;
    for (let i = 0; i < numberToAdd; i++) {
      newParticle = this.createBackgroundParticle(particleType);
      newParticle.setOpacity(FOREGROUND_PARTICLE_DEFAULT_OPACITY);
      captureZone.assignNewParticlePosition(newParticle);
    }
  }

  // @public
  initiateStimulusPulse() {
    if (!this.isStimulusInitiationLockedOut()) {
      this.stimulusPulseInitiatedProperty.set(true);
      this.axonMembrane.initiateTravelingActionPotential();
      this.updateStimulusLockoutState();
      if (window.phet.neuron.profiler && window.phet.neuron.profiler.setting === 2) {
        // If enabled, start collecting profiling data, which will automatically be spat out to the console (or as
        // an alert dialog on iOS) when completed.  The duration value is empirically determined to be the time for
        // the traveling action potential to make it to the cross section.
        window.phet.neuron.profiler.startDataAnalysis(3000);
      } else if (window.phet.neuron.profiler && window.phet.neuron.profiler.setting === 3) {
        // If enabled, start collecting profiling data, which will automatically be spat out to the console (or as
        // an alert dialog on iOS) when completed.  The duration value is empirically determined to be the time for
        // the traveling action potential to make it to the cross section, the particles to appear, cross the
        // membrane, and then fade out.
        window.phet.neuron.profiler.startDataAnalysis(9500);
      }
    }
  }

  /**
   * Place a particle at a random position inside the axon membrane.
   * @param {Particle} particle
   * @private
   */
  positionParticleInsideMembrane(particle) {
    // Choose any angle.
    const angle = dotRandom.nextDouble() * Math.PI * 2;

    // Choose a distance from the cell center that is within the membrane. The multiplier value is created with the
    // intention of weighting the positions toward the outside in order to get an even distribution per unit area.
    const multiplier = Math.max(dotRandom.nextDouble(), dotRandom.nextDouble());
    const distance = (this.crossSectionInnerRadius - particle.getRadius() * 2) * multiplier;
    particle.setPosition(distance * Math.cos(angle), distance * Math.sin(angle));
  }

  /**
   * Returns a boolean values indicating whether or not an action potential is in progress.  For the purposes of this
   * sim, this means whether there is an AP traveling down the membrane or if the flow of ions through the channels at
   * the transverse cross section is enough to be considered part of an AP.
   * @returns {boolean}
   * @public
   */
  isActionPotentialInProgress() {
    return this.axonMembrane.getTravelingActionPotential() || Math.abs(this.hodgkinHuxleyModel.get_k_current()) > POTASSIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL || Math.abs(this.hodgkinHuxleyModel.get_na_current()) > SODIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL || Math.abs(this.hodgkinHuxleyModel.get_l_current()) > LEAKAGE_CURRENT_THRESH_FOR_ACTION_POTENTIAL;
  }

  /**
   * Place a particle at a random position outside the axon membrane.
   * @param {Particle} particle
   * @private
   */
  positionParticleOutsideMembrane(particle) {
    // Choose any angle.
    const angle = dotRandom.nextDouble() * Math.PI * 2;

    // Choose a distance from the cell center that is outside of the
    // membrane. The multiplier value is created with the intention of
    // weighting the positions toward the outside in order to get an even
    // distribution per unit area.
    const multiplier = dotRandom.nextDouble();
    const distance = this.crossSectionOuterRadius + particle.getRadius() * 4 + multiplier * this.crossSectionOuterRadius * 2.2;
    particle.setPosition(distance * Math.cos(angle), distance * Math.sin(angle));
  }

  /**
   * Scan the supplied capture zone for particles of the specified type.
   * @param {CaptureZone} zone
   * @param {ParticleType.string} particleType
   * @returns {number}
   * @private
   */
  scanCaptureZoneForFreeParticles(zone, particleType) {
    let closestFreeParticle = null;
    let distanceOfClosestParticle = Number.POSITIVE_INFINITY;
    let totalNumberOfParticles = 0;
    const captureZoneOrigin = zone.getOriginPoint();

    // loop over the contained array - this is faster, but the array can't be modified
    this.transientParticles.forEach(particle => {
      // This method is refactored to use position x,y components instead of vector2 instances
      if (particle.getType() === particleType && particle.isAvailableForCapture() && zone.isPointInZone(particle.getPositionX(), particle.getPositionY())) {
        totalNumberOfParticles++;
        if (closestFreeParticle === null) {
          closestFreeParticle = particle;
          distanceOfClosestParticle = MathUtils.distanceBetween(captureZoneOrigin.x, captureZoneOrigin.y, closestFreeParticle.getPositionX(), closestFreeParticle.getPositionY());
        } else if (MathUtils.distanceBetween(captureZoneOrigin.x, captureZoneOrigin.y, closestFreeParticle.getPositionX(), closestFreeParticle.getPositionY()) < distanceOfClosestParticle) {
          closestFreeParticle = particle;
          distanceOfClosestParticle = MathUtils.distanceBetween(captureZoneOrigin.x, captureZoneOrigin.y, closestFreeParticle.getPositionX(), closestFreeParticle.getPositionY());
        }
      }
    });
    return totalNumberOfParticles;
  }

  // @private
  updateStimulusLockoutState() {
    if (this.stimulusLockoutProperty.get()) {
      // Currently locked out, see if that should change.
      if (!this.isPlayback() && !this.isActionPotentialInProgress()) {
        this.setStimulusLockout(false);
      }
    } else {
      // Currently locked out, see if that should change.
      // Currently NOT locked out, see if that should change.
      const backwards = this.getTime() - this.getMaxRecordedTime() <= 0;
      if (this.isActionPotentialInProgress() || this.isPlayback() && backwards) {
        this.setStimulusLockout(true);
      }
    }
  }

  /**
   * There are two sets of particles in this simulation, one set that is used when actually simulating, and one that
   * is used when playing back.  This routine updates which set is visible based on state information.
   * @private
   */
  updateSimAndPlaybackParticleVisibility() {
    if (this.isRecord() || this.isLive()) {
      // In either of these modes, the simulation particles (as opposed to the playback particles) should be visible.
      // Make sure that this is the case.
      if (this.playbackParticlesVisibleProperty.get()) {
        // Hide the playback particles.  This is done by removing them from the model.
        this.playbackParticles.clear();

        // Show the simulation particles.
        this.transientParticles.addAll(this.transientParticlesBackup.slice());
        this.transientParticlesBackup.clear();

        // Update the state variable.
        this.playbackParticlesVisibleProperty.set(false);
      }
    } else if (this.isPlayback()) {
      // The playback particles should be showing and the simulation particles should be hidden.  Make sure that this
      // is the case.
      if (!this.playbackParticlesVisibleProperty.get()) {
        // Hide the simulation particles.  This is done by making a backup copy of them (so that they can be added
        // back later) and then removing them from the model.
        this.transientParticlesBackup.addAll(this.transientParticles);
        this.transientParticles.clear();

        // Note that we don't explicitly add the playback particles
        // here.  That is taken care of when the playback state is
        // set.  Here we only set the flag.
        this.playbackParticlesVisibleProperty.set(true);
      }

      // Trigger the event that lets the view know that the particles should be redrawn.
      this.particlesMoved.emit();
    }

    // else ignore the state, which is null during init and reset
  }

  /**
   * Get the state of this model.  This is generally used in support of the record-and-playback feature, and the
   * return value contains just enough state information to support this feature.
   * @returns {NeuronModelState}
   * @public
   */
  getState() {
    return new NeuronModelState(this);
  }

  /**
   * @returns {AxonMembrane}
   * @public
   */
  getAxonMembrane() {
    return this.axonMembrane;
  }

  /**
   * @returns {number}
   * @public
   */
  getSodiumInteriorConcentration() {
    if (this.isPlayback()) {
      return this.neuronModelPlaybackStateProperty.get().getSodiumInteriorConcentration();
    } else {
      return this.sodiumInteriorConcentration;
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getSodiumExteriorConcentration() {
    if (this.isPlayback()) {
      return this.neuronModelPlaybackStateProperty.get().getSodiumExteriorConcentration();
    } else {
      return this.sodiumExteriorConcentration;
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getPotassiumInteriorConcentration() {
    if (this.isPlayback()) {
      return this.neuronModelPlaybackStateProperty.get().getPotassiumInteriorConcentration();
    } else {
      return this.potassiumInteriorConcentration;
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getPotassiumExteriorConcentration() {
    if (this.isPlayback()) {
      return this.neuronModelPlaybackStateProperty.get().getPotassiumExteriorConcentration();
    } else {
      return this.potassiumExteriorConcentration;
    }
  }

  /**
   * Create a particle of the specified type and add it to the model.
   * @param {ParticleType.string} particleType
   * @returns {Particle}
   * @private
   */
  createBackgroundParticle(particleType) {
    const newParticle = ParticleFactory.createParticle(particleType);
    this.backgroundParticles.add(newParticle);
    newParticle.continueExistingProperty.lazyLink(newValue => {
      if (newValue === false) {
        this.backgroundParticles.remove(newParticle);
      }
    });
    return newParticle;
  }

  // @private
  removeAllParticles() {
    this.transientParticles.clear();
    this.backgroundParticles.clear();
  }

  /**
   * Add the provided channel at the specified rotational position. Positions are specified in terms of where on the
   * circle of the membrane they are, with a value of 0 being on the far right, PI/2 on the top, PI on the far left,
   * etc.
   * @param {MembraneChannelTypes} membraneChannelType
   * @param {number} angle
   * @private
   */
  addChannel(membraneChannelType, angle) {
    const membraneChannel = MembraneChannelFactory.createMembraneChannel(membraneChannelType, this, this.hodgkinHuxleyModel);
    const radius = this.axonMembrane.getCrossSectionDiameter() / 2;
    const newPosition = new Vector2(radius * Math.cos(angle), radius * Math.sin(angle));

    // Position the channel on the membrane.
    membraneChannel.setRotationalAngle(angle);
    membraneChannel.setCenterPosition(newPosition);

    // Add the channel and let everyone know it exists.
    this.membraneChannels.push(membraneChannel);
  }

  /**
   * Get a boolean value that indicates whether the initiation of a new stimulus (i.e. action potential) is currently
   * locked out.  This is done to prevent the situation where multiple action potentials are moving down the membrane
   * at the same time.
   * @returns {boolean}
   * @public
   */
  isStimulusInitiationLockedOut() {
    return this.stimulusLockoutProperty.get();
  }

  /**
   * @param {boolean} isVisible
   * @public
   */
  setPotentialChartVisible(isVisible) {
    this.potentialChartVisibleProperty.set(isVisible);
  }

  /**
   * @returns {boolean}
   * @public
   */
  isConcentrationReadoutVisible() {
    return this.concentrationReadoutVisibleProperty.get();
  }

  /**
   * @param {boolean} isVisible
   * @public
   */
  setConcentrationReadoutVisible(isVisible) {
    this.concentrationReadoutVisibleProperty.set(isVisible);
  }

  /**
   * @returns {boolean}
   * @public
   */
  isChargesShown() {
    return this.chargesShownProperty.get();
  }

  /**
   * @param {boolean} chargesShown
   * @public
   */
  setChargesShown(chargesShown) {
    this.chargesShownProperty.set(chargesShown);
  }

  /**
   * @returns {boolean}
   * @public
   */
  isPotentialChartVisible() {
    return this.potentialChartVisibleProperty.get();
  }

  /**
   * @param {boolean} lockout
   * @private
   */
  setStimulusLockout(lockout) {
    this.stimulusLockoutProperty.set(lockout);
    if (!lockout) {
      this.stimulusPulseInitiatedProperty.set(false);
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getMembranePotential() {
    if (this.isPlayback()) {
      return this.neuronModelPlaybackStateProperty.get().getMembranePotential();
    } else {
      return this.hodgkinHuxleyModel.getMembraneVoltage();
    }
  }

  /**
   * Set the playback state, which is the state that is presented to the user during playback.  The provided state
   * variable defines the state of the simulation that is being set.
   * @param {NeuronModelState} state
   * @public
   */
  setPlaybackState(state) {
    this.concentrationChangedProperty.set(false);

    // Set the membrane channel state.
    this.axonMembrane.setState(state.getAxonMembraneState());

    // Set the state of the Hodgkin-Huxley model.
    this.hodgkinHuxleyModel.setState(state.getHodgkinHuxleyModelState());

    // Set the states of the membrane channels.
    this.membraneChannels.forEach(membraneChannel => {
      const mcs = state.getMembraneChannelStateMap().get(membraneChannel);
      // Error handling.
      if (mcs === null) {
        assert && assert(false, ' NeuronModel  Error: No state found for membrane channel.');
        return;
      }
      // Restore the state.
      membraneChannel.setState(mcs);
    });

    // Set the state of the playback particles.  This maps the particle mementos in to the playback particles so that
    // we don't have to delete and add back a bunch of particles at each step.
    const additionalPlaybackParticlesNeeded = state.getPlaybackParticleMementos().length - this.playbackParticles.length;
    if (additionalPlaybackParticlesNeeded > 0) {
      _.times(additionalPlaybackParticlesNeeded, () => {
        const newPlaybackParticle = new PlaybackParticle();
        this.playbackParticles.push(newPlaybackParticle);
      });
    } else if (additionalPlaybackParticlesNeeded < 0) {
      _.times(Math.abs(additionalPlaybackParticlesNeeded), () => {
        this.playbackParticles.pop(); // remove the last item
      });
    }

    // Set playback particle states from the mementos.
    let playbackParticleIndex = 0;
    const mementos = state.getPlaybackParticleMementos();
    mementos.forEach(memento => {
      this.playbackParticles.get(playbackParticleIndex).restoreFromMemento(memento);
      playbackParticleIndex++;
    });
    this.neuronModelPlaybackStateProperty.set(state);
    this.membranePotentialProperty.set(state.getMembranePotential());

    // For the sake of simplicity, always send out notifications for the concentration changes.
    this.concentrationChangedProperty.set(true);

    // If any one channel's state is changed, emit a channel representation changed event
    const channelStateChanged = membraneChannel => membraneChannel.channelStateChangedProperty.get();
    if (_.some(this.membraneChannels, channelStateChanged)) {
      this.channelRepresentationChanged.emit();
    }
  }
}
neuron.register('NeuronModel', NeuronModel);
export default NeuronModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiUHJvcGVydHkiLCJkb3RSYW5kb20iLCJWZWN0b3IyIiwibmV1cm9uIiwiTWF0aFV0aWxzIiwiTmV1cm9uQ29uc3RhbnRzIiwiUmVjb3JkQW5kUGxheWJhY2tNb2RlbCIsIkF4b25NZW1icmFuZSIsIk1lbWJyYW5lQ2hhbm5lbEZhY3RvcnkiLCJNZW1icmFuZUNoYW5uZWxUeXBlcyIsIk1lbWJyYW5lQ3Jvc3NpbmdEaXJlY3Rpb24iLCJNb2RpZmllZEhvZGdraW5IdXhsZXlNb2RlbCIsIk5ldXJvbk1vZGVsU3RhdGUiLCJQYXJ0aWNsZUZhY3RvcnkiLCJQYXJ0aWNsZVBvc2l0aW9uIiwiUGFydGljbGVUeXBlIiwiUGxheWJhY2tQYXJ0aWNsZSIsIlNsb3dCcm93bmlhbk1vdGlvblN0cmF0ZWd5IiwiU29kaXVtRHVhbEdhdGVkQ2hhbm5lbCIsIlRpbWVkRmFkZUluU3RyYXRlZ3kiLCJERUZBVUxUX0ZPUl9TSE9XX0FMTF9JT05TIiwiREVGQVVMVF9GT1JfTUVNQlJBTkVfQ0hBUlRfVklTSUJJTElUWSIsIkRFRkFVTFRfRk9SX0NIQVJHRVNfU0hPV04iLCJERUZBVUxUX0ZPUl9DT05DRU5UUkFUSU9OX1JFQURPVVRfU0hPV04iLCJOVU1fR0FURURfU09ESVVNX0NIQU5ORUxTIiwiTlVNX0dBVEVEX1BPVEFTU0lVTV9DSEFOTkVMUyIsIk5VTV9TT0RJVU1fTEVBS19DSEFOTkVMUyIsIk5VTV9QT1RBU1NJVU1fTEVBS19DSEFOTkVMUyIsIk5PTUlOQUxfU09ESVVNX0VYVEVSSU9SX0NPTkNFTlRSQVRJT04iLCJOT01JTkFMX1NPRElVTV9JTlRFUklPUl9DT05DRU5UUkFUSU9OIiwiTk9NSU5BTF9QT1RBU1NJVU1fRVhURVJJT1JfQ09OQ0VOVFJBVElPTiIsIk5PTUlOQUxfUE9UQVNTSVVNX0lOVEVSSU9SX0NPTkNFTlRSQVRJT04iLCJOVU1fU09ESVVNX0lPTlNfT1VUU0lERV9DRUxMIiwiTlVNX1NPRElVTV9JT05TX0lOU0lERV9DRUxMIiwiTlVNX1BPVEFTU0lVTV9JT05TX09VVFNJREVfQ0VMTCIsIk5VTV9QT1RBU1NJVU1fSU9OU19JTlNJREVfQ0VMTCIsIkNPTkNFTlRSQVRJT05fUkVBRE9VVF9ERUxBWSIsIlBPVEFTU0lVTV9DVVJSRU5UX1RIUkVTSF9GT1JfQUNUSU9OX1BPVEVOVElBTCIsIlNPRElVTV9DVVJSRU5UX1RIUkVTSF9GT1JfQUNUSU9OX1BPVEVOVElBTCIsIkxFQUtBR0VfQ1VSUkVOVF9USFJFU0hfRk9SX0FDVElPTl9QT1RFTlRJQUwiLCJJTlRFUklPUl9DT05DRU5UUkFUSU9OX0NIQU5HRV9SQVRFX1NPRElVTSIsIkVYVEVSSU9SX0NPTkNFTlRSQVRJT05fQ0hBTkdFX1JBVEVfU09ESVVNIiwiSU5URVJJT1JfQ09OQ0VOVFJBVElPTl9DSEFOR0VfUkFURV9QT1RBU1NJVU0iLCJFWFRFUklPUl9DT05DRU5UUkFUSU9OX0NIQU5HRV9SQVRFX1BPVEFTU0lVTSIsIkNPTkNFTlRSQVRJT05fRElGRl9USFJFU0hPTEQiLCJDT05DRU5UUkFUSU9OX1JFU1RPUkFUSU9OX0ZBQ1RPUiIsIk1FTUJSQU5FX1BPVEVOVElBTF9DSEFOR0VfVEhSRVNIT0xEIiwiRk9SRUdST1VORF9QQVJUSUNMRV9ERUZBVUxUX09QQUNJVFkiLCJCQUNLR1JPVU5EX1BBUlRJQ0xFX0RFRkFVTFRfT1BBQ0lUWSIsIk5ldXJvbk1vZGVsIiwiY29uc3RydWN0b3IiLCJtYXhSZWNvcmRQb2ludHMiLCJNYXRoIiwiY2VpbCIsIlRJTUVfU1BBTiIsIk1JTl9BQ1RJT05fUE9URU5USUFMX0NMT0NLX0RUIiwiYXhvbk1lbWJyYW5lIiwiY2hhbm5lbFJlcHJlc2VudGF0aW9uQ2hhbmdlZCIsInBhcnRpY2xlc01vdmVkIiwidHJhbnNpZW50UGFydGljbGVzIiwidHJhbnNpZW50UGFydGljbGVzQmFja3VwIiwiYmFja2dyb3VuZFBhcnRpY2xlcyIsInBsYXliYWNrUGFydGljbGVzIiwibWVtYnJhbmVDaGFubmVscyIsImhvZGdraW5IdXhsZXlNb2RlbCIsImNyb3NzU2VjdGlvbklubmVyUmFkaXVzIiwiZ2V0Q3Jvc3NTZWN0aW9uRGlhbWV0ZXIiLCJnZXRNZW1icmFuZVRoaWNrbmVzcyIsImNyb3NzU2VjdGlvbk91dGVyUmFkaXVzIiwic29kaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uIiwic29kaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uIiwicG90YXNzaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uIiwicG90YXNzaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uIiwicG90ZW50aWFsQ2hhcnRWaXNpYmxlUHJvcGVydHkiLCJjaGFyZ2VzU2hvd25Qcm9wZXJ0eSIsImNvbmNlbnRyYXRpb25SZWFkb3V0VmlzaWJsZVByb3BlcnR5IiwibWVtYnJhbmVQb3RlbnRpYWxQcm9wZXJ0eSIsInN0aW11bHVzTG9ja291dFByb3BlcnR5IiwiYWxsSW9uc1NpbXVsYXRlZFByb3BlcnR5IiwicGxheWJhY2tQYXJ0aWNsZXNWaXNpYmxlUHJvcGVydHkiLCJjb25jZW50cmF0aW9uQ2hhbmdlZFByb3BlcnR5Iiwic3RpbXVsdXNQdWxzZUluaXRpYXRlZFByb3BlcnR5IiwibmV1cm9uTW9kZWxQbGF5YmFja1N0YXRlUHJvcGVydHkiLCJhdExlYXN0T25lUGFydGljbGVQcmVzZW50UHJvcGVydHkiLCJ0cmF2ZWxpbmdBY3Rpb25Qb3RlbnRpYWxSZWFjaGVkQ3Jvc3NTZWN0aW9uIiwiYWRkTGlzdGVuZXIiLCJzdGltdWxhdGUiLCJ3aW5kb3ciLCJwaGV0IiwicHJvZmlsZXIiLCJzZXR0aW5nIiwic3RhcnREYXRhQW5hbHlzaXMiLCJsYXp5TGluayIsImFsbElvbnNTaW11bGF0ZWQiLCJhc3NlcnQiLCJpc1N0aW11bHVzSW5pdGlhdGlvbkxvY2tlZE91dCIsImFkZEluaXRpYWxCdWxrUGFydGljbGVzIiwiY2xlYXIiLCJzZXQiLCJsZW5ndGgiLCJhbmdsZSIsIlBJIiwidG90YWxOdW1DaGFubmVscyIsImFuZ2xlSW5jcmVtZW50IiwiZ2F0ZWRTb2RpdW1DaGFubmVsc0FkZGVkIiwiZ2F0ZWRQb3Rhc3NpdW1DaGFubmVsc0FkZGVkIiwic29kaXVtTGVha0NoYW5uZWxzQWRkZWQiLCJwb3Rhc3NpdW1MZWFrQ2hhbm5lbHNBZGRlZCIsImFkZENoYW5uZWwiLCJTT0RJVU1fTEVBS0FHRV9DSEFOTkVMIiwiUE9UQVNTSVVNX0dBVEVEX0NIQU5ORUwiLCJTT0RJVU1fR0FURURfQ0hBTk5FTCIsIlBPVEFTU0lVTV9MRUFLQUdFX0NIQU5ORUwiLCJpIiwiZ2F0ZWRTb2RpdW1VcmdlbmN5IiwiZ2F0ZWRQb3Rhc3NpdW1VcmdlbmN5IiwicG90YXNzaXVtTGVha1VyZ2VuY3kiLCJzb2RpdW1MZWFrVXJnZW5jeSIsImNoYW5uZWxUeXBlVG9BZGQiLCJ0aW1lUHJvcGVydHkiLCJsaW5rIiwidXBkYXRlUmVjb3JkUGxheUJhY2siLCJiaW5kIiwibW9kZVByb3BlcnR5IiwicmVzZXQiLCJzdGVwIiwiZHQiLCJzZXRQbGF5YmFjayIsImdldFRpbWUiLCJnZXRNYXhSZWNvcmRlZFRpbWUiLCJzZXRUaW1lIiwiaXNQbGF5YmFjayIsInNldE1vZGVSZWNvcmQiLCJzZXRQbGF5aW5nIiwic3RlcEluVGltZSIsImFicyIsImdldCIsImdldE1lbWJyYW5lVm9sdGFnZSIsInVwZGF0ZVN0aW11bHVzTG9ja291dFN0YXRlIiwiZm9yRWFjaCIsImNoYW5uZWwiLCJwYXJ0aWNsZSIsImNvbmNlbnRyYXRpb25DaGFuZ2VkIiwiZGlmZmVyZW5jZSIsInBvdGFzc2l1bUNvbmR1Y3RhbmNlIiwiZ2V0X2RlbGF5ZWRfbjQiLCJzb2RpdW1Db25kdWN0YW5jZSIsImdldF9kZWxheWVkX20zaCIsImdldF9tM2giLCJlbWl0IiwiY2hhbm5lbFN0YXRlQ2hhbmdlZCIsIm1lbWJyYW5lQ2hhbm5lbCIsImNoYW5uZWxTdGF0ZUNoYW5nZWRQcm9wZXJ0eSIsIl8iLCJzb21lIiwiZ2V0U3RhdGUiLCJ1cGRhdGVTaW1BbmRQbGF5YmFja1BhcnRpY2xlVmlzaWJpbGl0eSIsInJlc2V0QWxsIiwicmVtb3ZlQWxsUGFydGljbGVzIiwic2V0U3RpbXVsdXNMb2Nrb3V0Iiwic2V0UG90ZW50aWFsQ2hhcnRWaXNpYmxlIiwic2V0Q29uY2VudHJhdGlvblJlYWRvdXRWaXNpYmxlIiwic2V0Q2hhcmdlc1Nob3duIiwic2V0QWxsSW9uc1NpbXVsYXRlZCIsImNsZWFySGlzdG9yeSIsInNldE1vZGVMaXZlIiwicmVxdWVzdFBhcnRpY2xlVGhyb3VnaENoYW5uZWwiLCJwYXJ0aWNsZVR5cGUiLCJtYXhWZWxvY2l0eSIsImRpcmVjdGlvbiIsImNhcHR1cmVab25lIiwiSU5fVE9fT1VUIiwiZ2V0SW50ZXJpb3JDYXB0dXJlWm9uZSIsImdldEV4dGVyaW9yQ2FwdHVyZVpvbmUiLCJwYXJ0aWNsZVRvQ2FwdHVyZSIsImNyZWF0ZVRyYW5zaWVudFBhcnRpY2xlIiwic2V0RmFkZVN0cmF0ZWd5IiwibW92ZVBhcnRpY2xlVGhyb3VnaE5ldXJvbk1lbWJyYW5lIiwiaXNBbGxJb25zU2ltdWxhdGVkIiwicHJlRXhpc3RpbmdQYXJ0aWNsZXMiLCJjbG9uZSIsImFkZEJhY2tncm91bmRQYXJ0aWNsZXMiLCJTT0RJVU1fSU9OIiwiSU5TSURFX01FTUJSQU5FIiwiT1VUU0lERV9NRU1CUkFORSIsIlBPVEFTU0lVTV9JT04iLCJudW1QYXJ0aWNsZXNJblpvbmUiLCJzY2FuQ2FwdHVyZVpvbmVGb3JGcmVlUGFydGljbGVzIiwiYWRkQmFja2dyb3VuZFBhcnRpY2xlc1RvWm9uZSIsImZsb29yIiwibmV4dERvdWJsZSIsImJhY2tncm91bmRQYXJ0aWNsZSIsImluZGV4T2YiLCJzZXRNb3Rpb25TdHJhdGVneSIsImdldFBvc2l0aW9uWCIsImdldFBvc2l0aW9uWSIsIm5ld1BhcnRpY2xlIiwiY3JlYXRlUGFydGljbGUiLCJhZGQiLCJhc3NpZ25OZXdQYXJ0aWNsZVBvc2l0aW9uIiwiY29udGludWVFeGlzdGluZ1Byb3BlcnR5IiwibmV3VmFsdWUiLCJyZW1vdmUiLCJwb3NpdGlvbiIsIm51bWJlclRvQWRkIiwidGltZXMiLCJ2YWx1ZSIsImNyZWF0ZUJhY2tncm91bmRQYXJ0aWNsZSIsInBvc2l0aW9uUGFydGljbGVJbnNpZGVNZW1icmFuZSIsInBvc2l0aW9uUGFydGljbGVPdXRzaWRlTWVtYnJhbmUiLCJzZXRPcGFjaXR5IiwiaW5pdGlhdGVTdGltdWx1c1B1bHNlIiwiaW5pdGlhdGVUcmF2ZWxpbmdBY3Rpb25Qb3RlbnRpYWwiLCJtdWx0aXBsaWVyIiwibWF4IiwiZGlzdGFuY2UiLCJnZXRSYWRpdXMiLCJzZXRQb3NpdGlvbiIsImNvcyIsInNpbiIsImlzQWN0aW9uUG90ZW50aWFsSW5Qcm9ncmVzcyIsImdldFRyYXZlbGluZ0FjdGlvblBvdGVudGlhbCIsImdldF9rX2N1cnJlbnQiLCJnZXRfbmFfY3VycmVudCIsImdldF9sX2N1cnJlbnQiLCJ6b25lIiwiY2xvc2VzdEZyZWVQYXJ0aWNsZSIsImRpc3RhbmNlT2ZDbG9zZXN0UGFydGljbGUiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsInRvdGFsTnVtYmVyT2ZQYXJ0aWNsZXMiLCJjYXB0dXJlWm9uZU9yaWdpbiIsImdldE9yaWdpblBvaW50IiwiZ2V0VHlwZSIsImlzQXZhaWxhYmxlRm9yQ2FwdHVyZSIsImlzUG9pbnRJblpvbmUiLCJkaXN0YW5jZUJldHdlZW4iLCJ4IiwieSIsImJhY2t3YXJkcyIsImlzUmVjb3JkIiwiaXNMaXZlIiwiYWRkQWxsIiwic2xpY2UiLCJnZXRBeG9uTWVtYnJhbmUiLCJnZXRTb2RpdW1JbnRlcmlvckNvbmNlbnRyYXRpb24iLCJnZXRTb2RpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24iLCJnZXRQb3Rhc3NpdW1JbnRlcmlvckNvbmNlbnRyYXRpb24iLCJnZXRQb3Rhc3NpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24iLCJtZW1icmFuZUNoYW5uZWxUeXBlIiwiY3JlYXRlTWVtYnJhbmVDaGFubmVsIiwicmFkaXVzIiwibmV3UG9zaXRpb24iLCJzZXRSb3RhdGlvbmFsQW5nbGUiLCJzZXRDZW50ZXJQb3NpdGlvbiIsInB1c2giLCJpc1Zpc2libGUiLCJpc0NvbmNlbnRyYXRpb25SZWFkb3V0VmlzaWJsZSIsImlzQ2hhcmdlc1Nob3duIiwiY2hhcmdlc1Nob3duIiwiaXNQb3RlbnRpYWxDaGFydFZpc2libGUiLCJsb2Nrb3V0IiwiZ2V0TWVtYnJhbmVQb3RlbnRpYWwiLCJzZXRQbGF5YmFja1N0YXRlIiwic3RhdGUiLCJzZXRTdGF0ZSIsImdldEF4b25NZW1icmFuZVN0YXRlIiwiZ2V0SG9kZ2tpbkh1eGxleU1vZGVsU3RhdGUiLCJtY3MiLCJnZXRNZW1icmFuZUNoYW5uZWxTdGF0ZU1hcCIsImFkZGl0aW9uYWxQbGF5YmFja1BhcnRpY2xlc05lZWRlZCIsImdldFBsYXliYWNrUGFydGljbGVNZW1lbnRvcyIsIm5ld1BsYXliYWNrUGFydGljbGUiLCJwb3AiLCJwbGF5YmFja1BhcnRpY2xlSW5kZXgiLCJtZW1lbnRvcyIsIm1lbWVudG8iLCJyZXN0b3JlRnJvbU1lbWVudG8iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5ldXJvbk1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSAnTmV1cm9uJyBzY3JlZW4uIFRoaXMgY2xhc3MgcmVwcmVzZW50cyB0aGUgbWFpbiBjbGFzcyBmb3IgbW9kZWxpbmcgdGhlIGF4b24uICBJdCBhY3RzIGFzIHRoZSBjZW50cmFsXHJcbiAqIHBsYWNlIHdoZXJlIHRoZSBpbnRlcmFjdGlvbiBiZXR3ZWVuIHRoZSBtZW1icmFuZSwgdGhlIHBhcnRpY2xlcyAoaS5lLiBpb25zKSwgYW5kIHRoZSBnYXRlcyBpcyBhbGwgZ292ZXJuZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZiAoZm9yIEdoZW50IFVuaXZlcnNpdHkpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcbmltcG9ydCBNYXRoVXRpbHMgZnJvbSAnLi4vY29tbW9uL01hdGhVdGlscy5qcyc7XHJcbmltcG9ydCBOZXVyb25Db25zdGFudHMgZnJvbSAnLi4vY29tbW9uL05ldXJvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBSZWNvcmRBbmRQbGF5YmFja01vZGVsIGZyb20gJy4uL3JlY29yZGFuZHBsYXliYWNrL1JlY29yZEFuZFBsYXliYWNrTW9kZWwuanMnO1xyXG5pbXBvcnQgQXhvbk1lbWJyYW5lIGZyb20gJy4vQXhvbk1lbWJyYW5lLmpzJztcclxuaW1wb3J0IE1lbWJyYW5lQ2hhbm5lbEZhY3RvcnkgZnJvbSAnLi9NZW1icmFuZUNoYW5uZWxGYWN0b3J5LmpzJztcclxuaW1wb3J0IE1lbWJyYW5lQ2hhbm5lbFR5cGVzIGZyb20gJy4vTWVtYnJhbmVDaGFubmVsVHlwZXMuanMnO1xyXG5pbXBvcnQgTWVtYnJhbmVDcm9zc2luZ0RpcmVjdGlvbiBmcm9tICcuL01lbWJyYW5lQ3Jvc3NpbmdEaXJlY3Rpb24uanMnO1xyXG5pbXBvcnQgTW9kaWZpZWRIb2Rna2luSHV4bGV5TW9kZWwgZnJvbSAnLi9Nb2RpZmllZEhvZGdraW5IdXhsZXlNb2RlbC5qcyc7XHJcbmltcG9ydCBOZXVyb25Nb2RlbFN0YXRlIGZyb20gJy4vTmV1cm9uTW9kZWxTdGF0ZS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZUZhY3RvcnkgZnJvbSAnLi9QYXJ0aWNsZUZhY3RvcnkuanMnO1xyXG5pbXBvcnQgUGFydGljbGVQb3NpdGlvbiBmcm9tICcuL1BhcnRpY2xlUG9zaXRpb24uanMnO1xyXG5pbXBvcnQgUGFydGljbGVUeXBlIGZyb20gJy4vUGFydGljbGVUeXBlLmpzJztcclxuaW1wb3J0IFBsYXliYWNrUGFydGljbGUgZnJvbSAnLi9QbGF5YmFja1BhcnRpY2xlLmpzJztcclxuaW1wb3J0IFNsb3dCcm93bmlhbk1vdGlvblN0cmF0ZWd5IGZyb20gJy4vU2xvd0Jyb3duaWFuTW90aW9uU3RyYXRlZ3kuanMnO1xyXG5pbXBvcnQgU29kaXVtRHVhbEdhdGVkQ2hhbm5lbCBmcm9tICcuL1NvZGl1bUR1YWxHYXRlZENoYW5uZWwuanMnO1xyXG5pbXBvcnQgVGltZWRGYWRlSW5TdHJhdGVneSBmcm9tICcuL1RpbWVkRmFkZUluU3RyYXRlZ3kuanMnO1xyXG5cclxuLy8gZGVmYXVsdCBjb25maWd1cmF0aW9uIHZhbHVlc1xyXG5jb25zdCBERUZBVUxUX0ZPUl9TSE9XX0FMTF9JT05TID0gdHJ1ZTtcclxuY29uc3QgREVGQVVMVF9GT1JfTUVNQlJBTkVfQ0hBUlRfVklTSUJJTElUWSA9IGZhbHNlO1xyXG5jb25zdCBERUZBVUxUX0ZPUl9DSEFSR0VTX1NIT1dOID0gZmFsc2U7XHJcbmNvbnN0IERFRkFVTFRfRk9SX0NPTkNFTlRSQVRJT05fUkVBRE9VVF9TSE9XTiA9IGZhbHNlO1xyXG5cclxuLy8gbnVtYmVycyBvZiB0aGUgdmFyaW91cyB0eXBlcyBvZiBjaGFubmVscyB0aGF0IGFyZSBwcmVzZW50IG9uIHRoZSBtZW1icmFuZVxyXG5jb25zdCBOVU1fR0FURURfU09ESVVNX0NIQU5ORUxTID0gMjA7XHJcbmNvbnN0IE5VTV9HQVRFRF9QT1RBU1NJVU1fQ0hBTk5FTFMgPSAyMDtcclxuY29uc3QgTlVNX1NPRElVTV9MRUFLX0NIQU5ORUxTID0gMztcclxuY29uc3QgTlVNX1BPVEFTU0lVTV9MRUFLX0NIQU5ORUxTID0gNztcclxuXHJcbi8vIG5vbWluYWwgY29uY2VudHJhdGlvbiB2YWx1ZXNcclxuY29uc3QgTk9NSU5BTF9TT0RJVU1fRVhURVJJT1JfQ09OQ0VOVFJBVElPTiA9IDE0NTsgICAgIC8vIEluIG1pbGxpbW9sYXIgKG1NKVxyXG5jb25zdCBOT01JTkFMX1NPRElVTV9JTlRFUklPUl9DT05DRU5UUkFUSU9OID0gMTA7ICAgICAgLy8gSW4gbWlsbGltb2xhciAobU0pXHJcbmNvbnN0IE5PTUlOQUxfUE9UQVNTSVVNX0VYVEVSSU9SX0NPTkNFTlRSQVRJT04gPSA0OyAgICAvLyBJbiBtaWxsaW1vbGFyIChtTSlcclxuY29uc3QgTk9NSU5BTF9QT1RBU1NJVU1fSU5URVJJT1JfQ09OQ0VOVFJBVElPTiA9IDE0MDsgIC8vIEluIG1pbGxpbW9sYXIgKG1NKVxyXG5cclxuLy8gbnVtYmVycyBvZiBcImJ1bGtcIiBpb25zIGluIGFuZCBvdXQgb2YgdGhlIGNlbGwgd2hlbiB2aXNpYmxlXHJcbmNvbnN0IE5VTV9TT0RJVU1fSU9OU19PVVRTSURFX0NFTEwgPSA0NTA7XHJcbmNvbnN0IE5VTV9TT0RJVU1fSU9OU19JTlNJREVfQ0VMTCA9IDY7XHJcbmNvbnN0IE5VTV9QT1RBU1NJVU1fSU9OU19PVVRTSURFX0NFTEwgPSA0NTtcclxuY29uc3QgTlVNX1BPVEFTU0lVTV9JT05TX0lOU0lERV9DRUxMID0gMTUwO1xyXG5cclxuLy8gRGVmaW5lIHRoZSBhbW91bnQgb2YgZGVsYXkgYmV0d2VlbiB0aGUgdmFsdWVzIGNoYW5naW5nIGluIHRoZSBISCBtb2RlbCB1bnRpbCB0aGUgY29uY2VudHJhdGlvbiByZWFkb3V0cyBhcmVcclxuLy8gdXBkYXRlZC4gIFRoaXMgaXMgbmVlZGVkIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBjb25jZW50cmF0aW9uIHJlYWRvdXRzIGRvbid0IGNoYW5nZSBiZWZvcmUgdmlzaWJsZSBwb3Rhc3NpdW0gb3JcclxuLy8gc29kaXVtIGlvbnMgaGF2ZSBjcm9zc2VkIHRoZSBtZW1icmFuZS5cclxuY29uc3QgQ09OQ0VOVFJBVElPTl9SRUFET1VUX0RFTEFZID0gMC4wMDA1OyAgLy8gaW4gc2Vjb25kcyBvZiBzaW0gdGltZVxyXG5cclxuLy8gRGVmaW5lIHRoZSB0aHJlc2hvbGRzIGZvciBkZXRlcm1pbmluZyB3aGV0aGVyIGFuIGFjdGlvbiBwb3RlbnRpYWwgc2hvdWxkIGJlIGNvbnNpZGVyZWQgdG8gYmUgaW4gcHJvZ3Jlc3MuICBUaGVzZVxyXG4vLyB2YWx1ZXMgcmVsYXRlIHRvIHRoZSByYXRlIG9mIGZsb3cgdGhyb3VnaCB0aGUgZ2F0ZWQgc29kaXVtLCBnYXRlZCBwb3Rhc3NpdW0sIGFuZCBjb21iaW5hdGlvbiBvZiB0aGUgc29kaXVtIGFuZFxyXG4vLyBwb3Rhc3NpdW0gbGVha2FnZS4gSWYgdGhlIHZhbHVlcyBmcm9tIHRoZSBISCBtb2RlbCBleGNlZWQgYW55IG9mIHRoZXNlLCBhbmQgYWN0aW9uIHBvdGVudGlhbCBpcyBjb25zaWRlcmVkIHRvIGJlIGluXHJcbi8vIHByb2dyZXNzLiBUaGUgdmFsdWVzIHdlcmUgZGV0ZXJtaW5lZCBlbXBpcmljYWxseSwgYW5kIGRpZmZlcmVudCBISCBtb2RlbHMgbWF5IHJlcXVpcmUgZGlmZmVyZW50IHZhbHVlcyBoZXJlLlxyXG5jb25zdCBQT1RBU1NJVU1fQ1VSUkVOVF9USFJFU0hfRk9SX0FDVElPTl9QT1RFTlRJQUwgPSAwLjAwMTtcclxuY29uc3QgU09ESVVNX0NVUlJFTlRfVEhSRVNIX0ZPUl9BQ1RJT05fUE9URU5USUFMID0gMC4wMDE7XHJcbmNvbnN0IExFQUtBR0VfQ1VSUkVOVF9USFJFU0hfRk9SX0FDVElPTl9QT1RFTlRJQUwgPSAwLjQ0NDtcclxuXHJcbi8vIERlZmluZSB0aGUgcmF0ZXMgYXQgd2hpY2ggY29uY2VudHJhdGlvbiBjaGFuZ2VzIGR1cmluZyBhY3Rpb24gcG90ZW50aWFsLiAgVGhlc2UgdmFsdWVzIGNvbWJpbmVkIHdpdGggdGhlXHJcbi8vIGNvbmR1Y3RhbmNlIGF0IGVhY2ggdGltZSBzdGVwIGFyZSB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgY29uY2VudHJhdGlvbiBjaGFuZ2VzLlxyXG5jb25zdCBJTlRFUklPUl9DT05DRU5UUkFUSU9OX0NIQU5HRV9SQVRFX1NPRElVTSA9IDAuNDtcclxuY29uc3QgRVhURVJJT1JfQ09OQ0VOVFJBVElPTl9DSEFOR0VfUkFURV9TT0RJVU0gPSA3O1xyXG5jb25zdCBJTlRFUklPUl9DT05DRU5UUkFUSU9OX0NIQU5HRV9SQVRFX1BPVEFTU0lVTSA9IDIuMDtcclxuY29uc3QgRVhURVJJT1JfQ09OQ0VOVFJBVElPTl9DSEFOR0VfUkFURV9QT1RBU1NJVU0gPSAwLjA1O1xyXG5cclxuLy8gdGhyZXNob2xkIG9mIHNpZ25pZmljYW50IGRpZmZlcmVuY2UgZm9yIGNvbmNlbnRyYXRpb24gdmFsdWVzXHJcbmNvbnN0IENPTkNFTlRSQVRJT05fRElGRl9USFJFU0hPTEQgPSAwLjAwMDAwMTtcclxuXHJcbi8vIERlZmluZSB0aGUgcmF0ZSBhdCB3aGljaCBjb25jZW50cmF0aW9uIGlzIHJlc3RvcmVkIHRvIG5vbWluYWwgdmFsdWUuICBIaWdoZXIgdmFsdWUgbWVhbnMgcXVpY2tlciByZXN0b3JhdGlvbi5cclxuY29uc3QgQ09OQ0VOVFJBVElPTl9SRVNUT1JBVElPTl9GQUNUT1IgPSAxMDAwO1xyXG5cclxuLy8gdmFsdWUgdGhhdCBjb250cm9scyBob3cgbXVjaCBvZiBhIGNoYW5nZSBvZiB0aGUgbWVtYnJhbmUgcG90ZW50aWFsIG11c3Qgb2NjdXIgYmVmb3JlIGEgbm90aWZpY2F0aW9uIGlzIHNlbnQgb3V0XHJcbmNvbnN0IE1FTUJSQU5FX1BPVEVOVElBTF9DSEFOR0VfVEhSRVNIT0xEID0gMC4wMDU7XHJcblxyXG4vLyBkZWZhdWx0IHZhbHVlcyBvZiBvcGFjaXR5IGZvciBuZXdseSBjcmVhdGVkIHBhcnRpY2xlc1xyXG5jb25zdCBGT1JFR1JPVU5EX1BBUlRJQ0xFX0RFRkFVTFRfT1BBQ0lUWSA9IDAuMjU7XHJcbmNvbnN0IEJBQ0tHUk9VTkRfUEFSVElDTEVfREVGQVVMVF9PUEFDSVRZID0gMC4xMDsgLy8gZGVmYXVsdCBhbHBoYSBpbiBKYXZhIHdhcyAwLjA1LCB3aGljaCBpc24ndCB2aXNpYmxlIGluIHRoZSBjYW52YXMgc28gc2xpZ2h0bHkgaW5jcmVhc2luZyB0byAwLjEwXHJcblxyXG5jbGFzcyBOZXVyb25Nb2RlbCBleHRlbmRzIFJlY29yZEFuZFBsYXliYWNrTW9kZWwge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBjb25zdCBtYXhSZWNvcmRQb2ludHMgPSBNYXRoLmNlaWwoIE5ldXJvbkNvbnN0YW50cy5USU1FX1NQQU4gKiAxMDAwIC8gTmV1cm9uQ29uc3RhbnRzLk1JTl9BQ1RJT05fUE9URU5USUFMX0NMT0NLX0RUICk7XHJcbiAgICBzdXBlciggbWF4UmVjb3JkUG9pbnRzICk7XHJcblxyXG4gICAgdGhpcy5heG9uTWVtYnJhbmUgPSBuZXcgQXhvbk1lbWJyYW5lKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGV2ZW50cyBlbWl0dGVkIGJ5IHRoaXMgbW9kZWxcclxuICAgIHRoaXMuY2hhbm5lbFJlcHJlc2VudGF0aW9uQ2hhbmdlZCA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLnBhcnRpY2xlc01vdmVkID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljLCByZWFkLW9ubHkgLSBsaXN0IG9mIHRoZSBwYXJ0aWNsZXMgdGhhdCBjb21lIGFuZCBnbyB3aGVuIHRoZSBzaW11bGF0aW9uIGlzIHdvcmtpbmcgaW4gcmVhbCB0aW1lXHJcbiAgICB0aGlzLnRyYW5zaWVudFBhcnRpY2xlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gYmFja3VwIG9mIHRoZSB0cmFuc2llbnQgcGFydGljbGVzLCB1c2VkIHRvIHJlc3RvcmUgdGhlbSB3aGVuIHJldHVybmluZyB0byBsaXZlIG1vZGUgYWZ0ZXIgZG9pbmcgcGxheWJhY2tcclxuICAgIHRoaXMudHJhbnNpZW50UGFydGljbGVzQmFja3VwID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYywgcmVhZC1vbmx5IC0gcGFydGljbGVzIHRoYXQgYXJlIFwiaW4gdGhlIGJhY2tncm91bmRcIiwgbWVhbmluZyB0aGF0IHRoZXkgYXJlIGFsd2F5cyBwcmVzZW50IGFuZCB0aGV5IGRvbid0XHJcbiAgICAvLyBjcm9zcyB0aGUgbWVtYnJhbmVcclxuICAgIHRoaXMuYmFja2dyb3VuZFBhcnRpY2xlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMsIHJlYWQtb25seSAtIGxpc3Qgb2YgcGFydGljbGVzIHRoYXQgYXJlIHNob3duIGR1cmluZyBwbGF5YmFja1xyXG4gICAgdGhpcy5wbGF5YmFja1BhcnRpY2xlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIHRoaXMubWVtYnJhbmVDaGFubmVscyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpOyAvLyBAcHVibGljLCByZWFkLW9ubHlcclxuICAgIHRoaXMuaG9kZ2tpbkh1eGxleU1vZGVsID0gbmV3IE1vZGlmaWVkSG9kZ2tpbkh1eGxleU1vZGVsKCk7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBAcHVibGljLCByZWFkLW9ubHkgLSB2YXJpb3VzIG1vZGVsIHZhbHVlc1xyXG4gICAgdGhpcy5jcm9zc1NlY3Rpb25Jbm5lclJhZGl1cyA9ICggdGhpcy5heG9uTWVtYnJhbmUuZ2V0Q3Jvc3NTZWN0aW9uRGlhbWV0ZXIoKSAtIHRoaXMuYXhvbk1lbWJyYW5lLmdldE1lbWJyYW5lVGhpY2tuZXNzKCkgKSAvIDI7XHJcbiAgICB0aGlzLmNyb3NzU2VjdGlvbk91dGVyUmFkaXVzID0gKCB0aGlzLmF4b25NZW1icmFuZS5nZXRDcm9zc1NlY3Rpb25EaWFtZXRlcigpICsgdGhpcy5heG9uTWVtYnJhbmUuZ2V0TWVtYnJhbmVUaGlja25lc3MoKSApIC8gMjtcclxuICAgIHRoaXMuc29kaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uID0gTk9NSU5BTF9TT0RJVU1fSU5URVJJT1JfQ09OQ0VOVFJBVElPTjtcclxuICAgIHRoaXMuc29kaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uID0gTk9NSU5BTF9TT0RJVU1fRVhURVJJT1JfQ09OQ0VOVFJBVElPTjtcclxuICAgIHRoaXMucG90YXNzaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uID0gTk9NSU5BTF9QT1RBU1NJVU1fSU5URVJJT1JfQ09OQ0VOVFJBVElPTjtcclxuICAgIHRoaXMucG90YXNzaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uID0gTk9NSU5BTF9QT1RBU1NJVU1fRVhURVJJT1JfQ09OQ0VOVFJBVElPTjtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnBvdGVudGlhbENoYXJ0VmlzaWJsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBERUZBVUxUX0ZPUl9NRU1CUkFORV9DSEFSVF9WSVNJQklMSVRZICk7IC8vIEBwdWJsaWNcclxuICAgIHRoaXMuY2hhcmdlc1Nob3duUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIERFRkFVTFRfRk9SX0NIQVJHRVNfU0hPV04gKTsgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5jb25jZW50cmF0aW9uUmVhZG91dFZpc2libGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggREVGQVVMVF9GT1JfQ09OQ0VOVFJBVElPTl9SRUFET1VUX1NIT1dOICk7XHJcbiAgICB0aGlzLm1lbWJyYW5lUG90ZW50aWFsUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuICAgIHRoaXMuc3RpbXVsdXNMb2Nrb3V0UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLmFsbElvbnNTaW11bGF0ZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggREVGQVVMVF9GT1JfU0hPV19BTExfSU9OUyApOyAvLyBjb250cm9scyB3aGV0aGVyIGFsbCBpb25zLCBvciBqdXN0IHRob3NlIG5lYXIgbWVtYnJhbmUsIGFyZSBzaW11bGF0ZWRcclxuICAgIHRoaXMucGxheWJhY2tQYXJ0aWNsZXNWaXNpYmxlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLmNvbmNlbnRyYXRpb25DaGFuZ2VkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLnN0aW11bHVzUHVsc2VJbml0aWF0ZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIHRoaXMubmV1cm9uTW9kZWxQbGF5YmFja1N0YXRlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcclxuXHJcbiAgICAvLyBAcHVibGljLCBwYXJ0IG9mIGEgd29ya2Fyb3VuZCBmb3IgYW4gaXNzdWUgd2l0aCByZWZyZXNoaW5nIGNhbnZhc2VzIHdoZW4gbm90aGluZyBpcyBkcmF3biwgc2VlXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmV1cm9uL2lzc3Vlcy8xMDAgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MDNcclxuICAgIHRoaXMuYXRMZWFzdE9uZVBhcnRpY2xlUHJlc2VudFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIGFkZCBhIGxpc3RlbmVyIHRoYXQgd2lsbCBzdGltdWxhdGUgdGhlIEhIIG1vZGVsIHRoZW4gdGhlIHRyYXZlbGluZyBhY3Rpb24gcG90ZW50aWFsIHJlYWNoZXMgdGhlIGNyb3NzIHNlY3Rpb25cclxuICAgIHRoaXMuYXhvbk1lbWJyYW5lLnRyYXZlbGluZ0FjdGlvblBvdGVudGlhbFJlYWNoZWRDcm9zc1NlY3Rpb24uYWRkTGlzdGVuZXIoICgpID0+IHtcclxuXHJcbiAgICAgIC8vIFRoZSBhY3Rpb24gcG90ZW50aWFsIGhhcyBhcnJpdmVkIGF0IHRoZSBjcm9zcyBzZWN0aW9uLCBzbyBzdGltdWxhdGUgdGhlIG1vZGVsIHRoZSBzaW11bGF0ZXMgdGhlIGFjdGlvblxyXG4gICAgICAvLyBwb3RlbnRpYWwgdm9sdGFnZXMgYW5kIGN1cnJlbnQgZmxvd3MuXHJcbiAgICAgIHRoaXMuaG9kZ2tpbkh1eGxleU1vZGVsLnN0aW11bGF0ZSgpO1xyXG5cclxuICAgICAgaWYgKCB3aW5kb3cucGhldC5uZXVyb24ucHJvZmlsZXIgJiYgd2luZG93LnBoZXQubmV1cm9uLnByb2ZpbGVyLnNldHRpbmcgPT09IDEgKSB7XHJcbiAgICAgICAgLy8gSWYgZW5hYmxlZCwgc3RhcnQgY29sbGVjdGluZyBwcm9maWxpbmcgZGF0YSwgd2hpY2ggd2lsbCBhdXRvbWF0aWNhbGx5IGJlIHNwYXQgb3V0IHRvIHRoZSBjb25zb2xlIChvciBhc1xyXG4gICAgICAgIC8vIGFuIGFsZXJ0IGRpYWxvZyBvbiBpT1MpIHdoZW4gY29tcGxldGVkLiAgVGhlIGR1cmF0aW9uIHZhbHVlIGlzIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gYmUgdGhlIHRpbWUgZm9yXHJcbiAgICAgICAgLy8gdGhlIHBhcnRpY2xlcyB0byBhcHBlYXIsIGNyb3NzIHRoZSBtZW1icmFuZSwgYW5kIGZhZGUgb3V0LlxyXG4gICAgICAgIHdpbmRvdy5waGV0Lm5ldXJvbi5wcm9maWxlci5zdGFydERhdGFBbmFseXNpcyggNjAwMCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGFkZCBhbmQgcmVtb3ZlIHRoZSBiYWNrZ3JvdW5kIG9yICdidWxrJyBwYXJ0aWNsZXMgYmFzZWQgb24gc2ltdWxhdGlvbiBzZXR0aW5nc1xyXG4gICAgdGhpcy5hbGxJb25zU2ltdWxhdGVkUHJvcGVydHkubGF6eUxpbmsoIGFsbElvbnNTaW11bGF0ZWQgPT4ge1xyXG5cclxuICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgY2hhbmdlIHdoaWxlIHN0aW11bHVzIGlzIGxvY2tlZCBvdXQsIGFuZCB3ZSBkZXBlbmQgb24gdGhlIFVJIHRvIGVuZm9yY2UgdGhpcyBydWxlLlxyXG4gICAgICAvLyBPdGhlcndpc2UsIGJhY2tncm91bmQgcGFydGljbGVzIGNvdWxkIGNvbWUgYW5kIGdvIGR1cmluZyBhbmQgYWN0aW9uIHBvdGVudGlhbCBvciBkdXJpbmcgcGxheWJhY2ssIHdoaWNoIHdvdWxkXHJcbiAgICAgIC8vIGJlIGhhcmQgdG8gaGFuZGxlLlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc1N0aW11bHVzSW5pdGlhdGlvbkxvY2tlZE91dCgpLCAnYWxsIGlvbnMgc2V0dGluZyBjaGFuZ2VkIHdoZW4gc3RpbXVsdXMgd2FzIGxvY2tlZCBvdXQnICk7XHJcblxyXG4gICAgICBpZiAoIGFsbElvbnNTaW11bGF0ZWQgKSB7XHJcblxyXG4gICAgICAgIC8vIGFkZCB0aGUgYmFja2dyb3VuZCBwYXJ0aWNsZXNcclxuICAgICAgICB0aGlzLmFkZEluaXRpYWxCdWxrUGFydGljbGVzKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBiYWNrZ3JvdW5kIHBhcnRpY2xlc1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZFBhcnRpY2xlcy5jbGVhcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGhlIHByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHBhcnRpY2xlIHByZXNlbnRcclxuICAgICAgdGhpcy5hdExlYXN0T25lUGFydGljbGVQcmVzZW50UHJvcGVydHkuc2V0KCAoIHRoaXMuYmFja2dyb3VuZFBhcnRpY2xlcy5sZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2llbnRQYXJ0aWNsZXMubGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWJhY2tQYXJ0aWNsZXMubGVuZ3RoICkgPiAwICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXNlIGFuIGltbWVkaWF0ZWx5IGludm9rZWQgZnVuY3Rpb24gZXhwcmVzc2lvbiAoSUlGRSkgYSBmdW5jdGlvbiB0byBhZGQgdGhlIGluaXRpYWwgY2hhbm5lbHMuICBUaGUgcGF0dGVybiBpc1xyXG4gICAgLy8gaW50ZW5kZWQgdG8gYmUgc3VjaCB0aGF0IHRoZSBwb3Rhc3NpdW0gYW5kIHNvZGl1bSBnYXRlZCBjaGFubmVscyBhcmUgcmlnaHQgbmV4dCB0byBlYWNoIG90aGVyLCB3aXRoIG9jY2FzaW9uYWxcclxuICAgIC8vIGxlYWsgY2hhbm5lbHMgaW50ZXJzcGVyc2VkLiAgVGhlcmUgc2hvdWxkIGJlIG9uZSBvciBtb3JlIG9mIGVhY2ggdHlwZSBvZiBjaGFubmVsIG9uIHRoZSB0b3Agb2YgdGhlIG1lbWJyYW5lIHNvXHJcbiAgICAvLyB3aGVuIHRoZSB1c2VyIHpvb21zIGluLCB0aGV5IGNhbiBzZWUgYWxsIHR5cGVzLlxyXG4gICAgKCAoKSA9PiB7XHJcbiAgICAgIGxldCBhbmdsZSA9IE1hdGguUEkgKiAwLjQ1O1xyXG4gICAgICBjb25zdCB0b3RhbE51bUNoYW5uZWxzID0gTlVNX0dBVEVEX1NPRElVTV9DSEFOTkVMUyArIE5VTV9HQVRFRF9QT1RBU1NJVU1fQ0hBTk5FTFMgKyBOVU1fU09ESVVNX0xFQUtfQ0hBTk5FTFMgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTlVNX1BPVEFTU0lVTV9MRUFLX0NIQU5ORUxTO1xyXG4gICAgICBjb25zdCBhbmdsZUluY3JlbWVudCA9IE1hdGguUEkgKiAyIC8gdG90YWxOdW1DaGFubmVscztcclxuICAgICAgbGV0IGdhdGVkU29kaXVtQ2hhbm5lbHNBZGRlZCA9IDA7XHJcbiAgICAgIGxldCBnYXRlZFBvdGFzc2l1bUNoYW5uZWxzQWRkZWQgPSAwO1xyXG4gICAgICBsZXQgc29kaXVtTGVha0NoYW5uZWxzQWRkZWQgPSAwO1xyXG4gICAgICBsZXQgcG90YXNzaXVtTGVha0NoYW5uZWxzQWRkZWQgPSAwO1xyXG5cclxuICAgICAgLy8gQWRkIHNvbWUgb2YgZWFjaCB0eXBlIHNvIHRoYXQgdGhleSBhcmUgdmlzaWJsZSBhdCB0aGUgdG9wIHBvcnRpb24gb2YgdGhlIG1lbWJyYW5lLlxyXG4gICAgICBpZiAoIE5VTV9TT0RJVU1fTEVBS19DSEFOTkVMUyA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGFubmVsKCBNZW1icmFuZUNoYW5uZWxUeXBlcy5TT0RJVU1fTEVBS0FHRV9DSEFOTkVMLCBhbmdsZSApO1xyXG4gICAgICAgIHNvZGl1bUxlYWtDaGFubmVsc0FkZGVkKys7XHJcbiAgICAgICAgYW5nbGUgKz0gYW5nbGVJbmNyZW1lbnQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBOVU1fR0FURURfUE9UQVNTSVVNX0NIQU5ORUxTID4gMCApIHtcclxuICAgICAgICB0aGlzLmFkZENoYW5uZWwoIE1lbWJyYW5lQ2hhbm5lbFR5cGVzLlBPVEFTU0lVTV9HQVRFRF9DSEFOTkVMLCBhbmdsZSApO1xyXG4gICAgICAgIGdhdGVkUG90YXNzaXVtQ2hhbm5lbHNBZGRlZCsrO1xyXG4gICAgICAgIGFuZ2xlICs9IGFuZ2xlSW5jcmVtZW50O1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggTlVNX0dBVEVEX1NPRElVTV9DSEFOTkVMUyA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGFubmVsKCBNZW1icmFuZUNoYW5uZWxUeXBlcy5TT0RJVU1fR0FURURfQ0hBTk5FTCwgYW5nbGUgKTtcclxuICAgICAgICBnYXRlZFNvZGl1bUNoYW5uZWxzQWRkZWQrKztcclxuICAgICAgICBhbmdsZSArPSBhbmdsZUluY3JlbWVudDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIE5VTV9QT1RBU1NJVU1fTEVBS19DSEFOTkVMUyA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGFubmVsKCBNZW1icmFuZUNoYW5uZWxUeXBlcy5QT1RBU1NJVU1fTEVBS0FHRV9DSEFOTkVMLCBhbmdsZSApO1xyXG4gICAgICAgIHBvdGFzc2l1bUxlYWtDaGFubmVsc0FkZGVkKys7XHJcbiAgICAgICAgYW5nbGUgKz0gYW5nbGVJbmNyZW1lbnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5vdyBsb29wIHRocm91Z2ggdGhlIHJlc3Qgb2YgdGhlIG1lbWJyYW5lJ3MgY2lyY3VtZmVyZW5jZSBhZGRpbmcgdGhlIHZhcmlvdXMgdHlwZXMgb2YgZ2F0ZXMuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRvdGFsTnVtQ2hhbm5lbHMgLSA0OyBpKysgKSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBcInVyZ2VuY3lcIiBmb3IgZWFjaCB0eXBlIG9mIGdhdGUuXHJcbiAgICAgICAgY29uc3QgZ2F0ZWRTb2RpdW1VcmdlbmN5ID0gTlVNX0dBVEVEX1NPRElVTV9DSEFOTkVMUyAvIGdhdGVkU29kaXVtQ2hhbm5lbHNBZGRlZDtcclxuICAgICAgICBjb25zdCBnYXRlZFBvdGFzc2l1bVVyZ2VuY3kgPSBOVU1fR0FURURfUE9UQVNTSVVNX0NIQU5ORUxTIC8gZ2F0ZWRQb3Rhc3NpdW1DaGFubmVsc0FkZGVkO1xyXG4gICAgICAgIGNvbnN0IHBvdGFzc2l1bUxlYWtVcmdlbmN5ID0gTlVNX1BPVEFTU0lVTV9MRUFLX0NIQU5ORUxTIC8gcG90YXNzaXVtTGVha0NoYW5uZWxzQWRkZWQ7XHJcbiAgICAgICAgY29uc3Qgc29kaXVtTGVha1VyZ2VuY3kgPSBOVU1fU09ESVVNX0xFQUtfQ0hBTk5FTFMgLyBzb2RpdW1MZWFrQ2hhbm5lbHNBZGRlZDtcclxuICAgICAgICBsZXQgY2hhbm5lbFR5cGVUb0FkZCA9IG51bGw7XHJcbiAgICAgICAgaWYgKCBnYXRlZFNvZGl1bVVyZ2VuY3kgPj0gZ2F0ZWRQb3Rhc3NpdW1VcmdlbmN5ICYmIGdhdGVkU29kaXVtVXJnZW5jeSA+PSBwb3Rhc3NpdW1MZWFrVXJnZW5jeSAmJlxyXG4gICAgICAgICAgICAgZ2F0ZWRTb2RpdW1VcmdlbmN5ID49IHNvZGl1bUxlYWtVcmdlbmN5ICkge1xyXG4gICAgICAgICAgLy8gQWRkIGEgZ2F0ZWQgc29kaXVtIGNoYW5uZWwuXHJcbiAgICAgICAgICBjaGFubmVsVHlwZVRvQWRkID0gTWVtYnJhbmVDaGFubmVsVHlwZXMuU09ESVVNX0dBVEVEX0NIQU5ORUw7XHJcbiAgICAgICAgICBnYXRlZFNvZGl1bUNoYW5uZWxzQWRkZWQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGdhdGVkUG90YXNzaXVtVXJnZW5jeSA+IGdhdGVkU29kaXVtVXJnZW5jeSAmJiBnYXRlZFBvdGFzc2l1bVVyZ2VuY3kgPj0gcG90YXNzaXVtTGVha1VyZ2VuY3kgJiZcclxuICAgICAgICAgICAgICAgICAgZ2F0ZWRQb3Rhc3NpdW1VcmdlbmN5ID49IHNvZGl1bUxlYWtVcmdlbmN5ICkge1xyXG4gICAgICAgICAgLy8gQWRkIGEgZ2F0ZWQgcG90YXNzaXVtIGNoYW5uZWwuXHJcbiAgICAgICAgICBjaGFubmVsVHlwZVRvQWRkID0gTWVtYnJhbmVDaGFubmVsVHlwZXMuUE9UQVNTSVVNX0dBVEVEX0NIQU5ORUw7XHJcbiAgICAgICAgICBnYXRlZFBvdGFzc2l1bUNoYW5uZWxzQWRkZWQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHBvdGFzc2l1bUxlYWtVcmdlbmN5ID4gZ2F0ZWRTb2RpdW1VcmdlbmN5ICYmIHBvdGFzc2l1bUxlYWtVcmdlbmN5ID4gZ2F0ZWRQb3Rhc3NpdW1VcmdlbmN5ICYmIHBvdGFzc2l1bUxlYWtVcmdlbmN5ID49IHNvZGl1bUxlYWtVcmdlbmN5ICkge1xyXG4gICAgICAgICAgLy8gQWRkIGEgcG90YXNzaXVtIGxlYWsgY2hhbm5lbC5cclxuICAgICAgICAgIGNoYW5uZWxUeXBlVG9BZGQgPSBNZW1icmFuZUNoYW5uZWxUeXBlcy5QT1RBU1NJVU1fTEVBS0FHRV9DSEFOTkVMO1xyXG4gICAgICAgICAgcG90YXNzaXVtTGVha0NoYW5uZWxzQWRkZWQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHNvZGl1bUxlYWtVcmdlbmN5ID4gZ2F0ZWRTb2RpdW1VcmdlbmN5ICYmIHNvZGl1bUxlYWtVcmdlbmN5ID4gZ2F0ZWRQb3Rhc3NpdW1VcmdlbmN5ICYmIHNvZGl1bUxlYWtVcmdlbmN5ID4gcG90YXNzaXVtTGVha1VyZ2VuY3kgKSB7XHJcbiAgICAgICAgICAvLyBBZGQgYSBzb2RpdW0gbGVhayBjaGFubmVsLlxyXG4gICAgICAgICAgY2hhbm5lbFR5cGVUb0FkZCA9IE1lbWJyYW5lQ2hhbm5lbFR5cGVzLlNPRElVTV9MRUFLQUdFX0NIQU5ORUw7XHJcbiAgICAgICAgICBzb2RpdW1MZWFrQ2hhbm5lbHNBZGRlZCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlICk7IC8vIFNob3VsZCBuZXZlciBnZXQgaGVyZSwgc28gZGVidWcgaWYgaXQgZG9lcy5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ2hhbm5lbCggY2hhbm5lbFR5cGVUb0FkZCwgYW5nbGUgKTtcclxuICAgICAgICBhbmdsZSArPSBhbmdsZUluY3JlbWVudDtcclxuICAgICAgfVxyXG4gICAgfSApKCk7XHJcblxyXG4gICAgLy8gTm90ZTogSXQgaXMgZXhwZWN0ZWQgdGhhdCB0aGUgbW9kZWwgd2lsbCBiZSByZXNldCBvbmNlIGl0IGhhcyBiZWVuIGNyZWF0ZWQsIGFuZCB0aGlzIHdpbGwgc2V0IHRoZSBpbml0aWFsIHN0YXRlLFxyXG4gICAgLy8gaW5jbHVkaW5nIGFkZGluZyB0aGUgcGFydGljbGVzIHRvIHRoZSBtb2RlbC5cclxuICAgIHRoaXMudGltZVByb3BlcnR5LmxpbmsoIHRoaXMudXBkYXRlUmVjb3JkUGxheUJhY2suYmluZCggdGhpcyApICk7XHJcbiAgICB0aGlzLm1vZGVQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZVJlY29yZFBsYXlCYWNrLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIHRoaXMucmVzZXQoKTsgLy8gVGhpcyBkb2VzIGluaXRpYWxpemF0aW9uXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBkaXNwYXRjaGVkIGZyb20gTmV1cm9uQ2xvY2tNb2RlbEFkYXB0ZXIncyBzdGVwIGZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gZGVsdGEgdGltZSwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICBpZiAoIGR0IDwgMCApIHtcclxuXHJcbiAgICAgIC8vIHRoaXMgaXMgYSBiYWNrd2FyZHMgdGltZSBzdGVwLCBzbyBtYWtlIHN1cmUgdGhhdCB3ZSBhcmUgaW4gdGhlIHBsYXliYWNrIG1vZGVcclxuICAgICAgdGhpcy5zZXRQbGF5YmFjaygpO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgc2ltdWxhdGlvbiB0aW1lIGlzIHBhc3QgdGhlIGVuZCBvZiB0aGUgbWF4IHJlY29yZGVkIHRpbWUsIHNldCB0aGUgdGltZSB0byB0aGUgbWF4IHJlY29yZGVkXHJcbiAgICAgIC8vIHZhbHVlIHNvIHRoYXQgdGhlIGN1cnNvciB3aWxsIGFwcGVhciBvbiB0aGUgY2hhcnQgKGlmIHZpc2libGUpLCB0aHVzIGFsbG93aW5nIHRoZSB1c2VyIHRvIGludGVyYWN0IHdpdGggaXQuXHJcbiAgICAgIGlmICggdGhpcy5nZXRUaW1lKCkgPiB0aGlzLmdldE1heFJlY29yZGVkVGltZSgpICkge1xyXG4gICAgICAgIHRoaXMuc2V0VGltZSggdGhpcy5nZXRNYXhSZWNvcmRlZFRpbWUoKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIuc3RlcCggZHQgKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBhcmUgY3VycmVudGx5IGluIHBsYXliYWNrIG1vZGUgYW5kIHdlIGhhdmUgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSByZWNvcmRlZCBkYXRhLCB3ZSBzaG91bGQgYXV0b21hdGljYWxseVxyXG4gICAgLy8gc3dpdGNoIHRvIHJlY29yZCBtb2RlLlxyXG4gICAgaWYgKCB0aGlzLmlzUGxheWJhY2soKSAmJiB0aGlzLmdldFRpbWUoKSA+PSB0aGlzLmdldE1heFJlY29yZGVkVGltZSgpICkge1xyXG4gICAgICB0aGlzLnNldE1vZGVSZWNvcmQoKTtcclxuICAgICAgdGhpcy5zZXRQbGF5aW5nKCB0cnVlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwIHRoZSBhY3R1YWwgbW9kZSwgd2hpY2ggaXMgZG9uZSBieSBzdGVwcGluZyBlYWNoIG9mIHRoZSBjb25zdGl0dWVudCBlbGVtZW50cyBvZiB0aGUgbW9kZWwuICBUaGlzIGlzIGNhbGxlZFxyXG4gICAqIGJ5IHRoZSBhY3RpdmUgUmVjb3JkQW5kUGxheWJhY2sgTW9kZWwgbW9kZSwgc2VlIHRoZSBSZWNvcmRBbmRQbGF5QmFja01vZGVsIHN0ZXAgZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHJldHVybnMge05ldXJvbk1vZGVsU3RhdGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXBJblRpbWUoIGR0ICkge1xyXG5cclxuICAgIC8vIFN0ZXAgdGhlIG1lbWJyYW5lIGluIHRpbWUuICBUaGlzIGlzIGRvbmUgcHJpb3IgdG8gc3RlcHBpbmcgdGhlIEhIIG1vZGVsIGJlY2F1c2UgdGhlIHRyYXZlbGluZyBhY3Rpb24gcG90ZW50aWFsXHJcbiAgICAvLyBpcyBwYXJ0IG9mIHRoZSBtZW1icmFuZSwgc28gaWYgaXQgcmVhY2hlcyB0aGUgY3Jvc3Mgc2VjdGlvbiBpbiB0aGlzIHRpbWUgc3RlcCB0aGUgbWVtYnJhbmUgcG90ZW50aWFsIHdpbGwgYmVcclxuICAgIC8vIG1vZGlmaWVkLlxyXG4gICAgdGhpcy5heG9uTWVtYnJhbmUuc3RlcEluVGltZSggZHQgKTtcclxuXHJcbiAgICAvLyBUaGlzIGlzIGEgc3RlcCBmb3J3YXJkIGluIHRpbWUuICBVcGRhdGUgdGhlIHZhbHVlIG9mIHRoZSBtZW1icmFuZSBwb3RlbnRpYWwgYnkgc3RlcHBpbmcgdGhlIEhvZGdraW5zLUh1eGxleVxyXG4gICAgLy8gbW9kZWwuXHJcbiAgICB0aGlzLmhvZGdraW5IdXhsZXlNb2RlbC5zdGVwSW5UaW1lKCBkdCApO1xyXG5cclxuICAgIC8vIFRoZXJlIGlzIGEgYml0IG9mIGEgdGhyZXNob2xkIG9uIHNlbmRpbmcgb3V0IG5vdGlmaWNhdGlvbnMgb2YgbWVtYnJhbmUgdm9sdGFnZSBjaGFuZ2VzLCBzaW5jZSBvdGhlcndpc2UgdGhlXHJcbiAgICAvLyBuYXR1cmFsIFwibm9pc2VcIiBpbiB0aGUgbW9kZWwgY2F1c2VzIG5vdGlmaWNhdGlvbnMgdG8gYmUgc2VudCBvdXQgY29udGludW91c2x5LlxyXG4gICAgaWYgKCBNYXRoLmFicyggdGhpcy5tZW1icmFuZVBvdGVudGlhbFByb3BlcnR5LmdldCgpIC0gdGhpcy5ob2Rna2luSHV4bGV5TW9kZWwuZ2V0TWVtYnJhbmVWb2x0YWdlKCkgKSA+IE1FTUJSQU5FX1BPVEVOVElBTF9DSEFOR0VfVEhSRVNIT0xEICkge1xyXG4gICAgICB0aGlzLm1lbWJyYW5lUG90ZW50aWFsUHJvcGVydHkuc2V0KCB0aGlzLmhvZGdraW5IdXhsZXlNb2RlbC5nZXRNZW1icmFuZVZvbHRhZ2UoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgc3RpbXVsdXMgbG9ja291dCBzdGF0ZS5cclxuICAgIHRoaXMudXBkYXRlU3RpbXVsdXNMb2Nrb3V0U3RhdGUoKTtcclxuXHJcbiAgICAvLyBPUFRJTUlaQVRJT04gTk9URTogRm9yIGJldHRlciBwZXJmb3JtYW5jZSwgYW5kIGJlY2F1c2UgdGhlIGNvbnRlbnRzIG9mIHRoZSBvYnNlcnZhYmxlIGFycmF5cyBhcmUgbm90IGJlaW5nXHJcbiAgICAvLyBtb2RpZmllZCwgdGhlIGZvbGxvd2luZyBsb29wcyByZWFjaCBpbnRvIHRoZSBvYnNlcnZhYmxlIGFycmF5cyBhbmQgbG9vcCBvbiB0aGUgcmVndWxhciBhcnJheSBjb250YWluZWQgd2l0aGluLlxyXG5cclxuICAgIC8vIFN0ZXAgdGhlIGNoYW5uZWxzLlxyXG4gICAgdGhpcy5tZW1icmFuZUNoYW5uZWxzLmZvckVhY2goIGNoYW5uZWwgPT4ge1xyXG4gICAgICBjaGFubmVsLnN0ZXBJblRpbWUoIGR0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50cmFuc2llbnRQYXJ0aWNsZXMuZm9yRWFjaCggcGFydGljbGUgPT4ge1xyXG4gICAgICBwYXJ0aWNsZS5zdGVwSW5UaW1lKCBkdCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFN0ZXAgdGhlIGJhY2tncm91bmQgcGFydGljbGVzLCB3aGljaCBjYXVzZXMgdGhlbSB0byBleGhpYml0IGFcclxuICAgIC8vIGxpdHRsZSBCcm93bmlhbiBtb3Rpb25cclxuICAgIHRoaXMuYmFja2dyb3VuZFBhcnRpY2xlcy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XHJcbiAgICAgIHBhcnRpY2xlLnN0ZXBJblRpbWUoIGR0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRqdXN0IHRoZSBvdmVyYWxsIHBvdGFzc2l1bSBhbmQgc29kaXVtIGNvbmNlbnRyYXRpb24gbGV2ZWxzIGJhc2VkIHBhcmFtZXRlcnMgb2YgdGhlIEhIIG1vZGVsLiAgVGhpcyBpcyBkb25lXHJcbiAgICAvLyBzb2xlbHkgdG8gcHJvdmlkZSB2YWx1ZXMgdGhhdCBjYW4gYmUgZGlzcGxheWVkIHRvIHRoZSB1c2VyLCBhbmQgYXJlIG5vdCB1c2VkIGZvciBhbnl0aGluZyBlbHNlIGluIHRoZSBtb2RlbC5cclxuICAgIGxldCBjb25jZW50cmF0aW9uQ2hhbmdlZCA9IHRoaXMuY29uY2VudHJhdGlvbkNoYW5nZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICBsZXQgZGlmZmVyZW5jZTtcclxuICAgIGNvbnN0IHBvdGFzc2l1bUNvbmR1Y3RhbmNlID0gdGhpcy5ob2Rna2luSHV4bGV5TW9kZWwuZ2V0X2RlbGF5ZWRfbjQoIENPTkNFTlRSQVRJT05fUkVBRE9VVF9ERUxBWSApO1xyXG4gICAgaWYgKCBwb3Rhc3NpdW1Db25kdWN0YW5jZSAhPT0gMCApIHtcclxuICAgICAgLy8gUG90YXNzaXVtIGlzIG1vdmluZyBvdXQgb2YgdGhlIGNlbGwgYXMgcGFydCBvZiB0aGUgcHJvY2VzcyBvZlxyXG4gICAgICAvLyBhbiBhY3Rpb24gcG90ZW50aWFsLCBzbyBhZGp1c3QgdGhlIGludGVyaW9yIGFuZCBleHRlcmlvclxyXG4gICAgICAvLyBjb25jZW50cmF0aW9uIHZhbHVlcy5cclxuICAgICAgdGhpcy5wb3Rhc3NpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24gKz0gcG90YXNzaXVtQ29uZHVjdGFuY2UgKiBkdCAqIEVYVEVSSU9SX0NPTkNFTlRSQVRJT05fQ0hBTkdFX1JBVEVfUE9UQVNTSVVNO1xyXG4gICAgICB0aGlzLnBvdGFzc2l1bUludGVyaW9yQ29uY2VudHJhdGlvbiAtPSBwb3Rhc3NpdW1Db25kdWN0YW5jZSAqIGR0ICogSU5URVJJT1JfQ09OQ0VOVFJBVElPTl9DSEFOR0VfUkFURV9QT1RBU1NJVU07XHJcbiAgICAgIGNvbmNlbnRyYXRpb25DaGFuZ2VkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIHRoaXMucG90YXNzaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uICE9PSBOT01JTkFMX1BPVEFTU0lVTV9FWFRFUklPUl9DT05DRU5UUkFUSU9OICkge1xyXG4gICAgICAgIGRpZmZlcmVuY2UgPSB0aGlzLnBvdGFzc2l1bUV4dGVyaW9yQ29uY2VudHJhdGlvbiAtIE5PTUlOQUxfUE9UQVNTSVVNX0VYVEVSSU9SX0NPTkNFTlRSQVRJT047XHJcbiAgICAgICAgaWYgKCBkaWZmZXJlbmNlIDwgQ09OQ0VOVFJBVElPTl9ESUZGX1RIUkVTSE9MRCApIHtcclxuICAgICAgICAgIC8vIENsb3NlIGVub3VnaCB0byBjb25zaWRlciBpdCBmdWxseSByZXN0b3JlZC5cclxuICAgICAgICAgIHRoaXMucG90YXNzaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uID0gTk9NSU5BTF9QT1RBU1NJVU1fRVhURVJJT1JfQ09OQ0VOVFJBVElPTjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBNb3ZlIGNsb3NlciB0byB0aGUgbm9taW5hbCB2YWx1ZS5cclxuICAgICAgICAgIHRoaXMucG90YXNzaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uIC09IGRpZmZlcmVuY2UgKiBDT05DRU5UUkFUSU9OX1JFU1RPUkFUSU9OX0ZBQ1RPUiAqIGR0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25jZW50cmF0aW9uQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLnBvdGFzc2l1bUludGVyaW9yQ29uY2VudHJhdGlvbiAhPT0gTk9NSU5BTF9QT1RBU1NJVU1fSU5URVJJT1JfQ09OQ0VOVFJBVElPTiApIHtcclxuICAgICAgICBkaWZmZXJlbmNlID0gTk9NSU5BTF9QT1RBU1NJVU1fSU5URVJJT1JfQ09OQ0VOVFJBVElPTiAtIHRoaXMucG90YXNzaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uO1xyXG4gICAgICAgIGlmICggZGlmZmVyZW5jZSA8IENPTkNFTlRSQVRJT05fRElGRl9USFJFU0hPTEQgKSB7XHJcbiAgICAgICAgICAvLyBDbG9zZSBlbm91Z2ggdG8gY29uc2lkZXIgaXQgZnVsbHkgcmVzdG9yZWQuXHJcbiAgICAgICAgICB0aGlzLnBvdGFzc2l1bUludGVyaW9yQ29uY2VudHJhdGlvbiA9IE5PTUlOQUxfUE9UQVNTSVVNX0lOVEVSSU9SX0NPTkNFTlRSQVRJT047XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgLy8gTW92ZSBjbG9zZXIgdG8gdGhlIG5vbWluYWwgdmFsdWUuXHJcbiAgICAgICAgICB0aGlzLnBvdGFzc2l1bUludGVyaW9yQ29uY2VudHJhdGlvbiArPSBkaWZmZXJlbmNlICogQ09OQ0VOVFJBVElPTl9SRVNUT1JBVElPTl9GQUNUT1IgKiBkdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uY2VudHJhdGlvbkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBzb2RpdW1Db25kdWN0YW5jZSA9IHRoaXMuaG9kZ2tpbkh1eGxleU1vZGVsLmdldF9kZWxheWVkX20zaCggQ09OQ0VOVFJBVElPTl9SRUFET1VUX0RFTEFZICk7XHJcbiAgICBpZiAoIHRoaXMuaG9kZ2tpbkh1eGxleU1vZGVsLmdldF9tM2goKSAhPT0gMCApIHtcclxuICAgICAgLy8gU29kaXVtIGlzIG1vdmluZyBpbiB0byB0aGUgY2VsbCBhcyBwYXJ0IG9mIHRoZSBwcm9jZXNzIG9mIGFuXHJcbiAgICAgIC8vIGFjdGlvbiBwb3RlbnRpYWwsIHNvIGFkanVzdCB0aGUgaW50ZXJpb3IgYW5kIGV4dGVyaW9yXHJcbiAgICAgIC8vIGNvbmNlbnRyYXRpb24gdmFsdWVzLlxyXG4gICAgICB0aGlzLnNvZGl1bUV4dGVyaW9yQ29uY2VudHJhdGlvbiAtPSBzb2RpdW1Db25kdWN0YW5jZSAqIGR0ICogRVhURVJJT1JfQ09OQ0VOVFJBVElPTl9DSEFOR0VfUkFURV9TT0RJVU07XHJcbiAgICAgIHRoaXMuc29kaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uICs9IHNvZGl1bUNvbmR1Y3RhbmNlICogZHQgKiBJTlRFUklPUl9DT05DRU5UUkFUSU9OX0NIQU5HRV9SQVRFX1NPRElVTTtcclxuICAgICAgY29uY2VudHJhdGlvbkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmICggdGhpcy5zb2RpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24gIT09IE5PTUlOQUxfU09ESVVNX0VYVEVSSU9SX0NPTkNFTlRSQVRJT04gKSB7XHJcbiAgICAgICAgZGlmZmVyZW5jZSA9IE5PTUlOQUxfU09ESVVNX0VYVEVSSU9SX0NPTkNFTlRSQVRJT04gLSB0aGlzLnNvZGl1bUV4dGVyaW9yQ29uY2VudHJhdGlvbjtcclxuICAgICAgICBpZiAoIGRpZmZlcmVuY2UgPCBDT05DRU5UUkFUSU9OX0RJRkZfVEhSRVNIT0xEICkge1xyXG4gICAgICAgICAgLy8gQ2xvc2UgZW5vdWdoIHRvIGNvbnNpZGVyIGl0IGZ1bGx5IHJlc3RvcmVkLlxyXG4gICAgICAgICAgdGhpcy5zb2RpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24gPSBOT01JTkFMX1NPRElVTV9FWFRFUklPUl9DT05DRU5UUkFUSU9OO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIE1vdmUgY2xvc2VyIHRvIHRoZSBub21pbmFsIHZhbHVlLlxyXG4gICAgICAgICAgdGhpcy5zb2RpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24gKz0gZGlmZmVyZW5jZSAqIENPTkNFTlRSQVRJT05fUkVTVE9SQVRJT05fRkFDVE9SICogZHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbmNlbnRyYXRpb25DaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMuc29kaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uICE9PSBOT01JTkFMX1NPRElVTV9JTlRFUklPUl9DT05DRU5UUkFUSU9OICkge1xyXG4gICAgICAgIGRpZmZlcmVuY2UgPSB0aGlzLnNvZGl1bUludGVyaW9yQ29uY2VudHJhdGlvbiAtIE5PTUlOQUxfU09ESVVNX0lOVEVSSU9SX0NPTkNFTlRSQVRJT047XHJcbiAgICAgICAgaWYgKCBkaWZmZXJlbmNlIDwgQ09OQ0VOVFJBVElPTl9ESUZGX1RIUkVTSE9MRCApIHtcclxuICAgICAgICAgIC8vIENsb3NlIGVub3VnaCB0byBjb25zaWRlciBpdCBmdWxseSByZXN0b3JlZC5cclxuICAgICAgICAgIHRoaXMuc29kaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uID0gTk9NSU5BTF9TT0RJVU1fSU5URVJJT1JfQ09OQ0VOVFJBVElPTjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBNb3ZlIGNsb3NlciB0byB0aGUgbm9taW5hbCB2YWx1ZS5cclxuICAgICAgICAgIHRoaXMuc29kaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uIC09IGRpZmZlcmVuY2UgKiBDT05DRU5UUkFUSU9OX1JFU1RPUkFUSU9OX0ZBQ1RPUiAqIGR0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25jZW50cmF0aW9uQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICggY29uY2VudHJhdGlvbkNoYW5nZWQgKSB7XHJcbiAgICAgIHRoaXMuY29uY2VudHJhdGlvbkNoYW5nZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciB0aGVzZSBpcyBhdCBsZWFzdCBvbmUgcGFydGljbGUgcHJlc2VudCBpbiB0aGUgbW9kZWwuXHJcbiAgICB0aGlzLmF0TGVhc3RPbmVQYXJ0aWNsZVByZXNlbnRQcm9wZXJ0eS5zZXQoICggdGhpcy5iYWNrZ3JvdW5kUGFydGljbGVzLmxlbmd0aCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2llbnRQYXJ0aWNsZXMubGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXliYWNrUGFydGljbGVzLmxlbmd0aCApID4gMCApO1xyXG5cclxuICAgIC8vIEVtaXQgdGhlIGV2ZW50IHRoYXQgbGV0cyB0aGUgdmlldyBrbm93IHRoYXQgdGhlIHBhcnRpY2xlcyBzaG91bGQgYmUgcmVkcmF3bi5cclxuICAgIHRoaXMucGFydGljbGVzTW92ZWQuZW1pdCgpO1xyXG5cclxuICAgIC8vIElmIGFueSBvbmUgY2hhbm5lbCdzIHN0YXRlIGlzIGNoYW5nZWQsIHRyaWdnZXIgYSBjaGFubmVsIHJlcHJlc2VudGF0aW9uIGNoYW5nZWQgZXZlbnRcclxuICAgIGNvbnN0IGNoYW5uZWxTdGF0ZUNoYW5nZWQgPSBtZW1icmFuZUNoYW5uZWwgPT4gbWVtYnJhbmVDaGFubmVsLmNoYW5uZWxTdGF0ZUNoYW5nZWRQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGlmICggXy5zb21lKCB0aGlzLm1lbWJyYW5lQ2hhbm5lbHMsIGNoYW5uZWxTdGF0ZUNoYW5nZWQgKSApIHtcclxuICAgICAgdGhpcy5jaGFubmVsUmVwcmVzZW50YXRpb25DaGFuZ2VkLmVtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gbW9kZWwgc3RhdGUgYWZ0ZXIgZWFjaCB0aW1lIHN0ZXAuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogdXBkYXRlIHNvbWUgcHJvcGVydGllcyB0aGF0IGNhbiBjaGFuZ2UgYXMgcGxheWJhY2sgcHJvZ3Jlc3Nlc1xyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICB1cGRhdGVSZWNvcmRQbGF5QmFjaygpIHtcclxuICAgIHRoaXMudXBkYXRlU3RpbXVsdXNMb2Nrb3V0U3RhdGUoKTtcclxuICAgIHRoaXMudXBkYXRlU2ltQW5kUGxheWJhY2tQYXJ0aWNsZVZpc2liaWxpdHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBuZXVyb24gbW9kZWwuICBUaGlzIHNob3VsZCByZXN0b3JlIGV2ZXJ5dGhpbmcgdG8gdGhlIGluaXRpYWwgc3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBzdXBlcmNsYXNzLCB3aGljaCBjb250YWlucyB0aGUgcmVjb3JkaW5nIHN0YXRlICYgZGF0YS5cclxuICAgIHN1cGVyLnJlc2V0QWxsKCk7XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIGF4b24gbWVtYnJhbmUuXHJcbiAgICB0aGlzLmF4b25NZW1icmFuZS5yZXNldCgpO1xyXG5cclxuICAgIC8vIFJlbW92ZSBhbGwgZXhpc3RpbmcgcGFydGljbGVzLlxyXG4gICAgdGhpcy5yZW1vdmVBbGxQYXJ0aWNsZXMoKTtcclxuXHJcbiAgICAvLyBSZXNldCB0aGUgSEggbW9kZWwuXHJcbiAgICB0aGlzLmhvZGdraW5IdXhsZXlNb2RlbC5yZXNldCgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBtZW1icmFuZSBjaGFubmVscy5cclxuICAgIHRoaXMubWVtYnJhbmVDaGFubmVscy5mb3JFYWNoKCBtZW1icmFuZUNoYW5uZWwgPT4ge1xyXG4gICAgICBtZW1icmFuZUNoYW5uZWwucmVzZXQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZW5kIG5vdGlmaWNhdGlvbiBvZiBtZW1icmFuZSBjaGFubmVsIGNoYW5nZSB0byBtYWtlIHN1cmUgdGhhdCBjaGFubmVscyBhcmUgcmUtcmVuZGVyZWQuXHJcbiAgICB0aGlzLmNoYW5uZWxSZXByZXNlbnRhdGlvbkNoYW5nZWQuZW1pdCgpO1xyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBjb25jZW50cmF0aW9uIHJlYWRvdXQgdmFsdWVzLlxyXG4gICAgbGV0IGNvbmNlbnRyYXRpb25DaGFuZ2VkID0gdGhpcy5jb25jZW50cmF0aW9uQ2hhbmdlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIGlmICggdGhpcy5zb2RpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24gIT09IE5PTUlOQUxfU09ESVVNX0VYVEVSSU9SX0NPTkNFTlRSQVRJT04gKSB7XHJcbiAgICAgIHRoaXMuc29kaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uID0gTk9NSU5BTF9TT0RJVU1fRVhURVJJT1JfQ09OQ0VOVFJBVElPTjtcclxuICAgICAgY29uY2VudHJhdGlvbkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLnNvZGl1bUludGVyaW9yQ29uY2VudHJhdGlvbiAhPT0gTk9NSU5BTF9TT0RJVU1fSU5URVJJT1JfQ09OQ0VOVFJBVElPTiApIHtcclxuICAgICAgdGhpcy5zb2RpdW1JbnRlcmlvckNvbmNlbnRyYXRpb24gPSBOT01JTkFMX1NPRElVTV9JTlRFUklPUl9DT05DRU5UUkFUSU9OO1xyXG4gICAgICBjb25jZW50cmF0aW9uQ2hhbmdlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMucG90YXNzaXVtRXh0ZXJpb3JDb25jZW50cmF0aW9uICE9PSBOT01JTkFMX1BPVEFTU0lVTV9FWFRFUklPUl9DT05DRU5UUkFUSU9OICkge1xyXG4gICAgICB0aGlzLnBvdGFzc2l1bUV4dGVyaW9yQ29uY2VudHJhdGlvbiA9IE5PTUlOQUxfUE9UQVNTSVVNX0VYVEVSSU9SX0NPTkNFTlRSQVRJT047XHJcbiAgICAgIGNvbmNlbnRyYXRpb25DaGFuZ2VkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmICggdGhpcy5wb3Rhc3NpdW1JbnRlcmlvckNvbmNlbnRyYXRpb24gIT09IE5PTUlOQUxfUE9UQVNTSVVNX0lOVEVSSU9SX0NPTkNFTlRSQVRJT04gKSB7XHJcbiAgICAgIHRoaXMucG90YXNzaXVtSW50ZXJpb3JDb25jZW50cmF0aW9uID0gTk9NSU5BTF9QT1RBU1NJVU1fSU5URVJJT1JfQ09OQ0VOVFJBVElPTjtcclxuICAgICAgY29uY2VudHJhdGlvbkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKCBjb25jZW50cmF0aW9uQ2hhbmdlZCApIHtcclxuICAgICAgdGhpcy5jb25jZW50cmF0aW9uQ2hhbmdlZFByb3BlcnR5LnNldCggdHJ1ZSApOyAvLyBUcmlnZ2VyIGNvbmNlbnRyYXRpb25SZWFkb3V0IGNoYW5nZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBzdGltdWxhdGlvbiBsb2Nrb3V0LlxyXG4gICAgdGhpcy5zZXRTdGltdWx1c0xvY2tvdXQoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBtZW1icmFuZSBjaGFydCB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cclxuICAgIHRoaXMuc2V0UG90ZW50aWFsQ2hhcnRWaXNpYmxlKCBERUZBVUxUX0ZPUl9NRU1CUkFORV9DSEFSVF9WSVNJQklMSVRZICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBjb25jZW50cmF0aW9uIHJlYWRvdXQgdmlzaWJpbGl0eSB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cclxuICAgIHRoaXMuc2V0Q29uY2VudHJhdGlvblJlYWRvdXRWaXNpYmxlKCBERUZBVUxUX0ZPUl9DT05DRU5UUkFUSU9OX1JFQURPVVRfU0hPV04gKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGNoYXJnZSBzeW1ib2xzIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxyXG4gICAgdGhpcy5zZXRDaGFyZ2VzU2hvd24oIERFRkFVTFRfRk9SX0NIQVJHRVNfU0hPV04gKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHN0YXRlIG9mICdhbGwgaW9ucyBzaW11bGF0ZWQnLiAgSWYgdGhlIGRlZmF1bHQgaXMgb24sIGN5Y2xlIGl0IG9mZiBmaXJzdCB0byBmb3JjZSBhIGNoYW5nZSBzbyB0aGF0XHJcbiAgICAvLyBiYWNrZ3JvdW5kIHBhcnRpY2xlcyBhcmUgYWRkZWQuXHJcbiAgICBpZiAoIERFRkFVTFRfRk9SX1NIT1dfQUxMX0lPTlMgPT09IHRydWUgKSB7XHJcbiAgICAgIHRoaXMuc2V0QWxsSW9uc1NpbXVsYXRlZCggZmFsc2UgKTtcclxuICAgIH1cclxuICAgIHRoaXMuc2V0QWxsSW9uc1NpbXVsYXRlZCggREVGQVVMVF9GT1JfU0hPV19BTExfSU9OUyApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgc3RhdGUgb2YgdGhlIHJlY29yZC1hbmQtcGxheWJhY2sgbW9kZWwgdG8gYmUgXCJsaXZlXCIgKG5laXRoZXIgcmVjb3JkaW5nIG5vciBwbGF5aW5nKSBhbmQgdW5wYXVzZWQuXHJcbiAgICB0aGlzLmNsZWFySGlzdG9yeSgpO1xyXG4gICAgdGhpcy5zZXRNb2RlTGl2ZSgpO1xyXG4gICAgdGhpcy5zZXRQbGF5aW5nKCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhciB0aGUgcmVjb3JkZWQgZGF0YS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgY2xlYXJIaXN0b3J5KCkge1xyXG4gICAgdGhpcy50cmFuc2llbnRQYXJ0aWNsZXNCYWNrdXAuY2xlYXIoKTtcclxuICAgIHN1cGVyLmNsZWFySGlzdG9yeSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnRzIGEgcGFydGljbGUgb2YgdGhlIHNwZWNpZmllZCB0eXBlIG1vdmluZyB0aHJvdWdoIHRoZSBzcGVjaWZpZWQgY2hhbm5lbC4gIElmIG9uZSBvciBtb3JlIHBhcnRpY2xlcyBvZiB0aGVcclxuICAgKiBuZWVkZWQgdHlwZSBleGlzdCB3aXRoaW4gdGhlIGNhcHR1cmUgem9uZSBmb3IgdGhpcyBjaGFubmVsLCBvbmUgd2lsbCBiZSBjaG9zZW4gYW5kIHNldCB0byBtb3ZlIHRocm91Z2gsIGFuZFxyXG4gICAqIGFub3RoZXIgd2lsbCBiZSBjcmVhdGVkIHRvIGVzc2VudGlhbGx5IHRha2UgaXRzIHBsYWNlICh0aG91Z2ggdGhlIG5ld2x5IGNyZWF0ZWQgb25lIHdpbGwgcHJvYmFibHkgYmUgaW4gYVxyXG4gICAqIHNsaWdodGx5IGRpZmZlcmVudCBwbGFjZSBmb3IgYmV0dGVyIHZpc3VhbCBlZmZlY3QpLiAgSWYgbm9uZSBvZiB0aGUgbmVlZGVkIHBhcnRpY2xlcyBleGlzdCwgdHdvIHdpbGwgYmUgY3JlYXRlZCxcclxuICAgKiBhbmQgb25lIHdpbGwgbW92ZSB0aHJvdWdoIHRoZSBjaGFubmVsIGFuZCB0aGUgb3RoZXIgd2lsbCBqdXN0IGhhbmcgb3V0IGluIHRoZSB6b25lLlxyXG4gICAqXHJcbiAgICogTm90ZSB0aGF0IGl0IGlzIG5vdCBndWFyYW50ZWVkIHRoYXQgdGhlIHBhcnRpY2xlIHdpbGwgbWFrZSBpdCB0aHJvdWdoIHRoZSBjaGFubmVsLCBzaW5jZSBpdCBpcyBwb3NzaWJsZSB0aGF0IHRoZVxyXG4gICAqIGNoYW5uZWwgY291bGQgY2xvc2UgYmVmb3JlIHRoZSBwYXJ0aWNsZSBnb2VzIHRocm91Z2ggaXQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlVHlwZS5zdHJpbmd9IHBhcnRpY2xlVHlwZVxyXG4gICAqIEBwYXJhbSB7TWVtYnJhbmVDaGFubmVsfWNoYW5uZWxcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4VmVsb2NpdHlcclxuICAgKiBAcGFyYW0ge01lbWJyYW5lQ3Jvc3NpbmdEaXJlY3Rpb24uc3RyaW5nfSBkaXJlY3Rpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVxdWVzdFBhcnRpY2xlVGhyb3VnaENoYW5uZWwoIHBhcnRpY2xlVHlwZSwgY2hhbm5lbCwgbWF4VmVsb2NpdHksIGRpcmVjdGlvbiApIHtcclxuICAgIGxldCBjYXB0dXJlWm9uZTtcclxuICAgIGlmICggZGlyZWN0aW9uID09PSBNZW1icmFuZUNyb3NzaW5nRGlyZWN0aW9uLklOX1RPX09VVCApIHtcclxuICAgICAgY2FwdHVyZVpvbmUgPSBjaGFubmVsLmdldEludGVyaW9yQ2FwdHVyZVpvbmUoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjYXB0dXJlWm9uZSA9IGNoYW5uZWwuZ2V0RXh0ZXJpb3JDYXB0dXJlWm9uZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcnRpY2xlVG9DYXB0dXJlID0gdGhpcy5jcmVhdGVUcmFuc2llbnRQYXJ0aWNsZSggcGFydGljbGVUeXBlLCBjYXB0dXJlWm9uZSApO1xyXG5cclxuICAgIC8vIE1ha2UgdGhlIHBhcnRpY2xlIGZhZGUgaW4uXHJcbiAgICBwYXJ0aWNsZVRvQ2FwdHVyZS5zZXRGYWRlU3RyYXRlZ3koIG5ldyBUaW1lZEZhZGVJblN0cmF0ZWd5KCAwLjAwMDUgKSApO1xyXG5cclxuICAgIC8vIFNldCBhIG1vdGlvbiBzdHJhdGVneSB0aGF0IHdpbGwgY2F1c2UgdGhpcyBwYXJ0aWNsZSB0byBtb3ZlIGFjcm9zcyB0aGUgbWVtYnJhbmUuXHJcbiAgICBjaGFubmVsLm1vdmVQYXJ0aWNsZVRocm91Z2hOZXVyb25NZW1icmFuZSggcGFydGljbGVUb0NhcHR1cmUsIG1heFZlbG9jaXR5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgc2ltdWxhdGlvbiBvZiBhbGwgaW9ucyBpcyBjdXJyZW50bHkgdHVybmVkIG9uIGluIHRoZSBzaW11bGF0aW9uLiAgQW5kIHllcywgaXRcclxuICAgKiB3b3VsZCBiZSBtb3JlIGdyYW1tYXRpY2FsbHkgY29ycmVjdCB0byBzZXQgXCJhcmVBbGxJb25zU2ltdWxhdGVkXCIsIGJ1dCB3ZSBhcmUgc3RpY2tpbmcgd2l0aCB0aGUgY29udmVudGlvbiBmb3JcclxuICAgKiBib29sZWFuIHZhcmlhYmxlcy4gIFNvIGdldCBvdmVyIGl0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpc0FsbElvbnNTaW11bGF0ZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hbGxJb25zU2ltdWxhdGVkUHJvcGVydHkuZ2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGJvb2xlYW4gdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBhbGwgaW9ucyBhcmUgc2hvd24gaW4gdGhlIHNpbXVsYXRpb24sIG9yIGp1c3QgdGhvc2UgdGhhdCBhcmUgbW92aW5nXHJcbiAgICogYWNyb3NzIHRoZSBtZW1icmFuZS5cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbElvbnNTaW11bGF0ZWRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0QWxsSW9uc1NpbXVsYXRlZCggYWxsSW9uc1NpbXVsYXRlZCApIHtcclxuICAgIHRoaXMuYWxsSW9uc1NpbXVsYXRlZFByb3BlcnR5LnNldCggYWxsSW9uc1NpbXVsYXRlZCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIHRoZSBcImJ1bGsgcGFydGljbGVzXCIsIHdoaWNoIGFyZSBwYXJ0aWNsZXMgdGhhdCBhcmUgaW5zaWRlIGFuZCBvdXRzaWRlIG9mIHRoZSBtZW1icmFuZSBhbmQsIGV4Y2VwdCBpbiBjYXNlc1xyXG4gICAqIHdoZXJlIHRoZXkgaGFwcGVuIHRvIGVuZCB1cCBwb3NpdGlvbmVkIGNsb3NlIHRvIHRoZSBtZW1icmFuZSwgdGhleSBnZW5lcmFsbHkgc3RheSB3aGVyZSBpbml0aWFsbHkgcG9zaXRpb25lZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFkZEluaXRpYWxCdWxrUGFydGljbGVzKCkge1xyXG4gICAgLy8gTWFrZSBhIGxpc3Qgb2YgcHJlLWV4aXN0aW5nIHBhcnRpY2xlcy5cclxuICAgIGNvbnN0IHByZUV4aXN0aW5nUGFydGljbGVzID0gXy5jbG9uZSggdGhpcy50cmFuc2llbnRQYXJ0aWNsZXMgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGluaXRpYWwgcGFydGljbGVzLlxyXG4gICAgdGhpcy5hZGRCYWNrZ3JvdW5kUGFydGljbGVzKCBQYXJ0aWNsZVR5cGUuU09ESVVNX0lPTiwgUGFydGljbGVQb3NpdGlvbi5JTlNJREVfTUVNQlJBTkUsIE5VTV9TT0RJVU1fSU9OU19JTlNJREVfQ0VMTCApO1xyXG4gICAgdGhpcy5hZGRCYWNrZ3JvdW5kUGFydGljbGVzKCBQYXJ0aWNsZVR5cGUuU09ESVVNX0lPTiwgUGFydGljbGVQb3NpdGlvbi5PVVRTSURFX01FTUJSQU5FLCBOVU1fU09ESVVNX0lPTlNfT1VUU0lERV9DRUxMICk7XHJcbiAgICB0aGlzLmFkZEJhY2tncm91bmRQYXJ0aWNsZXMoIFBhcnRpY2xlVHlwZS5QT1RBU1NJVU1fSU9OLCBQYXJ0aWNsZVBvc2l0aW9uLklOU0lERV9NRU1CUkFORSwgTlVNX1BPVEFTU0lVTV9JT05TX0lOU0lERV9DRUxMICk7XHJcbiAgICB0aGlzLmFkZEJhY2tncm91bmRQYXJ0aWNsZXMoIFBhcnRpY2xlVHlwZS5QT1RBU1NJVU1fSU9OLCBQYXJ0aWNsZVBvc2l0aW9uLk9VVFNJREVfTUVNQlJBTkUsIE5VTV9QT1RBU1NJVU1fSU9OU19PVVRTSURFX0NFTEwgKTtcclxuXHJcbiAgICAvLyBMb29rIGF0IGVhY2ggc29kaXVtIGdhdGUgYW5kLCBpZiB0aGVyZSBhcmUgbm8gaW9ucyBpbiBpdHMgY2FwdHVyZSB6b25lLCBhZGQgc29tZS5cclxuICAgIHRoaXMubWVtYnJhbmVDaGFubmVscy5mb3JFYWNoKCBtZW1icmFuZUNoYW5uZWwgPT4ge1xyXG4gICAgICBpZiAoIG1lbWJyYW5lQ2hhbm5lbCBpbnN0YW5jZW9mIFNvZGl1bUR1YWxHYXRlZENoYW5uZWwgKSB7XHJcbiAgICAgICAgY29uc3QgY2FwdHVyZVpvbmUgPSBtZW1icmFuZUNoYW5uZWwuZ2V0RXh0ZXJpb3JDYXB0dXJlWm9uZSgpO1xyXG4gICAgICAgIGNvbnN0IG51bVBhcnRpY2xlc0luWm9uZSA9IHRoaXMuc2NhbkNhcHR1cmVab25lRm9yRnJlZVBhcnRpY2xlcyggY2FwdHVyZVpvbmUsIFBhcnRpY2xlVHlwZS5TT0RJVU1fSU9OICk7XHJcbiAgICAgICAgaWYgKCBudW1QYXJ0aWNsZXNJblpvbmUgPT09IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLmFkZEJhY2tncm91bmRQYXJ0aWNsZXNUb1pvbmUoIFBhcnRpY2xlVHlwZS5TT0RJVU1fSU9OLCBjYXB0dXJlWm9uZSwgTWF0aC5mbG9vciggZG90UmFuZG9tLm5leHREb3VibGUoKSAqIDIgKSArIDEgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZXQgYWxsIG5ldyBwYXJ0aWNsZXMgdG8gZXhoaWJpdCBzaW1wbGUgQnJvd25pYW4gbW90aW9uLlxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kUGFydGljbGVzLmZvckVhY2goIGJhY2tncm91bmRQYXJ0aWNsZSA9PiB7XHJcbiAgICAgIGlmICggcHJlRXhpc3RpbmdQYXJ0aWNsZXMuaW5kZXhPZiggYmFja2dyb3VuZFBhcnRpY2xlICkgPT09IC0xICkge1xyXG4gICAgICAgIGJhY2tncm91bmRQYXJ0aWNsZS5zZXRNb3Rpb25TdHJhdGVneSggbmV3IFNsb3dCcm93bmlhbk1vdGlvblN0cmF0ZWd5KCBiYWNrZ3JvdW5kUGFydGljbGUuZ2V0UG9zaXRpb25YKCksIGJhY2tncm91bmRQYXJ0aWNsZS5nZXRQb3NpdGlvblkoKSApICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIHBhcnRpY2xlIG9mIHRoZSBzcGVjaWZpZWQgdHlwZSBpbiB0aGUgc3BlY2lmaWVkIGNhcHR1cmUgem9uZS4gSW4gZ2VuZXJhbCwgdGhpcyBtZXRob2Qgd2lsbCBiZSB1c2VkIHdoZW5cclxuICAgKiBhIHBhcnRpY2xlIGlzIG9yIG1heSBzb29uIGJlIG5lZWRlZCB0byB0cmF2ZWwgdGhyb3VnaCBhIG1lbWJyYW5lIGNoYW5uZWwuXHJcbiAgICogQHBhcmFtIHtQYXJ0aWNsZVR5cGUuc3RyaW5nfSBwYXJ0aWNsZVR5cGVcclxuICAgKiBAcGFyYW0ge0NhcHR1cmVab25lfSBjYXB0dXJlWm9uZVxyXG4gICAqIEByZXR1cm5zIHtQYXJ0aWNsZX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNyZWF0ZVRyYW5zaWVudFBhcnRpY2xlKCBwYXJ0aWNsZVR5cGUsIGNhcHR1cmVab25lICkge1xyXG4gICAgY29uc3QgbmV3UGFydGljbGUgPSBQYXJ0aWNsZUZhY3RvcnkuY3JlYXRlUGFydGljbGUoIHBhcnRpY2xlVHlwZSApO1xyXG4gICAgdGhpcy50cmFuc2llbnRQYXJ0aWNsZXMuYWRkKCBuZXdQYXJ0aWNsZSApO1xyXG4gICAgaWYgKCBjYXB0dXJlWm9uZSApIHtcclxuXHJcbiAgICAgIC8vIHRvIGF2b2lkIGNyZWF0aW9uIG9mIG5ldyBWZWN0b3IyIGluc3RhbmNlcyB0aGUgY2FwdHVyZSB6b25lIHVwZGF0ZXMgdGhlIHBhcnRpY2xlcyBwb3NpdGlvblxyXG4gICAgICBjYXB0dXJlWm9uZS5hc3NpZ25OZXdQYXJ0aWNsZVBvc2l0aW9uKCBuZXdQYXJ0aWNsZSApO1xyXG4gICAgfVxyXG4gICAgbmV3UGFydGljbGUuY29udGludWVFeGlzdGluZ1Byb3BlcnR5LmxhenlMaW5rKCBuZXdWYWx1ZSA9PiB7XHJcbiAgICAgIGlmICggIW5ld1ZhbHVlICkge1xyXG4gICAgICAgIHRoaXMudHJhbnNpZW50UGFydGljbGVzLnJlbW92ZSggbmV3UGFydGljbGUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG5ld1BhcnRpY2xlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIHRoZSBzcGVjaWZpZWQgcGFydGljbGVzIHRvIHRoZSBtb2RlbC5cclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlVHlwZS5zdHJpbmd9IHBhcnRpY2xlVHlwZVxyXG4gICAqIEBwYXJhbSB7UGFydGljbGVQb3NpdGlvbn0gcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyVG9BZGRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFkZEJhY2tncm91bmRQYXJ0aWNsZXMoIHBhcnRpY2xlVHlwZSwgcG9zaXRpb24sIG51bWJlclRvQWRkICkge1xyXG4gICAgbGV0IG5ld1BhcnRpY2xlID0gbnVsbDtcclxuICAgIF8udGltZXMoIG51bWJlclRvQWRkLCB2YWx1ZSA9PiB7XHJcbiAgICAgIG5ld1BhcnRpY2xlID0gdGhpcy5jcmVhdGVCYWNrZ3JvdW5kUGFydGljbGUoIHBhcnRpY2xlVHlwZSApO1xyXG4gICAgICBpZiAoIHBvc2l0aW9uID09PSBQYXJ0aWNsZVBvc2l0aW9uLklOU0lERV9NRU1CUkFORSApIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uUGFydGljbGVJbnNpZGVNZW1icmFuZSggbmV3UGFydGljbGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uUGFydGljbGVPdXRzaWRlTWVtYnJhbmUoIG5ld1BhcnRpY2xlICk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gU2V0IHRoZSBvcGFjaXR5LlxyXG4gICAgICBpZiAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPj0gMC41ICkgeyAvLyByZXBsYWNlZCBmb3IgbmV4dEJvb2xlYW5cclxuICAgICAgICBuZXdQYXJ0aWNsZS5zZXRPcGFjaXR5KCBGT1JFR1JPVU5EX1BBUlRJQ0xFX0RFRkFVTFRfT1BBQ0lUWSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG5ld1BhcnRpY2xlLnNldE9wYWNpdHkoIEJBQ0tHUk9VTkRfUEFSVElDTEVfREVGQVVMVF9PUEFDSVRZICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB0aGUgc3BlY2lmaWVkIHBhcnRpY2xlcyB0byB0aGUgZ2l2ZW4gY2FwdHVyZSB6b25lLlxyXG4gICAqIEBwYXJhbSB7UGFydGljbGVUeXBlLnN0cmluZ30gcGFydGljbGVUeXBlXHJcbiAgICogQHBhcmFtIHtDYXB0dXJlWm9uZX0gY2FwdHVyZVpvbmVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyVG9BZGRcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFkZEJhY2tncm91bmRQYXJ0aWNsZXNUb1pvbmUoIHBhcnRpY2xlVHlwZSwgY2FwdHVyZVpvbmUsIG51bWJlclRvQWRkICkge1xyXG4gICAgbGV0IG5ld1BhcnRpY2xlID0gbnVsbDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlclRvQWRkOyBpKysgKSB7XHJcbiAgICAgIG5ld1BhcnRpY2xlID0gdGhpcy5jcmVhdGVCYWNrZ3JvdW5kUGFydGljbGUoIHBhcnRpY2xlVHlwZSApO1xyXG4gICAgICBuZXdQYXJ0aWNsZS5zZXRPcGFjaXR5KCBGT1JFR1JPVU5EX1BBUlRJQ0xFX0RFRkFVTFRfT1BBQ0lUWSApO1xyXG4gICAgICBjYXB0dXJlWm9uZS5hc3NpZ25OZXdQYXJ0aWNsZVBvc2l0aW9uKCBuZXdQYXJ0aWNsZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGluaXRpYXRlU3RpbXVsdXNQdWxzZSgpIHtcclxuICAgIGlmICggIXRoaXMuaXNTdGltdWx1c0luaXRpYXRpb25Mb2NrZWRPdXQoKSApIHtcclxuICAgICAgdGhpcy5zdGltdWx1c1B1bHNlSW5pdGlhdGVkUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICAgIHRoaXMuYXhvbk1lbWJyYW5lLmluaXRpYXRlVHJhdmVsaW5nQWN0aW9uUG90ZW50aWFsKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlU3RpbXVsdXNMb2Nrb3V0U3RhdGUoKTtcclxuICAgICAgaWYgKCB3aW5kb3cucGhldC5uZXVyb24ucHJvZmlsZXIgJiYgd2luZG93LnBoZXQubmV1cm9uLnByb2ZpbGVyLnNldHRpbmcgPT09IDIgKSB7XHJcbiAgICAgICAgLy8gSWYgZW5hYmxlZCwgc3RhcnQgY29sbGVjdGluZyBwcm9maWxpbmcgZGF0YSwgd2hpY2ggd2lsbCBhdXRvbWF0aWNhbGx5IGJlIHNwYXQgb3V0IHRvIHRoZSBjb25zb2xlIChvciBhc1xyXG4gICAgICAgIC8vIGFuIGFsZXJ0IGRpYWxvZyBvbiBpT1MpIHdoZW4gY29tcGxldGVkLiAgVGhlIGR1cmF0aW9uIHZhbHVlIGlzIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gYmUgdGhlIHRpbWUgZm9yXHJcbiAgICAgICAgLy8gdGhlIHRyYXZlbGluZyBhY3Rpb24gcG90ZW50aWFsIHRvIG1ha2UgaXQgdG8gdGhlIGNyb3NzIHNlY3Rpb24uXHJcbiAgICAgICAgd2luZG93LnBoZXQubmV1cm9uLnByb2ZpbGVyLnN0YXJ0RGF0YUFuYWx5c2lzKCAzMDAwICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHdpbmRvdy5waGV0Lm5ldXJvbi5wcm9maWxlciAmJiB3aW5kb3cucGhldC5uZXVyb24ucHJvZmlsZXIuc2V0dGluZyA9PT0gMyApIHtcclxuICAgICAgICAvLyBJZiBlbmFibGVkLCBzdGFydCBjb2xsZWN0aW5nIHByb2ZpbGluZyBkYXRhLCB3aGljaCB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgc3BhdCBvdXQgdG8gdGhlIGNvbnNvbGUgKG9yIGFzXHJcbiAgICAgICAgLy8gYW4gYWxlcnQgZGlhbG9nIG9uIGlPUykgd2hlbiBjb21wbGV0ZWQuICBUaGUgZHVyYXRpb24gdmFsdWUgaXMgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBiZSB0aGUgdGltZSBmb3JcclxuICAgICAgICAvLyB0aGUgdHJhdmVsaW5nIGFjdGlvbiBwb3RlbnRpYWwgdG8gbWFrZSBpdCB0byB0aGUgY3Jvc3Mgc2VjdGlvbiwgdGhlIHBhcnRpY2xlcyB0byBhcHBlYXIsIGNyb3NzIHRoZVxyXG4gICAgICAgIC8vIG1lbWJyYW5lLCBhbmQgdGhlbiBmYWRlIG91dC5cclxuICAgICAgICB3aW5kb3cucGhldC5uZXVyb24ucHJvZmlsZXIuc3RhcnREYXRhQW5hbHlzaXMoIDk1MDAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGxhY2UgYSBwYXJ0aWNsZSBhdCBhIHJhbmRvbSBwb3NpdGlvbiBpbnNpZGUgdGhlIGF4b24gbWVtYnJhbmUuXHJcbiAgICogQHBhcmFtIHtQYXJ0aWNsZX0gcGFydGljbGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHBvc2l0aW9uUGFydGljbGVJbnNpZGVNZW1icmFuZSggcGFydGljbGUgKSB7XHJcbiAgICAvLyBDaG9vc2UgYW55IGFuZ2xlLlxyXG4gICAgY29uc3QgYW5nbGUgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogTWF0aC5QSSAqIDI7XHJcblxyXG4gICAgLy8gQ2hvb3NlIGEgZGlzdGFuY2UgZnJvbSB0aGUgY2VsbCBjZW50ZXIgdGhhdCBpcyB3aXRoaW4gdGhlIG1lbWJyYW5lLiBUaGUgbXVsdGlwbGllciB2YWx1ZSBpcyBjcmVhdGVkIHdpdGggdGhlXHJcbiAgICAvLyBpbnRlbnRpb24gb2Ygd2VpZ2h0aW5nIHRoZSBwb3NpdGlvbnMgdG93YXJkIHRoZSBvdXRzaWRlIGluIG9yZGVyIHRvIGdldCBhbiBldmVuIGRpc3RyaWJ1dGlvbiBwZXIgdW5pdCBhcmVhLlxyXG4gICAgY29uc3QgbXVsdGlwbGllciA9IE1hdGgubWF4KCBkb3RSYW5kb20ubmV4dERvdWJsZSgpLCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICk7XHJcbiAgICBjb25zdCBkaXN0YW5jZSA9ICggdGhpcy5jcm9zc1NlY3Rpb25Jbm5lclJhZGl1cyAtIHBhcnRpY2xlLmdldFJhZGl1cygpICogMiApICogbXVsdGlwbGllcjtcclxuICAgIHBhcnRpY2xlLnNldFBvc2l0aW9uKCBkaXN0YW5jZSAqIE1hdGguY29zKCBhbmdsZSApLCBkaXN0YW5jZSAqIE1hdGguc2luKCBhbmdsZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiB2YWx1ZXMgaW5kaWNhdGluZyB3aGV0aGVyIG9yIG5vdCBhbiBhY3Rpb24gcG90ZW50aWFsIGlzIGluIHByb2dyZXNzLiAgRm9yIHRoZSBwdXJwb3NlcyBvZiB0aGlzXHJcbiAgICogc2ltLCB0aGlzIG1lYW5zIHdoZXRoZXIgdGhlcmUgaXMgYW4gQVAgdHJhdmVsaW5nIGRvd24gdGhlIG1lbWJyYW5lIG9yIGlmIHRoZSBmbG93IG9mIGlvbnMgdGhyb3VnaCB0aGUgY2hhbm5lbHMgYXRcclxuICAgKiB0aGUgdHJhbnN2ZXJzZSBjcm9zcyBzZWN0aW9uIGlzIGVub3VnaCB0byBiZSBjb25zaWRlcmVkIHBhcnQgb2YgYW4gQVAuXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzQWN0aW9uUG90ZW50aWFsSW5Qcm9ncmVzcygpIHtcclxuICAgIHJldHVybiB0aGlzLmF4b25NZW1icmFuZS5nZXRUcmF2ZWxpbmdBY3Rpb25Qb3RlbnRpYWwoKSB8fFxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLmhvZGdraW5IdXhsZXlNb2RlbC5nZXRfa19jdXJyZW50KCkgKSA+IFBPVEFTU0lVTV9DVVJSRU5UX1RIUkVTSF9GT1JfQUNUSU9OX1BPVEVOVElBTCB8fFxyXG4gICAgICAgICAgIE1hdGguYWJzKCB0aGlzLmhvZGdraW5IdXhsZXlNb2RlbC5nZXRfbmFfY3VycmVudCgpICkgPiBTT0RJVU1fQ1VSUkVOVF9USFJFU0hfRk9SX0FDVElPTl9QT1RFTlRJQUwgfHxcclxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5ob2Rna2luSHV4bGV5TW9kZWwuZ2V0X2xfY3VycmVudCgpICkgPiBMRUFLQUdFX0NVUlJFTlRfVEhSRVNIX0ZPUl9BQ1RJT05fUE9URU5USUFMO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGxhY2UgYSBwYXJ0aWNsZSBhdCBhIHJhbmRvbSBwb3NpdGlvbiBvdXRzaWRlIHRoZSBheG9uIG1lbWJyYW5lLlxyXG4gICAqIEBwYXJhbSB7UGFydGljbGV9IHBhcnRpY2xlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBwb3NpdGlvblBhcnRpY2xlT3V0c2lkZU1lbWJyYW5lKCBwYXJ0aWNsZSApIHtcclxuXHJcbiAgICAvLyBDaG9vc2UgYW55IGFuZ2xlLlxyXG4gICAgY29uc3QgYW5nbGUgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogTWF0aC5QSSAqIDI7XHJcblxyXG4gICAgLy8gQ2hvb3NlIGEgZGlzdGFuY2UgZnJvbSB0aGUgY2VsbCBjZW50ZXIgdGhhdCBpcyBvdXRzaWRlIG9mIHRoZVxyXG4gICAgLy8gbWVtYnJhbmUuIFRoZSBtdWx0aXBsaWVyIHZhbHVlIGlzIGNyZWF0ZWQgd2l0aCB0aGUgaW50ZW50aW9uIG9mXHJcbiAgICAvLyB3ZWlnaHRpbmcgdGhlIHBvc2l0aW9ucyB0b3dhcmQgdGhlIG91dHNpZGUgaW4gb3JkZXIgdG8gZ2V0IGFuIGV2ZW5cclxuICAgIC8vIGRpc3RyaWJ1dGlvbiBwZXIgdW5pdCBhcmVhLlxyXG4gICAgY29uc3QgbXVsdGlwbGllciA9IGRvdFJhbmRvbS5uZXh0RG91YmxlKCk7XHJcbiAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuY3Jvc3NTZWN0aW9uT3V0ZXJSYWRpdXMgKyBwYXJ0aWNsZS5nZXRSYWRpdXMoKSAqIDQgK1xyXG4gICAgICAgICAgICAgICAgICAgICBtdWx0aXBsaWVyICogdGhpcy5jcm9zc1NlY3Rpb25PdXRlclJhZGl1cyAqIDIuMjtcclxuXHJcbiAgICBwYXJ0aWNsZS5zZXRQb3NpdGlvbiggZGlzdGFuY2UgKiBNYXRoLmNvcyggYW5nbGUgKSwgZGlzdGFuY2UgKiBNYXRoLnNpbiggYW5nbGUgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2NhbiB0aGUgc3VwcGxpZWQgY2FwdHVyZSB6b25lIGZvciBwYXJ0aWNsZXMgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxyXG4gICAqIEBwYXJhbSB7Q2FwdHVyZVpvbmV9IHpvbmVcclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlVHlwZS5zdHJpbmd9IHBhcnRpY2xlVHlwZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzY2FuQ2FwdHVyZVpvbmVGb3JGcmVlUGFydGljbGVzKCB6b25lLCBwYXJ0aWNsZVR5cGUgKSB7XHJcbiAgICBsZXQgY2xvc2VzdEZyZWVQYXJ0aWNsZSA9IG51bGw7XHJcbiAgICBsZXQgZGlzdGFuY2VPZkNsb3Nlc3RQYXJ0aWNsZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGxldCB0b3RhbE51bWJlck9mUGFydGljbGVzID0gMDtcclxuICAgIGNvbnN0IGNhcHR1cmVab25lT3JpZ2luID0gem9uZS5nZXRPcmlnaW5Qb2ludCgpO1xyXG5cclxuICAgIC8vIGxvb3Agb3ZlciB0aGUgY29udGFpbmVkIGFycmF5IC0gdGhpcyBpcyBmYXN0ZXIsIGJ1dCB0aGUgYXJyYXkgY2FuJ3QgYmUgbW9kaWZpZWRcclxuICAgIHRoaXMudHJhbnNpZW50UGFydGljbGVzLmZvckVhY2goIHBhcnRpY2xlID0+IHtcclxuXHJcbiAgICAgIC8vIFRoaXMgbWV0aG9kIGlzIHJlZmFjdG9yZWQgdG8gdXNlIHBvc2l0aW9uIHgseSBjb21wb25lbnRzIGluc3RlYWQgb2YgdmVjdG9yMiBpbnN0YW5jZXNcclxuICAgICAgaWYgKCAoIHBhcnRpY2xlLmdldFR5cGUoKSA9PT0gcGFydGljbGVUeXBlICkgJiYgKCBwYXJ0aWNsZS5pc0F2YWlsYWJsZUZvckNhcHR1cmUoKSApICYmICggem9uZS5pc1BvaW50SW5ab25lKCBwYXJ0aWNsZS5nZXRQb3NpdGlvblgoKSwgcGFydGljbGUuZ2V0UG9zaXRpb25ZKCkgKSApICkge1xyXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZQYXJ0aWNsZXMrKztcclxuICAgICAgICBpZiAoIGNsb3Nlc3RGcmVlUGFydGljbGUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgICBjbG9zZXN0RnJlZVBhcnRpY2xlID0gcGFydGljbGU7XHJcbiAgICAgICAgICBkaXN0YW5jZU9mQ2xvc2VzdFBhcnRpY2xlID0gTWF0aFV0aWxzLmRpc3RhbmNlQmV0d2VlbiggY2FwdHVyZVpvbmVPcmlnaW4ueCwgY2FwdHVyZVpvbmVPcmlnaW4ueSwgY2xvc2VzdEZyZWVQYXJ0aWNsZS5nZXRQb3NpdGlvblgoKSwgY2xvc2VzdEZyZWVQYXJ0aWNsZS5nZXRQb3NpdGlvblkoKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggTWF0aFV0aWxzLmRpc3RhbmNlQmV0d2VlbiggY2FwdHVyZVpvbmVPcmlnaW4ueCwgY2FwdHVyZVpvbmVPcmlnaW4ueSwgY2xvc2VzdEZyZWVQYXJ0aWNsZS5nZXRQb3NpdGlvblgoKSwgY2xvc2VzdEZyZWVQYXJ0aWNsZS5nZXRQb3NpdGlvblkoKSApIDwgZGlzdGFuY2VPZkNsb3Nlc3RQYXJ0aWNsZSApIHtcclxuICAgICAgICAgIGNsb3Nlc3RGcmVlUGFydGljbGUgPSBwYXJ0aWNsZTtcclxuICAgICAgICAgIGRpc3RhbmNlT2ZDbG9zZXN0UGFydGljbGUgPSBNYXRoVXRpbHMuZGlzdGFuY2VCZXR3ZWVuKCBjYXB0dXJlWm9uZU9yaWdpbi54LCBjYXB0dXJlWm9uZU9yaWdpbi55LCBjbG9zZXN0RnJlZVBhcnRpY2xlLmdldFBvc2l0aW9uWCgpLCBjbG9zZXN0RnJlZVBhcnRpY2xlLmdldFBvc2l0aW9uWSgpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gdG90YWxOdW1iZXJPZlBhcnRpY2xlcztcclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgdXBkYXRlU3RpbXVsdXNMb2Nrb3V0U3RhdGUoKSB7XHJcbiAgICBpZiAoIHRoaXMuc3RpbXVsdXNMb2Nrb3V0UHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIC8vIEN1cnJlbnRseSBsb2NrZWQgb3V0LCBzZWUgaWYgdGhhdCBzaG91bGQgY2hhbmdlLlxyXG4gICAgICBpZiAoICF0aGlzLmlzUGxheWJhY2soKSAmJiAhdGhpcy5pc0FjdGlvblBvdGVudGlhbEluUHJvZ3Jlc3MoKSApIHtcclxuICAgICAgICB0aGlzLnNldFN0aW11bHVzTG9ja291dCggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIEN1cnJlbnRseSBsb2NrZWQgb3V0LCBzZWUgaWYgdGhhdCBzaG91bGQgY2hhbmdlLlxyXG4gICAgICAvLyBDdXJyZW50bHkgTk9UIGxvY2tlZCBvdXQsIHNlZSBpZiB0aGF0IHNob3VsZCBjaGFuZ2UuXHJcbiAgICAgIGNvbnN0IGJhY2t3YXJkcyA9IHRoaXMuZ2V0VGltZSgpIC0gdGhpcy5nZXRNYXhSZWNvcmRlZFRpbWUoKSA8PSAwO1xyXG4gICAgICBpZiAoIHRoaXMuaXNBY3Rpb25Qb3RlbnRpYWxJblByb2dyZXNzKCkgfHwgKCB0aGlzLmlzUGxheWJhY2soKSAmJiBiYWNrd2FyZHMgKSApIHtcclxuICAgICAgICB0aGlzLnNldFN0aW11bHVzTG9ja291dCggdHJ1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGVyZSBhcmUgdHdvIHNldHMgb2YgcGFydGljbGVzIGluIHRoaXMgc2ltdWxhdGlvbiwgb25lIHNldCB0aGF0IGlzIHVzZWQgd2hlbiBhY3R1YWxseSBzaW11bGF0aW5nLCBhbmQgb25lIHRoYXRcclxuICAgKiBpcyB1c2VkIHdoZW4gcGxheWluZyBiYWNrLiAgVGhpcyByb3V0aW5lIHVwZGF0ZXMgd2hpY2ggc2V0IGlzIHZpc2libGUgYmFzZWQgb24gc3RhdGUgaW5mb3JtYXRpb24uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVTaW1BbmRQbGF5YmFja1BhcnRpY2xlVmlzaWJpbGl0eSgpIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNSZWNvcmQoKSB8fCB0aGlzLmlzTGl2ZSgpICkge1xyXG5cclxuICAgICAgLy8gSW4gZWl0aGVyIG9mIHRoZXNlIG1vZGVzLCB0aGUgc2ltdWxhdGlvbiBwYXJ0aWNsZXMgKGFzIG9wcG9zZWQgdG8gdGhlIHBsYXliYWNrIHBhcnRpY2xlcykgc2hvdWxkIGJlIHZpc2libGUuXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRoaXMgaXMgdGhlIGNhc2UuXHJcbiAgICAgIGlmICggdGhpcy5wbGF5YmFja1BhcnRpY2xlc1Zpc2libGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgLy8gSGlkZSB0aGUgcGxheWJhY2sgcGFydGljbGVzLiAgVGhpcyBpcyBkb25lIGJ5IHJlbW92aW5nIHRoZW0gZnJvbSB0aGUgbW9kZWwuXHJcbiAgICAgICAgdGhpcy5wbGF5YmFja1BhcnRpY2xlcy5jbGVhcigpO1xyXG5cclxuICAgICAgICAvLyBTaG93IHRoZSBzaW11bGF0aW9uIHBhcnRpY2xlcy5cclxuICAgICAgICB0aGlzLnRyYW5zaWVudFBhcnRpY2xlcy5hZGRBbGwoIHRoaXMudHJhbnNpZW50UGFydGljbGVzQmFja3VwLnNsaWNlKCkgKTtcclxuICAgICAgICB0aGlzLnRyYW5zaWVudFBhcnRpY2xlc0JhY2t1cC5jbGVhcigpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIHN0YXRlIHZhcmlhYmxlLlxyXG4gICAgICAgIHRoaXMucGxheWJhY2tQYXJ0aWNsZXNWaXNpYmxlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5pc1BsYXliYWNrKCkgKSB7XHJcblxyXG4gICAgICAvLyBUaGUgcGxheWJhY2sgcGFydGljbGVzIHNob3VsZCBiZSBzaG93aW5nIGFuZCB0aGUgc2ltdWxhdGlvbiBwYXJ0aWNsZXMgc2hvdWxkIGJlIGhpZGRlbi4gIE1ha2Ugc3VyZSB0aGF0IHRoaXNcclxuICAgICAgLy8gaXMgdGhlIGNhc2UuXHJcbiAgICAgIGlmICggIXRoaXMucGxheWJhY2tQYXJ0aWNsZXNWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgdGhlIHNpbXVsYXRpb24gcGFydGljbGVzLiAgVGhpcyBpcyBkb25lIGJ5IG1ha2luZyBhIGJhY2t1cCBjb3B5IG9mIHRoZW0gKHNvIHRoYXQgdGhleSBjYW4gYmUgYWRkZWRcclxuICAgICAgICAvLyBiYWNrIGxhdGVyKSBhbmQgdGhlbiByZW1vdmluZyB0aGVtIGZyb20gdGhlIG1vZGVsLlxyXG4gICAgICAgIHRoaXMudHJhbnNpZW50UGFydGljbGVzQmFja3VwLmFkZEFsbCggdGhpcy50cmFuc2llbnRQYXJ0aWNsZXMgKTtcclxuICAgICAgICB0aGlzLnRyYW5zaWVudFBhcnRpY2xlcy5jbGVhcigpO1xyXG5cclxuICAgICAgICAvLyBOb3RlIHRoYXQgd2UgZG9uJ3QgZXhwbGljaXRseSBhZGQgdGhlIHBsYXliYWNrIHBhcnRpY2xlc1xyXG4gICAgICAgIC8vIGhlcmUuICBUaGF0IGlzIHRha2VuIGNhcmUgb2Ygd2hlbiB0aGUgcGxheWJhY2sgc3RhdGUgaXNcclxuICAgICAgICAvLyBzZXQuICBIZXJlIHdlIG9ubHkgc2V0IHRoZSBmbGFnLlxyXG4gICAgICAgIHRoaXMucGxheWJhY2tQYXJ0aWNsZXNWaXNpYmxlUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRyaWdnZXIgdGhlIGV2ZW50IHRoYXQgbGV0cyB0aGUgdmlldyBrbm93IHRoYXQgdGhlIHBhcnRpY2xlcyBzaG91bGQgYmUgcmVkcmF3bi5cclxuICAgICAgdGhpcy5wYXJ0aWNsZXNNb3ZlZC5lbWl0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZWxzZSBpZ25vcmUgdGhlIHN0YXRlLCB3aGljaCBpcyBudWxsIGR1cmluZyBpbml0IGFuZCByZXNldFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBzdGF0ZSBvZiB0aGlzIG1vZGVsLiAgVGhpcyBpcyBnZW5lcmFsbHkgdXNlZCBpbiBzdXBwb3J0IG9mIHRoZSByZWNvcmQtYW5kLXBsYXliYWNrIGZlYXR1cmUsIGFuZCB0aGVcclxuICAgKiByZXR1cm4gdmFsdWUgY29udGFpbnMganVzdCBlbm91Z2ggc3RhdGUgaW5mb3JtYXRpb24gdG8gc3VwcG9ydCB0aGlzIGZlYXR1cmUuXHJcbiAgICogQHJldHVybnMge05ldXJvbk1vZGVsU3RhdGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFN0YXRlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBOZXVyb25Nb2RlbFN0YXRlKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7QXhvbk1lbWJyYW5lfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRBeG9uTWVtYnJhbmUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5heG9uTWVtYnJhbmU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRTb2RpdW1JbnRlcmlvckNvbmNlbnRyYXRpb24oKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNQbGF5YmFjaygpICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5uZXVyb25Nb2RlbFBsYXliYWNrU3RhdGVQcm9wZXJ0eS5nZXQoKS5nZXRTb2RpdW1JbnRlcmlvckNvbmNlbnRyYXRpb24oKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5zb2RpdW1JbnRlcmlvckNvbmNlbnRyYXRpb247XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRTb2RpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24oKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNQbGF5YmFjaygpICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5uZXVyb25Nb2RlbFBsYXliYWNrU3RhdGVQcm9wZXJ0eS5nZXQoKS5nZXRTb2RpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24oKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5zb2RpdW1FeHRlcmlvckNvbmNlbnRyYXRpb247XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRQb3Rhc3NpdW1JbnRlcmlvckNvbmNlbnRyYXRpb24oKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNQbGF5YmFjaygpICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5uZXVyb25Nb2RlbFBsYXliYWNrU3RhdGVQcm9wZXJ0eS5nZXQoKS5nZXRQb3Rhc3NpdW1JbnRlcmlvckNvbmNlbnRyYXRpb24oKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5wb3Rhc3NpdW1JbnRlcmlvckNvbmNlbnRyYXRpb247XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRQb3Rhc3NpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24oKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNQbGF5YmFjaygpICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5uZXVyb25Nb2RlbFBsYXliYWNrU3RhdGVQcm9wZXJ0eS5nZXQoKS5nZXRQb3Rhc3NpdW1FeHRlcmlvckNvbmNlbnRyYXRpb24oKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5wb3Rhc3NpdW1FeHRlcmlvckNvbmNlbnRyYXRpb247XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBwYXJ0aWNsZSBvZiB0aGUgc3BlY2lmaWVkIHR5cGUgYW5kIGFkZCBpdCB0byB0aGUgbW9kZWwuXHJcbiAgICogQHBhcmFtIHtQYXJ0aWNsZVR5cGUuc3RyaW5nfSBwYXJ0aWNsZVR5cGVcclxuICAgKiBAcmV0dXJucyB7UGFydGljbGV9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjcmVhdGVCYWNrZ3JvdW5kUGFydGljbGUoIHBhcnRpY2xlVHlwZSApIHtcclxuICAgIGNvbnN0IG5ld1BhcnRpY2xlID0gUGFydGljbGVGYWN0b3J5LmNyZWF0ZVBhcnRpY2xlKCBwYXJ0aWNsZVR5cGUgKTtcclxuICAgIHRoaXMuYmFja2dyb3VuZFBhcnRpY2xlcy5hZGQoIG5ld1BhcnRpY2xlICk7XHJcbiAgICBuZXdQYXJ0aWNsZS5jb250aW51ZUV4aXN0aW5nUHJvcGVydHkubGF6eUxpbmsoIG5ld1ZhbHVlID0+IHtcclxuICAgICAgaWYgKCBuZXdWYWx1ZSA9PT0gZmFsc2UgKSB7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kUGFydGljbGVzLnJlbW92ZSggbmV3UGFydGljbGUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIG5ld1BhcnRpY2xlO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICByZW1vdmVBbGxQYXJ0aWNsZXMoKSB7XHJcbiAgICB0aGlzLnRyYW5zaWVudFBhcnRpY2xlcy5jbGVhcigpO1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kUGFydGljbGVzLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgdGhlIHByb3ZpZGVkIGNoYW5uZWwgYXQgdGhlIHNwZWNpZmllZCByb3RhdGlvbmFsIHBvc2l0aW9uLiBQb3NpdGlvbnMgYXJlIHNwZWNpZmllZCBpbiB0ZXJtcyBvZiB3aGVyZSBvbiB0aGVcclxuICAgKiBjaXJjbGUgb2YgdGhlIG1lbWJyYW5lIHRoZXkgYXJlLCB3aXRoIGEgdmFsdWUgb2YgMCBiZWluZyBvbiB0aGUgZmFyIHJpZ2h0LCBQSS8yIG9uIHRoZSB0b3AsIFBJIG9uIHRoZSBmYXIgbGVmdCxcclxuICAgKiBldGMuXHJcbiAgICogQHBhcmFtIHtNZW1icmFuZUNoYW5uZWxUeXBlc30gbWVtYnJhbmVDaGFubmVsVHlwZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYWRkQ2hhbm5lbCggbWVtYnJhbmVDaGFubmVsVHlwZSwgYW5nbGUgKSB7XHJcbiAgICBjb25zdCBtZW1icmFuZUNoYW5uZWwgPSBNZW1icmFuZUNoYW5uZWxGYWN0b3J5LmNyZWF0ZU1lbWJyYW5lQ2hhbm5lbCggbWVtYnJhbmVDaGFubmVsVHlwZSwgdGhpcywgdGhpcy5ob2Rna2luSHV4bGV5TW9kZWwgKTtcclxuICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMuYXhvbk1lbWJyYW5lLmdldENyb3NzU2VjdGlvbkRpYW1ldGVyKCkgLyAyO1xyXG4gICAgY29uc3QgbmV3UG9zaXRpb24gPSBuZXcgVmVjdG9yMiggcmFkaXVzICogTWF0aC5jb3MoIGFuZ2xlICksIHJhZGl1cyAqIE1hdGguc2luKCBhbmdsZSApICk7XHJcblxyXG4gICAgLy8gUG9zaXRpb24gdGhlIGNoYW5uZWwgb24gdGhlIG1lbWJyYW5lLlxyXG4gICAgbWVtYnJhbmVDaGFubmVsLnNldFJvdGF0aW9uYWxBbmdsZSggYW5nbGUgKTtcclxuICAgIG1lbWJyYW5lQ2hhbm5lbC5zZXRDZW50ZXJQb3NpdGlvbiggbmV3UG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGNoYW5uZWwgYW5kIGxldCBldmVyeW9uZSBrbm93IGl0IGV4aXN0cy5cclxuICAgIHRoaXMubWVtYnJhbmVDaGFubmVscy5wdXNoKCBtZW1icmFuZUNoYW5uZWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGJvb2xlYW4gdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciB0aGUgaW5pdGlhdGlvbiBvZiBhIG5ldyBzdGltdWx1cyAoaS5lLiBhY3Rpb24gcG90ZW50aWFsKSBpcyBjdXJyZW50bHlcclxuICAgKiBsb2NrZWQgb3V0LiAgVGhpcyBpcyBkb25lIHRvIHByZXZlbnQgdGhlIHNpdHVhdGlvbiB3aGVyZSBtdWx0aXBsZSBhY3Rpb24gcG90ZW50aWFscyBhcmUgbW92aW5nIGRvd24gdGhlIG1lbWJyYW5lXHJcbiAgICogYXQgdGhlIHNhbWUgdGltZS5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaXNTdGltdWx1c0luaXRpYXRpb25Mb2NrZWRPdXQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGltdWx1c0xvY2tvdXRQcm9wZXJ0eS5nZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWaXNpYmxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFBvdGVudGlhbENoYXJ0VmlzaWJsZSggaXNWaXNpYmxlICkge1xyXG4gICAgdGhpcy5wb3RlbnRpYWxDaGFydFZpc2libGVQcm9wZXJ0eS5zZXQoIGlzVmlzaWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzQ29uY2VudHJhdGlvblJlYWRvdXRWaXNpYmxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uY2VudHJhdGlvblJlYWRvdXRWaXNpYmxlUHJvcGVydHkuZ2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzVmlzaWJsZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRDb25jZW50cmF0aW9uUmVhZG91dFZpc2libGUoIGlzVmlzaWJsZSApIHtcclxuICAgIHRoaXMuY29uY2VudHJhdGlvblJlYWRvdXRWaXNpYmxlUHJvcGVydHkuc2V0KCBpc1Zpc2libGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpc0NoYXJnZXNTaG93bigpIHtcclxuICAgIHJldHVybiB0aGlzLmNoYXJnZXNTaG93blByb3BlcnR5LmdldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBjaGFyZ2VzU2hvd25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0Q2hhcmdlc1Nob3duKCBjaGFyZ2VzU2hvd24gKSB7XHJcbiAgICB0aGlzLmNoYXJnZXNTaG93blByb3BlcnR5LnNldCggY2hhcmdlc1Nob3duICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaXNQb3RlbnRpYWxDaGFydFZpc2libGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wb3RlbnRpYWxDaGFydFZpc2libGVQcm9wZXJ0eS5nZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbG9ja291dFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2V0U3RpbXVsdXNMb2Nrb3V0KCBsb2Nrb3V0ICkge1xyXG4gICAgdGhpcy5zdGltdWx1c0xvY2tvdXRQcm9wZXJ0eS5zZXQoIGxvY2tvdXQgKTtcclxuICAgIGlmICggIWxvY2tvdXQgKSB7XHJcbiAgICAgIHRoaXMuc3RpbXVsdXNQdWxzZUluaXRpYXRlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1lbWJyYW5lUG90ZW50aWFsKCkge1xyXG4gICAgaWYgKCB0aGlzLmlzUGxheWJhY2soKSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMubmV1cm9uTW9kZWxQbGF5YmFja1N0YXRlUHJvcGVydHkuZ2V0KCkuZ2V0TWVtYnJhbmVQb3RlbnRpYWwoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5ob2Rna2luSHV4bGV5TW9kZWwuZ2V0TWVtYnJhbmVWb2x0YWdlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHBsYXliYWNrIHN0YXRlLCB3aGljaCBpcyB0aGUgc3RhdGUgdGhhdCBpcyBwcmVzZW50ZWQgdG8gdGhlIHVzZXIgZHVyaW5nIHBsYXliYWNrLiAgVGhlIHByb3ZpZGVkIHN0YXRlXHJcbiAgICogdmFyaWFibGUgZGVmaW5lcyB0aGUgc3RhdGUgb2YgdGhlIHNpbXVsYXRpb24gdGhhdCBpcyBiZWluZyBzZXQuXHJcbiAgICogQHBhcmFtIHtOZXVyb25Nb2RlbFN0YXRlfSBzdGF0ZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRQbGF5YmFja1N0YXRlKCBzdGF0ZSApIHtcclxuICAgIHRoaXMuY29uY2VudHJhdGlvbkNoYW5nZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBtZW1icmFuZSBjaGFubmVsIHN0YXRlLlxyXG4gICAgdGhpcy5heG9uTWVtYnJhbmUuc2V0U3RhdGUoIHN0YXRlLmdldEF4b25NZW1icmFuZVN0YXRlKCkgKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHN0YXRlIG9mIHRoZSBIb2Rna2luLUh1eGxleSBtb2RlbC5cclxuICAgIHRoaXMuaG9kZ2tpbkh1eGxleU1vZGVsLnNldFN0YXRlKCBzdGF0ZS5nZXRIb2Rna2luSHV4bGV5TW9kZWxTdGF0ZSgpICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBzdGF0ZXMgb2YgdGhlIG1lbWJyYW5lIGNoYW5uZWxzLlxyXG4gICAgdGhpcy5tZW1icmFuZUNoYW5uZWxzLmZvckVhY2goIG1lbWJyYW5lQ2hhbm5lbCA9PiB7XHJcbiAgICAgIGNvbnN0IG1jcyA9IHN0YXRlLmdldE1lbWJyYW5lQ2hhbm5lbFN0YXRlTWFwKCkuZ2V0KCBtZW1icmFuZUNoYW5uZWwgKTtcclxuICAgICAgLy8gRXJyb3IgaGFuZGxpbmcuXHJcbiAgICAgIGlmICggbWNzID09PSBudWxsICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnIE5ldXJvbk1vZGVsICBFcnJvcjogTm8gc3RhdGUgZm91bmQgZm9yIG1lbWJyYW5lIGNoYW5uZWwuJyApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAvLyBSZXN0b3JlIHRoZSBzdGF0ZS5cclxuICAgICAgbWVtYnJhbmVDaGFubmVsLnNldFN0YXRlKCBtY3MgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHN0YXRlIG9mIHRoZSBwbGF5YmFjayBwYXJ0aWNsZXMuICBUaGlzIG1hcHMgdGhlIHBhcnRpY2xlIG1lbWVudG9zIGluIHRvIHRoZSBwbGF5YmFjayBwYXJ0aWNsZXMgc28gdGhhdFxyXG4gICAgLy8gd2UgZG9uJ3QgaGF2ZSB0byBkZWxldGUgYW5kIGFkZCBiYWNrIGEgYnVuY2ggb2YgcGFydGljbGVzIGF0IGVhY2ggc3RlcC5cclxuICAgIGNvbnN0IGFkZGl0aW9uYWxQbGF5YmFja1BhcnRpY2xlc05lZWRlZCA9IHN0YXRlLmdldFBsYXliYWNrUGFydGljbGVNZW1lbnRvcygpLmxlbmd0aCAtIHRoaXMucGxheWJhY2tQYXJ0aWNsZXMubGVuZ3RoO1xyXG4gICAgaWYgKCBhZGRpdGlvbmFsUGxheWJhY2tQYXJ0aWNsZXNOZWVkZWQgPiAwICkge1xyXG4gICAgICBfLnRpbWVzKCBhZGRpdGlvbmFsUGxheWJhY2tQYXJ0aWNsZXNOZWVkZWQsICgpID0+IHtcclxuICAgICAgICBjb25zdCBuZXdQbGF5YmFja1BhcnRpY2xlID0gbmV3IFBsYXliYWNrUGFydGljbGUoKTtcclxuICAgICAgICB0aGlzLnBsYXliYWNrUGFydGljbGVzLnB1c2goIG5ld1BsYXliYWNrUGFydGljbGUgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGFkZGl0aW9uYWxQbGF5YmFja1BhcnRpY2xlc05lZWRlZCA8IDAgKSB7XHJcbiAgICAgIF8udGltZXMoIE1hdGguYWJzKCBhZGRpdGlvbmFsUGxheWJhY2tQYXJ0aWNsZXNOZWVkZWQgKSwgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucGxheWJhY2tQYXJ0aWNsZXMucG9wKCk7Ly8gcmVtb3ZlIHRoZSBsYXN0IGl0ZW1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBwbGF5YmFjayBwYXJ0aWNsZSBzdGF0ZXMgZnJvbSB0aGUgbWVtZW50b3MuXHJcbiAgICBsZXQgcGxheWJhY2tQYXJ0aWNsZUluZGV4ID0gMDtcclxuICAgIGNvbnN0IG1lbWVudG9zID0gc3RhdGUuZ2V0UGxheWJhY2tQYXJ0aWNsZU1lbWVudG9zKCk7XHJcbiAgICBtZW1lbnRvcy5mb3JFYWNoKCBtZW1lbnRvID0+IHtcclxuICAgICAgdGhpcy5wbGF5YmFja1BhcnRpY2xlcy5nZXQoIHBsYXliYWNrUGFydGljbGVJbmRleCApLnJlc3RvcmVGcm9tTWVtZW50byggbWVtZW50byApO1xyXG4gICAgICBwbGF5YmFja1BhcnRpY2xlSW5kZXgrKztcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm5ldXJvbk1vZGVsUGxheWJhY2tTdGF0ZVByb3BlcnR5LnNldCggc3RhdGUgKTtcclxuICAgIHRoaXMubWVtYnJhbmVQb3RlbnRpYWxQcm9wZXJ0eS5zZXQoIHN0YXRlLmdldE1lbWJyYW5lUG90ZW50aWFsKCkgKTtcclxuXHJcbiAgICAvLyBGb3IgdGhlIHNha2Ugb2Ygc2ltcGxpY2l0eSwgYWx3YXlzIHNlbmQgb3V0IG5vdGlmaWNhdGlvbnMgZm9yIHRoZSBjb25jZW50cmF0aW9uIGNoYW5nZXMuXHJcbiAgICB0aGlzLmNvbmNlbnRyYXRpb25DaGFuZ2VkUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcblxyXG4gICAgLy8gSWYgYW55IG9uZSBjaGFubmVsJ3Mgc3RhdGUgaXMgY2hhbmdlZCwgZW1pdCBhIGNoYW5uZWwgcmVwcmVzZW50YXRpb24gY2hhbmdlZCBldmVudFxyXG4gICAgY29uc3QgY2hhbm5lbFN0YXRlQ2hhbmdlZCA9IG1lbWJyYW5lQ2hhbm5lbCA9PiBtZW1icmFuZUNoYW5uZWwuY2hhbm5lbFN0YXRlQ2hhbmdlZFByb3BlcnR5LmdldCgpO1xyXG4gICAgaWYgKCBfLnNvbWUoIHRoaXMubWVtYnJhbmVDaGFubmVscywgY2hhbm5lbFN0YXRlQ2hhbmdlZCApICkge1xyXG4gICAgICB0aGlzLmNoYW5uZWxSZXByZXNlbnRhdGlvbkNoYW5nZWQuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnTmV1cm9uTW9kZWwnLCBOZXVyb25Nb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTmV1cm9uTW9kZWw7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BE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