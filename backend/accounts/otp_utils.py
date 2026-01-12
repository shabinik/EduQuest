from . models import EmailOtp
import random
from django.utils import timezone
from django.core.mail import send_mail

def send_otp(user,subject,message_template):
    # Invalidate old OTPs
    EmailOtp.objects.filter(user=user,is_used = False).update(is_used = True)
        
    code = f"{random.randint(100000,999999)}"

    EmailOtp.objects.create(
        user = user,
        email = user.email,
        code = code,
        expires_at=timezone.now() + timezone.timedelta(minutes=5)
    )

    send_mail(
        subject = subject,
        message = message_template.format(code=code, name=user.full_name),
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )

    