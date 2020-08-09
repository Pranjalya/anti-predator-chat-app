# Using flask to make an api
# import necessary libraries and functions
from flask import Flask, jsonify, request
from flask_restful import Resource, Api
# creating a Flask app
app = Flask(__name__)
api = Api(app)


class Hello(Resource):
    def get(self):
        return jsonify({'data': 'hello world'})

    def post(self):
        data = request.get_json()
        return jsonify(data)


api.add_resource(Hello, '/')


# driver function
if __name__ == '__main__':

    app.run(debug=True)
