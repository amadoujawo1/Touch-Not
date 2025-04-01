<<<<<<< HEAD
import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI', 'mysql+pymysql://jawo:abc_123@localhost/cash_collection')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
=======
import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI', 'mysql+pymysql://root:MineOne@localhost:3309/cash_collection')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
>>>>>>> 98107f59a4616fd4b5fc6c38d9276c6029e43b1d
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_secret_key')