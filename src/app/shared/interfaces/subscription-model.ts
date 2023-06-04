import {Schedule} from "./schedule";
import {User} from "./user";

export interface SubscriptionModel{
  id: string,
  people_number: number,
  schedule: Schedule,
  user: User
}
export interface SubscriptionCreate{
  people_number: number,
  schedule_id: string
}
