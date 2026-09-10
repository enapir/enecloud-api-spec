# VPP API v1 サンプル集

**対象バージョン**: 1.4
**本編**: [ENECloud EMS VPP API 仕様説明書](vpp-api-v1.md)

> 本書は [VPP API 仕様説明書](vpp-api-v1.md) のリクエスト／レスポンスのサンプル集です。
> フィールドの定義・制約・バリデーションは本編の該当節を参照してください。

---

## B.1 メンバー管理 `/members`

### B.1.1 GET `/members`（一覧取得）

**メンバーが登録済みの場合**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "members": [
    {
      "ems_id": "a1b2c3d4e5f6789012345678901234ab",
      "label": "蓄電所A",
      "resource_type": "battery",
      "allocation_weight": 100,
      "registered_at": "2026-03-01T09:00:00Z"
    },
    {
      "ems_id": "b2c3d4e5f6789012345678901234abcd",
      "label": "需要家B",
      "resource_type": "consumer",
      "allocation_weight": 100,
      "registered_at": "2026-03-05T12:00:00Z"
    },
    {
      "ems_id": "c3d4e5f6789012345678901234abcdef",
      "label": "蓄電所C",
      "resource_type": "battery",
      "allocation_weight": 100,
      "registered_at": "2026-03-10T09:00:00Z"
    }
  ],
  "total_count": 3,
  "timestamp": "2026-04-04T10:00:00Z"
}
```

**メンバーが0台の場合（VPP作成直後など）**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "members": [],
  "total_count": 0,
  "timestamp": "2026-04-04T10:00:00Z"
}
```

> メンバーが0台でも200 OKを返す。VPP IDが存在しない場合は404エラー。

### B.1.2 POST `/members`（登録）

**成功時（200 OK）**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "message": "EMS registered successfully",
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "label": "蓄電所A",
  "resource_type": "battery",
  "allocation_weight": 100,
  "registered_at": "2026-04-04T10:00:00Z",
  "timestamp": "2026-04-04T10:00:00Z"
}
```

### B.1.3 POST `/members/{ems_id}`（パラメータ更新）

**成功時（200 OK）**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "message": "Member updated successfully",
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "label": "蓄電所A（更新）",
  "resource_type": "battery",
  "allocation_weight": 150,
  "timestamp": "2026-04-04T11:00:00Z"
}
```

### B.1.4 DELETE `/members/{ems_id}`（削除）

**成功時（200 OK）**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "message": "EMS removed successfully",
  "ems_id": "a1b2c3d4e5f6789012345678901234ab",
  "timestamp": "2026-04-04T10:00:00Z"
}
```

## B.2 リアルタイム状態取得 `/status` `/status/details`

### B.2.1 `/status`（概要）

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "status": 0,                           // 0: in service, 9: out of service
  "fcr_active": 0,                       // 配下に FCR 自立運転中の EMS が1台以上存在
  "dr_active": 0,                        // 配下に DR 削減モード実行中の EMS が1台以上存在
  "import_energy_available": 5690.0,   // [kWh] battery かつ稼働中のみ合算
  "export_energy_available": 8198.0,   // [kWh] battery かつ稼働中のみ合算
  "import_power_available": 75.0,    // [kW] 稼働中のみ合算
  "export_power_available": 90.0,    // [kW] 稼働中のみ合算
  "current_kw": -29.4,             // [kW] 全体現在電力
  "baseline_kw": 0.0,              // [kW] 全体ベースライン（稼働中合算）
  "delta_kw": -29.4,               // [kW] 全体実測差分 = current_kw - baseline_kw
  "dispatched_delta_kw": -49.0,    // [kW] VPP全体の直近指令Δ電力合計
  "has_warning": 1,                      // 配下に1台でも警告メンバーが存在
  "members": [
    {
      "ems_id": "a1b2c3d4e5f6789012345678901234ab",
      "status": 0,
      "fcr_active": 0,
      "current_kw": -29.4,
      "baseline_kw": 0.0,
      "delta_kw": -29.4,
      "dispatched_delta_kw": -24.5,
      "import_energy_available": 2090.0,
      "export_energy_available": 4598.0,
      "import_power_available": 30.0,
      "export_power_available": 45.0,
      "output_control_limit": 100,
      "has_warning": 0,
      "measure_timestamp": "2026-04-04T10:29:55Z"
    },
    {
      "ems_id": "b2c3d4e5f6789012345678901234abcd",
      "status": 9,
      "fcr_active": 0,
      "dr_active": 0,
      "current_kw": 0.0,
      "baseline_kw": 30.0,
      "delta_kw": -30.0,
      "dispatched_delta_kw": null,
      "import_power_available": 0.0,
      "export_power_available": 0.0,
      "has_warning": 1,
      "measure_timestamp": "2026-04-04T10:29:58Z"
    },
    {
      "ems_id": "c3d4e5f6789012345678901234abcdef",
      "status": 0,
      "fcr_active": 0,
      "current_kw": 0.0,
      "baseline_kw": 0.0,
      "delta_kw": 0.0,
      "dispatched_delta_kw": -24.5,
      "import_energy_available": 3600.0,
      "export_energy_available": 3600.0,
      "import_power_available": 45.0,
      "export_power_available": 45.0,
      "output_control_limit": 100,
      "has_warning": 0,
      "measure_timestamp": "2026-04-04T10:29:56Z"
    }
  ],
  "timestamp": "2026-04-04T10:30:00Z"
}
```

