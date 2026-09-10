# ENECloud EMS OpenAPI 説明書

**バージョン**: 1.13
**最終更新日**: 2026年7月15日  
**作成者**: 株式会社ナピル ソリューション事業部 EMS開発担当  
**ライセンス**: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — 出典表示のもと、引用・再配布・本仕様に準拠した実装が可能です。
**OpenAPI 定義**: [`openapi/ems-openapi-v1.yaml`](https://github.com/enapir/enecloud-api-spec/blob/main/openapi/ems-openapi-v1.yaml)

> ### ⚠️ 新規開発は v2 を使用してください
>
> 本書は **EMS OpenAPI v1**（パスプレフィックス `/v1/ems/{id}/`）の仕様です。
> v1 は既存インテグレーションとの互換性のために維持されている版であり、**新規のアグリゲーター向け開発では [EMS OpenAPI v2](ems-openapi-v2.md) と [VPP API v1](vpp-api-v1.md) の組み合わせを使用してください。**
>
> v1 → v2 の変更点は [EMS OpenAPI v2 説明書](ems-openapi-v2.md) の移行章を参照してください。

---

## 基本情報

### Base URL

> **Base URL について**: 本番／テスト環境のホスト名は公開仕様には含めません。ご契約時に個別提供します。
> 以下ではパスプレフィックス以降を記述します。

#### 通常のAPI（`/status`, `/control/power`など）

パスプレフィックス: `/v1/ems/{id}/`

**例**: `/status` を呼び出す場合 → `{APIホスト}/v1/ems/{id}/status`

- `{id}` にはEMS ID（16バイトUUID = 32文字hex、ハイフン無し）を指定

#### 認証API（`/auth/refresh`のみ例外）

パス: `/auth/refresh`

**注意**: `/auth/refresh` のみ `/v1/ems/{id}/` プレフィックスを**使用せず**、かつ `{APIホスト}` とは別の `{認証ホスト}` で提供されます（`{認証ホスト}/auth/refresh`）。`{APIホスト}/v1/ems/{id}/auth/refresh` ではありません。本書ではこの 2 つのホストを `{APIホスト}` / `{認証ホスト}` と表記します。いずれもご契約時に個別提供します。

### 認証方式

ENECloud EMS APIは**2種類のトークン**を使用します:

| トークン | 用途 | 使用するAPI | 有効期限 |
|---------|------|------------|---------|
| **Refresh Token** | Access Token取得用 | `/auth/refresh`のみ | 無期限（管理者により無効化可能） |
| **Access Token** | API呼び出し用 | `/auth/refresh`以外の全API | 30日 |

**認証ヘッダー形式**: `Authorization: Bearer {token}`

**重要**:
- 1つのトークンセット（Refresh Token + Access Token）は、**1つのEMS IDに紐付きます**
- 複数のEMS IDを操作する場合は、EMS IDごとにトークンを取得・管理する必要があります

### データ形式

| 項目 | 説明 |
|------|------|
| **単位** | 電力値: **kW**、エネルギー値: **kWh** |
| **符号規則** | 充電（受電）: **正の値 (+)**、放電（供給）: **負の値 (-)** |
| **日時形式** | ISO 8601形式（例: `2025-06-13T10:30:00Z`） |

### EMS ID仕様
- **形式**: 16バイトUUID = 32文字hex（ハイフン無し）
- **例**: `a1b2c3d4e5f6789012345678901234ab`
- **文字種**: 0-9, a-f（小文字）

### レートリミット仕様

| 制限回数 | 期間 | 適用範囲 |
|---------|------|----------|
| **1000回** | **1時間** | **全API共通** |

#### レートリミット超過時のレスポンス
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 429,
    "message": "Rate limit exceeded",
    "details": "API call limit exceeded",
    "limit": 1000,
    "remaining": 0,
    "reset_time": "2025-08-19T16:00:00Z",
    "retry_after": 1800
  },
  "timestamp": "2025-08-19T15:30:00Z"
}
```

#### レートリミット情報（レスポンスヘッダー）
全てのAPIレスポンスには以下のヘッダーが含まれます：
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1724068800
X-RateLimit-Reset-After: 1800
```

## サンプル仕様
- **定格電力**: 1999kW（充電/放電）
- **定格容量**: 8360kWh
- **運用SOC範囲**: 10-90%（実効容量6688kWh）

---

## API一覧表

| No. | カテゴリ | エンドポイント | メソッド | 概要 |
|-----|----------|---------------|----------|------|
| 1 | **認証** | `/auth/refresh` | POST | Access Token取得 |
| 2 | **リアルタイム状態** | `/status` | GET | システム全体の現在状態 |
| 3 | **仕様情報** | `/specifications` | GET | バッテリー定格仕様 |
| 4 | **電力制御** | `/control/power` | POST | 即座充放電指示・スケジュール設定 |
| 5 | **スケジュール管理** | `/control/schedules` | GET/DELETE | スケジュール取得・削除 |
| 6 | **電力値履歴** | `/report/power` | POST | 電力値（kW）と系統周波数の履歴データ取得 |
| 7 | **エネルギー履歴** | `/report/energy` | POST | 充放電エネルギー量（kWh）の累積値取得 |
| 8 | **FCRパラメータ管理** | `/fcr/config` | GET/POST | 一次調整力パラメータの設定・取得 |
| 9 | **運転計画** | `/serviceplan` | GET | 30分刻み in/out of service 運転計画の一覧取得 |


