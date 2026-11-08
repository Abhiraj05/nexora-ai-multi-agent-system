# Database migrations

Run Alembic commands from the `backend` directory. `DATABASE_URL` must point to a PostgreSQL database.

For a new database, create the schema with:

```powershell
.\env\Scripts\alembic.exe -c alembic.ini upgrade head
```

Existing databases created by the previous `Base.metadata.create_all()` startup flow already have the initial schema. Mark those databases at the baseline instead of trying to recreate their tables:

```powershell
.\env\Scripts\alembic.exe -c alembic.ini stamp 0001_initial_schema
```

Then apply future migrations with `upgrade head`. Back up the database before applying migrations to a shared or production environment.
