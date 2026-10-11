import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  const addMock = vi.fn().mockResolvedValue(undefined);

  const counter: SavedCounter = {
    id: 'x',
    name: 'Test',
    value: 3,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  beforeEach(async () => {
    addMock.mockClear();

    await TestBed.configureTestingModule({
      imports: [Tab1Page],
      providers: [
        {
          provide: CounterService,
          useValue: { add: addMock, initialize: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass saved counter to CounterService', async () => {
    await component.onSaved(counter);

    expect(addMock).toHaveBeenCalledWith(counter);
  });

  it('should show a toast after saving', async () => {
    expect(component.toastOpen()).toBe(false);

    await component.onSaved(counter);

    expect(component.toastOpen()).toBe(true);
  });
});