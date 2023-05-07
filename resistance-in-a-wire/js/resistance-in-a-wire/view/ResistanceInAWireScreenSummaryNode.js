// Copyright 2018-2023, University of Colorado Boulder

/**
 * The Screen Summary for Resistance in a Wire. This summary is at the top of the document, and is the first thing
 * that a screen reader user reads when using the sim. It provides overview information about the resistance
 * equation, visualization of the circuit, and the controls in the interface.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireStrings from '../../ResistanceInAWireStrings.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';

const summarySimString = ResistanceInAWireStrings.a11y.summary.sim;
const summaryCurrentlyString = ResistanceInAWireStrings.a11y.summary.currently;
const summaryResistancePatternString = ResistanceInAWireStrings.a11y.summary.resistancePattern;
const summaryResistivityPatternString = ResistanceInAWireStrings.a11y.summary.resistivityPattern;
const summaryLengthPatternString = ResistanceInAWireStrings.a11y.summary.lengthPattern;
const summaryAreaPatternString = ResistanceInAWireStrings.a11y.summary.areaPattern;
const summaryInteractionHintString = ResistanceInAWireStrings.a11y.summary.interactionHint;

class ResistanceInAWireScreenSummaryNode extends Node {
  // constants
  constructor( model ) {
    super();

    // main summary for this sim - this content never changes
    this.addChild( new Node( {
      tagName: 'p',
      innerContent: summarySimString
    } ) );

    // indicates that the summary updates with model changes
    this.addChild( new Node( { tagName: 'p', innerContent: summaryCurrentlyString } ) );

    // list that updates according to model Properties
    const listNode = new Node( { tagName: 'ul' } );
    const resistanceItemNode = new Node( { tagName: 'li' } );
    const resistivityItemNode = new Node( { tagName: 'li' } );
    const lengthItemNode = new Node( { tagName: 'li' } );
    const areaItemNode = new Node( { tagName: 'li' } );
    this.addChild( listNode );
    listNode.children = [ resistanceItemNode, resistivityItemNode, lengthItemNode, areaItemNode ];

    // hint to look for other elements in the UI
    this.addChild( new Node( { tagName: 'p', innerContent: summaryInteractionHintString } ) );

    // add listeners - add all values to a list so we can easily iterate and add listeners to update descriptions
    // with each property
    [
      {
        property: model.resistivityProperty,
        patternString: summaryResistivityPatternString,
        node: resistivityItemNode,
        precision: ResistanceInAWireConstants.SLIDER_READOUT_DECIMALS
      },
      {
        property: model.lengthProperty,
        patternString: summaryLengthPatternString,
        node: lengthItemNode,
        precision: ResistanceInAWireConstants.SLIDER_READOUT_DECIMALS
      },
      {
        property: model.areaProperty,
        patternString: summaryAreaPatternString,
        node: areaItemNode,
        precision: ResistanceInAWireConstants.SLIDER_READOUT_DECIMALS
      },
      {
        property: model.resistanceProperty,
        patternString: summaryResistancePatternString,
        node: resistanceItemNode,
        precision: ResistanceInAWireConstants.getResistanceDecimals
      }
    ].forEach( item => {

      // register listeners that update the labels in the screen summary - this summary exists for life of sim,
      // no need to dispose
      item.property.link( value => {

        // the precision might change during interaction, get precision if property is a function
        const precision = typeof item.precision === 'number' ? item.precision : item.precision( value );
        item.node.innerContent = StringUtils.fillIn( item.patternString, {
          value: Utils.toFixed( value, precision )
        } );
      } );
    } );
  }
}

resistanceInAWire.register( 'ResistanceInAWireScreenSummaryNode', ResistanceInAWireScreenSummaryNode );
export default ResistanceInAWireScreenSummaryNode;