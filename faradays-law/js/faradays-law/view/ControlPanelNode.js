// Copyright 2014-2023, University of Colorado Boulder

/**
 * Strip of controls at the bottom of the screen, which are not shown in a visible panel.  It contains controls
 * for showing field lines, switching between 1 vs 2 coils, flipping the magnet and the reset all button.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import OrientationEnum from '../model/OrientationEnum.js';
import CoilNode from './CoilNode.js';
import CoilTypeEnum from './CoilTypeEnum.js';
import FaradaysLawAlertManager from './FaradaysLawAlertManager.js';
import FlipMagnetButton from './FlipMagnetButton.js';

// constants
const faradaysLawShowFieldLinesString = FaradaysLawStrings[ 'faradays-law' ].showFieldLines;
const faradaysLawVoltmeterString = FaradaysLawStrings[ 'faradays-law' ].voltmeter;
const voltmeterString = FaradaysLawStrings.a11y.voltmeter;
const voltmeterDescriptionString = FaradaysLawStrings.a11y.voltmeterDescription;
const numberOneCoilString = FaradaysLawStrings.a11y.numberOneCoil;
const numberTwoCoilString = FaradaysLawStrings.a11y.numberTwoCoil;
const circuitModeString = FaradaysLawStrings.a11y.circuitMode;
const fieldLinesString = FaradaysLawStrings.a11y.fieldLines;
const fieldLinesDescriptionString = FaradaysLawStrings.a11y.fieldLinesDescription;

class ControlPanelNode extends Node {

  /**
   * @param {FaradaysLawModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( {
      tagName: 'ul'
    } );

    // reset button - added at end of constructor for a11y ordering
    const resetAllButton = new ResetAllButton( {
      listener: model.reset.bind( model ),
      right: model.bounds.maxX - 10,
      bottom: 0,
      scale: 0.75,

      // pdom
      containerTagName: 'li',

      // phet-io
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // flip magnet button
    this.flipMagnetButton = new FlipMagnetButton( tandem.createTandem( 'flipMagnetButton' ), {
      listener: () => {
        const orientation = model.magnet.orientationProperty.value;
        model.magnet.orientationProperty.set( orientation === OrientationEnum.NS ? OrientationEnum.SN : OrientationEnum.NS );
      },
      bottom: 0,
      right: model.bounds.maxX - 110
    } );
    this.addChild( this.flipMagnetButton );

    // add radio button group for showing/hiding the second coil
    const coilButtonGroupOptions = {
      spacing: 10,
      align: 'left',
      scale: 0.21
    };

    const coilButtonGroupContents = [ {
      value: false,
      createNode: () => new VBox( merge( {
        children: [
          new CoilNode( CoilTypeEnum.TWO_COIL, { visible: false } ),
          new CoilNode( CoilTypeEnum.FOUR_COIL )
        ],
        excludeInvisibleChildrenFromBounds: false
      }, coilButtonGroupOptions ) ),
      tandemName: 'singleCoilRadioButton',
      phetioDocumentation: 'Radio button that selects a single coil.',
      labelContent: numberOneCoilString
    }, {
      value: true,
      createNode: () => new VBox( merge( {
        children: [
          new CoilNode( CoilTypeEnum.TWO_COIL ),
          new CoilNode( CoilTypeEnum.FOUR_COIL )
        ],
        excludeInvisibleChildrenFromBounds: false
      }, coilButtonGroupOptions ) ),
      tandemName: 'doubleCoilRadioButton',
      phetioDocumentation: 'Radio button that selects double coils.',
      labelContent: numberTwoCoilString
    } ];

    const coilRadioButtonGroup = new RectangularRadioButtonGroup( model.topCoilVisibleProperty, coilButtonGroupContents, {
      radioButtonOptions: {
        xMargin: 20,
        yMargin: 4,
        baseColor: '#cdd5f6', // lavender-ish
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 3,
          deselectedLineWidth: 1
        }
      },
      left: 377,
      bottom: 0,
      orientation: 'horizontal',
      tandem: tandem.createTandem( 'coilRadioButtonGroup' ),
      phetioDocumentation: 'Radio button group that selects between one or two coils.',
      containerTagName: 'li',
      labelContent: circuitModeString
    } );

    model.topCoilVisibleProperty.lazyLink( showTopCoil => {
      FaradaysLawAlertManager.coilConnectionAlert( showTopCoil );
    } );

    const showVoltmeterLabel = new Text( faradaysLawVoltmeterString, { font: new PhetFont( 16 ) } );
    showVoltmeterLabel.scale( Math.min( 150 / showVoltmeterLabel.width, 1 ) );

    const voltmeterCheckbox = new Checkbox( model.voltmeterVisibleProperty, showVoltmeterLabel, {
      x: 174,
      centerY: coilRadioButtonGroup.centerY - 20,
      tandem: tandem.createTandem( 'voltmeterCheckbox' ),
      phetioDocumentation: 'Checkbox that selects whether the voltmeter will be shown.',
      containerTagName: 'li',
      labelTagName: 'label',
      labelContent: voltmeterString,
      descriptionContent: voltmeterDescriptionString
    } );
    voltmeterCheckbox.touchArea = voltmeterCheckbox.localBounds.dilated( 8 );
    this.addChild( voltmeterCheckbox );

    model.voltmeterVisibleProperty.lazyLink( showVoltmeter => {
      FaradaysLawAlertManager.voltmeterAttachmentAlert( showVoltmeter );
    } );

    // Create the label for the "Show Field Lines" checkbox, scaling it if it's too long.
    const showFieldLinesLabel = new Text( faradaysLawShowFieldLinesString, { font: new PhetFont( 16 ) } );
    showFieldLinesLabel.scale( Math.min( 150 / showFieldLinesLabel.width, 1 ) ); // max width empirically determined

    // show field lines
    const fieldLinesCheckbox = new Checkbox( model.magnet.fieldLinesVisibleProperty, showFieldLinesLabel, {
      x: 174,
      centerY: coilRadioButtonGroup.centerY + 20,
      tandem: tandem.createTandem( 'fieldLinesCheckbox' ),
      phetioDocumentation: 'Checkbox that selects whether the magnetic field lines will be shown.',
      containerTagName: 'li',
      labelTagName: 'label',
      labelContent: fieldLinesString,
      descriptionContent: fieldLinesDescriptionString
    } );
    fieldLinesCheckbox.touchArea = fieldLinesCheckbox.localBounds.dilated( 8 );
    this.addChild( fieldLinesCheckbox );

    model.magnet.fieldLinesVisibleProperty.lazyLink( showLines => {
      FaradaysLawAlertManager.fieldLinesVisibilityAlert( showLines );
    } );

    this.addChild( coilRadioButtonGroup );

    // for a11y ordering
    this.addChild( resetAllButton );

    this.bottom = model.bounds.maxY - 10;

    // pdom keyboard nav order
    this.pdomOrder = [
      voltmeterCheckbox,
      fieldLinesCheckbox,
      coilRadioButtonGroup
    ];
  }
}

faradaysLaw.register( 'ControlPanelNode', ControlPanelNode );
export default ControlPanelNode;