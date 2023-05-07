// Copyright 2023, University of Colorado Boulder

/**
 * Kepler's second law panel control: Swept area
 *
 * This class is mostly empty and only has SecondLawGraph as a child to keep code consistency across the three laws.
 *
 * @author Agustín Vallejo
 */

import KeplersLawsModel from '../model/KeplersLawsModel.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import SecondLawGraph from './SecondLawGraph.js';
import keplersLaws from '../../keplersLaws.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import ArrowButton, { ArrowButtonOptions } from '../../../../sun/js/buttons/ArrowButton.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import KeplersLawsStrings from '../../KeplersLawsStrings.js';
import { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import KeplersLawsConstants from '../../KeplersLawsConstants.js';

export default class SecondLawPanels extends VBox {
  public constructor( model: KeplersLawsModel ) {
    super( {
      margin: 5,
      stretch: true,
      children: [
        new SecondLawPanel( model ),
        new SecondLawGraph( model )
      ],
      visibleProperty: model.isSecondLawProperty
    } );
  }
}

class SecondLawPanel extends Panel {
  public constructor( model: KeplersLawsModel ) {
    const options = combineOptions<AccordionBoxOptions>( {
      visibleProperty: model.isSecondLawProperty
    }, SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS );

    super( new VBox( {
      spacing: SolarSystemCommonConstants.CHECKBOX_SPACING,
      children: [
        new Text( KeplersLawsStrings.area.periodDivisionStringProperty, SolarSystemCommonConstants.TEXT_OPTIONS ),
        new DivisionsArrowButtonsBox( model ),
        new Checkbox( model.areaValuesVisibleProperty, new Text( KeplersLawsStrings.area.valuesStringProperty, SolarSystemCommonConstants.TEXT_OPTIONS ), SolarSystemCommonConstants.CHECKBOX_OPTIONS )
      ]
    } ), options );
  }
}

class DivisionsArrowButtonsBox extends HBox {
  public constructor( model: KeplersLawsModel ) {

    const divisionsRange = new RangeWithValue(
      KeplersLawsConstants.MIN_ORBITAL_DIVISIONS,
      KeplersLawsConstants.MAX_ORBITAL_DIVISIONS,
      4 );

    const arrowButtonOptions: ArrowButtonOptions = {
      baseColor: 'white',
      stroke: 'black',
      lineWidth: 1
    };

    // increment button
    const incrementButton = new ArrowButton(
      'right',
      () => {
        const numberValue = model.periodDivisionProperty.value;
        model.periodDivisionProperty.value =
          numberValue < divisionsRange.max ?
          numberValue + 1 :
          numberValue;
      },
      combineOptions<ArrowButtonOptions>( {
        enabledProperty: new DerivedProperty(
          [ model.periodDivisionProperty ],
          periodDivisions => {
            return periodDivisions < divisionsRange.max;
          }
        )
      }, arrowButtonOptions )
    );

    // decrement button
    const decrementButton = new ArrowButton(
      'left',
      () => {
        const numberValue = model.periodDivisionProperty.value;
        model.periodDivisionProperty.value =
          numberValue > divisionsRange.min ?
          numberValue - 1 :
          numberValue;
      },
      combineOptions<ArrowButtonOptions>( {
        enabledProperty: new DerivedProperty(
          [ model.periodDivisionProperty ],
          periodDivisions => {
            return periodDivisions > divisionsRange.min;
          }
        )
      }, arrowButtonOptions )
    );

    super( {
      spacing: 5,
      children: [
        decrementButton,
        new NumberDisplay( model.periodDivisionProperty, divisionsRange ),
        incrementButton
      ]
    } );
  }
}

keplersLaws.register( 'SecondLawPanels', SecondLawPanels );