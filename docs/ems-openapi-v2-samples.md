# EMS OpenAPI v2 サンプル集

**対象バージョン**: 2.2
**本編**: [ENECloud EMS OpenAPI 説明書 v2](ems-openapi-v2.md)

> 本書は [EMS OpenAPI 説明書 v2](ems-openapi-v2.md) のリクエスト／レスポンスのサンプル集です。
> フィールドの定義・制約・バリデーションは本編の該当節を参照してください。

---


本付録は全 API のリクエスト/レスポンス JSON サンプルを集約しています。各 API の本文セクションでは項目定義のみを記述し、サンプルは本付録を参照する構成です。

### B.1 認証

#### B.1.1 `/auth/refresh`

リクエスト:

```
POST /auth/refresh
Authorization: Bearer {refresh_token}
```

レスポンス（200 OK）:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 2592000,
  "expires_at": "2025-08-20T10:30:00Z"
}
```

### B.2 `/status` `/status/details`

> リクエストは `GET /v2/ems/{id}/status`（概要）/ `GET /v2/ems/{id}/status/details`（詳細）。レスポンスのフィールド粒度・種別固有項目は §9.2 参照。
> 代表 3 件（B.2.1 battery / B.2.3 consumer / B.2.4 PV+battery+負荷）は概要・詳細の両サンプルを掲載、その他は **詳細レスポンス例** として掲載する（概要は §9.2.1 の項目表に従い該当フィールドを抽出すれば再現可能）。

#### B.2.1 蓄電所（battery）

**リクエスト**:

```
GET /v2/ems/{id}/status            # 概要
GET /v2/ems/{id}/status/details    # 詳細
Authorization: Bearer {access_token}
```

**概要レスポンス（`/status`）**:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "status": 0,
  "fcr_active": 0,
  "import_energy_available": 2090.0,
  "export_energy_available": 4598.0,
  "import_power_available": 1900.0,
  "export_power_available": 1900.0,
  "current_kw": 1185.3,
  "baseline_kw": 0.0,
  "delta_kw": 1185.3,
  "dispatched_delta_kw": 1200.0,
  "output_control_limit": 100,
  "has_warning": 0,
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z"
}
```

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "status": 0,
  "has_warning": 0,
  "active_sku": null,
  "last_dispatch_status": "dispatched",
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": 1185.3,
    "baseline_kw": 0.0,
    "delta_kw": 1185.3,
    "dispatched_delta_kw": 1200.0,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": 100,
    "output_control_reason": null
  },
  "capacity": {
    "import_energy_available": 2090.0,
    "export_energy_available": 4598.0,
    "import_power_available": 1900.0,
    "export_power_available": 1900.0
  },
  "resource_state": {
    "soc": 50
  }
}
```

> 1200kW 充電指令に対し実測 1185.3kW（達成度 98.8%）。`active_power.delta_kw - dispatched_delta_kw = -14.7` の乖離は PCS 応答誤差。`has_warning: 0` のため警告なし。詳細では SOC・直近指令結果も `resource_state` ブロックに集約。`site_capability` ブロック（`fcr_capable` / `dr_capable` / `marketable` 等）の静的属性は `/specifications` で別取得。`reactive_power` / `tso_dispatch_detail` ブロックはv2.0 本仕様では未返却。

#### B.2.2 発電所（generator、FIP・ノンファーム連系）

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "b2c3d4e5f6789012345678901234abcd",
  "status": 0,
  "has_warning": 0,
  "active_sku": null,
  "last_dispatch_status": "dispatched",
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": -1230.5,
    "baseline_kw": -1500.0,
    "delta_kw": 269.5,
    "dispatched_delta_kw": 270.0,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": 80,
    "output_control_reason": "non_firm_congestion"
  },
  "capacity": {
    "export_power_available": 1500.0
  },
  "resource_state": {
    "irradiance_w_m2": 720
  }
}
```

> `fcr_capable` / `dr_capable` 等の component 静的属性、および `site_capability` / `site_constraints` ブロックは `/specifications` で取得。`reactive_power` / `tso_dispatch_detail` ブロックはv2.0 本仕様では未返却。

#### B.2.3 需要家（consumer、DR応動中）

**概要レスポンス（`/status`）**:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "status": 0,
  "fcr_active": 0,
  "dr_active": 1,
  "import_power_available": 2000.0,
  "current_kw": 850.2,
  "baseline_kw": 1000.0,
  "delta_kw": -149.8,
  "dispatched_delta_kw": -200.0,
  "output_control_limit": null,
  "has_warning": 0,
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z"
}
```

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "status": 0,
  "has_warning": 0,
  "active_sku": "frr",
  "last_dispatch_status": "dispatched",
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": 850.2,
    "baseline_kw": 1000.0,
    "delta_kw": -149.8,
    "dispatched_delta_kw": -200.0,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": null,
    "output_control_reason": null
  },
  "capacity": {
    "import_power_available": 2000.0
  },
  "resource_state": {
    "dr_active": 1,
    "dr_target_reduction_kw": 200.0,
    "dr_actual_reduction_kw": 149.8
  }
}
```

> `dr_capable` / `contract_kw` 等の consumer component 静的属性および `site_capability` ブロックは `/specifications` で取得。`reactive_power` / `tso_dispatch_detail` ブロックはv2.0 本仕様では未返却。

#### B.2.4 PV+battery+負荷

**概要レスポンス（`/status`）**:

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "status": 0,
  "fcr_active": 0,
  "dr_active": 0,
  "import_power_available": 2000.0,
  "export_power_available": 1500.0,
  "import_energy_available": 1500.0,
  "export_energy_available": 2500.0,
  "current_kw": 350.5,
  "baseline_kw": 0.0,
  "delta_kw": 350.5,
  "dispatched_delta_kw": null,
  "output_control_limit": 100,
  "has_warning": 0,
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z"
}
```

> 概要では `components[]` 配列は返却されない。component 個別の状態は `/status/details` で取得する。

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "status": 0,
  "has_warning": 0,
  "active_sku": null,
  "last_dispatch_status": null,
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": 350.5,
    "baseline_kw": 0.0,
    "delta_kw": 350.5,
    "dispatched_delta_kw": null,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": 100,
    "output_control_reason": null
  },
  "capacity": {
    "import_energy_available": 1500.0,
    "export_energy_available": 2500.0,
    "import_power_available": 2000.0,
    "export_power_available": 1500.0
  },
  "resource_state": {
    "dr_active": 0,
    "components": [
      {
        "component_id": "bat-1",
        "component_type": "battery",
        "status": 0,
        "active_power": {
          "current_kw": -200.0,
          "fcr_active": 0,
          "output_control_limit": 100
        },
        "capacity": {
          "import_energy_available": 1500.0,
          "export_energy_available": 2500.0,
          "import_power_available": 500.0,
          "export_power_available": 500.0
        },
        "resource_state": {
          "soc": 60
        }
      },
      {
        "component_id": "pv-1",
        "component_type": "generator",
        "status": 0,
        "active_power": {
          "current_kw": -800.0,
          "fcr_active": 0,
          "output_control_limit": 100,
          "output_control_reason": null
        },
        "capacity": {
          "export_power_available": 1000.0
        },
        "resource_state": {
          "irradiance_w_m2": 720
        }
      },
      {
        "component_id": "load-1",
        "component_type": "consumer",
        "status": 0,
        "active_power": {
          "current_kw": 1350.5,
          "fcr_active": 0
        },
        "capacity": {
          "import_power_available": 2000.0
        },
        "resource_state": {
          "dr_active": 0,
          "dr_target_reduction_kw": null,
          "dr_actual_reduction_kw": null
        }
      }
    ]
  }
}
```

> `site_capability` / `site_constraints`（`voltage_class` / `measurement_point` / `site_import_max_kw` / `site_export_max_kw`）および各 component の静的属性（`fcr_capable` / `dr_capable` 等）はすべて `/specifications` で取得。各 component も同じ階層構造（`active_power` / `capacity` / `resource_state`）でフィールドサブセットを返す。`reactive_power` / `tso_dispatch_detail` ブロックはv2.0 本仕様では未返却。


