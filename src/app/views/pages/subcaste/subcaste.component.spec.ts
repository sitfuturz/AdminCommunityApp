import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcasteComponent } from './subcaste.component';

describe('SubcasteComponent', () => {
  let component: SubcasteComponent;
  let fixture: ComponentFixture<SubcasteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubcasteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubcasteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
