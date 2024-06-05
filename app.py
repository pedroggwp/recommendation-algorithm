from flask import Flask, request, render_template, jsonify
import pandas as pd
from collections import defaultdict
import math

app = Flask(__name__)

# Tratando o Dataset
df = pd.read_excel('./data/loja.xlsx')
df = df.drop(columns=[
    'Order Date', 'Ship Date', 'Ship Mode', 'Customer ID', 'Customer Name', 
    'Country', 'City', 'Postal Code', 'Region', 'Sales', 'Discount', 'Profit', 
    'Product Name', 'Quantity', 'State', 'Product ID', 'Category'
])
df = df.rename(columns={"Sub-Category": "sub_category", "Row ID": "row_id", "Order ID": "order_id", "Segment": "segment"})

# Criando o dicionário de subcategorias por pedido
order_dict = defaultdict(set)
for row in df.itertuples(index=False):
    order_dict[row.order_id].add(row.sub_category)

# Função para converter em porcentagem com dois decimais
def trunc_to_two_decimals(number):
    return math.trunc(number * 10000) / 100

# Função de recomendação de subcategorias com base no carrinho
def recommend_category(cart):
    matchedCarts = 0
    cart_set = set(cart)

    if len(cart_set) == len(df['sub_category'].drop_duplicates()):
        return recommend_category([])

    category_counts = defaultdict(int)
    for order, categories in order_dict.items():
        if cart_set.issubset(categories):
            matchedCarts += 1

            for category in categories:
                if category not in cart_set:
                    category_counts[category] += 1
                    
    total_matches = sum(category_counts.values())
    if total_matches == 0:
        return recommend_category([])

    recommendations = {category: count / matchedCarts for category, count in category_counts.items()}
    sorted_recommendations = sorted(recommendations.items(), key=lambda item: item[1], reverse=True)
    truncated_recommendations = [(category, trunc_to_two_decimals(score), category_counts[category]) for category, score in sorted_recommendations]

    return truncated_recommendations

@app.route('/')
def index():
    subcategories = df['sub_category'].unique().tolist()
    return render_template('index.html', subcategories=subcategories)

@app.route('/recommend', methods=['POST'])
def recommend():
    subcategories = request.json.get('subcategories', [])
    recommendations = recommend_category(subcategories)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)