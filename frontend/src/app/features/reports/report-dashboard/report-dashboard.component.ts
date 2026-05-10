import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ReportService } from '../../../core/services/report.service';
import { BudgetService } from '../../../core/services/budget.service';
import { ReportSummary, CategoryBreakdown, PeriodType } from '../../../core/models/report.model';
import { Budget } from '../../../core/models/budget.model';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, DecimalPipe],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3">
        <h1 class="page-title">Reportes</h1>
        <div class="grid grid-cols-3 sm:flex gap-2">
          <button *ngFor="let p of periods"
                  (click)="setPeriod(p.value)"
                  [class]="period === p.value ? 'btn-primary' : 'btn-secondary'"
                  class="text-xs">
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div *ngIf="summary" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card p-4">
          <p class="text-sm text-gray-500">Total período actual</p>
          <p class="text-2xl font-bold text-white">S/ {{ summary.currentTotal | number:'1.2-2' }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ summary.currentFrom }} → {{ summary.currentTo }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Total período anterior</p>
          <p class="text-2xl font-bold text-white">S/ {{ summary.previousTotal | number:'1.2-2' }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ summary.previousFrom }} → {{ summary.previousTo }}</p>
        </div>
        <div class="card p-4">
          <p class="text-sm text-gray-500">Variación</p>
          <p class="text-2xl font-bold"
             [class.text-green-400]="summary.changePercentage <= 0"
             [class.text-red-400]="summary.changePercentage > 0">
            {{ summary.changePercentage > 0 ? '+' : '' }}{{ summary.changePercentage | number:'1.1-1' }}%
          </p>
          <p class="text-xs text-gray-500 mt-1">Promedio diario: S/ {{ summary.dailyAverage | number:'1.2-2' }}</p>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-4">
          <h3 class="section-label">Por categoría</h3>
          <div class="h-56 sm:h-64 flex items-center justify-center" *ngIf="pieData">
            <canvas baseChart [data]="pieData" type="pie" [options]="pieOptions"></canvas>
          </div>
          <div *ngIf="!pieData" class="h-56 sm:h-64 flex items-center justify-center text-gray-500 text-sm">
            Sin datos
          </div>
        </div>
        <div class="card p-4">
          <h3 class="section-label">Detalle por categoría</h3>
          <div *ngIf="breakdown.length === 0" class="h-64 flex items-center justify-center text-gray-500 text-sm">
            Sin datos
          </div>
          <ul class="space-y-2" *ngIf="breakdown.length > 0">
            <li *ngFor="let b of breakdown" class="flex items-center gap-2">
              <div class="flex-1">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium text-gray-100">{{ b.categoryName }}</span>
                  <span class="text-gray-400">S/ {{ b.total | number:'1.2-2' }}</span>
                </div>
                <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-2 bg-blue-500 rounded-full" [style.width.%]="b.percentage"></div>
                </div>
              </div>
              <span class="text-xs text-gray-500 w-10 text-right">{{ b.percentage | number:'1.0-0' }}%</span>
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
                <span class="text-sm font-medium text-gray-100">{{ b.categoryName }}</span>
                <span *ngIf="b.percentage >= 100"
                      class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">SUPERADO</span>
                <span *ngIf="b.percentage >= 80 && b.percentage < 100"
                      class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">ALERTA</span>
              </div>
              <span class="text-sm text-gray-400">
                S/ {{ b.spent | number:'1.2-2' }}
                <span class="text-gray-600"> / </span>
                S/ {{ b.amount | number:'1.2-2' }}
              </span>
            </div>
            <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-2 rounded-full transition-all duration-500"
                   [style.width.%]="b.percentage"
                   [class.bg-green-500]="b.percentage < 80"
                   [class.bg-yellow-500]="b.percentage >= 80 && b.percentage < 100"
                   [class.bg-red-500]="b.percentage >= 100">
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mt-1">
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

  summary: ReportSummary | null = null;
  breakdown: CategoryBreakdown[] = [];
  budgets: Budget[] = [];
  period: PeriodType = 'MONTHLY';

  periods = [
    { value: 'DAILY' as PeriodType, label: 'Hoy' },
    { value: 'WEEKLY' as PeriodType, label: 'Esta semana' },
    { value: 'MONTHLY' as PeriodType, label: 'Este mes' },
  ];

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

  ngOnInit(): void { this.load(); }

  setPeriod(p: PeriodType): void { this.period = p; this.load(); }

  load(): void {
    const now = new Date();
    this.reportService.getSummary(this.period).subscribe(s => this.summary = s);
    this.reportService.getCategoryBreakdown().subscribe(b => {
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
