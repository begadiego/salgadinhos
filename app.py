import os
from flask import Flask, render_template

# Create the Flask application
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

@app.route('/')
def index():
    return render_template('index.html')

# Define product data for the fried and baked snacks
@app.context_processor
def inject_products():
    fried_products = [
        {"id": 1, "name": "Coxinha de Frango", "price": 0.57, "type": "fried", "min_quantity": 25, "image": "coxinha_real.png"},
        {"id": 2, "name": "Coxinha de Carne", "price": 0.57, "type": "fried", "min_quantity": 25, "image": "coxinha.svg"},
        {"id": 3, "name": "Rissoles de Presunto Queijo", "price": 0.57, "type": "fried", "min_quantity": 25, "image": "risole.svg"},
        {"id": 4, "name": "Quibe", "price": 0.57, "type": "fried", "min_quantity": 25, "image": "quibe_real.png"},
        {"id": 5, "name": "Bolinha de Queijo", "price": 0.57, "type": "fried", "min_quantity": 25, "image": "bolinha_queijo_real.png"},
        {"id": 6, "name": "Croquete Calabresa", "price": 0.57, "type": "fried", "min_quantity": 25, "image": "croquete.svg"},
        {"id": 7, "name": "Croquete Azeitona", "price": 0.57, "type": "fried", "min_quantity": 25, "image": "croquete.svg"},
        {"id": 8, "name": "Enrolado Salsicha", "price": 0.57, "type": "fried", "min_quantity": 25, "image": "enrolado_salsicha_real.jpeg"}
    ]
    
    baked_products = [
        {"id": 9, "name": "Empada de Frango", "price": 0.87, "type": "baked", "min_quantity": 25, "image": "empada_real.png"},
        {"id": 10, "name": "Empada de Palmito", "price": 0.87, "type": "baked", "min_quantity": 25, "image": "empada_real.png"},
        {"id": 11, "name": "Esfiha de Carne", "price": 0.78, "type": "baked", "min_quantity": 25, "image": "esfiha.svg"},
        {"id": 12, "name": "Esfiha de Frango", "price": 0.78, "type": "baked", "min_quantity": 25, "image": "esfiha.svg"},
        {"id": 13, "name": "Lanchinho Sírio", "price": 1.05, "type": "baked", "min_quantity": 25, "image": "lanchinho_sirio_real.jpeg"}
    ]
    
    return {
        'fried_products': fried_products,
        'baked_products': baked_products
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
