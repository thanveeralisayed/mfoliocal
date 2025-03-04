'use client'
import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ReturnsHistory } from '@/models/returnsHistory';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface CombinedReturnsGraphProps {
    combinedReturns: ReturnsHistory[];
}

const vibrantColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF8C33', '#33FFF5', '#8C33FF', '#FF3333'
];

const CombinedReturnsGraph: React.FC<CombinedReturnsGraphProps> = ({ combinedReturns }) => {
    console.log(combinedReturns[2])
    const chartConfig = combinedReturns.length > 0 ? Object.keys(combinedReturns[2]).filter(key => key !== 'date').reduce((acc, key, index) => {
  
        acc[key] = { label: key, color: vibrantColors[index % vibrantColors.length] };
        return acc;
    }, {} as Record<string, { label: string, color: string }>) : {};



    return (
        <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={combinedReturns} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Legend />
                    {Object.keys(chartConfig).map((key, index) => (
                        <Area
                            key={index}
                            dataKey={key}
                            type="natural"
                            fill={chartConfig[key].color}
                            fillOpacity={0.4}
                            stroke={chartConfig[key].color}
                            stackId="a"
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default CombinedReturnsGraph;
