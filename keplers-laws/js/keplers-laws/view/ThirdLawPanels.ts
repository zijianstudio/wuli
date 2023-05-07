// Copyright 2023, University of Colorado Boulder

/**
 * Kepler's third law accordion box
 *
 * @author Agustín Vallejo
 */

import KeplersLawsModel from '../model/KeplersLawsModel.js';
import { GridBox, RichText, VBox } from '../../../../scenery/js/imports.js';
import { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import ThirdLawGraph from './ThirdLawGraph.js';
import ThirdLawSliderPanel from './ThirdLawSliderPanel.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import SolarSystemCommonColors from '../../../../solar-system-common/js/SolarSystemCommonColors.js';
import KeplersLawsStrings from '../../KeplersLawsStrings.js';
import keplersLaws from '../../keplersLaws.js';
import SolarSystemCommonStrings from '../../../../solar-system-common/js/SolarSystemCommonStrings.js';
import ThirdLawTextUtils from './ThirdLawTextUtils.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import KeplersLawsConstants from '../../KeplersLawsConstants.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';

type SelfOptions = EmptySelfOptions;
export type ThirdLawAccordionBoxOptions = AccordionBoxOptions & SelfOptions;

export default class ThirdLawPanels extends VBox {
  public constructor( model: KeplersLawsModel ) {
    super( {
      margin: 5,
      stretch: true,
      children: [
        new ThirdLawAccordionBox( model ),
        new ThirdLawSliderPanel( model )
      ],
      visibleProperty: model.isThirdLawProperty
    } );
  }
}

class ThirdLawAccordionBox extends AccordionBox {
  public constructor( model: KeplersLawsModel ) {
    const options = combineOptions<ThirdLawAccordionBoxOptions>( {
      titleNode: new RichText( new DerivedProperty( [
        KeplersLawsStrings.graph.titleStringProperty,
        model.selectedAxisPowerProperty,
        model.selectedPeriodPowerProperty
      ], ( stringPattern, axisPower, periodPower ) => {
        const axisString = axisPower === 1 ? '' : `<sup>${axisPower}</sup>`;
        const periodString = periodPower === 1 ? '' : `<sup>${periodPower}</sup>`;

        return StringUtils.fillIn( stringPattern, {
          axisPower: axisString,
          periodPower: periodString
        } );
      } ), SolarSystemCommonConstants.TITLE_OPTIONS ),
      titleYMargin: 10,
      buttonXMargin: 10,
      expandCollapseButtonOptions: {
        scale: 1.5
      },
      visibleProperty: model.isThirdLawProperty,
      fill: SolarSystemCommonColors.backgroundProperty,
      stroke: SolarSystemCommonColors.gridIconStrokeColorProperty,
      minWidth: KeplersLawsConstants.PANELS_MIN_WIDTH
    }, SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS );

    const semiMajorAxisPatternStringProperty = new PatternStringProperty( KeplersLawsStrings.pattern.textEqualsValueUnitsStringProperty, {
      text: ThirdLawTextUtils.createPowerStringProperty( KeplersLawsStrings.symbols.semiMajorAxisStringProperty, model.selectedAxisPowerProperty, new TinyProperty<boolean>( true ) ),
      units: ThirdLawTextUtils.createPowerStringProperty( SolarSystemCommonStrings.units.AUStringProperty, model.selectedAxisPowerProperty, model.engine.allowedOrbitProperty ),
      value: new DerivedProperty(
        [ model.poweredSemiMajorAxisProperty, model.engine.allowedOrbitProperty, KeplersLawsStrings.undefinedStringProperty ],
        ( poweredSemiMajorAxis, allowedOrbit, undefinedMessage ) => {
          return allowedOrbit ? Utils.toFixed( poweredSemiMajorAxis, 2 ) : undefinedMessage;
        }
      )
    } );

    const periodPatternStringProperty = new PatternStringProperty( KeplersLawsStrings.pattern.textEqualsValueUnitsStringProperty, {
      text: ThirdLawTextUtils.createPowerStringProperty( KeplersLawsStrings.symbols.periodStringProperty, model.selectedPeriodPowerProperty, new TinyProperty<boolean>( true ) ),
      units: ThirdLawTextUtils.createPowerStringProperty( SolarSystemCommonStrings.units.yearsStringProperty, model.selectedPeriodPowerProperty, model.engine.allowedOrbitProperty ),
      value: new DerivedProperty(
        [ model.poweredPeriodProperty, model.engine.allowedOrbitProperty, KeplersLawsStrings.undefinedStringProperty ],
        ( poweredPeriod, allowedOrbit, undefinedMessage ) => {
          return allowedOrbit ? Utils.toFixed( poweredPeriod, 2 ) : undefinedMessage;
        }
      )
    } );

    const semiMajorAxisNumberDisplay = new RichText( semiMajorAxisPatternStringProperty, SolarSystemCommonConstants.TEXT_OPTIONS );
    const periodNumberDisplay = new RichText( periodPatternStringProperty, SolarSystemCommonConstants.TEXT_OPTIONS );

    // TODO: Add string a=infinite. Look at FirstLawPanels.ts to be consistent. Should we change that way?

    super( new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new GridBox( {
          children: [
            // Period power buttons
            new RectangularRadioButtonGroup(
              model.selectedPeriodPowerProperty,
              [
                {
                  value: 1,
                  createNode: () => new RichText( KeplersLawsStrings.symbols.periodStringProperty, SolarSystemCommonConstants.TEXT_OPTIONS )
                },
                {
                  value: 2,
                  //REVIEW: And this should probably include string composition (e.g. combining the translated string for
                  //REVIEW: T with the superscript somehow?)
                  createNode: () => new RichText( 'T<sup>2</sup>', SolarSystemCommonConstants.TEXT_OPTIONS )
                },
                {
                  value: 3,
                  createNode: () => new RichText( 'T<sup>3</sup>', SolarSystemCommonConstants.TEXT_OPTIONS )
                }
              ],
              {
                layoutOptions: { column: 0, row: 0 }
              }
            ),
            // Semi-major axis power buttons
            new RectangularRadioButtonGroup(
              model.selectedAxisPowerProperty,
              [
                {
                  value: 1,
                  createNode: () => new RichText( KeplersLawsStrings.symbols.semiMajorAxisStringProperty, SolarSystemCommonConstants.TEXT_OPTIONS )
                },
                {
                  value: 2,
                  createNode: () => new RichText( 'a<sup>2</sup>', SolarSystemCommonConstants.TEXT_OPTIONS )
                },
                {
                  value: 3,
                  createNode: () => new RichText( 'a<sup>3</sup>', SolarSystemCommonConstants.TEXT_OPTIONS )
                }
              ],
              {
                layoutOptions: { column: 1, row: 1 },
                orientation: 'horizontal'
              }
            ),
            new ThirdLawGraph( model, model.engine, {
              layoutOptions: { column: 1, row: 0 },
              excludeInvisibleChildrenFromBounds: true
            } ),
            new EraserButton( {
              listener: () => model.engine.resetEmitter.emit(),
              layoutOptions: { column: 0, row: 1 }
            } )
          ],
          spacing: 10
        } ),
        semiMajorAxisNumberDisplay,
        periodNumberDisplay
      ]
    } ), options );
  }
}

keplersLaws.register( 'ThirdLawPanels', ThirdLawPanels );