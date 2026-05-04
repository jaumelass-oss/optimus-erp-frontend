import { Injectable } from '@angular/core';
import { FacturaResponse, LineaFacturaResponse } from '../models/factura.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class FacturaPdfService {
  private formatDate(date: string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  generar(factura: FacturaResponse, empresaEmail: string = 'facturacion@optimus-erp.com'): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 50;

    // Cabecera
    doc.setFontSize(24);
    doc.setTextColor('#134e8c');
    doc.text('Factura', margin, y);

    doc.setFontSize(12);
    doc.setTextColor('#0f172a');
    doc.text('Optimus ERP', pageWidth - margin, y, { align: 'right' });
    doc.setFontSize(9);
    doc.text('Empresa de gestión y facturación', pageWidth - margin, y + 14, { align: 'right' });

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

    const vencimiento = this.formatDate(new Date(new Date(factura.fechaEmision).setDate(new Date(factura.fechaEmision).getDate() + 30)).toISOString());
    doc.text('Fecha de vencimiento:', margin, y + 18);
    doc.text(vencimiento, margin + 135, y + 18);

    y += 44;
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);

    y += 24;
    const leftX = margin;
    const rightX = pageWidth / 2 + 10;
    const columnWidth = pageWidth / 2 - margin - 10;

    doc.setFontSize(11);
    doc.setTextColor('#2563eb');
    doc.text('Cliente', leftX, y);
    doc.text('Optimus ERP', rightX, y);

    y += 16;
    doc.setFontSize(9);
    doc.setTextColor('#475569');
    doc.text(`Razón social: ${factura.clienteRazonSocial}`, leftX, y);
    doc.text('Dirección: Calle Ejemplo 18, Madrid', rightX, y);

    y += 14;
    doc.text(`CIF / NIF: ${factura.clienteCif ?? 'N/A'}`, leftX, y);
    doc.text('CIF: B12345678', rightX, y);

    y += 14;
    doc.text(`Email: ${factura.clienteEmail ?? 'cliente@ejemplo.com'}`, leftX, y);
    doc.text(`Email: ${empresaEmail}`, rightX, y);

    y += 28;
    doc.setDrawColor('#93c5fd');
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    const rows = factura.lineas.map((linea: LineaFacturaResponse) => [
      linea.descripcion,
      linea.cantidad.toString(),
      `${linea.precioUnitario.toFixed(2)} €`,
      `${linea.subtotal.toFixed(2)} €`
    ]);

    autoTable(doc, {
      startY: y + 18,
      head: [['Descripción', 'Unidades', 'Precio Unitario', 'Precio']],
      body: rows,
      tableWidth: pageWidth - margin * 2,
      styles: {
        fontSize: 10,
        cellPadding: 8,
        textColor: '#1f2937',
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: '#eff6ff',
        textColor: '#1d4ed8',
        halign: 'center',
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 250 },
        1: { halign: 'center', cellWidth: 90 },
        2: { halign: 'right', cellWidth: 100 },
        3: { halign: 'right', cellWidth: 90 }
      },
      alternateRowStyles: { fillColor: '#f8fafc' },
      margin: { left: margin, right: margin }
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 18;
    const totalX = pageWidth - margin;
    const labelX = totalX - 160;
    const valueX = totalX - 10;

    doc.setFontSize(10);
    doc.setTextColor('#475569');
    doc.text('BASE IMPONIBLE:', labelX, finalY + 30, { align: 'right' });
    doc.text(`${factura.baseImponible.toFixed(2)} €`, valueX, finalY + 30, { align: 'right' });

    doc.text(`IVA (${factura.ivaPorcentaje}%):`, labelX, finalY + 48, { align: 'right' });
    doc.text(`${(factura.baseImponible * factura.ivaPorcentaje / 100).toFixed(2)} €`, valueX, finalY + 48, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', labelX, finalY + 76, { align: 'right' });
    doc.text(`${factura.totalEur.toFixed(2)} €`, valueX, finalY + 76, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(10);
    doc.setTextColor('#475569');
    doc.text('Comentarios:', margin, finalY + 110);
    doc.text('Pago por transferencia: ESXXXXXXXXXXXXXXX9', margin, finalY + 126);

    doc.save(`factura-${factura.numeroFactura}.pdf`);
  }
}
