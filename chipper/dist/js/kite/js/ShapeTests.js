// Copyright 2017-2022, University of Colorado Boulder

/**
 * Shape tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import Matrix3 from '../../dot/js/Matrix3.js';
import Ray2 from '../../dot/js/Ray2.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Arc, Cubic, EllipticalArc, Line, Quadratic, Shape } from './imports.js';
QUnit.module('Shape');
function dataToCanvas(snapshot) {
  const canvas = document.createElement('canvas');
  canvas.width = snapshot.width;
  canvas.height = snapshot.height;
  const context = canvas.getContext('2d');
  context.putImageData(snapshot, 0, 0);
  $(canvas).css('border', '1px solid black');
  return canvas;
}

// compares two pixel snapshots {ImageData} and uses the qunit's assert to verify they are the same
function dataEquals(assert, a, b, threshold, message, extraDom) {
  let isEqual = a.width === b.width && a.height === b.height;
  let largestDifference = 0;
  let totalDifference = 0;
  const colorDiffData = document.createElement('canvas').getContext('2d').createImageData(a.width, a.height);
  const alphaDiffData = document.createElement('canvas').getContext('2d').createImageData(a.width, a.height);
  if (isEqual) {
    for (let i = 0; i < a.data.length; i++) {
      const diff = Math.abs(a.data[i] - b.data[i]);
      if (i % 4 === 3) {
        colorDiffData.data[i] = 255;
        alphaDiffData.data[i] = 255;
        alphaDiffData.data[i - 3] = diff; // red
        alphaDiffData.data[i - 2] = diff; // green
        alphaDiffData.data[i - 1] = diff; // blue
      } else {
        colorDiffData.data[i] = diff;
      }
      const alphaIndex = i - i % 4 + 3;
      // grab the associated alpha channel and multiply it times the diff
      const alphaMultipliedDiff = i % 4 === 3 ? diff : diff * (a.data[alphaIndex] / 255) * (b.data[alphaIndex] / 255);
      totalDifference += alphaMultipliedDiff;
      // if ( alphaMultipliedDiff > threshold ) {
      // console.log( message + ': ' + Math.abs( a.data[i] - b.data[i] ) );
      largestDifference = Math.max(largestDifference, alphaMultipliedDiff);
      // isEqual = false;
      // break;
      // }
    }
  }

  const averageDifference = totalDifference / (4 * a.width * a.height);
  if (averageDifference > threshold) {
    const display = $('#display');
    // header
    const note = document.createElement('h2');
    $(note).text(message);
    display.append(note);
    const differenceDiv = document.createElement('div');
    $(differenceDiv).text(`(actual) (expected) (color diff) (alpha diff) Diffs max: ${largestDifference}, average: ${averageDifference}`);
    display.append(differenceDiv);
    display.append(dataToCanvas(a));
    display.append(dataToCanvas(b));
    display.append(dataToCanvas(colorDiffData));
    display.append(dataToCanvas(alphaDiffData));
    if (extraDom) {
      display.append(extraDom);
    }

    // for a line-break
    display.append(document.createElement('div'));
    isEqual = false;
  }
  assert.ok(isEqual, message);
  return isEqual;
}
function testUnion(assert, aShape, bShape, threshold, message) {
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = 100;
  normalCanvas.height = 100;
  const normalContext = normalCanvas.getContext('2d');
  normalContext.fillStyle = 'black';
  normalContext.beginPath();
  aShape.writeToContext(normalContext);
  normalContext.fill();
  normalContext.beginPath();
  bShape.writeToContext(normalContext);
  normalContext.fill();

  // document.body.appendChild( normalCanvas );

  const shape = aShape.shapeUnion(bShape);
  const testCanvas = document.createElement('canvas');
  testCanvas.width = 100;
  testCanvas.height = 100;
  const testContext = testCanvas.getContext('2d');
  testContext.fillStyle = 'black';
  testContext.beginPath();
  shape.writeToContext(testContext);
  testContext.fill();

  // document.body.appendChild( testCanvas );

  const normalData = normalContext.getImageData(0, 0, 100, 100);
  const testData = testContext.getImageData(0, 0, 100, 100);
  dataEquals(assert, normalData, testData, threshold, message);
}
function testDifference(assert, aShape, bShape, threshold, message) {
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = 100;
  normalCanvas.height = 100;
  const normalContext = normalCanvas.getContext('2d');
  normalContext.fillStyle = 'white';
  normalContext.fillRect(0, 0, 100, 100);
  normalContext.fillStyle = 'black';
  normalContext.beginPath();
  aShape.writeToContext(normalContext);
  normalContext.fill();
  normalContext.fillStyle = 'white';
  normalContext.beginPath();
  bShape.writeToContext(normalContext);
  normalContext.fill();

  // document.body.appendChild( normalCanvas );

  const shape = aShape.shapeDifference(bShape);
  const testCanvas = document.createElement('canvas');
  testCanvas.width = 100;
  testCanvas.height = 100;
  const testContext = testCanvas.getContext('2d');
  testContext.fillStyle = 'white';
  testContext.fillRect(0, 0, 100, 100);
  testContext.fillStyle = 'black';
  testContext.beginPath();
  shape.writeToContext(testContext);
  testContext.fill();

  // document.body.appendChild( testCanvas );

  const normalData = normalContext.getImageData(0, 0, 100, 100);
  const testData = testContext.getImageData(0, 0, 100, 100);
  dataEquals(assert, normalData, testData, threshold, message);
}
QUnit.test('Triangle union', assert => {
  testUnion(assert, new Shape().moveTo(10, 10).lineTo(90, 10).lineTo(50, 90).close(), new Shape().moveTo(10, 90).lineTo(90, 90).lineTo(50, 10).close(), 1, 'Union of opposite orientation triangles');
});
QUnit.test('CAG union #1', assert => {
  testUnion(assert, new Shape().moveTo(0, 0).lineTo(10, 10).lineTo(20, 0).close().moveTo(4, 2).lineTo(16, 2).lineTo(10, 6).close(), new Shape().moveTo(0, 8).lineTo(10, 18).lineTo(20, 8).close().moveTo(0, 20).lineTo(20, 25).lineTo(20, 20).lineTo(0, 25).close().moveTo(0, 25).lineTo(20, 30).lineTo(20, 25).lineTo(0, 30).close(), 1, 'CAG test #1');
});
QUnit.test('CAG union #2', assert => {
  testUnion(assert, new Shape().moveTo(0, 0).lineTo(10, 0).lineTo(10, 10).lineTo(0, 10).close().moveTo(5, 10).lineTo(15, 10).lineTo(15, 20).lineTo(5, 20).close(), new Shape().moveTo(10, 0).lineTo(20, 0).lineTo(20, 10).lineTo(10, 10).close().moveTo(20, 0).lineTo(20, 10).lineTo(30, 10).lineTo(30, 0).close(), 1, 'CAG test #2');
});
QUnit.test('Difference test', assert => {
  testDifference(assert, new Shape().rect(0, 0, 100, 10).rect(0, 20, 100, 10).rect(0, 40, 100, 10).rect(0, 60, 100, 10).rect(0, 80, 100, 10), new Shape().rect(0, 0, 10, 100).rect(20, 0, 10, 100).rect(40, 0, 10, 100).rect(60, 0, 10, 100).rect(80, 0, 10, 100), 1, 'Difference test');
});
QUnit.test('CAG multiple test', assert => {
  let a = new Shape();
  let b = new Shape();
  let c = new Shape();
  a.moveTo(0, 2).cubicCurveTo(22, 2, -1, 10, 25, 10).lineTo(25, 16.5).lineTo(0, 16.5).close();
  a.moveTo(0, 10).lineTo(10, 10).lineTo(10, 25).lineTo(0, 25).close();
  a.moveTo(13, 25).arc(10, 25, 3, 0, Math.PI * 1.3, false).close();
  b.moveTo(0, 0).lineTo(30, 16.5).lineTo(30, 0).close();
  b.moveTo(15, 2).lineTo(25, 2).lineTo(25, 7).quadraticCurveTo(15, 7, 15, 2).close();
  c.rect(20, 0, 3, 20);
  a = a.transformed(Matrix3.scaling(3));
  b = b.transformed(Matrix3.scaling(3));
  c = c.transformed(Matrix3.scaling(3));
  testUnion(assert, a, b, 1, 'CAG multiple #1');
  const ab = a.shapeUnion(b);
  testDifference(assert, ab, c, 1, 'CAG multiple #2');
});
QUnit.test('Testing cubic overlap', assert => {
  const a = new Shape();
  const b = new Shape();
  const curve = new Cubic(new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10), new Vector2(20, 10));
  const left = curve.subdivided(0.7)[0];
  const right = curve.subdivided(0.3)[1];
  a.moveTo(0, 10).lineTo(left.start.x, left.start.y).cubicCurveTo(left.control1.x, left.control1.y, left.control2.x, left.control2.y, left.end.x, left.end.y).close();
  b.moveTo(20, 0).lineTo(right.start.x, right.start.y).cubicCurveTo(right.control1.x, right.control1.y, right.control2.x, right.control2.y, right.end.x, right.end.y).close();
  testUnion(assert, a, b, 1, 'Cubic overlap union');
});
QUnit.test('Testing quadratic overlap', assert => {
  const a = new Shape();
  const b = new Shape();
  const curve = new Quadratic(new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10));
  const left = curve.subdivided(0.7)[0];
  const right = curve.subdivided(0.3)[1];
  a.moveTo(0, 10).lineTo(left.start.x, left.start.y).quadraticCurveTo(left.control.x, left.control.y, left.end.x, left.end.y).close();
  b.moveTo(20, 0).lineTo(right.start.x, right.start.y).quadraticCurveTo(right.control.x, right.control.y, right.end.x, right.end.y).close();
  testUnion(assert, a, b, 1, 'Quadratic overlap union');
});
QUnit.test('Cubic self-intersection', assert => {
  const a = new Shape();
  const b = new Shape();
  a.moveTo(10, 0).cubicCurveTo(30, 10, 0, 10, 20, 0).close();
  b.rect(0, 0, 5, 5);
  testUnion(assert, a, b, 1, 'Cubic self-intersection');
});
QUnit.test('Cubic self-intersection + overlapping unused edge', assert => {
  const a = new Shape();
  const b = new Shape();
  a.moveTo(10, 0).lineTo(10, 10).lineTo(10, 0).cubicCurveTo(30, 10, 0, 10, 20, 0).close();
  b.rect(0, 0, 5, 5);
  testUnion(assert, a, b, 1, 'Cubic self-intersection');
});
QUnit.test('Removal of bridge edges', assert => {
  const a = new Shape();
  const b = new Shape();
  a.moveTo(40, 50).lineTo(20, 70).lineTo(20, 30).lineTo(40, 50).lineTo(60, 50).lineTo(80, 30).lineTo(80, 70).lineTo(60, 50).close();
  b.rect(0, 0, 5, 5);
  testUnion(assert, a, b, 1, 'Removal of bridge edges');
});
QUnit.test('Double circle', assert => {
  const a = new Shape();
  const b = new Shape();
  a.circle(20, 20, 10);
  b.circle(25, 20, 10);
  testUnion(assert, a, b, 1, 'Double circle union');
  testDifference(assert, a, b, 1, 'Double circle difference');
});
QUnit.test('Half circle join', assert => {
  const a = new Shape();
  const b = new Shape();
  a.arc(50, 50, 30, 0, Math.PI, false).close();
  b.arc(50, 50, 30, Math.PI, Math.PI * 2, false).close();
  testUnion(assert, a, b, 1, 'Half circle union');
});
QUnit.test('Partial circle overlap', assert => {
  const a = new Shape();
  const b = new Shape();
  a.arc(50, 50, 30, 0, Math.PI, false).close();
  b.arc(50, 50, 30, Math.PI * 0.5, Math.PI * 2, false).close();
  testUnion(assert, a, b, 1, 'Partial circle union');
});
QUnit.test('Circle overlap', assert => {
  const a = new Shape();
  const b = new Shape();
  a.circle(50, 50, 30);
  b.circle(50, 50, 30);
  testUnion(assert, a, b, 1, 'Circle overlap union');
});
QUnit.test('Circle adjacent', assert => {
  const a = new Shape();
  const b = new Shape();
  a.circle(10, 10, 5);
  b.arc(20, 10, 5, Math.PI, 3 * Math.PI, false).close();
  testUnion(assert, a, b, 1, 'Circle adjacent union');
});
QUnit.test('4 adjacent circles', assert => {
  const a = new Shape().circle(-5, 0, 5).circle(5, 0, 5);
  const b = new Shape().circle(0, -5, 5).circle(0, 5, 5);
  testUnion(assert, a, b, 1, '4 adjacent circles union');
});
QUnit.test('stroked line 1', assert => {
  const a = Shape.deserialize({
    type: 'Shape',
    subpaths: [{
      type: 'Subpath',
      segments: [{
        type: 'Line',
        startX: 580,
        startY: 372,
        endX: 580,
        endY: 155.69419920487314
      }, {
        type: 'Arc',
        centerX: 570,
        centerY: 155.69419920487314,
        radius: 10,
        startAngle: 0,
        endAngle: -3.141592653589793,
        anticlockwise: true
      }, {
        type: 'Line',
        startX: 560,
        startY: 155.69419920487314,
        endX: 560,
        endY: 372
      }, {
        type: 'Arc',
        centerX: 570,
        centerY: 372,
        radius: 10,
        startAngle: 3.141592653589793,
        endAngle: 0,
        anticlockwise: true
      }],
      points: [{
        x: 580,
        y: 372
      }, {
        x: 580,
        y: 155.69419920487314
      }, {
        x: 560,
        y: 155.69419920487314
      }, {
        x: 560,
        y: 372
      }, {
        x: 580,
        y: 372
      }],
      closed: true
    }]
  });
  const b = Shape.deserialize({
    type: 'Shape',
    subpaths: [{
      type: 'Subpath',
      segments: [{
        type: 'Line',
        startX: 570,
        startY: 145.69419920487314,
        endX: 348.3058007951268,
        endY: 145.69419920487314
      }, {
        type: 'Arc',
        centerX: 348.3058007951268,
        centerY: 155.69419920487314,
        radius: 10,
        startAngle: 4.71238898038469,
        endAngle: 1.5707963267948966,
        anticlockwise: true
      }, {
        type: 'Line',
        startX: 348.3058007951268,
        startY: 165.69419920487314,
        endX: 570,
        endY: 165.69419920487314
      }, {
        type: 'Arc',
        centerX: 570,
        centerY: 155.69419920487314,
        radius: 10,
        startAngle: 1.5707963267948966,
        endAngle: -1.5707963267948966,
        anticlockwise: true
      }],
      points: [{
        x: 570,
        y: 145.69419920487314
      }, {
        x: 348.3058007951268,
        y: 145.69419920487314
      }, {
        x: 348.3058007951268,
        y: 165.69419920487314
      }, {
        x: 570,
        y: 165.69419920487314
      }, {
        x: 570,
        y: 145.69419920487314
      }],
      closed: true
    }]
  });
  testUnion(assert, a, b, 1, 'stroked line 1 union');
});
QUnit.test('Shared endpoint test', assert => {
  const a = Shape.deserialize({
    type: 'Shape',
    subpaths: [{
      type: 'Subpath',
      segments: [{
        type: 'Line',
        startX: 293.1293439302738,
        startY: 314.4245163440668,
        endX: 288.8867032431545,
        endY: 321.21274144345773
      }, {
        type: 'Line',
        startX: 288.8867032431545,
        startY: 321.21274144345773,
        endX: 283.3712703498995,
        endY: 326.7281743367127
      }, {
        type: 'Line',
        startX: 283.3712703498995,
        startY: 326.7281743367127,
        endX: 280.8256859376279,
        endY: 324.1825899244411
      }, {
        type: 'Line',
        startX: 280.8256859376279,
        startY: 324.1825899244411,
        endX: 286.3411188308829,
        endY: 318.66715703118615
      }, {
        type: 'Line',
        startX: 286.3411188308829,
        startY: 318.66715703118615,
        endX: 293.1293439302738,
        endY: 314.4245163440668
      }],
      points: [{
        x: 293.1293439302738,
        y: 314.4245163440668
      }, {
        x: 288.8867032431545,
        y: 321.21274144345773
      }, {
        x: 283.3712703498995,
        y: 326.7281743367127
      }, {
        x: 280.8256859376279,
        y: 324.1825899244411
      }, {
        x: 286.3411188308829,
        y: 318.66715703118615
      }, {
        x: 293.1293439302738,
        y: 314.4245163440668
      }],
      closed: true
    }, {
      type: 'Subpath',
      segments: [],
      points: [{
        x: 293.1293439302738,
        y: 314.4245163440668
      }],
      closed: false
    }]
  });
  const b = Shape.deserialize({
    type: 'Shape',
    subpaths: [{
      type: 'Subpath',
      segments: [{
        type: 'Line',
        startX: 296,
        startY: 272.7867965644035,
        endX: 447.21320343559637,
        endY: 272.7867965644035
      }, {
        type: 'Line',
        startX: 447.21320343559637,
        startY: 272.7867965644035,
        endX: 447.21320343559637,
        endY: 278.7867965644035
      }, {
        type: 'Line',
        startX: 447.21320343559637,
        startY: 278.7867965644035,
        endX: 404.7867965644035,
        endY: 321.2132034355964
      }, {
        type: 'Line',
        startX: 404.7867965644035,
        startY: 321.2132034355964,
        endX: 284.7867965644036,
        endY: 321.2132034355964
      }, {
        type: 'Line',
        startX: 284.7867965644036,
        startY: 321.2132034355964,
        endX: 284.7867965644036,
        endY: 315.2132034355964
      }, {
        type: 'Line',
        startX: 284.7867965644036,
        startY: 315.2132034355964,
        endX: 296,
        endY: 272.7867965644035
      }],
      points: [{
        x: 296,
        y: 272.7867965644035
      }, {
        x: 447.21320343559637,
        y: 272.7867965644035
      }, {
        x: 447.21320343559637,
        y: 278.7867965644035
      }, {
        x: 404.7867965644035,
        y: 321.2132034355964
      }, {
        x: 284.7867965644036,
        y: 321.2132034355964
      }, {
        x: 284.7867965644036,
        y: 315.2132034355964
      }, {
        x: 296,
        y: 272.7867965644035
      }],
      closed: true
    }]
  });
  testUnion(assert, a, b, 1, 'shared endpoint test 1');
});
QUnit.test('Line segment winding', assert => {
  const line = new Line(new Vector2(0, 0), new Vector2(2, 2));
  assert.equal(line.windingIntersection(new Ray2(new Vector2(0, 1), new Vector2(1, 0))), 1);
  assert.equal(line.windingIntersection(new Ray2(new Vector2(0, 5), new Vector2(1, 0))), 0);
  assert.equal(line.windingIntersection(new Ray2(new Vector2(1, 0), new Vector2(0, 1))), -1);
  assert.equal(line.windingIntersection(new Ray2(new Vector2(0, 0), new Vector2(1, 1).normalized())), 0);
  assert.equal(line.windingIntersection(new Ray2(new Vector2(0, 1), new Vector2(1, 1).normalized())), 0);
});
QUnit.test('Rectangle hit testing', assert => {
  const shape = Shape.rectangle(0, 0, 1, 1);
  assert.equal(shape.containsPoint(new Vector2(0.2, 0.3)), true, '0.2, 0.3');
  assert.equal(shape.containsPoint(new Vector2(0.5, 0.5)), true, '0.5, 0.5');
  assert.equal(shape.containsPoint(new Vector2(1.5, 0.5)), false, '1.5, 0.5');
  assert.equal(shape.containsPoint(new Vector2(-0.5, 0.5)), false, '-0.5, 0.5');
});

//See https://github.com/phetsims/kite/issues/34
QUnit.test('Trapezoid hit testing', assert => {
  const shape = new Shape('M 415 298.5 L 414.99999999999994 94.5 L 468.596798162286 101.08659447295564 L 468.59679816228606 291.91340552704435 Z');
  assert.equal(shape.containsPoint(new Vector2(441, 125)), true, 'trapezoid should report that an interior point is "containsPoint" true');
});
QUnit.test('Un-closed shape hit testing', assert => {
  const shape = new Shape().moveTo(0, 0).lineTo(10, 10).lineTo(0, 10);
  assert.equal(shape.containsPoint(new Vector2(1, 2)), true, '1, 2');
  assert.equal(shape.containsPoint(new Vector2(10, 2)), false, '10, 2');
});
QUnit.test('Zero-size rectangle', assert => {
  const shape = new Shape().rect(20, 50, 0, 0);
  assert.ok(shape.bounds.isFinite() || shape.bounds.isEmpty()); // relies on the boundary case from dot
});

QUnit.test('Zero-size line segment', assert => {
  const shape = new Shape().moveTo(20, 50).lineTo(20, 50).close();
  assert.ok(shape.bounds.isFinite() || shape.bounds.isEmpty()); // relies on the boundary case from dot
});

QUnit.test('Bucket hit region', assert => {
  const shape = new Shape().moveTo(-60, 0).lineTo(-48, 42).cubicCurveTo(-36, 51, 36, 51, 48, 42).lineTo(60, 0).ellipticalArc(0, 0, 60, 7.5, 0, 0, -Math.PI, false).close();
  const point = new Vector2(-131.07772925764198, -274.65043668122274);
  const ray = new Ray2(point, new Vector2(1, 0));
  assert.equal(0, shape.windingIntersection(ray), 'The winding intersection should be zero');
});
QUnit.test('intersectsBounds', assert => {
  assert.ok(!Shape.circle(0, 0, 2).intersectsBounds(new Bounds2(-1, -1, 1, 1)), 'Circle surrounds the bounds but should not intersect');
  assert.ok(Shape.circle(0, 0, 1.3).intersectsBounds(new Bounds2(-1, -1, 1, 1)), 'Circle intersects the bounds');
  assert.ok(Shape.circle(0, 0, 0.9).intersectsBounds(new Bounds2(-1, -1, 1, 1)), 'Circle contained within the bounds');
  assert.ok(new Shape().moveTo(-2, 0).lineTo(2, 0).intersectsBounds(new Bounds2(-1, -1, 1, 1)), 'Line goes through bounds directly');
  assert.ok(!new Shape().moveTo(-2, 2).lineTo(2, 2).intersectsBounds(new Bounds2(-1, -1, 1, 1)), 'Line goes above bounds');
});
QUnit.test('interiorIntersectsLineSegment', assert => {
  const circle = Shape.circle(0, 0, 10); // radius 10 at 0,0

  assert.ok(circle.interiorIntersectsLineSegment(new Vector2(-1, 0), new Vector2(1, 0)), 'Fully contained');
  assert.ok(!circle.interiorIntersectsLineSegment(new Vector2(-100, 0), new Vector2(-50, 0)), 'Outside with ray towards circle');
  assert.ok(!circle.interiorIntersectsLineSegment(new Vector2(50, 0), new Vector2(100, 0)), 'Outside with ray away from circle');
  assert.ok(circle.interiorIntersectsLineSegment(new Vector2(100, 0), new Vector2(0, 0)), 'Inside to outside (intersects)');
  assert.ok(!circle.interiorIntersectsLineSegment(new Vector2(100, 0), new Vector2(0, 100)), 'Outside at an angle');
  assert.ok(circle.interiorIntersectsLineSegment(new Vector2(10.1, 0), new Vector2(0, 10.1)), 'Glancing with two intersection points');
});
QUnit.test('Cubic overlap', assert => {
  const cubic = new Cubic(new Vector2(0, 0), new Vector2(0, 3), new Vector2(10, 7), new Vector2(10, 9));
  const otherCubic = new Cubic(new Vector2(10, 0), new Vector2(0, 3), new Vector2(10, 7), new Vector2(10, 9));
  const selfTest = Cubic.getOverlaps(cubic, cubic)[0];
  assert.equal(selfTest.a, 1, 'selfTest.a');
  assert.equal(selfTest.b, 0, 'selfTest.b');
  const firstHalf = cubic.subdivided(0.5)[0];
  const firstTest = Cubic.getOverlaps(cubic, firstHalf)[0];
  assert.equal(firstTest.a, 2, 'firstTest.a');
  assert.equal(firstTest.b, 0, 'firstTest.b');
  assert.ok(cubic.positionAt(0.25).distance(firstHalf.positionAt(0.25 * firstTest.a + firstTest.b)) < 1e-6, 'firstHalf t=0.25 check');
  const secondHalf = cubic.subdivided(0.5)[1];
  const secondTest = Cubic.getOverlaps(cubic, secondHalf)[0];
  assert.equal(secondTest.a, 2, 'secondTest.a');
  assert.equal(secondTest.b, -1, 'secondTest.b');
  assert.ok(cubic.positionAt(0.75).distance(secondHalf.positionAt(0.75 * secondTest.a + secondTest.b)) < 1e-6, 'secondHalf t=0.75 check');
  const negativeTest = Cubic.getOverlaps(cubic, otherCubic);
  assert.equal(negativeTest.length, 0, 'negativeTest');
});
QUnit.test('Quadratic overlap', assert => {
  const quadratic = new Quadratic(new Vector2(0, 0), new Vector2(0, 3), new Vector2(10, 9));
  const otherQuadratic = new Quadratic(new Vector2(10, 0), new Vector2(0, 3), new Vector2(10, 9));
  const selfTest = Quadratic.getOverlaps(quadratic, quadratic)[0];
  assert.equal(selfTest.a, 1, 'selfTest.a');
  assert.equal(selfTest.b, 0, 'selfTest.b');
  const firstHalf = quadratic.subdivided(0.5)[0];
  const firstTest = Quadratic.getOverlaps(quadratic, firstHalf)[0];
  assert.equal(firstTest.a, 2, 'firstTest.a');
  assert.equal(firstTest.b, 0, 'firstTest.b');
  assert.ok(quadratic.positionAt(0.25).distance(firstHalf.positionAt(0.25 * firstTest.a + firstTest.b)) < 1e-6, 'firstHalf t=0.25 check');
  const secondHalf = quadratic.subdivided(0.5)[1];
  const secondTest = Quadratic.getOverlaps(quadratic, secondHalf)[0];
  assert.equal(secondTest.a, 2, 'secondTest.a');
  assert.equal(secondTest.b, -1, 'secondTest.b');
  assert.ok(quadratic.positionAt(0.75).distance(secondHalf.positionAt(0.75 * secondTest.a + secondTest.b)) < 1e-6, 'secondHalf t=0.75 check');
  const negativeTest = Quadratic.getOverlaps(quadratic, otherQuadratic);
  assert.equal(negativeTest.length, 0, 'negativeTest');
});
QUnit.test('Linear overlap', assert => {
  const line = new Line(new Vector2(0, 0), new Vector2(10, 9));
  const otherLine = new Line(new Vector2(10, 0), new Vector2(10, 9));
  const selfTest = Line.getOverlaps(line, line)[0];
  assert.equal(selfTest.a, 1, 'selfTest.a');
  assert.equal(selfTest.b, 0, 'selfTest.b');
  const firstHalf = line.subdivided(0.5)[0];
  const firstTest = Line.getOverlaps(line, firstHalf)[0];
  assert.equal(firstTest.a, 2, 'firstTest.a');
  assert.equal(firstTest.b, 0, 'firstTest.b');
  assert.ok(line.positionAt(0.25).distance(firstHalf.positionAt(0.25 * firstTest.a + firstTest.b)) < 1e-6, 'firstHalf t=0.25 check');
  const secondHalf = line.subdivided(0.5)[1];
  const secondTest = Line.getOverlaps(line, secondHalf)[0];
  assert.equal(secondTest.a, 2, 'secondTest.a');
  assert.equal(secondTest.b, -1, 'secondTest.b');
  assert.ok(line.positionAt(0.75).distance(secondHalf.positionAt(0.75 * secondTest.a + secondTest.b)) < 1e-6, 'secondHalf t=0.75 check');
  const negativeTest = Line.getOverlaps(line, otherLine);
  assert.equal(negativeTest.length, 0, 'negativeTest');
});
QUnit.test('Closure of common Shape commands', assert => {
  assert.ok(new Shape().circle(0, 0, 10).subpaths[0].closed, 'circle should result in a closed subpath');
  assert.ok(new Shape().ellipse(0, 0, 10, 20, Math.PI / 4).subpaths[0].closed, 'ellipse should result in a closed subpath');
  assert.ok(new Shape().rect(0, 0, 100, 50).subpaths[0].closed, 'rect should result in a closed subpath');
  assert.ok(new Shape().roundRect(0, 0, 100, 50, 3, 4).subpaths[0].closed, 'roundRect should result in a closed subpath');
  assert.ok(new Shape().polygon([new Vector2(0, 0), new Vector2(10, 0), new Vector2(0, 10)]).subpaths[0].closed, 'polygon should result in a closed subpath');
  assert.ok(Shape.regularPolygon(6, 10).subpaths[0].closed, 'regularPolygon should result in a closed subpath');
});
QUnit.test('Circle-circle intersection', assert => {
  // Accuracy assertions are contained in the intersection function

  assert.equal(Arc.getCircleIntersectionPoint(new Vector2(0, 0), 10, new Vector2(20, 0), 10).length, 1, 'two 10-radii adjacent');
  assert.equal(Arc.getCircleIntersectionPoint(new Vector2(0, 0), 10, new Vector2(21, 0), 10).length, 0, 'two 10-radii separated');
  assert.equal(Arc.getCircleIntersectionPoint(new Vector2(0, 0), 10, new Vector2(30, 0), 20).length, 1, 'two 20-radii adjacent');
  assert.equal(Arc.getCircleIntersectionPoint(new Vector2(0, 0), 10, new Vector2(31, 0), 20).length, 0, 'two 20-radii separated');
  assert.equal(Arc.getCircleIntersectionPoint(new Vector2(0, 0), 10, new Vector2(0, 0), 8).length, 0, 'inner center');
  assert.equal(Arc.getCircleIntersectionPoint(new Vector2(0, 0), 10, new Vector2(1, 0), 5).length, 0, 'inner offset');
  assert.equal(Arc.getCircleIntersectionPoint(new Vector2(0, 0), 10, new Vector2(5, 0), 5).length, 1, 'inner touching');
  function r() {
    const randomSource = Math.random; // (We can't get joist's random reference here)
    return Math.ceil(randomSource() * 20);
  }
  for (let i = 0; i < 200; i++) {
    Arc.getCircleIntersectionPoint(new Vector2(r(), r()), r(), new Vector2(r(), r()), r());
  }
});
QUnit.test('Close linear overlap', assert => {
  const a = new Line(new Vector2(0, 0), new Vector2(6.123233995736766e-16, -10));
  const b = new Line(new Vector2(-1.8369701987210296e-15, -10), new Vector2(0, 0));
  assert.ok(Line.getOverlaps(a, b).length === 1, 'Should find one continuous overlap');
});
QUnit.test('Partial ellipse overlap union', assert => {
  const a = new Shape();
  const b = new Shape();
  a.ellipticalArc(50, 50, 30, 50, 0.124, 0, Math.PI, false).close();
  b.ellipticalArc(50, 50, 30, 50, 0.124, Math.PI * 0.5, Math.PI * 2, false).close();
  testUnion(assert, a, b, 1, 'Partial ellipse union');
});
QUnit.test('Elliptical overlaps', assert => {
  const a = new EllipticalArc(Vector2.ZERO, 60, 40, 0, 0, Math.PI, false);
  const b = new EllipticalArc(Vector2.ZERO, 60, 40, 0, 0.5 * Math.PI, 1.5 * Math.PI, false);
  const c = new EllipticalArc(Vector2.ZERO, 40, 60, -Math.PI / 2, 0, 2 * Math.PI, false);
  const d = new EllipticalArc(Vector2.ZERO, 60, 40, 0, 0.8 * Math.PI, 2.2 * Math.PI, false);
  assert.equal(EllipticalArc.getOverlaps(a, b).length, 1, 'Normal partial overlap');
  assert.equal(EllipticalArc.getOverlaps(a, c).length, 1, 'Overlap with opposite rotation');
  assert.equal(EllipticalArc.getOverlaps(a, d).length, 2, 'Double overlap');
});
QUnit.test('Elliptical intersection at origin', assert => {
  const a = new EllipticalArc(new Vector2(20, 0), 20, 30, 0, 0.9 * Math.PI, 1.1 * Math.PI, false);
  const b = new EllipticalArc(new Vector2(0, 20), 30, 20, 0, 1.4 * Math.PI, 1.6 * Math.PI, false);
  const intersections = EllipticalArc.intersect(a, b);
  assert.equal(intersections.length, 1, 'Single intersection');
  if (intersections.length) {
    assert.ok(intersections[0].point.equalsEpsilon(Vector2.ZERO, 1e-10), 'Intersection at 0');
  }
});
QUnit.test('Elliptical intersection when split', assert => {
  const arc = new EllipticalArc(new Vector2(20, 0), 20, 30, 0, 0.3 * Math.PI, 1.1 * Math.PI, false);
  const subarcs = arc.subdivided(0.5);
  const intersections = EllipticalArc.intersect(subarcs[0], subarcs[1]);
  assert.equal(intersections.length, 1, 'Single intersection');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlJheTIiLCJWZWN0b3IyIiwiQXJjIiwiQ3ViaWMiLCJFbGxpcHRpY2FsQXJjIiwiTGluZSIsIlF1YWRyYXRpYyIsIlNoYXBlIiwiUVVuaXQiLCJtb2R1bGUiLCJkYXRhVG9DYW52YXMiLCJzbmFwc2hvdCIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIndpZHRoIiwiaGVpZ2h0IiwiY29udGV4dCIsImdldENvbnRleHQiLCJwdXRJbWFnZURhdGEiLCIkIiwiY3NzIiwiZGF0YUVxdWFscyIsImFzc2VydCIsImEiLCJiIiwidGhyZXNob2xkIiwibWVzc2FnZSIsImV4dHJhRG9tIiwiaXNFcXVhbCIsImxhcmdlc3REaWZmZXJlbmNlIiwidG90YWxEaWZmZXJlbmNlIiwiY29sb3JEaWZmRGF0YSIsImNyZWF0ZUltYWdlRGF0YSIsImFscGhhRGlmZkRhdGEiLCJpIiwiZGF0YSIsImxlbmd0aCIsImRpZmYiLCJNYXRoIiwiYWJzIiwiYWxwaGFJbmRleCIsImFscGhhTXVsdGlwbGllZERpZmYiLCJtYXgiLCJhdmVyYWdlRGlmZmVyZW5jZSIsImRpc3BsYXkiLCJub3RlIiwidGV4dCIsImFwcGVuZCIsImRpZmZlcmVuY2VEaXYiLCJvayIsInRlc3RVbmlvbiIsImFTaGFwZSIsImJTaGFwZSIsIm5vcm1hbENhbnZhcyIsIm5vcm1hbENvbnRleHQiLCJmaWxsU3R5bGUiLCJiZWdpblBhdGgiLCJ3cml0ZVRvQ29udGV4dCIsImZpbGwiLCJzaGFwZSIsInNoYXBlVW5pb24iLCJ0ZXN0Q2FudmFzIiwidGVzdENvbnRleHQiLCJub3JtYWxEYXRhIiwiZ2V0SW1hZ2VEYXRhIiwidGVzdERhdGEiLCJ0ZXN0RGlmZmVyZW5jZSIsImZpbGxSZWN0Iiwic2hhcGVEaWZmZXJlbmNlIiwidGVzdCIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwicmVjdCIsImMiLCJjdWJpY0N1cnZlVG8iLCJhcmMiLCJQSSIsInF1YWRyYXRpY0N1cnZlVG8iLCJ0cmFuc2Zvcm1lZCIsInNjYWxpbmciLCJhYiIsImN1cnZlIiwibGVmdCIsInN1YmRpdmlkZWQiLCJyaWdodCIsInN0YXJ0IiwieCIsInkiLCJjb250cm9sMSIsImNvbnRyb2wyIiwiZW5kIiwiY29udHJvbCIsImNpcmNsZSIsImRlc2VyaWFsaXplIiwidHlwZSIsInN1YnBhdGhzIiwic2VnbWVudHMiLCJzdGFydFgiLCJzdGFydFkiLCJlbmRYIiwiZW5kWSIsImNlbnRlclgiLCJjZW50ZXJZIiwicmFkaXVzIiwic3RhcnRBbmdsZSIsImVuZEFuZ2xlIiwiYW50aWNsb2Nrd2lzZSIsInBvaW50cyIsImNsb3NlZCIsImxpbmUiLCJlcXVhbCIsIndpbmRpbmdJbnRlcnNlY3Rpb24iLCJub3JtYWxpemVkIiwicmVjdGFuZ2xlIiwiY29udGFpbnNQb2ludCIsImJvdW5kcyIsImlzRmluaXRlIiwiaXNFbXB0eSIsImVsbGlwdGljYWxBcmMiLCJwb2ludCIsInJheSIsImludGVyc2VjdHNCb3VuZHMiLCJpbnRlcmlvckludGVyc2VjdHNMaW5lU2VnbWVudCIsImN1YmljIiwib3RoZXJDdWJpYyIsInNlbGZUZXN0IiwiZ2V0T3ZlcmxhcHMiLCJmaXJzdEhhbGYiLCJmaXJzdFRlc3QiLCJwb3NpdGlvbkF0IiwiZGlzdGFuY2UiLCJzZWNvbmRIYWxmIiwic2Vjb25kVGVzdCIsIm5lZ2F0aXZlVGVzdCIsInF1YWRyYXRpYyIsIm90aGVyUXVhZHJhdGljIiwib3RoZXJMaW5lIiwiZWxsaXBzZSIsInJvdW5kUmVjdCIsInBvbHlnb24iLCJyZWd1bGFyUG9seWdvbiIsImdldENpcmNsZUludGVyc2VjdGlvblBvaW50IiwiciIsInJhbmRvbVNvdXJjZSIsInJhbmRvbSIsImNlaWwiLCJaRVJPIiwiZCIsImludGVyc2VjdGlvbnMiLCJpbnRlcnNlY3QiLCJlcXVhbHNFcHNpbG9uIiwic3ViYXJjcyJdLCJzb3VyY2VzIjpbIlNoYXBlVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2hhcGUgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFJheTIgZnJvbSAnLi4vLi4vZG90L2pzL1JheTIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IEFyYywgQ3ViaWMsIEVsbGlwdGljYWxBcmMsIExpbmUsIFF1YWRyYXRpYywgU2hhcGUgfSBmcm9tICcuL2ltcG9ydHMuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnU2hhcGUnICk7XHJcblxyXG5mdW5jdGlvbiBkYXRhVG9DYW52YXMoIHNuYXBzaG90ICkge1xyXG5cclxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIGNhbnZhcy53aWR0aCA9IHNuYXBzaG90LndpZHRoO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSBzbmFwc2hvdC5oZWlnaHQ7XHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgY29udGV4dC5wdXRJbWFnZURhdGEoIHNuYXBzaG90LCAwLCAwICk7XHJcbiAgJCggY2FudmFzICkuY3NzKCAnYm9yZGVyJywgJzFweCBzb2xpZCBibGFjaycgKTtcclxuICByZXR1cm4gY2FudmFzO1xyXG59XHJcblxyXG4vLyBjb21wYXJlcyB0d28gcGl4ZWwgc25hcHNob3RzIHtJbWFnZURhdGF9IGFuZCB1c2VzIHRoZSBxdW5pdCdzIGFzc2VydCB0byB2ZXJpZnkgdGhleSBhcmUgdGhlIHNhbWVcclxuZnVuY3Rpb24gZGF0YUVxdWFscyggYXNzZXJ0LCBhLCBiLCB0aHJlc2hvbGQsIG1lc3NhZ2UsIGV4dHJhRG9tICkge1xyXG5cclxuICBsZXQgaXNFcXVhbCA9IGEud2lkdGggPT09IGIud2lkdGggJiYgYS5oZWlnaHQgPT09IGIuaGVpZ2h0O1xyXG4gIGxldCBsYXJnZXN0RGlmZmVyZW5jZSA9IDA7XHJcbiAgbGV0IHRvdGFsRGlmZmVyZW5jZSA9IDA7XHJcbiAgY29uc3QgY29sb3JEaWZmRGF0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICkuZ2V0Q29udGV4dCggJzJkJyApLmNyZWF0ZUltYWdlRGF0YSggYS53aWR0aCwgYS5oZWlnaHQgKTtcclxuICBjb25zdCBhbHBoYURpZmZEYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKS5nZXRDb250ZXh0KCAnMmQnICkuY3JlYXRlSW1hZ2VEYXRhKCBhLndpZHRoLCBhLmhlaWdodCApO1xyXG4gIGlmICggaXNFcXVhbCApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGEuZGF0YS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKCBhLmRhdGFbIGkgXSAtIGIuZGF0YVsgaSBdICk7XHJcbiAgICAgIGlmICggaSAlIDQgPT09IDMgKSB7XHJcbiAgICAgICAgY29sb3JEaWZmRGF0YS5kYXRhWyBpIF0gPSAyNTU7XHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIF0gPSAyNTU7XHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIC0gMyBdID0gZGlmZjsgLy8gcmVkXHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIC0gMiBdID0gZGlmZjsgLy8gZ3JlZW5cclxuICAgICAgICBhbHBoYURpZmZEYXRhLmRhdGFbIGkgLSAxIF0gPSBkaWZmOyAvLyBibHVlXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29sb3JEaWZmRGF0YS5kYXRhWyBpIF0gPSBkaWZmO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGFscGhhSW5kZXggPSAoIGkgLSAoIGkgJSA0ICkgKyAzICk7XHJcbiAgICAgIC8vIGdyYWIgdGhlIGFzc29jaWF0ZWQgYWxwaGEgY2hhbm5lbCBhbmQgbXVsdGlwbHkgaXQgdGltZXMgdGhlIGRpZmZcclxuICAgICAgY29uc3QgYWxwaGFNdWx0aXBsaWVkRGlmZiA9ICggaSAlIDQgPT09IDMgKSA/IGRpZmYgOiBkaWZmICogKCBhLmRhdGFbIGFscGhhSW5kZXggXSAvIDI1NSApICogKCBiLmRhdGFbIGFscGhhSW5kZXggXSAvIDI1NSApO1xyXG5cclxuICAgICAgdG90YWxEaWZmZXJlbmNlICs9IGFscGhhTXVsdGlwbGllZERpZmY7XHJcbiAgICAgIC8vIGlmICggYWxwaGFNdWx0aXBsaWVkRGlmZiA+IHRocmVzaG9sZCApIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coIG1lc3NhZ2UgKyAnOiAnICsgTWF0aC5hYnMoIGEuZGF0YVtpXSAtIGIuZGF0YVtpXSApICk7XHJcbiAgICAgIGxhcmdlc3REaWZmZXJlbmNlID0gTWF0aC5tYXgoIGxhcmdlc3REaWZmZXJlbmNlLCBhbHBoYU11bHRpcGxpZWREaWZmICk7XHJcbiAgICAgIC8vIGlzRXF1YWwgPSBmYWxzZTtcclxuICAgICAgLy8gYnJlYWs7XHJcbiAgICAgIC8vIH1cclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgYXZlcmFnZURpZmZlcmVuY2UgPSB0b3RhbERpZmZlcmVuY2UgLyAoIDQgKiBhLndpZHRoICogYS5oZWlnaHQgKTtcclxuICBpZiAoIGF2ZXJhZ2VEaWZmZXJlbmNlID4gdGhyZXNob2xkICkge1xyXG4gICAgY29uc3QgZGlzcGxheSA9ICQoICcjZGlzcGxheScgKTtcclxuICAgIC8vIGhlYWRlclxyXG4gICAgY29uc3Qgbm90ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdoMicgKTtcclxuICAgICQoIG5vdGUgKS50ZXh0KCBtZXNzYWdlICk7XHJcbiAgICBkaXNwbGF5LmFwcGVuZCggbm90ZSApO1xyXG4gICAgY29uc3QgZGlmZmVyZW5jZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICAkKCBkaWZmZXJlbmNlRGl2ICkudGV4dCggYChhY3R1YWwpIChleHBlY3RlZCkgKGNvbG9yIGRpZmYpIChhbHBoYSBkaWZmKSBEaWZmcyBtYXg6ICR7bGFyZ2VzdERpZmZlcmVuY2V9LCBhdmVyYWdlOiAke2F2ZXJhZ2VEaWZmZXJlbmNlfWAgKTtcclxuICAgIGRpc3BsYXkuYXBwZW5kKCBkaWZmZXJlbmNlRGl2ICk7XHJcblxyXG4gICAgZGlzcGxheS5hcHBlbmQoIGRhdGFUb0NhbnZhcyggYSApICk7XHJcbiAgICBkaXNwbGF5LmFwcGVuZCggZGF0YVRvQ2FudmFzKCBiICkgKTtcclxuICAgIGRpc3BsYXkuYXBwZW5kKCBkYXRhVG9DYW52YXMoIGNvbG9yRGlmZkRhdGEgKSApO1xyXG4gICAgZGlzcGxheS5hcHBlbmQoIGRhdGFUb0NhbnZhcyggYWxwaGFEaWZmRGF0YSApICk7XHJcblxyXG4gICAgaWYgKCBleHRyYURvbSApIHtcclxuICAgICAgZGlzcGxheS5hcHBlbmQoIGV4dHJhRG9tICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZm9yIGEgbGluZS1icmVha1xyXG4gICAgZGlzcGxheS5hcHBlbmQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICkgKTtcclxuXHJcbiAgICBpc0VxdWFsID0gZmFsc2U7XHJcbiAgfVxyXG4gIGFzc2VydC5vayggaXNFcXVhbCwgbWVzc2FnZSApO1xyXG4gIHJldHVybiBpc0VxdWFsO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0ZXN0VW5pb24oIGFzc2VydCwgYVNoYXBlLCBiU2hhcGUsIHRocmVzaG9sZCwgbWVzc2FnZSApIHtcclxuICBjb25zdCBub3JtYWxDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIG5vcm1hbENhbnZhcy53aWR0aCA9IDEwMDtcclxuICBub3JtYWxDYW52YXMuaGVpZ2h0ID0gMTAwO1xyXG4gIGNvbnN0IG5vcm1hbENvbnRleHQgPSBub3JtYWxDYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xyXG4gIG5vcm1hbENvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJztcclxuXHJcbiAgbm9ybWFsQ29udGV4dC5iZWdpblBhdGgoKTtcclxuICBhU2hhcGUud3JpdGVUb0NvbnRleHQoIG5vcm1hbENvbnRleHQgKTtcclxuICBub3JtYWxDb250ZXh0LmZpbGwoKTtcclxuXHJcbiAgbm9ybWFsQ29udGV4dC5iZWdpblBhdGgoKTtcclxuICBiU2hhcGUud3JpdGVUb0NvbnRleHQoIG5vcm1hbENvbnRleHQgKTtcclxuICBub3JtYWxDb250ZXh0LmZpbGwoKTtcclxuXHJcbiAgLy8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggbm9ybWFsQ2FudmFzICk7XHJcblxyXG4gIGNvbnN0IHNoYXBlID0gYVNoYXBlLnNoYXBlVW5pb24oIGJTaGFwZSApO1xyXG5cclxuICBjb25zdCB0ZXN0Q2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICB0ZXN0Q2FudmFzLndpZHRoID0gMTAwO1xyXG4gIHRlc3RDYW52YXMuaGVpZ2h0ID0gMTAwO1xyXG4gIGNvbnN0IHRlc3RDb250ZXh0ID0gdGVzdENhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgdGVzdENvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJztcclxuXHJcbiAgdGVzdENvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgc2hhcGUud3JpdGVUb0NvbnRleHQoIHRlc3RDb250ZXh0ICk7XHJcbiAgdGVzdENvbnRleHQuZmlsbCgpO1xyXG5cclxuICAvLyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0ZXN0Q2FudmFzICk7XHJcblxyXG4gIGNvbnN0IG5vcm1hbERhdGEgPSBub3JtYWxDb250ZXh0LmdldEltYWdlRGF0YSggMCwgMCwgMTAwLCAxMDAgKTtcclxuICBjb25zdCB0ZXN0RGF0YSA9IHRlc3RDb250ZXh0LmdldEltYWdlRGF0YSggMCwgMCwgMTAwLCAxMDAgKTtcclxuXHJcbiAgZGF0YUVxdWFscyggYXNzZXJ0LCBub3JtYWxEYXRhLCB0ZXN0RGF0YSwgdGhyZXNob2xkLCBtZXNzYWdlICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRlc3REaWZmZXJlbmNlKCBhc3NlcnQsIGFTaGFwZSwgYlNoYXBlLCB0aHJlc2hvbGQsIG1lc3NhZ2UgKSB7XHJcbiAgY29uc3Qgbm9ybWFsQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICBub3JtYWxDYW52YXMud2lkdGggPSAxMDA7XHJcbiAgbm9ybWFsQ2FudmFzLmhlaWdodCA9IDEwMDtcclxuICBjb25zdCBub3JtYWxDb250ZXh0ID0gbm9ybWFsQ2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICBub3JtYWxDb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XHJcbiAgbm9ybWFsQ29udGV4dC5maWxsUmVjdCggMCwgMCwgMTAwLCAxMDAgKTtcclxuICBub3JtYWxDb250ZXh0LmZpbGxTdHlsZSA9ICdibGFjayc7XHJcblxyXG4gIG5vcm1hbENvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgYVNoYXBlLndyaXRlVG9Db250ZXh0KCBub3JtYWxDb250ZXh0ICk7XHJcbiAgbm9ybWFsQ29udGV4dC5maWxsKCk7XHJcblxyXG4gIG5vcm1hbENvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcclxuXHJcbiAgbm9ybWFsQ29udGV4dC5iZWdpblBhdGgoKTtcclxuICBiU2hhcGUud3JpdGVUb0NvbnRleHQoIG5vcm1hbENvbnRleHQgKTtcclxuICBub3JtYWxDb250ZXh0LmZpbGwoKTtcclxuXHJcbiAgLy8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggbm9ybWFsQ2FudmFzICk7XHJcblxyXG4gIGNvbnN0IHNoYXBlID0gYVNoYXBlLnNoYXBlRGlmZmVyZW5jZSggYlNoYXBlICk7XHJcblxyXG4gIGNvbnN0IHRlc3RDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIHRlc3RDYW52YXMud2lkdGggPSAxMDA7XHJcbiAgdGVzdENhbnZhcy5oZWlnaHQgPSAxMDA7XHJcbiAgY29uc3QgdGVzdENvbnRleHQgPSB0ZXN0Q2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICB0ZXN0Q29udGV4dC5maWxsU3R5bGUgPSAnd2hpdGUnO1xyXG4gIHRlc3RDb250ZXh0LmZpbGxSZWN0KCAwLCAwLCAxMDAsIDEwMCApO1xyXG4gIHRlc3RDb250ZXh0LmZpbGxTdHlsZSA9ICdibGFjayc7XHJcblxyXG4gIHRlc3RDb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gIHNoYXBlLndyaXRlVG9Db250ZXh0KCB0ZXN0Q29udGV4dCApO1xyXG4gIHRlc3RDb250ZXh0LmZpbGwoKTtcclxuXHJcbiAgLy8gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggdGVzdENhbnZhcyApO1xyXG5cclxuICBjb25zdCBub3JtYWxEYXRhID0gbm9ybWFsQ29udGV4dC5nZXRJbWFnZURhdGEoIDAsIDAsIDEwMCwgMTAwICk7XHJcbiAgY29uc3QgdGVzdERhdGEgPSB0ZXN0Q29udGV4dC5nZXRJbWFnZURhdGEoIDAsIDAsIDEwMCwgMTAwICk7XHJcblxyXG4gIGRhdGFFcXVhbHMoIGFzc2VydCwgbm9ybWFsRGF0YSwgdGVzdERhdGEsIHRocmVzaG9sZCwgbWVzc2FnZSApO1xyXG59XHJcblxyXG5RVW5pdC50ZXN0KCAnVHJpYW5nbGUgdW5pb24nLCBhc3NlcnQgPT4ge1xyXG4gIHRlc3RVbmlvbiggYXNzZXJ0LFxyXG4gICAgbmV3IFNoYXBlKCkubW92ZVRvKCAxMCwgMTAgKS5saW5lVG8oIDkwLCAxMCApLmxpbmVUbyggNTAsIDkwICkuY2xvc2UoKSxcclxuICAgIG5ldyBTaGFwZSgpLm1vdmVUbyggMTAsIDkwICkubGluZVRvKCA5MCwgOTAgKS5saW5lVG8oIDUwLCAxMCApLmNsb3NlKCksXHJcbiAgICAxLCAnVW5pb24gb2Ygb3Bwb3NpdGUgb3JpZW50YXRpb24gdHJpYW5nbGVzJ1xyXG4gICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdDQUcgdW5pb24gIzEnLCBhc3NlcnQgPT4ge1xyXG4gIHRlc3RVbmlvbiggYXNzZXJ0LFxyXG4gICAgbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAwICkubGluZVRvKCAxMCwgMTAgKS5saW5lVG8oIDIwLCAwICkuY2xvc2UoKVxyXG4gICAgICAubW92ZVRvKCA0LCAyICkubGluZVRvKCAxNiwgMiApLmxpbmVUbyggMTAsIDYgKS5jbG9zZSgpLFxyXG4gICAgbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggMCwgOCApLmxpbmVUbyggMTAsIDE4ICkubGluZVRvKCAyMCwgOCApLmNsb3NlKClcclxuICAgICAgLm1vdmVUbyggMCwgMjAgKS5saW5lVG8oIDIwLCAyNSApLmxpbmVUbyggMjAsIDIwICkubGluZVRvKCAwLCAyNSApLmNsb3NlKClcclxuICAgICAgLm1vdmVUbyggMCwgMjUgKS5saW5lVG8oIDIwLCAzMCApLmxpbmVUbyggMjAsIDI1ICkubGluZVRvKCAwLCAzMCApLmNsb3NlKCksXHJcbiAgICAxLCAnQ0FHIHRlc3QgIzEnXHJcbiAgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0NBRyB1bmlvbiAjMicsIGFzc2VydCA9PiB7XHJcbiAgdGVzdFVuaW9uKCBhc3NlcnQsXHJcbiAgICBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIDAgKS5saW5lVG8oIDEwLCAwICkubGluZVRvKCAxMCwgMTAgKS5saW5lVG8oIDAsIDEwICkuY2xvc2UoKVxyXG4gICAgICAubW92ZVRvKCA1LCAxMCApLmxpbmVUbyggMTUsIDEwICkubGluZVRvKCAxNSwgMjAgKS5saW5lVG8oIDUsIDIwICkuY2xvc2UoKSxcclxuICAgIG5ldyBTaGFwZSgpLm1vdmVUbyggMTAsIDAgKS5saW5lVG8oIDIwLCAwICkubGluZVRvKCAyMCwgMTAgKS5saW5lVG8oIDEwLCAxMCApLmNsb3NlKClcclxuICAgICAgLm1vdmVUbyggMjAsIDAgKS5saW5lVG8oIDIwLCAxMCApLmxpbmVUbyggMzAsIDEwICkubGluZVRvKCAzMCwgMCApLmNsb3NlKCksXHJcbiAgICAxLCAnQ0FHIHRlc3QgIzInXHJcbiAgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0RpZmZlcmVuY2UgdGVzdCcsIGFzc2VydCA9PiB7XHJcbiAgdGVzdERpZmZlcmVuY2UoIGFzc2VydCxcclxuICAgIG5ldyBTaGFwZSgpLnJlY3QoIDAsIDAsIDEwMCwgMTAgKS5yZWN0KCAwLCAyMCwgMTAwLCAxMCApLnJlY3QoIDAsIDQwLCAxMDAsIDEwICkucmVjdCggMCwgNjAsIDEwMCwgMTAgKS5yZWN0KCAwLCA4MCwgMTAwLCAxMCApLFxyXG4gICAgbmV3IFNoYXBlKCkucmVjdCggMCwgMCwgMTAsIDEwMCApLnJlY3QoIDIwLCAwLCAxMCwgMTAwICkucmVjdCggNDAsIDAsIDEwLCAxMDAgKS5yZWN0KCA2MCwgMCwgMTAsIDEwMCApLnJlY3QoIDgwLCAwLCAxMCwgMTAwICksXHJcbiAgICAxLCAnRGlmZmVyZW5jZSB0ZXN0J1xyXG4gICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdDQUcgbXVsdGlwbGUgdGVzdCcsIGFzc2VydCA9PiB7XHJcbiAgbGV0IGEgPSBuZXcgU2hhcGUoKTtcclxuICBsZXQgYiA9IG5ldyBTaGFwZSgpO1xyXG4gIGxldCBjID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gIGEubW92ZVRvKCAwLCAyICkuY3ViaWNDdXJ2ZVRvKCAyMiwgMiwgLTEsIDEwLCAyNSwgMTAgKS5saW5lVG8oIDI1LCAxNi41ICkubGluZVRvKCAwLCAxNi41ICkuY2xvc2UoKTtcclxuICBhLm1vdmVUbyggMCwgMTAgKS5saW5lVG8oIDEwLCAxMCApLmxpbmVUbyggMTAsIDI1ICkubGluZVRvKCAwLCAyNSApLmNsb3NlKCk7XHJcbiAgYS5tb3ZlVG8oIDEzLCAyNSApLmFyYyggMTAsIDI1LCAzLCAwLCBNYXRoLlBJICogMS4zLCBmYWxzZSApLmNsb3NlKCk7XHJcblxyXG4gIGIubW92ZVRvKCAwLCAwICkubGluZVRvKCAzMCwgMTYuNSApLmxpbmVUbyggMzAsIDAgKS5jbG9zZSgpO1xyXG4gIGIubW92ZVRvKCAxNSwgMiApLmxpbmVUbyggMjUsIDIgKS5saW5lVG8oIDI1LCA3ICkucXVhZHJhdGljQ3VydmVUbyggMTUsIDcsIDE1LCAyICkuY2xvc2UoKTtcclxuXHJcbiAgYy5yZWN0KCAyMCwgMCwgMywgMjAgKTtcclxuXHJcbiAgYSA9IGEudHJhbnNmb3JtZWQoIE1hdHJpeDMuc2NhbGluZyggMyApICk7XHJcbiAgYiA9IGIudHJhbnNmb3JtZWQoIE1hdHJpeDMuc2NhbGluZyggMyApICk7XHJcbiAgYyA9IGMudHJhbnNmb3JtZWQoIE1hdHJpeDMuc2NhbGluZyggMyApICk7XHJcblxyXG4gIHRlc3RVbmlvbiggYXNzZXJ0LCBhLCBiLCAxLCAnQ0FHIG11bHRpcGxlICMxJyApO1xyXG5cclxuICBjb25zdCBhYiA9IGEuc2hhcGVVbmlvbiggYiApO1xyXG5cclxuICB0ZXN0RGlmZmVyZW5jZSggYXNzZXJ0LCBhYiwgYywgMSwgJ0NBRyBtdWx0aXBsZSAjMicgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1Rlc3RpbmcgY3ViaWMgb3ZlcmxhcCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYSA9IG5ldyBTaGFwZSgpO1xyXG4gIGNvbnN0IGIgPSBuZXcgU2hhcGUoKTtcclxuXHJcbiAgY29uc3QgY3VydmUgPSBuZXcgQ3ViaWMoIG5ldyBWZWN0b3IyKCAwLCAwICksIG5ldyBWZWN0b3IyKCAxMCwgMCApLCBuZXcgVmVjdG9yMiggMTAsIDEwICksIG5ldyBWZWN0b3IyKCAyMCwgMTAgKSApO1xyXG5cclxuICBjb25zdCBsZWZ0ID0gY3VydmUuc3ViZGl2aWRlZCggMC43IClbIDAgXTtcclxuICBjb25zdCByaWdodCA9IGN1cnZlLnN1YmRpdmlkZWQoIDAuMyApWyAxIF07XHJcblxyXG4gIGEubW92ZVRvKCAwLCAxMCApLmxpbmVUbyggbGVmdC5zdGFydC54LCBsZWZ0LnN0YXJ0LnkgKS5jdWJpY0N1cnZlVG8oIGxlZnQuY29udHJvbDEueCwgbGVmdC5jb250cm9sMS55LCBsZWZ0LmNvbnRyb2wyLngsIGxlZnQuY29udHJvbDIueSwgbGVmdC5lbmQueCwgbGVmdC5lbmQueSApLmNsb3NlKCk7XHJcbiAgYi5tb3ZlVG8oIDIwLCAwICkubGluZVRvKCByaWdodC5zdGFydC54LCByaWdodC5zdGFydC55ICkuY3ViaWNDdXJ2ZVRvKCByaWdodC5jb250cm9sMS54LCByaWdodC5jb250cm9sMS55LCByaWdodC5jb250cm9sMi54LCByaWdodC5jb250cm9sMi55LCByaWdodC5lbmQueCwgcmlnaHQuZW5kLnkgKS5jbG9zZSgpO1xyXG5cclxuICB0ZXN0VW5pb24oIGFzc2VydCwgYSwgYiwgMSwgJ0N1YmljIG92ZXJsYXAgdW5pb24nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUZXN0aW5nIHF1YWRyYXRpYyBvdmVybGFwJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IFNoYXBlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICBjb25zdCBjdXJ2ZSA9IG5ldyBRdWFkcmF0aWMoIG5ldyBWZWN0b3IyKCAwLCAwICksIG5ldyBWZWN0b3IyKCAxMCwgMCApLCBuZXcgVmVjdG9yMiggMTAsIDEwICkgKTtcclxuXHJcbiAgY29uc3QgbGVmdCA9IGN1cnZlLnN1YmRpdmlkZWQoIDAuNyApWyAwIF07XHJcbiAgY29uc3QgcmlnaHQgPSBjdXJ2ZS5zdWJkaXZpZGVkKCAwLjMgKVsgMSBdO1xyXG5cclxuICBhLm1vdmVUbyggMCwgMTAgKS5saW5lVG8oIGxlZnQuc3RhcnQueCwgbGVmdC5zdGFydC55ICkucXVhZHJhdGljQ3VydmVUbyggbGVmdC5jb250cm9sLngsIGxlZnQuY29udHJvbC55LCBsZWZ0LmVuZC54LCBsZWZ0LmVuZC55ICkuY2xvc2UoKTtcclxuICBiLm1vdmVUbyggMjAsIDAgKS5saW5lVG8oIHJpZ2h0LnN0YXJ0LngsIHJpZ2h0LnN0YXJ0LnkgKS5xdWFkcmF0aWNDdXJ2ZVRvKCByaWdodC5jb250cm9sLngsIHJpZ2h0LmNvbnRyb2wueSwgcmlnaHQuZW5kLngsIHJpZ2h0LmVuZC55ICkuY2xvc2UoKTtcclxuXHJcbiAgdGVzdFVuaW9uKCBhc3NlcnQsIGEsIGIsIDEsICdRdWFkcmF0aWMgb3ZlcmxhcCB1bmlvbicgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0N1YmljIHNlbGYtaW50ZXJzZWN0aW9uJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IFNoYXBlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICBhLm1vdmVUbyggMTAsIDAgKS5jdWJpY0N1cnZlVG8oIDMwLCAxMCwgMCwgMTAsIDIwLCAwICkuY2xvc2UoKTtcclxuICBiLnJlY3QoIDAsIDAsIDUsIDUgKTtcclxuXHJcbiAgdGVzdFVuaW9uKCBhc3NlcnQsIGEsIGIsIDEsICdDdWJpYyBzZWxmLWludGVyc2VjdGlvbicgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0N1YmljIHNlbGYtaW50ZXJzZWN0aW9uICsgb3ZlcmxhcHBpbmcgdW51c2VkIGVkZ2UnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBuZXcgU2hhcGUoKTtcclxuICBjb25zdCBiID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gIGEubW92ZVRvKCAxMCwgMCApLmxpbmVUbyggMTAsIDEwICkubGluZVRvKCAxMCwgMCApLmN1YmljQ3VydmVUbyggMzAsIDEwLCAwLCAxMCwgMjAsIDAgKS5jbG9zZSgpO1xyXG4gIGIucmVjdCggMCwgMCwgNSwgNSApO1xyXG5cclxuICB0ZXN0VW5pb24oIGFzc2VydCwgYSwgYiwgMSwgJ0N1YmljIHNlbGYtaW50ZXJzZWN0aW9uJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnUmVtb3ZhbCBvZiBicmlkZ2UgZWRnZXMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBuZXcgU2hhcGUoKTtcclxuICBjb25zdCBiID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gIGEubW92ZVRvKCA0MCwgNTAgKS5saW5lVG8oIDIwLCA3MCApLmxpbmVUbyggMjAsIDMwICkubGluZVRvKCA0MCwgNTAgKS5saW5lVG8oIDYwLCA1MCApLmxpbmVUbyggODAsIDMwICkubGluZVRvKCA4MCwgNzAgKS5saW5lVG8oIDYwLCA1MCApLmNsb3NlKCk7XHJcbiAgYi5yZWN0KCAwLCAwLCA1LCA1ICk7XHJcblxyXG4gIHRlc3RVbmlvbiggYXNzZXJ0LCBhLCBiLCAxLCAnUmVtb3ZhbCBvZiBicmlkZ2UgZWRnZXMnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdEb3VibGUgY2lyY2xlJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IFNoYXBlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICBhLmNpcmNsZSggMjAsIDIwLCAxMCApO1xyXG4gIGIuY2lyY2xlKCAyNSwgMjAsIDEwICk7XHJcblxyXG4gIHRlc3RVbmlvbiggYXNzZXJ0LCBhLCBiLCAxLCAnRG91YmxlIGNpcmNsZSB1bmlvbicgKTtcclxuICB0ZXN0RGlmZmVyZW5jZSggYXNzZXJ0LCBhLCBiLCAxLCAnRG91YmxlIGNpcmNsZSBkaWZmZXJlbmNlJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnSGFsZiBjaXJjbGUgam9pbicsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYSA9IG5ldyBTaGFwZSgpO1xyXG4gIGNvbnN0IGIgPSBuZXcgU2hhcGUoKTtcclxuXHJcbiAgYS5hcmMoIDUwLCA1MCwgMzAsIDAsIE1hdGguUEksIGZhbHNlICkuY2xvc2UoKTtcclxuICBiLmFyYyggNTAsIDUwLCAzMCwgTWF0aC5QSSwgTWF0aC5QSSAqIDIsIGZhbHNlICkuY2xvc2UoKTtcclxuXHJcbiAgdGVzdFVuaW9uKCBhc3NlcnQsIGEsIGIsIDEsICdIYWxmIGNpcmNsZSB1bmlvbicgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1BhcnRpYWwgY2lyY2xlIG92ZXJsYXAnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBuZXcgU2hhcGUoKTtcclxuICBjb25zdCBiID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gIGEuYXJjKCA1MCwgNTAsIDMwLCAwLCBNYXRoLlBJLCBmYWxzZSApLmNsb3NlKCk7XHJcbiAgYi5hcmMoIDUwLCA1MCwgMzAsIE1hdGguUEkgKiAwLjUsIE1hdGguUEkgKiAyLCBmYWxzZSApLmNsb3NlKCk7XHJcblxyXG4gIHRlc3RVbmlvbiggYXNzZXJ0LCBhLCBiLCAxLCAnUGFydGlhbCBjaXJjbGUgdW5pb24nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdDaXJjbGUgb3ZlcmxhcCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYSA9IG5ldyBTaGFwZSgpO1xyXG4gIGNvbnN0IGIgPSBuZXcgU2hhcGUoKTtcclxuXHJcbiAgYS5jaXJjbGUoIDUwLCA1MCwgMzAgKTtcclxuICBiLmNpcmNsZSggNTAsIDUwLCAzMCApO1xyXG5cclxuICB0ZXN0VW5pb24oIGFzc2VydCwgYSwgYiwgMSwgJ0NpcmNsZSBvdmVybGFwIHVuaW9uJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnQ2lyY2xlIGFkamFjZW50JywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IFNoYXBlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICBhLmNpcmNsZSggMTAsIDEwLCA1ICk7XHJcbiAgYi5hcmMoIDIwLCAxMCwgNSwgTWF0aC5QSSwgMyAqIE1hdGguUEksIGZhbHNlICkuY2xvc2UoKTtcclxuXHJcbiAgdGVzdFVuaW9uKCBhc3NlcnQsIGEsIGIsIDEsICdDaXJjbGUgYWRqYWNlbnQgdW5pb24nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICc0IGFkamFjZW50IGNpcmNsZXMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBuZXcgU2hhcGUoKS5jaXJjbGUoIC01LCAwLCA1ICkuY2lyY2xlKCA1LCAwLCA1ICk7XHJcbiAgY29uc3QgYiA9IG5ldyBTaGFwZSgpLmNpcmNsZSggMCwgLTUsIDUgKS5jaXJjbGUoIDAsIDUsIDUgKTtcclxuXHJcbiAgdGVzdFVuaW9uKCBhc3NlcnQsIGEsIGIsIDEsICc0IGFkamFjZW50IGNpcmNsZXMgdW5pb24nICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdzdHJva2VkIGxpbmUgMScsIGFzc2VydCA9PiB7XHJcblxyXG4gIGNvbnN0IGEgPSBTaGFwZS5kZXNlcmlhbGl6ZSgge1xyXG4gICAgdHlwZTogJ1NoYXBlJyxcclxuICAgIHN1YnBhdGhzOiBbIHtcclxuICAgICAgdHlwZTogJ1N1YnBhdGgnLFxyXG4gICAgICBzZWdtZW50czogWyB7XHJcbiAgICAgICAgdHlwZTogJ0xpbmUnLFxyXG4gICAgICAgIHN0YXJ0WDogNTgwLFxyXG4gICAgICAgIHN0YXJ0WTogMzcyLFxyXG4gICAgICAgIGVuZFg6IDU4MCxcclxuICAgICAgICBlbmRZOiAxNTUuNjk0MTk5MjA0ODczMTRcclxuICAgICAgfSwge1xyXG4gICAgICAgIHR5cGU6ICdBcmMnLFxyXG4gICAgICAgIGNlbnRlclg6IDU3MCxcclxuICAgICAgICBjZW50ZXJZOiAxNTUuNjk0MTk5MjA0ODczMTQsXHJcbiAgICAgICAgcmFkaXVzOiAxMCxcclxuICAgICAgICBzdGFydEFuZ2xlOiAwLFxyXG4gICAgICAgIGVuZEFuZ2xlOiAtMy4xNDE1OTI2NTM1ODk3OTMsXHJcbiAgICAgICAgYW50aWNsb2Nrd2lzZTogdHJ1ZVxyXG4gICAgICB9LCB7IHR5cGU6ICdMaW5lJywgc3RhcnRYOiA1NjAsIHN0YXJ0WTogMTU1LjY5NDE5OTIwNDg3MzE0LCBlbmRYOiA1NjAsIGVuZFk6IDM3MiB9LCB7XHJcbiAgICAgICAgdHlwZTogJ0FyYycsXHJcbiAgICAgICAgY2VudGVyWDogNTcwLFxyXG4gICAgICAgIGNlbnRlclk6IDM3MixcclxuICAgICAgICByYWRpdXM6IDEwLFxyXG4gICAgICAgIHN0YXJ0QW5nbGU6IDMuMTQxNTkyNjUzNTg5NzkzLFxyXG4gICAgICAgIGVuZEFuZ2xlOiAwLFxyXG4gICAgICAgIGFudGljbG9ja3dpc2U6IHRydWVcclxuICAgICAgfSBdLFxyXG4gICAgICBwb2ludHM6IFsgeyB4OiA1ODAsIHk6IDM3MiB9LCB7IHg6IDU4MCwgeTogMTU1LjY5NDE5OTIwNDg3MzE0IH0sIHtcclxuICAgICAgICB4OiA1NjAsXHJcbiAgICAgICAgeTogMTU1LjY5NDE5OTIwNDg3MzE0XHJcbiAgICAgIH0sIHsgeDogNTYwLCB5OiAzNzIgfSwgeyB4OiA1ODAsIHk6IDM3MiB9IF0sXHJcbiAgICAgIGNsb3NlZDogdHJ1ZVxyXG4gICAgfSBdXHJcbiAgfSApO1xyXG4gIGNvbnN0IGIgPSBTaGFwZS5kZXNlcmlhbGl6ZSgge1xyXG4gICAgdHlwZTogJ1NoYXBlJyxcclxuICAgIHN1YnBhdGhzOiBbIHtcclxuICAgICAgdHlwZTogJ1N1YnBhdGgnLFxyXG4gICAgICBzZWdtZW50czogWyB7XHJcbiAgICAgICAgdHlwZTogJ0xpbmUnLFxyXG4gICAgICAgIHN0YXJ0WDogNTcwLFxyXG4gICAgICAgIHN0YXJ0WTogMTQ1LjY5NDE5OTIwNDg3MzE0LFxyXG4gICAgICAgIGVuZFg6IDM0OC4zMDU4MDA3OTUxMjY4LFxyXG4gICAgICAgIGVuZFk6IDE0NS42OTQxOTkyMDQ4NzMxNFxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdHlwZTogJ0FyYycsXHJcbiAgICAgICAgY2VudGVyWDogMzQ4LjMwNTgwMDc5NTEyNjgsXHJcbiAgICAgICAgY2VudGVyWTogMTU1LjY5NDE5OTIwNDg3MzE0LFxyXG4gICAgICAgIHJhZGl1czogMTAsXHJcbiAgICAgICAgc3RhcnRBbmdsZTogNC43MTIzODg5ODAzODQ2OSxcclxuICAgICAgICBlbmRBbmdsZTogMS41NzA3OTYzMjY3OTQ4OTY2LFxyXG4gICAgICAgIGFudGljbG9ja3dpc2U6IHRydWVcclxuICAgICAgfSwge1xyXG4gICAgICAgIHR5cGU6ICdMaW5lJyxcclxuICAgICAgICBzdGFydFg6IDM0OC4zMDU4MDA3OTUxMjY4LFxyXG4gICAgICAgIHN0YXJ0WTogMTY1LjY5NDE5OTIwNDg3MzE0LFxyXG4gICAgICAgIGVuZFg6IDU3MCxcclxuICAgICAgICBlbmRZOiAxNjUuNjk0MTk5MjA0ODczMTRcclxuICAgICAgfSwge1xyXG4gICAgICAgIHR5cGU6ICdBcmMnLFxyXG4gICAgICAgIGNlbnRlclg6IDU3MCxcclxuICAgICAgICBjZW50ZXJZOiAxNTUuNjk0MTk5MjA0ODczMTQsXHJcbiAgICAgICAgcmFkaXVzOiAxMCxcclxuICAgICAgICBzdGFydEFuZ2xlOiAxLjU3MDc5NjMyNjc5NDg5NjYsXHJcbiAgICAgICAgZW5kQW5nbGU6IC0xLjU3MDc5NjMyNjc5NDg5NjYsXHJcbiAgICAgICAgYW50aWNsb2Nrd2lzZTogdHJ1ZVxyXG4gICAgICB9IF0sXHJcbiAgICAgIHBvaW50czogWyB7IHg6IDU3MCwgeTogMTQ1LjY5NDE5OTIwNDg3MzE0IH0sIHtcclxuICAgICAgICB4OiAzNDguMzA1ODAwNzk1MTI2OCxcclxuICAgICAgICB5OiAxNDUuNjk0MTk5MjA0ODczMTRcclxuICAgICAgfSwgeyB4OiAzNDguMzA1ODAwNzk1MTI2OCwgeTogMTY1LjY5NDE5OTIwNDg3MzE0IH0sIHsgeDogNTcwLCB5OiAxNjUuNjk0MTk5MjA0ODczMTQgfSwge1xyXG4gICAgICAgIHg6IDU3MCxcclxuICAgICAgICB5OiAxNDUuNjk0MTk5MjA0ODczMTRcclxuICAgICAgfSBdLFxyXG4gICAgICBjbG9zZWQ6IHRydWVcclxuICAgIH0gXVxyXG4gIH0gKTtcclxuXHJcbiAgdGVzdFVuaW9uKCBhc3NlcnQsIGEsIGIsIDEsICdzdHJva2VkIGxpbmUgMSB1bmlvbicgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1NoYXJlZCBlbmRwb2ludCB0ZXN0JywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gU2hhcGUuZGVzZXJpYWxpemUoIHtcclxuICAgIHR5cGU6ICdTaGFwZScsXHJcbiAgICBzdWJwYXRoczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ1N1YnBhdGgnLFxyXG4gICAgICAgIHNlZ21lbnRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdMaW5lJyxcclxuICAgICAgICAgICAgc3RhcnRYOiAyOTMuMTI5MzQzOTMwMjczOCxcclxuICAgICAgICAgICAgc3RhcnRZOiAzMTQuNDI0NTE2MzQ0MDY2OCxcclxuICAgICAgICAgICAgZW5kWDogMjg4Ljg4NjcwMzI0MzE1NDUsXHJcbiAgICAgICAgICAgIGVuZFk6IDMyMS4yMTI3NDE0NDM0NTc3M1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdHlwZTogJ0xpbmUnLFxyXG4gICAgICAgICAgICBzdGFydFg6IDI4OC44ODY3MDMyNDMxNTQ1LFxyXG4gICAgICAgICAgICBzdGFydFk6IDMyMS4yMTI3NDE0NDM0NTc3MyxcclxuICAgICAgICAgICAgZW5kWDogMjgzLjM3MTI3MDM0OTg5OTUsXHJcbiAgICAgICAgICAgIGVuZFk6IDMyNi43MjgxNzQzMzY3MTI3XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnTGluZScsXHJcbiAgICAgICAgICAgIHN0YXJ0WDogMjgzLjM3MTI3MDM0OTg5OTUsXHJcbiAgICAgICAgICAgIHN0YXJ0WTogMzI2LjcyODE3NDMzNjcxMjcsXHJcbiAgICAgICAgICAgIGVuZFg6IDI4MC44MjU2ODU5Mzc2Mjc5LFxyXG4gICAgICAgICAgICBlbmRZOiAzMjQuMTgyNTg5OTI0NDQxMVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdHlwZTogJ0xpbmUnLFxyXG4gICAgICAgICAgICBzdGFydFg6IDI4MC44MjU2ODU5Mzc2Mjc5LFxyXG4gICAgICAgICAgICBzdGFydFk6IDMyNC4xODI1ODk5MjQ0NDExLFxyXG4gICAgICAgICAgICBlbmRYOiAyODYuMzQxMTE4ODMwODgyOSxcclxuICAgICAgICAgICAgZW5kWTogMzE4LjY2NzE1NzAzMTE4NjE1XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnTGluZScsXHJcbiAgICAgICAgICAgIHN0YXJ0WDogMjg2LjM0MTExODgzMDg4MjksXHJcbiAgICAgICAgICAgIHN0YXJ0WTogMzE4LjY2NzE1NzAzMTE4NjE1LFxyXG4gICAgICAgICAgICBlbmRYOiAyOTMuMTI5MzQzOTMwMjczOCxcclxuICAgICAgICAgICAgZW5kWTogMzE0LjQyNDUxNjM0NDA2NjhcclxuICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIHBvaW50czogWyB7IHg6IDI5My4xMjkzNDM5MzAyNzM4LCB5OiAzMTQuNDI0NTE2MzQ0MDY2OCB9LCB7XHJcbiAgICAgICAgICB4OiAyODguODg2NzAzMjQzMTU0NSxcclxuICAgICAgICAgIHk6IDMyMS4yMTI3NDE0NDM0NTc3M1xyXG4gICAgICAgIH0sIHsgeDogMjgzLjM3MTI3MDM0OTg5OTUsIHk6IDMyNi43MjgxNzQzMzY3MTI3IH0sIHtcclxuICAgICAgICAgIHg6IDI4MC44MjU2ODU5Mzc2Mjc5LFxyXG4gICAgICAgICAgeTogMzI0LjE4MjU4OTkyNDQ0MTFcclxuICAgICAgICB9LCB7IHg6IDI4Ni4zNDExMTg4MzA4ODI5LCB5OiAzMTguNjY3MTU3MDMxMTg2MTUgfSwgeyB4OiAyOTMuMTI5MzQzOTMwMjczOCwgeTogMzE0LjQyNDUxNjM0NDA2NjggfSBdLFxyXG4gICAgICAgIGNsb3NlZDogdHJ1ZVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdHlwZTogJ1N1YnBhdGgnLFxyXG4gICAgICAgIHNlZ21lbnRzOiBbXSxcclxuICAgICAgICBwb2ludHM6IFsgeyB4OiAyOTMuMTI5MzQzOTMwMjczOCwgeTogMzE0LjQyNDUxNjM0NDA2NjggfSBdLFxyXG4gICAgICAgIGNsb3NlZDogZmFsc2VcclxuICAgICAgfSBdXHJcbiAgfSApO1xyXG4gIGNvbnN0IGIgPSBTaGFwZS5kZXNlcmlhbGl6ZSgge1xyXG4gICAgdHlwZTogJ1NoYXBlJywgc3VicGF0aHM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdTdWJwYXRoJyxcclxuICAgICAgICBzZWdtZW50czogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnTGluZScsXHJcbiAgICAgICAgICAgIHN0YXJ0WDogMjk2LFxyXG4gICAgICAgICAgICBzdGFydFk6IDI3Mi43ODY3OTY1NjQ0MDM1LFxyXG4gICAgICAgICAgICBlbmRYOiA0NDcuMjEzMjAzNDM1NTk2MzcsXHJcbiAgICAgICAgICAgIGVuZFk6IDI3Mi43ODY3OTY1NjQ0MDM1XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnTGluZScsXHJcbiAgICAgICAgICAgIHN0YXJ0WDogNDQ3LjIxMzIwMzQzNTU5NjM3LFxyXG4gICAgICAgICAgICBzdGFydFk6IDI3Mi43ODY3OTY1NjQ0MDM1LFxyXG4gICAgICAgICAgICBlbmRYOiA0NDcuMjEzMjAzNDM1NTk2MzcsXHJcbiAgICAgICAgICAgIGVuZFk6IDI3OC43ODY3OTY1NjQ0MDM1XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnTGluZScsXHJcbiAgICAgICAgICAgIHN0YXJ0WDogNDQ3LjIxMzIwMzQzNTU5NjM3LFxyXG4gICAgICAgICAgICBzdGFydFk6IDI3OC43ODY3OTY1NjQ0MDM1LFxyXG4gICAgICAgICAgICBlbmRYOiA0MDQuNzg2Nzk2NTY0NDAzNSxcclxuICAgICAgICAgICAgZW5kWTogMzIxLjIxMzIwMzQzNTU5NjRcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdMaW5lJyxcclxuICAgICAgICAgICAgc3RhcnRYOiA0MDQuNzg2Nzk2NTY0NDAzNSxcclxuICAgICAgICAgICAgc3RhcnRZOiAzMjEuMjEzMjAzNDM1NTk2NCxcclxuICAgICAgICAgICAgZW5kWDogMjg0Ljc4Njc5NjU2NDQwMzYsXHJcbiAgICAgICAgICAgIGVuZFk6IDMyMS4yMTMyMDM0MzU1OTY0XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnTGluZScsXHJcbiAgICAgICAgICAgIHN0YXJ0WDogMjg0Ljc4Njc5NjU2NDQwMzYsXHJcbiAgICAgICAgICAgIHN0YXJ0WTogMzIxLjIxMzIwMzQzNTU5NjQsXHJcbiAgICAgICAgICAgIGVuZFg6IDI4NC43ODY3OTY1NjQ0MDM2LFxyXG4gICAgICAgICAgICBlbmRZOiAzMTUuMjEzMjAzNDM1NTk2NFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdHlwZTogJ0xpbmUnLFxyXG4gICAgICAgICAgICBzdGFydFg6IDI4NC43ODY3OTY1NjQ0MDM2LFxyXG4gICAgICAgICAgICBzdGFydFk6IDMxNS4yMTMyMDM0MzU1OTY0LFxyXG4gICAgICAgICAgICBlbmRYOiAyOTYsXHJcbiAgICAgICAgICAgIGVuZFk6IDI3Mi43ODY3OTY1NjQ0MDM1XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBwb2ludHM6IFsgeyB4OiAyOTYsIHk6IDI3Mi43ODY3OTY1NjQ0MDM1IH0sIHtcclxuICAgICAgICAgIHg6IDQ0Ny4yMTMyMDM0MzU1OTYzNyxcclxuICAgICAgICAgIHk6IDI3Mi43ODY3OTY1NjQ0MDM1XHJcbiAgICAgICAgfSwgeyB4OiA0NDcuMjEzMjAzNDM1NTk2MzcsIHk6IDI3OC43ODY3OTY1NjQ0MDM1IH0sIHtcclxuICAgICAgICAgIHg6IDQwNC43ODY3OTY1NjQ0MDM1LFxyXG4gICAgICAgICAgeTogMzIxLjIxMzIwMzQzNTU5NjRcclxuICAgICAgICB9LCB7IHg6IDI4NC43ODY3OTY1NjQ0MDM2LCB5OiAzMjEuMjEzMjAzNDM1NTk2NCB9LCB7XHJcbiAgICAgICAgICB4OiAyODQuNzg2Nzk2NTY0NDAzNixcclxuICAgICAgICAgIHk6IDMxNS4yMTMyMDM0MzU1OTY0XHJcbiAgICAgICAgfSwgeyB4OiAyOTYsIHk6IDI3Mi43ODY3OTY1NjQ0MDM1IH0gXSxcclxuICAgICAgICBjbG9zZWQ6IHRydWVcclxuICAgICAgfSBdXHJcbiAgfSApO1xyXG4gIHRlc3RVbmlvbiggYXNzZXJ0LCBhLCBiLCAxLCAnc2hhcmVkIGVuZHBvaW50IHRlc3QgMScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0xpbmUgc2VnbWVudCB3aW5kaW5nJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBsaW5lID0gbmV3IExpbmUoIG5ldyBWZWN0b3IyKCAwLCAwICksIG5ldyBWZWN0b3IyKCAyLCAyICkgKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCBsaW5lLndpbmRpbmdJbnRlcnNlY3Rpb24oIG5ldyBSYXkyKCBuZXcgVmVjdG9yMiggMCwgMSApLCBuZXcgVmVjdG9yMiggMSwgMCApICkgKSwgMSApO1xyXG4gIGFzc2VydC5lcXVhbCggbGluZS53aW5kaW5nSW50ZXJzZWN0aW9uKCBuZXcgUmF5MiggbmV3IFZlY3RvcjIoIDAsIDUgKSwgbmV3IFZlY3RvcjIoIDEsIDAgKSApICksIDAgKTtcclxuICBhc3NlcnQuZXF1YWwoIGxpbmUud2luZGluZ0ludGVyc2VjdGlvbiggbmV3IFJheTIoIG5ldyBWZWN0b3IyKCAxLCAwICksIG5ldyBWZWN0b3IyKCAwLCAxICkgKSApLCAtMSApO1xyXG4gIGFzc2VydC5lcXVhbCggbGluZS53aW5kaW5nSW50ZXJzZWN0aW9uKCBuZXcgUmF5MiggbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDEsIDEgKS5ub3JtYWxpemVkKCkgKSApLCAwICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBsaW5lLndpbmRpbmdJbnRlcnNlY3Rpb24oIG5ldyBSYXkyKCBuZXcgVmVjdG9yMiggMCwgMSApLCBuZXcgVmVjdG9yMiggMSwgMSApLm5vcm1hbGl6ZWQoKSApICksIDAgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1JlY3RhbmdsZSBoaXQgdGVzdGluZycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2hhcGUgPSBTaGFwZS5yZWN0YW5nbGUoIDAsIDAsIDEsIDEgKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCBzaGFwZS5jb250YWluc1BvaW50KCBuZXcgVmVjdG9yMiggMC4yLCAwLjMgKSApLCB0cnVlLCAnMC4yLCAwLjMnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzaGFwZS5jb250YWluc1BvaW50KCBuZXcgVmVjdG9yMiggMC41LCAwLjUgKSApLCB0cnVlLCAnMC41LCAwLjUnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzaGFwZS5jb250YWluc1BvaW50KCBuZXcgVmVjdG9yMiggMS41LCAwLjUgKSApLCBmYWxzZSwgJzEuNSwgMC41JyApO1xyXG4gIGFzc2VydC5lcXVhbCggc2hhcGUuY29udGFpbnNQb2ludCggbmV3IFZlY3RvcjIoIC0wLjUsIDAuNSApICksIGZhbHNlLCAnLTAuNSwgMC41JyApO1xyXG59ICk7XHJcblxyXG4vL1NlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvMzRcclxuUVVuaXQudGVzdCggJ1RyYXBlem9pZCBoaXQgdGVzdGluZycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoICdNIDQxNSAyOTguNSBMIDQxNC45OTk5OTk5OTk5OTk5NCA5NC41IEwgNDY4LjU5Njc5ODE2MjI4NiAxMDEuMDg2NTk0NDcyOTU1NjQgTCA0NjguNTk2Nzk4MTYyMjg2MDYgMjkxLjkxMzQwNTUyNzA0NDM1IFonICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzaGFwZS5jb250YWluc1BvaW50KCBuZXcgVmVjdG9yMiggNDQxLCAxMjUgKSApLCB0cnVlLCAndHJhcGV6b2lkIHNob3VsZCByZXBvcnQgdGhhdCBhbiBpbnRlcmlvciBwb2ludCBpcyBcImNvbnRhaW5zUG9pbnRcIiB0cnVlJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVW4tY2xvc2VkIHNoYXBlIGhpdCB0ZXN0aW5nJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApLmxpbmVUbyggMTAsIDEwICkubGluZVRvKCAwLCAxMCApO1xyXG5cclxuICBhc3NlcnQuZXF1YWwoIHNoYXBlLmNvbnRhaW5zUG9pbnQoIG5ldyBWZWN0b3IyKCAxLCAyICkgKSwgdHJ1ZSwgJzEsIDInICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzaGFwZS5jb250YWluc1BvaW50KCBuZXcgVmVjdG9yMiggMTAsIDIgKSApLCBmYWxzZSwgJzEwLCAyJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnWmVyby1zaXplIHJlY3RhbmdsZScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKS5yZWN0KCAyMCwgNTAsIDAsIDAgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBzaGFwZS5ib3VuZHMuaXNGaW5pdGUoKSB8fCBzaGFwZS5ib3VuZHMuaXNFbXB0eSgpICk7IC8vIHJlbGllcyBvbiB0aGUgYm91bmRhcnkgY2FzZSBmcm9tIGRvdFxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnWmVyby1zaXplIGxpbmUgc2VnbWVudCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIDIwLCA1MCApLmxpbmVUbyggMjAsIDUwICkuY2xvc2UoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBzaGFwZS5ib3VuZHMuaXNGaW5pdGUoKSB8fCBzaGFwZS5ib3VuZHMuaXNFbXB0eSgpICk7IC8vIHJlbGllcyBvbiB0aGUgYm91bmRhcnkgY2FzZSBmcm9tIGRvdFxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnQnVja2V0IGhpdCByZWdpb24nLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAtNjAsIDAgKVxyXG4gICAgLmxpbmVUbyggLTQ4LCA0MiApXHJcbiAgICAuY3ViaWNDdXJ2ZVRvKCAtMzYsIDUxLCAzNiwgNTEsIDQ4LCA0MiApXHJcbiAgICAubGluZVRvKCA2MCwgMCApXHJcbiAgICAuZWxsaXB0aWNhbEFyYyggMCwgMCwgNjAsIDcuNSwgMCwgMCwgLU1hdGguUEksIGZhbHNlIClcclxuICAgIC5jbG9zZSgpO1xyXG4gIGNvbnN0IHBvaW50ID0gbmV3IFZlY3RvcjIoIC0xMzEuMDc3NzI5MjU3NjQxOTgsIC0yNzQuNjUwNDM2NjgxMjIyNzQgKTtcclxuICBjb25zdCByYXkgPSBuZXcgUmF5MiggcG9pbnQsIG5ldyBWZWN0b3IyKCAxLCAwICkgKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCAwLCBzaGFwZS53aW5kaW5nSW50ZXJzZWN0aW9uKCByYXkgKSwgJ1RoZSB3aW5kaW5nIGludGVyc2VjdGlvbiBzaG91bGQgYmUgemVybycgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2ludGVyc2VjdHNCb3VuZHMnLCBhc3NlcnQgPT4ge1xyXG4gIGFzc2VydC5vayggIVNoYXBlLmNpcmNsZSggMCwgMCwgMiApLmludGVyc2VjdHNCb3VuZHMoIG5ldyBCb3VuZHMyKCAtMSwgLTEsIDEsIDEgKSApLFxyXG4gICAgJ0NpcmNsZSBzdXJyb3VuZHMgdGhlIGJvdW5kcyBidXQgc2hvdWxkIG5vdCBpbnRlcnNlY3QnICk7XHJcbiAgYXNzZXJ0Lm9rKCBTaGFwZS5jaXJjbGUoIDAsIDAsIDEuMyApLmludGVyc2VjdHNCb3VuZHMoIG5ldyBCb3VuZHMyKCAtMSwgLTEsIDEsIDEgKSApLFxyXG4gICAgJ0NpcmNsZSBpbnRlcnNlY3RzIHRoZSBib3VuZHMnICk7XHJcbiAgYXNzZXJ0Lm9rKCBTaGFwZS5jaXJjbGUoIDAsIDAsIDAuOSApLmludGVyc2VjdHNCb3VuZHMoIG5ldyBCb3VuZHMyKCAtMSwgLTEsIDEsIDEgKSApLFxyXG4gICAgJ0NpcmNsZSBjb250YWluZWQgd2l0aGluIHRoZSBib3VuZHMnICk7XHJcbiAgYXNzZXJ0Lm9rKCAoIG5ldyBTaGFwZSgpICkubW92ZVRvKCAtMiwgMCApLmxpbmVUbyggMiwgMCApLmludGVyc2VjdHNCb3VuZHMoIG5ldyBCb3VuZHMyKCAtMSwgLTEsIDEsIDEgKSApLFxyXG4gICAgJ0xpbmUgZ29lcyB0aHJvdWdoIGJvdW5kcyBkaXJlY3RseScgKTtcclxuICBhc3NlcnQub2soICEoIG5ldyBTaGFwZSgpICkubW92ZVRvKCAtMiwgMiApLmxpbmVUbyggMiwgMiApLmludGVyc2VjdHNCb3VuZHMoIG5ldyBCb3VuZHMyKCAtMSwgLTEsIDEsIDEgKSApLFxyXG4gICAgJ0xpbmUgZ29lcyBhYm92ZSBib3VuZHMnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdpbnRlcmlvckludGVyc2VjdHNMaW5lU2VnbWVudCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgY2lyY2xlID0gU2hhcGUuY2lyY2xlKCAwLCAwLCAxMCApOyAvLyByYWRpdXMgMTAgYXQgMCwwXHJcblxyXG4gIGFzc2VydC5vayggY2lyY2xlLmludGVyaW9ySW50ZXJzZWN0c0xpbmVTZWdtZW50KCBuZXcgVmVjdG9yMiggLTEsIDAgKSwgbmV3IFZlY3RvcjIoIDEsIDAgKSApLFxyXG4gICAgJ0Z1bGx5IGNvbnRhaW5lZCcgKTtcclxuICBhc3NlcnQub2soICFjaXJjbGUuaW50ZXJpb3JJbnRlcnNlY3RzTGluZVNlZ21lbnQoIG5ldyBWZWN0b3IyKCAtMTAwLCAwICksIG5ldyBWZWN0b3IyKCAtNTAsIDAgKSApLFxyXG4gICAgJ091dHNpZGUgd2l0aCByYXkgdG93YXJkcyBjaXJjbGUnICk7XHJcbiAgYXNzZXJ0Lm9rKCAhY2lyY2xlLmludGVyaW9ySW50ZXJzZWN0c0xpbmVTZWdtZW50KCBuZXcgVmVjdG9yMiggNTAsIDAgKSwgbmV3IFZlY3RvcjIoIDEwMCwgMCApICksXHJcbiAgICAnT3V0c2lkZSB3aXRoIHJheSBhd2F5IGZyb20gY2lyY2xlJyApO1xyXG4gIGFzc2VydC5vayggY2lyY2xlLmludGVyaW9ySW50ZXJzZWN0c0xpbmVTZWdtZW50KCBuZXcgVmVjdG9yMiggMTAwLCAwICksIG5ldyBWZWN0b3IyKCAwLCAwICkgKSxcclxuICAgICdJbnNpZGUgdG8gb3V0c2lkZSAoaW50ZXJzZWN0cyknICk7XHJcbiAgYXNzZXJ0Lm9rKCAhY2lyY2xlLmludGVyaW9ySW50ZXJzZWN0c0xpbmVTZWdtZW50KCBuZXcgVmVjdG9yMiggMTAwLCAwICksIG5ldyBWZWN0b3IyKCAwLCAxMDAgKSApLFxyXG4gICAgJ091dHNpZGUgYXQgYW4gYW5nbGUnICk7XHJcbiAgYXNzZXJ0Lm9rKCBjaXJjbGUuaW50ZXJpb3JJbnRlcnNlY3RzTGluZVNlZ21lbnQoIG5ldyBWZWN0b3IyKCAxMC4xLCAwICksIG5ldyBWZWN0b3IyKCAwLCAxMC4xICkgKSxcclxuICAgICdHbGFuY2luZyB3aXRoIHR3byBpbnRlcnNlY3Rpb24gcG9pbnRzJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnQ3ViaWMgb3ZlcmxhcCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgY3ViaWMgPSBuZXcgQ3ViaWMoIG5ldyBWZWN0b3IyKCAwLCAwICksIG5ldyBWZWN0b3IyKCAwLCAzICksIG5ldyBWZWN0b3IyKCAxMCwgNyApLCBuZXcgVmVjdG9yMiggMTAsIDkgKSApO1xyXG4gIGNvbnN0IG90aGVyQ3ViaWMgPSBuZXcgQ3ViaWMoIG5ldyBWZWN0b3IyKCAxMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMyApLCBuZXcgVmVjdG9yMiggMTAsIDcgKSwgbmV3IFZlY3RvcjIoIDEwLCA5ICkgKTtcclxuXHJcbiAgY29uc3Qgc2VsZlRlc3QgPSBDdWJpYy5nZXRPdmVybGFwcyggY3ViaWMsIGN1YmljIClbIDAgXTtcclxuICBhc3NlcnQuZXF1YWwoIHNlbGZUZXN0LmEsIDEsICdzZWxmVGVzdC5hJyApO1xyXG4gIGFzc2VydC5lcXVhbCggc2VsZlRlc3QuYiwgMCwgJ3NlbGZUZXN0LmInICk7XHJcblxyXG4gIGNvbnN0IGZpcnN0SGFsZiA9IGN1YmljLnN1YmRpdmlkZWQoIDAuNSApWyAwIF07XHJcbiAgY29uc3QgZmlyc3RUZXN0ID0gQ3ViaWMuZ2V0T3ZlcmxhcHMoIGN1YmljLCBmaXJzdEhhbGYgKVsgMCBdO1xyXG4gIGFzc2VydC5lcXVhbCggZmlyc3RUZXN0LmEsIDIsICdmaXJzdFRlc3QuYScgKTtcclxuICBhc3NlcnQuZXF1YWwoIGZpcnN0VGVzdC5iLCAwLCAnZmlyc3RUZXN0LmInICk7XHJcbiAgYXNzZXJ0Lm9rKCBjdWJpYy5wb3NpdGlvbkF0KCAwLjI1ICkuZGlzdGFuY2UoIGZpcnN0SGFsZi5wb3NpdGlvbkF0KCAwLjI1ICogZmlyc3RUZXN0LmEgKyBmaXJzdFRlc3QuYiApICkgPCAxZS02LCAnZmlyc3RIYWxmIHQ9MC4yNSBjaGVjaycgKTtcclxuXHJcbiAgY29uc3Qgc2Vjb25kSGFsZiA9IGN1YmljLnN1YmRpdmlkZWQoIDAuNSApWyAxIF07XHJcbiAgY29uc3Qgc2Vjb25kVGVzdCA9IEN1YmljLmdldE92ZXJsYXBzKCBjdWJpYywgc2Vjb25kSGFsZiApWyAwIF07XHJcbiAgYXNzZXJ0LmVxdWFsKCBzZWNvbmRUZXN0LmEsIDIsICdzZWNvbmRUZXN0LmEnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzZWNvbmRUZXN0LmIsIC0xLCAnc2Vjb25kVGVzdC5iJyApO1xyXG4gIGFzc2VydC5vayggY3ViaWMucG9zaXRpb25BdCggMC43NSApLmRpc3RhbmNlKCBzZWNvbmRIYWxmLnBvc2l0aW9uQXQoIDAuNzUgKiBzZWNvbmRUZXN0LmEgKyBzZWNvbmRUZXN0LmIgKSApIDwgMWUtNiwgJ3NlY29uZEhhbGYgdD0wLjc1IGNoZWNrJyApO1xyXG5cclxuICBjb25zdCBuZWdhdGl2ZVRlc3QgPSBDdWJpYy5nZXRPdmVybGFwcyggY3ViaWMsIG90aGVyQ3ViaWMgKTtcclxuICBhc3NlcnQuZXF1YWwoIG5lZ2F0aXZlVGVzdC5sZW5ndGgsIDAsICduZWdhdGl2ZVRlc3QnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdRdWFkcmF0aWMgb3ZlcmxhcCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgcXVhZHJhdGljID0gbmV3IFF1YWRyYXRpYyggbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDMgKSwgbmV3IFZlY3RvcjIoIDEwLCA5ICkgKTtcclxuICBjb25zdCBvdGhlclF1YWRyYXRpYyA9IG5ldyBRdWFkcmF0aWMoIG5ldyBWZWN0b3IyKCAxMCwgMCApLCBuZXcgVmVjdG9yMiggMCwgMyApLCBuZXcgVmVjdG9yMiggMTAsIDkgKSApO1xyXG5cclxuICBjb25zdCBzZWxmVGVzdCA9IFF1YWRyYXRpYy5nZXRPdmVybGFwcyggcXVhZHJhdGljLCBxdWFkcmF0aWMgKVsgMCBdO1xyXG4gIGFzc2VydC5lcXVhbCggc2VsZlRlc3QuYSwgMSwgJ3NlbGZUZXN0LmEnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzZWxmVGVzdC5iLCAwLCAnc2VsZlRlc3QuYicgKTtcclxuXHJcbiAgY29uc3QgZmlyc3RIYWxmID0gcXVhZHJhdGljLnN1YmRpdmlkZWQoIDAuNSApWyAwIF07XHJcbiAgY29uc3QgZmlyc3RUZXN0ID0gUXVhZHJhdGljLmdldE92ZXJsYXBzKCBxdWFkcmF0aWMsIGZpcnN0SGFsZiApWyAwIF07XHJcbiAgYXNzZXJ0LmVxdWFsKCBmaXJzdFRlc3QuYSwgMiwgJ2ZpcnN0VGVzdC5hJyApO1xyXG4gIGFzc2VydC5lcXVhbCggZmlyc3RUZXN0LmIsIDAsICdmaXJzdFRlc3QuYicgKTtcclxuICBhc3NlcnQub2soIHF1YWRyYXRpYy5wb3NpdGlvbkF0KCAwLjI1ICkuZGlzdGFuY2UoIGZpcnN0SGFsZi5wb3NpdGlvbkF0KCAwLjI1ICogZmlyc3RUZXN0LmEgKyBmaXJzdFRlc3QuYiApICkgPCAxZS02LCAnZmlyc3RIYWxmIHQ9MC4yNSBjaGVjaycgKTtcclxuXHJcbiAgY29uc3Qgc2Vjb25kSGFsZiA9IHF1YWRyYXRpYy5zdWJkaXZpZGVkKCAwLjUgKVsgMSBdO1xyXG4gIGNvbnN0IHNlY29uZFRlc3QgPSBRdWFkcmF0aWMuZ2V0T3ZlcmxhcHMoIHF1YWRyYXRpYywgc2Vjb25kSGFsZiApWyAwIF07XHJcbiAgYXNzZXJ0LmVxdWFsKCBzZWNvbmRUZXN0LmEsIDIsICdzZWNvbmRUZXN0LmEnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzZWNvbmRUZXN0LmIsIC0xLCAnc2Vjb25kVGVzdC5iJyApO1xyXG4gIGFzc2VydC5vayggcXVhZHJhdGljLnBvc2l0aW9uQXQoIDAuNzUgKS5kaXN0YW5jZSggc2Vjb25kSGFsZi5wb3NpdGlvbkF0KCAwLjc1ICogc2Vjb25kVGVzdC5hICsgc2Vjb25kVGVzdC5iICkgKSA8IDFlLTYsICdzZWNvbmRIYWxmIHQ9MC43NSBjaGVjaycgKTtcclxuXHJcbiAgY29uc3QgbmVnYXRpdmVUZXN0ID0gUXVhZHJhdGljLmdldE92ZXJsYXBzKCBxdWFkcmF0aWMsIG90aGVyUXVhZHJhdGljICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBuZWdhdGl2ZVRlc3QubGVuZ3RoLCAwLCAnbmVnYXRpdmVUZXN0JyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnTGluZWFyIG92ZXJsYXAnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGxpbmUgPSBuZXcgTGluZSggbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDEwLCA5ICkgKTtcclxuICBjb25zdCBvdGhlckxpbmUgPSBuZXcgTGluZSggbmV3IFZlY3RvcjIoIDEwLCAwICksIG5ldyBWZWN0b3IyKCAxMCwgOSApICk7XHJcblxyXG4gIGNvbnN0IHNlbGZUZXN0ID0gTGluZS5nZXRPdmVybGFwcyggbGluZSwgbGluZSApWyAwIF07XHJcbiAgYXNzZXJ0LmVxdWFsKCBzZWxmVGVzdC5hLCAxLCAnc2VsZlRlc3QuYScgKTtcclxuICBhc3NlcnQuZXF1YWwoIHNlbGZUZXN0LmIsIDAsICdzZWxmVGVzdC5iJyApO1xyXG5cclxuICBjb25zdCBmaXJzdEhhbGYgPSBsaW5lLnN1YmRpdmlkZWQoIDAuNSApWyAwIF07XHJcbiAgY29uc3QgZmlyc3RUZXN0ID0gTGluZS5nZXRPdmVybGFwcyggbGluZSwgZmlyc3RIYWxmIClbIDAgXTtcclxuICBhc3NlcnQuZXF1YWwoIGZpcnN0VGVzdC5hLCAyLCAnZmlyc3RUZXN0LmEnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBmaXJzdFRlc3QuYiwgMCwgJ2ZpcnN0VGVzdC5iJyApO1xyXG4gIGFzc2VydC5vayggbGluZS5wb3NpdGlvbkF0KCAwLjI1ICkuZGlzdGFuY2UoIGZpcnN0SGFsZi5wb3NpdGlvbkF0KCAwLjI1ICogZmlyc3RUZXN0LmEgKyBmaXJzdFRlc3QuYiApICkgPCAxZS02LCAnZmlyc3RIYWxmIHQ9MC4yNSBjaGVjaycgKTtcclxuXHJcbiAgY29uc3Qgc2Vjb25kSGFsZiA9IGxpbmUuc3ViZGl2aWRlZCggMC41IClbIDEgXTtcclxuICBjb25zdCBzZWNvbmRUZXN0ID0gTGluZS5nZXRPdmVybGFwcyggbGluZSwgc2Vjb25kSGFsZiApWyAwIF07XHJcbiAgYXNzZXJ0LmVxdWFsKCBzZWNvbmRUZXN0LmEsIDIsICdzZWNvbmRUZXN0LmEnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBzZWNvbmRUZXN0LmIsIC0xLCAnc2Vjb25kVGVzdC5iJyApO1xyXG4gIGFzc2VydC5vayggbGluZS5wb3NpdGlvbkF0KCAwLjc1ICkuZGlzdGFuY2UoIHNlY29uZEhhbGYucG9zaXRpb25BdCggMC43NSAqIHNlY29uZFRlc3QuYSArIHNlY29uZFRlc3QuYiApICkgPCAxZS02LCAnc2Vjb25kSGFsZiB0PTAuNzUgY2hlY2snICk7XHJcblxyXG4gIGNvbnN0IG5lZ2F0aXZlVGVzdCA9IExpbmUuZ2V0T3ZlcmxhcHMoIGxpbmUsIG90aGVyTGluZSApO1xyXG4gIGFzc2VydC5lcXVhbCggbmVnYXRpdmVUZXN0Lmxlbmd0aCwgMCwgJ25lZ2F0aXZlVGVzdCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0Nsb3N1cmUgb2YgY29tbW9uIFNoYXBlIGNvbW1hbmRzJywgYXNzZXJ0ID0+IHtcclxuICBhc3NlcnQub2soIG5ldyBTaGFwZSgpLmNpcmNsZSggMCwgMCwgMTAgKS5zdWJwYXRoc1sgMCBdLmNsb3NlZCwgJ2NpcmNsZSBzaG91bGQgcmVzdWx0IGluIGEgY2xvc2VkIHN1YnBhdGgnICk7XHJcbiAgYXNzZXJ0Lm9rKCBuZXcgU2hhcGUoKS5lbGxpcHNlKCAwLCAwLCAxMCwgMjAsIE1hdGguUEkgLyA0ICkuc3VicGF0aHNbIDAgXS5jbG9zZWQsICdlbGxpcHNlIHNob3VsZCByZXN1bHQgaW4gYSBjbG9zZWQgc3VicGF0aCcgKTtcclxuICBhc3NlcnQub2soIG5ldyBTaGFwZSgpLnJlY3QoIDAsIDAsIDEwMCwgNTAgKS5zdWJwYXRoc1sgMCBdLmNsb3NlZCwgJ3JlY3Qgc2hvdWxkIHJlc3VsdCBpbiBhIGNsb3NlZCBzdWJwYXRoJyApO1xyXG4gIGFzc2VydC5vayggbmV3IFNoYXBlKCkucm91bmRSZWN0KCAwLCAwLCAxMDAsIDUwLCAzLCA0ICkuc3VicGF0aHNbIDAgXS5jbG9zZWQsICdyb3VuZFJlY3Qgc2hvdWxkIHJlc3VsdCBpbiBhIGNsb3NlZCBzdWJwYXRoJyApO1xyXG4gIGFzc2VydC5vayggbmV3IFNoYXBlKCkucG9seWdvbiggWyBuZXcgVmVjdG9yMiggMCwgMCApLCBuZXcgVmVjdG9yMiggMTAsIDAgKSwgbmV3IFZlY3RvcjIoIDAsIDEwICkgXSApLnN1YnBhdGhzWyAwIF0uY2xvc2VkLCAncG9seWdvbiBzaG91bGQgcmVzdWx0IGluIGEgY2xvc2VkIHN1YnBhdGgnICk7XHJcbiAgYXNzZXJ0Lm9rKCBTaGFwZS5yZWd1bGFyUG9seWdvbiggNiwgMTAgKS5zdWJwYXRoc1sgMCBdLmNsb3NlZCwgJ3JlZ3VsYXJQb2x5Z29uIHNob3VsZCByZXN1bHQgaW4gYSBjbG9zZWQgc3VicGF0aCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0NpcmNsZS1jaXJjbGUgaW50ZXJzZWN0aW9uJywgYXNzZXJ0ID0+IHtcclxuICAvLyBBY2N1cmFjeSBhc3NlcnRpb25zIGFyZSBjb250YWluZWQgaW4gdGhlIGludGVyc2VjdGlvbiBmdW5jdGlvblxyXG5cclxuICBhc3NlcnQuZXF1YWwoIEFyYy5nZXRDaXJjbGVJbnRlcnNlY3Rpb25Qb2ludCggbmV3IFZlY3RvcjIoIDAsIDAgKSwgMTAsIG5ldyBWZWN0b3IyKCAyMCwgMCApLCAxMCApLmxlbmd0aCwgMSwgJ3R3byAxMC1yYWRpaSBhZGphY2VudCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIEFyYy5nZXRDaXJjbGVJbnRlcnNlY3Rpb25Qb2ludCggbmV3IFZlY3RvcjIoIDAsIDAgKSwgMTAsIG5ldyBWZWN0b3IyKCAyMSwgMCApLCAxMCApLmxlbmd0aCwgMCwgJ3R3byAxMC1yYWRpaSBzZXBhcmF0ZWQnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBBcmMuZ2V0Q2lyY2xlSW50ZXJzZWN0aW9uUG9pbnQoIG5ldyBWZWN0b3IyKCAwLCAwICksIDEwLCBuZXcgVmVjdG9yMiggMzAsIDAgKSwgMjAgKS5sZW5ndGgsIDEsICd0d28gMjAtcmFkaWkgYWRqYWNlbnQnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBBcmMuZ2V0Q2lyY2xlSW50ZXJzZWN0aW9uUG9pbnQoIG5ldyBWZWN0b3IyKCAwLCAwICksIDEwLCBuZXcgVmVjdG9yMiggMzEsIDAgKSwgMjAgKS5sZW5ndGgsIDAsICd0d28gMjAtcmFkaWkgc2VwYXJhdGVkJyApO1xyXG4gIGFzc2VydC5lcXVhbCggQXJjLmdldENpcmNsZUludGVyc2VjdGlvblBvaW50KCBuZXcgVmVjdG9yMiggMCwgMCApLCAxMCwgbmV3IFZlY3RvcjIoIDAsIDAgKSwgOCApLmxlbmd0aCwgMCwgJ2lubmVyIGNlbnRlcicgKTtcclxuICBhc3NlcnQuZXF1YWwoIEFyYy5nZXRDaXJjbGVJbnRlcnNlY3Rpb25Qb2ludCggbmV3IFZlY3RvcjIoIDAsIDAgKSwgMTAsIG5ldyBWZWN0b3IyKCAxLCAwICksIDUgKS5sZW5ndGgsIDAsICdpbm5lciBvZmZzZXQnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBBcmMuZ2V0Q2lyY2xlSW50ZXJzZWN0aW9uUG9pbnQoIG5ldyBWZWN0b3IyKCAwLCAwICksIDEwLCBuZXcgVmVjdG9yMiggNSwgMCApLCA1ICkubGVuZ3RoLCAxLCAnaW5uZXIgdG91Y2hpbmcnICk7XHJcblxyXG4gIGZ1bmN0aW9uIHIoKSB7XHJcbiAgICBjb25zdCByYW5kb21Tb3VyY2UgPSBNYXRoLnJhbmRvbTsgLy8gKFdlIGNhbid0IGdldCBqb2lzdCdzIHJhbmRvbSByZWZlcmVuY2UgaGVyZSlcclxuICAgIHJldHVybiBNYXRoLmNlaWwoIHJhbmRvbVNvdXJjZSgpICogMjAgKTtcclxuICB9XHJcblxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IDIwMDsgaSsrICkge1xyXG4gICAgQXJjLmdldENpcmNsZUludGVyc2VjdGlvblBvaW50KCBuZXcgVmVjdG9yMiggcigpLCByKCkgKSwgcigpLCBuZXcgVmVjdG9yMiggcigpLCByKCkgKSwgcigpICk7XHJcbiAgfVxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnQ2xvc2UgbGluZWFyIG92ZXJsYXAnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBuZXcgTGluZSggbmV3IFZlY3RvcjIoIDAsIDAgKSwgbmV3IFZlY3RvcjIoIDYuMTIzMjMzOTk1NzM2NzY2ZS0xNiwgLTEwICkgKTtcclxuICBjb25zdCBiID0gbmV3IExpbmUoIG5ldyBWZWN0b3IyKCAtMS44MzY5NzAxOTg3MjEwMjk2ZS0xNSwgLTEwICksIG5ldyBWZWN0b3IyKCAwLCAwICkgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBMaW5lLmdldE92ZXJsYXBzKCBhLCBiICkubGVuZ3RoID09PSAxLCAnU2hvdWxkIGZpbmQgb25lIGNvbnRpbnVvdXMgb3ZlcmxhcCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1BhcnRpYWwgZWxsaXBzZSBvdmVybGFwIHVuaW9uJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IFNoYXBlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICBhLmVsbGlwdGljYWxBcmMoIDUwLCA1MCwgMzAsIDUwLCAwLjEyNCwgMCwgTWF0aC5QSSwgZmFsc2UgKS5jbG9zZSgpO1xyXG4gIGIuZWxsaXB0aWNhbEFyYyggNTAsIDUwLCAzMCwgNTAsIDAuMTI0LCBNYXRoLlBJICogMC41LCBNYXRoLlBJICogMiwgZmFsc2UgKS5jbG9zZSgpO1xyXG5cclxuICB0ZXN0VW5pb24oIGFzc2VydCwgYSwgYiwgMSwgJ1BhcnRpYWwgZWxsaXBzZSB1bmlvbicgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0VsbGlwdGljYWwgb3ZlcmxhcHMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGEgPSBuZXcgRWxsaXB0aWNhbEFyYyggVmVjdG9yMi5aRVJPLCA2MCwgNDAsIDAsIDAsIE1hdGguUEksIGZhbHNlICk7XHJcbiAgY29uc3QgYiA9IG5ldyBFbGxpcHRpY2FsQXJjKCBWZWN0b3IyLlpFUk8sIDYwLCA0MCwgMCwgMC41ICogTWF0aC5QSSwgMS41ICogTWF0aC5QSSwgZmFsc2UgKTtcclxuICBjb25zdCBjID0gbmV3IEVsbGlwdGljYWxBcmMoIFZlY3RvcjIuWkVSTywgNDAsIDYwLCAtTWF0aC5QSSAvIDIsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSApO1xyXG4gIGNvbnN0IGQgPSBuZXcgRWxsaXB0aWNhbEFyYyggVmVjdG9yMi5aRVJPLCA2MCwgNDAsIDAsIDAuOCAqIE1hdGguUEksIDIuMiAqIE1hdGguUEksIGZhbHNlICk7XHJcblxyXG4gIGFzc2VydC5lcXVhbCggRWxsaXB0aWNhbEFyYy5nZXRPdmVybGFwcyggYSwgYiApLmxlbmd0aCwgMSwgJ05vcm1hbCBwYXJ0aWFsIG92ZXJsYXAnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBFbGxpcHRpY2FsQXJjLmdldE92ZXJsYXBzKCBhLCBjICkubGVuZ3RoLCAxLCAnT3ZlcmxhcCB3aXRoIG9wcG9zaXRlIHJvdGF0aW9uJyApO1xyXG4gIGFzc2VydC5lcXVhbCggRWxsaXB0aWNhbEFyYy5nZXRPdmVybGFwcyggYSwgZCApLmxlbmd0aCwgMiwgJ0RvdWJsZSBvdmVybGFwJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnRWxsaXB0aWNhbCBpbnRlcnNlY3Rpb24gYXQgb3JpZ2luJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IEVsbGlwdGljYWxBcmMoIG5ldyBWZWN0b3IyKCAyMCwgMCApLCAyMCwgMzAsIDAsIDAuOSAqIE1hdGguUEksIDEuMSAqIE1hdGguUEksIGZhbHNlICk7XHJcbiAgY29uc3QgYiA9IG5ldyBFbGxpcHRpY2FsQXJjKCBuZXcgVmVjdG9yMiggMCwgMjAgKSwgMzAsIDIwLCAwLCAxLjQgKiBNYXRoLlBJLCAxLjYgKiBNYXRoLlBJLCBmYWxzZSApO1xyXG5cclxuICBjb25zdCBpbnRlcnNlY3Rpb25zID0gRWxsaXB0aWNhbEFyYy5pbnRlcnNlY3QoIGEsIGIgKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCBpbnRlcnNlY3Rpb25zLmxlbmd0aCwgMSwgJ1NpbmdsZSBpbnRlcnNlY3Rpb24nICk7XHJcbiAgaWYgKCBpbnRlcnNlY3Rpb25zLmxlbmd0aCApIHtcclxuICAgIGFzc2VydC5vayggaW50ZXJzZWN0aW9uc1sgMCBdLnBvaW50LmVxdWFsc0Vwc2lsb24oIFZlY3RvcjIuWkVSTywgMWUtMTAgKSwgJ0ludGVyc2VjdGlvbiBhdCAwJyApO1xyXG4gIH1cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0VsbGlwdGljYWwgaW50ZXJzZWN0aW9uIHdoZW4gc3BsaXQnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGFyYyA9IG5ldyBFbGxpcHRpY2FsQXJjKCBuZXcgVmVjdG9yMiggMjAsIDAgKSwgMjAsIDMwLCAwLCAwLjMgKiBNYXRoLlBJLCAxLjEgKiBNYXRoLlBJLCBmYWxzZSApO1xyXG4gIGNvbnN0IHN1YmFyY3MgPSBhcmMuc3ViZGl2aWRlZCggMC41ICk7XHJcblxyXG4gIGNvbnN0IGludGVyc2VjdGlvbnMgPSBFbGxpcHRpY2FsQXJjLmludGVyc2VjdCggc3ViYXJjc1sgMCBdLCBzdWJhcmNzWyAxIF0gKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCBpbnRlcnNlY3Rpb25zLmxlbmd0aCwgMSwgJ1NpbmdsZSBpbnRlcnNlY3Rpb24nICk7XHJcbn0gKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxPQUFPQyxPQUFPLE1BQU0seUJBQXlCO0FBQzdDLE9BQU9DLElBQUksTUFBTSxzQkFBc0I7QUFDdkMsT0FBT0MsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxTQUFTQyxHQUFHLEVBQUVDLEtBQUssRUFBRUMsYUFBYSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsS0FBSyxRQUFRLGNBQWM7QUFFaEZDLEtBQUssQ0FBQ0MsTUFBTSxDQUFFLE9BQVEsQ0FBQztBQUV2QixTQUFTQyxZQUFZQSxDQUFFQyxRQUFRLEVBQUc7RUFFaEMsTUFBTUMsTUFBTSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7RUFDakRGLE1BQU0sQ0FBQ0csS0FBSyxHQUFHSixRQUFRLENBQUNJLEtBQUs7RUFDN0JILE1BQU0sQ0FBQ0ksTUFBTSxHQUFHTCxRQUFRLENBQUNLLE1BQU07RUFDL0IsTUFBTUMsT0FBTyxHQUFHTCxNQUFNLENBQUNNLFVBQVUsQ0FBRSxJQUFLLENBQUM7RUFDekNELE9BQU8sQ0FBQ0UsWUFBWSxDQUFFUixRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUN0Q1MsQ0FBQyxDQUFFUixNQUFPLENBQUMsQ0FBQ1MsR0FBRyxDQUFFLFFBQVEsRUFBRSxpQkFBa0IsQ0FBQztFQUM5QyxPQUFPVCxNQUFNO0FBQ2Y7O0FBRUE7QUFDQSxTQUFTVSxVQUFVQSxDQUFFQyxNQUFNLEVBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFFQyxTQUFTLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFHO0VBRWhFLElBQUlDLE9BQU8sR0FBR0wsQ0FBQyxDQUFDVCxLQUFLLEtBQUtVLENBQUMsQ0FBQ1YsS0FBSyxJQUFJUyxDQUFDLENBQUNSLE1BQU0sS0FBS1MsQ0FBQyxDQUFDVCxNQUFNO0VBQzFELElBQUljLGlCQUFpQixHQUFHLENBQUM7RUFDekIsSUFBSUMsZUFBZSxHQUFHLENBQUM7RUFDdkIsTUFBTUMsYUFBYSxHQUFHbkIsUUFBUSxDQUFDQyxhQUFhLENBQUUsUUFBUyxDQUFDLENBQUNJLFVBQVUsQ0FBRSxJQUFLLENBQUMsQ0FBQ2UsZUFBZSxDQUFFVCxDQUFDLENBQUNULEtBQUssRUFBRVMsQ0FBQyxDQUFDUixNQUFPLENBQUM7RUFDaEgsTUFBTWtCLGFBQWEsR0FBR3JCLFFBQVEsQ0FBQ0MsYUFBYSxDQUFFLFFBQVMsQ0FBQyxDQUFDSSxVQUFVLENBQUUsSUFBSyxDQUFDLENBQUNlLGVBQWUsQ0FBRVQsQ0FBQyxDQUFDVCxLQUFLLEVBQUVTLENBQUMsQ0FBQ1IsTUFBTyxDQUFDO0VBQ2hILElBQUthLE9BQU8sRUFBRztJQUNiLEtBQU0sSUFBSU0sQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHWCxDQUFDLENBQUNZLElBQUksQ0FBQ0MsTUFBTSxFQUFFRixDQUFDLEVBQUUsRUFBRztNQUN4QyxNQUFNRyxJQUFJLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFaEIsQ0FBQyxDQUFDWSxJQUFJLENBQUVELENBQUMsQ0FBRSxHQUFHVixDQUFDLENBQUNXLElBQUksQ0FBRUQsQ0FBQyxDQUFHLENBQUM7TUFDbEQsSUFBS0EsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUc7UUFDakJILGFBQWEsQ0FBQ0ksSUFBSSxDQUFFRCxDQUFDLENBQUUsR0FBRyxHQUFHO1FBQzdCRCxhQUFhLENBQUNFLElBQUksQ0FBRUQsQ0FBQyxDQUFFLEdBQUcsR0FBRztRQUM3QkQsYUFBYSxDQUFDRSxJQUFJLENBQUVELENBQUMsR0FBRyxDQUFDLENBQUUsR0FBR0csSUFBSSxDQUFDLENBQUM7UUFDcENKLGFBQWEsQ0FBQ0UsSUFBSSxDQUFFRCxDQUFDLEdBQUcsQ0FBQyxDQUFFLEdBQUdHLElBQUksQ0FBQyxDQUFDO1FBQ3BDSixhQUFhLENBQUNFLElBQUksQ0FBRUQsQ0FBQyxHQUFHLENBQUMsQ0FBRSxHQUFHRyxJQUFJLENBQUMsQ0FBQztNQUN0QyxDQUFDLE1BQ0k7UUFDSE4sYUFBYSxDQUFDSSxJQUFJLENBQUVELENBQUMsQ0FBRSxHQUFHRyxJQUFJO01BQ2hDO01BQ0EsTUFBTUcsVUFBVSxHQUFLTixDQUFDLEdBQUtBLENBQUMsR0FBRyxDQUFHLEdBQUcsQ0FBRztNQUN4QztNQUNBLE1BQU1PLG1CQUFtQixHQUFLUCxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBS0csSUFBSSxHQUFHQSxJQUFJLElBQUtkLENBQUMsQ0FBQ1ksSUFBSSxDQUFFSyxVQUFVLENBQUUsR0FBRyxHQUFHLENBQUUsSUFBS2hCLENBQUMsQ0FBQ1csSUFBSSxDQUFFSyxVQUFVLENBQUUsR0FBRyxHQUFHLENBQUU7TUFFM0hWLGVBQWUsSUFBSVcsbUJBQW1CO01BQ3RDO01BQ0E7TUFDQVosaUJBQWlCLEdBQUdTLElBQUksQ0FBQ0ksR0FBRyxDQUFFYixpQkFBaUIsRUFBRVksbUJBQW9CLENBQUM7TUFDdEU7TUFDQTtNQUNBO0lBQ0Y7RUFDRjs7RUFDQSxNQUFNRSxpQkFBaUIsR0FBR2IsZUFBZSxJQUFLLENBQUMsR0FBR1AsQ0FBQyxDQUFDVCxLQUFLLEdBQUdTLENBQUMsQ0FBQ1IsTUFBTSxDQUFFO0VBQ3RFLElBQUs0QixpQkFBaUIsR0FBR2xCLFNBQVMsRUFBRztJQUNuQyxNQUFNbUIsT0FBTyxHQUFHekIsQ0FBQyxDQUFFLFVBQVcsQ0FBQztJQUMvQjtJQUNBLE1BQU0wQixJQUFJLEdBQUdqQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxJQUFLLENBQUM7SUFDM0NNLENBQUMsQ0FBRTBCLElBQUssQ0FBQyxDQUFDQyxJQUFJLENBQUVwQixPQUFRLENBQUM7SUFDekJrQixPQUFPLENBQUNHLE1BQU0sQ0FBRUYsSUFBSyxDQUFDO0lBQ3RCLE1BQU1HLGFBQWEsR0FBR3BDLFFBQVEsQ0FBQ0MsYUFBYSxDQUFFLEtBQU0sQ0FBQztJQUNyRE0sQ0FBQyxDQUFFNkIsYUFBYyxDQUFDLENBQUNGLElBQUksQ0FBRyw0REFBMkRqQixpQkFBa0IsY0FBYWMsaUJBQWtCLEVBQUUsQ0FBQztJQUN6SUMsT0FBTyxDQUFDRyxNQUFNLENBQUVDLGFBQWMsQ0FBQztJQUUvQkosT0FBTyxDQUFDRyxNQUFNLENBQUV0QyxZQUFZLENBQUVjLENBQUUsQ0FBRSxDQUFDO0lBQ25DcUIsT0FBTyxDQUFDRyxNQUFNLENBQUV0QyxZQUFZLENBQUVlLENBQUUsQ0FBRSxDQUFDO0lBQ25Db0IsT0FBTyxDQUFDRyxNQUFNLENBQUV0QyxZQUFZLENBQUVzQixhQUFjLENBQUUsQ0FBQztJQUMvQ2EsT0FBTyxDQUFDRyxNQUFNLENBQUV0QyxZQUFZLENBQUV3QixhQUFjLENBQUUsQ0FBQztJQUUvQyxJQUFLTixRQUFRLEVBQUc7TUFDZGlCLE9BQU8sQ0FBQ0csTUFBTSxDQUFFcEIsUUFBUyxDQUFDO0lBQzVCOztJQUVBO0lBQ0FpQixPQUFPLENBQUNHLE1BQU0sQ0FBRW5DLFFBQVEsQ0FBQ0MsYUFBYSxDQUFFLEtBQU0sQ0FBRSxDQUFDO0lBRWpEZSxPQUFPLEdBQUcsS0FBSztFQUNqQjtFQUNBTixNQUFNLENBQUMyQixFQUFFLENBQUVyQixPQUFPLEVBQUVGLE9BQVEsQ0FBQztFQUM3QixPQUFPRSxPQUFPO0FBQ2hCO0FBRUEsU0FBU3NCLFNBQVNBLENBQUU1QixNQUFNLEVBQUU2QixNQUFNLEVBQUVDLE1BQU0sRUFBRTNCLFNBQVMsRUFBRUMsT0FBTyxFQUFHO0VBQy9ELE1BQU0yQixZQUFZLEdBQUd6QyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7RUFDdkR3QyxZQUFZLENBQUN2QyxLQUFLLEdBQUcsR0FBRztFQUN4QnVDLFlBQVksQ0FBQ3RDLE1BQU0sR0FBRyxHQUFHO0VBQ3pCLE1BQU11QyxhQUFhLEdBQUdELFlBQVksQ0FBQ3BDLFVBQVUsQ0FBRSxJQUFLLENBQUM7RUFDckRxQyxhQUFhLENBQUNDLFNBQVMsR0FBRyxPQUFPO0VBRWpDRCxhQUFhLENBQUNFLFNBQVMsQ0FBQyxDQUFDO0VBQ3pCTCxNQUFNLENBQUNNLGNBQWMsQ0FBRUgsYUFBYyxDQUFDO0VBQ3RDQSxhQUFhLENBQUNJLElBQUksQ0FBQyxDQUFDO0VBRXBCSixhQUFhLENBQUNFLFNBQVMsQ0FBQyxDQUFDO0VBQ3pCSixNQUFNLENBQUNLLGNBQWMsQ0FBRUgsYUFBYyxDQUFDO0VBQ3RDQSxhQUFhLENBQUNJLElBQUksQ0FBQyxDQUFDOztFQUVwQjs7RUFFQSxNQUFNQyxLQUFLLEdBQUdSLE1BQU0sQ0FBQ1MsVUFBVSxDQUFFUixNQUFPLENBQUM7RUFFekMsTUFBTVMsVUFBVSxHQUFHakQsUUFBUSxDQUFDQyxhQUFhLENBQUUsUUFBUyxDQUFDO0VBQ3JEZ0QsVUFBVSxDQUFDL0MsS0FBSyxHQUFHLEdBQUc7RUFDdEIrQyxVQUFVLENBQUM5QyxNQUFNLEdBQUcsR0FBRztFQUN2QixNQUFNK0MsV0FBVyxHQUFHRCxVQUFVLENBQUM1QyxVQUFVLENBQUUsSUFBSyxDQUFDO0VBQ2pENkMsV0FBVyxDQUFDUCxTQUFTLEdBQUcsT0FBTztFQUUvQk8sV0FBVyxDQUFDTixTQUFTLENBQUMsQ0FBQztFQUN2QkcsS0FBSyxDQUFDRixjQUFjLENBQUVLLFdBQVksQ0FBQztFQUNuQ0EsV0FBVyxDQUFDSixJQUFJLENBQUMsQ0FBQzs7RUFFbEI7O0VBRUEsTUFBTUssVUFBVSxHQUFHVCxhQUFhLENBQUNVLFlBQVksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDL0QsTUFBTUMsUUFBUSxHQUFHSCxXQUFXLENBQUNFLFlBQVksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFFM0QzQyxVQUFVLENBQUVDLE1BQU0sRUFBRXlDLFVBQVUsRUFBRUUsUUFBUSxFQUFFeEMsU0FBUyxFQUFFQyxPQUFRLENBQUM7QUFDaEU7QUFFQSxTQUFTd0MsY0FBY0EsQ0FBRTVDLE1BQU0sRUFBRTZCLE1BQU0sRUFBRUMsTUFBTSxFQUFFM0IsU0FBUyxFQUFFQyxPQUFPLEVBQUc7RUFDcEUsTUFBTTJCLFlBQVksR0FBR3pDLFFBQVEsQ0FBQ0MsYUFBYSxDQUFFLFFBQVMsQ0FBQztFQUN2RHdDLFlBQVksQ0FBQ3ZDLEtBQUssR0FBRyxHQUFHO0VBQ3hCdUMsWUFBWSxDQUFDdEMsTUFBTSxHQUFHLEdBQUc7RUFDekIsTUFBTXVDLGFBQWEsR0FBR0QsWUFBWSxDQUFDcEMsVUFBVSxDQUFFLElBQUssQ0FBQztFQUNyRHFDLGFBQWEsQ0FBQ0MsU0FBUyxHQUFHLE9BQU87RUFDakNELGFBQWEsQ0FBQ2EsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUN4Q2IsYUFBYSxDQUFDQyxTQUFTLEdBQUcsT0FBTztFQUVqQ0QsYUFBYSxDQUFDRSxTQUFTLENBQUMsQ0FBQztFQUN6QkwsTUFBTSxDQUFDTSxjQUFjLENBQUVILGFBQWMsQ0FBQztFQUN0Q0EsYUFBYSxDQUFDSSxJQUFJLENBQUMsQ0FBQztFQUVwQkosYUFBYSxDQUFDQyxTQUFTLEdBQUcsT0FBTztFQUVqQ0QsYUFBYSxDQUFDRSxTQUFTLENBQUMsQ0FBQztFQUN6QkosTUFBTSxDQUFDSyxjQUFjLENBQUVILGFBQWMsQ0FBQztFQUN0Q0EsYUFBYSxDQUFDSSxJQUFJLENBQUMsQ0FBQzs7RUFFcEI7O0VBRUEsTUFBTUMsS0FBSyxHQUFHUixNQUFNLENBQUNpQixlQUFlLENBQUVoQixNQUFPLENBQUM7RUFFOUMsTUFBTVMsVUFBVSxHQUFHakQsUUFBUSxDQUFDQyxhQUFhLENBQUUsUUFBUyxDQUFDO0VBQ3JEZ0QsVUFBVSxDQUFDL0MsS0FBSyxHQUFHLEdBQUc7RUFDdEIrQyxVQUFVLENBQUM5QyxNQUFNLEdBQUcsR0FBRztFQUN2QixNQUFNK0MsV0FBVyxHQUFHRCxVQUFVLENBQUM1QyxVQUFVLENBQUUsSUFBSyxDQUFDO0VBQ2pENkMsV0FBVyxDQUFDUCxTQUFTLEdBQUcsT0FBTztFQUMvQk8sV0FBVyxDQUFDSyxRQUFRLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0VBQ3RDTCxXQUFXLENBQUNQLFNBQVMsR0FBRyxPQUFPO0VBRS9CTyxXQUFXLENBQUNOLFNBQVMsQ0FBQyxDQUFDO0VBQ3ZCRyxLQUFLLENBQUNGLGNBQWMsQ0FBRUssV0FBWSxDQUFDO0VBQ25DQSxXQUFXLENBQUNKLElBQUksQ0FBQyxDQUFDOztFQUVsQjs7RUFFQSxNQUFNSyxVQUFVLEdBQUdULGFBQWEsQ0FBQ1UsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUMvRCxNQUFNQyxRQUFRLEdBQUdILFdBQVcsQ0FBQ0UsWUFBWSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztFQUUzRDNDLFVBQVUsQ0FBRUMsTUFBTSxFQUFFeUMsVUFBVSxFQUFFRSxRQUFRLEVBQUV4QyxTQUFTLEVBQUVDLE9BQVEsQ0FBQztBQUNoRTtBQUVBbkIsS0FBSyxDQUFDOEQsSUFBSSxDQUFFLGdCQUFnQixFQUFFL0MsTUFBTSxJQUFJO0VBQ3RDNEIsU0FBUyxDQUFFNUIsTUFBTSxFQUNmLElBQUloQixLQUFLLENBQUMsQ0FBQyxDQUFDZ0UsTUFBTSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUMsQ0FBQ0MsTUFBTSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUMsQ0FBQ0EsTUFBTSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUMsQ0FBQ0MsS0FBSyxDQUFDLENBQUMsRUFDdEUsSUFBSWxFLEtBQUssQ0FBQyxDQUFDLENBQUNnRSxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQyxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQSxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUN0RSxDQUFDLEVBQUUseUNBQ0wsQ0FBQztBQUNILENBQUUsQ0FBQztBQUVIakUsS0FBSyxDQUFDOEQsSUFBSSxDQUFFLGNBQWMsRUFBRS9DLE1BQU0sSUFBSTtFQUNwQzRCLFNBQVMsQ0FBRTVCLE1BQU0sRUFDZixJQUFJaEIsS0FBSyxDQUFDLENBQUMsQ0FBQ2dFLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUNDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLENBQUNBLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQUNDLEtBQUssQ0FBQyxDQUFDLENBQ2hFRixNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDQyxNQUFNLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDQSxNQUFNLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUN6RCxJQUFJbEUsS0FBSyxDQUFDLENBQUMsQ0FDUmdFLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUNDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLENBQUNBLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQUNDLEtBQUssQ0FBQyxDQUFDLENBQ3ZERixNQUFNLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQyxDQUFDQyxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQSxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQSxNQUFNLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxDQUN6RUYsTUFBTSxDQUFFLENBQUMsRUFBRSxFQUFHLENBQUMsQ0FBQ0MsTUFBTSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUMsQ0FBQ0EsTUFBTSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUMsQ0FBQ0EsTUFBTSxDQUFFLENBQUMsRUFBRSxFQUFHLENBQUMsQ0FBQ0MsS0FBSyxDQUFDLENBQUMsRUFDNUUsQ0FBQyxFQUFFLGFBQ0wsQ0FBQztBQUNILENBQUUsQ0FBQztBQUVIakUsS0FBSyxDQUFDOEQsSUFBSSxDQUFFLGNBQWMsRUFBRS9DLE1BQU0sSUFBSTtFQUNwQzRCLFNBQVMsQ0FBRTVCLE1BQU0sRUFDZixJQUFJaEIsS0FBSyxDQUFDLENBQUMsQ0FBQ2dFLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUNDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQUNBLE1BQU0sQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLENBQUNBLE1BQU0sQ0FBRSxDQUFDLEVBQUUsRUFBRyxDQUFDLENBQUNDLEtBQUssQ0FBQyxDQUFDLENBQ2hGRixNQUFNLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQyxDQUFDQyxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQSxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQSxNQUFNLENBQUUsQ0FBQyxFQUFFLEVBQUcsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUM1RSxJQUFJbEUsS0FBSyxDQUFDLENBQUMsQ0FBQ2dFLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQUNDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsQ0FBRSxDQUFDLENBQUNBLE1BQU0sQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLENBQUNBLE1BQU0sQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLENBQUNDLEtBQUssQ0FBQyxDQUFDLENBQ2xGRixNQUFNLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDQyxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQSxNQUFNLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDQSxNQUFNLENBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUM1RSxDQUFDLEVBQUUs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