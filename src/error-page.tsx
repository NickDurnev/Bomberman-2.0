import { useEffect } from "react";
import { useNavigate, useRouteError } from "react-router-dom";

interface RouteError {
    statusText?: string;
    message?: string;
}

export default function ErrorPage() {
    const error = useRouteError() as RouteError;
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            navigate("/");
        }, 3000);
    }, []);

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-y-5">
            <h3 className="motion-preset-float motion-loop-once text-center font-extrabold text-4xl tracking-wider">
                Oops!
            </h3>
            <h3 className="motion-preset-float motion-loop-once text-center font-extrabold text-4xl tracking-wider">
                Sorry, an unexpected error has occurred.
            </h3>
            <h3 className="motion-preset-float motion-loop-once text-center font-bold text-5xl tracking-wider">
                <i>{error.statusText || error.message}</i>
            </h3>
        </div>
    );
}

