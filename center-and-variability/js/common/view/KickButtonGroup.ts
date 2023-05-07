// Copyright 2022-2023, University of Colorado Boulder

/**
 * Shows the "Kick 1" and "Kick 5" buttons in the soccer screens.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import { AlignGroup, Node, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import CenterAndVariabilityStrings from '../../CenterAndVariabilityStrings.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CAVColors from '../CAVColors.js';
import CAVConstants from '../CAVConstants.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import CAVModel from '../model/CAVModel.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import CAVSceneModel from '../model/CAVSceneModel.js';

type SelfOptions = EmptySelfOptions;
export type KickButtonGroupOptions = SelfOptions & VBoxOptions & PickRequired<VBoxOptions, 'tandem'>;

// constants
const TEXT_MAX_WIDTH = 80;

export default class KickButtonGroup extends VBox {

  public constructor( model: CAVModel, providedOptions?: KickButtonGroupOptions ) {

    const options = optionize<KickButtonGroupOptions, SelfOptions, VBoxOptions>()( {
      spacing: 2
    }, providedOptions );

    const alignGroup = new AlignGroup();

    const createLabel = ( label: PatternStringProperty<{ value: number }>, tandem: Tandem ) => {
      const text = new Text( label, {
        maxWidth: TEXT_MAX_WIDTH,
        font: CAVConstants.MAIN_FONT
      } );
      return {
        label: alignGroup.createBox( text ),
        text: text
      };
    };

    const createKickButton = ( content: { label: Node; text: Text }, tandem: Tandem, numberToKick: number, multikick: boolean ) => {

      const buttonVisibleProperty = new BooleanProperty( true, {
        tandem: tandem.createTandem( 'visibleProperty' )
      } );


      const hasKickableSoccerBallsProperty = new DynamicProperty<boolean, unknown, CAVSceneModel>( model.selectedSceneModelProperty, {
        derive: 'hasKickableSoccerBallsProperty'
      } );

      // const hasKickableSoccerBallsProperty =
      //   DerivedProperty.deriveAny( [ model.selectedSceneModelProperty, ...model.sceneModels.map( scene => scene.hasKickableSoccerBallsProperty ) ], () => {
      //     return model.selectedSceneModelProperty.value.hasKickableSoccerBallsProperty.value;
      //   } );

      return new RectangularPushButton( {
        visibleProperty: DerivedProperty.and( [ hasKickableSoccerBallsProperty, buttonVisibleProperty ] ),
        content: content.label,
        baseColor: CAVColors.kickButtonFillColorProperty,
        xMargin: 12,
        yMargin: 12,
        tandem: tandem,
        listener: () => model.selectedSceneModelProperty.value.scheduleKicks( numberToKick ),

        // The Kick 1 button can be held down for repeat kicks, but the Kick 5 cannot.
        fireOnHold: !multikick,
        fireOnHoldDelay: 750,

        // This needs to be longer than CAVSceneModel.TIME_BETWEEN_RAPID_KICKS plus the poise time, see
        // https://github.com/phetsims/center-and-variability/issues/102
        fireOnHoldInterval: 650
      } );
    };

    // Create tandems so the labels can appear at the proper place in the tandem tree
    const kick1ButtonTandem = options.tandem.createTandem( 'kickOneButton' );
    const kick5ButtonTandem = options.tandem.createTandem( 'kickFiveButton' );

    // Create labels first so their sizes can be aligned
    const kick1PatternStringProperty = new PatternStringProperty( CenterAndVariabilityStrings.kickValuePatternStringProperty, { value: 1 } );
    const kick1Label = createLabel( kick1PatternStringProperty, kick1ButtonTandem.createTandem( 'labelText' ) );

    const multiKickProperty = new NumberProperty( 5 );
    const kick5PatternStringProperty = new PatternStringProperty( CenterAndVariabilityStrings.kickValuePatternStringProperty, { value: multiKickProperty } );

    const numberOfUnkickedBallsProperty = new DynamicProperty<number, unknown, CAVSceneModel>( model.selectedSceneModelProperty, {
      derive: 'numberOfUnkickedBallsProperty'
    } );
    numberOfUnkickedBallsProperty.link( numberOfRemainingKickableObjects => {
      const value = Math.max( Math.min( numberOfRemainingKickableObjects, 5 ), 1 );
      multiKickProperty.value = value;
    } );
    const kick5Label = createLabel( kick5PatternStringProperty, kick5ButtonTandem.createTandem( 'labelText' ) );

    options.children = [
      createKickButton( kick1Label, kick1ButtonTandem, 1, false ),
      createKickButton( kick5Label, kick5ButtonTandem, 5, true )
    ];

    super( options );
  }
}

centerAndVariability.register( 'KickButtonGroup', KickButtonGroup );