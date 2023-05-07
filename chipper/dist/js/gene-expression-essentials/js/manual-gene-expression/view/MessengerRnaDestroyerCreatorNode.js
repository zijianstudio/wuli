// Copyright 2015-2021, University of Colorado Boulder

/**
 * Node that, when clicked on, will add an mRNA destroyer to the active area.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Aadish Gupta
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import MessengerRnaDestroyer from '../../common/model/MessengerRnaDestroyer.js';
import StubGeneExpressionModel from '../../common/model/StubGeneExpressionModel.js';
import MobileBiomoleculeNode from '../../common/view/MobileBiomoleculeNode.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import BiomoleculeCreatorNode from './BiomoleculeCreatorNode.js';

// constants
// Scaling factor for this node when used as a creator node. May be significantly different from the size of the
// corresponding element in the model.
const SCALING_FACTOR = 0.07;
const SCALING_MVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(new Vector2(0, 0), new Vector2(0, 0), SCALING_FACTOR);
class MessengerRnaDestroyerCreatorNode extends BiomoleculeCreatorNode {
  /**
   * @param {BiomoleculeToolboxNode} biomoleculeBoxNode
   */
  constructor(biomoleculeBoxNode) {
    super(new MobileBiomoleculeNode(SCALING_MVT, new MessengerRnaDestroyer(new StubGeneExpressionModel())), biomoleculeBoxNode.screenView, biomoleculeBoxNode.modelViewTransform, pos => {
      const mRnaDestroyer = new MessengerRnaDestroyer(biomoleculeBoxNode.model, pos);
      biomoleculeBoxNode.model.addMobileBiomolecule(mRnaDestroyer);
      return mRnaDestroyer;
    }, mobileBiomolecule => {
      biomoleculeBoxNode.model.removeMobileBiomolecule(mobileBiomolecule);
    }, biomoleculeBoxNode);
  }
}
geneExpressionEssentials.register('MessengerRnaDestroyerCreatorNode', MessengerRnaDestroyerCreatorNode);
export default MessengerRnaDestroyerCreatorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIk1lc3NlbmdlclJuYURlc3Ryb3llciIsIlN0dWJHZW5lRXhwcmVzc2lvbk1vZGVsIiwiTW9iaWxlQmlvbW9sZWN1bGVOb2RlIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiQmlvbW9sZWN1bGVDcmVhdG9yTm9kZSIsIlNDQUxJTkdfRkFDVE9SIiwiU0NBTElOR19NVlQiLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIk1lc3NlbmdlclJuYURlc3Ryb3llckNyZWF0b3JOb2RlIiwiY29uc3RydWN0b3IiLCJiaW9tb2xlY3VsZUJveE5vZGUiLCJzY3JlZW5WaWV3IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicG9zIiwibVJuYURlc3Ryb3llciIsIm1vZGVsIiwiYWRkTW9iaWxlQmlvbW9sZWN1bGUiLCJtb2JpbGVCaW9tb2xlY3VsZSIsInJlbW92ZU1vYmlsZUJpb21vbGVjdWxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNZXNzZW5nZXJSbmFEZXN0cm95ZXJDcmVhdG9yTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOb2RlIHRoYXQsIHdoZW4gY2xpY2tlZCBvbiwgd2lsbCBhZGQgYW4gbVJOQSBkZXN0cm95ZXIgdG8gdGhlIGFjdGl2ZSBhcmVhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IE1lc3NlbmdlclJuYURlc3Ryb3llciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTWVzc2VuZ2VyUm5hRGVzdHJveWVyLmpzJztcclxuaW1wb3J0IFN0dWJHZW5lRXhwcmVzc2lvbk1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TdHViR2VuZUV4cHJlc3Npb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBNb2JpbGVCaW9tb2xlY3VsZU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTW9iaWxlQmlvbW9sZWN1bGVOb2RlLmpzJztcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi8uLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgQmlvbW9sZWN1bGVDcmVhdG9yTm9kZSBmcm9tICcuL0Jpb21vbGVjdWxlQ3JlYXRvck5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIFNjYWxpbmcgZmFjdG9yIGZvciB0aGlzIG5vZGUgd2hlbiB1c2VkIGFzIGEgY3JlYXRvciBub2RlLiBNYXkgYmUgc2lnbmlmaWNhbnRseSBkaWZmZXJlbnQgZnJvbSB0aGUgc2l6ZSBvZiB0aGVcclxuLy8gY29ycmVzcG9uZGluZyBlbGVtZW50IGluIHRoZSBtb2RlbC5cclxuY29uc3QgU0NBTElOR19GQUNUT1IgPSAwLjA3O1xyXG5jb25zdCBTQ0FMSU5HX01WVCA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG4gIFNDQUxJTkdfRkFDVE9SXHJcbik7XHJcblxyXG5jbGFzcyBNZXNzZW5nZXJSbmFEZXN0cm95ZXJDcmVhdG9yTm9kZSBleHRlbmRzIEJpb21vbGVjdWxlQ3JlYXRvck5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Jpb21vbGVjdWxlVG9vbGJveE5vZGV9IGJpb21vbGVjdWxlQm94Tm9kZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBiaW9tb2xlY3VsZUJveE5vZGUgKSB7XHJcbiAgICBzdXBlcihcclxuICAgICAgbmV3IE1vYmlsZUJpb21vbGVjdWxlTm9kZSggU0NBTElOR19NVlQsIG5ldyBNZXNzZW5nZXJSbmFEZXN0cm95ZXIoIG5ldyBTdHViR2VuZUV4cHJlc3Npb25Nb2RlbCgpICkgKSxcclxuICAgICAgYmlvbW9sZWN1bGVCb3hOb2RlLnNjcmVlblZpZXcsXHJcbiAgICAgIGJpb21vbGVjdWxlQm94Tm9kZS5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHBvcyA9PiB7XHJcbiAgICAgICAgY29uc3QgbVJuYURlc3Ryb3llciA9IG5ldyBNZXNzZW5nZXJSbmFEZXN0cm95ZXIoIGJpb21vbGVjdWxlQm94Tm9kZS5tb2RlbCwgcG9zICk7XHJcbiAgICAgICAgYmlvbW9sZWN1bGVCb3hOb2RlLm1vZGVsLmFkZE1vYmlsZUJpb21vbGVjdWxlKCBtUm5hRGVzdHJveWVyICk7XHJcbiAgICAgICAgcmV0dXJuIG1SbmFEZXN0cm95ZXI7XHJcblxyXG4gICAgICB9LFxyXG4gICAgICBtb2JpbGVCaW9tb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgYmlvbW9sZWN1bGVCb3hOb2RlLm1vZGVsLnJlbW92ZU1vYmlsZUJpb21vbGVjdWxlKCBtb2JpbGVCaW9tb2xlY3VsZSApO1xyXG4gICAgICB9LFxyXG4gICAgICBiaW9tb2xlY3VsZUJveE5vZGVcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdNZXNzZW5nZXJSbmFEZXN0cm95ZXJDcmVhdG9yTm9kZScsIE1lc3NlbmdlclJuYURlc3Ryb3llckNyZWF0b3JOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNZXNzZW5nZXJSbmFEZXN0cm95ZXJDcmVhdG9yTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLHFCQUFxQixNQUFNLDZDQUE2QztBQUMvRSxPQUFPQyx1QkFBdUIsTUFBTSwrQ0FBK0M7QUFDbkYsT0FBT0MscUJBQXFCLE1BQU0sNENBQTRDO0FBQzlFLE9BQU9DLHdCQUF3QixNQUFNLG1DQUFtQztBQUN4RSxPQUFPQyxzQkFBc0IsTUFBTSw2QkFBNkI7O0FBRWhFO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLGNBQWMsR0FBRyxJQUFJO0FBQzNCLE1BQU1DLFdBQVcsR0FBR1AsbUJBQW1CLENBQUNRLHNDQUFzQyxDQUM1RSxJQUFJVCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQixJQUFJQSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUNuQk8sY0FDRixDQUFDO0FBRUQsTUFBTUcsZ0NBQWdDLFNBQVNKLHNCQUFzQixDQUFDO0VBRXBFO0FBQ0Y7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxrQkFBa0IsRUFBRztJQUNoQyxLQUFLLENBQ0gsSUFBSVIscUJBQXFCLENBQUVJLFdBQVcsRUFBRSxJQUFJTixxQkFBcUIsQ0FBRSxJQUFJQyx1QkFBdUIsQ0FBQyxDQUFFLENBQUUsQ0FBQyxFQUNwR1Msa0JBQWtCLENBQUNDLFVBQVUsRUFDN0JELGtCQUFrQixDQUFDRSxrQkFBa0IsRUFDckNDLEdBQUcsSUFBSTtNQUNMLE1BQU1DLGFBQWEsR0FBRyxJQUFJZCxxQkFBcUIsQ0FBRVUsa0JBQWtCLENBQUNLLEtBQUssRUFBRUYsR0FBSSxDQUFDO01BQ2hGSCxrQkFBa0IsQ0FBQ0ssS0FBSyxDQUFDQyxvQkFBb0IsQ0FBRUYsYUFBYyxDQUFDO01BQzlELE9BQU9BLGFBQWE7SUFFdEIsQ0FBQyxFQUNERyxpQkFBaUIsSUFBSTtNQUNuQlAsa0JBQWtCLENBQUNLLEtBQUssQ0FBQ0csdUJBQXVCLENBQUVELGlCQUFrQixDQUFDO0lBQ3ZFLENBQUMsRUFDRFAsa0JBQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVAsd0JBQXdCLENBQUNnQixRQUFRLENBQUUsa0NBQWtDLEVBQUVYLGdDQUFpQyxDQUFDO0FBRXpHLGVBQWVBLGdDQUFnQyJ9