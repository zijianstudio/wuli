// Copyright 2013-2022, University of Colorado Boulder

/**
 * C2H4 Molecule
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { combineOptions } from '../../../phet-core/js/optionize.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';
import AtomNode from './AtomNode.js';
import MoleculeNode from './MoleculeNode.js';
export default class C2H4Node extends MoleculeNode {
  constructor(providedOptions) {
    const atomNodeOptions = providedOptions?.atomNodeOptions;

    // atoms
    const bigLeftNode = new AtomNode(Element.C, atomNodeOptions);
    const smallOffset = 0.165 * bigLeftNode.width;
    const bigRightNode = new AtomNode(Element.C, combineOptions({
      left: bigLeftNode.centerX + 0.25 * bigLeftNode.width,
      centerY: bigLeftNode.centerY
    }, atomNodeOptions));
    const smallTopLeftNode = new AtomNode(Element.H, combineOptions({
      centerX: bigLeftNode.left + smallOffset,
      centerY: bigLeftNode.top + smallOffset
    }, atomNodeOptions));
    const smallTopRightNode = new AtomNode(Element.H, combineOptions({
      centerX: bigRightNode.right - smallOffset,
      centerY: bigRightNode.top + smallOffset
    }, atomNodeOptions));
    const smallBottomLeftNode = new AtomNode(Element.H, combineOptions({
      centerX: bigLeftNode.left + smallOffset,
      centerY: bigLeftNode.bottom - smallOffset
    }, atomNodeOptions));
    const smallBottomRightNode = new AtomNode(Element.H, combineOptions({
      centerX: bigRightNode.right - smallOffset,
      centerY: bigRightNode.bottom - smallOffset
    }, atomNodeOptions));
    const atomNodes = [smallTopRightNode, smallTopLeftNode, bigLeftNode, bigRightNode, smallBottomLeftNode, smallBottomRightNode];
    super(atomNodes, providedOptions);
  }
}
nitroglycerin.register('C2H4Node', C2H4Node);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsIkVsZW1lbnQiLCJuaXRyb2dseWNlcmluIiwiQXRvbU5vZGUiLCJNb2xlY3VsZU5vZGUiLCJDMkg0Tm9kZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiYXRvbU5vZGVPcHRpb25zIiwiYmlnTGVmdE5vZGUiLCJDIiwic21hbGxPZmZzZXQiLCJ3aWR0aCIsImJpZ1JpZ2h0Tm9kZSIsImxlZnQiLCJjZW50ZXJYIiwiY2VudGVyWSIsInNtYWxsVG9wTGVmdE5vZGUiLCJIIiwidG9wIiwic21hbGxUb3BSaWdodE5vZGUiLCJyaWdodCIsInNtYWxsQm90dG9tTGVmdE5vZGUiLCJib3R0b20iLCJzbWFsbEJvdHRvbVJpZ2h0Tm9kZSIsImF0b21Ob2RlcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQzJINE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQzJINCBNb2xlY3VsZVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBFbGVtZW50IGZyb20gJy4uL0VsZW1lbnQuanMnO1xyXG5pbXBvcnQgbml0cm9nbHljZXJpbiBmcm9tICcuLi9uaXRyb2dseWNlcmluLmpzJztcclxuaW1wb3J0IEF0b21Ob2RlLCB7IEF0b21Ob2RlT3B0aW9ucyB9IGZyb20gJy4vQXRvbU5vZGUuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVOb2RlLCB7IE1vbGVjdWxlTm9kZU9wdGlvbnMgfSBmcm9tICcuL01vbGVjdWxlTm9kZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuZXhwb3J0IHR5cGUgQzJINE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBNb2xlY3VsZU5vZGVPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQzJINE5vZGUgZXh0ZW5kcyBNb2xlY3VsZU5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEMySDROb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBhdG9tTm9kZU9wdGlvbnMgPSBwcm92aWRlZE9wdGlvbnM/LmF0b21Ob2RlT3B0aW9ucztcclxuXHJcbiAgICAvLyBhdG9tc1xyXG4gICAgY29uc3QgYmlnTGVmdE5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuQywgYXRvbU5vZGVPcHRpb25zICk7XHJcbiAgICBjb25zdCBzbWFsbE9mZnNldCA9IDAuMTY1ICogYmlnTGVmdE5vZGUud2lkdGg7XHJcbiAgICBjb25zdCBiaWdSaWdodE5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuQywgY29tYmluZU9wdGlvbnM8QXRvbU5vZGVPcHRpb25zPigge1xyXG4gICAgICBsZWZ0OiBiaWdMZWZ0Tm9kZS5jZW50ZXJYICsgKCAwLjI1ICogYmlnTGVmdE5vZGUud2lkdGggKSxcclxuICAgICAgY2VudGVyWTogYmlnTGVmdE5vZGUuY2VudGVyWVxyXG4gICAgfSwgYXRvbU5vZGVPcHRpb25zICkgKTtcclxuICAgIGNvbnN0IHNtYWxsVG9wTGVmdE5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuSCwgY29tYmluZU9wdGlvbnM8QXRvbU5vZGVPcHRpb25zPigge1xyXG4gICAgICBjZW50ZXJYOiBiaWdMZWZ0Tm9kZS5sZWZ0ICsgc21hbGxPZmZzZXQsXHJcbiAgICAgIGNlbnRlclk6IGJpZ0xlZnROb2RlLnRvcCArIHNtYWxsT2Zmc2V0XHJcbiAgICB9LCBhdG9tTm9kZU9wdGlvbnMgKSApO1xyXG4gICAgY29uc3Qgc21hbGxUb3BSaWdodE5vZGUgPSBuZXcgQXRvbU5vZGUoIEVsZW1lbnQuSCwgY29tYmluZU9wdGlvbnM8QXRvbU5vZGVPcHRpb25zPigge1xyXG4gICAgICBjZW50ZXJYOiBiaWdSaWdodE5vZGUucmlnaHQgLSBzbWFsbE9mZnNldCxcclxuICAgICAgY2VudGVyWTogYmlnUmlnaHROb2RlLnRvcCArIHNtYWxsT2Zmc2V0XHJcbiAgICB9LCBhdG9tTm9kZU9wdGlvbnMgKSApO1xyXG4gICAgY29uc3Qgc21hbGxCb3R0b21MZWZ0Tm9kZSA9IG5ldyBBdG9tTm9kZSggRWxlbWVudC5ILCBjb21iaW5lT3B0aW9uczxBdG9tTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgIGNlbnRlclg6IGJpZ0xlZnROb2RlLmxlZnQgKyBzbWFsbE9mZnNldCxcclxuICAgICAgY2VudGVyWTogYmlnTGVmdE5vZGUuYm90dG9tIC0gc21hbGxPZmZzZXRcclxuICAgIH0sIGF0b21Ob2RlT3B0aW9ucyApICk7XHJcbiAgICBjb25zdCBzbWFsbEJvdHRvbVJpZ2h0Tm9kZSA9IG5ldyBBdG9tTm9kZSggRWxlbWVudC5ILCBjb21iaW5lT3B0aW9uczxBdG9tTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgIGNlbnRlclg6IGJpZ1JpZ2h0Tm9kZS5yaWdodCAtIHNtYWxsT2Zmc2V0LFxyXG4gICAgICBjZW50ZXJZOiBiaWdSaWdodE5vZGUuYm90dG9tIC0gc21hbGxPZmZzZXRcclxuICAgIH0sIGF0b21Ob2RlT3B0aW9ucyApICk7XHJcblxyXG4gICAgY29uc3QgYXRvbU5vZGVzID0gW1xyXG4gICAgICBzbWFsbFRvcFJpZ2h0Tm9kZSwgc21hbGxUb3BMZWZ0Tm9kZSxcclxuICAgICAgYmlnTGVmdE5vZGUsIGJpZ1JpZ2h0Tm9kZSxcclxuICAgICAgc21hbGxCb3R0b21MZWZ0Tm9kZSwgc21hbGxCb3R0b21SaWdodE5vZGVcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIGF0b21Ob2RlcywgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxy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