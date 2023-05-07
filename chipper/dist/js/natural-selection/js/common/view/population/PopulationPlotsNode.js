// Copyright 2020-2022, University of Colorado Boulder

/**
 * PopulationPlotsNode is the complete set of plots for the Population graph, clipped to the graph's grid.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../../phet-core/js/optionize.js';
import { Node } from '../../../../../scenery/js/imports.js';
import naturalSelection from '../../../naturalSelection.js';
import NaturalSelectionColors from '../../NaturalSelectionColors.js';
import NaturalSelectionConstants from '../../NaturalSelectionConstants.js';
import PopulationPlotNode from './PopulationPlotNode.js';
export default class PopulationPlotsNode extends Node {
  constructor(populationModel, providedOptions) {
    const options = optionize()({
      // SelfOptions
      gridWidth: 100,
      gridHeight: 100
    }, providedOptions);

    // Clipped to the graph, but dilated to mitigate clipping of points and line segments at the edges of the grid.
    // Points (but not line segments) that fall at yMax (in model coordinates) will be slightly clipped as a compromise
    // for improved clipping performance. See https://github.com/phetsims/natural-selection/issues/159
    assert && assert(!options.clipArea, 'PopulationPlotsNode sets clipArea');
    options.clipArea = Shape.bounds(new Bounds2(-NaturalSelectionConstants.POPULATION_POINT_RADIUS, -NaturalSelectionConstants.POPULATION_LINE_WIDTH / 2, options.gridWidth + NaturalSelectionConstants.POPULATION_POINT_RADIUS, options.gridHeight + NaturalSelectionConstants.POPULATION_POINT_RADIUS));

    // Config common to all PopulationPlotNode instances
    const plotNodeConfig = {
      gridWidth: options.gridWidth,
      gridHeight: options.gridHeight,
      xAxisLength: populationModel.xAxisLength,
      xRangeProperty: populationModel.xRangeProperty,
      yRangeProperty: populationModel.yRangeProperty,
      timeInGenerationsProperty: populationModel.timeInGenerationsProperty
    };
    const totalPlotNode = new PopulationPlotNode(combineOptions({}, plotNodeConfig, {
      points: populationModel.totalPoints,
      plotVisibleProperty: populationModel.totalVisibleProperty,
      color: NaturalSelectionColors.POPULATION_TOTAL_COUNT
    }));
    const whiteFurPlotNode = new PopulationPlotNode(combineOptions({}, plotNodeConfig, {
      points: populationModel.whiteFurPoints,
      plotVisibleProperty: populationModel.whiteFurVisibleProperty,
      color: NaturalSelectionColors.FUR
    }));
    const brownFurPlotNode = new PopulationPlotNode(combineOptions({}, plotNodeConfig, {
      points: populationModel.brownFurPoints,
      plotVisibleProperty: populationModel.brownFurVisibleProperty,
      color: NaturalSelectionColors.FUR,
      isMutant: true
    }));
    const straightEarsPlotNode = new PopulationPlotNode(combineOptions({}, plotNodeConfig, {
      points: populationModel.straightEarsPoints,
      plotVisibleProperty: populationModel.straightEarsVisibleProperty,
      color: NaturalSelectionColors.EARS
    }));
    const floppyEarsPlotNode = new PopulationPlotNode(combineOptions({}, plotNodeConfig, {
      points: populationModel.floppyEarsPoints,
      plotVisibleProperty: populationModel.floppyEarsVisibleProperty,
      color: NaturalSelectionColors.EARS,
      isMutant: true
    }));
    const shortTeethPlotNode = new PopulationPlotNode(combineOptions({}, plotNodeConfig, {
      points: populationModel.shortTeethPoints,
      plotVisibleProperty: populationModel.shortTeethVisibleProperty,
      color: NaturalSelectionColors.TEETH
    }));
    const longTeethProbeNode = new PopulationPlotNode(combineOptions({}, plotNodeConfig, {
      points: populationModel.longTeethPoints,
      plotVisibleProperty: populationModel.longTeethVisibleProperty,
      color: NaturalSelectionColors.TEETH,
      isMutant: true
    }));

    // Front-to-back rendering order should match top-to-bottom order of checkboxes in PopulationPanel
    assert && assert(!options.children, 'PopulationPlotsNode sets children');
    options.children = [longTeethProbeNode, shortTeethPlotNode, floppyEarsPlotNode, straightEarsPlotNode, brownFurPlotNode, whiteFurPlotNode, totalPlotNode];
    super(options);
  }
}
naturalSelection.register('PopulationPlotsNode', PopulationPlotsNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU2hhcGUiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIk5vZGUiLCJuYXR1cmFsU2VsZWN0aW9uIiwiTmF0dXJhbFNlbGVjdGlvbkNvbG9ycyIsIk5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMiLCJQb3B1bGF0aW9uUGxvdE5vZGUiLCJQb3B1bGF0aW9uUGxvdHNOb2RlIiwiY29uc3RydWN0b3IiLCJwb3B1bGF0aW9uTW9kZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZ3JpZFdpZHRoIiwiZ3JpZEhlaWdodCIsImFzc2VydCIsImNsaXBBcmVhIiwiYm91bmRzIiwiUE9QVUxBVElPTl9QT0lOVF9SQURJVVMiLCJQT1BVTEFUSU9OX0xJTkVfV0lEVEgiLCJwbG90Tm9kZUNvbmZpZyIsInhBeGlzTGVuZ3RoIiwieFJhbmdlUHJvcGVydHkiLCJ5UmFuZ2VQcm9wZXJ0eSIsInRpbWVJbkdlbmVyYXRpb25zUHJvcGVydHkiLCJ0b3RhbFBsb3ROb2RlIiwicG9pbnRzIiwidG90YWxQb2ludHMiLCJwbG90VmlzaWJsZVByb3BlcnR5IiwidG90YWxWaXNpYmxlUHJvcGVydHkiLCJjb2xvciIsIlBPUFVMQVRJT05fVE9UQUxfQ09VTlQiLCJ3aGl0ZUZ1clBsb3ROb2RlIiwid2hpdGVGdXJQb2ludHMiLCJ3aGl0ZUZ1clZpc2libGVQcm9wZXJ0eSIsIkZVUiIsImJyb3duRnVyUGxvdE5vZGUiLCJicm93bkZ1clBvaW50cyIsImJyb3duRnVyVmlzaWJsZVByb3BlcnR5IiwiaXNNdXRhbnQiLCJzdHJhaWdodEVhcnNQbG90Tm9kZSIsInN0cmFpZ2h0RWFyc1BvaW50cyIsInN0cmFpZ2h0RWFyc1Zpc2libGVQcm9wZXJ0eSIsIkVBUlMiLCJmbG9wcHlFYXJzUGxvdE5vZGUiLCJmbG9wcHlFYXJzUG9pbnRzIiwiZmxvcHB5RWFyc1Zpc2libGVQcm9wZXJ0eSIsInNob3J0VGVldGhQbG90Tm9kZSIsInNob3J0VGVldGhQb2ludHMiLCJzaG9ydFRlZXRoVmlzaWJsZVByb3BlcnR5IiwiVEVFVEgiLCJsb25nVGVldGhQcm9iZU5vZGUiLCJsb25nVGVldGhQb2ludHMiLCJsb25nVGVldGhWaXNpYmxlUHJvcGVydHkiLCJjaGlsZHJlbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9wdWxhdGlvblBsb3RzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQb3B1bGF0aW9uUGxvdHNOb2RlIGlzIHRoZSBjb21wbGV0ZSBzZXQgb2YgcGxvdHMgZm9yIHRoZSBQb3B1bGF0aW9uIGdyYXBoLCBjbGlwcGVkIHRvIHRoZSBncmFwaCdzIGdyaWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuaW1wb3J0IFBvcHVsYXRpb25Nb2RlbCBmcm9tICcuLi8uLi9tb2RlbC9Qb3B1bGF0aW9uTW9kZWwuanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvbkNvbG9ycyBmcm9tICcuLi8uLi9OYXR1cmFsU2VsZWN0aW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IE5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQb3B1bGF0aW9uUGxvdE5vZGUsIHsgUG9wdWxhdGlvblBsb3ROb2RlT3B0aW9ucyB9IGZyb20gJy4vUG9wdWxhdGlvblBsb3ROb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIGRpbWVuc2lvbnMgb2YgdGhlIGdyaWQgKHNhbnMgdGljayBtYXJrcykgaW4gdmlldyBjb29yZGluYXRlc1xyXG4gIGdyaWRXaWR0aD86IG51bWJlcjtcclxuICBncmlkSGVpZ2h0PzogbnVtYmVyO1xyXG59IDtcclxuXHJcbnR5cGUgUG9wdWxhdGlvblBsb3RzTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3B1bGF0aW9uUGxvdHNOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcG9wdWxhdGlvbk1vZGVsOiBQb3B1bGF0aW9uTW9kZWwsIHByb3ZpZGVkT3B0aW9ucz86IFBvcHVsYXRpb25QbG90c05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UG9wdWxhdGlvblBsb3RzTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgZ3JpZFdpZHRoOiAxMDAsXHJcbiAgICAgIGdyaWRIZWlnaHQ6IDEwMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQ2xpcHBlZCB0byB0aGUgZ3JhcGgsIGJ1dCBkaWxhdGVkIHRvIG1pdGlnYXRlIGNsaXBwaW5nIG9mIHBvaW50cyBhbmQgbGluZSBzZWdtZW50cyBhdCB0aGUgZWRnZXMgb2YgdGhlIGdyaWQuXHJcbiAgICAvLyBQb2ludHMgKGJ1dCBub3QgbGluZSBzZWdtZW50cykgdGhhdCBmYWxsIGF0IHlNYXggKGluIG1vZGVsIGNvb3JkaW5hdGVzKSB3aWxsIGJlIHNsaWdodGx5IGNsaXBwZWQgYXMgYSBjb21wcm9taXNlXHJcbiAgICAvLyBmb3IgaW1wcm92ZWQgY2xpcHBpbmcgcGVyZm9ybWFuY2UuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzE1OVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2xpcEFyZWEsICdQb3B1bGF0aW9uUGxvdHNOb2RlIHNldHMgY2xpcEFyZWEnICk7XHJcbiAgICBvcHRpb25zLmNsaXBBcmVhID0gU2hhcGUuYm91bmRzKFxyXG4gICAgICBuZXcgQm91bmRzMihcclxuICAgICAgICAtTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cy5QT1BVTEFUSU9OX1BPSU5UX1JBRElVUyxcclxuICAgICAgICAtTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cy5QT1BVTEFUSU9OX0xJTkVfV0lEVEggLyAyLFxyXG4gICAgICAgIG9wdGlvbnMuZ3JpZFdpZHRoICsgTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cy5QT1BVTEFUSU9OX1BPSU5UX1JBRElVUyxcclxuICAgICAgICBvcHRpb25zLmdyaWRIZWlnaHQgKyBOYXR1cmFsU2VsZWN0aW9uQ29uc3RhbnRzLlBPUFVMQVRJT05fUE9JTlRfUkFESVVTXHJcbiAgICAgIClcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ29uZmlnIGNvbW1vbiB0byBhbGwgUG9wdWxhdGlvblBsb3ROb2RlIGluc3RhbmNlc1xyXG4gICAgY29uc3QgcGxvdE5vZGVDb25maWcgPSB7XHJcbiAgICAgIGdyaWRXaWR0aDogb3B0aW9ucy5ncmlkV2lkdGgsXHJcbiAgICAgIGdyaWRIZWlnaHQ6IG9wdGlvbnMuZ3JpZEhlaWdodCxcclxuICAgICAgeEF4aXNMZW5ndGg6IHBvcHVsYXRpb25Nb2RlbC54QXhpc0xlbmd0aCxcclxuICAgICAgeFJhbmdlUHJvcGVydHk6IHBvcHVsYXRpb25Nb2RlbC54UmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgeVJhbmdlUHJvcGVydHk6IHBvcHVsYXRpb25Nb2RlbC55UmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgdGltZUluR2VuZXJhdGlvbnNQcm9wZXJ0eTogcG9wdWxhdGlvbk1vZGVsLnRpbWVJbkdlbmVyYXRpb25zUHJvcGVydHlcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdG90YWxQbG90Tm9kZSA9IG5ldyBQb3B1bGF0aW9uUGxvdE5vZGUoIGNvbWJpbmVPcHRpb25zPFBvcHVsYXRpb25QbG90Tm9kZU9wdGlvbnM+KCB7fSwgcGxvdE5vZGVDb25maWcsIHtcclxuICAgICAgcG9pbnRzOiBwb3B1bGF0aW9uTW9kZWwudG90YWxQb2ludHMsXHJcbiAgICAgIHBsb3RWaXNpYmxlUHJvcGVydHk6IHBvcHVsYXRpb25Nb2RlbC50b3RhbFZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgY29sb3I6IE5hdHVyYWxTZWxlY3Rpb25Db2xvcnMuUE9QVUxBVElPTl9UT1RBTF9DT1VOVFxyXG4gICAgfSApICk7XHJcblxyXG4gICAgY29uc3Qgd2hpdGVGdXJQbG90Tm9kZSA9IG5ldyBQb3B1bGF0aW9uUGxvdE5vZGUoIGNvbWJpbmVPcHRpb25zPFBvcHVsYXRpb25QbG90Tm9kZU9wdGlvbnM+KCB7fSwgcGxvdE5vZGVDb25maWcsIHtcclxuICAgICAgcG9pbnRzOiBwb3B1bGF0aW9uTW9kZWwud2hpdGVGdXJQb2ludHMsXHJcbiAgICAgIHBsb3RWaXNpYmxlUHJvcGVydHk6IHBvcHVsYXRpb25Nb2RlbC53aGl0ZUZ1clZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgY29sb3I6IE5hdHVyYWxTZWxlY3Rpb25Db2xvcnMuRlVSXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCBicm93bkZ1clBsb3ROb2RlID0gbmV3IFBvcHVsYXRpb25QbG90Tm9kZSggY29tYmluZU9wdGlvbnM8UG9wdWxhdGlvblBsb3ROb2RlT3B0aW9ucz4oIHt9LCBwbG90Tm9kZUNvbmZpZywge1xyXG4gICAgICBwb2ludHM6IHBvcHVsYXRpb25Nb2RlbC5icm93bkZ1clBvaW50cyxcclxuICAgICAgcGxvdFZpc2libGVQcm9wZXJ0eTogcG9wdWxhdGlvbk1vZGVsLmJyb3duRnVyVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBjb2xvcjogTmF0dXJhbFNlbGVjdGlvbkNvbG9ycy5GVVIsXHJcbiAgICAgIGlzTXV0YW50OiB0cnVlXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCBzdHJhaWdodEVhcnNQbG90Tm9kZSA9IG5ldyBQb3B1bGF0aW9uUGxvdE5vZGUoIGNvbWJpbmVPcHRpb25zPFBvcHVsYXRpb25QbG90Tm9kZU9wdGlvbnM+KCB7fSwgcGxvdE5vZGVDb25maWcsIHtcclxuICAgICAgcG9pbnRzOiBwb3B1bGF0aW9uTW9kZWwuc3RyYWlnaHRFYXJzUG9pbnRzLFxyXG4gICAgICBwbG90VmlzaWJsZVByb3BlcnR5OiBwb3B1bGF0aW9uTW9kZWwuc3RyYWlnaHRFYXJzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBjb2xvcjogTmF0dXJhbFNlbGVjdGlvbkNvbG9ycy5FQVJTXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCBmbG9wcHlFYXJzUGxvdE5vZGUgPSBuZXcgUG9wdWxhdGlvblBsb3ROb2RlKCBjb21iaW5lT3B0aW9uczxQb3B1bGF0aW9uUGxvdE5vZGVPcHRpb25zPigge30sIHBsb3ROb2RlQ29uZmlnLCB7XHJcbiAgICAgIHBvaW50czogcG9wdWxhdGlvbk1vZGVsLmZsb3BweUVhcnNQb2ludHMsXHJcbiAgICAgIHBsb3RWaXNpYmxlUHJvcGVydHk6IHBvcHVsYXRpb25Nb2RlbC5mbG9wcHlFYXJzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBjb2xvcjogTmF0dXJhbFNlbGVjdGlvbkNvbG9ycy5FQVJTLFxyXG4gICAgICBpc011dGFudDogdHJ1ZVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgY29uc3Qgc2hvcnRUZWV0aFBsb3ROb2RlID0gbmV3IFBvcHVsYXRpb25QbG90Tm9kZSggY29tYmluZU9wdGlvbnM8UG9wdWxhdGlvblBsb3ROb2RlT3B0aW9ucz4oIHt9LCBwbG90Tm9kZUNvbmZpZywge1xyXG4gICAgICBwb2ludHM6IHBvcHVsYXRpb25Nb2RlbC5zaG9ydFRlZXRoUG9pbnRzLFxyXG4gICAgICBwbG90VmlzaWJsZVByb3BlcnR5OiBwb3B1bGF0aW9uTW9kZWwuc2hvcnRUZWV0aFZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgY29sb3I6IE5hdHVyYWxTZWxlY3Rpb25Db2xvcnMuVEVFVEhcclxuICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IGxvbmdUZWV0aFByb2JlTm9kZSA9IG5ldyBQb3B1bGF0aW9uUGxvdE5vZGUoIGNvbWJpbmVPcHRpb25zPFBvcHVsYXRpb25QbG90Tm9kZU9wdGlvbnM+KCB7fSwgcGxvdE5vZGVDb25maWcsIHtcclxuICAgICAgcG9pbnRzOiBwb3B1bGF0aW9uTW9kZWwubG9uZ1RlZXRoUG9pbnRzLFxyXG4gICAgICBwbG90VmlzaWJsZVByb3BlcnR5OiBwb3B1bGF0aW9uTW9kZWwubG9uZ1RlZXRoVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBjb2xvcjogTmF0dXJhbFNlbGVjdGlvbkNvbG9ycy5URUVUSCxcclxuICAgICAgaXNNdXRhbnQ6IHRydWVcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEZyb250LXRvLWJhY2sgcmVuZGVyaW5nIG9yZGVyIHNob3VsZCBtYXRjaCB0b3AtdG8tYm90dG9tIG9yZGVyIG9mIGNoZWNrYm94ZXMgaW4gUG9wdWxhdGlvblBhbmVsXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ1BvcHVsYXRpb25QbG90c05vZGUgc2V0cyBjaGlsZHJlbicgKTtcclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIGxvbmdUZWV0aFByb2JlTm9kZSxcclxuICAgICAgc2hvcnRUZWV0aFBsb3ROb2RlLFxyXG4gICAgICBmbG9wcHlFYXJzUGxvdE5vZGUsXHJcbiAgICAgIHN0cmFpZ2h0RWFyc1Bsb3ROb2RlLFxyXG4gICAgICBicm93bkZ1clBsb3ROb2RlLFxyXG4gICAgICB3aGl0ZUZ1clBsb3ROb2RlLFxyXG4gICAgICB0b3RhbFBsb3ROb2RlXHJcbiAgICBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnUG9wdWxhdGlvblBsb3RzTm9kZScsIFBvcHVsYXRpb25QbG90c05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUFRLDBDQUEwQztBQUNwRixTQUFTQyxJQUFJLFFBQTZDLHNDQUFzQztBQUNoRyxPQUFPQyxnQkFBZ0IsTUFBTSw4QkFBOEI7QUFFM0QsT0FBT0Msc0JBQXNCLE1BQU0saUNBQWlDO0FBQ3BFLE9BQU9DLHlCQUF5QixNQUFNLG9DQUFvQztBQUMxRSxPQUFPQyxrQkFBa0IsTUFBcUMseUJBQXlCO0FBV3ZGLGVBQWUsTUFBTUMsbUJBQW1CLFNBQVNMLElBQUksQ0FBQztFQUU3Q00sV0FBV0EsQ0FBRUMsZUFBZ0MsRUFBRUMsZUFBNEMsRUFBRztJQUVuRyxNQUFNQyxPQUFPLEdBQUdYLFNBQVMsQ0FBdUQsQ0FBQyxDQUFFO01BRWpGO01BQ0FZLFNBQVMsRUFBRSxHQUFHO01BQ2RDLFVBQVUsRUFBRTtJQUNkLENBQUMsRUFBRUgsZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQTtJQUNBO0lBQ0FJLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNILE9BQU8sQ0FBQ0ksUUFBUSxFQUFFLG1D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