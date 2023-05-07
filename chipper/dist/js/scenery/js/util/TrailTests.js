// Copyright 2017-2023, University of Colorado Boulder

/**
 * Trail tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import { CanvasNode, Color, Display, HStrut, Line, Node, Path, Rectangle, Renderer, Spacer, Text, TextBounds, Trail, TrailPointer, Utils, VStrut, WebGLNode } from '../imports.js';
QUnit.module('Trail');
function equalsApprox(assert, a, b, message) {
  assert.ok(Math.abs(a - b) < 0.0000001, `${(message ? `${message}: ` : '') + a} =? ${b}`);
}

/*
The test tree:
n
  n
    n
    n
      n
    n
    n
      n
        n
      n
    n
  n
  n
 */
function createTestNodeTree() {
  const node = new Node();
  node.addChild(new Node());
  node.addChild(new Node());
  node.addChild(new Node());
  node.children[0].addChild(new Node());
  node.children[0].addChild(new Node());
  node.children[0].addChild(new Node());
  node.children[0].addChild(new Node());
  node.children[0].addChild(new Node());
  node.children[0].children[1].addChild(new Node());
  node.children[0].children[3].addChild(new Node());
  node.children[0].children[3].addChild(new Node());
  node.children[0].children[3].children[0].addChild(new Node());
  return node;
}
QUnit.test('Dirty bounds propagation test', assert => {
  const node = createTestNodeTree();
  node.validateBounds();
  assert.ok(!node._childBoundsDirty);
  node.children[0].children[3].children[0].invalidateBounds();
  assert.ok(node._childBoundsDirty);
});
QUnit.test('Canvas 2D Context and Features', assert => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  assert.ok(context, 'context');
  const neededMethods = ['arc', 'arcTo', 'beginPath', 'bezierCurveTo', 'clearRect', 'clip', 'closePath', 'fill', 'fillRect', 'fillStyle', 'isPointInPath', 'lineTo', 'moveTo', 'rect', 'restore', 'quadraticCurveTo', 'save', 'setTransform', 'stroke', 'strokeRect', 'strokeStyle'];
  _.each(neededMethods, method => {
    assert.ok(context[method] !== undefined, `context.${method}`);
  });
});
QUnit.test('Trail next/previous', assert => {
  const node = createTestNodeTree();

  // walk it forward
  let trail = new Trail([node]);
  assert.equal(1, trail.length);
  trail = trail.next();
  assert.equal(2, trail.length);
  trail = trail.next();
  assert.equal(3, trail.length);
  trail = trail.next();
  assert.equal(3, trail.length);
  trail = trail.next();
  assert.equal(4, trail.length);
  trail = trail.next();
  assert.equal(3, trail.length);
  trail = trail.next();
  assert.equal(3, trail.length);
  trail = trail.next();
  assert.equal(4, trail.length);
  trail = trail.next();
  assert.equal(5, trail.length);
  trail = trail.next();
  assert.equal(4, trail.length);
  trail = trail.next();
  assert.equal(3, trail.length);
  trail = trail.next();
  assert.equal(2, trail.length);
  trail = trail.next();
  assert.equal(2, trail.length);

  // make sure walking off the end gives us null
  assert.equal(null, trail.next());
  trail = trail.previous();
  assert.equal(2, trail.length);
  trail = trail.previous();
  assert.equal(3, trail.length);
  trail = trail.previous();
  assert.equal(4, trail.length);
  trail = trail.previous();
  assert.equal(5, trail.length);
  trail = trail.previous();
  assert.equal(4, trail.length);
  trail = trail.previous();
  assert.equal(3, trail.length);
  trail = trail.previous();
  assert.equal(3, trail.length);
  trail = trail.previous();
  assert.equal(4, trail.length);
  trail = trail.previous();
  assert.equal(3, trail.length);
  trail = trail.previous();
  assert.equal(3, trail.length);
  trail = trail.previous();
  assert.equal(2, trail.length);
  trail = trail.previous();
  assert.equal(1, trail.length);

  // make sure walking off the start gives us null
  assert.equal(null, trail.previous());
});
QUnit.test('Trail comparison', assert => {
  const node = createTestNodeTree();

  // get a list of all trails in render order
  const trails = [];
  let currentTrail = new Trail(node); // start at the first node

  while (currentTrail) {
    trails.push(currentTrail);
    currentTrail = currentTrail.next();
  }
  assert.equal(13, trails.length, 'Trail for each node');
  for (let i = 0; i < trails.length; i++) {
    for (let j = i; j < trails.length; j++) {
      const comparison = trails[i].compare(trails[j]);

      // make sure that every trail compares as expected (0 and they are equal, -1 and i < j)
      assert.equal(i === j ? 0 : i < j ? -1 : 1, comparison, `${i},${j}`);
    }
  }
});
QUnit.test('Trail eachTrailBetween', assert => {
  const node = createTestNodeTree();

  // get a list of all trails in render order
  const trails = [];
  let currentTrail = new Trail(node); // start at the first node

  while (currentTrail) {
    trails.push(currentTrail);
    currentTrail = currentTrail.next();
  }
  assert.equal(13, trails.length, `Trails: ${_.map(trails, trail => trail.toString()).join('\n')}`);
  for (let i = 0; i < trails.length; i++) {
    for (let j = i; j < trails.length; j++) {
      const inclusiveList = [];
      Trail.eachTrailBetween(trails[i], trails[j], trail => {
        inclusiveList.push(trail.copy());
      }, false, node);
      const trailString = `${i},${j} ${trails[i].toString()} to ${trails[j].toString()}`;
      assert.ok(inclusiveList[0].equals(trails[i]), `inclusive start on ${trailString} is ${inclusiveList[0].toString()}`);
      assert.ok(inclusiveList[inclusiveList.length - 1].equals(trails[j]), `inclusive end on ${trailString}is ${inclusiveList[inclusiveList.length - 1].toString()}`);
      assert.equal(inclusiveList.length, j - i + 1, `inclusive length on ${trailString} is ${inclusiveList.length}, ${_.map(inclusiveList, trail => trail.toString()).join('\n')}`);
      if (i < j) {
        const exclusiveList = [];
        Trail.eachTrailBetween(trails[i], trails[j], trail => {
          exclusiveList.push(trail.copy());
        }, true, node);
        assert.equal(exclusiveList.length, j - i - 1, `exclusive length on ${i},${j}`);
      }
    }
  }
});
QUnit.test('depthFirstUntil depthFirstUntil with subtree skipping', assert => {
  const node = createTestNodeTree();
  node.children[0].children[2].visible = false;
  node.children[0].children[3].visible = false;
  new TrailPointer(new Trail(node), true).depthFirstUntil(new TrailPointer(new Trail(node), false), pointer => {
    if (!pointer.trail.lastNode().isVisible()) {
      // should skip
      return true;
    }
    assert.ok(pointer.trail.isVisible(), `Trail visibility for ${pointer.trail.toString()}`);
    return false;
  }, false);
});
QUnit.test('Trail eachTrailUnder with subtree skipping', assert => {
  const node = createTestNodeTree();
  node.children[0].children[2].visible = false;
  node.children[0].children[3].visible = false;
  new Trail(node).eachTrailUnder(trail => {
    if (!trail.lastNode().isVisible()) {
      // should skip
      return true;
    }
    assert.ok(trail.isVisible(), `Trail visibility for ${trail.toString()}`);
    return false;
  });
});
QUnit.test('TrailPointer render comparison', assert => {
  const node = createTestNodeTree();
  assert.equal(0, new TrailPointer(node.getUniqueTrail(), true).compareRender(new TrailPointer(node.getUniqueTrail(), true)), 'Same before pointer');
  assert.equal(0, new TrailPointer(node.getUniqueTrail(), false).compareRender(new TrailPointer(node.getUniqueTrail(), false)), 'Same after pointer');
  assert.equal(-1, new TrailPointer(node.getUniqueTrail(), true).compareRender(new TrailPointer(node.getUniqueTrail(), false)), 'Same node before/after root');
  assert.equal(-1, new TrailPointer(node.children[0].getUniqueTrail(), true).compareRender(new TrailPointer(node.children[0].getUniqueTrail(), false)), 'Same node before/after nonroot');
  assert.equal(0, new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), false).compareRender(new TrailPointer(node.children[0].children[2].getUniqueTrail(), true)), 'Equivalence of before/after');

  // all pointers in the render order
  const pointers = [new TrailPointer(node.getUniqueTrail(), true), new TrailPointer(node.getUniqueTrail(), false), new TrailPointer(node.children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[1].getUniqueTrail(), true), new TrailPointer(node.children[0].children[1].getUniqueTrail(), false), new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[2].getUniqueTrail(), true), new TrailPointer(node.children[0].children[2].getUniqueTrail(), false), new TrailPointer(node.children[0].children[3].getUniqueTrail(), true), new TrailPointer(node.children[0].children[3].getUniqueTrail(), false), new TrailPointer(node.children[0].children[3].children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[3].children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[3].children[0].children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[3].children[0].children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[3].children[1].getUniqueTrail(), true), new TrailPointer(node.children[0].children[3].children[1].getUniqueTrail(), false), new TrailPointer(node.children[0].children[4].getUniqueTrail(), true), new TrailPointer(node.children[0].children[4].getUniqueTrail(), false), new TrailPointer(node.children[1].getUniqueTrail(), true), new TrailPointer(node.children[1].getUniqueTrail(), false), new TrailPointer(node.children[2].getUniqueTrail(), true), new TrailPointer(node.children[2].getUniqueTrail(), false)];

  // compare the pointers. different ones can be equal if they represent the same place, so we only check if they compare differently
  for (let i = 0; i < pointers.length; i++) {
    for (let j = i; j < pointers.length; j++) {
      const comparison = pointers[i].compareRender(pointers[j]);
      if (comparison === -1) {
        assert.ok(i < j, `${i},${j}`);
      }
      if (comparison === 1) {
        assert.ok(i > j, `${i},${j}`);
      }
    }
  }
});
QUnit.test('TrailPointer nested comparison and fowards/backwards', assert => {
  const node = createTestNodeTree();

  // all pointers in the nested order
  const pointers = [new TrailPointer(node.getUniqueTrail(), true), new TrailPointer(node.children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[1].getUniqueTrail(), true), new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[1].getUniqueTrail(), false), new TrailPointer(node.children[0].children[2].getUniqueTrail(), true), new TrailPointer(node.children[0].children[2].getUniqueTrail(), false), new TrailPointer(node.children[0].children[3].getUniqueTrail(), true), new TrailPointer(node.children[0].children[3].children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[3].children[0].children[0].getUniqueTrail(), true), new TrailPointer(node.children[0].children[3].children[0].children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[3].children[0].getUniqueTrail(), false), new TrailPointer(node.children[0].children[3].children[1].getUniqueTrail(), true), new TrailPointer(node.children[0].children[3].children[1].getUniqueTrail(), false), new TrailPointer(node.children[0].children[3].getUniqueTrail(), false), new TrailPointer(node.children[0].children[4].getUniqueTrail(), true), new TrailPointer(node.children[0].children[4].getUniqueTrail(), false), new TrailPointer(node.children[0].getUniqueTrail(), false), new TrailPointer(node.children[1].getUniqueTrail(), true), new TrailPointer(node.children[1].getUniqueTrail(), false), new TrailPointer(node.children[2].getUniqueTrail(), true), new TrailPointer(node.children[2].getUniqueTrail(), false), new TrailPointer(node.getUniqueTrail(), false)];

  // exhaustively verify the ordering between each ordered pair
  for (let i = 0; i < pointers.length; i++) {
    for (let j = i; j < pointers.length; j++) {
      const comparison = pointers[i].compareNested(pointers[j]);

      // make sure that every pointer compares as expected (0 and they are equal, -1 and i < j)
      assert.equal(comparison, i === j ? 0 : i < j ? -1 : 1, `compareNested: ${i},${j}`);
    }
  }

  // verify forwards and backwards, as well as copy constructors
  for (let i = 1; i < pointers.length; i++) {
    const a = pointers[i - 1];
    const b = pointers[i];
    const forwardsCopy = a.copy();
    forwardsCopy.nestedForwards();
    assert.equal(forwardsCopy.compareNested(b), 0, `forwardsPointerCheck ${i - 1} to ${i}`);
    const backwardsCopy = b.copy();
    backwardsCopy.nestedBackwards();
    assert.equal(backwardsCopy.compareNested(a), 0, `backwardsPointerCheck ${i} to ${i - 1}`);
  }

  // exhaustively check depthFirstUntil inclusive
  for (let i = 0; i < pointers.length; i++) {
    for (let j = i + 1; j < pointers.length; j++) {
      // i < j guaranteed
      const contents = [];
      pointers[i].depthFirstUntil(pointers[j], pointer => {
        contents.push(pointer.copy());
      }, false);
      assert.equal(contents.length, j - i + 1, `depthFirstUntil inclusive ${i},${j} count check`);

      // do an actual pointer to pointer comparison
      let isOk = true;
      for (let k = 0; k < contents.length; k++) {
        const comparison = contents[k].compareNested(pointers[i + k]);
        if (comparison !== 0) {
          assert.equal(comparison, 0, `depthFirstUntil inclusive ${i},${j},${k} comparison check ${contents[k].trail.indices.join()} - ${pointers[i + k].trail.indices.join()}`);
          isOk = false;
        }
      }
      assert.ok(isOk, `depthFirstUntil inclusive ${i},${j} comparison check`);
    }
  }

  // exhaustively check depthFirstUntil exclusive
  for (let i = 0; i < pointers.length; i++) {
    for (let j = i + 1; j < pointers.length; j++) {
      // i < j guaranteed
      const contents = [];
      pointers[i].depthFirstUntil(pointers[j], pointer => {
        contents.push(pointer.copy());
      }, true);
      assert.equal(contents.length, j - i - 1, `depthFirstUntil exclusive ${i},${j} count check`);

      // do an actual pointer to pointer comparison
      let isOk = true;
      for (let k = 0; k < contents.length; k++) {
        const comparison = contents[k].compareNested(pointers[i + k + 1]);
        if (comparison !== 0) {
          assert.equal(comparison, 0, `depthFirstUntil exclusive ${i},${j},${k} comparison check ${contents[k].trail.indices.join()} - ${pointers[i + k].trail.indices.join()}`);
          isOk = false;
        }
      }
      assert.ok(isOk, `depthFirstUntil exclusive ${i},${j} comparison check`);
    }
  }
});

// QUnit.test( 'TrailInterval', function(assert) {
//   let node = createTestNodeTree();
//   let i, j;

//   // a subset of trails to test on
//   let trails = [
//     null,
//     node.children[0].getUniqueTrail(),
//     node.children[0].children[1].getUniqueTrail(), // commented out since it quickly creates many tests to include
//     node.children[0].children[3].children[0].getUniqueTrail(),
//     node.children[1].getUniqueTrail(),
//     null
//   ];

//   // get a list of all trails
//   let allTrails = [];
//   let t = node.getUniqueTrail();
//   while ( t ) {
//     allTrails.push( t );
//     t = t.next();
//   }

//   // get a list of all intervals using our 'trails' array
//   let intervals = [];

//   for ( i = 0; i < trails.length; i++ ) {
//     // only create proper intervals where i < j, since we specified them in order
//     for ( j = i + 1; j < trails.length; j++ ) {
//       let interval = new TrailInterval( trails[i], trails[j] );
//       intervals.push( interval );

//       // tag the interval, so we can do additional verification later
//       interval.i = i;
//       interval.j = j;
//     }
//   }

//   // check every combination of intervals
//   for ( i = 0; i < intervals.length; i++ ) {
//     let a = intervals[i];
//     for ( j = 0; j < intervals.length; j++ ) {
//       let b = intervals[j];

//       let union = a.union( b );
//       if ( a.exclusiveUnionable( b ) ) {
//         _.each( allTrails, function( trail ) {
//           if ( trail ) {
//             let msg = 'union check of trail ' + trail.toString() + ' with ' + a.toString() + ' and ' + b.toString() + ' with union ' + union.toString();
//            assert.equal( a.exclusiveContains( trail ) || b.exclusiveContains( trail ), union.exclusiveContains( trail ), msg );
//           }
//         } );
//       } else {
//         let wouldBeBadUnion = false;
//         let containsAnything = false;
//         _.each( allTrails, function( trail ) {
//           if ( trail ) {
//             if ( union.exclusiveContains( trail ) ) {
//               containsAnything = true;
//               if ( !a.exclusiveContains( trail ) && !b.exclusiveContains( trail ) ) {
//                 wouldBeBadUnion = true;
//               }
//             }
//           }
//         } );
//         assert.ok( containsAnything && wouldBeBadUnion, 'Not a bad union?: ' + a.toString() + ' and ' + b.toString() + ' with union ' + union.toString() );
//       }
//     }
//   }
// } );