#### B.2.5 工場+battery（需給調整双方向応動、逆潮流不可）

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "f1a2c3d4e5f6789012345678901234ab",
  "status": 0,
  "has_warning": 0,
  "active_sku": "fcr",
  "last_dispatch_status": "dispatched",
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": 1200.0,
    "baseline_kw": 1500.0,
    "delta_kw": -300.0,
    "dispatched_delta_kw": null,
    "fcr_active": 1,
    "fcr_response_kw": 800.0
  },
  "capacity": {
    "import_energy_available": 2000.0,
    "export_energy_available": 2400.0,
    "import_power_available": 2000.0,
    "export_power_available": 0.0
  },
  "resource_state": {
    "dr_active": 0,
    "components": [
      {
        "component_id": "load-1",
        "component_type": "consumer",
        "status": 0,
        "active_power": { "current_kw": 1500.0, "fcr_active": 0 },
        "resource_state": { "dr_active": 0, "dr_target_reduction_kw": null, "dr_actual_reduction_kw": null }
      },
      {
        "component_id": "bat-1",
        "component_type": "battery",
        "status": 0,
        "active_power": { "current_kw": -300.0, "fcr_active": 1, "fcr_response_kw": 800.0, "output_control_limit": 100 },
        "capacity": { "import_energy_available": 2000.0, "export_energy_available": 2400.0, "import_power_available": 800.0, "export_power_available": 800.0 },
        "resource_state": { "soc": 55 }
      }
    ]
  }
}
```

> **構成のポイント**:
> - サイト `active_power.current_kw: +1200` = 工場消費 1500 − battery 放電 300（自家消費）
> - `site_export_max_kw: 0`（逆潮流不可）は `/specifications` で取得（静的属性）
> - `active_power.fcr_active: 1` = battery が FCR 周波数応動を実行中
> - 工場負荷は通常運転を維持（FCR は battery が担当）
> - `site_capability` / `site_constraints`（`dr_capable` / `fcr_capable` / `site_*_max_kw` 等）および各 component の静的属性は `/specifications` で取得

#### B.2.6 PV+battery（発電事業者連系、FIP・余剰送電中）

consumer なしの蓄電所（卒FIT 移行サイト想定）。逆潮流可能で送電中の状態。

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "e5f6789012345678901234abcdef0123",
  "status": 0,
  "has_warning": 0,
  "active_sku": "jepx-da",
  "last_dispatch_status": "dispatched",
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": -1700.0,
    "baseline_kw": -1500.0,
    "delta_kw": -200.0,
    "dispatched_delta_kw": -200.0,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": 100
  },
  "capacity": {
    "import_energy_available": 1500.0,
    "export_energy_available": 2500.0,
    "import_power_available": 100.0,
    "export_power_available": 2000.0
  },
  "resource_state": {
    "components": [
      {
        "component_id": "pv-1",
        "component_type": "generator",
        "status": 0,
        "active_power": { "current_kw": -1500.0, "fcr_active": 0, "output_control_limit": 100, "output_control_reason": null },
        "capacity": { "export_power_available": 1500.0 },
        "resource_state": { "irradiance_w_m2": 850 }
      },
      {
        "component_id": "bat-1",
        "component_type": "battery",
        "status": 0,
        "active_power": { "current_kw": -200.0, "fcr_active": 0, "output_control_limit": 100 },
        "capacity": { "import_energy_available": 1500.0, "export_energy_available": 2500.0, "import_power_available": 800.0, "export_power_available": 800.0 },
        "resource_state": { "soc": 65 }
      }
    ]
  }
}
```

> `site_capability` / `site_constraints` および各 component の静的属性（`fcr_capable` 等）は `/specifications` で取得。


#### B.2.7 単独 FIT-PV（generator 単機、発電中）

蓄電池併設できない FIT-PV の単機例。

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "f6789012345678901234abcdef012345",
  "status": 0,
  "has_warning": 0,
  "active_sku": null,
  "last_dispatch_status": null,
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": -1450.0,
    "baseline_kw": -1500.0,
    "delta_kw": 50.0,
    "dispatched_delta_kw": null,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": 100,
    "output_control_reason": null
  },
  "capacity": {
    "export_power_available": 1500.0
  },
  "resource_state": {
    "irradiance_w_m2": 850
  }
}
```

> `generator_kind` / `fcr_capable` 等の component 静的属性および `site_capability` ブロックは `/specifications` で取得。

#### B.2.8 火力発電所（generator、thermal、FCR 応動中）

LNG 火力（`generator_kind: "thermal"`）が FCR で双方向応動中の例。

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "a2b3c4d5e6f7890123456789abcdef01",
  "status": 0,
  "has_warning": 0,
  "active_sku": "fcr",
  "last_dispatch_status": "dispatched",
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": -100200.0,
    "baseline_kw": -100000.0,
    "delta_kw": -200.0,
    "dispatched_delta_kw": null,
    "fcr_active": 1,
    "fcr_response_kw": 30000.0,
    "output_control_limit": 100,
    "output_control_reason": null
  },
  "capacity": {
    "export_power_available": 130000.0
  },
  "resource_state": {}
}
```

> **解釈**: 計画発電量 100,000 kW（`active_power.baseline_kw: -100000`）に対し、現時点で 100,200 kW 送電中（周波数偏差に追従して微増）。応動レンジは ±30,000 kW（70,000 〜 130,000 kW 送電）。`generator_kind` / `fcr_capable` 等の component 静的属性および `site_capability` は `/specifications` で取得。本サンプルは `reactive_power` / `tso_dispatch_detail` ブロック未返却のv2.0 本仕様形式。`tso_dispatch_detail` を含む将来拡張イメージは [§9.2.2 サンプル（火力発電所）](ems-openapi-v2.md#922-statusdetails-詳細) 参照。

#### B.2.9 揚水発電所（generator、pumped_storage、ポンプ運転中）

揚水発電（`generator_kind: "pumped_storage"`）が深夜にポンプ運転（受電方向）している例。

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "b3c4d5e6f7890123456789abcdef0123",
  "status": 0,
  "has_warning": 0,
  "active_sku": null,
  "last_dispatch_status": null,
  "measure_timestamp": "2025-06-13T03:00:00Z",
  "timestamp": "2025-06-13T03:00:05Z",
  "active_power": {
    "current_kw": 250000.0,
    "baseline_kw": 250000.0,
    "delta_kw": 0.0,
    "dispatched_delta_kw": null,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": 100,
    "output_control_reason": null
  },
  "capacity": {
    "export_power_available": 0.0
  },
  "resource_state": {}
}
```

> **解釈**: 上池への揚水（ポンプ運転）中、`current_kw: +250000`（受電方向 = 系統からの受電 250,000 kW）。`baseline_kw: +250000` でポンプ運転計画と整合。揚水発電所は発電/ポンプ運転で双方向の `current_kw` を取りうる稀有な generator。

#### B.2.10 蓄電池 FCR 応動中（battery、fcr_active=1）

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "status": 0,
  "has_warning": 0,
  "active_sku": "fcr",
  "last_dispatch_status": "dispatched",
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": -45.2,
    "baseline_kw": 0.0,
    "delta_kw": -45.2,
    "dispatched_delta_kw": null,
    "fcr_active": 1,
    "fcr_response_kw": 1999.0,
    "output_control_limit": 100
  },
  "capacity": {
    "import_energy_available": 2090.0,
    "export_energy_available": 4598.0,
    "import_power_available": 1900.0,
    "export_power_available": 1900.0
  },
  "resource_state": {
    "soc": 50
  }
}
```

> **応動状態の解釈**:
> - `active_sku: "fcr"` = FCR 約定時間帯にあること（応札中）
> - `fcr_active: 1` = EMS制御装置の自立運転モードが有効（周波数偏差応動可能）
> - `fcr_response_kw: 1999` = 約定中の応動可能量（±1999 kW）
> - `current_kw: -45.2` = 現時点で周波数偏差に応じて微小放電中（実応動、応動レンジ内）

#### B.2.11 需要家 DR 非応動中（consumer、dr_active=0）

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "status": 0,
  "has_warning": 0,
  "active_sku": null,
  "last_dispatch_status": null,
  "measure_timestamp": "2025-06-13T10:30:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": 1050.0,
    "baseline_kw": 0.0,
    "delta_kw": 1050.0,
    "dispatched_delta_kw": null,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": null
  },
  "capacity": {
    "import_power_available": 2000.0
  },
  "resource_state": {
    "dr_active": 0,
    "dr_target_reduction_kw": null,
    "dr_actual_reduction_kw": null
  }
}
```

> **DR 非応動時の振る舞い**: `dr_active: 0`、`dr_target_reduction_kw / dr_actual_reduction_kw / active_sku` はすべて `null`。`baseline_kw: 0.0` は当該 30 分スロットのベースライン値が `/baseline` に未登録の場合（[§9.6](ems-openapi-v2.md#96-ベースライン管理-baseline) 参照）。

#### B.2.12 status=9（out of service、battery）

PCS 停止または通信断で計測無効状態。

**詳細レスポンス（`/status/details`）**:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "status": 9,
  "has_warning": 1,
  "active_sku": null,
  "last_dispatch_status": null,
  "measure_timestamp": "2025-06-13T10:00:00Z",
  "timestamp": "2025-06-13T10:30:05Z",
  "active_power": {
    "current_kw": null,
    "baseline_kw": 0.0,
    "delta_kw": null,
    "dispatched_delta_kw": null,
    "fcr_active": 0,
    "fcr_response_kw": null,
    "output_control_limit": 100
  },
  "capacity": {
    "import_energy_available": 0.0,
    "export_energy_available": 0.0,
    "import_power_available": 0.0,
    "export_power_available": 0.0
  },
  "resource_state": {
    "soc": 50
  }
}
```

