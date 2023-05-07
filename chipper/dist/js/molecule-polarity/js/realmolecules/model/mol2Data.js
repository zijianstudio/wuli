// Copyright 2014-2022, University of Colorado Boulder

/**
 * Mol2 data for Molecule Polarity molecules.
 * These strings were created by processing files in data/mol2/ with bin/mol2string.sh
 */

import moleculePolarity from '../../moleculePolarity.js';
const mol2Data = {
  BF3: '\n@<TRIPOS>MOLECULE\nM0001\n4 3\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   B          0.000000000     0.000000000     0.000000000       B   1  M0001    0.842505\n2   F2         1.317730477     0.000000000     0.000000000       F   1  M0001   -0.281790\n3   F3        -0.658865212    -1.141188034     0.000000000       F   1  M0001   -0.280358\n4   F1        -0.658865212     1.141188034     0.000000000       F   1  M0001   -0.280358\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n',
  BH3: '\n@<TRIPOS>MOLECULE\nM0001\n4 3\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   B          0.000000000     0.000000000     0.000000000       B   1  M0001    0.301318\n2   H2         1.194020007     0.000000000     0.000000000       H   1  M0001   -0.100484\n3   H1        -0.597010030     1.034051652     0.000000000       H   1  M0001   -0.100417\n4   H3        -0.597010030    -1.034051652     0.000000000       H   1  M0001   -0.100417\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n',
  CF4: '\n@<TRIPOS>MOLECULE\nM0001\n5 4\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C          0.000000000     0.000000000     0.000000000     C.3   1  M0001    0.423049\n2   F2         0.767550071     0.767550071     0.767550071       F   1  M0001   -0.105762\n3   F4        -0.767550071    -0.767550071     0.767550071       F   1  M0001   -0.105762\n4   F1        -0.767550071     0.767550071    -0.767550071       F   1  M0001   -0.105762\n5   F3         0.767550071    -0.767550071    -0.767550071       F   1  M0001   -0.105762\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n4      1      5    1\n',
  CH2F2: '\n@<TRIPOS>MOLECULE\nM0001\n5 4\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C          0.000000000     0.508880377     0.000000000     C.3   1  M0001    0.100550\n2   F1        -0.849638760    -0.279924721     0.712931573       F   1  M0001   -0.159942\n3   F2         0.849638760    -0.279924721    -0.712931573       F   1  M0001   -0.159942\n4   H2         0.584571302     1.120073795     0.696664989       H   1  M0001    0.109667\n5   H1        -0.584571302     1.120073795    -0.696664989       H   1  M0001    0.109667\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n4      1      5    1\n',
  CH2O: '\n@<TRIPOS>MOLECULE\nM0001\n4 3\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C          0.000000000    -0.513414193     0.000000000     C.2   1  M0001    0.270184\n2   H2         0.937733342    -1.108161039     0.000000000       H   1  M0001    0.038366\n3   H1        -0.937733342    -1.108161039     0.000000000       H   1  M0001    0.038366\n4   O          0.000000000     0.693037081     0.000000000     O.2   1  M0001   -0.346916\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    2\n',
  CH3F: '\n@<TRIPOS>MOLECULE\nM0001\n5 4\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C          0.000000000    -0.544634581     -0.314444929     C.3   1  M0001   -0.230517\n2   F          0.000000000     0.653285682      0.377174675       F   1  M0001   -0.166365\n3   H3         0.894500911    -0.605355263     -0.945836067       H   1  M0001    0.132320\n4   H2         0.000000022    -1.380015731      0.395915449       H   1  M0001    0.132281\n5   H1        -0.894500971    -0.605355263     -0.945836067       H   1  M0001    0.132281\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n4      1      5    1\n',
  CH4: '\n@<TRIPOS>MOLECULE\nM0001\n5 4\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C          0.000000000     0.000000000     0.000000000     C.3   1  M0001   -0.802069\n2   H2         0.631308955     0.631308955     0.631308955       H   1  M0001    0.200517\n3   H4        -0.631308955    -0.631308955     0.631308955       H   1  M0001    0.200517\n4   H1        -0.631308955     0.631308955    -0.631308955       H   1  M0001    0.200517\n5   H3         0.631308955    -0.631308955    -0.631308955       H   1  M0001    0.200517\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n4      1      5    1\n',
  CHCl3: '\n@<TRIPOS>MOLECULE\nM0001\n5 4\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C          0.000000000     0.426947296     0.199088797     C.3   1  M0001   -0.025406\n2   Cl3        1.679749846     0.064339414    -0.296802193      Cl   1  M0001   -0.052513\n3   Cl2       -0.583371043    -0.738205731     1.424261451      Cl   1  M0001   -0.052227\n4   Cl1       -1.096378803     0.491364837    -1.212561131      Cl   1  M0001   -0.052227\n5   H          0.000000000     1.410846233     0.657888472       H   1  M0001    0.182373\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n4      1      5    1\n',
  CHF3: '\n@<TRIPOS>MOLECULE\nM0001\n5 4\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C          0.000000000     0.306679815     0.143007144     C.3   1  M0001    0.282658\n2   F3         1.238681555    -0.024709182    -0.252514124       F   1  M0001   -0.135111\n3   F2        -0.430189639    -0.616522312     1.016633272       F   1  M0001   -0.135350\n4   F1        -0.808491945     0.290188044    -0.927813411       F   1  M0001   -0.135350\n5   H          0.000000000     1.297120094     0.604857028       H   1  M0001    0.123152\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n4      1      5    1\n',
  CO2: '\n@<TRIPOS>MOLECULE\nM0001\n3 2\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C          0.000000053     0.000000000     0.000000000       C   1  M0001    0.685248\n2   O2         1.169151228     0.000000000     0.000000000     O.2   1  M0001   -0.342624\n3   O1        -1.169151228     0.000000000     0.000000000     O.2   1  M0001   -0.342624\n\n\n@<TRIPOS>BOND\n1      1      2    2\n2      1      3    2\n',
  F2: '\n@<TRIPOS>MOLECULE\nM0001\n2 1\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   F2         0.701463749     0.000000000     0.000000000       F   1  M0001   -0.000000\n2   F1        -0.701463749     0.000000000     0.000000000       F   1  M0001    0.000000\n\n\n@<TRIPOS>BOND\n1      1      2    1\n',
  H2: '\n@<TRIPOS>MOLECULE\nM0001\n2 1\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   H2         0.371398326     0.000000000     0.000000000       H   1  M0001    0.000000\n2   H1        -0.371398326     0.000000000     0.000000000       H   1  M0001   -0.000000\n\n\n@<TRIPOS>BOND\n1      1      2    1\n',
  H2O: '\n@<TRIPOS>MOLECULE\nM0001\n3 2\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   H2         0.761229899    -0.478138566     0.000000000       H   1  M0001    0.376285\n2   O          0.000000000     0.120865773     0.000000000     O.3   1  M0001   -0.752569\n3   H1        -0.761229899    -0.478138566     0.000000000       H   1  M0001    0.376285\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      2      3    1\n',
  HCN: '\n@<TRIPOS>MOLECULE\nM0001\n3 2\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   C         -0.507116828     0.000000000     0.000000000     C.1   1  M0001    0.047988\n2   N          0.649877246     0.000000000     0.000000000     N.1   1  M0001   -0.282540\n3   H         -1.577592738     0.000000000     0.000000000       H   1  M0001    0.234552\n\n\n@<TRIPOS>BOND\n1      1      2    3\n2      1      3    1\n',
  HF: '\n@<TRIPOS>MOLECULE\nM0001\n2 1\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   F          0.088719117     0.000000000     0.000000000       F   1  M0001   -0.430703\n2   H         -0.845032750     0.000000000     0.000000000       H   1  M0001    0.430703\n\n\n@<TRIPOS>BOND\n1      1      2    1\n',
  N2: '\n@<TRIPOS>MOLECULE\nM0001\n2 1\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   N2         0.552776918     0.000000000     0.000000000     N.1   1  M0001    0.000000\n2   N1        -0.552776918     0.000000000     0.000000000     N.1   1  M0001   -0.000000\n\n\n@<TRIPOS>BOND\n1      1      2    3\n',
  NH3: '\n@<TRIPOS>MOLECULE\nM0001\n4 3\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   N          0.000000000  0.126805440  0.073211156     N.3   1  M0001   -1.009460\n2   H3         0.812950611  0.017126748 -0.532078981       H   1  M0001    0.337416\n3   H2         0.000000004 -0.686909199  0.687346876       H   1  M0001    0.336022\n4   H1        -0.812950611  0.017126746 -0.532078862       H   1  M0001    0.336022\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n3      1      4    1\n',
  O2: '\n@<TRIPOS>MOLECULE\nM0001\n2 1\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   O2         0.607254209      0.000000000     0.000000000     O.2   1  M0001    0.000000\n2   O1        -0.607254209      0.000000000     0.000000000     O.2   1  M0001   -0.000000\n\n\n@<TRIPOS>BOND\n1      1      2    2\n',
  O3: '\n@<TRIPOS>MOLECULE\nM0001\n3 2\nSMALL\nUSER_CHARGES\n\n\n@<TRIPOS>ATOM\n1   O2         0.000000000     0.434529301     0.000000000     O.3   1  M0001    0.242265\n2   O1        -1.083210079    -0.217264624     0.000000000       O   1  M0001   -0.121133\n3   O3         1.083210079    -0.217264624     0.000000000       O   1  M0001   -0.121133\n\n\n@<TRIPOS>BOND\n1      1      2    1\n2      1      3    1\n'
};
moleculePolarity.register('mol2Data', mol2Data);
export default mol2Data;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2xlY3VsZVBvbGFyaXR5IiwibW9sMkRhdGEiLCJCRjMiLCJCSDMiLCJDRjQiLCJDSDJGMiIsIkNIMk8iLCJDSDNGIiwiQ0g0IiwiQ0hDbDMiLCJDSEYzIiwiQ08yIiwiRjIiLCJIMiIsIkgyTyIsIkhDTiIsIkhGIiwiTjIiLCJOSDMiLCJPMiIsIk8zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJtb2wyRGF0YS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2wyIGRhdGEgZm9yIE1vbGVjdWxlIFBvbGFyaXR5IG1vbGVjdWxlcy5cclxuICogVGhlc2Ugc3RyaW5ncyB3ZXJlIGNyZWF0ZWQgYnkgcHJvY2Vzc2luZyBmaWxlcyBpbiBkYXRhL21vbDIvIHdpdGggYmluL21vbDJzdHJpbmcuc2hcclxuICovXHJcblxyXG5pbXBvcnQgbW9sZWN1bGVQb2xhcml0eSBmcm9tICcuLi8uLi9tb2xlY3VsZVBvbGFyaXR5LmpzJztcclxuXHJcbmNvbnN0IG1vbDJEYXRhID0ge1xyXG4gIEJGMzogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG40IDNcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgQiAgICAgICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICAgIEIgICAxICBNMDAwMSAgICAwLjg0MjUwNVxcbjIgICBGMiAgICAgICAgIDEuMzE3NzMwNDc3ICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgICAgRiAgIDEgIE0wMDAxICAgLTAuMjgxNzkwXFxuMyAgIEYzICAgICAgICAtMC42NTg4NjUyMTIgICAgLTEuMTQxMTg4MDM0ICAgICAwLjAwMDAwMDAwMCAgICAgICBGICAgMSAgTTAwMDEgICAtMC4yODAzNThcXG40ICAgRjEgICAgICAgIC0wLjY1ODg2NTIxMiAgICAgMS4xNDExODgwMzQgICAgIDAuMDAwMDAwMDAwICAgICAgIEYgICAxICBNMDAwMSAgIC0wLjI4MDM1OFxcblxcblxcbkA8VFJJUE9TPkJPTkRcXG4xICAgICAgMSAgICAgIDIgICAgMVxcbjIgICAgICAxICAgICAgMyAgICAxXFxuMyAgICAgIDEgICAgICA0ICAgIDFcXG4nLFxyXG4gIEJIMzogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG40IDNcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgQiAgICAgICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICAgIEIgICAxICBNMDAwMSAgICAwLjMwMTMxOFxcbjIgICBIMiAgICAgICAgIDEuMTk0MDIwMDA3ICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgICAgSCAgIDEgIE0wMDAxICAgLTAuMTAwNDg0XFxuMyAgIEgxICAgICAgICAtMC41OTcwMTAwMzAgICAgIDEuMDM0MDUxNjUyICAgICAwLjAwMDAwMDAwMCAgICAgICBIICAgMSAgTTAwMDEgICAtMC4xMDA0MTdcXG40ICAgSDMgICAgICAgIC0wLjU5NzAxMDAzMCAgICAtMS4wMzQwNTE2NTIgICAgIDAuMDAwMDAwMDAwICAgICAgIEggICAxICBNMDAwMSAgIC0wLjEwMDQxN1xcblxcblxcbkA8VFJJUE9TPkJPTkRcXG4xICAgICAgMSAgICAgIDIgICAgMVxcbjIgICAgICAxICAgICAgMyAgICAxXFxuMyAgICAgIDEgICAgICA0ICAgIDFcXG4nLFxyXG4gIENGNDogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG41IDRcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgQyAgICAgICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICBDLjMgICAxICBNMDAwMSAgICAwLjQyMzA0OVxcbjIgICBGMiAgICAgICAgIDAuNzY3NTUwMDcxICAgICAwLjc2NzU1MDA3MSAgICAgMC43Njc1NTAwNzEgICAgICAgRiAgIDEgIE0wMDAxICAgLTAuMTA1NzYyXFxuMyAgIEY0ICAgICAgICAtMC43Njc1NTAwNzEgICAgLTAuNzY3NTUwMDcxICAgICAwLjc2NzU1MDA3MSAgICAgICBGICAgMSAgTTAwMDEgICAtMC4xMDU3NjJcXG40ICAgRjEgICAgICAgIC0wLjc2NzU1MDA3MSAgICAgMC43Njc1NTAwNzEgICAgLTAuNzY3NTUwMDcxICAgICAgIEYgICAxICBNMDAwMSAgIC0wLjEwNTc2MlxcbjUgICBGMyAgICAgICAgIDAuNzY3NTUwMDcxICAgIC0wLjc2NzU1MDA3MSAgICAtMC43Njc1NTAwNzEgICAgICAgRiAgIDEgIE0wMDAxICAgLTAuMTA1NzYyXFxuXFxuXFxuQDxUUklQT1M+Qk9ORFxcbjEgICAgICAxICAgICAgMiAgICAxXFxuMiAgICAgIDEgICAgICAzICAgIDFcXG4zICAgICAgMSAgICAgIDQgICAgMVxcbjQgICAgICAxICAgICAgNSAgICAxXFxuJyxcclxuICBDSDJGMjogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG41IDRcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgQyAgICAgICAgICAwLjAwMDAwMDAwMCAgICAgMC41MDg4ODAzNzcgICAgIDAuMDAwMDAwMDAwICAgICBDLjMgICAxICBNMDAwMSAgICAwLjEwMDU1MFxcbjIgICBGMSAgICAgICAgLTAuODQ5NjM4NzYwICAgIC0wLjI3OTkyNDcyMSAgICAgMC43MTI5MzE1NzMgICAgICAgRiAgIDEgIE0wMDAxICAgLTAuMTU5OTQyXFxuMyAgIEYyICAgICAgICAgMC44NDk2Mzg3NjAgICAgLTAuMjc5OTI0NzIxICAgIC0wLjcxMjkzMTU3MyAgICAgICBGICAgMSAgTTAwMDEgICAtMC4xNTk5NDJcXG40ICAgSDIgICAgICAgICAwLjU4NDU3MTMwMiAgICAgMS4xMjAwNzM3OTUgICAgIDAuNjk2NjY0OTg5ICAgICAgIEggICAxICBNMDAwMSAgICAwLjEwOTY2N1xcbjUgICBIMSAgICAgICAgLTAuNTg0NTcxMzAyICAgICAxLjEyMDA3Mzc5NSAgICAtMC42OTY2NjQ5ODkgICAgICAgSCAgIDEgIE0wMDAxICAgIDAuMTA5NjY3XFxuXFxuXFxuQDxUUklQT1M+Qk9ORFxcbjEgICAgICAxICAgICAgMiAgICAxXFxuMiAgICAgIDEgICAgICAzICAgIDFcXG4zICAgICAgMSAgICAgIDQgICAgMVxcbjQgICAgICAxICAgICAgNSAgICAxXFxuJyxcclxuICBDSDJPOiAnXFxuQDxUUklQT1M+TU9MRUNVTEVcXG5NMDAwMVxcbjQgM1xcblNNQUxMXFxuVVNFUl9DSEFSR0VTXFxuXFxuXFxuQDxUUklQT1M+QVRPTVxcbjEgICBDICAgICAgICAgIDAuMDAwMDAwMDAwICAgIC0wLjUxMzQxNDE5MyAgICAgMC4wMDAwMDAwMDAgICAgIEMuMiAgIDEgIE0wMDAxICAgIDAuMjcwMTg0XFxuMiAgIEgyICAgICAgICAgMC45Mzc3MzMzNDIgICAgLTEuMTA4MTYxMDM5ICAgICAwLjAwMDAwMDAwMCAgICAgICBIICAgMSAgTTAwMDEgICAgMC4wMzgzNjZcXG4zICAgSDEgICAgICAgIC0wLjkzNzczMzM0MiAgICAtMS4xMDgxNjEwMzkgICAgIDAuMDAwMDAwMDAwICAgICAgIEggICAxICBNMDAwMSAgICAwLjAzODM2NlxcbjQgICBPICAgICAgICAgIDAuMDAwMDAwMDAwICAgICAwLjY5MzAzNzA4MSAgICAgMC4wMDAwMDAwMDAgICAgIE8uMiAgIDEgIE0wMDAxICAgLTAuMzQ2OTE2XFxuXFxuXFxuQDxUUklQT1M+Qk9ORFxcbjEgICAgICAxICAgICAgMiAgICAxXFxuMiAgICAgIDEgICAgICAzICAgIDFcXG4zICAgICAgMSAgICAgIDQgICAgMlxcbicsXHJcbiAgQ0gzRjogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG41IDRcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgQyAgICAgICAgICAwLjAwMDAwMDAwMCAgICAtMC41NDQ2MzQ1ODEgICAgIC0wLjMxNDQ0NDkyOSAgICAgQy4zICAgMSAgTTAwMDEgICAtMC4yMzA1MTdcXG4yICAgRiAgICAgICAgICAwLjAwMDAwMDAwMCAgICAgMC42NTMyODU2ODIgICAgICAwLjM3NzE3NDY3NSAgICAgICBGICAgMSAgTTAwMDEgICAtMC4xNjYzNjVcXG4zICAgSDMgICAgICAgICAwLjg5NDUwMDkxMSAgICAtMC42MDUzNTUyNjMgICAgIC0wLjk0NTgzNjA2NyAgICAgICBIICAgMSAgTTAwMDEgICAgMC4xMzIzMjBcXG40ICAgSDIgICAgICAgICAwLjAwMDAwMDAyMiAgICAtMS4zODAwMTU3MzEgICAgICAwLjM5NTkxNTQ0OSAgICAgICBIICAgMSAgTTAwMDEgICAgMC4xMzIyODFcXG41ICAgSDEgICAgICAgIC0wLjg5NDUwMDk3MSAgICAtMC42MDUzNTUyNjMgICAgIC0wLjk0NTgzNjA2NyAgICAgICBIICAgMSAgTTAwMDEgICAgMC4xMzIyODFcXG5cXG5cXG5APFRSSVBPUz5CT05EXFxuMSAgICAgIDEgICAgICAyICAgIDFcXG4yICAgICAgMSAgICAgIDMgICAgMVxcbjMgICAgICAxICAgICAgNCAgICAxXFxuNCAgICAgIDEgICAgICA1ICAgIDFcXG4nLFxyXG4gIENINDogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG41IDRcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgQyAgICAgICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICBDLjMgICAxICBNMDAwMSAgIC0wLjgwMjA2OVxcbjIgICBIMiAgICAgICAgIDAuNjMxMzA4OTU1ICAgICAwLjYzMTMwODk1NSAgICAgMC42MzEzMDg5NTUgICAgICAgSCAgIDEgIE0wMDAxICAgIDAuMjAwNTE3XFxuMyAgIEg0ICAgICAgICAtMC42MzEzMDg5NTUgICAgLTAuNjMxMzA4OTU1ICAgICAwLjYzMTMwODk1NSAgICAgICBIICAgMSAgTTAwMDEgICAgMC4yMDA1MTdcXG40ICAgSDEgICAgICAgIC0wLjYzMTMwODk1NSAgICAgMC42MzEzMDg5NTUgICAgLTAuNjMxMzA4OTU1ICAgICAgIEggICAxICBNMDAwMSAgICAwLjIwMDUxN1xcbjUgICBIMyAgICAgICAgIDAuNjMxMzA4OTU1ICAgIC0wLjYzMTMwODk1NSAgICAtMC42MzEzMDg5NTUgICAgICAgSCAgIDEgIE0wMDAxICAgIDAuMjAwNTE3XFxuXFxuXFxuQDxUUklQT1M+Qk9ORFxcbjEgICAgICAxICAgICAgMiAgICAxXFxuMiAgICAgIDEgICAgICAzICAgIDFcXG4zICAgICAgMSAgICAgIDQgICAgMVxcbjQgICAgICAxICAgICAgNSAgICAxXFxuJyxcclxuICBDSENsMzogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG41IDRcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgQyAgICAgICAgICAwLjAwMDAwMDAwMCAgICAgMC40MjY5NDcyOTYgICAgIDAuMTk5MDg4Nzk3ICAgICBDLjMgICAxICBNMDAwMSAgIC0wLjAyNTQwNlxcbjIgICBDbDMgICAgICAgIDEuNjc5NzQ5ODQ2ICAgICAwLjA2NDMzOTQxNCAgICAtMC4yOTY4MDIxOTMgICAgICBDbCAgIDEgIE0wMDAxICAgLTAuMDUyNTEzXFxuMyAgIENsMiAgICAgICAtMC41ODMzNzEwNDMgICAgLTAuNzM4MjA1NzMxICAgICAxLjQyNDI2MTQ1MSAgICAgIENsICAgMSAgTTAwMDEgICAtMC4wNTIyMjdcXG40ICAgQ2wxICAgICAgIC0xLjA5NjM3ODgwMyAgICAgMC40OTEzNjQ4MzcgICAgLTEuMjEyNTYxMTMxICAgICAgQ2wgICAxICBNMDAwMSAgIC0wLjA1MjIyN1xcbjUgICBIICAgICAgICAgIDAuMDAwMDAwMDAwICAgICAxLjQxMDg0NjIzMyAgICAgMC42NTc4ODg0NzIgICAgICAgSCAgIDEgIE0wMDAxICAgIDAuMTgyMzczXFxuXFxuXFxuQDxUUklQT1M+Qk9ORFxcbjEgICAgICAxICAgICAgMiAgICAxXFxuMiAgICAgIDEgICAgICAzICAgIDFcXG4zICAgICAgMSAgICAgIDQgICAgMVxcbjQgICAgICAxICAgICAgNSAgICAxXFxuJyxcclxuICBDSEYzOiAnXFxuQDxUUklQT1M+TU9MRUNVTEVcXG5NMDAwMVxcbjUgNFxcblNNQUxMXFxuVVNFUl9DSEFSR0VTXFxuXFxuXFxuQDxUUklQT1M+QVRPTVxcbjEgICBDICAgICAgICAgIDAuMDAwMDAwMDAwICAgICAwLjMwNjY3OTgxNSAgICAgMC4xNDMwMDcxNDQgICAgIEMuMyAgIDEgIE0wMDAxICAgIDAuMjgyNjU4XFxuMiAgIEYzICAgICAgICAgMS4yMzg2ODE1NTUgICAgLTAuMDI0NzA5MTgyICAgIC0wLjI1MjUxNDEyNCAgICAgICBGICAgMSAgTTAwMDEgICAtMC4xMzUxMTFcXG4zICAgRjIgICAgICAgIC0wLjQzMDE4OTYzOSAgICAtMC42MTY1MjIzMTIgICAgIDEuMDE2NjMzMjcyICAgICAgIEYgICAxICBNMDAwMSAgIC0wLjEzNTM1MFxcbjQgICBGMSAgICAgICAgLTAuODA4NDkxOTQ1ICAgICAwLjI5MDE4ODA0NCAgICAtMC45Mjc4MTM0MTEgICAgICAgRiAgIDEgIE0wMDAxICAgLTAuMTM1MzUwXFxuNSAgIEggICAgICAgICAgMC4wMDAwMDAwMDAgICAgIDEuMjk3MTIwMDk0ICAgICAwLjYwNDg1NzAyOCAgICAgICBIICAgMSAgTTAwMDEgICAgMC4xMjMxNTJcXG5cXG5cXG5APFRSSVBPUz5CT05EXFxuMSAgICAgIDEgICAgICAyICAgIDFcXG4yICAgICAgMSAgICAgIDMgICAgMVxcbjMgICAgICAxICAgICAgNCAgICAxXFxuNCAgICAgIDEgICAgICA1ICAgIDFcXG4nLFxyXG4gIENPMjogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG4zIDJcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgQyAgICAgICAgICAwLjAwMDAwMDA1MyAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICAgIEMgICAxICBNMDAwMSAgICAwLjY4NTI0OFxcbjIgICBPMiAgICAgICAgIDEuMTY5MTUxMjI4ICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgIE8uMiAgIDEgIE0wMDAxICAgLTAuMzQyNjI0XFxuMyAgIE8xICAgICAgICAtMS4xNjkxNTEyMjggICAgIDAuMDAwMDAwMDAwICAgICAwLjAwMDAwMDAwMCAgICAgTy4yICAgMSAgTTAwMDEgICAtMC4zNDI2MjRcXG5cXG5cXG5APFRSSVBPUz5CT05EXFxuMSAgICAgIDEgICAgICAyICAgIDJcXG4yICAgICAgMSAgICAgIDMgICAgMlxcbicsXHJcbiAgRjI6ICdcXG5APFRSSVBPUz5NT0xFQ1VMRVxcbk0wMDAxXFxuMiAxXFxuU01BTExcXG5VU0VSX0NIQVJHRVNcXG5cXG5cXG5APFRSSVBPUz5BVE9NXFxuMSAgIEYyICAgICAgICAgMC43MDE0NjM3NDkgICAgIDAuMDAwMDAwMDAwICAgICAwLjAwMDAwMDAwMCAgICAgICBGICAgMSAgTTAwMDEgICAtMC4wMDAwMDBcXG4yICAgRjEgICAgICAgIC0wLjcwMTQ2Mzc0OSAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICAgIEYgICAxICBNMDAwMSAgICAwLjAwMDAwMFxcblxcblxcbkA8VFJJUE9TPkJPTkRcXG4xICAgICAgMSAgICAgIDIgICAgMVxcbicsXHJcbiAgSDI6ICdcXG5APFRSSVBPUz5NT0xFQ1VMRVxcbk0wMDAxXFxuMiAxXFxuU01BTExcXG5VU0VSX0NIQVJHRVNcXG5cXG5cXG5APFRSSVBPUz5BVE9NXFxuMSAgIEgyICAgICAgICAgMC4zNzEzOTgzMjYgICAgIDAuMDAwMDAwMDAwICAgICAwLjAwMDAwMDAwMCAgICAgICBIICAgMSAgTTAwMDEgICAgMC4wMDAwMDBcXG4yICAgSDEgICAgICAgIC0wLjM3MTM5ODMyNiAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICAgIEggICAxICBNMDAwMSAgIC0wLjAwMDAwMFxcblxcblxcbkA8VFJJUE9TPkJPTkRcXG4xICAgICAgMSAgICAgIDIgICAgMVxcbicsXHJcbiAgSDJPOiAnXFxuQDxUUklQT1M+TU9MRUNVTEVcXG5NMDAwMVxcbjMgMlxcblNNQUxMXFxuVVNFUl9DSEFSR0VTXFxuXFxuXFxuQDxUUklQT1M+QVRPTVxcbjEgICBIMiAgICAgICAgIDAuNzYxMjI5ODk5ICAgIC0wLjQ3ODEzODU2NiAgICAgMC4wMDAwMDAwMDAgICAgICAgSCAgIDEgIE0wMDAxICAgIDAuMzc2Mjg1XFxuMiAgIE8gICAgICAgICAgMC4wMDAwMDAwMDAgICAgIDAuMTIwODY1NzczICAgICAwLjAwMDAwMDAwMCAgICAgTy4zICAgMSAgTTAwMDEgICAtMC43NTI1NjlcXG4zICAgSDEgICAgICAgIC0wLjc2MTIyOTg5OSAgICAtMC40NzgxMzg1NjYgICAgIDAuMDAwMDAwMDAwICAgICAgIEggICAxICBNMDAwMSAgICAwLjM3NjI4NVxcblxcblxcbkA8VFJJUE9TPkJPTkRcXG4xICAgICAgMSAgICAgIDIgICAgMVxcbjIgICAgICAyICAgICAgMyAgICAxXFxuJyxcclxuICBIQ046ICdcXG5APFRSSVBPUz5NT0xFQ1VMRVxcbk0wMDAxXFxuMyAyXFxuU01BTExcXG5VU0VSX0NIQVJHRVNcXG5cXG5cXG5APFRSSVBPUz5BVE9NXFxuMSAgIEMgICAgICAgICAtMC41MDcxMTY4MjggICAgIDAuMDAwMDAwMDAwICAgICAwLjAwMDAwMDAwMCAgICAgQy4xICAgMSAgTTAwMDEgICAgMC4wNDc5ODhcXG4yICAgTiAgICAgICAgICAwLjY0OTg3NzI0NiAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICBOLjEgICAxICBNMDAwMSAgIC0wLjI4MjU0MFxcbjMgICBIICAgICAgICAgLTEuNTc3NTkyNzM4ICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgICAgSCAgIDEgIE0wMDAxICAgIDAuMjM0NTUyXFxuXFxuXFxuQDxUUklQT1M+Qk9ORFxcbjEgICAgICAxICAgICAgMiAgICAzXFxuMiAgICAgIDEgICAgICAzICAgIDFcXG4nLFxyXG4gIEhGOiAnXFxuQDxUUklQT1M+TU9MRUNVTEVcXG5NMDAwMVxcbjIgMVxcblNNQUxMXFxuVVNFUl9DSEFSR0VTXFxuXFxuXFxuQDxUUklQT1M+QVRPTVxcbjEgICBGICAgICAgICAgIDAuMDg4NzE5MTE3ICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgICAgRiAgIDEgIE0wMDAxICAgLTAuNDMwNzAzXFxuMiAgIEggICAgICAgICAtMC44NDUwMzI3NTAgICAgIDAuMDAwMDAwMDAwICAgICAwLjAwMDAwMDAwMCAgICAgICBIICAgMSAgTTAwMDEgICAgMC40MzA3MDNcXG5cXG5cXG5APFRSSVBPUz5CT05EXFxuMSAgICAgIDEgICAgICAyICAgIDFcXG4nLFxyXG4gIE4yOiAnXFxuQDxUUklQT1M+TU9MRUNVTEVcXG5NMDAwMVxcbjIgMVxcblNNQUxMXFxuVVNFUl9DSEFSR0VTXFxuXFxuXFxuQDxUUklQT1M+QVRPTVxcbjEgICBOMiAgICAgICAgIDAuNTUyNzc2OTE4ICAgICAwLjAwMDAwMDAwMCAgICAgMC4wMDAwMDAwMDAgICAgIE4uMSAgIDEgIE0wMDAxICAgIDAuMDAwMDAwXFxuMiAgIE4xICAgICAgICAtMC41NTI3NzY5MTggICAgIDAuMDAwMDAwMDAwICAgICAwLjAwMDAwMDAwMCAgICAgTi4xICAgMSAgTTAwMDEgICAtMC4wMDAwMDBcXG5cXG5cXG5APFRSSVBPUz5CT05EXFxuMSAgICAgIDEgICAgICAyICAgIDNcXG4nLFxyXG4gIE5IMzogJ1xcbkA8VFJJUE9TPk1PTEVDVUxFXFxuTTAwMDFcXG40IDNcXG5TTUFMTFxcblVTRVJfQ0hBUkdFU1xcblxcblxcbkA8VFJJUE9TPkFUT01cXG4xICAgTiAgICAgICAgICAwLjAwMDAwMDAwMCAgMC4xMjY4MDU0NDAgIDAuMDczMjExMTU2ICAgICBOLjMgICAxICBNMDAwMSAgIC0xLjAwOTQ2MFxcbjIgICBIMyAgICAgICAgIDAuODEyOTUwNjExICAwLjAxNzEyNjc0OCAtMC41MzIwNzg5ODEgICAgICAgSCAgIDEgIE0wMDAxICAgIDAuMzM3NDE2XFxuMyAgIEgyICAgICAgICAgMC4wMDAwMDAwMDQgLTAuNjg2OTA5MTk5ICAwLjY4NzM0Njg3NiAgICAgICBIICAgMSAgTTAwMDEgICAgMC4zMzYwMjJcXG40ICAgSDEgICAgICAgIC0wLjgxMjk1MDYxMSAgMC4wMTcxMjY3NDYgLTAuNTMyMDc4ODYyICAgICAgIEggICAxICBNMDAwMSAgICAwLjMzNjAyMlxcblxcblxcbkA8VFJJUE9TPkJPTkRcXG4xICAgICAgMSAgICAgIDIgICAgMVxcbjIgICAgICAxICAgICAgMyAgICAxXFxuMyAgICAgIDEgICAgICA0ICAgIDFcXG4nLFxyXG4gIE8yOiAnXFxuQDxUUklQT1M+TU9MRUNVTEVcXG5NMDAwMVxcbjIgMVxcblNNQUxMXFxuVVNFUl9DSEFSR0VTXFxuXFxuXFxuQDxUUklQT1M+QVRPTVxcbjEgICBPMiAgICAgICAgIDAuNjA3MjU0MjA5ICAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICBPLjIgICAxICBNMDAwMSAgICAwLjAwMDAwMFxcbjIgICBPMSAgICAgICAgLTAuNjA3MjU0MjA5ICAgICAgMC4wMDAwMDAwMDAgICAgIDAuMDAwMDAwMDAwICAgICBPLjIgICAxICBNMDAwMSAgIC0wLjAwMDAwMFxcblxcblxcbkA8VFJJUE9TPkJPTkRcXG4xICAgICAgMSAgICAgIDIgICAgMlxcbicsXHJcbiAgTzM6ICdcXG5APFRSSVBPUz5NT0xFQ1VMRVxcbk0wMDAxXFxuMyAyXFxuU01BTExcXG5VU0VSX0NIQVJHRVNcXG5cXG5cXG5APFRSSVBPUz5BVE9NXFxuMSAgIE8yICAgICAgICAgMC4wMDAwMDAwMDAgICAgIDAuNDM0NTI5MzAxICAgICAwLjAwMDAwMDAwMCAgICAgTy4zICAgMSAgTTAwMDEgICAgMC4yNDIyNjVcXG4yICAgTzEgICAgICAgIC0xLjA4MzIxMDA3OSAgICAtMC4yMTcyNjQ2MjQgICAgIDAuMDAwMDAwMDAwICAgICAgIE8gICAxICBNMDAwMSAgIC0wLjEyMTEzM1xcbjMgICBPMyAgICAgICAgIDEuMDgzMjEwMDc5ICAgIC0wLjIxNzI2NDYyNCAgICAgMC4wMDAwMDAwMDAgICAgICAgTyAgIDEgIE0wMDAxICAgLTAuMTIxMTMzXFxuXFxuXFxuQDxUUklQT1M+Qk9ORFxcbjEgICAgICAxICAgICAgMiAgICAxXFxuMiAgICAgIDEgICAgICAzICAgIDFcXG4nXHJcbn07XHJcblxyXG5tb2xlY3VsZVBvbGFyaXR5LnJlZ2lzdGVyKCAnbW9sMkRhdGEnLCBtb2wyRGF0YSApO1xyXG5leHBvcnQgZGVmYXVsdCBtb2wyRGF0YTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGdCQUFnQixNQUFNLDJCQUEyQjtBQUV4RCxNQUFNQyxRQUFRLEdBQUc7RUFDZkMsR0FBRyxFQUFFLDRnQkFBNGdCO0VBQ2poQkMsR0FBRyxFQUFFLDRnQkFBNGdCO0VBQ2poQkMsR0FBRyxFQUFFLDZuQkFBNm5CO0VBQ2xvQkMsS0FBSyxFQUFFLDZuQkFBNm5CO0VBQ3BvQkMsSUFBSSxFQUFFLDRnQkFBNGdCO0VBQ2xoQkMsSUFBSSxFQUFFLGtvQkFBa29CO0VBQ3hvQkMsR0FBRyxFQUFFLDZuQkFBNm5CO0VBQ2xvQkMsS0FBSyxFQUFFLDZuQkFBNm5CO0VBQ3BvQkMsSUFBSSxFQUFFLDZuQkFBNm5CO0VBQ25vQkMsR0FBRyxFQUFFLDJaQUEyWjtFQUNoYUMsRUFBRSxFQUFFLDBTQUEwUztFQUM5U0MsRUFBRSxFQUFFLDBTQUEwUztFQUM5U0MsR0FBRyxFQUFFLDJaQUEyWjtFQUNoYUMsR0FBRyxFQUFFLDJaQUEyWjtFQUNoYUMsRUFBRSxFQUFFLDBTQUEwUztFQUM5U0MsRUFBRSxFQUFFLDBTQUEwUztFQUM5U0MsR0FBRyxFQUFFLG9mQUFvZjtFQUN6ZkMsRUFBRSxFQUFFLDRTQUE0UztFQUNoVEMsRUFBRSxFQUFFO0FBQ04sQ0FBQztBQUVEcEIsZ0JBQWdCLENBQUNxQixRQUFRLENBQUUsVUFBVSxFQUFFcEIsUUFBUyxDQUFDO0FBQ2pELGVBQWVBLFFBQVEifQ==