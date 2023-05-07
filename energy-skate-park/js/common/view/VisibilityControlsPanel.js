// Copyright 2019-2020, University of Colorado Boulder

/**
 * A separate panel just with EnergySkateParkVisibilityControls for this sim, used to save space when there are
 * already too many items in the EnergySkateParkControlPanel.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import Panel from '../../../../sun/js/Panel.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import EnergySkateParkVisibilityControls from './EnergySkateParkVisibilityControls.js';

class VisibilityControlsPanel extends Panel {

  /**
   * @param {EnergySkateParkModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {
    options = merge( {}, EnergySkateParkConstants.PANEL_OPTIONS, options );

    const content = new EnergySkateParkVisibilityControls( model, tandem, {
      showPieChartCheckbox: false,
      showSpeedCheckbox: false,
      showGridCheckbox: true,
      showReferenceHeightCheckbox: true
    } );

    super( content, options );
  }
}

energySkatePark.register( 'VisibilityControlsPanel', VisibilityControlsPanel );
export default VisibilityControlsPanel;