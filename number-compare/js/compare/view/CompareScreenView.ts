// Copyright 2019-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Compare' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Range from '../../../../dot/js/Range.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SpeechSynthesisControl from '../../../../number-suite-common/js/common/view/SpeechSynthesisControl.js';
import TotalAccordionBox, { TotalAccordionBoxOptions } from '../../../../number-suite-common/js/common/view/TotalAccordionBox.js';
import CompareCountingType from '../model/CompareCountingType.js';
import CompareModel from '../model/CompareModel.js';
import BlockValuesNode from './BlockValuesNode.js';
import CompareCountingTypeRadioButtonGroup from './CompareCountingTypeRadioButtonGroup.js';
import CompareNumberLineNode from './CompareNumberLineNode.js';
import ComparisonTextNode from './ComparisonTextNode.js';
import CountingAccordionBox, { CountingAccordionBoxOptions } from '../../../../number-suite-common/js/common/view/CountingAccordionBox.js';
import OrganizeButton from '../../../../number-suite-common/js/common/view/OrganizeButton.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import CountingObjectType from '../../../../counting-common/js/common/model/CountingObjectType.js';
import numberCompare from '../../numberCompare.js';
import numberCompareSpeechSynthesisAnnouncer from '../../common/view/numberCompareSpeechSynthesisAnnouncer.js';
import numberCompareUtteranceQueue from '../../common/view/numberCompareUtteranceQueue.js';
import NumberCompareColors from '../../common/NumberCompareColors.js';
import NumberSuiteCommonColors from '../../../../number-suite-common/js/common/NumberSuiteCommonColors.js';
import NumberSuiteCommonConstants from '../../../../number-suite-common/js/common/NumberSuiteCommonConstants.js';
import Property from '../../../../axon/js/Property.js';
import LocaleRadioButtonGroup from './LocaleRadioButtonGroup.js';
import numberComparePreferences from '../../common/model/numberComparePreferences.js';

// constants
const UPPER_ACCORDION_BOX_CONTENT_HEIGHT = 80; // in screen coordinates
const LOWER_ACCORDION_BOX_CONTENT_WIDTH = 390; // in screen coordinates

// strings
const lessThanString = '<';
const equalString = '=';
const greaterThanString = '>';

class CompareScreenView extends ScreenView {
  private readonly leftTotalAccordionBoxExpandedProperty: Property<boolean>;
  private readonly rightTotalAccordionBoxExpandedProperty: Property<boolean>;
  private readonly rightCountingAccordionBoxExpandedProperty: Property<boolean>;
  private readonly leftCountingAccordionBoxExpandedProperty: Property<boolean>;

