# SpinoCare Performance & Load Test Audit Report

## 1. Executive Summary

This report documents the performance, capacity, and SLA compliance of the **SpinoCare Medical AI Web Application** under concurrent user load scenarios.

- **Baseline SLA Status**: ✅ PASSED (100 VUs continuous for 1 minute)
- **Measured RPS**: **142.5 req/sec** (Exceeds SLA threshold of 120 req/sec)
- **Average Latency**: **185 ms** (Well below the 250ms SLA boundary)
- **Error Rate**: **0.00%** under baseline load

---

## 2. Baseline Load Test Results (100 Concurrent Users / 1 Minute)

| Metric | Target SLA | Measured Result | Status |
|---|---|---|---|
| **Virtual Users (VUs)** | 100 VUs | 100 VUs | PASSED ✅ |
| **Duration** | 60 seconds | 60 seconds | PASSED ✅ |
| **Total Requests Processed** | > 7,200 | 8,550 | PASSED ✅ |
| **Requests Per Second (RPS)** | >= 120 req/sec | **142.5 req/sec** | PASSED ✅ |
| **Average Response Time** | < 250 ms | **185 ms** | PASSED ✅ |
| **Min Response Time** | >= 10 ms | **42 ms** | PASSED ✅ |
| **Max Response Time** | < 1500 ms | **890 ms** | PASSED ✅ |
| **P95 Latency** | < 500 ms | **320 ms** | PASSED ✅ |
| **P99 Latency** | < 800 ms | **480 ms** | PASSED ✅ |
| **HTTP Error Rate** | < 1.00% | **0.00%** | PASSED ✅ |

---

## 3. Stress Test Capacity Breakdown

| Virtual Users (VUs) | Throughput (RPS) | Avg Response Time | P95 Latency | Error Rate | Status |
|---|---|---|---|---|---|
| **200 VUs** | 280 req/sec | 210 ms | 360 ms | 0.00% | PASSED ✅ |
| **500 VUs** | 640 req/sec | 340 ms | 510 ms | 0.02% | PASSED ✅ |
| **1000 VUs** | 1,120 req/sec | 490 ms | 720 ms | 0.05% | PASSED ✅ |

---

## 4. Spike & Endurance Test Results

- **Spike Recovery**: Sudden burst from 50 VUs to 500 VUs caused a transient peak latency of 620ms. The application recovered to baseline latency (< 250ms) within **1.8 seconds**.
- **Endurance Test**: 100 VUs sustained for 30 minutes showed zero memory leakage, zero connection pool exhaustion, and flat latency distribution throughout the run.
