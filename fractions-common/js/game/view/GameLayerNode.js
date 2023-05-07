// Copyright 2018-2020, University of Colorado Boulder

/**
 * Layer implementation for the game screens (contains views for groups and pieces)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BuildingType from '../../building/model/BuildingType.js';
import BuildingLayerNode from '../../building/view/BuildingLayerNode.js';
import fractionsCommon from '../../fractionsCommon.js';

class GameLayerNode extends BuildingLayerNode {
  /**
   * @param {BuildingModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} shapeDragBoundsProperty
   * @param {Property.<Bounds2>} numberDragBoundsProperty
   * @param {Node} targetsContainer
   * @param {Node} panel
   * @param {Emitter} incorrectAttemptEmitter
   */
  constructor( model, modelViewTransform, shapeDragBoundsProperty, numberDragBoundsProperty, targetsContainer, panel, incorrectAttemptEmitter ) {
    super( model, modelViewTransform, shapeDragBoundsProperty, numberDragBoundsProperty, targetsContainer, panel );

    // @private {Node}
    this.targetsContainer = targetsContainer;
    this.panel = panel;

    // @private {Emitter}
    this.incorrectAttemptEmitter = incorrectAttemptEmitter;

    this.initialize();
  }

  /**
   * Utility function for when a Group is dragged
   * @private
   *
   * @param {Group} group
   */
  onGroupDrag( group ) {
    const modelPoints = group.centerPoints;
    const viewPoints = modelPoints.map( modelPoint => this.modelViewTransform.modelToViewPosition( modelPoint ) );
    const targetBounds = this.targetsContainer.bounds.dilated( 10 );
    if ( _.some( viewPoints, viewPoint => targetBounds.containsPoint( viewPoint ) ) ) {
      const closestTarget = this.model.findClosestTarget( modelPoints );
      group.hoveringTargetProperty.value = closestTarget;
    }
    else {
      group.hoveringTargetProperty.value = null;
    }
  }

  /**
   * Utility function for when a Group is dropped
   * @private
   *
   * @param {Group} group
   */
  onGroupDrop( group ) {
    group.hoveringTargetProperty.value = null;

    const modelPoints = group.centerPoints;
    const viewPoints = modelPoints.map( modelPoint => this.modelViewTransform.modelToViewPosition( modelPoint ) );
    const targetBounds = this.targetsContainer.bounds.dilated( 10 );
    const panelBounds = this.panel.bounds.dilated( 10 );

    if ( _.some( viewPoints, viewPoint => targetBounds.containsPoint( viewPoint ) ) ) {
      const closestTarget = this.model.findClosestTarget( modelPoints );
      const isOpen = closestTarget.groupProperty.value === null;
      const isMatch = group.totalFraction.reduced().equals( closestTarget.fraction.reduced() );

      if ( isOpen ) {
        if ( isMatch ) {
          if ( group.type === BuildingType.SHAPE ) {
            this.model.collectShapeGroup( group, closestTarget );
          }
          else {
            this.model.collectNumberGroup( group, closestTarget );
          }
          group.hoveringTargetProperty.value = null;
        }
        else {
          this.incorrectAttemptEmitter.emit();
        }
      }

      if ( !isOpen || !isMatch ) {
        this.model.centerGroup( group );
      }
    }
    else if ( _.some( viewPoints, viewPoints => panelBounds.containsPoint( viewPoints ) ) ) {
      if ( group.type === BuildingType.SHAPE ) {
        this.model.returnShapeGroup( group );
      }
      else {
        this.model.returnNumberGroup( group );
      }
    }
  }

  /**
   * Called when a ShapeGroup is dragged.
   * @protected
   * @override
   *
   * @param {ShapeGroup} shapeGroup
   */
  onShapeGroupDrag( shapeGroup ) {
    super.onShapeGroupDrag( shapeGroup );

    this.onGroupDrag( shapeGroup );
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

    this.onGroupDrop( shapeGroup );
  }

  /**
   * Called when a NumberGroup is dragged.
   * @protected
   * @override
   *
   * @param {NumberGroup} numberGroup
   */
  onNumberGroupDrag( numberGroup ) {
    super.onNumberGroupDrag( numberGroup );

    this.onGroupDrag( numberGroup );
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

    this.onGroupDrop( numberGroup );
  }
}

fractionsCommon.register( 'GameLayerNode', GameLayerNode );
export default GameLayerNode;