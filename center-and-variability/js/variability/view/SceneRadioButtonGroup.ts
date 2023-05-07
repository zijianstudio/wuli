// Copyright 2023, University of Colorado Boulder

import RectangularRadioButtonGroup, { RectangularRadioButtonGroupOptions } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import centerAndVariability from '../../centerAndVariability.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Property from '../../../../axon/js/Property.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import tshirtSolidShape from '../../../../sherpa/js/fontawesome-5/tshirtSolidShape.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CAVSceneModel from '../../common/model/CAVSceneModel.js';
import VariabilitySceneModel from '../model/VariabilitySceneModel.js';

type SelfOptions = EmptySelfOptions;
type SceneRadioButtonGroupOptions = SelfOptions & RectangularRadioButtonGroupOptions;

export default class SceneRadioButtonGroup extends RectangularRadioButtonGroup<CAVSceneModel> {

  public constructor( sceneModels: VariabilitySceneModel[], property: Property<CAVSceneModel>, providedOptions: SceneRadioButtonGroupOptions ) {
    const options = optionize<SceneRadioButtonGroupOptions, SelfOptions, RectangularRadioButtonGroupOptions>()( {
      radioButtonOptions: {
        baseColor: 'white'
      }
    }, providedOptions );

    const createTShirtIcon = ( tandem: Tandem, label: string, fill: string ) => {

      const path = new Path( tshirtSolidShape, {
        fill: fill,
        stroke: 'black',
        lineWidth: 12,
        maxWidth: 35
      } );

      const text = new Text( label, {
        fontSize: 16,
        fontWeight: 'bold',
        fill: 'black',
        center: path.center
      } );
      return new Node( {
        children: [ path, text ]
      } );
    };
    super( property, [ {
      value: sceneModels[ 0 ],
      createNode: tandem => createTShirtIcon( tandem, '1', '#ec5f3a' ),
      tandemName: 'uniformRadioButton'
    }, {
      value: sceneModels[ 1 ],
      createNode: tandem => createTShirtIcon( tandem, '2', '#5bc760' ),
      tandemName: 'gaussianRadioButton'
    }, {
      value: sceneModels[ 2 ],
      createNode: tandem => createTShirtIcon( tandem, '3', '#fdf454' ),
      tandemName: 'skewedRadioButton'
    }, {
      value: sceneModels[ 3 ],
      createNode: tandem => createTShirtIcon( tandem, '4', '#9078e5' ),
      tandemName: 'bimodalRadioButton'
    } ], options );
  }
}

centerAndVariability.register( 'SceneRadioButtonGroup', SceneRadioButtonGroup );