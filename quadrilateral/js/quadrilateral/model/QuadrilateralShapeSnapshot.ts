// Copyright 2021-2023, University of Colorado Boulder

/**
 * A snapshot of the model Properties at a point in time needed to compare against other states to watch
 * how the model is changing over time.
 *
 * Currently, this is used in description code to describe how the shape changes between distinct events (which sounds
 * better than creating a new description every Property change).
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import QuadrilateralShapeModel from './QuadrilateralShapeModel.js';
import QuadrilateralSideLabel from './QuadrilateralSideLabel.js';
import QuadrilateralVertexLabel from './QuadrilateralVertexLabel.js';
import NamedQuadrilateral from './NamedQuadrilateral.js';

export default class QuadrilateralShapeSnapshot {
  public readonly isParallelogram: boolean;
  public readonly sideABsideCDParallel: boolean;
  public readonly sideBCsideDAParallel: boolean;
  public readonly namedQuadrilateral: NamedQuadrilateral;
  public readonly area: number;
  private readonly shapeModel: QuadrilateralShapeModel;

  public readonly vertexAPosition: Vector2;
  public readonly vertexBPosition: Vector2;
  public readonly vertexCPosition: Vector2;
  public readonly vertexDPosition: Vector2;

  public readonly vertexAAngle: number;
  public readonly vertexBAngle: number;
  public readonly vertexCAngle: number;
  public readonly vertexDAngle: number;

  public readonly sideABLength: number;
  public readonly sideBCLength: number;
  public readonly sideDALength: number;
  public readonly sideCDLength: number;
  private readonly sideLengths: readonly number[];

  public constructor( shapeModel: QuadrilateralShapeModel ) {
    this.isParallelogram = shapeModel.isParallelogram();
    this.sideABsideCDParallel = shapeModel.sideABSideCDParallelSideChecker.areSidesParallel();
    this.sideBCsideDAParallel = shapeModel.sideBCSideDAParallelSideChecker.areSidesParallel();
    this.area = shapeModel.areaProperty.value;
    this.namedQuadrilateral = shapeModel.shapeNameProperty.value;
    this.shapeModel = shapeModel;

    this.vertexAPosition = shapeModel.vertexA.positionProperty.value;
    this.vertexBPosition = shapeModel.vertexB.positionProperty.value;
    this.vertexCPosition = shapeModel.vertexC.positionProperty.value;
    this.vertexDPosition = shapeModel.vertexD.positionProperty.value;

    this.vertexAAngle = shapeModel.vertexA.angleProperty.value!;
    this.vertexBAngle = shapeModel.vertexB.angleProperty.value!;
    this.vertexCAngle = shapeModel.vertexC.angleProperty.value!;
    this.vertexDAngle = shapeModel.vertexD.angleProperty.value!;

    this.sideABLength = shapeModel.sideAB.lengthProperty.value;
    this.sideBCLength = shapeModel.sideBC.lengthProperty.value;
    this.sideCDLength = shapeModel.sideCD.lengthProperty.value;
    this.sideDALength = shapeModel.sideDA.lengthProperty.value;
    this.sideLengths = [
      this.sideABLength,
      this.sideBCLength,
      this.sideDALength,
      this.sideCDLength
    ];
  }

  /**
   * Returns the saved QuadrilateralVertex angle of a particular QuadrilateralVertex given the QuadrilateralVertexLabel.
   */
  public getAngleFromVertexLabel( label: QuadrilateralVertexLabel ): number {
    return label === QuadrilateralVertexLabel.VERTEX_A ? this.vertexAAngle :
           label === QuadrilateralVertexLabel.VERTEX_B ? this.vertexBAngle :
           label === QuadrilateralVertexLabel.VERTEX_C ? this.vertexCAngle :
           this.vertexDAngle; // VERTEX_D
  }

  public getLengthFromSideLabel( label: QuadrilateralSideLabel ): number {
    return label === QuadrilateralSideLabel.SIDE_AB ? this.sideABLength :
           label === QuadrilateralSideLabel.SIDE_BC ? this.sideBCLength :
           label === QuadrilateralSideLabel.SIDE_CD ? this.sideCDLength :
           this.sideDALength; // SIDE_DA
  }

  /**
   * Returns the saved QuadrilateralVertex position of a particular QuadrilateralVertex given the QuadrilateralVertexLabel.
   */
  public getPositionFromVertexLabel( label: QuadrilateralVertexLabel ): Vector2 {
    return label === QuadrilateralVertexLabel.VERTEX_A ? this.vertexAPosition :
           label === QuadrilateralVertexLabel.VERTEX_B ? this.vertexBPosition :
           label === QuadrilateralVertexLabel.VERTEX_C ? this.vertexCPosition :
           this.vertexDPosition; // VERTEX_D
  }

  /**
   * Returns the saved vertex positions of a side given the QuadrilateralSideLabel. Returns an array with the
   * vertex positions in order like [ side.vertex1, side.vertex2 ].
   */
  public getVertexPositionsFromSideLabel( label: QuadrilateralSideLabel ): [ Vector2, Vector2 ] {
    return label === QuadrilateralSideLabel.SIDE_AB ? [ this.vertexAPosition, this.vertexBPosition ] :
           label === QuadrilateralSideLabel.SIDE_BC ? [ this.vertexBPosition, this.vertexCPosition ] :
           label === QuadrilateralSideLabel.SIDE_CD ? [ this.vertexCPosition, this.vertexDPosition ] :
             [ this.vertexDPosition, this.vertexAPosition ]; // SIDE_DA
  }

  /**
   * Returns the saved side lengths of adjacent sides for side defined by the QuadrilateralSideLabel. Returns
   * an array of adjacent side lengths in order moving clockwise like this:
   *                sideLabel
   *               ----------
   *              |         |
   * adjacentSide1|         |adjacentSide2
   *              |         |
   *              |         |
   *
   * @returns [adjacentSide1.lengthProperty.value, adjacentSide2.lengthProperty.value]
   */
  public getAdjacentSideLengthsFromSideLabel( label: QuadrilateralSideLabel ): [ number, number ] {
    return label === QuadrilateralSideLabel.SIDE_AB ? [ this.sideDALength, this.sideBCLength ] :
           label === QuadrilateralSideLabel.SIDE_BC ? [ this.sideABLength, this.sideCDLength ] :
           label === QuadrilateralSideLabel.SIDE_CD ? [ this.sideBCLength, this.sideDALength ] :
             [ this.sideCDLength, this.sideABLength ]; // SIDE_DA
  }

  /**
   * Returns true if the sides adjacent to the QuadrilateralSide labelled by provided QuadrilateralSideLabel are parallel in this snapshot.
   * For example, given the following:
   *
   *                sideLabel
   *               ----------
   *              |         |
   * adjacentSide1|         |adjacentSide2
   *              |         |
   *              |         |
   *
   * Will return true if adjacentSide1 and adjacentSide2 are parallel.
   */
  public getAdjacentSidesParallelFromSideLabel( label: QuadrilateralSideLabel ): boolean {
    return label === QuadrilateralSideLabel.SIDE_AB ? this.sideBCsideDAParallel :
           label === QuadrilateralSideLabel.SIDE_BC ? this.sideABsideCDParallel :
           label === QuadrilateralSideLabel.SIDE_CD ? this.sideBCsideDAParallel :
           this.sideABsideCDParallel; // SIDE_DA
  }

  /**
   * Counts the number of sides in this snapshot that have the same length, returning the largest count. If all are
   * the same, returns 4. Otherwise, will return 3, then 2, then 0.
   */
  public countNumberOfEqualSides(): number {
    let numberOfEqualSides = 0;
    for ( let i = 0; i < this.sideLengths.length; i++ ) {
      const currentLength = this.sideLengths[ i ];

      let numberEqualToCurrentLength = 0;
      for ( let j = 0; j < this.sideLengths.length; j++ ) {
        const nextLength = this.sideLengths[ j ];

        if ( this.shapeModel.isInterLengthEqualToOther( currentLength, nextLength ) ) {
          numberEqualToCurrentLength++;
        }
      }

      if ( numberEqualToCurrentLength > numberOfEqualSides ) {
        numberOfEqualSides = numberEqualToCurrentLength;
      }
    }

    return numberOfEqualSides;
  }
}

quadrilateral.register( 'QuadrilateralShapeSnapshot', QuadrilateralShapeSnapshot );
