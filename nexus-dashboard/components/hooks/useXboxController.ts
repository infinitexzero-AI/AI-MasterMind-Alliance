import { useEffect, useState } from 'react';

export type XboxInput = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SELECT' | 'BACK' | 'LB' | 'RB';

export const useXboxController = (onNavigation: (_direction: XboxInput) => void) => {
  const [activeGamepad, setActiveGamepad] = useState<number | null>(null);

  useEffect(() => {
    const handleConnect = (e: GamepadEvent) => {
      console.log('🎮 Xbox Controller Connected:', e.gamepad.id);
      setActiveGamepad(e.gamepad.index);
    };

    const handleDisconnect = (_e: GamepadEvent) => {
      console.log('🎮 Xbox Controller Disconnected');
      setActiveGamepad(null);
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    let lastButtons: boolean[] = [];

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      // Safely default to the first available controller if the 'connect' event fired before the React mount
      const gp = activeGamepad !== null ? gamepads[activeGamepad] : (gamepads[0] || null);

      if (gp && gp.buttons) {
        // D-pad indices: 12 (Up), 13 (Down), 14 (Left), 15 (Right)
        // Face Buttons: 0 (A/Select), 1 (B/Back)
        // Bumpers: 4 (LB), 5 (RB)
        
        if (gp.buttons[12]?.pressed && !lastButtons[12]) onNavigation('UP');
        if (gp.buttons[13]?.pressed && !lastButtons[13]) onNavigation('DOWN');
        if (gp.buttons[14]?.pressed && !lastButtons[14]) onNavigation('LEFT');
        if (gp.buttons[15]?.pressed && !lastButtons[15]) onNavigation('RIGHT');
        if (gp.buttons[0]?.pressed && !lastButtons[0]) onNavigation('SELECT');
        if (gp.buttons[1]?.pressed && !lastButtons[1]) onNavigation('BACK');
        if (gp.buttons[4]?.pressed && !lastButtons[4]) onNavigation('LB');
        if (gp.buttons[5]?.pressed && !lastButtons[5]) onNavigation('RB');

        lastButtons = gp.buttons.map(b => b.pressed);
      }
      
      requestAnimationFrame(pollGamepad);
    };

    const animationId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      cancelAnimationFrame(animationId);
    };
  }, [activeGamepad, onNavigation]);

  return { activeGamepad };
};
