import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';

import data from './data.json';

export default function DashboardPage() {
    return (
        <>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col md:gap-6 md:py-6">
                        <SectionCards />
                        <div className="">{/* <ChartAreaInteractive /> */}</div>
                        <DataTable data={data} />
                    </div>
                </div>
            </div>
        </>
    );
}
