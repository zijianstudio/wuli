// Copyright 2018-2023, University of Colorado Boulder

import Multilink from '../../../axon/js/Multilink.js';
import ISLCObjectDescriptionNode from '../../../inverse-square-law-common/js/view/ISLCObjectDescriptionNode.js';
import ISLCObjectEnum from '../../../inverse-square-law-common/js/model/ISLCObjectEnum.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../scenery/js/imports.js';
import gravityForceLab from '../gravityForceLab.js';
import GravityForceLabStrings from '../GravityForceLabStrings.js';
const mass1AbbreviatedString = GravityForceLabStrings.mass1Abbreviated;
const mass2AbbreviatedString = GravityForceLabStrings.mass2Abbreviated;
const sizePatternString = GravityForceLabStrings.a11y.sizePattern;
const sizeAndDistancePatternString = GravityForceLabStrings.a11y.sizeAndDistancePattern;
const redSpherePatternString = GravityForceLabStrings.a11y.redSpherePattern;
const blueSpherePatternString = GravityForceLabStrings.a11y.blueSpherePattern;
class MassDescriptionNode extends ISLCObjectDescriptionNode {
  /**
   * @param {ISLCModel} model
   * @param {ISLCObject} thisObject
   * @param {MassDescriber} massDescriber
   * @param {ForceDescriber} forceDescriber
   * @param {GravityForceLabPositionDescriber} positionDescriber
   * @param {Object} [options]
   */
  constructor(model, thisObject, massDescriber, forceDescriber, positionDescriber, options) {
    options = merge({
      object1Label: mass1AbbreviatedString,
      object2Label: mass2AbbreviatedString
    }, options);
    super(model, thisObject.enum, options);

    // @private
    this.object = thisObject; // {ISLCObject}

    // @protected
    this.objectEnum = thisObject.enum; // {ISLCObjectEnum}
    this.mass = massDescriber.getObjectFromEnum(this.objectEnum); // {ISLCObject}
    this.massLabel = massDescriber.getObjectLabelFromEnum(this.objectEnum); // {string}
    this.positionDescriber = positionDescriber; // {PositionDescriber}
    this.massDescriber = massDescriber; // {MassDescriber}

    // set the accessibleName after member fields have been initialized
    this.labelContent = this.getMassSphereString();
    this.massAndPositionNode = new Node({
      tagName: 'li'
    });
    this.addChild(this.massAndPositionNode);

    // update the mass and position Node content whenever these dependencies change.
    Multilink.multilink([model.forceProperty, model.constantRadiusProperty,
    // We need to link to these in addition to the forceProperty because of a listener order of ops issue found
    // in https://github.com/phetsims/gravity-force-lab-basics/issues/103
    model.object1.positionProperty, model.object2.positionProperty], () => this.updateMassAndPositionElement());
    model.forceProperty.link(() => {
      const forceBetweenContent = forceDescriber.getForceBetweenAndVectorText(this.thisObjectLabel, this.otherObjectLabel);
      const forceMagnitudeContent = forceDescriber.getForceVectorMagnitudeText(this.thisObjectLabel, this.otherObjectLabel);
      this.forceBetweenAndVectorNode.innerContent = forceBetweenContent;
      this.forceVectorMagnitudeItemNode.innerContent = forceMagnitudeContent;
    });
    if (model.forceValuesDisplayProperty) {
      model.forceValuesDisplayProperty.link(() => {
        this.forceVectorMagnitudeItemNode.innerContent = forceDescriber.getForceVectorMagnitudeText(this.thisObjectLabel, this.otherObjectLabel);
      });
    }
  }

  /**
   * @returns {string}
   * @protected
   */
  getMassValue() {
    return this.massDescriber.getFormattedMass(this.mass.valueProperty.get());
  }

  /**
   * Update the mass and positions sentence in the PDOM Node, can be called on demand by subtypes.
   * @protected
   */
  updateMassAndPositionElement() {
    const sizeText = StringUtils.fillIn(sizePatternString, {
      thisObjectLabel: this.massLabel,
      massValue: this.getMassValue()
    });
    this.massAndPositionNode.innerContent = StringUtils.fillIn(sizeAndDistancePatternString, {
      size: sizeText,
      distance: this.positionDescriber.getDistanceClause(this.objectEnum),
      relativeSize: this.massDescriber.getRelativeSizeOrDensity(this.objectEnum),
      otherObjectLabel: this.massDescriber.getOtherObjectLabelFromEnum(this.objectEnum)
    });
  }

