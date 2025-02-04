import { ColumnDef } from "@tanstack/react-table";
import { UserStats } from "@utils/types";

export const columns: ColumnDef<UserStats>[] = [
    {
        accessorKey: "index",
        header: "No.",
    },
    {
        accessorKey: "points",
        header: "Points",
    },
    {
        accessorKey: "kills",
        header: "Kills",
    },
    {
        accessorKey: "wins",
        header: "Wins",
    },
    {
        accessorKey: "games",
        header: "Games",
    },
    {
        accessorKey: "top3",
        header: "Top 3",
    },
];

