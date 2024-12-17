export default class Info {
    private game: Phaser.Scene;
    private player: { speed: number; power: number; delay: number };
    private style: Phaser.Types.GameObjects.Text.TextStyle;
    private redStyle: Phaser.Types.GameObjects.Text.TextStyle;
    private speedText: Phaser.GameObjects.Text;
    private powerText: Phaser.GameObjects.Text;
    private delayText: Phaser.GameObjects.Text;
    private deadText: Phaser.GameObjects.Text;

    constructor({
        game,
        player,
    }: {
        game: Phaser.Scene;
        player: { speed: number; power: number; delay: number };
    }) {
        this.game = game;
        this.player = player;

        this.style = {
            font: "14px Arial",
            fill: "#f3f3f3",
            align: "left",
        } as Phaser.Types.GameObjects.Text.TextStyle;
        this.redStyle = {
            font: "30px Arial",
            fill: "#ff0044",
            align: "center",
        } as Phaser.Types.GameObjects.Text.TextStyle;

        // Creating speed icon and text
        const bootsIcon = new Phaser.GameObjects.Image(
            this.game,
            5,
            2,
            "placeholder_speed"
        );
        this.speedText = new Phaser.GameObjects.Text(
            this.game,
            35,
            7,
            this.speedLabel(),
            this.style
        );
        this.game.add.container(0, 0, [bootsIcon, this.speedText]);

        // Creating power icon and text
        const powerIcon = new Phaser.GameObjects.Image(
            this.game,
            110,
            2,
            "placeholder_power"
        );
        this.powerText = new Phaser.GameObjects.Text(
            this.game,
            35,
            7,
            this.powerLabel(),
            this.style
        );
        this.game.add.container(0, 0, [powerIcon, this.powerText]);

        // Creating delay icon and text
        const delayIcon = new Phaser.GameObjects.Image(
            this.game,
            215,
            2,
            "placeholder_time"
        );
        this.delayText = new Phaser.GameObjects.Text(
            this.game,
            35,
            7,
            this.delayLabel(),
            this.style
        );
        this.game.add.container(0, 0, [delayIcon, this.delayText]);

        // Adding dead text
        this.deadText = this.game.add.text(
            this.game.cameras.main.centerX,
            this.game.scale.height - 30,
            "You died :(",
            this.redStyle
        );
        this.deadText.setOrigin(0.5);
        this.deadText.setVisible(false);
    }

    refreshStatistic(): void {
        this.speedText.text = this.speedLabel();
        this.powerText.text = this.powerLabel();
        this.delayText.text = this.delayLabel();
    }

    showDeadInfo(): void {
        this.deadText.setVisible(true);
    }

    private speedLabel(): string {
        return `${this.player.speed}`;
    }

    private powerLabel(): string {
        return `x ${this.player.power}`;
    }

    private delayLabel(): string {
        return `${this.player.delay / 1000} sec.`;
    }
}

