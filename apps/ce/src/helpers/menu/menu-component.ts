export interface HeaderData {
  header?: string
  subheader?: string
  description?: string
  level?: number
  gap?: number
}

export interface BoxData {
  type?: string
  min?: number
  max?: number
  placeholder?: string
  label?: string
  property: string
  icon?: string
}

export interface TileData {
  type?: string
  icon?: string
  header?: string
  property?: string
  fill?: string
  description?: string
  value: string
  iconSize?: number
}

export interface GridData {
  size?: number
  type?: string
}

export interface ColumnData {
  type?: string
}

export type MenuComponentData =
  | HeaderData
  | BoxData
  | TileData
  | GridData
  | ColumnData
  | Record<string, unknown>

export interface MenuComponent {
  id: string
  name: string
  data: MenuComponentData
  children: MenuComponent[]
}
