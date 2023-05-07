// Copyright 2019-2022, University of Colorado Boulder

/**
 * Colors for the density/buoyancy simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';

const tandem = Tandem.GLOBAL_VIEW.createTandem( 'colorProfile' );

// Initial colors for each profile, by string key. Only profile currently is default (still helpful for making color
// tweaks with the top-level files)
const DensityBuoyancyCommonColors = {
  // Color recommended in https://github.com/phetsims/density/issues/6#issuecomment-600911868
  panelBackgroundProperty: new ProfileColorProperty( densityBuoyancyCommon, 'panelBackground', {
    default: new Color( 240, 240, 240 )
  } ),

  skyBottomProperty: new ProfileColorProperty( densityBuoyancyCommon, 'skyBottom', {
    default: new Color( 255, 255, 255 )
  } ),
  skyTopProperty: new ProfileColorProperty( densityBuoyancyCommon, 'skyTop', {
    default: new Color( 19, 165, 224 )
  } ),
  groundProperty: new ProfileColorProperty( densityBuoyancyCommon, 'ground', {
    default: new Color( 161, 101, 47 )
  } ),
  grassCloseProperty: new ProfileColorProperty( densityBuoyancyCommon, 'grassClose', {
    default: new Color( 107, 165, 75 )
  } ),
  grassFarProperty: new ProfileColorProperty( densityBuoyancyCommon, 'grassFar', {
    default: new Color( 107, 165, 75 ).colorUtilsDarker( 0.7 )
  } ),
  poolSurfaceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'poolSurface', {
    default: new Color( 170, 170, 170 )
  } ),

  waterIndicatorHighlightProperty: new ProfileColorProperty( densityBuoyancyCommon, 'waterIndicatorHighlight', {
    default: new Color( 255, 0, 0 )
  } ),

  contactForceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'contactForce', {
    default: new Color( 234, 150, 62 )
  } ),
  gravityForceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'gravityForce', {
    default: PhetColorScheme.GRAVITATIONAL_FORCE
  } ),
  buoyancyForceProperty: new ProfileColorProperty( densityBuoyancyCommon, 'buoyancyForce', {
    default: new Color( 218, 51, 138 )
  } ),

  massLabelBackgroundProperty: new ProfileColorProperty( densityBuoyancyCommon, 'massLabelBackground', {
    default: Color.WHITE
  } ),

  labelAProperty: new ProfileColorProperty( densityBuoyancyCommon, 'labelA', {
    default: new Color( 237, 55, 50 )
  } ),
  labelBProperty: new ProfileColorProperty( densityBuoyancyCommon, 'labelB', {
    default: new Color( 48, 89, 166 )
  } ),

  compareYellowColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareYellow', {
    default: new Color( 252, 246, 80 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'compareYellowColorProperty' )
  } ),
  compareBlueColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareBlue', {
    default: new Color( 46, 88, 166 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'compareBlueColorProperty' )
  } ),
  compareGreenColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareGreen', {
    default: new Color( 125, 195, 52 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'compareGreenColorProperty' )
  } ),
  compareRedColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'compareRed', {
    default: new Color( 233, 55, 50 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'compareRedColorProperty' )
  } ),
  comparePurpleColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'comparePurple', {
    default: new Color( 131, 43, 126 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'comparePurpleColorProperty' )
  } ),

  mysteryPinkColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryPink', {
    default: new Color( 255, 192, 203 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryPinkColorProperty' )
  } ),
  mysteryOrangeColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryOrange', {
    default: new Color( 255, 127, 0 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryOrangeColorProperty' )
  } ),
  mysteryLightPurpleColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryLightPurple', {
    default: new Color( 177, 156, 217 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryLightPurpleColorProperty' )
  } ),
  mysteryLightGreenColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryLightGreen', {
    default: new Color( 144, 238, 144 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryLightGreenColorProperty' )
  } ),
  mysteryBrownColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryBrown', {
    default: new Color( 150, 75, 0 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryBrownColorProperty' )
  } ),
  mysteryWhiteColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryWhite', {
    default: new Color( 255, 255, 255 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryWhiteColorProperty' )
  } ),
  mysteryGrayColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryGray', {
    default: new Color( 140, 140, 140 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryGrayColorProperty' )
  } ),
  mysteryMustardColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryMustard', {
    default: new Color( 225, 173, 0 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryMustardColorProperty' )
  } ),
  mysteryPeachColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryPeach', {
    default: new Color( 255, 229, 180 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryPeachColorProperty' )
  } ),
  mysteryMaroonColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'mysteryMaroon', {
    default: new Color( 128, 0, 0 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'mysteryMaroonColorProperty' )
  } ),

  chartHeaderColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'chartHeader', {
    default: new Color( 230, 230, 230 )
  } ),

  radioBorderColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'radioBorder', {
    default: PhetColorScheme.BUTTON_YELLOW
  } ),
  radioBackgroundColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'radioBackground', {
    default: Color.WHITE
  } ),

  // "liquid" material colors
  materialAirColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialAir', {
    default: new Color( 0, 0, 0, 0 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialAirColorProperty' )
  } ),
  materialCementColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialCement', {
    default: new Color( 128, 130, 133 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialCementColorProperty' )
  } ),
  materialCopperColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialCopper', {
    default: new Color( 184, 115, 51 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialCopperColorProperty' )
  } ),
  materialDensityAColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityA', {
    default: new Color( 255, 255, 80, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityAColorProperty' )
  } ),
  materialDensityBColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityB', {
    default: new Color( 80, 255, 255, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityBColorProperty' )
  } ),
  materialDensityCColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityC', {
    default: new Color( 255, 128, 255, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityCColorProperty' )
  } ),
  materialDensityDColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityD', {
    default: new Color( 128, 255, 255, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityDColorProperty' )
  } ),
  materialDensityEColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityE', {
    default: new Color( 255, 128, 128, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityEColorProperty' )
  } ),
  materialDensityFColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialDensityF', {
    default: new Color( 128, 255, 128, 0.6 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialDensityFColorProperty' )
  } ),
  materialGasolineColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialGasoline', {
    default: new Color( 230, 255, 0, 0.4 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialGasolineColorProperty' )
  } ),
  materialHoneyColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialHoney', {
    default: new Color( 238, 170, 0, 0.65 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialHoneyColorProperty' )
  } ),
  materialLeadColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialLead', {
    default: new Color( 80, 85, 90 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialLeadColorProperty' )
  } ),
  materialMercuryColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialMercury', {
    default: new Color( 219, 206, 202, 0.8 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialMercuryColorProperty' )
  } ),
  materialOilColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialOil', {
    default: new Color( 180, 230, 20, 0.4 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialOilColorProperty' )
  } ),
  materialSandColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialSand', {
    default: new Color( 194, 178, 128 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialSandColorProperty' )
  } ),
  materialSeawaterColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialSeawater', {
    default: new Color( 0, 150, 255, 0.4 )
  }, {
    phetioReadOnly: true,
    tandem: phet.chipper.packageObject.name === 'density' ? Tandem.OPT_OUT : tandem.createTandem( 'materialSeawaterColorProperty' )
  } ),
  materialWaterColorProperty: new ProfileColorProperty( densityBuoyancyCommon, 'materialWater', {
    default: new Color( 0, 128, 255, 0.4 )
  }, {
    phetioReadOnly: true,
    tandem: tandem.createTandem( 'materialWaterColorProperty' )
  } )
};

densityBuoyancyCommon.register( 'DensityBuoyancyCommonColors', DensityBuoyancyCommonColors );

export default DensityBuoyancyCommonColors;