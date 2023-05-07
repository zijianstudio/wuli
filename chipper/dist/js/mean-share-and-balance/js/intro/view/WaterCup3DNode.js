// Copyright 2022, University of Colorado Boulder

/**
 * Representation for the 3D water cup including draggable water level.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Node } from '../../../../scenery/js/imports.js';
import meanShareAndBalance from '../../meanShareAndBalance.js';
import WaterLevelTriangleSlider from './WaterLevelTriangleSlider.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import MeanShareAndBalanceConstants from '../../common/MeanShareAndBalanceConstants.js';
import BeakerNode from '../../../../scenery-phet/js/BeakerNode.js';
import MeanShareAndBalanceColors from '../../common/MeanShareAndBalanceColors.js';
export default class WaterCup3DNode extends Node {
  constructor(tickMarksVisibleProperty, model, waterCup, modelViewTransform, providedOptions) {
    const options = optionize()({
      y: modelViewTransform.modelToViewY(0) - MeanShareAndBalanceConstants.CUP_HEIGHT,
      left: waterCup.position.x,
      visibleProperty: waterCup.isActiveProperty
    }, providedOptions);

    // The CUP_HEIGHT is the height of the 2d cups.  The 3D cups have to be adjusted accordingly because of the top and bottom ellipses,
    // so they don't seem disproportionately tall
    const beakerHeight = MeanShareAndBalanceConstants.CUP_HEIGHT - 10;
    const beakerLineWidth = 2;
    const waterCupNode = new BeakerNode(waterCup.waterLevelProperty, {
      lineWidth: beakerLineWidth,
      beakerWidth: MeanShareAndBalanceConstants.CUP_WIDTH,
      beakerHeight: beakerHeight,
      solutionFill: MeanShareAndBalanceColors.waterFillColorProperty,
      solutionGlareFill: MeanShareAndBalanceColors.water3DCrescentFillColorProperty,
      solutionShadowFill: MeanShareAndBalanceColors.waterShadowFillColorProperty,
      beakerGlareFill: MeanShareAndBalanceColors.waterCup3DGlareFillColorProperty,
      emptyBeakerFill: MeanShareAndBalanceColors.emptyWaterCup3DColorProperty
    });
    const isShowingTickMarksListener = isShowingTickMarks => waterCupNode.setTicksVisible(isShowingTickMarks);
    tickMarksVisibleProperty.link(isShowingTickMarksListener);
    waterCup.waterLevelProperty.lazyLink((waterLevel, oldWaterlevel) => {
      model.changeWaterLevel(waterCup, waterLevel, oldWaterlevel);
    });
    const waterLevelTriangle = new WaterLevelTriangleSlider(waterCup.waterLevelProperty, waterCup.enabledRangeProperty, beakerHeight, {
      left: MeanShareAndBalanceConstants.CUP_WIDTH * MeanShareAndBalanceConstants.WATER_LEVEL_DEFAULT,
      top: waterCupNode.top + beakerLineWidth * 2,
      // phet-io
      tandem: options.tandem.createTandem('waterLevelSlider')
    });
    const combinedOptions = combineOptions({
      children: [waterCupNode, waterLevelTriangle]
    }, options);
    super(combinedOptions);
  }
}
meanShareAndBalance.register('WaterCup3DNode', WaterCup3DNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwibWVhblNoYXJlQW5kQmFsYW5jZSIsIldhdGVyTGV2ZWxUcmlhbmdsZVNsaWRlciIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cyIsIkJlYWtlck5vZGUiLCJNZWFuU2hhcmVBbmRCYWxhbmNlQ29sb3JzIiwiV2F0ZXJDdXAzRE5vZGUiLCJjb25zdHJ1Y3RvciIsInRpY2tNYXJrc1Zpc2libGVQcm9wZXJ0eSIsIm1vZGVsIiwid2F0ZXJDdXAiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwieSIsIm1vZGVsVG9WaWV3WSIsIkNVUF9IRUlHSFQiLCJsZWZ0IiwicG9zaXRpb24iLCJ4IiwidmlzaWJsZVByb3BlcnR5IiwiaXNBY3RpdmVQcm9wZXJ0eSIsImJlYWtlckhlaWdodCIsImJlYWtlckxpbmVXaWR0aCIsIndhdGVyQ3VwTm9kZSIsIndhdGVyTGV2ZWxQcm9wZXJ0eSIsImxpbmVXaWR0aCIsImJlYWtlcldpZHRoIiwiQ1VQX1dJRFRIIiwic29sdXRpb25GaWxsIiwid2F0ZXJGaWxsQ29sb3JQcm9wZXJ0eSIsInNvbHV0aW9uR2xhcmVGaWxsIiwid2F0ZXIzRENyZXNjZW50RmlsbENvbG9yUHJvcGVydHkiLCJzb2x1dGlvblNoYWRvd0ZpbGwiLCJ3YXRlclNoYWRvd0ZpbGxDb2xvclByb3BlcnR5IiwiYmVha2VyR2xhcmVGaWxsIiwid2F0ZXJDdXAzREdsYXJlRmlsbENvbG9yUHJvcGVydHkiLCJlbXB0eUJlYWtlckZpbGwiLCJlbXB0eVdhdGVyQ3VwM0RDb2xvclByb3BlcnR5IiwiaXNTaG93aW5nVGlja01hcmtzTGlzdGVuZXIiLCJpc1Nob3dpbmdUaWNrTWFya3MiLCJzZXRUaWNrc1Zpc2libGUiLCJsaW5rIiwibGF6eUxpbmsiLCJ3YXRlckxldmVsIiwib2xkV2F0ZXJsZXZlbCIsImNoYW5nZVdhdGVyTGV2ZWwiLCJ3YXRlckxldmVsVHJpYW5nbGUiLCJlbmFibGVkUmFuZ2VQcm9wZXJ0eSIsIldBVEVSX0xFVkVMX0RFRkFVTFQiLCJ0b3AiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJjb21iaW5lZE9wdGlvbnMiLCJjaGlsZHJlbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F0ZXJDdXAzRE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudGF0aW9uIGZvciB0aGUgM0Qgd2F0ZXIgY3VwIGluY2x1ZGluZyBkcmFnZ2FibGUgd2F0ZXIgbGV2ZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBOb2RlVHJhbnNmb3JtT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZWFuU2hhcmVBbmRCYWxhbmNlIGZyb20gJy4uLy4uL21lYW5TaGFyZUFuZEJhbGFuY2UuanMnO1xyXG5pbXBvcnQgV2F0ZXJDdXAgZnJvbSAnLi4vbW9kZWwvV2F0ZXJDdXAuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBXYXRlckxldmVsVHJpYW5nbGVTbGlkZXIgZnJvbSAnLi9XYXRlckxldmVsVHJpYW5nbGVTbGlkZXIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9NZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJlYWtlck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0JlYWtlck5vZGUuanMnO1xyXG5pbXBvcnQgTWVhblNoYXJlQW5kQmFsYW5jZUNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vTWVhblNoYXJlQW5kQmFsYW5jZUNvbG9ycy5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgSW50cm9Nb2RlbCBmcm9tICcuLi9tb2RlbC9JbnRyb01vZGVsLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBXYXRlckN1cDNETm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsIGtleW9mIE5vZGVUcmFuc2Zvcm1PcHRpb25zIHwgJ2NoaWxkcmVuJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXRlckN1cDNETm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRpY2tNYXJrc1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogUGljazxJbnRyb01vZGVsLCAnY2hhbmdlV2F0ZXJMZXZlbCc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgd2F0ZXJDdXA6IFdhdGVyQ3VwLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBXYXRlckN1cDNETm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxXYXRlckN1cDNETm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICB5OiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCAwICkgLSBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzLkNVUF9IRUlHSFQsXHJcbiAgICAgIGxlZnQ6IHdhdGVyQ3VwLnBvc2l0aW9uLngsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogd2F0ZXJDdXAuaXNBY3RpdmVQcm9wZXJ0eVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gVGhlIENVUF9IRUlHSFQgaXMgdGhlIGhlaWdodCBvZiB0aGUgMmQgY3Vwcy4gIFRoZSAzRCBjdXBzIGhhdmUgdG8gYmUgYWRqdXN0ZWQgYWNjb3JkaW5nbHkgYmVjYXVzZSBvZiB0aGUgdG9wIGFuZCBib3R0b20gZWxsaXBzZXMsXHJcbiAgICAvLyBzbyB0aGV5IGRvbid0IHNlZW0gZGlzcHJvcG9ydGlvbmF0ZWx5IHRhbGxcclxuICAgIGNvbnN0IGJlYWtlckhlaWdodCA9IE1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMuQ1VQX0hFSUdIVCAtIDEwO1xyXG5cclxuICAgIGNvbnN0IGJlYWtlckxpbmVXaWR0aCA9IDI7XHJcbiAgICBjb25zdCB3YXRlckN1cE5vZGUgPSBuZXcgQmVha2VyTm9kZSggd2F0ZXJDdXAud2F0ZXJMZXZlbFByb3BlcnR5LCB7XHJcbiAgICAgIGxpbmVXaWR0aDogYmVha2VyTGluZVdpZHRoLFxyXG4gICAgICBiZWFrZXJXaWR0aDogTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cy5DVVBfV0lEVEgsXHJcbiAgICAgIGJlYWtlckhlaWdodDogYmVha2VySGVpZ2h0LFxyXG4gICAgICBzb2x1dGlvbkZpbGw6IE1lYW5TaGFyZUFuZEJhbGFuY2VDb2xvcnMud2F0ZXJGaWxsQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgc29sdXRpb25HbGFyZUZpbGw6IE1lYW5TaGFyZUFuZEJhbGFuY2VDb2xvcnMud2F0ZXIzRENyZXNjZW50RmlsbENvbG9yUHJvcGVydHksXHJcbiAgICAgIHNvbHV0aW9uU2hhZG93RmlsbDogTWVhblNoYXJlQW5kQmFsYW5jZUNvbG9ycy53YXRlclNoYWRvd0ZpbGxDb2xvclByb3BlcnR5LFxyXG4gICAgICBiZWFrZXJHbGFyZUZpbGw6IE1lYW5TaGFyZUFuZEJhbGFuY2VDb2xvcnMud2F0ZXJDdXAzREdsYXJlRmlsbENvbG9yUHJvcGVydHksXHJcbiAgICAgIGVtcHR5QmVha2VyRmlsbDogTWVhblNoYXJlQW5kQmFsYW5jZUNvbG9ycy5lbXB0eVdhdGVyQ3VwM0RDb2xvclByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaXNTaG93aW5nVGlja01hcmtzTGlzdGVuZXIgPSAoIGlzU2hvd2luZ1RpY2tNYXJrczogYm9vbGVhbiApID0+IHdhdGVyQ3VwTm9kZS5zZXRUaWNrc1Zpc2libGUoIGlzU2hvd2luZ1RpY2tNYXJrcyApO1xyXG5cclxuICAgIHRpY2tNYXJrc1Zpc2libGVQcm9wZXJ0eS5saW5rKCBpc1Nob3dpbmdUaWNrTWFya3NMaXN0ZW5lciApO1xyXG5cclxuICAgIHdhdGVyQ3VwLndhdGVyTGV2ZWxQcm9wZXJ0eS5sYXp5TGluayggKCB3YXRlckxldmVsLCBvbGRXYXRlcmxldmVsICkgPT4ge1xyXG4gICAgICBtb2RlbC5jaGFuZ2VXYXRlckxldmVsKCB3YXRlckN1cCwgd2F0ZXJMZXZlbCwgb2xkV2F0ZXJsZXZlbCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHdhdGVyTGV2ZWxUcmlhbmdsZSA9IG5ldyBXYXRlckxldmVsVHJpYW5nbGVTbGlkZXIoIHdhdGVyQ3VwLndhdGVyTGV2ZWxQcm9wZXJ0eSwgd2F0ZXJDdXAuZW5hYmxlZFJhbmdlUHJvcGVydHksIGJlYWtlckhlaWdodCwge1xyXG4gICAgICBsZWZ0OiBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzLkNVUF9XSURUSCAqIE1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMuV0FURVJfTEVWRUxfREVGQVVMVCxcclxuICAgICAgdG9wOiB3YXRlckN1cE5vZGUudG9wICsgYmVha2VyTGluZVdpZHRoICogMixcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd3YXRlckxldmVsU2xpZGVyJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29tYmluZWRPcHRpb25zID0gY29tYmluZU9wdGlvbnM8Tm9kZU9wdGlvbnM+KCB7IGNoaWxkcmVuOiBbIHdhdGVyQ3VwTm9kZSwgd2F0ZXJMZXZlbFRyaWFuZ2xlIF0gfSwgb3B0aW9ucyApO1xyXG4gICAgc3VwZXIoIGNvbWJpbmVkT3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxubWVhblNoYXJlQW5kQmFsYW5jZS5yZWdpc3RlciggJ1dhdGVyQ3VwM0ROb2RlJywgV2F0ZXJDdXAzRE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxJQUFJLFFBQTJDLG1DQUFtQztBQUMzRixPQUFPQyxtQkFBbUIsTUFBTSw4QkFBOEI7QUFHOUQsT0FBT0Msd0JBQXdCLE1BQU0sK0JBQStCO0FBQ3BFLE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUEwQix1Q0FBdUM7QUFDbkcsT0FBT0MsNEJBQTRCLE1BQU0sOENBQThDO0FBQ3ZGLE9BQU9DLFVBQVUsTUFBTSwyQ0FBMkM7QUFDbEUsT0FBT0MseUJBQXlCLE1BQU0sMkNBQTJDO0FBU2pGLGVBQWUsTUFBTUMsY0FBYyxTQUFTUixJQUFJLENBQUM7RUFFeENTLFdBQVdBLENBQUVDLHdCQUEyQyxFQUMzQ0MsS0FBMkMsRUFDM0NDLFFBQWtCLEVBQUVDLGtCQUF1QyxFQUMzREMsZUFBdUMsRUFBRztJQUU1RCxNQUFNQyxPQUFPLEdBQUdaLFNBQVMsQ0FBa0QsQ0FBQyxDQUFFO01BQzVFYSxDQUFDLEVBQUVILGtCQUFrQixDQUFDSSxZQUFZLENBQUUsQ0FBRSxDQUFDLEdBQUdaLDRCQUE0QixDQUFDYSxVQUFVO01BQ2pGQyxJQUFJLEVBQUVQLFFBQVEsQ0FBQ1EsUUFBUSxDQUFDQyxDQUFDO01BQ3pCQyxlQUFlLEVBQUVWLFFBQVEsQ0FBQ1c7SUFDNUIsQ0FBQyxFQUFFVCxlQUFnQixDQUFDOztJQUVwQjtJQUNBO0lBQ0EsTUFBTVUsWUFBWSxHQUFHbkIsNEJBQTRCLENBQUNhLFVBQVUsR0FBRyxFQUFFO0lBRWpFLE1BQU1PLGVBQWUsR0FBRyxDQUFDO0lBQ3pCLE1BQU1DLFlBQVksR0FBRyxJQUFJcEIsVUFBVSxDQUFFTSxRQUFRLENBQUNlLGtCQUFrQixFQUFFO01BQ2hFQyxTQUFTLEVBQUVILGVBQWU7TUFDMUJJLFdBQVcsRUFBRXhCLDRCQUE0QixDQUFDeUIsU0FBUztNQUNuRE4sWUFBWSxFQUFFQSxZQUFZO01BQzFCTyxZQUFZLEVBQUV4Qix5QkFBeUIsQ0FBQ3lCLHNCQUFzQjtNQUM5REMsaUJBQWlCLEVBQUUxQix5QkFBeUIsQ0FBQzJCLGdDQUFnQztNQUM3RUMsa0JBQWtCLEVBQUU1Qix5QkFBeUIsQ0FBQzZCLDRCQUE0QjtNQUMxRUMsZUFBZSxFQUFFOUIseUJBQXlCLENBQUMrQixnQ0FBZ0M7TUFDM0VDLGVBQWUsRUFBRWhDLHlCQUF5QixDQUFDaUM7SUFDN0MsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsMEJBQTBCLEdBQUtDLGtCQUEyQixJQUFNaEIsWUFBWSxDQUFDaUIsZUFBZSxDQUFFRCxrQkFBbUIsQ0FBQztJQUV4SGhDLHdCQUF3QixDQUFDa0MsSUFBSSxDQUFFSCwwQkFBMkIsQ0FBQztJQUUzRDdCLFFBQVEsQ0FBQ2Usa0JBQWtCLENBQUNrQixRQUFRLENBQUUsQ0FBRUMsVUFBVSxFQUFFQyxhQUFhLEtBQU07TUFDckVwQyxLQUFLLENBQUNxQyxnQkFBZ0IsQ0FBRXBDLFFBQVEsRUFBRWtDLFVBQVUsRUFBRUMsYUFBYyxDQUFDO0lBQy9ELENBQUUsQ0FBQztJQUVILE1BQU1FLGtCQUFrQixHQUFHLElBQUkvQyx3QkFBd0IsQ0FBRVUsUUFBUSxDQUFDZSxrQkFBa0IsRUFBRWYsUUFBUSxDQUFDc0Msb0JBQW9CLEVBQUUxQixZQUFZLEVBQUU7TUFDaklMLElBQUksRUFBRWQsNEJBQTRCLENBQUN5QixTQUFTLEdBQUd6Qiw0QkFBNEIsQ0FBQzhDLG1CQUFtQjtNQUMvRkMsR0FBRyxFQUFFMUIsWUFBWSxDQUFDMEIsR0FBRyxHQUFHM0IsZUFBZSxHQUFHLENBQUM7TUFFM0M7TUFDQTRCLE1BQU0sRUFBRXRDLE9BQU8sQ0FBQ3NDLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGtCQUFtQjtJQUMxRCxDQUFFLENBQUM7SUFFSCxNQUFNQyxlQUFlLEdBQUduRCxjQUFjLENBQWU7TUFBRW9ELFFBQVEsRUFBRSxDQUFFOUIsWUFBWSxFQUFFdUIsa0JBQWtCO0lBQUcsQ0FBQyxFQUFFbEMsT0FBUSxDQUFDO0lBQ2xILEtBQUssQ0FBRXdDLGVBQWdCLENBQUM7RUFDMUI7QUFDRjtBQUVBdEQsbUJBQW1CLENBQUN3RCxRQUFRLENBQUUsZ0JBQWdCLEVBQUVqRCxjQUFlLENBQUMifQ==