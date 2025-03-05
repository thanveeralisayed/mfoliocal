import { SearchParams } from '@/models/searchParams';
import { getSelectedFundsDataHistory, getSelectedFundsDataLatest } from '@/server/action';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Returns } from '@/models/returns';
import { ScrollArea } from "@/components/ui/scroll-area";
import TabContent from './tabContent';
import { processReturns } from '@/utils/processNav';
import { ReturnsHistory } from '@/models/returnsHistory';
import CombinedReturnsGraph from './CombinedReturnsGraph';
import { SchemeLatest } from '@/models/SchemeLatest';

const FundReturns = async ({ searchParams }: { searchParams: SearchParams }) => {
    const params = await searchParams;
    const timeframe = params.timeframe || "3Y";
    const existingSchemeCodes = params.schemeCode?.split(',').filter(code => code.trim() !== '').map(code => parseInt(code, 10)) || [];
    let selectedFundHistory: Returns[] = [];
    let combinedReturns: ReturnsHistory[] = [];
    // Check if getselectedfundshistory is present and true
    if (params.getselectedfundshistory === 'true' && existingSchemeCodes.length > 0) {
        const funds: SchemeLatest[] = await getSelectedFundsDataLatest(existingSchemeCodes) || [];
        funds.forEach(fund => {
            const sipAmount: string = (params as Record<string, string>)[`${fund.meta.scheme_code}`];
            if (sipAmount) {
                fund.sipAmount = parseFloat(sipAmount);
            }
        });
        selectedFundHistory = await getSelectedFundsDataHistory(funds, timeframe);
        combinedReturns = await processReturns(selectedFundHistory);
    }

    return (
        <Card className="p-4">
            {selectedFundHistory?.length > 0 ? (
                <Tabs defaultValue={`${selectedFundHistory[0].schemeCode}`}>
                    <ScrollArea className="whitespace-nowrap rounded-md border">
                        <TabsList>
                            {selectedFundHistory.map((fund, index) => (
                                <TabsTrigger key={`${fund.schemeCode}`} title={`${fund.schemeName}`} value={`${fund.schemeCode}`}>
                                    Scheme {index + 1}
                                </TabsTrigger>
                            ))}
                            <TabsTrigger value="combined">Combined Returns</TabsTrigger>
                        </TabsList>
                    </ScrollArea>
                    {selectedFundHistory.map((fund) => (
                        <TabsContent key={`${fund.schemeCode}`} value={`${fund.schemeCode}`}>
                            <div className="p-4">
                                <TabContent fund={fund} />
                            </div>
                        </TabsContent>
                    ))}
                    <TabsContent value="combined">
                        <div className="p-4">
                            <CombinedReturnsGraph combinedReturns={combinedReturns} />
                        </div>
                    </TabsContent>
                </Tabs>
            ) : (
                <p>Please calculate</p>
            )}
        </Card>
    );
};

export default FundReturns;