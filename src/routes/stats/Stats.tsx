import { ShadButton, UserBar } from "@components/index";
import { getUserStats } from "@utils/statsAPI";
import { UserStats } from "@utils/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "./components/dataTable";
import { columns } from "./components/statsColumn";

const Stats = () => {
    const [data, setData] = useState<UserStats[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [name, setName] = useState("");
    const [sortOption, setSortOption] = useState("points");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getStats();
    }, [page, sortOption, name]);

    useEffect(() => {
        setPage(1);
    }, [sortOption, name]);

    const getStats = async () => {
        try {
            setIsLoading(true);
            const { total, stats } = await getUserStats({
                skip: (page - 1) * 10,
                limit: 10,
                sort: sortOption,
                name,
            });

            const data = stats.map((stat: UserStats, index: number) => ({
                ...stat,
                index: index + 1 + (page - 1) * 10,
            }));
            setData(data);
            setTotal(total);
        } catch (error) {
            console.log(error);
            toast("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <UserBar />
            <div className="flex h-full w-full flex-col gap-y-10 py-20">
                <div className="mx-auto w-3/4">
                    <>
                        <DataTable
                            columns={columns}
                            data={data}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
                            isLoading={isLoading}
                            setName={setName}
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
        </>
    );
};

export default Stats;

