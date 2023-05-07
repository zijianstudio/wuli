// Copyright 2023, University of Colorado Boulder

/**
 * Kepler's first law panel control: eccentricity display
 *
 * @author Agustín Vallejo
 */

import KeplersLawsModel from '../model/KeplersLawsModel.js';
import { HBox, Line, RichText, Text, TextOptions, VBox } from '../../../../scenery/js/imports.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import Panel from '../../../../sun/js/Panel.js';
import FirstLawGraph from './FirstLawGraph.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import SolarSystemCommonColors from '../../../../solar-system-common/js/SolarSystemCommonColors.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import KeplersLawsStrings from '../../KeplersLawsStrings.js';
import keplersLaws from '../../keplersLaws.js';
import SolarSystemCommonStrings from '../../../../solar-system-common/js/SolarSystemCommonStrings.js';

export default class FirstLawPanels extends VBox {
  public constructor( model: KeplersLawsModel ) {
    super( {
      margin: 5,
      children: [
        new EccentricityPanel( model ),
        new ValuesPanel( model )
      ]
    } );
  }
}

class EccentricityPanel extends Panel {
  public constructor( model: KeplersLawsModel ) {
    super( new VBox( {
      children: [
        new HBox( {
          children: [
            new Text( KeplersLawsStrings.eccentricityEquationStringProperty, SolarSystemCommonConstants.TITLE_OPTIONS ),
            new VBox( {
              children: [
                new Text( KeplersLawsStrings.symbols.focalDistanceStringProperty, {
                  ...SolarSystemCommonConstants.TITLE_OPTIONS,
                  fill: SolarSystemCommonColors.thirdBodyColorProperty
                } ),
                new Line( 0, 0, 30, 0, { stroke: 'white', lineWidth: 1.5, lineCap: 'round' } ),
                new Text( KeplersLawsStrings.symbols.semiMajorAxisStringProperty, {
                  ...SolarSystemCommonConstants.TITLE_OPTIONS,
                  fill: 'orange'
                } )
              ]
            } )
          ]
        } ),
        new FirstLawGraph( model )
      ],
      spacing: 10,
      align: 'left',
      stretch: true,
      visibleProperty: model.eccentricityVisibleProperty
    } ), SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS );
  }
}

class ValuesPanel extends Panel {
  public constructor( model: KeplersLawsModel ) {

    const conditionalAUStringProperty = new DerivedProperty(
      [ SolarSystemCommonStrings.units.AUStringProperty, model.engine.allowedOrbitProperty ],
      ( AUString, allowedOrbit ) => {
        return allowedOrbit ? AUString : '';
      } );

    const semiMajorAxisStringProperty = new PatternStringProperty( KeplersLawsStrings.pattern.textEqualsValueUnitsStringProperty, {
      text: KeplersLawsStrings.symbols.semiMajorAxisStringProperty,
      units: conditionalAUStringProperty,
      value: new DerivedProperty( [ model.engine.semiMajorAxisProperty, model.engine.allowedOrbitProperty, KeplersLawsStrings.undefinedStringProperty ], ( semiMajorAxis, allowedOrbit, undefinedMessage ) => {
        return allowedOrbit ? Utils.toFixed( semiMajorAxis, 2 ) : undefinedMessage;
      } )
    } );
    const semiMinorAxisStringProperty = new PatternStringProperty( KeplersLawsStrings.pattern.textEqualsValueUnitsStringProperty, {
      text: KeplersLawsStrings.symbols.semiMinorAxisStringProperty,
      units: conditionalAUStringProperty,
      value: new DerivedProperty( [ model.engine.semiMinorAxisProperty, model.engine.allowedOrbitProperty, KeplersLawsStrings.undefinedStringProperty ], ( semiMinorAxis, allowedOrbit, undefinedMessage ) => {
        return allowedOrbit ? Utils.toFixed( semiMinorAxis, 2 ) : undefinedMessage;
      } )
    } );
    const focalDistanceStringProperty = new PatternStringProperty( KeplersLawsStrings.pattern.textEqualsValueUnitsStringProperty, {
      text: KeplersLawsStrings.symbols.focalDistanceStringProperty,
      units: conditionalAUStringProperty,
      value: new DerivedProperty( [ model.engine.focalDistanceProperty, model.engine.allowedOrbitProperty, KeplersLawsStrings.undefinedStringProperty ], ( focalDistance, allowedOrbit, undefinedMessage ) => {
        return allowedOrbit ? Utils.toFixed( focalDistance, 2 ) : undefinedMessage;
      } )
    } );

    super( new VBox( {
      align: 'left',
      children: [
        new RichText( semiMajorAxisStringProperty, combineOptions<TextOptions>( {
          visibleProperty: DerivedProperty.or( [ model.semiaxisVisibleProperty, model.eccentricityVisibleProperty ] )
        }, SolarSystemCommonConstants.TEXT_OPTIONS ) ),
        new RichText( semiMinorAxisStringProperty, combineOptions<TextOptions>( {
          visibleProperty: model.semiaxisVisibleProperty
        }, SolarSystemCommonConstants.TEXT_OPTIONS ) ),
        new RichText( focalDistanceStringProperty, combineOptions<TextOptions>( {
          visibleProperty: model.eccentricityVisibleProperty
        }, SolarSystemCommonConstants.TEXT_OPTIONS ) )
      ]
    } ), SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS );
  }
}

keplersLaws.register( 'FirstLawPanels', FirstLawPanels );