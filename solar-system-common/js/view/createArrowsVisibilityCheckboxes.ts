// Copyright 2023, University of Colorado Boulder


/**
 * Visual representation of velocity and gravity arrows checkbox.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { HBox, HBoxOptions, Text, TextOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonCheckbox from './SolarSystemCommonCheckbox.js';
import SolarSystemCommonModel from '../model/SolarSystemCommonModel.js';
import solarSystemCommon from '../solarSystemCommon.js';

// constants
const ARROW_Y_COORDINATE = -10;

const TEXT_OPTIONS = combineOptions<TextOptions>( {
  maxWidth: SolarSystemCommonConstants.TEXT_MAX_WIDTH
}, SolarSystemCommonConstants.TEXT_OPTIONS );

const SPACING = 10;

const createArrowsVisibilityCheckboxes = ( model: SolarSystemCommonModel, tandem: Tandem ): SolarSystemCommonCheckbox[] => {
  return [
    // speed checkbox
    new SolarSystemCommonCheckbox( model.valuesVisibleProperty, new Text( SolarSystemCommonStrings.speedStringProperty, TEXT_OPTIONS ), {
      accessibleName: SolarSystemCommonStrings.speedStringProperty,
      tandem: tandem.createTandem( 'valuesVisibleCheckbox' )
    } ),
    // velocity checkbox
    new SolarSystemCommonCheckbox( model.velocityVisibleProperty, new HBox( combineOptions<HBoxOptions>( {
      children: [
        new Text( SolarSystemCommonStrings.velocityStringProperty, TEXT_OPTIONS ),
        new ArrowNode( 95, ARROW_Y_COORDINATE, 140, ARROW_Y_COORDINATE, { fill: PhetColorScheme.VELOCITY } )
      ]
    }, {
      spacing: SPACING
    } ) ), {
      accessibleName: SolarSystemCommonStrings.velocityStringProperty,
      tandem: tandem.createTandem( 'velocityCheckbox' )
    } ),
    // gravity force checkbox
    new SolarSystemCommonCheckbox( model.gravityVisibleProperty, new HBox( combineOptions<HBoxOptions>( {
      children: [
        new Text( SolarSystemCommonStrings.gravityForceStringProperty, TEXT_OPTIONS ),
        new ArrowNode( 135, ARROW_Y_COORDINATE, 180, ARROW_Y_COORDINATE, { fill: PhetColorScheme.GRAVITATIONAL_FORCE } )
      ]
    }, {
      spacing: SPACING
    } ) ), {
      accessibleName: SolarSystemCommonStrings.gravityForceStringProperty,
      tandem: tandem.createTandem( 'gravityForceCheckbox' )
    } )
  ];
};

solarSystemCommon.register( 'createArrowsVisibilityCheckboxes', createArrowsVisibilityCheckboxes );
export default createArrowsVisibilityCheckboxes;