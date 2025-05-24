import { useAuth0 } from "@auth0/auth0-react";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "./Loader";

export const AuthCheck = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth0();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="flex w-full items-center justify-center p-24">
                <Loader />
            </div>
        );
    }

    return <>{children}</>;
};

