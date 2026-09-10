# ENECloud EMS / VPP API 仕様

株式会社ナピルが提供する **ENECloud EMS OpenAPI** および **VPP API** の公開仕様です。
蓄電池等の分散リソースを制御・計測し、需給調整市場・卸電力市場への応札運用を行うアグリゲーター開発者向けのリファレンスです。

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

📖 **[仕様サイト（検索・サイドバー付き）→ enapir.github.io/enecloud-api-spec](https://enapir.github.io/enecloud-api-spec/)**

---

## 📖 仕様一覧

| API | 版 | パスプレフィックス | 仕様書 | OpenAPI | リファレンス |
|---|---|---|---|---|---|
| **EMS OpenAPI v2** ⭐推奨 | 2.2 | `/v2/ems/{id}/` | [docs/ems-openapi-v2.md](docs/ems-openapi-v2.md)<br>[サンプル集](docs/ems-openapi-v2-samples.md) | [yaml](openapi/ems-openapi-v2.yaml) | [📘 閲覧](https://enapir.github.io/enecloud-api-spec/ems-v2.html) |
| **VPP API v1** ⭐推奨 | 1.4 | `/v1/vpp/{vpp_id}/` | [docs/vpp-api-v1.md](docs/vpp-api-v1.md)<br>[サンプル集](docs/vpp-api-v1-samples.md) | [yaml](openapi/vpp-openapi-v1.yaml) | [📘 閲覧](https://enapir.github.io/enecloud-api-spec/vpp-v1.html) |
| EMS OpenAPI v1（旧版・既存互換） | 1.13 | `/v1/ems/{id}/` | [docs/ems-openapi-v1.md](docs/ems-openapi-v1.md) | [yaml](openapi/ems-openapi-v1.yaml) | [📘 閲覧](https://enapir.github.io/enecloud-api-spec/ems-v1.html) |

> **新規開発は EMS OpenAPI v2 + VPP API v1 の組み合わせを使用してください。**
> EMS OpenAPI v1 は既存インテグレーションとの互換性のために維持されている版です。

---

## 🧭 どちらを使うか

```
　単一サイト（1 連系点）だけを制御する
　　└─ EMS OpenAPI v2 のみ

　複数サイトを束ねて 1 リソースとして応札・制御する（アグリゲーター）
　　└─ VPP API v1 を主に使用（v2.2 ↔ VPP v1.4 の組み合わせ）
　　   ・監視／精算のデータ取得は VPP API のみで完結します（v1.3 原則）
　　   ・物理 EMS API の直接呼び出しは /baseline 登録・/specifications 参照・保守診断に限定
```

---

## 🔌 エンドポイント一覧

### 認証（**別ホスト・プレフィックス無し**、EMS / VPP 共通）

| メソッド | URL | 概要 |
|---|---|---|
| POST | `{認証ホスト}/auth/refresh` | Access Token 取得 |

> ⚠️ `/auth/refresh` **のみ URL 体系が異なります**。パスプレフィックス（`/v2/ems/{ems_id}/` ・ `/v1/vpp/{vpp_id}/`）を使用せず、以下の API 本体（`{APIホスト}`）とは**別ホスト**で提供されます。

### EMS OpenAPI v2（`{APIホスト}/v2/ems/{ems_id}/`）

| メソッド | パス | 概要 |
|---|---|---|
| GET | `/status` | リアルタイム状態取得（概要） |
| GET | `/status/details` | リアルタイム状態取得（詳細） |
| GET | `/specifications` | 仕様情報取得 |
| POST | `/control/active_power` | 有効電力制御（即座／スケジュール） |
| GET / DELETE | `/control/active_power/schedules` | スケジュール一覧取得／削除 |
| POST / GET | `/baseline` | ベースライン値登録（30分粒度・一括）／取得 |
| POST | `/measurements/active_power` | 瞬時電力履歴取得 |
| POST | `/measurements/energy` | 電力量履歴取得 |
| GET | `/serviceplan` | 運転計画取得（30分 × 48件 = 24時間分） |

### VPP API v1（`{APIホスト}/v1/vpp/{vpp_id}/`）

| メソッド | パス | 概要 |
|---|---|---|
| GET / POST | `/members` | メンバー一覧取得／メンバー登録 |
| POST / DELETE | `/members/{ems_id}` | メンバーパラメータ更新／削除 |
| GET | `/status` | リアルタイム状態取得（概要） |
| GET | `/status/details` | リアルタイム状態取得（詳細、ブロック構造） |
| POST | `/control/active_power` | VPP 有効電力指令（即座／スケジュール） |
| GET / DELETE | `/control/active_power/schedules` | スケジュール一覧取得／削除（配下メンバーも連動削除） |
| POST | `/measurements/active_power` | 瞬時電力履歴取得（メンバー別 + VPP 集計） |
| POST | `/measurements/energy` | 電力量履歴取得（メンバー別 + VPP 集計） |

---

## 🔑 基本事項

| 項目 | 内容 |
|---|---|
| 認証 | Bearer トークン 2 種。**Access Token**（API 呼び出し用、有効期限 30 日）を **Refresh Token**（原則無期限、90 日間未使用で自動無効化）で取得 |
| 単位 | 電力 `kW` / 電力量 `kWh`（いずれも小数第 1 位まで） |
| 符号規則 | 受電（充電）は正 `+`、送電（放電）は負 `-` |
| 日時形式 | ISO 8601 UTC、末尾 `Z` 必須（例 `2025-06-13T10:30:00Z`） |
| ID 形式 | 16バイトUUID = 32文字hex（ハイフン無し） |
| レートリミット | EMS API: 1000 回/時（EMS ID 単位、参照系・制御系で共有）／ VPP API: 参照系 1000 回/時・制御系 200 回/時（VPP ID 単位、独立バケット）／ `/auth/refresh`: 1000 回/時（Refresh Token 単位、独立バケット） |

> **Base URL について**: 本番／テスト環境のホスト名は本公開仕様には含めていません。
> ご契約時に個別提供します。

---

## 📜 ライセンスと利用条件

本リポジトリの**仕様文書**（`docs/` および `openapi/`）は
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) で提供されます。
出典を表示すれば、引用・再配布・本仕様に準拠した実装が可能です。

⚠️ **仕様文書のライセンスと API 利用規約は別物です。**
本ライセンスは ENECloud EMS / VPP API の実エンドポイントへのアクセス権を付与しません。
本番・テスト環境の利用には株式会社ナピルとの別途のサービス契約が必要です。

詳細は [LICENSE](LICENSE) を参照してください。

---

## 💬 フィードバック

仕様の誤記・不整合のご指摘は [Issues](../../issues/new/choose) からお願いします（誤記報告テンプレートをご用意しています）。
報告・修正提案の進め方は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

⚠️ **実エンドポイントの障害・接続不具合、Base URL / 認証情報のお問い合わせは Issues では受け付けていません。**
ご契約時にご案内している窓口へご連絡ください（[SECURITY.md](SECURITY.md)）。

---

## 🗂 リポジトリ内の主なファイル

| ファイル | 内容 |
|---|---|
| [CHANGELOG.md](CHANGELOG.md) | 3 仕様の版と主要変更点の索引（詳細は各仕様書の変更履歴章）|
| [CONTRIBUTING.md](CONTRIBUTING.md) | 誤記報告・Pull Request の進め方、表記の約束 |
| [SECURITY.md](SECURITY.md) | セキュリティに関する報告先 |
| [LICENSE](LICENSE) | CC BY 4.0 とその適用範囲 |
| [mkdocs.yml](mkdocs.yml) / [requirements.txt](requirements.txt) | 仕様サイト（GitHub Pages）のビルド設定 |

---

© 2026 株式会社ナピル (Napir Co., Ltd.)
