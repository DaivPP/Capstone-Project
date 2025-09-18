🧠 MediTrack ML Backend

📌 Overview

This is the Machine Learning backend for MediTrack.
It predicts diseases based on user symptoms, provides disease descriptions, precautions, medications, diets, and workout recommendations. It also checks for possible drug–drug interactions.

Built with Flask + scikit-learn + pandas.

🚀 Features

Predict disease from entered symptoms (via trained ML model).

Show description & precautions for predicted disease.

Recommend medications (rule-based + ML hybrid).

Check for harmful drug interactions.

Suggest diet and workout plans.

Simple web interface using Flask templates.

⚙️ Setup Instructions

1️⃣ Clone repo & go to ml-backend

git clone https://github.com/<team-repo>.git
cd <team-repo>/ml-backend

2️⃣ Create a virtual environment

python -m venv venv

# Activate it

On Windows:
venv\Scripts\activate

On Mac/Linux:
source venv/bin/activate

3️⃣ Install dependencies

pip install -r requirements.txt

4️⃣ Run the Flask app

python app.py
App will start on:
👉 http://127.0.0.1:5000

