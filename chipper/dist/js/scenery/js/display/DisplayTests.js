// Copyright 2017-2023, University of Colorado Boulder

/**
 * Display tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import Circle from '../nodes/Circle.js';
import DOM from '../nodes/DOM.js';
import Image from '../nodes/Image.js';
import Line from '../nodes/Line.js';
import Node from '../nodes/Node.js';
import Path from '../nodes/Path.js';
import Rectangle from '../nodes/Rectangle.js';
import Text from '../nodes/Text.js';
import CanvasContextWrapper from '../util/CanvasContextWrapper.js';
import Display from './Display.js';
import CircleCanvasDrawable from './drawables/CircleCanvasDrawable.js';
import CircleDOMDrawable from './drawables/CircleDOMDrawable.js';
import CircleSVGDrawable from './drawables/CircleSVGDrawable.js';
import DOMDrawable from './drawables/DOMDrawable.js';
import ImageCanvasDrawable from './drawables/ImageCanvasDrawable.js';
import ImageDOMDrawable from './drawables/ImageDOMDrawable.js';
import ImageSVGDrawable from './drawables/ImageSVGDrawable.js';
import LineCanvasDrawable from './drawables/LineCanvasDrawable.js';
import LineSVGDrawable from './drawables/LineSVGDrawable.js';
import PathCanvasDrawable from './drawables/PathCanvasDrawable.js';
import PathSVGDrawable from './drawables/PathSVGDrawable.js';
import RectangleCanvasDrawable from './drawables/RectangleCanvasDrawable.js';
import RectangleDOMDrawable from './drawables/RectangleDOMDrawable.js';
import RectangleSVGDrawable from './drawables/RectangleSVGDrawable.js';
import TextCanvasDrawable from './drawables/TextCanvasDrawable.js';
import TextDOMDrawable from './drawables/TextDOMDrawable.js';
import TextSVGDrawable from './drawables/TextSVGDrawable.js';
import Instance from './Instance.js';
import Renderer from './Renderer.js';
QUnit.module('Display');
QUnit.test('Drawables (Rectangle)', assert => {
  // The stubDisplay It's a hack that implements the subset of the Display API needed where called. It will definitely
  // be removed. The reason it stores the frame ID is because much of Scenery 0.2 uses ID comparison to determine
  // dirty state. That allows us to not have to set dirty states back to "clean" afterwards.  See #296
  const stubDisplay = {
    _frameId: 5,
    isWebGLAllowed: () => true
  };
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  const wrapper = new CanvasContextWrapper(canvas, context);
  const r1 = new Rectangle(5, 10, 100, 50, 0, 0, {
    fill: 'red',
    stroke: 'blue',
    lineWidth: 5
  });
  const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
  const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
  const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
  const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
  assert.ok(r1._drawables.length === 3, 'After init, should have drawable refs');
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.setRect(0, 0, 100, 100, 5, 5);
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.stroke = null;
  r1.fill = null;
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1dd.dispose();
  r1ds.dispose();
  r1dc.dispose();
  assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
  assert.ok(RectangleDOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(RectangleSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(RectangleCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Circle)', assert => {
  const stubDisplay = {
    _frameId: 5,
    isWebGLAllowed: () => true
  };
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  const wrapper = new CanvasContextWrapper(canvas, context);
  const r1 = new Circle(50, {
    fill: 'red',
    stroke: 'blue',
    lineWidth: 5
  });
  const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
  const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
  const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
  const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
  assert.ok(r1._drawables.length === 3, 'After init, should have drawable refs');
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.setRadius(100);
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.stroke = null;
  r1.fill = null;
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1dd.dispose();
  r1ds.dispose();
  r1dc.dispose();
  assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
  assert.ok(CircleDOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(CircleSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(CircleCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Line)', assert => {
  const stubDisplay = {
    _frameId: 5,
    isWebGLAllowed: () => true
  };
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  const wrapper = new CanvasContextWrapper(canvas, context);
  const r1 = new Line(0, 1, 2, 3, {
    fill: 'red',
    stroke: 'blue',
    lineWidth: 5
  });
  const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
  const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
  const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
  assert.ok(r1._drawables.length === 2, 'After init, should have drawable refs');
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.x1 = 50;
  r1.x2 = 100;
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.stroke = null;
  r1.fill = null;
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1ds.dispose();
  r1dc.dispose();
  assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
  assert.ok(LineSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(LineCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Path)', assert => {
  const stubDisplay = {
    _frameId: 5,
    isWebGLAllowed: () => true
  };
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  const wrapper = new CanvasContextWrapper(canvas, context);
  const r1 = new Path(Shape.regularPolygon(5, 10), {
    fill: 'red',
    stroke: 'blue',
    lineWidth: 5
  });
  const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
  const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
  const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
  assert.ok(r1._drawables.length === 2, 'After init, should have drawable refs');
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.shape = Shape.regularPolygon(6, 20);
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.stroke = null;
  r1.fill = null;
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.shape = null;
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1ds.dispose();
  r1dc.dispose();
  assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
  assert.ok(PathSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(PathCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Text)', assert => {
  const stubDisplay = {
    _frameId: 5,
    isWebGLAllowed: () => true
  };
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  const wrapper = new CanvasContextWrapper(canvas, context);
  const r1 = new Text('Wow!', {
    fill: 'red',
    stroke: 'blue',
    lineWidth: 5
  });
  const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
  const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
  const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
  const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
  assert.ok(r1._drawables.length === 3, 'After init, should have drawable refs');
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.string = 'b';
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.font = '20px sans-serif';
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1.stroke = null;
  r1.fill = null;
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1dd.dispose();
  r1ds.dispose();
  r1dc.dispose();
  assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
  assert.ok(TextDOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(TextSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(TextCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Image)', assert => {
  const stubDisplay = {
    _frameId: 5,
    isWebGLAllowed: () => true
  };
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  const wrapper = new CanvasContextWrapper(canvas, context);

  // 1x1 black PNG
  const r1 = new Image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==');
  const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
  const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
  const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
  const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
  assert.ok(r1._drawables.length === 3, 'After init, should have drawable refs');
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);

  // 1x1 black JPG
  r1.image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8qqKKKAP/2Q==';
  r1dd.updateDOM();
  r1ds.updateSVG();
  r1dc.paintCanvas(wrapper, r1);
  r1dd.dispose();
  r1ds.dispose();
  r1dc.dispose();
  assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
  assert.ok(ImageDOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(ImageSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
  assert.ok(ImageCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (DOM)', assert => {
  const stubDisplay = {
    _frameId: 5,
    isWebGLAllowed: () => true
  };
  const r1 = new DOM(document.createElement('canvas'));
  const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
  const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
  assert.ok(r1._drawables.length === 1, 'After init, should have drawable refs');
  r1dd.updateDOM();
  r1dd.dispose();
  assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
  assert.ok(DOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Renderer order bitmask', assert => {
  // init test
  let mask = Renderer.createOrderBitmask(Renderer.bitmaskCanvas, Renderer.bitmaskSVG, Renderer.bitmaskDOM, Renderer.bitmaskWebGL);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 3), Renderer.bitmaskWebGL);

  // empty test
  mask = Renderer.createOrderBitmask();
  assert.equal(Renderer.bitmaskOrder(mask, 0), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 1), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);

  // pushing single renderer should work
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 1), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);

  // pushing again should have no change
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 1), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);

  // pushing Canvas will put it first, SVG second
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);

  // pushing SVG will reverse the two
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
  assert.equal(Renderer.bitmaskOrder(mask, 4), 0);

  // pushing DOM shifts the other two down
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);

  // pushing DOM results in no change
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);

  // pushing Canvas moves it to the front
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);

  // pushing DOM again swaps it with the Canvas
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskSVG);
  assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
  // console.log( mask.toString( 16 ) );
  // pushing WebGL shifts everything
  mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskWebGL);
  assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskWebGL);
  assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskDOM);
  assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskCanvas);
  assert.equal(Renderer.bitmaskOrder(mask, 3), Renderer.bitmaskSVG);
  // console.log( mask.toString( 16 ) );
});

QUnit.test('Empty Display usage', assert => {
  const n = new Node();
  const d = new Display(n);
  d.updateDisplay();
  d.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  d.dispose();
});
QUnit.test('Simple Display usage', assert => {
  const r = new Rectangle(0, 0, 50, 50, {
    fill: 'red'
  });
  const d = new Display(r);
  d.updateDisplay();
  r.rectWidth = 100;
  d.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  d.dispose();
});
QUnit.test('Stitch patterns #1', assert => {
  const n = new Node();
  const d = new Display(n);
  d.updateDisplay();
  n.addChild(new Rectangle(0, 0, 50, 50, {
    fill: 'red'
  }));
  d.updateDisplay();
  n.addChild(new Rectangle(0, 0, 50, 50, {
    fill: 'red'
  }));
  d.updateDisplay();
  n.addChild(new Rectangle(0, 0, 50, 50, {
    fill: 'red'
  }));
  d.updateDisplay();
  n.children[1].visible = false;
  d.updateDisplay();
  n.children[1].visible = true;
  d.updateDisplay();
  n.removeChild(n.children[0]);
  d.updateDisplay();
  n.removeChild(n.children[1]);
  d.updateDisplay();
  n.removeChild(n.children[0]);
  d.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  d.dispose();
});
QUnit.test('Invisible append', assert => {
  const scene = new Node();
  const display = new Display(scene);
  display.updateDisplay();
  const a = new Rectangle(0, 0, 100, 50, {
    fill: 'red'
  });
  scene.addChild(a);
  display.updateDisplay();
  const b = new Rectangle(0, 0, 100, 50, {
    fill: 'red',
    visible: false
  });
  scene.addChild(b);
  display.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  display.dispose();
});
QUnit.test('Stitching problem A (GitHub Issue #339)', assert => {
  const scene = new Node();
  const display = new Display(scene);
  const a = new Rectangle(0, 0, 100, 50, {
    fill: 'red'
  });
  const b = new Rectangle(0, 0, 50, 50, {
    fill: 'blue'
  });
  const c = new DOM(document.createElement('div'));
  const d = new Rectangle(100, 0, 100, 50, {
    fill: 'red'
  });
  const e = new Rectangle(100, 0, 50, 50, {
    fill: 'blue'
  });
  const f = new Rectangle(0, 50, 100, 50, {
    fill: 'green'
  });
  const g = new DOM(document.createElement('div'));
  scene.addChild(a);
  scene.addChild(f);
  scene.addChild(b);
  scene.addChild(c);
  scene.addChild(d);
  scene.addChild(e);
  display.updateDisplay();
  scene.removeChild(f);
  scene.insertChild(4, g);
  display.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  display.dispose();
});
QUnit.test('SVG group disposal issue (GitHub Issue #354) A', assert => {
  const scene = new Node();
  const display = new Display(scene);
  const node = new Node({
    renderer: 'svg',
    cssTransform: true
  });
  const rect = new Rectangle(0, 0, 100, 50, {
    fill: 'red'
  });
  scene.addChild(node);
  node.addChild(rect);
  display.updateDisplay();
  scene.removeChild(node);
  display.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  display.dispose();
});
QUnit.test('SVG group disposal issue (GitHub Issue #354) B', assert => {
  const scene = new Node();
  const display = new Display(scene);
  const node = new Node();
  const rect = new Rectangle(0, 0, 100, 50, {
    fill: 'red',
    renderer: 'svg',
    cssTransform: true
  });
  scene.addChild(node);
  node.addChild(rect);
  display.updateDisplay();
  scene.removeChild(node);
  display.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  display.dispose();
});
QUnit.test('Empty path display test', assert => {
  const scene = new Node();
  const display = new Display(scene);
  scene.addChild(new Path(null));
  display.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  display.dispose();
});
QUnit.test('Double remove related to #392', assert => {
  const scene = new Node();
  const display = new Display(scene);
  display.updateDisplay();
  const n1 = new Node();
  const n2 = new Node();
  scene.addChild(n1);
  n1.addChild(n2);
  scene.addChild(n2); // so the tree has a reference to the Node that we can trigger the failure on

  display.updateDisplay();
  scene.removeChild(n1);
  n1.removeChild(n2);
  display.updateDisplay();
  assert.ok(true, 'so we have at least 1 test in this set');
  display.dispose();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkNpcmNsZSIsIkRPTSIsIkltYWdlIiwiTGluZSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkNhbnZhc0NvbnRleHRXcmFwcGVyIiwiRGlzcGxheSIsIkNpcmNsZUNhbnZhc0RyYXdhYmxlIiwiQ2lyY2xlRE9NRHJhd2FibGUiLCJDaXJjbGVTVkdEcmF3YWJsZSIsIkRPTURyYXdhYmxlIiwiSW1hZ2VDYW52YXNEcmF3YWJsZSIsIkltYWdlRE9NRHJhd2FibGUiLCJJbWFnZVNWR0RyYXdhYmxlIiwiTGluZUNhbnZhc0RyYXdhYmxlIiwiTGluZVNWR0RyYXdhYmxlIiwiUGF0aENhbnZhc0RyYXdhYmxlIiwiUGF0aFNWR0RyYXdhYmxlIiwiUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUiLCJSZWN0YW5nbGVET01EcmF3YWJsZSIsIlJlY3RhbmdsZVNWR0RyYXdhYmxlIiwiVGV4dENhbnZhc0RyYXdhYmxlIiwiVGV4dERPTURyYXdhYmxlIiwiVGV4dFNWR0RyYXdhYmxlIiwiSW5zdGFuY2UiLCJSZW5kZXJlciIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsInN0dWJEaXNwbGF5IiwiX2ZyYW1lSWQiLCJpc1dlYkdMQWxsb3dlZCIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIndpZHRoIiwiaGVpZ2h0IiwiY29udGV4dCIsImdldENvbnRleHQiLCJ3cmFwcGVyIiwicjEiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwicjFpIiwiZ2V0VW5pcXVlVHJhaWwiLCJyMWRkIiwiY3JlYXRlRE9NRHJhd2FibGUiLCJiaXRtYXNrRE9NIiwicjFkcyIsImNyZWF0ZVNWR0RyYXdhYmxlIiwiYml0bWFza1NWRyIsInIxZGMiLCJjcmVhdGVDYW52YXNEcmF3YWJsZSIsImJpdG1hc2tDYW52YXMiLCJvayIsIl9kcmF3YWJsZXMiLCJsZW5ndGgiLCJ1cGRhdGVET00iLCJ1cGRhdGVTVkciLCJwYWludENhbnZhcyIsInNldFJlY3QiLCJkaXNwb3NlIiwicG9vbCIsInNldFJhZGl1cyIsIngxIiwieDIiLCJyZWd1bGFyUG9seWdvbiIsInNoYXBlIiwic3RyaW5nIiwiZm9udCIsImltYWdlIiwibWFzayIsImNyZWF0ZU9yZGVyQml0bWFzayIsImJpdG1hc2tXZWJHTCIsImVxdWFsIiwiYml0bWFza09yZGVyIiwicHVzaE9yZGVyQml0bWFzayIsIm4iLCJkIiwidXBkYXRlRGlzcGxheSIsInIiLCJyZWN0V2lkdGgiLCJhZGRDaGlsZCIsImNoaWxkcmVuIiwidmlzaWJsZSIsInJlbW92ZUNoaWxkIiwic2NlbmUiLCJkaXNwbGF5IiwiYSIsImIiLCJjIiwiZSIsImYiLCJnIiwiaW5zZXJ0Q2hpbGQiLCJub2RlIiwicmVuZGVyZXIiLCJjc3NUcmFuc2Zvcm0iLCJyZWN0IiwibjEiLCJuMiJdLCJzb3VyY2VzIjpbIkRpc3BsYXlUZXN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5IHRlc3RzXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2lyY2xlIGZyb20gJy4uL25vZGVzL0NpcmNsZS5qcyc7XHJcbmltcG9ydCBET00gZnJvbSAnLi4vbm9kZXMvRE9NLmpzJztcclxuaW1wb3J0IEltYWdlIGZyb20gJy4uL25vZGVzL0ltYWdlLmpzJztcclxuaW1wb3J0IExpbmUgZnJvbSAnLi4vbm9kZXMvTGluZS5qcyc7XHJcbmltcG9ydCBOb2RlIGZyb20gJy4uL25vZGVzL05vZGUuanMnO1xyXG5pbXBvcnQgUGF0aCBmcm9tICcuLi9ub2Rlcy9QYXRoLmpzJztcclxuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi9ub2Rlcy9SZWN0YW5nbGUuanMnO1xyXG5pbXBvcnQgVGV4dCBmcm9tICcuLi9ub2Rlcy9UZXh0LmpzJztcclxuaW1wb3J0IENhbnZhc0NvbnRleHRXcmFwcGVyIGZyb20gJy4uL3V0aWwvQ2FudmFzQ29udGV4dFdyYXBwZXIuanMnO1xyXG5pbXBvcnQgRGlzcGxheSBmcm9tICcuL0Rpc3BsYXkuanMnO1xyXG5pbXBvcnQgQ2lyY2xlQ2FudmFzRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvQ2lyY2xlQ2FudmFzRHJhd2FibGUuanMnO1xyXG5pbXBvcnQgQ2lyY2xlRE9NRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvQ2lyY2xlRE9NRHJhd2FibGUuanMnO1xyXG5pbXBvcnQgQ2lyY2xlU1ZHRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvQ2lyY2xlU1ZHRHJhd2FibGUuanMnO1xyXG5pbXBvcnQgRE9NRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvRE9NRHJhd2FibGUuanMnO1xyXG5pbXBvcnQgSW1hZ2VDYW52YXNEcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9JbWFnZUNhbnZhc0RyYXdhYmxlLmpzJztcclxuaW1wb3J0IEltYWdlRE9NRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvSW1hZ2VET01EcmF3YWJsZS5qcyc7XHJcbmltcG9ydCBJbWFnZVNWR0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL0ltYWdlU1ZHRHJhd2FibGUuanMnO1xyXG5pbXBvcnQgTGluZUNhbnZhc0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL0xpbmVDYW52YXNEcmF3YWJsZS5qcyc7XHJcbmltcG9ydCBMaW5lU1ZHRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvTGluZVNWR0RyYXdhYmxlLmpzJztcclxuaW1wb3J0IFBhdGhDYW52YXNEcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9QYXRoQ2FudmFzRHJhd2FibGUuanMnO1xyXG5pbXBvcnQgUGF0aFNWR0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL1BhdGhTVkdEcmF3YWJsZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5nbGVDYW52YXNEcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9SZWN0YW5nbGVDYW52YXNEcmF3YWJsZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5nbGVET01EcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9SZWN0YW5nbGVET01EcmF3YWJsZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5nbGVTVkdEcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9SZWN0YW5nbGVTVkdEcmF3YWJsZS5qcyc7XHJcbmltcG9ydCBUZXh0Q2FudmFzRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvVGV4dENhbnZhc0RyYXdhYmxlLmpzJztcclxuaW1wb3J0IFRleHRET01EcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9UZXh0RE9NRHJhd2FibGUuanMnO1xyXG5pbXBvcnQgVGV4dFNWR0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL1RleHRTVkdEcmF3YWJsZS5qcyc7XHJcbmltcG9ydCBJbnN0YW5jZSBmcm9tICcuL0luc3RhbmNlLmpzJztcclxuaW1wb3J0IFJlbmRlcmVyIGZyb20gJy4vUmVuZGVyZXIuanMnO1xyXG5cclxuUVVuaXQubW9kdWxlKCAnRGlzcGxheScgKTtcclxuXHJcblFVbml0LnRlc3QoICdEcmF3YWJsZXMgKFJlY3RhbmdsZSknLCBhc3NlcnQgPT4ge1xyXG5cclxuICAvLyBUaGUgc3R1YkRpc3BsYXkgSXQncyBhIGhhY2sgdGhhdCBpbXBsZW1lbnRzIHRoZSBzdWJzZXQgb2YgdGhlIERpc3BsYXkgQVBJIG5lZWRlZCB3aGVyZSBjYWxsZWQuIEl0IHdpbGwgZGVmaW5pdGVseVxyXG4gIC8vIGJlIHJlbW92ZWQuIFRoZSByZWFzb24gaXQgc3RvcmVzIHRoZSBmcmFtZSBJRCBpcyBiZWNhdXNlIG11Y2ggb2YgU2NlbmVyeSAwLjIgdXNlcyBJRCBjb21wYXJpc29uIHRvIGRldGVybWluZVxyXG4gIC8vIGRpcnR5IHN0YXRlLiBUaGF0IGFsbG93cyB1cyB0byBub3QgaGF2ZSB0byBzZXQgZGlydHkgc3RhdGVzIGJhY2sgdG8gXCJjbGVhblwiIGFmdGVyd2FyZHMuICBTZWUgIzI5NlxyXG4gIGNvbnN0IHN0dWJEaXNwbGF5ID0geyBfZnJhbWVJZDogNSwgaXNXZWJHTEFsbG93ZWQ6ICgpID0+IHRydWUgfTtcclxuXHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICBjYW52YXMud2lkdGggPSA2NDtcclxuICBjYW52YXMuaGVpZ2h0ID0gNDg7XHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgY29uc3Qgd3JhcHBlciA9IG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggY2FudmFzLCBjb250ZXh0ICk7XHJcblxyXG5cclxuICBjb25zdCByMSA9IG5ldyBSZWN0YW5nbGUoIDUsIDEwLCAxMDAsIDUwLCAwLCAwLCB7IGZpbGw6ICdyZWQnLCBzdHJva2U6ICdibHVlJywgbGluZVdpZHRoOiA1IH0gKTtcclxuICBjb25zdCByMWkgPSBuZXcgSW5zdGFuY2UoIHN0dWJEaXNwbGF5LCByMS5nZXRVbmlxdWVUcmFpbCgpICk7XHJcbiAgY29uc3QgcjFkZCA9IHIxLmNyZWF0ZURPTURyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrRE9NLCByMWkgKTtcclxuICBjb25zdCByMWRzID0gcjEuY3JlYXRlU1ZHRHJhd2FibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcsIHIxaSApO1xyXG4gIGNvbnN0IHIxZGMgPSByMS5jcmVhdGVDYW52YXNEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcywgcjFpICk7XHJcblxyXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDMsICdBZnRlciBpbml0LCBzaG91bGQgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xyXG5cclxuICByMWRkLnVwZGF0ZURPTSgpO1xyXG4gIHIxZHMudXBkYXRlU1ZHKCk7XHJcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcclxuXHJcbiAgcjEuc2V0UmVjdCggMCwgMCwgMTAwLCAxMDAsIDUsIDUgKTtcclxuXHJcbiAgcjFkZC51cGRhdGVET00oKTtcclxuICByMWRzLnVwZGF0ZVNWRygpO1xyXG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XHJcblxyXG4gIHIxLnN0cm9rZSA9IG51bGw7XHJcbiAgcjEuZmlsbCA9IG51bGw7XHJcblxyXG4gIHIxZGQudXBkYXRlRE9NKCk7XHJcbiAgcjFkcy51cGRhdGVTVkcoKTtcclxuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xyXG5cclxuICByMWRkLmRpc3Bvc2UoKTtcclxuICByMWRzLmRpc3Bvc2UoKTtcclxuICByMWRjLmRpc3Bvc2UoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMCwgJ0FmdGVyIGRpc3Bvc2UsIHNob3VsZCBub3QgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xyXG5cclxuICBhc3NlcnQub2soIFJlY3RhbmdsZURPTURyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbiAgYXNzZXJ0Lm9rKCBSZWN0YW5nbGVTVkdEcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xyXG4gIGFzc2VydC5vayggUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUucG9vbC5sZW5ndGggPiAwLCAnRGlzcG9zZWQgZHJhd2FibGUgcmV0dXJuZWQgdG8gcG9vbCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0RyYXdhYmxlcyAoQ2lyY2xlKScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc3R1YkRpc3BsYXkgPSB7IF9mcmFtZUlkOiA1LCBpc1dlYkdMQWxsb3dlZDogKCkgPT4gdHJ1ZSB9O1xyXG5cclxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIGNhbnZhcy53aWR0aCA9IDY0O1xyXG4gIGNhbnZhcy5oZWlnaHQgPSA0ODtcclxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICBjb25zdCB3cmFwcGVyID0gbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBjYW52YXMsIGNvbnRleHQgKTtcclxuXHJcblxyXG4gIGNvbnN0IHIxID0gbmV3IENpcmNsZSggNTAsIHsgZmlsbDogJ3JlZCcsIHN0cm9rZTogJ2JsdWUnLCBsaW5lV2lkdGg6IDUgfSApO1xyXG4gIGNvbnN0IHIxaSA9IG5ldyBJbnN0YW5jZSggc3R1YkRpc3BsYXksIHIxLmdldFVuaXF1ZVRyYWlsKCkgKTtcclxuICBjb25zdCByMWRkID0gcjEuY3JlYXRlRE9NRHJhd2FibGUoIFJlbmRlcmVyLmJpdG1hc2tET00sIHIxaSApO1xyXG4gIGNvbnN0IHIxZHMgPSByMS5jcmVhdGVTVkdEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza1NWRywgcjFpICk7XHJcbiAgY29uc3QgcjFkYyA9IHIxLmNyZWF0ZUNhbnZhc0RyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzLCByMWkgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMywgJ0FmdGVyIGluaXQsIHNob3VsZCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XHJcblxyXG4gIHIxZGQudXBkYXRlRE9NKCk7XHJcbiAgcjFkcy51cGRhdGVTVkcoKTtcclxuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xyXG5cclxuICByMS5zZXRSYWRpdXMoIDEwMCApO1xyXG5cclxuICByMWRkLnVwZGF0ZURPTSgpO1xyXG4gIHIxZHMudXBkYXRlU1ZHKCk7XHJcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcclxuXHJcbiAgcjEuc3Ryb2tlID0gbnVsbDtcclxuICByMS5maWxsID0gbnVsbDtcclxuXHJcbiAgcjFkZC51cGRhdGVET00oKTtcclxuICByMWRzLnVwZGF0ZVNWRygpO1xyXG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XHJcblxyXG4gIHIxZGQuZGlzcG9zZSgpO1xyXG4gIHIxZHMuZGlzcG9zZSgpO1xyXG4gIHIxZGMuZGlzcG9zZSgpO1xyXG5cclxuICBhc3NlcnQub2soIHIxLl9kcmF3YWJsZXMubGVuZ3RoID09PSAwLCAnQWZ0ZXIgZGlzcG9zZSwgc2hvdWxkIG5vdCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XHJcblxyXG4gIGFzc2VydC5vayggQ2lyY2xlRE9NRHJhd2FibGUucG9vbC5sZW5ndGggPiAwLCAnRGlzcG9zZWQgZHJhd2FibGUgcmV0dXJuZWQgdG8gcG9vbCcgKTtcclxuICBhc3NlcnQub2soIENpcmNsZVNWR0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbiAgYXNzZXJ0Lm9rKCBDaXJjbGVDYW52YXNEcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnRHJhd2FibGVzIChMaW5lKScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc3R1YkRpc3BsYXkgPSB7IF9mcmFtZUlkOiA1LCBpc1dlYkdMQWxsb3dlZDogKCkgPT4gdHJ1ZSB9O1xyXG5cclxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gIGNhbnZhcy53aWR0aCA9IDY0O1xyXG4gIGNhbnZhcy5oZWlnaHQgPSA0ODtcclxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuICBjb25zdCB3cmFwcGVyID0gbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBjYW52YXMsIGNvbnRleHQgKTtcclxuXHJcbiAgY29uc3QgcjEgPSBuZXcgTGluZSggMCwgMSwgMiwgMywgeyBmaWxsOiAncmVkJywgc3Ryb2tlOiAnYmx1ZScsIGxpbmVXaWR0aDogNSB9ICk7XHJcbiAgY29uc3QgcjFpID0gbmV3IEluc3RhbmNlKCBzdHViRGlzcGxheSwgcjEuZ2V0VW5pcXVlVHJhaWwoKSApO1xyXG4gIGNvbnN0IHIxZHMgPSByMS5jcmVhdGVTVkdEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza1NWRywgcjFpICk7XHJcbiAgY29uc3QgcjFkYyA9IHIxLmNyZWF0ZUNhbnZhc0RyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzLCByMWkgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMiwgJ0FmdGVyIGluaXQsIHNob3VsZCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XHJcblxyXG4gIHIxZHMudXBkYXRlU1ZHKCk7XHJcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcclxuXHJcbiAgcjEueDEgPSA1MDtcclxuICByMS54MiA9IDEwMDtcclxuXHJcbiAgcjFkcy51cGRhdGVTVkcoKTtcclxuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xyXG5cclxuICByMS5zdHJva2UgPSBudWxsO1xyXG4gIHIxLmZpbGwgPSBudWxsO1xyXG5cclxuICByMWRzLnVwZGF0ZVNWRygpO1xyXG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XHJcblxyXG4gIHIxZHMuZGlzcG9zZSgpO1xyXG4gIHIxZGMuZGlzcG9zZSgpO1xyXG5cclxuICBhc3NlcnQub2soIHIxLl9kcmF3YWJsZXMubGVuZ3RoID09PSAwLCAnQWZ0ZXIgZGlzcG9zZSwgc2hvdWxkIG5vdCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XHJcblxyXG4gIGFzc2VydC5vayggTGluZVNWR0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbiAgYXNzZXJ0Lm9rKCBMaW5lQ2FudmFzRHJhd2FibGUucG9vbC5sZW5ndGggPiAwLCAnRGlzcG9zZWQgZHJhd2FibGUgcmV0dXJuZWQgdG8gcG9vbCcgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0RyYXdhYmxlcyAoUGF0aCknLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHN0dWJEaXNwbGF5ID0geyBfZnJhbWVJZDogNSwgaXNXZWJHTEFsbG93ZWQ6ICgpID0+IHRydWUgfTtcclxuXHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICBjYW52YXMud2lkdGggPSA2NDtcclxuICBjYW52YXMuaGVpZ2h0ID0gNDg7XHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgY29uc3Qgd3JhcHBlciA9IG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggY2FudmFzLCBjb250ZXh0ICk7XHJcblxyXG5cclxuICBjb25zdCByMSA9IG5ldyBQYXRoKCBTaGFwZS5yZWd1bGFyUG9seWdvbiggNSwgMTAgKSwgeyBmaWxsOiAncmVkJywgc3Ryb2tlOiAnYmx1ZScsIGxpbmVXaWR0aDogNSB9ICk7XHJcbiAgY29uc3QgcjFpID0gbmV3IEluc3RhbmNlKCBzdHViRGlzcGxheSwgcjEuZ2V0VW5pcXVlVHJhaWwoKSApO1xyXG4gIGNvbnN0IHIxZHMgPSByMS5jcmVhdGVTVkdEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza1NWRywgcjFpICk7XHJcbiAgY29uc3QgcjFkYyA9IHIxLmNyZWF0ZUNhbnZhc0RyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzLCByMWkgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMiwgJ0FmdGVyIGluaXQsIHNob3VsZCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XHJcblxyXG4gIHIxZHMudXBkYXRlU1ZHKCk7XHJcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcclxuXHJcbiAgcjEuc2hhcGUgPSBTaGFwZS5yZWd1bGFyUG9seWdvbiggNiwgMjAgKTtcclxuXHJcbiAgcjFkcy51cGRhdGVTVkcoKTtcclxuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xyXG5cclxuICByMS5zdHJva2UgPSBudWxsO1xyXG4gIHIxLmZpbGwgPSBudWxsO1xyXG5cclxuICByMWRzLnVwZGF0ZVNWRygpO1xyXG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XHJcblxyXG4gIHIxLnNoYXBlID0gbnVsbDtcclxuXHJcbiAgcjFkcy51cGRhdGVTVkcoKTtcclxuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xyXG5cclxuICByMWRzLmRpc3Bvc2UoKTtcclxuICByMWRjLmRpc3Bvc2UoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMCwgJ0FmdGVyIGRpc3Bvc2UsIHNob3VsZCBub3QgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xyXG5cclxuICBhc3NlcnQub2soIFBhdGhTVkdEcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xyXG4gIGFzc2VydC5vayggUGF0aENhbnZhc0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdEcmF3YWJsZXMgKFRleHQpJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBzdHViRGlzcGxheSA9IHsgX2ZyYW1lSWQ6IDUsIGlzV2ViR0xBbGxvd2VkOiAoKSA9PiB0cnVlIH07XHJcblxyXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcbiAgY2FudmFzLndpZHRoID0gNjQ7XHJcbiAgY2FudmFzLmhlaWdodCA9IDQ4O1xyXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xyXG4gIGNvbnN0IHdyYXBwZXIgPSBuZXcgQ2FudmFzQ29udGV4dFdyYXBwZXIoIGNhbnZhcywgY29udGV4dCApO1xyXG5cclxuXHJcbiAgY29uc3QgcjEgPSBuZXcgVGV4dCggJ1dvdyEnLCB7IGZpbGw6ICdyZWQnLCBzdHJva2U6ICdibHVlJywgbGluZVdpZHRoOiA1IH0gKTtcclxuICBjb25zdCByMWkgPSBuZXcgSW5zdGFuY2UoIHN0dWJEaXNwbGF5LCByMS5nZXRVbmlxdWVUcmFpbCgpICk7XHJcbiAgY29uc3QgcjFkZCA9IHIxLmNyZWF0ZURPTURyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrRE9NLCByMWkgKTtcclxuICBjb25zdCByMWRzID0gcjEuY3JlYXRlU1ZHRHJhd2FibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcsIHIxaSApO1xyXG4gIGNvbnN0IHIxZGMgPSByMS5jcmVhdGVDYW52YXNEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcywgcjFpICk7XHJcblxyXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDMsICdBZnRlciBpbml0LCBzaG91bGQgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xyXG5cclxuICByMWRkLnVwZGF0ZURPTSgpO1xyXG4gIHIxZHMudXBkYXRlU1ZHKCk7XHJcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcclxuXHJcbiAgcjEuc3RyaW5nID0gJ2InO1xyXG5cclxuICByMWRkLnVwZGF0ZURPTSgpO1xyXG4gIHIxZHMudXBkYXRlU1ZHKCk7XHJcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcclxuXHJcbiAgcjEuZm9udCA9ICcyMHB4IHNhbnMtc2VyaWYnO1xyXG5cclxuICByMWRkLnVwZGF0ZURPTSgpO1xyXG4gIHIxZHMudXBkYXRlU1ZHKCk7XHJcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcclxuXHJcbiAgcjEuc3Ryb2tlID0gbnVsbDtcclxuICByMS5maWxsID0gbnVsbDtcclxuXHJcbiAgcjFkZC51cGRhdGVET00oKTtcclxuICByMWRzLnVwZGF0ZVNWRygpO1xyXG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XHJcblxyXG4gIHIxZGQuZGlzcG9zZSgpO1xyXG4gIHIxZHMuZGlzcG9zZSgpO1xyXG4gIHIxZGMuZGlzcG9zZSgpO1xyXG5cclxuICBhc3NlcnQub2soIHIxLl9kcmF3YWJsZXMubGVuZ3RoID09PSAwLCAnQWZ0ZXIgZGlzcG9zZSwgc2hvdWxkIG5vdCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XHJcblxyXG4gIGFzc2VydC5vayggVGV4dERPTURyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbiAgYXNzZXJ0Lm9rKCBUZXh0U1ZHRHJhd2FibGUucG9vbC5sZW5ndGggPiAwLCAnRGlzcG9zZWQgZHJhd2FibGUgcmV0dXJuZWQgdG8gcG9vbCcgKTtcclxuICBhc3NlcnQub2soIFRleHRDYW52YXNEcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnRHJhd2FibGVzIChJbWFnZSknLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHN0dWJEaXNwbGF5ID0geyBfZnJhbWVJZDogNSwgaXNXZWJHTEFsbG93ZWQ6ICgpID0+IHRydWUgfTtcclxuXHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICBjYW52YXMud2lkdGggPSA2NDtcclxuICBjYW52YXMuaGVpZ2h0ID0gNDg7XHJcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgY29uc3Qgd3JhcHBlciA9IG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggY2FudmFzLCBjb250ZXh0ICk7XHJcblxyXG4gIC8vIDF4MSBibGFjayBQTkdcclxuICBjb25zdCByMSA9IG5ldyBJbWFnZSggJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBWUFBQUFmRmNTSkFBQUFEVWxFUVZRSVcyTmtZR0Q0RHdBQkNRRUJ0eG1ON3dBQUFBQkpSVTVFcmtKZ2dnPT0nICk7XHJcbiAgY29uc3QgcjFpID0gbmV3IEluc3RhbmNlKCBzdHViRGlzcGxheSwgcjEuZ2V0VW5pcXVlVHJhaWwoKSApO1xyXG4gIGNvbnN0IHIxZGQgPSByMS5jcmVhdGVET01EcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0RPTSwgcjFpICk7XHJcbiAgY29uc3QgcjFkcyA9IHIxLmNyZWF0ZVNWR0RyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrU1ZHLCByMWkgKTtcclxuICBjb25zdCByMWRjID0gcjEuY3JlYXRlQ2FudmFzRHJhd2FibGUoIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMsIHIxaSApO1xyXG5cclxuICBhc3NlcnQub2soIHIxLl9kcmF3YWJsZXMubGVuZ3RoID09PSAzLCAnQWZ0ZXIgaW5pdCwgc2hvdWxkIGhhdmUgZHJhd2FibGUgcmVmcycgKTtcclxuXHJcbiAgcjFkZC51cGRhdGVET00oKTtcclxuICByMWRzLnVwZGF0ZVNWRygpO1xyXG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XHJcblxyXG4gIC8vIDF4MSBibGFjayBKUEdcclxuICByMS5pbWFnZSA9ICdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQUFNQ0FnSUNBZ01DQWdJREF3TURCQVlFQkFRRUJBZ0dCZ1VHQ1FnS0Nna0lDUWtLREE4TUNnc09Dd2tKRFJFTkRnOFFFQkVRQ2d3U0V4SVFFdzhRRUJELzJ3QkRBUU1EQXdRREJBZ0VCQWdRQ3drTEVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkQvd0FBUkNBQUJBQUVEQVNJQUFoRUJBeEVCLzhRQUh3QUFBUVVCQVFFQkFRRUFBQUFBQUFBQUFBRUNBd1FGQmdjSUNRb0wvOFFBdFJBQUFnRURBd0lFQXdVRkJBUUFBQUY5QVFJREFBUVJCUkloTVVFR0UxRmhCeUp4RkRLQmthRUlJMEt4d1JWUzBmQWtNMkp5Z2drS0ZoY1lHUm9sSmljb0tTbzBOVFkzT0RrNlEwUkZSa2RJU1VwVFZGVldWMWhaV21Oa1pXWm5hR2xxYzNSMWRuZDRlWHFEaElXR2g0aUppcEtUbEpXV2w1aVptcUtqcEtXbXA2aXBxckt6dExXMnQ3aTV1c0xEeE1YR3g4akp5dExUMU5YVzE5aloydUhpNCtUbDV1Zm82ZXJ4OHZQMDlmYjMrUG42LzhRQUh3RUFBd0VCQVFFQkFRRUJBUUFBQUFBQUFBRUNBd1FGQmdjSUNRb0wvOFFBdFJFQUFnRUNCQVFEQkFjRkJBUUFBUUozQUFFQ0F4RUVCU0V4QmhKQlVRZGhjUk1pTW9FSUZFS1JvYkhCQ1NNelV2QVZZbkxSQ2hZa05PRWw4UmNZR1JvbUp5Z3BLalUyTnpnNU9rTkVSVVpIU0VsS1UxUlZWbGRZV1ZwalpHVm1aMmhwYW5OMGRYWjNlSGw2Z29PRWhZYUhpSW1La3BPVWxaYVhtSm1hb3FPa3BhYW5xS21xc3JPMHRiYTN1TG02d3NQRXhjYkh5TW5LMHRQVTFkYlgyTm5hNHVQazVlYm42T25xOHZQMDlmYjMrUG42LzlvQURBTUJBQUlSQXhFQVB3RDhxcUtLS0FQLzJRPT0nO1xyXG5cclxuICByMWRkLnVwZGF0ZURPTSgpO1xyXG4gIHIxZHMudXBkYXRlU1ZHKCk7XHJcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcclxuXHJcbiAgcjFkZC5kaXNwb3NlKCk7XHJcbiAgcjFkcy5kaXNwb3NlKCk7XHJcbiAgcjFkYy5kaXNwb3NlKCk7XHJcblxyXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDAsICdBZnRlciBkaXNwb3NlLCBzaG91bGQgbm90IGhhdmUgZHJhd2FibGUgcmVmcycgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCBJbWFnZURPTURyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbiAgYXNzZXJ0Lm9rKCBJbWFnZVNWR0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbiAgYXNzZXJ0Lm9rKCBJbWFnZUNhbnZhc0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdEcmF3YWJsZXMgKERPTSknLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHN0dWJEaXNwbGF5ID0geyBfZnJhbWVJZDogNSwgaXNXZWJHTEFsbG93ZWQ6ICgpID0+IHRydWUgfTtcclxuXHJcbiAgY29uc3QgcjEgPSBuZXcgRE9NKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApICk7XHJcbiAgY29uc3QgcjFpID0gbmV3IEluc3RhbmNlKCBzdHViRGlzcGxheSwgcjEuZ2V0VW5pcXVlVHJhaWwoKSApO1xyXG4gIGNvbnN0IHIxZGQgPSByMS5jcmVhdGVET01EcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0RPTSwgcjFpICk7XHJcblxyXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDEsICdBZnRlciBpbml0LCBzaG91bGQgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xyXG5cclxuICByMWRkLnVwZGF0ZURPTSgpO1xyXG5cclxuICByMWRkLmRpc3Bvc2UoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMCwgJ0FmdGVyIGRpc3Bvc2UsIHNob3VsZCBub3QgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xyXG5cclxuICBhc3NlcnQub2soIERPTURyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdSZW5kZXJlciBvcmRlciBiaXRtYXNrJywgYXNzZXJ0ID0+IHtcclxuXHJcbiAgLy8gaW5pdCB0ZXN0XHJcbiAgbGV0IG1hc2sgPSBSZW5kZXJlci5jcmVhdGVPcmRlckJpdG1hc2soIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMsIFJlbmRlcmVyLmJpdG1hc2tTVkcsIFJlbmRlcmVyLmJpdG1hc2tET00sIFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgUmVuZGVyZXIuYml0bWFza0RPTSApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApO1xyXG5cclxuICAvLyBlbXB0eSB0ZXN0XHJcbiAgbWFzayA9IFJlbmRlcmVyLmNyZWF0ZU9yZGVyQml0bWFzaygpO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIDAgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCAwICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgMCApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcclxuXHJcbiAgLy8gcHVzaGluZyBzaW5nbGUgcmVuZGVyZXIgc2hvdWxkIHdvcmtcclxuICBtYXNrID0gUmVuZGVyZXIucHVzaE9yZGVyQml0bWFzayggbWFzaywgUmVuZGVyZXIuYml0bWFza1NWRyApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCAwICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgMCApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcclxuXHJcbiAgLy8gcHVzaGluZyBhZ2FpbiBzaG91bGQgaGF2ZSBubyBjaGFuZ2VcclxuICBtYXNrID0gUmVuZGVyZXIucHVzaE9yZGVyQml0bWFzayggbWFzaywgUmVuZGVyZXIuYml0bWFza1NWRyApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCAwICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgMCApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcclxuXHJcbiAgLy8gcHVzaGluZyBDYW52YXMgd2lsbCBwdXQgaXQgZmlyc3QsIFNWRyBzZWNvbmRcclxuICBtYXNrID0gUmVuZGVyZXIucHVzaE9yZGVyQml0bWFzayggbWFzaywgUmVuZGVyZXIuYml0bWFza0NhbnZhcyApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgMCApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcclxuXHJcbiAgLy8gcHVzaGluZyBTVkcgd2lsbCByZXZlcnNlIHRoZSB0d29cclxuICBtYXNrID0gUmVuZGVyZXIucHVzaE9yZGVyQml0bWFzayggbWFzaywgUmVuZGVyZXIuYml0bWFza1NWRyApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgMCApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgNCApLCAwICk7XHJcblxyXG4gIC8vIHB1c2hpbmcgRE9NIHNoaWZ0cyB0aGUgb3RoZXIgdHdvIGRvd25cclxuICBtYXNrID0gUmVuZGVyZXIucHVzaE9yZGVyQml0bWFzayggbWFzaywgUmVuZGVyZXIuYml0bWFza0RPTSApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tET00gKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgUmVuZGVyZXIuYml0bWFza0NhbnZhcyApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcclxuXHJcbiAgLy8gcHVzaGluZyBET00gcmVzdWx0cyBpbiBubyBjaGFuZ2VcclxuICBtYXNrID0gUmVuZGVyZXIucHVzaE9yZGVyQml0bWFzayggbWFzaywgUmVuZGVyZXIuYml0bWFza0RPTSApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tET00gKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgUmVuZGVyZXIuYml0bWFza0NhbnZhcyApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcclxuXHJcbiAgLy8gcHVzaGluZyBDYW52YXMgbW92ZXMgaXQgdG8gdGhlIGZyb250XHJcbiAgbWFzayA9IFJlbmRlcmVyLnB1c2hPcmRlckJpdG1hc2soIG1hc2ssIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMCApLCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDEgKSwgUmVuZGVyZXIuYml0bWFza0RPTSApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAyICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMyApLCAwICk7XHJcblxyXG4gIC8vIHB1c2hpbmcgRE9NIGFnYWluIHN3YXBzIGl0IHdpdGggdGhlIENhbnZhc1xyXG4gIG1hc2sgPSBSZW5kZXJlci5wdXNoT3JkZXJCaXRtYXNrKCBtYXNrLCBSZW5kZXJlci5iaXRtYXNrRE9NICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDAgKSwgUmVuZGVyZXIuYml0bWFza0RPTSApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAxICksIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMiApLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDMgKSwgMCApO1xyXG4gIC8vIGNvbnNvbGUubG9nKCBtYXNrLnRvU3RyaW5nKCAxNiApICk7XHJcbiAgLy8gcHVzaGluZyBXZWJHTCBzaGlmdHMgZXZlcnl0aGluZ1xyXG4gIG1hc2sgPSBSZW5kZXJlci5wdXNoT3JkZXJCaXRtYXNrKCBtYXNrLCBSZW5kZXJlci5iaXRtYXNrV2ViR0wgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMCApLCBSZW5kZXJlci5iaXRtYXNrV2ViR0wgKTtcclxuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrRE9NICk7XHJcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgUmVuZGVyZXIuYml0bWFza0NhbnZhcyApO1xyXG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcclxuICAvLyBjb25zb2xlLmxvZyggbWFzay50b1N0cmluZyggMTYgKSApO1xyXG59ICk7XHJcbiBcclxuXHJcblFVbml0LnRlc3QoICdFbXB0eSBEaXNwbGF5IHVzYWdlJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBuID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBkID0gbmV3IERpc3BsYXkoIG4gKTtcclxuICBkLnVwZGF0ZURpc3BsYXkoKTtcclxuICBkLnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XHJcbiAgZC5kaXNwb3NlKCk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdTaW1wbGUgRGlzcGxheSB1c2FnZScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgciA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDUwLCA1MCwgeyBmaWxsOiAncmVkJyB9ICk7XHJcbiAgY29uc3QgZCA9IG5ldyBEaXNwbGF5KCByICk7XHJcbiAgZC51cGRhdGVEaXNwbGF5KCk7XHJcbiAgci5yZWN0V2lkdGggPSAxMDA7XHJcbiAgZC51cGRhdGVEaXNwbGF5KCk7XHJcblxyXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xyXG4gIGQuZGlzcG9zZSgpO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnU3RpdGNoIHBhdHRlcm5zICMxJywgYXNzZXJ0ID0+IHtcclxuICBjb25zdCBuID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBkID0gbmV3IERpc3BsYXkoIG4gKTtcclxuICBkLnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgbi5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggMCwgMCwgNTAsIDUwLCB7IGZpbGw6ICdyZWQnIH0gKSApO1xyXG4gIGQudXBkYXRlRGlzcGxheSgpO1xyXG5cclxuICBuLmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1MCwgNTAsIHsgZmlsbDogJ3JlZCcgfSApICk7XHJcbiAgZC51cGRhdGVEaXNwbGF5KCk7XHJcblxyXG4gIG4uYWRkQ2hpbGQoIG5ldyBSZWN0YW5nbGUoIDAsIDAsIDUwLCA1MCwgeyBmaWxsOiAncmVkJyB9ICkgKTtcclxuICBkLnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgbi5jaGlsZHJlblsgMSBdLnZpc2libGUgPSBmYWxzZTtcclxuICBkLnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgbi5jaGlsZHJlblsgMSBdLnZpc2libGUgPSB0cnVlO1xyXG4gIGQudXBkYXRlRGlzcGxheSgpO1xyXG5cclxuICBuLnJlbW92ZUNoaWxkKCBuLmNoaWxkcmVuWyAwIF0gKTtcclxuICBkLnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgbi5yZW1vdmVDaGlsZCggbi5jaGlsZHJlblsgMSBdICk7XHJcbiAgZC51cGRhdGVEaXNwbGF5KCk7XHJcblxyXG4gIG4ucmVtb3ZlQ2hpbGQoIG4uY2hpbGRyZW5bIDAgXSApO1xyXG4gIGQudXBkYXRlRGlzcGxheSgpO1xyXG5cclxuICBhc3NlcnQub2soIHRydWUsICdzbyB3ZSBoYXZlIGF0IGxlYXN0IDEgdGVzdCBpbiB0aGlzIHNldCcgKTtcclxuICBkLmRpc3Bvc2UoKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ0ludmlzaWJsZSBhcHBlbmQnLCBhc3NlcnQgPT4ge1xyXG4gIGNvbnN0IHNjZW5lID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHNjZW5lICk7XHJcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XHJcblxyXG4gIGNvbnN0IGEgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwLCB7IGZpbGw6ICdyZWQnIH0gKTtcclxuICBzY2VuZS5hZGRDaGlsZCggYSApO1xyXG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xyXG5cclxuICBjb25zdCBiID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCA1MCwgeyBmaWxsOiAncmVkJywgdmlzaWJsZTogZmFsc2UgfSApO1xyXG4gIHNjZW5lLmFkZENoaWxkKCBiICk7XHJcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XHJcblxyXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG5cclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ1N0aXRjaGluZyBwcm9ibGVtIEEgKEdpdEh1YiBJc3N1ZSAjMzM5KScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcclxuXHJcbiAgY29uc3QgYSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJ3JlZCcgfSApO1xyXG4gIGNvbnN0IGIgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1MCwgNTAsIHsgZmlsbDogJ2JsdWUnIH0gKTtcclxuICBjb25zdCBjID0gbmV3IERPTSggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKSApO1xyXG4gIGNvbnN0IGQgPSBuZXcgUmVjdGFuZ2xlKCAxMDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJ3JlZCcgfSApO1xyXG4gIGNvbnN0IGUgPSBuZXcgUmVjdGFuZ2xlKCAxMDAsIDAsIDUwLCA1MCwgeyBmaWxsOiAnYmx1ZScgfSApO1xyXG5cclxuICBjb25zdCBmID0gbmV3IFJlY3RhbmdsZSggMCwgNTAsIDEwMCwgNTAsIHsgZmlsbDogJ2dyZWVuJyB9ICk7XHJcbiAgY29uc3QgZyA9IG5ldyBET00oIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICkgKTtcclxuXHJcbiAgc2NlbmUuYWRkQ2hpbGQoIGEgKTtcclxuICBzY2VuZS5hZGRDaGlsZCggZiApO1xyXG4gIHNjZW5lLmFkZENoaWxkKCBiICk7XHJcbiAgc2NlbmUuYWRkQ2hpbGQoIGMgKTtcclxuICBzY2VuZS5hZGRDaGlsZCggZCApO1xyXG4gIHNjZW5lLmFkZENoaWxkKCBlICk7XHJcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XHJcblxyXG4gIHNjZW5lLnJlbW92ZUNoaWxkKCBmICk7XHJcbiAgc2NlbmUuaW5zZXJ0Q2hpbGQoIDQsIGcgKTtcclxuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcblxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnU1ZHIGdyb3VwIGRpc3Bvc2FsIGlzc3VlIChHaXRIdWIgSXNzdWUgIzM1NCkgQScsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcclxuXHJcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICByZW5kZXJlcjogJ3N2ZycsXHJcbiAgICBjc3NUcmFuc2Zvcm06IHRydWVcclxuICB9ICk7XHJcbiAgY29uc3QgcmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJ3JlZCcgfSApO1xyXG5cclxuICBzY2VuZS5hZGRDaGlsZCggbm9kZSApO1xyXG4gIG5vZGUuYWRkQ2hpbGQoIHJlY3QgKTtcclxuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgc2NlbmUucmVtb3ZlQ2hpbGQoIG5vZGUgKTtcclxuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcblxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnU1ZHIGdyb3VwIGRpc3Bvc2FsIGlzc3VlIChHaXRIdWIgSXNzdWUgIzM1NCkgQicsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcclxuXHJcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgY29uc3QgcmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHtcclxuICAgIGZpbGw6ICdyZWQnLFxyXG4gICAgcmVuZGVyZXI6ICdzdmcnLFxyXG4gICAgY3NzVHJhbnNmb3JtOiB0cnVlXHJcbiAgfSApO1xyXG5cclxuICBzY2VuZS5hZGRDaGlsZCggbm9kZSApO1xyXG4gIG5vZGUuYWRkQ2hpbGQoIHJlY3QgKTtcclxuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgc2NlbmUucmVtb3ZlQ2hpbGQoIG5vZGUgKTtcclxuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdFbXB0eSBwYXRoIGRpc3BsYXkgdGVzdCcsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcclxuXHJcbiAgc2NlbmUuYWRkQ2hpbGQoIG5ldyBQYXRoKCBudWxsICkgKTtcclxuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XHJcbiAgZGlzcGxheS5kaXNwb3NlKCk7XHJcbn0gKTtcclxuXHJcblFVbml0LnRlc3QoICdEb3VibGUgcmVtb3ZlIHJlbGF0ZWQgdG8gIzM5MicsIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xyXG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcclxuXHJcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XHJcblxyXG4gIGNvbnN0IG4xID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBuMiA9IG5ldyBOb2RlKCk7XHJcbiAgc2NlbmUuYWRkQ2hpbGQoIG4xICk7XHJcbiAgbjEuYWRkQ2hpbGQoIG4yICk7XHJcbiAgc2NlbmUuYWRkQ2hpbGQoIG4yICk7IC8vIHNvIHRoZSB0cmVlIGhhcyBhIHJlZmVyZW5jZSB0byB0aGUgTm9kZSB0aGF0IHdlIGNhbiB0cmlnZ2VyIHRoZSBmYWlsdXJlIG9uXHJcblxyXG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xyXG5cclxuICBzY2VuZS5yZW1vdmVDaGlsZCggbjEgKTtcclxuICBuMS5yZW1vdmVDaGlsZCggbjIgKTtcclxuXHJcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XHJcblxyXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xyXG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSw2QkFBNkI7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLG9CQUFvQjtBQUN2QyxPQUFPQyxHQUFHLE1BQU0saUJBQWlCO0FBQ2pDLE9BQU9DLEtBQUssTUFBTSxtQkFBbUI7QUFDckMsT0FBT0MsSUFBSSxNQUFNLGtCQUFrQjtBQUNuQyxPQUFPQyxJQUFJLE1BQU0sa0JB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