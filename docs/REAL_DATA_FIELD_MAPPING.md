# Real Data Field Mapping (`CLASS_CHANDRAYAAN2`)

| Field | Value |
| --- | --- |
| **Document** | `docs/REAL_DATA_FIELD_MAPPING.md` |
| **Version** | `0.1.0` |
| **Status** | `Verified — Phase 1 Mendeley v1 Mapping` |
| **Owner** | `[Member 1 Name Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Member 2 Name Placeholder]`, `[Member 4 Name Placeholder]` |

---

## 1. Observation & Timing Field Mappings

| Source File | Source HDU / Section | Original Field | Original Unit | Canonical Field | Conversion | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `181120/ch2_cla_scd_..._20191118T125848000-20191118T130504000.fits` | Folder & `SPECTRUM.STARTIME` | `181120` / `STARTIME` | UTC string | `observation_date`, `acquisition_start_time` | `181120` -> `2019-11-18` | High | `STARTIME = '2019-11-18T12:58:48.000'` |
| `181120/ch2_cla_scd_...fits` | `SPECTRUM.ENDTIME` | `ENDTIME` | UTC string | `acquisition_end_time` | Direct string | High | `'2019-11-18T13:05:04.000'` |
| `181120/ch2_cla_scd_...fits` | `SPECTRUM.EXPOSURE` | `EXPOSURE` | seconds | `exposure` | `float(368)` | High | Header comment: `exposure (in seconds)` |
| `290520/ch2_cla_scd_..._20200529T104532257-20200529T104548257.fits` | Folder & `SPECTRUM.STARTIME` | `290520` / `STARTIME` | Sentinel `0` | `observation_date`, `acquisition_start_time` | `290520` -> `2020-05-29`; `0` -> `null` | High | Header contains `STARTIME = 0`; mapped to `null` |
| `290520/ch2_cla_scd_...fits` | `SPECTRUM.ENDTIME` | `ENDTIME` | UTC string | `acquisition_end_time` | Direct string | High | `'2020-05-29T10:45:48.257'` |
| `290520/ch2_cla_scd_...fits` | `SPECTRUM.EXPOSURE` | `EXPOSURE` | seconds | `exposure` | `float(16)` | High | Header comment: `exposure (in seconds)` |
| All files | N/A | *Absent* | N/A | `latitude`, `longitude`, `footprint_geometry` | Stored as `null` | High | Not present in Mendeley v1 dataset |
| All files | N/A | *Absent* | N/A | `quality_flag` / `quality_score` | Not fabricated | High | No quality column exists in source |

---

## 2. Spectra & Background Relationships

| Source File | Source HDU / Table | Original Fields | Original Units | Canonical `spectrum_type` | Observation Link | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `181120/ch2_cla_scd_...20191118...fits` | `SPECTRUM` BINTABLE | `CHANNEL`, `COUNTS` | `channel`, `count` | `source` | `CLASS_20191118` | `1024` channels; `*_t1.txt` is duplicate ASCII export |
| `181120/background_allevents.fits` | `SPECTRUM` BINTABLE | `CHANNEL`, `COUNTS` | `channel`, `count` | `background` | `CLASS_20191118` | Linked via `181120/README_R2` (`BACKFILE='NONE'` in FITS header) |
| `290520/ch2_cla_scd_...20200529...fits` | `SPECTRUM` BINTABLE | `CHANNEL`, `COUNTS` | `channel`, `count` | `source` | `CLASS_20200529` | `1024` channels; `*_t1.txt` is duplicate ASCII export |
| `290520/ch2_cla_l1_20200529T100116257_20200529T100124257.fits` | `SPECTRUM` BINTABLE | `CHANNEL`, `COUNTS` | `channel`, `count` | `background` | `CLASS_20200529` | Linked via `290520/README_R1` (`EXPOSURE = 8.0 s`) |
| `SOLAR_DATA/CH2_XSM_20191118_90853504_90853624.pha` | `SPECTRUM` BINTABLE | `CHANNEL`, `COUNTS`, `STAT_ERR` | `channel`, `count` | `solar_xsm` | `CLASS_20191118` | `512` channels (`DATE-OBS = 2019-11-18`) |
| `SOLAR_DATA/chianti_isothermal_spectrum_T17p6E6_EM2p7E46.txt` | Two-column ASCII | `col_0` (`ENERGY`), `col_1` (`PHOTONS/S`) | `null` (unspecified), `photons/s` | `solar_model` | `CLASS_20191118` | `3000` rows; `README_SOLAR` omits energy unit name |
| `CALIBRATION_SPECTRA/SCD_0_11_added_t1.txt` | Two-column ASCII | `col_0`, `col_1` | `channel`, `count` | `calibration_preflight` | `null` (instrument calibration) | `2048` rows; Fe-55 + Ti source |
| `CALIBRATION_SPECTRA/ch2_cla_scd_all_time_added_0-38_t1.txt` | OGIP ASCII table | `CHANNEL`, `COUNTS` | `channel`, `count` | `calibration_postflight` | `null` (instrument calibration) | `2048` rows; Fe-55 + Ti source |

---

## 3. Modelled Elemental Line Flux Mappings

| Source File | Original Columns | Original Unit | Canonical Fields | Conversion / Normalization | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `181120/flux_18nov_spec2.txt` | `O`, `err`, `Na`, `err`, `Mg`, `err`, `Al`, `err`, `Si`, `err` | `photons/cm2/s` | `element`, `line_flux`, `uncertainty`, `unit` | Unpivoted `1` row into `5` element rows | High | Header explicitly states `units of photons/cm2/s` |
| `290520/flux_29may.txt` | `O`, `err`, `Mg`, `err`, `Al`, `err`, `Si`, `err`, `Ca-Ka`, `err-a`, `Ca-Kb`, `errb`, `Fe`, `err` | `photons/cm2/s` | `element`, `spectral_line`, `line_flux`, `uncertainty`, `unit`, `row_index` | `Ca-Ka`/`Ca-Kb` -> `element='Ca'`, `spectral_line='Ca-Ka'|'Ca-Kb'` | High | `3` rows unpivoted into `21` records (`row_index` `0..2`); unit inherited from CLASS XSPEC flux convention (`181120/flux_18nov_spec2.txt`) |

---

## 4. Elemental Abundance Mappings

| Source File | Original Fields | Original Unit | Canonical Fields | Conversion / Handling | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `290520/R1_abundance.txt` | `# Mg Al Si Ca in weight %`, `pixel_29may`, `pixel_29may_perr`, `pixel_29may_nerr` | `wt%` | `element`, `abundance`, `uncertainty`, `uncertainty_upper`, `uncertainty_lower`, `unit` | `weight %` -> `wt%`; `uncertainty` set only when `upper == lower` | High | `4` records (`Mg=3`, `Al=13`, `Si=16`, `Ca=9`); asymmetric errors preserved (`Ca`: `+3/-1`) |
| `181120/R2_abundance.txt` | `#Na Mg Al Si Ca in weight %`, `pixel_2` (`4` values), `pluserr` (`4`), `minuserr` (`4`) | `wt%` | *Withheld* (`parse_status = warning`) | None — not mapped to guessed elements | N/A | 5 header names vs 4 numeric values; withheld to prevent misattribution |
