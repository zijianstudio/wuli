// Copyright 2019-2022, University of Colorado Boulder

/**
 * The visibility controls for "Graphs" screen - controls for grid and reference height visibility moved to a different
 * panel to create more space in the ScreenView.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Panel from '../../../../sun/js/Panel.js';
import EnergySkateParkVisibilityControls from '../../common/view/EnergySkateParkVisibilityControls.js';
import energySkatePark from '../../energySkatePark.js';

class GraphsVisibilityControls extends Panel {

  /**
   * @param {GraphsModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {
    const content = new EnergySkateParkVisibilityControls( model, tandem, {
      showPieChartCheckbox: false,
      showSpeedCheckbox: false,
      showReferenceHeightCheckbox: true
    } );

    super( content, options );
  }
}

energySkatePark.register( 'GraphsVisibilityControls', GraphsVisibilityControls );
export default GraphsVisibilityControls;