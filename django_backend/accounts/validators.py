import re

# Mismas reglas que server/src/validators.js en el backend Node original.
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_]{3,20}$")
NICK_PATTERN = re.compile(r"^[A-Za-z0-9_ .\-]{3,16}$")  # Java: 3-16 alfanumérico+_; Bedrock/Floodgate también permite espacio, punto, guion
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")  # deliberadamente no exhaustivo (RFC 5322 completo)


def is_valid_username(value):
    return isinstance(value, str) and bool(USERNAME_PATTERN.match(value))


def is_valid_nick(value):
    return isinstance(value, str) and bool(NICK_PATTERN.match(value))


def is_valid_password(value):
    return isinstance(value, str) and 8 <= len(value) <= 200


def is_valid_email(value):
    return isinstance(value, str) and len(value) <= 200 and bool(EMAIL_PATTERN.match(value))
