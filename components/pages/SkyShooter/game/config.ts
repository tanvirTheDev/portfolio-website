import type Phaser from "phaser";

/** Returns Phaser game config. Called client-side only (Phaser needs window). */
export function makeConfig(parent: string): Phaser.Types.Core.GameConfig {
  // Import scenes dynamically so the config function itself is tree-shakeable
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BootScene } = require("./scenes/BootScene") as {
    BootScene: typeof import("./scenes/BootScene").BootScene;
  };
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { GameScene } = require("./scenes/GameScene") as {
    GameScene: typeof import("./scenes/GameScene").GameScene;
  };

  return {
    type: 2, // Phaser.CANVAS — avoid WebGL on low-end mobiles, consistent look
    parent,
    backgroundColor: "#0a0a0a",
    scale: {
      mode: 3, // Phaser.Scale.RESIZE
      autoCenter: 1, // Phaser.Scale.CENTER_BOTH
      width: "100%",
      height: "100%",
    },
    physics: {
      default: "arcade",
      arcade: { debug: false, gravity: { x: 0, y: 0 } },
    },
    scene: [BootScene, GameScene],
    audio: { disableWebAudio: false },
    fps: { target: 60, smoothStep: true },
    // Prevent Phaser's default banner in console
    banner: false,
  };
}
