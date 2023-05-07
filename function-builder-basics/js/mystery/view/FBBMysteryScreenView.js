// Copyright 2017-2020, University of Colorado Boulder

/**
 * ScreenView for the 'Mystery' screen in 'Function Builder: Basics'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import FBScreenView from '../../../../function-builder/js/common/view/FBScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import functionBuilderBasics from '../../functionBuilderBasics.js';
import FBBMysterySceneNode from './FBBMysterySceneNode.js';

class FBBMysteryScreenView extends FBScreenView {

  /**
   * @param {MysteryModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      sceneRadioButtonGroupYOffset: 535 // offset of SceneRadioButtonGroup from top of screen
    }, options );

    super( model, FBBMysterySceneNode, options );
  }
}

functionBuilderBasics.register( 'FBBMysteryScreenView', FBBMysteryScreenView );
export default FBBMysteryScreenView;