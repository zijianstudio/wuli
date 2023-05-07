// Copyright 2019-2022, University of Colorado Boulder

/**
 * view for the "Bank" scene
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import PiggyBankDecoration from '../../../../number-line-common/js/explore/model/PiggyBankDecoration.js';
import PiggyBankNode from '../../../../number-line-common/js/explore/view/PiggyBankNode.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';
import BankSceneModel from '../model/BankSceneModel.js';
import AccountBalanceControllerNode from './AccountBalanceControllerNode.js';
import BankPointControllerNode from './BankPointControllerNode.js';
import SceneView from './SceneView.js';

// constants
const NUMBER_LINE_LABEL_FONT = new PhetFont( { size: 18, weight: 'bold' } );
const BALANCE_CHANGE_AMOUNT = 1; // in dollars (or whatever currency units are being used)

const balanceString = NumberLineIntegersStrings.balance;
const currencyUnitsString = NumberLineIntegersStrings.currencyUnits;
const moneyAmountString = NumberLineIntegersStrings.moneyAmount;

// constants
const INSET = 10;

class BankSceneView extends SceneView {

  /**
   * @param {BankSceneModel} bankSceneModel
   * @param {Bounds2} layoutBounds
   * @public
   */
  constructor( bankSceneModel, layoutBounds ) {

    super( bankSceneModel, layoutBounds, {
      commonNumberLineNodeOptions: {
        numericalLabelTemplate: StringUtils.fillIn( moneyAmountString, { currencyUnit: currencyUnitsString } )
      }
    } );

    // Get references to the only number line and number line node in this scene.
    const numberLine = bankSceneModel.numberLines[ 0 ];
    const numberLineNode = this.numberLineNodes[ 0 ];

    // number line label
    const numberLineLabel = new Text( balanceString, {
      font: NUMBER_LINE_LABEL_FONT,
      right: numberLineNode.left - 4,
      centerY: numberLine.centerPositionProperty.value.y,
      maxWidth: layoutBounds.width * 0.08
    } );
    this.scenesLayer.addChild( numberLineLabel );
    bankSceneModel.showNumberLineProperty.linkAttribute( numberLineLabel, 'visible' );

    // Add the switch that controls whether one or two accounts are shown.
    this.scenesLayer.addChild( new AccountVisibilityControlSwitch( bankSceneModel.showComparisonAccountProperty, {
      right: this.layoutBounds.maxX - INSET,
      centerY: numberLineNode.centerY
    } ) );

    // Add the point controllers.  This is being done a bit differently here in the "Bank" scene than in the other
    // scenes in that the controllers are being added to the number line layer.  This is because we want them behind
    // the number line in the z-order, whereas in the other scenes the controllers are above the number lines.  See
    // https://github.com/phetsims/number-line-integers/issues/88 and
    // https://github.com/phetsims/number-line-integers/issues/83.
    const pointControllerNodesLayer = new Node();
    this.numberLinesLayer.addChild( pointControllerNodesLayer );
    pointControllerNodesLayer.moveToBack();

    // Add node to represent the primary account point controller, which is always visible.
    const primaryAccountPointControllerNode = new BankPointControllerNode(
      bankSceneModel.primaryAccountPointController,
      bankSceneModel.primaryAccount.balanceChangedByButtonEmitter,
      PiggyBankDecoration.FLOWERS,
      { connectorLineVisibleProperty: bankSceneModel.showNumberLineProperty }
    );
    pointControllerNodesLayer.addChild( primaryAccountPointControllerNode );

    // add node to represent the comparison account point controller, which is only visible when enabled
    const comparisonAccountPointControllerNode = new BankPointControllerNode(
      bankSceneModel.comparisonAccountPointController,
      bankSceneModel.comparisonAccount.balanceChangedByButtonEmitter,
      PiggyBankDecoration.LIGHTNING,
      { connectorLineVisibleProperty: bankSceneModel.showNumberLineProperty }
    );
    pointControllerNodesLayer.addChild( comparisonAccountPointControllerNode );
    comparisonAccountPointControllerNode.moveToBack(); // make sure this is behind the number line point that it controls

    numberLine.residentPoints.lengthProperty.link( numPoints => {

      // Show the second controller if the second point is present.
      comparisonAccountPointControllerNode.visible = numPoints > 1;
    } );

    // Calculate a horizontal position for the account balance controls that is centered between some other controls.
    const accountBalanceControllersCenterX = ( this.comparisonStatementAccordionBoxes[ 0 ].right +
                                               this.checkboxGroup.bounds.minX ) / 2;

    // Add the controller for the primary account.
    const primaryAccountBalanceControllerNode = new AccountBalanceControllerNode(
      bankSceneModel.primaryAccount.balanceProperty,
      bankSceneModel.primaryAccount.balanceChangedByButtonEmitter,
      numberLine.displayedRangeProperty.value,
      BALANCE_CHANGE_AMOUNT,
      {
        buttonBaseColor: BankSceneModel.PRIMARY_ACCOUNT_POINT_COLOR,
        centerX: accountBalanceControllersCenterX,
        top: numberLineNode.centerY + 70
      }
    );
    this.scenesLayer.addChild( primaryAccountBalanceControllerNode );

    // Add the controller for the comparison account, and show it only when that account is enabled.
    const comparisonAccountBalanceControllerNode = new AccountBalanceControllerNode(
      bankSceneModel.comparisonAccount.balanceProperty,
      bankSceneModel.comparisonAccount.balanceChangedByButtonEmitter,
      numberLine.displayedRangeProperty.value,
      BALANCE_CHANGE_AMOUNT,
      {
        buttonBaseColor: BankSceneModel.COMPARISON_ACCOUNT_POINT_COLOR,
        centerX: accountBalanceControllersCenterX,
        bottom: numberLineNode.centerY - 70
      }
    );
    bankSceneModel.showComparisonAccountProperty.linkAttribute( comparisonAccountBalanceControllerNode, 'visible' );
    this.scenesLayer.addChild( comparisonAccountBalanceControllerNode );

    // Monitor the account controllers for when their buttons are released by the user and make sure that the values
    // of the two accounts are not the same and, if they are, correct the situation.
    primaryAccountBalanceControllerNode.buttonReleasedEmitter.addListener( () => {
      if ( bankSceneModel.showComparisonAccountProperty.value &&
           bankSceneModel.comparisonAccount.balanceProperty.value === bankSceneModel.primaryAccount.balanceProperty.value ) {

        // Set the comparison account to the previous value of the primary account, in effect swapping values.
        bankSceneModel.comparisonAccount.balanceProperty.value = bankSceneModel.primaryAccount.previousBalance;
      }
    } );
    comparisonAccountBalanceControllerNode.buttonReleasedEmitter.addListener( () => {
      if ( bankSceneModel.comparisonAccount.balanceProperty.value === bankSceneModel.primaryAccount.balanceProperty.value ) {

        // Set the primary account to the previous value of the comparison account, in effect swapping values.
        bankSceneModel.primaryAccount.balanceProperty.value = bankSceneModel.comparisonAccount.previousBalance;
      }
    } );
  }
}

