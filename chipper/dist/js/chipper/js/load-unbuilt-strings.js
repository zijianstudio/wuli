// Copyright 2020-2022, University of Colorado Boulder

/**
 * NOTE: This is only for loading strings in the unbuilt mode.
 *
 * NOTE: This will check the query string value for ?locale directly. See initialize-globals.js for reference.
 *
 * Kicks off the loading of runtime strings very early in the unbuilt loading process, ideally so that it
 * doesn't block the loading of modules. This is because we need the string information to be loaded before we can
 * kick off the module process.
 *
 * It will fill up phet.chipper.strings with the needed values, for use by simulation code and in particular
 * getStringModule. It will then call window.phet.chipper.loadModules() once complete, to progress with the module
 * process.
 *
 * To function properly, phet.chipper.stringRepos will need to be defined before this executes (generally in the
 * initialization script, or in the dev .html).
 *
 * A string "key" is in the form of "NAMESPACE/key.from.strings.json"
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

(() => {
  // Namespace verification
  window.phet = window.phet || {};
  window.phet.chipper = window.phet.chipper || {};

  // Constructing the string map
  window.phet.chipper.strings = {};
  window.phet.chipper.stringMetadata = {};

  // Prefixes, ideally a better way of accessing localeInfo on startup would exist. We have localeInfo, however it's
  // in the form of a module, and we can't use that at this point.
  const rtlLocales = ['ae', 'ar', 'fa', 'iw', 'ur'];
  const localeQueryParam = new window.URLSearchParams(window.location.search).get('locale');
  const localesQueryParam = new window.URLSearchParams(window.location.search).get('locales');
  let remainingFilesToProcess = 0;
  const FALLBACK_LOCALE = 'en';

  /**
   * Takes the string-file object for a given locale/requirejsNamespace, and fills in the phet.chipper.strings inside
   * that locale with any recognized strings inside.
   *
   * @param {Object} stringObject - In general, an object where if it has a `value: {string}` key then it represents
   *                                a string key with a value, otherwise each level represents a grouping.
   * @param {string} requirejsNamespace - e.g. 'JOIST'
   * @param {string} locale
   */
  const processStringFile = (stringObject, requirejsNamespace, locale) => {
    // See if we are in an RTL locale (lodash is unavailable at this point)
    let isRTL = false;
    rtlLocales.forEach(rtlLocale => {
      if (locale.startsWith(rtlLocale)) {
        isRTL = true;
      }
    });
    const stringKeyPrefix = `${requirejsNamespace}/`;

    // Ensure a locale-specific sub-object
    phet.chipper.strings[locale] = phet.chipper.strings[locale] || {};
    const localeStringMap = phet.chipper.strings[locale];
    const recurse = (path, object) => {
      Object.keys(object).forEach(key => {
        if (key === 'value') {
          let value = object.value;

          // Add directional marks
          if (value.length > 0) {
            value = `${isRTL ? '\u202b' : '\u202a'}${value}\u202c`;
          }
          const stringKey = `${stringKeyPrefix}${path}`;
          localeStringMap[stringKey] = value;
          if (locale === FALLBACK_LOCALE && object.metadata) {
            phet.chipper.stringMetadata[stringKey] = object.metadata;
          }
        } else if (object[key] && typeof object[key] === 'object') {
          recurse(`${path}${path.length ? '.' : ''}${key}`, object[key]);
        }
      });
    };
    recurse('', stringObject);
  };

  /**
   * Load a conglomerate string file with many locales. Only used in locales=*
   */
  const processConglomerateStringFile = (stringObject, requirejsNamespace) => {
    const locales = Object.keys(stringObject);
    locales.forEach(locale => {
      // See if we are in an RTL locale (lodash is unavailable at this point)
      let isRTL = false;
      rtlLocales.forEach(rtlLocale => {
        if (locale.startsWith(rtlLocale)) {
          isRTL = true;
        }
      });
      const stringKeyPrefix = `${requirejsNamespace}/`;

      // Ensure a locale-specific sub-object
      phet.chipper.strings[locale] = phet.chipper.strings[locale] || {};
      const localeStringMap = phet.chipper.strings[locale];
      const recurse = (path, object) => {
        Object.keys(object).forEach(key => {
          if (key === 'value') {
            let value = object.value;

            // Add directional marks
            if (value.length > 0) {
              value = `${isRTL ? '\u202b' : '\u202a'}${value}\u202c`;
            }
            localeStringMap[`${stringKeyPrefix}${path}`] = value;
          } else if (object[key] && typeof object[key] === 'object') {
            recurse(`${path}${path.length ? '.' : ''}${key}`, object[key]);
          }
        });
      };
      recurse('', stringObject[locale]);
    });
  };

  /**
   * Fires off a request for a JSON file, either in babel (for non-English) strings, or in the actual repo
   * (for English) strings, or for the unbuilt_en strings file. When it is loaded, it will try to parse the response
   * and then pass the object for processing.
   *
   * @param {string} path - Relative path to load JSON file from
   * @param {Function|null} callback
   */
  const requestJSONFile = (path, callback) => {
    remainingFilesToProcess++;
    const request = new XMLHttpRequest();
    request.addEventListener('load', () => {
      if (request.status === 200) {
        let json;
        try {
          json = JSON.parse(request.responseText);
        } catch (e) {
          throw new Error(`Could load file ${path}, perhaps that translation does not exist yet?`);
        }
        callback && callback(json);
      }
      if (--remainingFilesToProcess === 0) {
        finishProcessing();
      }
    });
    request.addEventListener('error', () => {
      if (!(localesQueryParam === '*')) {
        console.log(`Could not load ${path}`);
      }
      if (--remainingFilesToProcess === 0) {
        finishProcessing();
      }
    });
    request.open('GET', path, true);
    request.send();
  };

  // The callback to execute when all string files are processed.
  const finishProcessing = () => {
    // Progress with loading modules
    window.phet.chipper.loadModules();
  };
  let locales = [FALLBACK_LOCALE];
  if (localesQueryParam === '*') {
    locales = 'aa,ab,ae,af,ak,am,an,ar,ar_MA,ar_SA,as,av,ay,az,ba,be,bg,bh,bi,bm,bn,bo,br,bs,ca,ce,ch,co,cr,cs,cu,cv,cy,da,de,dv,dz,ee,el,en,en_CA,en_GB,eo,es,es_CO,es_CR,es_ES,es_MX,es_PE,et,eu,fa,ff,fi,fj,fo,fr,fu,fy,ga,gd,gl,gn,gu,gv,ha,hi,ho,hr,ht,hu,hy,hz,ia,ie,ig,ii,ik,in,io,is,it,iu,iw,ja,ji,jv,ka,kg,ki,kj,kk,kl,km,kn,ko,kr,ks,ku,ku_TR,kv,kw,ky,la,lb,lg,li,lk,ln,lo,lt,lu,lv,mg,mh,mi,mk,ml,mn,mo,mr,ms,mt,my,na,nb,nd,ne,ng,nl,nn,nr,nv,ny,oc,oj,om,or,os,pa,pi,pl,ps,pt,pt_BR,qu,rm,rn,ro,ru,rw,ry,sa,sc,sd,se,sg,sh,si,sk,sl,sm,sn,so,sq,sr,ss,st,su,sv,sw,ta,te,tg,th,ti,tk,tl,tn,to,tr,ts,tt,tw,ty,ug,uk,ur,uz,ve,vi,vo,wa,wo,xh,yo,za,zh_CN,zh_HK,zh_TW,zu'.split(',');
  } else {
    // Load other locales we might potentially need (keeping out duplicates)
    [localeQueryParam, ...(localesQueryParam ? localesQueryParam.split(',') : [])].forEach(locale => {
      if (locale) {
        // e.g. 'zh_CN'
        if (!locales.includes(locale)) {
          locales.push(locale);
        }
        // e.g. 'zh'
        const shortLocale = locale.slice(0, 2);
        if (locale.length > 2 && !locales.includes(shortLocale)) {
          locales.push(shortLocale);
        }
      }
    });
  }

  // Check for phet.chipper.stringPath. This should be set to ADJUST the path to the strings directory, in cases
  // where we're running this case NOT from a repo's top level (e.g. sandbox.html)
  const getStringPath = (repo, locale) => `${phet.chipper.stringPath ? phet.chipper.stringPath : ''}../${locale === FALLBACK_LOCALE ? '' : 'babel/'}${repo}/${repo}-strings_${locale}.json`;

  // See if our request for the sim-specific strings file works. If so, only then will we load the common repos files
  // for that locale.
  const ourRepo = phet.chipper.packageObject.name;
  let ourRequirejsNamespace;
  phet.chipper.stringRepos.forEach(data => {
    if (data.repo === ourRepo) {
      ourRequirejsNamespace = data.requirejsNamespace;
    }
  });

  // TODO https://github.com/phetsims/phet-io/issues/1877 Uncomment this to load the used string list
  // requestJSONFile( `../phet-io-sim-specific/repos/${ourRepo}/used-strings_en.json`, json => {
  //
  //   // Store for runtime usage
  //   phet.chipper.usedStringsEN = json;
  // } );

  if (localesQueryParam === '*') {
    // Load the conglomerate files
    requestJSONFile(`../babel/_generated_development_strings/${ourRepo}_all.json`, json => {
      processConglomerateStringFile(json, ourRequirejsNamespace);
      phet.chipper.stringRepos.forEach(stringRepoData => {
        const repo = stringRepoData.repo;
        if (repo !== ourRepo) {
          requestJSONFile(`../babel/_generated_development_strings/${repo}_all.json`, json => {
            processConglomerateStringFile(json, stringRepoData.requirejsNamespace);
          });
        }
      });
    });

    // Even though the English strings are included in the conglomerate file, load the english file directly so that
    // you can change _en strings without having to run 'grunt generate-unbuilt-strings' before seeing changes.
    requestJSONFile(getStringPath(ourRepo, 'en'), json => {
      processStringFile(json, ourRequirejsNamespace, 'en');
      phet.chipper.stringRepos.forEach(stringRepoData => {
        const repo = stringRepoData.repo;
        if (repo !== ourRepo) {
          requestJSONFile(getStringPath(repo, 'en'), json => {
            processStringFile(json, stringRepoData.requirejsNamespace, 'en');
          });
        }
      });
    });
  } else {
    // Load just the specified locales
    locales.forEach(locale => {
      requestJSONFile(getStringPath(ourRepo, locale), json => {
        processStringFile(json, ourRequirejsNamespace, locale);
        phet.chipper.stringRepos.forEach(stringRepoData => {
          const repo = stringRepoData.repo;
          if (repo !== ourRepo) {
            requestJSONFile(getStringPath(repo, locale), json => {
              processStringFile(json, stringRepoData.requirejsNamespace, locale);
            });
          }
        });
      });
    });
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3aW5kb3ciLCJwaGV0IiwiY2hpcHBlciIsInN0cmluZ3MiLCJzdHJpbmdNZXRhZGF0YSIsInJ0bExvY2FsZXMiLCJsb2NhbGVRdWVyeVBhcmFtIiwiVVJMU2VhcmNoUGFyYW1zIiwibG9jYXRpb24iLCJzZWFyY2giLCJnZXQiLCJsb2NhbGVzUXVlcnlQYXJhbSIsInJlbWFpbmluZ0ZpbGVzVG9Qcm9jZXNzIiwiRkFMTEJBQ0tfTE9DQUxFIiwicHJvY2Vzc1N0cmluZ0ZpbGUiLCJzdHJpbmdPYmplY3QiLCJyZXF1aXJlanNOYW1lc3BhY2UiLCJsb2NhbGUiLCJpc1JUTCIsImZvckVhY2giLCJydGxMb2NhbGUiLCJzdGFydHNXaXRoIiwic3RyaW5nS2V5UHJlZml4IiwibG9jYWxlU3RyaW5nTWFwIiwicmVjdXJzZSIsInBhdGgiLCJvYmplY3QiLCJPYmplY3QiLCJrZXlzIiwia2V5IiwidmFsdWUiLCJsZW5ndGgiLCJzdHJpbmdLZXkiLCJtZXRhZGF0YSIsInByb2Nlc3NDb25nbG9tZXJhdGVTdHJpbmdGaWxlIiwibG9jYWxlcyIsInJlcXVlc3RKU09ORmlsZSIsImNhbGxiYWNrIiwicmVxdWVzdCIsIlhNTEh0dHBSZXF1ZXN0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInN0YXR1cyIsImpzb24iLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZVRleHQiLCJlIiwiRXJyb3IiLCJmaW5pc2hQcm9jZXNzaW5nIiwiY29uc29sZSIsImxvZyIsIm9wZW4iLCJzZW5kIiwibG9hZE1vZHVsZXMiLCJzcGxpdCIsImluY2x1ZGVzIiwicHVzaCIsInNob3J0TG9jYWxlIiwic2xpY2UiLCJnZXRTdHJpbmdQYXRoIiwicmVwbyIsInN0cmluZ1BhdGgiLCJvdXJSZXBvIiwicGFja2FnZU9iamVjdCIsIm5hbWUiLCJvdXJSZXF1aXJlanNOYW1lc3BhY2UiLCJzdHJpbmdSZXBvcyIsImRhdGEiLCJzdHJpbmdSZXBvRGF0YSJdLCJzb3VyY2VzIjpbImxvYWQtdW5idWlsdC1zdHJpbmdzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5PVEU6IFRoaXMgaXMgb25seSBmb3IgbG9hZGluZyBzdHJpbmdzIGluIHRoZSB1bmJ1aWx0IG1vZGUuXHJcbiAqXHJcbiAqIE5PVEU6IFRoaXMgd2lsbCBjaGVjayB0aGUgcXVlcnkgc3RyaW5nIHZhbHVlIGZvciA/bG9jYWxlIGRpcmVjdGx5LiBTZWUgaW5pdGlhbGl6ZS1nbG9iYWxzLmpzIGZvciByZWZlcmVuY2UuXHJcbiAqXHJcbiAqIEtpY2tzIG9mZiB0aGUgbG9hZGluZyBvZiBydW50aW1lIHN0cmluZ3MgdmVyeSBlYXJseSBpbiB0aGUgdW5idWlsdCBsb2FkaW5nIHByb2Nlc3MsIGlkZWFsbHkgc28gdGhhdCBpdFxyXG4gKiBkb2Vzbid0IGJsb2NrIHRoZSBsb2FkaW5nIG9mIG1vZHVsZXMuIFRoaXMgaXMgYmVjYXVzZSB3ZSBuZWVkIHRoZSBzdHJpbmcgaW5mb3JtYXRpb24gdG8gYmUgbG9hZGVkIGJlZm9yZSB3ZSBjYW5cclxuICoga2ljayBvZmYgdGhlIG1vZHVsZSBwcm9jZXNzLlxyXG4gKlxyXG4gKiBJdCB3aWxsIGZpbGwgdXAgcGhldC5jaGlwcGVyLnN0cmluZ3Mgd2l0aCB0aGUgbmVlZGVkIHZhbHVlcywgZm9yIHVzZSBieSBzaW11bGF0aW9uIGNvZGUgYW5kIGluIHBhcnRpY3VsYXJcclxuICogZ2V0U3RyaW5nTW9kdWxlLiBJdCB3aWxsIHRoZW4gY2FsbCB3aW5kb3cucGhldC5jaGlwcGVyLmxvYWRNb2R1bGVzKCkgb25jZSBjb21wbGV0ZSwgdG8gcHJvZ3Jlc3Mgd2l0aCB0aGUgbW9kdWxlXHJcbiAqIHByb2Nlc3MuXHJcbiAqXHJcbiAqIFRvIGZ1bmN0aW9uIHByb3Blcmx5LCBwaGV0LmNoaXBwZXIuc3RyaW5nUmVwb3Mgd2lsbCBuZWVkIHRvIGJlIGRlZmluZWQgYmVmb3JlIHRoaXMgZXhlY3V0ZXMgKGdlbmVyYWxseSBpbiB0aGVcclxuICogaW5pdGlhbGl6YXRpb24gc2NyaXB0LCBvciBpbiB0aGUgZGV2IC5odG1sKS5cclxuICpcclxuICogQSBzdHJpbmcgXCJrZXlcIiBpcyBpbiB0aGUgZm9ybSBvZiBcIk5BTUVTUEFDRS9rZXkuZnJvbS5zdHJpbmdzLmpzb25cIlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuKCAoKSA9PiB7XHJcbiAgLy8gTmFtZXNwYWNlIHZlcmlmaWNhdGlvblxyXG4gIHdpbmRvdy5waGV0ID0gd2luZG93LnBoZXQgfHwge307XHJcbiAgd2luZG93LnBoZXQuY2hpcHBlciA9IHdpbmRvdy5waGV0LmNoaXBwZXIgfHwge307XHJcblxyXG4gIC8vIENvbnN0cnVjdGluZyB0aGUgc3RyaW5nIG1hcFxyXG4gIHdpbmRvdy5waGV0LmNoaXBwZXIuc3RyaW5ncyA9IHt9O1xyXG4gIHdpbmRvdy5waGV0LmNoaXBwZXIuc3RyaW5nTWV0YWRhdGEgPSB7fTtcclxuXHJcbiAgLy8gUHJlZml4ZXMsIGlkZWFsbHkgYSBiZXR0ZXIgd2F5IG9mIGFjY2Vzc2luZyBsb2NhbGVJbmZvIG9uIHN0YXJ0dXAgd291bGQgZXhpc3QuIFdlIGhhdmUgbG9jYWxlSW5mbywgaG93ZXZlciBpdCdzXHJcbiAgLy8gaW4gdGhlIGZvcm0gb2YgYSBtb2R1bGUsIGFuZCB3ZSBjYW4ndCB1c2UgdGhhdCBhdCB0aGlzIHBvaW50LlxyXG4gIGNvbnN0IHJ0bExvY2FsZXMgPSBbICdhZScsICdhcicsICdmYScsICdpdycsICd1cicgXTtcclxuXHJcbiAgY29uc3QgbG9jYWxlUXVlcnlQYXJhbSA9IG5ldyB3aW5kb3cuVVJMU2VhcmNoUGFyYW1zKCB3aW5kb3cubG9jYXRpb24uc2VhcmNoICkuZ2V0KCAnbG9jYWxlJyApO1xyXG4gIGNvbnN0IGxvY2FsZXNRdWVyeVBhcmFtID0gbmV3IHdpbmRvdy5VUkxTZWFyY2hQYXJhbXMoIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKS5nZXQoICdsb2NhbGVzJyApO1xyXG5cclxuICBsZXQgcmVtYWluaW5nRmlsZXNUb1Byb2Nlc3MgPSAwO1xyXG5cclxuICBjb25zdCBGQUxMQkFDS19MT0NBTEUgPSAnZW4nO1xyXG5cclxuICAvKipcclxuICAgKiBUYWtlcyB0aGUgc3RyaW5nLWZpbGUgb2JqZWN0IGZvciBhIGdpdmVuIGxvY2FsZS9yZXF1aXJlanNOYW1lc3BhY2UsIGFuZCBmaWxscyBpbiB0aGUgcGhldC5jaGlwcGVyLnN0cmluZ3MgaW5zaWRlXHJcbiAgICogdGhhdCBsb2NhbGUgd2l0aCBhbnkgcmVjb2duaXplZCBzdHJpbmdzIGluc2lkZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdHJpbmdPYmplY3QgLSBJbiBnZW5lcmFsLCBhbiBvYmplY3Qgd2hlcmUgaWYgaXQgaGFzIGEgYHZhbHVlOiB7c3RyaW5nfWAga2V5IHRoZW4gaXQgcmVwcmVzZW50c1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIHN0cmluZyBrZXkgd2l0aCBhIHZhbHVlLCBvdGhlcndpc2UgZWFjaCBsZXZlbCByZXByZXNlbnRzIGEgZ3JvdXBpbmcuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlcXVpcmVqc05hbWVzcGFjZSAtIGUuZy4gJ0pPSVNUJ1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhbGVcclxuICAgKi9cclxuICBjb25zdCBwcm9jZXNzU3RyaW5nRmlsZSA9ICggc3RyaW5nT2JqZWN0LCByZXF1aXJlanNOYW1lc3BhY2UsIGxvY2FsZSApID0+IHtcclxuICAgIC8vIFNlZSBpZiB3ZSBhcmUgaW4gYW4gUlRMIGxvY2FsZSAobG9kYXNoIGlzIHVuYXZhaWxhYmxlIGF0IHRoaXMgcG9pbnQpXHJcbiAgICBsZXQgaXNSVEwgPSBmYWxzZTtcclxuICAgIHJ0bExvY2FsZXMuZm9yRWFjaCggcnRsTG9jYWxlID0+IHtcclxuICAgICAgaWYgKCBsb2NhbGUuc3RhcnRzV2l0aCggcnRsTG9jYWxlICkgKSB7XHJcbiAgICAgICAgaXNSVEwgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3RyaW5nS2V5UHJlZml4ID0gYCR7cmVxdWlyZWpzTmFtZXNwYWNlfS9gO1xyXG5cclxuICAgIC8vIEVuc3VyZSBhIGxvY2FsZS1zcGVjaWZpYyBzdWItb2JqZWN0XHJcbiAgICBwaGV0LmNoaXBwZXIuc3RyaW5nc1sgbG9jYWxlIF0gPSBwaGV0LmNoaXBwZXIuc3RyaW5nc1sgbG9jYWxlIF0gfHwge307XHJcbiAgICBjb25zdCBsb2NhbGVTdHJpbmdNYXAgPSBwaGV0LmNoaXBwZXIuc3RyaW5nc1sgbG9jYWxlIF07XHJcblxyXG4gICAgY29uc3QgcmVjdXJzZSA9ICggcGF0aCwgb2JqZWN0ICkgPT4ge1xyXG4gICAgICBPYmplY3Qua2V5cyggb2JqZWN0ICkuZm9yRWFjaCgga2V5ID0+IHtcclxuICAgICAgICBpZiAoIGtleSA9PT0gJ3ZhbHVlJyApIHtcclxuICAgICAgICAgIGxldCB2YWx1ZSA9IG9iamVjdC52YWx1ZTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgZGlyZWN0aW9uYWwgbWFya3NcclxuICAgICAgICAgIGlmICggdmFsdWUubGVuZ3RoID4gMCApIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBgJHsoIGlzUlRMID8gJ1xcdTIwMmInIDogJ1xcdTIwMmEnICl9JHt2YWx1ZX1cXHUyMDJjYDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBzdHJpbmdLZXkgPSBgJHtzdHJpbmdLZXlQcmVmaXh9JHtwYXRofWA7XHJcblxyXG4gICAgICAgICAgbG9jYWxlU3RyaW5nTWFwWyBzdHJpbmdLZXkgXSA9IHZhbHVlO1xyXG5cclxuICAgICAgICAgIGlmICggbG9jYWxlID09PSBGQUxMQkFDS19MT0NBTEUgJiYgb2JqZWN0Lm1ldGFkYXRhICkge1xyXG4gICAgICAgICAgICBwaGV0LmNoaXBwZXIuc3RyaW5nTWV0YWRhdGFbIHN0cmluZ0tleSBdID0gb2JqZWN0Lm1ldGFkYXRhO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggb2JqZWN0WyBrZXkgXSAmJiB0eXBlb2Ygb2JqZWN0WyBrZXkgXSA9PT0gJ29iamVjdCcgKSB7XHJcbiAgICAgICAgICByZWN1cnNlKCBgJHtwYXRofSR7cGF0aC5sZW5ndGggPyAnLicgOiAnJ30ke2tleX1gLCBvYmplY3RbIGtleSBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG4gICAgcmVjdXJzZSggJycsIHN0cmluZ09iamVjdCApO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIExvYWQgYSBjb25nbG9tZXJhdGUgc3RyaW5nIGZpbGUgd2l0aCBtYW55IGxvY2FsZXMuIE9ubHkgdXNlZCBpbiBsb2NhbGVzPSpcclxuICAgKi9cclxuICBjb25zdCBwcm9jZXNzQ29uZ2xvbWVyYXRlU3RyaW5nRmlsZSA9ICggc3RyaW5nT2JqZWN0LCByZXF1aXJlanNOYW1lc3BhY2UgKSA9PiB7XHJcblxyXG4gICAgY29uc3QgbG9jYWxlcyA9IE9iamVjdC5rZXlzKCBzdHJpbmdPYmplY3QgKTtcclxuXHJcbiAgICBsb2NhbGVzLmZvckVhY2goIGxvY2FsZSA9PiB7XHJcblxyXG4gICAgICAvLyBTZWUgaWYgd2UgYXJlIGluIGFuIFJUTCBsb2NhbGUgKGxvZGFzaCBpcyB1bmF2YWlsYWJsZSBhdCB0aGlzIHBvaW50KVxyXG4gICAgICBsZXQgaXNSVEwgPSBmYWxzZTtcclxuICAgICAgcnRsTG9jYWxlcy5mb3JFYWNoKCBydGxMb2NhbGUgPT4ge1xyXG4gICAgICAgIGlmICggbG9jYWxlLnN0YXJ0c1dpdGgoIHJ0bExvY2FsZSApICkge1xyXG4gICAgICAgICAgaXNSVEwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3Qgc3RyaW5nS2V5UHJlZml4ID0gYCR7cmVxdWlyZWpzTmFtZXNwYWNlfS9gO1xyXG5cclxuICAgICAgLy8gRW5zdXJlIGEgbG9jYWxlLXNwZWNpZmljIHN1Yi1vYmplY3RcclxuICAgICAgcGhldC5jaGlwcGVyLnN0cmluZ3NbIGxvY2FsZSBdID0gcGhldC5jaGlwcGVyLnN0cmluZ3NbIGxvY2FsZSBdIHx8IHt9O1xyXG4gICAgICBjb25zdCBsb2NhbGVTdHJpbmdNYXAgPSBwaGV0LmNoaXBwZXIuc3RyaW5nc1sgbG9jYWxlIF07XHJcblxyXG4gICAgICBjb25zdCByZWN1cnNlID0gKCBwYXRoLCBvYmplY3QgKSA9PiB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMoIG9iamVjdCApLmZvckVhY2goIGtleSA9PiB7XHJcbiAgICAgICAgICBpZiAoIGtleSA9PT0gJ3ZhbHVlJyApIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gb2JqZWN0LnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGRpcmVjdGlvbmFsIG1hcmtzXHJcbiAgICAgICAgICAgIGlmICggdmFsdWUubGVuZ3RoID4gMCApIHtcclxuICAgICAgICAgICAgICB2YWx1ZSA9IGAkeyggaXNSVEwgPyAnXFx1MjAyYicgOiAnXFx1MjAyYScgKX0ke3ZhbHVlfVxcdTIwMmNgO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsb2NhbGVTdHJpbmdNYXBbIGAke3N0cmluZ0tleVByZWZpeH0ke3BhdGh9YCBdID0gdmFsdWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggb2JqZWN0WyBrZXkgXSAmJiB0eXBlb2Ygb2JqZWN0WyBrZXkgXSA9PT0gJ29iamVjdCcgKSB7XHJcbiAgICAgICAgICAgIHJlY3Vyc2UoIGAke3BhdGh9JHtwYXRoLmxlbmd0aCA/ICcuJyA6ICcnfSR7a2V5fWAsIG9iamVjdFsga2V5IF0gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH07XHJcbiAgICAgIHJlY3Vyc2UoICcnLCBzdHJpbmdPYmplY3RbIGxvY2FsZSBdICk7XHJcbiAgICB9ICk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRmlyZXMgb2ZmIGEgcmVxdWVzdCBmb3IgYSBKU09OIGZpbGUsIGVpdGhlciBpbiBiYWJlbCAoZm9yIG5vbi1FbmdsaXNoKSBzdHJpbmdzLCBvciBpbiB0aGUgYWN0dWFsIHJlcG9cclxuICAgKiAoZm9yIEVuZ2xpc2gpIHN0cmluZ3MsIG9yIGZvciB0aGUgdW5idWlsdF9lbiBzdHJpbmdzIGZpbGUuIFdoZW4gaXQgaXMgbG9hZGVkLCBpdCB3aWxsIHRyeSB0byBwYXJzZSB0aGUgcmVzcG9uc2VcclxuICAgKiBhbmQgdGhlbiBwYXNzIHRoZSBvYmplY3QgZm9yIHByb2Nlc3NpbmcuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIFJlbGF0aXZlIHBhdGggdG8gbG9hZCBKU09OIGZpbGUgZnJvbVxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb258bnVsbH0gY2FsbGJhY2tcclxuICAgKi9cclxuICBjb25zdCByZXF1ZXN0SlNPTkZpbGUgPSAoIHBhdGgsIGNhbGxiYWNrICkgPT4ge1xyXG4gICAgcmVtYWluaW5nRmlsZXNUb1Byb2Nlc3MrKztcclxuXHJcbiAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgKCkgPT4ge1xyXG4gICAgICBpZiAoIHJlcXVlc3Quc3RhdHVzID09PSAyMDAgKSB7XHJcbiAgICAgICAgbGV0IGpzb247XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKCByZXF1ZXN0LnJlc3BvbnNlVGV4dCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYENvdWxkIGxvYWQgZmlsZSAke3BhdGh9LCBwZXJoYXBzIHRoYXQgdHJhbnNsYXRpb24gZG9lcyBub3QgZXhpc3QgeWV0P2AgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soIGpzb24gKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIC0tcmVtYWluaW5nRmlsZXNUb1Byb2Nlc3MgPT09IDAgKSB7XHJcbiAgICAgICAgZmluaXNoUHJvY2Vzc2luZygpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCAoKSA9PiB7XHJcbiAgICAgIGlmICggISggbG9jYWxlc1F1ZXJ5UGFyYW0gPT09ICcqJyApICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBgQ291bGQgbm90IGxvYWQgJHtwYXRofWAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIC0tcmVtYWluaW5nRmlsZXNUb1Byb2Nlc3MgPT09IDAgKSB7XHJcbiAgICAgICAgZmluaXNoUHJvY2Vzc2luZygpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmVxdWVzdC5vcGVuKCAnR0VUJywgcGF0aCwgdHJ1ZSApO1xyXG4gICAgcmVxdWVzdC5zZW5kKCk7XHJcbiAgfTtcclxuXHJcbiAgLy8gVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiBhbGwgc3RyaW5nIGZpbGVzIGFyZSBwcm9jZXNzZWQuXHJcbiAgY29uc3QgZmluaXNoUHJvY2Vzc2luZyA9ICgpID0+IHtcclxuXHJcbiAgICAvLyBQcm9ncmVzcyB3aXRoIGxvYWRpbmcgbW9kdWxlc1xyXG4gICAgd2luZG93LnBoZXQuY2hpcHBlci5sb2FkTW9kdWxlcygpO1xyXG4gIH07XHJcblxyXG4gIGxldCBsb2NhbGVzID0gWyBGQUxMQkFDS19MT0NBTEUgXTtcclxuXHJcbiAgaWYgKCBsb2NhbGVzUXVlcnlQYXJhbSA9PT0gJyonICkge1xyXG4gICAgbG9jYWxlcyA9ICdhYSxhYixhZSxhZixhayxhbSxhbixhcixhcl9NQSxhcl9TQSxhcyxhdixheSxheixiYSxiZSxiZyxiaCxiaSxibSxibixibyxicixicyxjYSxjZSxjaCxjbyxjcixjcyxjdSxjdixjeSxkYSxkZSxkdixkeixlZSxlbCxlbixlbl9DQSxlbl9HQixlbyxlcyxlc19DTyxlc19DUixlc19FUyxlc19NWCxlc19QRSxldCxldSxmYSxmZixmaSxmaixmbyxmcixmdSxmeSxnYSxnZCxnbCxnbixndSxndixoYSxoaSxobyxocixodCxodSxoeSxoeixpYSxpZSxpZyxpaSxpayxpbixpbyxpcyxpdCxpdSxpdyxqYSxqaSxqdixrYSxrZyxraSxraixrayxrbCxrbSxrbixrbyxrcixrcyxrdSxrdV9UUixrdixrdyxreSxsYSxsYixsZyxsaSxsayxsbixsbyxsdCxsdSxsdixtZyxtaCxtaSxtayxtbCxtbixtbyxtcixtcyxtdCxteSxuYSxuYixuZCxuZSxuZyxubCxubixucixudixueSxvYyxvaixvbSxvcixvcyxwYSxwaSxwbCxwcyxwdCxwdF9CUixxdSxybSxybixybyxydSxydyxyeSxzYSxzYyxzZCxzZSxzZyxzaCxzaSxzayxzbCxzbSxzbixzbyxzcSxzcixzcyxzdCxzdSxzdixzdyx0YSx0ZSx0Zyx0aCx0aSx0ayx0bCx0bix0byx0cix0cyx0dCx0dyx0eSx1Zyx1ayx1cix1eix2ZSx2aSx2byx3YSx3byx4aCx5byx6YSx6aF9DTix6aF9ISyx6aF9UVyx6dScuc3BsaXQoICcsJyApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIC8vIExvYWQgb3RoZXIgbG9jYWxlcyB3ZSBtaWdodCBwb3RlbnRpYWxseSBuZWVkIChrZWVwaW5nIG91dCBkdXBsaWNhdGVzKVxyXG4gICAgW1xyXG4gICAgICBsb2NhbGVRdWVyeVBhcmFtLFxyXG4gICAgICAuLi4oIGxvY2FsZXNRdWVyeVBhcmFtID8gbG9jYWxlc1F1ZXJ5UGFyYW0uc3BsaXQoICcsJyApIDogW10gKVxyXG4gICAgXS5mb3JFYWNoKCBsb2NhbGUgPT4ge1xyXG4gICAgICBpZiAoIGxvY2FsZSApIHtcclxuICAgICAgICAvLyBlLmcuICd6aF9DTidcclxuICAgICAgICBpZiAoICFsb2NhbGVzLmluY2x1ZGVzKCBsb2NhbGUgKSApIHtcclxuICAgICAgICAgIGxvY2FsZXMucHVzaCggbG9jYWxlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGUuZy4gJ3poJ1xyXG4gICAgICAgIGNvbnN0IHNob3J0TG9jYWxlID0gbG9jYWxlLnNsaWNlKCAwLCAyICk7XHJcbiAgICAgICAgaWYgKCBsb2NhbGUubGVuZ3RoID4gMiAmJiAhbG9jYWxlcy5pbmNsdWRlcyggc2hvcnRMb2NhbGUgKSApIHtcclxuICAgICAgICAgIGxvY2FsZXMucHVzaCggc2hvcnRMb2NhbGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGZvciBwaGV0LmNoaXBwZXIuc3RyaW5nUGF0aC4gVGhpcyBzaG91bGQgYmUgc2V0IHRvIEFESlVTVCB0aGUgcGF0aCB0byB0aGUgc3RyaW5ncyBkaXJlY3RvcnksIGluIGNhc2VzXHJcbiAgLy8gd2hlcmUgd2UncmUgcnVubmluZyB0aGlzIGNhc2UgTk9UIGZyb20gYSByZXBvJ3MgdG9wIGxldmVsIChlLmcuIHNhbmRib3guaHRtbClcclxuICBjb25zdCBnZXRTdHJpbmdQYXRoID0gKCByZXBvLCBsb2NhbGUgKSA9PiBgJHtwaGV0LmNoaXBwZXIuc3RyaW5nUGF0aCA/IHBoZXQuY2hpcHBlci5zdHJpbmdQYXRoIDogJyd9Li4vJHtsb2NhbGUgPT09IEZBTExCQUNLX0xPQ0FMRSA/ICcnIDogJ2JhYmVsLyd9JHtyZXBvfS8ke3JlcG99LXN0cmluZ3NfJHtsb2NhbGV9Lmpzb25gO1xyXG5cclxuICAvLyBTZWUgaWYgb3VyIHJlcXVlc3QgZm9yIHRoZSBzaW0tc3BlY2lmaWMgc3RyaW5ncyBmaWxlIHdvcmtzLiBJZiBzbywgb25seSB0aGVuIHdpbGwgd2UgbG9hZCB0aGUgY29tbW9uIHJlcG9zIGZpbGVzXHJcbiAgLy8gZm9yIHRoYXQgbG9jYWxlLlxyXG4gIGNvbnN0IG91clJlcG8gPSBwaGV0LmNoaXBwZXIucGFja2FnZU9iamVjdC5uYW1lO1xyXG4gIGxldCBvdXJSZXF1aXJlanNOYW1lc3BhY2U7XHJcbiAgcGhldC5jaGlwcGVyLnN0cmluZ1JlcG9zLmZvckVhY2goIGRhdGEgPT4ge1xyXG4gICAgaWYgKCBkYXRhLnJlcG8gPT09IG91clJlcG8gKSB7XHJcbiAgICAgIG91clJlcXVpcmVqc05hbWVzcGFjZSA9IGRhdGEucmVxdWlyZWpzTmFtZXNwYWNlO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgLy8gVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg3NyBVbmNvbW1lbnQgdGhpcyB0byBsb2FkIHRoZSB1c2VkIHN0cmluZyBsaXN0XHJcbiAgLy8gcmVxdWVzdEpTT05GaWxlKCBgLi4vcGhldC1pby1zaW0tc3BlY2lmaWMvcmVwb3MvJHtvdXJSZXBvfS91c2VkLXN0cmluZ3NfZW4uanNvbmAsIGpzb24gPT4ge1xyXG4gIC8vXHJcbiAgLy8gICAvLyBTdG9yZSBmb3IgcnVudGltZSB1c2FnZVxyXG4gIC8vICAgcGhldC5jaGlwcGVyLnVzZWRTdHJpbmdzRU4gPSBqc29uO1xyXG4gIC8vIH0gKTtcclxuXHJcbiAgaWYgKCBsb2NhbGVzUXVlcnlQYXJhbSA9PT0gJyonICkge1xyXG5cclxuICAgIC8vIExvYWQgdGhlIGNvbmdsb21lcmF0ZSBmaWxlc1xyXG4gICAgcmVxdWVzdEpTT05GaWxlKCBgLi4vYmFiZWwvX2dlbmVyYXRlZF9kZXZlbG9wbWVudF9zdHJpbmdzLyR7b3VyUmVwb31fYWxsLmpzb25gLCBqc29uID0+IHtcclxuICAgICAgcHJvY2Vzc0Nvbmdsb21lcmF0ZVN0cmluZ0ZpbGUoIGpzb24sIG91clJlcXVpcmVqc05hbWVzcGFjZSApO1xyXG4gICAgICBwaGV0LmNoaXBwZXIuc3RyaW5nUmVwb3MuZm9yRWFjaCggc3RyaW5nUmVwb0RhdGEgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlcG8gPSBzdHJpbmdSZXBvRGF0YS5yZXBvO1xyXG4gICAgICAgIGlmICggcmVwbyAhPT0gb3VyUmVwbyApIHtcclxuICAgICAgICAgIHJlcXVlc3RKU09ORmlsZSggYC4uL2JhYmVsL19nZW5lcmF0ZWRfZGV2ZWxvcG1lbnRfc3RyaW5ncy8ke3JlcG99X2FsbC5qc29uYCwganNvbiA9PiB7XHJcbiAgICAgICAgICAgIHByb2Nlc3NDb25nbG9tZXJhdGVTdHJpbmdGaWxlKCBqc29uLCBzdHJpbmdSZXBvRGF0YS5yZXF1aXJlanNOYW1lc3BhY2UgKTtcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBFdmVuIHRob3VnaCB0aGUgRW5nbGlzaCBzdHJpbmdzIGFyZSBpbmNsdWRlZCBpbiB0aGUgY29uZ2xvbWVyYXRlIGZpbGUsIGxvYWQgdGhlIGVuZ2xpc2ggZmlsZSBkaXJlY3RseSBzbyB0aGF0XHJcbiAgICAvLyB5b3UgY2FuIGNoYW5nZSBfZW4gc3RyaW5ncyB3aXRob3V0IGhhdmluZyB0byBydW4gJ2dydW50IGdlbmVyYXRlLXVuYnVpbHQtc3RyaW5ncycgYmVmb3JlIHNlZWluZyBjaGFuZ2VzLlxyXG4gICAgcmVxdWVzdEpTT05GaWxlKCBnZXRTdHJpbmdQYXRoKCBvdXJSZXBvLCAnZW4nICksIGpzb24gPT4ge1xyXG4gICAgICBwcm9jZXNzU3RyaW5nRmlsZSgganNvbiwgb3VyUmVxdWlyZWpzTmFtZXNwYWNlLCAnZW4nICk7XHJcbiAgICAgIHBoZXQuY2hpcHBlci5zdHJpbmdSZXBvcy5mb3JFYWNoKCBzdHJpbmdSZXBvRGF0YSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVwbyA9IHN0cmluZ1JlcG9EYXRhLnJlcG87XHJcbiAgICAgICAgaWYgKCByZXBvICE9PSBvdXJSZXBvICkge1xyXG4gICAgICAgICAgcmVxdWVzdEpTT05GaWxlKCBnZXRTdHJpbmdQYXRoKCByZXBvLCAnZW4nICksIGpzb24gPT4ge1xyXG4gICAgICAgICAgICBwcm9jZXNzU3RyaW5nRmlsZSgganNvbiwgc3RyaW5nUmVwb0RhdGEucmVxdWlyZWpzTmFtZXNwYWNlLCAnZW4nICk7XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG5cclxuICAgIC8vIExvYWQganVzdCB0aGUgc3BlY2lmaWVkIGxvY2FsZXNcclxuICAgIGxvY2FsZXMuZm9yRWFjaCggbG9jYWxlID0+IHtcclxuICAgICAgcmVxdWVzdEpTT05GaWxlKCBnZXRTdHJpbmdQYXRoKCBvdXJSZXBvLCBsb2NhbGUgKSwganNvbiA9PiB7XHJcbiAgICAgICAgcHJvY2Vzc1N0cmluZ0ZpbGUoIGpzb24sIG91clJlcXVpcmVqc05hbWVzcGFjZSwgbG9jYWxlICk7XHJcbiAgICAgICAgcGhldC5jaGlwcGVyLnN0cmluZ1JlcG9zLmZvckVhY2goIHN0cmluZ1JlcG9EYXRhID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJlcG8gPSBzdHJpbmdSZXBvRGF0YS5yZXBvO1xyXG4gICAgICAgICAgaWYgKCByZXBvICE9PSBvdXJSZXBvICkge1xyXG4gICAgICAgICAgICByZXF1ZXN0SlNPTkZpbGUoIGdldFN0cmluZ1BhdGgoIHJlcG8sIGxvY2FsZSApLCBqc29uID0+IHtcclxuICAgICAgICAgICAgICBwcm9jZXNzU3RyaW5nRmlsZSgganNvbiwgc3RyaW5nUmVwb0RhdGEucmVxdWlyZWpzTmFtZXNwYWNlLCBsb2NhbGUgKTtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxufSApKCk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUUsTUFBTTtFQUNOO0VBQ0FB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