// Copyright 2017-2021, University of Colorado Boulder

/**
 * Globals (not constant) for Area Model simulations
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { AlignGroup } from '../../../scenery/js/imports.js';
import areaModelCommon from '../areaModelCommon.js';

const AreaModelCommonGlobals = {

  // @public {AlignGroup} - Used to properly horizontally align all of the panels/accordions/etc. across screens.
  panelAlignGroup: new AlignGroup( {
    matchVertical: false
  } ),

  // @public {AlignGroup} - Used for the radio group selection icons (so they are consistent across screens)
  selectionButtonAlignGroup: new AlignGroup()
};
areaModelCommon.register( 'AreaModelCommonGlobals', AreaModelCommonGlobals );
export default AreaModelCommonGlobals;