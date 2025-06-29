import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from "../../service/report.service";
import { CommonModule } from "@angular/common";
import { ChartModule } from 'primeng/chart';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProductVariantInfo } from "../../../../shared/models/product-variant-info.model";
import { StockRow } from "../../../../shared/models/stock-row.model";
import {DialogModule} from "primeng/dialog";
import {ReportOrder} from "../../../../shared/models/report-order.model";
import {Page} from "../../../../shared/models/promotion.model";
import {AuthService} from "../../../../core/services/auth.service";
import { PaginatorModule } from 'primeng/paginator';
import {Observable} from "rxjs";
import { TablePageEvent } from 'primeng/table';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    TableModule,
    ButtonModule,
    DialogModule,
    PaginatorModule
  ],
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.scss']
})
export class ReportDashboardComponent implements OnInit {
  // ─── "Hôm nay" ─────────────────────────────────────────────────────────────
  totalOrdersToday = 0;
  revenueToday = 0;
  profitToday = 0;

  // ─── "Tuần này" ────────────────────────────────────────────────────────────
  revenueThisWeek = 0;
  profitThisWeek = 0;

  // ─── "Tháng này" ───────────────────────────────────────────────────────────
  revenueThisMonth = 0;
  profitThisMonth = 0;

  // ─── Tồn kho ──────────────────────────────────────────────────────────────
  stockByProduct: Record<string, ProductVariantInfo[]> = {};
  stockData: StockRow[] = [];

  // ─── Biểu đồ cột "hôm nay" ─────────────────────────────────────────────────
  barData: any;
  barOptions: any;

  // ─── Biểu đồ cột "tuần này" ────────────────────────────────────────────────
  weeklyBarData: any;
  weeklyBarOptions: any;

  // ─── Biểu đồ cột "tháng này" ───────────────────────────────────────────────
  monthlyBarData: any;
  monthlyBarOptions: any;

  // ─── Biểu đồ tròn (pie) cho trạng thái từng biến thể ───────────────────────
  pieData: any;
  pieOptions: any;

  // Biến chi tiết
  detailVisible = false;
  detailData: ReportOrder[] = [];
  detailTotal = 0;
  detailPageSize = 10;
  detailPage = 0;
  detailPeriod: 'today' | 'week' | 'month' = 'today';

  @ViewChild('dt') dataTable!: Table;

  constructor(
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initCharts();
    this.loadReports();
  }

