# Real Data Inventory (`CLASS_CHANDRAYAAN2`)

| Field | Value |
| --- | --- |
| **Document** | `docs/REAL_DATA_INVENTORY.md` |
| **Version** | `0.1.0` |
| **Status** | `Verified — Generated from Actual Downloaded Mendeley v1 Files` |
| **Owner** | `[Member 1 Name Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Member 2 Name Placeholder]`, `[Member 4 Name Placeholder]` |

---

## 1. Source Dataset Metadata

| Attribute | Value |
| --- | --- |
| **Name** | `CLASS_CHANDRAYAAN2` |
| **DOI** | `10.17632/6mmd96j5bg.1` |
| **Version** | `1` (published 30 October 2020) |
| **Contributor / Institution** | Shyama Narendranath, Indian Space Research Organisation (ISRO) |
| **License** | `CC BY 4.0` |
| **Source URL** | <https://data.mendeley.com/datasets/6mmd96j5bg/1> |
| **Local Raw Directory (Git-Ignored)** | `data/raw/class_mendeley_v1/` |
| **Total Files Inspected** | `23` (`1` ZIP archive + `22` extracted files) |
| **Generated Machine Inventory** | `data/interim/class_mendeley_v1/file_inventory.csv`, `data/interim/class_mendeley_v1/file_inventory.json` |

---

## 2. Format Summary

| Detected Format | Count | Notes |
| --- | --- | --- |
| `FITS` (`.fits`) | `4` | OGIP `SPECTRUM` binary tables (`PRIMARY`, `SPECTRUM` HDUs; `1024` channels each) |
| `PHA_FITS` (`.pha`) | `1` | Chandrayaan-2 XSM OGIP `SPECTRUM` binary table (`512` channels with `STAT_ERR`, `SYS_ERR`) |
| `TXT_OGIP_SPECTRUM_TABLE` | `6` | ASCII exports of FITS/PHA/calibration spectra (`*_t1.txt`) |
| `TXT_LINE_FLUX_TABLE` | `2` | XSPEC modelled XRF line flux tables (`flux_18nov_spec2.txt`, `flux_29may.txt`) |
| `TXT_ABUNDANCE_SCRIPT` | `2` | X2ABUNDANCE weight-percent output snippets (`R1_abundance.txt`, `R2_abundance.txt`) |
| `TXT_NUMERIC_TWO_COL` | `2` | Pre-flight calibration spectrum (`2048` rows) & Chianti solar model (`3000` rows) |
| `TEXT_README` | `5` | Dataset & folder README files (`README`, `README_R1`, `README_R2`, `README_CALIB`, `README_SOLAR`) |
| `ZIP_ARCHIVE` | `1` | Original downloaded archive (`CLASS_DATA_PAPER.ZIP`, 27 zip entries) |

---

## 3. Complete File Inventory (`23` Files)

