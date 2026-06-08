import os
import requests as http
from app.helpers import greet

print(greet(os.getcwd(), http.__name__))
