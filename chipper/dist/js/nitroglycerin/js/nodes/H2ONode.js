// Copyright 2013-2022, University of Colorado Boulder

/**
 * H2O Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../phet-core/js/merge.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode from './AtomNode.js';
import MoleculeNode from './MoleculeNode.js';
class H2ONode extends MoleculeNode {
  constructor(providedOptions) {
    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const bigNode = new AtomNode(Element.O, atomNodeOptions);
    const smallLeftNode = new AtomNode(Element.H, merge({
      centerX: bigNode.left,
      centerY: bigNode.bottom - 0.25 * bigNode.height
    }, atomNodeOptions));
    const smallRightNode = new AtomNode(Element.H, merge({
      centerX: bigNode.right,
      centerY: smallLeftNode.centerY
    }, atomNodeOptions));
    const atomNodes = [bigNode, smallLeftNode, smallRightNode];
    super(atomNodes, providedOptions);
  }
}
nitroglycerin.register('H2ONode', H2ONode);
export default H2ONode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkVsZW1lbnQiLCJuaXRyb2dseWNlcmluIiwiQXRvbU5vZGUiLCJNb2xlY3VsZU5vZGUiLCJIMk9Ob2RlIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJhdG9tTm9kZU9wdGlvbnMiLCJiaWdOb2RlIiwiTyIsInNtYWxsTGVmdE5vZGUiLCJIIiwiY2VudGVyWCIsImxlZnQiLCJjZW50ZXJZIiwiYm90dG9tIiwiaGVpZ2h0Iiwic21hbGxSaWdodE5vZGUiLCJyaWdodCIsImF0b21Ob2RlcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSDJPTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIMk8gTW9sZWN1bGVcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuLi9FbGVtZW50LmpzJztcclxuaW1wb3J0IG5pdHJvZ2x5Y2VyaW4gZnJvbSAnLi4vbml0cm9nbHljZXJpbi5qcyc7XHJcbmltcG9ydCBBdG9tTm9kZSBmcm9tICcuL0F0b21Ob2RlLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlTm9kZSwgeyBNb2xlY3VsZU5vZGVPcHRpb25zIH0gZnJvbSAnLi9Nb2xlY3VsZU5vZGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIEgyT05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBNb2xlY3VsZU5vZGVPcHRpb25zO1xyXG5cclxuY2xhc3MgSDJPTm9kZSBleHRlbmRzIE1vbGVjdWxlTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogSDJPTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgYXRvbU5vZGVPcHRpb25zID0gcHJvdmlkZWRPcHRpb25zPy5hdG9tTm9kZU9wdGlvbnM7XHJcblxyXG4gICAgLy8gYXRvbXNcclxuICAgIGNvbnN0IGJpZ05vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuTywgYXRvbU5vZGVPcHRpb25zICk7XHJcbiAgICBjb25zdCBzbWFsbExlZnROb2RlID0gbmV3IEF0b21Ob2RlKCBFbGVtZW50LkgsIG1lcmdlKCB7XHJcbiAgICAgIGNlbnRlclg6IGJpZ05vZGUubGVmdCxcclxuICAgICAgY2VudGVyWTogYmlnTm9kZS5ib3R0b20gLSAoIDAuMjUgKiBiaWdOb2RlLmhlaWdodCApXHJcbiAgICB9LCBhdG9tTm9kZU9wdGlvbnMgKSApO1xyXG4gICAgY29uc3Qgc21hbGxSaWdodE5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuSCwgbWVyZ2UoIHtcclxuICAgICAgY2VudGVyWDogYmlnTm9kZS5yaWdodCxcclxuICAgICAgY2VudGVyWTogc21hbGxMZWZ0Tm9kZS5jZW50ZXJZXHJcbiAgICB9LCBhdG9tTm9kZU9wdGlvbnMgKSApO1xyXG5cclxuICAgIGNvbnN0IGF0b21Ob2RlcyA9IFsgYmlnTm9kZSwgc21hbGxMZWZ0Tm9kZSwgc21hbGxSaWdodE5vZGUgXTtcclxuXHJcbiAgICBzdXBlciggYXRvbU5vZGVzLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm5pdHJvZ2x5Y2VyaW4ucmVnaXN0ZXIoICdIMk9Ob2RlJywgSDJPTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBIMk9Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sZ0NBQWdDO0FBRWxELE9BQU9DLE9BQU8sTUFBTSxlQUFlO0FBQ25DLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsWUFBWSxNQUErQixtQkFBbUI7QUFLckUsTUFBTUMsT0FBTyxTQUFTRCxZQUFZLENBQUM7RUFFMUJFLFdBQVdBLENBQUVDLGVBQWdDLEVBQUc7SUFFckQsTUFBTUMsZUFBZSxHQUFHRCxlQUFlLEVBQUVDLGVBQWU7O0lBRXhEO0lBQ0EsTUFBTUMsT0FBTyxHQUFHLElBQUlOLFFBQVEsQ0FBRUYsT0FBTyxDQUFDUyxDQUFDLEVBQUVGLGVBQWdCLENBQUM7SUFDMUQsTUFBTUcsYUFBYSxHQUFHLElBQUlSLFFBQVEsQ0FBRUYsT0FBTyxDQUFDVyxDQUFDLEVBQUVaLEtBQUssQ0FBRTtNQUNwRGEsT0FBTyxFQUFFSixPQUFPLENBQUNLLElBQUk7TUFDckJDLE9BQU8sRUFBRU4sT0FBTyxDQUFDTyxNQUFNLEdBQUssSUFBSSxHQUFHUCxPQUFPLENBQUNRO0lBQzdDLENBQUMsRUFBRVQsZUFBZ0IsQ0FBRSxDQUFDO0lBQ3RCLE1BQU1VLGNBQWMsR0FBRyxJQUFJZixRQUFRLENBQUVGLE9BQU8sQ0FBQ1csQ0FBQyxFQUFFWixLQUFLLENBQUU7TUFDckRhLE9BQU8sRUFBRUosT0FBTyxDQUFDVSxLQUFLO01BQ3RCSixPQUFPLEVBQUVKLGFBQWEsQ0FBQ0k7SUFDekIsQ0FBQyxFQUFFUCxlQUFnQixDQUFFLENBQUM7SUFFdEIsTUFBTVksU0FBUyxHQUFHLENBQUVYLE9BQU8sRUFBRUUsYUFBYSxFQUFFTyxjQUFjLENBQUU7SUFFNUQsS0FBSyxDQUFFRSxTQUFTLEVBQUViLGVBQWdCLENBQUM7RUFDckM7QUFDRjtBQUVBTCxhQUFhLENBQUNtQixRQUFRLENBQUUsU0FBUyxFQUFFaEIsT0FBUSxDQUFDO0FBQzVDLGVBQWVBLE9BQU8ifQ==