// Copyright 2022, University of Colorado Boulder

/**
 * Query parameters for the sun demo application.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import vegas from './vegas.js';

const vegasQueryParameters = QueryStringMachine.getAll( {

  // initial selection on the Components screen, values are the same as the labels on combo box items
  component: {
    type: 'string',
    defaultValue: null
  }
} );

vegas.register( 'vegasQueryParameters', vegasQueryParameters );
export default vegasQueryParameters;