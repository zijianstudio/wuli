// Copyright 2020-2022, University of Colorado Boulder

/**
 * TODO: Documentation
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import balancingAct from '../../balancingAct.js';

const PositionIndicatorChoice = EnumerationDeprecated.byKeys( [ 'NONE', 'RULERS', 'MARKS' ] );
balancingAct.register( 'PositionIndicatorChoice', PositionIndicatorChoice );

export default PositionIndicatorChoice;