// Copyright 2013-2022, University of Colorado Boulder

/**
 * Graph with a logarithmic scale, for displaying concentration (mol/L) and quantity (moles).
 * Assumes that graphing concentration and quantity can be graphed on the same scale.
 * Origin is at the top-left of the scale rectangle.
 *
 * Some of the code related to indicators (initialization and updateIndicators) is similar
 * to LinearGraph. But it was difficult to identify a natural pattern for factoring
 * this out, so I chose to leave it as is. See issue #16.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import Property from '../../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import Utils from '../../../../../dot/js/Utils.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Font, Line, LinearGradient, Node, NodeOptions, NodeTranslationOptions, Rectangle, RichText, TColor } from '../../../../../scenery/js/imports.js';
import phScale from '../../../phScale.js';
import PHModel, { PHValue } from '../../model/PHModel.js';
import SolutionDerivedProperties from '../../model/SolutionDerivedProperties.js';
import PHScaleConstants from '../../PHScaleConstants.js';
import GraphIndicatorDragListener from './GraphIndicatorDragListener.js';
import GraphIndicatorNode from './GraphIndicatorNode.js';
import GraphUnits from './GraphUnits.js';
import GraphIndicatorKeyboardDragListener from './GraphIndicatorKeyboardDragListener.js';

type SelfOptions = {

  // For the 'Micro' screen, pHProperty is read-only.
  // For the 'My Solutions' screen, pHProperty is mutable.
  // The type of pHProperty determines whether the Logarithmic graph is interactive.
  pHProperty: TReadOnlyProperty<PHValue> | Property<number>;

  // scale
  scaleHeight?: number;
  minScaleWidth?: number;
  scaleYMargin?: number; // space above/below top/bottom tick marks
  scaleCornerRadius?: number;
  scaleStroke?: TColor;
  scaleLineWidth?: number;

  // major ticks
  majorTickFont?: Font;
  majorTickStroke?: TColor;
  majorTickLength?: number;
  majorTickLineWidth?: number;
  majorTickXSpacing?: number;

  // minor ticks
  minorTickStroke?: TColor;
  minorTickLength?: number;
  minorTickLineWidth?: number;

  // indicators
  indicatorXOffset?: number;
};

export type LogarithmicGraphNodeOptions = SelfOptions & NodeTranslationOptions & PickRequired<NodeOptions, 'tandem'>;

export default class LogarithmicGraphNode extends Node {

  public constructor( totalVolumeProperty: TReadOnlyProperty<number>,
                      derivedProperties: SolutionDerivedProperties,
                      graphUnitsProperty: EnumerationProperty<GraphUnits>,
                      providedOptions: LogarithmicGraphNodeOptions ) {

    const options = optionize<LogarithmicGraphNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      scaleHeight: 100,
      minScaleWidth: 100,
      scaleYMargin: 30,
      scaleCornerRadius: 20,
      scaleStroke: 'black',
      scaleLineWidth: 2,
      majorTickFont: new PhetFont( 22 ),
      majorTickStroke: 'black',
      majorTickLength: 15,
      majorTickLineWidth: 1,
      majorTickXSpacing: 5,
      minorTickStroke: 'black',
      minorTickLength: 7,
      minorTickLineWidth: 1,
      indicatorXOffset: 10,

      // NodeOptions
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    }, providedOptions );

    super();

    const isInteractive = options.pHProperty instanceof Property;

    // background for the scale, width sized to fit
    const widestTickLabel = createTickLabel( PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.min, options.majorTickFont );
    const scaleWidth = Math.max( options.minScaleWidth, widestTickLabel.width + ( 2 * options.majorTickXSpacing ) + ( 2 * options.majorTickLength ) );
    const backgroundNode = new Rectangle( 0, 0, scaleWidth, options.scaleHeight, options.scaleCornerRadius, options.scaleCornerRadius, {
      fill: new LinearGradient( 0, 0, 0, options.scaleHeight ).addColorStop( 0, 'rgb( 200, 200, 200 )' ).addColorStop( 1, 'white' ),
      stroke: options.scaleStroke,
      lineWidth: options.scaleLineWidth
    } );
    this.addChild( backgroundNode );

    // tick marks
    const numberOfTicks = PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.getLength() + 1;
    const ySpacing = ( options.scaleHeight - ( 2 * options.scaleYMargin ) ) / ( numberOfTicks - 1 ); // vertical space between ticks
    let exponent;
    let tickLabel;
    let tickLineLeft;
    let tickLineRight;
    for ( let i = 0; i < numberOfTicks; i++ ) {

      exponent = PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.max - i;

      // major ticks at even-numbered exponents
      if ( exponent % 2 === 0 ) {

        // major lines and label
        tickLineLeft = new Line( 0, 0, options.majorTickLength, 0, {
          stroke: options.majorTickStroke,
          lineWidth: options.majorTickLineWidth
        } );
        tickLineRight = new Line( 0, 0, options.majorTickLength, 0, {
          stroke: options.majorTickStroke,
          lineWidth: options.majorTickLineWidth
        } );
        tickLabel = createTickLabel( exponent, options.majorTickFont );

        // rendering order
        this.addChild( tickLineLeft );
        this.addChild( tickLineRight );
        this.addChild( tickLabel );

        // layout
        tickLineLeft.left = backgroundNode.left;
        tickLineLeft.centerY = options.scaleYMargin + ( i * ySpacing );
        tickLineRight.right = backgroundNode.right;
        tickLineRight.centerY = tickLineLeft.centerY;
        tickLabel.centerX = backgroundNode.centerX;
        tickLabel.centerY = tickLineLeft.centerY;
      }
      else {
        // minor lines
        tickLineLeft = new Line( 0, 0, options.minorTickLength, 0, {
          stroke: options.minorTickStroke,
          lineWidth: options.minorTickLineWidth
        } );
        tickLineRight = new Line( 0, 0, options.minorTickLength, 0, {
          stroke: options.minorTickStroke,
          lineWidth: options.minorTickLineWidth
        } );

        // rendering order
        this.addChild( tickLineLeft );
        this.addChild( tickLineRight );

        // layout
        tickLineLeft.left = backgroundNode.left;
        tickLineLeft.centerY = options.scaleYMargin + ( i * ySpacing );
        tickLineRight.right = backgroundNode.right;
        tickLineRight.centerY = tickLineLeft.centerY;
      }
    }

    // Values displayed on the indicators
    const valueH2OProperty = new DerivedProperty(
      [ derivedProperties.concentrationH2OProperty, derivedProperties.quantityH2OProperty, graphUnitsProperty ],
      ( concentration, quantity, graphUnits ) =>
        ( graphUnits === GraphUnits.MOLES_PER_LITER ) ? concentration : quantity
    );
    const valueH3OProperty = new DerivedProperty(
      [ derivedProperties.concentrationH3OProperty, derivedProperties.quantityH3OProperty, graphUnitsProperty ],
      ( concentration, quantity, graphUnits ) =>
        ( graphUnits === GraphUnits.MOLES_PER_LITER ) ? concentration : quantity
    );
    const valueOHProperty = new DerivedProperty(
      [ derivedProperties.concentrationOHProperty, derivedProperties.quantityOHProperty, graphUnitsProperty ],
      ( concentration, quantity, graphUnits ) =>
        ( graphUnits === GraphUnits.MOLES_PER_LITER ) ? concentration : quantity
    );

    // indicators
    const indicatorH2ONode = GraphIndicatorNode.createH2OIndicator( valueH2OProperty, {
      x: backgroundNode.right - options.indicatorXOffset,
      tandem: options.tandem.createTandem( 'indicatorH2ONode' )
    } );
    const indicatorH3ONode = GraphIndicatorNode.createH3OIndicator( valueH3OProperty, {
      x: backgroundNode.left + options.indicatorXOffset,
      isInteractive: isInteractive,
      tandem: options.tandem.createTandem( 'indicatorH3ONode' )
    } );
    const indicatorOHNode = GraphIndicatorNode.createOHIndicator( valueOHProperty, {
      x: backgroundNode.right - options.indicatorXOffset,
      isInteractive: isInteractive,
      tandem: options.tandem.createTandem( 'indicatorOHNode' )
    } );
    this.addChild( indicatorH2ONode );
    this.addChild( indicatorH3ONode );
    this.addChild( indicatorOHNode );

    /**
     * Given a value, compute it's y position relative to the top of the scale.
     */
    const valueToY = ( value: number | null ) => {
      if ( value === 0 || value === null ) {
        // below the bottom tick
        return options.scaleHeight - ( 0.5 * options.scaleYMargin );
      }
      else {
        // between the top and bottom tick
        const maxHeight = ( options.scaleHeight - 2 * options.scaleYMargin );
        const maxExponent = PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.max;
        const minExponent = PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.min;
        const valueExponent = Utils.log10( value );
        return options.scaleYMargin + maxHeight - ( maxHeight * ( valueExponent - minExponent ) / ( maxExponent - minExponent ) );
      }
    };

    // Given a y position relative to the top of the scale, compute a value.
    const yToValue = ( y: number ) => {
      const yOffset = y - options.scaleYMargin; // distance between indicator's origin and top tick mark
      const maxHeight = ( options.scaleHeight - 2 * options.scaleYMargin ); // distance between top and bottom tick marks
      const exponent = Utils.linear( 0, maxHeight, PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.max, PHScaleConstants.LOGARITHMIC_EXPONENT_RANGE.min, yOffset );
      return Math.pow( 10, exponent );
    };

    // Move the indicators
    Multilink.multilink( [ valueH2OProperty, graphUnitsProperty ],
      ( valueH2O, graphUnits ) => {
        indicatorH2ONode.y = valueToY( valueH2O );
      } );
    Multilink.multilink( [ valueH3OProperty, graphUnitsProperty ],
      ( valueH3O, graphUnits ) => {
        indicatorH3ONode.y = valueToY( valueH3O );
      } );
    Multilink.multilink( [ valueOHProperty, graphUnitsProperty ],
      ( valueOH, graphUnits ) => {
        indicatorOHNode.y = valueToY( valueOH );
      } );

    // Add drag handlers for H3O+ and OH-
    if ( isInteractive ) {
      const pHProperty = options.pHProperty as Property<number>;

      // H3O+ indicator
      indicatorH3ONode.cursor = 'pointer';
      indicatorH3ONode.addInputListener(
        new GraphIndicatorDragListener( indicatorH3ONode, pHProperty, totalVolumeProperty, graphUnitsProperty, yToValue,
          PHModel.concentrationH3OToPH, PHModel.molesH3OToPH,
          () => indicatorOHNode.interruptSubtreeInput(), // dragging is mutually exclusive, see https://github.com/phetsims/ph-scale/issues/261
          indicatorH3ONode.tandem.createTandem( 'dragListener' )
        ) );
      indicatorH3ONode.addInputListener(
        new GraphIndicatorKeyboardDragListener( indicatorH3ONode, pHProperty, totalVolumeProperty, graphUnitsProperty, yToValue,
          PHModel.concentrationH3OToPH, PHModel.molesH3OToPH, indicatorH3ONode.tandem.createTandem( 'keyboardDragListener' )
        ) );

      // OH- indicator
      indicatorOHNode.cursor = 'pointer';
      indicatorOHNode.addInputListener(
        new GraphIndicatorDragListener( indicatorOHNode, pHProperty, totalVolumeProperty, graphUnitsProperty, yToValue,
          PHModel.concentrationOHToPH, PHModel.molesOHToPH,
          () => indicatorH3ONode.interruptSubtreeInput(), // dragging is mutually exclusive, see https://github.com/phetsims/ph-scale/issues/261
          indicatorOHNode.tandem.createTandem( 'dragListener' )
        ) );
      indicatorOHNode.addInputListener(
        new GraphIndicatorKeyboardDragListener( indicatorOHNode, pHProperty, totalVolumeProperty, graphUnitsProperty, yToValue,
          PHModel.concentrationOHToPH, PHModel.molesOHToPH,
          indicatorOHNode.tandem.createTandem( 'keyboardDragListener' )
        ) );

      // keyboard traversal order, see https://github.com/phetsims/ph-scale/issues/249
      this.pdomOrder = [
        indicatorH3ONode,
        indicatorOHNode
      ];
    }

    this.mutate( options );
  }
}

/**
 * Creates a tick label, '10' to some exponent.
 */
function createTickLabel( exponent: number, font: Font ): Node {
  return new RichText( `10<sup>${exponent}</sup>`, {
    font: font,
    fill: 'black'
  } );
}

phScale.register( 'LogarithmicGraphNode', LogarithmicGraphNode );