import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { SearchParams } from '@/models/searchParams';
import { getSelectedFundsDataLatest } from '@/server/action';
import { SchemeLatest } from '@/models/SchemeLatest';
import RemoveSchemeButton from './removeSchemeButton';
import SipAmountInput from './sipAmount';
import CalculateButton from './calculateButton';
import YearButton from './yearButton';

type sipCardProps = {
    searchParams: SearchParams
}



const SipCard = async ({ searchParams }: sipCardProps) => {
    const params = await searchParams;
    const existingSchemeCodes = params.schemeCode?.split(',').filter(code => code.trim() !== '').map(code => parseInt(code, 10)) || [];
    const funds: SchemeLatest[] = await getSelectedFundsDataLatest(existingSchemeCodes) || []

    return (
        <Card className="p-4">
            <Tabs defaultValue='sip'>
                <TabsList className="mb-4">
                    <TabsTrigger value="sip">SIP</TabsTrigger>
                </TabsList>
                <TabsContent value="sip">
                    {funds?.length > 0 ? funds?.map(fund => (
                        <div key={fund.meta.scheme_code} className="space-y-4 mb-2 border rounded-lg p-4 relative">
                            <div className="absolute top-2 right-2">
                                <RemoveSchemeButton schemeCode={fund.meta.scheme_code} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{fund.meta.scheme_name}</h3>
                                <SipAmountInput schemeCode={fund.meta.scheme_code} />
                            </div>
                        </div>
                    )) : 'Please Select schemes to calculate'}
                    {funds.length > 0 && <div className="flex space-x-2 mt-4">
                        <YearButton label="6M" value="6M" />
                        <YearButton label="1Y" value="1Y" />
                        <YearButton label="3Y" value="3Y" />
                        <YearButton label="5Y" value="5Y" />
                        <YearButton label="10Y" value="10Y" />
                    </div>}

                    {funds.length > 0 && <div className='mt-2'>
                        <CalculateButton funds={funds} />
                    </div>}

                </TabsContent>
            </Tabs>
        </Card>
    );
};

export default SipCard;