"use client";
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  function load() {
    return fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});
  }
  useEffect(() => {
    const t = setInterval(load, 2000);
    const first = setTimeout(load, 0);
    return () => {
      clearInterval(t);
      clearTimeout(first);
    };
  }, []);

  async function decide(orderId, action) {
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action }),
    });
    load();
  }

  const pending = orders.filter((o) => o.status === "approval_needed");
  const revenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.total, 0);

  const columns = [
    { field: "id", headerName: "Order", width: 120 },
    { field: "productName", headerName: "Product", flex: 1 },
    { field: "qty", width: 80 },
    { field: "unitPrice", headerName: "Unit $", width: 100 },
    { field: "total", headerName: "Total $", width: 100 },
    {
      field: "status", width: 160,
      cellStyle: (p) => ({ fontWeight: 600, color: p.value === "paid" ? "#059669" : p.value === "approval_needed" ? "#d97706" : "#475569" }),
    },
    { field: "reasoning", headerName: "AI reasoning", flex: 2 },
  ];

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Owner Dashboard</h1>
      <p><b>Revenue:</b> ${revenue.toFixed(2)} &nbsp; <b>Orders:</b> {orders.length}</p>

      {pending.length > 0 && (
        <div style={{ background: "#fef3c7", padding: 12, borderRadius: 8, margin: "12px 0" }}>
          <b>Approval needed</b>
          {pending.map((o) => (
            <div key={o.id} style={{ margin: "8px 0" }}>
              {o.qty} x {o.productName} at ${o.unitPrice} = <b>${o.total}</b> ({o.reasoning})
              <button onClick={() => decide(o.id, "approve")} style={{ marginLeft: 10 }}>Approve</button>
              <button onClick={() => decide(o.id, "reject")} style={{ marginLeft: 6 }}>Reject</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 420 }}>
        <AgGridReact rowData={orders} columnDefs={columns} getRowId={(p) => p.data.id} />
      </div>
    </main>
  );
}