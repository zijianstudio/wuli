// Copyright 2013-2022, University of Colorado Boulder

/**
 * PF3 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode from './AtomNode.js';
import MoleculeNode from './MoleculeNode.js';
export default class PF3Node extends MoleculeNode {
  constructor(providedOptions) {
    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const centerNode = new AtomNode(Element.P, atomNodeOptions);
    const leftNode = new AtomNode(Element.F, combineOptions({
      centerX: centerNode.left,
      centerY: centerNode.bottom - 0.25 * centerNode.height
    }, atomNodeOptions));
    const rightNode = new AtomNode(Element.F, combineOptions({
      centerX: centerNode.right,
      centerY: leftNode.centerY
    }, atomNodeOptions));
    const bottomNode = new AtomNode(Element.F, combineOptions({
      centerX: centerNode.centerX,
      centerY: centerNode.bottom
    }, atomNodeOptions));
    const atomNodes = [leftNode, rightNode, centerNode, bottomNode];
    super(atomNodes, providedOptions);
  }
}
nitroglycerin.register('PF3Node', PF3Node);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsIkVsZW1lbnQiLCJuaXRyb2dseWNlcmluIiwiQXRvbU5vZGUiLCJNb2xlY3VsZU5vZGUiLCJQRjNOb2RlIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJhdG9tTm9kZU9wdGlvbnMiLCJjZW50ZXJOb2RlIiwiUCIsImxlZnROb2RlIiwiRiIsImNlbnRlclgiLCJsZWZ0IiwiY2VudGVyWSIsImJvdHRvbSIsImhlaWdodCIsInJpZ2h0Tm9kZSIsInJpZ2h0IiwiYm90dG9tTm9kZSIsImF0b21Ob2RlcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUEYzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQRjMgTW9sZWN1bGVcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuLi9FbGVtZW50LmpzJztcclxuaW1wb3J0IG5pdHJvZ2x5Y2VyaW4gZnJvbSAnLi4vbml0cm9nbHljZXJpbi5qcyc7XHJcbmltcG9ydCBBdG9tTm9kZSwgeyBBdG9tTm9kZU9wdGlvbnMgfSBmcm9tICcuL0F0b21Ob2RlLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlTm9kZSwgeyBNb2xlY3VsZU5vZGVPcHRpb25zIH0gZnJvbSAnLi9Nb2xlY3VsZU5vZGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIFBGM05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBNb2xlY3VsZU5vZGVPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUEYzTm9kZSBleHRlbmRzIE1vbGVjdWxlTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUEYzTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgYXRvbU5vZGVPcHRpb25zID0gcHJvdmlkZWRPcHRpb25zPy5hdG9tTm9kZU9wdGlvbnM7XHJcblxyXG4gICAgLy8gYXRvbXNcclxuICAgIGNvbnN0IGNlbnRlck5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuUCwgYXRvbU5vZGVPcHRpb25zICk7XHJcbiAgICBjb25zdCBsZWZ0Tm9kZSA9IG5ldyBBdG9tTm9kZSggRWxlbWVudC5GLCBjb21iaW5lT3B0aW9uczxBdG9tTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgIGNlbnRlclg6IGNlbnRlck5vZGUubGVmdCxcclxuICAgICAgY2VudGVyWTogY2VudGVyTm9kZS5ib3R0b20gLSAoIDAuMjUgKiBjZW50ZXJOb2RlLmhlaWdodCApXHJcbiAgICB9LCBhdG9tTm9kZU9wdGlvbnMgKSApO1xyXG4gICAgY29uc3QgcmlnaHROb2RlID0gbmV3IEF0b21Ob2RlKCBFbGVtZW50LkYsIGNvbWJpbmVPcHRpb25zPEF0b21Ob2RlT3B0aW9ucz4oIHtcclxuICAgICAgY2VudGVyWDogY2VudGVyTm9kZS5yaWdodCxcclxuICAgICAgY2VudGVyWTogbGVmdE5vZGUuY2VudGVyWVxyXG4gICAgfSwgYXRvbU5vZGVPcHRpb25zICkgKTtcclxuICAgIGNvbnN0IGJvdHRvbU5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuRiwgY29tYmluZU9wdGlvbnM8QXRvbU5vZGVPcHRpb25zPigge1xyXG4gICAgICBjZW50ZXJYOiBjZW50ZXJOb2RlLmNlbnRlclgsXHJcbiAgICAgIGNlbnRlclk6IGNlbnRlck5vZGUuYm90dG9tXHJcbiAgICB9LCBhdG9tTm9kZU9wdGlvbnMgKSApO1xyXG5cclxuICAgIGNvbnN0IGF0b21Ob2RlcyA9IFsgbGVmdE5vZGUsIHJpZ2h0Tm9kZSwgY2VudGVyTm9kZSwgYm90dG9tTm9kZSBdO1xyXG5cclxuICAgIHN1cGVyKCBhdG9tTm9kZXMsIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxubml0cm9nbHljZXJpbi5yZWdpc3RlciggJ1BGM05vZGUnLCBQRjNOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLGNBQWMsUUFBMEIsb0NBQW9DO0FBQ3JGLE9BQU9DLE9BQU8sTUFBTSxlQUFlO0FBQ25DLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsUUFBUSxNQUEyQixlQUFlO0FBQ3pELE9BQU9DLFlBQVksTUFBK0IsbUJBQW1CO0FBS3JFLGVBQWUsTUFBTUMsT0FBTyxTQUFTRCxZQUFZLENBQUM7RUFFekNFLFdBQVdBLENBQUVDLGVBQWdDLEVBQUc7SUFFckQsTUFBTUMsZUFBZSxHQUFHRCxlQUFlLEVBQUVDLGVBQWU7O0lBRXhEO0lBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUlOLFFBQVEsQ0FBRUYsT0FBTyxDQUFDUyxDQUFDLEVBQUVGLGVBQWdCLENBQUM7SUFDN0QsTUFBTUcsUUFBUSxHQUFHLElBQUlSLFFBQVEsQ0FBRUYsT0FBTyxDQUFDVyxDQUFDLEVBQUVaLGNBQWMsQ0FBbUI7TUFDekVhLE9BQU8sRUFBRUosVUFBVSxDQUFDSyxJQUFJO01BQ3hCQyxPQUFPLEVBQUVOLFVBQVUsQ0FBQ08sTUFBTSxHQUFLLElBQUksR0FBR1AsVUFBVSxDQUFDUTtJQUNuRCxDQUFDLEVBQUVULGVBQWdCLENBQUUsQ0FBQztJQUN0QixNQUFNVSxTQUFTLEdBQUcsSUFBSWYsUUFBUSxDQUFFRixPQUFPLENBQUNXLENBQUMsRUFBRVosY0FBYyxDQUFtQjtNQUMxRWEsT0FBTyxFQUFFSixVQUFVLENBQUNVLEtBQUs7TUFDekJKLE9BQU8sRUFBRUosUUFBUSxDQUFDSTtJQUNwQixDQUFDLEVBQUVQLGVBQWdCLENBQUUsQ0FBQztJQUN0QixNQUFNWSxVQUFVLEdBQUcsSUFBSWpCLFFBQVEsQ0FBRUYsT0FBTyxDQUFDVyxDQUFDLEVBQUVaLGNBQWMsQ0FBbUI7TUFDM0VhLE9BQU8sRUFBRUosVUFBVSxDQUFDSSxPQUFPO01BQzNCRSxPQUFPLEVBQUVOLFVBQVUsQ0FBQ087SUFDdEIsQ0FBQyxFQUFFUixlQUFnQixDQUFFLENBQUM7SUFFdEIsTUFBTWEsU0FBUyxHQUFHLENBQUVWLFFBQVEsRUFBRU8sU0FBUyxFQUFFVCxVQUFVLEVBQUVXLFVBQVUsQ0FBRTtJQUVqRSxLQUFLLENBQUVDLFNBQVMsRUFBRWQsZUFBZ0IsQ0FBQztFQUNyQztBQUNGO0FBRUFMLGFBQWEsQ0FBQ29CLFFBQVEsQ0FBRSxTQUFTLEVBQUVqQixPQUFRLENBQUMifQ==