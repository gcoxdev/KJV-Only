# Genealogy Note Reference Report

Source: `public/references/genealogy.json`
Generated: 2026-03-12T01:23:28.165Z

Comparison notes:
- Existing genealogy refs were normalized for legacy book codes like `MAR -> MRK`, `JOH -> JHN`, `JAM -> JAS`, `SON -> SNG`, `EZE -> EZK`.
- Shorthand note chains like `Is 1:1; 7:1; 14:28` were expanded using the previous explicit book within the same semicolon chain.
- Verse ranges like `1Chr 6:8-9` were expanded into individual verse refs for reporting.

## Summary

- peopleInDataset: 3153
- peopleWithVerseLikeCitationsInNotes: 1043
- peopleWithMissingStructuredRefsFromNotes: 473
- extractedUniqueNoteRefs: 2339
- missingStructuredRefs: 712

## Top Repeated Missing Refs

- EZR.10.34: 24
- NEH.12.10: 21
- 1CH.24.8: 13
- 1CH.9.12: 10
- EZR.2.7: 9
- EZR.2.6: 8
- EZR.2.19: 7
- ACT.12.1: 6
- EZR.2.10: 6
- EZR.2.11: 6
- EZR.2.3: 6
- EZR.2.8: 6
- NEH.12.1: 6
- LUK.3.35: 5
- NEH.12.5: 5
- NEH.12.7: 5
- NEH.7.7: 5
- 1CH.24.11: 4
- EZR.6.14: 4
- LUK.3.33: 4
- MAT.1.12: 4
- NEH.12.4: 4
- 1CH.1.40: 3
- 1CH.26.1: 3
- 1CH.8.33: 3
- 2CH.22.6: 3
- ACT.24.24: 3
- EZR.2.13: 3
- EZR.4.7: 3
- GEN.35.18: 3

## Sample Findings

### Seth / Sheth (seth_17)
- Note: Alias 1Chr 1:1. See Luk 3:38.
- Missing refs from note: Luk 3:38 -> LUK.3.38
- Already present from note: 1Chr 1:1 -> 1CH.1.1

### Abiasaph / Ebiasaph / Asaph (abiasaph_386)
- Note: Alias: 1Chr 6:23; 1Chr 26:1. He is the "Ebiasaph" mentioned in 1Chr 6:37; 1Chr 9:19.
- Missing refs from note: 1Chr 26:1 -> 1CH.26.1
- Already present from note: 1Chr 6:23 -> 1CH.6.23; 1Chr 6:37 -> 1CH.6.37; 1Chr 9:19 -> 1CH.9.19

### Ahaz / Achaz (ahaz_942)
- Note: 12th king to reign over Judah after Solomon's death and Israel's separation from Judah. Alias Mat 1:9. Gets married 2Kings 18:2. See 2Chr 28:1; Is 1:1; 7:1; 14:28; 38:8; Hos 1:1; Mic 1:1. In 2Chr 28:19 he was called as king of Israel: In some cases the Bible names the kings of Judah as kings of Israel.
- Missing refs from note: Mat 1:9 -> MAT.1.9; 2Kings 18:2 -> 2KI.18.2
- Already present from note: 2Chr 28:1 -> 2CH.28.1; Is 1:1 -> ISA.1.1; 7:1 -> ISA.7.1; 14:28 -> ISA.14.28; 38:8 -> ISA.38.8; Hos 1:1 -> HOS.1.1; Mic 1:1 -> MIC.1.1; 2Chr 28:19 -> 2CH.28.19

## Full Findings

See `reports/genealogy-note-reference-report.json` for the complete machine-readable list.