/**
 * a switch for controlling whether one or two account balances are shown
 * @private
 */
class AccountVisibilityControlSwitch extends ABSwitch {

  /**
   * @param {BooleanProperty} comparisonAccountVisible
   * @param {Object} [options]
   * @public
   */
  constructor( comparisonAccountVisible, options ) {

    options = merge( {
      toggleSwitchOptions: { size: new Dimension2( 50, 15 ) },
      setEnabled: () => {} // turn off default behavior where opacity is used for non-selected nodes
    }, options );

    // The node for selecting that the comparison account is hidden is a single piggy bank that matches the style of
    // the visible account controller.
    const comparisonAccountHiddenNode = new PiggyBankNode( {
      decorationType: PiggyBankDecoration.FLOWERS,
      maxWidth: 40
    } );

    // The node for the selection where the comparison account is visible it two smaller piggy banks side by side.
    const comparisonAccountVisibleLeftPiggyBankNode = new PiggyBankNode( {
      decorationType: PiggyBankDecoration.FLOWERS,
      maxWidth: 30
    } );
    const comparisonAccountVisibleRightPiggyBankNode = new PiggyBankNode( {
      decorationType: PiggyBankDecoration.LIGHTNING,
      maxWidth: 40
    } );
    const comparisonAccountVisibleNode = new HBox( {
      children: [
        comparisonAccountVisibleLeftPiggyBankNode,
        comparisonAccountVisibleRightPiggyBankNode
      ],
      spacing: 10
    } );

    const inactiveColor = 'rgb( 210, 210, 210 )';
    const activeColor = 'rgb( 0, 180, 147 )';

    comparisonAccountVisible.link( isComparisonAccountVisible => {
      const singleFill = isComparisonAccountVisible ? inactiveColor : activeColor;
      const doubleFill = isComparisonAccountVisible ? activeColor : inactiveColor;
      comparisonAccountHiddenNode.fill = singleFill;
      comparisonAccountVisibleLeftPiggyBankNode.fill = doubleFill;
      comparisonAccountVisibleRightPiggyBankNode.fill = doubleFill;
    } );

    super(
      comparisonAccountVisible,
      false,
      comparisonAccountHiddenNode,
      true,
      comparisonAccountVisibleNode,
      options
    );
  }
}

numberLineIntegers.register( 'BankSceneView', BankSceneView );
export default BankSceneView;