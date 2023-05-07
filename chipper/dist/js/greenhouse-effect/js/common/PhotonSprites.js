// Copyright 2022-2023, University of Colorado Boulder

/**
 * PhotonSprites is a class that can be used to perform high-performance rendering of a set of photons.  It uses
 * scenery's Sprites feature, which uses renderer:'webgl', with a fallback of 'canvas'.
 *
 * Understanding this implementation requires an understanding of the scenery Sprites API. In a nutshell: Sprites has an
 * array of Sprite and an array of SpriteInstance. The array of Sprite is the complete unique set of images used to
 * render all SpriteInstances. Each SpriteInstance has a reference to a Sprite (which determines what it looks like) and
 * a Matrix3 (which determines how it's transformed).  At each model step, the positions of the PhotonInstance instances
 * are updated by adjusting their matrix, and then invalidatePaint is called to re-render the sprites.
 *
 * TODO: Is there any need to size this node like we do for canvases?
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { Sprite, SpriteImage, SpriteInstance, SpriteInstanceTransformType, Sprites } from '../../../scenery/js/imports.js';
import infraredPhoton_png from '../../images/infraredPhoton_png.js';
import visiblePhoton_png from '../../images/visiblePhoton_png.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { ShowState } from './model/Photon.js';
import Range from '../../../dot/js/Range.js';
import LayersModel from './model/LayersModel.js';
import greenhouseEffect from '../greenhouseEffect.js';
import GreenhouseEffectObservationWindow from './view/GreenhouseEffectObservationWindow.js';

// constants
const TARGET_PHOTON_IMAGE_WIDTH = 17; // empirically determined to match the design
const HORIZONTAL_RENDERING_SPAN = new Range(-LayersModel.SUNLIGHT_SPAN.width / 2, LayersModel.SUNLIGHT_SPAN.width / 2);
class PhotonSprites extends Sprites {
  constructor(photonCollection, modelViewTransform) {
    // Create the sprites for the types of photons that will be displayed.
    const visiblePhotonSprite = new Sprite(new SpriteImage(visiblePhoton_png, new Vector2(visiblePhoton_png.width / 2, visiblePhoton_png.height / 2), {
      pickable: false
    }));
    const infraredPhotonSprite = new Sprite(new SpriteImage(infraredPhoton_png, new Vector2(infraredPhoton_png.width / 2, infraredPhoton_png.height / 2), {
      pickable: false
    }));

    // array of sprite instances, there will be one for each photon that is rendered
    const spriteInstances = [];
    super({
      sprites: [visiblePhotonSprite, infraredPhotonSprite],
      spriteInstances: spriteInstances,
      renderer: 'webgl',
      pickable: false,
      canvasBounds: GreenhouseEffectObservationWindow.SIZE.toBounds()
    });

    // Calculate the scale that will be used to render the photon images.
    this.photonScale = TARGET_PHOTON_IMAGE_WIDTH / infraredPhoton_png.width;
    assert && assert(this.photonScale > 0 && this.photonScale < 100, `photon scale factor not reasonable: ${this.photonScale}`);

    // Update the photons if the state of the "More Photons" feature changes.  This is necessary in case the state
    // changes while the sim is paused, since otherwise the periodic updates would handle it.
    photonCollection.showAllSimulatedPhotonsInViewProperty.lazyLink(() => {
      this.update();
    });

    // local variables needed for the methods
    this.spriteInstances = spriteInstances;
    this.photonCollection = photonCollection;
    this.modelViewTransform = modelViewTransform;
    this.infraredPhotonSprite = infraredPhotonSprite;
    this.visiblePhotonSprite = visiblePhotonSprite;
  }

  /**
   * Update the information needed to render the photons as sprites and then trigger a re-rendering.
   */
  update() {
    const photons = this.photonCollection.photons;
    const showAllPhotons = this.photonCollection.showAllSimulatedPhotonsInViewProperty.value;
    let numberOfPhotonsDisplayed = 0;
    for (let i = 0; i < photons.length; i++) {
      // Convenience constants.
      const photon = photons[i];
      const photonPosition = photon.positionProperty.value;

      // Determine whether this photon should be displayed.
      const showThisPhoton = (photon.showState === ShowState.ALWAYS || showAllPhotons) && HORIZONTAL_RENDERING_SPAN.contains(photonPosition.x);
      if (showThisPhoton) {
        numberOfPhotonsDisplayed++;

        // Add a new sprite instance to our list if we don't have enough.
        if (numberOfPhotonsDisplayed > this.spriteInstances.length) {
          const newSpriteInstance = SpriteInstance.pool.fetch();
          newSpriteInstance.transformType = SpriteInstanceTransformType.AFFINE;
          this.spriteInstances.push(newSpriteInstance);
        }

        // Update the matrix that controls where this photon is rendered.
        const spriteInstance = this.spriteInstances[numberOfPhotonsDisplayed - 1];
        spriteInstance.sprite = photon.isVisible ? this.visiblePhotonSprite : this.infraredPhotonSprite;
        spriteInstance.matrix.setToAffine(this.photonScale, 0, this.modelViewTransform.modelToViewX(photonPosition.x), 0, this.photonScale, this.modelViewTransform.modelToViewY(photonPosition.y));
      }
    }

    // Free up any unused sprite instances.
    while (this.spriteInstances.length > numberOfPhotonsDisplayed) {
      const unusedSpriteInstance = this.spriteInstances.pop();
      unusedSpriteInstance && unusedSpriteInstance.freeToPool();
    }

    // Trigger a re-rendering of the sprites.
    this.invalidatePaint();
  }
}
greenhouseEffect.register('PhotonSprites', PhotonSprites);
export default PhotonSprites;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcHJpdGUiLCJTcHJpdGVJbWFnZSIsIlNwcml0ZUluc3RhbmNlIiwiU3ByaXRlSW5zdGFuY2VUcmFuc2Zvcm1UeXBlIiwiU3ByaXRlcyIsImluZnJhcmVkUGhvdG9uX3BuZyIsInZpc2libGVQaG90b25fcG5nIiwiVmVjdG9yMiIsIlNob3dTdGF0ZSIsIlJhbmdlIiwiTGF5ZXJzTW9kZWwiLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93IiwiVEFSR0VUX1BIT1RPTl9JTUFHRV9XSURUSCIsIkhPUklaT05UQUxfUkVOREVSSU5HX1NQQU4iLCJTVU5MSUdIVF9TUEFOIiwid2lkdGgiLCJQaG90b25TcHJpdGVzIiwiY29uc3RydWN0b3IiLCJwaG90b25Db2xsZWN0aW9uIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidmlzaWJsZVBob3RvblNwcml0ZSIsImhlaWdodCIsInBpY2thYmxlIiwiaW5mcmFyZWRQaG90b25TcHJpdGUiLCJzcHJpdGVJbnN0YW5jZXMiLCJzcHJpdGVzIiwicmVuZGVyZXIiLCJjYW52YXNCb3VuZHMiLCJTSVpFIiwidG9Cb3VuZHMiLCJwaG90b25TY2FsZSIsImFzc2VydCIsInNob3dBbGxTaW11bGF0ZWRQaG90b25zSW5WaWV3UHJvcGVydHkiLCJsYXp5TGluayIsInVwZGF0ZSIsInBob3RvbnMiLCJzaG93QWxsUGhvdG9ucyIsInZhbHVlIiwibnVtYmVyT2ZQaG90b25zRGlzcGxheWVkIiwiaSIsImxlbmd0aCIsInBob3RvbiIsInBob3RvblBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsInNob3dUaGlzUGhvdG9uIiwic2hvd1N0YXRlIiwiQUxXQVlTIiwiY29udGFpbnMiLCJ4IiwibmV3U3ByaXRlSW5zdGFuY2UiLCJwb29sIiwiZmV0Y2giLCJ0cmFuc2Zvcm1UeXBlIiwiQUZGSU5FIiwicHVzaCIsInNwcml0ZUluc3RhbmNlIiwic3ByaXRlIiwiaXNWaXNpYmxlIiwibWF0cml4Iiwic2V0VG9BZmZpbmUiLCJtb2RlbFRvVmlld1giLCJtb2RlbFRvVmlld1kiLCJ5IiwidW51c2VkU3ByaXRlSW5zdGFuY2UiLCJwb3AiLCJmcmVlVG9Qb29sIiwiaW52YWxpZGF0ZVBhaW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQaG90b25TcHJpdGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBob3RvblNwcml0ZXMgaXMgYSBjbGFzcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gaGlnaC1wZXJmb3JtYW5jZSByZW5kZXJpbmcgb2YgYSBzZXQgb2YgcGhvdG9ucy4gIEl0IHVzZXNcclxuICogc2NlbmVyeSdzIFNwcml0ZXMgZmVhdHVyZSwgd2hpY2ggdXNlcyByZW5kZXJlcjond2ViZ2wnLCB3aXRoIGEgZmFsbGJhY2sgb2YgJ2NhbnZhcycuXHJcbiAqXHJcbiAqIFVuZGVyc3RhbmRpbmcgdGhpcyBpbXBsZW1lbnRhdGlvbiByZXF1aXJlcyBhbiB1bmRlcnN0YW5kaW5nIG9mIHRoZSBzY2VuZXJ5IFNwcml0ZXMgQVBJLiBJbiBhIG51dHNoZWxsOiBTcHJpdGVzIGhhcyBhblxyXG4gKiBhcnJheSBvZiBTcHJpdGUgYW5kIGFuIGFycmF5IG9mIFNwcml0ZUluc3RhbmNlLiBUaGUgYXJyYXkgb2YgU3ByaXRlIGlzIHRoZSBjb21wbGV0ZSB1bmlxdWUgc2V0IG9mIGltYWdlcyB1c2VkIHRvXHJcbiAqIHJlbmRlciBhbGwgU3ByaXRlSW5zdGFuY2VzLiBFYWNoIFNwcml0ZUluc3RhbmNlIGhhcyBhIHJlZmVyZW5jZSB0byBhIFNwcml0ZSAod2hpY2ggZGV0ZXJtaW5lcyB3aGF0IGl0IGxvb2tzIGxpa2UpIGFuZFxyXG4gKiBhIE1hdHJpeDMgKHdoaWNoIGRldGVybWluZXMgaG93IGl0J3MgdHJhbnNmb3JtZWQpLiAgQXQgZWFjaCBtb2RlbCBzdGVwLCB0aGUgcG9zaXRpb25zIG9mIHRoZSBQaG90b25JbnN0YW5jZSBpbnN0YW5jZXNcclxuICogYXJlIHVwZGF0ZWQgYnkgYWRqdXN0aW5nIHRoZWlyIG1hdHJpeCwgYW5kIHRoZW4gaW52YWxpZGF0ZVBhaW50IGlzIGNhbGxlZCB0byByZS1yZW5kZXIgdGhlIHNwcml0ZXMuXHJcbiAqXHJcbiAqIFRPRE86IElzIHRoZXJlIGFueSBuZWVkIHRvIHNpemUgdGhpcyBub2RlIGxpa2Ugd2UgZG8gZm9yIGNhbnZhc2VzP1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNwcml0ZSwgU3ByaXRlSW1hZ2UsIFNwcml0ZUluc3RhbmNlLCBTcHJpdGVJbnN0YW5jZVRyYW5zZm9ybVR5cGUsIFNwcml0ZXMgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBpbmZyYXJlZFBob3Rvbl9wbmcgZnJvbSAnLi4vLi4vaW1hZ2VzL2luZnJhcmVkUGhvdG9uX3BuZy5qcyc7XHJcbmltcG9ydCB2aXNpYmxlUGhvdG9uX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvdmlzaWJsZVBob3Rvbl9wbmcuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBQaG90b25Db2xsZWN0aW9uIGZyb20gJy4vbW9kZWwvUGhvdG9uQ29sbGVjdGlvbi5qcyc7XHJcbmltcG9ydCB7IFNob3dTdGF0ZSB9IGZyb20gJy4vbW9kZWwvUGhvdG9uLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBMYXllcnNNb2RlbCBmcm9tICcuL21vZGVsL0xheWVyc01vZGVsLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0T2JzZXJ2YXRpb25XaW5kb3cgZnJvbSAnLi92aWV3L0dyZWVuaG91c2VFZmZlY3RPYnNlcnZhdGlvbldpbmRvdy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVEFSR0VUX1BIT1RPTl9JTUFHRV9XSURUSCA9IDE3OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIG1hdGNoIHRoZSBkZXNpZ25cclxuY29uc3QgSE9SSVpPTlRBTF9SRU5ERVJJTkdfU1BBTiA9IG5ldyBSYW5nZShcclxuICAtTGF5ZXJzTW9kZWwuU1VOTElHSFRfU1BBTi53aWR0aCAvIDIsXHJcbiAgTGF5ZXJzTW9kZWwuU1VOTElHSFRfU1BBTi53aWR0aCAvIDJcclxuKTtcclxuXHJcbmNsYXNzIFBob3RvblNwcml0ZXMgZXh0ZW5kcyBTcHJpdGVzIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHNwcml0ZUluc3RhbmNlczogU3ByaXRlSW5zdGFuY2VbXTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHBob3RvbkNvbGxlY3Rpb246IFBob3RvbkNvbGxlY3Rpb247XHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBwaG90b25TY2FsZTogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlzaWJsZVBob3RvblNwcml0ZTogU3ByaXRlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaW5mcmFyZWRQaG90b25TcHJpdGU6IFNwcml0ZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwaG90b25Db2xsZWN0aW9uOiBQaG90b25Db2xsZWN0aW9uLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIgKSB7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBzcHJpdGVzIGZvciB0aGUgdHlwZXMgb2YgcGhvdG9ucyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxyXG4gICAgY29uc3QgdmlzaWJsZVBob3RvblNwcml0ZSA9IG5ldyBTcHJpdGUoIG5ldyBTcHJpdGVJbWFnZShcclxuICAgICAgdmlzaWJsZVBob3Rvbl9wbmcsXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB2aXNpYmxlUGhvdG9uX3BuZy53aWR0aCAvIDIsIHZpc2libGVQaG90b25fcG5nLmhlaWdodCAvIDIgKSxcclxuICAgICAgeyBwaWNrYWJsZTogZmFsc2UgfVxyXG4gICAgKSApO1xyXG4gICAgY29uc3QgaW5mcmFyZWRQaG90b25TcHJpdGUgPSBuZXcgU3ByaXRlKCBuZXcgU3ByaXRlSW1hZ2UoXHJcbiAgICAgIGluZnJhcmVkUGhvdG9uX3BuZyxcclxuICAgICAgbmV3IFZlY3RvcjIoIGluZnJhcmVkUGhvdG9uX3BuZy53aWR0aCAvIDIsIGluZnJhcmVkUGhvdG9uX3BuZy5oZWlnaHQgLyAyICksXHJcbiAgICAgIHsgcGlja2FibGU6IGZhbHNlIH1cclxuICAgICkgKTtcclxuXHJcbiAgICAvLyBhcnJheSBvZiBzcHJpdGUgaW5zdGFuY2VzLCB0aGVyZSB3aWxsIGJlIG9uZSBmb3IgZWFjaCBwaG90b24gdGhhdCBpcyByZW5kZXJlZFxyXG4gICAgY29uc3Qgc3ByaXRlSW5zdGFuY2VzOiBTcHJpdGVJbnN0YW5jZVtdID0gW107XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgc3ByaXRlczogWyB2aXNpYmxlUGhvdG9uU3ByaXRlLCBpbmZyYXJlZFBob3RvblNwcml0ZSBdLFxyXG4gICAgICBzcHJpdGVJbnN0YW5jZXM6IHNwcml0ZUluc3RhbmNlcyxcclxuICAgICAgcmVuZGVyZXI6ICd3ZWJnbCcsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuICAgICAgY2FudmFzQm91bmRzOiBHcmVlbmhvdXNlRWZmZWN0T2JzZXJ2YXRpb25XaW5kb3cuU0laRS50b0JvdW5kcygpXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBzY2FsZSB0aGF0IHdpbGwgYmUgdXNlZCB0byByZW5kZXIgdGhlIHBob3RvbiBpbWFnZXMuXHJcbiAgICB0aGlzLnBob3RvblNjYWxlID0gVEFSR0VUX1BIT1RPTl9JTUFHRV9XSURUSCAvIGluZnJhcmVkUGhvdG9uX3BuZy53aWR0aDtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICB0aGlzLnBob3RvblNjYWxlID4gMCAmJiB0aGlzLnBob3RvblNjYWxlIDwgMTAwLFxyXG4gICAgICBgcGhvdG9uIHNjYWxlIGZhY3RvciBub3QgcmVhc29uYWJsZTogJHt0aGlzLnBob3RvblNjYWxlfWBcclxuICAgICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBwaG90b25zIGlmIHRoZSBzdGF0ZSBvZiB0aGUgXCJNb3JlIFBob3RvbnNcIiBmZWF0dXJlIGNoYW5nZXMuICBUaGlzIGlzIG5lY2Vzc2FyeSBpbiBjYXNlIHRoZSBzdGF0ZVxyXG4gICAgLy8gY2hhbmdlcyB3aGlsZSB0aGUgc2ltIGlzIHBhdXNlZCwgc2luY2Ugb3RoZXJ3aXNlIHRoZSBwZXJpb2RpYyB1cGRhdGVzIHdvdWxkIGhhbmRsZSBpdC5cclxuICAgIHBob3RvbkNvbGxlY3Rpb24uc2hvd0FsbFNpbXVsYXRlZFBob3RvbnNJblZpZXdQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGxvY2FsIHZhcmlhYmxlcyBuZWVkZWQgZm9yIHRoZSBtZXRob2RzXHJcbiAgICB0aGlzLnNwcml0ZUluc3RhbmNlcyA9IHNwcml0ZUluc3RhbmNlcztcclxuICAgIHRoaXMucGhvdG9uQ29sbGVjdGlvbiA9IHBob3RvbkNvbGxlY3Rpb247XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuICAgIHRoaXMuaW5mcmFyZWRQaG90b25TcHJpdGUgPSBpbmZyYXJlZFBob3RvblNwcml0ZTtcclxuICAgIHRoaXMudmlzaWJsZVBob3RvblNwcml0ZSA9IHZpc2libGVQaG90b25TcHJpdGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIGluZm9ybWF0aW9uIG5lZWRlZCB0byByZW5kZXIgdGhlIHBob3RvbnMgYXMgc3ByaXRlcyBhbmQgdGhlbiB0cmlnZ2VyIGEgcmUtcmVuZGVyaW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgcGhvdG9ucyA9IHRoaXMucGhvdG9uQ29sbGVjdGlvbi5waG90b25zO1xyXG4gICAgY29uc3Qgc2hvd0FsbFBob3RvbnMgPSB0aGlzLnBob3RvbkNvbGxlY3Rpb24uc2hvd0FsbFNpbXVsYXRlZFBob3RvbnNJblZpZXdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGxldCBudW1iZXJPZlBob3RvbnNEaXNwbGF5ZWQgPSAwO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBob3RvbnMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyBDb252ZW5pZW5jZSBjb25zdGFudHMuXHJcbiAgICAgIGNvbnN0IHBob3RvbiA9IHBob3RvbnNbIGkgXTtcclxuICAgICAgY29uc3QgcGhvdG9uUG9zaXRpb24gPSBwaG90b24ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRoaXMgcGhvdG9uIHNob3VsZCBiZSBkaXNwbGF5ZWQuXHJcbiAgICAgIGNvbnN0IHNob3dUaGlzUGhvdG9uID0gKCBwaG90b24uc2hvd1N0YXRlID09PSBTaG93U3RhdGUuQUxXQVlTIHx8IHNob3dBbGxQaG90b25zICkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIT1JJWk9OVEFMX1JFTkRFUklOR19TUEFOLmNvbnRhaW5zKCBwaG90b25Qb3NpdGlvbi54ICk7XHJcblxyXG4gICAgICBpZiAoIHNob3dUaGlzUGhvdG9uICkge1xyXG5cclxuICAgICAgICBudW1iZXJPZlBob3RvbnNEaXNwbGF5ZWQrKztcclxuXHJcbiAgICAgICAgLy8gQWRkIGEgbmV3IHNwcml0ZSBpbnN0YW5jZSB0byBvdXIgbGlzdCBpZiB3ZSBkb24ndCBoYXZlIGVub3VnaC5cclxuICAgICAgICBpZiAoIG51bWJlck9mUGhvdG9uc0Rpc3BsYXllZCA+IHRoaXMuc3ByaXRlSW5zdGFuY2VzLmxlbmd0aCApIHtcclxuICAgICAgICAgIGNvbnN0IG5ld1Nwcml0ZUluc3RhbmNlID0gU3ByaXRlSW5zdGFuY2UucG9vbC5mZXRjaCgpO1xyXG4gICAgICAgICAgbmV3U3ByaXRlSW5zdGFuY2UudHJhbnNmb3JtVHlwZSA9IFNwcml0ZUluc3RhbmNlVHJhbnNmb3JtVHlwZS5BRkZJTkU7XHJcbiAgICAgICAgICB0aGlzLnNwcml0ZUluc3RhbmNlcy5wdXNoKCBuZXdTcHJpdGVJbnN0YW5jZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBtYXRyaXggdGhhdCBjb250cm9scyB3aGVyZSB0aGlzIHBob3RvbiBpcyByZW5kZXJlZC5cclxuICAgICAgICBjb25zdCBzcHJpdGVJbnN0YW5jZSA9IHRoaXMuc3ByaXRlSW5zdGFuY2VzWyBudW1iZXJPZlBob3RvbnNEaXNwbGF5ZWQgLSAxIF07XHJcbiAgICAgICAgc3ByaXRlSW5zdGFuY2Uuc3ByaXRlID0gcGhvdG9uLmlzVmlzaWJsZSA/IHRoaXMudmlzaWJsZVBob3RvblNwcml0ZSA6IHRoaXMuaW5mcmFyZWRQaG90b25TcHJpdGU7XHJcbiAgICAgICAgc3ByaXRlSW5zdGFuY2UubWF0cml4LnNldFRvQWZmaW5lKFxyXG4gICAgICAgICAgdGhpcy5waG90b25TY2FsZSxcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBob3RvblBvc2l0aW9uLnggKSxcclxuICAgICAgICAgIDAsXHJcbiAgICAgICAgICB0aGlzLnBob3RvblNjYWxlLFxyXG4gICAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBwaG90b25Qb3NpdGlvbi55IClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRnJlZSB1cCBhbnkgdW51c2VkIHNwcml0ZSBpbnN0YW5jZXMuXHJcbiAgICB3aGlsZSAoIHRoaXMuc3ByaXRlSW5zdGFuY2VzLmxlbmd0aCA+IG51bWJlck9mUGhvdG9uc0Rpc3BsYXllZCApIHtcclxuICAgICAgY29uc3QgdW51c2VkU3ByaXRlSW5zdGFuY2UgPSB0aGlzLnNwcml0ZUluc3RhbmNlcy5wb3AoKTtcclxuICAgICAgdW51c2VkU3ByaXRlSW5zdGFuY2UgJiYgdW51c2VkU3ByaXRlSW5zdGFuY2UuZnJlZVRvUG9vbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRyaWdnZXIgYSByZS1yZW5kZXJpbmcgb2YgdGhlIHNwcml0ZXMuXHJcbiAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ1Bob3RvblNwcml0ZXMnLCBQaG90b25TcHJpdGVzICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBob3RvblNwcml0ZXM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLE1BQU0sRUFBRUMsV0FBVyxFQUFFQyxjQUFjLEVBQUVDLDJCQUEyQixFQUFFQyxPQUFPLFFBQVEsZ0NBQWdDO0FBRTFILE9BQU9DLGtCQUFrQixNQUFNLG9DQUFvQztBQUNuRSxPQUFPQyxpQkFBaUIsTUFBTSxtQ0FBbUM7QUFDakUsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUVoRCxTQUFTQyxTQUFTLFFBQVEs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