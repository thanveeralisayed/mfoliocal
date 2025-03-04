'use client'
import React from 'react';
import { LineChart, Line, XAxis, CartesianGrid } from 'recharts';
import { Returns } from '@/models/returns';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type TabContentProps = {
  fund: Returns;
};

const TabContent: React.FC<TabContentProps> = ({ fund }) => {
  // Function to sample data at regular intervals
  const sampleData = (data: { date: string; nav: number }[], interval: number) => {
    const sampledData = [];
    for (let i = 0; i < data.length; i += interval) {
      sampledData.push(data[i]);
    }
    return sampledData;
  };

  // Sample the data to show fewer points
  const sampledNavData = sampleData(fund.schemeHistory.data, Math.floor(fund.schemeHistory.data.length / 12)); // Adjust the interval to show 12 points
  const sampledReturnsData = sampleData(fund.schemeHistory.data, Math.floor(fund.schemeHistory.data.length / 12)); // Adjust the interval to show 12 points

  const chartConfig = {
    nav: {
      label: "NAV",
      color: "#8884d8", // Updated color
    },
    returns: {
      label: "Returns",
      color: "#82ca9d", // Updated color
    },
  } satisfies ChartConfig;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{fund.schemeName}</h3>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={sampledNavData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="nav"
            type="linear"
            stroke="#8884d8" // Updated color
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">{fund.schemeName} - Returns</h3>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={sampledReturnsData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="returns"
              type="linear"
              stroke="#82ca9d" // Updated color
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default TabContent;