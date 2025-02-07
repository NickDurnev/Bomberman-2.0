import { ColumnDef } from "@tanstack/react-table";
import { UserStats } from "@utils/types";

export const columns: ColumnDef<UserStats>[] = [
    {
        accessorKey: "index",
        header: () => <div className="text-center">No.</div>,
        cell: ({ row }) => {
            const index = parseFloat(row.getValue("index"));
            return <div className="text-center font-medium">{index}</div>;
        },
        enableHiding: false,
    },
    {
        accessorKey: "userName",
        header: () => <div className="text-center">Name</div>,
        cell: ({ row }) => {
            const name = row.getValue("userName") as string;
            return <div className="text-center font-medium">{name}</div>;
        },
        enableHiding: false,
    },
    {
        accessorKey: "points",
        header: () => <div className="text-center">Points</div>,
        cell: ({ row }) => {
            const points = parseFloat(row.getValue("points"));
            return <div className="text-center font-medium">{points}</div>;
        },
    },
    {
        accessorKey: "kills",
        header: () => <div className="text-center">Kills</div>,
        cell: ({ row }) => {
            const kills = parseFloat(row.getValue("kills"));
            return <div className="text-center font-medium">{kills}</div>;
        },
    },
    {
        accessorKey: "wins",
        header: () => <div className="text-center">Wins</div>,
        cell: ({ row }) => {
            const wins = parseFloat(row.getValue("wins"));
            return <div className="text-center font-medium">{wins}</div>;
        },
    },
    {
        accessorKey: "games",
        header: () => <div className="text-center">Games</div>,
        cell: ({ row }) => {
            const games = parseFloat(row.getValue("games"));
            return <div className="text-center font-medium">{games}</div>;
        },
    },
    {
        accessorKey: "top3",
        header: () => <div className="text-center">Top 3</div>,
        cell: ({ row }) => {
            const top3 = parseFloat(row.getValue("top3"));
            return <div className="text-center font-medium">{top3}</div>;
        },
    },
];

