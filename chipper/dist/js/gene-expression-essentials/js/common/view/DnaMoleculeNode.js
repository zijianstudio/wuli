// Copyright 2015-2022, University of Colorado Boulder

/**
 * Class that represents the DNA molecule in the view.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Aadish Gupta
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GeneExpressionEssentialsStrings from '../../GeneExpressionEssentialsStrings.js';
import DnaMoleculeCanvasNode from './DnaMoleculeCanvasNode.js';
import GeneNode from './GeneNode.js';
const geneString = GeneExpressionEssentialsStrings.gene;
class DnaMoleculeNode extends Node {
  /**
   * @param {DnaMolecule} dnaMolecule
   * @param {ModelViewTransform2} modelViewTransform
   * @param {number} backboneStrokeWidth
   * @param {boolean} showGeneBracketLabels
   */
  constructor(dnaMolecule, modelViewTransform, backboneStrokeWidth, showGeneBracketLabels) {
    super();

    // Add the layers onto which the various nodes that represent parts of the dna, the hints, etc. are placed.
    const geneBackgroundLayer = new Node();
    this.addChild(geneBackgroundLayer);

    // Layers for supporting the 3D look by allowing the "twist" to be depicted.
    this.dnaBackboneLayer = new DnaMoleculeCanvasNode(dnaMolecule, modelViewTransform, backboneStrokeWidth, {
      canvasBounds: new Bounds2(dnaMolecule.getLeftEdgeXPosition(), dnaMolecule.getBottomEdgeYPosition() + modelViewTransform.viewToModelDeltaY(10), dnaMolecule.getRightEdgeXPosition(), dnaMolecule.getTopEdgeYPosition() - modelViewTransform.viewToModelDeltaY(10)),
      matrix: modelViewTransform.getMatrix()
    });
    this.addChild(this.dnaBackboneLayer);

    // Put the gene backgrounds and labels behind everything.
    for (let i = 0; i < dnaMolecule.getGenes().length; i++) {
      geneBackgroundLayer.addChild(new GeneNode(modelViewTransform, dnaMolecule.getGenes()[i], dnaMolecule, StringUtils.fillIn(geneString, {
        geneID: i + 1
      }), showGeneBracketLabels));
    }
  }

  /**
   * @public
   */
  step() {
    this.dnaBackboneLayer.step();
  }
}
geneExpressionEssentials.register('DnaMoleculeNode', DnaMoleculeNode);
export default DnaMoleculeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU3RyaW5nVXRpbHMiLCJOb2RlIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncyIsIkRuYU1vbGVjdWxlQ2FudmFzTm9kZSIsIkdlbmVOb2RlIiwiZ2VuZVN0cmluZyIsImdlbmUiLCJEbmFNb2xlY3VsZU5vZGUiLCJjb25zdHJ1Y3RvciIsImRuYU1vbGVjdWxlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiYmFja2JvbmVTdHJva2VXaWR0aCIsInNob3dHZW5lQnJhY2tldExhYmVscyIsImdlbmVCYWNrZ3JvdW5kTGF5ZXIiLCJhZGRDaGlsZCIsImRuYUJhY2tib25lTGF5ZXIiLCJjYW52YXNCb3VuZHMiLCJnZXRMZWZ0RWRnZVhQb3NpdGlvbiIsImdldEJvdHRvbUVkZ2VZUG9zaXRpb24iLCJ2aWV3VG9Nb2RlbERlbHRhWSIsImdldFJpZ2h0RWRnZVhQb3NpdGlvbiIsImdldFRvcEVkZ2VZUG9zaXRpb24iLCJtYXRyaXgiLCJnZXRNYXRyaXgiLCJpIiwiZ2V0R2VuZXMiLCJsZW5ndGgiLCJmaWxsSW4iLCJnZW5lSUQiLCJzdGVwIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEbmFNb2xlY3VsZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ2xhc3MgdGhhdCByZXByZXNlbnRzIHRoZSBETkEgbW9sZWN1bGUgaW4gdGhlIHZpZXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2hhcmZ1ZGVlbiBBc2hyYWZcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcbmltcG9ydCBHZW5lRXhwcmVzc2lvbkVzc2VudGlhbHNTdHJpbmdzIGZyb20gJy4uLy4uL0dlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRG5hTW9sZWN1bGVDYW52YXNOb2RlIGZyb20gJy4vRG5hTW9sZWN1bGVDYW52YXNOb2RlLmpzJztcclxuaW1wb3J0IEdlbmVOb2RlIGZyb20gJy4vR2VuZU5vZGUuanMnO1xyXG5cclxuY29uc3QgZ2VuZVN0cmluZyA9IEdlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3MuZ2VuZTtcclxuXHJcbmNsYXNzIERuYU1vbGVjdWxlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0RuYU1vbGVjdWxlfSBkbmFNb2xlY3VsZVxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJhY2tib25lU3Ryb2tlV2lkdGhcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3dHZW5lQnJhY2tldExhYmVsc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBkbmFNb2xlY3VsZSwgbW9kZWxWaWV3VHJhbnNmb3JtLCBiYWNrYm9uZVN0cm9rZVdpZHRoLCBzaG93R2VuZUJyYWNrZXRMYWJlbHMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbGF5ZXJzIG9udG8gd2hpY2ggdGhlIHZhcmlvdXMgbm9kZXMgdGhhdCByZXByZXNlbnQgcGFydHMgb2YgdGhlIGRuYSwgdGhlIGhpbnRzLCBldGMuIGFyZSBwbGFjZWQuXHJcbiAgICBjb25zdCBnZW5lQmFja2dyb3VuZExheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdlbmVCYWNrZ3JvdW5kTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBMYXllcnMgZm9yIHN1cHBvcnRpbmcgdGhlIDNEIGxvb2sgYnkgYWxsb3dpbmcgdGhlIFwidHdpc3RcIiB0byBiZSBkZXBpY3RlZC5cclxuICAgIHRoaXMuZG5hQmFja2JvbmVMYXllciA9IG5ldyBEbmFNb2xlY3VsZUNhbnZhc05vZGUoIGRuYU1vbGVjdWxlLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGJhY2tib25lU3Ryb2tlV2lkdGgsIHtcclxuICAgICAgY2FudmFzQm91bmRzOiBuZXcgQm91bmRzMihcclxuICAgICAgICBkbmFNb2xlY3VsZS5nZXRMZWZ0RWRnZVhQb3NpdGlvbigpLFxyXG4gICAgICAgIGRuYU1vbGVjdWxlLmdldEJvdHRvbUVkZ2VZUG9zaXRpb24oKSArIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWSggMTAgKSxcclxuICAgICAgICBkbmFNb2xlY3VsZS5nZXRSaWdodEVkZ2VYUG9zaXRpb24oKSxcclxuICAgICAgICBkbmFNb2xlY3VsZS5nZXRUb3BFZGdlWVBvc2l0aW9uKCkgLSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YVkoIDEwIClcclxuICAgICAgKSxcclxuICAgICAgbWF0cml4OiBtb2RlbFZpZXdUcmFuc2Zvcm0uZ2V0TWF0cml4KClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmRuYUJhY2tib25lTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBQdXQgdGhlIGdlbmUgYmFja2dyb3VuZHMgYW5kIGxhYmVscyBiZWhpbmQgZXZlcnl0aGluZy5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGRuYU1vbGVjdWxlLmdldEdlbmVzKCkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGdlbmVCYWNrZ3JvdW5kTGF5ZXIuYWRkQ2hpbGQoIG5ldyBHZW5lTm9kZShcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgZG5hTW9sZWN1bGUuZ2V0R2VuZXMoKVsgaSBdLFxyXG4gICAgICAgIGRuYU1vbGVjdWxlLFxyXG4gICAgICAgIFN0cmluZ1V0aWxzLmZpbGxJbiggZ2VuZVN0cmluZywgeyBnZW5lSUQ6IGkgKyAxIH0gKSxcclxuICAgICAgICBzaG93R2VuZUJyYWNrZXRMYWJlbHNcclxuICAgICAgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoKSB7XHJcbiAgICB0aGlzLmRuYUJhY2tib25lTGF5ZXIuc3RlcCgpO1xyXG4gIH1cclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnRG5hTW9sZWN1bGVOb2RlJywgRG5hTW9sZWN1bGVOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEbmFNb2xlY3VsZU5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyx3QkFBd0IsTUFBTSxtQ0FBbUM7QUFDeEUsT0FBT0MsK0JBQStCLE1BQU0sMENBQTBDO0FBQ3RGLE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0QjtBQUM5RCxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUVwQyxNQUFNQyxVQUFVLEdBQUdILCtCQUErQixDQUFDSSxJQUFJO0FBRXZELE1BQU1DLGVBQWUsU0FBU1AsSUFBSSxDQUFDO0VBRWpDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxXQUFXLEVBQUVDLGtCQUFrQixFQUFFQyxtQkFBbUIsRUFBRUMscUJBQXFCLEVBQUc7SUFDekYsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxJQUFJYixJQUFJLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUNjLFFBQVEsQ0FBRUQsbUJBQW9CLENBQUM7O0lBRXBDO0lBQ0EsSUFBSSxDQUFDRSxnQkFBZ0IsR0FBRyxJQUFJWixxQkFBcUIsQ0FBRU0sV0FBVyxFQUFFQyxrQkFBa0IsRUFBRUMsbUJBQW1CLEVBQUU7TUFDdkdLLFlBQVksRUFBRSxJQUFJbEIsT0FBTyxDQUN2QlcsV0FBVyxDQUFDUSxvQkFBb0IsQ0FBQyxDQUFDLEVBQ2xDUixXQUFXLENBQUNTLHNCQUFzQixDQUFDLENBQUMsR0FBR1Isa0JBQWtCLENBQUNTLGlCQUFpQixDQUFFLEVBQUcsQ0FBQyxFQUNqRlYsV0FBVyxDQUFDVyxxQkFBcUIsQ0FBQyxDQUFDLEVBQ25DWCxXQUFXLENBQUNZLG1CQUFtQixDQUFDLENBQUMsR0FBR1gsa0JBQWtCLENBQUNTLGlCQUFpQixDQUFFLEVBQUcsQ0FDL0UsQ0FBQztNQUNERyxNQUFNLEVBQUVaLGtCQUFrQixDQUFDYSxTQUFTLENBQUM7SUFDdkMsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDVCxRQUFRLENBQUUsSUFBSSxDQUFDQyxnQkFBaUIsQ0FBQzs7SUFFdEM7SUFDQSxLQUFNLElBQUlTLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2YsV0FBVyxDQUFDZ0IsUUFBUSxDQUFDLENBQUMsQ0FBQ0MsTUFBTSxFQUFFRixDQUFDLEVBQUUsRUFBRztNQUN4RFgsbUJBQW1CLENBQUNDLFFBQVEsQ0FBRSxJQUFJVixRQUFRLENBQ3hDTSxrQkFBa0IsRUFDbEJELFdBQVcsQ0FBQ2dCLFFBQVEsQ0FBQyxDQUFDLENBQUVELENBQUMsQ0FBRSxFQUMzQmYsV0FBVyxFQUNYVixXQUFXLENBQUM0QixNQUFNLENBQUV0QixVQUFVLEVBQUU7UUFBRXVCLE1BQU0sRUFBRUosQ0FBQyxHQUFHO01BQUUsQ0FBRSxDQUFDLEVBQ25EWixxQkFDRixDQUFFLENBQUM7SUFDTDtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtFQUNFaUIsSUFBSUEsQ0FBQSxFQUFHO0lBQ0wsSUFBSSxDQUFDZCxnQkFBZ0IsQ0FBQ2MsSUFBSSxDQUFDLENBQUM7RUFDOUI7QUFDRjtBQUVBNUIsd0JBQXdCLENBQUM2QixRQUFRLENBQUUsaUJBQWlCLEVBQUV2QixlQUFnQixDQUFDO0FBRXZFLGVBQWVBLGVBQWUifQ==