// Copyright 2014-2021, University of Colorado Boulder

/**
 * Type that represents a dataPoint in the view.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import { Node } from '../../../../scenery/js/imports.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';

class DataPointNode extends Node {
  /**
   * @param {DataPoint} dataPoint
   * @param {Node} representation
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( dataPoint, representation, modelViewTransform ) {
    super( { cursor: 'pointer', children: [ representation ] } );

    // Create a listener to the position of the dataPoint
    const centerPositionListener = position => {
      this.center = modelViewTransform.modelToViewPosition( position );
    };

    // Move this node as the model representation moves
    dataPoint.positionProperty.link( centerPositionListener );

    // @private: just for dispose.  Named based on the type name so it won't have a name collision with parent/child ones
    this.disposeDataPointNode = () => {
      dataPoint.positionProperty.unlink( centerPositionListener );
    };
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.disposeDataPointNode();
    super.dispose();
  }
}

leastSquaresRegression.register( 'DataPointNode', DataPointNode );

export default DataPointNode;