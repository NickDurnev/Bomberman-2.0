import { Socket, PaddingContainer } from "../../components";

function Menu() {
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
                        <h1 className="text-3xl font-bold underline text-center">
                            Hello world!
                        </h1>
                    </div>
                </PaddingContainer>
            </Socket>
        </div>
    );
}

export default Menu;