  private initCharts() {
    const docStyle = getComputedStyle(document.documentElement);
    const textColor = docStyle.getPropertyValue('--text-color');
    const textColorSecondary = docStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = docStyle.getPropertyValue('--surface-border');

    // ───── Bar Chart "Hôm nay" ───────────────────────────────────────────────
    this.barData = {
      labels: ['Doanh thu', 'Lợi nhuận'],
      datasets: [
        {
          label: 'Hôm nay',
          data: [0, 0],
          backgroundColor: [
            'rgba(0, 122, 255, 0.5)',
            'rgba(88, 86, 214, 0.5)'
          ],
          borderColor: [
            'rgb(0, 122, 255)',
            'rgb(88, 86, 214)'
          ],
          borderWidth: 1
        }
      ]
    };
    this.barOptions = {
      plugins: {
        legend: { labels: { color: textColor } },
        title: {
          display: true,
          text: 'Doanh thu & Lợi nhuận hôm nay',
          color: textColor,
          font: { size: 16, weight: '500' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        },
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        }
      }
    };

    // ───── Bar Chart "Tuần này" ──────────────────────────────────────────────
    this.weeklyBarData = {
      labels: ['Doanh thu', 'Lợi nhuận'],
      datasets: [
        {
          label: 'Tuần này',
          data: [0, 0],
          backgroundColor: [
            'rgba(255, 159, 64, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ],
          borderColor: [
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)'
          ],
          borderWidth: 1
        }
      ]
    };
    this.weeklyBarOptions = {
      plugins: {
        legend: { labels: { color: textColor } },
        title: {
          display: true,
          text: 'Doanh thu & Lợi nhuận tuần này',
          color: textColor,
          font: { size: 16, weight: '500' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        },
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        }
      }
    };

    // ───── Bar Chart "Tháng này" ─────────────────────────────────────────────
    this.monthlyBarData = {
      labels: ['Doanh thu', 'Lợi nhuận'],
      datasets: [
        {
          label: 'Tháng này',
          data: [0, 0],
          backgroundColor: [
            'rgba(153, 102, 255, 0.5)',
            'rgba(54, 162, 235, 0.5)'
          ],
          borderColor: [
            'rgb(153, 102, 255)',
            'rgb(54, 162, 235)'
          ],
          borderWidth: 1
        }
      ]
    };
    this.monthlyBarOptions = {
      plugins: {
        legend: { labels: { color: textColor } },
        title: {
          display: true,
          text: 'Doanh thu & Lợi nhuận tháng này',
          color: textColor,
          font: { size: 16, weight: '500' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        },
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        }
      }
    };

    // ───── Pie Chart (tròn) cho trạng thái biến thể ──────────────────────────
    this.pieData = {
      labels: ['Hết hàng', 'Sắp hết', 'Còn ít', 'Đủ hàng'],
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: [
            '#f44336', // đỏ
            '#ff9800', // cam
            '#ffeb3b', // vàng
            '#4caf50'  // xanh lá
          ]
        }
      ]
    };
    this.pieOptions = {
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { color: textColor }
        },
        title: {
          display: true,
          text: 'Phân bố trạng thái từng biến thể',
          color: textColor,
          font: { size: 16, weight: '500' }
        }
      }
    };
  }

  loadReports(): void {
    // ─── (1) Số đơn/hôm nay ─────────────────────────────────────────────────
    this.reportService.getTotalOrdersToday().subscribe(res => {
      this.totalOrdersToday = res.totalOrdersToday;
    });

    // ─── (2) Doanh thu & Lợi nhuận/hôm nay ───────────────────────────────────
    this.reportService.getRevenueToday().subscribe(res => {
      this.revenueToday = res.revenueToday;
      this.updateBarChart();
    });
    this.reportService.getProfitToday().subscribe(res => {
      this.profitToday = res.profitToday;
      this.updateBarChart();
    });

    // ─── (3) Doanh thu & Lợi nhuận/tuần này ──────────────────────────────────
    this.reportService.getRevenueThisWeek().subscribe(res => {
      this.revenueThisWeek = res.revenueThisWeek;
      this.updateWeeklyBarChart();
    });
    this.reportService.getProfitThisWeek().subscribe(res => {
      this.profitThisWeek = res.profitThisWeek;
      this.updateWeeklyBarChart();
    });

    // ─── (4) Doanh thu & Lợi nhuận/tháng này ─────────────────────────────────
    this.reportService.getRevenueThisMonth().subscribe(res => {
      this.revenueThisMonth = res.revenueThisMonth;
      this.updateMonthlyBarChart();
    });
    this.reportService.getProfitThisMonth().subscribe(res => {
      this.profitThisMonth = res.profitThisMonth;
      this.updateMonthlyBarChart();
    });

    // ─── (5) Dữ liệu tồn kho theo biến thể ──────────────────────────────────
    this.reportService.getCurrentStockByProduct().subscribe(res => {
      this.stockByProduct = res;
      this.updateStockData();
      this.updatePieChart();
    });
  }

  private updateBarChart(): void {
    this.barData.datasets[0].data = [this.revenueToday, this.profitToday];
    this.barData = { ...this.barData };
  }

  private updateWeeklyBarChart(): void {
    this.weeklyBarData.datasets[0].data = [this.revenueThisWeek, this.profitThisWeek];
    this.weeklyBarData = { ...this.weeklyBarData };
  }

  private updateMonthlyBarChart(): void {
    this.monthlyBarData.datasets[0].data = [this.revenueThisMonth, this.profitThisMonth];
    this.monthlyBarData = { ...this.monthlyBarData };
  }

  private updateStockData(): void {
    this.stockData = Object.entries(this.stockByProduct).map(
      ([productName, variants]) => {
        // Tính tổng cho table
        const total = variants.reduce((sum, v) => sum + v.stock, 0);
        const productStatus = this.getStockStatus(total);

        // Chuyển từng variant
        const variantRows: ProductVariantInfo[] = variants.map(v => ({
          sku: v.sku,
          stock: v.stock,
          status: this.getStockStatus(v.stock)
        }));

        return {
          name: productName,
          quantity: total,
          status: productStatus,
          variants: variantRows
        } as StockRow;
      }
    );
  }

  sortByStock(): void {
    if (!this.stockData || this.stockData.length === 0) return;
    this.stockData.sort((a, b) => a.quantity - b.quantity);
    this.stockData = [...this.stockData];
    this.updatePieChart();
  }

  private updatePieChart(): void {
    const counts: Record<string, number> = {
      'Hết hàng': 0,
      'Sắp hết': 0,
      'Còn ít': 0,
      'Đủ hàng': 0
    };

    this.stockData.forEach(row => {
      row.variants.forEach(v => {
        const st = v.status;
        if (counts.hasOwnProperty(st)) {
          counts[st]++;
        }
      });
    });

    this.pieData.datasets[0].data = [
      counts['Hết hàng'],
      counts['Sắp hết'],
      counts['Còn ít'],
      counts['Đủ hàng']
    ];
    this.pieData = { ...this.pieData };
  }

  private getStockStatus(quantity: number): string {
    if (quantity <= 0) return 'Hết hàng';
    if (quantity <= 5) return 'Sắp hết';
    if (quantity <= 10) return 'Còn ít';
    return 'Đủ hàng';
  }

  // Gọi khi click "Xem chi tiết"
  showDetail(period: 'today' | 'week' | 'month'): void {
    this.detailPeriod = period;
    this.detailPage = 0;
    this.detailData = [];
    this.detailVisible = true;
    this.loadDetailPage(0);
  }

  // Tải 1 trang chi tiết
  private loadDetailPage(page: number): void {
    const staffId = this.getCurrentStaffId();
    let obs$: Observable<Page<ReportOrder>>;

    if (this.detailPeriod === 'today') {
      obs$ = this.reportService.getRevenueDetailToday(staffId, page, this.detailPageSize);
    } else if (this.detailPeriod === 'week') {
      obs$ = this.reportService.getRevenueDetailThisWeek(staffId, page, this.detailPageSize);
    } else {
      obs$ = this.reportService.getRevenueDetailThisMonth(staffId, page, this.detailPageSize);
    }

    obs$.subscribe(pg => {
      // reset expanded flag
      this.detailData = pg.content.map(o => ({ ...o, expanded: false }));
      this.detailTotal = pg.totalElements;
      this.detailPage = pg.number;
    });
  }

  /** Bắt event đổi trang */
  onDetailPage(event: any): void {
    this.loadDetailPage(event.page);
  }

  /** Toggle row detail (manual expansion) */
  toggleDetailRow(order: ReportOrder): void {
    order.expanded = !order.expanded;
  }

  /** Lấy staffId từ AuthService, hoặc throw nếu chưa login */
  private getCurrentStaffId(): number {
    const id = this.authService.getUserId();
    if (id === null) {
      throw new Error('Bạn cần đăng nhập để xem báo cáo');
    }
    return id;
  }
}
