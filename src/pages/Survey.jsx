import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useUserAllProfiles } from "@/hooks/authHooks";
import { UsersListSkeleton } from "@/components/skeleton/userListSkeleton";

const COLORS = ["#10b981", "#059669", "#34d399", "#6ee7b7", "#a7f3d0"];

/* ---------------- Tooltip ---------------- */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow">
        <p>Year: {data?.year}</p>
        <p className="text-emerald-400">Users: {data?.users}</p>
      </div>
    );
  }
  return null;
};

/* ---------------- Legend ---------------- */
const CustomLegend = ({ data }) => (
  <div className="flex flex-wrap justify-center gap-4 mb-4">
    {data.map((item, index) => (
      <div key={index} className="flex items-center gap-2 text-sm">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: COLORS[index % COLORS.length] }}
        />
        <span className="text-gray-700 font-medium">{item.year}</span>
        <span className="text-gray-500">({item.users})</span>
      </div>
    ))}
  </div>
);

const Survey = () => {
  const { data: profileData, isFetching } = useUserAllProfiles();

  /* ------------ Data Transform ------------ */
  const chartData = useMemo(() => {
    if (!profileData?.profiles?.length) return [];

    const yearMap = {};

    profileData.profiles.forEach((user) => {
      if (user.memberSince) {
        const year = new Date(user.memberSince).getFullYear();
        yearMap[year] = (yearMap[year] || 0) + 1;
      }
    });

    return Object.keys(yearMap)
      .sort((a, b) => a - b)
      .map((year) => ({
        year: Number(year),
        users: yearMap[year],
      }));
  }, [profileData]);

  if (isFetching) return <UsersListSkeleton />;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 gap-6">
        {/* 📈 Line Chart */}
        <Card className="shadow-xl rounded-2xl border border-gray-100">
          <CardHeader>
            <CardTitle>User Growth (Yearly)</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="w-full h-[350px]">
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="year"
                    type="category"
                    interval="preserveStartEnd"
                    minTickGap={20}
                    padding={{ left: 10, right: 10 }}
                    tick={{ fill: "#6b7280", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={5}
                    domain={[0, (dataMax) => Math.ceil(dataMax * 1.2)]}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Bar
                    dataKey="users"
                    fill="#0d9488"
                    radius={[6, 6, 0, 0]}
                    barSize={30}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 🍩 Donut Chart */}
        <Card className="shadow-xl rounded-2xl border border-gray-100">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>

          <CardContent>
            <CustomLegend data={chartData} />

            <div className="w-full h-[350px]">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />

                  <Pie
                    data={chartData}
                    dataKey="users"
                    nameKey="year"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-700 text-lg font-semibold"
                  >
                    Users
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
