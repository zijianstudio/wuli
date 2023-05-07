// Copyright 2023, University of Colorado Boulder

import RectangularRadioButtonGroup, { RectangularRadioButtonGroupOptions } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import VariabilityMeasure from '../model/VariabilityMeasure.js';
import centerAndVariability from '../../centerAndVariability.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Property from '../../../../axon/js/Property.js';
import { Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';

type SelfOptions = EmptySelfOptions;
type VariabilityRadioButtonGroupOptions = SelfOptions & RectangularRadioButtonGroupOptions;

export default class VariabilityMeasureRadioButtonGroup extends RectangularRadioButtonGroup<VariabilityMeasure> {

  public constructor( property: Property<VariabilityMeasure>, providedOptions: VariabilityRadioButtonGroupOptions ) {
    const options = optionize<VariabilityRadioButtonGroupOptions, SelfOptions, RectangularRadioButtonGroupOptions>()( {
      radioButtonOptions: {
        baseColor: 'white'
      }
    }, providedOptions );

    const createLabel = ( tandem: Tandem, label: string, fill: string ) => {

      const text = new Text( label, {
        fontSize: 16,
        fontWeight: 'bold',
        fill: 'black'
      } );
      return text;
    };
    super( property, [ {
      value: VariabilityMeasure.RANGE,
      createNode: tandem => createLabel( tandem, 'RAN', '#ec5f3a' ),
      tandemName: 'rangeRadioButton'
    }, {
      value: VariabilityMeasure.IQR,
      createNode: tandem => createLabel( tandem, 'IQR', '#5bc760' ),
      tandemName: 'iqrRadioButton'
    }, {
      value: VariabilityMeasure.MAD,
      createNode: tandem => createLabel( tandem, 'MAD', '#fdf454' ),
      tandemName: 'madRadioButton'
    } ], options );
  }
}

centerAndVariability.register( 'VariabilityMeasureRadioButtonGroup', VariabilityMeasureRadioButtonGroup );