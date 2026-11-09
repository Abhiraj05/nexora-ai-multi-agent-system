from werkzeug.security import check_password_hash, generate_password_hash


# Hash a password before storing it.
def hash_password(password: str) -> str:
    return generate_password_hash(password)


# Check a password against its stored hash.
def verify_password(password: str, hashed: str) -> bool:
    return check_password_hash(hashed, password)