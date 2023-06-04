import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {AuthService} from "../shared/auth/auth.service";
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {ApiService} from "../api.service";
import {Tag} from "../shared/interfaces/tag";
import {map, Observable, startWith} from "rxjs";
import {MatChipEditedEvent, MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {EventFilter} from "../shared/interfaces/event-filter";
import {Schedule} from "../shared/interfaces/schedule";

@Component({
  selector: 'app-search-event',
  templateUrl: './search-event.component.html',
  styleUrls: ['./search-event.component.scss']
})
export class SearchEventComponent implements OnInit {
  tags: Tag[] = [];
  filteredTags: Observable<Tag[]> = new Observable<Tag[]>();
  tagCtrl = new FormControl();
  @Input() tapedSchedule?: string | undefined;
  @Input() startExplore: boolean = false;
  @Output() startExploreChange = new EventEmitter<boolean>();
  @Input() address: { title: string, position: { lat: number, lng: number } } = {title: '', position: {lat: 0, lng: 0}};
  schedule?: Schedule | undefined;
  searchForm: FormGroup;
  minDate: Date = new Date();
  schedules: Schedule[] = [];
  @Output() schedulesEvent = new EventEmitter<Schedule[]>();

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(private authService: AuthService, private api: ApiService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      distance: new FormControl(10, [Validators.required, Validators.min(1)]),
      fee: new FormControl(null, [Validators.min(0)]),
      scheduledAtStart: [this.minDate],
      scheduledAtEnd: ['',],
      tags: [[]]
    }, {validators: this.checkDates});
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

  ngOnChanges(changes: SimpleChanges) {
    const tapedSchedule = changes['tapedSchedule'];
    const schedule = changes['schedule'];
    if (tapedSchedule && tapedSchedule.currentValue) {
      this.findScheduleById(tapedSchedule.currentValue);
    } else if (tapedSchedule && tapedSchedule.currentValue !== true) {
      this.schedule = undefined;
    }
    if (schedule && schedule.currentValue) {
      this.schedules[this.schedules.findIndex(e => e.id === schedule.currentValue.id)] = schedule.currentValue;
    }
  }

  checkDates = (group: AbstractControl) => {
    let scheduledAtStart = group.get('scheduledAtStart')?.value;
    let scheduledAtEnd = group.get('scheduledAtEnd')?.value
    if (!scheduledAtStart || !scheduledAtEnd) {
      group.get('scheduledAtEnd')?.setErrors(null)
      return
    }
    scheduledAtStart <= scheduledAtEnd ? group.get('scheduledAtEnd')?.setErrors(null) : group.get('scheduledAtEnd')?.setErrors({lessDate: true})
  }

  startExploreEmit() {
    this.startExploreChange.emit(true)
  }

  get f() {
    return this.searchForm.controls;
  }

  private _filterTags(value: string): Tag[] {
    const filterValue = value.toLowerCase();

    return this.tags.filter(tag => tag.name.toLowerCase().includes(filterValue)).filter(tag => !this.f['tags'].value.includes(tag.name));
  }

  addTag(event: MatChipInputEvent) {
    const tag = (event.value || '').trim();
    if (tag && !this.f['tags'].value.includes(tag) && this.tags.includes({name: tag})) {
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

  findEvents() {
    let filter: EventFilter = {
      distance: this.f['distance'].value,
      latitude: this.address.position.lat,
      longitude: this.address.position.lng
    }
    if (this.f['tags'].value) {
      filter.tags = this.f['tags'].value;
    }
    if (this.f['fee'].value !== null) {
      filter.fee = this.f['fee'].value;
    }
    if (this.f['scheduledAtStart'].value) {
      filter.scheduled_gte = this.f['scheduledAtStart'].value.toISOString();
    }
    if (this.f['scheduledAtEnd'].value) {
      filter.scheduled_lte = this.f['scheduledAtEnd'].value.toISOString();
    }
    this.api.filterSchedules(filter).subscribe((res) => {
      if (res) {
        this.schedules = res;
        this.schedulesEvent.emit(res)
      }
    })
  }

  findScheduleById(id: string) {
    this.schedule = this.schedules.find(e => e.id === id);

  }
}
