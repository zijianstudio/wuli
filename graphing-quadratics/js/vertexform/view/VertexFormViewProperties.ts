// Copyright 2018-2023, University of Colorado Boulder

/**
 * View-specific Properties and properties for the 'Vertex Form' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GQViewProperties from '../../common/view/GQViewProperties.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export default class VertexFormViewProperties extends GQViewProperties {

  public constructor( tandem: Tandem ) {
    super( {
      equationForm: 'vertex',
      vertexVisible: true,
      axisOfSymmetryVisible: false,
      coordinatesVisible: true,
      tandem: tandem
    } );
  }
}

graphingQuadratics.register( 'VertexFormViewProperties', VertexFormViewProperties );