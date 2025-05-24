export const getDataFromLocalStorage = (key: string) => {
    if (typeof window !== "undefined") {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return null;
};

export const deleteFromLocalStorage = (key: string) => {
    if (typeof window !== "undefined") {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.log(error);
        }
    }
};

export const addToLocalStorage = ({
    key,
    value,
}: {
    key: string;
    value: string | number | boolean | object | null;
}) => {
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    }
};

