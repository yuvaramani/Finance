import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { StyledSelect } from "@components/StyledSelect";
import { Download } from "lucide-react";
import dayjs from "dayjs";
import { salaryService } from "@api/services/salaryService";
import { tdsService } from "@api/services/tdsService";

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getCurrentFyStart = () => {
  const now = dayjs();
  const year = now.year();
  return now.month() >= 3 ? year : year - 1; // Apr=3 (0-indexed)
};

const quarterRanges = (fyStart: number) => ([
  {
    label: "Q1 (Apr - Jun)",
    from: dayjs(`${fyStart}-04-01`),
    to: dayjs(`${fyStart}-06-30`),
  },
  {
    label: "Q2 (Jul - Sep)",
    from: dayjs(`${fyStart}-07-01`),
    to: dayjs(`${fyStart}-09-30`),
  },
  {
    label: "Q3 (Oct - Dec)",
    from: dayjs(`${fyStart}-10-01`),
    to: dayjs(`${fyStart}-12-31`),
  },
  {
    label: "Q4 (Jan - Mar)",
    from: dayjs(`${fyStart + 1}-01-01`),
    to: dayjs(`${fyStart + 1}-03-31`),
  },
]);

export function TdsQuarterly() {
  const [fyStart, setFyStart] = useState<number>(getCurrentFyStart());

  const fyStartOptions = useMemo(() => {
    const current = getCurrentFyStart();
    return Array.from({ length: 6 }).map((_, idx) => {
      const start = current - idx;
      const endShort = String(start + 1).slice(-2);
      return { value: start.toString(), label: `FY ${start}-${endShort}` };
    });
  }, []);

  const fromDate = `${fyStart}-04-01`;
  const toDate = `${fyStart + 1}-03-31`;

  const { data: salariesData, isLoading, isError, error } = useQuery({
    queryKey: ["tds-salaries", { from_date: fromDate, to_date: toDate }],
    queryFn: () => salaryService.getSalaries({ from_date: fromDate, to_date: toDate }),
    staleTime: 5 * 60 * 1000,
  });

  const salariesRaw =
    (salariesData as any)?.data?.salaries ||
    (salariesData as any)?.salaries ||
    (salariesData as any)?.data ||
    salariesData ||
    [];

  const salaries = Array.isArray(salariesRaw) ? salariesRaw : [];

  const byQuarter = useMemo(() => {
    const ranges = quarterRanges(fyStart);
    return ranges.map((range) => {
      const rows = salaries
        .filter((s: any) => {
          const date = dayjs(s.date);
          return date.isValid() && (date.isSame(range.from) || date.isAfter(range.from)) &&
            (date.isSame(range.to) || date.isBefore(range.to));
        })
        .map((s: any, idx: number) => {
          const gross = Number(s.gross_salary ?? s.salary ?? 0);
          const tds = Number(s.tds ?? 0);
          const net = s.net_salary !== undefined && s.net_salary !== null ? Number(s.net_salary) : (gross - tds);
          return {
            id: `${s.id ?? idx}`,
            employee: s.employee?.name || "—",
            month: dayjs(s.date).format("MMM YYYY"),
            gross,
            tds,
            net,
          };
        });

      const totals = rows.reduce(
        (acc: any, r: any) => {
          acc.gross += Number(r.gross || 0);
          acc.tds += Number(r.tds || 0);
          acc.net += Number(r.net || 0);
          return acc;
        },
        { gross: 0, tds: 0, net: 0 }
      );

      return { ...range, rows, totals };
    });
  }, [salaries, fyStart]);

  const quarterLabels = [
    ["April", "May", "June"],
    ["July", "August", "September"],
    ["October", "November", "December"],
    ["January", "February", "March"],
  ];

  const handleExport = async (quarterIndex: number) => {
    try {
      const response = await tdsService.exportQuarter(fyStart, quarterIndex + 1);
      const blob = response?.data instanceof Blob ? response.data : null;
      if (!blob) {
        throw new Error("Invalid export response");
      }

      if (blob.type && blob.type.includes("application/json")) {
        const text = await blob.text();
        throw new Error(text || "Export failed");
      }

      const disposition = response?.headers?.["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || `TDS_FY${fyStart}-${String(fyStart + 1).slice(-2)}_Q${quarterIndex + 1}.xlsx`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("TDS export failed", err);
      alert("TDS export failed. Please try again.");
    }
  };

  const buildQuarterRows = (quarterIndex: number) => {
    const months = quarterLabels[quarterIndex];
    const monthKeys = months.map((m, idx) => {
      const monthIndex = quarterIndex * 3 + idx; // 0..11
      const year = monthIndex < 9 ? fyStart : fyStart + 1;
      const monthNum = (monthIndex + 4) % 12 || 12; // Apr=4
      const key = `${year}-${String(monthNum).padStart(2, "0")}`;
      return { label: m, key };
    });

    const byEmployee = new Map<string, any>();
    salaries.forEach((s: any) => {
      const date = dayjs(s.date);
      if (!date.isValid()) return;
      const key = date.format("YYYY-MM");
      const targetMonth = monthKeys.find((m) => m.key === key);
      if (!targetMonth) return;

          const empId = s.employee?.id?.toString() || s.employee?.name || "unknown";
      if (!byEmployee.has(empId)) {
          byEmployee.set(empId, {
            id: empId,
            name: s.employee?.name || "—",
            months: {},
          });
      }

      const gross = Number(s.gross_salary ?? s.salary ?? 0);
      const tds = Number(s.tds ?? 0);
      const net = s.net_salary !== undefined && s.net_salary !== null ? Number(s.net_salary) : (gross - tds);

      if (!byEmployee.get(empId).months[key]) {
        byEmployee.get(empId).months[key] = { gross: 0, tds: 0, net: 0 };
      }
      byEmployee.get(empId).months[key].gross += gross;
      byEmployee.get(empId).months[key].tds += tds;
      byEmployee.get(empId).months[key].net += net;
    });

    const rows = Array.from(byEmployee.values());
    const totals = monthKeys.reduce(
      (acc: any, m) => {
        acc[m.key] = { gross: 0, tds: 0, net: 0 };
        rows.forEach((r) => {
          const v = r.months[m.key] || { gross: 0, tds: 0, net: 0 };
          acc[m.key].gross += v.gross;
          acc[m.key].tds += v.tds;
          acc[m.key].net += v.net;
        });
        return acc;
      },
      {}
    );

    return { monthKeys, rows, totals };
  };

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-green-800">TDS</h1>
          <p className="text-sm text-green-600 mt-1">Quarter-wise TDS summary by employee</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-green-700 text-sm">Financial Year</Label>
        <StyledSelect
          value={fyStart.toString()}
          onChange={(value) => setFyStart(Number(value))}
          placeholder="Select FY"
          options={fyStartOptions}
          className="min-w-[200px]"
        />
      </div>

      {isLoading ? (
        <div className="h-full border border-green-100 rounded flex items-center justify-center">
          <span className="text-green-700">Loading TDS data...</span>
        </div>
      ) : isError ? (
        <div className="h-full border border-red-200 rounded bg-red-50 p-4 text-red-700">
          <p className="font-medium">Error loading TDS data</p>
          <p className="text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 overflow-auto pb-4">
          {byQuarter.map((q, idx) => {
            const { monthKeys, rows, totals } = buildQuarterRows(idx);
            return (
            <div key={q.label} className="border border-green-200 rounded-lg bg-white">
              <div className="flex items-center justify-between px-4 py-3 border-b border-green-100">
                <div className="text-green-800 font-semibold">{q.label}</div>
                <Button
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => handleExport(idx)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
              <div className="p-4">
                <div className="overflow-auto border border-green-200 rounded">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-green-50/60 text-green-800">
                        <th className="border border-green-200 px-3 py-2 text-left" rowSpan={2}>Name</th>
                        {monthKeys.map((m) => (
                          <th key={m.key} className="border border-green-200 px-3 py-2 text-center" colSpan={3}>
                            {m.label}
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-green-50/60 text-green-800">
                        {monthKeys.map((m) => (
                          <React.Fragment key={`${m.key}-sub`}>
                            <th className="border border-green-200 px-3 py-2 text-center">Gross</th>
                            <th className="border border-green-200 px-3 py-2 text-center">TDS</th>
                            <th className="border border-green-200 px-3 py-2 text-center">Net</th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="hover:bg-green-50/40">
                          <td className="border border-green-200 px-3 py-2 text-green-800">{r.name}</td>
                          {monthKeys.map((m) => {
                            const v = r.months[m.key] || { gross: 0, tds: 0, net: 0 };
                            return (
                              <React.Fragment key={`${r.id}-${m.key}`}>
                                <td className="border border-green-200 px-3 py-2 text-right text-green-800">{formatCurrency(v.gross)}</td>
                                <td className="border border-green-200 px-3 py-2 text-right text-red-600">{formatCurrency(v.tds)}</td>
                                <td className="border border-green-200 px-3 py-2 text-right text-green-800">{formatCurrency(v.net)}</td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td className="border border-green-200 px-3 py-6 text-center text-green-600" colSpan={1 + (monthKeys.length * 3)}>
                            No data for this quarter
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-green-50/40">
                        <td className="border border-green-200 px-3 py-2 font-semibold text-green-800" colSpan={1}>Total</td>
                        {monthKeys.map((m) => (
                          <React.Fragment key={`${m.key}-total`}>
                            <td className="border border-green-200 px-3 py-2 text-right font-semibold text-green-800">{formatCurrency(totals[m.key]?.gross || 0)}</td>
                            <td className="border border-green-200 px-3 py-2 text-right font-semibold text-red-600">{formatCurrency(totals[m.key]?.tds || 0)}</td>
                            <td className="border border-green-200 px-3 py-2 text-right font-semibold text-green-800">{formatCurrency(totals[m.key]?.net || 0)}</td>
                          </React.Fragment>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
