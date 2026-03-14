# Cross References vs TSK Report

## Summary

- Verses in current cross refs: 29364
- Verses in TSK/OpenBible file: 29319
- Total verse keys considered: 29364
- Exact same order and references: 2007
- Same reference set regardless of order: 27570
- Same set but different order only: 25563
- Verses only in current file: 45
- Verses only in TSK file: 0
- Total current references: 344799
- Total TSK references: 341297
- Overlapping references: 341297
- References only in current file: 3502
- References only in TSK file: 0

## Conclusion

- The current cross-reference file is not a duplicate of the TSK/OpenBible file.
- It is overwhelmingly a superset of it: TSK contributes no unique references after normalization in this comparison.
- The current file likely already descends from the same TSK/OpenBible tradition, but with additional references added from elsewhere or earlier curation.
- The main practical value of the TSK file here is ordering by OpenBible vote ranking, not adding missing links.

## Recommendation

- Do not keep a separate TSK tool if the goal is only extra references.
- Keep the current `cross-refs.json` as the base dataset.
- Reorder each verse reference list by TSK/OpenBible vote ranking where a vote-ranked match exists.
- Append current-only references after the vote-ranked references, preserving their current relative order.
- Leave the 45 verse keys that do not exist in the TSK file untouched.

## Current-Only Verse Keys

1CO.11.14, 1KI.19.7, 1KI.3.17, 1KI.3.22, 1KI.4.32, 1SA.14.33, 1SA.30.25, 2KI.3.16, 2PE.1.20, 2SA.1.1, 2TI.1.17, DEU.25.11, EXO.14.1, EZK.47.4, GEN.1.8, GEN.18.3, GEN.23.1, GEN.49.12, GEN.6.1, GEN.8.5, HAB.1.14, JAS.3.7, JDG.11.40, JHN.1.22, JHN.2.15, JHN.21.8, JOB.3.2, JON.4.10, LEV.17.12, LUK.15.11, LUK.17.7, LUK.22.36, LUK.7.11, MAT.24.26, MAT.27.53, MAT.9.17, PRO.25.10, PRO.25.17, PRO.30.19, PRO.31.12, PRO.6.30, PSA.78.31, PSA.84.8, RUT.3.4, SNG.1.1

## Largest Differences

### ZEP.1.17
- Current count: 36
- TSK count: 12
- Current-only refs: 24
- TSK-only refs: 0
- Current-only examples: DAN.9.5-19, JER.2.19, ISA.24.5-6, ISA.50.1, LAM.1.14, LAM.2.21, LAM.1.18, 2KI.9.33-37, ROM.11.25, 2CO.4.4
- Current top refs: DAN.9.5-19, ISA.29.10, 1JN.2.11, JER.2.19, ISA.24.5-6, ISA.50.1, MIC.7.13, LAM.1.14, LAM.2.21, LAM.5.16-17
- TSK top refs: PSA.83.10, REV.3.17, 2PE.1.9, JER.10.18, JER.2.17, MAT.15.14, MIC.7.13, 1JN.2.11, ISA.29.10, JER.4.18

### ISA.1.1
- Current count: 26
- TSK count: 5
- Current-only refs: 21
- TSK-only refs: 0
- Current-only examples: 2KI.15.1, AMO.1.1, NUM.12.6, 2PE.1.21, MIC.1.1, ISA.6.1, ISA.13.1, ACT.10.17, MAT.17.9, HAB.2.2
- Current top refs: 2KI.15.1, AMO.1.1, NUM.12.6, 2PE.1.21, MIC.1.1, ISA.6.1, 2KI.18.1:20.21, ISA.13.1, ACT.10.17, MAT.17.9
- TSK top refs: 2CH.26.1:32.33, 2KI.18.1:20.21, ISA.2.1, ISA.7.1, PSA.89.19

### ECC.9.1
- Current count: 26
- TSK count: 6
- Current-only refs: 20
- TSK-only refs: 0
- Current-only examples: JER.1.18-19, PSA.73.3, ISA.49.1-4, PSA.73.11-13, PRO.16.3, PSA.31.5, ECC.12.9-10, ISA.26.12, PSA.10.14, 1SA.2.9
- Current top refs: JER.1.18-19, PSA.73.3, ISA.49.1-4, JHN.10.27-30, PSA.73.11-13, PRO.16.3, PSA.31.5, ECC.12.9-10, ISA.26.12, ECC.8.14
- TSK top refs: DEU.33.3, JHN.10.27-30, 1PE.1.5, ECC.7.15, ECC.8.14, JOB.12.10

