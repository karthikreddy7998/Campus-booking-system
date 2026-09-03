const Booking = require("../models/Booking");
const PDFDocument = require("pdfkit");

const exportCSV = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("roomId", "roomName building")
      .sort({ createdAt: -1 });

    const header = 'Room,Building,Booked By,Email,Date,Start Time,End Time,Purpose,Status\n';
    const rows = bookings.map(b => {
      return [
        `"${b.roomId?.roomName || 'N/A'}"`,
        `"${b.roomId?.building || 'N/A'}"`,
        `"${b.userId?.name || 'N/A'}"`,
        `"${b.userId?.email || 'N/A'}"`,
        `"${b.date}"`,
        `"${b.startTime}"`,
        `"${b.endTime}"`,
        `"${b.purpose}"`,
        `"${b.status}"`
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings_report.csv');
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportPDF = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("roomId", "roomName building")
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings_report.pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('CampusBook - Booking Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, { align: 'center' });
    doc.moveDown(1);

    // Summary stats
    const stats = {
      total: bookings.length,
      approved: bookings.filter(b => b.status === 'approved').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('Summary');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').fillColor('#555');
    doc.text(`Total Bookings: ${stats.total}    |    Approved: ${stats.approved}    |    Pending: ${stats.pending}    |    Rejected: ${stats.rejected}    |    Cancelled: ${stats.cancelled}`);
    doc.moveDown(1);

    // Bookings table
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('Booking Details');
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#333');
    doc.text('Room', 50, tableTop, { width: 80 });
    doc.text('Building', 130, tableTop, { width: 70 });
    doc.text('Booked By', 200, tableTop, { width: 80 });
    doc.text('Date', 280, tableTop, { width: 70 });
    doc.text('Time', 350, tableTop, { width: 70 });
    doc.text('Purpose', 420, tableTop, { width: 80 });
    doc.text('Status', 500, tableTop, { width: 50 });
    
    doc.moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke('#ccc');
    
    let y = tableTop + 18;
    doc.font('Helvetica').fontSize(7).fillColor('#555');

    bookings.slice(0, 50).forEach(b => {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(b.roomId?.roomName || 'N/A', 50, y, { width: 80 });
      doc.text(b.roomId?.building || 'N/A', 130, y, { width: 70 });
      doc.text(b.userId?.name || 'N/A', 200, y, { width: 80 });
      doc.text(b.date || 'N/A', 280, y, { width: 70 });
      doc.text(`${b.startTime}-${b.endTime}`, 350, y, { width: 70 });
      doc.text(b.purpose || 'N/A', 420, y, { width: 80 });
      doc.text(b.status, 500, y, { width: 50 });
      y += 14;
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { exportCSV, exportPDF };