> 概要は `resource_type` を返却しないため、種別固有項目（`import_*` / `export_*` / `dr_active` 等）の有無はメンバーごとに変動する（クライアントは事前取得した `resource_type` で解釈）。

### B.2.2 `/status/details`（詳細）

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "status": 0,                           // 0: in service, 9: out of service
  "active_sku": null,
  "has_warning": 1,
  "active_power": {
    "current_kw": -29.4,           // [kW] 全体現在電力（全resource_type・稼働中のみ合算）
    "baseline_kw": 0.0,            // [kW] 全体ベースライン（稼働中のみ）
    "delta_kw": -29.4,             // [kW] 全体実測差分 = current_kw - baseline_kw
    "dispatched_delta_kw": -49.0,  // [kW] VPP全体の直近指令Δ電力合計
    "fcr_active": 0,                     // 配下に FCR 自立運転中の EMS が1台以上存在
    "fcr_response_kw": null              // [kW] VPP 全体の FCR 応動可能量、active_sku=fcr または active_sku=compound で FCR を含む場合に非null
  },
  "capacity": {
    "import_energy_available": 5690.0,   // [kWh] battery かつ稼働中のみ合算
    "export_energy_available": 8198.0,   // [kWh] battery かつ稼働中のみ合算
    "import_power_available": 75.0,    // [kW] 稼働中のみ合算
    "export_power_available": 90.0     // [kW] 稼働中のみ合算
  },
  "resource_state": {
    "dr_active": 0                       // 配下に DR 削減モード実行中の EMS が1台以上存在
  },
  "members": [
    {
      "ems_id": "a1b2c3d4e5f6789012345678901234ab",
      "label": "蓄電所A",
      "allocation_weight": 100,
      "status": 0,
      "has_warning": 0,
      "active_sku": null,
      "last_dispatch_status": "dispatched",
      "measure_timestamp": "2026-04-04T10:29:55Z",
      "active_power": {
        "current_kw": -29.4,
        "baseline_kw": 0.0,
        "delta_kw": -29.4,
        "dispatched_delta_kw": -24.5,
        "fcr_active": 0,
        "fcr_response_kw": null,
        "output_control_limit": 100,
        "output_control_reason": null
      },
      "capacity": {
        "import_energy_available": 2090.0,
        "export_energy_available": 4598.0,
        "import_power_available": 30.0,
        "export_power_available": 45.0
      },
      "resource_state": {
        "soc": 65
      }
    },
    {
      "ems_id": "b2c3d4e5f6789012345678901234abcd",
      "label": "需要家B",
      "allocation_weight": 100,
      "status": 9,
      "has_warning": 1,
      "active_sku": null,
      "last_dispatch_status": "skipped_out_of_service",
      "measure_timestamp": "2026-04-04T10:29:58Z",
      "active_power": {
        "current_kw": 0.0,
        "baseline_kw": 30.0,
        "delta_kw": -30.0,
        "dispatched_delta_kw": null,
        "fcr_active": 0,
        "fcr_response_kw": null,
        "output_control_limit": null,
        "output_control_reason": null
      },
      "capacity": {
        "import_power_available": 0.0
      },
      "resource_state": {
        "dr_active": 0,
        "dr_target_reduction_kw": null,
        "dr_actual_reduction_kw": null
      }
    },
    {
      "ems_id": "c3d4e5f6789012345678901234abcdef",
      "label": "蓄電所C",
      "allocation_weight": 100,
      "status": 0,
      "has_warning": 0,
      "active_sku": null,
      "last_dispatch_status": "dispatched",
      "measure_timestamp": "2026-04-04T10:29:56Z",
      "active_power": {
        "current_kw": 0.0,
        "baseline_kw": 0.0,
        "delta_kw": 0.0,
        "dispatched_delta_kw": -24.5,
        "fcr_active": 0,
        "fcr_response_kw": null,
        "output_control_limit": 100,
        "output_control_reason": null
      },
      "capacity": {
        "import_energy_available": 3600.0,
        "export_energy_available": 3600.0,
        "import_power_available": 45.0,
        "export_power_available": 45.0
      },
      "resource_state": {
        "soc": 80
      }
    }
  ],
  "timestamp": "2026-04-04T10:30:00Z"   // API応答時刻（ISO 8601形式）
}
```

## B.3 `/control/active_power`

**成功時（即座指示）**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "message": "Power control accepted. 1 member(s) out of service. Auto-redistributed.",
  "control_type": "immediate",
  "delta_kw": -49.0,
  "sku": "frr",
  "duration_minutes": 30,
  "uncovered_kw": 0.0,
  "members": [
    {
      "ems_id": "a1b2c3d4e5f6789012345678901234ab",
      "label": "蓄電所A",
      "allocation_weight": 100,
      "baseline_kw": 0.0,
      "delta_kw": -24.5,
      "dispatch_status": "dispatched"
    },
    {
      "ems_id": "b2c3d4e5f6789012345678901234abcd",
      "label": "需要家B",
      "allocation_weight": 100,
      "baseline_kw": 30.0,          // 決済・計量用途のため返す
      "delta_kw": null,             // スキップのためnull
      "dispatch_status": "skipped_out_of_service"
    },
    {
      "ems_id": "c3d4e5f6789012345678901234abcdef",
      "label": "蓄電所C",
      "allocation_weight": 100,
      "baseline_kw": 0.0,
      "delta_kw": -24.5,
      "dispatch_status": "dispatched"
    }
  ],
  "timestamp": "2026-04-04T10:30:00Z"
}
```

