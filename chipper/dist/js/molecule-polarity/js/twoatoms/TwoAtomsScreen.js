// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Two Atoms' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import optionize from '../../../phet-core/js/optionize.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import ShadedSphereNode from '../../../scenery-phet/js/ShadedSphereNode.js';
import { Line, Node, Rectangle, Text } from '../../../scenery/js/imports.js';
import MPColors from '../common/MPColors.js';
import moleculePolarity from '../moleculePolarity.js';
import MoleculePolarityStrings from '../MoleculePolarityStrings.js';
import TwoAtomsModel from './model/TwoAtomsModel.js';
import TwoAtomsScreenView from './view/TwoAtomsScreenView.js';
export default class TwoAtomsScreen extends Screen {
  constructor(providedOptions) {
    const options = optionize()({
      // ScreenOptions
      name: MoleculePolarityStrings.screen.twoAtomsStringProperty,
      backgroundColorProperty: new Property(MPColors.SCREEN_BACKGROUND),
      homeScreenIcon: createScreenIcon()
    }, providedOptions);
    super(() => new TwoAtomsModel({
      tandem: options.tandem.createTandem('model')
    }), model => new TwoAtomsScreenView(model, {
      tandem: options.tandem.createTandem('view')
    }), options);
  }
}

/**
 * Creates the icon for this screen, a diatomic molecule with atoms 'A' and 'B'.
 */
