import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../../models/saved-counter';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should increment the counter', () => {
    component.increment();

    expect(component.count).toBe(1);
  });

  it('should decrement but never go below zero', () => {
    component.decrement();
    expect(component.count).toBe(0);

    component.count = 2;
    component.decrement();
    expect(component.count).toBe(1);
  });

  it('should reset the counter and update the template', () => {
    component.count = 5;
    component.reset();
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector(
      '.counter-value',
    ) as HTMLElement;

    expect(component.count).toBe(0);
    expect(value.textContent?.trim()).toBe('0');
  });

  it('should display the current count', () => {
    component.increment();
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector(
      '.counter-value',
    ) as HTMLElement;

    expect(value.textContent?.trim()).toBe('1');
  });

  it('should emit saved counter and reset state', () => {
    const emitted: SavedCounter[] = [];
    component.saved.subscribe((c) => emitted.push(c));

    component.counterName = '  Test  ';
    component.count = 4;
    component.save();

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject({ name: 'Test', value: 4 });
    expect(emitted[0].id).toBeTruthy();
    expect(emitted[0].createdAt).toBeTruthy();
    expect(component.counterName).toBe('');
    expect(component.count).toBe(0);
  });

  it('should not emit when name is empty', () => {
    const spy = vi.fn();
    component.saved.subscribe(spy);

    component.counterName = '   ';
    component.count = 3;
    component.save();

    expect(spy).not.toHaveBeenCalled();
    expect(component.count).toBe(3);
  });
});