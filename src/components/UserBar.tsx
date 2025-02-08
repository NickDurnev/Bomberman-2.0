import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { IoIosArrowRoundBack } from "react-icons/io";
import clientSocket from "@utils/socket";
import { Button, ThemeBtn } from "@components/index";

export const UserBar = () => {
    const { loginWithRedirect, logout, user } = useAuth0();
    const location = useLocation();
    const navigate = useNavigate();
    const { pathname } = location;
    const isMainMenu = pathname === "/";
    const isPending = pathname.startsWith("/pending");

    const backBtnClick = () => {
        if (isPending) {
            clientSocket.emit("leave pending game");
        }
        navigate(-1);
    };

    return (
        <div className="flex items-center justify-between">
            {isMainMenu ? (
                <div />
            ) : (
                <Button
                    icon={<IoIosArrowRoundBack size={30} />}
                    onClick={backBtnClick}
                    className="rounded-full p-2"
                />
            )}
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
        </div>
    );
};

