// Copyright 2019-2022, University of Colorado Boulder

/**
 * model for the "bank" scene
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { Color } from '../../../../scenery/js/imports.js';
import NLIConstants from '../../common/NLIConstants.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import BankAccount from './BankAccount.js';
import SceneModel from './SceneModel.js';

// constants
const SCENE_BOUNDS = NLIConstants.NLI_LAYOUT_BOUNDS; // bounds for the scenes match the layout bounds
const PRIMARY_ACCOUNT_POINT_COLOR = new Color( '#d25da3' );
const COMPARISON_ACCOUNT_POINT_COLOR = new Color( '#001fff' );
const INITIAL_PRIMARY_ACCOUNT_BALANCE = 10;
const INITIAL_COMPARISON_ACCOUNT_BALANCE = 40;

class BankSceneModel extends SceneModel {

  /**
   * @public
   */
  constructor() {

    // Position the number line on the left portion of the screen and roughly centered vertically.  The details of
    // these values were empirically determined by comparing with the mockups in the design doc.
    const numberLineZeroPosition = new Vector2( SCENE_BOUNDS.width * 0.37, SCENE_BOUNDS.centerY );

    super( {
      numberLineZeroPositions: [ numberLineZeroPosition ],
      commonNumberLineOptions: {
        initialOrientation: Orientation.HORIZONTAL,
        labelsInitiallyVisible: true,
        widthInModelSpace: SCENE_BOUNDS.width * 0.475,
        initialPointSpecs: [ {
          initialValue: INITIAL_PRIMARY_ACCOUNT_BALANCE,
          color: new Color( PRIMARY_ACCOUNT_POINT_COLOR )
        } ]
      }
    } );

    // @public - bank account that is always shown in the view
    this.primaryAccount = new BankAccount( INITIAL_PRIMARY_ACCOUNT_BALANCE );

    // There is only one number line in this scene - get a local reference to it for convenience.
    assert && assert( this.numberLines.length === 1 );
    const numberLine = this.numberLines[ 0 ];

    // Hook the primary account balance up to the first number line point.
    this.primaryAccount.balanceProperty.link( balance => {
      numberLine.residentPoints.get( 0 ).proposeValue( balance );
    } );
    numberLine.residentPoints.get( 0 ).valueProperty.link( value => {
      this.primaryAccount.balanceProperty.value = value;
    } );

    // @public {BankAccount} - bank account that is shown when the user wants to compare two accounts
    this.comparisonAccount = new BankAccount( INITIAL_COMPARISON_ACCOUNT_BALANCE );

    // Hook the comparison account balance up to the second number line point.
    this.comparisonAccount.balanceProperty.link( balance => {
      if ( numberLine.residentPoints.length > 1 ) {
        numberLine.residentPoints.get( 1 ).proposeValue( balance );
      }
    } );

    // @public {BooleanProperty} - controls whether the comparison account should be visible to the user
    this.showComparisonAccountProperty = new BooleanProperty( false );

    // @public {PointController} - the point controller for the primary account
    this.primaryAccountPointController = new PointController( {
      color: numberLine.residentPoints.get( 0 ).colorProperty.value,
      lockToNumberLine: LockToNumberLine.ALWAYS,
      numberLinePoints: [ numberLine.residentPoints.get( 0 ) ],
      offsetFromHorizontalNumberLine: 120,
      numberLines: [ numberLine ]
    } );

    // @public {PointController} - the point controller for the comparison account
    this.comparisonAccountPointController = new PointController( {
      lockToNumberLine: LockToNumberLine.ALWAYS,
      offsetFromHorizontalNumberLine: -120,
      numberLines: [ numberLine ]
    } );

    // the number line point that represents the comparison account value, only exists when enabled
    let comparisonAccountNumberLinePoint = null;

    // Add/remove the point and point controller for the comparison account when enabled.
    this.showComparisonAccountProperty.lazyLink( showComparisonAccount => {
      if ( showComparisonAccount ) {

        // state checking
        assert && assert(
          comparisonAccountNumberLinePoint === null,
          'shouldn\'t have number line point for comparison account yet'
        );
        assert && assert(
          this.comparisonAccountPointController.numberLinePoints.length === 0,
          'shouldn\'t have number line point for comparison account controller yet'
        );

        // Create the point and add it to the number line.
        comparisonAccountNumberLinePoint = new NumberLinePoint( numberLine, {
          valueProperty: this.comparisonAccount.balanceProperty,
          initialColor: COMPARISON_ACCOUNT_POINT_COLOR
        } );
        numberLine.addPoint( comparisonAccountNumberLinePoint );

        // Associate the controller with this point.
        this.comparisonAccountPointController.associateWithNumberLinePoint( comparisonAccountNumberLinePoint );
      }
      else {

        // state checking
        assert && assert(
          comparisonAccountNumberLinePoint !== null,
          'should have number line point for comparison account'
        );
        assert && assert(
          this.comparisonAccountPointController.numberLinePoints.length === 1,
          'should be controlling a single point'
        );

        // Remove the point for the comparison account from the number line.
        this.comparisonAccountPointController.removeClearAndDisposePoints();
        comparisonAccountNumberLinePoint = null;
      }
    } );
  }

  /**
   * Restore initial state to the scene.
   * @override
   * @public
   */
  resetScene() {
    this.primaryAccount.reset();
    this.showComparisonAccountProperty.reset();
    this.comparisonAccount.reset();
  }
}

// static properties
BankSceneModel.PRIMARY_ACCOUNT_POINT_COLOR = PRIMARY_ACCOUNT_POINT_COLOR;
BankSceneModel.COMPARISON_ACCOUNT_POINT_COLOR = COMPARISON_ACCOUNT_POINT_COLOR;

numberLineIntegers.register( 'BankSceneModel', BankSceneModel );
export default BankSceneModel;