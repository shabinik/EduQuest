# finance/fee_receipt_utils.py

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from io import BytesIO

# ── Palette ───────────────────────────────────────────────────────────────────
BRAND       = colors.HexColor("#2563EB")   # blue-600
BRAND_LIGHT = colors.HexColor("#EFF6FF")   # blue-50
SUCCESS     = colors.HexColor("#059669")   # emerald-600
SUCCESS_BG  = colors.HexColor("#D1FAE5")   # emerald-100
DARK        = colors.HexColor("#111827")
MID         = colors.HexColor("#6B7280")
LIGHT_LINE  = colors.HexColor("#E5E7EB")
WHITE       = colors.white
AMBER       = colors.HexColor("#D97706")
AMBER_BG    = colors.HexColor("#FFFBEB")


def _s(name, **kw) -> ParagraphStyle:
    return ParagraphStyle(name, **kw)


ST = {
    "brand_title":  _s("BT",  fontName="Helvetica-Bold", fontSize=22, textColor=WHITE, alignment=TA_LEFT),
    "brand_sub":    _s("BS",  fontName="Helvetica",      fontSize=10, textColor=colors.HexColor("#BFDBFE"), alignment=TA_LEFT),
    "inv_label":    _s("IL",  fontName="Helvetica-Bold", fontSize=11, textColor=WHITE, alignment=TA_RIGHT),
    "inv_val":      _s("IV",  fontName="Helvetica",      fontSize=10, textColor=colors.HexColor("#BFDBFE"), alignment=TA_RIGHT),
    "section_head": _s("SH",  fontName="Helvetica-Bold", fontSize=9,  textColor=MID,   spaceAfter=3),
    "bold_dark":    _s("BD",  fontName="Helvetica-Bold", fontSize=11, textColor=DARK),
    "normal_dark":  _s("ND",  fontName="Helvetica",      fontSize=10, textColor=DARK),
    "normal_mid":   _s("NM",  fontName="Helvetica",      fontSize=9,  textColor=MID),
    "right_bold":   _s("RB",  fontName="Helvetica-Bold", fontSize=12, textColor=DARK,  alignment=TA_RIGHT),
    "th_white":     _s("TW",  fontName="Helvetica-Bold", fontSize=9,  textColor=WHITE),
    "th_center":    _s("TC",  fontName="Helvetica-Bold", fontSize=9,  textColor=WHITE, alignment=TA_CENTER),
    "th_right":     _s("TR",  fontName="Helvetica-Bold", fontSize=9,  textColor=WHITE, alignment=TA_RIGHT),
    "td_center":    _s("TDC", fontName="Helvetica",      fontSize=10, textColor=DARK,  alignment=TA_CENTER),
    "td_mid":       _s("TDM", fontName="Helvetica",      fontSize=9,  textColor=MID,   alignment=TA_CENTER),
    "total_label":  _s("TL",  fontName="Helvetica-Bold", fontSize=13, textColor=WHITE, alignment=TA_LEFT),
    "total_amt":    _s("TA",  fontName="Helvetica-Bold", fontSize=16, textColor=WHITE, alignment=TA_RIGHT),
    "paid_badge":   _s("PB",  fontName="Helvetica-Bold", fontSize=10, textColor=SUCCESS, alignment=TA_CENTER),
    "note":         _s("NT",  fontName="Helvetica",      fontSize=8,  textColor=MID,   alignment=TA_CENTER),
    "footer":       _s("FT",  fontName="Helvetica",      fontSize=8,  textColor=MID,   alignment=TA_CENTER),
    "method_label": _s("ML",  fontName="Helvetica-Bold", fontSize=9,  textColor=AMBER),
    "method_val":   _s("MV",  fontName="Helvetica",      fontSize=9,  textColor=DARK),
}


