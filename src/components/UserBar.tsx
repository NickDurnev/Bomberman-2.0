import { useAuth0 } from "@auth0/auth0-react";
import { CiLogout } from "react-icons/ci";
import { Button, ThemeBtn } from "@components/index";

export const UserBar = () => {
    const { loginWithRedirect, logout, user } = useAuth0();

    return (
        <div className="flex items-center gap-8 justify-end p-6">
            <ThemeBtn />
            {user ? (
                <>
                    <Button
                        imageUrl={user.picture}
                        onClick={() => console.log("user:", user)}
                        className="rounded-full p-2"
                    />
                    <Button
                        icon={<CiLogout size={30} />}
                        onClick={() =>
                            logout({
                                logoutParams: {
                                    returnTo: window.location.origin,
                                },
                            })
                        }
                        className="rounded-full p-2"
                    />
                </>
            ) : (
                <>
                    <Button
                        imageUrl="/assets/google.png"
                        imageAlt="Star icon"
                        onClick={() =>
                            loginWithRedirect({
                                authorizationParams: {
                                    connection: "google-oauth2",
                                },
                            })
                        }
                        className="rounded-full p-2"
                    />
                    <Button
                        imageUrl="/assets/github.svg"
                        imageAlt="Star icon"
                        onClick={() =>
                            loginWithRedirect({
                                authorizationParams: {
                                    connection: "github",
                                },
                            })
                        }
                        className="rounded-full p-2"
                    />
                </>
            )}
        </div>
    );
};

