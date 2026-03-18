// src/routes/media/removeMedia.ts
import { presetRepository } from "../../repositories/presetRepository"

export async function removeMedia(app: any) {
  app.delete(
    "/media/presets/:id",
    {
      schema: {
        tags: ["Media"],
      },
    },
    async (req: any) => {
      const id = req.params.id
      presetRepository.deleteById(id)
    },
  )
}
