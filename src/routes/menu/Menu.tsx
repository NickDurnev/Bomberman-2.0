import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { CiLogout } from "react-icons/ci";
import { Socket, PaddingContainer, Button } from "@components/index";
import { addUser } from "../../services/auth";

function Menu() {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
        useAuth0();

    useEffect(() => {
        addUserToDB();
    }, [user]);

    const addUserToDB = async () => {
        if (user) {
            const res = await addUser({
                email: user.email || "",
                name: user.name || "",
                picture: user.picture || "",
                locale: user.locale || "en-US",
            });
            console.log("res:", res);
        }
    };

    return (
        <div id="app">
            <Socket>
                <PaddingContainer>
                    <div
                        className="w-full h-screen mx-auto bg-scroll bg-center bg-cover"
                        style={{
                            backgroundImage: "url(/assets/main_menu_bg.jpg)",
                        }}
                    >
                        <div className="flex items-center gap-8 justify-end p-6">
                            {user ? (
                                <>
                                    <Button
                                        imageUrl={user.picture}
                                        onClick={() =>
                                            console.log("user:", user)
                                        }
                                        className="rounded-full p-2"
                                    />
                                    <Button
                                        icon={<CiLogout size={30} />}
                                        onClick={() =>
                                            logout({
                                                logoutParams: {
                                                    returnTo:
                                                        window.location.origin,
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
                        <div className="pt-20">
                            <h1 className="text-8xl font-extrabold tracking-wider text-center motion-preset-float motion-loop-once">
                                Bomberman 2.0
                            </h1>
                        </div>
                    </div>
                </PaddingContainer>
            </Socket>
        </div>
    );
}

export default Menu;

