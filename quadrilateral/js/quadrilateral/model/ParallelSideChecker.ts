// Copyright 2022-2023, University of Colorado Boulder

/**
 * Responsible for keeping two opposite sides of the quadrilateral and calculating if they are parallel within
 * tolerance intervals.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
import QuadrilateralSidePair from './QuadrilateralSidePair.js';
import QuadrilateralShapeModel from './QuadrilateralShapeModel.js';

export default class ParallelSideChecker {

  // The tolerance interval used to compare angles in the calculation that determines if two opposite sides are
  // parallel. Without a bit of tolerance it would be extremely difficult to create parallel sides. This value
  // will be different depending on the runtime environment controlled by query parameters.
  private readonly parallelAngleToleranceInterval: number;

  public readonly sidePair: QuadrilateralSidePair;

  // A Property indicating that the provided sides are parallel, ONLY FOR DEBUGGING. Use areSidesParallel() when the
  // QuadrilateralShapeModel is stable instead.
  //
  // It is unfortunate that this Property is not public, but that is not possible because the value of this Property
  // is dependent on multiple `QuadrilateralVertex.positionProperty`s. When moving sides, this value will have bad transient values
  // as vertex positions change one at a time. See QuadrilateralShapeModel.updateOrderDependentProperties() for more
  // information.
  private readonly isParallelProperty: Property<boolean>;

  /**
   * @param sidePair - The QuadrilateralSidePair with opposite sides that we want to inspect for parallelism
   * @param shapeChangedEmitter - Emitter for when the quadrilateral shape changes in some way.
   * @param tandem
   */
  public constructor( sidePair: QuadrilateralSidePair, shapeChangedEmitter: TEmitter, tandem: Tandem ) {

    this.sidePair = sidePair;

    this.isParallelProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isParallelProperty' ),
      phetioReadOnly: true
    } );

    this.parallelAngleToleranceInterval = QuadrilateralShapeModel.getWidenedToleranceInterval( QuadrilateralQueryParameters.parallelAngleToleranceInterval );

    // For debugging only. This Property may become true/false as QuadrilateralVertex positionProperties are set one at a time. When
    // moving sides, this can change intermittently. Use areSidesParallel() when the shape is stable instead.
    shapeChangedEmitter.addListener( () => {
      this.isParallelProperty.value = this.areSidesParallel();
    } );
  }

  /**
   * Returns true if two angles are close enough to each other that they should be considered equal. They are close
   * enough if they are within the parallelAngleToleranceInterval.
   */
  public isAngleEqualToOther( angle1: number, angle2: number ): boolean {
    return Utils.equalsEpsilon( angle1, angle2, this.parallelAngleToleranceInterval );
  }

  /**
   * Returns whether the two sides are currently parallel within parallelAngleToleranceInterval.
   */
  public areSidesParallel(): boolean {
    const side1 = this.sidePair.component1;
    const side2 = this.sidePair.component2;
    assert && assert( side1.vertex1.angleProperty.value !== null, 'angles need to be available to determine parallel state' );
    assert && assert( side2.vertex2.angleProperty.value !== null, 'angles need to be available to determine parallel state' );

    // Two sides are parallel if the vertex angles of a shared adjacent side add up to Math.PI. The quadrilateral is
    // constructed such that the shared adjacent side is composed of vertex1 of side1 and vertex2 of side2.
    // We use this to determine which angles to inspect in the calculation.
    //                                  side1
    //                        vertex1---------------vertex2
    //                           |                   |
    //      shared adjacent side |                   |
    //                           |                   |
    //                           |-------------------|
    //                        vertex2   side2       vertex1
    return this.isAngleEqualToOther( side1.vertex1.angleProperty.value! + side2.vertex2.angleProperty.value!, Math.PI );
  }
}

quadrilateral.register( 'ParallelSideChecker', ParallelSideChecker );
