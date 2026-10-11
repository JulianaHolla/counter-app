import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

export type SortMode = 'newest' | 'oldest' | 'name' | 'valueDesc' | 'valueAsc';
export type FilterMode = 'all' | 'positive' | 'negative';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonAlert,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  readonly search = signal('');
  readonly sort = signal<SortMode>('newest');
  readonly filter = signal<FilterMode>('all');

  readonly alertOpen = signal(false);
  readonly toastOpen = signal(false);
  readonly toastMessage = signal('');

  readonly alertButtons = [
    { text: 'Zrušit', role: 'cancel' },
    { text: 'Vymazat', role: 'confirm' },
  ];

  readonly total = computed(() =>
    this.counterService
      .counters()
      .reduce((sum, counter) => sum + counter.value, 0),
  );

  readonly visibleCounters = computed(() => {
    const term = this.search().trim().toLowerCase();
    const filter = this.filter();

    const result = this.counterService.counters().filter((counter) => {
      if (term && !counter.name.toLowerCase().includes(term)) {
        return false;
      }
      if (filter === 'positive') {
        return counter.value > 0;
      }
      if (filter === 'negative') {
        return counter.value < 0;
      }
      return true;
    });

    switch (this.sort()) {
      case 'oldest':
        return result.sort(
          (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
        );
      case 'name':
        return result.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
      case 'valueDesc':
        return result.sort((a, b) => b.value - a.value);
      case 'valueAsc':
        return result.sort((a, b) => a.value - b.value);
      default:
        return result.sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
        );
    }
  });

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  onSearch(event: Event): void {
    this.search.set((event as CustomEvent).detail.value ?? '');
  }

  onSort(event: Event): void {
    this.sort.set((event as CustomEvent).detail.value as SortMode);
  }

  onFilter(event: Event): void {
    this.filter.set((event as CustomEvent).detail.value as FilterMode);
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    this.showToast('Záznam byl odstraněn.');
  }

  openClearAlert(): void {
    this.alertOpen.set(true);
  }

  async onAlertDismiss(event: Event): Promise<void> {
    const role = (event as CustomEvent<{ role?: string }>).detail?.role;
    this.alertOpen.set(false);

    if (role === 'confirm') {
      await this.counterService.clear();
      this.showToast('Historie byla vymazána.');
    }
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastOpen.set(true);
  }
}