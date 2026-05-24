import { Injectable } from '@angular/core';
import { FacturaResponse, LineaFacturaResponse } from '../models/factura.model';
import { FacturaCompraResponse, LineaFacturaCompraResponse } from '../models/factura-compra.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class FacturaPdfService {

  private empresa = {
    nombre:    'Optimus ERP',
    subtitulo: 'Empresa de gestión y facturación',
    direccion: 'Calle Ejemplo 18, Madrid',
    cif:       'B12345678',
    iban:      'ES00 0000 0000 0000 0000 0000'
  };

  private formatDate(date: string): string {
    const d = new Date(date);
    return [
      String(d.getDate()).padStart(2, '0'),
      String(d.getMonth() + 1).padStart(2, '0'),
      d.getFullYear()
    ].join('/');
  }

  private addDays(date: string, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  // ── PDF Factura de Venta ─────────────────────────────────────
  generar(factura: FacturaResponse, empresaEmail: string = 'facturacion@optimus-erp.com'): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 50;

    doc.setFontSize(24);
    doc.setTextColor('#134e8c');
    doc.text('Factura', margin, y);

    doc.setFontSize(12);
    doc.setTextColor('#0f172a');
    doc.text(this.empresa.nombre, pageWidth - margin, y, { align: 'right' });
    doc.setFontSize(9);
    doc.text(this.empresa.subtitulo, pageWidth - margin, y + 14, { align: 'right' });

    y += 36;
    doc.setDrawColor('#2563eb');
    doc.setLineWidth(1.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 26;
    doc.setFontSize(10);
    doc.setTextColor('#0f172a');
    doc.text('Fecha de factura:', margin, y);
    doc.text(this.formatDate(factura.fechaEmision), margin + 115, y);
    doc.text('Número de factura:', margin + 280, y);
    doc.text(factura.numeroFactura, margin + 385, y);

    const vencimiento = this.formatDate(this.addDays(factura.fechaEmision, 30));
    doc.text('Fecha de vencimiento:', margin, y + 18);
    doc.text(vencimiento, margin + 135, y + 18);

    y += 44;
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);

    y += 24;
    const leftX  = margin;
    const rightX = pageWidth / 2 + 10;

    doc.setFontSize(11);
    doc.setTextColor('#2563eb');
    doc.text('Cliente', leftX, y);
    doc.text(this.empresa.nombre, rightX, y);

    y += 16;
    doc.setFontSize(9);
    doc.setTextColor('#475569');
    doc.text(`Razón social: ${factura.clienteRazonSocial}`, leftX, y);
    doc.text(`Dirección: ${this.empresa.direccion}`, rightX, y);

    y += 14;
    doc.text(`CIF / NIF: ${factura.clienteCif ?? 'N/A'}`, leftX, y);
    doc.text(`CIF: ${this.empresa.cif}`, rightX, y);

    y += 14;
    doc.text(`Email: ${factura.clienteEmail ?? 'cliente@ejemplo.com'}`, leftX, y);
    doc.text(`Email: ${empresaEmail}`, rightX, y);

    y += 28;
    doc.setDrawColor('#93c5fd');
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    const rows = factura.lineas.map((l: LineaFacturaResponse) => [
      l.descripcion,
      l.cantidad.toString(),
      `${l.precioUnitario.toFixed(2)} €`,
      `${l.subtotal.toFixed(2)} €`
    ]);

    autoTable(doc, {
      startY: y + 18,
      head: [['Descripción', 'Unidades', 'Precio Unitario', 'Total']],
      body: rows,
      tableWidth: pageWidth - margin * 2,
      styles: { fontSize: 10, cellPadding: 8, textColor: '#1f2937', overflow: 'linebreak' },
      headStyles: { fillColor: '#eff6ff', textColor: '#1d4ed8', halign: 'center', fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'left',   cellWidth: 250 },
        1: { halign: 'center', cellWidth: 90  },
        2: { halign: 'right',  cellWidth: 100 },
        3: { halign: 'right',  cellWidth: 90  }
      },
      alternateRowStyles: { fillColor: '#f8fafc' },
      margin: { left: margin, right: margin }
    });

    this.addTotalesYPie(doc, factura.baseImponible, factura.ivaPorcentaje, factura.totalEur, empresaEmail);
    doc.save(`factura-${factura.numeroFactura}.pdf`);
  }

  // ── PDF Factura de Compra (idéntico al de venta) ─────────────
  generarCompra(compra: FacturaCompraResponse, empresaEmail: string = 'facturacion@optimus-erp.com'): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 50;

    doc.setFontSize(24);
    doc.setTextColor('#134e8c');
    doc.text('Factura', margin, y);

    doc.setFontSize(12);
    doc.setTextColor('#0f172a');
    doc.text(this.empresa.nombre, pageWidth - margin, y, { align: 'right' });
    doc.setFontSize(9);
    doc.text(this.empresa.subtitulo, pageWidth - margin, y + 14, { align: 'right' });

    y += 36;
    doc.setDrawColor('#2563eb');
    doc.setLineWidth(1.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 26;
    doc.setFontSize(10);
    doc.setTextColor('#0f172a');
    doc.text('Fecha de factura:', margin, y);
    doc.text(this.formatDate(compra.fechaEmision), margin + 115, y);
    doc.text('Número de factura:', margin + 280, y);
    doc.text(compra.numeroFactura, margin + 385, y);

    const vencimiento = this.formatDate(this.addDays(compra.fechaEmision, 30));
    doc.text('Fecha de vencimiento:', margin, y + 18);
    doc.text(vencimiento, margin + 135, y + 18);

    y += 44;
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);

    y += 24;
    const leftX  = margin;
    const rightX = pageWidth / 2 + 10;

    doc.setFontSize(11);
    doc.setTextColor('#2563eb');
    doc.text('Proveedor', leftX, y);
    doc.text(this.empresa.nombre, rightX, y);

    y += 16;
    doc.setFontSize(9);
    doc.setTextColor('#475569');
    doc.text(`Nombre: ${compra.proveedor || 'No especificado'}`, leftX, y);
    doc.text(`Dirección: ${this.empresa.direccion}`, rightX, y);

    y += 14;
    doc.text(`CIF: ${this.empresa.cif}`, rightX, y);

    y += 14;
    doc.text(`Email: ${empresaEmail}`, rightX, y);

    y += 28;
    doc.setDrawColor('#93c5fd');
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    const rows = compra.lineas.map((l: LineaFacturaCompraResponse) => [
      l.descripcion,
      l.cantidad.toString(),
      `${l.precioUnitario.toFixed(2)} €`,
      `${l.subtotal.toFixed(2)} €`
    ]);

    autoTable(doc, {
      startY: y + 18,
      head: [['Descripción', 'Unidades', 'Precio Unitario', 'Total']],
      body: rows,
      tableWidth: pageWidth - margin * 2,
      styles: { fontSize: 10, cellPadding: 8, textColor: '#1f2937', overflow: 'linebreak' },
      headStyles: { fillColor: '#eff6ff', textColor: '#1d4ed8', halign: 'center', fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'left',   cellWidth: 250 },
        1: { halign: 'center', cellWidth: 90  },
        2: { halign: 'right',  cellWidth: 100 },
        3: { halign: 'right',  cellWidth: 90  }
      },
      alternateRowStyles: { fillColor: '#f8fafc' },
      margin: { left: margin, right: margin }
    });

    this.addTotalesYPie(doc, compra.baseImponible, compra.ivaPorcentaje, compra.totalEur, empresaEmail);
    doc.save(`factura-${compra.numeroFactura}.pdf`);
  }

  // ── Totales y pie compartido ─────────────────────────────────
  private addTotalesYPie(
    doc: jsPDF,
    baseImponible: number,
    ivaPorcentaje: number,
    totalEur: number,
    empresaEmail: string
  ): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin  = 40;
    const finalY  = (doc as any).lastAutoTable?.finalY ?? 400;
    const totalX  = pageWidth - margin;
    const labelX  = totalX - 160;
    const valueX  = totalX - 10;

    doc.setFontSize(10);
    doc.setTextColor('#475569');
    doc.text('BASE IMPONIBLE:', labelX, finalY + 30, { align: 'right' });
    doc.text(`${baseImponible.toFixed(2)} €`, valueX, finalY + 30, { align: 'right' });

    doc.text(`IVA (${ivaPorcentaje}%):`, labelX, finalY + 48, { align: 'right' });
    doc.text(`${(baseImponible * ivaPorcentaje / 100).toFixed(2)} €`, valueX, finalY + 48, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#0f172a');
    doc.text('TOTAL:', labelX, finalY + 76, { align: 'right' });
    doc.text(`${totalEur.toFixed(2)} €`, valueX, finalY + 76, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(10);
    doc.setTextColor('#475569');
    doc.text('Comentarios:', margin, finalY + 110);
    doc.text(`Pago por transferencia: ${this.empresa.iban}`, margin, finalY + 126);
  }
}