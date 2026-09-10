# 変更履歴

本リポジトリで公開している 3 つの仕様の版と主要変更点の索引です。
各版の詳細（非互換変更・追加・訂正の一覧）は、各仕様書の変更履歴章を参照してください。

- EMS OpenAPI v2 — [§12 変更履歴](docs/ems-openapi-v2.md#12-変更履歴)
- VPP API v1 — [§12 変更履歴](docs/vpp-api-v1.md#12-変更履歴)
- EMS OpenAPI v1（旧版）— [変更履歴](docs/ems-openapi-v1.md#変更履歴)

EMS OpenAPI v2 と VPP API v1 は**組み合わせて運用**します。両者にまたがる変更は同時改版し（v2.1 ↔ v1.2、v2.2 ↔ v1.3）、
**片方のみで完結する変更はその API 単独で改版**します（v1.4 がこれに該当）。同じ行に両方の版が記載されている場合は同時改版、片方が「—」の場合はもう一方の版はその時点の最新版のまま据え置きです。

**現行の推奨組み合わせ: EMS OpenAPI v2.2 ↔ VPP API v1.4**

---

## 公開版

| 日付 | EMS OpenAPI v2 | VPP API v1 | EMS OpenAPI v1 | 概要 |
|---|:---:|:---:|:---:|---|
| 2026-09-10 | — | **1.4** | — | **後方互換の追加のみ**。`/measurements/energy` の `members[]` に `grid_to_load_kwh` / `consumption_kwh` を追加し、需要家メンバーの消費実績も VPP API 単独で取得可能に（物理 EMS API は v2.2 のまま）|
| 2026-07-25 | 2.2 | 1.3 | — | `/measurements/energy` を常に `data[]` 配列に統一（非互換）、`interval_seconds` によるコマ別・日次取得、`interval_seconds` の 5 値離散化。VPP は `ems_ids` フィルタ・`include_components`・複合上限を追加 |
| 2026-07-15 | — | — | **1.13** | FCR 不感帯（`up_deadband` / `low_deadband`）の最小値を 0.01 → 0.00 に変更 |
| 2026-06-17 | — | — | 1.12 | 旧版の維持更新 |
| 2026-06-11 | 2.1 | 1.2 | — | `jepx-da` ⇄ `jepx-ttv` の後勝ち上書き、スケジュール取得範囲を未来 90 日に拡大、実行中スケジュールへの上書き POST。VPP はレートリミット 2 バケット化・`dispatch_status` 拡張 |
| 2026-05-14 | — | 1.1 | — | VPP API 正式版の維持更新 |
| 2026-05-12 | 2.0 | — | — | 統一リソースモデル（`components[]`）の導入、`/specifications` 新設、`power_kw` → `delta_kw` への改称（非互換） |
| 2026-04-04 | — | — | 1.11 | 旧版の維持更新 |

> **v1 の位置づけ**: EMS OpenAPI v1（`/v1/ems/{id}/`）は既存インテグレーションとの互換性のために維持されている版です。新規開発では EMS OpenAPI v2 + VPP API v1 を使用してください。

---

## 仕様文書としての更新

仕様の意味を変えない訂正（誤記・記載漏れ・OpenAPI 定義と説明書の不整合の解消など）は、
版番号を上げずに反映し、[コミット履歴](https://github.com/enapir/enecloud-api-spec/commits/main) で追跡できるようにしています。
実装に影響する変更は必ず版番号を上げ、上表と各仕様書の変更履歴章に記載します。
