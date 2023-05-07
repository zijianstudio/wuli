// Copyright 2017-2022, University of Colorado Boulder

/**
 * An edit button and readout for the associated term.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import Polynomial from '../../common/model/Polynomial.js';
import Term from '../../common/model/Term.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import Entry from '../model/Entry.js';
import EntryStatus from '../model/EntryStatus.js';
import InputMethod from '../model/InputMethod.js';

class PolynomialEditNode extends VBox {
  /**
   * @param {Property.<Polynomial|null>} polynomialProperty
   * @param {Property.<Array.<Entry>>} totalEntriesProperty
   * @param {function} editedCallback - Called with no arguments when something is edited
   */
  constructor( polynomialProperty, totalEntriesProperty, editedCallback ) {
    const longestString = new Polynomial( [
      new Term( -9, 2 ),
      new Term( -9, 1 ),
      new Term( -9, 0 )
    ] ).toRichString();

    const readoutText = new RichText( longestString, {
      font: AreaModelCommonConstants.POLYNOMIAL_EDIT_READOUT_FONT
    } );

    const readoutBackgroundRectangle = Rectangle.bounds( readoutText.bounds.dilatedXY( 30, 5 ), {
      cornerRadius: 3,
      stroke: 'black',
      fill: 'white'
    } );
    readoutText.centerY = readoutBackgroundRectangle.centerY; // Don't reposition vertically with exponents
    polynomialProperty.link( polynomial => {
      readoutText.string = polynomial === null ? '0' : polynomial.toRichString();
      readoutText.centerX = readoutBackgroundRectangle.centerX;
    } );
    const readout = new Node( {
      children: [
        readoutBackgroundRectangle,
        readoutText
      ]
    } );

    const editFont = AreaModelCommonConstants.GAME_POLYNOMIAL_EDIT_FONT;

    // {Property.<Entry>}
    const constantEntryProperty = new DerivedProperty( [ totalEntriesProperty ], totalEntries => totalEntries.length > 1 ? totalEntries[ 0 ] : new Entry( null ) );
    const xEntryProperty = new DerivedProperty( [ totalEntriesProperty ], totalEntries => totalEntries.length > 1 ? totalEntries[ 1 ] : new Entry( null ) );
    const xSquaredEntryProperty = new DerivedProperty( [ totalEntriesProperty ], totalEntries => totalEntries.length > 2 ? totalEntries[ 2 ] : new Entry( null ) );

    const constantProperty = new DynamicProperty( constantEntryProperty, {
      derive: 'valueProperty',
      map: term => term === null ? 0 : term.coefficient,
      inverseMap: number => new Term( number, 0 ),
      bidirectional: true
    } );

    const xProperty = new DynamicProperty( xEntryProperty, {
      derive: 'valueProperty',
      map: term => term === null ? 0 : term.coefficient,
      inverseMap: number => new Term( number, 1 ),
      bidirectional: true
    } );

    const xSquaredProperty = new DynamicProperty( xSquaredEntryProperty, {
      derive: 'valueProperty',
      map: term => term === null ? 0 : term.coefficient,
      inverseMap: number => new Term( number, 2 ),
      bidirectional: true
    } );

    // When one is changed, we want to make sure that all entries are not marked as dirty internally (so that the user
    // can submit after just changing one value). This is done by providing an actual value to the property.
    function provideEntryValues() {
      [ constantEntryProperty, xEntryProperty, xSquaredEntryProperty ].forEach( ( entryProperty, index ) => {
        const valueProperty = entryProperty.value.valueProperty;
        if ( valueProperty.value === null ) {
          valueProperty.value = new Term( 0, index );
        }
      } );
    }

    function linkProperty( property, entryProperty ) {
      property.link( () => {
        // Only flag the values as edited when the user makes a change (not when we set it as part of a challenge)
        if ( property.isExternallyChanging ) {
          editedCallback();
          provideEntryValues();
          entryProperty.value.statusProperty.value = EntryStatus.NORMAL;
        }
      } );
    }

    linkProperty( constantProperty, constantEntryProperty );
    linkProperty( xProperty, xEntryProperty );
    linkProperty( xSquaredProperty, xSquaredEntryProperty );

    // [-81,81] is the actual range we need for editable values,
    // see https://github.com/phetsims/area-model-common/issues/94
    const rangeProperty = new Property( new Range( -81, 81 ) );

    function getPickerColorProperty( entryProperty ) {
      return new DerivedProperty( [
        new DynamicProperty( entryProperty, { derive: 'statusProperty' } ),
        AreaModelCommonColors.errorStatusProperty,
        AreaModelCommonColors.dirtyStatusProperty
      ], ( highlight, errorColor, dirtyColor ) => {
        if ( highlight === EntryStatus.NORMAL ) {
          return 'black';
        }
        else if ( highlight === EntryStatus.DIRTY ) {
          return dirtyColor;
        }
        else {
          return errorColor;
        }
      } );
    }

    const constantPicker = new NumberPicker( constantProperty, rangeProperty, {
      color: getPickerColorProperty( constantEntryProperty )
    } );
    const xPicker = new NumberPicker( xProperty, rangeProperty, {
      color: getPickerColorProperty( xEntryProperty )
    } );
    const xSquaredPicker = new NumberPicker( xSquaredProperty, rangeProperty, {
      color: getPickerColorProperty( xSquaredEntryProperty )
    } );

    const xText = new RichText( AreaModelCommonConstants.X_VARIABLE_RICH_STRING, { font: editFont } );
    const xSquaredText = new RichText( `${AreaModelCommonConstants.X_VARIABLE_RICH_STRING}<sup>2</sup>`, { font: editFont } );
    const plus1 = new Text( MathSymbols.PLUS, { font: editFont } );
    const plus2 = new Text( MathSymbols.PLUS, { font: editFont } );

    const xSquaredChildren = [
      xSquaredPicker,
      xSquaredText,
      plus1,
      xPicker,
      xText,
      plus2,
      constantPicker
    ];
    const xChildren = [
      xPicker,
      xText,
      plus2,
      constantPicker
    ];

    const pickerContainer = new Node();
    // Hide the x^2 term if we won't use it
    constantEntryProperty.link( constantEntry => {
      pickerContainer.children = constantEntry.inputMethod === InputMethod.POLYNOMIAL_2
                                 ? xSquaredChildren
                                 : xChildren;
    } );

    xSquaredChildren.forEach( ( node, index ) => {
      if ( index > 0 ) {
        node.left = xSquaredChildren[ index - 1 ].right + 5;
      }
    } );
    constantPicker.centerY = xText.centerY;
    xPicker.centerY = xText.centerY;
    xSquaredPicker.centerY = xText.centerY;

    super( {
      children: [
        readout,
        pickerContainer
      ],
      spacing: 10
    } );
  }
}

areaModelCommon.register( 'PolynomialEditNode', PolynomialEditNode );

export default PolynomialEditNode;