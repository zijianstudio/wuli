// Copyright 2023, University of Colorado Boulder

/**
 *
 * Definition of the Lab Screen Icon: A sun with two elliptical orbits around it
 *
 * @author Agustín Vallejo
 */

import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import { Shape } from '../../../../kite/js/imports.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SolarSystemCommonColors from '../../../../solar-system-common/js/SolarSystemCommonColors.js';
import keplersLaws from '../../keplersLaws.js';
export default class KeplersLawsScreenIcon extends ScreenIcon {
  constructor() {
    // Ellipses parameters
    const EllipseSemiMajorAxis = 20;
    const EllipseSemiMinorAxis = 15;
    // calculate focal point
    const EllipseFocalPoint = Math.sqrt(EllipseSemiMajorAxis * EllipseSemiMajorAxis - EllipseSemiMinorAxis * EllipseSemiMinorAxis);
    const calculateR = (a, e, nu) => {
      const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
      return Vector2.createPolar(r, nu);
    };
    const eccentricity = EllipseFocalPoint / EllipseSemiMajorAxis;
    const divisionAngles = [0, 1.877, 2.807, 3.475, -1.877];
    const areas = [];
    const bodyPosition = calculateR(EllipseSemiMajorAxis, eccentricity, divisionAngles[divisionAngles.length - 1] * 1.08);
    for (let i = 1; i < divisionAngles.length; i++) {
      let startAngle = divisionAngles[i];
      let endAngle = i + 1 === divisionAngles.length ? divisionAngles[0] : divisionAngles[i + 1];
      startAngle = Math.PI - startAngle;
      endAngle = Math.PI - endAngle;
      areas.push(new Path(new Shape().moveTo(-EllipseFocalPoint, 0).ellipticalArc(0, 0, EllipseSemiMajorAxis, EllipseSemiMinorAxis, 0, startAngle, endAngle, true).close(), {
        fill: SolarSystemCommonColors.secondBodyColorProperty,
        opacity: (divisionAngles.length - i + 1) / (divisionAngles.length + 1)
      }));
    }
    super(new Node({
      children: [...areas, new Path(new Shape().ellipse(0, 0, EllipseSemiMajorAxis, EllipseSemiMinorAxis, 0), {
        stroke: SolarSystemCommonColors.secondBodyColorProperty,
        lineWidth: 1
      }), new ShadedSphereNode(8, {
        mainColor: SolarSystemCommonColors.firstBodyColorProperty,
        x: -EllipseFocalPoint
      }), new ShadedSphereNode(3, {
        mainColor: SolarSystemCommonColors.secondBodyColorProperty,
        x: bodyPosition.x + EllipseFocalPoint,
        y: -bodyPosition.y
      })]
    }), {
      fill: SolarSystemCommonColors.backgroundProperty
    });
  }
}
keplersLaws.register('KeplersLawsScreenIcon', KeplersLawsScreenIcon);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5JY29uIiwiTm9kZSIsIlBhdGgiLCJTaGFwZSIsIlNoYWRlZFNwaGVyZU5vZGUiLCJWZWN0b3IyIiwiU29sYXJTeXN0ZW1Db21tb25Db2xvcnMiLCJrZXBsZXJzTGF3cyIsIktlcGxlcnNMYXdzU2NyZWVuSWNvbiIsImNvbnN0cnVjdG9yIiwiRWxsaXBzZVNlbWlNYWpvckF4aXMiLCJFbGxpcHNlU2VtaU1pbm9yQXhpcyIsIkVsbGlwc2VGb2NhbFBvaW50IiwiTWF0aCIsInNxcnQiLCJjYWxjdWxhdGVSIiwiYSIsImUiLCJudSIsInIiLCJjb3MiLCJjcmVhdGVQb2xhciIsImVjY2VudHJpY2l0eSIsImRpdmlzaW9uQW5nbGVzIiwiYXJlYXMiLCJib2R5UG9zaXRpb24iLCJsZW5ndGgiLCJpIiwic3RhcnRBbmdsZSIsImVuZEFuZ2xlIiwiUEkiLCJwdXNoIiwibW92ZVRvIiwiZWxsaXB0aWNhbEFyYyIsImNsb3NlIiwiZmlsbCIsInNlY29uZEJvZHlDb2xvclByb3BlcnR5Iiwib3BhY2l0eSIsImNoaWxkcmVuIiwiZWxsaXBzZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsIm1haW5Db2xvciIsImZpcnN0Qm9keUNvbG9yUHJvcGVydHkiLCJ4IiwieSIsImJhY2tncm91bmRQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiS2VwbGVyc0xhd3NTY3JlZW5JY29uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKlxyXG4gKiBEZWZpbml0aW9uIG9mIHRoZSBMYWIgU2NyZWVuIEljb246IEEgc3VuIHdpdGggdHdvIGVsbGlwdGljYWwgb3JiaXRzIGFyb3VuZCBpdFxyXG4gKlxyXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam9cclxuICovXHJcblxyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFNoYWRlZFNwaGVyZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1NoYWRlZFNwaGVyZU5vZGUuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL1NvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IGtlcGxlcnNMYXdzIGZyb20gJy4uLy4uL2tlcGxlcnNMYXdzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtlcGxlcnNMYXdzU2NyZWVuSWNvbiBleHRlbmRzIFNjcmVlbkljb24ge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIEVsbGlwc2VzIHBhcmFtZXRlcnNcclxuICAgIGNvbnN0IEVsbGlwc2VTZW1pTWFqb3JBeGlzID0gMjA7XHJcbiAgICBjb25zdCBFbGxpcHNlU2VtaU1pbm9yQXhpcyA9IDE1O1xyXG4gICAgLy8gY2FsY3VsYXRlIGZvY2FsIHBvaW50XHJcbiAgICBjb25zdCBFbGxpcHNlRm9jYWxQb2ludCA9IE1hdGguc3FydCggRWxsaXBzZVNlbWlNYWpvckF4aXMgKiBFbGxpcHNlU2VtaU1ham9yQXhpcyAtIEVsbGlwc2VTZW1pTWlub3JBeGlzICogRWxsaXBzZVNlbWlNaW5vckF4aXMgKTtcclxuXHJcbiAgICBjb25zdCBjYWxjdWxhdGVSID0gKCBhOiBudW1iZXIsIGU6IG51bWJlciwgbnU6IG51bWJlciApOiBWZWN0b3IyID0+IHtcclxuICAgICAgY29uc3QgciA9IGEgKiAoIDEgLSBlICogZSApIC8gKCAxICsgZSAqIE1hdGguY29zKCBudSApICk7XHJcbiAgICAgIHJldHVybiBWZWN0b3IyLmNyZWF0ZVBvbGFyKCByLCBudSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBlY2NlbnRyaWNpdHkgPSBFbGxpcHNlRm9jYWxQb2ludCAvIEVsbGlwc2VTZW1pTWFqb3JBeGlzO1xyXG5cclxuICAgIGNvbnN0IGRpdmlzaW9uQW5nbGVzID0gW1xyXG4gICAgICAwLFxyXG4gICAgICAxLjg3NyxcclxuICAgICAgMi44MDcsXHJcbiAgICAgIDMuNDc1LFxyXG4gICAgICAtMS44NzdcclxuICAgIF07XHJcbiAgICBjb25zdCBhcmVhcyA9IFtdO1xyXG5cclxuICAgIGNvbnN0IGJvZHlQb3NpdGlvbiA9IGNhbGN1bGF0ZVIoIEVsbGlwc2VTZW1pTWFqb3JBeGlzLCBlY2NlbnRyaWNpdHksIGRpdmlzaW9uQW5nbGVzWyBkaXZpc2lvbkFuZ2xlcy5sZW5ndGggLSAxIF0gKiAxLjA4ICk7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgZGl2aXNpb25BbmdsZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGxldCBzdGFydEFuZ2xlID0gZGl2aXNpb25BbmdsZXNbIGkgXTtcclxuICAgICAgbGV0IGVuZEFuZ2xlID0gaSArIDEgPT09IGRpdmlzaW9uQW5nbGVzLmxlbmd0aCA/IGRpdmlzaW9uQW5nbGVzWyAwIF0gOiBkaXZpc2lvbkFuZ2xlc1sgaSArIDEgXTtcclxuXHJcbiAgICAgIHN0YXJ0QW5nbGUgPSBNYXRoLlBJIC0gc3RhcnRBbmdsZTtcclxuICAgICAgZW5kQW5nbGUgPSBNYXRoLlBJIC0gZW5kQW5nbGU7XHJcblxyXG4gICAgICBhcmVhcy5wdXNoKFxyXG4gICAgICAgIG5ldyBQYXRoKFxyXG4gICAgICAgIG5ldyBTaGFwZSgpLm1vdmVUbyggLUVsbGlwc2VGb2NhbFBvaW50LCAwICkuZWxsaXB0aWNhbEFyYyhcclxuICAgICAgICAgIDAsIDAsIEVsbGlwc2VTZW1pTWFqb3JBeGlzLCBFbGxpcHNlU2VtaU1pbm9yQXhpcywgMCwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIHRydWVcclxuICAgICAgICApLmNsb3NlKCksXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGZpbGw6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLnNlY29uZEJvZHlDb2xvclByb3BlcnR5LFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAoIGRpdmlzaW9uQW5nbGVzLmxlbmd0aCAtIGkgKyAxICkgLyAoIGRpdmlzaW9uQW5nbGVzLmxlbmd0aCArIDEgKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgbmV3IE5vZGUoIHtcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgLi4uYXJlYXMsXHJcbiAgICAgICAgICBuZXcgUGF0aChcclxuICAgICAgICAgICAgbmV3IFNoYXBlKCkuZWxsaXBzZSggMCwgMCwgRWxsaXBzZVNlbWlNYWpvckF4aXMsIEVsbGlwc2VTZW1pTWlub3JBeGlzLCAwICksXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzdHJva2U6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLnNlY29uZEJvZHlDb2xvclByb3BlcnR5LFxyXG4gICAgICAgICAgICAgIGxpbmVXaWR0aDogMVxyXG4gICAgICAgICAgICB9ICksXHJcbiAgICAgICAgICBuZXcgU2hhZGVkU3BoZXJlTm9kZSggOCwge1xyXG4gICAgICAgICAgICBtYWluQ29sb3I6IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmZpcnN0Qm9keUNvbG9yUHJvcGVydHksXHJcbiAgICAgICAgICAgIHg6IC1FbGxpcHNlRm9jYWxQb2ludFxyXG4gICAgICAgICAgfSApLFxyXG4gICAgICAgICAgbmV3IFNoYWRlZFNwaGVyZU5vZGUoIDMsIHtcclxuICAgICAgICAgICAgbWFpbkNvbG9yOiBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycy5zZWNvbmRCb2R5Q29sb3JQcm9wZXJ0eSxcclxuICAgICAgICAgICAgeDogYm9keVBvc2l0aW9uLnggKyBFbGxpcHNlRm9jYWxQb2ludCxcclxuICAgICAgICAgICAgeTogLWJvZHlQb3NpdGlvbi55XHJcbiAgICAgICAgICB9IClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKSxcclxuICAgICAgeyBmaWxsOiBTb2xhclN5c3RlbUNvbW1vbkNvbG9ycy5iYWNrZ3JvdW5kUHJvcGVydHkgfVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmtlcGxlcnNMYXdzLnJlZ2lzdGVyKCAnS2VwbGVyc0xhd3NTY3JlZW5JY29uJywgS2VwbGVyc0xhd3NTY3JlZW5JY29uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxnQkFBZ0IsTUFBTSxpREFBaUQ7QUFDOUUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyx1QkFBdUIsTUFBTSwrREFBK0Q7QUFDbkcsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUU5QyxlQUFlLE1BQU1DLHFCQUFxQixTQUFTUixVQUFVLENBQUM7RUFDckRTLFdBQVdBLENBQUEsRUFBRztJQUNuQjtJQUNBLE1BQU1DLG9CQUFvQixHQUFHLEVBQUU7SUFDL0IsTUFBTUMsb0JBQW9CLEdBQUcsRUFBRTtJQUMvQjtJQUNBLE1BQU1DLGlCQUFpQixHQUFHQyxJQUFJLENBQUNDLElBQUksQ0FBRUosb0JBQW9CLEdBQUdBLG9CQUFvQixHQUFHQyxvQkFBb0IsR0FBR0Esb0JBQXFCLENBQUM7SUFFaEksTUFBTUksVUFBVSxHQUFHQSxDQUFFQyxDQUFTLEVBQUVDLENBQVMsRUFBRUMsRUFB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