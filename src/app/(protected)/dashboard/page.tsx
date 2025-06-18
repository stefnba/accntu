import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';

import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { MainContent } from '@/components/layout/main';
import data from './data.json';

export default function DashboardPage() {
    return (
        <MainContent
            pageHeader={{
                title: 'Dashboard',
            }}
        >
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col md:gap-6">
                        <SectionCards />
                        <div className="">
                            <ChartAreaInteractive />
                        </div>
                        <DataTable data={data} />
                    </div>
                </div>
            </div>
        </MainContent>
    );
}
