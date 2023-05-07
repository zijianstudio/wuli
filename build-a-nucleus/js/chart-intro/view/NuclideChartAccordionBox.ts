// Copyright 2023, University of Colorado Boulder

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import buildANucleus from '../../buildANucleus.js';
import NuclideChartAndNumberLines from './NuclideChartAndNumberLines.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { Color, HBox, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import NuclideChartLegendNode from './NuclideChartLegendNode.js';
import { SelectedChartType } from '../model/ChartIntroModel.js';
import BANConstants from '../../common/BANConstants.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import Range from '../../../../dot/js/Range.js';
import FocusedNuclideChartNode from './FocusedNuclideChartNode.js';

/**
 * Node that holds Nuclide Chart and Zoom-in nuclide chart view.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

class NuclideChartAccordionBox extends AccordionBox {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      minWidth: number, selectedNuclideChartProperty: TReadOnlyProperty<SelectedChartType> ) {

    const getChartTransform = ( scaleFactor: number ) => new ChartTransform( {
      viewWidth: BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS * scaleFactor,
      modelXRange: new Range( BANConstants.DEFAULT_INITIAL_NEUTRON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_NEUTRONS ),
      viewHeight: BANConstants.CHART_MAX_NUMBER_OF_PROTONS * scaleFactor,
      modelYRange: new Range( BANConstants.DEFAULT_INITIAL_PROTON_COUNT, BANConstants.CHART_MAX_NUMBER_OF_PROTONS )
    } );

    const partialChartTransform = getChartTransform( 20 );
    const focusedChartTransform = getChartTransform( 10 );

    const nuclideChartAndNumberLines = new NuclideChartAndNumberLines( protonCountProperty, neutronCountProperty,
      partialChartTransform );

    const focusedNuclideChartNode = new FocusedNuclideChartNode( protonCountProperty, neutronCountProperty,
      focusedChartTransform );
    const nuclideChartLegendNode = new NuclideChartLegendNode();

    const zoomInChart = new Rectangle( 0, 0, 100, 100, {
      stroke: Color.BLACK,
      layoutOptions: {
        topMargin: 3
      }
    } );
    selectedNuclideChartProperty.link( selectedNuclideChart => {
      zoomInChart.visible = selectedNuclideChart === 'zoom';
      focusedNuclideChartNode.visible = selectedNuclideChart === 'zoom';
      nuclideChartAndNumberLines.visible = selectedNuclideChart === 'partial';
    } );

    const chartsHBox = new HBox( {
      children: [
        zoomInChart,
        nuclideChartAndNumberLines,
        focusedNuclideChartNode
      ],
      spacing: 10,
      align: 'top',
      excludeInvisibleChildrenFromBounds: true,
      minContentHeight: 270
    } );
    const contentVBox = new VBox( {
      children: [
        chartsHBox,
        nuclideChartLegendNode
      ],
      spacing: 10,
      excludeInvisibleChildrenFromBounds: true
    } );

    super( contentVBox, {
      titleNode: new Text( BuildANucleusStrings.partialNuclideChart, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 200
      } ),
      fill: Color.white,
      minWidth: minWidth,
      contentYSpacing: 0,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 18
      },
      titleAlignX: 'left',
      stroke: BANConstants.PANEL_STROKE,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    } );
  }
}

buildANucleus.register( 'NuclideChartAccordionBox', NuclideChartAccordionBox );
export default NuclideChartAccordionBox;