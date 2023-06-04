import {User} from "./user";

export interface CommentModel{
  id:string,
  text: string,
  rating?: number,
  user: User
}

export interface CommentCreate{
  text: string,
  rating?: number,
  schedule_id: string,
}
