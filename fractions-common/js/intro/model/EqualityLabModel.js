// Copyright 2018-2020, University of Colorado Boulder

/**
 * Model for the "Equality Lab" screen of Fractions: Equality
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import fractionsCommon from '../../fractionsCommon.js';
import ContainerSetModel from './ContainerSetModel.js';
import IntroRepresentation from './IntroRepresentation.js';
import MultipliedContainer from './MultipliedContainer.js';

class EqualityLabModel extends ContainerSetModel {
  constructor() {
    super( {
      representations: [
        IntroRepresentation.CIRCLE,
        IntroRepresentation.HORIZONTAL_BAR,
        IntroRepresentation.VERTICAL_BAR,
        IntroRepresentation.BEAKER
      ],
      initialContainerCount: 4,
      maxContainers: 4,
      maxDenominator: 6,
      isCompact: true,
      bucketWidth: 280
    } );

    // @public {Property.<boolean>} - Whether the right side should show a number line instead of the normal
    // representation.
    this.showNumberLineProperty = new BooleanProperty( false );

    // @public {Property.<number>} - The multiplier used to construct the "parallel" fraction
    this.multiplierProperty = new NumberProperty( 2, {
      range: new Range( 1, 3 )
    } );

    // @public {Container[]}
    this.multipliedContainers = this.containers.map( container => new MultipliedContainer( container, this.multiplierProperty ) );
  }

  /**
   * Resets the model.
   * @public
   * @override
   */
  reset() {
    this.showNumberLineProperty.reset();
    this.multiplierProperty.reset();

    super.reset();
  }
}

fractionsCommon.register( 'EqualityLabModel', EqualityLabModel );
export default EqualityLabModel;