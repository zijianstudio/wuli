// Copyright 2018-2023, University of Colorado Boulder

/**
 * Responsible for logic associated with the formation of audio description strings related to the positions of the
 * ISLCObject instances and interactions associated with the changes of those positions.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import inverseSquareLawCommon from '../../inverseSquareLawCommon.js';
import InverseSquareLawCommonStrings from '../../InverseSquareLawCommonStrings.js';
import ISLCObjectEnum from '../../model/ISLCObjectEnum.js';
import ISLCDescriber from './ISLCDescriber.js';
const unitsMetersString = InverseSquareLawCommonStrings.units.meters;
const unitsMeterString = InverseSquareLawCommonStrings.units.meter;
const objectLabelPositionPatternString = InverseSquareLawCommonStrings.a11y.sphere.objectLabelPositionPattern;
const distanceAndValueSummaryPatternString = InverseSquareLawCommonStrings.a11y.screenSummary.distanceAndValueSummaryPattern;
const qualitativeDistanceEachOtherPatternString = InverseSquareLawCommonStrings.a11y.screenSummary.qualitativeDistanceEachOtherPattern;
const centersExactlyPatternString = InverseSquareLawCommonStrings.a11y.screenSummary.centersExactlyPattern;
const quantitativeAndQualitativePatternString = InverseSquareLawCommonStrings.a11y.screenSummary.quantitativeAndQualitativePattern;
const centersOfObjectsDistancePatternString = InverseSquareLawCommonStrings.a11y.screenSummary.centersOfObjectsDistancePattern;
const positionDistanceFromOtherObjectPatternString = InverseSquareLawCommonStrings.a11y.position.valuetext.positionDistanceFromOtherObjectPattern;
const positionProgressOrLandmarkClauseString = InverseSquareLawCommonStrings.a11y.positionProgressOrLandmarkClause;
const distanceAndUnitsPatternString = InverseSquareLawCommonStrings.a11y.position.valuetext.distanceAndUnitsPattern;
const centersApartPatternString = InverseSquareLawCommonStrings.a11y.position.valuetext.centersApartPattern;
const quantitativeDistancePatternString = InverseSquareLawCommonStrings.a11y.position.valuetext.quantitativeDistancePattern;
const distanceFromOtherObjectPatternString = InverseSquareLawCommonStrings.a11y.position.valuetext.distanceFromOtherObjectPattern;
const distanceFromOtherObjectSentencePatternString = InverseSquareLawCommonStrings.a11y.position.valuetext.distanceFromOtherObjectSentencePattern;
const farthestFromString = InverseSquareLawCommonStrings.a11y.qualitative.farthestFrom;
const extremelyFarFromString = InverseSquareLawCommonStrings.a11y.qualitative.extremelyFarFrom;
const veryFarFromString = InverseSquareLawCommonStrings.a11y.qualitative.veryFarFrom;
const farFromString = InverseSquareLawCommonStrings.a11y.qualitative.farFrom;
const notSoCloseToString = InverseSquareLawCommonStrings.a11y.qualitative.notSoCloseTo;
const closeToString = InverseSquareLawCommonStrings.a11y.qualitative.closeTo;
const veryCloseToString = InverseSquareLawCommonStrings.a11y.qualitative.veryCloseTo;
const extremelyCloseToString = InverseSquareLawCommonStrings.a11y.qualitative.extremelyCloseTo;
const closestToString = InverseSquareLawCommonStrings.a11y.qualitative.closestTo;
const farthestFromCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.farthestFromCapitalized;
const extremelyFarFromCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.extremelyFarFromCapitalized;
const veryFarFromCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.veryFarFromCapitalized;
const farFromCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.farFromCapitalized;
const notSoCloseToCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.notSoCloseToCapitalized;
const closeToCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.closeToCapitalized;
const veryCloseToCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.veryCloseToCapitalized;
const extremelyCloseToCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.extremelyCloseToCapitalized;
const closestToCapitalizedString = InverseSquareLawCommonStrings.a11y.qualitative.closestToCapitalized;
const closerString = InverseSquareLawCommonStrings.a11y.qualitative.closer;
const fartherAwayString = InverseSquareLawCommonStrings.a11y.qualitative.fartherAway;
const distanceApartPatternString = InverseSquareLawCommonStrings.a11y.sphere.distanceApartPattern;
const spherePositionHelpTextString = InverseSquareLawCommonStrings.a11y.sphere.positionHelpText;

// track landmarks
const leftSideOfTrackString = InverseSquareLawCommonStrings.a11y.position.landmarks.leftSideOfTrack;
const rightSideOfTrackString = InverseSquareLawCommonStrings.a11y.position.landmarks.rightSideOfTrack;
const lastStopRightString = InverseSquareLawCommonStrings.a11y.position.landmarks.lastStopRight;
const lastStopLeftString = InverseSquareLawCommonStrings.a11y.position.landmarks.lastStopLeft;
const voicingLevelsMassQuantitativePatternString = InverseSquareLawCommonStrings.a11y.voicing.levels.massQuantitativePattern;
const voicingLevelsMassQualitativePatternString = InverseSquareLawCommonStrings.a11y.voicing.levels.massQualitativePattern;
const voicingLevelsMassQuantitativeWithoutLabelPatternString = InverseSquareLawCommonStrings.a11y.voicing.levels.massQuantitativeWithoutLabelPattern;
const voicingLevelsMassQualitativeWithoutLabelPatternString = InverseSquareLawCommonStrings.a11y.voicing.levels.massQualitativeWithoutLabelPattern;
const RELATIVE_DISTANCE_STRINGS = [farthestFromString, extremelyFarFromString, veryFarFromString, farFromString, notSoCloseToString, closeToString, veryCloseToString, extremelyCloseToString, closestToString];
const RELATIVE_DISTANCE_STRINGS_CAPITALIZED = [farthestFromCapitalizedString, extremelyFarFromCapitalizedString, veryFarFromCapitalizedString, farFromCapitalizedString, notSoCloseToCapitalizedString, closeToCapitalizedString, veryCloseToCapitalizedString, extremelyCloseToCapitalizedString, closestToCapitalizedString];
class PositionDescriber extends ISLCDescriber {
  /**
   * @param {ISLCModel} model
   * @param {string} object1Label
   * @param {string} object2Label
   * @param {Object} [options]
   */
  constructor(model, object1Label, object2Label, options) {
    super(model, object1Label, object2Label);
    options = merge({
      unit: unitsMeterString,
      units: unitsMetersString,
      // {function(number):number} - convert to display distance for PDOM descriptions
      formatDisplayDistance: _.identity
    }, options);

    // @public
    this.unit = options.unit;

    // @private
    this.units = options.units; // {string}
    this.formatDisplayDistance = options.formatDisplayDistance;

    // @private {number} - in meters, already converted with optional formatting function
    this.distanceBetween = 0;

    // @private {NumberProperty}
    this.separationProperty = model.separationProperty;

    // @private {number}
    this.rightObjectBoundary = model.rightObjectBoundary;
    this.leftObjectBoundary = model.leftObjectBoundary;

    // @private {number} - in converted distance
    this.oldDistanceBetween = 0;

    // @public {boolean|null} - previous value of this.movedCloser
    this.lastMoveCloser = false;

    // @private {boolean|null} - Whether the masses moved closer last position change. only set when an object
    // is dragging. `null` if the user isn't interacting specifically with the objects
    this.movedCloser = false;

    // @protected {boolean}  - Many descriptions use a quantitative form when distance values are showing, and use qualitative
    // descriptions when distance values are hidden. Furthermore some descriptions in the REGULAR version are
    // "simplified" from quantitative to qualitative forms in the BASICS version. False means qualitative.
    // see https://github.com/phetsims/gravity-force-lab-basics/issues/88
    this.useQuantitativeDistance = true;
    Multilink.multilink([this.object1.positionProperty, this.object2.positionProperty], (x1, x2) => {
      // set former values
      this.oldDistanceBetween = this.distanceBetween;
      this.lastMoveCloser = this.movedCloser;

      // update current values
      this.distanceBetween = this.formatDisplayDistance(Math.abs(x1 - x2));

      // only set movedCloser if the user is manipulating the value, null otherwise for comparison on focus
      if (this.object1.isDraggingProperty.get() || this.object2.isDraggingProperty.get()) {
        this.movedCloser = this.distanceBetween < this.oldDistanceBetween;
      } else {
        this.movedCloser = null;
      }
    });
  }

  /**
   * Like "close to each other" or "far from each other"
   * @protected
   * @returns {string}
   */
  getQualitativeDistanceFromEachOther() {
    return StringUtils.fillIn(qualitativeDistanceEachOtherPatternString, {
      qualitativeDistance: this.getQualitativeRelativeDistanceRegion()
    });
  }

  /**
   * Returns the string used in the screen summary item displaying position/distance information:
   * '{{object1Label}} and {{object2Label}} are {{qualitativeDistance}} each other, centers exactly {{distance}} {{units}} apart.'
   * GFLB can toggle if distance is showing, and so additional logic is added here to support removing the quantitative
   * "centers exactly" suffix.
   * @returns {string}
   * @public
   */
  getObjectDistanceSummary() {
    const qualitativeDistanceClause = StringUtils.fillIn(distanceAndValueSummaryPatternString, {
      object1Label: this.object1Label,
      object2Label: this.object2Label,
      qualitativeDistanceFromEachOther: this.getQualitativeDistanceFromEachOther()
    });
    const quantitativeDistanceClause = StringUtils.fillIn(centersExactlyPatternString, {
      distanceAndUnits: this.getDistanceAndUnits()
    });
    let summary = StringUtils.fillIn(quantitativeAndQualitativePatternString, {
      qualitativeClause: qualitativeDistanceClause,
      quantitativeClause: this.useQuantitativeDistance ? quantitativeDistanceClause : ''
    });

    // if we don't want the "centers exactly" suffix, then add "Centers of" as a prefix
    if (!this.useQuantitativeDistance) {
      summary = StringUtils.fillIn(centersOfObjectsDistancePatternString, {
        objectsDistanceClause: summary
      });
    }
    return summary;
  }

  /**
   * @protected
   * @returns {string}
   */
  getDistanceAndUnits() {
    const distance = this.distanceBetween;
    let units = this.units;

    // singular if there is only '1'
    if (distance === 1) {
      units = this.unit;
    }
    return StringUtils.fillIn(distanceAndUnitsPatternString, {
      distance: distance,
      units: units
    });
  }

  /**
   * Returns a string describing the distance between centers, something like
   * "Centers of spheres, 4 kilometers apart."
   *
   * @public
   * @returns {*|string}
   */
  getCentersApartDistance() {
    return StringUtils.fillIn(centersApartPatternString, {
      distanceAndUnits: this.getDistanceAndUnits()
    });
  }

  /**
   * Fill in distance and units into quantitative clause
   * @private
   * @returns {string}
   */
  getQuantitativeDistanceClause() {
    return StringUtils.fillIn(quantitativeDistancePatternString, {
      distanceAndUnits: this.getDistanceAndUnits()
    });
  }

  /**
   * Depending on whether or not quantitative distance is set, get the appropriate distance string.
   * @param {ISLCObjectEnum} thisObjectEnum
   * @returns {string}
   * @public
   */
  getDistanceClause(thisObjectEnum) {
    const otherObjectLabel = this.getOtherObjectLabelFromEnum(thisObjectEnum);
    const distanceClause = this.useQuantitativeDistance ? this.getQuantitativeDistanceClause() : this.getQualitativeRelativeDistanceRegion();
    return StringUtils.fillIn(distanceFromOtherObjectPatternString, {
      distance: distanceClause,
      otherObjectLabel: otherObjectLabel
    });
  }

  /**
   * There are only two positional regions, left/right side of track.
   * @param {ISLCObjectEnum} objectEnum
   * @returns {string}
   * @private
   */
  getCurrentPositionRegion(objectEnum) {
    // objects not touching any boundary, based on the side relative to the center
    const object = this.getObjectFromEnum(objectEnum);
    return object.positionProperty.get() < 0 ? leftSideOfTrackString : rightSideOfTrackString;
  }

  /**
   * Returns a string describing the progress of motion of the object. Either "Closer" or "Farther Away".
   * @public
   * @returns {string}
   */
  getProgressClause() {
    return this.movedCloser ? closerString : fartherAwayString;
  }

  /**
   * Get the position change clause, like closer/farther strings.
   * @param {ISLCObject} object
   * @param {boolean} alwaysIncludeProgressClause
   * @returns {string|null} - null if there isn't a position progress or landmark clause
   * @public
   */
  getPositionProgressOrLandmarkClause(object, alwaysIncludeProgressClause) {
    const objectEnum = object.enum;
    let positionString = this.getProgressClause();

    // object 1 touching left
    if (this.object1AtMin(objectEnum)) {
      positionString = lastStopLeftString;
    }

    // object 2 touching right
    else if (this.object2AtMax(objectEnum)) {
      positionString = lastStopRightString;
    }

    // objects touching each other
    else if (this.objectTouchingBoundary(objectEnum)) {
      positionString = ISLCObjectEnum.isObject1(objectEnum) ? lastStopRightString : lastStopLeftString;
    }

    // No change, so if not covered by above edge cases, there shouldn't be a progress clause
    else if (this.lastMoveCloser === this.movedCloser && !alwaysIncludeProgressClause) {
      return null;
    }
    return StringUtils.fillIn(positionProgressOrLandmarkClauseString, {
      progressOrLandmark: positionString
    });
  }

  /**
   * Returns a function used by AccessibleSlider to format its aria-valuetext attribute. Of note is that this function
   * is called AFTER the Slider's position Property has been set. Since, the PositionDescriber links to the PositionProperty
   * prior to the call to super to initialize AccessibleSlider, we can ensure that PositionDescribers dynamic properties (e.g. distanceBetween )
   * will be accurate when the below function is called.
   *
   * @param  {ISLCObjectEnum} objectEnum
   * @returns {Function}
   * @public
   */
  getPositionAriaValueTextCreator(objectEnum) {
    // By initializing to the current value, regions will only be displayed when on region change, and not on startup.
    const previousPositionRegionProperty = new StringProperty(this.getCurrentPositionRegion(objectEnum));

    // NOTE: AccessibleValueHandler supports parameters to this function, but recognize that subtypes override this
    // method before adding these, see https://github.com/phetsims/gravity-force-lab-basics/issues/113
    const valueTextCreator = () => {
      const distanceClause = this.getDistanceClause(objectEnum);
      const newPositionRegion = this.getCurrentPositionRegion(objectEnum);

      // Only include the region if it is different from the previous. The key
      if (previousPositionRegionProperty.value !== newPositionRegion) {
        previousPositionRegionProperty.value = newPositionRegion;
        return StringUtils.fillIn(positionDistanceFromOtherObjectPatternString, {
          positionRegion: newPositionRegion,
          distanceFromOtherObject: distanceClause
        });
      } else {
        return this.getDistanceFromOtherObjectDescription(objectEnum);
      }
    };

    /**
     * {function} - reset the valueTextCreator
     */
    valueTextCreator.reset = () => {
      previousPositionRegionProperty.reset();
    };
    return valueTextCreator;
  }

  /**
   * Get a description of the distance this object is from another, returning something like
   * "5.8 Kilometers from Mass 1."
   * @public
   *
   * @param {ISLCObjectEnum} objectEnum
   * @returns {string}
   */
  getDistanceFromOtherObjectDescription(objectEnum) {
    const distanceClause = this.getDistanceClause(objectEnum);
    return StringUtils.fillIn(distanceFromOtherObjectSentencePatternString, {
      distanceFromOtherObject: distanceClause
    });
  }

  /**
   * @param {ISLCObjectEnum} objectEnum
   * @returns {boolean} - returns false if provided enum is not object1
   * @private
   */
  object1AtMin(objectEnum) {
    return ISLCObjectEnum.isObject1(objectEnum) && this.objectAtTouchingMin(objectEnum);
  }

  /**
   * @param {ISLCObjectEnum} objectEnum
   * @returns {boolean} - returns false if provided enum is not object2
   * @public
   */
  object2AtMax(objectEnum) {
    return ISLCObjectEnum.isObject2(objectEnum) && this.objectAtTouchingMax(objectEnum);
  }

  /**
   * Returns true if the model object associated with the passed-in enum is at the left/right boundary of the object's
   * available movement. This means that if a mass can't move left anymore because it is up against
   * a mass on that side, then this function will return true. To figure out if a mass is at the complete
   * edge of the slider range, see this.objectAtEdgeIgnoreOtherObject().
   *
   * @param  {ISLCObjectEnum} objectEnum
   * @returns {boolean}
   * @private
   */
  objectTouchingBoundary(objectEnum) {
    return this.objectAtTouchingMin(objectEnum) || this.objectAtTouchingMax(objectEnum);
  }

  /**
   * Returns true if the model object associated with the passed-in enum is at the left boundary of its currently
   * enabled range. Note that when the objects are touching, their enabledRanges will be limited by the other object.
   * @param  {ISLCObjectEnum} objectEnum
   * @returns {boolean}
   * @private
   */
  objectAtTouchingMin(objectEnum) {
    const object = this.getObjectFromEnum(objectEnum);
    return object.positionProperty.get() === object.enabledRangeProperty.get().min;
  }

  /**
   * Returns true if the model object associated with the passed-in enum is at the right boundary of its currently
   * enabled range. Note that when the objects are touching, their enabledRanges will be limited by the other object.
   * @param  {ISLCObjectEnum} objectEnum
   * @returns {boolean}
   * @private
   */
  objectAtTouchingMax(objectEnum) {
    const object = this.getObjectFromEnum(objectEnum);
    return object.positionProperty.get() === object.enabledRangeProperty.get().max;
  }

  /**
   * Same as getQualitativeRelativeDistanceRegion but for the start of the sentence (e.g. 'Very far from')
   * @returns {string}
   * @public
   */
  getCapitalizedQualitativeRelativeDistanceRegion() {
    const index = this.getDistanceIndex(this.separationProperty.value, RELATIVE_DISTANCE_STRINGS_CAPITALIZED.length);
    assert && assert(index >= 0 && index < RELATIVE_DISTANCE_STRINGS_CAPITALIZED.length, 'index out of range');
    return RELATIVE_DISTANCE_STRINGS_CAPITALIZED[index];
  }

  /**
   * The qualitative distance relative to another object (e.g. 'very far from')
   * @private
   * @returns {string}
   */
  getQualitativeRelativeDistanceRegion() {
    const index = this.getDistanceIndex(this.separationProperty.value, RELATIVE_DISTANCE_STRINGS.length);
    assert && assert(index >= 0 && index < RELATIVE_DISTANCE_STRINGS.length, 'index out of range');
    return RELATIVE_DISTANCE_STRINGS[index];
  }

  /**
   * Returns the mapped integer corresponding to the location in an array with strings that describe the qualitative
   * distance between objects. Index is determined by normalizing the provided distance against the maximum separation
   * of objects that the model can support. The regions within that normalized range were designed,
   * see https://github.com/phetsims/gravity-force-lab-basics/issues/206#issuecomment-848960764.
   *
   * Assumes that there are 9 descriptions for object distances, if that change this function will need to be udpated.
   *
   * @param  {number} distance - in model units
   * @param {number} numberOfRegions - for crosscheck
   * @returns {number} - integer
   * @private
   */
  getDistanceIndex(distance, numberOfRegions) {
    assert && assert(distance > 0, 'Distance between spheres should always be positive.');
    assert && assert(numberOfRegions === 9, 'If numberOfRegions changes, this function should too.');
    const maxDistance = Math.abs(this.rightObjectBoundary - this.leftObjectBoundary);
    const normalizedDistance = distance / maxDistance;
    let index;
    if (normalizedDistance === 1.0) {
      index = 0;
    } else if (normalizedDistance >= 0.95) {
      index = 1;
    } else if (normalizedDistance >= 0.8) {
      index = 2;
    } else if (normalizedDistance >= 0.65) {
      index = 3;
    } else if (normalizedDistance >= 0.5) {
      index = 4;
    } else if (normalizedDistance >= 0.35) {
      index = 5;
    } else if (normalizedDistance >= 0.2) {
      index = 6;
    } else if (normalizedDistance >= 0.14) {
      index = 7;
    } else {
      index = 8;
    }
    return index;
  }

  /**
   * @public
   * @returns {string} - the help text for the sphere positions heading/container node
   */
  getSpherePositionsHelpText() {
    const quantitativeDistance = StringUtils.fillIn(distanceApartPatternString, {
      distanceAndUnits: this.getDistanceAndUnits()
    });
    return StringUtils.fillIn(spherePositionHelpTextString, {
      distanceApart: this.useQuantitativeDistance ? quantitativeDistance : this.getQualitativeDistanceFromEachOther()
    });
  }

  /**
   * Returns a string to be used in the prototype voicing context. Returns something like
   * "mass 1, 4 kilometers from mass 1" (distances shown) or
   * "mass 1, close to mass 1" (distances hidden) or
   * "Move mass 1, 4 kilometers from mass 2 (sounding more like the PDOM, "version 2")
   * @param {string} objectLabel
   * @param {string} otherObjectLabel
   * @public
   */
  getVoicingDistanceDescription(objectLabel, otherObjectLabel) {
    const patternString = this.useQuantitativeDistance ? voicingLevelsMassQuantitativePatternString : voicingLevelsMassQualitativePatternString;
    const distanceDescription = this.useQuantitativeDistance ? this.getDistanceAndUnits() : this.getQualitativeRelativeDistanceRegion();
    const objectDescription = StringUtils.fillIn(patternString, {
      object: objectLabel,
      distance: distanceDescription,
      otherObject: otherObjectLabel
    });
    return objectDescription;
  }

  /**
   * Returns a string to be used in the prototype voicing content, describing the distance betwseen objects. Similar
   * to getVoicingDistanceDescription, but does not inlucde the label to reduce verbocity. Returns something like
   *
   * "4 kilometers from mass 1" or
   * "close to mass 1"
   * @public
   *
   * @param {String} otherObjectLabel
   * @returns {string}
   */
  getVoicingDistanceDescriptionWithoutLabel(otherObjectLabel) {
    const patternString = this.useQuantitativeDistance ? voicingLevelsMassQuantitativeWithoutLabelPatternString : voicingLevelsMassQualitativeWithoutLabelPatternString;
    const distanceDescription = this.useQuantitativeDistance ? this.getDistanceAndUnits() : this.getQualitativeRelativeDistanceRegion();
    return StringUtils.fillIn(patternString, {
      distance: distanceDescription,
      otherObject: otherObjectLabel
    });
  }

  /**
   * Returns the filled in movable object position label.
   *
   * @param  {string} label
   * @returns {string}
   * @public
   */
  static getObjectLabelPositionText(label) {
    return StringUtils.fillIn(objectLabelPositionPatternString, {
      label: label
    });
  }
}
inverseSquareLawCommon.register('PositionDescriber', PositionDescriber);
export default PositionDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJTdHJpbmdQcm9wZXJ0eSIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJpbnZlcnNlU3F1YXJlTGF3Q29tbW9uIiwiSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MiLCJJU0xDT2JqZWN0RW51bSIsIklTTENEZXNjcmliZXIiLCJ1bml0c01ldGVyc1N0cmluZyIsInVuaXRzIiwibWV0ZXJzIiwidW5pdHNNZXRlclN0cmluZyIsIm1ldGVyIiwib2JqZWN0TGFiZWxQb3NpdGlvblBhdHRlcm5TdHJpbmciLCJhMTF5Iiwic3BoZXJlIiwib2JqZWN0TGFiZWxQb3NpdGlvblBhdHRlcm4iLCJkaXN0YW5jZUFuZFZhbHVlU3VtbWFyeVBhdHRlcm5TdHJpbmciLCJzY3JlZW5TdW1tYXJ5IiwiZGlzdGFuY2VBbmRWYWx1ZVN1bW1hcnlQYXR0ZXJuIiwicXVhbGl0YXRpdmVEaXN0YW5jZUVhY2hPdGhlclBhdHRlcm5TdHJpbmciLCJxdWFsaXRhdGl2ZURpc3RhbmNlRWFjaE90aGVyUGF0dGVybiIsImNlbnRlcnNFeGFjdGx5UGF0dGVyblN0cmluZyIsImNlbnRlcnNFeGFjdGx5UGF0dGVybiIsInF1YW50aXRhdGl2ZUFuZFF1YWxpdGF0aXZlUGF0dGVyblN0cmluZyIsInF1YW50aXRhdGl2ZUFuZFF1YWxpdGF0aXZlUGF0dGVybiIsImNlbnRlcnNPZk9iamVjdHNEaXN0YW5jZVBhdHRlcm5TdHJpbmciLCJjZW50ZXJzT2ZPYmplY3RzRGlzdGFuY2VQYXR0ZXJuIiwicG9zaXRpb25EaXN0YW5jZUZyb21PdGhlck9iamVjdFBhdHRlcm5TdHJpbmciLCJwb3NpdGlvbiIsInZhbHVldGV4dCIsInBvc2l0aW9uRGlzdGFuY2VGcm9tT3RoZXJPYmplY3RQYXR0ZXJuIiwicG9zaXRpb25Qcm9ncmVzc09yTGFuZG1hcmtDbGF1c2VTdHJpbmciLCJwb3NpdGlvblByb2dyZXNzT3JMYW5kbWFya0NsYXVzZSIsImRpc3RhbmNlQW5kVW5pdHNQYXR0ZXJuU3RyaW5nIiwiZGlzdGFuY2VBbmRVbml0c1BhdHRlcm4iLCJjZW50ZXJzQXBhcnRQYXR0ZXJuU3RyaW5nIiwiY2VudGVyc0FwYXJ0UGF0dGVybiIsInF1YW50aXRhdGl2ZURpc3RhbmNlUGF0dGVyblN0cmluZyIsInF1YW50aXRhdGl2ZURpc3RhbmNlUGF0dGVybiIsImRpc3RhbmNlRnJvbU90aGVyT2JqZWN0UGF0dGVyblN0cmluZyIsImRpc3RhbmNlRnJvbU90aGVyT2JqZWN0UGF0dGVybiIsImRpc3RhbmNlRnJvbU90aGVyT2JqZWN0U2VudGVuY2VQYXR0ZXJuU3RyaW5nIiwiZGlzdGFuY2VGcm9tT3RoZXJPYmplY3RTZW50ZW5jZVBhdHRlcm4iLCJmYXJ0aGVzdEZyb21TdHJpbmciLCJxdWFsaXRhdGl2ZSIsImZhcnRoZXN0RnJvbSIsImV4dHJlbWVseUZhckZyb21TdHJpbmciLCJleHRyZW1lbHlGYXJGcm9tIiwidmVyeUZhckZyb21TdHJpbmciLCJ2ZXJ5RmFyRnJvbSIsImZhckZyb21TdHJpbmciLCJmYXJGcm9tIiwibm90U29DbG9zZVRvU3RyaW5nIiwibm90U29DbG9zZVRvIiwiY2xvc2VUb1N0cmluZyIsImNsb3NlVG8iLCJ2ZXJ5Q2xvc2VUb1N0cmluZyIsInZlcnlDbG9zZVRvIiwiZXh0cmVtZWx5Q2xvc2VUb1N0cmluZyIsImV4dHJlbWVseUNsb3NlVG8iLCJjbG9zZXN0VG9TdHJpbmciLCJjbG9zZXN0VG8iLCJmYXJ0aGVzdEZyb21DYXBpdGFsaXplZFN0cmluZyIsImZhcnRoZXN0RnJvbUNhcGl0YWxpemVkIiwiZXh0cmVtZWx5RmFyRnJvbUNhcGl0YWxpemVkU3RyaW5nIiwiZXh0cmVtZWx5RmFyRnJvbUNhcGl0YWxpemVkIiwidmVyeUZhckZyb21DYXBpdGFsaXplZFN0cmluZyIsInZlcnlGYXJGcm9tQ2FwaXRhbGl6ZWQiLCJmYXJGcm9tQ2FwaXRhbGl6ZWRTdHJpbmciLCJmYXJGcm9tQ2FwaXRhbGl6ZWQiLCJub3RTb0Nsb3NlVG9DYXBpdGFsaXplZFN0cmluZyIsIm5vdFNvQ2xvc2VUb0NhcGl0YWxpemVkIiwiY2xvc2VUb0NhcGl0YWxpemVkU3RyaW5nIiwiY2xvc2VUb0NhcGl0YWxpemVkIiwidmVyeUNsb3NlVG9DYXBpdGFsaXplZFN0cmluZyIsInZlcnlDbG9zZVRvQ2FwaXRhbGl6ZWQiLCJleHRyZW1lbHlDbG9zZVRvQ2FwaXRhbGl6ZWRTdHJpbmciLCJleHRyZW1lbHlDbG9zZVRvQ2FwaXRhbGl6ZWQiLCJjbG9zZXN0VG9DYXBpdGFsaXplZFN0cmluZyIsImNsb3Nlc3RUb0NhcGl0YWxpemVkIiwiY2xvc2VyU3RyaW5nIiwiY2xvc2VyIiwiZmFydGhlckF3YXlTdHJpbmciLCJmYXJ0aGVyQXdheSIsImRpc3RhbmNlQXBhcnRQYXR0ZXJuU3RyaW5nIiwiZGlzdGFuY2VBcGFydFBhdHRlcm4iLCJzcGhlcmVQb3NpdGlvbkhlbHBUZXh0U3RyaW5nIiwicG9zaXRpb25IZWxwVGV4dCIsImxlZnRTaWRlT2ZUcmFja1N0cmluZyIsImxhbmRtYXJrcyIsImxlZnRTaWRlT2ZUcmFjayIsInJpZ2h0U2lkZU9mVHJhY2tTdHJpbmciLCJyaWdodFNpZGVPZlRyYWNrIiwibGFzdFN0b3BSaWdodFN0cmluZyIsImxhc3RTdG9wUmlnaHQiLCJsYXN0U3RvcExlZnRTdHJpbmciLCJsYXN0U3RvcExlZnQiLCJ2b2ljaW5nTGV2ZWxzTWFzc1F1YW50aXRhdGl2ZVBhdHRlcm5TdHJpbmciLCJ2b2ljaW5nIiwibGV2ZWxzIiwibWFzc1F1YW50aXRhdGl2ZVBhdHRlcm4iLCJ2b2ljaW5nTGV2ZWxzTWFzc1F1YWxpdGF0aXZlUGF0dGVyblN0cmluZyIsIm1hc3NRdWFsaXRhdGl2ZVBhdHRlcm4iLCJ2b2ljaW5nTGV2ZWxzTWFzc1F1YW50aXRhdGl2ZVdpdGhvdXRMYWJlbFBhdHRlcm5TdHJpbmciLCJtYXNzUXVhbnRpdGF0aXZlV2l0aG91dExhYmVsUGF0dGVybiIsInZvaWNpbmdMZXZlbHNNYXNzUXVhbGl0YXRpdmVXaXRob3V0TGFiZWxQYXR0ZXJuU3RyaW5nIiwibWFzc1F1YWxpdGF0aXZlV2l0aG91dExhYmVsUGF0dGVybiIsIlJFTEFUSVZFX0RJU1RBTkNFX1NUUklOR1MiLCJSRUxBVElWRV9ESVNUQU5DRV9TVFJJTkdTX0NBUElUQUxJWkVEIiwiUG9zaXRpb25EZXNjcmliZXIiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwib2JqZWN0MUxhYmVsIiwib2JqZWN0MkxhYmVsIiwib3B0aW9ucyIsInVuaXQiLCJmb3JtYXREaXNwbGF5RGlzdGFuY2UiLCJfIiwiaWRlbnRpdHkiLCJkaXN0YW5jZUJldHdlZW4iLCJzZXBhcmF0aW9uUHJvcGVydHkiLCJyaWdodE9iamVjdEJvdW5kYXJ5IiwibGVmdE9iamVjdEJvdW5kYXJ5Iiwib2xkRGlzdGFuY2VCZXR3ZWVuIiwibGFzdE1vdmVDbG9zZXIiLCJtb3ZlZENsb3NlciIsInVzZVF1YW50aXRhdGl2ZURpc3RhbmNlIiwibXVsdGlsaW5rIiwib2JqZWN0MSIsInBvc2l0aW9uUHJvcGVydHkiLCJvYmplY3QyIiwieDEiLCJ4MiIsIk1hdGgiLCJhYnMiLCJpc0RyYWdnaW5nUHJvcGVydHkiLCJnZXQiLCJnZXRRdWFsaXRhdGl2ZURpc3RhbmNlRnJvbUVhY2hPdGhlciIsImZpbGxJbiIsInF1YWxpdGF0aXZlRGlzdGFuY2UiLCJnZXRRdWFsaXRhdGl2ZVJlbGF0aXZlRGlzdGFuY2VSZWdpb24iLCJnZXRPYmplY3REaXN0YW5jZVN1bW1hcnkiLCJxdWFsaXRhdGl2ZURpc3RhbmNlQ2xhdXNlIiwicXVhbGl0YXRpdmVEaXN0YW5jZUZyb21FYWNoT3RoZXIiLCJxdWFudGl0YXRpdmVEaXN0YW5jZUNsYXVzZSIsImRpc3RhbmNlQW5kVW5pdHMiLCJnZXREaXN0YW5jZUFuZFVuaXRzIiwic3VtbWFyeSIsInF1YWxpdGF0aXZlQ2xhdXNlIiwicXVhbnRpdGF0aXZlQ2xhdXNlIiwib2JqZWN0c0Rpc3RhbmNlQ2xhdXNlIiwiZGlzdGFuY2UiLCJnZXRDZW50ZXJzQXBhcnREaXN0YW5jZSIsImdldFF1YW50aXRhdGl2ZURpc3RhbmNlQ2xhdXNlIiwiZ2V0RGlzdGFuY2VDbGF1c2UiLCJ0aGlzT2JqZWN0RW51bSIsIm90aGVyT2JqZWN0TGFiZWwiLCJnZXRPdGhlck9iamVjdExhYmVsRnJvbUVudW0iLCJkaXN0YW5jZUNsYXVzZSIsImdldEN1cnJlbnRQb3NpdGlvblJlZ2lvbiIsIm9iamVjdEVudW0iLCJvYmplY3QiLCJnZXRPYmplY3RGcm9tRW51bSIsImdldFByb2dyZXNzQ2xhdXNlIiwiZ2V0UG9zaXRpb25Qcm9ncmVzc09yTGFuZG1hcmtDbGF1c2UiLCJhbHdheXNJbmNsdWRlUHJvZ3Jlc3NDbGF1c2UiLCJlbnVtIiwicG9zaXRpb25TdHJpbmciLCJvYmplY3QxQXRNaW4iLCJvYmplY3QyQXRNYXgiLCJvYmplY3RUb3VjaGluZ0JvdW5kYXJ5IiwiaXNPYmplY3QxIiwicHJvZ3Jlc3NPckxhbmRtYXJrIiwiZ2V0UG9zaXRpb25BcmlhVmFsdWVUZXh0Q3JlYXRvciIsInByZXZpb3VzUG9zaXRpb25SZWdpb25Qcm9wZXJ0eSIsInZhbHVlVGV4dENyZWF0b3IiLCJuZXdQb3NpdGlvblJlZ2lvbiIsInZhbHVlIiwicG9zaXRpb25SZWdpb24iLCJkaXN0YW5jZUZyb21PdGhlck9iamVjdCIsImdldERpc3RhbmNlRnJvbU90aGVyT2JqZWN0RGVzY3JpcHRpb24iLCJyZXNldCIsIm9iamVjdEF0VG91Y2hpbmdNaW4iLCJpc09iamVjdDIiLCJvYmplY3RBdFRvdWNoaW5nTWF4IiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJtaW4iLCJtYXgiLCJnZXRDYXBpdGFsaXplZFF1YWxpdGF0aXZlUmVsYXRpdmVEaXN0YW5jZVJlZ2lvbiIsImluZGV4IiwiZ2V0RGlzdGFuY2VJbmRleCIsImxlbmd0aCIsImFzc2VydCIsIm51bWJlck9mUmVnaW9ucyIsIm1heERpc3RhbmNlIiwibm9ybWFsaXplZERpc3RhbmNlIiwiZ2V0U3BoZXJlUG9zaXRpb25zSGVscFRleHQiLCJxdWFudGl0YXRpdmVEaXN0YW5jZSIsImRpc3RhbmNlQXBhcnQiLCJnZXRWb2ljaW5nRGlzdGFuY2VEZXNjcmlwdGlvbiIsIm9iamVjdExhYmVsIiwicGF0dGVyblN0cmluZyIsImRpc3RhbmNlRGVzY3JpcHRpb24iLCJvYmplY3REZXNjcmlwdGlvbiIsIm90aGVyT2JqZWN0IiwiZ2V0Vm9pY2luZ0Rpc3RhbmNlRGVzY3JpcHRpb25XaXRob3V0TGFiZWwiLCJnZXRPYmplY3RMYWJlbFBvc2l0aW9uVGV4dCIsImxhYmVsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb3NpdGlvbkRlc2NyaWJlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXNwb25zaWJsZSBmb3IgbG9naWMgYXNzb2NpYXRlZCB3aXRoIHRoZSBmb3JtYXRpb24gb2YgYXVkaW8gZGVzY3JpcHRpb24gc3RyaW5ncyByZWxhdGVkIHRvIHRoZSBwb3NpdGlvbnMgb2YgdGhlXHJcbiAqIElTTENPYmplY3QgaW5zdGFuY2VzIGFuZCBpbnRlcmFjdGlvbnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjaGFuZ2VzIG9mIHRob3NlIHBvc2l0aW9ucy5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IGludmVyc2VTcXVhcmVMYXdDb21tb24gZnJvbSAnLi4vLi4vaW52ZXJzZVNxdWFyZUxhd0NvbW1vbi5qcyc7XHJcbmltcG9ydCBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncyBmcm9tICcuLi8uLi9JbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBJU0xDT2JqZWN0RW51bSBmcm9tICcuLi8uLi9tb2RlbC9JU0xDT2JqZWN0RW51bS5qcyc7XHJcbmltcG9ydCBJU0xDRGVzY3JpYmVyIGZyb20gJy4vSVNMQ0Rlc2NyaWJlci5qcyc7XHJcblxyXG5jb25zdCB1bml0c01ldGVyc1N0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLnVuaXRzLm1ldGVycztcclxuY29uc3QgdW5pdHNNZXRlclN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLnVuaXRzLm1ldGVyO1xyXG5cclxuY29uc3Qgb2JqZWN0TGFiZWxQb3NpdGlvblBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnNwaGVyZS5vYmplY3RMYWJlbFBvc2l0aW9uUGF0dGVybjtcclxuY29uc3QgZGlzdGFuY2VBbmRWYWx1ZVN1bW1hcnlQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LmRpc3RhbmNlQW5kVmFsdWVTdW1tYXJ5UGF0dGVybjtcclxuY29uc3QgcXVhbGl0YXRpdmVEaXN0YW5jZUVhY2hPdGhlclBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnNjcmVlblN1bW1hcnkucXVhbGl0YXRpdmVEaXN0YW5jZUVhY2hPdGhlclBhdHRlcm47XHJcbmNvbnN0IGNlbnRlcnNFeGFjdGx5UGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS5jZW50ZXJzRXhhY3RseVBhdHRlcm47XHJcbmNvbnN0IHF1YW50aXRhdGl2ZUFuZFF1YWxpdGF0aXZlUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS5xdWFudGl0YXRpdmVBbmRRdWFsaXRhdGl2ZVBhdHRlcm47XHJcbmNvbnN0IGNlbnRlcnNPZk9iamVjdHNEaXN0YW5jZVBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnNjcmVlblN1bW1hcnkuY2VudGVyc09mT2JqZWN0c0Rpc3RhbmNlUGF0dGVybjtcclxuXHJcbmNvbnN0IHBvc2l0aW9uRGlzdGFuY2VGcm9tT3RoZXJPYmplY3RQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wb3NpdGlvbi52YWx1ZXRleHQucG9zaXRpb25EaXN0YW5jZUZyb21PdGhlck9iamVjdFBhdHRlcm47XHJcbmNvbnN0IHBvc2l0aW9uUHJvZ3Jlc3NPckxhbmRtYXJrQ2xhdXNlU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wb3NpdGlvblByb2dyZXNzT3JMYW5kbWFya0NsYXVzZTtcclxuY29uc3QgZGlzdGFuY2VBbmRVbml0c1BhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnBvc2l0aW9uLnZhbHVldGV4dC5kaXN0YW5jZUFuZFVuaXRzUGF0dGVybjtcclxuY29uc3QgY2VudGVyc0FwYXJ0UGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucG9zaXRpb24udmFsdWV0ZXh0LmNlbnRlcnNBcGFydFBhdHRlcm47XHJcbmNvbnN0IHF1YW50aXRhdGl2ZURpc3RhbmNlUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucG9zaXRpb24udmFsdWV0ZXh0LnF1YW50aXRhdGl2ZURpc3RhbmNlUGF0dGVybjtcclxuY29uc3QgZGlzdGFuY2VGcm9tT3RoZXJPYmplY3RQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wb3NpdGlvbi52YWx1ZXRleHQuZGlzdGFuY2VGcm9tT3RoZXJPYmplY3RQYXR0ZXJuO1xyXG5jb25zdCBkaXN0YW5jZUZyb21PdGhlck9iamVjdFNlbnRlbmNlUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucG9zaXRpb24udmFsdWV0ZXh0LmRpc3RhbmNlRnJvbU90aGVyT2JqZWN0U2VudGVuY2VQYXR0ZXJuO1xyXG5cclxuY29uc3QgZmFydGhlc3RGcm9tU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5mYXJ0aGVzdEZyb207XHJcbmNvbnN0IGV4dHJlbWVseUZhckZyb21TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLmV4dHJlbWVseUZhckZyb207XHJcbmNvbnN0IHZlcnlGYXJGcm9tU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS52ZXJ5RmFyRnJvbTtcclxuY29uc3QgZmFyRnJvbVN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuZmFyRnJvbTtcclxuY29uc3Qgbm90U29DbG9zZVRvU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5ub3RTb0Nsb3NlVG87XHJcbmNvbnN0IGNsb3NlVG9TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLmNsb3NlVG87XHJcbmNvbnN0IHZlcnlDbG9zZVRvU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS52ZXJ5Q2xvc2VUbztcclxuY29uc3QgZXh0cmVtZWx5Q2xvc2VUb1N0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuZXh0cmVtZWx5Q2xvc2VUbztcclxuY29uc3QgY2xvc2VzdFRvU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5jbG9zZXN0VG87XHJcblxyXG5jb25zdCBmYXJ0aGVzdEZyb21DYXBpdGFsaXplZFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuZmFydGhlc3RGcm9tQ2FwaXRhbGl6ZWQ7XHJcbmNvbnN0IGV4dHJlbWVseUZhckZyb21DYXBpdGFsaXplZFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuZXh0cmVtZWx5RmFyRnJvbUNhcGl0YWxpemVkO1xyXG5jb25zdCB2ZXJ5RmFyRnJvbUNhcGl0YWxpemVkU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS52ZXJ5RmFyRnJvbUNhcGl0YWxpemVkO1xyXG5jb25zdCBmYXJGcm9tQ2FwaXRhbGl6ZWRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLmZhckZyb21DYXBpdGFsaXplZDtcclxuY29uc3Qgbm90U29DbG9zZVRvQ2FwaXRhbGl6ZWRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLm5vdFNvQ2xvc2VUb0NhcGl0YWxpemVkO1xyXG5jb25zdCBjbG9zZVRvQ2FwaXRhbGl6ZWRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnF1YWxpdGF0aXZlLmNsb3NlVG9DYXBpdGFsaXplZDtcclxuY29uc3QgdmVyeUNsb3NlVG9DYXBpdGFsaXplZFN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUudmVyeUNsb3NlVG9DYXBpdGFsaXplZDtcclxuY29uc3QgZXh0cmVtZWx5Q2xvc2VUb0NhcGl0YWxpemVkU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5leHRyZW1lbHlDbG9zZVRvQ2FwaXRhbGl6ZWQ7XHJcbmNvbnN0IGNsb3Nlc3RUb0NhcGl0YWxpemVkU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5xdWFsaXRhdGl2ZS5jbG9zZXN0VG9DYXBpdGFsaXplZDtcclxuXHJcbmNvbnN0IGNsb3NlclN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuY2xvc2VyO1xyXG5jb25zdCBmYXJ0aGVyQXdheVN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkucXVhbGl0YXRpdmUuZmFydGhlckF3YXk7XHJcblxyXG5jb25zdCBkaXN0YW5jZUFwYXJ0UGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkuc3BoZXJlLmRpc3RhbmNlQXBhcnRQYXR0ZXJuO1xyXG5jb25zdCBzcGhlcmVQb3NpdGlvbkhlbHBUZXh0U3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5zcGhlcmUucG9zaXRpb25IZWxwVGV4dDtcclxuXHJcbi8vIHRyYWNrIGxhbmRtYXJrc1xyXG5jb25zdCBsZWZ0U2lkZU9mVHJhY2tTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnBvc2l0aW9uLmxhbmRtYXJrcy5sZWZ0U2lkZU9mVHJhY2s7XHJcbmNvbnN0IHJpZ2h0U2lkZU9mVHJhY2tTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnBvc2l0aW9uLmxhbmRtYXJrcy5yaWdodFNpZGVPZlRyYWNrO1xyXG5jb25zdCBsYXN0U3RvcFJpZ2h0U3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wb3NpdGlvbi5sYW5kbWFya3MubGFzdFN0b3BSaWdodDtcclxuY29uc3QgbGFzdFN0b3BMZWZ0U3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS5wb3NpdGlvbi5sYW5kbWFya3MubGFzdFN0b3BMZWZ0O1xyXG5cclxuY29uc3Qgdm9pY2luZ0xldmVsc01hc3NRdWFudGl0YXRpdmVQYXR0ZXJuU3RyaW5nID0gSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MuYTExeS52b2ljaW5nLmxldmVscy5tYXNzUXVhbnRpdGF0aXZlUGF0dGVybjtcclxuY29uc3Qgdm9pY2luZ0xldmVsc01hc3NRdWFsaXRhdGl2ZVBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnZvaWNpbmcubGV2ZWxzLm1hc3NRdWFsaXRhdGl2ZVBhdHRlcm47XHJcblxyXG5jb25zdCB2b2ljaW5nTGV2ZWxzTWFzc1F1YW50aXRhdGl2ZVdpdGhvdXRMYWJlbFBhdHRlcm5TdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LnZvaWNpbmcubGV2ZWxzLm1hc3NRdWFudGl0YXRpdmVXaXRob3V0TGFiZWxQYXR0ZXJuO1xyXG5jb25zdCB2b2ljaW5nTGV2ZWxzTWFzc1F1YWxpdGF0aXZlV2l0aG91dExhYmVsUGF0dGVyblN0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmExMXkudm9pY2luZy5sZXZlbHMubWFzc1F1YWxpdGF0aXZlV2l0aG91dExhYmVsUGF0dGVybjtcclxuXHJcbmNvbnN0IFJFTEFUSVZFX0RJU1RBTkNFX1NUUklOR1MgPSBbXHJcbiAgZmFydGhlc3RGcm9tU3RyaW5nLFxyXG4gIGV4dHJlbWVseUZhckZyb21TdHJpbmcsXHJcbiAgdmVyeUZhckZyb21TdHJpbmcsXHJcbiAgZmFyRnJvbVN0cmluZyxcclxuICBub3RTb0Nsb3NlVG9TdHJpbmcsXHJcbiAgY2xvc2VUb1N0cmluZyxcclxuICB2ZXJ5Q2xvc2VUb1N0cmluZyxcclxuICBleHRyZW1lbHlDbG9zZVRvU3RyaW5nLFxyXG4gIGNsb3Nlc3RUb1N0cmluZ1xyXG5dO1xyXG5cclxuY29uc3QgUkVMQVRJVkVfRElTVEFOQ0VfU1RSSU5HU19DQVBJVEFMSVpFRCA9IFtcclxuICBmYXJ0aGVzdEZyb21DYXBpdGFsaXplZFN0cmluZyxcclxuICBleHRyZW1lbHlGYXJGcm9tQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgdmVyeUZhckZyb21DYXBpdGFsaXplZFN0cmluZyxcclxuICBmYXJGcm9tQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgbm90U29DbG9zZVRvQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgY2xvc2VUb0NhcGl0YWxpemVkU3RyaW5nLFxyXG4gIHZlcnlDbG9zZVRvQ2FwaXRhbGl6ZWRTdHJpbmcsXHJcbiAgZXh0cmVtZWx5Q2xvc2VUb0NhcGl0YWxpemVkU3RyaW5nLFxyXG4gIGNsb3Nlc3RUb0NhcGl0YWxpemVkU3RyaW5nXHJcbl07XHJcblxyXG5jbGFzcyBQb3NpdGlvbkRlc2NyaWJlciBleHRlbmRzIElTTENEZXNjcmliZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0lTTENNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gb2JqZWN0MUxhYmVsXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9iamVjdDJMYWJlbFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIG9iamVjdDFMYWJlbCwgb2JqZWN0MkxhYmVsLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIG1vZGVsLCBvYmplY3QxTGFiZWwsIG9iamVjdDJMYWJlbCApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB1bml0OiB1bml0c01ldGVyU3RyaW5nLFxyXG4gICAgICB1bml0czogdW5pdHNNZXRlcnNTdHJpbmcsXHJcblxyXG4gICAgICAvLyB7ZnVuY3Rpb24obnVtYmVyKTpudW1iZXJ9IC0gY29udmVydCB0byBkaXNwbGF5IGRpc3RhbmNlIGZvciBQRE9NIGRlc2NyaXB0aW9uc1xyXG4gICAgICBmb3JtYXREaXNwbGF5RGlzdGFuY2U6IF8uaWRlbnRpdHlcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnVuaXQgPSBvcHRpb25zLnVuaXQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudW5pdHMgPSBvcHRpb25zLnVuaXRzOyAvLyB7c3RyaW5nfVxyXG4gICAgdGhpcy5mb3JtYXREaXNwbGF5RGlzdGFuY2UgPSBvcHRpb25zLmZvcm1hdERpc3BsYXlEaXN0YW5jZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIGluIG1ldGVycywgYWxyZWFkeSBjb252ZXJ0ZWQgd2l0aCBvcHRpb25hbCBmb3JtYXR0aW5nIGZ1bmN0aW9uXHJcbiAgICB0aGlzLmRpc3RhbmNlQmV0d2VlbiA9IDA7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge051bWJlclByb3BlcnR5fVxyXG4gICAgdGhpcy5zZXBhcmF0aW9uUHJvcGVydHkgPSBtb2RlbC5zZXBhcmF0aW9uUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cclxuICAgIHRoaXMucmlnaHRPYmplY3RCb3VuZGFyeSA9IG1vZGVsLnJpZ2h0T2JqZWN0Qm91bmRhcnk7XHJcbiAgICB0aGlzLmxlZnRPYmplY3RCb3VuZGFyeSA9IG1vZGVsLmxlZnRPYmplY3RCb3VuZGFyeTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIGluIGNvbnZlcnRlZCBkaXN0YW5jZVxyXG4gICAgdGhpcy5vbGREaXN0YW5jZUJldHdlZW4gPSAwO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW58bnVsbH0gLSBwcmV2aW91cyB2YWx1ZSBvZiB0aGlzLm1vdmVkQ2xvc2VyXHJcbiAgICB0aGlzLmxhc3RNb3ZlQ2xvc2VyID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW58bnVsbH0gLSBXaGV0aGVyIHRoZSBtYXNzZXMgbW92ZWQgY2xvc2VyIGxhc3QgcG9zaXRpb24gY2hhbmdlLiBvbmx5IHNldCB3aGVuIGFuIG9iamVjdFxyXG4gICAgLy8gaXMgZHJhZ2dpbmcuIGBudWxsYCBpZiB0aGUgdXNlciBpc24ndCBpbnRlcmFjdGluZyBzcGVjaWZpY2FsbHkgd2l0aCB0aGUgb2JqZWN0c1xyXG4gICAgdGhpcy5tb3ZlZENsb3NlciA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge2Jvb2xlYW59ICAtIE1hbnkgZGVzY3JpcHRpb25zIHVzZSBhIHF1YW50aXRhdGl2ZSBmb3JtIHdoZW4gZGlzdGFuY2UgdmFsdWVzIGFyZSBzaG93aW5nLCBhbmQgdXNlIHF1YWxpdGF0aXZlXHJcbiAgICAvLyBkZXNjcmlwdGlvbnMgd2hlbiBkaXN0YW5jZSB2YWx1ZXMgYXJlIGhpZGRlbi4gRnVydGhlcm1vcmUgc29tZSBkZXNjcmlwdGlvbnMgaW4gdGhlIFJFR1VMQVIgdmVyc2lvbiBhcmVcclxuICAgIC8vIFwic2ltcGxpZmllZFwiIGZyb20gcXVhbnRpdGF0aXZlIHRvIHF1YWxpdGF0aXZlIGZvcm1zIGluIHRoZSBCQVNJQ1MgdmVyc2lvbi4gRmFsc2UgbWVhbnMgcXVhbGl0YXRpdmUuXHJcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy9pc3N1ZXMvODhcclxuICAgIHRoaXMudXNlUXVhbnRpdGF0aXZlRGlzdGFuY2UgPSB0cnVlO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgdGhpcy5vYmplY3QxLnBvc2l0aW9uUHJvcGVydHksIHRoaXMub2JqZWN0Mi5wb3NpdGlvblByb3BlcnR5IF0sXHJcbiAgICAgICggeDEsIHgyICkgPT4ge1xyXG5cclxuICAgICAgICAvLyBzZXQgZm9ybWVyIHZhbHVlc1xyXG4gICAgICAgIHRoaXMub2xkRGlzdGFuY2VCZXR3ZWVuID0gdGhpcy5kaXN0YW5jZUJldHdlZW47XHJcbiAgICAgICAgdGhpcy5sYXN0TW92ZUNsb3NlciA9IHRoaXMubW92ZWRDbG9zZXI7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IHZhbHVlc1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VCZXR3ZWVuID0gdGhpcy5mb3JtYXREaXNwbGF5RGlzdGFuY2UoIE1hdGguYWJzKCB4MSAtIHgyICkgKTtcclxuXHJcbiAgICAgICAgLy8gb25seSBzZXQgbW92ZWRDbG9zZXIgaWYgdGhlIHVzZXIgaXMgbWFuaXB1bGF0aW5nIHRoZSB2YWx1ZSwgbnVsbCBvdGhlcndpc2UgZm9yIGNvbXBhcmlzb24gb24gZm9jdXNcclxuICAgICAgICBpZiAoIHRoaXMub2JqZWN0MS5pc0RyYWdnaW5nUHJvcGVydHkuZ2V0KCkgfHwgdGhpcy5vYmplY3QyLmlzRHJhZ2dpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICAgIHRoaXMubW92ZWRDbG9zZXIgPSB0aGlzLmRpc3RhbmNlQmV0d2VlbiA8IHRoaXMub2xkRGlzdGFuY2VCZXR3ZWVuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubW92ZWRDbG9zZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpa2UgXCJjbG9zZSB0byBlYWNoIG90aGVyXCIgb3IgXCJmYXIgZnJvbSBlYWNoIG90aGVyXCJcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRRdWFsaXRhdGl2ZURpc3RhbmNlRnJvbUVhY2hPdGhlcigpIHtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHF1YWxpdGF0aXZlRGlzdGFuY2VFYWNoT3RoZXJQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIHF1YWxpdGF0aXZlRGlzdGFuY2U6IHRoaXMuZ2V0UXVhbGl0YXRpdmVSZWxhdGl2ZURpc3RhbmNlUmVnaW9uKClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyB1c2VkIGluIHRoZSBzY3JlZW4gc3VtbWFyeSBpdGVtIGRpc3BsYXlpbmcgcG9zaXRpb24vZGlzdGFuY2UgaW5mb3JtYXRpb246XHJcbiAgICogJ3t7b2JqZWN0MUxhYmVsfX0gYW5kIHt7b2JqZWN0MkxhYmVsfX0gYXJlIHt7cXVhbGl0YXRpdmVEaXN0YW5jZX19IGVhY2ggb3RoZXIsIGNlbnRlcnMgZXhhY3RseSB7e2Rpc3RhbmNlfX0ge3t1bml0c319IGFwYXJ0LidcclxuICAgKiBHRkxCIGNhbiB0b2dnbGUgaWYgZGlzdGFuY2UgaXMgc2hvd2luZywgYW5kIHNvIGFkZGl0aW9uYWwgbG9naWMgaXMgYWRkZWQgaGVyZSB0byBzdXBwb3J0IHJlbW92aW5nIHRoZSBxdWFudGl0YXRpdmVcclxuICAgKiBcImNlbnRlcnMgZXhhY3RseVwiIHN1ZmZpeC5cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRPYmplY3REaXN0YW5jZVN1bW1hcnkoKSB7XHJcbiAgICBjb25zdCBxdWFsaXRhdGl2ZURpc3RhbmNlQ2xhdXNlID0gU3RyaW5nVXRpbHMuZmlsbEluKFxyXG4gICAgICBkaXN0YW5jZUFuZFZhbHVlU3VtbWFyeVBhdHRlcm5TdHJpbmcsXHJcbiAgICAgIHtcclxuICAgICAgICBvYmplY3QxTGFiZWw6IHRoaXMub2JqZWN0MUxhYmVsLFxyXG4gICAgICAgIG9iamVjdDJMYWJlbDogdGhpcy5vYmplY3QyTGFiZWwsXHJcbiAgICAgICAgcXVhbGl0YXRpdmVEaXN0YW5jZUZyb21FYWNoT3RoZXI6IHRoaXMuZ2V0UXVhbGl0YXRpdmVEaXN0YW5jZUZyb21FYWNoT3RoZXIoKVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgY29uc3QgcXVhbnRpdGF0aXZlRGlzdGFuY2VDbGF1c2UgPSBTdHJpbmdVdGlscy5maWxsSW4oXHJcbiAgICAgIGNlbnRlcnNFeGFjdGx5UGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIGRpc3RhbmNlQW5kVW5pdHM6IHRoaXMuZ2V0RGlzdGFuY2VBbmRVbml0cygpXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgbGV0IHN1bW1hcnkgPSBTdHJpbmdVdGlscy5maWxsSW4oIHF1YW50aXRhdGl2ZUFuZFF1YWxpdGF0aXZlUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIHF1YWxpdGF0aXZlQ2xhdXNlOiBxdWFsaXRhdGl2ZURpc3RhbmNlQ2xhdXNlLFxyXG4gICAgICAgIHF1YW50aXRhdGl2ZUNsYXVzZTogdGhpcy51c2VRdWFudGl0YXRpdmVEaXN0YW5jZSA/IHF1YW50aXRhdGl2ZURpc3RhbmNlQ2xhdXNlIDogJydcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBpZiB3ZSBkb24ndCB3YW50IHRoZSBcImNlbnRlcnMgZXhhY3RseVwiIHN1ZmZpeCwgdGhlbiBhZGQgXCJDZW50ZXJzIG9mXCIgYXMgYSBwcmVmaXhcclxuICAgIGlmICggIXRoaXMudXNlUXVhbnRpdGF0aXZlRGlzdGFuY2UgKSB7XHJcbiAgICAgIHN1bW1hcnkgPSBTdHJpbmdVdGlscy5maWxsSW4oIGNlbnRlcnNPZk9iamVjdHNEaXN0YW5jZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBvYmplY3RzRGlzdGFuY2VDbGF1c2U6IHN1bW1hcnlcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1bW1hcnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXREaXN0YW5jZUFuZFVuaXRzKCkge1xyXG4gICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLmRpc3RhbmNlQmV0d2VlbjtcclxuICAgIGxldCB1bml0cyA9IHRoaXMudW5pdHM7XHJcblxyXG4gICAgLy8gc2luZ3VsYXIgaWYgdGhlcmUgaXMgb25seSAnMSdcclxuICAgIGlmICggZGlzdGFuY2UgPT09IDEgKSB7XHJcbiAgICAgIHVuaXRzID0gdGhpcy51bml0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGRpc3RhbmNlQW5kVW5pdHNQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZSxcclxuICAgICAgdW5pdHM6IHVuaXRzXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIGRpc3RhbmNlIGJldHdlZW4gY2VudGVycywgc29tZXRoaW5nIGxpa2VcclxuICAgKiBcIkNlbnRlcnMgb2Ygc3BoZXJlcywgNCBraWxvbWV0ZXJzIGFwYXJ0LlwiXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMgeyp8c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldENlbnRlcnNBcGFydERpc3RhbmNlKCkge1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggY2VudGVyc0FwYXJ0UGF0dGVyblN0cmluZywge1xyXG4gICAgICBkaXN0YW5jZUFuZFVuaXRzOiB0aGlzLmdldERpc3RhbmNlQW5kVW5pdHMoKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmlsbCBpbiBkaXN0YW5jZSBhbmQgdW5pdHMgaW50byBxdWFudGl0YXRpdmUgY2xhdXNlXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFF1YW50aXRhdGl2ZURpc3RhbmNlQ2xhdXNlKCkge1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggcXVhbnRpdGF0aXZlRGlzdGFuY2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGRpc3RhbmNlQW5kVW5pdHM6IHRoaXMuZ2V0RGlzdGFuY2VBbmRVbml0cygpXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXBlbmRpbmcgb24gd2hldGhlciBvciBub3QgcXVhbnRpdGF0aXZlIGRpc3RhbmNlIGlzIHNldCwgZ2V0IHRoZSBhcHByb3ByaWF0ZSBkaXN0YW5jZSBzdHJpbmcuXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0RW51bX0gdGhpc09iamVjdEVudW1cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXREaXN0YW5jZUNsYXVzZSggdGhpc09iamVjdEVudW0gKSB7XHJcbiAgICBjb25zdCBvdGhlck9iamVjdExhYmVsID0gdGhpcy5nZXRPdGhlck9iamVjdExhYmVsRnJvbUVudW0oIHRoaXNPYmplY3RFbnVtICk7XHJcblxyXG4gICAgY29uc3QgZGlzdGFuY2VDbGF1c2UgPSB0aGlzLnVzZVF1YW50aXRhdGl2ZURpc3RhbmNlID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRRdWFudGl0YXRpdmVEaXN0YW5jZUNsYXVzZSgpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRRdWFsaXRhdGl2ZVJlbGF0aXZlRGlzdGFuY2VSZWdpb24oKTtcclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBkaXN0YW5jZUZyb21PdGhlck9iamVjdFBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlQ2xhdXNlLFxyXG4gICAgICBvdGhlck9iamVjdExhYmVsOiBvdGhlck9iamVjdExhYmVsXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGVyZSBhcmUgb25seSB0d28gcG9zaXRpb25hbCByZWdpb25zLCBsZWZ0L3JpZ2h0IHNpZGUgb2YgdHJhY2suXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0RW51bX0gb2JqZWN0RW51bVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRDdXJyZW50UG9zaXRpb25SZWdpb24oIG9iamVjdEVudW0gKSB7XHJcblxyXG4gICAgLy8gb2JqZWN0cyBub3QgdG91Y2hpbmcgYW55IGJvdW5kYXJ5LCBiYXNlZCBvbiB0aGUgc2lkZSByZWxhdGl2ZSB0byB0aGUgY2VudGVyXHJcbiAgICBjb25zdCBvYmplY3QgPSB0aGlzLmdldE9iamVjdEZyb21FbnVtKCBvYmplY3RFbnVtICk7XHJcblxyXG4gICAgcmV0dXJuIG9iamVjdC5wb3NpdGlvblByb3BlcnR5LmdldCgpIDwgMCA/IGxlZnRTaWRlT2ZUcmFja1N0cmluZyA6IHJpZ2h0U2lkZU9mVHJhY2tTdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIHByb2dyZXNzIG9mIG1vdGlvbiBvZiB0aGUgb2JqZWN0LiBFaXRoZXIgXCJDbG9zZXJcIiBvciBcIkZhcnRoZXIgQXdheVwiLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFByb2dyZXNzQ2xhdXNlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubW92ZWRDbG9zZXIgPyBjbG9zZXJTdHJpbmcgOiBmYXJ0aGVyQXdheVN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcG9zaXRpb24gY2hhbmdlIGNsYXVzZSwgbGlrZSBjbG9zZXIvZmFydGhlciBzdHJpbmdzLlxyXG4gICAqIEBwYXJhbSB7SVNMQ09iamVjdH0gb2JqZWN0XHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbHdheXNJbmNsdWRlUHJvZ3Jlc3NDbGF1c2VcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IC0gbnVsbCBpZiB0aGVyZSBpc24ndCBhIHBvc2l0aW9uIHByb2dyZXNzIG9yIGxhbmRtYXJrIGNsYXVzZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRQb3NpdGlvblByb2dyZXNzT3JMYW5kbWFya0NsYXVzZSggb2JqZWN0LCBhbHdheXNJbmNsdWRlUHJvZ3Jlc3NDbGF1c2UgKSB7XHJcbiAgICBjb25zdCBvYmplY3RFbnVtID0gb2JqZWN0LmVudW07XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uU3RyaW5nID0gdGhpcy5nZXRQcm9ncmVzc0NsYXVzZSgpO1xyXG5cclxuICAgIC8vIG9iamVjdCAxIHRvdWNoaW5nIGxlZnRcclxuICAgIGlmICggdGhpcy5vYmplY3QxQXRNaW4oIG9iamVjdEVudW0gKSApIHtcclxuICAgICAgcG9zaXRpb25TdHJpbmcgPSBsYXN0U3RvcExlZnRTdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb2JqZWN0IDIgdG91Y2hpbmcgcmlnaHRcclxuICAgIGVsc2UgaWYgKCB0aGlzLm9iamVjdDJBdE1heCggb2JqZWN0RW51bSApICkge1xyXG4gICAgICBwb3NpdGlvblN0cmluZyA9IGxhc3RTdG9wUmlnaHRTdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb2JqZWN0cyB0b3VjaGluZyBlYWNoIG90aGVyXHJcbiAgICBlbHNlIGlmICggdGhpcy5vYmplY3RUb3VjaGluZ0JvdW5kYXJ5KCBvYmplY3RFbnVtICkgKSB7XHJcbiAgICAgIHBvc2l0aW9uU3RyaW5nID0gSVNMQ09iamVjdEVudW0uaXNPYmplY3QxKCBvYmplY3RFbnVtICkgPyBsYXN0U3RvcFJpZ2h0U3RyaW5nIDogbGFzdFN0b3BMZWZ0U3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vIGNoYW5nZSwgc28gaWYgbm90IGNvdmVyZWQgYnkgYWJvdmUgZWRnZSBjYXNlcywgdGhlcmUgc2hvdWxkbid0IGJlIGEgcHJvZ3Jlc3MgY2xhdXNlXHJcbiAgICBlbHNlIGlmICggdGhpcy5sYXN0TW92ZUNsb3NlciA9PT0gdGhpcy5tb3ZlZENsb3NlciAmJiAhYWx3YXlzSW5jbHVkZVByb2dyZXNzQ2xhdXNlICkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBwb3NpdGlvblByb2dyZXNzT3JMYW5kbWFya0NsYXVzZVN0cmluZywge1xyXG4gICAgICBwcm9ncmVzc09yTGFuZG1hcms6IHBvc2l0aW9uU3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdXNlZCBieSBBY2Nlc3NpYmxlU2xpZGVyIHRvIGZvcm1hdCBpdHMgYXJpYS12YWx1ZXRleHQgYXR0cmlidXRlLiBPZiBub3RlIGlzIHRoYXQgdGhpcyBmdW5jdGlvblxyXG4gICAqIGlzIGNhbGxlZCBBRlRFUiB0aGUgU2xpZGVyJ3MgcG9zaXRpb24gUHJvcGVydHkgaGFzIGJlZW4gc2V0LiBTaW5jZSwgdGhlIFBvc2l0aW9uRGVzY3JpYmVyIGxpbmtzIHRvIHRoZSBQb3NpdGlvblByb3BlcnR5XHJcbiAgICogcHJpb3IgdG8gdGhlIGNhbGwgdG8gc3VwZXIgdG8gaW5pdGlhbGl6ZSBBY2Nlc3NpYmxlU2xpZGVyLCB3ZSBjYW4gZW5zdXJlIHRoYXQgUG9zaXRpb25EZXNjcmliZXJzIGR5bmFtaWMgcHJvcGVydGllcyAoZS5nLiBkaXN0YW5jZUJldHdlZW4gKVxyXG4gICAqIHdpbGwgYmUgYWNjdXJhdGUgd2hlbiB0aGUgYmVsb3cgZnVuY3Rpb24gaXMgY2FsbGVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7SVNMQ09iamVjdEVudW19IG9iamVjdEVudW1cclxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFBvc2l0aW9uQXJpYVZhbHVlVGV4dENyZWF0b3IoIG9iamVjdEVudW0gKSB7XHJcblxyXG4gICAgLy8gQnkgaW5pdGlhbGl6aW5nIHRvIHRoZSBjdXJyZW50IHZhbHVlLCByZWdpb25zIHdpbGwgb25seSBiZSBkaXNwbGF5ZWQgd2hlbiBvbiByZWdpb24gY2hhbmdlLCBhbmQgbm90IG9uIHN0YXJ0dXAuXHJcbiAgICBjb25zdCBwcmV2aW91c1Bvc2l0aW9uUmVnaW9uUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIHRoaXMuZ2V0Q3VycmVudFBvc2l0aW9uUmVnaW9uKCBvYmplY3RFbnVtICkgKTtcclxuXHJcbiAgICAvLyBOT1RFOiBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyIHN1cHBvcnRzIHBhcmFtZXRlcnMgdG8gdGhpcyBmdW5jdGlvbiwgYnV0IHJlY29nbml6ZSB0aGF0IHN1YnR5cGVzIG92ZXJyaWRlIHRoaXNcclxuICAgIC8vIG1ldGhvZCBiZWZvcmUgYWRkaW5nIHRoZXNlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy9pc3N1ZXMvMTEzXHJcbiAgICBjb25zdCB2YWx1ZVRleHRDcmVhdG9yID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBkaXN0YW5jZUNsYXVzZSA9IHRoaXMuZ2V0RGlzdGFuY2VDbGF1c2UoIG9iamVjdEVudW0gKTtcclxuXHJcbiAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uUmVnaW9uID0gdGhpcy5nZXRDdXJyZW50UG9zaXRpb25SZWdpb24oIG9iamVjdEVudW0gKTtcclxuXHJcbiAgICAgIC8vIE9ubHkgaW5jbHVkZSB0aGUgcmVnaW9uIGlmIGl0IGlzIGRpZmZlcmVudCBmcm9tIHRoZSBwcmV2aW91cy4gVGhlIGtleVxyXG4gICAgICBpZiAoIHByZXZpb3VzUG9zaXRpb25SZWdpb25Qcm9wZXJ0eS52YWx1ZSAhPT0gbmV3UG9zaXRpb25SZWdpb24gKSB7XHJcbiAgICAgICAgcHJldmlvdXNQb3NpdGlvblJlZ2lvblByb3BlcnR5LnZhbHVlID0gbmV3UG9zaXRpb25SZWdpb247XHJcblxyXG4gICAgICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHBvc2l0aW9uRGlzdGFuY2VGcm9tT3RoZXJPYmplY3RQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICBwb3NpdGlvblJlZ2lvbjogbmV3UG9zaXRpb25SZWdpb24sXHJcbiAgICAgICAgICBkaXN0YW5jZUZyb21PdGhlck9iamVjdDogZGlzdGFuY2VDbGF1c2VcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGlzdGFuY2VGcm9tT3RoZXJPYmplY3REZXNjcmlwdGlvbiggb2JqZWN0RW51bSApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICoge2Z1bmN0aW9ufSAtIHJlc2V0IHRoZSB2YWx1ZVRleHRDcmVhdG9yXHJcbiAgICAgKi9cclxuICAgIHZhbHVlVGV4dENyZWF0b3IucmVzZXQgPSAoKSA9PiB7XHJcbiAgICAgIHByZXZpb3VzUG9zaXRpb25SZWdpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB2YWx1ZVRleHRDcmVhdG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIGRpc3RhbmNlIHRoaXMgb2JqZWN0IGlzIGZyb20gYW5vdGhlciwgcmV0dXJuaW5nIHNvbWV0aGluZyBsaWtlXHJcbiAgICogXCI1LjggS2lsb21ldGVycyBmcm9tIE1hc3MgMS5cIlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7SVNMQ09iamVjdEVudW19IG9iamVjdEVudW1cclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldERpc3RhbmNlRnJvbU90aGVyT2JqZWN0RGVzY3JpcHRpb24oIG9iamVjdEVudW0gKSB7XHJcbiAgICBjb25zdCBkaXN0YW5jZUNsYXVzZSA9IHRoaXMuZ2V0RGlzdGFuY2VDbGF1c2UoIG9iamVjdEVudW0gKTtcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIGRpc3RhbmNlRnJvbU90aGVyT2JqZWN0U2VudGVuY2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGRpc3RhbmNlRnJvbU90aGVyT2JqZWN0OiBkaXN0YW5jZUNsYXVzZVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0RW51bX0gb2JqZWN0RW51bVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIHJldHVybnMgZmFsc2UgaWYgcHJvdmlkZWQgZW51bSBpcyBub3Qgb2JqZWN0MVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgb2JqZWN0MUF0TWluKCBvYmplY3RFbnVtICkge1xyXG4gICAgcmV0dXJuIElTTENPYmplY3RFbnVtLmlzT2JqZWN0MSggb2JqZWN0RW51bSApICYmIHRoaXMub2JqZWN0QXRUb3VjaGluZ01pbiggb2JqZWN0RW51bSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0RW51bX0gb2JqZWN0RW51bVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIHJldHVybnMgZmFsc2UgaWYgcHJvdmlkZWQgZW51bSBpcyBub3Qgb2JqZWN0MlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBvYmplY3QyQXRNYXgoIG9iamVjdEVudW0gKSB7XHJcbiAgICByZXR1cm4gSVNMQ09iamVjdEVudW0uaXNPYmplY3QyKCBvYmplY3RFbnVtICkgJiYgdGhpcy5vYmplY3RBdFRvdWNoaW5nTWF4KCBvYmplY3RFbnVtICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG1vZGVsIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIHBhc3NlZC1pbiBlbnVtIGlzIGF0IHRoZSBsZWZ0L3JpZ2h0IGJvdW5kYXJ5IG9mIHRoZSBvYmplY3Qnc1xyXG4gICAqIGF2YWlsYWJsZSBtb3ZlbWVudC4gVGhpcyBtZWFucyB0aGF0IGlmIGEgbWFzcyBjYW4ndCBtb3ZlIGxlZnQgYW55bW9yZSBiZWNhdXNlIGl0IGlzIHVwIGFnYWluc3RcclxuICAgKiBhIG1hc3Mgb24gdGhhdCBzaWRlLCB0aGVuIHRoaXMgZnVuY3Rpb24gd2lsbCByZXR1cm4gdHJ1ZS4gVG8gZmlndXJlIG91dCBpZiBhIG1hc3MgaXMgYXQgdGhlIGNvbXBsZXRlXHJcbiAgICogZWRnZSBvZiB0aGUgc2xpZGVyIHJhbmdlLCBzZWUgdGhpcy5vYmplY3RBdEVkZ2VJZ25vcmVPdGhlck9iamVjdCgpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7SVNMQ09iamVjdEVudW19IG9iamVjdEVudW1cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9iamVjdFRvdWNoaW5nQm91bmRhcnkoIG9iamVjdEVudW0gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5vYmplY3RBdFRvdWNoaW5nTWluKCBvYmplY3RFbnVtICkgfHwgdGhpcy5vYmplY3RBdFRvdWNoaW5nTWF4KCBvYmplY3RFbnVtICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG1vZGVsIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIHBhc3NlZC1pbiBlbnVtIGlzIGF0IHRoZSBsZWZ0IGJvdW5kYXJ5IG9mIGl0cyBjdXJyZW50bHlcclxuICAgKiBlbmFibGVkIHJhbmdlLiBOb3RlIHRoYXQgd2hlbiB0aGUgb2JqZWN0cyBhcmUgdG91Y2hpbmcsIHRoZWlyIGVuYWJsZWRSYW5nZXMgd2lsbCBiZSBsaW1pdGVkIGJ5IHRoZSBvdGhlciBvYmplY3QuXHJcbiAgICogQHBhcmFtICB7SVNMQ09iamVjdEVudW19IG9iamVjdEVudW1cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9iamVjdEF0VG91Y2hpbmdNaW4oIG9iamVjdEVudW0gKSB7XHJcbiAgICBjb25zdCBvYmplY3QgPSB0aGlzLmdldE9iamVjdEZyb21FbnVtKCBvYmplY3RFbnVtICk7XHJcbiAgICByZXR1cm4gb2JqZWN0LnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgPT09IG9iamVjdC5lbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG1vZGVsIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIHBhc3NlZC1pbiBlbnVtIGlzIGF0IHRoZSByaWdodCBib3VuZGFyeSBvZiBpdHMgY3VycmVudGx5XHJcbiAgICogZW5hYmxlZCByYW5nZS4gTm90ZSB0aGF0IHdoZW4gdGhlIG9iamVjdHMgYXJlIHRvdWNoaW5nLCB0aGVpciBlbmFibGVkUmFuZ2VzIHdpbGwgYmUgbGltaXRlZCBieSB0aGUgb3RoZXIgb2JqZWN0LlxyXG4gICAqIEBwYXJhbSAge0lTTENPYmplY3RFbnVtfSBvYmplY3RFbnVtXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBvYmplY3RBdFRvdWNoaW5nTWF4KCBvYmplY3RFbnVtICkge1xyXG4gICAgY29uc3Qgb2JqZWN0ID0gdGhpcy5nZXRPYmplY3RGcm9tRW51bSggb2JqZWN0RW51bSApO1xyXG4gICAgcmV0dXJuIG9iamVjdC5wb3NpdGlvblByb3BlcnR5LmdldCgpID09PSBvYmplY3QuZW5hYmxlZFJhbmdlUHJvcGVydHkuZ2V0KCkubWF4O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2FtZSBhcyBnZXRRdWFsaXRhdGl2ZVJlbGF0aXZlRGlzdGFuY2VSZWdpb24gYnV0IGZvciB0aGUgc3RhcnQgb2YgdGhlIHNlbnRlbmNlIChlLmcuICdWZXJ5IGZhciBmcm9tJylcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRDYXBpdGFsaXplZFF1YWxpdGF0aXZlUmVsYXRpdmVEaXN0YW5jZVJlZ2lvbigpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXREaXN0YW5jZUluZGV4KCB0aGlzLnNlcGFyYXRpb25Qcm9wZXJ0eS52YWx1ZSwgUkVMQVRJVkVfRElTVEFOQ0VfU1RSSU5HU19DQVBJVEFMSVpFRC5sZW5ndGggKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ID49IDAgJiYgaW5kZXggPCBSRUxBVElWRV9ESVNUQU5DRV9TVFJJTkdTX0NBUElUQUxJWkVELmxlbmd0aCwgJ2luZGV4IG91dCBvZiByYW5nZScgKTtcclxuICAgIHJldHVybiBSRUxBVElWRV9ESVNUQU5DRV9TVFJJTkdTX0NBUElUQUxJWkVEWyBpbmRleCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHF1YWxpdGF0aXZlIGRpc3RhbmNlIHJlbGF0aXZlIHRvIGFub3RoZXIgb2JqZWN0IChlLmcuICd2ZXJ5IGZhciBmcm9tJylcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0UXVhbGl0YXRpdmVSZWxhdGl2ZURpc3RhbmNlUmVnaW9uKCkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmdldERpc3RhbmNlSW5kZXgoIHRoaXMuc2VwYXJhdGlvblByb3BlcnR5LnZhbHVlLCBSRUxBVElWRV9ESVNUQU5DRV9TVFJJTkdTLmxlbmd0aCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPj0gMCAmJiBpbmRleCA8IFJFTEFUSVZFX0RJU1RBTkNFX1NUUklOR1MubGVuZ3RoLCAnaW5kZXggb3V0IG9mIHJhbmdlJyApO1xyXG4gICAgcmV0dXJuIFJFTEFUSVZFX0RJU1RBTkNFX1NUUklOR1NbIGluZGV4IF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBtYXBwZWQgaW50ZWdlciBjb3JyZXNwb25kaW5nIHRvIHRoZSBsb2NhdGlvbiBpbiBhbiBhcnJheSB3aXRoIHN0cmluZ3MgdGhhdCBkZXNjcmliZSB0aGUgcXVhbGl0YXRpdmVcclxuICAgKiBkaXN0YW5jZSBiZXR3ZWVuIG9iamVjdHMuIEluZGV4IGlzIGRldGVybWluZWQgYnkgbm9ybWFsaXppbmcgdGhlIHByb3ZpZGVkIGRpc3RhbmNlIGFnYWluc3QgdGhlIG1heGltdW0gc2VwYXJhdGlvblxyXG4gICAqIG9mIG9iamVjdHMgdGhhdCB0aGUgbW9kZWwgY2FuIHN1cHBvcnQuIFRoZSByZWdpb25zIHdpdGhpbiB0aGF0IG5vcm1hbGl6ZWQgcmFuZ2Ugd2VyZSBkZXNpZ25lZCxcclxuICAgKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy9pc3N1ZXMvMjA2I2lzc3VlY29tbWVudC04NDg5NjA3NjQuXHJcbiAgICpcclxuICAgKiBBc3N1bWVzIHRoYXQgdGhlcmUgYXJlIDkgZGVzY3JpcHRpb25zIGZvciBvYmplY3QgZGlzdGFuY2VzLCBpZiB0aGF0IGNoYW5nZSB0aGlzIGZ1bmN0aW9uIHdpbGwgbmVlZCB0byBiZSB1ZHBhdGVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBkaXN0YW5jZSAtIGluIG1vZGVsIHVuaXRzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mUmVnaW9ucyAtIGZvciBjcm9zc2NoZWNrXHJcbiAgICogQHJldHVybnMge251bWJlcn0gLSBpbnRlZ2VyXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXREaXN0YW5jZUluZGV4KCBkaXN0YW5jZSwgbnVtYmVyT2ZSZWdpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGlzdGFuY2UgPiAwLCAnRGlzdGFuY2UgYmV0d2VlbiBzcGhlcmVzIHNob3VsZCBhbHdheXMgYmUgcG9zaXRpdmUuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVyT2ZSZWdpb25zID09PSA5LCAnSWYgbnVtYmVyT2ZSZWdpb25zIGNoYW5nZXMsIHRoaXMgZnVuY3Rpb24gc2hvdWxkIHRvby4nICk7XHJcblxyXG4gICAgY29uc3QgbWF4RGlzdGFuY2UgPSBNYXRoLmFicyggdGhpcy5yaWdodE9iamVjdEJvdW5kYXJ5IC0gdGhpcy5sZWZ0T2JqZWN0Qm91bmRhcnkgKTtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWREaXN0YW5jZSA9IGRpc3RhbmNlIC8gbWF4RGlzdGFuY2U7XHJcblxyXG4gICAgbGV0IGluZGV4O1xyXG4gICAgaWYgKCBub3JtYWxpemVkRGlzdGFuY2UgPT09IDEuMCApIHtcclxuICAgICAgaW5kZXggPSAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG5vcm1hbGl6ZWREaXN0YW5jZSA+PSAwLjk1ICkge1xyXG4gICAgICBpbmRleCA9IDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbm9ybWFsaXplZERpc3RhbmNlID49IDAuOCApIHtcclxuICAgICAgaW5kZXggPSAyO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG5vcm1hbGl6ZWREaXN0YW5jZSA+PSAwLjY1ICkge1xyXG4gICAgICBpbmRleCA9IDM7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbm9ybWFsaXplZERpc3RhbmNlID49IDAuNSApIHtcclxuICAgICAgaW5kZXggPSA0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG5vcm1hbGl6ZWREaXN0YW5jZSA+PSAwLjM1ICkge1xyXG4gICAgICBpbmRleCA9IDU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbm9ybWFsaXplZERpc3RhbmNlID49IDAuMiApIHtcclxuICAgICAgaW5kZXggPSA2O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG5vcm1hbGl6ZWREaXN0YW5jZSA+PSAwLjE0ICkge1xyXG4gICAgICBpbmRleCA9IDc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaW5kZXggPSA4O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbmRleDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSBoZWxwIHRleHQgZm9yIHRoZSBzcGhlcmUgcG9zaXRpb25zIGhlYWRpbmcvY29udGFpbmVyIG5vZGVcclxuICAgKi9cclxuICBnZXRTcGhlcmVQb3NpdGlvbnNIZWxwVGV4dCgpIHtcclxuICAgIGNvbnN0IHF1YW50aXRhdGl2ZURpc3RhbmNlID0gU3RyaW5nVXRpbHMuZmlsbEluKCBkaXN0YW5jZUFwYXJ0UGF0dGVyblN0cmluZywge1xyXG4gICAgICBkaXN0YW5jZUFuZFVuaXRzOiB0aGlzLmdldERpc3RhbmNlQW5kVW5pdHMoKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHNwaGVyZVBvc2l0aW9uSGVscFRleHRTdHJpbmcsIHtcclxuICAgICAgZGlzdGFuY2VBcGFydDogdGhpcy51c2VRdWFudGl0YXRpdmVEaXN0YW5jZSA/IHF1YW50aXRhdGl2ZURpc3RhbmNlIDogdGhpcy5nZXRRdWFsaXRhdGl2ZURpc3RhbmNlRnJvbUVhY2hPdGhlcigpXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHRvIGJlIHVzZWQgaW4gdGhlIHByb3RvdHlwZSB2b2ljaW5nIGNvbnRleHQuIFJldHVybnMgc29tZXRoaW5nIGxpa2VcclxuICAgKiBcIm1hc3MgMSwgNCBraWxvbWV0ZXJzIGZyb20gbWFzcyAxXCIgKGRpc3RhbmNlcyBzaG93bikgb3JcclxuICAgKiBcIm1hc3MgMSwgY2xvc2UgdG8gbWFzcyAxXCIgKGRpc3RhbmNlcyBoaWRkZW4pIG9yXHJcbiAgICogXCJNb3ZlIG1hc3MgMSwgNCBraWxvbWV0ZXJzIGZyb20gbWFzcyAyIChzb3VuZGluZyBtb3JlIGxpa2UgdGhlIFBET00sIFwidmVyc2lvbiAyXCIpXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9iamVjdExhYmVsXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG90aGVyT2JqZWN0TGFiZWxcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Vm9pY2luZ0Rpc3RhbmNlRGVzY3JpcHRpb24oIG9iamVjdExhYmVsLCBvdGhlck9iamVjdExhYmVsICkge1xyXG4gICAgY29uc3QgcGF0dGVyblN0cmluZyA9IHRoaXMudXNlUXVhbnRpdGF0aXZlRGlzdGFuY2UgPyB2b2ljaW5nTGV2ZWxzTWFzc1F1YW50aXRhdGl2ZVBhdHRlcm5TdHJpbmcgOiB2b2ljaW5nTGV2ZWxzTWFzc1F1YWxpdGF0aXZlUGF0dGVyblN0cmluZztcclxuICAgIGNvbnN0IGRpc3RhbmNlRGVzY3JpcHRpb24gPSB0aGlzLnVzZVF1YW50aXRhdGl2ZURpc3RhbmNlID8gdGhpcy5nZXREaXN0YW5jZUFuZFVuaXRzKCkgOiB0aGlzLmdldFF1YWxpdGF0aXZlUmVsYXRpdmVEaXN0YW5jZVJlZ2lvbigpO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdERlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIG9iamVjdDogb2JqZWN0TGFiZWwsXHJcbiAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZURlc2NyaXB0aW9uLFxyXG4gICAgICBvdGhlck9iamVjdDogb3RoZXJPYmplY3RMYWJlbFxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBvYmplY3REZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgdG8gYmUgdXNlZCBpbiB0aGUgcHJvdG90eXBlIHZvaWNpbmcgY29udGVudCwgZGVzY3JpYmluZyB0aGUgZGlzdGFuY2UgYmV0d3NlZW4gb2JqZWN0cy4gU2ltaWxhclxyXG4gICAqIHRvIGdldFZvaWNpbmdEaXN0YW5jZURlc2NyaXB0aW9uLCBidXQgZG9lcyBub3QgaW5sdWNkZSB0aGUgbGFiZWwgdG8gcmVkdWNlIHZlcmJvY2l0eS4gUmV0dXJucyBzb21ldGhpbmcgbGlrZVxyXG4gICAqXHJcbiAgICogXCI0IGtpbG9tZXRlcnMgZnJvbSBtYXNzIDFcIiBvclxyXG4gICAqIFwiY2xvc2UgdG8gbWFzcyAxXCJcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3RoZXJPYmplY3RMYWJlbFxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Vm9pY2luZ0Rpc3RhbmNlRGVzY3JpcHRpb25XaXRob3V0TGFiZWwoIG90aGVyT2JqZWN0TGFiZWwgKSB7XHJcbiAgICBjb25zdCBwYXR0ZXJuU3RyaW5nID0gdGhpcy51c2VRdWFudGl0YXRpdmVEaXN0YW5jZSA/IHZvaWNpbmdMZXZlbHNNYXNzUXVhbnRpdGF0aXZlV2l0aG91dExhYmVsUGF0dGVyblN0cmluZyA6IHZvaWNpbmdMZXZlbHNNYXNzUXVhbGl0YXRpdmVXaXRob3V0TGFiZWxQYXR0ZXJuU3RyaW5nO1xyXG4gICAgY29uc3QgZGlzdGFuY2VEZXNjcmlwdGlvbiA9IHRoaXMudXNlUXVhbnRpdGF0aXZlRGlzdGFuY2UgPyB0aGlzLmdldERpc3RhbmNlQW5kVW5pdHMoKSA6IHRoaXMuZ2V0UXVhbGl0YXRpdmVSZWxhdGl2ZURpc3RhbmNlUmVnaW9uKCk7XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVyblN0cmluZywge1xyXG4gICAgICBkaXN0YW5jZTogZGlzdGFuY2VEZXNjcmlwdGlvbixcclxuICAgICAgb3RoZXJPYmplY3Q6IG90aGVyT2JqZWN0TGFiZWxcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpbGxlZCBpbiBtb3ZhYmxlIG9iamVjdCBwb3NpdGlvbiBsYWJlbC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbGFiZWxcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGF0aWMgZ2V0T2JqZWN0TGFiZWxQb3NpdGlvblRleHQoIGxhYmVsICkge1xyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggb2JqZWN0TGFiZWxQb3NpdGlvblBhdHRlcm5TdHJpbmcsIHsgbGFiZWw6IGxhYmVsIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmludmVyc2VTcXVhcmVMYXdDb21tb24ucmVnaXN0ZXIoICdQb3NpdGlvbkRlc2NyaWJlcicsIFBvc2l0aW9uRGVzY3JpYmVyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBvc2l0aW9uRGVzY3JpYmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxzQkFBc0IsTUFBTSxpQ0FBaUM7QUFDcEUsT0FBT0MsNkJBQTZCLE1BQU0sd0NBQXdDO0FBQ2xGLE9BQU9DLGNBQWMsTUFBTSwrQkFBK0I7QUFDMUQsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxNQUFNQyxpQkFBaUIsR0FBR0gsNkJBQTZCLENBQUNJLEtBQUssQ0FBQ0MsTUFBTTtBQUNwRSxNQUFNQyxnQkFBZ0IsR0FBR04sNkJBQTZCLENBQUNJLEtBQUssQ0FBQ0csS0FBSztBQUVsRSxNQUFNQyxnQ0FBZ0MsR0FBR1IsNkJBQTZCLENBQUNTLElBQUksQ0FBQ0MsTUFBTSxDQUFDQywwQkFBMEI7QUFDN0csTUFBTUMsb0NBQW9DLEdBQUdaLDZCQUE2QixDQUFDUyxJQUFJLENBQUNJLGFBQWEsQ0FBQ0MsOEJBQThCO0FBQzVILE1BQU1DLHlDQUF5QyxHQUFHZiw2QkFBNkIsQ0FBQ1MsSUFBSSxDQUFDSSxhQUFhLENBQUNHLG1DQUFtQztBQUN0SSxNQUFNQywyQkFB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