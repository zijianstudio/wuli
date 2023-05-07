// Copyright 2017-2021, University of Colorado Boulder

/**
 * Supertype for generic (not-to-scale) area-model models.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonModel from '../../common/model/AreaModelCommonModel.js';
import GenericArea from './GenericArea.js';
import GenericAreaDisplay from './GenericAreaDisplay.js';
import GenericLayout from './GenericLayout.js';

// constants
const DEFAULT_LAYOUT = GenericLayout.TWO_BY_TWO;

class GenericAreaModel extends AreaModelCommonModel {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    assert && assert( options === undefined || typeof options === 'object', 'If provided, options should be an object' );

    options = merge( {
      allowExponents: false
    }, options );

    const areas = GenericLayout.VALUES.map( layout => new GenericArea( layout, options.allowExponents ) );

    const defaultArea = _.find( areas, area => area.layout === DEFAULT_LAYOUT );

    super( areas, defaultArea, options );

    // @public {Property.<GenericLayout>} - The current layout that is visible/selected.
    this.genericLayoutProperty = new Property( DEFAULT_LAYOUT );

    // Adjust the current area based on the layout.
    this.genericLayoutProperty.link( layout => {
      this.currentAreaProperty.value = _.find( this.areas, area => area.layout === layout );
    } );
  }

  /**
   * Returns a concrete AreaDisplay subtype
   * @protected
   *
   * @param {Property.<Area>} areaProperty
   * @returns {GenericAreaDisplay}
   */
  createAreaDisplay( areaProperty ) {
    return new GenericAreaDisplay( areaProperty );
  }

  /**
   * Returns the model to its initial state.
   * @public
   * @override
   */
  reset() {
    super.reset();

    this.genericLayoutProperty.reset();
  }
}

areaModelCommon.register( 'GenericAreaModel', GenericAreaModel );

export default GenericAreaModel;