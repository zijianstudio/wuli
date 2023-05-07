// Copyright 2014-2021, University of Colorado Boulder

/**
 * Definition of the 'cube exploration mode' for the exploration model.
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color } from '../../../../scenery/js/imports.js';
import EstimationConstants from '../../common/EstimationConstants.js';
import CubeModel from '../../common/model/CubeModel.js';
import Dimension3 from '../../common/model/Dimension3.js';
import estimation from '../../estimation.js';
import AbstractExplorationMode from './AbstractExplorationMode.js';

// constants
const MAX_DISCRETE_CUBES = 200;
const MODE_NAME = 'cubes';
const COMPARE_CUBE_SIZE = new Dimension3( 1.75, 1.75, 1.75 );
const VALID_REF_OBJECT_SIZES = [
  new Dimension3( COMPARE_CUBE_SIZE.width / 5, COMPARE_CUBE_SIZE.height / 5, COMPARE_CUBE_SIZE.depth / 5 ),
  new Dimension3( COMPARE_CUBE_SIZE.width / 4, COMPARE_CUBE_SIZE.height / 4, COMPARE_CUBE_SIZE.depth / 4 ),
  new Dimension3( COMPARE_CUBE_SIZE.width / 3, COMPARE_CUBE_SIZE.height / 3, COMPARE_CUBE_SIZE.depth / 3 ),
  new Dimension3( COMPARE_CUBE_SIZE.width / 2, COMPARE_CUBE_SIZE.height / 2, COMPARE_CUBE_SIZE.depth / 2 ),
  new Dimension3( COMPARE_CUBE_SIZE.width / 3, COMPARE_CUBE_SIZE.height / 2, COMPARE_CUBE_SIZE.depth / 2 ),
  new Dimension3( COMPARE_CUBE_SIZE.width / 4, COMPARE_CUBE_SIZE.height / 2, COMPARE_CUBE_SIZE.depth / 2 ),
  new Dimension3( COMPARE_CUBE_SIZE.width / 2, COMPARE_CUBE_SIZE.height / 4, COMPARE_CUBE_SIZE.depth / 2 )
];
const INITIAL_REFERENCE_OBJECT_SIZE = VALID_REF_OBJECT_SIZES[ 2 ];

class CubeExplorationMode extends AbstractExplorationMode {

  constructor( selectedModeProperty ) {
    super( selectedModeProperty, MODE_NAME );

    // Create the reference, compare, continuous, and discrete objects.
    const compareCubePosition = new Vector2( 0, -0.2 );
    this.compareObject = new CubeModel( COMPARE_CUBE_SIZE, compareCubePosition, new Color( EstimationConstants.COMPARISON_OBJECT_COLOR ).setAlpha( 0.5 ), false, false );
    this.continuousSizableObject = new CubeModel( new Dimension3( 0.1, 0.1, 0.1 ), compareCubePosition, EstimationConstants.REFERENCE_OBJECT_COLOR, false, false );
    this.referenceObject = new CubeModel( INITIAL_REFERENCE_OBJECT_SIZE, new Vector2( -2, 0 ), EstimationConstants.REFERENCE_OBJECT_COLOR, false, false );
    _.times( MAX_DISCRETE_CUBES, () => {
      // Initial size is arbitrary, will be sized as needed.
      this.discreteObjectList.push( new CubeModel( new Dimension3( 0.1, 0.1, 0.1 ), Vector2.ZERO, EstimationConstants.REFERENCE_OBJECT_COLOR, true, false ) );
    } );
    this.setReferenceObjectSize( INITIAL_REFERENCE_OBJECT_SIZE );
    this.numVisibleDiscreteCubes = 0;

    // Complete initialization by hooking up visibility updates in the parent class.
    this.hookUpVisibilityUpdates();

    // Maintain a short history of reference object sizes so unique ones can be chosen.
    this.previousReferenceObjectSize = INITIAL_REFERENCE_OBJECT_SIZE;
  }

  // TODO: Visibility annotations should be checked and updated, see https://github.com/phetsims/estimation/issues/9

  // @public
  setReferenceObjectSize( size ) {
    this.referenceObject.sizeProperty.value = size;

    // Size and position the discrete cubes based on the sizes of the
    // reference cube and the compare cube.
    const cubesAcross = this.compareObject.sizeProperty.value.width / this.referenceObject.sizeProperty.value.width;
    const cubesFrontToBack = this.compareObject.sizeProperty.value.depth / this.referenceObject.sizeProperty.value.depth;
    let numCubesPlaced = 0;
    const compareCubeBackCorner = this.compareObject.positionProperty.value.plus( new Vector2( ( this.compareObject.sizeProperty.value.depth ) * EstimationConstants.DEPTH_PROJECTION_PROPORTION, 0 ).rotated( EstimationConstants.CUBE_PROJECTION_ANGLE ) );
    const xUnitDisplacement = new Vector2( this.referenceObject.sizeProperty.value.width, 0 );
    const yUnitDisplacement = new Vector2( 0, this.referenceObject.sizeProperty.value.height );
    const zUnitDisplacement = new Vector2( -this.referenceObject.sizeProperty.value.depth * EstimationConstants.DEPTH_PROJECTION_PROPORTION, 0 ).rotated( EstimationConstants.CUBE_PROJECTION_ANGLE );
    const xDisplacement = new Vector2( 0, 0 );
    const yDisplacement = new Vector2( 0, 0 );
    const zDisplacement = new Vector2( 0, 0 );
    for ( let y = 0; numCubesPlaced < MAX_DISCRETE_CUBES; y++ ) {
      yDisplacement.setY( yUnitDisplacement.y * y );
      for ( let z = 0; z < cubesFrontToBack && numCubesPlaced < MAX_DISCRETE_CUBES; z++ ) {
        zDisplacement.setXY( zUnitDisplacement.x * ( z + 1 ), zUnitDisplacement.y * ( z + 1 ) );
        for ( let x = 0; x < cubesAcross && numCubesPlaced < MAX_DISCRETE_CUBES; x++ ) {
          this.discreteObjectList[ numCubesPlaced ].sizeProperty.value = this.referenceObject.sizeProperty.value;
          xDisplacement.setX( xUnitDisplacement.x * x );
          this.discreteObjectList[ numCubesPlaced ].positionProperty.value = new Vector2( compareCubeBackCorner.x + xDisplacement.x + zDisplacement.x + yDisplacement.x,
            compareCubeBackCorner.y + xDisplacement.y + zDisplacement.y + yDisplacement.y );
          numCubesPlaced++;
        }
      }
    }

    // Set the initial size of the continuous object.
    this.updateContinuousObjectSize( this.estimateProperty.value );
  }

  // @public
  newReferenceObject() {
    // Choose a random size that hasn't been chosen for a while.
    let unique = false;
    let referenceObjectSize = null;
    while ( !unique ) {
      referenceObjectSize = VALID_REF_OBJECT_SIZES[ Math.floor( dotRandom.nextDouble() * VALID_REF_OBJECT_SIZES.length ) ];
      unique = ( referenceObjectSize !== this.previousReferenceObjectSize && referenceObjectSize !== this.referenceObject.size );
    }
    this.previousReferenceObjectSize = referenceObjectSize;
    this.setReferenceObjectSize( referenceObjectSize );
  }

  // @public
  setInitialReferenceObject() {
    this.setReferenceObjectSize( INITIAL_REFERENCE_OBJECT_SIZE );
  }

  // @public
  updateDiscreteObjectVisibility( selectedMode, estimateValue ) {
    const targetNumVisibleDiscreteCubes = selectedMode === 'cubes' && this.continuousOrDiscreteProperty.value === 'discrete' ? estimateValue : 0;
    const startIndex = Math.min( this.numVisibleDiscreteCubes, targetNumVisibleDiscreteCubes );
    const endIndex = Math.max( this.numVisibleDiscreteCubes, targetNumVisibleDiscreteCubes );
    const visibility = targetNumVisibleDiscreteCubes > this.numVisibleDiscreteCubes;
    for ( let i = startIndex; i < endIndex && i < MAX_DISCRETE_CUBES; i++ ) {
      this.discreteObjectList[ i ].visibleProperty.value = visibility;
    }
    this.numVisibleDiscreteCubes = targetNumVisibleDiscreteCubes;
  }

  // @public
  updateContinuousObjectSize( estimateValue ) {

    const hr = this.referenceObject.sizeProperty.value.height;
    const wr = this.referenceObject.sizeProperty.value.width;
    const dr = this.referenceObject.sizeProperty.value.depth;

    // Set the size of the continuous cube
    if ( hr === wr && wr === dr ) {
      this.continuousSizableObject.sizeProperty.value = new Dimension3(
        wr * Math.pow( estimateValue, 1 / 3 ),
        hr * Math.pow( estimateValue, 1 / 3 ),
        dr * Math.pow( estimateValue, 1 / 3 ) );
    }
    else {
      // Scale each dimension linearly. This isn't used all the time
      // because the size won't quite match the estimate value in cases
      // other than estimate = 1 and estimate = answer, but it is likely
      // close enough that no one will be disturbed by it.
      const hc = this.compareObject.sizeProperty.value.height;
      const wc = this.compareObject.sizeProperty.value.width;
      const dc = this.compareObject.sizeProperty.value.depth;
      const answer = hc * wc * dc / ( hr * wr * dr );
      const a = ( ( 1 - wc / wr ) / ( 1 - answer ) ) * ( estimateValue - 1 ) + 1;
      const b = ( ( 1 - hc / hr ) / ( 1 - answer ) ) * ( estimateValue - 1 ) + 1;
      const c = ( ( 1 - dc / dr ) / ( 1 - answer ) ) * ( estimateValue - 1 ) + 1;
      this.continuousSizableObject.sizeProperty.value = new Dimension3( a * wr, b * hr, c * dr );

    }

    // The following hairy calculation is about figuring out where to
    // position the continuous cube so that its back corner is in the same
    // place as that of the comparison cube.
    this.continuousSizableObject.positionProperty.value = this.compareObject.positionProperty.value.plus(
      new Vector2( ( this.compareObject.sizeProperty.value.depth - this.continuousSizableObject.sizeProperty.value.depth ) * EstimationConstants.DEPTH_PROJECTION_PROPORTION,
        0 ).rotated( EstimationConstants.CUBE_PROJECTION_ANGLE ) );
  }
}

estimation.register( 'CubeExplorationMode', CubeExplorationMode );

export default CubeExplorationMode;