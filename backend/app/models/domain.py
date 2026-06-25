from dataclasses import dataclass


@dataclass
class User:
    id: int
    email: str
    password_hash: str
    name: str
    role: str


@dataclass
class Project:
    id: int
    name: str
    description: str
    status: str
    start_date: str
    end_date: str
