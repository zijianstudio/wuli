// Copyright 2020-2022, University of Colorado Boulder

/**
 * OrganismSpriteInstance is a specialization of SpriteInstance for organisms (bunnies, wolves, shrubs).
 * It keeps a reference to the associated organism, and updates its transformation matrix to match the
 * organism's position and direction.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { SpriteInstance, SpriteInstanceTransformType } from '../../../../../scenery/js/imports.js';
import naturalSelection from '../../../naturalSelection.js';
import XDirection from '../../model/XDirection.js';
export default class OrganismSpriteInstance extends SpriteInstance {
  /**
   * @param organism
   * @param sprite
   * @param baseScale - the base amount to scale, tuned based on the PNG file dimensions
   */
  constructor(organism, sprite, baseScale) {
    assert && assert(baseScale > 0, `invalid baseScale: ${baseScale}`);
    super();
    this.organism = organism;
    this.baseScale = baseScale;

    // this.sprite is a field in super SpriteInstance
    this.sprite = sprite;

    // this.transformType is a field in super SpriteInstance.
    // Every Organism needs to be both translated and scaled because the view is a 2D projection of a 3D model position.
    this.transformType = SpriteInstanceTransformType.TRANSLATION_AND_SCALE;
    this.organismListener = this.updateMatrix.bind(this);

    // Update position and direction, unlink in dispose. Do not use a Multilink or define disposeOrganismSpriteInstance
    // because we will be creating a large number of OrganismSpriteInstance instances.
    this.organism.positionProperty.link(this.organismListener);
    this.organism.xDirectionProperty.link(this.organismListener);
  }

  /**
   * Updates the matrix to match the organism's position and xDirection.
   */
  updateMatrix() {
    const position = this.organism.positionProperty.value;
    const xDirection = this.organism.xDirectionProperty.value;

    // compute scale and position, in view coordinates
    const viewScale = this.baseScale * this.organism.modelViewTransform.getViewScale(position.z);
    const viewX = this.organism.modelViewTransform.modelToViewX(position);
    const viewY = this.organism.modelViewTransform.modelToViewY(position);

    // update the matrix in the most efficient way possible
    this.matrix.set00(viewScale * XDirection.toSign(xDirection)); // reflected to account for x direction
    this.matrix.set11(viewScale);
    this.matrix.set02(viewX);
    this.matrix.set12(viewY);
    assert && assert(this.matrix.isFinite(), 'matrix should be finite');
  }
  dispose() {
    this.organism.positionProperty.unlink(this.organismListener);
    this.organism.xDirectionProperty.unlink(this.organismListener);
  }
}
naturalSelection.register('OrganismSpriteInstance', OrganismSpriteInstance);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcHJpdGVJbnN0YW5jZSIsIlNwcml0ZUluc3RhbmNlVHJhbnNmb3JtVHlwZSIsIm5hdHVyYWxTZWxlY3Rpb24iLCJYRGlyZWN0aW9uIiwiT3JnYW5pc21TcHJpdGVJbnN0YW5jZSIsImNvbnN0cnVjdG9yIiwib3JnYW5pc20iLCJzcHJpdGUiLCJiYXNlU2NhbGUiLCJhc3NlcnQiLCJ0cmFuc2Zvcm1UeXBlIiwiVFJBTlNMQVRJT05fQU5EX1NDQUxFIiwib3JnYW5pc21MaXN0ZW5lciIsInVwZGF0ZU1hdHJpeCIsImJpbmQiLCJwb3NpdGlvblByb3BlcnR5IiwibGluayIsInhEaXJlY3Rpb25Qcm9wZXJ0eSIsInBvc2l0aW9uIiwidmFsdWUiLCJ4RGlyZWN0aW9uIiwidmlld1NjYWxlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiZ2V0Vmlld1NjYWxlIiwieiIsInZpZXdYIiwibW9kZWxUb1ZpZXdYIiwidmlld1kiLCJtb2RlbFRvVmlld1kiLCJtYXRyaXgiLCJzZXQwMCIsInRvU2lnbiIsInNldDExIiwic2V0MDIiLCJzZXQxMiIsImlzRmluaXRlIiwiZGlzcG9zZSIsInVubGluayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiT3JnYW5pc21TcHJpdGVJbnN0YW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBPcmdhbmlzbVNwcml0ZUluc3RhbmNlIGlzIGEgc3BlY2lhbGl6YXRpb24gb2YgU3ByaXRlSW5zdGFuY2UgZm9yIG9yZ2FuaXNtcyAoYnVubmllcywgd29sdmVzLCBzaHJ1YnMpLlxyXG4gKiBJdCBrZWVwcyBhIHJlZmVyZW5jZSB0byB0aGUgYXNzb2NpYXRlZCBvcmdhbmlzbSwgYW5kIHVwZGF0ZXMgaXRzIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCB0byBtYXRjaCB0aGVcclxuICogb3JnYW5pc20ncyBwb3NpdGlvbiBhbmQgZGlyZWN0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNwcml0ZSwgU3ByaXRlSW5zdGFuY2UsIFNwcml0ZUluc3RhbmNlVHJhbnNmb3JtVHlwZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBuYXR1cmFsU2VsZWN0aW9uIGZyb20gJy4uLy4uLy4uL25hdHVyYWxTZWxlY3Rpb24uanMnO1xyXG5pbXBvcnQgT3JnYW5pc20gZnJvbSAnLi4vLi4vbW9kZWwvT3JnYW5pc20uanMnO1xyXG5pbXBvcnQgWERpcmVjdGlvbiBmcm9tICcuLi8uLi9tb2RlbC9YRGlyZWN0aW9uLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yZ2FuaXNtU3ByaXRlSW5zdGFuY2UgZXh0ZW5kcyBTcHJpdGVJbnN0YW5jZSB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBvcmdhbmlzbTogT3JnYW5pc207XHJcbiAgcHJpdmF0ZSByZWFkb25seSBiYXNlU2NhbGU6IG51bWJlcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IG9yZ2FuaXNtTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBvcmdhbmlzbVxyXG4gICAqIEBwYXJhbSBzcHJpdGVcclxuICAgKiBAcGFyYW0gYmFzZVNjYWxlIC0gdGhlIGJhc2UgYW1vdW50IHRvIHNjYWxlLCB0dW5lZCBiYXNlZCBvbiB0aGUgUE5HIGZpbGUgZGltZW5zaW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3JnYW5pc206IE9yZ2FuaXNtLCBzcHJpdGU6IFNwcml0ZSwgYmFzZVNjYWxlOiBudW1iZXIgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFzZVNjYWxlID4gMCwgYGludmFsaWQgYmFzZVNjYWxlOiAke2Jhc2VTY2FsZX1gICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLm9yZ2FuaXNtID0gb3JnYW5pc207XHJcbiAgICB0aGlzLmJhc2VTY2FsZSA9IGJhc2VTY2FsZTtcclxuXHJcbiAgICAvLyB0aGlzLnNwcml0ZSBpcyBhIGZpZWxkIGluIHN1cGVyIFNwcml0ZUluc3RhbmNlXHJcbiAgICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcclxuXHJcbiAgICAvLyB0aGlzLnRyYW5zZm9ybVR5cGUgaXMgYSBmaWVsZCBpbiBzdXBlciBTcHJpdGVJbnN0YW5jZS5cclxuICAgIC8vIEV2ZXJ5IE9yZ2FuaXNtIG5lZWRzIHRvIGJlIGJvdGggdHJhbnNsYXRlZCBhbmQgc2NhbGVkIGJlY2F1c2UgdGhlIHZpZXcgaXMgYSAyRCBwcm9qZWN0aW9uIG9mIGEgM0QgbW9kZWwgcG9zaXRpb24uXHJcbiAgICB0aGlzLnRyYW5zZm9ybVR5cGUgPSBTcHJpdGVJbnN0YW5jZVRyYW5zZm9ybVR5cGUuVFJBTlNMQVRJT05fQU5EX1NDQUxFO1xyXG5cclxuICAgIHRoaXMub3JnYW5pc21MaXN0ZW5lciA9IHRoaXMudXBkYXRlTWF0cml4LmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgcG9zaXRpb24gYW5kIGRpcmVjdGlvbiwgdW5saW5rIGluIGRpc3Bvc2UuIERvIG5vdCB1c2UgYSBNdWx0aWxpbmsgb3IgZGVmaW5lIGRpc3Bvc2VPcmdhbmlzbVNwcml0ZUluc3RhbmNlXHJcbiAgICAvLyBiZWNhdXNlIHdlIHdpbGwgYmUgY3JlYXRpbmcgYSBsYXJnZSBudW1iZXIgb2YgT3JnYW5pc21TcHJpdGVJbnN0YW5jZSBpbnN0YW5jZXMuXHJcbiAgICB0aGlzLm9yZ2FuaXNtLnBvc2l0aW9uUHJvcGVydHkubGluayggdGhpcy5vcmdhbmlzbUxpc3RlbmVyICk7XHJcbiAgICB0aGlzLm9yZ2FuaXNtLnhEaXJlY3Rpb25Qcm9wZXJ0eS5saW5rKCB0aGlzLm9yZ2FuaXNtTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIG1hdHJpeCB0byBtYXRjaCB0aGUgb3JnYW5pc20ncyBwb3NpdGlvbiBhbmQgeERpcmVjdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZU1hdHJpeCgpOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMub3JnYW5pc20ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHhEaXJlY3Rpb24gPSB0aGlzLm9yZ2FuaXNtLnhEaXJlY3Rpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBjb21wdXRlIHNjYWxlIGFuZCBwb3NpdGlvbiwgaW4gdmlldyBjb29yZGluYXRlc1xyXG4gICAgY29uc3Qgdmlld1NjYWxlID0gdGhpcy5iYXNlU2NhbGUgKiB0aGlzLm9yZ2FuaXNtLm1vZGVsVmlld1RyYW5zZm9ybS5nZXRWaWV3U2NhbGUoIHBvc2l0aW9uLnogKTtcclxuICAgIGNvbnN0IHZpZXdYID0gdGhpcy5vcmdhbmlzbS5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBwb3NpdGlvbiApO1xyXG4gICAgY29uc3Qgdmlld1kgPSB0aGlzLm9yZ2FuaXNtLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIHBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBtYXRyaXggaW4gdGhlIG1vc3QgZWZmaWNpZW50IHdheSBwb3NzaWJsZVxyXG4gICAgdGhpcy5tYXRyaXguc2V0MDAoIHZpZXdTY2FsZSAqIFhEaXJlY3Rpb24udG9TaWduKCB4RGlyZWN0aW9uICkgKTsgLy8gcmVmbGVjdGVkIHRvIGFjY291bnQgZm9yIHggZGlyZWN0aW9uXHJcbiAgICB0aGlzLm1hdHJpeC5zZXQxMSggdmlld1NjYWxlICk7XHJcbiAgICB0aGlzLm1hdHJpeC5zZXQwMiggdmlld1ggKTtcclxuICAgIHRoaXMubWF0cml4LnNldDEyKCB2aWV3WSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tYXRyaXguaXNGaW5pdGUoKSwgJ21hdHJpeCBzaG91bGQgYmUgZmluaXRlJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLm9yZ2FuaXNtLnBvc2l0aW9uUHJvcGVydHkudW5saW5rKCB0aGlzLm9yZ2FuaXNtTGlzdGVuZXIgKTtcclxuICAgIHRoaXMub3JnYW5pc20ueERpcmVjdGlvblByb3BlcnR5LnVubGluayggdGhpcy5vcmdhbmlzbUxpc3RlbmVyICk7XHJcbiAgfVxyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnT3JnYW5pc21TcHJpdGVJbnN0YW5jZScsIE9yZ2FuaXNtU3ByaXRlSW5zdGFuY2UgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQWlCQSxjQUFjLEVBQUVDLDJCQUEyQixRQUFRLHNDQUFzQztBQUMxRyxPQUFPQyxnQkFBZ0IsTUFBTSw4QkFBOEI7QUFFM0QsT0FBT0MsVUFBVSxNQUFNLDJCQUEyQjtBQUVsRCxlQUFlLE1BQU1DLHNCQUFzQixTQUFTSixjQUFjLENBQUM7RUFNakU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTSyxXQUFXQSxDQUFFQyxRQUFrQixFQUFFQyxNQUFjLEVBQUVDLFNBQWlCLEVBQUc7SUFFMUVDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxTQUFTLEdBQUcsQ0FBQyxFQUFHLHNCQUFxQkEsU0FBVSxFQUFFLENBQUM7SUFFcEUsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNGLFFBQVEsR0FBR0EsUUFBUTtJQUN4QixJQUFJLENBQUNFLFNBQVMsR0FBR0EsU0FBUzs7SUFFMUI7SUFDQSxJQUFJLENBQUNELE1BQU0sR0FBR0EsTUFBTTs7SUFFcEI7SUFDQTtJQUNBLElBQUksQ0FBQ0csYUFBYSxHQUFHVCwyQkFBMkIsQ0FBQ1UscUJBQXFCO0lBRXRFLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDQyxZQUFZLENBQUNDLElBQUksQ0FBRSxJQUFLLENBQUM7O0lBRXREO0lBQ0E7SUFDQSxJQUFJLENBQUNSLFFBQVEsQ0FBQ1MsZ0JBQWdCLENBQUNDLElBQUksQ0FBRSxJQUFJLENBQUNKLGdCQUFpQixDQUFDO0lBQzVELElBQUksQ0FBQ04sUUFBUSxDQUFDVyxrQkFBa0IsQ0FBQ0QsSUFBSSxDQUFFLElBQUksQ0FBQ0osZ0JBQWlCLENBQUM7RUFDaEU7O0VBRUE7QUFDRjtBQUNBO0VBQ1VDLFlBQVlBLENBQUEsRUFBUztJQUUzQixNQUFNSyxRQUFRLEdBQUcsSUFBSSxDQUFDWixRQUFRLENBQUNTLGdCQUFnQixDQUFDSSxLQUFLO0lBQ3JELE1BQU1DLFVBQVUsR0FBRyxJQUFJLENBQUNkLFFBQVEsQ0FBQ1csa0JBQWtCLENBQUNFLEtBQUs7O0lBRXpEO0lBQ0EsTUFBTUUsU0FBUyxHQUFHLElBQUksQ0FBQ2IsU0FBUyxHQUFHLElBQUksQ0FBQ0YsUUFBUSxDQUFDZ0Isa0JBQWtCLENBQUNDLFlBQVksQ0FBRUwsUUFBUSxDQUFDTSxDQUFFLENBQUM7SUFDOUYsTUFBTUMsS0FBSyxHQUFHLElBQUksQ0FBQ25CLFFBQVEsQ0FBQ2dCLGtCQUFrQixDQUFDSSxZQUFZLENBQUVSLFFBQVMsQ0FBQztJQUN2RSxNQUFNUyxLQUFLLEdBQUcsSUFBSSxDQUFDckIsUUFBUSxDQUFDZ0Isa0JBQWtCLENBQUNNLFlBQVksQ0FBRVYsUUFBUyxDQUFDOztJQUV2RTtJQUNBLElBQUksQ0FBQ1csTUFBTSxDQUFDQyxLQUFLLENBQUVULFNBQVMsR0FBR2xCLFVBQVUsQ0FBQzRCLE1BQU0sQ0FBRVgsVUFBVyxDQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLElBQUksQ0FBQ1MsTUFBTSxDQUFDRyxLQUFLLENBQUVYLFNBQVUsQ0FBQztJQUM5QixJQUFJLENBQUNRLE1BQU0sQ0FBQ0ksS0FBSyxDQUFFUixLQUFNLENBQUM7SUFDMUIsSUFBSSxDQUFDSSxNQUFNLENBQUNLLEtBQUssQ0FBRVAsS0FBTSxDQUFDO0lBQzFCbEIsTUFBTSxJQUFJQSxNQUFNLENBQUUsSUFBSSxDQUFDb0IsTUFBTSxDQUFDTSxRQUFRLENBQUMsQ0FBQyxFQUFFLHlCQUEwQixDQUFDO0VBQ3ZFO0VBRU9DLE9BQU9BLENBQUEsRUFBUztJQUNyQixJQUFJLENBQUM5QixRQUFRLENBQUNTLGdCQUFnQixDQUFDc0IsTUFBTSxDQUFFLElBQUksQ0FBQ3pCLGdCQUFpQixDQUFDO0lBQzlELElBQUksQ0FBQ04sUUFBUSxDQUFDVyxrQkFBa0IsQ0FBQ29CLE1BQU0sQ0FBRSxJQUFJLENBQUN6QixnQkFBaUIsQ0FBQztFQUNsRTtBQUNGO0FBRUFWLGdCQUFnQixDQUFDb0MsUUFBUSxDQUFFLHdCQUF3QixFQUFFbEMsc0JBQXVCLENBQUMifQ==