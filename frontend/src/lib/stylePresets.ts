export type StylePresetCategory = 'door_style' | 'frame_type' | 'drawer_style' | 'finish' | 'hardware'

export interface StylePreset {
  id: string
  name: string
  category: StylePresetCategory
  description: string
  thumbnail?: string
  previewImage?: string
  icon?: string
  popular?: boolean
  settings: {
    doorStyle?: string
    frameType?: string
    drawerStyle?: string
    finish?: string
    hardware?: string
    overlay?: 'full' | 'partial' | 'inset'
    hingeType?: string
    drawerSlide?: string
    material?: string
    color?: string
    style?: string
    [key: string]: string | undefined
  }
  tags?: string[]
  features?: string[]
}

export const STYLE_PRESETS: Record<string, StylePreset> = {
  shaker_white: {
    id: 'shaker_white',
    name: 'Shaker White',
    category: 'door_style',
    description: 'Classic shaker-style doors with crisp white finish. Timeless appeal for any kitchen.',
    settings: { doorStyle: 'shaker', finish: 'paint_white', frameType: 'face_frame', overlay: 'partial', hingeType: 'concealed' },
    tags: ['popular', 'classic', 'painted'],
  },
  flat_panel_modern: {
    id: 'flat_panel_modern',
    name: 'Flat Panel Modern',
    category: 'door_style',
    description: 'Sleek flat-panel doors for a contemporary, minimal look.',
    settings: { doorStyle: 'flat_panel', finish: 'matte_gray', frameType: 'frameless', overlay: 'full', hingeType: 'concealed' },
    tags: ['modern', 'minimal'],
  },
  raised_panel_traditional: {
    id: 'raised_panel_traditional',
    name: 'Raised Panel Traditional',
    category: 'door_style',
    description: 'Elegant raised-panel doors with rich wood finish. Traditional and formal.',
    settings: { doorStyle: 'raised_panel', finish: 'stain_cherry', frameType: 'face_frame', overlay: 'partial', hingeType: 'exposed' },
    tags: ['traditional', 'formal', 'stained'],
  },
  inset_craftsman: {
    id: 'inset_craftsman',
    name: 'Inset Craftsman',
    category: 'door_style',
    description: 'Inset doors with craftsman detailing. Precise fit with classic appeal.',
    settings: { doorStyle: 'shaker', finish: 'paint_navy', frameType: 'face_frame', overlay: 'inset', hingeType: 'butt' },
    tags: ['craftsman', 'inset', 'painted'],
  },
  frameless_euro: {
    id: 'frameless_euro',
    name: 'European Frameless',
    category: 'frame_type',
    description: 'Full-access frameless construction for maximum interior space.',
    settings: { frameType: 'frameless', overlay: 'full', hingeType: 'concealed', drawerSlide: 'undermount' },
    tags: ['euro', 'modern', 'frameless'],
  },
  face_frame_classic: {
    id: 'face_frame_classic',
    name: 'Face Frame Classic',
    category: 'frame_type',
    description: 'Traditional face-frame construction for strength and style versatility.',
    settings: { frameType: 'face_frame', overlay: 'partial', hingeType: 'concealed' },
    tags: ['traditional', 'face-frame'],
  },
  soft_close_drawers: {
    id: 'soft_close_drawers',
    name: 'Soft-Close Undermount',
    category: 'drawer_style',
    description: 'Premium undermount drawer slides with full-extension and soft-close.',
    settings: { drawerStyle: 'dovetail', drawerSlide: 'undermount_soft_close' },
    tags: ['premium', 'soft-close'],
  },
  natural_oak: {
    id: 'natural_oak',
    name: 'Natural Oak',
    category: 'finish',
    description: 'Clear-coated natural oak for a warm, organic look.',
    settings: { finish: 'stain_natural_oak' },
    tags: ['wood', 'natural', 'warm'],
  },
  two_tone: {
    id: 'two_tone',
    name: 'Two-Tone',
    category: 'finish',
    description: 'White uppers and navy lowers — on-trend two-tone kitchen.',
    settings: { finish: 'two_tone_white_navy' },
    tags: ['trendy', 'two-tone'],
  },
  bar_pulls: {
    id: 'bar_pulls',
    name: 'Bar Pulls',
    category: 'hardware',
    description: 'Sleek bar pulls in brushed nickel for a modern, clean look.',
    settings: { hardware: 'bar_pull_brushed_nickel' },
    tags: ['modern', 'hardware'],
  },
  bin_pulls: {
    id: 'bin_pulls',
    name: 'Cup Bin Pulls',
    category: 'hardware',
    description: 'Classic cup bin pulls in oil-rubbed bronze for a farmhouse feel.',
    settings: { hardware: 'cup_pull_oil_rubbed_bronze' },
    tags: ['farmhouse', 'vintage', 'hardware'],
  },
}