  /**
   * @returns {string}
   * @private
   */
  getMassSphereString() {
    const pattern = ISLCObjectEnum.isObject1(this.objectEnum) ? blueSpherePatternString : redSpherePatternString;
    return StringUtils.fillIn(pattern, {
      objectLabel: this.massLabel
    });
  }
}
gravityForceLab.register('MassDescriptionNode', MassDescriptionNode);
export default MassDescriptionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJJU0xDT2JqZWN0RGVzY3JpcHRpb25Ob2RlIiwiSVNMQ09iamVjdEVudW0iLCJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiTm9kZSIsImdyYXZpdHlGb3JjZUxhYiIsIkdyYXZpdHlGb3JjZUxhYlN0cmluZ3MiLCJtYXNzMUFiYnJldmlhdGVkU3RyaW5nIiwibWFzczFBYmJyZXZpYXRlZCIsIm1hc3MyQWJicmV2aWF0ZWRTdHJpbmciLCJtYXNzMkFiYnJldmlhdGVkIiwic2l6ZVBhdHRlcm5TdHJpbmciLCJhMTF5Iiwic2l6ZVBhdHRlcm4iLCJzaXplQW5kRGlzdGFuY2VQYXR0ZXJuU3RyaW5nIiwic2l6ZUFuZERpc3RhbmNlUGF0dGVybiIsInJlZFNwaGVyZVBhdHRlcm5TdHJpbmciLCJyZWRTcGhlcmVQYXR0ZXJuIiwiYmx1ZVNwaGVyZVBhdHRlcm5TdHJpbmciLCJibHVlU3BoZXJlUGF0dGVybiIsIk1hc3NEZXNjcmlwdGlvbk5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGhpc09iamVjdCIsIm1hc3NEZXNjcmliZXIiLCJmb3JjZURlc2NyaWJlciIsInBvc2l0aW9uRGVzY3JpYmVyIiwib3B0aW9ucyIsIm9iamVjdDFMYWJlbCIsIm9iamVjdDJMYWJlbCIsImVudW0iLCJvYmplY3QiLCJvYmplY3RFbnVtIiwibWFzcyIsImdldE9iamVjdEZyb21FbnVtIiwibWFzc0xhYmVsIiwiZ2V0T2JqZWN0TGFiZWxGcm9tRW51bSIsImxhYmVsQ29udGVudCIsImdldE1hc3NTcGhlcmVTdHJpbmciLCJtYXNzQW5kUG9zaXRpb25Ob2RlIiwidGFnTmFtZSIsImFkZENoaWxkIiwibXVsdGlsaW5rIiwiZm9yY2VQcm9wZXJ0eSIsImNvbnN0YW50UmFkaXVzUHJvcGVydHkiLCJvYmplY3QxIiwicG9zaXRpb25Qcm9wZXJ0eSIsIm9iamVjdDIiLCJ1cGRhdGVNYXNzQW5kUG9zaXRpb25FbGVtZW50IiwibGluayIsImZvcmNlQmV0d2VlbkNvbnRlbnQiLCJnZXRGb3JjZUJldHdlZW5BbmRWZWN0b3JUZXh0IiwidGhpc09iamVjdExhYmVsIiwib3RoZXJPYmplY3RMYWJlbCIsImZvcmNlTWFnbml0dWRlQ29udGVudCIsImdldEZvcmNlVmVjdG9yTWFnbml0dWRlVGV4dCIsImZvcmNlQmV0d2VlbkFuZFZlY3Rvck5vZGUiLCJpbm5lckNvbnRlbnQiLCJmb3JjZVZlY3Rvck1hZ25pdHVkZUl0ZW1Ob2RlIiwiZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkiLCJnZXRNYXNzVmFsdWUiLCJnZXRGb3JtYXR0ZWRNYXNzIiwidmFsdWVQcm9wZXJ0eSIsImdldCIsInNpemVUZXh0IiwiZmlsbEluIiwibWFzc1ZhbHVlIiwic2l6ZSIsImRpc3RhbmNlIiwiZ2V0RGlzdGFuY2VDbGF1c2UiLCJyZWxhdGl2ZVNpemUiLCJnZXRSZWxhdGl2ZVNpemVPckRlbnNpdHkiLCJnZXRPdGhlck9iamVjdExhYmVsRnJvbUVudW0iLCJwYXR0ZXJuIiwiaXNPYmplY3QxIiwib2JqZWN0TGFiZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hc3NEZXNjcmlwdGlvbk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBJU0xDT2JqZWN0RGVzY3JpcHRpb25Ob2RlIGZyb20gJy4uLy4uLy4uL2ludmVyc2Utc3F1YXJlLWxhdy1jb21tb24vanMvdmlldy9JU0xDT2JqZWN0RGVzY3JpcHRpb25Ob2RlLmpzJztcclxuaW1wb3J0IElTTENPYmplY3RFbnVtIGZyb20gJy4uLy4uLy4uL2ludmVyc2Utc3F1YXJlLWxhdy1jb21tb24vanMvbW9kZWwvSVNMQ09iamVjdEVudW0uanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ3Jhdml0eUZvcmNlTGFiIGZyb20gJy4uL2dyYXZpdHlGb3JjZUxhYi5qcyc7XHJcbmltcG9ydCBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzIGZyb20gJy4uL0dyYXZpdHlGb3JjZUxhYlN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgbWFzczFBYmJyZXZpYXRlZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MubWFzczFBYmJyZXZpYXRlZDtcclxuY29uc3QgbWFzczJBYmJyZXZpYXRlZFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MubWFzczJBYmJyZXZpYXRlZDtcclxuY29uc3Qgc2l6ZVBhdHRlcm5TdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkuc2l6ZVBhdHRlcm47XHJcbmNvbnN0IHNpemVBbmREaXN0YW5jZVBhdHRlcm5TdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmExMXkuc2l6ZUFuZERpc3RhbmNlUGF0dGVybjtcclxuY29uc3QgcmVkU3BoZXJlUGF0dGVyblN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5yZWRTcGhlcmVQYXR0ZXJuO1xyXG5jb25zdCBibHVlU3BoZXJlUGF0dGVyblN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5ibHVlU3BoZXJlUGF0dGVybjtcclxuXHJcbmNsYXNzIE1hc3NEZXNjcmlwdGlvbk5vZGUgZXh0ZW5kcyBJU0xDT2JqZWN0RGVzY3JpcHRpb25Ob2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtJU0xDTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtJU0xDT2JqZWN0fSB0aGlzT2JqZWN0XHJcbiAgICogQHBhcmFtIHtNYXNzRGVzY3JpYmVyfSBtYXNzRGVzY3JpYmVyXHJcbiAgICogQHBhcmFtIHtGb3JjZURlc2NyaWJlcn0gZm9yY2VEZXNjcmliZXJcclxuICAgKiBAcGFyYW0ge0dyYXZpdHlGb3JjZUxhYlBvc2l0aW9uRGVzY3JpYmVyfSBwb3NpdGlvbkRlc2NyaWJlclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRoaXNPYmplY3QsIG1hc3NEZXNjcmliZXIsIGZvcmNlRGVzY3JpYmVyLCBwb3NpdGlvbkRlc2NyaWJlciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgb2JqZWN0MUxhYmVsOiBtYXNzMUFiYnJldmlhdGVkU3RyaW5nLFxyXG4gICAgICBvYmplY3QyTGFiZWw6IG1hc3MyQWJicmV2aWF0ZWRTdHJpbmdcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWwsIHRoaXNPYmplY3QuZW51bSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm9iamVjdCA9IHRoaXNPYmplY3Q7IC8vIHtJU0xDT2JqZWN0fVxyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWRcclxuICAgIHRoaXMub2JqZWN0RW51bSA9IHRoaXNPYmplY3QuZW51bTsgLy8ge0lTTENPYmplY3RFbnVtfVxyXG4gICAgdGhpcy5tYXNzID0gbWFzc0Rlc2NyaWJlci5nZXRPYmplY3RGcm9tRW51bSggdGhpcy5vYmplY3RFbnVtICk7IC8vIHtJU0xDT2JqZWN0fVxyXG4gICAgdGhpcy5tYXNzTGFiZWwgPSBtYXNzRGVzY3JpYmVyLmdldE9iamVjdExhYmVsRnJvbUVudW0oIHRoaXMub2JqZWN0RW51bSApOyAvLyB7c3RyaW5nfVxyXG4gICAgdGhpcy5wb3NpdGlvbkRlc2NyaWJlciA9IHBvc2l0aW9uRGVzY3JpYmVyOyAvLyB7UG9zaXRpb25EZXNjcmliZXJ9XHJcbiAgICB0aGlzLm1hc3NEZXNjcmliZXIgPSBtYXNzRGVzY3JpYmVyOyAvLyB7TWFzc0Rlc2NyaWJlcn1cclxuXHJcbiAgICAvLyBzZXQgdGhlIGFjY2Vzc2libGVOYW1lIGFmdGVyIG1lbWJlciBmaWVsZHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkXHJcbiAgICB0aGlzLmxhYmVsQ29udGVudCA9IHRoaXMuZ2V0TWFzc1NwaGVyZVN0cmluZygpO1xyXG5cclxuICAgIHRoaXMubWFzc0FuZFBvc2l0aW9uTm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdsaScgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubWFzc0FuZFBvc2l0aW9uTm9kZSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgbWFzcyBhbmQgcG9zaXRpb24gTm9kZSBjb250ZW50IHdoZW5ldmVyIHRoZXNlIGRlcGVuZGVuY2llcyBjaGFuZ2UuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXHJcbiAgICAgIG1vZGVsLmZvcmNlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmNvbnN0YW50UmFkaXVzUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBXZSBuZWVkIHRvIGxpbmsgdG8gdGhlc2UgaW4gYWRkaXRpb24gdG8gdGhlIGZvcmNlUHJvcGVydHkgYmVjYXVzZSBvZiBhIGxpc3RlbmVyIG9yZGVyIG9mIG9wcyBpc3N1ZSBmb3VuZFxyXG4gICAgICAvLyBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3Jhdml0eS1mb3JjZS1sYWItYmFzaWNzL2lzc3Vlcy8xMDNcclxuICAgICAgbW9kZWwub2JqZWN0MS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5vYmplY3QyLnBvc2l0aW9uUHJvcGVydHlcclxuICAgIF0sICgpID0+IHRoaXMudXBkYXRlTWFzc0FuZFBvc2l0aW9uRWxlbWVudCgpICk7XHJcblxyXG4gICAgbW9kZWwuZm9yY2VQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZvcmNlQmV0d2VlbkNvbnRlbnQgPSBmb3JjZURlc2NyaWJlci5nZXRGb3JjZUJldHdlZW5BbmRWZWN0b3JUZXh0KCB0aGlzLnRoaXNPYmplY3RMYWJlbCwgdGhpcy5vdGhlck9iamVjdExhYmVsICk7XHJcbiAgICAgIGNvbnN0IGZvcmNlTWFnbml0dWRlQ29udGVudCA9IGZvcmNlRGVzY3JpYmVyLmdldEZvcmNlVmVjdG9yTWFnbml0dWRlVGV4dCggdGhpcy50aGlzT2JqZWN0TGFiZWwsIHRoaXMub3RoZXJPYmplY3RMYWJlbCApO1xyXG5cclxuICAgICAgdGhpcy5mb3JjZUJldHdlZW5BbmRWZWN0b3JOb2RlLmlubmVyQ29udGVudCA9IGZvcmNlQmV0d2VlbkNvbnRlbnQ7XHJcbiAgICAgIHRoaXMuZm9yY2VWZWN0b3JNYWduaXR1ZGVJdGVtTm9kZS5pbm5lckNvbnRlbnQgPSBmb3JjZU1hZ25pdHVkZUNvbnRlbnQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBtb2RlbC5mb3JjZVZhbHVlc0Rpc3BsYXlQcm9wZXJ0eSApIHtcclxuICAgICAgbW9kZWwuZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZm9yY2VWZWN0b3JNYWduaXR1ZGVJdGVtTm9kZS5pbm5lckNvbnRlbnQgPSBmb3JjZURlc2NyaWJlci5nZXRGb3JjZVZlY3Rvck1hZ25pdHVkZVRleHQoIHRoaXMudGhpc09iamVjdExhYmVsLCB0aGlzLm90aGVyT2JqZWN0TGFiZWwgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgZ2V0TWFzc1ZhbHVlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWFzc0Rlc2NyaWJlci5nZXRGb3JtYXR0ZWRNYXNzKCB0aGlzLm1hc3MudmFsdWVQcm9wZXJ0eS5nZXQoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBtYXNzIGFuZCBwb3NpdGlvbnMgc2VudGVuY2UgaW4gdGhlIFBET00gTm9kZSwgY2FuIGJlIGNhbGxlZCBvbiBkZW1hbmQgYnkgc3VidHlwZXMuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHVwZGF0ZU1hc3NBbmRQb3NpdGlvbkVsZW1lbnQoKSB7XHJcbiAgICBjb25zdCBzaXplVGV4dCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2l6ZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgdGhpc09iamVjdExhYmVsOiB0aGlzLm1hc3NMYWJlbCxcclxuICAgICAgbWFzc1ZhbHVlOiB0aGlzLmdldE1hc3NWYWx1ZSgpXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tYXNzQW5kUG9zaXRpb25Ob2RlLmlubmVyQ29udGVudCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2l6ZUFuZERpc3RhbmNlUGF0dGVyblN0cmluZywge1xyXG4gICAgICBzaXplOiBzaXplVGV4dCxcclxuICAgICAgZGlzdGFuY2U6IHRoaXMucG9zaXRpb25EZXNjcmliZXIuZ2V0RGlzdGFuY2VDbGF1c2UoIHRoaXMub2JqZWN0RW51bSApLFxyXG4gICAgICByZWxhdGl2ZVNpemU6IHRoaXMubWFzc0Rlc2NyaWJlci5nZXRSZWxhdGl2ZVNpemVPckRlbnNpdHkoIHRoaXMub2JqZWN0RW51bSApLFxyXG4gICAgICBvdGhlck9iamVjdExhYmVsOiB0aGlzLm1hc3NEZXNjcmliZXIuZ2V0T3RoZXJPYmplY3RMYWJlbEZyb21FbnVtKCB0aGlzLm9iamVjdEVudW0gKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldE1hc3NTcGhlcmVTdHJpbmcoKSB7XHJcbiAgICBjb25zdCBwYXR0ZXJuID0gSVNMQ09iamVjdEVudW0uaXNPYmplY3QxKCB0aGlzLm9iamVjdEVudW0gKSA/IGJsdWVTcGhlcmVQYXR0ZXJuU3RyaW5nIDogcmVkU3BoZXJlUGF0dGVyblN0cmluZztcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHBhdHRlcm4sIHsgb2JqZWN0TGFiZWw6IHRoaXMubWFzc0xhYmVsIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXZpdHlGb3JjZUxhYi5yZWdpc3RlciggJ01hc3NEZXNjcmlwdGlvbk5vZGUnLCBNYXNzRGVzY3JpcHRpb25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1hc3NEZXNjcmlwdGlvbk5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFHQSxPQUFPQSxTQUFTLE1BQU0sK0JBQStCO0FBQ3JELE9BQU9DLHlCQUF5QixNQUFNLHlFQUF5RTtBQUMvRyxPQUFPQyxjQUFjLE1BQU0sK0RBQStEO0FBQzFGLE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxTQUFTQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQ3JELE9BQU9DLGVBQWUsTUFBTSx1QkFBdUI7QUFDbkQsT0FBT0Msc0JBQXNCLE1BQU0sOEJBQThCO0FBRWpFLE1BQU1DLHNCQUFzQixHQUFHRCxzQkFBc0IsQ0FBQ0UsZ0JBQWdCO0FBQ3RFLE1BQU1DLHNCQUFzQixHQUFHSCxzQkFBc0IsQ0FBQ0ksZ0JBQWdCO0FBQ3RFLE1BQU1DLGlCQUFpQixHQUFHTCxzQkFBc0IsQ0FBQ00sSUFBSSxDQUFDQyxXQUFXO0FBQ2pFLE1BQU1DLDRCQUE0QixHQUFHUixzQkFBc0IsQ0FBQ00sSUFBSSxDQUFDRyxzQkFBc0I7QUFDdkYsTUFBTUMsc0JBQXNCLEdBQUdWLHNCQUFzQixDQUFDTSxJQUFJLENBQUNLLGdCQUFnQjtBQUMzRSxNQUFNQyx1QkFBdUIsR0FBR1osc0JBQXNCLENBQUNNLElBQUksQ0FBQ08saUJBQWlCO0FBRTdFLE1BQU1DLG1CQUFtQixTQUFTcEIseUJBQXlCLENBQUM7RUFFMUQ7QUFDRjtBQUNBO0FB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