import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Tag} from "./shared/interfaces/tag";
import {EventFilter} from "./shared/interfaces/event-filter";
import {EventCreate, EventModel} from "./shared/interfaces/event-model";
import {Schedule, ScheduleCreate} from "./shared/interfaces/schedule";
import {SubscriptionCreate, SubscriptionModel} from "./shared/interfaces/subscription-model";
import {CommentCreate, CommentModel} from "./shared/interfaces/comment-model";
import {environment} from "../environment/environment";
import { User } from "./shared/interfaces/user";

const baseUrl = environment.backURL;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${baseUrl}tags/`, httpOptions);
  }

  createEvent(event: EventCreate): Observable<EventModel> {
    return this.http.post<EventModel>(`${baseUrl}event/`, event, httpOptions);
  }

  getSchedule(schedule_id: string){
    return this.http.get<Schedule>(`${baseUrl}schedule/${schedule_id}`, httpOptions);
  }
  createSchedule(schedule: ScheduleCreate): Observable<Schedule> {
    return this.http.post<Schedule>(`${baseUrl}schedule/`, schedule, httpOptions);
  }

  cancelSchedule(schedule_id: string){
    return this.http.post<Schedule>(`${baseUrl}schedule/${schedule_id}/cancel`, httpOptions);
  }

  uncancelSchedule(schedule_id: string){
    return this.http.post<Schedule>(`${baseUrl}schedule/${schedule_id}/uncancel`, httpOptions);
  }
  filterSchedules(filters: EventFilter): Observable<Schedule[]> {
    let options: { headers: HttpHeaders, params?: HttpParams } = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    options["params"] = new HttpParams({fromObject: Object(filters)})
    return this.http.get<Schedule[]>(`${baseUrl}schedule/`, options);
  }

  getSubscription(schedule_id: string): Observable<SubscriptionModel> {
    let options: { headers: HttpHeaders, params?: HttpParams } = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    options["params"] = new HttpParams({fromObject: {schedule_id: schedule_id}})
    return this.http.get<SubscriptionModel>(`${baseUrl}subscription/schedule`, options);
  }

  subscribeEvent(data: SubscriptionCreate): Observable<SubscriptionModel> {
    return this.http.post<SubscriptionModel>(`${baseUrl}subscription/`, data, httpOptions);
  }
  unsubscribeEvent(subscription_id: string): Observable<SubscriptionModel> {
    return this.http.delete<SubscriptionModel>(`${baseUrl}subscription/${subscription_id}`,  httpOptions);
  }

  createComment(data:CommentCreate): Observable<CommentModel>{
    return this.http.post<CommentModel>(`${baseUrl}comment/`, data, httpOptions);
  }
  updateComment(data:CommentCreate, comment_id:string): Observable<CommentModel>{
    return this.http.put<CommentModel>(`${baseUrl}comment/${comment_id}`, data, httpOptions);
  }

  deleteComment(comment_id:string): Observable<CommentModel>{
    return this.http.delete<CommentModel>(`${baseUrl}comment/${comment_id}`, httpOptions);
  }

  verifyEmail( user_id: string ): Observable<User> {
    return this.http.post<User>(`${baseUrl}auth/verify/${user_id}/`, {}, httpOptions)
  }
}