### 2SA.21.1
- Current count: 24
- TSK count: 5
- Current-only refs: 19
- TSK-only refs: 0
- Current-only examples: GEN.41.57:42.1, 1SA.22.17-19, LEV.26.19-20, PSA.50.15, 2KI.8.1, 1SA.23.2, 1SA.23.4, 1KI.18.2, 1SA.23.11, 2SA.5.23
- Current top refs: GEN.41.57:42.1, JOS.7.11-12, 1SA.22.17-19, LEV.26.19-20, PSA.50.15, 2KI.8.1, GEN.26.1, 1SA.23.2, 1SA.23.4, 1KI.18.2
- TSK top refs: JOS.7.11-12, GEN.12.10, GEN.26.1, JER.14.1-18, PSA.91.15

### PHP.2.1
- Current count: 41
- TSK count: 25
- Current-only refs: 16
- TSK-only refs: 0
- Current-only examples: EPH.4.4, JHN.16.22-24, 1PE.1.6-8, 1CO.15.31, 2CO.2.14, 1PE.1.22-23, LUK.2.10-11, LUK.2.25, JHN.14.27, EPH.1.13-14
- Current top refs: ROM.8.26, EPH.4.4, ACT.2.46, 1CO.12.13, ROM.5.5, 1JN.4.16, JHN.16.22-24, EPH.4.30-32, PSA.133.1, 1PE.1.6-8
- TSK top refs: COL.3.12, 1JN.4.12, 1JN.4.7-8, 2CO.13.14, COL.2.2, 1CO.12.13, PSA.133.1, EPH.2.18-22, GAL.5.22, GAL.4.6

### JAS.4.5
- Current count: 22
- TSK count: 6
- Current-only refs: 16
- TSK-only refs: 0
- Current-only examples: GAL.3.8, ROM.1.29, GEN.26.14, GEN.6.5, PSA.106.16, ACT.7.9, PRO.21.10, ROM.9.17, ISA.11.13, GEN.30.1
- Current top refs: GEN.8.21, PSA.37.1, GAL.3.8, NUM.11.29, ROM.1.29, GEN.26.14, GEN.6.5, PSA.106.16, ACT.7.9, PRO.21.10
- TSK top refs: 2CO.6.16, 1CO.6.19, NUM.11.29, TIT.3.3, GEN.8.21, PSA.37.1

### ACT.8.39
- Current count: 26
- TSK count: 11
- Current-only refs: 15
- TSK-only refs: 0
- Current-only examples: PHP.4.4, MAT.3.16, PSA.119.14, PSA.119.111, JAS.1.9-10, ACT.13.52, JAS.4.16, ISA.61.10, ACT.8.8, MAT.13.44
- Current top refs: PHP.4.4, MAT.3.16, EZK.43.5, PSA.119.14, MRK.1.10, PSA.119.111, JAS.1.9-10, PHP.3.3, EZK.11.1, ACT.13.52
- TSK top refs: 1KI.18.12, 2KI.2.16, EZK.8.3, EZK.43.5, EZK.11.1, EZK.11.24, EZK.3.12-14, 2CO.12.2-4, MRK.1.10, ROM.15.10-13

### REV.6.2
- Current count: 21
- TSK count: 6
- Current-only refs: 15
- TSK-only refs: 0
- Current-only examples: 2CO.10.3-5, ROM.15.18-19, REV.11.15, PSA.76.7, REV.19.14, PSA.110.2, REV.15.2, 1CO.15.55-57, ZEC.6.11-13, PSA.98.1
- Current top refs: REV.3.21, PSA.45.3-5, 2CO.10.3-5, ROM.15.18-19, REV.11.15, PSA.76.7, ZEC.6.3-8, REV.19.14, ZEC.1.8, PSA.110.2
- TSK top refs: ZEC.6.3-8, ZEC.1.8, PSA.45.3-5, REV.19.11-12, REV.14.14, REV.3.21

