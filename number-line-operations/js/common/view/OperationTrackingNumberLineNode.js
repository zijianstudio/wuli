// Copyright 2020-2021, University of Colorado Boulder

/**
 * OperationTrackingNumberLineNode is a specialization of SpatializedNumberLineNode that adds the ability to depict
 * labeled operations that have occurred between the points on the number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import PointsOffScaleCondition from '../../../../number-line-common/js/common/view/PointsOffScaleCondition.js';
import SpatializedNumberLineNode from '../../../../number-line-common/js/common/view/SpatializedNumberLineNode.js';
import merge from '../../../../phet-core/js/merge.js';
import numberLineOperations from '../../numberLineOperations.js';
import NLOConstants from '../NLOConstants.js';
import NumberLineOperationNode from './NumberLineOperationNode.js';

class OperationTrackingNumberLineNode extends SpatializedNumberLineNode {

  /**
   * {OperationTrackingNumberLine} numberLine - model of a number line
   * {Object} [options] - options that control the appearance of the number line
   * @public
   */
  constructor( numberLine, options ) {

    options = merge( {

      // This is here as documentation so that clients know how options are passed through to the operation nodes.
      numberLineOperationNodeOptions: {},
      pointsOffScaleCondition: PointsOffScaleCondition.ALL

    }, options );

    super( numberLine, options );

    // @private
    this.numberLine = numberLine;
    this.operationToNodeMap = new Map();

    // Create an operation node for each operation on the number line.
    numberLine.operations.forEach( ( operation, index ) => {

      // nodes for even-indexed operations go above the number line, odd below
      const operationNodeOptions = index % 2 === 1 ?
        { relativePosition: NumberLineOperationNode.RelativePosition.BELOW_NUMBER_LINE } :
        {};

      // Add the node.
      const numberLineOperationNode = new NumberLineOperationNode(
        operation,
        numberLine.showOperationLabelsProperty,
        numberLine.showOperationDescriptionsProperty,
        numberLine,
        merge( operationNodeOptions, options.numberLineOperationNodeOptions )
      );
      this.addChild( numberLineOperationNode );

      // The operation nodes should be behind the points and the labels.
      numberLineOperationNode.moveToBack();

      // Map it to the operation.
      this.operationToNodeMap.set( operation, numberLineOperationNode );
    } );
  }

  /**
   * @public
   */
  step() {

    // Fade operation nodes that are set to expire.
    for ( const [ operation, operationNode ] of this.operationToNodeMap ) {
      if ( this.numberLine.operationExpirationTimes.has( operation ) ) {
        const expirationTimeForOperation = this.numberLine.operationExpirationTimes.get( operation );
        operationNode.opacity = Math.min( 1, ( expirationTimeForOperation - phet.joist.elapsedTime ) / NLOConstants.OPERATION_FADE_OUT_TIME );
      }
    }
  }
}

numberLineOperations.register( 'OperationTrackingNumberLineNode', OperationTrackingNumberLineNode );
export default OperationTrackingNumberLineNode;
