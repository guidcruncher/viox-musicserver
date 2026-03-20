export const ConfigFileSchema = {
  type: "object",
  required: ["backEndLimit", "maxCacheSize", "radioProvider", "enableCache"],
  properties: {
    backEndLimit: { type: "number" },
    maxCacheSize: { type: "number" },
    radioProvider: { type: "string" },
    enableCache: { type: "boolean" },
    visualization: { type: "string" },
  },
}
