// Copyright 2014-2021, University of Colorado Boulder

/**
 * Definition of the 'line exploration mode' for the exploration model.
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import EstimationConstants from '../../common/EstimationConstants.js';
import RectangleModel from '../../common/model/RectangleModel.js';
import estimation from '../../estimation.js';
import AbstractExplorationMode from './AbstractExplorationMode.js';

// constants
const MAX_DISCRETE_RECTANGLES = 200;
const MODE_NAME = 'rectangles';
const COMPARE_RECTANGLE_SIZE = new Dimension2( 2, 2 );
const VALID_REF_OBJECT_SIZES = [
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 20, COMPARE_RECTANGLE_SIZE.height / 20 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 12, COMPARE_RECTANGLE_SIZE.height / 12 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 8, COMPARE_RECTANGLE_SIZE.height / 8 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 5, COMPARE_RECTANGLE_SIZE.height / 5 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 3, COMPARE_RECTANGLE_SIZE.height / 3 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 2, COMPARE_RECTANGLE_SIZE.height / 2 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 2, COMPARE_RECTANGLE_SIZE.height / 4 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 4, COMPARE_RECTANGLE_SIZE.height / 2 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 4, COMPARE_RECTANGLE_SIZE.height / 8 ),
  new Dimension2( COMPARE_RECTANGLE_SIZE.width / 8, COMPARE_RECTANGLE_SIZE.height / 4 )
];
const INITIAL_REFERENCE_OBJECT_SIZE = VALID_REF_OBJECT_SIZES[ 3 ];

class RectangleExplorationMode extends AbstractExplorationMode {

  constructor( selectedModeProperty ) {
    super( selectedModeProperty, MODE_NAME );

    // Create the reference, compare, continuous, and discrete objects.
    const compareRectPosition = new Vector2( 0, 0 );
    this.compareObject = new RectangleModel( new Dimension2( 2.0, 2.0 ), compareRectPosition, EstimationConstants.COMPARISON_OBJECT_COLOR, false, false );
    this.continuousSizableObject = new RectangleModel( new Dimension2( 2, 1 ), compareRectPosition, EstimationConstants.REFERENCE_OBJECT_COLOR, false, false );
    this.referenceObject = new RectangleModel( new Dimension2( 0.5, 0.5 ), new Vector2( -2.0, 0.5 ), EstimationConstants.REFERENCE_OBJECT_COLOR, false, false );
    _.times( MAX_DISCRETE_RECTANGLES, () => {
      // Initial size is arbitrary, will be sized as needed.
      this.discreteObjectList.push( new RectangleModel( new Dimension2( 1.0, 1.0 ), Vector2.ZERO, EstimationConstants.REFERENCE_OBJECT_COLOR, true, false ) );
    } );
    this.setReferenceObjectSize( INITIAL_REFERENCE_OBJECT_SIZE );
    this.numVisibleDiscreteRects = 0;

    // Complete initialization by hooking up visibility updates in the parent class.
    this.hookUpVisibilityUpdates();

    // Maintain a short history of reference object sizes so unique ones can be chosen.
    this.previousReferenceObjectSize = INITIAL_REFERENCE_OBJECT_SIZE;
  }

  // TODO: Visibility annotations should be checked and updated, see https://github.com/phetsims/estimation/issues/9

  // @public
  setReferenceObjectSize( size ) {
    this.referenceObject.sizeProperty.value = size;

    // Size and position the discrete rectangles based on the sizes of the
    // reference rectangle and the compare rectangle.
    const rectanglesPerRow = this.compareObject.sizeProperty.value.width / this.referenceObject.sizeProperty.value.width;
    const numRows = this.discreteObjectList.length / rectanglesPerRow;
    const origin = this.compareObject.positionProperty.value;
    for ( let i = 0; i < numRows; i++ ) {
      for ( let j = 0; j < rectanglesPerRow; j++ ) {
        const index = i * rectanglesPerRow + j;
        if ( index < MAX_DISCRETE_RECTANGLES ) {
          this.discreteObjectList[ index ].sizeProperty.value = this.referenceObject.sizeProperty.value;
          this.discreteObjectList[ index ].positionProperty.value = new Vector2( origin.x + j * this.referenceObject.sizeProperty.value.width,
            origin.y + i * this.referenceObject.sizeProperty.value.height );
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
    const targetNumVisibleDiscreteRects = selectedMode === 'rectangles' && this.continuousOrDiscreteProperty.value === 'discrete' ? estimateValue : 0;
    const startIndex = Math.min( this.numVisibleDiscreteRects, targetNumVisibleDiscreteRects );
    const endIndex = Math.max( this.numVisibleDiscreteRects, targetNumVisibleDiscreteRects );
    const visibility = targetNumVisibleDiscreteRects > this.numVisibleDiscreteRects;
    for ( let i = startIndex; i < endIndex && i < MAX_DISCRETE_RECTANGLES; i++ ) {
      this.discreteObjectList[ i ].visibleProperty.value = visibility;
    }
    this.numVisibleDiscreteRects = targetNumVisibleDiscreteRects;
  }

  // @public
  updateContinuousObjectSize( estimateValue ) {
    const hr = this.referenceObject.sizeProperty.value.height;
    const wr = this.referenceObject.sizeProperty.value.width;
    const hc = this.compareObject.sizeProperty.value.height;
    const wc = this.compareObject.sizeProperty.value.width;
    const answer = hc * wc / ( hr * wr );
    const a = ( ( 1 - wc / wr ) / ( 1 - answer ) ) * ( estimateValue - 1 ) + 1;
    const b = ( ( 1 - hc / hr ) / ( 1 - answer ) ) * ( estimateValue - 1 ) + 1;
    // Set the size of the continuous rectangle
    this.continuousSizableObject.sizeProperty.value = new Dimension2( a * wr, b * hr );
  }
}

estimation.register( 'RectangleExplorationMode', RectangleExplorationMode );

export default RectangleExplorationMode;