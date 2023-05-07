/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsid2luZG93RnJvbnRfcG5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xyXG5cclxuY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggaW1hZ2UgKTtcclxuaW1hZ2Uub25sb2FkID0gdW5sb2NrO1xyXG5pbWFnZS5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCSUFBQUdMQ0FZQUFBREswTUpvQUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUNTbEpSRUZVZU5yY1hVMk9aRFVNenRkNkVqK3JPUUVheENIWXNrSUNjWWp1RThBTmhqa0JYQUJwcmdFYjRBUnNZTU9DYVNFV3cyNjJMQmp6cXJ2ZWUzRmlKNDZkN2lsUm9xbW1LYWZpejk5bk8zbXBWMGpGNCsvdnYzNjZQajM3L1krL3J0Y2Y5ditBOHRYSEg1WnNnQ2ZyMHpmcno3WFZPSDhzNXdHK1duKytYSCtlNUFNY2c4akcrV3VYOHlEUDJEdGlNMGJUbU0ySUc1K2V6ci9YUGtsL3lnYkNWZllpWkJib0dyT0JBQWh2aHdLajFNRUlweG1CWVlNRUU4RGJBSmxyT0l5TFFYdkdoV3RYQXBvOFlqRDR5RnpMQVQ4Wnd3clNBYmJnRWl3WUNlR3ZBWWVKaUJraGkyaEI1bzgrUVdTdVZXVE1NZE9OYTJZWDRwU0JicnU2SEs0VWdDTU40U1JJQk9JZ3ZTQWVVY091L1QwWm1iVjJTS1I0eTF3Mm5RRzJYeFpvTHFGdnpNTFBjNCtpTmYwWGcyaDNsMjE1ZTlHaUJmUkR4VEJpcmxXcHhJS1I1Rm8rS3lBWm9LbEZtMnNOWjBZWjRibDd3YktUcndRY3ZRSEEzdVBldGZLdDFSSUMxZFVqYXB0NGxXclNjMU5YZjQ0U1REbWJpL1p3elRZQWROZk9rUnNnSTg5SFZSNkNtWXhIK0pOUS85RTNsaE5iQVRqRTVLL0xwcEdQeGpUSFhjc2tVdjI5dzZXajBXcTBmU2JSb25RaDB4b01aQVJYZiszYVVZRmJkUlo1WW12M2tDMWpXNEZFMzFqTzJhTDZNWURSVmd3aDVLTXVScXhBOW50SWkwb2FQYVJKWWtXakpZbDJRTENvZTBqYS9oRmVqK2JFRm01TTZYaWlyakhEaUtnMFB2OG5XVEhhWnBRUHNGcVRadFB0Mk9nTk05Nm1ndE5maldTOGR5MzNRd0s4Ry8ydDBib2JSQUtjdXNiTU5kb0dFZ0RIUUZ0N3pHaUhpTXpHcUhtVVI0dXFtWmxFU3hsR3FTS2xqWXlWYThSbVFtWXludExRd1d3aFdqMWpVV3NpNEdnYk00eTJHVkNKMDg1d1c1cmtyaFdBbzU1U1kxR1R1VVlDS1UzcmtpMXFsZDYyU0NLWjg3Ym8ybWxvUm5ERGFCeHM1aHAxOGxFUmZwSWtZVXlQcUptZE9PQk1JN2E4dlREQk1zQ1QzQ1AxZVZSblI2dldDb2xJZ0E4MFdsbzVzaEVSdGRhcWNsUmtnVzZqSldkSG03SENJeWs3d293VDR4R3ZzKzBDaWJvY0piRWNFZGtGMnlsSE5OaEVuQVZLeEFHSG9lUFBFNTlhYVVuTlIraFhXcGJneURBQXF2QUxLV1FnOFZmZHlLNDRoMXoyZ2FyRVR5a05US2dBdTVFZDBkbG5yU3J0RGpoUjF6aDF5NUhVMGdER2ZGUW11TjFGMkxTbWxpTTBsaFJpbzZXVUk2SytjWkxMVWQ3VDBsMmZiVyswV0lZczI1cXh2QzEwYkdmRVFBMHVRV2kweXJabTU1RnRnTzdxNkdnaVlFeHNhamthMkFEdWxTTlRvOFh5a2FUOFJDWWlWbzFXdFE3UkJvQ3lvU2wxSSszR0hlM0ZjYzRsSXB1eHVLWWxpZFdXblgrSTVVamlVVit3YUpZamczR0ZrUWc0a1Qxdkg4dXNvaHlscnZncjF1dmxTTVVJcmE1V3JyUTlZM0Z4ekJ5alRMUkduTTZpRmRxL3JCdXhjRWt2UjdackI2MXlSR1pqM21nWk5nd3NpK1RGR2lWMEwwS1ZBN0FOVXZzRzBxTFhkZ3hwYmpIbFpBT1hsdVlhRVRiQjNtOW9hbFlZRlcxRFIrZ1ljNjFaY3lsNldsTmhCTDhNbEhyN2tJMXlhcnB3akhKR3RvdnBveGlOekJJbFJpZ1FnbW1BZlVZWU9JaVRtbHRqamFCWm1pUG9HRFV1SUtDak5jdHlHaTRlMmJacWkwWkxtd0ZzQTJTN2ZzbDJBYTNiYU1GeTlkUFNhRFhuTXRCb1FVRzVlVTVEYkxTMEVHRzAwY0xBTlF0N1loc2xJeFN0RlJLeE5Gb1FtUTNOQnhpMDF1dGQ3RnFUSm82RVpEOVpkMzhOc3ArUWpQbElpeStza2N4enRqRmROTGFBV3hreXlWZVAyMkRMR1FBRE9PbVZGaGhpKytLdHJCMk01T012UTAwRWpIdHA2dFlZakp1NmtqRlVpYUR1alZyR0NrWXd2Yk92UUxvYXJkRUhPZzE3UXFQVU5ucWxwWHZLeE5wb2FYMC9QSTJXL2Zwd0F5T295NnpoUmd1REdkRWtXcldJV0FpcGR5R3c2YlhzMkV5TE0vV0F2STRSK3NabWpBQ3o0amhHcUd1dEVhUE9FbUtrYlRZc0lXdzlkM09aQldzbldpNnpiR2xOUHR5ODJLS0NRWXlxYmdRREdHbHQzdWhuSWFwM05wVC80VW83OGxpc2kyeTdSR0RQQUFwR1VhZnVIMWVCR3F2eENHT251Mnl1UldkazZiT2JQTUpJeDI1azlpWUxKTStNQnZPenpPeEpQRnJVUklPTEMzOEtoMS9aTzdKM0k0aU1JOVYrT0YxNzhQRFBVWDkwUnZrQmVBL1ltQkYrWUt6MWU0end4d1pJK3JZUFpxcC9RdmducXo4RWRwR1RoakVTRXhvdUpQenNWUDBVaVlRSnlaYnJGeGYrOUw4S2YzUC82TzNNeUpHSGlrVU5ab1MvWHZBaG92N29wQllFK2RNUC96eENJaHArWHhGWXZDSTFoRDgvTnpKYzE4cVBySXlQbEIydW9LaldsRE5hd3pNUzNmTE1TSm9Ca1FkczdjaVFHK3lvYTRVeHp1ZHM0SWtheEVNNmc2NUJjaTNFN1AzSkhYNk4yVFNMMmVtdE1sc0MzTzBhaFJMQXd6RTcvM0NPenpXS0pqWk44UlRoRVUwUC80eWM3WnpaVW45cVpUcXprNS9aQ0dpdVNHd1VBVnNZd0VIT0JyTnBGck5EUFBKcmJ0SGRtdUVhUlNUeU1NeU9wcEU0Mk1lc3lNM3M0a1BkYm9sVWd6Z1QzUkpOc1kyNmRweUZkMjFFVWNXbHdmQVR4WE9SekNPL1JDUmo4a3BrTTZjSWp4VFhhSXBycmxRckcxTTBhdVJ2UnFlMFJ6a2hwMWVSaUd1aU1WMEtJZWU3bGlLRXpJcEFkTDMyQUZWa05FTktBL2dURzRVQlY2dUlYN1RSVlRaTmt2K2lEMEErMThyYVQxNk0rS2RYWnhMU0RmYkZ0elV4UXM1cGE4TExMSnJCeDRLUS9yTDJHRzNObkk1dFlsc1RyLzNPMVBRSWJVMllrTE5yUDhYYUd2OENlYUdvTmhoR0Q5bld4SFpyTHJ1dGllK3d6MTRjdS9NUkt5S09Bdm13YlEwaXg4OVFub1YySEluaHQ3MHNmemNPVk4vNjBucUN2WElOL09iSm01dnVHVlVueHR6SGhwQkJNMzZPWE1USWQ1UkJ1S0VvWER5cTdxRHJ4QWppVGR3Uk9Ydk1ENkVpTktNSWo2VGpaa0NBUnlneGVuczhVc0VlblpGMGg5c0lJZm45c2dPdVhSRFlTbUx6TXp0d0ZGWk1iSFBBempHNkNCNHhKbUZXWWt1VEVwdWJSNGhpOUNBRk1qOWtDY3pTV3BwVklMM2xDTlU5MkMrQlI4Z3dDakE3bjVXckdaVnZlcC84eldneWZTdk1JL0NvS2tOZVprdGhqelFSWmVmdjRwRU05aFFlSlNlUGtJcEtFaXFRWlNWSi92Q3psVktJMmV4clFTYndDSzZEM2twaUN5eHEwc3pQWnNGOUJua3B5OUFSdEFrOGdtdEdrTmRwZ1VWTndaL1lSenlSdkorTk9JRjlpMUpyRHBDdTN2L29peGZyTkg3YWM5RCs5UTVqbzIzZmQzR3pZdlVhVzJIRU9MUHZCbnJ2dzg5dlYrUG54eGRMZUdlMFB0NTkrdG0zSnhmaEtOZHNvRE9QYnRaL3ZmYmtJemJRT3g5OGVycytQUit3UDczK3hmcHpJNzd0UDMvKzhPT3JsNzk5OHVybHI1TGhHdUgwOCtuNTQrdnZic1hOdXV4eDgrYk52NytzejY4MXcvTHhud0FEQVBRU0ozREg4K3g4QUFBQUFFbEZUa1N1UW1DQyc7XHJcbmV4cG9ydCBkZWZhdWx0IGltYWdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBRTNELE1BQU1DLEtBQUssR0FBRyxJQUFJQyxLQUFLLENBQUMsQ0FBQztBQUN6QixNQUFNQyxNQUFNLEdBQUdILFdBQVcsQ0FBQ0ksVUFBVSxDQUFFSCxLQUFNLENBQUM7QUFDOUNBLEtBQUssQ0FBQ0ksTUFBTSxHQUFHRixNQUFNO0FBQ3JCRixLQUFLLENBQUNLLEdBQUcsR0FBRyw0c0dBQTRzRztBQUN4dEcsZUFBZUwsS0FBSyJ9