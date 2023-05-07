// Copyright 2014-2021, University of Colorado Boulder

/**
 * Definition of the 'cylinder exploration mode' for the exploration model.
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color } from '../../../../scenery/js/imports.js';
import EstimationConstants from '../../common/EstimationConstants.js';
import CylinderModel from '../../common/model/CylinderModel.js';
import estimation from '../../estimation.js';
import AbstractExplorationMode from './AbstractExplorationMode.js';

// constants
const MAX_CYLINDER_SLICES = 100;
const MODE_NAME = 'cylinders';
const REFERENCE_CYLINDER_WIDTH = 1.5;
const COMPARE_CYLINDER_SIZE = new Dimension2( REFERENCE_CYLINDER_WIDTH, 2 );
const VALID_REF_OBJECT_SIZES = [
  new Dimension2( REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 50 ),
  new Dimension2( REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 20 ),
  new Dimension2( REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 15 ),
  new Dimension2( REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 10 ),
  new Dimension2( REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 5 ),
  new Dimension2( REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 3 ),
  new Dimension2( REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 2 )
];
const INITIAL_REFERENCE_OBJECT_SIZE = VALID_REF_OBJECT_SIZES[ 2 ];

class CylinderExplorationMode extends AbstractExplorationMode {

  constructor( selectedModeProperty ) {
    super( selectedModeProperty, MODE_NAME );

    // Create the reference, compare, continuous, and discrete objects.
    const compareCylinderPosition = new Vector2( 0.75, -0.5 );
    this.compareObject = new CylinderModel( COMPARE_CYLINDER_SIZE, compareCylinderPosition, new Color( EstimationConstants.COMPARISON_OBJECT_COLOR ).setAlpha( 0.5 ), false, false );
    this.continuousSizableObject = new CylinderModel( new Dimension2( 2, 1 ), compareCylinderPosition, EstimationConstants.REFERENCE_OBJECT_COLOR, false, false );
    this.referenceObject = new CylinderModel( INITIAL_REFERENCE_OBJECT_SIZE, new Vector2( -2.0, 0 ), EstimationConstants.REFERENCE_OBJECT_COLOR, false, false );
    _.times( MAX_CYLINDER_SLICES, () => {
      // Initial size is arbitrary, will be sized as needed.
      this.discreteObjectList.push( new CylinderModel( new Dimension2( 1.0, 1.0 ), Vector2.ZERO, EstimationConstants.REFERENCE_OBJECT_COLOR, true, false ) );
    } );
    this.setReferenceObjectSize( INITIAL_REFERENCE_OBJECT_SIZE );
    this.numVisibleDiscreteCylinders = 0;

    // Complete initialization by hooking up visibility updates in the parent class.
    this.hookUpVisibilityUpdates();

    // Maintain a short history of reference object sizes so unique ones can be chosen.
    this.previousReferenceObjectSize = INITIAL_REFERENCE_OBJECT_SIZE;
  }

  // TODO: Visibility annotations should be checked and updated, see https://github.com/phetsims/estimation/issues/9

  // @public
  setReferenceObjectSize( size ) {
    this.referenceObject.sizeProperty.value = size;

    // Size and position the discrete cylinder slices based on the sizes of
    // the reference cube and the compare cylinder.
    const cylindersPerRow = this.compareObject.sizeProperty.value.width / this.referenceObject.sizeProperty.value.width;
    const numRows = this.discreteObjectList.length / cylindersPerRow;
    const origin = this.compareObject.positionProperty.value;
    for ( let i = 0; i < numRows; i++ ) {
      for ( let j = 0; j < cylindersPerRow; j++ ) {
        const index = i * cylindersPerRow + j;
        this.discreteObjectList[ index ].sizeProperty.value = this.referenceObject.sizeProperty.value;
        this.discreteObjectList[ index ].positionProperty.value = new Vector2( origin.x + j * this.referenceObject.sizeProperty.value.width,
          origin.y + i * this.referenceObject.sizeProperty.value.height );
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
    const targetNumVisibleDiscreteCylinders = selectedMode === 'cylinders' && this.continuousOrDiscreteProperty.value === 'discrete' ? this.estimateProperty.value : 0;
    const startIndex = Math.min( this.numVisibleDiscreteCylinders, targetNumVisibleDiscreteCylinders );
    const endIndex = Math.max( this.numVisibleDiscreteCylinders, targetNumVisibleDiscreteCylinders );
    const visibility = targetNumVisibleDiscreteCylinders > this.numVisibleDiscreteCylinders;
    for ( let i = startIndex; i < endIndex && i < MAX_CYLINDER_SLICES; i++ ) {
      this.discreteObjectList[ i ].visibleProperty.value = visibility;
    }
    this.numVisibleDiscreteCylinders = targetNumVisibleDiscreteCylinders;
  }

  // @public
  updateContinuousObjectSize( estimateValue ) {
    this.continuousSizableObject.sizeProperty.value = new Dimension2( this.referenceObject.sizeProperty.value.width,
      this.referenceObject.sizeProperty.value.height * estimateValue );
  }
}

estimation.register( 'CylinderExplorationMode', CylinderExplorationMode );

export default CylinderExplorationMode;