### 市場応札SKU一覧

| SKU | 正式名称 | 日本語名 | 
|-----|----------|----------|
| `fcr` | Frequency Containment Reserve | 一次調整力 | 
| `s-frr` | Slow Frequency Restoration Reserve | 二次調整力① | 
| `frr` | Frequency Restoration Reserve | 二次調整力② | 
| `rr` | Replacement Reserve | 三次調整力① |
| `rr-fit` | Replacement Reserve FIT | 三次調整力② | 
| `jepx-da` | JEPX Day Ahead | JEPXスポット |
| `jepx-ttv` | JEPX TTV | JEPX時間前 |
| `unknown` | なし| なし | 

---

## パラメータ数値範囲仕様

### 電力制御パラメータ
| パラメータ | 最小値 | 最大値 | 単位 | 備考 |
|-----------|-------|-------|------|------|
| `power_kw` | -999999 | 999999 | kW | Δ電力値（ベースラインからの差分、負値：放電方向、正値：充電方向） |
| `baseline_kw` | -999999 | 999999 | kW | ベースライン電力値（省略時は0として扱う） |
| `duration_minutes` | 1 | 1440 | 分 | 即座指示の継続時間 |
| `soc` | 0.0 | 100.0 | % | 運用可能範囲 |

### スケジュール登録パラメータ
| パラメータ | 最小値 | 最大値 | 単位 | 備考 |
|-----------|-------|-------|------|------|
| `start_time` | 現在時刻+1分 | 現在時刻+90日 | - | 1分単位で設定可能 |
| `end_time` | start_time+1分 | start_time+24時間 | - | 1分単位で設定可能|

### FCRパラメータ
| パラメータ | 最小値 | 最大値 | 単位 | 備考 |
|-----------|-------|-------|------|------|
| `freq_ref` | 49.5 | 60.5 | Hz | 50Hz/60Hz地域対応 |
| `up_deadband` | 0.00 | 0.20 | Hz | 上側不感帯 |
| `low_deadband` | 0.00 | 0.20 | Hz | 下側不感帯 |
| `up_droop` | 0.200 | 10.000 | % | 上側調定率 |
| `low_droop` | 0.200 | 10.000 | % | 下側調定率 |

### 履歴取得パラメータ
| パラメータ | 最小値 | 最大値 | 単位 | 備考 |
|-----------|-------|-------|------|------|
| 取得期間 | 1秒 | 31日 | - | start_timeとend_timeの差 |
| `interval_seconds` | 1 | 3600 | 秒 | データ取得間隔 |
| `start_time` | 365日以内 | 現在時刻 | 秒 |  |

---

## 1. 認証

