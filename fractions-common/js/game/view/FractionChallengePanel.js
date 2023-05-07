// Copyright 2018-2021, University of Colorado Boulder

/**
 * Bottom panel for fraction challenges that holds the pieces.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Panel from '../../../../sun/js/Panel.js';
import StackNodesBox from '../../building/view/StackNodesBox.js';
import fractionsCommon from '../../fractionsCommon.js';

class FractionChallengePanel extends Panel {
  /**
   * @param {FractionChallenge} challenge
   * @param {function} pressCallback - function( {SceneryEvent}, {Stack} ) - Called when a press is started.
   */
  constructor( challenge, pressCallback ) {
    const box = new StackNodesBox( [
      ...challenge.shapeStacks,
      ...challenge.numberStacks,
      ...challenge.shapeGroupStacks,
      ...challenge.numberGroupStacks
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

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.box.dispose();

    super.dispose();
  }
}

fractionsCommon.register( 'FractionChallengePanel', FractionChallengePanel );
export default FractionChallengePanel;