**成功時（スケジュール登録）**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "message": "Schedule registered successfully.",
  "control_type": "schedule",
  "delta_kw": -49.0,
  "sku": "rr",
  "schedule_id": "vsch_001",
  "start_time": "2026-04-04T14:00:00Z",
  "end_time": "2026-04-04T16:00:00Z",
  "uncovered_kw": 0.0,
  "members": [
    {
      "ems_id": "a1b2c3d4e5f6789012345678901234ab",
      "label": "蓄電所A",
      "allocation_weight": 100,
      "baseline_kw": 0.0,
      "delta_kw": -24.5,
      "dispatch_status": "pending"
    },
    {
      "ems_id": "b2c3d4e5f6789012345678901234abcd",
      "label": "需要家B",
      "allocation_weight": 100,
      "baseline_kw": 25.0,
      "delta_kw": null,
      "dispatch_status": "skipped_out_of_service"
    },
    {
      "ems_id": "c3d4e5f6789012345678901234abcdef",
      "label": "蓄電所C",
      "allocation_weight": 100,
      "baseline_kw": 0.0,
      "delta_kw": -24.5,
      "dispatch_status": "pending"
    }
  ],
  "timestamp": "2026-04-04T10:30:00Z"
}
```

> `dispatch_status: pending` のメンバーへの `delta_kw` および `uncovered_kw` は登録時点の計算値（予定値）。実行時に `in_service` 状態・`allocation_weight` を再評価して確定する。連系点目標電力（概念値）は `baseline_kw + delta_kw` でクライアント側が派生算出する。

**成功時（FCR スケジュール登録）**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "message": "FCR schedule registered successfully.",
  "control_type": "schedule",
  "delta_kw": null,
  "fcr_response_kw": 3000.0,
  "sku": "fcr",
  "schedule_id": "vsch_fcr_001",
  "start_time": "2026-04-04T14:00:00Z",
  "end_time": "2026-04-04T20:00:00Z",
  "uncovered_kw": 0.0,
  "members": [
    {
      "ems_id": "a1b2c3d4e5f6789012345678901234ab",
      "label": "蓄電所A",
      "allocation_weight": 100,
      "fcr_response_kw": 1500.0,
      "baseline_kw": 0.0,
      "delta_kw": null,
      "dispatch_status": "pending"
    },
    {
      "ems_id": "b2c3d4e5f6789012345678901234abcd",
      "label": "需要家B（fcr_capable: false）",
      "allocation_weight": 100,
      "fcr_response_kw": null,
      "baseline_kw": 30.0,
      "delta_kw": null,
      "dispatch_status": "skipped_incompatible"
    },
    {
      "ems_id": "c3d4e5f6789012345678901234abcdef",
      "label": "蓄電所C",
      "allocation_weight": 100,
      "fcr_response_kw": 1500.0,
      "baseline_kw": 0.0,
      "delta_kw": null,
      "dispatch_status": "pending"
    }
  ],
  "timestamp": "2026-04-04T10:30:00Z"
}
```