**関連セクション**:
- 認証方式の概要 → [認証方式](#認証方式)
- エラーコード → [§9 エラーコード体系](#9-エラーコード体系)

### 認証フロー

ENECloud EMS APIの認証は**2ステップ**で行います:

```
┌─────────────────┐
│ 1. 事前準備     │  EMS担当窓口にRefresh Tokenの払出を依頼
└────────┬────────┘  （EMS IDごとに1つ）
         │
         ▼
┌─────────────────┐
│ 2. 初回利用時   │  POST /auth/refresh
└────────┬────────┘  Refresh Token → Access Token（30日有効）
         │
         ▼
┌─────────────────┐
│ 3. API利用      │  各API呼び出し時にAccess Tokenを使用
└────────┬────────┘  Authorization: Bearer {access_token}
         │
         ▼
┌─────────────────┐
│ 4. トークン更新 │  30日経過前に再度 /auth/refresh を呼び出し
└─────────────────┘  新しいAccess Tokenを取得
```

### 複数EMS IDを利用する場合

**重要**: 1つのトークンセットは1つのEMS IDに紐付きます。

複数のEMS IDを操作する場合:
1. **EMS ID-A用**: Refresh Token-A で Access Token-A を取得
2. **EMS ID-B用**: Refresh Token-B で Access Token-B を取得
3. 各APIを呼び出す際、対象のEMS IDに対応するAccess Tokenを使用

### Refresh Tokenの払出依頼

ENECloud EMS APIの利用開始には、EMS担当窓口への事前登録が必要です。
利用したい**EMS IDごと**にRefresh Tokenの払出を依頼してください。

### Access Tokenの取得

#### エンドポイント
```
POST {認証ホスト}/auth/refresh
```

#### リクエストヘッダー
```
Authorization: Bearer {refresh_token}
```

#### 概要
Refresh TokenからAccess Token（JWT、30日有効）を取得します。

**ポイント**:
- このAPIのみ`/v1/ems/{id}/`プレフィックスなし
- Authorizationヘッダーに**Refresh Token**を指定
- レスポンスの`access_token`を以降の全API呼び出しで使用

#### レスポンス

**成功時（200 OK）**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 2592000,
  "expires_at": "2025-08-20T10:30:00Z"
}
```

| 項目 | 型 | 説明 |
|------|------|------|
| `access_token` | string | **これを以降のAPI呼び出しで使用**（JWT形式） |
| `token_type` | string | `Bearer`（固定） |
| `expires_in` | integer | 有効期間（秒）= 2,592,000秒（30日） |
| `expires_at` | string | 有効期限（ISO 8601形式） |

#### エラーレスポンス

| コード | 説明 | 対処方法 |
|--------|------|----------|
| **401** | 認証失敗 | Refresh TokenまたはAccess Tokenが不正 |
| **403** | アクセス権限不足 | EMS IDへのアクセス権限を管理者に確認 |
| **498** | トークン期限切れ | `/auth/refresh`で新しいAccess Tokenを取得 |

**エラーレスポンス例（401）**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 401,
    "message": "Authentication failed",
    "details": "Invalid or expired JWT token",
    "error_type": "authentication_error"
  },
  "timestamp": "2025-08-19T10:30:00Z"
}
```

---

## 2. リアルタイム状態取得

### システム全体状態取得
```
GET /status
```
**概要**: バッテリー状態、現在電力値、容量情報を一括取得

**関連セクション**:
- バッテリー定格仕様 → [3. 仕様情報](#3-バッテリー仕様情報)
- FCR応動状態の詳細 → [8. FCRパラメータ管理](#8-fcrパラメータ管理)
- データ形式と符号規則 → [データ形式](#データ形式)

**レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "status": 0,                          // 0 : 正常運転,  1 : 警告運転,  9 : 運用不可
  "in_fcr_mode":0,                         // 1:一次調整応動中,　0:それ以外
  "charge_capacity_available": 2090,    // [kWh] 充電可能容量
  "discharge_capacity_available": 4598, // [kWh] 放電可能容量
  "charge_power_available": 1900,       // [kW] 充電可能電力
  "discharge_power_available": 1900,    // [kW] 放電可能電力
  "current_kw": 1185.3,                // [kW] 現在電力値
  "baseline_kw": 0.0,                  // [kW] ベースライン電力値
  "soc": 50,                           // [%] 現在SOC
  "output_control_limit": 100,           // [%] 出力制御上限
  "measure_timestamp": "2025-06-13T10:30:00Z", // 計測時刻（ISO 8601形式）
  "timestamp": "2025-06-13T10:30:05Z"
}
```

**レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `status` | integer | - | 0, 1, 9 | システム状態（0: 正常運転, 1: 警告運転, 9: 運用不可） |
| `in_fcr_mode` | integer | - | 0, 1 | FCR応動状態（0:それ以外 , 1: 一次調整応動中） |
| `charge_capacity_available` | number | kWh | 0〜定格容量 | 現在充電可能な容量 |
| `discharge_capacity_available` | number | kWh | 0〜定格容量 | 現在放電可能な容量 |
| `charge_power_available` | number | kW | 0〜定格電力 | 現在充電可能な電力 |
| `discharge_power_available` | number | kW | 0〜定格電力 | 現在放電可能な電力 |
| `current_kw` | number | kW | -定格電力〜+定格電力 | 現在の電力値（正: 充電, 負: 放電） |
| `baseline_kw` | number | kW | -定格電力〜+定格電力 | ベースライン電力値（存在しない場合は0として扱う） |
| `soc` | number | % | 0.0〜100.0 | 現在のSOC（State of Charge） |
| `output_control_limit` | number | % | 0〜100 | 出力制御上限 |
| `measure_timestamp` | string | - | - | 計測時刻（ISO 8601形式） |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

**状態別レスポンス例**:

#### 待機状態
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "status": 0,
  "in_fcr_mode":0,                         
  "charge_capacity_available": 3344,
  "discharge_capacity_available": 3344,
  "charge_power_available": 1900,
  "discharge_power_available": 1900,
  "current_kw": 0,
  "baseline_kw": 0.0,
  "soc": 50,                           // [%] 現在SOC
  "output_control_limit": 100,           // [%] 出力制御上限
  "measure_timestamp": "2025-06-13T10:30:00Z", // 計測時刻（ISO 8601形式）
  "timestamp": "2025-06-13T10:30:05Z"
}
```

---

## 3. バッテリー仕様情報

### 定格仕様取得
```
GET /specifications
```
**概要**: バッテリーの設計仕様値を取得

**レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "rated_cap": 8360,       // 定格容量 [kWh]
  "dis_pwr_max": 1999,     // 定格最大放電電力 [kW]
  "chg_pwr_max": 1999,     // 定格最大充電電力 [kW]
  "soc_op_max": 90,        // 運用可能SOC上限 [%]
  "soc_op_min": 10,        // 運用可能SOC下限 [%]
  "timestamp": "2025-06-13T10:30:00Z"  // API応答時刻
}
```

**レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `rated_cap` | number | kWh | 0以上 | 定格容量 |
| `dis_pwr_max` | number | kW | 0以上 | 定格最大放電電力 |
| `chg_pwr_max` | number | kW | 0以上 | 定格最大充電電力 |
| `soc_op_max` | number | % | 0.0〜100.0 | 運用可能SOC上限 |
| `soc_op_min` | number | % | 0.0〜100.0 | 運用可能SOC下限 |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

---

## 4. 電力制御

### 電力制御指示
```
POST /control/power
```
**概要**: 即座指示またはスケジュール設定を統合したAPI

**関連セクション**:
- スケジュール管理の詳細 → [5. スケジュール管理](#5-スケジュール管理)
- パラメータ範囲仕様 → [パラメータ数値範囲仕様](#パラメータ数値範囲仕様)
- 市場応札SKU → [市場応札SKU一覧](#市場応札sku一覧)

**即座指示パラメータ**:
```json
{
  "type": "immediate",             // 制御タイプ（即座指示）
  "power_kw": -1200,              // [kW] Δ電力値（ベースラインからの差分、-999999 ～ 999999）
  "baseline_kw": 0.0,             // [kW] ベースライン電力値（省略時は0として扱う）
  "duration_minutes": 30,         // [分] 継続時間（1 ～ 1440）
  "sku": "frr"                   // 応札商品SKU（任意。FCR応動の場合は必須）
}
```

**スケジュール設定パラメータ**:
```json
{
  "type": "schedule",                    // 制御タイプ（スケジュール設定）
  "power_kw": -1999,                    // [kW] Δ電力値（ベースラインからの差分、-999999 ～ 999999）
  "baseline_kw": 0.0,                   // [kW] ベースライン電力値（省略時は0として扱う）
  "start_time": "2025-06-13T14:00:00Z", // 開始時刻（ISO 8601形式、現在時刻+1分〜+90日）
  "end_time": "2025-06-13T16:00:00Z",   // 終了時刻（ISO 8601形式）
  "sku": "fcr"                          // 応札商品SKU（任意。FCR応動の場合は必須）
}
```

**レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",   // EMS識別子
  "message": "Power control accepted",            // 処理結果メッセージ
  "control_type": "immediate",                    // 実行された制御タイプ
  "power_kw": -1200,                             // [kW] 設定されたΔ電力値
  "baseline_kw": 0.0,                            // [kW] ベースライン電力値
  "sku": "frr",                                  // 設定された応札商品SKU
  "timestamp": "2025-06-13T10:30:00Z"            // API応答時刻
}
```

**レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `message` | string | - | - | 処理結果メッセージ |
| `control_type` | string | - | immediate, schedule | 実行された制御タイプ |
| `power_kw` | number | kW | -999999〜999999 | 設定されたΔ電力値（ベースラインからの差分、正: 充電方向, 負: 放電方向） |
| `baseline_kw` | number | kW | -999999〜999999 | ベースライン電力値（存在しない場合は0として扱う） |
| `sku` | string | - | - | 設定された応札商品SKU（FCR応動の場合のみ返却） |
| `start_time` | string | - | - | 開始時刻（scheduleの場合のみ、ISO 8601形式） |
| `end_time` | string | - | - | 終了時刻（scheduleの場合のみ、ISO 8601形式） |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

#### システム状態（status）による動作

| status | type | HTTPコード | 動作 |
|--------|------|-----------|------|
| **0** (正常運転) | immediate | 200 | 通常動作（即座指示実行） |
| **0** (正常運転) | schedule | 200 | 通常動作（スケジュール登録） |
| **1** (警告運転) | immediate | 200 | 通常動作（即座指示実行） |
| **1** (警告運転) | schedule | 200 | 通常動作（スケジュール登録） |
| **9** (運用不可) | immediate | 503 | エラー返却（即座指示不可） |
| **9** (運用不可) | schedule | 200 | スケジュール登録可（警告メッセージ付き） |

**status=9 時の即座指示エラーレスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 503,
    "message": "System failure or under maintenance",
    "details": "Immediate control is not available while system is out of service"
  },
  "timestamp": "2025-06-13T10:30:00Z"
}
```

**status=9 時のスケジュール登録レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "message": "Schedule registered. System failure or under maintenance",
  "control_type": "schedule",
  "power_kw": -1999,
  "baseline_kw": 0.0,
  "sku": "fcr",
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T16:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

---

## 5. スケジュール管理

**関連セクション**:
- スケジュール設定方法 → [4. 電力制御](#4-電力制御)（`type: "schedule"`パラメータを使用）
- パラメータ範囲 → [パラメータ数値範囲仕様](#パラメータ数値範囲仕様)

### スケジュール登録・更新ロジック

#### 登録期間制限
- **登録可能期間**: 現在時刻から未来90日まで
- **最小登録時間**: 現在時刻から1分後以降

#### スケジュール重複時の動作ルール

新規スケジュールを登録する際、既存スケジュールと時間帯が重複する場合、**後勝ち（最後に登録されたスケジュールが優先）** のルールが適用されます。

##### ケース1: 同じ期間のスケジュール登録
既存スケジュールと新規スケジュールの期間が完全に一致する場合、既存スケジュールは削除され、新規スケジュールに置き換えられます。

```
既存: [14:00-16:00] 1000kW
新規: [14:00-16:00] -1500kW
結果: [14:00-16:00] -1500kW (新規で上書き)
```

##### ケース2: 期間が部分的に重複する場合
既存スケジュールと新規スケジュールの期間が部分的に重複する場合、重複部分が自動的に分割され、新規スケジュールが優先されます。

**例1: 新規スケジュールが既存の中間を上書き**
```
既存: [14:00-18:00] 1000kW
新規: [15:00-17:00] -1500kW

