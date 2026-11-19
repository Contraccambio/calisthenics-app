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
      { id: "d3-ladder", name: "Pull ups / Dips (pyramid)", rest: "Reg.", restSec: 0, targets: { w12: "5/1 · 4/2 · 3/3 · 2/4 · 1/5", w34: "6/1 · 5/2 · 4/3 · 3/4 · 2/5 · 1/6", w56: "7/1 · 6/2 · 5/3 · 4/4 · 3/5 · 2/6 · 1/7" } },
      { id: "d3-wheel", name: "Ab wheel", rest: "1'", restSec: 60, targets: { w12: "3x8", w34: "3x10", w56: "3x12" } }
    ]
  }
};

const NEXT = {
  1: {
    title: "Pull + Skills",
    focus: "Trazioni, dips, gambe, front lever, planche",
    exercises: [
      { id: "n1-pullups", name: "Pull ups", rest: "3'", restSec: 180, targets: { w78: "4-4-3-3", w910: "4-3-3-2", w11: "4-3-3-2-2", s12: "Test massimale" } },
      { id: "n1-dips", name: "Dips", rest: "30\"", restSec: 30, targets: { w78: "Ladder 1-3-5-7-5", w910: "Ladder 1-3-5-7-5-3", w11: "Ladder 1-3-5-7-5-3-1", s12: "Ladder 1-3-5-7-5-3-1" } },
      { id: "n1-goblet", name: "Goblet squat", rest: "1'30\" / 2'", restSec: 90, targets: { w78: "12-10-8", w910: "10-8-6", w11: "8-6-6", s12: "8-6-6" } },
      { id: "n1-affondi", name: "Affondi statici KB", rest: "—", restSec: 0, targets: { w78: "3x10 / lato", w910: "3x10 / lato", w11: "3x10 / lato", s12: "3x10 / lato" } },
      { id: "n1-fl", name: "Front lever", rest: "2'", restSec: 120, targets: { w78: "4x max", w910: "4x max", w11: "4x max", s12: "4x max" }, skill: true, section: "Skills" },
      { id: "n1-icm", name: "Ice cream maker", rest: "1'30\" / 2'", restSec: 90, targets: { w78: "3x3", w910: "3x4", w11: "4x4", s12: "4x4" }, skill: true },
      { id: "n1-bap", name: "Bent arm planche", rest: "2'", restSec: 120, targets: { w78: "3x max", w910: "3x max", w11: "3x max", s12: "3x max" }, skill: true },
      { id: "n1-chin", name: "Chin ups", rest: "EMOM", restSec: 60, targets: { w78: "EMOM 5'", w910: "EMOM 6'", w11: "EMOM 7'", s12: "EMOM 7'" } },
      { id: "n1-archer", name: "Archer push ups", rest: "1'30\"", restSec: 90, targets: { w78: "3x4", w910: "4x4", w11: "4x5", s12: "4x5" } },
      { id: "n1-lr", name: "Leg raises", rest: "1'30\"", restSec: 90, targets: { w78: "4x10", w910: "4x10", w11: "4x10", s12: "4x10" } },
      { id: "n1-hollow", name: "Hollow body", rest: "1'", restSec: 60, targets: { w78: "3x max", w910: "3x max", w11: "3x max", s12: "3x max" } }
    ]
  },
  2: {
    title: "Chin + Skills",
    focus: "Chin zavorrate, bar dips, lever, handstand",
    exercises: [
      { id: "n2-chin", name: "Chin ups alla fronte zavorrate", rest: "2'", restSec: 120, targets: { w78: "4x5", w910: "5x5", w11: "5x4", s12: "5x4" } },
      { id: "n2-bardips", name: "Bar dips", rest: "2'", restSec: 120, targets: { w78: "4x6", w910: "4x5", w11: "5x4", s12: "5x4" } },
      { id: "n2-combo", name: "Combo front lever to back", rest: "2'", restSec: 120, targets: { w78: "3x1", w910: "4x1", w11: "5x1", s12: "5x1" }, skill: true, section: "Skills" },
      { id: "n2-hs", name: "Handstand work", rest: "1'30\"", restSec: 90, targets: { w78: "Compressioni 2x10 / lato · plank to pike 3x3–4 · wall walk iso 3x20\" · verticale libera 3–4 volte", w910: "Compressioni 2x10 / lato · plank to pike 3x3–4 · wall walk iso 3x20\" · verticale libera 3–4 volte", w11: "Compressioni 2x10 / lato · plank to pike 3x3–4 · wall walk iso 3x20\" · verticale libera 3–4 volte", s12: "Compressioni 2x10 / lato · plank to pike 3x3–4 · wall walk iso 3x20\" · verticale libera 3–4 volte" }, skill: true, note: "Pausa 45\" nel wall walk. Verticale vicino al muro oppure libera assistita." },
      { id: "n2-rdl", name: "RDL KB", rest: "1'30\"", restSec: 90, targets: { w78: "3x10", w910: "4x10", w11: "4x8", s12: "4x8" } },
      { id: "n2-hip", name: "Hip thrust", rest: "1'30\"", restSec: 90, targets: { w78: "15-12-10", w910: "12-10-8", w11: "10-8-6", s12: "10-8-6" } },
      { id: "n2-tpull", name: "T-pull ups", rest: "2'", restSec: 120, targets: { w78: "3x1 / lato", w910: "3x2 / lato", w11: "4x2 / lato", s12: "4x2 / lato" } },
      { id: "n2-push", name: "Push ups zavorrate", rest: "EMOM", restSec: 60, targets: { w78: "5 min: 8 reps", w910: "6 min: 8 reps", w11: "6 min: 6 reps", s12: "6 min: 6 reps" } },
      { id: "n2-aus", name: "Australian alla sbarra", rest: "—", restSec: 0, targets: { w78: "50 in 5'", w910: "55 in 5'", w11: "60 in 5'", s12: "60 in 5'" } },
      { id: "n2-df", name: "Dragon flag + 1 negativa", rest: "1'30\"", restSec: 90, targets: { w78: "3x10\"", w910: "3x15\"", w11: "4x15\"", s12: "4x15\"" } },
      { id: "n2-abs", name: "Addominali alle parallele", rest: "1'30\"", restSec: 90, targets: { w78: "3x10", w910: "3x10", w11: "3x10", s12: "3x10" } }
    ]
  }
};

const BLOCKS = {
  a: ROUTINE,
  b: NEXT,
};

export const WEEKS = [
  { id: "w12", label: "Settimane 1–2", block: "a" },
  { id: "w34", label: "Settimane 3–4", block: "a" },
  { id: "w56", label: "Settimane 5–6", block: "a" },
  { id: "w78", label: "Settimane 7–8", block: "b" },
  { id: "w910", label: "Settimane 9–10", block: "b" },
  { id: "w11", label: "Settimana 11", block: "b" },
  { id: "s12", label: "Settimana 12", block: "b" }
];

export function routineForWeek(weekId) {
  const week = WEEKS.find((w) => w.id === weekId);
  return BLOCKS[week?.block || "a"];
}

export function findExercise(exerciseId) {
  for (const days of Object.values(BLOCKS)) {
    for (const day of Object.values(days)) {
      const found = day.exercises.find((ex) => ex.id === exerciseId);
      if (found) return found;
    }
  }
  return null;
}
