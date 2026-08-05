// Minimal typings for the bun:test runner (tests run via `bun test`, not
// jest), covering just the matchers we use. Extend as tests need more.
declare module "bun:test" {
  export function describe(label: string, fn: () => void): void;
  export function test(label: string, fn: () => void | Promise<void>): void;
  export function expect(value: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toBeUndefined(): void;
    toBeDefined(): void;
  };
}
