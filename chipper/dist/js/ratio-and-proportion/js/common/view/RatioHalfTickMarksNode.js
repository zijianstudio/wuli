// Copyright 2020-2022, University of Colorado Boulder

/**
 * Sim specific grid implementation that supports customization through passed in Properties. This uses minor lines
 * from GridNode, but not major lines. In Ration and Proportion, these grid lines are called "tick marks"
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import GridNode from '../../../../griddle/js/GridNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import TickMarkView from './TickMarkView.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Multilink from '../../../../axon/js/Multilink.js';
class RatioHalfTickMarksNode extends GridNode {
  constructor(tickMarkViewProperty, tickMarkRangeProperty, width, height, colorProperty, providedOptions) {
    const options = optionize()({
      // initial line spacings
      minorHorizontalLineSpacing: 10,
      minorLineOptions: {
        stroke: colorProperty,
        lineWidth: 2
      }
    }, providedOptions);
    super(width, height, options);
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    Multilink.multilink([tickMarkRangeProperty, tickMarkViewProperty], this.update.bind(this));
  }
  layout(width, height) {
    this.setGridWidth(width);
    this.setGridHeight(height);
    this.update(this.tickMarkRangeProperty.value, this.tickMarkViewProperty.value);
  }
  update(tickMarkRange, tickMarkView) {
    // subtract one to account for potential rounding errors. This helps guarantee that the last line is drawn.
    this.setLineSpacings({
      minorHorizontalLineSpacing: (this.gridHeight - 1) / tickMarkRange
    });
    this.visible = TickMarkView.displayHorizontal(tickMarkView);
  }
}
ratioAndProportion.register('RatioHalfTickMarksNode', RatioHalfTickMarksNode);
export default RatioHalfTickMarksNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHcmlkTm9kZSIsInJhdGlvQW5kUHJvcG9ydGlvbiIsIlRpY2tNYXJrVmlldyIsIm9wdGlvbml6ZSIsIk11bHRpbGluayIsIlJhdGlvSGFsZlRpY2tNYXJrc05vZGUiLCJjb25zdHJ1Y3RvciIsInRpY2tNYXJrVmlld1Byb3BlcnR5IiwidGlja01hcmtSYW5nZVByb3BlcnR5Iiwid2lkdGgiLCJoZWlnaHQiLCJjb2xvclByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm1pbm9ySG9yaXpvbnRhbExpbmVTcGFjaW5nIiwibWlub3JMaW5lT3B0aW9ucyIsInN0cm9rZSIsImxpbmVXaWR0aCIsIm11bHRpbGluayIsInVwZGF0ZSIsImJpbmQiLCJsYXlvdXQiLCJzZXRHcmlkV2lkdGgiLCJzZXRHcmlkSGVpZ2h0IiwidmFsdWUiLCJ0aWNrTWFya1JhbmdlIiwidGlja01hcmtWaWV3Iiwic2V0TGluZVNwYWNpbmdzIiwiZ3JpZEhlaWdodCIsInZpc2libGUiLCJkaXNwbGF5SG9yaXpvbnRhbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmF0aW9IYWxmVGlja01hcmtzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaW0gc3BlY2lmaWMgZ3JpZCBpbXBsZW1lbnRhdGlvbiB0aGF0IHN1cHBvcnRzIGN1c3RvbWl6YXRpb24gdGhyb3VnaCBwYXNzZWQgaW4gUHJvcGVydGllcy4gVGhpcyB1c2VzIG1pbm9yIGxpbmVzXHJcbiAqIGZyb20gR3JpZE5vZGUsIGJ1dCBub3QgbWFqb3IgbGluZXMuIEluIFJhdGlvbiBhbmQgUHJvcG9ydGlvbiwgdGhlc2UgZ3JpZCBsaW5lcyBhcmUgY2FsbGVkIFwidGljayBtYXJrc1wiXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBHcmlkTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9ncmlkZGxlL2pzL0dyaWROb2RlLmpzJztcclxuaW1wb3J0IHJhdGlvQW5kUHJvcG9ydGlvbiBmcm9tICcuLi8uLi9yYXRpb0FuZFByb3BvcnRpb24uanMnO1xyXG5pbXBvcnQgVGlja01hcmtWaWV3IGZyb20gJy4vVGlja01hcmtWaWV3LmpzJztcclxuaW1wb3J0IHsgUGF0aE9wdGlvbnMsIFRQYWludCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBtaW5vckhvcml6b250YWxMaW5lU3BhY2luZz86IG51bWJlciB8IG51bGw7XHJcbiAgbWlub3JMaW5lT3B0aW9ucz86IFBhdGhPcHRpb25zO1xyXG59O1xyXG50eXBlIFJhdGlvSGFsZlRpY2tNYXJrc05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQYXRoT3B0aW9ucztcclxuXHJcbmNsYXNzIFJhdGlvSGFsZlRpY2tNYXJrc05vZGUgZXh0ZW5kcyBHcmlkTm9kZSB7XHJcblxyXG4gIHByaXZhdGUgdGlja01hcmtWaWV3UHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8VGlja01hcmtWaWV3PjtcclxuICBwcml2YXRlIHRpY2tNYXJrUmFuZ2VQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0aWNrTWFya1ZpZXdQcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxUaWNrTWFya1ZpZXc+LCB0aWNrTWFya1JhbmdlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIHdpZHRoOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IG51bWJlciwgY29sb3JQcm9wZXJ0eTogVFBhaW50LCBwcm92aWRlZE9wdGlvbnM/OiBTZWxmT3B0aW9ucyApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmF0aW9IYWxmVGlja01hcmtzTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBpbml0aWFsIGxpbmUgc3BhY2luZ3NcclxuICAgICAgbWlub3JIb3Jpem9udGFsTGluZVNwYWNpbmc6IDEwLFxyXG4gICAgICBtaW5vckxpbmVPcHRpb25zOiB7XHJcbiAgICAgICAgc3Ryb2tlOiBjb2xvclByb3BlcnR5LFxyXG4gICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICB9XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggd2lkdGgsIGhlaWdodCwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMudGlja01hcmtWaWV3UHJvcGVydHkgPSB0aWNrTWFya1ZpZXdQcm9wZXJ0eTtcclxuICAgIHRoaXMudGlja01hcmtSYW5nZVByb3BlcnR5ID0gdGlja01hcmtSYW5nZVByb3BlcnR5O1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgdGlja01hcmtSYW5nZVByb3BlcnR5LCB0aWNrTWFya1ZpZXdQcm9wZXJ0eSBdLCB0aGlzLnVwZGF0ZS5iaW5kKCB0aGlzICkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBsYXlvdXQoIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5zZXRHcmlkV2lkdGgoIHdpZHRoICk7XHJcbiAgICB0aGlzLnNldEdyaWRIZWlnaHQoIGhlaWdodCApO1xyXG4gICAgdGhpcy51cGRhdGUoIHRoaXMudGlja01hcmtSYW5nZVByb3BlcnR5LnZhbHVlLCB0aGlzLnRpY2tNYXJrVmlld1Byb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZSggdGlja01hcmtSYW5nZTogbnVtYmVyLCB0aWNrTWFya1ZpZXc6IFRpY2tNYXJrVmlldyApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBzdWJ0cmFjdCBvbmUgdG8gYWNjb3VudCBmb3IgcG90ZW50aWFsIHJvdW5kaW5nIGVycm9ycy4gVGhpcyBoZWxwcyBndWFyYW50ZWUgdGhhdCB0aGUgbGFzdCBsaW5lIGlzIGRyYXduLlxyXG4gICAgdGhpcy5zZXRMaW5lU3BhY2luZ3MoIHtcclxuICAgICAgbWlub3JIb3Jpem9udGFsTGluZVNwYWNpbmc6ICggdGhpcy5ncmlkSGVpZ2h0IC0gMSApIC8gdGlja01hcmtSYW5nZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudmlzaWJsZSA9IFRpY2tNYXJrVmlldy5kaXNwbGF5SG9yaXpvbnRhbCggdGlja01hcmtWaWV3ICk7XHJcbiAgfVxyXG59XHJcblxyXG5yYXRpb0FuZFByb3BvcnRpb24ucmVnaXN0ZXIoICdSYXRpb0hhbGZUaWNrTWFya3NOb2RlJywgUmF0aW9IYWxmVGlja01hcmtzTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBSYXRpb0hhbGZUaWNrTWFya3NOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFFBQVEsTUFBTSxvQ0FBb0M7QUFDekQsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFHNUMsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBUXhELE1BQU1DLHNCQUFzQixTQUFTTCxRQUFRLENBQUM7RUFLckNNLFdBQVdBLENBQUVDLG9CQUF1RCxFQUFFQyxxQkFBdUMsRUFBRUMsS0FBYSxFQUMvR0MsTUFBYyxFQUFFQyxhQUFxQixFQUFFQyxlQUE2QixFQUFHO0lBQ3pGLE1BQU1DLE9BQU8sR0FBR1YsU0FBUyxDQUE2QyxDQUFDLENBQUU7TUFFdkU7TUFDQVcsMEJBQTBCLEVBQUUsRUFBRTtNQUM5QkMsZ0JBQWdCLEVBQUU7UUFDaEJDLE1BQU0sRUFBRUwsYUFBYTtRQUNyQk0sU0FBUyxFQUFFO01BQ2I7SUFDRixDQUFDLEVBQUVMLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFSCxLQUFLLEVBQUVDLE1BQU0sRUFBRUcsT0FBUSxDQUFDO0lBRS9CLElBQUksQ0FBQ04sb0JBQW9CLEdBQUdBLG9CQUFvQjtJQUNoRCxJQUFJLENBQUNDLHFCQUFxQixHQUFHQSxxQkFBcUI7SUFFbERKLFNBQVMsQ0FBQ2MsU0FBUyxDQUFFLENBQUVWLHFCQUFxQixFQUFFRCxvQkFBb0IsQ0FBRSxFQUFFLElBQUksQ0FBQ1ksTUFBTSxDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFFLENBQUM7RUFDbEc7RUFFT0MsTUFBTUEsQ0FBRVosS0FBYSxFQUFFQyxNQUFjLEVBQVM7SUFDbkQsSUFBSSxDQUFDWSxZQUFZLENBQUViLEtBQU0sQ0FBQztJQUMxQixJQUFJLENBQUNjLGFBQWEsQ0FBRWIsTUFBTyxDQUFDO0lBQzVCLElBQUksQ0FBQ1MsTUFBTSxDQUFFLElBQUksQ0FBQ1gscUJBQXFCLENBQUNnQixLQUFLLEVBQUUsSUFBSSxDQUFDakIsb0JBQW9CLENBQUNpQixLQUFNLENBQUM7RUFDbEY7RUFFUUwsTUFBTUEsQ0FBRU0sYUFBcUIsRUFBRUMsWUFBMEIsRUFBUztJQUV4RTtJQUNBLElBQUksQ0FBQ0MsZUFBZSxDQUFFO01BQ3BCYiwwQkFBMEIsRUFBRSxDQUFFLElBQUksQ0FBQ2MsVUFBVSxHQUFHLENBQUMsSUFBS0g7SUFDeEQsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDSSxPQUFPLEdBQUczQixZQUFZLENBQUM0QixpQkFBaUIsQ0FBRUosWUFBYSxDQUFDO0VBQy9EO0FBQ0Y7QUFFQXpCLGtCQUFrQixDQUFDOEIsUUFBUSxDQUFFLHdCQUF3QixFQUFFMUIsc0JBQXVCLENBQUM7QUFDL0UsZUFBZUEsc0JBQXNCIn0=