function createScreenIcon() {
  const atomDiameter = 225;
  const bondLength = 1.15 * atomDiameter;
  const bondWidth = 0.15 * atomDiameter;
  const font = new PhetFont({
    size: 94,
    weight: 'bold'
  });
  const background = new Rectangle(0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
    fill: MPColors.SCREEN_BACKGROUND
  });
  const bond = new Line(0, 0, bondLength, 0, {
    stroke: MPColors.BOND,
    lineWidth: bondWidth,
    center: background.center
  });
  const atomA = new ShadedSphereNode(atomDiameter, {
    mainColor: MPColors.ATOM_A,
    centerX: bond.left,
    y: bond.centerY
  });
  const atomB = new ShadedSphereNode(atomDiameter, {
    mainColor: MPColors.ATOM_B,
    centerX: bond.right,
    y: bond.centerY
  });
  const textMaxWidth = 0.65 * atomDiameter;
  const textA = new Text(MoleculePolarityStrings.atomAStringProperty, {
    font: font,
    maxWidth: textMaxWidth
  });
  const textB = new Text(MoleculePolarityStrings.atomBStringProperty, {
    font: font,
    maxWidth: textMaxWidth
  });
  const iconNode = new Node({
    children: [background, bond, atomA, atomB, textA, textB]
  });
  textA.boundsProperty.link(bounds => {
    textA.center = atomA.center;
  });
  textB.boundsProperty.link(bounds => {
    textB.center = atomB.center;
  });
  return new ScreenIcon(iconNode, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1
  });
}
moleculePolarity.register('TwoAtomsScreen', TwoAtomsScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJvcHRpb25pemUiLCJQaGV0Rm9udCIsIlNoYWRlZFNwaGVyZU5vZGUiLCJMaW5lIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJNUENvbG9ycyIsIm1vbGVjdWxlUG9sYXJpdHkiLCJNb2xlY3VsZVBvbGFyaXR5U3RyaW5ncyIsIlR3b0F0b21zTW9kZWwiLCJUd29BdG9tc1NjcmVlblZpZXciLCJUd29BdG9tc1NjcmVlbiIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJ0d29BdG9tc1N0cmluZ1Byb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJTQ1JFRU5fQkFDS0dST1VORCIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlU2NyZWVuSWNvbiIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm1vZGVsIiwiYXRvbURpYW1ldGVyIiwiYm9uZExlbmd0aCIsImJvbmRXaWR0aCIsImZvbnQiLCJzaXplIiwid2VpZ2h0IiwiYmFja2dyb3VuZCIsIk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFIiwid2lkdGgiLCJoZWlnaHQiLCJmaWxsIiwiYm9uZCIsInN0cm9rZSIsIkJPTkQiLCJsaW5lV2lkdGgiLCJjZW50ZXIiLCJhdG9tQSIsIm1haW5Db2xvciIsIkFUT01fQSIsImNlbnRlclgiLCJsZWZ0IiwieSIsImNlbnRlclkiLCJhdG9tQiIsIkFUT01fQiIsInJpZ2h0IiwidGV4dE1heFdpZHRoIiwidGV4dEEiLCJhdG9tQVN0cmluZ1Byb3BlcnR5IiwibWF4V2lkdGgiLCJ0ZXh0QiIsImF0b21CU3RyaW5nUHJvcGVydHkiLCJpY29uTm9kZSIsImNoaWxkcmVuIiwiYm91bmRzUHJvcGVydHkiLCJsaW5rIiwiYm91bmRzIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUd29BdG9tc1NjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgJ1R3byBBdG9tcycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiwgeyBTY3JlZW5PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFNoYWRlZFNwaGVyZU5vZGUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1NoYWRlZFNwaGVyZU5vZGUuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTVBDb2xvcnMgZnJvbSAnLi4vY29tbW9uL01QQ29sb3JzLmpzJztcclxuaW1wb3J0IG1vbGVjdWxlUG9sYXJpdHkgZnJvbSAnLi4vbW9sZWN1bGVQb2xhcml0eS5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVBvbGFyaXR5U3RyaW5ncyBmcm9tICcuLi9Nb2xlY3VsZVBvbGFyaXR5U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBUd29BdG9tc01vZGVsIGZyb20gJy4vbW9kZWwvVHdvQXRvbXNNb2RlbC5qcyc7XHJcbmltcG9ydCBUd29BdG9tc1NjcmVlblZpZXcgZnJvbSAnLi92aWV3L1R3b0F0b21zU2NyZWVuVmlldy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgVHdvQXRvbXNTY3JlZW5PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8U2NyZWVuT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHdvQXRvbXNTY3JlZW4gZXh0ZW5kcyBTY3JlZW48VHdvQXRvbXNNb2RlbCwgVHdvQXRvbXNTY3JlZW5WaWV3PiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBUd29BdG9tc1NjcmVlbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUd29BdG9tc1NjcmVlbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTY3JlZW5PcHRpb25zXHJcbiAgICAgIG5hbWU6IE1vbGVjdWxlUG9sYXJpdHlTdHJpbmdzLnNjcmVlbi50d29BdG9tc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBNUENvbG9ycy5TQ1JFRU5fQkFDS0dST1VORCApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogY3JlYXRlU2NyZWVuSWNvbigpXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IFR3b0F0b21zTW9kZWwoIHsgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSB9ICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBUd29BdG9tc1NjcmVlblZpZXcoIG1vZGVsLCB7IHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSB9ICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgdGhpcyBzY3JlZW4sIGEgZGlhdG9taWMgbW9sZWN1bGUgd2l0aCBhdG9tcyAnQScgYW5kICdCJy5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVNjcmVlbkljb24oKTogU2NyZWVuSWNvbiB7XHJcblxyXG4gIGNvbnN0IGF0b21EaWFtZXRlciA9IDIyNTtcclxuICBjb25zdCBib25kTGVuZ3RoID0gMS4xNSAqIGF0b21EaWFtZXRlcjtcclxuICBjb25zdCBib25kV2lkdGggPSAwLjE1ICogYXRvbURpYW1ldGVyO1xyXG4gIGNvbnN0IGZvbnQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogOTQsIHdlaWdodDogJ2JvbGQnIH0gKTtcclxuXHJcbiAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsXHJcbiAgICBTY3JlZW4uTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGgsIFNjcmVlbi5NSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQsXHJcbiAgICB7IGZpbGw6IE1QQ29sb3JzLlNDUkVFTl9CQUNLR1JPVU5EIH0gKTtcclxuXHJcbiAgY29uc3QgYm9uZCA9IG5ldyBMaW5lKCAwLCAwLCBib25kTGVuZ3RoLCAwLCB7XHJcbiAgICBzdHJva2U6IE1QQ29sb3JzLkJPTkQsXHJcbiAgICBsaW5lV2lkdGg6IGJvbmRXaWR0aCxcclxuICAgIGNlbnRlcjogYmFja2dyb3VuZC5jZW50ZXJcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGF0b21BID0gbmV3IFNoYWRlZFNwaGVyZU5vZGUoIGF0b21EaWFtZXRlciwge1xyXG4gICAgbWFpbkNvbG9yOiBNUENvbG9ycy5BVE9NX0EsXHJcbiAgICBjZW50ZXJYOiBib25kLmxlZnQsXHJcbiAgICB5OiBib25kLmNlbnRlcllcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGF0b21CID0gbmV3IFNoYWRlZFNwaGVyZU5vZGUoIGF0b21EaWFtZXRlciwge1xyXG4gICAgbWFpbkNvbG9yOiBNUENvbG9ycy5BVE9NX0IsXHJcbiAgICBjZW50ZXJYOiBib25kLnJpZ2h0LFxyXG4gICAgeTogYm9uZC5jZW50ZXJZXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCB0ZXh0TWF4V2lkdGggPSAwLjY1ICogYXRvbURpYW1ldGVyO1xyXG5cclxuICBjb25zdCB0ZXh0QSA9IG5ldyBUZXh0KCBNb2xlY3VsZVBvbGFyaXR5U3RyaW5ncy5hdG9tQVN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICBmb250OiBmb250LFxyXG4gICAgbWF4V2lkdGg6IHRleHRNYXhXaWR0aFxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgdGV4dEIgPSBuZXcgVGV4dCggTW9sZWN1bGVQb2xhcml0eVN0cmluZ3MuYXRvbUJTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgZm9udDogZm9udCxcclxuICAgIG1heFdpZHRoOiB0ZXh0TWF4V2lkdGhcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGljb25Ob2RlID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYmFja2dyb3VuZCwgYm9uZCwgYXRvbUEsIGF0b21CLCB0ZXh0QSwgdGV4dEIgXSB9ICk7XHJcblxyXG4gIHRleHRBLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICB0ZXh0QS5jZW50ZXIgPSBhdG9tQS5jZW50ZXI7XHJcbiAgfSApO1xyXG5cclxuICB0ZXh0Qi5ib3VuZHNQcm9wZXJ0eS5saW5rKCBib3VuZHMgPT4ge1xyXG4gICAgdGV4dEIuY2VudGVyID0gYXRvbUIuY2VudGVyO1xyXG4gIH0gKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBTY3JlZW5JY29uKCBpY29uTm9kZSwge1xyXG4gICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgfSApO1xyXG59XHJcblxyXG5tb2xlY3VsZVBvbGFyaXR5LnJlZ2lzdGVyKCAnVHdvQXRvbXNTY3JlZW4nLCBUd29BdG9tc1NjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBeUIsNkJBQTZCO0FBQ25FLE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0MsU0FBUyxNQUE0QixvQ0FBb0M7QUFFaEYsT0FBT0MsUUFBUSxNQUFNLHNDQUFzQztBQUMzRCxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFDM0UsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLGdDQUFnQztBQUM1RSxPQUFPQyxRQUFRLE1BQU0sdUJBQXVCO0FBQzVDLE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUNyRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0MsYUFBYSxNQUFNLDBCQUEwQjtBQUNwRCxPQUFPQyxrQkFBa0IsTUFBTSw4QkFBOEI7QUFNN0QsZUFBZSxNQUFNQyxjQUFjLFNBQVNkLE1BQU0sQ0FBb0M7RUFFN0VlLFdBQVdBLENBQUVDLGVBQXNDLEVBQUc7SUFFM0QsTUFBTUMsT0FBTyxHQUFHZixTQUFTLENBQW9ELENBQUMsQ0FBRTtNQUU5RTtNQUNBZ0IsSUFBSSxFQUFFUCx1QkFBdUIsQ0FBQ1EsTUFBTSxDQUFDQyxzQkFBc0I7TUFDM0RDLHVCQUF1QixFQUFFLElBQUl0QixRQUFRLENBQUVVLFFBQVEsQ0FBQ2EsaUJBQWtCLENBQUM7TUFDbkVDLGNBQWMsRUFBRUMsZ0JBQWdCLENBQUM7SUFDbkMsQ0FBQyxFQUFFUixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FDSCxNQUFNLElBQUlKLGFBQWEsQ0FBRTtNQUFFYSxNQUFNLEVBQUVSLE9BQU8sQ0FBQ1EsTUFBTSxDQUFDQyxZQUFZLENBQUUsT0FBUTtJQUFFLENBQUUsQ0FBQyxFQUM3RUMsS0FBSyxJQUFJLElBQUlkLGtCQUFrQixDQUFFYyxLQUFLLEVBQUU7TUFBRUYsTUFBTSxFQUFFUixPQUFPLENBQUNRLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLE1BQU87SUFBRSxDQUFFLENBQUMsRUFDM0ZULE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBU08sZ0JBQWdCQSxDQUFBLEVBQWU7RUFFdEMsTUFBTUksWUFBWSxHQUFHLEdBQUc7RUFDeEIsTUFBTUMsVUFBVSxHQUFHLElBQUksR0FBR0QsWUFBWTtFQUN0QyxNQUFNRSxTQUFTLEdBQUcsSUFBSSxHQUFHRixZQUFZO0VBQ3JDLE1BQU1HLElBQUksR0FBRyxJQUFJNUIsUUFBUSxDQUFFO0lBQUU2QixJQUFJLEVBQUUsRUFBRTtJQUFFQyxNQUFNLEVBQUU7RUFBTyxDQUFFLENBQUM7RUFFekQsTUFBTUMsVUFBVSxHQUFHLElBQUkzQixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFDcENQLE1BQU0sQ0FBQ21DLDZCQUE2QixDQUFDQyxLQUFLLEVBQUVwQyxNQUFNLENBQUNtQyw2QkFBNkIsQ0FBQ0UsTUFBTSxFQUN2RjtJQUFFQyxJQUFJLEVBQUU3QixRQUFRLENBQUNhO0VBQWtCLENBQUUsQ0FBQztFQUV4QyxNQUFNaUIsSUFBSSxHQUFHLElBQUlsQyxJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRXdCLFVBQVUsRUFBRSxDQUFDLEVBQUU7SUFDMUNXLE1BQU0sRUFBRS9CLFFBQVEsQ0FBQ2dDLElBQUk7SUFDckJDLFNBQVMsRUFBRVosU0FBUztJQUNwQmEsTUFBTSxFQUFFVCxVQUFVLENBQUNTO0VBQ3JCLENBQUUsQ0FBQztFQUVILE1BQU1DLEtBQUssR0FBRyxJQUFJeEMsZ0JBQWdCLENBQUV3QixZQUFZLEVBQUU7SUFDaERpQixTQUFTLEVBQUVwQyxRQUFRLENBQUNxQyxNQUFNO0lBQzFCQyxPQUFPLEVBQUVSLElBQUksQ0FBQ1MsSUFBSTtJQUNsQkMsQ0FBQyxFQUFFVixJQUFJLENBQUNXO0VBQ1YsQ0FBRSxDQUFDO0VBRUgsTUFBTUMsS0FBSyxHQUFHLElBQUkvQyxnQkFBZ0IsQ0FBRXdCLFlBQVksRUFBRTtJQUNoRGlCLFNBQVMsRUFBRXBDLFFBQVEsQ0FBQzJDLE1BQU07SUFDMUJMLE9BQU8sRUFBRVIsSUFBSSxDQUFDYyxLQUFLO0lBQ25CSixDQUFDLEVBQUVWLElBQUksQ0FBQ1c7RUFDVixDQUFFLENBQUM7RUFFSCxNQUFNSSxZQUFZLEdBQUcsSUFBSSxHQUFHMUIsWUFBWTtFQUV4QyxNQUFNMkIsS0FBSyxHQUFHLElBQUkvQyxJQUFJLENBQUVHLHVCQUF1QixDQUFDNkMsbUJBQW1CLEVBQUU7SUFDbkV6QixJQUFJLEVBQUVBLElBQUk7SUFDVjBCLFFBQVEsRUFBRUg7RUFDWixDQUFFLENBQUM7RUFFSCxNQUFNSSxLQUFLLEdBQUcsSUFBSWxELElBQUksQ0FBRUcsdUJBQXVCLENBQUNnRCxtQkFBbUIsRUFBRTtJQUNuRTVCLElBQUksRUFBRUEsSUFBSTtJQUNWMEIsUUFBUSxFQUFFSDtFQUNaLENBQUUsQ0FBQztFQUVILE1BQU1NLFFBQVEsR0FBRyxJQUFJdEQsSUFBSSxDQUFFO0lBQUV1RCxRQUFRLEVBQUUsQ0FBRTNCLFVBQVUsRUFBRUssSUFBSSxFQUFFSyxLQUFLLEVBQUVPLEtBQUssRUFBRUksS0FBSyxFQUFFRyxLQUFLO0VBQUcsQ0FBRSxDQUFDO0VBRTNGSCxLQUFLLENBQUNPLGNBQWMsQ0FBQ0MsSUFBSSxDQUFFQyxNQUFNLElBQUk7SUFDbkNULEtBQUssQ0FBQ1osTUFBTSxHQUFHQyxLQUFLLENBQUNELE1BQU07RUFDN0IsQ0FBRSxDQUFDO0VBRUhlLEtBQUssQ0FBQ0ksY0FBYyxDQUFDQyxJQUFJLENBQUVDLE1BQU0sSUFBSTtJQUNuQ04sS0FBSyxDQUFDZixNQUFNLEdBQUdRLEtBQUssQ0FBQ1IsTUFBTTtFQUM3QixDQUFFLENBQUM7RUFFSCxPQUFPLElBQUkxQyxVQUFVLENBQUUyRCxRQUFRLEVBQUU7SUFDL0JLLHNCQUFzQixFQUFFLENBQUM7SUFDekJDLHVCQUF1QixFQUFFO0VBQzNCLENBQUUsQ0FBQztBQUNMO0FBRUF4RCxnQkFBZ0IsQ0FBQ3lELFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXJELGNBQWUsQ0FBQyJ9