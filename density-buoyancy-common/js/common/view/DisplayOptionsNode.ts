// Copyright 2019-2022, University of Colorado Boulder

/**
 * Panel content for showing/hiding various arrows/readouts.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ArrowNode, { ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import { FlowBox, GridBox, Text, TextOptions, VBox, VBoxOptions, HSeparator } from '../../../../scenery/js/imports.js';
import Checkbox, { CheckboxOptions } from '../../../../sun/js/Checkbox.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import DensityBuoyancyModel from '../model/DensityBuoyancyModel.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// constants
const arrowSpacing = 15;
const maxWidth = 200;
const arrowLength = 60;
const arrowOptions = {
  stroke: null,
  headWidth: 15,
  headHeight: 15,
  tailWidth: 4
};
const labelOptions = {
  font: new PhetFont( 14 ),
  maxWidth: maxWidth
};
const checkboxOptions = {
  boxWidth: 17
};
const checkboxSpacing = 5;

export default class DisplayOptionsNode extends VBox {
  public constructor( model: DensityBuoyancyModel, options?: VBoxOptions ) {

    super( combineOptions<VBoxOptions>( {
      spacing: 10,
      align: 'left',
      children: [
        new Text( DensityBuoyancyCommonStrings.forcesStringProperty, {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: maxWidth
        } ),
        new FlowBox( {
          orientation: 'vertical',
          spacing: 8,
          align: 'left',
          children: [
            new GridBox( {
              xSpacing: arrowSpacing,
              ySpacing: 10,
              xAlign: 'left',
              children: [

                // Gravity
                new Checkbox( model.showGravityForceProperty, new Text( DensityBuoyancyCommonStrings.gravity.nameStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  layoutOptions: { column: 0, row: 0 }
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, combineOptions<ArrowNodeOptions>( {
                  layoutOptions: { column: 1, row: 0 },
                  fill: DensityBuoyancyCommonColors.gravityForceProperty
                }, arrowOptions ) ),

                // Buoyancy
                new Checkbox( model.showBuoyancyForceProperty, new Text( DensityBuoyancyCommonStrings.buoyancyStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  layoutOptions: { column: 0, row: 1 }
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, combineOptions<ArrowNodeOptions>( {
                  layoutOptions: { column: 1, row: 1 },
                  fill: DensityBuoyancyCommonColors.buoyancyForceProperty
                }, arrowOptions ) ),

                // Contact
                new Checkbox( model.showContactForceProperty, new Text( DensityBuoyancyCommonStrings.contactStringProperty, labelOptions ), combineOptions<CheckboxOptions>( {
                  layoutOptions: { column: 0, row: 2 }
                }, checkboxOptions ) ),
                new ArrowNode( 0, 0, arrowLength, 0, combineOptions<ArrowNodeOptions>( {
                  layoutOptions: { column: 1, row: 2 },
                  fill: DensityBuoyancyCommonColors.contactForceProperty
                }, arrowOptions ) ),

                // Vector scale
                new Text( DensityBuoyancyCommonStrings.vectorScaleStringProperty, combineOptions<TextOptions>( {
                  layoutOptions: { column: 0, row: 3 }
                }, labelOptions ) ),
                new PlusMinusZoomButtonGroup( model.forceScaleProperty, {
                  layoutOptions: { column: 1, row: 3, xAlign: 'center' },
                  orientation: 'horizontal',
                  applyZoomIn: ( scale: number ) => scale * 2,
                  applyZoomOut: ( scale: number ) => scale / 2
                } )
              ]
            } ),
            new HSeparator(),
            new VBox( {
              spacing: checkboxSpacing,
              align: 'left',
              children: [
                new Checkbox( model.showMassesProperty, new Text( DensityBuoyancyCommonStrings.massesStringProperty, labelOptions ), checkboxOptions ),
                new Checkbox( model.showForceValuesProperty, new Text( DensityBuoyancyCommonStrings.forceValuesStringProperty, labelOptions ), checkboxOptions )
              ]
            } )
          ]
        } )
      ]
    }, options ) );
  }
}

densityBuoyancyCommon.register( 'DisplayOptionsNode', DisplayOptionsNode );
