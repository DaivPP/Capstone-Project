from flask import Flask, request, render_template, jsonify
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)

# =========================
# 1. Load ML Model + Data
# =========================
model = pickle.load(open("random.pkl", "rb"))
symptoms_dict = pickle.load(open("symptoms_dict.pkl", "rb"))
diseases_list = pickle.load(open("diseases_list.pkl", "rb"))

description = pd.read_csv("description.csv")
precautions_df = pd.read_csv("precautions_df.csv")
medications = pd.read_csv("medications.csv")
diets = pd.read_csv("diets.csv")
workout_df = pd.read_csv("workout_df.csv")

# Drug interactions
file_path = r"C:\\Users\\Daivansh\\Downloads\\db_drug_interactions.csv\\db_drug_interactions.csv"
interactions_df = pd.read_csv(file_path)
interactions_df['Drug 1'] = interactions_df['Drug 1'].str.lower().str.strip()
interactions_df['Drug 2'] = interactions_df['Drug 2'].str.lower().str.strip()

interaction_dict = {}
for _, row in interactions_df.iterrows():
    d1, d2 = row['Drug 1'], row['Drug 2']
    desc = row['Interaction Description']
    interaction_dict[(d1, d2)] = desc
    interaction_dict[(d2, d1)] = desc

# =========================
# Helpers
# =========================
def get_predicted_value(patient_symptoms):
    input_vector = np.zeros(len(symptoms_dict))
    for item in patient_symptoms:
        if item in symptoms_dict:
            input_vector[symptoms_dict[item]] = 1
    return diseases_list[model.predict([input_vector])[0]]

def helper(dis):
    desc = " ".join(description[description['Disease'] == dis]['Description'].values)
    pre = precautions_df[precautions_df['Disease'] == dis][['Precaution_1','Precaution_2','Precaution_3','Precaution_4']].values.flatten().tolist()
    die = diets[diets['Disease'] == dis]['Diet'].tolist()
    wrkout = workout_df[workout_df['disease'] == dis]['workout'].tolist()
    return desc, pre, die, wrkout

def hybrid_recommend(disease, allergies=None):
    rule_based_meds = medications[medications['Disease'].str.lower() == disease.lower()]['Medication'].tolist()
    ml_meds = rule_based_meds
    final_meds = []
    for med in (rule_based_meds + ml_meds):
        if allergies and med.lower() in [a.lower() for a in allergies]:
            continue
        if med not in final_meds:
            final_meds.append(med)
    return final_meds

def check_interaction(drug_list, interaction_dict):
    warnings = []
    drug_list = [d.lower().strip() for d in drug_list]
    for i in range(len(drug_list)):
        for j in range(i+1, len(drug_list)):
            if (drug_list[i], drug_list[j]) in interaction_dict:
                warnings.append(
                    f"⚠️ {drug_list[i].title()} + {drug_list[j].title()}: {interaction_dict[(drug_list[i], drug_list[j])]}"
                )
    return warnings

# =========================
# Routes
# =========================
@app.route("/")
def home():
    return render_template("index.html")

# 🔹 ML Prediction API
@app.route("/api/ml/predict", methods=["POST"])
def api_predict():
    try:
        data = request.get_json()
        symptoms = data.get("symptoms", [])
        allergies = data.get("allergies", [])

        # predict
        predicted_disease = get_predicted_value(symptoms)
        desc, pre, die, wrkout = helper(predicted_disease)
        med = hybrid_recommend(predicted_disease, allergies)
        interaction_warnings = check_interaction(med, interaction_dict)

        return jsonify({
            "disease": predicted_disease,
            "description": desc,
            "precautions": pre,
            "diets": die,
            "workout": wrkout,
            "medications": med,
            "interactions": interaction_warnings
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔹 NEW: Get drug list for dropdown
@app.route("/api/drugs")
def get_drugs():
    drugs = sorted(set(interactions_df['Drug 1']).union(set(interactions_df['Drug 2'])))
    return jsonify(drugs)

# 🔹 NEW: Check interaction between two selected drugs
@app.route("/check_interaction", methods=["POST"])
def check_interaction_api():
    data = request.get_json()
    drug1, drug2 = data.get("drug1", "").lower().strip(), data.get("drug2", "").lower().strip()

    if (drug1, drug2) in interaction_dict:
        result = interaction_dict[(drug1, drug2)]
    elif (drug2, drug1) in interaction_dict:
        result = interaction_dict[(drug2, drug1)]
    else:
        result = "No data available"

    return jsonify({"drug1": drug1.title(), "drug2": drug2.title(), "interaction": result})


if __name__ == "__main__":
    app.run(debug=True)
