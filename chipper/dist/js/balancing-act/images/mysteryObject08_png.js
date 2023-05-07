/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA/CAYAAACrSjsVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAiISURBVHja7JprbFPnGcf/vuaeOAkJcYDEjCYhkBUHs1Ft1eJ9YV0LIpsmBt2HREiwah1SgFX7Mo0waRdpsEWqpmmjmoy0NtOmatkavnTt4gyEKNeAoCyJogVGEkgouTp2nMTe8xyfYzv2sX3snCPK1Ec6sR2f8z7v732u7znW4dMt2+hop6NZ/OwWX/vomBI/D9NxL/ZCnUIFLeLgNjrsMt8Pi8q66DirItiNV3Zb7Md+YBU+DPT7hNfr1zyYnV1Gr3sGY2OLEPW2RQPqFKxYV01ttm33Hgtqa3Pg2JEXd9JAvxfXSNmvTz/kjx10HFUBaq/Vaur6W3dd3BfXrnpw5vfjAiDWFQIzC8DsAluwWDrHmALKffR4heXAq2uSzsBaaUZ3+whQXwZsKmnDB0NO+Jac9NX0KsCad+8pXvEPttJP2h+g9+I80FgJvLYVyBIRboxa8K/hFslj9AkGrWaoH7evSwnFyl47/B8MGgqAXTUEVgp8c6sduSbXKi1m3+7IW+EVrKf39jJw0AG8sCECxcKgxdlt0sdEYO37D5RaYldMTngFB5/QME0bI/8sowl9vZZj8sRqwCS3l6AGB3zt8C66VgCtMEexPRkYW6v10HfLU2o+eeJBaAW/1YA4ZeuLgJ0b2kWXTldaKK5XQM3NBVpZJTyLbjxI4OFleVIIyYI1UyZCQYEhJdS5S355qLB7UDYryenIAKyVkxW7+UmKXYLqWJFtE+krzOK/lkRgTrnMFwfV600OJU3AsY6TSFMaUE35+Xonh8Ebx++z+7lisqxNtEy8THik0iMLZrFazQm1untmcK57agrLgS5xoOSyqUSwgEKoIi4XHAa/OjXG6bxPrE8RWVfoTHj1o7lwsdan6yNcPwRl84vfwLt32vHh0BRmfMmtVlNqUzh8B2VCO4eBsHjkPTElo4isJQ+2sAT0P3YnrWNjYxQ7kDc3uQai/P0kbj/qoKMNdWtaUWWxCRaKdU+jnifzV8n/Y9qjcBYkF2xuchZQph2RgwotaKM1QY8yBrH9SgjmptbFiT3y15NyDuaWKLhpAbD/MR/bcNHUhhqClOoMr+TQE5Almg8dLg/XPlogp/T+T52fhAs9dS8S1M04N21Y24bC7PhJscfcfuhK1VI1USvjlmtlpHbmjeP3GK5P7A+lPrEvauBq5BhdeLnOyXGYf/0+/tj5HCor42P3zO/GJfdmcYkxFWupJlgLOrC33i6brDpvTmHcY4u+LlGv2EMu4eQVrq3LSQgo9Gr8nl653hBstIu5hQxmNrQePVIGuQ5mdNSP5j0DEC3UGwfDDbe1oJVi1I4t5fIZmGP89qM4C+uSZKc2MZvZYl0xGraWCqlU89itBigGx2jCYtctnP/L09UrBpfKCRdeMfN1YU2uHcU5Fuh1NlhyKKXnhgqunOuxDJH7XhkZpkzYLOO2YbCeNBKjLRZ2VWI2hAD4kCySZQgV24n5+FjiTn5kJlECigMLvnm2LvNN0+UZ/PnsI3BcynUsbBkHNbRSm8Zx5aa91LHj8hmOY3hfy1o0frEwo/kcaemPZMWahuqMwc68eVmYtBwUxyK75v7TVeH/7X+1FJ3vPF7hltHC8fjRR17sO/j5DGcUBTY5V5bREHf7HmJixEOTWZ+w+4+F5vc8ec6Gjh0b464Jgffj4oVl1NsrMppXGGxiZk1GA/zmp3/H69+T3wl0vzcpvMptf3jy/D1bNNZqEnjnW3dx5GcNqwMbnytJ++JbvTco9n00cXk35lhKtKfjyXNBZovK1UzJalevTKOqfmPmYKMzlrQv7vlLL44eKQ/HkrXSFC7CDCWl/GTC57DlYheAwfkmzlud5/HSscbMwQZn08tAE1fPY/aTSVpVL/d20GfnYlNVAG9Th8H1jJNDwec205lPko5T8eIuWoSeMJiwJeqe4hZMqJGj/SO4cmkQlq2OzMBuzRakdeE8zde46yDuV9hQdGBLaHF+0SJ0E+fem8J8aT1MG7YmKzWhor7py/D+d0SwMLsf31LLPXwKd3zzuDl8B7raYXz8zx7kVzkzA5v2pAeG578tvCzxjkHalj33JWpiLwluGThwCgt33k85jMdHHcbOVrLwD5FfQA22hZJFIaV5dqDyncI5y8L8MnRF6M2r7yK+sA+9rn8ADV8Diqm71xlSX6OjKVTbMVf8PFntFvCVFlXmEgEzqwC2nlyyiOqO81BoPIMCMJMxdO7eH2HuDLWmW76qylwiYFkmdXq/778DZOeH3isFY91rqTP5zilamBJVphEFZlYHLCtqYkYFYGZTRPfmF1TrrSNg2WaoLkrATCZNdEeBZT0dMLaYBrqjwLI1ADMqBMt+1iymAIzjS1OLmSbVB9N7U59jmNVEtxGhhxDAx++rDzYxhFGPX+hEZNsp6ilx7wotwLTqqvnWwAmr1dRurdQgKz5FMUobQSWPjZ4l0eP/VD4D+wzs05Q8eNebKCU/q8Lpnh8JubY35qk+uPCcTRd6PCQn/CDDWmFO+bw7Xbl+wxO5xX3zwmbVwX77h8dYNuoTlhK+9f16ayl2NOaqqnfbi/+OtFSFWFAdLAtLmEfywp8LP+k2aBNjLPlBr+qDm4OpwXKCftINLcH86oMJ95eSSw4WtQXLCiypP3gwkHoDHQhoo1t6E/QZVR88uLQIpOqt/XpNdEfAFtQPYCyl/p1n0G/QRHcYLKCJxfQKwPSa6I6ymE59sGUFFlvUaaJbUzAoyAnag/mfosX8GoJhWQOLKalPAW10RyymfikJTVqBVbXQHVXHNHDFJYWu6NPQYgGP+ntOJbET9Oo00R2x2IwGMaZkw+DRRnfEYuMauKIn9ZiBKbKYWUOwn19W/zbzhUkvtiD5A8W3787h/LBPk1sDLCegjTi3O/KcDof8bQf+fcfY2KIL4i+v1ZT/CTAAzBQXlms7vS0AAAAASUVORK5CYII=';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsibXlzdGVyeU9iamVjdDA4X3BuZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuXHJcbmNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIGltYWdlICk7XHJcbmltYWdlLm9ubG9hZCA9IHVubG9jaztcclxuaW1hZ2Uuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRFlBQUFBL0NBWUFBQUNyU2pzVkFBQUFDWEJJV1hNQUFBc1RBQUFMRXdFQW1wd1lBQUFBQkdkQlRVRUFBSy9JTndXSzZRQUFBQmwwUlZoMFUyOW1kSGRoY21VQVFXUnZZbVVnU1cxaFoyVlNaV0ZrZVhISlpUd0FBQWlJU1VSQlZIamE3SnByYkZQbkdjZi92dWFlT0FrSmNZREVqQ1loa0JVSHMxRnQxZUo5WVYwTElwc21CdDJIUkVpd2FoMVNnRlg3TW8wd2FSZHBzRVdxcG1tam1veTBOdE9tYXRrYXZuVHQ0Z3lFS05lQW9DeUpvZ1ZHRWtnb3VUcDJuTVRlOHh5Zll6djJzWDNzbkNQSzFFYzZzUjJmOHo3djczMnU3em5XNGRNdDIraG9wNk5aL093V1gvdm9tQkkvRDlOeEwvWkNuVUlGTGVMZ05qcnNNdDhQaThxNjZEaXJJdGlOVjNaYjdNZCtZQlUrRFBUN2hOZnIxenlZblYxR3Izc0dZMk9MRVBXMlJRUHFGS3hZVjAxdHRtMzNIZ3RxYTNQZzJKRVhkOUpBdnhmWFNObXZUei9rangxMEhGVUJhcS9WYXVyNlczZGQzQmZYcm5wdzV2ZmpBaURXRlFJekM4RHNBbHV3V0RySG1BTEtmZlI0aGVYQXEydVN6c0JhYVVaMyt3aFFYd1pzS21uREIwTk8rSmFjOU5YMEtzQ2FkKzhwWHZFUHR0SlAyaCtnOStJODBGZ0p2TFlWeUJJUmJveGE4Sy9oRnNsajlBa0dyV2FvSDdldlN3bkZ5bDQ3L0I4TUdncUFYVFVFVmdwOGM2c2R1U2JYS2kxbTMrN0lXK0VWcktmMzlqSncwQUc4c0NFQ3hjS2d4ZGx0MHNkRVlPMzdENVJhWWxkTVRuZ0ZCNS9RTUUwYkkvOHNvd2w5dlpaajhzUnF3Q1MzbDZBR0IzenQ4QzY2VmdDdE1FZXhQUmtZVzZ2MTBIZkxVMm8rZWVKQmFBVy8xWUE0WmV1TGdKMGIya1dYVGxkYUtLNVhRTTNOQlZwWkpUeUxianhJNE9GbGVWSUl5WUkxVXlaQ1FZRWhKZFM1UzM1NXFMQjdVRFlyeWVuSUFLeVZreFc3K1VtS1hZTHFXSkZ0RStrcnpPSy9sa1JnVHJuTUZ3ZlY2MDBPSlUzQXNZNlRTRk1hVUUzNStYb25oOEVieCsreis3bGlzcXhOdEV5OFRIaWswaU1MWnJGYXpRbTF1bnRtY0s1N2FnckxnUzV4b09TeXFVU3dnRUtvSWk0WEhBYS9PalhHNmJ4UHJFOFJXVmZvVEhqMW83bHdzZGFuNnlOY1B3Umw4NHZmd0x0MzJ2SGgwQlJtZk1tdFZsTnFVemg4QjJWQ080ZUJzSGprUFRFbG80aXNKUSsyc0FUMFAzWW5yV05qWXhRN2tEYzN1UWFpL1Awa2JqL3FvS01OZFd0YVVXV3hDUmFLZFUram5pZnpWOG4vWTlxamNCWWtGMnh1Y2haUXBoMlJnd290YUtNMVFZOHlCckg5U2dqbXB0YkZpVDN5MTVOeUR1YVdLTGhwQWJEL01SL2JjTkhVaGhxQ2xPb01yK1RRRTVBbG1nOGRMZy9YUGxvZ3AvVCtUNTJmaEFzOWRTOFMxTTA0TjIxWTI0YkM3UGhKc2NmY2Z1aEsxVkkxVVN2amxtdGxwSGJtamVQM0dLNVA3QStsUHJFdmF1QnE1QmhkZUxuT3lYR1lmLzArL3RqNUhDb3I0MlAzek8vR0pmZG1jWWt4Rld1cEpsZ0xPckMzM2k2YnJEcHZUbUhjWTR1K0xsR3YyRU11NGVRVnJxM0xTUWdvOUdyOG5sNjUzaEJzdEl1NWhReG1OclFlUFZJR3VRNW1kTlNQNWowREVDM1VHd2ZERGJlMW9KVmkxSTR0NWZJWm1HUDg5cU00Qyt1U1pLYzJNWnZaWWwweEdyYVdDcWxVODlpdEJpZ0d4MmpDWXRjdG5QL0wwOVVyQnBmS0NSZGVNZk4xWVUydUhjVTVGdWgxTmxoeUtLWG5oZ3F1bk91eERKSDdYaGtacGt6WUxPTzJZYkNlTkJLakxSWjJWV0kyaEFENGtDeVNaUWdWMjRuNStGamlUbjVrSmxFQ2lnTUx2bm0yTHZOTjArVVovUG5zSTNCY3luVXNiQmtITmJSU204Wng1YWE5MUxIajhobU9ZM2hmeTFvMGZyRXdvL2tjYWVtUFpNV2FodXFNd2M2OGVWbVl0QndVeHlLNzV2N1RWZUgvN1grMUZKM3ZQRjdobHRIQzhmalJSMTdzTy9qNURHY1VCVFk1VjViUkVIZjdIbUppeEVPVFdaK3crNCtGNXZjOGVjNkdqaDBiNDY0SmdmZmo0b1ZsMU5zck1wcFhHR3hpWmsxR0Evem1wMy9INjkrVDN3bDB2emNwdk1wdGYzankvRDFiTk5acUVuam5XM2R4NUdjTnF3TWJueXRKKytKYnZUY285bjAwY1hrMzVsaEt0S2ZqeVhOQlpvdksxVXpKYWxldlRLT3FmbVBtWUtNemxyUXY3dmxMTDQ0ZUtRL0hrclhTRkM3Q0RDV2wvR1RDNTdEbFloZUF3Zmttemx1ZDUvSFNzY2JNd1FabjA4dEFFMWZQWS9hVFNWcFZML2QyMEdmbllsTlZBRzlUaDhIMWpKTkR3ZWMyMDVsUGtvNVQ4ZUl1V29TZU1KaXdKZXFlNGhaTXFKR2ovU080Y21rUWxxMk96TUJ1elJha2RlRTh6ZGU0NnlEdVY5aFFkR0JMYUhGKzBTSjBFK2ZlbThKOGFUMU1HN1ltS3pXaG9yN3B5L0QrZDBTd01Mc2YzMUxMUFh3S2Qzenp1RGw4QjdyYVlYejh6eDdrVnprekE1djJwQWVHNTc4dHZDenhqa0hhbGozM0pXcGlMd2x1R1Rod0NndDMzazg1ak1kSEhjYk9Wckx3RDVGZlFBMjJoWkpGSWFWNWRxRHluY0k1eThMOE1uUkY2TTJyN3lLK3NBKzlybjhBRFY4RGlxbTcxeGxTWDZPaktWVGJNVmY4UEZudEZ2Q1ZGbFhtRWdFenF3QzJubHl5aU9xTzgxQm9QSU1DTUpNeGRPN2VIMkh1RExXbVc3NnF5bHdpWUZrbWRYcS83NzhEWk9lSDNpc0ZZOTFycVRQNXppbGFtQkpWcGhFRlpsWUhMQ3RxWWtZRllHWlRSUGZtRjFUcnJTTmcyV2FvTGtyQVRDWk5kRWVCWlQwZE1MYVlCcnFqd0xJMUFETXFCTXQrMWl5bUFJempTMU9MbVNiVkI5TjdVNTlqbU5WRXR4R2hoeERBeCsrckR6WXhoRkdQWCtoRVpOc3A2aWx4N3dvdHdMVHFxdm5Xd0FtcjFkUnVyZFFnS3o1Rk1Vb2JRU1dQalo0bDBlUC9WRDREK3d6czA1UThlTmViS0NVL3E4THBuaDhKdWJZMzVxayt1UENjVFJkNlBDUW4vQ0REV21GTytidzdYYmwrd3hPNXhYM3p3bWJWd1g3N2g4ZFlOdW9UbGhLKzlmMTZheWwyTk9hcXFuZmJpLytPdEZTRldGQWRMQXRMbUVmeXdwOExQK2syYUJOakxQbEJyK3FEbTRPcHdYS0NmdElOTGNIODZvTUo5NWVTU3c0V3RRWExDaXlwUDNnd2tIb0RIUWhvbzF0NkUvUVpWUjg4dUxRSXBPcXQvWHBOZEVmQUZ0UVBZQ3lsL3AxbjBHL1FSSGNZTEtDSnhmUUt3UFNhNkk2eW1FNTlzR1VGRmx2VWFhSmJVekFveUFuYWcvbWZvc1g4R29KaFdRT0xLYWxQQVcxMFJ5eW1maWtKVFZxQlZiWFFIVlhITkhERkpZV3U2TlBRWWdHUCtudE9KYkVUOU9vMDBSMngySXdHTWFaa3crRFJSbmZFWXVNYXVLSW45WmlCS2JLWVdVT3duMTlXL3piemhVa3Z0aUQ1QThXMzc4N2gvTEJQazFzRExDZWdqVGkzTy9LY0RvZjhiUWYrZmNmWTJLSUw0aSt2MVpUL0NUQUF6QlFYbG1zN3ZTMEFBQUFBU1VWT1JLNUNZSUk9JztcclxuZXhwb3J0IGRlZmF1bHQgaW1hZ2U7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLE9BQU9BLFdBQVcsTUFBTSxtQ0FBbUM7QUFFM0QsTUFBTUMsS0FBSyxHQUFHLElBQUlDLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLE1BQU1DLE1BQU0sR0FBR0gsV0FBVyxDQUFDSSxVQUFVLENBQUVILEtBQU0sQ0FBQztBQUM5Q0EsS0FBSyxDQUFDSSxNQUFNLEdBQUdGLE1BQU07QUFDckJGLEtBQUssQ0FBQ0ssR0FBRyxHQUFHLHdpR0FBd2lHO0FBQ3BqRyxlQUFlTCxLQUFLIn0=