> **out_of_service の挙動**: `status: 9`、`active_power.current_kw: null`、`active_power.delta_kw: null`（`current_kw - baseline_kw` が計算不能）、`capacity` / power 系が `0` に固定。`dispatched_delta_kw` も `null`（指令配信は status=9 では受理されない）。**`has_warning: 1`**（status=9 自体が警告条件に該当）。`measure_timestamp` は最後の有効計測時刻。`resource_state.soc` は最後の計測値が残っている可能性あり（参考値）。

### B.3 `/specifications`

> リクエストは `GET /v2/ems/{id}/specifications`（共通）。レスポンスは `components[]` 構成に応じて返却フィールドが変動します。

#### B.3.1 蓄電所（battery）

リクエスト:

```
GET /v2/ems/{id}/specifications
Authorization: Bearer {access_token}
```

レスポンス:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "site_capability": {
    "fcr_capable": true,
    "dr_capable": false,
    "reverse_flow_allowed": true,
    "marketable": ["fcr", "s-frr", "frr", "rr", "rr-fit", "compound", "jepx-da", "jepx-ttv"],
    "balancing_responsible": false,
    "non_firm_connection": false
  },
  "site_constraints": {
    "voltage_class": "extra_high",
    "measurement_point": "grid",
    "site_import_max_kw": 1999.0,
    "site_export_max_kw": 1999.0
  },
  "components": [
    {
      "component_id": "bat-1",
      "component_type": "battery",
      "rated_cap": 8360.0,
      "import_pwr_max": 1999.0,
      "export_pwr_max": 1999.0,
      "soc_op_max": 90,
      "soc_op_min": 10,
      "fcr_capable": true
    }
  ],
  "effective_from": "2025-06-13T00:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

