// Copyright 2018-2022, University of Colorado Boulder

/**
 * The sole scene in the 'Two Variables' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import EqualityExplorerColors from '../../../../equality-explorer/js/common/EqualityExplorerColors.js';
import ConstantTermCreator from '../../../../equality-explorer/js/common/model/ConstantTermCreator.js';
import EqualityExplorerScene from '../../../../equality-explorer/js/common/model/EqualityExplorerScene.js';
import TermCreator from '../../../../equality-explorer/js/common/model/TermCreator.js';
import Variable from '../../../../equality-explorer/js/common/model/Variable.js';
import VariableTermCreator from '../../../../equality-explorer/js/common/model/VariableTermCreator.js';
import EqualityExplorerStrings from '../../../../equality-explorer/js/EqualityExplorerStrings.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import equalityExplorerTwoVariables from '../../equalityExplorerTwoVariables.js';
import EqualityExplorerTwoVariablesStrings from '../../EqualityExplorerTwoVariablesStrings.js';

export default class TwoVariablesScene extends EqualityExplorerScene {

  public constructor( tandem: Tandem ) {

    const variablesTandem = tandem.createTandem( 'variables' );

    const x = new Variable( EqualityExplorerStrings.xStringProperty, {
      tandem: variablesTandem.createTandem( 'x' )
    } );

    const y = new Variable( EqualityExplorerTwoVariablesStrings.yStringProperty, {
      tandem: variablesTandem.createTandem( 'y' )
    } );

    const createLeftTermCreators = ( lockedProperty: Property<boolean> | null, tandem: Tandem ) =>
      createTermCreators( x, y, lockedProperty, tandem );

    const createRightTermCreators = ( lockedProperty: Property<boolean> | null, tandem: Tandem ) =>
      createTermCreators( x, y, lockedProperty, tandem );

    super( createLeftTermCreators, createRightTermCreators, {
      variables: [ x, y ],
      numberOfSnapshots: 4,
      tandem: tandem
    } );
  }
}

/**
 * Creates the term creators for this scene.
 */
function createTermCreators( x: Variable,
                             y: Variable,
                             lockedProperty: Property<boolean> | null,
                             parentTandem: Tandem ): TermCreator[] {

  return [

    // x & -x
    new VariableTermCreator( x, {
      lockedProperty: lockedProperty,
      tandem: parentTandem.createTandem( 'xTermCreator' )
    } ),

    // y & -y
    new VariableTermCreator( y, {
      lockedProperty: lockedProperty,
      positiveFill: EqualityExplorerColors.POSITIVE_Y_FILL,
      negativeFill: EqualityExplorerColors.NEGATIVE_Y_FILL,
      tandem: parentTandem.createTandem( 'yTermCreator' )
    } ),

    // 1 & -1
    new ConstantTermCreator( {
      lockedProperty: lockedProperty,
      tandem: parentTandem.createTandem( 'constantTermCreator' )
    } )
  ];
}

equalityExplorerTwoVariables.register( 'TwoVariablesScene', TwoVariablesScene );