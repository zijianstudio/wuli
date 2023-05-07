// Copyright 2018-2020, University of Colorado Boulder

/**
 * Layer implementation for the lab screens (contains views for groups and pieces)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BuildingLayerNode from '../../building/view/BuildingLayerNode.js';
import fractionsCommon from '../../fractionsCommon.js';

class BuildingLabLayerNode extends BuildingLayerNode {
  /**
   * @param {BuildingModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} shapeDragBoundsProperty
   * @param {Property.<Bounds2>} numberDragBoundsProperty
   * @param {Node} shapePanel
   * @param {Node} numberPanel
   */
  constructor( model, modelViewTransform, shapeDragBoundsProperty, numberDragBoundsProperty, shapePanel, numberPanel ) {
    super( model, modelViewTransform, shapeDragBoundsProperty, numberDragBoundsProperty, shapePanel, numberPanel );

    // @private {Node}
    this.shapePanel = shapePanel;
    this.numberPanel = numberPanel;

    this.initialize();
  }

  /**
   * Called when a ShapeGroup is dropped.
   * @protected
   * @override
   *
   * @param {ShapeGroup} shapeGroup
   */
  onShapeGroupDrop( shapeGroup ) {
    super.onShapeGroupDrop( shapeGroup );

    const modelPoints = shapeGroup.centerPoints;
    const viewPoints = modelPoints.map( modelPoint => this.modelViewTransform.modelToViewPosition( modelPoint ) );
    const panelBounds = this.shapePanel.bounds.dilated( 10 );

    if ( _.some( viewPoints, viewPoints => panelBounds.containsPoint( viewPoints ) ) ) {
      this.model.returnShapeGroup( shapeGroup );
    }
  }

  /**
   * Called when a NumberGroup is dropped.
   * @protected
   * @override
   *
   * @param {NumberGroup} numberGroup
   */
  onNumberGroupDrop( numberGroup ) {
    super.onNumberGroupDrop( numberGroup );

    if ( this.numberPanel.bounds.dilated( 10 ).containsPoint( this.modelViewTransform.modelToViewPosition( numberGroup.positionProperty.value ) ) ) {
      this.model.returnNumberGroup( numberGroup );
    }
  }
}

fractionsCommon.register( 'BuildingLabLayerNode', BuildingLabLayerNode );
export default BuildingLabLayerNode;