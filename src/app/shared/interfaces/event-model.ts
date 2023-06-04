import {User} from "./user";
import {Tag} from "./tag";

export interface EventModel {
  id: string,
  title: string,
  description: string,
  duration: number,
  fee: number,
  place_number: number,
  place: {
    latitude: number,
    longitude: number,
  }
  tags: Tag[],
  author: User,
  is_canceled: boolean
}

export interface EventCreate {
  title: string,
  description: string,
  duration: number,
  fee: number,
  latitude: number,
  longitude: number,
  place_number: number,
  tags: string[],
}
