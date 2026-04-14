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

export const validBands: Record<string, string> = {
  "63 Hz": "eq_band_1:Gain",
  "125 Hz": "eq_band_2:Gain",
  "250 Hz": "eq_band_3:Gain",
  "500 Hz": "eq_band_4:Gain",
  "1 kHz": "eq_band_5:Gain",
  "2 kHz": "eq_band_6:Gain",
  "4 kHz": "eq_band_7:Gain",
  "8 kHz": "eq_band_8:Gain",
}
