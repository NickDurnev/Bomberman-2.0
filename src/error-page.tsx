import { useEffect } from "react";
import { useNavigate, useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error: any = useRouteError();
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            navigate("/");
        }, 3000);
    }, []);

    return (
        <div className="h-screen flex flex-col items-center justify-center gap-y-5">
            <h3 className="text-4xl font-extrabold tracking-wider text-center motion-preset-float motion-loop-once">
                Oops!
            </h3>
            <h3 className="text-4xl font-extrabold tracking-wider text-center motion-preset-float motion-loop-once">
                Sorry, an unexpected error has occurred.
            </h3>
            <h3 className="text-5xl font-bold tracking-wider text-center motion-preset-float motion-loop-once">
                <i>{error.statusText || error.message}</i>
            </h3>
        </div>
    );
}

