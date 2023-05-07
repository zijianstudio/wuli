// Copyright 2018-2021, University of Colorado Boulder

/**
 * Common settings for accordion boxes in area-model sims.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import { Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../AreaModelCommonConstants.js';
import AreaModelCommonColors from './AreaModelCommonColors.js';

class AreaModelCommonAccordionBox extends AccordionBox {

  /**
   * @param {string} titleString
   * @param {Property.<boolean>} expandedProperty
   * @param {Node} content
   * @param {Object} [options]
   */
  constructor( titleString, expandedProperty, content, options ) {
    options = merge( {
      titleNode: new Text( titleString, {
        font: AreaModelCommonConstants.TITLE_FONT,
        maxWidth: options.maxTitleWidth || 200
      } ),
      expandedProperty: expandedProperty,
      contentXMargin: 15,
      contentYMargin: 12,
      resize: true,
      cornerRadius: AreaModelCommonConstants.PANEL_CORNER_RADIUS,
      fill: AreaModelCommonColors.panelBackgroundProperty,
      stroke: AreaModelCommonColors.panelBorderProperty,
      titleAlignX: 'left',
      titleXSpacing: 8,
      buttonXMargin: 10,
      buttonYMargin: 8,
      expandCollapseButtonOptions: {
        sideLength: 20,
        touchAreaXDilation: 5,
        touchAreaYDilation: 5
      }
    }, options );

    super( content, options );
  }
}

areaModelCommon.register( 'AreaModelCommonAccordionBox', AreaModelCommonAccordionBox );
export default AreaModelCommonAccordionBox;