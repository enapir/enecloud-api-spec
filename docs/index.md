# ENECloud EMS / VPP API 仕様

株式会社ナピルが提供する **ENECloud EMS OpenAPI** および **VPP API** の公開仕様です。
蓄電池等の分散リソースを制御・計測し、需給調整市場・卸電力市場への応札運用を行うアグリゲーター開発者向けのリファレンスです。

!!! info "新規開発は EMS OpenAPI v2 + VPP API v1 の組み合わせを使用してください"
    Base URL（本番／テスト環境のホスト名）は本公開仕様には含めていません。ご契約時に個別提供します。

---

## 仕様一覧

### EMS OpenAPI v2 ⭐推奨

**v2.2** · `{APIホスト}/v2/ems/{id}/`

1 サイト = 1 連系点単位の制御・計測・スケジュール管理 API。

[📘 API リファレンス](ems-v2.html){ .md-button .md-button--primary }
[説明書](ems-openapi-v2.md){ .md-button }
[サンプル集](ems-openapi-v2-samples.md){ .md-button }
[OpenAPI YAML をダウンロード](openapi/ems-openapi-v2.yaml){ .md-button download="ems-openapi-v2.yaml" }

### VPP API v1 ⭐推奨

**v1.4** · `{APIホスト}/v1/vpp/{vpp_id}/`

複数の物理 EMS（1 VPP あたり最大 100 メンバー）を 1 つの VPP（仮想発電所）として束ねる API。
監視・精算のデータ取得は VPP API のみで完結します。

[📘 API リファレンス](vpp-v1.html){ .md-button .md-button--primary }
[説明書](vpp-api-v1.md){ .md-button }
[サンプル集](vpp-api-v1-samples.md){ .md-button }
[OpenAPI YAML をダウンロード](openapi/vpp-openapi-v1.yaml){ .md-button download="vpp-openapi-v1.yaml" }

### EMS OpenAPI v1（旧版・既存互換）

**v1.13** · `{APIホスト}/v1/ems/{id}/`

既存インテグレーションとの互換性のために維持されている版です。新規開発では v2 を使用してください。

[📘 API リファレンス](ems-v1.html){ .md-button }
[説明書](ems-openapi-v1.md){ .md-button }
[OpenAPI YAML をダウンロード](openapi/ems-openapi-v1.yaml){ .md-button download="ems-openapi-v1.yaml" }

---

!!! tip "コード生成・ツール連携で OpenAPI 定義を直接取得する場合"
    次の URL を `curl` や各種ツールにそのまま指定できます。

    ```
    https://enapir.github.io/enecloud-api-spec/openapi/ems-openapi-v2.yaml
    https://enapir.github.io/enecloud-api-spec/openapi/vpp-openapi-v1.yaml
    https://enapir.github.io/enecloud-api-spec/openapi/ems-openapi-v1.yaml
    ```

    ブラウザで上記 URL を直接開くと、配信時に文字コード（charset）が付与されないため日本語が文字化けして表示されます。
    ファイル自体は UTF-8 で正しいため、ブラウザからは上の **OpenAPI YAML をダウンロード** ボタンで保存してください。

---

## どちらを使うか

| 用途 | 使用する API |
|---|---|
| 単一サイト（1 連系点）だけを制御する | **EMS OpenAPI v2 のみ** |
| 複数サイトを束ねて 1 リソースとして応札・制御する（アグリゲーター）| **VPP API v1** を主に使用（v2.2 ↔ VPP v1.4 の組み合わせ）|

複数サイトを束ねる場合、監視／精算のデータ取得は **VPP API のみで完結**します（v1.3 原則）。
物理 EMS API の直接呼び出しは `/baseline` 登録・`/specifications` 参照・保守診断に限定されます。

---

## 基本事項

| 項目 | 内容 |
|---|---|
| 認証 | Bearer トークン 2 種。**Access Token**（API 呼び出し用、有効期限 30 日）を **Refresh Token**（原則無期限、90 日間未使用で自動無効化）で取得 |
| 単位 | 電力 `kW` / 電力量 `kWh`（いずれも小数第 1 位まで）|
| 符号規則 | 受電（充電）は正 `+`、送電（放電）は負 `-` |
| 日時形式 | ISO 8601 UTC、末尾 `Z` 必須（例 `2025-06-13T10:30:00Z`）|
| ID 形式 | 16バイトUUID = 32文字hex（ハイフン無し）|
| レートリミット | EMS API: 1000 回/時（EMS ID 単位、参照系・制御系で共有）／ VPP API: 参照系 1000 回/時・制御系 200 回/時（VPP ID 単位、独立バケット）／ `/auth/refresh`: 1000 回/時（Refresh Token 単位、独立バケット）|

!!! warning "`/auth/refresh` のみ URL 体系が異なります"
    パスプレフィックス（`/v2/ems/{id}/` ・ `/v1/vpp/{vpp_id}/`）を**使用せず**、API 本体（`{APIホスト}`）とは**別ホスト**（`{認証ホスト}`）で提供されます。

---

## ライセンスと利用条件

本サイトで公開している**仕様文書**（説明書・サンプル集・OpenAPI 定義）は
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) で提供されます。
出典を表示すれば、引用・再配布・本仕様に準拠した実装が可能です。

!!! danger "仕様文書のライセンスと API 利用規約は別物です"
    本ライセンスは ENECloud EMS / VPP API の実エンドポイントへのアクセス権を付与しません。
    本番・テスト環境の利用には株式会社ナピルとの別途のサービス契約が必要です。

---

## お問い合わせ

仕様に関するご質問・誤記のご指摘は、下記までお問い合わせください。

**ENECloud EMS サポート**: [ems_support@enapir.com](mailto:ems_support@enapir.com)
