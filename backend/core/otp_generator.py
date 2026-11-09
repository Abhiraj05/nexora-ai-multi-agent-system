import secrets


# Generate a one-time password.
def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"