### MAT.18.10
- Current count: 44
- TSK count: 32
- Current-only refs: 12
- TSK-only refs: 0
- Current-only examples: ROM.15.1, ZEC.13.7, GAL.4.13-14, MAT.12.20, GAL.6.1, EST.1.14, 2SA.14.28, 2CO.10.1, LUK.10.16, 1CO.9.22
- Current top refs: 1CO.16.11, PSA.17.15, ROM.15.1, ACT.27.23, PSA.91.11, 2CO.10.10, ZEC.13.7, GAL.4.13-14, LUK.1.19, 1CO.11.22
- TSK top refs: PSA.91.11, HEB.1.14, PSA.34.7, LUK.16.22, 2KI.6.16-17, ACT.12.7-11, MAT.1.20, MAT.18.14, MAT.18.6, GEN.32.1-2

### EXO.34.7
- Current count: 43
- TSK count: 31
- Current-only refs: 12
- TSK-only refs: 0
- Current-only examples: MAT.18.32-35, LUK.7.48, REV.20.15, MAT.6.14-15, LUK.7.42, PSA.58.10-11, PSA.136.10, PSA.136.15, REV.21.8, MIC.6.11
- Current top refs: NAM.1.2-3, MAT.18.32-35, LUK.7.48, JER.32.18, NUM.14.18-23, EXO.20.5-6, MIC.7.18, ACT.13.38, REV.20.15, ACT.5.31
- TSK top refs: EXO.20.5-6, PSA.103.3, DEU.5.9-10, EPH.1.7, 1JN.1.9, JER.32.18, NAM.1.2-3, NUM.14.18-23, PSA.130.4, DAN.9.9

### JOB.2.10
- Current count: 24
- TSK count: 12
- Current-only refs: 12
- TSK-only refs: 0
- Current-only examples: MAT.25.2, PRO.9.13, JOB.1.10, JOB.1.1-3, 2SA.6.20-21, 2SA.19.28, PSA.59.12, 2SA.13.13, JAS.3.2, 2SA.19.22
- Current top refs: LAM.3.38-41, 2SA.24.10, MAT.12.34-37, MAT.25.2, PRO.9.13, GEN.3.17, JOB.1.10, JAS.1.12, JOB.1.1-3, JHN.18.11
- TSK top refs: JAS.1.12, LAM.3.38-41, JOB.1.21-22, ROM.12.12, JAS.5.10-11, HEB.12.9-11, MAT.16.23, JHN.18.11, MAT.12.34-37, 2SA.24.10

### ROM.1.7
- Current count: 59
- TSK count: 48
- Current-only refs: 11
- TSK-only refs: 0
- Current-only examples: REV.3.7, 1TI.6.2, REV.2.18, REV.2.29:3.1, REV.3.14, 1TH.5.28-2TH.1.2, REV.2.8, SNG.5.1, REV.3.22, EPH.6.23-PHP.1.2
- Current top refs: GAL.1.3-4, EPH.1.2, REV.3.7, 2CO.1.1-2, JAS.1.1, 1TH.3.11-13, 1TH.1.3, COL.1.2, 1TI.6.2, 2TI.1.2
- TSK top refs: COL.1.2, JUD.1.1-2, EPH.1.2, 1TH.1.1, 2CO.13.14, 2JN.1.3, 2TH.3.16, 2PE.1.2-3, 2TH.2.16-17, 2TH.3.18

### MAT.10.1
- Current count: 23
- TSK count: 12
- Current-only refs: 11
- TSK-only refs: 0
- Current-only examples: MAT.19.28, MAT.26.20, MAT.6.13, JHN.17.2, REV.12.1, JHN.3.35, JHN.20.21-23, ACT.3.15-16, MAT.26.47, ACT.19.15
- Current top refs: MAT.19.28, MAT.26.20, MAT.28.18-19, MAT.6.13, MRK.16.17-18, LUK.21.15, JHN.17.2, REV.12.1, JHN.3.35, JHN.20.21-23
- TSK top refs: LUK.9.1-6, MRK.3.13-15, MRK.6.7-13, LUK.10.19, MRK.16.17-18, LUK.24.49, ACT.1.8, LUK.6.13, JHN.3.27, JHN.6.70

