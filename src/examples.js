/* Starter programs shown in the Examples panel. */
window.PP_EXAMPLES = [
  { group: "BP101T · Unit I – Introduction to Python", title: "IDE vs text editor: try the debugger", file: "u1_ide_debug.py", code:
`# Unit I - Why use an IDE instead of a text editor?
# Try these PyPharm (IDE) features on this program:
#  1. Syntax highlighting and line numbers you can see now.
#  2. Click a line number to set a breakpoint, then choose
#     "Step through" (Debug) to run one line at a time.
#  3. Open the Variables tab to watch values change.
#  4. Delete a closing bracket - the status bar flags the error
#     before you run.
doses_mg = [250, 500, 500, 750]
total = 0
for d in doses_mg:
    total = total + d        # watch 'total' grow while stepping
average = total / len(doses_mg)
print("Total dose  :", total, "mg")
print("Average dose:", average, "mg")
` },
  { group: "BP101T · Unit I – Introduction to Python", title: "Variables and data types", file: "u1_datatypes.py", code:
`# Unit I - Variables and data types
# A drug record stored in four basic data types
drug_name = "Paracetamol"     # str   (text)
strength_mg = 500             # int   (whole number)
price_per_strip = 18.75       # float (decimal number)
is_otc = True                 # bool  (True / False)

print("Drug name     :", drug_name, "->", type(drug_name))
print("Strength (mg) :", strength_mg, "->", type(strength_mg))
print("Price (Rs)    :", price_per_strip, "->", type(price_per_strip))
print("Sold OTC?     :", is_otc, "->", type(is_otc))

# Variables can be updated
strength_mg = 650
print(f"New strength: {drug_name} {strength_mg} mg")

# Strings have useful methods
print(drug_name.upper(), "| letters:", len(drug_name), "| starts with 'Para':", drug_name.startswith("Para"))
` },
  { group: "BP101T · Unit I – Introduction to Python", title: "Type casting", file: "u1_typecasting.py", code:
`# Unit I - Type casting (converting between data types)
label = "500"                 # text read from a label or a form
qty_text = "10"

# "500" + "10" joins text; convert first to do arithmetic
print("Without casting:", label + qty_text)
total_mg = int(label) * int(qty_text)
print("With int()     :", total_mg, "mg in the strip")

# float() for decimals, str() to join numbers with text
weight = float("62.5")
print("Patient weight is " + str(weight) + " kg")

# int() drops the decimal part; round() rounds it
volume_ml = 7.8
print("int(7.8)   =", int(volume_ml))
print("round(7.8) =", round(volume_ml))

# bool(): 0 and empty text are False, everything else True
print("bool(0) =", bool(0), "| bool(5) =", bool(5), "| bool('') =", bool(""))

# Casting can fail - Python reports a ValueError
try:
    int("500 mg")
except ValueError as e:
    print("Error:", e)
    print("Tip: strip the unit first ->", int("500 mg".replace("mg", "").strip()))
` },
  { group: "BP101T · Unit I – Introduction to Python", title: "Operators: arithmetic, comparison, logical", file: "u1_operators.py", code:
`# Unit I - Basic operators: arithmetic, comparison, logical
# Arithmetic: + - * / // % **
tablets = 45
per_day = 2
print("Days of supply  (//):", tablets // per_day)
print("Tablets left    (%) :", tablets % per_day)
print("Exact days      (/) :", tablets / per_day)

# Exponent: fraction of drug left after n half-lives
n = 3
print("Fraction left after", n, "half-lives (**):", 0.5 ** n)

# Comparison: == != > < >= <=  (result is True/False)
temp_c = 6
print("Fridge temp within 2-8 °C?", temp_c >= 2 and temp_c <= 8)
print("Expired?", 2026 > 2027)

# Logical: and, or, not
age = 70
crcl = 45           # creatinine clearance, mL/min
renal_adjust = age >= 65 and crcl < 50
print("Renal dose adjustment needed?", renal_adjust)
print("not renal_adjust ->", not renal_adjust)
print("Elderly OR impaired?", age >= 65 or crcl < 50)
` },
  { group: "BP101T · Unit I – Introduction to Python", title: "Input and output (CrCl calculator)", file: "u1_input_output.py", code:
`# Unit I - Input and output
# Cockcroft-Gault creatinine clearance (mL/min)
# Type your answers in the orange Input box below the Output
name = input("Patient name: ")
age = int(input("Age (years): "))
weight = float(input("Body weight (kg): "))
scr = float(input("Serum creatinine (mg/dL): "))
sex = input("Sex (M/F): ").strip().upper()

crcl = (140 - age) * weight / (72 * scr)
if sex == "F":
    crcl = crcl * 0.85

print()
print("=" * 36)
print(f"Patient      : {name}")
print(f"Age / Weight : {age} y / {weight:.1f} kg")
print(f"CrCl         : {crcl:.1f} mL/min")
print("=" * 36)
` },
  { group: "BP101T · Unit I – Introduction to Python", title: "String operations", file: "u1_strings.py", code:
`# Unit I - Basic string operations and manipulation
drug = "  amoxicillin trihydrate  "
print("Original      :", repr(drug))
clean = drug.strip().title()
print("strip + title :", clean)
print("upper / lower :", clean.upper(), "/", clean.lower())
print("Length        :", len(clean))
print("Contains 'cillin'?", "cillin" in clean.lower())

# Joining (+), repeating (*) and f-strings
strength = 500
label = clean + " " + str(strength) + " mg"
print(label)
print("-" * len(label))
print(f"{clean} capsules, {strength} mg, pack of {10}")

# split / join / replace / count / find
composition = "Paracetamol 500 mg, Caffeine 65 mg, Phenylephrine 5 mg"
parts = composition.split(", ")
print("Ingredients:", parts)
print("Names only :", " | ".join(p.split()[0] for p in parts))
print("replace    :", composition.replace("mg", "milligram"))
print("'mg' appears", composition.count("mg"), "times; 'Caffeine' starts at index", composition.find("Caffeine"))
` },
  { group: "BP101T · Unit I – Introduction to Python", title: "Standard and third-party libraries", file: "u1_libraries.py", code:
`# Unit I - Standard libraries and third-party libraries
# Standard library: comes with Python, nothing to install
import math
import statistics
import random
from datetime import date, timedelta

print("math.log(2)        =", round(math.log(2), 4))
print("Half-life (k=0.173)=", round(math.log(2) / 0.173, 2), "h")
print("Mean of assays     =", statistics.mean([99.1, 100.4, 98.7]))
print("Random batch no.   =", "B" + str(random.randint(1000, 9999)))
mfg = date(2026, 1, 15)
print("Expiry (24 months) =", mfg + timedelta(days=730))

# Third-party libraries: installed separately (numpy, pandas, matplotlib ...)
import numpy as np
print("NumPy version      =", np.__version__)

# Installing and uninstalling on a normal computer (in a terminal):
#     pip install pandas          pip uninstall pandas
#     pip list                    pip show numpy
# In PyPharm, the common libraries are already built in - open the
# Packages panel to see them, or type a name under "Install from PyPI".
` },
  { group: "BP101T · Unit II – Control structures & functions", title: "if, if-else, if-elif-else, nested", file: "u2_if_else.py", code:
`# Unit II - if, if-else, if-elif-else and nested conditions
temp_c = 5

# if
if temp_c < 0:
    print("Warning: frozen")

# if-else
if 2 <= temp_c <= 8:
    print(temp_c, "°C -> stored in the refrigerator")
else:
    print(temp_c, "°C -> not refrigerated")

# if-elif-else: storage class (IP definitions)
def storage_class(t):
    if t <= -15:
        return "Freezer"
    elif 2 <= t <= 8:
        return "Cold"
    elif 8 < t <= 25:
        return "Cool"
    elif 25 < t <= 30:
        return "Room temperature"
    else:
        return "Outside standard ranges"

for product, t in [("Insulin", 5), ("Vaccine", -20), ("Amoxicillin", 22), ("ORS", 28)]:
    print(f"{product:12s} {t:>4} °C -> {storage_class(t)}")

# Nested conditions: can this patient get the standard dose?
age, crcl, pregnant = 68, 42, False
if not pregnant:
    if age >= 65:
        if crcl < 50:
            print("Elderly with low CrCl -> reduce dose by 50 %")
        else:
            print("Elderly, normal kidneys -> standard dose, monitor")
    else:
        print("Adult -> standard dose")
else:
    print("Pregnant -> check safety category first")
` },
  { group: "BP101T · Unit II – Control structures & functions", title: "for and while loops, break, continue", file: "co2_loops.py", code:
`# Control structures - for and while loops, break and continue
# while: how many hours until the plasma level falls below the MEC?
c = 40.0          # mg/L just after the dose
half_life = 4     # h
mec = 5.0         # minimum effective concentration, mg/L
hours = 0
while c > mec:
    hours += half_life
    c = c / 2
    print(f"after {hours:2d} h : {c:5.2f} mg/L")
print("Level falls to the MEC after", hours, "h - give the next dose then")

# for with continue / break: screen a batch of pH readings
print()
readings = [6.8, 7.0, None, 7.1, 6.9, 8.4, 7.0]
for i, ph in enumerate(readings, start=1):
    if ph is None:
        print(f"Sample {i}: missing - skipped")
        continue
    if not 6.5 <= ph <= 7.5:
        print(f"Sample {i}: pH {ph} OUT OF LIMIT - stop the batch")
        break
    print(f"Sample {i}: pH {ph} ok")
` },
  { group: "BP101T · Unit II – Control structures & functions", title: "Functions: arguments and return values", file: "co2_functions.py", code:
`# Functions - parameters, default values, return
def bmi(weight_kg, height_m):
    """Body-mass index."""
    return weight_kg / height_m ** 2

def bsa_mosteller(weight_kg, height_cm):
    """Body surface area (m^2), Mosteller formula."""
    return ((weight_kg * height_cm) / 3600) ** 0.5

def paediatric_dose(adult_dose, child_bsa, adult_bsa=1.73):
    """BSA-based paediatric dose; adult_bsa has a default value."""
    return adult_dose * child_bsa / adult_bsa

w, h = 20, 115     # child: 20 kg, 115 cm
child_bsa = bsa_mosteller(w, h)
print(f"BMI : {bmi(w, h / 100):.1f} kg/m²")
print(f"BSA : {child_bsa:.2f} m²")
print(f"Dose: {paediatric_dose(500, child_bsa):.0f} mg (adult dose 500 mg)")

# A lambda is a one-line function
mg_to_g = lambda mg: mg / 1000
print("1500 mg =", mg_to_g(1500), "g")
` },
  { group: "BP101T · Unit II – Control structures & functions", title: "Modular program: dosage and BMI", file: "u2_modular.py", code:
`# Unit II - Modular program: dosage and BMI calculator
# Each job is a small function; main() calls them in order.

def bmi(weight_kg, height_cm):
    return weight_kg / (height_cm / 100) ** 2

def bmi_category(value):
    if value < 18.5:
        return "Underweight"
    elif value < 25:
        return "Normal"
    elif value < 30:
        return "Overweight"
    return "Obese"

def weight_based_dose(weight_kg, mg_per_kg, max_mg):
    dose = weight_kg * mg_per_kg
    return min(dose, max_mg)

def clarks_rule(adult_dose, child_weight_kg):
    """Child dose = adult dose x weight (kg) / 70"""
    return adult_dose * child_weight_kg / 70

def main():
    name = input("Patient name: ")
    weight = float(input("Weight (kg): "))
    height = float(input("Height (cm): "))
    b = bmi(weight, height)
    print(f"\\n{name}: BMI {b:.1f} kg/m² ({bmi_category(b)})")
    print(f"Paracetamol 15 mg/kg (max 1000 mg): {weight_based_dose(weight, 15, 1000):.0f} mg")
    print(f"Clark's rule for a 500 mg adult dose: {clarks_rule(500, weight):.0f} mg")

main()
` },
  { group: "BP101T · Unit III – Data structures & file handling", title: "Lists, tuples and dictionaries", file: "co3_data_structures.py", code:
`# Data structures - list, tuple, set, dictionary
# List: ordered, changeable
prescription = ["Metformin", "Atorvastatin", "Amlodipine"]
prescription.append("Aspirin")
prescription.sort()
print("List  :", prescription, "| first:", prescription[0])

# Tuple: ordered, cannot change (fixed facts)
storage_range = (2, 8)            # °C
print("Tuple :", storage_range, "| min:", storage_range[0])

# Set: unique items, fast membership tests
interacting = {"Aspirin", "Warfarin", "Ibuprofen"}
flagged = interacting & set(prescription)   # intersection
print("Set   : drugs needing an interaction check ->", flagged)

# Dictionary: key -> value lookup
stock = {"Metformin": 120, "Atorvastatin": 40, "Amlodipine": 0, "Aspirin": 300}
stock["Atorvastatin"] -= 10
print("Dict  :", stock)
out_of_stock = [d for d, qty in stock.items() if qty == 0]
print("Out of stock:", out_of_stock)

# Nested: a list of dictionaries (one record per patient)
patients = [{"id": 1, "drug": "Metformin", "dose": 500},
            {"id": 2, "drug": "Aspirin", "dose": 75}]
for p in patients:
    print(f"Patient {p['id']}: {p['drug']} {p['dose']} mg")
` },
  { group: "BP101T · Unit III – Data structures & file handling", title: "Indexing, slicing and string handling", file: "u3_indexing.py", code:
`# Unit III - Indexing and slicing, list/dictionary operations, strings
conc = [0.0, 4.2, 7.9, 9.6, 8.8, 7.1, 5.0, 3.4]     # mg/L at each sample
times = [0, 0.5, 1, 2, 3, 4, 6, 8]                  # h

print("First sample   conc[0]  :", conc[0])
print("Last sample    conc[-1] :", conc[-1])
print("Samples 2-4    conc[1:4]:", conc[1:4])
print("Every 2nd      conc[::2]:", conc[::2])
print("Reversed       conc[::-1]:", conc[::-1])
print("Cmax =", max(conc), "at", times[conc.index(max(conc))], "h")

# List operations
conc.append(2.1); times.append(10)
print("After append, n =", len(conc), "| sorted:", sorted(conc)[:4], "...")

# Dictionary operations
pk = {"drug": "Atenolol", "dose_mg": 50, "tmax_h": 2}
pk["cmax"] = max(conc)            # add
pk["dose_mg"] = 100               # update
del pk["tmax_h"]                  # remove
print("Keys:", list(pk.keys()))
for key, value in pk.items():
    print(f"  {key:8s} = {value}")
print("get() with default:", pk.get("auc", "not calculated"))

# String manipulation: slicing a batch code
code = "PCM-2026-B014"
print("Product:", code[:3], "| Year:", code[4:8], "| Batch:", code[-4:])
` },
  { group: "BP101T · Unit III – Data structures & file handling", title: "Introduction to NumPy arrays", file: "u3_numpy.py", code:
`# Unit III - Introduction to NumPy: array creation and arithmetic
import numpy as np

# Creating arrays
weights = np.array([502, 498, 510, 489, 505, 497, 520, 501, 499, 503])   # mg
times = np.arange(0, 25, 4)          # 0, 4, 8 ... 24
grid = np.linspace(0, 1, 5)          # 5 evenly spaced values
zeros = np.zeros(3)
print("weights:", weights, "| shape:", weights.shape, "| dtype:", weights.dtype)
print("arange :", times)
print("linspace:", grid, "| zeros:", zeros)

# Arithmetic works on every element at once (no loop needed)
print("In grams        :", weights / 1000)
print("Deviation (mg)  :", weights - weights.mean())
print("% of 500 mg     :", np.round(weights / 500 * 100, 1))
C = 20 * np.exp(-0.173 * times)
print("Conc. at each t :", np.round(C, 2))

# Summary statistics
print(f"mean {weights.mean():.1f}  sd {weights.std(ddof=1):.2f}  min {weights.min()}  max {weights.max()}")

# Content uniformity acceptance value (k = 2.4, L1 = 15)
content = np.array([98.2, 101.5, 99.8, 97.6, 100.9, 102.3, 99.1, 98.7, 100.4, 101.0])
M = min(max(content.mean(), 98.5), 101.5)
av = abs(M - content.mean()) + 2.4 * content.std(ddof=1)
print("Acceptance value:", round(av, 2), "->", "PASS" if av <= 15 else "FAIL")
` },
  { group: "BP101T · Unit III – Data structures & file handling", title: "Text files", file: "co3_file_handling.py", code:
`# File handling - write, append and read files
import csv

# 1. Write a text file
with open("batch_log.txt", "w") as f:
    f.write("Batch PCM-2401 granulation started\\n")
    f.write("Moisture content: 2.1 %\\n")

# 2. Append to it
with open("batch_log.txt", "a") as f:
    f.write("Compression complete\\n")

# 3. Read it back line by line
print("--- batch_log.txt ---")
with open("batch_log.txt") as f:
    for n, line in enumerate(f, start=1):
        print(n, line.strip())

# 4. Write and read a CSV file
rows = [["Batch", "Assay_%", "Hardness_kp"],
        ["PCM-2401", 99.2, 6.1], ["PCM-2402", 97.8, 5.7], ["PCM-2403", 101.4, 6.4]]
with open("qc_results.csv", "w", newline="") as f:
    csv.writer(f).writerows(rows)

print()
print("--- qc_results.csv ---")
with open("qc_results.csv") as f:
    for rec in csv.DictReader(f):
        ok = 95 <= float(rec["Assay_%"]) <= 105
        print(f"{rec['Batch']}: assay {rec['Assay_%']}% -> {'PASS' if ok else 'FAIL'}")
print()
print("Both files are now in the Files panel - open or download them.")
` },
  { group: "BP101T · Unit III – Data structures & file handling", title: "CSV files and a healthcare dataset", file: "u3_csv.py", code:
`# Unit III - Reading and writing CSV files; a structured healthcare dataset
import csv

# A structured dataset = rows (records) x columns (fields)
patients = [
    {"id": "P01", "age": 54, "sex": "M", "drug": "Amlodipine", "sbp_before": 156, "sbp_after": 138},
    {"id": "P02", "age": 61, "sex": "F", "drug": "Telmisartan", "sbp_before": 162, "sbp_after": 140},
    {"id": "P03", "age": 47, "sex": "F", "drug": "Amlodipine", "sbp_before": 150, "sbp_after": 136},
    {"id": "P04", "age": 70, "sex": "M", "drug": "Telmisartan", "sbp_before": 171, "sbp_after": 149},
    {"id": "P05", "age": 58, "sex": "M", "drug": "Amlodipine", "sbp_before": 158, "sbp_after": 141},
]

# Write the CSV file
with open("bp_study.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=patients[0].keys())
    w.writeheader()
    w.writerows(patients)
print("Wrote bp_study.csv (see the Files panel)\\n")

# Import it back and do basic access and manipulation
with open("bp_study.csv") as f:
    rows = list(csv.DictReader(f))

print("Columns:", list(rows[0].keys()))
print("Records:", len(rows))
print("Third patient:", rows[2])

for r in rows:                                    # text -> numbers, new field
    r["drop"] = int(r["sbp_before"]) - int(r["sbp_after"])

over_60 = [r["id"] for r in rows if int(r["age"]) > 60]
print("Patients over 60:", over_60)
for drug in ("Amlodipine", "Telmisartan"):
    d = [r["drop"] for r in rows if r["drug"] == drug]
    print(f"{drug:12s} mean SBP drop = {sum(d) / len(d):.1f} mmHg (n={len(d)})")
` },
  { group: "BP101T · Unit IV – Data handling with Pandas", title: "Series, DataFrame, read CSV and Excel", file: "u4_series_dataframe.py", code:
`# Unit IV - Pandas Series and DataFrame; reading CSV and Excel files
import pandas as pd

# A Series is one labelled column
half_life = pd.Series({"Paracetamol": 2.5, "Amoxicillin": 1.0, "Metformin": 6.2}, name="t_half_h")
print(half_life, "\\n")
print("Longest:", half_life.idxmax(), "| mean:", round(half_life.mean(), 2), "\\n")

# A DataFrame is a table of Series sharing one index
pk = pd.DataFrame({
    "time_h": [0.5, 1, 2, 3, 4, 6, 8, 12],
    "subj1":  [3.1, 5.6, 8.2, 7.9, 6.8, 4.9, 3.5, 1.8],
    "subj2":  [2.4, 4.9, 7.6, 8.1, 7.2, 5.3, 3.9, 2.0],
    "subj3":  [3.6, 6.2, 8.8, 8.0, 6.5, 4.4, 3.0, 1.5],
})

# Save a PK study as CSV and an ADR report as Excel, then read both back
pk.to_csv("pk_study.csv", index=False)
adr = pd.DataFrame({"drug": ["Amoxicillin", "Ibuprofen", "Metformin", "Atorvastatin"],
                    "prescriptions": [1200, 950, 1500, 800], "adr_reports": [36, 41, 18, 22]})
adr.to_excel("adr_reports.xlsx", index=False)

pk2 = pd.read_csv("pk_study.csv")
adr2 = pd.read_excel("adr_reports.xlsx")
print("PK study (CSV):\\n", pk2.head(3), "\\n")
print("ADR reports (Excel):\\n", adr2, "\\n")

pk2["mean_conc"] = pk2[["subj1", "subj2", "subj3"]].mean(axis=1).round(2)
print("Mean concentration column added:\\n", pk2[["time_h", "mean_conc"]])
print("\\nBoth files are in the Files panel. Upload your own CSV/Excel there to read it.")
` },
  { group: "BP101T · Unit IV – Data handling with Pandas", title: "Inspect, clean, filter, group (ADR data)", file: "u4_cleaning.py", code:
`# Unit IV - Inspecting, cleaning, filtering and grouping (ADR dataset)
import pandas as pd
import numpy as np

adr = pd.DataFrame({
    "report_id": range(101, 113),
    "drug":     ["Amoxicillin", "ibuprofen ", "Metformin", "Amoxicillin", "Ibuprofen", "Metformin",
                 "Amoxicillin", "Ibuprofen", None, "Metformin", "Amoxicillin", "Ibuprofen"],
    "age":      [34, 58, 62, np.nan, 45, 71, 29, 66, 50, 55, 40, 38],
    "severity": ["Mild", "Moderate", "Mild", "Severe", "Mild", "Moderate",
                 "Mild", "Severe", "Mild", "Mild", "Moderate", "Mild"],
    "days_to_onset": [2, 5, 14, 1, 3, 20, 2, 4, 7, 10, 1, 3],
})
adr = pd.concat([adr, adr.iloc[[0]]])          # an accidental duplicate row

# 1. Inspect
print(adr.head(), "\\n")
print(adr.tail(3), "\\n")
adr.info()
print("\\n", adr.describe().round(1), "\\n")

# 2. Clean
print("Missing per column:\\n", adr.isna().sum(), "\\n")
adr = adr.drop_duplicates()
adr["drug"] = adr["drug"].str.strip().str.title()      # fix spacing / case
adr = adr.dropna(subset=["drug"])                      # drop rows with no drug
adr["age"] = adr["age"].fillna(adr["age"].median())    # fill missing age
print("Rows after cleaning:", len(adr), "\\n")

# 3. Filter
print("Severe reactions:\\n", adr[adr["severity"] == "Severe"][["report_id", "drug", "age"]], "\\n")
print("Patients over 60 with Moderate/Severe:\\n",
      adr[(adr["age"] > 60) & (adr["severity"] != "Mild")][["drug", "age", "severity"]], "\\n")

# 4. Group and aggregate
print(adr.groupby("drug").agg(reports=("report_id", "count"),
                              mean_age=("age", "mean"),
                              mean_onset_days=("days_to_onset", "mean")).round(1), "\\n")
print(pd.crosstab(adr["drug"], adr["severity"]))
` },
  { group: "BP101T · Unit V – Visualization with Matplotlib", title: "Concentration-time curves: oral vs IV", file: "u5_pk_oral_iv.py", code:
`# Unit V - Concentration-time curves: oral vs IV (line plot)
import numpy as np
import matplotlib.pyplot as plt

dose, Vd, k, ka, F = 500, 40, 0.173, 1.0, 0.8
t = np.linspace(0, 24, 300)
iv = dose / Vd * np.exp(-k * t)
oral = F * dose * ka / (Vd * (ka - k)) * (np.exp(-k * t) - np.exp(-ka * t))
MEC = 3

plt.figure(figsize=(8, 4.5))
plt.plot(t, iv, lw=2.5, label="IV bolus")
plt.plot(t, oral, lw=2.5, label=f"Oral (F = {F})")
plt.axhline(MEC, ls="--", color="gray", label="MEC")
plt.xlabel("Time (h)")                 # label axes
plt.ylabel("Plasma concentration (mg/L)")
plt.title("Plasma concentration after a 500 mg dose")   # title
plt.legend()                           # legend
plt.grid(alpha=0.3)
plt.show()

# Scientific interpretation
i = oral.argmax()
auc = lambda c: np.sum((c[1:] + c[:-1]) / 2 * np.diff(t))   # trapezoidal rule
auc_iv, auc_oral = auc(iv), auc(oral)
print(f"IV  : Cmax {iv[0]:.1f} mg/L at t = 0 (no absorption phase)")
print(f"Oral: Cmax {oral[i]:.1f} mg/L at tmax {t[i]:.1f} h")
print(f"AUC0-24 oral/IV = {auc_oral / auc_iv:.2f}  -> close to the bioavailability F = {F}")
print("Both curves fall in parallel at the end: same elimination rate (k).")
` },
  { group: "BP101T · Unit V – Visualization with Matplotlib", title: "ADR reporting rates across drugs", file: "u5_adr_rates.py", code:
`# Unit V - ADR reporting rates across drugs (bar plot + scatter plot)
import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({"drug": ["Amoxicillin", "Ibuprofen", "Metformin", "Atorvastatin", "Ciprofloxacin"],
                   "prescriptions": [1200, 950, 1500, 800, 600],
                   "adr_reports": [36, 41, 18, 22, 27]})
df["rate_per_1000"] = df["adr_reports"] / df["prescriptions"] * 1000
df = df.sort_values("rate_per_1000", ascending=False)

fig, (a1, a2) = plt.subplots(1, 2, figsize=(11, 4.2))
a1.bar(df["drug"], df["rate_per_1000"], color="#0e7c7b")
a1.set(title="ADR reporting rate", ylabel="Reports per 1000 prescriptions")
a1.tick_params(axis="x", rotation=30)

a2.scatter(df["prescriptions"], df["adr_reports"], s=80, color="#b9540f")
for _, r in df.iterrows():
    a2.annotate(r["drug"], (r["prescriptions"], r["adr_reports"]), xytext=(5, 5), textcoords="offset points", fontsize=8)
a2.set(title="Reports vs prescriptions", xlabel="Prescriptions", ylabel="ADR reports")
a2.margins(0.15)
a2.grid(alpha=0.3)
plt.tight_layout()
plt.show()

print(df.round(1).to_string(index=False))
top = df.iloc[0]
print(f"\\nInterpretation: {top['drug']} has the highest rate ({top['rate_per_1000']:.1f}/1000)")
print("even though it is not the most prescribed - raw counts alone can mislead.")
` },
  { group: "BP101T · Unit V – Visualization with Matplotlib", title: "Dissolution profiles", file: "u5_dissolution.py", code:
`# Unit V - Dissolution profiles: reference vs test (line plot with markers)
import numpy as np
import matplotlib.pyplot as plt

t = np.array([5, 10, 15, 20, 30, 45, 60])            # min
ref  = np.array([18, 34, 48, 59, 74, 86, 93])        # % released
test = np.array([15, 30, 44, 56, 71, 84, 92])
sd_ref = np.array([2.1, 2.8, 3.0, 2.6, 2.2, 1.8, 1.2])

plt.figure(figsize=(8, 4.5))
plt.errorbar(t, ref, yerr=sd_ref, marker="o", capsize=3, lw=2, label="Reference")
plt.plot(t, test, marker="s", lw=2, label="Test")
plt.axhline(85, ls=":", color="gray", label="85 % released")
plt.xlabel("Time (min)"); plt.ylabel("Drug released (%)")
plt.title("In-vitro dissolution profiles")
plt.ylim(0, 100); plt.legend(); plt.grid(alpha=0.3)
plt.show()

# Interpretation with the similarity factor f2
f2 = 50 * np.log10(100 / np.sqrt(1 + np.mean((ref - test) ** 2)))
print(f"f2 = {f2:.1f} ->", "profiles are similar (f2 >= 50)" if f2 >= 50 else "profiles differ (f2 < 50)")
print("Reference reaches 85 % by", t[np.argmax(ref >= 85)], "min; test by", t[np.argmax(test >= 85)], "min")
` },
  { group: "BP101T · Unit V – Visualization with Matplotlib", title: "Line, histogram, scatter and box plots", file: "u5_plot_types.py", code:
`# Unit V - Line, histogram, scatter and box plots with labels and legends
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)
conc = np.array([0, 2, 4, 6, 8, 10])                          # µg/mL
absb = 0.081 * conc + 0.004 + rng.normal(0, 0.02, 6)          # absorbance
weights = rng.normal(500, 6, 80)                              # tablet weights, mg
hard_a, hard_b = rng.normal(6.2, 0.4, 20), rng.normal(5.5, 0.6, 20)

fig, ax = plt.subplots(2, 2, figsize=(10, 7.5))

slope, icpt = np.polyfit(conc, absb, 1)
ax[0, 0].scatter(conc, absb, label="Standards")
ax[0, 0].plot(conc, slope * conc + icpt, "r-", label=f"y = {slope:.4f}x + {icpt:.4f}")
ax[0, 0].set(title="Scatter: calibration curve", xlabel="Concentration (µg/mL)", ylabel="Absorbance")
ax[0, 0].legend()

days = np.arange(0, 13, 3)
ax[0, 1].plot(days, [100, 99.2, 98.1, 97.3, 96.0], "o-", label="25 °C / 60 % RH")
ax[0, 1].plot(days, [100, 98.0, 95.9, 93.6, 91.2], "s-", label="40 °C / 75 % RH")
ax[0, 1].set(title="Line: stability study", xlabel="Months", ylabel="Assay (%)")
ax[0, 1].legend()

ax[1, 0].hist(weights, bins=12, edgecolor="white")
ax[1, 0].axvline(weights.mean(), color="k", ls="--", label=f"Mean {weights.mean():.1f} mg")
ax[1, 0].set(title="Histogram: tablet weights", xlabel="Weight (mg)", ylabel="Number of tablets")
ax[1, 0].legend()

ax[1, 1].boxplot([hard_a, hard_b])
ax[1, 1].set_xticks([1, 2]); ax[1, 1].set_xticklabels(["Batch A", "Batch B"])
ax[1, 1].set(title="Box plot: hardness by batch", ylabel="Hardness (kp)")

plt.tight_layout()
plt.show()
r2 = np.corrcoef(conc, absb)[0, 1] ** 2
print(f"Calibration R² = {r2:.4f} (linear if > 0.99)")
print(f"Batch A median hardness {np.median(hard_a):.2f} kp vs Batch B {np.median(hard_b):.2f} kp - B is softer and more variable")
` },
  { group: "Python basics", title: "Hello, pharmacy", file: "hello.py", code:
`# Your first PyPharm program
name = input("What is your name? ")
print(f"Welcome to PyPharm, {name}!")

course = "B.Pharm"
semester = 1
print(f"{course} semester {semester}: Python for pharmaceutical sciences")
` },
  { group: "Python basics", title: "Dose calculator", file: "dose.py", code:
`# Weight-based dose with input validation
dose_per_kg = 15          # mg/kg
max_single_dose = 1000    # mg

weight = float(input("Patient weight (kg): "))
if weight <= 0:
    print("Weight must be positive.")
else:
    dose = dose_per_kg * weight
    if dose > max_single_dose:
        print(f"Calculated {dose:.0f} mg exceeds the cap; give {max_single_dose} mg")
    else:
        print(f"Dose: {dose:.0f} mg")
` },
  { group: "Python basics", title: "Loops and lists", file: "loops.py", code:
`# Tablet weight variation test (IP: ±5% for tablets > 250 mg)
weights = [502, 498, 510, 489, 505, 497, 520, 501, 499, 503,
           496, 508, 500, 494, 507, 502, 511, 498, 488, 504]

average = sum(weights) / len(weights)
limit = 0.05 * average
outside = [w for w in weights if abs(w - average) > limit]

print(f"Average weight : {average:.1f} mg")
print(f"Allowed range  : {average - limit:.1f} – {average + limit:.1f} mg")
for i, w in enumerate(weights, start=1):
    flag = "  <-- outside" if w in outside else ""
    print(f"Tablet {i:2d}: {w} mg{flag}")

print("PASS" if len(outside) <= 2 else "FAIL")
` },
  { group: "Python basics", title: "Functions and dictionaries", file: "functions.py", code:
`# Drug records with a dictionary and a function
drugs = {
    "Paracetamol": {"class": "Analgesic", "half_life_h": 2.5},
    "Amoxicillin": {"class": "Antibiotic", "half_life_h": 1.0},
    "Metformin":   {"class": "Antidiabetic", "half_life_h": 6.2},
}

def time_to_eliminate(half_life, fraction=0.97):
    """Hours to eliminate a fraction of the drug (first-order)."""
    import math
    return math.log(1 / (1 - fraction)) / (math.log(2) / half_life)

for name, info in drugs.items():
    t = time_to_eliminate(info["half_life_h"])
    print(f"{name:12s} {info['class']:13s} 97% gone in {t:5.1f} h")
` },
  { group: "Python basics", title: "Classes", file: "classes.py", code:
`class Tablet:
    def __init__(self, name, strength_mg, count):
        self.name = name
        self.strength_mg = strength_mg
        self.count = count

    def total_drug_g(self):
        return self.strength_mg * self.count / 1000

    def __repr__(self):
        return f"Tablet({self.name}, {self.strength_mg} mg x {self.count})"

batch = [Tablet("Paracetamol", 500, 10000), Tablet("Ibuprofen", 400, 6000)]
for t in batch:
    print(t, "->", t.total_drug_g(), "g of API")
` },
  { group: "Pharmaceutics & PK", title: "One-compartment IV bolus", file: "pk_iv_bolus.py", code:
`import numpy as np
import matplotlib.pyplot as plt

dose = 500        # mg
Vd = 40           # L
k = 0.173         # 1/h  (t½ ≈ 4 h)

t = np.linspace(0, 24, 200)
C = (dose / Vd) * np.exp(-k * t)

half_life = np.log(2) / k
auc = dose / (Vd * k)
print(f"C0 = {dose/Vd:.2f} mg/L, t½ = {half_life:.2f} h, AUC0-∞ = {auc:.1f} mg·h/L")

fig, (a1, a2) = plt.subplots(1, 2, figsize=(10, 4))
a1.plot(t, C, color="#0e7c7b", lw=2)
a1.set(xlabel="Time (h)", ylabel="Concentration (mg/L)", title="Linear scale")
a2.semilogy(t, C, color="#c2410c", lw=2)
a2.set(xlabel="Time (h)", title="Semi-log scale")
for a in (a1, a2):
    a.grid(alpha=.3)
plt.tight_layout()
plt.show()
` },
  { group: "Pharmaceutics & PK", title: "Oral absorption (Bateman)", file: "pk_oral.py", code:
`import numpy as np
import matplotlib.pyplot as plt

F, dose, Vd = 0.8, 250, 30     # fraction absorbed, mg, L
ka, ke = 1.2, 0.2              # 1/h

t = np.linspace(0, 24, 300)
C = (F * dose * ka) / (Vd * (ka - ke)) * (np.exp(-ke * t) - np.exp(-ka * t))

tmax = np.log(ka / ke) / (ka - ke)
cmax = C.max()
print(f"Tmax = {tmax:.2f} h   Cmax = {cmax:.2f} mg/L")

plt.plot(t, C, lw=2, color="#0e7c7b")
plt.axvline(tmax, ls="--", color="gray")
plt.annotate(f"Cmax {cmax:.2f}", (tmax, cmax), xytext=(tmax + 2, cmax))
plt.xlabel("Time (h)"); plt.ylabel("Plasma concentration (mg/L)")
plt.title("Oral dose, one-compartment model")
plt.grid(alpha=.3)
plt.show()
` },
  { group: "Pharmaceutics & PK", title: "Dissolution f2 similarity", file: "f2_similarity.py", code:
`import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# dissolution.csv is in the Files panel — edit it or upload your own
df = pd.read_csv("dissolution.csv")
print(df)

R, T = df["Reference"].to_numpy(), df["Test"].to_numpy()
n = len(R)
f2 = 50 * np.log10(100 / np.sqrt(1 + np.sum((R - T) ** 2) / n))
f1 = np.sum(np.abs(R - T)) / np.sum(R) * 100
print(f"\\nf1 (difference) = {f1:.1f}")
print(f"f2 (similarity) = {f2:.1f} ->", "similar" if f2 >= 50 else "not similar")

plt.plot(df["Time_min"], R, "o-", label="Reference")
plt.plot(df["Time_min"], T, "s--", label="Test")
plt.xlabel("Time (min)"); plt.ylabel("% drug released")
plt.title(f"Dissolution profiles (f2 = {f2:.1f})")
plt.legend(); plt.grid(alpha=.3)
plt.show()
` },
  { group: "Pharmaceutics & PK", title: "Release kinetics fitting", file: "kinetics.py", code:
`import numpy as np
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt

t = np.array([0, 15, 30, 45, 60, 90, 120, 180, 240])        # min
Q = np.array([0, 18, 31, 42, 50, 62, 71, 82, 89])            # % released

models = {
    "Zero order":    lambda t, k: k * t,
    "First order":   lambda t, k: 100 * (1 - np.exp(-k * t)),
    "Higuchi":       lambda t, k: k * np.sqrt(t),
    "Korsmeyer–Peppas": lambda t, k, n: k * np.power(t, n),
}

tt = np.linspace(0.1, 240, 200)
plt.plot(t, Q, "ko", label="Observed")
for name, f in models.items():
    p0 = [0.5, 0.5] if name.startswith("Kors") else [0.5]
    mask = (Q <= 60) if name.startswith("Kors") else slice(None)
    popt, _ = curve_fit(f, t[mask][1:] if name.startswith("Kors") else t,
                        Q[mask][1:] if name.startswith("Kors") else Q, p0=p0, maxfev=10000)
    pred = f(t, *popt)
    r2 = 1 - np.sum((Q - pred) ** 2) / np.sum((Q - Q.mean()) ** 2)
    print(f"{name:18s} params={np.round(popt, 4)}  R² = {r2:.4f}")
    plt.plot(tt, f(tt, *popt), label=name)
plt.xlabel("Time (min)"); plt.ylabel("% released"); plt.ylim(0, 105)
plt.legend(); plt.grid(alpha=.3); plt.show()
` },
  { group: "Statistics", title: "Calibration curve (Beer–Lambert)", file: "calibration.py", code:
`import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

conc = np.array([2, 4, 6, 8, 10, 12])            # µg/mL
absb = np.array([0.112, 0.221, 0.335, 0.441, 0.556, 0.662])

fit = stats.linregress(conc, absb)
print(f"Slope = {fit.slope:.4f}, intercept = {fit.intercept:.4f}, r² = {fit.rvalue**2:.5f}")

unknown_abs = 0.390
unknown = (unknown_abs - fit.intercept) / fit.slope
print(f"Unknown sample: A = {unknown_abs} -> {unknown:.2f} µg/mL")

plt.scatter(conc, absb, color="#0e7c7b", zorder=3)
x = np.linspace(0, 13, 50)
plt.plot(x, fit.intercept + fit.slope * x, color="#c2410c")
plt.scatter([unknown], [unknown_abs], marker="x", s=80, color="black")
plt.xlabel("Concentration (µg/mL)"); plt.ylabel("Absorbance")
plt.title("UV calibration curve"); plt.grid(alpha=.3); plt.show()
` },
  { group: "Statistics", title: "Descriptive stats & t-test", file: "ttest.py", code:
`import pandas as pd
from scipy import stats

# Hardness (kg/cm²) of two tablet batches
df = pd.DataFrame({
    "Batch_A": [5.2, 5.6, 5.1, 5.8, 5.4, 5.5, 5.3, 5.7, 5.2, 5.6],
    "Batch_B": [4.9, 5.0, 5.3, 4.8, 5.1, 4.7, 5.2, 5.0, 4.9, 5.1],
})
print(df.describe().round(3))

t, p = stats.ttest_ind(df.Batch_A, df.Batch_B, equal_var=False)
print(f"\\nWelch t = {t:.3f}, p = {p:.4f}")
print("Significant difference" if p < 0.05 else "No significant difference")
` },
  { group: "Statistics", title: "One-way ANOVA", file: "anova.py", code:
`import pandas as pd
import statsmodels.api as sm
from statsmodels.formula.api import ols
import seaborn as sns
import matplotlib.pyplot as plt

data = pd.DataFrame({
    "binder": ["PVP"] * 6 + ["HPMC"] * 6 + ["Starch"] * 6,
    "disint_min": [6.1, 5.8, 6.4, 6.0, 5.9, 6.3,
                   8.2, 7.9, 8.5, 8.1, 7.7, 8.4,
                   4.9, 5.2, 5.0, 4.7, 5.3, 5.1],
})
model = ols("disint_min ~ C(binder)", data=data).fit()
print(sm.stats.anova_lm(model, typ=2))

sns.boxplot(data=data, x="binder", y="disint_min", hue="binder", palette="crest")
plt.ylabel("Disintegration time (min)"); plt.title("Effect of binder")
plt.show()
` },
  { group: "Data & files", title: "Write a CSV report", file: "report.py", code:
`import pandas as pd

stability = pd.DataFrame({
    "Month": [0, 1, 2, 3, 6],
    "Assay_%": [100.2, 99.6, 99.1, 98.7, 97.4],
    "Impurity_%": [0.08, 0.11, 0.15, 0.19, 0.31],
})
stability["Pass"] = (stability["Assay_%"] >= 95) & (stability["Impurity_%"] <= 0.5)
stability.to_csv("stability_report.csv", index=False)
print(stability)
print("\\nSaved stability_report.csv — see the Files panel")
` },
  { group: "Data & files", title: "Animated GIF", file: "animation.py", code:
`import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter

t = np.linspace(0, 24, 120)
fig, ax = plt.subplots(figsize=(5, 3.4))
line, = ax.plot([], [], lw=2, color="#0e7c7b")
ax.set(xlim=(0, 24), ylim=(0, 13), xlabel="Time (h)", ylabel="mg/L", title="IV bolus decay")

def frame(i):
    line.set_data(t[:i], 12.5 * np.exp(-0.17 * t[:i]))
    return line,

anim = FuncAnimation(fig, frame, frames=len(t), interval=40)
anim.save("pk_decay.gif", writer=PillowWriter(fps=25))
plt.close(fig)
print("Saved pk_decay.gif — open it from the Files panel")
` },
  { group: "Data & files", title: "Import your own module", file: "use_module.py", code:
`# Open a second tab named pkhelpers.py containing:
#
#   def half_life(k):
#       import math
#       return math.log(2) / k
#
# Every open tab is saved next to your script, so you can import it.
try:
    from pkhelpers import half_life
    print("t½ =", round(half_life(0.173), 2), "h")
except ModuleNotFoundError:
    print("Create a tab called pkhelpers.py first (see the comment above).")
` },
];

window.PP_SAMPLE_FILES = {
  "dissolution.csv":
`Time_min,Reference,Test
5,18,15
10,34,30
15,48,44
20,59,56
30,74,71
45,86,84
60,93,92
`,
};
