export class UserAuth {
  /**
   * Whether a session is ready for API requests. Static rather than React
   * state so that switching accounts doesn't re-render AccountContext's users.
   */
  static isLoggedIn = false;
}
