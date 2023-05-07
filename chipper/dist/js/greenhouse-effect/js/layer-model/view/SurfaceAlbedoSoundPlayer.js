// Copyright 2022, University of Colorado Boulder

/**
 * SurfaceAlbedoSoundPlayer is used to produce sounds for the slider that controls surface albedo.  It is sound clip
 * with delay lines used to produce a variable echo effect.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import layerModelBaseSliderSound_mp3 from '../../../sounds/layerModelBaseSliderSound_mp3.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import phetAudioContext from '../../../../tambo/js/phetAudioContext.js';
import emptyApartmentBedroom06Resampled_mp3 from '../../../../tambo/sounds/emptyApartmentBedroom06Resampled_mp3.js';

// types for options

class SurfaceAlbedoSoundPlayer extends SoundGenerator {
  // sound clip that will be played when activity occurs
  primarySoundClip = new SoundClip(layerModelBaseSliderSound_mp3);

  // sound clip played at min and max values
  boundarySoundClip = new SoundClip(layerModelBaseSliderSound_mp3, {
    initialPlaybackRate: 0.667
  });
  constructor(surfaceAlbedoProperty, surfaceAlbedoRange, providedOptions) {
    super(providedOptions);

    // Make the number property and its range available to the methods.
    this.surfaceAlbedoProperty = surfaceAlbedoProperty;
    this.surfaceAlbedoRange = surfaceAlbedoRange;

    // Hook up the primary and boundary sound clips to the output.
    this.primarySoundClip.connect(this.masterGainNode);
    this.boundarySoundClip.connect(this.masterGainNode);

    // Add a convolver that will act as a reverb effect.
    const convolver = phetAudioContext.createConvolver();
    convolver.buffer = emptyApartmentBedroom06Resampled_mp3.audioBufferProperty.value;

    // Add a gain node that will be used for the reverb level.
    const reverbGainNode = phetAudioContext.createGain();

    // Connect things up.
    this.primarySoundClip.connect(convolver);
    this.boundarySoundClip.connect(convolver);
    convolver.connect(reverbGainNode);
    reverbGainNode.connect(this.masterGainNode);

    // Adjust the reverb level as the albedo changes, making it so that more reverb occurs with the higher levels of
    // surface albedo.
    surfaceAlbedoProperty.link(surfaceAlbedo => {
      const normalizedSurfaceAlbedo = (surfaceAlbedo - surfaceAlbedoRange.min) / surfaceAlbedoRange.getLength();
      const gainMultiplier = 0.4; // empirically determined to get the desired sound.
      reverbGainNode.gain.setTargetAtTime(normalizedSurfaceAlbedo * gainMultiplier, phetAudioContext.currentTime, 0.015);
    });
  }
  play() {
    const surfaceAlbedo = this.surfaceAlbedoProperty.value;
    if (surfaceAlbedo > this.surfaceAlbedoRange.min && surfaceAlbedo < this.surfaceAlbedoRange.max) {
      this.primarySoundClip.play();
    } else {
      this.boundarySoundClip.play();
    }
  }
  stop() {
    this.primarySoundClip.stop();
    this.boundarySoundClip.stop();
  }
}
greenhouseEffect.register('SurfaceAlbedoSoundPlayer', SurfaceAlbedoSoundPlayer);
export default SurfaceAlbedoSoundPlayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTb3VuZEdlbmVyYXRvciIsImdyZWVuaG91c2VFZmZlY3QiLCJsYXllck1vZGVsQmFzZVNsaWRlclNvdW5kX21wMyIsIlNvdW5kQ2xpcCIsInBoZXRBdWRpb0NvbnRleHQiLCJlbXB0eUFwYXJ0bWVudEJlZHJvb20wNlJlc2FtcGxlZF9tcDMiLCJTdXJmYWNlQWxiZWRvU291bmRQbGF5ZXIiLCJwcmltYXJ5U291bmRDbGlwIiwiYm91bmRhcnlTb3VuZENsaXAiLCJpbml0aWFsUGxheWJhY2tSYXRlIiwiY29uc3RydWN0b3IiLCJzdXJmYWNlQWxiZWRvUHJvcGVydHkiLCJzdXJmYWNlQWxiZWRvUmFuZ2UiLCJwcm92aWRlZE9wdGlvbnMiLCJjb25uZWN0IiwibWFzdGVyR2Fpbk5vZGUiLCJjb252b2x2ZXIiLCJjcmVhdGVDb252b2x2ZXIiLCJidWZmZXIiLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJyZXZlcmJHYWluTm9kZSIsImNyZWF0ZUdhaW4iLCJsaW5rIiwic3VyZmFjZUFsYmVkbyIsIm5vcm1hbGl6ZWRTdXJmYWNlQWxiZWRvIiwibWluIiwiZ2V0TGVuZ3RoIiwiZ2Fpbk11bHRpcGxpZXIiLCJnYWluIiwic2V0VGFyZ2V0QXRUaW1lIiwiY3VycmVudFRpbWUiLCJwbGF5IiwibWF4Iiwic3RvcCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3VyZmFjZUFsYmVkb1NvdW5kUGxheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTdXJmYWNlQWxiZWRvU291bmRQbGF5ZXIgaXMgdXNlZCB0byBwcm9kdWNlIHNvdW5kcyBmb3IgdGhlIHNsaWRlciB0aGF0IGNvbnRyb2xzIHN1cmZhY2UgYWxiZWRvLiAgSXQgaXMgc291bmQgY2xpcFxyXG4gKiB3aXRoIGRlbGF5IGxpbmVzIHVzZWQgdG8gcHJvZHVjZSBhIHZhcmlhYmxlIGVjaG8gZWZmZWN0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgU291bmRHZW5lcmF0b3IsIHsgU291bmRHZW5lcmF0b3JPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZEdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBsYXllck1vZGVsQmFzZVNsaWRlclNvdW5kX21wMyBmcm9tICcuLi8uLi8uLi9zb3VuZHMvbGF5ZXJNb2RlbEJhc2VTbGlkZXJTb3VuZF9tcDMuanMnO1xyXG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9UU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcclxuaW1wb3J0IGVtcHR5QXBhcnRtZW50QmVkcm9vbTA2UmVzYW1wbGVkX21wMyBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9zb3VuZHMvZW1wdHlBcGFydG1lbnRCZWRyb29tMDZSZXNhbXBsZWRfbXAzLmpzJztcclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5cclxuLy8gdHlwZXMgZm9yIG9wdGlvbnNcclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbnR5cGUgU3VyZmFjZUFsYmVkb1NvdW5kUGxheWVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU291bmRHZW5lcmF0b3JPcHRpb25zO1xyXG5cclxuY2xhc3MgU3VyZmFjZUFsYmVkb1NvdW5kUGxheWVyIGV4dGVuZHMgU291bmRHZW5lcmF0b3IgaW1wbGVtZW50cyBUU291bmRQbGF5ZXIge1xyXG5cclxuICAvLyBzb3VuZCBjbGlwIHRoYXQgd2lsbCBiZSBwbGF5ZWQgd2hlbiBhY3Rpdml0eSBvY2N1cnNcclxuICBwcml2YXRlIHJlYWRvbmx5IHByaW1hcnlTb3VuZENsaXA6IFNvdW5kQ2xpcCA9IG5ldyBTb3VuZENsaXAoIGxheWVyTW9kZWxCYXNlU2xpZGVyU291bmRfbXAzICk7XHJcblxyXG4gIC8vIHNvdW5kIGNsaXAgcGxheWVkIGF0IG1pbiBhbmQgbWF4IHZhbHVlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYm91bmRhcnlTb3VuZENsaXA6IFNvdW5kQ2xpcCA9IG5ldyBTb3VuZENsaXAoIGxheWVyTW9kZWxCYXNlU2xpZGVyU291bmRfbXAzLCB7XHJcbiAgICAgIGluaXRpYWxQbGF5YmFja1JhdGU6IDAuNjY3XHJcbiAgICB9XHJcbiAgKTtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzdXJmYWNlQWxiZWRvUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3VyZmFjZUFsYmVkb1JhbmdlOiBSYW5nZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdXJmYWNlQWxiZWRvUHJvcGVydHk6IE51bWJlclByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgc3VyZmFjZUFsYmVkb1JhbmdlOiBSYW5nZSxcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFN1cmZhY2VBbGJlZG9Tb3VuZFBsYXllck9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIE1ha2UgdGhlIG51bWJlciBwcm9wZXJ0eSBhbmQgaXRzIHJhbmdlIGF2YWlsYWJsZSB0byB0aGUgbWV0aG9kcy5cclxuICAgIHRoaXMuc3VyZmFjZUFsYmVkb1Byb3BlcnR5ID0gc3VyZmFjZUFsYmVkb1Byb3BlcnR5O1xyXG4gICAgdGhpcy5zdXJmYWNlQWxiZWRvUmFuZ2UgPSBzdXJmYWNlQWxiZWRvUmFuZ2U7XHJcblxyXG4gICAgLy8gSG9vayB1cCB0aGUgcHJpbWFyeSBhbmQgYm91bmRhcnkgc291bmQgY2xpcHMgdG8gdGhlIG91dHB1dC5cclxuICAgIHRoaXMucHJpbWFyeVNvdW5kQ2xpcC5jb25uZWN0KCB0aGlzLm1hc3RlckdhaW5Ob2RlICk7XHJcbiAgICB0aGlzLmJvdW5kYXJ5U291bmRDbGlwLmNvbm5lY3QoIHRoaXMubWFzdGVyR2Fpbk5vZGUgKTtcclxuXHJcbiAgICAvLyBBZGQgYSBjb252b2x2ZXIgdGhhdCB3aWxsIGFjdCBhcyBhIHJldmVyYiBlZmZlY3QuXHJcbiAgICBjb25zdCBjb252b2x2ZXIgPSBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUNvbnZvbHZlcigpO1xyXG4gICAgY29udm9sdmVyLmJ1ZmZlciA9IGVtcHR5QXBhcnRtZW50QmVkcm9vbTA2UmVzYW1wbGVkX21wMy5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIEFkZCBhIGdhaW4gbm9kZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgdGhlIHJldmVyYiBsZXZlbC5cclxuICAgIGNvbnN0IHJldmVyYkdhaW5Ob2RlID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcblxyXG4gICAgLy8gQ29ubmVjdCB0aGluZ3MgdXAuXHJcbiAgICB0aGlzLnByaW1hcnlTb3VuZENsaXAuY29ubmVjdCggY29udm9sdmVyICk7XHJcbiAgICB0aGlzLmJvdW5kYXJ5U291bmRDbGlwLmNvbm5lY3QoIGNvbnZvbHZlciApO1xyXG4gICAgY29udm9sdmVyLmNvbm5lY3QoIHJldmVyYkdhaW5Ob2RlICk7XHJcbiAgICByZXZlcmJHYWluTm9kZS5jb25uZWN0KCB0aGlzLm1hc3RlckdhaW5Ob2RlICk7XHJcblxyXG4gICAgLy8gQWRqdXN0IHRoZSByZXZlcmIgbGV2ZWwgYXMgdGhlIGFsYmVkbyBjaGFuZ2VzLCBtYWtpbmcgaXQgc28gdGhhdCBtb3JlIHJldmVyYiBvY2N1cnMgd2l0aCB0aGUgaGlnaGVyIGxldmVscyBvZlxyXG4gICAgLy8gc3VyZmFjZSBhbGJlZG8uXHJcbiAgICBzdXJmYWNlQWxiZWRvUHJvcGVydHkubGluayggc3VyZmFjZUFsYmVkbyA9PiB7XHJcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRTdXJmYWNlQWxiZWRvID0gKCBzdXJmYWNlQWxiZWRvIC0gc3VyZmFjZUFsYmVkb1JhbmdlLm1pbiApIC8gc3VyZmFjZUFsYmVkb1JhbmdlLmdldExlbmd0aCgpO1xyXG4gICAgICBjb25zdCBnYWluTXVsdGlwbGllciA9IDAuNDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBnZXQgdGhlIGRlc2lyZWQgc291bmQuXHJcbiAgICAgIHJldmVyYkdhaW5Ob2RlLmdhaW4uc2V0VGFyZ2V0QXRUaW1lKCBub3JtYWxpemVkU3VyZmFjZUFsYmVkbyAqIGdhaW5NdWx0aXBsaWVyLCBwaGV0QXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lLCAwLjAxNSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBsYXkoKTogdm9pZCB7XHJcbiAgICBjb25zdCBzdXJmYWNlQWxiZWRvID0gdGhpcy5zdXJmYWNlQWxiZWRvUHJvcGVydHkudmFsdWU7XHJcbiAgICBpZiAoIHN1cmZhY2VBbGJlZG8gPiB0aGlzLnN1cmZhY2VBbGJlZG9SYW5nZS5taW4gJiYgc3VyZmFjZUFsYmVkbyA8IHRoaXMuc3VyZmFjZUFsYmVkb1JhbmdlLm1heCApIHtcclxuICAgICAgdGhpcy5wcmltYXJ5U291bmRDbGlwLnBsYXkoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmJvdW5kYXJ5U291bmRDbGlwLnBsYXkoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdG9wKCk6IHZvaWQge1xyXG4gICAgdGhpcy5wcmltYXJ5U291bmRDbGlwLnN0b3AoKTtcclxuICAgIHRoaXMuYm91bmRhcnlTb3VuZENsaXAuc3RvcCgpO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ1N1cmZhY2VBbGJlZG9Tb3VuZFBsYXllcicsIFN1cmZhY2VBbGJlZG9Tb3VuZFBsYXllciApO1xyXG5leHBvcnQgZGVmYXVsdCBTdXJmYWNlQWxiZWRvU291bmRQbGF5ZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsY0FBYyxNQUFpQyx5REFBeUQ7QUFDL0csT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBRXhELE9BQU9DLDZCQUE2QixNQUFNLGtEQUFrRDtBQUM1RixPQUFPQyxTQUFTLE1BQU0sb0RBQW9EO0FBRTFFLE9BQU9DLGdCQUFnQixNQUFNLDBDQUEwQztBQUN2RSxPQUFPQyxvQ0FBb0MsTUFBTSxrRUFBa0U7O0FBR25IOztBQUlBLE1BQU1DLHdCQUF3QixTQUFTTixjQUFjLENBQXlCO0VBRTVFO0VBQ2lCTyxnQkFBZ0IsR0FBYyxJQUFJSixTQUFTLENBQUVELDZCQUE4QixDQUFDOztFQUU3RjtFQUNpQk0saUJBQWlCLEdBQWMsSUFBSUwsU0FBUyxDQUFFRCw2QkFBNkIsRUFBRTtJQUMxRk8sbUJBQW1CLEVBQUU7RUFDdkIsQ0FDRixDQUFDO0VBS01DLFdBQVdBLENBQUVDLHFCQUFxQyxFQUNyQ0Msa0JBQXlCLEVBQ3pCQyxlQUFpRCxFQUFHO0lBRXRFLEtBQUssQ0FBRUEsZUFBZ0IsQ0FBQzs7SUFFeEI7SUFDQSxJQUFJLENBQUNGLHFCQUFxQixHQUFHQSxxQkFBcUI7SUFDbEQsSUFBSSxDQUFDQyxrQkFBa0IsR0FBR0Esa0JBQWtCOztJQUU1QztJQUNBLElBQUksQ0FBQ0wsZ0JBQWdCLENBQUNPLE9BQU8sQ0FBRSxJQUFJLENBQUNDLGNBQWUsQ0FBQztJQUNwRCxJQUFJLENBQUNQLGlCQUFpQixDQUFDTSxPQUFPLENBQUUsSUFBSSxDQUFDQyxjQUFlLENBQUM7O0lBRXJEO0lBQ0EsTUFBTUMsU0FBUyxHQUFHWixnQkFBZ0IsQ0FBQ2EsZUFBZSxDQUFDLENBQUM7SUFDcERELFNBQVMsQ0FBQ0UsTUFBTSxHQUFHYixvQ0FBb0MsQ0FBQ2MsbUJBQW1CLENBQUNDLEtBQUs7O0lBRWpGO0lBQ0EsTUFBTUMsY0FBYyxHQUFHakIsZ0JBQWdCLENBQUNrQixVQUFVLENBQUMsQ0FBQzs7SUFFcEQ7SUFDQSxJQUFJLENBQUNmLGdCQUFnQixDQUFDTyxPQUFPLENBQUVFLFNBQVUsQ0FBQztJQUMxQyxJQUFJLENBQUNSLGlCQUFpQixDQUFDTSxPQUFPLENBQUVFLFNBQVUsQ0FBQztJQUMzQ0EsU0FBUyxDQUFDRixPQUFPLENBQUVPLGNBQWUsQ0FBQztJQUNuQ0EsY0FBYyxDQUFDUCxPQUFPLENBQUUsSUFBSSxDQUFDQyxjQUFlLENBQUM7O0lBRTdDO0lBQ0E7SUFDQUoscUJBQXFCLENBQUNZLElBQUksQ0FBRUMsYUFBYSxJQUFJO01BQzNDLE1BQU1DLHVCQUF1QixHQUFHLENBQUVELGFBQWEsR0FBR1osa0JBQWtCLENBQUNjLEdBQUcsSUFBS2Qsa0JBQWtCLENBQUNlLFNBQVMsQ0FBQyxDQUFDO01BQzNHLE1BQU1DLGNBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQztNQUM1QlAsY0FBYyxDQUFDUSxJQUFJLENBQUNDLGVBQWUsQ0FBRUwsdUJBQXVCLEdBQUdHLGNBQWMsRUFBRXhCLGdCQUFnQixDQUFDMkIsV0FBVyxFQUFFLEtBQU0sQ0FBQztJQUN0SCxDQUFFLENBQUM7RUFDTDtFQUVPQyxJQUFJQSxDQUFBLEVBQVM7SUFDbEIsTUFBTVIsYUFBYSxHQUFHLElBQUksQ0FBQ2IscUJBQXFCLENBQUNTLEtBQUs7SUFDdEQsSUFBS0ksYUFBYSxHQUFHLElBQUksQ0FBQ1osa0JBQWtCLENBQUNjLEdBQUcsSUFBSUYsYUFBYSxHQUFHLElBQUksQ0FBQ1osa0JBQWtCLENBQUNxQixHQUFHLEVBQUc7TUFDaEcsSUFBSSxDQUFDMUIsZ0JBQWdCLENBQUN5QixJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDLE1BQ0k7TUFDSCxJQUFJLENBQUN4QixpQkFBaUIsQ0FBQ3dCLElBQUksQ0FBQyxDQUFDO0lBQy9CO0VBQ0Y7RUFFT0UsSUFBSUEsQ0FBQSxFQUFTO0lBQ2xCLElBQUksQ0FBQzNCLGdCQUFnQixDQUFDMkIsSUFBSSxDQUFDLENBQUM7SUFDNUIsSUFBSSxDQUFDMUIsaUJBQWlCLENBQUMwQixJQUFJLENBQUMsQ0FBQztFQUMvQjtBQUNGO0FBRUFqQyxnQkFBZ0IsQ0FBQ2tDLFFBQVEsQ0FBRSwwQkFBMEIsRUFBRTdCLHdCQUF5QixDQUFDO0FBQ2pGLGVBQWVBLHdCQUF3QiJ9