import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab2Page } from './tab2.page';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  const a: SavedCounter = {
    id: 'a',
    name: 'Alfa',
    value: 5,
    createdAt: '2026-09-17T08:00:00.000Z',
  };
  const b: SavedCounter = {
    id: 'b',
    name: 'Beta',
    value: -2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };
  const c: SavedCounter = {
    id: 'c',
    name: 'Cecil',
    value: 0,
    createdAt: '2026-09-17T10:00:00.000Z',
  };

  const counters = signal<SavedCounter[]>([]);
  const removeMock = vi.fn().mockResolvedValue(undefined);
  const clearMock = vi.fn().mockResolvedValue(undefined);

  const event = (detail: object) => new CustomEvent('x', { detail });
  const ids = () => component.visibleCounters().map((counter) => counter.id);

  beforeEach(async () => {
    vi.clearAllMocks();
    counters.set([c, b, a]);

    await TestBed.configureTestingModule({
      imports: [Tab2Page],
      providers: [
        {
          provide: CounterService,
          useValue: {
            counters: counters.asReadonly(),
            initialized: signal(true).asReadonly(),
            initialize: vi.fn().mockResolvedValue(undefined),
            remove: removeMock,
            clear: clearMock,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute the sum of all saved values', () => {
    expect(component.total()).toBe(3);
  });

  it('should update the sum when data changes', () => {
    counters.update((list) => [{ ...a, id: 'd', value: 10 }, ...list]);

    expect(component.total()).toBe(13);
  });

  it('should sort newest first by default', () => {
    expect(ids()).toEqual(['c', 'b', 'a']);
  });

  it('should sort by oldest, name and value', () => {
    component.onSort(event({ value: 'oldest' }));
    expect(ids()).toEqual(['a', 'b', 'c']);

    component.onSort(event({ value: 'name' }));
    expect(ids()).toEqual(['a', 'b', 'c']);

    component.onSort(event({ value: 'valueDesc' }));
    expect(ids()).toEqual(['a', 'c', 'b']);

    component.onSort(event({ value: 'valueAsc' }));
    expect(ids()).toEqual(['b', 'c', 'a']);
  });

  it('should search by name case-insensitively', () => {
    component.onSearch(event({ value: 'bET' }));

    expect(ids()).toEqual(['b']);
  });

  it('should filter positive and negative values', () => {
    component.onFilter(event({ value: 'positive' }));
    expect(ids()).toEqual(['a']);

    component.onFilter(event({ value: 'negative' }));
    expect(ids()).toEqual(['b']);

    component.onFilter(event({ value: 'all' }));
    expect(ids()).toEqual(['c', 'b', 'a']);
  });

  it('should not change the sum when filtering', () => {
    component.onFilter(event({ value: 'positive' }));

    expect(component.total()).toBe(3);
  });

  it('should remove a record and show a toast', async () => {
    await component.remove('a');

    expect(removeMock).toHaveBeenCalledWith('a');
    expect(component.toastOpen()).toBe(true);
    expect(component.toastMessage()).toBe('Záznam byl odstraněn.');
  });

  it('should open the alert and not clear before confirmation', () => {
    component.openClearAlert();

    expect(component.alertOpen()).toBe(true);
    expect(clearMock).not.toHaveBeenCalled();
  });

  it('should clear history after confirmation', async () => {
    component.openClearAlert();
    await component.onAlertDismiss(event({ role: 'confirm' }));

    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(component.alertOpen()).toBe(false);
    expect(component.toastOpen()).toBe(true);
  });

  it('should not clear history when the alert is cancelled', async () => {
    component.openClearAlert();
    await component.onAlertDismiss(event({ role: 'cancel' }));

    expect(clearMock).not.toHaveBeenCalled();
    expect(component.alertOpen()).toBe(false);
  });
});