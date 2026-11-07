import os
import smtplib
import ssl
from email.message import EmailMessage


class EmailDeliveryError(Exception):
    pass


def send_password_reset_code(email: str, otp: str) -> None:
    host = os.environ.get("SMTP_HOST")
    port_value = os.environ.get("SMTP_PORT", "587")
    username = os.environ.get("SMTP_USERNAME")
    password = os.environ.get("SMTP_PASSWORD")
    sender = os.environ.get("SMTP_FROM_EMAIL") or username

    if not host or not username or not password or not sender:
        raise EmailDeliveryError("SMTP settings are incomplete.")

    try:
        port = int(port_value)
        message = EmailMessage()
        message["Subject"] = "Your password reset code"
        message["From"] = sender
        message["To"] = email
        message.set_content(
            f"Your password reset code is {otp}. "
            "It expires in 10 minutes. If you did not request this, ignore this email."
        )

        with smtplib.SMTP(host, port, timeout=10) as server:
            server.ehlo()
            server.starttls(context=ssl.create_default_context())
            server.ehlo()
            server.login(username, password)
            server.send_message(message)
    except (OSError, ValueError, smtplib.SMTPException) as error:
        raise EmailDeliveryError("Could not deliver the password reset email.") from error
