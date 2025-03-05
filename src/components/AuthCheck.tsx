import { useEffect, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
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

    if (isLoading)
        return (
            <div className="p-24 w-full flex items-center justify-center">
                <Loader />
            </div>
        );

    return <>{children}</>;
};

