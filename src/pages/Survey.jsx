import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useUserAllProfiles } from "@/hooks/authHooks";
import { Users, CalendarDays, FileText } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur dark:border-emerald-500/20 dark:bg-black/95">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
        Year
      </p>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </h3>
      <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
        Users:{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {payload[0]?.value}
        </span>
      </p>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon }) => {
  const Icon = icon;

  return (
    <Card className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white/90 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-emerald-500/20 dark:bg-black/90">
      <CardContent className="relative p-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-transparent to-transparent opacity-70 dark:from-emerald-500/10 dark:opacity-60" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Survey = () => {
  const { data: profileData, isFetching } = useUserAllProfiles();

  const chartData = useMemo(() => {
    if (!profileData?.profiles?.length) return [];

    const yearMap = {};
    let maxYear = 2025;

    profileData.profiles.forEach((user) => {
      if (user.memberSince) {
        const year = new Date(user.memberSince).getFullYear();
        maxYear = Math.max(maxYear, year);
        yearMap[year] = (yearMap[year] || 0) + 1;
      }
    });

    const currentYear = new Date().getFullYear();
    const endYear = Math.max(currentYear, maxYear);

    return Array.from(
      { length: endYear - 2025 + 1 },
      (_, index) => 2025 + index,
    ).map((year) => ({
      year,
      users: yearMap[year] || 0,
    }));
  }, [profileData]);

  const totalUsers = chartData.reduce((sum, item) => sum + item.users, 0);
  const totalPosts = profileData?.profiles?.reduce(
    (sum, profile) => sum + (profile.totalPosts || 0),
    0,
  );
  const latestActiveYear =
    [...chartData].reverse().find((item) => item.users > 0) ?? null;

  if (isFetching) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden px-4 pb-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_35%),linear-gradient(to_bottom,rgba(240,253,244,0.95),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_35%),linear-gradient(to_bottom,rgba(0,0,0,0.98),rgba(0,0,0,0.92))]" />
      <div className="pointer-events-none absolute left-8 top-24 -z-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-400/10" />
      <div className="pointer-events-none absolute right-12 top-40 -z-10 h-32 w-32 rounded-full bg-slate-300/20 blur-3xl dark:bg-slate-500/10" />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Users Analytics
          </h1>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle="Users"
            icon={Users}
          />
          <StatCard
            title="Total Posts"
            value={totalPosts ?? 0}
            subtitle="Posts"
            icon={FileText}
          />
          <StatCard
            title="Latest Active Year"
            value={latestActiveYear?.year ?? "-"}
            subtitle={
              latestActiveYear
                ? `${latestActiveYear.users} users`
                : "No activity yet"
            }
            icon={CalendarDays}
          />
        </div>

        <Card className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white/90 shadow-[0_22px_70px_-28px_rgba(15,23,42,0.28)] backdrop-blur dark:border-emerald-500/20 dark:bg-black/90 dark:shadow-[0_22px_70px_-28px_rgba(0,0,0,0.85)]">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-emerald-50/60 to-white pb-4 dark:border-slate-800 dark:from-black dark:via-zinc-950 dark:to-black">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-black tracking-tight text-slate-900 sm:text-xl dark:text-slate-100">
                  Yearly User Growth
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  A smooth year-by-year view of registrations from 2025 onward.
                </p>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                2025 start
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="h-[320px] w-full sm:h-[380px] lg:h-[460px]">
              {chartData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="lineColor"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="var(--chart-grid, #e2e8f0)"
                      vertical={false}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="var(--chart-axis, #cbd5e1)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{
                        fill: "var(--chart-text, #64748b)",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                      padding={{ left: 10, right: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{
                        fill: "var(--chart-text, #64748b)",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      width={36}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#059669"
                      strokeWidth={3}
                      fill="url(#lineColor)"
                      dot={{
                        r: 4,
                        fill: "#ffffff",
                        stroke: "#10b981",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 7, fill: "#10b981" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10b981"
                      strokeWidth={1.75}
                      dot={false}
                      activeDot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 px-6 text-center dark:border-emerald-500/20 dark:bg-black/80">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No chart data available.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
