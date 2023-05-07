// Copyright 2018-2022, University of Colorado Boulder

/**
 * A Node that displays a visual queue to use space to grab and release a component.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { HBox, RichText } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import TextKeyNode from '../../keyboard/TextKeyNode.js';
import PhetFont from '../../PhetFont.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
export default class GrabReleaseCueNode extends Panel {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      spaceKeyWidth: 50,
      // this space key is wider than default space key
      keyHeight: 24,
      // height of the space key, larger than default KeyNode height

      // PanelOptions
      fill: 'white',
      stroke: 'black',
      xMargin: 15,
      yMargin: 5,
      cornerRadius: 0
    }, providedOptions);

    // Create the help content for the space key to pick up the draggable item
    const spaceKeyNode = TextKeyNode.space({
      keyHeight: options.keyHeight,
      minKeyWidth: options.spaceKeyWidth
    });
    const spaceLabelText = new RichText(SceneryPhetStrings.key.toGrabOrReleaseStringProperty, {
      maxWidth: 200,
      font: new PhetFont(12)
    });
    const spaceKeyHBox = new HBox({
      children: [spaceKeyNode, spaceLabelText],
      spacing: 10
    });

    // rectangle containing the content, not visible until focused the first time
    super(spaceKeyHBox, options);
  }
}
sceneryPhet.register('GrabReleaseCueNode', GrabReleaseCueNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJIQm94IiwiUmljaFRleHQiLCJQYW5lbCIsIlRleHRLZXlOb2RlIiwiUGhldEZvbnQiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkdyYWJSZWxlYXNlQ3VlTm9kZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNwYWNlS2V5V2lkdGgiLCJrZXlIZWlnaHQiLCJmaWxsIiwic3Ryb2tlIiwieE1hcmdpbiIsInlNYXJnaW4iLCJjb3JuZXJSYWRpdXMiLCJzcGFjZUtleU5vZGUiLCJzcGFjZSIsIm1pbktleVdpZHRoIiwic3BhY2VMYWJlbFRleHQiLCJrZXkiLCJ0b0dyYWJPclJlbGVhc2VTdHJpbmdQcm9wZXJ0eSIsIm1heFdpZHRoIiwiZm9udCIsInNwYWNlS2V5SEJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JhYlJlbGVhc2VDdWVOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgTm9kZSB0aGF0IGRpc3BsYXlzIGEgdmlzdWFsIHF1ZXVlIHRvIHVzZSBzcGFjZSB0byBncmFiIGFuZCByZWxlYXNlIGEgY29tcG9uZW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgSEJveCwgUmljaFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGFuZWwsIHsgUGFuZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFRleHRLZXlOb2RlIGZyb20gJy4uLy4uL2tleWJvYXJkL1RleHRLZXlOb2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uLy4uL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gcHJvcGVydGllcyBvZiB0aGUgc3BhY2Uga2V5XHJcbiAgc3BhY2VLZXlXaWR0aD86IG51bWJlcjtcclxuICBrZXlIZWlnaHQ/OiBudW1iZXI7XHJcbn07XHJcbmV4cG9ydCB0eXBlIEdyYWJSZWxlYXNlQ3VlTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhbmVsT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYWJSZWxlYXNlQ3VlTm9kZSBleHRlbmRzIFBhbmVsIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBHcmFiUmVsZWFzZUN1ZU5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R3JhYlJlbGVhc2VDdWVOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhbmVsT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgc3BhY2VLZXlXaWR0aDogNTAsIC8vIHRoaXMgc3BhY2Uga2V5IGlzIHdpZGVyIHRoYW4gZGVmYXVsdCBzcGFjZSBrZXlcclxuICAgICAga2V5SGVpZ2h0OiAyNCwgLy8gaGVpZ2h0IG9mIHRoZSBzcGFjZSBrZXksIGxhcmdlciB0aGFuIGRlZmF1bHQgS2V5Tm9kZSBoZWlnaHRcclxuXHJcbiAgICAgIC8vIFBhbmVsT3B0aW9uc1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIHhNYXJnaW46IDE1LFxyXG4gICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDBcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGhlbHAgY29udGVudCBmb3IgdGhlIHNwYWNlIGtleSB0byBwaWNrIHVwIHRoZSBkcmFnZ2FibGUgaXRlbVxyXG4gICAgY29uc3Qgc3BhY2VLZXlOb2RlID0gVGV4dEtleU5vZGUuc3BhY2UoIHtcclxuICAgICAga2V5SGVpZ2h0OiBvcHRpb25zLmtleUhlaWdodCxcclxuICAgICAgbWluS2V5V2lkdGg6IG9wdGlvbnMuc3BhY2VLZXlXaWR0aFxyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3BhY2VMYWJlbFRleHQgPSBuZXcgUmljaFRleHQoIFNjZW5lcnlQaGV0U3RyaW5ncy5rZXkudG9HcmFiT3JSZWxlYXNlU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgbWF4V2lkdGg6IDIwMCxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzcGFjZUtleUhCb3ggPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBzcGFjZUtleU5vZGUsIHNwYWNlTGFiZWxUZXh0IF0sXHJcbiAgICAgIHNwYWNpbmc6IDEwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVjdGFuZ2xlIGNvbnRhaW5pbmcgdGhlIGNvbnRlbnQsIG5vdCB2aXNpYmxlIHVudGlsIGZvY3VzZWQgdGhlIGZpcnN0IHRpbWVcclxuICAgIHN1cGVyKCBzcGFjZUtleUhCb3gsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnR3JhYlJlbGVhc2VDdWVOb2RlJywgR3JhYlJlbGVhc2VDdWVOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsU0FBU0MsSUFBSSxFQUFFQyxRQUFRLFFBQVEsbUNBQW1DO0FBQ2xFLE9BQU9DLEtBQUssTUFBd0IsNkJBQTZCO0FBQ2pFLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsUUFBUSxNQUFNLG1CQUFtQjtBQUN4QyxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQVU1RCxlQUFlLE1BQU1DLGtCQUFrQixTQUFTTCxLQUFLLENBQUM7RUFFN0NNLFdBQVdBLENBQUVDLGVBQTJDLEVBQUc7SUFFaEUsTUFBTUMsT0FBTyxHQUFHWCxTQUFTLENBQXVELENBQUMsQ0FBRTtNQUVqRjtNQUNBWSxhQUFhLEVBQUUsRUFBRTtNQUFFO01BQ25CQyxTQUFTLEVBQUUsRUFBRTtNQUFFOztNQUVmO01BQ0FDLElBQUksRUFBRSxPQUFPO01BQ2JDLE1BQU0sRUFBRSxPQUFPO01BQ2ZDLE9BQU8sRUFBRSxFQUFFO01BQ1hDLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLFlBQVksRUFBRTtJQUNoQixDQUFDLEVBQUVSLGVBQWdCLENBQUM7O0lBR3BCO0lBQ0EsTUFBTVMsWUFBWSxHQUFHZixXQUFXLENBQUNnQixLQUFLLENBQUU7TUFDdENQLFNBQVMsRUFBRUYsT0FBTyxDQUFDRSxTQUFTO01BQzVCUSxXQUFXLEVBQUVWLE9BQU8sQ0FBQ0M7SUFDdkIsQ0FBRSxDQUFDO0lBQ0gsTUFBTVUsY0FBYyxHQUFHLElBQUlwQixRQUFRLENBQUVLLGtCQUFrQixDQUFDZ0IsR0FBRyxDQUFDQyw2QkFBNkIsRUFBRTtNQUN6RkMsUUFBUSxFQUFFLEdBQUc7TUFDYkMsSUFBSSxFQUFFLElBQUlyQixRQUFRLENBQUUsRUFBRztJQUN6QixDQUFFLENBQUM7SUFDSCxNQUFNc0IsWUFBWSxHQUFHLElBQUkxQixJQUFJLENBQUU7TUFDN0IyQixRQUFRLEVBQUUsQ0FBRVQsWUFBWSxFQUFFRyxjQUFjLENBQUU7TUFDMUNPLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQzs7SUFFSDtJQUNBLEtBQUssQ0FBRUYsWUFBWSxFQUFFaEIsT0FBUSxDQUFDO0VBQ2hDO0FBQ0Y7QUFFQUwsV0FBVyxDQUFDd0IsUUFBUSxDQUFFLG9CQUFvQixFQUFFdEIsa0JBQW1CLENBQUMifQ==