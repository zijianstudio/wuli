// Copyright 2022, University of Colorado Boulder

import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import cardFlip_mp3 from '../../sounds/cardFlip_mp3.js';
import joist from '../joist.js';
class PreferencesTabSwitchSoundGenerator extends SoundClip {
  constructor(selectedTabProperty, options) {
    super(cardFlip_mp3, options);
    const playSound = () => {
      this.play();
    };
    selectedTabProperty.lazyLink(playSound);
    this.disposePreferencesTabSwitchSoundGenerator = () => {
      selectedTabProperty.unlink(playSound);
    };
  }

  /**
   * Release any memory references to avoid memory leaks.
   */
  dispose() {
    this.disposePreferencesTabSwitchSoundGenerator();
    super.dispose();
  }
}
joist.register('PreferencesTabSwitchSoundGenerator', PreferencesTabSwitchSoundGenerator);
export default PreferencesTabSwitchSoundGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTb3VuZENsaXAiLCJjYXJkRmxpcF9tcDMiLCJqb2lzdCIsIlByZWZlcmVuY2VzVGFiU3dpdGNoU291bmRHZW5lcmF0b3IiLCJjb25zdHJ1Y3RvciIsInNlbGVjdGVkVGFiUHJvcGVydHkiLCJvcHRpb25zIiwicGxheVNvdW5kIiwicGxheSIsImxhenlMaW5rIiwiZGlzcG9zZVByZWZlcmVuY2VzVGFiU3dpdGNoU291bmRHZW5lcmF0b3IiLCJ1bmxpbmsiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcmVmZXJlbmNlc1RhYlN3aXRjaFNvdW5kR2VuZXJhdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXAsIHsgU291bmRDbGlwT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcclxuaW1wb3J0IGNhcmRGbGlwX21wMyBmcm9tICcuLi8uLi9zb3VuZHMvY2FyZEZsaXBfbXAzLmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcclxuaW1wb3J0IFByZWZlcmVuY2VzVHlwZSBmcm9tICcuL1ByZWZlcmVuY2VzVHlwZS5qcyc7XHJcblxyXG5jbGFzcyBQcmVmZXJlbmNlc1RhYlN3aXRjaFNvdW5kR2VuZXJhdG9yIGV4dGVuZHMgU291bmRDbGlwIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUHJlZmVyZW5jZXNUYWJTd2l0Y2hTb3VuZEdlbmVyYXRvcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzZWxlY3RlZFRhYlByb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PFByZWZlcmVuY2VzVHlwZT4sIG9wdGlvbnM6IFNvdW5kQ2xpcE9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIGNhcmRGbGlwX21wMywgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHBsYXlTb3VuZCA9ICgpID0+IHsgdGhpcy5wbGF5KCk7IH07XHJcblxyXG4gICAgc2VsZWN0ZWRUYWJQcm9wZXJ0eS5sYXp5TGluayggcGxheVNvdW5kICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlUHJlZmVyZW5jZXNUYWJTd2l0Y2hTb3VuZEdlbmVyYXRvciA9ICgpID0+IHtcclxuICAgICAgc2VsZWN0ZWRUYWJQcm9wZXJ0eS51bmxpbmsoIHBsYXlTb3VuZCApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2UgYW55IG1lbW9yeSByZWZlcmVuY2VzIHRvIGF2b2lkIG1lbW9yeSBsZWFrcy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVByZWZlcmVuY2VzVGFiU3dpdGNoU291bmRHZW5lcmF0b3IoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmpvaXN0LnJlZ2lzdGVyKCAnUHJlZmVyZW5jZXNUYWJTd2l0Y2hTb3VuZEdlbmVyYXRvcicsIFByZWZlcmVuY2VzVGFiU3dpdGNoU291bmRHZW5lcmF0b3IgKTtcclxuZXhwb3J0IGRlZmF1bHQgUHJlZmVyZW5jZXNUYWJTd2l0Y2hTb3VuZEdlbmVyYXRvcjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFHQSxPQUFPQSxTQUFTLE1BQTRCLGlEQUFpRDtBQUM3RixPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBRy9CLE1BQU1DLGtDQUFrQyxTQUFTSCxTQUFTLENBQUM7RUFJbERJLFdBQVdBLENBQUVDLG1CQUF5RCxFQUFFQyxPQUF5QixFQUFHO0lBRXpHLEtBQUssQ0FBRUwsWUFBWSxFQUFFSyxPQUFRLENBQUM7SUFFOUIsTUFBTUMsU0FBUyxHQUFHQSxDQUFBLEtBQU07TUFBRSxJQUFJLENBQUNDLElBQUksQ0FBQyxDQUFDO0lBQUUsQ0FBQztJQUV4Q0gsbUJBQW1CLENBQUNJLFFBQVEsQ0FBRUYsU0FBVSxDQUFDO0lBRXpDLElBQUksQ0FBQ0cseUNBQXlDLEdBQUcsTUFBTTtNQUNyREwsbUJBQW1CLENBQUNNLE1BQU0sQ0FBRUosU0FBVSxDQUFDO0lBQ3pDLENBQUM7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7RUFDa0JLLE9BQU9BLENBQUEsRUFBUztJQUM5QixJQUFJLENBQUNGLHlDQUF5QyxDQUFDLENBQUM7SUFDaEQsS0FBSyxDQUFDRSxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFWLEtBQUssQ0FBQ1csUUFBUSxDQUFFLG9DQUFvQyxFQUFFVixrQ0FBbUMsQ0FBQztBQUMxRixlQUFlQSxrQ0FBa0MifQ==