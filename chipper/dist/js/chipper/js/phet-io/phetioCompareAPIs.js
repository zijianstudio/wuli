// Copyright 2021-2023, University of Colorado Boulder

/**
 * Compare PhET-iO APIs for two versions of the same sim. This function treats the first API as the "ground truth"
 * and compares the second API to see if it has any breaking changes against the first API. This function returns a
 * list of "problems".
 *
 * This file runs in node (command line API comparison), in the diff wrapper (client-facing API comparison) and
 * in simulations in phetioEngine when ?ea&phetioCompareAPI is specified (for CT).
 *
 * Note that even though it is a preload, it uses a different global/namespacing pattern than phet-io-initialize-globals.js
 * in order to simplify usage in all these sites.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/**
 * @typedef API
 * @property {boolean} phetioFullAPI
 * @property {Object} phetioElements - phetioElements for version >=1.0 this will be a sparse, tree like structure with
 *                    metadata in key: `_metadata`. For version<1 this will be a flat list with phetioIDs as keys,
 *                    and values as metadata.
 * @property {Object} phetioTypes
 */

/**
 * See phetioEngine.js for where this is generated in master. Keep in mind that we support different versions, including
 * APIs that don't have a version attribute.
 * @typedef API_1_0
 * @extends API
 * @property {{major:number, minor:number}} version
 * @property {string} sim
 */