def _vstack(items: list, width: float) -> Table:
    t = Table([[i] for i in items], colWidths=[width])
    t.setStyle(TableStyle([
        ("LEFTPADDING",  (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING",   (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 1),
    ]))
    return t


def generate_fee_receipt_pdf(payment) -> bytes:
    """
    Generate a student fee payment receipt PDF.

    Parameters
    ----------
    payment : Payment (finance.models.Payment)
        Must have related bill__student__user, bill__fee_structure__fee_type,
        bill__student__school_class, tenant pre-fetched.

    Returns
    -------
    bytes — raw PDF content.
    """
    bill       = payment.bill
    student    = bill.student
    fee_struct = bill.fee_structure
    tenant     = payment.tenant

    fmt_date = lambda dt: dt.strftime("%d %B %Y").lstrip("0") if dt else "—"
    fmt_dt   = lambda dt: dt.strftime("%d %B %Y, %I:%M %p").lstrip("0") if dt else "—"

    receipt_number  = payment.receipt_number
    payment_date    = fmt_dt(payment.payment_date)
    student_name    = student.user.full_name
    admission_no    = student.admission_number
    class_name      = str(student.school_class)
    institute_name  = tenant.institute_name
    fee_type        = fee_struct.fee_type.name
    billing_period  = fee_struct.billing_period or "—"
    due_date        = fmt_date(bill.due_date)
    paid_date       = fmt_date(bill.paid_date) if bill.paid_date else fmt_date(payment.payment_date.date())
    amount_fmt      = f"Rs. {float(payment.amount):,.2f}"
    pay_method      = payment.get_payment_method_display()
    txn_id          = payment.transaction_id or "—"
    collected_by    = payment.collected_by.get_full_name() if payment.collected_by else "System"

    # ── Document ─────────────────────────────────────────────
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=15*mm, leftMargin=15*mm,
        topMargin=15*mm,   bottomMargin=15*mm,
    )
    col_w = A4[0] - 30*mm
    story = []

    # ── 1. Header banner ─────────────────────────────────────
    header = Table(
        [[Paragraph("EduQuest", ST["brand_title"]),
          Paragraph("FEE RECEIPT<br/>" + receipt_number, ST["inv_label"])]],
        colWidths=[col_w * 0.55, col_w * 0.45],
    )
    header.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BRAND),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (0, -1),  14),
        ("RIGHTPADDING",  (-1, 0), (-1, -1), 14),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(header)

    sub_hdr = Table(
        [[Paragraph(institute_name, ST["brand_sub"]),
          Paragraph(f"Date: {payment_date}", ST["inv_val"])]],
        colWidths=[col_w * 0.55, col_w * 0.45],
    )
    sub_hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BRAND),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (0, -1),  14),
        ("RIGHTPADDING",  (-1, 0), (-1, -1), 14),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(sub_hdr)
    story.append(Spacer(1, 6*mm))

    # ── 2. Student info + Payment reference ──────────────────
    left = _vstack([
        Paragraph("STUDENT DETAILS", ST["section_head"]),
        Paragraph(student_name, ST["bold_dark"]),
        Paragraph(f"Admission No: {admission_no}", ST["normal_mid"]),
        Paragraph(f"Class: {class_name}", ST["normal_mid"]),
    ], col_w * 0.50)

    right = _vstack([
        Paragraph("PAYMENT REFERENCE", ST["section_head"]),
        Paragraph(f"Receipt No: {receipt_number}", ST["normal_mid"]),
        Paragraph(f"Transaction ID: {txn_id}", ST["normal_mid"]),
        Paragraph(f"Collected By: {collected_by}", ST["normal_mid"]),
    ], col_w * 0.50)

    two_col = Table([[left, right]], colWidths=[col_w * 0.50, col_w * 0.50])
    two_col.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(two_col)
    story.append(Spacer(1, 5*mm))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_LINE))
    story.append(Spacer(1, 5*mm))

    # ── 3. Fee details table ──────────────────────────────────
    col_widths = [col_w * 0.35, col_w * 0.20, col_w * 0.20, col_w * 0.25]
    items_data = [
        [Paragraph("FEE TYPE",       ST["th_white"]),
         Paragraph("BILLING PERIOD", ST["th_center"]),
         Paragraph("DUE DATE",       ST["th_center"]),
         Paragraph("AMOUNT",         ST["th_right"])],
        [Paragraph(fee_type, ST["normal_dark"]),
         Paragraph(billing_period, ST["td_center"]),
         Paragraph(due_date, ST["td_mid"]),
         Paragraph(amount_fmt, ST["right_bold"])],
    ]
    items_table = Table(items_data, colWidths=col_widths, rowHeights=[None, 36])
    items_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BRAND),
        ("BACKGROUND",    (0, 1), (-1, 1), BRAND_LIGHT),
        ("TOPPADDING",    (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (-1, 0), (-1, -1), 10),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.5, LIGHT_LINE),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 4*mm))

    # ── 4. Payment method pill ────────────────────────────────
    method_data = [[
        Paragraph("Payment Method:", ST["method_label"]),
        Paragraph(f"  {pay_method}  |  Paid On: {paid_date}", ST["method_val"]),
    ]]
    method_table = Table(method_data, colWidths=[col_w * 0.30, col_w * 0.70])
    method_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), AMBER_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("LINEABOVE",     (0, 0), (-1, 0),  0.5, AMBER),
        ("LINEBELOW",     (0, -1), (-1, -1), 0.5, AMBER),
        ("LINEBEFORE",    (0, 0), (0, -1),  0.5, AMBER),
        ("LINEAFTER",     (-1, 0), (-1, -1), 0.5, AMBER),
    ]))
    story.append(method_table)
    story.append(Spacer(1, 5*mm))

    # ── 5. Total banner ───────────────────────────────────────
    total_table = Table(
        [[Paragraph("Total Amount Paid", ST["total_label"]),
          Paragraph(amount_fmt, ST["total_amt"])]],
        colWidths=[col_w * 0.60, col_w * 0.40],
    )
    total_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BRAND),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (0, -1),  14),
        ("RIGHTPADDING",  (-1, 0), (-1, -1), 14),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(total_table)
    story.append(Spacer(1, 4*mm))

    # ── 6. Paid confirmation badge ────────────────────────────
    paid_table = Table(
        [[Paragraph("PAYMENT CONFIRMED", ST["paid_badge"])]],
        colWidths=[col_w],
    )
    paid_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), SUCCESS_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEABOVE",     (0, 0), (-1, 0),  1, SUCCESS),
        ("LINEBELOW",     (0, -1), (-1, -1), 1, SUCCESS),
        ("LINEBEFORE",    (0, 0), (0, -1),  1, SUCCESS),
        ("LINEAFTER",     (-1, 0), (-1, -1), 1, SUCCESS),
    ]))
    story.append(paid_table)
    story.append(Spacer(1, 8*mm))

    # ── 7. Footer ─────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_LINE))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        f"This is a system-generated receipt and does not require a signature  "
        f"·  {institute_name}  ·  EduQuest School Management",
        ST["footer"]
    ))

    doc.build(story)
    return buffer.getvalue()