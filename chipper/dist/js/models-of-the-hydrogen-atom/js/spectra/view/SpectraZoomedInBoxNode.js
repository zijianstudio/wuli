// Copyright 2022, University of Colorado Boulder

/**
 * SpectraZoomedInBoxNode shows what's inside the zoomed-in box for the 'Spectra' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ZoomedInBoxNode from '../../common/view/ZoomedInBoxNode.js';
import PlumPuddingNode from '../../common/view/PlumPuddingNode.js';
import BilliardBallNode from '../../common/view/BilliardBallNode.js';
import PhotonNode from '../../common/view/PhotonNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ClassicalSolarSystemNode from '../../common/view/ClassicalSolarSystemNode.js';
import BohrNode from '../../common/view/BohrNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import MOTHAConstants from '../../common/MOTHAConstants.js';
import SchrodingerNode from '../../common/view/SchrodingerNode.js';
import DeBroglieNode from '../../common/view/DeBroglieNode.js';
const VIEW_SIZE = MOTHAConstants.ZOOMED_IN_BOX_VIEW_SIZE;
export default class SpectraZoomedInBoxNode extends ZoomedInBoxNode {
  constructor(model, popupParent, providedOptions) {
    const options = optionize()({
      //TODO default values for options
    }, providedOptions);

    // All of the model-view transform action takes place in the zoomed-in box.
    // Our model uses a right-handed coordinate system: +x right, +y up, +angle counterclockwise.
    // Our view uses a left-handed coordinate system: +x right, +y down, +angle clockwise.
    // The origin is at the center of the zoomed-in box.
    const viewOffset = new Vector2(VIEW_SIZE / 2, VIEW_SIZE);
    const xScale = VIEW_SIZE / model.zoomedInBox.width;
    const yScale = VIEW_SIZE / model.zoomedInBox.height;
    assert && assert(xScale === yScale, 'box is not scaled the same in both dimensions, is your box square?');
    const modelViewTransform = ModelViewTransform2.createOffsetXYScaleMapping(viewOffset, xScale, -yScale);
    super(model.zoomedInBox, modelViewTransform, options);
    const deBroglieNode = new DeBroglieNode(model.deBroglieModel, model.hydrogenAtomProperty, modelViewTransform, popupParent, {
      tandem: options.tandem.createTandem('deBroglieNode')
    });
    this.contentsNode.addChild(new Node({
      children: [new BilliardBallNode(model.billiardBallModel, model.hydrogenAtomProperty, modelViewTransform, {
        tandem: options.tandem.createTandem('billiardBallNode')
      }), new PlumPuddingNode(model.plumPuddingModel, model.hydrogenAtomProperty, modelViewTransform, {
        tandem: options.tandem.createTandem('plumPuddingNode')
      }), new ClassicalSolarSystemNode(model.classicalSolarSystemModel, model.hydrogenAtomProperty, modelViewTransform, {
        tandem: options.tandem.createTandem('classicalSolarSystemNode')
      }), new BohrNode(model.bohrModel, model.hydrogenAtomProperty, modelViewTransform, {
        tandem: options.tandem.createTandem('bohrNode')
      }), deBroglieNode, new SchrodingerNode(model.schrodingerModel, model.hydrogenAtomProperty, modelViewTransform, {
        tandem: options.tandem.createTandem('schrodingerNode')
      })]
    }));
    const photonNodes = [];

    // Add the PhotonNode for a Photon.
    model.photons.addItemAddedListener(photon => {
      const photonNode = new PhotonNode(photon, modelViewTransform);
      photonNodes.push(photonNode);
      this.contentsNode.addChild(photonNode);
    });

    // Remove the PhotonNode for a Photon.
    model.photons.addItemRemovedListener(photon => {
      const photonNode = _.find(photonNodes, photonNode => photonNode.photon === photon);
      assert && assert(photonNode);
      photonNodes.splice(photonNodes.indexOf(photonNode), 1);
      this.contentsNode.removeChild(photonNode);
      photonNode.dispose();
    });
    this.model = model;
    this.deBroglieNode = deBroglieNode;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  step(dt) {
    //TODO a better way to step the selected view
    if (this.model.hydrogenAtomProperty.value === this.model.bohrModel) {
      this.deBroglieNode.step(dt);
    }
  }
}
modelsOfTheHydrogenAtom.register('SpectraZoomedInBoxNode', SpectraZoomedInBoxNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwibW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20iLCJab29tZWRJbkJveE5vZGUiLCJQbHVtUHVkZGluZ05vZGUiLCJCaWxsaWFyZEJhbGxOb2RlIiwiUGhvdG9uTm9kZSIsIlZlY3RvcjIiLCJDbGFzc2ljYWxTb2xhclN5c3RlbU5vZGUiLCJCb2hyTm9kZSIsIk5vZGUiLCJNT1RIQUNvbnN0YW50cyIsIlNjaHJvZGluZ2VyTm9kZSIsIkRlQnJvZ2xpZU5vZGUiLCJWSUVXX1NJWkUiLCJaT09NRURfSU5fQk9YX1ZJRVdfU0laRSIsIlNwZWN0cmFab29tZWRJbkJveE5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicG9wdXBQYXJlbnQiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidmlld09mZnNldCIsInhTY2FsZSIsInpvb21lZEluQm94Iiwid2lkdGgiLCJ5U2NhbGUiLCJoZWlnaHQiLCJhc3NlcnQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVPZmZzZXRYWVNjYWxlTWFwcGluZyIsImRlQnJvZ2xpZU5vZGUiLCJkZUJyb2dsaWVNb2RlbCIsImh5ZHJvZ2VuQXRvbVByb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiY29udGVudHNOb2RlIiwiYWRkQ2hpbGQiLCJjaGlsZHJlbiIsImJpbGxpYXJkQmFsbE1vZGVsIiwicGx1bVB1ZGRpbmdNb2RlbCIsImNsYXNzaWNhbFNvbGFyU3lzdGVtTW9kZWwiLCJib2hyTW9kZWwiLCJzY2hyb2Rpbmdlck1vZGVsIiwicGhvdG9uTm9kZXMiLCJwaG90b25zIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJwaG90b24iLCJwaG90b25Ob2RlIiwicHVzaCIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJfIiwiZmluZCIsInNwbGljZSIsImluZGV4T2YiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJzdGVwIiwiZHQiLCJ2YWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3BlY3RyYVpvb21lZEluQm94Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3BlY3RyYVpvb21lZEluQm94Tm9kZSBzaG93cyB3aGF0J3MgaW5zaWRlIHRoZSB6b29tZWQtaW4gYm94IGZvciB0aGUgJ1NwZWN0cmEnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20gZnJvbSAnLi4vLi4vbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgU3BlY3RyYU1vZGVsIGZyb20gJy4uL21vZGVsL1NwZWN0cmFNb2RlbC5qcyc7XHJcbmltcG9ydCBab29tZWRJbkJveE5vZGUsIHsgWm9vbWVkSW5Cb3hOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1pvb21lZEluQm94Tm9kZS5qcyc7XHJcbmltcG9ydCBQbHVtUHVkZGluZ05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUGx1bVB1ZGRpbmdOb2RlLmpzJztcclxuaW1wb3J0IEJpbGxpYXJkQmFsbE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQmlsbGlhcmRCYWxsTm9kZS5qcyc7XHJcbmltcG9ydCBQaG90b25Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1Bob3Rvbk5vZGUuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBDbGFzc2ljYWxTb2xhclN5c3RlbU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQ2xhc3NpY2FsU29sYXJTeXN0ZW1Ob2RlLmpzJztcclxuaW1wb3J0IEJvaHJOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0JvaHJOb2RlLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBNT1RIQUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vTU9USEFDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgU2Nocm9kaW5nZXJOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NjaHJvZGluZ2VyTm9kZS5qcyc7XHJcbmltcG9ydCBEZUJyb2dsaWVOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0RlQnJvZ2xpZU5vZGUuanMnO1xyXG5cclxuY29uc3QgVklFV19TSVpFID0gTU9USEFDb25zdGFudHMuWk9PTUVEX0lOX0JPWF9WSUVXX1NJWkU7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgU3BlY3RyYVpvb21lZEluQm94Tm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFpvb21lZEluQm94Tm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGVjdHJhWm9vbWVkSW5Cb3hOb2RlIGV4dGVuZHMgWm9vbWVkSW5Cb3hOb2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb2RlbDogU3BlY3RyYU1vZGVsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVCcm9nbGllTm9kZTogRGVCcm9nbGllTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogU3BlY3RyYU1vZGVsLCBwb3B1cFBhcmVudDogTm9kZSwgcHJvdmlkZWRPcHRpb25zOiBTcGVjdHJhWm9vbWVkSW5Cb3hOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNwZWN0cmFab29tZWRJbkJveE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgWm9vbWVkSW5Cb3hOb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICAvL1RPRE8gZGVmYXVsdCB2YWx1ZXMgZm9yIG9wdGlvbnNcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEFsbCBvZiB0aGUgbW9kZWwtdmlldyB0cmFuc2Zvcm0gYWN0aW9uIHRha2VzIHBsYWNlIGluIHRoZSB6b29tZWQtaW4gYm94LlxyXG4gICAgLy8gT3VyIG1vZGVsIHVzZXMgYSByaWdodC1oYW5kZWQgY29vcmRpbmF0ZSBzeXN0ZW06ICt4IHJpZ2h0LCAreSB1cCwgK2FuZ2xlIGNvdW50ZXJjbG9ja3dpc2UuXHJcbiAgICAvLyBPdXIgdmlldyB1c2VzIGEgbGVmdC1oYW5kZWQgY29vcmRpbmF0ZSBzeXN0ZW06ICt4IHJpZ2h0LCAreSBkb3duLCArYW5nbGUgY2xvY2t3aXNlLlxyXG4gICAgLy8gVGhlIG9yaWdpbiBpcyBhdCB0aGUgY2VudGVyIG9mIHRoZSB6b29tZWQtaW4gYm94LlxyXG4gICAgY29uc3Qgdmlld09mZnNldCA9IG5ldyBWZWN0b3IyKCBWSUVXX1NJWkUgLyAyLCBWSUVXX1NJWkUgKTtcclxuICAgIGNvbnN0IHhTY2FsZSA9IFZJRVdfU0laRSAvIG1vZGVsLnpvb21lZEluQm94LndpZHRoO1xyXG4gICAgY29uc3QgeVNjYWxlID0gVklFV19TSVpFIC8gbW9kZWwuem9vbWVkSW5Cb3guaGVpZ2h0O1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeFNjYWxlID09PSB5U2NhbGUsICdib3ggaXMgbm90IHNjYWxlZCB0aGUgc2FtZSBpbiBib3RoIGRpbWVuc2lvbnMsIGlzIHlvdXIgYm94IHNxdWFyZT8nICk7XHJcbiAgICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZU9mZnNldFhZU2NhbGVNYXBwaW5nKCB2aWV3T2Zmc2V0LCB4U2NhbGUsIC15U2NhbGUgKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWwuem9vbWVkSW5Cb3gsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGRlQnJvZ2xpZU5vZGUgPSBuZXcgRGVCcm9nbGllTm9kZSggbW9kZWwuZGVCcm9nbGllTW9kZWwsIG1vZGVsLmh5ZHJvZ2VuQXRvbVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHBvcHVwUGFyZW50LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGVCcm9nbGllTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY29udGVudHNOb2RlLmFkZENoaWxkKCBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBCaWxsaWFyZEJhbGxOb2RlKCBtb2RlbC5iaWxsaWFyZEJhbGxNb2RlbCwgbW9kZWwuaHlkcm9nZW5BdG9tUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdiaWxsaWFyZEJhbGxOb2RlJyApXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBQbHVtUHVkZGluZ05vZGUoIG1vZGVsLnBsdW1QdWRkaW5nTW9kZWwsIG1vZGVsLmh5ZHJvZ2VuQXRvbVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncGx1bVB1ZGRpbmdOb2RlJyApXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBDbGFzc2ljYWxTb2xhclN5c3RlbU5vZGUoIG1vZGVsLmNsYXNzaWNhbFNvbGFyU3lzdGVtTW9kZWwsIG1vZGVsLmh5ZHJvZ2VuQXRvbVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2xhc3NpY2FsU29sYXJTeXN0ZW1Ob2RlJyApXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBCb2hyTm9kZSggbW9kZWwuYm9ock1vZGVsLCBtb2RlbC5oeWRyb2dlbkF0b21Qcm9wZXJ0eSwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JvaHJOb2RlJyApXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIGRlQnJvZ2xpZU5vZGUsXHJcbiAgICAgICAgbmV3IFNjaHJvZGluZ2VyTm9kZSggbW9kZWwuc2Nocm9kaW5nZXJNb2RlbCwgbW9kZWwuaHlkcm9nZW5BdG9tUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzY2hyb2Rpbmdlck5vZGUnIClcclxuICAgICAgICB9IClcclxuICAgICAgXVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgY29uc3QgcGhvdG9uTm9kZXM6IFBob3Rvbk5vZGVbXSA9IFtdO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgUGhvdG9uTm9kZSBmb3IgYSBQaG90b24uXHJcbiAgICBtb2RlbC5waG90b25zLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCBwaG90b24gPT4ge1xyXG4gICAgICBjb25zdCBwaG90b25Ob2RlID0gbmV3IFBob3Rvbk5vZGUoIHBob3RvbiwgbW9kZWxWaWV3VHJhbnNmb3JtICk7XHJcbiAgICAgIHBob3Rvbk5vZGVzLnB1c2goIHBob3Rvbk5vZGUgKTtcclxuICAgICAgdGhpcy5jb250ZW50c05vZGUuYWRkQ2hpbGQoIHBob3Rvbk5vZGUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIFBob3Rvbk5vZGUgZm9yIGEgUGhvdG9uLlxyXG4gICAgbW9kZWwucGhvdG9ucy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBwaG90b24gPT4ge1xyXG4gICAgICBjb25zdCBwaG90b25Ob2RlID0gXy5maW5kKCBwaG90b25Ob2RlcywgcGhvdG9uTm9kZSA9PiAoIHBob3Rvbk5vZGUucGhvdG9uID09PSBwaG90b24gKSApITtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhvdG9uTm9kZSApO1xyXG4gICAgICBwaG90b25Ob2Rlcy5zcGxpY2UoIHBob3Rvbk5vZGVzLmluZGV4T2YoIHBob3Rvbk5vZGUgKSwgMSApO1xyXG4gICAgICB0aGlzLmNvbnRlbnRzTm9kZS5yZW1vdmVDaGlsZCggcGhvdG9uTm9kZSApO1xyXG4gICAgICBwaG90b25Ob2RlLmRpc3Bvc2UoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICB0aGlzLmRlQnJvZ2xpZU5vZGUgPSBkZUJyb2dsaWVOb2RlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vVE9ETyBhIGJldHRlciB3YXkgdG8gc3RlcCB0aGUgc2VsZWN0ZWQgdmlld1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLmh5ZHJvZ2VuQXRvbVByb3BlcnR5LnZhbHVlID09PSB0aGlzLm1vZGVsLmJvaHJNb2RlbCApIHtcclxuICAgICAgdGhpcy5kZUJyb2dsaWVOb2RlLnN0ZXAoIGR0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5yZWdpc3RlciggJ1NwZWN0cmFab29tZWRJbkJveE5vZGUnLCBTcGVjdHJhWm9vbWVkSW5Cb3hOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLE9BQU9DLG1CQUFtQixNQUFNLHVEQUF1RDtBQUN2RixPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFFdEUsT0FBT0MsZUFBZSxNQUFrQyxzQ0FBc0M7QUFDOUYsT0FBT0MsZUFBZSxNQUFNLHNDQUFzQztBQUNsRSxPQUFPQyxnQkFBZ0IsTUFBTSx1Q0FBdUM7QUFDcEUsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLHdCQUF3QixNQUFNLCtDQUErQztBQUNwRixPQUFPQyxRQUFRLE1BQU0sK0JBQStCO0FBQ3BELFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsY0FBYyxNQUFNLGdDQUFnQztBQUMzRCxPQUFPQyxlQUFlLE1BQU0sc0NBQXNDO0FBQ2xFLE9BQU9DLGFBQWEsTUFBTSxvQ0FBb0M7QUFFOUQsTUFBTUMsU0FBUyxHQUFHSCxjQUFjLENBQUNJLHVCQUF1QjtBQU14RCxlQUFlLE1BQU1DLHNCQUFzQixTQUFTYixlQUFlLENBQUM7RUFLM0RjLFdBQVdBLENBQUVDLEtBQW1CLEVBQUVDLFdBQWlCLEVBQUVDLGVBQThDLEVBQUc7SUFFM0csTUFBTUMsT0FBTyxHQUFHckIsU0FBUyxDQUFxRSxDQUFDLENBQUU7TUFDL0Y7SUFBQSxDQUNELEVBQUVvQixlQUFnQixDQUFDOztJQUVwQjtJQUNBO0lBQ0E7SUFDQTtJQUNBLE1BQU1FLFVBQVUsR0FBRyxJQUFJZixPQUFPLENBQUVPLFNBQVMsR0FBRyxDQUFDLEVBQUVBLFNBQVUsQ0FBQztJQUMxRCxNQUFNUyxNQUFNLEdBQUdULFNBQVMsR0FBR0ksS0FBSyxDQUFDTSxX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