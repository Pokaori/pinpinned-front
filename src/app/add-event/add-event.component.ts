import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {AuthService} from "../shared/auth/auth.service";
import {ApiService} from "../api.service";
import {map, Observable, startWith} from "rxjs";
import {Tag} from "../shared/interfaces/tag";
import {MatChipEditedEvent, MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {EventCreate} from "../shared/interfaces/event-model";
import {Schedule} from "../shared/interfaces/schedule";

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit {
  @Input() address: { title: string, position: { lat: number, lng: number } } = {title: '', position: {lat: 0, lng: 0}};
  addEventForm: FormGroup;
  minDate: Date = new Date();
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Tag[] = [];
  filteredTags: Observable<Tag[]> = new Observable<Tag[]>();
  tagCtrl = new FormControl();
  @ViewChild('autosize') autosize?: CdkTextareaAutosize;
  schedule?:Schedule;


  constructor(private authService: AuthService, private api: ApiService, private fb: FormBuilder) {
    this.addEventForm = this.fb.group({
      fee: new FormControl(0, [Validators.required, Validators.min(0)]),
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      duration: [1, [Validators.required, Validators.min(1), Validators.max(24)]],
      placesNumber: [10, [Validators.required, Validators.min(1)]],
      scheduledAt: [this.minDate, [Validators.required]],
      tags: [[], [Validators.required]]
    },);
  }

  ngOnInit(): void {
    this.api.getTags().subscribe((tags) => {
      this.tags = tags;
      // @ts-ignore
      this.filteredTags = this.tagCtrl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterTags(value || '')),
      );

    });
  }

  get f() {
    return this.addEventForm.controls;
  }

  private _filterTags(value: string): Tag[] {
    const filterValue = value.toLowerCase();

    return this.tags.filter(tag => tag.name.toLowerCase().includes(filterValue)).filter(tag => !this.f['tags'].value.includes(tag.name));
  }

  addTag(event: MatChipInputEvent) {
    const tag = (event.value || '').trim();
    if (tag && !this.f['tags'].value.includes(tag)) {
      this.f['tags'].value.push(tag);
      this.tagCtrl.setValue('')
    }
    event.chipInput!.clear();
  }

  selectedTag(event: MatAutocompleteSelectedEvent) {
    const tag = (event.option.viewValue || '').trim();
    if (tag && !this.f['tags'].value.includes(tag)) {
      this.f['tags'].value.push(tag);
      this.tagCtrl.setValue(null);
    }
  }

  removeTag(keyword: string) {
    const index = this.f['tags'].value.indexOf(keyword);
    if (index >= 0) {
      this.f['tags'].value.splice(index, 1);
    }
  }

  editTag(tag: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    if (!value) {
      this.removeTag(tag);
      return;
    }

    const index = this.f['tags'].value.indexOf(tag);
    if (index >= 0) {
      this.f['tags'].value[index] = value;
    }
  }

  createEvent() {
    let event: EventCreate = {
      title: this.f['title'].value,
      description: this.f['description'].value,
      fee: this.f['fee'].value,
      duration: this.f['duration'].value,
      place_number: this.f['placesNumber'].value,
      latitude: this.address.position.lat,
      longitude: this.address.position.lng,
      tags: this.f['tags'].value
    }
    this.api.createEvent(event).subscribe((res) => {
      if (res) {
        this.api.createSchedule({event_id: res.id, scheduled_at: this.f['scheduledAt'].value.toISOString()}).subscribe((schedule)=>{
          this.schedule=schedule
        })
      }

    })

  }
}