結果:
  [14:00-15:00] 1000kW  (既存の前半部分)
  [15:00-17:00] -1500kW (新規で上書き)
  [17:00-18:00] 1000kW  (既存の後半部分)
```

**例2: 新規スケジュールが既存の前半を上書き**
```
既存: [14:00-18:00] 1000kW
新規: [13:00-15:00] -1500kW

結果:
  [13:00-15:00] -1500kW (新規)
  [15:00-18:00] 1000kW  (既存の後半部分)
```

**例3: 新規スケジュールが既存の後半を上書き**
```
既存: [14:00-18:00] 1000kW
新規: [16:00-19:00] -1500kW

結果:
  [14:00-16:00] 1000kW  (既存の前半部分)
  [16:00-19:00] -1500kW (新規)
```

**例4: 新規スケジュールが既存を完全に包含**
```
既存: [14:00-16:00] 1000kW
新規: [13:00-18:00] -1500kW

結果:
  [13:00-18:00] -1500kW (新規で完全上書き、既存は削除)
```

#### 重要な注意事項
- 開始1分前以内のスケジュールは削除できませんが、上書き登録は可能です
- 複数のスケジュールが連続して登録されている場合、最新のスケジュールが常に優先されます
- スケジュール間に隙間（未登録の時間帯）がある場合でも、新規スケジュールはその隙間を含めて登録されます
- GET `/control/schedules`で取得されるスケジュール一覧は、自動分割後の結果が反映されています

### スケジュール取得
```
GET /control/schedules
```
**概要**: 設定済みスケジュール一覧を取得

**レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",    // EMS識別子
  "schedules": [
    {
      "id": "sch_001",                             // スケジュール識別子
      "start_time": "2025-06-13T14:00:00Z",        // 開始時刻
      "end_time": "2025-06-13T19:00:00Z",          // 終了時刻
      "power_kw": 1999,                            // [kW] Δ電力値（ベースラインからの差分）
      "sku": "rr-fit",                             // 応札商品SKU
      "created_at": "2025-06-13T10:30:00Z"        // 登録時刻
    },
    {
      "id": "sch_002",                             // スケジュール識別子
      "start_time": "2025-06-14T04:00:00Z",        // 開始時刻
      "end_time": "2025-06-14T07:00:00Z",          // 終了時刻
      "power_kw": -1999,                           // [kW] Δ電力値（ベースラインからの差分）
      "sku": "fcr",                                // 応札商品SKU
      "created_at": "2025-06-13T10:30:00Z"        // 登録時刻
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"              // API応答時刻
}
```

**レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `schedules` | array | - | - | スケジュール一覧 |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

**schedules配列要素の項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `id` | string | - | - | スケジュール識別子 |
| `start_time` | string | - | - | 開始時刻（ISO 8601形式） |
| `end_time` | string | - | - | 終了時刻（ISO 8601形式） |
| `power_kw` | number | kW | -999999〜999999 | Δ電力値（ベースラインからの差分、正: 充電方向, 負: 放電方向） |
| `sku` | string | - | - | 応札商品SKU |
| `created_at` | string | - | - | 登録時刻（ISO 8601形式） |

### スケジュール削除
```
DELETE /control/schedules?id={schedule_id}
```
**概要**: 指定したスケジュールを削除

#### 削除制約条件（時分単位でチェック）
| 条件 | 削除可否 | エラーコード | 説明 |
|------|----------|-------------|------|
| **実行中** | 不可 | 409 | +1分は削除可能|
| **開始1分前以内** | 不可 | 409 | 開始時刻まで1分未満 |
| **完了済み** | 不可 | 409 | 既に完了したスケジュール |
| **予定済み** | 可能 | 200 | 開始1分前以上 |

**正常削除レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",       // EMS識別子
  "message": "Schedule deleted successfully",         // 処理結果メッセージ
  "schedule_id": "sch_001",                          // 削除されたスケジュール識別子
  "timestamp": "2025-06-13T10:30:00Z"                // API応答時刻
}
```

**正常削除レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `message` | string | - | - | 処理結果メッセージ |
| `schedule_id` | string | - | - | 削除されたスケジュール識別子 |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

**削除不可エラーレスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 409,
    "message": "Schedule cannot be deleted",
    "details": "Schedule is currently executing and cannot be deleted",
    "schedule_id": "sch_001",
    "start_time": "2025-06-13T14:00:00Z",
    "current_time": "2025-06-13T14:30:00Z"
  },
  "timestamp": "2025-06-13T14:30:00Z"
}
```

---

## 6. 電力値履歴

