import {EventModel} from "./event-model";
import {CommentModel} from "./comment-model";

export interface Schedule {
  id: string,
  scheduled_at: Date,
  is_canceled:boolean,
  places_sub:number,
  distance?:number,
  event: EventModel,
  comments: CommentModel[]
}

export interface ScheduleCreate{
  event_id:string,
  scheduled_at: Date
}
