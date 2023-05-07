// Copyright 2014-2023, University of Colorado Boulder

/**
 * A Scenery node that is used to show the user what they constructed for a 'Build it' style of challenge.  It can be
 * dynamically updated if needed.
 *
 * @author John Blanco
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';
import ColorProportionsPrompt from './ColorProportionsPrompt.js';
import FeedbackWindow from './FeedbackWindow.js';
const areaEqualsString = AreaBuilderStrings.areaEquals;
const perimeterEqualsString = AreaBuilderStrings.perimeterEquals;
const youBuiltString = AreaBuilderStrings.youBuilt;

// constants
const LINE_SPACING = 5;
class YouBuiltWindow extends FeedbackWindow {
  /**
   * Constructor for the window that shows the user what they built.  It is constructed with no contents, and the
   * contents are added later when the build spec is set.
   *
   * @param maxWidth
   * @param {Object} [options]
   */
  constructor(maxWidth, options) {
    super(youBuiltString, maxWidth, options);

    // Keep a snapshot of the currently portrayed build spec so that we can only update the portions that need it.
    this.currentBuildSpec = null;

    // area text
    this.areaTextNode = new Text(StringUtils.format(areaEqualsString, 99), {
      font: FeedbackWindow.NORMAL_TEXT_FONT,
      top: this.titleNode.bottom + LINE_SPACING
    });
    if (this.areaTextNode.width + 2 * FeedbackWindow.X_MARGIN > maxWidth) {
      // Scale this text to fit in the window.  Not an issue in English, but could be needed in translated versions.
      this.areaTextNode.scale((maxWidth - 2 * FeedbackWindow.X_MARGIN) / this.areaTextNode.width);
    }
    this.contentNode.addChild(this.areaTextNode);

    // perimeter text
    this.perimeterTextNode = new Text(StringUtils.format(perimeterEqualsString, 99), {
      font: FeedbackWindow.NORMAL_TEXT_FONT
    });
    if (this.perimeterTextNode.width + 2 * FeedbackWindow.X_MARGIN > maxWidth) {
      // Scale this text to fit in the window.  Not an issue in English, but could be needed in translated versions.
      this.perimeterTextNode.scale((maxWidth - 2 * FeedbackWindow.X_MARGIN) / this.perimeterTextNode.width);
    }

    // proportion info is initially set to null, added and removed when needed.
    this.proportionsInfoNode = null;
  }

  // @private
  proportionSpecsAreEqual(buildSpec1, buildSpec2) {
    // If one of the build specs is null and the other isn't, they aren't equal.
    if (buildSpec1 === null && buildSpec2 !== null || buildSpec1 !== null && buildSpec2 === null) {
      return false;
    }

    // If one has a proportions spec and the other doesn't, they aren't equal.
    if (buildSpec1.proportions && !buildSpec2.proportions || !buildSpec1.proportions && buildSpec2.proportions) {
      return false;
    }

    // If they both don't have a proportions spec, they are equal.
    if (!buildSpec1.proportions && !buildSpec2.proportions) {
      return true;
    }

    // At this point, both build specs appear to have proportions fields.  Verify that the fields are correct.
    assert && assert(buildSpec1.proportions.color1 && buildSpec1.proportions.color2 && buildSpec1.proportions.color1Proportion, 'malformed proportions specification');
    assert && assert(buildSpec2.proportions.color1 && buildSpec2.proportions.color2 && buildSpec2.proportions.color1Proportion, 'malformed proportions specification');

    // Return true if all elements of both proportions specs match, false otherwise.
    return buildSpec1.proportions.color1.equals(buildSpec2.proportions.color1) && buildSpec1.proportions.color2.equals(buildSpec2.proportions.color2) && buildSpec1.proportions.color1Proportion.equals(buildSpec2.proportions.color1Proportion);
  }

  // @public Sets the build spec that is currently being portrayed in the window.
  setBuildSpec(buildSpec) {
    // Set the area value, which is always shown.
    this.areaTextNode.string = StringUtils.format(areaEqualsString, buildSpec.area);

    // If proportions have changed, update them.  They sit beneath the area in the layout so that it is clear that
    // they go together.
    if (!this.proportionSpecsAreEqual(buildSpec, this.currentBuildSpec)) {
      if (this.proportionsInfoNode) {
        this.contentNode.removeChild(this.proportionsInfoNode);
        this.proportionsInfoNode = null;
      }
      if (buildSpec.proportions) {
        this.proportionsInfoNode = new ColorProportionsPrompt(buildSpec.proportions.color1, buildSpec.proportions.color2, buildSpec.proportions.color1Proportion, {
          top: this.areaTextNode.bottom + LINE_SPACING,
          multiLine: true
        }, {
          font: new PhetFont(14)
        });
        this.contentNode.addChild(this.proportionsInfoNode);
      }
    }

    // If perimeter is specified, update it, otherwise hide it.
    if (typeof buildSpec.perimeter !== 'undefined') {
      if (!this.contentNode.hasChild(this.perimeterTextNode)) {
        this.contentNode.addChild(this.perimeterTextNode);
      }
      this.perimeterTextNode.string = StringUtils.format(perimeterEqualsString, buildSpec.perimeter);
      this.perimeterTextNode.visible = true;
      this.perimeterTextNode.top = (this.proportionsInfoNode ? this.proportionsInfoNode.bottom : this.areaTextNode.bottom) + LINE_SPACING;
    } else if (this.contentNode.hasChild(this.perimeterTextNode)) {
      this.contentNode.removeChild(this.perimeterTextNode);
    }

    // Save a reference to this build spec.
    this.currentBuildSpec = buildSpec;
  }
}
areaBuilder.register('YouBuiltWindow', YouBuiltWindow);
export default YouBuiltWindow;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsIlBoZXRGb250IiwiVGV4dCIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTdHJpbmdzIiwiQ29sb3JQcm9wb3J0aW9uc1Byb21wdCIsIkZlZWRiYWNrV2luZG93IiwiYXJlYUVxdWFsc1N0cmluZyIsImFyZWFFcXVhbHMiLCJwZXJpbWV0ZXJFcXVhbHNTdHJpbmciLCJwZXJpbWV0ZXJFcXVhbHMiLCJ5b3VCdWlsdFN0cmluZyIsInlvdUJ1aWx0IiwiTElORV9TUEFDSU5HIiwiWW91QnVpbHRXaW5kb3ciLCJjb25zdHJ1Y3RvciIsIm1heFdpZHRoIiwib3B0aW9ucyIsImN1cnJlbnRCdWlsZFNwZWMiLCJhcmVhVGV4dE5vZGUiLCJmb3JtYXQiLCJmb250IiwiTk9STUFMX1RFWFRfRk9OVCIsInRvcCIsInRpdGxlTm9kZSIsImJvdHRvbSIsIndpZHRoIiwiWF9NQVJHSU4iLCJzY2FsZSIsImNvbnRlbnROb2RlIiwiYWRkQ2hpbGQiLCJwZXJpbWV0ZXJUZXh0Tm9kZSIsInByb3BvcnRpb25zSW5mb05vZGUiLCJwcm9wb3J0aW9uU3BlY3NBcmVFcXVhbCIsImJ1aWxkU3BlYzEiLCJidWlsZFNwZWMyIiwicHJvcG9ydGlvbnMiLCJhc3NlcnQiLCJjb2xvcjEiLCJjb2xvcjIiLCJjb2xvcjFQcm9wb3J0aW9uIiwiZXF1YWxzIiwic2V0QnVpbGRTcGVjIiwiYnVpbGRTcGVjIiwic3RyaW5nIiwiYXJlYSIsInJlbW92ZUNoaWxkIiwibXVsdGlMaW5lIiwicGVyaW1ldGVyIiwiaGFzQ2hpbGQiLCJ2aXNpYmxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJZb3VCdWlsdFdpbmRvdy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFNjZW5lcnkgbm9kZSB0aGF0IGlzIHVzZWQgdG8gc2hvdyB0aGUgdXNlciB3aGF0IHRoZXkgY29uc3RydWN0ZWQgZm9yIGEgJ0J1aWxkIGl0JyBzdHlsZSBvZiBjaGFsbGVuZ2UuICBJdCBjYW4gYmVcclxuICogZHluYW1pY2FsbHkgdXBkYXRlZCBpZiBuZWVkZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgQXJlYUJ1aWxkZXJTdHJpbmdzIGZyb20gJy4uLy4uL0FyZWFCdWlsZGVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBDb2xvclByb3BvcnRpb25zUHJvbXB0IGZyb20gJy4vQ29sb3JQcm9wb3J0aW9uc1Byb21wdC5qcyc7XHJcbmltcG9ydCBGZWVkYmFja1dpbmRvdyBmcm9tICcuL0ZlZWRiYWNrV2luZG93LmpzJztcclxuXHJcbmNvbnN0IGFyZWFFcXVhbHNTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MuYXJlYUVxdWFscztcclxuY29uc3QgcGVyaW1ldGVyRXF1YWxzU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLnBlcmltZXRlckVxdWFscztcclxuY29uc3QgeW91QnVpbHRTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MueW91QnVpbHQ7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTElORV9TUEFDSU5HID0gNTtcclxuXHJcbmNsYXNzIFlvdUJ1aWx0V2luZG93IGV4dGVuZHMgRmVlZGJhY2tXaW5kb3cge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgdGhlIHdpbmRvdyB0aGF0IHNob3dzIHRoZSB1c2VyIHdoYXQgdGhleSBidWlsdC4gIEl0IGlzIGNvbnN0cnVjdGVkIHdpdGggbm8gY29udGVudHMsIGFuZCB0aGVcclxuICAgKiBjb250ZW50cyBhcmUgYWRkZWQgbGF0ZXIgd2hlbiB0aGUgYnVpbGQgc3BlYyBpcyBzZXQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbWF4V2lkdGhcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1heFdpZHRoLCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCB5b3VCdWlsdFN0cmluZywgbWF4V2lkdGgsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBLZWVwIGEgc25hcHNob3Qgb2YgdGhlIGN1cnJlbnRseSBwb3J0cmF5ZWQgYnVpbGQgc3BlYyBzbyB0aGF0IHdlIGNhbiBvbmx5IHVwZGF0ZSB0aGUgcG9ydGlvbnMgdGhhdCBuZWVkIGl0LlxyXG4gICAgdGhpcy5jdXJyZW50QnVpbGRTcGVjID0gbnVsbDtcclxuXHJcbiAgICAvLyBhcmVhIHRleHRcclxuICAgIHRoaXMuYXJlYVRleHROb2RlID0gbmV3IFRleHQoIFN0cmluZ1V0aWxzLmZvcm1hdCggYXJlYUVxdWFsc1N0cmluZywgOTkgKSwge1xyXG4gICAgICBmb250OiBGZWVkYmFja1dpbmRvdy5OT1JNQUxfVEVYVF9GT05ULFxyXG4gICAgICB0b3A6IHRoaXMudGl0bGVOb2RlLmJvdHRvbSArIExJTkVfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG4gICAgaWYgKCB0aGlzLmFyZWFUZXh0Tm9kZS53aWR0aCArIDIgKiBGZWVkYmFja1dpbmRvdy5YX01BUkdJTiA+IG1heFdpZHRoICkge1xyXG4gICAgICAvLyBTY2FsZSB0aGlzIHRleHQgdG8gZml0IGluIHRoZSB3aW5kb3cuICBOb3QgYW4gaXNzdWUgaW4gRW5nbGlzaCwgYnV0IGNvdWxkIGJlIG5lZWRlZCBpbiB0cmFuc2xhdGVkIHZlcnNpb25zLlxyXG4gICAgICB0aGlzLmFyZWFUZXh0Tm9kZS5zY2FsZSggKCBtYXhXaWR0aCAtIDIgKiBGZWVkYmFja1dpbmRvdy5YX01BUkdJTiApIC8gdGhpcy5hcmVhVGV4dE5vZGUud2lkdGggKTtcclxuICAgIH1cclxuICAgIHRoaXMuY29udGVudE5vZGUuYWRkQ2hpbGQoIHRoaXMuYXJlYVRleHROb2RlICk7XHJcblxyXG4gICAgLy8gcGVyaW1ldGVyIHRleHRcclxuICAgIHRoaXMucGVyaW1ldGVyVGV4dE5vZGUgPSBuZXcgVGV4dCggU3RyaW5nVXRpbHMuZm9ybWF0KCBwZXJpbWV0ZXJFcXVhbHNTdHJpbmcsIDk5ICksIHtcclxuICAgICAgZm9udDogRmVlZGJhY2tXaW5kb3cuTk9STUFMX1RFWFRfRk9OVFxyXG4gICAgfSApO1xyXG4gICAgaWYgKCB0aGlzLnBlcmltZXRlclRleHROb2RlLndpZHRoICsgMiAqIEZlZWRiYWNrV2luZG93LlhfTUFSR0lOID4gbWF4V2lkdGggKSB7XHJcbiAgICAgIC8vIFNjYWxlIHRoaXMgdGV4dCB0byBmaXQgaW4gdGhlIHdpbmRvdy4gIE5vdCBhbiBpc3N1ZSBpbiBFbmdsaXNoLCBidXQgY291bGQgYmUgbmVlZGVkIGluIHRyYW5zbGF0ZWQgdmVyc2lvbnMuXHJcbiAgICAgIHRoaXMucGVyaW1ldGVyVGV4dE5vZGUuc2NhbGUoICggbWF4V2lkdGggLSAyICogRmVlZGJhY2tXaW5kb3cuWF9NQVJHSU4gKSAvIHRoaXMucGVyaW1ldGVyVGV4dE5vZGUud2lkdGggKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwcm9wb3J0aW9uIGluZm8gaXMgaW5pdGlhbGx5IHNldCB0byBudWxsLCBhZGRlZCBhbmQgcmVtb3ZlZCB3aGVuIG5lZWRlZC5cclxuICAgIHRoaXMucHJvcG9ydGlvbnNJbmZvTm9kZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvLyBAcHJpdmF0ZVxyXG4gIHByb3BvcnRpb25TcGVjc0FyZUVxdWFsKCBidWlsZFNwZWMxLCBidWlsZFNwZWMyICkge1xyXG5cclxuICAgIC8vIElmIG9uZSBvZiB0aGUgYnVpbGQgc3BlY3MgaXMgbnVsbCBhbmQgdGhlIG90aGVyIGlzbid0LCB0aGV5IGFyZW4ndCBlcXVhbC5cclxuICAgIGlmICggKCBidWlsZFNwZWMxID09PSBudWxsICYmIGJ1aWxkU3BlYzIgIT09IG51bGwgKSB8fCAoIGJ1aWxkU3BlYzEgIT09IG51bGwgJiYgYnVpbGRTcGVjMiA9PT0gbnVsbCApICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgb25lIGhhcyBhIHByb3BvcnRpb25zIHNwZWMgYW5kIHRoZSBvdGhlciBkb2Vzbid0LCB0aGV5IGFyZW4ndCBlcXVhbC5cclxuICAgIGlmICggKCBidWlsZFNwZWMxLnByb3BvcnRpb25zICYmICFidWlsZFNwZWMyLnByb3BvcnRpb25zICkgfHwgKCAhYnVpbGRTcGVjMS5wcm9wb3J0aW9ucyAmJiBidWlsZFNwZWMyLnByb3BvcnRpb25zICkgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGV5IGJvdGggZG9uJ3QgaGF2ZSBhIHByb3BvcnRpb25zIHNwZWMsIHRoZXkgYXJlIGVxdWFsLlxyXG4gICAgaWYgKCAhYnVpbGRTcGVjMS5wcm9wb3J0aW9ucyAmJiAhYnVpbGRTcGVjMi5wcm9wb3J0aW9ucyApIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXQgdGhpcyBwb2ludCwgYm90aCBidWlsZCBzcGVjcyBhcHBlYXIgdG8gaGF2ZSBwcm9wb3J0aW9ucyBmaWVsZHMuICBWZXJpZnkgdGhhdCB0aGUgZmllbGRzIGFyZSBjb3JyZWN0LlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYnVpbGRTcGVjMS5wcm9wb3J0aW9ucy5jb2xvcjEgJiYgYnVpbGRTcGVjMS5wcm9wb3J0aW9ucy5jb2xvcjIgJiYgYnVpbGRTcGVjMS5wcm9wb3J0aW9ucy5jb2xvcjFQcm9wb3J0aW9uLFxyXG4gICAgICAnbWFsZm9ybWVkIHByb3BvcnRpb25zIHNwZWNpZmljYXRpb24nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBidWlsZFNwZWMyLnByb3BvcnRpb25zLmNvbG9yMSAmJiBidWlsZFNwZWMyLnByb3BvcnRpb25zLmNvbG9yMiAmJiBidWlsZFNwZWMyLnByb3BvcnRpb25zLmNvbG9yMVByb3BvcnRpb24sXHJcbiAgICAgICdtYWxmb3JtZWQgcHJvcG9ydGlvbnMgc3BlY2lmaWNhdGlvbicgKTtcclxuXHJcbiAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBhbGwgZWxlbWVudHMgb2YgYm90aCBwcm9wb3J0aW9ucyBzcGVjcyBtYXRjaCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gICAgcmV0dXJuICggYnVpbGRTcGVjMS5wcm9wb3J0aW9ucy5jb2xvcjEuZXF1YWxzKCBidWlsZFNwZWMyLnByb3BvcnRpb25zLmNvbG9yMSApICYmXHJcbiAgICAgICAgICAgICBidWlsZFNwZWMxLnByb3BvcnRpb25zLmNvbG9yMi5lcXVhbHMoIGJ1aWxkU3BlYzIucHJvcG9ydGlvbnMuY29sb3IyICkgJiZcclxuICAgICAgICAgICAgIGJ1aWxkU3BlYzEucHJvcG9ydGlvbnMuY29sb3IxUHJvcG9ydGlvbi5lcXVhbHMoIGJ1aWxkU3BlYzIucHJvcG9ydGlvbnMuY29sb3IxUHJvcG9ydGlvbiApICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIFNldHMgdGhlIGJ1aWxkIHNwZWMgdGhhdCBpcyBjdXJyZW50bHkgYmVpbmcgcG9ydHJheWVkIGluIHRoZSB3aW5kb3cuXHJcbiAgc2V0QnVpbGRTcGVjKCBidWlsZFNwZWMgKSB7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBhcmVhIHZhbHVlLCB3aGljaCBpcyBhbHdheXMgc2hvd24uXHJcbiAgICB0aGlzLmFyZWFUZXh0Tm9kZS5zdHJpbmcgPSBTdHJpbmdVdGlscy5mb3JtYXQoIGFyZWFFcXVhbHNTdHJpbmcsIGJ1aWxkU3BlYy5hcmVhICk7XHJcblxyXG4gICAgLy8gSWYgcHJvcG9ydGlvbnMgaGF2ZSBjaGFuZ2VkLCB1cGRhdGUgdGhlbS4gIFRoZXkgc2l0IGJlbmVhdGggdGhlIGFyZWEgaW4gdGhlIGxheW91dCBzbyB0aGF0IGl0IGlzIGNsZWFyIHRoYXRcclxuICAgIC8vIHRoZXkgZ28gdG9nZXRoZXIuXHJcbiAgICBpZiAoICF0aGlzLnByb3BvcnRpb25TcGVjc0FyZUVxdWFsKCBidWlsZFNwZWMsIHRoaXMuY3VycmVudEJ1aWxkU3BlYyApICkge1xyXG4gICAgICBpZiAoIHRoaXMucHJvcG9ydGlvbnNJbmZvTm9kZSApIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLnByb3BvcnRpb25zSW5mb05vZGUgKTtcclxuICAgICAgICB0aGlzLnByb3BvcnRpb25zSW5mb05vZGUgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggYnVpbGRTcGVjLnByb3BvcnRpb25zICkge1xyXG4gICAgICAgIHRoaXMucHJvcG9ydGlvbnNJbmZvTm9kZSA9IG5ldyBDb2xvclByb3BvcnRpb25zUHJvbXB0KCBidWlsZFNwZWMucHJvcG9ydGlvbnMuY29sb3IxLFxyXG4gICAgICAgICAgYnVpbGRTcGVjLnByb3BvcnRpb25zLmNvbG9yMiwgYnVpbGRTcGVjLnByb3BvcnRpb25zLmNvbG9yMVByb3BvcnRpb24sIHtcclxuICAgICAgICAgICAgdG9wOiB0aGlzLmFyZWFUZXh0Tm9kZS5ib3R0b20gKyBMSU5FX1NQQUNJTkcsXHJcbiAgICAgICAgICAgIG11bHRpTGluZTogdHJ1ZVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0IClcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnROb2RlLmFkZENoaWxkKCB0aGlzLnByb3BvcnRpb25zSW5mb05vZGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHBlcmltZXRlciBpcyBzcGVjaWZpZWQsIHVwZGF0ZSBpdCwgb3RoZXJ3aXNlIGhpZGUgaXQuXHJcbiAgICBpZiAoIHR5cGVvZiAoIGJ1aWxkU3BlYy5wZXJpbWV0ZXIgKSAhPT0gJ3VuZGVmaW5lZCcgKSB7XHJcbiAgICAgIGlmICggIXRoaXMuY29udGVudE5vZGUuaGFzQ2hpbGQoIHRoaXMucGVyaW1ldGVyVGV4dE5vZGUgKSApIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnROb2RlLmFkZENoaWxkKCB0aGlzLnBlcmltZXRlclRleHROb2RlICk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5wZXJpbWV0ZXJUZXh0Tm9kZS5zdHJpbmcgPSBTdHJpbmdVdGlscy5mb3JtYXQoIHBlcmltZXRlckVxdWFsc1N0cmluZywgYnVpbGRTcGVjLnBlcmltZXRlciApO1xyXG4gICAgICB0aGlzLnBlcmltZXRlclRleHROb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB0aGlzLnBlcmltZXRlclRleHROb2RlLnRvcCA9ICggdGhpcy5wcm9wb3J0aW9uc0luZm9Ob2RlID8gdGhpcy5wcm9wb3J0aW9uc0luZm9Ob2RlLmJvdHRvbSA6IHRoaXMuYXJlYVRleHROb2RlLmJvdHRvbSApICsgTElORV9TUEFDSU5HO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuY29udGVudE5vZGUuaGFzQ2hpbGQoIHRoaXMucGVyaW1ldGVyVGV4dE5vZGUgKSApIHtcclxuICAgICAgdGhpcy5jb250ZW50Tm9kZS5yZW1vdmVDaGlsZCggdGhpcy5wZXJpbWV0ZXJUZXh0Tm9kZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNhdmUgYSByZWZlcmVuY2UgdG8gdGhpcyBidWlsZCBzcGVjLlxyXG4gICAgdGhpcy5jdXJyZW50QnVpbGRTcGVjID0gYnVpbGRTcGVjO1xyXG4gIH1cclxufVxyXG5cclxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdZb3VCdWlsdFdpbmRvdycsIFlvdUJ1aWx0V2luZG93ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFlvdUJ1aWx0V2lu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