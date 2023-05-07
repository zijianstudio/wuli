// Copyright 2020-2022, University of Colorado Boulder

/**
 * LinearZoomButtonGroup is the group of zoom button for the 'Linear' graph.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Range from '../../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';
import MagnifyingGlassZoomButtonGroup, { MagnifyingGlassZoomButtonGroupOptions } from '../../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import { NodeTranslationOptions } from '../../../../../scenery/js/imports.js';
import phScale from '../../../phScale.js';

type SelfOptions = EmptySelfOptions;

type LinearZoomButtonGroupOptions = SelfOptions & NodeTranslationOptions &
  PickRequired<MagnifyingGlassZoomButtonGroupOptions, 'tandem'>;

export default class LinearZoomButtonGroup extends MagnifyingGlassZoomButtonGroup {

  public constructor( exponentProperty: NumberProperty, providedOptions: LinearZoomButtonGroupOptions ) {

    const options = optionize<LinearZoomButtonGroupOptions, SelfOptions, MagnifyingGlassZoomButtonGroupOptions>()( {

      // MagnifyingGlassZoomButtonGroupOptions
      spacing: 25,
      magnifyingGlassNodeOptions: {
        glassRadius: 13
      }
    }, providedOptions );

    const range = exponentProperty.range;
    assert && assert( range, 'exponentProperty must have range' );

    // For exponent, a smaller value means 'more zoomed in'.
    // For MagnifyingGlassZoomButtonGroup and zoomLevelProperty, a smaller value means 'more zoomed out'.
    // So this is a two-way conversion between exponent and zoom level, accomplished by inverting the sign.
    // We can't use DynamicProperty here because MagnifyingGlassZoomButtonGroup require a NumberProperty.
    const zoomLevelProperty = new NumberProperty( -exponentProperty.value, {
      numberType: 'Integer',
      range: new Range( -range.max, -range.min )
    } );
    zoomLevelProperty.link( zoomLevel => { exponentProperty.value = -zoomLevel; } );
    exponentProperty.link( exponent => { zoomLevelProperty.value = -exponent; } );

    super( zoomLevelProperty, options );
  }
}

phScale.register( 'LinearZoomButtonGroup', LinearZoomButtonGroup );