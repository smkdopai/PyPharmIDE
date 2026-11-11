/* Starter programs shown in the Examples panel. */
window.PP_EXAMPLES = [
  { group: "BP101T · Unit I – Introduction", title: "Variables and data types", file: "u1_datatypes.py", code:
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
  { group: "BP101T · Unit I – Introduction", title: "Type casting", file: "u1_typecasting.py", code:
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
  { group: "BP101T · Unit I – Introduction", title: "Operators: arithmetic, comparison, logical", file: "u1_operators.py", code:
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
  { group: "BP101T · Unit I – Introduction", title: "Input and output (CrCl calculator)", file: "u1_input_output.py", code:
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
  { group: "BP101T · Unit I – Introduction", title: "IDE vs text editor: try the debugger", file: "u1_ide_debug.py", code:
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
  { group: "BP101T · Control structures & functions", title: "if / elif / else: storage conditions", file: "co2_if_else.py", code:
`# Control structures - if / elif / else
# Storage condition from the label temperature (IP definitions)
def storage_class(temp_c):
    if temp_c <= -15:
        return "Freezer"
    elif 2 <= temp_c <= 8:
        return "Cold (refrigerator)"
    elif 8 < temp_c <= 25:
        return "Cool"
    elif 25 < temp_c <= 30:
        return "Room temperature"
    else:
        return "Check label - outside standard ranges"

for product, t in [("Insulin", 5), ("Vaccine (frozen)", -20),
                   ("Amoxicillin capsules", 22), ("ORS sachet", 28), ("Unknown", 40)]:
    print(f"{product:22s} {t:>4} °C  ->  {storage_class(t)}")
` },
  { group: "BP101T · Control structures & functions", title: "for and while loops, break, continue", file: "co2_loops.py", code:
`# Control structures - for and while loops, break and continue
# while: how many hours until the plasma level falls below the MEC?
c = 40.0          # mg/L just after the dose
half_life = 4     # h
mec = 5.0         # minimum effective concentration, mg/L
hours = 0
while c >= mec:
    hours += half_life
    c = c / 2
    print(f"after {hours:2d} h : {c:5.2f} mg/L")
print("Re-dose after about", hours, "h")

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
  { group: "BP101T · Control structures & functions", title: "Functions: BMI, BSA, paediatric dose", file: "co2_functions.py", code:
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
  { group: "BP101T · Data structures & file handling", title: "List, tuple, set, dictionary", file: "co3_data_structures.py", code:
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
  { group: "BP101T · Data structures & file handling", title: "Read and write text and CSV files", file: "co3_file_handling.py", code:
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
  { group: "BP101T · NumPy & Pandas", title: "NumPy: content uniformity", file: "co4_numpy.py", code:
`# NumPy - content uniformity of 10 tablets (acceptance value, simplified)
import numpy as np

content = np.array([98.2, 101.5, 99.8, 97.6, 100.9, 102.3, 99.1, 98.7, 100.4, 101.0])  # % label claim

mean = content.mean()
sd = content.std(ddof=1)               # sample standard deviation
print("Mean :", round(mean, 2), "%")
print("SD   :", round(sd, 2))
print("Range:", content.min(), "-", content.max())
print("RSD  :", round(100 * sd / mean, 2), "%")

# Acceptance value AV = |M - mean| + k*s  (k = 2.4 for n = 10, L1 = 15)
M = min(max(mean, 98.5), 101.5)
av = abs(M - mean) + 2.4 * sd
print("AV   :", round(av, 2), "->", "PASS" if av <= 15 else "FAIL (test 20 more)")

# Vectorised maths on the whole array at once
mg = content / 100 * 500               # convert % to mg for a 500 mg tablet
print("mg per tablet:", np.round(mg, 1))
print("Tablets outside 95-105 %:", np.sum((content < 95) | (content > 105)))
` },
  { group: "BP101T · NumPy & Pandas", title: "Pandas: healthcare dataset", file: "co4_pandas.py", code:
`# Pandas - analysing a small healthcare dataset
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "patient": ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08"],
    "age":     [45, 62, 38, 71, 55, 66, np.nan, 49],
    "sex":     ["M", "F", "F", "M", "M", "F", "F", "M"],
    "drug":    ["Metformin", "Metformin", "Glimepiride", "Metformin",
                "Glimepiride", "Metformin", "Glimepiride", "Metformin"],
    "fbs_before": [168, 182, 155, 201, 174, 190, 160, 171],   # fasting blood sugar, mg/dL
    "fbs_after":  [128, 140, 130, 150, 139, 145, 126, 133],
})

print(df.head(), "\\n")
print("Missing values:\\n", df.isna().sum()[lambda s: s > 0], "\\n")
df["age"] = df["age"].fillna(df["age"].median())        # fill the gap

df["reduction"] = df["fbs_before"] - df["fbs_after"]   # new column
print(df[["patient", "drug", "reduction"]], "\\n")

print("Patients over 60:\\n", df[df["age"] > 60][["patient", "age", "drug"]], "\\n")
print("Mean reduction by drug:\\n", df.groupby("drug")["reduction"].agg(["count", "mean"]).round(1), "\\n")
print(df[["age", "fbs_before", "fbs_after", "reduction"]].describe().round(1))

df.to_csv("diabetes_study.csv", index=False)
print("\\nSaved diabetes_study.csv (see the Files panel)")
` },
  { group: "BP101T · Visualisation", title: "Plasma profile and therapeutic window", file: "co5_plot_pk.py", code:
`# Visualisation - plasma level vs time with the therapeutic window
import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 24, 300)                 # h
ka, k, F, dose, Vd = 1.2, 0.17, 0.9, 500, 35
C = F * dose * ka / (Vd * (ka - k)) * (np.exp(-k * t) - np.exp(-ka * t))
MEC, MTC = 4, 12                            # mg/L

plt.figure(figsize=(8, 4.5))
plt.plot(t, C, lw=2.5, color="#0e7c7b", label="Plasma concentration")
plt.axhline(MEC, ls="--", color="#2b8150", label="MEC")
plt.axhline(MTC, ls="--", color="#be3a2e", label="MTC")
plt.fill_between(t, MEC, MTC, color="#2b8150", alpha=0.08, label="Therapeutic window")
i = C.argmax()
plt.annotate(f"Cmax {C[i]:.1f} mg/L at {t[i]:.1f} h", (t[i], C[i]), (t[i] + 3, C[i] + 1.2),
             arrowprops=dict(arrowstyle="->"))
plt.xlabel("Time (h)"); plt.ylabel("Concentration (mg/L)")
plt.title("Oral dose: concentration-time profile")
plt.legend(); plt.grid(alpha=0.3)
plt.show()

inside = t[(C >= MEC) & (C <= MTC)]
print(f"Time within therapeutic window: {inside.min():.1f} h to {inside.max():.1f} h")
` },
  { group: "BP101T · Visualisation", title: "Bar, pie, histogram and box plot", file: "co5_charts.py", code:
`# Visualisation - bar, pie, histogram and box plot in one figure
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

adr = pd.Series({"Nausea": 34, "Headache": 21, "Rash": 9, "Dizziness": 15, "Diarrhoea": 12})
rng = np.random.default_rng(1)
weights = rng.normal(500, 6, 60)                         # tablet weights, mg
hardness = pd.DataFrame({"Batch A": rng.normal(6.2, 0.4, 20),
                         "Batch B": rng.normal(5.6, 0.6, 20)})

fig, ax = plt.subplots(2, 2, figsize=(10, 7))
adr.sort_values().plot.barh(ax=ax[0, 0], color="#0e7c7b")
ax[0, 0].set(title="Adverse drug reactions reported", xlabel="Number of reports")

ax[0, 1].pie(adr, labels=adr.index, autopct="%1.0f%%", startangle=90)
ax[0, 1].set_title("Share of ADR reports")

ax[1, 0].hist(weights, bins=12, color="#b9540f", edgecolor="white")
ax[1, 0].axvline(weights.mean(), color="k", ls="--", label=f"mean {weights.mean():.1f} mg")
ax[1, 0].set(title="Tablet weight distribution", xlabel="Weight (mg)", ylabel="Tablets")
ax[1, 0].legend()

ax[1, 1].boxplot([hardness["Batch A"], hardness["Batch B"]])
ax[1, 1].set_xticks([1, 2])
ax[1, 1].set_xticklabels(hardness.columns)
ax[1, 1].set(title="Hardness by batch", ylabel="Hardness (kp)")

plt.tight_layout()
plt.show()
print(adr.describe().round(1))
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