> **FCR の按分**: `fcr_response_kw: 3000` が `fcr_capable: true` の蓄電所A・蓄電所C（weight 100/100）に均等按分され、各 `fcr_response_kw: 1500`。`fcr_capable: false` の需要家Bは `skipped_incompatible`（FCR 応動不可）。

## B.4 有効電力スケジュール管理

### B.4.1 `/control/active_power/schedules`（一覧取得）

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "schedules": [
    {
      "schedule_id": "vsch_001",
      "control_type": "schedule",
      "delta_kw": -49.0,
      "sku": "rr",
      "start_time": "2026-04-04T14:00:00Z",
      "end_time": "2026-04-04T16:00:00Z",
      "created_at": "2026-04-04T10:30:00Z",
      "uncovered_kw": 0.0,
      "members": [
        {
          "ems_id": "a1b2c3d4e5f6789012345678901234ab",
          "label": "蓄電所A",
          "allocation_weight": 100,
          "baseline_kw": 0.0,
          "delta_kw": -24.5,
          "dispatch_status": "pending"
        },
        {
          "ems_id": "b2c3d4e5f6789012345678901234abcd",
          "label": "需要家B",
          "allocation_weight": 100,
          "baseline_kw": 25.0,
          "delta_kw": null,
          "dispatch_status": "skipped_out_of_service"
        },
        {
          "ems_id": "c3d4e5f6789012345678901234abcdef",
          "label": "蓄電所C",
          "allocation_weight": 100,
          "baseline_kw": 0.0,
          "delta_kw": -24.5,
          "dispatch_status": "pending"
        }
      ]
    }
  ],
  "timestamp": "2026-04-04T10:30:00Z"
}
```

### B.4.2 `/control/active_power/schedules`（削除）

**成功時（200 OK）**:

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "message": "Schedule deleted successfully",
  "schedule_id": "vsch_001",
  "timestamp": "2026-04-04T10:30:00Z"
}
```

