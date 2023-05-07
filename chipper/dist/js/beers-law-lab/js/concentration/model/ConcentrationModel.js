// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model container for the 'Concentration' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import beersLawLab from '../../beersLawLab.js';
import BLLConstants from '../../common/BLLConstants.js';
import Solute from '../../common/model/Solute.js';
import Beaker from './Beaker.js';
import ConcentrationMeter from './ConcentrationMeter.js';
import ConcentrationSolution from './ConcentrationSolution.js';
import Dropper from './Dropper.js';
import Evaporator from './Evaporator.js';
import Faucet from './Faucet.js';
import PrecipitateParticles from './PrecipitateParticles.js';
import Shaker from './Shaker.js';
import ShakerParticles from './ShakerParticles.js';
import SoluteForm from './SoluteForm.js';

// constants
const SOLUTION_VOLUME_RANGE = BLLConstants.SOLUTION_VOLUME_RANGE; // L
const SOLUTE_AMOUNT_RANGE = BLLConstants.SOLUTE_AMOUNT_RANGE; // moles
const DROPPER_FLOW_RATE = 0.05; // L/sec
const SHAKER_MAX_DISPENSING_RATE = 0.2; // mol/sec

export default class ConcentrationModel {
  constructor(tandem) {
    // in rainbow (ROYGBIV) order.
    this.solutes = [Solute.DRINK_MIX, Solute.COBALT_II_NITRATE, Solute.COBALT_CHLORIDE, Solute.POTASSIUM_DICHROMATE, Solute.POTASSIUM_CHROMATE, Solute.NICKEL_II_CHLORIDE, Solute.COPPER_SULFATE, Solute.POTASSIUM_PERMANGANATE, Solute.SODIUM_CHLORIDE];
    this.soluteProperty = new Property(this.solutes[0], {
      validValues: this.solutes,
      tandem: tandem.createTandem('soluteProperty'),
      phetioValueType: Solute.SoluteIO,
      phetioDocumentation: 'The selected solute'
    });
    this.soluteFormProperty = new EnumerationProperty(SoluteForm.SOLID, {
      tandem: tandem.createTandem('soluteFormProperty'),
      phetioDocumentation: 'Form of the solute being added to the beaker'
    });
    this.solution = new ConcentrationSolution(this.soluteProperty, SOLUTE_AMOUNT_RANGE, SOLUTION_VOLUME_RANGE, {
      tandem: tandem.createTandem('solution')
    });
    this.beaker = new Beaker({
      position: new Vector2(350, 550)
    });
    this.precipitateParticles = new PrecipitateParticles(this.solution, this.beaker, {
      tandem: tandem.createTandem('precipitateParticles')
    });
    this.shaker = new Shaker(this.soluteProperty, this.soluteFormProperty, {
      position: new Vector2(this.beaker.position.x, 170),
      dragBounds: new Bounds2(250, 50, 575, 210),
      orientation: 0.75 * Math.PI,
      maxDispensingRate: SHAKER_MAX_DISPENSING_RATE,
      tandem: tandem.createTandem('shaker')
    });
    this.shakerParticles = new ShakerParticles(this.solution, this.beaker, this.shaker, {
      tandem: tandem.createTandem('shakerParticles')
    });
    this.dropper = new Dropper(this.soluteProperty, this.soluteFormProperty, {
      position: new Vector2(410, 225),
      maxFlowRate: DROPPER_FLOW_RATE,
      tandem: tandem.createTandem('dropper')
    });
    this.evaporator = new Evaporator(this.solution, {
      tandem: tandem.createTandem('evaporator')
    });
    this.solventFaucet = new Faucet({
      position: new Vector2(155, 220),
      pipeMinX: -400,
      tandem: tandem.createTandem('solventFaucet')
    });
    this.drainFaucet = new Faucet({
      position: new Vector2(750, 630),
      pipeMinX: this.beaker.right,
      tandem: tandem.createTandem('drainFaucet')
    });
    this.concentrationMeter = new ConcentrationMeter({
      bodyPosition: new Vector2(785, 210),
      bodyDragBounds: new Bounds2(10, 150, 835, 680),
      probePosition: new Vector2(750, 370),
      probeDragBounds: new Bounds2(30, 150, 966, 680),
      tandem: tandem.createTandem('concentrationMeter')
    });

    // When the solute is changed, the amount of solute resets to 0.  If this occurs while restoring PhET-iO state,
    // then do nothing, so that we don't blow away the restored state.
    // See https://github.com/phetsims/beers-law-lab/issues/247
    this.soluteProperty.link(() => {
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.solution.soluteMolesProperty.value = 0;
      }
    });

    // Enable faucets and dropper based on amount of solution in the beaker.
    this.solution.volumeProperty.link(volume => {
      this.solventFaucet.enabledProperty.value = volume < SOLUTION_VOLUME_RANGE.max;
      this.drainFaucet.enabledProperty.value = volume > SOLUTION_VOLUME_RANGE.min;
      this.dropper.enabledProperty.value = !this.dropper.isEmptyProperty.value && volume < SOLUTION_VOLUME_RANGE.max;
    });

