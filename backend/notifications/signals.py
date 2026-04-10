from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .utils import send_notification

User = get_user_model()


# -------ASSIGNMENT----------

def on_assignment_classes_changed(sender, instance, action, **kwargs):
    if action != "post_add":
        return

    students = User.objects.filter(
        student_profile__school_class__in=instance.classes.all(),
        role="student",
        tenant=instance.tenant,
    ).distinct()

    print(f"🎯 Assignment classes: {list(instance.classes.all())}")
    print(f"🎯 Students found: {list(students)}")

    if students.exists():
        send_notification(
            recipients=list(students),
            notif_type="assignment",
            title="New Assignment",
            message=f"{instance.title} — due {instance.due_date.strftime('%d %b %Y')}",
            link="/student/assignment"
        )


# ---------- EXAM ----------

def on_exam_classes_changed(sender, instance, action, **kwargs):
    if action != "post_add":
        return

    students = User.objects.filter(
        student_profile__school_class__in=instance.classes.all(),
        role="student",
        tenant=instance.tenant,
    ).distinct()

    if students.exists():
        send_notification(
            recipients=list(students),
            notif_type="exam",
            title="Exam Scheduled",
            message=f"{instance.title} on {instance.exam_date.strftime('%d %b %Y')} at {instance.start_time.strftime('%I:%M %p')}",
            link="/student/exam",
        )


# ------------- FEE BILL------------------

@receiver(post_save, sender="finance.StudentBill")
def on_bill_created(sender, instance, created, **kwargs):
    if not created:
        return
    send_notification(
        recipients=[instance.student.user],
        notif_type="fee",
        title="New Fee Bill",
        message=f"₹{instance.amount} due by {instance.due_date.strftime('%d %b %Y')} — {instance.fee_structure.fee_type.name}",
        link="/student/fee-management",
    )


# -------------- ANNOUNCEMENT -----------------

@receiver(post_save, sender="academics.Announcement")
def on_announcement_created(sender, instance, created, **kwargs):
    if not created:
        return

    recipients = []
    if instance.target_audience in ["students", "all"]:
        recipients = list(User.objects.filter(
            tenant=instance.tenant,
            role="student",
        ))

    if recipients:
        send_notification(
            recipients=recipients,
            notif_type="announcement",
            title="New Announcement",
            message=instance.title,
            link="/student/announcements",
        )


# --------------- MEETING-------------------

@receiver(post_save, sender="chatvideo.Meeting")
def on_meeting_created(sender, instance, created, **kwargs):
    if not created:
        return

    recipients = []
    if instance.meeting_type == "class_meeting":
        recipients = list(User.objects.filter(
            student_profile__school_class=instance.school_class,
            role="student",
            tenant=instance.tenant,
        ))

    if recipients:
        send_notification(
            recipients=recipients,
            notif_type="meeting",
            title="Meeting Scheduled",
            message=f"{instance.title} on {instance.scheduled_at.strftime('%d %b %Y %I:%M %p')}",
            link="/student/meetings",
        )


# ── Connect m2m signals AFTER functions are defined ──────────────────────────
# Done here instead of @receiver because lazy string senders don't work for m2m_changed

def connect_m2m_signals():
    from assignment.models import Assignment
    from exam.models import Exam

    m2m_changed.connect(on_assignment_classes_changed, sender=Assignment.classes.through)
    m2m_changed.connect(on_exam_classes_changed, sender=Exam.classes.through)