### ISA.45.15
- Current count: 19
- TSK count: 8
- Current-only refs: 11
- TSK-only refs: 0
- Current-only examples: ISA.43.3, PSA.68.26, ISA.60.16, ACT.13.23, ACT.5.31, MAT.1.22-23, JHN.4.42, ISA.12.2, ISA.43.11, JHN.13.7
- Current top refs: ISA.45.17, ISA.46.13, ISA.43.3, PSA.68.26, ROM.11.33-34, JHN.4.22, PSA.77.19, ISA.60.16, ACT.13.23, ACT.5.31
- TSK top refs: ISA.8.17, PSA.44.24, ISA.57.17, ISA.46.13, PSA.77.19, ROM.11.33-34, ISA.45.17, JHN.4.22

### REV.4.7
- Current count: 17
- TSK count: 6
- Current-only refs: 11
- TSK-only refs: 0
- Current-only examples: 1CO.14.20, DEU.28.49, 2SA.1.23, GEN.49.9, PRO.28.2, 1CO.9.9-10, OBA.1.4, ISA.40.31, NUM.2.2-34, NUM.23.24
- Current top refs: EZK.1.10, 1CO.14.20, EZK.10.21, DEU.28.49, 2SA.1.23, GEN.49.9, PRO.28.2, 1CO.9.9-10, OBA.1.4, EZK.10.14
- TSK top refs: EZK.10.14, EZK.1.10, EZK.10.21, DAN.7.4, EZK.1.8, REV.4.6

### 2PE.1.6
- Current count: 40
- TSK count: 30
- Current-only refs: 10
- TSK-only refs: 0
- Current-only examples: JAS.1.3-4, 1TI.6.3, GEN.5.24, 2TH.1.4, ISA.57.1, TIT.1.1, 1TI.3.16, 1TI.4.7-8, REV.13.10, REV.1.9
- Current top refs: ROM.15.4, ROM.2.7, ROM.8.25, COL.1.11, JAS.1.3-4, 1TI.6.11, LUK.21.19, REV.14.12, 1TI.6.3, GEN.5.24
- TSK top refs: HEB.10.36, ROM.5.3-4, LUK.21.19, 2PE.1.3, HEB.12.1, 1CO.9.25, 2CO.6.4, GAL.5.23, TIT.2.2, REV.14.12

### ACT.13.48
- Current count: 26
- TSK count: 16
- Current-only refs: 10
- TSK-only refs: 0
- Current-only examples: ACT.13.42, ACT.15.2, LUK.2.10-11, ACT.8.8, MAT.28.16, 2TH.3.1, ACT.20.13, ACT.15.31, PSA.138.2, 1CO.16.15
- Current top refs: ROM.11.7, EPH.1.4, ACT.13.42, ACT.2.47, JHN.10.16, ROM.13.1, ACT.15.2, EPH.1.19, LUK.7.8, LUK.2.10-11
- TSK top refs: ROM.8.29-30, EPH.1.4, ROM.11.7, JHN.10.16, JHN.10.26-27, JHN.11.52, 2TH.2.13-14, EPH.2.5-10, ACT.2.41, EPH.1.19

### 1PE.3.1
- Current count: 25
- TSK count: 15
- Current-only refs: 10
- TSK-only refs: 0
- Current-only examples: 1PE.4.17, HEB.11.8, 2TH.1.8, 1PE.1.22, PRO.11.30, HEB.5.9, ROM.10.16, PRO.18.19, COL.4.5, ROM.6.17
- Current top refs: 1PE.4.17, ROM.7.2, COL.3.18, HEB.11.8, 2TH.1.8, 1CO.11.3, 1CO.14.34, MAT.18.15, 1CO.7.16, 1PE.1.22
- TSK top refs: COL.3.18, EPH.5.33, EPH.5.22-24, TIT.2.3-6, 1CO.11.3, 1CO.7.16, GEN.3.16, 1PE.3.7, ROM.7.2, EST.1.16-20

### REV.21.2
- Current count: 25
- TSK count: 15
- Current-only refs: 10
- TSK-only refs: 0
- Current-only examples: EPH.5.30-32, PSA.45.9-14, JHN.3.29, REV.1.9, JER.31.23, REV.1.1, PSA.87.3, ISA.1.21, REV.1.4, REV.11.2
- Current top refs: ISA.62.4, ISA.54.5, REV.19.7-8, HEB.12.22, ISA.52.1, GAL.4.25-26, HEB.11.10, 2CO.11.2, ISA.61.10, EPH.5.30-32
- TSK top refs: HEB.11.10, REV.3.12, REV.21.10, HEB.13.14, ISA.61.10, HEB.12.22, REV.19.7-8, REV.22.19, 2CO.11.2, EPH.5.25-27

