// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that contains some content in the 'Nuclide Chart', including the proton and neutron NucleonNumberLine's,
 * and the NuclideChartNode.
 *
 * @author Luisa Vargas
 */

import { Node, NodeOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../../common/BANColors.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import NucleonNumberLine from './NucleonNumberLine.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import NuclideChartNode from './NuclideChartNode.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';

type NuclideChartNodeOptions = NodeOptions;

class NuclideChartAndNumberLines extends Node {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, neutronCountProperty: TReadOnlyProperty<number>,
                      chartTransform: ChartTransform, providedOptions?: NuclideChartNodeOptions ) {

    // create and add the nuclideChartNode
    const nuclideChartNode = new NuclideChartNode( protonCountProperty, neutronCountProperty, chartTransform, {
      cellTextFontSize: 14,
      arrowSymbol: true
    } );

    const protonNumberLine = new NucleonNumberLine( chartTransform, protonCountProperty, Orientation.VERTICAL, {
      labelHighlightColorProperty: BANColors.protonColorProperty,
      axisLabel: BuildANucleusStrings.axis.protonNumber
    } );

    const neutronNumberLine = new NucleonNumberLine( chartTransform, neutronCountProperty, Orientation.HORIZONTAL, {
      labelHighlightColorProperty: BANColors.neutronColorProperty,
      axisLabel: BuildANucleusStrings.axis.neutronNumber
    } );
    neutronNumberLine.top = protonNumberLine.bottom;
    neutronNumberLine.left = protonNumberLine.right;
    nuclideChartNode.left = neutronNumberLine.left;

    super( { ...providedOptions, excludeInvisibleChildrenFromBounds: true, children:
        [ nuclideChartNode, protonNumberLine, neutronNumberLine ] } );
  }
}

buildANucleus.register( 'NuclideChartAndNumberLines', NuclideChartAndNumberLines );
export default NuclideChartAndNumberLines;