// Copyright 2022, University of Colorado Boulder

/**
 * Half-life information section at the top half of the Decay screen contains the units label, 'more stable' and 'less
 * stable' arrow indicators.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import HalfLifeInfoDialog from './HalfLifeInfoDialog.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';

// constants
const LABEL_FONT = new PhetFont(14);
class HalfLifeInformationNode extends Node {
  constructor(halfLifeNumberProperty, isStableBooleanProperty, protonCountProperty, neutronCountProperty, doesNuclideExistBooleanProperty) {
    super();

    // create and add the halfLifeNumberLineNode
    const halfLifeNumberLineNode = new HalfLifeNumberLineNode(halfLifeNumberProperty, isStableBooleanProperty, {
      tickMarkExtent: 18,
      numberLineLabelFont: new PhetFont(15),
      numberLineWidth: 550,
      halfLifeArrowLength: 30,
      isHalfLifeLabelFixed: true,
      unitsLabelFont: LABEL_FONT
    });
    this.addChild(halfLifeNumberLineNode);

    // create and add the HalfLifeInfoDialog
    const halfLifeInfoDialog = new HalfLifeInfoDialog(halfLifeNumberProperty, isStableBooleanProperty, protonCountProperty, neutronCountProperty, doesNuclideExistBooleanProperty);

    // create and add the info button
    const infoButton = new InfoButton({
      listener: () => halfLifeInfoDialog.show(),
      baseColor: BANColors.infoButtonColorProperty,
      maxHeight: BANConstants.INFO_BUTTON_MAX_HEIGHT
    });
    infoButton.centerY = halfLifeNumberLineNode.halfLifeDisplayNode.centerY;
    infoButton.left = halfLifeNumberLineNode.left + BANConstants.INFO_BUTTON_INDENT_DISTANCE;
    this.addChild(infoButton);

    // function to create and add the arrow and more/less stable label set
    const arrowAndStableLabel = (arrowNodeTailX, arrowNodeTipX, stabilityText) => {
      const arrow = new ArrowNode(arrowNodeTailX, halfLifeNumberLineNode.bottom, arrowNodeTipX, halfLifeNumberLineNode.bottom, {
        headWidth: 6,
        tailWidth: 1
      });
      this.addChild(arrow);
      const arrowText = new Text(stabilityText, {
        font: LABEL_FONT,
        maxWidth: 175
      });
      arrowText.centerY = arrow.centerY;
      if (arrowNodeTipX === halfLifeNumberLineNode.left) {
        arrowText.left = arrow.right + 5;
      } else {
        arrowText.right = arrow.left - 5;
      }
      this.addChild(arrowText);
    };

    // create and add the 'less stable' and 'more  stable' arrow and text set
    arrowAndStableLabel(halfLifeNumberLineNode.left + 30, halfLifeNumberLineNode.left, BuildANucleusStrings.lessStable);
    arrowAndStableLabel(halfLifeNumberLineNode.right - 30, halfLifeNumberLineNode.right, BuildANucleusStrings.moreStable);
  }
}
buildANucleus.register('HalfLifeInformationNode', HalfLifeInformationNode);
export default HalfLifeInformationNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJidWlsZEFOdWNsZXVzIiwiSGFsZkxpZmVOdW1iZXJMaW5lTm9kZSIsIk5vZGUiLCJUZXh0IiwiQnVpbGRBTnVjbGV1c1N0cmluZ3MiLCJQaGV0Rm9udCIsIkFycm93Tm9kZSIsIkhhbGZMaWZlSW5mb0RpYWxvZyIsIkluZm9CdXR0b24iLCJCQU5Db2xvcnMiLCJCQU5Db25zdGFudHMiLCJMQUJFTF9GT05UIiwiSGFsZkxpZmVJbmZvcm1hdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsImhhbGZMaWZlTnVtYmVyUHJvcGVydHkiLCJpc1N0YWJsZUJvb2xlYW5Qcm9wZXJ0eSIsInByb3RvbkNvdW50UHJvcGVydHkiLCJuZXV0cm9uQ291bnRQcm9wZXJ0eSIsImRvZXNOdWNsaWRlRXhpc3RCb29sZWFuUHJvcGVydHkiLCJoYWxmTGlmZU51bWJlckxpbmVOb2RlIiwidGlja01hcmtFeHRlbnQiLCJudW1iZXJMaW5lTGFiZWxGb250IiwibnVtYmVyTGluZVdpZHRoIiwiaGFsZkxpZmVBcnJvd0xlbmd0aCIsImlzSGFsZkxpZmVMYWJlbEZpeGVkIiwidW5pdHNMYWJlbEZvbnQiLCJhZGRDaGlsZCIsImhhbGZMaWZlSW5mb0RpYWxvZyIsImluZm9CdXR0b24iLCJsaXN0ZW5lciIsInNob3ciLCJiYXNlQ29sb3IiLCJpbmZvQnV0dG9uQ29sb3JQcm9wZXJ0eSIsIm1heEhlaWdodCIsIklORk9fQlVUVE9OX01BWF9IRUlHSFQiLCJjZW50ZXJZIiwiaGFsZkxpZmVEaXNwbGF5Tm9kZSIsImxlZnQiLCJJTkZPX0JVVFRPTl9JTkRFTlRfRElTVEFOQ0UiLCJhcnJvd0FuZFN0YWJsZUxhYmVsIiwiYXJyb3dOb2RlVGFpbFgiLCJhcnJvd05vZGVUaXBYIiwic3RhYmlsaXR5VGV4dCIsImFycm93IiwiYm90dG9tIiwiaGVhZFdpZHRoIiwidGFpbFdpZHRoIiwiYXJyb3dUZXh0IiwiZm9udCIsIm1heFdpZHRoIiwicmlnaHQiLCJsZXNzU3RhYmxlIiwibW9yZVN0YWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSGFsZkxpZmVJbmZvcm1hdGlvbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEhhbGYtbGlmZSBpbmZvcm1hdGlvbiBzZWN0aW9uIGF0IHRoZSB0b3AgaGFsZiBvZiB0aGUgRGVjYXkgc2NyZWVuIGNvbnRhaW5zIHRoZSB1bml0cyBsYWJlbCwgJ21vcmUgc3RhYmxlJyBhbmQgJ2xlc3NcclxuICogc3RhYmxlJyBhcnJvdyBpbmRpY2F0b3JzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEx1aXNhIFZhcmdhc1xyXG4gKi9cclxuXHJcbmltcG9ydCBidWlsZEFOdWNsZXVzIGZyb20gJy4uLy4uL2J1aWxkQU51Y2xldXMuanMnO1xyXG5pbXBvcnQgSGFsZkxpZmVOdW1iZXJMaW5lTm9kZSBmcm9tICcuL0hhbGZMaWZlTnVtYmVyTGluZU5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJ1aWxkQU51Y2xldXNTdHJpbmdzIGZyb20gJy4uLy4uL0J1aWxkQU51Y2xldXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IEhhbGZMaWZlSW5mb0RpYWxvZyBmcm9tICcuL0hhbGZMaWZlSW5mb0RpYWxvZy5qcyc7XHJcbmltcG9ydCBJbmZvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0luZm9CdXR0b24uanMnO1xyXG5pbXBvcnQgQkFOQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9CQU5Db2xvcnMuanMnO1xyXG5pbXBvcnQgQkFOQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9CQU5Db25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XHJcblxyXG5jbGFzcyBIYWxmTGlmZUluZm9ybWF0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGhhbGZMaWZlTnVtYmVyUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgIGlzU3RhYmxlQm9vbGVhblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgcHJvdG9uQ291bnRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPixcclxuICAgICAgICAgICAgICAgbmV1dHJvbkNvdW50UHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgIGRvZXNOdWNsaWRlRXhpc3RCb29sZWFuUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgaGFsZkxpZmVOdW1iZXJMaW5lTm9kZVxyXG4gICAgY29uc3QgaGFsZkxpZmVOdW1iZXJMaW5lTm9kZSA9IG5ldyBIYWxmTGlmZU51bWJlckxpbmVOb2RlKCBoYWxmTGlmZU51bWJlclByb3BlcnR5LCBpc1N0YWJsZUJvb2xlYW5Qcm9wZXJ0eSwge1xyXG4gICAgICB0aWNrTWFya0V4dGVudDogMTgsXHJcbiAgICAgIG51bWJlckxpbmVMYWJlbEZvbnQ6IG5ldyBQaGV0Rm9udCggMTUgKSxcclxuICAgICAgbnVtYmVyTGluZVdpZHRoOiA1NTAsXHJcbiAgICAgIGhhbGZMaWZlQXJyb3dMZW5ndGg6IDMwLFxyXG4gICAgICBpc0hhbGZMaWZlTGFiZWxGaXhlZDogdHJ1ZSxcclxuICAgICAgdW5pdHNMYWJlbEZvbnQ6IExBQkVMX0ZPTlRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGhhbGZMaWZlTnVtYmVyTGluZU5vZGUgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgSGFsZkxpZmVJbmZvRGlhbG9nXHJcbiAgICBjb25zdCBoYWxmTGlmZUluZm9EaWFsb2cgPSBuZXcgSGFsZkxpZmVJbmZvRGlhbG9nKCBoYWxmTGlmZU51bWJlclByb3BlcnR5LCBpc1N0YWJsZUJvb2xlYW5Qcm9wZXJ0eSxcclxuICAgICAgcHJvdG9uQ291bnRQcm9wZXJ0eSwgbmV1dHJvbkNvdW50UHJvcGVydHksIGRvZXNOdWNsaWRlRXhpc3RCb29sZWFuUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgaW5mbyBidXR0b25cclxuICAgIGNvbnN0IGluZm9CdXR0b24gPSBuZXcgSW5mb0J1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4gaGFsZkxpZmVJbmZvRGlhbG9nLnNob3coKSxcclxuICAgICAgYmFzZUNvbG9yOiBCQU5Db2xvcnMuaW5mb0J1dHRvbkNvbG9yUHJvcGVydHksXHJcbiAgICAgIG1heEhlaWdodDogQkFOQ29uc3RhbnRzLklORk9fQlVUVE9OX01BWF9IRUlHSFRcclxuICAgIH0gKTtcclxuICAgIGluZm9CdXR0b24uY2VudGVyWSA9IGhhbGZMaWZlTnVtYmVyTGluZU5vZGUuaGFsZkxpZmVEaXNwbGF5Tm9kZS5jZW50ZXJZO1xyXG4gICAgaW5mb0J1dHRvbi5sZWZ0ID0gaGFsZkxpZmVOdW1iZXJMaW5lTm9kZS5sZWZ0ICsgQkFOQ29uc3RhbnRzLklORk9fQlVUVE9OX0lOREVOVF9ESVNUQU5DRTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGluZm9CdXR0b24gKTtcclxuXHJcbiAgICAvLyBmdW5jdGlvbiB0byBjcmVhdGUgYW5kIGFkZCB0aGUgYXJyb3cgYW5kIG1vcmUvbGVzcyBzdGFibGUgbGFiZWwgc2V0XHJcbiAgICBjb25zdCBhcnJvd0FuZFN0YWJsZUxhYmVsID0gKCBhcnJvd05vZGVUYWlsWDogbnVtYmVyLCBhcnJvd05vZGVUaXBYOiBudW1iZXIsIHN0YWJpbGl0eVRleHQ6IHN0cmluZyApID0+IHtcclxuICAgICAgY29uc3QgYXJyb3cgPSBuZXcgQXJyb3dOb2RlKCBhcnJvd05vZGVUYWlsWCwgaGFsZkxpZmVOdW1iZXJMaW5lTm9kZS5ib3R0b20sIGFycm93Tm9kZVRpcFgsXHJcbiAgICAgICAgaGFsZkxpZmVOdW1iZXJMaW5lTm9kZS5ib3R0b20sIHtcclxuICAgICAgICAgIGhlYWRXaWR0aDogNixcclxuICAgICAgICAgIHRhaWxXaWR0aDogMVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggYXJyb3cgKTtcclxuXHJcbiAgICAgIGNvbnN0IGFycm93VGV4dCA9IG5ldyBUZXh0KCBzdGFiaWxpdHlUZXh0LCB7IGZvbnQ6IExBQkVMX0ZPTlQsIG1heFdpZHRoOiAxNzUgfSApO1xyXG4gICAgICBhcnJvd1RleHQuY2VudGVyWSA9IGFycm93LmNlbnRlclk7XHJcbiAgICAgIGlmICggYXJyb3dOb2RlVGlwWCA9PT0gaGFsZkxpZmVOdW1iZXJMaW5lTm9kZS5sZWZ0ICkge1xyXG4gICAgICAgIGFycm93VGV4dC5sZWZ0ID0gYXJyb3cucmlnaHQgKyA1O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFycm93VGV4dC5yaWdodCA9IGFycm93LmxlZnQgLSA1O1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGFycm93VGV4dCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgJ2xlc3Mgc3RhYmxlJyBhbmQgJ21vcmUgIHN0YWJsZScgYXJyb3cgYW5kIHRleHQgc2V0XHJcbiAgICBhcnJvd0FuZFN0YWJsZUxhYmVsKCBoYWxmTGlmZU51bWJlckxpbmVOb2RlLmxlZnQgKyAzMCwgaGFsZkxpZmVOdW1iZXJMaW5lTm9kZS5sZWZ0LCBCdWlsZEFOdWNsZXVzU3RyaW5ncy5sZXNzU3RhYmxlICk7XHJcbiAgICBhcnJvd0FuZFN0YWJsZUxhYmVsKCBoYWxmTGlmZU51bWJlckxpbmVOb2RlLnJpZ2h0IC0gMzAsIGhhbGZMaWZlTnVtYmVyTGluZU5vZGUucmlnaHQsIEJ1aWxkQU51Y2xldXNTdHJpbmdzLm1vcmVTdGFibGUgKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQU51Y2xldXMucmVnaXN0ZXIoICdIYWxmTGlmZUluZm9ybWF0aW9uTm9kZScsIEhhbGZMaWZlSW5mb3JtYXRpb25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEhhbGZMaWZlSW5mb3JtYXRpb25Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBQ2hFLFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBRWhFLE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxVQUFVLE1BQU0sbURBQW1EO0FBQzFFLE9BQU9DLFNBQVMsTUFBTSwyQkFBMkI7QUFDakQsT0FBT0MsWUFBWSxNQUFNLDhCQUE4Qjs7QUFFdkQ7QUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSU4sUUFBUSxDQUFFLEVBQUcsQ0FBQztBQUVyQyxNQUFNTyx1QkFBdUIsU0FBU1YsSUFBSSxDQUFDO0VBRWxDVyxXQUFXQSxDQUFFQyxzQkFBaUQsRUFDeERDLHVC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