QUnit.test('Text width measurement in canvas', assert => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const metrics = context.measureText('Hello World');
  assert.ok(metrics.width, 'metrics.width');
});
QUnit.test('Sceneless node handling', assert => {
  const a = new Path(null);
  const b = new Path(null);
  const c = new Path(null);
  a.setShape(Shape.rectangle(0, 0, 20, 20));
  c.setShape(Shape.rectangle(10, 10, 30, 30));
  a.addChild(b);
  b.addChild(c);
  a.validateBounds();
  a.removeChild(b);
  c.addChild(a);
  b.validateBounds();
  assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('Correct bounds on rectangle', assert => {
  const rectBounds = Utils.canvasAccurateBounds(context => {
    context.fillRect(100, 100, 200, 200);
  });
  assert.ok(Math.abs(rectBounds.minX - 100) < 0.01, rectBounds.minX);
  assert.ok(Math.abs(rectBounds.minY - 100) < 0.01, rectBounds.minY);
  assert.ok(Math.abs(rectBounds.maxX - 300) < 0.01, rectBounds.maxX);
  assert.ok(Math.abs(rectBounds.maxY - 300) < 0.01, rectBounds.maxY);
});
QUnit.test('Consistent and precise bounds range on Text', assert => {
  const textBounds = Utils.canvasAccurateBounds(context => {
    context.fillText('test string', 0, 0);
  });
  assert.ok(textBounds.isConsistent, textBounds.toString());

  // precision of 0.001 (or lower given different parameters) is possible on non-Chome browsers (Firefox, IE9, Opera)
  assert.ok(textBounds.precision < 0.15, `precision: ${textBounds.precision}`);
});
QUnit.test('Consistent and precise bounds range on Text', assert => {
  const text = new Text('0\u0489');
  const textBounds = TextBounds.accurateCanvasBoundsFallback(text);
  assert.ok(textBounds.isConsistent, textBounds.toString());

  // precision of 0.001 (or lower given different parameters) is possible on non-Chome browsers (Firefox, IE9, Opera)
  assert.ok(textBounds.precision < 1, `precision: ${textBounds.precision}`);
});
QUnit.test('ES5 Setter / Getter tests', assert => {
  const node = new Path(null);
  const fill = '#abcdef';
  node.fill = fill;
  assert.equal(node.fill, fill);
  assert.equal(node.getFill(), fill);
  const otherNode = new Path(Shape.rectangle(0, 0, 10, 10), {
    fill: fill
  });
  assert.equal(otherNode.fill, fill);
});
QUnit.test('Piccolo-like behavior', assert => {
  const node = new Node();
  node.scale(2);
  node.translate(1, 3);
  node.rotate(Math.PI / 2);
  node.translate(-31, 21);
  equalsApprox(assert, node.getMatrix().m00(), 0);
  equalsApprox(assert, node.getMatrix().m01(), -2);
  equalsApprox(assert, node.getMatrix().m02(), -40);
  equalsApprox(assert, node.getMatrix().m10(), 2);
  equalsApprox(assert, node.getMatrix().m11(), 0);
  equalsApprox(assert, node.getMatrix().m12(), -56);
  equalsApprox(assert, node.x, -40);
  equalsApprox(assert, node.y, -56);
  equalsApprox(assert, node.rotation, Math.PI / 2);
  node.translation = new Vector2(-5, 7);
  equalsApprox(assert, node.getMatrix().m02(), -5);
  equalsApprox(assert, node.getMatrix().m12(), 7);
  node.rotation = 1.2;
  equalsApprox(assert, node.getMatrix().m01(), -1.864078171934453);
  node.rotation = -0.7;
  equalsApprox(assert, node.getMatrix().m10(), -1.288435374475382);
});
QUnit.test('Setting left/right of node', assert => {
  const node = new Path(Shape.rectangle(-20, -20, 50, 50), {
    scale: 2
  });
  equalsApprox(assert, node.left, -40);
  equalsApprox(assert, node.right, 60);
  node.left = 10;
  equalsApprox(assert, node.left, 10);
  equalsApprox(assert, node.right, 110);
  node.right = 10;
  equalsApprox(assert, node.left, -90);
  equalsApprox(assert, node.right, 10);
  node.centerX = 5;
  equalsApprox(assert, node.centerX, 5);
  equalsApprox(assert, node.left, -45);
  equalsApprox(assert, node.right, 55);
});
QUnit.test('Path with empty shape', assert => {
  const scene = new Node();
  const node = new Path(new Shape());
  scene.addChild(node);
  assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('Path with null shape', assert => {
  const scene = new Node();
  const node = new Path(null);
  scene.addChild(node);
  assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('Display resize event', assert => {
  const scene = new Node();
  const display = new Display(scene);
  let width;
  let height;
  let count = 0;
  display.sizeProperty.lazyLink(size => {
    width = size.width;
    height = size.height;
    count++;
  });
  display.setWidthHeight(712, 217);
  assert.equal(width, 712, 'Scene resize width');
  assert.equal(height, 217, 'Scene resize height');
  assert.equal(count, 1, 'Scene resize count');
});
QUnit.test('Bounds events', assert => {
  const node = new Node();
  node.y = 10;
  const rect = new Rectangle(0, 0, 100, 50, {
    fill: '#f00'
  });
  rect.x = 10; // a transform, so we can verify everything is handled correctly
  node.addChild(rect);
  node.validateBounds();
  const epsilon = 0.0000001;
  node.childBoundsProperty.lazyLink(() => {
    assert.ok(node.childBounds.equalsEpsilon(new Bounds2(10, 0, 110, 30), epsilon), `Parent child bounds check: ${node.childBounds.toString()}`);
  });
  node.boundsProperty.lazyLink(() => {
    assert.ok(node.bounds.equalsEpsilon(new Bounds2(10, 10, 110, 40), epsilon), `Parent bounds check: ${node.bounds.toString()}`);
  });
  node.selfBoundsProperty.lazyLink(() => {
    assert.ok(false, 'Self bounds should not change for parent node');
  });
  rect.selfBoundsProperty.lazyLink(() => {
    assert.ok(rect.selfBounds.equalsEpsilon(new Bounds2(0, 0, 100, 30), epsilon), `Self bounds check: ${rect.selfBounds.toString()}`);
  });
  rect.boundsProperty.lazyLink(() => {
    assert.ok(rect.bounds.equalsEpsilon(new Bounds2(10, 0, 110, 30), epsilon), `Bounds check: ${rect.bounds.toString()}`);
  });
  rect.childBoundsProperty.lazyLink(() => {
    assert.ok(false, 'Child bounds should not change for leaf node');
  });
  rect.rectHeight = 30;
  node.validateBounds();
});
QUnit.test('Using a color instance', assert => {
  const scene = new Node();
  const rect = new Rectangle(0, 0, 100, 50);
  assert.ok(rect.fill === null, 'Always starts with a null fill');
  scene.addChild(rect);
  const color = new Color(255, 0, 0);
  rect.fill = color;
  color.setRGBA(0, 255, 0, 1);
});
QUnit.test('Bounds and Visible Bounds', assert => {
  const node = new Node();
  const rect = new Rectangle(0, 0, 100, 50);
  node.addChild(rect);
  assert.ok(node.visibleBounds.equals(new Bounds2(0, 0, 100, 50)), 'Visible Bounds Visible');
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Complete Bounds Visible');
  rect.visible = false;
  assert.ok(node.visibleBounds.equals(Bounds2.NOTHING), 'Visible Bounds Invisible');
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Complete Bounds Invisible');
});
QUnit.test('localBounds override', assert => {
  const node = new Node({
    y: 5
  });
  const rect = new Rectangle(0, 0, 100, 50);
  node.addChild(rect);
  rect.localBounds = new Bounds2(0, 0, 50, 50);
  assert.ok(node.localBounds.equals(new Bounds2(0, 0, 50, 50)), 'localBounds override on self');
  assert.ok(node.bounds.equals(new Bounds2(0, 5, 50, 55)), 'localBounds override on self');
  rect.localBounds = new Bounds2(0, 0, 50, 100);
  assert.ok(node.bounds.equals(new Bounds2(0, 5, 50, 105)), 'localBounds override 2nd on self');

  // reset local bounds (have them computed again)
  rect.localBounds = null;
  assert.ok(node.bounds.equals(new Bounds2(0, 5, 100, 55)), 'localBounds override reset on self');
  node.localBounds = new Bounds2(0, 0, 50, 200);
  assert.ok(node.localBounds.equals(new Bounds2(0, 0, 50, 200)), 'localBounds override on parent');
  assert.ok(node.bounds.equals(new Bounds2(0, 5, 50, 205)), 'localBounds override on parent');
});
function compareTrailArrays(a, b) {
  // defensive copies
  a = a.slice();
  b = b.slice();
  for (let i = 0; i < a.length; i++) {
    // for each A, remove the first matching one in B
    for (let j = 0; j < b.length; j++) {
      if (a[i].equals(b[j])) {
        b.splice(j, 1);
        break;
      }
    }
  }

  // now B should be empty
  return b.length === 0;
}
QUnit.test('getTrails/getUniqueTrail', assert => {
  const a = new Node();
  const b = new Node();
  const c = new Node();
  const d = new Node();
  const e = new Node();

  // DAG-like structure
  a.addChild(b);
  a.addChild(c);
  b.addChild(d);
  c.addChild(d);
  c.addChild(e);

  // getUniqueTrail()
  window.assert && assert.throws(() => {
    d.getUniqueTrail();
  }, 'D has no unique trail, since there are two');
  assert.ok(a.getUniqueTrail().equals(new Trail([a])), 'a.getUniqueTrail()');
  assert.ok(b.getUniqueTrail().equals(new Trail([a, b])), 'b.getUniqueTrail()');
  assert.ok(c.getUniqueTrail().equals(new Trail([a, c])), 'c.getUniqueTrail()');
  assert.ok(e.getUniqueTrail().equals(new Trail([a, c, e])), 'e.getUniqueTrail()');

  // getTrails()
  let trails;
  trails = a.getTrails();
  assert.ok(trails.length === 1 && trails[0].equals(new Trail([a])), 'a.getTrails()');
  trails = b.getTrails();
  assert.ok(trails.length === 1 && trails[0].equals(new Trail([a, b])), 'b.getTrails()');
  trails = c.getTrails();
  assert.ok(trails.length === 1 && trails[0].equals(new Trail([a, c])), 'c.getTrails()');
  trails = d.getTrails();
  assert.ok(trails.length === 2 && compareTrailArrays(trails, [new Trail([a, b, d]), new Trail([a, c, d])]), 'd.getTrails()');
  trails = e.getTrails();
  assert.ok(trails.length === 1 && trails[0].equals(new Trail([a, c, e])), 'e.getTrails()');

  // getUniqueTrail( predicate )
  window.assert && assert.throws(() => {
    e.getUniqueTrail(node => false);
  }, 'Fails on false predicate');
  window.assert && assert.throws(() => {
    e.getUniqueTrail(node => false);
  }, 'Fails on false predicate');
  assert.ok(e.getUniqueTrail(node => node === a).equals(new Trail([a, c, e])));
  assert.ok(e.getUniqueTrail(node => node === c).equals(new Trail([c, e])));
  assert.ok(e.getUniqueTrail(node => node === e).equals(new Trail([e])));
  assert.ok(d.getUniqueTrail(node => node === b).equals(new Trail([b, d])));
  assert.ok(d.getUniqueTrail(node => node === c).equals(new Trail([c, d])));
  assert.ok(d.getUniqueTrail(node => node === d).equals(new Trail([d])));

  // getTrails( predicate )
  trails = d.getTrails(node => false);
  assert.ok(trails.length === 0);
  trails = d.getTrails(node => true);
  assert.ok(compareTrailArrays(trails, [new Trail([a, b, d]), new Trail([b, d]), new Trail([a, c, d]), new Trail([c, d]), new Trail([d])]));
  trails = d.getTrails(node => node === a);
  assert.ok(compareTrailArrays(trails, [new Trail([a, b, d]), new Trail([a, c, d])]));
  trails = d.getTrails(node => node === b);
  assert.ok(compareTrailArrays(trails, [new Trail([b, d])]));
  trails = d.getTrails(node => node.parents.length === 1);
  assert.ok(compareTrailArrays(trails, [new Trail([b, d]), new Trail([c, d])]));
});
QUnit.test('getLeafTrails', assert => {
  const a = new Node();
  const b = new Node();
  const c = new Node();
  const d = new Node();
  const e = new Node();

  // DAG-like structure
  a.addChild(b);
  a.addChild(c);
  b.addChild(d);
  c.addChild(d);
  c.addChild(e);

  // getUniqueLeafTrail()
  window.assert && assert.throws(() => {
    a.getUniqueLeafTrail();
  }, 'A has no unique leaf trail, since there are three');
  assert.ok(b.getUniqueLeafTrail().equals(new Trail([b, d])), 'a.getUniqueLeafTrail()');
  assert.ok(d.getUniqueLeafTrail().equals(new Trail([d])), 'b.getUniqueLeafTrail()');
  assert.ok(e.getUniqueLeafTrail().equals(new Trail([e])), 'c.getUniqueLeafTrail()');

  // getLeafTrails()
  let trails;
  trails = a.getLeafTrails();
  assert.ok(trails.length === 3 && compareTrailArrays(trails, [new Trail([a, b, d]), new Trail([a, c, d]), new Trail([a, c, e])]), 'a.getLeafTrails()');
  trails = b.getLeafTrails();
  assert.ok(trails.length === 1 && trails[0].equals(new Trail([b, d])), 'b.getLeafTrails()');
  trails = c.getLeafTrails();
  assert.ok(trails.length === 2 && compareTrailArrays(trails, [new Trail([c, d]), new Trail([c, e])]), 'c.getLeafTrails()');
  trails = d.getLeafTrails();
  assert.ok(trails.length === 1 && trails[0].equals(new Trail([d])), 'd.getLeafTrails()');
  trails = e.getLeafTrails();
  assert.ok(trails.length === 1 && trails[0].equals(new Trail([e])), 'e.getLeafTrails()');

  // getUniqueLeafTrail( predicate )
  window.assert && assert.throws(() => {
    e.getUniqueLeafTrail(node => false);
  }, 'Fails on false predicate');
  window.assert && assert.throws(() => {
    a.getUniqueLeafTrail(node => true);
  }, 'Fails on multiples');
  assert.ok(a.getUniqueLeafTrail(node => node === e).equals(new Trail([a, c, e])));

  // getLeafTrails( predicate )
  trails = a.getLeafTrails(node => false);
  assert.ok(trails.length === 0);
  trails = a.getLeafTrails(node => true);
  assert.ok(compareTrailArrays(trails, [new Trail([a]), new Trail([a, b]), new Trail([a, b, d]), new Trail([a, c]), new Trail([a, c, d]), new Trail([a, c, e])]));

  // getLeafTrailsTo( node )
  trails = a.getLeafTrailsTo(d);
  assert.ok(compareTrailArrays(trails, [new Trail([a, b, d]), new Trail([a, c, d])]));
});
QUnit.test('Line stroked bounds', assert => {
  const line = new Line(0, 0, 50, 0, {
    stroke: 'red',
    lineWidth: 5
  });
  const positions = [{
    x1: 50,
    y1: 0,
    x2: 0,
    y2: 0
  }, {
    x1: 0,
    y1: 50,
    x2: 0,
    y2: 0
  }, {
    x1: 0,
    y1: 0,
    x2: 50,
    y2: 0
  }, {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 50
  }, {
    x1: 50,
    y1: 10,
    x2: 0,
    y2: 0
  }, {
    x1: 10,
    y1: 50,
    x2: 0,
    y2: 0
  }, {
    x1: 0,
    y1: 0,
    x2: 50,
    y2: 10
  }, {
    x1: 0,
    y1: 0,
    x2: 10,
    y2: 50
  }, {
    x1: 50,
    y1: -10,
    x2: 0,
    y2: 0
  }, {
    x1: -10,
    y1: 50,
    x2: 0,
    y2: 0
  }, {
    x1: 0,
    y1: 0,
    x2: 50,
    y2: -10
  }, {
    x1: 0,
    y1: 0,
    x2: -10,
    y2: 50
  }, {
    x1: 50,
    y1: 0,
    x2: 0,
    y2: 10
  }, {
    x1: 0,
    y1: 50,
    x2: 10,
    y2: 0
  }, {
    x1: 0,
    y1: 10,
    x2: 50,
    y2: 0
  }, {
    x1: 10,
    y1: 0,
    x2: 0,
    y2: 50
  }, {
    x1: 50,
    y1: 0,
    x2: 0,
    y2: -10
  }, {
    x1: 0,
    y1: 50,
    x2: -10,
    y2: 0
  }, {
    x1: 0,
    y1: -10,
    x2: 50,
    y2: 0
  }, {
    x1: -10,
    y1: 0,
    x2: 0,
    y2: 50
  }];
  const caps = ['round', 'butt', 'square'];
  _.each(positions, position => {
    line.mutate(position);
    // line.setLine( position.x1, position.y1, position.x2, position.y2 );
    _.each(caps, cap => {
      line.lineCap = cap;
      assert.ok(line.bounds.equalsEpsilon(line.getShape().getStrokedShape(line.getLineStyles()).bounds, 0.0001), `Line stroked bounds with ${JSON.stringify(position)} and ${cap} ${line.bounds.toString()}`);
    });
  });
});
QUnit.test('maxWidth/maxHeight for Node', assert => {
  const rect = new Rectangle(0, 0, 100, 50, {
    fill: 'red'
  });
  const node = new Node({
    children: [rect]
  });
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Initial bounds');
  node.maxWidth = 50;
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 50, 25)), 'Halved transform after max width of half');
  node.maxWidth = 120;
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Back to normal after a big max width');
  node.scale(2);
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 200, 100)), 'Scale up should be unaffected');
  node.maxWidth = 25;
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 50, 25)), 'Scaled back down with both applied');
  node.maxWidth = null;
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 200, 100)), 'Without maxWidth');
  node.scale(0.5);
  assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Back to normal');
  node.left = 50;
  assert.ok(node.bounds.equals(new Bounds2(50, 0, 150, 50)), 'After a translation');
  node.maxWidth = 50;
  assert.ok(node.bounds.equals(new Bounds2(50, 0, 100, 25)), 'maxWidth being applied after a translation, in local frame');
  rect.rectWidth = 200;
  assert.ok(node.bounds.equals(new Bounds2(50, 0, 100, 12.5)), 'Now with a bigger rectangle');
  rect.rectWidth = 100;
  node.maxWidth = null;
  assert.ok(node.bounds.equals(new Bounds2(50, 0, 150, 50)), 'Back to a translation');
  rect.maxWidth = 50;
  assert.ok(node.bounds.equals(new Bounds2(50, 0, 100, 25)), 'After maxWidth A');
  rect.maxHeight = 12.5;
  assert.ok(node.bounds.equals(new Bounds2(50, 0, 75, 12.5)), 'After maxHeight A');
});
QUnit.test('Spacers', assert => {
  const spacer = new Spacer(100, 50, {
    x: 50
  });
  assert.ok(spacer.bounds.equals(new Bounds2(50, 0, 150, 50)), 'Spacer bounds with translation');
  const hstrut = new HStrut(100, {
    y: 50
  });
  assert.ok(hstrut.bounds.equals(new Bounds2(0, 50, 100, 50)), 'HStrut bounds with translation');
  const vstrut = new VStrut(100, {
    x: 50
  });
  assert.ok(vstrut.bounds.equals(new Bounds2(50, 0, 50, 100)), 'VStrut bounds with translation');
  assert.throws(() => {
    spacer.addChild(new Node());
  }, 'No way to add children to Spacer');
  assert.throws(() => {
    hstrut.addChild(new Node());
  }, 'No way to add children to HStrut');
  assert.throws(() => {
    vstrut.addChild(new Node());
  }, 'No way to add children to VStrut');
});
QUnit.test('Renderer Summary', assert => {
  const canvasNode = new CanvasNode({
    canvasBounds: new Bounds2(0, 0, 10, 10)
  });
  const webglNode = new WebGLNode(() => {}, {
    canvasBounds: new Bounds2(0, 0, 10, 10)
  });
  const rect = new Rectangle(0, 0, 100, 50);
  const node = new Node({
    children: [canvasNode, webglNode, rect]
  });
  const emptyNode = new Node();
  assert.ok(canvasNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskCanvas), 'CanvasNode fully compatible: Canvas');
  assert.ok(!canvasNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'CanvasNode not fully compatible: SVG');
  assert.ok(canvasNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskCanvas), 'CanvasNode partially compatible: Canvas');
  assert.ok(!canvasNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'CanvasNode not partially compatible: SVG');
  assert.ok(canvasNode._rendererSummary.isSingleCanvasSupported(), 'CanvasNode supports single Canvas');
  assert.ok(!canvasNode._rendererSummary.isSingleSVGSupported(), 'CanvasNode does not support single SVG');
  assert.ok(!canvasNode._rendererSummary.isNotPainted(), 'CanvasNode is painted');
  assert.ok(canvasNode._rendererSummary.areBoundsValid(), 'CanvasNode has valid bounds');
  assert.ok(webglNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskWebGL), 'WebGLNode fully compatible: WebGL');
  assert.ok(!webglNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'WebGLNode not fully compatible: SVG');
  assert.ok(webglNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskWebGL), 'WebGLNode partially compatible: WebGL');
  assert.ok(!webglNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'WebGLNode not partially compatible: SVG');
  assert.ok(!webglNode._rendererSummary.isSingleCanvasSupported(), 'WebGLNode does not support single Canvas');
  assert.ok(!webglNode._rendererSummary.isSingleSVGSupported(), 'WebGLNode does not support single SVG');
  assert.ok(!webglNode._rendererSummary.isNotPainted(), 'WebGLNode is painted');
  assert.ok(webglNode._rendererSummary.areBoundsValid(), 'WebGLNode has valid bounds');
  assert.ok(rect._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskCanvas), 'Rectangle fully compatible: Canvas');
  assert.ok(rect._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'Rectangle fully compatible: SVG');
  assert.ok(rect._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskCanvas), 'Rectangle partially compatible: Canvas');
  assert.ok(rect._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'Rectangle partially compatible: SVG');
  assert.ok(rect._rendererSummary.isSingleCanvasSupported(), 'Rectangle does support single Canvas');
  assert.ok(rect._rendererSummary.isSingleSVGSupported(), 'Rectangle does support single SVG');
  assert.ok(!rect._rendererSummary.isNotPainted(), 'Rectangle is painted');
  assert.ok(rect._rendererSummary.areBoundsValid(), 'Rectangle has valid bounds');
  assert.ok(!node._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskCanvas), 'Container node fully compatible: Canvas');
  assert.ok(!node._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'Container node not fully compatible: SVG');
  assert.ok(node._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskCanvas), 'Container node partially compatible: Canvas');
  assert.ok(node._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'Container node partially compatible: SVG');
  assert.ok(!node._rendererSummary.isSingleCanvasSupported(), 'Container node does not support single Canvas');
  assert.ok(!node._rendererSummary.isSingleSVGSupported(), 'Container node does not support single SVG');
  assert.ok(!node._rendererSummary.isNotPainted(), 'Container node is painted');
  assert.ok(node._rendererSummary.areBoundsValid(), 'Container node has valid bounds');
  assert.ok(emptyNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskCanvas), 'Empty node fully compatible: Canvas');
  assert.ok(emptyNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'Empty node fully compatible: SVG');
  assert.ok(!emptyNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskCanvas), 'Empty node partially compatible: Canvas');
  assert.ok(!emptyNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'Empty node partially compatible: SVG');
  assert.ok(emptyNode._rendererSummary.isSingleCanvasSupported(), 'Empty node supports single Canvas');
  assert.ok(emptyNode._rendererSummary.isSingleSVGSupported(), 'Empty node supports single SVG');
  assert.ok(emptyNode._rendererSummary.isNotPainted(), 'Empty node is not painted');
  assert.ok(emptyNode._rendererSummary.areBoundsValid(), 'Empty node has valid bounds');
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIlNoYXBlIiwiQ2FudmFzTm9kZSIsIkNvbG9yIiwiRGlzcGxheSIsIkhTdHJ1dCIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlJlbmRlcmVyIiwiU3BhY2VyIiwiVGV4dCIsIlRleHRCb3VuZHMiLCJUcmFpbCIsIlRyYWlsUG9pbnRlciIsIlV0aWxzIiwiVlN0cnV0IiwiV2ViR0xOb2RlIiwiUVVuaXQiLCJtb2R1bGUiLCJlcXVhbHNBcHByb3giLCJhc3NlcnQiLCJhIiwiYiIsIm1lc3NhZ2UiLCJvayIsIk1hdGgiLCJhYnMiLCJjcmVhdGVUZXN0Tm9kZVRyZWUiLCJub2RlIiwiYWRkQ2hpbGQiLCJjaGlsZHJlbiIsInRlc3QiLCJ2YWxpZGF0ZUJvdW5kcyIsIl9jaGlsZEJvdW5kc0RpcnR5IiwiaW52YWxpZGF0ZUJvdW5kcyIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwibmVlZGVkTWV0aG9kcyIsIl8iLCJlYWNoIiwibWV0aG9kIiwidW5kZWZpbmVkIiwidHJhaWwiLCJlcXVhbCIsImxlbmd0aCIsIm5leHQiLCJwcmV2aW91cyIsInRyYWlscyIsImN1cnJlbnRUcmFpbCIsInB1c2giLCJpIiwiaiIsImNvbXBhcmlzb24iLCJjb21wYXJlIiwibWFwIiwidG9TdHJpbmciLCJqb2luIiwiaW5jbHVzaXZlTGlzdCIsImVhY2hUcmFpbEJldHdlZW4iLCJjb3B5IiwidHJhaWxTdHJpbmciLCJlcXVhbHMiLCJleGNsdXNpdmVMaXN0IiwidmlzaWJsZSIsImRlcHRoRmlyc3RVbnRpbCIsInBvaW50ZXIiLCJsYXN0Tm9kZSIsImlzVmlzaWJsZSIsImVhY2hUcmFpbFVuZGVyIiwiZ2V0VW5pcXVlVHJhaWwiLCJjb21wYXJlUmVuZGVyIiwicG9pbnRlcnMiLCJjb21wYXJlTmVzdGVkIiwiZm9yd2FyZHNDb3B5IiwibmVzdGVkRm9yd2FyZHMiLCJiYWNrd2FyZHNDb3B5IiwibmVzdGVkQmFja3dhcmRzIiwiY29udGVudHMiLCJpc09rIiwiayIsImluZGljZXMiLCJtZXRyaWNzIiwibWVhc3VyZVRleHQiLCJ3aWR0aCIsImMiLCJzZXRTaGFwZSIsInJlY3RhbmdsZSIsInJlbW92ZUNoaWxkIiwicmVjdEJvdW5kcyIsImNhbnZhc0FjY3VyYXRlQm91bmRzIiwiZmlsbFJlY3QiLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIiwidGV4dEJvdW5kcyIsImZpbGxUZXh0IiwiaXNDb25zaXN0ZW50IiwicHJlY2lzaW9uIiwidGV4dCIsImFjY3VyYXRlQ2FudmFzQm91bmRzRmFsbGJhY2siLCJmaWxsIiwiZ2V0RmlsbCIsIm90aGVyTm9kZSIsInNjYWxlIiwidHJhbnNsYXRlIiwicm90YXRlIiwiUEkiLCJnZXRNYXRyaXgiLCJtMDAiLCJtMDEiLCJtMDIiLCJtMTAiLCJtMTEiLCJtMTIiLCJ4IiwieSIsInJvdGF0aW9uIiwidHJhbnNsYXRpb24iLCJsZWZ0IiwicmlnaHQiLCJjZW50ZXJYIiwic2NlbmUiLCJkaXNwbGF5IiwiaGVpZ2h0IiwiY291bnQiLCJzaXplUHJvcGVydHkiLCJsYXp5TGluayIsInNpemUiLCJzZXRXaWR0aEhlaWdodCIsInJlY3QiLCJlcHNpbG9uIiwiY2hpbGRCb3VuZHNQcm9wZXJ0eSIsImNoaWxkQm91bmRzIiwiZXF1YWxzRXBzaWxvbiIsImJvdW5kc1Byb3BlcnR5IiwiYm91bmRzIiwic2VsZkJvdW5kc1Byb3BlcnR5Iiwic2VsZkJvdW5kcyIsInJlY3RIZWlnaHQiLCJjb2xvciIsInNldFJHQkEiLCJ2aXNpYmxlQm91bmRzIiwiTk9USElORyIsImxvY2FsQm91bmRzIiwiY29tcGFyZVRyYWlsQXJyYXlzIiwic2xpY2UiLCJzcGxpY2UiLCJkIiwiZSIsIndpbmRvdyIsInRocm93cyIsImdldFRyYWlscyIsInBhcmVudHMiLCJnZXRVbmlxdWVMZWFmVHJhaWwiLCJnZXRMZWFmVHJhaWxzIiwiZ2V0TGVhZlRyYWlsc1RvIiwibGluZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsInBvc2l0aW9ucyIsIngxIiwieTEiLCJ4MiIsInkyIiwiY2FwcyIsInBvc2l0aW9uIiwibXV0YXRlIiwiY2FwIiwibGluZUNhcCIsImdldFNoYXBlIiwiZ2V0U3Ryb2tlZFNoYXBlIiwiZ2V0TGluZVN0eWxlcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJtYXhXaWR0aCIsInJlY3RXaWR0aCIsIm1heEhlaWdodCIsInNwYWNlciIsImhzdHJ1dCIsInZzdHJ1dCIsImNhbnZhc05vZGUiLCJjYW52YXNCb3VuZHMiLCJ3ZWJnbE5vZGUiLCJlbXB0eU5vZGUiLCJfcmVuZGVyZXJTdW1tYXJ5IiwiaXNTdWJ0cmVlRnVsbHlDb21wYXRpYmxlIiwiYml0bWFza0NhbnZhcyIsImJpdG1hc2tTVkciLCJpc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSIsImlzU2luZ2xlQ2FudmFzU3VwcG9ydGVkIiwiaXNTaW5nbGVTVkdTdXBwb3J0ZWQiLCJpc05vdFBhaW50ZWQiLCJhcmVCb3VuZHNWYWxpZCIsImJpdG1hc2tXZWJHTCJdLCJzb3VyY2VzIjpbIlRyYWlsVGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVHJhaWwgdGVzdHNcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBDYW52YXNOb2RlLCBDb2xvciwgRGlzcGxheSwgSFN0cnV0LCBMaW5lLCBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFJlbmRlcmVyLCBTcGFjZXIsIFRleHQsIFRleHRCb3VuZHMsIFRyYWlsLCBUcmFpbFBvaW50ZXIsIFV0aWxzLCBWU3RydXQsIFdlYkdMTm9kZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnVHJhaWwnICk7XHJcblxyXG5mdW5jdGlvbiBlcXVhbHNBcHByb3goIGFzc2VydCwgYSwgYiwgbWVzc2FnZSApIHtcclxuICBhc3NlcnQub2soIE1hdGguYWJzKCBhIC0gYiApIDwgMC4wMDAwMDAxLCBgJHsoIG1lc3NhZ2UgPyBgJHttZXNzYWdlfTogYCA6ICcnICkgKyBhfSA9PyAke2J9YCApO1xyXG59XHJcblxyXG5cclxuLypcclxuVGhlIHRlc3QgdHJlZTpcclxublxyXG4gIG5cclxuICAgIG5cclxuICAgIG5cclxuICAgICAgblxyXG4gICAgblxyXG4gICAgblxyXG4gICAgICBuXHJcbiAgICAgICAgblxyXG4gICAgICBuXHJcbiAgICBuXHJcbiAgblxyXG4gIG5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVRlc3ROb2RlVHJlZSgpIHtcclxuICBjb25zdCBub2RlID0gbmV3IE5vZGUoKTtcclxuICBub2RlLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcbiAgbm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xyXG4gIG5vZGUuYWRkQ2hpbGQoIG5ldyBOb2RlKCkgKTtcclxuXHJcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcblxyXG4gIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMSBdLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uYWRkQ2hpbGQoIG5ldyBOb2RlKCkgKTtcclxuICBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xyXG5cclxuICBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMCBdLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcblxyXG4gIHJldHVybiBub2RlO1xyXG59XHJcblxyXG5RVW5pdC50ZXN0KCAnRGlydHkgYm91bmRzIHByb3BhZ2F0aW9uIHRlc3QnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG5vZGUgPSBjcmVhdGVUZXN0Tm9kZVRyZWUoKTtcclxuXHJcbiAgbm9kZS52YWxpZGF0ZUJvdW5kcygpO1xyXG5cclxuICBhc3NlcnQub2soICFub2RlLl9jaGlsZEJvdW5kc0RpcnR5ICk7XHJcblxyXG4gIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmNoaWxkcmVuWyAwIF0uaW52YWxpZGF0ZUJvdW5kcygpO1xyXG5cclxuICBhc3NlcnQub2soIG5vZGUuX2NoaWxkQm91bmRzRGlydHkgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0NhbnZhcyAyRCBDb250ZXh0IGFuZCBGZWF0dXJlcycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBjb250ZXh0LCAnY29udGV4dCcgKTtcclxuXHJcbiAgY29uc3QgbmVlZGVkTWV0aG9kcyA9IFtcclxuICAgICdhcmMnLFxyXG4gICAgJ2FyY1RvJyxcclxuICAgICdiZWdpblBhdGgnLFxyXG4gICAgJ2JlemllckN1cnZlVG8nLFxyXG4gICAgJ2NsZWFyUmVjdCcsXHJcbiAgICAnY2xpcCcsXHJcbiAgICAnY2xvc2VQYXRoJyxcclxuICAgICdmaWxsJyxcclxuICAgICdmaWxsUmVjdCcsXHJcbiAgICAnZmlsbFN0eWxlJyxcclxuICAgICdpc1BvaW50SW5QYXRoJyxcclxuICAgICdsaW5lVG8nLFxyXG4gICAgJ21vdmVUbycsXHJcbiAgICAncmVjdCcsXHJcbiAgICAncmVzdG9yZScsXHJcbiAgICAncXVhZHJhdGljQ3VydmVUbycsXHJcbiAgICAnc2F2ZScsXHJcbiAgICAnc2V0VHJhbnNmb3JtJyxcclxuICAgICdzdHJva2UnLFxyXG4gICAgJ3N0cm9rZVJlY3QnLFxyXG4gICAgJ3N0cm9rZVN0eWxlJ1xyXG4gIF07XHJcbiAgXy5lYWNoKCBuZWVkZWRNZXRob2RzLCBtZXRob2QgPT4ge1xyXG4gICAgYXNzZXJ0Lm9rKCBjb250ZXh0WyBtZXRob2QgXSAhPT0gdW5kZWZpbmVkLCBgY29udGV4dC4ke21ldGhvZH1gICk7XHJcbiAgfSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVHJhaWwgbmV4dC9wcmV2aW91cycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgbm9kZSA9IGNyZWF0ZVRlc3ROb2RlVHJlZSgpO1xyXG5cclxuICAvLyB3YWxrIGl0IGZvcndhcmRcclxuICBsZXQgdHJhaWwgPSBuZXcgVHJhaWwoIFsgbm9kZSBdICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCAxLCB0cmFpbC5sZW5ndGggKTtcclxuICB0cmFpbCA9IHRyYWlsLm5leHQoKTtcclxuICBhc3NlcnQuZXF1YWwoIDIsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwubmV4dCgpO1xyXG4gIGFzc2VydC5lcXVhbCggMywgdHJhaWwubGVuZ3RoICk7XHJcbiAgdHJhaWwgPSB0cmFpbC5uZXh0KCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCAzLCB0cmFpbC5sZW5ndGggKTtcclxuICB0cmFpbCA9IHRyYWlsLm5leHQoKTtcclxuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwubmV4dCgpO1xyXG4gIGFzc2VydC5lcXVhbCggMywgdHJhaWwubGVuZ3RoICk7XHJcbiAgdHJhaWwgPSB0cmFpbC5uZXh0KCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCAzLCB0cmFpbC5sZW5ndGggKTtcclxuICB0cmFpbCA9IHRyYWlsLm5leHQoKTtcclxuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwubmV4dCgpO1xyXG4gIGFzc2VydC5lcXVhbCggNSwgdHJhaWwubGVuZ3RoICk7XHJcbiAgdHJhaWwgPSB0cmFpbC5uZXh0KCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCA0LCB0cmFpbC5sZW5ndGggKTtcclxuICB0cmFpbCA9IHRyYWlsLm5leHQoKTtcclxuICBhc3NlcnQuZXF1YWwoIDMsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwubmV4dCgpO1xyXG4gIGFzc2VydC5lcXVhbCggMiwgdHJhaWwubGVuZ3RoICk7XHJcbiAgdHJhaWwgPSB0cmFpbC5uZXh0KCk7XHJcbiAgYXNzZXJ0LmVxdWFsKCAyLCB0cmFpbC5sZW5ndGggKTtcclxuXHJcbiAgLy8gbWFrZSBzdXJlIHdhbGtpbmcgb2ZmIHRoZSBlbmQgZ2l2ZXMgdXMgbnVsbFxyXG4gIGFzc2VydC5lcXVhbCggbnVsbCwgdHJhaWwubmV4dCgpICk7XHJcblxyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDIsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDMsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDUsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDMsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDMsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDMsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDMsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDIsIHRyYWlsLmxlbmd0aCApO1xyXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcclxuICBhc3NlcnQuZXF1YWwoIDEsIHRyYWlsLmxlbmd0aCApO1xyXG5cclxuICAvLyBtYWtlIHN1cmUgd2Fsa2luZyBvZmYgdGhlIHN0YXJ0IGdpdmVzIHVzIG51bGxcclxuICBhc3NlcnQuZXF1YWwoIG51bGwsIHRyYWlsLnByZXZpb3VzKCkgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1RyYWlsIGNvbXBhcmlzb24nLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG5vZGUgPSBjcmVhdGVUZXN0Tm9kZVRyZWUoKTtcclxuXHJcbiAgLy8gZ2V0IGEgbGlzdCBvZiBhbGwgdHJhaWxzIGluIHJlbmRlciBvcmRlclxyXG4gIGNvbnN0IHRyYWlscyA9IFtdO1xyXG4gIGxldCBjdXJyZW50VHJhaWwgPSBuZXcgVHJhaWwoIG5vZGUgKTsgLy8gc3RhcnQgYXQgdGhlIGZpcnN0IG5vZGVcclxuXHJcbiAgd2hpbGUgKCBjdXJyZW50VHJhaWwgKSB7XHJcbiAgICB0cmFpbHMucHVzaCggY3VycmVudFRyYWlsICk7XHJcbiAgICBjdXJyZW50VHJhaWwgPSBjdXJyZW50VHJhaWwubmV4dCgpO1xyXG4gIH1cclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCAxMywgdHJhaWxzLmxlbmd0aCwgJ1RyYWlsIGZvciBlYWNoIG5vZGUnICk7XHJcblxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHRyYWlscy5sZW5ndGg7IGkrKyApIHtcclxuICAgIGZvciAoIGxldCBqID0gaTsgaiA8IHRyYWlscy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgY29uc3QgY29tcGFyaXNvbiA9IHRyYWlsc1sgaSBdLmNvbXBhcmUoIHRyYWlsc1sgaiBdICk7XHJcblxyXG4gICAgICAvLyBtYWtlIHN1cmUgdGhhdCBldmVyeSB0cmFpbCBjb21wYXJlcyBhcyBleHBlY3RlZCAoMCBhbmQgdGhleSBhcmUgZXF1YWwsIC0xIGFuZCBpIDwgailcclxuICAgICAgYXNzZXJ0LmVxdWFsKCBpID09PSBqID8gMCA6ICggaSA8IGogPyAtMSA6IDEgKSwgY29tcGFyaXNvbiwgYCR7aX0sJHtqfWAgKTtcclxuICAgIH1cclxuICB9XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUcmFpbCBlYWNoVHJhaWxCZXR3ZWVuJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBub2RlID0gY3JlYXRlVGVzdE5vZGVUcmVlKCk7XHJcblxyXG4gIC8vIGdldCBhIGxpc3Qgb2YgYWxsIHRyYWlscyBpbiByZW5kZXIgb3JkZXJcclxuICBjb25zdCB0cmFpbHMgPSBbXTtcclxuICBsZXQgY3VycmVudFRyYWlsID0gbmV3IFRyYWlsKCBub2RlICk7IC8vIHN0YXJ0IGF0IHRoZSBmaXJzdCBub2RlXHJcblxyXG4gIHdoaWxlICggY3VycmVudFRyYWlsICkge1xyXG4gICAgdHJhaWxzLnB1c2goIGN1cnJlbnRUcmFpbCApO1xyXG4gICAgY3VycmVudFRyYWlsID0gY3VycmVudFRyYWlsLm5leHQoKTtcclxuICB9XHJcblxyXG4gIGFzc2VydC5lcXVhbCggMTMsIHRyYWlscy5sZW5ndGgsIGBUcmFpbHM6ICR7Xy5tYXAoIHRyYWlscywgdHJhaWwgPT4gdHJhaWwudG9TdHJpbmcoKSApLmpvaW4oICdcXG4nICl9YCApO1xyXG5cclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICBmb3IgKCBsZXQgaiA9IGk7IGogPCB0cmFpbHMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgIGNvbnN0IGluY2x1c2l2ZUxpc3QgPSBbXTtcclxuICAgICAgVHJhaWwuZWFjaFRyYWlsQmV0d2VlbiggdHJhaWxzWyBpIF0sIHRyYWlsc1sgaiBdLCB0cmFpbCA9PiB7XHJcbiAgICAgICAgaW5jbHVzaXZlTGlzdC5wdXNoKCB0cmFpbC5jb3B5KCkgKTtcclxuICAgICAgfSwgZmFsc2UsIG5vZGUgKTtcclxuICAgICAgY29uc3QgdHJhaWxTdHJpbmcgPSBgJHtpfSwke2p9ICR7dHJhaWxzWyBpIF0udG9TdHJpbmcoKX0gdG8gJHt0cmFpbHNbIGogXS50b1N0cmluZygpfWA7XHJcbiAgICAgIGFzc2VydC5vayggaW5jbHVzaXZlTGlzdFsgMCBdLmVxdWFscyggdHJhaWxzWyBpIF0gKSwgYGluY2x1c2l2ZSBzdGFydCBvbiAke3RyYWlsU3RyaW5nfSBpcyAke2luY2x1c2l2ZUxpc3RbIDAgXS50b1N0cmluZygpfWAgKTtcclxuICAgICAgYXNzZXJ0Lm9rKCBpbmNsdXNpdmVMaXN0WyBpbmNsdXNpdmVMaXN0Lmxlbmd0aCAtIDEgXS5lcXVhbHMoIHRyYWlsc1sgaiBdICksIGBpbmNsdXNpdmUgZW5kIG9uICR7dHJhaWxTdHJpbmd9aXMgJHtpbmNsdXNpdmVMaXN0WyBpbmNsdXNpdmVMaXN0Lmxlbmd0aCAtIDEgXS50b1N0cmluZygpfWAgKTtcclxuICAgICAgYXNzZXJ0LmVxdWFsKCBpbmNsdXNpdmVMaXN0Lmxlbmd0aCwgaiAtIGkgKyAxLCBgaW5jbHVzaXZlIGxlbmd0aCBvbiAke3RyYWlsU3RyaW5nfSBpcyAke2luY2x1c2l2ZUxpc3QubGVuZ3RofSwgJHtfLm1hcCggaW5jbHVzaXZlTGlzdCwgdHJhaWwgPT4gdHJhaWwudG9TdHJpbmcoKSApLmpvaW4oICdcXG4nICl9YCApO1xyXG5cclxuICAgICAgaWYgKCBpIDwgaiApIHtcclxuICAgICAgICBjb25zdCBleGNsdXNpdmVMaXN0ID0gW107XHJcbiAgICAgICAgVHJhaWwuZWFjaFRyYWlsQmV0d2VlbiggdHJhaWxzWyBpIF0sIHRyYWlsc1sgaiBdLCB0cmFpbCA9PiB7XHJcbiAgICAgICAgICBleGNsdXNpdmVMaXN0LnB1c2goIHRyYWlsLmNvcHkoKSApO1xyXG4gICAgICAgIH0sIHRydWUsIG5vZGUgKTtcclxuICAgICAgICBhc3NlcnQuZXF1YWwoIGV4Y2x1c2l2ZUxpc3QubGVuZ3RoLCBqIC0gaSAtIDEsIGBleGNsdXNpdmUgbGVuZ3RoIG9uICR7aX0sJHtqfWAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2RlcHRoRmlyc3RVbnRpbCBkZXB0aEZpcnN0VW50aWwgd2l0aCBzdWJ0cmVlIHNraXBwaW5nJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBub2RlID0gY3JlYXRlVGVzdE5vZGVUcmVlKCk7XHJcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAyIF0udmlzaWJsZSA9IGZhbHNlO1xyXG4gIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLnZpc2libGUgPSBmYWxzZTtcclxuICBuZXcgVHJhaWxQb2ludGVyKCBuZXcgVHJhaWwoIG5vZGUgKSwgdHJ1ZSApLmRlcHRoRmlyc3RVbnRpbCggbmV3IFRyYWlsUG9pbnRlciggbmV3IFRyYWlsKCBub2RlICksIGZhbHNlICksIHBvaW50ZXIgPT4ge1xyXG4gICAgaWYgKCAhcG9pbnRlci50cmFpbC5sYXN0Tm9kZSgpLmlzVmlzaWJsZSgpICkge1xyXG4gICAgICAvLyBzaG91bGQgc2tpcFxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGFzc2VydC5vayggcG9pbnRlci50cmFpbC5pc1Zpc2libGUoKSwgYFRyYWlsIHZpc2liaWxpdHkgZm9yICR7cG9pbnRlci50cmFpbC50b1N0cmluZygpfWAgKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9LCBmYWxzZSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnVHJhaWwgZWFjaFRyYWlsVW5kZXIgd2l0aCBzdWJ0cmVlIHNraXBwaW5nJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBub2RlID0gY3JlYXRlVGVzdE5vZGVUcmVlKCk7XHJcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAyIF0udmlzaWJsZSA9IGZhbHNlO1xyXG4gIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLnZpc2libGUgPSBmYWxzZTtcclxuICBuZXcgVHJhaWwoIG5vZGUgKS5lYWNoVHJhaWxVbmRlciggdHJhaWwgPT4ge1xyXG4gICAgaWYgKCAhdHJhaWwubGFzdE5vZGUoKS5pc1Zpc2libGUoKSApIHtcclxuICAgICAgLy8gc2hvdWxkIHNraXBcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBhc3NlcnQub2soIHRyYWlsLmlzVmlzaWJsZSgpLCBgVHJhaWwgdmlzaWJpbGl0eSBmb3IgJHt0cmFpbC50b1N0cmluZygpfWAgKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUcmFpbFBvaW50ZXIgcmVuZGVyIGNvbXBhcmlzb24nLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG5vZGUgPSBjcmVhdGVUZXN0Tm9kZVRyZWUoKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCAwLCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKS5jb21wYXJlUmVuZGVyKCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSApLCAnU2FtZSBiZWZvcmUgcG9pbnRlcicgKTtcclxuICBhc3NlcnQuZXF1YWwoIDAsIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKS5jb21wYXJlUmVuZGVyKCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICkgKSwgJ1NhbWUgYWZ0ZXIgcG9pbnRlcicgKTtcclxuICBhc3NlcnQuZXF1YWwoIC0xLCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKS5jb21wYXJlUmVuZGVyKCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICkgKSwgJ1NhbWUgbm9kZSBiZWZvcmUvYWZ0ZXIgcm9vdCcgKTtcclxuICBhc3NlcnQuZXF1YWwoIC0xLCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLmNvbXBhcmVSZW5kZXIoIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApICksICdTYW1lIG5vZGUgYmVmb3JlL2FmdGVyIG5vbnJvb3QnICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCAwLCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICkuY29tcGFyZVJlbmRlciggbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAyIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApICksICdFcXVpdmFsZW5jZSBvZiBiZWZvcmUvYWZ0ZXInICk7XHJcblxyXG4gIC8vIGFsbCBwb2ludGVycyBpbiB0aGUgcmVuZGVyIG9yZGVyXHJcbiAgY29uc3QgcG9pbnRlcnMgPSBbXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAxIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDIgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDIgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDQgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDQgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMiBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDIgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApXHJcbiAgXTtcclxuXHJcbiAgLy8gY29tcGFyZSB0aGUgcG9pbnRlcnMuIGRpZmZlcmVudCBvbmVzIGNhbiBiZSBlcXVhbCBpZiB0aGV5IHJlcHJlc2VudCB0aGUgc2FtZSBwbGFjZSwgc28gd2Ugb25seSBjaGVjayBpZiB0aGV5IGNvbXBhcmUgZGlmZmVyZW50bHlcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwb2ludGVycy5sZW5ndGg7IGkrKyApIHtcclxuICAgIGZvciAoIGxldCBqID0gaTsgaiA8IHBvaW50ZXJzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICBjb25zdCBjb21wYXJpc29uID0gcG9pbnRlcnNbIGkgXS5jb21wYXJlUmVuZGVyKCBwb2ludGVyc1sgaiBdICk7XHJcblxyXG4gICAgICBpZiAoIGNvbXBhcmlzb24gPT09IC0xICkge1xyXG4gICAgICAgIGFzc2VydC5vayggaSA8IGosIGAke2l9LCR7an1gICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBjb21wYXJpc29uID09PSAxICkge1xyXG4gICAgICAgIGFzc2VydC5vayggaSA+IGosIGAke2l9LCR7an1gICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUcmFpbFBvaW50ZXIgbmVzdGVkIGNvbXBhcmlzb24gYW5kIGZvd2FyZHMvYmFja3dhcmRzJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBub2RlID0gY3JlYXRlVGVzdE5vZGVUcmVlKCk7XHJcblxyXG4gIC8vIGFsbCBwb2ludGVycyBpbiB0aGUgbmVzdGVkIG9yZGVyXHJcbiAgY29uc3QgcG9pbnRlcnMgPSBbXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAxIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAxIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAyIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAyIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXHJcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyA0IF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyA0IF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMiBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcclxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDIgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxyXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApXHJcbiAgXTtcclxuXHJcbiAgLy8gZXhoYXVzdGl2ZWx5IHZlcmlmeSB0aGUgb3JkZXJpbmcgYmV0d2VlbiBlYWNoIG9yZGVyZWQgcGFpclxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHBvaW50ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgZm9yICggbGV0IGogPSBpOyBqIDwgcG9pbnRlcnMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBwb2ludGVyc1sgaSBdLmNvbXBhcmVOZXN0ZWQoIHBvaW50ZXJzWyBqIF0gKTtcclxuXHJcbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IGV2ZXJ5IHBvaW50ZXIgY29tcGFyZXMgYXMgZXhwZWN0ZWQgKDAgYW5kIHRoZXkgYXJlIGVxdWFsLCAtMSBhbmQgaSA8IGopXHJcbiAgICAgIGFzc2VydC5lcXVhbCggY29tcGFyaXNvbiwgaSA9PT0gaiA/IDAgOiAoIGkgPCBqID8gLTEgOiAxICksIGBjb21wYXJlTmVzdGVkOiAke2l9LCR7an1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyB2ZXJpZnkgZm9yd2FyZHMgYW5kIGJhY2t3YXJkcywgYXMgd2VsbCBhcyBjb3B5IGNvbnN0cnVjdG9yc1xyXG4gIGZvciAoIGxldCBpID0gMTsgaSA8IHBvaW50ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgY29uc3QgYSA9IHBvaW50ZXJzWyBpIC0gMSBdO1xyXG4gICAgY29uc3QgYiA9IHBvaW50ZXJzWyBpIF07XHJcblxyXG4gICAgY29uc3QgZm9yd2FyZHNDb3B5ID0gYS5jb3B5KCk7XHJcbiAgICBmb3J3YXJkc0NvcHkubmVzdGVkRm9yd2FyZHMoKTtcclxuICAgIGFzc2VydC5lcXVhbCggZm9yd2FyZHNDb3B5LmNvbXBhcmVOZXN0ZWQoIGIgKSwgMCwgYGZvcndhcmRzUG9pbnRlckNoZWNrICR7aSAtIDF9IHRvICR7aX1gICk7XHJcblxyXG4gICAgY29uc3QgYmFja3dhcmRzQ29weSA9IGIuY29weSgpO1xyXG4gICAgYmFja3dhcmRzQ29weS5uZXN0ZWRCYWNrd2FyZHMoKTtcclxuICAgIGFzc2VydC5lcXVhbCggYmFja3dhcmRzQ29weS5jb21wYXJlTmVzdGVkKCBhICksIDAsIGBiYWNrd2FyZHNQb2ludGVyQ2hlY2sgJHtpfSB0byAke2kgLSAxfWAgKTtcclxuICB9XHJcblxyXG4gIC8vIGV4aGF1c3RpdmVseSBjaGVjayBkZXB0aEZpcnN0VW50aWwgaW5jbHVzaXZlXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcG9pbnRlcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICBmb3IgKCBsZXQgaiA9IGkgKyAxOyBqIDwgcG9pbnRlcnMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgIC8vIGkgPCBqIGd1YXJhbnRlZWRcclxuICAgICAgY29uc3QgY29udGVudHMgPSBbXTtcclxuICAgICAgcG9pbnRlcnNbIGkgXS5kZXB0aEZpcnN0VW50aWwoIHBvaW50ZXJzWyBqIF0sIHBvaW50ZXIgPT4geyBjb250ZW50cy5wdXNoKCBwb2ludGVyLmNvcHkoKSApOyB9LCBmYWxzZSApO1xyXG4gICAgICBhc3NlcnQuZXF1YWwoIGNvbnRlbnRzLmxlbmd0aCwgaiAtIGkgKyAxLCBgZGVwdGhGaXJzdFVudGlsIGluY2x1c2l2ZSAke2l9LCR7an0gY291bnQgY2hlY2tgICk7XHJcblxyXG4gICAgICAvLyBkbyBhbiBhY3R1YWwgcG9pbnRlciB0byBwb2ludGVyIGNvbXBhcmlzb25cclxuICAgICAgbGV0IGlzT2sgPSB0cnVlO1xyXG4gICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBjb250ZW50cy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICBjb25zdCBjb21wYXJpc29uID0gY29udGVudHNbIGsgXS5jb21wYXJlTmVzdGVkKCBwb2ludGVyc1sgaSArIGsgXSApO1xyXG4gICAgICAgIGlmICggY29tcGFyaXNvbiAhPT0gMCApIHtcclxuICAgICAgICAgIGFzc2VydC5lcXVhbCggY29tcGFyaXNvbiwgMCwgYGRlcHRoRmlyc3RVbnRpbCBpbmNsdXNpdmUgJHtpfSwke2p9LCR7a30gY29tcGFyaXNvbiBjaGVjayAke2NvbnRlbnRzWyBrIF0udHJhaWwuaW5kaWNlcy5qb2luKCl9IC0gJHtwb2ludGVyc1sgaSArIGsgXS50cmFpbC5pbmRpY2VzLmpvaW4oKX1gICk7XHJcbiAgICAgICAgICBpc09rID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGFzc2VydC5vayggaXNPaywgYGRlcHRoRmlyc3RVbnRpbCBpbmNsdXNpdmUgJHtpfSwke2p9IGNvbXBhcmlzb24gY2hlY2tgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBleGhhdXN0aXZlbHkgY2hlY2sgZGVwdGhGaXJzdFVudGlsIGV4Y2x1c2l2ZVxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHBvaW50ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgZm9yICggbGV0IGogPSBpICsgMTsgaiA8IHBvaW50ZXJzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAvLyBpIDwgaiBndWFyYW50ZWVkXHJcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gW107XHJcbiAgICAgIHBvaW50ZXJzWyBpIF0uZGVwdGhGaXJzdFVudGlsKCBwb2ludGVyc1sgaiBdLCBwb2ludGVyID0+IHsgY29udGVudHMucHVzaCggcG9pbnRlci5jb3B5KCkgKTsgfSwgdHJ1ZSApO1xyXG4gICAgICBhc3NlcnQuZXF1YWwoIGNvbnRlbnRzLmxlbmd0aCwgaiAtIGkgLSAxLCBgZGVwdGhGaXJzdFVudGlsIGV4Y2x1c2l2ZSAke2l9LCR7an0gY291bnQgY2hlY2tgICk7XHJcblxyXG4gICAgICAvLyBkbyBhbiBhY3R1YWwgcG9pbnRlciB0byBwb2ludGVyIGNvbXBhcmlzb25cclxuICAgICAgbGV0IGlzT2sgPSB0cnVlO1xyXG4gICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBjb250ZW50cy5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICBjb25zdCBjb21wYXJpc29uID0gY29udGVudHNbIGsgXS5jb21wYXJlTmVzdGVkKCBwb2ludGVyc1sgaSArIGsgKyAxIF0gKTtcclxuICAgICAgICBpZiAoIGNvbXBhcmlzb24gIT09IDAgKSB7XHJcbiAgICAgICAgICBhc3NlcnQuZXF1YWwoIGNvbXBhcmlzb24sIDAsIGBkZXB0aEZpcnN0VW50aWwgZXhjbHVzaXZlICR7aX0sJHtqfSwke2t9IGNvbXBhcmlzb24gY2hlY2sgJHtjb250ZW50c1sgayBdLnRyYWlsLmluZGljZXMuam9pbigpfSAtICR7cG9pbnRlcnNbIGkgKyBrIF0udHJhaWwuaW5kaWNlcy5qb2luKCl9YCApO1xyXG4gICAgICAgICAgaXNPayA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBhc3NlcnQub2soIGlzT2ssIGBkZXB0aEZpcnN0VW50aWwgZXhjbHVzaXZlICR7aX0sJHtqfSBjb21wYXJpc29uIGNoZWNrYCApO1xyXG4gICAgfVxyXG4gIH1cclxufSApO1xyXG5cclxuLy8gUVVuaXQudGVzdCggJ1RyYWlsSW50ZXJ2YWwnLCBmdW5jdGlvbihhc3NlcnQpIHtcclxuLy8gICBsZXQgbm9kZSA9IGNyZWF0ZVRlc3ROb2RlVHJlZSgpO1xyXG4vLyAgIGxldCBpLCBqO1xyXG5cclxuLy8gICAvLyBhIHN1YnNldCBvZiB0cmFpbHMgdG8gdGVzdCBvblxyXG4vLyAgIGxldCB0cmFpbHMgPSBbXHJcbi8vICAgICBudWxsLFxyXG4vLyAgICAgbm9kZS5jaGlsZHJlblswXS5nZXRVbmlxdWVUcmFpbCgpLFxyXG4vLyAgICAgbm9kZS5jaGlsZHJlblswXS5jaGlsZHJlblsxXS5nZXRVbmlxdWVUcmFpbCgpLCAvLyBjb21tZW50ZWQgb3V0IHNpbmNlIGl0IHF1aWNrbHkgY3JlYXRlcyBtYW55IHRlc3RzIHRvIGluY2x1ZGVcclxuLy8gICAgIG5vZGUuY2hpbGRyZW5bMF0uY2hpbGRyZW5bM10uY2hpbGRyZW5bMF0uZ2V0VW5pcXVlVHJhaWwoKSxcclxuLy8gICAgIG5vZGUuY2hpbGRyZW5bMV0uZ2V0VW5pcXVlVHJhaWwoKSxcclxuLy8gICAgIG51bGxcclxuLy8gICBdO1xyXG5cclxuLy8gICAvLyBnZXQgYSBsaXN0IG9mIGFsbCB0cmFpbHNcclxuLy8gICBsZXQgYWxsVHJhaWxzID0gW107XHJcbi8vICAgbGV0IHQgPSBub2RlLmdldFVuaXF1ZVRyYWlsKCk7XHJcbi8vICAgd2hpbGUgKCB0ICkge1xyXG4vLyAgICAgYWxsVHJhaWxzLnB1c2goIHQgKTtcclxuLy8gICAgIHQgPSB0Lm5leHQoKTtcclxuLy8gICB9XHJcblxyXG4vLyAgIC8vIGdldCBhIGxpc3Qgb2YgYWxsIGludGVydmFscyB1c2luZyBvdXIgJ3RyYWlscycgYXJyYXlcclxuLy8gICBsZXQgaW50ZXJ2YWxzID0gW107XHJcblxyXG4vLyAgIGZvciAoIGkgPSAwOyBpIDwgdHJhaWxzLmxlbmd0aDsgaSsrICkge1xyXG4vLyAgICAgLy8gb25seSBjcmVhdGUgcHJvcGVyIGludGVydmFscyB3aGVyZSBpIDwgaiwgc2luY2Ugd2Ugc3BlY2lmaWVkIHRoZW0gaW4gb3JkZXJcclxuLy8gICAgIGZvciAoIGogPSBpICsgMTsgaiA8IHRyYWlscy5sZW5ndGg7IGorKyApIHtcclxuLy8gICAgICAgbGV0IGludGVydmFsID0gbmV3IFRyYWlsSW50ZXJ2YWwoIHRyYWlsc1tpXSwgdHJhaWxzW2pdICk7XHJcbi8vICAgICAgIGludGVydmFscy5wdXNoKCBpbnRlcnZhbCApO1xyXG5cclxuLy8gICAgICAgLy8gdGFnIHRoZSBpbnRlcnZhbCwgc28gd2UgY2FuIGRvIGFkZGl0aW9uYWwgdmVyaWZpY2F0aW9uIGxhdGVyXHJcbi8vICAgICAgIGludGVydmFsLmkgPSBpO1xyXG4vLyAgICAgICBpbnRlcnZhbC5qID0gajtcclxuLy8gICAgIH1cclxuLy8gICB9XHJcblxyXG4vLyAgIC8vIGNoZWNrIGV2ZXJ5IGNvbWJpbmF0aW9uIG9mIGludGVydmFsc1xyXG4vLyAgIGZvciAoIGkgPSAwOyBpIDwgaW50ZXJ2YWxzLmxlbmd0aDsgaSsrICkge1xyXG4vLyAgICAgbGV0IGEgPSBpbnRlcnZhbHNbaV07XHJcbi8vICAgICBmb3IgKCBqID0gMDsgaiA8IGludGVydmFscy5sZW5ndGg7IGorKyApIHtcclxuLy8gICAgICAgbGV0IGIgPSBpbnRlcnZhbHNbal07XHJcblxyXG4vLyAgICAgICBsZXQgdW5pb24gPSBhLnVuaW9uKCBiICk7XHJcbi8vICAgICAgIGlmICggYS5leGNsdXNpdmVVbmlvbmFibGUoIGIgKSApIHtcclxuLy8gICAgICAgICBfLmVhY2goIGFsbFRyYWlscywgZnVuY3Rpb24oIHRyYWlsICkge1xyXG4vLyAgICAgICAgICAgaWYgKCB0cmFpbCApIHtcclxuLy8gICAgICAgICAgICAgbGV0IG1zZyA9ICd1bmlvbiBjaGVjayBvZiB0cmFpbCAnICsgdHJhaWwudG9TdHJpbmcoKSArICcgd2l0aCAnICsgYS50b1N0cmluZygpICsgJyBhbmQgJyArIGIudG9TdHJpbmcoKSArICcgd2l0aCB1bmlvbiAnICsgdW5pb24udG9TdHJpbmcoKTtcclxuLy8gICAgICAgICAgICBhc3NlcnQuZXF1YWwoIGEuZXhjbHVzaXZlQ29udGFpbnMoIHRyYWlsICkgfHwgYi5leGNsdXNpdmVDb250YWlucyggdHJhaWwgKSwgdW5pb24uZXhjbHVzaXZlQ29udGFpbnMoIHRyYWlsICksIG1zZyApO1xyXG4vLyAgICAgICAgICAgfVxyXG4vLyAgICAgICAgIH0gKTtcclxuLy8gICAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICBsZXQgd291bGRCZUJhZFVuaW9uID0gZmFsc2U7XHJcbi8vICAgICAgICAgbGV0IGNvbnRhaW5zQW55dGhpbmcgPSBmYWxzZTtcclxuLy8gICAgICAgICBfLmVhY2goIGFsbFRyYWlscywgZnVuY3Rpb24oIHRyYWlsICkge1xyXG4vLyAgICAgICAgICAgaWYgKCB0cmFpbCApIHtcclxuLy8gICAgICAgICAgICAgaWYgKCB1bmlvbi5leGNsdXNpdmVDb250YWlucyggdHJhaWwgKSApIHtcclxuLy8gICAgICAgICAgICAgICBjb250YWluc0FueXRoaW5nID0gdHJ1ZTtcclxuLy8gICAgICAgICAgICAgICBpZiAoICFhLmV4Y2x1c2l2ZUNvbnRhaW5zKCB0cmFpbCApICYmICFiLmV4Y2x1c2l2ZUNvbnRhaW5zKCB0cmFpbCApICkge1xyXG4vLyAgICAgICAgICAgICAgICAgd291bGRCZUJhZFVuaW9uID0gdHJ1ZTtcclxuLy8gICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgIH1cclxuLy8gICAgICAgICB9ICk7XHJcbi8vICAgICAgICAgYXNzZXJ0Lm9rKCBjb250YWluc0FueXRoaW5nICYmIHdvdWxkQmVCYWRVbmlvbiwgJ05vdCBhIGJhZCB1bmlvbj86ICcgKyBhLnRvU3RyaW5nKCkgKyAnIGFuZCAnICsgYi50b1N0cmluZygpICsgJyB3aXRoIHVuaW9uICcgKyB1bmlvbi50b1N0cmluZygpICk7XHJcbi8vICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gICB9XHJcbi8vIH0gKTtcclxuXHJcblFVbml0LnRlc3QoICdUZXh0IHdpZHRoIG1lYXN1cmVtZW50IGluIGNhbnZhcycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICBjb25zdCBtZXRyaWNzID0gY29udGV4dC5tZWFzdXJlVGV4dCggJ0hlbGxvIFdvcmxkJyApO1xyXG4gIGFzc2VydC5vayggbWV0cmljcy53aWR0aCwgJ21ldHJpY3Mud2lkdGgnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdTY2VuZWxlc3Mgbm9kZSBoYW5kbGluZycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYSA9IG5ldyBQYXRoKCBudWxsICk7XHJcbiAgY29uc3QgYiA9IG5ldyBQYXRoKCBudWxsICk7XHJcbiAgY29uc3QgYyA9IG5ldyBQYXRoKCBudWxsICk7XHJcblxyXG4gIGEuc2V0U2hhcGUoIFNoYXBlLnJlY3RhbmdsZSggMCwgMCwgMjAsIDIwICkgKTtcclxuICBjLnNldFNoYXBlKCBTaGFwZS5yZWN0YW5nbGUoIDEwLCAxMCwgMzAsIDMwICkgKTtcclxuXHJcbiAgYS5hZGRDaGlsZCggYiApO1xyXG4gIGIuYWRkQ2hpbGQoIGMgKTtcclxuXHJcbiAgYS52YWxpZGF0ZUJvdW5kcygpO1xyXG5cclxuICBhLnJlbW92ZUNoaWxkKCBiICk7XHJcbiAgYy5hZGRDaGlsZCggYSApO1xyXG5cclxuICBiLnZhbGlkYXRlQm91bmRzKCk7XHJcblxyXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnQ29ycmVjdCBib3VuZHMgb24gcmVjdGFuZ2xlJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCByZWN0Qm91bmRzID0gVXRpbHMuY2FudmFzQWNjdXJhdGVCb3VuZHMoIGNvbnRleHQgPT4geyBjb250ZXh0LmZpbGxSZWN0KCAxMDAsIDEwMCwgMjAwLCAyMDAgKTsgfSApO1xyXG4gIGFzc2VydC5vayggTWF0aC5hYnMoIHJlY3RCb3VuZHMubWluWCAtIDEwMCApIDwgMC4wMSwgcmVjdEJvdW5kcy5taW5YICk7XHJcbiAgYXNzZXJ0Lm9rKCBNYXRoLmFicyggcmVjdEJvdW5kcy5taW5ZIC0gMTAwICkgPCAwLjAxLCByZWN0Qm91bmRzLm1pblkgKTtcclxuICBhc3NlcnQub2soIE1hdGguYWJzKCByZWN0Qm91bmRzLm1heFggLSAzMDAgKSA8IDAuMDEsIHJlY3RCb3VuZHMubWF4WCApO1xyXG4gIGFzc2VydC5vayggTWF0aC5hYnMoIHJlY3RCb3VuZHMubWF4WSAtIDMwMCApIDwgMC4wMSwgcmVjdEJvdW5kcy5tYXhZICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdDb25zaXN0ZW50IGFuZCBwcmVjaXNlIGJvdW5kcyByYW5nZSBvbiBUZXh0JywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCB0ZXh0Qm91bmRzID0gVXRpbHMuY2FudmFzQWNjdXJhdGVCb3VuZHMoIGNvbnRleHQgPT4geyBjb250ZXh0LmZpbGxUZXh0KCAndGVzdCBzdHJpbmcnLCAwLCAwICk7IH0gKTtcclxuICBhc3NlcnQub2soIHRleHRCb3VuZHMuaXNDb25zaXN0ZW50LCB0ZXh0Qm91bmRzLnRvU3RyaW5nKCkgKTtcclxuXHJcbiAgLy8gcHJlY2lzaW9uIG9mIDAuMDAxIChvciBsb3dlciBnaXZlbiBkaWZmZXJlbnQgcGFyYW1ldGVycykgaXMgcG9zc2libGUgb24gbm9uLUNob21lIGJyb3dzZXJzIChGaXJlZm94LCBJRTksIE9wZXJhKVxyXG4gIGFzc2VydC5vayggdGV4dEJvdW5kcy5wcmVjaXNpb24gPCAwLjE1LCBgcHJlY2lzaW9uOiAke3RleHRCb3VuZHMucHJlY2lzaW9ufWAgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0NvbnNpc3RlbnQgYW5kIHByZWNpc2UgYm91bmRzIHJhbmdlIG9uIFRleHQnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggJzBcXHUwNDg5JyApO1xyXG4gIGNvbnN0IHRleHRCb3VuZHMgPSBUZXh0Qm91bmRzLmFjY3VyYXRlQ2FudmFzQm91bmRzRmFsbGJhY2soIHRleHQgKTtcclxuICBhc3NlcnQub2soIHRleHRCb3VuZHMuaXNDb25zaXN0ZW50LCB0ZXh0Qm91bmRzLnRvU3RyaW5nKCkgKTtcclxuXHJcbiAgLy8gcHJlY2lzaW9uIG9mIDAuMDAxIChvciBsb3dlciBnaXZlbiBkaWZmZXJlbnQgcGFyYW1ldGVycykgaXMgcG9zc2libGUgb24gbm9uLUNob21lIGJyb3dzZXJzIChGaXJlZm94LCBJRTksIE9wZXJhKVxyXG4gIGFzc2VydC5vayggdGV4dEJvdW5kcy5wcmVjaXNpb24gPCAxLCBgcHJlY2lzaW9uOiAke3RleHRCb3VuZHMucHJlY2lzaW9ufWAgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0VTNSBTZXR0ZXIgLyBHZXR0ZXIgdGVzdHMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG5vZGUgPSBuZXcgUGF0aCggbnVsbCApO1xyXG4gIGNvbnN0IGZpbGwgPSAnI2FiY2RlZic7XHJcbiAgbm9kZS5maWxsID0gZmlsbDtcclxuICBhc3NlcnQuZXF1YWwoIG5vZGUuZmlsbCwgZmlsbCApO1xyXG4gIGFzc2VydC5lcXVhbCggbm9kZS5nZXRGaWxsKCksIGZpbGwgKTtcclxuXHJcbiAgY29uc3Qgb3RoZXJOb2RlID0gbmV3IFBhdGgoIFNoYXBlLnJlY3RhbmdsZSggMCwgMCwgMTAsIDEwICksIHsgZmlsbDogZmlsbCB9ICk7XHJcblxyXG4gIGFzc2VydC5lcXVhbCggb3RoZXJOb2RlLmZpbGwsIGZpbGwgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1BpY2NvbG8tbGlrZSBiZWhhdmlvcicsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gIG5vZGUuc2NhbGUoIDIgKTtcclxuICBub2RlLnRyYW5zbGF0ZSggMSwgMyApO1xyXG4gIG5vZGUucm90YXRlKCBNYXRoLlBJIC8gMiApO1xyXG4gIG5vZGUudHJhbnNsYXRlKCAtMzEsIDIxICk7XHJcblxyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0wMCgpLCAwICk7XHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUuZ2V0TWF0cml4KCkubTAxKCksIC0yICk7XHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUuZ2V0TWF0cml4KCkubTAyKCksIC00MCApO1xyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0xMCgpLCAyICk7XHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUuZ2V0TWF0cml4KCkubTExKCksIDAgKTtcclxuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS5nZXRNYXRyaXgoKS5tMTIoKSwgLTU2ICk7XHJcblxyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLngsIC00MCApO1xyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLnksIC01NiApO1xyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLnJvdGF0aW9uLCBNYXRoLlBJIC8gMiApO1xyXG5cclxuICBub2RlLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIC01LCA3ICk7XHJcblxyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0wMigpLCAtNSApO1xyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0xMigpLCA3ICk7XHJcblxyXG4gIG5vZGUucm90YXRpb24gPSAxLjI7XHJcblxyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0wMSgpLCAtMS44NjQwNzgxNzE5MzQ0NTMgKTtcclxuXHJcbiAgbm9kZS5yb3RhdGlvbiA9IC0wLjc7XHJcblxyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0xMCgpLCAtMS4yODg0MzUzNzQ0NzUzODIgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1NldHRpbmcgbGVmdC9yaWdodCBvZiBub2RlJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBub2RlID0gbmV3IFBhdGgoIFNoYXBlLnJlY3RhbmdsZSggLTIwLCAtMjAsIDUwLCA1MCApLCB7XHJcbiAgICBzY2FsZTogMlxyXG4gIH0gKTtcclxuXHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUubGVmdCwgLTQwICk7XHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUucmlnaHQsIDYwICk7XHJcblxyXG4gIG5vZGUubGVmdCA9IDEwO1xyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmxlZnQsIDEwICk7XHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUucmlnaHQsIDExMCApO1xyXG5cclxuICBub2RlLnJpZ2h0ID0gMTA7XHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUubGVmdCwgLTkwICk7XHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUucmlnaHQsIDEwICk7XHJcblxyXG4gIG5vZGUuY2VudGVyWCA9IDU7XHJcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUuY2VudGVyWCwgNSApO1xyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmxlZnQsIC00NSApO1xyXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLnJpZ2h0LCA1NSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnUGF0aCB3aXRoIGVtcHR5IHNoYXBlJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBzY2VuZSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3Qgbm9kZSA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKSApO1xyXG4gIHNjZW5lLmFkZENoaWxkKCBub2RlICk7XHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdQYXRoIHdpdGggbnVsbCBzaGFwZScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IG5vZGUgPSBuZXcgUGF0aCggbnVsbCApO1xyXG4gIHNjZW5lLmFkZENoaWxkKCBub2RlICk7XHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdEaXNwbGF5IHJlc2l6ZSBldmVudCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcclxuXHJcbiAgbGV0IHdpZHRoO1xyXG4gIGxldCBoZWlnaHQ7XHJcbiAgbGV0IGNvdW50ID0gMDtcclxuXHJcbiAgZGlzcGxheS5zaXplUHJvcGVydHkubGF6eUxpbmsoIHNpemUgPT4ge1xyXG4gICAgd2lkdGggPSBzaXplLndpZHRoO1xyXG4gICAgaGVpZ2h0ID0gc2l6ZS5oZWlnaHQ7XHJcbiAgICBjb3VudCsrO1xyXG4gIH0gKTtcclxuXHJcbiAgZGlzcGxheS5zZXRXaWR0aEhlaWdodCggNzEyLCAyMTcgKTtcclxuXHJcbiAgYXNzZXJ0LmVxdWFsKCB3aWR0aCwgNzEyLCAnU2NlbmUgcmVzaXplIHdpZHRoJyApO1xyXG4gIGFzc2VydC5lcXVhbCggaGVpZ2h0LCAyMTcsICdTY2VuZSByZXNpemUgaGVpZ2h0JyApO1xyXG4gIGFzc2VydC5lcXVhbCggY291bnQsIDEsICdTY2VuZSByZXNpemUgY291bnQnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdCb3VuZHMgZXZlbnRzJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBub2RlID0gbmV3IE5vZGUoKTtcclxuICBub2RlLnkgPSAxMDtcclxuXHJcbiAgY29uc3QgcmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJyNmMDAnIH0gKTtcclxuICByZWN0LnggPSAxMDsgLy8gYSB0cmFuc2Zvcm0sIHNvIHdlIGNhbiB2ZXJpZnkgZXZlcnl0aGluZyBpcyBoYW5kbGVkIGNvcnJlY3RseVxyXG4gIG5vZGUuYWRkQ2hpbGQoIHJlY3QgKTtcclxuXHJcbiAgbm9kZS52YWxpZGF0ZUJvdW5kcygpO1xyXG5cclxuICBjb25zdCBlcHNpbG9uID0gMC4wMDAwMDAxO1xyXG5cclxuICBub2RlLmNoaWxkQm91bmRzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgIGFzc2VydC5vayggbm9kZS5jaGlsZEJvdW5kcy5lcXVhbHNFcHNpbG9uKCBuZXcgQm91bmRzMiggMTAsIDAsIDExMCwgMzAgKSwgZXBzaWxvbiApLCBgUGFyZW50IGNoaWxkIGJvdW5kcyBjaGVjazogJHtub2RlLmNoaWxkQm91bmRzLnRvU3RyaW5nKCl9YCApO1xyXG4gIH0gKTtcclxuXHJcbiAgbm9kZS5ib3VuZHNQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHNFcHNpbG9uKCBuZXcgQm91bmRzMiggMTAsIDEwLCAxMTAsIDQwICksIGVwc2lsb24gKSwgYFBhcmVudCBib3VuZHMgY2hlY2s6ICR7bm9kZS5ib3VuZHMudG9TdHJpbmcoKX1gICk7XHJcbiAgfSApO1xyXG5cclxuICBub2RlLnNlbGZCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgYXNzZXJ0Lm9rKCBmYWxzZSwgJ1NlbGYgYm91bmRzIHNob3VsZCBub3QgY2hhbmdlIGZvciBwYXJlbnQgbm9kZScgKTtcclxuICB9ICk7XHJcblxyXG4gIHJlY3Quc2VsZkJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICBhc3NlcnQub2soIHJlY3Quc2VsZkJvdW5kcy5lcXVhbHNFcHNpbG9uKCBuZXcgQm91bmRzMiggMCwgMCwgMTAwLCAzMCApLCBlcHNpbG9uICksIGBTZWxmIGJvdW5kcyBjaGVjazogJHtyZWN0LnNlbGZCb3VuZHMudG9TdHJpbmcoKX1gICk7XHJcbiAgfSApO1xyXG5cclxuICByZWN0LmJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICBhc3NlcnQub2soIHJlY3QuYm91bmRzLmVxdWFsc0Vwc2lsb24oIG5ldyBCb3VuZHMyKCAxMCwgMCwgMTEwLCAzMCApLCBlcHNpbG9uICksIGBCb3VuZHMgY2hlY2s6ICR7cmVjdC5ib3VuZHMudG9TdHJpbmcoKX1gICk7XHJcbiAgfSApO1xyXG5cclxuICByZWN0LmNoaWxkQm91bmRzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgIGFzc2VydC5vayggZmFsc2UsICdDaGlsZCBib3VuZHMgc2hvdWxkIG5vdCBjaGFuZ2UgZm9yIGxlYWYgbm9kZScgKTtcclxuICB9ICk7XHJcblxyXG4gIHJlY3QucmVjdEhlaWdodCA9IDMwO1xyXG4gIG5vZGUudmFsaWRhdGVCb3VuZHMoKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1VzaW5nIGEgY29sb3IgaW5zdGFuY2UnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHNjZW5lID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgY29uc3QgcmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAgKTtcclxuICBhc3NlcnQub2soIHJlY3QuZmlsbCA9PT0gbnVsbCwgJ0Fsd2F5cyBzdGFydHMgd2l0aCBhIG51bGwgZmlsbCcgKTtcclxuICBzY2VuZS5hZGRDaGlsZCggcmVjdCApO1xyXG4gIGNvbnN0IGNvbG9yID0gbmV3IENvbG9yKCAyNTUsIDAsIDAgKTtcclxuICByZWN0LmZpbGwgPSBjb2xvcjtcclxuICBjb2xvci5zZXRSR0JBKCAwLCAyNTUsIDAsIDEgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0JvdW5kcyBhbmQgVmlzaWJsZSBCb3VuZHMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IG5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IHJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwICk7XHJcbiAgbm9kZS5hZGRDaGlsZCggcmVjdCApO1xyXG5cclxuICBhc3NlcnQub2soIG5vZGUudmlzaWJsZUJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDUwICkgKSwgJ1Zpc2libGUgQm91bmRzIFZpc2libGUnICk7XHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDUwICkgKSwgJ0NvbXBsZXRlIEJvdW5kcyBWaXNpYmxlJyApO1xyXG5cclxuICByZWN0LnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBub2RlLnZpc2libGVCb3VuZHMuZXF1YWxzKCBCb3VuZHMyLk5PVEhJTkcgKSwgJ1Zpc2libGUgQm91bmRzIEludmlzaWJsZScgKTtcclxuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDAsIDEwMCwgNTAgKSApLCAnQ29tcGxldGUgQm91bmRzIEludmlzaWJsZScgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ2xvY2FsQm91bmRzIG92ZXJyaWRlJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBub2RlID0gbmV3IE5vZGUoIHsgeTogNSB9ICk7XHJcbiAgY29uc3QgcmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAgKTtcclxuICBub2RlLmFkZENoaWxkKCByZWN0ICk7XHJcblxyXG4gIHJlY3QubG9jYWxCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgNTAsIDUwICk7XHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmxvY2FsQm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDAsIDUwLCA1MCApICksICdsb2NhbEJvdW5kcyBvdmVycmlkZSBvbiBzZWxmJyApO1xyXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggMCwgNSwgNTAsIDU1ICkgKSwgJ2xvY2FsQm91bmRzIG92ZXJyaWRlIG9uIHNlbGYnICk7XHJcblxyXG4gIHJlY3QubG9jYWxCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgNTAsIDEwMCApO1xyXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggMCwgNSwgNTAsIDEwNSApICksICdsb2NhbEJvdW5kcyBvdmVycmlkZSAybmQgb24gc2VsZicgKTtcclxuXHJcbiAgLy8gcmVzZXQgbG9jYWwgYm91bmRzIChoYXZlIHRoZW0gY29tcHV0ZWQgYWdhaW4pXHJcbiAgcmVjdC5sb2NhbEJvdW5kcyA9IG51bGw7XHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCA1LCAxMDAsIDU1ICkgKSwgJ2xvY2FsQm91bmRzIG92ZXJyaWRlIHJlc2V0IG9uIHNlbGYnICk7XHJcblxyXG4gIG5vZGUubG9jYWxCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgNTAsIDIwMCApO1xyXG4gIGFzc2VydC5vayggbm9kZS5sb2NhbEJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCA1MCwgMjAwICkgKSwgJ2xvY2FsQm91bmRzIG92ZXJyaWRlIG9uIHBhcmVudCcgKTtcclxuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDUsIDUwLCAyMDUgKSApLCAnbG9jYWxCb3VuZHMgb3ZlcnJpZGUgb24gcGFyZW50JyApO1xyXG59ICk7XHJcblxyXG5mdW5jdGlvbiBjb21wYXJlVHJhaWxBcnJheXMoIGEsIGIgKSB7XHJcbiAgLy8gZGVmZW5zaXZlIGNvcGllc1xyXG4gIGEgPSBhLnNsaWNlKCk7XHJcbiAgYiA9IGIuc2xpY2UoKTtcclxuXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKyApIHtcclxuICAgIC8vIGZvciBlYWNoIEEsIHJlbW92ZSB0aGUgZmlyc3QgbWF0Y2hpbmcgb25lIGluIEJcclxuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGIubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgIGlmICggYVsgaSBdLmVxdWFscyggYlsgaiBdICkgKSB7XHJcbiAgICAgICAgYi5zcGxpY2UoIGosIDEgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gbm93IEIgc2hvdWxkIGJlIGVtcHR5XHJcbiAgcmV0dXJuIGIubGVuZ3RoID09PSAwO1xyXG59XHJcblxyXG5RVW5pdC50ZXN0KCAnZ2V0VHJhaWxzL2dldFVuaXF1ZVRyYWlsJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBhID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBjID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBkID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgLy8gREFHLWxpa2Ugc3RydWN0dXJlXHJcbiAgYS5hZGRDaGlsZCggYiApO1xyXG4gIGEuYWRkQ2hpbGQoIGMgKTtcclxuICBiLmFkZENoaWxkKCBkICk7XHJcbiAgYy5hZGRDaGlsZCggZCApO1xyXG4gIGMuYWRkQ2hpbGQoIGUgKTtcclxuXHJcbiAgLy8gZ2V0VW5pcXVlVHJhaWwoKVxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4geyBkLmdldFVuaXF1ZVRyYWlsKCk7IH0sICdEIGhhcyBubyB1bmlxdWUgdHJhaWwsIHNpbmNlIHRoZXJlIGFyZSB0d28nICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmdldFVuaXF1ZVRyYWlsKCkuZXF1YWxzKCBuZXcgVHJhaWwoIFsgYSBdICkgKSwgJ2EuZ2V0VW5pcXVlVHJhaWwoKScgKTtcclxuICBhc3NlcnQub2soIGIuZ2V0VW5pcXVlVHJhaWwoKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBhLCBiIF0gKSApLCAnYi5nZXRVbmlxdWVUcmFpbCgpJyApO1xyXG4gIGFzc2VydC5vayggYy5nZXRVbmlxdWVUcmFpbCgpLmVxdWFscyggbmV3IFRyYWlsKCBbIGEsIGMgXSApICksICdjLmdldFVuaXF1ZVRyYWlsKCknICk7XHJcbiAgYXNzZXJ0Lm9rKCBlLmdldFVuaXF1ZVRyYWlsKCkuZXF1YWxzKCBuZXcgVHJhaWwoIFsgYSwgYywgZSBdICkgKSwgJ2UuZ2V0VW5pcXVlVHJhaWwoKScgKTtcclxuXHJcbiAgLy8gZ2V0VHJhaWxzKClcclxuICBsZXQgdHJhaWxzO1xyXG4gIHRyYWlscyA9IGEuZ2V0VHJhaWxzKCk7XHJcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAxICYmIHRyYWlsc1sgMCBdLmVxdWFscyggbmV3IFRyYWlsKCBbIGEgXSApICksICdhLmdldFRyYWlscygpJyApO1xyXG4gIHRyYWlscyA9IGIuZ2V0VHJhaWxzKCk7XHJcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAxICYmIHRyYWlsc1sgMCBdLmVxdWFscyggbmV3IFRyYWlsKCBbIGEsIGIgXSApICksICdiLmdldFRyYWlscygpJyApO1xyXG4gIHRyYWlscyA9IGMuZ2V0VHJhaWxzKCk7XHJcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAxICYmIHRyYWlsc1sgMCBdLmVxdWFscyggbmV3IFRyYWlsKCBbIGEsIGMgXSApICksICdjLmdldFRyYWlscygpJyApO1xyXG4gIHRyYWlscyA9IGQuZ2V0VHJhaWxzKCk7XHJcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAyICYmIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbIG5ldyBUcmFpbCggWyBhLCBiLCBkIF0gKSwgbmV3IFRyYWlsKCBbIGEsIGMsIGQgXSApIF0gKSwgJ2QuZ2V0VHJhaWxzKCknICk7XHJcbiAgdHJhaWxzID0gZS5nZXRUcmFpbHMoKTtcclxuICBhc3NlcnQub2soIHRyYWlscy5sZW5ndGggPT09IDEgJiYgdHJhaWxzWyAwIF0uZXF1YWxzKCBuZXcgVHJhaWwoIFsgYSwgYywgZSBdICkgKSwgJ2UuZ2V0VHJhaWxzKCknICk7XHJcblxyXG4gIC8vIGdldFVuaXF1ZVRyYWlsKCBwcmVkaWNhdGUgKVxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4geyBlLmdldFVuaXF1ZVRyYWlsKCBub2RlID0+IGZhbHNlICk7IH0sICdGYWlscyBvbiBmYWxzZSBwcmVkaWNhdGUnICk7XHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7IGUuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gZmFsc2UgKTsgfSwgJ0ZhaWxzIG9uIGZhbHNlIHByZWRpY2F0ZScgKTtcclxuICBhc3NlcnQub2soIGUuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gYSApLmVxdWFscyggbmV3IFRyYWlsKCBbIGEsIGMsIGUgXSApICkgKTtcclxuICBhc3NlcnQub2soIGUuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gYyApLmVxdWFscyggbmV3IFRyYWlsKCBbIGMsIGUgXSApICkgKTtcclxuICBhc3NlcnQub2soIGUuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gZSApLmVxdWFscyggbmV3IFRyYWlsKCBbIGUgXSApICkgKTtcclxuICBhc3NlcnQub2soIGQuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gYiApLmVxdWFscyggbmV3IFRyYWlsKCBbIGIsIGQgXSApICkgKTtcclxuICBhc3NlcnQub2soIGQuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gYyApLmVxdWFscyggbmV3IFRyYWlsKCBbIGMsIGQgXSApICkgKTtcclxuICBhc3NlcnQub2soIGQuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gZCApLmVxdWFscyggbmV3IFRyYWlsKCBbIGQgXSApICkgKTtcclxuXHJcbiAgLy8gZ2V0VHJhaWxzKCBwcmVkaWNhdGUgKVxyXG4gIHRyYWlscyA9IGQuZ2V0VHJhaWxzKCBub2RlID0+IGZhbHNlICk7XHJcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAwICk7XHJcbiAgdHJhaWxzID0gZC5nZXRUcmFpbHMoIG5vZGUgPT4gdHJ1ZSApO1xyXG4gIGFzc2VydC5vayggY29tcGFyZVRyYWlsQXJyYXlzKCB0cmFpbHMsIFtcclxuICAgIG5ldyBUcmFpbCggWyBhLCBiLCBkIF0gKSxcclxuICAgIG5ldyBUcmFpbCggWyBiLCBkIF0gKSxcclxuICAgIG5ldyBUcmFpbCggWyBhLCBjLCBkIF0gKSxcclxuICAgIG5ldyBUcmFpbCggWyBjLCBkIF0gKSxcclxuICAgIG5ldyBUcmFpbCggWyBkIF0gKVxyXG4gIF0gKSApO1xyXG4gIHRyYWlscyA9IGQuZ2V0VHJhaWxzKCBub2RlID0+IG5vZGUgPT09IGEgKTtcclxuICBhc3NlcnQub2soIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbXHJcbiAgICBuZXcgVHJhaWwoIFsgYSwgYiwgZCBdICksXHJcbiAgICBuZXcgVHJhaWwoIFsgYSwgYywgZCBdIClcclxuICBdICkgKTtcclxuICB0cmFpbHMgPSBkLmdldFRyYWlscyggbm9kZSA9PiBub2RlID09PSBiICk7XHJcbiAgYXNzZXJ0Lm9rKCBjb21wYXJlVHJhaWxBcnJheXMoIHRyYWlscywgW1xyXG4gICAgbmV3IFRyYWlsKCBbIGIsIGQgXSApXHJcbiAgXSApICk7XHJcbiAgdHJhaWxzID0gZC5nZXRUcmFpbHMoIG5vZGUgPT4gbm9kZS5wYXJlbnRzLmxlbmd0aCA9PT0gMSApO1xyXG4gIGFzc2VydC5vayggY29tcGFyZVRyYWlsQXJyYXlzKCB0cmFpbHMsIFtcclxuICAgIG5ldyBUcmFpbCggWyBiLCBkIF0gKSxcclxuICAgIG5ldyBUcmFpbCggWyBjLCBkIF0gKVxyXG4gIF0gKSApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnZ2V0TGVhZlRyYWlscycsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gIC8vIERBRy1saWtlIHN0cnVjdHVyZVxyXG4gIGEuYWRkQ2hpbGQoIGIgKTtcclxuICBhLmFkZENoaWxkKCBjICk7XHJcbiAgYi5hZGRDaGlsZCggZCApO1xyXG4gIGMuYWRkQ2hpbGQoIGQgKTtcclxuICBjLmFkZENoaWxkKCBlICk7XHJcblxyXG4gIC8vIGdldFVuaXF1ZUxlYWZUcmFpbCgpXHJcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7IGEuZ2V0VW5pcXVlTGVhZlRyYWlsKCk7IH0sICdBIGhhcyBubyB1bmlxdWUgbGVhZiB0cmFpbCwgc2luY2UgdGhlcmUgYXJlIHRocmVlJyApO1xyXG4gIGFzc2VydC5vayggYi5nZXRVbmlxdWVMZWFmVHJhaWwoKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBiLCBkIF0gKSApLCAnYS5nZXRVbmlxdWVMZWFmVHJhaWwoKScgKTtcclxuICBhc3NlcnQub2soIGQuZ2V0VW5pcXVlTGVhZlRyYWlsKCkuZXF1YWxzKCBuZXcgVHJhaWwoIFsgZCBdICkgKSwgJ2IuZ2V0VW5pcXVlTGVhZlRyYWlsKCknICk7XHJcbiAgYXNzZXJ0Lm9rKCBlLmdldFVuaXF1ZUxlYWZUcmFpbCgpLmVxdWFscyggbmV3IFRyYWlsKCBbIGUgXSApICksICdjLmdldFVuaXF1ZUxlYWZUcmFpbCgpJyApO1xyXG5cclxuICAvLyBnZXRMZWFmVHJhaWxzKClcclxuICBsZXQgdHJhaWxzO1xyXG4gIHRyYWlscyA9IGEuZ2V0TGVhZlRyYWlscygpO1xyXG4gIGFzc2VydC5vayggdHJhaWxzLmxlbmd0aCA9PT0gMyAmJiBjb21wYXJlVHJhaWxBcnJheXMoIHRyYWlscywgW1xyXG4gICAgbmV3IFRyYWlsKCBbIGEsIGIsIGQgXSApLFxyXG4gICAgbmV3IFRyYWlsKCBbIGEsIGMsIGQgXSApLFxyXG4gICAgbmV3IFRyYWlsKCBbIGEsIGMsIGUgXSApXHJcbiAgXSApLCAnYS5nZXRMZWFmVHJhaWxzKCknICk7XHJcbiAgdHJhaWxzID0gYi5nZXRMZWFmVHJhaWxzKCk7XHJcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAxICYmIHRyYWlsc1sgMCBdLmVxdWFscyggbmV3IFRyYWlsKCBbIGIsIGQgXSApICksICdiLmdldExlYWZUcmFpbHMoKScgKTtcclxuICB0cmFpbHMgPSBjLmdldExlYWZUcmFpbHMoKTtcclxuICBhc3NlcnQub2soIHRyYWlscy5sZW5ndGggPT09IDIgJiYgY29tcGFyZVRyYWlsQXJyYXlzKCB0cmFpbHMsIFtcclxuICAgIG5ldyBUcmFpbCggWyBjLCBkIF0gKSxcclxuICAgIG5ldyBUcmFpbCggWyBjLCBlIF0gKVxyXG4gIF0gKSwgJ2MuZ2V0TGVhZlRyYWlscygpJyApO1xyXG4gIHRyYWlscyA9IGQuZ2V0TGVhZlRyYWlscygpO1xyXG4gIGFzc2VydC5vayggdHJhaWxzLmxlbmd0aCA9PT0gMSAmJiB0cmFpbHNbIDAgXS5lcXVhbHMoIG5ldyBUcmFpbCggWyBkIF0gKSApLCAnZC5nZXRMZWFmVHJhaWxzKCknICk7XHJcbiAgdHJhaWxzID0gZS5nZXRMZWFmVHJhaWxzKCk7XHJcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAxICYmIHRyYWlsc1sgMCBdLmVxdWFscyggbmV3IFRyYWlsKCBbIGUgXSApICksICdlLmdldExlYWZUcmFpbHMoKScgKTtcclxuXHJcbiAgLy8gZ2V0VW5pcXVlTGVhZlRyYWlsKCBwcmVkaWNhdGUgKVxyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4geyBlLmdldFVuaXF1ZUxlYWZUcmFpbCggbm9kZSA9PiBmYWxzZSApOyB9LCAnRmFpbHMgb24gZmFsc2UgcHJlZGljYXRlJyApO1xyXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4geyBhLmdldFVuaXF1ZUxlYWZUcmFpbCggbm9kZSA9PiB0cnVlICk7IH0sICdGYWlscyBvbiBtdWx0aXBsZXMnICk7XHJcbiAgYXNzZXJ0Lm9rKCBhLmdldFVuaXF1ZUxlYWZUcmFpbCggbm9kZSA9PiBub2RlID09PSBlICkuZXF1YWxzKCBuZXcgVHJhaWwoIFsgYSwgYywgZSBdICkgKSApO1xyXG5cclxuICAvLyBnZXRMZWFmVHJhaWxzKCBwcmVkaWNhdGUgKVxyXG4gIHRyYWlscyA9IGEuZ2V0TGVhZlRyYWlscyggbm9kZSA9PiBmYWxzZSApO1xyXG4gIGFzc2VydC5vayggdHJhaWxzLmxlbmd0aCA9PT0gMCApO1xyXG4gIHRyYWlscyA9IGEuZ2V0TGVhZlRyYWlscyggbm9kZSA9PiB0cnVlICk7XHJcbiAgYXNzZXJ0Lm9rKCBjb21wYXJlVHJhaWxBcnJheXMoIHRyYWlscywgW1xyXG4gICAgbmV3IFRyYWlsKCBbIGEgXSApLFxyXG4gICAgbmV3IFRyYWlsKCBbIGEsIGIgXSApLFxyXG4gICAgbmV3IFRyYWlsKCBbIGEsIGIsIGQgXSApLFxyXG4gICAgbmV3IFRyYWlsKCBbIGEsIGMgXSApLFxyXG4gICAgbmV3IFRyYWlsKCBbIGEsIGMsIGQgXSApLFxyXG4gICAgbmV3IFRyYWlsKCBbIGEsIGMsIGUgXSApXHJcbiAgXSApICk7XHJcblxyXG4gIC8vIGdldExlYWZUcmFpbHNUbyggbm9kZSApXHJcbiAgdHJhaWxzID0gYS5nZXRMZWFmVHJhaWxzVG8oIGQgKTtcclxuICBhc3NlcnQub2soIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbXHJcbiAgICBuZXcgVHJhaWwoIFsgYSwgYiwgZCBdICksXHJcbiAgICBuZXcgVHJhaWwoIFsgYSwgYywgZCBdIClcclxuICBdICkgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0xpbmUgc3Ryb2tlZCBib3VuZHMnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGxpbmUgPSBuZXcgTGluZSggMCwgMCwgNTAsIDAsIHsgc3Ryb2tlOiAncmVkJywgbGluZVdpZHRoOiA1IH0gKTtcclxuXHJcbiAgY29uc3QgcG9zaXRpb25zID0gW1xyXG4gICAgeyB4MTogNTAsIHkxOiAwLCB4MjogMCwgeTI6IDAgfSxcclxuICAgIHsgeDE6IDAsIHkxOiA1MCwgeDI6IDAsIHkyOiAwIH0sXHJcbiAgICB7IHgxOiAwLCB5MTogMCwgeDI6IDUwLCB5MjogMCB9LFxyXG4gICAgeyB4MTogMCwgeTE6IDAsIHgyOiAwLCB5MjogNTAgfSxcclxuICAgIHsgeDE6IDUwLCB5MTogMTAsIHgyOiAwLCB5MjogMCB9LFxyXG4gICAgeyB4MTogMTAsIHkxOiA1MCwgeDI6IDAsIHkyOiAwIH0sXHJcbiAgICB7IHgxOiAwLCB5MTogMCwgeDI6IDUwLCB5MjogMTAgfSxcclxuICAgIHsgeDE6IDAsIHkxOiAwLCB4MjogMTAsIHkyOiA1MCB9LFxyXG4gICAgeyB4MTogNTAsIHkxOiAtMTAsIHgyOiAwLCB5MjogMCB9LFxyXG4gICAgeyB4MTogLTEwLCB5MTogNTAsIHgyOiAwLCB5MjogMCB9LFxyXG4gICAgeyB4MTogMCwgeTE6IDAsIHgyOiA1MCwgeTI6IC0xMCB9LFxyXG4gICAgeyB4MTogMCwgeTE6IDAsIHgyOiAtMTAsIHkyOiA1MCB9LFxyXG4gICAgeyB4MTogNTAsIHkxOiAwLCB4MjogMCwgeTI6IDEwIH0sXHJcbiAgICB7IHgxOiAwLCB5MTogNTAsIHgyOiAxMCwgeTI6IDAgfSxcclxuICAgIHsgeDE6IDAsIHkxOiAxMCwgeDI6IDUwLCB5MjogMCB9LFxyXG4gICAgeyB4MTogMTAsIHkxOiAwLCB4MjogMCwgeTI6IDUwIH0sXHJcbiAgICB7IHgxOiA1MCwgeTE6IDAsIHgyOiAwLCB5MjogLTEwIH0sXHJcbiAgICB7IHgxOiAwLCB5MTogNTAsIHgyOiAtMTAsIHkyOiAwIH0sXHJcbiAgICB7IHgxOiAwLCB5MTogLTEwLCB4MjogNTAsIHkyOiAwIH0sXHJcbiAgICB7IHgxOiAtMTAsIHkxOiAwLCB4MjogMCwgeTI6IDUwIH1cclxuICBdO1xyXG5cclxuICBjb25zdCBjYXBzID0gW1xyXG4gICAgJ3JvdW5kJyxcclxuICAgICdidXR0JyxcclxuICAgICdzcXVhcmUnXHJcbiAgXTtcclxuXHJcbiAgXy5lYWNoKCBwb3NpdGlvbnMsIHBvc2l0aW9uID0+IHtcclxuICAgIGxpbmUubXV0YXRlKCBwb3NpdGlvbiApO1xyXG4gICAgLy8gbGluZS5zZXRMaW5lKCBwb3NpdGlvbi54MSwgcG9zaXRpb24ueTEsIHBvc2l0aW9uLngyLCBwb3NpdGlvbi55MiApO1xyXG4gICAgXy5lYWNoKCBjYXBzLCBjYXAgPT4ge1xyXG4gICAgICBsaW5lLmxpbmVDYXAgPSBjYXA7XHJcblxyXG4gICAgICBhc3NlcnQub2soIGxpbmUuYm91bmRzLmVxdWFsc0Vwc2lsb24oIGxpbmUuZ2V0U2hhcGUoKS5nZXRTdHJva2VkU2hhcGUoIGxpbmUuZ2V0TGluZVN0eWxlcygpICkuYm91bmRzLCAwLjAwMDEgKSxcclxuICAgICAgICBgTGluZSBzdHJva2VkIGJvdW5kcyB3aXRoICR7SlNPTi5zdHJpbmdpZnkoIHBvc2l0aW9uICl9IGFuZCAke2NhcH0gJHtsaW5lLmJvdW5kcy50b1N0cmluZygpfWAgKTtcclxuICAgIH0gKTtcclxuICB9ICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdtYXhXaWR0aC9tYXhIZWlnaHQgZm9yIE5vZGUnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwLCB7IGZpbGw6ICdyZWQnIH0gKTtcclxuICBjb25zdCBub2RlID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgcmVjdCBdIH0gKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDUwICkgKSwgJ0luaXRpYWwgYm91bmRzJyApO1xyXG5cclxuICBub2RlLm1heFdpZHRoID0gNTA7XHJcblxyXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggMCwgMCwgNTAsIDI1ICkgKSwgJ0hhbHZlZCB0cmFuc2Zvcm0gYWZ0ZXIgbWF4IHdpZHRoIG9mIGhhbGYnICk7XHJcblxyXG4gIG5vZGUubWF4V2lkdGggPSAxMjA7XHJcblxyXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggMCwgMCwgMTAwLCA1MCApICksICdCYWNrIHRvIG5vcm1hbCBhZnRlciBhIGJpZyBtYXggd2lkdGgnICk7XHJcblxyXG4gIG5vZGUuc2NhbGUoIDIgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAyMDAsIDEwMCApICksICdTY2FsZSB1cCBzaG91bGQgYmUgdW5hZmZlY3RlZCcgKTtcclxuXHJcbiAgbm9kZS5tYXhXaWR0aCA9IDI1O1xyXG5cclxuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDAsIDUwLCAyNSApICksICdTY2FsZWQgYmFjayBkb3duIHdpdGggYm90aCBhcHBsaWVkJyApO1xyXG5cclxuICBub2RlLm1heFdpZHRoID0gbnVsbDtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAyMDAsIDEwMCApICksICdXaXRob3V0IG1heFdpZHRoJyApO1xyXG5cclxuICBub2RlLnNjYWxlKCAwLjUgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDUwICkgKSwgJ0JhY2sgdG8gbm9ybWFsJyApO1xyXG5cclxuICBub2RlLmxlZnQgPSA1MDtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCA1MCwgMCwgMTUwLCA1MCApICksICdBZnRlciBhIHRyYW5zbGF0aW9uJyApO1xyXG5cclxuICBub2RlLm1heFdpZHRoID0gNTA7XHJcblxyXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggNTAsIDAsIDEwMCwgMjUgKSApLCAnbWF4V2lkdGggYmVpbmcgYXBwbGllZCBhZnRlciBhIHRyYW5zbGF0aW9uLCBpbiBsb2NhbCBmcmFtZScgKTtcclxuXHJcbiAgcmVjdC5yZWN0V2lkdGggPSAyMDA7XHJcblxyXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggNTAsIDAsIDEwMCwgMTIuNSApICksICdOb3cgd2l0aCBhIGJpZ2dlciByZWN0YW5nbGUnICk7XHJcblxyXG4gIHJlY3QucmVjdFdpZHRoID0gMTAwO1xyXG4gIG5vZGUubWF4V2lkdGggPSBudWxsO1xyXG5cclxuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDUwLCAwLCAxNTAsIDUwICkgKSwgJ0JhY2sgdG8gYSB0cmFuc2xhdGlvbicgKTtcclxuXHJcbiAgcmVjdC5tYXhXaWR0aCA9IDUwO1xyXG5cclxuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDUwLCAwLCAxMDAsIDI1ICkgKSwgJ0FmdGVyIG1heFdpZHRoIEEnICk7XHJcblxyXG4gIHJlY3QubWF4SGVpZ2h0ID0gMTIuNTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCA1MCwgMCwgNzUsIDEyLjUgKSApLCAnQWZ0ZXIgbWF4SGVpZ2h0IEEnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdTcGFjZXJzJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBzcGFjZXIgPSBuZXcgU3BhY2VyKCAxMDAsIDUwLCB7IHg6IDUwIH0gKTtcclxuICBhc3NlcnQub2soIHNwYWNlci5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggNTAsIDAsIDE1MCwgNTAgKSApLCAnU3BhY2VyIGJvdW5kcyB3aXRoIHRyYW5zbGF0aW9uJyApO1xyXG5cclxuICBjb25zdCBoc3RydXQgPSBuZXcgSFN0cnV0KCAxMDAsIHsgeTogNTAgfSApO1xyXG4gIGFzc2VydC5vayggaHN0cnV0LmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCA1MCwgMTAwLCA1MCApICksICdIU3RydXQgYm91bmRzIHdpdGggdHJhbnNsYXRpb24nICk7XHJcblxyXG4gIGNvbnN0IHZzdHJ1dCA9IG5ldyBWU3RydXQoIDEwMCwgeyB4OiA1MCB9ICk7XHJcbiAgYXNzZXJ0Lm9rKCB2c3RydXQuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDUwLCAwLCA1MCwgMTAwICkgKSwgJ1ZTdHJ1dCBib3VuZHMgd2l0aCB0cmFuc2xhdGlvbicgKTtcclxuXHJcbiAgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xyXG4gICAgc3BhY2VyLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XHJcbiAgfSwgJ05vIHdheSB0byBhZGQgY2hpbGRyZW4gdG8gU3BhY2VyJyApO1xyXG5cclxuICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XHJcbiAgICBoc3RydXQuYWRkQ2hpbGQoIG5ldyBOb2RlKCkgKTtcclxuICB9LCAnTm8gd2F5IHRvIGFkZCBjaGlsZHJlbiB0byBIU3RydXQnICk7XHJcblxyXG4gIGFzc2VydC50aHJvd3MoICgpID0+IHtcclxuICAgIHZzdHJ1dC5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xyXG4gIH0sICdObyB3YXkgdG8gYWRkIGNoaWxkcmVuIHRvIFZTdHJ1dCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1JlbmRlcmVyIFN1bW1hcnknLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IGNhbnZhc05vZGUgPSBuZXcgQ2FudmFzTm9kZSggeyBjYW52YXNCb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCAxMCwgMTAgKSB9ICk7XHJcbiAgY29uc3Qgd2ViZ2xOb2RlID0gbmV3IFdlYkdMTm9kZSggKCkgPT4ge30sIHsgY2FudmFzQm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgMTAsIDEwICkgfSApO1xyXG4gIGNvbnN0IHJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwICk7XHJcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGNhbnZhc05vZGUsIHdlYmdsTm9kZSwgcmVjdCBdIH0gKTtcclxuICBjb25zdCBlbXB0eU5vZGUgPSBuZXcgTm9kZSgpO1xyXG5cclxuICBhc3NlcnQub2soIGNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVGdWxseUNvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSwgJ0NhbnZhc05vZGUgZnVsbHkgY29tcGF0aWJsZTogQ2FudmFzJyApO1xyXG4gIGFzc2VydC5vayggIWNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVGdWxseUNvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSwgJ0NhbnZhc05vZGUgbm90IGZ1bGx5IGNvbXBhdGlibGU6IFNWRycgKTtcclxuICBhc3NlcnQub2soIGNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcyApLCAnQ2FudmFzTm9kZSBwYXJ0aWFsbHkgY29tcGF0aWJsZTogQ2FudmFzJyApO1xyXG4gIGFzc2VydC5vayggIWNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnQ2FudmFzTm9kZSBub3QgcGFydGlhbGx5IGNvbXBhdGlibGU6IFNWRycgKTtcclxuICBhc3NlcnQub2soIGNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1NpbmdsZUNhbnZhc1N1cHBvcnRlZCgpLCAnQ2FudmFzTm9kZSBzdXBwb3J0cyBzaW5nbGUgQ2FudmFzJyApO1xyXG4gIGFzc2VydC5vayggIWNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1NpbmdsZVNWR1N1cHBvcnRlZCgpLCAnQ2FudmFzTm9kZSBkb2VzIG5vdCBzdXBwb3J0IHNpbmdsZSBTVkcnICk7XHJcbiAgYXNzZXJ0Lm9rKCAhY2FudmFzTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzTm90UGFpbnRlZCgpLCAnQ2FudmFzTm9kZSBpcyBwYWludGVkJyApO1xyXG4gIGFzc2VydC5vayggY2FudmFzTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmFyZUJvdW5kc1ZhbGlkKCksICdDYW52YXNOb2RlIGhhcyB2YWxpZCBib3VuZHMnICk7XHJcblxyXG4gIGFzc2VydC5vayggd2ViZ2xOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlRnVsbHlDb21wYXRpYmxlKCBSZW5kZXJlci5iaXRtYXNrV2ViR0wgKSwgJ1dlYkdMTm9kZSBmdWxseSBjb21wYXRpYmxlOiBXZWJHTCcgKTtcclxuICBhc3NlcnQub2soICF3ZWJnbE5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVGdWxseUNvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSwgJ1dlYkdMTm9kZSBub3QgZnVsbHkgY29tcGF0aWJsZTogU1ZHJyApO1xyXG4gIGFzc2VydC5vayggd2ViZ2xOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApLCAnV2ViR0xOb2RlIHBhcnRpYWxseSBjb21wYXRpYmxlOiBXZWJHTCcgKTtcclxuICBhc3NlcnQub2soICF3ZWJnbE5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnV2ViR0xOb2RlIG5vdCBwYXJ0aWFsbHkgY29tcGF0aWJsZTogU1ZHJyApO1xyXG4gIGFzc2VydC5vayggIXdlYmdsTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU2luZ2xlQ2FudmFzU3VwcG9ydGVkKCksICdXZWJHTE5vZGUgZG9lcyBub3Qgc3VwcG9ydCBzaW5nbGUgQ2FudmFzJyApO1xyXG4gIGFzc2VydC5vayggIXdlYmdsTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU2luZ2xlU1ZHU3VwcG9ydGVkKCksICdXZWJHTE5vZGUgZG9lcyBub3Qgc3VwcG9ydCBzaW5nbGUgU1ZHJyApO1xyXG4gIGFzc2VydC5vayggIXdlYmdsTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzTm90UGFpbnRlZCgpLCAnV2ViR0xOb2RlIGlzIHBhaW50ZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCB3ZWJnbE5vZGUuX3JlbmRlcmVyU3VtbWFyeS5hcmVCb3VuZHNWYWxpZCgpLCAnV2ViR0xOb2RlIGhhcyB2YWxpZCBib3VuZHMnICk7XHJcblxyXG4gIGFzc2VydC5vayggcmVjdC5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcyApLCAnUmVjdGFuZ2xlIGZ1bGx5IGNvbXBhdGlibGU6IENhbnZhcycgKTtcclxuICBhc3NlcnQub2soIHJlY3QuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVGdWxseUNvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSwgJ1JlY3RhbmdsZSBmdWxseSBjb21wYXRpYmxlOiBTVkcnICk7XHJcbiAgYXNzZXJ0Lm9rKCByZWN0Ll9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSwgJ1JlY3RhbmdsZSBwYXJ0aWFsbHkgY29tcGF0aWJsZTogQ2FudmFzJyApO1xyXG4gIGFzc2VydC5vayggcmVjdC5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUNvbnRhaW5pbmdDb21wYXRpYmxlKCBSZW5kZXJlci5iaXRtYXNrU1ZHICksICdSZWN0YW5nbGUgcGFydGlhbGx5IGNvbXBhdGlibGU6IFNWRycgKTtcclxuICBhc3NlcnQub2soIHJlY3QuX3JlbmRlcmVyU3VtbWFyeS5pc1NpbmdsZUNhbnZhc1N1cHBvcnRlZCgpLCAnUmVjdGFuZ2xlIGRvZXMgc3VwcG9ydCBzaW5nbGUgQ2FudmFzJyApO1xyXG4gIGFzc2VydC5vayggcmVjdC5fcmVuZGVyZXJTdW1tYXJ5LmlzU2luZ2xlU1ZHU3VwcG9ydGVkKCksICdSZWN0YW5nbGUgZG9lcyBzdXBwb3J0IHNpbmdsZSBTVkcnICk7XHJcbiAgYXNzZXJ0Lm9rKCAhcmVjdC5fcmVuZGVyZXJTdW1tYXJ5LmlzTm90UGFpbnRlZCgpLCAnUmVjdGFuZ2xlIGlzIHBhaW50ZWQnICk7XHJcbiAgYXNzZXJ0Lm9rKCByZWN0Ll9yZW5kZXJlclN1bW1hcnkuYXJlQm91bmRzVmFsaWQoKSwgJ1JlY3RhbmdsZSBoYXMgdmFsaWQgYm91bmRzJyApO1xyXG5cclxuICBhc3NlcnQub2soICFub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlRnVsbHlDb21wYXRpYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICksICdDb250YWluZXIgbm9kZSBmdWxseSBjb21wYXRpYmxlOiBDYW52YXMnICk7XHJcbiAgYXNzZXJ0Lm9rKCAhbm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnQ29udGFpbmVyIG5vZGUgbm90IGZ1bGx5IGNvbXBhdGlibGU6IFNWRycgKTtcclxuICBhc3NlcnQub2soIG5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcyApLCAnQ29udGFpbmVyIG5vZGUgcGFydGlhbGx5IGNvbXBhdGlibGU6IENhbnZhcycgKTtcclxuICBhc3NlcnQub2soIG5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnQ29udGFpbmVyIG5vZGUgcGFydGlhbGx5IGNvbXBhdGlibGU6IFNWRycgKTtcclxuICBhc3NlcnQub2soICFub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTaW5nbGVDYW52YXNTdXBwb3J0ZWQoKSwgJ0NvbnRhaW5lciBub2RlIGRvZXMgbm90IHN1cHBvcnQgc2luZ2xlIENhbnZhcycgKTtcclxuICBhc3NlcnQub2soICFub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTaW5nbGVTVkdTdXBwb3J0ZWQoKSwgJ0NvbnRhaW5lciBub2RlIGRvZXMgbm90IHN1cHBvcnQgc2luZ2xlIFNWRycgKTtcclxuICBhc3NlcnQub2soICFub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNOb3RQYWludGVkKCksICdDb250YWluZXIgbm9kZSBpcyBwYWludGVkJyApO1xyXG4gIGFzc2VydC5vayggbm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmFyZUJvdW5kc1ZhbGlkKCksICdDb250YWluZXIgbm9kZSBoYXMgdmFsaWQgYm91bmRzJyApO1xyXG5cclxuICBhc3NlcnQub2soIGVtcHR5Tm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcyApLCAnRW1wdHkgbm9kZSBmdWxseSBjb21wYXRpYmxlOiBDYW52YXMnICk7XHJcbiAgYXNzZXJ0Lm9rKCBlbXB0eU5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVGdWxseUNvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSwgJ0VtcHR5IG5vZGUgZnVsbHkgY29tcGF0aWJsZTogU1ZHJyApO1xyXG4gIGFzc2VydC5vayggIWVtcHR5Tm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUNvbnRhaW5pbmdDb21wYXRpYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICksICdFbXB0eSBub2RlIHBhcnRpYWxseSBjb21wYXRpYmxlOiBDYW52YXMnICk7XHJcbiAgYXNzZXJ0Lm9rKCAhZW1wdHlOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSwgJ0VtcHR5IG5vZGUgcGFydGlhbGx5IGNvbXBhdGlibGU6IFNWRycgKTtcclxuICBhc3NlcnQub2soIGVtcHR5Tm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU2luZ2xlQ2FudmFzU3VwcG9ydGVkKCksICdFbXB0eSBub2RlIHN1cHBvcnRzIHNpbmdsZSBDYW52YXMnICk7XHJcbiAgYXNzZXJ0Lm9rKCBlbXB0eU5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1NpbmdsZVNWR1N1cHBvcnRlZCgpLCAnRW1wdHkgbm9kZSBzdXBwb3J0cyBzaW5nbGUgU1ZHJyApO1xyXG4gIGFzc2VydC5vayggZW1wdHlOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNOb3RQYWludGVkKCksICdFbXB0eSBub2RlIGlzIG5vdCBwYWludGVkJyApO1xyXG4gIGFzc2VydC5vayggZW1wdHlOb2RlLl9yZW5kZXJlclN1bW1hcnkuYXJlQm91bmRzVmFsaWQoKSwgJ0VtcHR5IG5vZGUgaGFzIHZhbGlkIGJvdW5kcycgKTtcclxufSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxTQUFTQyxVQUFVLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFFQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsUUFBUSxFQUFFQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsVUFB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RUFBRSxLQUFNLENBQUMsRUFDNUUsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxJQUFLLENBQUMsRUFDekYsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxLQUFNLENBQUMsRUFDMUYsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsSUFBSyxDQUFDLEVBQzNFLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxFQUM1RSxJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxJQUFLLENBQUMsRUFDM0UsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDLEVBQzVFLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsSUFBSyxDQUFDLEVBQ3pGLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDLEVBQzFGLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxJQUFLLENBQUMsRUFDdkcsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxFQUN4RyxJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLElBQUssQ0FBQyxFQUN6RixJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxFQUMxRixJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxJ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QUMsQ0FBQyxFQUFFLElBQUssQ0FBQyxFQUN6RixJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxFQUMxRixJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxLQUFNLENBQUMsRUFDNUUsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsSUFBSyxDQUFDLEVBQzNFLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxFQUM1RSxJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxJQUFLLENBQUMsRUFDM0UsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxJQUFLLENBQUMsRUFDekYsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLElBQUssQ0FBQyxFQUN2RyxJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDLEVBQ3hHLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDLEVBQzFGLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsSUFBSyxDQUFDLEVBQ3pGLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDLEVBQzFGLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDQSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxFQUM1RSxJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQ0EsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxJQUFLLENBQUMsRUFDM0UsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUNBLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDLEVBQzVFLElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxLQUFNLENBQUMsRUFDOUQsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLElBQUssQ0FBQyxFQUM3RCxJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQzBDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsS0FBTSxDQUFDLEVBQzlELElBQUkzRCxZQUFZLENBQUVlLElBQUksQ0FBQ0UsUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDMEMsY0FBYyxDQUFDLENBQUMsRUFBRSxJQUFLLENBQUMsRUFDN0QsSUFBSTNELFlBQVksQ0FBRWUsSUFBSSxDQUFDRSxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMwQyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxFQUM5RCxJQUFJM0QsWUFBWSxDQUFFZSxJQUFJLENBQUM0QyxjQUFjLENBQUMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxDQUNqRDs7RUFFRDtFQUNBLEtBQU0sSUFBSW5CLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3FCLFFBQVEsQ0FBQzNCLE1BQU0sRUFBRU0sQ0FBQyxFQUFFLEVBQUc7SUFDMUMsS0FBTSxJQUFJQyxDQUFDLEdBQUdELENBQUMsRUFBRUMsQ0FBQyxHQUFHb0IsUUFBUSxDQUFDM0IsTUFBTSxFQUFFTyxDQUFDLEVBQUUsRUFBRztNQUMxQyxNQUFNQyxVQUFVLEdBQUdtQixRQUFRLENBQUVyQixDQUFDLENBQUUsQ0FBQ3NCLGFBQWEsQ0FBRUQsUUFBUSxDQUFFcEIsQ0FBQyxDQUFHLENBQUM7O01BRS9EO01BQ0FsQyxNQUFNLENBQUMwQixLQUFLLENBQUVTLFVBQVUsRUFBRUYsQ0FBQyxLQUFLQyxDQUFDLEdBQUcsQ0FBQyxHQUFLRCxDQUFDLEdBQUdDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFHLEVBQUcsa0JBQWlCRCxDQUFFLElBQUdDLENBQUUsRUFBRSxDQUFDO0lBQzFGO0VBQ0Y7O0VBRUE7RUFDQSxLQUFNLElBQUlELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3FCLFFBQVEsQ0FBQzNCLE1BQU0sRUFBRU0sQ0FBQyxFQUFFLEVBQUc7SUFDMUMsTUFBTWhDLENBQUMsR0FBR3FELFFBQVEsQ0FBRXJCLENBQUMsR0FBRyxDQUFDLENBQUU7SUFDM0IsTUFBTS9CLENBQUMsR0FBR29ELFFBQVEsQ0FBRXJCLENBQUMsQ0FBRTtJQUV2QixNQUFNdUIsWUFBWSxHQUFHdkQsQ0FBQyxDQUFDeUMsSUFBSSxDQUFDLENBQUM7SUFDN0JjLFlBQVksQ0FBQ0MsY0FBYyxDQUFDLENBQUM7SUFDN0J6RCxNQUFNLENBQUMwQixLQUFLLENBQUU4QixZQUFZLENBQUNELGFBQWEsQ0FBRXJELENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyx3QkFBdUIrQixDQUFDLEdBQUcsQ0FBRSxPQUFNQSxDQUFFLEVBQUUsQ0FBQztJQUUzRixNQUFNeUIsYUFBYSxHQUFHeEQsQ0FBQyxDQUFDd0MsSUFBSSxDQUFDLENBQUM7SUFDOUJnQixhQUFhLENBQUNDLGVBQWUsQ0FBQyxDQUFDO0lBQy9CM0QsTUFBTSxDQUFDMEIsS0FBSyxDQUFFZ0MsYUFBYSxDQUFDSCxhQUFhLENBQUV0RCxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUcseUJBQXdCZ0MsQ0FBRSxPQUFNQSxDQUFDLEdBQUcsQ0FBRSxFQUFFLENBQUM7RUFDL0Y7O0VBRUE7RUFDQSxLQUFNLElBQUlBLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3FCLFFBQVEsQ0FBQzNCLE1BQU0sRUFBRU0sQ0FBQyxFQUFFLEVBQUc7SUFDMUMsS0FBTSxJQUFJQyxDQUFDLEdBQUdELENBQUMsR0FBRyxDQUFDLEVBQUVDLENBQUMsR0FBR29CLFFBQVEsQ0FBQzNCLE1BQU0sRUFBRU8sQ0FBQyxFQUFFLEVBQUc7TUFDOUM7TUFDQSxNQUFNMEIsUUFBUSxHQUFHLEVBQUU7TUFDbkJOLFFBQVEsQ0FBRXJCLENBQUMsQ0FBRSxDQUFDYyxlQUFlLENBQUVPLFFBQVEsQ0FBRXBCLENBQUMsQ0FBRSxFQUFFYyxPQUFPLElBQUk7UUFBRVksUUFBUSxDQUFDNUIsSUFBSSxDQUFFZ0IsT0FBTyxDQUFDTixJQUFJLENBQUMsQ0FBRSxDQUFDO01BQUUsQ0FBQyxFQUFFLEtBQU0sQ0FBQztNQUN0RzFDLE1BQU0sQ0FBQzBCLEtBQUssQ0FBRWtDLFFBQVEsQ0FBQ2pDLE1BQU0sRUFBRU8sQ0FBQyxHQUFHRCxDQUFDLEdBQUcsQ0FBQyxFQUFHLDZCQUE0QkEsQ0FBRSxJQUFHQyxDQUFFLGNBQWMsQ0FBQzs7TUFFN0Y7TUFDQSxJQUFJMkIsSUFBSSxHQUFHLElBQUk7TUFDZixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsUUFBUSxDQUFDakMsTUFBTSxFQUFFbUMsQ0FBQyxFQUFFLEVBQUc7UUFDMUMsTUFBTTNCLFVBQVUsR0FBR3lCLFFBQVEsQ0FBRUUsQ0FBQyxDQUFFLENBQUNQLGFBQWEsQ0FBRUQsUUFBUSxDQUFFckIsQ0FBQyxHQUFHNkIsQ0FBQyxDQUFHLENBQUM7UUFDbkUsSUFBSzNCLFVBQVUsS0FBSyxDQUFDLEVBQUc7VUFDdEJuQyxNQUFNLENBQUMwQixLQUFLLENBQUVTLFVBQVUsRUFBRSxDQUFDLEVBQUcsNkJBQTRCRixDQUFFLElBQUdDLENBQUUsSUFBRzRCLENBQUUscUJBQW9CRixRQUFRLENBQUVFLENBQUMsQ0FBRSxDQUFDckMsS0FBSyxDQUFDc0MsT0FBTyxDQUFDeEIsSUFBSSxDQUFDLENBQUUsTUFBS2UsUUFBUSxDQUFFckIsQ0FBQyxHQUFHNkIsQ0FBQyxDQUFFLENBQUNyQyxLQUFLLENBQUNzQyxPQUFPLENBQUN4QixJQUFJLENBQUMsQ0FBRSxFQUFFLENBQUM7VUFDNUtzQixJQUFJLEdBQUcsS0FBSztRQUNkO01BQ0Y7TUFDQTdELE1BQU0sQ0FBQ0ksRUFBRSxDQUFFeUQsSUFBSSxFQUFHLDZCQUE0QjVCLENBQUUsSUFBR0MsQ0FBRSxtQkFBbUIsQ0FBQztJQUMzRTtFQUNGOztFQUVBO0VBQ0EsS0FBTSxJQUFJRCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdxQixRQUFRLENBQUMzQixNQUFNLEVBQUVNLENBQUMsRUFBRSxFQUFHO0lBQzFDLEtBQU0sSUFBSUMsQ0FBQyxHQUFHRCxDQUFDLEdBQUcsQ0FBQyxFQUFFQyxDQUFDLEdBQUdvQixRQUFRLENBQUMzQixNQUFNLEVBQUVPLENBQUMsRUFBRSxFQUFHO01BQzlDO01BQ0EsTUFBTTBCLFFBQVEsR0FBRyxFQUFFO01BQ25CTixRQUFRLENBQUVyQixDQUFDLENBQUUsQ0FBQ2MsZUFBZSxDQUFFTyxRQUFRLENBQUVwQixDQUFDLENBQUUsRUFBRWMsT0FBTyxJQUFJO1FBQUVZLFFBQVEsQ0FBQzVCLElBQUksQ0FBRWdCLE9BQU8sQ0FBQ04sSUFBSSxDQUFDLENBQUUsQ0FBQztNQUFFLENBQUMsRUFBRSxJQUFLLENBQUM7TUFDckcxQyxNQUFNLENBQUMwQixLQUFLLENBQUVrQyxRQUFRLENBQUNqQyxNQUFNLEVBQUVPLENBQUMsR0FBR0QsQ0FBQyxHQUFHLENBQUMsRUFBRyw2QkFBNEJBLENBQUUsSUFBR0MsQ0FBRSxjQUFjLENBQUM7O01BRTdGO01BQ0EsSUFBSTJCLElBQUksR0FBRyxJQUFJO01BQ2YsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdGLFFBQVEsQ0FBQ2pDLE1BQU0sRUFBRW1DLENBQUMsRUFBRSxFQUFHO1FBQzFDLE1BQU0zQixVQUFVLEdBQUd5QixRQUFRLENBQUVFLENBQUMsQ0FBRSxDQUFDUCxhQUFhLENBQUVELFFBQVEsQ0FBRXJCLENBQUMsR0FBRzZCLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQztRQUN2RSxJQUFLM0IsVUFBVSxLQUFLLENBQUMsRUFBRztVQUN0Qm5DLE1BQU0sQ0FBQzBCLEtBQUssQ0FBRVMsVUFBVSxFQUFFLENBQUMsRUFBRyw2QkFBNEJGLENBQUUsSUFBR0MsQ0FBRSxJQUFHNEIsQ0FBRSxxQkFBb0JGLFFBQVEsQ0FBRUUsQ0FBQyxDQUFFLENBQUNyQyxLQUFLLENBQUNzQyxPQUFPLENBQUN4QixJQUFJLENBQUMsQ0FBRSxNQUFLZSxRQUFRLENBQUVyQixDQUFDLEdBQUc2QixDQUFDLENBQUUsQ0FBQ3JDLEtBQUssQ0FBQ3NDLE9BQU8sQ0FBQ3hCLElBQUksQ0FBQyxDQUFFLEVBQUUsQ0FBQztVQUM1S3NCLElBQUksR0FBRyxLQUFLO1FBQ2Q7TUFDRjtNQUNBN0QsTUFBTSxDQUFDSSxFQUFFLENBQUV5RCxJQUFJLEVBQUcsNkJBQTRCNUIsQ0FBRSxJQUFHQyxDQUFFLG1CQUFtQixDQUFDO0lBQzNFO0VBQ0Y7QUFDRixDQUFFLENBQUM7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFyQyxLQUFLLENBQUNjLElBQUksQ0FBRSxrQ0FBa0MsRUFBRVgsTUFBTSxJQUFJO0VBQ3hELE1BQU1lLE1BQU0sR0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUUsUUFBUyxDQUFDO0VBQ2pELE1BQU1DLE9BQU8sR0FBR0gsTUFBTSxDQUFDSSxVQUFVLENBQUUsSUFBSyxDQUFDO0VBQ3pDLE1BQU02QyxPQUFPLEdBQUc5QyxPQUFPLENBQUMrQyxXQUFXLENBQUUsYUFBYyxDQUFDO0VBQ3BEakUsTUFBTSxDQUFDSSxFQUFFLENBQUU0RCxPQUFPLENBQUNFLEtBQUssRUFBRSxlQUFnQixDQUFDO0FBQzdDLENBQUUsQ0FBQztBQUVIckUsS0FBSyxDQUFDYyxJQUFJLENBQUUseUJBQXlCLEVBQUVYLE1BQU0sSUFBSTtFQUMvQyxNQUFNQyxDQUFDLEdBQUcsSUFBSWYsSUFBSSxDQUFFLElBQUssQ0FBQztFQUMxQixNQUFNZ0IsQ0FBQyxHQUFHLElBQUloQixJQUFJLENBQUUsSUFBSyxDQUFDO0VBQzFCLE1BQU1pRixDQUFDLEdBQUcsSUFBSWpGLElBQUksQ0FBRSxJQUFLLENBQUM7RUFFMUJlLENBQUMsQ0FBQ21FLFFBQVEsQ0FBRXpGLEtBQUssQ0FBQzBGLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFHLENBQUUsQ0FBQztFQUM3Q0YsQ0FBQyxDQUFDQyxRQUFRLENBQUV6RixLQUFLLENBQUMwRixTQUFTLENBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRyxDQUFFLENBQUM7RUFFL0NwRSxDQUFDLENBQUNRLFFBQVEsQ0FBRVAsQ0FBRSxDQUFDO0VBQ2ZBLENBQUMsQ0FBQ08sUUFBUSxDQUFFMEQsQ0FBRSxDQUFDO0VBRWZsRSxDQUFDLENBQUNXLGNBQWMsQ0FBQyxDQUFDO0VBRWxCWCxDQUFDLENBQUNxRSxXQUFXLENBQUVwRSxDQUFFLENBQUM7RUFDbEJpRSxDQUFDLENBQUMxRCxRQUFRLENBQUVSLENBQUUsQ0FBQztFQUVmQyxDQUFDLENBQUNVLGNBQWMsQ0FBQyxDQUFDO0VBRWxCWixNQUFNLENBQUNJLEVBQUUsQ0FBRSxJQUFJLEVBQUUsd0NBQXlDLENBQUM7QUFDN0QsQ0FBRSxDQUFDO0FBRUhQLEtBQUssQ0FBQ2MsSUFBSSxDQUFFLDZCQUE2QixFQUFFWCxNQUFNLElBQUk7RUFDbkQsTUFBTXVFLFVBQVUsR0FBRzdFLEtBQUssQ0FBQzhFLG9CQUFvQixDQUFFdEQsT0FBTyxJQUFJO0lBQUVBLE9BQU8sQ0FBQ3VELFFBQVEsQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFBRSxDQUFFLENBQUM7RUFDdkd6RSxNQUFNLENBQUNJLEVBQUUsQ0FBRUMsSUFBSSxDQUFDQyxHQUFHLENBQUVpRSxVQUFVLENBQUNHLElBQUksR0FBRyxHQUFJLENBQUMsR0FBRyxJQUFJLEVBQUVILFVBQVUsQ0FBQ0csSUFBSyxDQUFDO0VBQ3RFMUUsTUFBTSxDQUFDSSxFQUFFLENBQUVDLElBQUksQ0FBQ0MsR0FBRyxDQUFFaUUsVUFBVSxDQUFDSSxJQUFJLEdBQUcsR0FBSSxDQUFDLEdBQUcsSUFBSSxFQUFFSixVQUFVLENBQUNJLElBQUssQ0FBQztFQUN0RTNFLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFQyxJQUFJLENBQUNDLEdBQUcsQ0FBRWlFLFVBQVUsQ0FBQ0ssSUFBSSxHQUFHLEdBQUksQ0FBQyxHQUFHLElBQUksRUFBRUwsVUFBVSxDQUFDSyxJQUFLLENBQUM7RUFDdEU1RSxNQUFNLENBQUNJLEVBQUUsQ0FBRUMsSUFBSSxDQUFDQyxHQUFHLENBQUVpRSxVQUFVLENBQUNNLElBQUksR0FBRyxHQUFJLENBQUMsR0FBRyxJQUFJLEVBQUVOLFVBQVUsQ0FBQ00sSUFBSyxDQUFDO0FBQ3hFLENBQUUsQ0FBQztBQUVIaEYsS0FBSyxDQUFDYyxJQUFJLENBQUUsNkNBQTZDLEVBQUVYLE1BQU0sSUFBSTtFQUNuRSxNQUFNOEUsVUFBVSxHQUFHcEYsS0FBSyxDQUFDOEUsb0JBQW9CLENBQUV0RCxPQUFPLElBQUk7SUFBRUEsT0FBTyxDQUFDNkQsUUFBUSxDQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQUUsQ0FBRSxDQUFDO0VBQ3hHL0UsTUFBTSxDQUFDSSxFQUFFLENBQUUwRSxVQUFVLENBQUNFLFlBQVksRUFBRUYsVUFBVSxDQUFDeEMsUUFBUSxDQUFDLENBQUUsQ0FBQzs7RUFFM0Q7RUFDQXRDLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFMEUsVUFBVSxDQUFDRyxTQUFTLEdBQUcsSUFBSSxFQUFHLGNBQWFILFVBQVUsQ0FBQ0csU0FBVSxFQUFFLENBQUM7QUFDaEYsQ0FBRSxDQUFDO0FBRUhwRixLQUFLLENBQUNjLElBQUksQ0FBRSw2Q0FBNkMsRUFBRVgsTUFBTSxJQUFJO0VBQ25FLE1BQU1rRixJQUFJLEdBQUcsSUFBSTVGLElBQUksQ0FBRSxTQUFVLENBQUM7RUFDbEMsTUFBTXdGLFVBQVUsR0FBR3ZGLFVBQVUsQ0FBQzRGLDRCQUE0QixDQUFFRCxJQUFLLENBQUM7RUFDbEVsRixNQUFNLENBQUNJLEVBQUUsQ0FBRTBFLFVBQVUsQ0FBQ0UsWUFBWSxFQUFFRixVQUFVLENBQUN4QyxRQUFRLENBQUMsQ0FBRSxDQUFDOztFQUUzRDtFQUNBdEMsTUFBTSxDQUFDSSxFQUFFLENBQUUwRSxVQUFVLENBQUNHLFNBQVMsR0FBRyxDQUFDLEVBQUcsY0FBYUgsVUFBVSxDQUFDRyxTQUFVLEVBQUUsQ0FBQztBQUM3RSxDQUFFLENBQUM7QUFFSHBGLEtBQUssQ0FBQ2MsSUFBSSxDQUFFLDJCQUEyQixFQUFFWCxNQUFNLElBQUk7RUFDakQsTUFBTVEsSUFBSSxHQUFHLElBQUl0QixJQUFJLENBQUUsSUFBSyxDQUFDO0VBQzdCLE1BQU1rRyxJQUFJLEdBQUcsU0FBUztFQUN0QjVFLElBQUksQ0FBQzRFLElBQUksR0FBR0EsSUFBSTtFQUNoQnBGLE1BQU0sQ0FBQzBCLEtBQUssQ0FBRWxCLElBQUksQ0FBQzRFLElBQUksRUFBRUEsSUFBSyxDQUFDO0VBQy9CcEYsTUFBTSxDQUFDMEIsS0FBSyxDQUFFbEIsSUFBSSxDQUFDNkUsT0FBTyxDQUFDLENBQUMsRUFBRUQsSUFBSyxDQUFDO0VBRXBDLE1BQU1FLFNBQVMsR0FBRyxJQUFJcEcsSUFBSSxDQUFFUCxLQUFLLENBQUMwRixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQUU7SUFBRWUsSUFBSSxFQUFFQTtFQUFLLENBQUUsQ0FBQztFQUU3RXBGLE1BQU0sQ0FBQzBCLEtBQUssQ0FBRTRELFNBQVMsQ0FBQ0YsSUFBSSxFQUFFQSxJQUFLLENBQUM7QUFDdEMsQ0FBRSxDQUFDO0FBRUh2RixLQUFLLENBQUNjLElBQUksQ0FBRSx1QkFBdUIsRUFBRVgsTUFBTSxJQUFJO0VBQzdDLE1BQU1RLElBQUksR0FBRyxJQUFJdkIsSUFBSSxDQUFDLENBQUM7RUFFdkJ1QixJQUFJLENBQUMrRSxLQUFLLENBQUUsQ0FBRSxDQUFDO0VBQ2YvRSxJQUFJLENBQUNnRixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUN0QmhGLElBQUksQ0FBQ2lGLE1BQU0sQ0FBRXBGLElBQUksQ0FBQ3FGLEVBQUUsR0FBRyxDQUFFLENBQUM7RUFDMUJsRixJQUFJLENBQUNnRixTQUFTLENBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRyxDQUFDO0VBRXpCekYsWUFBWSxDQUFFQyxNQUFNLEVBQUVRLElBQUksQ0FBQ21GLFNBQVMsQ0FBQyxDQUFDLENBQUNDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBQ2pEN0YsWUFBWSxDQUFFQyxNQUFNLEVBQUVRLElBQUksQ0FBQ21GLFNBQVMsQ0FBQyxDQUFDLENBQUNFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7RUFDbEQ5RixZQUFZLENBQUVDLE1BQU0sRUFBRVEsSUFBSSxDQUFDbUYsU0FBUyxDQUFDLENBQUMsQ0FBQ0csR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQztFQUNuRC9GLFlBQVksQ0FBRUMsTUFBTSxFQUFFUSxJQUFJLENBQUNtRixTQUFTLENBQUMsQ0FBQyxDQUFDSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUNqRGhHLFlBQVksQ0FBRUMsTUFBTSxFQUFFUSxJQUFJLENBQUNtRixTQUFTLENBQUMsQ0FBQyxDQUFDSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUNqRGpHLFlBQVksQ0FBRUMsTUFBTSxFQUFFUSxJQUFJLENBQUNtRixTQUFTLENBQUMsQ0FBQyxDQUFDTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDO0VBRW5EbEcsWUFBWSxDQUFFQyxNQUFNLEVBQUVRLElBQUksQ0FBQzBGLENBQUMsRUFBRSxDQUFDLEVBQUcsQ0FBQztFQUNuQ25HLFlBQVksQ0FBRUMsTUFBTSxFQUFFUSxJQUFJLENBQUMyRixDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUM7RUFDbkNwRyxZQUFZLENBQUVDLE1BQU0sRUFBRVEsSUFBSSxDQUFDNEYsUUFBUSxFQUFFL0YsSUFBSSxDQUFDcUYsRUFBRSxHQUFHLENBQUUsQ0FBQztFQUVsRGxGLElBQUksQ0FBQzZGLFdBQVcsR0FBRyxJQUFJM0gsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUV2Q3FCLFlBQVksQ0FBRUMsTUFBTSxFQUFFUSxJQUFJLENBQUNtRixTQUFTLENBQUMsQ0FBQyxDQUFDRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO0VBQ2xEL0YsWUFBWSxDQUFFQyxNQUFNLEVBQUVRLElBQUksQ0FBQ21GLFNBQVMsQ0FBQyxDQUFDLENBQUNNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBRSxDQUFDO0VBRWpEekYsSUFBSSxDQUFDNEYsUUFBUSxHQUFHLEdBQUc7RUFFbkJyRyxZQUFZLENBQUVDLE1BQU0sRUFBRVEsSUFBSSxDQUFDbUYsU0FBUyxDQUFDLENBQUMsQ0FBQ0UsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFrQixDQUFDO0VBRWxFckYsSUFBSSxDQUFDNEYsUUFBUSxHQUFHLENBQUMsR0FBRztFQUVwQnJHLFlBQVksQ0FBRUMsTUFBTSxFQUFFUSxJQUFJLENBQUNtRixTQUFTLENBQUMsQ0FBQyxDQUFDSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWtCLENBQUM7QUFDcEUsQ0FBRSxDQUFDO0FBRUhsRyxLQUFLLENBQUNjLElBQUksQ0FBRSw0QkFBNEIsRUFBRVgsTUFBTSxJQUFJO0VBQ2xELE1BQU1RLElBQUksR0FBRyxJQUFJdEIsSUFBSSxDQUFFUCxLQUFLLENBQUMwRixTQUFTLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxFQUFFO0lBQzFEa0IsS0FBSyxFQUFFO0VBQ1QsQ0FBRSxDQUFDO0VBRUh4RixZQUFZLENBQUVDLE1BQU0sRUFBRVEsSUFBSSxDQUFDOEYsSUFBSSxFQUFFLENBQUMsRUFBRyxDQUFDO0VBQ3RDdkcsWUFBWSxDQUFFQyxNQUFNLEVBQUVRLElBQUksQ0FBQytGLEtBQUssRUFBRSxFQUFHLENBQUM7RUFFdEMvRixJQUFJLENBQUM4RixJQUFJLEdBQUcsRUFBRTtFQUNkdkcsWUFBWSxDQUFFQyxNQUFNLEVBQUVRLElBQUksQ0FBQzhGLElBQUksRUFBRSxFQUFHLENBQUM7RUFDckN2RyxZQUFZLENBQUVDLE1BQU0sRUFBRVEsSUFBSSxDQUFDK0YsS0FBSyxFQUFFLEdBQUksQ0FBQztFQUV2Qy9GLElBQUksQ0FBQytGLEtBQUssR0FBRyxFQUFFO0VBQ2Z4RyxZQUFZLENBQUVDLE1BQU0sRUFBRVEsSUFBSSxDQUFDOEYsSUFBSSxFQUFFLENBQUMsRUFBRyxDQUFDO0VBQ3RDdkcsWUFBWSxDQUFFQyxNQUFNLEVBQUVRLElBQUksQ0FBQytGLEtBQUssRUFBRSxFQUFHLENBQUM7RUFFdEMvRixJQUFJLENBQUNnRyxPQUFPLEdBQUcsQ0FBQztFQUNoQnpHLFlBQVksQ0FBRUMsTUFBTSxFQUFFUSxJQUFJLENBQUNnRyxPQUFPLEVBQUUsQ0FBRSxDQUFDO0VBQ3ZDekcsWUFBWSxDQUFFQyxNQUFNLEVBQUVRLElBQUksQ0FBQzhGLElBQUksRUFBRSxDQUFDLEVBQUcsQ0FBQztFQUN0Q3ZHLFlBQVksQ0FBRUMsTUFBTSxFQUFFUSxJQUFJLENBQUMrRixLQUFLLEVBQUUsRUFBRyxDQUFDO0FBQ3hDLENBQUUsQ0FBQztBQUVIMUcsS0FBSyxDQUFDYyxJQUFJLENBQUUsdUJBQXVCLEVBQUVYLE1BQU0sSUFBSTtFQUM3QyxNQUFNeUcsS0FBSyxHQUFHLElBQUl4SCxJQUFJLENBQUMsQ0FBQztFQUN4QixNQUFNdUIsSUFBSSxHQUFHLElBQUl0QixJQUFJLENBQUUsSUFBSVAsS0FBSyxDQUFDLENBQUUsQ0FBQztFQUNwQzhILEtBQUssQ0FBQ2hHLFFBQVEsQ0FBRUQsSUFBSyxDQUFDO0VBQ3RCUixNQUFNLENBQUNJLEVBQUUsQ0FBRSxJQUFJLEVBQUUsd0NBQXlDLENBQUM7QUFDN0QsQ0FBRSxDQUFDO0FBRUhQLEtBQUssQ0FBQ2MsSUFBSSxDQUFFLHNCQUFzQixFQUFFWCxNQUFNLElBQUk7RUFDNUMsTUFBTXlHLEtBQUssR0FBRyxJQUFJeEgsSUFBSSxDQUFDLENBQUM7RUFDeEIsTUFBTXVCLElBQUksR0FBRyxJQUFJdEIsSUFBSSxDQUFFLElBQUssQ0FBQztFQUM3QnVILEtBQUssQ0FBQ2hHLFFBQVEsQ0FBRUQsSUFBSyxDQUFDO0VBQ3RCUixNQUFNLENBQUNJLEVBQUUsQ0FBRSxJQUFJLEVBQUUsd0NBQXlDLENBQUM7QUFDN0QsQ0FBRSxDQUFDO0FBRUhQLEtBQUssQ0FBQ2MsSUFBSSxDQUFFLHNCQUFzQixFQUFFWCxNQUFNLElBQUk7RUFDNUMsTUFBTXlHLEtBQUssR0FBRyxJQUFJeEgsSUFBSSxDQUFDLENBQUM7RUFDeEIsTUFBTXlILE9BQU8sR0FBRyxJQUFJNUgsT0FBTyxDQUFFMkgsS0FBTSxDQUFDO0VBRXBDLElBQUl2QyxLQUFLO0VBQ1QsSUFBSXlDLE1BQU07RUFDVixJQUFJQyxLQUFLLEdBQUcsQ0FBQztFQUViRixPQUFPLENBQUNHLFlBQVksQ0FBQ0MsUUFBUSxDQUFFQyxJQUFJLElBQUk7SUFDckM3QyxLQUFLLEdBQUc2QyxJQUFJLENBQUM3QyxLQUFLO0lBQ2xCeUMsTUFBTSxHQUFHSSxJQUFJLENBQUNKLE1BQU07SUFDcEJDLEtBQUssRUFBRTtFQUNULENBQUUsQ0FBQztFQUVIRixPQUFPLENBQUNNLGNBQWMsQ0FBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0VBRWxDaEgsTUFBTSxDQUFDMEIsS0FBSyxDQUFFd0MsS0FBSyxFQUFFLEdBQUcsRUFBRSxvQkFBcUIsQ0FBQztFQUNoRGxFLE1BQU0sQ0FBQzBCLEtBQUssQ0FBRWlGLE1BQU0sRUFBRSxHQUFHLEVBQUUscUJBQXNCLENBQUM7RUFDbEQzRyxNQUFNLENBQUMwQixLQUFLLENBQUVrRixLQUFLLEVBQUUsQ0FBQyxFQUFFLG9CQUFxQixDQUFDO0FBQ2hELENBQUUsQ0FBQztBQUVIL0csS0FBSyxDQUFDYyxJQUFJLENBQUUsZUFBZSxFQUFFWCxNQUFNLElBQUk7RUFDckMsTUFBTVEsSUFBSSxHQUFHLElBQUl2QixJQUFJLENBQUMsQ0FBQztFQUN2QnVCLElBQUksQ0FBQzJGLENBQUMsR0FBRyxFQUFFO0VBRVgsTUFBTWMsSUFBSSxHQUFHLElBQUk5SCxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO0lBQUVpRyxJQUFJLEVBQUU7RUFBTyxDQUFFLENBQUM7RUFDN0Q2QixJQUFJLENBQUNmLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztFQUNiMUYsSUFBSSxDQUFDQyxRQUFRLENBQUV3RyxJQUFLLENBQUM7RUFFckJ6RyxJQUFJLENBQUNJLGNBQWMsQ0FBQyxDQUFDO0VBRXJCLE1BQU1zRyxPQUFPLEdBQUcsU0FBUztFQUV6QjFHLElBQUksQ0FBQzJHLG1CQUFtQixDQUFDTCxRQUFRLENBQUUsTUFBTTtJQUN2QzlHLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSSxJQUFJLENBQUM0RyxXQUFXLENBQUNDLGFBQWEsQ0FBRSxJQUFJNUksT0FBTyxDQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQyxFQUFFeUksT0FBUSxDQUFDLEVBQUcsOEJBQTZCMUcsSUFBSSxDQUFDNEcsV0FBVyxDQUFDOUUsUUFBUSxDQUFDLENBQUUsRUFBRSxDQUFDO0VBQ3BKLENBQUUsQ0FBQztFQUVIOUIsSUFBSSxDQUFDOEcsY0FBYyxDQUFDUixRQUFRLENBQUUsTUFBTTtJQUNsQzlHLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSSxJQUFJLENBQUMrRyxNQUFNLENBQUNGLGFBQWEsQ0FBRSxJQUFJNUksT0FBTyxDQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQyxFQUFFeUksT0FBUSxDQUFDLEVBQUcsd0JBQXVCMUcsSUFBSSxDQUFDK0csTUFBTSxDQUFDakYsUUFBUSxDQUFDLENBQUUsRUFBRSxDQUFDO0VBQ3JJLENBQUUsQ0FBQztFQUVIOUIsSUFBSSxDQUFDZ0gsa0JBQWtCLENBQUNWLFFBQVEsQ0FBRSxNQUFNO0lBQ3RDOUcsTUFBTSxDQUFDSSxFQUFFLENBQUUsS0FBSyxFQUFFLCtDQUFnRCxDQUFDO0VBQ3JFLENBQUUsQ0FBQztFQUVINkcsSUFBSSxDQUFDTyxrQkFBa0IsQ0FBQ1YsUUFBUSxDQUFFLE1BQU07SUFDdEM5RyxNQUFNLENBQUNJLEVBQUUsQ0FBRTZHLElBQUksQ0FBQ1EsVUFBVSxDQUFDSixhQUFhLENBQUUsSUFBSTVJLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUMsRUFBRXlJLE9BQVEsQ0FBQyxFQUFHLHNCQUFxQkQsSUFBSSxDQUFDUSxVQUFVLENBQUNuRixRQUFRLENBQUMsQ0FBRSxFQUFFLENBQUM7RUFDekksQ0FBRSxDQUFDO0VBRUgyRSxJQUFJLENBQUNLLGNBQWMsQ0FBQ1IsUUFBUSxDQUFFLE1BQU07SUFDbEM5RyxNQUFNLENBQUNJLEVBQUUsQ0FBRTZHLElBQUksQ0FBQ00sTUFBTSxDQUFDRixhQUFhLENBQUUsSUFBSTVJLE9BQU8sQ0FBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUMsRUFBRXlJLE9BQVEsQ0FBQyxFQUFHLGlCQUFnQkQsSUFBSSxDQUFDTSxNQUFNLENBQUNqRixRQUFRLENBQUMsQ0FBRSxFQUFFLENBQUM7RUFDN0gsQ0FBRSxDQUFDO0VBRUgyRSxJQUFJLENBQUNFLG1CQUFtQixDQUFDTCxRQUFRLENBQUUsTUFBTTtJQUN2QzlHLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFLEtBQUssRUFBRSw4Q0FBK0MsQ0FBQztFQUNwRSxDQUFFLENBQUM7RUFFSDZHLElBQUksQ0FBQ1MsVUFBVSxHQUFHLEVBQUU7RUFDcEJsSCxJQUFJLENBQUNJLGNBQWMsQ0FBQyxDQUFDO0FBQ3ZCLENBQUUsQ0FBQztBQUVIZixLQUFLLENBQUNjLElBQUksQ0FBRSx3QkFBd0IsRUFBRVgsTUFBTSxJQUFJO0VBQzlDLE1BQU15RyxLQUFLLEdBQUcsSUFBSXhILElBQUksQ0FBQyxDQUFDO0VBRXhCLE1BQU1nSSxJQUFJLEdBQUcsSUFBSTlILFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUM7RUFDM0NhLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFNkcsSUFBSSxDQUFDN0IsSUFBSSxLQUFLLElBQUksRUFBRSxnQ0FBaUMsQ0FBQztFQUNqRXFCLEtBQUssQ0FBQ2hHLFFBQVEsQ0FBRXdHLElBQUssQ0FBQztFQUN0QixNQUFNVSxLQUFLLEdBQUcsSUFBSTlJLEtBQUssQ0FBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztFQUNwQ29JLElBQUksQ0FBQzdCLElBQUksR0FBR3VDLEtBQUs7RUFDakJBLEtBQUssQ0FBQ0MsT0FBTyxDQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztBQUMvQixDQUFFLENBQUM7QUFFSC9ILEtBQUssQ0FBQ2MsSUFBSSxDQUFFLDJCQUEyQixFQUFFWCxNQUFNLElBQUk7RUFDakQsTUFBTVEsSUFBSSxHQUFHLElBQUl2QixJQUFJLENBQUMsQ0FBQztFQUN2QixNQUFNZ0ksSUFBSSxHQUFHLElBQUk5SCxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRyxDQUFDO0VBQzNDcUIsSUFBSSxDQUFDQyxRQUFRLENBQUV3RyxJQUFLLENBQUM7RUFFckJqSCxNQUFNLENBQUNJLEVBQUUsQ0FBRUksSUFBSSxDQUFDcUgsYUFBYSxDQUFDakYsTUFBTSxDQUFFLElBQUluRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRyxDQUFFLENBQUMsRUFBRSx3QkFBeUIsQ0FBQztFQUNoR3VCLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSSxJQUFJLENBQUMrRyxNQUFNLENBQUMzRSxNQUFNLENBQUUsSUFBSW5FLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUUsQ0FBQyxFQUFFLHlCQUEwQixDQUFDO0VBRTFGd0ksSUFBSSxDQUFDbkUsT0FBTyxHQUFHLEtBQUs7RUFFcEI5QyxNQUFNLENBQUNJLEVBQUUsQ0FBRUksSUFBSSxDQUFDcUgsYUFBYSxDQUFDakYsTUFBTSxDQUFFbkUsT0FBTyxDQUFDcUosT0FBUSxDQUFDLEVBQUUsMEJBQTJCLENBQUM7RUFDckY5SCxNQUFNLENBQUNJLEVBQUUsQ0FBRUksSUFBSSxDQUFDK0csTUFBTSxDQUFDM0UsTUFBTSxDQUFFLElBQUluRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRyxDQUFFLENBQUMsRUFBRSwyQkFBNEIsQ0FBQztBQUM5RixDQUFFLENBQUM7QUFFSG9CLEtBQUssQ0FBQ2MsSUFBSSxDQUFFLHNCQUFzQixFQUFFWCxNQUFNLElBQUk7RUFDNUMsTUFBTVEsSUFBSSxHQUFHLElBQUl2QixJQUFJLENBQUU7SUFBRWtILENBQUMsRUFBRTtFQUFFLENBQUUsQ0FBQztFQUNqQyxNQUFNYyxJQUFJLEdBQUcsSUFBSTlILFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFHLENBQUM7RUFDM0NxQixJQUFJLENBQUNDLFFBQVEsQ0FBRXdHLElBQUssQ0FBQztFQUVyQkEsSUFBSSxDQUFDYyxXQUFXLEdBQUcsSUFBSXRKLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFHLENBQUM7RUFDOUN1QixNQUFNLENBQUNJLEVBQUUsQ0FBRUksSUFBSSxDQUFDdUgsV0FBVyxDQUFDbkYsTUFBTSxDQUFFLElBQUluRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRyxDQUFFLENBQUMsRUFBRSw4QkFBK0IsQ0FBQztFQUNuR3VCLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSSxJQUFJLENBQUMrRyxNQUFNLENBQUMzRSxNQUFNLENBQUUsSUFBSW5FLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFHLENBQUUsQ0FBQyxFQUFFLDhCQUErQixDQUFDO0VBRTlGd0ksSUFBSSxDQUFDYyxXQUFXLEdBQUcsSUFBSXRKLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFJLENBQUM7RUFDL0N1QixNQUFNLENBQUNJLEVBQUUsQ0FBRUksSUFBSSxDQUFDK0csTUFBTSxDQUFDM0UsTUFBTSxDQUFFLElBQUluRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBSSxDQUFFLENBQUMsRUFBRSxrQ0FBbUMsQ0FBQzs7RUFFbkc7RUFDQXdJLElBQUksQ0FBQ2MsV0FBVyxHQUFHLElBQUk7RUFDdkIvSCxNQUFNLENBQUNJLEVBQUUsQ0FBRUksSUFBSSxDQUFDK0csTUFBTSxDQUFDM0UsTUFBTSxDQUFFLElBQUluRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRyxDQUFFLENBQUMsRUFBRSxvQ0FBcUMsQ0FBQztFQUVyRytCLElBQUksQ0FBQ3VILFdBQVcsR0FBRyxJQUFJdEosT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUksQ0FBQztFQUMvQ3VCLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSSxJQUFJLENBQUN1SCxXQUFXLENBQUNuRixNQUFNLENBQUUsSUFBSW5FLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFJLENBQUUsQ0FBQyxFQUFFLGdDQUFpQyxDQUFDO0VBQ3RHdUIsTUFBTSxDQUFDSSxFQUFFLENBQUVJLElBQUksQ0FBQytHLE1BQU0sQ0FBQzNFLE1BQU0sQ0FBRSxJQUFJbkUsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUksQ0FBRSxDQUFDLEVBQUUsZ0NBQWlDLENBQUM7QUFDbkcsQ0FBRSxDQUFDO0FBRUgsU0FBU3VKLGtCQUFrQkEsQ0FBRS9ILENBQUMsRUFBRUMsQ0FBQyxFQUFHO0VBQ2xDO0VBQ0FELENBQUMsR0FBR0EsQ0FBQyxDQUFDZ0ksS0FBSyxDQUFDLENBQUM7RUFDYi9ILENBQUMsR0FBR0EsQ0FBQyxDQUFDK0gsS0FBSyxDQUFDLENBQUM7RUFFYixLQUFNLElBQUloRyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdoQyxDQUFDLENBQUMwQixNQUFNLEVBQUVNLENBQUMsRUFBRSxFQUFHO0lBQ25DO0lBQ0EsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdoQyxDQUFDLENBQUN5QixNQUFNLEVBQUVPLENBQUMsRUFBRSxFQUFHO01BQ25DLElBQUtqQyxDQUFDLENBQUVnQyxDQUFDLENBQUUsQ0FBQ1csTUFBTSxDQUFFMUMsQ0FBQyxDQUFFZ0MsQ0FBQyxDQUFHLENBQUMsRUFBRztRQUM3QmhDLENBQUMsQ0FBQ2dJLE1BQU0sQ0FBRWhHLENBQUMsRUFBRSxDQUFFLENBQUM7UUFDaEI7TUFDRjtJQUNGO0VBQ0Y7O0VBRUE7RUFDQSxPQUFPaEMsQ0FBQyxDQUFDeUIsTUFBTSxLQUFLLENBQUM7QUFDdkI7QUFFQTlCLEtBQUssQ0FBQ2MsSUFBSSxDQUFFLDBCQUEwQixFQUFFWCxNQUFNLElBQUk7RUFDaEQsTUFBTUMsQ0FBQyxHQUFHLElBQUloQixJQUFJLENBQUMsQ0FBQztFQUNwQixNQUFNaUIsQ0FBQyxHQUFHLElBQUlqQixJQUFJLENBQUMsQ0FBQztFQUNwQixNQUFNa0YsQ0FBQyxHQUFHLElBQUlsRixJQUFJLENBQUMsQ0FBQztFQUNwQixNQUFNa0osQ0FBQyxHQUFHLElBQUlsSixJQUFJLENBQUMsQ0FBQztFQUNwQixNQUFNbUosQ0FBQyxHQUFHLElBQUluSixJQUFJLENBQUMsQ0FBQzs7RUFFcEI7RUFDQWdCLENBQUMsQ0FBQ1EsUUFBUSxDQUFFUCxDQUFFLENBQUM7RUFDZkQsQ0FBQyxDQUFDUSxRQUFRLENBQUUwRCxDQUFFLENBQUM7RUFDZmpFLENBQUMsQ0FBQ08sUUFBUSxDQUFFMEgsQ0FBRSxDQUFDO0VBQ2ZoRSxDQUFDLENBQUMxRCxRQUFRLENBQUUwSCxDQUFFLENBQUM7RUFDZmhFLENBQUMsQ0FBQzFELFFBQVEsQ0FBRTJILENBQUUsQ0FBQzs7RUFFZjtFQUNBQyxNQUFNLENBQUNySSxNQUFNLElBQUlBLE1BQU0sQ0FBQ3NJLE1BQU0sQ0FBRSxNQUFNO0lBQUVILENBQUMsQ0FBQy9FLGNBQWMsQ0FBQyxDQUFDO0VBQUUsQ0FBQyxFQUFFLDRDQUE2QyxDQUFDO0VBQzdHcEQsTUFBTSxDQUFDSSxFQUFFLENBQUVILENBQUMsQ0FBQ21ELGNBQWMsQ0FBQyxDQUFDLENBQUNSLE1BQU0sQ0FBRSxJQUFJcEQsS0FBSyxDQUFFLENBQUVTLENBQUMsQ0FBRyxDQUFFLENBQUMsRUFBRSxvQkFBcUIsQ0FBQztFQUNsRkQsTUFBTSxDQUFDSSxFQUFFLENBQUVGLENBQUMsQ0FBQ2tELGNBQWMsQ0FBQyxDQUFDLENBQUNSLE1BQU0sQ0FBRSxJQUFJcEQsS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRUMsQ0FBQyxDQUFHLENBQUUsQ0FBQyxFQUFFLG9CQUFxQixDQUFDO0VBQ3JGRixNQUFNLENBQUNJLEVBQUUsQ0FBRStELENBQUMsQ0FBQ2YsY0FBYyxDQUFDLENBQUMsQ0FBQ1IsTUFBTSxDQUFFLElBQUlwRCxLQUFLLENBQUUsQ0FBRVMsQ0FBQyxFQUFFa0UsQ0FBQyxDQUFHLENBQUUsQ0FBQyxFQUFFLG9CQUFxQixDQUFDO0VBQ3JGbkUsTUFBTSxDQUFDSSxFQUFFLENBQUVnSSxDQUFDLENBQUNoRixjQUFjLENBQUMsQ0FBQyxDQUFDUixNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFUyxDQUFDLEVBQUVrRSxDQUFDLEVBQUVpRSxDQUFDLENBQUcsQ0FBRSxDQUFDLEVBQUUsb0JBQXFCLENBQUM7O0VBRXhGO0VBQ0EsSUFBSXRHLE1BQU07RUFDVkEsTUFBTSxHQUFHN0IsQ0FBQyxDQUFDc0ksU0FBUyxDQUFDLENBQUM7RUFDdEJ2SSxNQUFNLENBQUNJLEVBQUUsQ0FBRTBCLE1BQU0sQ0FBQ0gsTUFBTSxLQUFLLENBQUMsSUFBSUcsTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDYyxNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFUyxDQUFDLENBQUcsQ0FBRSxDQUFDLEVBQUUsZUFBZ0IsQ0FBQztFQUM3RjZCLE1BQU0sR0FBRzVCLENBQUMsQ0FBQ3FJLFNBQVMsQ0FBQyxDQUFDO0VBQ3RCdkksTUFBTSxDQUFDSSxFQUFFLENBQUUwQixNQUFNLENBQUNILE1BQU0sS0FBSyxDQUFDLElBQUlHLE1BQU0sQ0FBRSxDQUFDLENBQUUsQ0FBQ2MsTUFBTSxDQUFFLElBQUlwRCxLQUFLLENBQUUsQ0FBRVMsQ0FBQyxFQUFFQyxDQUFDLENBQUcsQ0FBRSxDQUFDLEVBQUUsZUFBZ0IsQ0FBQztFQUNoRzRCLE1BQU0sR0FBR3FDLENBQUMsQ0FBQ29FLFNBQVMsQ0FBQyxDQUFDO0VBQ3RCdkksTUFBTSxDQUFDSSxFQUFFLENBQUUwQixNQUFNLENBQUNILE1BQU0sS0FBSyxDQUFDLElBQUlHLE1BQU0sQ0FBRSxDQUFDLENBQUUsQ0FBQ2MsTUFBTSxDQUFFLElBQUlwRCxLQUFLLENBQUUsQ0FBRVMsQ0FBQyxFQUFFa0UsQ0FBQyxDQUFHLENBQUUsQ0FBQyxFQUFFLGVBQWdCLENBQUM7RUFDaEdyQyxNQUFNLEdBQUdxRyxDQUFDLENBQUNJLFNBQVMsQ0FBQyxDQUFDO0VBQ3RCdkksTUFBTSxDQUFDSSxFQUFFLENBQUUwQixNQUFNLENBQUNILE1BQU0sS0FBSyxDQUFDLElBQUlxRyxrQkFBa0IsQ0FBRWxHLE1BQU0sRUFBRSxDQUFFLElBQUl0QyxLQUFLLENBQUUsQ0FBRVMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVpSSxDQUFDLENBQUcsQ0FBQyxFQUFFLElBQUkzSSxLQUFLLENBQUUsQ0FBRVMsQ0FBQyxFQUFFa0UsQ0FBQyxFQUFFZ0UsQ0FBQyxDQUFHLENBQUMsQ0FBRyxDQUFDLEVBQUUsZUFBZ0IsQ0FBQztFQUN6SXJHLE1BQU0sR0FBR3NHLENBQUMsQ0FBQ0csU0FBUyxDQUFDLENBQUM7RUFDdEJ2SSxNQUFNLENBQUNJLEVBQUUsQ0FBRTBCLE1BQU0sQ0FBQ0gsTUFBTSxLQUFLLENBQUMsSUFBSUcsTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDYyxNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFUyxDQUFDLEVBQUVrRSxDQUFDLEVBQUVpRSxDQUFDLENBQUcsQ0FBRSxDQUFDLEVBQUUsZUFBZ0IsQ0FBQzs7RUFFbkc7RUFDQUMsTUFBTSxDQUFDckksTUFBTSxJQUFJQSxNQUFNLENBQUNzSSxNQUFNLENBQUUsTUFBTTtJQUFFRixDQUFDLENBQUNoRixjQUFjLENBQUU1QyxJQUFJLElBQUksS0FBTSxDQUFDO0VBQUUsQ0FBQyxFQUFFLDBCQUEyQixDQUFDO0VBQzFHNkgsTUFBTSxDQUFDckksTUFBTSxJQUFJQSxNQUFNLENBQUNzSSxNQUFNLENBQUUsTUFBTTtJQUFFRixDQUFDLENBQUNoRixjQUFjLENBQUU1QyxJQUFJLElBQUksS0FBTSxDQUFDO0VBQUUsQ0FBQyxFQUFFLDBCQUEyQixDQUFDO0VBQzFHUixNQUFNLENBQUNJLEVBQUUsQ0FBRWdJLENBQUMsQ0FBQ2hGLGNBQWMsQ0FBRTVDLElBQUksSUFBSUEsSUFBSSxLQUFLUCxDQUFFLENBQUMsQ0FBQzJDLE1BQU0sQ0FBRSxJQUFJcEQsS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRWtFLENBQUMsRUFBRWlFLENBQUMsQ0FBRyxDQUFFLENBQUUsQ0FBQztFQUN0RnBJLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFZ0ksQ0FBQyxDQUFDaEYsY0FBYyxDQUFFNUMsSUFBSSxJQUFJQSxJQUFJLEtBQUsyRCxDQUFFLENBQUMsQ0FBQ3ZCLE1BQU0sQ0FBRSxJQUFJcEQsS0FBSyxDQUFFLENBQUUyRSxDQUFDLEVBQUVpRSxDQUFDLENBQUcsQ0FBRSxDQUFFLENBQUM7RUFDbkZwSSxNQUFNLENBQUNJLEVBQUUsQ0FBRWdJLENBQUMsQ0FBQ2hGLGNBQWMsQ0FBRTVDLElBQUksSUFBSUEsSUFBSSxLQUFLNEgsQ0FBRSxDQUFDLENBQUN4RixNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFNEksQ0FBQyxDQUFHLENBQUUsQ0FBRSxDQUFDO0VBQ2hGcEksTUFBTSxDQUFDSSxFQUFFLENBQUUrSCxDQUFDLENBQUMvRSxjQUFjLENBQUU1QyxJQUFJLElBQUlBLElBQUksS0FBS04sQ0FBRSxDQUFDLENBQUMwQyxNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFVSxDQUFDLEVBQUVpSSxDQUFDLENBQUcsQ0FBRSxDQUFFLENBQUM7RUFDbkZuSSxNQUFNLENBQUNJLEVBQUUsQ0FBRStILENBQUMsQ0FBQy9FLGNBQWMsQ0FBRTVDLElBQUksSUFBSUEsSUFBSSxLQUFLMkQsQ0FBRSxDQUFDLENBQUN2QixNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFMkUsQ0FBQyxFQUFFZ0UsQ0FBQyxDQUFHLENBQUUsQ0FBRSxDQUFDO0VBQ25GbkksTUFBTSxDQUFDSSxFQUFFLENBQUUrSCxDQUFDLENBQUMvRSxjQUFjLENBQUU1QyxJQUFJLElBQUlBLElBQUksS0FBSzJILENBQUUsQ0FBQyxDQUFDdkYsTUFBTSxDQUFFLElBQUlwRCxLQUFLLENBQUUsQ0FBRTJJLENBQUMsQ0FBRyxDQUFFLENBQUUsQ0FBQzs7RUFFaEY7RUFDQXJHLE1BQU0sR0FBR3FHLENBQUMsQ0FBQ0ksU0FBUyxDQUFFL0gsSUFBSSxJQUFJLEtBQU0sQ0FBQztFQUNyQ1IsTUFBTSxDQUFDSSxFQUFFLENBQUUwQixNQUFNLENBQUNILE1BQU0sS0FBSyxDQUFFLENBQUM7RUFDaENHLE1BQU0sR0FBR3FHLENBQUMsQ0FBQ0ksU0FBUyxDQUFFL0gsSUFBSSxJQUFJLElBQUssQ0FBQztFQUNwQ1IsTUFBTSxDQUFDSSxFQUFFLENBQUU0SCxrQkFBa0IsQ0FBRWxHLE1BQU0sRUFBRSxDQUNyQyxJQUFJdEMsS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRUMsQ0FBQyxFQUFFaUksQ0FBQyxDQUFHLENBQUMsRUFDeEIsSUFBSTNJLEtBQUssQ0FBRSxDQUFFVSxDQUFDLEVBQUVpSSxDQUFDLENBQUcsQ0FBQyxFQUNyQixJQUFJM0ksS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRWtFLENBQUMsRUFBRWdFLENBQUMsQ0FBRyxDQUFDLEVBQ3hCLElBQUkzSSxLQUFLLENBQUUsQ0FBRTJFLENBQUMsRUFBRWdFLENBQUMsQ0FBRyxDQUFDLEVBQ3JCLElBQUkzSSxLQUFLLENBQUUsQ0FBRTJJLENBQUMsQ0FBRyxDQUFDLENBQ2xCLENBQUUsQ0FBQztFQUNMckcsTUFBTSxHQUFHcUcsQ0FBQyxDQUFDSSxTQUFTLENBQUUvSCxJQUFJLElBQUlBLElBQUksS0FBS1AsQ0FBRSxDQUFDO0VBQzFDRCxNQUFNLENBQUNJLEVBQUUsQ0FBRTRILGtCQUFrQixDQUFFbEcsTUFBTSxFQUFFLENBQ3JDLElBQUl0QyxLQUFLLENBQUUsQ0FBRVMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVpSSxDQUFDLENBQUcsQ0FBQyxFQUN4QixJQUFJM0ksS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRWtFLENBQUMsRUFBRWdFLENBQUMsQ0FBRyxDQUFDLENBQ3hCLENBQUUsQ0FBQztFQUNMckcsTUFBTSxHQUFHcUcsQ0FBQyxDQUFDSSxTQUFTLENBQUUvSCxJQUFJLElBQUlBLElBQUksS0FBS04sQ0FBRSxDQUFDO0VBQzFDRixNQUFNLENBQUNJLEVBQUUsQ0FBRTRILGtCQUFrQixDQUFFbEcsTUFBTSxFQUFFLENBQ3JDLElBQUl0QyxLQUFLLENBQUUsQ0FBRVUsQ0FBQyxFQUFFaUksQ0FBQyxDQUFHLENBQUMsQ0FDckIsQ0FBRSxDQUFDO0VBQ0xyRyxNQUFNLEdBQUdxRyxDQUFDLENBQUNJLFNBQVMsQ0FBRS9ILElBQUksSUFBSUEsSUFBSSxDQUFDZ0ksT0FBTyxDQUFDN0csTUFBTSxLQUFLLENBQUUsQ0FBQztFQUN6RDNCLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFNEgsa0JBQWtCLENBQUVsRyxNQUFNLEVBQUUsQ0FDckMsSUFBSXRDLEtBQUssQ0FBRSxDQUFFVSxDQUFDLEVBQUVpSSxDQUFDLENBQUcsQ0FBQyxFQUNyQixJQUFJM0ksS0FBSyxDQUFFLENBQUUyRSxDQUFDLEVBQUVnRSxDQUFDLENBQUcsQ0FBQyxDQUNyQixDQUFFLENBQUM7QUFDUCxDQUFFLENBQUM7QUFFSHRJLEtBQUssQ0FBQ2MsSUFBSSxDQUFFLGVBQWUsRUFBRVgsTUFBTSxJQUFJO0VBQ3JDLE1BQU1DLENBQUMsR0FBRyxJQUFJaEIsSUFBSSxDQUFDLENBQUM7RUFDcEIsTUFBTWlCLENBQUMsR0FBRyxJQUFJakIsSUFBSSxDQUFDLENBQUM7RUFDcEIsTUFBTWtGLENBQUMsR0FBRyxJQUFJbEYsSUFBSSxDQUFDLENBQUM7RUFDcEIsTUFBTWtKLENBQUMsR0FBRyxJQUFJbEosSUFBSSxDQUFDLENBQUM7RUFDcEIsTUFBTW1KLENBQUMsR0FBRyxJQUFJbkosSUFBSSxDQUFDLENBQUM7O0VBRXBCO0VBQ0FnQixDQUFDLENBQUNRLFFBQVEsQ0FBRVAsQ0FBRSxDQUFDO0VBQ2ZELENBQUMsQ0FBQ1EsUUFBUSxDQUFFMEQsQ0FBRSxDQUFDO0VBQ2ZqRSxDQUFDLENBQUNPLFFBQVEsQ0FBRTBILENBQUUsQ0FBQztFQUNmaEUsQ0FBQyxDQUFDMUQsUUFBUSxDQUFFMEgsQ0FBRSxDQUFDO0VBQ2ZoRSxDQUFDLENBQUMxRCxRQUFRLENBQUUySCxDQUFFLENBQUM7O0VBRWY7RUFDQUMsTUFBTSxDQUFDckksTUFBTSxJQUFJQSxNQUFNLENBQUNzSSxNQUFNLENBQUUsTUFBTTtJQUFFckksQ0FBQyxDQUFDd0ksa0JBQWtCLENBQUMsQ0FBQztFQUFFLENBQUMsRUFBRSxtREFBb0QsQ0FBQztFQUN4SHpJLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFRixDQUFDLENBQUN1SSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM3RixNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFVSxDQUFDLEVBQUVpSSxDQUFDLENBQUcsQ0FBRSxDQUFDLEVBQUUsd0JBQXlCLENBQUM7RUFDN0ZuSSxNQUFNLENBQUNJLEVBQUUsQ0FBRStILENBQUMsQ0FBQ00sa0JBQWtCLENBQUMsQ0FBQyxDQUFDN0YsTUFBTSxDQUFFLElBQUlwRCxLQUFLLENBQUUsQ0FBRTJJLENBQUMsQ0FBRyxDQUFFLENBQUMsRUFBRSx3QkFBeUIsQ0FBQztFQUMxRm5JLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFZ0ksQ0FBQyxDQUFDSyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM3RixNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFNEksQ0FBQyxDQUFHLENBQUUsQ0FBQyxFQUFFLHdCQUF5QixDQUFDOztFQUUxRjtFQUNBLElBQUl0RyxNQUFNO0VBQ1ZBLE1BQU0sR0FBRzdCLENBQUMsQ0FBQ3lJLGFBQWEsQ0FBQyxDQUFDO0VBQzFCMUksTUFBTSxDQUFDSSxFQUFFLENBQUUwQixNQUFNLENBQUNILE1BQU0sS0FBSyxDQUFDLElBQUlxRyxrQkFBa0IsQ0FBRWxHLE1BQU0sRUFBRSxDQUM1RCxJQUFJdEMsS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRUMsQ0FBQyxFQUFFaUksQ0FBQyxDQUFHLENBQUMsRUFDeEIsSUFBSTNJLEtBQUssQ0FBRSxDQUFFUyxDQUFDLEVBQUVrRSxDQUFDLEVBQUVnRSxDQUFDLENBQUcsQ0FBQyxFQUN4QixJQUFJM0ksS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRWtFLENBQUMsRUFBRWlFLENBQUMsQ0FBRyxDQUFDLENBQ3hCLENBQUMsRUFBRSxtQkFBb0IsQ0FBQztFQUMxQnRHLE1BQU0sR0FBRzVCLENBQUMsQ0FBQ3dJLGFBQWEsQ0FBQyxDQUFDO0VBQzFCMUksTUFBTSxDQUFDSSxFQUFFLENBQUUwQixNQUFNLENBQUNILE1BQU0sS0FBSyxDQUFDLElBQUlHLE1BQU0sQ0FBRSxDQUFDLENBQUUsQ0FBQ2MsTUFBTSxDQUFFLElBQUlwRCxLQUFLLENBQUUsQ0FBRVUsQ0FBQyxFQUFFaUksQ0FBQyxDQUFHLENBQUUsQ0FBQyxFQUFFLG1CQUFvQixDQUFDO0VBQ3BHckcsTUFBTSxHQUFHcUMsQ0FBQyxDQUFDdUUsYUFBYSxDQUFDLENBQUM7RUFDMUIxSSxNQUFNLENBQUNJLEVBQUUsQ0FBRTBCLE1BQU0sQ0FBQ0gsTUFBTSxLQUFLLENBQUMsSUFBSXFHLGtCQUFrQixDQUFFbEcsTUFBTSxFQUFFLENBQzVELElBQUl0QyxLQUFLLENBQUUsQ0FBRTJFLENBQUMsRUFBRWdFLENBQUMsQ0FBRyxDQUFDLEVBQ3JCLElBQUkzSSxLQUFLLENBQUUsQ0FBRTJFLENBQUMsRUFBRWlFLENBQUMsQ0FBRyxDQUFDLENBQ3JCLENBQUMsRUFBRSxtQkFBb0IsQ0FBQztFQUMxQnRHLE1BQU0sR0FBR3FHLENBQUMsQ0FBQ08sYUFBYSxDQUFDLENBQUM7RUFDMUIxSSxNQUFNLENBQUNJLEVBQUUsQ0FBRTBCLE1BQU0sQ0FBQ0gsTUFBTSxLQUFLLENBQUMsSUFBSUcsTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDYyxNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFMkksQ0FBQyxDQUFHLENBQUUsQ0FBQyxFQUFFLG1CQUFvQixDQUFDO0VBQ2pHckcsTUFBTSxHQUFHc0csQ0FBQyxDQUFDTSxhQUFhLENBQUMsQ0FBQztFQUMxQjFJLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFMEIsTUFBTSxDQUFDSCxNQUFNLEtBQUssQ0FBQyxJQUFJRyxNQUFNLENBQUUsQ0FBQyxDQUFFLENBQUNjLE1BQU0sQ0FBRSxJQUFJcEQsS0FBSyxDQUFFLENBQUU0SSxDQUFDLENBQUcsQ0FBRSxDQUFDLEVBQUUsbUJBQW9CLENBQUM7O0VBRWpHO0VBQ0FDLE1BQU0sQ0FBQ3JJLE1BQU0sSUFBSUEsTUFBTSxDQUFDc0ksTUFBTSxDQUFFLE1BQU07SUFBRUYsQ0FBQyxDQUFDSyxrQkFBa0IsQ0FBRWpJLElBQUksSUFBSSxLQUFNLENBQUM7RUFBRSxDQUFDLEVBQUUsMEJBQTJCLENBQUM7RUFDOUc2SCxNQUFNLENBQUNySSxNQUFNLElBQUlBLE1BQU0sQ0FBQ3NJLE1BQU0sQ0FBRSxNQUFNO0lBQUVySSxDQUFDLENBQUN3SSxrQkFBa0IsQ0FBRWpJLElBQUksSUFBSSxJQUFLLENBQUM7RUFBRSxDQUFDLEVBQUUsb0JBQXFCLENBQUM7RUFDdkdSLE1BQU0sQ0FBQ0ksRUFBRSxDQUFFSCxDQUFDLENBQUN3SSxrQkFBa0IsQ0FBRWpJLElBQUksSUFBSUEsSUFBSSxLQUFLNEgsQ0FBRSxDQUFDLENBQUN4RixNQUFNLENBQUUsSUFBSXBELEtBQUssQ0FBRSxDQUFFUyxDQUFDLEVBQUVrRSxDQUFDLEVBQUVpRSxDQUFDLENBQUcsQ0FBRSxDQUFFLENBQUM7O0VBRTFGO0VBQ0F0RyxNQUFNLEdBQUc3QixDQUFDLENBQUN5SSxhQUFhLENBQUVsSSxJQUFJLElBQUksS0FBTSxDQUFDO0VBQ3pDUixNQUFNLENBQUNJLEVBQUUsQ0FBRTBCLE1BQU0sQ0FBQ0gsTUFBTSxLQUFLLENBQUUsQ0FBQztFQUNoQ0csTUFBTSxHQUFHN0IsQ0FBQyxDQUFDeUksYUFBYSxDQUFFbEksSUFBSSxJQUFJLElBQUssQ0FBQztFQUN4Q1IsTUFBTSxDQUFDSSxFQUFFLENBQUU0SCxrQkFBa0IsQ0FBRWxHLE1BQU0sRUFBRSxDQUNyQyxJQUFJdEMsS0FBSyxDQUFFLENBQUVTLENBQUMsQ0FBRyxDQUFDLEVBQ2xCLElBQUlULEtBQUssQ0FBRSxDQUFFUyxDQUFDLEVBQUVDLENBQUMsQ0FBRyxDQUFDLEVBQ3JCLElBQUlWLEtBQUssQ0FBRSxDQUFFUyxDQUFDLEVBQUVDLENBQUMsRUFBRWlJLENBQUMsQ0FBRyxDQUFDLEVBQ3hCLElBQUkzSSxLQUFLLENBQUUsQ0FBRVMsQ0FBQyxFQUFFa0UsQ0FBQyxDQUFHLENBQUMsRUFDckIsSUFBSTNFLEtBQUssQ0FBRSxDQUFFUyxDQUFDLEVBQUVrRSxDQUFDLEVBQUVnRSxDQUFDLENBQUcsQ0FBQyxFQUN4QixJQUFJM0ksS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRWtFLENBQUMsRUFBRWlFLENBQUMsQ0FBRyxDQUFDLENBQ3hCLENBQUUsQ0FBQzs7RUFFTDtFQUNBdEcsTUFBTSxHQUFHN0IsQ0FBQyxDQUFDMEksZUFBZSxDQUFFUixDQUFFLENBQUM7RUFDL0JuSSxNQUFNLENBQUNJLEVBQUUsQ0FBRTRILGtCQUFrQixDQUFFbEcsTUFBTSxFQUFFLENBQ3JDLElBQUl0QyxLQUFLLENBQUUsQ0FBRVMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVpSSxDQUFDLENBQUcsQ0FBQyxFQUN4QixJQUFJM0ksS0FBSyxDQUFFLENBQUVTLENBQUMsRUFBRWtFLENBQUMsRUFBRWdFLENBQUMsQ0FBRyxDQUFDLENBQ3hCLENBQUUsQ0FBQztBQUNQLENBQUUsQ0FBQztBQUVIdEksS0FBSyxDQUFDYyxJQUFJLENBQUUscUJBQXFCLEVBQUVYLE1BQU0sSUFBSTtFQUMzQyxNQUFNNEksSUFBSSxHQUFHLElBQUk1SixJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0lBQUU2SixNQUFNLEVBQUUsS0FBSztJQUFFQyxTQUFTLEVBQUU7RUFBRSxDQUFFLENBQUM7RUFFckUsTUFBTUMsU0FBUyxHQUFHLENBQ2hCO0lBQUVDLEVBQUUsRUFBRSxFQUFFO0lBQUVDLEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRTtFQUFFLENBQUMsRUFDL0I7SUFBRUgsRUFBRSxFQUFFLENBQUM7SUFBRUMsRUFBRSxFQUFFLEVBQUU7SUFBRUMsRUFBRSxFQUFFLENBQUM7SUFBRUMsRUFBRSxFQUFFO0VBQUUsQ0FBQyxFQUMvQjtJQUFFSCxFQUFFLEVBQUUsQ0FBQztJQUFFQyxFQUFFLEVBQUUsQ0FBQztJQUFFQyxFQUFFLEVBQUUsRUFBRTtJQUFFQyxFQUFFLEVBQUU7RUFBRSxDQUFDLEVBQy9CO0lBQUVILEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRTtFQUFHLENBQUMsRUFDL0I7SUFBRUgsRUFBRSxFQUFFLEVBQUU7SUFBRUMsRUFBRSxFQUFFLEVBQUU7SUFBRUMsRUFBRSxFQUFFLENBQUM7SUFBRUMsRUFBRSxFQUFFO0VBQUUsQ0FBQyxFQUNoQztJQUFFSCxFQUFFLEVBQUUsRUFBRTtJQUFFQyxFQUFFLEVBQUUsRUFBRTtJQUFFQyxFQUFFLEVBQUUsQ0FBQztJQUFFQyxFQUFFLEVBQUU7RUFBRSxDQUFDLEVBQ2hDO0lBQUVILEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRSxFQUFFO0lBQUVDLEVBQUUsRUFBRTtFQUFHLENBQUMsRUFDaEM7SUFBRUgsRUFBRSxFQUFFLENBQUM7SUFBRUMsRUFBRSxFQUFFLENBQUM7SUFBRUMsRUFBRSxFQUFFLEVBQUU7SUFBRUMsRUFBRSxFQUFFO0VBQUcsQ0FBQyxFQUNoQztJQUFFSCxFQUFFLEVBQUUsRUFBRTtJQUFFQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0lBQUVDLEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRTtFQUFFLENBQUMsRUFDakM7SUFBRUgsRUFBRSxFQUFFLENBQUMsRUFBRTtJQUFFQyxFQUFFLEVBQUUsRUFBRTtJQUFFQyxFQUFFLEVBQUUsQ0FBQztJQUFFQyxFQUFFLEVBQUU7RUFBRSxDQUFDLEVBQ2pDO0lBQUVILEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRSxDQUFDO0lBQUVDLEVBQUUsRUFBRSxFQUFFO0lBQUVDLEVBQUUsRUFBRSxDQUFDO0VBQUcsQ0FBQyxFQUNqQztJQUFFSCxFQUFFLEVBQUUsQ0FBQztJQUFFQyxFQUFFLEVBQUUsQ0FBQztJQUFFQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0lBQUVDLEVBQUUsRUFBRTtFQUFHLENBQUMsRUFDakM7SUFBRUgsRUFBRSxFQUFFLEVBQUU7SUFBRUMsRUFBRSxFQUFFLENBQUM7SUFBRUMsRUFBRSxFQUFFLENBQUM7SUFBRUMsRUFBRSxFQUFFO0VBQUcsQ0FBQyxFQUNoQztJQUFFSCxFQUFFLEVBQUUsQ0FBQztJQUFFQyxFQUFFLEVBQUUsRUFBRTtJQUFFQyxFQUFFLEVBQUUsRUFBRTtJ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