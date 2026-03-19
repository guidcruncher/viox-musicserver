// 1. Define the event names as the keys of an object
// The values here don't matter much for the logic,
// but we use them to help TS understand the payload shapes.
export const EVENT_DEFINITIONS = {
  "user:alert": {} as { userId: string; message: string },
  "system:stats": {} as { cpu: number; memory: number },
}
