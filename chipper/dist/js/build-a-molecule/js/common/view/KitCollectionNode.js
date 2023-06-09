// Copyright 2020-2021, University of Colorado Boulder

/**
 * Contains the kits and atoms in the play area.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import { Node } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import KitNode from './KitNode.js';
import KitPanel from './KitPanel.js';
class KitCollectionNode extends Node {
  /**
   * @param {KitCollection} collection
   * @param {MoleculeCollectingScreenView} view
   * @param {boolean} isCollectingView
   */
  constructor(collection, view, isCollectingView) {
    super();

    // @public {KitPanel} Create a kit panel to contain the kit buckets. Height/Widht are empirically determined
    this.kitPanel = new KitPanel(collection, 655, 148, view, isCollectingView);
    this.kitPanel.bottom = view.layoutBounds.bottom - BAMConstants.VIEW_PADDING;
    this.kitPanel.left = view.layoutBounds.left + BAMConstants.VIEW_PADDING;
    this.addChild(this.kitPanel);

    // Maps kit ID => KitNode
    const kitMap = [];
    collection.kits.forEach(kit => {
      kitMap[kit.id] = new KitNode(kit, view);
    });
  }
}
buildAMolecule.register('KitCollectionNode', KitCollectionNode);
export default KitCollectionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiYnVpbGRBTW9sZWN1bGUiLCJCQU1Db25zdGFudHMiLCJLaXROb2RlIiwiS2l0UGFuZWwiLCJLaXRDb2xsZWN0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwiY29sbGVjdGlvbiIsInZpZXciLCJpc0NvbGxlY3RpbmdWaWV3Iiwia2l0UGFuZWwiLCJib3R0b20iLCJsYXlvdXRCb3VuZHMiLCJWSUVXX1BBRERJTkciLCJsZWZ0IiwiYWRkQ2hpbGQiLCJraXRNYXAiLCJraXRzIiwiZm9yRWFjaCIsImtpdCIsImlkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJLaXRDb2xsZWN0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250YWlucyB0aGUga2l0cyBhbmQgYXRvbXMgaW4gdGhlIHBsYXkgYXJlYS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJ1aWxkQU1vbGVjdWxlIGZyb20gJy4uLy4uL2J1aWxkQU1vbGVjdWxlLmpzJztcclxuaW1wb3J0IEJBTUNvbnN0YW50cyBmcm9tICcuLi9CQU1Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgS2l0Tm9kZSBmcm9tICcuL0tpdE5vZGUuanMnO1xyXG5pbXBvcnQgS2l0UGFuZWwgZnJvbSAnLi9LaXRQYW5lbC5qcyc7XHJcblxyXG5jbGFzcyBLaXRDb2xsZWN0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7S2l0Q29sbGVjdGlvbn0gY29sbGVjdGlvblxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGVDb2xsZWN0aW5nU2NyZWVuVmlld30gdmlld1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDb2xsZWN0aW5nVmlld1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb2xsZWN0aW9uLCB2aWV3LCBpc0NvbGxlY3RpbmdWaWV3ICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtLaXRQYW5lbH0gQ3JlYXRlIGEga2l0IHBhbmVsIHRvIGNvbnRhaW4gdGhlIGtpdCBidWNrZXRzLiBIZWlnaHQvV2lkaHQgYXJlIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgIHRoaXMua2l0UGFuZWwgPSBuZXcgS2l0UGFuZWwoIGNvbGxlY3Rpb24sIDY1NSwgMTQ4LCB2aWV3LCBpc0NvbGxlY3RpbmdWaWV3ICk7XHJcbiAgICB0aGlzLmtpdFBhbmVsLmJvdHRvbSA9IHZpZXcubGF5b3V0Qm91bmRzLmJvdHRvbSAtIEJBTUNvbnN0YW50cy5WSUVXX1BBRERJTkc7XHJcbiAgICB0aGlzLmtpdFBhbmVsLmxlZnQgPSB2aWV3LmxheW91dEJvdW5kcy5sZWZ0ICsgQkFNQ29uc3RhbnRzLlZJRVdfUEFERElORztcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMua2l0UGFuZWwgKTtcclxuXHJcbiAgICAvLyBNYXBzIGtpdCBJRCA9PiBLaXROb2RlXHJcbiAgICBjb25zdCBraXRNYXAgPSBbXTtcclxuICAgIGNvbGxlY3Rpb24ua2l0cy5mb3JFYWNoKCBraXQgPT4ge1xyXG4gICAgICBraXRNYXBbIGtpdC5pZCBdID0gbmV3IEtpdE5vZGUoIGtpdCwgdmlldyApO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTW9sZWN1bGUucmVnaXN0ZXIoICdLaXRDb2xsZWN0aW9uTm9kZScsIEtpdENvbGxlY3Rpb25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEtpdENvbGxlY3Rpb25Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBQzdDLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBRXBDLE1BQU1DLGlCQUFpQixTQUFTTCxJQUFJLENBQUM7RUFDbkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyxVQUFVLEVBQUVDLElBQUksRUFBRUMsZ0JBQWdCLEVBQUc7SUFDaEQsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJTixRQUFRLENBQUVHLFVBQVUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFQyxJQUFJLEVBQUVDLGdCQUFpQixDQUFDO0lBQzVFLElBQUksQ0FBQ0MsUUFBUSxDQUFDQyxNQUFNLEdBQUdILElBQUksQ0FBQ0ksWUFBWSxDQUFDRCxNQUFNLEdBQUdULFlBQVksQ0FBQ1csWUFBWTtJQUMzRSxJQUFJLENBQUNILFFBQVEsQ0FBQ0ksSUFBSSxHQUFHTixJQUFJLENBQUNJLFlBQVksQ0FBQ0UsSUFBSSxHQUFHWixZQUFZLENBQUNXLFlBQVk7SUFDdkUsSUFBSSxDQUFDRSxRQUFRLENBQUUsSUFBSSxDQUFDTCxRQUFTLENBQUM7O0lBRTlCO0lBQ0EsTUFBTU0sTUFBTSxHQUFHLEVBQUU7SUFDakJULFVBQVUsQ0FBQ1UsSUFBSSxDQUFDQyxPQUFPLENBQUVDLEdBQUcsSUFBSTtNQUM5QkgsTUFBTSxDQUFFRyxHQUFHLENBQUNDLEVBQUUsQ0FBRSxHQUFHLElBQUlqQixPQUFPLENBQUVnQixHQUFHLEVBQUVYLElBQUssQ0FBQztJQUM3QyxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFQLGNBQWMsQ0FBQ29CLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRWhCLGlCQUFrQixDQUFDO0FBQ2pFLGVBQWVBLGlCQUFpQiJ9