## B.5 `/measurements/active_power`

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "request_id": "vpp_report_req_001",
  "start_time": "2026-04-04T00:00:00Z",
  "end_time": "2026-04-05T00:00:00Z",
  "interval_seconds": 60,
  "data": [
    {
      "timestamp": "2026-04-04T00:00:00Z",
      "current_kw": -49.0,
      "baseline_kw": 30.0,
      "delta_kw": -79.0,
      "dispatched_delta_kw": -73.5,
      "fcr_response_kw": null,
      "active_sku": "frr",
      "members": [
        {
          "ems_id": "a1b2c3d4e5f6789012345678901234ab",
          "current_kw": -24.5,
          "baseline_kw": 0.0,
          "delta_kw": -24.5,
          "dispatched_delta_kw": -24.5,
          "fcr_response_kw": null,
          "output_control_limit": 100,
          "soc": 65,
          "active_sku": "frr",
          "dr_active": null,
          "dr_target_reduction_kw": null,
          "dr_actual_reduction_kw": null,
          "irradiance_w_m2": null,
          "actual_frequency": 50.0
        },
        {
          "ems_id": "b2c3d4e5f6789012345678901234abcd",
          "current_kw": 5.5,
          "baseline_kw": 30.0,
          "delta_kw": -24.5,
          "dispatched_delta_kw": -24.5,
          "fcr_response_kw": null,
          "output_control_limit": null,
          "soc": null,
          "active_sku": "frr",
          "dr_active": 1,
          "dr_target_reduction_kw": 24.5,
          "dr_actual_reduction_kw": 24.5,
          "irradiance_w_m2": null,
          "actual_frequency": 50.0
        },
        {
          "ems_id": "c3d4e5f6789012345678901234abcdef",
          "current_kw": -30.0,
          "baseline_kw": 0.0,
          "delta_kw": -30.0,
          "dispatched_delta_kw": -24.5,
          "fcr_response_kw": null,
          "output_control_limit": 100,
          "soc": 72,
          "active_sku": "frr",
          "dr_active": null,
          "dr_target_reduction_kw": null,
          "dr_actual_reduction_kw": null,
          "irradiance_w_m2": null,
          "actual_frequency": 50.0
        }
      ]
    }
  ],
  "timestamp": "2026-04-05T10:30:00Z"
}
```

> **`data[]` 要素の top-level 集計値**: 各時刻における配下 `in_service` メンバーの `members[].current_kw` / `baseline_kw` / `delta_kw` / `dispatched_delta_kw` / `fcr_response_kw` の合算（`null` は除外）。`active_sku` は VPP レベルで応動中の SKU（全 `in_service` メンバーで一致する場合のみ当該値、不一致時は `"mixed"`、全メンバー `null` なら `null`）。
>
> **`actual_frequency` は VPP top-level に含まれない**: 系統周波数は合算が意味を成さないため、メンバー側（`members[].actual_frequency`）のみで返却する。同一系統上のメンバーは同じ値を観測するため、クライアントは任意メンバーの値を参照すればよい。物理 EMS API `/measurements/active_power` の `data[]` 要素と**同じフィールド構成** + `members[]` の追加（および `actual_frequency` のメンバー側のみ）が差分。

> **`current_kw` / `delta_kw` / `baseline_kw` の関係**: `current_kw` は連系点での実測絶対電力（受電+/送電-）、`baseline_kw` は基準電力、`delta_kw` は両者の差分（市場約定量＝連系点単方向Δ電力 = `current_kw - baseline_kw`、FCR以外で値あり、FCR時は `null`）。物理 EMS API [§4.2](ems-openapi-v2.md#42-電力フィールドの関係式) と同義。

## B.6 `/measurements/energy`

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "request_id": "vpp_energy_req_001",
  "start_time": "2026-04-01T00:00:00Z",
  "end_time": "2026-04-30T23:59:59Z",
  "dr_dispatched_count": 12,
  "dr_total_dispatched_minutes": 720,
  "data": [
    {
      "start_time": "2026-04-01T00:00:00Z",
      "end_time": "2026-04-30T23:59:59Z",
      "import_kwh": 177300.5,
      "export_kwh": 112150.3,
      "self_consumed_kwh": 24580.8,
      "dr_delivered_kwh": 1820.0,
      "curtailed_kwh": 480.0,
      "imbalance_kwh": -239.7,
      "members": [
        {
          "ems_id": "a1b2c3d4e5f6789012345678901234ab",
          "import_kwh": 35200.0,
          "export_kwh": 31840.0
        },
        {
          "ems_id": "b2c3d4e5f6789012345678901234abcd",
          "import_kwh": 92140.5,
          "export_kwh": 0.0,
          "baseline_kwh": 93960.5,
          "dr_delivered_kwh": 1820.0
        },
        {
          "ems_id": "c3d4e5f6789012345678901234abcdef",
          "import_kwh": 24960.0,
          "export_kwh": 22940.0
        },
        {
          "ems_id": "e5f6789012345678901234abcdef0123",
          "import_kwh": 0.0,
          "export_kwh": 57370.3,
          "baseline_kwh": -57610.0,
          "fip_export_kwh": 57370.3,
          "curtailed_kwh": 480.0,
          "imbalance_kwh": -239.7
        },
        {
          "ems_id": "d4e5f6789012345678901234abcdef01",
          "import_kwh": 25000.0,
          "export_kwh": 0.0,
          "baseline_kwh": 0.0,
          "self_consumed_kwh": 24580.8
        }
      ]
    }
  ],
  "timestamp": "2026-05-01T10:30:00Z"
}
```

> 上記は `interval_seconds` 省略時の例（**期間全体を 1 レコード**として `data[]` に格納）。

## B.7 エラーレスポンス

### B.7.1 バリデーションエラー（パラメータ範囲外）

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 400,
    "message": "Requested power exceeds total available",
    "details": "Requested -100.0 kW exceeds total discharge available 90.0 kW across 2 members",
    "error_type": "invalid_parameter",
    "parameter": "delta_kw",
    "received_value": -100.0,
    "valid_range": "-90.0 to 75.0"
  },
  "timestamp": "2026-04-04T10:30:00Z"
}
```

### B.7.2 レートリミット超過（429）

```json
{
  "vpp_id": "f1b2c3d4e5f6789012345678901234ab",
  "error": {
    "code": 429,
    "message": "Rate limit exceeded",
    "details": "Request limit of 1000 per hour exceeded. Try again after 2026-04-04T11:00:00Z.",
    "error_type": "rate_limit_exceeded",
    "limit": 1000,
    "remaining": 0,
    "reset_time": "2026-04-04T11:00:00Z",
    "retry_after": 900
  },
  "timestamp": "2026-04-04T10:45:00Z"
}
```

---