| # | Relative Path | Format | Size (B) | Rows | Units / Elements Observed | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `CLASS_DATA_PAPER.ZIP` | `ZIP_ARCHIVE` | `89229` | `27` | Archive | `6927f6475bcd3a02c9773670cff1dbbd4babe37fd60b3cd96cc695ba5d7e5afc` |
| 2 | `data_repository/README` | `TEXT_README` | `83` | `2` | Index mapping | `b7bdca0dd5b997165f497b7a7cda90a3a0fa8f0ffca555d48839b6873f5efa65` |
| 3 | `data_repository/181120/background_allevents.fits` | `FITS` | `20160` | `1024` | `count` | `a980f2ee37943940567208381aaebf70e61440e5b48ef051ada6a756c7804a10` |
| 4 | `data_repository/181120/background_allevents_t1.txt` | `TXT_OGIP_SPECTRUM_TABLE` | `33891` | `1024` | `count` | `e981824a984c839fd4c7e91fd23090a1e4c6cbb50fda8e83893651d50faee2d9` |
| 5 | `data_repository/181120/ch2_cla_scd_all_time_added_20191118T125848000-20191118T130504000.fits` | `FITS` | `20160` | `1024` | `count` | `f65183eb504d5b29ea02477cbd594cf8606578a07d7bcba7bff7bf2bb8dc85ea` |
| 6 | `data_repository/181120/ch2_cla_scd_all_time_added_20191118T125848000-20191118T130504000_t1.txt` | `TXT_OGIP_SPECTRUM_TABLE` | `33891` | `1024` | `count` | `9a49eee3f745848912fa066774e4b5568e1b3f0695aab9220cf20315ff73f4f1` |
| 7 | `data_repository/181120/flux_18nov_spec2.txt` | `TXT_LINE_FLUX_TABLE` | `161` | `1` | `photons/cm2/s` (`O, Na, Mg, Al, Si`) | `88b9fcf8c4508fb9434dd7dde119011f333f811e38bcbb15147df06a5bc7f299` |
| 8 | `data_repository/181120/R2_abundance.txt` | `TXT_ABUNDANCE_SCRIPT` | `171` | `3` | `wt%` (5 header names vs 4 values — warning) | `3c0225338f084f899e53ea82d16b94a132b8f4fad5116da90cc7a464a7b91175` |
| 9 | `data_repository/181120/README_R2` | `TEXT_README` | `617` | `7` | `keV (0.0135 * CHANNEL)` | `7ac64422d3885048f1c12e4d99cf9390726949e53396683d947c68b296383657` |
| 10 | `data_repository/290520/ch2_cla_l1_20200529T100116257_20200529T100124257.fits` | `FITS` | `20160` | `1024` | `count` | `664e2074d43156975b61e7667de48bf02eb6cf2c4850cc2bc64e7710f98d31c3` |
| 11 | `data_repository/290520/ch2_cla_l1_20200529T100116257_20200529T100124257_t1.txt` | `TXT_OGIP_SPECTRUM_TABLE` | `33891` | `1024` | `count` | `0b29a1d0b741d2eafe3b9f284c32afc79e90fb38c36ce1638b8dd18784f7c79e` |
| 12 | `data_repository/290520/ch2_cla_scd_all_time_added_20200529T104532257-20200529T104548257.fits` | `FITS` | `20160` | `1024` | `count` | `a9df7e37f34961172bd5ba1943920bb0019d39aabc9459ebc261dbbaabd79989` |
| 13 | `data_repository/290520/ch2_cla_scd_all_time_added_20200529T104532257-20200529T104548257_t1.txt` | `TXT_OGIP_SPECTRUM_TABLE` | `33891` | `1024` | `count` | `8e4d067ce4cff423819cc90f2a30e673a3b584d64a384853660cdf52546cccce` |
| 14 | `data_repository/290520/flux_29may.txt` | `TXT_LINE_FLUX_TABLE` | `263` | `3` | `photons/cm2/s` (`O, Mg, Al, Si, Ca-Ka, Ca-Kb, Fe`) | `fbb9c7450b9b700a74b2274e995426e5f09035ef6db9dfc34c84ca71b28f83ee` |
| 15 | `data_repository/290520/R1_abundance.txt` | `TXT_ABUNDANCE_SCRIPT` | `148` | `3` | `wt%` (`Mg, Al, Si, Ca`) | `b9572912e9070dc936d0d746e88c97353a84ec86408fbe729de03095a30d2eda` |
| 16 | `data_repository/290520/README_R1` | `TEXT_README` | `662` | `7` | `keV (0.0135 * CHANNEL)` | `d81c53bdc97229fab4276367650104bb8bbbcbda838b39d768200da4bdf227a7` |
| 17 | `data_repository/CALIBRATION_SPECTRA/ch2_cla_scd_all_time_added_0-38_t1.txt` | `TXT_OGIP_SPECTRUM_TABLE` | `55377` | `2048` | `count` | `ca2adc8e16d258693c44f434abd25dd65949b91087c3d34270e230498f8f4486` |
| 18 | `data_repository/CALIBRATION_SPECTRA/README_CALIB` | `TEXT_README` | `286` | `3` | `keV (0.0135 * CHANNEL)` (`Fe-55`, `Ti`) | `44764fbc76353b9f46a7aeac93fdd23a72d45459589ee9bd4f9611fb84553339` |
| 19 | `data_repository/CALIBRATION_SPECTRA/SCD_0_11_added_t1.txt` | `TXT_NUMERIC_TWO_COL` | `55296` | `2048` | Two-column channel/counts | `38147b42baf4dcbf5bf136c1fb9b777e46f352afcb2426d3a693e8ab0cf05d6b` |
| 20 | `data_repository/SOLAR_DATA/CH2_XSM_20191118_90853504_90853624.pha` | `PHA_FITS` | `20160` | `512` | `COUNT` (`HDUCLAS3`), `STAT_ERR`, `SYS_ERR` | `b665091305ac6221953e624dafdc9185027f807f1124481a62362374eb92b897` |
| 21 | `data_repository/SOLAR_DATA/CH2_XSM_20191118_90853504_90853624_t1.txt` | `TXT_OGIP_SPECTRUM_TABLE` | `30385` | `512` | ASCII export of XSM `.pha` | `f9e7f58ae74c1cb56449e2509ab7d1d09f18a24abce50808ecf0387be7074538` |
| 22 | `data_repository/SOLAR_DATA/chianti_isothermal_spectrum_T17p6E6_EM2p7E46.txt` | `TXT_NUMERIC_TWO_COL` | `101998` | `3000` | `PHOTONS/S` (per `README_SOLAR`) | `59d26dfe3c4ba874751be693c1eefaffae4efc6a968c8c8e50f5b75d4906f311` |
| 23 | `data_repository/SOLAR_DATA/README_SOLAR` | `TEXT_README` | `330` | `3` | `photons/s` | `f7f7431a87f1950b4403c0e8cd3f20cc762d7a5631d1827fc5f7fda3df238ed2` |

---

## 4. Key Source Findings & Discrepancies

1. **No Geospatial Coordinates or Footprints:** None of the FITS/PHA headers or ASCII files contain latitude, longitude, or footprint corner coordinates (`EQUINOX = 2000.0` is an OGIP FITS boilerplate keyword; `LONGSTRN = 'OGIP 1.0'` is an OGIP long-string keyword, not longitude).
2. **XSM Solar Data Included:** `SOLAR_DATA/` contains genuine Chandrayaan-2 XSM observation `CH2_XSM_20191118_90853504_90853624.pha` (`512` channels, `EXPOSURE = 37.0 s`, `STAT_ERR`, `SYS_ERR`) plus a Chianti isothermal solar spectrum model for `2019-11-18`.
3. **README Region-Label Swap:** `data_repository/README` states `R1 in 181120, R2 in 290520`, whereas folder `181120/` contains `README_R2` and `R2_abundance.txt`, and folder `290520/` contains `README_R1` and `R1_abundance.txt`.
4. **Abundance Header vs. Array Mismatch (`181120/R2_abundance.txt`):** The comment header lists 5 elements (`#Na Mg Al Si Ca in weight %`), while `pixel_2`, `pixel_2_pluserr`, and `pixel_2_minuserr` each contain only 4 numeric entries (`[2.0,5.0,8.0,18.0]`).
5. **FITS `STARTIME=0` Sentinel (`290520/`):** Both `290520/*.fits` files store `STARTIME = 0` in their `SPECTRUM` HDU headers; LunaSpectra maps this sentinel to `null` rather than fabricating a start timestamp.
