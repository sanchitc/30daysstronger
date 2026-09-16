import { useEffect, useMemo, useState } from "react";
import { loadExercises, searchExercises, MUSCLES, EQUIPMENT } from "./exercises.js";

// Search the 876-exercise database and tap one to drop it into the workout.
export default function ExercisePicker({ onPick, onClose }) {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");

  useEffect(() => {
    let alive = true;
    loadExercises().then(
      (list) => alive && setDb(list),
      () => alive && setError(true)
    );
    return () => { alive = false; };
  }, []);

  const results = useMemo(
    () => (db ? searchExercises(db, query, muscle, equipment) : []),
    [db, query, muscle, equipment]
  );

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="sheet-title">Add exercise</div>
          <button className="sheet-close" onClick={onClose}>×</button>
        </div>

        <div style={{ padding: "14px 18px 0" }}>
          <input
            className="picker-search"
            placeholder="Search 876 exercises…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="picker-filters">
            <select value={muscle} onChange={(e) => setMuscle(e.target.value)}>
              <option value="">Any muscle</option>
              {MUSCLES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={equipment} onChange={(e) => setEquipment(e.target.value)}>
              <option value="">Any equipment</option>
              {EQUIPMENT.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="sheet-body">
          {error && <p className="p-status">Couldn't load the exercise database.</p>}
          {!db && !error && <p className="p-status">Loading exercises…</p>}
          {db && results.length === 0 && <p className="p-status">Nothing matches that.</p>}

          {results.map((ex) => (
            <button
              key={ex.id}
              className="p-row"
              onClick={() => onPick({ name: ex.name, id: ex.id, reps: "10", note: null })}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="p-name">{ex.name}</span>
                <span className="p-meta" style={{ display: "block" }}>
                  {ex.equipment} · {ex.primaryMuscles.join(", ") || ex.category}
                </span>
              </span>
              <span className="p-add">+</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
