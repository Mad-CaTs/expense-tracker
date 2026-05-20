import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ReportService } from '../../../core/services/report.service';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { ReportSummary, CategoryBreakdown, PeriodType } from '../../../core/models/report.model';
import { Budget } from '../../../core/models/budget.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, DecimalPipe],
  template: `
    <div class="space-y-6">
      <h1 class="page-title">Reportes</h1>

      <!-- Filtros -->
      <div class="card overflow-hidden">
        <button type="button" (click)="filtersOpen = !filtersOpen"
                class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/40 transition-colors">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            <span class="text-sm font-medium text-gray-300">Filtros</span>
            <span *ngIf="activeFilterCount > 0"
                  class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {{ activeFilterCount }}
            </span>
          </div>
          <svg class="w-4 h-4 text-gray-500 transition-transform duration-200"
               [class.rotate-180]="filtersOpen"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <div *ngIf="filtersOpen" class="px-4 pb-4 border-t border-gray-800 pt-3 space-y-3">
          <!-- Fila 1: botones de período -->
          <div class="flex gap-2 flex-wrap">
            <button *ngFor="let p of periods"
                    (click)="setPeriod(p.value)"
                    [class]="period === p.value ? 'btn-primary' : 'btn-secondary'"
                    class="text-xs">
              {{ p.label }}
            </button>
          </div>
          <!-- Fila 2: categoría -->
          <div class="flex gap-2 items-end">
            <div class="flex-1 sm:flex-none sm:w-48">
              <label class="label">Categoría</label>
              <select [(ngModel)]="categoryId" class="input-field w-full" (change)="load()">
                <option [ngValue]="undefined" class="bg-gray-800">Todas las categorías</option>
                <option *ngFor="let c of categories" [ngValue]="c.id" class="bg-gray-800">{{ c.name }}</option>
              </select>
            </div>
            <button *ngIf="categoryId != null" (click)="categoryId = undefined; load()" class="btn-secondary text-sm self-end">
              Limpiar
            </button>
          </div>

          <!-- Fila 2: Desde/Hasta — solo con Personalizado -->
          <div *ngIf="period === 'CUSTOM'" class="flex gap-3">
            <div class="flex-1">
              <label class="label">Desde</label>
              <input type="date" [(ngModel)]="fromDate" class="input-field w-full" (change)="load()">
            </div>
            <div class="flex-1">
              <label class="label">Hasta</label>
              <input type="date" [(ngModel)]="toDate" class="input-field w-full" (change)="load()">
            </div>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <div *ngIf="summary" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Bloque principal: período actual (ocupa 1 columna) -->
        <div class="card p-5">
          <p class="kpi-label">Total período actual</p>
          <p class="kpi-value">S/ {{ summary.currentTotal | number:'1.2-2' }}</p>
          <p class="kpi-meta">{{ summary.currentFrom }} → {{ summary.currentTo }}</p>
          <p class="kpi-meta mt-2">Promedio diario: S/ {{ summary.dailyAverage | number:'1.2-2' }}</p>
        </div>
        <!-- Bloque secundario: comparación (columna derecha, 2 filas) -->
        <div class="grid grid-rows-2 gap-4">
          <div class="card p-4">
            <p class="kpi-label">Período anterior</p>
            <p class="text-xl font-extrabold tracking-tight" style="color:#f0f0f0">S/ {{ summary.previousTotal | number:'1.2-2' }}</p>
            <p class="kpi-meta">{{ summary.previousFrom }} → {{ summary.previousTo }}</p>
          </div>
          <div class="card p-4 flex flex-col justify-center">
            <p class="kpi-label">Variación</p>
            <p class="text-2xl font-extrabold tracking-tight"
               [class.kpi-delta-positive]="summary.changePercentage <= 0"
               [class.kpi-delta-negative]="summary.changePercentage > 0">
              {{ summary.changePercentage > 0 ? '+' : '' }}{{ summary.changePercentage | number:'1.1-1' }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-4">
          <h3 class="section-label">Por categoría</h3>
          <div class="h-56 sm:h-64 flex items-center justify-center" *ngIf="pieData">
            <canvas baseChart [data]="pieData" type="pie" [options]="pieOptions"></canvas>
          </div>
          <div *ngIf="!pieData" class="h-56 sm:h-64 flex flex-col items-center justify-center gap-3">
            <svg class="w-10 h-10" style="color:#2a2a2e" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
            </svg>
            <p class="text-sm" style="color:#555555">Sin datos para este período</p>
          </div>
        </div>
        <div class="card p-4">
          <h3 class="section-label">Detalle por categoría</h3>
          <div *ngIf="breakdown.length === 0" class="h-64 flex flex-col items-center justify-center gap-3">
            <svg class="w-10 h-10" style="color:#2a2a2e" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <p class="text-sm" style="color:#555555">Sin gastos registrados</p>
          </div>
          <ul class="space-y-2" *ngIf="breakdown.length > 0">
            <li *ngFor="let b of breakdown" class="flex items-center gap-2">
              <div class="flex-1">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium" style="color:#f0f0f0">{{ b.categoryName }}</span>
                  <span style="color:#666666">S/ {{ b.total | number:'1.2-2' }}</span>
                </div>
                <div class="h-2 rounded-full overflow-hidden" style="background-color:#1e1e20">
                  <div class="h-2 rounded-full" [style.width.%]="b.percentage" style="background-color:#005bd3"></div>
                </div>
              </div>
              <span class="text-xs w-10 text-right" style="color:#666666">{{ b.percentage | number:'1.0-0' }}%</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Presupuestos del mes -->
      <div class="card p-4" *ngIf="budgets.length > 0">
        <h3 class="section-label">Presupuestos — {{ currentMonthLabel }}</h3>
        <ul class="space-y-4 mt-2">
          <li *ngFor="let b of budgets">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background-color]="b.categoryColor"></span>
                <span class="text-sm font-medium" style="color:#f0f0f0">{{ b.categoryName }}</span>
                <span *ngIf="b.percentage >= 100"
                      class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">SUPERADO</span>
                <span *ngIf="b.percentage >= 80 && b.percentage < 100"
                      class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">ALERTA</span>
              </div>
              <span class="text-sm" style="color:#666666">
                S/ {{ b.spent | number:'1.2-2' }}
                <span> / </span>
                S/ {{ b.amount | number:'1.2-2' }}
              </span>
            </div>
            <div class="h-2 rounded-full overflow-hidden" style="background-color:#1e1e20">
              <div class="h-2 rounded-full transition-all duration-500"
                   [style.width.%]="b.percentage"
                   [class.bg-green-500]="b.percentage < 80"
                   [class.bg-yellow-500]="b.percentage >= 80 && b.percentage < 100"
                   [class.bg-red-500]="b.percentage >= 100">
              </div>
            </div>
            <div class="flex justify-between text-xs mt-1" style="color:#666666">
              <span>{{ b.percentage | number:'1.0-0' }}% utilizado</span>
              <span>S/ {{ (b.amount - b.spent) | number:'1.2-2' }} restante</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class ReportDashboardComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly budgetService = inject(BudgetService);
  private readonly categoryService = inject(CategoryService);

  summary: ReportSummary | null = null;
  breakdown: CategoryBreakdown[] = [];
  budgets: Budget[] = [];
  categories: Category[] = [];
  period: PeriodType = 'MONTHLY';
  filtersOpen = false;
  fromDate = '';
  toDate = '';
  categoryId: number | undefined = undefined;

  periods = [
    { value: 'DAILY' as PeriodType, label: 'Hoy' },
    { value: 'WEEKLY' as PeriodType, label: 'Esta semana' },
    { value: 'MONTHLY' as PeriodType, label: 'Este mes' },
    { value: 'YEARLY' as PeriodType, label: 'Este año' },
    { value: 'ALL' as PeriodType, label: 'Todo' },
    { value: 'CUSTOM' as PeriodType, label: 'Personalizado' },
  ];

  get activeFilterCount(): number {
    return this.categoryId != null ? 1 : 0;
  }

  monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  get currentMonthLabel(): string {
    const now = new Date();
    return `${this.monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }

  pieData: ChartData<'pie'> | null = null;
  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 12, font: { size: 11 } } }
    }
  };

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(c => this.categories = c);
    this.load();
  }

  setPeriod(p: PeriodType): void {
    this.period = p;
    this.fromDate = '';
    this.toDate = '';
    this.load();
  }

  clearFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.categoryId = undefined;
    this.period = 'MONTHLY';
    this.load();
  }

  load(): void {
    const now = new Date();
    const from = this.period === 'CUSTOM' ? this.fromDate || undefined : undefined;
    const to = this.period === 'CUSTOM' ? this.toDate || undefined : undefined;
    this.reportService.getSummary(this.period, from, to, this.categoryId).subscribe(s => this.summary = s);
    this.reportService.getCategoryBreakdown(this.period, from, to, this.categoryId).subscribe(b => {
      this.breakdown = b;
      this.pieData = b.length > 0 ? {
        labels: b.map(x => x.categoryName),
        datasets: [{
          data: b.map(x => x.total),
          backgroundColor: ['#6366f1','#ef4444','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#14b8a6'],
          borderWidth: 0
        }]
      } : null;
    });
    this.budgetService.getByPeriod(now.getMonth() + 1, now.getFullYear())
      .subscribe(b => this.budgets = b);
  }
}
