// Copyright 2018-2022, University of Colorado Boulder

/**
 * Utilities or references used for all of the fractions sims
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import { AlignBox, Node, Rectangle } from '../../../scenery/js/imports.js';
import fractionsCommon from '../fractionsCommon.js';

const FractionsCommonGlobals = {
  /**
   * Wraps content with a background and centered alignment (for home screen / navbar icons).
   * @public
   *
   * @param {Node} content
   * @param {PaintDef} backgroundFill
   * @returns {Node}
   */
  wrapIcon( content, backgroundFill ) {
    const background = new Rectangle( {
      rectBounds: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.toBounds( 0, 0 ),
      fill: backgroundFill
    } );

    return new Node( {
      children: [
        background,
        new AlignBox( content, {
          alignBounds: background.bounds
        } )
      ]
    } );
  }
};

fractionsCommon.register( 'FractionsCommonGlobals', FractionsCommonGlobals );
export default FractionsCommonGlobals;