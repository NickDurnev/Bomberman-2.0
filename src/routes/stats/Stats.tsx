import { useState, useEffect } from "react";
import { UserStats } from "@utils/types";
import { ShadButton } from "@components/index";
import { columns } from "./components/statsColumn";
import { DataTable } from "./components/dataTable";
import { getUserStats } from "@utils/statsAPI";

const Stats = () => {
    const [data, setData] = useState<UserStats[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [sortOption, setSortOption] = useState("points");
    const [isLoading, setIsLoading] = useState(true);
    console.log("isLoading:", isLoading);

    useEffect(() => {
        const skip = (page - 1) * 10;
        getUserStats({ skip, limit: 10, sort: sortOption }).then(
            ({ total, stats }) => {
                const data = stats.map((stat: UserStats, index: number) => ({
                    ...stat,
                    index: index + 1,
                }));
                setData(data);
                setTotal(total);
                setIsLoading(false);
            }
        );
    }, []);

    return (
        <div className="w-full h-full py-20 flex flex-col gap-y-10">
            <div className="w-3/4 mx-auto">
                <>
                    <DataTable
                        columns={columns}
                        data={data}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                        isLoading={isLoading}
                    />
                    {!isLoading && data?.length > 0 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <ShadButton
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => prev - 1)}
                                disabled={total === 0 || page === 1}
                            >
                                Previous
                            </ShadButton>
                            <ShadButton
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={
                                    total === 0 ||
                                    page === Math.ceil(total / 10)
                                }
                            >
                                Next
                            </ShadButton>
                        </div>
                    )}
                </>
            </div>
        </div>
    );
};

export default Stats;

