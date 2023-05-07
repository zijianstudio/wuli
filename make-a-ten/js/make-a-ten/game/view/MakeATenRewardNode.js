// Copyright 2016-2021, University of Colorado Boulder

/**
 * Shows a reward, and allows the user to (a) keep going with the current level, or (b) go back to the level selection.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BaseNumber from '../../../../../counting-common/js/common/model/BaseNumber.js';
import BaseNumberNode from '../../../../../counting-common/js/common/view/BaseNumberNode.js';
import FaceNode from '../../../../../scenery-phet/js/FaceNode.js';
import StarNode from '../../../../../scenery-phet/js/StarNode.js';
import RewardNode from '../../../../../vegas/js/RewardNode.js';
import makeATen from '../../../makeATen.js';

class MakeATenRewardNode extends RewardNode {
  constructor() {
    super( {
      nodes: RewardNode.createRandomNodes( [
        new StarNode(),
        new StarNode(),
        new StarNode(),
        new StarNode(),
        new StarNode(),
        new StarNode(),
        new StarNode(),
        new FaceNode( 40, { headStroke: 'black' } ),
        new FaceNode( 40, { headStroke: 'black' } ),
        new FaceNode( 40, { headStroke: 'black' } ),
        new FaceNode( 40, { headStroke: 'black' } ),
        new FaceNode( 40, { headStroke: 'black' } ),
        new FaceNode( 40, { headStroke: 'black' } ),
        new FaceNode( 40, { headStroke: 'black' } ),
        createNumber( 1, 0 ),
        createNumber( 2, 0 ),
        createNumber( 3, 0 ),
        createNumber( 4, 0 ),
        createNumber( 5, 0 ),
        createNumber( 6, 0 ),
        createNumber( 7, 0 ),
        createNumber( 8, 0 ),
        createNumber( 9, 0 ),
        createNumber( 1, 1 ),
        createNumber( 1, 1 ),
        createNumber( 1, 1 ),
        createNumber( 1, 1 ),
        createNumber( 1, 1 )
      ], 150 )
    } );
  }
}

function createNumber( digit, place ) {
  const node = new BaseNumberNode( new BaseNumber( digit, place ), 1 );
  node.scale( 0.5 );
  return node;
}

makeATen.register( 'MakeATenRewardNode', MakeATenRewardNode );
export default MakeATenRewardNode;