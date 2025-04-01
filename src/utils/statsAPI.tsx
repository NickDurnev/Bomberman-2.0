const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export const getUserStats = async (params: Record<string, string | number>) => {
    try {
        const queryString = new URLSearchParams(
            Object.fromEntries(
                Object.entries(params).map(([key, value]) => [
                    key,
                    String(value),
                ])
            )
        ).toString();

        const url = `${BASE_URL}/api/v1/stats?${queryString}`;

        const res = await fetch(url);
        if (!res.ok) {
            return { total: 0, stats: [] };
        }

        const { data } = await res.json();

        return data;
    } catch (error) {
        console.error(error);
        return { total: 0, stats: [] };
    }
};