    // Empty shaker and dropper when max solute is reached.
    this.solution.soluteMolesProperty.link(soluteAmount => {
      const containsMaxSolute = soluteAmount >= SOLUTE_AMOUNT_RANGE.max;

      // Shaker might actually dispense a bit more than SOLUTE_AMOUNT_RANGE.max, but we'll live with it.
      // See https://github.com/phetsims/beers-law-lab/issues/179
      this.shaker.isEmptyProperty.value = containsMaxSolute;
      this.dropper.isEmptyProperty.value = containsMaxSolute;
      this.dropper.enabledProperty.value = !this.dropper.isEmptyProperty.value && !containsMaxSolute && this.solution.volumeProperty.value < SOLUTION_VOLUME_RANGE.max;
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.soluteProperty.reset();
    this.soluteFormProperty.reset();
    this.solution.reset();
    this.shaker.reset();
    this.shakerParticles.reset();
    this.dropper.reset();
    this.evaporator.reset();
    this.solventFaucet.reset();
    this.drainFaucet.reset();
    this.concentrationMeter.reset();
  }

  /*
   * Moves time forward by the specified time delta, in seconds.
   */
  step(dt) {
    this.addSolventFromInputFaucet(dt);
    this.drainSolutionFromOutputFaucet(dt);
    this.addStockSolutionFromDropper(dt);
    this.evaporateSolvent(dt);
    this.propagateShakerParticles(dt);
    this.createShakerParticles();
  }

  // Adds solvent from the input faucet.
  addSolventFromInputFaucet(dt) {
    this.addSolvent(this.solventFaucet.flowRateProperty.value * dt);
  }

  // Drains solution from the output faucet.
  drainSolutionFromOutputFaucet(dt) {
    const drainVolume = this.drainFaucet.flowRateProperty.value * dt;
    if (drainVolume > 0) {
      const concentration = this.solution.concentrationProperty.value; // get concentration before changing volume
      const volumeRemoved = this.removeSolvent(drainVolume);
      this.removeSolute(concentration * volumeRemoved);
    }
  }

  // Adds stock solution from dropper.
  addStockSolutionFromDropper(dt) {
    const dropperVolume = this.dropper.flowRateProperty.value * dt;
    if (dropperVolume > 0) {
      // defer update of precipitateAmount until we've changed both volume and solute amount, see concentration#1
      this.solution.updatePrecipitateAmount = false;
      const volumeAdded = this.addSolvent(dropperVolume);
      this.solution.updatePrecipitateAmount = true;
      this.addSolute(this.solution.soluteProperty.value.stockSolutionConcentration * volumeAdded);
    }
  }

  // Evaporates solvent.
  evaporateSolvent(dt) {
    this.removeSolvent(this.evaporator.evaporationRateProperty.value * dt);
  }

  // Propagates solid solute that came out of the shaker.
  propagateShakerParticles(dt) {
    this.shakerParticles.step(dt);
  }

  // Creates new solute particles when the shaker is shaken.
  createShakerParticles() {
    this.shaker.step();
  }

  // Adds solvent to the solution. Returns the amount actually added.
  addSolvent(deltaVolume) {
    if (deltaVolume > 0) {
      const volumeProperty = this.solution.volumeProperty;
      const volumeBefore = volumeProperty.value;
      volumeProperty.value = Math.min(SOLUTION_VOLUME_RANGE.max, volumeProperty.value + deltaVolume);
      return volumeProperty.value - volumeBefore;
    } else {
      return 0;
    }
  }

  // Removes solvent from the solution. Returns the amount actually removed.
  removeSolvent(deltaVolume) {
    if (deltaVolume > 0) {
      const volumeProperty = this.solution.volumeProperty;
      const volumeBefore = volumeProperty.value;
      volumeProperty.value = Math.max(SOLUTION_VOLUME_RANGE.min, volumeProperty.value - deltaVolume);
      return volumeBefore - volumeProperty.value;
    } else {
      return 0;
    }
  }

  // Adds solute to the solution. Returns the amount actually added.
  addSolute(deltaAmount) {
    if (deltaAmount > 0) {
      const amountBefore = this.solution.soluteMolesProperty.value;
      this.solution.soluteMolesProperty.value = Math.min(SOLUTE_AMOUNT_RANGE.max, this.solution.soluteMolesProperty.value + deltaAmount);
      return this.solution.soluteMolesProperty.value - amountBefore;
    } else {
      return 0;
    }
  }

  // Removes solute from the solution. Returns the amount actually removed.
  removeSolute(deltaAmount) {
    if (deltaAmount > 0) {
      const amountBefore = this.solution.soluteMolesProperty.value;
      this.solution.soluteMolesProperty.value = Math.max(SOLUTE_AMOUNT_RANGE.min, this.solution.soluteMolesProperty.value - deltaAmount);
      return amountBefore - this.solution.soluteMolesProperty.value;
    } else {
      return 0;
    }
  }
}
beersLawLab.register('ConcentrationModel', ConcentrationModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblByb3BlcnR5IiwiUHJvcGVydHkiLCJCb3VuZHMyIiwiVmVjdG9yMiIsImJlZXJzTGF3TGFiIiwiQkxMQ29uc3RhbnRzIiwiU29sdXRlIiwiQmVha2VyIiwiQ29uY2VudHJhdGlvbk1ldGVyIiwiQ29uY2VudHJhdGlvblNvbHV0aW9uIiwiRHJvcHBlciIsIkV2YXBvcmF0b3IiLCJGYXVjZXQiLCJQcmVjaXBpdGF0ZVBhcnRpY2xlcyIsIlNoYWtlciIsIlNoYWtlclBhcnRpY2xlcyIsIlNvbHV0ZUZvcm0iLCJTT0xVVElPTl9WT0xVTUVfUkFOR0UiLCJTT0xVVEVfQU1PVU5UX1JBTkdFIiwiRFJPUFBFUl9GTE9XX1JBVEUiLCJTSEFLRVJfTUFYX0RJU1BFTlNJTkdfUkFURSIsIkNvbmNlbnRyYXRpb25Nb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwic29sdXRlcyIsIkRSSU5LX01JWCIsIkNPQkFMVF9JSV9OSVRSQVRFIiwiQ09CQUxUX0NITE9SSURFIiwiUE9UQVNTSVVNX0RJQ0hST01BVEUiLCJQT1RBU1NJVU1fQ0hST01BVEUiLCJOSUNLRUxfSUlfQ0hMT1JJREUiLCJDT1BQRVJfU1VMRkFURSIsIlBPVEFTU0lVTV9QRVJNQU5HQU5BVEUiLCJTT0RJVU1fQ0hMT1JJREUiLCJzb2x1dGVQcm9wZXJ0eSIsInZhbGlkVmFsdWVzIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvVmFsdWVUeXBlIiwiU29sdXRlSU8iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwic29sdXRlRm9ybVByb3BlcnR5IiwiU09MSUQiLCJzb2x1dGlvbiIsImJlYWtlciIsInBvc2l0aW9uIiwicHJlY2lwaXRhdGVQYXJ0aWNsZXMiLCJzaGFrZXIiLCJ4IiwiZHJhZ0JvdW5kcyIsIm9yaWVudGF0aW9uIiwiTWF0aCIsIlBJIiwibWF4RGlzcGVuc2luZ1JhdGUiLCJzaGFrZXJQYXJ0aWNsZXMiLCJkcm9wcGVyIiwibWF4Rmxvd1JhdGUiLCJldmFwb3JhdG9yIiwic29sdmVudEZhdWNldCIsInBpcGVNaW5YIiwiZHJhaW5GYXVjZXQiLCJyaWdodCIsImNvbmNlbnRyYXRpb25NZXRlciIsImJvZHlQb3NpdGlvbiIsImJvZHlEcmFnQm91bmRzIiwicHJvYmVQb3NpdGlvbiIsInByb2JlRHJhZ0JvdW5kcyIsImxpbmsiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJzb2x1dGVNb2xlc1Byb3BlcnR5Iiwidm9sdW1lUHJvcGVydHkiLCJ2b2x1bWUiLCJlbmFibGVkUHJvcGVydHkiLCJtYXgiLCJtaW4iLCJpc0VtcHR5UHJvcGVydHkiLCJzb2x1dGVBbW91bnQiLCJjb250YWluc01heFNvbHV0ZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZXNldCIsInN0ZXAiLCJkdCIsImFkZFNvbHZlbnRGcm9tSW5wdXRGYXVjZXQiLCJkcmFpblNvbHV0aW9uRnJvbU91dHB1dEZhdWNldCIsImFkZFN0b2NrU29sdXRpb25Gcm9tRHJvcHBlciIsImV2YXBvcmF0ZVNvbHZlbnQiLCJwcm9wYWdhdGVTaGFrZXJQYXJ0aWNsZXMiLCJjcmVhdGVTaGFrZXJQYXJ0aWNsZXMiLCJhZGRTb2x2ZW50IiwiZmxvd1JhdGVQcm9wZXJ0eSIsImRyYWluVm9sdW1lIiwiY29uY2VudHJhdGlvbiIsImNvbmNlbnRyYXRpb25Qcm9wZXJ0eSIsInZvbHVtZVJlbW92ZWQiLCJyZW1vdmVTb2x2ZW50IiwicmVtb3ZlU29sdXRlIiwiZHJvcHBlclZvbHVtZSIsInVwZGF0ZVByZWNpcGl0YXRlQW1vdW50Iiwidm9sdW1lQWRkZWQiLCJhZGRTb2x1dGUiLCJzdG9ja1NvbHV0aW9uQ29uY2VudHJhdGlvbiIsImV2YXBvcmF0aW9uUmF0ZVByb3BlcnR5IiwiZGVsdGFWb2x1bWUiLCJ2b2x1bWVCZWZvcmUiLCJkZWx0YUFtb3VudCIsImFtb3VudEJlZm9yZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29uY2VudHJhdGlvbk1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGNvbnRhaW5lciBmb3IgdGhlICdDb25jZW50cmF0aW9uJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFRNb2RlbCBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9UTW9kZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdMYWIgZnJvbSAnLi4vLi4vYmVlcnNMYXdMYWIuanMnO1xyXG5pbXBvcnQgQkxMQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9CTExDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgU29sdXRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Tb2x1dGUuanMnO1xyXG5pbXBvcnQgQmVha2VyIGZyb20gJy4vQmVha2VyLmpzJztcclxuaW1wb3J0IENvbmNlbnRyYXRpb25NZXRlciBmcm9tICcuL0NvbmNlbnRyYXRpb25NZXRlci5qcyc7XHJcbmltcG9ydCBDb25jZW50cmF0aW9uU29sdXRpb24gZnJvbSAnLi9Db25jZW50cmF0aW9uU29sdXRpb24uanMnO1xyXG5pbXBvcnQgRHJvcHBlciBmcm9tICcuL0Ryb3BwZXIuanMnO1xyXG5pbXBvcnQgRXZhcG9yYXRvciBmcm9tICcuL0V2YXBvcmF0b3IuanMnO1xyXG5pbXBvcnQgRmF1Y2V0IGZyb20gJy4vRmF1Y2V0LmpzJztcclxuaW1wb3J0IFByZWNpcGl0YXRlUGFydGljbGVzIGZyb20gJy4vUHJlY2lwaXRhdGVQYXJ0aWNsZXMuanMnO1xyXG5pbXBvcnQgU2hha2VyIGZyb20gJy4vU2hha2VyLmpzJztcclxuaW1wb3J0IFNoYWtlclBhcnRpY2xlcyBmcm9tICcuL1NoYWtlclBhcnRpY2xlcy5qcyc7XHJcbmltcG9ydCBTb2x1dGVGb3JtIGZyb20gJy4vU29sdXRlRm9ybS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU09MVVRJT05fVk9MVU1FX1JBTkdFID0gQkxMQ29uc3RhbnRzLlNPTFVUSU9OX1ZPTFVNRV9SQU5HRTsgLy8gTFxyXG5jb25zdCBTT0xVVEVfQU1PVU5UX1JBTkdFID0gQkxMQ29uc3RhbnRzLlNPTFVURV9BTU9VTlRfUkFOR0U7IC8vIG1vbGVzXHJcbmNvbnN0IERST1BQRVJfRkxPV19SQVRFID0gMC4wNTsgLy8gTC9zZWNcclxuY29uc3QgU0hBS0VSX01BWF9ESVNQRU5TSU5HX1JBVEUgPSAwLjI7IC8vIG1vbC9zZWNcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmNlbnRyYXRpb25Nb2RlbCBpbXBsZW1lbnRzIFRNb2RlbCB7XHJcblxyXG4gIHB1YmxpYyBzb2x1dGVzOiBTb2x1dGVbXTtcclxuICBwdWJsaWMgcmVhZG9ubHkgc29sdXRlUHJvcGVydHk6IFByb3BlcnR5PFNvbHV0ZT47XHJcbiAgcHVibGljIHJlYWRvbmx5IHNvbHV0ZUZvcm1Qcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxTb2x1dGVGb3JtPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgc29sdXRpb246IENvbmNlbnRyYXRpb25Tb2x1dGlvbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYmVha2VyOiBCZWFrZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHByZWNpcGl0YXRlUGFydGljbGVzOiBQcmVjaXBpdGF0ZVBhcnRpY2xlcztcclxuICBwdWJsaWMgcmVhZG9ubHkgc2hha2VyOiBTaGFrZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHNoYWtlclBhcnRpY2xlczogU2hha2VyUGFydGljbGVzO1xyXG4gIHB1YmxpYyByZWFkb25seSBkcm9wcGVyOiBEcm9wcGVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBldmFwb3JhdG9yOiBFdmFwb3JhdG9yO1xyXG4gIHB1YmxpYyByZWFkb25seSBzb2x2ZW50RmF1Y2V0OiBGYXVjZXQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRyYWluRmF1Y2V0OiBGYXVjZXQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbmNlbnRyYXRpb25NZXRlcjogQ29uY2VudHJhdGlvbk1ldGVyO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIC8vIGluIHJhaW5ib3cgKFJPWUdCSVYpIG9yZGVyLlxyXG4gICAgdGhpcy5zb2x1dGVzID0gW1xyXG4gICAgICBTb2x1dGUuRFJJTktfTUlYLFxyXG4gICAgICBTb2x1dGUuQ09CQUxUX0lJX05JVFJBVEUsXHJcbiAgICAgIFNvbHV0ZS5DT0JBTFRfQ0hMT1JJREUsXHJcbiAgICAgIFNvbHV0ZS5QT1RBU1NJVU1fRElDSFJPTUFURSxcclxuICAgICAgU29sdXRlLlBPVEFTU0lVTV9DSFJPTUFURSxcclxuICAgICAgU29sdXRlLk5JQ0tFTF9JSV9DSExPUklERSxcclxuICAgICAgU29sdXRlLkNPUFBFUl9TVUxGQVRFLFxyXG4gICAgICBTb2x1dGUuUE9UQVNTSVVNX1BFUk1BTkdBTkFURSxcclxuICAgICAgU29sdXRlLlNPRElVTV9DSExPUklERVxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLnNvbHV0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0aGlzLnNvbHV0ZXNbIDAgXSwge1xyXG4gICAgICB2YWxpZFZhbHVlczogdGhpcy5zb2x1dGVzLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzb2x1dGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBTb2x1dGUuU29sdXRlSU8sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGUgc2VsZWN0ZWQgc29sdXRlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc29sdXRlRm9ybVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIFNvbHV0ZUZvcm0uU09MSUQsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc29sdXRlRm9ybVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRm9ybSBvZiB0aGUgc29sdXRlIGJlaW5nIGFkZGVkIHRvIHRoZSBiZWFrZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zb2x1dGlvbiA9IG5ldyBDb25jZW50cmF0aW9uU29sdXRpb24oIHRoaXMuc29sdXRlUHJvcGVydHksIFNPTFVURV9BTU9VTlRfUkFOR0UsIFNPTFVUSU9OX1ZPTFVNRV9SQU5HRSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzb2x1dGlvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYmVha2VyID0gbmV3IEJlYWtlcigge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDM1MCwgNTUwIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnByZWNpcGl0YXRlUGFydGljbGVzID0gbmV3IFByZWNpcGl0YXRlUGFydGljbGVzKCB0aGlzLnNvbHV0aW9uLCB0aGlzLmJlYWtlciwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcmVjaXBpdGF0ZVBhcnRpY2xlcycgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc2hha2VyID0gbmV3IFNoYWtlciggdGhpcy5zb2x1dGVQcm9wZXJ0eSwgdGhpcy5zb2x1dGVGb3JtUHJvcGVydHksIHtcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCB0aGlzLmJlYWtlci5wb3NpdGlvbi54LCAxNzAgKSxcclxuICAgICAgZHJhZ0JvdW5kczogbmV3IEJvdW5kczIoIDI1MCwgNTAsIDU3NSwgMjEwICksXHJcbiAgICAgIG9yaWVudGF0aW9uOiAwLjc1ICogTWF0aC5QSSxcclxuICAgICAgbWF4RGlzcGVuc2luZ1JhdGU6IFNIQUtFUl9NQVhfRElTUEVOU0lOR19SQVRFLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaGFrZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNoYWtlclBhcnRpY2xlcyA9IG5ldyBTaGFrZXJQYXJ0aWNsZXMoIHRoaXMuc29sdXRpb24sIHRoaXMuYmVha2VyLCB0aGlzLnNoYWtlciwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaGFrZXJQYXJ0aWNsZXMnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRyb3BwZXIgPSBuZXcgRHJvcHBlciggdGhpcy5zb2x1dGVQcm9wZXJ0eSwgdGhpcy5zb2x1dGVGb3JtUHJvcGVydHksIHtcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCA0MTAsIDIyNSApLFxyXG4gICAgICBtYXhGbG93UmF0ZTogRFJPUFBFUl9GTE9XX1JBVEUsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Ryb3BwZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmV2YXBvcmF0b3IgPSBuZXcgRXZhcG9yYXRvciggdGhpcy5zb2x1dGlvbiwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdldmFwb3JhdG9yJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zb2x2ZW50RmF1Y2V0ID0gbmV3IEZhdWNldCgge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDE1NSwgMjIwICksXHJcbiAgICAgIHBpcGVNaW5YOiAtNDAwLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzb2x2ZW50RmF1Y2V0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kcmFpbkZhdWNldCA9IG5ldyBGYXVjZXQoIHtcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCA3NTAsIDYzMCApLFxyXG4gICAgICBwaXBlTWluWDogdGhpcy5iZWFrZXIucmlnaHQsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWluRmF1Y2V0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jb25jZW50cmF0aW9uTWV0ZXIgPSBuZXcgQ29uY2VudHJhdGlvbk1ldGVyKCB7XHJcbiAgICAgIGJvZHlQb3NpdGlvbjogbmV3IFZlY3RvcjIoIDc4NSwgMjEwICksXHJcbiAgICAgIGJvZHlEcmFnQm91bmRzOiBuZXcgQm91bmRzMiggMTAsIDE1MCwgODM1LCA2ODAgKSxcclxuICAgICAgcHJvYmVQb3NpdGlvbjogbmV3IFZlY3RvcjIoIDc1MCwgMzcwICksXHJcbiAgICAgIHByb2JlRHJhZ0JvdW5kczogbmV3IEJvdW5kczIoIDMwLCAxNTAsIDk2NiwgNjgwICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbmNlbnRyYXRpb25NZXRlcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHNvbHV0ZSBpcyBjaGFuZ2VkLCB0aGUgYW1vdW50IG9mIHNvbHV0ZSByZXNldHMgdG8gMC4gIElmIHRoaXMgb2NjdXJzIHdoaWxlIHJlc3RvcmluZyBQaEVULWlPIHN0YXRlLFxyXG4gICAgLy8gdGhlbiBkbyBub3RoaW5nLCBzbyB0aGF0IHdlIGRvbid0IGJsb3cgYXdheSB0aGUgcmVzdG9yZWQgc3RhdGUuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JlZXJzLWxhdy1sYWIvaXNzdWVzLzI0N1xyXG4gICAgdGhpcy5zb2x1dGVQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGlmICggIXBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5zb2x1dGlvbi5zb2x1dGVNb2xlc1Byb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEVuYWJsZSBmYXVjZXRzIGFuZCBkcm9wcGVyIGJhc2VkIG9uIGFtb3VudCBvZiBzb2x1dGlvbiBpbiB0aGUgYmVha2VyLlxyXG4gICAgdGhpcy5zb2x1dGlvbi52b2x1bWVQcm9wZXJ0eS5saW5rKCB2b2x1bWUgPT4ge1xyXG4gICAgICB0aGlzLnNvbHZlbnRGYXVjZXQuZW5hYmxlZFByb3BlcnR5LnZhbHVlID0gKCB2b2x1bWUgPCBTT0xVVElPTl9WT0xVTUVfUkFOR0UubWF4ICk7XHJcbiAgICAgIHRoaXMuZHJhaW5GYXVjZXQuZW5hYmxlZFByb3BlcnR5LnZhbHVlID0gKCB2b2x1bWUgPiBTT0xVVElPTl9WT0xVTUVfUkFOR0UubWluICk7XHJcbiAgICAgIHRoaXMuZHJvcHBlci5lbmFibGVkUHJvcGVydHkudmFsdWUgPSAoICF0aGlzLmRyb3BwZXIuaXNFbXB0eVByb3BlcnR5LnZhbHVlICYmICggdm9sdW1lIDwgU09MVVRJT05fVk9MVU1FX1JBTkdFLm1heCApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRW1wdHkgc2hha2VyIGFuZCBkcm9wcGVyIHdoZW4gbWF4IHNvbHV0ZSBpcyByZWFjaGVkLlxyXG4gICAgdGhpcy5zb2x1dGlvbi5zb2x1dGVNb2xlc1Byb3BlcnR5LmxpbmsoIHNvbHV0ZUFtb3VudCA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5zTWF4U29sdXRlID0gKCBzb2x1dGVBbW91bnQgPj0gU09MVVRFX0FNT1VOVF9SQU5HRS5tYXggKTtcclxuXHJcbiAgICAgIC8vIFNoYWtlciBtaWdodCBhY3R1YWxseSBkaXNwZW5zZSBhIGJpdCBtb3JlIHRoYW4gU09MVVRFX0FNT1VOVF9SQU5HRS5tYXgsIGJ1dCB3ZSdsbCBsaXZlIHdpdGggaXQuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmVlcnMtbGF3LWxhYi9pc3N1ZXMvMTc5XHJcbiAgICAgIHRoaXMuc2hha2VyLmlzRW1wdHlQcm9wZXJ0eS52YWx1ZSA9IGNvbnRhaW5zTWF4U29sdXRlO1xyXG4gICAgICB0aGlzLmRyb3BwZXIuaXNFbXB0eVByb3BlcnR5LnZhbHVlID0gY29udGFpbnNNYXhTb2x1dGU7XHJcbiAgICAgIHRoaXMuZHJvcHBlci5lbmFibGVkUHJvcGVydHkudmFsdWUgPVxyXG4gICAgICAgICggIXRoaXMuZHJvcHBlci5pc0VtcHR5UHJvcGVydHkudmFsdWUgJiYgIWNvbnRhaW5zTWF4U29sdXRlICYmIHRoaXMuc29sdXRpb24udm9sdW1lUHJvcGVydHkudmFsdWUgPCBTT0xVVElPTl9WT0xVTUVfUkFOR0UubWF4ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zb2x1dGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zb2x1dGVGb3JtUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc29sdXRpb24ucmVzZXQoKTtcclxuICAgIHRoaXMuc2hha2VyLnJlc2V0KCk7XHJcbiAgICB0aGlzLnNoYWtlclBhcnRpY2xlcy5yZXNldCgpO1xyXG4gICAgdGhpcy5kcm9wcGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLmV2YXBvcmF0b3IucmVzZXQoKTtcclxuICAgIHRoaXMuc29sdmVudEZhdWNldC5yZXNldCgpO1xyXG4gICAgdGhpcy5kcmFpbkZhdWNldC5yZXNldCgpO1xyXG4gICAgdGhpcy5jb25jZW50cmF0aW9uTWV0ZXIucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogTW92ZXMgdGltZSBmb3J3YXJkIGJ5IHRoZSBzcGVjaWZpZWQgdGltZSBkZWx0YSwgaW4gc2Vjb25kcy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuYWRkU29sdmVudEZyb21JbnB1dEZhdWNldCggZHQgKTtcclxuICAgIHRoaXMuZHJhaW5Tb2x1dGlvbkZyb21PdXRwdXRGYXVjZXQoIGR0ICk7XHJcbiAgICB0aGlzLmFkZFN0b2NrU29sdXRpb25Gcm9tRHJvcHBlciggZHQgKTtcclxuICAgIHRoaXMuZXZhcG9yYXRlU29sdmVudCggZHQgKTtcclxuICAgIHRoaXMucHJvcGFnYXRlU2hha2VyUGFydGljbGVzKCBkdCApO1xyXG4gICAgdGhpcy5jcmVhdGVTaGFrZXJQYXJ0aWNsZXMoKTtcclxuICB9XHJcblxyXG4gIC8vIEFkZHMgc29sdmVudCBmcm9tIHRoZSBpbnB1dCBmYXVjZXQuXHJcbiAgcHJpdmF0ZSBhZGRTb2x2ZW50RnJvbUlucHV0RmF1Y2V0KCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5hZGRTb2x2ZW50KCB0aGlzLnNvbHZlbnRGYXVjZXQuZmxvd1JhdGVQcm9wZXJ0eS52YWx1ZSAqIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvLyBEcmFpbnMgc29sdXRpb24gZnJvbSB0aGUgb3V0cHV0IGZhdWNldC5cclxuICBwcml2YXRlIGRyYWluU29sdXRpb25Gcm9tT3V0cHV0RmF1Y2V0KCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgY29uc3QgZHJhaW5Wb2x1bWUgPSB0aGlzLmRyYWluRmF1Y2V0LmZsb3dSYXRlUHJvcGVydHkudmFsdWUgKiBkdDtcclxuICAgIGlmICggZHJhaW5Wb2x1bWUgPiAwICkge1xyXG4gICAgICBjb25zdCBjb25jZW50cmF0aW9uID0gdGhpcy5zb2x1dGlvbi5jb25jZW50cmF0aW9uUHJvcGVydHkudmFsdWU7IC8vIGdldCBjb25jZW50cmF0aW9uIGJlZm9yZSBjaGFuZ2luZyB2b2x1bWVcclxuICAgICAgY29uc3Qgdm9sdW1lUmVtb3ZlZCA9IHRoaXMucmVtb3ZlU29sdmVudCggZHJhaW5Wb2x1bWUgKTtcclxuICAgICAgdGhpcy5yZW1vdmVTb2x1dGUoIGNvbmNlbnRyYXRpb24gKiB2b2x1bWVSZW1vdmVkICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBBZGRzIHN0b2NrIHNvbHV0aW9uIGZyb20gZHJvcHBlci5cclxuICBwcml2YXRlIGFkZFN0b2NrU29sdXRpb25Gcm9tRHJvcHBlciggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGNvbnN0IGRyb3BwZXJWb2x1bWUgPSB0aGlzLmRyb3BwZXIuZmxvd1JhdGVQcm9wZXJ0eS52YWx1ZSAqIGR0O1xyXG4gICAgaWYgKCBkcm9wcGVyVm9sdW1lID4gMCApIHtcclxuXHJcbiAgICAgIC8vIGRlZmVyIHVwZGF0ZSBvZiBwcmVjaXBpdGF0ZUFtb3VudCB1bnRpbCB3ZSd2ZSBjaGFuZ2VkIGJvdGggdm9sdW1lIGFuZCBzb2x1dGUgYW1vdW50LCBzZWUgY29uY2VudHJhdGlvbiMxXHJcbiAgICAgIHRoaXMuc29sdXRpb24udXBkYXRlUHJlY2lwaXRhdGVBbW91bnQgPSBmYWxzZTtcclxuICAgICAgY29uc3Qgdm9sdW1lQWRkZWQgPSB0aGlzLmFkZFNvbHZlbnQoIGRyb3BwZXJWb2x1bWUgKTtcclxuICAgICAgdGhpcy5zb2x1dGlvbi51cGRhdGVQcmVjaXBpdGF0ZUFtb3VudCA9IHRydWU7XHJcbiAgICAgIHRoaXMuYWRkU29sdXRlKCB0aGlzLnNvbHV0aW9uLnNvbHV0ZVByb3BlcnR5LnZhbHVlLnN0b2NrU29sdXRpb25Db25jZW50cmF0aW9uICogdm9sdW1lQWRkZWQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEV2YXBvcmF0ZXMgc29sdmVudC5cclxuICBwcml2YXRlIGV2YXBvcmF0ZVNvbHZlbnQoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlbW92ZVNvbHZlbnQoIHRoaXMuZXZhcG9yYXRvci5ldmFwb3JhdGlvblJhdGVQcm9wZXJ0eS52YWx1ZSAqIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvLyBQcm9wYWdhdGVzIHNvbGlkIHNvbHV0ZSB0aGF0IGNhbWUgb3V0IG9mIHRoZSBzaGFrZXIuXHJcbiAgcHJpdmF0ZSBwcm9wYWdhdGVTaGFrZXJQYXJ0aWNsZXMoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLnNoYWtlclBhcnRpY2xlcy5zdGVwKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3JlYXRlcyBuZXcgc29sdXRlIHBhcnRpY2xlcyB3aGVuIHRoZSBzaGFrZXIgaXMgc2hha2VuLlxyXG4gIHByaXZhdGUgY3JlYXRlU2hha2VyUGFydGljbGVzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zaGFrZXIuc3RlcCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQWRkcyBzb2x2ZW50IHRvIHRoZSBzb2x1dGlvbi4gUmV0dXJucyB0aGUgYW1vdW50IGFjdHVhbGx5IGFkZGVkLlxyXG4gIHByaXZhdGUgYWRkU29sdmVudCggZGVsdGFWb2x1bWU6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaWYgKCBkZWx0YVZvbHVtZSA+IDAgKSB7XHJcbiAgICAgIGNvbnN0IHZvbHVtZVByb3BlcnR5ID0gdGhpcy5zb2x1dGlvbi52b2x1bWVQcm9wZXJ0eTtcclxuICAgICAgY29uc3Qgdm9sdW1lQmVmb3JlID0gdm9sdW1lUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIHZvbHVtZVByb3BlcnR5LnZhbHVlID0gTWF0aC5taW4oIFNPTFVUSU9OX1ZPTFVNRV9SQU5HRS5tYXgsIHZvbHVtZVByb3BlcnR5LnZhbHVlICsgZGVsdGFWb2x1bWUgKTtcclxuICAgICAgcmV0dXJuIHZvbHVtZVByb3BlcnR5LnZhbHVlIC0gdm9sdW1lQmVmb3JlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlcyBzb2x2ZW50IGZyb20gdGhlIHNvbHV0aW9uLiBSZXR1cm5zIHRoZSBhbW91bnQgYWN0dWFsbHkgcmVtb3ZlZC5cclxuICBwcml2YXRlIHJlbW92ZVNvbHZlbnQoIGRlbHRhVm9sdW1lOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGlmICggZGVsdGFWb2x1bWUgPiAwICkge1xyXG4gICAgICBjb25zdCB2b2x1bWVQcm9wZXJ0eSA9IHRoaXMuc29sdXRpb24udm9sdW1lUHJvcGVydHk7XHJcbiAgICAgIGNvbnN0IHZvbHVtZUJlZm9yZSA9IHZvbHVtZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB2b2x1bWVQcm9wZXJ0eS52YWx1ZSA9IE1hdGgubWF4KCBTT0xVVElPTl9WT0xVTUVfUkFOR0UubWluLCB2b2x1bWVQcm9wZXJ0eS52YWx1ZSAtIGRlbHRhVm9sdW1lICk7XHJcbiAgICAgIHJldHVybiB2b2x1bWVCZWZvcmUgLSB2b2x1bWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEFkZHMgc29sdXRlIHRvIHRoZSBzb2x1dGlvbi4gUmV0dXJucyB0aGUgYW1vdW50IGFjdHVhbGx5IGFkZGVkLlxyXG4gIHByaXZhdGUgYWRkU29sdXRlKCBkZWx0YUFtb3VudDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBpZiAoIGRlbHRhQW1vdW50ID4gMCApIHtcclxuICAgICAgY29uc3QgYW1vdW50QmVmb3JlID0gdGhpcy5zb2x1dGlvbi5zb2x1dGVNb2xlc1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgICB0aGlzLnNvbHV0aW9uLnNvbHV0ZU1vbGVzUHJvcGVydHkudmFsdWUgPVxyXG4gICAgICAgIE1hdGgubWluKCBTT0xVVEVfQU1PVU5UX1JBTkdFLm1heCwgdGhpcy5zb2x1dGlvbi5zb2x1dGVNb2xlc1Byb3BlcnR5LnZhbHVlICsgZGVsdGFBbW91bnQgKTtcclxuICAgICAgcmV0dXJuIHRoaXMuc29sdXRpb24uc29sdXRlTW9sZXNQcm9wZXJ0eS52YWx1ZSAtIGFtb3VudEJlZm9yZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZXMgc29sdXRlIGZyb20gdGhlIHNvbHV0aW9uLiBSZXR1cm5zIHRoZSBhbW91bnQgYWN0dWFsbHkgcmVtb3ZlZC5cclxuICBwcml2YXRlIHJlbW92ZVNvbHV0ZSggZGVsdGFBbW91bnQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaWYgKCBkZWx0YUFtb3VudCA+IDAgKSB7XHJcbiAgICAgIGNvbnN0IGFtb3VudEJlZm9yZSA9IHRoaXMuc29sdXRpb24uc29sdXRlTW9sZXNQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgdGhpcy5zb2x1dGlvbi5zb2x1dGVNb2xlc1Byb3BlcnR5LnZhbHVlID1cclxuICAgICAgICBNYXRoLm1heCggU09MVVRFX0FNT1VOVF9SQU5HRS5taW4sIHRoaXMuc29sdXRpb24uc29sdXRlTW9sZXNQcm9wZXJ0eS52YWx1ZSAtIGRlbHRhQW1vdW50ICk7XHJcbiAgICAgIHJldHVybiBhbW91bnRCZWZvcmUgLSB0aGlzLnNvbHV0aW9uLnNvbHV0ZU1vbGVzUHJvcGVydHkudmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5iZWVyc0xhd0xhYi5yZWdpc3RlciggJ0NvbmNlbnRyYXRpb25Nb2RlbCcsIENvbmNlbnRyYXRpb25Nb2RlbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFD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