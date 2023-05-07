// Copyright 2023, University of Colorado Boulder
/**
 * Visual Node for the Elliptical Orbit based on the Orbital Parameters
 *
 * @author Agustín Vallejo
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Node, Path, RichText, Text } from '../../../../scenery/js/imports.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import XNode from '../../../../scenery-phet/js/XNode.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import SolarSystemCommonColors from '../../../../solar-system-common/js/SolarSystemCommonColors.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import KeplersLawsStrings from '../../../../keplers-laws/js/KeplersLawsStrings.js';
import keplersLaws from '../../keplersLaws.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import KeplersLawsConstants from '../../KeplersLawsConstants.js';
export default class EllipticalOrbitNode extends Path {
  constructor(model, modelViewTransformProperty) {
    // Passing in a null shape, since it will be updated later
    super(null, {
      lineWidth: 3,
      stroke: SolarSystemCommonColors.orbitColorProperty
    });
    this.orbit = model.engine;

    // Top layer is a field because it has to be accessed from the ScreenView and added as a child there
    this.topLayer = new Node({
      visibleProperty: this.orbit.allowedOrbitProperty
    });
    const labelsLayer = new Node({
      visibleProperty: this.orbit.allowedOrbitProperty
    });
    const firstLawLayer = new Node({
      visibleProperty: this.orbit.allowedOrbitProperty
    });
    const secondLawLayer = new Node({
      visibleProperty: this.orbit.allowedOrbitProperty
    });
    const thirdLawLayer = new Node({
      visibleProperty: this.orbit.allowedOrbitProperty
    });

    // Also Top Layer is not added as child because it's a child of the ScreenView, just controlled in here
    this.addChild(labelsLayer);
    this.addChild(firstLawLayer);
    this.addChild(secondLawLayer);
    this.addChild(thirdLawLayer);

    // Text Nodes
    const aLabelNode = new Text(KeplersLawsStrings.symbols.semiMajorAxisStringProperty, combineOptions({
      visibleProperty: DerivedProperty.or([model.semiaxisVisibleProperty, model.semiMajorAxisVisibleProperty, model.eccentricityVisibleProperty])
    }, SolarSystemCommonConstants.TEXT_OPTIONS, {
      scale: 1.5,
      stroke: 'orange',
      fill: 'orange'
    }));
    const bLabelNode = new Text(KeplersLawsStrings.symbols.semiMinorAxisStringProperty, combineOptions({
      visibleProperty: model.semiaxisVisibleProperty
    }, SolarSystemCommonConstants.TEXT_OPTIONS, {
      scale: 1.5,
      stroke: 'orange',
      fill: 'orange'
    }));
    const cLabelNode = new Text(KeplersLawsStrings.symbols.focalDistanceStringProperty, combineOptions({
      visibleProperty: new DerivedProperty([model.eccentricityVisibleProperty, model.engine.eccentricityProperty], (visible, e) => {
        return visible && e > 0;
      })
    }, SolarSystemCommonConstants.TEXT_OPTIONS, {
      scale: 1.5,
      stroke: SolarSystemCommonColors.thirdBodyColorProperty,
      fill: SolarSystemCommonColors.thirdBodyColorProperty
    }));
    const stringLabelNode1 = new RichText('d<sub>1', combineOptions({
      visibleProperty: new DerivedProperty([model.stringsVisibleProperty, model.engine.eccentricityProperty], (visible, e) => {
        return visible && e > 0;
      })
    }, SolarSystemCommonConstants.TEXT_OPTIONS, {
      scale: 1.5,
      stroke: '#ccb285',
      fill: '#ccb285'
    }));
    const stringLabelNode2 = new RichText('d<sub>2', combineOptions({
      visibleProperty: new DerivedProperty([model.stringsVisibleProperty, model.engine.eccentricityProperty], (visible, e) => {
        return visible && e > 0;
      })
    }, SolarSystemCommonConstants.TEXT_OPTIONS, {
      scale: 1.5,
      stroke: '#ccb285',
      fill: '#ccb285'
    }));
    const radiusLabelNode = new RichText('r', combineOptions({
      visibleProperty: new DerivedProperty([model.stringsVisibleProperty, model.engine.eccentricityProperty], (visible, e) => {
        return visible && e === 0;
      })
    }, SolarSystemCommonConstants.TEXT_OPTIONS, {
      scale: 1.5,
      stroke: '#ccb285',
      fill: '#ccb285'
    }));

    // FIRST LAW: Axis, foci, and Ellipse definition lines
    const axisPath = new Path(null, {
      stroke: SolarSystemCommonColors.foregroundProperty,
      lineWidth: 2,
      visibleProperty: DerivedProperty.or([model.axisVisibleProperty, model.semiMajorAxisVisibleProperty])
    });
    const semiAxisPath = new Path(null, {
      stroke: 'orange',
      lineWidth: 3,
      visibleProperty: model.semiaxisVisibleProperty
    });
    const focalDistancePath = new Path(null, {
      stroke: SolarSystemCommonColors.thirdBodyColorProperty,
      lineWidth: 3,
      visibleProperty: model.eccentricityVisibleProperty
    });
    const stringsPath = new Path(null, {
      stroke: '#ccb285',
      lineWidth: 3,
      visibleProperty: model.stringsVisibleProperty,
      lineDash: [10, 2]
    });
    const fociOptions = {
      fill: '#29ABE2',
      stroke: SolarSystemCommonColors.backgroundProperty,
      scale: 0.8,
      center: Vector2.ZERO,
      visibleProperty: model.fociVisibleProperty
    };
    const foci = [new XNode(fociOptions), new XNode(fociOptions)];

    // SECOND LAW: Periapsis and Apoapsis
    const periapsis = new XNode({
      fill: 'gold',
      stroke: SolarSystemCommonColors.foregroundProperty,
      center: Vector2.ZERO,
      visibleProperty: new DerivedProperty([model.periapsisVisibleProperty, this.orbit.eccentricityProperty], (visible, e) => {
        return visible && e > 0;
      })
    });
    const apoapsis = new XNode({
      fill: SolarSystemCommonColors.thirdBodyColorProperty,
      stroke: SolarSystemCommonColors.foregroundProperty,
      center: Vector2.ZERO,
      visibleProperty: new DerivedProperty([model.apoapsisVisibleProperty, this.orbit.eccentricityProperty], (visible, e) => {
        return visible && e > 0;
      })
    });

    // Arrays of orbital divisions' dots and areas
    const orbitDivisions = [];
    const areaPaths = [];
    const areaValueProperties = [];
    const areaValueNumberDisplays = [];
    const areaValueRange = new Range(0, 1);
    for (let i = 0; i < KeplersLawsConstants.MAX_ORBITAL_DIVISIONS; i++) {
      orbitDivisions.push(new Circle(4, {
        fill: 'black',
        stroke: SolarSystemCommonColors.orbitColorProperty,
        lineWidth: 3,
        center: Vector2.ZERO,
        visible: false
      }));
      areaPaths.push(new Path(null, {
        fill: SolarSystemCommonColors.orbitColorProperty
      }));
      const areaValueProperty = new NumberProperty(0);
      areaValueProperties.push(areaValueProperty);
      areaValueNumberDisplays.push(new NumberDisplay(areaValueProperty, areaValueRange, {
        scale: 0.7,
        opacity: 0.8,
        numberFormatter: value => {
          return Utils.toFixed(value, 2) + 'AU²';
        }
      }));
    }

    // Nodes for the orbital divisions' dots and areas
    // There are Nodes and arrays separately to access them by index
    const orbitDivisionsNode = new Node();
    const areaPathsNode = new Node({
      visibleProperty: model.isSecondLawProperty
    });
    const areaValuesNode = new Node({
      visibleProperty: DerivedProperty.and([model.isSecondLawProperty, model.areaValuesVisibleProperty])
    });
    orbitDivisions.forEach(node => {
      orbitDivisionsNode.addChild(node);
    });
    areaPaths.forEach(node => {
      areaPathsNode.addChild(node);
    });
    areaValueNumberDisplays.forEach(node => {
      areaValuesNode.addChild(node);
    });

    // THIRD LAW: SemiMajor axis
    const semiMajorAxisPath = new Path(null, {
      stroke: 'orange',
      lineWidth: 3,
      visibleProperty: DerivedProperty.or([model.semiaxisVisibleProperty, model.semiMajorAxisVisibleProperty, model.eccentricityVisibleProperty])
    });
    const trackPath = new Path(null, {
      stroke: SolarSystemCommonColors.thirdBodyColorProperty,
      lineWidth: 5,
      visibleProperty: model.periodVisibleProperty
    });

    // Text Nodes
    labelsLayer.addChild(aLabelNode);
    labelsLayer.addChild(bLabelNode);
    labelsLayer.addChild(cLabelNode);
    labelsLayer.addChild(stringLabelNode1);
    labelsLayer.addChild(stringLabelNode2);
    labelsLayer.addChild(radiusLabelNode);

    // First Law: Axis, foci, and Ellipse definition lines
    firstLawLayer.addChild(axisPath);
    firstLawLayer.addChild(semiAxisPath);
    firstLawLayer.addChild(stringsPath);
    firstLawLayer.addChild(focalDistancePath);

    // Second Law: Periapsis, Apoapsis and orbital division dots and areas
    secondLawLayer.addChild(areaPathsNode);
    secondLawLayer.addChild(periapsis);
    secondLawLayer.addChild(apoapsis);
    secondLawLayer.addChild(orbitDivisionsNode);
    secondLawLayer.addChild(areaValuesNode);

    // Third Law: SemiMajor axis, and track
    thirdLawLayer.addChild(semiMajorAxisPath);
    thirdLawLayer.addChild(trackPath);
    this.topLayer.addChild(foci[0]);
    this.topLayer.addChild(foci[1]);
    const updatedOrbit = () => {
      // Non allowed orbits will show up as dashed lines
      this.lineDash = this.orbit.allowedOrbitProperty.value ? [0] : [5];
      const scale = modelViewTransformProperty.value.modelToViewDeltaX(1);

      // Ellipse distances in model coordinates
      const a = this.orbit.a;
      const b = this.orbit.b;
      const c = this.orbit.c;
      const e = this.orbit.e;
      const center = new Vector2(-c, 0).times(scale);
      const radiusX = scale * a;
      const radiusY = scale * b;
      const radiusC = scale * c; // Focal point

      const applyTransformation = point => {
        point.translation = modelViewTransformProperty.value.modelToViewPosition(center.times(1 / scale));
        point.rotation = 0;
        point.rotateAround(point.translation.add(center.times(-1)), -this.orbit.w);
      };

      // The ellipse is translated and rotated so its children can use local coordinates
      applyTransformation(this);
      this.shape = new Shape().ellipse(0, 0, radiusX, radiusY, 0);

      // Same transformations set to TopLayer because it's not directly a child of this
      applyTransformation(this.topLayer);

      // The Number Display for areas is scaled according to the orbit size
      const numberDisplayPositionScaling = vectorMagnitude => {
        // Scaling the vector sum of the dot positions
        const minScaling = 1.2;
        const maxScaling = 2.0;

        // Here, a1 and a2 are the semi-major and semi-minor axes of the ellipse
        return Math.pow(Utils.clamp(Utils.linear(50, 200, maxScaling, minScaling, vectorMagnitude), minScaling, maxScaling), 1 - model.engine.e * model.engine.e);
      };

      // FIRST LAW -------------------------------------------
      // Axis of the ellipse
      const axis = new Shape().moveTo(-radiusX, 0).lineTo(radiusX, 0);
      axis.moveTo(0, -radiusY).lineTo(0, radiusY);
      axisPath.shape = axis;

      // Semi-axis of the ellipse
      const semiAxis = new Shape().moveTo(0, 0).lineTo(-radiusX, 0);
      // const semiAxis = new ArrowShape( 0, 0, -radiusX, 0, {} );
      semiAxis.moveTo(0, 0).lineTo(0, radiusY);
      semiAxisPath.shape = semiAxis;
      aLabelNode.center = new Vector2(-radiusX / 2, 10);
      aLabelNode.rotation = this.orbit.w;
      bLabelNode.center = new Vector2(-15, radiusY / 2);
      bLabelNode.rotation = this.orbit.w;
      focalDistancePath.shape = new Shape().moveTo(0, 0).lineTo(e * radiusX, 0);
      cLabelNode.center = new Vector2(e * radiusX / 2, 10);
      cLabelNode.rotation = this.orbit.w;

      // Strings of the foci
      const bodyPosition = this.orbit.createPolar(-this.orbit.nu).times(scale);
      const stringsShape = new Shape().moveTo(-radiusC, 0).lineTo(bodyPosition.x + radiusC, bodyPosition.y);
      stringsShape.moveTo(radiusC, 0).lineTo(bodyPosition.x + radiusC, bodyPosition.y);
      stringsPath.shape = stringsShape;
      const labelsYPosition = bodyPosition.y / 2;
      const offsetVector = new Vector2(0, 15).rotated(bodyPosition.angle);
      stringLabelNode1.center = new Vector2(bodyPosition.x / 2 + radiusC, labelsYPosition).add(offsetVector);
      stringLabelNode1.rotation = this.orbit.w;
      stringLabelNode2.center = new Vector2(bodyPosition.x / 2, labelsYPosition).add(offsetVector);
      stringLabelNode2.rotation = this.orbit.w;
      radiusLabelNode.center = new Vector2(bodyPosition.x / 2, labelsYPosition).add(offsetVector);
      radiusLabelNode.rotation = this.orbit.w;

      //Foci
      foci[0].rotation = this.orbit.w + Math.PI / 4;
      foci[0].center = new Vector2(-radiusC, 0);
      foci[1].rotation = this.orbit.w + Math.PI / 4;
      foci[1].center = new Vector2(radiusC, 0);

      // SECOND LAW -------------------------------------------
      // Periapsis and apoapsis
      periapsis.center = new Vector2(scale * (a * (1 - e) + c), 0);
      apoapsis.center = new Vector2(-scale * (a * (1 + e) - c), 0);

      // Drawing orbital divisions and areas
      this.orbit.orbitalAreas.forEach((area, i) => {
        orbitDivisions[i].visible = model.isSecondLawProperty.value && area.active;
        areaPaths[i].visible = model.isSecondLawProperty.value && area.active;
        areaValueNumberDisplays[i].visible = model.isSecondLawProperty.value && area.active;
        let numberDisplayPosition = new Vector2(0, 0);
        let numberDisplayScaling = 1;
        if (i < model.periodDivisionProperty.value) {
          // Set the center of the orbit's divisions dot
          const dotPosition = area.dotPosition.times(scale).minus(center);
          orbitDivisions[i].center = dotPosition;
          orbitDivisions[i].fill = SolarSystemCommonColors.orbitColorProperty.value.darkerColor(Math.pow(1 - area.completion, 10));
          const start = area.startPosition.times(scale).minus(center);
          const end = area.endPosition.times(scale).minus(center);
          const startAngle = Math.atan2(start.y / radiusY, start.x / radiusX);
          const endAngle = Math.atan2(end.y / radiusY, end.x / radiusX);

          // Mean value between start and end
          numberDisplayPosition = model.engine.createPolar((area.startAngle + area.endAngle) / 2).times(scale).minus(center);
          if (model.periodDivisionProperty.value === 2) {
            numberDisplayPosition = new Vector2(0, radiusY * Math.pow(-1, i));
          }
          numberDisplayScaling = numberDisplayPositionScaling(numberDisplayPosition.magnitude);
          areaValueNumberDisplays[i].center = numberDisplayPosition.times(numberDisplayScaling);
          areaValueNumberDisplays[i].rotation = this.orbit.w;

          // Calculates the total area of the ellipse / the number of divisions
          const fullSegmentArea = this.orbit.segmentArea * SolarSystemCommonConstants.POSITION_MULTIPLIER * SolarSystemCommonConstants.POSITION_MULTIPLIER;
          areaValueProperties[i].value = area.alreadyEntered ? area.insideProperty.value ? fullSegmentArea * area.completion : fullSegmentArea : 0;

          // Activate area path
          // Opacity lowered down to 0.8 for stylistic purposes
          areaPaths[i].opacity = area.alreadyEntered ? area.insideProperty.value ? 1 : 0.7 * area.completion + 0.1 : 0;
          areaPaths[i].shape = new Shape().moveTo(radiusC, 0).ellipticalArc(0, 0, radiusX, radiusY, 0, startAngle, endAngle, false).close();
        }
      });

      // THIRD LAW -------------------------------------------
      // Semi-major axis
      semiMajorAxisPath.shape = new Shape().moveTo(0, 0).lineTo(-radiusX, 0);
      bodyPosition.subtract(center);
      const endAngle = Math.atan2(bodyPosition.y / radiusY, bodyPosition.x / radiusX);
      // applyTransformation( trackPath );
      const trackShape = new Shape().ellipticalArc(0, 0, radiusX, radiusY, 0, 0, endAngle, this.orbit.retrograde);
      trackPath.shape = trackShape;
    };
    this.orbit.changedEmitter.addListener(updatedOrbit);
    this.shapeMultilink = Multilink.multilink([modelViewTransformProperty, model.periodDivisionProperty, model.selectedLawProperty], () => updatedOrbit());
  }
}
keplersLaws.register('EllipticalOrbitNode', EllipticalOrbitNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkNpcmNsZSIsIk5vZGUiLCJQYXRoIiwiUmljaFRleHQiLCJUZXh0IiwiTXVsdGlsaW5rIiwiVmVjdG9yMiIsIlhOb2RlIiwiRGVyaXZlZFByb3BlcnR5IiwiU29sYXJTeXN0ZW1Db21tb25Db2xvcnMiLCJTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cyIsImNvbWJpbmVPcHRpb25zIiwiS2VwbGVyc0xhd3NTdHJpbmdzIiwia2VwbGVyc0xhd3MiLCJOdW1iZXJEaXNwbGF5IiwiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIlV0aWxzIiwiS2VwbGVyc0xhd3NDb25zdGFudHMiLCJFbGxpcHRpY2FsT3JiaXROb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5IiwibGluZVdpZHRoIiwic3Ryb2tlIiwib3JiaXRDb2xvclByb3BlcnR5Iiwib3JiaXQiLCJlbmdpbmUiLCJ0b3BMYXllciIsInZpc2libGVQcm9wZXJ0eSIsImFsbG93ZWRPcmJpdFByb3BlcnR5IiwibGFiZWxzTGF5ZXIiLCJmaXJzdExhd0xheWVyIiwic2Vjb25kTGF3TGF5ZXIiLCJ0aGlyZExhd0xheWVyIiwiYWRkQ2hpbGQiLCJhTGFiZWxOb2RlIiwic3ltYm9scyIsInNlbWlNYWpvckF4aXNTdHJpbmdQcm9wZXJ0eSIsIm9yIiwic2VtaWF4aXNWaXNpYmxlUHJvcGVydHkiLCJzZW1pTWFqb3JBeGlzVmlzaWJsZVByb3BlcnR5IiwiZWNjZW50cmljaXR5VmlzaWJsZVByb3BlcnR5IiwiVEVYVF9PUFRJT05TIiwic2NhbGUiLCJmaWxsIiwiYkxhYmVsTm9kZSIsInNlbWlNaW5vckF4aXNTdHJpbmdQcm9wZXJ0eSIsImNMYWJlbE5vZGUiLCJmb2NhbERpc3RhbmNlU3RyaW5nUHJvcGVydHkiLCJlY2NlbnRyaWNpdHlQcm9wZXJ0eSIsInZpc2libGUiLCJlIiwidGhpcmRCb2R5Q29sb3JQcm9wZXJ0eSIsInN0cmluZ0xhYmVsTm9kZTEiLCJzdHJpbmdzVmlzaWJsZVByb3BlcnR5Iiwic3RyaW5nTGFiZWxOb2RlMiIsInJhZGl1c0xhYmVsTm9kZSIsImF4aXNQYXRoIiwiZm9yZWdyb3VuZFByb3BlcnR5IiwiYXhpc1Zpc2libGVQcm9wZXJ0eSIsInNlbWlBeGlzUGF0aCIsImZvY2FsRGlzdGFuY2VQYXRoIiwic3RyaW5nc1BhdGgiLCJsaW5lRGFzaCIsImZvY2lPcHRpb25zIiwiYmFja2dyb3VuZFByb3BlcnR5IiwiY2VudGVyIiwiWkVSTyIsImZvY2lWaXNpYmxlUHJvcGVydHkiLCJmb2NpIiwicGVyaWFwc2lzIiwicGVyaWFwc2lzVmlzaWJsZVByb3BlcnR5IiwiYXBvYXBzaXMiLCJhcG9hcHNpc1Zpc2libGVQcm9wZXJ0eSIsIm9yYml0RGl2aXNpb25zIiwiYXJlYVBhdGhzIiwiYXJlYVZhbHVlUHJvcGVydGllcyIsImFyZWFWYWx1ZU51bWJlckRpc3BsYXlzIiwiYXJlYVZhbHVlUmFuZ2UiLCJpIiwiTUFYX09SQklUQUxfRElWSVNJT05TIiwicHVzaCIsImFyZWFWYWx1ZVByb3BlcnR5Iiwib3BhY2l0eSIsIm51bWJlckZvcm1hdHRlciIsInZhbHVlIiwidG9GaXhlZCIsIm9yYml0RGl2aXNpb25zTm9kZSIsImFyZWFQYXRoc05vZGUiLCJpc1NlY29uZExhd1Byb3BlcnR5IiwiYXJlYVZhbHVlc05vZGUiLCJhbmQiLCJhcmVhVmFsdWVzVmlzaWJsZVByb3BlcnR5IiwiZm9yRWFjaCIsIm5vZGUiLCJzZW1pTWFqb3JBeGlzUGF0aCIsInRyYWNrUGF0aCIsInBlcmlvZFZpc2libGVQcm9wZXJ0eSIsInVwZGF0ZWRPcmJpdCIsIm1vZGVsVG9WaWV3RGVsdGFYIiwiYSIsImIiLCJjIiwidGltZXMiLCJyYWRpdXNYIiwicmFkaXVzWSIsInJhZGl1c0MiLCJhcHBseVRyYW5zZm9ybWF0aW9uIiwicG9pbnQiLCJ0cmFuc2xhdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJyb3RhdGlvbiIsInJvdGF0ZUFyb3VuZCIsImFkZCIsInciLCJzaGFwZSIsImVsbGlwc2UiLCJudW1iZXJEaXNwbGF5UG9zaXRpb25TY2FsaW5nIiwidmVjdG9yTWFnbml0dWRlIiwibWluU2NhbGluZyIsIm1heFNjYWxpbmciLCJNYXRoIiwicG93IiwiY2xhbXAiLCJsaW5lYXIiLCJheGlzIiwibW92ZVRvIiwibGluZVRvIiwic2VtaUF4aXMiLCJib2R5UG9zaXRpb24iLCJjcmVhdGVQb2xhciIsIm51Iiwic3RyaW5nc1NoYXBlIiwieCIsInkiLCJsYWJlbHNZUG9zaXRpb24iLCJvZmZzZXRWZWN0b3IiLCJyb3RhdGVkIiwiYW5nbGUiLCJQSSIsIm9yYml0YWxBcmVhcyIsImFyZWEiLCJhY3RpdmUiLCJudW1iZXJEaXNwbGF5UG9zaXRpb24iLCJudW1iZXJEaXNwbGF5U2NhbGluZyIsInBlcmlvZERpdmlzaW9uUHJvcGVydHkiLCJkb3RQb3NpdGlvbiIsIm1pbnVzIiwiZGFya2VyQ29sb3IiLCJjb21wbGV0aW9uIiwic3RhcnQiLCJzdGFydFBvc2l0aW9uIiwiZW5kIiwiZW5kUG9zaXRpb24iLCJzdGFydEFuZ2xlIiwiYXRhbjIiLCJlbmRBbmdsZSIsIm1hZ25pdHVkZSIsImZ1bGxTZWdtZW50QXJlYSIsInNlZ21lbnRBcmVhIiwiUE9TSVRJT05fTVVMVElQTElFUiIsImFscmVhZHlFbnRlcmVkIiwiaW5zaWRlUHJvcGVydHkiLCJlbGxpcHRpY2FsQXJjIiwiY2xvc2UiLCJzdWJ0cmFjdCIsInRyYWNrU2hhcGUiLCJyZXRyb2dyYWRlIiwiY2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInNoYXBlTXVsdGlsaW5rIiwibXVsdGlsaW5rIiwic2VsZWN0ZWRMYXdQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRWxsaXB0aWNhbE9yYml0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8qKlxyXG4gKiBWaXN1YWwgTm9kZSBmb3IgdGhlIEVsbGlwdGljYWwgT3JiaXQgYmFzZWQgb24gdGhlIE9yYml0YWwgUGFyYW1ldGVyc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam9cclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBFbGxpcHRpY2FsT3JiaXRFbmdpbmUgZnJvbSAnLi4vbW9kZWwvRWxsaXB0aWNhbE9yYml0RW5naW5lLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBOb2RlLCBQYXRoLCBSaWNoVGV4dCwgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmssIHsgVW5rbm93bk11bHRpbGluayB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgS2VwbGVyc0xhd3NNb2RlbCBmcm9tICcuLi9tb2RlbC9LZXBsZXJzTGF3c01vZGVsLmpzJztcclxuaW1wb3J0IFhOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9YTm9kZS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL1NvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgS2VwbGVyc0xhd3NTdHJpbmdzIGZyb20gJy4uLy4uLy4uLy4uL2tlcGxlcnMtbGF3cy9qcy9LZXBsZXJzTGF3c1N0cmluZ3MuanMnO1xyXG5pbXBvcnQga2VwbGVyc0xhd3MgZnJvbSAnLi4vLi4va2VwbGVyc0xhd3MuanMnO1xyXG5pbXBvcnQgTnVtYmVyRGlzcGxheSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTnVtYmVyRGlzcGxheS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgS2VwbGVyc0xhd3NDb25zdGFudHMgZnJvbSAnLi4vLi4vS2VwbGVyc0xhd3NDb25zdGFudHMuanMnO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVsbGlwdGljYWxPcmJpdE5vZGUgZXh0ZW5kcyBQYXRoIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IG9yYml0OiBFbGxpcHRpY2FsT3JiaXRFbmdpbmU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzaGFwZU11bHRpbGluazogVW5rbm93bk11bHRpbGluaztcclxuICBwdWJsaWMgcmVhZG9ubHkgdG9wTGF5ZXI6IE5vZGU7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgIG1vZGVsOiBLZXBsZXJzTGF3c01vZGVsLFxyXG4gICAgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+XHJcbiAgKSB7XHJcblxyXG4gICAgLy8gUGFzc2luZyBpbiBhIG51bGwgc2hhcGUsIHNpbmNlIGl0IHdpbGwgYmUgdXBkYXRlZCBsYXRlclxyXG4gICAgc3VwZXIoIG51bGwsIHtcclxuICAgICAgbGluZVdpZHRoOiAzLFxyXG4gICAgICBzdHJva2U6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLm9yYml0Q29sb3JQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMub3JiaXQgPSBtb2RlbC5lbmdpbmU7XHJcblxyXG4gICAgLy8gVG9wIGxheWVyIGlzIGEgZmllbGQgYmVjYXVzZSBpdCBoYXMgdG8gYmUgYWNjZXNzZWQgZnJvbSB0aGUgU2NyZWVuVmlldyBhbmQgYWRkZWQgYXMgYSBjaGlsZCB0aGVyZVxyXG4gICAgdGhpcy50b3BMYXllciA9IG5ldyBOb2RlKCB7IHZpc2libGVQcm9wZXJ0eTogdGhpcy5vcmJpdC5hbGxvd2VkT3JiaXRQcm9wZXJ0eSB9ICk7XHJcbiAgICBjb25zdCBsYWJlbHNMYXllciA9IG5ldyBOb2RlKCB7IHZpc2libGVQcm9wZXJ0eTogdGhpcy5vcmJpdC5hbGxvd2VkT3JiaXRQcm9wZXJ0eSB9ICk7XHJcbiAgICBjb25zdCBmaXJzdExhd0xheWVyID0gbmV3IE5vZGUoIHsgdmlzaWJsZVByb3BlcnR5OiB0aGlzLm9yYml0LmFsbG93ZWRPcmJpdFByb3BlcnR5IH0gKTtcclxuICAgIGNvbnN0IHNlY29uZExhd0xheWVyID0gbmV3IE5vZGUoIHsgdmlzaWJsZVByb3BlcnR5OiB0aGlzLm9yYml0LmFsbG93ZWRPcmJpdFByb3BlcnR5IH0gKTtcclxuICAgIGNvbnN0IHRoaXJkTGF3TGF5ZXIgPSBuZXcgTm9kZSggeyB2aXNpYmxlUHJvcGVydHk6IHRoaXMub3JiaXQuYWxsb3dlZE9yYml0UHJvcGVydHkgfSApO1xyXG5cclxuICAgIC8vIEFsc28gVG9wIExheWVyIGlzIG5vdCBhZGRlZCBhcyBjaGlsZCBiZWNhdXNlIGl0J3MgYSBjaGlsZCBvZiB0aGUgU2NyZWVuVmlldywganVzdCBjb250cm9sbGVkIGluIGhlcmVcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxhYmVsc0xheWVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmaXJzdExhd0xheWVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzZWNvbmRMYXdMYXllciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcmRMYXdMYXllciApO1xyXG5cclxuICAgIC8vIFRleHQgTm9kZXNcclxuICAgIGNvbnN0IGFMYWJlbE5vZGUgPSBuZXcgVGV4dCggS2VwbGVyc0xhd3NTdHJpbmdzLnN5bWJvbHMuc2VtaU1ham9yQXhpc1N0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBEZXJpdmVkUHJvcGVydHkub3IoXHJcbiAgICAgICAgWyBtb2RlbC5zZW1pYXhpc1Zpc2libGVQcm9wZXJ0eSwgbW9kZWwuc2VtaU1ham9yQXhpc1Zpc2libGVQcm9wZXJ0eSwgbW9kZWwuZWNjZW50cmljaXR5VmlzaWJsZVByb3BlcnR5IF1cclxuICAgICAgKVxyXG4gICAgfSwgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuVEVYVF9PUFRJT05TLCB7XHJcbiAgICAgIHNjYWxlOiAxLjUsXHJcbiAgICAgIHN0cm9rZTogJ29yYW5nZScsXHJcbiAgICAgIGZpbGw6ICdvcmFuZ2UnXHJcbiAgICB9ICkgKTtcclxuICAgIGNvbnN0IGJMYWJlbE5vZGUgPSBuZXcgVGV4dCggS2VwbGVyc0xhd3NTdHJpbmdzLnN5bWJvbHMuc2VtaU1pbm9yQXhpc1N0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oXHJcbiAgICAgIHtcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IG1vZGVsLnNlbWlheGlzVmlzaWJsZVByb3BlcnR5XHJcbiAgICAgIH0sIFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLlRFWFRfT1BUSU9OUywge1xyXG4gICAgICAgIHNjYWxlOiAxLjUsXHJcbiAgICAgICAgc3Ryb2tlOiAnb3JhbmdlJyxcclxuICAgICAgICBmaWxsOiAnb3JhbmdlJ1xyXG4gICAgICB9ICkgKTtcclxuICAgIGNvbnN0IGNMYWJlbE5vZGUgPSBuZXcgVGV4dCggS2VwbGVyc0xhd3NTdHJpbmdzLnN5bWJvbHMuZm9jYWxEaXN0YW5jZVN0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oXHJcbiAgICAgIHtcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgICAgICBbXHJcbiAgICAgICAgICAgIG1vZGVsLmVjY2VudHJpY2l0eVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICAgICAgbW9kZWwuZW5naW5lLmVjY2VudHJpY2l0eVByb3BlcnR5XHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgKCB2aXNpYmxlLCBlICkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlzaWJsZSAmJiAoIGUgPiAwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgICB9LCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5URVhUX09QVElPTlMsIHtcclxuICAgICAgICBzY2FsZTogMS41LFxyXG4gICAgICAgIHN0cm9rZTogU29sYXJTeXN0ZW1Db21tb25Db2xvcnMudGhpcmRCb2R5Q29sb3JQcm9wZXJ0eSxcclxuICAgICAgICBmaWxsOiBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycy50aGlyZEJvZHlDb2xvclByb3BlcnR5XHJcbiAgICAgIH0gKSApO1xyXG4gICAgY29uc3Qgc3RyaW5nTGFiZWxOb2RlMSA9IG5ldyBSaWNoVGV4dCggJ2Q8c3ViPjEnLCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oXHJcbiAgICAgIHtcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgICAgICBbXHJcbiAgICAgICAgICAgIG1vZGVsLnN0cmluZ3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgICAgIG1vZGVsLmVuZ2luZS5lY2NlbnRyaWNpdHlQcm9wZXJ0eVxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICggdmlzaWJsZSwgZSApID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpc2libGUgJiYgKCBlID4gMCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgICAgfSwgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuVEVYVF9PUFRJT05TLCB7XHJcbiAgICAgICAgc2NhbGU6IDEuNSxcclxuICAgICAgICBzdHJva2U6ICcjY2NiMjg1JyxcclxuICAgICAgICBmaWxsOiAnI2NjYjI4NSdcclxuICAgICAgfSApICk7XHJcbiAgICBjb25zdCBzdHJpbmdMYWJlbE5vZGUyID0gbmV3IFJpY2hUZXh0KCAnZDxzdWI+MicsIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPihcclxuICAgICAge1xyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgICAgIFtcclxuICAgICAgICAgICAgbW9kZWwuc3RyaW5nc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICAgICAgbW9kZWwuZW5naW5lLmVjY2VudHJpY2l0eVByb3BlcnR5XHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgICAgKCB2aXNpYmxlLCBlICkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlzaWJsZSAmJiAoIGUgPiAwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgICB9LCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5URVhUX09QVElPTlMsIHtcclxuICAgICAgICBzY2FsZTogMS41LFxyXG4gICAgICAgIHN0cm9rZTogJyNjY2IyODUnLFxyXG4gICAgICAgIGZpbGw6ICcjY2NiMjg1J1xyXG4gICAgICB9ICkgKTtcclxuICAgIGNvbnN0IHJhZGl1c0xhYmVsTm9kZSA9IG5ldyBSaWNoVGV4dCggJ3InLCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIG1vZGVsLnN0cmluZ3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgICBtb2RlbC5lbmdpbmUuZWNjZW50cmljaXR5UHJvcGVydHlcclxuICAgICAgICBdLFxyXG4gICAgICAgICggdmlzaWJsZSwgZSApID0+IHtcclxuICAgICAgICAgIHJldHVybiB2aXNpYmxlICYmICggZSA9PT0gMCApO1xyXG4gICAgICAgIH1cclxuICAgICAgKVxyXG4gICAgfSwgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuVEVYVF9PUFRJT05TLCB7XHJcbiAgICAgIHNjYWxlOiAxLjUsXHJcbiAgICAgIHN0cm9rZTogJyNjY2IyODUnLFxyXG4gICAgICBmaWxsOiAnI2NjYjI4NSdcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEZJUlNUIExBVzogQXhpcywgZm9jaSwgYW5kIEVsbGlwc2UgZGVmaW5pdGlvbiBsaW5lc1xyXG4gICAgY29uc3QgYXhpc1BhdGggPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBzdHJva2U6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eSxcclxuICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IERlcml2ZWRQcm9wZXJ0eS5vcihcclxuICAgICAgICBbIG1vZGVsLmF4aXNWaXNpYmxlUHJvcGVydHksIG1vZGVsLnNlbWlNYWpvckF4aXNWaXNpYmxlUHJvcGVydHkgXVxyXG4gICAgICApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzZW1pQXhpc1BhdGggPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBzdHJva2U6ICdvcmFuZ2UnLFxyXG4gICAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwuc2VtaWF4aXNWaXNpYmxlUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGZvY2FsRGlzdGFuY2VQYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcclxuICAgICAgc3Ryb2tlOiBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycy50aGlyZEJvZHlDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwuZWNjZW50cmljaXR5VmlzaWJsZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzdHJpbmdzUGF0aCA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIHN0cm9rZTogJyNjY2IyODUnLFxyXG4gICAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwuc3RyaW5nc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgbGluZURhc2g6IFsgMTAsIDIgXVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgZm9jaU9wdGlvbnMgPSB7XHJcbiAgICAgIGZpbGw6ICcjMjlBQkUyJyxcclxuICAgICAgc3Ryb2tlOiBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycy5iYWNrZ3JvdW5kUHJvcGVydHksXHJcbiAgICAgIHNjYWxlOiAwLjgsXHJcbiAgICAgIGNlbnRlcjogVmVjdG9yMi5aRVJPLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IG1vZGVsLmZvY2lWaXNpYmxlUHJvcGVydHlcclxuICAgIH07XHJcbiAgICBjb25zdCBmb2NpID0gW1xyXG4gICAgICBuZXcgWE5vZGUoIGZvY2lPcHRpb25zICksXHJcbiAgICAgIG5ldyBYTm9kZSggZm9jaU9wdGlvbnMgKVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBTRUNPTkQgTEFXOiBQZXJpYXBzaXMgYW5kIEFwb2Fwc2lzXHJcbiAgICBjb25zdCBwZXJpYXBzaXMgPSBuZXcgWE5vZGUoIHtcclxuICAgICAgZmlsbDogJ2dvbGQnLFxyXG4gICAgICBzdHJva2U6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eSxcclxuICAgICAgY2VudGVyOiBWZWN0b3IyLlpFUk8sXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgICBbIG1vZGVsLnBlcmlhcHNpc1Zpc2libGVQcm9wZXJ0eSwgdGhpcy5vcmJpdC5lY2NlbnRyaWNpdHlQcm9wZXJ0eSBdLFxyXG4gICAgICAgICggdmlzaWJsZSwgZSApID0+IHtcclxuICAgICAgICAgIHJldHVybiB2aXNpYmxlICYmICggZSA+IDAgKTtcclxuICAgICAgICB9IClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGFwb2Fwc2lzID0gbmV3IFhOb2RlKCB7XHJcbiAgICAgIGZpbGw6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLnRoaXJkQm9keUNvbG9yUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogU29sYXJTeXN0ZW1Db21tb25Db2xvcnMuZm9yZWdyb3VuZFByb3BlcnR5LFxyXG4gICAgICBjZW50ZXI6IFZlY3RvcjIuWkVSTyxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICAgIFsgbW9kZWwuYXBvYXBzaXNWaXNpYmxlUHJvcGVydHksIHRoaXMub3JiaXQuZWNjZW50cmljaXR5UHJvcGVydHkgXSxcclxuICAgICAgICAoIHZpc2libGUsIGUgKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gdmlzaWJsZSAmJiAoIGUgPiAwICk7XHJcbiAgICAgICAgfSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQXJyYXlzIG9mIG9yYml0YWwgZGl2aXNpb25zJyBkb3RzIGFuZCBhcmVhc1xyXG4gICAgY29uc3Qgb3JiaXREaXZpc2lvbnM6IENpcmNsZVtdID0gW107XHJcbiAgICBjb25zdCBhcmVhUGF0aHM6IFBhdGhbXSA9IFtdO1xyXG4gICAgY29uc3QgYXJlYVZhbHVlUHJvcGVydGllczogTnVtYmVyUHJvcGVydHlbXSA9IFtdO1xyXG4gICAgY29uc3QgYXJlYVZhbHVlTnVtYmVyRGlzcGxheXM6IE5vZGVbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0IGFyZWFWYWx1ZVJhbmdlID0gbmV3IFJhbmdlKCAwLCAxICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgS2VwbGVyc0xhd3NDb25zdGFudHMuTUFYX09SQklUQUxfRElWSVNJT05TOyBpKysgKSB7XHJcbiAgICAgIG9yYml0RGl2aXNpb25zLnB1c2goIG5ldyBDaXJjbGUoIDQsIHtcclxuICAgICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICAgIHN0cm9rZTogU29sYXJTeXN0ZW1Db21tb25Db2xvcnMub3JiaXRDb2xvclByb3BlcnR5LFxyXG4gICAgICAgIGxpbmVXaWR0aDogMyxcclxuICAgICAgICBjZW50ZXI6IFZlY3RvcjIuWkVSTyxcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICB9ICkgKTtcclxuICAgICAgYXJlYVBhdGhzLnB1c2goIG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgICAgZmlsbDogU29sYXJTeXN0ZW1Db21tb25Db2xvcnMub3JiaXRDb2xvclByb3BlcnR5XHJcbiAgICAgIH0gKSApO1xyXG4gICAgICBjb25zdCBhcmVhVmFsdWVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG4gICAgICBhcmVhVmFsdWVQcm9wZXJ0aWVzLnB1c2goIGFyZWFWYWx1ZVByb3BlcnR5ICk7XHJcbiAgICAgIGFyZWFWYWx1ZU51bWJlckRpc3BsYXlzLnB1c2goIG5ldyBOdW1iZXJEaXNwbGF5KCBhcmVhVmFsdWVQcm9wZXJ0eSwgYXJlYVZhbHVlUmFuZ2UsIHtcclxuICAgICAgICBzY2FsZTogMC43LFxyXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcclxuICAgICAgICBudW1iZXJGb3JtYXR0ZXI6ICggdmFsdWU6IG51bWJlciApID0+IHtcclxuICAgICAgICAgIHJldHVybiBVdGlscy50b0ZpeGVkKCB2YWx1ZSwgMiApICsgJ0FVwrInO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTm9kZXMgZm9yIHRoZSBvcmJpdGFsIGRpdmlzaW9ucycgZG90cyBhbmQgYXJlYXNcclxuICAgIC8vIFRoZXJlIGFyZSBOb2RlcyBhbmQgYXJyYXlzIHNlcGFyYXRlbHkgdG8gYWNjZXNzIHRoZW0gYnkgaW5kZXhcclxuICAgIGNvbnN0IG9yYml0RGl2aXNpb25zTm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICBjb25zdCBhcmVhUGF0aHNOb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBtb2RlbC5pc1NlY29uZExhd1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBhcmVhVmFsdWVzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogRGVyaXZlZFByb3BlcnR5LmFuZCggWyBtb2RlbC5pc1NlY29uZExhd1Byb3BlcnR5LCBtb2RlbC5hcmVhVmFsdWVzVmlzaWJsZVByb3BlcnR5IF0gKVxyXG4gICAgfSApO1xyXG4gICAgb3JiaXREaXZpc2lvbnMuZm9yRWFjaCggbm9kZSA9PiB7IG9yYml0RGl2aXNpb25zTm9kZS5hZGRDaGlsZCggbm9kZSApOyB9ICk7XHJcbiAgICBhcmVhUGF0aHMuZm9yRWFjaCggbm9kZSA9PiB7IGFyZWFQYXRoc05vZGUuYWRkQ2hpbGQoIG5vZGUgKTsgfSApO1xyXG4gICAgYXJlYVZhbHVlTnVtYmVyRGlzcGxheXMuZm9yRWFjaCggbm9kZSA9PiB7IGFyZWFWYWx1ZXNOb2RlLmFkZENoaWxkKCBub2RlICk7IH0gKTtcclxuXHJcbiAgICAvLyBUSElSRCBMQVc6IFNlbWlNYWpvciBheGlzXHJcbiAgICBjb25zdCBzZW1pTWFqb3JBeGlzUGF0aCA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIHN0cm9rZTogJ29yYW5nZScsXHJcbiAgICAgIGxpbmVXaWR0aDogMyxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBEZXJpdmVkUHJvcGVydHkub3IoXHJcbiAgICAgICAgWyBtb2RlbC5zZW1pYXhpc1Zpc2libGVQcm9wZXJ0eSwgbW9kZWwuc2VtaU1ham9yQXhpc1Zpc2libGVQcm9wZXJ0eSwgbW9kZWwuZWNjZW50cmljaXR5VmlzaWJsZVByb3BlcnR5IF1cclxuICAgICAgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgdHJhY2tQYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcclxuICAgICAgc3Ryb2tlOiBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycy50aGlyZEJvZHlDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lV2lkdGg6IDUsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwucGVyaW9kVmlzaWJsZVByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGV4dCBOb2Rlc1xyXG4gICAgbGFiZWxzTGF5ZXIuYWRkQ2hpbGQoIGFMYWJlbE5vZGUgKTtcclxuICAgIGxhYmVsc0xheWVyLmFkZENoaWxkKCBiTGFiZWxOb2RlICk7XHJcbiAgICBsYWJlbHNMYXllci5hZGRDaGlsZCggY0xhYmVsTm9kZSApO1xyXG4gICAgbGFiZWxzTGF5ZXIuYWRkQ2hpbGQoIHN0cmluZ0xhYmVsTm9kZTEgKTtcclxuICAgIGxhYmVsc0xheWVyLmFkZENoaWxkKCBzdHJpbmdMYWJlbE5vZGUyICk7XHJcbiAgICBsYWJlbHNMYXllci5hZGRDaGlsZCggcmFkaXVzTGFiZWxOb2RlICk7XHJcblxyXG5cclxuICAgIC8vIEZpcnN0IExhdzogQXhpcywgZm9jaSwgYW5kIEVsbGlwc2UgZGVmaW5pdGlvbiBsaW5lc1xyXG4gICAgZmlyc3RMYXdMYXllci5hZGRDaGlsZCggYXhpc1BhdGggKTtcclxuICAgIGZpcnN0TGF3TGF5ZXIuYWRkQ2hpbGQoIHNlbWlBeGlzUGF0aCApO1xyXG4gICAgZmlyc3RMYXdMYXllci5hZGRDaGlsZCggc3RyaW5nc1BhdGggKTtcclxuICAgIGZpcnN0TGF3TGF5ZXIuYWRkQ2hpbGQoIGZvY2FsRGlzdGFuY2VQYXRoICk7XHJcblxyXG4gICAgLy8gU2Vjb25kIExhdzogUGVyaWFwc2lzLCBBcG9hcHNpcyBhbmQgb3JiaXRhbCBkaXZpc2lvbiBkb3RzIGFuZCBhcmVhc1xyXG4gICAgc2Vjb25kTGF3TGF5ZXIuYWRkQ2hpbGQoIGFyZWFQYXRoc05vZGUgKTtcclxuICAgIHNlY29uZExhd0xheWVyLmFkZENoaWxkKCBwZXJpYXBzaXMgKTtcclxuICAgIHNlY29uZExhd0xheWVyLmFkZENoaWxkKCBhcG9hcHNpcyApO1xyXG4gICAgc2Vjb25kTGF3TGF5ZXIuYWRkQ2hpbGQoIG9yYml0RGl2aXNpb25zTm9kZSApO1xyXG4gICAgc2Vjb25kTGF3TGF5ZXIuYWRkQ2hpbGQoIGFyZWFWYWx1ZXNOb2RlICk7XHJcblxyXG4gICAgLy8gVGhpcmQgTGF3OiBTZW1pTWFqb3IgYXhpcywgYW5kIHRyYWNrXHJcbiAgICB0aGlyZExhd0xheWVyLmFkZENoaWxkKCBzZW1pTWFqb3JBeGlzUGF0aCApO1xyXG4gICAgdGhpcmRMYXdMYXllci5hZGRDaGlsZCggdHJhY2tQYXRoICk7XHJcblxyXG4gICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggZm9jaVsgMCBdICk7XHJcbiAgICB0aGlzLnRvcExheWVyLmFkZENoaWxkKCBmb2NpWyAxIF0gKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVkT3JiaXQgPSAoKSA9PiB7XHJcbiAgICAgIC8vIE5vbiBhbGxvd2VkIG9yYml0cyB3aWxsIHNob3cgdXAgYXMgZGFzaGVkIGxpbmVzXHJcbiAgICAgIHRoaXMubGluZURhc2ggPSB0aGlzLm9yYml0LmFsbG93ZWRPcmJpdFByb3BlcnR5LnZhbHVlID8gWyAwIF0gOiBbIDUgXTtcclxuXHJcbiAgICAgIGNvbnN0IHNjYWxlID0gbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdEZWx0YVgoIDEgKTtcclxuXHJcbiAgICAgIC8vIEVsbGlwc2UgZGlzdGFuY2VzIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICAgIGNvbnN0IGEgPSB0aGlzLm9yYml0LmE7XHJcbiAgICAgIGNvbnN0IGIgPSB0aGlzLm9yYml0LmI7XHJcbiAgICAgIGNvbnN0IGMgPSB0aGlzLm9yYml0LmM7XHJcbiAgICAgIGNvbnN0IGUgPSB0aGlzLm9yYml0LmU7XHJcbiAgICAgIGNvbnN0IGNlbnRlciA9IG5ldyBWZWN0b3IyKCAtYywgMCApLnRpbWVzKCBzY2FsZSApO1xyXG5cclxuICAgICAgY29uc3QgcmFkaXVzWCA9IHNjYWxlICogYTtcclxuICAgICAgY29uc3QgcmFkaXVzWSA9IHNjYWxlICogYjtcclxuICAgICAgY29uc3QgcmFkaXVzQyA9IHNjYWxlICogYzsgLy8gRm9jYWwgcG9pbnRcclxuXHJcbiAgICAgIGNvbnN0IGFwcGx5VHJhbnNmb3JtYXRpb24gPSAoIHBvaW50OiBOb2RlICkgPT4ge1xyXG4gICAgICAgIHBvaW50LnRyYW5zbGF0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUubW9kZWxUb1ZpZXdQb3NpdGlvbiggY2VudGVyLnRpbWVzKCAxIC8gc2NhbGUgKSApO1xyXG4gICAgICAgIHBvaW50LnJvdGF0aW9uID0gMDtcclxuICAgICAgICBwb2ludC5yb3RhdGVBcm91bmQoIHBvaW50LnRyYW5zbGF0aW9uLmFkZCggY2VudGVyLnRpbWVzKCAtMSApICksIC10aGlzLm9yYml0LncgKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIFRoZSBlbGxpcHNlIGlzIHRyYW5zbGF0ZWQgYW5kIHJvdGF0ZWQgc28gaXRzIGNoaWxkcmVuIGNhbiB1c2UgbG9jYWwgY29vcmRpbmF0ZXNcclxuICAgICAgYXBwbHlUcmFuc2Zvcm1hdGlvbiggdGhpcyApO1xyXG4gICAgICB0aGlzLnNoYXBlID0gbmV3IFNoYXBlKCkuZWxsaXBzZSggMCwgMCwgcmFkaXVzWCwgcmFkaXVzWSwgMCApO1xyXG5cclxuICAgICAgLy8gU2FtZSB0cmFuc2Zvcm1hdGlvbnMgc2V0IHRvIFRvcExheWVyIGJlY2F1c2UgaXQncyBub3QgZGlyZWN0bHkgYSBjaGlsZCBvZiB0aGlzXHJcbiAgICAgIGFwcGx5VHJhbnNmb3JtYXRpb24oIHRoaXMudG9wTGF5ZXIgKTtcclxuXHJcbiAgICAgIC8vIFRoZSBOdW1iZXIgRGlzcGxheSBmb3IgYXJlYXMgaXMgc2NhbGVkIGFjY29yZGluZyB0byB0aGUgb3JiaXQgc2l6ZVxyXG4gICAgICBjb25zdCBudW1iZXJEaXNwbGF5UG9zaXRpb25TY2FsaW5nID0gKCB2ZWN0b3JNYWduaXR1ZGU6IG51bWJlciApID0+IHtcclxuICAgICAgICAvLyBTY2FsaW5nIHRoZSB2ZWN0b3Igc3VtIG9mIHRoZSBkb3QgcG9zaXRpb25zXHJcbiAgICAgICAgY29uc3QgbWluU2NhbGluZyA9IDEuMjtcclxuICAgICAgICBjb25zdCBtYXhTY2FsaW5nID0gMi4wO1xyXG5cclxuICAgICAgICAvLyBIZXJlLCBhMSBhbmQgYTIgYXJlIHRoZSBzZW1pLW1ham9yIGFuZCBzZW1pLW1pbm9yIGF4ZXMgb2YgdGhlIGVsbGlwc2VcclxuICAgICAgICByZXR1cm4gTWF0aC5wb3coIFV0aWxzLmNsYW1wKFxyXG4gICAgICAgICAgVXRpbHMubGluZWFyKCA1MCwgMjAwLCBtYXhTY2FsaW5nLCBtaW5TY2FsaW5nLCB2ZWN0b3JNYWduaXR1ZGUgKSxcclxuICAgICAgICAgIG1pblNjYWxpbmcsIG1heFNjYWxpbmcgKSwgKCAxIC0gbW9kZWwuZW5naW5lLmUgKiBtb2RlbC5lbmdpbmUuZSApICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBGSVJTVCBMQVcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyBBeGlzIG9mIHRoZSBlbGxpcHNlXHJcbiAgICAgIGNvbnN0IGF4aXMgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIC1yYWRpdXNYLCAwICkubGluZVRvKCByYWRpdXNYLCAwICk7XHJcbiAgICAgIGF4aXMubW92ZVRvKCAwLCAtcmFkaXVzWSApLmxpbmVUbyggMCwgcmFkaXVzWSApO1xyXG4gICAgICBheGlzUGF0aC5zaGFwZSA9IGF4aXM7XHJcblxyXG4gICAgICAvLyBTZW1pLWF4aXMgb2YgdGhlIGVsbGlwc2VcclxuICAgICAgY29uc3Qgc2VtaUF4aXMgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIDAgKS5saW5lVG8oIC1yYWRpdXNYLCAwICk7XHJcbiAgICAgIC8vIGNvbnN0IHNlbWlBeGlzID0gbmV3IEFycm93U2hhcGUoIDAsIDAsIC1yYWRpdXNYLCAwLCB7fSApO1xyXG4gICAgICBzZW1pQXhpcy5tb3ZlVG8oIDAsIDAgKS5saW5lVG8oIDAsIHJhZGl1c1kgKTtcclxuICAgICAgc2VtaUF4aXNQYXRoLnNoYXBlID0gc2VtaUF4aXM7XHJcbiAgICAgIGFMYWJlbE5vZGUuY2VudGVyID0gbmV3IFZlY3RvcjIoIC1yYWRpdXNYIC8gMiwgMTAgKTtcclxuICAgICAgYUxhYmVsTm9kZS5yb3RhdGlvbiA9IHRoaXMub3JiaXQudztcclxuICAgICAgYkxhYmVsTm9kZS5jZW50ZXIgPSBuZXcgVmVjdG9yMiggLTE1LCByYWRpdXNZIC8gMiApO1xyXG4gICAgICBiTGFiZWxOb2RlLnJvdGF0aW9uID0gdGhpcy5vcmJpdC53O1xyXG5cclxuICAgICAgZm9jYWxEaXN0YW5jZVBhdGguc2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIDAgKS5saW5lVG8oIGUgKiByYWRpdXNYLCAwICk7XHJcbiAgICAgIGNMYWJlbE5vZGUuY2VudGVyID0gbmV3IFZlY3RvcjIoIGUgKiByYWRpdXNYIC8gMiwgMTAgKTtcclxuICAgICAgY0xhYmVsTm9kZS5yb3RhdGlvbiA9IHRoaXMub3JiaXQudztcclxuXHJcbiAgICAgIC8vIFN0cmluZ3Mgb2YgdGhlIGZvY2lcclxuICAgICAgY29uc3QgYm9keVBvc2l0aW9uID0gdGhpcy5vcmJpdC5jcmVhdGVQb2xhciggLXRoaXMub3JiaXQubnUgKS50aW1lcyggc2NhbGUgKTtcclxuICAgICAgY29uc3Qgc3RyaW5nc1NoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAtcmFkaXVzQywgMCApLmxpbmVUbyggKCBib2R5UG9zaXRpb24ueCArIHJhZGl1c0MgKSwgYm9keVBvc2l0aW9uLnkgKTtcclxuICAgICAgc3RyaW5nc1NoYXBlLm1vdmVUbyggcmFkaXVzQywgMCApLmxpbmVUbyggKCBib2R5UG9zaXRpb24ueCArIHJhZGl1c0MgKSwgYm9keVBvc2l0aW9uLnkgKTtcclxuICAgICAgc3RyaW5nc1BhdGguc2hhcGUgPSBzdHJpbmdzU2hhcGU7XHJcblxyXG4gICAgICBjb25zdCBsYWJlbHNZUG9zaXRpb24gPSBib2R5UG9zaXRpb24ueSAvIDI7XHJcbiAgICAgIGNvbnN0IG9mZnNldFZlY3RvciA9IG5ldyBWZWN0b3IyKCAwLCAxNSApLnJvdGF0ZWQoIGJvZHlQb3NpdGlvbi5hbmdsZSApO1xyXG4gICAgICBzdHJpbmdMYWJlbE5vZGUxLmNlbnRlciA9IG5ldyBWZWN0b3IyKCAoIGJvZHlQb3NpdGlvbi54IC8gMiArIHJhZGl1c0MgKSwgbGFiZWxzWVBvc2l0aW9uICkuYWRkKCBvZmZzZXRWZWN0b3IgKTtcclxuICAgICAgc3RyaW5nTGFiZWxOb2RlMS5yb3RhdGlvbiA9IHRoaXMub3JiaXQudztcclxuICAgICAgc3RyaW5nTGFiZWxOb2RlMi5jZW50ZXIgPSBuZXcgVmVjdG9yMiggKCBib2R5UG9zaXRpb24ueCAvIDIgKSwgbGFiZWxzWVBvc2l0aW9uICkuYWRkKCBvZmZzZXRWZWN0b3IgKTtcclxuICAgICAgc3RyaW5nTGFiZWxOb2RlMi5yb3RhdGlvbiA9IHRoaXMub3JiaXQudztcclxuICAgICAgcmFkaXVzTGFiZWxOb2RlLmNlbnRlciA9IG5ldyBWZWN0b3IyKCAoIGJvZHlQb3NpdGlvbi54IC8gMiApLCBsYWJlbHNZUG9zaXRpb24gKS5hZGQoIG9mZnNldFZlY3RvciApO1xyXG4gICAgICByYWRpdXNMYWJlbE5vZGUucm90YXRpb24gPSB0aGlzLm9yYml0Lnc7XHJcblxyXG4gICAgICAvL0ZvY2lcclxuICAgICAgZm9jaVsgMCBdLnJvdGF0aW9uID0gdGhpcy5vcmJpdC53ICsgTWF0aC5QSSAvIDQ7XHJcbiAgICAgIGZvY2lbIDAgXS5jZW50ZXIgPSBuZXcgVmVjdG9yMiggLXJhZGl1c0MsIDAgKTtcclxuXHJcbiAgICAgIGZvY2lbIDEgXS5yb3RhdGlvbiA9IHRoaXMub3JiaXQudyArIE1hdGguUEkgLyA0O1xyXG4gICAgICBmb2NpWyAxIF0uY2VudGVyID0gbmV3IFZlY3RvcjIoIHJhZGl1c0MsIDAgKTtcclxuXHJcbiAgICAgIC8vIFNFQ09ORCBMQVcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyBQZXJpYXBzaXMgYW5kIGFwb2Fwc2lzXHJcbiAgICAgIHBlcmlhcHNpcy5jZW50ZXIgPSBuZXcgVmVjdG9yMiggc2NhbGUgKiAoIGEgKiAoIDEgLSBlICkgKyBjICksIDAgKTtcclxuICAgICAgYXBvYXBzaXMuY2VudGVyID0gbmV3IFZlY3RvcjIoIC1zY2FsZSAqICggYSAqICggMSArIGUgKSAtIGMgKSwgMCApO1xyXG5cclxuICAgICAgLy8gRHJhd2luZyBvcmJpdGFsIGRpdmlzaW9ucyBhbmQgYXJlYXNcclxuICAgICAgdGhpcy5vcmJpdC5vcmJpdGFsQXJlYXMuZm9yRWFjaCggKCBhcmVhLCBpICkgPT4ge1xyXG4gICAgICAgIG9yYml0RGl2aXNpb25zWyBpIF0udmlzaWJsZSA9IG1vZGVsLmlzU2Vjb25kTGF3UHJvcGVydHkudmFsdWUgJiYgYXJlYS5hY3RpdmU7XHJcbiAgICAgICAgYXJlYVBhdGhzWyBpIF0udmlzaWJsZSA9IG1vZGVsLmlzU2Vjb25kTGF3UHJvcGVydHkudmFsdWUgJiYgYXJlYS5hY3RpdmU7XHJcbiAgICAgICAgYXJlYVZhbHVlTnVtYmVyRGlzcGxheXNbIGkgXS52aXNpYmxlID0gbW9kZWwuaXNTZWNvbmRMYXdQcm9wZXJ0eS52YWx1ZSAmJiBhcmVhLmFjdGl2ZTtcclxuXHJcbiAgICAgICAgbGV0IG51bWJlckRpc3BsYXlQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICAgICAgbGV0IG51bWJlckRpc3BsYXlTY2FsaW5nID0gMTtcclxuXHJcbiAgICAgICAgaWYgKCBpIDwgbW9kZWwucGVyaW9kRGl2aXNpb25Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgIC8vIFNldCB0aGUgY2VudGVyIG9mIHRoZSBvcmJpdCdzIGRpdmlzaW9ucyBkb3RcclxuICAgICAgICAgIGNvbnN0IGRvdFBvc2l0aW9uID0gYXJlYS5kb3RQb3NpdGlvbi50aW1lcyggc2NhbGUgKS5taW51cyggY2VudGVyICk7XHJcbiAgICAgICAgICBvcmJpdERpdmlzaW9uc1sgaSBdLmNlbnRlciA9IGRvdFBvc2l0aW9uO1xyXG4gICAgICAgICAgb3JiaXREaXZpc2lvbnNbIGkgXS5maWxsID0gU29sYXJTeXN0ZW1Db21tb25Db2xvcnMub3JiaXRDb2xvclByb3BlcnR5LnZhbHVlLmRhcmtlckNvbG9yKCBNYXRoLnBvdyggMSAtIGFyZWEuY29tcGxldGlvbiwgMTAgKSApO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gYXJlYS5zdGFydFBvc2l0aW9uLnRpbWVzKCBzY2FsZSApLm1pbnVzKCBjZW50ZXIgKTtcclxuICAgICAgICAgIGNvbnN0IGVuZCA9IGFyZWEuZW5kUG9zaXRpb24udGltZXMoIHNjYWxlICkubWludXMoIGNlbnRlciApO1xyXG4gICAgICAgICAgY29uc3Qgc3RhcnRBbmdsZSA9IE1hdGguYXRhbjIoIHN0YXJ0LnkgLyByYWRpdXNZLCBzdGFydC54IC8gcmFkaXVzWCApO1xyXG4gICAgICAgICAgY29uc3QgZW5kQW5nbGUgPSBNYXRoLmF0YW4yKCBlbmQueSAvIHJhZGl1c1ksIGVuZC54IC8gcmFkaXVzWCApO1xyXG5cclxuICAgICAgICAgIC8vIE1lYW4gdmFsdWUgYmV0d2VlbiBzdGFydCBhbmQgZW5kXHJcbiAgICAgICAgICBudW1iZXJEaXNwbGF5UG9zaXRpb24gPSBtb2RlbC5lbmdpbmUuY3JlYXRlUG9sYXIoICggYXJlYS5zdGFydEFuZ2xlICsgYXJlYS5lbmRBbmdsZSApIC8gMiApLnRpbWVzKCBzY2FsZSApLm1pbnVzKCBjZW50ZXIgKTtcclxuXHJcbiAgICAgICAgICBpZiAoIG1vZGVsLnBlcmlvZERpdmlzaW9uUHJvcGVydHkudmFsdWUgPT09IDIgKSB7XHJcbiAgICAgICAgICAgIG51bWJlckRpc3BsYXlQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCByYWRpdXNZICogTWF0aC5wb3coIC0xLCBpICkgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBudW1iZXJEaXNwbGF5U2NhbGluZyA9IG51bWJlckRpc3BsYXlQb3NpdGlvblNjYWxpbmcoIG51bWJlckRpc3BsYXlQb3NpdGlvbi5tYWduaXR1ZGUgKTtcclxuICAgICAgICAgIGFyZWFWYWx1ZU51bWJlckRpc3BsYXlzWyBpIF0uY2VudGVyID0gbnVtYmVyRGlzcGxheVBvc2l0aW9uLnRpbWVzKCBudW1iZXJEaXNwbGF5U2NhbGluZyApO1xyXG4gICAgICAgICAgYXJlYVZhbHVlTnVtYmVyRGlzcGxheXNbIGkgXS5yb3RhdGlvbiA9IHRoaXMub3JiaXQudztcclxuXHJcbiAgICAgICAgICAvLyBDYWxjdWxhdGVzIHRoZSB0b3RhbCBhcmVhIG9mIHRoZSBlbGxpcHNlIC8gdGhlIG51bWJlciBvZiBkaXZpc2lvbnNcclxuICAgICAgICAgIGNvbnN0IGZ1bGxTZWdtZW50QXJlYSA9IHRoaXMub3JiaXQuc2VnbWVudEFyZWEgKiBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5QT1NJVElPTl9NVUxUSVBMSUVSICogU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuUE9TSVRJT05fTVVMVElQTElFUjtcclxuICAgICAgICAgIGFyZWFWYWx1ZVByb3BlcnRpZXNbIGkgXS52YWx1ZSA9IGFyZWEuYWxyZWFkeUVudGVyZWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBhcmVhLmluc2lkZVByb3BlcnR5LnZhbHVlID8gZnVsbFNlZ21lbnRBcmVhICogYXJlYS5jb21wbGV0aW9uIDogZnVsbFNlZ21lbnRBcmVhIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAwO1xyXG5cclxuICAgICAgICAgIC8vIEFjdGl2YXRlIGFyZWEgcGF0aFxyXG4gICAgICAgICAgLy8gT3BhY2l0eSBsb3dlcmVkIGRvd24gdG8gMC44IGZvciBzdHlsaXN0aWMgcHVycG9zZXNcclxuICAgICAgICAgIGFyZWFQYXRoc1sgaSBdLm9wYWNpdHkgPSBhcmVhLmFscmVhZHlFbnRlcmVkID8gYXJlYS5pbnNpZGVQcm9wZXJ0eS52YWx1ZSA/IDEgOiAwLjcgKiBhcmVhLmNvbXBsZXRpb24gKyAwLjEgOiAwO1xyXG4gICAgICAgICAgYXJlYVBhdGhzWyBpIF0uc2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIHJhZGl1c0MsIDAgKS5lbGxpcHRpY2FsQXJjKFxyXG4gICAgICAgICAgICAwLCAwLCByYWRpdXNYLCByYWRpdXNZLCAwLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgZmFsc2VcclxuICAgICAgICAgICkuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcblxyXG4gICAgICAvLyBUSElSRCBMQVcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyBTZW1pLW1ham9yIGF4aXNcclxuICAgICAgc2VtaU1ham9yQXhpc1BhdGguc2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIDAgKS5saW5lVG8oIC1yYWRpdXNYLCAwICk7XHJcblxyXG4gICAgICBib2R5UG9zaXRpb24uc3VidHJhY3QoIGNlbnRlciApO1xyXG4gICAgICBjb25zdCBlbmRBbmdsZSA9IE1hdGguYXRhbjIoIGJvZHlQb3NpdGlvbi55IC8gcmFkaXVzWSwgYm9keVBvc2l0aW9uLnggLyByYWRpdXNYICk7XHJcbiAgICAgIC8vIGFwcGx5VHJhbnNmb3JtYXRpb24oIHRyYWNrUGF0aCApO1xyXG4gICAgICBjb25zdCB0cmFja1NoYXBlID0gbmV3IFNoYXBlKCkuZWxsaXB0aWNhbEFyYyggMCwgMCwgcmFkaXVzWCwgcmFkaXVzWSwgMCwgMCwgZW5kQW5nbGUsIHRoaXMub3JiaXQucmV0cm9ncmFkZSApO1xyXG4gICAgICB0cmFja1BhdGguc2hhcGUgPSB0cmFja1NoYXBlO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm9yYml0LmNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB1cGRhdGVkT3JiaXQgKTtcclxuXHJcbiAgICB0aGlzLnNoYXBlTXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgW1xyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LFxyXG4gICAgICAgIG1vZGVsLnBlcmlvZERpdmlzaW9uUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwuc2VsZWN0ZWRMYXdQcm9wZXJ0eVxyXG4gICAgICBdLFxyXG4gICAgICAoKSA9PiB1cGRhdGVkT3JiaXQoKSApO1xyXG4gIH1cclxufVxyXG5cclxua2VwbGVyc0xhd3MucmVnaXN0ZXIoICdFbGxpcHRpY2FsT3JiaXROb2RlJywgRWxsaXB0aWNhbE9yYml0Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSxnQ0FBZ0M7QUFFdEQsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxJQUFJLFFBQXFCLG1DQUFtQztB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