### REV.7.2
- Current count: 24
- TSK count: 14
- Current-only refs: 10
- TSK-only refs: 0
- Current-only examples: 1SA.17.36, DEU.5.26, ACT.7.30-32, MAL.3.1, MAL.4.2, 1SA.17.26, 2KI.19.4, 1TH.1.9, MAT.26.63, HEB.12.22
- Current top refs: 1SA.17.36, DEU.5.26, ACT.7.30-32, EPH.1.13, REV.9.4, MAL.3.1, REV.1.3, REV.7.3-8, REV.8.3, MAL.4.2
- TSK top refs: EPH.4.30, 2CO.1.22, REV.7.3-8, 2TI.2.19, EPH.1.13, REV.9.4, REV.5.2, JHN.6.27, REV.1.3, REV.8.7-12

### PSA.146.9
- Current count: 21
- TSK count: 11
- Current-only refs: 10
- TSK-only refs: 0
- Current-only examples: DEU.16.11, EST.7.10, 1CO.3.19, PSA.18.26, JOB.5.12-14, HOS.14.3, 2SA.17.23, EST.5.14, 2SA.15.31, EST.9.25
- Current top refs: PRO.4.19, PSA.68.5, MAL.3.5, DEU.16.11, EST.7.10, 1CO.3.19, PSA.147.6, PSA.18.26, DEU.10.18-19, JOB.5.12-14
- TSK top refs: PSA.68.5, DEU.10.18-19, PSA.147.6, EXO.22.21-22, PRO.15.25, JER.49.11, MAL.3.5, JAS.1.27, PRO.4.19, PSA.145.20

### ROM.3.7
- Current count: 17
- TSK count: 7
- Current-only refs: 10
- TSK-only refs: 0
- Current-only examples: 1KI.13.17-18, EXO.14.30, 1KI.13.26-32, EXO.3.19, GEN.37.8-9, GEN.37.20, GEN.50.18-20, GEN.44.1-14, ACT.2.23, EXO.14.5
- Current top refs: 1KI.13.17-18, 2KI.8.10-15, EXO.14.30, 1KI.13.26-32, EXO.3.19, ROM.9.19-20, ACT.13.27-29, GEN.37.8-9, GEN.37.20, MAT.26.34
- TSK top refs: ROM.3.4, ROM.9.19-20, ACT.13.27-29, 2KI.8.10-15, ISA.10.6-7, MAT.26.34, MAT.26.69-75

### 1TH.4.15
- Current count: 13
- TSK count: 3
- Current-only refs: 10
- TSK-only refs: 0
- Current-only examples: JOB.41.11, MAT.17.25, 1KI.13.1, PSA.119.147-148, 1KI.22.14, 1KI.13.22, PSA.88.13, 1KI.13.9, 1KI.20.35, 1KI.13.17-18
- Current top refs: JOB.41.11, MAT.17.25, 1KI.13.1, 2CO.4.14, PSA.119.147-148, 1KI.22.14, 1CO.15.51-53, 1TH.2.19, 1KI.13.22, PSA.88.13
- TSK top refs: 1CO.15.51-53, 2CO.4.14, 1TH.2.19

### 2CO.5.14
- Current count: 39
- TSK count: 30
- Current-only refs: 9
- TSK-only refs: 0
- Current-only examples: ROM.2.2, LUK.24.29, 2CO.3.7, JOB.32.18, ACT.18.5, LUK.15.32, ACT.4.19-20, 1JN.2.1-2, JHN.5.25
- Current top refs: EPH.3.18-19, 1TI.2.6, MAT.10.37-38, ROM.2.2, LUK.24.29, 2CO.3.7, EPH.2.1-5, 1CO.16.22, JHN.14.21-23, SNG.8.6-7
- TSK top refs: GAL.2.20, ROM.14.7-9, MAT.10.37-38, 1PE.1.8, MAT.20.28, ROM.5.15, EPH.3.18-19, JHN.14.21-23, JHN.1.29, 2CO.3.9

