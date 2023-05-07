// Copyright 2014-2022, University of Colorado Boulder

/**
 * Icon for the 'RGB' screen.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Screen from '../../../../joist/js/Screen.js';
import { Rectangle, VBox } from '../../../../scenery/js/imports.js';
import colorVision from '../../colorVision.js';
import FlashlightNode from '../../common/view/FlashlightNode.js';

class RGBIconNode extends Rectangle {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    super( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, options );

    const redFlashlight = new FlashlightNode( -Math.PI / 12, 'red' );
    const greenFlashlight = new FlashlightNode( 0, 'green' );
    const blueFlashlight = new FlashlightNode( Math.PI / 12, 'blue' );

    const flashlightVBox = new VBox(
      {
        children: [
          redFlashlight,
          greenFlashlight,
          blueFlashlight ],
        spacing: -4,
        centerX: this.centerX,
        centerY: this.centerY
      } );

    this.addChild( flashlightVBox );
  }
}

colorVision.register( 'RGBIconNode', RGBIconNode );

export default RGBIconNode;