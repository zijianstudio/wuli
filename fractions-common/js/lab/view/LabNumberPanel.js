// Copyright 2018-2021, University of Colorado Boulder

/**
 * The bottom panel with number pieces/groups for the Lab screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Panel from '../../../../sun/js/Panel.js';
import StackNodesBox from '../../building/view/StackNodesBox.js';
import fractionsCommon from '../../fractionsCommon.js';

class LabNumberPanel extends Panel {
  /**
   * @param {BuildingLabModel} model
   * @param {function} pressCallback - function( {SceneryEvent}, {Stack} ) - Called when a press is started.
   */
  constructor( model, pressCallback ) {
    const box = new StackNodesBox( [
      model.numberGroupStacks[ 0 ],
      ...model.numberStacks,
      ...( model.allowMixedNumbers ? [ model.numberGroupStacks[ 1 ] ] : [] )
    ], pressCallback );

    super( box, {
      xMargin: 20
    } );

    // @private {StackNodesBox}
    this.box = box;
  }

  /**
   * Sets the model positions of our model objects corresponding to their displayed (view) positions.
   * @public
   *
   * @param {ModelViewTransform2} modelViewTransform
   */
  updateModelPositions( modelViewTransform ) {
    this.box.updateModelPositions( modelViewTransform, this );
  }
}

fractionsCommon.register( 'LabNumberPanel', LabNumberPanel );
export default LabNumberPanel;
