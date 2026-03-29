from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from io import BytesIO


# ── Colour palette ────────────────────────────────────────────────────────────
BRAND       = colors.HexColor("#4F46E5")   # indigo-600
BRAND_LIGHT = colors.HexColor("#EEF2FF")   # indigo-50
SUCCESS     = colors.HexColor("#059669")   # emerald-600
DARK        = colors.HexColor("#111827")
MID         = colors.HexColor("#6B7280")
LIGHT_LINE  = colors.HexColor("#E5E7EB")
WHITE       = colors.white


def _s(name, **kw) -> ParagraphStyle:
    """Shorthand for creating a named ParagraphStyle."""
    return ParagraphStyle(name, **kw)


# ── Pre-built text styles ─────────────────────────────────────────────────────
ST = {
    "brand_title":  _s("BrandTitle",  fontName="Helvetica-Bold",  fontSize=22, textColor=WHITE, alignment=TA_LEFT),
    "brand_sub":    _s("BrandSub",    fontName="Helvetica",       fontSize=10, textColor=colors.HexColor("#C7D2FE"), alignment=TA_LEFT),
    "inv_label":    _s("InvLabel",    fontName="Helvetica-Bold",  fontSize=11, textColor=WHITE, alignment=TA_RIGHT),
    "inv_val":      _s("InvVal",      fontName="Helvetica",       fontSize=10, textColor=colors.HexColor("#C7D2FE"), alignment=TA_RIGHT),
    "section_head": _s("SectionHead", fontName="Helvetica-Bold",  fontSize=9,  textColor=MID, spaceAfter=3),
    "bold_dark":    _s("BoldDark",    fontName="Helvetica-Bold",  fontSize=11, textColor=DARK),
    "normal_dark":  _s("NormDark",    fontName="Helvetica",       fontSize=10, textColor=DARK),
    "normal_mid":   _s("NormMid",     fontName="Helvetica",       fontSize=9,  textColor=MID),
    "right_bold":   _s("RightBold",   fontName="Helvetica-Bold",  fontSize=11, textColor=DARK, alignment=TA_RIGHT),
    "th_white":     _s("ThWhite",     fontName="Helvetica-Bold",  fontSize=9,  textColor=WHITE),
    "th_center":    _s("ThCenter",    fontName="Helvetica-Bold",  fontSize=9,  textColor=WHITE, alignment=TA_CENTER),
    "th_right":     _s("ThRight",     fontName="Helvetica-Bold",  fontSize=9,  textColor=WHITE, alignment=TA_RIGHT),
    "td_center":    _s("TdCenter",    fontName="Helvetica",       fontSize=10, textColor=DARK, alignment=TA_CENTER),
    "td_mid_c":     _s("TdMidC",      fontName="Helvetica",       fontSize=9,  textColor=MID, alignment=TA_CENTER),
    "total_label":  _s("TotalLabel",  fontName="Helvetica-Bold",  fontSize=13, textColor=WHITE, alignment=TA_LEFT),
    "total_amt":    _s("TotalAmt",    fontName="Helvetica-Bold",  fontSize=16, textColor=WHITE, alignment=TA_RIGHT),
    "paid_badge":   _s("PaidBadge",   fontName="Helvetica-Bold",  fontSize=10, textColor=SUCCESS, alignment=TA_CENTER),
    "note":         _s("Note",        fontName="Helvetica",       fontSize=9,  textColor=MID, leftIndent=6),
    "footer":       _s("Footer",      fontName="Helvetica",       fontSize=8,  textColor=MID, alignment=TA_CENTER),
}


