export interface EventFilter {
  distance: number,
  latitude: number,
  longitude: number,
  fee?: number,
  scheduled_lte?: Date,
  scheduled_gte?: Date,
  tags?:[],
}
