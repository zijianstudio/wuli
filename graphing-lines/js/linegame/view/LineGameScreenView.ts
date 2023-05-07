// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for the 'Line Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import level1_png from '../../../images/level1_png.js';
import level2_png from '../../../images/level2_png.js';
import level3_png from '../../../images/level3_png.js';
import level4_png from '../../../images/level4_png.js';
import level5_png from '../../../images/level5_png.js';
import level6_png from '../../../images/level6_png.js';
import graphingLines from '../../graphingLines.js';
import LineGameModel from '../model/LineGameModel.js';
import BaseGameScreenView from './BaseGameScreenView.js';
import GLRewardNode from './GLRewardNode.js';

export default class LineGameScreenView extends BaseGameScreenView {

  public constructor( model: LineGameModel, tandem: Tandem ) {

    // Images for the level-selection buttons, ordered by level
    const levelImages = [ level1_png, level2_png, level3_png, level4_png, level5_png, level6_png ];

    // functions that create nodes for the game reward, ordered by level
    const rewardNodeFunctions = [
      GLRewardNode.createEquationNodes,
      GLRewardNode.createGraphNodes,
      GLRewardNode.createPointToolNodes,
      GLRewardNode.createSmileyFaceNodes,
      GLRewardNode.createPaperAirplaneNodes,
      GLRewardNode.createAssortedNodes
    ];

    super( model, levelImages, rewardNodeFunctions, tandem, {
      settingsNodeOptions: {
        levelSelectionButtonGroupOptions: {
          flowBoxOptions: {
            spacing: 50, // x spacing
            lineSpacing: 25, // y spacing
            preferredWidth: 800, // set empirically to provide 3 buttons per row
            wrap: true,
            justify: 'center'
          }
        }
      }
    } );
  }
}

graphingLines.register( 'LineGameScreenView', LineGameScreenView );