(() => {
  const METADATA_KEY_NAME = '_metadata';
  const DATA_KEY_NAME = '_data';

  // Is not the reserved keys to store data/metadata on PhET-iO elements.
  const isChildKey = key => key !== METADATA_KEY_NAME && key !== DATA_KEY_NAME;

  /**
   * "up-convert" an API to be in the format of API version >=1.0. This generally is thought of as a "sparse, tree-like" API.
   * @param {API} api
   * @param _
   * @returns {API} - In this version, phetioElements will be structured as a tree, but will have a verbose and complete
   *                  set of all metadata keys for each element. There will not be `metadataDefaults` in each type.
   */
  const toStructuredTree = (api, _) => {
    const sparseAPI = _.cloneDeep(api);

    // DUPLICATED with phetioEngine.js
    const sparseElements = {};
    Object.keys(api.phetioElements).forEach(phetioID => {
      const entry = api.phetioElements[phetioID];

      // API versions < 1.0, use a tandem separator of '.'  If we ever change this separator in master (hopefully not!)
      // this value wouldn't change since it reflects the prior committed versions which do use '.'
      const chain = phetioID.split('.');

      // Fill in each level
      let level = sparseElements;
      chain.forEach(componentName => {
        level[componentName] = level[componentName] || {};
        level = level[componentName];
      });
      level[METADATA_KEY_NAME] = {};
      Object.keys(entry).forEach(key => {
        // write all values without trying to factor out defaults
        level[METADATA_KEY_NAME][key] = entry[key];
      });
    });
    sparseAPI.phetioElements = sparseElements;
    return sparseAPI;
  };

  /**
   * @param {Object} phetioElement
   * @param {API} api
   * @param {Object} _ - lodash
   * @param {function|undefined} assert - optional assert
   * @returns {Object}
   */
  const getMetadataValues = (phetioElement, api, _, assert) => {
    const typeName = phetioElement[METADATA_KEY_NAME] ? phetioElement[METADATA_KEY_NAME].phetioTypeName || 'ObjectIO' : 'ObjectIO';
    if (api.version) {
      const defaults = getMetadataDefaults(typeName, api, _, assert);
      return _.merge(defaults, phetioElement[METADATA_KEY_NAME]);
    } else {
      // Dense version supplies all metadata values
      return phetioElement[METADATA_KEY_NAME];
    }
  };

  /**
   * @param {string} typeName
   * @param {API} api
   * @param {Object} _ - lodash
   * @param {function|undefined} assert - optional assert
   * @returns {Object} - defensive copy, non-mutating
   */
  const getMetadataDefaults = (typeName, api, _, assert) => {
    const entry = api.phetioTypes[typeName];
    assert && assert(entry, `entry missing: ${typeName}`);
    if (entry.supertype) {
      return _.merge(getMetadataDefaults(entry.supertype, api, _), entry.metadataDefaults);
    } else {
      return _.merge({}, entry.metadataDefaults);
    }
  };

  /**
   * @param {API} api
   * @returns {boolean} - whether or not the API is of type API_1_0
   */
  const isOldAPIVersion = api => {
    return !api.hasOwnProperty('version');
  };

  /**
   * Compare two APIs for breaking or design changes.
   *
   * NOTE: Named with an underscore to avoid automatically defining `window.phetioCompareAPIs` as a global
   *
   * @param {API} referenceAPI - the "ground truth" or reference API
   * @param {API} proposedAPI - the proposed API for comparison with referenceAPI
   * @param _ - lodash, so this can be used from different contexts.
   * @param {function|undefined} assert - so this can be used from different contexts
   * @param {Object} [options]
   * @returns {{breakingProblems:string[], designedProblems:string[]}}
   */
  const _phetioCompareAPIs = (referenceAPI, proposedAPI, _, assert, options) => {
    // If the proposed version predates 1.0, then bring it forward to the structured tree with metadata under `_metadata`.
    if (isOldAPIVersion(proposedAPI)) {
      proposedAPI = toStructuredTree(proposedAPI, _);
    }
    if (isOldAPIVersion(referenceAPI)) {
      referenceAPI = toStructuredTree(referenceAPI, _);
    }
    options = _.merge({
      compareDesignedAPIChanges: true,
      compareBreakingAPIChanges: true
    }, options);
    const breakingProblems = [];
    const designedProblems = [];
    const appendProblem = (problemString, isDesignedProblem = false) => {
      if (isDesignedProblem && options.compareDesignedAPIChanges) {
        designedProblems.push(problemString);
      } else if (!isDesignedProblem && options.compareBreakingAPIChanges) {
        breakingProblems.push(problemString);
      }
    };

    /**
     * Visit one element along the APIs.
     * @param {string[]} trail - the path of tandem componentNames
     * @param {Object} reference - current value in the referenceAPI
     * @param {Object} proposed - current value in the proposedAPI
     * @param {boolean} isDesigned
     */
    const visit = (trail, reference, proposed, isDesigned) => {
      const phetioID = trail.join('.');

      // Detect an instrumented instance
      if (reference.hasOwnProperty(METADATA_KEY_NAME)) {
        // Override isDesigned, if specified
        isDesigned = isDesigned || reference[METADATA_KEY_NAME].phetioDesigned;
        const referenceCompleteMetadata = getMetadataValues(reference, referenceAPI, _, assert);
        const proposedCompleteMetadata = getMetadataValues(proposed, proposedAPI, _, assert);

        /**
         * Push any problems that may exist for the provided metadataKey.
         * @param {string} metadataKey - See PhetioObject.getMetadata()
         * @param {boolean} isDesignedChange - if the difference is from a design change, and not from a breaking change test
         * @param {*} [invalidProposedValue] - an optional new value that would signify a breaking change. Any other value would be acceptable.
         */
        const reportDifferences = (metadataKey, isDesignedChange, invalidProposedValue) => {
          const referenceValue = referenceCompleteMetadata[metadataKey];

          // Gracefully handle missing metadata from the <1.0 API format
          const proposedValue = proposedCompleteMetadata ? proposedCompleteMetadata[metadataKey] : {};
          if (referenceValue !== proposedValue) {
            // if proposed API is older (no version specified), ignore phetioArchetypePhetioID changed from null to undefined
            // because it used to be sparse, and in version 1.0 it became a default.
            const ignoreBrokenProposed = isOldAPIVersion(proposedAPI) && metadataKey === 'phetioArchetypePhetioID' && referenceValue === null && proposedValue === undefined;
            const ignoreBrokenReference = isOldAPIVersion(referenceAPI) && metadataKey === 'phetioArchetypePhetioID' && proposedValue === null && referenceValue === undefined;
            const ignore = ignoreBrokenProposed || ignoreBrokenReference;
            if (!ignore) {
              if (invalidProposedValue === undefined || isDesignedChange) {
                appendProblem(`${phetioID}.${metadataKey} changed from ${referenceValue} to ${proposedValue}`, isDesignedChange);
              } else if (!isDesignedChange) {
                if (proposedValue === invalidProposedValue) {
                  appendProblem(`${phetioID}.${metadataKey} changed from ${referenceValue} to ${proposedValue}`);
                } else {

                  // value changed, but it was a widening API (adding something to state, or making something read/write)
                }
              }
            }
          }
        };

        // Check for breaking changes
        reportDifferences('phetioTypeName', false);
        reportDifferences('phetioEventType', false);
        reportDifferences('phetioPlayback', false);
        reportDifferences('phetioDynamicElement', false);
        reportDifferences('phetioIsArchetype', false);
        reportDifferences('phetioArchetypePhetioID', false);
        reportDifferences('phetioState', false, false); // Only report if something became non-stateful
        reportDifferences('phetioReadOnly', false, true); // Only need to report if something became readOnly

        // The following metadata keys are non-breaking:
        // 'phetioDocumentation'
        // 'phetioFeatured'
        // 'phetioHighFrequency', non-breaking, assuming clients with data have the full data stream

        // Check for design changes
        if (isDesigned) {
          Object.keys(referenceCompleteMetadata).forEach(metadataKey => {
            reportDifferences(metadataKey, true);
          });
        }

        // If the reference file declares an initial state, check that it hasn't changed
        if (reference._data && reference._data.initialState) {
          // Detect missing expected state
          if (!proposed._data || !proposed._data.initialState) {
            const problemString = `${phetioID}._data.initialState is missing`;

            // Missing but expected state is a breaking problem
            appendProblem(problemString, false);

            // It is also a designed problem if we expected state in a designed subtree
            isDesigned && appendProblem(problemString, true);
          } else {
            const matches = _.isEqualWith(reference._data.initialState, proposed._data.initialState, (referenceState, proposedState) => {
              // The validValues of the localeProperty changes each time a new translation is submitted for a sim.
              if (phetioID === trail[0] + '.general.model.localeProperty') {
                // The sim must have all expected locales, but it is acceptable to add new ones without API error.
                return referenceState.validValues.every(validValue => proposedState.validValues.includes(validValue));
              }

              // Ignore any pointers, because they won't occur when generating the actual api, but may if a mouse is over a testing browser.
              if (phetioID === trail[0] + '.general.controller.input') {
                return _.isEqual({
                  ...referenceState,
                  pointers: null
                }, {
                  ...proposedState,
                  pointers: null
                });
              }

              // Ignore the scale's state, because it will be different at startup, depending on the user's window's
              // aspect ratio.
              if (phetioID === 'density.mysteryScreen.model.scale') {
                return true;
              }
              return undefined; // Meaning use the default lodash algorithm for comparison.
            });

            if (!matches) {
              const problemString = `${phetioID}._data.initialState differs. \nExpected:\n${JSON.stringify(reference._data.initialState)}\n actual:\n${JSON.stringify(proposed._data.initialState)}\n`;

              // A changed state value could break a client wrapper, so identify it with breaking changes.
              appendProblem(problemString, false);

              // It is also a designed problem if the proposed values deviate from the specified designed values
              isDesigned && appendProblem(problemString, true);
            }
          }
        }
      }

      // Recurse to children
      for (const componentName in reference) {
        if (reference.hasOwnProperty(componentName) && isChildKey(componentName)) {
          if (!proposed.hasOwnProperty(componentName)) {
            const problemString = `PhET-iO Element missing: ${phetioID}.${componentName}`;
            appendProblem(problemString, false);
            if (isDesigned) {
              appendProblem(problemString, true);
            }
          } else {
            visit(trail.concat(componentName), reference[componentName], proposed[componentName], isDesigned);
          }
        }
      }
      for (const componentName in proposed) {
        if (isDesigned && proposed.hasOwnProperty(componentName) && isChildKey(componentName) && !reference.hasOwnProperty(componentName)) {
          appendProblem(`New PhET-iO Element not in reference: ${phetioID}.${componentName}`, true);
        }
      }
    };
    visit([], referenceAPI.phetioElements, proposedAPI.phetioElements, false);

    // Check for: missing IO Types, missing methods, or differing parameter types or return types
    for (const typeName in referenceAPI.phetioTypes) {
      if (referenceAPI.phetioTypes.hasOwnProperty(typeName)) {
        // make sure we have the desired type
        if (!proposedAPI.phetioTypes.hasOwnProperty(typeName)) {
          appendProblem(`Type missing: ${typeName}`);
        } else {
          const referenceType = referenceAPI.phetioTypes[typeName];
          const proposedType = proposedAPI.phetioTypes[typeName];

          // make sure we have all of the methods
          const referenceMethods = referenceType.methods;
          const proposedMethods = proposedType.methods;
          for (const referenceMethod in referenceMethods) {
            if (referenceMethods.hasOwnProperty(referenceMethod)) {
              if (!proposedMethods.hasOwnProperty(referenceMethod)) {
                appendProblem(`Method missing, type=${typeName}, method=${referenceMethod}`);
              } else {
                // check parameter types (exact match)
                const referenceParams = referenceMethods[referenceMethod].parameterTypes;
                const proposedParams = proposedMethods[referenceMethod].parameterTypes;
                if (referenceParams.join(',') !== proposedParams.join(',')) {
                  appendProblem(`${typeName}.${referenceMethod} has different parameter types: [${referenceParams.join(', ')}] => [${proposedParams.join(', ')}]`);
                }
                const referenceReturnType = referenceMethods[referenceMethod].returnType;
                const proposedReturnType = proposedMethods[referenceMethod].returnType;
                if (referenceReturnType !== proposedReturnType) {
                  appendProblem(`${typeName}.${referenceMethod} has a different return type ${referenceReturnType} => ${proposedReturnType}`);
                }
              }
            }
          }

          // make sure we have all of the events (OK to add more)
          const referenceEvents = referenceType.events;
          const proposedEvents = proposedType.events;
          referenceEvents.forEach(event => {
            if (!proposedEvents.includes(event)) {
              appendProblem(`${typeName} is missing event: ${event}`);
            }
          });

          // make sure we have matching supertype names
          const referenceSupertypeName = referenceType.supertype;
          const proposedSupertypeName = proposedType.supertype;
          if (referenceSupertypeName !== proposedSupertypeName) {
            appendProblem(`${typeName} supertype changed from ${referenceSupertypeName} to ${proposedSupertypeName}. This may or may not 
          be a breaking change, but we are reporting it just in case.`);
          }

          // make sure we have matching parameter types
          const referenceParameterTypes = referenceType.parameterTypes || [];
          const proposedParameterTypes = proposedType.parameterTypes;
          if (!_.isEqual(referenceParameterTypes, proposedParameterTypes)) {
            appendProblem(`${typeName} parameter types changed from [${referenceParameterTypes.join(', ')}] to [${proposedParameterTypes.join(', ')}]. This may or may not 
          be a breaking change, but we are reporting it just in case.`);
          }

          // This check assumes that each API will be of a version that has metadataDefaults
          if (referenceAPI.version && proposedAPI.version) {
            // Check whether the default values have changed. See https://github.com/phetsims/phet-io/issues/1753
            const referenceDefaults = referenceAPI.phetioTypes[typeName].metadataDefaults;
            const proposedDefaults = proposedAPI.phetioTypes[typeName].metadataDefaults;
            Object.keys(referenceDefaults).forEach(key => {
              if (referenceDefaults[key] !== proposedDefaults[key]) {
                appendProblem(`${typeName} metadata value ${key} changed from ${referenceDefaults[key]} to ${proposedDefaults[key]}. This may or may not be a breaking change, but we are reporting it just in case.`);
              }
            });
          }
        }
      }
    }
    return {
      breakingProblems: breakingProblems,
      designedProblems: designedProblems
    };
  };

  // @public - used to "up-convert" an old versioned API to the new (version >=1), structured tree API.
  _phetioCompareAPIs.toStructuredTree = toStructuredTree;
  if (typeof window === 'undefined') {
    // running in node
    module.exports = _phetioCompareAPIs;
  } else {
    window.phetio = window.phetio || {};
    window.phetio.phetioCompareAPIs = _phetioCompareAPIs;
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNRVRBREFUQV9LRVlfTkFNRSIsIkRBVEFfS0VZX05BTUUiLCJpc0NoaWxkS2V5Iiwia2V5IiwidG9TdHJ1Y3R1cmVkVHJlZSIsImFwaSIsIl8iLCJzcGFyc2VBUEkiLCJjbG9uZURlZXAiLCJzcGFyc2VFbGVtZW50cyIsIk9iamVjdCIsImtleXMiLCJwaGV0aW9FbGVtZW50cyIsImZvckVhY2giLCJwaGV0aW9JRCIsImVudHJ5IiwiY2hhaW4iLCJzcGxpdCIsImxldmVsIiwiY29tcG9uZW50TmFtZSIsImdldE1ldGFkYXRhVmFsdWVzIiwicGhldGlvRWxlbWVudCIsImFzc2VydCIsInR5cGVOYW1lIiwicGhldGlvVHlwZU5hbWUiLCJ2ZXJzaW9uIiwiZGVmYXVsdHMiLCJnZXRNZXRhZGF0YURlZmF1bHRzIiwibWVyZ2UiLCJwaGV0aW9UeXBlcyIsInN1cGVydHlwZSIsIm1ldGFkYXRhRGVmYXVsdHMiLCJpc09sZEFQSVZlcnNpb24iLCJoYXNPd25Qcm9wZXJ0eSIsIl9waGV0aW9Db21wYXJlQVBJcyIsInJlZmVyZW5jZUFQSSIsInByb3Bvc2VkQVBJIiwib3B0aW9ucyIsImNvbXBhcmVEZXNpZ25lZEFQSUNoYW5nZXMiLCJjb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzIiwiYnJlYWtpbmdQcm9ibGVtcyIsImRlc2lnbmVkUHJvYmxlbXMiLCJhcHBlbmRQcm9ibGVtIiwicHJvYmxlbVN0cmluZyIsImlzRGVzaWduZWRQcm9ibGVtIiwicHVzaCIsInZpc2l0IiwidHJhaWwiLCJyZWZlcmVuY2UiLCJwcm9wb3NlZCIsImlzRGVzaWduZWQiLCJqb2luIiwicGhldGlvRGVzaWduZWQiLCJyZWZlcmVuY2VDb21wbGV0ZU1ldGFkYXRhIiwicHJvcG9zZWRDb21wbGV0ZU1ldGFkYXRhIiwicmVwb3J0RGlmZmVyZW5jZXMiLCJtZXRhZGF0YUtleSIsImlzRGVzaWduZWRDaGFuZ2UiLCJpbnZhbGlkUHJvcG9zZWRWYWx1ZSIsInJlZmVyZW5jZVZhbHVlIiwicHJvcG9zZWRWYWx1ZSIsImlnbm9yZUJyb2tlblByb3Bvc2VkIiwidW5kZWZpbmVkIiwiaWdub3JlQnJva2VuUmVmZXJlbmNlIiwiaWdub3JlIiwiX2RhdGEiLCJpbml0aWFsU3RhdGUiLCJtYXRjaGVzIiwiaXNFcXVhbFdpdGgiLCJyZWZlcmVuY2VTdGF0ZSIsInByb3Bvc2VkU3RhdGUiLCJ2YWxpZFZhbHVlcyIsImV2ZXJ5IiwidmFsaWRWYWx1ZSIsImluY2x1ZGVzIiwiaXNFcXVhbCIsInBvaW50ZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsImNvbmNhdCIsInJlZmVyZW5jZVR5cGUiLCJwcm9wb3NlZFR5cGUiLCJyZWZlcmVuY2VNZXRob2RzIiwibWV0aG9kcyIsInByb3Bvc2VkTWV0aG9kcyIsInJlZmVyZW5jZU1ldGhvZCIsInJlZmVyZW5jZVBhcmFtcyIsInBhcmFtZXRlclR5cGVzIiwicHJvcG9zZWRQYXJhbXMiLCJyZWZlcmVuY2VSZXR1cm5UeXBlIiwicmV0dXJuVHlwZSIsInByb3Bvc2VkUmV0dXJuVHlwZSIsInJlZmVyZW5jZUV2ZW50cyIsImV2ZW50cyIsInByb3Bvc2VkRXZlbnRzIiwiZXZlbnQiLCJyZWZlcmVuY2VTdXBlcnR5cGVOYW1lIiwicHJvcG9zZWRTdXBlcnR5cGVOYW1lIiwicmVmZXJlbmNlUGFyYW1ldGVyVHlwZXMiLCJwcm9wb3NlZFBhcmFtZXRlclR5cGVzIiwicmVmZXJlbmNlRGVmYXVsdHMiLCJwcm9wb3NlZERlZmF1bHRzIiwid2luZG93IiwibW9kdWxlIiwiZXhwb3J0cyIsInBoZXRpbyIsInBoZXRpb0NvbXBhcmVBUElzIl0sInNvdXJjZXMiOlsicGhldGlvQ29tcGFyZUFQSXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tcGFyZSBQaEVULWlPIEFQSXMgZm9yIHR3byB2ZXJzaW9ucyBvZiB0aGUgc2FtZSBzaW0uIFRoaXMgZnVuY3Rpb24gdHJlYXRzIHRoZSBmaXJzdCBBUEkgYXMgdGhlIFwiZ3JvdW5kIHRydXRoXCJcclxuICogYW5kIGNvbXBhcmVzIHRoZSBzZWNvbmQgQVBJIHRvIHNlZSBpZiBpdCBoYXMgYW55IGJyZWFraW5nIGNoYW5nZXMgYWdhaW5zdCB0aGUgZmlyc3QgQVBJLiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYVxyXG4gKiBsaXN0IG9mIFwicHJvYmxlbXNcIi5cclxuICpcclxuICogVGhpcyBmaWxlIHJ1bnMgaW4gbm9kZSAoY29tbWFuZCBsaW5lIEFQSSBjb21wYXJpc29uKSwgaW4gdGhlIGRpZmYgd3JhcHBlciAoY2xpZW50LWZhY2luZyBBUEkgY29tcGFyaXNvbikgYW5kXHJcbiAqIGluIHNpbXVsYXRpb25zIGluIHBoZXRpb0VuZ2luZSB3aGVuID9lYSZwaGV0aW9Db21wYXJlQVBJIGlzIHNwZWNpZmllZCAoZm9yIENUKS5cclxuICpcclxuICogTm90ZSB0aGF0IGV2ZW4gdGhvdWdoIGl0IGlzIGEgcHJlbG9hZCwgaXQgdXNlcyBhIGRpZmZlcmVudCBnbG9iYWwvbmFtZXNwYWNpbmcgcGF0dGVybiB0aGFuIHBoZXQtaW8taW5pdGlhbGl6ZS1nbG9iYWxzLmpzXHJcbiAqIGluIG9yZGVyIHRvIHNpbXBsaWZ5IHVzYWdlIGluIGFsbCB0aGVzZSBzaXRlcy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcblxyXG4vKipcclxuICogQHR5cGVkZWYgQVBJXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gcGhldGlvRnVsbEFQSVxyXG4gKiBAcHJvcGVydHkge09iamVjdH0gcGhldGlvRWxlbWVudHMgLSBwaGV0aW9FbGVtZW50cyBmb3IgdmVyc2lvbiA+PTEuMCB0aGlzIHdpbGwgYmUgYSBzcGFyc2UsIHRyZWUgbGlrZSBzdHJ1Y3R1cmUgd2l0aFxyXG4gKiAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEgaW4ga2V5OiBgX21ldGFkYXRhYC4gRm9yIHZlcnNpb248MSB0aGlzIHdpbGwgYmUgYSBmbGF0IGxpc3Qgd2l0aCBwaGV0aW9JRHMgYXMga2V5cyxcclxuICogICAgICAgICAgICAgICAgICAgIGFuZCB2YWx1ZXMgYXMgbWV0YWRhdGEuXHJcbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBwaGV0aW9UeXBlc1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBTZWUgcGhldGlvRW5naW5lLmpzIGZvciB3aGVyZSB0aGlzIGlzIGdlbmVyYXRlZCBpbiBtYXN0ZXIuIEtlZXAgaW4gbWluZCB0aGF0IHdlIHN1cHBvcnQgZGlmZmVyZW50IHZlcnNpb25zLCBpbmNsdWRpbmdcclxuICogQVBJcyB0aGF0IGRvbid0IGhhdmUgYSB2ZXJzaW9uIGF0dHJpYnV0ZS5cclxuICogQHR5cGVkZWYgQVBJXzFfMFxyXG4gKiBAZXh0ZW5kcyBBUElcclxuICogQHByb3BlcnR5IHt7bWFqb3I6bnVtYmVyLCBtaW5vcjpudW1iZXJ9fSB2ZXJzaW9uXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzaW1cclxuICovXHJcbiggKCkgPT4ge1xyXG5cclxuICBjb25zdCBNRVRBREFUQV9LRVlfTkFNRSA9ICdfbWV0YWRhdGEnO1xyXG4gIGNvbnN0IERBVEFfS0VZX05BTUUgPSAnX2RhdGEnO1xyXG5cclxuICAvLyBJcyBub3QgdGhlIHJlc2VydmVkIGtleXMgdG8gc3RvcmUgZGF0YS9tZXRhZGF0YSBvbiBQaEVULWlPIGVsZW1lbnRzLlxyXG4gIGNvbnN0IGlzQ2hpbGRLZXkgPSBrZXkgPT4ga2V5ICE9PSBNRVRBREFUQV9LRVlfTkFNRSAmJiBrZXkgIT09IERBVEFfS0VZX05BTUU7XHJcblxyXG4gIC8qKlxyXG4gICAqIFwidXAtY29udmVydFwiIGFuIEFQSSB0byBiZSBpbiB0aGUgZm9ybWF0IG9mIEFQSSB2ZXJzaW9uID49MS4wLiBUaGlzIGdlbmVyYWxseSBpcyB0aG91Z2h0IG9mIGFzIGEgXCJzcGFyc2UsIHRyZWUtbGlrZVwiIEFQSS5cclxuICAgKiBAcGFyYW0ge0FQSX0gYXBpXHJcbiAgICogQHBhcmFtIF9cclxuICAgKiBAcmV0dXJucyB7QVBJfSAtIEluIHRoaXMgdmVyc2lvbiwgcGhldGlvRWxlbWVudHMgd2lsbCBiZSBzdHJ1Y3R1cmVkIGFzIGEgdHJlZSwgYnV0IHdpbGwgaGF2ZSBhIHZlcmJvc2UgYW5kIGNvbXBsZXRlXHJcbiAgICogICAgICAgICAgICAgICAgICBzZXQgb2YgYWxsIG1ldGFkYXRhIGtleXMgZm9yIGVhY2ggZWxlbWVudC4gVGhlcmUgd2lsbCBub3QgYmUgYG1ldGFkYXRhRGVmYXVsdHNgIGluIGVhY2ggdHlwZS5cclxuICAgKi9cclxuICBjb25zdCB0b1N0cnVjdHVyZWRUcmVlID0gKCBhcGksIF8gKSA9PiB7XHJcbiAgICBjb25zdCBzcGFyc2VBUEkgPSBfLmNsb25lRGVlcCggYXBpICk7XHJcblxyXG4gICAgLy8gRFVQTElDQVRFRCB3aXRoIHBoZXRpb0VuZ2luZS5qc1xyXG4gICAgY29uc3Qgc3BhcnNlRWxlbWVudHMgPSB7fTtcclxuICAgIE9iamVjdC5rZXlzKCBhcGkucGhldGlvRWxlbWVudHMgKS5mb3JFYWNoKCBwaGV0aW9JRCA9PiB7XHJcbiAgICAgIGNvbnN0IGVudHJ5ID0gYXBpLnBoZXRpb0VsZW1lbnRzWyBwaGV0aW9JRCBdO1xyXG5cclxuICAgICAgLy8gQVBJIHZlcnNpb25zIDwgMS4wLCB1c2UgYSB0YW5kZW0gc2VwYXJhdG9yIG9mICcuJyAgSWYgd2UgZXZlciBjaGFuZ2UgdGhpcyBzZXBhcmF0b3IgaW4gbWFzdGVyIChob3BlZnVsbHkgbm90ISlcclxuICAgICAgLy8gdGhpcyB2YWx1ZSB3b3VsZG4ndCBjaGFuZ2Ugc2luY2UgaXQgcmVmbGVjdHMgdGhlIHByaW9yIGNvbW1pdHRlZCB2ZXJzaW9ucyB3aGljaCBkbyB1c2UgJy4nXHJcbiAgICAgIGNvbnN0IGNoYWluID0gcGhldGlvSUQuc3BsaXQoICcuJyApO1xyXG5cclxuICAgICAgLy8gRmlsbCBpbiBlYWNoIGxldmVsXHJcbiAgICAgIGxldCBsZXZlbCA9IHNwYXJzZUVsZW1lbnRzO1xyXG4gICAgICBjaGFpbi5mb3JFYWNoKCBjb21wb25lbnROYW1lID0+IHtcclxuICAgICAgICBsZXZlbFsgY29tcG9uZW50TmFtZSBdID0gbGV2ZWxbIGNvbXBvbmVudE5hbWUgXSB8fCB7fTtcclxuICAgICAgICBsZXZlbCA9IGxldmVsWyBjb21wb25lbnROYW1lIF07XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGxldmVsWyBNRVRBREFUQV9LRVlfTkFNRSBdID0ge307XHJcblxyXG4gICAgICBPYmplY3Qua2V5cyggZW50cnkgKS5mb3JFYWNoKCBrZXkgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIHdyaXRlIGFsbCB2YWx1ZXMgd2l0aG91dCB0cnlpbmcgdG8gZmFjdG9yIG91dCBkZWZhdWx0c1xyXG4gICAgICAgICAgbGV2ZWxbIE1FVEFEQVRBX0tFWV9OQU1FIF1bIGtleSBdID0gZW50cnlbIGtleSBdO1xyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBzcGFyc2VBUEkucGhldGlvRWxlbWVudHMgPSBzcGFyc2VFbGVtZW50cztcclxuICAgIHJldHVybiBzcGFyc2VBUEk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHBoZXRpb0VsZW1lbnRcclxuICAgKiBAcGFyYW0ge0FQSX0gYXBpXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IF8gLSBsb2Rhc2hcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufHVuZGVmaW5lZH0gYXNzZXJ0IC0gb3B0aW9uYWwgYXNzZXJ0XHJcbiAgICogQHJldHVybnMge09iamVjdH1cclxuICAgKi9cclxuICBjb25zdCBnZXRNZXRhZGF0YVZhbHVlcyA9ICggcGhldGlvRWxlbWVudCwgYXBpLCBfLCBhc3NlcnQgKSA9PiB7XHJcbiAgICBjb25zdCB0eXBlTmFtZSA9IHBoZXRpb0VsZW1lbnRbIE1FVEFEQVRBX0tFWV9OQU1FIF0gPyAoIHBoZXRpb0VsZW1lbnRbIE1FVEFEQVRBX0tFWV9OQU1FIF0ucGhldGlvVHlwZU5hbWUgfHwgJ09iamVjdElPJyApIDogJ09iamVjdElPJztcclxuXHJcbiAgICBpZiAoIGFwaS52ZXJzaW9uICkge1xyXG4gICAgICBjb25zdCBkZWZhdWx0cyA9IGdldE1ldGFkYXRhRGVmYXVsdHMoIHR5cGVOYW1lLCBhcGksIF8sIGFzc2VydCApO1xyXG4gICAgICByZXR1cm4gXy5tZXJnZSggZGVmYXVsdHMsIHBoZXRpb0VsZW1lbnRbIE1FVEFEQVRBX0tFWV9OQU1FIF0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gRGVuc2UgdmVyc2lvbiBzdXBwbGllcyBhbGwgbWV0YWRhdGEgdmFsdWVzXHJcbiAgICAgIHJldHVybiBwaGV0aW9FbGVtZW50WyBNRVRBREFUQV9LRVlfTkFNRSBdO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlTmFtZVxyXG4gICAqIEBwYXJhbSB7QVBJfSBhcGlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gXyAtIGxvZGFzaFxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb258dW5kZWZpbmVkfSBhc3NlcnQgLSBvcHRpb25hbCBhc3NlcnRcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGRlZmVuc2l2ZSBjb3B5LCBub24tbXV0YXRpbmdcclxuICAgKi9cclxuICBjb25zdCBnZXRNZXRhZGF0YURlZmF1bHRzID0gKCB0eXBlTmFtZSwgYXBpLCBfLCBhc3NlcnQgKSA9PiB7XHJcbiAgICBjb25zdCBlbnRyeSA9IGFwaS5waGV0aW9UeXBlc1sgdHlwZU5hbWUgXTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVudHJ5LCBgZW50cnkgbWlzc2luZzogJHt0eXBlTmFtZX1gICk7XHJcbiAgICBpZiAoIGVudHJ5LnN1cGVydHlwZSApIHtcclxuICAgICAgcmV0dXJuIF8ubWVyZ2UoIGdldE1ldGFkYXRhRGVmYXVsdHMoIGVudHJ5LnN1cGVydHlwZSwgYXBpLCBfICksIGVudHJ5Lm1ldGFkYXRhRGVmYXVsdHMgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gXy5tZXJnZSgge30sIGVudHJ5Lm1ldGFkYXRhRGVmYXVsdHMgKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0FQSX0gYXBpXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdGhlIEFQSSBpcyBvZiB0eXBlIEFQSV8xXzBcclxuICAgKi9cclxuICBjb25zdCBpc09sZEFQSVZlcnNpb24gPSBhcGkgPT4ge1xyXG4gICAgcmV0dXJuICFhcGkuaGFzT3duUHJvcGVydHkoICd2ZXJzaW9uJyApO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXBhcmUgdHdvIEFQSXMgZm9yIGJyZWFraW5nIG9yIGRlc2lnbiBjaGFuZ2VzLlxyXG4gICAqXHJcbiAgICogTk9URTogTmFtZWQgd2l0aCBhbiB1bmRlcnNjb3JlIHRvIGF2b2lkIGF1dG9tYXRpY2FsbHkgZGVmaW5pbmcgYHdpbmRvdy5waGV0aW9Db21wYXJlQVBJc2AgYXMgYSBnbG9iYWxcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QVBJfSByZWZlcmVuY2VBUEkgLSB0aGUgXCJncm91bmQgdHJ1dGhcIiBvciByZWZlcmVuY2UgQVBJXHJcbiAgICogQHBhcmFtIHtBUEl9IHByb3Bvc2VkQVBJIC0gdGhlIHByb3Bvc2VkIEFQSSBmb3IgY29tcGFyaXNvbiB3aXRoIHJlZmVyZW5jZUFQSVxyXG4gICAqIEBwYXJhbSBfIC0gbG9kYXNoLCBzbyB0aGlzIGNhbiBiZSB1c2VkIGZyb20gZGlmZmVyZW50IGNvbnRleHRzLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb258dW5kZWZpbmVkfSBhc3NlcnQgLSBzbyB0aGlzIGNhbiBiZSB1c2VkIGZyb20gZGlmZmVyZW50IGNvbnRleHRzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHt7YnJlYWtpbmdQcm9ibGVtczpzdHJpbmdbXSwgZGVzaWduZWRQcm9ibGVtczpzdHJpbmdbXX19XHJcbiAgICovXHJcbiAgY29uc3QgX3BoZXRpb0NvbXBhcmVBUElzID0gKCByZWZlcmVuY2VBUEksIHByb3Bvc2VkQVBJLCBfLCBhc3NlcnQsIG9wdGlvbnMgKSA9PiB7XHJcblxyXG4gICAgLy8gSWYgdGhlIHByb3Bvc2VkIHZlcnNpb24gcHJlZGF0ZXMgMS4wLCB0aGVuIGJyaW5nIGl0IGZvcndhcmQgdG8gdGhlIHN0cnVjdHVyZWQgdHJlZSB3aXRoIG1ldGFkYXRhIHVuZGVyIGBfbWV0YWRhdGFgLlxyXG4gICAgaWYgKCBpc09sZEFQSVZlcnNpb24oIHByb3Bvc2VkQVBJICkgKSB7XHJcbiAgICAgIHByb3Bvc2VkQVBJID0gdG9TdHJ1Y3R1cmVkVHJlZSggcHJvcG9zZWRBUEksIF8gKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGlzT2xkQVBJVmVyc2lvbiggcmVmZXJlbmNlQVBJICkgKSB7XHJcbiAgICAgIHJlZmVyZW5jZUFQSSA9IHRvU3RydWN0dXJlZFRyZWUoIHJlZmVyZW5jZUFQSSwgXyApO1xyXG4gICAgfVxyXG5cclxuICAgIG9wdGlvbnMgPSBfLm1lcmdlKCB7XHJcbiAgICAgIGNvbXBhcmVEZXNpZ25lZEFQSUNoYW5nZXM6IHRydWUsXHJcbiAgICAgIGNvbXBhcmVCcmVha2luZ0FQSUNoYW5nZXM6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBicmVha2luZ1Byb2JsZW1zID0gW107XHJcbiAgICBjb25zdCBkZXNpZ25lZFByb2JsZW1zID0gW107XHJcblxyXG4gICAgY29uc3QgYXBwZW5kUHJvYmxlbSA9ICggcHJvYmxlbVN0cmluZywgaXNEZXNpZ25lZFByb2JsZW0gPSBmYWxzZSApID0+IHtcclxuICAgICAgaWYgKCBpc0Rlc2lnbmVkUHJvYmxlbSAmJiBvcHRpb25zLmNvbXBhcmVEZXNpZ25lZEFQSUNoYW5nZXMgKSB7XHJcbiAgICAgICAgZGVzaWduZWRQcm9ibGVtcy5wdXNoKCBwcm9ibGVtU3RyaW5nICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICFpc0Rlc2lnbmVkUHJvYmxlbSAmJiBvcHRpb25zLmNvbXBhcmVCcmVha2luZ0FQSUNoYW5nZXMgKSB7XHJcbiAgICAgICAgYnJlYWtpbmdQcm9ibGVtcy5wdXNoKCBwcm9ibGVtU3RyaW5nICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBWaXNpdCBvbmUgZWxlbWVudCBhbG9uZyB0aGUgQVBJcy5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHRyYWlsIC0gdGhlIHBhdGggb2YgdGFuZGVtIGNvbXBvbmVudE5hbWVzXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcmVmZXJlbmNlIC0gY3VycmVudCB2YWx1ZSBpbiB0aGUgcmVmZXJlbmNlQVBJXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcG9zZWQgLSBjdXJyZW50IHZhbHVlIGluIHRoZSBwcm9wb3NlZEFQSVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0Rlc2lnbmVkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHZpc2l0ID0gKCB0cmFpbCwgcmVmZXJlbmNlLCBwcm9wb3NlZCwgaXNEZXNpZ25lZCApID0+IHtcclxuICAgICAgY29uc3QgcGhldGlvSUQgPSB0cmFpbC5qb2luKCAnLicgKTtcclxuXHJcbiAgICAgIC8vIERldGVjdCBhbiBpbnN0cnVtZW50ZWQgaW5zdGFuY2VcclxuICAgICAgaWYgKCByZWZlcmVuY2UuaGFzT3duUHJvcGVydHkoIE1FVEFEQVRBX0tFWV9OQU1FICkgKSB7XHJcblxyXG4gICAgICAgIC8vIE92ZXJyaWRlIGlzRGVzaWduZWQsIGlmIHNwZWNpZmllZFxyXG4gICAgICAgIGlzRGVzaWduZWQgPSBpc0Rlc2lnbmVkIHx8IHJlZmVyZW5jZVsgTUVUQURBVEFfS0VZX05BTUUgXS5waGV0aW9EZXNpZ25lZDtcclxuXHJcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlQ29tcGxldGVNZXRhZGF0YSA9IGdldE1ldGFkYXRhVmFsdWVzKCByZWZlcmVuY2UsIHJlZmVyZW5jZUFQSSwgXywgYXNzZXJ0ICk7XHJcbiAgICAgICAgY29uc3QgcHJvcG9zZWRDb21wbGV0ZU1ldGFkYXRhID0gZ2V0TWV0YWRhdGFWYWx1ZXMoIHByb3Bvc2VkLCBwcm9wb3NlZEFQSSwgXywgYXNzZXJ0ICk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFB1c2ggYW55IHByb2JsZW1zIHRoYXQgbWF5IGV4aXN0IGZvciB0aGUgcHJvdmlkZWQgbWV0YWRhdGFLZXkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1ldGFkYXRhS2V5IC0gU2VlIFBoZXRpb09iamVjdC5nZXRNZXRhZGF0YSgpXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBpc0Rlc2lnbmVkQ2hhbmdlIC0gaWYgdGhlIGRpZmZlcmVuY2UgaXMgZnJvbSBhIGRlc2lnbiBjaGFuZ2UsIGFuZCBub3QgZnJvbSBhIGJyZWFraW5nIGNoYW5nZSB0ZXN0XHJcbiAgICAgICAgICogQHBhcmFtIHsqfSBbaW52YWxpZFByb3Bvc2VkVmFsdWVdIC0gYW4gb3B0aW9uYWwgbmV3IHZhbHVlIHRoYXQgd291bGQgc2lnbmlmeSBhIGJyZWFraW5nIGNoYW5nZS4gQW55IG90aGVyIHZhbHVlIHdvdWxkIGJlIGFjY2VwdGFibGUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3QgcmVwb3J0RGlmZmVyZW5jZXMgPSAoIG1ldGFkYXRhS2V5LCBpc0Rlc2lnbmVkQ2hhbmdlLCBpbnZhbGlkUHJvcG9zZWRWYWx1ZSApID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZVZhbHVlID0gcmVmZXJlbmNlQ29tcGxldGVNZXRhZGF0YVsgbWV0YWRhdGFLZXkgXTtcclxuXHJcbiAgICAgICAgICAvLyBHcmFjZWZ1bGx5IGhhbmRsZSBtaXNzaW5nIG1ldGFkYXRhIGZyb20gdGhlIDwxLjAgQVBJIGZvcm1hdFxyXG4gICAgICAgICAgY29uc3QgcHJvcG9zZWRWYWx1ZSA9IHByb3Bvc2VkQ29tcGxldGVNZXRhZGF0YSA/IHByb3Bvc2VkQ29tcGxldGVNZXRhZGF0YVsgbWV0YWRhdGFLZXkgXSA6IHt9O1xyXG5cclxuICAgICAgICAgIGlmICggcmVmZXJlbmNlVmFsdWUgIT09IHByb3Bvc2VkVmFsdWUgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBwcm9wb3NlZCBBUEkgaXMgb2xkZXIgKG5vIHZlcnNpb24gc3BlY2lmaWVkKSwgaWdub3JlIHBoZXRpb0FyY2hldHlwZVBoZXRpb0lEIGNoYW5nZWQgZnJvbSBudWxsIHRvIHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGl0IHVzZWQgdG8gYmUgc3BhcnNlLCBhbmQgaW4gdmVyc2lvbiAxLjAgaXQgYmVjYW1lIGEgZGVmYXVsdC5cclxuICAgICAgICAgICAgY29uc3QgaWdub3JlQnJva2VuUHJvcG9zZWQgPSBpc09sZEFQSVZlcnNpb24oIHByb3Bvc2VkQVBJICkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YUtleSA9PT0gJ3BoZXRpb0FyY2hldHlwZVBoZXRpb0lEJyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVZhbHVlID09PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcG9zZWRWYWx1ZSA9PT0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaWdub3JlQnJva2VuUmVmZXJlbmNlID0gaXNPbGRBUElWZXJzaW9uKCByZWZlcmVuY2VBUEkgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YUtleSA9PT0gJ3BoZXRpb0FyY2hldHlwZVBoZXRpb0lEJyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wb3NlZFZhbHVlID09PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVZhbHVlID09PSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpZ25vcmUgPSBpZ25vcmVCcm9rZW5Qcm9wb3NlZCB8fCBpZ25vcmVCcm9rZW5SZWZlcmVuY2U7XHJcblxyXG4gICAgICAgICAgICBpZiAoICFpZ25vcmUgKSB7XHJcblxyXG4gICAgICAgICAgICAgIGlmICggaW52YWxpZFByb3Bvc2VkVmFsdWUgPT09IHVuZGVmaW5lZCB8fCBpc0Rlc2lnbmVkQ2hhbmdlICkge1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kUHJvYmxlbSggYCR7cGhldGlvSUR9LiR7bWV0YWRhdGFLZXl9IGNoYW5nZWQgZnJvbSAke3JlZmVyZW5jZVZhbHVlfSB0byAke3Byb3Bvc2VkVmFsdWV9YCwgaXNEZXNpZ25lZENoYW5nZSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIGlmICggIWlzRGVzaWduZWRDaGFuZ2UgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHByb3Bvc2VkVmFsdWUgPT09IGludmFsaWRQcm9wb3NlZFZhbHVlICkge1xyXG4gICAgICAgICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBgJHtwaGV0aW9JRH0uJHttZXRhZGF0YUtleX0gY2hhbmdlZCBmcm9tICR7cmVmZXJlbmNlVmFsdWV9IHRvICR7cHJvcG9zZWRWYWx1ZX1gICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIHZhbHVlIGNoYW5nZWQsIGJ1dCBpdCB3YXMgYSB3aWRlbmluZyBBUEkgKGFkZGluZyBzb21ldGhpbmcgdG8gc3RhdGUsIG9yIG1ha2luZyBzb21ldGhpbmcgcmVhZC93cml0ZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDaGVjayBmb3IgYnJlYWtpbmcgY2hhbmdlc1xyXG4gICAgICAgIHJlcG9ydERpZmZlcmVuY2VzKCAncGhldGlvVHlwZU5hbWUnLCBmYWxzZSApO1xyXG4gICAgICAgIHJlcG9ydERpZmZlcmVuY2VzKCAncGhldGlvRXZlbnRUeXBlJywgZmFsc2UgKTtcclxuICAgICAgICByZXBvcnREaWZmZXJlbmNlcyggJ3BoZXRpb1BsYXliYWNrJywgZmFsc2UgKTtcclxuICAgICAgICByZXBvcnREaWZmZXJlbmNlcyggJ3BoZXRpb0R5bmFtaWNFbGVtZW50JywgZmFsc2UgKTtcclxuICAgICAgICByZXBvcnREaWZmZXJlbmNlcyggJ3BoZXRpb0lzQXJjaGV0eXBlJywgZmFsc2UgKTtcclxuICAgICAgICByZXBvcnREaWZmZXJlbmNlcyggJ3BoZXRpb0FyY2hldHlwZVBoZXRpb0lEJywgZmFsc2UgKTtcclxuICAgICAgICByZXBvcnREaWZmZXJlbmNlcyggJ3BoZXRpb1N0YXRlJywgZmFsc2UsIGZhbHNlICk7IC8vIE9ubHkgcmVwb3J0IGlmIHNvbWV0aGluZyBiZWNhbWUgbm9uLXN0YXRlZnVsXHJcbiAgICAgICAgcmVwb3J0RGlmZmVyZW5jZXMoICdwaGV0aW9SZWFkT25seScsIGZhbHNlLCB0cnVlICk7IC8vIE9ubHkgbmVlZCB0byByZXBvcnQgaWYgc29tZXRoaW5nIGJlY2FtZSByZWFkT25seVxyXG5cclxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIG1ldGFkYXRhIGtleXMgYXJlIG5vbi1icmVha2luZzpcclxuICAgICAgICAvLyAncGhldGlvRG9jdW1lbnRhdGlvbidcclxuICAgICAgICAvLyAncGhldGlvRmVhdHVyZWQnXHJcbiAgICAgICAgLy8gJ3BoZXRpb0hpZ2hGcmVxdWVuY3knLCBub24tYnJlYWtpbmcsIGFzc3VtaW5nIGNsaWVudHMgd2l0aCBkYXRhIGhhdmUgdGhlIGZ1bGwgZGF0YSBzdHJlYW1cclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGRlc2lnbiBjaGFuZ2VzXHJcbiAgICAgICAgaWYgKCBpc0Rlc2lnbmVkICkge1xyXG4gICAgICAgICAgT2JqZWN0LmtleXMoIHJlZmVyZW5jZUNvbXBsZXRlTWV0YWRhdGEgKS5mb3JFYWNoKCBtZXRhZGF0YUtleSA9PiB7XHJcbiAgICAgICAgICAgIHJlcG9ydERpZmZlcmVuY2VzKCBtZXRhZGF0YUtleSwgdHJ1ZSApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHJlZmVyZW5jZSBmaWxlIGRlY2xhcmVzIGFuIGluaXRpYWwgc3RhdGUsIGNoZWNrIHRoYXQgaXQgaGFzbid0IGNoYW5nZWRcclxuICAgICAgICBpZiAoIHJlZmVyZW5jZS5fZGF0YSAmJiByZWZlcmVuY2UuX2RhdGEuaW5pdGlhbFN0YXRlICkge1xyXG5cclxuICAgICAgICAgIC8vIERldGVjdCBtaXNzaW5nIGV4cGVjdGVkIHN0YXRlXHJcbiAgICAgICAgICBpZiAoICFwcm9wb3NlZC5fZGF0YSB8fCAhcHJvcG9zZWQuX2RhdGEuaW5pdGlhbFN0YXRlICkge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9ibGVtU3RyaW5nID0gYCR7cGhldGlvSUR9Ll9kYXRhLmluaXRpYWxTdGF0ZSBpcyBtaXNzaW5nYDtcclxuXHJcbiAgICAgICAgICAgIC8vIE1pc3NpbmcgYnV0IGV4cGVjdGVkIHN0YXRlIGlzIGEgYnJlYWtpbmcgcHJvYmxlbVxyXG4gICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBwcm9ibGVtU3RyaW5nLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAgICAgLy8gSXQgaXMgYWxzbyBhIGRlc2lnbmVkIHByb2JsZW0gaWYgd2UgZXhwZWN0ZWQgc3RhdGUgaW4gYSBkZXNpZ25lZCBzdWJ0cmVlXHJcbiAgICAgICAgICAgIGlzRGVzaWduZWQgJiYgYXBwZW5kUHJvYmxlbSggcHJvYmxlbVN0cmluZywgdHJ1ZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gXy5pc0VxdWFsV2l0aCggcmVmZXJlbmNlLl9kYXRhLmluaXRpYWxTdGF0ZSwgcHJvcG9zZWQuX2RhdGEuaW5pdGlhbFN0YXRlLFxyXG4gICAgICAgICAgICAgICggcmVmZXJlbmNlU3RhdGUsIHByb3Bvc2VkU3RhdGUgKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVGhlIHZhbGlkVmFsdWVzIG9mIHRoZSBsb2NhbGVQcm9wZXJ0eSBjaGFuZ2VzIGVhY2ggdGltZSBhIG5ldyB0cmFuc2xhdGlvbiBpcyBzdWJtaXR0ZWQgZm9yIGEgc2ltLlxyXG4gICAgICAgICAgICAgICAgaWYgKCBwaGV0aW9JRCA9PT0gdHJhaWxbIDAgXSArICcuZ2VuZXJhbC5tb2RlbC5sb2NhbGVQcm9wZXJ0eScgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyBUaGUgc2ltIG11c3QgaGF2ZSBhbGwgZXhwZWN0ZWQgbG9jYWxlcywgYnV0IGl0IGlzIGFjY2VwdGFibGUgdG8gYWRkIG5ldyBvbmVzIHdpdGhvdXQgQVBJIGVycm9yLlxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVmZXJlbmNlU3RhdGUudmFsaWRWYWx1ZXMuZXZlcnkoIHZhbGlkVmFsdWUgPT4gcHJvcG9zZWRTdGF0ZS52YWxpZFZhbHVlcy5pbmNsdWRlcyggdmFsaWRWYWx1ZSApICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGFueSBwb2ludGVycywgYmVjYXVzZSB0aGV5IHdvbid0IG9jY3VyIHdoZW4gZ2VuZXJhdGluZyB0aGUgYWN0dWFsIGFwaSwgYnV0IG1heSBpZiBhIG1vdXNlIGlzIG92ZXIgYSB0ZXN0aW5nIGJyb3dzZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHBoZXRpb0lEID09PSAoIHRyYWlsWyAwIF0gKyAnLmdlbmVyYWwuY29udHJvbGxlci5pbnB1dCcgKSApIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNFcXVhbCggeyAuLi5yZWZlcmVuY2VTdGF0ZSwgcG9pbnRlcnM6IG51bGwgfSwgeyAuLi5wcm9wb3NlZFN0YXRlLCBwb2ludGVyczogbnVsbCB9ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIHRoZSBzY2FsZSdzIHN0YXRlLCBiZWNhdXNlIGl0IHdpbGwgYmUgZGlmZmVyZW50IGF0IHN0YXJ0dXAsIGRlcGVuZGluZyBvbiB0aGUgdXNlcidzIHdpbmRvdydzXHJcbiAgICAgICAgICAgICAgICAvLyBhc3BlY3QgcmF0aW8uXHJcbiAgICAgICAgICAgICAgICBpZiAoIHBoZXRpb0lEID09PSAnZGVuc2l0eS5teXN0ZXJ5U2NyZWVuLm1vZGVsLnNjYWxlJyApIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsgLy8gTWVhbmluZyB1c2UgdGhlIGRlZmF1bHQgbG9kYXNoIGFsZ29yaXRobSBmb3IgY29tcGFyaXNvbi5cclxuICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIGlmICggIW1hdGNoZXMgKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcHJvYmxlbVN0cmluZyA9IGAke3BoZXRpb0lEfS5fZGF0YS5pbml0aWFsU3RhdGUgZGlmZmVycy4gXFxuRXhwZWN0ZWQ6XFxuJHtKU09OLnN0cmluZ2lmeSggcmVmZXJlbmNlLl9kYXRhLmluaXRpYWxTdGF0ZSApfVxcbiBhY3R1YWw6XFxuJHtKU09OLnN0cmluZ2lmeSggcHJvcG9zZWQuX2RhdGEuaW5pdGlhbFN0YXRlICl9XFxuYDtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQSBjaGFuZ2VkIHN0YXRlIHZhbHVlIGNvdWxkIGJyZWFrIGEgY2xpZW50IHdyYXBwZXIsIHNvIGlkZW50aWZ5IGl0IHdpdGggYnJlYWtpbmcgY2hhbmdlcy5cclxuICAgICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBwcm9ibGVtU3RyaW5nLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAgICAgICAvLyBJdCBpcyBhbHNvIGEgZGVzaWduZWQgcHJvYmxlbSBpZiB0aGUgcHJvcG9zZWQgdmFsdWVzIGRldmlhdGUgZnJvbSB0aGUgc3BlY2lmaWVkIGRlc2lnbmVkIHZhbHVlc1xyXG4gICAgICAgICAgICAgIGlzRGVzaWduZWQgJiYgYXBwZW5kUHJvYmxlbSggcHJvYmxlbVN0cmluZywgdHJ1ZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZWN1cnNlIHRvIGNoaWxkcmVuXHJcbiAgICAgIGZvciAoIGNvbnN0IGNvbXBvbmVudE5hbWUgaW4gcmVmZXJlbmNlICkge1xyXG4gICAgICAgIGlmICggcmVmZXJlbmNlLmhhc093blByb3BlcnR5KCBjb21wb25lbnROYW1lICkgJiYgaXNDaGlsZEtleSggY29tcG9uZW50TmFtZSApICkge1xyXG5cclxuICAgICAgICAgIGlmICggIXByb3Bvc2VkLmhhc093blByb3BlcnR5KCBjb21wb25lbnROYW1lICkgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb2JsZW1TdHJpbmcgPSBgUGhFVC1pTyBFbGVtZW50IG1pc3Npbmc6ICR7cGhldGlvSUR9LiR7Y29tcG9uZW50TmFtZX1gO1xyXG4gICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBwcm9ibGVtU3RyaW5nLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBpc0Rlc2lnbmVkICkge1xyXG4gICAgICAgICAgICAgIGFwcGVuZFByb2JsZW0oIHByb2JsZW1TdHJpbmcsIHRydWUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZpc2l0KFxyXG4gICAgICAgICAgICAgIHRyYWlsLmNvbmNhdCggY29tcG9uZW50TmFtZSApLFxyXG4gICAgICAgICAgICAgIHJlZmVyZW5jZVsgY29tcG9uZW50TmFtZSBdLFxyXG4gICAgICAgICAgICAgIHByb3Bvc2VkWyBjb21wb25lbnROYW1lIF0sXHJcbiAgICAgICAgICAgICAgaXNEZXNpZ25lZFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yICggY29uc3QgY29tcG9uZW50TmFtZSBpbiBwcm9wb3NlZCApIHtcclxuICAgICAgICBpZiAoIGlzRGVzaWduZWQgJiYgcHJvcG9zZWQuaGFzT3duUHJvcGVydHkoIGNvbXBvbmVudE5hbWUgKSAmJiBpc0NoaWxkS2V5KCBjb21wb25lbnROYW1lICkgJiYgIXJlZmVyZW5jZS5oYXNPd25Qcm9wZXJ0eSggY29tcG9uZW50TmFtZSApICkge1xyXG4gICAgICAgICAgYXBwZW5kUHJvYmxlbSggYE5ldyBQaEVULWlPIEVsZW1lbnQgbm90IGluIHJlZmVyZW5jZTogJHtwaGV0aW9JRH0uJHtjb21wb25lbnROYW1lfWAsIHRydWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdmlzaXQoIFtdLCByZWZlcmVuY2VBUEkucGhldGlvRWxlbWVudHMsIHByb3Bvc2VkQVBJLnBoZXRpb0VsZW1lbnRzLCBmYWxzZSApO1xyXG5cclxuICAgIC8vIENoZWNrIGZvcjogbWlzc2luZyBJTyBUeXBlcywgbWlzc2luZyBtZXRob2RzLCBvciBkaWZmZXJpbmcgcGFyYW1ldGVyIHR5cGVzIG9yIHJldHVybiB0eXBlc1xyXG4gICAgZm9yICggY29uc3QgdHlwZU5hbWUgaW4gcmVmZXJlbmNlQVBJLnBoZXRpb1R5cGVzICkge1xyXG4gICAgICBpZiAoIHJlZmVyZW5jZUFQSS5waGV0aW9UeXBlcy5oYXNPd25Qcm9wZXJ0eSggdHlwZU5hbWUgKSApIHtcclxuXHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgdGhlIGRlc2lyZWQgdHlwZVxyXG4gICAgICAgIGlmICggIXByb3Bvc2VkQVBJLnBoZXRpb1R5cGVzLmhhc093blByb3BlcnR5KCB0eXBlTmFtZSApICkge1xyXG4gICAgICAgICAgYXBwZW5kUHJvYmxlbSggYFR5cGUgbWlzc2luZzogJHt0eXBlTmFtZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgY29uc3QgcmVmZXJlbmNlVHlwZSA9IHJlZmVyZW5jZUFQSS5waGV0aW9UeXBlc1sgdHlwZU5hbWUgXTtcclxuICAgICAgICAgIGNvbnN0IHByb3Bvc2VkVHlwZSA9IHByb3Bvc2VkQVBJLnBoZXRpb1R5cGVzWyB0eXBlTmFtZSBdO1xyXG5cclxuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIGFsbCBvZiB0aGUgbWV0aG9kc1xyXG4gICAgICAgICAgY29uc3QgcmVmZXJlbmNlTWV0aG9kcyA9IHJlZmVyZW5jZVR5cGUubWV0aG9kcztcclxuICAgICAgICAgIGNvbnN0IHByb3Bvc2VkTWV0aG9kcyA9IHByb3Bvc2VkVHlwZS5tZXRob2RzO1xyXG4gICAgICAgICAgZm9yICggY29uc3QgcmVmZXJlbmNlTWV0aG9kIGluIHJlZmVyZW5jZU1ldGhvZHMgKSB7XHJcbiAgICAgICAgICAgIGlmICggcmVmZXJlbmNlTWV0aG9kcy5oYXNPd25Qcm9wZXJ0eSggcmVmZXJlbmNlTWV0aG9kICkgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCAhcHJvcG9zZWRNZXRob2RzLmhhc093blByb3BlcnR5KCByZWZlcmVuY2VNZXRob2QgKSApIHtcclxuICAgICAgICAgICAgICAgIGFwcGVuZFByb2JsZW0oIGBNZXRob2QgbWlzc2luZywgdHlwZT0ke3R5cGVOYW1lfSwgbWV0aG9kPSR7cmVmZXJlbmNlTWV0aG9kfWAgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgcGFyYW1ldGVyIHR5cGVzIChleGFjdCBtYXRjaClcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZVBhcmFtcyA9IHJlZmVyZW5jZU1ldGhvZHNbIHJlZmVyZW5jZU1ldGhvZCBdLnBhcmFtZXRlclR5cGVzO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcG9zZWRQYXJhbXMgPSBwcm9wb3NlZE1ldGhvZHNbIHJlZmVyZW5jZU1ldGhvZCBdLnBhcmFtZXRlclR5cGVzO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggcmVmZXJlbmNlUGFyYW1zLmpvaW4oICcsJyApICE9PSBwcm9wb3NlZFBhcmFtcy5qb2luKCAnLCcgKSApIHtcclxuICAgICAgICAgICAgICAgICAgYXBwZW5kUHJvYmxlbSggYCR7dHlwZU5hbWV9LiR7cmVmZXJlbmNlTWV0aG9kfSBoYXMgZGlmZmVyZW50IHBhcmFtZXRlciB0eXBlczogWyR7cmVmZXJlbmNlUGFyYW1zLmpvaW4oICcsICcgKX1dID0+IFske3Byb3Bvc2VkUGFyYW1zLmpvaW4oICcsICcgKX1dYCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZVJldHVyblR5cGUgPSByZWZlcmVuY2VNZXRob2RzWyByZWZlcmVuY2VNZXRob2QgXS5yZXR1cm5UeXBlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcG9zZWRSZXR1cm5UeXBlID0gcHJvcG9zZWRNZXRob2RzWyByZWZlcmVuY2VNZXRob2QgXS5yZXR1cm5UeXBlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCByZWZlcmVuY2VSZXR1cm5UeXBlICE9PSBwcm9wb3NlZFJldHVyblR5cGUgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGFwcGVuZFByb2JsZW0oIGAke3R5cGVOYW1lfS4ke3JlZmVyZW5jZU1ldGhvZH0gaGFzIGEgZGlmZmVyZW50IHJldHVybiB0eXBlICR7cmVmZXJlbmNlUmV0dXJuVHlwZX0gPT4gJHtwcm9wb3NlZFJldHVyblR5cGV9YCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIGFsbCBvZiB0aGUgZXZlbnRzIChPSyB0byBhZGQgbW9yZSlcclxuICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZUV2ZW50cyA9IHJlZmVyZW5jZVR5cGUuZXZlbnRzO1xyXG4gICAgICAgICAgY29uc3QgcHJvcG9zZWRFdmVudHMgPSBwcm9wb3NlZFR5cGUuZXZlbnRzO1xyXG4gICAgICAgICAgcmVmZXJlbmNlRXZlbnRzLmZvckVhY2goIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgaWYgKCAhcHJvcG9zZWRFdmVudHMuaW5jbHVkZXMoIGV2ZW50ICkgKSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kUHJvYmxlbSggYCR7dHlwZU5hbWV9IGlzIG1pc3NpbmcgZXZlbnQ6ICR7ZXZlbnR9YCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgbWF0Y2hpbmcgc3VwZXJ0eXBlIG5hbWVzXHJcbiAgICAgICAgICBjb25zdCByZWZlcmVuY2VTdXBlcnR5cGVOYW1lID0gcmVmZXJlbmNlVHlwZS5zdXBlcnR5cGU7XHJcbiAgICAgICAgICBjb25zdCBwcm9wb3NlZFN1cGVydHlwZU5hbWUgPSBwcm9wb3NlZFR5cGUuc3VwZXJ0eXBlO1xyXG4gICAgICAgICAgaWYgKCByZWZlcmVuY2VTdXBlcnR5cGVOYW1lICE9PSBwcm9wb3NlZFN1cGVydHlwZU5hbWUgKSB7XHJcbiAgICAgICAgICAgIGFwcGVuZFByb2JsZW0oIGAke3R5cGVOYW1lfSBzdXBlcnR5cGUgY2hhbmdlZCBmcm9tICR7cmVmZXJlbmNlU3VwZXJ0eXBlTmFtZX0gdG8gJHtwcm9wb3NlZFN1cGVydHlwZU5hbWV9LiBUaGlzIG1heSBvciBtYXkgbm90IFxyXG4gICAgICAgICAgYmUgYSBicmVha2luZyBjaGFuZ2UsIGJ1dCB3ZSBhcmUgcmVwb3J0aW5nIGl0IGp1c3QgaW4gY2FzZS5gICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgbWF0Y2hpbmcgcGFyYW1ldGVyIHR5cGVzXHJcbiAgICAgICAgICBjb25zdCByZWZlcmVuY2VQYXJhbWV0ZXJUeXBlcyA9IHJlZmVyZW5jZVR5cGUucGFyYW1ldGVyVHlwZXMgfHwgW107XHJcbiAgICAgICAgICBjb25zdCBwcm9wb3NlZFBhcmFtZXRlclR5cGVzID0gcHJvcG9zZWRUeXBlLnBhcmFtZXRlclR5cGVzO1xyXG4gICAgICAgICAgaWYgKCAhXy5pc0VxdWFsKCByZWZlcmVuY2VQYXJhbWV0ZXJUeXBlcywgcHJvcG9zZWRQYXJhbWV0ZXJUeXBlcyApICkge1xyXG4gICAgICAgICAgICBhcHBlbmRQcm9ibGVtKCBgJHt0eXBlTmFtZX0gcGFyYW1ldGVyIHR5cGVzIGNoYW5nZWQgZnJvbSBbJHtyZWZlcmVuY2VQYXJhbWV0ZXJUeXBlcy5qb2luKCAnLCAnICl9XSB0byBbJHtwcm9wb3NlZFBhcmFtZXRlclR5cGVzLmpvaW4oICcsICcgKX1dLiBUaGlzIG1heSBvciBtYXkgbm90IFxyXG4gICAgICAgICAgYmUgYSBicmVha2luZyBjaGFuZ2UsIGJ1dCB3ZSBhcmUgcmVwb3J0aW5nIGl0IGp1c3QgaW4gY2FzZS5gICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gVGhpcyBjaGVjayBhc3N1bWVzIHRoYXQgZWFjaCBBUEkgd2lsbCBiZSBvZiBhIHZlcnNpb24gdGhhdCBoYXMgbWV0YWRhdGFEZWZhdWx0c1xyXG4gICAgICAgICAgaWYgKCByZWZlcmVuY2VBUEkudmVyc2lvbiAmJiBwcm9wb3NlZEFQSS52ZXJzaW9uICkge1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZGVmYXVsdCB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE3NTNcclxuICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlRGVmYXVsdHMgPSByZWZlcmVuY2VBUEkucGhldGlvVHlwZXNbIHR5cGVOYW1lIF0ubWV0YWRhdGFEZWZhdWx0cztcclxuICAgICAgICAgICAgY29uc3QgcHJvcG9zZWREZWZhdWx0cyA9IHByb3Bvc2VkQVBJLnBoZXRpb1R5cGVzWyB0eXBlTmFtZSBdLm1ldGFkYXRhRGVmYXVsdHM7XHJcblxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyggcmVmZXJlbmNlRGVmYXVsdHMgKS5mb3JFYWNoKCBrZXkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmICggcmVmZXJlbmNlRGVmYXVsdHNbIGtleSBdICE9PSBwcm9wb3NlZERlZmF1bHRzWyBrZXkgXSApIHtcclxuICAgICAgICAgICAgICAgIGFwcGVuZFByb2JsZW0oIGAke3R5cGVOYW1lfSBtZXRhZGF0YSB2YWx1ZSAke2tleX0gY2hhbmdlZCBmcm9tICR7cmVmZXJlbmNlRGVmYXVsdHNbIGtleSBdfSB0byAke3Byb3Bvc2VkRGVmYXVsdHNbIGtleSBdfS4gVGhpcyBtYXkgb3IgbWF5IG5vdCBiZSBhIGJyZWFraW5nIGNoYW5nZSwgYnV0IHdlIGFyZSByZXBvcnRpbmcgaXQganVzdCBpbiBjYXNlLmAgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBicmVha2luZ1Byb2JsZW1zOiBicmVha2luZ1Byb2JsZW1zLFxyXG4gICAgICBkZXNpZ25lZFByb2JsZW1zOiBkZXNpZ25lZFByb2JsZW1zXHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4vLyBAcHVibGljIC0gdXNlZCB0byBcInVwLWNvbnZlcnRcIiBhbiBvbGQgdmVyc2lvbmVkIEFQSSB0byB0aGUgbmV3ICh2ZXJzaW9uID49MSksIHN0cnVjdHVyZWQgdHJlZSBBUEkuXHJcbiAgX3BoZXRpb0NvbXBhcmVBUElzLnRvU3RydWN0dXJlZFRyZWUgPSB0b1N0cnVjdHVyZWRUcmVlO1xyXG5cclxuICBpZiAoIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnICkge1xyXG5cclxuICAgIC8vIHJ1bm5pbmcgaW4gbm9kZVxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfcGhldGlvQ29tcGFyZUFQSXM7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG5cclxuICAgIHdpbmRvdy5waGV0aW8gPSB3aW5kb3cucGhldGlvIHx8IHt9O1xyXG4gICAgd2luZG93LnBoZXRpby5waGV0aW9Db21wYXJlQVBJcyA9IF9waGV0aW9Db21wYXJlQVBJcztcclxuICB9XHJcbn0gKSgpO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBRSxNQUFNO0VBRU4sTUFBTUEsaUJBQWlCLEdBQUcsV0FBVztFQUNyQyxNQUFNQyxhQUFhLEdBQUcsT0FBTzs7RUFFN0I7RUFDQSxNQUFNQyxVQUFVLEdBQUdDLEdBQUcsSUFBSUEsR0FBRyxLQUFLSCxpQkFBaUIsSUFBSUcsR0FBRyxLQUFLRixhQUFhOztFQUU1RTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE1BQU1HLGdCQUFnQixHQUFHQSxDQUFFQyxHQUFHLEVB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