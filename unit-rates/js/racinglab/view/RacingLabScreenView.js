// Copyright 2017-2023, University of Colorado Boulder

/**
 * View for the 'Racing Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import URConstants from '../../common/URConstants.js';
import DoubleNumberLineAccordionBox from '../../common/view/DoubleNumberLineAccordionBox.js';
import KeypadLayer from '../../common/view/KeypadLayer.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import NumberOfCarsRadioButtonGroup from './NumberOfCarsRadioButtonGroup.js';
import RaceCarRateAccordionBox from './RaceCarRateAccordionBox.js';
import RaceTrackNode from './RaceTrackNode.js';
import RacingLabViewProperties from './RacingLabViewProperties.js';
import ResetRaceButton from './ResetRaceButton.js';
import StartStopButton from './StartStopButton.js';

// constants
const BUTTON_X_SPACE = 20; // space between buttons
const ACCORDION_BOX_X_SPACE = 10; // space between accordion boxes

export default class RacingLabScreenView extends ScreenView {

  /**
   * @param {RacingLabModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    super( options );

    // Properties that are specific to the view
    const viewProperties = new RacingLabViewProperties();

    // parent for everything expect the keypad
    const playAreaLayer = new Node();
    this.addChild( playAreaLayer );

    // separate layer for model keypad
    const keypadLayer = new KeypadLayer();
    this.addChild( keypadLayer );

    // Double number line for car1
    const doubleNumberLineAccordionBox1 = new DoubleNumberLineAccordionBox(
      model.car1.doubleNumberLine, model.car1.markerEditor, keypadLayer, {
        axisViewLength: URConstants.RACING_LAB_AXIS_LENGTH,
        titleString: UnitRatesStrings.doubleNumberLine1StringProperty,
        expandedProperty: viewProperties.doubleNumberLineExpandedProperty1,
        indicatorXProperty: model.car1.distanceProperty,
        indicatorColor: model.car1.color,
        keypadPosition: 'below',
        left: this.layoutBounds.left + URConstants.SCREEN_X_MARGIN,
        top: this.layoutBounds.top + URConstants.SCREEN_Y_MARGIN
      } );
    playAreaLayer.addChild( doubleNumberLineAccordionBox1 );

    // Double number line for car2
    const doubleNumberLineAccordionBox2 = new DoubleNumberLineAccordionBox(
      model.car2.doubleNumberLine, model.car2.markerEditor, keypadLayer, {
        axisViewLength: URConstants.RACING_LAB_AXIS_LENGTH,
        titleString: UnitRatesStrings.doubleNumberLine2StringProperty,
        expandedProperty: viewProperties.doubleNumberLineExpandedProperty2,
        indicatorXProperty: model.car2.distanceProperty,
        indicatorColor: model.car2.color,
        keypadPosition: 'above',
        left: this.layoutBounds.left + URConstants.SCREEN_X_MARGIN,
        bottom: this.layoutBounds.bottom - URConstants.SCREEN_Y_MARGIN
      } );
    playAreaLayer.addChild( doubleNumberLineAccordionBox2 );

    // Rate control for car1
    const rateAccordionBox1 = new RaceCarRateAccordionBox( model.car1, {
      titleString: UnitRatesStrings.rate1StringProperty,
      expandedProperty: viewProperties.rateExpandedProperty1,
      left: doubleNumberLineAccordionBox1.right + ACCORDION_BOX_X_SPACE,
      top: doubleNumberLineAccordionBox1.top
    } );
    playAreaLayer.addChild( rateAccordionBox1 );

    // Rate control for car2
    const rateAccordionBox2 = new RaceCarRateAccordionBox( model.car2, {
      titleString: UnitRatesStrings.rate2StringProperty,
      expandedProperty: viewProperties.rateExpandedProperty2,
      left: doubleNumberLineAccordionBox2.right + ACCORDION_BOX_X_SPACE,
      top: doubleNumberLineAccordionBox2.top
    } );
    playAreaLayer.addChild( rateAccordionBox2 );

    // Track for car1
    const trackNode1 = new RaceTrackNode( model.car1, viewProperties.timerExpandedProperty1, viewProperties.arrowsVisibleProperty, {
      timerTitleString: UnitRatesStrings.timer1StringProperty,
      trackViewLength: URConstants.RACING_LAB_AXIS_LENGTH,
      x: this.globalToLocalPoint( doubleNumberLineAccordionBox1.getGlobalOrigin() ).x, // aligned with double number line
      bottom: this.layoutBounds.centerY - 10
    } );
    playAreaLayer.addChild( trackNode1 );

    // Track for car2
    const trackNode2 = new RaceTrackNode( model.car2, viewProperties.timerExpandedProperty2, viewProperties.arrowsVisibleProperty, {
      timerTitleString: UnitRatesStrings.timer2StringProperty,
      trackViewLength: URConstants.RACING_LAB_AXIS_LENGTH,
      x: this.globalToLocalPoint( doubleNumberLineAccordionBox2.getGlobalOrigin() ).x, // aligned with double number line
      top: this.layoutBounds.centerY + ( this.layoutBounds.centerY - trackNode1.bottom )
    } );
    playAreaLayer.addChild( trackNode2 );

    // Radio button group for number of cars
    const numberOfCarsRadioButtonGroup = new NumberOfCarsRadioButtonGroup( model.car2.visibleProperty, {
      right: this.layoutBounds.maxX - URConstants.SCREEN_X_MARGIN,
      centerY: this.layoutBounds.centerY
    } );
    playAreaLayer.addChild( numberOfCarsRadioButtonGroup );

    // Start/Stop button
    const startStopButton = new StartStopButton( model.runningProperty, {
      right: numberOfCarsRadioButtonGroup.left - BUTTON_X_SPACE,
      centerY: this.layoutBounds.centerY
    } );
    playAreaLayer.addChild( startStopButton );

    // Reset Race button
    const resetRace = new ResetRaceButton( {
      listener: () => {
        model.runningProperty.value = false;
        model.car1.resetRace();
        model.car2.resetRace();
      },
      right: startStopButton.left - BUTTON_X_SPACE,
      centerY: startStopButton.centerY
    } );
    playAreaLayer.addChild( resetRace );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - URConstants.SCREEN_X_MARGIN,
      bottom: this.layoutBounds.maxY - URConstants.SCREEN_Y_MARGIN
    } );
    playAreaLayer.addChild( resetAllButton );

    // car1 should always be visible, because the view doesn't doesn't support hiding it. unlink not needed.
    model.car1.visibleProperty.link( visible => {
      assert && assert( model.car1.visibleProperty.value, 'car1 should always be visible' );
    } );

    // Show/hide components related to car2. unlink not needed.
    model.car2.visibleProperty.link( visible => {
      rateAccordionBox2.visible = visible;
      doubleNumberLineAccordionBox2.visible = visible;
      trackNode2.visible = visible;
    } );

    // Disable the restart button when both cars are at the starting line. unmultilink not needed
    Multilink.multilink( [ model.car1.distanceProperty, model.car2.distanceProperty ],
      ( distance1, distance2 ) => {
        resetRace.enabled = !( distance1 === 0 && distance2 === 0 );
      } );
  }
}

unitRates.register( 'RacingLabScreenView', RacingLabScreenView );