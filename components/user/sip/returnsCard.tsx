import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Returns } from '@/models/returns';

type ReturnsCardProps = {
    returns: Returns;
};

const ReturnsCard: React.FC<ReturnsCardProps> = ({ returns }) => {
    const growthPercentage = ((returns.total - returns.totalInvested) / returns.totalInvested) * 100;

    return (
        <Card className="p-4 mt-3">
            <CardHeader>
                <CardTitle>{returns.schemeName}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div>Total Invested: ₹{returns.totalInvested}</div>
                    <div>
                        Total: ₹{returns.total} 
                        <span className="text-green-500"> ({growthPercentage.toFixed(2)}%)</span>
                    </div>
                    <div>Total Units: {returns.totalUnits} units</div>
                    <div>Returns: ₹{returns.returns}</div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReturnsCard;
