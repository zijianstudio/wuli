// Copyright 2019-2023, University of Colorado Boulder

/**
 * Query parameters supported by density-buoyancy-common simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import densityBuoyancyCommon from '../densityBuoyancyCommon.js';
export const VolumeUnitsValues = ['liters', 'decimetersCubed'];
const DensityBuoyancyCommonQueryParameters = QueryStringMachine.getAll({
  gEarth: {
    type: 'number',
    defaultValue: 9.8,
    public: true,
    isValidValue: value => value >= 9 && value <= 10
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
});
densityBuoyancyCommon.register('DensityBuoyancyCommonQueryParameters', DensityBuoyancyCommonQueryParameters);
export default DensityBuoyancyCommonQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZW5zaXR5QnVveWFuY3lDb21tb24iLCJWb2x1bWVVbml0c1ZhbHVlcyIsIkRlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsImdFYXJ0aCIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJwdWJsaWMiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsInZvbHVtZVVuaXRzIiwidmFsaWRWYWx1ZXMiLCJwb29sV2lkdGhNdWx0aXBsaWVyIiwic2hvd0RlYnVnIiwic2hvd0JhcnJpZXIiLCJnZW5lcmF0ZUljb25JbWFnZXMiLCJwMkZpeGVkVGltZVN0ZXAiLCJwMk1heFN1YlN0ZXBzIiwicDJTaXplU2NhbGUiLCJwMk1hc3NTY2FsZSIsInAySXRlcmF0aW9ucyIsInAyRnJpY3Rpb25JdGVyYXRpb25zIiwicDJUb2xlcmFuY2UiLCJwMlJlc3RpdHV0aW9uIiwicDJQb2ludGVyQmFzZUZvcmNlIiwicDJQb2ludGVyTWFzc0ZvcmNlIiwicDJHcm91bmRTdGlmZm5lc3MiLCJwMkJhcnJpZXJTdGlmZm5lc3MiLCJwMkR5bmFtaWNTdGlmZm5lc3MiLCJwMkdyb3VuZFJlbGF4YXRpb24iLCJwMkJhcnJpZXJSZWxheGF0aW9uIiwicDJEeW5hbWljUmVsYXhhdGlvbiIsInZpc2Nvc2l0eU11bHRpcGxpZXIiLCJ2aXNjb3NpdHlTdWJtZXJnZWRSYXRpbyIsInZpc2Nvc2l0eU1hc3NDdXRvZmYiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIHN1cHBvcnRlZCBieSBkZW5zaXR5LWJ1b3lhbmN5LWNvbW1vbiBzaW11bGF0aW9ucy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBkZW5zaXR5QnVveWFuY3lDb21tb24gZnJvbSAnLi4vZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLmpzJztcclxuXHJcbmV4cG9ydCBjb25zdCBWb2x1bWVVbml0c1ZhbHVlcyA9IFsgJ2xpdGVycycsICdkZWNpbWV0ZXJzQ3ViZWQnIF0gYXMgY29uc3Q7XHJcbmV4cG9ydCB0eXBlIFZvbHVtZVVuaXRzID0gKCB0eXBlb2YgVm9sdW1lVW5pdHNWYWx1ZXMgKVtudW1iZXJdO1xyXG5cclxuY29uc3QgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICBnRWFydGg6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiA5LjgsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+IHZhbHVlID49IDkgJiYgdmFsdWUgPD0gMTBcclxuICB9LFxyXG5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RlbnNpdHkvaXNzdWVzLzE0N1xyXG4gIHZvbHVtZVVuaXRzOiB7XHJcbiAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIHZhbGlkVmFsdWVzOiBWb2x1bWVVbml0c1ZhbHVlcyxcclxuICAgIGRlZmF1bHRWYWx1ZTogJ2xpdGVycycsXHJcbiAgICBwdWJsaWM6IHRydWVcclxuICB9LFxyXG5cclxuICAvLyBDaGFuZ2VzIHRoZSBcImFzcGVjdCByYXRpb1wiIG9mIHRoZSBwb29sLCBmb3IgaW50ZXJuYWwgdGVzdGluZy9kZXZlbG9wbWVudFxyXG4gIHBvb2xXaWR0aE11bHRpcGxpZXI6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxXHJcbiAgfSxcclxuXHJcbiAgLy8gU2hvd3MgYSBkZWJ1ZyBsYXllciBvbi10b3AgKHRoYXQgaXMgaW50ZXJhY3RpdmUpIGZvciBhIGNyb3NzLXNlY3Rpb25hbCB2aWV3XHJcbiAgc2hvd0RlYnVnOiB7XHJcbiAgICB0eXBlOiAnZmxhZydcclxuICB9LFxyXG5cclxuICAvLyBTaG93cyB0aGUgaW52aXNpYmxlIGJhcnJpZXJcclxuICBzaG93QmFycmllcjoge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfSxcclxuXHJcbiAgLy8gV2hldGhlciBpY29ucyBzaG91bGQgYmUgZ2VuZXJhdGVkIHdpdGggM2Qgdmlld3MuIFVzdWFsbHkgdGhpcyBzaG91bGQgbm90IGhhcHBlbiwgYW5kIHRoZSBzdG9yZWQgaW1hZ2VzIHNob3VsZCBiZVxyXG4gIC8vIGxvYWRlZCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlIGFuZCBmZXdlciByZXNvdXJjZXMgdXNlZC5cclxuICBnZW5lcmF0ZUljb25JbWFnZXM6IHtcclxuICAgIHR5cGU6ICdmbGFnJ1xyXG4gIH0sXHJcblxyXG4gIC8vIExlbmd0aCAoaW4gc2Vjb25kcykgb2YgZWFjaCBpbnRlcm5hbCBwMiB0aW1lc3RlcC4gUmFuIGludG8gd2VpcmQgYmVoYXZpb3Igd2hlbiB3ZSBoYWQgb25seSA2MCBhIHNlY29uZC5cclxuICBwMkZpeGVkVGltZVN0ZXA6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxIC8gMTIwXHJcbiAgfSxcclxuXHJcbiAgLy8gQ29udHJvbHMgdGhlIG1heGltdW0gbnVtYmVyIG9mIHBoeXNpY3Mgc3Vic3RlcHMgaW4gYSBzaW5nbGUgc3RlcC4gVXN1YWxseSBub3QgcmVhY2hlZFxyXG4gIHAyTWF4U3ViU3RlcHM6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAzMFxyXG4gIH0sXHJcblxyXG4gIC8vIFdlIG11bHRpcGx5IG91ciBtb2RlbCBzaXplcyAod2lkdGgvaGVpZ2h0LCBldGMuKSBieSB0aGlzIGFtb3VudCBiZWZvcmUgaXQgaXMgc2VudCB0byB0aGUgcGh5c2ljcyBlbmdpbmUsIHNvIHRoZVxyXG4gIC8vIGVuZ2luZSB0aGlua3MgdGhpbmdzIGFyZSB0aGlzLW11Y2gtYmlnZ2VyLlxyXG4gIHAyU2l6ZVNjYWxlOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogNVxyXG4gIH0sXHJcblxyXG4gIC8vIFdlIG11bHRpcGx5IG91ciBtYXNzIGFtb3VudHMgYnkgdGhpcyBhbW91bnQgYmVmb3JlIGl0IGlzIHNlbnQgdG8gdGhlIHBoeXNpY3MgZW5naW5lLCBzbyB0aGUgZW5naW5lIHRoaW5rcyB0aGluZ3NcclxuICAvLyBhcmUgdGhpcy1tdWNoLW1vcmUtbWFzc2l2ZVxyXG4gIHAyTWFzc1NjYWxlOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMC4xXHJcbiAgfSxcclxuXHJcbiAgLy8gRGVmYXVsdCAobWF4aW11bSkgbnVtYmVyIG9mIG1haW4gaXRlcmF0aW9ucyBwZXIgc3RlcCB0byBydW4gYmVmb3JlIHJlYWNoaW5nIHRoZSB0b2xlcmFuY2VcclxuICBwMkl0ZXJhdGlvbnM6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiA0MFxyXG4gIH0sXHJcblxyXG4gIC8vIEFtb3VudCBvZiBpdGVyYXRpb25zIHVzZWQgdG8gY29tcHV0ZSBmcmljdGlvblxyXG4gIHAyRnJpY3Rpb25JdGVyYXRpb25zOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogNTAwXHJcbiAgfSxcclxuXHJcbiAgLy8gV2hlbiB0aGUgYW1vdW50IG9mIGVycm9yIGdvZXMgYmVsb3cgdGhpcyBhbW91bnQsIGZ1cnRoZXIgaXRlcmF0aW9ucyBhcmUgbm90IGRvbmVcclxuICBwMlRvbGVyYW5jZToge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDFlLTEwXHJcbiAgfSxcclxuXHJcbiAgLy8gSG93IFwiYm91bmN5XCIgdGhpbmdzIGFyZSBzdXBwb3NlZCB0byBiZSAoMC0xIGdlbmVyYWxseSlcclxuICBwMlJlc3RpdHV0aW9uOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMFxyXG4gIH0sXHJcblxyXG4gIC8vIEFuIGFtb3VudCBvZiBmb3JjZSBhcHBsaWVkIHRvIGFsbCBwb2ludGVyLW1hc3MgaW50ZXJhY3Rpb25zIChlLmcuIHdoZW4geW91IGdyYWIgaXQgd2l0aCB0aGUgbW91c2UpXHJcbiAgcDJQb2ludGVyQmFzZUZvcmNlOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMjUwMFxyXG4gIH0sXHJcblxyXG4gIC8vIEFkZHMgdG8gdGhlIGFtb3VudCBvZiBmb3JjZSBhcHBsaWVkIHRvIGFsbCBwb2ludGVyLW1hc3MgaW50ZXJhY3Rpb25zIChlLmcuIHdoZW4geW91IGdyYWIgaXQgd2l0aCB0aGUgbW91c2UpLCBidXRcclxuICAvLyBpcyB0aGlzIHZhbHVlIFRJTUVTIHRoZSBtYXNzJ3MgbWFzcyB2YWx1ZS5cclxuICBwMlBvaW50ZXJNYXNzRm9yY2U6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwXHJcbiAgfSxcclxuXHJcbiAgLy8gU3RpZmZuZXNzOlxyXG4gIC8vIFwiSGFyZG5lc3Mgb2YgdGhlIGNvbnRhY3QuIExlc3Mgc3RpZmZuZXNzIHdpbGwgbWFrZSB0aGUgb2JqZWN0cyBwZW5ldHJhdGUgbW9yZSwgYW5kIHdpbGwgbWFrZSB0aGUgY29udGFjdCBhY3QgbW9yZVxyXG4gIC8vIGxpa2UgYSBzcHJpbmcgdGhhbiBhIGNvbnRhY3QgZm9yY2UuXCIgLSBwMiBkZWZhdWx0IGlzIDFlNlxyXG4gIC8vIENhbiBiZSBpbmNyZWFzZWQsIGJ1dCBjYW4gbWFrZSB0aGluZ3MgdW5zdGFibGUgb3IgYm91bmN5LlxyXG5cclxuICAvLyBTdGlmZm5lc3MgdG8gdXNlIGZvciBncm91bmQtbWFzcyBpbnRlcmFjdGlvbnNcclxuICBwMkdyb3VuZFN0aWZmbmVzczoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDFlNlxyXG4gIH0sXHJcblxyXG4gIC8vIFN0aWZmbmVzcyB0byB1c2UgZm9yIGJhcnJpZXItbWFzcyBpbnRlcmFjdGlvbnNcclxuICBwMkJhcnJpZXJTdGlmZm5lc3M6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxZTZcclxuICB9LFxyXG5cclxuICAvLyBTdGlmZm5lc3MgdG8gdXNlIGZvciBtYXNzLW1hc3MgaW50ZXJhY3Rpb25zXHJcbiAgcDJEeW5hbWljU3RpZmZuZXNzOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMWU2XHJcbiAgfSxcclxuXHJcbiAgLy8gUmVsYXhhdGlvbjpcclxuICAvLyBcIlRoZSBudW1iZXIgb2YgdGltZSBzdGVwcyBuZWVkZWQgdG8gc3RhYmlsaXplIHRoZSBjb25zdHJhaW50IGVxdWF0aW9uLiBUeXBpY2FsbHkgYmV0d2VlbiAzIGFuZCA1IHRpbWUgc3RlcHMuXCJcclxuICAvLyBwMiBkZWZhdWx0IGlzIDQuXHJcblxyXG4gIC8vIFJlbGF4YXRpb24gdG8gdXNlIGZvciBncm91bmQtbWFzcyBpbnRlcmFjdGlvbnNcclxuICBwMkdyb3VuZFJlbGF4YXRpb246IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgLy8gU2xpZ2h0bHkgaW5jcmVhc2VkIGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZGVuc2l0eS9pc3N1ZXMvNTNcclxuICAgIGRlZmF1bHRWYWx1ZTogMi41IC8vIHJlZHVjdGlvbiByZXN1bHRzIGluIGxlc3MgZ3JvdW5kIHBlbmV0cmF0aW9uIHdoZW4gYSBtYXNzIGlzIHNpdHRpbmcgb24gdGhlIGdyb3VuZFxyXG4gIH0sXHJcblxyXG4gIC8vIFJlbGF4YXRpb24gdG8gdXNlIGZvciBiYXJyaWVyLW1hc3MgaW50ZXJhY3Rpb25zXHJcbiAgcDJCYXJyaWVyUmVsYXhhdGlvbjoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDRcclxuICB9LFxyXG5cclxuICAvLyBSZWxheGF0aW9uIHRvIHVzZSBmb3IgbWFzcy1tYXNzIGludGVyYWN0aW9uc1xyXG4gIHAyRHluYW1pY1JlbGF4YXRpb246IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiA0XHJcbiAgfSxcclxuXHJcbiAgLy8gQ29udHJvbHMgdGhlIHByb3BvcnRpb25hbCBhbW91bnQgb2Ygb3ZlcmFsbCByZXN1bHQgdmlzY29zaXR5IGZvcmNlcyBhcHBsaWVkXHJcbiAgdmlzY29zaXR5TXVsdGlwbGllcjoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDFcclxuICB9LFxyXG5cclxuICAvLyBBIG1peCBiZXR3ZWVuIDA6IEZ1bGwgdmlzY29zaXR5IGlzIGFwcGxpZWQgd2hlbiBhbnkgcGFydCBvZiBhIG1hc3MgaXMgaW4gdGhlIGxpcXVpZCwgMTogVGhlIHZpc2Nvc2l0eSBlZmZlY3QgaXNcclxuICAvLyBtdWx0aXBsaWVkIHRpbWVzIHRoZSBwcm9wb3J0aW9uIG9mIHRoZSBtYXNzIHN1Ym1lcmdlZCAobG93ZXJpbmcgdmlzY29zaXR5IHdoZW4gcGFydGlhbGx5IHN1Ym1lcmdlZCkuXHJcbiAgdmlzY29zaXR5U3VibWVyZ2VkUmF0aW86IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwXHJcbiAgfSxcclxuXHJcbiAgLy8gVmlzY29zaXR5IGZvciBtYXNzZXMgbGFyZ2VyIHRoYW4gdGhpcyB3aWxsIGJlIHJlZHVjZWQgdG8gdGhlIGZvcmNlIGZvciB0aGlzIHZpc2Nvc2l0eSAoc29tZXdoYXQgb2YgYSBoYWNLKVxyXG4gIHZpc2Nvc2l0eU1hc3NDdXRvZmY6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwLjVcclxuICB9XHJcbn0gKTtcclxuXHJcbmRlbnNpdHlCdW95YW5jeUNvbW1vbi5yZWdpc3RlciggJ0RlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycycsIERlbnNpdHlCdW95YW5jeUNvbW1vblF1ZXJ5UGFyYW1ldGVycyApO1xyXG5leHBvcnQgZGVmYXVsdCBEZW5zaXR5QnVveWFuY3lDb21tb25RdWVyeVBhcmFtZXRlcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDZCQUE2QjtBQUUvRCxPQUFPLE1BQU1DLGlCQUFpQixHQUFHLENBQUUsUUFBUSxFQUFFLGlCQUFpQixDQUFXO0FBR3pFLE1BQU1DLG9DQUFvQyxHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFO0VBRXRFQyxNQUFNLEVBQUU7SUFDTkMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFLEdBQUc7SUFDakJDLE1BQU0sRUFBRSxJQUFJO0lBQ1pDLFlBQVksRUFBSUMsS0FBYSxJQUFNQSxLQUFLLElBQUksQ0FBQyxJQUFJQSxLQUFLLElBQUk7RUFDNUQsQ0FBQztFQUVEO0VBQ0FDLFdBQVcsRUFBRTtJQUNYTCxJQUFJLEVBQUUsUUFBUTtJQUNkTSxXQUFXLEVBQUVYLGlCQUFpQjtJQUM5Qk0sWUFBWSxFQUFFLFFBQVE7SUFDdEJDLE1BQU0sRUFBRTtFQUNWLENBQUM7RUFFRDtFQUNBSyxtQkFBbUIsRUFBRTtJQUNuQlAsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBTyxTQUFTLEVBQUU7SUFDVFIsSUFBSSxFQUFFO0VBQ1IsQ0FBQztFQUVEO0VBQ0FTLFdBQVcsRUFBRTtJQUNYVCxJQUFJLEVBQUU7RUFDUixDQUFDO0VBRUQ7RUFDQTtFQUNBVSxrQkFBa0IsRUFBRTtJQUNsQlYsSUFBSSxFQUFFO0VBQ1IsQ0FBQztFQUVEO0VBQ0FXLGVBQWUsRUFBRTtJQUNmWCxJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUUsQ0FBQyxHQUFHO0VBQ3BCLENBQUM7RUFFRDtFQUNBVyxhQUFhLEVBQUU7SUFDYlosSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBO0VBQ0FZLFdBQVcsRUFBRTtJQUNYYixJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVEO0VBQ0E7RUFDQWEsV0FBVyxFQUFFO0lBQ1hkLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQWMsWUFBWSxFQUFFO0lBQ1pmLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQWUsb0JBQW9CLEVBQUU7SUFDcEJoQixJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVEO0VBQ0FnQixXQUFXLEVBQUU7SUFDWGpCLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQWlCLGFBQWEsRUFBRTtJQUNibEIsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBa0Isa0JBQWtCLEVBQUU7SUFDbEJuQixJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVEO0VBQ0E7RUFDQW1CLGtCQUFrQixFQUFFO0lBQ2xCcEIsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBO0VBQ0E7RUFDQTs7RUFFQTtFQUNBb0IsaUJBQWlCLEVBQUU7SUFDakJyQixJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVEO0VBQ0FxQixrQkFBa0IsRUFBRTtJQUNsQnRCLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQXNCLGtCQUFrQixFQUFFO0lBQ2xCdkIsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBO0VBQ0E7O0VBRUE7RUFDQXVCLGtCQUFrQixFQUFFO0lBQ2xCeEIsSUFBSSxFQUFFLFFBQVE7SUFDZDtJQUNBQyxZQUFZLEVBQUUsR0FBRyxDQUFDO0VBQ3BCLENBQUM7O0VBRUQ7RUFDQXdCLG1CQUFtQixFQUFFO0lBQ25CekIsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBeUIsbUJBQW1CLEVBQUU7SUFDbkIxQixJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVEO0VBQ0EwQixtQkFBbUIsRUFBRTtJQUNuQjNCLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQTtFQUNBMkIsdUJBQXVCLEVBQUU7SUFDdkI1QixJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVEO0VBQ0E0QixtQkFBbUIsRUFBRTtJQUNuQjdCLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNoQjtBQUNGLENBQUUsQ0FBQztBQUVIUCxxQkFBcUIsQ0FBQ29DLFFBQVEsQ0FBRSxzQ0FBc0MsRUFBRWxDLG9DQUFxQyxDQUFDO0FBQzlHLGVBQWVBLG9DQUFvQyJ9