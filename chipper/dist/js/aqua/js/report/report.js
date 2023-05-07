// Copyright 2020-2023, University of Colorado Boulder

/**
 * Displays a self-updating report of continuous test results.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../axon/js/EnumerationDeprecatedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import Property from '../../../axon/js/Property.js';
import Utils from '../../../dot/js/Utils.js';
import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Display, DOM, FireListener, HBox, Node, Rectangle, Text, VBox } from '../../../scenery/js/imports.js';
import TextPushButton from '../../../sun/js/buttons/TextPushButton.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import constants from './constants.js';
import { default as popup, popupIframeProperty } from './popup.js';
import quickNode from './quickNode.js';
import request from './request.js';
import sleep from './sleep.js';
import { default as statusProperty, lastErrorProperty, startupTimestampProperty } from './statusProperty.js';

// window.assertions.enableAssert();

const options = QueryStringMachine.getAll({
  maxColumns: {
    type: 'number',
    defaultValue: -1 // when -1, will show all columns
  },

  // Initial population of the filter text input.
  filterString: {
    type: 'string',
    defaultValue: ''
  },
  // Errors like 'window.location probably changed' can be distracting, so allow omitting them, see https://github.com/phetsims/aqua/issues/173
  showBeforeUnloadErrors: {
    type: 'flag'
  },
  full: {
    type: 'boolean',
    defaultValue: true
  }
});
const isOnBeforeUnloadMessage = message => message.includes('window.location probably changed');
const rootNode = new Node();
const display = new Display(rootNode, {
  passiveEvents: true
});
document.body.appendChild(display.domElement);
const backgroundNode = new Rectangle({
  fill: 'white'
});
rootNode.addChild(backgroundNode);
let contentNode;
if (options.full) {
  statusProperty.lazyLink(status => console.log(`Status: ${status}`));

  // {Property.<Object|null>}
  const reportProperty = new Property({
    snapshots: [],
    // latest snapshots first
    testNames: [],
    testAverageTimes: [],
    testWeights: []
  });
  window.reportProperty = reportProperty;
  const prepareReport = report => {
    report && report.snapshots && report.snapshots.forEach(snapshot => {
      snapshot.tests.forEach(test => {
        test.failedIgnoreLocationChangeCount = test.n;
        if (test.m && !options.showBeforeUnloadErrors) {
          test.m.forEach(message => {
            if (isOnBeforeUnloadMessage(message)) {
              test.failedIgnoreLocationChangeCount -= 1;
            }
          });
        }
      });
    });
    return report;
  };

  // Report loop
  (async () => {
    while (true) {
      // eslint-disable-line no-constant-condition
      const result = await request('/aquaserver/report');
      if (result) {
        reportProperty.value = prepareReport(result);
      }
      await sleep(20000);
    }
  })();

  // {Property.<Array.<string>>} - Which repos to expand!
  const expandedReposProperty = new Property([]);

  // {Property.<string>}
  const filterStringProperty = new Property(options.filterString);
  const Sort = EnumerationDeprecated.byKeys(['ALPHABETICAL', 'IMPORTANCE', 'AVERAGE_TIME', 'WEIGHT']);

  // {Property.<Sort>}
  const sortProperty = new EnumerationDeprecatedProperty(Sort, Sort.ALPHABETICAL);

  // Property.<boolean>}
  const showAverageTimeProperty = new BooleanProperty(false);
  const showWeightsProperty = new BooleanProperty(false);
  const statusNode = new Text('', {
    font: constants.interfaceFont,
    cursor: 'pointer'
  });
  Multilink.multilink([statusProperty, startupTimestampProperty, lastErrorProperty], (status, startupTimestamp, lastError) => {
    if (startupTimestamp) {
      statusNode.string = `${lastError.length ? '[ERR] ' : ''}Running since [${new Date(startupTimestamp).toLocaleString()}], status: ${status}`;
    } else {
      statusNode.string = `${lastError.length ? '[ERR] ' : ''}status: ${status}`;
    }
  });
  statusNode.addInputListener(new FireListener({
    fire: () => {
      if (lastErrorProperty.value.length) {
        popup(statusNode, lastErrorProperty.value);
      }
    }
  }));
  const reportNode = new Node();
  const filterElement = document.createElement('input');
  filterElement.type = 'text';
  filterElement.value = filterStringProperty.value; // initial value from options

  filterElement.addEventListener('change', () => {
    filterStringProperty.value = filterElement.value;
  });
  const filterNode = new HBox({
    spacing: 5,
    children: [new Text('Filter:', {
      font: constants.interfaceFont
    }), new DOM(filterElement)]
  });
  const sortNode = new VBox({
    spacing: 5,
    children: [new Text('Sort', {
      font: constants.categoryFont
    }), new VerticalAquaRadioButtonGroup(sortProperty, [{
      value: Sort.ALPHABETICAL,
      createNode: () => new Text('Alphabetical', {
        font: constants.interfaceFont
      })
    }, {
      value: Sort.IMPORTANCE,
      createNode: () => new Text('Importance', {
        font: constants.interfaceFont
      })
    }, {
      value: Sort.AVERAGE_TIME,
      createNode: () => new Text('Average Time', {
        font: constants.interfaceFont
      })
    }, {
      value: Sort.WEIGHT,
      createNode: () => new Text('Weight', {
        font: constants.interfaceFont
      })
    }], {
      spacing: 5
    })]
  });
  const expansionNode = new VBox({
    spacing: 5,
    children: [new Text('Expansion', {
      font: constants.categoryFont
    }), new TextPushButton('Expand all', {
      listener: () => {
        expandedReposProperty.value = _.uniq(reportProperty.value.testNames.map(names => names[0]));
      },
      baseColor: constants.buttonBaseColor
    }), new TextPushButton('Collapse all', {
      listener: () => {
        expandedReposProperty.value = [];
      },
      baseColor: constants.buttonBaseColor
    })]
  });
  const optionsNode = new VBox({
    spacing: 5,
    children: [new Text('Options', {
      font: constants.categoryFont
    }), new VBox({
      align: 'left',
      spacing: 5,
      children: [new Checkbox(showAverageTimeProperty, new Text('Show average time', {
        font: constants.interfaceFont
      }), {
        boxWidth: 14
      }), new Checkbox(showWeightsProperty, new Text('Show weight', {
        font: constants.interfaceFont
      }), {
        boxWidth: 14
      })]
    })]
  });
  const filteringNode = new VBox({
    spacing: 5,
    children: [new Text('Filtering', {
      font: constants.categoryFont
    }), filterNode, new Text('(tab out to finalize)', {
      font: constants.interfaceFont
    })]
  });
  Multilink.multilink([reportProperty, expandedReposProperty, sortProperty, filterStringProperty, showAverageTimeProperty, showWeightsProperty], (report, expandedRepos, sort, filterString, showAverageTime, showWeights) => {
    let tests = [];
    let snapshots = report.snapshots;
    if (options.maxColumns !== -1) {
      snapshots = snapshots.filter((snapshot, index) => index < options.maxColumns);
    }
    const everythingName = '(everything)';
    tests.push({
      names: [everythingName],
      indices: _.range(0, report.testNames.length),
      averageTimes: report.testAverageTimes,
      weights: report.testWeights
    });

    // scan to determine what tests we are showing
    report.testNames.forEach((names, index) => {
      if (!expandedRepos.includes(names[0])) {
        const lastTest = tests[tests.length - 1];
        if (lastTest && lastTest.names[0] === names[0]) {
          lastTest.indices.push(index);
          lastTest.averageTimes.push(report.testAverageTimes[index]);
          lastTest.weights.push(report.testWeights[index]);
        } else {
          tests.push({
            names: [names[0]],
            indices: [index],
            averageTimes: [report.testAverageTimes[index]],
            weights: [report.testWeights[index]]
          });
        }
      } else {
        tests.push({
          names: names,
          indices: [index],
          averageTimes: [report.testAverageTimes[index]],
          weights: [report.testWeights[index]]
        });
      }
    });

    // compute summations
    tests.forEach(test => {
      test.averageTime = _.mean(test.averageTimes.filter(_.identity)) || 0;
      test.minWeight = _.min(test.weights) || 0;
      test.maxWeight = _.max(test.weights) || 0;
    });
    if (filterString.length) {
      // Spaces separate multiple search terms
      filterString.split(' ').forEach(filterPart => {
        tests = tests.filter(test => {
          const matchesTest = _.some(test.names, name => name.includes(filterPart));
          const matchesErrorMessage = _.some(snapshots, snapshot => _.some(test.indices, index => {
            return snapshot.tests[index].m && _.some(snapshot.tests[index].m, message => message.includes(filterPart));
          }));
          return matchesTest || matchesErrorMessage;
        });
      });
    }
    if (sort === Sort.IMPORTANCE) {
      tests = _.sortBy(tests, test => {
        const failIndex = _.findIndex(snapshots, snapshot => _.some(test.indices, index => snapshot.tests[index].failedIgnoreLocationChangeCount));
        const passIndex = _.findIndex(snapshots, snapshot => _.some(test.indices, index => snapshot.tests[index].y));
        if (failIndex >= 0) {
          return failIndex;
        } else if (passIndex >= 0) {
          return passIndex + 1000;
        } else {
          return 10000;
        }
      });
    } else if (sort === Sort.AVERAGE_TIME) {
      tests = _.sortBy(tests, test => -test.averageTime);
    } else if (sort === Sort.WEIGHT) {
      tests = _.sortBy(tests, test => -test.maxWeight);
    }
    const testLabels = tests.map(test => {
      const label = new Text(test.names.join(' : '), {
        font: constants.interfaceFont,
        left: 0,
        top: 0
      });
      const background = new Rectangle(0, 0, 0, 0, {
        fill: '#fafafa',
        children: [label],
        cursor: 'pointer'
      });
      if (test.names[0] === everythingName) {
        label.fill = '#999';
      }
      background.addInputListener(new FireListener({
        fire: () => {
          const topLevelName = test.names[0];
          if (test.names.length > 1) {
            expandedReposProperty.value = expandedReposProperty.value.filter(name => name !== topLevelName);
          } else {
            expandedReposProperty.value = _.uniq([...expandedReposProperty.value, topLevelName]);
          }
        }
      }));
      return background;
    });
    const averageTimeLabels = showAverageTime ? tests.map(test => {
      const background = new Rectangle(0, 0, 0, 0, {
        fill: '#fafafa'
      });
      if (test.averageTime) {
        const tenthsOfSeconds = Math.ceil(test.averageTime / 100);
        const label = new Text(`${Math.floor(tenthsOfSeconds / 10)}.${tenthsOfSeconds % 10}s`, {
          font: new PhetFont({
            size: 10
          }),
          left: 0,
          top: 0,
          fill: '#888'
        });
        background.addChild(label);
      }
      return background;
    }) : null;
    const weightLabels = showWeights ? tests.map(test => {
      const background = new Rectangle(0, 0, 0, 0, {
        fill: '#fafafa'
      });
      if (test.minWeight || test.maxWeight) {
        const label = new Text(test.minWeight === test.maxWeight ? test.minWeight : `${test.minWeight}-${test.maxWeight}`, {
          font: new PhetFont({
            size: 10
          }),
          left: 0,
          top: 0,
          fill: '#888'
        });
        background.addChild(label);
      }
      return background;
    }) : null;
    const padding = 3;
    const snapshotLabels = snapshots.map((snapshot, index) => {
      const totalTestCount = snapshot.tests.length;
      const completedTestCount = snapshot.tests.filter(x => x.y || x.n).length;
      const failedTestCount = snapshot.tests.filter(x => x.failedIgnoreLocationChangeCount > 0).length;
      const beforeUnloadErrorsCount = snapshot.tests.filter(test => test.m && _.some(test.m, m => isOnBeforeUnloadMessage(m))).length;
      const textOptions = {
        font: new PhetFont({
          size: 10
        })
      };
      const label = new VBox({
        spacing: 2,
        children: [...new Date(snapshot.timestamp).toLocaleString().replace(',', '').replace(' AM', 'am').replace(' PM', 'pm').split(' ').map(str => new Text(str, textOptions)), new Text(`${Utils.roundSymmetric(completedTestCount / totalTestCount * 100)}%`, textOptions)],
        cursor: 'pointer'
      });
      label.addInputListener(new FireListener({
        fire: () => {
          let diffString = '';
          const previousSnapshot = snapshots[index + 1];
          if (previousSnapshot) {
            diffString = _.uniq(Object.keys(snapshot.shas).concat(Object.keys(previousSnapshot.shas))).sort().filter(repo => {
              return snapshot.shas[repo] !== previousSnapshot.shas[repo];
            }).map(repo => `${repo}: ${previousSnapshot.shas[repo]} => ${snapshot.shas[repo]}`).join('\n');
          }
          const completedTests = `${completedTestCount} / ${totalTestCount} Tests Completed`;
          const failedTests = `${failedTestCount} Tests Failed`;
          const beforeUnloadFailedTests = options.showBeforeUnloadErrors ? '' : `\n+${beforeUnloadErrorsCount} more tests failed from "window.location probably changed" errors.`;
          const shas = JSON.stringify(snapshot.shas, null, 2);
          popup(label, `${snapshot.timestamp}\n\n${completedTests}\n${failedTests}${beforeUnloadFailedTests}\n\n${diffString}\n\n${shas}`);
        }
      }));
      return label;
    });
    const maxTestLabelWidth = _.max(testLabels.map(node => node.width));
    const maxTestLabelHeight = _.max(testLabels.map(node => node.height));
    const maxSnapshotLabelWidth = _.max(snapshotLabels.map(node => node.width));
    const maxSnapshotLabelHeight = _.max(snapshotLabels.map(node => node.height));
    const maxAverageTimeLabelWidth = averageTimeLabels ? _.max(averageTimeLabels.map(node => node.width)) : 0;
    const maxWeightLabelWidth = weightLabels ? _.max(weightLabels.map(node => node.width)) : 0;
    testLabels.forEach(label => {
      label.rectWidth = maxTestLabelWidth;
      label.rectHeight = maxTestLabelHeight;
    });
    averageTimeLabels && averageTimeLabels.forEach(label => {
      if (label.children[0]) {
        label.children[0].right = maxAverageTimeLabelWidth;
        label.children[0].centerY = maxTestLabelHeight / 2;
      }
      label.rectWidth = maxAverageTimeLabelWidth;
      label.rectHeight = maxTestLabelHeight;
    });
    weightLabels && weightLabels.forEach(label => {
      if (label.children[0]) {
        label.children[0].right = maxWeightLabelWidth;
        label.children[0].centerY = maxTestLabelHeight / 2;
      }
      label.rectWidth = maxWeightLabelWidth;
      label.rectHeight = maxTestLabelHeight;
    });
    const getX = index => maxTestLabelWidth + padding + index * (maxSnapshotLabelWidth + padding) + (showAverageTime ? 1 : 0) * (maxAverageTimeLabelWidth + padding) + (showWeights ? 1 : 0) * (maxWeightLabelWidth + padding);
    const getY = index => maxSnapshotLabelHeight + padding + index * (maxTestLabelHeight + padding);
    const snapshotsTestNodes = _.flatten(snapshots.map((snapshot, i) => {
      return tests.map((test, j) => {
        const x = getX(i);
        const y = getY(j);
        const background = new Rectangle(0, 0, maxSnapshotLabelWidth, maxTestLabelHeight, {
          x: x,
          y: y
        });
        let totalCount = 0;
        let untestedCount = 0;
        let unavailableCount = 0;
        let passCount = 0;
        let failCount = 0;
        let messages = [];
        test.indices.forEach(index => {
          totalCount++;
          const snapshotTest = snapshot.tests[index];
          if (typeof snapshotTest.y === 'number') {
            passCount += snapshotTest.y;
            failCount += snapshotTest.failedIgnoreLocationChangeCount;
            if (snapshotTest.y + snapshotTest.n === 0) {
              untestedCount++;
            }
            if (snapshotTest.m) {
              // Omit before-unload errors unless we opt into them with a query parameter.
              const snapshotMessages = snapshotTest.m.filter(message => options.showBeforeUnloadErrors || !isOnBeforeUnloadMessage(message));
              messages = messages.concat(snapshotMessages.map(message => {
                let resultMessage = `${report.testNames[index].join(' : ')}\n${message}\nSnapshot from ${new Date(snapshot.timestamp).toLocaleString()}`;
                while (resultMessage.includes('\n\n\n')) {
                  resultMessage = resultMessage.replace('\n\n\n', '\n\n');
                }
                return resultMessage;
              }));
            }
          } else {
            untestedCount++;
            unavailableCount++;
          }
        });
        const completeRatio = totalCount ? (totalCount - untestedCount) / totalCount : 1;
        if (failCount > 0) {
          if (untestedCount === 0) {
            background.fill = constants.failColor;
          } else {
            background.fill = constants.failColorPartial;
            background.addChild(new Rectangle(0, 0, completeRatio * maxSnapshotLabelWidth, maxTestLabelHeight, {
              fill: constants.failColor
            }));
          }
        } else if (passCount > 0) {
          if (untestedCount === 0) {
            background.fill = constants.passColor;
          } else {
            background.fill = constants.passColorPartial;
            background.addChild(new Rectangle(0, 0, completeRatio * maxSnapshotLabelWidth, maxTestLabelHeight, {
              fill: constants.passColor
            }));
          }
        } else if (unavailableCount > 0) {
          background.fill = constants.unavailableColor;
        } else {
          background.fill = constants.untestedColor;
        }
        if (messages.length) {
          background.addInputListener(new FireListener({
            fire: () => {
              popup(background, messages.join('\n\n----------------------------------\n\n'));
            }
          }));
          background.cursor = 'pointer';
        }
        return background;
      });
    }));
    testLabels.forEach((label, i) => {
      label.left = 0;
      label.top = getY(i);
    });
    snapshotLabels.forEach((label, i) => {
      label.top = 0;
      label.left = getX(i);
    });
    averageTimeLabels && averageTimeLabels.forEach((label, i) => {
      label.left = maxTestLabelWidth + padding;
      label.top = getY(i);
    });
    weightLabels && weightLabels.forEach((label, i) => {
      label.left = maxTestLabelWidth + padding + (showAverageTime ? 1 : 0) * (maxAverageTimeLabelWidth + padding);
      label.top = getY(i);
    });
    reportNode.children = [...testLabels, ...snapshotLabels, ...snapshotsTestNodes, ...(showAverageTime ? averageTimeLabels : []), ...(showWeights ? weightLabels : [])];
  });
  contentNode = new VBox({
    x: 10,
    y: 10,
    spacing: 15,
    align: 'left',
    children: [new Text('Continuous Testing', {
      font: new PhetFont({
        size: 24
      })
    }), statusNode, quickNode, new HBox({
      align: 'top',
      spacing: 25,
      children: [sortNode, expansionNode, optionsNode, filteringNode]
    }), reportNode]
  });
} else {
  contentNode = quickNode;
}
rootNode.addChild(contentNode);
display.addInputListener({
  down: () => {
    if (popupIframeProperty.value) {
      document.body.removeChild(popupIframeProperty.value);
      popupIframeProperty.value = null;
    }
  }
});
display.initializeEvents();
display.updateOnRequestAnimationFrame(dt => {
  backgroundNode.rectWidth = contentNode.width;
  backgroundNode.rectHeight = contentNode.height;
  display.width = Math.max(window.innerWidth, Math.ceil(rootNode.width));
  display.height = Math.max(400, Math.ceil(rootNode.height)) + 100;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIlByb3BlcnR5IiwiVXRpbHMiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJQaGV0Rm9udCIsIkRpc3BsYXkiLCJET00iLCJGaXJlTGlzdGVuZXIiLCJIQm94IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiVGV4dFB1c2hCdXR0b24iLCJDaGVja2JveCIsIlZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAiLCJjb25zdGFudHMiLCJkZWZhdWx0IiwicG9wdXAiLCJwb3B1cElmcmFtZVByb3BlcnR5IiwicXVpY2tOb2RlIiwicmVxdWVzdCIsInNsZWVwIiwic3RhdHVzUHJvcGVydHkiLCJsYXN0RXJyb3JQcm9wZXJ0eSIsInN0YXJ0dXBUaW1lc3RhbXBQcm9wZXJ0eSIsIm9wdGlvbnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJtYXhDb2x1bW5zIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImZpbHRlclN0cmluZyIsInNob3dCZWZvcmVVbmxvYWRFcnJvcnMiLCJmdWxsIiwiaXNPbkJlZm9yZVVubG9hZE1lc3NhZ2UiLCJtZXNzYWdlIiwiaW5jbHVkZXMiLCJyb290Tm9kZSIsImRpc3BsYXkiLCJwYXNzaXZlRXZlbnRzIiwiZG9jdW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJkb21FbGVtZW50IiwiYmFja2dyb3VuZE5vZGUiLCJmaWxsIiwiYWRkQ2hpbGQiLCJjb250ZW50Tm9kZSIsImxhenlMaW5rIiwic3RhdHVzIiwiY29uc29sZSIsImxvZyIsInJlcG9ydFByb3BlcnR5Iiwic25hcHNob3RzIiwidGVzdE5hbWVzIiwidGVzdEF2ZXJhZ2VUaW1lcyIsInRlc3RXZWlnaHRzIiwid2luZG93IiwicHJlcGFyZVJlcG9ydCIsInJlcG9ydCIsImZvckVhY2giLCJzbmFwc2hvdCIsInRlc3RzIiwidGVzdCIsImZhaWxlZElnbm9yZUxvY2F0aW9uQ2hhbmdlQ291bnQiLCJuIiwibSIsInJlc3VsdCIsInZhbHVlIiwiZXhwYW5kZWRSZXBvc1Byb3BlcnR5IiwiZmlsdGVyU3RyaW5nUHJvcGVydHkiLCJTb3J0IiwiYnlLZXlzIiwic29ydFByb3BlcnR5IiwiQUxQSEFCRVRJQ0FMIiwic2hvd0F2ZXJhZ2VUaW1lUHJvcGVydHkiLCJzaG93V2VpZ2h0c1Byb3BlcnR5Iiwic3RhdHVzTm9kZSIsImZvbnQiLCJpbnRlcmZhY2VGb250IiwiY3Vyc29yIiwibXVsdGlsaW5rIiwic3RhcnR1cFRpbWVzdGFtcCIsImxhc3RFcnJvciIsInN0cmluZyIsImxlbmd0aCIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsImFkZElucHV0TGlzdGVuZXIiLCJmaXJlIiwicmVwb3J0Tm9kZSIsImZpbHRlckVsZW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImZpbHRlck5vZGUiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJzb3J0Tm9kZSIsImNhdGVnb3J5Rm9udCIsImNyZWF0ZU5vZGUiLCJJTVBPUlRBTkNFIiwiQVZFUkFHRV9USU1FIiwiV0VJR0hUIiwiZXhwYW5zaW9uTm9kZSIsImxpc3RlbmVyIiwiXyIsInVuaXEiLCJtYXAiLCJuYW1lcyIsImJhc2VDb2xvciIsImJ1dHRvbkJhc2VDb2xvciIsIm9wdGlvbnNOb2RlIiwiYWxpZ24iLCJib3hXaWR0aCIsImZpbHRlcmluZ05vZGUiLCJleHBhbmRlZFJlcG9zIiwic29ydCIsInNob3dBdmVyYWdlVGltZSIsInNob3dXZWlnaHRzIiwiZmlsdGVyIiwiaW5kZXgiLCJldmVyeXRoaW5nTmFtZSIsInB1c2giLCJpbmRpY2VzIiwicmFuZ2UiLCJhdmVyYWdlVGltZXMiLCJ3ZWlnaHRzIiwibGFzdFRlc3QiLCJhdmVyYWdlVGltZSIsIm1lYW4iLCJpZGVudGl0eSIsIm1pbldlaWdodCIsIm1pbiIsIm1heFdlaWdodCIsIm1heCIsInNwbGl0IiwiZmlsdGVyUGFydCIsIm1hdGNoZXNUZXN0Iiwic29tZSIsIm5hbWUiLCJtYXRjaGVzRXJyb3JNZXNzYWdlIiwic29ydEJ5IiwiZmFpbEluZGV4IiwiZmluZEluZGV4IiwicGFzc0luZGV4IiwieSIsInRlc3RMYWJlbHMiLCJsYWJlbCIsImpvaW4iLCJsZWZ0IiwidG9wIiwiYmFja2dyb3VuZCIsInRvcExldmVsTmFtZSIsImF2ZXJhZ2VUaW1lTGFiZWxzIiwidGVudGhzT2ZTZWNvbmRzIiwiTWF0aCIsImNlaWwiLCJmbG9vciIsInNpemUiLCJ3ZWlnaHRMYWJlbHMiLCJwYWRkaW5nIiwic25hcHNob3RMYWJlbHMiLCJ0b3RhbFRlc3RDb3VudCIsImNvbXBsZXRlZFRlc3RDb3VudCIsIngiLCJmYWlsZWRUZXN0Q291bnQiLCJiZWZvcmVVbmxvYWRFcnJvcnNDb3VudCIsInRleHRPcHRpb25zIiwidGltZXN0YW1wIiwicmVwbGFjZSIsInN0ciIsInJvdW5kU3ltbWV0cmljIiwiZGlmZlN0cmluZyIsInByZXZpb3VzU25hcHNob3QiLCJPYmplY3QiLCJrZXlzIiwic2hhcyIsImNvbmNhdCIsInJlcG8iLCJjb21wbGV0ZWRUZXN0cyIsImZhaWxlZFRlc3RzIiwiYmVmb3JlVW5sb2FkRmFpbGVkVGVzdHMiLCJKU09OIiwic3RyaW5naWZ5IiwibWF4VGVzdExhYmVsV2lkdGgiLCJub2RlIiwid2lkdGgiLCJtYXhUZXN0TGFiZWxIZWlnaHQiLCJoZWlnaHQiLCJtYXhTbmFwc2hvdExhYmVsV2lkdGgiLCJtYXhTbmFwc2hvdExhYmVsSGVpZ2h0IiwibWF4QXZlcmFnZVRpbWVMYWJlbFdpZHRoIiwibWF4V2VpZ2h0TGFiZWxXaWR0aCIsInJlY3RXaWR0aCIsInJlY3RIZWlnaHQiLCJyaWdodCIsImNlbnRlclkiLCJnZXRYIiwiZ2V0WSIsInNuYXBzaG90c1Rlc3ROb2RlcyIsImZsYXR0ZW4iLCJpIiwiaiIsInRvdGFsQ291bnQiLCJ1bnRlc3RlZENvdW50IiwidW5hdmFpbGFibGVDb3VudCIsInBhc3NDb3VudCIsImZhaWxDb3VudCIsIm1lc3NhZ2VzIiwic25hcHNob3RUZXN0Iiwic25hcHNob3RNZXNzYWdlcyIsInJlc3VsdE1lc3NhZ2UiLCJjb21wbGV0ZVJhdGlvIiwiZmFpbENvbG9yIiwiZmFpbENvbG9yUGFydGlhbCIsInBhc3NDb2xvciIsInBhc3NDb2xvclBhcnRpYWwiLCJ1bmF2YWlsYWJsZUNvbG9yIiwidW50ZXN0ZWRDb2xvciIsImRvd24iLCJyZW1vdmVDaGlsZCIsImluaXRpYWxpemVFdmVudHMiLCJ1cGRhdGVPblJlcXVlc3RBbmltYXRpb25GcmFtZSIsImR0IiwiaW5uZXJXaWR0aCJdLCJzb3VyY2VzIjpbInJlcG9ydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyBhIHNlbGYtdXBkYXRpbmcgcmVwb3J0IG9mIGNvbnRpbnVvdXMgdGVzdCByZXN1bHRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IERpc3BsYXksIERPTSwgRmlyZUxpc3RlbmVyLCBIQm94LCBOb2RlLCBSZWN0YW5nbGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL1ZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4vY29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHsgZGVmYXVsdCBhcyBwb3B1cCwgcG9wdXBJZnJhbWVQcm9wZXJ0eSB9IGZyb20gJy4vcG9wdXAuanMnO1xyXG5pbXBvcnQgcXVpY2tOb2RlIGZyb20gJy4vcXVpY2tOb2RlLmpzJztcclxuaW1wb3J0IHJlcXVlc3QgZnJvbSAnLi9yZXF1ZXN0LmpzJztcclxuaW1wb3J0IHNsZWVwIGZyb20gJy4vc2xlZXAuanMnO1xyXG5pbXBvcnQgeyBkZWZhdWx0IGFzIHN0YXR1c1Byb3BlcnR5LCBsYXN0RXJyb3JQcm9wZXJ0eSwgc3RhcnR1cFRpbWVzdGFtcFByb3BlcnR5IH0gZnJvbSAnLi9zdGF0dXNQcm9wZXJ0eS5qcyc7XHJcblxyXG4vLyB3aW5kb3cuYXNzZXJ0aW9ucy5lbmFibGVBc3NlcnQoKTtcclxuXHJcbmNvbnN0IG9wdGlvbnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcbiAgbWF4Q29sdW1uczoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IC0xIC8vIHdoZW4gLTEsIHdpbGwgc2hvdyBhbGwgY29sdW1uc1xyXG4gIH0sXHJcblxyXG4gIC8vIEluaXRpYWwgcG9wdWxhdGlvbiBvZiB0aGUgZmlsdGVyIHRleHQgaW5wdXQuXHJcbiAgZmlsdGVyU3RyaW5nOiB7XHJcbiAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogJydcclxuICB9LFxyXG5cclxuICAvLyBFcnJvcnMgbGlrZSAnd2luZG93LmxvY2F0aW9uIHByb2JhYmx5IGNoYW5nZWQnIGNhbiBiZSBkaXN0cmFjdGluZywgc28gYWxsb3cgb21pdHRpbmcgdGhlbSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcXVhL2lzc3Vlcy8xNzNcclxuICBzaG93QmVmb3JlVW5sb2FkRXJyb3JzOiB7XHJcbiAgICB0eXBlOiAnZmxhZydcclxuICB9LFxyXG5cclxuICBmdWxsOiB7XHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IHRydWVcclxuICB9XHJcbn0gKTtcclxuXHJcbmNvbnN0IGlzT25CZWZvcmVVbmxvYWRNZXNzYWdlID0gbWVzc2FnZSA9PiBtZXNzYWdlLmluY2x1ZGVzKCAnd2luZG93LmxvY2F0aW9uIHByb2JhYmx5IGNoYW5nZWQnICk7XHJcblxyXG5jb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbmNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUsIHtcclxuICBwYXNzaXZlRXZlbnRzOiB0cnVlXHJcbn0gKTtcclxuXHJcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xyXG5cclxuY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCB7XHJcbiAgZmlsbDogJ3doaXRlJ1xyXG59ICk7XHJcbnJvb3ROb2RlLmFkZENoaWxkKCBiYWNrZ3JvdW5kTm9kZSApO1xyXG5cclxubGV0IGNvbnRlbnROb2RlO1xyXG5cclxuaWYgKCBvcHRpb25zLmZ1bGwgKSB7XHJcblxyXG4gIHN0YXR1c1Byb3BlcnR5LmxhenlMaW5rKCBzdGF0dXMgPT4gY29uc29sZS5sb2coIGBTdGF0dXM6ICR7c3RhdHVzfWAgKSApO1xyXG5cclxuICAvLyB7UHJvcGVydHkuPE9iamVjdHxudWxsPn1cclxuICBjb25zdCByZXBvcnRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSgge1xyXG4gICAgc25hcHNob3RzOiBbXSwgLy8gbGF0ZXN0IHNuYXBzaG90cyBmaXJzdFxyXG4gICAgdGVzdE5hbWVzOiBbXSxcclxuICAgIHRlc3RBdmVyYWdlVGltZXM6IFtdLFxyXG4gICAgdGVzdFdlaWdodHM6IFtdXHJcbiAgfSApO1xyXG5cclxuICB3aW5kb3cucmVwb3J0UHJvcGVydHkgPSByZXBvcnRQcm9wZXJ0eTtcclxuXHJcbiAgY29uc3QgcHJlcGFyZVJlcG9ydCA9IHJlcG9ydCA9PiB7XHJcbiAgICByZXBvcnQgJiYgcmVwb3J0LnNuYXBzaG90cyAmJiByZXBvcnQuc25hcHNob3RzLmZvckVhY2goIHNuYXBzaG90ID0+IHtcclxuICAgICAgc25hcHNob3QudGVzdHMuZm9yRWFjaCggdGVzdCA9PiB7XHJcbiAgICAgICAgdGVzdC5mYWlsZWRJZ25vcmVMb2NhdGlvbkNoYW5nZUNvdW50ID0gdGVzdC5uO1xyXG4gICAgICAgIGlmICggdGVzdC5tICYmICFvcHRpb25zLnNob3dCZWZvcmVVbmxvYWRFcnJvcnMgKSB7XHJcbiAgICAgICAgICB0ZXN0Lm0uZm9yRWFjaCggbWVzc2FnZSA9PiB7XHJcbiAgICAgICAgICAgIGlmICggaXNPbkJlZm9yZVVubG9hZE1lc3NhZ2UoIG1lc3NhZ2UgKSApIHtcclxuICAgICAgICAgICAgICB0ZXN0LmZhaWxlZElnbm9yZUxvY2F0aW9uQ2hhbmdlQ291bnQgLT0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHJlcG9ydDtcclxuICB9O1xyXG5cclxuICAvLyBSZXBvcnQgbG9vcFxyXG4gICggYXN5bmMgKCkgPT4ge1xyXG4gICAgd2hpbGUgKCB0cnVlICkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxyXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXF1ZXN0KCAnL2FxdWFzZXJ2ZXIvcmVwb3J0JyApO1xyXG4gICAgICBpZiAoIHJlc3VsdCApIHtcclxuICAgICAgICByZXBvcnRQcm9wZXJ0eS52YWx1ZSA9IHByZXBhcmVSZXBvcnQoIHJlc3VsdCApO1xyXG4gICAgICB9XHJcbiAgICAgIGF3YWl0IHNsZWVwKCAyMDAwMCApO1xyXG4gICAgfVxyXG4gIH0gKSgpO1xyXG5cclxuICAvLyB7UHJvcGVydHkuPEFycmF5LjxzdHJpbmc+Pn0gLSBXaGljaCByZXBvcyB0byBleHBhbmQhXHJcbiAgY29uc3QgZXhwYW5kZWRSZXBvc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBbXSApO1xyXG5cclxuICAvLyB7UHJvcGVydHkuPHN0cmluZz59XHJcbiAgY29uc3QgZmlsdGVyU3RyaW5nUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG9wdGlvbnMuZmlsdGVyU3RyaW5nICk7XHJcblxyXG4gIGNvbnN0IFNvcnQgPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdBTFBIQUJFVElDQUwnLCAnSU1QT1JUQU5DRScsICdBVkVSQUdFX1RJTUUnLCAnV0VJR0hUJyBdICk7XHJcblxyXG4gIC8vIHtQcm9wZXJ0eS48U29ydD59XHJcbiAgY29uc3Qgc29ydFByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBTb3J0LCBTb3J0LkFMUEhBQkVUSUNBTCApO1xyXG5cclxuICAvLyBQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgY29uc3Qgc2hvd0F2ZXJhZ2VUaW1lUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gIGNvbnN0IHNob3dXZWlnaHRzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICBjb25zdCBzdGF0dXNOb2RlID0gbmV3IFRleHQoICcnLCB7XHJcbiAgICBmb250OiBjb25zdGFudHMuaW50ZXJmYWNlRm9udCxcclxuICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgfSApO1xyXG4gIE11bHRpbGluay5tdWx0aWxpbmsoIFsgc3RhdHVzUHJvcGVydHksIHN0YXJ0dXBUaW1lc3RhbXBQcm9wZXJ0eSwgbGFzdEVycm9yUHJvcGVydHkgXSwgKCBzdGF0dXMsIHN0YXJ0dXBUaW1lc3RhbXAsIGxhc3RFcnJvciApID0+IHtcclxuICAgIGlmICggc3RhcnR1cFRpbWVzdGFtcCApIHtcclxuICAgICAgc3RhdHVzTm9kZS5zdHJpbmcgPSBgJHtsYXN0RXJyb3IubGVuZ3RoID8gJ1tFUlJdICcgOiAnJ31SdW5uaW5nIHNpbmNlIFske25ldyBEYXRlKCBzdGFydHVwVGltZXN0YW1wICkudG9Mb2NhbGVTdHJpbmcoKX1dLCBzdGF0dXM6ICR7c3RhdHVzfWA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc3RhdHVzTm9kZS5zdHJpbmcgPSBgJHtsYXN0RXJyb3IubGVuZ3RoID8gJ1tFUlJdICcgOiAnJ31zdGF0dXM6ICR7c3RhdHVzfWA7XHJcbiAgICB9XHJcbiAgfSApO1xyXG4gIHN0YXR1c05vZGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgZmlyZTogKCkgPT4ge1xyXG4gICAgICBpZiAoIGxhc3RFcnJvclByb3BlcnR5LnZhbHVlLmxlbmd0aCApIHtcclxuICAgICAgICBwb3B1cCggc3RhdHVzTm9kZSwgbGFzdEVycm9yUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gKSApO1xyXG5cclxuICBjb25zdCByZXBvcnROb2RlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgY29uc3QgZmlsdGVyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcclxuICBmaWx0ZXJFbGVtZW50LnR5cGUgPSAndGV4dCc7XHJcbiAgZmlsdGVyRWxlbWVudC52YWx1ZSA9IGZpbHRlclN0cmluZ1Byb3BlcnR5LnZhbHVlOyAvLyBpbml0aWFsIHZhbHVlIGZyb20gb3B0aW9uc1xyXG5cclxuICBmaWx0ZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICBmaWx0ZXJTdHJpbmdQcm9wZXJ0eS52YWx1ZSA9IGZpbHRlckVsZW1lbnQudmFsdWU7XHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBmaWx0ZXJOb2RlID0gbmV3IEhCb3goIHtcclxuICAgIHNwYWNpbmc6IDUsXHJcbiAgICBjaGlsZHJlbjogW1xyXG4gICAgICBuZXcgVGV4dCggJ0ZpbHRlcjonLCB7IGZvbnQ6IGNvbnN0YW50cy5pbnRlcmZhY2VGb250IH0gKSxcclxuICAgICAgbmV3IERPTSggZmlsdGVyRWxlbWVudCApXHJcbiAgICBdXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBzb3J0Tm9kZSA9IG5ldyBWQm94KCB7XHJcbiAgICBzcGFjaW5nOiA1LFxyXG4gICAgY2hpbGRyZW46IFtcclxuICAgICAgbmV3IFRleHQoICdTb3J0JywgeyBmb250OiBjb25zdGFudHMuY2F0ZWdvcnlGb250IH0gKSxcclxuICAgICAgbmV3IFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAoIHNvcnRQcm9wZXJ0eSwgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHZhbHVlOiBTb3J0LkFMUEhBQkVUSUNBTCxcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCAnQWxwaGFiZXRpY2FsJywgeyBmb250OiBjb25zdGFudHMuaW50ZXJmYWNlRm9udCB9IClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHZhbHVlOiBTb3J0LklNUE9SVEFOQ0UsXHJcbiAgICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggJ0ltcG9ydGFuY2UnLCB7IGZvbnQ6IGNvbnN0YW50cy5pbnRlcmZhY2VGb250IH0gKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdmFsdWU6IFNvcnQuQVZFUkFHRV9USU1FLFxyXG4gICAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdBdmVyYWdlIFRpbWUnLCB7IGZvbnQ6IGNvbnN0YW50cy5pbnRlcmZhY2VGb250IH0gKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdmFsdWU6IFNvcnQuV0VJR0hULFxyXG4gICAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFRleHQoICdXZWlnaHQnLCB7IGZvbnQ6IGNvbnN0YW50cy5pbnRlcmZhY2VGb250IH0gKVxyXG4gICAgICAgIH1cclxuICAgICAgXSwge1xyXG4gICAgICAgIHNwYWNpbmc6IDVcclxuICAgICAgfSApXHJcbiAgICBdXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBleHBhbnNpb25Ob2RlID0gbmV3IFZCb3goIHtcclxuICAgIHNwYWNpbmc6IDUsXHJcbiAgICBjaGlsZHJlbjogW1xyXG4gICAgICBuZXcgVGV4dCggJ0V4cGFuc2lvbicsIHsgZm9udDogY29uc3RhbnRzLmNhdGVnb3J5Rm9udCB9ICksXHJcbiAgICAgIG5ldyBUZXh0UHVzaEJ1dHRvbiggJ0V4cGFuZCBhbGwnLCB7XHJcbiAgICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICAgIGV4cGFuZGVkUmVwb3NQcm9wZXJ0eS52YWx1ZSA9IF8udW5pcSggcmVwb3J0UHJvcGVydHkudmFsdWUudGVzdE5hbWVzLm1hcCggbmFtZXMgPT4gbmFtZXNbIDAgXSApICk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBiYXNlQ29sb3I6IGNvbnN0YW50cy5idXR0b25CYXNlQ29sb3JcclxuICAgICAgfSApLFxyXG4gICAgICBuZXcgVGV4dFB1c2hCdXR0b24oICdDb2xsYXBzZSBhbGwnLCB7XHJcbiAgICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICAgIGV4cGFuZGVkUmVwb3NQcm9wZXJ0eS52YWx1ZSA9IFtdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmFzZUNvbG9yOiBjb25zdGFudHMuYnV0dG9uQmFzZUNvbG9yXHJcbiAgICAgIH0gKVxyXG4gICAgXVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3Qgb3B0aW9uc05vZGUgPSBuZXcgVkJveCgge1xyXG4gICAgc3BhY2luZzogNSxcclxuICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgIG5ldyBUZXh0KCAnT3B0aW9ucycsIHsgZm9udDogY29uc3RhbnRzLmNhdGVnb3J5Rm9udCB9ICksXHJcbiAgICAgIG5ldyBWQm94KCB7XHJcbiAgICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgICBzcGFjaW5nOiA1LFxyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgQ2hlY2tib3goIHNob3dBdmVyYWdlVGltZVByb3BlcnR5LCBuZXcgVGV4dCggJ1Nob3cgYXZlcmFnZSB0aW1lJywgeyBmb250OiBjb25zdGFudHMuaW50ZXJmYWNlRm9udCB9ICksIHtcclxuICAgICAgICAgICAgYm94V2lkdGg6IDE0XHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICBuZXcgQ2hlY2tib3goIHNob3dXZWlnaHRzUHJvcGVydHksIG5ldyBUZXh0KCAnU2hvdyB3ZWlnaHQnLCB7IGZvbnQ6IGNvbnN0YW50cy5pbnRlcmZhY2VGb250IH0gKSwge1xyXG4gICAgICAgICAgICBib3hXaWR0aDogMTRcclxuICAgICAgICAgIH0gKVxyXG4gICAgICAgIF1cclxuICAgICAgfSApXHJcbiAgICBdXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBmaWx0ZXJpbmdOb2RlID0gbmV3IFZCb3goIHtcclxuICAgIHNwYWNpbmc6IDUsXHJcbiAgICBjaGlsZHJlbjogW1xyXG4gICAgICBuZXcgVGV4dCggJ0ZpbHRlcmluZycsIHsgZm9udDogY29uc3RhbnRzLmNhdGVnb3J5Rm9udCB9ICksXHJcbiAgICAgIGZpbHRlck5vZGUsXHJcbiAgICAgIG5ldyBUZXh0KCAnKHRhYiBvdXQgdG8gZmluYWxpemUpJywgeyBmb250OiBjb25zdGFudHMuaW50ZXJmYWNlRm9udCB9IClcclxuICAgIF1cclxuICB9ICk7XHJcblxyXG4gIE11bHRpbGluay5tdWx0aWxpbmsoIFsgcmVwb3J0UHJvcGVydHksIGV4cGFuZGVkUmVwb3NQcm9wZXJ0eSwgc29ydFByb3BlcnR5LCBmaWx0ZXJTdHJpbmdQcm9wZXJ0eSwgc2hvd0F2ZXJhZ2VUaW1lUHJvcGVydHksIHNob3dXZWlnaHRzUHJvcGVydHkgXSxcclxuICAgICggcmVwb3J0LCBleHBhbmRlZFJlcG9zLCBzb3J0LCBmaWx0ZXJTdHJpbmcsIHNob3dBdmVyYWdlVGltZSwgc2hvd1dlaWdodHMgKSA9PiB7XHJcbiAgICAgIGxldCB0ZXN0cyA9IFtdO1xyXG5cclxuICAgICAgbGV0IHNuYXBzaG90cyA9IHJlcG9ydC5zbmFwc2hvdHM7XHJcbiAgICAgIGlmICggb3B0aW9ucy5tYXhDb2x1bW5zICE9PSAtMSApIHtcclxuICAgICAgICBzbmFwc2hvdHMgPSBzbmFwc2hvdHMuZmlsdGVyKCAoIHNuYXBzaG90LCBpbmRleCApID0+IGluZGV4IDwgb3B0aW9ucy5tYXhDb2x1bW5zICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGV2ZXJ5dGhpbmdOYW1lID0gJyhldmVyeXRoaW5nKSc7XHJcblxyXG4gICAgICB0ZXN0cy5wdXNoKCB7XHJcbiAgICAgICAgbmFtZXM6IFsgZXZlcnl0aGluZ05hbWUgXSxcclxuICAgICAgICBpbmRpY2VzOiBfLnJhbmdlKCAwLCByZXBvcnQudGVzdE5hbWVzLmxlbmd0aCApLFxyXG4gICAgICAgIGF2ZXJhZ2VUaW1lczogcmVwb3J0LnRlc3RBdmVyYWdlVGltZXMsXHJcbiAgICAgICAgd2VpZ2h0czogcmVwb3J0LnRlc3RXZWlnaHRzXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIHNjYW4gdG8gZGV0ZXJtaW5lIHdoYXQgdGVzdHMgd2UgYXJlIHNob3dpbmdcclxuICAgICAgcmVwb3J0LnRlc3ROYW1lcy5mb3JFYWNoKCAoIG5hbWVzLCBpbmRleCApID0+IHtcclxuICAgICAgICBpZiAoICFleHBhbmRlZFJlcG9zLmluY2x1ZGVzKCBuYW1lc1sgMCBdICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBsYXN0VGVzdCA9IHRlc3RzWyB0ZXN0cy5sZW5ndGggLSAxIF07XHJcbiAgICAgICAgICBpZiAoIGxhc3RUZXN0ICYmIGxhc3RUZXN0Lm5hbWVzWyAwIF0gPT09IG5hbWVzWyAwIF0gKSB7XHJcbiAgICAgICAgICAgIGxhc3RUZXN0LmluZGljZXMucHVzaCggaW5kZXggKTtcclxuICAgICAgICAgICAgbGFzdFRlc3QuYXZlcmFnZVRpbWVzLnB1c2goIHJlcG9ydC50ZXN0QXZlcmFnZVRpbWVzWyBpbmRleCBdICk7XHJcbiAgICAgICAgICAgIGxhc3RUZXN0LndlaWdodHMucHVzaCggcmVwb3J0LnRlc3RXZWlnaHRzWyBpbmRleCBdICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGVzdHMucHVzaCgge1xyXG4gICAgICAgICAgICAgIG5hbWVzOiBbIG5hbWVzWyAwIF0gXSxcclxuICAgICAgICAgICAgICBpbmRpY2VzOiBbIGluZGV4IF0sXHJcbiAgICAgICAgICAgICAgYXZlcmFnZVRpbWVzOiBbIHJlcG9ydC50ZXN0QXZlcmFnZVRpbWVzWyBpbmRleCBdIF0sXHJcbiAgICAgICAgICAgICAgd2VpZ2h0czogWyByZXBvcnQudGVzdFdlaWdodHNbIGluZGV4IF0gXVxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGVzdHMucHVzaCgge1xyXG4gICAgICAgICAgICBuYW1lczogbmFtZXMsXHJcbiAgICAgICAgICAgIGluZGljZXM6IFsgaW5kZXggXSxcclxuICAgICAgICAgICAgYXZlcmFnZVRpbWVzOiBbIHJlcG9ydC50ZXN0QXZlcmFnZVRpbWVzWyBpbmRleCBdIF0sXHJcbiAgICAgICAgICAgIHdlaWdodHM6IFsgcmVwb3J0LnRlc3RXZWlnaHRzWyBpbmRleCBdIF1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGNvbXB1dGUgc3VtbWF0aW9uc1xyXG4gICAgICB0ZXN0cy5mb3JFYWNoKCB0ZXN0ID0+IHtcclxuICAgICAgICB0ZXN0LmF2ZXJhZ2VUaW1lID0gXy5tZWFuKCB0ZXN0LmF2ZXJhZ2VUaW1lcy5maWx0ZXIoIF8uaWRlbnRpdHkgKSApIHx8IDA7XHJcbiAgICAgICAgdGVzdC5taW5XZWlnaHQgPSBfLm1pbiggdGVzdC53ZWlnaHRzICkgfHwgMDtcclxuICAgICAgICB0ZXN0Lm1heFdlaWdodCA9IF8ubWF4KCB0ZXN0LndlaWdodHMgKSB8fCAwO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBpZiAoIGZpbHRlclN0cmluZy5sZW5ndGggKSB7XHJcbiAgICAgICAgLy8gU3BhY2VzIHNlcGFyYXRlIG11bHRpcGxlIHNlYXJjaCB0ZXJtc1xyXG4gICAgICAgIGZpbHRlclN0cmluZy5zcGxpdCggJyAnICkuZm9yRWFjaCggZmlsdGVyUGFydCA9PiB7XHJcbiAgICAgICAgICB0ZXN0cyA9IHRlc3RzLmZpbHRlciggdGVzdCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNUZXN0ID0gXy5zb21lKCB0ZXN0Lm5hbWVzLCBuYW1lID0+IG5hbWUuaW5jbHVkZXMoIGZpbHRlclBhcnQgKSApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbWF0Y2hlc0Vycm9yTWVzc2FnZSA9IF8uc29tZSggc25hcHNob3RzLCBzbmFwc2hvdCA9PiBfLnNvbWUoIHRlc3QuaW5kaWNlcywgaW5kZXggPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBzbmFwc2hvdC50ZXN0c1sgaW5kZXggXS5tICYmIF8uc29tZSggc25hcHNob3QudGVzdHNbIGluZGV4IF0ubSwgbWVzc2FnZSA9PiBtZXNzYWdlLmluY2x1ZGVzKCBmaWx0ZXJQYXJ0ICkgKTtcclxuICAgICAgICAgICAgfSApICk7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzVGVzdCB8fCBtYXRjaGVzRXJyb3JNZXNzYWdlO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBzb3J0ID09PSBTb3J0LklNUE9SVEFOQ0UgKSB7XHJcbiAgICAgICAgdGVzdHMgPSBfLnNvcnRCeSggdGVzdHMsIHRlc3QgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZmFpbEluZGV4ID0gXy5maW5kSW5kZXgoIHNuYXBzaG90cywgc25hcHNob3QgPT4gXy5zb21lKCB0ZXN0LmluZGljZXMsIGluZGV4ID0+IHNuYXBzaG90LnRlc3RzWyBpbmRleCBdLmZhaWxlZElnbm9yZUxvY2F0aW9uQ2hhbmdlQ291bnQgKSApO1xyXG4gICAgICAgICAgY29uc3QgcGFzc0luZGV4ID0gXy5maW5kSW5kZXgoIHNuYXBzaG90cywgc25hcHNob3QgPT4gXy5zb21lKCB0ZXN0LmluZGljZXMsIGluZGV4ID0+IHNuYXBzaG90LnRlc3RzWyBpbmRleCBdLnkgKSApO1xyXG4gICAgICAgICAgaWYgKCBmYWlsSW5kZXggPj0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhaWxJbmRleDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBwYXNzSW5kZXggPj0gMCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhc3NJbmRleCArIDEwMDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDEwMDAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggc29ydCA9PT0gU29ydC5BVkVSQUdFX1RJTUUgKSB7XHJcbiAgICAgICAgdGVzdHMgPSBfLnNvcnRCeSggdGVzdHMsIHRlc3QgPT4gLXRlc3QuYXZlcmFnZVRpbWUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggc29ydCA9PT0gU29ydC5XRUlHSFQgKSB7XHJcbiAgICAgICAgdGVzdHMgPSBfLnNvcnRCeSggdGVzdHMsIHRlc3QgPT4gLXRlc3QubWF4V2VpZ2h0ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHRlc3RMYWJlbHMgPSB0ZXN0cy5tYXAoIHRlc3QgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gbmV3IFRleHQoIHRlc3QubmFtZXMuam9pbiggJyA6ICcgKSwge1xyXG4gICAgICAgICAgZm9udDogY29uc3RhbnRzLmludGVyZmFjZUZvbnQsXHJcbiAgICAgICAgICBsZWZ0OiAwLFxyXG4gICAgICAgICAgdG9wOiAwXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGNvbnN0IGJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAwLCAwLCB7XHJcbiAgICAgICAgICBmaWxsOiAnI2ZhZmFmYScsXHJcbiAgICAgICAgICBjaGlsZHJlbjogWyBsYWJlbCBdLFxyXG4gICAgICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgaWYgKCB0ZXN0Lm5hbWVzWyAwIF0gPT09IGV2ZXJ5dGhpbmdOYW1lICkge1xyXG4gICAgICAgICAgbGFiZWwuZmlsbCA9ICcjOTk5JztcclxuICAgICAgICB9XHJcbiAgICAgICAgYmFja2dyb3VuZC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgICAgICBmaXJlOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRvcExldmVsTmFtZSA9IHRlc3QubmFtZXNbIDAgXTtcclxuICAgICAgICAgICAgaWYgKCB0ZXN0Lm5hbWVzLmxlbmd0aCA+IDEgKSB7XHJcbiAgICAgICAgICAgICAgZXhwYW5kZWRSZXBvc1Byb3BlcnR5LnZhbHVlID0gZXhwYW5kZWRSZXBvc1Byb3BlcnR5LnZhbHVlLmZpbHRlciggbmFtZSA9PiBuYW1lICE9PSB0b3BMZXZlbE5hbWUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBleHBhbmRlZFJlcG9zUHJvcGVydHkudmFsdWUgPSBfLnVuaXEoIFsgLi4uZXhwYW5kZWRSZXBvc1Byb3BlcnR5LnZhbHVlLCB0b3BMZXZlbE5hbWUgXSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tncm91bmQ7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IGF2ZXJhZ2VUaW1lTGFiZWxzID0gc2hvd0F2ZXJhZ2VUaW1lID8gdGVzdHMubWFwKCB0ZXN0ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDAsIDAsIHtcclxuICAgICAgICAgIGZpbGw6ICcjZmFmYWZhJ1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgaWYgKCB0ZXN0LmF2ZXJhZ2VUaW1lICkge1xyXG4gICAgICAgICAgY29uc3QgdGVudGhzT2ZTZWNvbmRzID0gTWF0aC5jZWlsKCB0ZXN0LmF2ZXJhZ2VUaW1lIC8gMTAwICk7XHJcbiAgICAgICAgICBjb25zdCBsYWJlbCA9IG5ldyBUZXh0KCBgJHtNYXRoLmZsb29yKCB0ZW50aHNPZlNlY29uZHMgLyAxMCApfS4ke3RlbnRoc09mU2Vjb25kcyAlIDEwfXNgLCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxMCB9ICksXHJcbiAgICAgICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgICAgIHRvcDogMCxcclxuICAgICAgICAgICAgZmlsbDogJyM4ODgnXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICBiYWNrZ3JvdW5kLmFkZENoaWxkKCBsYWJlbCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGJhY2tncm91bmQ7XHJcbiAgICAgIH0gKSA6IG51bGw7XHJcblxyXG4gICAgICBjb25zdCB3ZWlnaHRMYWJlbHMgPSBzaG93V2VpZ2h0cyA/IHRlc3RzLm1hcCggdGVzdCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAwLCAwLCB7XHJcbiAgICAgICAgICBmaWxsOiAnI2ZhZmFmYSdcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIGlmICggdGVzdC5taW5XZWlnaHQgfHwgdGVzdC5tYXhXZWlnaHQgKSB7XHJcbiAgICAgICAgICBjb25zdCBsYWJlbCA9IG5ldyBUZXh0KCB0ZXN0Lm1pbldlaWdodCA9PT0gdGVzdC5tYXhXZWlnaHQgPyB0ZXN0Lm1pbldlaWdodCA6IGAke3Rlc3QubWluV2VpZ2h0fS0ke3Rlc3QubWF4V2VpZ2h0fWAsIHtcclxuICAgICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDEwIH0gKSxcclxuICAgICAgICAgICAgbGVmdDogMCxcclxuICAgICAgICAgICAgdG9wOiAwLFxyXG4gICAgICAgICAgICBmaWxsOiAnIzg4OCdcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGJhY2tncm91bmQuYWRkQ2hpbGQoIGxhYmVsICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYmFja2dyb3VuZDtcclxuICAgICAgfSApIDogbnVsbDtcclxuXHJcbiAgICAgIGNvbnN0IHBhZGRpbmcgPSAzO1xyXG5cclxuICAgICAgY29uc3Qgc25hcHNob3RMYWJlbHMgPSBzbmFwc2hvdHMubWFwKCAoIHNuYXBzaG90LCBpbmRleCApID0+IHtcclxuICAgICAgICBjb25zdCB0b3RhbFRlc3RDb3VudCA9IHNuYXBzaG90LnRlc3RzLmxlbmd0aDtcclxuICAgICAgICBjb25zdCBjb21wbGV0ZWRUZXN0Q291bnQgPSBzbmFwc2hvdC50ZXN0cy5maWx0ZXIoIHggPT4geC55IHx8IHgubiApLmxlbmd0aDtcclxuICAgICAgICBjb25zdCBmYWlsZWRUZXN0Q291bnQgPSBzbmFwc2hvdC50ZXN0cy5maWx0ZXIoIHggPT4geC5mYWlsZWRJZ25vcmVMb2NhdGlvbkNoYW5nZUNvdW50ID4gMCApLmxlbmd0aDtcclxuICAgICAgICBjb25zdCBiZWZvcmVVbmxvYWRFcnJvcnNDb3VudCA9IHNuYXBzaG90LnRlc3RzLmZpbHRlciggdGVzdCA9PiB0ZXN0Lm0gJiYgXy5zb21lKCB0ZXN0Lm0sIG0gPT4gaXNPbkJlZm9yZVVubG9hZE1lc3NhZ2UoIG0gKSApICkubGVuZ3RoO1xyXG5cclxuICAgICAgICBjb25zdCB0ZXh0T3B0aW9ucyA9IHsgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDEwIH0gKSB9O1xyXG5cclxuICAgICAgICBjb25zdCBsYWJlbCA9IG5ldyBWQm94KCB7XHJcbiAgICAgICAgICBzcGFjaW5nOiAyLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgLi4ubmV3IERhdGUoIHNuYXBzaG90LnRpbWVzdGFtcCApLnRvTG9jYWxlU3RyaW5nKCkucmVwbGFjZSggJywnLCAnJyApLnJlcGxhY2UoICcgQU0nLCAnYW0nICkucmVwbGFjZSggJyBQTScsICdwbScgKS5zcGxpdCggJyAnICkubWFwKCBzdHIgPT4gbmV3IFRleHQoIHN0ciwgdGV4dE9wdGlvbnMgKSApLFxyXG4gICAgICAgICAgICBuZXcgVGV4dCggYCR7VXRpbHMucm91bmRTeW1tZXRyaWMoIGNvbXBsZXRlZFRlc3RDb3VudCAvIHRvdGFsVGVzdENvdW50ICogMTAwICl9JWAsIHRleHRPcHRpb25zIClcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBsYWJlbC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgICAgICBmaXJlOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkaWZmU3RyaW5nID0gJyc7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c1NuYXBzaG90ID0gc25hcHNob3RzWyBpbmRleCArIDEgXTtcclxuICAgICAgICAgICAgaWYgKCBwcmV2aW91c1NuYXBzaG90ICkge1xyXG4gICAgICAgICAgICAgIGRpZmZTdHJpbmcgPSBfLnVuaXEoIE9iamVjdC5rZXlzKCBzbmFwc2hvdC5zaGFzICkuY29uY2F0KCBPYmplY3Qua2V5cyggcHJldmlvdXNTbmFwc2hvdC5zaGFzICkgKSApLnNvcnQoKS5maWx0ZXIoIHJlcG8gPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNuYXBzaG90LnNoYXNbIHJlcG8gXSAhPT0gcHJldmlvdXNTbmFwc2hvdC5zaGFzWyByZXBvIF07XHJcbiAgICAgICAgICAgICAgfSApLm1hcCggcmVwbyA9PiBgJHtyZXBvfTogJHtwcmV2aW91c1NuYXBzaG90LnNoYXNbIHJlcG8gXX0gPT4gJHtzbmFwc2hvdC5zaGFzWyByZXBvIF19YCApLmpvaW4oICdcXG4nICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZFRlc3RzID0gYCR7Y29tcGxldGVkVGVzdENvdW50fSAvICR7dG90YWxUZXN0Q291bnR9IFRlc3RzIENvbXBsZXRlZGA7XHJcbiAgICAgICAgICAgIGNvbnN0IGZhaWxlZFRlc3RzID0gYCR7ZmFpbGVkVGVzdENvdW50fSBUZXN0cyBGYWlsZWRgO1xyXG4gICAgICAgICAgICBjb25zdCBiZWZvcmVVbmxvYWRGYWlsZWRUZXN0cyA9IG9wdGlvbnMuc2hvd0JlZm9yZVVubG9hZEVycm9ycyA/ICcnIDogYFxcbiske2JlZm9yZVVubG9hZEVycm9yc0NvdW50fSBtb3JlIHRlc3RzIGZhaWxlZCBmcm9tIFwid2luZG93LmxvY2F0aW9uIHByb2JhYmx5IGNoYW5nZWRcIiBlcnJvcnMuYDtcclxuICAgICAgICAgICAgY29uc3Qgc2hhcyA9IEpTT04uc3RyaW5naWZ5KCBzbmFwc2hvdC5zaGFzLCBudWxsLCAyICk7XHJcbiAgICAgICAgICAgIHBvcHVwKCBsYWJlbCwgYCR7c25hcHNob3QudGltZXN0YW1wfVxcblxcbiR7Y29tcGxldGVkVGVzdHN9XFxuJHtmYWlsZWRUZXN0c30ke2JlZm9yZVVubG9hZEZhaWxlZFRlc3RzfVxcblxcbiR7ZGlmZlN0cmluZ31cXG5cXG4ke3NoYXN9YCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICAgIHJldHVybiBsYWJlbDtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3QgbWF4VGVzdExhYmVsV2lkdGggPSBfLm1heCggdGVzdExhYmVscy5tYXAoIG5vZGUgPT4gbm9kZS53aWR0aCApICk7XHJcbiAgICAgIGNvbnN0IG1heFRlc3RMYWJlbEhlaWdodCA9IF8ubWF4KCB0ZXN0TGFiZWxzLm1hcCggbm9kZSA9PiBub2RlLmhlaWdodCApICk7XHJcbiAgICAgIGNvbnN0IG1heFNuYXBzaG90TGFiZWxXaWR0aCA9IF8ubWF4KCBzbmFwc2hvdExhYmVscy5tYXAoIG5vZGUgPT4gbm9kZS53aWR0aCApICk7XHJcbiAgICAgIGNvbnN0IG1heFNuYXBzaG90TGFiZWxIZWlnaHQgPSBfLm1heCggc25hcHNob3RMYWJlbHMubWFwKCBub2RlID0+IG5vZGUuaGVpZ2h0ICkgKTtcclxuICAgICAgY29uc3QgbWF4QXZlcmFnZVRpbWVMYWJlbFdpZHRoID0gYXZlcmFnZVRpbWVMYWJlbHMgPyBfLm1heCggYXZlcmFnZVRpbWVMYWJlbHMubWFwKCBub2RlID0+IG5vZGUud2lkdGggKSApIDogMDtcclxuICAgICAgY29uc3QgbWF4V2VpZ2h0TGFiZWxXaWR0aCA9IHdlaWdodExhYmVscyA/IF8ubWF4KCB3ZWlnaHRMYWJlbHMubWFwKCBub2RlID0+IG5vZGUud2lkdGggKSApIDogMDtcclxuXHJcbiAgICAgIHRlc3RMYWJlbHMuZm9yRWFjaCggbGFiZWwgPT4ge1xyXG4gICAgICAgIGxhYmVsLnJlY3RXaWR0aCA9IG1heFRlc3RMYWJlbFdpZHRoO1xyXG4gICAgICAgIGxhYmVsLnJlY3RIZWlnaHQgPSBtYXhUZXN0TGFiZWxIZWlnaHQ7XHJcbiAgICAgIH0gKTtcclxuICAgICAgYXZlcmFnZVRpbWVMYWJlbHMgJiYgYXZlcmFnZVRpbWVMYWJlbHMuZm9yRWFjaCggbGFiZWwgPT4ge1xyXG4gICAgICAgIGlmICggbGFiZWwuY2hpbGRyZW5bIDAgXSApIHtcclxuICAgICAgICAgIGxhYmVsLmNoaWxkcmVuWyAwIF0ucmlnaHQgPSBtYXhBdmVyYWdlVGltZUxhYmVsV2lkdGg7XHJcbiAgICAgICAgICBsYWJlbC5jaGlsZHJlblsgMCBdLmNlbnRlclkgPSBtYXhUZXN0TGFiZWxIZWlnaHQgLyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsYWJlbC5yZWN0V2lkdGggPSBtYXhBdmVyYWdlVGltZUxhYmVsV2lkdGg7XHJcbiAgICAgICAgbGFiZWwucmVjdEhlaWdodCA9IG1heFRlc3RMYWJlbEhlaWdodDtcclxuICAgICAgfSApO1xyXG4gICAgICB3ZWlnaHRMYWJlbHMgJiYgd2VpZ2h0TGFiZWxzLmZvckVhY2goIGxhYmVsID0+IHtcclxuICAgICAgICBpZiAoIGxhYmVsLmNoaWxkcmVuWyAwIF0gKSB7XHJcbiAgICAgICAgICBsYWJlbC5jaGlsZHJlblsgMCBdLnJpZ2h0ID0gbWF4V2VpZ2h0TGFiZWxXaWR0aDtcclxuICAgICAgICAgIGxhYmVsLmNoaWxkcmVuWyAwIF0uY2VudGVyWSA9IG1heFRlc3RMYWJlbEhlaWdodCAvIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxhYmVsLnJlY3RXaWR0aCA9IG1heFdlaWdodExhYmVsV2lkdGg7XHJcbiAgICAgICAgbGFiZWwucmVjdEhlaWdodCA9IG1heFRlc3RMYWJlbEhlaWdodDtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3QgZ2V0WCA9IGluZGV4ID0+IG1heFRlc3RMYWJlbFdpZHRoICsgcGFkZGluZyArIGluZGV4ICogKCBtYXhTbmFwc2hvdExhYmVsV2lkdGggKyBwYWRkaW5nICkgKyAoIHNob3dBdmVyYWdlVGltZSA/IDEgOiAwICkgKiAoIG1heEF2ZXJhZ2VUaW1lTGFiZWxXaWR0aCArIHBhZGRpbmcgKSArICggc2hvd1dlaWdodHMgPyAxIDogMCApICogKCBtYXhXZWlnaHRMYWJlbFdpZHRoICsgcGFkZGluZyApO1xyXG4gICAgICBjb25zdCBnZXRZID0gaW5kZXggPT4gbWF4U25hcHNob3RMYWJlbEhlaWdodCArIHBhZGRpbmcgKyBpbmRleCAqICggbWF4VGVzdExhYmVsSGVpZ2h0ICsgcGFkZGluZyApO1xyXG5cclxuICAgICAgY29uc3Qgc25hcHNob3RzVGVzdE5vZGVzID0gXy5mbGF0dGVuKCBzbmFwc2hvdHMubWFwKCAoIHNuYXBzaG90LCBpICkgPT4ge1xyXG4gICAgICAgIHJldHVybiB0ZXN0cy5tYXAoICggdGVzdCwgaiApID0+IHtcclxuICAgICAgICAgIGNvbnN0IHggPSBnZXRYKCBpICk7XHJcbiAgICAgICAgICBjb25zdCB5ID0gZ2V0WSggaiApO1xyXG4gICAgICAgICAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIG1heFNuYXBzaG90TGFiZWxXaWR0aCwgbWF4VGVzdExhYmVsSGVpZ2h0LCB7XHJcbiAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgIHk6IHlcclxuICAgICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgICBsZXQgdG90YWxDb3VudCA9IDA7XHJcbiAgICAgICAgICBsZXQgdW50ZXN0ZWRDb3VudCA9IDA7XHJcbiAgICAgICAgICBsZXQgdW5hdmFpbGFibGVDb3VudCA9IDA7XHJcbiAgICAgICAgICBsZXQgcGFzc0NvdW50ID0gMDtcclxuICAgICAgICAgIGxldCBmYWlsQ291bnQgPSAwO1xyXG4gICAgICAgICAgbGV0IG1lc3NhZ2VzID0gW107XHJcblxyXG4gICAgICAgICAgdGVzdC5pbmRpY2VzLmZvckVhY2goIGluZGV4ID0+IHtcclxuICAgICAgICAgICAgdG90YWxDb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc25hcHNob3RUZXN0ID0gc25hcHNob3QudGVzdHNbIGluZGV4IF07XHJcblxyXG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBzbmFwc2hvdFRlc3QueSA9PT0gJ251bWJlcicgKSB7XHJcbiAgICAgICAgICAgICAgcGFzc0NvdW50ICs9IHNuYXBzaG90VGVzdC55O1xyXG4gICAgICAgICAgICAgIGZhaWxDb3VudCArPSBzbmFwc2hvdFRlc3QuZmFpbGVkSWdub3JlTG9jYXRpb25DaGFuZ2VDb3VudDtcclxuICAgICAgICAgICAgICBpZiAoIHNuYXBzaG90VGVzdC55ICsgc25hcHNob3RUZXN0Lm4gPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICB1bnRlc3RlZENvdW50Kys7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmICggc25hcHNob3RUZXN0Lm0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT21pdCBiZWZvcmUtdW5sb2FkIGVycm9ycyB1bmxlc3Mgd2Ugb3B0IGludG8gdGhlbSB3aXRoIGEgcXVlcnkgcGFyYW1ldGVyLlxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25hcHNob3RNZXNzYWdlcyA9IHNuYXBzaG90VGVzdC5tLmZpbHRlciggbWVzc2FnZSA9PiBvcHRpb25zLnNob3dCZWZvcmVVbmxvYWRFcnJvcnMgfHwgIWlzT25CZWZvcmVVbmxvYWRNZXNzYWdlKCBtZXNzYWdlICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlcyA9IG1lc3NhZ2VzLmNvbmNhdCggc25hcHNob3RNZXNzYWdlcy5tYXAoIG1lc3NhZ2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0TWVzc2FnZSA9IGAke3JlcG9ydC50ZXN0TmFtZXNbIGluZGV4IF0uam9pbiggJyA6ICcgKX1cXG4ke21lc3NhZ2V9XFxuU25hcHNob3QgZnJvbSAke25ldyBEYXRlKCBzbmFwc2hvdC50aW1lc3RhbXAgKS50b0xvY2FsZVN0cmluZygpfWA7XHJcbiAgICAgICAgICAgICAgICAgIHdoaWxlICggcmVzdWx0TWVzc2FnZS5pbmNsdWRlcyggJ1xcblxcblxcbicgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRNZXNzYWdlID0gcmVzdWx0TWVzc2FnZS5yZXBsYWNlKCAnXFxuXFxuXFxuJywgJ1xcblxcbicgKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0TWVzc2FnZTtcclxuICAgICAgICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICB1bnRlc3RlZENvdW50Kys7XHJcbiAgICAgICAgICAgICAgdW5hdmFpbGFibGVDb3VudCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgY29uc3QgY29tcGxldGVSYXRpbyA9IHRvdGFsQ291bnQgPyAoICggdG90YWxDb3VudCAtIHVudGVzdGVkQ291bnQgKSAvIHRvdGFsQ291bnQgKSA6IDE7XHJcblxyXG4gICAgICAgICAgaWYgKCBmYWlsQ291bnQgPiAwICkge1xyXG4gICAgICAgICAgICBpZiAoIHVudGVzdGVkQ291bnQgPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgYmFja2dyb3VuZC5maWxsID0gY29uc3RhbnRzLmZhaWxDb2xvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kLmZpbGwgPSBjb25zdGFudHMuZmFpbENvbG9yUGFydGlhbDtcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kLmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBjb21wbGV0ZVJhdGlvICogbWF4U25hcHNob3RMYWJlbFdpZHRoLCBtYXhUZXN0TGFiZWxIZWlnaHQsIHtcclxuICAgICAgICAgICAgICAgIGZpbGw6IGNvbnN0YW50cy5mYWlsQ29sb3JcclxuICAgICAgICAgICAgICB9ICkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIHBhc3NDb3VudCA+IDAgKSB7XHJcbiAgICAgICAgICAgIGlmICggdW50ZXN0ZWRDb3VudCA9PT0gMCApIHtcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kLmZpbGwgPSBjb25zdGFudHMucGFzc0NvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIGJhY2tncm91bmQuZmlsbCA9IGNvbnN0YW50cy5wYXNzQ29sb3JQYXJ0aWFsO1xyXG4gICAgICAgICAgICAgIGJhY2tncm91bmQuYWRkQ2hpbGQoIG5ldyBSZWN0YW5nbGUoIDAsIDAsIGNvbXBsZXRlUmF0aW8gKiBtYXhTbmFwc2hvdExhYmVsV2lkdGgsIG1heFRlc3RMYWJlbEhlaWdodCwge1xyXG4gICAgICAgICAgICAgICAgZmlsbDogY29uc3RhbnRzLnBhc3NDb2xvclxyXG4gICAgICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggdW5hdmFpbGFibGVDb3VudCA+IDAgKSB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQuZmlsbCA9IGNvbnN0YW50cy51bmF2YWlsYWJsZUNvbG9yO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQuZmlsbCA9IGNvbnN0YW50cy51bnRlc3RlZENvbG9yO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggbWVzc2FnZXMubGVuZ3RoICkge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLmFkZElucHV0TGlzdGVuZXIoIG5ldyBGaXJlTGlzdGVuZXIoIHtcclxuICAgICAgICAgICAgICBmaXJlOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwb3B1cCggYmFja2dyb3VuZCwgbWVzc2FnZXMuam9pbiggJ1xcblxcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG5cXG4nICkgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gKSApO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gYmFja2dyb3VuZDtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgICAgdGVzdExhYmVscy5mb3JFYWNoKCAoIGxhYmVsLCBpICkgPT4ge1xyXG4gICAgICAgIGxhYmVsLmxlZnQgPSAwO1xyXG4gICAgICAgIGxhYmVsLnRvcCA9IGdldFkoIGkgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBzbmFwc2hvdExhYmVscy5mb3JFYWNoKCAoIGxhYmVsLCBpICkgPT4ge1xyXG4gICAgICAgIGxhYmVsLnRvcCA9IDA7XHJcbiAgICAgICAgbGFiZWwubGVmdCA9IGdldFgoIGkgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBhdmVyYWdlVGltZUxhYmVscyAmJiBhdmVyYWdlVGltZUxhYmVscy5mb3JFYWNoKCAoIGxhYmVsLCBpICkgPT4ge1xyXG4gICAgICAgIGxhYmVsLmxlZnQgPSBtYXhUZXN0TGFiZWxXaWR0aCArIHBhZGRpbmc7XHJcbiAgICAgICAgbGFiZWwudG9wID0gZ2V0WSggaSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHdlaWdodExhYmVscyAmJiB3ZWlnaHRMYWJlbHMuZm9yRWFjaCggKCBsYWJlbCwgaSApID0+IHtcclxuICAgICAgICBsYWJlbC5sZWZ0ID0gbWF4VGVzdExhYmVsV2lkdGggKyBwYWRkaW5nICsgKCBzaG93QXZlcmFnZVRpbWUgPyAxIDogMCApICogKCBtYXhBdmVyYWdlVGltZUxhYmVsV2lkdGggKyBwYWRkaW5nICk7XHJcbiAgICAgICAgbGFiZWwudG9wID0gZ2V0WSggaSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICByZXBvcnROb2RlLmNoaWxkcmVuID0gW1xyXG4gICAgICAgIC4uLnRlc3RMYWJlbHMsXHJcbiAgICAgICAgLi4uc25hcHNob3RMYWJlbHMsXHJcbiAgICAgICAgLi4uc25hcHNob3RzVGVzdE5vZGVzLFxyXG4gICAgICAgIC4uLiggc2hvd0F2ZXJhZ2VUaW1lID8gYXZlcmFnZVRpbWVMYWJlbHMgOiBbXSApLFxyXG4gICAgICAgIC4uLiggc2hvd1dlaWdodHMgPyB3ZWlnaHRMYWJlbHMgOiBbXSApXHJcbiAgICAgIF07XHJcbiAgICB9ICk7XHJcblxyXG4gIGNvbnRlbnROb2RlID0gbmV3IFZCb3goIHtcclxuICAgIHg6IDEwLFxyXG4gICAgeTogMTAsXHJcbiAgICBzcGFjaW5nOiAxNSxcclxuICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICBjaGlsZHJlbjogW1xyXG4gICAgICBuZXcgVGV4dCggJ0NvbnRpbnVvdXMgVGVzdGluZycsIHsgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDI0IH0gKSB9ICksXHJcbiAgICAgIHN0YXR1c05vZGUsXHJcbiAgICAgIHF1aWNrTm9kZSxcclxuICAgICAgbmV3IEhCb3goIHtcclxuICAgICAgICBhbGlnbjogJ3RvcCcsXHJcbiAgICAgICAgc3BhY2luZzogMjUsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIHNvcnROb2RlLFxyXG4gICAgICAgICAgZXhwYW5zaW9uTm9kZSxcclxuICAgICAgICAgIG9wdGlvbnNOb2RlLFxyXG4gICAgICAgICAgZmlsdGVyaW5nTm9kZVxyXG4gICAgICAgIF1cclxuICAgICAgfSApLFxyXG4gICAgICByZXBvcnROb2RlXHJcbiAgICBdXHJcbiAgfSApO1xyXG59XHJcbmVsc2Uge1xyXG4gIGNvbnRlbnROb2RlID0gcXVpY2tOb2RlO1xyXG59XHJcbnJvb3ROb2RlLmFkZENoaWxkKCBjb250ZW50Tm9kZSApO1xyXG5cclxuZGlzcGxheS5hZGRJbnB1dExpc3RlbmVyKCB7XHJcbiAgZG93bjogKCkgPT4ge1xyXG4gICAgaWYgKCBwb3B1cElmcmFtZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBwb3B1cElmcmFtZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIHBvcHVwSWZyYW1lUHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufSApO1xyXG5cclxuZGlzcGxheS5pbml0aWFsaXplRXZlbnRzKCk7XHJcbmRpc3BsYXkudXBkYXRlT25SZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIGR0ID0+IHtcclxuICBiYWNrZ3JvdW5kTm9kZS5yZWN0V2lkdGggPSBjb250ZW50Tm9kZS53aWR0aDtcclxuICBiYWNrZ3JvdW5kTm9kZS5yZWN0SGVpZ2h0ID0gY29udGVudE5vZGUuaGVpZ2h0O1xyXG4gIGRpc3BsYXkud2lkdGggPSBNYXRoLm1heCggd2luZG93LmlubmVyV2lkdGgsIE1hdGguY2VpbCggcm9vdE5vZGUud2lkdGggKSApO1xyXG4gIGRpc3BsYXkuaGVpZ2h0ID0gTWF0aC5tYXgoIDQwMCwgTWF0aC5jZWlsKCByb290Tm9kZS5oZWlnaHQgKSApICsgMTAwO1xyXG59ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxxQ0FBcUM7QUFDakUsT0FBT0MsNkJBQTZCLE1BQU0sbURBQW1EO0FB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