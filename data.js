export const ROUTINE = {
  1: {
    title: "Pull + Skills",
    focus: "Trazioni, dips, front lever, planche",
    exercises: [
      { id: "d1-pullups", name: "Pull ups", rest: "2'", restSec: 120, targets: { w12: "4x5", w34: "4x6", w56: "5x4" } },
      { id: "d1-dips", name: "Dips parallele", rest: "EMOM", restSec: 60, targets: { w12: "7 min: 5–6 reps", w34: "8 min: 5–6 reps", w56: "9 min: 5–6 reps" } },
      { id: "d1-mu", name: "Muscle ups (assistiti)", rest: "2'", restSec: 120, targets: { w12: "3x3", w34: "4x3", w56: "3x4" }, skill: true },
      { id: "d1-fl", name: "Front lever", rest: "2'", restSec: 120, targets: { w12: "3x max", w34: "3x max", w56: "4x max" }, skill: true },
      { id: "d1-bap", name: "Bent arm planche", rest: "2'", restSec: 120, targets: { w12: "3x max", w34: "3x max", w56: "4x max" }, skill: true },
      { id: "d1-chin", name: "Chin ups", rest: "1'30\"", restSec: 90, targets: { w12: "4x5 (fermo alla fronte 5\")", w34: "4x6", w56: "5x6" } },
      { id: "d1-push", name: "Push ups", rest: "30\"", restSec: 30, targets: { w12: "Ladder 1-3-5-7-9-7-5-3-1", w34: "Ladder 1-3-5-7-9-7-5-3-1", w56: "Ladder 1-9-1" } },
      { id: "d1-aus", name: "Australian one arm", rest: "1'", restSec: 60, targets: { w12: "3x6 / braccio", w34: "3x8 / braccio", w56: "3x10 / braccio" } },
      { id: "d1-df", name: "Dragon flag", rest: "1'30\"", restSec: 90, targets: { w12: "4x8", w34: "3x8", w56: "4x10" } },
      { id: "d1-lr", name: "Leg raises", rest: "1'30\"", restSec: 90, targets: { w12: "3x8", w34: "3x10", w56: "3x12" } }
    ]
  },
  2: {
    title: "Push + Bar set",
    focus: "Chin ups, bar dips, OAP, handstand",
    exercises: [
      { id: "d2-chin", name: "Chin ups", rest: "2'", restSec: 120, targets: { w12: "6-6-5-4", w34: "6-5-5-4", w56: "6-5-4-4" } },
      { id: "d2-bardips", name: "Bar dips", rest: "EMOM", restSec: 60, targets: { w12: "5 min: 6 reps", w34: "6 min: 6 reps", w56: "7 min: 6 reps" } },
      { id: "d2-oap", name: "OAP assistiti", rest: "1'30\"", restSec: 90, targets: { w12: "3x3", w34: "3x2", w56: "3x1" }, skill: true },
      { id: "d2-bl", name: "Back lever", rest: "2'", restSec: 120, targets: { w12: "3x10\"", w34: "3x12\"", w56: "4x12\"" }, skill: true },
      { id: "d2-hs", name: "Handstand", rest: "1'30\"", restSec: 90, targets: { w12: "Propedeutiche personali", w34: "Propedeutiche personali", w56: "Propedeutiche personali" }, skill: true, note: "Ognuno esegue le proprie progressioni in base al livello." },
      { id: "d2-barset", name: "Bar set", rest: "2'", restSec: 120, targets: { w12: "2 giri: 1 muscle up (chi lo ha) + 5 bar dips + 5 pull ups", w34: "3 giri", w56: "4 giri" } },
      { id: "d2-vpush", name: "V push ups", rest: "2'", restSec: 120, targets: { w12: "3x6", w34: "3x8", w56: "4x8" } },
      { id: "d2-aus", name: "Australian anelli", rest: "Libere", restSec: 0, targets: { w12: "100 in 8 min", w34: "100 in 7 min", w56: "100 in 6 min" } },
      { id: "d2-arms", name: "Estensioni tricipiti + curl bicipiti anelli", rest: "1'30\"", restSec: 90, targets: { w12: "Superset 3x(10+10)", w34: "3x(12+12)", w56: "4x(12+12)" } },
      { id: "d2-abs", name: "Abs core triset", rest: "1'30\"", restSec: 90, targets: { w12: "3x crunch sbarra 10 + compressioni 10/lato + hollow 20\"", w34: "3x stesso triset", w56: "3x stesso triset" }, note: "Crunch sbarra + compressioni + hollow body." }
    ]
  },
  3: {
    title: "Skills + Ladder",
    focus: "Muscle up, lever, planche, L-sit",
    exercises: [
      { id: "d3-mu", name: "Muscle up", rest: "3'", restSec: 180, targets: { w12: "4x3", w34: "4x4", w56: "5x3" } },
      { id: "d3-fl", name: "Front lever", rest: "2'", restSec: 120, targets: { w12: "3x max", w34: "4x max", w56: "4x max" } },
      { id: "d3-flr", name: "Front lever raises", rest: "2'", restSec: 120, targets: { w12: "3x2", w34: "3x3", w56: "4x3" } },
      { id: "d3-bap", name: "Bent arm planche", rest: "2'", restSec: 120, targets: { w12: "2x max", w34: "3x max", w56: "4x max" } },
      { id: "d3-bl", name: "Back lever", rest: "2'", restSec: 120, targets: { w12: "3x max", w34: "4x max", w56: "4x max" } },
      { id: "d3-hs", name: "Handstand", rest: "1'30\"", restSec: 90, targets: { w12: "Come Giorno 2", w34: "Come Giorno 2", w56: "Come Giorno 2" }, note: "Stesse propedeutiche personali del Giorno 2." },
      { id: "d3-lsit", name: "L-sit", rest: "1'30\"", restSec: 90, targets: { w12: "3x10\"", w34: "3x12\"", w56: "4x12\"" } },
      { id: "d3-ladder", name: "Pull ups / Dips (ladder)", rest: "Reg.", restSec: 0, targets: { w12: "5/1 · 4/2 · 3/3 · 2/4 · 1/5", w34: "6/1 · 5/2 · 4/3 · 3/4 · 2/5 · 1/6", w56: "7/1 · 6/2 · 5/3 · 4/4 · 3/5 · 2/6 · 1/7" } },
      { id: "d3-wheel", name: "Ab wheel", rest: "1'", restSec: 60, targets: { w12: "3x8", w34: "3x10", w56: "3x12" } }
    ]
  }
};

export const WEEKS = [
  { id: "w12", label: "Settimane 1–2" },
  { id: "w34", label: "Settimane 3–4" },
  { id: "w56", label: "Settimane 5–6" }
];

export function findExercise(exerciseId) {
  for (const day of Object.values(ROUTINE)) {
    const found = day.exercises.find((ex) => ex.id === exerciseId);
    if (found) return found;
  }
  return null;
}
