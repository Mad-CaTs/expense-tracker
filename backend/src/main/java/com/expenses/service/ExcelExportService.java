package com.expenses.service;

import com.expenses.entity.Expense;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final ExpenseService expenseService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final byte[] C_DARK   = rgb(0x1E, 0x3A, 0x5F);
    private static final byte[] C_BLUE   = rgb(0x25, 0x63, 0xEB);
    private static final byte[] C_WHITE  = rgb(0xFF, 0xFF, 0xFF);
    private static final byte[] C_ALT    = rgb(0xEF, 0xF4, 0xFF);
    private static final byte[] C_BORDER = rgb(0xCB, 0xD5, 0xE1);
    private static final byte[] C_TOTAL  = rgb(0x0F, 0x27, 0x44);
    private static final byte[] C_GREEN  = rgb(0x05, 0x96, 0x69);

    public byte[] exportExpenses(LocalDate from, LocalDate to, Long userId) throws IOException {
        List<Expense> expenses = expenseService.findAllForExport(from, to, userId);

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            // Hoja de datos para el gráfico (oculta)
            XSSFSheet dataSheet = wb.createSheet("_data");
            wb.setSheetHidden(wb.getSheetIndex("_data"), true);

            // Hoja principal
            XSSFSheet mainSheet = wb.createSheet("Gastos");
            wb.setActiveSheet(wb.getSheetIndex("Gastos"));

            // 1. Escribir datos de categorías en hoja oculta
            Map<String, BigDecimal> byCategory = expenses.stream()
                    .collect(Collectors.groupingBy(
                            e -> e.getCategory().getName(),
                            Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

            List<Map.Entry<String, BigDecimal>> catSorted = byCategory.entrySet().stream()
                    .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                    .toList();

            Row dataHeader = dataSheet.createRow(0);
            dataHeader.createCell(0).setCellValue("Categoría");
            dataHeader.createCell(1).setCellValue("Monto");
            for (int i = 0; i < catSorted.size(); i++) {
                Row r = dataSheet.createRow(i + 1);
                r.createCell(0).setCellValue(catSorted.get(i).getKey());
                r.createCell(1).setCellValue(catSorted.get(i).getValue().doubleValue());
            }
            int dataLastRow = catSorted.size(); // 1-indexed last row in _data

            // 2. Construir hoja principal
            buildMainSheet(wb, mainSheet, dataSheet, expenses, from, to, dataLastRow);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        }
    }

    private void buildMainSheet(XSSFWorkbook wb, XSSFSheet sheet, XSSFSheet dataSheet,
                                 List<Expense> expenses, LocalDate from, LocalDate to,
                                 int dataLastRow) {
        sheet.setColumnWidth(0, 13 * 256);
        sheet.setColumnWidth(1, 20 * 256);
        sheet.setColumnWidth(2, 38 * 256);
        sheet.setColumnWidth(3, 15 * 256);
        sheet.createFreezePane(0, 4);

        BigDecimal total = sum(expenses);

        // ── Fila 0: título ────────────────────────────────────────────────────
        Row r0 = sheet.createRow(0);
        r0.setHeightInPoints(36);
        merged(sheet, r0, 0, 3,
                "REPORTE DE GASTOS   |   " + fmt(from) + "  →  " + fmt(to),
                titleStyle(wb));

        // ── Fila 1: subtítulo ─────────────────────────────────────────────────
        Row r1 = sheet.createRow(1);
        r1.setHeightInPoints(18);
        merged(sheet, r1, 0, 3,
                expenses.size() + " transacciones   ·   Total: S/ "
                        + String.format("%,.2f", total)
                        + "   ·   Generado el " + LocalDate.now().format(DATE_FMT),
                subtitleStyle(wb));

        // ── Fila 2: espacio ───────────────────────────────────────────────────
        sheet.createRow(2).setHeightInPoints(8);

        // ── Fila 3: encabezados ───────────────────────────────────────────────
        Row hdr = sheet.createRow(3);
        hdr.setHeightInPoints(26);
        cell(hdr, 0, "Fecha",       colHeader(wb, false));
        cell(hdr, 1, "Categoría",   colHeader(wb, false));
        cell(hdr, 2, "Descripción", colHeader(wb, false));
        cell(hdr, 3, "Monto (S/)",  colHeader(wb, true));

        // ── Datos ─────────────────────────────────────────────────────────────
        int rowIdx = 4;
        for (Expense e : expenses) {
            boolean alt = rowIdx % 2 == 0;
            Row row = sheet.createRow(rowIdx++);
            row.setHeightInPoints(20);
            cell(row, 0, e.getDate().format(DATE_FMT),                         dataStyle(wb, false, alt));
            cell(row, 1, e.getCategory().getName(),                             dataStyle(wb, false, alt));
            cell(row, 2, e.getDescription() != null ? e.getDescription() : "", dataStyle(wb, false, alt));
            numCell(row, 3, e.getAmount().doubleValue(),                        amountStyle(wb, alt));
        }

        // ── Total ─────────────────────────────────────────────────────────────
        int totalRowIdx = rowIdx;
        Row totalRow = sheet.createRow(totalRowIdx);
        totalRow.setHeightInPoints(26);
        for (int c = 0; c <= 1; c++) totalRow.createCell(c).setCellStyle(totalBlank(wb));
        cell(totalRow, 2, "TOTAL",         totalLabel(wb));
        numCell(totalRow, 3, total.doubleValue(), totalAmount(wb));

        // ── Gráfico (anclado debajo del total, 2 filas de margen) ─────────────
        int chartRow = totalRowIdx + 3;
        int chartEndRow = chartRow + 20;

        XSSFDrawing drawing = sheet.createDrawingPatriarch();
        XSSFClientAnchor anchor = drawing.createAnchor(
                0, 0, 0, 0,
                0, chartRow,      // col A, fila = chartRow
                4, chartEndRow);  // col D, fila = chartEndRow

        XSSFChart chart = drawing.createChart(anchor);
        chart.setTitleText("Gastos por Categoría");
        chart.setTitleOverlay(false);

        XDDFChartLegend legend = chart.getOrAddLegend();
        legend.setPosition(LegendPosition.BOTTOM);

        XDDFCategoryAxis catAxis = chart.createCategoryAxis(AxisPosition.BOTTOM);
        XDDFValueAxis valAxis = chart.createValueAxis(AxisPosition.LEFT);
        valAxis.setCrosses(AxisCrosses.AUTO_ZERO);

        // Referencias a la hoja oculta _data (filas 1..dataLastRow, col A y B)
        XDDFDataSource<String> cats = XDDFDataSourcesFactory.fromStringCellRange(
                dataSheet, new CellRangeAddress(1, dataLastRow, 0, 0));
        XDDFNumericalDataSource<Double> vals = XDDFDataSourcesFactory.fromNumericCellRange(
                dataSheet, new CellRangeAddress(1, dataLastRow, 1, 1));

        XDDFBarChartData barData = (XDDFBarChartData) chart.createData(ChartTypes.BAR, catAxis, valAxis);
        barData.setBarDirection(BarDirection.COL);
        XDDFBarChartData.Series series = (XDDFBarChartData.Series) barData.addSeries(cats, vals);
        series.setTitle("Monto (S/)", null);
        chart.plot(barData);
    }

    // ── Estilos ───────────────────────────────────────────────────────────────

    private XSSFCellStyle titleStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(C_DARK, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short) 14);
        f.setColor(new XSSFColor(C_WHITE, null));
        s.setFont(f);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private XSSFCellStyle subtitleStyle(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(C_BLUE, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont f = wb.createFont();
        f.setFontHeightInPoints((short) 10);
        f.setColor(new XSSFColor(C_WHITE, null));
        s.setFont(f);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private XSSFCellStyle colHeader(XSSFWorkbook wb, boolean right) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(C_DARK, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short) 10);
        f.setColor(new XSSFColor(C_WHITE, null));
        s.setFont(f);
        s.setAlignment(right ? HorizontalAlignment.RIGHT : HorizontalAlignment.LEFT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.MEDIUM);
        s.setBottomBorderColor(new XSSFColor(C_BLUE, null));
        return s;
    }

    private XSSFCellStyle dataStyle(XSSFWorkbook wb, boolean right, boolean alt) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(alt ? C_ALT : C_WHITE, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont f = wb.createFont();
        f.setFontHeightInPoints((short) 10);
        s.setFont(f);
        s.setAlignment(right ? HorizontalAlignment.RIGHT : HorizontalAlignment.LEFT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBottomBorderColor(new XSSFColor(C_BORDER, null));
        return s;
    }

    private XSSFCellStyle amountStyle(XSSFWorkbook wb, boolean alt) {
        XSSFCellStyle s = dataStyle(wb, true, alt);
        s.setDataFormat(wb.createDataFormat().getFormat("\"S/ \"#,##0.00"));
        XSSFFont f = wb.createFont();
        f.setFontHeightInPoints((short) 10); f.setBold(true);
        s.setFont(f);
        return s;
    }

    private XSSFCellStyle totalBlank(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(C_TOTAL, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return s;
    }

    private XSSFCellStyle totalLabel(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(C_TOTAL, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short) 10);
        f.setColor(new XSSFColor(C_WHITE, null));
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.RIGHT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private XSSFCellStyle totalAmount(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(C_TOTAL, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short) 11);
        f.setColor(new XSSFColor(C_GREEN, null));
        s.setFont(f);
        s.setAlignment(HorizontalAlignment.RIGHT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setDataFormat(wb.createDataFormat().getFormat("\"S/ \"#,##0.00"));
        return s;
    }

    // ── Utils ─────────────────────────────────────────────────────────────────

    private void merged(XSSFSheet sheet, Row row, int c1, int c2, String val, CellStyle style) {
        Cell cell = row.createCell(c1);
        cell.setCellValue(val);
        cell.setCellStyle(style);
        sheet.addMergedRegion(new CellRangeAddress(row.getRowNum(), row.getRowNum(), c1, c2));
    }

    private void cell(Row row, int col, String val, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(val);
        c.setCellStyle(style);
    }

    private void numCell(Row row, int col, double val, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(val);
        c.setCellStyle(style);
    }

    private BigDecimal sum(List<Expense> list) {
        return list.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String fmt(LocalDate d) {
        return d != null ? d.format(DATE_FMT) : "—";
    }

    private static byte[] rgb(int r, int g, int b) {
        return new byte[]{(byte) r, (byte) g, (byte) b};
    }
}
