/**
 * Canal de comunicação entre o Axios interceptor (camada de API, sem acesso ao React)
 * e o RootLayout (camada React, com acesso ao Zustand).
 *
 * Uso:
 *  - O interceptor chama  `authEvents.emitSessionExpired()` quando o refresh falha.
 *  - O RootLayout registra `authEvents.onSessionExpired(callback)` para reagir.
 */

type VoidCallback = () => void;

let _onSessionExpired: VoidCallback | null = null;

export const authEvents = {
  /** Registra o callback que será chamado quando a sessão expirar. */
  onSessionExpired(cb: VoidCallback) {
    _onSessionExpired = cb;
  },

  /** Chamado pelo interceptor quando refresh token falha. */
  emitSessionExpired() {
    _onSessionExpired?.();
  },
};
