import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapAppComponent } from './map-app.component';

describe('MapAppComponent', () => {
  let component: MapAppComponent;
  let fixture: ComponentFixture<MapAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
