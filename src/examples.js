/* Starter programs shown in the Examples panel. */
window.PP_EXAMPLES = [
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
