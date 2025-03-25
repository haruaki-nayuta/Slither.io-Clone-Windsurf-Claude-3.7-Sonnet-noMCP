/**
 * Main entry point for the game
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game();
    
    // Show menu screen
    game.ui.showMenuScreen();
    
    // Log game instructions
    console.log('Slither.io シングルプレイヤー - 操作方法:');
    console.log('- マウスを動かして蛇を操作');
    console.log('- マウスボタンを押している間は加速（体の一部を消費）');
    console.log('- 他の蛇の体に頭がぶつかるとゲームオーバー');
    console.log('- 他の蛇の頭があなたの体にぶつかるとその蛇が死亡');
    console.log('- Qキーを押すとQuadtreeの可視化をトグル（デバッグ用）');
});
