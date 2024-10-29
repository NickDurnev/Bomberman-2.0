import Phaser from "phaser";
import { Text } from "../../helpers/elements";

class Boot extends Phaser.Scene {
    constructor() {
        super({ key: "Boot" });
    }

    create() {
        // Keep the game reacting to messages even when out of focus
        this.game.events.off("hidden", this.handleGameVisibility, this);

        const style = {
            font: "30px Arial",
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeThickness: 3,
        } as Phaser.Types.GameObjects.Text.TextStyle;

        // Add loading text to the center of the screen
        new Text({
            scene: this, // Updated for TypeScript typing
            x: this.scale.width / 2,
            y: this.scale.height / 2,
            text: "Loading...",
            style: style,
        });

        // Start the Preload scene
        this.scene.start("Preload");
    }

    private handleGameVisibility() {
        // Handle visibility change or add any needed logic here if required.
    }
}

export default Boot;

