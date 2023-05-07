// Copyright 2013-2022, University of Colorado Boulder

/**
 * PCl3 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode from './AtomNode.js';
import MoleculeNode from './MoleculeNode.js';
export default class PCl3Node extends MoleculeNode {
  constructor(providedOptions) {
    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const centerNode = new AtomNode(Element.P, atomNodeOptions);
    const leftNode = new AtomNode(Element.Cl, combineOptions({
      centerX: centerNode.left,
      centerY: centerNode.bottom - 0.25 * centerNode.height
    }, atomNodeOptions));
    const rightNode = new AtomNode(Element.Cl, combineOptions({
      centerX: centerNode.right,
      centerY: leftNode.centerY
    }, atomNodeOptions));
    const bottomNode = new AtomNode(Element.Cl, combineOptions({
      centerX: centerNode.centerX,
      centerY: centerNode.bottom
    }, atomNodeOptions));
    const atomNodes = [leftNode, rightNode, centerNode, bottomNode];
    super(atomNodes, providedOptions);
  }
}
nitroglycerin.register('PCl3Node', PCl3Node);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsIkVsZW1lbnQiLCJuaXRyb2dseWNlcmluIiwiQXRvbU5vZGUiLCJNb2xlY3VsZU5vZGUiLCJQQ2wzTm9kZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiYXRvbU5vZGVPcHRpb25zIiwiY2VudGVyTm9kZSIsIlAiLCJsZWZ0Tm9kZSIsIkNsIiwiY2VudGVyWCIsImxlZnQiLCJjZW50ZXJZIiwiYm90dG9tIiwiaGVpZ2h0IiwicmlnaHROb2RlIiwicmlnaHQiLCJib3R0b21Ob2RlIiwiYXRvbU5vZGVzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQQ2wzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQQ2wzIE1vbGVjdWxlXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IEVsZW1lbnQgZnJvbSAnLi4vRWxlbWVudC5qcyc7XHJcbmltcG9ydCBuaXRyb2dseWNlcmluIGZyb20gJy4uL25pdHJvZ2x5Y2VyaW4uanMnO1xyXG5pbXBvcnQgQXRvbU5vZGUsIHsgQXRvbU5vZGVPcHRpb25zIH0gZnJvbSAnLi9BdG9tTm9kZS5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZU5vZGUsIHsgTW9sZWN1bGVOb2RlT3B0aW9ucyB9IGZyb20gJy4vTW9sZWN1bGVOb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBQQ2wzTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE1vbGVjdWxlTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQQ2wzTm9kZSBleHRlbmRzIE1vbGVjdWxlTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUENsM05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IGF0b21Ob2RlT3B0aW9ucyA9IHByb3ZpZGVkT3B0aW9ucz8uYXRvbU5vZGVPcHRpb25zO1xyXG5cclxuICAgIC8vIGF0b21zXHJcbiAgICBjb25zdCBjZW50ZXJOb2RlID0gbmV3IEF0b21Ob2RlKCBFbGVtZW50LlAsIGF0b21Ob2RlT3B0aW9ucyApO1xyXG4gICAgY29uc3QgbGVmdE5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuQ2wsIGNvbWJpbmVPcHRpb25zPEF0b21Ob2RlT3B0aW9ucz4oIHtcclxuICAgICAgY2VudGVyWDogY2VudGVyTm9kZS5sZWZ0LFxyXG4gICAgICBjZW50ZXJZOiBjZW50ZXJOb2RlLmJvdHRvbSAtICggMC4yNSAqIGNlbnRlck5vZGUuaGVpZ2h0IClcclxuICAgIH0sIGF0b21Ob2RlT3B0aW9ucyApICk7XHJcbiAgICBjb25zdCByaWdodE5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuQ2wsIGNvbWJpbmVPcHRpb25zPEF0b21Ob2RlT3B0aW9ucz4oIHtcclxuICAgICAgY2VudGVyWDogY2VudGVyTm9kZS5yaWdodCxcclxuICAgICAgY2VudGVyWTogbGVmdE5vZGUuY2VudGVyWVxyXG4gICAgfSwgYXRvbU5vZGVPcHRpb25zICkgKTtcclxuICAgIGNvbnN0IGJvdHRvbU5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuQ2wsIGNvbWJpbmVPcHRpb25zPEF0b21Ob2RlT3B0aW9ucz4oIHtcclxuICAgICAgY2VudGVyWDogY2VudGVyTm9kZS5jZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZOiBjZW50ZXJOb2RlLmJvdHRvbVxyXG4gICAgfSwgYXRvbU5vZGVPcHRpb25zICkgKTtcclxuXHJcbiAgICBjb25zdCBhdG9tTm9kZXMgPSBbIGxlZnROb2RlLCByaWdodE5vZGUsIGNlbnRlck5vZGUsIGJvdHRvbU5vZGUgXTtcclxuXHJcbiAgICBzdXBlciggYXRvbU5vZGVzLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm5pdHJvZ2x5Y2VyaW4ucmVnaXN0ZXIoICdQQ2wzTm9kZScsIFBDbDNOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLGNBQWMsUUFBMEIsb0NBQW9DO0FBQ3JGLE9BQU9DLE9BQU8sTUFBTSxlQUFlO0FBQ25DLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsUUFBUSxNQUEyQixlQUFlO0FBQ3pELE9BQU9DLFlBQVksTUFBK0IsbUJBQW1CO0FBS3JFLGVBQWUsTUFBTUMsUUFBUSxTQUFTRCxZQUFZLENBQUM7RUFFMUNFLFdBQVdBLENBQUVDLGVBQWlDLEVBQUc7SUFFdEQsTUFBTUMsZUFBZSxHQUFHRCxlQUFlLEVBQUVDLGVBQWU7O0lBRXhEO0lBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUlOLFFBQVEsQ0FBRUYsT0FBTyxDQUFDUyxDQUFDLEVBQUVGLGVBQWdCLENBQUM7SUFDN0QsTUFBTUcsUUFBUSxHQUFHLElBQUlSLFFBQVEsQ0FBRUYsT0FBTyxDQUFDVyxFQUFFLEVBQUVaLGNBQWMsQ0FBbUI7TUFDMUVhLE9BQU8sRUFBRUosVUFBVSxDQUFDSyxJQUFJO01BQ3hCQyxPQUFPLEVBQUVOLFVBQVUsQ0FBQ08sTUFBTSxHQUFLLElBQUksR0FBR1AsVUFBVSxDQUFDUTtJQUNuRCxDQUFDLEVBQUVULGVBQWdCLENBQUUsQ0FBQztJQUN0QixNQUFNVSxTQUFTLEdBQUcsSUFBSWYsUUFBUSxDQUFFRixPQUFPLENBQUNXLEVBQUUsRUFBRVosY0FBYyxDQUFtQjtNQUMzRWEsT0FBTyxFQUFFSixVQUFVLENBQUNVLEtBQUs7TUFDekJKLE9BQU8sRUFBRUosUUFBUSxDQUFDSTtJQUNwQixDQUFDLEVBQUVQLGVBQWdCLENBQUUsQ0FBQztJQUN0QixNQUFNWSxVQUFVLEdBQUcsSUFBSWpCLFFBQVEsQ0FBRUYsT0FBTyxDQUFDVyxFQUFFLEVBQUVaLGNBQWMsQ0FBbUI7TUFDNUVhLE9BQU8sRUFBRUosVUFBVSxDQUFDSSxPQUFPO01BQzNCRSxPQUFPLEVBQUVOLFVBQVUsQ0FBQ087SUFDdEIsQ0FBQyxFQUFFUixlQUFnQixDQUFFLENBQUM7SUFFdEIsTUFBTWEsU0FBUyxHQUFHLENBQUVWLFFBQVEsRUFBRU8sU0FBUyxFQUFFVCxVQUFVLEVBQUVXLFVBQVUsQ0FBRTtJQUVqRSxLQUFLLENBQUVDLFNBQVMsRUFBRWQsZUFBZ0IsQ0FBQztFQUNyQztBQUNGO0FBRUFMLGFBQWEsQ0FBQ29CLFFBQVEsQ0FBRSxVQUFVLEVBQUVqQixRQUFTLENBQUMifQ==