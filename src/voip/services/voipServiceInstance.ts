// src/voip/services/voipServiceInstance.ts
import { VoipManager } from './VoipManager';

/**
 * Singleton instance of the VoipManager.
 * This instance should be used throughout the application to interact with VoIP functionalities.
 */
export const voipManagerInstance = new VoipManager();
