print "Great job"
#from app import app

# RUN THIS SCRIPT OR THE FOLLOWING COMMANDS:
# COMMAND HAS TO BE EXECUTED FROM THE DIRECTORY OF THIS FILE.
# LINUX: export FLASK_APP=coverage.py
# WINDOWS: set FLASK_APP=coverage.py
# Then: flask run

#app.run(host='localhost', port=5000, debug=True)


from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

if __name__ == "__main__":
    app.run()



