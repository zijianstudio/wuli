// Copyright 2018-2022, University of Colorado Boulder

/**
 * What type of representation is being shown (for intro-style screens)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import fractionsCommon from '../../fractionsCommon.js';

const IntroRepresentation = EnumerationDeprecated.byKeys( [
  'CIRCLE',
  'HORIZONTAL_BAR',
  'VERTICAL_BAR',
  'BEAKER',
  'CAKE',
  'NUMBER_LINE'
] );

fractionsCommon.register( 'IntroRepresentation', IntroRepresentation );
export default IntroRepresentation;