  public constructor( model: CompareModel, tandem: Tandem ) {

    super( { tandem: tandem } );

    this.leftTotalAccordionBoxExpandedProperty = new BooleanProperty( true );
    this.rightTotalAccordionBoxExpandedProperty = new BooleanProperty( true );
    this.leftCountingAccordionBoxExpandedProperty = new BooleanProperty( true );
    this.rightCountingAccordionBoxExpandedProperty = new BooleanProperty( true );

    // config for the left and right TotalAccordionBox
    const totalAccordionBoxOptions = {
      font: new PhetFont( 78 ),
      arrowButtonOptions: {
        arrowWidth: 15, // empirically determined
        arrowHeight: 15 // empirically determined
      },
      arrowButtonSpacing: 5 // empirically determined
    };

    // create and add the left TotalAccordionBox
    const leftTotalAccordionBox = new TotalAccordionBox( model.leftCountingArea, UPPER_ACCORDION_BOX_CONTENT_HEIGHT,
      combineOptions<TotalAccordionBoxOptions>( {
        expandedProperty: this.leftTotalAccordionBoxExpandedProperty,
        fill: NumberCompareColors.mediumPurpleBackgroundColorProperty
      }, totalAccordionBoxOptions ) );
    leftTotalAccordionBox.top = this.layoutBounds.minY + NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_Y;
    this.addChild( leftTotalAccordionBox );

    // create and add the right TotalAccordionBox
    const rightTotalAccordionBox = new TotalAccordionBox( model.rightCountingArea, UPPER_ACCORDION_BOX_CONTENT_HEIGHT,
      combineOptions<TotalAccordionBoxOptions>( {
        expandedProperty: this.rightTotalAccordionBoxExpandedProperty,
        fill: NumberSuiteCommonColors.lightOrangeBackgroundColorProperty
      }, totalAccordionBoxOptions ) );
    rightTotalAccordionBox.top = leftTotalAccordionBox.top;
    this.addChild( rightTotalAccordionBox );

    // create and add the left CountingAccordionBox
    const leftCountingAccordionBox = new CountingAccordionBox(
      model.leftCountingArea,
      model.leftCountingObjectTypeProperty,
      LOWER_ACCORDION_BOX_CONTENT_WIDTH,
      NumberSuiteCommonConstants.TALL_LOWER_ACCORDION_BOX_HEIGHT, {
        countingObjectTypes: CountingObjectType.enumeration.values,
        expandedProperty: this.leftCountingAccordionBoxExpandedProperty,
        fill: NumberCompareColors.mediumPurpleBackgroundColorProperty
      } as unknown as CountingAccordionBoxOptions );
    leftCountingAccordionBox.left = NumberSuiteCommonConstants.ACCORDION_BOX_MARGIN_X;
    leftCountingAccordionBox.bottom = this.layoutBounds.maxY - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_Y;
    this.addChild( leftCountingAccordionBox );

    // create and add the right CountingAccordionBox
    const rightCountingAccordionBox = new CountingAccordionBox(
      model.rightCountingArea,
      model.rightCountingObjectTypeProperty,
      LOWER_ACCORDION_BOX_CONTENT_WIDTH,
      NumberSuiteCommonConstants.TALL_LOWER_ACCORDION_BOX_HEIGHT, {
        countingObjectTypes: CountingObjectType.enumeration.values,
        expandedProperty: this.rightCountingAccordionBoxExpandedProperty,
        fill: NumberSuiteCommonColors.lightOrangeBackgroundColorProperty
      } as unknown as CountingAccordionBoxOptions );
    rightCountingAccordionBox.right = this.layoutBounds.maxX - NumberSuiteCommonConstants.ACCORDION_BOX_MARGIN_X;
    rightCountingAccordionBox.bottom = leftCountingAccordionBox.bottom;
    this.addChild( rightCountingAccordionBox );

    // set the x-position of the TotalAccordionBox's after the CompareObjectAccordionBoxes have been added
    leftTotalAccordionBox.right = leftCountingAccordionBox.right;
    rightTotalAccordionBox.left = rightCountingAccordionBox.left;

    // create and add the ComparisonTextNode
    const comparisonTextNode = new ComparisonTextNode(
      model.comparisonStringProperty,
      this.layoutBounds
    );
    comparisonTextNode.centerY = new Range( leftTotalAccordionBox.bottom, leftCountingAccordionBox.top ).getCenter();
    this.addChild( comparisonTextNode );

    // create and add the SpeechSynthesisButton if the announcer is initialized
    if ( numberCompareSpeechSynthesisAnnouncer.initialized ) {
      const speechSynthesisControl = new SpeechSynthesisControl(
        numberCompareSpeechSynthesisAnnouncer,
        numberCompareUtteranceQueue, {
          speechSynthesisButtonOptions: {
            comparisonSignsAndTextVisibleProperty: model.comparisonSignsAndTextVisibleProperty
          },
          left: NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_X,
          top: leftTotalAccordionBox.top
        } );
      this.addChild( speechSynthesisControl );
    }

    // LocaleRadioButtonGroup
    const localeRadioButtonGroup = new LocaleRadioButtonGroup();
    localeRadioButtonGroup.left = leftCountingAccordionBox.left;
    localeRadioButtonGroup.top = leftTotalAccordionBox.top + 2;
    this.addChild( localeRadioButtonGroup );

    // create and add the comparison signs node
    const comparisonSignsNode = new Text( equalString, { font: new PhetFont( 90 ) } );
    this.addChild( comparisonSignsNode );
    comparisonSignsNode.centerX = this.layoutBounds.centerX;
    comparisonSignsNode.centerY = leftTotalAccordionBox.centerY;

    // create and add the CompareCountingTypeRadioButtonGroup
    const countingTypeRadioButtonGroup = new CompareCountingTypeRadioButtonGroup( model.countingTypeProperty );
    countingTypeRadioButtonGroup.right = this.layoutBounds.maxX - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_X;
    countingTypeRadioButtonGroup.top = leftTotalAccordionBox.top;
    this.addChild( countingTypeRadioButtonGroup );

    // create and add the show comparison checkbox
    const showComparisonCheckbox = new Checkbox( model.comparisonSignsAndTextVisibleProperty, new Text( `${lessThanString} ${equalString} ${greaterThanString}`, { font: new PhetFont( 20 ) } ) );
    showComparisonCheckbox.right = countingTypeRadioButtonGroup.right;
    showComparisonCheckbox.top = countingTypeRadioButtonGroup.bottom + 14; // empirically determined
    this.addChild( showComparisonCheckbox );

    // create and add the BlockValuesNode
    const blockValuesNode = new BlockValuesNode( model.leftCountingArea.sumProperty, model.rightCountingArea.sumProperty );
    this.addChild( blockValuesNode );
    blockValuesNode.centerX = comparisonSignsNode.centerX;
    blockValuesNode.bottom = leftCountingAccordionBox.bottom - 4; // empirically determined tweak

    // create and add the CompareNumberLineNode
    const compareNumberLineNode = new CompareNumberLineNode(
      NumberSuiteCommonConstants.TALL_LOWER_ACCORDION_BOX_HEIGHT - 22,
      model.leftCountingArea.sumProperty,
      model.rightCountingArea.sumProperty,
      model.sumRange
    );
    compareNumberLineNode.x = comparisonSignsNode.centerX;
    compareNumberLineNode.bottom = leftCountingAccordionBox.bottom + 3;
    this.addChild( compareNumberLineNode );

    // create and add the ResetAllButton
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_X,
      bottom: this.layoutBounds.maxY - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_Y,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // create and add a button to organize the left counting objects in a grid
    const leftOrganizeButton = new OrganizeButton( NumberCompareColors.mediumPurpleBackgroundColorProperty, () => {
      model.leftCountingArea.organizeObjects();
    } );
    leftOrganizeButton.left = NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_X;
    leftOrganizeButton.top = leftCountingAccordionBox.top;
    this.addChild( leftOrganizeButton );

    // create and add a button to organize the objectsAccordionBox countingObjects in a grid
    const rightOrganizeButton = new OrganizeButton( NumberSuiteCommonColors.lightOrangeBackgroundColorProperty, () => {
      model.rightCountingArea.organizeObjects();
    } );
    rightOrganizeButton.centerX = resetAllButton.centerX;
    rightOrganizeButton.top = rightCountingAccordionBox.top;
    this.addChild( rightOrganizeButton );

    // update the comparison signs node's text and the BlockValuesNode when either current number changes
    Multilink.multilink( [ model.leftCountingArea.sumProperty, model.rightCountingArea.sumProperty ],
      ( leftCurrentNumber, rightCurrentNumber ) => {
        comparisonSignsNode.string = leftCurrentNumber < rightCurrentNumber ? lessThanString :
                                     leftCurrentNumber > rightCurrentNumber ? greaterThanString : equalString;
      } );

    // update the visibility of the comparison signs node
    model.comparisonSignsAndTextVisibleProperty.link( visible => {
      comparisonSignsNode.visible = visible;
      comparisonTextNode.visible = visible;
    } );

    // update the visibility of the BlockValuesNode and NumberLineNode
    model.countingTypeProperty.link( countingType => {
      blockValuesNode.visible = countingType === CompareCountingType.BLOCKS;
      compareNumberLineNode.visible = countingType === CompareCountingType.NUMBER_LINE;
    } );
  }

  /**
   * Resets the view.
   */
  public reset(): void {
    this.leftTotalAccordionBoxExpandedProperty.reset();
    this.rightTotalAccordionBoxExpandedProperty.reset();
    this.leftCountingAccordionBoxExpandedProperty.reset();
    this.rightCountingAccordionBoxExpandedProperty.reset();
    numberComparePreferences.autoHearEnabledProperty.value && numberCompareUtteranceQueue.speakSpeechData();
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

numberCompare.register( 'CompareScreenView', CompareScreenView );
export default CompareScreenView;