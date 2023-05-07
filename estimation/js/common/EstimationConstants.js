// Copyright 2014-2020, University of Colorado Boulder


import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import estimation from '../estimation.js';

const EstimationConstants = {

  LAYOUT_BOUNDS: new Bounds2( 0, 0, 768, 504 ),

  RANGE_1_TO_10: new Range( 1, 10 ),
  RANGE_10_TO_100: new Range( 10, 100 ),
  RANGE_100_TO_1000: new Range( 100, 1000 ),
  REFERENCE_OBJECT_COLOR: 'blue',
  COMPARISON_OBJECT_COLOR: '#ff6633',

  // Proportion of depth (z dimension) projected into the 2D representation.
  DEPTH_PROJECTION_PROPORTION: 0.3,

  // Angle of depth projection for cubes, in radians
  CUBE_PROJECTION_ANGLE: Math.PI / 4
};

estimation.register( 'EstimationConstants', EstimationConstants );

export default EstimationConstants;