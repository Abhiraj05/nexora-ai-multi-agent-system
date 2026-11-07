from flask import Blueprint, abort, current_app, jsonify, request
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from auth.hash_password import hash_password, verify_password
from auth.jwt_token import create_token
from schemas.user_schemas import UserCreate, UserSignIn
from sql.user_model import User

auth_router = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_router.post("/signup")
def signup_route():
    data = request.get_json(silent=True)
    if not data:
        abort(400, description="A JSON object with name, email, and password is required.")

    try:
        signup = UserCreate.model_validate(data)
    except ValidationError as error:
        abort(400, description=str(error))

    name = signup.name.strip()
    email = signup.email.strip().lower()
    if not name or not email:
        abort(400, description="Name and email must not be empty.")

    session_factory = current_app.extensions["db_session_factory"]
    with session_factory() as db:
        if db.scalar(select(User).where(User.email == email)) is not None:
            abort(409, description="An account with this email already exists.")

        user = User(
            name=name,
            email=email,
            password_hash=hash_password(signup.password),
        )
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            abort(409, description="An account with this email already exists.")
        db.refresh(user)

        return jsonify({
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            },
            "access_token": create_token({"sub": user.email}),
            "token_type": "bearer",
            "message": "Account created successfully.",
        }), 201


@auth_router.post("/signin")
def signin_route():
    data = request.get_json(silent=True)
    if not data:
        abort(400, description="A JSON object with email and password is required.")

    try:
        signin = UserSignIn.model_validate(data)
    except ValidationError as error:
        abort(400, description=str(error))

    email = signin.email.strip().lower()
    session_factory = current_app.extensions["db_session_factory"]
    with session_factory() as db:
        user = db.scalar(select(User).where(User.email == email))
        if user is None or not verify_password(signin.password, user.password_hash):
            abort(401, description="Invalid email or password.")

        token = create_token({"sub": user.email})
        return jsonify({
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            },
        })
