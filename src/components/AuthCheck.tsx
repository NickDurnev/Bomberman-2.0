import { useEffect, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export const AuthCheck = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();

    useEffect(() => {
        // setTimeout(() => {
        //     checkIsAuthenticated(isAuthenticated);
        // }, 2000);
    }, [isAuthenticated, navigate, user]);

    const checkIsAuthenticated = (isAuthenticated: boolean) => {
        if (!isAuthenticated) {
            navigate("/");
        }
    };

    return <>{children}</>;
};

