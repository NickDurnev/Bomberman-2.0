import { useState, useEffect } from "react";
import { UserStats } from "@utils/types";
import { Loader } from "@components/index";
import { columns } from "./components/statsColumn";
import { DataTable } from "./components/dataTable";
import { getUserStats } from "@utils/statsAPI";

const Stats = () => {
    const [data, setData] = useState<UserStats[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    console.log("isLoading:", isLoading);

    useEffect(() => {
        getUserStats({ skip: 0, limit: 10, filter: "points" }).then(
            ({ total, stats }) => {
                setData(stats);
                setTotal(total);
                setIsLoading(false);
            }
        );
    }, []);

    return (
        <div className="w-full h-full py-20 flex flex-col gap-y-10">
            {isLoading && <Loader />}
            {!isLoading && data?.length === 0 && <div>No data available</div>}
            {!isLoading && data?.length > 0 && (
                <DataTable columns={columns} data={data} />
            )}
        </div>
    );
};

export default Stats;

