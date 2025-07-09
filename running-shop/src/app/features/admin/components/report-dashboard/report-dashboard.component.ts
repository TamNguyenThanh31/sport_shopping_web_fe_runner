import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ReportService } from "../../service/report.service";
import { ProductVariantInfo } from "../../../../shared/models/product-variant-info.model";
import { StockRow } from "../../../../shared/models/stock-row.model";
import { ReportOrder } from "../../../../shared/models/report-order.model";
import { Page } from "../../../../shared/models/promotion.model";
import { AuthService } from "../../../../core/services/auth.service";
import {ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle, NgApexchartsModule} from 'ng-apexcharts';
import { Observable, forkJoin } from 'rxjs';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {ButtonDirective} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {TableModule} from "primeng/table";
import {DialogModule} from "primeng/dialog";

@Component({
  selector: 'app-report-dashboard',
  templateUrl: './report-dashboard.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    ButtonDirective,
    FormsModule,
    NgApexchartsModule,
    NgIf,
    TableModule,
    NgClass,
    DialogModule,
    DatePipe,
    NgForOf
  ],
  styleUrls: ['./report-dashboard.component.scss']
})
export class ReportDashboardComponent implements OnInit, AfterViewInit {
  // Tổng quan hôm nay
  totalOrdersToday = 0;
  revenueToday = 0;
  profitToday = 0;

  // Tổng quan tuần này
  revenueThisWeek = 0;
  profitThisWeek = 0;

  // Tổng quan tháng này
  revenueThisMonth = 0;
  profitThisMonth = 0;

  // Dữ liệu tồn kho dạng { productName: variants[] }
  stockByProduct: Record<string, ProductVariantInfo[]> = {};
  stockData: StockRow[] = [];

