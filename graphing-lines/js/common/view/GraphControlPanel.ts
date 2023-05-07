// Copyright 2013-2023, University of Colorado Boulder

/**
 * Control panel for various features related to the graph.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import GridCheckbox from '../../../../scenery-phet/js/GridCheckbox.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import GLColors from '../GLColors.js';
import GLSymbols from '../GLSymbols.js';
import Line from '../model/Line.js';
import GLIconFactory from './GLIconFactory.js';

// constants
// y = x
const Y_EQUALS_X = `${GLSymbols.y} ${MathSymbols.EQUAL_TO} ${GLSymbols.x}`;
// y = -x
const Y_EQUALS_NEGATIVE_X = `${GLSymbols.y} ${MathSymbols.EQUAL_TO} ${MathSymbols.UNARY_MINUS}${GLSymbols.x}`;

type SelfOptions = {
  includeStandardLines?: boolean; // if true, includes visibility controls for 'y = x' and 'y = -x'
};

type GraphControlPanelOptions = SelfOptions;

export default class GraphControlPanel extends Panel {

  /**
   * @param gridVisibleProperty - is grid visible on the graph?
   * @param slopeToolVisibleProperty - is the slope tool visible on the graphed interactive line?
   * @param standardLines - standard lines (y = x, y = -x) that are available for viewing
   * @param [providedOptions]
   */
  public constructor( gridVisibleProperty: Property<boolean>, slopeToolVisibleProperty: Property<boolean>,
                      standardLines: ObservableArray<Line>, providedOptions?: GraphControlPanelOptions ) {

    const options = optionize<GraphControlPanelOptions, SelfOptions, PanelOptions>()( {

      // SelfOptions
      includeStandardLines: true,

      // PanelOptions
      fill: GLColors.CONTROL_PANEL_BACKGROUND,
      stroke: 'black',
      lineWidth: 1,
      xMargin: 20,
      yMargin: 15,
      cornerRadius: 10,
      maxWidth: 400 // determined empirically
    }, providedOptions );

    // private properties for standard-line checkboxes
    const yEqualsXVisibleProperty = new BooleanProperty( standardLines.includes( Line.Y_EQUALS_X_LINE ) );
    const yEqualsNegativeXVisibleProperty = new BooleanProperty( standardLines.includes( Line.Y_EQUALS_NEGATIVE_X_LINE ) );

    // checkboxes
    const TEXT_OPTIONS = {
      font: new PhetFont( 18 ),
      maxWidth: 150 // determined empirically
    };
    const ICON_SIZE = 60;
    const ICON_SPACING = 15;

    // 'Slope' checkbox
    const slopeCheckbox = new Checkbox( slopeToolVisibleProperty, new HBox( {
      spacing: ICON_SPACING,
      children: [
        new Text( GraphingLinesStrings.slope, TEXT_OPTIONS ),
        GLIconFactory.createSlopeToolIcon( ICON_SIZE )
      ]
    } ) );

    // 'y = x' checkbox
    const yEqualsXCheckbox = new Checkbox( yEqualsXVisibleProperty, new HBox( {
      spacing: ICON_SPACING,
      children: [
        new RichText( Y_EQUALS_X, TEXT_OPTIONS ),
        GLIconFactory.createGraphIcon( ICON_SIZE, GLColors.Y_EQUALS_X, -3, -3, 3, 3 )
      ]
    } ) );

    // 'y = -x' checkbox
    const yEqualsNegativeXCheckbox = new Checkbox( yEqualsNegativeXVisibleProperty, new HBox( {
      spacing: ICON_SPACING,
      children: [
        new RichText( Y_EQUALS_NEGATIVE_X, TEXT_OPTIONS ),
        GLIconFactory.createGraphIcon( ICON_SIZE, GLColors.Y_EQUALS_NEGATIVE_X, -3, 3, 3, -3 )
      ]
    } ) );

    // Grid checkbox
    const gridCheckbox = new GridCheckbox( gridVisibleProperty, {
      spacing: 10
    } );
    gridCheckbox.touchArea = gridCheckbox.localBounds.dilatedXY( 15, 10 );

    // vertical layout
    const contentNode = new VBox( {
      children: ( options.includeStandardLines ) ?
        [ slopeCheckbox, yEqualsXCheckbox, yEqualsNegativeXCheckbox, gridCheckbox ] :
        [ slopeCheckbox, gridCheckbox ],
      spacing: 20,
      align: 'left'
    } );

    super( contentNode, options );

    const setStandardLineVisible = ( visible: boolean, line: Line ) => {
      if ( visible && !standardLines.includes( line ) ) {
        standardLines.add( line );
      }
      else if ( !visible && standardLines.includes( line ) ) {
        standardLines.remove( line );
      }
    };

    // Add/remove standard line 'y = x'
    // unlink is unnecessary since GraphControlPanel exists for the lifetime of the sim.
    yEqualsXVisibleProperty.link( visible => {
      setStandardLineVisible( visible, Line.Y_EQUALS_X_LINE );
    } );

    // Add/remove standard line 'y = -x'
    // unlink is unnecessary since GraphControlPanel exists for the lifetime of the sim.
    yEqualsNegativeXVisibleProperty.link( visible => {
      setStandardLineVisible( visible, Line.Y_EQUALS_NEGATIVE_X_LINE );
    } );

    // Select appropriate checkboxes when standard lines are added.
    // removeItemAddedListener is unnecessary since GraphControlPanel exists for the lifetime of the sim.
    standardLines.addItemAddedListener( line => {
      if ( line === Line.Y_EQUALS_X_LINE ) {
        yEqualsXVisibleProperty.value = true;
      }
      else if ( line === Line.Y_EQUALS_NEGATIVE_X_LINE ) {
        yEqualsNegativeXVisibleProperty.value = true;
      }
    } );

    // Deselect appropriate checkboxes when standard lines are removed.
    // removeItemRemovedListener is unnecessary since GraphControlPanel exists for the lifetime of the sim.
    standardLines.addItemRemovedListener( line => {
      if ( line === Line.Y_EQUALS_X_LINE ) {
        yEqualsXVisibleProperty.value = false;
      }
      else if ( line === Line.Y_EQUALS_NEGATIVE_X_LINE ) {
        yEqualsNegativeXVisibleProperty.value = false;
      }
    } );
  }
}

graphingLines.register( 'GraphControlPanel', GraphControlPanel );