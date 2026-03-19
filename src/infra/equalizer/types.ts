export interface EqPresetRecord {
  id: number
  name: string
  gain: number
}

export interface EqBandRecord {
  id: number
  preset_id: number
  frequency: string
  gain_db: number
}