  // Biểu đồ doanh thu & lợi nhuận động
  chartOptionsDynamic!: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    title: ApexTitleSubtitle;
    colors: string[];
    plotOptions?: any;
    dataLabels?: any;
    grid?: any;
    yaxis?: any;
  };

  // Biểu đồ top bán chạy
  chartOptionsTopSelling!: any;

  // Filter ngày tháng cho biểu đồ top bán chạy
  topStartDate = '';
  topEndDate = '';

  // Filter ngày tháng cho biểu đồ doanh thu & lợi nhuận động
  startDate = '';
  endDate = '';

  // Chi tiết doanh thu trong dialog
  detailVisible = false;
  detailData: (ReportOrder & { expanded?: boolean })[] = [];
  detailTotal = 0;
  detailPageSize = 10;
  detailPage = 0;
  detailPeriod: 'today' | 'week' | 'month' | 'dynamic' = 'today';

  // Thêm biến lưu sku cho tooltip
  topSellingSkus: string[] = [];

  constructor(
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReports();
    this.initDynamicChart();
    // Mặc định filter ngày là hôm nay
    const today = this.getTodayISO();
    this.startDate = today;
    this.endDate = today;
    this.topStartDate = today;
    this.topEndDate = today;
  }

  ngAfterViewInit(): void {
    // Gọi sau khi view đã render xong
    this.initTopSellingChart();
  }

  // Load tất cả báo cáo cơ bản, tồn kho, biểu đồ
  loadReports(): void {
    forkJoin({
      ordersToday: this.reportService.getTotalOrdersToday(),
      revenueToday: this.reportService.getRevenueToday(),
      profitToday: this.reportService.getProfitToday(),
      stockByName: this.reportService.getCurrentStockByProduct()
    }).subscribe(({ ordersToday, revenueToday, profitToday, stockByName }) => {
      this.totalOrdersToday = ordersToday.totalOrdersToday;
      this.revenueToday = revenueToday.revenueToday;
      this.profitToday = profitToday.profitToday;
      this.stockByProduct = stockByName;

      this.updateStockData();
      this.updateDynamicChart(this.getTodayISO());
      //this.updatePieChart();
    });

  }

  // Khởi tạo biểu đồ doanh thu & lợi nhuận động
  initDynamicChart() {
    this.chartOptionsDynamic = {
      series: [
        { name: 'Doanh thu', data: [] },
        { name: 'Lợi nhuận', data: [] }
      ],
      chart: {
        type: 'bar',
        height: 340,
        toolbar: { show: false }
      },
      colors: ['#2563eb', '#10b981'], 
      plotOptions: { bar: { columnWidth: '40%' } }, // Loại bỏ borderRadius
      dataLabels: { enabled: true, style: { colors: ['#1e293b'], fontWeight: 600 } },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      xaxis: { categories: ['Khoảng thời gian'], labels: { style: { colors: '#64748b', fontWeight: 500 } } },
      yaxis: { labels: { style: { colors: '#64748b', fontWeight: 500 } } },
      title: { text: '', style: { color: 'transparent' } } 
    };
  }

  // Hàm chuyển đổi ngày sang ISO đầy đủ
  private toStartOfDay(date: string): string {
    return date ? `${date}T00:00:00` : '';
  }
  private toEndOfDay(date: string): string {
    return date ? `${date}T23:59:59` : '';
  }

  // Cập nhật biểu đồ doanh thu & lợi nhuận động theo khoảng thời gian
  updateDynamicChart(startDate: string, endDate?: string) {
    // Chuyển đổi ngày sang ISO đầy đủ
    const start = this.toStartOfDay(startDate);
    const end = endDate ? this.toEndOfDay(endDate) : undefined;
    forkJoin({
      revenue: this.reportService.getRevenueBetween(start, end),
      profit: this.reportService.getProfitBetween(start, end)
    }).subscribe(({ revenue, profit }) => {
      this.chartOptionsDynamic = {
        ...this.chartOptionsDynamic,
        series: [
          { name: 'Doanh thu', data: [revenue.revenue] },
          { name: 'Lợi nhuận', data: [profit.profit] }
        ]
      };
    });
  }

  // Khởi tạo biểu đồ top bán chạy (Horizontal Bar chart, trục Y là SKU)
  initTopSellingChart() {
    this.chartOptionsTopSelling = {
      series: [{ name: 'Số lượng đã bán', data: [] }],
      chart: { type: 'bar', height: 340, toolbar: { show: false } },
      colors: [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#ec4899',
        '#a855f7', '#0ea5e9', '#84cc16', '#f43f5e', '#06b6d4', '#22c55e', '#fbbf24', '#78716c', '#059669', '#a3e635'
      ],
      plotOptions: { bar: { horizontal: true, barHeight: '60%' } },
      dataLabels: { enabled: true, style: { colors: ['#1e293b'], fontWeight: 600 } },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      xaxis: {
        labels: {
          style: { colors: '#64748b', fontWeight: 500 },
          formatter: (val: number) => Number.isInteger(val) ? val : ''
        },
        decimalsInFloat: 0,
        // max động để bar không sát mép phải
        max: this.chartOptionsTopSelling?.series?.[0]?.data?.length > 0 ? Math.max(...this.chartOptionsTopSelling.series[0].data.map((d: any) => d.y)) + 1 : undefined
      },
      yaxis: {
        labels: {
          style: { colors: '#64748b', fontWeight: 500, fontSize: '14px', maxWidth: 300 },
          formatter: (val: string) => val,
          minWidth: 0,
          maxWidth: 300,
        }
      },
      tooltip: {
        custom: function({ series, seriesIndex, dataPointIndex, w }: { series: any; seriesIndex: number; dataPointIndex: number; w: any; }) {
          const point = w.config.series[seriesIndex].data[dataPointIndex];
          return `<div style='padding:8px 12px;'>`
            + `<div style='font-size:14px;font-weight:600;color:#2563eb;'>${point.name}</div>`
            + `<div style='font-size:13px;color:#1e293b;'>Số lượng đã bán: <b>${point.y}</b></div>`
            + `</div>`;
        }
      },
      title: { text: '', style: { color: 'transparent' } } 
    };
    this.updateTopSellingChart();
  }

  // Cập nhật biểu đồ top bán chạy dạng horizontal bar
  updateTopSellingChart(startDate?: string, endDate?: string) {
    const start = startDate ? this.toStartOfDay(startDate) : undefined;
    const end = endDate ? this.toEndOfDay(endDate) : undefined;
    this.reportService.getTopSellingProducts(start, end, 10).subscribe(products => {
      this.chartOptionsTopSelling = {
        ...this.chartOptionsTopSelling,
        series: [{
          name: 'Số lượng đã bán',
          data: products.map(p => ({
            x: p.variantSku,
            y: Math.round(p.totalQuantitySold),
            name: p.productName
          }))
        }],
        xaxis: {
          labels: {
            style: { colors: '#64748b', fontWeight: 500 },
            formatter: (val: number) => Number.isInteger(val) ? val : ''
          },
          decimalsInFloat: 0,
          // max động để bar không sát mép phải
          max: products.length > 0 ? Math.max(...products.map(p => Math.round(p.totalQuantitySold))) + 1 : undefined
        },
        tooltip: {
          custom: function({ series, seriesIndex, dataPointIndex, w }: { series: any; seriesIndex: number; dataPointIndex: number; w: any; }) {
            const point = w.config.series[seriesIndex].data[dataPointIndex];
            return `<div style='padding:8px 12px;'>`
              + `<div style='font-size:15px;font-weight:600;color:#1976D2;'>${point.name}</div>`
              + `<div style='font-size:14px;color:#222;'>Số lượng đã bán: <b>${point.y}</b></div>`
              + `</div>`;
          }
        }
      };
      // Trigger resize cho ApexCharts sau khi cập nhật dữ liệu
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  }

  // Chuyển stockByProduct thành stockData dễ render bảng + tính trạng thái
  private updateStockData(): void {
    this.stockData = Object.entries(this.stockByProduct).map(([name, variants]) => {
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const status = this.getStockStatus(totalStock);
      const variantRows = variants.map(v => ({
          sku: v.sku,
          stock: v.stock,
          status: this.getStockStatus(v.stock)
        }));
      return { name, quantity: totalStock, status, variants: variantRows };
    });
  }

  // Hàm phân loại trạng thái tồn kho theo số lượng
  private getStockStatus(quantity: number): string {
    if (quantity <= 0) return 'Hết hàng';
    if (quantity <= 5) return 'Sắp hết';
    if (quantity <= 10) return 'Còn ít';
    return 'Đủ hàng';
  }

  // Sắp xếp tồn kho tăng dần theo quantity
  sortByStock(): void {
    this.stockData.sort((a, b) => a.quantity - b.quantity);
    this.stockData = [...this.stockData]; // để trigger change detection
  }

  // // Tạo dữ liệu biểu đồ pie trạng thái tồn kho
  // private updatePieChart(): void {
  //   const counts = { 'Hết hàng': 0, 'Sắp hết': 0, 'Còn ít': 0, 'Đủ hàng': 0 };
  //   this.stockData.forEach(row => {
  //     row.variants.forEach(v => {
  //       if (counts.hasOwnProperty(v.status)) counts[v.status]++;
  //     });
  //   });
  //   // Cập nhật pieData theo counts (nếu anh dùng pie chart cho tồn kho)
  //   // Ví dụ: this.pieData.datasets[0].data = [...]
  // }

  // Hiển thị dialog chi tiết doanh thu theo khoảng thời gian
  showDetail(period: 'today' | 'week' | 'month'): void {
    this.detailPeriod = period;
    this.detailPage = 0;
    this.detailVisible = true;
    this.loadDetailPage(0);
  }

  // Load trang chi tiết báo cáo
  private loadDetailPage(page: number): void {
    const staffId = this.getCurrentStaffId();
    let obs$ : Observable<Page<ReportOrder>>;

    if (this.detailPeriod === 'today') {
      obs$ = this.reportService.getRevenueDetailToday(staffId, page, this.detailPageSize);
    } else {
      // Hiện chưa có API tuần, tháng chi tiết, nên tạm gọi giống hôm nay
      obs$ = this.reportService.getRevenueDetailToday(staffId, page, this.detailPageSize);
    }

    obs$.subscribe(pg => {
      this.detailData = pg.content.map(o => ({ ...o, expanded: false }));
      this.detailTotal = pg.totalElements;
      this.detailPage = pg.number;
    });
  }

  // Hiển thị dialog chi tiết doanh thu theo khoảng thời gian động
  showDetailDynamic(): void {
    this.detailPeriod = 'dynamic';
    this.detailPage = 0;
    this.detailVisible = true;
    this.loadDetailPageDynamic(0);
  }

  // Load trang chi tiết báo cáo động (theo khoảng thời gian)
  private loadDetailPageDynamic(page: number): void {
    const staffId = this.getCurrentStaffId();
    const start = this.toStartOfDay(this.startDate);
    const end = this.endDate ? this.toEndOfDay(this.endDate) : null;
    this.reportService.getRevenueDetailByDateRange(staffId, start, end, page, this.detailPageSize)
      .subscribe(pg => {
        this.detailData = pg.content.map(o => ({ ...o, expanded: false }));
        this.detailTotal = pg.totalElements;
        this.detailPage = pg.number;
      });
  }

  // Bắt sự kiện đổi trang trong bảng chi tiết
  onDetailPage(event: any): void {
    if (this.detailPeriod === 'dynamic') {
      this.loadDetailPageDynamic(event.page);
    } else {
    this.loadDetailPage(event.page);
    }
  }

  // Mở/đóng hàng chi tiết đơn
  toggleDetailRow(order: ReportOrder & { expanded?: boolean }): void {
    order.expanded = !order.expanded;
  }

  // Lấy staffId hiện tại từ AuthService (phải đăng nhập mới xem được)
  private getCurrentStaffId(): number {
    const id = this.authService.getUserId();
    if (!id) {
      throw new Error('Bạn cần đăng nhập để xem báo cáo');
    }
    return id;
  }

  // Lấy ngày hôm nay theo ISO format yyyy-MM-dd
  private getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
  }
}
