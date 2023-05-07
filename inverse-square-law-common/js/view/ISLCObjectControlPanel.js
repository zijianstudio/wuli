// Copyright 2017-2022, University of Colorado Boulder

/**
 * Arrow buttons, slider and text box for editing the object value amount.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations
 */

import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { GroupFocusHighlightFromNode, Text } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';
import InverseSquareLawCommonStrings from '../InverseSquareLawCommonStrings.js';
import ISLCPanel from './ISLCPanel.js';

const pattern0Value1UnitsString = InverseSquareLawCommonStrings.pattern_0value_1units;

// constants
const TITLE_MAX_WIDTH = 150; // max widths are set empirically to handle long strings
const VALUE_MAX_WIDTH = 110;

class ISLCObjectControlPanel extends ISLCPanel {

  /**
   * @param {string} titleString
   * @param {string} unitString
   * @param {Property.<number>} objectProperty
   * @param {Range} valueRange
   * @param {Object} [options]
   */
  constructor( titleString, unitString, objectProperty, valueRange, options ) {

    options = merge( {

      // panel options
      fill: '#EDEDED',
      xMargin: 10,
      yMargin: 4,
      resize: false,
      align: 'right',
      minWidth: 100, // to offset parent minWidth

      numberControlOptions: null, // filled in below

      // filled in here because they are used by numberControlOptions below
      tickLabelOptions: {
        pickable: false
      },
      additionalTicks: [],

      // pdom
      tagName: 'div', // this optional structure is added for nicer formatting of value-text in the a11y view

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    const tandem = options.tandem;

    // options that are passed along to the number control
    const numberControlOptions = merge( {

      // layout options
      layoutFunction: NumberControl.createLayoutFunction3( { xSpacing: 10 } ),
      numberDisplayOptions: {
        valuePattern: StringUtils.fillIn( pattern0Value1UnitsString, { units: unitString } ),
        align: 'right',
        xMargin: 10,
        yMargin: 4,
        backgroundStroke: 'black',
        cornerRadius: 3,
        textOptions: {
          font: new PhetFont( 12 )
        },
        maxWidth: VALUE_MAX_WIDTH
      },
      sliderOptions: {
        trackFillEnabled: 'black',

        // tick options
        minorTickSpacing: 2,
        minorTickLength: 6,
        majorTicks: [ {
          value: valueRange.min,
          label: new Text( valueRange.min, options.tickLabelOptions )
        }, {
          value: valueRange.max,
          label: new Text( valueRange.max, options.tickLabelOptions )
        } ],
        majorTickLength: 8,
        tickLabelSpacing: 1
      },
      arrowButtonOptions: {
        touchAreaXDilation: 15,
        touchAreaYDilation: 15,
        scale: 1
      },

      // title and value text options
      titleNodeOptions: {
        font: new PhetFont( 12 ),
        maxWidth: TITLE_MAX_WIDTH
      },

      // phet-io
      tandem: tandem.createTandem( ISLCObjectControlPanel.NUMBER_CONTROL_TANDEM_NAME )
    }, options.numberControlOptions );

    for ( let i = 0; i < options.additionalTicks.length; i++ ) {
      const tick = {
        value: options.additionalTicks[ i ].value,
        label: new Text( options.additionalTicks[ i ].value, options.tickLabelOptions )
      };
      numberControlOptions.sliderOptions.majorTicks.push( tick );
    }

    // @protected
    const numberControl = new NumberControl( titleString, objectProperty, valueRange, numberControlOptions );

    options = _.omit( options, [ 'numberControlOptions', 'tickLabelOptions' ] );
    super( numberControl, options );

    this.numberControl = numberControl;

    // pdom - it looks nicer if the entire panel has a group focus highlight rather than the NumberControl
    assert && assert( numberControlOptions.groupFocusHighlight === undefined, 'ISLCObjectControlPanel sets group focus highlight' );
    this.numberControl.groupFocusHighlight = false;

    // pdom - creates highlight that appears around this node when any ancestor (like the
    // NumberControl) has focus
    this.groupFocusHighlight = new GroupFocusHighlightFromNode( this, {
      useLocalBounds: true,
      dilationCoefficient: 3.7
    } );
  }
}

// @public
ISLCObjectControlPanel.NUMBER_CONTROL_TANDEM_NAME = 'numberControl';

inverseSquareLawCommon.register( 'ISLCObjectControlPanel', ISLCObjectControlPanel );
export default ISLCObjectControlPanel;