import { useAuth0 } from "@auth0/auth0-react";
import { CiLogout } from "react-icons/ci";
import { Socket, PaddingContainer, Button } from "../../components";

function Menu() {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
        useAuth0();
    console.log("isLoading:", isLoading);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
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
                        <div className="pt-10">
                            <h1 className="text-8xl font-extrabold tracking-wider text-center motion-preset-float motion-loop-once">
                                Bomberman 2.0
                            </h1>
                        </div>
                        <div className="flex flex-col items-center gap-8">
                            <Button
                                text="Sign in with Google"
                                imageUrl="/assets/google.png"
                                imageAlt="Star icon"
                                onClick={() => loginWithRedirect()}
                            />
                            <Button
                                text="Logout"
                                icon={<CiLogout size={18} />}
                                onClick={() =>
                                    logout({
                                        logoutParams: {
                                            returnTo: window.location.origin,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                </PaddingContainer>
            </Socket>
        </div>
    );
}

export default Menu;

