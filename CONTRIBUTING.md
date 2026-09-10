# コントリビューションについて

本リポジトリは株式会社ナピルが提供する **ENECloud EMS / VPP API の公開仕様** です。
仕様そのものの決定は当社（ソリューション事業部 EMS開発担当）が行いますが、
**誤記・不整合のご指摘は歓迎します**。

## 受け付ける内容

| 種別 | 受付方法 |
|---|---|
| 仕様書の誤記・記載漏れ | [Issue](https://github.com/enapir/enecloud-api-spec/issues/new/choose)（誤記報告テンプレート）|
| 仕様書と OpenAPI 定義の食い違い | 同上 |
| 仕様の解釈が曖昧で実装判断に迷う箇所 | 同上 |
| 明らかな誤記の修正 | Pull Request も歓迎します |

## 受け付けていない内容

- **実エンドポイントの障害・接続不具合**: ご契約時にご案内している窓口へご連絡ください
- **Base URL・認証情報のお問い合わせ**: サービス契約に基づき個別提供します（[LICENSE](LICENSE) の適用範囲を参照）
- **API の機能追加要望**: 当社の営業窓口・担当者経由でご相談ください（Issue で頂いた場合も社内へ連携します）

## Pull Request を送る場合

1. **仕様の意味を変える変更は受け付けられません。** 誤記の訂正、表記ゆれの統一、リンク切れの修正などに限ります
2. `docs/*.md` と `openapi/*.yaml` は対になっています。**片方だけを直さず、両方の整合を保ってください**
3. CI（`.github/workflows/validate.yml`）が以下を検証します。ローカルでも実行できます:

   ```bash
   # OpenAPI 定義の lint
   npx @redocly/cli lint openapi/*.yaml

   # docs/*.md の内部アンカーリンクの検証
   node .github/scripts/check-anchors.mjs

   # 付録のサンプル JSON の構文検証
   node .github/scripts/check-json-samples.mjs
   ```

4. 改行コードは LF に固定しています（[.gitattributes](.gitattributes)）
5. 仕様サイト（GitHub Pages）をローカルで確認する場合:

   ```bash
   pip install -r requirements.txt
   # Redoc ページと OpenAPI 定義を docs_dir に配置（CI と同じ手順）
   cp -r openapi docs/openapi && cp ems-v1.html ems-v2.html vpp-v1.html docs/
   mkdocs serve          # http://127.0.0.1:8000/
   ```

   `docs/openapi/` と `docs/*.html` はビルド時の一時配置で、[.gitignore](.gitignore) 済みです。

## 表記の約束

| 項目 | 規約 |
|---|---|
| 電力・電力量の数値 | 小数第 1 位まで（`1500.0` / `-45.2`）。サンプル JSON も 1 桁の小数表記で統一 |
| 日時 | ISO 8601 の UTC（末尾 `Z` 必須） |
| サンプルの基準日 | EMS OpenAPI v2: `2025-06-13` / VPP API v1: `2026-04-04`（各仕様書内で統一） |
| 節参照 | 同一文書内は `§9.8`、他文書は `ems-openapi-v2.md §9.8` のように文書名を添える |

## ライセンス

本リポジトリへの貢献は、リポジトリと同じ [CC BY 4.0](LICENSE) の下で公開されることに同意したものとみなします。
