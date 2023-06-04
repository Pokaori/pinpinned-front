import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SureDialogComponent } from './sure-dialog.component';

describe('SureDialogComponent', () => {
  let component: SureDialogComponent;
  let fixture: ComponentFixture<SureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SureDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