| Person | Id | Missing refs from note | Already present from note |
|---|---|---|---|
| Abdi | abdi_2243 | Ezr 2:7 -> EZR.2.7 |  |
| Abiasaph / Ebiasaph / Asaph | abiasaph_386 | 1Chr 26:1 -> 1CH.26.1 | 1Chr 6:23 -> 1CH.6.23<br>1Chr 6:37 -> 1CH.6.37<br>1Chr 9:19 -> 1CH.9.19 |
| Abidah / Abida | abidah_168 | 1Chr 1:33 -> 1CH.1.33 |  |
| Abiel / Ner / Jehiel | abiel_614 | 1Chr 9:35 -> 1CH.9.35<br>1Chr 8:29 -> 1CH.8.29 | 1Chr 8:33 -> 1CH.8.33 |
| Abihail | abihail_2647 | Esther 2:5 -> EST.2.5 |  |
| Abijah / Abia | abijah_1763 | Luk 1:5 -> LUK.1.5 |  |
| Abijam / Abia / Abijah | abijam_853 | 2Chr 11,20 -> 2CH.11.20 | 1Chr 3,10 -> 1CH.3.10 |
| Absalom / Abishalom | absalom_658 | 1Kings 15:2 -> 1KI.15.2 | 2Sam 14:27 -> 2SA.14.27 |
| Achbor / Abdon | achbor_982 | 2Chr 34:20 -> 2CH.34.20 |  |
| Adaiah | adaiah_2258 | Ezr 2:10 -> EZR.2.10 |  |
| Adaiah | adaiah_2303 | Ezr 10:34 -> EZR.10.34 |  |
| Adiel / Azareel | adiel_1592 | 1Chr 9:12 -> 1CH.9.12 | Neh 11:13 -> NEH.11.13 |
| Adna | adna_2262 | Ezr 2:6 -> EZR.2.6 |  |
| Adna | adna_2570 | Neh 12:3 -> NEH.12.3<br>Neh 12:10 -> NEH.12.10 |  |
| Adoram / Adoniram / Hadoram | adoram_736 | 1Kings 4:6 -> 1KI.4.6 | 2Chr 10:18 -> 2CH.10.18 |
| Agrippa | agrippa_3015 | Acts 12:1 -> ACT.12.1<br>Acts 24:24 -> ACT.24.24 | Acts 25:13 -> ACT.25.13 |
| Ahab | ahab_871 | 1Kings 16:31 -> 1KI.16.31 | 2Kings 10:1 -> 2KI.10.1<br>Mic 6:16 -> MIC.6.16 |
| Ahasuerus | ahasuerus_2126 | Ezr 4:7 -> EZR.4.7 | Esther 1:1 -> EST.1.1<br>Dan 9:1 -> DAN.9.1 |
| Ahaz / Achaz | ahaz_942 | Mat 1:9 -> MAT.1.9<br>2Kings 18:2 -> 2KI.18.2 | 2Chr 28:1 -> 2CH.28.1<br>Is 1:1 -> ISA.1.1<br>7:1 -> ISA.7.1<br>14:28 -> ISA.14.28<br>38:8 -> ISA.38.8<br>Hos 1:1 -> HOS.1.1<br>Mic 1:1 -> MIC.1.1<br>2Chr 28:19 -> 2CH.28.19 |
| Ahaziah / Jehoahaz / Azariah | ahaziah_901 | 2Kings 12,1 -> 2KI.12.1<br>2Chr 22:6 -> 2CH.22.6<br>2Chr 22:9 -> 2CH.22.9 | 2Chr 21:17 -> 2CH.21.17 |
| Ahijah | ahijah_845 | 1Kings 11,31 -> 1KI.11.31 | 2Chr 9:29 -> 2CH.9.29<br>2Chr 10:15 -> 2CH.10.15 |
| Ahimelech / Abimelech | ahimelech_697 | 1Chr 18:16 -> 1CH.18.16 | 1Chr 24:3 -> 1CH.24.3 |
| Ahlai | ahlai_1057 | 1Chr 2:34 -> 1CH.2.34<br>1Chr 2:35 -> 1CH.2.35 |  |
| Ajah / Aiah | ajah_245 | 1Chr 1:40 -> 1CH.1.40 |  |
| Alvah / Aliah | alvah_274 | 1Chr 1:51 -> 1CH.1.51 |  |
| Alvan / Alian | alvan_240 | 1Chr 1:40 -> 1CH.1.40 |  |
| Amariah | amariah_2311 | Ezr 10:34 -> EZR.10.34 |  |
| Amaziah | amaziah_916 | 2Kings 15:2 -> 2KI.15.2 | 2Chr 24:27 -> 2CH.24.27 |
| Amminadab / Aminadab | amminadab_378 | Luk 3:33 -> LUK.3.33 | Mat 1:4 -> MAT.1.4 |
| Amon | amon_971 | 2Kings 22:1 -> 2KI.22.1 | 2Chr 33:20 -> 2CH.33.20<br>Jer 1:2 -> JER.1.2<br>25:3 -> JER.25.3<br>Zeph 1:1 -> ZEP.1.1 |
| Amon | amon_972 | 2Kings 22:1 -> 2KI.22.1 | 2Chr 33:20 -> 2CH.33.20<br>Jer 1:2 -> JER.1.2<br>25:3 -> JER.25.3<br>Zeph 1:1 -> ZEP.1.1 |
| Amram | amram_364 | Ex 2,1 -> EXO.2.1 | Ex 6,20 -> EXO.6.20 |
| Amzi | amzi_2535 | 1Chr 9:12 -> 1CH.9.12 |  |
| Apollos | apollos_2993 | 3:4-22 -> 1CO.3.7<br>3:4-22 -> 1CO.3.8<br>3:4-22 -> 1CO.3.9<br>3:4-22 -> 1CO.3.10<br>3:4-22 -> 1CO.3.11<br>3:4-22 -> 1CO.3.12<br>3:4-22 -> 1CO.3.13<br>3:4-22 -> 1CO.3.14<br>3:4-22 -> 1CO.3.15<br>3:4-22 -> 1CO.3.16<br>3:4-22 -> 1CO.3.17<br>3:4-22 -> 1CO.3.18<br>3:4-22 -> 1CO.3.19<br>3:4-22 -> 1CO.3.20<br>3:4-22 -> 1CO.3.21 | 1Cor 1:12 -> 1CO.1.12<br>3:4-22 -> 1CO.3.4<br>3:4-22 -> 1CO.3.5<br>3:4-22 -> 1CO.3.6<br>3:4-22 -> 1CO.3.22<br>4:6 -> 1CO.4.6<br>16:12 -> 1CO.16.12<br>Tit 3:13 -> TIT.3.13 |
| Arodi / Arod | arodi_327 | Nu 26,17 -> NUM.26.17 |  |
| Arphaxad | arphaxad_76 | Luk 3:35-36 -> LUK.3.35 | Gen 10:24 -> GEN.10.24<br>Luk 3:35-36 -> LUK.3.36 |
| Artaxerxes | artaxerxes_2127 | Ezr 4:21 -> EZR.4.21 |  |
| Artaxerxes | artaxerxes_2139 | Neh 2:1-6 -> NEH.2.2<br>Neh 2:1-6 -> NEH.2.3<br>Neh 2:1-6 -> NEH.2.4<br>Neh 2:1-6 -> NEH.2.5<br>Neh 2:1-6 -> NEH.2.6 | Neh 2:1-6 -> NEH.2.1<br>Ezr 7:1 -> EZR.7.1<br>7:7 -> EZR.7.7<br>Neh 13:6 -> NEH.13.6 |
| Asa | asa_855 | 1Kings 15:10 -> 1KI.15.10 | Jer 41:9 -> JER.41.9 |
| Asaph | asaph_2324 | Ezr 6:14 -> EZR.6.14 |  |
| Asher / Aser | asher_201 | Rev 7:6 -> REV.7.6 | Luk 2:36 -> LUK.2.36 |
| Ashkenaz / Ashchenaz | ashkenaz_37 | 1Chr 1:6 -> 1CH.1.6 |  |
| Ashur | ashur_1035 | 2Chr 11:6 -> 2CH.11.6 | 1Chr 4:5 -> 1CH.4.5<br>1Chr 2:24 -> 1CH.2.24 |
| Athaliah | athaliah_2154 | Ezr 2:7 -> EZR.2.7 |  |
| Athlai | athlai_2255 | Ezr 2:11 -> EZR.2.11 |  |
| Azareel | azareel_2307 | Ezr 10:34 -> EZR.10.34 |  |
| Azariah | azariah_1317 | Neh 7:7 -> NEH.7.7 | 1Chr 9:11 -> 1CH.9.11<br>Ezr 7:1 -> EZR.7.1 |
| Azariah | azariah_797 | 1Chr 6:8-9 -> 1CH.6.8 | 1Kings 4:2 -> 1KI.4.2<br>1Chr 6:8-9 -> 1CH.6.9 |
| Azariah / Uzziah / Ozias | azariah_921 | Mat 1:8 -> MAT.1.8<br>2Kings 15:33 -> 2KI.15.33 | 2Chr 26:1 -> 2CH.26.1<br>Is 1:1 -> ISA.1.1<br>6:1 -> ISA.6.1<br>7:1 -> ISA.7.1<br>Hos 1:1 -> HOS.1.1<br>Zech 14:5 -> ZEC.14.5 |
| Aziza | aziza_2251 | Ezr 2:8 -> EZR.2.8 |  |
| Balak / Balac | balak_465 | Rev 2:14 -> REV.2.14 | Mic 6:5 -> MIC.6.5 |
| Bani | bani_2298 | Ezr 10:34 -> EZR.10.34 |  |
| Barachel | barachel_2670 | Job 32:1 -> JOB.32.1 |  |
| Baruch | baruch_2714 | Jer 36:4-10 -> JER.36.6<br>Jer 36:4-10 -> JER.36.7<br>Jer 36:4-10 -> JER.36.9 | Jer 36:4-10 -> JER.36.4<br>Jer 36:4-10 -> JER.36.5<br>Jer 36:4-10 -> JER.36.8<br>Jer 36:4-10 -> JER.36.10<br>Jer 43:3 -> JER.43.3<br>45:1 -> JER.45.1 |
| Barzillai | barzillai_2123 | 2Sam 17:27 -> 2SA.17.27 | Neh 7:63 -> NEH.7.63 |
| Bashemath / Adah | bashemath_187 | Ge 36,2 -> GEN.36.2 |  |
| Bathsheba / Bathshua / Bath-sheba | bathsheba_708 | 2Sam 11:27 -> 2SA.11.27 | 2Sam 11:3 -> 2SA.11.3<br>1Chr 3:5 -> 1CH.3.5 |
| Bazluth / Bazlith | bazluth_2100 | Neh 7:54 -> NEH.7.54 |  |
| Bebai | bebai_2163 | Ezr 2:11 -> EZR.2.11 |  |
| Bedeiah | bedeiah_2290 | Ezr 10:34 -> EZR.10.34 |  |
| Beeri | beeri_186 | Ge 36,2 -> GEN.36.2 |  |
| Benaiah | benaiah_2239 | Ezr 2:3 -> EZR.2.3 |  |
| Benaiah | benaiah_2264 | Ezr 2:6 -> EZR.2.6 |  |
| Benaiah | benaiah_2289 | Ezr 10:34 -> EZR.10.34 |  |
| Benhadad / Ben-hadad | benhadad_857 | Jer 49:27 -> JER.49.27 | 2Chr 16:2 -> 2CH.16.2<br>1Kings 20:34 -> 1KI.20.34 |
| Benhadad | benhadad_900 | 2Kings 8,15 -> 2KI.8.15 |  |
| Benjamin | benjamin_2275 | 1Chr 24:8 -> 1CH.24.8 |  |
| Benoni / Benjamin | benoni_209 | Rev 7:8 -> REV.7.8 |  |
| Beor / Bosor | beor_468 | Mic 6:5 -> MIC.6.5 | 2Pet 2:15 -> 2PE.2.15 |
| Bernice | bernice_3016 | Acts 12:1 -> ACT.12.1<br>Acts 24:24 -> ACT.24.24 | Acts 25:13 -> ACT.25.13 |
| Bezaleel | bezaleel_2267 | Ezr 2:6 -> EZR.2.6 |  |
| Bilgai / Bilgah | bilgai_2451 | Neh 12:5 -> NEH.12.5 |  |
| Binnui | binnui_2268 | Ezr 2:6 -> EZR.2.6 |  |
| Binnui | binnui_2299 | Ezr 10:34 -> EZR.10.34 |  |
| Binnui | binnui_2454 | Ezr 3:9 -> EZR.3.9 | Neh 12:8 -> NEH.12.8 |
| Blastus | blastus_2974 | Acts 12:1 -> ACT.12.1 |  |
| Boaz / Booz | boaz_590 | Ruth 4:10 -> RUT.4.10 | Mat 1:5 -> MAT.1.5<br>Luk 3:32 -> LUK.3.32 |
| Bunni | bunni_2538 | 1Chr 9:14 -> 1CH.9.14 |  |
| Cainan / Kenan | cainan_19 | Luk 3:37 -> LUK.3.37 | 1Chr 1:2 -> 1CH.1.2 |
| Cainan | cainan_2923 | Gen 10:24 -> GEN.10.24<br>Luk 3:35-36 -> LUK.3.35 | Luk 3:35-36 -> LUK.3.36 |
| Caleb / Chelubai / Carmi | caleb_1022 | 1Chr 4:1 -> 1CH.4.1<br>1Ch 2:19 -> 1CH.2.19<br>1Chr 2:46 -> 1CH.2.46<br>1Chr 2:48 -> 1CH.2.48 | 1Chr 2:9 -> 1CH.2.9 |
| Caphtorim / Caphthorim | caphtorim_62 | 1Chr 1:12 -> 1CH.1.12 |  |
| Charchemish | charchemish_2032 | 2Kings 23:29 -> 2KI.23.29 |  |
| Chelal | chelal_2263 | Ezr 2:6 -> EZR.2.6 |  |
| Chelluh | chelluh_2291 | Ezr 10:34 -> EZR.10.34 |  |
| Chilion | chilion_587 | Ruth 4:10 -> RUT.4.10 |  |
| Chuza | chuza_2926 | Mat 14:1 -> MAT.14.1 |  |
| Darius | darius_2125 | Ezr 4:7 -> EZR.4.7 | Ezr 6:14 -> EZR.6.14<br>Ezr 4:24 -> EZR.4.24<br>5:5 -> EZR.5.5<br>Hag 1:1 -> HAG.1.1<br>2:10 -> HAG.2.10<br>Zech 1:1 -> ZEC.1.1<br>7:1 -> ZEC.7.1 |
| Dodo / Dodai | dodo_751 | 1Chr 27:4 -> 1CH.27.4 |  |
| Drusilla | drusilla_3013 | Acts 12:1 -> ACT.12.1<br>Acts 25:13 -> ACT.25.13 |  |
| Ebed | ebed_2151 | Ezr 2:15 -> EZR.2.15 |  |
| Eber | eber_2581 | Neh 12:7 -> NEH.12.7<br>Neh 12:10 -> NEH.12.10 |  |
| Ehi / Aharah | ehi_341 | 1Chr 8:1 -> 1CH.8.1 |  |
| Elasah | elasah_2222 | 1Chr 9:12 -> 1CH.9.12 |  |
| Eleasah / Eshek | eleasah_1553 | 1Chr 8:37 -> 1CH.8.37 | 1Chr 8:39 -> 1CH.8.39 |
| Eleazar | eleazar_2237 | Ezr 2:3 -> EZR.2.3 |  |
| Eli | eli_603 | 1Chr 24:3 -> 1CH.24.3 |  |
| Eliada / Beeliada | eliada_683 | 1Chr 14:7 -> 1CH.14.7 |  |
| Eliah | eliah_2245 | Ezr 2:7 -> EZR.2.7 |  |
| Eliakim / Jehoiakim | eliakim_994 | 2Kings 24:8 -> 2KI.24.8 | 2Kings 23:34 -> 2KI.23.34<br>2Chr 36:4 -> 2CH.36.4<br>Jer 1:3 -> JER.1.3<br>22:18 -> JER.22.18<br>24:1 -> JER.24.1<br>25:1 -> JER.25.1<br>26:1 -> JER.26.1<br>27:1 -> JER.27.1<br>28:4 -> JER.28.4<br>35:1 -> JER.35.1<br>36:1 -> JER.36.1<br>37:1 -> JER.37.1<br>45:1 -> JER.45.1<br>46:2 -> JER.46.2<br>52:2 -> JER.52.2<br>Dan 1:1 -> DAN.1.1 |
| Eliakim / Jehoiakim | eliakim_995 | 2Kings 24:8 -> 2KI.24.8 | 2Kings 23:34 -> 2KI.23.34<br>2Chr 36:4 -> 2CH.36.4<br>Jer 1:3 -> JER.1.3<br>22:18 -> JER.22.18<br>24:1 -> JER.24.1<br>25:1 -> JER.25.1<br>26:1 -> JER.26.1<br>27:1 -> JER.27.1<br>28:4 -> JER.28.4<br>35:1 -> JER.35.1<br>36:1 -> JER.36.1<br>37:1 -> JER.37.1<br>45:1 -> JER.45.1<br>46:2 -> JER.46.2<br>52:2 -> JER.52.2<br>Dan 1:1 -> DAN.1.1 |
| Eliam / Ammiel | eliam_709 | 1Chr 3,5 -> 1CH.3.5 |  |
| Eliashib | eliashib_2247 | Ezr 2:8 -> EZR.2.8 |  |
| Eliashib | eliashib_2294 | Ezr 10:34 -> EZR.10.34 |  |
| Eliashib | eliashib_2616 | Neh 2:10 -> NEH.2.10 | Neh 13:7 -> NEH.13.7 |
| Eliezer | eliezer_2207 | 1Chr 24:11 -> 1CH.24.11 |  |
| Eliezer | eliezer_2270 | 1Chr 24:8 -> 1CH.24.8 |  |
| Elihu | elihu_1856 | 1Sam 16:10-13 -> 1SA.16.10<br>1Sam 16:10-13 -> 1SA.16.11<br>1Sam 16:10-13 -> 1SA.16.12<br>1Sam 16:10-13 -> 1SA.16.13 |  |
| Elihu / Eliab / Eliel | elihu_598 | 1Chr 6:27 -> 1CH.6.27<br>1Chr 6:34 -> 1CH.6.34 |  |
| Elijah | elijah_2213 | 1Chr 24:8 -> 1CH.24.8 |  |
| Elijah / Elias | elijah_877 | James 5:17 -> JAS.5.17 | 2Chr 21:12 -> 2CH.21.12<br>Mal 4:5 -> MAL.4.5<br>Mat 11:14 -> MAT.11.14<br>Mat 16:14 -> MAT.16.14<br>27:47 -> MAT.27.47<br>Mark 6:15 -> MRK.6.15<br>8:28 -> MRK.8.28<br>9:4 -> MRK.9.4<br>Luk 1:17 -> LUK.1.17<br>4:25 -> LUK.4.25<br>9:8 -> LUK.9.8<br>Rom 11:2 -> ROM.11.2 |
| Elioenai | elioenai_2217 | 1Chr 9:12 -> 1CH.9.12 |  |
| Elioenai | elioenai_2246 | Ezr 2:8 -> EZR.2.8 |  |
| Eliphelet | eliphelet_2166 | Ezr 2:13 -> EZR.2.13 |  |
| Eliphelet | eliphelet_2281 | Ezr 2:19 -> EZR.2.19 |  |
| Elisabeth | elisabeth_2874 | Ex 4:14 -> EXO.4.14 | Luk 1:36 -> LUK.1.36 |
| Elisha / Eliseus | elisha_882 | Luk 4:27 -> LUK.4.27 |  |
| Elishua / Elishama | elishua_679 | 1Chr 3:6 -> 1CH.3.6 |  |
| Enoch / Henoch | enoch_22 | Jude 1:14 -> JUD.1.14 | 1Chr 1:3 -> 1CH.1.3<br>Luk 3:37 -> LUK.3.37 |
| Enos / Enosh | enos_18 | Luk 3:38 -> LUK.3.38 | 1Chr 1:1 -> 1CH.1.1 |
| Ethan / Jeduthun | ethan_1347 | 1Chr 6:33 -> 1CH.6.33<br>1Chr 15:17 -> 1CH.15.17<br>1Chr 25:1-6 -> 1CH.25.2<br>1Chr 25:1-6 -> 1CH.25.4<br>1Chr 25:1-6 -> 1CH.25.5 | 1Chr 25:1-6 -> 1CH.25.1<br>1Chr 25:1-6 -> 1CH.25.3<br>1Chr 25:1-6 -> 1CH.25.6<br>2Chr 5:12 -> 2CH.5.12<br>1Chr 16:38 -> 1CH.16.38<br>1Chr 16:41 -> 1CH.16.41 |
| Euodias | euodias_3055 | Phil 4:3 -> PHP.4.3 |  |
| Evilmerodach | evilmerodach_1015 | Jer 52:28 -> JER.52.28 |  |
| Ezer / Ezar | ezer_235 | 1Chr 1:38 -> 1CH.1.38 |  |
| Gedaliah | gedaliah_2209 | 1Chr 24:11 -> 1CH.24.11 |  |
| Gera | gera_339 | 1Chr 8:3 -> 1CH.8.3 | 1Chr 8:5 -> 1CH.8.5 |
| Gershon / Gershom | gershon_310 | 1Chr 6:16 -> 1CH.6.16 |  |
| Geshem / Gashmu | geshem_2327 | Ezr 6:14 -> EZR.6.14<br>Neh 6:6 -> NEH.6.6 |  |
| Ginnethon / Ginnetho | ginnethon_2445 | Neh 12:4 -> NEH.12.4 |  |
| Girgasite / Girgashite | girgasite_67 | 1Chr 1:14 -> 1CH.1.14 |  |
| Gog | gog_2779 | Ezekiel 38:14-18 -> EZK.38.15<br>Ezekiel 38:14-18 -> EZK.38.17<br>11:15 -> EZK.11.15 | Ezekiel 38:14-18 -> EZK.38.14<br>Ezekiel 38:14-18 -> EZK.38.16<br>Ezekiel 38:14-18 -> EZK.38.18<br>39:1 -> EZK.39.1 |
| Goliath | goliath_637 | 2Sam 21:22 -> 2SA.21.22 | 1Chr 20:5 -> 1CH.20.5 |
| Hadar / Hadad | hadar_177 | 1Chr 1:30 -> 1CH.1.30 |  |
| Hadar / Hadad | hadar_269 | 1Chr 1:50 -> 1CH.1.50 |  |
| Hadassah / Esther | hadassah_2645 | Esther 1:7 -> EST.1.7 |  |
| Hagabah / Hagaba | hagabah_2080 | Neh 7:48 -> NEH.7.48 |  |
| Hagar / Agar | hagar_126 | Gal 4:24 -> GAL.4.24 |  |
| Hakkatan | hakkatan_2165 | Ezr 2:12 -> EZR.2.12 |  |
| Hamor / Emmor | hamor_207 | Acts 7:16 -> ACT.7.16 |  |
| Hanani | hanani_2210 | 1Chr 24:14 -> 1CH.24.14 |  |
| Hananiah | hananiah_2253 | Ezr 2:11 -> EZR.2.11 |  |
| Hananiah | hananiah_2565 | Neh 12:1 -> NEH.12.1<br>Neh 12:10 -> NEH.12.10 |  |
| Hashabiah | hashabiah_2582 | Neh 12:7 -> NEH.12.7<br>Neh 12:10 -> NEH.12.10 |  |
| Hasshub / Hashub | hasshub_1598 | Neh 11:15 -> NEH.11.15 |  |
| Hasupha / Hashupha | hasupha_2074 | Neh 7:46 -> NEH.7.46 |  |
| Hege / Hegai | hege_2640 | Esther 2:8 -> EST.2.8 |  |
| Heleb / Heled / Heldai | heleb_764 | 1Chr 27:15 -> 1CH.27.15 | 1Chr 11:30 -> 1CH.11.30 |
| Helkai | helkai_2571 | Neh 12:3 -> NEH.12.3<br>Neh 12:10 -> NEH.12.10 |  |
| Hemdan / Amram | hemdan_249 | 1Chr 1:41 -> 1CH.1.41 |  |
| Herod | herod_2853 | 23:7-12 -> LUK.23.9<br>23:7-12 -> LUK.23.10 | Luke 3:1 -> LUK.3.1<br>Mark 6:14 -> MRK.6.14<br>8:15 -> MRK.8.15<br>Luk 3:19 -> LUK.3.19<br>8:3 -> LUK.8.3<br>9:7 -> LUK.9.7<br>13:31 -> LUK.13.31<br>23:7-12 -> LUK.23.7<br>23:7-12 -> LUK.23.8<br>23:7-12 -> LUK.23.11<br>23:7-12 -> LUK.23.12<br>Acts 4:27 -> ACT.4.27 |
| Herod | herod_2970 | Mat 14:1 -> MAT.14.1<br>Acts 12:23 -> ACT.12.23<br>Acts 25:13 -> ACT.25.13<br>Acts 24:24 -> ACT.24.24 |  |
| Hezekiah / Ezekias | hezekiah_944 | Mat 1:9 -> MAT.1.9<br>2Kings 21:1 -> 2KI.21.1 | Prov 25:1 -> PRO.25.1<br>Is 1:1 -> ISA.1.1<br>36:1 -> ISA.36.1<br>Jer 15:4 -> JER.15.4<br>26:18-19 -> JER.26.18<br>26:18-19 -> JER.26.19<br>Hos 1:1 -> HOS.1.1<br>Mic 1:1 -> MIC.1.1 |
| Hezron / Esrom | hezron_313 | Luk 3:33 -> LUK.3.33 | Mat 1:3 -> MAT.1.3<br>1Chr 2:21 -> 1CH.2.21<br>1Chr 2:24 -> 1CH.2.24 |
| Hiram / Huram | hiram_831 | 1Kings 7:14 -> 1KI.7.14<br>2Chr 2:14 -> 2CH.2.14 | 2Chr 4:16 -> 2CH.4.16 |
| Hodaviah / Judah / Hodevah | hodaviah_2069 | Ezr 2:40 -> EZR.2.40<br>Neh 7:43 -> NEH.7.43 | Ezr 3:9 -> EZR.3.9 |
| Hotham / Helem | hotham_1431 | 1Chr 7:35 -> 1CH.7.35 |  |
| Huppim / Hupham / Huram | huppim_344 | Nu 26:39 -> NUM.26.39 | 1Chr 8:5 -> 1CH.8.5 |
| Iddo / Adaiah | iddo_1322 | 1Chr 6:41 -> 1CH.6.41 |  |
| Iddo | iddo_1893 | 1Kings 13:1 -> 1KI.13.1 | 2Chr 12:15 -> 2CH.12.15<br>2Chr 13:22 -> 2CH.13.22 |
| Imlah / Imla | imlah_886 | 2Chr 18:7 -> 2CH.18.7 |  |
| Ishbah | ishbah_1204 | 1Chr 4:18 -> 1CH.4.18 |  |
| Ishbosheth / Eshbaal | ishbosheth_654 | 1Chr 8,33 -> 1CH.8.33 |  |
| Ishijah | ishijah_2271 | 1Chr 24:8 -> 1CH.24.8 |  |
| Ishmael | ishmael_2219 | 1Chr 9:12 -> 1CH.9.12 |  |
| Ishui / Abinadab | ishui_625 | 1Sam 31,6 -> 1SA.31.6<br>1Chr 8,33 -> 1CH.8.33 | 1Sam 31,2 -> 1SA.31.2 |
| Isui / Jesui / Ishuai | isui_331 | 1Chr 7:30 -> 1CH.7.30 | Nu 26:44 -> NUM.26.44 |
| Ittai / Ithai | ittai_766 | 1Chr 11:31 -> 1CH.11.31 |  |
| Izhar / Izehar / Amminadab | izhar_365 | Num 3,19 -> NUM.3.19<br>1 Ch 6,22 -> 1CH.6.22 |  |
| Jaalah / Jaala | jaalah_2111 | Neh 7:58 -> NEH.7.58 |  |
| Jaasau | jaasau_2297 | Ezr 10:34 -> EZR.10.34 |  |
| Jaazaniah / Jezaniah / Azariah | jaazaniah_1013 | Jer 43:2 -> JER.43.2 | Jer 40:8 -> JER.40.8<br>Jer 42:1 -> JER.42.1 |
| Jaaziel / Aziel | jaaziel_1708 | 1Chr 15:20 -> 1CH.15.20 |  |
| Jahzerah | jahzerah_1593 | Neh 11:13 -> NEH.11.13 |  |
| Jair | jair_2642 | Esther 2:15 -> EST.2.15 |  |
| James / Boanerges | james_2834 | Acts 12:1 -> ACT.12.1 | Mat 17:1 -> MAT.17.1<br>Mark 1:19 -> MRK.1.19<br>Mark 3:17 -> MRK.3.17<br>Mark 5:37 -> MRK.5.37<br>9:2 -> MRK.9.2<br>10:35 -> MRK.10.35<br>13:3 -> MRK.13.3<br>14:33 -> MRK.14.33<br>Luk 5:10 -> LUK.5.10<br>6:14 -> LUK.6.14<br>8:51 -> LUK.8.51<br>Acts 1:13 -> ACT.1.13<br>Acts 12:2 -> ACT.12.2 |
| James / Boanerges | james_2835 | Acts 12:1 -> ACT.12.1 | Mat 17:1 -> MAT.17.1<br>Mark 1:19 -> MRK.1.19<br>Mark 3:17 -> MRK.3.17<br>Mark 5:37 -> MRK.5.37<br>9:2 -> MRK.9.2<br>10:35 -> MRK.10.35<br>13:3 -> MRK.13.3<br>14:33 -> MRK.14.33<br>Luk 5:10 -> LUK.5.10<br>6:14 -> LUK.6.14<br>8:51 -> LUK.8.51<br>Acts 1:13 -> ACT.1.13<br>Acts 12:2 -> ACT.12.2 |
| James | james_2848 | Gal 1:18 -> GAL.1.18 | Mat 27:56 -> MAT.27.56<br>Mark 6:3 -> MRK.6.3<br>15:40 -> MRK.15.40<br>16:1 -> MRK.16.1<br>Acts 12:17 -> ACT.12.17<br>15:13 -> ACT.15.13<br>21:18 -> ACT.21.18<br>Gal 1:19 -> GAL.1.19<br>2:9 -> GAL.2.9<br>James 1:1 -> JAS.1.1<br>1Cor 15:7 -> 1CO.15.7<br>Jude 1:1 -> JUD.1.1 |
| James | james_2849 | Gal 1:18 -> GAL.1.18 | Mat 27:56 -> MAT.27.56<br>Mark 6:3 -> MRK.6.3<br>15:40 -> MRK.15.40<br>16:1 -> MRK.16.1<br>Acts 12:17 -> ACT.12.17<br>15:13 -> ACT.15.13<br>21:18 -> ACT.21.18<br>Gal 1:19 -> GAL.1.19<br>2:9 -> GAL.2.9<br>James 1:1 -> JAS.1.1<br>1Cor 15:7 -> 1CO.15.7<br>Jude 1:1 -> JUD.1.1 |
| Jared / Jered | jared_21 | Luk 3:37 -> LUK.3.37 | 1Chr 1:2 -> 1CH.1.2 |
| Jarib | jarib_2208 | 1Chr 24:11 -> 1CH.24.11 |  |
| Jashen / Hashem | jashen_774 | 1Chr 11:34 -> 1CH.11.34 |  |
| Jashobeam | jashobeam_1623 | 2Sam 23:8 -> 2SA.23.8 | 1Chr 27:2 -> 1CH.27.2 |
| Jashub | jashub_2259 | Ezr 2:10 -> EZR.2.10 |  |
| Jeaterai / Ethni | jeaterai_1324 | 1Chr 6:41 -> 1CH.6.41 |  |
| Jehiel / Jehieli | jehiel_1730 | 1Chr 23:8 -> 1CH.23.8<br>1Chr 29:8 -> 1CH.29.8 | 1Chr 26:21 -> 1CH.26.21 |
| Jehiel | jehiel_2196 | Ezr 2:7 -> EZR.2.7 |  |
| Jehiel | jehiel_2215 | 1Chr 24:8 -> 1CH.24.8 |  |
| Jehiel | jehiel_2242 | Ezr 2:7 -> EZR.2.7 |  |
| Jehoadah / Jarah | jehoadah_1546 | 1Chr 9:42 -> 1CH.9.42 |  |
| Jehohanan | jehohanan_2252 | Ezr 2:11 -> EZR.2.11 |  |
| Jehohanan | jehohanan_2567 | Neh 12:2 -> NEH.12.2<br>Neh 12:10 -> NEH.12.10 |  |
| Jehoiachin / Jeconiah / Jechonias / Coniah | jehoiachin_998 | Mat 1:11 -> MAT.1.11<br>Jer 22:24 -> JER.22.24<br>Jer 24:1 -> JER.24.1<br>27:20 -> JER.27.20<br>28:4 -> JER.28.4<br>29:2 -> JER.29.2<br>37:1 -> JER.37.1 | 1Chr 3:16 -> 1CH.3.16<br>52:31 -> JER.52.31 |
| Jehoiachin / Jeconiah / Jechonias / Coniah | jehoiachin_999 | Mat 1:11 -> MAT.1.11<br>Jer 22:24 -> JER.22.24<br>Jer 24:1 -> JER.24.1<br>27:20 -> JER.27.20<br>28:4 -> JER.28.4<br>29:2 -> JER.29.2<br>37:1 -> JER.37.1 | 1Chr 3:16 -> 1CH.3.16<br>52:31 -> JER.52.31 |
| Jehoiada / Barachias | jehoiada_909 | Mat 23:35 -> MAT.23.35 | 2Chr 22:11 -> 2CH.22.11<br>2Chr 23:1 -> 2CH.23.1<br>2Chr 24:3 -> 2CH.24.3 |
| Jehonathan | jehonathan_2577 | Neh 12:6 -> NEH.12.6<br>Neh 12:10 -> NEH.12.10 |  |
| Jehoram / Joram | jehoram_894 | 2Kings 8:18 -> 2KI.8.18<br>2Chr 22:6 -> 2CH.22.6 | 1Chr 3:11 -> 1CH.3.11<br>Mat 1:8 -> MAT.1.8 |
| Jehoram / Joram | jehoram_896 | 2Chr 22:5-7 -> 2CH.22.6 | 2Kings 8:25 -> 2KI.8.25<br>2Chr 22:5-7 -> 2CH.22.5<br>2Chr 22:5-7 -> 2CH.22.7 |
| Jehoshaphat / Je hoshaphat / Josaphat | jehoshaphat_860 | Joel 3:2 -> JOL.3.2 | 2Kings 8:16 -> 2KI.8.16<br>Mat 1:8 -> MAT.1.8<br>2Chr 21:2 -> 2CH.21.2 |
| Jehosheba / Jehoshabeath | jehosheba_907 | 2Chr 22:11 -> 2CH.22.11 |  |
| Jehozadak / Jozadak / Josedech | jehozadak_1318 | Zech 6:11 -> ZEC.6.11 | Ezr 3:2 -> EZR.3.2<br>Neh 12:26 -> NEH.12.26<br>Hag 1:1 -> HAG.1.1 |
| Jehucal / Jucal | jehucal_2741 | Jer 38:1-5 -> JER.38.2<br>Jer 38:1-5 -> JER.38.3<br>Jer 38:1-5 -> JER.38.4<br>Jer 38:1-5 -> JER.38.5 | Jer 38:1 -> JER.38.1 |
| Jeiel / Jehiah | jeiel_1718 | 1Chr 15:24 -> 1CH.15.24 |  |
| Jeiel | jeiel_2167 | Ezr 2:13 -> EZR.2.13 |  |
| Jeremai | jeremai_2282 | Ezr 2:19 -> EZR.2.19 |  |
| Jeremiah / Jeremy / Jeremias | jeremiah_2033 | Jer 1:1-3 -> JER.1.2<br>Jer 1:1-3 -> JER.1.3<br>Dan 9:2 -> DAN.9.2 | Mat 2:17 -> MAT.2.17<br>2Chr 36:12 -> 2CH.36.12<br>Ezr 1:1 -> EZR.1.1<br>Jer 1:1-3 -> JER.1.1<br>Mat 27:9 -> MAT.27.9 |
| Jeremoth / Jerimoth | jeremoth_1753 | 1Chr 13:30 -> 1CH.13.30 |  |
| Jeremoth | jeremoth_2244 | Ezr 2:7 -> EZR.2.7 |  |
| Jeremoth | jeremoth_2249 | Ezr 2:8 -> EZR.2.8 |  |
| Jerimoth / Jeremoth | jerimoth_1803 | 1Chr 25:22 -> 1CH.25.22 |  |
| Jeroboam | jeroboam_919 | 7:9 -> HOS.7.9 | Hos 1:1 -> HOS.1.1 |
| Jerusha / Jerushah | jerusha_939 | 2Kings 15:33 -> 2KI.15.33 | 2Chr 27:1 -> 2CH.27.1 |
| Jesaiah | jesaiah_2527 | Gen 35:18 -> GEN.35.18 |  |
| Jeshaiah | jeshaiah_2153 | Ezr 2:7 -> EZR.2.7 |  |
| Jeshua / Joshua | jeshua_2036 | Neh 7:7 -> NEH.7.7<br>Neh 12:1 -> NEH.12.1<br>Neh 12:7 -> NEH.12.7<br>Neh 12:10 -> NEH.12.10<br>Neh 12:26 -> NEH.12.26 | Ezr 3:2 -> EZR.3.2<br>5:2 -> EZR.5.2<br>Hag 1:1 -> HAG.1.1<br>Zech 3:1 -> ZEC.3.1<br>6:11 -> ZEC.6.11 |
| Jeshuah / Jeshua | jeshuah_1764 | Neh 7:39 -> NEH.7.39<br>1Chr 24:7 -> 1CH.24.7 | Ezr 2:36 -> EZR.2.36<br>Ezr 10:18 -> EZR.10.18 |
| Jesiah / Isshiah | jesiah_1749 | 1Chr 24:25 -> 1CH.24.25 |  |
| Jesus Christ / Immanuel / Emmanuel | jesus_christ_2683 | Is 7:14 -> ISA.7.14<br>Mat 1:23 -> MAT.1.23<br>Is 8:8 -> ISA.8.8 | Mat 1:1 -> MAT.1.1 |
| Jesus Christ / Immanuel / Emmanuel | jesus_christ_2684 | Is 7:14 -> ISA.7.14<br>Mat 1:23 -> MAT.1.23<br>Is 8:8 -> ISA.8.8 | Mat 1:1 -> MAT.1.1 |
| Jether / Ithra | jether_725 | 2Sam 17:25 -> 2SA.17.25 | 1Chr 2:17 -> 1CH.2.17 |
| Jeziah | jeziah_2234 | Ezr 2:3 -> EZR.2.3 |  |
| Jimnah / Jimna / Imnah | jimnah_329 | Nu 26:44 -> NUM.26.44<br>1Chr 7:30 -> 1CH.7.30 |  |
| Joah / Ethan | joah_1321 | 1Chr 6:42 -> 1CH.6.42 |  |
| Joash / Jehoash | joash_908 | 2Kings 11,21 -> 2KI.11.21<br>2Kings 14,2 -> 2KI.14.2<br>2Kings 12:1 -> 2KI.12.1 | 2Chr 22:11 -> 2CH.22.11 |
| Joash / Jehoash | joash_918 | 2Kings 13,10 -> 2KI.13.10 | Hos 1:1 -> HOS.1.1 |
| Jochebed | jochebed_370 | Ex 2,1 -> EXO.2.1 | Ex 6,20 -> EXO.6.20 |
| Johanan | johanan_2164 | Ezr 2:12 -> EZR.2.12 |  |
| John | john_2832 | 11:2-18 -> MAT.11.3<br>11:2-18 -> MAT.11.5<br>11:2-18 -> MAT.11.6<br>11:2-18 -> MAT.11.8<br>11:2-18 -> MAT.11.9<br>11:2-18 -> MAT.11.10<br>11:2-18 -> MAT.11.14<br>11:2-18 -> MAT.11.15<br>11:2-18 -> MAT.11.16<br>11:2-18 -> MAT.11.17 | Mat 9:14 -> MAT.9.14<br>11:2-18 -> MAT.11.2<br>11:2-18 -> MAT.11.4<br>11:2-18 -> MAT.11.7<br>11:2-18 -> MAT.11.11<br>11:2-18 -> MAT.11.12<br>11:2-18 -> MAT.11.13<br>11:2-18 -> MAT.11.18<br>21:25 -> MAT.21.25<br>Mark 1:4 -> MRK.1.4<br>2:18 -> MRK.2.18<br>6:14 -> MRK.6.14<br>8:28 -> MRK.8.28<br>Luk 1:13 -> LUK.1.13<br>3:2 -> LUK.3.2<br>5:33 -> LUK.5.33<br>7:19 -> LUK.7.19<br>9:7 -> LUK.9.7<br>11:1 -> LUK.11.1<br>20:4 -> LUK.20.4<br>John 1:6 -> JHN.1.6<br>Acts 10:37 -> ACT.10.37<br>11:16 -> ACT.11.16<br>13:24 -> ACT.13.24<br>18:25 -> ACT.18.25<br>19:3 -> ACT.19.3 |
| John / Mark / Marcus | john_2972 | Acts 13:5 -> ACT.13.5<br>13:13 -> ACT.13.13<br>1Pet 5:13 -> 1PE.5.13 | Acts 12:25 -> ACT.12.25<br>Acts 12:12 -> ACT.12.12<br>Col 4:10 -> COL.4.10<br>2Tim 4:11 -> 2TI.4.11<br>Philem 1:24 -> PHM.1.24 |
| Jona / Jonas | jona_2933 | Mat 16:17 -> MAT.16.17 | John 21:15 -> JHN.21.15 |
| Jona / Jonas | jona_2934 | Mat 16:17 -> MAT.16.17 | John 21:15 -> JHN.21.15 |
| Jonah / Jonas | jonah_922 | Jonah 1:1 -> JON.1.1 | Mat 12:39 -> MAT.12.39<br>Mat 16:4 -> MAT.16.4<br>Luk 11:29 -> LUK.11.29 |
| Jonathan | jonathan_2152 | Ezr 2:15 -> EZR.2.15 |  |
| Jonathan / Johanan | jonathan_2562 | Neh 12:22 -> NEH.12.22<br>Neh 12:23 -> NEH.12.23 |  |
| Jonathan | jonathan_2568 | Neh 12:2 -> NEH.12.2<br>Neh 12:10 -> NEH.12.10 |  |
| Jonathan | jonathan_581 | Judges 17:1-18 -> JDG.17.1<br>Judges 17:1-18 -> JDG.17.2<br>Judges 17:1-18 -> JDG.17.3<br>Judges 17:1-18 -> JDG.17.4<br>Judges 17:1-18 -> JDG.17.5<br>Judges 17:1-18 -> JDG.17.6<br>Judges 17:1-18 -> JDG.17.7<br>Judges 17:1-18 -> JDG.17.8<br>Judges 17:1-18 -> JDG.17.9<br>Judges 17:1-18 -> JDG.17.10<br>Judges 17:1-18 -> JDG.17.11<br>Judges 17:1-18 -> JDG.17.12<br>Judges 17:1-18 -> JDG.17.13<br>Judges 17:1-18 -> JDG.17.14<br>Judges 17:1-18 -> JDG.17.15<br>Judges 17:1-18 -> JDG.17.16<br>Judges 17:1-18 -> JDG.17.17<br>Judges 17:1-18 -> JDG.17.18 |  |
| Jorah / Hariph | jorah_2064 | Neh 7:24 -> NEH.7.24 |  |
| Joram / Hadoram | joram_692 | 1Chr 18:10 -> 1CH.18.10 |  |
| Joseph / Zaphnathpaaneah | joseph_205 | Acts 7:9-18 -> ACT.7.10<br>Acts 7:9-18 -> ACT.7.11<br>Acts 7:9-18 -> ACT.7.12<br>Acts 7:9-18 -> ACT.7.15<br>Acts 7:9-18 -> ACT.7.16<br>Acts 7:9-18 -> ACT.7.17<br>Rev 7:8 -> REV.7.8 | Ge 41:45 -> GEN.41.45<br>Psalm 77:15 -> PSA.77.15<br>78:67 -> PSA.78.67<br>80:1 -> PSA.80.1<br>81:5 -> PSA.81.5<br>105:17 -> PSA.105.17<br>John 4:5 -> JHN.4.5<br>Acts 7:9-18 -> ACT.7.9<br>Acts 7:9-18 -> ACT.7.13<br>Acts 7:9-18 -> ACT.7.14<br>Acts 7:9-18 -> ACT.7.18 |
| Joseph | joseph_2312 | Ezr 10:34 -> EZR.10.34 |  |
| Joseph | joseph_2569 | Neh 12:3 -> NEH.12.3<br>Neh 12:10 -> NEH.12.10 |  |
| Joshua / Oshea / Jehoshua / Jehoshuah / Hoshea / Jeshua / Jesus | joshua_391 | 1Chr 7:27 -> 1CH.7.27<br>Neh 8:17 -> NEH.8.17<br>Acts 7:45 -> ACT.7.45 | Nu 13:8 -> NUM.13.8<br>Nu 13:16 -> NUM.13.16 |
| Josiah / Hen | josiah_2813 | Zech 6:14 -> ZEC.6.14 |  |
| Josiah / Josias | josiah_849 | 2Kings 23:31 -> 2KI.23.31<br>2Kings 23:36 -> 2KI.23.36<br>Zeph 1:1 -> ZEP.1.1 | Mat 1:10 -> MAT.1.10<br>1Kings 13,2 -> 1KI.13.2<br>2Chr 33:25 -> 2CH.33.25<br>Jer 1:2 -> JER.1.2<br>22:11 -> JER.22.11<br>25:1 -> JER.25.1<br>37:1 -> JER.37.1<br>45:1 -> JER.45.1<br>46:2 -> JER.46.2<br>Mat 1:11 -> MAT.1.11 |
| Jotham / Joatham | jotham_926 | Mat 1:9 -> MAT.1.9 | Is 1:1 -> ISA.1.1<br>7:1 -> ISA.7.1<br>Hos 1:1 -> HOS.1.1<br>Mic 1:1 -> MIC.1.1 |
| Jozabad | jozabad_2221 | 1Chr 9:12 -> 1CH.9.12 |  |
| Judah / Judas / Juda | judah_197 | Ge 38:18 -> GEN.38.18<br>Rev 7:5 -> REV.7.5 | Ge 38:2 -> GEN.38.2<br>Mat 1:2 -> MAT.1.2<br>Luk 3:33 -> LUK.3.33 |
| Judas / Juda / Jude | judas_2851 | Mark 6:3 -> MRK.6.3 | Jude 1:1 -> JUD.1.1 |
| Judas / Juda / Jude | judas_2852 | Mark 6:3 -> MRK.6.3 | Jude 1:1 -> JUD.1.1 |
| Judas | judas_2964 | Acts 9:17 -> ACT.9.17 |  |
| Judas / Barsabas | judas_2980 | Acts 15:27-32 -> ACT.15.28<br>Acts 15:27-32 -> ACT.15.29<br>Acts 15:27-32 -> ACT.15.30<br>Acts 15:27-32 -> ACT.15.31 | Acts 15:22 -> ACT.15.22<br>Acts 15:27-32 -> ACT.15.27<br>Acts 15:27-32 -> ACT.15.32 |
| Judas Iscariot | judas_iscariot_2847 | 47:48 -> LUK.47.48 | Mat 26:14 -> MAT.26.14<br>Mark 3:19 -> MRK.3.19<br>14:10 -> MRK.14.10<br>Luk 6:16 -> LUK.6.16<br>22:3 -> LUK.22.3<br>John 6:71 -> JHN.6.71<br>13:29 -> JHN.13.29<br>18:2 -> JHN.18.2<br>Acts 1:16 -> ACT.1.16 |
| Judas Iscariot | judas_iscariot_2848 | 47:48 -> LUK.47.48 | Mat 26:14 -> MAT.26.14<br>Mark 3:19 -> MRK.3.19<br>14:10 -> MRK.14.10<br>Luk 6:16 -> LUK.6.16<br>22:3 -> LUK.22.3<br>John 6:71 -> JHN.6.71<br>13:29 -> JHN.13.29<br>18:2 -> JHN.18.2<br>Acts 1:16 -> ACT.1.16 |
| Judith / Aholibamah | judith_185 | Ge 36,2 -> GEN.36.2 |  |
| Kallai | kallai_2580 | Neh 12:7 -> NEH.12.7<br>Neh 12:10 -> NEH.12.10 |  |
| Kish / Cis | kish_613 | Acts 13:21 -> ACT.13.21 |  |
| Korah / Core | korah_371 | Jude 1:11 -> JUD.1.11 | Num 16:1 -> NUM.16.1<br>1Chr 6:22 -> 1CH.6.22<br>1Chr 9:19 -> 1CH.9.19 |
| Lahmi | lahmi_747 | 2Sam 21:19 -> 2SA.21.19 |  |
| Lebanah / Lebana | lebanah_2079 | Neh 7:48 -> NEH.7.48 |  |
| Lebbaeus / Thaddaeus / Judas | lebbaeus_2845 | Luk 6:14-16 -> LUK.6.14<br>Luk 6:14-16 -> LUK.6.15<br>Acts 1:13 -> ACT.1.13 | Mark 3:18 -> MRK.3.18<br>Luk 6:14-16 -> LUK.6.16<br>John 14:22 -> JHN.14.22 |
| Lebbaeus / Thaddaeus / Judas | lebbaeus_2846 | Luk 6:14-16 -> LUK.6.14<br>Luk 6:14-16 -> LUK.6.15<br>Acts 1:13 -> ACT.1.13 | Mark 3:18 -> MRK.3.18<br>Luk 6:14-16 -> LUK.6.16<br>John 14:22 -> JHN.14.22 |
| Libni / Jahath / Laadan | libni_362 | 1Chr 6:43 -> 1CH.6.43<br>1Chr 23:7 -> 1CH.23.7 |  |
| Luke / Lucas | luke_3053 | Philem 1:24 -> PHM.1.24 | 2Tim 4:11 -> 2TI.4.11 |
| Maachah / Michaiah | maachah_854 | 2Chr 15:16 -> 2CH.15.16 | 1Kings 15:2 -> 1KI.15.2<br>2Chr 13:2 -> 2CH.13.2 |
| Maaseiah | maaseiah_2206 | 1Chr 24:11 -> 1CH.24.11 |  |
| Maaseiah | maaseiah_2212 | 1Chr 24:8 -> 1CH.24.8 |  |
| Maaseiah | maaseiah_2218 | 1Chr 9:12 -> 1CH.9.12 |  |
| Maaseiah | maaseiah_2265 | Ezr 2:6 -> EZR.2.6 |  |
| Maasiai / Amashai | maasiai_1591 | Neh 11:13 -> NEH.11.13 |  |
| Maaziah / Maadiah / Moadiah | maaziah_2450 | Neh 12:5 -> NEH.12.5 | Neh 12:17 -> NEH.12.17 |
| Machnadebai | machnadebai_2304 | Ezr 10:34 -> EZR.10.34 |  |
| Mahalath / Bashemath | mahalath_189 | Gen 36:3 -> GEN.36.3 |  |
| Malchiah | malchiah_2272 | 1Chr 24:8 -> 1CH.24.8 |  |
| Malchijah / Malchiah | malchijah_1590 | Neh 11:12 -> NEH.11.12 |  |
| Malchijah | malchijah_2238 | Ezr 2:3 -> EZR.2.3 |  |
| Malluch | malluch_2257 | Ezr 2:10 -> EZR.2.10 |  |
| Malluch | malluch_2276 | 1Chr 24:8 -> 1CH.24.8 |  |
| Malluch / Melicu | malluch_2443 | Neh 12:2 -> NEH.12.2 | Neh 12:14 -> NEH.12.14 |
| Manasseh | manasseh_2269 | Ezr 2:6 -> EZR.2.6 |  |
| Manasseh | manasseh_2283 | Ezr 2:19 -> EZR.2.19 |  |
| Manasseh / Manasses | manasseh_968 | 2Kings 21:19 -> 2KI.21.19<br>Jer 15:4 -> JER.15.4 | Mat 1:10 -> MAT.1.10<br>2Chr 32:33 -> 2CH.32.33 |
| Manasseh / Manasses | manasseh_969 | 2Kings 21:19 -> 2KI.21.19<br>Jer 15:4 -> JER.15.4 | Mat 1:10 -> MAT.1.10<br>2Chr 32:33 -> 2CH.32.33 |
| Maoch / Maachah | maoch_653 | 1Kings 2,39 -> 1KI.2.39 |  |
| Mary | mary_2828 | John 19:25 -> JHN.19.25<br>Luk 1:36 -> LUK.1.36 | Mat 27:56 -> MAT.27.56<br>28:1 -> MAT.28.1<br>Mark 6:3 -> MRK.6.3<br>15:40 -> MRK.15.40<br>16:1 -> MRK.16.1<br>Luk 1:27 -> LUK.1.27<br>2:5 -> LUK.2.5<br>Luk 24:10 -> LUK.24.10<br>Acts 1:14 -> ACT.1.14 |
| Mary | mary_2829 | John 19:25 -> JHN.19.25<br>Luk 1:36 -> LUK.1.36 | Mat 27:56 -> MAT.27.56<br>28:1 -> MAT.28.1<br>Mark 6:3 -> MRK.6.3<br>15:40 -> MRK.15.40<br>16:1 -> MRK.16.1<br>Luk 1:27 -> LUK.1.27<br>2:5 -> LUK.2.5<br>Luk 24:10 -> LUK.24.10<br>Acts 1:14 -> ACT.1.14 |
| Matri | matri_619 | 1Sa 9:2 -> 1SA.9.2 |  |
| Mattaniah | mattaniah_2240 | Ezr 2:7 -> EZR.2.7 |  |
| Mattaniah | mattaniah_2248 | Ezr 2:8 -> EZR.2.8 |  |
| Mattaniah | mattaniah_2266 | Ezr 2:6 -> EZR.2.6 |  |
| Mattaniah | mattaniah_2295 | Ezr 10:34 -> EZR.10.34 |  |
| Mattathah | mattathah_2279 | Ezr 2:19 -> EZR.2.19 |  |
| Mattenai | mattenai_2278 | Ezr 2:19 -> EZR.2.19 |  |
| Mattenai | mattenai_2296 | Ezr 10:34 -> EZR.10.34 |  |
| Mattenai | mattenai_2578 | Neh 12:6 -> NEH.12.6<br>Neh 12:10 -> NEH.12.10 |  |
| Matthew / Levi | matthew_2839 | Luk 5:27 -> LUK.5.27 | Mat 10:3 -> MAT.10.3<br>Mark 2:14 -> MRK.2.14<br>Mark 3:18 -> MRK.3.18<br>6:15 -> LUK.6.15<br>Acts 1:13 -> ACT.1.13 |
| Matthew / Levi | matthew_2840 | Luk 5:27 -> LUK.5.27 | Mat 10:3 -> MAT.10.3<br>Mark 2:14 -> MRK.2.14<br>Mark 3:18 -> MRK.3.18<br>6:15 -> LUK.6.15<br>Acts 1:13 -> ACT.1.13 |
| Melchiah / Malchiah | melchiah_2693 | Jer 38:1 -> JER.38.1 |  |
| Melchishua / Malchishua | melchishua_626 | 1Chr 8:33 -> 1CH.8.33 |  |
| Mephibosheth / Meribbaal | mephibosheth_672 | 2Sam 19:24 -> 2SA.19.24 | 1Chr 8:34 -> 1CH.8.34 |
| Merab / Michal | merab_627 | 1Sam 18:19 -> 1SA.18.19 | 2Sam 21:8 -> 2SA.21.8 |
| Meraiah | meraiah_2564 | Neh 12:1 -> NEH.12.1<br>Neh 12:10 -> NEH.12.10 |  |
| Mered | mered_1199 | 1Chr 4:19 -> 1CH.4.19 | 1Chr 4:18 -> 1CH.4.18 |
| Meremoth / Meraioth | meremoth_2187 | Neh 12:15 -> NEH.12.15 | Neh 3:4 -> NEH.3.4<br>Neh 10:5 -> NEH.10.5<br>Neh 12:3 -> NEH.12.3 |
| Meremoth | meremoth_2293 | Ezr 10:34 -> EZR.10.34 |  |
| Meshech / Mesech | meshech_35 | Psalm 120:5 -> PSA.120.5 | Ezekiel 38:2-3 -> EZK.38.2<br>Ezekiel 38:2-3 -> EZK.38.3<br>39:1 -> EZK.39.1 |
| Meshelemiah / Shelemiah | meshelemiah_1621 | 1Chr 26:1 -> 1CH.26.1<br>1Chr 26:9 -> 1CH.26.9 | 1Chr 26:14 -> 1CH.26.14 |
| Meshullam / Ahasai | meshullam_1594 | Neh 11:13 -> NEH.11.13 | 1Chr 9:12 -> 1CH.9.12 |
| Meshullam | meshullam_2256 | Ezr 2:10 -> EZR.2.10 |  |
| Meshullam | meshullam_2566 | Neh 12:1 -> NEH.12.1<br>Neh 12:10 -> NEH.12.10 |  |
| Meshullam | meshullam_2573 | Neh 12:4 -> NEH.12.4<br>Neh 12:10 -> NEH.12.10 |  |
| Methuselah / Mathusala | methuselah_23 | Luk 3:37 -> LUK.3.37 |  |
| Miamin | miamin_2236 | Ezr 2:3 -> EZR.2.3 |  |
| Micah | micah_2696 | Jer 26:19 -> JER.26.19 | Mic 1:1 -> MIC.1.1 |
| Micha / Michaiah | micha_2548 | 1Chr 6:39 -> 1CH.6.39<br>1Chr 25:2 -> 1CH.25.2 | Neh 12:35 -> NEH.12.35 |
| Micha / Micah | micha_704 | 1Chr 8:34 -> 1CH.8.34 |  |
| Michael | michael_2156 | Ezr 2:4 -> EZR.2.4 |  |
| Michaiah / Micah | michaiah_983 | 2Chr 34:20 -> 2CH.34.20 |  |
| Mijamin / Miamin / Miniamin | mijamin_2449 | Neh 12:5 -> NEH.12.5 | Neh 12:17 -> NEH.12.17 |
| Mizpar / Mispereth | mizpar_2042 | Neh 7:7 -> NEH.7.7 |  |
| Muppim / Shupham / Shephuphan | muppim_343 | 1Chr 8:5 -> 1CH.8.5 | Nu 26:39 -> NUM.26.39 |
| Nahari / Naharai | nahari_788 | 1Chr 11:39 -> 1CH.11.39 |  |
| Nahor / Nachor | nahor_101 | Luk 3:34 -> LUK.3.34 |  |
| Nahshon / Naashon / Naasson | nahshon_379 | Ex 6:23 -> EXO.6.23<br>Luk 3:32 -> LUK.3.32 | Mat 1:4 -> MAT.1.4<br>1Chr 2:10 -> 1CH.2.10 |
| Nathan | nathan_2302 | Ezr 10:34 -> EZR.10.34 |  |
| Nebuchadnezzar / Nebuchadrezzar | nebuchadnezzar_998 | Dan 1:1 -> DAN.1.1 | Jer 21:2 -> JER.21.2<br>2Chr 36:7 -> 2CH.36.7<br>Ezr 5:12 -> EZR.5.12<br>Neh 7:6 -> NEH.7.6<br>Jer 25:1 -> JER.25.1 |
| Nehemiah | nehemiah_2321 | Ezr 4:7 -> EZR.4.7 | Neh 8:9 -> NEH.8.9<br>Neh 10:1 -> NEH.10.1<br>12:26 -> NEH.12.26<br>12:47 -> NEH.12.47 |
| Nephusim / Nephishesim | nephusim_2096 | Neh 7:52 -> NEH.7.52 |  |
| Nero | nero_3079 | Acts 25:8-12 -> ACT.25.8<br>Acts 25:8-12 -> ACT.25.9<br>Acts 25:8-12 -> ACT.25.10<br>Acts 25:8-12 -> ACT.25.11<br>Acts 25:8-12 -> ACT.25.12<br>Php 4:22 -> PHP.4.22 |  |
| Nethaneel | nethaneel_2220 | 1Chr 9:12 -> 1CH.9.12 |  |
| Nethaneel | nethaneel_2583 | Neh 12:7 -> NEH.12.7<br>Neh 12:10 -> NEH.12.10 |  |
| Noah / Noe | noah_25 | 2Pet 2:5 -> 2PE.2.5 | Luk 3:36 -> LUK.3.36<br>Is 54:9 -> ISA.54.9<br>Mat 24:37 -> MAT.24.37<br>Luk 17:26 -> LUK.17.26<br>1Pet 3:20 -> 1PE.3.20 |
| Nun / Non | nun_398 | 1Chr 7:27 -> 1CH.7.27 |  |
| Obadiah / Abda | obadiah_1608 | Neh 11:17 -> NEH.11.17 | Neh 12:25 -> NEH.12.25 |
| Obal / Ebal | obal_93 | 1Chr 1:22 -> 1CH.1.22 |  |
| Obededom / Shimei | obededom_687 | 1Chr 15:16-18 -> 1CH.15.16<br>1Chr 15:16-18 -> 1CH.15.17<br>1Chr 26:1-8 -> 1CH.26.1<br>1Chr 26:1-8 -> 1CH.26.2<br>1Chr 26:1-8 -> 1CH.26.3<br>1Chr 26:1-8 -> 1CH.26.5<br>1Chr 26:1-8 -> 1CH.26.6<br>1Chr 26:1-8 -> 1CH.26.7 | 1Chr 15:16-18 -> 1CH.15.18<br>1Chr 26:1-8 -> 1CH.26.4<br>1Chr 26:1-8 -> 1CH.26.8<br>1Chr 16:38 -> 1CH.16.38<br>1Chr 25:17 -> 1CH.25.17 |
| Orpah | orpah_588 | Ruth 4:10 -> RUT.4.10 |  |
| Othniel | othniel_537 | Judges 3:9-10 -> JDG.3.10 | Judges 3:9-10 -> JDG.3.9 |
| Pashur | pashur_2692 | Jer 38:1-5 -> JER.38.2<br>Jer 38:1-5 -> JER.38.3<br>Jer 38:1-5 -> JER.38.4<br>Jer 38:1-5 -> JER.38.5 | Jer 38:1-5 -> JER.38.1 |
| Pedaiah | pedaiah_1113 | Mat 1:12 -> MAT.1.12 | 1Chr 3:19 -> 1CH.3.19 |
| Pedaiah | pedaiah_1114 | Mat 1:12 -> MAT.1.12 | 1Chr 3:19 -> 1CH.3.19 |
| Pelaliah | pelaliah_2534 | 1Chr 9:12 -> 1CH.9.12 |  |
| Peruda / Perida | peruda_2110 | Neh 7:57 -> NEH.7.57 |  |
| Phalti / Phaltiel | phalti_646 | 1Sam 25,44 -> 1SA.25.44 | 2Sam 3,15 -> 2SA.3.15 |
| Pharaoh | pharaoh_110 | Gen 12:15-20 -> GEN.12.16<br>Gen 12:15-20 -> GEN.12.19 | Gen 12:15-20 -> GEN.12.15<br>Gen 12:15-20 -> GEN.12.17<br>Gen 12:15-20 -> GEN.12.18<br>Gen 12:15-20 -> GEN.12.20 |
| Pharaoh / Pharaohhophra | pharaoh_2743 | 29:2-3 -> JER.29.2<br>29:2-3 -> JER.29.3<br>30:21 -> JER.30.21<br>31:2-18 -> JER.31.2<br>31:2-18 -> JER.31.3<br>31:2-18 -> JER.31.4<br>31:2-18 -> JER.31.5<br>31:2-18 -> JER.31.6<br>31:2-18 -> JER.31.7<br>31:2-18 -> JER.31.8<br>31:2-18 -> JER.31.9<br>31:2-18 -> JER.31.10<br>31:2-18 -> JER.31.11<br>31:2-18 -> JER.31.12<br>31:2-18 -> JER.31.13<br>31:2-18 -> JER.31.14<br>31:2-18 -> JER.31.15<br>31:2-18 -> JER.31.16<br>31:2-18 -> JER.31.17<br>31:2-18 -> JER.31.18<br>32:2-32 -> JER.32.2 | Jer 37:7 -> JER.37.7<br>Jer 44:30 -> JER.44.30 |
| Pharaoh | pharaoh_352 | Ex 1:8 -> EXO.1.8<br>Ex 2:23 -> EXO.2.23 |  |
| Pharaohnechoh / Necho / Pharaohnecho | pharaohnechoh_991 | 2Kings 23:29-35 -> 2KI.23.30<br>2Kings 23:29-35 -> 2KI.23.31<br>2Kings 23:29-35 -> 2KI.23.32<br>2Chr 35:20 -> 2CH.35.20<br>36:4 -> 2CH.36.4<br>Jer 46:17 -> JER.46.17<br>Jer 46:2 -> JER.46.2 | 2Kings 23:29-35 -> 2KI.23.29<br>2Kings 23:29-35 -> 2KI.23.33<br>2Kings 23:29-35 -> 2KI.23.34<br>2Kings 23:29-35 -> 2KI.23.35 |
| Pharez / Phares / Perez | pharez_293 | Neh 11:6 -> NEH.11.6<br>Luk 3:33 -> LUK.3.33 | Mat 1:3 -> MAT.1.3<br>1Chr 27:3 -> 1CH.27.3 |
| Philip | philip_2840 | 13:8 -> JHN.13.8 | Mark 3:18 -> MRK.3.18<br>Luk 6:14 -> LUK.6.14<br>John 1:43-45 -> JHN.1.43<br>John 1:43-45 -> JHN.1.44<br>John 1:43-45 -> JHN.1.45<br>John 6:5 -> JHN.6.5<br>12:21 -> JHN.12.21<br>Acts 1:13 -> ACT.1.13 |
| Philip | philip_2841 | 13:8 -> JHN.13.8 | Mark 3:18 -> MRK.3.18<br>Luk 6:14 -> LUK.6.14<br>John 1:43-45 -> JHN.1.43<br>John 1:43-45 -> JHN.1.44<br>John 1:43-45 -> JHN.1.45<br>John 6:5 -> JHN.6.5<br>12:21 -> JHN.12.21<br>Acts 1:13 -> ACT.1.13 |
| Phuvah / Pua / Puah | phuvah_316 | Nu 26:23 -> NUM.26.23 | 1Chr 7:1 -> 1CH.7.1 |
| Piltai | piltai_2575 | Neh 12:5 -> NEH.12.5<br>Neh 12:10 -> NEH.12.10 |  |
| Pontius Pilate | pontius_pilate_2860 | Luk 3:1 -> LUK.3.1 | 23:1 -> LUK.23.1<br>1Tim 6:13 -> 1TI.6.13 |
| Priscilla / Prisca | priscilla_2988 | 2Tim 4:19 -> 2TI.4.19 | Rom 16:3 -> ROM.16.3<br>1Cor 16:19 -> 1CO.16.19 |
| Pul / Tiglathpileser / Tilgathpilneser / Jareb | pul_931 | 2Kings 15:29 -> 2KI.15.29<br>Hos 5:13 -> HOS.5.13 | 1Chr 5:6 -> 1CH.5.6<br>2Chr 28:20 -> 2CH.28.20<br>1Chr 5:26 -> 1CH.5.26 |
| Rachel / Rahel | rachel_190 | Mat 2:18 -> MAT.2.18 | Gen 29:28 -> GEN.29.28<br>Jer 31:15 -> JER.31.15 |
| Ram | ram_2671 | Job 32:1 -> JOB.32.1 |  |
| Ram / Aram | ram_594 | Luk 3:33 -> LUK.3.33 | Mat 1:3 -> MAT.1.3 |
| Ramiah | ramiah_2233 | Ezr 2:3 -> EZR.2.3 |  |
| Ramoth | ramoth_2261 | Ezr 2:10 -> EZR.2.10 |  |
| Rapha / Rephaiah | rapha_1552 | 1Chr 8:37 -> 1CH.8.37 | 1Chr 9:43 -> 1CH.9.43 |
| Reelaiah / Raamiah | reelaiah_2039 | Neh 7:7 -> NEH.7.7 |  |
| Rehoboam / Roboam | rehoboam_847 | 2Chr 11:18 -> 2CH.11.18 | Mat 1:7 -> MAT.1.7 |
| Rehum / Nehum / Harim | rehum_2044 | Neh 7:7 -> NEH.7.7<br>Neh 12:15 -> NEH.12.15<br>Neh 10:5 -> NEH.10.5 | Neh 12:3 -> NEH.12.3 |
| Reu / Ragau | reu_99 | Luk 3:35 -> LUK.3.35 |  |
| Reuel / Jethro / Deuel / Raguel | reuel_357 | Ex 3,1 -> EXO.3.1<br>Nu 1,14 -> NUM.1.14<br>Nu 10,29 -> NUM.10.29 |  |
| Rosh / Rapha | rosh_342 | 1Chr 8:2 -> 1CH.8.2 |  |
| Sabtah / Sabta | sabtah_49 | 1Chr 1:9 -> 1CH.1.9 |  |
| Sabtechah / Sabtecha | sabtechah_51 | 1Chr 1:9 -> 1CH.1.9 |  |
| Salah / Sala / Shelah | salah_83 | Luk 3:35 -> LUK.3.35<br>Gen 10:24 -> GEN.10.24<br>Luk 3:35-36 -> LUK.3.36 | 1Chr 1:18 -> 1CH.1.18 |
| Sallu / Sallai | sallu_2553 | Neh 12:20 -> NEH.12.20 |  |
| Salma | salma_1104 | 1Chr 2:54-55 -> 1CH.2.55 | 1Chr 2:54-55 -> 1CH.2.54 |
| Salmon / Salma | salmon_595 | 1Chr 2:11 -> 1CH.2.11 | Luk 3:32 -> LUK.3.32 |
| Samson | samson_577 | Judges 15:14 -> JDG.15.14 |  |
| Sanballat | sanballat_2325 | Ezr 6:14 -> EZR.6.14 | Neh 4:1 -> NEH.4.1 |
| Sarai / Sarah / Sara | sarai_107 | Gen 20:12 -> GEN.20.12<br>1Pet 3:6 -> 1PE.3.6 | Gen 17:15 -> GEN.17.15<br>Is 51:2 -> ISA.51.2 |
| Saul / Paul / Mercurius | saul_2959 | Rom 11:1 -> ROM.11.1 | Acts 8:1 -> ACT.8.1<br>Acts 9:11 -> ACT.9.11<br>Acts 13:9 -> ACT.13.9 |
| Sennacherib / Sargon | sennacherib_951 | Is 20:1 -> ISA.20.1 | 2Chr 32:1 -> 2CH.32.1<br>Is 36:1 -> ISA.36.1<br>37:17 -> ISA.37.17 |
| Senuah | senuah_2533 | Gen 35:18 -> GEN.35.18 |  |
| Serah / Sarah | serah_333 | Nu 26,46 -> NUM.26.46 |  |
| Seraiah / Sheva / Shisha / Shavsha | seraiah_698 | 2Sam 20:25 -> 2SA.20.25<br>1Chr 18:16 -> 1CH.18.16 | 1Kings 4:3 -> 1KI.4.3 |
| Serug / Saruch | serug_100 | Luk 3:35 -> LUK.3.35 |  |
| Seth / Sheth | seth_17 | Luk 3:38 -> LUK.3.38 | 1Chr 1:1 -> 1CH.1.1 |
| Shallum / Meshullam | shallum_1316 | Neh 11:11 -> NEH.11.11 | 1Chr 9:11 -> 1CH.9.11<br>Ezr 7:2 -> EZR.7.2 |
| Shallum | shallum_2310 | Ezr 10:34 -> EZR.10.34 |  |
| Shallum / Jehoahaz | shallum_991 | 2Chr 36:1 -> 2CH.36.1 | Jer 22:11 -> JER.22.11<br>2Kings 23:30 -> 2KI.23.30 |
| Shallum / Jehoahaz | shallum_992 | 2Chr 36:1 -> 2CH.36.1 | Jer 22:11 -> JER.22.11<br>2Kings 23:30 -> 2KI.23.30 |
| Shalmaneser / Shalman | shalmaneser_945 | Hos 10:14 -> HOS.10.14 |  |
| Shammah / Shage | shammah_776 | 1Chr 11:34 -> 1CH.11.34 |  |
| Shammua | shammua_2576 | Neh 12:5 -> NEH.12.5<br>Neh 12:10 -> NEH.12.10 |  |
| Shammuah / Shimea / Shammua | shammuah_674 | 1Chr 14:4 -> 1CH.14.4 | 1Chr 3:5 -> 1CH.3.5 |
| Sharai | sharai_2306 | Ezr 10:34 -> EZR.10.34 |  |
| Sharar / Sacar | sharar_778 | 1Chr 11:35 -> 1CH.11.35 |  |
| Shashai | shashai_2305 | Ezr 10:34 -> EZR.10.34 |  |
| Shaul / Joel | shaul_1329 | 1Chr 6:36 -> 1CH.6.36 |  |
| Sheal | sheal_2260 | Ezr 2:10 -> EZR.2.10 |  |
| Shebaniah / Shechaniah | shebaniah_2442 | Neh 12:14 -> NEH.12.14 | Neh 12:3 -> NEH.12.3 |
| Shebuel / Shubael | shebuel_1741 | 1Chr 26:24 -> 1CH.26.24 | 1Chr 24:20 -> 1CH.24.20 |
| Shelemiah | shelemiah_2301 | Ezr 10:34 -> EZR.10.34 |  |
| Shelemiah | shelemiah_2308 | Ezr 10:34 -> EZR.10.34 |  |
| Shelomith / Shelomoth | shelomith_1743 | 1Chr 14:22 -> 1CH.14.22 |  |
| Shem / Sem | shem_26 | Luk 3:36 -> LUK.3.36 |  |
| Shemaiah / Shammua | shemaiah_1609 | Neh 11:17 -> NEH.11.17 |  |
| Shemaiah | shemaiah_2168 | Ezr 2:13 -> EZR.2.13 |  |
| Shemaiah | shemaiah_2214 | 1Chr 24:8 -> 1CH.24.8 |  |
| Shemaiah | shemaiah_2273 | 1Chr 24:8 -> 1CH.24.8 |  |
| Shemariah | shemariah_2277 | 1Chr 24:8 -> 1CH.24.8 |  |
| Shemariah | shemariah_2309 | Ezr 10:34 -> EZR.10.34 |  |
| Shephatiah | shephatiah_2114 | Ezr 2:55 -> EZR.2.55 | Neh 7:59 -> NEH.7.59 |
| Shepho / Shephi | shepho_243 | 1Chr 1:40 -> 1CH.1.40 |  |
| Shillem / Shallum | shillem_350 | 1Chr 7:13 -> 1CH.7.13 |  |
| Shimei | shimei_2284 | Ezr 2:19 -> EZR.2.19 |  |
| Shimei | shimei_2300 | Ezr 10:34 -> EZR.10.34 |  |
| Shimeon | shimeon_2274 | 1Chr 24:8 -> 1CH.24.8 |  |
| Shimi / Shimei | shimi_363 | Zech 12:13 -> ZEC.12.13 | Num 3:18 -> NUM.3.18 |
| Shimma / Shammah / Shimeah / Shimei | shimma_636 | 1Sam 16,9 -> 1SA.16.9<br>2Sam 13,3 -> 2SA.13.3<br>2Sam 21,21 -> 2SA.21.21 |  |
| Shimron / Shimrom | shimron_318 | 1Chr 7:1 -> 1CH.7.1 |  |
| Shobal | shobal_1103 | 1Chr 2:52-53 -> 1CH.2.53 | 1Chr 2:52-53 -> 1CH.2.52 |
| Shomer / Shamer | shomer_1430 | 1Chr 7:34 -> 1CH.7.34 |  |
| Shomer / Shimrith | shomer_915 | 2Chr 24:26 -> 2CH.24.26 |  |
| Shuah / Shua | shuah_288 | 1Chr 2:3 -> 1CH.2.3 |  |
| Siaha / Sia | siaha_2077 | Neh 7:47 -> NEH.7.47 |  |
| Sibbechai / Sibbecai / Mebunnai | sibbechai_743 | 1Chr 11:29 -> 1CH.11.29<br>2Sam 23:27 -> 2SA.23.27<br>1Chr 27:11 -> 1CH.27.11 |  |
| Simon / Peter / Cephas / Simeon | simon_2832 | Acts 15:14 -> ACT.15.14<br>Gal 2:9 -> GAL.2.9 | Mat 16:17 -> MAT.16.17<br>Mat 26:33 -> MAT.26.33<br>Mark 1:16 -> MRK.1.16<br>3:16 -> MRK.3.16<br>5:37 -> MRK.5.37<br>8:29 -> MRK.8.29<br>9:2 -> MRK.9.2<br>13:3 -> MRK.13.3<br>14:33 -> MRK.14.33<br>Luk 4:38 -> LUK.4.38<br>5:3 -> LUK.5.3<br>6:14 -> LUK.6.14<br>8:51 -> LUK.8.51<br>22:31 -> LUK.22.31<br>24:34 -> LUK.24.34<br>John 1:40-42 -> JHN.1.40<br>John 1:40-42 -> JHN.1.41<br>John 1:40-42 -> JHN.1.42<br>Acts 1:13 -> ACT.1.13<br>8:14 -> ACT.8.14<br>10:5 -> ACT.10.5<br>1Cor 1:12 -> 1CO.1.12<br>3:22 -> 1CO.3.22<br>9:5 -> 1CO.9.5<br>15:5 -> 1CO.15.5<br>1Pet 1:1 -> 1PE.1.1 |
| Simon / Peter / Cephas / Simeon | simon_2833 | Acts 15:14 -> ACT.15.14<br>Gal 2:9 -> GAL.2.9 | Mat 16:17 -> MAT.16.17<br>Mat 26:33 -> MAT.26.33<br>Mark 1:16 -> MRK.1.16<br>3:16 -> MRK.3.16<br>5:37 -> MRK.5.37<br>8:29 -> MRK.8.29<br>9:2 -> MRK.9.2<br>13:3 -> MRK.13.3<br>14:33 -> MRK.14.33<br>Luk 4:38 -> LUK.4.38<br>5:3 -> LUK.5.3<br>6:14 -> LUK.6.14<br>8:51 -> LUK.8.51<br>22:31 -> LUK.22.31<br>24:34 -> LUK.24.34<br>John 1:40-42 -> JHN.1.40<br>John 1:40-42 -> JHN.1.41<br>John 1:40-42 -> JHN.1.42<br>Acts 1:13 -> ACT.1.13<br>8:14 -> ACT.8.14<br>10:5 -> ACT.10.5<br>1Cor 1:12 -> 1CO.1.12<br>3:22 -> 1CO.3.22<br>9:5 -> 1CO.9.5<br>15:5 -> 1CO.15.5<br>1Pet 1:1 -> 1PE.1.1 |
| Solomon / Jedidiah | solomon_677 | 2Sam 12:25 -> 2SA.12.25 | 1Chr 3:5 -> 1CH.3.5<br>1Kings 3:1 -> 1KI.3.1<br>Prov 1:1 -> PRO.1.1<br>10:1 -> PRO.10.1<br>25:1 -> PRO.25.1<br>Song 1:1 -> SNG.1.1<br>Jer 52:20 -> JER.52.20 |
| Stephen | stephen_2952 | Acts 7:1-60 -> ACT.7.1 | 22:20 -> ACT.22.20 |
| Syntyche | syntyche_3056 | Phil 4:3 -> PHP.4.3 |  |
| Tamar / Thamar | tamar_292 | Ge 38:18 -> GEN.38.18 | Ge 38:6 -> GEN.38.6<br>Mat 1:3 -> MAT.1.3 |
| Tamar | tamar_716 | 1Kings 15:2 -> 1KI.15.2 |  |
| Tarea / Tahrea | tarea_1544 | 1Chr 9:41 -> 1CH.9.41 |  |
| Tertullus | tertullus_3012 | Acts 23:2 -> ACT.23.2 |  |
| Thamah / Tamah | thamah_2105 | Neh 7:55 -> NEH.7.55 |  |
| the giant in Gath | the_giant_in_gath_742 | 2Sam 21:15-22 -> 2SA.21.15<br>2Sam 21:15-22 -> 2SA.21.17<br>2Sam 21:15-22 -> 2SA.21.19<br>2Sam 21:15-22 -> 2SA.21.21<br>2Sam 21:15-22 -> 2SA.21.22 | 2Sam 21:15-22 -> 2SA.21.16<br>2Sam 21:15-22 -> 2SA.21.18<br>2Sam 21:15-22 -> 2SA.21.20 |
| Timotheus / Timothy | timotheus_2982 | 2Tim 1:5 -> 2TI.1.5 | Acts 19:22 -> ACT.19.22<br>Acts 20:4 -> ACT.20.4<br>Rom 16:21 -> ROM.16.21<br>1Cor 4:17 -> 1CO.4.17<br>1Cor 16:10 -> 1CO.16.10<br>2Cor 1:1 -> 2CO.1.1<br>2Cor 1:19 -> 2CO.1.19<br>Phil 1:1 -> PHP.1.1<br>Col 1:1 -> COL.1.1<br>1Tim 1:2 -> 1TI.1.2<br>Philem 1:1 -> PHM.1.1 |
| Tobiah | tobiah_2326 | Ezr 6:14 -> EZR.6.14 | Neh 4:3 -> NEH.4.3<br>Neh 13:4 -> NEH.13.4 |
| Tohu / Nahath / Toah | tohu_599 | 1Chr 6:26 -> 1CH.6.26<br>1Chr 6:34 -> 1CH.6.34 |  |
| Urijah / Uriah | urijah_943 | Is 8:2 -> ISA.8.2 |  |
| Uthai | uthai_2169 | Ezr 2:14 -> EZR.2.14 |  |
| Uzzah / Uzza | uzzah_685 | 1Chr 13:7 -> 1CH.13.7<br>1Chr 13:10 -> 1CH.13.10 |  |
| Uzzi | uzzi_2579 | Neh 12:6 -> NEH.12.6<br>Neh 12:10 -> NEH.12.10 |  |
| Uzziah / Azariah | uzziah_1328 | 1Chr 6:36 -> 1CH.6.36 |  |
| Uzziah | uzziah_2216 | 1Chr 24:8 -> 1CH.24.8 |  |
| Uzziel / Azareel | uzziel_1801 | 1Chr 25:18 -> 1CH.25.18 |  |
| Vaniah | vaniah_2292 | Ezr 10:34 -> EZR.10.34 |  |
| Wife of Jesse | wife_of_jesse_728 | 1Chr 2:16 -> 1CH.2.16 |  |
| Wife of Salathiel and Pedaiah | wife_of_salathiel_and_pedaiah_1123 | 1Chr 3:17 -> 1CH.3.17<br>Ezr 3:2 -> EZR.3.2<br>Neh 12:1 -> NEH.12.1<br>Hag 1:1 -> HAG.1.1<br>Mat 1:12 -> MAT.1.12<br>1Chr 3:19 -> 1CH.3.19 |  |
| Wife of Salathiel and Pedaiah | wife_of_salathiel_and_pedaiah_1124 | 1Chr 3:17 -> 1CH.3.17<br>Ezr 3:2 -> EZR.3.2<br>Neh 12:1 -> NEH.12.1<br>Hag 1:1 -> HAG.1.1<br>Mat 1:12 -> MAT.1.12<br>1Chr 3:19 -> 1CH.3.19 |  |
| Zabad | zabad_2250 | Ezr 2:8 -> EZR.2.8 |  |
| Zabad | zabad_2280 | Ezr 2:19 -> EZR.2.19 |  |
| Zabbai | zabbai_2254 | Ezr 2:11 -> EZR.2.11 |  |
| Zabbud | zabbud_2170 | Ezr 2:14 -> EZR.2.14 |  |
| Zacharias | zacharias_2873 | 1Chr 24:10 -> 1CH.24.10 | Luk 3:2 -> LUK.3.2 |
| Zalmon / Ilai | zalmon_762 | 1Chr 11:29 -> 1CH.11.29 |  |
| Zarah / Zerah / Zara | zarah_294 | Mat 1,3 -> MAT.1.3<br>Nu 26,13 -> NUM.26.13 | Nu 26,20 -> NUM.26.20 |
| Zebadiah | zebadiah_2155 | Ezr 2:4 -> EZR.2.4 |  |
| Zebadiah | zebadiah_2211 | 1Chr 24:14 -> 1CH.24.14 |  |
| Zebulun / Zabulon | zebulun_203 | Rev 7:8 -> REV.7.8 | Is 9:1 -> ISA.9.1 |
| Zechariah / Zacharias | zechariah_1955 | Luk 11:51 -> LUK.11.51 | Mat 23:35 -> MAT.23.35 |
| Zechariah | zechariah_2162 | Ezr 2:11 -> EZR.2.11 |  |
| Zechariah | zechariah_2241 | Ezr 2:7 -> EZR.2.7 |  |
| Zechariah | zechariah_2536 | 1Chr 9:12 -> 1CH.9.12 |  |
| Zechariah | zechariah_2572 | Neh 12:4 -> NEH.12.4<br>Neh 12:10 -> NEH.12.10 |  |
| Zepho / Zephi | zepho_219 | 1Chr 1:36 -> 1CH.1.36 |  |
| Zerahiah / Ahitub | zerahiah_1308 | Neh 11:11 -> NEH.11.11 | 1Chr 9:11 -> 1CH.9.11<br>Ezr 7:4 -> EZR.7.4 |
| Zeri / Izri | zeri_1796 | 1Chr 25:11 -> 1CH.25.11 |  |
| Zerubbabel / Zorobabel / Sheshbazzar | zerubbabel_1118 | Ezr 1:8 -> EZR.1.8<br>5:14 -> EZR.5.14<br>Zech 4:6 -> ZEC.4.6 | Mat 1:12 -> MAT.1.12<br>1Chr 3:19 -> 1CH.3.19<br>Ezr 3:2 -> EZR.3.2<br>Neh 12:1 -> NEH.12.1<br>Hag 1:1 -> HAG.1.1<br>Ezr 2:2 -> EZR.2.2<br>Neh 7:7 -> NEH.7.7<br>Neh 12:47 -> NEH.12.47 |
| Zerubbabel / Zorobabel / Sheshbazzar | zerubbabel_1119 | Ezr 1:8 -> EZR.1.8<br>5:14 -> EZR.5.14<br>Zech 4:6 -> ZEC.4.6 | Mat 1:12 -> MAT.1.12<br>1Chr 3:19 -> 1CH.3.19<br>Ezr 3:2 -> EZR.3.2<br>Neh 12:1 -> NEH.12.1<br>Hag 1:1 -> HAG.1.1<br>Ezr 2:2 -> EZR.2.2<br>Neh 7:7 -> NEH.7.7<br>Neh 12:47 -> NEH.12.47 |
| Zichri / Zabdi | zichri_1606 | Neh 11:17 -> NEH.11.17 |  |
| Zichri | zichri_2531 | Gen 35:18 -> GEN.35.18 |  |
| Zichri | zichri_2574 | Neh 12:4 -> NEH.12.4<br>Neh 12:10 -> NEH.12.10 |  |
| Ziphion / Zephon | ziphion_322 | Nu 26,15 -> NUM.26.15 |  |
| Zohar / Zerah | zohar_307 | Nu 26,20 -> NUM.26.20 | Nu 26,13 -> NUM.26.13 |
| Zuph / Zophai | zuph_600 | 1Chr 6:26 -> 1CH.6.26 |  |