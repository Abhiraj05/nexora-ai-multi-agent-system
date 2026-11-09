import os
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from services.email_queue import enqueue_email


_template_environment = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parents[1] / "templates"),
    autoescape=select_autoescape(("html", "xml")),
)


class EmailDeliveryError(Exception):
    pass


# Send an email message through SMTP.
def _send_email(
    recipient: str,
    subject: str,
    body: str,
    html_body: str | None = None,
) -> None:
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
        message["Subject"] = subject
        message["From"] = sender
        message["To"] = recipient
        message.set_content(body)
        if html_body is not None:
            message.add_alternative(html_body, subtype="html")

        with smtplib.SMTP(host, port, timeout=10) as server:
            server.ehlo()
            server.starttls(context=ssl.create_default_context())
            server.ehlo()
            server.login(username, password)
            server.send_message(message)
    except (OSError, ValueError, smtplib.SMTPException) as error:
        raise EmailDeliveryError("Could not deliver the email.") from error


# Render an email template with its context.
def _render_email(template_name: str, **context: str) -> str:
    return _template_environment.get_template(template_name).render(**context)


# Send the account signup confirmation email.
def deliver_signup_success(email: str, username: str) -> None:
    message = "Your account has been created successfully."
    _send_email(
        email,
        "Welcome",
        f"Hello {username},\n\n{message}",
        _render_email(
            "emails/signup_success.html",
            username=username,
            email=email,
            message=message,
        ),
    )


# Send a password-reset code email.
def deliver_password_reset_code(email: str, otp: str, user_name: str) -> None:
    message_text = "Use this one-time password to reset your password."
    _send_email(
        email,
        "Reset Your Password",
        f"""Hello {user_name},

        We received a request to reset your password.

        {message_text}

        OTP: {otp}

        This code expires in 10 minutes. If you did not request a password reset, you can ignore this email.
        """,
                _render_email(
            "emails/otp.html",
            username=user_name,
            email=email,
            message=message_text,
            otp=otp,
        ),
    )


# Send the password-reset confirmation email.
def deliver_password_reset_success(email: str, user_name: str) -> None:
    message_text = (
        "Your password has been reset successfully. You can now sign in "
        "using your new password. If you did not make this change, contact "
        "support immediately."
    )
    _send_email(
        email,
        "Password Reset Successful",
        f"""Hello {user_name},

{message_text}
""",
        _render_email(
            "emails/password_reset_success.html",
            username=user_name,
            email=email,
            message=message_text,
        ),
    )


# Send a feedback notification email.
def deliver_feedback_email(username: str, email: str, message: str) -> None:
    recipient = os.environ.get("FEEDBACK_RECIPIENT_EMAIL")
    if not recipient:
        raise EmailDeliveryError("FEEDBACK_RECIPIENT_EMAIL is not configured.")

    _send_email(
        recipient,
        "New Feedback",
        f"Feedback from {username} ({email}):\n\n{message}",
        _render_email(
            "emails/feedback.html",
            username=username,
            email=email,
            message=message,
        ),
    )


# Queue the signup confirmation email.
async def send_signup_success(email: str, username: str) -> None:
    await enqueue_email("signup_success", email=email, username=username)


# Queue a password-reset code email.
async def send_password_reset_code(email: str, otp: str, user_name: str) -> None:
    await enqueue_email(
        "password_reset_code",
        email=email,
        otp=otp,
        user_name=user_name,
    )


# Queue the password-reset confirmation email.
async def send_password_reset_success(email: str, user_name: str) -> None:
    await enqueue_email(
        "password_reset_success",
        email=email,
        user_name=user_name,
    )


# Queue a feedback notification email.
async def send_feedback_email(username: str, email: str, message: str) -> None:
    await enqueue_email(
        "feedback",
        username=username,
        email=email,
        message=message,
    )
