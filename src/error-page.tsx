import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error: any = useRouteError();

    return (
        <>
            <div
                id="error-page"
                style={{
                    width: "800px",
                    height: "500px",
                    textAlign: "center",
                    backgroundImage: "url(/assets/main_menu_bg.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    margin: "100px auto",
                    marginBottom: "50px",
                }}
            />
            <div style={{ textAlign: "center" }}>
                <h1>Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p>
                    <i>{error.statusText || error.message}</i>
                </p>
            </div>
        </>
    );
}

