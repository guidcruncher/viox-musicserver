import { AxiosInstance } from "axios"

import { Category, CategoryItem } from "./types"

export class CategoryService {
  constructor(private http: AxiosInstance) {}

  /**
   * GET /category
   * Returns all categories
   */
  async getCategories(): Promise<CategoryItem[]> {
    const res = await this.http.get("/category")
    const items: CategoryItem[] = []

    if (res.data) {
      if (res.data.length > 0) {
        res.data[0].forEach((item: any) => {
          if (item.category) {
            const index = items.findIndex((t: any) => t.id == item.category.id)
            if (index < 0) {
              items.push(item.category)
            }
          }
        })
      }
    }

    return items.sort((a, b) => a.title.localeCompare(b.title))
  }

  /**
   * GET /category/:id
   * Returns a single category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const res = await this.http.get(`/category/${id}`)
    return res.data
  }
}
