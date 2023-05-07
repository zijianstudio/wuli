// Copyright 2017-2023, University of Colorado Boulder

/**
 * View for the 'Line Game' screen in the 'Graphing Slope-Intercept' sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import level1_png from '../../../../graphing-lines/images/level1_png.js';
import level3_png from '../../../../graphing-lines/images/level3_png.js';
import level5_png from '../../../../graphing-lines/images/level5_png.js';
import level6_png from '../../../../graphing-lines/images/level6_png.js';
import BaseGameScreenView from '../../../../graphing-lines/js/linegame/view/BaseGameScreenView.js';
import GLRewardNode from '../../../../graphing-lines/js/linegame/view/GLRewardNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import graphingSlopeIntercept from '../../graphingSlopeIntercept.js';
import GSILineGameModel from '../model/GSILineGameModel.js';

export default class GSILineGameScreenView extends BaseGameScreenView {

  public constructor( model: GSILineGameModel, tandem: Tandem ) {

    // Images for the level-selection buttons, ordered by level. Note that this reuses images from graphing-lines,
    // but assigns them to different levels than their file names indicate.
    const levelImages = [ level1_png, level3_png, level5_png, level6_png ];

    // functions that create nodes for the game reward, ordered by level
    const rewardNodeFunctions = [
      GLRewardNode.createGraphNodes,
      GLRewardNode.createPointToolNodes,
      GLRewardNode.createPaperAirplaneNodes,
      GLRewardNode.createSmileyFaceNodes
    ];

    super( model, levelImages, rewardNodeFunctions, tandem );
  }
}

graphingSlopeIntercept.register( 'GSILineGameScreenView', GSILineGameScreenView );