// Copyright 2019-2023, University of Colorado Boulder

/**
 * Query parameters supported by density-buoyancy-common simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../densityBuoyancyCommon.js';

export const VolumeUnitsValues = [ 'liters', 'decimetersCubed' ] as const;
export type VolumeUnits = ( typeof VolumeUnitsValues )[number];

const DensityBuoyancyCommonQueryParameters = QueryStringMachine.getAll( {

  gEarth: {
    type: 'number',
    defaultValue: 9.8,
    public: true,
    isValidValue: ( value: number ) => value >= 9 && value <= 10
  },

  // See https://github.com/phetsims/density/issues/147
  volumeUnits: {
    type: 'string',
    validValues: VolumeUnitsValues,
    defaultValue: 'liters',
    public: true
  },

  // Changes the "aspect ratio" of the pool, for internal testing/development
  poolWidthMultiplier: {
    type: 'number',
    defaultValue: 1
  },

  // Shows a debug layer on-top (that is interactive) for a cross-sectional view
  showDebug: {
    type: 'flag'
  },

  // Shows the invisible barrier
  showBarrier: {
    type: 'flag'
  },

  // Whether icons should be generated with 3d views. Usually this should not happen, and the stored images should be
  // loaded for better performance and fewer resources used.
  generateIconImages: {
    type: 'flag'
  },

  // Length (in seconds) of each internal p2 timestep. Ran into weird behavior when we had only 60 a second.
  p2FixedTimeStep: {
    type: 'number',
    defaultValue: 1 / 120
  },

  // Controls the maximum number of physics substeps in a single step. Usually not reached
  p2MaxSubSteps: {
    type: 'number',
    defaultValue: 30
  },

  // We multiply our model sizes (width/height, etc.) by this amount before it is sent to the physics engine, so the
  // engine thinks things are this-much-bigger.
  p2SizeScale: {
    type: 'number',
    defaultValue: 5
  },

  // We multiply our mass amounts by this amount before it is sent to the physics engine, so the engine thinks things
  // are this-much-more-massive
  p2MassScale: {
    type: 'number',
    defaultValue: 0.1
  },

  // Default (maximum) number of main iterations per step to run before reaching the tolerance
  p2Iterations: {
    type: 'number',
    defaultValue: 40
  },

  // Amount of iterations used to compute friction
  p2FrictionIterations: {
    type: 'number',
    defaultValue: 500
  },

  // When the amount of error goes below this amount, further iterations are not done
  p2Tolerance: {
    type: 'number',
    defaultValue: 1e-10
  },

  // How "bouncy" things are supposed to be (0-1 generally)
  p2Restitution: {
    type: 'number',
    defaultValue: 0
  },

  // An amount of force applied to all pointer-mass interactions (e.g. when you grab it with the mouse)
  p2PointerBaseForce: {
    type: 'number',
    defaultValue: 2500
  },

  // Adds to the amount of force applied to all pointer-mass interactions (e.g. when you grab it with the mouse), but
  // is this value TIMES the mass's mass value.
  p2PointerMassForce: {
    type: 'number',
    defaultValue: 0
  },

  // Stiffness:
  // "Hardness of the contact. Less stiffness will make the objects penetrate more, and will make the contact act more
  // like a spring than a contact force." - p2 default is 1e6
  // Can be increased, but can make things unstable or bouncy.

  // Stiffness to use for ground-mass interactions
  p2GroundStiffness: {
    type: 'number',
    defaultValue: 1e6
  },

  // Stiffness to use for barrier-mass interactions
  p2BarrierStiffness: {
    type: 'number',
    defaultValue: 1e6
  },

  // Stiffness to use for mass-mass interactions
  p2DynamicStiffness: {
    type: 'number',
    defaultValue: 1e6
  },

  // Relaxation:
  // "The number of time steps needed to stabilize the constraint equation. Typically between 3 and 5 time steps."
  // p2 default is 4.

  // Relaxation to use for ground-mass interactions
  p2GroundRelaxation: {
    type: 'number',
    // Slightly increased for https://github.com/phetsims/density/issues/53
    defaultValue: 2.5 // reduction results in less ground penetration when a mass is sitting on the ground
  },

  // Relaxation to use for barrier-mass interactions
  p2BarrierRelaxation: {
    type: 'number',
    defaultValue: 4
  },

  // Relaxation to use for mass-mass interactions
  p2DynamicRelaxation: {
    type: 'number',
    defaultValue: 4
  },

  // Controls the proportional amount of overall result viscosity forces applied
  viscosityMultiplier: {
    type: 'number',
    defaultValue: 1
  },

  // A mix between 0: Full viscosity is applied when any part of a mass is in the liquid, 1: The viscosity effect is
  // multiplied times the proportion of the mass submerged (lowering viscosity when partially submerged).
  viscositySubmergedRatio: {
    type: 'number',
    defaultValue: 0
  },

  // Viscosity for masses larger than this will be reduced to the force for this viscosity (somewhat of a hacK)
  viscosityMassCutoff: {
    type: 'number',
    defaultValue: 0.5
  }
} );

densityBuoyancyCommon.register( 'DensityBuoyancyCommonQueryParameters', DensityBuoyancyCommonQueryParameters );
export default DensityBuoyancyCommonQueryParameters;