def _vstack(items: list, width: float) -> Table:
    """Stack a list of flowables in a single-column table."""
    t = Table([[i] for i in items], colWidths=[width])
    t.setStyle(TableStyle([
        ("LEFTPADDING",  (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING",   (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 1),
    ]))
    return t


def generate_invoice_pdf(payment) -> bytes:
    subscription = payment.subscription
    plan         = subscription.plan
    tenant       = payment.tenant

    # ── Format display values ─────────────────────────────────
    fmt_date = lambda dt: dt.strftime("%d %B %Y").lstrip("0") if dt else "—"

    invoice_number  = f"INV-{payment.id:05d}"
    invoice_date    = fmt_date(payment.created_at)
    institute_name  = tenant.institute_name
    institute_email = getattr(tenant, "email", "") or ""
    plan_name       = plan.plan_name
    plan_duration   = f"{plan.duration_months} month{'s' if plan.duration_months != 1 else ''}"
    start_date      = fmt_date(subscription.start_date)
    expiry_date     = fmt_date(subscription.expiry_date)
    currency_sym    = "Rs." if plan.currency == "INR" else plan.currency
    amount_fmt      = f"{currency_sym} {float(payment.amount):,.2f}"
    order_id        = payment.razorpay_order_id  or "—"
    payment_id      = payment.razorpay_payment_id or "—"
    max_students    = plan.max_students

    # ── Document setup ────────────────────────────────────────
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=15*mm, leftMargin=15*mm,
        topMargin=15*mm,   bottomMargin=15*mm,
    )
    col_w = A4[0] - 30*mm   # usable page width
    story = []

    # ── 1. Header banner (brand + invoice number) ─────────────
    header = Table(
        [[Paragraph("EduQuest", ST["brand_title"]),
          Paragraph(f"INVOICE<br/>{invoice_number}", ST["inv_label"])]],
        colWidths=[col_w * 0.55, col_w * 0.45],
    )
    header.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BRAND),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (0, -1), 14),
        ("RIGHTPADDING",  (-1, 0), (-1, -1), 14),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(header)

    sub_header = Table(
        [[Paragraph("School Management Platform", ST["brand_sub"]),
          Paragraph(f"Date: {invoice_date}", ST["inv_val"])]],
        colWidths=[col_w * 0.55, col_w * 0.45],
    )
    sub_header.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BRAND),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (0, -1), 14),
        ("RIGHTPADDING",  (-1, 0), (-1, -1), 14),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(sub_header)
    story.append(Spacer(1, 6*mm))

    # ── 2. Billed-to + Payment reference (two columns) ────────
    left_col = _vstack([
        Paragraph("BILLED TO", ST["section_head"]),
        Paragraph(institute_name, ST["bold_dark"]),
        Paragraph(institute_email, ST["normal_mid"]),
    ], col_w * 0.50)

    right_col = _vstack([
        Paragraph("PAYMENT REFERENCE", ST["section_head"]),
        Paragraph(f"Order ID: {order_id}", ST["normal_mid"]),
        Paragraph(f"Payment ID: {payment_id}", ST["normal_mid"]),
    ], col_w * 0.50)

    two_col = Table([[left_col, right_col]], colWidths=[col_w * 0.50, col_w * 0.50])
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

    # ── 3. Line-items table ───────────────────────────────────
    col_widths = [col_w * 0.38, col_w * 0.16, col_w * 0.26, col_w * 0.20]
    items_data = [
        [Paragraph("DESCRIPTION", ST["th_white"]),
         Paragraph("DURATION",    ST["th_center"]),
         Paragraph("VALIDITY",    ST["th_center"]),
         Paragraph("AMOUNT",      ST["th_right"])],
        [Paragraph(f"{plan_name}<br/>Subscription Plan", ST["normal_dark"]),
         Paragraph(plan_duration, ST["td_center"]),
         Paragraph(f"{start_date} –<br/>{expiry_date}", ST["td_mid_c"]),
         Paragraph(amount_fmt, ST["right_bold"])],
    ]
    items_table = Table(items_data, colWidths=col_widths, rowHeights=[None, 40])
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
    story.append(Spacer(1, 3*mm))

    if max_students:
        story.append(Paragraph(
            f"  ✓  Includes access for up to {max_students} students",
            ST["note"]
        ))
    story.append(Spacer(1, 5*mm))

    # ── 4. Total banner ───────────────────────────────────────
    total_table = Table(
        [[Paragraph("Total Amount Paid", ST["total_label"]),
          Paragraph(amount_fmt, ST["total_amt"])]],
        colWidths=[col_w * 0.60, col_w * 0.40],
    )
    total_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), BRAND),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (0, -1), 14),
        ("RIGHTPADDING",  (-1, 0), (-1, -1), 14),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(total_table)
    story.append(Spacer(1, 4*mm))

    # ── 5. Paid confirmation badge ────────────────────────────
    paid_table = Table(
        [[Paragraph("✔  PAYMENT CONFIRMED", ST["paid_badge"])]],
        colWidths=[col_w],
    )
    paid_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#D1FAE5")),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEABOVE",     (0, 0), (-1, 0),  1, SUCCESS),
        ("LINEBELOW",     (0, -1), (-1, -1), 1, SUCCESS),
        ("LINEBEFORE",    (0, 0), (0, -1), 1, SUCCESS),
        ("LINEAFTER",     (-1, 0), (-1, -1), 1, SUCCESS),
    ]))
    story.append(paid_table)
    story.append(Spacer(1, 10*mm))

    # ── 6. Footer ─────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_LINE))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "Thank you for choosing EduQuest  ·  support@eduquest.com  ·  "
        "This is a system-generated invoice",
        ST["footer"]
    ))

    doc.build(story)
    return buffer.getvalue()