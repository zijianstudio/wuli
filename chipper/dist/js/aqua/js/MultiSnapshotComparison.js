// Copyright 2022-2023, University of Colorado Boulder
// eslint-disable-next-line bad-typescript-text
// @ts-nocheck
/**
 * Snapshot comparison across multiple running urls
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

// TODO: allow linting (it's not finding common definitions)
/* eslint-disable */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import { Color, Display, DOM, FireListener, FlowBox, Font, GridBackgroundNode, GridBox, Image, Node, Rectangle, Text } from '../../scenery/js/imports.js';
(async () => {
  const activeRunnablesResponse = await fetch('../../perennial/data/active-runnables');
  const activeRunnables = (await activeRunnablesResponse.text()).trim().replace(/\r/g, '').split('\n');
  const activePhetIOResponse = await fetch('../../perennial/data/phet-io');
  const activePhetIO = (await activePhetIOResponse.text()).trim().replace(/\r/g, '').split('\n');
  const unreliableSims = [
    // NOTE: add sims here that are constantly failing
  ];
  const options = QueryStringMachine.getAll({
    // The URLs that point to the base git roots that can be browsed. A slash will be added after. Each one will be
    // represented by a column in the interface
    urls: {
      type: 'array',
      elementSchema: {
        type: 'string'
      },
      defaultValue: ['http://localhost', 'http://localhost:8080'],
      public: true
    },
    // If provided, a comma-separated list of runnables to test (useful if you know some that are failing), e.g.
    // `?runnables=acid-base-solutions,density`
    runnables: {
      type: 'array',
      elementSchema: {
        type: 'string'
      },
      defaultValue: activeRunnables
    },
    // Controls the random seed for comparison
    simSeed: {
      type: 'number',
      defaultValue: 4 // Ideal constant taken from https://xkcd.com/221/, DO NOT CHANGE, it's random!
    },

    // Controls the size of the sims (can be used for higher resolution)
    simWidth: {
      type: 'number',
      defaultValue: 1024 / 4
    },
    simHeight: {
      type: 'number',
      defaultValue: 768 / 4
    },
    // Passed to the simulation in addition to brand/ea
    additionalSimQueryParameters: {
      type: 'string',
      defaultValue: ''
    },
    // How many frames should be snapshot per runnable
    numFrames: {
      type: 'number',
      defaultValue: 10
    },
    // How many iframes to devote per each column
    copies: {
      type: 'number',
      defaultValue: 1
    },
    // This running instance will only test every `stride` number of rows. Useful to test across multiple browser
    // windows for performance (e.g. 1: ?stride=3&offset=0 2: ?stride=3&offset=1 2: ?stride=3&offset=2).
    stride: {
      type: 'number',
      defaultValue: 1
    },
    // The offset to apply when stride is active, see above.
    offset: {
      type: 'number',
      defaultValue: 0
    }
  });
  const childQueryParams = `simSeed=${encodeURIComponent(options.simSeed)}&simWidth=${encodeURIComponent(options.simWidth)}&simHeight=${encodeURIComponent(options.simHeight)}&numFrames=${encodeURIComponent(options.numFrames)}`;
  const rows = _.flatten(options.runnables.map(runnable => {
    return [{
      runnable: runnable,
      brand: 'phet'
    }, ...(activePhetIO.includes(runnable) ? [{
      runnable: runnable,
      brand: 'phet-io'
    }] : [])];
  })).filter((item, i) => i % options.stride === options.offset);
  const loadImage = url => {
    return new Promise((resolve, reject) => {
      const image = document.createElement('img');
      image.addEventListener('load', () => {
        resolve(image);
      });
      image.src = url;
    });
  };

  // TODO: factor out somewhere
  function imageToContext(image, width, height) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0);
    return context;
  }

  // TODO: factor out somewhere
  function contextToData(context, width, height) {
    return context.getImageData(0, 0, width, height);
  }

  // TODO: factor out somewhere
  function dataToCanvas(data, width, height) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    context.putImageData(data, 0, 0);
    return canvas;
  }
  const compareImages = async (urlA, urlB, width, height) => {
    const imageA = await loadImage(urlA);
    const imageB = await loadImage(urlB);
    const threshold = 0;
    const a = contextToData(imageToContext(imageA, width, height), width, height);
    const b = contextToData(imageToContext(imageB, width, height), width, height);
    let largestDifference = 0;
    let totalDifference = 0;
    const colorDiffData = document.createElement('canvas').getContext('2d').createImageData(a.width, a.height);
    const alphaDiffData = document.createElement('canvas').getContext('2d').createImageData(a.width, a.height);
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

    const averageDifference = totalDifference / (4 * a.width * a.height);
    if (averageDifference > threshold) {
      return {
        a: dataToCanvas(a, width, height),
        b: dataToCanvas(b, width, height),
        diff: dataToCanvas(colorDiffData, width, height),
        largestDifference: largestDifference,
        averageDifference: averageDifference
      };
    }
    return null;
  };
  class Snapshot {
    frames = [];
    constructor(runnable, brand, column) {
      this.runnable = runnable;
      this.brand = brand;
      this.column = column;
      this.frameCountProperty = new NumberProperty(0);
      this.hashProperty = new Property(null);
      this.hasErroredProperty = new BooleanProperty(false);
      this.isCompleteProperty = new BooleanProperty(false);
    }
    addFrame(frame) {
      this.frames.push(frame);
      this.frameCountProperty.value++;
    }
    addHash(hash) {
      this.hashProperty.value = hash;
      this.isCompleteProperty.value = true;
    }
    addError() {
      this.hasErroredProperty.value = true;
      this.isCompleteProperty.value = true;
    }
  }
  const snapshotterMap = new Map();
  class Snapshotter {
    constructor(url, index, nextRunnable) {
      this.url = url;
      this.index = index;
      this.currentSnapshot = null;
      this.nextRunnable = nextRunnable;
      this.iframe = document.createElement('iframe');
      this.iframe.setAttribute('frameborder', '0');
      this.iframe.setAttribute('seamless', '1');
      this.iframe.setAttribute('width', options.simWidth);
      this.iframe.setAttribute('height', options.simHeight);
      this.iframe.style.position = 'absolute';
      snapshotterMap.set(index, this);
    }
    addFrame(frame) {
      this.currentSnapshot.addFrame(frame);
    }
    addHash(hash) {
      this.currentSnapshot.addHash(hash);
      this.nextRunnable(this);
    }
    addError() {
      this.currentSnapshot.addError();
      this.nextRunnable(this);
    }
    load(snapshot) {
      this.currentSnapshot = snapshot;
      const simQueryParameters = encodeURIComponent((snapshot.brand === 'phet-io' ? 'brand=phet-io&ea&phetioStandalone' : 'brand=phet&ea') + options.additionalSimQueryParameters);
      const url = encodeURIComponent(`../../${snapshot.runnable}/${snapshot.runnable}_en.html`);
      this.iframe.src = `${this.url}/aqua/html/take-snapshot.html?id=${this.index}&${childQueryParams}&url=${url}&simQueryParameters=${simQueryParameters}`;
    }
  }
  class Column {
    constructor(url, index) {
      this.url = url;
      this.index = index;
      this.snapshots = rows.map(row => new Snapshot(row.runnable, row.brand, this));
      this.queue = this.snapshots.slice();
      this.snapshotters = _.range(0, options.copies).map(i => new Snapshotter(url, index + i * 100, this.nextRunnable.bind(this)));
    }
    getSnapshot(runnable) {
      return _.find(this.snapshots, snapshot => snapshot.runnable === runnable);
    }
    nextRunnable(snapshotter) {
      if (this.queue.length) {
        const snapshot = this.queue.shift();
        snapshotter.load(snapshot);
      }
    }
    start() {
      this.snapshotters.forEach(snapshotter => this.nextRunnable(snapshotter));
    }
  }
  const columns = options.urls.map((url, i) => new Column(url, i));
  const scene = new Node();
  const display = new Display(scene, {
    width: 512,
    height: 512,
    backgroundColor: Color.TRANSPARENT,
    passiveEvents: true
  });
  document.body.appendChild(display.domElement);
  display.initializeEvents();
  const gridBox = new GridBox({
    xAlign: 'left',
    margin: 2
  });
  const gridChildren = [];
  scene.addChild(new GridBackgroundNode(gridBox.constraint, {
    createCellBackground: cell => {
      return Rectangle.bounds(cell.lastAvailableBounds, {
        fill: cell.position.vertical % 2 === 0 ? 'white' : '#eee'
      });
    }
  }));
  scene.addChild(gridBox);
  let y = 0;
  columns.forEach((column, i) => {
    gridChildren.push(new Text(`${column.url}`, {
      font: new Font({
        size: 12,
        weight: 'bold'
      }),
      layoutOptions: {
        column: i + 1,
        row: y,
        xAlign: 'center'
      }
    }));
  });
  y++;
  columns.forEach((column, i) => {
    column.snapshotters.forEach((snapshotter, j) => {
      gridChildren.push(new DOM(snapshotter.iframe, {
        layoutOptions: {
          column: i + 1,
          row: y + j
        }
      }));
    });
  });
  y += options.copies;
  const runnableYMap = {};
  rows.forEach((row, i) => {
    const runnable = row.runnable;
    const brand = row.brand;
    runnableYMap[runnable] = y;
    const runnableText = new Text(runnable + (brand !== 'phet' ? ` (${brand})` : ''), {
      font: new Font({
        size: 12
      }),
      layoutOptions: {
        column: 0,
        row: y
      },
      opacity: unreliableSims.includes(runnable) ? 0.2 : 1
    });
    gridChildren.push(runnableText);
    Multilink.multilink(_.flatten(columns.map(column => {
      const snapshot = column.getSnapshot(runnable);
      return [snapshot.hasErroredProperty, snapshot.hashProperty, snapshot.isCompleteProperty];
    })), () => {
      const snapshots = columns.map(column => column.getSnapshot(runnable));
      if (_.every(snapshots, snapshot => snapshot.isCompleteProperty.value)) {
        if (_.some(snapshots, snapshot => snapshot.hasErroredProperty.value)) {
          runnableText.fill = 'magenta';
        } else {
          const hash = snapshots[0].hashProperty.value;
          if (_.every(snapshots, snapshot => snapshot.hashProperty.value === hash)) {
            runnableText.fill = '#0b0';
          } else {
            runnableText.fill = '#b00';
            runnableText.cursor = 'pointer';
            runnableText.addInputListener(new FireListener({
              fire: async () => {
                const firstFrames = snapshots[0].frames;
                const createImageNode = canvas => {
                  const image = new Image(canvas);
                  image.cursor = 'pointer';
                  image.addInputListener(new FireListener({
                    fire: () => navigator.clipboard?.writeText(canvas.toDataURL())
                  }));
                  return image;
                };
                let index = 0;
                for (let i = 0; i < firstFrames.length; i++) {
                  const frame = snapshots[0].frames[i];
                  const diffImages = [];
                  for (let j = 1; j < snapshots.length; j++) {
                    const otherFrame = snapshots[j].frames[i];
                    const data = await compareImages(frame.screenshot.url, otherFrame.screenshot.url, options.simWidth, options.simHeight);
                    console.log(data);
                    if (data) {
                      if (diffImages.length === 0) {
                        diffImages.push(createImageNode(data.a));
                      }
                      diffImages.push(createImageNode(data.b));
                      diffImages.push(createImageNode(data.diff));
                    }
                  }
                  gridChildren.push(new FlowBox({
                    orientation: 'horizontal',
                    children: diffImages,
                    spacing: 5,
                    layoutOptions: {
                      column: snapshots.length + 1 + index++,
                      row: runnableYMap[runnable],
                      xAlign: 'left'
                    }
                  }));
                }
                gridBox.children = gridChildren;
              }
            }));
          }
        }
      } else {
        runnableText.fill = 'black';
      }
    });
    columns.forEach((column, j) => {
      const snapshot = column.snapshots[i];
      const hashText = new Text('-', {
        font: new Font({
          size: 10,
          family: 'Menlo, Consolas, Courier, monospace'
        })
      });
      snapshot.hashProperty.link(hash => {
        hashText.string = hash || '-';
      });
      const frameText = new Text('0', {
        font: new Font({
          size: 12
        })
      });
      snapshot.frameCountProperty.link(frameCount => {
        frameText.string = frameCount;
      });
      snapshot.hasErroredProperty.link(hasErrored => {
        frameText.fill = hasErrored ? '#f00' : '#bbb';
      });
      gridChildren.push(new FlowBox({
        orientation: 'horizontal',
        spacing: 20,
        children: [frameText, hashText],
        layoutOptions: {
          column: j + 1,
          row: y,
          xAlign: 'center'
        }
      }));
    });
    y++;
  });
  gridBox.children = gridChildren;
  window.addEventListener('message', evt => {
    if (typeof evt.data !== 'string') {
      return;
    }
    const data = JSON.parse(evt.data);
    if (data.type === 'frameEmitted') {
      // number, screenshot: { url, hash }
      snapshotterMap.get(data.id).addFrame(data);
    } else if (data.type === 'snapshot') {
      // basically hash
      snapshotterMap.get(data.id).addHash(data.hash);
    } else if (data.type === 'error') {
      console.log('data');
      snapshotterMap.get(data.id).addError();
    }
  });

  // Kick off initial
  columns.forEach(column => column.start());
  display.updateOnRequestAnimationFrame(dt => {
    display.width = Math.ceil(Math.max(window.innerWidth, scene.right));
    display.height = Math.ceil(Math.max(window.innerHeight, scene.bottom));
  });
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiQ29sb3IiLCJEaXNwbGF5IiwiRE9NIiwiRmlyZUxpc3RlbmVyIiwiRmxvd0JveCIsIkZvbnQiLCJHcmlkQmFja2dyb3VuZE5vZGUiLCJHcmlkQm94IiwiSW1hZ2UiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImFjdGl2ZVJ1bm5hYmxlc1Jlc3BvbnNlIiwiZmV0Y2giLCJhY3RpdmVSdW5uYWJsZXMiLCJ0ZXh0IiwidHJpbSIsInJlcGxhY2UiLCJzcGxpdCIsImFjdGl2ZVBoZXRJT1Jlc3BvbnNlIiwiYWN0aXZlUGhldElPIiwidW5yZWxpYWJsZVNpbXMiLCJvcHRpb25zIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwidXJscyIsInR5cGUiLCJlbGVtZW50U2NoZW1hIiwiZGVmYXVsdFZhbHVlIiwicHVibGljIiwicnVubmFibGVzIiwic2ltU2VlZCIsInNpbVdpZHRoIiwic2ltSGVpZ2h0IiwiYWRkaXRpb25hbFNpbVF1ZXJ5UGFyYW1ldGVycyIsIm51bUZyYW1lcyIsImNvcGllcyIsInN0cmlkZSIsIm9mZnNldCIsImNoaWxkUXVlcnlQYXJhbXMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJyb3dzIiwiXyIsImZsYXR0ZW4iLCJtYXAiLCJydW5uYWJsZSIsImJyYW5kIiwiaW5jbHVkZXMiLCJmaWx0ZXIiLCJpdGVtIiwiaSIsImxvYWRJbWFnZSIsInVybCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiaW1hZ2UiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwic3JjIiwiaW1hZ2VUb0NvbnRleHQiLCJ3aWR0aCIsImhlaWdodCIsImNhbnZhcyIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwiZHJhd0ltYWdlIiwiY29udGV4dFRvRGF0YSIsImdldEltYWdlRGF0YSIsImRhdGFUb0NhbnZhcyIsImRhdGEiLCJwdXRJbWFnZURhdGEiLCJjb21wYXJlSW1hZ2VzIiwidXJsQSIsInVybEIiLCJpbWFnZUEiLCJpbWFnZUIiLCJ0aHJlc2hvbGQiLCJhIiwiYiIsImxhcmdlc3REaWZmZXJlbmNlIiwidG90YWxEaWZmZXJlbmNlIiwiY29sb3JEaWZmRGF0YSIsImNyZWF0ZUltYWdlRGF0YSIsImFscGhhRGlmZkRhdGEiLCJsZW5ndGgiLCJkaWZmIiwiTWF0aCIsImFicyIsImFscGhhSW5kZXgiLCJhbHBoYU11bHRpcGxpZWREaWZmIiwibWF4IiwiYXZlcmFnZURpZmZlcmVuY2UiLCJTbmFwc2hvdCIsImZyYW1lcyIsImNvbnN0cnVjdG9yIiwiY29sdW1uIiwiZnJhbWVDb3VudFByb3BlcnR5IiwiaGFzaFByb3BlcnR5IiwiaGFzRXJyb3JlZFByb3BlcnR5IiwiaXNDb21wbGV0ZVByb3BlcnR5IiwiYWRkRnJhbWUiLCJmcmFtZSIsInB1c2giLCJ2YWx1ZSIsImFkZEhhc2giLCJoYXNoIiwiYWRkRXJyb3IiLCJzbmFwc2hvdHRlck1hcCIsIk1hcCIsIlNuYXBzaG90dGVyIiwiaW5kZXgiLCJuZXh0UnVubmFibGUiLCJjdXJyZW50U25hcHNob3QiLCJpZnJhbWUiLCJzZXRBdHRyaWJ1dGUiLCJzdHlsZSIsInBvc2l0aW9uIiwic2V0IiwibG9hZCIsInNuYXBzaG90Iiwic2ltUXVlcnlQYXJhbWV0ZXJzIiwiQ29sdW1uIiwic25hcHNob3RzIiwicm93IiwicXVldWUiLCJzbGljZSIsInNuYXBzaG90dGVycyIsInJhbmdlIiwiYmluZCIsImdldFNuYXBzaG90IiwiZmluZCIsInNuYXBzaG90dGVyIiwic2hpZnQiLCJzdGFydCIsImZvckVhY2giLCJjb2x1bW5zIiwic2NlbmUiLCJkaXNwbGF5IiwiYmFja2dyb3VuZENvbG9yIiwiVFJBTlNQQVJFTlQiLCJwYXNzaXZlRXZlbnRzIiwiYm9keSIsImFwcGVuZENoaWxkIiwiZG9tRWxlbWVudCIsImluaXRpYWxpemVFdmVudHMiLCJncmlkQm94IiwieEFsaWduIiwibWFyZ2luIiwiZ3JpZENoaWxkcmVuIiwiYWRkQ2hpbGQiLCJjb25zdHJhaW50IiwiY3JlYXRlQ2VsbEJhY2tncm91bmQiLCJjZWxsIiwiYm91bmRzIiwibGFzdEF2YWlsYWJsZUJvdW5kcyIsImZpbGwiLCJ2ZXJ0aWNhbCIsInkiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsImxheW91dE9wdGlvbnMiLCJqIiwicnVubmFibGVZTWFwIiwicnVubmFibGVUZXh0Iiwib3BhY2l0eSIsIm11bHRpbGluayIsImV2ZXJ5Iiwic29tZSIsImN1cnNvciIsImFkZElucHV0TGlzdGVuZXIiLCJmaXJlIiwiZmlyc3RGcmFtZXMiLCJjcmVhdGVJbWFnZU5vZGUiLCJuYXZpZ2F0b3IiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJ0b0RhdGFVUkwiLCJkaWZmSW1hZ2VzIiwib3RoZXJGcmFtZSIsInNjcmVlbnNob3QiLCJjb25zb2xlIiwibG9nIiwib3JpZW50YXRpb24iLCJjaGlsZHJlbiIsInNwYWNpbmciLCJoYXNoVGV4dCIsImZhbWlseSIsImxpbmsiLCJzdHJpbmciLCJmcmFtZVRleHQiLCJmcmFtZUNvdW50IiwiaGFzRXJyb3JlZCIsIndpbmRvdyIsImV2dCIsIkpTT04iLCJwYXJzZSIsImdldCIsImlkIiwidXBkYXRlT25SZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJkdCIsImNlaWwiLCJpbm5lcldpZHRoIiwicmlnaHQiLCJpbm5lckhlaWdodCIsImJvdHRvbSJdLCJzb3VyY2VzIjpbIk11bHRpU25hcHNob3RDb21wYXJpc29uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFkLXR5cGVzY3JpcHQtdGV4dFxyXG4vLyBAdHMtbm9jaGVja1xyXG4vKipcclxuICogU25hcHNob3QgY29tcGFyaXNvbiBhY3Jvc3MgbXVsdGlwbGUgcnVubmluZyB1cmxzXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG4vLyBUT0RPOiBhbGxvdyBsaW50aW5nIChpdCdzIG5vdCBmaW5kaW5nIGNvbW1vbiBkZWZpbml0aW9ucylcclxuLyogZXNsaW50LWRpc2FibGUgKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBEaXNwbGF5LCBET00sIEZpcmVMaXN0ZW5lciwgRmxvd0JveCwgRm9udCwgR3JpZEJhY2tncm91bmROb2RlLCBHcmlkQm94LCBHcmlkQ2VsbCwgSW1hZ2UsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcblxyXG50eXBlIEZyYW1lID0ge1xyXG4gIG51bWJlcjogbnVtYmVyO1xyXG4gIHNjcmVlbnNob3Q6IHtcclxuICAgIGhhc2g6IHN0cmluZztcclxuICAgIHVybDogc3RyaW5nO1xyXG4gIH07XHJcbn07XHJcblxyXG4oIGFzeW5jICgpID0+IHtcclxuICBjb25zdCBhY3RpdmVSdW5uYWJsZXNSZXNwb25zZSA9IGF3YWl0IGZldGNoKCAnLi4vLi4vcGVyZW5uaWFsL2RhdGEvYWN0aXZlLXJ1bm5hYmxlcycgKTtcclxuICBjb25zdCBhY3RpdmVSdW5uYWJsZXMgPSAoIGF3YWl0IGFjdGl2ZVJ1bm5hYmxlc1Jlc3BvbnNlLnRleHQoKSApLnRyaW0oKS5yZXBsYWNlKCAvXFxyL2csICcnICkuc3BsaXQoICdcXG4nICk7XHJcblxyXG4gIGNvbnN0IGFjdGl2ZVBoZXRJT1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goICcuLi8uLi9wZXJlbm5pYWwvZGF0YS9waGV0LWlvJyApO1xyXG4gIGNvbnN0IGFjdGl2ZVBoZXRJTyA9ICggYXdhaXQgYWN0aXZlUGhldElPUmVzcG9uc2UudGV4dCgpICkudHJpbSgpLnJlcGxhY2UoIC9cXHIvZywgJycgKS5zcGxpdCggJ1xcbicgKTtcclxuXHJcbiAgY29uc3QgdW5yZWxpYWJsZVNpbXMgPSBbXHJcbiAgICAvLyBOT1RFOiBhZGQgc2ltcyBoZXJlIHRoYXQgYXJlIGNvbnN0YW50bHkgZmFpbGluZ1xyXG4gIF07XHJcblxyXG4gIGNvbnN0IG9wdGlvbnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcblxyXG4gICAgLy8gVGhlIFVSTHMgdGhhdCBwb2ludCB0byB0aGUgYmFzZSBnaXQgcm9vdHMgdGhhdCBjYW4gYmUgYnJvd3NlZC4gQSBzbGFzaCB3aWxsIGJlIGFkZGVkIGFmdGVyLiBFYWNoIG9uZSB3aWxsIGJlXHJcbiAgICAvLyByZXByZXNlbnRlZCBieSBhIGNvbHVtbiBpbiB0aGUgaW50ZXJmYWNlXHJcbiAgICB1cmxzOiB7XHJcbiAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgIGVsZW1lbnRTY2hlbWE6IHtcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICB9LFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IFsgJ2h0dHA6Ly9sb2NhbGhvc3QnLCAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJyBdLFxyXG4gICAgICBwdWJsaWM6IHRydWVcclxuICAgIH0sXHJcblxyXG4gICAgLy8gSWYgcHJvdmlkZWQsIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgcnVubmFibGVzIHRvIHRlc3QgKHVzZWZ1bCBpZiB5b3Uga25vdyBzb21lIHRoYXQgYXJlIGZhaWxpbmcpLCBlLmcuXHJcbiAgICAvLyBgP3J1bm5hYmxlcz1hY2lkLWJhc2Utc29sdXRpb25zLGRlbnNpdHlgXHJcbiAgICBydW5uYWJsZXM6IHtcclxuICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgZWxlbWVudFNjaGVtYTogeyB0eXBlOiAnc3RyaW5nJyB9LFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IGFjdGl2ZVJ1bm5hYmxlc1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBDb250cm9scyB0aGUgcmFuZG9tIHNlZWQgZm9yIGNvbXBhcmlzb25cclxuICAgIHNpbVNlZWQ6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogNCAvLyBJZGVhbCBjb25zdGFudCB0YWtlbiBmcm9tIGh0dHBzOi8veGtjZC5jb20vMjIxLywgRE8gTk9UIENIQU5HRSwgaXQncyByYW5kb20hXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSBzaXplIG9mIHRoZSBzaW1zIChjYW4gYmUgdXNlZCBmb3IgaGlnaGVyIHJlc29sdXRpb24pXHJcbiAgICBzaW1XaWR0aDoge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAxMDI0IC8gNFxyXG4gICAgfSxcclxuICAgIHNpbUhlaWdodDoge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiA3NjggLyA0XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFBhc3NlZCB0byB0aGUgc2ltdWxhdGlvbiBpbiBhZGRpdGlvbiB0byBicmFuZC9lYVxyXG4gICAgYWRkaXRpb25hbFNpbVF1ZXJ5UGFyYW1ldGVyczoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAnJ1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBIb3cgbWFueSBmcmFtZXMgc2hvdWxkIGJlIHNuYXBzaG90IHBlciBydW5uYWJsZVxyXG4gICAgbnVtRnJhbWVzOiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDEwXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIEhvdyBtYW55IGlmcmFtZXMgdG8gZGV2b3RlIHBlciBlYWNoIGNvbHVtblxyXG4gICAgY29waWVzOiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDFcclxuICAgIH0sXHJcblxyXG4gICAgLy8gVGhpcyBydW5uaW5nIGluc3RhbmNlIHdpbGwgb25seSB0ZXN0IGV2ZXJ5IGBzdHJpZGVgIG51bWJlciBvZiByb3dzLiBVc2VmdWwgdG8gdGVzdCBhY3Jvc3MgbXVsdGlwbGUgYnJvd3NlclxyXG4gICAgLy8gd2luZG93cyBmb3IgcGVyZm9ybWFuY2UgKGUuZy4gMTogP3N0cmlkZT0zJm9mZnNldD0wIDI6ID9zdHJpZGU9MyZvZmZzZXQ9MSAyOiA/c3RyaWRlPTMmb2Zmc2V0PTIpLlxyXG4gICAgc3RyaWRlOiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDFcclxuICAgIH0sXHJcbiAgICAvLyBUaGUgb2Zmc2V0IHRvIGFwcGx5IHdoZW4gc3RyaWRlIGlzIGFjdGl2ZSwgc2VlIGFib3ZlLlxyXG4gICAgb2Zmc2V0OiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDBcclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGNoaWxkUXVlcnlQYXJhbXMgPVxyXG4gICAgYHNpbVNlZWQ9JHtlbmNvZGVVUklDb21wb25lbnQoIG9wdGlvbnMuc2ltU2VlZCApXHJcbiAgICB9JnNpbVdpZHRoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBvcHRpb25zLnNpbVdpZHRoIClcclxuICAgIH0mc2ltSGVpZ2h0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBvcHRpb25zLnNpbUhlaWdodCApXHJcbiAgICB9Jm51bUZyYW1lcz0ke2VuY29kZVVSSUNvbXBvbmVudCggb3B0aW9ucy5udW1GcmFtZXMgKVxyXG4gICAgfWA7XHJcblxyXG4gIGNvbnN0IHJvd3M6IHsgcnVubmFibGU6IHN0cmluZywgYnJhbmQ6IHN0cmluZyB9W10gPSBfLmZsYXR0ZW4oIG9wdGlvbnMucnVubmFibGVzLm1hcCggKCBydW5uYWJsZTogc3RyaW5nICkgPT4ge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgeyBydW5uYWJsZTogcnVubmFibGUsIGJyYW5kOiAncGhldCcgfSxcclxuICAgICAgLi4uKCBhY3RpdmVQaGV0SU8uaW5jbHVkZXMoIHJ1bm5hYmxlICkgPyBbIHsgcnVubmFibGU6IHJ1bm5hYmxlLCBicmFuZDogJ3BoZXQtaW8nIH0gXSA6IFtdIClcclxuICAgIF07XHJcbiAgfSApICkuZmlsdGVyKCAoIGl0ZW0sIGkgKSA9PiBpICUgb3B0aW9ucy5zdHJpZGUgPT09IG9wdGlvbnMub2Zmc2V0ICk7XHJcblxyXG4gIGNvbnN0IGxvYWRJbWFnZSA9ICggdXJsOiBzdHJpbmcgKTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8SFRNTEltYWdlRWxlbWVudD4oICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xyXG4gICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbWcnICk7XHJcbiAgICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgKCkgPT4ge1xyXG4gICAgICAgIHJlc29sdmUoIGltYWdlICk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgaW1hZ2Uuc3JjID0gdXJsO1xyXG4gICAgfSApO1xyXG4gIH07XHJcblxyXG4gIC8vIFRPRE86IGZhY3RvciBvdXQgc29tZXdoZXJlXHJcbiAgZnVuY3Rpb24gaW1hZ2VUb0NvbnRleHQoIGltYWdlLCB3aWR0aCwgaGVpZ2h0ICkge1xyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xyXG4gICAgY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgY29udGV4dC5kcmF3SW1hZ2UoIGltYWdlLCAwLCAwICk7XHJcbiAgICByZXR1cm4gY29udGV4dDtcclxuICB9XHJcblxyXG4gIC8vIFRPRE86IGZhY3RvciBvdXQgc29tZXdoZXJlXHJcbiAgZnVuY3Rpb24gY29udGV4dFRvRGF0YSggY29udGV4dCwgd2lkdGgsIGhlaWdodCApIHtcclxuICAgIHJldHVybiBjb250ZXh0LmdldEltYWdlRGF0YSggMCwgMCwgd2lkdGgsIGhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETzogZmFjdG9yIG91dCBzb21ld2hlcmVcclxuICBmdW5jdGlvbiBkYXRhVG9DYW52YXMoIGRhdGEsIHdpZHRoLCBoZWlnaHQgKSB7XHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XHJcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICBjb250ZXh0LnB1dEltYWdlRGF0YSggZGF0YSwgMCwgMCApO1xyXG4gICAgcmV0dXJuIGNhbnZhcztcclxuICB9XHJcblxyXG4gIGNvbnN0IGNvbXBhcmVJbWFnZXMgPSBhc3luYyAoIHVybEEsIHVybEIsIHdpZHRoLCBoZWlnaHQgKTogUHJvbWlzZTx7IGE6IEhUTUxDYW52YXNFbGVtZW50OyBiOiBIVE1MQ2FudmFzRWxlbWVudDsgZGlmZjogSFRNTENhbnZhc0VsZW1lbnQ7IGxhcmdlc3REaWZmZXJlbmNlOiBudW1iZXI7IGF2ZXJhZ2VEaWZmZXJlbmNlOiBudW1iZXIgfSB8IG51bGw+ID0+IHtcclxuICAgIGNvbnN0IGltYWdlQSA9IGF3YWl0IGxvYWRJbWFnZSggdXJsQSApO1xyXG4gICAgY29uc3QgaW1hZ2VCID0gYXdhaXQgbG9hZEltYWdlKCB1cmxCICk7XHJcblxyXG4gICAgY29uc3QgdGhyZXNob2xkID0gMDtcclxuICAgIGNvbnN0IGEgPSBjb250ZXh0VG9EYXRhKCBpbWFnZVRvQ29udGV4dCggaW1hZ2VBLCB3aWR0aCwgaGVpZ2h0ICksIHdpZHRoLCBoZWlnaHQgKTtcclxuICAgIGNvbnN0IGIgPSBjb250ZXh0VG9EYXRhKCBpbWFnZVRvQ29udGV4dCggaW1hZ2VCLCB3aWR0aCwgaGVpZ2h0ICksIHdpZHRoLCBoZWlnaHQgKTtcclxuXHJcbiAgICBsZXQgbGFyZ2VzdERpZmZlcmVuY2UgPSAwO1xyXG4gICAgbGV0IHRvdGFsRGlmZmVyZW5jZSA9IDA7XHJcbiAgICBjb25zdCBjb2xvckRpZmZEYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKS5nZXRDb250ZXh0KCAnMmQnICkuY3JlYXRlSW1hZ2VEYXRhKCBhLndpZHRoLCBhLmhlaWdodCApO1xyXG4gICAgY29uc3QgYWxwaGFEaWZmRGF0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICkuZ2V0Q29udGV4dCggJzJkJyApLmNyZWF0ZUltYWdlRGF0YSggYS53aWR0aCwgYS5oZWlnaHQgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGEuZGF0YS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKCBhLmRhdGFbIGkgXSAtIGIuZGF0YVsgaSBdICk7XHJcbiAgICAgIGlmICggaSAlIDQgPT09IDMgKSB7XHJcbiAgICAgICAgY29sb3JEaWZmRGF0YS5kYXRhWyBpIF0gPSAyNTU7XHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIF0gPSAyNTU7XHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIC0gMyBdID0gZGlmZjsgLy8gcmVkXHJcbiAgICAgICAgYWxwaGFEaWZmRGF0YS5kYXRhWyBpIC0gMiBdID0gZGlmZjsgLy8gZ3JlZW5cclxuICAgICAgICBhbHBoYURpZmZEYXRhLmRhdGFbIGkgLSAxIF0gPSBkaWZmOyAvLyBibHVlXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29sb3JEaWZmRGF0YS5kYXRhWyBpIF0gPSBkaWZmO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGFscGhhSW5kZXggPSAoIGkgLSAoIGkgJSA0ICkgKyAzICk7XHJcbiAgICAgIC8vIGdyYWIgdGhlIGFzc29jaWF0ZWQgYWxwaGEgY2hhbm5lbCBhbmQgbXVsdGlwbHkgaXQgdGltZXMgdGhlIGRpZmZcclxuICAgICAgY29uc3QgYWxwaGFNdWx0aXBsaWVkRGlmZiA9ICggaSAlIDQgPT09IDMgKSA/IGRpZmYgOiBkaWZmICogKCBhLmRhdGFbIGFscGhhSW5kZXggXSAvIDI1NSApICogKCBiLmRhdGFbIGFscGhhSW5kZXggXSAvIDI1NSApO1xyXG5cclxuICAgICAgdG90YWxEaWZmZXJlbmNlICs9IGFscGhhTXVsdGlwbGllZERpZmY7XHJcbiAgICAgIC8vIGlmICggYWxwaGFNdWx0aXBsaWVkRGlmZiA+IHRocmVzaG9sZCApIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coIG1lc3NhZ2UgKyAnOiAnICsgTWF0aC5hYnMoIGEuZGF0YVtpXSAtIGIuZGF0YVtpXSApICk7XHJcbiAgICAgIGxhcmdlc3REaWZmZXJlbmNlID0gTWF0aC5tYXgoIGxhcmdlc3REaWZmZXJlbmNlLCBhbHBoYU11bHRpcGxpZWREaWZmICk7XHJcbiAgICAgIC8vIGlzRXF1YWwgPSBmYWxzZTtcclxuICAgICAgLy8gYnJlYWs7XHJcbiAgICAgIC8vIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdmVyYWdlRGlmZmVyZW5jZSA9IHRvdGFsRGlmZmVyZW5jZSAvICggNCAqIGEud2lkdGggKiBhLmhlaWdodCApO1xyXG5cclxuICAgIGlmICggYXZlcmFnZURpZmZlcmVuY2UgPiB0aHJlc2hvbGQgKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgYTogZGF0YVRvQ2FudmFzKCBhLCB3aWR0aCwgaGVpZ2h0ICksXHJcbiAgICAgICAgYjogZGF0YVRvQ2FudmFzKCBiLCB3aWR0aCwgaGVpZ2h0ICksXHJcbiAgICAgICAgZGlmZjogZGF0YVRvQ2FudmFzKCBjb2xvckRpZmZEYXRhLCB3aWR0aCwgaGVpZ2h0ICksXHJcbiAgICAgICAgbGFyZ2VzdERpZmZlcmVuY2U6IGxhcmdlc3REaWZmZXJlbmNlLFxyXG4gICAgICAgIGF2ZXJhZ2VEaWZmZXJlbmNlOiBhdmVyYWdlRGlmZmVyZW5jZVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfTtcclxuXHJcbiAgY2xhc3MgU25hcHNob3Qge1xyXG5cclxuICAgIHJlYWRvbmx5IHJ1bm5hYmxlOiBzdHJpbmc7XHJcbiAgICByZWFkb25seSBicmFuZDogc3RyaW5nO1xyXG4gICAgcmVhZG9ubHkgZnJhbWVzOiBGcmFtZVtdID0gW107XHJcbiAgICByZWFkb25seSBmcmFtZUNvdW50UHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcbiAgICByZWFkb25seSBoYXNoUHJvcGVydHk6IFByb3BlcnR5PHN0cmluZyB8IG51bGw+O1xyXG4gICAgcmVhZG9ubHkgaGFzRXJyb3JlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuICAgIHJlYWRvbmx5IGlzQ29tcGxldGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgICByZWFkb25seSBjb2x1bW46IENvbHVtbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggcnVubmFibGU6IHN0cmluZywgYnJhbmQ6IHN0cmluZywgY29sdW1uOiBDb2x1bW4gKSB7XHJcbiAgICAgIHRoaXMucnVubmFibGUgPSBydW5uYWJsZTtcclxuICAgICAgdGhpcy5icmFuZCA9IGJyYW5kO1xyXG4gICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcclxuICAgICAgdGhpcy5mcmFtZUNvdW50UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuICAgICAgdGhpcy5oYXNoUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8c3RyaW5nIHwgbnVsbCA+KCBudWxsICk7XHJcbiAgICAgIHRoaXMuaGFzRXJyb3JlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgICAgdGhpcy5pc0NvbXBsZXRlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEZyYW1lKCBmcmFtZTogRnJhbWUgKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZnJhbWVzLnB1c2goIGZyYW1lICk7XHJcbiAgICAgIHRoaXMuZnJhbWVDb3VudFByb3BlcnR5LnZhbHVlKys7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkSGFzaCggaGFzaDogc3RyaW5nICk6IHZvaWQge1xyXG4gICAgICB0aGlzLmhhc2hQcm9wZXJ0eS52YWx1ZSA9IGhhc2g7XHJcbiAgICAgIHRoaXMuaXNDb21wbGV0ZVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRFcnJvcigpOiB2b2lkIHtcclxuICAgICAgdGhpcy5oYXNFcnJvcmVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmlzQ29tcGxldGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBzbmFwc2hvdHRlck1hcCA9IG5ldyBNYXA8bnVtYmVyLCBTbmFwc2hvdHRlcj4oKTtcclxuXHJcbiAgY2xhc3MgU25hcHNob3R0ZXIge1xyXG4gICAgcmVhZG9ubHkgdXJsOiBzdHJpbmc7XHJcbiAgICByZWFkb25seSBpbmRleDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudDtcclxuICAgIGN1cnJlbnRTbmFwc2hvdDogU25hcHNob3QgfCBudWxsO1xyXG4gICAgcmVhZG9ubHkgbmV4dFJ1bm5hYmxlOiAoIHNuYXBzaG90dGVyOiBTbmFwc2hvdHRlciApID0+IHZvaWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIHVybDogc3RyaW5nLCBpbmRleDogbnVtYmVyLCBuZXh0UnVubmFibGU6ICggc25hcHNob3R0ZXI6IFNuYXBzaG90dGVyICkgPT4gdm9pZCApIHtcclxuICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcclxuICAgICAgdGhpcy5jdXJyZW50U25hcHNob3QgPSBudWxsO1xyXG4gICAgICB0aGlzLm5leHRSdW5uYWJsZSA9IG5leHRSdW5uYWJsZTtcclxuXHJcbiAgICAgIHRoaXMuaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lmcmFtZScgKTtcclxuICAgICAgdGhpcy5pZnJhbWUuc2V0QXR0cmlidXRlKCAnZnJhbWVib3JkZXInLCAnMCcgKTtcclxuICAgICAgdGhpcy5pZnJhbWUuc2V0QXR0cmlidXRlKCAnc2VhbWxlc3MnLCAnMScgKTtcclxuICAgICAgdGhpcy5pZnJhbWUuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCBvcHRpb25zLnNpbVdpZHRoICk7XHJcbiAgICAgIHRoaXMuaWZyYW1lLnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIG9wdGlvbnMuc2ltSGVpZ2h0ICk7XHJcbiAgICAgIHRoaXMuaWZyYW1lLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuXHJcbiAgICAgIHNuYXBzaG90dGVyTWFwLnNldCggaW5kZXgsIHRoaXMgKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRGcmFtZSggZnJhbWU6IEZyYW1lICk6IHZvaWQge1xyXG4gICAgICB0aGlzLmN1cnJlbnRTbmFwc2hvdCEuYWRkRnJhbWUoIGZyYW1lICk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkSGFzaCggaGFzaDogc3RyaW5nICk6IHZvaWQge1xyXG4gICAgICB0aGlzLmN1cnJlbnRTbmFwc2hvdCEuYWRkSGFzaCggaGFzaCApO1xyXG4gICAgICB0aGlzLm5leHRSdW5uYWJsZSggdGhpcyApO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEVycm9yKCk6IHZvaWQge1xyXG4gICAgICB0aGlzLmN1cnJlbnRTbmFwc2hvdCEuYWRkRXJyb3IoKTtcclxuICAgICAgdGhpcy5uZXh0UnVubmFibGUoIHRoaXMgKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkKCBzbmFwc2hvdDogU25hcHNob3QgKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuY3VycmVudFNuYXBzaG90ID0gc25hcHNob3Q7XHJcblxyXG4gICAgICBjb25zdCBzaW1RdWVyeVBhcmFtZXRlcnMgPSBlbmNvZGVVUklDb21wb25lbnQoICggc25hcHNob3QuYnJhbmQgPT09ICdwaGV0LWlvJyA/ICdicmFuZD1waGV0LWlvJmVhJnBoZXRpb1N0YW5kYWxvbmUnIDogJ2JyYW5kPXBoZXQmZWEnICkgKyBvcHRpb25zLmFkZGl0aW9uYWxTaW1RdWVyeVBhcmFtZXRlcnMgKTtcclxuICAgICAgY29uc3QgdXJsID0gZW5jb2RlVVJJQ29tcG9uZW50KCBgLi4vLi4vJHtzbmFwc2hvdC5ydW5uYWJsZX0vJHtzbmFwc2hvdC5ydW5uYWJsZX1fZW4uaHRtbGAgKTtcclxuICAgICAgdGhpcy5pZnJhbWUuc3JjID0gYCR7dGhpcy51cmx9L2FxdWEvaHRtbC90YWtlLXNuYXBzaG90Lmh0bWw/aWQ9JHt0aGlzLmluZGV4fSYke2NoaWxkUXVlcnlQYXJhbXN9JnVybD0ke3VybH0mc2ltUXVlcnlQYXJhbWV0ZXJzPSR7c2ltUXVlcnlQYXJhbWV0ZXJzfWA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBDb2x1bW4ge1xyXG4gICAgcmVhZG9ubHkgdXJsOiBzdHJpbmc7XHJcbiAgICByZWFkb25seSBpbmRleDogbnVtYmVyO1xyXG4gICAgcmVhZG9ubHkgc25hcHNob3RzOiBTbmFwc2hvdFtdO1xyXG4gICAgcXVldWU6IFNuYXBzaG90W107XHJcbiAgICByZWFkb25seSBzbmFwc2hvdHRlcnM6IFNuYXBzaG90dGVyW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoIHVybDogc3RyaW5nLCBpbmRleDogbnVtYmVyICkge1xyXG4gICAgICB0aGlzLnVybCA9IHVybDtcclxuICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICB0aGlzLnNuYXBzaG90cyA9IHJvd3MubWFwKCByb3cgPT4gbmV3IFNuYXBzaG90KCByb3cucnVubmFibGUsIHJvdy5icmFuZCwgdGhpcyApICk7XHJcbiAgICAgIHRoaXMucXVldWUgPSB0aGlzLnNuYXBzaG90cy5zbGljZSgpO1xyXG4gICAgICB0aGlzLnNuYXBzaG90dGVycyA9IF8ucmFuZ2UoIDAsIG9wdGlvbnMuY29waWVzICkubWFwKCBpID0+IG5ldyBTbmFwc2hvdHRlciggdXJsLCBpbmRleCArIGkgKiAxMDAsIHRoaXMubmV4dFJ1bm5hYmxlLmJpbmQoIHRoaXMgKSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U25hcHNob3QoIHJ1bm5hYmxlOiBzdHJpbmcgKTogU25hcHNob3Qge1xyXG4gICAgICByZXR1cm4gXy5maW5kKCB0aGlzLnNuYXBzaG90cywgc25hcHNob3QgPT4gc25hcHNob3QucnVubmFibGUgPT09IHJ1bm5hYmxlICkhO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRSdW5uYWJsZSggc25hcHNob3R0ZXI6IFNuYXBzaG90dGVyICk6IHZvaWQge1xyXG4gICAgICBpZiAoIHRoaXMucXVldWUubGVuZ3RoICkge1xyXG4gICAgICAgIGNvbnN0IHNuYXBzaG90ID0gdGhpcy5xdWV1ZS5zaGlmdCgpITtcclxuXHJcbiAgICAgICAgc25hcHNob3R0ZXIubG9hZCggc25hcHNob3QgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCk6IHZvaWQge1xyXG4gICAgICB0aGlzLnNuYXBzaG90dGVycy5mb3JFYWNoKCBzbmFwc2hvdHRlciA9PiB0aGlzLm5leHRSdW5uYWJsZSggc25hcHNob3R0ZXIgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgY29sdW1uczogQ29sdW1uW10gPSBvcHRpb25zLnVybHMubWFwKCAoIHVybCwgaSApID0+IG5ldyBDb2x1bW4oIHVybCwgaSApICk7XHJcblxyXG4gIGNvbnN0IHNjZW5lID0gbmV3IE5vZGUoKTtcclxuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHNjZW5lLCB7XHJcbiAgICB3aWR0aDogNTEyLFxyXG4gICAgaGVpZ2h0OiA1MTIsXHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9yLlRSQU5TUEFSRU5ULFxyXG4gICAgcGFzc2l2ZUV2ZW50czogdHJ1ZVxyXG4gIH0gKTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcclxuICBkaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcclxuXHJcbiAgY29uc3QgZ3JpZEJveCA9IG5ldyBHcmlkQm94KCB7XHJcbiAgICB4QWxpZ246ICdsZWZ0JyxcclxuICAgIG1hcmdpbjogMlxyXG4gIH0gKTtcclxuICBjb25zdCBncmlkQ2hpbGRyZW46IE5vZGVbXSA9IFtdO1xyXG4gIHNjZW5lLmFkZENoaWxkKCBuZXcgR3JpZEJhY2tncm91bmROb2RlKCBncmlkQm94LmNvbnN0cmFpbnQsIHtcclxuICAgIGNyZWF0ZUNlbGxCYWNrZ3JvdW5kOiAoIGNlbGw6IEdyaWRDZWxsICkgPT4ge1xyXG4gICAgICByZXR1cm4gUmVjdGFuZ2xlLmJvdW5kcyggY2VsbC5sYXN0QXZhaWxhYmxlQm91bmRzLCB7XHJcbiAgICAgICAgZmlsbDogY2VsbC5wb3NpdGlvbi52ZXJ0aWNhbCAlIDIgPT09IDAgPyAnd2hpdGUnIDogJyNlZWUnXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9ICkgKTtcclxuICBzY2VuZS5hZGRDaGlsZCggZ3JpZEJveCApO1xyXG5cclxuICBsZXQgeSA9IDA7XHJcblxyXG4gIGNvbHVtbnMuZm9yRWFjaCggKCBjb2x1bW4sIGkgKSA9PiB7XHJcbiAgICBncmlkQ2hpbGRyZW4ucHVzaCggbmV3IFRleHQoIGAke2NvbHVtbi51cmx9YCwge1xyXG4gICAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiAxMiwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gICAgICBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogaSArIDEsIHJvdzogeSwgeEFsaWduOiAnY2VudGVyJyB9XHJcbiAgICB9ICkgKTtcclxuICB9ICk7XHJcbiAgeSsrO1xyXG5cclxuICBjb2x1bW5zLmZvckVhY2goICggY29sdW1uLCBpICkgPT4ge1xyXG4gICAgY29sdW1uLnNuYXBzaG90dGVycy5mb3JFYWNoKCAoIHNuYXBzaG90dGVyLCBqICkgPT4ge1xyXG4gICAgICBncmlkQ2hpbGRyZW4ucHVzaCggbmV3IERPTSggc25hcHNob3R0ZXIuaWZyYW1lLCB7XHJcbiAgICAgICAgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IGkgKyAxLCByb3c6IHkgKyBqIH1cclxuICAgICAgfSApICk7XHJcbiAgICB9ICk7XHJcbiAgfSApO1xyXG4gIHkgKz0gb3B0aW9ucy5jb3BpZXM7XHJcblxyXG4gIGNvbnN0IHJ1bm5hYmxlWU1hcCA9IHt9O1xyXG4gIHJvd3MuZm9yRWFjaCggKCByb3csIGkgKSA9PiB7XHJcbiAgICBjb25zdCBydW5uYWJsZSA9IHJvdy5ydW5uYWJsZTtcclxuICAgIGNvbnN0IGJyYW5kID0gcm93LmJyYW5kO1xyXG4gICAgcnVubmFibGVZTWFwWyBydW5uYWJsZSBdID0geTtcclxuXHJcbiAgICBjb25zdCBydW5uYWJsZVRleHQgPSBuZXcgVGV4dCggcnVubmFibGUgKyAoIGJyYW5kICE9PSAncGhldCcgPyBgICgke2JyYW5kfSlgIDogJycgKSwge1xyXG4gICAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiAxMiB9ICksXHJcbiAgICAgIGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAwLCByb3c6IHkgfSxcclxuICAgICAgb3BhY2l0eTogdW5yZWxpYWJsZVNpbXMuaW5jbHVkZXMoIHJ1bm5hYmxlICkgPyAwLjIgOiAxXHJcbiAgICB9ICk7XHJcbiAgICBncmlkQ2hpbGRyZW4ucHVzaCggcnVubmFibGVUZXh0ICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggXy5mbGF0dGVuKCBjb2x1bW5zLm1hcCggY29sdW1uID0+IHtcclxuICAgICAgY29uc3Qgc25hcHNob3QgPSBjb2x1bW4uZ2V0U25hcHNob3QoIHJ1bm5hYmxlICk7XHJcbiAgICAgIHJldHVybiBbIHNuYXBzaG90Lmhhc0Vycm9yZWRQcm9wZXJ0eSwgc25hcHNob3QuaGFzaFByb3BlcnR5LCBzbmFwc2hvdC5pc0NvbXBsZXRlUHJvcGVydHkgXTtcclxuICAgIH0gKSApLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNuYXBzaG90cyA9IGNvbHVtbnMubWFwKCBjb2x1bW4gPT4gY29sdW1uLmdldFNuYXBzaG90KCBydW5uYWJsZSApICk7XHJcbiAgICAgIGlmICggXy5ldmVyeSggc25hcHNob3RzLCBzbmFwc2hvdCA9PiBzbmFwc2hvdC5pc0NvbXBsZXRlUHJvcGVydHkudmFsdWUgKSApIHtcclxuICAgICAgICBpZiAoIF8uc29tZSggc25hcHNob3RzLCBzbmFwc2hvdCA9PiBzbmFwc2hvdC5oYXNFcnJvcmVkUHJvcGVydHkudmFsdWUgKSApIHtcclxuICAgICAgICAgIHJ1bm5hYmxlVGV4dC5maWxsID0gJ21hZ2VudGEnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGhhc2ggPSBzbmFwc2hvdHNbIDAgXS5oYXNoUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgICBpZiAoIF8uZXZlcnkoIHNuYXBzaG90cywgc25hcHNob3QgPT4gc25hcHNob3QuaGFzaFByb3BlcnR5LnZhbHVlID09PSBoYXNoICkgKSB7XHJcbiAgICAgICAgICAgIHJ1bm5hYmxlVGV4dC5maWxsID0gJyMwYjAnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJ1bm5hYmxlVGV4dC5maWxsID0gJyNiMDAnO1xyXG5cclxuICAgICAgICAgICAgcnVubmFibGVUZXh0LmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICAgICAgcnVubmFibGVUZXh0LmFkZElucHV0TGlzdGVuZXIoIG5ldyBGaXJlTGlzdGVuZXIoIHtcclxuICAgICAgICAgICAgICBmaXJlOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdEZyYW1lcyA9IHNuYXBzaG90c1sgMCBdLmZyYW1lcztcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVJbWFnZU5vZGUgPSAoIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgKTogTm9kZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCBjYW52YXMgKTtcclxuICAgICAgICAgICAgICAgICAgaW1hZ2UuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgICAgICAgICAgICBpbWFnZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlyZTogKCkgPT4gbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KCBjYW52YXMudG9EYXRhVVJMKCkgKVxyXG4gICAgICAgICAgICAgICAgICB9ICkgKTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGltYWdlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZmlyc3RGcmFtZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gc25hcHNob3RzWyAwIF0uZnJhbWVzWyBpIF07XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRpZmZJbWFnZXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIGZvciAoIGxldCBqID0gMTsgaiA8IHNuYXBzaG90cy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdGhlckZyYW1lID0gc25hcHNob3RzWyBqIF0uZnJhbWVzWyBpIF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBjb21wYXJlSW1hZ2VzKCBmcmFtZS5zY3JlZW5zaG90LnVybCwgb3RoZXJGcmFtZS5zY3JlZW5zaG90LnVybCwgb3B0aW9ucy5zaW1XaWR0aCwgb3B0aW9ucy5zaW1IZWlnaHQgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coIGRhdGEgKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGRhdGEgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoIGRpZmZJbWFnZXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmSW1hZ2VzLnB1c2goIGNyZWF0ZUltYWdlTm9kZSggZGF0YS5hICkgKTtcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgIGRpZmZJbWFnZXMucHVzaCggY3JlYXRlSW1hZ2VOb2RlKCBkYXRhLmIgKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgZGlmZkltYWdlcy5wdXNoKCBjcmVhdGVJbWFnZU5vZGUoIGRhdGEuZGlmZiApICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICBncmlkQ2hpbGRyZW4ucHVzaCggbmV3IEZsb3dCb3goIHtcclxuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBkaWZmSW1hZ2VzLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IHNuYXBzaG90cy5sZW5ndGggKyAxICsgaW5kZXgrKywgcm93OiBydW5uYWJsZVlNYXBbIHJ1bm5hYmxlIF0sIHhBbGlnbjogJ2xlZnQnIH1cclxuICAgICAgICAgICAgICAgICAgfSApICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBncmlkQm94LmNoaWxkcmVuID0gZ3JpZENoaWxkcmVuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSApICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJ1bm5hYmxlVGV4dC5maWxsID0gJ2JsYWNrJztcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbHVtbnMuZm9yRWFjaCggKCBjb2x1bW4sIGogKSA9PiB7XHJcbiAgICAgIGNvbnN0IHNuYXBzaG90ID0gY29sdW1uLnNuYXBzaG90c1sgaSBdO1xyXG5cclxuICAgICAgY29uc3QgaGFzaFRleHQgPSBuZXcgVGV4dCggJy0nLCB7XHJcbiAgICAgICAgZm9udDogbmV3IEZvbnQoIHsgc2l6ZTogMTAsIGZhbWlseTogJ01lbmxvLCBDb25zb2xhcywgQ291cmllciwgbW9ub3NwYWNlJyB9IClcclxuICAgICAgfSApO1xyXG4gICAgICBzbmFwc2hvdC5oYXNoUHJvcGVydHkubGluayggaGFzaCA9PiB7XHJcbiAgICAgICAgaGFzaFRleHQuc3RyaW5nID0gaGFzaCB8fCAnLSc7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IGZyYW1lVGV4dCA9IG5ldyBUZXh0KCAnMCcsIHtcclxuICAgICAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiAxMiB9IClcclxuICAgICAgfSApO1xyXG4gICAgICBzbmFwc2hvdC5mcmFtZUNvdW50UHJvcGVydHkubGluayggZnJhbWVDb3VudCA9PiB7XHJcbiAgICAgICAgZnJhbWVUZXh0LnN0cmluZyA9IGZyYW1lQ291bnQ7XHJcbiAgICAgIH0gKTtcclxuICAgICAgc25hcHNob3QuaGFzRXJyb3JlZFByb3BlcnR5LmxpbmsoIGhhc0Vycm9yZWQgPT4ge1xyXG4gICAgICAgIGZyYW1lVGV4dC5maWxsID0gaGFzRXJyb3JlZCA/ICcjZjAwJyA6ICcjYmJiJztcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgZ3JpZENoaWxkcmVuLnB1c2goIG5ldyBGbG93Qm94KCB7XHJcbiAgICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgICBzcGFjaW5nOiAyMCxcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgZnJhbWVUZXh0LCBoYXNoVGV4dFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IGogKyAxLCByb3c6IHksIHhBbGlnbjogJ2NlbnRlcicgfVxyXG4gICAgICB9ICkgKTtcclxuICAgIH0gKTtcclxuICAgIHkrKztcclxuICB9ICk7XHJcblxyXG4gIGdyaWRCb3guY2hpbGRyZW4gPSBncmlkQ2hpbGRyZW47XHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbWVzc2FnZScsIGV2dCA9PiB7XHJcbiAgICBpZiAoIHR5cGVvZiBldnQuZGF0YSAhPT0gJ3N0cmluZycgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSggZXZ0LmRhdGEgKTtcclxuXHJcbiAgICBpZiAoIGRhdGEudHlwZSA9PT0gJ2ZyYW1lRW1pdHRlZCcgKSB7XHJcbiAgICAgIC8vIG51bWJlciwgc2NyZWVuc2hvdDogeyB1cmwsIGhhc2ggfVxyXG4gICAgICBzbmFwc2hvdHRlck1hcC5nZXQoIGRhdGEuaWQgKSEuYWRkRnJhbWUoIGRhdGEgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBkYXRhLnR5cGUgPT09ICdzbmFwc2hvdCcgKSB7XHJcbiAgICAgIC8vIGJhc2ljYWxseSBoYXNoXHJcbiAgICAgIHNuYXBzaG90dGVyTWFwLmdldCggZGF0YS5pZCApIS5hZGRIYXNoKCBkYXRhLmhhc2ggKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBkYXRhLnR5cGUgPT09ICdlcnJvcicgKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCAnZGF0YScgKTtcclxuICAgICAgc25hcHNob3R0ZXJNYXAuZ2V0KCBkYXRhLmlkICkhLmFkZEVycm9yKCk7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICAvLyBLaWNrIG9mZiBpbml0aWFsXHJcbiAgY29sdW1ucy5mb3JFYWNoKCBjb2x1bW4gPT4gY29sdW1uLnN0YXJ0KCkgKTtcclxuXHJcbiAgZGlzcGxheS51cGRhdGVPblJlcXVlc3RBbmltYXRpb25GcmFtZSggZHQgPT4ge1xyXG4gICAgZGlzcGxheS53aWR0aCA9IE1hdGguY2VpbCggTWF0aC5tYXgoIHdpbmRvdy5pbm5lcldpZHRoLCBzY2VuZS5yaWdodCApICk7XHJcbiAgICBkaXNwbGF5LmhlaWdodCA9IE1hdGguY2VpbCggTWF0aC5tYXgoIHdpbmRvdy5pbm5lckhlaWdodCwgc2NlbmUuYm90dG9tICkgKTtcclxuICB9ICk7XHJcbn0gKSgpO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sa0NBQWtDO0FBQzlELE9BQU9DLFNBQVMsTUFBTSw0QkFBNEI7QUFDbEQsT0FBT0MsY0FBYyxNQUFNLGlDQUFpQztBQUM1RCxPQUFPQyxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELFNBQVNDLEtBQUssRUFBRUMsT0FBTyxFQUFFQyxHQUFHLEVBQUVDLFlBQVksRUFBRUMsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLGtCQUFrQixFQUFFQyxPQUFPLEVBQVlDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSw2QkFBNkI7QUFVbkssQ0FBRSxZQUFZO0VB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