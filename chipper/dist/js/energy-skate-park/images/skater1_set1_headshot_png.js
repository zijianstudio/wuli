/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
const image = new Image();
const unlock = asyncLoader.createLock(image);
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImltYWdlIiwiSW1hZ2UiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwib25sb2FkIiwic3JjIl0sInNvdXJjZXMiOlsic2thdGVyMV9zZXQxX2hlYWRzaG90X3BuZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xyXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcclxuXHJcbmNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIGltYWdlICk7XHJcbmltYWdlLm9ubG9hZCA9IHVubG9jaztcclxuaW1hZ2Uuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBRVlBQUFCR0NBWUFBQUJ4THVLRUFBQUFDWEJJV1hNQUFBc1NBQUFMRWdIUzNYNzhBQUFNaGtsRVFWUjRuTzJiZVd3YzFSM0h2N1BYN016czdPRTl2RDZTdFowNER0ZzVtdEFRWVF3MEpTQ3VFcldFRWlvSWlLcC9VSUxVVmtXZ0lGQTVsTUEvbFVvUHFRSWxvcWppYW9GU0RvV1FCcElTRTNJNWpwMkVKSTZkck8zMTN0NmQyWHRtK29lemllM2Q5ZTdNemdLVjh2bHI5ZWJONy9mMnEvZCs3NzNmZTBOSWtvVExGS0w1dGh2d1hlV3lNQ1c0TEV3SkxndFRnc3ZDbE9DeU1DVzRMRXdKTGd0VEF0MjMzWURwTkZwTVd3SGN5NUFHTVNzSU9rR1VZb0lvL210c2tudjhtMjRMVWN1VkwwRVExZ1l6ODdnazRRYUcxRnR6b21qU2E3VzVhQ0lGblZienFTVGhrNGs0NzV0blpYK2N5Z2tiT3QxMmg5TkV6N0FSNEJJWThJV0NnUFNHUDU1NHBHYU5uZDMyV2dqVFpHV1hpcUwwVjcxVzA3bTQzbTZ5VW1SQkhUNlRSU0tUQlFEb3RWb1Vxek9kdkVBYWd0amtpM0d2cTk3b1dhZ3VqTk5FUDBYcGRiOWRPYzl0MG12VkQySEh4b1BwRUovODBzOGw3cFFrS2FxNmd3dW9Lb3pEUk85b3Mxdld0dFJaVkxOWmpHZ3lqUUZmY0NLVnphMFA4Y2s5dGZDaG1qQTIycmkzM1ducnJyVW8wemsySGt3SHVNUzdBUzV4ajlxMlZlbnJUaFA5ZWlsUitFd1cvejA3cW9hYkFyb2FIR1JYZytPbkxwWVpKQWpDcXFidHFvWHgxRmx1ZFpyb2RjVkVpU2JUK09xY0Q2dm1OMVRycGlST0U0M2xUYTRyTEVieWhKcmlWQzFNT2lmOG9hdkJVVENsWkFVUkE3NGd1bHViVUlzZ1BCMHJSV0tWcDZIZXpsQkgxYkpaVll2dERQV0wrVFoyUWJGblIwYjlXRFcvb2VhaTVMRlNKRlkwMTg5em1PZ2RhdGlycXRWNnJmYXhZa01vd0NYZ05GRVZpOEpmV005VWk1VWk0VExSMTduTnBxcURzV0pobXF6czBnWXpVN1MzZkIySVFNN3NOQktQSVN1SVNwc3lnNjRHQnlsSzBrdlYybEVzakNCS3p6UmFUQVhsQVM2QnBpTGxjMEhwZEVoSTZ2UWFBT2gwMngwdWx2NWpOVFlVQzZNaHNJSXg2QXZLUnljNU5GbFlXYmJxR0NPTys4SkttMUtBMDBSRHI5WGVWWTBOUmNJUUJHRzFVa1pYc1dkWlFaUWRjRW1kRGg2WEdZbWNlcjFta2ROV2YyRzNyZ2hGd2pTWW1RZnJXYnBnaW80bTAzQ2FLTm4yd29ra050MnhBaWxKVU5LY29sellwZCtyOUgxRndnaWl0RzUyZWdBQW9za1VySlJSdHIxMFRvRGJ4a0NBT2dFNFQ3T1ZuV2RucUI0bDd5b1N4cURUT291Vjg1bHMyZlJCTVJ6V0taR05aR0hNcW9ZbUN3dWRSdk9ja25jVkNhUFZFT1ppNVVxbTNFUXVpNFdOVXl0NWhsUTNvYWpYYXNDUStpdVZ2S3VvSmJSZTd5aFdudDhHNUdFWkE4eE04UjZVeXVSZ05PamdpL0c0djdQcll2MVJucHRSTDVNUmtNNU94UjRuUzRQVWFSR01KbUNsakJVRmVRZERPZXdNMVNNM1BTRTc3VUFReFBMdnozY2ZMclZwbkQ2VVJFckNvM2V1bEdWL0xvNE0rUy8rUGp3MGdVQTBDYjFHZzFBc0NVcW5BMDNvQzhUS0NpTDJEWSs5NTR0eDYrVDRrdDFqNmxsbWNiSDFDNENDK0VMcXRYTE56OG55TmxmUjN3QndlaXlDSjdaOURvdVJoSlVpTDY2OEx3alZKZGVYN0JqREdnM3VTdXNhRElYQ25CNkxZTnZPZnZnaXZGelhBS1o2elphM2VzRWxNelBLRnpiYTRHQW9MRzl5SVNPSStQVHJFZTVVSUFJQXFLT056WEpURXJLRnllU0VpdGI3QVM2QmhRMjJHV1Y3QnJ6WU0rakYrdTRPN0Jud0Z2eTVTb2duTTloMCt3cHNlZXZMR2UvdlB6bCtjYWxBQUFnblVrdkdZL3lHM2FmUEIwMmtubXd3TXcvSzhTTTd4dFF4MVBZYkYzazJscXZINTdLNCtacldnaTVmSzE3KytDaEMvaVFZZ3g0SHp2dUNROEdvRTVoYXBkZXp6SUdzSUlSRGZISlZwZlpxbGl6UjZrcWIzdFUzZ2wxOUk0cnNjc2tNUHRoL3BxQjgyRGVKZk96VEVFUW9YeTVKVXRRWDR4WWFkTnArT1g1a0IxK2RodUQ0VEJhbEFuQ2VRRHhSdExlY0dZL2krVGQ3QVFCWHpuZkFiV05rK2QveVZpLzJEbzRpR0U5aTR3OHZ4VlF1a1FHTVU3YjRkTGJnV0dWOGtudElqaC9aUGNaQ0dVOG5La2dzMGNiaW11L3NHMEZPRUpFVFJPd2Q4TXAxajNPQk9BRGcwSm1KaTJXK0NJLzhOaXNyaU1pSjRyQnN3N09vMlZCU0svRTBtL3dTd0tDN05PTjllWHpzNGxJaG1reUJNZWgzVnV1blpzSVlEY1Y3ekkzTFBOQnBOZEJwTmJpMnMxbTIzWnUvMXdJTFErSW4zWXVLUG84bTB4aUp4S29XUm5hTU9SMklIR211SUVOWGFuRzNvTUdLelhldkJnRFo4UVVBMXZjc3h2cWV4VFBLUEc0TGV2dkhBUUNSWkdwVWtxUmgyWVpub2FUSERFZVQ2YktWeUNLTHV6eHJsbm13WnBsSGdldmlMRzl6SVpwTUFRQUVVWXFwWVZPMk1KSWtEYWV5dVVrMW5KZkRGK0h4MGNFaFdlOWtCZkZyTlh3cmlqSEpYSTRyWDZ0NjNEWUdYREtMemEvT3ZUSE9yNEFEWEFJYUFwK3A0VnVSTUZsQkRLamh2QkpNbFA1aXZxWVVnK2RDY0psb1RNUVQ2ZkVZdjAwTnYwcFRteU8xbW81bnMyM25NZHl5c20zT09rZlBCa0FiOUFnblVsNjE3c3dvbmE1ZjkzT0pPU3ZFZVBrYnhObHdGemFNNVdhdlk4TlR5VEZDcFdFRUtCVEdGK05lSDQ5eHdibnFwREk1WlMyYWhva3lvS2VDdFk2UUUzRTJOSm4yeGZobnEzWjZBY1VMdk1sayt1eGN3MGtqRVNWekxnRmV4TVBiRCtLVmZSTVluQ2cvOWMvRmgvdUhRR2wxaUNSU1I5Ull2K1JSZktPcXljb3V0UmpKL2NXdWdBQlRTZTRsVnpoTHhvZlBodE5nTzNyUTB0S0NBMTkrZ1pEZmgwdzhEQk5sUUlhUG9zUFRBRE50eEdnd0NuOHNqVjFmSGNkdmJsbUVoWTB6Y3p5UC92bFRoR0xKc0NoSlB4aU54bFc3QnFJNExUOGFqUjkxbTAwZlI1UHBPNHNkbWRBNlBYcFBqSmNVNXZvV0VxL3NmaCs0NFE0OHQrWEZndWU3ZCs4R0FLeXdUczFJM0xPUEY0ank4c2RIRVl3bG9DVTA5NTJQeEZRVEJWRGhEcDZWTXZwV2VScnFpNG5qVFhCNGNzTnFtQ2hEeWZjUGVOTTQ0Qk54OTg4Mll0MjZ3bnoxOXUzYnNlZkR0N0Z4NWN3VG02OU8rckRselY3WWFlTTlKLzNoTjZyNkUwV29XaGlDSUt6TlZ2WmRsalNzN25EVmtZSW1qVHA3QnFPUkpDUk5GbExPanFjM1hGdld6Z0Z2R2lNeENWd3lBek03TlF0Rm81TzQyc1BneXZxWm9yKzM3elMyZjlvUGlManVPMzlyMDg1UVBWYVcrTk5kdHdwTGJ1cldvYVdSZ0tkUmcwTURHanoyZ2hFUDMzSzFvazNqYkRhLytqa0d6b1VtSWx4cWNTM3YrYXFXZGdqeHlUMW5mSW1sZ2FnVXZQNHFMVHlOVTZaWGRJcDQrMDg4L3JibkMvemxnOE5WK1hoNXg5RzBJRW92aE9OSmR5MUZBV3J3a2NYZ2FTbjB4c2M1aDl0Qm9PK2tnRUFZR0R3TnBOUEE4VEVmb20vMVl0UHRLK2FNTzdQaGtobTgrSS85NFhSV2VHN2ZpZEhmcTkzbVlxaCtaZDV0WmdMdFRwdERwOUdBTnVobjVJWUh3eUU4dGVFYWJOdlpEN2VOd2ZydWpySUNIUm55NDVWUGp2cFl5bkR6M2dHdnFqUFBYS2phWXhvdHBxMVgxQmQrUVpKSFF4QncyeGc4c1g0MWpnejU4ZEsvRDhGa05PQ1dsYTBGVS9HZUFTL2UyWGRxTWllSXIvVU4rYit4cjA3eXFOcGptcXpzNGU3V3B1V2xudnVUQ2F4ZDFUSmptZStMOERnOE5JRWpRLzZMYVlhKzg1TXcwZFR6aDQ0UFBhbGE0MlNpcWpBdGRxdTMwMjF2bXV0b3haZmk4Y0JOWFFVOVpEcFB2RE9Fd2RIWW1hajMrRlcxRHJLbFVFMFlnaUNzWnBvWmJiTXhkTHV6OUovT0NpTENRZ3JQM2w5NmJmUEwxd2FnWFh3Yi9NZS9nTTdJUUpMRWRKcUxCTVZjT2hhZkdFNWwrT2lhLzR0WnlleGVzTVBkZWYxMXRJNGdyWHpoS2VGMDlGb05USkllSHgwY0tybGRTR25OY05tYkFZMEc4NjY2RFFCSUFFMEFtc2I2ZGlKeWZtQzR6dFAxdS9ESXNack5VRld2WTh6dUJUdm1yL3JSMnJacjd5WnRuV3RRU2FLYzBlbXg0K0J3MFdldjl2cEF6citxNUx1dUs3cEIxelZaZENTOTFkTFkvcFRTZHBlakttSHlvbGdhMndFQUpHdEhVS3pzY3FLTk11TE0rTXpSTURBYXc4NlRNZVR0RlVObm1Mb1YycjdtQVFOcHNtMnVsVGlLaDFLZHArdFg5dFpsUGJQL0JMMWdGWWJQN1MxN1pWN01TUGoxMy91eHROV0paVzB1K0NJSjdEK1hRUDNxRFdWOUcxazcwdkVRMnRjOFlEaTFhL3RtUzJNN0pzZE9QYVAwdnhSRFVmQmw2MXQ3R0VmekJ3dDZOaFM5QWo3MDl0UG9tV2N2YTZlWFp6QnZ6VU9ZSERzRkkxc0hrcjMwem5qL2YwRGJtNHYySGo3a0JSLzB3dFV4ZFhBM3RQZk5OQmNZV1J1Zk9LdmFobEwramFyNjFoNEFINVlTQlFCc0MxWldGR3UwbWFsVEdFdGord3hSK0pBWHVYU2k1SkJpN00zZ1E1Y3VCTFJkZXplcDFlbi8rYTE5eUVVUWhGV3JONzUvNVcyUHpIbEd5M2F1aFRjMmQ3SWNBRndtSXliSFRzMG9Ddy8zd1greU56OGJsU1FmYS9Jc3ZPRStCK3R1MjEzV2FZWElpakYwWGVPSmpwdCticG5kcUFLakJncHBUZm1MMEdMTWovSCtYWWlOVFIwZXB1TmhtQnZiMFhwTitlOGo4c01vRDhuYVViKzRlMW1kWjhuVzhFaC8xVi8yVnl5TXRhbmpzL1kxRyt2TGlaSkhNSmlBTWxmZ1crMFcrT0dDczJQMWpLRlVLWHpJQzhaK2FYdmg2bGlOdVAvc3cyeDk2d2ZWeHB1S2hsS2RaOGxXNTZLcnI1dmVpSEpvalpWOW1pTW1KeFdKb2lWcGhNLzJGWlI3cmw3SGtpYnJ1OVhHbS84QjcvTzhvNGpEWkhFQUFBQUFTVVZPUks1Q1lJST0nO1xyXG5leHBvcnQgZGVmYXVsdCBpbWFnZTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUUzRCxNQUFNQyxLQUFLLEdBQUcsSUFBSUMsS0FBSyxDQUFDLENBQUM7QUFDekIsTUFBTUMsTUFBTSxHQUFHSCxXQUFXLENBQUNJLFVBQVUsQ0FBRUgsS0FBTSxDQUFDO0FBQzlDQSxLQUFLLENBQUNJLE1BQU0sR0FBR0YsTUFBTTtBQUNyQkYsS0FBSyxDQUFDSyxHQUFHLEdBQUcsb3pJQUFvekk7QUFDaDBJLGVBQWVMLEtBQUsifQ==