> **計測点**: 本サンプルは受電点（`"grid"`）。機器点（`"device"`）の選択可否は制度・運用ルールに基づき EMS運用担当が審査（[§3.6](ems-openapi-v2.md#36-計測点受電点--機器点) 参照）。

#### B.3.2 発電所（generator、PV、FIP・ノンファーム）

```json
{
  "ems_id": "b2c3d4e5f6789012345678901234abcd",
  "site_capability": {
    "fcr_capable": false,
    "dr_capable": false,
    "reverse_flow_allowed": true,
    "marketable": ["jepx-da", "jepx-ttv"],
    "balancing_responsible": true,
    "non_firm_connection": true
  },
  "site_constraints": {
    "voltage_class": "high",
    "measurement_point": "grid",
    "site_import_max_kw": 50.0,
    "site_export_max_kw": 1500.0
  },
  "components": [
    {
      "component_id": "pv-1",
      "component_type": "generator",
      "generator_kind": "pv",
      "pv_capacity_kw": 1500.0,
      "rated_output_kw": 1300.0,
      "fcr_capable": false
    }
  ],
  "effective_from": "2025-06-13T00:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

> **FIP 区分の表現**: 本サイトは FIP 認定。`balancing_responsible: true` と `non_firm_connection: true` から FIP / ノンファーム連系であることが推察可能。精算は `/measurements/energy` の `fip_export_kwh` で実施。

#### B.3.3 火力発電所（generator、thermal）

LNG 火力発電所、需給調整市場 FCR/S-FRR/FRR/RR 全対応。

```json
{
  "ems_id": "a2b3c4d5e6f7890123456789abcdef01",
  "site_capability": {
    "fcr_capable": true,
    "dr_capable": false,
    "reverse_flow_allowed": true,
    "marketable": ["fcr", "s-frr", "frr", "rr", "rr-fit", "compound", "jepx-da", "jepx-ttv"],
    "balancing_responsible": true,
    "non_firm_connection": false
  },
  "site_constraints": {
    "voltage_class": "extra_high",
    "measurement_point": "grid",
    "site_import_max_kw": 5000.0,
    "site_export_max_kw": 130000.0
  },
  "components": [
    {
      "component_id": "gen-1",
      "component_type": "generator",
      "generator_kind": "thermal",
      "fuel_type": "lng",
      "rated_output_kw": 130000.0,
      "min_output_kw": 60000.0,
      "ramp_rate_kw_per_min": 5000,
      "fcr_capable": true
    }
  ],
  "effective_from": "2025-06-13T00:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.3.4 揚水発電所（generator、pumped_storage）

上池容量 2GWh、ポンプ運転時最大受電 250MW、発電時最大出力 200MW。

```json
{
  "ems_id": "b3c4d5e6f7890123456789abcdef0123",
  "site_capability": {
    "fcr_capable": true,
    "dr_capable": false,
    "reverse_flow_allowed": true,
    "marketable": ["fcr", "s-frr", "frr", "rr", "rr-fit", "compound", "jepx-da", "jepx-ttv"],
    "balancing_responsible": true,
    "non_firm_connection": false
  },
  "site_constraints": {
    "voltage_class": "extra_high",
    "measurement_point": "grid",
    "site_import_max_kw": 250000.0,
    "site_export_max_kw": 200000.0
  },
  "components": [
    {
      "component_id": "gen-1",
      "component_type": "generator",
      "generator_kind": "pumped_storage",
      "rated_output_kw": 200000.0,
      "min_output_kw": 50000.0,
      "ramp_rate_kw_per_min": 20000,
      "upper_reservoir_capacity_kwh": 2000000.0,
      "pump_input_max_kw": 250000.0,
      "fcr_capable": true
    }
  ],
  "effective_from": "2025-06-13T00:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.3.5 需要家（consumer）

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "site_capability": {
    "fcr_capable": false,
    "dr_capable": true,
    "reverse_flow_allowed": false,
    "marketable": ["negawatt-spot"],
    "balancing_responsible": false,
    "non_firm_connection": false
  },
  "site_constraints": {
    "voltage_class": "high",
    "measurement_point": "grid",
    "site_import_max_kw": 2000.0,
    "site_export_max_kw": 0.0
  },
  "components": [
    {
      "component_id": "load-1",
      "component_type": "consumer",
      "consumer_kind": "factory",
      "contract_kw": 2000.0,
      "max_demand_kw": 1850.0,
      "fcr_capable": false,
      "dr_capable": true,
      "min_dr_reduction_kw": 100.0,
      "max_dr_reduction_kw": 800.0,
      "min_dr_duration_minutes": 30,
      "min_dr_cooldown_minutes": 60
    }
  ],
  "effective_from": "2025-06-13T00:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.3.6 `components.length ≥ 2` のサイト（PV+battery+負荷、自家消費＋余剰送電型 FIP）

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "site_capability": {
    "fcr_capable": true,
    "dr_capable": true,
    "reverse_flow_allowed": true,
    "marketable": ["fcr", "s-frr", "frr", "rr", "rr-fit", "compound", "jepx-da", "jepx-ttv", "negawatt-spot"],
    "balancing_responsible": true,
    "non_firm_connection": true
  },
  "site_constraints": {
    "voltage_class": "extra_high",
    "measurement_point": "grid",
    "site_import_max_kw": 2000.0,
    "site_export_max_kw": 2000.0
  },
  "components": [
    {
      "component_id": "bat-1",
      "component_type": "battery",
      "rated_cap": 8360.0,
      "import_pwr_max": 1999.0,
      "export_pwr_max": 1999.0,
      "soc_op_max": 90,
      "soc_op_min": 10,
      "fcr_capable": true
    },
    {
      "component_id": "pv-1",
      "component_type": "generator",
      "generator_kind": "pv",
      "pv_capacity_kw": 1500.0,
      "rated_output_kw": 1300.0,
      "fcr_capable": false
    },
    {
      "component_id": "load-1",
      "component_type": "consumer",
      "consumer_kind": "factory",
      "contract_kw": 2000.0,
      "max_demand_kw": 1850.0,
      "fcr_capable": false,
      "dr_capable": true,
      "min_dr_reduction_kw": 100.0,
      "max_dr_reduction_kw": 800.0,
      "min_dr_duration_minutes": 30,
      "min_dr_cooldown_minutes": 60
    }
  ],
  "effective_from": "2026-04-01T00:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

> **`components.length ≥ 2` のサイトの解釈**: PV (FIP)・battery・load の 3 component を含む。`reverse_flow_allowed: true` （余剰送電可）+ `balancing_responsible: true`（FIP 計画値同時同量）+ `non_firm_connection: true`（ノンファーム連系）で、全市場 SKU + negawatt-spot に応札可能。精算は `/measurements/energy` で `fip_export_kwh` / `dr_delivered_kwh` 等の集計フィールドを通して実施。

### B.4 `/control/active_power`

> 本付録のサンプルはすべて `type: "schedule"` 形式です。`type: "immediate"` は緊急時の運用者オーバーライド用に API として提供されますが、市場応札ワークフローでは使用しません。

#### B.4.1 蓄電所 FCR スケジュール登録（リクエスト/レスポンス）

リクエスト:

```json
{
  "type": "schedule",
  "fcr_response_kw": 1999.0,
  "baseline_kw": 0.0,
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T16:00:00Z",
  "sku": "fcr"
}
```

> FCR の `fcr_response_kw` は **応動可能量（双方向幅、絶対値・正値）**。応動レンジは `baseline ± fcr_response_kw = -1999 〜 +1999 kW`。

レスポンス:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "message": "Schedule registered successfully",
  "control_type": "schedule",
  "schedule_id": "sch_001",
  "fcr_response_kw": 1999.0,
  "baseline_kw": 0.0,
  "sku": "fcr",
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T16:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.4.2 発電所 rr-fit 調整指令スケジュール（市場約定量を `delta_kw` で指令、発電抑制方向）

リクエスト:

```json
{
  "type": "schedule",
  "delta_kw": 700.0,
  "baseline_kw": -1500.0,
  "start_time": "2025-06-13T13:00:00Z",
  "end_time": "2025-06-13T14:00:00Z",
  "sku": "rr-fit"
}
```

> baseline_kw: -1500（計画発電 1500 kW 送電）に対し、delta_kw: +700 で 700 kW 抑制 → 連系点目標 = -800 kW（800 kW 送電に縮退）。

レスポンス:

```json
{
  "ems_id": "b2c3d4e5f6789012345678901234abcd",
  "message": "Schedule registered successfully",
  "control_type": "schedule",
  "schedule_id": "sch_020",
  "delta_kw": 700.0,
  "baseline_kw": -1500.0,
  "sku": "rr-fit",
  "start_time": "2025-06-13T13:00:00Z",
  "end_time": "2025-06-13T14:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.4.3 需要家 DR スケジュール（市場約定量を `delta_kw` で指令）

リクエスト:

```json
{
  "type": "schedule",
  "delta_kw": -200.0,
  "baseline_kw": 1000.0,
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T15:00:00Z",
  "sku": "negawatt-spot"
}
```

レスポンス:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "message": "DR schedule registered successfully",
  "control_type": "schedule",
  "schedule_id": "sch_010",
  "delta_kw": -200.0,
  "baseline_kw": 1000.0,
  "sku": "negawatt-spot",
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T15:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

> `delta_kw: -200` で「200kW 削減」を表現（baseline 1000 + delta_kw -200 = 連系点目標 800kW）。

#### B.4.4 コンポーネント指定スケジュール（`component_id` 指令）

リクエスト:

```json
{
  "type": "schedule",
  "component_id": "bat-1",
  "delta_kw": -1500.0,
  "baseline_kw": 0.0,
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T15:00:00Z",
  "sku": "frr"
}
```

レスポンス:

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "message": "Component schedule registered successfully",
  "control_type": "schedule",
  "schedule_id": "sch_031",
  "scope": "component",
  "component_id": "bat-1",
  "component_type": "battery",
  "delta_kw": -1500.0,
  "baseline_kw": 0.0,
  "sku": "frr",
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T15:00:00Z",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.4.5 サイトレベルスケジュール（`site_kw` 指令）

リクエスト:

```json
{
  "type": "schedule",
  "site_kw": -500.0,
  "baseline_kw": 0.0,
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T14:30:00Z",
  "sku": "frr"
}
```

レスポンス（配分結果含む）:

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "message": "Site-level schedule registered",
  "control_type": "schedule",
  "schedule_id": "sch_030",
  "site_kw": -500.0,
  "baseline_kw": 0.0,
  "sku": "frr",
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T14:30:00Z",
  "dispatched_components": [
    { "component_id": "bat-1", "component_type": "battery", "delta_kw": -350.0, "dispatch_status": "pending" },
    { "component_id": "pv-1", "component_type": "generator", "delta_kw": 0.0, "dispatch_status": "pending" },
    { "component_id": "load-1", "component_type": "consumer", "delta_kw": 0.0, "dispatch_status": "skipped_incompatible" }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.4.6 status=9 のリソースに schedule 登録（警告付き 200）

リクエスト（通常の schedule 登録と同じ。サイト側が `status: 9` の場合に警告メッセージ付きで受理される）:

```json
{
  "type": "schedule",
  "fcr_response_kw": 1999.0,
  "baseline_kw": 0.0,
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T16:00:00Z",
  "sku": "fcr"
}
```

レスポンス:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "message": "Schedule registered. System failure or under maintenance",
  "control_type": "schedule",
  "fcr_response_kw": 1999.0,
  "baseline_kw": 0.0,
  "sku": "fcr",
  "schedule_id": "sch_002",
  "start_time": "2025-06-13T14:00:00Z",
  "end_time": "2025-06-13T16:00:00Z",
  "warning": "system_out_of_service",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

### B.5 `/control/active_power/schedules`

> GET / DELETE エンドポイントのため、リクエストは URL + クエリパラメータのみ（リクエストボディなし）。

#### B.5.1 GET 蓄電所

リクエスト:

```
GET /v2/ems/{id}/control/active_power/schedules?start_time=2025-06-13T00:00:00Z&end_time=2025-07-13T00:00:00Z
Authorization: Bearer {access_token}
```

レスポンス:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "schedules": [
    {
      "schedule_id": "sch_001",
      "start_time": "2025-06-13T14:00:00Z",
      "end_time": "2025-06-13T19:00:00Z",
      "delta_kw": 1999.0,
      "baseline_kw": 0.0,
      "sku": "rr-fit",
      "created_at": "2025-06-13T10:30:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.5.2 GET 需要家 DR

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "schedules": [
    {
      "schedule_id": "sch_010",
      "start_time": "2025-06-13T14:00:00Z",
      "end_time": "2025-06-13T15:00:00Z",
      "delta_kw": -200.0,
      "baseline_kw": 1000.0,
      "sku": "frr",
      "created_at": "2025-06-13T10:30:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.5.3 GET 発電所 rr-fit 調整指令（発電抑制方向）

```json
{
  "ems_id": "b2c3d4e5f6789012345678901234abcd",
  "schedules": [
    {
      "schedule_id": "sch_020",
      "start_time": "2025-06-13T13:00:00Z",
      "end_time": "2025-06-13T14:00:00Z",
      "delta_kw": 700.0,
      "baseline_kw": -1500.0,
      "sku": "rr-fit",
      "created_at": "2025-06-13T10:30:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.5.4 GET 複数 component サイト（site/component 混在）

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "schedules": [
    {
      "schedule_id": "sch_030",
      "scope": "site",
      "start_time": "2025-06-13T14:00:00Z",
      "end_time": "2025-06-13T14:30:00Z",
      "site_kw": -500.0,
      "baseline_kw": 0.0,
      "sku": "frr",
      "created_at": "2025-06-13T10:30:00Z"
    },
    {
      "schedule_id": "sch_031",
      "scope": "component",
      "component_id": "bat-1",
      "component_type": "battery",
      "start_time": "2025-06-13T15:00:00Z",
      "end_time": "2025-06-13T15:30:00Z",
      "delta_kw": -300.0,
      "baseline_kw": 0.0,
      "sku": "rr",
      "created_at": "2025-06-13T10:30:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.5.5 GET 蓄電池 FCR スケジュール

FCR スケジュールは `delta_kw` ではなく `fcr_response_kw` で返却される。

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "schedules": [
    {
      "schedule_id": "sch_001",
      "start_time": "2025-06-13T14:00:00Z",
      "end_time": "2025-06-13T20:00:00Z",
      "fcr_response_kw": 1999.0,
      "baseline_kw": 0.0,
      "sku": "fcr",
      "created_at": "2025-06-12T10:30:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.5.6 DELETE 正常応答

リクエスト:

```
DELETE /v2/ems/{id}/control/active_power/schedules?schedule_id=sch_001
Authorization: Bearer {access_token}
```

レスポンス:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "message": "Schedule deleted successfully",
  "schedule_id": "sch_001",
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.5.7 DELETE エラー（実行中・409）

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

#### B.5.8 DELETE エラー（存在しない・404）

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 404,
    "message": "Schedule not found",
    "details": "Schedule with id sch_999 does not exist",
    "schedule_id": "sch_999"
  },
  "timestamp": "2025-06-13T10:30:00Z"
}
```

### B.6 `/baseline`

#### B.6.1 POST `/baseline` — 一括登録（48 スロット = 1 日分）

リクエスト:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "baselines": [
    { "start_time": "2026-05-15T00:00:00Z", "end_time": "2026-05-15T00:30:00Z", "baseline_kw": 1480.0, "method_note": "High 4 of 5" },
    { "start_time": "2026-05-15T00:30:00Z", "end_time": "2026-05-15T01:00:00Z", "baseline_kw": 1460.0, "method_note": "High 4 of 5" },
    { "start_time": "2026-05-15T01:00:00Z", "end_time": "2026-05-15T01:30:00Z", "baseline_kw": 1440.0, "method_note": "High 4 of 5" }
  ]
}
```

> 紙面の都合で 3 スロットのみ表示。実運用では 48 スロット（1 日分）一括登録が典型。

レスポンス:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "registered": [
    { "start_time": "2026-05-15T00:00:00Z", "end_time": "2026-05-15T00:30:00Z", "baseline_kw": 1480.0, "action": "created" },
    { "start_time": "2026-05-15T00:30:00Z", "end_time": "2026-05-15T01:00:00Z", "baseline_kw": 1460.0, "action": "created" },
    { "start_time": "2026-05-15T01:00:00Z", "end_time": "2026-05-15T01:30:00Z", "baseline_kw": 1440.0, "action": "created" }
  ],
  "timestamp": "2026-05-14T12:00:00Z"
}
```

#### B.6.2 POST `/baseline` — 当日調整による後勝ち再登録

DR 実施時間 14:00〜16:00 の 5 時間前〜2 時間前（= 09:00〜12:00 UTC を JST に読み替え）の 6 コマを再 POST して当日調整値で上書き。

リクエスト:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "baselines": [
    { "start_time": "2026-05-15T00:00:00Z", "end_time": "2026-05-15T00:30:00Z", "baseline_kw": 1510.0, "method_note": "High 4 of 5 (adj)" },
    { "start_time": "2026-05-15T00:30:00Z", "end_time": "2026-05-15T01:00:00Z", "baseline_kw": 1495.0, "method_note": "High 4 of 5 (adj)" }
  ]
}
```

レスポンス:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "registered": [
    { "start_time": "2026-05-15T00:00:00Z", "end_time": "2026-05-15T00:30:00Z", "baseline_kw": 1510.0, "action": "overwritten" },
    { "start_time": "2026-05-15T00:30:00Z", "end_time": "2026-05-15T01:00:00Z", "baseline_kw": 1495.0, "action": "overwritten" }
  ],
  "timestamp": "2026-05-15T08:00:00Z"
}
```

#### B.6.3 GET `/baseline`

リクエスト:

```
GET /baseline?start_time=2026-05-15T00:00:00Z&end_time=2026-05-15T02:00:00Z
```

レスポンス:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "baselines": [
    { "start_time": "2026-05-15T00:00:00Z", "end_time": "2026-05-15T00:30:00Z", "baseline_kw": 1510.0, "method_note": "High 4 of 5 (adj)", "registered_at": "2026-05-15T08:00:00Z" },
    { "start_time": "2026-05-15T00:30:00Z", "end_time": "2026-05-15T01:00:00Z", "baseline_kw": 1495.0, "method_note": "High 4 of 5 (adj)", "registered_at": "2026-05-15T08:00:00Z" },
    { "start_time": "2026-05-15T01:00:00Z", "end_time": "2026-05-15T01:30:00Z", "baseline_kw": 1440.0, "method_note": "High 4 of 5",       "registered_at": "2026-05-14T12:00:00Z" }
  ],
  "timestamp": "2026-05-15T08:30:00Z"
}
```

> `2026-05-15T01:30:00Z` 以降のスロットは未登録のためレスポンスに含まれない。クライアントは欠損として扱う。

#### B.6.4 400 `baseline_unaligned`

リクエスト（`start_time` が 15 分境界）:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "baselines": [
    { "start_time": "2026-05-15T00:15:00Z", "end_time": "2026-05-15T00:45:00Z", "baseline_kw": 1500.0 }
  ]
}
```

レスポンス:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "error": {
    "code": 400,
    "message": "Baseline timestamps must be aligned to 30-minute boundaries",
    "details": "start_time and end_time must fall on 00 or 30 minute boundaries (UTC), and end_time - start_time must equal 30 minutes",
    "error_type": "baseline_unaligned",
    "parameter": "baselines[0].start_time",
    "received_value": "2026-05-15T00:15:00Z"
  },
  "timestamp": "2026-05-15T08:30:00Z"
}
```

#### B.6.5 422 `baseline_locked_after_dr`

前日（2026-05-14）に完了済の DR スロットに対し、後日ベースライン値を遡及修正しようとした場合:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "error": {
    "code": 422,
    "message": "Baseline locked after DR execution",
    "details": "Baseline values for slots covered by completed DR schedules cannot be modified to protect settlement integrity",
    "error_type": "baseline_locked_after_dr",
    "parameter": "baselines[0].start_time",
    "received_value": "2026-05-14T05:00:00Z"
  },
  "timestamp": "2026-05-15T08:30:00Z"
}
```

### B.7 `/measurements/active_power`

> リクエスト形式は全リソース種別で共通です（後述）。レスポンスは `components[]` 構成に応じて返却フィールドが変動します。

> **サンプル中の `data[]` 要素数について**: 以下の各サンプルは紙面の都合で 1〜数要素のみ示しています。実運用では `(end_time - start_time) / interval_seconds` 個の要素が返却されます（例: 24 時間 × 60 秒間隔 = 1,440 要素、上限 30,000 要素）。タイムスタンプは `interval_seconds` 間隔で連続するのが原則ですが、欠損時刻は省略されます（[§9.7 取得最大データ件数](ems-openapi-v2.md#97-瞬時電力履歴-measurementsactive_power) 参照）。

#### B.7.1 蓄電所（battery）

リクエスト:

```json
{
  "request_id": "report_req_001",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-13T00:00:00Z",
  "interval_seconds": 60
}
```

レスポンス（`data[]` は紙面の都合で先頭3件のみ表示。実際は 1,440 要素返却）:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "request_id": "report_req_001",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-13T00:00:00Z",
  "interval_seconds": 60,
  "data": [
    {
      "current_kw": -1485.2,
      "baseline_kw": 0.0,
      "delta_kw": -1485.2,
      "dispatched_delta_kw": -1500.0,
      "soc": 62,
      "actual_frequency": 50.0,
      "output_control_limit": 100,
      "timestamp": "2025-06-12T00:00:00Z"
    },
    {
      "current_kw": -1490.5,
      "baseline_kw": 0.0,
      "delta_kw": -1490.5,
      "dispatched_delta_kw": -1500.0,
      "soc": 60,
      "actual_frequency": 49.98,
      "output_control_limit": 100,
      "timestamp": "2025-06-12T00:01:00Z"
    },
    {
      "current_kw": -1480.0,
      "baseline_kw": 0.0,
      "delta_kw": -1480.0,
      "dispatched_delta_kw": -1500.0,
      "soc": 58,
      "actual_frequency": 50.02,
      "output_control_limit": 100,
      "timestamp": "2025-06-12T00:02:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.7.2 発電所（generator、PV）

リクエスト:

```json
{
  "request_id": "report_req_002",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-13T00:00:00Z",
  "interval_seconds": 300
}
```

レスポンス（`data[]` は紙面の都合で先頭3件のみ表示）:

```json
{
  "ems_id": "b2c3d4e5f6789012345678901234abcd",
  "request_id": "report_req_002",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-13T00:00:00Z",
  "interval_seconds": 300,
  "data": [
    {
      "current_kw": -1230.5,
      "baseline_kw": -1500.0,
      "delta_kw": 269.5,
      "dispatched_delta_kw": 270.0,
      "output_control_limit": 100,
      "irradiance_w_m2": 720,
      "actual_frequency": 50.0,
      "timestamp": "2025-06-12T12:00:00Z"
    },
    {
      "current_kw": -1245.0,
      "baseline_kw": -1500.0,
      "delta_kw": 255.0,
      "dispatched_delta_kw": 270.0,
      "output_control_limit": 100,
      "irradiance_w_m2": 730,
      "actual_frequency": 50.01,
      "timestamp": "2025-06-12T12:05:00Z"
    },
    {
      "current_kw": -1210.0,
      "baseline_kw": -1500.0,
      "delta_kw": 290.0,
      "dispatched_delta_kw": 270.0,
      "output_control_limit": 100,
      "irradiance_w_m2": 715,
      "actual_frequency": 49.99,
      "timestamp": "2025-06-12T12:10:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

> **generator の `delta_kw` 解釈**: `baseline_kw: -1500`（計画発電 1500kW 送電）に対し `current_kw: -1230.5`（実発電 1230.5kW 送電）。`delta_kw = current_kw - baseline_kw = +269.5`（発電抑制方向）。市場応札（`rr` 等）の調整指令量と整合する。

#### B.7.3 火力発電所（generator、thermal、FCR応動中）

LNG 火力発電所が `sku: "fcr"` で約定中、周波数偏差に応じて自動応動している例。

リクエスト:

```json
{
  "request_id": "report_req_002a",
  "start_time": "2025-06-13T10:30:00Z",
  "end_time": "2025-06-13T10:33:00Z",
  "interval_seconds": 60
}
```

レスポンス:

```json
{
  "ems_id": "a2b3c4d5e6f7890123456789abcdef01",
  "request_id": "report_req_002a",
  "start_time": "2025-06-13T10:30:00Z",
  "end_time": "2025-06-13T10:33:00Z",
  "interval_seconds": 60,
  "data": [
    {
      "current_kw": -100200.0,
      "baseline_kw": -100000.0,
      "fcr_response_kw": 30000.0,
      "active_sku": "fcr",
      "output_control_limit": 100,
      "actual_frequency": 49.98,
      "timestamp": "2025-06-13T10:30:00Z"
    },
    {
      "current_kw": -99500.0,
      "baseline_kw": -100000.0,
      "fcr_response_kw": 30000.0,
      "active_sku": "fcr",
      "output_control_limit": 100,
      "actual_frequency": 50.04,
      "timestamp": "2025-06-13T10:31:00Z"
    },
    {
      "current_kw": -100300.0,
      "baseline_kw": -100000.0,
      "fcr_response_kw": 30000.0,
      "active_sku": "fcr",
      "output_control_limit": 100,
      "actual_frequency": 49.97,
      "timestamp": "2025-06-13T10:32:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:33:00Z"
}
```

> **解釈**: 計画発電量 100,000 kW（baseline_kw: -100000）に対し、周波数偏差に追従して ±300 kW 以内で増減（応動レンジ ±30,000 kW のごく一部を使用）。FCR は単方向Δでなく `fcr_response_kw` で約定容量を表現。

#### B.7.4 揚水発電所（generator、pumped_storage、ポンプ運転）

ポンプ運転で系統から受電している例（夜間）。

リクエスト:

```json
{
  "request_id": "report_req_002b",
  "start_time": "2025-06-13T03:00:00Z",
  "end_time": "2025-06-13T03:03:00Z",
  "interval_seconds": 60
}
```

レスポンス:

```json
{
  "ems_id": "b3c4d5e6f7890123456789abcdef0123",
  "request_id": "report_req_002b",
  "start_time": "2025-06-13T03:00:00Z",
  "end_time": "2025-06-13T03:03:00Z",
  "interval_seconds": 60,
  "data": [
    {
      "current_kw": 250000.0,
      "baseline_kw": 250000.0,
      "delta_kw": 0.0,
      "output_control_limit": 100,
      "actual_frequency": 50.0,
      "timestamp": "2025-06-13T03:00:00Z"
    },
    {
      "current_kw": 250000.0,
      "baseline_kw": 250000.0,
      "delta_kw": 0.0,
      "output_control_limit": 100,
      "actual_frequency": 50.0,
      "timestamp": "2025-06-13T03:01:00Z"
    },
    {
      "current_kw": 250000.0,
      "baseline_kw": 250000.0,
      "delta_kw": 0.0,
      "output_control_limit": 100,
      "actual_frequency": 50.0,
      "timestamp": "2025-06-13T03:02:00Z"
    }
  ],
  "timestamp": "2025-06-13T03:03:00Z"
}
```

> **解釈**: ポンプ運転計画通り `current_kw: +250000`（受電方向）。`delta_kw: 0`（ベースライン通り、非調整時間帯）。揚水発電所は `current_kw` が正負両方を取る稀有な generator。

#### B.7.5 需要家（consumer、DR応動中）

リクエスト:

```json
{
  "request_id": "report_req_003",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-13T00:00:00Z",
  "interval_seconds": 60
}
```

レスポンス（`data[]` は紙面の都合で先頭3件のみ表示）:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "request_id": "report_req_003",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-13T00:00:00Z",
  "interval_seconds": 60,
  "data": [
    {
      "current_kw": 850.2,
      "baseline_kw": 1000.0,
      "delta_kw": -149.8,
      "dispatched_delta_kw": -200.0,
      "dr_active": 1,
      "dr_target_reduction_kw": 200.0,
      "dr_actual_reduction_kw": 149.8,
      "active_sku": "frr",
      "actual_frequency": 50.0,
      "timestamp": "2025-06-12T14:00:00Z"
    },
    {
      "current_kw": 825.5,
      "baseline_kw": 1000.0,
      "delta_kw": -174.5,
      "dispatched_delta_kw": -200.0,
      "dr_active": 1,
      "dr_target_reduction_kw": 200.0,
      "dr_actual_reduction_kw": 174.5,
      "active_sku": "frr",
      "actual_frequency": 50.0,
      "timestamp": "2025-06-12T14:01:00Z"
    },
    {
      "current_kw": 808.0,
      "baseline_kw": 1000.0,
      "delta_kw": -192.0,
      "dispatched_delta_kw": -200.0,
      "dr_active": 1,
      "dr_target_reduction_kw": 200.0,
      "dr_actual_reduction_kw": 192.0,
      "active_sku": "frr",
      "actual_frequency": 50.0,
      "timestamp": "2025-06-12T14:02:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```


#### B.7.6 複数 component サイト（PV+battery+負荷）

リクエスト:

```json
{
  "request_id": "report_req_004",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-13T00:00:00Z",
  "interval_seconds": 60
}
```

レスポンス:

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "request_id": "report_req_004",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-13T00:00:00Z",
  "interval_seconds": 60,
  "data": [
    {
      "current_kw": 350.5,
      "baseline_kw": 0.0,
      "active_sku": null,
      "actual_frequency": 50.0,
      "components": [
        { "component_id": "bat-1", "component_type": "battery", "current_kw": -200.0, "soc": 60, "delta_kw": -200.0, "output_control_limit": 100 },
        { "component_id": "pv-1", "component_type": "generator", "current_kw": -800.0, "baseline_kw": -1000.0, "delta_kw": 200.0, "irradiance_w_m2": 720, "output_control_limit": 100 },
        { "component_id": "load-1", "component_type": "consumer", "current_kw": 1350.5, "dr_active": 0 }
      ],
      "timestamp": "2025-06-12T14:00:00Z"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

### B.8 `/measurements/energy`

> リクエスト形式は全リソース種別で共通です。レスポンスは `components[]` 構成に応じて返却フィールドが変動します。v2.2 以降、レスポンスは**常に `data[]` 形式**（`interval_seconds` 省略時は期間全体の 1 レコード、B.8.1〜B.8.9。指定時は粒度別の複数レコード、B.8.10）。

#### B.8.1 蓄電所（battery）

リクエスト:

```json
{
  "request_id": "report_req_001",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "request_id": "report_req_001",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z",
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-13T23:59:59Z",
      "import_kwh": 47850.0,
      "export_kwh": 42045.0
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.8.2 発電所 単機（FIP・ノンファーム）

リクエスト:

```json
{
  "request_id": "report_req_002",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "b2c3d4e5f6789012345678901234abcd",
  "request_id": "report_req_002",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z",
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-13T23:59:59Z",
      "import_kwh": 0.0,
      "export_kwh": 38420.0,
      "baseline_kwh": 38420.0,
      "fip_export_kwh": 38420.0,
      "curtailed_kwh": 1850.0,
      "fit_curtailed_kwh": 0.0,
      "non_firm_curtailed_kwh": 1600.0,
      "manual_curtailed_kwh": 250.0,
      "imbalance_kwh": -550.0
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.8.3 火力発電所（generator、thermal、需給調整市場応動）

LNG 火力 130MW 機。期間中に FCR 自立応動 + RR 計画指令への応動を実施。

リクエスト:

```json
{
  "request_id": "report_req_002a",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-30T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "a2b3c4d5e6f7890123456789abcdef01",
  "request_id": "report_req_002a",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-30T23:59:59Z",
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-30T23:59:59Z",
      "import_kwh": 850.0,
      "export_kwh": 78540000.0,
      "baseline_kwh": 78600000.0,
      "non_subsidized_export_kwh": 78540000.0,
      "curtailed_kwh": 0.0,
      "fit_curtailed_kwh": 0.0,
      "non_firm_curtailed_kwh": 0.0,
      "manual_curtailed_kwh": 0.0,
      "imbalance_kwh": -60000.0
    }
  ],
  "timestamp": "2025-07-01T10:30:00Z"
}
```

> **解釈**: 計画発電量 78,600 MWh に対し実発電 78,540 MWh、`imbalance_kwh: -60,000`（計画不足 60 MWh、ペナルティ対象）。`import_kwh: 850` は補機電力等の系統受電。火力電源は FIT/non_firm 制度の抑制対象外（curtailed 系全 0）。

#### B.8.4 揚水発電所（generator、pumped_storage）

200MW 揚水機。深夜にポンプ運転で受電、日中に発電して放電。

リクエスト:

```json
{
  "request_id": "report_req_002b",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-30T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "b3c4d5e6f7890123456789abcdef0123",
  "request_id": "report_req_002b",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-30T23:59:59Z",
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-30T23:59:59Z",
      "import_kwh": 75000000.0,
      "export_kwh": 56250000.0,
      "baseline_kwh": 56000000.0,
      "non_subsidized_export_kwh": 56250000.0,
      "curtailed_kwh": 0.0,
      "fit_curtailed_kwh": 0.0,
      "non_firm_curtailed_kwh": 0.0,
      "manual_curtailed_kwh": 0.0,
      "imbalance_kwh": 250000.0
    }
  ],
  "timestamp": "2025-07-01T10:30:00Z"
}
```

> **解釈**: ポンプ運転受電 75,000 MWh に対し発電送電 56,250 MWh（揚水効率 ≈ 75%）。揚水発電所のみ `import_kwh` が大きな値を取る。`imbalance_kwh: +250,000`（計画超過 250 MWh）。

#### B.8.5 需要家（consumer）

リクエスト:

```json
{
  "request_id": "report_req_003",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "request_id": "report_req_003",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z",
  "dr_dispatched_count": 12,
  "dr_total_dispatched_minutes": 480,
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-13T23:59:59Z",
      "import_kwh": 18420.0,
      "export_kwh": 0.0,
      "baseline_kwh": 22800.0,
      "dr_delivered_kwh": 4380.0
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.8.6 PV+battery+負荷（FIP、余剰送電あり）

リクエスト:

```json
{
  "request_id": "report_req_005",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "request_id": "report_req_005",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z",
  "dr_dispatched_count": 0,
  "dr_total_dispatched_minutes": 0,
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-13T23:59:59Z",
      "import_kwh": 5000.0,
      "export_kwh": 3200.0,
      "baseline_kwh": 0.0,
      "self_consumed_kwh": 1500.0,
      "grid_to_load_kwh": 4800.0,
      "imbalance_kwh": -150.0,
      "components": [
        {
          "component_id": "bat-1",
          "component_type": "battery",
          "import_kwh": 1700.0,
          "export_kwh": 1700.0,
          "from_generator_kwh": 1500.0,
          "from_grid_kwh": 200.0,
          "to_grid_kwh": 1200.0,
          "to_load_kwh": 500.0
        },
        {
          "component_id": "pv-1",
          "component_type": "generator",
          "import_kwh": 0.0,
          "export_kwh": 4500.0,
          "fip_export_kwh": 2000.0,
          "to_battery_kwh": 1500.0,
          "to_load_kwh": 1000.0,
          "curtailed_kwh": 200.0,
          "imbalance_kwh": -150.0
        },
        {
          "component_id": "load-1",
          "component_type": "consumer",
          "import_kwh": 6300.0,
          "export_kwh": 0.0,
          "baseline_kwh": 0.0,
          "consumption_kwh": 6300.0,
          "dr_delivered_kwh": 0.0
        }
      ]
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.8.7 PV+battery（FIP・卒FIT 移行サイト想定）

リクエスト:

```json
{
  "request_id": "report_req_006",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "e5f6789012345678901234abcdef0123",
  "request_id": "report_req_006",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z",
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-13T23:59:59Z",
      "import_kwh": 50.0,
      "export_kwh": 8500.0,
      "baseline_kwh": 0.0,
      "self_consumed_kwh": 0.0,
      "imbalance_kwh": -120.0,
      "components": [
        {
          "component_id": "pv-1",
          "component_type": "generator",
          "import_kwh": 0.0,
          "export_kwh": 7000.0,
          "fip_export_kwh": 5000.0,
          "to_battery_kwh": 2000.0,
          "to_load_kwh": 0.0,
          "curtailed_kwh": 250.0,
          "imbalance_kwh": -120.0
        },
        {
          "component_id": "bat-1",
          "component_type": "battery",
          "import_kwh": 2050.0,
          "export_kwh": 3500.0,
          "from_generator_kwh": 2000.0,
          "from_grid_kwh": 50.0,
          "to_grid_kwh": 3500.0,
          "to_load_kwh": 0.0
        }
      ]
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.8.8 工場+battery（需給調整双方向、逆潮流不可）

リクエスト:

```json
{
  "request_id": "report_req_008",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "f1a2c3d4e5f6789012345678901234ab",
  "request_id": "report_req_008",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z",
  "dr_dispatched_count": 5,
  "dr_total_dispatched_minutes": 150,
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-13T23:59:59Z",
      "import_kwh": 38400.0,
      "export_kwh": 0.0,
      "baseline_kwh": 39000.0,
      "self_consumed_kwh": 2000.0,
      "components": [
        {
          "component_id": "load-1",
          "component_type": "consumer",
          "import_kwh": 38600.0,
          "export_kwh": 0.0,
          "baseline_kwh": 39000.0,
          "dr_delivered_kwh": 400.0
        },
        {
          "component_id": "bat-1",
          "component_type": "battery",
          "import_kwh": 1800.0,
          "export_kwh": 2000.0,
          "from_generator_kwh": 0.0,
          "from_grid_kwh": 1800.0,
          "to_grid_kwh": 0.0,
          "to_load_kwh": 2000.0
        }
      ]
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.8.9 単独 FIT-PV（battery 併設不可、generator 単機）

蓄電池併設できない FIT-PV は **`components: [{ component_type: "generator", generator_kind: "pv", ... }]`** の単 component サイトで表現します（batter component を含まない）。

リクエスト:

```json
{
  "request_id": "report_req_007",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z"
}
```

レスポンス:

```json
{
  "ems_id": "f6789012345678901234abcdef012345",
  "request_id": "report_req_007",
  "start_time": "2025-06-01T00:00:00Z",
  "end_time": "2025-06-13T23:59:59Z",
  "data": [
    {
      "start_time": "2025-06-01T00:00:00Z",
      "end_time": "2025-06-13T23:59:59Z",
      "import_kwh": 0.0,
      "export_kwh": 7000.0,
      "baseline_kwh": 0.0,
      "fit_export_kwh": 7000.0,
      "curtailed_kwh": 250.0
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

> FIT-PV では `export_kwh ≡ fit_export_kwh`（battery 経由がないため一致）。`balancing_responsible: false` のため `imbalance_kwh` は返却されません。

#### B.8.10 コマ別時系列取得（interval_seconds: 1800）

B.8.6 と同一サイト（PV+battery+負荷、FIP）を 30 分コマ粒度で取得する例。

リクエスト:

```json
{
  "request_id": "report_req_010",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-12T01:00:00Z",
  "interval_seconds": 1800
}
```

レスポンス:

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "request_id": "report_req_010",
  "start_time": "2025-06-12T00:00:00Z",
  "end_time": "2025-06-12T01:00:00Z",
  "interval_seconds": 1800,
  "dr_dispatched_count": 0,
  "dr_total_dispatched_minutes": 0,
  "data": [
    {
      "start_time": "2025-06-12T00:00:00Z",
      "end_time": "2025-06-12T00:30:00Z",
      "import_kwh": 8.5,
      "export_kwh": 120.0,
      "baseline_kwh": 0.0,
      "self_consumed_kwh": 45.0,
      "grid_to_load_kwh": 8.0,
      "imbalance_kwh": -2.5,
      "components": [
        {
          "component_id": "bat-1",
          "component_type": "battery",
          "import_kwh": 40.5,
          "export_kwh": 55.0,
          "from_generator_kwh": 40.0,
          "from_grid_kwh": 0.5,
          "to_grid_kwh": 40.0,
          "to_load_kwh": 15.0
        },
        {
          "component_id": "pv-1",
          "component_type": "generator",
          "import_kwh": 0.0,
          "export_kwh": 150.0,
          "fip_export_kwh": 80.0,
          "to_battery_kwh": 40.0,
          "to_load_kwh": 30.0,
          "curtailed_kwh": 0.0,
          "imbalance_kwh": -2.5
        },
        {
          "component_id": "load-1",
          "component_type": "consumer",
          "import_kwh": 53.0,
          "export_kwh": 0.0,
          "baseline_kwh": 0.0,
          "consumption_kwh": 53.0,
          "dr_delivered_kwh": 0.0
        }
      ]
    },
    {
      "start_time": "2025-06-12T00:30:00Z",
      "end_time": "2025-06-12T01:00:00Z",
      "import_kwh": 6.0,
      "export_kwh": 135.5,
      "baseline_kwh": 0.0,
      "self_consumed_kwh": 48.0,
      "grid_to_load_kwh": 5.5,
      "imbalance_kwh": 1.8,
      "components": [
        {
          "component_id": "bat-1",
          "component_type": "battery",
          "import_kwh": 45.5,
          "export_kwh": 58.0,
          "from_generator_kwh": 45.0,
          "from_grid_kwh": 0.5,
          "to_grid_kwh": 42.0,
          "to_load_kwh": 16.0
        },
        {
          "component_id": "pv-1",
          "component_type": "generator",
          "import_kwh": 0.0,
          "export_kwh": 170.5,
          "fip_export_kwh": 93.5,
          "to_battery_kwh": 45.0,
          "to_load_kwh": 32.0,
          "curtailed_kwh": 0.0,
          "imbalance_kwh": 1.8
        },
        {
          "component_id": "load-1",
          "component_type": "consumer",
          "import_kwh": 53.5,
          "export_kwh": 0.0,
          "baseline_kwh": 0.0,
          "consumption_kwh": 53.5,
          "dr_delivered_kwh": 0.0
        }
      ]
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

> `dr_dispatched_count` / `dr_total_dispatched_minutes` は期間サマリとしてトップレベルのみに返却され、`data[]` 各レコードには含まれません。各 kWh フィールドは、同一期間を `interval_seconds` 省略（期間全体 1 レコード）で取得した値と `Σ data[]` が一致します。

### B.9 `/serviceplan`

> リクエストは `GET /v2/ems/{id}/serviceplan?start_time=...`（共通、`start_time` 省略時は現在時刻）。レスポンスは `components[]` 構成に応じて返却フィールドが変動します。

#### B.9.1 蓄電所

リクエスト:

```
GET /v2/ems/{id}/serviceplan?start_time=2025-06-13T00:00:00Z
Authorization: Bearer {access_token}
```

レスポンス:

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "start_time": "2025-06-13T00:00:00Z",
  "plans": [
    {
      "start_time": "2025-06-13T00:00:00Z",
      "end_time": "2025-06-13T00:30:00Z",
      "status": 0,
      "baseline_kw": 0.0,
      "scheduled_delta_kw": null,
      "scheduled_sku": null
    },
    {
      "start_time": "2025-06-13T14:00:00Z",
      "end_time": "2025-06-13T14:30:00Z",
      "status": 0,
      "baseline_kw": 0.0,
      "scheduled_delta_kw": -1500.0,
      "scheduled_sku": "frr"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.9.2 発電所（出力制御予定込）

```json
{
  "ems_id": "b2c3d4e5f6789012345678901234abcd",
  "start_time": "2025-06-13T00:00:00Z",
  "plans": [
    {
      "start_time": "2025-06-13T13:00:00Z",
      "end_time": "2025-06-13T13:30:00Z",
      "status": 0,
      "baseline_kw": -1500.0,
      "scheduled_delta_kw": 700.0,
      "scheduled_sku": "rr-fit"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.9.3 需要家（DR予定込）

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "start_time": "2025-06-13T00:00:00Z",
  "plans": [
    {
      "start_time": "2025-06-13T14:00:00Z",
      "end_time": "2025-06-13T14:30:00Z",
      "status": 0,
      "baseline_kw": 1000.0,
      "scheduled_delta_kw": -200.0,
      "scheduled_sku": "frr"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.9.4 複数 component サイト

```json
{
  "ems_id": "d4e5f6789012345678901234abcdef01",
  "start_time": "2025-06-13T00:00:00Z",
  "plans": [
    {
      "start_time": "2025-06-13T14:00:00Z",
      "end_time": "2025-06-13T14:30:00Z",
      "status": 0,
      "baseline_kw": 0.0,
      "scheduled_site_kw": -500.0,
      "scheduled_sku": "frr"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

#### B.9.5 蓄電池 FCR スケジュール予定込

長時間 FCR 応動が登録されている場合、該当する 30 分スロットすべてで `scheduled_fcr_response_kw` が非 null となる。

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "start_time": "2025-06-13T14:00:00Z",
  "plans": [
    {
      "start_time": "2025-06-13T14:00:00Z",
      "end_time": "2025-06-13T14:30:00Z",
      "status": 0,
      "baseline_kw": 0.0,
      "scheduled_delta_kw": null,
      "scheduled_fcr_response_kw": 1999.0,
      "scheduled_sku": "fcr"
    },
    {
      "start_time": "2025-06-13T14:30:00Z",
      "end_time": "2025-06-13T15:00:00Z",
      "status": 0,
      "baseline_kw": 0.0,
      "scheduled_delta_kw": null,
      "scheduled_fcr_response_kw": 1999.0,
      "scheduled_sku": "fcr"
    }
  ],
  "timestamp": "2025-06-13T10:30:00Z"
}
```

> **解釈**: 14:00〜16:00 の FCR スケジュールが登録されている場合、対応する 4 つの 30 分スロットすべてで `scheduled_fcr_response_kw: 1999, scheduled_sku: "fcr"` が出現（紙面の都合で先頭 2 スロットのみ表示）。`scheduled_delta_kw` は null。

### B.10 エラーレスポンス

#### B.10.1 401 認証失敗

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 401,
    "message": "Authentication failed",
    "details": "Invalid or expired refresh token",
    "error_type": "authentication_error"
  },
  "timestamp": "2026-05-01T10:30:00Z"
}
```

#### B.10.2 498 Access Token 期限切れ

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 498,
    "message": "JWT token expired",
    "details": "Access token expired at 2026-05-01T09:30:00Z, current time is 2026-05-01T10:30:00Z",
    "error_type": "token_expired",
    "expires_at": "2026-05-01T09:30:00Z",
    "required_action": "POST /auth/refresh"
  },
  "timestamp": "2026-05-01T10:30:00Z"
}
```

#### B.10.3 403 アクセス権限不足

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 403,
    "message": "Access denied",
    "details": "Token does not have permission for this EMS ID",
    "error_type": "permission_denied"
  },
  "timestamp": "2026-05-01T10:30:00Z"
}
```

#### B.10.4 422 ベースライン未登録（DR 配信時）

```json
{
  "ems_id": "c3d4e5f6789012345678901234abcdef",
  "error": {
    "code": 422,
    "message": "Baseline not configured for DR slot",
    "details": "30-minute baseline value is not registered for the DR slot starting 2026-05-15T05:00:00Z. Register baseline values via POST /baseline before scheduling negawatt-spot",
    "error_type": "baseline_not_configured",
    "required_action": "POST /baseline",
    "start_time": "2026-05-15T05:00:00Z",
    "end_time": "2026-05-15T05:30:00Z"
  },
  "timestamp": "2026-05-15T04:55:00Z"
}
```

#### B.10.5 422 逆潮流規制違反

```json
{
  "ems_id": "f1a2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 422,
    "message": "Reverse power flow is forbidden",
    "details": "Site contains consumer component and is connected as a demand-side facility. Grid export is not permitted.",
    "error_type": "reverse_power_flow_forbidden",
    "parameter": "site_kw",
    "received_value": -300,
    "valid_range": "0 to site_import_max_kw"
  },
  "timestamp": "2026-05-01T10:30:00Z"
}
```

#### B.10.6 409 冪等性キー競合

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 409,
    "message": "Idempotency key conflict",
    "details": "Request body differs from the original request with the same Idempotency-Key",
    "error_type": "idempotency_conflict",
    "idempotency_key": "req-2026-05-01-abc123",
    "required_action": "Use a new Idempotency-Key or send the original request body"
  },
  "timestamp": "2026-05-01T10:30:00Z"
}
```

#### B.10.7 429 レートリミット超過

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 429,
    "message": "Rate limit exceeded",
    "details": "API call limit exceeded",
    "error_type": "rate_limit_exceeded",
    "limit": 1000,
    "remaining": 0,
    "reset_time": "2026-05-01T16:00:00Z",
    "retry_after": 1800
  },
  "timestamp": "2026-05-01T15:30:00Z"
}
```

#### B.10.8 410 履歴期間超過

```json
{
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 410,
    "message": "Data retrieval period exceeds limit",
    "details": "Requested period 45 days exceeds maximum 31 days",
    "parameter": "end_time - start_time",
    "valid_range": "1 second to 31 days"
  },
  "timestamp": "2026-05-01T10:30:00Z"
}
```

---
