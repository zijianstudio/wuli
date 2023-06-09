// Copyright 2021, University of Colorado Boulder

/**
 * Visual representation of a molecule.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import { Node } from '../../../../scenery/js/imports.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import AtomicBondNode from './AtomicBondNode.js';
import AtomNode from './AtomNode.js';
class MoleculeNode extends Node {
  /**
   * Constructor for a molecule node.
   *
   * @param {Molecule} molecule
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(molecule, modelViewTransform, options) {
    // supertype constructor
    super(options);

    // Carry this node through the scope in nested functions.
    this.modelViewTransform = modelViewTransform; // @private

    // Instance Data
    const atomTopLayer = new Node();
    const atomBottomLayer = new Node();
    const bondTopLayer = new Node();
    const bondBottomLayer = new Node();
    this.addChild(bondBottomLayer);
    this.addChild(atomBottomLayer);
    this.addChild(bondTopLayer);
    this.addChild(atomTopLayer);
    const atoms = molecule.getAtoms();

    // Create nodes and add the atoms which compose this molecule to the atomLayer.
    for (let i = 0; i < atoms.length; i++) {
      const atom = molecule.getAtoms()[i];
      const atomNode = new AtomNode(atom, this.modelViewTransform);
      if (atom.topLayer) {
        atomTopLayer.addChild(atomNode);
      } else {
        atomBottomLayer.addChild(atomNode);
      }
    }

    // Create and add the atomic bonds which form the structure of this molecule to the bondLayer
    const atomicBonds = molecule.getAtomicBonds();
    for (let i = 0; i < atomicBonds.length; i++) {
      const bond = atomicBonds[i];
      const bondNode = new AtomicBondNode(atomicBonds[i], this.modelViewTransform);
      if (bond.topLayer) {
        bondTopLayer.addChild(bondNode);
      } else {
        bondBottomLayer.addChild(bondNode);
      }
    }

    // Link the high energy state to the property in the model.
    const atomNodes = atomTopLayer.children.concat(atomBottomLayer.children);
    molecule.highElectronicEnergyStateProperty.link(() => {
      for (let i = 0; i < atomNodes.length; i++) {
        const atomNode = atomNodes[i];
        atomNode.setHighlighted(molecule.highElectronicEnergyStateProperty.get());
      }
    });
  }
}
greenhouseEffect.register('MoleculeNode', MoleculeNode);
export default MoleculeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkF0b21pY0JvbmROb2RlIiwiQXRvbU5vZGUiLCJNb2xlY3VsZU5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vbGVjdWxlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwib3B0aW9ucyIsImF0b21Ub3BMYXllciIsImF0b21Cb3R0b21MYXllciIsImJvbmRUb3BMYXllciIsImJvbmRCb3R0b21MYXllciIsImFkZENoaWxkIiwiYXRvbXMiLCJnZXRBdG9tcyIsImkiLCJsZW5ndGgiLCJhdG9tIiwiYXRvbU5vZGUiLCJ0b3BMYXllciIsImF0b21pY0JvbmRzIiwiZ2V0QXRvbWljQm9uZHMiLCJib25kIiwiYm9uZE5vZGUiLCJhdG9tTm9kZXMiLCJjaGlsZHJlbiIsImNvbmNhdCIsImhpZ2hFbGVjdHJvbmljRW5lcmd5U3RhdGVQcm9wZXJ0eSIsImxpbmsiLCJzZXRIaWdobGlnaHRlZCIsImdldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9sZWN1bGVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaXN1YWwgcmVwcmVzZW50YXRpb24gb2YgYSBtb2xlY3VsZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ3JlZW5ob3VzZUVmZmVjdCBmcm9tICcuLi8uLi9ncmVlbmhvdXNlRWZmZWN0LmpzJztcclxuaW1wb3J0IEF0b21pY0JvbmROb2RlIGZyb20gJy4vQXRvbWljQm9uZE5vZGUuanMnO1xyXG5pbXBvcnQgQXRvbU5vZGUgZnJvbSAnLi9BdG9tTm9kZS5qcyc7XHJcblxyXG5jbGFzcyBNb2xlY3VsZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIGEgbW9sZWN1bGUgbm9kZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vbGVjdWxlLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gc3VwZXJ0eXBlIGNvbnN0cnVjdG9yXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENhcnJ5IHRoaXMgbm9kZSB0aHJvdWdoIHRoZSBzY29wZSBpbiBuZXN0ZWQgZnVuY3Rpb25zLlxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07IC8vIEBwcml2YXRlXHJcblxyXG4gICAgLy8gSW5zdGFuY2UgRGF0YVxyXG4gICAgY29uc3QgYXRvbVRvcExheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IGF0b21Cb3R0b21MYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICBjb25zdCBib25kVG9wTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgY29uc3QgYm9uZEJvdHRvbUxheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBib25kQm90dG9tTGF5ZXIgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGF0b21Cb3R0b21MYXllciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYm9uZFRvcExheWVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhdG9tVG9wTGF5ZXIgKTtcclxuXHJcbiAgICBjb25zdCBhdG9tcyA9IG1vbGVjdWxlLmdldEF0b21zKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIG5vZGVzIGFuZCBhZGQgdGhlIGF0b21zIHdoaWNoIGNvbXBvc2UgdGhpcyBtb2xlY3VsZSB0byB0aGUgYXRvbUxheWVyLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXRvbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGF0b20gPSBtb2xlY3VsZS5nZXRBdG9tcygpWyBpIF07XHJcbiAgICAgIGNvbnN0IGF0b21Ob2RlID0gbmV3IEF0b21Ob2RlKCBhdG9tLCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gICAgICBpZiAoIGF0b20udG9wTGF5ZXIgKSB7XHJcbiAgICAgICAgYXRvbVRvcExheWVyLmFkZENoaWxkKCBhdG9tTm9kZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGF0b21Cb3R0b21MYXllci5hZGRDaGlsZCggYXRvbU5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBhdG9taWMgYm9uZHMgd2hpY2ggZm9ybSB0aGUgc3RydWN0dXJlIG9mIHRoaXMgbW9sZWN1bGUgdG8gdGhlIGJvbmRMYXllclxyXG4gICAgY29uc3QgYXRvbWljQm9uZHMgPSBtb2xlY3VsZS5nZXRBdG9taWNCb25kcygpO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXRvbWljQm9uZHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGJvbmQgPSBhdG9taWNCb25kc1sgaSBdO1xyXG4gICAgICBjb25zdCBib25kTm9kZSA9IG5ldyBBdG9taWNCb25kTm9kZSggYXRvbWljQm9uZHNbIGkgXSwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuICAgICAgaWYgKCBib25kLnRvcExheWVyICkge1xyXG4gICAgICAgIGJvbmRUb3BMYXllci5hZGRDaGlsZCggYm9uZE5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBib25kQm90dG9tTGF5ZXIuYWRkQ2hpbGQoIGJvbmROb2RlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5rIHRoZSBoaWdoIGVuZXJneSBzdGF0ZSB0byB0aGUgcHJvcGVydHkgaW4gdGhlIG1vZGVsLlxyXG4gICAgY29uc3QgYXRvbU5vZGVzID0gYXRvbVRvcExheWVyLmNoaWxkcmVuLmNvbmNhdCggYXRvbUJvdHRvbUxheWVyLmNoaWxkcmVuICk7XHJcbiAgICBtb2xlY3VsZS5oaWdoRWxlY3Ryb25pY0VuZXJneVN0YXRlUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhdG9tTm9kZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgYXRvbU5vZGUgPSBhdG9tTm9kZXNbIGkgXTtcclxuICAgICAgICBhdG9tTm9kZS5zZXRIaWdobGlnaHRlZCggbW9sZWN1bGUuaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdNb2xlY3VsZU5vZGUnLCBNb2xlY3VsZU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vbGVjdWxlTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBRXBDLE1BQU1DLFlBQVksU0FBU0osSUFBSSxDQUFDO0VBRTlCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLFFBQVEsRUFBRUMsa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUVuRDtJQUNBLEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJ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