### REV.12.1
- Current count: 34
- TSK count: 25
- Current-only refs: 9
- TSK-only refs: 0
- Current-only examples: HOS.2.19-20, EPH.5.25-27, ROM.13.14, GAL.3.27, JHN.3.29, 2CO.11.2, ROM.3.22, REV.21.14, REV.1.20
- Current top refs: HOS.2.19-20, REV.21.23, PSA.84.11, EPH.5.32, REV.12.3, REV.15.1, MAT.24.30, LUK.21.11, 2CH.32.31, PSA.104.2
- TSK top refs: LUK.21.25, EPH.5.32, ISA.62.3, LUK.21.11, ISA.54.5-7, ISA.60.19-20, PSA.84.11, SNG.6.10, MRK.13.25, 2CH.32.31

### MAT.18.17
- Current count: 23
- TSK count: 14
- Current-only refs: 9
- TSK-only refs: 0
- Current-only examples: ACT.6.1-3, MAT.11.19, LUK.18.11, MAT.21.31-32, MAT.6.7, LUK.19.2-3, MAT.5.46, 1TI.6.5, LUK.15.1
- Current top refs: EZK.11.12, 2TH.3.14-15, ACT.6.1-3, MAT.11.19, ACT.15.6-7, LUK.18.11, 2JN.1.10-11, MAT.21.31-32, ROM.16.17-18, MAT.6.7
- TSK top refs: 2TH.3.6, 1CO.5.9:6.7, 2TH.3.14-15, 1CO.5.3-5, 2JN.1.10-11, EPH.5.11-12, 3JN.1.9-10, EPH.4.17-19, EZK.11.12, 2CO.2.6-7

### LUK.4.23
- Current count: 16
- TSK count: 7
- Current-only refs: 9
- TSK-only refs: 0
- Current-only examples: LUK.6.42, MRK.1.21-28, JHN.7.3-4, MAT.13.54, LUK.4.16, 2CO.5.16, JHN.4.28, ROM.11.34-35, MAT.4.23
- Current top refs: LUK.6.42, ROM.2.21-22, MRK.1.21-28, JHN.7.3-4, MAT.4.13, MAT.13.54, LUK.4.16, JHN.2.3-4, JHN.4.46-53, MRK.6.1
- TSK top refs: JHN.4.46-53, MAT.11.23-24, MRK.2.1-12, JHN.2.3-4, MAT.4.13, MRK.6.1, ROM.2.21-22

### JHN.12.15
- Current count: 15
- TSK count: 6
- Current-only refs: 9
- TSK-only refs: 0
- Current-only examples: JDG.12.14, 2SA.15.1, ISA.40.9-10, DEU.17.16, JDG.5.10, MIC.4.8, ZEC.2.9-11, 1KI.1.33, ISA.41.14
- Current top refs: 2SA.16.2, JDG.12.14, 2SA.15.1, ISA.40.9-10, DEU.17.16, ZEC.9.9, JDG.5.10, MIC.4.8, ZEC.2.9-11, 1KI.1.33
- TSK top refs: ZEC.9.9, ISA.62.11, MAT.2.2-6, ISA.35.4-5, ZEP.3.16-17, 2SA.16.2

### PRO.17.11
- Current count: 12
- TSK count: 3
- Current-only refs: 9
- TSK-only refs: 0
- Current-only examples: MAT.21.41, LUK.19.27, 2SA.20.1, 2SA.20.22, 2SA.18.19, 2SA.15.12, 1KI.2.31, 1KI.2.24-25, MAT.22.7
- Current top refs: 1KI.2.46, MAT.21.41, LUK.19.27, 2SA.18.15, 2SA.20.1, 2SA.20.22, 2SA.18.19, 2SA.15.12, 1KI.2.31, 2SA.16.5-9
- TSK top refs: 1KI.2.46, 2SA.16.5-9, 2SA.18.15

### MRK.14.26
- Current count: 11
- TSK count: 2
- Current-only refs: 9
- TSK-only refs: 0
- Current-only examples: MAT.21.1, 1CO.14.15, JDG.18.1-4, ACT.16.25, JAS.5.13, COL.3.16, REV.5.9, EPH.5.18-20, PSA.47.6-7
- Current top refs: MAT.21.1, 1CO.14.15, LUK.22.39, JDG.18.1-4, MAT.26.30, ACT.16.25, JAS.5.13, COL.3.16, REV.5.9, EPH.5.18-20
- TSK top refs: MAT.26.30, LUK.22.39