**関連セクション**:
- エネルギー量の累積値 → [7. エネルギー履歴](#7-エネルギー履歴)
- パラメータ範囲 → [パラメータ数値範囲仕様](#パラメータ数値範囲仕様)
- データ形式と符号規則 → [データ形式](#データ形式)

### 電力値履歴取得
```
POST /report/power
```
**概要**: 電力値（kW）と系統周波数の時系列データを取得

**詳細履歴取得パラメータ**:
```json
{
  "request_id": "report_req_001",        // リクエスト識別子
  "start_time": "2025-06-12T00:00:00Z",  // 取得開始時刻（ISO 8601形式）
  "end_time": "2025-06-13T00:00:00Z",    // 取得終了時刻（ISO 8601形式、最大31日間）
  "interval_seconds": 60                 // [秒] データ間隔（1～3600、デフォルト60）
}
```

**詳細履歴レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",        // EMS識別子
  "request_id": "report_req_001",                      // リクエスト識別子
  "start_time": "2025-06-12T00:00:00Z",                // 取得開始時刻
  "end_time": "2025-06-13T00:00:00Z",                  // 取得終了時刻
  "interval_seconds": 60,                              // [秒] データ間隔
  "data": [
    {
      "power_kw": -1485.2,                             // [kW] 電力値
      "baseline_kw": 0.0,                              // [kW] ベースライン電力値
      "delta_kw": -1485.2,                             // [kW] 差分電力値（power_kw - baseline_kw）
      "actual_frequency": 50.0,                        // [Hz] 系統周波数
      "output_control_limit": 100,                     // [%] 出力制御上限
      "timestamp": "2025-06-12T00:00:00Z"              // レコード時刻
    },
    {
      "power_kw": -1499.4,                             // [kW] 電力値
      "baseline_kw": 0.0,                              // [kW] ベースライン電力値
      "delta_kw": -1499.4,                             // [kW] 差分電力値（power_kw - baseline_kw）
      "actual_frequency": 50.0,                        // [Hz] 系統周波数
      "output_control_limit": 100,                     // [%] 出力制御上限
      "timestamp": "2025-06-12T00:01:00Z"              // レコード時刻
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"                  // API応答時刻
}
```

**レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `request_id` | string | - | - | リクエスト識別子 |
| `start_time` | string | - | - | 取得開始時刻（ISO 8601形式） |
| `end_time` | string | - | - | 取得終了時刻（ISO 8601形式） |
| `interval_seconds` | integer | 秒 | 1〜3600 | データ間隔 |
| `data` | array | - | - | 履歴データ配列 |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

**data配列要素の項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `power_kw` | number | kW | -定格電力〜+定格電力 | 電力値（正: 充電, 負: 放電） |
| `baseline_kw` | number | kW | -定格電力〜+定格電力 | ベースライン電力値（存在しない場合は0として扱う） |
| `delta_kw` | number | kW | -定格電力〜+定格電力 | 差分電力値（power_kw - baseline_kw） |
| `actual_frequency` | number | Hz | 45.0〜65.0 | 系統周波数 |
| `output_control_limit` | number | % | 0〜100 | 出力制御上限 |
| `timestamp` | string | - | - | レコード時刻（ISO 8601形式） |

**取得最大データ件数**: 30,000件

---

## 7. エネルギー履歴

**関連セクション**:
- 電力値の時系列データ → [6. 電力値履歴](#6-電力値履歴)
- パラメータ範囲 → [パラメータ数値範囲仕様](#パラメータ数値範囲仕様)
- データ形式と符号規則 → [データ形式](#データ形式)

### エネルギー履歴取得
```
POST /report/energy
```
**概要**: 充放電エネルギー量（kWh）の期間内累積値を取得

**パラメータ**:
```json
{
  "request_id": "report_req_001",        // リクエスト識別子
  "start_time": "2025-06-01T00:00:00Z",  // 取得開始時刻（ISO 8601形式）
  "end_time": "2025-06-13T23:59:59Z"     // 取得終了時刻（ISO 8601形式、最大31日間）
}
```

**レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",        // EMS識別子
  "request_id": "report_req_001",                      // リクエスト識別子
  "start_time": "2025-06-01T00:00:00Z",                // 取得開始時刻
  "end_time": "2025-06-13T23:59:59Z",                  // 取得終了時刻
  "charge_kwh": 47850,                                 // [kWh] 累積充電電力量
  "discharge_kwh": 42045,                              // [kWh] 累積放電電力量
  "timestamp": "2025-06-13T10:30:00Z"                  // API応答時刻
}
```

**レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `request_id` | string | - | - | リクエスト識別子 |
| `start_time` | string | - | - | 取得開始時刻（ISO 8601形式） |
| `end_time` | string | - | - | 取得終了時刻（ISO 8601形式） |
| `charge_kwh` | number | kWh | 0以上 | 期間内の累積充電電力量 |
| `discharge_kwh` | number | kWh | 0以上 | 期間内の累積放電電力量 |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

**取得最大データ件数**: 30,000件

---

## 8. FCRパラメータ管理

**関連セクション**:
- FCR応動状態の確認 → [2. リアルタイム状態取得](#2-リアルタイム状態取得)（`in_fcr_mode`フィールド）
- パラメータ範囲 → [パラメータ数値範囲仕様](#パラメータ数値範囲仕様)
- 市場応札SKU → [市場応札SKU一覧](#市場応札sku一覧)（`fcr`）

### FCRパラメータ設定・取得
```
GET /fcr/config
POST /fcr/config
```

**GET（取得）レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",        // EMS識別子
  "freq_ref": 50,                                      // [Hz] 基準周波数（49.5-60.5）
  "up_deadband": 0.05,                                 // [Hz] 上側不感帯（0.00-0.20）
  "low_deadband": 0.05,                                // [Hz] 下側不感帯（0.00-0.20）
  "up_droop": 5,                                       // [%] 上側調定率（0.200-10.000）
  "low_droop": 5,                                      // [%] 下側調定率（0.200-10.000）
  "timestamp": "2025-06-13T10:30:00Z"                  // API応答時刻
}
```

**GET（取得）レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `freq_ref` | number | Hz | 49.5〜60.5 | 基準周波数 |
| `up_deadband` | number | Hz | 0.00〜0.20 | 上側不感帯幅 |
| `low_deadband` | number | Hz | 0.00〜0.20 | 下側不感帯幅 |
| `up_droop` | number | % | 0.200〜10.000 | 上側調定率 |
| `low_droop` | number | % | 0.200〜10.000 | 下側調定率 |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

**POST（設定）パラメータ例**:
```json
{
  "freq_ref": 50,                          // [Hz] 基準周波数（49.5-60.5）
  "up_deadband": 0.05,                     // [Hz] 上側不感帯（0.00-0.20）
  "low_deadband": 0.05,                    // [Hz] 下側不感帯（0.00-0.20）
  "up_droop": 5,                           // [%] 上側調定率（0.200-10.000）
  "low_droop": 5                           // [%] 下側調定率（0.200-10.000）
}
```

**POST（設定）レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",          // EMS識別子
  "message": "FCR configuration updated successfully",   // 処理結果メッセージ
  "freq_ref": 50,                                        // [Hz] 設定された基準周波数
  "up_deadband": 0.05,                                   // [Hz] 設定された上側不感帯
  "low_deadband": 0.05,                                  // [Hz] 設定された下側不感帯
  "up_droop": 5,                                         // [%] 設定された上側調定率
  "low_droop": 5,                                        // [%] 設定された下側調定率
  "timestamp": "2025-06-13T10:30:00Z"                    // API応答時刻
}
```

**POST（設定）レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `message` | string | - | - | 処理結果メッセージ |
| `freq_ref` | number | Hz | 49.5〜60.5 | 設定された基準周波数 |
| `up_deadband` | number | Hz | 0.00〜0.20 | 設定された上側不感帯幅 |
| `low_deadband` | number | Hz | 0.00〜0.20 | 設定された下側不感帯幅 |
| `up_droop` | number | % | 0.200〜10.000 | 設定された上側調定率 |
| `low_droop` | number | % | 0.200〜10.000 | 設定された下側調定率 |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

---

## 9. エラーコード体系

| コード | 説明 | 対象API | 具体例 |
|--------|------|---------|--------|
| **400** | リクエスト不正 | パラメータを持つAPI（/auth/refresh除く） | パラメータ不足、値が範囲外 |
| **401** | 認証失敗 | 全般 | JWT不正・期限切れ |
| **403** | アクセス権限不足 | 全般 | 蓄電所へのアクセス権なし |
| **404** | データなし | 履歴系API | 指定時刻のデータが存在しない |
| **409** | 削除不可 | スケジュール削除API | 実行中・開始1分前以内・完了済みのスケジュール |
| **410** | データ量制限超過 | 履歴系API | 取得期間が長すぎる |
| **498** | 認証キー期限切れ | 全般（/auth/refresh除く） | JWTトークン期限切れ |
| **503** | システム故障 | 全般 | システム異常 |

**エラーレスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",        // EMS識別子
  "error": {
    "code": 400,                                       // HTTPエラーコード
    "message": "Invalid parameter: power_kw must be between -999999 and 999999", // エラーメッセージ
    "details": "Requested power 2500kW exceeds maximum discharge power 1999kW", // 詳細情報
    "parameter": "power_kw",                           // エラー対象パラメータ
    "received_value": 2500,                            // 受信した値
    "valid_range": "-999999 to 999999"                     // 有効範囲
  },
  "timestamp": "2025-08-19T10:30:00Z"                  // API応答時刻
}
```

**エラーレスポンス項目定義**:

| 項目名 | 型 | 範囲 | 説明 |
|--------|------|------|------|
| `ems_id` | string | - | EMS識別子（16バイトUUID = 32文字hex） |
| `error` | object | - | エラー詳細オブジェクト |
| `timestamp` | string | - | API応答時刻（ISO 8601形式） |

**errorオブジェクト項目定義**:

| 項目名 | 型 | 範囲 | 説明 |
|--------|------|------|------|
| `code` | integer | 400, 401, 403, 404, 409, 410, 429, 498, 503 | HTTPエラーコード |
| `message` | string | - | エラーメッセージ |
| `details` | string | - | エラー詳細情報 |
| `parameter` | string | - | エラー対象パラメータ名（該当時のみ） |
| `received_value` | any | - | 受信した値（該当時のみ） |
| `valid_range` | string | - | 有効範囲（該当時のみ） |
| `error_type` | string | - | エラー種別（認証エラー時のみ） |
| `expires_at` | string | - | トークン有効期限（認証エラー時のみ、ISO 8601形式） |

**認証エラー詳細例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 498,
    "message": "JWT token expired",
    "details": "Token expired at 2025-08-19T09:30:00Z, current time is 2025-08-19T10:30:00Z",
    "error_type": "token_expired",
    "expires_at": "2025-08-19T09:30:00Z"
  },
  "timestamp": "2025-08-19T10:30:00Z"
}
```

---

## 10. 運転計画

**関連セクション**:
- システム状態 → [2. リアルタイム状態取得](#2-リアルタイム状態取得)（`status`フィールド）
- データ形式と符号規則 → [データ形式](#データ形式)

### 運転計画一覧取得
```
GET /serviceplan
```
**概要**: 指定時刻を起点に30分刻みの in service / out of service 運転計画を48件取得

**クエリパラメータ**:

| パラメータ | 必須 | 形式 | 説明 |
|-----------|------|------|------|
| `start_time` | 任意 | ISO 8601 | 取得開始時刻（省略時は現在時刻） |

**レスポンス例**:
```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",        // EMS識別子
  "start_time": "2025-06-13T00:00:00Z",                // 取得開始時刻
  "plans": [
    {
      "start_time": "2025-06-13T00:00:00Z",            // スロット開始時刻
      "end_time":   "2025-06-13T00:30:00Z",            // スロット終了時刻
      "status": 0,                                     // 運転状態（0: in service, 9: out of service）
      "baseline_kw": 0.0                               // [kW] ベースライン電力値
    },
    {
      "start_time": "2025-06-13T00:30:00Z",
      "end_time":   "2025-06-13T01:00:00Z",
      "status": 9,                                     // 運転状態（0: in service, 9: out of service）
      "baseline_kw": 0.0
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"                  // API応答時刻
}
```

**レスポンス項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `ems_id` | string | - | - | EMS識別子（16バイトUUID = 32文字hex） |
| `start_time` | string | - | - | 取得開始時刻（ISO 8601形式） |
| `plans` | array | - | 48件固定 | 運転計画配列（30分刻み） |
| `timestamp` | string | - | - | API応答時刻（ISO 8601形式） |

**plans配列要素の項目定義**:

| 項目名 | 型 | 単位 | 範囲 | 説明 |
|--------|------|------|------|------|
| `start_time` | string | - | - | スロット開始時刻（ISO 8601形式） |
| `end_time` | string | - | - | スロット終了時刻（ISO 8601形式、start_time + 30分） |
| `status` | integer | - | 0, 9 | 運転状態（0: in service, 9: out of service） |
| `baseline_kw` | number | kW | -定格電力〜+定格電力 | ベースライン電力値 |

---

## 変更履歴
 
### v1.13 (2026-07-15)
- `up_deadband`の最小値を0.01から0.00へと変更
- `low_deadband`の最小値を0.01から0.00へと変更
- GET（取得）レスポンス例: 上側・下側不感帯の最小値を0.01から0.00へと変更
- POST（設定）パラメータ例: 上側・下側不感帯の最小値を0.01から0.00へと変更

### v1.12 (2026-06-17)
- GET /status: `status`の定義を3値に変更（0: 正常運転, 1: 警告運転, 9: 運用不可）
- POST /control/power: システム状態による動作表に`status=1`（警告運転）を追加（0と同じ扱い：即座指示・スケジュールとも200）
- GET /serviceplan: statusは0/9のまま据え置き（警告運転は実時間状態のため運転計画には含めない）

### v1.11 (2026-04-04)
- GET /status: レスポンスに`baseline_kw`フィールドを追加
- POST /control/power: リクエストに`baseline_kw`フィールドを追加（任意、省略時は0として扱う）
- POST /control/power: `sku`パラメータを任意に変更（FCR応動（一次調整力）の場合は必須）
- POST /control/power: `power_kw`の定義をΔ電力値（ベースラインからの差分）に修正
- POST /report/power: レスポンスのdata配列要素に`baseline_kw`フィールドを追加
- POST /report/power: レスポンスのdata配列要素に`delta_kw`フィールドを追加
- GET /serviceplan: 新規追加（30分刻み in/out of service 運転計画一覧取得、`baseline_kw`含む）
- 市場応札SKU: `jepx-da-24` / `jepx-da-dt` / `jepx-da-pt` を `jepx-da` に統一

### v1.10 (2026-01-30)
- エラーコード体系を整理：409を「削除不可」、410を「データ量制限超過」に統一
- エラーコード適用範囲を明確化：400は「パラメータを持つAPI（/auth/refresh除く）」、498は「全般（/auth/refresh除く）」
- スケジュール削除制約：完了済みのエラーコードを410→409に変更
- エラーレスポンスを共通化（components/responses）

### v1.9 (2026-01-20)
- **Base URL仕様を明確化**
  - 通常のAPIと認証APIを分けて表示
  - テスト環境URLを追加（本番・テスト環境両方を明記）
  - `/auth/refresh`が例外であることを強調
- **EMS IDごとの認証要件を明記**
  - 1つのトークンセットは1つのEMS IDに紐付くことを強調
  - 複数EMS ID利用時の具体的な手順を追加
  - 表形式で2種類のトークンの違いを明示

### v1.8 (2025-12-06)
- 全APIにレスポンス項目定義テーブルを追加
- レスポンス項目定義に範囲列を追加
- /auth/refresh をAPI一覧に追加
- 市場応札SKU一覧にJEPX関連を追加（jepx-da-24, jepx-da-dt, jepx-da-pt, jepx-ttv）

### v1.7 (2025-12-05)
- power_kw範囲を-999999～999999に変更
- soc範囲を0.0～100.0に変更
- start_time範囲を90日以内に変更
- 停止指示パラメータ（type: stop）を削除
- スケジュール重複制御ルールを削除
- FCR調定率（up_droop/low_droop）範囲を0.200～10.000に統一
- POST /control/power にstatus別動作仕様を追加
- /status: statusの定義を変更（0:in service, 9:out of service）
- /status: command_statusオブジェクトを削除
- /status: in_fcr_modeフィールドを追加
- GET /control/schedules: スケジュールのstatusフィールドを削除

### v1.6 (2025-10-30)
- 5.1 電力履歴取得のレスポンス：「record_no」⇒「timestamp」に変更
