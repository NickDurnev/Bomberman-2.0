import { useAuth0 } from "@auth0/auth0-react";
import { Button, Loader, ThemeBtn } from "@components/index";
import { SOCKET_ID_KEY } from "@utils/constants";
import { deleteFromLocalStorage } from "@utils/local_storage";
import clientSocket from "@utils/socket";
import { CiLogout } from "react-icons/ci";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";

export const UserBar = () => {
    const { loginWithRedirect, logout, user, isLoading } = useAuth0();
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

    const handleLogout = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
        deleteFromLocalStorage(SOCKET_ID_KEY);
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
            <div className="flex items-center justify-end gap-8 p-6">
                <ThemeBtn />
                {isLoading ? (
                    <Loader size={6} />
                ) : (
                    <>
                        {user ? (
                            <>
                                <Button
                                    imageUrl={user.picture}
                                    onClick={() => console.log("user:", user)}
                                    className="rounded-full p-2"
                                />
                                <Button
                                    icon={<CiLogout size={30} />}
                                    onClick={handleLogout}
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
                                {/* <Button
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
                                /> */}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
